One file per lesson, builder-owned: `mafhum-jumla.js`, `hall-jabri.js`, `mushkilat-jumla.js` (council verdict of 2026-11-11, X3–X4).
Each exports three things — never retype a number: BUILD them by importing the lesson's own content files.

- **`TEXT = [/regex/, …]`** — the climax signature BY ROLE, for THIS lesson only (never applied to another lesson). Read by
  `_unit/missionStrings.test.js` (checkpoints, knowledge cards, knowledge map) and the lesson's `content/mission.test.js`. A regex that starts
  with « x » takes `(?<![0-9])` in front (verdict L1.14), and each lesson keeps a negative control (the regex catches its climax) and a positive
  control (its own peer sheet passes). Rule P of `hall-jabri` (X11) adds `/[-−]\s*\d*\s*\((?![^)]*;)/` on the sources written before module 4.
- **`UNIT = { systems, pairs, never }`** — what the OTHER lessons may not show before this lesson's climax: the climax's full systems (strings
  « a | b »), its pair islands (`'(30 ; 12)'`) and its distinctive totals (L1: 42 · L2: 115, 390, 345 · L3: 180, 210, 33000, 40000). Bare small
  values (30, 25, 100, 80) stay lesson-local. The synthesis's list is `SYNTH` in `../forbiddenShared.js`, the unit page's reserved challenge
  `UNIT_PAGE` (23 / 82 / (12 ; 11)).
- **`SYSTEMS = [{ id, tier, system, callback? }]`** — every system the lesson shows before its climax. `system` is a string « a | b », two
  strings, or `LS.system(…)` from the content. Tiers:
  - HEADLINE: `required` · `star` · `checkpoint` (when its answer is the solution of a system) · `peer` (the corrected system);
  - TIER 2: `easier` · `free` · `prep` (its solution is the TRUE one, whatever the « أستعدّ » item claims);
  - `module`: an activity, a worked example, « دوري » or a special case of modules 1–2.
  - `callback: true`: a module step ON a round's own system (L1's batch on r2, L3's pen steps on r1 / r2) — skipped by K1–K3.
  - Out of scope (never listed): module-3 exercises, the final test, the page levels, anything after the climax (L2's HOOK).
- Optional **`SHOWN = ['…']`** — the strings of the lesson's pre-climax content (rounds, checkpoints, prep, peer sheet), scanned for the
  later lessons' `never` totals and pair islands.

`_unit/unitCollisions.test.js` checks, unit-wide: **K1** no system twice (canonical form, all tiers) · **K2** HEADLINE pairs all distinct as
ORDERED pairs · **K3** no TIER-2 solution equals a HEADLINE pair · the **forward ban** (a lesson's content against the `UNIT` lists of the
lessons AT or AFTER it, `SYNTH` and `UNIT_PAGE`; an earlier lesson's climax is free afterwards). While a lesson's `SYSTEMS` / `UNIT` is empty,
the test uses that lesson's rows of its reference registry (verdict §4): a builder learns on day one whether his numbers collide with the two
other lessons.
