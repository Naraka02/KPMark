import { knuthPlass } from './algorithm';
import type { Item } from './types';

export type MeasureText = (text: string) => number;

export function wordsToItems(text: string, measure: MeasureText): Item[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const spaceWidth = measure(' ');
  const items: Item[] = [];
  words.forEach((word, index) => {
    items.push({ type: 'box', width: measure(word), value: word });
    if (index < words.length - 1) {
      items.push({ type: 'glue', width: spaceWidth, stretch: spaceWidth * 1.6, shrink: spaceWidth * 0.5, value: ' ' });
    }
  });
  items.push({ type: 'penalty', width: 0, penalty: -10_000, flagged: false });
  return items;
}

export function breakParagraph(text: string, lineWidth: number, measure: MeasureText) {
  const items = wordsToItems(text, measure);
  const breakpoints = knuthPlass(items, lineWidth);
  if (breakpoints.length === 0) return greedyFallback(text, lineWidth, measure);

  const lines: string[] = [];
  let start = 0;
  for (const breakpoint of breakpoints) {
    const line = items
      .slice(start, breakpoint + 1)
      .filter((item) => item.type === 'box')
      .map((item) => ('value' in item ? item.value : ''))
      .join(' ');
    if (line) lines.push(line);
    start = breakpoint + 1;
  }
  return lines.length ? lines : [text];
}

function greedyFallback(text: string, lineWidth: number, measure: MeasureText) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && measure(candidate) > lineWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [text];
}
