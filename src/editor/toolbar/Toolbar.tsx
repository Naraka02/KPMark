import type { Editor } from '@tiptap/react';
import { Download, FileUp, Image, List, ListOrdered, Pilcrow, Printer, Sigma, Workflow } from 'lucide-react';
import type { ViewMode } from '../../app/store';

type Props = {
  editor: Editor | null;
  viewMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  onImport: (file: File) => void;
  onExportMarkdown: () => void;
  onExportHtml: () => void;
};

export function Toolbar({ editor, viewMode, onModeChange, onImport, onExportMarkdown, onExportHtml }: Props) {
  const addImage = () => {
    const src = window.prompt('Image URL');
    if (src) editor?.chain().focus().setImage({ src }).run();
  };

  return (
    <header className="toolbar">
      <div className="segmented" aria-label="View mode">
        {(['editor', 'source', 'reader'] as const).map((mode) => (
          <button key={mode} className={viewMode === mode ? 'is-active' : ''} onClick={() => onModeChange(mode)}>
            {mode}
          </button>
        ))}
      </div>
      <div className="toolbar__group">
        <button title="Paragraph" onClick={() => editor?.chain().focus().setParagraph().run()}>
          <Pilcrow size={18} />
        </button>
        <button title="Bullet list" onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          <List size={18} />
        </button>
        <button title="Ordered list" onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={18} />
        </button>
        <button title="Image URL" onClick={addImage}>
          <Image size={18} />
        </button>
        <button
          title="Mermaid"
          onClick={() => editor?.chain().focus().insertContent({ type: 'mermaid', attrs: { code: 'flowchart LR\n  A --> B' } }).run()}
        >
          <Workflow size={18} />
        </button>
        <button
          title="Display math"
          onClick={() => editor?.chain().focus().insertContent({ type: 'mathBlock', attrs: { code: 'E = mc^2' } }).run()}
        >
          <Sigma size={18} />
        </button>
      </div>
      <div className="toolbar__group">
        <label className="icon-file" title="Import Markdown">
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
        <button title="Export Markdown" onClick={onExportMarkdown}>
          <Download size={18} />
        </button>
        <button title="Print or export HTML" onClick={onExportHtml}>
          <Printer size={18} />
        </button>
      </div>
    </header>
  );
}
