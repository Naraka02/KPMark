import { marked } from 'marked';
import TurndownService from 'turndown';

const encode = (value: string) => encodeURIComponent(value);
const decode = (value: string | null) => {
  if (!value) return '';
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

type Placeholder = { token: string; html: string };

function extractSpecialBlocks(markdown: string) {
  const placeholders: Placeholder[] = [];
  let index = 0;
  const next = (html: string) => {
    const token = `@@SPECIAL_BLOCK_${index++}@@`;
    placeholders.push({ token, html });
    return `\n\n${token}\n\n`;
  };

  const withoutMermaid = markdown.replace(/```mermaid\n([\s\S]*?)```/g, (_match, code: string) =>
    next(`<div data-type="mermaid" data-code="${encode(code.trim())}"><pre>${code.trim()}</pre></div>`)
  );

  const withoutMathBlocks = withoutMermaid.replace(/\$\$\n?([\s\S]*?)\n?\$\$/g, (_match, code: string) =>
    next(`<div data-type="math-block" data-code="${encode(code.trim())}">${code.trim()}</div>`)
  );

  return { markdown: withoutMathBlocks, placeholders };
}

function renderInlineMath(html: string) {
  return html.replace(/\$([^$\n]+?)\$/g, (_match, code: string) =>
    `<span data-type="math-inline" data-code="${encode(code.trim())}">${code.trim()}</span>`
  );
}

export function markdownToHtml(markdown: string) {
  const { markdown: protectedMarkdown, placeholders } = extractSpecialBlocks(markdown);
  marked.setOptions({ gfm: true, breaks: false });
  let html = marked.parse(protectedMarkdown, { async: false }) as string;
  for (const placeholder of placeholders) {
    html = html.replace(`<p>${placeholder.token}</p>`, placeholder.html);
    html = html.replace(placeholder.token, placeholder.html);
  }
  return renderInlineMath(html);
}

export function htmlToMarkdown(html: string) {
  const turndown = new TurndownService({
    codeBlockStyle: 'fenced',
    headingStyle: 'atx',
    bulletListMarker: '-'
  });

  turndown.addRule('mermaidBlock', {
    filter: (node) => node instanceof HTMLElement && node.getAttribute('data-type') === 'mermaid',
    replacement: (_content, node) => {
      const code = decode((node as HTMLElement).getAttribute('data-code'));
      return `\n\n\`\`\`mermaid\n${code}\n\`\`\`\n\n`;
    }
  });

  turndown.addRule('mathBlock', {
    filter: (node) => node instanceof HTMLElement && node.getAttribute('data-type') === 'math-block',
    replacement: (_content, node) => {
      const code = decode((node as HTMLElement).getAttribute('data-code'));
      return `\n\n$$\n${code}\n$$\n\n`;
    }
  });

  turndown.addRule('mathInline', {
    filter: (node) => node instanceof HTMLElement && node.getAttribute('data-type') === 'math-inline',
    replacement: (_content, node) => `$${decode((node as HTMLElement).getAttribute('data-code'))}$`
  });

  return turndown.turndown(html).replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

export const markdownUtilities = { markdownToHtml, htmlToMarkdown };
