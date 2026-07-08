import { useEffect, useState } from 'react';
import { renderMermaidSvg } from '../features/mermaid/renderMermaid';

export function MermaidBlock({ code }: { code: string }) {
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

  return <figure className="reader-mermaid">{error ? <pre className="render-error">{error}</pre> : <div dangerouslySetInnerHTML={{ __html: svg }} />}</figure>;
}
