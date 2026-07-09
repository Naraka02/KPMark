import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef } from 'react';
import { markdownToHtml, htmlToMarkdown } from '../markdown/markdown';
import { MermaidNode } from './extensions/MermaidNode';
import { MathBlockNode, MathInlineNode } from './extensions/MathNodes';
import { messages, type Language } from '../app/i18n';

type Props = {
  markdown: string;
  language: Language;
  onMarkdownChange: (markdown: string) => void;
  onEditorReady: (editor: ReturnType<typeof useEditor>) => void;
};

export function EditorPane({ markdown, language, onMarkdownChange, onEditorReady }: Props) {
  const t = messages[language];
  const isApplyingExternalUpdate = useRef(false);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: t.editor.placeholder }),
      MermaidNode,
      MathInlineNode,
      MathBlockNode
    ],
    content: markdownToHtml(markdown),
    editorProps: {
      attributes: { class: 'editor-content' }
    },
    onUpdate: ({ editor }) => {
      if (isApplyingExternalUpdate.current) return;
      onMarkdownChange(htmlToMarkdown(editor.getHTML()));
    }
  }, [language]);

  useEffect(() => {
    onEditorReady(editor);
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (!editor) return;
    const current = htmlToMarkdown(editor.getHTML()).trim();
    if (current === markdown.trim()) return;
    isApplyingExternalUpdate.current = true;
    editor.commands.setContent(markdownToHtml(markdown), false);
    queueMicrotask(() => {
      isApplyingExternalUpdate.current = false;
    });
  }, [editor, markdown]);

  return <EditorContent editor={editor} />;
}
