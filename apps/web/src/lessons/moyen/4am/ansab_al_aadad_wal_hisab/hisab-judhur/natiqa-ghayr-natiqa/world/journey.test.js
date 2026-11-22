import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KEYS, journey } from './journey';
import { KEYS as TABLET_KEYS, TABLETS } from './tablets';
import { FORGES, K1, K2, K3 } from './forges';
import { KNOWLEDGE } from './knowledge';
import { ladder } from './practice';
import { STORY } from './story';
import { lesson } from './index';

const here = dirname(fileURLToPath(import.meta.url));

describe('the road of « الأعداد الناطقة والأعداد غير الناطقة »', () => {
  it('ONE list of keys: the journey’s, re-exported by the tablets; the forges’ literals are the same ids', () => {
    expect(KEYS).toEqual(['murabba-natiq', 'la-kasr-yarkab', 'al-mudawwar']);
    expect(TABLET_KEYS).toBe(KEYS);
    expect([K1, K2, K3]).toEqual(KEYS);
    expect(Object.keys(TABLETS)).toEqual(KEYS);
    // the forges are written by another agent: once they exist, they are the three keys, in order
    if (Object.keys(FORGES).length) expect(Object.keys(FORGES)).toEqual(KEYS);
  });

  it('the status script finds the keys: single-quoted in journey.js, each quoted in forges.js', () => {
    const journeyText = readFileSync(join(here, 'journey.js'), 'utf8');
    const found = [...(/KEYS\s*=\s*\[([^\]]*)\]/.exec(journeyText)?.[1] ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1]);
    expect(found).toEqual(KEYS);
    const forgesText = readFileSync(join(here, 'forges.js'), 'utf8');
    for (const k of found) expect(forgesText.includes(`'${k}'`), k).toBe(true);
  });

  it('the lesson holds every part the kit reads (no course of gates: `run` is absent on purpose)', () => {
    for (const part of [
      'keys',
      'rules',
      'story',
      'forges',
      'ladder',
      'practiceMap',
      'sittings',
      'trainer',
      'journey',
      'evidence',
      'cards',
      'knowledge',
      'text',
    ])
      expect(lesson[part], part).toBeTruthy();
    expect(lesson.run).toBeUndefined();
    expect(STORY.terraces.some((t) => t.feature?.kind === 'run')).toBe(false);
    expect(typeof lesson.trainer.evidenceOf).toBe('function');
    expect(typeof lesson.trainer.makeSession).toBe('function');
    expect(lesson.notYet).toBeUndefined();
  });

  it('the cards a sitting of the BANK leaves open: each key’s notebook card, then the root card for a sheet', () => {
    const { ofKey, ofExercise, fallback } = lesson.cards;
    expect(ofExercise).toEqual({});
    expect(Object.keys(ofKey)).toEqual(KEYS);
    const node = (id) => KNOWLEDGE.graph.nodes.find((n) => n.id === id);
    for (const key of KEYS) expect(node(ofKey[key])).toMatchObject({ notebook: true, requires: key });
    expect(node(fallback)).toBeTruthy();
  });

  it('the road: one stage per terrace; the exam opens after a first run of every key', () => {
    const stages = STORY.terraces.length;
    expect(stages).toBe(6);
    expect(journey.examOpen(KEYS, {})).toBe(false);
    const firstRuns = Object.fromEntries(ladder.nodes.map((n, i) => [ladder.levelId(i, 0), { stars: 1, best: 100 }]));
    expect(journey.examOpen(KEYS, firstRuns)).toBe(true);
    expect(journey.examOpen(KEYS.slice(0, 2), firstRuns)).toBe(false);
    const p = journey.lessonProgress({ stage: 3, keys: [K1], know: { read: ['natiq'] } });
    expect(p.road[0].label.replace(/\s/g, ' ')).toBe(`3 / ${stages}`);
    expect(p.road[4].label.replace(/\s/g, ' ')).toBe(`1 / ${KNOWLEDGE.graph.nodes.length}`);
  });
});
