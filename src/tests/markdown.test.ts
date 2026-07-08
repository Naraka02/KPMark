import { describe, expect, it } from 'vitest';
import { htmlToMarkdown, markdownToHtml } from '../markdown/markdown';

describe('Markdown round-trip', () => {
  it('preserves prose, image, Mermaid, and math semantics', () => {
    const markdown = `# Title

Paragraph with **bold** and $a+b$.

\`\`\`mermaid
flowchart LR
  A --> B
\`\`\`

$$
E = mc^2
$$

![Alt](https://example.com/a.png)
`;

    const roundTrip = htmlToMarkdown(markdownToHtml(markdown));
    expect(roundTrip).toContain('# Title');
    expect(roundTrip).toContain('**bold**');
    expect(roundTrip).toContain('$a+b$');
    expect(roundTrip).toContain('```mermaid');
    expect(roundTrip).toContain('flowchart LR');
    expect(roundTrip).toContain('$$');
    expect(roundTrip).toContain('E = mc^2');
    expect(roundTrip).toContain('![Alt](https://example.com/a.png)');
  });
});
