> **ARCHIVE — the root `CLAUDE.md` as it was before it was cut on 2026-11-17 (plan `LESSON_V2_MASTER_PLAN.md`, Phase 0).**
> It is kept whole because it is the dated history of every feature, with the owner's words. **It is not the
> instruction file any more**: where it and the current root `CLAUDE.md` or a contract disagree, they win — in
> particular everything it calls « TRIAL » or « NOT validated » about the pilot lesson became binding on 2026-11-17
> (decision D6), and the lists it names (`PHONE_LESSONS`, `BOARD_LESSONS`, `SCRIPTS`, `gameWorld` in a config…)
> were replaced by the lesson's pack (`docs/architecture/LESSON_V2.md`).

# smarter-academy-dz

Arabic-first, RTL mathematics platform for the Algerian curriculum (المتوسط,
starting with 4AM). Lesson content lives in `apps/web/src/lessons/moyen/`;
shared engine in `apps/web/src/lessons/common/`; pure logic in `packages/core`;
API in `apps/api` (Laravel). The lesson content in the repository is fourteen 4AM
textbook units. Since 2026-10-05 unit 14 « الهندسة في الفضاء » (4 lessons + a synthesis, `lessons/moyen/4am/handasa/handasa-fada/`) is the
sixth unit under « ميدان الهندسة » and the first IN SPACE (exact spheres, sections and k / k² / k³ in `packages/core/arithmetic/space.js`;
static 3D figures `SpaceFigure` with hidden lines dashed; live three.js labs on ONE kit `lessons/common/manipulations/space/stage3d/`;
its topic `handasa_fada` was added to the programme file and declared; brief and lock in `docs/sources/4am/unit14/`). Since 2026-10-04 unit 13 « الدوران - الزوايا - المضلّعات المنتظمة » (4 lessons + a synthesis,
`lessons/moyen/4am/handasa/dawaran-mudalaat/`) is the fifth unit under « ميدان الهندسة » (exact rotations, inscribed angles and regular
polygons in `packages/core/arithmetic/rotation.js`, labs in `lessons/common/manipulations/rotation/`, GeoFigure centred `arcs` with `arrow`,
`angles[].arrow`, `circles[].radius`; brief and lock in `docs/sources/4am/unit13/`). Since 2026-10-04 units 11 « الأشعة والانسحاب » and 12 « الأشعة في معلم » (4 lessons + a synthesis each,
`lessons/moyen/4am/handasa/ashia-insihab/` and `…/ashia-maalam/`) are the third and fourth units under « ميدان الهندسة » (exact vectors
in `packages/core/arithmetic/vectors.js`, labs in `lessons/common/manipulations/vectors/`, GeoFigure `vectors`/`grid`/`axes`/`arcs`/`circles`;
one brief and one lock for both in `docs/sources/4am/unit11/`; textbook figures are ANALYSED then reproduced or REDESIGNED, guide §5).
Also since 2026-10-04 unit 10 « حساب المثلثات في المثلث القائم » (4 lessons + its synthesis,
`lessons/moyen/4am/handasa/hisab-muthallathat/`) is the second unit under « ميدان الهندسة » (exact trigonometry with
surds in `packages/core/arithmetic/trigonometry.js`; authors' brief and lock in `docs/sources/4am/unit10/`). Since 2026-10-02 unit 9 « خاصية طالس » (3 lessons + its synthesis,
`lessons/moyen/4am/handasa/khassiyat-talis/`) is the first unit under the programme's « ميدان الهندسة »
(no `placement`; geometry figures are `GeoFigure` data, Thales maths in `packages/core/arithmetic/thales.js`). Since 2026-10-02 unit 6 « الدالة الخطية والتناسبية » (5 lessons + its synthesis,
`lessons/moyen/4am/tanasubiya_duwal/tanasubiya-dala-khattiya/`) and unit 7 « الدالة التآلفية » (5 lessons + its synthesis,
`…/tanasubiya_duwal/dala-taalufiya/`, the same day) and unit 8 « الإحصاء » (4 lessons + its synthesis,
`…/tanasubiya_duwal/ihsa/`, the same day; programme domain « ميدان تنظيم المعطيات ») sit under « ميدان التناسبية والدوال »,
a DISPLAY ميدان decided by the owner (`units_4am_2026_2027.json › ownerChapters`; the programme file is
untouched and each unit declares its programme domain in `placement`). The other five are units of
ميدان أنساب الأعداد والحساب: « الأعداد الطبيعيّة والأعداد
النّاطقة » (9 lessons), since 2026-09-30 « الحساب على الجذور » (5 lessons + its synthesis,
`…/hisab-judhur/`) and, since 2026-10-01, « الحساب الحرفي » (3 lessons + its synthesis,
`…/hisab-harfi/`, placed under this ميدان by the owner) and, the same day, « معادلات ومتراجحات
من الدرجة الأولى بمجهول واحد » (4 lessons + its synthesis, `…/muadalat-mutarajihat/`, placed likewise) and
« جمل معادلتين من الدرجة الأولى بمجهولين » (3 lessons + its synthesis, `…/jumal-muadalatayn/`, placed likewise).
Since 2026-10-06 the practice space of every
lesson is being converted, unit by unit, to the BEM « exam sheet » (prototype `bahth-pgcd`; corpus index
`docs/sources/4am/bem-practice/annals-index.md`; a lesson switches when listed in `content/practice/exam-style.json`;
contract `docs/architecture/EXERCISE_CONTRACT.md` § « Présentation examen (BEM) »). The French-era
lessons (`lessons/college/`, `lessons/lycee/`) and the French reference
catalogue were **deleted on 2026-09-25** — older docs that cite them describe
code that no longer exists.

Unit 1 is the **pilot unit**: rules are tried there, then extended. Three unit-1 rules — values woven into story contexts
(2026-10-10), the « discover, don't be told » pass on module text (2026-10-09) and the synthesis with six training situations
(2026-10-13) — were **extended to units 2–14 on 2026-10-13**; every synthesis lesson now has modules 1–6 « وضعيات تدريبية » and
every `ContentModule` has `objectives` for the Classroom Mode entry slide. Report: `docs/reports/UNIT1_REFERENCE_CHANGES_2026-10-13.md`.

Since 2026-11-03 the pilot lesson `qasim-adad-tabii` tries the **student « focus » view** (owner: Gen Alpha reads little):
- `studentView: 'focus'` in its config makes the student see only what they need now: one step on screen, the lesson home reduced
  to title + progress + « واصل », and details behind « المزيد » (`MoreToggle`, `lessons/common/components/StudentFocus.jsx`).
- The teacher and Classroom Mode are unchanged.
- **Reduce what shows at once, never delete** (owner, 2026-11-04): whatever leaves the student's screen stays reachable.
- If the owner validates it, it is rolled out lesson by lesson. Rules and checklist: guide §4sexies; numbers:
  `docs/reports/STUDENT_FOCUS_VIEW_2026-11-03.md`.
