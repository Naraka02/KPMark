# AGENTS

## Project

This is a Markdown WYSIWYG editor and advanced typography reader.

## Commands

- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Test: `npm test`
- E2E: `npm run test:e2e`

## Architecture Rules

- Markdown is the canonical persisted document format.
- Tiptap/ProseMirror owns live editing behavior only.
- Reader, print, and export rendering must be independent of the editor DOM.
- Mermaid SVG, KaTeX HTML, and image preview UI are rendered artifacts and must not be persisted into Markdown.
- Knuth-Plass typography belongs only in reader, print, and export views.
- Do not implement custom caret, selection, or IME handling for live editing.
- Mermaid, KaTeX, and images must round-trip through Markdown.
- Add tests for every parser/serializer change.

## Verification

Run these before release-facing changes:

```sh
npm test
npm run build
npm run test:e2e
```
