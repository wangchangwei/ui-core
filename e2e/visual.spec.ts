import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const views = [
  ['dashboard', '/dashboard'], ['users', '/users'], ['user-new', '/users/new'],
  ['user-detail', '/users/user-1'], ['user-edit', '/users/user-1/edit'],
  ['projects', '/projects'], ['project-new', '/projects/new'], ['project-detail', '/projects/project-1'],
  ['project-edit', '/projects/project-1/edit'], ['settings', '/settings'], ['profile', '/profile'],
  ['design-system', '/design-system'], ['forbidden', '/403'], ['not-found', '/missing'],
] as const;

for (const width of [1280, 1440, 1920]) {
  test(`desktop page families at ${width}px`, async ({ page }) => {
    test.setTimeout(90000);
    await mkdir('artifacts/screenshots', { recursive: true });
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto('/login');
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
    await page.screenshot({ path: `artifacts/screenshots/${width}-login.png`, fullPage: true });
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    for (const [name, route] of views) {
      await page.goto(route);
      await expect(page.locator('main h1')).toBeVisible();
      if (name !== 'design-system') await expect(page.getByRole('progressbar')).toHaveCount(0);
      if (name === 'projects') await expect(page.getByText('Website redesign', { exact: true })).toBeVisible();
      if (name === 'users') await expect(page.getByRole('grid')).toBeVisible();
      // Showcase deliberately displays a loading state on its first tab.
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: page overflow`).toBe(true);
      await page.screenshot({ path: `artifacts/screenshots/${width}-${name}.png`, fullPage: true, animations: 'disabled' });
    }
    expect(errors).toEqual([]);
  });
}

test('narrow windows show an explicit desktop requirement', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'A little more room to work.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).not.toBeVisible();
});
