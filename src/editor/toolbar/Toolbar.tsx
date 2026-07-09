import type { Editor } from '@tiptap/react';
import { Download, FileUp, Globe2, Image, List, ListOrdered, Pilcrow, Printer, Sigma, Workflow } from 'lucide-react';
import { messages, type Language } from '../../app/i18n';
import type { SaveStatus, ViewMode } from '../../app/store';

type Props = {
  editor: Editor | null;
  viewMode: ViewMode;
  documentTitle: string;
  saveStatus: SaveStatus;
  language: Language;
  onLanguageChange: (language: Language) => void;
  onModeChange: (mode: ViewMode) => void;
  onImport: (file: File) => void;
  onExportMarkdown: () => void;
  onExportHtml: () => void;
};

export function Toolbar({
  editor,
  viewMode,
  documentTitle,
  saveStatus,
  language,
  onLanguageChange,
  onModeChange,
  onImport,
  onExportMarkdown,
  onExportHtml
}: Props) {
  const t = messages[language];
  const editingDisabled = viewMode !== 'editor' || !editor;

  const addImage = () => {
    const src = window.prompt(t.toolbar.imagePrompt);
    if (src) editor?.chain().focus().setImage({ src }).run();
  };

  return (
    <header className="toolbar">
      <div className="toolbar__brand">
        <span className="toolbar__mark" aria-hidden="true">
          K
        </span>
        <div className="toolbar__document" aria-label={t.toolbar.currentDocument}>
          <span>{t.app.title}</span>
          <strong>{documentTitle}</strong>
        </div>
      </div>
      <div className="toolbar__status" data-status={saveStatus}>
        {saveStatus === 'saving' ? t.status.savingShort : saveStatus === 'error' ? t.status.saveFailed : t.status.localWorkspace}
      </div>
      <div className="toolbar__cluster toolbar__cluster--language" aria-label={t.language.label}>
        <Globe2 size={17} aria-hidden="true" />
        <div className="segmented segmented--language">
          <button
            type="button"
            className={language === 'en' ? 'is-active' : ''}
            aria-pressed={language === 'en'}
            title={t.language.english}
            onClick={() => onLanguageChange('en')}
          >
            {t.language.englishShort}
          </button>
          <button
            type="button"
            className={language === 'zh-CN' ? 'is-active' : ''}
            aria-pressed={language === 'zh-CN'}
            title={t.language.chinese}
            onClick={() => onLanguageChange('zh-CN')}
          >
            {t.language.chineseShort}
          </button>
        </div>
      </div>
      <div className="toolbar__cluster toolbar__cluster--modes">
        <div className="segmented" aria-label={t.toolbar.viewMode}>
          {(['editor', 'source', 'reader'] as const).map((mode) => (
            <button key={mode} type="button" className={viewMode === mode ? 'is-active' : ''} onClick={() => onModeChange(mode)}>
              {t.toolbar.modes[mode]}
            </button>
          ))}
        </div>
      </div>
      <div className="toolbar__cluster" aria-label={t.toolbar.editorTools}>
        <button
          type="button"
          title={t.toolbar.paragraph}
          aria-label={t.toolbar.paragraph}
          disabled={editingDisabled}
          onClick={() => editor?.chain().focus().setParagraph().run()}
        >
          <Pilcrow size={18} />
        </button>
        <button
          type="button"
          title={t.toolbar.bulletList}
          aria-label={t.toolbar.bulletList}
          disabled={editingDisabled}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List size={18} />
        </button>
        <button
          type="button"
          title={t.toolbar.orderedList}
          aria-label={t.toolbar.orderedList}
          disabled={editingDisabled}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={18} />
        </button>
        <span className="toolbar__divider" aria-hidden="true" />
        <button type="button" title={t.toolbar.imageUrl} aria-label={t.toolbar.imageUrl} disabled={editingDisabled} onClick={addImage}>
          <Image size={18} />
        </button>
        <button
          type="button"
          title={t.toolbar.mermaid}
          aria-label={t.toolbar.mermaid}
          disabled={editingDisabled}
          onClick={() => editor?.chain().focus().insertContent({ type: 'mermaid', attrs: { code: 'flowchart LR\n  A --> B' } }).run()}
        >
          <Workflow size={18} />
        </button>
        <button
          type="button"
          title={t.toolbar.displayMath}
          aria-label={t.toolbar.displayMath}
          disabled={editingDisabled}
          onClick={() => editor?.chain().focus().insertContent({ type: 'mathBlock', attrs: { code: 'E = mc^2' } }).run()}
        >
          <Sigma size={18} />
        </button>
      </div>
      <div className="toolbar__cluster" aria-label={t.toolbar.fileActions}>
        <label className="icon-file" title={t.toolbar.importMarkdown} aria-label={t.toolbar.importMarkdown}>
          <FileUp size={18} />
          <input
            type="file"
            accept=".md,.markdown,text/markdown,text/plain"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) onImport(file);
              event.currentTarget.value = '';
            }}
          />
        </label>
        <button type="button" title={t.toolbar.exportMarkdown} aria-label={t.toolbar.exportMarkdown} onClick={onExportMarkdown}>
          <Download size={18} />
        </button>
        <button type="button" title={t.toolbar.printOrExport} aria-label={t.toolbar.printOrExport} onClick={onExportHtml}>
          <Printer size={18} />
        </button>
      </div>
    </header>
  );
}
