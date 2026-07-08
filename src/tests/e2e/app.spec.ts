import { expect, test } from '@playwright/test';

test('core editor, source, rich block, and reader flow', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'editor' })).toBeVisible();
  await expect(page.getByLabel('Workspace documents')).toBeVisible();

  await page.locator('.ProseMirror').click();
  await page.keyboard.type(' Added text.');

  await page.getByRole('button', { name: 'source' }).click();
  await expect(page.getByLabel('Markdown source editor').locator('textarea')).toContainText('Added text');

  await page.getByRole('button', { name: 'editor' }).click();
  await page.getByRole('button', { name: 'Mermaid' }).click();
  await page.getByRole('button', { name: 'Display math' }).click();

  await page.getByRole('button', { name: 'reader' }).click();
  await expect(page.getByLabel('Advanced typography')).toBeVisible();
  await page.getByLabel('Advanced typography').uncheck();
  await page.getByLabel('Advanced typography').check();
  await page.getByLabel('Theme').selectOption('night');
  await expect(page.locator('.reader-page')).toBeVisible();
});

test('workspace document CRUD and document switching preserve content', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/');

  await page.getByRole('button', { name: 'New document' }).click();
  await expect(page.getByLabel('Current document')).toContainText('Untitled document');

  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('prompt');
    await dialog.accept('Workspace Draft');
  });
  await page.getByRole('button', { name: /Rename Untitled document/ }).click();
  await expect(page.getByLabel('Current document')).toContainText('Workspace Draft');

  await page.locator('.ProseMirror').click();
  await page.keyboard.type(' Persistent workspace text.');
  await page.getByRole('button', { name: 'source' }).click();
  await expect(page.getByLabel('Markdown source editor').locator('textarea')).toContainText('Persistent workspace text');

  await page.getByRole('button', { name: 'editor' }).click();
  await page.getByRole('button', { name: /Duplicate Workspace Draft/ }).click();
  await expect(page.getByLabel('Current document')).toContainText('Workspace Draft copy');

  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm');
    await dialog.accept();
  });
  await page.getByRole('button', { name: /Delete Workspace Draft copy/ }).click();
  await expect(page.getByLabel('Current document')).toContainText('Workspace Draft');

  await page.getByRole('button', { name: 'New document' }).click();
  await page.getByRole('button', { name: 'Open Workspace Draft' }).click();
  await page.getByRole('button', { name: 'source' }).click();
  await expect(page.getByLabel('Markdown source editor').locator('textarea')).toContainText('Persistent workspace text');
});

test('imports markdown as a new workspace document', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/');

  await page.locator('input[type="file"]').setInputFiles({
    name: 'imported-notes.md',
    mimeType: 'text/markdown',
    buffer: Buffer.from('# Imported Heading\n\nImported body')
  });

  await expect(page.getByLabel('Current document')).toContainText('imported notes');
  await page.getByRole('button', { name: 'source' }).click();
  await expect(page.getByLabel('Markdown source editor').locator('textarea')).toContainText('Imported body');
});
