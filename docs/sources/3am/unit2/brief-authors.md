# 3AM unit 2 « العمليات على الكسور والأعداد الناطقة » — authors' brief for lesson #1 `maqlub-qismat-kasrayn` (2026-10-25)

Cycle moyen rollout, phase 3, Phase 0 « owner priority ». Same organisation as `docs/sources/3am/unit6/brief-authors.md` (read its « Bank author —
rules » and « The labs » parts first). The plan is `plan/maqlub-qismat-kasrayn.md` (read it whole) and the unit's `plan/README.md`. The LEAD writes the
lesson folder, `_unit/`, the extraction, `lesson.config.js`, the modules and `fractions3.js`; other leads work in the SAME tree (`jidaa-adadayn-nisbiyayn`,
unit 1): never touch their files, edit a shared file only by a small `Edit` right after a fresh `Read`, never revert someone else's change. Tablet and
laptop only. Never commit, push, stash, reset, checkout or clean; never run the DB export/import; use only dev-server port 5174 (the lab author), never 4173.

| Author | Owns | Never touches |
|---|---|---|
| **Lead** | the lesson folder, `_unit/`, `packages/core/arithmetic/fractions3.js` (+ test), the extraction, the catalogue | `content/practice/**`, the lab files |
| **Lab** | `common/manipulations/rate/GearCrank.jsx` (or `proportion/`), `logic/gearCrank.js` (+ tests), the lab's entries in `manipulationTypes.js`, `manipulationRegistry.js`, `levels.js`, `lesson.manipulation.json › gearCrank`, `VISUAL_THEMES` (`bikestand`), the MANIPULATION_CONTRACT / DNA sections | the lesson folder, the bank |
| **Bank** | `content/practice/3am/maqlub-qismat-kasrayn/**`, the lesson's entries in `content/practice/{active,exam-style,policy,misconceptions}.json`, `scripts/practice-oracle/maqlub-qismat-kasrayn.mjs` and its import in `scripts/practice-answer-oracle.test.mjs` | everything else |

## Shared facts

- Lesson id `maqlub-qismat-kasrayn`; LP ids `3am_maqlub-qismat-kasrayn_P1..P3` (P1 reciprocal; P2 `a ÷ b = a × 1/b`; P3 `a/b ÷ c/d`; final wording in plan §2).
- Exact fractions: `packages/core/arithmetic/fractions3.js` is the lead's (functions in the unit README table, row L1). The LAB may import it BY PATH
  (`@smarter-academy/core/arithmetic/fractions3.js`) once it exists (the lead creates it FIRST, within minutes: `raw`, `valueOf`, `rawTex`, `reciprocal`,
  `isReciprocalPair`, `divideFractions`, `simplifyBeforeMultiply`, `gearTurns(F, R, teeth)`); before that the lab may use `powers.js › rat`.
  The bank's oracle NEVER imports `packages/core` (it uses `scripts/practice-oracle/helpers.mjs`).

## The lab `gear-crank` « دوّاسة الدرّاجة » — FIXED props/events contract (the lead's modules depend on it)

Everything about the design is in plan §6 (drawn world `bikestand`, crank drag, tooth buttons, two counters, flag, overshoot pill, predict keypad, the free
panel « جرّب أعدادك », LabCoach steps, discovery). On top of that, FIXED by the lead:

```
<Manipulation type="gear-crank" level="beginner" {...LAB.beginner} onTrial={fn} />          // module 1, via ManipulationWorkspace levels
<Manipulation type="gear-crank" level="advanced" {...LAB.advanced} onTrial={fn} />
<Manipulation type="gear-crank" levels={false} world="reverse" tasks={[…]} onTrial={fn} />  // module 2 معارف: the lab ALONE
```
- `tasks`: `[{ id, F, R, target: 'p/q' | 'n', predict?: true }]` (target = wheel turns to the flag; F = chainring teeth, R = rear sprocket teeth). Presets in
  `levels.js` (same `objective` string on both levels, `validate:lessons`):
  - beginner: `m1` 48/24 → 3 · `m2` 24/32 → 6 · `m3` 24/32 → 1;
  - advanced (`predict: true`): `a1` 36/48 → 9/2 · `a2` 40/24 → 5/2 · `a3` 30/42 → 10/3 · `a4a` 42/30 → 1 then `a4b` 30/42 → 1 (the chain moved);
  - world `reverse` (module 2): `r1` 40/24 → 1 · `r2` 24/40 → 1.
