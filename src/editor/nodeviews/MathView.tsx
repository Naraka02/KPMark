import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useMemo } from 'react';
import { renderMathHtml } from '../../features/math/renderMath';

export function MathView({ node, updateAttributes, selected }: NodeViewProps) {
  const code = node.attrs.code as string;
  const isBlock = node.type.name === 'mathBlock';
  const html = useMemo(() => renderMathHtml(code, isBlock), [code, isBlock]);

  return (
    <NodeViewWrapper
      as={isBlock ? 'div' : 'span'}
      className={`rich-node math-node ${isBlock ? 'math-node--block' : 'math-node--inline'} ${
        selected ? 'is-selected' : ''
      }`}
    >
      <input
        aria-label={isBlock ? 'Block math source' : 'Inline math source'}
        value={code}
        onChange={(event) => updateAttributes({ code: event.target.value })}
      />
      <span className="math-node__preview" dangerouslySetInnerHTML={{ __html: html }} />
    </NodeViewWrapper>
  );
}
