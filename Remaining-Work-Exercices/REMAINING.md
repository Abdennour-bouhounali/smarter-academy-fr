# What remains — 20 lessons (units 11 → 14)

Status on **2026-10-08**, at the owner's stop after unit 10: **54 of 74 lessons** are converted and switched on
(units 1–10). What was done is in [DONE.md](DONE.md). Nothing of units 8–10 or of the 2026-10-08 engine changes is
committed yet.

Order to keep (owner, 2026-10-06): one lesson at a time, oldest lesson on the platform first =
`content/practice/active.json` order. Each lesson: 50 sheets rewritten in place (ids kept), level 5 = 10
« الوضعية الإدماجية (08 ن) », official papers word for word with the official solution, « على منوال BEM <year> »
for the rest. Stop for the owner's « go » at the end of each unit.

## Lessons still on the classic practice page

| # | Unit | Lesson | Official annals it owns (session · ن · exam page · solution pages) |
|---|---|---|---|
| 1 | 11 الأشعة والانسحاب | insihab-shuaa | — |
| 2 | 11 | shuaayn-mutasawiyayn | — |
| 3 | 11 | majmu-shuaayn | — |
| 4 | 11 | barahin-ashia | 2016 I-4 (03,5) 4R→4L · 32–35 |
| 5 | 11 | wadiya-idmajiya-ashia | — |
| 6 | 12 الأشعة في معلم | murakkibata-shuaa | — |
| 7 | 12 | hisab-murakkibatay | 2013 I-4 (03,5) 3R · 21–24; 2020 I-4 (03,5) 5L · 48–49; 2021 I-4 (03) 6R · 50–52 |
| 8 | 12 | muntasaf-masafa | 2014 I-4 (03) 3L · 25–28; 2017 I-3 (04) 4L · 36–39; 2019 I-4 (03,5) 5L · 44–47; 2024 I-3 (03) 7R · 58–60; 2025 I-3 (03) 7L · 61–62 |
| 9 | 12 | ithbat-khawas-maalam | 2010 I-3 (03) 2R · 12–13; 2011 I-4 (03) 2L · 14–16; 2012 I-4 (03) 2L · 17–20; 2022 I-4 (03) 6L · 53–54 |
| 10 | 12 | wadiya-idmajiya-maalam | — |
| 11 | 13 الدوران والزوايا والمضلّعات | mafhum-dawaran | 2009 I-3 (02,5) 1L · 8–11 |
| 12 | 13 | khawas-dawaran | — |
| 13 | 13 | zawiya-muhitiya | 2012 I-3 (03) 2L · 17–20; 2015 I-3 (03) 4R · 29–31 |
| 14 | 13 | mudalaat-muntazama | — |
| 15 | 13 | wadiya-idmajiya-dawaran | — |
| 16 | 14 الهندسة في الفضاء | kura-julla | — |
| 17 | 14 | misaha-hajm-kura | — |
| 18 | 14 | maqati-mustawiya | — |
| 19 | 14 | takbir-tasghir | — |
| 20 | 14 | wadiya-idmajiya-fada | — |

Full index: `docs/sources/4am/bem-practice/annals-index.md`. **Page references**: the exam PDF has 8 pages — « 4R »
means page 4, right column; the solutions file (same name + « حلول », no `.pdf` extension, 62 pages) has its own
numbering. **Right-to-left scans**: a sentence's full stop is at the LEFT end and a list « حيث: X ، Y » starts on the
RIGHT (the lead misread this once in unit 9; the author was right).

Unit 14 owns no annals (space geometry never appears in BEM 2007–2025): « على منوال » + adapted only. Regular
polygons (mudalaat-muntazama) own none either.

## What the remaining units need (prepared, not yet briefed)

