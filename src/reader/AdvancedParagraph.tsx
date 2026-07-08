import { useMemo } from 'react';
import { breakParagraph } from '../typography/knuth-plass/paragraph';
import { InlineMarkdown } from './InlineMarkdown';

const canvas = typeof document === 'undefined' ? null : document.createElement('canvas');

export function AdvancedParagraph({ text, fontSize, lineWidth }: { text: string; fontSize: number; lineWidth: number }) {
  const lines = useMemo(() => {
    const context = canvas?.getContext('2d');
    if (!context || text.length > 1600 || /!\[|```|\$\$/.test(text)) return [text];
    context.font = `${fontSize}px Georgia, serif`;
    const width = lineWidth * fontSize * 0.56;
    return breakParagraph(text, width, (value) => context.measureText(value).width);
  }, [fontSize, lineWidth, text]);

  return (
    <p className="advanced-paragraph">
      {lines.map((line, index) => (
        <span className="kp-line" key={`${line}-${index}`}>
          <InlineMarkdown text={line} />
        </span>
      ))}
    </p>
  );
}
