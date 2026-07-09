import { useCallback, useEffect, useId, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Check, Copy, FilePlus2, Pencil, Search, Trash2, X } from 'lucide-react';
import { Toolbar } from '../editor/toolbar/Toolbar';
import { EditorPane } from '../editor/EditorPane';
import { ReaderView } from '../reader/ReaderView';
import { downloadText, printReader } from '../features/export/download';
import { localeForLanguage, messages, type Language } from './i18n';
import { useAppStore, type SaveStatus } from './store';
import type { WorkspaceDocument } from './workspace';

function formatTimestamp(value: string | null, language: Language) {
  const t = messages[language];
  if (!value) return t.status.notSavedYet;
  return new Intl.DateTimeFormat(localeForLanguage(language), {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function slugFilename(title: string, fallback: string) {
  const safeTitle = title
    .trim()
    .normalize('NFKC')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '-')
    .replace(/(^\.+|\.+$)/g, '')
    .slice(0, 80);
  const safeFallback = fallback
    .trim()
    .normalize('NFKC')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '-') || 'document';
  return `${safeTitle || safeFallback}.md`;
}

function statusText(status: SaveStatus, lastSavedAt: string | null, language: Language) {
  const t = messages[language];
  if (status === 'saving') return t.status.saving;
  if (status === 'error') return t.status.saveFailed;
  if (status === 'saved') return t.status.saved(formatTimestamp(lastSavedAt, language));
  return t.status.ready;
}

type WorkspaceSidebarProps = {
  documents: WorkspaceDocument[];
  activeDocumentId: string | null;
  saveStatus: SaveStatus;
  lastSavedAt: string | null;
  language: Language;
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
  language,
  onCreate,
  onSelect,
  onRename,
  onDuplicate,
  onDelete
}: WorkspaceSidebarProps) {
  const t = messages[language];
  const renameInputId = useId();
  const activeDocument = documents.find((document) => document.id === activeDocumentId);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [deleteCandidate, setDeleteCandidate] = useState<WorkspaceDocument | null>(null);
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const filteredDocuments = documents.filter((document) => document.title.toLowerCase().includes(query.trim().toLowerCase()));

  const startRename = (document: WorkspaceDocument) => {
    setNotice('');
    setDeleteCandidate(null);
    setRenamingId(document.id);
    setDraftTitle(document.title);
  };

  const cancelRename = () => {
    setRenamingId(null);
    setDraftTitle('');
  };

  const submitRename = (documentId: string) => {
    const normalized = draftTitle.trim();
    if (normalized) onRename(documentId, normalized);
    cancelRename();
  };

  const requestDelete = (document: WorkspaceDocument) => {
    setNotice('');
    cancelRename();
    if (documents.length <= 1) {
      setNotice(t.workspace.keepOneDocument);
      return;
    }
    setDeleteCandidate(document);
  };

  const confirmDelete = () => {
    if (!deleteCandidate) return;
    onDelete(deleteCandidate.id);
    setDeleteCandidate(null);
  };

  return (
    <aside className="workspace-sidebar" aria-label={t.workspace.aria}>
      <div className="workspace-sidebar__header">
        <div>
          <p className="workspace-sidebar__eyebrow">{t.workspace.eyebrow}</p>
          <h1>{activeDocument?.title ?? t.workspace.fallbackTitle}</h1>
          <span>{t.workspace.count(documents.length)}</span>
        </div>
        <button title={t.workspace.newDocument} aria-label={t.workspace.newDocument} onClick={onCreate}>
          <FilePlus2 size={18} />
        </button>
      </div>
      <label className="workspace-search">
        <Search size={15} aria-hidden="true" />
        <span className="sr-only">{t.workspace.searchPlaceholder}</span>
        <input
          value={query}
          placeholder={t.workspace.searchPlaceholder}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div className={`save-state save-state--${saveStatus}`}>
        <span aria-hidden="true" />
        <p>{statusText(saveStatus, lastSavedAt, language)}</p>
      </div>
      {notice && <p className="workspace-notice" role="status">{notice}</p>}
      {deleteCandidate && (
        <div className="workspace-confirm" role="dialog" aria-modal="false" aria-labelledby="workspace-delete-title">
          <strong id="workspace-delete-title">{t.workspace.deleteTitle}</strong>
          <p>{t.workspace.deleteMessage(deleteCandidate.title)}</p>
          <div>
            <button className="button-danger" onClick={confirmDelete}>{t.workspace.deleteConfirm}</button>
            <button onClick={() => setDeleteCandidate(null)}>{t.workspace.deleteCancel}</button>
          </div>
        </div>
      )}
      <div className="document-list" role="list">
        {documents.length === 0 && <p className="workspace-empty">{t.workspace.empty}</p>}
        {documents.length > 0 && filteredDocuments.length === 0 && <p className="workspace-empty">{t.workspace.noSearchResults}</p>}
        {filteredDocuments.map((document) => {
          const isRenaming = renamingId === document.id;
          return (
            <article
              key={document.id}
              role="listitem"
              className={`document-card ${document.id === activeDocumentId ? 'is-active' : ''} ${isRenaming ? 'is-renaming' : ''}`}
            >
              {isRenaming ? (
                <form
                  className="document-card__rename"
                  onSubmit={(event) => {
                    event.preventDefault();
                    submitRename(document.id);
                  }}
                >
                  <label className="sr-only" htmlFor={`${renameInputId}-${document.id}`}>{t.workspace.renameInput(document.title)}</label>
                  <input
                    id={`${renameInputId}-${document.id}`}
                    value={draftTitle}
                    autoFocus
                    onChange={(event) => setDraftTitle(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') cancelRename();
                    }}
                  />
                  <button title={t.workspace.saveRename} aria-label={t.workspace.saveRename} type="submit">
                    <Check size={15} />
                  </button>
                  <button title={t.workspace.cancelRename} aria-label={t.workspace.cancelRename} type="button" onClick={cancelRename}>
                    <X size={15} />
                  </button>
                </form>
              ) : (
                <>
                  <button className="document-card__main" aria-label={t.workspace.openDocument(document.title)} onClick={() => onSelect(document.id)}>
                    <strong>{document.title}</strong>
                    <span>{formatTimestamp(document.updatedAt, language)}</span>
                  </button>
                  <div className="document-card__actions">
                    <button title={t.workspace.renameDocument} aria-label={t.workspace.renameDocumentNamed(document.title)} onClick={() => startRename(document)}>
                      <Pencil size={15} />
                    </button>
                    <button title={t.workspace.duplicateDocument} aria-label={t.workspace.duplicateDocumentNamed(document.title)} onClick={() => onDuplicate(document.id)}>
                      <Copy size={15} />
                    </button>
                    <button title={t.workspace.deleteDocument} aria-label={t.workspace.deleteDocumentNamed(document.title)} onClick={() => requestDelete(document)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </>
              )}
            </article>
          );
        })}
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
    language,
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
    setLineWidth,
    setLanguage
  } = useAppStore();
  const [editor, setEditor] = useState<Editor | null>(null);
  const onEditorReady = useCallback((nextEditor: Editor | null) => setEditor(nextEditor), []);
  const activeDocument = documents.find((document) => document.id === activeDocumentId);
  const t = messages[language];

  useEffect(() => {
    void hydrateWorkspace();
  }, [hydrateWorkspace]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t.app.title;
  }, [language, t.app.title]);

  const importFile = async (file: File) => {
    importMarkdownDocument(await file.text(), file.name);
    setViewMode('editor');
  };

  return (
    <div className="app" data-language={language}>
      <Toolbar
        editor={editor}
        viewMode={viewMode}
        onModeChange={setViewMode}
        onImport={importFile}
        documentTitle={activeDocument?.title ?? t.app.documentFallback}
        saveStatus={saveStatus}
        language={language}
        onLanguageChange={setLanguage}
        onExportMarkdown={() => downloadText(slugFilename(activeDocument?.title ?? t.app.documentFallback, t.app.documentFilenameFallback), markdown, 'text/markdown;charset=utf-8')}
        onExportHtml={printReader}
      />
      <main className="workspace">
        {hasHydrated && (
          <WorkspaceSidebar
            documents={documents}
            activeDocumentId={activeDocumentId}
            saveStatus={saveStatus}
            lastSavedAt={lastSavedAt}
            language={language}
            onCreate={createDocument}
            onSelect={selectDocument}
            onRename={renameDocument}
            onDuplicate={duplicateDocument}
            onDelete={deleteDocument}
          />
        )}
        <div className="workspace-content">
          {viewMode === 'editor' && (
            <section className="pane pane--editor" aria-label={t.editor.wysiwygAria}>
              <div className="pane__header">
                <div>
                  <p>{t.toolbar.modes.editor}</p>
                  <h2>{t.editor.editorTitle}</h2>
                </div>
                <span>{t.editor.editorHint}</span>
              </div>
              {hasHydrated && (
                <EditorPane
                  key={activeDocumentId}
                  markdown={markdown}
                  language={language}
                  onMarkdownChange={setMarkdown}
                  onEditorReady={onEditorReady}
                />
              )}
            </section>
          )}
          {viewMode === 'source' && (
            <section className="pane pane--source" aria-label={t.editor.sourceAria}>
              <div className="pane__header pane__header--dark">
                <div>
                  <p>{t.toolbar.modes.source}</p>
                  <h2>{t.editor.sourceTitle}</h2>
                </div>
                <span>{t.editor.sourceHint}</span>
              </div>
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
              language={language}
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
