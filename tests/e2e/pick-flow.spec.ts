import { test, expect } from '@playwright/test';

test.describe('Pick Flow', () => {
  test('should display main page with all sections', async ({ page }) => {
    await page.goto('/');

    // Header
    await expect(page.getByText('오늘의 픽')).toBeVisible();

    // Location section
    await expect(page.getByText('위치 설정')).toBeVisible();

    // Category section
    await expect(page.getByText('카테고리 선택')).toBeVisible();

    // Pick button should exist
    await expect(page.getByRole('button', { name: /오늘의 픽/ })).toBeVisible();
  });

  test('should show category chips', async ({ page }) => {
    await page.goto('/');

    // Check all 8 categories are visible
    const categories = ['한식', '중식', '일식', '양식', '분식', '카페', '패스트푸드', '야식'];
    for (const cat of categories) {
      await expect(page.getByText(cat)).toBeVisible();
    }
  });

  test('pick button should be disabled without location', async ({ page }) => {
    await page.goto('/');

    const pickButton = page.getByRole('button', { name: /오늘의 픽/ });
    await expect(pickButton).toBeDisabled();
  });

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveTitle(/오늘의 픽/);
  });

  test('should navigate to faq page', async ({ page }) => {
    await page.goto('/faq');
    await expect(page).toHaveTitle(/오늘의 픽/);
  });
});
