import mermaid from 'mermaid';
import { nanoid } from 'nanoid';

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'neutral'
});

export async function renderMermaidSvg(code: string) {
  const id = `mermaid-${nanoid(8)}`;
  const { svg } = await mermaid.render(id, code);
  return svg;
}
