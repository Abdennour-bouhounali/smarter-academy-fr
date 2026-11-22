# Mission prototype — rollout log (lesson by lesson)

> Started 2026-11-08, when the owner **validated** the pilot `qasim-adad-tabii`. Plan and checklist:
> `PILOT_PROTOTYPE_ROLLOUT_PLAN_2026-11-08.md` (§5 convert, §6 definition of done, §7 traps, §8 test toolkit); rules:
> `docs/lessons/LESSON_DEVELOPMENT_GUIDE.md` §4sexies, §4septies and its « Rollout recipe ». One commit per lesson,
> `feat(lessons): <id> — mission prototype`. A lesson is DONE when `vitest run src/lessons`, `check:lessons`,
> `lab-rollout-status --lesson <id>` and the Playwright walk of §6 (1366×768, 1024×768, 1920×1080; no `data-fit-overflow`) all pass.
>
> **2026-11-18: lessons 1–3 (`qasim-adad-tabii`, `qawasim-adad-tabii`, `khawass-qawasim`) are v2 and their mission
> player and module pages are DELETED** (`LESSON_V2.md` §2, `OLD_VERSION_TRACE_2026-11-18.md`). Their rows and sections
> below are history: the files they cite no longer exist. The pilot's reference for the mission player is gone with them —
> read the player on a lesson still on it (e.g. `jidhr-tarbii`).
> **2026-11-19: lesson 4 (`qasim-mushtarak-akbar`) too** — v2, its mission player, its scene `flower-shop` and its module
> pages deleted (`OLD_VERSION_TRACE_2026-11-18.md` §11); its row and section below are history.
> **2026-11-19: lesson 5 (`tayin-pgcd`) too** — v2, its mission player, its scene `school-bags` and its module pages
> deleted (`OLD_VERSION_TRACE_2026-11-18.md` §12); its row and section below are history.
> **2026-11-20: lesson 7 (`awwaliyan-fima-baynahuma`) too** — v2, its mission player, its scene `math-club` and its module
> pages deleted (`OLD_VERSION_TRACE_2026-11-18.md` §14); its row and section below are history. The unit's lessons still on
> the mission player: `ikhtizal-kasr` and the synthesis `wadiya-idmajiya-aadad`.
>
> **2026-11-20: lesson 8 (`ikhtizal-kasr`) too** — v2, its mission player, its scene `bakery` and its module pages deleted
> (`OLD_VERSION_TRACE_2026-11-18.md` §15); its row and section below are history. The unit's ONLY lesson still on the
> mission player is the synthesis `wadiya-idmajiya-aadad`.
>
> **2026-11-19: lesson 6 (`bahth-pgcd`) too** — v2, its mission player, its scene `sewing-workshop` and its module pages
> deleted (`OLD_VERSION_TRACE_2026-11-18.md` §13); its row and section below are history. The unit's lessons still on the
> mission player: `awwaliyan-fima-baynahuma`, `ikhtizal-kasr` and the synthesis `wadiya-idmajiya-aadad`.

## The table

| # | Lesson (unit 1) | Labs converted | Status | Commit | Notes |
|---|---|---|---|---|---|
| 1 | `qasim-adad-tabii` (pilot) | `team-builder` | ✅ validated 2026-11-08 | (pilot stages) | The reference implementation. |
| 2 | `qawasim-adad-tabii` | `factor-pairs` (v2 treatment, new) | ✅ done 2026-11-08 | `feat(lessons): qawasim-adad-tabii — mission prototype` | See « Lesson 2 » below. |
| 3 | `khawass-qawasim` | `divisor-properties` (v2 treatment, new) | ✅ done 2026-11-08 | `feat(lessons): khawass-qawasim — mission prototype` | See « Lesson 3 » below. |
| 4 | `qasim-mushtarak-akbar` | `common-divisors` (v2 treatment, new) | ✅ done 2026-11-08 | `feat(lessons): qasim-mushtarak-akbar — mission prototype` | See « Lesson 4 » below. |
| 5 | `tayin-pgcd` | `common-divisors` (already converted) | ✅ done 2026-11-08 | `feat(lessons): tayin-pgcd — mission prototype` | See « Lesson 5 » below. |
| 6 | `bahth-pgcd` | `pgcd-differences`, `euclidean-algorithm` (v2 treatment, new) | ✅ done 2026-11-09 | `feat(lessons): bahth-pgcd — mission prototype` | Also the BEM exam-sheet prototype lesson (practice untouched). See « Lesson 6 » below. |
| 7 | `ikhtizal-kasr` | `fraction-reduction` (v2 treatment, new) | ✅ done 2026-11-09 | `feat(lessons): ikhtizal-kasr — mission prototype` | See « Lesson 7 » below. |
| 8 | `awwaliyan-fima-baynahuma` | `coprime-explorer` (v2 treatment, new) | ✅ done 2026-11-09 | `feat(lessons): awwaliyan-fima-baynahuma — mission prototype` | See « Lesson 8 » below. |
| 9 | `wadiya-idmajiya-aadad` | `common-divisors` + `euclidean-algorithm` (player rounds; Euclid gains the additive `share` chain) | ✅ done 2026-11-12 | `feat(lessons): wadiya-idmajiya-aadad — mission prototype (synthesis)` | The THIRD synthesis in the player; see « Unit 1, synthesis » below. |

Catalogue order: `packages/core/curriculum/dz/lessons_4am_2026_2027.json`. Unit 2 is converted with its synthesis (2026-11-12); unit 9 is converted with its synthesis (the synthesis pilot); unit 3 (three lessons) and unit 4 « معادلات ومتراجحات » (four lessons, 2026-11-11, branch `integrate-unit4`) are converted, their syntheses waiting for the synthesis-recipe answer; unit 5 « جمل معادلتين » (three lessons, 2026-11-12, branch `integrate-unit5`) is converted WITH its synthesis (the provisional recipe) (owner decision 2026-11-12); on the same day the owner said « go ahead » for units 1–4's syntheses — all four are converted (units 1, 2, 3, 4, 2026-11-12); units 6–8 and 10–14 are not started. The full prompt for unit 2 « الحساب على الجذور » (every rule, check and review step of unit 1): `docs/reports/UNIT2_HISAB_JUDHUR_MISSION_PROMPT.md`. The next prompt, unit 9 « خاصية طالس » (unit 2's recipe plus every review lesson of unit 2): `docs/reports/UNIT9_KHASSIYAT_TALIS_MISSION_PROMPT.md`. Unit 1's synthesis `wadiya-idmajiya-aadad` is converted (2026-11-12, owner go-ahead for units 1–4).

## Unit 2 « الحساب على الجذور » — the table

Prompt for the whole unit: `UNIT2_HISAB_JUDHUR_MISSION_PROMPT.md`. Folder `lessons/moyen/4am/ansab_al_aadad_wal_hisab/hisab-judhur/`.

| # | Lesson (unit 2) | Labs converted | Status | Commit | Notes |
|---|---|---|---|---|---|
| 1 | `jidhr-tarbii` | `square-root-side` (v2 treatment, new, both modes) | ✅ done 2026-11-09 | `feat(lessons): jidhr-tarbii — mission prototype` | See « Unit 2, lesson 1 » below. |
| 2 | `natiqa-ghayr-natiqa` | `square-root-side` (graduation mode; `truthful` « resists », compact rule, plain journal) | ✅ done 2026-11-09 | `feat(lessons): natiqa-ghayr-natiqa — mission prototype` | See « Unit 2, lesson 2 » below. |
| 3 | `muadalat-x-murabba` | `square-fold` (v2 treatment + LabCoach, new; exact-only pin in the player) | ✅ done 2026-11-10 | `feat(lessons): muadalat-x-murabba — mission prototype` | See « Unit 2, lesson 3 » below. |
| 4 | `amaliyat-judhur` | `square-tiling` (v2 treatment + LabCoach, new; both modes `product` and `simplest`) | ✅ done 2026-11-10 | `feat(lessons): amaliyat-judhur — mission prototype` | See « Unit 2, lesson 4 » below. |
| 5 | `tawzif-khawass-judhur` | `square-tiling` (`simplest`: content, plus `predictAlso`, `avoid`, the chains `buildS` / `bestS`) | ✅ done 2026-11-10 | `feat(lessons): tawzif-khawass-judhur — mission prototype` | See « Unit 2, lesson 5 » below. |
| S | `wadiya-idmajiya-judhur` | `square-fold` + `square-tiling` (player rounds, existing chains `build` and `fullS`; no shared code change) | ✅ done 2026-11-12 | `feat(lessons): wadiya-idmajiya-judhur — mission prototype (synthesis)` | The FOURTH synthesis in the player; see « Unit 2, synthesis » below. |

## Unit 9 « خاصية طالس » — the table

Prompt for the whole unit: `UNIT9_KHASSIYAT_TALIS_MISSION_PROMPT.md`; the council of 2026-11-10 (5 advisors, 5 anonymous reviews, chairman) decided
every lab of the unit at once (verdict « Cross-lesson », « L1 », « L2 », « L3 »). Work order L2 → L3 → L1. Folder
`lessons/moyen/4am/handasa/khassiyat-talis/`.

| # | Lesson (unit 9) | Labs converted | Status | Commit | Notes |
|---|---|---|---|---|---|
| 1 | `talis-hisab-atwal` | `shadow-meet` (a NEW one-lane player lab — verdict L1.1 = C; `shadow-world` stays the page and teacher lab, untouched) | ✅ done 2026-11-10 | `feat(lessons): talis-hisab-atwal — mission prototype` | See « Unit 9, lesson 1 » below. |
| 2 | `aksiya-talis` | `parallel-level` (v2 treatment + LabCoach, new; « ضع الميزان ») | ✅ done 2026-11-10 | `feat(lessons): aksiya-talis — mission prototype` | See « Unit 9, lesson 2 » below. |
| 3 | `inshaat-talis` | `segment-divider` (v2 treatment + LabCoach, new; both modes `equal` and `ratio`, `sameUnitOnly`, the cap) | ✅ done 2026-11-10 | `feat(lessons): inshaat-talis — mission prototype` | See « Unit 9, lesson 3 » below. |
| S | `wadiya-idmajiya-talis` | `cone-cylinder` (player version, new — `ConeCylinderPlayer.jsx`) + `shadow-meet` (`hideHeight`, chain `why`) in ONE `LabRounds` of module 7; the page keeps `shadow-world` + `cone-cylinder` | ✅ built 2026-11-10 — the FIRST synthesis converted, pilot of the synthesis recipe (not committed: left to the owner) | | See « Unit 9, synthesis » and « The synthesis recipe » below. |

## Unit 3 « الحساب الحرفي » — the table

Prompt for the whole unit: `UNIT3_HISAB_HARFI_MISSION_PROMPT.md`; the council of 2026-11-11 decided every lab of the unit at once (verdict
« Cross-lesson », « L1 », « L2 », « L3 »). Lessons 1 and 3 built in parallel on the shared kit `lessons/common/mission/pitchSceneKit.jsx`; lesson 2
after lesson 1. Folder `lessons/moyen/4am/ansab_al_aadad_wal_hisab/hisab-harfi/`.

