import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useEffect, useState } from 'react';
import { currentDocumentLanguage, messages } from '../../app/i18n';
import { renderMermaidSvg } from '../../features/mermaid/renderMermaid';

export function MermaidView({ node, updateAttributes, selected }: NodeViewProps) {
  const code = node.attrs.code as string;
  const language = currentDocumentLanguage();
  const t = messages[language];
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
          const message = err instanceof Error ? err.message : t.richNodes.mermaidError;
          setError(`${t.richNodes.mermaidError}: ${message}`);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [code, t.richNodes.mermaidError]);

  return (
    <NodeViewWrapper className={`rich-node mermaid-node ${selected ? 'is-selected' : ''}`}>
      <div className="rich-node__header">{t.richNodes.mermaid}</div>
      <textarea
        aria-label={t.richNodes.mermaidSource}
        value={code}
        onChange={(event) => updateAttributes({ code: event.target.value })}
      />
      <div className="rich-node__preview">
        {error ? <pre className="render-error">{error}</pre> : <div dangerouslySetInnerHTML={{ __html: svg }} />}
      </div>
    </NodeViewWrapper>
  );
}
