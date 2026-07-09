import { describe, expect, it } from 'vitest';
import { languages, messages } from '../app/i18n';

describe('i18n dictionaries', () => {
  it('provides complete English and Simplified Chinese message dictionaries', () => {
    expect(languages).toEqual(['en', 'zh-CN']);
    expect(messages.en.toolbar.modes.editor).toBe('Editor');
    expect(messages['zh-CN'].toolbar.modes.editor).toBe('编辑');
    expect(messages.en.workspace.count(2)).toBe('2 local documents');
    expect(messages['zh-CN'].workspace.count(2)).toBe('2 个本地文档');
  });
});
