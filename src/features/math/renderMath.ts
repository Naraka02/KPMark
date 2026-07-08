import katex from 'katex';

export function renderMathHtml(code: string, displayMode: boolean) {
  return katex.renderToString(code, {
    displayMode,
    throwOnError: false,
    strict: false,
    trust: false
  });
}
