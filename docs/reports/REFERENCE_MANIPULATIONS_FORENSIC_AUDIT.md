# Reference Manipulations — Forensic Audit

*Smarter Academy · 4AM · unit « الأعداد الطبيعيّة والأعداد النّاطقة » · audit date 2026-09-29 · read-only*

> **Status: point-in-time audit, not a contract.** It records how the unit's
> manipulations behaved on 2026-09-29 (commit `20665a8`), as a factual
> baseline for a later pedagogical redesign. It proposes no redesign. The
> contracts remain `docs/architecture/MANIPULATION_CONTRACT.md` and
> `docs/lessons/LESSON_DEVELOPMENT_GUIDE.md`. Cross-check every line number
> against the current code before acting on it.
>
> **Two parts.**
> - **Part I (§1–§18)** is the deep audit of the reference lesson
>   `qasim-adad-tabii`: 3 instances, with full student scripts.
> - **Part II (§19–§31)** extends the audit to **every manipulation of every
>   module of the nine lessons**: 29 instances, 9 types. For each instance it
>   lists the mechanics, the discovery condition, and its pros and cons,
>   followed by the defects shared across the unit.
> - The two parts use the same evidence tags and the same method.
>
> **Follow-up (2026-09-30).** The reference lesson was redesigned from this audit.
> The books lab is now a shelf the student stretches, and the shared kit defects
> a–f, i and k were fixed for it. The design rules that came out of the redesign
> are in `docs/architecture/MANIPULATION_DNA.md`.
> The line numbers and runtime observations below describe the code **before**
> that redesign. The same day, at the owner's request, lessons 2–9 were
> redesigned too (`MANIPULATION_DNA.md` §15 lists what changed per lesson).
> Findings still open: defect k (standalone labs' duplicate second level,
> except معارف 143), the dormant class mode, and 40 px list chips.

---

## 1. Scope and methodology

**What was audited.** Every manipulation instance in the reference lesson, followed from `lesson.config.js` through the module, the registry, the shell or standalone component, the pure logic, the primitives and the gesture hook, and then to what the student actually sees.

**Documentation read.**
- Read in full:
  - `MANIPULATION_CONTRACT.md`
  - `LESSON_DEVELOPMENT_GUIDE.md` §6, §9 and §14.4
- Read by section:
  - `INTERACTION_PEDAGOGY.md` §6quinquies, §9, §16bis and §17bis, plus the headings
  - `LESSON_DESIGN_PLAYBOOK.md` §14
- Searched for the reference-lesson designation: `KNOWLEDGE_DEPENDENCY.md`, `README.md`
- Consulted only through the code paths they govern: `CLASSROOM_MODE.md`, `LESSON_CONTRACT.md`, `AI_LESSON_CONTRACT.md`, `EXERCISE_CONTRACT.md`, `LEARNING_ARCHITECTURE.md`, `TEACHER_CLASSROOM_ARCHITECTURE.md`. Wherever a contract claim is stated, the document actually read is cited.

**Evidence types used in this report.**

| Tag | Meaning |
|---|---|
| **[CODE]** | read in source |
| **[RUNTIME]** | observed in a real Chromium against the running dev server (`localhost:5173`) with Playwright probes (kept outside the repository) |
| **[TEST]** | existing unit or e2e result |
| **[VISUAL]** | screenshot inspected |
| **CONTRACT / IMPLEMENTATION / OBSERVED** | used where the three disagree |

**What was run.**

| Command | Result |
|---|---|
| `npm run validate:lessons` and `-- --strict` | passed, qasim-adad-tabii 4/4 LPs |
| `vitest run src/lessons/common/manipulations` | 10 files, **124/124** passed |
| core `vitest` (equalGrouping, curriculum) | 8 files, **80/80** passed |
| `apps/web/e2e/lesson-kit/manipulations.mjs` on :5173 | **183/183** passed |
| Probes 1–3 | desktop journey, 375/390/768/1024/1280 geometry, M2, keyboard/magnet (anonymous visitor; local progress seeded only in a throwaway browser context) |

**No code, test or contract was modified by the audit.**

---

## 2. Reference lesson identification

**Verified, not assumed.**
- `LESSON_DEVELOPMENT_GUIDE.md` §9 (line 719) designates **"`qasim-adad-tabii` module 1"** as the reference for the two-level workspace, the concrete-object rule, the only standalone manipulation, and the Classroom Mode layout-solving component.
- `INTERACTION_PEDAGOGY.md` line 337 cites `Module01AlMaktaba.jsx`.
- `LESSON_DESIGN_PLAYBOOK.md` §14 calls all nine unit lessons "reference lessons"; this is the one singled out for manipulations.

| Field | Value |
|---|---|
| Lesson ID | `qasim-adad-tabii` |
| Arabic title | التعرّف على قاسم لعدد طبيعي |
| Path | [apps/web/src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-adad-tabii/](../../apps/web/src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-adad-tabii/) |
| Unit / domain | الأعداد الطبيعيّة والأعداد النّاطقة / ميدان أنساب الأعداد والحساب (4AM) |
| Textbook | unit 1, activity 1 (p. 8), معارف 1 (p. 10), exercises 1, 2, 5 (p. 14) |
| Modules | 00 أستعدّ (diagnostic) · **01 نشاط 1 — 420 كتابًا في رفوف** (trigger, P1) · **02 معارف** (discovery, P2–P4) · 03 أوظّف تعلّماتي (practice) · 04 إختبار أولي (evaluation) |
| Manipulation types | `team-builder` (shell-based), `divisor-explorer-books` (standalone) |
| Themes | `football` (platform context, declared), `library` (textbook) |
| Levels | M1: workspace مبتدئ = team-builder, متقدم = books 420. M2: standalone books 143 with its **own** selector (see M3-F1) |
| Learning points | P1 remainder zero ⇔ divisor · P2 a = b × q · P3 four equivalent phrasings · P4 1 and a itself |
| Resources declared | `team-builder-15-3` (M1, beginner), `divisor-explorer-420` (M1, advanced), `divisor-explorer-143` (M2, no level) |
| Knowledge bricks | `qasim-baqi` (M1 step 2), `qasim-jidaa`, `siyagh-mutakafia`, `wahid-wa-nafsuh` (M2) |
| Prior knowledge | `qisma-iqlidiya`, `qawaid-qabiliyat-al-qisma` (diagnosed in M0) |

Modules 00, 03 and 04 contain **no manipulation** [CODE].

---

## 3. Manipulation inventory

| ID | Module | Manipulation | Type | Level | Theme | Main gesture | Mathematical concept |
|---|---|---|---|---|---|---|---|
| **M1** | 01 al-maktaba (workspace, default tab) | «جرّب: 15 لاعبًا في 3 فرق متساوية» | `team-builder` | مبتدئ | football | drag (or tap-tap / keyboard) a player from the bench into a team, plus number tiles for n and k | partition: n = k × q + r; r = 0 ⇔ k divides n |
| **M2** | 01 al-maktaba (workspace, second tab) | «جرّب: كم كتابًا في كل رفّ؟» — 420 books | `divisor-explorer-books` | متقدم | library | **tap a shelf size** (no drag) | quotition: 420 = b × q + r; r = 0 ⇔ b divides 420 |
| **M3** | 02 maarif (standalone, intro) | «مثال الكتاب: 143 كتابًا في رفوف من 11» | `divisor-explorer-books` | its own selector: مبتدئ = 143, **متقدم = 420 preset** | library | tap a shelf size (11, 12, 13) | 143 = 11 × 13 + 0 → the textbook's example of the definition |

M3 is a distinct instance: same type, different numbers and purpose, and it carries its own level selector.

---

## 4. Architecture map

```
lesson.config.js  resources[] ─────────────── metadata only (registry/memo); does NOT drive the page
        │
Module01AlMaktaba.jsx ── ContentModule(intro=…)
        │   └─ ManipulationWorkspace (levels = JSX functions in the module, default 'beginner')
        │        ├─ panel beginner → WorkspaceLevelContext='beginner' → <Manipulation type="team-builder" total=15 groups=3 onVerdict>
        │        └─ panel advanced → WorkspaceLevelContext='advanced' → <Manipulation type="divisor-explorer-books" total=420 candidates pair onVerdict>
Module02Maarif.jsx ── ContentModule(intro=<Manipulation type="divisor-explorer-books" total=143 candidates=[11,12,13] initialCapacity=11>)
        │
Manipulation.jsx → manipulationRegistry.js (closed map, React.lazy) → component
        │
 ┌──────┴───────────────────────────────┐                ┌──────────────────────────────────────────┐
 │ TeamBuilder.jsx  (SHELL architecture) │                │ DivisorExplorerBooks.jsx (STANDALONE)     │
 │  useManipulation  (phase/hints/level/ │                │  own useState: capacity, revealed, tried  │
 │    epoch/report)                      │                │  own level selector when not in workspace │
 │  local `lab` ← logic/teamBuilder.js   │                │  arithmetic inline (total % value)        │
 │    ← core equalGrouping.groupInto     │                │  ClassroomPresentation + booksClassroom-  │
 │  useDragInteraction (tap/drag/kbd)    │                │    Layout.js (projector grid solver)      │
 │  primitives: DropZone, DraggableObj,  │                │  own Book SVG, own ~690 lines of CSS,     │
 │    DragGhost, NumberTile, Equation-   │                │    hard-coded Arabic                      │
 │    Display, PlayerFigure, PitchBackdrop│                │  NO shell: no hints, phase, discovery,    │
 │  teamFormation.js (positions)         │                │    free lab, explanation                  │
 │  ManipulationShell → Progress, Teacher-│                └──────────────────────────────────────────┘
 │   Mode(hidden), Controls(+AutoComplete),│
 │   Hint, Stage, representation,         │
 │   Discovery, Explanation, FreeLab      │
 └───────────────────────────────────────┘
        │
packages/core: manipulationTypes.js (controls, autoComplete unlock), equalGrouping.js, divisibility.js
```

**How the pieces interact.**

