export const sampleMarkdown = `# Markdown Typography Studio

Write Markdown in a WYSIWYG editor, switch to source when precision matters, then read or print with optional Knuth-Plass paragraph breaks.

## Rich blocks

Use **bold**, *italic*, ~~strike~~, [links](https://example.com), lists, quotes, code, images, diagrams, and math.

- Markdown is the persisted format.
- Tiptap handles the live editing surface.
- The reader is rendered independently from the editor DOM.

> Advanced typography is intentionally limited to normal prose paragraphs.

\`\`\`mermaid
flowchart LR
  A[Markdown] --> B[Tiptap]
  B --> C[Reader]
  C --> D[Print or export]
\`\`\`

Inline math such as $E = mc^2$ stays editable, and display math is rendered separately:

$$
\\int_0^1 x^2\\,dx = \\frac{1}{3}
$$

![Remote image](https://images.unsplash.com/photo-1498050108023-c5249f4df0852?w=1200&auto=format&fit=crop)
`;
