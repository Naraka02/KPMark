import { expect, test } from '@playwright/test';

test('core editor, source, rich block, and reader flow', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'editor' })).toBeVisible();

  await page.locator('.ProseMirror').click();
  await page.keyboard.type(' Added text.');

  await page.getByRole('button', { name: 'source' }).click();
  await expect(page.getByLabel('Markdown source editor').locator('textarea')).toContainText('Added text');

  await page.getByRole('button', { name: 'editor' }).click();
  await page.getByTitle('Mermaid').click();
  await page.getByTitle('Display math').click();

  await page.getByRole('button', { name: 'reader' }).click();
  await expect(page.getByLabel('Advanced typography')).toBeVisible();
  await page.getByLabel('Advanced typography').uncheck();
  await page.getByLabel('Advanced typography').check();
  await page.getByLabel('Theme').selectOption('night');
  await expect(page.locator('.reader-page')).toBeVisible();
});
