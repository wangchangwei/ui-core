import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

async function login(page: Page, role = 'admin', destination = '/dashboard') {
  await page.goto(destination);
  await page.getByRole('textbox', { name: 'Email' }).fill(`${role}@example.com`);
  await page.getByLabel(/^Password/).fill('Demo123!');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${destination}$`));
}

test('login returns to the requested page and viewer deep links are denied', async ({ page }) => {
  await login(page, 'viewer', '/projects');
  await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
  await expect(page.getByText('Website redesign', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /new project|add project/i })).toHaveCount(0);
  await page.goto('/users');
  await expect(page.getByRole('heading', { name: 'Access restricted' })).toBeVisible();
});

test('user creation survives refresh, editing and deletion', async ({ page }) => {
  await login(page, 'admin', '/users/new');
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Avery Test');
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('avery.test@example.com');
  await page.getByRole('button', { name: /create user/i }).click();
  await expect(page.getByRole('heading', { name: 'Avery Test', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator('main').getByText('avery.test@example.com', { exact: true }).first()).toBeVisible();
  await page.getByRole('link', { name: /edit/i }).click();
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Avery Updated');
  await page.getByRole('button', { name: /save changes/i }).click();
  await expect(page.getByRole('heading', { name: 'Avery Updated', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: /delete/i }).click();
  await expect(page).toHaveURL(/\/users$/);
  await page.getByRole('textbox', { name: /search/i }).fill('avery.test@example.com');
  await expect(page.getByText(/no (users|results)/i)).toBeVisible();
});

test('project dates validate and project CRUD stays consistent across pages', async ({ page }) => {
  await login(page, 'admin', '/projects/new');
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('E2E delivery project');
  await page.getByRole('textbox', { name: 'Description' }).fill('A project created through the standard form.');
  await page.getByRole('combobox', { name: 'Owner' }).click();
  await page.getByRole('option', { name: 'Alex Morgan', exact: true }).click();
  await page.getByLabel(/^Start date/).fill('2026-06-01');
  await page.getByLabel(/^End date/).fill('2026-05-01');
  await page.getByRole('button', { name: 'Create project', exact: true }).click();
  await expect(page.getByText('End date must be on or after start date')).toBeVisible();
  await page.getByLabel(/^End date/).fill('2026-07-01');
  await page.getByRole('button', { name: 'Create project', exact: true }).dblclick();
  await expect(page.getByRole('heading', { name: 'E2E delivery project', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'E2E delivery project', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Edit', exact: true }).click();
  await page.getByRole('textbox', { name: 'Description' }).fill('Updated delivery plan.');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByText('Updated delivery plan.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await page.getByRole('textbox', { name: 'Search projects' }).fill('E2E delivery project');
  await expect(page.getByText('No projects found', { exact: true })).toBeVisible();
});

test('page size settings, profile changes, and reset have visible effects', async ({ page }) => {
  await login(page, 'admin', '/settings');
  await page.getByRole('combobox', { name: 'Default page size' }).click();
  await page.getByRole('option', { name: '50 rows' }).click();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  await page.getByRole('link', { name: 'Users', exact: true }).click();
  await expect(page.getByText('1–50 of 64')).toBeVisible();
  await page.getByRole('button', { name: 'Go to next page' }).click();
  await expect(page.getByText('51–64 of 64')).toBeVisible();
  await page.getByRole('textbox', { name: 'Search users' }).fill('user1@example.com');
  await expect(page.getByText('1–1 of 1')).toBeVisible();
  await page.goto('/profile');
  await page.getByRole('textbox', { name: /^Display name/ }).fill('Morgan Admin');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('button', { name: 'Account menu' })).toContainText('Morgan Admin');
  await page.goto('/settings');
  await page.getByRole('textbox', { name: /Application name/ }).fill('Unsaved name before reset');
  await page.getByRole('button', { name: 'Reset demo data', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Reset demo data', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Account menu' })).toContainText('Alex Morgan');
});

test('shared state examples retry and dialogs restore keyboard focus', async ({ page }) => {
  await mkdir('artifacts/screenshots', { recursive: true });
  await login(page, 'admin', '/design-system');
  await page.getByRole('tab', { name: 'Error', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText("We couldn't load projects");
  await page.screenshot({ path: 'artifacts/screenshots/1440-state-error.png', fullPage: true });
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByRole('tabpanel', { name: 'Content', exact: true })).toContainText('Projects loaded successfully');
  const opener = page.getByRole('button', { name: 'Open confirmation', exact: true });
  await opener.hover();
  await page.screenshot({ path: 'artifacts/screenshots/1440-controls-hover.png' });
  await opener.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  await page.screenshot({ path: 'artifacts/screenshots/1440-confirmation.png' });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('table selection protects referenced users and deletes unassigned users', async ({ page }) => {
  await login(page, 'admin', '/users');
  await page.getByRole('columnheader', { name: 'Name', exact: true }).click();
  await expect(page.getByRole('columnheader', { name: /^Name/ })).toHaveAttribute('aria-sort', 'ascending');
  await page.getByRole('textbox', { name: 'Search users' }).fill('user1@example.com');
  await page.getByRole('row').filter({ hasText: 'user1@example.com' }).getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Delete selected (1)', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Cannot delete a user referenced by a project');
  await expect(page.getByRole('row').filter({ hasText: 'user1@example.com' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Search users' }).fill('user64@example.com');
  await page.getByRole('row').filter({ hasText: 'user64@example.com' }).getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Delete selected (1)', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByText('No results found', { exact: true })).toBeVisible();
});

test('form cancellation protects unsaved changes and settings affect the shell', async ({ page }) => {
  await login(page, 'admin', '/projects/new');
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Unsaved project');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('dialog', { name: /unsaved changes/i })).toBeVisible();
  await page.getByRole('button', { name: /keep editing/i }).click();
  await expect(page.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue('Unsaved project');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: /discard changes/i }).click();
  await page.goto('/settings');
  await page.getByRole('textbox', { name: /application name/i }).fill('Acme workspace');
  await page.getByRole('button', { name: /save/i }).click();
  await expect(page.locator('aside')).toContainText('Acme workspace');
  await page.reload();
  await expect(page.locator('aside')).toContainText('Acme workspace');
});
