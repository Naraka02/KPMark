import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { MathView } from '../nodeviews/MathView';

const codeAttribute = {
  default: '',
  parseHTML: (element: HTMLElement) => decodeURIComponent(element.getAttribute('data-code') ?? ''),
  renderHTML: (attributes: { code: string }) => ({ 'data-code': encodeURIComponent(attributes.code) })
};

export const MathInlineNode = Node.create({
  name: 'mathInline',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return { code: codeAttribute };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="math-inline"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'math-inline' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathView);
  }
});

export const MathBlockNode = Node.create({
  name: 'mathBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return { code: { ...codeAttribute, default: '\\\\int_0^1 x^2\\\\,dx' } };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="math-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'math-block' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathView);
  }
});
