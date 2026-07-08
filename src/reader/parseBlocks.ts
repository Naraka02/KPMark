export type ReaderBlock =
  | { type: 'heading'; depth: number; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'code'; lang: string; code: string }
  | { type: 'mermaid'; code: string }
  | { type: 'math'; code: string }
  | { type: 'image'; alt: string; src: string }
  | { type: 'blockquote'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'rule' };

export function parseReaderBlocks(markdown: string): ReaderBlock[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: ReaderBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }

    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      const lang = fence[1] ?? '';
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) body.push(lines[i++]);
      i += 1;
      blocks.push(lang === 'mermaid' ? { type: 'mermaid', code: body.join('\n') } : { type: 'code', lang, code: body.join('\n') });
      continue;
    }

    if (/^\$\$\s*$/.test(line)) {
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !/^\$\$\s*$/.test(lines[i])) body.push(lines[i++]);
      i += 1;
      blocks.push({ type: 'math', code: body.join('\n') });
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      blocks.push({ type: 'heading', depth: heading[1].length, text: heading[2] });
      i += 1;
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) {
      blocks.push({ type: 'image', alt: image[1], src: image[2] });
      i += 1;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      blocks.push({ type: 'rule' });
      i += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) quote.push(lines[i++].replace(/^>\s?/, ''));
      blocks.push({ type: 'blockquote', text: quote.join(' ') });
      continue;
    }

    if (/^(\d+\.|-)\s+/.test(line)) {
      const ordered = /^\d+\.\s+/.test(line);
      const items: string[] = [];
      const pattern = ordered ? /^\d+\.\s+/ : /^-\s+/;
      while (i < lines.length && pattern.test(lines[i])) items.push(lines[i++].replace(pattern, ''));
      blocks.push({ type: 'list', ordered, items });
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6})\s+/.test(lines[i]) && !/^```/.test(lines[i]) && !/^\$\$\s*$/.test(lines[i])) {
      paragraph.push(lines[i++]);
    }
    blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
  }

  return blocks;
}
