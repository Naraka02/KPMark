# CLAUDE

Follow the same architecture rules as AGENTS.md.

Prefer narrow, isolated changes. Do not rewrite the app architecture without explicit instruction.

Good task scopes:

- Review a Tiptap node extension.
- Add Markdown round-trip fixtures.
- Review Mermaid or KaTeX error states.
- Review Knuth-Plass line-break tests.
- Draft documentation after implementation exists.

Avoid:

- Changing dependencies without explaining why.
- Moving files unrelated to the task.
- Editing GitHub Actions unless the task is CI/deployment.
- Putting Knuth-Plass into the live editor.