| # | Lesson (unit 3) | Labs converted | Status | Commit | Notes |
|---|---|---|---|---|---|
| 1 | `nashr-tabsit` | `pitch-expansion` (v2 treatment + its FIRST LabCoach, player only; `labels: 'area'`, collision-free ruler) | ✅ done 2026-11-11 | `feat(lessons): nashr-tabsit — mission prototype` | See « Unit 3, lesson 1 » below. |
| 2 | `mutatabiqat-shahira` | `pitch-expansion` (lesson 2's square fields added: chains `square` / `squareDiff` / `sumDiff` / `coef`, identity build in letters, « 0 » chip; LabCoach player only) | ✅ built 2026-11-11 | `feat(lessons): mutatabiqat-shahira — mission prototype` | See « Unit 3, lesson 2 » below. |
| 3 | `tahlil-ibara` | `turf-factoring` (v2 treatment + LabCoach, new; both modes `rows` and `square`) | ✅ built 2026-11-11 | `feat(lessons): tahlil-ibara — mission prototype` | See « Unit 3, lesson 3 » below. |
| S | `wadiya-idmajiya-harfi` | `pitch-expansion` (player rounds on the fountain path « x+7+x »; additive chains `ring` / `ringTerms`) | ✅ done 2026-11-12 | `feat(lessons): wadiya-idmajiya-harfi — mission prototype (synthesis)` | The FIFTH synthesis in the player; see « Unit 3, synthesis » below. |

## Unit 4 « معادلات ومتراجحات » — the table

Prompt for the whole unit: `UNIT4_MUADALAT_MUTARAJIHAT_MISSION_PROMPT.md`; the council of 2026-11-11 (4 designers, 5 advisors, 5 anonymous peer
reviews, chairman) decided the unit's four labs at once (verdict « Cross-lesson » X1–X5, « L1 » … « L4 », the 15 gaps). Four builders IN PARALLEL,
one worktree each, on a « commit 0 » of the integrator (`chore(lessons): unit 4 mission scaffolding`: the four scene stubs registered in
`MissionScene.jsx`, empty `player` / `coach` / `predict` keys per lab in `lesson.manipulation.json`, `_unit/forbiddenShared.js` and the
`_unit/missionStrings.test.js` skeleton reading `_unit/signatures/<lesson>.js`); merged L1 → L3 → L2 → L4 on `integrate-unit4`. Folder
`lessons/moyen/4am/ansab_al_aadad_wal_hisab/muadalat-mutarajihat/`. Names cast for the whole unit (X3, enforced by `_unit/missionStrings.test.js`):
أيوب · خديجة · نسيم · كوثر · حاتم · بسّام · هدى · عماد · لقمان · شيماء.

| # | Lesson (unit 4) | Labs converted | Status | Commit | Notes |
|---|---|---|---|---|---|
| 1 | `muadala-ula` | `equation-balance` (a PLAYER VERSION `EquationBalancePlayer.jsx` chosen by `EquationBalance.jsx` in the player + its FIRST LabCoach, player only; quantity chips 1–4) | ✅ built 2026-11-11 | `feat(lessons): muadala-ula — mission prototype` | See « Unit 4, lesson 1 » below. |
| 2 | `jidaa-maadum` | `vanishing-pitch` (v2 treatment + its FIRST LabCoach, player only; the COVERED pitch as a required round; the « أو » text tile) | ✅ built 2026-11-11 | `feat(lessons): jidaa-maadum — mission prototype` | See « Unit 4, lesson 2 » below. |
| 3 | `mutarajiha-ula` | `solution-ray` (v2 treatment + its FIRST LabCoach, player only; the verdict masked while dragging; two-case rounds; the division built with tiles) | ✅ built 2026-11-11 | `feat(lessons): mutarajiha-ula — mission prototype` | See « Unit 4, lesson 3 » below. |
| 4 | `tarrid-mushkila` | `growth-race` (v2 treatment + its FIRST LabCoach, player only; the model check `tk:'model'`; `decor="board"`, KidFigure cast) | ✅ built 2026-11-11 | `feat(lessons): tarrid-mushkila — mission prototype` | See « Unit 4, lesson 4 » below. |
| S | `wadiya-idmajiya-muadalat` | `growth-race` (player rounds on two sibling TARIFFS « ax » vs « f + bx »; additive chains `pool` / `poolSaving` (+ easy)) | ✅ done 2026-11-12 | `feat(lessons): wadiya-idmajiya-muadalat — mission prototype (synthesis)` | The SIXTH synthesis in the player; see « Unit 4, synthesis » below. Its `lab.render.test.jsx` was updated ON PURPOSE (the page no longer shows the 🏆's tariffs). |

## Unit 5 « جمل معادلتين » — the table

Prompt for the whole unit: `UNIT5_JUMAL_MUADALATAYN_MISSION_PROMPT.md`; the council of 2026-11-11 (3 designers, 5 advisors, 5 anonymous peer
reviews, chairman) decided the unit's three labs at once. Its BINDING decisions, in short:
- **Cast (X1, `_unit/missionStrings.test.js`):** peers صهيب (L1, `m2-suhayb`) · أسامة (L2, `m2-usama`) · وئام (L3, `m2-wiam`); إكرام and إسحاق (L2
  module 1 only); ملاك reserved for the unit page; the climax names (الطاهر, ياسين, أنيس) nowhere else; stories in rounds are nameless.
- **Collision rule (X3–X4, `_unit/unitCollisions.test.js`):** K1 no system twice in the unit (canonical form) · K2 headline pairs (required, ⭐,
  checkpoint, peer) all distinct as ORDERED pairs · K3 no easier / free / prep solution equals a headline pair · a forward ban against the climax
  lists of the lessons at or after a lesson, the synthesis (`SYNTH`) and the unit page's reserved challenge (23 boxes, 5 kg / 2 kg, 82 kg →
  (12 ; 11)). Each lesson's `_unit/signatures/<lesson>.js` exports `TEXT` / `UNIT` / `SYSTEMS` (contract in its `README.md`); until it does, the
  test reads the lesson's row of the verdict's registry. Seven systems were replaced to obey it.
- **Rule P (X11, L2):** before module 4 nothing the lesson WRITES shows a minus before a bracket; every required round has a « plus path ».
- **Code shape (X7):** each lab gets `systems/<Lab>Player.jsx` + `logic/<lab>Player.js`; the lab file becomes a ≤ 10-line dispatcher; the page
  component, its logic and render tests are untouched; the synthesis's `story-modeller` render is frozen (`wadiya-idmajiya-jumal/lab.snapshot.test.jsx`).
- **The three labs:** `pair-scoreboard` (gauges masked while dragging, the covered round required, the swap met once by the hand), `elimination-cards`
  (riddle cards on a plain strip, the HOOK moved after the climax, `build-sub` / `build-add`), `story-modeller` (two required M1 rounds — count +
  money, money + money with a silent useless chip —, the refused story `p1` in module 2, the `BuildAnswer` wide text slot). One adult (L3's scene).
- Commit 0 also adds `_unit/abuKamil.js` (the verified history line) and makes `_unit/prepDiagnostic.test.js` `PREP_LADDER`-tolerant.

| # | Lesson (unit 5) | Labs converted | Status | Commit | Notes |
|---|---|---|---|---|---|
| 1 | `mafhum-jumla` | `pair-scoreboard` (a PLAYER VERSION `systems/PairScoreboardPlayer.jsx` behind a 4-line dispatcher + its FIRST LabCoach, player only; gauges masked while dragging; the covered round required; module 2's special-case rounds `lab-pair-m2`, owner OQ1) | ✅ built 2026-11-12 | `feat(lessons): mafhum-jumla — mission prototype` | Scene `civil-registry`. See « Unit 5, lesson 1 » below. |
| 2 | `hall-jabri` | `elimination-cards` (a PLAYER VERSION `systems/EliminationCardsPlayer.jsx` behind a 4-line dispatcher + its FIRST LabCoach, player only; a trial = a gesture that WRITES a new line or a counted refusal; BUILD decoy by the student's PATH, rule P) | ✅ built 2026-11-12 | `feat(lessons): hall-jabri — mission prototype` | Scene `kiosk-cards`. See « Unit 5, lesson 2 » below. |
| 3 | `mushkilat-jumla` | `story-modeller` (a PLAYER VERSION `systems/StoryModellerPlayer.jsx` behind a 4-line dispatcher + its FIRST LabCoach, player only; five stages, objects drawn in trays, the refused story `p1`) | ✅ built 2026-11-12 | `feat(lessons): mushkilat-jumla — mission prototype` | Scene `museum-desk`. See « Unit 5, lesson 3 » below. |
| S | `wadiya-idmajiya-jumal` | `story-modeller` (player rounds, chains `synthTrip` / `synthParty`) | ✅ built 2026-11-12 (owner decision OQ4, provisional synthesis recipe) | `feat(lessons): wadiya-idmajiya-jumal — mission prototype (synthesis)` | Scene `party-table`; see « Unit 5, synthesis » below. Its lab render is frozen by `lab.render.test.jsx` and `lab.snapshot.test.jsx`; the page string « جدول الكتاب » of `story-modeller` is rewritten with it (OQ5). |

## Lab families — which have the v2 treatment

| Lab (`type`) | v2 treatment | First converted in |
|---|---|---|
| `team-builder` | ✅ (pilot) | `qasim-adad-tabii` |
| `factor-pairs` | ✅ (2026-11-08) | `qawasim-adad-tabii` |
| `divisor-properties` | ✅ (2026-11-08) | `khawass-qawasim` |
| `common-divisors` | ✅ (2026-11-08) | `qasim-mushtarak-akbar` |
| `pgcd-differences` | ✅ (2026-11-09) | `bahth-pgcd` |
| `euclidean-algorithm` | ✅ (2026-11-09) | `bahth-pgcd` |
| `fraction-reduction` | ✅ (2026-11-09) | `ikhtizal-kasr` |
| `coprime-explorer` | ✅ (2026-11-09) | `awwaliyan-fima-baynahuma` |
| `square-root-side` | ✅ (2026-11-09, both modes `refine` and `graduation`) | `jidhr-tarbii` (unit 2) |
| `square-fold` | ✅ (2026-11-10) | `muadalat-x-murabba` (unit 2) |
| `square-tiling` | ✅ (2026-11-10, both modes `product` and `simplest`) | `amaliyat-judhur` (unit 2) |
| `parallel-level` | ✅ (2026-11-10, both modes `ladder` and `crossing`, with or without an imposed ratio) | `aksiya-talis` (unit 9) |
| `segment-divider` | ✅ (2026-11-10, both modes `equal` and `ratio`; `sameUnitOnly`, 3 graduations per rail) | `inshaat-talis` (unit 9) |
| `shadow-meet` | ✅ (2026-11-10, born in the player: tasks `meet`, `ratio`, `flag`; asks `tap` and `type`; reusable through `steps`) | `talis-hisab-atwal` (unit 9) |
| `pitch-expansion` | ✅ (2026-11-11, `labels` 'area' / 'terms', chains `dist` / `double` / `restored` / `result` + practice chains; lesson 2: `square` / `squareDiff` / `sumDiff` / `coef` + practice chains, `identityBuild` in letters with the a / b relabel, predictions `claim` / `twice` / `noX`, the « 0 » chip) | `nashr-tabsit`, `mutatabiqat-shahira` (unit 3) |
| `cone-cylinder` | ✅ (2026-11-10, a PLAYER VERSION `ConeCylinderPlayer.jsx` chosen by `ConeCylinder.jsx` in the player: one trial = one press, `n` explicit, `lockH` / `lockR`, no number / volume / point letter in a verdict; the page lab is unchanged) | `wadiya-idmajiya-talis` (unit 9, synthesis) |
| `turf-factoring` | ✅ (2026-11-11, both modes `rows` and `square`; a trial = a NEW r or a NEW split, r = 1 is not one; the sweep hidden; `wrap` builds) | `tahlil-ibara` (unit 3) |
| `equation-balance` | ✅ (2026-11-11, a PLAYER VERSION `EquationBalancePlayer.jsx`; a trial = a NEW equation written or a refused gesture; quantity chips 1–4; chains `r1` / `r2` / `r3` / `m2r1` / `m2r2`) | `muadala-ula` (unit 4) |
| `vanishing-pitch` | ✅ (2026-11-11, a trial = a NEW pin or « لا قيم أخرى » while a zero is missing; `covered`, `freeRefusal`; chains `build` / `rule` / `count`; the « أو » text tile) | `jidaa-maadum` (unit 4) |
| `solution-ray` | ✅ (2026-11-11, the verdict masked while dragging; `sequence` two-case rounds; `divide: 'coef'` built with tiles; `sides`, `start`) | `mutarajiha-ula` (unit 4) |
| `growth-race` | ✅ (2026-11-11, a model check is `tk:'model'`, never a trial of x; one new x = one verdict; `decor="board"`, `cast` of KidFigure people; `freeFirstModel`) | `tarrid-mushkila` (unit 4) |
| `pair-scoreboard` | ✅ (2026-11-12, a PLAYER VERSION `PairScoreboardPlayer.jsx`; gauges masked while dragging, read on a commit; a trial = a NEW committed pair, the pairs a goal requires are `free`; `covered`; `readings` values / lines; chains `season` / `coins` / `covered` / `never` / `always`; the ruler reads its track at gesture time) | `mafhum-jumla` (unit 5) |
| `elimination-cards` | ✅ (2026-11-12, a PLAYER VERSION `EliminationCardsPlayer.jsx`; `methods` 1 / 2; a trial = a gesture that writes a NEW line or a counted refusal; chains `r1` / `r2` / `r3` with `build-sub` / `build-add`; BUILD decoy by path, `buildSpec`; cards stacked) | `hall-jabri` (unit 5) |
| `story-modeller` | ✅ (2026-11-12, a PLAYER VERSION `StoryModellerPlayer.jsx`; five stages, `items` drawn as trays, a model check `tk:'model'`, the silent useless chip, chains `first` / `second` / `impossible` …; props general so the synthesis can reuse it) | `mushkilat-jumla` (unit 5) |
| every other lab | ⏳ | — |

## Lesson 2 — `qawasim-adad-tabii` « قواسم عدد طبيعي » (2026-11-08)

**What was written (per lesson):** `lesson.config.js` (`studentView: 'mission'`, `mission` with scene `library-wall`, 4 tools = the 4
knowledge items, climax = module 4 « جدار المكتبة: 96 كتابًا », 3 checkpoints on 30 / 50 / n — never 96, `knowledgeMapOpen`) ·
`content/prep.js` + `prep.test.js` (10 « أستعدّ » questions, easy → hard, `qasim-adad-tabii` and `qawaid-qabiliyat-qisma` to revise) ·
`content/books.js` (rounds: module 1 = 24 → 60 → 48 → ⭐ 36 → free; module 2 = 105 → ⭐ 84 → free; `easier` practice rounds) ·
`content/peerSheet.js` + test (« ورقة ريما »: tested numbers only, partners forgotten — 84 → 12 divisors) · modules 0, 1, 2 wired
(`PlayerSwitch` + `LabRounds`, `needsRound`). The « رتّب أفكارك » step does not exist in this lesson (nothing to drop); modules
3–7 needed no change (kit modules).

**What was added to the shared code:**
- `factor-pairs` v2 treatment (`FactorPairs.jsx`): prediction (≤ 2 per round, rectangle veiled), observe (`fill`) → build (`build`),
  trials table + pairs inside the lab, scene sized from `useMissionArea`, controls frozen during a question, `handDone`, `chains`,
  `predict`, `nChoices`, `levels={false}`, always guided in the player.
- `roundsModel`: goals `{ anyExact }`, `{ allPairs: n }` (tested). `LabRounds`: `icon`, `freeIcon`, `round.easier.helpLine`.
- `ContentModule`: `needsRound.icon`, `needsRound.won` (door and soft gate stop once the round is won).
- `primitives/PredictTray.jsx` (extracted from `TeamBuilder`, which now imports it).
- `mission/MissionScene.jsx` registry + `LibraryWallScene.jsx` (`mission.scene`); `MissionHome`, `MissionCheckpoint`, `MissionLayer`.
- `logic/factorPairs.rectangleLayout({ maxCell })`.

**Traps met (add to the plan's §7):**
- The player mounts a lab in a hidden measuring copy: a lab that sizes itself with a `ResizeObserver` keeps the hidden copy's width
  (200 px ruler, 160 px frame). Re-measure on every render as well (`FactorPairs`).
- A step that holds a round AND its question cannot declare `needsRound` alone: the door stays until the question is answered →
  `needsRound.won`.
- A lab played with `checkpoints: false` is not « guided » → the page's progress bar, hint buttons and « ماذا لاحظت؟ » card appear in
  the player (practice and free rounds). In the player a lab is always guided.
- The answers service returns `{ success, answers }` (not `data.answers`): a mocked server must match, or « restore after reload » looks broken.
- Never `rm` helper scripts created inside the repo from a shell with a heredoc: run the Playwright scripts from the scratchpad and import
  `playwright` with `createRequire('<repo>/apps/web/package.json')`.

**Verification:** `npx vitest run src/lessons` 601 files / 11 760 tests green (+ the new tests) · `npm run check:lessons` exit 0 (entry
239.0 KB gzip ≤ 245) · `lab-rollout-status --lesson qawasim-adad-tabii` ✅ · Playwright walk with a mocked student session at 1366×768,
1024×768 and 1920×1080: opening scene → « أستعدّ » (notice, 10 questions, signal, auto result, one priority lesson) → module 1 rounds
(r1 by hand with prediction + observe + build → ★★★ → « عُد إلى السؤال »; r2 with predictions, journal, pairs, « جرّب كل الإمكانيات »;
second chance after 2 wrong predictions and its return; challenge 36; free pitch) → module 2 (round 105 → stopping-rule questions;
fresh « أتوقّع القاعدة »; peer sheet: wrong line, fix, restore after reload from the server) → modules 3–6 unit by unit (0
`data-fit-overflow`, 0 page scroll) → final test (notice, 6 questions, result, profile) → knowledge map (full window, finger) → mission
home and path (real locks, practice station). Teacher view (`role: teacher`) and Classroom Mode: unchanged (no player, no rounds).

**Open on this lesson:** the Playwright e2e specs that exercise this lesson's old student view (`apps/web/e2e/lesson-kit/4am-aadad-tabiiya-natiqa.mjs`,
`manipulations.mjs`, `lab-coach.mjs`, `moyen-retrofit-phase1.mjs`, `predict-lesson.mjs`, `masail-lesson.mjs`, `knowledge-map.mjs`,
`progression.mjs`, `notebook-lesson.mjs`) are not rewritten (plan §9.7). `resources` in the config still describe the two-level labs for the
teacher's page. A phone layout is not built (laptop and tablet only).

## Lesson 3 — `khawass-qawasim` « خواص قواسم عدد طبيعي » (2026-11-08)

**What was written (per lesson):** `lesson.config.js` (`studentView: 'mission'`, `mission` with the new scene `construction-wall`, 4 tools =
`qasim-mushtarak-rappel`, `khassiya-1`, `khassiya-2`, `burhan-idha-fainna`, climax = module 5 « ورشة البناء: جداران بطوب 25 سم », 4 checkpoints that
speak of 6, 7, 30, 50 and n — never of the brick of 25 or the walls of 875 / 350, open knowledge map) · `content/prep.js` + `prep.test.js` (10
« أستعدّ » questions, easy → hard, `qasim-adad-tabii` and `qisma-iqlidiya-baqi` to revise) · `content/walls.js` + `walls.test.js` (rounds: 3 | 18 and 12
by hand with its questions → cases 2 and 3 of the activity in ONE round (`sequence`) → 9 | 900 and 90 → ⭐ 12 | 480 and 84 → free pitch with 7 case chips;
`easier` practice rounds) · `content/peerSheet.js` + test (« ورقة هند »: the converse of the property — 6 divides 48 = 40 + 8, so « 6 divides 40 and 8 ») ·
modules 0, 1, 2 wired. Modules 3–8 needed no change (kit modules).

**What was added to the shared code:**
- `divisor-properties` v2 treatment (`DivisorProperties.jsx`): props `onVerdict` (groups 1 = ألصق · 2 = انزع · 3 = قِس, +3 per case of a `sequence`),
  `levels`, `handDone` (each zone of the site becomes a button), `chains` (`['sum','diff','rem']`), `predict` (the shared `PredictTray`, « طوب كامل ؟ »
  before each wall), `choices` (free pitch), `sequence` (cases played one after the other inside one round); `CHAINS_PLAYER` = observe (`fill`) → « whole »
  question for the sum and the difference, observe → BUILD `a = b × k + r` (`build`) → rule for the remainder; the walls' labels `a = n × q` and the written results
  hide while a question is open; the journal « 📋 جدول تجاربك » (operation · length · whole bricks ✓) sits in the lab; controls freeze during a question;
  always guided in the player; no « كل المهام » celebration when the stepper is hidden.
- `mission/ConstructionWallScene.jsx` registered as `mission.scene: 'construction-wall'` (brick courses laid as tools are earned, a `KidFigure` apprentice).

**Traps met (add to the plan's §7):**
- A round without a `sequence` must report `groups` 1–3, not `seqIdx × 3 + …` with `seqIdx = −1` (verdicts were −2, −1, 0 and the round could never be won: the
  « جرّب أصغر » practice round never ended). Use `Math.max(seqIdx, 0)`; test every round type by playing it, not only the first.
- A heredoc-written patch with long Arabic text was refused twice by the shell safety check (it « could not be checked for dangerous rm »): write patch scripts
  and new files with the file tool, run them with `python3 <path>`.

**Verification:** `vitest run src/lessons` green (new: `prep.test`, `walls.test`, `peerSheet.test`, `divisorPropertiesPlayer.test`), `check:lessons` exit 0,
`lab-rollout-status --lesson khawass-qawasim` ✅, Playwright walk with a mocked student session at 1366×768, 1024×768 and 1920×1080: opening scene and home
(2 lessons to revise, real locks) → « أستعدّ » (10 questions, result) → round 1 by hand (observe, whole, observe, whole, observe, build, rule → ★★★ →
« عُد إلى السؤال ») → round 2 (« الحالة 1 من 2 » → 2, predictions, buttons, journal) → round 3 → second chance after 2 wrong predictions and its return → free pitch →
modules 1–7 unit by unit (0 `data-fit-overflow`, 0 page scroll) → peer sheet (wrong line, wrong fix, fix, restore after reload from the server) → final test
(5 questions, result, profile) → knowledge map → teacher view unchanged (no player, no rounds) and Classroom Mode unchanged.

**Open on this lesson:** the e2e specs that exercise its old student view are not rewritten (plan §9.7); `resources` in the config still describe the two-level labs
for the teacher's page.

## Lesson 4 — `qasim-mushtarak-akbar` « القاسم المشترك الأكبر لعددين طبيعيين » (2026-11-08)

**What was written (per lesson):** `lesson.config.js` (`studentView: 'mission'`, `mission` with the new scene `flower-shop`, 4 tools =
`qawasim-mushtaraka`, `pgcd-taarif`, `pgcd-ramz`, `qawasim-al-pgcd`, climax = module 4 « بائع الورود: 120 وردة حمراء و 84 وردة بيضاء », 3 checkpoints that
speak of 20, 30 and 10 — never of 120, 84 or their PGCD, open knowledge map) · `content/prep.js` + `prep.test.js` (10 « أستعدّ » questions, easy → hard,
« d يقسم n » and « كل قواسم عدد », `qasim-adad-tabii` and `qawasim-adad-tabii` to revise) · `content/bouquets.js` + `bouquets.test.js` (module 1: 12 balls and
18 shirts by hand with its questions → the activity's 90 red and 54 white flowers with predictions → the LISTS of 90 and 54 → ⭐ 60 and 45 → free shop with 6
pairs; module 2: the lists of 28 and 42 → ⭐ 45 and 75 → free lists; `easier` practice rounds; no pair has 12 as PGCD) · `content/peerSheet.js` + test
(« ورقة سلمى »: an incomplete list of the divisors of 30 — the partners 10 and 15 forgotten — gives PGCD(30 ; 45) = 5 instead of 15) · modules 0, 1, 2 wired
(module 2 gains step 5, the peer sheet). Modules 3–7 needed no change (kit modules).

**What was added to the shared code:**
- `common-divisors` v2 treatment (`CommonDivisors.jsx`): props `onVerdict` (each number of groups TRIED once, `{ groups: k, exact }`; in the lists, the PGCD
  placed is the verdict), `levels`, `handDone` (opens « جرّب كل الإمكانيات »), `chains` (`['groups', 'lists']`), `predict` (the shared `PredictTray` « هل يتوزّع
  الكل ؟ » before a NEW number of groups k ≥ 2, ≤ 2 per round), `choices` (pairs `{ a, b }` for the free shop); in the player a round is ONE stage (groups OR
  lists, `startWith`); `CHAINS_PLAYER` = groups: observe (`fill`: the greatest, per group of each item) → BUILD `a = k × q` (`build`, one extra tile) → beyond
  (`fill`) → rule; lists: count (`fill`) → why → rule; the journal « 📋 جدول تجاربك » (k · what is left of each item) in the lab's column; while a question is
  open the scene shows the distribution THE QUESTION is about (the greatest, then the first number beyond), not the last try, and its written per-group
  label is quiet; controls frozen during a prediction or a question; always guided; no celebration when the stepper is hidden.
- `useLabCheckpoint` returns `qid` (the question on screen) — a lab can show the scene a question speaks of.
- `roundsModel`: goal `{ above: g }` (a number of groups larger than g tried) — with `{ exact: g }` it is « the greatest is SEEN » (tested).
- `mission/FlowerShopScene.jsx` registered as `mission.scene: 'flower-shop'` (identical bouquets appear on the counter as tools are earned, two buckets
  empty, a `KidFigure` florist in hijab).

**Traps met (add to the plan's §7):**
- A question about « the greatest that worked » must not sit beside the LAST try (7 teams, 9 items left): the scene follows the question (`cp.qid`).
- A component that calls `t()` must declare `useTranslation` itself (`i18nHookScope.test.js`); passing `t` as a prop fails the suite.
- Playwright: a tap-carry onto a drop zone must click an EMPTY part of the zone — its centre may be a token, which selects that token instead of dropping.
- `vite build` with default node memory aborts on this repo; `check:lessons` builds with its own settings.

**Verification:** `vitest run src/lessons` green (new: `prep.test`, `bouquets.test`, `peerSheet.test`, `commonDivisorsPlayer.test`, `roundsModel` « above »),
`check:lessons` exit 0, `lab-rollout-status --lesson qasim-mushtarak-akbar` ✅, Playwright walk with a mocked student session at 1366×768, 1024×768 and
1920×1080: opening scene and home (1 lesson to revise, real locks) → « أستعدّ » (10 questions, review) → round 1 by hand (7 teams, observe 6 · 2 · 3, build
12 = 6 × 2, beyond 5, rule → ★★★) → round 2 (predictions right, 19 bouquets one by one ★★★, or « جرّب كل الإمكانيات » ★★) → second chance after 2 wrong
predictions (8 and 12) and its return → round 3 lists (6 commons, PGCD 18, 3 questions, ★★★, « عُد إلى السؤال ») → free shop (pairs, try all, journal) →
formative checkpoint after module 1 → module 2 lists round → peer sheet (wrong line, wrong fix, fix, restore after reload from the server) → modules 1–6 unit
by unit (0 `data-fit-overflow`, 0 page scroll) → final test (5 questions, result, profile) → knowledge map → teacher view unchanged (levels, no player, no
rounds) and Classroom Mode unchanged.

**Open on this lesson:** the e2e specs that exercise its old student view are not rewritten (plan §9.7); `resources` in the config still describe the two-level
labs for the teacher's page.

## Lesson 5 — `tayin-pgcd` « تعيين القاسم المشترك الأكبر لعددين طبيعيين » (2026-11-08)

**The first lesson whose lab family was ALREADY converted** (`common-divisors`, lesson 4): no shared lab code changed — only content and wiring.

**What was written (per lesson):** `lesson.config.js` (`studentView: 'mission'`, `mission` with the new scene `school-bags`, 3 tools = `tayin-bil-hasr`,
`nataij-mubashira`, `pgcd-idha-qasim` (label « أحدهما يقسم الآخر » — no Latin letters in a tool label, they reorder in RTL), climax = module 4 « حقائب
التضامن: 90 قلمًا و 126 كرّاسًا », 3 checkpoints on 12 / 20, 45 / 15 and the plan — never 90, 126 or 18, open knowledge map) · `content/prep.js` + test (10
« أستعدّ » questions: « كل قواسم عدد » and « PGCD », `qawasim-adad-tabii` and `qasim-mushtarak-akbar` to revise) · `content/bags.js` + test (8 pens and 12
notebooks by hand → 20 and 30 with predictions → the LISTS of 42 and 60 (the activity) → ⭐ 48 and 72 → free lists; `easier` rounds) · `content/peerSheet.js` +
test (« ورقة ياسين »: « PGCD(36 ; 9) = 36, the larger number » — fixed by « b divides a ⇒ PGCD(a ; b) = b ») · module 0 (ladder), module 1 (`PlayerSwitch` +
`LabRounds`, step 1 ← round 1, step 2 ← round 3), module 2 (no lab: the peer sheet becomes step 3). Modules 3–7 needed no change.

**Shared code:** `mission/SchoolBagsScene.jsx` registered as `mission.scene: 'school-bags'` (identical school bags fill on a table as tools are earned,
a `KidFigure` volunteer). Nothing else.

**Verification:** `vitest run src/lessons` green, `check:lessons` exit 0, `lab-rollout-status --lesson tayin-pgcd` ✅, Playwright walk with a mocked student
session at 1366×768, 1024×768 and 1920×1080: home (1 lesson to revise, real locks) → « أستعدّ » (10 questions, review) → round 1 by hand (observe 4 · 2 · 3,
build 8 = 4 × 2, beyond 3, rule → ★★★) → round 2 (predictions, 11 bags one by one → ★★★) → round 3 lists of 42 and 60 (4 commons, PGCD 6, 3 questions → ★★★,
« عُد إلى السؤال ») → peer sheet (wrong line, wrong fix, fix, restore after reload) → modules 1–6 unit by unit (0 `data-fit-overflow`, 0 page scroll) → final test
(4 questions, result, profile) → knowledge map → teacher view and Classroom Mode unchanged.

**Open on this lesson:** e2e specs of the old student view (plan §9.7); `resources` still describe the two-level labs for the teacher's page.

## Lesson 6 — `bahth-pgcd` « البحث عن القاسم المشترك الأكبر لعددين » (2026-11-09)

**Two labs converted at once** — `pgcd-differences` (module 1) and `euclidean-algorithm` (module 3) share one shape (a chain of steps, then the PGCD
placed), so they got the same v2 treatment.

**What was written (per lesson):** `lesson.config.js` (`studentView: 'mission'`, `mission` with the new scene `sewing-workshop`, 5 tools = `pgcd-farq`,
`khwarizmiyat-al-furuq`, `pgcd-baqi`, `khwarizmiyat-iqlidus`, `ikhtiyar-al-tariqa`, climax = module 5 « ورشة الخياطة: شريطان من 210 سم و 150 سم », 4
checkpoints on 35 / 20, 27 / 12, 49 / 14 and the plan — never 210, 150 or 30, open knowledge map) · `content/prep.js` + test (10 « أستعدّ » questions:
« خاصيتا القواسم » and « PGCD ونتائجه المباشرة », `khawass-qawasim` and `tayin-pgcd` to revise) · `content/ribbons.js` + test (module 1: 21 and 14 by hand →
252 and 140 with predictions → 378 and 315 → ⭐ 91 and 65 → free; module 3: 45 and 18 by hand → 765 and 135 with predictions → 3356 and 1528 → ⭐ 1938 and
836 → free; `easier` rounds; every pair passes the lab's own validation) · `content/peerSheet.js` + test (« ورقة مريم »: after 84 − 60 = 24 she computes
84 − 24 instead of 60 − 24 and the chain loops) · module 0 (ladder), modules 1 and 3 (`PlayerSwitch` + `LabRounds`; the steps that held a second lab now
wait for round 3 and show an evidence line in the player — the teacher page keeps its lab), module 2 (no lab: the peer sheet becomes step 4).

**What was added to the shared code:**
- `pgcd-differences` and `euclidean-algorithm` v2 treatment (`DifferenceAlgorithm.jsx`, `EuclidAlgorithm.jsx`): props `onVerdict` (the PGCD placed,
  `{ groups: v, exact }`; a refused PGCD box is a missed trial), `levels`, `handDone` (opens « أكمل الفروق » / « أكمل القسمات »), `chains`
  (`['cuts' | 'divs', 'pgcd']`), `predict` (the shared `PredictTray` at the START of a step — « كم سيبقى من الشريط الأكبر؟ » / « كم نسخة تدخل؟ », ≤ 2 per
  round), `choices`; `CHAINS_PLAYER` = count (`fill`) → BUILD the first step (`build`) → invariant, then stop → rule; the chain of steps is the journal
  « 📋 جدول تجاربك » in the lab's column (Euclid: one line per division plus the live equation — the page's two-column chain is too wide there); controls
  frozen during a prediction or a question; always guided; no celebration when the stepper is hidden.
- `LabCheckpoint` `build` questions take `ops` (the signs between slots, default `['=', '×', '+']`) — « 252 = 140 + 112 » uses `['=', '+']`.
- `mission/SewingWorkshopScene.jsx` registered as `mission.scene: 'sewing-workshop'` (two embroidered ribbons cut into equal pieces as tools are
  earned, a `KidFigure` seamstress in hijab).

**Traps met (add to the plan's §7):**
- A round goal for a lab whose steps are forced (cuts, divisions) must not count steps as trials: the verdict is the PGCD placement only, and
  `maxTrials: 1` means « right first time ».
- A page `representation` reused in the player's side column can be too wide (Euclid's two-column chain): render a one-column journal there.
- The scratchpad may be cleared between sessions: the walk library (mocked session) must give the user `nameComplete: true` and Arabic `firstName` /
  `lastName`, or the student is sent to « عرّفنا بنفسك » (`utils/personName.js › needsName`).

**Verification:** `vitest run src/lessons` green (new: `prep.test`, `ribbons.test`, `peerSheet.test`, `algorithmsPlayer.test`), `check:lessons` exit 0,
`lab-rollout-status --lesson bahth-pgcd` ✅, Playwright walk with a mocked student session: module 1 round 1 by hand (3 cuts, count 3, build 21 = 14 + 7,
invariant, PGCD 7, stop, rule → ★★★), round 2 (predictions 112 and 28, 6 cuts, PGCD 28 → ★★★, journal of 6 lines); module 3 round 1 by hand (copies,
overflow, carries, count 2, build 45 = 18 × 2 + 9, PGCD 9 → ★★★), round 2 (predictions 5 and 1, PGCD 45 → ★★★); home (2 of 5 tools), « أستعدّ » (10
questions, review), peer sheet (fix, restore after reload), final test, knowledge map; modules 1–7 unit by unit at 1366×768, 1024×768 and 1920×1080 (0
`data-fit-overflow`, 0 page scroll); teacher view (levels, no player, no rounds) and Classroom Mode unchanged. The BEM exam-sheet practice is not touched.

**Open on this lesson:** e2e specs of the old student view (plan §9.7); `resources` still describe the two-level labs for the teacher's page.

## Lesson 7 — `ikhtizal-kasr` « اختزال كسر » (2026-11-09)

**What was written (per lesson):** `lesson.config.js` (`studentView: 'mission'`, `mission` with the new scene `bakery`, 4 tools = `ikhtizal`,
`kasr-ghayr-qabil`, `ikhtizal-bil-pgcd`, `tahaqquq-al-ikhtizal`, climax = module 5 « عجينة الخبّاز: 105 ملاعق سكّر و 147 كوبًا من الدقيق », 4 checkpoints on
18/30, 20/32, 9/14 and the plan — never 105, 147 or 21, open knowledge map) · `content/prep.js` + test (10 « أستعدّ » questions: « الكسور المتساوية » and
« PGCD », `bahth-pgcd` to revise; the six statements of before stay in `textbook.js` as source) · `content/recipes.js` + test (module 1: 12/18 by hand →
Samir's 84/48 with predictions → ⭐ 126/90 → free kitchen; module 2: 84/48 with the one-step questions → 60/36 with predictions → ⭐ 595/560 → free; `easier`
rounds) · `content/peerSheet.js` + test (« ورقة رانية »: 36 ÷ 6 and 48 ÷ 4 — numerator and denominator divided by DIFFERENT numbers) · modules 0, 1 (both steps
wait for round 1), 2 (step 1 waits for round 1, the peer sheet becomes step 5).

**What was added to the shared code:**
- `fraction-reduction` v2 treatment (`FractionReduction.jsx`): props `onVerdict` (path B, the one division by the PGCD, `{ groups: k, exact }`; a refused path-B
  box or a premature « لا يمكن الاختزال أكثر » is a missed trial), `levels`, `chains` (`['steps', 'pgcd']`), `predict` (TWO predictions: before the first
  division « هل تتغيّر قيمة الكسر؟ », and at the start of path B « بأيّ عدد نقسم مرّة واحدة؟ »), `choices` (fractions `{ n, d }`); `CHAINS_PLAYER` = steps: count
  (`fill`) → BUILD the first division `n = k × n′` (`build`, `ops ['=', '×']`) → why stop; pgcd: one step → rule; the chain of reductions is the journal in the
  lab's column; controls frozen during a prediction or a question; always guided; no celebration when the stepper is hidden.
- `mission/BakeryScene.jsx` registered as `mission.scene: 'bakery'` (identical dough portions appear on a tray as tools are earned, a `KidFigure` baker).

**Traps met:** a patch anchored on a line that occurs twice (`const cmp = L.pathComparison(lab);` is in the component AND in a question) must anchor on
its context; a patch script that edits several files must not be re-run whole after a partial failure — re-run only the files it did not reach.

**Verification:** `vitest run src/lessons` green (new: `prep.test`, `recipes.test`, `peerSheet.test`, `fractionReductionPlayer.test`), `check:lessons` exit 0,
`lab-rollout-status --lesson ikhtizal-kasr` ✅, Playwright walk with a mocked student session: module 1 round 1 by hand (÷ 2, ÷ 3, claim, count 2, build
12 = 2 × 6, why, path B ÷ 6, one step, rule → ★★★), round 2 (predictions « same » and « 12 », ÷ 4, ÷ 3, path B ÷ 12 → ★★★); module 2 round 1 (path B ÷ 12, one step,
rule → ★★★); home (2 of 4 tools), « أستعدّ » (10 questions, review), peer sheet (fix, restore after reload), final test (5 questions), knowledge map; modules
1–7 unit by unit at 1366×768, 1024×768 and 1920×1080 (0 `data-fit-overflow`, 0 page scroll); teacher view and Classroom Mode unchanged.

**Open on this lesson:** e2e specs of the old student view (plan §9.7); `resources` still describe the two-level labs for the teacher's page.

## Lesson 8 — `awwaliyan-fima-baynahuma` « العددان الأوّليّان فيما بينهما » (2026-11-09)

**What was written (per lesson):** `lesson.config.js` (`studentView: 'mission'`, `mission` with the new scene `math-club`, title « لعبة الزوج الرابح », 4 tools =
`awwaliyan-taarif`, `nafy-awwaliyan`, `laysa-awwali`, `ithbat-awwaliyan`, climax = module 4 « مسألة الدرس » (26 و 45، 39 و 65 and سلمى's claim), 3 checkpoints on
14/15, 34/51 and the plan — never 26, 45, 39, 65 or 13, open knowledge map) · `content/prep.js` + test (10 « أستعدّ » questions: « PGCD وخوارزمية إقليدس » to revise
with `bahth-pgcd`, « قواعد قابلية القسمة » with `qawaid-qabiliyat-qisma`; the five statements of before stay in `textbook.js`) · `content/kits.js` + test
(module 1, the kits: 8 and 9 by hand with the questions → 17 and 18 with predictions and « جرّب كل الإمكانيات » → ⭐ 21 and 28 → free; module 2, the lists: 15 and
22 with the questions → 35 and 48 with one prediction → ⭐ 51 and 85 → free; `easier` rounds) · `content/peerSheet.js` + test (« ورقة أنس »: 8 and 15 are not prime,
« so they are not coprime » — the couple's property confused with each number's) · modules 0, 1 (both steps wait for round 2, 17 and 18), 2 (step 1 waits for
round 1, the peer sheet is step 3). The mission draws numbered TILES, never playing cards (CLAUDE.md, respect of values).

**What was added to the shared code:**
- `coprime-explorer` v2 treatment (`CoprimeExplorer.jsx`, see `MANIPULATION_CONTRACT.md` « Seventh example ») and its first `LabCoach` (`logic/coprime.js ›
  coachOf`); `GroupTrials` exported by `CommonDivisors.jsx` and reused; the check button carries `[data-manipulation-check]` (`Btn` passes `data-*`).
- `mission/MathClubScene.jsx` registered as `mission.scene: 'math-club'` (four pairs of tiles go from « ? » to « ✓ » as tools are earned; a `KidFigure` in hijab).

**Traps met:** a string whose value is already wrapped in `$…$` must not be wrapped again in the translation (`$$2$$` renders as display math on its own line);
`PredictTray` shows plain text — no `$` in a prediction prompt; in a lists round the win dialog offers « عُد إلى السؤال » (the step waiting for it), not « next
round ».

**Verification:** `vitest run` of the unit, `common/mission` and `common/manipulations` green (295 files, 4 335 tests; new: `prep.test`, `kits.test`,
`peerSheet.test`, `coprimePlayer.test`), `check:lessons` exit 0 (entry 240.7 KB ≤ 245), `lab-rollout-status --lesson awwaliyan-fima-baynahuma` ✅, Playwright walk
with a mocked student session: module 1 round 1 by hand (8 kits, count 0, build 9 = 2 × 4 + 1, rule → ★★★), round 2 (two predictions, « جرّب كل الإمكانيات » →
★★★); module 2 round 1 (four chips, « تحقّق », count 4, commons, rule → ★★★), round 2 (prediction tray first, four chips, « تحقّق » → ★★★, prediction result shown);
home first visit and return (scene `math-club`, 4 tools); modules 1–7 unit by unit at 1366×768, 1024×768 and 1920×1080 (0 `data-fit-overflow`, 0 page scroll,
no console error); teacher view and Classroom Mode unchanged.

**Open on this lesson:** e2e specs of the old student view (plan §9.7); `resources` still describe the two-level labs for the teacher's page; the module-1 station
label still reads « 17 و 18، 22 و 35، ومريم » (22 and 35 now live only in the teacher's متقدم level).

## The unit page — student view of a converted unit (2026-11-09, owner)

The unit page showed everything at once (6 000 px: الكفاءات, prerequisites, labs and textbook pages of every lesson). The owner approved the
mockup `docs/experiments/unit-home-mockup-2026-11-09.html`, then the council chose a centred window over the side drawer, and the owner asked for a
wider window with a centred title, no empty sides on wide screens, and no scrolling on a laptop. Built as `pages/unit/UnitMissionView.jsx` (guide §
« Mission player », row `UnitMissionView`) for unit 1 « الأعداد الطبيعيّة والأعداد النّاطقة »; content in `pages/unit/unitMissions.js`.

**Rule (owner):** each time ALL lessons of a unit are converted, write its entry in `unitMissions.js` (station icons and short labels, the challenge
rewritten in the platform's words, the keys, the history note) — the unit's students then get this page. The teacher keeps the detailed page.

**Verification:** `unitMissions.test.js`; `node apps/web/e2e/unit-mission-view.mjs` passes at 1366×768, 1024×768 (sidebar open and collapsed),
1920×1080 and 1856×959: no page scroll, nothing cut on the sides, every lesson window and chip window fits folded and unfolded, the teacher keeps the
old page. The student tour `student.unit` targets both pages; its two lines that cited the textbook were rewritten.

**Unit 2 « الحساب على الجذور » (2026-11-10).** Its five lessons converted, its entry is written in `unitMissions.js`:
- stations = the object of each lesson's scene: 🌷 الجذر التربيعي, 🧶 ناطق أم غير ناطق, 📐 المعادلة x² = a, 🧱 العمليات على الجذور,
  🏫 أبسط صيغة لجذر, then 🧩 أدمج تعلّماتي (the synthesis, still unconverted, as in unit 1);
- the challenge is the synthesis's module-7 situation (the Oued Souf carpet: 24 m², length twice the width) rewritten by the platform; its price,
  a parasite datum, is left out (12 000 is also lesson 5's climax total); solvable after `muadalat-x-murabba` (ℓ² = 12). Its answer (√12 = 2√3,
  ≈ 3,46 m and ≈ 6,93 m) is never on the page — a test checks it;
- five keys (الجذر التربيعي, ناطق أم غير ناطق, حلول x² = a, جذر جداء وجذر حاصل قسمة, أبسط صيغة لجذر), one per lesson in order;
- history: القلصادي (1412 – 1486), who studied in Tlemcen and wrote the letter « جـ » for a root before √ spread (the catalogue's aside, the
  golden number and the Parthenon, is not reused).

`unitMissions.test.js` now also checks, for every unit, that the stations follow the catalogue order and that the five keys follow the lessons;
`e2e/unit-mission-view.mjs` loops over every unit of `UNIT_MISSIONS` (three lessons done, « درسك الآن » = the fourth) — all checks pass for units 1
and 2 at the five sizes, teacher view unchanged.

**Unit 4 « معادلات ومتراجحات » (2026-11-11).** Its four lessons converted (the synthesis waits for the synthesis-recipe answer), its entry
`'muadalat-mutarajihat'` is written in `unitMissions.js`:
- stations = the object of each lesson's scene: ⚖️ معادلة من الدرجة الأولى, 📋 معادلات جداء معدوم, 📱 المتراجحات, 📏 ترييض مشكلة, then
  🧩 أدمج تعلّماتي;
- the challenge is the unit's تحدّ (two swimming-pool subscriptions, 75 a session or 560 + 5 a session — also the synthesis's 🏆) REWRITTEN by the
  platform as a riding club: 90 دج a session, or 700 دج a year then 20 دج a session; « from how many sessions is the second cheaper? » (equal at
  10, cheaper from 11 — never on the page); solvable after `mutarajiha-ula`. A test checks that no number of the synthesis (50x, 200 + 10x, 75,
  560, 5x) and no lesson's مسألة signature (`_unit/signatures/*.js`) is in it;
- five keys for four lessons: حل معادلة من الدرجة الأولى, معادلة جداء معدوم, then « المتراجحات » hands TWO (حل متراجحة, تمثيل الحلول على مستقيم
  مدرّج), then ترييض مشكلة (the test's title now says « a unit of three or four lessons hands two keys in one lesson »);
- history: الخوارزمي (c. 780 – 850) and « المختصر في حساب الجبر والمقابلة »: al-jabr moves a subtracted term to the other side, al-muqābala
  removes what is equal on both sides — the balance of lesson 1 (the catalogue's aside, x² + 21 = 10x, is not reused).
`e2e/unit-mission-view.mjs`: all checks pass for the five units at the five sizes; unit 4's captures looked at (1366, 1024 — no scroll, nothing
cut, Arabic and the highlighted numbers correct).

**Unit 5 « جمل معادلتين » (2026-11-12).** Its three lessons and its synthesis converted (owner decision 2026-11-12), its entry
`'jumal-muadalatayn'` is written in `unitMissions.js` (commit `feat(unit): unit 5 « جمل معادلتين » on the one-screen unit page`):
- stations = the object of each lesson's scene: 🏛️ مفهوم جملة معادلتين, 🏷️ الحل الجبري, 🎟️ حل مشكلات, then 🧩 أدمج تعلّماتي;
- the challenge is the unit's تحدّ REWRITTEN with the numbers the council reserved for this page (verdict X2, `_unit/forbiddenShared.js ›
  UNIT_PAGE`): a farm cooperative fills 23 boxes of dates, big ones of 5 كغ and small ones of 2 كغ, 82 كغ in all — presented by ملاك, the one name
  reserved for this page; solvable after `hall-jabri`. The answer (12 ; 11) is never on the page, and no lesson's climax signature is in it
  (`unitMissions.test.js`);
- five keys for three lessons: lessons 1 and 2 hand two each (جملة معادلتين وحلّها, اختبار ثنائية; طريقة التعويض, طريقة الجمع), then ترجمة مشكلة
  بجملة;
- history: the verified line of `_unit/abuKamil.js` (one owner, also read by `mushkilat-jumla`): أبو كامل (c. 850 – c. 930) and « الطرائف في
  الحساب » (the title shortened so that no student-visible « كتاب » remains).
- **The lesson window's prerequisites (same commit, every unit):** `UnitMissionView › LessonWindow` now shows the catalogue's free-text
  `prerequisites` ONLY when the lesson names no prerequisite LESSON (`prerequisiteLessonCodes` empty) — the chips say the same skills as links,
  and both together made the windows of units 4 and 5 scroll at 1366 and 1024.
`e2e/unit-mission-view.mjs`: 0 failures for the six units at every size.

## Cross-lesson fix — a figure and its question on ONE screen (2026-11-11, owner)

The owner: « the student sees the figure on one screen, then must go to the next one to see the question, and come back to look at the figure ».
In the player the pager put every block on its own screen, so a figure and the question about it were split. `ClassroomPaged › pairFigures`
now keeps them together, side by side (guide, « a figure and its question share ONE screen »). Scan of every screen of the 20 converted
lessons at 1366×768 and 1024×768 (scratchpad `fig9/scanall.mjs`): 13 paired screens, 0 `data-fit-overflow`, 0 page scroll; before, 7 screens
showed a figure with nothing to answer. One remains on purpose: `aksiya-talis` module 1 step 1 opens on the situation (text + its general
figure); the question's own three figures sit beside it on the next screen. Lowest zoom: 0.81 (`aksiya-talis`, three figures + a three-row
batch at 1024; the batch label no longer reserves 14rem beside a figure). Classroom Mode and the page: unchanged.
The owner then made it a BINDING rule for every lesson, « NO BACK-AND-FORTH » (guide §4septies): what a question asks the student to look
at is on its screen. The scan is now `apps/web/e2e/no-back-and-forth.mjs`; it presses « واصل » only, so the screens that appear after an
answer (a later sub-question without its figure, data on the previous screen) are found by a walk that answers — the prompt for the lessons
already converted: `docs/reports/NO_BACK_AND_FORTH_PROMPT.md` — **run on 2026-11-11**, results below.

**The scan read only part of each lesson until 2026-11-11.** The « محطة المهمة » checkpoint that opens a module does not close with Escape, so
the scan stopped on it and never read most modules (`talis-hisab-atwal` modules 2–5, for example). `no-back-and-forth.mjs` now presses
« لاحقًا ». The numbers above (13 PAIR, 0 OVER) were taken with that gap.

**Shared fixes (every converted lesson, player only; tested in `guidedProblem.test.js`, `exerciseParts.test.js`):**
- every « مسألة » sub-step (60 problems in 20 lessons) carries « المعطيات » (figure, table, useful data, or the statement) and « النتائج السابقة »
  (the right results of the sub-steps already answered) beside it: `ProblemAside`, `asideOf`, `foundOf` (guide, « A « مسألة » in the player »).
  Before, « الجداء AM × AC », « طول ظلّ النخلة SH » and the Euclid lines « باقي قسمة القاسم السابق على الباقي الذي وجدته » were asked on screens
  showing no number, figure or earlier line;
- a `TextbookExercise` card (statement / items / figure) is ONE screen; the parts of an exercise get the first part's statement (`withContext`
  in the `partsOf` of `tawzif-khawass-judhur`, `tahlil-ibara`, `inshaat-talis`, `talis-hisab-atwal`).

**Walk.** A script answered every sub-step (the data sort by drag, wrong numbers then the shown correction, choices, the written solution and
its model lines) on `awwaliyan-fima-baynahuma` module 4 at 1366 and 1024, and on `wadiya-idmajiya-talis` module 1 at 1366 (the sort, five sub-steps,
the written solution, part 2): every sub-step showed its data and the earlier results, and no screen overflowed. Every other screen was read
with all modules open (a completed lesson opens all of a module's sub-steps), each screen's text scanned for « الشكل / السابق / الجدول / وجدته »
and part labels, and the captures were looked at.

Per unit (scan of 2026-11-11, `no-back-and-forth.mjs`, 1366 and 1024):
- **Unit 9 « خاصية طالس »** — LONE 4 (2 screens × 2 widths, both kept, below) · OVER 0 · PAIR 68. Fixed: `inshaat-talis` m2 step 2 (« في الشكل
  السابق »: the method figure on another screen; now beside the question, and BE = 2 repeated in its line), m3 ex 21 parts 2–4 (no statement;
  now `context`); `aksiya-talis` m2 step 2 (« في شكل الملاحظة »: that figure was only in the card opened AFTER the answer; now beside the
  question, on the page too since the follow-up of the same day), m2 step 1 (the two situations split on two screens; now one, paired with the
  question); `talis-hisab-atwal` m2 step 3 (the remark read its values on a figure alone on the previous screen; now beside it), m2 step 1 (the
  three situations, one per screen; now one reading screen), m4 « أربعة أشكال » (OVER at zoom 0.6, never scanned before; follow-up of the same day: ONE screen per figure — each row
  « الشكل (k) » carries its own drawing beside it, `rowAside` of `BatchChoiceQuestion` / `TextbookExercise`, zoom ≥ 0.95 at both widths, the grid's
  saved-answer key unchanged); the « مسألة » modules of all four lessons (shared fix). `wadiya-idmajiya-talis` modules 1–4 were then walked in ONE
  session at 1366, each module answered to its end and « المحطة التالية » pressed (that press records the completion that opens the next situation;
  a seeded session cannot open them): every sub-step of « عارضة الرف », « توزيع الممرّ » and « هدية عيد الأمّ » showed its data and earlier results.
- **Unit 2 « الحساب على الجذور »** — LONE 0 · OVER 0. Fixed: the « مسألة » modules (shared); `tawzif-khawass-judhur` parts get their statement
  (`withContext`).
- **Unit 3 « الحساب الحرفي »** — LONE 0 · OVER 0. Fixed: `tahlil-ibara` m4 ex 20 (« 2) B = » without the expressions), ex 21 part 2 (the
  classmate's work on the previous screen) — `withContext`; the « مسألة » modules (shared).
- **Unit 1 « الأعداد الطبيعية والأعداد الناطقة »** — LONE 0 · OVER 0. Fixed: `ikhtizal-kasr` m3–m4 ex 34, 35, 36, 37, 38, 40 (« 3) الشكل غير القابل
  للاختزال: » alone, its fraction in the items on the previous screen) and `khawass-qawasim` m4 (« 3) الأعداد التي يمكن أن تكون قواسم مشتركة ») —
  the kept card; the Euclid lines of every « مسألة » (`foundOf`).

**Book references (follow-up, 2026-11-11, owner « fix them all »).** `MissionBrief` strips « الكتاب ص … » / « ص 12 » from every brief tag on
screen (`common/textbook/bookRef.js › withoutBookRef`, tested; a tag that was only a reference disappears) — every lesson, not only the converted
ones. The student-visible references in the converted lessons were reworded (step titles « طريقة الكتاب: … » → « الطريقة: … », subtitles « السؤال
1) من الكتاب » → « السؤال 1) », objectives « أحلّ تمارين الكتاب 3 ← 11 », module `desc`, labs' titles and leads, knowledge-map titles and notes,
an `explain`, two `predictPrompt`) in `qasim-adad-tabii`, `qawasim-adad-tabii`, `khawass-qawasim`, `qasim-mushtarak-akbar`, `tayin-pgcd`,
`bahth-pgcd`, `ikhtizal-kasr`, `awwaliyan-fima-baynahuma` and `jidhr-tarbii`. Teacher-only fields (`teachingScope`, `autonomy`, comments) keep
their sources. Unconverted 1AM–3AM lessons still carry such words outside brief tags (titles, bodies): they are cleaned when their lesson is touched (guide §4ter-bis).

Saved-answer keys: unchanged — no prompt or option was reworded (a prediction is saved by its knowledge item id, not by its prompt) (`inshaat-talis` and `aksiya-talis` reuse the same question element on the
page and in the player; only the line ABOVE the question in `inshaat-talis` m2 step 2 changed, in the player).

## Cross-lesson fix — the main button on the right (2026-11-09, owner)

On the lesson home the big « واصل » was in the LEFT column (x ≈ 460 at 1366 px) while the unit page's « واصل الدرس » is on the right (x ≈ 877): the
student crossed the screen between two clicks. `MissionHome` now puts its text column and « واصل » on the RIGHT and the scene on the left (x ≈ 906), and the
first visit's CTA is aligned right (x ≈ 938). Applies to every converted lesson (shared component). The player's bottom bar keeps the RTL convention
— « واصل » on the left, « السابق » on the right (owner: tried and refused the same day).

## Cross-lesson fix — the opening view: same width, same button place (2026-11-11, owner)

Two complaints on the opening view (`MissionHome`, first visit and « شاهد البداية »): (1) « شاهد البداية » showed the opening NARROWER (957 px at 1366)
than the screen « لا أعرف بعد… هيا نجمع الأدوات » opens (≈ 1089 px, the 1100 px reading column × the zoom): the compact home had already settled
its zoom, and the taller opening only SHRANK to fit (`FitToArea › keepInPlace`). Now `MissionHome` asks `useFitRefit()` when the replay opens, so
the screen re-settles at its own size — first visit and replay measure the same at 1024 / 1366 / 1920 (0 `data-fit-overflow`, 0 page scroll).
(2) The CTA (« لا أعرف بعد… » / « أجرّب ») sat in its own row under the card; it now sits INSIDE the text column, full column width, 64 px high,
exactly where the home's « ابدأ : … » / « واصل : … » button is (same grid, `md:grid-cols-[1.2fr_0.8fr]`; the section lost its `max-w-5xl`).
Applies to every converted lesson (shared component). Probe: a Playwright script measuring `[data-mission-opening]` and `[data-mission-start]`.

### The opening ON the home card — tried on `nashr-tabsit`, APPROVED and made the default (2026-11-11, owner)

The fix above still left « شاهد البداية » at a different zoom than the home (1.35 vs 1.33) and the CTA ~320 px lower than « ابدأ : … », because the
question bubble sat above it. Tried first on `nashr-tabsit` behind a flag; the owner approved the same day, so it is now the ONLY opening of
`MissionHome` (flag and old branch deleted; every converted lesson and every future one gets it with no config). The opening reuses the home card's
header and tool chips (`HomeHeader`, `ToolChips`; the tag line has a fixed 36 px height so the ⭐ badge never shifts it), puts the question bubble above
the scene, moves the facts (with « ستجمع في الطريق: » / « مفاتيحك معك: ») under the CTA where the home has « التمارين », and « شاهد البداية » no
longer refits — it keeps the home's zoom (`useFitRefit` is no longer called by `MissionHome`). Measured on nashr-tabsit at 2060×1067: same zoom (1.24),
same card width, the CTA on the same pixel. Four lessons with a long statement or a tall scene (`jidhr-tarbii`, `muadalat-x-murabba`, `natiqa-ghayr-natiqa`, `aksiya-talis`) still re-zoomed, so the
opening is given the home's natural height (measured at the click) and its scene shrinks into the room under the bubble. Verified on ALL 24 converted
lessons × 1366×768 / 1024×768 / 1920×1080 with the new `apps/web/e2e/mission-opening-align.mjs`: same zoom, same card width, same button pixel, no
overflow. Rule for future lessons: guide §4septies, `MissionHome` row — nothing to configure, and run that script after converting a lesson.

## Cross-lesson fix — « in the player » decided at module level (2026-11-11)

Found by unit 4's lesson-1 builder: the player context (`InMissionPlayerContext`) is provided BELOW the module (`ContentModule › ModuleLayout ›
MissionPlayer`), so `useInMissionPlayer()` called in a module BODY is always false — the player-only steps a module builds there showed their PAGE
version in the player. `tahlil-ibara` (unit 3) shipped like that on 2026-11-11. The shared hook `lessons/common/mission/useModulePlayer.js ›
useModulePlayer(MODULE_CTX)` decides at module level with the same rule as `ContentModule` (a lesson with `mission`, seen in mission view by the
student, not free navigation, not Classroom Mode); it replaces the module-level `useInMissionPlayer()` in `tahlil-ibara` M1, `jidaa-maadum` M1–M3
and `mutarajiha-ula` M1–M2 (commit `fix(player): decide « in the player » at module level with the same rule as ContentModule`). `muadala-ula`
has its own `moduleContext.js › useStudentPlayer()` with the same rule. Rule (`LESSON_DEVELOPMENT_GUIDE.md`, the bullet « A module body never calls `useInMissionPlayer()` »): **a module body never calls
`useInMissionPlayer()`** — it calls `useModulePlayer(MODULE_CTX)` or renders `PlayerSwitch`.

## Cross-lesson fix — the guide and the « أستعدّ » card (2026-11-09, owner)

Applies to every converted lesson (and, for the card, to every lesson's « أستعدّ » and « إختبار أولي »):
- **« المرشد » (LabCoach) in the player:** the player's look (wider bubble, larger text, thick « فهمت », amber icon and ring) and an always-visible
  « 💡 المرشد » pill — under the goal line, and in the side column's top bar while a question or prediction is open. `pgcd-differences`,
  `euclidean-algorithm` and `fraction-reduction` had NO coach: they got one (pure `coachOf` + strings + test). Contract: `MANIPULATION_CONTRACT.md`
  §8quater. Checked: the pill and the new bubble on the 11 lab modules of the 7 converted lessons at 1366×768 and 1024×768, 0 overflow, 0 scroll.
- **The play question never moves:** the « أحسنت » / « سنعود إليه » signal is a stamp over the card, the undo bar has a fixed row, « غير متأكّد » keeps
  its place (`kit/DiagnosticPlayQuestion.jsx`, guide §4septies). Checked: card top and options top identical before, during the undo second and
  under the signal.
- **The guide's ring was misplaced** (owner, 2026-11-09): the player zooms its content (`FitToArea`, CSS `zoom`), and `CoachOverlay` placed the ring
  and the bubble with screen pixels inside the zoomed layer (zoomed twice). Fixed by dividing by the layer's scale; the SAME error made the
  factor-pairs ruler (`useStretchInteraction`) pick the wrong width under zoom (tick 6 → 2) — fixed the same way. Rule and checks:
  `MANIPULATION_CONTRACT.md` §8quater « Screen pixels vs layer pixels ».
- **The build question names the item** (owner, 2026-11-09): in `common-divisors` the « build » question said « العدد الكلّي / عدد المجموعات »
  without saying whether the balls or the shirts were meant. Themes now carry DEFINITE forms (`themes.<id>.theA / theB / theGroups`, read by
  `themeWords`, falling back to the bare words): « ابنِ المساواة التي يقولها توزيع الكرات — لا القمصان », slots « كل الكرات = عدد الفرق × كرات في كل
  فريق »; the extra tile is the other item's count per group.
- **A memo rule never gets cut** (owner, 2026-11-09): the rule of an end-of-module memo card (`knowledge/MemoCard.jsx`) was centred in a box too
  narrow for it, cut on BOTH sides with a scrollbar (`d∣a ∧ d∣b ⟺ d∣PGCD(a ; b)`). The rule and the example now go through
  `components/FitLine.jsx` (one line that lowers its font size just enough to fit, ≥ 0.55; layout pixels, zoom-safe). Checked: 94 %, inside, no
  scrollbar at 1366×768 and 1920×1080.
- **The mission home uses the width** (owner, 2026-11-09): mission card → « مسار المهمة » → « راجع قبل أن تنطلق » and « ابدأ التمارين » side by side
  (`MissionHome`, `[data-mission-home-row]`; « راجع » lists in one column there). Checked on the 7 converted lessons at 1920×1080, 1366×768 and
  1024×768: order, two equal cards, no page scroll, 0 overflow.
- **The mission home redesigned** (owner, 2026-11-09: « more clear, attractive, motivated »): first visit = question bubble beside the scene, its numbers
  highlighted, duration / tools / big problem, the tools to collect, one CTA, a slim « قبل أن تبدأ »; return = one big « التالي » card (station, what to do,
  time, « المهمة الكبرى بعد N محطّات », « واصل ») beside the scene with a tools ring and stars, then the path (« ✓ k من N »), then revise + exercises side by
  side. Guide § « Mission player » (`MissionHome` row). Checked on `qasim-mushtarak-akbar` and `qasim-adad-tabii` at 1366×768, 1920×1080, 1024×768:
  no scroll, 0 overflow, no console error.
- **The return home v2 — no « التالي » card, the screen filled** (owner, 2026-11-09: the separate next card was not needed and the home was shrunk
  by the player's fit, so the student had to zoom): ONE wide hero card (scene + title, ⭐, tools ring, tool chips, ONE big « واصل: <station> »,
  « 📝 التمارين » → `/espace/pratique/<lesson>` when practice is active), then « مسار المهمة », then « قبل أن تبدأ » and the two small links on ONE
  row (`[data-mission-home-foot]`). The `PracticeEntryCard` left the home (practice is the button and the path's last station). Being short, the home
  is now ENLARGED by `FitToArea`: zoom 1–1.04 at 1366×768 and 1024×768, 1.46–1.51 at 1920×1080 (was 0.85–0.92), no scroll, 0 overflow, on
  `qasim-mushtarak-akbar` and `qasim-adad-tabii`.

## Unit 2, lesson 1 — `jidhr-tarbii` « الجذر التربيعي لعدد موجب » (2026-11-09)

**Council (2026-11-09) on the lab's player design** — five advisors, verdict applied: keep BUILDING an inequality for a side that never lands
(« 4 < 5 < 9 » is the bracket the hand made; « 2 × 2 = 4 » adds nothing); the yes/no prediction « lands on a tick? » becomes a pattern after one
« no » on area 5, so it is asked at graduation 1 and at 0,01 only, and 2,25 (« no » at 1, « yes » at 0,1 — the prediction that FLIPS) is a REQUIRED
round right after 5; « will a finer graduation EVER land? » cannot be proven by doing, so the old « zoom » choice is replaced in the player by an
OBSERVABLE fact — « c has k decimals → c² has 2k, its last digit is never 0, so c² is never the whole number 5 »; the « few trials » star is a
per-graduation budget (bisection ≈ 4 releases per refined graduation); graduation mode asks the « resists » question only after a card really
resisted and names graduations « 1/3 », never a bare g. Rejected: a « digit prediction » (0–9) at each graduation (more UI than the lesson needs) and
coprime denominators for `resists` (the lab's own `cardStatus` already decides it).

**What was written (per lesson):** `lesson.config.js` (`studentView: 'mission'`, `mission` with the new scene `garden-bed`, title « حوض الأزهار على الوتر »,
4 tools = `qima-mudbuta`, `jidhr-taarif`, `murabba-jidhr`, `jidhr-murabba`, climax = module 4 (the flower bed on the hypotenuse of a 3 م / 5 م corner), 3
checkpoints on 7, 11 and √20 — never 34, √34, the 3 / 5 sides or 5,83…, open knowledge map; the opening writes « م », not « m », so « 5 م. » cannot
bidi-scramble) · `content/prep.js` + test (10 « أستعدّ » questions: « مربع عدد » with `quwat-adad-nisbi` and « خاصية فيثاغورس » with
`khassiyat-fitaghuras` to revise; a formula-only statement has no final period — it jumps left in RTL; the six statements of before stay in
`textbook.js`) · `content/squares.js` + test (module 1: 16 by hand → 5 to 0,001 with two predictions → 2,25 → ⭐ 20 to 0,01 → free garden; module 2:
0,04 → ⭐ 1,69 → free; `easier` rounds 4, 2, 0,25, 0,01) · `content/peerSheet.js` + test (« ورقة إلياس »: « 0,06 × 0,06 = 0,36 » so « √0,36 = 0,06 » — the
square of a decimal) · modules 0, 1 (steps 1–3 wait for round 2, whose trials still fill step 3's evidence through `onTrial`; « المستوى المتقدّم »
became « المختبر » in three lines), 2 (step 1 waits for round 1, the peer sheet is step 4) · the catalogue: `prerequisiteLessonCodes` =
`quwat-adad-nisbi`, `khassiyat-fitaghuras` (the net's `requires` links; the two free-text prerequisites they replace are removed — same rule as
`qasim-adad-tabii`), without which « راجع قبل أن تنطلق » and the review's priority card were empty.

**What was added to the shared code:**
- `square-root-side` v2 treatment (`roots/SquareRootSide.jsx`, contract « Eighth example ») and its first `LabCoach` (`logic/squareRootSide.js › coachOf`:
  the handle → again → « دقّق » / another graduation → another card; never a value). Pure helpers `landsAt`, `landsSomewhere`, `decimalsOf`, `cellOf`.
- `roundsModel`: goals `{ bracketed: g }` and `{ resists: true }`, fed by the lab's `onTrial { tk: 'bracket', card, scale, resisting }` (tested).
- `mission/GardenBedScene.jsx` registered as `mission.scene: 'garden-bed'` (a right-triangle corner; the square bed on its hypotenuse fills with rows of
  flowers as tools are earned, its stone frame closes at the end; a `KidFigure` gardener).
- `BatchChoiceQuestion rowCols` (default 1): `TextbookExercise` lays a batch of ≥ 6 rows on two columns INSIDE the player only, as one designed screen
  (`data-paging-keep`) — module 3's exercises 3 and 5 (7 rows) were 524 px in a 497 px area at 1024×768 (`data-fit-overflow`). Applies to every converted
  lesson; the page and the teacher are unchanged.
- `coprimePlayer.test.jsx`: `RAW` → `rawKey` (the static i18n-scope scanner read an upper-case `const` as a component calling `t()` — the suite was red on HEAD).

**Traps met:**
- A chain chosen by what is FOUND hides the stepper of an exact area until the side lands (0,04 is first bracketed between 0 and 1): in the player the
  chain follows the computed TRUTH (`truthKeyOf`), and the « exact » chain opens when the side lands.
- A prediction this lab cannot judge at once (the ruler answers later) is judged by the computed truth when it is made (the star), and its result is SHOWN
  when the graduation has decided.
- A Python patch script with `\\times` in a normal string writes `\times` → a TAB in a JS template string (`\t`): one formula and seven config strings lost
  their backslash (`check:katex` caught the config; a test now asserts the built equality keeps ` \\times `).
- A long list made two-column grows rows ≥ 110 px, and the player then pages it ONE ROW per screen: mark the grid `data-paging-keep`.
- The coach bubble sits over the −/+ buttons until « فهمت » (once per tip): a walk must tap it before using them.
- A lab whose rule explanation lists every step (four brackets) overflows the side column at 1024×768 once the answer opens, and again in the
  formal block after the win: in the player both are compact (the last bracket only).

**Verification:** `vitest run src/lessons` 631 files / 11 924 tests green after the fixes (new: `prep.test`, `squares.test`, `peerSheet.test`,
`squareRootPlayer.test`, `roundsModel` « bracketed / resists »), `check:lessons` exit 0 (entry 241.3 KB ≤ 245), `lab-rollout-status --lesson jidhr-tarbii` ✅,
Playwright walk with a mocked student session: module 1 round 1 by hand (16 → 4, fill 4, build 16 = 4 × 4, rule → ★★★), round 2 (prediction « no » at 1,
bracket 2 / 3, fill, build 4 < 5 < 9, prediction « no » at 0,01, down to 2,236 / 2,237, decimals 6, rule → ★★★, « عُد إلى السؤال »), round 3 (no → yes, 1,5 →
★★★), challenge 20 (4,47 / 4,48 → ★★★), free garden (choices, « جرّب كل الإمكانيات »), the « easier » round after five misses (4 → back to round 1);
module 2 round 1 (0 / 1, then 0,2 → fill, build, rule → ★★★); peer sheet (wrong line, wrong fix, fix, restored after reload with its chip); home first visit
and return, « أستعدّ » (notice, 10 questions, one-screen review with « خاصية فيثاغورس » as the priority lesson), final test (5 questions, review), knowledge
map; modules 1–7 unit by unit at 1366×768, 1024×768 and 1920×1080 (0 `data-fit-overflow`, 0 page scroll, no console error); teacher view unchanged (no
player, no rounds, the two levels) and Classroom Mode untouched.

**ECC review (react, code, a11y — 2026-11-09), fixed:** the free-round chip kept no graduation (`setNumbers` now keeps `scale`); the coach could show
over an open question on the page (`!cp.open`); « إعادة » left the round's log full — the lab now reports `{ tk: 'reset' }` and `logEvent` empties the log
(tested); releasing on the same value counted as a new trial; the third checkpoint (√20 → its area) was the climax's own operation and named the plan —
now « √(9²) »; five student-visible lines sent to the textbook (modules 1–3, module 3's map `desc`); « {{n}} أرقام » with n = 1 or 2 (now « عدد أرقامه… »);
the card ✓ / ✗ is `aria-hidden` with a screen-reader word, the frozen handle is `aria-disabled`, every « {,} » becomes a comma in labels (`replaceAll`),
the journal's headers have `scope="col"`, the scene is `aria-hidden` without a label, and two columns of a long batch apply from `lg` only (a
768-px tablet keeps one). **Kept, with reason:** `alat-hasiba-jidhr` stays in `priorKnowledge` — module 1's calculator question `requires` it (the
audit needs every literal `requires` declared); the release verdict is already announced by the shell's live representation (`aria-live`). Rejected by
the coordinator: two « no » predictions on area 5 (council decision; round 3 gives the « yes »), the unused `resists` goal (lesson 2's groundwork).

**Open on this lesson:** the unit-1 labs do not report `{ tk: 'reset' }` yet; e2e specs of the old student view (plan §9.7); `resources` still describe the two-level labs for the teacher's page; the API's
catalogue import is not re-run for the new `prerequisiteLessonCodes` (local database: owner's publish step).

## Unit 2, lesson 2 — `natiqa-ghayr-natiqa` « الأعداد الناطقة والأعداد غير الناطقة » (2026-11-09)

**Council (2026-11-09) on the graduation-mode rounds** — five lenses (contrarian, first principles, expansionist, outsider, executor) run inline by the
lesson's agent, with a peer-review pass and a chairman synthesis. Agreed: (1) a « resists » verdict must be TRUE — the lab's rule « three graduations
bracketed without landing » marks 16/9 ✗ after 1/1, 1/2, 1/4, and the question then says « it will never land »; in the player a card whose side lands on
an offered graduation never resists (`init({ truthful })`), and no round offers a rational card a ruler too short for it (test); (2) every round has one
card that lands and one that never does, and its two predictions have DIFFERENT truths, with the card open at the start alternating « no » / « yes » /
« no » across rounds — always answering « no » cannot win the star; (3) round 1 is small and played with the full `grad` chain (read the ruler → BUILD
« 16 = 4 × 4 » → the card that resisted → the rule); the activity's numbers come second with predictions; 16/9 (it needs 1/3) is a REQUIRED round;
(4) the challenge asks for the right ruler at once (49/36 → 1/6: « the denominator tells you »). Clash: the expansionist wanted a ruler-choice
prediction (« on which ruler? ») instead of yes/no — rejected for now (one more tray type; the yes/no with varied truth already makes the student
think); the contrarian wanted `truthful` on the page too — kept player-only (the page is unchanged by rule; noted below as open).

**What was written (per lesson):** `lesson.config.js` (`studentView: 'mission'`, `mission` with the new scene `carpet-loom`, title « ثلاث زرابي مربّعة »,
3 tools = `murabba-natiq`, `ghayr-natiq`, `qima-muqarraba`, climax = module 4 (the three square carpets: 2,89 م², 4 م² of 9 pieces, 3 م²; wool ribbon at
500 دج), 3 checkpoints on √(49/25), « which is not rational: √11, √0,36, √(1/25) » and the lower value of √7 to 0,1 — never 2,89, 1,7, 4, the 9 pieces, 3,
√3, 1,74 or 500; open knowledge map; three module `desc` lines no longer cite the textbook) · `content/prep.js` + test (10 « أستعدّ » questions:
« العدد الناطق » with `adad-natiq` (3AM) and « الجذر التربيعي » with `jidhr-tarbii` to revise; the five statements of before stay in `textbook.js`) ·
`content/rulers.js` + test (module 1, graduation mode: 16 and 2 by hand to 1/4 → 7 and 0,25 to 1/6 with predictions → 16/9 and 13 to 1/6 → ⭐ 25/13 and
49/36 to 1/8 → free workshop of the activity's six areas to 1/12; `easier` rounds on rulers to 1/3: 1 and 2, 0,25 and 2, 1/9 and 5; every goal is checked
by PLAYING it in the test) · `content/peerSheet.js` + test (« ورقة يونس »: « 49 = 7², so √(49/20) is rational » — judging the numerator alone; fixes: the
denominator 20 is not a square, « √(49/20) = 7/10 » (half of 20), « the calculator shows 1,565247584 »; every number computed) · modules 0 (the ladder),
1 (`PlayerSwitch` + `LabRounds labId="m1-rulers"`; steps 1 and 2 wait for round 2, whose trials still fill the evidence; the TextbookBox's « typo
corrected in the textbook » note and the brick lead « يقوله الكتاب » are gone), 2 (no lab; « ورقة يونس » is step 4; tag and lead no longer cite the
textbook), 3 (step titles lose the textbook's exercise numbers; subtitle and tag no longer cite pages).

**What was added to the shared code:**
- `logic/squareRootSide.js › init({ truthful })` and `cardStatus`: in the player a rational card never « resists » (`SquareRootSide` passes
  `truthful: gameScreen`; the page keeps its three-graduation rule).
- `roots/SquareRootSide.jsx`: the graduation rule's explanation is compact in the player (the rule alone); the journal writes a fraction square
  plainly — `squareLine`: « (5/4)² = 25/16 », never raw `\dfrac` nor « 5/4² »; the square's `aria-label` uses the same plain text.
- `kit/ContentModule.jsx`: the player's bottom button « العب الجولة … » now turns into « واصل » as soon as the round is won (`needsRound.won` was missing
  from the `playNav` memo — the button stayed stale in every converted lesson).
- `mission/CarpetLoomScene.jsx` registered as `mission.scene: 'carpet-loom'` (a loom; the square carpet is woven row by row with diamond motifs as tools
  are earned, its border and fringes close at the end; a `KidFigure` weaver in hijab beside a measuring tape, no number drawn).

**Traps met:**
- An inequality chain inside Arabic prose (« ($16 < 20 < 25$) ») reads mirrored: write the two neighbouring squares one by one (« $4^2 = 16$ و
  $5^2 = 25$ »).
- A walk that answers a choice question wrongly twice triggers « لا بأس — جرّب أصغر » on the round (two misses): expected behaviour, not a bug.
- Edits during a walk hot-reload the page and can log a one-off `MissionLayer` error (`?t=` in the stack): re-run before believing it.

**Verification:** `vitest run src/lessons` 635 files / 11 951 tests green (new: `prep.test`, `rulers.test`, `peerSheet.test`, `mission.test`, `roundsModel` « jumpTarget », two `squareRootPlayer`
tests — `truthful` « resists » and the plain journal), `check:lessons` exit 0 (entry 241.2 KB ≤ 245), `lab-rollout-status --lesson natiqa-ghayr-natiqa` ✅, Playwright (mocked student session) at 1366×768, 1024×768 and 1920×1080: every round of module 1 ★★★ (r1 by hand with fill, build,
« resists » and rule; r2 « no » then « yes »; r3 with 16/9 bracketed on three wrong rulers staying open, then landing on 1/3; challenge; free workshop of six
cards), the reset path (wrong prediction → « إعادة » → clean play ★★★), the « easier » round after two wrong predictions and back, module 2's peer sheet
(wrong fix, fix, restored after reload), home first visit and return, « أستعدّ » (10 questions, review), final test, knowledge map, modules 1–7 unit by unit
(0 `data-fit-overflow`, 0 page scroll, no console error), teacher view unchanged.

**ECC review (react, code, a11y — 2026-11-09), fixed:** step 2 could become impossible — its rule flag lived in memory and only round 1 carries the
« rule » chain: it now also reads round 1's stored stars (`won.r1`) and a SAVED copy (`useSavedAnswer` key `lab-rulers`, with the trials, so the evidence
no longer says « لم تجرّبه بعد » after a reload); the module's door « العب الجولة 2 » could skip an unplayed round 1 — `LabRounds` now jumps through
`roundsModel › jumpTarget` (a closed round leads to the first required round not won; tested; shared by every converted lesson); the same reload gap in
lesson 1's step-3 evidence is closed the same way (`lab-squares`), and its step 6 lost a « (ص 30) »; the checkpoint after module 2 used 3² = 9 and
4² = 16 (the climax's numbers and its bracketing of √3) — now « 11 is a whole number that is no whole number's square » and √(1/25), with a test that no
checkpoint uses a climax number or a textbook line (`content/mission.test.js`); the teacher-facing `resources` lines no longer say « الكتاب »; the peer
sheet's conclusion is corrected too (`fixedLines`), and its fix no longer puts a formula inside parentheses; a11y of the lab: the 1/g buttons' name
starts with the visible « 1/g » (and « مسطرة مدرّجة بالجزء من g من الوحدة » replaces a wrong plural), focus rings indigo-600 with an offset, the selected
ruler sky-700, the « too small » colour amber-700 (#B45309), the journal is a table labelled by its heading with row headers and « — » for empty cells,
the choices row is a labelled group with `aria-pressed`, the value pill is `aria-hidden` (the slider says it), and the prediction result fills an
always-mounted live region. **Kept:** `qima-mudbuta` in `priorKnowledge` (modules 2–3 and the problems `require` it). **Rejected by the coordinator:**
`disabled` → `aria-disabled` on every control (a pattern across every lab — out of scope), the √7 checkpoint (the lesson's own skill, other numbers).

**Open on this lesson:** `truthful` « resists » is player-only — the page still marks a rational card ✗ after three wrong rulers (owner's call); the
`resources` still describe the two-level lab for the teacher's page; e2e specs of the old student view.

## Unit 2, lesson 3 — `muadalat-x-murabba` « حل المعادلة من الشكل x² = a » (2026-11-10)

**Council (2026-11-10, a real council: 5 advisors, 5 anonymous peer reviews, chairman)** on how `square-fold` lives in the player. Verdict applied:
- **The irrational-root pin (the first change).** In the player a graduation NEXT to √3 is never accepted as a value: pinning 1,7 for x² = 3 answers
  « $1{,}7^2 = 2{,}89 \neq 3$ — لا تدريجة تعطي 3 بالضبط » (computed), then a distinct exact mark √3 appears between the ticks and the student pins it
  deliberately (« ثبّت √3 » — the pin is √3, never 1,7); −√3 the same way. That first nearest-tick try, on each side of zero, is the intended discovery and
  is NOT a trial. The page keeps its behaviour (the nearest tick pins √3 directly).
- **Chains.** r1: the full chain — the square of the pinned solution and the relation (opposites) by a tap, the number of solutions by a tap for 0 and
  for a < 0, then at the third sign BUILD « x² = a ⇔ x = √a أو x = −√a » (« يعني » beside ⇔) and the rule. r2: one tap question on the predicted cards
  only. r3: one build after √3 is pinned (its decoy tile is the nearest tick 1,7). Early in r1 a refused arrow (a < 0) visibly bounces off the hatched half.
- **Goal.** One new goal `{ solvedAll: n }` (reuses the `exact` set of `allExact`) — tested. Refused pins and a wrong « لا حل » are trials; the
  first nearest-tick beat and a repeated identical refusal are not.
- **Predictions.** r1 (4, 0, −4) « كم حلًّا ؟ » on cards 1 and 2 → 2 / 1; r2 reordered −9, 0,04, 1,44, 0 → 0 / 2; r3 (3, 2,25) « هل تقع تدريجة على
  حلّ ؟ » → no / yes. A test checks the truths differ in every round.
- **Rounds.** r1 4, 0, −4 at 1/2 with the table of squares in the journal; r2 −9, 0,04, 1,44, 0 at 1/10 (25 replaced by 1,44); r3 required 3 and 2,25;
  ⭐ 1,21, 7, −0,5, 0; free 9, 2, −1, 6,25, 0, −16; easier rounds 1, 0, −1 (and 2, 1 for r3) on the unit line. a = 0 in r1, r2, ⭐ and free — not in r3.
- **Checkpoints.** « x² = 49 ? x² = −49 ? » (2 / 0); « as a shrinks, where do the two pins meet? » (at 0); « (−2,5)² — where does the arrow land? »
  (6,25). No ±, no exact-√ fix, no climax number — `content/mission.test.js` also checks what the rounds SHOW (cards, leads).
- **Scene.** A folding paper strip at a school science fair, two `KidFigure` pupils (a girl in hijab, a boy), no number on the fold.
- **Also.** Few words per screen (a one-line round mission), the dragged value in `<bdi dir="ltr">` (decimal comma, minus sign), a shorter line per round
  (`radius`) so 1/10 can be aimed at and − / + always there, no scroll with chain + cards + tiles; the peer sheet targets a real misconception without
  the climax's errors.

**What was written (per lesson):** `lesson.config.js` (`studentView: 'mission'`, `mission` — scene `fold-strip`, title « بطاقات سلمى الخمس », tools
`murabba-mutaakisayn`, `hulul-x2-a`, `tariqat-hall-x2`, climax = module 4 (Salma's five cards 64, 0,09, 11, 0, −36 and her points), the three checkpoints
above; `knowledgeMapOpen`; module and resource lines no longer cite the textbook) · `content/prep.js` + test (10 « أستعدّ »: « مربّع عدد ومعاكسه » with
`quwat-adad-nisbi` and « الجذر التربيعي » with `jidhr-tarbii` to revise; the first-degree equations stay a `priorKnowledge` — module 3 requires them) ·
`content/folds.js` + test (every goal PLAYED, three stars on a clean play, the line never too short for a card, no climax value among cards, roots,
nearest ticks and build decoys; no equation in a plain-text lead) · `content/peerSheet.js` + test (« ورقة أمينة »: « √0,16 = 0,08 because 0,16 ÷ 2 =
0,08 »; the number of solutions is RIGHT on the sheet) · `content/mission.test.js` · modules 0 (the ladder), 1 (`PlayerSwitch` + `LabRounds labId="m1-folds"`;
step 1 waits for r1, step 5 for r2; what the lab did is SAVED — `useSavedAnswer` key `lab-folds` + stars — so a reload never blocks a step; step 1's title
no longer names 9 and −3), 2 (`LabRounds labId="m2-folds"`: 9, 5, −1 with √5 pinned exact and the build, then a free line; step 2 waits for it; « ورقة
أمينة » is step 4), 3 (title tag and step titles lose the pages and the textbook's exercise numbers).

**What was added to the shared code:**
- `logic/squareFold.js`: `init({ exactOnly, radius })`, `tickRoot` / `landsOnTick`, `pin` (the `nearTick` verdict with `free`), `pinExact`, `exactToPin`,
  `allSolved`, `coachOf`; `xText` writes « 3 », never « 3,0 ».
- `roots/SquareFold.jsx`: the v2 treatment (`onVerdict`, `chains` 'full' / 'predicted' / 'build' / 'none', `predict` + `predictCards` + `predictKind`,
  `handDone`, `radius`, the journal, the bounce, controls locked during a prediction or a question, always guided, `{ tk: 'reset' }`) and its first LabCoach;
  `CHAINS_PLAYER`, `chainOfPlayer`, `eqBuildOf`, questions `posSqFill`, `zeroCountFill`, `negCountFill`, `eqBuild`; a11y (indigo focus rings with offset,
  live verdict and prediction regions always mounted, `aria-disabled` handle, sr-only « solved » word, table row headers). Page and teacher unchanged.
- `rounds/roundsModel.js`: `{ solvedAll: n }`.
- `kit/questions.jsx`: in the two-column batch (player), the row label no longer reserves 14rem — it stacked the choices and overflowed at 1024 × 768.
- `mission/FoldStripScene.jsx` registered as `mission.scene: 'fold-strip'`.

**Traps met:**
- **`ns` is a reserved i18next option** (the namespace): a string interpolated with `{{ns}}` comes out as its RAW KEY in the browser while the jsdom
  render test passed. The lab's page questions `posMirror` and `negWhy` had it already (a page bug too); renamed `{{neg}}`, and a test forbids `{{ns}}` in
  `squareFold`. (Another lab's string still uses `{{ns}}` — `lesson.manipulation.json` line ≈ 5801 — not touched here.)
- Several `$…$` runs in one Arabic sentence reorder (the build prompt « ابنِ: □ ⇔ □ أو □ ») — one formula per sentence; the ⇔ « يعني » lives in the
  build's operator.
- An equation in a PLAIN-text lead (« x² = 1 ، x² = 0 ») reorders in RTL — the cards carry the equations (test).
- A Node script imports the content files (`check:lessons` coverage): `content/*.js` must not import a sibling without its extension — the r1 table is
  inlined (`TABLE`, tested equal to the activity's).
- The help card « لا بأس — جرّب أصغر » appears after two wrong answers — answer right in a walk.

**Verification:** see the commit message (vitest `src/lessons`, `check:lessons`, `lab-rollout-status --lesson muadalat-x-murabba` ✅, Playwright at
1366×768, 1024×768 and 1920×1080: every round ★★★, the reset path, the easier round and back, a reload after r1 (step 1 complete), module 2's round and
peer sheet (restored after reload), home, « أستعدّ », final test, knowledge map, modules 1–7 unit by unit — 0 `data-fit-overflow`, 0 page scroll —,
teacher view unchanged).

**ECC review (react, code, a11y — 2026-11-10), fixed:**
- the checkpoint after module 3 held `\times` in a single-quoted string — a TAB and « imes » on screen: now `\\times`, and `_unit/missionStrings.test.js`
  forbids a control character in every unit-2 checkpoint and opening;
- « أمثلة الكتاب » in the knowledge maps of this lesson AND of `jidhr-tarbii` (missed in lesson 1) → « أمثلة محلولة », and the same test scans every
  unit-2 `knowledgeGraph.js`;
- **shared:** every converted lesson (unit 1 included) wrote the right checkpoint answer FIRST — `MissionCheckpoint` now shows the options in an order
  drawn from the checkpoint's `id` (`missionModel › checkpointOrder`: stable across reloads, different between checkpoints; the stored answer stays the
  ORIGINAL index; test over every converted lesson that the right answer is not mostly first). No config was edited;
- the lab kept ONE prediction — predicting card 2 before solving card 1 lost card 1's verdict: now one per card; a repeated refused answer is counted again
  once x has moved (3 → 5 → 3), and still not when the same refusal is sent twice at the same x (a second non-free « nearTick » at the same x included);
- **shared:** `useSavedAnswer` returns `ready` (the server's copy has arrived, or the server did not answer): the module-1 effects of lessons 1, 2 and 3
  that MERGE what is kept no longer save before it — a partial, newer save could have overwritten the server's copy;
- the scene's graduations now cross the strip (they were parallel to it);
- **teacher view note:** `square-fold › xText` writes « 3 », never « 3,0 » — on the page and the teacher's view too (handle, journal, table, messages);
- a11y of the lab: a negative a inside an Arabic verdict is an isolated LTR run (« −4 », never « 4− »); − / + follow the LTR line (− on the left); every
  verdict is re-announced (keyed by the answer) after a hidden « صحيح. » / « خطأ. »; the slider says « x يساوي X ومربّعه Y »; the hatch is drawn at full
  contrast and the refused arrow ends opaque; the note says « الأعداد السالبة … لا يبلغها أيّ مربّع »; « … » cells say « لم تُجرَّب بعد » to a screen
  reader, and the page's table has a hidden caption;
- **shared:** `BatchChoiceQuestion` — each choice group is named by its row label, a hidden « (صحيح) / (خطأ) » follows each row after checking, the
  feedback sits in an always-mounted live region, emerald-700 / rose-700 behind white text, indigo focus rings with an offset.
**Rejected by the coordinator (not now):** moving the focus into the prediction / question column when the lab locks (the same pattern in every lab);
the SVG's `role="img"` content (the slider and the text carry it); the selected card's colour (`aria-pressed` is there); a TTS reading of the minus
sign and the decimal comma; module 2's peer sheet on the page (as in lessons 1–2); x² = 5 in module 2.

**Open on this lesson:** module 2 keeps x² = 5 (its step 2 asks how to write the solutions of x² = 5; in the climax 5 is only a points penalty) — the
test allows it there only; textbook exercise badges (« تمرين 12 ») stay inside `TextbookExercise` as in lessons 1–2; e2e specs of the old student view.

## Unit 2, lesson 4 — `amaliyat-judhur` « العمليات على الجذور التربيعية (الجداء والقسمة) » (2026-11-10)

**Council (2026-11-10, a real council: 5 advisors, 5 anonymous peer reviews, chairman; the arithmetic re-verified by the coordinator)** on how
`square-tiling` lives in the player. Verdict applied:
- **The content test FIRST.** `content/tilings.test.js` was written before the round data: per card, the accepted k > 1; every goal reachable by a
  student who tiles (three stars on a clean play); every value the lab DISPLAYS — tile area, side k√b, refused quotient, chips and decoys of the
  questions, predicted k — scanned against the climax's numbers (180, √180, 6√5, 5 as a tile area, 12, √12, 2√3, 192, 8√3, 108, 45, 3√5, 18, 90, 150) and
  lesson 5's (200, 10√2). The values come from `logic/squareTiling.js › shownValues`, built on the SAME pure builders as the lab's questions. It would
  have caught 72 → 18 and 288 → 12 (both dropped, with 36 and 48).
- **Chains.** r1 (27): « مساحة البلاطة؟ » (3) → « الضلع؟ » among 3 × √3 / 9 × √3 / √3 × √3 → BUILD « √27 = 3 × √3 » (the decoy tile 9, « × » visible) →
  the rule « √(k²×b) = k×√b » only (« جذر جداء = جداء الجذرين » stays on the page's steps). r2 (32): one chip at the discovery, the BRIDGE « √(4 × 8) =
  √4 × … » → √8. r3 (98): the QUOTIENT chip « √2 = √(98 ÷ …) » → 49. ⭐ (96): the tile area. Lesson 5's chain is fixed now as data (`fullS`): the
  largest-k tile's area → BUILD « √n = k × √m » (decoy: a smaller valid k and the root of ITS bigger tile) → the rule « أكبر بلاط يصلح ← بلاطة لا تُقسَم
  من جديد ».
- **Goals.** `{ discovered: true }` — the lab's own mode-aware `discoveryReady` (two valid k > 1 and a refusal; the largest k and a contrast), announced
  once by `onTrial { tk: 'discovered' }` — on cards with two valid k > 1 (32, 96); `{ exact: k }` on single-valid cards (27 → 3, 98 → 7, practice 8 →
  2). The FIRST refusal of a round is free (verdict `free: true`: it counts for the goals, never for the « few trials » star); trials count from the
  second refusal. A k tried again is not a new trial.
- **Predictions.** Two yes/no per round « هل يعطي k = … بلاطًا مساحته عدد طبيعي؟ », one on a valid k and one on a refused k (truths differ, also on
  single-valid rounds): r1 2 ✗ / 3 ✓, r2 2 ✓ / 3 ✗, r3 4 ✗ / 7 ✓, ⭐ 4 ✓ / 3 ✗ — asked before the first gesture, judged when that k is tried. Lesson 5
  (`predictKind: 'smallest'`): « which k gives the smallest tile? » among given k — which must include a refused k above the largest valid one.
- **Rounds.** r1 27 · r2 32 (2√8 and 4√2: the same side, two names) · r3 required 98 · ⭐ 96 · free chips 27, 32, 50, 75, 96, 98 · practice 8 (2√2).
- **No tile counts anywhere in the player.** k = 4 (16 tiles) or k = 6 (36 tiles) are accepted in the DRAWING only: no number of tiles, no question on
  it, never « count × area » — only k, the tile area and the side. A refusal shows a large « ✗ مساحة البلاطة ليست عددًا طبيعيًا » with the exact quotient
  small underneath, NOT reduced (« 98 ÷ 36 », never 49/18 — a reduced fraction can bring in another number).
- **Stuck student.** Three refusals in a round offer « جرّب أصغر » (round field `helpAfterRefusals: 3`) → the practice round, whose win returns to
  the round left. The guide (LabCoach) NEVER points at a valid k (the coordinator overrode the chairman): the handle, then the ruler for another try.
- **Checkpoints.** « √7 × √28 = ? » (14 / √35 / 196); « √2 + √2 = √4 ؟ » (لا / نعم); « √147 ÷ √3 = ? » (7 / 49 / 7√3). No k√b reconstruction of an
  area — `content/mission.test.js`.
- **Scene.** A school courtyard paved with square slabs by two pupils (`KidFigure`, a girl in hijab, a boy), no numbers; `slabs` lets lesson 5 reuse it
  with bigger slabs.
- **Also.** A visible tally « ✓ … · ✗ … » so the student knows when the round is done; a refused tiling is crossed out in the drawing (not only its
  colour); k√b inside Arabic text through `MathText`.

**What was written (per lesson):** `lesson.config.js` (`studentView: 'mission'`, `mission` — scene `courtyard-slabs`, title « لوحة الزليج: أيّ البلاطات
تصلح؟ », tools `jidaa-jidhrayn`, `qismat-jidhrayn`, `la-tawzi-jam`, `jidhr-a2b`, climax = module 5 (the zellige panel of 180 dm²), the three checkpoints
above; `knowledgeMapOpen`; the description, module and resource lines no longer cite the textbook) · `content/prep.js` + test (10 « أستعدّ »: « مربّع
جداء ومربّع حاصل قسمة » with `quwat-adad-nisbi`, « الجذر التربيعي » with `jidhr-tarbii` to revise; the three `priorKnowledge` are measured) ·
`content/tilings.js` + test · `content/peerSheet.js` + test (« ورقة ياسمين »: « √(4 + 9) = √4 + √9 = 5 »; the module's own examples 16 + 9 and 100 − 36
are not reused) · `content/mission.test.js` · modules 0 (the ladder), 1 (`PlayerSwitch` + `LabRounds labId="m1-tilings"`; step 1 waits for r1, step 6
(the quotient table) for r3; the lab's trials and finished questions are SAVED — `useSavedAnswer` key `lab-tilings`, merged only once `ready` — so a
reload never blocks a step), 2 (« ورقة ياسمين » is step 4), 3 and 4 (tags, step titles and objectives lose the pages and the textbook's exercise numbers).

**What was added to the shared code:**
- `logic/squareTiling.js`: `tilesWhole`, `validBig`, `tally`, `coachOf`, `rootText`, `refusedPlain` / `refusedPlainTex`, the question builders
  `areaOptions`, `sideOptions`, `tileBuildOf`, `bridgeOptions`, `quotientOptions`, `simplestBuildOf`, and `shownValues` (what a player screen can show).
- `roots/SquareTiling.jsx`: the v2 treatment in both modes (`onVerdict` with the free first refusal, `{ tk: 'discovered' }`, `chains` 'full' / 'bridge'
  / 'quotient' / 'area' / 'fullS' / 'none', `predict` + `predictKs` + `predictKind` 'whole' / 'smallest', `choices`, `handDone`, the tally, the journal,
  the crossed-out refusal, controls locked during a prediction or a question, always guided, `{ tk: 'reset' }`) and its first LabCoach; `CHAINS_PLAYER`,
  `chainOfPlayer`, questions `areaFill`, `sideChoice`, `tileBuild`, `ruleP1`, `bridge`, `quotient`, `bestFill`, `simplestBuild`, `ruleS1`; a11y as in
  `square-fold` (indigo rings with offset, `aria-disabled` handle, live prediction region always mounted, sr-only « صحيح. / خطأ. » before a verdict,
  − / + in the ruler's LTR order, journal row headers). Page and teacher unchanged.
- `rounds/roundsModel.js`: `{ discovered: true }`, verdicts `free`, `countedTrials`, round field `helpAfterRefusals`.
- `mission/CourtyardSlabsScene.jsx` registered as `mission.scene: 'courtyard-slabs'`.
- **shared:** `primitives/LabCheckpoint.jsx` — the content of a choice button no longer takes the pointer (`pointer-events-none`): a KaTeX
  formula (√…) overflows, invisibly, ABOVE its button, so a tap on a choice selected the one BELOW it (found by the walk: the centre of choice 1
  belonged to choice 2). Every lab's questions benefit.
- **shared:** `kit/questions.jsx › BatchChoiceQuestion` takes `rowCols="auto"` — two columns in the player for 6 rows or more, one elsewhere —
  because a MODULE does not see the player's context (`useInMissionPlayer` is false at a module's top level; only components inside the player
  tree read it). Used by module 1's two tables (6 and 8 rows), which overflowed at 1024 × 768.
- **shared:** `components/StatementFigure.jsx` draws nothing for a plane figure WITHOUT points (the golden-number exercise of this lesson keeps
  its extraction data `{ AD: 1, AE: '1/2' }`, drawn apart by `GoldenFigure`): it rendered an empty box and logged « viewBox NaN » — on the page too.

**Traps met:**
- A tiling's refused quotient, once REDUCED, can show a number the lesson forbids (98 ÷ 36 = 49/18, 50 ÷ 4 = 12,5): the player shows it unreduced.
- A count in Arabic (« 2 بلاطات », « 1 بلاطات ») is wrong grammar for k = 1, 2 and 11+: the player strings say « عدد البلاطات على كل ضلع: k ».
- `useInMissionPlayer()` called at a module's top level is always false (the provider wraps the player's content, not the module): use a
  component-level option (`rowCols="auto"`) instead.
- The shell refused a heredoc holding JS template literals (« could not be checked for dangerous rm ») — those files were written with the file tool.

**Verification:** vitest `src/lessons` green; `check:lessons` exit 0 (entry 241.3 KB ≤ 245); `lab-rollout-status --lesson amaliyat-judhur` ✅;
Playwright at 1366×768, 1024×768 and 1920×1080: every round ★★★ (27, 32, 98, ⭐ 96, the free workshop on 50), the reset path, three refusals → the
practice round 8 and back, a reload after r1 (step 1 complete), the peer sheet (restored after reload), home, « أستعدّ » (10), the final test (6),
the knowledge map, modules 1–8 unit by unit — 0 `data-fit-overflow`, 0 page scroll, no console error —, teacher view unchanged.

**ECC review (react, code, a11y — 2026-11-10), fixed:**
- **shared:** the win card's « few trials » line counted the free verdicts while the stars did not — both now read `roundsModel › starCriteria`
  (`clean`, `few`), one source, tested.
- **shared, lessons 3 and 4:** a round could be WON while its question was open (the bridge of r2 met the goal `{ discovered }` in the same tick it
  opened, and could be skipped). Every question a round asks is now in its goal: here `{ checkpoint: 'tile' }` on r2, r3 and ⭐ (r1 already waits for
  `rule`); in `muadalat-x-murabba` `c0` / `c1` on its r2, `c0` on r3 and `c1` on module 2's round (a card solved in another order met the goal
  first). Lessons 1–2: their only chains end on `rule`, already a goal. Tests in both content files.
- **shared:** « أعِد التجربة » of a lab question put the task back but the round KEPT what the lab undid. New event `{ tk: 'retry', groups? }`
  (`logEvent`): `square-tiling` drops every verdict and the discovery (its first refusal is free again), `square-fold` drops the retried card's
  answers, `square-root-side` drops everything when step 1 restarts (a step-2 retry returns to the step-1 snapshot, whose trials stay trials).
  Predictions and answered questions stay. Tested.
- k = 1 (the tile IS the square) is no longer a trial nor a journal column.
- Module 1's trial memory is keyed by SQUARE then by k (a one-level merge let one square's trials overwrite another's); the area of a trial is
  recovered from the trial (b × k², or the reduced quotient × k²); the step-1 line speaks of round 1's square only (27) in the player.
- The chains are never posed without a valid k > 1 (`firstValid`) — a latent crash on a card with a single valid tiling.
- **Answer positions:** the chips and choices of the lab's questions turn with the numbers (`logic › spin`); **shared:** `PeerSheet` shows its fixes
  in an order drawn from the sheet's id (`peerSheet › peerFixOrder`, the checkpoints' own `checkpointOrder`) — the right fix was first on every
  sheet; tested over every converted lesson's sheet.
- The wrong-prediction line is the lab's own (« انظر إلى مساحة البلاطة: هل هي عدد طبيعي؟ »), not the football's « ما بقي ».
- `sideOptions` never writes the right side twice when √b = k (n = k⁴).
- **a11y, shared (`LabCheckpoint`, every lab):** focus ring `ring-2 ring-indigo-600 ring-offset-2`; the input border indigo-500; white on sky-700,
  emerald-700 and amber-700 (not sky-500 / emerald-600 / amber-500); the number badge slate-600; the card is `role="group"` beside the lab in the
  player (a modal dialog only on the page, where it covers the lab); an answered option says « (صحيح) / (خطأ) » to a screen reader, and
  `aria-pressed` is true only on the option the student chose. **`BatchChoiceQuestion`:** a text option (no formula) keeps the text font and may
  wrap; the right option says « (صحيح) » after checking. **The tiling lab:** the journal's k cells are column headers; « k = N » under the ruler
  is hidden from screen readers (the slider's value text carries it).

**Rejected / later (coordinator):** `disabled` → `aria-disabled` focus loss on − / +, the checkpoint options and the choices (the same pattern in
every lab — final report); the handle ring at k = min (verified on the screenshots, not clipped); reflow at 400 % zoom (phones unsupported); the
slab-area font inside the decorative SVG; a full render test of `<SquareTiling>` in the player; « نشاط 4 » in a title (an activity number, not a page).

## Unit 2, lesson 5 — `tawzif-khawass-judhur` « توظيف خواص الجذور التربيعية » (2026-11-10)

**Why a second council.** The lesson-4 council had picked lesson 5's cards (128, 32, 75, 98). Reading lesson 5's OWN climax (module 6, « طاولة
الفسيفساء » : 200 dm² → 10√2, 10 pieces a side, 100 pieces, the smallest piece 2 dm², a trainee's 2√50 with 50 = 5² × 2 and 25 sub-pieces, 120 دج,
12 000 دج, 12 days) showed that those cards rehearse it: every one but 75 ends on a smallest tile of 2 (the climax's own answer), and 128's ruler
reaches k = 10 (« 128 ÷ 100 »). The conversion stopped and asked.

**Council (2026-11-10, a real council: 5 advisors, 5 anonymous peer reviews, chairman; predictions re-checked by the coordinator) — option C:**
- **The forbidden rule, by ROLE** (`content/forbidden.js`, mechanical; guide rule « forbidden values by role »): never shown in the lab under any
  role — 200, √200, 10√2, 2√50, 5√8, 100√2, 120, 12 000, 12, 10, 100, 50 (no contrast ends on a tile of 50); 25 only as k² (« n ÷ 25 »); 2 and √2
  only on 32 and 72, as the RESULT of the student's own tiling (never a decoy; k = 2 as a count of tiles a side stays allowed); the method « number
  of pieces = k × k, then the price » never shown; free-mode chips follow the rule (no 200, no 50).
- **The test FIRST**, run on the card list before any content: `content/tilings.test.js` builds, per card, everything its screen can show —
  `logic/squareTiling.js › simplestShown`: n, k from 1 to ⌊√n⌋, k², the tile areas, √b, the forms k√b, the area chips and decoys, the build tiles, the
  predicted k — each with its ROLE, and asserts `violations()` is empty. Negative controls: 128 (k = 10 → 100), 200, 50, 98 (√2) are caught.
- **Rounds:** r1 75 by hand (5√3; one valid tiling: the contrast is a refused k = 6, 7 or 8) with the full chain `fullS` (the largest-k tile's area →
  BUILD « √75 = 5 × √3 » → the rule « أكبر بلاط يصلح ← بلاطة لا تُقسَم من جديد »); r2 32, the bridge from lesson 4 (2√8 or 4√2 — which is simplest?),
  BUILD only (`buildS`); r3 80 required (4√5, contrast 2√20), the area only (`bestS`); ⭐ 72 (6√2, contrasts 3√8 and 2√18), BUILD; practice 27 (3√3,
  refused 4 / 5); free chips 27, 32, 54, 63, 75, 80, 96. 128, 288, 45 and 98 dropped; 72 only as the challenge. Goals: `{ discovered: true }` +
  the chain's checkpoint (`rule` for `fullS`, `tile` otherwise) — never won while its question is open; first refusal free; « جرّب أصغر » after three
  refusals.
- **Predictions:** « أيّ عدد من البلاطات على الضلع يعطي أصغر بلاطة تصلح؟ » among three k that include a refused k above the largest valid one, the
  right k moving (r1 [7, 3, 5], r2 [4, 2, 5], r3 [2, 6, 4], ⭐ [6, 8, 3] — last, first, last, first), then a yes/no « هل يعطي k = … ؟ » whose truth
  alternates (3 no, 2 yes, 3 no, 2 yes). New lab prop `predictAlso` (the yes/no after `predictKind: 'smallest'`).
- **Checkpoints:** after M1 « √45 = ? » → 3√5 (decoys √9 × 5, 5√3); after M2 « 2√3 + 5√3 = ? » → 7√3 (module 2 PRACTISES adding like roots: its step 2
  and the brick `tabsit-tawzii`); after M3 « 6 ÷ √3 = ? » → 2√3 (rationalising is TAUGHT in module 3 — `naqt-maqam` — so it is known when this
  checkpoint, placed after module 3, is asked). None uses lesson 4's climax (180, 6√5).
- **Scene:** the courtyard of lesson 4 re-paved with bigger slabs — a variant `courtyard-big` (`CourtyardSlabsScene slabs={3}`), not a new scene.

**Done:**
- **Lab (`square-tiling`, shared, player only):** `predictAlso` (a 2nd yes/no prediction after « smallest »; judged when that k is tried, « smallest »
  at the largest k); `avoid` (numbers no « مساحة البلاطة » decoy may show — `areaOptions(n, k, avoid)` then takes the next candidates; without it,
  nothing changes for lesson 4); the chains `buildS` and `bestS` (posed at the discovery, like `fullS`); « بلاطة تصلح » in the « smallest » prompt; the
  rule chip worded « أكبر بلاط يصلح ← بلاطة لا تُقسَم من جديد ». `simplestShown` (pure) lists what a simplest screen can show, with roles.
- **Content:** `content/forbidden.js` (the rule), `tilings.js` + test, `prep.js` + test (10 statements: « النشر والخاصية التوزيعية » → revise
  `nashr-jabri-3am`, « جداء جذرين وحاصل قسمتهما » → revise `amaliyat-judhur`; the catalogue already lists `amaliyat-judhur` as the prerequisite),
  `peerSheet.js` + test (« ورقة رياض »: √96 = 2√24 then « 24 is not a square, so it is the simplest » — the error is stopping; fixed to 4√6),
  `mission.test.js`. Module 0 on the ladder (question 2 now diagnoses `jidhr-taarif`), module 1 in `PlayerSwitch` + `LabRounds` (`m1-simplest`; step 1
  waits for round 2 — its question is about 2√8 — and its trace comes from the WON rounds, so a reload never blocks or empties it), module 2's last
  step the peer sheet. `mission` block, `knowledgeMapOpen: true`. Every student-visible textbook reference removed (« الكتاب ص … » tags, exercise
  numbers in step titles of modules 2, 4 and 5, « تمارين الكتاب … », the module descriptions, a knowledge card's « تمرين 1 »).

**Verification:** vitest `src/lessons` 650 files, 12 057 tests green; `check:lessons` exit 0 (entry 241.2 KB ≤ 245; lesson 5's `W_PRIOR_NOT_DIAGNOSED` fixed);
`lab-rollout-status` ✅ for the five unit-2 lessons. Playwright at 1366×768, 1024×768 and 1920×1080: every round ★★★ (75 with the full chain, 32, 80,
⭐ 72, the free workshop on 54; both predictions per round), a wrong answer then « أعِد التجربة » (log and tally emptied, then ★★★), a wrong prediction
then « إعادة » (★★★ again), three refusals → the practice round 27 and back, a reload with r1–r2 won (step 1's trace names 75 and 32), the peer sheet
(restored after reload), home (the re-paved courtyard), « أستعدّ » (10, review « راجع » amaliyat-judhur), the final test (5), the knowledge map,
modules 1–9 unit by unit — 0 `data-fit-overflow`, 0 page scroll, no console error —, teacher view unchanged (no player, no rounds, the two levels).

**Traps met:**
- A decoy builder can show a forbidden number the lesson never wrote (`areaOptions(72, 6)` → 12, `(80, 4)` → 10 as the third candidate): the lesson
  hands its list to the lab (`avoid`).
- A second prediction judged on the k that COMPLETES the discovery (r2: 4 then 2) opens the round's question in the same move, so its ✓ / ✗ line
  is hidden behind the question (the star still counts) — tried in the other order, it shows.
- The « جرّب أصغر » card after two wrong answers covers « التالي » at 1024 until « أواصل هنا » (existing behaviour, already noted in lesson 4).
- The shell refused heredocs holding Arabic text (« could not be checked for dangerous rm »): patches were written as files.

**ECC review (react, code, a11y — 2026-11-10), fixed:**
- **The knowledge card and map showed the climax.** `knowledge.jsx`: the memo quiz « أبسط كتابة للعدد √200 » (10√2 / 5√8 / 100√2 — the climax's answer and
  decoys, open from the start with `knowledgeMapOpen`) → √63 and √245; the example √72 = 6√2 (the ⭐ answer) → √54 = 3√6; the « توقّع » prompt on 288
  and « 12 بلاطة » → on 32. `knowledgeGraph.js`: the node « 8، 18 و 50 » → « 8، 18 و 98 » (its own text, no longer the book's solution with √50), and
  √8 + √50 → √8 + √18. `content/textbook.js › TILING.example` (shown on the card): 288 with « 12 × 12 بلاطة » → 32 with 4 slabs a side.
- **Unit-wide scans** (`_unit/missionStrings.test.js`, the five lessons): the knowledge cards and map never show their OWN lesson's climax signature
  (lesson 1 √34 / 5,83; 2 the 2,89 / 1,74; 3 √11, 3,3, 0,09, x² = 64 / −36; 4 √180, 6√5, 3√5, 180, 192; 5 √200, √50, 10√2, 2√50, 5√8, 100√2, 200, 120,
  12 000); `knowledge.jsx`, `knowledgeGraph.js`, `content/textbook.js` and `content/exercises.js` never say « الكتاب », « تمرين N : » nor « خطأ مطبعي »
  (comments and `src(…)` metadata excluded; a guard asserts the 18+ files are really read). Hits in lessons 1–4: lesson 2's « قائمة الكتاب » note
  (reworded); none on the climax side.
- **Textbook voice:** « تمرين 1: » / « تمرين 2: » stripped from the text module 2 renders; the two « صحّحت المنصّة خطأً مطبعيًا في نص الكتاب » notes
  (modules 4 and 5) reworded in the platform's voice.
- **Module 1 step 2:** √8, √18, √98 (was √50 → 5√2, one step from the climax's 2√50 = 10√2), on the page AND in the player; its title in `MathText`;
  its intro the platform's own sentence. **Kept, noted:** module 2's worked example A = √8 − 3√18 + 2√50 − 7√2 (a worked example, lower risk).
- **(shared, lab) A prediction's result was lost when the move that judged it also opened the round's question** (the question hides the lab's live
  line). `logic › judgedPredictions` (pure, tested): a prediction is judged when its k is tried (« smallest » at the largest k) — and EVERY one at the
  discovery, even a k never tried. The lab shows each judged result once (its own line, its own sound) and the round's question waits
  `PRED_HOLD_MS` (1,6 s) — the same idea as the win card's delay. Also for lesson 4 (its chains open at the first valid tiling, which can be the
  predicted k).
- `predictAlso` never holds the largest k (filtered; tested on the rounds).
- `areaOptions` always returns three distinct areas, with or without `avoid` (falls back to b + 4, b + 5, …) — swept n = 1..100, every valid k.
- `simplestBuild` drops its second hint when no smaller valid k exists (« عدد البلاطات على الضلع 1 »).
- `data-scene` is an explicit prop of `CourtyardSlabsScene` (`courtyard-big` passes it).
- Module 1 step 1 chooses its version by the player itself (`PlayerSwitch`), never from the rounds already won.
- **a11y:** one `PredictTray` per prediction (`key`), numbered « 1 من 2 / 2 من 2 »; **shared:** `PredictTray` focuses its question on mount (named by
  it: `aria-labelledby`), its buttons have a border amber-600 and the indigo-600 focus ring, a choice may carry a spoken name (`aria`: « عدد البلاطات
  على الضلع: 7 », k in `<bdi dir="ltr">`); after the last prediction focus returns to the ruler's handle. The live line keys each result by its
  prediction, with a hidden « توقّعك عن أصغر بلاطة: » / « توقّعك عن k = …: »; its emoji and ✓ / ✗ are `aria-hidden`; a wrong « smallest » has its own
  line (« قارن مساحات البلاطات: أيّها أصغر؟ »). The free round says « مساحة المربّع الآن N » when an area is chosen.

**Rejected / later (coordinator):** teachingScope « طريقة الكتاب » (teacher scope only); PeerSheet's struck-line text and status-with-content (shared,
final report).

## Unit 9, lesson 1 — `talis-hisab-atwal` « خاصية طالس وحساب الأطوال » (2026-11-10)

**Council verdict (2026-11-10, binding — `L1`):** L1.1 = C, a NEW one-lane player lab `shadow-meet` on `shadowWorld.js`'s pure functions; `shadow-world`
(1 232 lines, page and teacher) is untouched — the page modules keep it, the player plays `shadow-meet` through `PlayerSwitch`. 1 cm resolution in the
player, a meet magnet, the stick starts away from the meet, the sun's rays drawn parallel and said. The meet is the verdict; then the height is asked
(a 3-option tap in r1–r2, a template « H = [ ] م » in r3 and ⭐). No rule text box (r1 ends on a pick among three rule sentences). Decoy BA in r1 and
the inverted ratio in r3 as TILES only; « 3,96 » nowhere; quarter-metre heights; hours never 12:30 nor 15:00; a WATER TOWER as the big object. Peer
sheet « ورقة رانية » (the segment error OB/BA). Prerequisites: `amaliyat-natiqa` only.

**What was written:**
- `content/shadows.js` (`M1_ROUNDS`): r1 lamppost 2,75 m at 14:00 (OA 3,3 · OB 1,2 · BA 2,1; chains « read » then « rule »), easier 1,5 m; r2 the water
  tower 6,5 m at 14:00 then 16:00 (7,8 / 1,2 / 6,6 then 14,82 / 2,28 / 12,54; one hour on screen at a time; predictions « the stick's ratio at 16:00 still
  1,2? » → no and « the 16:00 shadow is more than double / about double / less than double? » → less than double, ×1,9; chain « same »: OB/OA = 2/13);
  r3 a new pole 3,75 m at 14:30 — plant the flag where its shadow ends (4,95), easier 2,25 m → 2,7, chain « build » with the inverted ratio as decoy;
  ⭐ at 15:30 the palm by ratio (7,82 → 4,25) and the tower by meet (13,8 / 1,84 / 11,96 → 7,5); free: heights 5,75 / 6,75 / 9,25, hours 13:00–16:00
  without 15:00. Every round is PLAYED to its goal in the content test.
- `content/forbidden.js` + `content/mission.test.js` (the climax « عرض في ساحة الحيّ » by role, plus the synthesis's 7,25 / 11,6 / 1,6 / 15:00 and 3,96
  in no role; the dry-run over `logic › shownValues` of every round, with positive controls), `content/prep.js` + test (10 statements; skills « تساوي
  كسرين » → revise `tasawi-muqaranat-kasrayn`, « التناسبية والرابع المتناسب » → revise `rabi-mutanasib`), `content/peerSheet.js` + test (« ورقة رانية »:
  BE/AM = OB/BA, AM = 2,25 instead of 3,25), lesson 1 added to `_unit/missionStrings.test.js`.
- Config: `studentView: 'mission'`, `knowledgeMapOpen: true`, scene `night-cinema` (`mission/NightCinemaScene.jsx` on `thalesSceneKit.jsx`: the
  neighbourhood night cinema, a projector, the screen, a girl in hijab holding the board — KidFigure only, no number), five tools, `climaxModule: 5`,
  four checkpoints (cp-zill 2,8 × 1,25 = 3,5; cp-farasha k = 0,3; cp-ew EW = 9,5; cp-fitha OE = 1,5 → OM = 8,5). Catalogue: `prerequisiteLessonCodes`
  = ['amaliyat-natiqa'], exported and imported (local DB: lesson 207 ← 770).

**Added to shared code:** the lab `shadow-meet` (`geometry/ShadowMeet.jsx`, `logic/shadowMeet.js`, tests `shadowMeet.test.js` and
`shadowMeetPlayer.test.jsx`), registered in `manipulationRegistry.js`, `levels.js`, `packages/core/curriculum/manipulationTypes.js`, strings
`shadowMeet` in `lesson.manipulation.json`; `LabCheckpoint` › build `render` (tiles drawn as real fractions); `lab-rollout-status.mjs` also checks the
labs named in a lesson's `content/*_ROUNDS` (a player-only lab is checked too); `thalesSceneKit.jsx` primitives for the night cinema. Built to be
REUSED by the unit's synthesis (module 7 plays one `shadow-meet` round on the minaret): object, heights, hours and texts are round data.

**Review (2026-11-10, `ecc:react-reviewer`, `ecc:code-reviewer`, `ecc:a11y-architect`; each finding verified in the code):**
- Fixed — a typed answer could survive its box being unmounted (a question or the intro opening): « تحقّق » then sent a value the student no longer saw,
  and the ⭐ round lost one of its three attempts. The draft is cleared whenever the box is not shown.
- Fixed — the same wrong typed answer twice played the sound and reached the round's trace again: it is « already tried », nothing is counted.
- Fixed — a11y: the lengths written on the ground lived only in the `aria-hidden` SVG while the questions say « اقرأ على الأرض »: an always-mounted
  `sr-only` text gives them (`[data-sm-ground-sr]`); after a right answer focus goes to « التالي » (the question unmounts); « تحقّق » reads disabled
  for 0 or less; one live region on the page view (the visible box lost its `role="status"`); the O label darker (#92400E).
- Fixed — module 1's step « الحالة الأولى: الحساب » displayed « 56/15 ≈ 3,73 »: 56 is a climax number in no role allowed; the answer shows « ≈ 3,73 ».
- Fixed after the walk — module 4 overflowed the player at 1024 and 1366 (« النسب المتساوية », « أربعة أشكال », « فيثاغورس ثم طالس »): in the player a
  single-figure exercise has its figure BESIDE it (`data-ex-side`, one `data-paging-keep` block — without it the pager cut the row into ten pages), the
  four figures of « أربعة أشكال » sit on ONE row above it, and the rappel card under exercise 1 is not repeated (it stays in « بطاقتي », open from the
  first screen); the final test's butterfly figure (`FIG_E4`) is narrower (140) — it pushed the fourth option off the screen. Page unchanged.
- Not changed: the retry re-sends `onFinished` (LabRounds ignores a second one); `Scene` re-renders on drag ticks (no lag measured); the tray above the
  scene under 900 px (768-wide tablets fit by the last-resort zoom); slider wording and per-cm announcements; KaTeX names of fraction tiles.

**Verification:** vitest `src/lessons src/features/practice src/pages/unit` 692 files / 12 473 tests green; `check:lessons` exit 0, entry 241,4 KB
gzip; `lab-rollout-status` ✅ for the three lessons. Playwright at 1366×768, 1024×768, 1920×1080: home (scene, 5 tools, non-empty « راجع »), « أستعدّ »
(10 + review), every module unit by unit (0 `data-fit-overflow`, 0 page scroll, 0 clipped `.katex`, 0 raw `$`, 0 console error after the fixes above),
the peer sheet (found, fixed, restored after a reload), the final test (6 questions + review), the knowledge map (no climax number, no « الكتاب »),
the teacher view (the old `shadow-world` with its two levels, no player element), module 1's rounds by hand to ★★★.

**Council of 2026-11-11 (owner: « move this question into the lab? ») — applied the same day.**
- **The empty figure was a pager bug, not a design flaw:** in the player « one element per screen » opened the step's `<svg>` into its
  strokes (only [AM] showed, « صفحة 1 من 3 »). Fixed for EVERY lesson in `ClassroomPaged › isAtomic` (svg, figure, img, canvas, table,
  `data-paging-keep` are never opened); a Playwright scan of unit 9's modules found 0 split drawings afterwards.
- **Round 1 turns the square into the figure** (`chains: 'readFigure'`, goal `read` + `figure` + `ratio` + `rule`): read OB / OA on the square →
  the décor fades and [AM], [BE], (OM), (OA) with the right angles at A and B are drawn on the objects → « which two lines are parallel? »
  (tiles; (OM) and (OA) refused) → the chevrons appear → « why? » (both perpendicular to (OA); decoys: both cut (OM), both start on (OA)) →
  the equality is built (the hypothesis now comes before the conclusion) → the height → the rule. A toggle « أرني الساحة / أرني الشكل ».
  Played by hand at 1366 and 1024: ★★★, 0 overflow, 0 scroll, 0 console error.
- **Module 1 step 1 (player) checks the transfer:** `FIG_TRANSFER` — K, L, N, P, Q, rotated, parallels tilted, no ground — « which point plays
  the role of O? » with bare letters (N, K, L, Q), figure and question on ONE screen (`data-paging-keep`). Its saved answer has a new key (the
  prompt changed); the old one is simply not shown. The unused player strings `bridgePlayer` / `parallelPlayer` were removed. Page and teacher:
  unchanged (`shadow-world`, `FIG_SHADOW`, the old question).
- Not done: tapping the lines ON the drawing (tiles are used); the reverse morph (« dress the figure back »); the other unit-9 lessons have no
  scene-to-figure gap (their labs are already figures).

**No back-and-forth (2026-11-11) — a reading screen kept:** module 2 step 1 « الخاصية في ثلاث وضعيات » shows the three situations of the
property side by side and asks nothing; the step's question has its OWN figure beside it on the next screen (nothing to look back at).

## Unit 9, lesson 2 — `aksiya-talis` « الخاصية العكسية لخاصية طالس وإثبات التوازي » (2026-11-10)

**Council verdict (2026-11-10, binding — `L2`):** L2.1 = B, an explicit « ضع الميزان » button: the bubble is HIDDEN while the ends move and a trial is
ONE press (it also fixes the « every commit » counting); from round 2 the two ratio chips AB′/AB and AC′/AC are picked before the bubble shows (the
chip AB′/BB′ is not offered on the X-trestle). L2.2: ladder → crossing at 1/3 → a FREE crossing (not a partner-hole task) → ⭐ → free. L2.3: the build
keeps AB′/AB on the left; AC′, AC and the decoy CC′; the swapped equality is accepted (a shared `accept`). L2.4: the opposite-sides trap and the
« order » question move to r3; r2 P1 « same side, wrong ratio » → no, P2 « both past A » → yes. L2.5: checkpoint 1 on a concrete pair (1/4 vs 1/2).
L2.6: the logic minimum lowered to 2 (practice ladder 2 / 4, goal `{ exact: 1 }` + the chain). L2.7: the bars always go on past A on the X-trestle, no
coach line about it. L2.8: shared scene primitives, a thin scene file. Peer sheet « ورقة رياض »; prerequisites talis-hisab-atwal + amaliyat-natiqa.

**What was written:**
- `content/planks.js` (`M1_ROUNDS`): r1 the ladder 3 / 6 by hand (`ratios: 'hide'`, chains `ladder`: « lv » — the two ratios of the first level plank in
  one tap each — then « rule »: BUILD « AB′/AB = AC′/AC » and the rule), r2 the X-trestle 9 / 12 at the teacher's 1/3 (`ratios: 'pick'`, chain `side`,
  predictions (3 ; 6) → no and (−3 ; −4) → yes), r3 REQUIRED the free X-trestle 8 / 12 (chain `cross`: « beyond » — the ratios of a level plank past A
  are positive lengths — then « order » — which point lies between the other two on each line — and the rule; prediction (2 ; −3) → no, right option
  second), ⭐ 12 / 16 (`{ allExact: [1, 2] }` in three trials), free pairs (6 ; 9), (4 ; 8), (12 ; 18), (14 ; 21). Practice rounds 2 / 4, 3 / 6 at 1/3,
  3 / 6 free (« جرّب أصغر » after three refusals). Goals hold every question the round asks; the content test PLAYS each round to ★★★.
- `content/forbidden.js` (the climax signature BY ROLE: bars never a multiple of 10 nor 24 nor in 4 : 5; distances never 24, 30, 36, 44–46; ratios
  never 3/10, 9/20, 23/50 or their inverses / decimals; 80, 100, 25, 2400, 3600, 3680 in no role — 9 stays a length, it is a weight in the climax),
  `content/mission.test.js` (the dry-run over `logic › shownValues` of every round and practice round — every notch, every drag-reachable ratio, every
  chip and decoy, the prediction positions, the free pairs — plus the checkpoints, the peer sheet and the prep; no method or fix of the climax in a
  checkpoint; no textbook line in the config), `content/prep.js` + test (10 statements: « تساوي كسرين » → revise `tasawi-muqaranat-kasrayn` (review: the 3AM lesson that teaches the test; the catalogue keeps `amaliyat-natiqa`, the net's `requires` link), « خاصية طالس
  وترتيب النقط » → revise `talis-hisab-atwal`), `content/peerSheet.js` + test (« ورقة رياض »: AM/MB = 6/9 instead of AM/AB = 6/15 = 2/5 = AN/AC, hence a
  wrong « not parallel »; `fixedLines` for the conclusion), the unit-level `_unit/missionStrings.test.js` (lesson 2's signature; lessons 1 and 3 join
  it when converted).
- Config: `studentView: 'mission'`, `knowledgeMapOpen: true`, the `mission` block (scene `paint-wall`, opening = the climax question, tools
  `khassiya-aksiya`, `shart-tartib`, `tariqa-adam-tawazi`, `climaxModule: 5`, four checkpoints after modules 1–4: 1/4 vs 1/2 → not level; midpoints →
  why parallel; Thales vs its converse; AB′/AB = 3/9 = 1/3 with the part-over-rest decoy). Module 0 on the ladder; module 1 in `PlayerSwitch` +
  `LabRounds` (`m1-planks`; step 1 waits for r2, step 2 for r3, their trace comes from the WON rounds); module 2's last step the peer sheet. Every
  student-visible textbook reference removed (« الكتاب ص … » tags and bodies of modules 2–4, « تمرين N — » step titles, « نشاط 2 » in titles, module
  descriptions). Catalogue: `prerequisiteLessonCodes` = talis-hisab-atwal + amaliyat-natiqa (the free-text « حساب واختبار تساوي نسبتين » removed —
  `LEARNING_NET.md` §3bis), exported and imported (local DB: lesson 208 ← 207 talis-hisab-atwal, 770 amaliyat-natiqa, both published).
- Scene `PaintWallScene` (`data-scene="paint-wall"`): the stadium wall painted stripe by stripe as tools are earned, an X-trestle whose plank turns
  level when everything is won, a girl in hijab with a roller, a boy at the level (KidFigure), no number; on the unit's shared primitives
  `mission/thalesSceneKit.jsx` (`SceneBackdrop`, `XTrestle`, `BubbleLevel`, `PaintRoller`, `PaintBucket`).

**Added to shared code:**
- `parallel-level` (player only, gated by `useInMissionPlayer()`; page and teacher unchanged — `parallelLevel.render.test.jsx` green): « ضع الميزان »
  (`[data-pl-press]`), the hidden bubble (`[data-pl-bubble-hidden]`, neutral plank), `onVerdict` (`logic › verdictOf`), `ratios` 'show' / 'hide' /
  'pick' (`logic › chipOptions`), `chains` (`CHAINS_PLAYER`: `ladder`, `ladderEasy`, `side`, `cross`, `none`; questions `lvFill`, `ratioBuild`,
  `beyondFill`, `orderFill`), `predict` ([{ key, at }], judged by `logic › classOf` / `judgedPredictions`, results held `PRED_HOLD_MS`), `choices`
  (bar pairs), the journal « 📋 جدول تجاربك » and the verdict in the side column (with the chips, the side of A and the figure chips — the scene keeps
  the height), `LabCoach` (`logic › coachOf`), `{ tk: 'reset' }`, `{ tk: 'retry' }`, `{ tk: 'discovered' }`, the first refusal free, the same position
  pressed twice not a trial, controls in the drawing's order (`dir="ltr"`), no discovery panel in the player (the rule question's explanation is the
  formal form). Logic: `MIN_BAR = 2`; `kindOf` exported and FIXED (an X-trestle WITHOUT an imposed ratio marked every trial « condition »: now
  `figure` / `order` / `tilted`); `shownValues(props)` for the forbidden-values scan.
- `primitives/labCheckpoint.js` › `isCorrect`: a `build` may carry `accept` (other fillings that are all true — the equality written the other way);
  `LabCheckpoint.jsx` › `BuildAnswer`: `preset` (tiles already placed, which the student may take back); `FillAnswer`: `f.render` (a chip drawn in its
  own shape — a real fraction bar). Tested in `labCheckpoint.test.js`; earlier lessons unaffected (both fields optional).
- `mission/thalesSceneKit.jsx`, `mission/PaintWallScene.jsx`, registered in `MissionScene.jsx`.

**Traps met:**
- The X-trestle at its natural height pushed the chips and figure chips below the fold, and the player zoomed the whole screen down: in the player the
  scene is bounded by the mission area (`useMissionArea`) and everything but the controls moved to the side column.
- After the rule, the shell's discovery panel (formal) made the side column overflow at 1024: the player passes no `discovery`, and the journal gives
  way once the rule is formal.
- A walk that guesses wrong answers triggers « جرّب أصغر » whose card covers « التالي » at 1024 (known; press « أواصل هنا »).
- Module 4 overflowed the player (`data-fit-overflow`): each exercise's figure was drawn TWICE (the module's own `GeoFigure` and
  `TextbookExercise › StatementFigure`), steps grouped up to three exercises, and the figures were 265–300 px wide. Now one exercise per step, the
  figure drawn once, `FIG_EX` at 230 px (ex-11 at 190), and the « rappel » brick after its exercise in the player (`PlayerSwitch`). Module 1's three
  student figures are one paging block (`data-paging-keep`), narrower in the player.
- `useInMissionPlayer()` at the top of a MODULE component is always false (the module renders the player): player-only layout goes through
  `PlayerSwitch`.
- `W_PRIOR_NOT_DIAGNOSED` (medium, non-blocking): `mustaqim-muntasafayn` and `fithaghuras` stay in `priorKnowledge` (module 4 requires `fithaghuras`)
  but the council's 10-statement ladder diagnoses only fractions and Thales / order.

**Review (2026-11-10, `ecc:react-reviewer`, `ecc:code-reviewer`, `ecc:a11y-architect`, each finding verified in the code):**
- Fixed — after a press, moving an end away and BACK showed the bubble with « اضغط » instead of the verdict (`lab.last` was a move): in the player the
  verdict is the trial at the revealed position. A position already tried can be shown again without re-picking the chips.
- Fixed — the verdict's `role="status"` lived in the side column, which unmounts when a question opens (the first level plank opens « lv » at once):
  an always-mounted `sr-only` live region in the stage (`[data-pl-verdict-live]`, keyed per trial; it also carries the predictions' results and the
  pair chosen); the visible box (`[data-pl-verdict-box]`) is plain text with an `aria-hidden` ✓ / ✗ (the glyphs left the `vp_*` strings).
- Fixed — « ضع الميزان » is `aria-disabled` (no `disabled`): focus stays on it after a press; the journal says « شرط الأستاذ غير محقّق »
  (`rowCondition`) for a level plank refused by the imposed ratio, not « مائل »; the ↑ beyond-A mark is `aria-hidden` + a hidden word; the bar-pair
  choices keep their visible text first in their name (label-in-name); `LabCheckpoint › FillAnswer` rows are `role="group"` named by their label (a
  drawn fraction chip alone does not say which ratio it is); the coach step is memoised on its id; the discovery options are computed on the page only.
- Fixed — the « تساوي كسرين » prep skill revised `amaliyat-natiqa` (operations on rationals); now `tasawi-muqaranat-kasrayn`; two constant asserts in
  `mission.test.js` now read the checkpoints' numbers from their prompts.
- Not changed (and why): a retry resumes the chain at its saved question (the shared `useLabCheckpoint` behaviour of every converted lab); the chips
  and ▲▼ still use `disabled` (known open item, every lab); `orderFill`'s options are the drawing's order and its answer moves with the configuration;
  `DiagnosticPlayQuestion` `data-paging-keep` is global (a question is never split from its figure — intended for every lesson); module 4's single
  figure and narrower figures also apply to the teacher page (the page drew each figure twice).

**Verification:** vitest `src/lessons` (657 files, 12 119 tests before the review fixes; the touched folders re-run after), `check:lessons` exit 0
(entry 241,3 KB gzip), `lab-rollout-status --lesson aksiya-talis` ✅, Playwright at 1366×768, 1024×768, 1920×1080 (the build's full walk, then after
the review: press → away → back shows the verdict, focus kept on « ضع الميزان », the live region mounted while « lv » is open, 0 scroll, 0
`data-fit-overflow`, 0 console error).

**Open:** lesson 1 and the synthesis of the unit; the unit page entry (after the three lessons). (`inshaat-talis` joined the unit scan with its
conversion — see below.)

**No back-and-forth (2026-11-11) — a reading screen kept:** module 1 step 1 opens on the situation (text + its general figure); the question's
own three figures sit beside it on the next screen (kept since the first scan).

## Unit 9, lesson 3 — `inshaat-talis` « إنشاءات هندسية وتطبيقات خاصية طالس (تقسيم قطعة مستقيم) » (2026-11-10)

**Council verdict (2026-11-10, binding — `L3`):** L3.1 = A, cap 3 graduations per rail + `sameUnitOnly`, its refusal EXPLAINED in words, with tests.
L3.2: module 1's required round = ratio 2/3, module 2's round = 3/2. L3.3: round 2 with n = 5. L3.4: the contrast (`discovered`) in round 2 only.
L3.5: a wrong construction shows its bands and openings only, never computed lengths. L3.6: the prep's second skill. L3.7: p > q allowed (module 2:
3/2; free: 3/2 and 2/1), and the « same side » prediction answers « after B » when p > q. The player's default length is 9 (never 10). Checkpoints: the
√5 item replaced by « a 12 cm strip in 4 equal parts → AM₃ = 9 », plus one item telling part/whole from part/part. Peer sheet « ورقة سلمى » (two
compass openings). Prerequisites talis-hisab-atwal + amaliyat-natiqa.

**What was written:**
- `content/banner.js` — `M1_ROUNDS` (`m1-divider`): r1 an 8 cm banner in 3 by hand (prediction « which mark joins B? » 2 / 3 / 4; at the first right
  construction the chain « rule »: « AP₃ = ▢ × AP₁ » in one tap, BUILD « AM₁/AB = AP₁/AP₃ » with the decoy P₁P₃, then the rule), r2 11 cm in 5
  (predictions: the mark 5 / 6 / 4, then the number of parallels 5 / 6 / 4; chain « build »: « AM₂/AB = AP₂/AP₅ »; AND the contrast — a second
  construction with another opening or angle, or a failed one), r3 REQUIRED the point of ratio 2/3 (3 graduations per rail, one unit; predictions:
  opposite sides → between A and B, same side → before A; chains « ranks » — the ranks of F and E, then BUILD « AF/BE = MA/MB » with the decoy AB —
  and « rule » — AM/AB, then the rule), ⭐ ratio 1/3 (both points in three trials), free (3 or 5 parts of 12 cm; ratios 3/2, 2/1, 1/2). `M2_ROUNDS`
  (`m2-divider`): the ratio 3/2 (prediction « same side » → AFTER B; chain « build »), then free. Practice rounds 6 cm in 2, 6 cm in 3, ratio 1/2 with
  two graduations (« جرّب أصغر » after three refusals). Goals hold every question the round asks; the content test PLAYS each round to ★★★.
- `content/forbidden.js` (the climax signature BY ROLE: a length never 10, 40, 30, 35, 20, 15, 10/7, 40/3, 5,7; a ratio MA/MB never 4/3 nor 3/4; a
  part of the whole never 4/7, 3/7 nor 4; a graduation rank never 4, the pair 4 : 3 never; 650, 600, 13000, 9000, 22000, 3000, 40/7, 30/7 in no role
  — 4 stays a number of marks on the ray, 30 / 35 / 40 stay angles in degrees, 3/4 stays a part of the whole), `content/mission.test.js` (the dry-run
  over `logic › shownValues` of every round, practice round and free choice — every length, every reachable rank pair with its ratio and both its t,
  the chips, the decoys — plus the prediction options, the lab's refusal strings, the checkpoints recomputed from their own prompts, the peer sheet
  and the prep; no method nor fix of the climax in a checkpoint; no textbook line in the config), `content/banner.test.js`, `content/prep.js` + test
  (10 statements: « خاصية طالس » → revise `talis-hisab-atwal`; « التناسب والرابع المتناسب » → revise `tasawi-muqaranat-kasrayn`, the 3AM lesson that
  teaches the test — lesson 2's review finding applied from the start; the catalogue keeps `amaliyat-natiqa`), `content/peerSheet.js` + test
  (« ورقة سلمى »: (d₁) graduated at 1,5 cm and (d₂) at 1 cm → 2 × 1,5 = 3 = 3 × 1, the ratio 1 instead of 2/3 and M at the midpoint; with one unit
  AM = 2/5 × 6 = 2,4 cm; the test replays her construction in the lab's logic: refused as `units`), lesson 3's signature in
  `_unit/missionStrings.test.js` (and an EVALUATED scan of the knowledge map's nodes — they cite imported lines the raw scan could not see).
- Config: `studentView: 'mission'`, `knowledgeMapOpen: true`, the `mission` block (scene `tifo-banner`, opening = the climax question, tools
  `taqsim-qitaa`, `nuqta-nisba`, `nuqtatan`, `climaxModule: 4`, three checkpoints after modules 1–3: the 6th mark for 6 parts; 3 parts of 8 against
  3 to 5; a 12 cm strip in 4 → the third point at 9 cm). Module 0 on the ladder; module 1 in `PlayerSwitch` + `LabRounds` (step 1 waits for r1,
  step 3 for r2 — their trace comes from the WON rounds); module 2 in `PlayerSwitch` + `LabRounds` (step 3 waits for its round and asks about the
  student's two points on 3/2: 3/5, 3, after B — the page keeps 2/5), its last step the peer sheet. Every student-visible textbook reference removed
  (« طريقة الكتاب » in `knowledge.jsx`, `knowledgeGraph.js` and module 1; « طرائق ص 107 / 109 », « دوري الآن، الكتاب ص 109 », « في شكل الكتاب »,
  « تمارين الكتاب 17 … », « تمرين N — » step titles, the module descriptions, « مثال الكتاب »). The banner length 10 cm — the climax's — left the
  questions of module 1 and the knowledge card's prompt (the page lab keeps its 10 cm default; the rounds use 8, 11, 12, 6). Catalogue:
  `prerequisiteLessonCodes` = talis-hisab-atwal + amaliyat-natiqa, exported and imported (local DB: lesson 209 ← 207 talis-hisab-atwal, 770
  amaliyat-natiqa, both available).
- Scene `TifoBannerScene` (`data-scene="tifo-banner"`): the youth hall the evening before the derby, a long banner on the floor that takes its two
  colours as tools are earned (its seam drawn only when everything is won), faint parallel strokes above it, a girl in hijab with a big compass, a
  boy with an UNGRADUATED straightedge (KidFigure), no number; on the unit's shared primitives (`FloorBanner`, `BigCompass`, `Straightedge` added to
  `mission/thalesSceneKit.jsx`).

**Added to shared code:**
- `segment-divider` (player only, gated by `useInMissionPlayer()`; page and teacher unchanged — `segmentDivider.render.test.jsx` green):
  `onVerdict` (`logic › verdictOf`), `sameUnitOnly` (default true in the player), the cap by `marks`, `length` 9 by default in the player,
  `init({ player })` (mark 1 never joins — `joinOne`, not a trial; a ruler posed again is shown, not appended), a wrong construction told in words
  (`vp.count`, `vp.unequal`: bands and openings, no length), `chains` (`CHAINS_PLAYER.equal` / `.ratio`: `full`, `build`, `none`; questions `apFill`,
  `apBuild`, `ranksFill`, `maBuild`), `predict` (keys; `logic › predictOptions`, `predictTruth`, `judgedPredictions`; results held `PRED_HOLD_MS`),
  `contrast`, `choices` (the free round switches construction), the names P₁ … Pₙ / M₁ … / F / E on the figure, the journal « 📋 جدول تجاربك » and
  the verdict in the side column, an always-mounted `sr-only` live region (`[data-sd-verdict-live]`), every control frozen during a prediction or
  a question (`aria-disabled` + the `act` guard — never `disabled`), a player TOP BAR above the scene (« صِل B بالعلامة », the ruler arrows,
  « إنشاء جديد »), `LabCoach` (`logic › coachOf`, with `idle` steps), `{ tk: 'reset' }`, `{ tk: 'retry' }` (a full reset), `{ tk: 'discovered' }`,
  the first refusal free, zoom-safe pointer maths (the scene and the compass track), `shownValues(props)` for the forbidden-values scan.
- One fix that reaches the page too: the rule question's hints spoke of « the inside point and the outside point » in equal mode; they now follow
  the lab's mode (`cp.ruleEqual.*`). The rule's witness never cites a ruler refused for its units.
- `mission/TifoBannerScene.jsx`, three primitives in `mission/thalesSceneKit.jsx`, registered in `MissionScene.jsx`.

**Traps met:**
- The coach bubble BLOCKED the next gesture: above the « صِل B بالعلامة » row it covered the dotted mark the student still had to tap (a
  Playwright walk that never presses « فهمت » found it), under « إنشاء جديد » it covered the bands of the construction just finished, and in ratio
  mode any bubble near the compass covered a dotted mark. Fix: in the player the join row, the ruler arrows and « إنشاء جديد » sit in a bar ABOVE
  the scene (their bubble opens downwards over the empty top of the scene); the ratio steps are `idle` (shown only after 3,5 s without a gesture);
  no bubble at all while only one line is graduated. Walk `x2.mjs`: no control blocked, no band covered, at the three sizes.
- Vite HMR during a walk resets the lab: never edit `src/` while a Playwright walk runs (a run « lost » its refusal for that reason).
- A stale ✗ from an old refused ruler stayed drawn beside the M just found: in the player the ✗ is only the POSED ruler's.
- The `sr-only` live region holds a KaTeX formula: the `.katex` clipping probe must skip `.sr-only` (a false positive).
- 3/7 is both the climax's decoy (MB/AB) and the DATA of the textbook method « 3/7 = 2/AB » (a segment of length 14/3): it stays out of the unit's
  text scan (comment in `_unit/missionStrings.test.js`) and in the lab's role scan (role `t`).
- « فتحته » contains « تحت »: a test that forbids a side word in the coach strings must use word boundaries.
- `W_PRIOR_NOT_DIAGNOSED`-type warnings: the 10-statement ladder diagnoses Thales and proportions only; the other `priorKnowledge` ids stay
  (modules require them).

**Review (2026-11-10, `ecc:react-reviewer`, `ecc:code-reviewer`, `ecc:a11y-architect`, each finding verified in the code):**
- Fixed — module 2's « same side » prediction was JUDGED at the first right point (the chain `build` opens there and « all judged » followed the
  last chain): its result was shown before any outside point existed. In ratio mode « all judged » now waits for both points.
- Fixed — a ruler posed again on the same positions and ranks but OTHER openings (8 + 12 where 10 + 10 stood, after « إنشاء جديد ») showed the old
  « right » verdict again: a join now carries the signature of its openings (`unitsKey`), compared by `commitRuler` and `joinAtEnds`; tested.
- Fixed (a11y) — the same refusal twice in a row was announced once (the live region's key is now per gesture); the join buttons' accessible name
  starts with their visible digit in the player; the ruler ends are named F and E for a screen reader too (`endHandleP.*`); the visible verdict
  carries a hidden « صحيح. / خطأ. »; the journal's « — » has a hidden « لا نسبة ».
- Not changed (and why): the peer sheet and the reworded steps also reach the teacher page (intended, as in lesson 2 — text only, the lab is
  unchanged); the apBuild prompt already says « العلامة P_k » (no extra sentence linking P_k to mark k); `common.cp.predict.right` holds an emoji
  (shared by every lab); the checkpoint « 3 of 8 against 3 to 5 » names part / whole against part / rest, as the verdict asked — without the
  climax's two parts MA and MB nor its conversion.

**Verification:** vitest `src/lessons` (662 files, 12 170 tests, after the review fixes), `check:lessons` exit 0 (entry 241,3 KB gzip),
`lab-rollout-status --lesson inshaat-talis` ✅ (and `aksiya-talis` still ✅), Playwright at 1366×768, 1024×768, 1920×1080: every round of module 1
by hand to ★★★ (a refused join of mark 1, a free wrong construction, the two-units refusal, the challenge, every free choice), the home (first
visit and return, « قبل أن تبدأ » with both lessons), « أستعدّ » (10 + a review with a « راجع » card), the peer sheet (wrong line, wrong fix,
right fix, restored after a reload), every module unit by unit, the final test, the knowledge map, the teacher view (two levels, stepper, page
verdict, 10 cm — unchanged); at 1024: a wrong prediction, three refusals → « جرّب أصغر » and back, a wrong answer then « أعِد التجربة », « إعادة »,
a reload mid-module, module 2's round (the outside point first: « NA, NB » in the build; away and back shows the verdict again); the coach walk
without « فهمت » at the three sizes. 0 `data-fit-overflow`, 0 page scroll, 0 clipped `.katex`, 0 console error.

**Open:** lesson 1 (`talis-hisab-atwal`) and the synthesis of the unit; the unit page entry (after the three lessons). For the owner: (1) the
textbook exercise of module 3 « AM/AB = 3/7 » (seven equal parts) precedes the climax, whose decoy is 3/7 — the exercise is textbook data and was
not changed; (2) two checkpoints of the verdict fit three slots only (modules 1–3): « 2/5 = 3/x » was dropped for the part/whole item (the prep
already asks proportions); (3) the ratio chain is split in two stops (`ranks` at the first point, `rule` at both) instead of one stop of four
questions — each question follows the gesture it is about; (4) the coach has no « graduate (d₂) too » bubble (it blocked the next mark); the
lead and the reading line say it.

## Unit 9, synthesis — `wadiya-idmajiya-talis` « أدمج تعلّماتي » (2026-11-10) — the FIRST synthesis in the player

**Decisions (binding):** the owner (2026-11-10: « the synthesis must be built too »; the student NEVER sees the old view; module 7's labs come
into the player; a training step may reveal its answer after one wrong try for the pilot; « اكتب الحلّ في كرّاسك ثم قارن »), council S1 (the
existing engine, keys owned, no checkpoints, the 10-statement ladder, open map, 🏆 on module 8, « أجرّب », two sittings, resume inside a
training, the peer sheet = a classmate's wrong PLAN), council S2 (NO training ★ — « n / 6 » and the keys lighting; module 8 untouched; renumber
training 1; fresh memo-card numbers; cone radius 6 = a named exemption; a role scan written FIRST; labels « وضعية الوحدة » / « التحدّي 🏆 »),
council C (module 7's labs: two required cone rounds 25/15 by hand and 25/10 with predictions, ⭐ 21/14 with r fixed, a meet-only minaret round,
no V / no square cylinder / no number in a lab verdict, the letter equality built in the first pen step, a notebook screen, the peer sheet's
error = Thales without justifying (TC) ∥ (SK), module 7 ≈ 29 min).

**What was written (lesson):**
- `lesson.config.js`: `studentView: 'mission'`, `knowledgeMapOpen`, the `mission` block (scene `shadow-square`, title « مهمّة الوحدة », an
  opening without a digit, `cta: 'أجرّب'`, `toolsOwned` with the five keys of the three lessons and their `usedIn`, `checkpoints: []`,
  `climaxModule: 8`, `stationLabels`, `trainings`, `hideStars`, `durationMin: 82` = the honest sum (module 7 now 30), `sittings: 2`,
  `resumeInside`); textbook mentions removed from resources; `mutawassitat` dropped from `priorKnowledge` (no step uses it).
- `content/forbidden.js` + `content/mission.test.js` — **the role scan, written first. It FAILED first** on training 1 (stick 1,5 / shadow 2 =
  the 🏆's minaret), on the memo card `tariqat-zill` (module 7's own minaret) and on the map's `otKhata` (module 7's equality); then the content was
  fixed. It also replays every round of module 7 to its goal (★★★ reachable), scans every value a round or a practice round can show
  (`shownValuesPlayer`, `shownValues`), the leads and missions, the opening, the ladder and the peer sheet, and checks the config.
- Training 1 renumbered (stick 1,2 m, shadows 1,8 / 11,7, height 7,8, ratio 6,5, 1000 دج/m → 7800 دج, a pupil of 1,7 m → 2,55 m; figure and
  tests recomputed). Its saved answers need no reset: saving is on only in the mission view, which the lesson never had before.
- The 26 typed training steps carry `shape` (11 + 4 lengths, 1 volume, 3 prices in دج, 2 « V = [ ]π » forms, 2 cross-product gaps, 3 decimals);
  module 7's two typed steps use `stepTemplate({ kind: 'numeric', shape: 'quantity', unit })`. « DA » is gone. The data of the three sorting steps
  are plain text (`InfoSorter` printed a raw « $ »).
- Memo cards: fresh worked numbers (a 6,5 m tower; cones 16/10 and 28/12 → 40r = 336, r = 8,4; V = 75π); their bodies and the map's mistakes
  speak in LETTERS (`content/textbook.js › CARD`).
- « أستعدّ »: `content/prep.js` (10 statements, talis → aksiya → inshaat in cycle, levels 1·1·1·2·2·2·2·3·3·3, the first three true, each truth
  recomputed in `prep.test.js`; « راجع » points to the unit's three lessons — catalogue prerequisites). The old seven stay in `textbook.js`.
- Module 7 (`Module07AlWadiya.jsx`): the player plays `LabRounds labId="m7-wadiya"` (`content/rounds.js`): `zill` (`shadow-meet`, the minaret
  at 15:00, `hideHeight`, chain `why`), `r1` (25/15, first refusal free, `sec`; practice: h locked on a notch NOT yet seen, r starting off the
  answer), `r2` (25/10, predictions `part` and `double`, cylinders 5 / 10 / 20, BUILD 2/10 = 5/25 then the rule in words; practice h = 15),
  ⭐ (21/14, r fixed 10 then 4), free (the three cones). Both practice rounds RELEASE their round. Steps (both views): 1–2 wait for `zill`
  (a rebuilt line « 15:00 · AB = 10 m · OA = 11,6 m »), 3–5, **6 the notebook screen**, **7 waits for `r2`** and opens on the letter equality
  « TC/SK = □/□ » (OT/OS, the decoy ST — a tap on the filled pair) before the substitution 18/6 (its panel lists the r2 cylinders, no V), 8 h = r,
  9 V, 10 the check (a cylinder refused in this sitting supports « 7,2 > 6 »), **11 « ورقة هاجر »** (`content/peerSheet.js`: a plan, no number,
  the error line = two alignments without the parallel). The `BackLink`s are page-only; the footer adds a pause line before the 🏆 (player).
- `components/MinaretFigure.jsx`, `ConeFigure.jsx`: `data-paging-keep` (the pager hid the SVG's children). Scene `mission/ShadowSquareScene.jsx`
  on new `thalesSceneKit` primitives (`Sun`, `PlainTower` — no symbol —, `SunRay`, `GroundShadow`); KidFigure only, the girl in hijab.
- Unit page: `pages/unit/unitMissions.js › khassiyat-talis` (icons 🎬 🖌️ 🚩 🧩, the challenge = the minaret rewritten from its two shadows 11,6 / 1,6
  — never 7,25 nor 10 m, a number of `inshaat-talis`'s climax —, the five keys = the mission's five tools, al-Bīrūnī's treatise on shadows);
  `unitMissions.test.js` adapted (a three-lesson unit hands two keys in one lesson).

**Added to shared code:** `cone-cylinder`'s player version (`geometry/ConeCylinderPlayer.jsx`; logic appended to `logic/coneCylinder.js`;
`MANIPULATION_CONTRACT.md` « Sixteenth example »); `shadow-meet` `hideHeight` + chain `why`; `LabRounds`/`roundsModel`: `easierProps` (a function of
the main log), `easier.releases`, `missesOf` counts a question once; `FitLine` shrinks at once and grows only when its frame changed (an oscillation crashed the
teacher page on a memo example); the page `cone-cylinder`: `discoveryOptionsOf` never calls two equal products different, the r handle follows the
track's displayed height. `GuidedProblem` (`resumeInside`): restoring sub-questions no longer block the resume nor overwrite the saved progress.
`UnitMissionView`: a synthesis window (`toolsOwned`) lists no tools (its keys are the unit's; the window scrolled at 1366 and 1024).

**Review (`ecc:react-reviewer`, `ecc:code-reviewer`, `ecc:a11y-architect`; each finding checked in the code):**
- Fixed — the practice-done « عُد إلى الخطوة » restarted the main round on the PRACTICE log with `wonRef` still set (no stars, no win card
  afterwards): it now goes through `go(index)`. A cylinder pressed again after another one showed nothing (`isDirty` compared the last TRIAL, not the
  last PRESS). The r1 practice round STARTED on its answer (h = 20, r = 3): its r now starts off the answer, tested for every seen-set. The `r2`
  rule could quote a single sum: the chain now waits for two touching cylinders. `lockR` moved r at once, hiding the verdict of the press: the next
  value now comes at the next move. ⭐'s hints spoke of r while r is fixed (`hintLockR*`). `said` survived « إعادة ». `FitLine`'s dead band could leave
  a line < 2 % too wide (shrinking now always applies).
- Fixed (a11y) — focus after a lab question and after the notebook press (the button stays, `aria-disabled`, beside an always-mounted status); a
  repeated « جرّبتها » is announced again (the live key counts presses); the r slider is `aria-orientation="vertical"`; a locked slider says so in
  its value text; the idle cylinder stroke is sky-700; the new LabRounds buttons are -700 with the indigo ring, and the practice-back button takes
  the focus when it is the card's only way on; WonPanel's ✓ has a hidden word; the 🏆 of the pause line is `aria-hidden`.
- Not changed (and why): `missesOf` now ignores intermediate wrong tries of a question until it settles (right after retries or revealed — the
  reveal comes at the 3rd try): the help card no longer covers a lab after ONE wrong answer, which is what the « two misses » rule meant; the page's
  `stickLine` / `coneLine` keep ✓ / ✗ in strings (page and teacher only, unchanged code); the zoom term in the handles' `toValue` is redundant when
  `useStretchInteraction` already rescales — harmless, kept for the page fix; `onRoundWon` may fire twice for a released round (its consumers are
  idempotent); the page `v.meet` names O — the minaret scene keeps module 7's letters (only the cone lab has none); the unit page shows 11,6 and 1,6
  on purpose (the unit challenge IS module 7's تحدّ; never its answer).

**Traps:** the walk found most of them — see the guide's « Synthesis in the mission player » › « What the pilot added or fixed ». Also: never edit
`src/` while a Playwright walk runs (Vite HMR resets the lab mid-walk; a whole run was lost); Playwright refuses to click an `aria-disabled` button
(a walk driver must skip them).

**Verification:** vitest `src/lessons src/features/practice src/pages/unit` (695 files, 12 527 tests), `check:lessons` exit 0 (entry 241,3 KB
gzip), `lab-rollout-status` ✅ for the synthesis and the unit's three lessons, `e2e/unit-mission-view.mjs` 251 ✓ / 0 ✗ (units 1, 2 and 9).
Playwright (scratchpad `walk-s/`) at 1366×768, 1024×768 and 1920×1080: the home (first visit and return: five keys owned, « n / 6 », no ⭐ 0, the
title dialog, « في جلستين », 82 min); « أستعدّ » (10 + the review with « راجع »); the six trainings unit by unit with all 26 typed steps in their
shape, Enter validating each (one wrong first in training 2); module 7 by hand to ★★★ in every required round (a free refusal, the same cylinder
twice, a wrong `sec` answer then the right one, both predictions, the build, the rule), the steps (7,25 m and 4,5 cm typed, the notebook, the letter
build, the peer sheet), the round wins kept over a reload; « إعادة », three refusals → « جرّب أصغر » → the practice round (h locked off the answer)
→ r1 released at 1 ★ and r2 open; resume inside training 4 after a reload (part 2 reopened); keys lighting after trainings 1–3; module 8 (fits,
6 questions, the result); the knowledge map (no signature); the peer sheet restored after a reload; the teacher view (the workspace with its two
levels, the page cone lab with its volume line, 11 steps, the back links) — 0 `data-fit-overflow`, 0 page scroll, 0 clipped or wrapped `.katex`,
0 console error (outside the practice station, where the mocked API answers `{ data: [] }` — the same error on `talis-hisab-atwal`). **Module 7's
required path, automated: ≈ 78 s** (a machine, not a student: 3 rounds = 9 presses, 4 lab questions, 11 steps) — the student target (≈ 29 min)
is still to be measured on a real student.

## Unit 3, lesson 1 — `nashr-tabsit` « نشر وتبسيط عبارة جبرية » (2026-11-11)

Prompt: `UNIT3_HISAB_HARFI_MISSION_PROMPT.md`; council of 2026-11-11 (5 advisors, 5 anonymous reviews, chairman), verdict « Cross-lesson » and
« L1 » — binding over the designer's report. Built in parallel with lesson 3 (`tahlil-ibara`) on the unit's shared scene kit.

**What was written**
- `content/pitches.js` (`M1_ROUNDS` labId `m1-pitch`: r1 `3|x+5` in AREAS (x 1–9 without 5, start 3) → r2 `3x-1|3+x` in AREAS (x 1–6 without 3,
  start 2; predictions `unhatched` « no », `otherX` « yes ») → r3 `x-2|2x-1` in terms, REQUIRED (prediction `termsLeft` 3; `corner`, then
  `result`) → ⭐ `3x-2|2x-1` → free; practice `2|x+1`, `x-1|x+2`, `x-1|x-2`, each `releases`; `M2_ROUNDS` labId `m2-pitch`: the platform's
  `2x-3|x-1`, chain `result`, then free) + `pitches.test.js` (the role scan, the collision SWEEP of every reachable x, every round PLAYED to ★★★).
- `content/forbidden.js` (the climax signature by role + `TEXT` for prose + `oppositeCross`), `content/mission.test.js` (checkpoints recomputed,
  dry-run of `shownValues` over every round / practice / module 2 / free pitch, peer, prep, memo BODIES, the map, the nine exercises, literal pins
  of the hand-fixed module prose), `content/prep.js` (10 statements, skills `nashr` → `nashr-jabri-3am`, `tabsit` → `tabsit-hadhf-aqwas`, both
  3AM), `content/peerSheet.js` « ورقة زينب » ((x + 3)(x + 6) with only the facing zones, checked at x = 0).
- Config: `studentView: 'mission'`, `knowledgeMapOpen`, mission « مقاعد الممرّ: كم عشبًا يحتاج ملعب الحيّ؟ » (scene `neighbourhood-pitch`,
  tools `nashr-qawsayn`, `tawziiya-nashr`, `tabsit`, `climaxModule: 4`, checkpoints `cp-ishara` −3(x − 2), `cp-qawsayn` (x + 1)(x + 6),
  `cp-mutashabih` 2x² + 3x).
- Modules: 0 = the ladder; 1 = `LabRounds m1-pitch` (step 1 waits for r1, step 4 for r2 — their trace from the WON rounds); 2 = `LabRounds
  m2-pitch` (step 2 waits for it) and « ورقة زينب » as its last step; 3 = nine exercises REWRITTEN by the platform (verdict L1.7).
- Catalogue: `prerequisiteLessonCodes: ['nashr-jabri-3am', 'tabsit-hadhf-aqwas']` (two free-text lines removed), exported, imported, checked in
  the local DB (`lesson_prerequisites`).
- Scene `lessons/common/mission/NeighbourhoodPitchScene.jsx` on the unit kit `pitchSceneKit.jsx` (PitchBackdrop, PitchPlot, TurfStrips,
  PitchLines, Goal, Bench, BenchRow, CornerStand, TurfRoll, TurfRollStack, TapeMeasure, CutStrip — API stable, add only).

**Added to shared code** (`pitch-expansion`, page unchanged — `logic/pitchExpansion.test.js` freezes the page defaults, the synthesis's
`x+10+x` and lesson 2's identity kinds): the player treatment (MANIPULATION_CONTRACT « Seventeenth example »): `labels: 'area'` through one
`zoneText`, `areaCollisions` / `playerXs` / `snapX` / `startXOf`, `trial.sig` and « the same x with the same tray is not a trial », `chains`,
`predict`, `choices`, journal, live region, `coachOf` (the lab's FIRST coach — player only), `shownValues`; the player draws the pitch LANDSCAPE
(a tall field such as 3 × (x + 5) is transposed). The sweep is hidden in the player (X1).

**Content rewrites** — SHARED-deliberate (the teacher page gains too): module 1 step texts (the activity's questions, its numbers (2)/(3), its
« printing error » note, the « السؤال n » subtitles), module 1/2 titles without « نشاط 1 » / « مثال الكتاب », module 2's brick leads and example
box (platform examples), module 3's nine exercises and titles, memo examples `6(x − 2)` and `3x − (x − 5)` and three quizzes (`(2x + 1)(x + 3)`,
`-2(x − 5)`, `4(2x + 5)`, `3x^2 + 5x + 2x - 6`), two predictPrompts, the map's nodes (activity text, prerequisite text, « مثالان », the
« قوسان مسبوقان » mistake). PLAYER-only: the rounds, module 2's pitch (2x − 3)(x − 1) and its evidence line, the rule's geometric option
(`player.rule.*`), the coach, the journal, the hidden sweep.

**Saved-answer keys.** The lesson was never in mission mode, so NO key existed before (saved answers are on only for `studentView: 'mission'`):
kept 0, retired 0. New: the fingerprint keys of every module question (automatic) — no explicit `lab-pitch` key is needed (the module steps read
the stored STARS, announced by `LabRounds` at mount, so a reload never empties a step).

**Traps (each was met)**
- Area chips + a ruler on a collision x: 27 / 27 / −3 / −3 make the BUILD a guess — skip the x, sweep in a test.
- A snap whose tie-break is the last direction FLICKERS under a resting finger: at a tie keep the shown value; commit the shown value.
- `DraggableObject` forwards no `data-*`: coach targets are the SVG `[data-pitch-zone=<id>]`.
- The text gate must read U+2212 and bare factors (`x − 4`, `2x + 10`) — and must not flag « + 2x + 10 » inside an expansion line.
- A free pitch can leak the climax in its MERGES (`x-1|x-5` → −6x) and its factors (`x-1|x-3`): the scan caught both; replaced by `x-2|x-5`.
- Exercises with a check value: x = 0 hides every x-zone — the peer sheet's lesson; the exercises check at x = 1 / 4.

**Review** (react, code, a11y — every finding verified): FIXED — the snap flicker (HIGH); chains cut by the teacher's checkpoint switch in the
player (rounds unwinnable); a double-tap prediction; the text gate (U+2212, bare factors); zone names now say « مقتطعة » / « مقتطعة مرّتين » /
« لم تُحمل بعد »; the lit zone and the prediction ring in amber-700; unique SVG pattern ids; « تحقّق » with an empty tray says why; the live region
isolates numbers and says when a check was not counted; the chip drop-zone label in the player; the `corner` options share one shape; journal
headers « مساحة الملعب » / « مجموع المناطق ». REJECTED (shared primitives or project-wide, pre-existing in every lab): nested interactive roles
in `DropZone`, the blue focus ring and native `disabled` of `DraggableObject`, the field overlay duplicating the table cells, `PRED_HOLD_MS`
1,6 s (project standard), the « اسحب » wording, `DropZone`'s hint contrast.

**Open (for the owner)**: the page lab still has no coach (logged in `LAB_COACH_ROLLOUT.md`); « زينب » also appears as a data name in one practice
JSON (`content/practice/4am/tafsir-bayani-jumla/level-5/…-002.json`) — not a peer sheet; the shared-primitive a11y items above.

## Unit 3, lesson 2 — `mutatabiqat-shahira` « المتطابقات الشهيرة » (2026-11-11)

Prompt: `UNIT3_HISAB_HARFI_MISSION_PROMPT.md`; council of 2026-11-11, verdict « Cross-lesson », « L2 » (L2.1–L2.7) and the added rulings — binding
over the designer's report. Built after lesson 1, on the same lab and the unit's scene kit.

**What was written**
- `content/squares.js` (`M1_ROUNDS` labId `lab-square`: r1 `x+4` in AREAS, merging off (x 1–6 without 4, start 3; the two strips show TWIN numbers
  — same kind, allowed by `areaCollisions`; the mission asks to carry the two squares alone first, the free refusal lights the strips; `stripFill`
  then `identityBuild` + rule) → r2 `x-5` in terms (x 6–11, start 9 = side 4; predictions `claim` x² − 25 « لا » and `twice` « نعم »;
  `cornerFill` on the round's numbers, then identity + rule) → r3 `2x-1` REQUIRED (`coefBuild` in numbers, decoy 2x²) → ⭐ `2x+5` → free (six
  squares); practice `x+2` (area, without 2), `x-2` (start 6), `2x+1`, each `releases`; `M2_ROUNDS` labId `lab-sumdiff`: `x+4|x-4` (start 7,
  prediction `noX` « لا », `cancelFill`, identity + rule) → ⭐ `3x+4|3x-4` → free) + `squares.test.js` (the role scan of `shownValues` — every
  reachable x, subset sums, question options, the predicted claim —, the collision sweep, the letter identities true for any a, b and each decoy
  false, every round PLAYED to ★★★).
- `content/forbidden.js` (roles: NEVER 27, 729, 720, 711, 171, 900, 180, 874800, 153900, 1200; `x`/`side` 30; `factor` x ± 3; `term` ±6x, ±9;
  `expansion` the climax forms and decoys; role-allowed 9 as an area, 30 as a zone area — and `TEXT` for prose, incl. the mental anchor 30),
  `content/mission.test.js` (config, checkpoints recomputed, dry-run, peer, prep, memo BODIES, the map, the exercises (retuned rows recomputed),
  every line of modules 0–4, literal pins), `content/prep.js` (10 statements: `nashr` → `nashr-tabsit`, `murabba` → `quwat-adad-nisbi` 3AM),
  `content/peerSheet.js` « ورقة طارق » ((x + 7)² = x² + 49, at x = 13: 218 against 20² = 400; the strips 182).
- Config: `studentView: 'mission'`, `knowledgeMapOpen`, mission « مدرّجات ملعب الحيّ: كم يبقى للّعب؟ » (scene `stands-pitch`, tools
  `murabba-farq`, `hisab-mutamaan`, `tariqat-nashr`, `climaxModule: 5`, checkpoints (x + 8)², **(x + 6)(x − 6)** (replaces 41 × 39 — a mental
  anchor is the climax's method), x² + 4 = 4x, the type of (4x − 7)²). Module titles / descriptions, `skills`, `teachingScope` without the book.
- Modules: 0 = the ladder; 1 = `PlayerSwitch` + `LabRounds lab-square` (steps 1 and 3 wait for r1, 8 and 10 for r2; their trace from the WON
  rounds; step 8 has a player question on the round's (x − 5)² that never says « cut twice, added once »); 2 = `LabRounds lab-sumdiff` (step 1
  waits for it) and « ورقة طارق » as its last step (page too). Page-only trace lines come from `content/textbook.js › PAGE_LABS` (the page labs keep
  their numbers for the teacher: x + 3, x − 2, (x + 3)(x − 3), (2x + 5)(2x − 5)).
- Scene `lessons/common/mission/StandsPitchScene.jsx` on the unit kit (bench rows rising on two adjacent sides, the common corner never
  highlighted), registered in `MissionScene.jsx`. `_unit/missionStrings.test.js`: the SHAHIRA signature + negative controls.

**Added to shared code** (`pitch-expansion`, page and lesson 1 unchanged; new tests `logic/pitchExpansionSquares.test.js`,
`algebra/pitchExpansionSquaresPlayer.test.jsx` — lesson 1's tests untouched): MANIPULATION_CONTRACT « Seventeenth example, continued ».
Chains `square` / `squareDiff` / `sumDiff` / `coef` + practice chains; questions `stripFill`, `cornerFill`, `cancelFill` (`fill` with drawn chips),
`identityBuild` (LETTERS, one decoy per kind, the field's sides and table headers relabel a / b / −b while it is open), `coefBuild` (numbers);
predictions `claim` / `twice` / `noX`; the « 0 » chip of a cancelling merge; on a square of a SUM the coach points at the two squares first; the
player explanation and the square-difference rule's « why » never use the corner sentence; `shownValues` lists the questions' options.

**Content rewrites** — SHARED-deliberate (the teacher page gains too): every book question text, figure (MNPQ, KLMN, the rectangle) and the
Descartes paragraph replaced by platform text (`content/textbook.js › PLATFORM`); module numbers: (6 + 4)², (2 + 0,5)², (x + 2)², (2x + 7)²,
the Descartes table on (2x + 2)², 41², 62², (11 − 4)², (2,4 − 4)², (x − 7)², (4 − 3x)², 49², 38², (x − 5)(x + 5), (3x − 2)(3x + 2), 102 × 98,
96² − 4²; module 3's three examples (3x + 4)², (5 − 2x)², (4x − 1)(4x + 1); module 4 step titles without « تمرين n », the printing-error note
removed; exercises now-B (729x³ → 4x(4x + 1)² − x(x − 1)²), ex-11 (31² → 21², 1009² → 1008²), ex-12 ((x + 3)² → (x + 5)², 9x² + 6x + 1 →
(4x + 1)², (x + 5)² → (x + 7)²), ex-14 ((2x − 3)² → (2x − 5)²), ex-15 ((x − 3)² → (x − 4)²), ex-35 ((x + 1)(x + 9) − (x + 3)² → (x + 1)(x + 4)
− (x + 2)²), « سؤال التمرين السابق نفسه » restated; memo examples (x + 5)², quizzes (5x + 1)², (2x − 5)², x² = 16, (3x + 4)², the `101 \times 99`
quiz's lost backslash (a TAB); predictPrompts on the rounds; the map's Descartes node and « 21² ≠ 400 + 1 ». PLAYER-only: the rounds, step texts
that read a round, step 8's question, the rule's geometric option, the coach, the journal, the hidden sweep, the relabel, the « 0 » chip.
Exercises feed no other bank (the practice bank and the compass index read `content/practice/`; checked).

**Saved-answer keys.** The lesson was never in mission mode (saved answers are on only for `studentView: 'mission'`): kept 0, retired 0. New:
the fingerprint keys of module questions (automatic, content-keyed — rewritten rows get new keys, none reused with another meaning), stars under
`lab-square` and `lab-sumdiff`, `peer:m2-tariq`. « أستعدّ » keeps its ids `prep-1…10`.

**Traps (each was met)**
- `BuildAnswer` hides `ops` and `wrap` from screen readers: the prompt states the left side and the signs live IN the tiles (`-4x`, `+1`).
- A TEXT gate on module SOURCE meets Tailwind (`text-slate-900`) and ids (`ex-9`): the regexes exclude a letter-hyphen before a number; the
  repo's thousands separator `\,` must be matched too.
- `(x − b)²` at the page default start (min + 2) always shows a side-3 field — the climax's picture: every start is set (9, 6).
- A `9x(9x + 1)²` book row gave `729x³`: coefficients count; scan every row, not only the ones listed.

**Review** (react, code, a11y — every finding verified): FIXED — the identity and coef prompts now state what is expanded; coef tiles carry their
signs; `pred.twice` names its corner value; `sideName` from the binomial's first term; the zero chip's merge reads `labRef`; « 0 » first in its
name, in `<bdi>`; prep item 6 checks its own decimals; the TEXT gate catches « -720 », « 874\,800 », « x + 3 », « 30\,m »; `teachingScope`
without book figures. REJECTED / kept — the relabel lasts through the rule question (intended: the rule is in letters); zero chips render inside
the tray guard (x² and −b² always stay); `*Parts` ignore `letter` (one letter, x, in this unit); a malformed `claim` throws (content is tested);
shared `BuildAnswer` a11y (hidden ops/wrap, `disabled` empty slots) — logged for the primitives.

**Open (for the owner)**: the page lab still has no coach (`LAB_COACH_ROLLOUT.md`); the book's طريقة (`METHOD`, with √3, √5) is still shown
line by line in module 4; formulas with « = » inside an RTL line are rendered by the shared `MathText` — see the verification below.

**Verification:** vitest `src/lessons` 692 files / 12509 tests green (lesson 1's `pitches.test.js`, `logic/pitchExpansion.test.js` and
`algebra/pitchExpansionPlayer.test.jsx` unchanged); `check:lessons` exit 0, entry 241.4 KB; `lab-rollout-status --lesson` ✅ for lessons 1, 2, 3.
Playwright at 1366 / 1024 / 1920: every round of both modules ★★★ (r1 with the free two-squares refusal, the a / b relabel seen, a wrong rule
answer first; r2 with both predictions; the « 0 » chip in module 2), the free rounds, « إعادة », the practice round (x = 2 skipped) and back to r1
(released, 1 star), a reload in the middle of module 1 (stars kept), home, « أستعدّ » (10 + review naming a lesson), « ورقة طارق » (wrong line,
wrong fix, fix, restored after a reload), modules 0–7 unit by unit, the final test, the knowledge map (no climax number, no book), the teacher
page (no player, no rounds): 0 `[data-fit-overflow]`, 0 page scroll, 0 KaTeX clip, 0 console error. Found by the walk and fixed: the free round
overflowed at 1024 × 768 (its choice row) — the field is capped at 130 px when `choices` are shown. Formulas with « = » read in order
everywhere (a² + 2ab + b², « 13 + 7 = 20 »): each sits in ONE `$…$` island.

## Unit 3, lesson 3 — `tahlil-ibara` « تحليل عبارة جبرية » (2026-11-11)

**Council verdict (2026-11-11, binding — `L3` + Cross-lesson):** L3.1 the Contrarian's reshape — module 1's three REQUIRED rounds `8x + 6`, an
m = 1 rows set, the square `x² + 6x + 9`; ⭐ `x² + 8x + 16`; module 2 = `x² + 25`; the activity's `9x + 3` leaves the player. L3.2 r1 by hand.
L3.3 the square build's decoy is c ((x + 9)²). L3.4 peer sheet = the lost « 1 », classmate « بلال ». L3.5 « أستعدّ » K1 → `nashr-tabsit`. L3.6 no
catalogue / net change. L3.7 the rule after two different sets (m = 0 then m = 1), its right option gives the tiling reason. L3.8 replace the two
role hits (memo 6x + 9, exercise decoy 5x(x − 1)). L3.9 free = rows sets, identities, x² + 9; 9x² − 6x only if rows mode is proved to draw and refuse
negative counts. X1 sweep hidden in the player, X2 coach in the player only, X3 scan everything before the climax. The forbidden FIX defined narrowly.

**What was written:**
- `content/turf.js` — `M1_ROUNDS` (`lab-turf-m1`): r1 rows `8x+6` (chain `build`: « في كل صفّ: ▢ » then BUILD « 8x + 6 = ▢(▢ + ▢) », decoy 6; no
  prediction, `stars.predict: false`), r2 rows **`6x^2+2x`** — the m = 1 set: `6x² + 4x` is the book's معارف example 1, so the verdict's « own set
  whose counts are not 2 : 3 » applies; 3 : 1 and a/g = 3 so no other arrangement of the tiles {2x, 3x, 1, 2} is a true equality (predictions
  `rowHeight` 1 / 2 / x and `maxRows` 6 / 2 / 1; chain `full`: « ارتفاع الملعب كاملًا = ▢ » 2 / x / 2x, BUILD with the decoy 2, the rule), r3 the
  square `x²+6x+9` (prediction `sideStrips` 3 / 6 / 9; chain: the corner of the student's refused split, BUILD « (▢ + ▢)² » with the decoy 9, the
  rule), ⭐ `x²+8x+16` (≤ 2 closes), free (`6x+3`, `2x^2+6x`, `9x^2-6x`, `x²+4x+4`, `x²+9`). Practice rounds `4x+2`, **`2x^2+4x`** (the designed
  `4x²+2x` showed « 3 rows, one big square out » at r = 3 — سمير's picture — and was replaced), `x²+2x+1`. `M2_ROUNDS` (`lab-turf-m2`): `x²+25`
  (prediction `closes` → « لا »; chain: the squares outside, why, the rule) then free.
- `content/forbidden.js` (roles + `TEXT` regexes + `incompleteFactor`), `content/turf.test.js` (scan of every round, practice round and free choice;
  every round PLAYED to ★★★; r = 1 and a repeated r are not trials, a repeated refusal never opens « جرّب أصغر »; each build has a decoy distinct
  from its tiles), `content/mission.test.js` (config, checkpoints recomputed from the CONFIG — only the right option equals the sum —, strings,
  knowledge, map, exercises, the raw sources of modules 0–4), `content/prep.js` + test (10 statements: النشر → `nashr-tabsit`, المتطابقات →
  `mutatabiqat-shahira`, each re-expanded), `content/peerSheet.js` + test (« ورقة بلال »: 8x² + 4x = 4x(2x + 0) → 8 at x = 1 instead of 12; numbers
  computed), `_unit/missionStrings.test.js` (CREATED for the unit — tahlil-ibara's signature, plus the rule « a unit-3 classmate name is used by no
  other 4AM peer sheet »; lesson 1 added its own the same day). `_unit/prepDiagnostic.test.js` reads `content/prep.js › PREP_LADDER`.
- Config: `studentView: 'mission'`, the `mission` block (scene `turf-rolls`, title « لفائف العشب: كم صفًّا في الملعب الجواري؟ », the opening with
  no number, 5 tools, `climaxModule: 5`, checkpoints 7x + 14 · x² + 64 · (3x − 2)² · 14 − 4x), `knowledgeMapOpen: true`; module descriptions
  without book references. Modules: 0 the ladder; 1 `PlayerSwitch` + `LabRounds` (steps 1 / 2 / 5 wait for r1 / r2 / r3; steps 1 and 2 get a
  PLAYER-only question on the round's own field; step 4's first row reads `8x + 6` in the player; step 5's inline square lab is replaced by the
  round in the player); 2 `PlayerSwitch` + `LabRounds`, step 1 waits for its round, step 3 « ورقة بلال » (shown on the page too); 3 and 4 the book
  page / exercise numbers removed from titles and briefs. Scene `common/mission/TurfRollsScene.jsx` on the unit kit, registered in `MissionScene.jsx`.

**Added to shared code:** the `turf-factoring` player treatment (`TurfFactoring.jsx` « LECTEUR DE MISSION » header, `CHAINS_PLAYER`,
`chainsOfPlayer`, the questions `rowFill`, `heightFill`, `buildFactor`, `buildSquare`, `ruleP`; `logic/turfFactoring.js` `XU`, `isNewRows`,
`isNewSplit`, `verdictOf`, `rowsBox`, `squareBox`, `PREDICT_KEYS`, `predictOptions`, `predictTruth`, `judgedPredictions`, `coachOf`, `rowFillParts`,
`heightFillParts`, `buildFactorParts`, `buildSquareParts`, `shownValues`; new `logic/turfFactoring.test.js` and `algebra/turfFactoringPlayer.test.jsx`);
`LabCheckpoint` build `wrap: [before, after]`; strings `lesson.manipulation.json › turfFactoring.player / vp / coach / predict / rowWord / …`.

**Content rewrites:** SHARED-deliberate — book references removed (module titles, briefs, step titles « تمرين N — », « في الكتاب أكثر من إجابة »,
« له اسم في الكتاب », « أمثلة الكتاب », « المثال الأول من الكتاب »; the four `correctionNote`s reworded without the book; `METHOD_IDENTITIES.exercise`
without « تمرين 1: »; exercise 31's « نفس سؤال التمرين السابق » restated); the memo example `9x+3` → `8x+6`, its quiz `9x+3` → `8x+6`, the quiz
`6x+9 → 3(2x+3)` → `4x+14 → 2(2x+7)`, the predictPrompt without 9x + 3; exercise 20-1's decoy `5x(x − 1)` → `x(x + 5)`. PLAYER-only — step 1 and 2
questions, step 4's first row and the property option (`2` instead of `3`), step 5's lab, the rule's tiling reason (`player.rOpt1`, `player.sOpt1`).
Exercises feed no other bank (the practice bank `content/practice/4am/tahlil-ibara/` and the compass index are separate JSON — checked).

**Saved answers:** module questions are keyed by their content (`useSavedAnswer([prompt, options])`): the page keys are kept; the new player
questions and the rewritten options get new keys (the old ones are simply not read again). New: `peer:m2-bilal`, stars under `lab-turf-m1` and
`lab-turf-m2`. « أستعدّ » keeps its ids `prep-1…10` (not saved answers). No key reused with another meaning.

**Traps found:** the coach bubble « انظر ماذا أضاء » over the refused pieces covered − / + → the controls go ABOVE the ruler in the player; KaTeX
tiles read « 2\displaystyle22 » in the DOM (walk scripts compare the first part); a `heightFill` on an m = 0 field is meaningless → `full` falls back
to `build`; the ratio-2 : 3 rule is ORDERED (x² : x = 2 : 3 gives 2x + 3; 3 : 2 does not).

**Review (react, code, a11y — 2026-11-11):** fixed — the rows `full` chain on m = 0, drops / refusals now announced (gesture key), the hidden height
chip has a spoken name, journal row headers `th scope="row"`, « r = n » in `<bdi>`, the verdict no longer says « مرفوض » twice, distinct slot names,
`wrap` glyphs slate-600, page-only `setGesture` gated, `norm` replaces every « − », the checkpoint test reads the config, the decoy-distinct test.
Rejected — refs reset in the render-time scene block (the same pattern as `segment-divider`, reset with the state it belongs to); `onRetry` keeps
`doneIds` (a retry happens while a chain is OPEN, so nothing done is lost); mirror splits 2|4 and 4|2 stay two trials (two different placements
the student made); `playerTrial` is mirrored by the rounds test's `play()` (as in unit 9) — open: a shared pure helper. Open for later: a sr-only
summary of the field, the strip drag target under 24 px at small scales, `PRED_HOLD_MS` auto-advance, the shared `ops` contrast (slate-400).

**Verification:** see the final report of the session (vitest `src/lessons`, `check:lessons` exit 0 with the entry at 241.4 KB, rollout status ✅,
Playwright at 1366 / 1024 / 1920: every round ★★★, 0 `data-fit-overflow`, 0 page scroll, 0 KaTeX clip, 0 console error).

## Unit 4, lesson 1 — `muadala-ula` « حل معادلة من الدرجة الأولى بمجهول واحد » (2026-11-11)

**Council verdict (2026-11-11, binding — « L1 » + Cross-lesson):** L1.1 a trial = a NEW equation written or a refused move, the first refusal free.
L1.2 the beam says a FACT, the rule sentence and the lab title leave the player. L1.3 a quantity is a UI loop (the existing gesture applied n times
on a draft), no change to `logic/equationBalance.js`. L1.4 `3x − 2 = 10` required. L1.5 the number programme ×2 +5 ×2 −7 = 4x + 3 (input 8 → 35,
decoys `4x − 4` · `4x + 10` · `4x − 2`; « مرّات » instead of « أمثال »). L1.6 build the equation AFTER the step, one decoy. L1.7 « ورقة أيوب ».
L1.9 / X1 the textbook test items E1 / E2 rewritten (`−4 + x = 6` → 10; `5x = 8x` → 0), ids, skills and LPs kept. Pupils خديجة and نسيم.

**What was written**
- `content/balances.js` (`M1_ROUNDS` labId `lab-balance-m1`: r1 `2x+3=11` → r2 `4x+3=−9` (9 balloons pull UP — prediction `bagHolds`) → r3
  `3x−2=10` required → ⭐ → free; `M2_ROUNDS` labId `lab-balance-m2`: `4x+3=6x` → `4x+1=x+8` → ⭐ → free; each with an `easier` round) +
  `balances.test.js` (every round PLAYED along both efficient paths).
- `content/forbidden.js` (roles + `TEXT`, re-exported by `_unit/signatures/muadala-ula.js`), `content/mission.test.js`, `content/prep.js` (the
  ladder, re-exported by `textbook.js › PREP_ITEMS`), `content/peerSheet.js` « ورقة أيوب » (`peer:m2-ayoub`).
- Config: `studentView: 'mission'`, `knowledgeMapOpen`, mission « ميزان غرفة الملابس: ماذا في الكيس المغلق؟ » (scene `locker-balance`, tools
  `muadala-tarafayn`, `hal-ax-b`, `tariqat-hal`, `climaxModule: 5`, checkpoints `cp-tarafayn` x + 8 = 11, `cp-hal` 8x = 4, `cp-tahaqquq` 3 in
  3x − 5 = x + 1, `cp-nashr` 3(x − 1) = 9). Modules: 0 the ladder; 1 `PlayerSwitch` + `LabRounds lab-balance-m1`; 2 `LabRounds lab-balance-m2` and
  « ورقة أيوب » last. « In the player? » is decided at module level by the lesson's own `moduleContext.js › useStudentPlayer()` (the same rule as
  `useModulePlayer`, below).
- Scene `lessons/common/mission/LockerBalanceScene.jsx` (registered in commit 0).

**Added to shared code** (`equation-balance`, page byte-identical): a PLAYER VERSION `equations/EquationBalancePlayer.jsx`, chosen by
`EquationBalance.jsx` in the player (the page body moved to `EquationBalancePage`, the drawing to `equationBalanceParts.jsx` — `layoutPan` /
`beamGeometry` re-exported); pure logic `logic/equationBalancePlayer.js` (+ test): `isRefusal` / `REFUSALS`, `efficientPlan` / `playPlan`,
`reducedForm`, `firstLineReached`, `bagReadReached`, `discoveryReached`, `lineChips` / `placedChips` / `lineBuild` (one decoy per round: 11, −6, 8,
10x, 9), `readOptions`, `CHAIN_SPECS`, `predictOptions` / `predictTruth` / `judgedPredictions`, `coachOf`, `shownValues`. MANIPULATION_CONTRACT
« Nineteenth example ». Strings `lesson.manipulation.json › equationBalance.player / coach / predict`.

**Content rewrites** — SHARED-deliberate (the teacher page gains too): `textbook.js`, `exercises.js` (+ `exercises.test.js`), `knowledge.jsx`,
`knowledgeGraph.js`, modules 0–4 and the final test's E1 / E2 on platform numbers (ids, skills, LPs kept). NOT rewritten: `levels.js` page presets
keep the book numbers (the shared `levels.test` requires advanced = textbook; the page modules pass platform equations explicitly). PLAYER-only:
the rounds, the chains, the predictions, the coach, the journal, the quantity chips.

**Saved-answer keys.** Never in mission mode before: kept 0, retired 0. New: the module questions' fingerprint keys (automatic), stars under
`lab-balance-m1` / `lab-balance-m2`, `peer:m2-ayoub`. No new key for round state (verdict gap 4: re-derived from the stars log).

**Traps (each was met)**
- A bubble over the tipped beam covered the next control at 1024 on either side: DROPPED — the side-column verdict states the fact.
- « keep one group » divided by the OLD k after a quantity drop; a refused step of a multi-object drop must refuse the WHOLE drop.
- With the teacher's checkpoints off, the lab never formalised (the chains ARE the round's goals in the player).

**Review** (react, code, a11y — every finding verified): FIXED — « keep one group » with the old k; the lab never formalised with checkpoints off;
`<bdi>` on counts; the hidden word on leftover bags; one choice announcement per gesture; tests reading data; the Arabic « و 2 كرتان »; from the
walk: « الكفّة الكفّة », the coach over the next control, the opened-bags line, the aspect-ratio string, module-level player detection. NOT fixed:
the held object is not exposed to assistive tech (shared `DraggableObject`); the intermediate climax pans (3x + 2, 5x − 4, −13) are caught only
inside whole equations by the scan.

**Verification:** Playwright walk at 1024 and 1920 — all 7 rounds ★★★; at 1366 all but the M2 ⭐; `no-back-and-forth` at 1366 / 1024 / 1920 LONE 0
OVER 0; 0 overflow / page scroll / KaTeX clip / console error.

**Open (for the owner):** one real student timed on this lesson first (verdict gap 5, non-blocking); the « الملعب الحرّ » tab label; the white
drop-zone panels over the pans (page too).

## Unit 4, lesson 2 — `jidaa-maadum` « معادلات جداء معدوم » (2026-11-11)

**Council verdict (2026-11-11, binding — « L2 » + Cross-lesson):** L2.1 M1 r1 `2(x − 3)`, r2 `(x − 1)(x + 4)`, r3 REPLACED by `2x(x + 2)` (ruler
[−3 ; 1], start 1). L2.2 no refusal required; the FIRST refused pin of M1 r1 and of the covered round is free. L2.3 the connector tiles « أو »
(right) and « معًا » (decoy) — never « و »; button « لا قيم أخرى ». L2.4 the COVERED pitch `(2x − 3)(x + 1)` is a REQUIRED round (M2 r1), its
`easier` the uncovered `(2x − 1)(x + 1)`; M1 ⭐ deleted. L2.5 the square `(x + 1)²` = M2 r2; module 3 has no lab in the player. L2.7 « ورقة كوثر ».
L2.8 M3 challenge `x² + 10x = 39`, x stated positive. X1 test E2 → `(x − 5)(3x + 6) = 0`, E4 → `4x² − 25 = 0`. Notebooks of حاتم and بسّام.

**What was written**
- `content/pitch.js` (`M1_ROUNDS` labId `lab-vanish-m1`: r1 `2(x−3)`, r2 `(x−1)(x+4)`, r3 `2x(x+2)` on [−3 ; 1] start 1, then free; `M2_ROUNDS`
  labId `lab-vanish-m2`: r1 covered `(2x−3)(x+1)` on a halves ruler start 2, r2 `(x+1)²`; easier rounds; 6 free choices) + `pitch.test.js` (the role
  scan with a negative control, starts never on a zero, ★★★ with 0 refusals, easier rounds smaller, predictions differ).
- `content/forbidden.js` (+ `SITUATION_REFUSAL`: nothing before the climax refuses a solution because of the situation), `content/mission.test.js`,
  `content/prep.js`, `content/peerSheet.js` « ورقة كوثر » (`peer:m2-kawthar`), `_unit/signatures/jidaa-maadum.js`.
- Config: mission « مسطرة المدرّب: متى يختفي الملعب؟ » (scene `pitch-planner`: the coach's board on an easel, a KidFigure girl in hijab and a boy),
  tools `khassiya-jidaa-maadum`, `taarif-muadala-jidaa`, `hulul-muadala-jidaa`, `tariqat-jidaa-maadum`, `climaxModule: 5`, checkpoints `cp-ahad`
  (−8) × b = 0, `cp-shakl`, `cp-farq` x² − 49 = 0 « 7 أو −7 », `cp-sifr` 7x(x − 2) = 0 « 0 أو 2 ». Modules: 0 the ladder; 1 and 2 `LabRounds`
  behind `PlayerSwitch` (M1 a player-only step 6 on `2x(x + 2)`; M2 a player-only « لماذا للمربّع حلّ واحد؟ » and « ورقة كوثر » last); 3 no lab in
  the player. No catalogue change (L2.9a).

**Added to shared code:** the `vanishing-pitch` player treatment behind `useInMissionPlayer()` (`VanishingPitch.jsx`, page unchanged; MANIPULATION_CONTRACT
« Twentieth example »); `logic/vanishingPitch.js` `init({ startX, range })` and `defaultV` honouring `startV` (unchanged without them); new
`logic/vanishingPitchPlayer.js` (`isNewPin`, `pinVerdict`, `claimVerdict`, `playerReady`, `isCovered`, predictions, `buildConstParts`, `buildOrParts`,
`buildSolParts`, `whichParts`, `restParts`, `coachOf`, `shownValues`). **`BuildAnswer` plain-text tile** `{ text: 'أو' }` (its own commit
`feat(lessons): BuildAnswer — opt-in plain-text tile`, test `primitives/labCheckpointBuildText.test.jsx`; guide § LabCheckpoint).

**Content rewrites** — SHARED-deliberate: `textbook.js`, `exercises.js` (`part: 'بأعداد المنصّة'`, `partsOf` uses `withContext`), `knowledge.jsx`,
`knowledgeGraph.js`, the notebooks, the M3 challenge, the final test's E2 / E4 (ids, skills, LPs kept); resource codes (`pitch-3-x-5…`) kept with new
titles. PLAYER-only: the rounds, the covered pitch, the « أو » builds, M1 step 6, M2's square question, the coach, the journal.

**Saved-answer keys:** kept 0, retired 0 (never in mission mode). New: fingerprint keys of the module questions, stars under `lab-vanish-m1` /
`lab-vanish-m2`, `peer:m2-kawthar`. The cover is re-derived from the journal on reload (gap 4).

**Traps (each was met)**
- Fast drags skipped ruler ticks (a zero passed under the finger unseen) — fixed.
- The rule question had a 4th option « ضلع سالب »: dropped to fit 1024 × 768 (3 options). The covered pitch fits at 1024 × 768 (the verdict's
  fallback was not needed).
- The solutions formula was split in two math islands, and « أو x = » came out in the wrong order — ONE `$…$` island.

**Review** (react, code, a11y): FIXED — the fast-drag ticks; a stale map subtitle; « تسع » in M0's description; bare digits beside a math island; the
rule card overflowing at 1024; the split formula; « أو x = » order. NOT changed: re-pinning a judged x re-sends `onTrial` (deduped by the rounds
model); controls not locked under the intro; the decorative ball mouse-only; advisory a11y items.

**Verification:** vitest green; `lab-rollout-status --lesson` ✅; `no-back-and-forth` LONE 0 OVER 0 PAIR 2; walks M1 r1 at 1366 ★★★, M1 r2 at 1024,
M1 r3 at 1920, the covered M2 r1 at 1024, M2 r2 at 1366 — 0 overflow / scroll / console error / clipped formula. NOT walked: home, « أستعدّ »,
the peer sheet, the final test, the map, a reload; the teacher view by render tests only.

## Unit 4, lesson 3 — `mutarajiha-ula` « المتراجحات من الدرجة الأولى بمجهول واحد وتمثيل حلولها بيانيًا » (2026-11-11)

**Council verdict (2026-11-11, binding — « L3 » + Cross-lesson):** L3.1 (b′) NO phone before the climax (r1 a pen budget, r2 the reading challenge,
both on the default decor). L3.2 the verdict MASKED while dragging (a render mask). L3.3 the division is the last step, BUILT with tiles; the
direction is the discovery, refuted by the student's own red points. L3.5 positive first, the new r3 `−2x + 7 ≤ 5` so the twins are not mirrors.
L3.6 the peer line `x ≥ −6` replaced. L3.8 no checkpoint divides by a negative. L3.9 five required rounds; M1 r3 demoted to ⭐ and step 3
rewired to r2 (gap 12). Module 1 over whole numbers, module 2 over relative numbers (gap 8). X1 test E3 / E5 / E6 rewritten.

**What was written**
- `content/rays.js` (`M1_ROUNDS` labId `lab-ray-m1`: r1 pens `6x+20≤80`, r2 the reading challenge `15x+25>100` (predictions `isSol:3` لا,
  `isSol:9` نعم), ⭐ `4x−5<11`, free; `M2_ROUNDS` labId `lab-ray-m2`: r1 `x<4` then `x≤4` (one round, two cases), r2 `2x+7≤9`, r3 `−2x+7≤5`, ⭐
  `4x−3>6x+2`, free) + `rays.test.js`.
- `content/forbidden.js`, `content/mission.test.js`, `content/prep.js` (`_unit/prepDiagnostic.test.js` reads `PREP_LADDER`), `content/peerSheet.js`
  « ورقة لقمان » (`2x + 19 ≤ 1`, `peer:m2-luqman`), `_unit/signatures/mutarajiha-ula.js`. Pupils هدى, عماد.
- Config: mission « رصيد رياض: كم رسالة على الأكثر؟ » (scene `phone-credit`: a phone whose credit gauge falls toward a floor line, envelopes, a house,
  a KidFigure boy), 5 tools, `climaxModule: 6`, checkpoints `cp-hal`, `cp-ramz`, `cp-yabqa`, `cp-tariqa`, `cp-nafs` (none divides by a negative).
  Modules 0–5 and 9 rewritten; modules 1 and 2 `LabRounds` behind `PlayerSwitch`, « ورقة لقمان » in module 2.
- Catalogue (commit `feat(curriculum): unit 4 lessons list their earlier-year prerequisites`): + `mutabayinat-amaliyat` (3AM), `muqarana-nisbiya`
  (2AM); LEARNING_NET « Seventh ».

**Added to shared code:** the `solution-ray` player branch behind `useInMissionPlayer()` (`SolutionRay.jsx`, page JSX unchanged; MANIPULATION_CONTRACT
« Twenty-first example »); `logic/solutionRay.js` gains only an optional `cardsFor(I, divide)` argument (its 16 tests untouched); new
`logic/solutionRayPlayer.js` (+ test). Strings `solutionRay.player / coach / predict` + `titlePhone`, `missionPhone`, `bWhy3` (book names and
numbers removed).

**Content rewrites** — SHARED-deliberate: `knowledge.jsx`, `knowledgeGraph.js`, `textbook.js`, `exercises.js` (incl. ex-22 / ex-23 that had two TRUE
distractors), modules 0–5 and 9, test items E3 (`−\dfrac15 x < 2`), E5 (the graph of x ≥ −5), E6 (the graph of x − 2 < −4) — ids and LPs kept.
PLAYER-only: the rounds, the masked verdict, the two-case round, the tile division, the coach, the journal, the a11y layer below.

**Saved-answer keys:** kept 0, retired 0. New: fingerprint keys, stars under `lab-ray-m1` / `lab-ray-m2`, `peer:m2-luqman`.

**Deviation:** a wrong build is a QUESTION miss (it can open « جرّب أصغر »), not a counted trial. NOT done: module 1's slug / file still
`rasail-yunus` / `Module01RasailYunus.jsx` (the name stays only in the URL; renaming changes routes).

**Review** (react, code, a11y): FIXED — two true distractors in ex-22 / ex-23; the checkpoint test reads option texts; test titles; an
`edgeFillParts` null guard; dead peer code; a11y in the player only — indigo focus rings, `aria-disabled` from state, the live region once per
gesture, hollow grey traces + ●/○, labelled toggle groups, LTR-isolated numbers. REJECTED — focus rings on the PAGE (the page stays identical); a
real `<caption>`.

**Verification:** vitest unit / manipulations / mission 4551 tests green; walks at the 3 sizes, every required round + the M1 ⭐ ★★★, 0 overflow /
scroll / page error. `no-back-and-forth` reached module 1 only (seeded progress does not unlock later modules — module 2 was walked with
`sequentialUnlock` temporarily false). At integration (after the `useModulePlayer` fix made the player-only steps really show), the scan over every
module found LONE 3 (maarif 8, 10, 14) and OVER 1 (awazzif 17 at zoom 0.6) — fixed, player only: the reminder cards are kept whole on one screen,
each worked example of maarif shares its screen with its ray and a new question on its bound (« هل 3/2 حلّ لـ 4x ≤ 6؟ », « هل 8 حلّ لـ
−x/4 + 1 < −1؟ »), the « tamthil-bayani » card asks for the rule (its two notes in its body, its two rays side by side), the three answer rays of
« مثّل بيانيا » (`GraphChoice.jsx`) in three columns. Rescan at 1366 / 1024 / 1920: LONE 0 · OVER 0; every awazzif screen at zoom ≥ 0.9.

**Open (for the owner):** the PAGE strings `liveLine`, `legend`, `bracketDone` show maths / the bracket glyph in the wrong direction (the player
avoids them); the coach bubble « ثبّت التمثيل » covers the « toward » buttons at 1024; the teacher view not walked; real-student timing.

## Unit 4, lesson 4 — `tarrid-mushkila` « ترييض مشكلة » (2026-11-11)

**Council verdict (2026-11-11, binding — « L4 » + Cross-lesson):** L4.1 (A) the r1 family carries the method. L4.2 (A′) the negative solution is met
on a SUM of two brothers (11 + 13 → 18, x = −3), never on a factor, a father or a calendar year. L4.3 the `roundsModel.js` additive change, owned by
this lesson. L4.4 (C′) the father is the shared `KidFigure`, 1.25 × the tallest child, `tunic`, teal, labelled « الأب » — no shared adult
variant (X5); the page keeps `PersonFigure`. L4.5 « ورقة شيماء ». L4.8 one `decor="board"` prop (a height board instead of the cake) in the
player only. Four required rounds.

**What was written**
- `content/race.js` (`M1_ROUNDS` labId `lab-race-m1`: r1 father 52, children 7 · 8 · 10 · 12 (x = 5); r2 26 and 2, × 4 (x = 6); r3 sisters
  13 + 10 → 31 (x = 4); ⭐ 55 against 11 · 12 (x = 3); free; `M2_ROUNDS` labId `lab-race-m2`: brothers 11 + 13 → 18 (x = −3), required; easier
  35 / 15 · 17, 55 / 26, 8 + 10 → 24, 12 + 15 → 25, each `releases`) + `race.test.js` (each round played to ★★★ in logic).
- `content/forbidden.js`, `content/mission.test.js`, `content/prep.js` (10 items; `_unit/prepDiagnostic.test.js` reads `PREP_LADDER`),
  `content/peerSheet.js` « ورقة شيماء » (`peer:m2-shaymaa`, the last step of M2), `_unit/signatures/tarrid-mushkila.js`.
- Config: mission « جدار القامات: متى يلحق الأبناء بأبيهم؟ » (scene `family-heights`: an unnumbered height board, the father and three children as
  KidFigure, pencil marks that rise with the tools), tools `tarrid-namdhaja`, `tarrid-tariqa`, `tarrid-mutarajiha`, `tahaqquq-waqi`,
  `climaxModule: 4`, checkpoints `cp-muhit`, `cp-la-yatajawaz`, `cp-tahaqquq`. Modules 1 and 2 `LabRounds` behind `PlayerSwitch`; M3 ten exercises and
  « دوري الآن » (a hexagon and a square, 6x ≥ 4(x + 5)) on platform numbers. Catalogue: + `muadalat-darajat-ula` (3AM).

**Added to shared code:** **`roundsModel` `tk:'model'`** (its own commit `feat(lessons): roundsModel — a model-check event`): `onTrial { tk: 'model',
ok, key?, free? }` logs `log.models` (the same key once), the goal **`{ modelOk: true }`**, a refused non-free model counts in `missesOf`,
« إعادة » clears models, a retry only with `{ models: true }`; `roundsModel.test.js` UNTOUCHED, new `roundsModelModels.test.js`. The `growth-race`
player behind `useInMissionPlayer()` (`GrowthRace.jsx`; page, teacher and synthesis tests unchanged; MANIPULATION_CONTRACT « Twenty-second
example »); new `logic/growthRacePlayer.js` (`shownValues`, `structureOf`, predictions, chains, `buildSpec`, `pastSpec`, `coachOf`);
`logic/growthRace.js` unchanged.

**Content rewrites** — SHARED-deliberate (book independence): the method moved to the r1 family; M3's ten exercises, « دوري الآن », figures, memo
cards, the map and the config on platform numbers (ids and كفاءات kept; ex-12 static, no longer answers 7); resource codes `growth-race-36-*` kept
with new titles. Not applied as designed: M1 step 2 uses `stepTemplate` gap boxes on r2's numbers; « ± » not moved above the ruler. PLAYER-only:
the rounds, the board decor, the KidFigure cast, the model checks, the coach, the journal.

**Saved-answer keys:** kept 0, retired 0. New: fingerprint keys, stars under `lab-race-m1` / `lab-race-m2`, `peer:m2-shaymaa`; model checks are
re-derived from the stars log (gap 4).

**Review** (react, code, a11y): FIXED — the i18n hook scope (`t` → `tx`); the live verdict says « صحيح. » / « خطأ. » + the relation; free chips name
their equation; the journal's x column `th scope="row"`; the scene transition now honours reduced motion. REJECTED — « resetKey changes the page
mode » (the page already passed it). Not fixed (low): `text-xs` journal, `border-slate-300` chips.

**Verification:** `lab-rollout-status --lesson` ✅; `no-back-and-forth` at 1366 LONE 0 OVER 0 PAIR 2; the first screens of M1 and M2 clean at the 3
sizes. A browser walk did NOT play a round to ★★★ (stuck after the first card drag) — the round test plays each round to ★★★ in logic only.

**Open (for the owner):** a full Playwright round walk; the long model-refusal list relies on the fit-zoom; Q2 (the cake on the growth-race PAGE —
default unchanged) and Q3 (a shared adult KidFigure later — default: decide after the screenshots).

## Unit 4 — what the integration verified, and the owner's questions (2026-11-11)

On the integrated tree (`integrate-unit4`): vitest `src/lessons` 720 files / 12 776 tests green; the entry at 240.2 KB gzip (≤ 245);
`lab-rollout-status` 140 / 140 lessons, 120 / 120 labs. Owner questions (verdict §6): **Q1** retrofit unit 3's textbook QCM test items like unit 4
(default: no, not now); **Q2** the cake on the growth-race page (default: unchanged); **Q3** a shared adult in `KidFigure` (default: decide after
the screenshots). The synthesis `wadiya-idmajiya-muadalat` is NOT converted (it waits for the synthesis-recipe answer). The unit page
(`pages/unit/unitMissions.js › 'muadalat-mutarajihat'`) is written: the fifth unit on it.

## Unit 5, lesson 1 — `mafhum-jumla` « مفهوم جملة معادلتين من الدرجة الأولى بمجهولين » (2026-11-12)

**Council verdict (2026-11-11, binding — « L1 » + X1–X11) and the owner's OQ1 (2026-11-12):** L1.1 the `staff` world stays on the page only.
L1.2 the two gauges MASKED while dragging, read on a commit; a trial = a new committed pair, except the pairs a round's goal requires (`free`).
L1.3 the COVERED round is required (one claim button « تحقّق من ثنائيتي »). L1.4 values in r1–r2, lines from r3. L1.6 the order (the swap) met ONCE
by the hand in r2; r1's build decoy 15, r3's third chip 24. L1.7 « ورقة صهيب ». L1.10 module-1 step 2's batch cut to two pairs. L1.12 one bridge
« من جملة إلى معادلة » at the end of module 3. L1.13 `cp-kathira` rewritten. L1.14 `(?<![0-9])` in front of the x-regexes. **OQ1 (owner,
2026-11-12, replaces L1.5 « no module-2 lab »):** module 2 opens on short special-case rounds `lab-pair-m2`.

**What was written**
- `content/pairs.js` (`M1_ROUNDS` labId `lab-pair-m1`: r1 `x+y=7∣3x+y=17` values, chain `season` (which gauge + BUILD « 17 = 3 × 5 + 2 », decoy
  15) → r2 `x+y=9∣50x+20y=300` values, `free: 'gauge1x3'`, counter « n من 3 », predictions `manyFirst` (start) and `swapSol` (at the accepted
  claim), chain `coins` after the swap (BUILD « 50x + 20y = 300 », decoy 330, then the rule) → r3 `x+y=13∣3x+y=29` COVERED, required (chain
  `covered`: read 29 · 13 · 24, then « why refused » only if such a refusal exists) → ⭐ `x−y=4∣x+2y=1` from (1 ; 1) → free (4 systems); easier
  rounds each `releases`. `M2_ROUNDS` labId `lab-pair-m2`: a bag of 6 coins all worth 50 دج — m2a `x+y=6∣50x+50y=280` (the gauges never light
  together, chain `never`), m2b `x+y=6∣50x+50y=300` (always together, chain `always`); three gauge-1 pairs free, then ONE tap) + `pairs.test.js`.
- `content/forbidden.js` (`TEXT`), `content/mission.test.js` (negative and positive controls; the final test's literal `correct` pinned to the
  data), `content/checkpoints.js`, `content/prep.js` (10 items), `content/peerSheet.js` « ورقة صهيب » (`2x − 3y = 8 ∣ x + y = −1`, (1 ; −2) accepted
  through a lost sign, `peer:m2-suhayb`), `content/test.js` (E1–E4 rewritten), `_unit/signatures/mafhum-jumla.js` (SYSTEMS with m2a / m2b as
  `required` — K2 / K3 skip a system without a unique solution).
- Config: `studentView: 'mission'`, `knowledgeMapOpen`, mission « شبّاك الحالة المدنية: عددان وشرطان » (scene `civil-registry`,
  `lessons/common/mission/CivilRegistryScene.jsx`: the town-hall counter under the live sign « الحالة المدنية », four empty desks whose lamps light
  one per tool, two KidFigure pupils, no adult), tools `jumla-tarif`, `hall-jumla`, `ikhtibar-thunaiya`, `tartib-thunaiya`, `climaxModule: 4`,
  checkpoints `cp-kathira` (`4x + y = 13`: « (1 ; 9) و (3 ; 1) معًا »), `cp-halat`, `cp-dhihni`. Modules: 0 the ladder; 1 `PlayerSwitch` +
  `LabRounds lab-pair-m1`, three player steps each after its round (`needsRound`); 2 `PlayerSwitch page={null}` + `LabRounds lab-pair-m2`, the
  « معارف » brief dropped in the player, the special-cases step re-reads both bags beside its prediction (`needsRound: m2b`), « ورقة صهيب »;
  3 platform exercises + the bridge; 7 E1–E4.

**Added to shared code** (`pair-scoreboard`, page JSX untouched): `systems/PairScoreboard.jsx` default export is now a 4-line dispatcher
(`useInMissionPlayer()` → `PairScoreboardPlayer` | `PairScoreboardPage`; `MatchCard`, `Coin`, `ValueBar`, `Deco` exported); new
`systems/PairScoreboardPlayer.jsx` (+ `pairScoreboardPlayer.test.jsx`) and pure `logic/pairScoreboardPlayer.js` (+ test): `initRound`,
`act`, `discovered`, `CHAIN_SPECS` season · coins · covered · never · always · none, `predictOptions` / `predictTruth` / `judgedPredictions`,
`coachOf`, `stripGrid`, `shownValues`, `choiceProps`. MANIPULATION_CONTRACT « Twenty-third example ». Strings `pairScoreboard.player / coach /
predict` (player nouns say « دج »). No roundsModel / LabRounds / LabCheckpoint change.

**Content rewrites** — SHARED-deliberate (the teacher page gains too): module-1 page on the season `x+y=7∣3x+y=17` and the staff
`x+y=29∣2(x−3)=y−2`, « انتقل … إلى مصلحة أخرى » (never « تقاعد » before the climax); the معارف, special cases and classification on platform
systems (c3 `x+y=8∣x−y=4`: the old one was L2's easier r1, K1); knowledge cards, map and exercises rewritten (ex-2 split in two screens);
`ChallengeVignette.jsx` deleted; resource codes kept, titles rewritten. PLAYER-only: the rounds, the masked gauges, the chains, predictions,
coach, journal, the module-2 rounds, the bridge.

**Saved-answer keys:** kept all module question ids, retired 0. New: stars under `lab-pair-m1` / `lab-pair-m2`, `peer:m2-suhayb`. No key for
round state (discovery, cover and predictions re-derived from the stars log).

**Traps (each was met)**
- A ruler of FIXED width taken from the scene's width ratcheted wider than its column and read the finger on a different width (a drag to 6 gave
  9): the track is `flex-1 min-w-0`, measures itself (`ResizeObserver`) and reads `rect.width` at gesture time.
- `_unit/missionStrings.test.js`: Vite keys sibling paths `../mafhum-jumla/…`, so the « outside the unit » filter misfired — f41910c4.
- The verdict's r3 chip 24 collides with the design's role list: the verdict wins, documented in `forbidden.js`.
- `check:lessons` refuses a computed `correct` in a `BossFinal` item (the assessment registry exports it): literals + a test.
- A claim on the untouched start pair made it a trial (review) — fixed.

**Verification:** vitest `src/lessons` green; `lab-rollout-status --lesson mafhum-jumla` ✅; `no-back-and-forth` LONE 0 · OVER 0 at 1024, 1366,
1920; browser walk at 1024 × 768: r1, r2, r3, ⭐, m2a, m2b all ★★★, no scroll, no overflow, 0 console error; r3 three refusals → « جرّب أصغر » →
easier won → r3 released 1★; a reload keeps the stars. Walks at 1366 × 768 and 1920 × 1080 (builder's final report): r1, r2, r3, ⭐ ★★★ at
both, m2a and m2b ★★★ at 1366; no scroll, no overflow, 0 console error.

**Open (for the owner):** `estimatedMin` M1 17, M2 16 (12 + ≈ 4 for the OQ1 rounds; total 80) not yet timed on a real student.

## Unit 5, lesson 2 — `hall-jabri` « حل جملة معادلتين من الدرجة الأولى بمجهولين جبرياً (طريقتا التعويض والجمع) » (2026-11-12)

**Council verdict (2026-11-11, binding — « L2 » + X1–X11):** L2.1 the kiosk HOOK leaves module 1 (after the climax); L2.2 riddle cards on a plain
strip (no kiosk decor, no price, no « دج » in a round), leads by إكرام (r1, r3) and إسحاق (r2); L2.3 no module-2 lab; L2.7 `build` once per method
(`build-sub`, `build-add`); L2.8 « ورقة أسامة »; L2.9 round titles name no method; L2.10 `samePair` has two options, the substituted line stays
visible; L2.11 the checks of both cards at `done`; L2.12 `ex-6-a`, `ex-8-b` re-picked; X7 a player file + a dispatcher; X11 rule P.

**What was written**
- `content/cards.js` (`M1_ROUNDS` labId `lab-cards-m1`: r1 `x+y=8|x−y=2` one method → r2 `2x+y=11|3x−y=4` both methods (predictions `vanish`,
  `samePair`) → r3 `2x+3y=14|x−y=2` both methods, required (prediction `multiplier`) → ⭐ `4x+3y=5|3x−2y=8` → free (5 systems); easier rounds one
  method, `releases`) + `cards.test.js` (every required / easier round PLAYS its plus path, ★★★ reachable through `roundsModel`, the role scan with
  a negative control).
- `content/forbidden.js` (`TEXT`, `RULE_P`), `content/mission.test.js`, `content/prep.js` (10 statements) + test, `content/peerSheet.js`
  « ورقة أسامة » (`2x+y=14|3x−2y=7`, only the first side multiplied, `peer:m2-usama`) + test, `content/exercises.test.js` (every pair recomputed,
  rule P on every pre-climax line), `_unit/signatures/hall-jabri.js`.
- Config: mission « كشك الحي: ثمنان على بطاقتين » (scene `kiosk-cards`, `lessons/common/mission/KioskCardsScene.jsx`: awning, counter, two BLANK
  cards, a KidFigure girl in hijab and a boy, no adult, no number), tools `takhallus-majhul`, `hall-thunaiya`, `tariqat-tawid`, `tariqat-jam`,
  `ikhtiyar-tariqa`, `climaxModule: 4`, checkpoints `cp-thunaiya` (4 ; 3), `cp-jam` (7 ; 1), `cp-ikhtiyar` (3 ; −2), each with a data-only
  `system` field read by the signature. Modules: 0 the ladder; 1 `PlayerSwitch` + `LabRounds`, four player steps each after its round
  (`useModulePlayer(MODULE_CTX)`); 2 platform worked examples, « دوري », « ورقة أسامة » last; 3 titles without exercise numbers; 5 the kiosk riddle
  as the module's `footer`; 7 E1 / E2 rewritten.

**Added to shared code** (`elimination-cards`, page JSX untouched): `systems/EliminationCards.jsx` default export is a 4-line dispatcher
(`EliminationCardsPlayer` | `EliminationCardsPage`, `Tile` exported); new `systems/EliminationCardsPlayer.jsx` (+ `eliminationCardsPlayer.test.jsx`)
and pure `logic/eliminationCardsPlayer.js` (+ test): `trialOf`, `REFUSALS`, `stateKey`, `subPaths` / `plusPaths`, `playSubstitution` /
`playStack` / `finish`, `buildSpec` (the decoy by PATH: `signLost`, `oneSide`, `noBracket`, `transposition`), `seeSpec`, `CHAIN_SPECS` r1 / r2 /
r3 / none, predictions, `coachOf`, `shownValues`. `logic/eliminationCards.js` and its tests untouched. MANIPULATION_CONTRACT « Twenty-fourth
example ». Strings `eliminationCards.player / coach / predict`.

**Content rewrites** — SHARED-deliberate: `textbook.js` (ACTIVITY on `x+2y=15|3x−y=3` with إكرام / إسحاق, METHOD, METHOD_BOX, CHOICE, the QCM
E1 / E2, the HOOK in « دج »), `exercises.js` (every row on platform numbers), `knowledge.jsx`, `knowledgeGraph.js`, modules 0–3, 5, 7, titles and
resource titles (codes kept). `levels.js` presets untouched (shared test). PLAYER-only: the rounds, chains, predictions, coach, journal, the masked
pair, the stacked cards. **Rule P in practice:** nothing the lesson WRITES before module 4 shows a minus before a bracket; the lab still SHOWS
the student's own minus path (`3x − (11 − 2x) = 4`) and never refuses it.

**Saved-answer keys:** kept 0, retired 0 (never in mission mode). New: fingerprint keys of the module questions, stars under `lab-cards-m1`,
`peer:m2-usama`. No key for round state.

**Deviation (accepted at integration):** the kiosk HOOK is the END of module 5 (`GuidedProblem` `footer`), not its first step — `GuidedProblem`
takes no step before its parts; the riddle stays after the climax, which was the point of L2.1. No shared `prelude` prop.

**Traps (each was met in the walk)**
- Two cards side by side at 1024 × 768: three x tiles pushed the handle of (1) over the value of (2) → the player stacks the cards.
- The coach bubble « احمل القيمة » covered the value chip → dropped; the sentence above the chip says it.
- A long sum line was clipped in the journal → `FitLine` in the journal and in the current-line bar.

**Review** (react, code, a11y — every finding verified): FIXED — `role="group"` + label on the cards grid; focus after a prediction; the focus
timer cleared on unmount; TeX out of an aria-label; the peer sheet's `why`; the swapped part-2 pairs in `UNIT.pairs`. NOT changed — `aria-disabled`
on frozen `DraggableObject`s (shared primitive; drops are guarded); the 1.6 s prediction hold (shared pattern).

**Verification:** vitest `src/lessons` green; `check:lessons` exit 0; `lab-rollout-status --lesson hall-jabri` ✅; Playwright (pointer drags)
r1 · r2 · r3 · ⭐ all ★★★ at 1024 × 768, 1366 × 768 and 1920 × 1080, 0 page scroll, 0 `data-fit-overflow`, 0 console error; `no-back-and-forth`
LONE 0 · OVER 0 · PAIR 0 at the three sizes. NOT done: an answering walk through every module step, the easier round, a reload mid-round, the
teacher view (render tests only).

**Open (for the owner):** one real student timed on module 1; the kiosk riddle as module 5's last screen.

## Unit 5, lesson 3 — `mushkilat-jumla` « حل مشكلات بتوظيف جمل معادلتين من الدرجة الأولى بمجهولين » (2026-11-12)

**Council verdict (2026-11-11, binding — « L3 » + X1–X11) and the owner's OQ2 / OQ5 (2026-11-12):** L3.1 no `tickets` structure before module 4.
L3.2 an opening without day or digit. L3.3 the NEGATIVE case required (p1); the fractional case a free choice. L3.4 TWO required M1 rounds (r1
count + money, r2 money + money with a SILENT useless chip « 8 أيام »), the old books round the ⭐. L3.5 `items` drawn inside the player (no shared
`CountTray`). L3.6 the key line TYPED in both required rounds. L3.7 « ورقة وئام ». L3.11 builds that fit (`buildCheck` « 70 × ▢ + 20 × ▢ = ▢ »,
decoy 12; `buildAnswer` on the wide text slot; `refuseTap`). L3.12 one chain id per stage. L3.13 predictions `dearer` (r2) and `which` (p1).
L3.14 « المرحلة n من 5 ». L3.15 the story on screen at every stage. L3.16 one adult in the scene. **OQ2:** the climax day is « يوم الأحد ».
**OQ5:** the page string « جدول الكتاب » is rewritten with the synthesis (the player never shows it).

**What was written**
- `content/stories.js` (`M1_ROUNDS` labId `lab-story-m1`: r1 « نادي الرسم » `x+y=12∣70x+20y=440` → (4 ; 8) by hand (the two « 1 » placed, the line
  `50x = 200` TYPED, BUILD with the decoy 12, then `answerWhy`) → r2 « مكتبة الحيّ » `2x+y=230∣x+2y=190` → (90 ; 50) (the silent chip « 8 أيام »,
  reason `unused`; prediction `dearer`; `solveTyped`, `verifySwap`, BUILD the answer sentence, rule) → ⭐ « معرض الكتب » → free; `M2_ROUNDS` labId
  `lab-story-m2`: p1 « دفتر التعاونية » `x+y=15∣1100x+700y=17700` → (18 ; −3): the facts hold, the story REFUSES (`naturalTap` → `refuseTap` →
  `ruleNatural`; prediction `which`) → free (incl. the fraction); easier rounds each `releases`) + `stories.test.js`.
- `content/forbidden.js`, `content/mission.test.js`, `content/prep.js` (the ladder: hall → `hall-jabri`, tarjama → `tarrid-mushkila`),
  `content/peerSheet.js` « ورقة وئام » (the reversed comparison « يزيد … عن … بـ », `peer:m2-wiam`), `_unit/signatures/mushkilat-jumla.js`.
- Config: mission « شبّاك متحف الولاية: كم بالغًا وكم صغيرًا؟ » (scene `museum-desk`, `lessons/common/mission/MuseumDeskScene.jsx`: façade,
  blank price cards, turnstile, the guard's notebook filling page by page, a KidFigure sister in hijab and brother, ONE adult at 1.25 ×), tools
  `jumla-tarjama`, `khutuwat-hall`, `tahaqquq-nas`, `climaxModule: 4`, checkpoints `cp-ajal`, `cp-jawab`, `cp-muhit`. Modules 1 and 2 `LabRounds`
  behind `PlayerSwitch`; module 2's « not natural » pen step is a callback on p1 (no rounding option); module 3's figure and exercise side by side
  in one `data-paging-keep`.

**Added to shared code** (`story-modeller`, page and the synthesis's frozen render untouched): `systems/StoryModeller.jsx` default export is a
4-line dispatcher (`StoryModellerPlayer` | `StoryModellerPage`); new `systems/StoryModellerPlayer.jsx` (+ `storyModellerPlayer.test.jsx`) and pure
`logic/storyModellerPlayer.js` (+ test): `playerInit`, `placeOnes`, `checkPlayerModel`, `modelKey`, `trialKey`, `refused`, `discovered`, `MOMENTS`,
`CHAIN_SPECS` first · second · easyFirst · easySecond · impossible · impossibleEasy · none, `checkBuild`, predictions, `coachOf`, `shownValues`.
MANIPULATION_CONTRACT « Twenty-fifth example ». No roundsModel / LabRounds / LabCheckpoint change (the model check reuses `tk:'model'`).

**Content rewrites** — SHARED-deliberate: module 1 page levels R1 and the ⭐ (resource codes kept, titles new); `textbook.js` (activity = r1, the
old museum numbers gone; CHALLENGE the grown money box 29 / 385; ABU_KAMIL reads `_unit/abuKamil.js`); module 2 (the Abū Kāmil problem on
platform numbers); the ten module-3 exercises; module 7 E1 rewritten, names removed, « DA » → « دج »; knowledge cards and map on the new numbers;
« يوم الجمعة » → « يوم الأحد » in the climax (OQ2). PLAYER-only: the five-stage player, stories, predictions, coach, journal, trays.

**Saved-answer keys:** kept 0, retired 0. New: stars `lab-story-m1` / `lab-story-m2`, `peer:m2-wiam`; no round-state key.

**Traps (each was met)**
- « معرض الكتاب » trips every « الكتاب » book scan → « معرض الكتب ».
- A test regex for « x + y = 180 » matched « 2x + y = 180 » → `(?<![0-9])`.
- A check with an empty slot was counted as a model refusal → now told, not counted.
- The coach bubble over the chips covered the equation rows → below.
- « -3 » in an Arabic verdict rendered « 3- » → values isolated with U+2066 … U+2069.
- Module 3's figure and exercise stacked → OVER → side by side, one `data-paging-keep`.

**Verification:** vitest `src/lessons` green; `lab-rollout-status` ✅; Playwright walk r1 / r2 / p1 ★★★ at 1024 and 1366 (a reload keeps the
stars); `no-back-and-forth` LONE 0 · OVER 0 · PAIR 0 at 1366 / 1024 / 1920.

**Open (for the owner):** `TextbookExercise` prints the source number (« تمرين 21 ») on the student screen — shared component, every lesson;
`estimatedMin` M1 14 / M2 13 not yet timed on a real student.

## Unit 5 — what the integration verified, and the owner's decisions (2026-11-12)

On the integrated tree (`integrate-unit5`, merges L1 34091dd3 → L2 2002c3c8 → L3 f9c88b25, then the unit page fd292892): vitest `src/lessons`
744 files / 12 992 tests green; `check:lessons` exit 0 (entry 241.4 KB gzip ≤ 245); `e2e/unit-mission-view.mjs` 0 failures at every size. Fixes on
`dev` during the unit: e031e438 (`mutarajiha-ula` knowledge audit — `establishes` on the module-3 brick), f41910c4 (the unit-5 cast test glob).
Owner decisions (2026-11-12): **OQ1** module-2 special-case rounds `lab-pair-m2` in `mafhum-jumla` (built); **OQ2** the L3 climax day is « يوم
الأحد »; **OQ3** net links `3am.m5.r03` / `3am.m5.r05` → `4am.m5.r01` (commit 0cbc979e, `LEARNING_NET.md`); **OQ4** the synthesis
`wadiya-idmajiya-jumal` is converted NOW with the provisional synthesis recipe (units 1–4's syntheses still wait); **OQ5** the `story-modeller`
page string « جدول الكتاب » is rewritten with the synthesis. Accepted deviation: `hall-jabri`'s kiosk HOOK at the END of module 5. The unit page
(`pages/unit/unitMissions.js › 'jumal-muadalatayn'`) is written: the sixth unit on it.

## Unit 5, synthesis — `wadiya-idmajiya-jumal` « أدمج تعلّماتي » (2026-11-12) — the SECOND synthesis in the player

**Decisions (binding):** owner OQ4 (convert this synthesis with the provisional recipe; units 1–4's syntheses untouched) and OQ5 (the shared
`story-modeller` string `formalTitle` « … جدول الكتاب » rewritten: « مراحل حلّ مشكلة بجملة معادلتين — خمس خطوات », its own commit; the synthesis
snapshot did not change, the string shows only after the discovery). The recipe was applied as written. What differs from the pilot: module 7's
unit situation IS the 🏆's own situation (« حفل البلدية »): module 7 ANALYSES it (unknowns, system, simplification by 150, method) and never
solves it.

**What was written**
- Config: `studentView: 'mission'`, `knowledgeMapOpen`, scene `party-table` (`mission/PartyTableScene.jsx`: equal rows of juice and cake, a
  leftovers tray, blank price tags, a girl in hijab and a boy, no number), an opening without a digit, `cta: 'أجرّب'`, `toolsOwned` = five keys of
  the three lessons (`hall-jumla`; `tariqat-tawid`, `tariqat-jam`; `jumla-tarjama`, `tahaqquq-nas`) with `usedIn`, `checkpoints: []`,
  `climaxModule: 8`, `stationLabels`, `trainings`, `hideStars`, `durationMin: 79` (6 + 39 + 28 + 6), `sittings: 2`, `resumeInside`.
- **Role scan FIRST** (`content/forbidden.js` + `content/mission.test.js`), and it FAILED first on training 4 (a flag at 50 دج = the cake price the
  🏆 finds), the memo cards and the open map. Two levels: `ANSWER_TEXT` (the 🏆 solved — (25 ; 50), 6x = 150, 2250 − 6x, 1950, 2040, 37,5, a juice
  at 25 / a cake at 50) nowhere before the 🏆, module 7's own source included; `SITUATION_TEXT` (11250, 2100, 150x, 24x + 30y, x + y = 75,
  « حفل البلدية ») nowhere before module 7. Rounds scanned by role through `shownValues`.
- Training 4 renumbered (flags 30 / 60 دج, orders 300 and 432 دج, a 1080 دج order); training 6's « ياسين » (a unit climax name) → « إسماعيل »;
  29 typed training steps carry `shape`; memo cards and map in letters, one fresh example (→ (60 ; 20)).
- « أستعدّ »: `content/prep.js`, 10 statements over the unit's three lessons in cycle, the first three true, truths recomputed by its test.
- Module 7 (`Module07AlWadiya.jsx`), `LabRounds labId="m7-wadiya"` (`content/rounds.js`): **r1 « رحلة القسم »** 10x + 10y = 550 | 5x + 3y = 235 →
  (35 ; 20), by hand, chain `synthTrip` (typed 2x = 70, `verifySwap`: the swapped pair passes the equal-count fact and fails the other, the answer
  BUILT); **r2 « حفل المدرسة »** 120x + 120y = 8400 | 9x + 14y = 780 → (40 ; 30), chain `synthParty` ending on the NUMERICAL build
  « 120 × (40 + 30) = 8400 » (decoy 70); practice rounds that release: 4x + 4y = 240 | 3x + 2y = 160 → (40 ; 20) and 20x + 20y = 900 | 3x + 5y = 165
  → (30 ; 15); a free lab. Steps: read + unknowns (needs r1) → strategy « equal counts → divide » (needs r2) → the notebook screen → the حفل's system
  (first pen step, its two facts on the same screen) → simplification by 150 → verification in words → « ورقة عائشة » (`content/peerSheet.js`, a
  PLAN with no number; the error: « the pair satisfies the simplified equation, so it solves the system »). A pause line before the 🏆. Module 8
  untouched. The four round systems are in the unit's `SYNTH` (`_unit/forbiddenShared.js`), so no lesson of the unit may show them; عائشة
  (`m7-aisha`) is in the unit's cast (`_unit/missionStrings.test.js`).

**Added to shared code (additive):** the story-modeller player gains `CHAIN_SPECS.synthTrip` / `synthParty`, `equalRow`, `sumBuild`,
`QUESTIONS.buildSum` (`k × (▢ + ▢) = ▢`), glyphs `juice` and `cake`, strings `storyModeller.player.q.buildSum.*`; `shownValues` lists the build
tiles only for a round that asks `buildSum`; test `logic/storyModellerPlayer.synth.test.js`. Lesson 3's tests unchanged and green.

**Saved-answer keys:** none new; round state from the stars log.

**Traps:** a two-word `short` overflowed the wide text slot of `buildAnswer` at 1024 (one word: « العلبة », « القطعة »); a paged step whose
question asks about a statement keeps statement + question in ONE `data-paging-keep` block, the post-answer brick OUTSIDE it; the coach bubble
« تحقّق من ترجمتك » sits over the second slot row of a six-chip money story; the peer file was first `peerPlan.js` to dodge the unit's cast test —
the integrator renamed it `peerSheet.js` and registered the name, so the platform-wide peer-name checks see it.

**Review:** FIXED — holes in the role scan (comma and `\,` thousands, x = 25 / y = 50, 150 = 6x, 2250; each with a negative control, the scan
narrowed so `x + y = 50` is not flagged); the 🏆 glyph in the notebook text `aria-hidden`. REJECTED — seeding `won` from stored stars (the pilot's
pattern; the walk shows the steps unlock after a reload); the 🏆 in the module subtitle (a string prop, as the pilot).

**Verification:** on the integrated tree (`integrate-unit5`, merge b0418e07 + the cast / SYNTH follow-ups e32dd4f9, bb8904c5): vitest
`src/lessons` + `src/pages` 760 files / 13 399 tests green; `check:lessons` exit 0 (entry 241.4 KB gzip); `lab-rollout-status` ✅ for the four
lessons of the unit. Builder: `no-back-and-forth` on every module LONE 0 · OVER 0 · PAIR 0 at 1366 / 1024 / 1920; walk at 1024 × 768 — r1 and r2
★★★ (a free model refusal in r2), stars kept after a reload, 19 step screens with 0 overflow and 0 wrapped formula; 28 of the 38 typed training
steps entered (every kind: gap, quantity, word suffix).

**Open (for the owner):** module 8 (untouched by rule) still prints « 11 250 DA » / « 2 100 DA »: the grouped thousands are reversed by the bidi
and « DA » is not « دج »; module 7's estimate (≈ 28 min: 10–11 for the rounds, ≈ 17 for the steps) is not timed on a real student.

**Recipe lessons:** when the unit situation IS the 🏆's situation, split the signature in two (the answer: never before the 🏆; the situation: never
before module 7) and scan module 7's own source for the answer. A synthesis may need a new chain for its own phenomenon (here « equal counts →
k × (sum) »): additive in the lab's player logic, never a page change.

## Unit 1, synthesis — `wadiya-idmajiya-aadad` « أدمج تعلّماتي » (2026-11-12) — the THIRD synthesis in the player

**Decisions (binding):** owner go-ahead 2026-11-12 for the syntheses of units 1–4 (the provisional recipe), owner rules of the same day
(« دج », no thousands space, no book pointer). As in unit 5, module 7's unit situation IS the 🏆's situation (the aprons, 936 / 845): module 7
ANALYSES it (data, condition, strategy, the model PGCD(936 ; 845), each school's share in the letter g) and never solves it.

**What was written**
- Config: `studentView: 'mission'`, `knowledgeMapOpen`, scene `apron-store` (`mission/ApronStoreScene.jsx`: two stacks of folded aprons, identical
  school crates with one pink and one blue row, a girl in hijab and a boy, no number), an opening without a digit nor the situation, `cta: 'أجرّب'`,
  `toolsOwned` = five keys (`qawasim-mushtaraka`, `pgcd-taarif` — qasim-mushtarak-akbar; `pgcd-baqi`, `khwarizmiyat-iqlidus` — bahth-pgcd;
  `jidaa-aamilayn` — qawasim-adad-tabii) with `usedIn`, `checkpoints: []`, `climaxModule: 8`, `stationLabels`, `trainings`, `hideStars`,
  `durationMin: 87` (6 + 41 + 28 + 12), `sittings: 2`, `resumeInside`; two `manipulation` resources for module 7 (same objective, as the validator wants).
- **Role scan FIRST** (`content/forbidden.js` + `content/mission.test.js`). It FAILED first on the open knowledge map (the root node showed the whole
  situation, 936 / 845, and the useful-data list), on a memo card pair (28 / 42 = a lesson-4 pair), on module 7's brief « الكتاب ص 7 » and on the config.
  Two levels: `ANSWER_TEXT` (13, 72, 65, 91, 26, the 🏆's Euclid lines — nowhere before the 🏆, module 7's own source included);
  `SITUATION_TEXT` (936, 845, 1781, the apron words — nowhere before module 7). Rounds scanned by role through values recomputed with core
  (`euclidSteps`, the groups 1 … g + 1, remainders, shares, prediction chips). A COLLISION rule: no round, free, ladder or memo pair is a pair
  exported by the unit's eight lessons' `content/*.js` (deep walk of `{ a, b }`) — it caught 12 / 9, 24 / 40 and 30 / 45 on the first run.
- The open map speaks in LETTERS (a, b, g) — `content/textbook.js › METHOD_LETTERS`, imported by `knowledgeGraph.js` (a content file, so the
  graph test's « grounded aid » rule still holds). Memo cards: fresh numbers (PGCD(40 ; 56) = 8, PGCD(63 ; 42) = 21, PGCD(75 ; 30) = PGCD(30 ; 15) = 15).
- 43 typed training steps carry `shape`: every Euclid remainder is typed in its line (`gap`, « 3090 = 1854 × 1 + [ ] »), every PGCD in
  « PGCD(612 ; 174) = [ ] » (`gap`), lengths `quantity` m / cm, money `quantity` دج; counts keep their word suffix or stay bare.
- « أستعدّ »: `content/prep.js`, 10 statements, qawasim → pgcd → iqlidus in cycle (« راجع » qasim-mushtarak-akbar, tayin-pgcd, bahth-pgcd),
  levels 1·1·1·2·2·2·2·3·3·3, the first three true, truths recomputed in `prep.test.js`. The six old items stay in `textbook.js`.
- Module 7 (`Module07TahlilWadiya.jsx`), `LabRounds labId="m7-wadiya"` (`content/rounds.js`): **r1 « لوازم المدارس »** `common-divisors` groups
  by hand, 42 pens / 35 notebooks on schools (`theme: 'school'` + `context` words مدرسة / مدارس) → 7 schools, chain observe (7, 6, 5) → BUILD
  42 = 7 × 6 → beyond (8 schools: 2 pens left) → rule; **r2 « المخزن الكبير »** `euclidean-algorithm` 816 / 697 with predictions, `handDone`,
  chains `['pgcd']` + `share` → remainders 119, 102, 17, 0 → stop → rule → the NUMERICAL build 816 = 17 × 48 (decoy 41, the other share);
  practice rounds that release: 15 / 6 (groups) and 57 / 38 (Euclid); a free Euclid store (816/697, 57/38, 408/153, 98/70). Steps (both views):
  1 the situation + sorting the data (one screen) · 2 the condition (needs r1; r1's trace, the facts and the question on ONE screen) · 3 the
  strategy (needs r2; the r2 chain beside the question) · 4 the notebook screen « اكتب في 3 أسطر » · 5 the model « أكبر عدد ممكن من المدارس =
  PGCD(936 ; 845) » (first pen step, facts on the same screen) · 6 each school's share and the stop rule, in the letter g (batch) · 7 « ورقة نسيبة »
  (`content/peerSheet.js`: a PLAN, no number; the error = « the same number of aprons per school, so the number of schools divides the TOTAL »).
  A pause line before the 🏆. The old brief (« الكتاب ص 7 ») and the MethodSteps « كما في الكتاب » are gone; the teacher page gets a two-level
  workspace (groups 42 / 35, Euclid 816 / 697). Module 8 untouched (no « DA », no spaced thousands, no visible book pointer — tested).

**Added to shared code (additive):** `euclidean-algorithm` prop `share` = `{ all, groups, each }` → `CHAINS_SHARE` (player only: pgcd chain
`stop · rule · share`), `QUESTIONS.share` (BUILD a = PGCD × part, `ops ['=', '×']`, tiles [a/g, b/g, a, g]), strings `manipulation.euclid.cp.share.*`.
Absent `share`, nothing changes (bahth-pgcd's tests green). Scene `apron-store` registered in `MissionScene.jsx`.

**Saved-answer keys:** none new; round state from the stars log (`m7-wadiya`).

**Traps:** a module `brief` comes BEFORE the lab in the player (its own first screen) — a synthesis module 7 drops it and shows the statement in
step 1; a won-round trace panel (`WonPanel`) outside the question's `data-paging-keep` falls on its own screen (back-and-forth) — put it INSIDE;
« و845 » (a conjunction glued to a number) reads « 845و » — module 7 shows the text with a space; a prompt « … $= \ldots$ » renders the gap on the
wrong side in RTL — say it in words (« … يساوي: »); `check:activation-drift` in a fresh worktree needs `node packages/core/curriculum/exportCurriculum.mjs`;
the validator wants both levels of a module's two `manipulation` resources to state the SAME objective.

**Review (`ecc:react-reviewer`, `ecc:code-reviewer`, `ecc:a11y-architect`):** FIXED — the scan's `num()` excluded « { » before a number, so
`\frac{936}{845}` / `\text{13}` passed (negative controls added); the description, stations 0–6 and key labels are now scanned before module 7 (the
description said « المآزر » → neutral wording); the Facts list has an `aria-label`; WonPanel keys by index; the `share` tiles are distinct. REJECTED —
an order-free « 816 = 48 × 17 » (the slots are labelled whole / groups / each, the same strict build as lesson 4's a = k × q); explicit names for
BuildAnswer slots (shared `LabCheckpoint`, every build question — for the owner).

**Verification:** vitest `src/lessons` + `src/pages` (762 files, 13 426 tests; one graph-grounding failure fixed, then the unit, progressive map,
divisibility and mission folders re-run green: 50 files / 3 356 tests); `check:lessons` every part exit 0 (activation-drift after the export; entry
241.4 KB gzip); `lab-rollout-status --lesson wadiya-idmajiya-aadad` ✅; `no-back-and-forth` LONE 0 · OVER 0 · PAIR 0 at 1366 / 1024 / 1920; walk of
module 7 at 1024 / 1366 / 1920×1080 (r1 ★★★, r2 won, 13 step screens, 0 overflow, 0 scroll, 0 wrapped formula); trainings walk at 1024: 48 of 57
typed steps entered in their shape, 0 issues. Module 7's required path, automated: ≈ 40 s (rounds 22 s) — a student estimate ≈ 28 min, not timed.

**Open (for the owner):** lesson 6 `bahth-pgcd` still holds the 🏆's situation and its full solution (resource `challenge-936-845`, an exercise
explaining 936 = 845 × 1 + 91 … → 13) — the challenge is not new to a student who did lesson 6 (not my file: a cross-lesson decision); the mission
bar wraps to two rows at 1024 once the ⭐ counter appears beside five keys (shared UI, also on the pilot?); module 7's ≈ 28 min estimate is not timed
on a real student.

**Recipe lessons:** when the 🏆 IS module 7's situation and the unit's labs are generic (common-divisors, Euclid), the synthesis phenomenon (« the
PGCD is the number of groups, a ÷ PGCD each ») needs ONE additive chain on the lab that computes (Euclid `share`) and the round on small numbers
reuses the lesson lab's own BUILD (a = k × q); a COLLISION test by deep walk of the unit lessons' exported `{ a, b }` pairs replaces unit 5's
signature files for a unit that has none.

## Unit 2, synthesis — `wadiya-idmajiya-judhur` « أدمج تعلّماتي » (2026-11-12) — the FOURTH synthesis in the player

**Decisions (binding):** owner go-ahead 2026-11-12 for the syntheses of units 1–4 (the provisional recipe), owner rules of the same day
(« دج », no thousands space, no book pointer). As in units 5 and 1, module 7's unit situation IS the 🏆's situation (the carpet: 24 m², the
length double the width): module 7 ANALYSES it (data, the model 2ℓ² = 24, the positive solution, simplest form, rounding at the end) and never
solves it.

**What was written**
- Config: `studentView: 'mission'`, `knowledgeMapOpen`, scene `rug-market` (`mission/RugMarketScene.jsx`: a rug twice as long as wide on a market
  floor, a measuring tape along its width, a girl in hijab and a boy, no number nor letter), an opening without a digit nor the carpet word,
  `cta: 'أجرّب'`, `toolsOwned` = five keys, one per lesson (`jidhr-taarif` — jidhr-tarbii; `qima-muqarraba` — natiqa-ghayr-natiqa; `hulul-x2-a` —
  muadalat-x-murabba; `jidaa-jidhrayn` — amaliyat-judhur; `kitaba-a-jidhr-b` — tawzif-khawass-judhur) with `usedIn`, `checkpoints: []`,
  `climaxModule: 8`, `stationLabels`, `trainings`, `hideStars`, `durationMin: 90` (6 + 44 + 28 + 12), `sittings: 2`, `resumeInside`; two
  `manipulation` resources for module 7 (same objective). Module 7's `estimatedMin` 12 → 28.
- **Role scan FIRST** (`content/forbidden.js` + `content/mission.test.js`). It FAILED first (log `synth/rolescan-judhur-first-fail.log`) on
  training 3 (a decoy 2√3 = √12), training 4 (pieces 12 / 27 / 48 → 2√3 and 4√3, the 🏆's width and length!), the memo card `tadhkir-x2-a`
  (x² = 12 ⇔ ±2√3 — the 🏆's answer, open from the first screen) and `tariqat-wadiya` (√48 = 4√3), the open knowledge map (root = the whole
  carpet text, 24 m², 12000), « DA » in the data, module 7's « الكتاب ص 28 » brief and SourceTag, and the config. Two levels: `ANSWER_TEXT`
  (√12, 2√3, 4√3, √48, ℓ² = 12, 3,46…, 6,93…, 346, 347, 692, 693 — nowhere before the 🏆, module 7's own source included); `SITUATION_TEXT`
  (the carpet words, وادي سوف, 12000, 24 m², 2ℓ² = 24 — nowhere before module 7). Rounds scanned by role (`card`, `solution`, `tile`, `near`,
  `n`, `area`, `decoy`, `root`, `form`, `k`, `kk`) through values recomputed with the labs' own logic (`squareFold.init` + `eqBuildOf`,
  `squareTiling.simplestShown` with the round's `avoid`). A COLLISION rule: no card, area, practice or free choice of module 7 is a number of a
  unit lesson's rounds (deep walk of `folds.js`, `tilings.js`, `squares.js`, `rulers.js`, round settings skipped) — it caught 14 (a `maxTrials`,
  hence the settings skip) and steered the free chips away from 90 (lesson 4's climax list).
- Training 4 renumbered: 20 / 45 / 80 dm² (2√5 + 3√5 + 4√5 = 9√5 ≈ 20,1 < 21 dm, (9√5)² = 405 < 441); training 3's decoy 2√3 → 2√9. Memo cards:
  S = 7 × 3 = 21, x² = 28 ⇔ ±2√7, √52 = 2√13. The open map speaks in LETTERS (`content/textbook.js › METHOD_LETTERS`: a rectangle of area S, length
  2ℓ, 2ℓ² = S, ℓ² = S/2). « DA » → « دج » in the data (also module 8's option E1 and brief, the only module-8 change); the « خطأ مطبعي في الكتاب »
  note and the « صورة الكتاب » caption are gone from what the student sees.
- 27 typed training steps carry `shape` (`gap` with a `subject` holding `\ldots` — « 180 = … × 5 », « √5 ≈ … », « 9√5 ≈ … dm » since dm is not a
  `STEP_UNITS` unit; `quantity` m; one `form` « 10√2 / 2 = [ ]√2 »); counts and points stay bare / word suffix.
- « أستعدّ »: `content/prep.js`, 10 statements, jidhr → muadala → kitaba in cycle (« راجع » jidhr-tarbii, muadalat-x-murabba,
  tawzif-khawass-judhur), levels 1·1·1·2·2·2·2·3·3·3, the first three true, truths recomputed in `prep.test.js`. The six old items stay in
  `textbook.js`.
- Module 7 (`Module07AlWadiya.jsx`), `LabRounds labId="m7-wadiya"` (`content/rounds.js`) on the SIBLING « a flower bed 80 m², length double the
  width → x² = 40 → √40 = 2√10 » (it keeps the 🏆's trap: 2 × 632 = 1264 ≠ 1265 cm): **r1 « حوض الأزهار »** `square-fold` card x² = 40 (scale 2,
  radius 7), prediction « كم حلًّا ؟ » (2), the nearest tick 13/2 refused (« لا تدريجة تعطي 40 بالضبط »), the exact marks ±√40 pinned, chain
  `build` → « x² = 40 ⇔ x = √40 أو x = −√40 » (decoy 13/2); practice x² = 14 at graduation 1; **r2 « بلاط الحوض »** `square-tiling` simplest n = 40,
  predictions smallest among [4, 2, 3] (→ 2) and « k = 3 ؟ » (no), chain `fullS` → the tile area 10 → the NUMERICAL build « √40 = 2 × √10 » → the
  rule; practice 28 (2√7); a free workshop (28, 40, 56, 60). Steps (both views): 1 the statement + sorting the data (one screen) · 2 which
  solution (needs r1; r1's two solutions beside the question) · 3 exact simplest form, then round at the end (needs r2; the r2 build beside it; the
  trap shown on the SIBLING: 632 / 1265 / 1264 سم) · 4 the notebook screen « اكتب في 3 أسطر » · 5 the model « 2ℓ² = 24 » (first pen step, the
  facts on the same screen) · 6 the method in the letter S (batch: ℓ² = S/2, not two widths, √(S/2) in a√b form, never double the rounded
  width) · 7 « ورقة رقيّة » (`content/peerSheet.js`: a PLAN, no number; the error = « the length is double the width, so double the ROUNDED
  width »). A pause line before the 🏆. The old brief (« الكتاب ص 28 »), the MethodSteps « كما في الكتاب » and the SourceTag are gone; the teacher
  page gets a two-level workspace (fold x² = 40, tiling 40). Module 8 untouched except « 12000 دج ».
- `_unit/missionStrings.test.js`: the synthesis' `CLIMAX` signature (√12, 2√3 / 4√3, √48, 346 / 693 / 692, 12000, the carpet word) — additive.

**Added to shared code:** none in the labs (the existing player chains `build` and `fullS` carry the synthesis phenomenon). Scene `rug-market`
registered in `MissionScene.jsx` (import + one entry).

**Saved-answer keys:** none new; round state from the stars log (`m7-wadiya`).

**Traps:** the lab's intro card (« هيا نبدأ ») must be closed before the first gesture; the coach bubble covers the − button and the verdict
line of `square-fold` on its « again » step until « فهمت » (existing lab behaviour); a deep walk of the lessons' round files counts their
SETTINGS (`maxTrials: 14`) as card numbers — skip `stars`, `goal`, `radius`, `scale`, `predict*`; a centimetre value glued to « cm » inside
Arabic text scrambles (« 632cm، ») — write « 632 سم »; `dm` is not a `STEP_UNITS` unit, so a dm quantity is a `gap` with « \ldots\ dm ».

**Review (`ecc:react-reviewer`, `ecc:code-reviewer`, `ecc:a11y-architect`):** no HIGH / CRITICAL. FIXED — holes in the text scan (`2\sqrt3`,
`2 \times \sqrt{3}`, `2\cdot\sqrt 3`, `2 × √3`, `\sqrt{ 12 }`, dot decimals 3.46 / 6.93, `24\,m^2`, `24 \text{m}^2`, « مساحتها 24 » — each with a
negative control); the role scan now catches 3,4641 / 6,928 by prefix; the WonPanel says « تمّ » once in its title instead of after every line;
the scene's seam coordinate written plainly. Also fixed after `audit:knowledge:gate` (5 E): step 2 requires `hulul-x2-a` (prior) — the brick
`tadhkir-x2-a` comes after it; step 3 requires `kitaba-a-jidhr-b` + `qima-muqarraba`; step 5 shows the `masahat-mustatil` brick BEFORE its
question (it also establishes it for module 8). REJECTED — `teachingScope` and the module-7 situation resource title carry the carpet word
(teacher-facing metadata / module 7 itself, as in unit 1); per-line source scan misses values built from constants (`R1_LINES` come from `BED`,
covered by the round tests); notebook button label kept as in unit 1 (shared pattern).

**Open (for the owner):** the 🏆's key computation is already SOLVED in two unit lessons: `amaliyat-judhur` (content/problems.js, the big tile
« √12 = 2√3 dm ») and `tawzif-khawass-judhur` (content/problems.js, « √12 = 2√3 » in the strip and A = √(50/3) × √2 × √12; exercises « √12 = 4√3
خطأ ») and lesson 2 rounds √12 ≈ 3,46 → 3,5 (`natiqa-ghayr-natiqa` exercises / Module07Itqan). The carpet situation itself (24 m², L = 2ℓ) is in
no lesson. Not my files: a cross-lesson decision. The catalogue duration (30 min) differs from the modules' total (validator warning, as for the
other syntheses). Module 7's ≈ 28 min estimate is not timed on a real student.

**Recipe lessons:** when the unit's labs already own the synthesis gesture (x² = a → keep the positive root; √n → k√b), module 7 needs NO lab
change: two rounds on ONE sibling number (here 40) chain the two labs into the 🏆's method; choose the sibling so that it keeps the 🏆's trap
(here the early rounding: 2 × round(√40) ≠ round(2√40)) and show that trap only in a step's explanation, never as a round.

**Verification:** vitest `src/lessons` + `src/pages` 764 files / 13 455 tests green (before the review fixes; the unit folder re-run after them:
30 files / 211 tests green); `check:lessons` every part exit 0 (activation-drift after the export; entry 241.4 KB gzip; the knowledge gate first
failed on 5 E of this lesson — fixed); `lab-rollout-status --lesson wadiya-idmajiya-judhur` ✅; `no-back-and-forth` LONE 0 · OVER 0 · PAIR 0 at
1366 / 1024 / 1920 (`sequentialUnlock` restored); walk of module 7 at 1024 / 1366 / 1920×1080: r1 ★★★, r2 ★★★, every step screen 0 overflow,
0 scroll, 0 wrapped formula; trainings walk at 1024: 20 of 27 shaped steps entered in their shape (gap / form), 0 issues (the walk script stops at
the written-solution reveal of trainings 1–3). Module 7's required path, automated ≈ 85 s (rounds ≈ 22 s); student estimate ≈ 28 min (rounds ≈ 9,
steps ≈ 19), not timed.

## Unit 3, synthesis — `wadiya-idmajiya-harfi` « أدمج تعلّماتي » (2026-11-12) — the FIFTH synthesis in the player

**Decisions (binding):** owner go-ahead 2026-11-12 for the syntheses of units 1–4 (provisional recipe), owner rules of the same day (« دج », no
thousands space, no book pointer). As in units 5, 1 and 2, module 7's situation IS the 🏆's (the basin 10 m, a band of width x, band area 44 m²):
module 7 ANALYSES it (data, « big square − basin », strategy, the model (10 + 2x)² − 10² = 44, the method in the letters a / S) and never solves it.
The book's « مساعدة » (x² + 10x − 11 = (x − 1)(x + 11)) is an answer-level line: shown in module 8 only. The book's تحدّ (the right triangle
x + 1, x + 2, x + 3) left module 7 (kept as source data in `content/textbook.js › CHALLENGE`).

**What was written**
- Config: `studentView: 'mission'`, `knowledgeMapOpen`, scene `fountain-plaza` (`mission/FountainPlazaScene.jsx` on `pitchSceneKit › PitchBackdrop`:
  a square fountain in a paved path of equal width, a girl in hijab and a boy, no number nor letter), an opening without a digit, `cta: 'أجرّب'`,
  `toolsOwned` = five keys (`nashr-qawsayn`, `tabsit` — nashr-tabsit; `murabba-majmu`, `hisab-mutamaan` — mutatabiqat-shahira; `tahlil-mutatabiqat`
  — tahlil-ibara) with `usedIn`, `checkpoints: []`, `climaxModule: 8`, `stationLabels`, `trainings`, `hideStars`, `durationMin: 76`
  (6 + 36 + 28 + 6), `sittings: 2`, `resumeInside`. Module 7 `estimatedMin` 14 → 28; one `manipulation` resource (`pitch-expansion-mamarr`).
- **Role scan FIRST** (`content/forbidden.js` + `content/mission.test.js`; first-fail log `synth/rolescan-harfi-first-fail.log`). It FAILED first on
  training 4 (the 5-12-13 triangle: 144 = 12², the 🏆's outer area), the memo cards (basin 10 + 2x, حوض / شريط), the open map (root = the whole
  situation AND the « مساعدة » (x − 1)(x + 11), −11), the description (« 44m² ») and module 7 (−11, x = 1). Also training 6 held x² + 10x = x(x + 10),
  the 🏆's reduced form. Two levels: `ANSWER_TEXT` (4x² + 40x, x² + 10x − 11 / = 11, (x − 1)(x + 11), x + 11, −11, 144, x(x + 10), (x + 5)² = 36,
  « x = 1 m », « متر واحد ») nowhere before the 🏆, module 7 included; `SITUATION_TEXT` (حوض, شريط, 44, 10 + 2x, x + 10 + x, 10², « ضلعه 10 »)
  nowhere before module 7. Rounds scanned by role through `logic/pitchExpansion › shownValues` (+ the new `ringShown` roles `pitch`, `ring`,
  `center`, `tile`); the partial tray sums (`sum`) and the `result`-chain decoy values (`decoy`) are not a 🏆 role and are skipped (documented).
  A COLLISION rule: no module-7 field equals or expands like a field of the unit lessons' rounds (deep walk of `pitches.js`, `squares.js`,
  `turf.js` for `expr`) — it caught x+1+x = (2x + 1)² (mutatabiqat-shahira) on the first run.
- Training 4 renumbered to the 8-15-17 triangle ((x + 9)² = x² + (x + 7)², x² − 4x − 32 = (x − 8)(x + 4), x = 8, 7650 دج); training 6 to +6 / +12 /
  −36 (x(x + 12), 9180); a decoy x² + 12x + 144 → x² + 24x. Memo cards and map in LETTERS (a fountain of side a, a path of width x, area S —
  `content/textbook.js › METHOD_LETTERS`, REMARKS rewritten in letters, « أشرطة » → « مستطيلات ») with fresh numbers (a = 13; (x − 2)(x + 15)).
- 33 typed training steps carry `shape` (`gap` « k = … », « 102 − 98 = … », `quantity` m / m² / دج); counts keep their word suffix.
- « أستعدّ »: `content/prep.js`, 10 statements, nashr → mutatabiqa → tahlil in cycle (« راجع » nashr-tabsit, mutatabiqat-shahira, tahlil-ibara),
  levels 1·1·1·2·2·2·2·3·3·3, the first three true, truths recomputed (identities at six points) in `prep.test.js`. The seven old items stay in
  `textbook.js`.
- Module 7 (`Module07AlWadiya.jsx`), `LabRounds labId="m7-wadiya"` (`content/rounds.js`) on the SIBLING « a fountain of side 7, a path of width x »
  (field `x+7+x` squared; an odd side is never 10 nor 12, no area 100 / 144, no ring 44): **r1 « ممرّ النافورة »** in AREAS by hand (x 1–4; carry
  the nine zones, check two x) → chain `ring`: the NUMERICAL build at the x the field shows « 169 − 49 = 4 × 21 + 4 × 9 » (x = 3; decoy 7, the side
  taken for the area); **r2 « الممرّ بالحرف x »** in TERMS (carry, merge to 4x² + 28x + 49, two x) → chain `ringTerms`: the build « (2x + 7)² − 7² =
  4x² + 28x » (decoys +49 the fountain kept, +14x the path on one side). Practice rounds on the fountain 3 (`ringEasy` / `ringTermsEasy`) that release;
  a free plaza (x+7+x, x+3+x, x+9+x). Steps (both views): 1 the statement + sorting the data (one screen) · 2 « how to measure the band » (needs r1;
  the r1 trace beside the question) · 3 the strategy (needs r2) · 4 the notebook screen « اكتب في 3 أسطر » · 5 the model « (10 + 2x)² − 10² = 44 »
  (first pen step, facts on the same screen) · 6 the method in the letters a / S (batch: expand and remove the basin, divide by 4, a product is zero
  when a factor is, keep the positive value) · 7 « ورقة مالك » (`content/peerSheet.js`: a PLAN, no number; the error = « the band goes round the
  basin, so its area is the basin's perimeter × the width » — the four corners forgotten). A pause line before the 🏆. Page: the sibling field, one level.
  Module 8 untouched (no « DA », no spaced thousands; its SourceTag is muted for students).
- `_unit/missionStrings.test.js`: the synthesis' `ANSWER_TEXT` joins `CLIMAX` (a synthesis has no `exercises.js`: the file count is 4 × n − 1).

**Added to shared code (additive):** `logic/pitchExpansion.js` — `ringOf`, `ringBuildParts`, `ringExprParts`, `ringShown` (called by
`shownValues`), `verify` also stores `lastX`; `algebra/PitchExpansion.jsx` — chains `ring` / `ringEasy` / `ringTerms` / `ringTermsEasy`,
`QUESTIONS.ringBuild` / `ringExpr`, the player field capped at 130 px for a ring field (its 3 × 3 Descartes table; at 1024 × 768 with the ⭐
counter the lab overflowed); strings `manipulation.pitchExpansion.cp.ring.*` / `cp.ringExpr.*`; test `algebra/pitchExpansionRingPlayer.test.jsx`.
No other lesson plays a ring field in the player; lessons 1–2 tests unchanged and green. Scene `fountain-plaza` registered in `MissionScene.jsx`.

**Saved-answer keys:** none new; round state from the stars log (`m7-wadiya`), `peer:m7-malik`.

**Traps:** the build question must read the x the field SHOWS (`lastX`), not the first verified x (the field showed x = 3, the question x = 2);
a Playwright `innerText` / `textContent` on an absent locator waits 30 s (give every probe a timeout); KaTeX annotations carry `\displaystyle`;
a page `lead` is plain text (`$7$` shows raw on the teacher page); « والكتابتان » trips the unit's /الكتاب(?!ة)/ book check; the word « شريط »
is both the 🏆's band and the lab's strip — the scan targets it only before module 7.

**Recipe lessons:** when the unit's lab already draws the 🏆's figure (here the « x+a+x » field the book page used), a sibling field with an ODD
centre keeps every 🏆 number out by parity; the synthesis phenomenon (band = big square − basin = 4 strips + 4 corners) needs one additive chain
per mode (areas → numerical build; terms → the expression build).

**Review (`ecc:code-reviewer`, `ecc:react-reviewer`, `ecc:a11y-architect`):** no CRITICAL / HIGH. FIXED — scan holes (`4 x^2 + 40x`, `(x + 10)x`,
`12^2` / `12²`, `10 + 2 \times x`, Arabic-Indic digits normalised before the scan; negative controls added); the build reads the x the field
shows, never NaN; the field-height cap gated on the ring chains; the `musaada-jadaa` brick moved AFTER the batch (it answered rows p3 / p4); the
r1 trace panel says « مثال » (its numbers are the x = 2 example, not the student's own x); the page lead interpolates `FOUNTAIN`; slot labels
name AREAS (« مساحة شريط واحد »); the `ringExpr` prompt states its left-hand side in words; slot names without bare Latin; the scene's corner
dashes darker. REJECTED — signs inside the build tiles (« +28x »; the same pattern as lesson 2's `coefBuild`); `sum` / `decoy` roles skipped
(partial tray sums are not a 🏆 role; documented in `forbidden.js`).

**Verification:** vitest `src/lessons` + `src/pages` 767 files / 13 489 tests green; `check:lessons` every part exit 0 (activation-drift after the
export; entry 241.4 KB gzip; one warning: modules total vs catalogue duration, as for the other syntheses); `lab-rollout-status --lesson
wadiya-idmajiya-harfi` ✅; `no-back-and-forth` LONE 0 · OVER 0 · PAIR 0 at 1366 / 1024 / 1920 (`sequentialUnlock` restored); walk of module 7 at
1024 / 1366 / 1920×1080: r1 ★★★, r2 won, 17 step screens, 0 overflow, 0 page scroll, 0 wrapped formula (the first 1024 walk found an overflow
of r2's 3 × 3 field once the ⭐ counter wraps the mission bar — fixed by the field cap); trainings walk at 1024: 17 of 33 shaped steps entered in
their shape (the script stops at the written-solution reveal of trainings 1–4), 0 issues. Module 7 automated: rounds ≈ 27 s, steps ≈ 22 s;
student estimate ≈ 28 min (rounds ≈ 9, steps ≈ 19), not timed.

**Open (for the owner):** lesson 2 `mutatabiqat-shahira` module 6 « المسبح البلدي » is the 🏆's situation structure and its key calculation (a
path of width x around a square pool of 20 m, S = (20 + 2x)² − 400 = 4x² + 80x, evaluated at x = 1) — not the 🏆's numbers nor its equation;
not my file. The mission bar wraps to two rows at 1024 once the ⭐ counter appears (shared UI, already reported by unit 1). Module 7's student
estimate (≈ 28 min) is not timed on a real student.

## Unit 4, synthesis — `wadiya-idmajiya-muadalat` « أدمج تعلّماتي » (2026-11-12) — the SIXTH synthesis in the player

**Decisions (binding):** owner go-ahead 2026-11-12 for the syntheses of units 1–4 (provisional recipe), owner rules of the same day (« دج », no
thousands space, no book pointer). As in units 5, 1, 2 and 3, module 7's situation IS the 🏆's (the municipal pool: 75 دج a session, or 560 دج a year
+ 5 دج a session): module 7 ANALYSES it (data, « ابتداءً من » ≠ the equality, strategy, the model 560 + 5x < 75x, the method in the letters a / b / f)
and never solves it (70x, x > 8, 9 sessions, 600 / 675 / 605 appear nowhere before the 🏆).

**What was written**
- Config: `studentView: 'mission'`, `knowledgeMapOpen`, scene `club-counter` (`mission/ClubCounterScene.jsx`: a club wall with two price boards with
  BLANK tags — tickets of one size / a subscription card and smaller tickets —, a girl in hijab and a boy, no number, no pool), an opening without a
  digit, `cta: 'أجرّب'`, `toolsOwned` = five keys (`hal-ax-b` — muadala-ula; `khassiya-jidaa-maadum` — jidaa-maadum; `qawaid-ittijah` —
  mutarajiha-ula; `tarrid-mutarajiha`, `tahaqquq-waqi` — tarrid-mushkila) with `usedIn`, `checkpoints: []`, `climaxModule: 8`, `stationLabels`,
  `trainings`, `hideStars`, `durationMin: 78` (6 + 38 + 28 + 6), `sittings: 2`, `resumeInside`. Module 7 `estimatedMin` 16 → 28; its two
  `manipulation` resources are the sibling tariffs (`growth-race-qaat-riyada`, `growth-race-nadi-rimaya`, same objective).
- **Role scan FIRST** (`content/forbidden.js` + `content/mission.test.js`; first-fail log `synth/rolescan-muadalat-first-fail.log`). It FAILED first on
  training 6 (B − A = 2x − 16 → **x > 8**, the 🏆's solved inequality, found as a typed answer), training 3 (« 1200 + 600 = 1800 »: 600), the memo
  cards (560 + 5x, 75x, 75 × 10), the open map and the description (the whole pool situation), and « الكتاب » (module 7 subtitles, training 1's
  « ثمن الكتاب » — a library story, reworded « ثمن كل كتاب »). Two levels: `ANSWER_TEXT` (70x, x > 8 / 8 < x, x ≥ 9, x = 8, « 9 حصص » and word forms,
  600 / 675 / 605, 560 ÷ 70) nowhere before the 🏆, module 7 included; `SITUATION_TEXT` (pool / swimming words, 560, 75x, 75 دج, 5x + 560) nowhere
  before module 7. Rounds scanned BY ROLE through `growthRacePlayer › shownValues` (new roles `rate`, `fixed`, `saving`, `tile`, `chip`): rate ≠ 75 / 5
  (and ≠ 90 / 20, the unit page's riding club), fixed ≠ 560 / 700, saving ≠ 70, solution ≠ 8 / 10, first ≠ 9 / 11, any role ≠ 560 / 600 / 675 / 605.
  A COLLISION rule: no lesson content file of the unit writes one of the round tariffs, and the unit page's challenge stays different.
- Training 6 renumbered TWICE (first (x + 3)² / x(x + 9) — its typed 9 is the 🏆's first session — then **(x + 2)² / x(x + 6)**: B − A = 2x − 4, x > 2,
  equal 16 at x = 2, 144 / 160 at x = 10). Memo cards with fresh numbers (240 + 6x, 35x, 35 × 10); map and REMARKS in LETTERS (`content/textbook.js ›
  METHOD_LETTERS`, a / b / f), the « equality is not the answer » example on 50x vs 200 + 10x (x > 5 → 6). Old `WARMUP` / `LAB` / book `figure` gone.
- 27 typed training steps carry `shape` (`gap` « x > … », « 400 = … x », « 4x = … »; `quantity` دج / m / m²); counts keep their word suffix.
- **Trainings 1–6 had NO ROUTE** since 2026-10-13 (2b1e7342 deleted `Module01…06`): recreated as GuidedProblem wrappers (`Module0NWadiyaN.jsx`).
- « أستعدّ »: `content/prep.js`, 10 statements, muadala → jidaa → mutarajiha → tarrid in cycle (« راجع » the four lessons), levels 1·1·1·2·2·2·2·3·3·3,
  the first three true, truths recomputed (`rule` / `identity` / `solution` / `roots` / `ineq`) in `prep.test.js`. Old `PREP_ITEMS` kept as source.
- Module 7 (`Module07AlWadiya.jsx`), `LabRounds labId="m7-wadiya"` (`content/rounds.js`): **r1 « قاعة الرياضة »** 60x vs 300 + 10x (equal at 6 = 360 دج,
  better from 7): carry « × x » onto the tickets, model check, chain `pool` → BUILD « 300 + 10x < 60x » (decoy 300x) → race (trials) → « where equal »
  (6) → « from which session is formula 2 better » (7; the trap 6 is a chip); **r2 « نادي الرماية »** 45x vs 150 + 15x (equal at 5 = 225, better from
  6): prediction « at the end of the ruler, which is dearer? », chain `poolSaving` → first better session (6) → the NUMERICAL build « 30 × 5 = 150 »
  (saving per session × sessions = subscription; decoy 45). Practice rounds that release: 30x vs 60 + 10x, 40x vs 100 + 15x; a free counter (the two
  tariffs + 50x vs 200 + 10x). Steps (both views): 1 statement (PoolScene) + sorting · 2 « what does ابتداءً من ask » (needs r1; r1 trace beside it) ·
  3 strategy (needs r2; r2 trace beside it) · 4 notebook « اكتب في 3 أسطر » · 5 the model 560 + 5x < 75x (first pen step, facts on the same screen) ·
  6 the method in letters (batch: f + bx < ax ⇔ f < (a − b)x; divide by a positive; f/(a − b) is the EQUALITY, not the answer; the next natural) ·
  7 « ورقة زكريا » (`content/peerSheet.js`, a PLAN, no number: « at the bound the costs are equal and the bound satisfies the inequality, so it is the
  answer » — a strict inequality excludes its bound). Pause line before the 🏆. Page: a two-level workspace on the SAME sibling tariffs.
- Module 8: only the owner rule — « دينار / دنانير » → « دج » (also in `SITUATION.text`, which its brief shows). Its SourceTag stays (muted for students).
- `_unit/signatures/wadiya-idmajiya-muadalat.js` re-exports `ANSWER_TEXT` (the unit's `missionStrings.test.js` now scans the synthesis' cards, map and
  data); README line added.

**Added to shared code (additive):** `logic/growthRacePlayer.js` — `poolOf`, `ineqSpec`, `firstSpec`, `savingSpec`, chains `pool` / `poolEasy` /
`poolSaving` / `poolSavingEasy`, `shownValues({ …, chains })` pushes the tariff roles only for a `mul` model; `equations/GrowthRace.jsx` — `PQ.ineqBuild`
/ `wherePool` / `firstPool` / `savingBuild`, `hideEq` also for `ineqBuild`, coach text `coach.pool.*` and offer labels `player.pool.*` for a `mul`
model, player columns 96 px high for a `mul` model (1024 × 768 fit), sr-only offer text in `<bdi dir="ltr">`; **a fix for every growth-race player**:
the ruler width is measured on the LIVE node (callback ref `setBox` + effect on `boxNode`) — opening a question / prediction remounts the stage and
the old ResizeObserver watched a detached node, leaving the ruler at 260 px (flaky at 1366: every tap landed on the last tick; probably the cause of
lesson 4's « stuck » walk). Strings `growthRace.player.pool.*`, `growthRace.coach.pool.*`; test `equations/growthRacePoolPlayer.test.jsx`. Lesson 4's
tests unchanged and green. Scene `club-counter` registered in `MissionScene.jsx`.

**Saved-answer keys:** none new; round state from the stars log (`m7-wadiya`), `peer:m7-zakaria`.

**Traps:** a synthesis whose `modules/Module01…06` files are missing has NO training route (nothing failed: check the files exist); the lab's intro
card hides `[data-growth-race]` — a walk must look for `[data-manipulation-mission-go]` before paging on; « text-slate-600 » matched `num('600')`
(the number regex now ignores a class-name dash); a ruler tap must read the ruler's own width (see the shared fix); the ⭐ counter wraps the mission
bar at 1024 and squeezes a tall lab to MIN_FIT (lower columns fixed it).

**Recipe lessons:** when the 🏆 is a « which tariff is better from n sessions » problem, the synthesis phenomenon is two-sided: the EQUALITY is
where the costs meet but not the answer (« ابتداءً من » = the next natural), and « saving per session × sessions = subscription » explains the
meeting — one additive chain per side; sibling tariffs must be scanned BY ROLE (rate, fixed, saving, meet, first), not by number, since small
numbers (5, 8, 9, 75) appear everywhere as values.

**Review (`ecc:code-reviewer`, `ecc:react-reviewer`, `ecc:a11y-architect`):** no CRITICAL / HIGH. FIXED — firstPool's answer always first (rotation now
`n % 3`); wherePool duplicate chips (distinct set); scan holes (« تسعة / ثمانية حصص », « الحصة التاسعة », « ستمائة », `9 \text{ حصص}`, `\geqslant`,
`\gt`, `\lt`, Persian digits, « خمسة وسبعون » — negative controls added); a test that every tile / chip set of every tariff is distinct; « < » in a
hint said in words; sr-only offer text isolated. REJECTED — a runtime guard for a non-natural meeting (round content is fixed and tested); module
step flags in local state (the pilot's pattern; LabRounds re-announces won rounds); the selected-offer ✓ (shared lab chip style, lesson 4 too).

**Verification:** vitest `src/lessons` + `src/pages` 770 files / 13 529 tests green (the registry test caught the six restored routes: its known-debt entry removed); `check:lessons` exit 0 (entry 241.4 KB gzip; the usual synthesis duration
warning); `lab-rollout-status --lesson wadiya-idmajiya-muadalat` ✅; `no-back-and-forth` LONE 0 · OVER 0 · PAIR 0 at 1366 / 1024 / 1920 (`sequentialUnlock`
restored); walk of module 7 at 1024 / 1366 / 1920×1080: r1 ★★★, r2 won, 19 step screens, 0 overflow, 0 page scroll, 0 wrapped formula; trainings walk
at 1024: 18 of 32 typed steps entered in their shape, 0 issues (the script stops at the written-solution reveals of trainings 1–4). Module 7 automated:
rounds ≈ 23 s, steps ≈ 25 s; student estimate ≈ 28 min (rounds ≈ 10, steps ≈ 18), not timed.

**Open (for the owner):** lesson 3 `mutarajiha-ula` « مسألة 2 » (`content/problems.js`, masala-2: a fitness club, 250 دج a session or a 1200 دج card +
100 دج a session → 1200 + 100x < 250x → **x > 8 → from 9 sessions**, equality at 8 not a solution) is the 🏆's situation AND its key result; lesson 1
`muadala-ula` « مسألة 3 » (an internet club, 80 vs 500 + 55, equality at 20) has the same structure. Not my files: a cross-lesson decision. The mission
bar wraps at 1024 once the ⭐ counter appears (shared UI). Module 7's ≈ 28 min is not timed on a real student.

## The synthesis recipe (PROVISIONAL until a real student has been timed on the pilot: ≤ 32 min for module 7, module 8 finished)

For the ~11 other unit syntheses, once the unit's lessons are converted. The pilot is `wadiya-idmajiya-talis` (above); the engine fields are in
`LESSON_DEVELOPMENT_GUIDE.md` › « Synthesis in the mission player ». Do not copy before the owner has seen one student play the pilot.

1. **Role scan FIRST** (`content/forbidden.js` + `content/mission.test.js`): the 🏆's signature (module 8, never retouched) BY ROLE and module 7's
   own answers, over the trainings, the memo cards (bodies too), the knowledge map, the opening, « أستعدّ », the peer sheet, every lab round and
   practice round (`shownValues`). Make it fail on the current content, then fix the content — renumber a training, give the cards fresh numbers,
   write cards and map in letters. A shared GIVEN may be a named exemption (never a shared pair or answer).
2. **Config:** `studentView: 'mission'`, `knowledgeMapOpen`, `mission.toolsOwned` with the unit's keys (ids of the unit's lessons' `knowledge.jsx`)
   and their `usedIn`, `checkpoints: []`, `climaxModule` = the last module, `stationLabels: { 7: 'وضعية الوحدة', 8: 'التحدّي 🏆' }` (the same in
   every unit), `trainings: [1..6]`, `hideStars: true` (**no training ★**: a step is one try), `durationMin` = the honest sum, `sittings: 2`,
   `resumeInside: true`, `opening.cta: 'أجرّب'`, an opening without a digit, a thin scene on the unit's scene kit.
3. **« أستعدّ »:** a 10-statement ladder on the unit's lessons (skills in cycle, each with its lesson to revise); the old items stay as source.
4. **Typed steps in their own shape** (`shape` / `unit` / `subject` / `factor`; « دج » not « DA »); sorter data in plain text.
5. **Module 7 (the unit situation) in the player:** every synthesis-only lab gets the player treatment first; ONE `LabRounds` behind `PlayerSwitch`
   (the teacher page keeps its workspace); **the lab takes at most 11 required minutes, in two rounds, on sibling numbers that pass the role scan**,
   ends on the phenomenon with a NUMERICAL build (never the situation's own numbers, never its letters, no answer); practice rounds on pairs not
   yet seen, never starting on their answer, and they RELEASE the round (`easier.releases`); the steps that need the lab wait for it
   (`needsRound`); the letter / model equality is built in the FIRST pen step; a notebook screen « اكتب في 3 أسطر » before the pen steps; the
   peer sheet LAST, carrying a JUSTIFICATION error (a plan, no number); `BackLink`s out of the player removed; a pause line before the 🏆.
6. **The student never sees the old view**; module 8 untouched; « التمارين » after the 🏆; the unit page entry once the synthesis is done.
7. **Verify** as for a lesson (prompt §7), plus: time the required path of module 7 (target ≈ 29 min for a student) and every typed step
   at the three sizes.

