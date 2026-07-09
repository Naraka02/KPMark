import { expect, test } from '@playwright/test';

test('core editor, source, rich block, and reader flow', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Editor' })).toBeVisible();
  await expect(page.getByLabel('Workspace documents')).toBeVisible();

  await page.locator('.ProseMirror').click();
  await page.keyboard.type(' Added text.');

  await page.getByRole('button', { name: 'Markdown', exact: true }).click();
  await expect(page.getByLabel('Markdown source editor').locator('textarea')).toContainText('Added text');

  await page.getByRole('button', { name: 'Editor' }).click();
  await page.getByRole('button', { name: 'Mermaid' }).click();
  await page.getByRole('button', { name: 'Display math' }).click();

  await page.getByRole('button', { name: 'Reader' }).click();
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

  await page.getByRole('button', { name: /Rename Untitled document/ }).click();
  await page.getByRole('textbox', { name: /New title for Untitled document/ }).fill('Workspace Draft');
  await page.getByRole('button', { name: 'Save title' }).click();
  await expect(page.getByLabel('Current document')).toContainText('Workspace Draft');

  await page.locator('.ProseMirror').click();
  await page.keyboard.type(' Persistent workspace text.');
  await page.getByRole('button', { name: 'Markdown', exact: true }).click();
  await expect(page.getByLabel('Markdown source editor').locator('textarea')).toContainText('Persistent workspace text');

  await page.getByRole('button', { name: 'Editor' }).click();
  await page.getByRole('button', { name: /Duplicate Workspace Draft/ }).click();
  await expect(page.getByLabel('Current document')).toContainText('Workspace Draft copy');

  await page.getByRole('button', { name: /Delete Workspace Draft copy/ }).click();
  const deleteDialog = page.getByRole('dialog', { name: 'Delete document?' });
  await expect(deleteDialog).toBeVisible();
  await deleteDialog.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByLabel('Current document')).toContainText('Workspace Draft');

  await page.getByRole('button', { name: 'New document' }).click();
  await page.getByRole('button', { name: 'Open Workspace Draft' }).click();
  await page.getByRole('button', { name: 'Markdown', exact: true }).click();
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
  await page.getByRole('button', { name: 'Markdown', exact: true }).click();
  await expect(page.getByLabel('Markdown source editor').locator('textarea')).toContainText('Imported body');
});

test('language switching localizes chrome, persists, and preserves document content', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const initialMarkdown = await page.locator('.ProseMirror').innerText();
  await page.getByRole('button', { name: '中文' }).click();
  await expect(page.getByRole('button', { name: '编辑' })).toBeVisible();
  await expect(page.getByLabel('工作区文档')).toBeVisible();
  await expect(page.getByLabel('界面语言')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');

  await page.getByRole('button', { name: '源码' }).click();
  await expect(page.getByLabel('Markdown 源码编辑器').locator('textarea')).toContainText('Markdown Typography Studio');
  const markdownInChineseUi = await page.getByLabel('Markdown 源码编辑器').locator('textarea').inputValue();
  expect(markdownInChineseUi).toContain('Write Markdown');

  await page.reload();
  await expect(page.getByRole('button', { name: '编辑' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await page.getByRole('button', { name: '阅读' }).click();
  await expect(page.getByRole('heading', { name: '阅读设置' })).toBeVisible();
  await expect(page.getByLabel('高级排版')).toBeVisible();
  await expect(page.getByLabel('主题')).toBeVisible();

  await page.getByRole('button', { name: 'EN' }).click();
  await expect(page.getByRole('button', { name: 'Editor' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(initialMarkdown).toContain('Markdown Typography Studio');
});

test('localized workspace CRUD works in Chinese UI', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/');
  await page.getByRole('button', { name: '中文' }).click();

  await page.getByRole('button', { name: '新建文档' }).click();
  await expect(page.getByLabel('当前文档')).toContainText('未命名文档');
  await page.getByRole('button', { name: /重命名 未命名文档/ }).click();
  await page.getByRole('textbox', { name: /未命名文档 的新标题/ }).fill('中文草稿');
  await page.getByRole('button', { name: '保存标题' }).click();
  await expect(page.getByLabel('当前文档')).toContainText('中文草稿');

  await page.getByRole('button', { name: /复制 中文草稿/ }).click();
  await expect(page.getByLabel('当前文档')).toContainText('中文草稿 副本');
  await page.getByRole('button', { name: /删除 中文草稿 副本/ }).click();
  const deleteDialog = page.getByRole('dialog', { name: '删除文档？' });
  await expect(deleteDialog).toBeVisible();
  await deleteDialog.getByRole('button', { name: '删除' }).click();
  await expect(page.getByLabel('当前文档')).toContainText('中文草稿');
});

test('desktop and mobile layouts keep core controls visible without horizontal overflow in both languages', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.getByLabel('Current document')).toBeVisible();
  await expect(page.getByLabel('Workspace documents')).toBeVisible();
  await expect(page.getByLabel('Editor tools')).toBeVisible();
  await expect(page.getByLabel('Interface language')).toBeVisible();
  await expect(page.locator('.ProseMirror')).toBeVisible();
  await expect(page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).resolves.toBe(true);

  await page.getByRole('button', { name: '中文' }).click();
  await expect(page.getByLabel('当前文档')).toBeVisible();
  await expect(page.getByLabel('工作区文档')).toBeVisible();
  await expect(page.getByLabel('编辑工具')).toBeVisible();
  await expect(page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).resolves.toBe(true);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByLabel('当前文档')).toBeVisible();
  await expect(page.getByRole('button', { name: '阅读' })).toBeVisible();
  await page.getByRole('button', { name: '阅读' }).click();
  await expect(page.getByRole('heading', { name: '阅读设置' })).toBeVisible();
  await expect(page.locator('.reader-page')).toBeVisible();
  await expect(page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).resolves.toBe(true);
});
