// THE LIMITS of triangles-semblables: its data against what the walks proved (the defaults of `PROVEN_LIMITS`;
// no limit is raised: no walk of this lesson has run yet). It reads `forges.js` (the forges agent's) and
// `board/script.js` (the board agent's): it FAILS with « SCAFFOLD » until both are written.
import { describe, it, expect } from 'vitest';
import { describeLimits, PROVEN_LIMITS } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { WORLD_TEXT, withStory } from '../../../../../../common/gameworld/nilePyramids/strings';
import { SCRIPT } from '../board/script';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { FORGES } from './forges';
import { KEYS } from './journey';
import { KNOWLEDGE } from './knowledge';
import { PRACTICE_MAP } from './practice';
import { GENERATORS, fairWave } from './run';
import { STORY } from './story';
import { TABLETS } from './tablets';

const ID = 'triangles-semblables';
const T = withStory(WORLD_TEXT, STORY.text);
/** Every instruction the story can show on its three docks — the world's and the story's, filled with their longest letters. */
const fill = (v) => (typeof v === 'function' ? v('AB', '[SE]', 'C') : v);
const OBJECTIVES = [
  ...Object.values(T.objective).map(fill),
  ...Object.values(T.stage.objective).map((v) => (typeof v === 'function' ? v('55') : v)),
];

describeLimits({
  forges: FORGES,
  keys: KEYS,
  tablets: TABLETS,
  objectives: OBJECTIVES,
  knowledge: KNOWLEDGE,
  practiceMap: PRACTICE_MAP,
  script: SCRIPT,
});

describe(`${ID} — its own limits`, () => {
  it('the story’s own instructions (the palm’s shadow, the mission, the end) stay inside the instruction’s limit', () => {
    for (const s of [
      STORY.text.stage.objective.shadow,
      STORY.text.stage.objective.mission,
      STORY.text.stage.objective.end,
    ])
      expect([...s].length, s).toBeLessThanOrEqual(PROVEN_LIMITS.objective);
  });
});

/**
 * THE RAIL'S PROMPT is ONE line (kit/GateRunHud.jsx › `data-gr-ask`: the order, then its formula): at 1366 × 768 the
 * walk saw « ABC et DEF ont la même forme. Leurs plus petits côtés sont AB et DE : de ABC à DEF, par quel nombre
 * multiplie-t-on les côtés ? » run off both edges. Its width in characters: the order's, a space, and the formula as
 * KaTeX draws it (spaces ignored, `\\quad` ≈ 2, a relation « = » with its spacing ≈ 2, `^\\circ` = 1). The LIMIT:
 * 40 characters — the prompts of thales-configuration-papillon were all wider than that when its walk passed at
 * 1366 × 768 (this test then measured them: « > 40 »); since 2026-11-27 a buoy is one bare calculation (owner) and both
 * lessons stand far under it.
 */
const RAIL_PROMPT = 40;
const texWidth = (t) =>
  [
    ...String(t ?? '')
      .replace(/\\[dt]?frac\{([^}]*)\}\{([^}]*)\}/g, (_, a, b) => (a.length > b.length ? a : b))
      .replace(/\\widehat\{([^}]*)\}/g, '$1')
      .replace(/\^\\circ/g, '°')
      .replace(/\s+/g, '')
      .replace(/\\quad/g, '··')
      .replace(/=/g, '==')
      .replace(/\\[a-zA-Z ]*/g, '')
      .replace(/[{}]/g, ''),
  ].length;
const promptWidth = (w) => [...w.say].length + 1 + texWidth(w.tex);
describe(`${ID} — the rail’s prompt fits its ONE line`, () => {
  it('every buoy’s order and formula are no wider than the width a walk proved', () => {
    const limit = RAIL_PROMPT;
    for (const kind of Object.keys(GENERATORS))
      for (let s = 0; s < 120; s += 1) {
        const w = fairWave(rng((s + 1) * 7919 + kind.length), kind, {});
        expect(promptWidth(w), `${w.say} | ${w.tex}`).toBeLessThanOrEqual(limit);
      }
  });
});

/**
 * K1'S LAST STEP stands in a column beside its figure (`use.column`): at 1366 × 768 its longest refusal (« PM est le côté
 * long : … ») fell under the window. Its statement holds in two lines, each refusal in one (the column's line at the
 * step's font: 56 characters, read on the walk's shot).
 */
describe(`${ID} — K1’s last step fits the window`, () => {
  const seen = (s) => [...String(s).replace(/\$/g, '')].length;
  it('its statement is at most 90 characters, each refusal at most 56', () => {
    const F = FORGES[KEYS[0]];
    expect(seen(F.text.tryKey(F.use.make())), F.text.tryKey(F.use.make())).toBeLessThanOrEqual(90);
    for (const r of Object.values(F.text.use)) expect(seen(r), r).toBeLessThanOrEqual(56);
  });
});
