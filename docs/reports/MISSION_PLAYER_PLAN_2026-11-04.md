# Mission mode — build plan and status (pilot `qasim-adad-tabii`, 2026-11-04)

**Owner idea:** turn the lesson into a kind of game. The student enters a full-screen space and starts the journey from the final
mission. The content flows automatically and manually, with game-like transitions, and the lab covers the screen.

**Rules:** guide `docs/lessons/LESSON_DEVELOPMENT_GUIDE.md` §4sexies (focus) and §4septies (mission).

## Decision (council + value review, 2026-11-04)

- **Worth building:** the mission thread, the journey map and the full window. Motion is only worth it where it carries meaning
  (a tool flying into the bar, books filling shelves), not as decoration everywhere. Decorative "seductive details" lower learning.
- **The student cannot solve the mission at the start.** The opening says so honestly (« لا أعرف بعد… »). The mission comes back
  as a checkpoint between modules and is won in its مسألة module.
- **Content never advances on a reading timer**, only after something the student did.
- **NOT built on Classroom Mode.** Presenting unlocks every step and module, stops writing module completion, and turns graded
  tests into the teacher's reveal-one-answer flow. The mission is a layer on the student's normal pages.
- **Defaults taken when stage 1 started** (owner said « start stage 1 » without choosing; change any of them on request):
  1. the lesson button opens the mission;
  2. checkpoints are practice, not evidence;
  3. sound stays off by default;
  4. the owner tests it first (no automatic A/B split).

## Stages

| Stage | Content | Status |
| --- | --- | --- |
| **1. The mission thread** | Mission data, opening scene, mission home, mission bar, map with the real lock, checkpoints | **Done 2026-11-04** |
| **2. Full window + no scrolling + motion — done 2026-11-04** | **Owner rule (2026-11-04): no scrolling anywhere in the game version.** Every screen fits the window: a module is played one unit at a time (lab → each step → memo), and a unit taller than the window is split into PAGES, reusing `ClassroomPaged` + `classroomPages.planPages` + the fit engine (`usePresentationFit`) WITHOUT `isClassroomMode` (whose locks/write/test branches must not apply). The lab fills the window. `MissionShell` in the persistent lesson shell (`LessonClassroomShell` layout route) as a CSS full window, with the browser full screen optional. Module transition (map, ≤ 2 s, skippable), step transition (≤ 250 ms on persistent nodes, never unmounting), the key flying into the bar. Every animation plays once per device; none with reduced motion. | **Done** (see below) |
| 3. Climax + polish | 756 books → 21 shelves of 36 when part 2 of مسألة 1 is answered right, a celebration, مسائل 2–3 and the test as « مستويات إضافية » | Planned |
| 4. Measure | Mission vs focus: completion, time to first action, final-test score, next-day return. Trim the motion if completion rises without better scores. | Planned |

## Stage 1 — what was built

**Code (`apps/web/src/lessons/common/mission/`):**

| File | Role |
| --- | --- |
| `missionModel.js` (+ test) | Pure logic: `isMissionView`, `missionTools`, `pendingCheckpoint`, `missionStations`, `resumeStation`, local state. |
| `useMission.js` | Hook: progress, real lock (`resolveModuleStatus`), earned tools (`useLessonKnowledge().items`), state. |
| `MissionHome`, `MissionLayer`, `MissionBar`, `MissionMap`, `MissionCheckpoint` | The screens (see the guide table). |
| `MissionDialog`, `LibraryScene` | Helpers: the dialog, and the SVG library whose shelves fill with the tools. |

**Wiring:**
- `LessonIndex` renders `MissionHome` for the student. (Stage 1 also offered the old page at `?view=details`; it was removed
  the same day, because the student never reaches the old version.)
- `ModuleLayout` mounts `MissionLayer`.
- `StudentFocus.isStudentFocus` treats `'mission'` as focus.
- Strings: `lesson.json › mission.*`.

**Lesson:** `qasim-adad-tabii/lesson.config.js` has `studentView: 'mission'` and `mission`. It holds 4 tools (the 4 knowledge
items), climax module 4 and 3 checkpoints:
- `cp-baqi`: the remainder must be 0;
- `cp-jidaa`: `756 = b × q` means b divides 756;
- `cp-khitta`: how to choose between 32 and 36.

None of them answers a question of مسألة 1.

**Verified (browser, mocked session, 1280×800):**
- A fresh student gets the opening scene; « ابدأ » leads to module 0 with the bar.
- After module 1, arriving at module 2 shows `cp-baqi`. The answer is stored and the checkpoint is not asked again after a reload.
- The 🔑 of module 1 is earned.
- The map shows the real lock: stations 0–1 done, 2 open, 3–6 locked, the test open (always reachable, as on the lesson page).
- The mission home works. (The « صفحة الدرس » link checked here was removed later the same day.)
- A teacher sees the normal lesson page and modules, with no bar and no checkpoint.

