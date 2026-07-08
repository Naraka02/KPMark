import { useMemo } from 'react';
import { renderMathHtml } from '../features/math/renderMath';
import { parseReaderBlocks } from './parseBlocks';
import { AdvancedParagraph } from './AdvancedParagraph';
import { InlineMarkdown } from './InlineMarkdown';
import { MermaidBlock } from './MermaidBlock';
import type { ReaderTheme } from '../app/store';

type Props = {
  markdown: string;
  advancedTypography: boolean;
  readerTheme: ReaderTheme;
  fontSize: number;
  lineWidth: number;
  onAdvancedTypographyChange: (enabled: boolean) => void;
  onReaderThemeChange: (theme: ReaderTheme) => void;
  onFontSizeChange: (size: number) => void;
  onLineWidthChange: (width: number) => void;
};

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function ReaderView({
  markdown,
  advancedTypography,
  readerTheme,
  fontSize,
  lineWidth,
  onAdvancedTypographyChange,
  onReaderThemeChange,
  onFontSizeChange,
  onLineWidthChange
}: Props) {
  const blocks = useMemo(() => parseReaderBlocks(markdown), [markdown]);
  const toc = blocks.filter((block) => block.type === 'heading') as Array<{ type: 'heading'; depth: number; text: string }>;

  return (
    <div className="reader-shell">
      <aside className="reader-sidebar">
        <div className="reader-sidebar__header">
          <p>Preview</p>
          <h2>Reader settings</h2>
        </div>
        <div className="reader-control reader-control--switch">
          <label>
            <input type="checkbox" checked={advancedTypography} onChange={(event) => onAdvancedTypographyChange(event.target.checked)} />
            <span>Advanced typography</span>
          </label>
        </div>
        <div className="reader-control-grid">
          <label className="range-control">
            Theme
            <select value={readerTheme} onChange={(event) => onReaderThemeChange(event.target.value as ReaderTheme)}>
              <option value="paper">Paper</option>
              <option value="sepia">Sepia</option>
              <option value="night">Night</option>
            </select>
          </label>
          <label className="range-control">
            Font
            <input type="range" min="15" max="24" value={fontSize} onChange={(event) => onFontSizeChange(Number(event.target.value))} />
          </label>
          <label className="range-control">
            Width
            <input type="range" min="48" max="92" value={lineWidth} onChange={(event) => onLineWidthChange(Number(event.target.value))} />
          </label>
        </div>
        <nav aria-label="Table of contents">
          <span>Contents</span>
          {toc.map((item) => (
            <a key={slug(item.text)} style={{ paddingLeft: `${(item.depth - 1) * 12}px` }} href={`#${slug(item.text)}`}>
              {item.text}
            </a>
          ))}
        </nav>
      </aside>
      <article className={`reader-page reader-page--${readerTheme}`} style={{ fontSize, maxWidth: `${lineWidth}ch` }}>
        {blocks.map((block, index) => {
          if (block.type === 'heading') {
            const Tag = `h${block.depth}` as keyof JSX.IntrinsicElements;
            return <Tag id={slug(block.text)} key={index}>{block.text}</Tag>;
          }
          if (block.type === 'paragraph') {
            return advancedTypography ? (
              <AdvancedParagraph key={index} text={block.text} fontSize={fontSize} lineWidth={lineWidth} />
            ) : (
              <p key={index}><InlineMarkdown text={block.text} /></p>
            );
          }
          if (block.type === 'mermaid') return <MermaidBlock code={block.code} key={index} />;
          if (block.type === 'math') return <div className="reader-math" key={index} dangerouslySetInnerHTML={{ __html: renderMathHtml(block.code, true) }} />;
          if (block.type === 'image') return <img className="reader-image" key={index} alt={block.alt} src={block.src} />;
          if (block.type === 'code') return <pre key={index}><code>{block.code}</code></pre>;
          if (block.type === 'blockquote') return <blockquote key={index}><InlineMarkdown text={block.text} /></blockquote>;
          if (block.type === 'list') {
            const ListTag = block.ordered ? 'ol' : 'ul';
            return <ListTag key={index}>{block.items.map((item) => <li key={item}><InlineMarkdown text={item} /></li>)}</ListTag>;
          }
          return <hr key={index} />;
        })}
      </article>
    </div>
  );
}
