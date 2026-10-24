import { expect, test, type Page } from '@playwright/test';

async function login(page: Page, path: string) {
  await page.goto(path);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.locator('main h1')).toBeVisible();
}

test('invalid focused fields retain error semantics', async ({ page }) => {
  await login(page, '/page-standards/form');
  const name = page.getByRole('textbox', { name: 'Name', exact: true });
  await name.fill(' ');
  await page.getByRole('button', { name: 'Save resource', exact: true }).click();
  await expect(name).toBeFocused();
  const field = page.locator('.MuiFormControl-root').filter({ has: name });
  await expect(field.locator('label')).toHaveCSS('color', 'rgb(197, 0, 0)');
  await expect(field.locator('fieldset')).toHaveCSS('border-color', 'rgb(197, 0, 0)');
});

test('resource table uses source spacing and semantic status surfaces', async ({ page }) => {
  await login(page, '/page-standards/table-list');
  const grid = page.getByRole('grid');
  await expect(grid).toBeVisible();
  await expect(grid.getByRole('columnheader').nth(1)).toHaveCSS('padding-left', '16px');
  await expect(grid.getByRole('gridcell').first()).toHaveCSS('padding-left', '16px');
  const active = grid.locator('.MuiChip-root').filter({ hasText: 'Active' }).first();
  await expect(active).toHaveCSS('background-color', 'rgb(211, 229, 255)');
  await expect(active).toHaveCSS('color', 'rgb(7, 97, 209)');
  const pagination = page.getByRole('combobox', { name: /rows per page/i });
  await expect(pagination).toHaveCSS('font-size', '14px');
  await expect(pagination).toHaveCSS('padding-right', '32px');
  const input = pagination.locator('..');
  await expect(input).toHaveCSS('height', '40px');
  const actionSpace = await grid.locator('[role="row"][data-id]').first().locator('[data-field="actions"]').evaluate(cell => {
    const contentEnd = cell.getBoundingClientRect().right - parseFloat(getComputedStyle(cell).paddingRight);
    const buttons = cell.querySelectorAll('button');
    return contentEnd - buttons[buttons.length - 1].getBoundingClientRect().right;
  });
  expect(actionSpace).toBeGreaterThanOrEqual(0);
});

test('categories preserve selected styling and readable paths', async ({ page }) => {
  await login(page, '/page-standards/table-list');
  const marketing = page.getByRole('group', { name: 'Primary category' }).getByRole('button', { name: 'Marketing 16', exact: true });
  await marketing.click();
  await expect(marketing).toHaveAttribute('aria-pressed', 'true');
  await expect(marketing).toHaveCSS('border-radius', '64px');
  await expect(marketing).toHaveCSS('padding-left', '16px');
  await expect(marketing).toHaveCSS('background-color', 'rgb(77, 77, 77)');
  await page.mouse.move(0, 0);
  await expect(marketing).toHaveCSS('background-color', 'rgb(23, 23, 23)');
  await page.getByRole('button', { name: 'View Campaign launch', exact: true }).click();
  await expect(page.getByRole('dialog').getByText('Marketing / Campaigns', { exact: true })).toBeVisible();
});

test('cards constrain long content without losing the full accessible title', async ({ page }) => {
  await login(page, '/page-standards/card-list');
  const card = page.getByRole('article').first();
  await expect(card).toBeVisible();
  await card.locator('h2').evaluate(el => { el.textContent = 'Long resource title '.repeat(6); });
  // Exercise legal-length content against the actual rendered component styles.
  await card.locator('h2 + p').evaluate(el => { el.textContent = 'Long description content '.repeat(20); });
  expect(await card.locator('h2').evaluate(el => el.getBoundingClientRect().height)).toBeLessThanOrEqual(56);
  expect(await card.locator('h2 + p').evaluate(el => el.getBoundingClientRect().height)).toBeLessThanOrEqual(60);
  await expect(card.getByRole('link', { name: 'View details' })).toHaveCSS('font-size', '14px');
  await expect(card.getByRole('link', { name: 'View details' })).toHaveCSS('min-height', '40px');
  await expect(card.getByText('Marketing / Campaigns', { exact: true })).toBeVisible();
});

test('missing details offer navigation rather than retrying a missing record', async ({ page }) => {
  await login(page, '/page-standards/detail?id=missing-resource');
  await expect(page.getByText('Resource not found', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry', exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: /back to resources/i }).click();
  await expect(page).toHaveURL(/\/page-standards\/card-list$/);
});

test('card no-results state offers a working local clear action', async ({ page }) => {
  await login(page, '/page-standards/card-list');
  await page.getByRole('textbox', { name: 'Search resources' }).fill('no-matching-resource');
  const heading = page.getByRole('heading', { name: 'No resources match these filters', exact: true });
  await expect(heading).toBeVisible();
  await heading.locator('..').getByRole('button', { name: 'Clear filters', exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(12);
  await expect(page.getByRole('textbox', { name: 'Search resources' })).toHaveValue('');
});
