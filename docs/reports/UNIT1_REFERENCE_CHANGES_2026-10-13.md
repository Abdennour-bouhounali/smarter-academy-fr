# Unit 1 « الأعداد الطبيعيّة والأعداد النّاطقة » — what changed only there, and what to extend

> Point-in-time report, 2026-10-13. Ground truth = the code of unit 1
> (`lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/`, 9 lessons) read against `git log` and the
> working tree. Unit 1 is the **pilot unit**: a rule is added there first, then extended. The rules themselves live
> in the guides listed under each point; this file is the checklist for extending them to units 2–14.

## 0. Scan method and scope

Commits inspected: the last 40 (2026-09-25 → 2026-10-10) plus the uncommitted tree. Classified by the share of
files inside unit 1:

| Change set | Unit-1 only? | Verdict |
|---|---|---|
| `d223a016` (2026-10-10) — values in story contexts, 171 files (20 app files, 149 `content/practice` JSON, the guide, the curriculum JSON) | **Yes** (169/171) | Point 1 |
| `30ec210f` (2026-10-09), 13 unit-1 module files out of 220 | **Partly.** The 207 others are platform work (try-all, result line on top, default `مبتدئ`, card removal) already applied to every unit | Point 2 is the unit-1-only part |
| Working tree — `wadiya-idmajiya-aadad` rebuilt (6 modules added, 3 removed/moved), migration, `REQUIRED_STAGES_BY_KIND`, knowledge graph, `extraction.json` | **Yes** | Point 3 |
| `a42fe31c` BEM exam sheet (units 1–7), `da0e8fd3` مسائل + أتوقّع القاعدة (all lessons), `4661af71` DNA redesign (unit 1 pilot, since followed by units 2–14), problem `illustration`/`tone`/`scene` engine (units 1–8 done, gate-tested) | No | Not repeated here; nothing left to extend |
| Not unit 1 although in the same tree: `shadow-world` (unit 9), the Classroom Mode entry page / pages (platform) | No | Excluded |

## 1. Values in story contexts (owner rule, 2026-10-10) — **extend to 65 lessons**

What was done in unit 1 (~180 stories):
- every word-problem situation carries ONE woven clause of a good value (إتقان العمل، العلم والقراءة، الأمانة، التكافل،
  التعاون، برّ الوالدين، احترام الوقت، النظافة، حبّ الوطن); numbers, conditions, answers and ids unchanged;
- places touched, per lesson: `content/problems.js` statements (3 مسائل) · `lesson.config.js › lessonProblem.statement` ·
  `content/textbook.js` situations (activity, team experience, challenge) · `content/exercises.js` · the odd module
  string (`ikhtizal-kasr` M1) · the `content/practice/4am/<lesson>/level-*/*.json` word problems (149 of 450 — only
  the exercises that tell a story) · the unit card's `textAr` in `packages/core/curriculum/dz/units_4am_2026_2027.json`
  (`CHALLENGE` in `bahth-pgcd/content/textbook.js` changed with it);
- the verbatim textbook wording stays in `docs/sources/**/extraction.json` (`check:textbook` still passes);
- any hint / explanation / test that recaps a story is updated with it; values rotate inside a lesson.

To extend (units 2–14: 65 lessons, 13 synthesis lessons included): same six places per lesson; one author per unit,
brief + lock as in `docs/sources/4am/unit13/`; run `check:textbook`, the lessons' `problems.test.js` (they recompute
numbers) and `validate-exercises`. **No automated gate exists** — add one if wanted (e.g. a test that every
`problems.js` statement longer than N words differs from its extraction text).
Rule text: `LESSON_DEVELOPMENT_GUIDE.md` § « Values in story contexts ».

## 2. The « discover, don't be told » pass on module text (2026-10-09) — **extend to every lesson**

