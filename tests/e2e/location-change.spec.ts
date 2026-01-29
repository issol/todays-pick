import { test, expect } from '@playwright/test';

test.describe('Location Change', () => {
  test('should show location bar', async ({ page }) => {
    await page.goto('/');

    // Location bar should be visible
    await expect(page.getByText('위치 설정')).toBeVisible();
  });

  test('should show radius selector options', async ({ page }) => {
    await page.goto('/');

    // Check radius options exist
    await expect(page.getByText('500m')).toBeVisible();
    await expect(page.getByText('1km')).toBeVisible();
    await expect(page.getByText('2km')).toBeVisible();
  });
});
