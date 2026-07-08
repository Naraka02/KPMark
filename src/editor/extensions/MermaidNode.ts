import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { MermaidView } from '../nodeviews/MermaidView';

export const MermaidNode = Node.create({
  name: 'mermaid',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      code: {
        default: 'flowchart LR\n  A --> B',
        parseHTML: (element) => decodeURIComponent(element.getAttribute('data-code') ?? ''),
        renderHTML: (attributes) => ({ 'data-code': encodeURIComponent(attributes.code) })
      }
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="mermaid"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'mermaid' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidView);
  }
});