- **Unit 11 (vectors)** and **12 (vectors in a frame)**: GeoFigure `vectors`, `grid`, `axes` are ready. The validator
  now REQUIRES `figureQuality(fig) = []` on an exam sheet: 3 figures of shuaayn-mutasawiyayn and 2 of insihab-shuaa
  fail today and must be redesigned when their lesson is converted. Coordinates / pairs: `point` answers (unit 5).
  Thales and trigonometry steps inside unit-12 papers: `counted:false` unless the lesson's scope mobilises them
  (rule learned in unit 10: read the lesson's learning points before marking a step out of lesson).
- **Unit 13 (rotation, inscribed angle, regular polygons)**: GeoFigure centred `arcs`, `angles[].arrow`, `circles`.
  BEM 2012 I-3 and 2015 I-3 are owned by zawiya-muhitiya; their Thales / trig steps `counted:false`.
- **Unit 14 (space)**: `statement.figure` with `kind: 'space'` (SpaceFigure) is now drawn on the exam sheet too (the
  single dispatch `StatementFigure`, 2026-10-08) and was used successfully in the unit-10 synthesis (Khufu pyramid,
  boxes). `figureQuality` does not apply to space figures; the lesson tests use `spaceFigureQuality` — the author must
  run it on every bank figure (not yet enforced by the validator).

## Next step when resuming

1. Write `docs/sources/4am/bem-practice/rollout/unit11/brief-authors.md` (same pattern as `unit9` / `unit10`: officials
   table with pages, out-of-lesson steps — checked against each lesson's learning points —, figure rules, answer types).
2. Lesson by lesson: one author agent (prompt pattern = unit 10, each author keeps its generator in its own scratchpad
   subfolder), then the lead's audit:
   ```bash
   python3 Remaining-Work-Exercices/tools/audit.py <lesson>   # hooks the oracle, removes the policy exemption
   node scripts/validate-exercises.mjs --strict
   npx vitest run --dir scripts                               # answer oracle (alone, never in parallel)
   node scripts/check-textbook-coverage.mjs                   # must stay 0 ✗
   QA_DIR=<scratch> Remaining-Work-Exercices/tools/switch.sh <lesson>   # exam-style.json + registry + cache + student e2e
   ```
   Lead's own checks each lesson: one official compared with the PDF, two sheets recomputed by hand, the figures looked
   at in the teacher view at 360 px (`/enseignant/pratique/<lesson>/<level>/<full exercise id>`, token of qa-prof).
   `switch.sh` needs the dev stack running (`npm run dev:all`: web 5173, API 8000) and creates a qa-eleve token; revoke
   all `e2e-bem-*` tokens at the end of each unit.
3. PHP tests: `pdo_sqlite` is missing on this machine — run them on a MySQL test database. **Use a database of your own
   (e.g. `smarter_academy_dz_test_bem`)**: another Claude session runs its tests on `smarter_academy_dz_test` at the same
   time, and sharing it made both runs fail on 2026-10-08.
4. At the end of each unit: status row in `docs/architecture/EXERCISE_CONTRACT.md`, this file, DONE.md.

## Open questions for the owner

1. Counting choices made by authors (each can be reversed): BEM 2007 II « 15x > 12x + 900 » counted in
   tarrid-taalufi; graph readings around the intersection counted in tafsir-bayani-jumla; discount coefficient
   (20 % → ×0,8) counted in dala-khattiya, percentage rates in tatbiqat-tanasub.
2. Some official sheets count nothing for their lesson as printed (BEM 2023 I-2 in nashr-tabsit, BEM 2023 I-4
   in tamthil-bayani-taalufi): their steps are self-marked or belong to another lesson.
3. BEM 2018 II and 2017 II restart step numbers at 01 in their second part; the platform needs increasing steps,
   so they are numbered 01–02 then 03–04 with the « الجزء الأول / الثاني » titles kept.
4. (Units 8–10, 2026-10-08) Choices listed in DONE.md §11 « Choices the owner may want to reverse » — e.g. BEM 2023
   NK accepted only as the exact 20/7; BEM 2015 I-4 « AB² = 468 » typed instead of a rounded AB; irrational lengths
   typed as the coefficient a of a√r; a wheelchair ramp at nisab-muthallathiya l5-003 sharing a theme with a lesson
   مسألة; no truncated-axis (« misleading ») charts.
5. Hiding « أعِد المحاولة » once the model solution is opened is enforced in the interface only: the server does not
   know the solution was opened. Say if it must also be enforced server-side.

## Not done (by design)

No commit, no push, no deployment. The PDFs in `docs/official-BREVET-exams/` are never to be `git add`ed (the
solutions file has no `.pdf` extension, so `.gitignore` misses it).
