import { describe, expect, it } from 'vitest';
import {
  createWorkspaceDocument,
  deriveDocumentTitle,
  ensureValidWorkspace,
  filenameToTitle,
  migrateMarkdownToWorkspace
} from '../app/workspace';

describe('workspace document helpers', () => {
  it('derives document titles from headings and text', () => {
    expect(deriveDocumentTitle('# Project Notes\n\nBody')).toBe('Project Notes');
    expect(deriveDocumentTitle('No heading, just content')).toBe('No heading, just content');
    expect(deriveDocumentTitle('', 'Fallback')).toBe('Fallback');
  });

  it('converts imported filenames into readable titles', () => {
    expect(filenameToTitle('meeting-notes.md')).toBe('meeting notes');
    expect(filenameToTitle('draft_outline.markdown')).toBe('draft outline');
  });

  it('migrates a legacy markdown buffer into a valid workspace', () => {
    const workspace = migrateMarkdownToWorkspace('# Legacy\n\nBody', 'legacy-id');

    expect(workspace.activeDocumentId).toBe('legacy-id');
    expect(workspace.documents).toHaveLength(1);
    expect(workspace.documents[0]).toMatchObject({
      id: 'legacy-id',
      title: 'Legacy',
      markdown: '# Legacy\n\nBody'
    });
  });

  it('repairs invalid active document ids without dropping documents', () => {
    const first = createWorkspaceDocument({ id: 'first', title: 'First' });
    const repaired = ensureValidWorkspace(
      {
        version: 2,
        activeDocumentId: 'missing',
        documents: [first]
      },
      'fallback'
    );

    expect(repaired.activeDocumentId).toBe('first');
    expect(repaired.documents).toEqual([first]);
  });
});
