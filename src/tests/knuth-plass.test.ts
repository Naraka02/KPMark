import { describe, expect, it } from 'vitest';
import { breakParagraph } from '../typography/knuth-plass/paragraph';

describe('Knuth-Plass paragraph breaking', () => {
  it('returns controlled line boxes for normal prose', () => {
    const text = 'Typography improves reading when paragraph lines are balanced instead of simply filling every browser line greedily.';
    const lines = breakParagraph(text, 150, (value) => value.length * 8);
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.join(' ')).toBe(text);
    expect(lines.every((line) => line.length > 0)).toBe(true);
  });
});
