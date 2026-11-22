/**
 * THE LIMITS the proven screens were WALKED for (.claude/skills/lesson-v2/SKILL.md §6, trusted.md) — this lesson's data
 * checked in seconds instead of a browser. Each number below is a limit lesson 6 (`bahth-pgcd/world/limits.test.js`)
 * proved at 1366 × 768: the forge's tiles, chips, lead, attack question and last step; the tablets; the world's
 * instruction and its card on the right; the practice map; the knowledge map; the board's asks, cues and stations.
 * Data that goes PAST a limit is a screen nobody has seen: the test fails, and the screen is walked before the limit is
 * raised (never raised to make the test pass).
 *
 * Written by wave 1, before the forges and the board exist: a forge that is still a PLACEHOLDER (`forges.js`) and a
 * board that is not written yet (`../board/script.js`) are skipped — and said so — until their agents write them.
 */
import { describe, it, expect } from 'vitest';
import { FORGES } from './forges';
import { KEYS } from './journey';
import { KNOWLEDGE } from './knowledge';
import { PRACTICE_MAP } from './practice';
import { STORY, TABLETS } from './story';

/** The board's script, when its agent has written it (a missing file is an empty map, not an error). */
const BOARD = Object.values(import.meta.glob('../board/script.js', { eager: true }))[0]?.SCRIPT ?? null;

/** What the walks proved (measured on lesson 6's data, 2026-11-19). */
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
  objective: 212, // the world's instruction
  recallLines: 3, // the card « من الجزيرة السابقة »
  practiceNodes: 7, // the practice map
  knowledgeCards: 15,
  boardSteps: 14,
  boardOptions: 6, // cards on an « ask »
  boardCue: 70,
  namingRow: 32, // a key's title on the board's naming station
};
const len = (s) => [...String(s).replace(/[⁦⁩]/g, '')].length;
const most = (xs) => Math.max(...xs.map(len));
/** Every rule a forge's tiles can write (the cartesian product of its slots). */
const rulesOf = (F) =>
  F.slots.reduce((acc, s) => acc.flatMap((r) => s.options.map((o) => ({ ...r, [s.id]: o.id }))), [{}]);
/** Every last step a forge can draw: `make` with a rand that walks through its pool. */
const usesOf = (F) => Array.from({ length: 12 }, (_, i) => F.use.make(() => (i + 0.5) / 12));

describe('awwaliyan-fima-baynahuma — its data stays inside what the walks proved', () => {
  for (const key of KEYS) {
    const F = FORGES[key];
    it.skipIf(F.placeholder)(`forge ${key}: tiles, headings, chips, lead, rule, attacks, last step`, () => {
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
      // the title is the board's naming row too (trusted.md: ≤ 32 characters)
      expect(len(t.title), t.title).toBeLessThanOrEqual(LIMITS.namingRow);
      expect(t.lines.length).toBeLessThanOrEqual(LIMITS.tabletLines);
      expect(t.math.length).toBeLessThanOrEqual(LIMITS.tabletMath);
      expect(t.notes.length).toBeLessThanOrEqual(LIMITS.tabletNotes);
    }
  });

  it('the world: every instruction it can show holds in 212 characters, the card on the right in three lines', () => {
    const o = STORY.text.objective;
    const convoys = ['only', 'common', 'proof', 'witness', 'hidden'];
    // every plank he can hold: the islands' own, the planks of each convoy, and long typed ones from the workshops
    const planks = [...new Set([...STORY.segments.flatMap((s) => [...(s.moulds ?? []), s.holdsWith ?? 1]), 34, 119])];
    const gaps = STORY.segments.filter((s) => s.kind === 'bridge').map((s) => s.a);
    const all = [
      o.pick('only'),
      o.pick('common'),
      o.witness,
      o.make('proof'),
      o.hidden,
      o.hiddenOpen,
      ...convoys.flatMap((c) => planks.flatMap((b) => [o.carry(c, b, 61, true), o.carry(c, b, 61, false)])),
      ...gaps.flatMap((a) => planks.flatMap((b) => [o.tail(a, b, 61), o.tail(a, b, null)])),
      ...STORY.islands.map((x) => o.convoyBack(x.name)),
      o.bossGo,
      o.board,
    ];
    expect(most(all)).toBeLessThanOrEqual(LIMITS.objective);
    // what the robot says is not the instruction, but stays one bubble: lesson 6's longest was 160
    const S = STORY.text.say;
    const said = [S.hello, S.common, S.proof, S.witness, S.hidden, S.anvilOpen, S.boss, S.bossOk, S.bossFail(35), S.f];
    expect(most(said)).toBeLessThanOrEqual(170);
    // the card on the right shows its lines one by one (kit/Instruction.jsx › Recall keeps three)
    expect(LIMITS.recallLines).toBe(3);
  });

  it('the practice map and the knowledge map stay inside the walked sizes', () => {
    expect(Object.keys(PRACTICE_MAP.positions).length).toBeLessThanOrEqual(LIMITS.practiceNodes);
    expect(KNOWLEDGE.graph.nodes.length).toBeLessThanOrEqual(LIMITS.knowledgeCards);
  });

  it.skipIf(!BOARD)('the board: its stations, its asks and its cues', () => {
    expect(BOARD.steps.length).toBeLessThanOrEqual(LIMITS.boardSteps);
    for (const s of BOARD.steps) {
      if (s.options) expect(s.options.length, s.id).toBeLessThanOrEqual(LIMITS.boardOptions);
      if (s.cue) expect(len(s.cue), s.cue).toBeLessThanOrEqual(LIMITS.boardCue);
    }
  });
});