## Stage 2 — what was built (2026-11-04)

- **`MissionPlayer`, `FitToArea`, `missionPlayerContext`, `mission.css`:** the full window, the fit, unit navigation and
  the motion.
- **`ClassroomPaged` + `PagingContext`:** paging without Classroom Mode, with deep blocks, opening oversize blocks and
  heading glue.
- **`ContentModule`:** `play` mode, one unit at a time with the student's locks, through `DeclareUnitNav`.
- **`ModuleLayout` / `LessonIndex`:** render the player.
- **`GuidedProblem`:** one block per sub-step.
- **`ManipulationShell`:** immersive context in the player, no second full screen.
- **`TeamBuilder`:** a narrower pitch in the player.
- **`MissionLayer`:** the « أنت هنا » arrival card.
- **`MissionBar`:** the tool flight.
- **Book independence fixed in module 0:** « أستعدّ — الكتاب ص 7 » and « من الكتاب المدرسي » were shown to students.

**Measured (mocked student, every unit and page walked):**

| Screen | Fit |
| --- | --- |
| 1280×800 | ALL screens, no area scrolls (labs at zoom 0.6–0.69, everything else 0.85–1) |
| 1024×768 | All screens except the football lab (`TeamBuilder`, نشاط 1), which uses the inner scroll at zoom 0.6 |

**Kept:**
- teacher and Classroom Mode (classroom e2e on the same lesson);
- stage-1 flow (opening, checkpoint, map, details page);
- progress written by the module's own handlers.

**Revision after the owner's screenshots (same day):** « the content must use the whole space, specially the lab; make the
questions bigger », and « the student never has access to the old version ».
- **Game layout of the lab shell:** two columns, with the scene across the width and the pitch sized from the height.
- **`FitToArea` ENLARGES:** text up to 1.9×, labs up to 1.3×, centred vertically.
- **Old version closed for students:** no `?view=details`, a locked module redirects to the mission, and the details
  dialog and the practice entry are in the mission.

Re-measured at 1854×930, 1280×800 and 1024×768: everything fits and nothing scrolls. The football lab now fits at
1024×768 (zoom 0.83).

**Still open:** the shelf drawing of `DivisorExplorerBooks` does not grow with its column.

**Further owner rounds (same day):**
1. **One item per screen:**
   - أستعدّ: one question per screen, then the correction one per screen;
   - every module: lists opened into their items, a heading rides with its item;
   - the fitter is damped (no zoom oscillation).
2. **No per-skill progress cards** in أستعدّ inside the player.
3. **One lab for the whole lesson: football.** The library lab (`divisor-explorer-books`) is REMOVED from the lesson:
   - module 1 متقدم: 42 players, 5 or 6 teams;
   - module 2: 48 players, 6 then 8 teams (`content/teams.js`);
   - memo examples, quiz, prediction prompts and the map's « نحسب الباقي » follow the new numbers;
   - the « مسألة الدرس » (756 books) stays: it is the mission, not a lab.
4. **The lab's mission in big** when the student enters the lab.
5. **Rounds + stars instead of مبتدئ / متقدم** (`LabRounds`, `roundsModel`):
   - module 1: 3 rounds, a ⭐ challenge and the free pitch; module 2: 2 rounds and the free pitch;
   - 1–3 ★ per round (won · first-try answers · few trials), best kept per student, total in the bar;
   - the teacher keeps the levels.

   Verified by playing rounds 1 and 2 by hand in the browser: win cards (★★☆ for a student who guessed), round 3 unlocked,
   ⭐ 4 in the bar.

**(Superseded) Open — the labs need a GAME LAYOUT.** `TeamBuilder` and `DivisorExplorerBooks` were designed as tall vertical pages
(header ≈ 190 px + controls + idle line + scene). In the player they shrink to zoom 0.6–0.69, which is small text. A
landscape layout (scene beside the bench/controls) under `useManipulationImmersive()` / `useInMissionPlayer()` is lab
design work (MANIPULATION_DNA §17, « one screen »). Do it before rolling the player to other lessons.

## Open points

- The site's first-visit page tour still pops over the first module. Stage 2 should decide whether the mission replaces it.
- Stage 2 must keep `ContentModule`'s « every unit mounted, `hidden` toggle » invariant. Animate the persistent nodes and never
  remount them with `AnimatePresence` keys.
- Rollout: only lessons with a real « مسألة الدرس ». Definition-heavy lessons keep the focus view.
