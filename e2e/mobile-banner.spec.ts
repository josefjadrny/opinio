import { test, expect } from '@playwright/test';

test('mobile: logo fully visible, filters hidden', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');

  await page.screenshot({ path: '/tmp/mobile-banner.png' });

  // Logo must be visible
  const logo = page.locator('h1').filter({ hasText: 'Opinio' });
  await expect(logo).toBeVisible();

  // Logo must not be clipped (x >= 0 and right edge within viewport)
  const box = await logo.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);

  // Country and role selects must be hidden on mobile
  const selects = page.locator('select');
  for (const sel of await selects.all()) {
    await expect(sel).toBeHidden();
  }
});
