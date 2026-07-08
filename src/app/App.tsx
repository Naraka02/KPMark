import { useCallback, useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Copy, FilePlus2, Pencil, Trash2 } from 'lucide-react';
import { Toolbar } from '../editor/toolbar/Toolbar';
import { EditorPane } from '../editor/EditorPane';
import { ReaderView } from '../reader/ReaderView';
import { downloadText, printReader } from '../features/export/download';
import { useAppStore, type SaveStatus } from './store';
import type { WorkspaceDocument } from './workspace';

function formatTimestamp(value: string | null) {
  if (!value) return 'Not saved yet';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function slugFilename(title: string) {
  return `${title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'document'}.md`;
}

function statusText(status: SaveStatus, lastSavedAt: string | null) {
  if (status === 'saving') return 'Saving...';
  if (status === 'error') return 'Save failed';
  if (status === 'saved') return `Saved ${formatTimestamp(lastSavedAt)}`;
  return 'Ready';
}

type WorkspaceSidebarProps = {
  documents: WorkspaceDocument[];
  activeDocumentId: string | null;
  saveStatus: SaveStatus;
  lastSavedAt: string | null;
  onCreate: () => void;
  onSelect: (documentId: string) => void;
  onRename: (documentId: string, title: string) => void;
  onDuplicate: (documentId: string) => void;
  onDelete: (documentId: string) => void;
};

function WorkspaceSidebar({
  documents,
  activeDocumentId,
  saveStatus,
  lastSavedAt,
  onCreate,
  onSelect,
  onRename,
  onDuplicate,
  onDelete
}: WorkspaceSidebarProps) {
  const activeDocument = documents.find((document) => document.id === activeDocumentId);

  const renameDocument = (document: WorkspaceDocument) => {
    const title = window.prompt('Document title', document.title);
    if (title) onRename(document.id, title);
  };

  const deleteDocument = (document: WorkspaceDocument) => {
    if (documents.length <= 1) {
      window.alert('Keep at least one document in the workspace.');
      return;
    }
    if (window.confirm(`Delete "${document.title}"? This cannot be undone.`)) {
      onDelete(document.id);
    }
  };

  return (
    <aside className="workspace-sidebar" aria-label="Workspace documents">
      <div className="workspace-sidebar__header">
        <div>
          <p className="workspace-sidebar__eyebrow">Workspace</p>
          <h1>{activeDocument?.title ?? 'Documents'}</h1>
        </div>
        <button title="New document" aria-label="New document" onClick={onCreate}>
          <FilePlus2 size={18} />
        </button>
      </div>
      <p className={`save-state save-state--${saveStatus}`}>{statusText(saveStatus, lastSavedAt)}</p>
      <div className="document-list" role="list">
        {documents.map((document) => (
          <article
            key={document.id}
            role="listitem"
            className={`document-card ${document.id === activeDocumentId ? 'is-active' : ''}`}
          >
            <button className="document-card__main" aria-label={`Open ${document.title}`} onClick={() => onSelect(document.id)}>
              <strong>{document.title}</strong>
              <span>{formatTimestamp(document.updatedAt)}</span>
            </button>
            <div className="document-card__actions">
              <button title="Rename document" aria-label={`Rename ${document.title}`} onClick={() => renameDocument(document)}>
                <Pencil size={15} />
              </button>
              <button title="Duplicate document" aria-label={`Duplicate ${document.title}`} onClick={() => onDuplicate(document.id)}>
                <Copy size={15} />
              </button>
              <button title="Delete document" aria-label={`Delete ${document.title}`} onClick={() => deleteDocument(document)}>
                <Trash2 size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}

export function App() {
  const {
    markdown,
    documents,
    activeDocumentId,
    hasHydrated,
    saveStatus,
    lastSavedAt,
    viewMode,
    advancedTypography,
    readerTheme,
    fontSize,
    lineWidth,
    hydrateWorkspace,
    setMarkdown,
    createDocument,
    selectDocument,
    renameDocument,
    duplicateDocument,
    deleteDocument,
    importMarkdownDocument,
    setViewMode,
    setAdvancedTypography,
    setReaderTheme,
    setFontSize,
    setLineWidth
  } = useAppStore();
  const [editor, setEditor] = useState<Editor | null>(null);
  const onEditorReady = useCallback((nextEditor: Editor | null) => setEditor(nextEditor), []);
  const activeDocument = documents.find((document) => document.id === activeDocumentId);

  useEffect(() => {
    void hydrateWorkspace();
  }, [hydrateWorkspace]);

  const importFile = async (file: File) => {
    importMarkdownDocument(await file.text(), file.name);
    setViewMode('editor');
  };

  return (
    <div className="app">
      <Toolbar
        editor={editor}
        viewMode={viewMode}
        onModeChange={setViewMode}
        onImport={importFile}
        documentTitle={activeDocument?.title ?? 'Document'}
        saveStatus={saveStatus}
        onExportMarkdown={() => downloadText(slugFilename(activeDocument?.title ?? 'document'), markdown, 'text/markdown;charset=utf-8')}
        onExportHtml={printReader}
      />
      <main className="workspace">
        {hasHydrated && (
          <WorkspaceSidebar
            documents={documents}
            activeDocumentId={activeDocumentId}
            saveStatus={saveStatus}
            lastSavedAt={lastSavedAt}
            onCreate={createDocument}
            onSelect={selectDocument}
            onRename={renameDocument}
            onDuplicate={duplicateDocument}
            onDelete={deleteDocument}
          />
        )}
        <div className="workspace-content">
          {viewMode === 'editor' && (
            <section className="pane pane--editor" aria-label="WYSIWYG Markdown editor">
              {hasHydrated && (
                <EditorPane
                  key={activeDocumentId}
                  markdown={markdown}
                  onMarkdownChange={setMarkdown}
                  onEditorReady={onEditorReady}
                />
              )}
            </section>
          )}
          {viewMode === 'source' && (
            <section className="pane pane--source" aria-label="Markdown source editor">
              <textarea value={markdown} spellCheck="false" onChange={(event) => setMarkdown(event.target.value)} />
            </section>
          )}
          {viewMode === 'reader' && (
            <ReaderView
              markdown={markdown}
              advancedTypography={advancedTypography}
              readerTheme={readerTheme}
              fontSize={fontSize}
              lineWidth={lineWidth}
              onAdvancedTypographyChange={setAdvancedTypography}
              onReaderThemeChange={setReaderTheme}
              onFontSizeChange={setFontSize}
              onLineWidthChange={setLineWidth}
            />
          )}
        </div>
      </main>
    </div>
  );
}
