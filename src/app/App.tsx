import { useCallback, useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Toolbar } from '../editor/toolbar/Toolbar';
import { EditorPane } from '../editor/EditorPane';
import { ReaderView } from '../reader/ReaderView';
import { downloadText, printReader } from '../features/export/download';
import { useAppStore } from './store';

export function App() {
  const {
    markdown,
    hasHydrated,
    viewMode,
    advancedTypography,
    readerTheme,
    fontSize,
    lineWidth,
    hydrateDocument,
    setMarkdown,
    setViewMode,
    setAdvancedTypography,
    setReaderTheme,
    setFontSize,
    setLineWidth
  } = useAppStore();
  const [editor, setEditor] = useState<Editor | null>(null);
  const onEditorReady = useCallback((nextEditor: Editor | null) => setEditor(nextEditor), []);

  useEffect(() => {
    void hydrateDocument();
  }, [hydrateDocument]);

  const importFile = async (file: File) => {
    setMarkdown(await file.text());
    setViewMode('editor');
  };

  return (
    <div className="app">
      <Toolbar
        editor={editor}
        viewMode={viewMode}
        onModeChange={setViewMode}
        onImport={importFile}
        onExportMarkdown={() => downloadText('document.md', markdown, 'text/markdown;charset=utf-8')}
        onExportHtml={printReader}
      />
      <main className="workspace">
        {viewMode === 'editor' && (
          <section className="pane pane--editor" aria-label="WYSIWYG Markdown editor">
            {hasHydrated && <EditorPane markdown={markdown} onMarkdownChange={setMarkdown} onEditorReady={onEditorReady} />}
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
      </main>
    </div>
  );
}