- Since 2026-11-04 the same lesson tries the **mission mode** (`studentView: 'mission'`, implies focus): the lesson is a journey
  toward its « مسألة الدرس » (opening scene, tools = knowledge items, mission bar, map with the real lock, one checkpoint between
  modules). It is built on the student's normal pages, NEVER on Classroom Mode. Stage 2 (same day): the lesson plays in a
  full-window player with **no scrolling anywhere** (owner rule): one unit per screen, tall units paged (`ClassroomPaged` via
  `PagingContext`, not Classroom Mode), last-resort fit by zoom; no « المزيد » in the player (every block has its own screen). Since 2026-11-07 its first view lists the lessons to revise first (« راجع قبل أن تنطلق », one-click return), and « أستعدّ » opens on a 5 s message then goes question to question by itself. « أستعدّ » v2 (same day): 10 platform questions from very easy to harder, a ✓ / « سنعود إليه » signal per question (never the answer), « غير متأكّد », 1 s undo, a one-screen review with ONE priority lesson to revise (guide §4septies). Lab questions v2 (same day, council): a column beside the pitch (no shade), predict → observe by tapping → build the equality, the trials table inside the lab instead of « رتّب أفكارك », stars for predictions. Saving (same day, council): the student's in-lesson answers are restored, synced and private (`student_lesson_answers`, `GET/PUT /lessons/{code}/answers`, student only, never evidence), and the rule written in « أتوقّع القاعدة » becomes a « قاعدتي » note in « كرّاسي » that the teacher may read. Competitor review (2026-11-08, council): a struggling student gets a smaller practice round in the lab (« لا بأس — جرّب أصغر », `easier` on a round) and module 2 ends with « ورقة زميل » (`kit/PeerSheet.jsx`: find and fix an invented classmate's error); the knowledge map is totally open from the start (`knowledgeMapOpen: true`; coins and « أتوقّع القاعدة » still read `learnedItems`) and reachable from the mission bar (« 🧠 بطاقتي » opens it full-screen, « 📓 كرّاسي »). « إختبار أولي » plays like « أستعدّ » in the player (5 s notice, one question per screen, automatic result, optional timer). Since 2026-11-08 the knowledge map is ONLY the interactive mind map in every lesson: the old stratified presentation was deleted (`KNOWLEDGE_MAP.md` Part B). **The owner VALIDATED the pilot on 2026-11-08: every change on it is now BINDING for other and new lessons** and is rolled out lesson by lesson (`docs/reports/MISSION_ROLLOUT_PROGRESS.md`; plan `PILOT_PROTOTYPE_ROLLOUT_PLAN_2026-11-08.md`). Converted so far: `qawasim-adad-tabii` (2026-11-08, lab `factor-pairs`; scene registry `mission.scene`, guide § « Rollout recipe ») `khawass-qawasim` (2026-11-08, lab `divisor-properties`) `qasim-mushtarak-akbar` (2026-11-08, lab `common-divisors`) `tayin-pgcd` (2026-11-08, same lab, content only) `bahth-pgcd` (2026-11-09, labs `pgcd-differences` and `euclidean-algorithm`) `ikhtizal-kasr` (2026-11-09, lab `fraction-reduction`) and `awwaliyan-fima-baynahuma` (2026-11-09, lab `coprime-explorer`, scene `math-club`), and its synthesis `wadiya-idmajiya-aadad` (2026-11-12); unit 2 « الحساب على الجذور » (prompt `docs/reports/UNIT2_HISAB_JUDHUR_MISSION_PROMPT.md`): `jidhr-tarbii` (2026-11-09, lab `square-root-side` in both modes, scene `garden-bed`), `natiqa-ghayr-natiqa` (2026-11-09, the same lab in graduation mode, scene `carpet-loom`) `muadalat-x-murabba` (2026-11-10, lab `square-fold`, scene `fold-strip`), `amaliyat-judhur` (2026-11-10, lab `square-tiling` in both modes, scene `courtyard-slabs`) and `tawzif-khawass-judhur` (2026-11-10, the same lab in simplest mode, scene `courtyard-big`; its climax numbers forbidden by ROLE, `content/forbidden.js`); unit 9 « خاصية طالس » (prompt `docs/reports/UNIT9_KHASSIYAT_TALIS_MISSION_PROMPT.md`, one council for the unit's three labs on 2026-11-10, work order L2 → L3 → L1): `aksiya-talis` (2026-11-10, lab `parallel-level` with « ضع الميزان », scene `paint-wall` on the unit's shared `mission/thalesSceneKit.jsx`) and `inshaat-talis` (2026-11-10, lab `segment-divider` with `sameUnitOnly` and at most 3 marks per line, scene `tifo-banner`) and `talis-hisab-atwal` (2026-11-10, a NEW player-only lab `shadow-meet` beside the untouched page lab `shadow-world`, scene `night-cinema`); unit 9's synthesis `wadiya-idmajiya-talis` is converted too (owner rule 2026-11-10: every unit's synthesis is built, after its lessons; unit 9 is the pilot): module 7 « وضعية الوحدة » plays its labs as rounds (a new player version `geometry/ConeCylinderPlayer.jsx`, `shadow-meet` with `hideHeight`), the keys are owned from the start (`mission.toolsOwned`), scene `shadow-square`; the synthesis recipe is PROVISIONAL until one real student is timed (`MISSION_ROLLOUT_PROGRESS.md` « The synthesis recipe »); unit 3 « الحساب الحرفي » (prompt `docs/reports/UNIT3_HISAB_HARFI_MISSION_PROMPT.md`, one council for the unit's three lessons on 2026-11-11): `nashr-tabsit` (2026-11-11, lab `pitch-expansion` with the zones' AREAS as numbers and a ruler that skips every x where two zones of different kinds show the same area — `zoneText`, `areaCollisions` — scene `neighbourhood-pitch` on the unit's shared `mission/pitchSceneKit.jsx`), `mutatabiqat-shahira` (2026-11-11, the same lab on square fields: sides relabelled a / b, the « 0 » chip of the sum × difference, scene `stands-pitch`) and `tahlil-ibara` (2026-11-11, lab `turf-factoring` in rows and square modes, scene `turf-rolls`); its synthesis `wadiya-idmajiya-harfi` is converted (2026-11-12, scene `fountain-plaza`, lab `pitch-expansion` with the additive ring chains); unit 4 « معادلات ومتراجحات » (prompt `docs/reports/UNIT4_MUADALAT_MUTARAJIHAT_MISSION_PROMPT.md`, one council for the unit's four labs on 2026-11-11): `muadala-ula` (lab `equation-balance`, scene `locker-balance`), `jidaa-maadum` (lab `vanishing-pitch` with the covered pitch, scene `pitch-planner`), `mutarajiha-ula` (lab `solution-ray`, scene `phone-credit`) and `tarrid-mushkila` (lab `growth-race`, scene `family-heights`); its synthesis `wadiya-idmajiya-muadalat` is converted (2026-11-12, scene `club-counter`, lab `growth-race` with the additive tariff chains). Unit 5 « جمل معادلتين » (prompt `docs/reports/UNIT5_JUMAL_MUADALATAYN_MISSION_PROMPT.md`, one council for the unit's three labs on 2026-11-11; each lab a `<Lab>Player.jsx` behind a ≤ 10-line dispatcher, collision test `_unit/unitCollisions.test.js`): `mafhum-jumla` (2026-11-12, lab `pair-scoreboard` with the gauges masked while dragging and module 2's special-case rounds `lab-pair-m2`, scene `civil-registry`), `hall-jabri` (lab `elimination-cards`, scene `kiosk-cards`) and `mushkilat-jumla` (lab `story-modeller`, scene `museum-desk`); its synthesis `wadiya-idmajiya-jumal` is converted too, with the provisional recipe (owner, 2026-11-12; module 7 analyses the 🏆’s own situation, scene `party-table`; units 1–4's syntheses: owner go-ahead the same day, converted one by one — unit 1's `wadiya-idmajiya-aadad` first, 2026-11-12, scene `apron-store`, Euclid's additive `share` chain; unit 2's `wadiya-idmajiya-judhur`, scene `rug-market`). Since 2026-11-09 a unit whose lessons are all converted gives its STUDENTS a one-screen unit page (`pages/unit/UnitMissionView.jsx`, content in `pages/unit/unitMissions.js`, no-scroll check `e2e/unit-mission-view.mjs`) — owner rule: each time a unit's lessons are converted, write its entry there; unit 1 is the first, unit 2 « الحساب على الجذور » the second (2026-11-10), unit 9 « خاصية طالس » the third (2026-11-10), unit 3 « الحساب الحرفي » the fourth (2026-11-11), unit 4 « المعادلات والمتراجحات » the fifth (2026-11-11), unit 5 « جمل معادلتين » the sixth (2026-11-12). In the player a lab is played as ROUNDS with 1–3 ★
  (`manipulations/rounds/LabRounds.jsx`) instead of مبتدئ / متقدم, and this lesson uses only the football lab.
  Guide §4septies, plan `docs/reports/MISSION_PLAYER_PLAN_2026-11-04.md`; the rollout to all lessons (after validation):
  `docs/reports/PILOT_PROTOTYPE_ROLLOUT_PLAN_2026-11-08.md`.