Unit 1's modules were re-read so no line states the law before the student has produced it. The edits (13 files)
fall into six patterns:
1. **Lead of a manipulation = an observation to make, never the conclusion** — « لاحظ: القاسم المشترك الأكبر لا يتغيّر »
   → « لاحظ ماذا يحدث للقاسم المشترك الأكبر… » ; « كل مستطيل تامّ يعطيك قاسمين » → « لاحظ ما يعطيه لك كل مستطيل تامّ ».
2. **Task text names the action, not the rule** — « اقسم على قاسم مشترك ثم على آخر » → « وزّع الوصفة على حصص متماثلة ».
3. **A step title must not carry the answer** — « لماذا نتوقف عند 10؟ » → « إلى أيّ عدد نختبر؟ ».
4. **An explanation does not leak the next lesson's tool** (the √ bound `4² = 16 ≤ 17 < 25` removed from a QCM
   explanation; a lead that said « توقّع بالخاصية » now says « بما لاحظته في الحالة 1 »; a proof lead asks to think
   about the meaning of « يقسم » before reading the lines).
5. **Completion message and `predictPrompt` are questions**, not announcements (« ماذا يمكنك أن تقول عن كسر بسطه
   ومقامه أوليان فيما بينهما؟ »; a `predictPrompt` that reused the conclusion of a previous module now points to what the
   student SAW).
6. **`PredictRule` is placed where the student has just produced the material for a name or a method** (`pgcd-taarif`
   at the end of the bouquets activity; `tariqa-qawasim` in `qawasim-adad-tabii` M2) — the name is asked for before it is given.

To extend: per lesson, grep every `lead=`, step `title`, `explain`, `completion.message`, `predictPrompt` for a sentence
that states a rule the student is about to discover; apply patterns 1–6. Manipulation-side counterpart: `MANIPULATION_DNA.md` §16.
Rule text: `LESSON_DEVELOPMENT_GUIDE.md` § « Discovery pass ».

## 3. Synthesis lesson with training situations — `wadiya-idmajiya-aadad` (2026-10-13) — **owner decision needed for the 13 others**

