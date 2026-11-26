# La page de révision — a lesson on one page, and the unit's summary

Asked by the owner on 2026-11-26 for the Algerian platform (« when you finish apply it too to the fr platform »), ported
here the same day from `smarter-academy-dz` (its `docs/architecture/REVISION_PAGE.md`). French, left to right.
**Not committed to `main`.**

## 1. Where it is
| Who | Door | Address |
|---|---|---|
| Student | « Page de révision » on the title screen of the lesson's world | `/espace/revision/:lessonId` |
| Teacher | the tab « Page de révision » of the lesson's tools, and the same title-screen door | `/enseignant/revision/:lessonId` |

A door shows only where the lesson's pack has the page. Both routes are behind `RequireLargeScreen`; the student's page
is also behind the tier gate (`LessonAccessGate`).

## 2. Writing a lesson's page — REQUIRED of every lesson with a game world (owner, 2026-11-26)
A lesson that teaches rules in a game world is NOT done without it: `revision.test.js` fails and `status:lesson-v2`
prints ❌. A unit's synthesis lesson has none.

One file `revision.js` in the lesson's folder (`export const REVISION`), named in its pack
(`revision: () => import('./revision.js').then((m) => m.REVISION)`), then `npm run generate:lesson-index`.
`features/revision` draws it; no list names a lesson.

**Sources, in this order:** `npm run -s lesson:brief -- <id>` (what the lesson teaches), its knowledge sheets
(`pack.knowledge` — the SAME rules, in the same words where they have them), its board memo (the traps, the exit
questions), and a look at its bank to know the level asked.

**The page** `{ intro, steps, quiz, next }` — `steps` are exactly, in order, each `{ id, short, title, blocks }`:

| id | holds |
|---|---|
| `recall` | what the lesson stands on: a rule, an example, one short `task` to check |
| `lesson` | every rule of the lesson (`rule` blocks), each followed by an `example` |
| `examples` | at least 3 solved `example`s, step by step, the last one a situation |
| `traps` | at least 3 `trap`s: the mistake, then why it is wrong |
| `exercises` | at least 6 `task`s from easy to brevet level, each with its `solution` |
| `summary` | one `table` (« La règle · En symboles · Exemple · Attention »), then a `note` « Au brevet » |
| `quiz` | one `text` block; the questions are in `quiz` (at least 6; the right answer moves) |

- block kinds: `text`, `note` (`text`) · `table` (`head`, `rows`) · `figure` (`figure`: the data of
  `common/components/geoFigure.js`) · `rule`, `example`, `trap` (`tag`, `body`) · `task` (`title`, `level`, `body`,
  `solution[]`).
- a `body` line: `{ p }`, `{ concl }`, `{ formula }`, `{ list: [] }`, `{ steps: [] }`. Maths is `$…$`; in a JS string a
  LaTeX command takes TWO backslashes. A decimal is written `3{,}5`.
- `quiz`: `{ q, options, correct, why }`.

**Writing rules:** French (`FRENCH_LANGUAGE_CONTRACT.md`), the student is « tu ». Own wording and own numbers — never a
sentence of the bank. Every number is computed twice. A FALSE equality is never written with `=`: write `\\neq` or say
it in words. A formula is one line. The platform's content rules hold.

**Checks, all before « done »:** `npx vitest run src/features/revision`, then the page LOOKED at at 1366×768 and printed
to PDF: no overflowing formula, **1 A4 page** (2 at most, one sheet).

## « No rule is told » does NOT apply here
Owner, 2026-11-26. A revision page and a unit summary tell the rules and are open from the start. The rule still binds
the game world.

## 3. What it records
Nothing on the server. Ticked steps stay in the browser (`sa:revision:<lesson>:steps`).

## 4. Look and print
Plain, one column up to 1720 px, the platform's blue; one line per math statement. « Imprimer » prints a compact memo
sheet: two columns, small text, NO exercise and no quiz, only the first two worked examples.

## 5. « Résumé de l'unité »
`/espace/revision/unite/:unitId` and `/enseignant/revision/unite/:unitId`. Door: the unit page. One table per lesson,
READ from the knowledge sheets (`unitSummary.js`). **A unit has it only once EVERY lesson of it, the synthesis apart, is
complete (game world + sheets)**; it then appears by itself. Today: no French unit is complete.

## 6. The unit page (2026-11-26)
French units show `pages/UnitPage.jsx` (no unit uses `UnitMissionView`). Its plain version, the same as the Algerian
one: « Ta leçon maintenant » on top for the student (`[data-unit-now]`: the main button, « Page de révision » when the
lesson has one, « Dans cette leçon » which opens that lesson's row), then the lessons as ONE list (« Tu es ici », a
« Page de révision » per lesson that has one), and « Résumé du chapitre » beside the progress once the chapter is
complete.
