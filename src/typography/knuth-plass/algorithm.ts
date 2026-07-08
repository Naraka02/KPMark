import type { Breakpoint, Item } from './types';

const infinity = 10_000;

function fitnessClass(ratio: number) {
  if (ratio < -0.5) return 0;
  if (ratio <= 0.5) return 1;
  if (ratio <= 1) return 2;
  return 3;
}

function feasibleBreak(item: Item) {
  return item.type === 'glue' || (item.type === 'penalty' && item.penalty < infinity);
}

function lineStats(items: Item[], start: number, end: number) {
  let width = 0;
  let stretch = 0;
  let shrink = 0;
  for (let i = start; i <= end; i += 1) {
    const item = items[i];
    if (item.type === 'box' || item.type === 'penalty') width += item.width;
    if (item.type === 'glue') {
      width += item.width;
      stretch += item.stretch;
      shrink += item.shrink;
    }
  }
  return { width, stretch, shrink };
}

function adjustmentRatio(stats: ReturnType<typeof lineStats>, lineWidth: number) {
  const difference = lineWidth - stats.width;
  if (difference > 0) return stats.stretch > 0 ? difference / stats.stretch : infinity;
  if (difference < 0) return stats.shrink > 0 ? difference / stats.shrink : -infinity;
  return 0;
}

export function knuthPlass(items: Item[], lineWidth: number, tolerance = 2) {
  const active: Breakpoint[] = [{ position: -1, line: 0, fitnessClass: 1, totalDemerits: 0, previous: null }];
  const bestAt = new Map<string, Breakpoint>();

  items.forEach((item, position) => {
    if (!feasibleBreak(item)) return;
    const candidates: Breakpoint[] = [];

    for (const activeBreak of active) {
      const stats = lineStats(items, activeBreak.position + 1, position);
      const ratio = adjustmentRatio(stats, lineWidth);
      if (ratio < -1 || ratio > tolerance) continue;

      const penalty = item.type === 'penalty' ? item.penalty : 0;
      const badness = Math.min(10_000, 100 * Math.abs(ratio) ** 3);
      const klass = fitnessClass(ratio);
      const fitnessPenalty = Math.abs(klass - activeBreak.fitnessClass) > 1 ? 100 : 0;
      const demerits = (1 + badness + Math.max(0, penalty)) ** 2 + fitnessPenalty;
      candidates.push({
        position,
        line: activeBreak.line + 1,
        fitnessClass: klass,
        totalDemerits: activeBreak.totalDemerits + demerits,
        previous: activeBreak
      });
    }

    for (const candidate of candidates) {
      const key = `${candidate.line}:${candidate.fitnessClass}`;
      const existing = bestAt.get(key);
      if (!existing || candidate.totalDemerits < existing.totalDemerits) {
        bestAt.set(key, candidate);
        active.push(candidate);
      }
    }
  });

  const finalBreaks = active.filter((candidate) => candidate.position === items.length - 1);
  const best = finalBreaks.sort((a, b) => a.totalDemerits - b.totalDemerits)[0];
  if (!best) return [];

  const breaks: number[] = [];
  let cursor: Breakpoint | null = best;
  while (cursor?.previous) {
    breaks.unshift(cursor.position);
    cursor = cursor.previous;
  }
  return breaks;
}
