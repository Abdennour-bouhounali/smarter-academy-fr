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

describe('the road of « الجذر التربيعي لعدد موجب »', () => {
  it('ONE list of keys: the journey’s, re-exported by the tablets; the forges’ literals are the same ids', () => {
    expect(KEYS).toEqual(['dil-as-saha', 'qima-madbuta', 'dhahab-wa-iyab']);
    expect(TABLET_KEYS).toBe(KEYS);
    expect([K1, K2, K3]).toEqual(KEYS);
    expect(Object.keys(FORGES)).toEqual(KEYS);
    expect(Object.keys(TABLETS)).toEqual(KEYS);
    for (const key of KEYS) expect(FORGES[key].key).toBe(key);
  });

  it('the status script finds the keys: single-quoted in journey.js, each quoted in forges.js', () => {
    // scripts/lesson-v2-status.mjs › « S2 every rule is forged, never told »: the same two regular expressions
    const journeyText = readFileSync(join(here, 'journey.js'), 'utf8');
    const found = [...(/KEYS\s*=\s*\[([^\]]*)\]/.exec(journeyText)?.[1] ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1]);
    expect(found).toEqual(KEYS);
    const forgesText = readFileSync(join(here, 'forges.js'), 'utf8');
    for (const k of found) expect(forgesText.includes(`'${k}'`), k).toBe(true);
  });

  it('the lesson holds every part the kit reads, and every door of the kit is built (no `notYet`)', () => {
    for (const part of [
      'keys',
      'rules',
      'story',
      'forges',
      'run',
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
    expect(typeof lesson.trainer.evidenceOf).toBe('function');
    expect(typeof lesson.trainer.makeSession).toBe('function');
    expect(lesson.notYet).toBeUndefined();
    expect(lesson.ladder).toBe(ladder);
  });

  it('the cards a sitting of the BANK leaves open: each key’s notebook card, then the definition for a sheet', () => {
    const { ofKey, ofExercise, fallback } = lesson.cards;
    expect(ofExercise).toEqual({});
    expect(Object.keys(ofKey)).toEqual(KEYS);
    const node = (id) => KNOWLEDGE.graph.nodes.find((n) => n.id === id);
    for (const key of KEYS) expect(node(ofKey[key])).toMatchObject({ notebook: true, requires: key });
    expect(node(fallback)?.notebook).toBe(true);
  });

  it('the road: one stage per terrace; the exam opens after a first run of every key; the next step follows it', () => {
    const stages = STORY.terraces.length;
    expect(stages).toBe(6);
    expect(journey.examOpen(KEYS, {})).toBe(false);
    const firstRuns = Object.fromEntries(ladder.nodes.map((n, i) => [ladder.levelId(i, 0), { stars: 1, best: 100 }]));
    expect(journey.examOpen(KEYS, firstRuns)).toBe(true);
    expect(journey.examOpen(KEYS.slice(0, 2), firstRuns)).toBe(false);
    expect(journey.nextStep({ stage: 2, openKeys: [K1] })).toEqual({ do: 'story' });
    expect(journey.nextStep({ stage: stages, finished: true, openKeys: KEYS, practice: {} })).toMatchObject({
      do: 'game',
      node: 0,
      level: 0,
    });
    const p = journey.lessonProgress({ stage: 3, keys: [K1], know: { read: ['saha'] } });
    expect(p.road.map((r) => r.id)).toEqual(['story', 'keys', 'game', 'exam', 'know']);
    expect(p.road[0].label).toBe(`3 / ${stages}`);
    expect(p.road[4].label).toBe(`1 / ${KNOWLEDGE.graph.nodes.length}`);
  });
});