- `onTrial(event)` — one event per release at the flag decision, per prediction and per free-panel run; ALWAYS these fields (strings are exact reduced
  fractions like `'3/2'`, `'8'`):
  `{ tk: 'release', id, F, R, target, teeth, pedal, wheel, atFlag, gap, free, ok }` · `{ tk: 'predict', id, F, R, target, value, expected, ok, free:false }` ·
  `{ tk: 'custom', free: true, … }` · `{ tk: 'solved', id }`.
  `ok` = the task was solved by that event (`atFlag`); `gap` = signed overshoot in wheel turns as a string (`'0'` at the flag). `free` = from the free panel.
- DOM contract: `[data-gear-crank][data-task][data-solved][data-layout]`, `[data-gc-glance]`, `[data-gc-stage]`, `[data-gc-crank]`, `[data-gc-teeth-less]`,
  `[data-gc-teeth-more]`, `[data-gc-pedal]` (counter, `data-value`), `[data-gc-wheel]` (counter), `[data-gc-flag]`, `[data-gc-gap]`, `[data-gc-predict]`,
  `[data-gc-predict-num]`, `[data-gc-predict-den]`, `[data-gc-go]`, `[data-gc-next]`, `[data-gc-verdict]`, `[data-gc-free]` (+ `-f`, `-r`, `-target`),
  `[data-gc-formal]`.
- The discovery (plan §6) opens after `m2` AND `m3` at beginner; the lab never states the rule above the discovery. The lead's lesson text reads
  counters via the events, not via the DOM.
- No `{{` in strings, no Latin prose, an RTL page; a mobile layout is NOT required (≥ 768 px only).

Lab author deliverables: the files above + `gearCrank.test.js` (logic: every task solved by following `coachOf`; overshoot; refusal of a wrong prediction; the
free panel's refusals) + `gearCrank.render.test.jsx` (both levels and world `reverse`; no `{{`; no Latin prose; opens on CONTEXT then ONE question) +
screenshots (Playwright on port 5174 at 768×1024, 1024×768 with the real lesson page and sidebar, 1280×800, 1366×768; initial, overshoot, the m2 stamp,
refused prediction, formal phase) reviewed with the eyes and iterated + the MANIPULATION_CONTRACT section (next free § number, re-read first) and the DNA §15 row.
The lab must be reachable at `/courses/moyen/3am/ansab_al_aadad_wal_hisab/kusur-natiqa/maqlub-qismat-kasrayn/nashat` once the lead's lesson exists; until
then test it through a scratch route or the render test (the lead tells you when the lesson page is up).

## Bank author — see the unit-6 brief's « Bank author — rules », with these specifics

- Plan §9 + §8 are the spec (levels, provenance mix, misconception ids `MISC-MAQLUB-*`, answer types, the oracle). 50 ids `ex-3am-maqlub-qismat-kasrayn-l<N>-<NNN>`.
- Boundaries: NO sums or differences of fractions inside a COUNTED step (they are `jam-tarh-kasrayn`, not yet published): where a corpus exercise mixes them, the
  sheet is `counted: false` on those steps or `term_exam_modelled`. NO signed numbers in counted steps (L4 may carry signed quotients of relatives with
  `counted: false`), no reciprocal of a negative number, no comparing fractions as the goal.
- Corpus exercises: read `docs/sources/moyen/exams/exams-index.json` and the PDFs of the ids listed in plan §9; be honest about faithful vs modelled
  (`scripts/lib/examProvenance.mjs`). Textbook citations (`cites`): the extraction element ids in plan §1 (`ex-1`, `ex-2`, `ex-4`…`ex-7`, `self-1`, `self-7`,
  `self-11`, `deep-59`, `deep-71`); the lead writes `docs/sources/3am/unit2/extraction.json` today — until it exists `check-textbook-coverage` cannot see them.
- Values woven into stories (التعاون، الأمانة، إتقان العمل، العناية بالممتلكات المشتركة), amounts in « دج », people are Algerian first names.
- Report: files, counts per level and per LP, provenance counts (term_exam / term_exam_modelled / adapted / platform_addition), the `term_exam` ids, results of
  `node scripts/validate-exercises.mjs --strict`, the oracle test, `npx vitest run scripts`, `node scripts/check-textbook-coverage.mjs`.
