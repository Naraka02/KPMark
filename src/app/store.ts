import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { loadPersistedWorkspace, savePersistedWorkspace } from './persistence';
import {
  createWorkspaceDocument,
  deriveDocumentTitle,
  filenameToTitle,
  type WorkspaceDocument,
  type WorkspaceSnapshot
} from './workspace';

export type ViewMode = 'editor' | 'source' | 'reader';
export type ReaderTheme = 'paper' | 'sepia' | 'night';
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type AppState = {
  markdown: string;
  documents: WorkspaceDocument[];
  activeDocumentId: string | null;
  hasHydrated: boolean;
  saveStatus: SaveStatus;
  lastSavedAt: string | null;
  viewMode: ViewMode;
  advancedTypography: boolean;
  readerTheme: ReaderTheme;
  fontSize: number;
  lineWidth: number;
  hydrateWorkspace: () => Promise<void>;
  setMarkdown: (markdown: string) => void;
  selectDocument: (documentId: string) => void;
  createDocument: () => void;
  renameDocument: (documentId: string, title: string) => void;
  duplicateDocument: (documentId: string) => void;
  deleteDocument: (documentId: string) => void;
  importMarkdownDocument: (markdown: string, filename?: string) => void;
  setViewMode: (viewMode: ViewMode) => void;
  setAdvancedTypography: (enabled: boolean) => void;
  setReaderTheme: (theme: ReaderTheme) => void;
  setFontSize: (fontSize: number) => void;
  setLineWidth: (lineWidth: number) => void;
};

function buildSnapshot(state: Pick<AppState, 'activeDocumentId' | 'documents'>): WorkspaceSnapshot | null {
  if (!state.activeDocumentId || state.documents.length === 0) return null;
  return {
    version: 2,
    activeDocumentId: state.activeDocumentId,
    documents: state.documents
  };
}

export const useAppStore = create<AppState>((set, get) => {
  const persistWorkspace = () => {
    const snapshot = buildSnapshot(get());
    if (!snapshot) return;

    set({ saveStatus: 'saving' });
    void savePersistedWorkspace(snapshot)
      .then(() => set({ saveStatus: 'saved', lastSavedAt: new Date().toISOString() }))
      .catch(() => set({ saveStatus: 'error' }));
  };

  const updateDocuments = (
    updater: (documents: WorkspaceDocument[], activeDocumentId: string) => {
      documents: WorkspaceDocument[];
      activeDocumentId: string;
    }
  ) => {
    const activeDocumentId = get().activeDocumentId;
    if (!activeDocumentId) return;
    const next = updater(get().documents, activeDocumentId);
    const active = next.documents.find((document) => document.id === next.activeDocumentId) ?? next.documents[0];
    set({
      documents: next.documents,
      activeDocumentId: active.id,
      markdown: active.markdown
    });
    persistWorkspace();
  };

  return {
    markdown: '',
    documents: [],
    activeDocumentId: null,
    hasHydrated: false,
    saveStatus: 'idle',
    lastSavedAt: null,
    viewMode: 'editor',
    advancedTypography: true,
    readerTheme: 'paper',
    fontSize: 18,
    lineWidth: 74,
    hydrateWorkspace: async () => {
      const snapshot = await loadPersistedWorkspace(nanoid);
      const active = snapshot.documents.find((document) => document.id === snapshot.activeDocumentId) ?? snapshot.documents[0];
      set({
        documents: snapshot.documents,
        activeDocumentId: active.id,
        markdown: active.markdown,
        hasHydrated: true,
        saveStatus: 'saved',
        lastSavedAt: active.updatedAt
      });
      void savePersistedWorkspace(snapshot);
    },
    setMarkdown: (markdown) => {
      updateDocuments((documents, activeDocumentId) => {
        const updatedAt = new Date().toISOString();
        return {
          activeDocumentId,
          documents: documents.map((document) =>
            document.id === activeDocumentId
              ? {
                  ...document,
                  markdown,
                  updatedAt
                }
              : document
          )
        };
      });
    },
    selectDocument: (documentId) => {
      const document = get().documents.find((candidate) => candidate.id === documentId);
      if (!document) return;
      set({ activeDocumentId: document.id, markdown: document.markdown, viewMode: 'editor' });
      persistWorkspace();
    },
    createDocument: () => {
      const document = createWorkspaceDocument({
        id: nanoid(),
        title: 'Untitled document',
        markdown: '# Untitled document\n\nStart writing here.\n'
      });
      set((state) => ({
        documents: [document, ...state.documents],
        activeDocumentId: document.id,
        markdown: document.markdown,
        viewMode: 'editor'
      }));
      persistWorkspace();
    },
    renameDocument: (documentId, title) => {
      const normalized = title.trim().slice(0, 80);
      if (!normalized) return;
      updateDocuments((documents, activeDocumentId) => ({
        activeDocumentId,
        documents: documents.map((document) =>
          document.id === documentId ? { ...document, title: normalized, updatedAt: new Date().toISOString() } : document
        )
      }));
    },
    duplicateDocument: (documentId) => {
      const source = get().documents.find((document) => document.id === documentId);
      if (!source) return;
      const now = new Date().toISOString();
      const copy = createWorkspaceDocument({
        id: nanoid(),
        title: `${source.title} copy`,
        markdown: source.markdown,
        createdAt: now,
        updatedAt: now
      });
      set((state) => ({
        documents: [copy, ...state.documents],
        activeDocumentId: copy.id,
        markdown: copy.markdown,
        viewMode: 'editor'
      }));
      persistWorkspace();
    },
    deleteDocument: (documentId) => {
      const documents = get().documents;
      if (documents.length <= 1) return;
      const nextDocuments = documents.filter((document) => document.id !== documentId);
      const nextActiveId = get().activeDocumentId === documentId ? nextDocuments[0].id : get().activeDocumentId ?? nextDocuments[0].id;
      const active = nextDocuments.find((document) => document.id === nextActiveId) ?? nextDocuments[0];
      set({
        documents: nextDocuments,
        activeDocumentId: active.id,
        markdown: active.markdown,
        viewMode: 'editor'
      });
      persistWorkspace();
    },
    importMarkdownDocument: (markdown, filename) => {
      const document = createWorkspaceDocument({
        id: nanoid(),
        title: filename ? filenameToTitle(filename) : deriveDocumentTitle(markdown, 'Imported document'),
        markdown
      });
      set((state) => ({
        documents: [document, ...state.documents],
        activeDocumentId: document.id,
        markdown: document.markdown,
        viewMode: 'editor'
      }));
      persistWorkspace();
    },
    setViewMode: (viewMode) => set({ viewMode }),
    setAdvancedTypography: (advancedTypography) => set({ advancedTypography }),
    setReaderTheme: (readerTheme) => set({ readerTheme }),
    setFontSize: (fontSize) => set({ fontSize }),
    setLineWidth: (lineWidth) => set({ lineWidth })
  };
});
