import { sampleMarkdown } from '../markdown/sample';

export type WorkspaceDocument = {
  id: string;
  title: string;
  markdown: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
};

export type WorkspaceSnapshot = {
  version: 2;
  activeDocumentId: string;
  documents: WorkspaceDocument[];
};

export function deriveDocumentTitle(markdown: string, fallback = 'Untitled document') {
  const heading = markdown
    .split('\n')
    .map((line) => line.match(/^#{1,6}\s+(.+?)\s*#*\s*$/)?.[1]?.trim())
    .find(Boolean);

  if (heading) return heading.slice(0, 80);

  const firstText = markdown
    .split('\n')
    .map((line) => line.replace(/[*_`>#-]/g, '').trim())
    .find((line) => line.length > 0);

  return (firstText || fallback).slice(0, 80);
}

export function filenameToTitle(filename: string) {
  const title = filename
    .replace(/\.(md|markdown|txt)$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim();
  return title || 'Imported document';
}

export function createWorkspaceDocument(params: {
  id: string;
  markdown?: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
}): WorkspaceDocument {
  const now = new Date().toISOString();
  const markdown = params.markdown ?? sampleMarkdown;
  return {
    id: params.id,
    title: (params.title?.trim() || deriveDocumentTitle(markdown)).slice(0, 80),
    markdown,
    createdAt: params.createdAt ?? now,
    updatedAt: params.updatedAt ?? now
  };
}

export function ensureValidWorkspace(snapshot: WorkspaceSnapshot, fallbackId: string) {
  if (snapshot.documents.length > 0 && snapshot.documents.some((doc) => doc.id === snapshot.activeDocumentId)) {
    return snapshot;
  }

  const documents =
    snapshot.documents.length > 0
      ? snapshot.documents
      : [createWorkspaceDocument({ id: fallbackId, title: 'Welcome document', markdown: sampleMarkdown })];

  return {
    version: 2,
    activeDocumentId: documents[0].id,
    documents
  } satisfies WorkspaceSnapshot;
}

export function migrateMarkdownToWorkspace(markdown: string, id: string): WorkspaceSnapshot {
  const document = createWorkspaceDocument({
    id,
    title: deriveDocumentTitle(markdown, 'Recovered document'),
    markdown
  });
  return {
    version: 2,
    activeDocumentId: document.id,
    documents: [document]
  };
}