1. `useManipulation` owns the *pedagogical* state: `phase`, `hintLevel`, `epoch`, `level`, `mode`, `freeLab`. TeamBuilder owns the *mathematical* state `lab` (who is where) plus a separate `tried` memory [CODE [TeamBuilder.jsx:65-83](../../apps/web/src/lessons/common/manipulations/divisibility/TeamBuilder.jsx#L65-L83)].
2. A change of numbers calls `setNumbers → reset() → epoch+1`. TeamBuilder then re-initialises `lab` **during render** by comparing a `total:groups:epoch` signature, so there is never a frame with stale teams [CODE [TeamBuilder.jsx:94-104](../../apps/web/src/lessons/common/manipulations/divisibility/TeamBuilder.jsx#L94-L104)].
3. The gesture hook turns pointer, tap and keyboard input into `onDrop(source, zone)`, gated by `accepts`. `accepts` calls the pure `canPlace`, which returns `true` or a reason key that becomes an Arabic message [CODE [logic/teamBuilder.js:56-72](../../apps/web/src/lessons/common/manipulations/logic/teamBuilder.js#L56-L72)].
4. `verdict(lab)` → `groupInto(total, groups)` in core. The equation, bench tone, badges, fix-hint and `onVerdict` all derive from `lab` + `groupInto`. The "settled" flag comes from `isSettled(lab)`: no bench player can legally be placed.
5. The books lab bypasses all of the above. One `choose(value)` sets `capacity`, `revealed` and `tried[value]` and fires `onVerdict` [CODE [DivisorExplorerBooks.jsx:347-358](../../apps/web/src/lessons/common/manipulations/divisibility/DivisorExplorerBooks.jsx#L347-L358)]. Everything visible is recomputed from `total` and `capacity` on render.
6. Level and registry configuration:
   - `levels.js` gives `divisor-explorer-books` the pair {beginner 24 · advanced 420} and `team-builder` {15/3 · 42/5}.
   - Inside a workspace these presets are **ignored**: the lesson's JSX decides.
   - Standalone (M3), `resolveManipulationLevels('divisor-explorer-books', {total:143})` makes 143 "beginner" and the 420 preset "advanced".
   - The registry declares team-builder `autoComplete: {unlock:'config'}`, `changeNumbers {total:[2,60], groups:[2,12]}`, `nextStep`, `hideConclusion`. For the books type, the registry's `controls` are **not consumed** (contract line 66).

**Tests per manipulation.**
- **M1:**
  - `logic/teamBuilder` through `autoComplete.test.js` (fill/step/mixed/domain sweep)
  - `teamFormation.test.js` (no overlap, swept)
  - `workspaceLevels.test.js`, `levels.test.js`
  - core `equalGrouping.test.js`
  - e2e W1–W3, AC1–AC8, D
  - **No unit test asserts a refusal reason** of `canPlace`.
- **M2:**
  - `booksClassroomLayout.test.js` (projector grid only)
  - `bookPalette.test.js`
  - e2e L1 and C1–C3
  - `logic.test.js › 'divisor-explorer (420 livres)'` tests `logic/divisorExplorer.js`, **which the books lab does not import** (see G-3).
- **M3:** **no e2e coverage at all** (the suite never opens `/qasim-adad-tabii/maarif`) and no unit test.

---

## 5. Manipulation 01 — `team-builder`, مبتدئ (15 players / 3 teams)

### 5.1 Purpose
- File header, five questions [CODE [TeamBuilder.jsx:18-52](../../apps/web/src/lessons/common/manipulations/divisibility/TeamBuilder.jsx#L18-L52)]:
  - **A** players carried one by one from bench to team
  - **B** sharing n into k equal parts is n = k × q + r
  - **C** team grows, counter rises, bench empties, and the extra player can go nowhere
  - **D** n = k × q + r written after the gesture
  - **E** "falls exactly" is not luck: working team counts are the divisors
- Declared as a platform context (`experience: platform_context / smaller_numbers_for_first_contact / football`), tagged «مثال تفاعلي إضافي» under the lab [RUNTIME].

### 5.2 Initial state
[RUNTIME, 1280 and 375]
- Workspace opens on **مبتدئ** (`data-level=beginner`).
- Shell: phase `act`.
- Teams `0,0,0`; bench `15`.
- Auto-complete status **`ready`** (not locked).
- No representation, no discovery, no reject message.

### 5.3 Student-visible interface
Top to bottom [RUNTIME/VISUAL]:
1. Workspace title «الأنشطة التفاعلية», level tabs «مستوى المناولة [مبتدئ] [متقدم]», and the lead «ابدأ بالمستوى المبتدئ، ثم انتقل إلى المتقدّم…».
2. Shell title «جرّب: 15 لاعبًا في 3 فرق متساوية» and the badge «مناولة».
3. Mission «مهمتك: كوّن 3 فرق متساوية: اسحب كل لاعب إلى فريق.»
4. Lead «اسحب كل لاعب إلى فريق. ثم جرّب 16 لاعبًا: ماذا يحدث؟». The drag instruction is repeated twice.
5. Progress chips «جرّب › اكتشف › صِغ القاعدة».
6. Buttons: «إعادة», «تلميح 0/3», «أنشئ الفرق», «إظهار الشرح».
7. Stage:
   - «عدد الفرق» tiles 2–6 (3 filled green).
   - «عدد اللاعبين» tiles 12, 15, 16, 18, 20 (15 filled green).
   - Three drawn vertical pitches (2:3), each labelled «الفريق i» with a `0/5` badge and «ضع لاعبًا هنا».
   - Dashed bench «خارج الفرق» with a count and 15 drawn players.
8. Under the lab: the source tag.

### 5.4 Touch / tap
[CODE [useDragInteraction.js](../../apps/web/src/lessons/common/manipulations/useDragInteraction.js), RUNTIME]

- **What can be tapped:** every player (a `<button>` via `DraggableObject`), every team zone and the bench (`role="button"`), and the number tiles.
- **First tap on a player** picks it up:
  - `held = player:n`, `aria-pressed=true`, a blue ring and scale-105.
  - Every zone gets `data-drop-ready` (tinted) — **including zones that will refuse** [RUNTIME: "ready zones 4"].
  - No mathematical state changes.
- **Second tap on the same player** puts it down. Tap is a toggle.
- **Tap on a zone while holding** calls `tryDrop`:
  - accepted → the player moves and `held` clears;
  - refused → the player **stays held**, shakes 500 ms, and the Arabic reason appears.
- A tap on a player *inside* a zone does not immediately drop it back, thanks to the `bubbledFrom` guard.
- **Number tiles** change the scene immediately (see 5.15).
- **Touch specifics:**
  - Pointer events with `setPointerCapture` and `touch-action: none` on sources.
  - The threshold is exactly `< 6 px` = tap ([useDragInteraction.js:124](../../apps/web/src/lessons/common/manipulations/useDragInteraction.js#L124)); the contract is **verified**.
  - A finger that starts on a player cannot scroll the page.
- **Target sizes** [RUNTIME]:
  - bench players **34 × 46 px** at every width (below 44 px in width);
  - placed players 50–61 px wide;
  - tiles **40 × 40 px**;
  - shell buttons and level tabs ≥ 44 px.

### 5.5 Drag
- Drag starts after ≥ 6 px of movement. `held` is set, `dragging=true`, and a `DragGhost` (portal, 36 px player, scale 1.08) follows the pointer centred on it.
- The original stays in place, ringed.
- **Magnet:**
  - If the pointer is over any zone of this instance, that zone is the target.
  - Otherwise the nearest zone within **56 px** is the target ([useDragInteraction.js:32](../../apps/web/src/lessons/common/manipulations/useDragInteraction.js#L32), [:71](../../apps/web/src/lessons/common/manipulations/useDragInteraction.js#L71)).
  - The target gets `data-drop-active` (filled background and ring).
  - **CONTRACT** says "the nearest *valid* zone". **IMPLEMENTATION** highlights the nearest zone **whether or not it will accept** [RUNTIME: hovering a team that will refuse → `data-drop-active=true`].
- **Release:**
  - Over or near a zone → `tryDrop`: accepted moves the player; refused shakes and shows the reason.
  - **In empty space → the player stays "in hand"** (`held` persists) so the tap path can take over ([useDragInteraction.js:137-139](../../apps/web/src/lessons/common/manipulations/useDragInteraction.js#L137-L139)) [RUNTIME: held=1].
  - **After a refused drop the player also stays held** [RUNTIME].
- **When the maths changes:** state changes **only on release/accept**; nothing changes during the drag.
- **Auto-scroll:** there is none during a drag (see Responsive).

### 5.6 Drop

| Zone | Accepts | Refused (reason key → Arabic) | Visual response | Mathematical consequence |
|---|---|---|---|---|
| `team:i` | a player, if after removing it from its current team the target size equals the smallest team size and is < q | `teamsMustStayEqual` → «التوزيع يجب أن يكون بالتساوي: هذا الفريق فيه {here} لاعبين، وأقلّ فريق فيه {min}. ضع اللاعب في فريق أصغر أولًا.» · `teamIsFull` → «هذا الفريق مكتمل: فيه {q} لاعبين مثل البقية. لم يعد فيه مكان.» · `sameTeam` → «هذا اللاعب في هذا الفريق بالفعل.» | rose `role=status` box under the bench; player shakes; zone border turns emerald when full; badge `k/q` | team size +1, bench −1; when no bench player can move → `settled` → equation |
| `bench` | a player who is in a team (always allowed) | player already on bench → **silent refusal** (`''`), deliberate (owner fix 2026-09-20) | bench tone amber when settled and inexact; benched figures tilted | team −1 → scene becomes un-settled → **equation disappears** [RUNTIME] |

### 5.7 Invalid actions
[RUNTIME unless noted]
1. **Fill one team first:** p0 → team 1, then p1 → team 1. Refused: «…هذا الفريق فيه 1 لاعبين، وأقلّ فريق فيه 0…». The player stays held; Escape releases it.
2. **16th player** when the teams are 5/5/5: refused with `teamIsFull`.
3. **Re-arranging when the teams are equal** (drag a team-1 player onto team 2 at 5/5/5): refused, message «هذا الفريق فيه **5** لاعبين، وأقلّ فريق فيه **5**». **Defect:** `onReject` computes `here`/`min` from the teams *before* removing the moving player, while `canPlace` reasons *after* removal ([TeamBuilder.jsx:166-169](../../apps/web/src/lessons/common/manipulations/divisibility/TeamBuilder.jsx#L166-L169) vs [logic/teamBuilder.js:64-68](../../apps/web/src/lessons/common/manipulations/logic/teamBuilder.js#L64-L68)). The explanation contradicts itself.
4. **Small drag inside the player's own team** (15 px): rose reproach «هذا اللاعب في هذا الفريق بالفعل.» for a no-op. This is the same defect class the owner fixed for the bench.
5. **Drag to empty space:** the player remains held and nothing is explained.
6. **Tiles:** every tile is a valid configuration (squads 12–20 ≥ teams 2–6); no invalid tile exists.

### 5.8 Feedback

| Moment | What appears | Class |
|---|---|---|
| pick-up | ring, zones tinted | PURELY UX |
| accepted drop | player drawn on the pitch in a formation (`teamFormation`), badge `n/q`, bench count −1 | MATHEMATICAL |
| refusal | shake + Arabic reason naming the on-screen numbers | PEDAGOGICAL (equal-parts rule) |
| settled, exact | emerald box: KaTeX `15 = 3 × 5` + «كل فريق فيه 5 لاعبين، ولم يبقَ أحد خارج الفرق.»; bench «لا أحد خارج الفرق: الجميع يلعب.» | MATHEMATICAL → symbolic |
| settled, inexact | amber box `16 = 3 × 5 + 1` + «…ويبقى 1 خارج الفرق.» + amber fix line «لو زدنا 2 لاعبين أو أنقصنا 1، لَتَشكّلت 3 فرق متساوية تمامًا.»; bench amber, benched player tilted | MATHEMATICAL + PEDAGOGICAL (nearest multiples) |
| discovery | green panel «ماذا لاحظت؟ متى لا يبقى أحد خارج الفرق؟» + 3 options | PEDAGOGICAL |
| wrong conjecture | e.g. «جرّب 16 لاعبًا في 3 فرق: 16 زوجي، ومع ذلك يبقى لاعب خارج الفرق.» | PEDAGOGICAL (counter-example) |
| formal | `a = b × q + r` + «a عدد اللاعبين، b عدد الفرق، q …، r …» + «إذا كان r = 0 فإن b قاسم للعدد a…» | FORMALIZATION |

Sound: none.

Note on the exact case: the equation drops "+ 0" (`15 = 3 × 5`) [CODE [TeamBuilder.jsx:196](../../apps/web/src/lessons/common/manipulations/divisibility/TeamBuilder.jsx#L196)], while the books lab and the module's questions write `… + 0`.

### 5.9 Hints
```
No hint → Hint 1 «ضع لاعبًا في كل فريق بالتناوب: الفرق يجب أن تبقى متساوية.»
        → Hint 2 «عندما تمتلئ الفرق، انظر إلى من بقي خارجها: كم عددهم؟»
        → Hint 3 «جرّب عددًا آخر من الفرق: هل تجد عددًا لا يبقى معه أحد خارج الفرق؟»
        → (no worked explanation step; «إظهار الشرح» is a separate toggle)
```
- **Trigger:** student-requested only (counter `n/3`). Hints are cumulative (earlier ones greyed, latest amber) and the button is disabled after 3 [RUNTIME].
- **State:** hints do not depend on the manipulation's state (the same text in every state) and are **reset** on every number change or «إعادة» [RUNTIME].
- **Value:** none reveals the answer. Hint 1 restates the refusal rule; hint 3 narrows the search to "another number of teams". The hints never disappear on mastery.

### 5.10 Discovery
- **Exact condition** [CODE [TeamBuilder.jsx:110-128](../../apps/web/src/lessons/common/manipulations/divisibility/TeamBuilder.jsx#L110-L128)]:
  - When the scene is `settled` and not stale, `tried["total:groups"] = v.exact` (first verdict per key only).
  - `contrastSeen = tried` contains both `true` and `false`, which triggers `state.discover()`.
  - The effect is also keyed on `state.epoch`, so discovery is **re-asserted after every reset**.
- **The formal rule never appears before discovery inside the conjecture flow.** But:
  - **It can appear earlier via «إظهار الشرح».** That toggle is available from the initial state and prints «…عندما يكون r = 0 نقول إن b قاسم للعدد a» plus the registry `shows` line containing `a = b × q + r` [RUNTIME, clicked in phase `act`].
  - The live equation (`15 = 3 × 5`) is intentionally shown in phase `act`. The e2e "result not before اكتشف" check only asserts `data-phase === 'act'` [TEST], so "result" means the formal rule, not the equation.
- **Reachable without understanding:** yes. «أنشئ الفرق» on 15/3, tap 16, «أنشئ الفرق» opens discovery with **zero players moved by hand** (`unlock: 'config'`).
- **Conjecture is requested before the rule:** yes (three options; only the correct one formalizes; wrong ones explain and can be retried without limit).
- **After discovery:** the free-lab toggle «مختبر حرّ» appears (it already appears in `discover`, not only `formal`; [ManipulationFreeLab.jsx:24](../../apps/web/src/lessons/common/manipulations/ManipulationFreeLab.jsx#L24)).
- **Returning and retrying** is possible, with stale-state defects (5.15).

### 5.11 Formalization
- Formal block: `a = b × q + r`, the role of each letter in football words, and «إذا كان r = 0 فإن b قاسم للعدد a: التوزيع بالتساوي ممكن دون أن يبقى أحد.»
- This is the first appearance of «قاسم» in this lab.
- The module's own formalization (`KnowledgeBrick qasim-baqi`) sits in step 2 and speaks about **28 and 420**, not about the teams (see §8.5).

### 5.12 Mathematical state
- **Single source of truth:** `lab = { total, groups, bench[], teams[][] }` (player ids).
- **Derived:** `groupInto(total, groups)` → `perGroup q`, `leftOver r`, `exact`; `isSettled(lab)`; `fixLeftOver`.
- **Chain:**
  ```
  gesture → place/unplace(lab) → teams/bench → verdict(lab)
          → badge n/q · bench count · equation `${total} = ${groups} × ${q} [+ r]` · onVerdict
  ```
- **Parallel state:**
  - `tried` (discovery memory) lives **outside** `lab` on purpose (it survives number changes) and **also survives «إعادة»**.
  - `reject` is cleared on any scene change.
- **Visual/numeric agreement:**
  - Visual and number cannot disagree once settled. The equation uses `groupInto` (arithmetic), not the drawn bench. They coincide because the placement rule forbids anything else (tested across the domain in `autoComplete.test.js`) [TEST].
  - During partial states the equation is hidden.
  - The `n/q` badges show the target q from the start (`0/5`), so **the quotient is displayed before any sharing** — a number the gesture is supposed to produce.

### 5.13 Visual state
- Pitches are drawn SVG (`PitchBackdrop`).
- Players come in 3 team kits, and bench players are uniform.
- Formation geometry comes from `teamFormation.js` and is swept for no overlap [TEST].
- Full team: emerald zone and badge.
- Inexact settled: amber bench, benched figure tilted ("head down").
- Empty team: «ضع لاعبًا هنا».
- Refusal: 500 ms shake with a rose ring.
- Animations: CSS transform only; reduced-motion honoured (e2e AC7).

### 5.14 Numerical / symbolic mirror
Three numeric surfaces are all derived from `lab`:
- per-team `n/q` (LTR mono),
- bench count,
- the KaTeX equation plus the Arabic note.

The symbol appears **only when settled**, directly under the stage, in an `aria-live="polite"` container.

### 5.15 Reset
[RUNTIME]
- **«إعادة»:**
  - resets `phase→'act'`, hints, the explanation toggle and `epoch+1` (so `lab` is rebuilt);
  - does **not** restore the numbers (they stay e.g. 15/3 or whatever was last chosen) and does **not** clear `tried`.
  - The discovery effect re-fires immediately: **after «إعادة» the discovery panel is still open** (phase `discover`).
- **Tile change after formalization:**
  - phase drops to `act`, then is immediately re-raised to `discover`;
  - the formal block disappears, but the discovery options keep their previous `pick` (**the correct option stays green/`aria-pressed=true`** while the rule is hidden). A second click re-formalizes.
- **Level round trip:** survives (tabs keep both panels mounted) [RUNTIME, TEST W2].
- **Module-level `teamsSeen`** is never reset.

### 5.16 Accessibility
[CODE/RUNTIME]
- The whole task works **without dragging**: keyboard (Tab to player, Enter; Tab to team, Enter; Escape releases) and tap-tap. Verified; focus stays on the zone after a keyboard drop.
- Players are `<button>` elements with labels «لاعب n خارج الفرق» / «لاعب n في الفريق t» and `aria-pressed`.
- Zones are `role="button"` with `aria-label` «الفريق i» / «خارج الفرق». That label **overrides the inner text**, so a screen reader **does not hear `3/5`** or the bench count.
- **Nested interactive controls:** buttons inside `role=button`.
- The refusal text is `role=status`; the representation is `aria-live=polite`; discovery options are buttons with `aria-pressed`; hints use an `sr-only` numbering.
- **Tab order:** 10 tiles, then 3 zones with their players, then the bench, then 15 bench players. A keyboard user must Shift+Tab from the bench back to the teams for every player.

### 5.17 Responsive behaviour
[RUNTIME]

| Viewport | Pitch columns / size | Team 1 top → bench top | Bench player | Notes |
|---|---|---|---|---|
| 375×667 | 1 col, 193×290 | **1003 px** (> viewport) | 34×46 | workspace starts at pageY 1173; first bench player at pageY **3252** (≈ 4.9 screens down); stage only 239 px wide |
| 390×844 | 1 col, 208×312 | **1070 px** | 34×46 | |
| 768×1024 | 2 cols, 223×335 | 747 px | 34×46 | |
| 1024×768 | 3 cols, 198×297 | 319 px | 34×46 | |
| 1280×800 | 3 cols, 235×352 | 374 px | 34×46 | |

- With 20 players / 6 teams at 375 px: team 1 → bench = **2040 px**; document height 7957 px.
- **A real drag from the bench to team 1 or 2 is physically impossible on a phone**: both ends cannot be on screen, the hook has no auto-scroll, and `touch-action:none` blocks scrolling while holding. Tap-tap works (e2e W3).
- No horizontal scroll at any width.
- Controls sit above the stage; they do not move under the finger (§16bis respected).

### 5.18 Levels
Inside the workspace this is the **مبتدئ** panel only.
- The type's own advanced preset (42/5) is **not used** in this lesson.
- `isAdvanced` would hide the tiles, but it is never true here.
- The two levels of M1 are two **different types and two different mathematical models** (see §8).

### 5.19 Tests
- **Pass:**
  - e2e W1 (drag, tap, keyboard, explained refusal, 15 = 3 × 5, 16 = 3 × 5 + 1, discovery after both cases, formal after correct conjecture)
  - W2 (state survives a round trip)
  - W3 (320 px)
  - AC1–AC8
  - `autoComplete.test.js` (domain sweep)
  - `teamFormation.test.js`
- **Not tested:**
  - refusal-message numbers
  - `sameTeam` UX
  - «إعادة» leaving discovery open
  - stale conjecture `pick`
  - «إظهار الشرح» before discovery
  - drag reachability on phones
  - bench target width (W3 checks height only)

### 5.20 Findings (this instance)

| # | Type | Finding | Evidence |
|---|---|---|---|
| M1-F1 | RUNTIME | Refusal message says «فيه 5… وأقلّ فريق فيه 5» when re-arranging an equal configuration | probe 1 |
| M1-F2 | RUNTIME | Moving a player within its own team produces a rose reproach («في هذا الفريق بالفعل») | probe 1 |
| M1-F3 | RUNTIME | «إعادة» keeps the discovery open and the numbers unchanged | probe 1 |
| M1-F4 | RUNTIME | After formalization, a number change hides the rule but leaves the correct option shown as selected | probe 1 |
| M1-F5 | RUNTIME | The formal rule is readable before discovery via «إظهار الشرح» | probe 1 |
| M1-F6 | CODE/RUNTIME | Discovery is reachable with zero manual moves (`unlock:'config'`). The component header claims «Le premier partage se fait à la main», which is not enforced | registry, AC1 |
| M1-F7 | CODE | The magnet lights refusing zones (contract says valid zone) | probe 3 |
| M1-F8 | RUNTIME | Bench drag unusable at ≤ 390 px (bench ≥ 1000 px below team 1) | probe 2 |
| M1-F9 | RUNTIME | Bench players 34 px wide (< 44 px) | probe 2 |
| M1-F10 | RUNTIME | Arabic count agreement: «فيه 1 لاعبين», «لو زدنا 2 لاعبين», «كوّن 2 فرق», «30 لاعبين» (free lab) | probe 1 |
| M1-F11 | CODE | The `q` target is shown in badges (`0/5`) before any sharing | [TeamBuilder.jsx:346](../../apps/web/src/lessons/common/manipulations/divisibility/TeamBuilder.jsx#L346) |
| M1-F12 | CODE | «خارج الفرق» names both the starting pile (15) and the remainder (1): one zone, two mathematical meanings | [TeamBuilder.jsx:384-418](../../apps/web/src/lessons/common/manipulations/divisibility/TeamBuilder.jsx#L384-L418) |

### 5.21 State machine

| State | Student action | Internal change | Visual result | Mathematical meaning | Next |
|---|---|---|---|---|---|
| S0 initial (`act`) | — | `lab=init(15,3)` | 3 empty pitches, 15 on bench, badges 0/5 | nothing shared | S1 / S-tile / S-AC |
| S1 holding | tap/drag start on player | `held=player:n` | ring, zones tinted | — | S2 / S3 / S0 |
| S2 partial | accepted drop | `place` | player on pitch, badge +1 | partial sharing | S1 / S4 / S5 |
| S3 refused | drop on unequal/full team | `attempts+1` (unread); `reject={reason}` | shake + rose text; player still held | "equal parts" enforced | S1 |
| S4 settled exact | last legal drop / AC | `settled && exact`; `tried[k]=true` | emerald equation, empty bench | n = k × q, r = 0 | S-tile |
| S5 settled inexact | last legal drop / AC | `settled && !exact`; `tried[k]=false` | amber equation + fix line, tilted bench player | n = k × q + r, 0 < r < k | S-tile |
| S-tile | tap a tile | `setNumbers` → reset → new `lab` | fresh scene | new question | S0′ |
| S6 discover | contrast seen | `phase='discover'` | green panel, 3 options, free-lab toggle | conjecture | S6b / S7 |
| S6b wrong | wrong option | `pick=i` | rose explanation | counter-example | S6 / S7 |
| S7 formal | correct option | `phase='formal'`; `onFinished` reported | formal block | rule | S-tile (→ S6 with stale pick) |
| S-reset | «إعادة» | phase act → re-discover; hints 0; `lab` rebuilt; numbers kept | empty scene **with discovery panel** | — | S6 |

The canonical `initial → acting → valid intermediate → invalid attempt → completed → discovery → formal` path exists, with two extra states (S-reset "empty scene + open discovery", and S7→S6 with a stale pick) that the contract does not describe.

### 5.22 Touch-the-math chain

| Link | Rating | Why |
|---|---|---|
| PHYSICAL OBJECT (a player) | CLEAR | drawn, countable, draggable |
| ACTION (carry into a team) | CLEAR on desktop / PARTIAL on phones | tap-tap only on phones |
| MATHEMATICAL STATE (team sizes, bench) | CLEAR | |
| VISUAL CONSEQUENCE | CLEAR | players in formation; the leftover stands tilted |
| NUMBER (q, r) | PARTIAL | q shown as target before sharing; r = bench count, but the bench also holds the unshared pile |
| SYMBOL (n = k × q + r) | CLEAR | appears when settled, colour-coded |
| CONCEPT (k divides n) | PARTIAL | needs the contrast plus the conjecture; can be bypassed via auto-complete and «الشرح» |

### 5.23 Literal student script
**Successful path (desktop).**
1. The student sees three empty green pitches labelled «الفريق 1/2/3», each showing «0/5», and 15 players standing in a hatched box «خارج الفرق».
2. The mission says «كوّن 3 فرق متساوية: اسحب كل لاعب إلى فريق».
3. They press a player; it gets a blue ring and all zones tint.
4. They drag it onto team 1; the pitch highlights under the finger; on release the player appears on the pitch and the badge reads «1/5».
5. They try a second player into team 1; it shakes back and a rose box explains that teams must stay equal («…فيه 1 لاعبين، وأقلّ فريق فيه 0…»).
6. They alternate teams. After 15 players every badge is green «5/5», the bench says «لا أحد خارج الفرق», and a green box shows `15 = 3 × 5`.
7. They tap «16». The scene empties and 16 players wait. They fill the teams again; the 16th cannot enter any team («هذا الفريق مكتمل…») and stays tilted on an amber bench. An amber box shows `16 = 3 × 5 + 1` and «لو زدنا 2 لاعبين أو أنقصنا 1…».
8. A green «ماذا لاحظت؟» panel appears. They choose «عندما يكون عدد الفرق قاسمًا…» and the rule `a = b × q + r` with «إذا كان r = 0 فإن b قاسم للعدد a» appears.

**Incorrect path.** They pick «عندما يكون عدد اللاعبين زوجيًّا.» → «جرّب 16 لاعبًا في 3 فرق: 16 زوجي، ومع ذلك يبقى لاعب خارج الفرق.» They can pick again.

**Retry path.**
- Tapping «15» after the rule: empty scene, discovery panel still shown, rule gone, correct option still green.
- «إعادة»: same.

**Hint path.** «تلميح» three times → three cumulative lines; the button then greys out.

**Auto-complete path.** On load, the student taps «أنشئ الفرق»: players fly into the teams one per ~60 ms (≈ 0.9 s), then `15 = 3 × 5`. Tap 16, «أنشئ الفرق» → discovery opens. No hand gesture required.

**Keyboard path.** Tab to a bench player → Enter (pressed) → Shift+Tab to «الفريق 1» → Enter → the player moves; Escape drops what is held.

**Phone path (375 px).** The student scrolls ~3 screens past the brief to reach the lab. The mission says "drag", but team 1 and the bench are never on screen together. Taps work: tap a player at the bottom, scroll up ~1000 px, tap a team.

---

## 6. Manipulation 02 — `divisor-explorer-books`, متقدم (420 books)

### 6.1 Purpose
The textbook situation itself: 420 books, compare 26 and 28 per shelf, see what stays on the floor. The header says «Choosing a shelf size IS the experiment» [CODE [DivisorExplorerBooks.jsx:36-39](../../apps/web/src/lessons/common/manipulations/divisibility/DivisorExplorerBooks.jsx#L36-L39)].

The **five questions are not stated in the file header**, contrary to contract §1. Answered from the code:
- **A** a shelf-size button
- **B** quotition 420 ÷ b
- **C** all shelves redraw; leftovers on the floor
- **D** `420 = b × q + r`
- **E** nothing is formally requested inside the lab

### 6.2 Initial state
[RUNTIME]
- `capacity = 28` internally (default `initialCapacity`), `revealed = false`, `tried = {}`.
- Screen shows «📦 420 كتابًا تنتظر مكانها», a pile of 3 drawn books, and status «الكتب في كل رف: — · الرفوف الممتلئة: —».
- Contrast button reads **«🔄 جرّب 26»**. It is derived from the hidden `capacity=28`, i.e. a shortcut exists before any choice.
- The module step 1 shows «في المستوى المتقدّم من المناولة أعلاه، جرّب الحجمين 26 و 28 أولًا.»

### 6.3 Student-visible interface
[VISUAL 1280 / 375]
1. Kicker «🎮 لعبة المكتبة · استكشف بنفسك», title «جرّب: كم كتابًا في كل رفّ؟», lead «…ابدأ بـ 26 ثم 28.»
2. Mission box «المهمة: وزّع الكتب بالتساوي على الرفوف» and «📚 420 كتابًا».
3. **17 size buttons** (10 12 14 15 16 18 20 21 25 26 28 30 32 35 40 42 60).
4. «🔄 جرّب X» and «↺ ابدأ من جديد».
5. After a choice: result card (emoji, sentence, equation), pills (✓/✕, «عدد الرفوف», «الباقي»).
6. Scene «مكتبة المدرسة» with status, shelves grid, the floor, and a help line.
7. Classroom entry «عرض المناولة» only for presenter roles (0 for an anonymous visitor [RUNTIME]; see §8.4).

### 6.4 Touch / tap
- The **only gesture is a tap on a size button** (real `<button>`, `aria-pressed` when active).
- One tap performs the whole experiment at once: `capacity=value`, `revealed=true`, `tried[value]=divides`, `onVerdict`.
- Tapping the active size again re-runs the same state (idempotent).
- There is no selection-then-confirm, no undo other than choosing another size, and no drag.
- Buttons are **54 × 48 px** at every width (≥ 44 px) [RUNTIME]. Hover lifts the button; a tried button gets a ✓ (green) or ✕ (red) corner badge via CSS `::after` and a `title` tooltip.

### 6.5 Drag
None. Contract line 62: «Its gesture is a choice, not a drag.»

### 6.6 Drop
Not applicable. No drop zones exist; books are not objects the student moves.

### 6.7 Invalid actions
There are none: every one of the 17 sizes is valid (all ≤ 420). A "wrong" choice (a non-divisor) is not an error; it is a result with a remainder.

### 6.8 Feedback
Exact strings [RUNTIME]:

| Size | Result sentence | Equation | Floor |
|---|---|---|---|
| 26 | «📖 توقّف! بقيت 4 كتب خارج الرفوف. كوّنا 16 رفوف ممتلئة، ثم بقيت 4 كتب.» | `420 = 26 × 16 + 4` | red tray, badge 4, «لا تكفي لملء رفّ جديد من 26 كتابًا», 4 tilted books |
| 25 | «…بقيت **20 كتب**… كوّنا **16 رفوف**…» | `420 = 25 × 16 + 20` | 20 books |
| 28 | «🎉 رائع! كل الكتب دخلت الرفوف. كوّنا **15 رفوف**، في كل رف 28 كتابًا.» | `420 = 28 × 15 + 0` | green «الأرض فارغة: كل كتاب وجد مكانه في رفّ.» |
| 10 | «…كوّنا **42 رفوف**، في كل رف **10 كتابًا**.» | `420 = 10 × 42 + 0` | green |
| 16 | «…بقيت 4 كتب… كوّنا 26 رفوف…» | `420 = 16 × 26 + 4` | 4 books |

- **Divisors among the candidates:** 10, 12, 14, 15, 20, 21, 28, 30, 35, 42, 60 (11 of 17).
- **Non-divisors:** 16 (r4), 18 (r6), 25 (r20), 26 (r4), 32 (r4), 40 (r20).
- **Classification:**
  - the sentence is PEDAGOGICAL/UX («رائع!/توقّف!» evaluative tone);
  - the equation and pills are MATHEMATICAL;
  - the floor hint «لا تكفي لملء رفّ جديد» is **the r < b condition in words** (MATHEMATICAL).
- **Arabic number agreement is wrong** for most quotients (e.g. «15 رفوف», «42 رفوف»), for r = 20 («20 كتب»), and for b = 10 («10 كتابًا»).

### 6.9 Hints
**None.**
- No hint system (no shell).
- Static texts only: mission sub-line «جرّب عددًا واحدًا في كل رف…» and the help line «💡 لا نخبرك بالإجابة قبل التجربة…».
- The "contrast" button is a structural scaffold: it proposes the other member of the textbook pair (26 ↔ 28); for any other size it proposes 26.

### 6.10 Discovery
**No discovery phase exists in the lab**:
- no `phase`, no conjecture, no "both verdicts seen" condition;
- the verdict (✓/✕, "divides" semantics) is shown on the **first tap**.

The divisor vocabulary leaks through the `title` tooltip of tried buttons: «28 **قاسم**: لا يبقى شيء» / «26 **ليس قاسمًا**: يبقى 4» [RUNTIME]. On desktop hover, the word «قاسم» is read before the module formalizes it.

Discovery is delegated to the module's steps (§8.5), which are **not gated on the manipulation**.

### 6.11 Formalization
Not in the lab. The module does it:
- Step 1 `TapQuestion` «أي الكيفيتين أنسب…» (`explain` writes both equalities).
- Step 2 `KnowledgeBrick qasim-baqi` with lead «الباقي معدوم: هذا بالضبط ما يجعل 28 قاسمًا للعدد 420.», then the question «ماذا يمثّل العدد 28 بالنسبة إلى العدد 420؟» — **the brick just above states the answer**.
- A remark on 26.

### 6.12 Mathematical state
- **Single source of truth:** `capacity` + `revealed` (+ `tried` memory).
- Everything is recomputed from `total` and `capacity` each render: `quotient = floor(total/capacity)`, `remainder = total % capacity`, shelves `[0..q)`, floor books `[q·b .. total)` [CODE [DivisorExplorerBooks.jsx:242-244](../../apps/web/src/lessons/common/manipulations/divisibility/DivisorExplorerBooks.jsx#L242-L244), [:335-338](../../apps/web/src/lessons/common/manipulations/divisibility/DivisorExplorerBooks.jsx#L335-L338)].
- The visual and the number cannot disagree: every book is drawn, and the counts were verified (e.g. 416 on shelves + 4 on the floor for 26) [RUNTIME].
- The arithmetic is **computed inline**, not through core `divmod` or `logic/divisorExplorer.js`.

### 6.13 Visual state
- Every book is a hand-drawn SVG (cover, spine, pages, 7-colour palette).
- Shelves are cards «رف i» with `n/b` and a wooden plank. A shelf of ≥ 29 books spans the full grid row.
- The floor is a red dashed tray with tilted, outlined books.
- Animations: books drop in (0.34 s), floor pops; reduced-motion supported.
- **The shelves grid is a fixed-height scroll box:** 420 px on desktop, 360 px under 720 px.
  - 1280 px: 26 → scrollHeight 1268 vs 420 visible; 10 → 1629 vs 420.
  - 375 px: 26 → 4166 vs 360; 10 → 6818 vs 360.
  - So the "every shelf is drawn so the student can count them" intent is visually undermined: most shelves are hidden in an internal scroll [RUNTIME].
- **Shelves wrap into several rows.** At 375 px a 26-book shelf is 4 rows of ~7 books. At 1280 px a 13-book shelf (M3) wraps 11 + 2. "One shelf = one row" does not hold [VISUAL].
- At 375 px the scene header status «الكتب في كل رف / الرفوف الممتلئة» is **clipped and overlapped** (fixed 42 px sky row) [VISUAL] — a §17bis violation.

### 6.14 Numerical / symbolic mirror
- Plain-text LTR equation (not KaTeX): `q` part violet, `r` part red, `white-space:nowrap`.
- It fits at every width tested (207–241 px wide) [RUNTIME].
- Mirror of state: «عدد الرفوف: q», «الباقي: r», the status bar, and each shelf's `n/b`.
- **Layout order:** result card above the scene. On a phone, after tapping a size (pageY ~1866–2138), the result is at ~2214, the scene at ~2518 and the floor at ~2943. At 1280×800 the floor is ~820 px below the buttons. **The physical consequence (books on the floor) is usually off-screen at the moment of the tap** [RUNTIME].

### 6.15 Reset
- «↺ ابدأ من جديد» → `capacity=initialCapacity`, `revealed=false`, `tried={}` (badges cleared) [RUNTIME].
- It does **not** notify the module: the step-1 advisory stays hidden (`bothTried` stays true) [RUNTIME].
- Level round trip in M1 preserves the state (workspace).

### 6.16 Accessibility
- The task is fully doable by keyboard (Enter/Space on real buttons; Tab moves along the rail) [RUNTIME].
- `aria-pressed` on the active size.
- The verdict badge is a CSS `::after` glyph (enters the accessible name per the e2e comment) plus a `title` tooltip.
- **No live region announces the result for a non-divisor.** The floor is `role=group`; only the empty-floor text is `role=status` [RUNTIME: 0 live regions after 26].
- Books are `aria-hidden`; shelves carry `aria-label` on a role-less `div` (ignored by most assistive tech).
- **Hard-coded Arabic**, not i18n (contract §7ter step 6).

### 6.17 Responsive behaviour
- The 17-button rail is 272 px tall (5 rows) at 375 px; 104 px (2 rows) at 1280 px.
- Grid columns: 1 at ≤ 768 px, 2 at 1024 px, 3 at 1280 px.
- Book size is fixed at 22 × 46 px outside Classroom Mode.
- No horizontal scroll.
- Clipped sky header at 375 px (6.13).
- Classroom Mode solves the grid for the screen (tested C1–C3).

### 6.18 Levels
- In M1 this is the **متقدم** panel of a workspace; `setup=null`, so no own selector.
- The lesson's `autonomy`: «سبعة عشر حجمًا دون اقتراح».
- **Implementation:** the lab *does* suggest — the lead says «ابدأ بـ 26 ثم 28» and the contrast button proposes 26/28. The autonomy claim is only partially realised.

### 6.19 Tests
- e2e L1 (22 checks: nothing before choice, 26 → 16 shelves + 4 books, 28 → 15 + 0, 25 → 20, 10 → 42 shelves, 60, 35, Enter, contrast, reset), W2, C1–C3 [TEST: all pass].
- No unit test of the lab's arithmetic or of `contrastCandidate`.

### 6.20 Findings (this instance)

| # | Type | Finding |
|---|---|---|
| M2-F1 | CODE | No discovery or conjecture phase; the ✓/✕ verdict and the equation appear on the first tap |
| M2-F2 | RUNTIME | The tooltip names «قاسم» before formalization |
| M2-F3 | RUNTIME | The consequence (floor) is off-screen at the moment of the tap on phones and at 1280×800 |
| M2-F4 | RUNTIME/VISUAL | Shelves in a 360/420 px internal scroll; shelves wrap rows; clipped status bar at 375 px |
| M2-F5 | RUNTIME | Arabic count agreement errors («15 رفوف», «20 كتب», «10 كتابًا») |
| M2-F6 | RUNTIME | Result not announced to screen readers for non-divisors |
| M2-F7 | CODE | «Autonomy» contradicted by the lead and the contrast shortcut |
| M2-F8 | RUNTIME | Reset does not reset the module's `bothTried` advisory |
| M2-F9 | CODE | Five questions missing from the header; hard-coded Arabic; inline arithmetic |

### 6.21 State machine

| State | Action | Change | Visual | Math | Next |
|---|---|---|---|---|---|
| W waiting | — | `revealed=false` | pile + «420 كتابًا تنتظر» | — | R |
| R-exact | tap divisor b | `capacity=b`, `tried[b]=true` | q shelves, green floor, 🎉, ✓ badge | 420 = b × q + 0 | R-* / W |
| R-inexact | tap non-divisor b | `tried[b]=false` | q full shelves, red floor with r books, 📖, ✕ badge | 420 = b × q + r | R-* / W |
| W (reset) | «ابدأ من جديد» | all cleared | waiting | — | R |

No "discover" or "formal" state exists.

### 6.22 Touch-the-math chain

| Link | Rating |
|---|---|
| PHYSICAL OBJECT | PARTIAL — the student touches a **number**, not a book |
| ACTION → STATE | CLEAR |
| VISUAL CONSEQUENCE | CLEAR on desktop, but mostly scrolled away; PARTIAL on mobile |
| NUMBER | CLEAR (q, r pills, `n/b` per shelf) |
| SYMBOL | CLEAR, immediate |
| CONCEPT | WEAK inside the lab (no conjecture); delegated to the steps |

### 6.23 Literal student script
1. The student switches to «متقدم» and sees a pile of books, «420 كتابًا تنتظر مكانها», and 17 numbered buttons.
2. They tap 26. Sixteen shelves of 26 books fill in (partly hidden inside a scroll box), a red tray below shows 4 tilted books with «لا تكفي لملء رفّ جديد من 26 كتابًا», the card says «توقّف! بقيت 4 كتب…» and `420 = 26 × 16 + 4`, and 26 gets a red ✕.
3. They tap «🔄 جرّب 28». Fifteen shelves, the floor turns green «الأرض فارغة», `420 = 28 × 15 + 0`, green ✓.
4. They try 10 and see 42 shelves (must scroll inside the box to see them all).
5. They scroll down to step 1 and answer «28 كتابًا… ولا يبقى شيء».

**Keyboard:** Tab to 26, Enter; Tab, Space for the next size.

**Hint path:** none. **Auto-complete:** none (not applicable: each tap is a trial).

---

## 7. Manipulation 03 — `divisor-explorer-books`, معارف (143 books)

### 7.1 Purpose
Show the textbook example «11 قاسم للعدد 143» in the same library before reading the definition (module comment: "quotient → reste → verdict").

### 7.2 Initial state
[RUNTIME]
- Standalone lab with its **own selector «مستوى المناولة [مبتدئ] [متقدم]»**, مبتدئ active (= 143).
- Title «مثال الكتاب: 143 كتابًا في رفوف من 11».
- Lead «الكتاب يكتب: «11 قاسم للعدد 143». جرّب 11، ثم 12…».
- Three buttons 11, 12, 13. Contrast button «🔄 جرّب 12» before any choice. Waiting pile.

### 7.3–7.9 Interface, gestures, drop, invalid, feedback, hints
Identical mechanics to M2. Values [RUNTIME]:
- **12:** «بقيت **11 كتب**… كوّنا **11 رفوف**…» `143 = 12 × 11 + 11`
- **11:** «كوّنا **13 رفوف**، في كل رف 11 كتابًا.» `143 = 11 × 13 + 0`
- **13:** `143 = 13 × 11 + 0` (also exact, the quotient as divisor — not commented anywhere)

No hints.

### 7.10 Discovery
None in the lab. **The result is announced in the lead before any tap** («11 قاسم للعدد 143»). This is intentional here (a worked example of a definition), but M3 is a *confirmation*, not a discovery.

### 7.11 Formalization
In the module:
- step 1 definition box + example + «ما الذي يجعل 11 قاسمًا للعدد 143؟»
- step 2 `qasim-jidaa` (120 = 6 × 20)
- step 3 four phrasings + remarks

Steps are visible and answerable without touching the lab [RUNTIME].

### 7.12–7.15 State, visual, mirror, reset
As M2. Visual note: at 1280 px each 13-book shelf wraps into two rows (11 + 2) [VISUAL]. «ابدأ من جديد» resets the lab.

### 7.16 Accessibility
As M2, plus the selector: `role=tablist`, arrows, ≥ 44 px.

### 7.17 Responsive
Selector 295 × 84 at 375 px (wraps label and tabs); buttons 54 × 48.

### 7.18 Levels — **M3-F1**
- **CONTRACT / CONFIG:** `lesson.config.js` comment: «Un seul niveau ici — le module lit une définition, il ne rejoue pas la découverte».
- **CONTRACT:** `MANIPULATION_CONTRACT.md` line 64: the books lab «has no levels».
- **CONTRACT:** the same document, line 349, and the component comment say it poses its own selector when standalone.
- **IMPLEMENTATION / OBSERVED:** the selector is shown. **«متقدم» opens the full 420-book / 17-size lab** titled «تدرّب — مستوى متقدم» inside معارف. Switching level **remounts** the lab (`key={level}`), so a round trip loses the tried badges (0 after returning) [RUNTIME].

### 7.19 Tests
**None** (unit or e2e) for this instance.

### 7.20 Findings
| # | Type | Finding |
|---|---|---|
| M3-F1 | RUNTIME | A second level (the 420 lab) the lesson says does not exist; docs disagree with each other |
| M3-F2 | RUNTIME | Level switch loses state (unlike the workspace promise, although consistent with contract §7 for standalone labs) |
| M3-F3 | RUNTIME | 13 (= q) is also a divisor; the symmetric reading 143 = 13 × 11 is shown but never exploited, even though step 2 teaches exactly that symmetry with 120 = 6 × 20 |
| M3-F4 | TEST | Zero automated coverage |
| M3-F5 | RUNTIME | Arabic agreement («11 كتب», «11 رفوف», «13 رفوف») |

### 7.21 State machine
Same as M2: W → R-exact/R-inexact → W. Plus the level selector: beginner (143) ⇄ advanced (420) with a remount and state loss.

### 7.22 Touch-the-math chain
PARTIAL / CLEAR / CLEAR / CLEAR / CLEAR / WEAK — same as M2. The concept is stated before the action.

### 7.23 Student script
1. The student reads «الكتاب يكتب: 11 قاسم للعدد 143».
2. They tap 11: 13 shelves of 11, green floor, `143 = 11 × 13 + 0`.
3. They tap 12: 11 shelves, 11 books on the floor, `143 = 12 × 11 + 11`.
4. They may tap «متقدم» and land in the 420 lab.
5. They scroll to the definition and answer.

---

## 8. Cross-manipulation analysis

### 8.1 Two architectures for one mathematical idea
M1 (shell: hints, phase, conjecture, free lab, drag engine, i18n, core arithmetic) and M2/M3 (standalone: tap, no phase, no hints, inline maths, hard-coded Arabic, own CSS, Classroom layout solver) teach the same equality **in the same module, one tab apart**. The student meets two different feedback grammars:
- conjecture panel vs none;
- `15 = 3 × 5` (KaTeX, no "+ 0") vs `420 = 28 × 15 + 0` (plain text, "+ 0").

### 8.2 Partition vs quotition — the divisor changes role between tabs

| | Team-builder (مبتدئ) | Books (متقدم) |
|---|---|---|
| What the student fixes | number of groups k | size of a group b |
| What emerges | size of each group q | number of groups q |
| What "divisor" names | «عدد الفرق قاسم لعدد اللاعبين» | «28 (كتب في كل رف) قاسم للعدد 420» |

- **Correctness:** both are correct.
- **The switch is never made explicit:**
  - The module's step-2 bridge text says «عندما لا يبقى أحد خارج الفرق، يكون عدد الفرق قاسمًا لعدد اللاعبين» directly next to «28 قاسم للعدد 420» (28 = books per shelf).
  - The formal note of M1 defines `b = عدد الفرق`, while in M2 `b` = books per shelf.
- This is the most important mathematical-representation observation for the redesign.

### 8.3 Levels (M1 workspace)
**Cognitive difference, as implemented:**
- **مبتدئ:** carry 15–20 objects by hand under an "equal parts" constraint; see the remainder emerge as a *person who cannot be placed*; the conjecture is requested.
- **متقدم:** no carrying; choose a divisor candidate among 17; read the whole arrangement at once; no conjecture; compare trials through ✓/✕ badges.

**Assessment:** the advanced level **removes** the gesture that produces the remainder rather than making it harder. It replaces "produce" with "select and read". The advanced level is a new laboratory (a different type), opened explicitly by the student via the tab. State survives the tab round trip.

**Default level.**
- **CONTRACT** (§7bis-levels, guide §6): a module «نشاط N» must default to `advanced`.
- **IMPLEMENTATION:** M1 is titled «نشاط 1 — 420 كتابًا في رفوف» but opens on football. The e2e block D explicitly whitelists this (`/15 لاعبًا|420/`, «voulue»), and M1's steps do not wait on `onFinished`. It is an undocumented exception in the contract text.

### 8.4 Classroom Mode
- **Manipulation class mode** (`ManipulationTeacherMode`: next step, replay, hide conclusion, show solution, change numbers):
  - Fully implemented for team-builder (`controller.autoStep`, `showSolution` = fill + discover + formalize).
  - **Unreachable** (`allowModeSwitch=false`) [CODE; e2e asserts no toggle].
  - Never exercised by any test (contract line 697).
- **Platform Classroom Mode:**
  - Only the books lab embeds its own entry «عرض المناولة» (`ClassroomPresentation scope="manipulation"`).
  - Presentation mode: fullscreen or overlay fallback, toolbar, scale 0.55–1.25, head/help hidden, larger buttons (64 px × scale), shelves grid solved for the screen, state preserved on enter/exit [TEST C1–C3].
  - **The entry is shown to `student` accounts**: `CLASSROOM_PRESENTER_ROLES = ['admin','teacher','student']`, «réglage temporaire» by owner decision ([packages/core/auth.js:30](../../packages/core/auth.js#L30)). It is not teacher-only today.
  - No teacher-only *pedagogical* control (solution reveal, hidden conclusion) reaches students through either path.
- **Team-builder under platform presentation:** only as part of a presented module. Not verified in this audit.

### 8.5 Learning-point connection and "knowledge before demand"

| Manipulation | LP | Brick | Formal rule where | Later demand |
|---|---|---|---|---|
| M1 teams | P1 | none in the lab (formal block is lab-local) | lab formal block | M1 step 2 Q (about 28/420), not about teams |
| M2 books 420 | P1 (+P2 in resources) | `qasim-baqi` in M1 step 2 | brick after Q1 | Q2 «ماذا يمثّل 28…» answered verbatim by the brick lead above it; M3 ex-2 (div. by 6); M4 E1/E2 |
| M3 books 143 | P2 | `qasim-baqi`/`qasim-jidaa` | M2 steps 1–2 | M2 Q1–Q3; M4 E3 |

**Gating:** step N opens when step N−1 is *answered* (any answer), and the module completes when all steps are answered. **No step waits on any of the three manipulations** [CODE ContentModule/stepUnlock + RUNTIME]. **The manipulations are optional for progress.**

**Knowledge before demand:** respected formally (brick before question), but it turns Q2 into recognition of the sentence just read.

**P3/P4** have no manipulation.

### 8.6 Automatization and transfer
```
M1/M2 labs (drawn objects) → M1/M2 TapQuestions (symbolic MCQ)
 → M3 أوظّف: ex-1 choice of equality 1512 = 21 × 72 + 0; ex-2 integer set (80, 120, 295, 132 ÷ 6); ex-5 true/false («8 يقسم 4»)
 → M4 إختبار أولي: 5 timed MCQs (72 ÷ 5, 84 ÷ 12, 120 = 6 × 20, phrasings, divisors of 17)
 → practice content levels 1–5 (level 1 re-asks the 26/28 questions)
```
- Support is removed **in one step**: from fully drawn objects to purely symbolic items. There is no faded representation (e.g. a count without drawing).
- No later item requires or offers the manipulation.
- The only re-appearance of the concrete context is practice level 1 (26/28, as text).

### 8.7 Misconceptions — implemented vs not

| Misconception | Status | Where / how |
|---|---|---|
| "Sharing" need not be equal | **Implemented** (M1) | `teamsMustStayEqual` refusal with numbers; retry immediate |
| Remainder ≥ divisor / "one more group fits" | **Implemented** (M1 `teamIsFull`; M2 floor hint «لا تكفي لملء رفّ جديد») | text + drawing; no retry needed |
| Divisibility ⇔ even number | **Implemented** (M1 conjecture distractor + counter-example 16/3) | discovery panel |
| Divisibility ⇔ small divisor | **Implemented** (M1 distractor) | discovery panel |
| Remainder as a decimal (5.33 players) | **Implicit** — impossible by construction, never named | e2e asserts no 5.333 |
| Direction (28 مضاعف لـ 420) | **Not in any manipulation**; module Q2 distractor + explain | M1 step 2 |
| The quotient is also a divisor (143 = 13 × 11) | **NOT EXPLICITLY IMPLEMENTED** | M3 shows it silently |
| "Close to a divisor" (26 vs 28) | **NOT EXPLICITLY IMPLEMENTED** | contrast only |

`attempts` is counted in `logic/teamBuilder.js` and read by nothing.

### 8.8 Theme / world audit

| World | Objects | Mathematical role | Destroying the theme destroys… |
|---|---|---|---|
| football (M1) | players, pitches, bench | player = unit, team = part, bench = pile **and** remainder | the *refusal* argument (a player who "cannot enter") and the tilted leftover; the numbers alone would survive |
| library (M2/M3) | books, shelves, floor | book = unit, shelf = group of b, floor = remainder | the *countability* of 420 and the visible r books; but since the gesture is a button, the world is **watched, not handled** |

Both worlds are drawn SVG, and no raster image is used (CLAUDE.md rule respected). The football world is genuinely mathematical (constraint = definition). The library is mathematical as a *picture* of the division, and decorative as an interaction.

---

## 9. Action → consequence matrix

| Student action | UI state before | Mathematical state change | Visual change | Numerical change | Feedback | Discoverable idea |
|---|---|---|---|---|---|---|
| M1 tap/drag player → team with smallest size | acting | teams[i] += p; bench −= p | player in formation | badge `n/q` +1, bench −1 | none (success is the move) | equal sharing, one by one |
| M1 player → larger team | acting | none | shake, rose box | none | «التوزيع يجب أن يكون بالتساوي…» | parts must stay equal |
| M1 16th player → any team | 5/5/5 | none | shake, rose box | none | «هذا الفريق مكتمل…» | r < k: the extra one fits nowhere |
| M1 last legal move (exact) | partial | settled, exact; tried=true | emerald zones, empty bench | `15 = 3 × 5` | «كل فريق فيه 5…ولم يبقَ أحد» | r = 0 |
| M1 last legal move (inexact) | partial | settled, inexact; tried=false | amber bench, tilted player | `16 = 3 × 5 + 1` + fix line | «ويبقى 1 خارج الفرق» | r ≠ 0; nearest multiples |
| M1 second verdict of the opposite kind | settled | phase → discover | green panel | — | «ماذا لاحظت؟» | contrast → conjecture |
| M1 correct conjecture | discover | phase → formal | formal block | `a = b × q + r` | «إذا كان r = 0 فإن b قاسم للعدد a» | the rule |
| M1 wrong conjecture | discover | pick=i | rose explanation | — | counter-example | parity/size are not the cause |
| M1 tap tile (teams/squad) | any | new lab; epoch+1; hints reset | scene empties | badges `0/q'` | — | new question |
| M1 «أنشئ الفرق» | any valid | fill via canPlace | players fly in (~0.9 s) | as a manual last move | as above | none (mechanical) |
| M1 «إعادة» | any | lab rebuilt; phase act → discover again if contrast seen | empty scene (+ open discovery) | — | — | — |
| M1 «إظهار الشرح» | any | none | explanation panel | shows `a = b × q + r` | formal statement | rule **before** discovery |
| M1 player → bench | any | unplace | player back on bench | badge −1; equation hidden | — | — |
| M2/M3 tap size b | waiting / result | capacity=b; tried[b] | all shelves redraw, floor/green | q, r, equation, ✓/✕ | «رائع!/توقّف!» sentence | r = 0 ⇔ b divides a |
| M2/M3 «جرّب X» | any | same as tapping X | same | same | same | contrast 26 ↔ 28 |
| M2/M3 «ابدأ من جديد» | result | cleared | waiting pile | «—» | — | — |
| M3 tab «متقدم» | 143 | remount on 420 | 420 lab | — | title «تدرّب — مستوى متقدم» | — |

## 10. Student-visible state matrix

| State | Student sees | Student can do | Mathematical meaning |
|---|---|---|---|
| M1 initial | 3 empty pitches `0/5`, 15 on «خارج الفرق», tiles, 4 buttons | carry, tap tiles, auto-complete, hints, explanation | nothing shared yet (q already displayed as the target) |
| M1 first action | one player on team 1, `1/5` | continue, retract, refuse test | partial partition |
| M1 invalid attempt | shaking player, rose reason | pick another team, Escape | the equal-parts constraint |
| M1 completed exact | green badges, empty bench, `15 = 3 × 5` | change numbers | 3 divides 15 |
| M1 completed inexact | tilted player on amber bench, `16 = 3 × 5 + 1`, fix line | change numbers | 3 does not divide 16, r = 1 |
| M1 discovery | green «ماذا لاحظت؟» with 3 options | choose | conjecture |
| M1 formal | `a = b × q + r`, letters, r = 0 rule; «مختبر حرّ» | free lab (2–60 / 2–12) | definition via remainder |
| M1 retry after formal | empty scene, discovery panel, correct option still green, no rule | re-click, play | (stale) |
| M1 extreme 60/2 (free lab) | 30 players per pitch in rows of 4 (47 × 64 px at 1280) | — | 60 = 2 × 30 |
| M1 extreme 15/6 | 6 pitches of 2, 3 on the bench | — | 15 = 6 × 2 + 3 |
| M2 initial | pile, «420 كتابًا تنتظر», 17 buttons, «جرّب 26» | tap a size | — |
| M2 inexact (26) | 16 shelves (scrolled), 4 books on red floor, ✕ | tap another | 420 = 26 × 16 + 4 |
| M2 exact (28) | 15 shelves, green floor, ✓ | tap another | 420 = 28 × 15 + 0 |
| M2 extreme 10 | 42 shelves in a scroll box (1629 / 6818 px of content) | scroll inside | 420 = 10 × 42 |
| M2 extreme 60 | 7 full-width shelves of 60 | — | 420 = 60 × 7 |
| M2 extreme 25/40 | 20 books on the floor | — | r = 20 (largest reachable) |
| M3 initial | «11 قاسم للعدد 143» already written; 3 buttons; own level tabs | tap; switch to the 420 lab | example of a definition |

---

## 11. Pedagogical findings

| # | Problem | Evidence | Why it matters |
|---|---|---|---|
| P-1 | **Partition vs quotition switch is silent** (b = number of teams vs b = books per shelf) | §8.2; formal note vs step-2 bridge | the redesign must decide which meaning "b" carries for the lesson |
| P-2 | The books lab has **no conjecture/discovery**; the verdict and "قاسم" (tooltip) arrive on the first tap | §6.10 | the advanced (textbook) level is the least inquiry-driven |
| P-3 | **Manipulations are optional**: no step waits on them; Q1 options state the answer («ولا يبقى شيء»); the Q2 answer is in the brick lead above it | §8.5, RUNTIME | a student can finish M1 without touching either lab |
| P-4 | The formal rule is available before discovery via «إظهار الشرح» (and the `shows` line) | M1-F5 | contradicts «الشرح… ne le précède jamais» |
| P-5 | Discovery reachable with zero manual moves (auto-complete `config`) | M1-F6 | "manual first" is not enforced for the teams |
| P-6 | Advanced = select-and-read replaces produce-by-hand; its declared "autonomy" is contradicted by the lead and the contrast button | §8.3, M2-F7 | the advanced level lowers engagement with the remainder's origin |
| P-7 | q is displayed before sharing (`0/5`) in M1 | M1-F11 | the quotient is given, not found |
| P-8 | The bench is both "the pile" and "the remainder" | M1-F12 | r appears as the count of a zone that meant something else a moment ago |
| P-9 | No prediction step before any lab (§9 of INTERACTION_PEDAGOGY) | CODE | a design option the contract names; absent |
| P-10 | Support removal is abrupt (drawn → symbolic MCQ, no fading) | §8.6 | transfer is untested between the two |
| P-11 | M3 announces the result before the action and shows 143 = 13 × 11 without comment | §7.10, M3-F3 | missed link to P2's symmetry |
| P-12 | The evaluative tone in the books lab («رائع!» vs «توقّف!») frames a non-divisor as failure, although both outcomes are data | M2 feedback | affects how "remainder" is perceived |

## 12. UX findings

| # | Problem | Evidence |
|---|---|---|
| U-1 | The mission says "drag", but on phones the drag cannot reach teams 1–2 | M1-F8 |
| U-2 | Self-contradictory refusal «5… وأقلّ فريق فيه 5» | M1-F1 |
| U-3 | Reproach for a no-op (same team) | M1-F2 |
| U-4 | «إعادة» leaves discovery open and numbers unchanged; stale green conjecture after a change | M1-F3/F4 |
| U-5 | A held object stays held after a refused or out-of-zone drag (no visible cue besides the ring) | RUNTIME |
| U-6 | The magnet lights zones that will refuse | M1-F7 |
| U-7 | The books consequence is off-screen at the moment of the tap | M2-F3 |
| U-8 | Shelves hidden in an internal scroll; shelves wrap rows | M2-F4 |
| U-9 | M3 offers a level the lesson says it does not have | M3-F1 |
| U-10 | Books reset leaves the module advisory stale | M2-F8 |
| U-11 | Duplicated instruction (mission and lead both say «اسحب كل لاعب إلى فريق») | 5.3 |
| U-12 | On a phone the lab starts ~1.75 screens below the top; the first bench player is ~4.9 screens down | 5.17 |

## 13. Mathematical findings

| # | Problem | Evidence |
|---|---|---|
| X-1 | `b` means "number of groups" in M1 and "group size" in M2/M3 | §8.2 |
| X-2 | Exact case: `15 = 3 × 5` (M1) vs `420 = 28 × 15 + 0` (M2): an inconsistent mirror of r = 0 | 5.8, 6.14 |
| X-3 | No incorrect reachable mathematical state found: visual counts = arithmetic in all probed states (416 + 4, 400 + 20, 5/5/5 + 1…) | RUNTIME, TEST sweep |
| X-4 | Free lab cannot set k = 1 (bounds [2, 12]), so "1 is a divisor of every number" (P4) is not explorable; k = n is allowed (P4 "a itself") | registry |
| X-5 | Arabic numeral–noun agreement errors in both labs | M1-F10, M2-F5, M3-F5 |
| X-6 | 143 = 13 × 11 reached but not interpreted | M3-F3 |

## 14. Accessibility findings

| # | Problem |
|---|---|
| A-1 | The complete task **can** be done without dragging in all three labs (tap-tap or keyboard for M1; buttons for M2/M3) — **strength** |
| A-2 | M1 zone `aria-label` hides team sizes and the bench count from screen readers |
| A-3 | M1 nested interactive (buttons inside `role=button`) |
| A-4 | M1 bench targets 34 px wide (< 44); e2e checks height only |
| A-5 | M2/M3 non-divisor result not announced (no live region); the verdict lives in `::after` + `title` |
| A-6 | M2/M3 `aria-label` on role-less shelf divs; books `aria-hidden` (acceptable, the numbers are in text) |
| A-7 | The workspace hides the inactive level with `hidden` (removed from the accessibility tree) — **strength**; level tabs follow WAI-ARIA tabs with RTL arrows — **strength** |
| A-8 | Tiles are 40 px (documented exception) |

## 15. Responsive findings

| # | Problem | Evidence |
|---|---|---|
| R-1 | M1 one pitch per row ≤ 390 px, so teams + bench span 1000–2000+ px; drag unusable | 5.17 |
| R-2 | M2 shelves 1 column ≤ 768 px, 360 px scroll box, 26-book shelf = 4 rows | 6.13 |
| R-3 | M2 sky/status row clipped at 375 px (§17bis violation) | VISUAL |
| R-4 | 17-button rail = 5 rows (272 px) at 375 px | RUNTIME |
| R-5 | No horizontal scroll anywhere, 320–1280 px — **strength** | RUNTIME, e2e |
| R-6 | Classroom-Mode books layout fits 1366×768 and 390×844 without page scroll — **strength** | TEST C1–C3 |

## 16. Engineering findings

| # | Problem | Evidence |
|---|---|---|
| G-1 | Two architectures (shell vs standalone) for one idea in one module; the books lab lacks hints, phase, discovery, i18n and core arithmetic | §4 |
| G-2 | Books lab: ~690 lines of CSS in a `<style>` per instance, hard-coded Arabic, duplicated palette (locked by test) | [DivisorExplorerBooks.jsx](../../apps/web/src/lessons/common/manipulations/divisibility/DivisorExplorerBooks.jsx) |
| G-3 | `logic.test.js › 'divisor-explorer (420 livres)'` tests `logic/divisorExplorer.js`, which the books lab **does not use** — false assurance | grep |
| G-4 | `onReject` recomputes sizes separately from `canPlace` (the source of U-2) — duplicated logic | [TeamBuilder.jsx:160-170](../../apps/web/src/lessons/common/manipulations/divisibility/TeamBuilder.jsx#L160-L170) |
| G-5 | Discovery rule duplicated in the component (`contrastSeen`) while `L.discoveryReady` / `L.remember` / `state.tried` / `attempts` / `setGroups` / `setTotal` / `exactChoices` are unused | [logic/teamBuilder.js](../../apps/web/src/lessons/common/manipulations/logic/teamBuilder.js) |
| G-6 | Reset semantics split across `useManipulation.reset` (no numbers), TeamBuilder `tried` (never reset), `ManipulationDiscovery.pick` (never reset), the module's `teamsSeen` and `tried` (never reset) | §5.15 |
| G-7 | Magnet does not consult `accepts` | [useDragInteraction.js:71](../../apps/web/src/lessons/common/manipulations/useDragInteraction.js#L71) |
| G-8 | No drag auto-scroll in the only gesture engine | useDragInteraction |
| G-9 | SVG gradient ids `g${index}`/`p${index}` are global; harmless here (one books lab per page), a risk if two labs share a page | [DivisorExplorerBooks.jsx:106](../../apps/web/src/lessons/common/manipulations/divisibility/DivisorExplorerBooks.jsx#L106) |
| G-10 | Class-mode code (next step, replay, solution) is dormant and untested | contract line 697 |
| G-11 | Docs disagree: contract line 64 "no levels" vs line 349 and the code; `lesson.config` "one level" vs runtime; §7bis-levels default-level rule vs M1 (whitelisted only in e2e) | §7.18, §8.3 |
| G-12 | M3 has zero tests; no test covers refusal messages, reset-with-discovery, the stale conjecture, or mobile drag reachability | §4 |
| G-13 | `resources[]` does not drive the page (levels are hard-coded in module JSX), so config and page can drift (as in M3) | [Module01AlMaktaba.jsx:80](../../apps/web/src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-adad-tabii/modules/Module01AlMaktaba.jsx#L80) |
| G-14 | Strengths: render-time re-initialisation avoids stale frames; auto-complete built on the same `canPlace`; formation geometry swept; per-instance drop-zone ownership; state preserved across the workspace tab and classroom enter/exit | CODE/TEST |

---

## 17. Preservation requirements — what the next design review must keep

These are concrete, verified properties of the current implementation:

1. **The refusal *is* the definition.** `canPlace` accepts a player only if the teams stay equal and below q, so the leftover player is *physically unplaceable* and stays drawn on the bench, and the refusal is explained in Arabic with on-screen numbers. Auto-complete goes through the same `canPlace`. (`logic/teamBuilder.js`; e2e W1, AC5)
2. **Every object is drawn and every count is honest.** 420 books are 420 SVG books; r books lie on the floor; 16 players leave exactly one figure on the bench. Numbers, drawing and equation derive from one state (`lab` / `capacity`), and no state shows a decimal or a truncated count. (RUNTIME counts; `equalGrouping` / `autoComplete` sweeps)
3. **Discovery requires the contrast.** The conjecture opens only after one exact **and** one inexact configuration have been settled; the rule appears only after the correct conjecture; wrong conjectures get a counter-example and can be retried. (`TeamBuilder.jsx:127-128`, `ManipulationDiscovery`)
4. **One workspace, no lost work.** Both level panels stay mounted (`hidden`), so teams, tried sizes and phase survive tab switches; Classroom Mode enter/exit never remounts the books lab. (W2, C1)
5. **Non-drag parity and textbook fidelity.** Every gesture has a tap-tap and keyboard path (`useDragInteraction`, 6 px tap threshold, Escape), and the textbook's own numbers and pair (420, 26/28; 143/11) are what the student lands on in the textbook lab, with any platform context declared (`experience`, «مثال تفاعلي إضافي»).

---

## 18. Executive summary

| Item | Summary |
|---|---|
| **Reference lesson** | `qasim-adad-tabii` «التعرّف على قاسم لعدد طبيعي», module 1 al-maktaba (verified via LESSON_DEVELOPMENT_GUIDE §9) |
| **Manipulation instances** | **3**: M1 team-builder 15/3 (مبتدئ), M2 books 420 (متقدم), M3 books 143 (معارف, standalone with its own selector) |
| **Types** | `team-builder` (ManipulationShell) · `divisor-explorer-books` (standalone) |
| **Concepts** | Euclidean division a = b × q + r; b divides a ⇔ r = 0; (partition in M1, quotition in M2/M3) |
| **Gestures** | drag / tap-tap / keyboard carry (M1); single tap on a size (M2, M3); number tiles (M1) |
| **Representation transitions** | drawn objects → per-group counts → equation (KaTeX in M1 when settled; plain text in M2/M3 immediately) → conjecture → formal rule (M1 only); the books labs formalize via module questions + KnowledgeBrick |
| **Feedback** | Arabic refusal reasons (M1), coloured equation + note, fix-hint (nearest multiples), ✓/✕ badges and evaluative sentences (books), conjecture counter-examples |
| **Scaffolding** | 3 progressive hints (M1 only), «الشرح» panel, «أنشئ الفرق» auto-complete (unlocked immediately), contrast shortcut «جرّب X» (books), free lab after discovery |
| **Accessibility** | full non-drag path everywhere; tabs pattern; live regions partial; zone labels hide counts; bench targets 34 px wide |
| **Responsive risks** | M1 drag impossible ≤ 390 px (bench ≥ 1000 px below team 1); books consequence off-screen after tapping; shelves in a 360/420 px inner scroll, wrapped rows; clipped status bar at 375 px |
| **Pedagogical risks** | silent partition/quotition switch; advanced level removes the productive gesture and the conjecture; manipulations optional for progress; answers readable in options/bricks; rule readable before discovery; discovery reachable with no hand gesture |
| **Engineering risks** | two architectures for one idea; books lab untested at unit level (a test named for it tests another file); reset/discovery state scattered and partly never reset; refusal message computed separately from the rule; doc/config/runtime disagreement on M3's levels; zero tests for M3 |

**Test status at audit time:** `validate:lessons` (strict) passed; unit tests 124 + 80 passed; e2e `manipulations.mjs` 183/183 passed. All defects above come from paths those suites do not exercise.

---
---

# PART II — Every manipulation of the unit

## 19. Scope, method and inventory

**Method.** Part I's method was applied to the eight other lessons.
- Code was traced from each module through the registry, the component, the `logic/*.js` file and the shell.
- A Playwright probe ran every instance on the dev server at 1280×800 and at 375×667 (touch). Modules were unlocked by seeding the anonymous local progress in a throwaway browser context.
- The auditors looked at screenshots.
- Where a finding came from a subagent report, the highest-impact claims were checked again against the code: the `n`/`a` free-lab key, the dead `c1`/`d1`/`e1` states, the missing `euclid.reject.invalid` key, `withProof` with no caller, and the capped `differenceStepCount`.
- The unit suite `apps/web/e2e/lesson-kit/4am-aadad-tabiiya-natiqa.mjs` passed **27/27**, with no console error.

**Inventory.** 29 registry instances, 9 of the 10 registered types.
- The 10th type, `divisor-explorer`, is registered and has its own logic and tests, but **no lesson uses it**.
- Lesson 9 (`wadiya-idmajiya-aadad`, a synthesis lesson) has no registry manipulation, only `InfoSorter` and `MethodSteps` (§29).
- `lesson.config.js` declares 17 manipulation resources; **12 rendered instances are undeclared** standalone labs. The contract already records this as a known gap.
- "Gates a step" means that a step's `done` actually depends on the lab's callback.

| ID | Lesson / module | Type | Placement · level | Numbers · theme | Main gesture | Gates a step? |
|---|---|---|---|---|---|---|
| **1.1** | qasim-adad-tabii / M1 al-maktaba | team-builder | workspace · مبتدئ (default) | 15/3 · football | carry players | no (hint text only) |
| **1.2** | qasim-adad-tabii / M1 | divisor-explorer-books | workspace · متقدم | 420, 17 sizes · library | tap a size | no |
| **1.3** | qasim-adad-tabii / M2 maarif | divisor-explorer-books | standalone (own selector, adv = 420) | 143 · library | tap a size | no |
| **2.1** | qawasim-adad-tabii / M1 al-adad-60 | factor-pairs | workspace · مبتدئ | 24 · library | carry d onto the shelves | no |
| **2.2** | qawasim-adad-tabii / M1 | factor-pairs | workspace · متقدم (default) | 60 · library | carry d | **yes** (step 1 `finished && q48`) |
| **2.3** | qawasim-adad-tabii / M1 step 2 | factor-pairs | standalone (adv = 105) | 48 | carry d | no |
| **2.4** | qawasim-adad-tabii / M2 tariqa-105 | factor-pairs | standalone (opens adv = 105; beg = 24) | 105 | carry d | no |
| **3.1** | khawass-qawasim / M1 thalath-halat | divisor-properties | workspace · مبتدئ (default) | 3 / 18 / 12 · construction | carry wall b to join/remove/measure | **yes** (`c1 && c2`) |
| **3.2** | khawass-qawasim / M1 | divisor-properties | workspace · متقدم | 9 / 900 / 90 · construction | same | no |
| **3.3** | khawass-qawasim / M1 step 1 | divisor-properties | standalone (adv = 900/90) | 5 / 35 / 15 | same | **yes** (`c2`) |
| **3.4** | khawass-qawasim / M1 step 1 | divisor-properties | standalone (adv = 900/90) | 7 / 56 / 21 | same | no |
| **4.1** | qasim-mushtarak-akbar / M1 baqat | common-divisors | workspace · مبتدئ | 12/18 · football | carry k, groups only | no |
| **4.2** | qasim-mushtarak-akbar / M1 | common-divisors | workspace · متقدم (default) | 90/54 · garden, groups → lists | carry k, then divisors, then PGCD | no (hides a hint line) |
| **4.3** | qasim-mushtarak-akbar / M2 maarif | common-divisors | standalone `startWith="lists"` (adv = 65/78) | 28/42 | carry divisors, then PGCD | no |
| **5.1** | tayin-pgcd / M1 42-wa-60 | common-divisors | workspace · مبتدئ | 8/12 · school | carry k | no |
| **5.2** | tayin-pgcd / M1 | common-divisors | workspace · متقدم (default) | 42/60 · school, groups → lists | as 4.2 | no (hides a hint line) |
| **6.1** | bahth-pgcd / M1 al-furuq | pgcd-differences | workspace · مبتدئ | 21/14 · workshop ribbons | carry the small ribbon onto the big one | no |
| **6.2** | bahth-pgcd / M1 | pgcd-differences | workspace · متقدم (default) | 252/140 | same, then PGCD box | **no** (`d1` never read) |
| **6.3** | bahth-pgcd / M1 step 2 | pgcd-differences | standalone (opens adv) | 378/315 | same | **yes** (`d2`) |
| **6.4** | bahth-pgcd / M3 khwarizmiyat-iqlidus | euclidean-algorithm | workspace · مبتدئ | 45/18 | lay copies, carry remainder | no |
| **6.5** | bahth-pgcd / M3 | euclidean-algorithm | workspace · متقدم (default), compare | 765/135 | same, then PGCD box | **no** (`e1` never read) |
| **6.6** | bahth-pgcd / M3 step 3 | euclidean-algorithm | standalone, compare | 3356/1528 | same | **yes** (`e2`) |
| **7.1** | awwaliyan-fima-baynahuma / M1 17-wa-18 | coprime-explorer | workspace · مبتدئ (default), groups → lists | 17/18 · school | carry k, then divisors | **no** (`c1` never read) |
| **7.2** | awwaliyan-fima-baynahuma / M1 | coprime-explorer | workspace · متقدم, lists | 22/35 | carry divisors | no |
| **7.3** | awwaliyan-fima-baynahuma / M1 step 2 | coprime-explorer | standalone (opens adv = 27/36; beg = 17/18) | 27/36 «مريم» | carry divisors | no |
| **7.4** | awwaliyan-fima-baynahuma / M2 maarif | coprime-explorer | standalone (beg = 22/15; adv = 27/36) | 22/15 | carry divisors | no |
| **8.1** | ikhtizal-kasr / M1 samir | fraction-reduction | workspace · مبتدئ | 12/18 · kitchen | carry a common divisor onto the recipe | no |
| **8.2** | ikhtizal-kasr / M1 | fraction-reduction | workspace · متقدم (default) | 84/48, path ÷4 ÷3 | same, then PGCD | no (hides a hint line) |
| **8.3** | ikhtizal-kasr / M2 maarif | fraction-reduction | standalone (adv = 595/560) | 84/48, path [12] | same | no |

**Only 5 of the 29 instances gate anything** (2.2, 3.1, 3.3, 6.3, 6.6). In every other module the lab can be skipped and the module still completes. The auditors verified this on fresh profiles for 1.x, 4.x, 5.x, 6.2, 7.x and 8.x.

---

## 20. Defects shared across the unit (shell, hook, kit)

These defects live in shared code (`useDragInteraction`, `useManipulation`, `ManipulationShell`, `ManipulationDiscovery`, `ManipulationFreeLab`, `NumberTile`, i18n). They therefore affect several types at once. Part I found items a–h on lesson 1; Part II confirmed them on the other types and found the items marked **new**.

| # | Defect | Where in code | Types affected (✔ confirmed at runtime) |
|---|---|---|---|
| a | The magnet lights zones that will refuse, and even disabled zones | `useDragInteraction.js:71-85` never reads `accepts` or `disabled` | team ✔, properties ✔ (built zones), common ✔, differences ✔, Euclid, coprime ✔, fraction ✔ (disabled `fraction` zone still receives drops) |
| b | The object stays held after a refused or out-of-zone drop. The next tap *releases* it and a stale rose message stays | `:134-140`, `:87-99` | all drag types ✔ |
| c | «إعادة» does not restore the lesson's numbers after a free-lab change | `useManipulation.js:86-94` | all shell types ✔. Worst case: factor-pairs with n = 0, the lab is dead until reload |
| d | `ManipulationDiscovery` keeps `pick`. After reset or new numbers the old choice is pre-pressed: the **correct answer shows green** before the student chooses, or an old wrong choice's why-text shows | `ManipulationDiscovery.jsx:23` (stays mounted, returns `null`) | team ✔, factor ✔, common ✔, differences ✔, coprime ✔, fraction ✔ |
| e | «إظهار الشرح» shows the explanation **and** the registry `shows` line, which is the formal rule, in phase `act` | `ManipulationShell.jsx:92-94, 115` | every shell type ✔ |
| f | No drag auto-scroll | `useDragInteraction` | blocking for team (1.1) and fraction path B (8.x); borderline for Euclid (6.5) and properties after builds; harmless elsewhere |
| g | Arabic numeral–noun agreement in interpolated strings | `lesson.json` plural nouns after `{{n}}` | every type (examples in each section) |
| h | Targets under 44 px: `NumberTile size="sm"` is 40×40; Euclid +/− buttons are 34×44 | `NumberTile.jsx:24` | factor, common, differences, Euclid, coprime, fraction |
| **i (new)** | **The free lab can tick a lesson step.** `state.report` only checks `isAuthoredLevel`, and the free lab does not change the level. After finishing 21/14 in the free lab, the step «PGCD(378 ; 315)» was ticked ✔ | `useManipulation.js:109-112` | observed on 6.3; same code everywhere |
| **j (new)** | **The authored title stays after free-lab numbers**, e.g. «جدول الكتاب: 60» over n = 49, or «17 قلمًا و 18 كراسًا» over 27/36 | `ManipulationShell.jsx:63-64` | all shell types ✔ |
| **k (new)** | **A standalone lab's level switch wipes the work** (`setLevel → setNumbers → reset`), unlike the workspace. The type preset it opens often **duplicates or pre-solves** another lab of the lesson: 48 → 105 (M2's lab), cases 2 and 3 → 900/90 (the workspace's advanced lab), 28/42 → 65/78 (the answer to M3's «دوري الآن»), 22/15 → 27/36 (step C3), 143 → 420 (Part I) | `levels.js` `resolveManipulationLevels`, `useManipulation.js:101-107` | 1.3, 2.3, 2.4, 3.3, 3.4, 4.3, 6.3, 6.6, 7.3, 7.4, 8.3 |
| **l (new)** | **Dead `onFinished` wiring.** `c1` (lesson 7), `d1` and `e1` (lesson 6) are set and never read. The module comments say the first step waits on the lab; it does not. `labDone` (lessons 4, 5, 8) only hides a helper line | modules listed in §19 | 6.2, 6.5, 7.1, 8.2 (comment false), 4.2, 5.2 |
| **m (new)** | **Plain-text equations inside Arabic notes are bidi-reordered.** «(7² ≤ 60)» renders as **«(7² ≥ 60)»**, a false inequality; «جدار a: 18 = 3 × 6 طوبة» renders as «جدار 6 × 3 = a: 18 طوبة»; «105 = 7 × 15» renders as «15 × 7 = 105» | i18n strings not isolated LTR; `dir="auto"` | factor ✔, properties ✔ |
| **n (new)** | **A raw i18n key is shown to the student.** «manipulation.euclid.reject.invalid» appears for copy→carry, copy→slot, rem→dividend and rem→slot; the `EquationBuilder` slots are live but always-refusing drop zones | `EuclidAlgorithm.jsx:61,65`; the key is missing from `lesson.json` | Euclid ✔ |
| **o (new)** | **`DropZone` hints never render** when the zone has a label child. The student never sees «اسحب هنا القواسم المشتركة», «ضع هنا أكبر قاسم مشترك», «اسحب إلى هنا آخر فرق غير معدوم» | `DropZone.jsx:33` | common ✔, differences ✔ |
| **p (new)** | **Hint level leaks across the stages of a chained lab**: 3/3 hints asked in the groups stage open the lists stage at «تلميح 2/2», disabled | `useManipulation` `hintLevel` shared | common ✔, coprime |
| **q (new)** | The floating «بطاقتي» pill overlaps controls or tiles at 375 px (the tip button, rail chips 5/6, `rem:8`, lab titles) | lesson floating column | factor, properties, common, coprime, Euclid ✔ |
| **r (new)** | **On phones the labs are cramped.** The nested workspace, shell and stage paddings leave a **239–267 px** wide stage on a 375 px phone. Drawn objects shrink to 11–16 px; ribbons shrink to 63 px | nested cards | all ✔ |
| **s (new)** | **A second drag engine exists.** `InfoSorter` (lesson 9) uses the legacy `manip6e/useDragDrop`, although contract §4 says `useDragInteraction` is «the only gesture implementation» | `common/components/InfoSorter.jsx:5` | lesson 9 |
| **t (new)** | **Page text gives away the lab's discovery.** Titles, leads, KnowledgeBrick leads directly above the lab, and TapQuestion options or explanations next to it state the result. Examples: «نختبر من 1 إلى 10», «PGCD(84 ; 48) = 12 — في خطوة واحدة», «القواسم المشتركة لـ 28 و 42 هي 1، 2، 7 و 14», «PGCD هو آخر فرق غير معدوم» above 378/315 | lesson modules | every lesson |

---

## 21. `factor-pairs` — lesson 2 «قواسم عدد طبيعي» (instances 2.1–2.4)

**Mechanics** [CODE `FactorPairs.jsx`, `logic/factorPairs.js`]
- The student carries a tile d («عدد الكتب في الرفّ») onto the library board. `BookRectangle` redraws n books in shelves of d, with an incomplete last shelf drawn amber and dashed. The equation reads `n = d × q (+ r)`, and the pair small × big joins «أزواج العوامل».
- There is one zone, and it always accepts, so the refusal strings `notNatural` / `largerThanN` are dead code.
- The rail runs from 1 to the first divisor above √n. Tiles above √n are **dimmed from the start**.
- **Discovery condition** (`factorPairs.js:44-46`): every d ≤ ⌊√n⌋ has been tested **and** some tested d beyond the bound has produced a repeat.
- Conjecture: «إلى أيّ عدد يكفي أن نختبر…» with three options, the correct one always first. Formal: `DivisorSet` of n, plus `d² ≤ n ⇒ (d, n÷d)`.
- Hints (3); hint 3 interpolates √n («جرّب عددًا أكبر من 7»). The lab is MANUAL (no auto-complete).

**Type-level defects**
- **Free-lab bounds are bypassed.** The field key is `n` (`FactorPairs.jsx:77`); the registry key is `a` (`manipulationTypes.js:48`). `ManipulationFreeLab` therefore falls back to 0…MAX_SAFE_INTEGER, and `levels.test.js:43` skips the mismatch silently.
  - n = 0 kills the lab; «إعادة» keeps n = 0.
  - n = 1 makes discovery unreachable, contrary to contract §7bis.
  - n = 20000 takes 6.3 s to apply; n = 100000 hangs the page.
- **`repeat` depends on test order.** Testing 8, 6, 5, 7 before 1…4 on n = 24 marks the *small* factors 3 and 4 «هذا الزوج موجود مسبقًا» and stalls the discovery until 8 is re-tested.
- **The stop rule is shown before it is discovered, four ways:** leads and titles, dimmed tiles, hint 3, and الشرح / `shows`.

| Instance | Pros | Cons |
|---|---|---|
| **2.1** 24, warm-up | four tests, repeats at 6 and 8, fits one phone screen; tap, keyboard and drag all work | the order-dependence defect was observed on this instance; same demand as 2.2 |
| **2.2** 60, textbook table, default | the drawing *is* the table (perfect vs amber shelf, from the same `lab.cols` as the equation); **one of the 5 gating labs** (step 1 needs formal); ✓/↺/rose tile history | the lead «لكل عدد d من 1 إلى 7» gives the bound; the declared `autonomy` («يقرّر بنفسه متى يتوقّف») is contradicted by the lead and the dimmed tiles; the `IntegerSetQuestion` (divisors of 60) can be answered before the lab |
| **2.3** 48, standalone | reinforces the method on a new number | the lead «من 1 إلى 6 (لأن 6² = 36 ≤ 48 < 49)» gives the bound; **its متقدم tab is Module 2's 105 lab** (defect k); optional |
| **2.4** 105, Module 2 | opens on the textbook's own advanced preset, with a sensible beginner = 24 tagged «مثال تفاعلي إضافي» | **the title «105: نختبر من 1 إلى 10» is the answer** to step 1's question; the lead says «اكشف» although the lab is drag-based; optional; e2e never opens it |

**Type pros.** The drawing carries the mathematics, and picture and equation come from one state. The discovery is gated on a lived event, a beyond-bound repeat, not on a click count. Arithmetic comes from core.

**Type cons.** Unbounded free lab, rule leakage, the order-dependent repeat, the bidi-false «7² ≥ 60», «رتّب 105 كتابًا» agreement errors, 40 px tiles, and stale comments («rectangle de points», «يقسم / لا يقسم»).

---

## 22. `divisor-properties` — lesson 3 «خواص القواسم» (instances 3.1–3.4)

**Mechanics** [CODE `DivisorProperties.jsx`, `logic/divisorProperties.js`, `brickLayout.js`]
- The student carries wall b (bricks of length n) to one of three zones:
  - **ألصق** builds a + b;
  - **انزع** builds a − b;
  - **قِس** lays panels of b along a, leaving the remainder r.
- Each result is drawn in whole bricks at a common scale, with the factorised line `a + b = n×q + n×q′ = n×(q+q′)`.
- **Discovery condition:** all three constructions built, in any order.
- Conjecture: «ماذا تلاحظ في المقادير الثلاثة؟». Formal: `n∣a, n∣b ⇒ n∣a+b, n∣a−b, n∣r`.
- Targets are ≥ 44 px (the wall source is ≥ 52 px, zones are 72 px tall). MANUAL.
- Free-lab validation works: n from 2 to 99, n must divide a and b, a ≥ b. a = b is accepted and draws empty walls.

**Type-level defects**
- **The advanced level promises a prediction that does not exist.** The header, the lesson's `autonomy` and the lead «توقّع بالخاصية قبل أن تسحب» all promise one; the `props.predict` i18n key is unused.
- **The proof builder is unreachable.** No lesson passes `withProof`, so the proof builder (`:155-198`) is dead in production. Its error message would render in the stage, and `proof.wrong` can never be set.
- **Magnet and tap disagree on built zones.** The magnet lights *built* (disabled) zones: a drag gives «هذا المقدار مبنيّ مسبقًا…», but a **tap** on the same zone is silent and the wall stays held.
- **Bidi scrambling:** «جدار 6 × 3 = a: 18 طوبة»; «10 × 3 = 30» instead of «30 = 3 × 10».

| Instance | Pros | Cons |
|---|---|---|
| **3.1** 3/18/12, default | the strongest "no half-brick" argument in the unit; three distinct gestures; **gates step 1**; e2e covers the happy path to `discover` | the lead pre-states the observation («هل يظهر نصف طوبة؟»); the wall labels print `18 = 3 × 6` before any gesture |
| **3.2** 9/900/90 | bricks are too small to count (the declared reason for the level); state survives the level round trip; keyboard path verified | **r = 0** (900 = 90 × 10), so «قِس» never exercises the remainder property; every count is printed in the labels; same hints as the beginner level; «بزيادة الأعداد فقط» — nothing more demanding |
| **3.3** 5/35/15, standalone | a non-trivial remainder (5); **gates step 1** | its متقدم tab is the same 900/90 lab (a third copy on the page, defect k); a level switch wipes the work |
| **3.4** 7/56/21, standalone | a third confirming case (r = 14) | optional; same duplicated advanced tab; «2 لوحات» agreement error |

**Type pros.** A physical metaphor that *is* the proof (whole bricks ⇔ n × integer). Order-free with three distinct operations. Working validation, targets ≥ 44 px, unit-tested geometry, and instance isolation that holds with two labs on one step.

**Type cons.** A hollow advanced level, a dead proof phase, the rule shown in الشرح, bidi and agreement errors, and three copies of the advanced lab on one page.

---

## 23. `common-divisors` — lessons 4 «القاسم المشترك الأكبر» and 5 «تعيين PGCD» (instances 4.1–4.3, 5.1–5.2)

**Mechanics** [CODE `CommonDivisors.jsx`, `logic/commonDivisors.js`, `GroupingScene`, `groupingLayout.js`]
- **Stage 1, groups.** The student carries k onto the table. The two piles re-form as k identical frames; the leftovers are drawn greyed; the rail chip is marked ✓ (both), amber (one) or grey (none). Beyond `maxGroups` the scene says «+n أخرى» instead of silently truncating.
- **Stage 2, lists.** Divisor chips go to «الوسط», then the greatest one goes to the PGCD box. Arabic refusals name the numbers: «5 يقسم 90 فقط، لا يقسم 54.», «9 قاسم مشترك، لكنه ليس الأكبر.».
- **The chain (§7quater) is implemented as the contract says:**
  - مبتدئ is groups-only;
  - متقدم shows the card «وجدت أكبر عدد ممكن… إلى القائمتين ←»;
  - the back link keeps state;
  - the rail always contains the PGCD.
- **Discovery conditions.**
  - مبتدئ: `tried[gcd] === 'common'`.
  - متقدم: the PGCD box is filled after all common divisors are placed.
- MANUAL. The reset `epoch` guard works: discovery does **not** re-open after reset.

**Type-level defects**
- **Discovery or "greatest found" fires on a single lucky drop of g** (k = 6 at the first try for 12/18; k = 18 for 90/54). Nothing requires the student to have seen larger k fail, and the rail cap of 24 hides 27, 30, 45 and 54 for 90/54.
- **The lists are pre-computed.** The student never *lists* («يحصر») divisors, yet hint 2 says «اكتب قواسم كل عدد» and leads say «اكشف قواسم 28…».
- **Reason ordering is misleading.** `canPlacePgcd` checks `notAllCommon` first, so dropping a non-divisor on PGCD says «أكمل أوّلًا…» instead of the true reason.
- **After discovery the rail stays live.** Trying k = 12 keeps «PGCD(12 ; 18) = 6» next to a 12-group scene, and the prompt «ماذا يمثّل أكبر عدد وضعته؟» then points to 12.
- `state.discover()` is called inside a `setLists` updater (an anti-pattern).
- The ✓/amber/grey state is conveyed by colour only (the badge is `aria-hidden`). Defect p (hint-level leak) is present.

| Instance | Pros | Cons |
|---|---|---|
| **4.1** 12/18 football | one lab, discovery on the gesture, small countable leftovers | discovery on the first lucky try; title «12 كرة و 18 قميصًا» vs mission «12 كرات و 18 قمصان» in the same card; the `قميصًا` label is in the accusative; decorative theme (same model as garden) |
| **4.2** 90/54 garden, textbook, default | the most complete lab in the unit: drawn groups → student-opened lists → gated PGCD box, back link and state survival; all refusals explained | the card asserts «أكبر عدد ممكن… 18» before the lists, which pre-empts the lists' discovery; the module is completable without the lab, and the step texts contain «90 ÷ 9 = 10» and «أكبرها 18»; at 375 px the next card is ~1836 px below the rail, with 11 px flowers; «90 زهرات», «7 زهرة», «11 زهور» |
| **4.3** 28/42 lists, Module 2 | correct use of «pin a single lab» (§7quater rule 3); short lists; level pairing as documented | **its متقدم (65/78) solves Module 3's «دوري الآن — 65 و 78»**; a level switch wipes the work; the page prints «القواسم المشتركة لـ 28 و 42 هي 1، 2، 7 و 14» twice |
| **5.1** 8/12 school | epoch-guarded reset works; countable | discovery on the first lucky k = 4; «2 قلم و 4 كراس», «2 أدوات» |
| **5.2** 42/60 school, textbook, default | correct reasons naming 42 and 60; the school world makes «متماثلة» visible | **contradicts its own module docstring, `lesson.config.js` and contract §7bis-levels** («the advanced level of lesson 5 keeps the bare lists»): it opens on 42 pens and 60 notebooks in bags; it is **interactionally a copy of 4.2**, so lesson 5's method («حصر القواسم») is performed by the machine; the lead promises a «تحقّق» button that does not exist; pens and notebooks share rows inside a bag, so «7 + 10» is hard to read |

**Type pros.** The best-realised chained lab in the unit. Drawn objects whose counts equal the division. Precise Arabic refusals. Tested logic and layout. Workspace state survives the level switch.

**Type cons.** A luck-based "greatest" discovery, pre-computed lists, lesson 5 duplicating lesson 4, answers printed in the steps, no e2e for the chain, the lists, lesson 5 or 28/42, and pervasive agreement errors.

---

## 24. `pgcd-differences` — lesson 6 «البحث عن PGCD», Module 1 (instances 6.1–6.3)

**Mechanics** [CODE `DifferenceAlgorithm.jsx`, `logic/algorithms.js`, `RibbonStrip`]
- The student carries the small ribbon onto the big one. Each cut adds the line «252 − 140 = 112» with the invariant `PGCD(a ; b) = PGCD(b ; a − b)`.
- At the end, the student carries the last non-zero difference into the PGCD box. The last row shows `PGCD(a ; b) = ?` until then, so the **result stays hidden until placed**, as §7bis requires.
- **Auto-complete «أكمل الفروق»** (`first-gesture`) unlocks after one manual cut. It uses the same transition as the hand, is cancelled by `epoch`, and leaves the PGCD box manual. It follows contract §6bis exactly.
- Discovery: the correct PGCD tile is dropped on the box. Conjecture: «ما هو القاسم المشترك الأكبر في هذه السلسلة؟».

**Type-level defects**
- **The difference is printed on the big ribbon before the gesture** («140 سم | 112 سم», plus scissors). The student never computes; the gesture confirms.
- **The documented wrong gesture cannot happen.** Only the small ribbon is draggable, so the header's refusal (`bigOnSmall`) is unreachable.
- **The discovery rule is given before the conjecture.** The box refuses any value that is not the last non-zero one, with «هذا ليس آخر فرق غير معدوم.»; hint 3 asks «ما آخر عدد غير معدوم»; الشرح states it too.
- **The end state contradicts itself:** «لم يبقَ شيء: الشريطان صارا متساويين.» sits above ribbons labelled 28 and 0.
- The 6.2 lead says «لاحظ العمود الأيمن», but in RTL the invariant is in the **left** column.
- At 375 px the ribbons are **63 px** wide and their labels are truncated.

| Instance | Pros | Cons |
|---|---|---|
| **6.1** 21/14 | three cuts, the whole chain on one screen | only one candidate (7) for the PGCD box, so the judgement is empty |
| **6.2** 252/140, textbook, default | textbook table opened by default; correct chain; hidden result; clean auto-complete and reset | **gates nothing** (`d1` is dead) although the step subtitle says «أنهِ الطرحات في المناولة أولًا»: the textbook activity can be skipped (verified); the KnowledgeBrick above step 1 states the answer to step 1 |
| **6.3** 378/315, standalone | textbook question 4; **gates step 2**; keyboard path verified | **the first difference, 63, is the PGCD**, so the distractor «أوّل فرق حصلنا عليه» is numerically right and its why-text «السلسلة تواصلت بعده» is misleading; the brick above states «PGCD هو آخر فرق غير معدوم»; a level switch wipes the work; **the free lab can tick this step** (defect i, observed); no test |

**Type pros.** One source of truth (a `done` cursor over core `differenceSteps`). A hidden result. The reference implementation of §6bis auto-completion. Three input paths.

**Type cons.** A thin cognitive act (pre-labelled difference, one possible source), the rule leaked three ways, a contradictory end state, illegible ribbons on phones, the 6.3 distractor problem, and the dead gate on 6.2.

---

## 25. `euclidean-algorithm` — lesson 6, Module 3 (instances 6.4–6.6)

**Mechanics** [CODE `EuclidAlgorithm.jsx`, `logic/algorithms.js`]
- The student lays copies of the small ribbon along the big one, by drag or with the +/− buttons. The equality `a = b × q + r` fills slot by slot. The student then carries the remainder to the next line, and finally the last non-zero remainder into the PGCD box.
- `compareWith="differences"` shows, **after discovery only**, «بالفروق: 8 خطوة · بالقسمات: 3 قسمات» with bars.
- **Auto-complete «أكمل القسمات»** unlocks after the first full division plus carry (`confirmed > 0`), and the PGCD box stays manual.

**Type-level defects**
- **The student never meets the overflow.** When copies reach q, the lab itself shows «نسخة أخرى تتجاوز…: توقّف» and disables +. The stop decision is automated.
- **Raw i18n key.** Four misdrop categories show «manipulation.euclid.reject.invalid» (defect n). With defect b, the next natural tap releases the tile.
- **The copy source is not to scale.** It is drawn at its own scale inside a fixed box: a 28 source is drawn 146 px while each placed copy is 83 px.
- **Free-lab extremes.** 99999/2 passes validation, but needs 49 999 manual copies before auto-complete unlocks. `differenceStepCount` is capped at 10 000, so the compare line would print a false count, and the capped `differenceSteps` even returns a wrong gcd.
- «8 خطوة» and «2 قسمات» agreement errors.

| Instance | Pros | Cons |
|---|---|---|
| **6.4** 45/18 | short, shows the stop at r = 0 | one remainder tile (9), so the box has one candidate |
| **6.5** 765/135, textbook, compare, default | quotient = number of copies counted; the 8-vs-3 comparison appears after discovery; auto-complete gating correct | **gates nothing** (`e1` is dead); the step 1 prompt states «باقي… هو 90»; raw-key refusals; at 375 px the carry zone falls at or below the fold |
| **6.6** 3356/1528, standalone, compare | six correct divisions; 22-vs-6 comparison; **gates step 3**; no horizontal scroll | the **remainder is 3 px wide on a phone** (row 2) with labels hidden, and 16 px on desktop; the chain is 1020 px tall; the brick above answers the compare question; the pill covers `rem:8`; the free lab can tick the step; no test |

**Type pros.** The most faithful embodiment of `a = bq + r` in the unit: q is counted, r is the uncovered length. A button alternative to drag. The textbook comparison is delivered at the right moment.

**Type cons.** Raw-key feedback, the automated stop, a source not to scale, invisible remainders on phones, 34 px +/− buttons, and false numbers at free-lab extremes.

---

## 26. `coprime-explorer` — lesson 7 «أوليان فيما بينهما» (instances 7.1–7.4)

**Mechanics** [CODE `CoprimeExplorer.jsx`, `logic/coprime.js`]
- With `startWith="groups"`, the student carries k bags for 17 pens and 18 notebooks. Every k is accepted; the leftovers are drawn.
- After 1 and at least two other k have been tried, an insight card appears. The student presses «لنتأكّد بالقوائم», so **the transition is student-triggered**.
- **Lists stage:** only chips dividing both numbers enter «الوسط»; the others are refused («17 يقسم 17 فقط.»).
- **Discovery condition:** تحقّق with *all* common divisors placed. Formal: `PGCD(a ; b) = 1` → «أوليان فيما بينهما», or `= 9` → «ليسا أوليين».
- MANUAL.

**Type-level defects**
- **The insight overgeneralises.** After two failed tries it declares «لا يمكن تشكيل حقائب متماثلة أكثر من واحدة»; the rail stops at 12, so k = 13…17 cannot even be tried.
- **§7quater is broken four ways:**
  - rule 1: the beginner level chains a second lab;
  - rule 2: there is no way back to the groups;
  - rule 4: the flow comes from the `startWith` flag, not from `state.level`;
  - rule 5: the hints are the same in both stages.
- **1 + تحقّق completes the lab** for 17/18, 22/35 and 22/15.
- «لم يبقَ في الوسط إلا 1» is printed **before** تحقّق. تحقّق on a partial set is **silent**.
- A tile held across the stage switch produces the false refusal «لا يمكن تشكيل حقائب أكثر من عدد الأشياء.».

| Instance | Pros | Cons |
|---|---|---|
| **7.1** 17/18 groups → lists, default | coprimality made visible (one pen always left outside); student-opened transition; why-texts target the real misconception («صفة للزوج، لا لكل عدد وحده») | premature universal insight; completed by one chip; **`c1` is dead**; step 1's first option is the answer; after the free lab the title still says «17 قلمًا و 18 كراسًا» over 27/36 |
| **7.2** 22/35 lists | lists-only honours «do not force a context» | the declared `autonomy` «لا توقّع ولا تلميح» is contradicted by the three hints; completed by one chip; the lead says «اكشف», but the lists are already shown; untested |
| **7.3** 27/36 «مريم», standalone | carries the real "no" case | the lab demands **exhaustive** listing (1, 3, 9) where the textbook's refutation needs one divisor ≠ 1 (the brick right below says so); the gold PGCD chip appears before discovery; hint 3 points toward the wrong conclusion; its beginner tab repeats 17/18; the answer is in the next TapQuestion |
| **7.4** 22/15, Module 2 | lands on the textbook example; the title swap on the other level works | one-chip completion; its متقدم is 27/36 again (a third appearance) |

**Type pros.** A drawn grouping that shows *why* only 1 works. A student-triggered transition. Refusal and why-texts about the pair.

**Type cons.** The weakest discovery gate in the unit (one chip), premature and overgeneralised conclusions, contract rules broken, dead wiring, and a demand mismatched with the textbook's refutation method.

---

## 27. `fraction-reduction` — lesson 8 «اختزال كسر» (instances 8.1–8.3)

**Mechanics** [CODE `FractionReduction.jsx`, `logic/fraction.js`]
- **Path A:** the student carries a common divisor onto the recipe («84 ملاعق سكّر لـ 48 أكواب دقيق»). The recipe splits into k identical portions with one highlighted, and «الحصّة الواحدة… أي الكسر 21/12» appears with a `MathTransformation`.
- When no common divisor > 1 remains, the system announces «كسر غير قابل للاختزال».
- **Path B:** the student carries the PGCD in one step; a non-PGCD chip is refused with «في خطوة واحدة نحتاج إلى القاسم المشترك الأكبر.». Discovery follows, then «أيّ الطريقين أوفر؟», with a Euclid trace.

**Type-level defects**
- **Only valid common divisors are offered.** The header's «classic error» (a chip dividing only one term) is **impossible**. After ÷4 the only chip left is 3, so the second step is forced, contrary to `autonomy: 'عدّة قواسم مشتركة ممكنة في كل خطوة'`.
- **The answer is marked in advance.** The PGCD (12) is offered from step 1, and highlighted **gold** in path B.
- **Irreducibility is announced, not decided.** The lead asks «متى تتوقف؟», but the lab stops by itself.
- **The step-count conjecture is hard-coded as 2 vs 1.** If the student divides by 12 in path A (it is offered), the true statement «الطريقان متساويان» is marked wrong, and the text reads «قارن: 1 خطوات مقابل خطوة واحدة».
- The chip header «اختر قاسمًا مشتركًا للعددين 7 و 4» sits over chips 12, 4, 3.
- Path B is not reachable by drag at 375 px (the chip at y = 314, the zone at y = 860).
- The free lab draws without limit: 9240/7560 draws 16 800 SVG items, and one drop took about 4.4 s.
- The disabled `fraction` zone still receives drops through the magnet.
- In class mode, `autoStep` uses the `path` prop regardless of the current numbers, so «شغّل» would never stop on other numbers [CODE only].

| Instance | Pros | Cons |
|---|---|---|
| **8.1** 12/18, warm-up | gentle first contact, declared as a platform addition | path B has one chip (6), so it is a formality |
| **8.2** 84/48 Samir, default | the portion metaphor is mathematically exact (k identical portions; one portion *is* the new fraction); both paths side by side; reasoned path-B refusal | the error cannot be made; forced second step; gold PGCD; broken conjecture in the 1-step case; the brief prints Samir's ÷4, ÷3 path above the lab; `labDone` only hides a hint, although the module comment claims step 1 waits on it |
| **8.3** 84/48 path [12], Module 2 | its متقدم (595/560) ties to the textbook's method example | **the title states the answer**: «بالقسمة على PGCD(84 ; 48) = 12 — في خطوة واحدة»; the lead promises a one-step lab, but the component forces path A to be redone; the `path` prop leaks into 595/560 (chip 12 offered and refused) |

**Type pros.** The strongest *meaning-carrying* drawing of the second half of the unit (a portion is a fraction). The notation follows the gesture. The default level serves the activity.

**Type cons.** It removes every decision the lesson is about (which divisor, when to stop), marks the answer in gold, and has a conjecture that becomes false in reachable cases.

---

## 28. `divisor-explorer` and `team-builder` beyond lesson 1

- **`divisor-explorer`** (the shell-based division lab) is registered, has `LEVELS` (24 / 1512) and a logic file whose tests are named «420 livres». **No lesson renders it.** Its only effect today is that `logic.test.js` gives false assurance about the books lab (Part I, G-3).
- **`team-builder`** appears only in lesson 1 (1.1). Its type preset advanced level (42/5) is never used.

## 29. Lesson 9 `wadiya-idmajiya-aadad` — no manipulation

A synthesis lesson (وضعية إدماجية). Module 1 uses `InfoSorter`, which sorts the situation's data into «مفيد / غير مفيد» by drag, tap or keyboard, plus `MethodSteps` and `TapQuestion`.

- **Pros:** it matches contract §6bis.2 («a synthesis lesson has no opening manipulation»); it is formative (`onSolved` on the first check).
- **Cons:** it runs on the legacy `manip6e/useDragDrop` engine (defect s), outside the contract's single gesture implementation and outside the e2e drag conventions.

---

## 30. Scoreboard — every instance

Scale: **++** strong · **+** adequate · **−** weak · **−−** broken or absent. The columns are:

| Column | What it rates |
|---|---|
| Object = maths | Is what the student touches and sees the mathematical object itself? |
| Gesture = decision | Does the gesture require a mathematical decision? |
| Discovery gate | Is the discovery earned? |
| No leak | Is the discovery kept secret until then? |
| Phone | Does it work on a phone? |
| Integrated | Does the module use it? |

| ID | Object = maths | Gesture = decision | Discovery gate | No leak | Phone | Integrated | Verdict |
|---|---|---|---|---|---|---|---|
| 1.1 team 15/3 | ++ | + | + (contrast) | − | −− (drag) | − | strong concept, weak phone and gating |
| 1.2 books 420 | + | + | −− (none) | − | − | − | a picture, not a lab |
| 1.3 books 143 | + | − | −− | −− | − | − | a confirmation, with a stray level |
| 2.1 factor 24 | ++ | + | + | − | + | − | good warm-up |
| 2.2 factor 60 | ++ | + | + | −− | + | ++ | best-integrated lab of the unit, leaks its rule |
| 2.3 factor 48 | ++ | + | + | −− | + | − | redundant |
| 2.4 factor 105 | ++ | + | + | −− | + | − | title is the answer |
| 3.1 props 18/12 | ++ | + | + | − | + | ++ | strongest beginner lab |
| 3.2 props 900/90 | + | − | + | − | + | − | hollow advanced (r = 0, no prediction) |
| 3.3 props 35/15 | ++ | + | + | − | + | ++ | solid |
| 3.4 props 56/21 | ++ | + | + | − | + | − | solid, optional |
| 4.1 common 12/18 | + | + | − (luck) | + | + | − | fine warm-up |
| 4.2 common 90/54 | ++ | ++ | − (luck at stage 1) | − | − (long scroll) | − | richest chained lab |
| 4.3 common 28/42 | + | + | + | −− | + | − | spoils Module 3 |
| 5.1 common 8/12 | + | + | − | + | + | − | fine warm-up |
| 5.2 common 42/60 | + | + | − | − | − | − | contradicts its contract; copy of 4.2 |
| 6.1 diff 21/14 | + | − | − (one tile) | − | − | − | warm-up |
| 6.2 diff 252/140 | + | − | + | − | − | −− (dead gate) | textbook table, skippable |
| 6.3 diff 378/315 | + | − | + | −− | − | ++ | distractor broken by the numbers |
| 6.4 Euclid 45/18 | ++ | + | − (one tile) | + | + | − | warm-up |
| 6.5 Euclid 765/135 | ++ | + | + | − | − | −− (dead gate) | best maths, raw-key feedback |
| 6.6 Euclid 3356/1528 | ++ | + | + | − | −− (3 px remainder) | ++ | ambitious, illegible on phone |
| 7.1 coprime 17/18 | ++ | + | −− (one chip) | − | + | −− (dead gate) | good picture, weak gate |
| 7.2 coprime 22/35 | + | − | −− | − | + | − | not autonomous |
| 7.3 coprime 27/36 | + | + | − (exhaustive ≠ textbook) | − | + | − | the only real "no" |
| 7.4 coprime 22/15 | + | − | −− | − | + | − | example only |
| 8.1 fraction 12/18 | ++ | − | − | − | − | − | formality |
| 8.2 fraction 84/48 | ++ | −− (forced) | − (breaks in the 1-step case) | −− (gold) | −− (path B) | − | great drawing, no decisions |
| 8.3 fraction 84/48 [12] | ++ | −− | − | −− (title) | −− | − | title is the answer |

---

## 31. Unit-wide conclusions

### 31.1 What the unit does well (preserve)
1. **Every world is drawn and every count is honest.** Players, books, bricks, flowers, pens, ribbons and spoons are parameterised SVG. The leftovers are drawn; «+n أخرى» replaces silent truncation; no instance showed a picture disagreeing with its arithmetic (swept in `groupingLayout`, `brickLayout`, `teamFormation` and the `autoComplete` tests).
2. **One pure-logic layer per type on core arithmetic**, a closed registry, and an `epoch`-driven re-initialisation. No stale mathematical frame was observed in any type.
3. **Non-drag parity everywhere:** tap-tap and keyboard in every drag type, plus +/− for Euclid and choice buttons for the books lab.
4. **Arabic refusals that name the numbers** (team, properties, common, coprime, fraction path B).
5. **§6bis auto-completion done right:** it is manual first, uses the same transitions as the hand, is cancelled by `epoch`, and leaves the PGCD box manual (differences, Euclid, team).
6. **The chained-lab pattern of 4.2:** a card, a button, a way back, and state that survives.
7. **Workspace level switches never lose state.**

### 31.2 The six unit-wide problems the redesign must address first
1. **Most labs are optional.** 24 of 29 instances gate nothing. Three `onFinished` handlers are dead, and module comments claim gates that do not exist. Page text (titles, leads, bricks, question options) usually states the result the lab is meant to reveal.
2. **Discovery gates are weak or luck-based:**
   - one chip (coprime);
   - one lucky k (common);
   - no gate at all (books);
   - a forced path (fraction);
   - a single candidate (6.1, 6.4, 8.1).
   The discovery rule also leaks through «إظهار الشرح» / `shows`, hint 3, refusal texts, dimmed or gold tiles, and a pre-pressed conjecture (defect d).
3. **Declared cognitive demand is not implemented.** The `autonomy` and advanced-level claims (prediction in 3.2, no hints in 7.2, several choices in 8.2, the student deciding when to stop in 2.2, bare lists in 5.2) are contradicted by the code. Several advanced levels are "the same screen with bigger numbers", which contract §7 forbids.
4. **The shared shell has systemic defects** (§20):
   - magnet, held objects, reset, `pick`, free-lab bypass of lesson callbacks;
   - the stale title, standalone level switches that wipe the work and duplicate other labs;
   - hint leakage, missing zone hints.
   One fix in the shell would repair many instances at once.
5. **Arabic correctness.** Numeral–noun agreement fails in nearly every interpolated string. Unisolated equations are bidi-reversed into false mathematics («7² ≥ 60») or scrambled labels. One raw i18n key reaches students.
6. **Phones.**
   - Stages are 239–267 px wide.
   - Objects are 11–16 px, ribbons 63 px, and a remainder can be 3 px wide.
   - Drags cannot cross long distances (team, fraction path B).
   - Chips are 40 px, and the floating pill overlaps controls.
   - The lab starts 1.5–2 screens below the top of the module.

### 31.3 Test status (Part II)
- **Passed:** unit tests 124/124 and core 80/80; e2e `manipulations.mjs` 183/183; `4am-aadad-tabiiya-natiqa.mjs` 27/27; `validate:lessons --strict`.
- **Never opened by any e2e:** 2.3, 2.4, 3.2–3.4, 4.3, 5.x, 6.1, 6.3, 6.4, 6.6, 7.2 (drag and discovery), 7.3, 8.1, 8.3, 1.3.
- **No test covers:**
  - any conjecture's options or why-texts;
  - the free labs;
  - reset after a free lab;
  - the standalone level switch;
  - agreement or bidi of generated strings;
  - the phone geometry of most types.
- The contract (§10) already admits there is no general `data-phase` ordering assertion.
