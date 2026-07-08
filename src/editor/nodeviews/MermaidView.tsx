import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useEffect, useState } from 'react';
import { renderMermaidSvg } from '../../features/mermaid/renderMermaid';

export function MermaidView({ node, updateAttributes, selected }: NodeViewProps) {
  const code = node.attrs.code as string;
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    renderMermaidSvg(code)
      .then((nextSvg) => {
        if (!cancelled) {
          setSvg(nextSvg);
          setError('');
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setSvg('');
          setError(err instanceof Error ? err.message : 'Invalid Mermaid diagram');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <NodeViewWrapper className={`rich-node mermaid-node ${selected ? 'is-selected' : ''}`}>
      <div className="rich-node__header">Mermaid</div>
      <textarea
        aria-label="Mermaid source"
        value={code}
        onChange={(event) => updateAttributes({ code: event.target.value })}
      />
      <div className="rich-node__preview">
        {error ? <pre className="render-error">{error}</pre> : <div dangerouslySetInnerHTML={{ __html: svg }} />}
      </div>
    </NodeViewWrapper>
  );
}
