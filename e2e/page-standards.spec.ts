import { expect, test, type Page } from '@playwright/test';

const pages = [
  ['table-list', 'Resource library', 'Table list example'],
  ['detail', 'Campaign launch', 'Detail example'],
  ['card-list', 'Resource templates', 'Card list example'],
  ['form', 'New resource', 'Form example'],
] as const;
async function login(page: Page, path = '/page-standards/table-list', role = 'admin') {
  await page.goto(path);
  await page.getByRole('textbox', { name: 'Email' }).fill(`${role}@example.com`);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.locator('main h1')).toBeVisible();
}

test('four standards have independent navigation, titles and refreshable routes', async ({ page }) => {
  await login(page);
  for (const [path, title, link] of pages) {
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: link, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/page-standards/${path}$`));
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await expect(page.getByRole('tablist')).toHaveCount(0);
    await expect(page.getByRole('link', { name: link, exact: true })).toHaveAttribute('aria-current', 'page');
    await page.reload();
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  }
  await page.goto('/page-standards?pattern=card-list');
  await expect(page).toHaveURL(/\/page-standards\/card-list$/);
});

test('table example supports category hierarchy, tags, search and recovery', async ({ page }) => {
  await login(page);
  const example = page.getByTestId('page-anatomy');
  await expect(example.getByRole('grid')).toBeVisible();
  await expect(example.getByRole('status')).toHaveText('32 resources');
  await example.getByRole('group', { name: 'Primary category' }).getByRole('button', { name: 'Marketing 16', exact: true }).click();
  const secondary = example.getByRole('group', { name: 'Secondary category' });
  await secondary.getByRole('button', { name: 'Campaigns 8', exact: true }).click();
  await expect(example.getByRole('status')).toHaveText('8 resources');
  await example.getByRole('combobox', { name: 'Tag', exact: true }).click();
  await page.getByRole('option', { name: 'Enterprise', exact: true }).click();
  await expect(example.getByRole('status')).toHaveText('3 resources');
  await example.getByRole('textbox', { name: 'Search resources' }).fill('does not exist');
  await expect(example.getByText('No results found', { exact: true })).toBeVisible();
  await example.getByRole('button', { name: 'Clear search', exact: true }).click();
  await expect(example.getByRole('textbox', { name: 'Search resources' })).toBeFocused();
  await expect(example.getByRole('status')).toHaveText('3 resources');
  await example.getByRole('group', { name: 'Primary category' }).getByRole('button', { name: 'Product 16', exact: true }).click();
  await expect(example.getByRole('group', { name: 'Secondary category' })).toContainText('Research');
  await expect(example.getByRole('group', { name: 'Secondary category' })).not.toContainText('Campaigns');
  await example.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await expect(example.getByRole('status')).toHaveText('32 resources');
});

test('table example sorts, paginates, confirms deletion, creates and resets isolated records', async ({ page }) => {
  await login(page);
  const example = page.getByTestId('page-anatomy');
  await example.getByRole('columnheader', { name: 'Name', exact: true }).click();
  await expect(example.getByRole('columnheader', { name: /^Name/ })).toHaveAttribute('aria-sort', 'ascending');
  await example.getByRole('button', { name: 'Go to next page' }).click();
  await expect(example.getByText('26–32 of 32', { exact: true })).toBeVisible();
  await example.getByRole('textbox', { name: 'Search resources' }).fill('Campaign launch');
  await expect(example.getByText('1–8 of 8', { exact: true })).toBeVisible();
  const row = example.getByRole('row').filter({ has: page.getByRole('gridcell', { name: 'Campaign launch', exact: true }) });
  await row.getByRole('checkbox').check();
  await example.getByRole('button', { name: 'Delete selected', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(row).toBeVisible();
  await example.getByRole('button', { name: 'Delete selected', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(example.getByRole('status')).toHaveText('7 resources');
  await example.getByRole('button', { name: 'Create resource', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Create resource' });
  await dialog.getByRole('button', { name: 'Create resource', exact: true }).click();
  await expect(dialog.getByText('Enter a resource name.')).toBeVisible();
  await dialog.getByRole('textbox', { name: 'Resource name' }).fill('Example creation');
  await dialog.getByRole('button', { name: 'Create resource', exact: true }).dblclick();
  await expect(dialog).toHaveCount(0);
  await example.getByRole('textbox', { name: 'Search resources' }).fill('Example creation');
  await expect(example.getByRole('status')).toHaveText('1 resource');
  await example.getByRole('button', { name: 'View Example creation', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Example creation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.reload();
  await expect(example.getByRole('status')).toHaveText('32 resources');
});

test('all four examples show only the page itself for Viewer', async ({ page }) => {
  await login(page, '/page-standards/table-list', 'viewer');
  for (const [path, title] of pages) {
    await page.goto(`/page-standards/${path}`);
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    for (const text of ['Page anatomy', 'Use this pattern when', 'Required building blocks', 'Interaction contract', 'States to implement', 'Shared foundation', 'Working rules'])
      await expect(page.getByRole('heading', { name: text, exact: true })).toHaveCount(0);
    await expect(page.locator('main [role="img"]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /View .* example/ })).toHaveCount(0);
  }
});

test('card example filters and opens a real detail page', async ({ page }) => {
  await login(page, '/page-standards/card-list');
  await expect(page.getByRole('article')).toHaveCount(12);
  await page.getByRole('textbox', { name: 'Search resources' }).fill('Customer research');
  await expect(page.getByRole('article')).toHaveCount(8);
  const card = page.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Customer research', exact: true }) });
  await card.getByRole('link', { name: 'View details' }).click();
  await expect(page.getByRole('heading', { name: 'Customer research', exact: true })).toBeVisible();
  await expect(page.locator('dl > div > dt')).toHaveCount(5);
  await expect(page.getByRole('heading', { name: 'Related resources', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Edit resource', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue('Customer research');
});

test('form example validates, protects changes, and saves without duplicate submission', async ({ page }) => {
  await login(page, '/page-standards/form');
  const save = page.getByRole('button', { name: 'Save resource', exact: true });
  await expect(save).toBeDisabled();
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(' ');
  await save.click();
  await expect(page.getByText('Enter a resource name.', { exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Delivery handoff');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Unsaved changes' })).toBeVisible();
  await page.getByRole('button', { name: 'Keep editing', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue('Delivery handoff');
  await save.dblclick();
  await expect(page.getByRole('alert')).toContainText('Resource saved');
  await expect(save).toBeDisabled();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page).toHaveURL(/\/page-standards\/card-list$/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

for (const width of [1280, 1461, 1920]) {
  test(`separate standards remain usable in a ${width} by 630 window`, async ({ page }) => {
    await page.setViewportSize({ width, height: 630 });
    await login(page);
    for (const [path, title, link] of pages) {
      const nav = page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: link, exact: true });
      await nav.click();
      await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(page.locator('main h1')).toHaveCSS('font-size', '32px');
      await page.screenshot({ path: `artifacts/page-examples-clean/${width}-${path}.png`, fullPage: true });
    }
  });
}