Ground truth of the lesson now (modules 0–8, 87 min per the guide):
- **0** أستعدّ (PGCD / Euclid items) · **1–6** « الوضعية التدريبية N » (`track: 'problem'`, `GuidedProblem`, ids `wadiya-1…6`,
  `content/problems.js`, statements from the owner's sheet declared `addition('exam_style_problem')`) · **7** « تحليل الوضعية
  النهائية للاختبار » (read and analyse, nothing solved) · **8** « وضعية الاختبار النهائي » = the textbook's aprons challenge
  p. 7 (936 / 845), never used in a training.
- removed: « أؤكّد تعلّماتي » (QCM) and the p. 16 قصر الرياس situation; `extraction.json` marks `situation` `notIntegrated`,
  `challenge` `duplicatedIn` this lesson.
- engine consequences: `REQUIRED_STAGES_BY_KIND.synthesis = ['practice_lab', 'evaluation']` (no `trigger`);
  client remap `moduleLayoutMigrations.js › 'wadiya-idmajiya-aadad' v2 {1→7, 2→0, 3→8}` + Laravel migration
  `2026_10_13_000001_remap_wadiya_modules_idmajiya_aadad.php` (untracked in git at the time of this report — commit it with the lesson);
  knowledge graph moved to module 7 (PGCD reminders, mistake « مجموع أم قاسم؟ »); `priorKnowledge` = PGCD points;
  no `lessonProblem` card; every number recomputed in `content/problems.test.js`.

To extend: the 13 other synthesis lessons (`wadiya-idmajiya-{judhur,muadalat,jumal,harfi,khattiya,taalufiya,ihsa,ashia,
muthallathat,maalam,talis,dawaran,fada}`) still have `astaidd · al-wadiya · uakkid · atamaqq · ahill|itqan`. The guide
says « reuse this recipe if the owner extends another synthesis »: it is the owner's call per unit; the checklist is
`MASAIL_GENERATION_GUIDE.md` §14.

## 4. Pilot work already extended — nothing to do, but check stragglers

| Piloted in unit 1 | State in units 2–14 |
|---|---|
| Result line on top, « جرّب كل الإمكانيات », default parameters, workspace opens on `مبتدئ` (`30ec210f`) | Done everywhere (only `lab.render.test.jsx` files still pass `defaultLevel="advanced"` — tests, intended) |
| `LessonProblemCard` only on the unit page, not in module 1 | Done everywhere in code; **3 `lesson.config.js` comments still say « à la fin du module 1 »**: `tawzif-khawass-judhur`, `tahlil-ibara`, `tanasub-taghayyurat` |
| Drawn `illustration` + `tone` on every مسألة | Gate `masailIllustrations.test.js` covers all lessons |
| `scene` (interactive مسألة scene) | Engine only — **no lesson uses it** |

## 5. Follow-up — extension executed (2026-10-13, same day)

Points 1–3 were extended to units 2–14 (13 unit passes + 13 synthesis conversions, `docs/` rules unchanged):
1. **Values**: all lessons' مسائل / `lessonProblem` / platform texts / story exercises (~1 100 practice statements), unit-card challenge text for units 2, 5, 6, 11.
2. **Discovery pass**: ~150 text edits (titles/subtitles → questions, leads, predict prompts, completion messages, brick order).
3. **Synthesis**: 13 lessons × six « وضعيات تدريبية » (78 new GuidedProblem modules, each with a drawn support and a recomputing test), then — owner order « never include أؤكّد تعلّماتي, always keep the unit-1 format » — reduced to exactly M0, M1–6, M7 analysis, M8 final (the `uakkid` and `atamaqq` modules deleted in all 13); remaps `{1→7, 2→0, 3→0, 4→8}` (`{1→7, 2→0, 3→8}` for judhur) in `moduleLayoutMigrations.js` + migration `2026_10_13_000002`; catalogue durations realigned; `extraction.json` destinations and e2e module numbers updated; `modulePath(..., 'trigger')` in the unit e2e files falls back to `al-wadiya` for synthesis lessons.
4. **Presenting mode**: `objectives` authored on every `ContentModule` (all 74 lessons); entry slide, pages, lesson-index split and test entry slide are generic.
Gates at the end: `vitest` web 483 files / 9414 tests, core 784, scripts 9898; `validate-lessons --strict`, `validate-exercises --strict`, `check-textbook-coverage`, `audit-predict-prompts --strict`, `audit-knowledge-dependencies --gate`, `check-katex`, `check-routes`, `check-non-blocking` green. Not run: PHP tests, Playwright suites (module numbers edited blind), full-corpus visual QA of presenting mode.
Known leftovers: `wadiya-idmajiya-talis` unit-card challenge text not reworded (owner's in-progress rebuild); `docs/sources/4am/unit14/build-extraction.py` still holds the old destination; lessons whose `lab.render.test.jsx` or e2e name module numbers were updated by hand; several `validate-exercises` « distracteurs sans misconception » warnings pre-date the work.

### 5bis. Unit-page « تحدّ » = the synthesis situation (owner choice « 2 », 2026-10-13)
Verified first: only unit 1 had page challenge = module 7 = module 8. Fixed by pointing the page challenge at the module-7 situation (module 8 evaluates a transposed situation of the same type in units 2–14 — not identical, by design). Units 2, 4, 5, 6, 7, 8, 10, 11, 12, 13 changed (`challenge.textAr/sourceElementId/page` + `UnitOpenerFigure` entries, new `components/OpenerFigure.jsx` wrappers + render tests in 7 synthesis lessons); units 3, 9, 14 unchanged (module 7 already includes the textbook challenge). The old textbook challenges remain in their regular lessons. `4am-unit-opener-figures.mjs` expectations updated (it cannot run for a visitor: the unit pages are behind an account).
