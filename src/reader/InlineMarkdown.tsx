import { renderMathHtml } from '../features/math/renderMath';

function renderInline(text: string) {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/~~([^~]+)~~/g, '<s>$1</s>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noreferrer" target="_blank">$1</a>');

  html = html.replace(/\$([^$\n]+)\$/g, (_match, code: string) => renderMathHtml(code, false));
  return html;
}

export function InlineMarkdown({ text }: { text: string }) {
  return <span dangerouslySetInnerHTML={{ __html: renderInline(text) }} />;
}
