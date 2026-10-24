import { expect, test, type Page } from '@playwright/test';

// Headless Chromium hides viewport scrollbars and cannot reproduce desktop compensation.
test.use({ launchOptions: { headless: false, args: ['--disable-features=OverlayScrollbar,OverlayScrollbars,FluentOverlayScrollbar'] } });

type Geometry = { main: number; mainX: number; header: number; sidebar: number };
async function geometry(page: Page): Promise<Geometry> {
  return page.evaluate(() => {
    const main = document.querySelector('main')!.getBoundingClientRect();
    return { main: main.width, mainX: main.x, header: document.querySelector('main')!.parentElement!.querySelector('header')!.getBoundingClientRect().width,
      sidebar: document.querySelector('aside')!.getBoundingClientRect().width };
  });
}
async function expectStable(page: Page, baseline: Geometry) {
  // Sample the transition itself, not just its settled result.
  const frames = await page.evaluate(async () => {
    const widths: number[] = [];
    for (let index = 0; index < 20; index++) {
      await new Promise(requestAnimationFrame);
      widths.push(document.querySelector('main')!.getBoundingClientRect().width);
    }
    return widths;
  });
  expect(Math.max(...frames) - Math.min(...frames)).toBeLessThan(1);
  expect(frames.every(width => Math.abs(width - baseline.main) < 1)).toBe(true);
  expect(await geometry(page)).toEqual(baseline);
}
async function login(page: Page, path: string) {
  await page.setViewportSize({ width: 1461, height: 630 });
  await page.goto(path);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.locator('main h1')).toBeVisible();
  // A deterministic classic scrollbar, independent of the host's macOS preference.
  await page.addStyleTag({ content: '::-webkit-scrollbar { width: 16px; height: 16px; }' });
  await page.evaluate(() => document.fonts.ready);
}

test('table controls and nested dialogs keep workspace width and scroll locking stable', async ({ page }) => {
  await login(page, '/page-standards/table-list');
  await expect(page.getByRole('grid')).toBeVisible();
  const baseline = await geometry(page);
  await page.getByRole('group', { name: 'Primary category' }).getByRole('button', { name: 'Marketing 16', exact: true }).click();
  await expectStable(page, baseline);
  await page.getByRole('combobox', { name: 'Tag', exact: true }).click();
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(page.locator('html')).toHaveCSS('overflow-y', 'hidden');
  await expectStable(page, baseline);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(page.locator('html')).toHaveCSS('overflow-y', 'scroll');
  await expectStable(page, baseline);

  const create = page.getByRole('button', { name: 'Create resource', exact: true });
  await create.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expectStable(page, baseline);
  await page.getByRole('dialog').getByRole('combobox', { name: 'Category', exact: true }).click();
  await expect(page.getByRole('listbox')).toBeVisible();
  await expectStable(page, baseline);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(page.locator('html')).toHaveCSS('overflow-y', 'hidden');
  await expectStable(page, baseline);
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(create).toBeFocused();
  await expect(page.locator('html')).toHaveCSS('overflow-y', 'scroll');
  await expectStable(page, baseline);
});

test('short-page menus and page navigation keep the same workspace width', async ({ page }) => {
  await login(page, '/page-standards/detail');
  await expect(page.getByRole('heading', { name: 'Campaign launch', exact: true })).toBeVisible();
  const baseline = await geometry(page);
  const account = page.getByRole('button', { name: 'Account menu', exact: true });
  await account.click();
  await expect(page.getByRole('menu')).toBeVisible();
  await expectStable(page, baseline);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toHaveCount(0);
  await expect(account).toBeFocused();
  await expectStable(page, baseline);
  await page.getByRole('navigation').getByRole('link', { name: 'Form example', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Name', exact: true })).toBeVisible();
  await expectStable(page, baseline);
  await page.getByRole('combobox', { name: 'Status', exact: true }).click();
  await expect(page.getByRole('listbox')).toBeVisible();
  await expectStable(page, baseline);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expectStable(page, baseline);
});
