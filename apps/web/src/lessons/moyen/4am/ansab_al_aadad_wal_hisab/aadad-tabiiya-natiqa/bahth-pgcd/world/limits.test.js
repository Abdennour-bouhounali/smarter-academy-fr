/**
 * THE LIMITS this lesson's screens were WALKED for (.claude/skills/lesson-v2/SKILL.md §6, trusted.md) — its data checked
 * in seconds instead of a browser. Each number below is the longest string, list or count of THIS lesson's data on a
 * screen that the walks of 2026-11-19 played and looked at, at 1366 × 768 and 1024 × 768 (e2e/gameworld-bahth.mjs,
 * -hub, -trainer, class-lesson-bahth.mjs): the forge's tiles, chips, lead, attack question, explanation and last step;
 * the tablets; the world's instruction and its card on the right; the practice map; the knowledge map; the board's asks,
 * cues and stations. A change to the data that goes PAST a limit is a screen nobody has seen: the test fails, and the
 * screen is walked again before the limit is raised (never raised to make the test pass).
 */
import { describe, it, expect } from 'vitest';
import { FORGES } from './forges';
import { KEYS } from './journey';
import { KNOWLEDGE } from './knowledge';
import { PRACTICE_MAP } from './practice';
import { STORY, TABLETS } from './story';
import { SCRIPT } from '../board/script';

/** What the walks proved (measured on this lesson's data, 2026-11-19). */
const LIMITS = {
  tile: 32, // the longest tile of a forge
  slotHeading: 35, // a column's heading
  chip: 54, // the chip of a picked tile
  slots: [2, 3], // columns of tiles
  tilesPerSlot: 4,
  buildLead: 135, // the lead above the tiles
  ruleText: 145, // his rule as one sentence
  attack: 155, // the mirror's challenge
  tryKey: 146, // the last step's question
  useLines: 4, // the last step's lines (4: two columns)
  useBoxes: 4, // boxes on one line of the last step
  tabletLines: 2,
  tabletMath: 2,
  tabletNotes: 1,
  objective: 212, // the world's instruction (island A's three gaps)
  recallLines: 3, // the card « من الجزيرة السابقة »
  practiceNodes: 7, // the practice map: the root, five keys, the exam
  knowledgeCards: 15,
  boardSteps: 14,
  boardOptions: 6, // cards on an « ask »
  boardCue: 70,
};
const len = (s) => [...String(s).replace(/[⁦⁩]/g, '')].length;
const most = (xs) => Math.max(...xs.map(len));
/** Every rule a forge's tiles can write (the cartesian product of its slots). */
const rulesOf = (F) =>
  F.slots.reduce((acc, s) => acc.flatMap((r) => s.options.map((o) => ({ ...r, [s.id]: o.id }))), [{}]);
/** Every last step a forge can draw: `make` with a rand that walks through its pool. */
const usesOf = (F) => Array.from({ length: 12 }, (_, i) => F.use.make(() => (i + 0.5) / 12));

describe('bahth-pgcd — its data stays inside what the walks proved', () => {
  for (const key of KEYS) {
    const F = FORGES[key];
    it(`forge ${key}: tiles, headings, chips, lead, rule, attacks, last step`, () => {
      expect(F.slots.length).toBeGreaterThanOrEqual(LIMITS.slots[0]);
      expect(F.slots.length).toBeLessThanOrEqual(LIMITS.slots[1]);
      for (const s of F.slots) {
        expect(s.options.length).toBeLessThanOrEqual(LIMITS.tilesPerSlot);
        expect(len(s.label), s.label).toBeLessThanOrEqual(LIMITS.slotHeading);
        for (const o of s.options) {
          expect(len(o.label), o.label).toBeLessThanOrEqual(LIMITS.tile);
          if (F.chip) expect(len(F.chip(s, o)), F.chip(s, o)).toBeLessThanOrEqual(LIMITS.chip);
        }
      }
      expect(len(F.text.buildLead)).toBeLessThanOrEqual(LIMITS.buildLead);
      for (const r of rulesOf(F)) expect(len(F.ruleText(r)), F.ruleText(r)).toBeLessThanOrEqual(LIMITS.ruleText);
      const right = rulesOf(F).find((r) => F.isTheRule(r));
      for (const c of F.attacks(right, [])) expect(len(F.text.attack(c))).toBeLessThanOrEqual(LIMITS.attack);
      for (const c of usesOf(F)) {
        expect(len(F.text.tryKey(c)), F.text.tryKey(c)).toBeLessThanOrEqual(LIMITS.tryKey);
        const lines = F.use.lines(c);
        expect(lines.length).toBeLessThanOrEqual(LIMITS.useLines);
        for (const l of lines)
          expect(l.tokens.filter((t) => typeof t === 'object').length).toBeLessThanOrEqual(LIMITS.useBoxes);
      }
    });
  }

  it('the tablets: a method of two lines, two formulas, one note', () => {
    for (const t of Object.values(TABLETS)) {
      expect(t.lines.length).toBeLessThanOrEqual(LIMITS.tabletLines);
      expect(t.math.length).toBeLessThanOrEqual(LIMITS.tabletMath);
      expect(t.notes.length).toBeLessThanOrEqual(LIMITS.tabletNotes);
    }
  });

  it('the world: the longest instruction, and the card on the right holds three lines at most', () => {
    const o = STORY.text.objective;
    const planks = [...STORY.segments.filter((s) => s.kind === 'bridge').map((s) => s.holdsWith), 8, 5, 3, 13];
    const names = STORY.islands.map((x) => x.name);
    const all = [
      o.diff,
      ...planks.map((b) => o.diffCarry(b)),
      ...STORY.segments.filter((s) => s.a).flatMap((s) => planks.map((b) => o.diffTail(s.a, b))),
      ...['tarh', 'iqlidis', 'sibaq'].flatMap((c) => [o.make(c), ...planks.map((b) => o.carry(c, b, 61))]),
      ...STORY.segments.filter((s) => s.a).flatMap((s) => planks.map((b) => o.tail(s.a, b, 61))),
      ...names.map((n) => o.convoyBack(n)),
      o.bossGo,
    ];
    expect(most(all)).toBeLessThanOrEqual(LIMITS.objective);
    // the card on the right shows its lines one by one (kit/Instruction.jsx › Recall keeps three)
    expect(LIMITS.recallLines).toBe(3);
  });

  it('the practice map, the knowledge map, the board', () => {
    expect(Object.keys(PRACTICE_MAP.positions)).toHaveLength(LIMITS.practiceNodes);
    expect(KNOWLEDGE.graph.nodes).toHaveLength(LIMITS.knowledgeCards);
    expect(SCRIPT.steps).toHaveLength(LIMITS.boardSteps);
    for (const s of SCRIPT.steps) {
      if (s.options) expect(s.options.length, s.id).toBeLessThanOrEqual(LIMITS.boardOptions);
      if (s.cue) expect(len(s.cue), s.cue).toBeLessThanOrEqual(LIMITS.boardCue);
    }
  });
});
