import { useEffect, useState } from 'react';
import { messages, type Language } from '../app/i18n';
import { renderMermaidSvg } from '../features/mermaid/renderMermaid';

export function MermaidBlock({ code, language }: { code: string; language: Language }) {
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

  return <figure className="reader-mermaid">{error ? <pre className="render-error">{error}</pre> : <div dangerouslySetInnerHTML={{ __html: svg }} />}</figure>;
}
