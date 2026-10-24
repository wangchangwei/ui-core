import { expect, test, type Page } from '@playwright/test';

async function signIn(page: Page, account: 'admin' | 'viewer' = 'admin') {
  await page.goto('/scenarios');
  await page.getByRole('textbox', { name: 'Email' }).fill(`${account}@example.com`);
  await page.getByLabel(/^Password/).fill('Demo123!');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/scenarios$/);
}

test('scenario catalog filters, previews, creates, imports, and protects deletes', async ({ page }) => {
  await signIn(page);
  await expect(page.getByRole('heading', { name: 'Scenario Management' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'All 18' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(12);

  await page.getByRole('button', { name: /Recruitment/ }).click();
  await page.getByRole('textbox', { name: 'Search scenarios' }).fill('Interview 2');
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Interview 2' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(page.getByRole('textbox', { name: 'Search scenarios' })).toBeFocused();
  await expect(page.getByRole('article')).toHaveCount(10);
  await page.getByRole('button', { name: 'All 18' }).click();

  await page.getByRole('button', { name: 'Graph view' }).click();
  await expect(page.getByText('Welcome and account setup')).toBeVisible();
  await page.screenshot({ path: 'artifacts/scenario-polish/1440-graph.png', fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: 'Cards view' }).click();
  const example = page.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Onboarding Template 0923' }) });
  await example.getByRole('button', { name: 'Subflows · 1' }).click();
  await expect(page.getByRole('dialog', { name: 'Onboarding Template 0923' })).toContainText('Welcome and account setup');
  await page.getByRole('button', { name: 'Close preview' }).click();

  await page.getByRole('button', { name: 'Categories', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Categories' })).toContainText('Scenarios can belong to more than one category.');
  await page.getByRole('button', { name: 'Close', exact: true }).click();

  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await page.screenshot({ path: 'artifacts/scenario-polish/1440-create.png', animations: 'disabled' });
  await page.getByRole('textbox', { name: 'Scenario name' }).fill('E2E scenario template');
  await page.getByRole('textbox', { name: 'Description' }).fill('A scenario created for the template acceptance flow.');
  await page.getByRole('textbox', { name: 'Subflows' }).pressSequentially('Prepare workspace, Welcome meeting');
  await page.getByRole('button', { name: 'Create scenario', exact: true }).click();
  const created = page.getByRole('article').filter({ has: page.getByRole('heading', { name: 'E2E scenario template', exact: true }) });
  await expect(created).toBeVisible();
  await created.getByRole('button', { name: 'E2E scenario template', exact: true }).click();
  await expect(page.getByRole('dialog').getByText('Prepare workspace', { exact: true })).toBeVisible();
  await expect(page.getByRole('dialog').getByText('Welcome meeting', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Close preview' }).click();
  await page.reload();
  const persisted = page.getByRole('article').filter({ has: page.getByRole('heading', { name: 'E2E scenario template', exact: true }) });
  await expect(persisted).toBeVisible();

  await persisted.getByRole('button', { name: 'Hide E2E scenario template' }).click();
  await expect(persisted.getByRole('button', { name: 'Show E2E scenario template' })).toBeVisible();
  await persisted.getByRole('button', { name: 'More actions for E2E scenario template' }).click();
  await page.getByRole('menuitem', { name: 'Duplicate' }).click();
  const copy = page.getByRole('article').filter({ has: page.getByRole('heading', { name: 'E2E scenario template copy', exact: true }) });
  await expect(copy).toBeVisible();

  await page.locator('#scenario-import').setInputFiles({
    name: 'scenarios.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify([{ name: 'E2E imported scenario', description: 'Imported through the scenario catalog.', categoryIds: ['beta'], subflows: ['Review'], visibility: 'visible' }])),
  });
  await expect(page.getByRole('heading', { name: 'E2E imported scenario', exact: true })).toBeVisible();
  await expect(page.getByText('Items 1 to 12 of 21')).toBeVisible();
  await page.getByRole('button', { name: 'Next page' }).click();
  await expect(page.getByText('2 / 2')).toBeVisible();
  await expect(page.getByText('Items 13 to 21 of 21')).toBeVisible();
  await page.getByRole('button', { name: 'Previous page' }).click();

  await copy.getByRole('button', { name: 'More actions for E2E scenario template copy' }).click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await page.getByRole('dialog', { name: 'Delete scenario?' }).getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'E2E scenario template copy', exact: true })).toHaveCount(0);
});

test('viewers browse scenarios but do not receive write controls', async ({ page }) => {
  await signIn(page, 'viewer');
  await expect(page.getByRole('article')).toHaveCount(12);
  await expect(page.getByRole('button', { name: 'Categories', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Import', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'More actions for Onboarding Template 0923' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Hide Onboarding Template 0923' })).toBeDisabled();
});