- **No back-and-forth** (owner, 2026-11-11, BINDING for every lesson, existing and new): in the player, what a question asks the student to
  look at — the figure, the table, the statement's numbers, the student's earlier result — is on the question's screen; the student never goes
  back a screen and forward again. A figure and the question after it share one screen automatically (`ClassroomPaged › pairFigures`,
  `data-paging-pair`); the other cases are written into the lesson (guide §4septies « NO BACK-AND-FORTH »). Check: `e2e/no-back-and-forth.mjs`
  + a walk that answers; the lessons converted before the rule: `docs/reports/NO_BACK_AND_FORTH_PROMPT.md`.

Since 2026-11-15 the same lesson `qasim-adad-tabii` carries a **TRIAL game world** (owner's free experiment, NOT validated, NOT a rollout rule):
its student enters « أرخبيل القواسم », a three.js world where a bridge of light holds only when planks of one length fill the gap exactly
(`world: { id: 'divisor-isles' }` in its pack `lesson.pack.js`; code `lessons/common/gameworld/`; the mission player stays at `?view=classic`).
The same day it got, reachable from the title screen for revision without replaying the story: the full-page **« خريطة المعارف »**
(the lesson's own 13-node mind map and memo sheets, imported, never retyped; « تدرّب » opens ON the card and alternates a game
format with the real exam format), the **practice space** (16 levels: runs of the gate dash — mental arithmetic only, numbers
inside the multiplication tables — generated questions, a mistake stops on a guidance card) and the real-world game **« تعاونية الواحة »** (a packing depot: the
world packs what the student decides and shows what is left). The exam cases are played in three worlds, each story carrying a value (the depot; fair sharing between friends; a tiler who
cuts no tile and wastes none), and a calculation shortcut « حيلة » follows a right answer when a clean one exists. Since the same day its exam-format first tries count toward الكفاءات (the server re-computes each verdict:
`POST /lessons/{code}/game-evidence`), and its exercise bank tries the **exam coach** « مدرّب الامتحان » (pilot: the lessons whose
pack has `coach`: an exam hall, a paper notebook for mistakes, and two modes — guide without the answer, or the
solution explained step by step; `EXERCISE_CONTRACT.md`). Since 2026-11-16 the title screen also opens a PROTOTYPE exam sitting « الامتحان الأبيض » (reading time, a silent sitting with no
verdict, then the copy handed back with red marks; `GAME_WORLD.md` §2quater). Since the same day the practice hub has TWO spaces — « فضاء اللعب » then
« فضاء الامتحان », a ladder of five generated exam levels (80 % to climb, the next sheet adapted to what was missed; the game is felt
BETWEEN two levels, never inside a sitting) — and the title screen opens « تقدّمي » (the lesson's road, an honest exam readiness, ONE next
step; `GAME_WORLD.md` §2quinquies). Written work is done in **« وضع الورقة »** (paper mode: the music
stops, the answer boxes wait for « كتبتُ على ورقتي », a model sheet poses the division step by step). Since 2026-11-18 a rule is no
longer TOLD: the student forges it in **« مصهر القاعدة »** (frame `kit/forge.js`, screen `kit/RuleForge.jsx`; a lesson's forges are data,
`world/forges.js`) — he predicts cases he has not seen, writes his rule with tiles, and the island's mirror tests it on HIS OWN evidence,
then attacks it with a new case; a rule that survives becomes his key and only then gets its name. The verdict is always a bridge that holds
or crumbles, never « wrong »; the robot helps without giving the rule. Since 2026-11-17 of the rollout ALL FOUR rules of the pilot are forged
(`GAME_WORLD.md` §2sexies « The four forges », binding for the next lessons: exactly one rule holds, every other is refuted in front of him). Contract: `docs/architecture/GAME_WORLD.md`.

Since 2026-11-16 the **navigation of both workspaces is FOUR DOORS** (owner; plan and state `docs/reports/NAVIGATION_REBUILD_PLAN.md` §0):
- student « اليوم · دروسي · أتدرّب · أنا », teacher « اليوم · دروسي · أقسامي · أدواتي » + the account menu under his picture. The doors are
  DATA (`data/studentNavigation.js`, `data/teacherNavigation.js`); ONE menu renders them (`components/common/WorkspaceNav.jsx`); the pages
  behind a door show as one line (`DoorTabs`). A new page is added to a door's `pages`, never to a menu component.
- Three widths, one skeleton: under 768 px a top bar and a bottom bar; from 768 px (tablet upright included) an 80 px rail that does not fold.
- **Colours are the `nav-*` tokens of `tailwind.config.js`** (no raw colour class, no gradient, in the menus, the teacher's pages, the lesson /
  unit cards and the unit page): `nav-accent` (the brand blue) for every button, lit door and link — **owner: blue, never black, for shapes**;
  `nav-ink` for text only; `nav-now` amber = the next step, `nav-done` green = finished, `nav-alert` = needs you.
  Since the same day this blue is general in `pages/`, `components/` and `features/` (no indigo, teal or dark-slate button); the lesson
  engine and its labs, the game worlds, the class board, the marketing pages and the admin space keep their own colours.
- **A card is four lines at most** (owner: « small content »): place, name, ONE status line, a thin progress line — `LessonCard`, `LessonRow`,
  `UnitGroup` on `components/student/lessonTileParts.jsx`. The unit page is a short header and one line per lesson, the rest folded.
- The teacher's home is « اليوم »: each class with the lessons of the week from the school calendar (`features/teacher/today/weekLessons.js`).
- The class page `/enseignant/classes/:id` has FIVE sections (نظرة عامة · التلاميذ · التعلّم · الأنشطة · الإعدادات; `SECTIONS` in
  `pages/teacher/ClassGroupDetail.jsx`, the address keeps `?tab=`); a new page of a class joins a section, never the tab bar. Its overview is
  one screen and never repeats the map of الكفاءات (plan §5quater).
  Settings and long lists of a teacher page go in a `Fold` (`pages/teacher/teacherUi.jsx`), never in a second always-open column.
- Not built yet: the year map, the lesson bar with previous / next, the student's home in the tokens.

Since 2026-11-09 **« بوصلتي » (the year compass)** is being built (owner plan approved; contract `docs/architecture/YEAR_COMPASS.md`):
a start check « جولة الانطلاق » scoped by the date and the class position (2 steps back in the net), a report « خريطة نقاطي »
(positive bands, never evidence) and a plan « خطّتي ». P0 is done: ONE school calendar for the four grades and each grade's
progression (week → catalogue lesson codes) in `packages/core/curriculum/dz/calendar/` (`schoolCalendar.js`, by path), checked by
`check:year-calendar`. **The calendar is renewed EVERY school year** (owner): the check fails when the current year has none.
P1 is done (4AM): `/espace/bawsala` + the home card; questions from the practice bank through the server-only
`content/compass/index.generated.json` (`check:compass-index`), served WITHOUT key and graded by the server (`Domain/Compass`),
bands recomputed server-side (`ItemBand` = `engine.js`, one fixture); never `learning_evidence`. Since the same day the student home `/espace`
is LED by بوصلتي when it is open for the grade (`YEAR_COMPASS.md` §6bis: one card before the first check, then « مهمّة اليوم », the week,
the bands, the year strip; the rest folded under « المزيد »). Every statement screen now renders `formulas` and `table` (`ExerciseStatement`).
**Two owner standards since 2026-11-09, binding for EVERY question:** a typed answer is entered in its own shape
(« الإجابة تُكتب في شكلها »: `templateFor()` + `TemplateInput`, « A = ax + [b] », a real fraction bar, printed units — applied to
the « بوصلتي » check first, rollout planned), and **a formula never breaks across two lines** (`.katex{white-space:nowrap}`;
widen the card instead). Contract: `EXERCISE_CONTRACT.md` § « قوالب الإجابة » and § « A formula never breaks ».

Since 2026-11-16 every lesson has a door to **« مختبري », the lab of the lesson** (NOT validated; `lessons/common/lessonlab/`, contract
`docs/architecture/LESSON_LAB.md`): ONE lab for the cycle that shows the instruments of the lesson and, in « خزانتي », those of every lesson
BEFORE it of every grade — never of a later lesson. Two shared numbers follow the student from one instrument to the next; each instrument
has « جرّب » quests; nothing scrolls; no learning evidence; its own sounds (`sound.js`: a number has a note, one chime for « nothing is left », never a buzzer). Eight instruments exist (division and divisors: 4AM unit 1 + two of 1AM).
A new instrument = an entry in `registry.js › TOOLS` tagged with the lesson that introduces it; after adding or re-ordering a lesson run
`npm run generate:lab-order`. It is distinct from the Math Lab `/espace/atelier` (`MATH_LAB.md`), which is untouched.

Since 2026-11-18 the TEACHER has **« حصّة القسم », the class session** (steps 1–2 of 4, NOT validated; pilot lesson only; contract
`docs/architecture/CLASS_SESSION.md`): on the lesson page a teacher's card (« جرّب الدرس كتلميذ » = the student's world in preview, nothing
recorded) and `/enseignant/hissa/:lessonId` — the seating map of the class (the turn follows the seats; one team per row or the teacher's own
teams, any number, named after scholars), the lesson's test (a DEFAULT kept in `content/class-tests/`, every answer re-computed by a test;
the teacher's own copy and his own questions, under his responsibility; reset), the test on the board with ONE mouse (the student's name
on top; by place, « أختار أنا » or « اختر لي »; a sentence with his name for a right answer AND for a miss), the result and a podium of
teams. **A class test never changes a student's progress** (never `learning_evidence`); the screens are light and calm, an adult's.
The same day the hour became a script of four moments (start test → « مراجعة القواعد » → « الدرس على السبّورة » → end test; `CLASS_SESSION.md`
§5bis–§5ter, NOT validated): the rules the lesson will use come back one per screen and **the teacher picks the reader himself, or reads**
(rule cards = `rules` of the launch-kit families); the lesson on the board is DATA (the lesson's own `board/script.js`, named in its pack) —
the class experiments with bridges, writes ITS rule, the board attacks it, and only a rule that survived gets its name (the game's own
tablets); board tools on every board screen, in ONE dock: class window, pen, red pointer, curtain, timer, « مختبري ». It sends nothing.
**A lesson that has its board (`board` in its pack — `boardLessons.js › BOARD_LESSONS` is generated from the packs; today the pilot only — owner: « no need for the older
version ») has no « وضع القسم » any more, and its TEACHER's lesson page is the title and his card « للأستاذ »** (`TeacherLessonPanel`: in class ·
prepare · my tools · follow · what to know; calm palette — white, dark ink, no gradient). The card opens: « متابعة القسم » (each student on the
lesson: states per الكفاءة, exercises right / first try; order = who needs the teacher first, never a ranking; `GET …/lesson-tracking/{lesson}`),
« ملفّ الدرس » (ONE work file per teacher and lesson = the Math Lab's whiteboard on its OWN full-screen page `/enseignant/milaff/:lessonId`, exit → the lesson; `teacher_lesson_files` links the lesson to the document), the teacher's exercise bank (read with the key, show
on the class's board, print a sheet on white paper — `TeacherBankGate`) and « بطاقة المعارف » on the board (a quick revision with the class,
with the links to the earlier lessons). « متابعة القسم » is its own screen (not part of « مسار الحصّة ») and opens a window on the exact exercise a student did, try by try;
« بطاقة المعارف » is a display (no class, no student named). The five tool pages of a lesson (memo, lesson file, bank, tracking `/enseignant/mutabaa/:id`, knowledge card `/enseignant/bitaqa/:id`) share ONE frame `LessonToolPage` = the same header (tabs on the right, lesson name on the left, no tool button in it) inside the teacher's space; « ملء الشاشة » is the computer's real full screen, a tool of the dock. The lesson file never appears among the lab's works. « مذكّرة الدرس » (every lesson) is read ONE part at a time — a rail in the order of the hour, one phase at a time, the whole memo on demand and in print (§2quater). A lesson that has its board has a WRITTEN memo (`lessonMemos.js`: one page for the desk, success criteria, several DRAWN opening situations, anticipated answers with two kinds of questions, exit ticket) instead of the derived one. The teacher's shell has a plain background (no coloured halos). Other lessons keep the old mode until
they get a script. Contract: `CLASS_SESSION.md` §2–§2ter, §5quater–§5quinquies; open points: §8bis.

Since 2026-11-17 the pilot lesson `qasim-adad-tabii` tries **« عُدّة الانطلاق », the launch of a lesson** (phase 1 of 4, NOT validated;
`lessons/common/launchkit/`, contract `docs/architecture/LAUNCH_KIT.md`, plan `docs/reports/LAUNCH_KIT_PLAN_2026-11-17.md`): before the
lesson, a game of five minutes at most charges 2–4 « tools », one per earlier الكفاءة the lesson needs (taken from the learning net). The
answer is a gesture (write / drag a card into a box / place a flag); ✓ or « سنعود إليه », never the answer; a tool is never judged on one
answer (the band machine of « بوصلتي »); a quick workshop repairs the weakest tool on the spot; the kit names ONE lesson to revise.
The gate (owner, 2026-11-17): « the door opens by doing » — a CORE tool left at « نبدأ منها » asks for ONE short capsule (card, worked example,
instrument, two questions), then the student goes in whatever he answers; for class and independent students alike. A prerequisite enters
through a generated question family (`families.js`, two exist). Browser only for now: no evidence, no teacher view — « أستعدّ » stays the rule
in every other lesson.

Since 2026-10-13 the **learning net « شبكة الكفاءات »** covers the WHOLE cycle moyen (1AM–4AM): the official
programme of the four years as data (224 items transcribed from `docs/Math-Moyenne-programme/`, stable ids
`<g>am.m<مقطع>.r<nn>`), typed links between items (`requires` / `extends` with its added value / `consolidates` —
the no-duplication rule), the PLANNED 1AM–3AM lessons (codes, units, items — no content), and each 4AM lesson's
`programmeItems` (`packages/core/curriculum/dz/net/`, contract `docs/architecture/LEARNING_NET.md`, generated map
`docs/curriculum/LEARNING_NET_MAP.md`). Every « أستعدّ » shows « راجع قبل أن تنطلق » from the net. The resolver is
imported by path or by `import()`, never from the core barrel.
Since 2026-11-17 a link of the net carries a **weight**: `core` (a student cannot pass the exercises of the new الكفاءة while failing
the old one) or `support` (it helps or serves a proof; `weightNote` says why). All links into 4AM are classified (`WEIGHTED_GRADES`;
review table `docs/curriculum/LEARNING_NET_WEIGHTS_4AM.md`, generated); `toolsForLesson(code)` gives a lesson's prerequisites core first.
A test forbids the lessons' own prerequisites (`prerequisiteLessonCodes`, `pointPrerequisites`) to contradict the net, except a closed
list of known gaps (`LEARNING_NET.md` §2.2bis, §7bis, §8bis). After editing a link: `npm run generate:learning-net`.

Since 2026-10-14 (rollout phase 2) **1AM, 2AM and 3AM are active grades**. Their 196 lessons (39 units, 523 draft
الكفاءات) are catalogue entries `coming_soon` in `dz/{lessons,units,programme}_<g>_2026_2027.json`:
- in the UI: non-clickable « قيد الإعداد » cards, and `getLessonPath` gives `null`;
- in the database: imported `draft`, with all their LPs, ignored by Mastery V2 (`LEARNING_NET.md` §3bis).

A 1AM–3AM lesson is generated INTO its entry (contract §4), then **published = status `available` + export/import +
commit + push to `dev`** (owner decision; guide §11 « Publish a lesson »). A wrong answer shows « راجع: <درس> (<السنة>) »
toward earlier years (`features/learning/EarlierYearReview.jsx`). Practice modelled on the 1AM–3AM term exams uses
`source.type: "term_exam"` / `term_exam_modelled` and the badge « على منوال اختبار الفصل … » (`EXERCISE_CONTRACT.md`).

Since 2026-10-14 (rollout phase 3) the 1AM–3AM lessons are **generated one by one along `docs/curriculum/GENERATION_QUEUE.md`** and each
is published on `dev` before the next; progress and the next batch's prompt: `docs/reports/MOYEN_ROLLOUT_PROGRESS.md`. Since 2026-10-20 the queue
opens with **Phase A « what 4AM needs NOW »** (owner): 4AM units in textbook order, each lesson's DIRECT earlier-year prerequisites taken from
the most recent year (3AM, otherwise 2AM, otherwise 1AM) — 35 entries; the full chains come after (`LEARNING_NET.md` §4bis). A unit's extraction is
written whole (`docs/sources/<g>/unit<N>/`), elements of lessons not yet generated are « pending » in `check:textbook`; the textbook's tape
diagram « مخطط بأقواس » is the shared figure `ArcTape` (statement figure `kind: 'tape'`). Owner rule: a generated lesson is also imported
and its modules/exercises published in the LOCAL database so the owner can browse it. **Nothing generated stays `draft`** (owner,
2026-10-26): every lesson, module and exercise you generate must end `published` — never leave a `draft` module or exercise behind
(guide §11 « Publish a lesson », step 4).

Since 2026-11-01 (phase 1 of 7) the student space has **« مختبر التفكير »**, the thinking space at `/espace/tafkir`. It is a ladder of
NUMBERED challenges outside the curriculum: the band, primary → university, is hidden, and every challenge is `content/thinking-lab/challenges/*.json`.
- **The student tries first.** The server alone grades (`AnswerChecker.php`: the `expression` check is a safe parser written in
  JS and PHP over one shared fixture), counts only honest attempts, opens one key per attempt, and opens the replay of a
  mathematician's thinking after 3 attempts + 24 h (primary band: no wait).
- **Nothing of the answer reaches the client before that gate** (`ChallengePresenter`, `ThinkingLabLeakTest`).
- **Content follows the pipeline** schema → `validate:thinking-lab --strict` (in `check:lessons`) → oracle → server-only
  generated index. Figures are SVG components in `features/thinkingLab/figures/`.
- **Teachers get a read-only preview** (`/enseignant/tafkir`, owner 2026-10-31): everything open, the answer and the replay visible, an
  answer to test, nothing written (`THINKING_LAB.md` §8bis).
- Build plan, phases 2–7: `docs/reports/THINKING_LAB_PLAN_2026-10-30.md`. Contract: `docs/architecture/THINKING_LAB.md`.

Since 2026-10-17 the platform has a **printed-books store** (`/books`, `/books/:slug`, admin « الكتب » at `/admin/livres/*`): orders WITHOUT online
payment, delivery fee set later by the admin, payments recorded as lines; the first book is « بروتوكول SMART » (`BookSeeder`, slug
`smart-protocol`). Since 2026-11-13 a **book manager** (« مسيّر المكتبة », role `book_manager`) is created ONLY by the platform admin
in « مسيّرو المكتبة » `/admin/livres/gestionnaires` (one-time password); he opens only the orders, books and book messages (+ his
account) — gate `can:books`, sidebar filtered by `roles`, every other `/admin/*` is 403 / redirected (`BOOKS_STORE.md` §6ter).
Contract: `docs/architecture/BOOKS_STORE.md`.

Since 2026-10-26 a **school is a first-class object** with its **director** (« فضاء الإدارة », `/idara`, role `school_admin`,
created ONLY by the platform admin in « المؤسسات » `/admin/etablissements` with a one-time password). Owner decisions: the school buys a
licence of seats, the director may enrol students directly (the student confirms), one role (the director), teacher activity shown as
facts the teacher sees too, a student without e-mail gets a generated school login. The school reads a student only through `SchoolAccess` (active member of an active class of that school
WITH `school_consent_at`), never an e-mail, never an average; every new `/school` read joins `SchoolPrivacyContractTest`. Phases 0–7 are
built (structure: terms, teachers by link + « مؤسستي » — since 2026-10-28 joining by the link attaches all the teacher's active classes, with the students who accepted the class sharing text that announces it, classes, roster import with generated « معرّف الدخول » (no mail ever sent to it),
transfer, login cards; tracking: the الكفاءات map class by class as COUNTS, the student file = the parent's « التقدّم بالتفصيل », no study
time; reports FROZEN as snapshots, A4 print, CSV built in the browser; the meeting view `/idara/ijtimaa/:id` with « إخفاء الأسماء »);
and the school LICENCE (model C: access reason `school_licence` before `teacher_subscription`; a covered class uses the school's seats). Contract: `docs/architecture/SCHOOL_ADMIN_SPACE.md`.

Since 2026-10-22 the platform answers parents' fear of an open laptop (« فضاء الوليّ »).
It works in three layers and claims nothing more, because a web page cannot block other sites:
- since 2026-10-23 the parent needs **NO account** (owner): they read through « رابط الوليّ », a private link `/w/:token`. The student creates it
  after consenting in « حسابي » (share sheet, copy, or a QR on screen), or the teacher prints it as a QR on « بطاقات الأولياء ». An optional
  4-digit parent code protects it. The parent reads ONE week report, the same one the student sees at « ما يراه وليّك »: REAL study time measured
  on the platform's own pages (active / idle / away, bounded server-side), exercises, lessons and الكفاءات. The `parent` account (`/wali`)
  is kept in code but is no longer self-registerable;
- a public device-lock guide `/himaya`;
- a closed-garden test that keeps every external link out of the student space.
Since 2026-10-23 the parent also has « التقدّم بالتفصيل »: the whole year lesson by lesson, the الكفاءات that need support and the activity timeline,
shared with the student too, on the link page as well. The parent pages are phone-first. Contract: `docs/architecture/PARENT_SPACE.md`.

## Read before any task

- `docs/README.md` — the documentation map: which document is authoritative
  for what, and which ones are historical.
- `docs/lessons/LESSON_DEVELOPMENT_GUIDE.md` — the entry point before creating
  or modifying a lesson, a module, a manipulation or an exercise.
  Its §14 is the lesson reference architecture, **frozen for generation on
  2026-09-29**: a generated lesson implements that contract and reuses that
  architecture — never a parallel one.
- `docs/architecture/MANIPULATION_DNA.md` before designing or redesigning a
  manipulation: the student's hand must control a mathematical variable, and
  the platform must not converge toward one manipulation style.
- The contract that governs the area you touch (`docs/architecture/*.md`).
- `docs/architecture/BUNDLE_BOUNDARIES.md` before adding a provider, a route,
  a heavy dependency, an `import.meta.glob` or an i18n namespace — it says
  what may enter the entry bundle and where lazy boundaries sit.
- The entry bundle has a budget (212 KB gzip since 2026-11-17, measured 199.2 — it was 245, and 330 before the catalogue left the entry — `npm run check:entry-budget`, CI; no entry module may import a catalogue name: use `utils/gradeSummary.js`; the `admin` and `teacher` strings load with their own space, shared dialogs read `common › ui.*`, and the shell animates with `m`, never `motion`): lessons are mounted by ONE lazy
  route boundary fed by the generated `lessons/lessonIndex.generated.json` (run `npm run generate:lesson-index` after
  adding a lesson or changing its modules — never touch `App.jsx`), lab strings live in
  `i18n/locales/ar/lesson.manipulation.json`, unit maths are imported by path, not from the core barrel
  (`BUNDLE_BOUNDARIES.md` §3–§4, since 2026-10-14).
- **A lesson's pack** (since 2026-11-17): what a lesson gives the platform beyond its modules — it opens on a phone, its game
  world and content, its knowledge sheets, the exam coach, its board script and memo — is declared in ITS `lesson.pack.js`, never
  in a list elsewhere. After writing or changing a pack run `npm run generate:lesson-index` (its flags live in the generated lesson
  index); shared code reads a part with `lessons/lessonPack.js › loadPackPart` / `usePackPart`, never by the lesson's path.
  Contract: `docs/architecture/LESSON_V2.md`.
- **No dead file** (since 2026-11-16): `npm run check:unreached` (CI) fails when a file of `apps/web/src` is reached by nothing from
  `main.jsx`. Delete what a change makes useless in the SAME change; a file kept on purpose is named in the script's `KEPT` with its reason.
- **Lint and « nothing unused »** (since 2026-11-17, CI): `npm run lint` (ESLint, whole tree: unused imports and variables, undefined
  names, duplicated keys) and `npm run check:unused` (unused exports, i18n keys and sentences of `strings.js` / `text.js`; unused classes
  and unrouted actions of the API). Its baseline only SHRINKS — never park new code in it. LaTeX in an ordinary string takes TWO
  backslashes (`'\\;'`): one is dropped and the student sees « ; ». A function that is not a hook is never named `use…`.
  Contract: `docs/architecture/CODE_HEALTH.md`.
- **Formatted code** (since 2026-11-16): the areas listed in `package.json › format:v2` (the pilot's game world, launch kit, « مختبري »,
  class session and teacher tools) are kept in Prettier style, 120 columns — run `npm run format:v2` after editing them; `npm run check:format`
  runs in CI. One statement per line, one component per block: never a whole component on one line. A new or rebuilt area is added to both scripts.
- **The textbook is the REFERENCE of the الكفاءات, not the script of the lesson** (owner, 2026-10-14): the entry point,
  examples, contexts and order of ideas are designed by the platform (the book's activity is one candidate, often posed
  later as an application), and every module is ONE track — the action (lab) at the top with nothing above it, then
  questions on what the student did, then the name (`LESSON_DEVELOPMENT_GUIDE.md` §4ter–§4quinquies; reference
  `kitabat-adad-tabii`, validated; applies to every new lesson; existing lessons: `docs/reports/LESSON_METHOD_RETROFIT.md`).
- **Supported screens: tablet and laptop only (owner, 2026-10-15)** — widths ≥ 768 px (768×1024, 1024×768, 1280×800, 1366×768, 1920×1080). Phones are NOT supported: do not design, tune or test for phone widths (320–430 px); older mentions of them below are superseded.
  **Enforced (owner, 2026-10-27):** lessons and exercises are behind `components/auth/RequireLargeScreen.jsx`; a phone sees « محتوى الدروس يظهر فقط في شاشة الحاسوب … » instead (guide, « Supported screens »).
  **Exception (owner, 2026-11-16, TRIAL on the pilot): the HOME of a lesson whose pack says `phone: true` (`components/auth/phoneLessons.js › PHONE_LESSONS`, generated from the packs)**
  (today `qasim-adad-tabii`) opens on a phone — the student's game world, played with the phone SIDEWAYS, the teacher's card, his memo and his lesson file. Every
  other page of the lesson keeps the message and is shown CLOSED with « على الحاسوب » on the card and in the header (owner: « only the pages designed for mobile »). Rules — one scale by the root font size,
  never two scales, a box scrolls instead of shrinking below a readable text, the middle of the screen stays the world:
  `GAME_WORLD.md` § « On a phone ». Walks: `E2E_TOUCH=1 E2E_SIZE=800x370`.
  **Exception (owner, 2026-10-17): the printed-books pages `/books` and `/books/:slug`** are opened from WhatsApp on phones —
  they are designed and tested mobile-first for conversion too (`docs/architecture/BOOKS_STORE.md` §4).
  **Exception (owner, 2026-10-23): the parent pages — the link page `/w/:token`, `/wali/*` and the guide `/himaya`** — are opened
  from WhatsApp or a QR on phones. They are designed phone-first and tested at 390×844 and 1366×768
  (`docs/architecture/PARENT_SPACE.md` « Screens »).
  **Exception (owner, 2026-10-22): « فضاء الألعاب », the game space `/espace/jeux`** is played on phones AND laptops — designed and tested at
  390×844 and 1366×768 (`docs/architecture/MADAR_GAME.md` §11). Since 2026-10-23 it has two families:
  - « ألعاب رياضيات » (« قنّاص القيم », « الدخيل », « الحساب الذهني »), shown FIRST: free, the maths is the gameplay. They have 50 levels × 3 sub-levels covering
    1AM–4AM. They NEVER start hard (owner): each game opens with a free warm-up round two levels below the student, then the
    level rises progressively and adapts every round (`MADAR_GAME.md` §16);
  - « ألعاب ترفيهية » (the orbit runner, « دفاع الكوكب », the « المستكشف » platformer), below: their hearts are earned in the
    « محطة التزوّد » (correct answers on the student's own الكفاءات).

  The teacher closes a game for the class or for one student, and can PLAY with each class (« نافس أستاذك »: one score per class,
  name in that class's ranking with a « الأستاذ » badge, no hearts, never learning evidence — `MADAR_GAME.md` §18).
  Finishing a lesson unlocks NOTHING in the game (owner).
- **INDEPENDENCE FROM THE BOOK** (owner, 2026-10-15, CRITICAL): the platform is self-sufficient. Read the textbook, analyse it, get the idea, then
  GENERATE YOUR OWN content — own boxes, own contexts, own numbers, own wording. Never copy the book's text to the student and never write a
  student-visible line that sends them to the book (« الكتاب ص 55 », « اقرأ ما يقوله الكتاب », « تمارين من الكتاب »); `SourceTag` is muted for
  students (`LESSON_DEVELOPMENT_GUIDE.md` §4ter-bis).
- **The lab prototype goes to EVERY lesson — rollout DONE (112/112) and now BINDING on every NEW lab and lesson** (owner, 2026-10-28; a generated lesson is not done until `lab-rollout-status.mjs --lesson <id>` prints ✅; `LESSON_DEVELOPMENT_GUIDE.md` §6ter): questions OVER the lab after each step (mandatory for students; a teacher
  may switch them off for his own account), a clear stepper and a success celebration, game sounds (off by default, a « الصوت » switch in
  every lab), « إعادة » that restarts everything, full screen in every lab, and the end-of-module card as a memo sheet with its timed
  challenge « اختبر ذاكرتك ». Ground truth, batches of 20 lessons and per-session prompt: `docs/reports/LAB_PROTOTYPE_ROLLOUT.md`;
  status: `node apps/web/scripts/lab-rollout-status.mjs`.
- **Every manipulation has the onboarding** (owner, 2026-10-14): `LabCoach` — at each moment a ring + one-sentence bubble on the button or
  gesture needed now, shown once, hidable, re-summonable; same design in every lab, every lesson, every grade
  (`MANIPULATION_CONTRACT.md` §8quater, `MANIPULATION_DNA.md` §17.11; rollout and its prompt: `docs/reports/LAB_COACH_ROLLOUT.md`).
- **Respect Islam in every generated string, icon and emoji** (owner, 2026-10-26): never use the pig (🐷 — a piggy bank is drawn as 💰/a money box),
  alcohol, gambling (cards, dice as a game, casino, lottery), usury/interest, pork, non-Islamic festivals or religious symbols, or any word or
  situation that touches them — in lesson text, contexts, problems, bank sheets, icons and badges. Use neutral Algerian everyday contexts.
  Checked by `LESSON_DEVELOPMENT_GUIDE.md` § « Cultural and religious respect ».
- Terminology: a learning point is « الكفاءة / الكفاءات » in every visible
  string since 2026-10-05 — never « نقطة التعلّم / نقاط التعلّم »; identifiers
  (`learningPoint`…) are unchanged (`docs/architecture/ARABIC_RTL_CONTRACT.md`).

## DOCUMENTATION SYNCHRONIZATION RULE (permanent, applies to every prompt)

For every development task — feature, bug fix, refactor, architectural change,
UI change, lesson change, exercise change, interaction change, or any other
meaningful modification — you MUST first determine whether the change affects
any documentation, and if it does, update the relevant `.md` files as part of
the SAME task. Documentation is not an optional final step, and the user must
never have to ask for it.

The implicit workflow of every development prompt in this repository is:

1. Read the relevant existing documentation.
2. Read the relevant current implementation.
3. Implement the requested change.
4. Determine what documentation is affected.
5. Update the relevant `.md` files.
6. Verify documentation consistency with the implementation.
7. Run the relevant tests.
8. Report the documentation changes in the final response.

Before considering a task complete, verify:

1. Did this change modify or introduce an architecture?
2. Did this change modify an existing component/API/contract?
3. Did this change introduce a new reusable pattern?
4. Did this change modify lesson-generation rules?
5. Did this change modify pedagogy or interaction rules?
6. Did this change modify UI/UX conventions?
7. Did this change modify RTL/Arabic rules?
8. Did this change modify exercises, progression, mastery, or student behavior?
9. Did this change modify Classroom Mode?
10. Did this change introduce a new testing requirement?

If YES to any of these, update the appropriate documentation immediately. Even
when the answer appears to be NO, briefly verify that no documentation is
affected before finishing.

- NEVER leave the repository documentation knowingly outdated after a
  meaningful architectural or behavioral change.
- Do not create unnecessary documentation for trivial changes. Use judgment.
- Always use the CURRENT CODE as the source of truth; never document behavior
  that is not actually implemented. Mark planned behavior `Planned` or
  `Not yet implemented`.
- If a new reusable pattern is introduced, document it so future developers
  and AI agents reuse it instead of creating another one-off implementation.
- Prefer updating the existing authoritative document over creating a new
  file. When two documents would define the same contract, one is
  authoritative and the other links to it.
- At the end of every task, include a short **"Documentation Sync"** section
  in the final report stating which `.md` files were updated and what was
  documented — or, if no documentation was required, why the change does not
  affect the documented architecture/contracts.

### Lesson-generation documentation rule

Whenever a task creates, modifies, or establishes a pattern that could be
reused in future lessons — a lesson structure, module pattern, activity
pattern, question type, manipulation or reusable manipulation behaviour,
exercise type, feedback pattern, `KnowledgeBrick` usage, progression
behaviour, Classroom presentation pattern, Arabic/RTL convention, responsive
interaction pattern, or reusable lesson component — the relevant
lesson-development documentation (`docs/lessons/LESSON_DEVELOPMENT_GUIDE.md`
and the contract it points to) MUST be updated in the same task. Future
lesson-generation agents must be able to learn the correct pattern from the
documentation without reverse-engineering old lessons.

## Images — where they may and may not be generated

### Lesson content: drawn in code, never generated

Everything under `apps/web/src/lessons/` — and `manipulations/` above all — is
drawn in code: inline SVG and styled DOM, parameterised by props, unit-tested,
with Arabic as live DOM text. There is not one raster image in the tree, and
that is deliberate.

**Never generate a raster image (`cf-image`, or any diffusion model) for lesson
content.** If a manipulation needs a new visual, extend its SVG. Four reasons:

1. **It must react.** A shelf re-shelves 420 books while the student drags its
   bookend; a player shakes when a full team refuses it. A flat JPG takes no
   props. See the shelf and its hand-drawn books in
   `manipulations/divisibility/DivisorExplorerBooks.jsx`.
2. **Arabic.** Diffusion models mangle Latin text and cannot render RTL Arabic
   at all. Labels like `رفّ ناقص` are DOM text so they stay correct and selectable.
3. **Determinism.** `logic/bookshelf.test.js` asserts on computed geometry.
   Generated output differs every run.
4. **Mathematical truth.** A generated "10 books on a shelf" may show 9 or 11.
   When the drawing *is* the divisibility argument, that is a wrong lesson.

> Le dessin n'est pas une illustration — il se LIT.
> See `docs/architecture/MANIPULATION_CONTRACT.md`.

**People are one shared character, `primitives/KidFigure.jsx`** (owner, 2026-10-14): boys in a hoodie, **girls always in
Islamic dress** (hijab draped over the shoulders + long tunic — no uncovered-hair style exists); the crown sits exactly on the
child's height. Never draw a person locally. Rules and cast: `docs/lessons/LESSON_DEVELOPMENT_GUIDE.md` §6 « People are the
platform's CHARACTERS »; the lab visual kit around it: `MANIPULATION_CONTRACT.md` §8ter.

**Every manipulation is built to the LIMIT of what you can produce for Gen Alpha (11–13)** (owner, 2026-10-14, every
generation): a lab that merely works is not done. The quality bar — drawn world, shared kit, physical gestures, visual feedback that
never states the rule, one screen at the tablet and laptop sizes, screenshots reviewed with the eyes — is `docs/architecture/MANIPULATION_DNA.md` §17.
A lab opens on NO title: the context in one or two plain sentences, then ONE direct question naming the goal and the end state (§17.9).

### Marketing and shell surfaces: generation is fine

Homepage hero, OG/social cards, blog headers, empty-state art, print covers —
anything outside `lessons/`.

- **`prompt-to-design`** — preferred. Deterministic, real typography, free, and
  the output is reproducible from a committed script.
- **`cf-image`** — only for photographic or illustrative art, and only when the
  image carries **no Arabic text**.

### Showing the product: real captures, never generated screens

When a marketing page shows what the student does (the `/methode` scroll
journey), it shows the REAL lesson screens, captured by Playwright with a
simulated session — `apps/web/scripts/capture-methode.mjs` (lesson
« التعرّف على قاسم لعدد طبيعي », football lab: 15 players in 3 teams, then 16
and one left out) then `apps/web/scripts/crop-methode.py` →
`apps/web/public/images/methode/lesson/*.webp`. The copy beside each capture
describes only what that lesson really does; if the lesson changes, re-run both
scripts and re-read the story strings (`marketing.json › method.steps.*.story`).
The page uses NO generated image at all (owner decision, 2026-10-07): hero and
summit are typographic — simple and professional.

Station 09 « إختبار أولي » (2026-10-08) is a regular station in the third act:
`public/images/methode/lesson/test.webp` is the real module `itqan` of
`qasim-adad-tabii` (the lesson's five-question test). Station 10 « الإتقان » is
the only dark block (trophy, amber): `exercises.webp` is a real exam sheet
(level 1 of the same lesson, `/espace/pratique/<lesson>`), followed by the five
levels. Both captures were taken with a temporary student token from the local
API (`createToken`, deleted afterwards — no script committed) and cropped like
the others. The five level names come from `student.json › practice.levelNames`
and are copied into `marketing.json › method.exercises`. Station 10's copy claims
« 50 تمرينًا في كل درس » (verified: all 74 lessons hold 10 exercises per level)
and « امتحانات BEM من دورة 2007 إلى دورة 2025، أو على منوالها » — the corpus
range, not each lesson's own source (items are labelled « على منوال BEM <année> »
or official).

### OG share cards

`scripts/og-card.py` renders branded share cards with correctly shaped Arabic
(Cairo, via Pillow + raqm). Use it rather than generating cards:

```bash
python3 scripts/og-card.py "عنوان الدرس" --eyebrow "الرياضيات · 4 متوسط" -o card.png
```

The **site-wide** card is `apps/web/public/og-image.png` (1200×630), served
at `https://smarter-academy.com/og-image.png` and named by static `og:*` /
`twitter:*` tags in `apps/web/index.html`. Keep those tags static HTML with an
absolute URL — share crawlers never run React — and keep the PNG under
~300 KB (it is 256-colour for that reason): WhatsApp drops heavier previews.

### The logo

Since 2026-10-21 the brand mark is an **open ring holding an isometric cube** (owner's choice; it replaced the star + figure +
book emblem). Every logo file — `apps/web/public/brand/*`, favicons, PWA icons, `email/logo.png`, `og/smarter-academy.png` —
is generated by `python3 scripts/brand/build-logo.py`; never redraw or re-crop it. Usage rules: `docs/architecture/BRAND.md`.
