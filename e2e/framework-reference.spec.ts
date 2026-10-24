import { expect, test } from '@playwright/test';

test('framework reference delivers contracts and connects working page patterns', async ({ page }) => {
  await page.goto('/design-system');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Build with UI Core' })).toBeVisible();

  for (const [name, title] of [
    ['Component contracts', '# UI Core 组件契约'],
    ['Project adoption guide', '# 在其他项目中采用 UI Core'],
  ]) {
    const link = page.getByRole('link', { name, exact: true });
    await expect(link).toHaveAttribute('download', /\.md$/);
    const url = await link.getAttribute('href');
    expect(url).toBeTruthy();
    const response = await page.request.get(url!);
    expect(response.ok()).toBe(true);
    expect(await response.text()).toContain(title);
  }

  await page.getByRole('link', { name: 'Browse component inventory' }).click();
  await expect(page.getByRole('table', { name: 'UI Core component contracts' })).toBeVisible();
  const grid = page.getByRole('grid');
  await grid.getByRole('checkbox', { name: 'Select all rows' }).check();
  await expect(grid.getByRole('checkbox', { name: 'Unselect all rows' })).toBeChecked();
  await grid.getByRole('columnheader', { name: 'Name', exact: true }).click();
  await expect(grid.getByRole('columnheader', { name: /^Name/ })).toHaveAttribute('aria-sort', 'ascending');

  for (const [name, heading] of [
    ['Table list pattern', 'Resource library'],
    ['Card list pattern', 'Resource templates'],
    ['Detail pattern', 'Campaign launch'],
    ['Form pattern', 'New resource'],
  ]) {
    await page.goto('/design-system');
    await page.getByRole('navigation', { name: 'Page pattern references' }).getByRole('link', { name, exact: true }).click();
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }
});
