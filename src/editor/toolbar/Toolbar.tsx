import type { Editor } from '@tiptap/react';
import { Download, FileUp, Image, List, ListOrdered, Pilcrow, Printer, Sigma, Workflow } from 'lucide-react';
import type { SaveStatus, ViewMode } from '../../app/store';

type Props = {
  editor: Editor | null;
  viewMode: ViewMode;
  documentTitle: string;
  saveStatus: SaveStatus;
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
  onModeChange,
  onImport,
  onExportMarkdown,
  onExportHtml
}: Props) {
  const editingDisabled = viewMode !== 'editor' || !editor;

  const addImage = () => {
    const src = window.prompt('Image URL');
    if (src) editor?.chain().focus().setImage({ src }).run();
  };

  return (
    <header className="toolbar">
      <div className="toolbar__document" aria-label="Current document">
        <strong>{documentTitle}</strong>
        <span>{saveStatus === 'saving' ? 'Saving' : saveStatus === 'error' ? 'Save failed' : 'Local workspace'}</span>
      </div>
      <div className="segmented" aria-label="View mode">
        {(['editor', 'source', 'reader'] as const).map((mode) => (
          <button key={mode} className={viewMode === mode ? 'is-active' : ''} onClick={() => onModeChange(mode)}>
            {mode}
          </button>
        ))}
      </div>
      <div className="toolbar__group">
        <button
          title="Paragraph"
          aria-label="Paragraph"
          disabled={editingDisabled}
          onClick={() => editor?.chain().focus().setParagraph().run()}
        >
          <Pilcrow size={18} />
        </button>
        <button
          title="Bullet list"
          aria-label="Bullet list"
          disabled={editingDisabled}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List size={18} />
        </button>
        <button
          title="Ordered list"
          aria-label="Ordered list"
          disabled={editingDisabled}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={18} />
        </button>
        <button title="Image URL" aria-label="Image URL" disabled={editingDisabled} onClick={addImage}>
          <Image size={18} />
        </button>
        <button
          title="Mermaid"
          aria-label="Mermaid"
          disabled={editingDisabled}
          onClick={() => editor?.chain().focus().insertContent({ type: 'mermaid', attrs: { code: 'flowchart LR\n  A --> B' } }).run()}
        >
          <Workflow size={18} />
        </button>
        <button
          title="Display math"
          aria-label="Display math"
          disabled={editingDisabled}
          onClick={() => editor?.chain().focus().insertContent({ type: 'mathBlock', attrs: { code: 'E = mc^2' } }).run()}
        >
          <Sigma size={18} />
        </button>
      </div>
      <div className="toolbar__group">
        <label className="icon-file" title="Import Markdown as document" aria-label="Import Markdown as document">
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
        <button title="Export Markdown" aria-label="Export Markdown" onClick={onExportMarkdown}>
          <Download size={18} />
        </button>
        <button title="Print or export HTML" aria-label="Print or export HTML" onClick={onExportHtml}>
          <Printer size={18} />
        </button>
      </div>
    </header>
  );
}
