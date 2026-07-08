# Markdown Typography Studio

A GitHub Pages deployable Markdown WYSIWYG editor and reader.

## Features

- React, TypeScript, Vite, and Tiptap editing surface.
- Markdown source is the persisted document format.
- WYSIWYG/source/reader modes.
- Markdown import and export.
- Image insertion by URL.
- Mermaid blocks with editable source and rendered preview.
- Inline and block LaTeX rendered with KaTeX.
- Independent reader view with table of contents, print styles, and advanced Knuth-Plass paragraph breaking.
- GitHub Actions CI and GitHub Pages deployment workflows.

## Local Development

```sh
npm install
npm run dev
```

## Verification

```sh
npm test
npm run build
npm run test:e2e
```

## Deployment

Push to `main` or `master` with GitHub Pages enabled for Actions. The Pages workflow builds `dist/` from the repository root and deploys it as the site artifact. On the `Naraka02/KPMark` repository, Vite uses `/KPMark/` as the Pages base path.
