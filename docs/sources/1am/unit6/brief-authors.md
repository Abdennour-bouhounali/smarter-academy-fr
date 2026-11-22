# 1AM unit 6 « الحساب الحرفي » — authors' brief (lesson `bahth-adad-naqisa`, 2026-10-30)

Cycle moyen rollout, phase 3 — same organisation as `docs/sources/1am/unit5/brief-authors.md`. The lead writes the lesson
(`apps/web/src/lessons/moyen/1am/ansab_al_aadad_wal_hisab/ibarat-harfiya/bahth-adad-naqisa/`) and the extraction (`extraction.json`, built by
`build-extraction.py`; the unit is seeded: `ibarat-harfiya/_unit/`). Design card: `docs/curriculum/PLAN_1AM_NUMBERS.md` « 4 ».

| Author | Owns | Never touches |
|---|---|---|
| **Lab** | `manipulations/operations/RewindBelt.jsx` (+ `rewindBelt/art.jsx`), `manipulations/logic/rewindBelt.js` (+ `.test.js`), `operations/rewindBelt.render.test.jsx`, the `rewind-belt` entries of `levels.js`, `levels.test.js` and `manipulationRegistry.js`, the `rewindBelt` namespace of `lesson.manipulation.json`, `packages/core/arithmetic/missingNumber.js` (+ test), the type in `manipulationTypes.js` and the theme `packingline` in `manipulationLevels.js`, its section in `MANIPULATION_CONTRACT.md` (§ 2novenquinquagies quindecies) and its row in `MANIPULATION_DNA.md` | the lesson folder, `content/practice/**`, the extraction |
| **Bank** | `content/practice/1am/bahth-adad-naqisa/**`, the lesson's entries in `content/practice/{active,exam-style,policy,misconceptions}.json`, `scripts/practice-oracle/bahth-adad-naqisa.mjs` and its import in `scripts/practice-answer-oracle.test.mjs` | the lesson folder, the lab, the extraction |

## The lesson in one paragraph

« البحث عن أعداد ناقصة » (textbook نشاط 1 p. 79, the method and « دوري الآن » p. 82, exercises 15–18 p. 84, أقوّم 5 p. 85, أتعمّق 1, 6, 7 p. 86). Programme item `1am.m5.r10`
« إتمام مساواة من الشكل a + … = b ؛ a − … = b ؛ a × … = b ». The idea the student must DISCOVER: **the missing number □ is the number that entered a machine; it is found by running the
machine BACKWARD with the INVERSE operation (− for +, + for −, ÷ for ×; « a − □ » is its own inverse: □ = a − b) and it is CHECKED by putting it back through the original machine;
when a division does not stop the missing number is a fraction, checked exactly.** The entry (platform-designed, not the book's eggs): a packing workshop, a machine card and a belt the
hand runs backward; the book's three egg situations come back as an application (`أتمرّن 1`).

**Boundary with the next lessons (no duplication).** `tatbiq-qaida-harfiya` applies a LITERAL rule by substituting numbers; `intaj-ibara-harfiya` produces a literal expression. This
lesson never uses a letter: the missing number is □. Final الكفاءات (`1am_bahth-adad-naqisa_P<n>`, order kept): P1 translate a situation into an equality with a missing number (« □ + 9 = 54 »,
« 6 × □ = 54 »); P2 the missing number of a sum (subtract) and of a difference (add or subtract); P3 of a product (divide, even when the result is a fraction) and the check of EVERY result by substitution.
`pointPrerequisites`: P2 ← `1am_mana-jam-tarh_P1` (net `1am.m1.r05 → 1am.m5.r10`).

Modules: 0 أستعدّ (`1am.m1.r05`, `1am.m5.r01`, six platform statements) · 1 نشاط « الحزام المعاكس » (the lab, both levels) · 2 معارف (platform addition) · 3 طريقة (the book's p. 82 method with other numbers) ·
4 أتمرّن (`act-1`, `ex-15`, `ex-16`, `now-82`, `ex-17`, the check, `deep-7`) · 5–7 مسائل (the pen workshop; `deep-1` redesigned as a computer club's instalments; the stairs `deep-6` + the two-card program `ex-18`) ·
8 إختبار أولي (`self-5` adapted as E5).

## Lab author — `rewind-belt`

See `MANIPULATION_CONTRACT.md` § 2novenquinquagies quindecies for the task shape (`add`, `sub`, `rsub`, `mul`, `div` + `rack`), the two-phase move (rewind, check), the judged models (`same`, `family`, `trap`, `neg`)
and the chains. Why it is not another lab (DNA §12): `story-bars` stretches an unknown bar, `elevator-reel` / `zero-probe` are signed numbers, the 2AM equation labs balance; here the hand holds an OPERATION CARD
and the belt direction.

## Bank author

50 sheets, 172 questions; provenance read from the PDFs: `1am-s3-47` ex 1 (14 + x = 90 ; x − 3,8 = 9 ; 5x = 200 ; 83 − x = 78), `1am-s3-39` ex 2 (185 − x = 117 ; x + 11,7 = 18,5 ; 4x = 36), `1am-s3-43` ex 4 (a folder = 4 notebooks, write and solve an
equation), `1am-s3-44` ex 1 (79,8 + x = 100 ; x − 14 = 25 ; 14x = 7) and `1am-s3-37` ex 2 (Δ − 2,5 = 7,5 ; 60 + □ = 85), each with new numbers and contexts; the rest `term_exam_modelled` (`1am-s2`, `1am-s3`) or `adapted` from `act-1`,
`ex-15`, `ex-16`, `now-82`, `ex-17`, `ex-18`, `method-1`, `deep-1`, `deep-6`, `deep-7`, `self-5`. Every key is re-computed by the oracle; 11 `MISC-NAQISA-*`. A rational key is written canonically (`4.7`, `20/7`).

- **2026-10-30 — `tatbiq-qaida-harfiya` generated:** its elements (act-2, act-4, know-1 definition and conventions, know-2 apply-rule, ex-4 to ex-6, deep-5, ict, ict-ex) were re-read at 110 dpi (`verified: True`); `know-1` is split by `items` (conventions here, remarks `x × 1`, `ba = ab`, `x × 0`, `a × a` with `intaj-ibara-harfiya`); `ex-6` prints mL for a litre rule (recorded in `discrepancies`).
