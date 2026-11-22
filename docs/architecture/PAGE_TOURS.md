# Page tours — « جولة تعريفية »

> **Authoritative** for: the first-visit guided tour of each student and
> teacher page — when it opens, how its completion is stored, the registry,
> the overlay, the replay button, and how to add a page or a step.
> Implemented 2026-10-07. Code is the source of truth; this file describes it.

## 1. Behaviour

- Each **student** or **teacher** page in the registry has its own tour. It
  opens **by itself the first time the account visits that page**: a short
  sequence of steps, each highlighting one key element with a title and one
  sentence of explanation.
- Controls: **التالي** (Next), **السابق** (Previous, hidden on the first step),
  **تخطّي** (Skip) and the ✕ button, **إنهاء** (Finish, on the last step).
  Keyboard: `Esc` skips; the arrow keys move between steps in reading
  direction (in RTL, `←` is Next). Keys are ignored while the user types in a
  field.
- **Finish** stores the tour as `completed`, and **Skip** (or ✕ or `Esc`)
  stores it as `skipped`. Both **close** the tour: it never opens by itself
  again for that account, on any device.
- **Leaving the page in the middle of a tour does not close it.** It opens
  again on the next visit.
- **Nothing is blocked.** The dimmed layer and the spotlight have
  `pointer-events: none`, so the page stays clickable, scrollable and
  navigable during the tour. Only the card takes clicks. Changing route
  closes the card.
- **Replay:** the « جولة في الصفحة » button (signpost icon) in the workspace
  navigation plays the current page's tour again. It is the only way to see a
  closed tour again. Finishing or skipping a replay updates the stored
  outcome. The button is hidden on pages that have no tour.
- **Admins** have no tours: the server refuses with 403, and their layouts
  do not mount the provider.

### Which accounts see tours

By default **every** student and teacher account sees each page's tour once.
Accounts created before the feature (2026-10-07) also see them, once per
page. To limit automatic tours to new accounts, set `TOURS_ELIGIBLE_SINCE`
(`YYYY-MM-DD`) in the API `.env`. The value is read by `config/tours.php`.
Accounts created before that date get `eligible: false`: they see no tour
automatically, but the replay button still works for them.

## 2. Storage (server)

| Piece | Where |
|---|---|
| Table | `page_tours` (`user_id`, `tour`, `status` = `completed` \| `skipped`, `step`, timestamps; unique `(user_id, tour)`) — migration `2026_10_07_000017_create_page_tours_table.php` |
| Model | `App\Models\PageTour`, `User::pageTours()` |
| API | `GET /api/v1/me/tours` → `{ success, eligible, tours: { "<key>": { status, step, at } } }`; `POST /api/v1/me/tours/{key}` with `{ status, step? }` (throttle 60/min). Both live in the `auth:sanctum` + `account.active` + `email.verified` group. |
| Controller | `App\Http\Controllers\PageTourController` |
| Tests | `apps/api/tests/Feature/PageTourTest.php` |

**Key rules** (enforced by the controller):

- A key matches `^(student|teacher)\.[a-z][a-z0-9-]{0,47}$`. Anything else
  returns 404.
- The role prefix must equal the caller's role. A student cannot close
  `teacher.*` (403).
- The page registry lives **in the front end**. The server keeps only the key
  format, so adding a page needs no backend change.
- One row per (user, tour): `updateOrCreate`, and the last outcome wins.

**Never rename a published key.** The stored row would no longer match, and
the tour would open again for every account.

## 3. Front end

```text
features/tours/
  tourRegistry.js       DATA: one entry per (role, page) — key, path, steps   [entry bundle]
  tourModel.js          PURE: findPageTour, shouldAutoStart, playableSteps,
                        nextPlayableIndex, placeCard                          [entry bundle]
  PageTourProvider.jsx  fetches /me/tours once, opens the page's tour,
                        stores closures, exposes usePageTour()                [entry bundle]
  TourReplayButton.jsx  « جولة في الصفحة » (label in `nav`)                    [entry bundle]
  TourOverlay.jsx       card + spotlight + keyboard — React.lazy              [own chunk]
services/tourService.js fetchPageTours / closePageTour
i18n/locales/ar/tour.json   all tour text — ON-DEMAND namespace `tour`        [own chunk]
```

- `PageTourProvider` wraps the shell in **`StudentLayout`** and
  **`TeacherLayout`**. Lesson pages rendered through `CourseLayout` get the
  provider too.
- **Two ways to find a page's tour:**
  - **By path:** the tour has a `path`, a react-router pattern matched
    exactly against the URL. This is how every workspace page is found.
  - **By declaration:** the tour has a `page` name instead of a path. The
    component calls `useDeclarePageTour(page, enabled, { autoStart })`, the
    declaration takes priority over the path tour, and it is withdrawn when
    the component unmounts. This is for pages whose URL does not identify
    them: any lesson module (`lesson-module`) and any lesson overview
    (`lesson-index`). With `autoStart: false` the tour never opens by itself
    but the replay button still plays it: lesson modules other than the first
    declare it that way. Outside a provider (visitor, admin) the hook does
    nothing.
- **Waiting for the server:** until `GET /me/tours` answers, no tour opens,
  so a tour already seen is never flashed. If the request fails, nothing
  opens.
- **Lost writes:** a closure is first written to `scopedStorage`
  (`tours.pending`, scoped per user), then posted. The next load merges the
  pending entries into the server's answer and posts them again, so a tour
  closed while offline does not reopen in that browser.
- **Targets are CSS selectors.** The overlay uses the **first visible**
  match: non-zero size and not `visibility: hidden`. This is how one step can
  point at the desktop sidebar and, on a phone, at the bottom tab bar: both
  carry `data-tour="workspace.nav"`.
- **Pages load late.** The overlay polls for targets every 150 ms. It stops
  when every target is present, 1.2 s after the first target appears, or
  after 6 s at most. Then it keeps the playable steps.
  - A step whose target is missing is skipped (an empty state, a desktop-only
    element, a state the page is not in, such as the challenge outside its
    intro phase).
  - A tour with **no targeted step left** does not play and is **not closed**,
    so it tries again on the next visit.
  - A step without a target is a centred card, such as « مرحبًا بك ».
- **Placement** (`placeCard`): the card goes below the target, else above
  it, else at the bottom of the screen overlapping the target. It is kept
  12 px inside the viewport. Rectangles are physical
  (`getBoundingClientRect`), so RTL needs no special case. The spotlight
  follows its target every frame (scroll, resize, animations) and slides
  between steps in 200 ms; with `prefers-reduced-motion` there is no slide
  and no smooth scroll.
- **Accessibility:** the card is `role="dialog"` with `aria-modal="false"`
  (the page stays usable) and `aria-labelledby` / `aria-describedby`. It
  receives focus at every step without scrolling. Focus is not trapped.
- **Layers:** the overlay uses `z-[95]` and `z-[96]`, above the workspace
  bars (`z-40`) and modals (`z-50`).

### RTL and Arabic

- The progress counter is « الخطوة N من M » written as `{{current}} من {{total}}`
  — never `N / M`, which flips in RTL. The contract test enforces this.
- The Next and Previous chevrons flip with `document.dir`. The progress dots
  follow the flex direction.
- All text is in `tour.json`. Terminology follows `ARABIC_RTL_CONTRACT.md`,
  for example « الكفاءات » and never « نقاط التعلّم ».

## 4. Current tours

| Key | Page | Steps (targets) |
|---|---|---|
| `student.home` | `/espace` | welcome · `[data-home-hero]` · `[data-daily-challenge-card]` · `[data-home-stats]` · `[data-home-where]` · nav · replay button |
| `student.courses` | `/espace/cours` | search · ميادين filter · view toolbar · lesson list (`catalogue.*`) |
| `student.challenge` | `/espace/defi` | mission · start button · score · history (intro phase only) |
| `student.explorer` | `/espace/explorer` | search · my grade · other grades · ميادين · list |
| `student.mathlab` | `/espace/atelier` | shared tools · lab choice · lab switch · tools · أعمالي (landing and `?lab=` views each keep the steps they show) |
| `student.progression` | `/espace/progression` | stats · « للعمل الآن » · curriculum |
| `student.notebook` | `/espace/cahier` | new note · search · views · filters (sidebar on desktop, button on phone) |
| `student.class` | `/espace/qism` | current classes · teacher recommendations · join by code |
| `student.profile` | `/espace/profil` | identity · access · settings |
| `student.unit` | `/courses/:levelId/:gradeId/:chapterId/units/:unitId` | objectives · challenge · progress · first lesson card — each target also matches the student view of a converted unit (`UnitMissionView`, 2026-11-09: the goals chip, the challenge card, the lessons-done counter, the unit path) |
| `student.lesson-index` | **declared** (`lesson-index`) by `LessonIndex`, never in وضع القسم | hero · tools (المختبر) · progress · الكفاءات (`[data-lesson-structure]`) · modules |
| `student.lesson` | **declared** (`lesson-module`) by `ModuleLayout` on EVERY module, never in وضع القسم; opens by itself only on the first module (position 1, so « أستعدّ » when the lesson starts at module 00), replayable from any module | welcome · module header · position in the lesson · « 🧠 بطاقتي » knowledge map (`[data-km-trigger]`) · « 📓 كرّاسي » notebook (`[data-nb-trigger="lesson"]`) · المختبر (`[data-ml-overlay-trigger]`) · previous/next navigation |
| `teacher.home` | `/enseignant` | welcome · usage · new class · classes · nav · replay button |
| `teacher.courses` | `/enseignant/cours` | search · grades · ميادين · list |
| `teacher.mathlab` | `/enseignant/atelier` | same targets as the student, teacher text |
| `teacher.notebook` | `/enseignant/cahier` | new note · search · views |
| `teacher.classes` | `/enseignant/classes` | new class · class card |
| `teacher.class` | `/enseignant/classes/:id` | join access · tab bar · التلاميذ · الكفاءات · الدروس tabs |
| `teacher.reviews` | `/enseignant/tashih` | queue · class filter · an answer · send |
| `teacher.plan` | `/enseignant/offre` | current plan · how-to · seats · activation code |
| `teacher.profile` | `/enseignant/profil` | name |
| `teacher.unit` | same path as `student.unit` | objectives · lesson card · محاور chips (`[data-lesson-modules]`) · مذكرة الدرس / وضع القسم (`[data-teacher-lesson-actions]`) |
| `teacher.lesson-index` | same declaration as `student.lesson-index` | hero · tools (وضع القسم, المختبر) · الكفاءات · modules |
| `teacher.lesson` | same declaration as `student.lesson` | same targets, teacher text (all modules open, no progress recorded) |

The lesson tour plays **once per account across all lessons**, not once per
lesson. Opening any lesson's first module after closing it does not reopen
it. The same holds for `*.lesson-index` and `*.unit`: one tour for every
lesson overview, one for every unit page. Until 2026-10-08 only the first
module declared the lesson tour, so the replay button was missing on every
other module, on the lesson overview and on the unit page.

Shared components (catalogue, Math Lab, notebook) carry role-neutral hooks.
Each role has its own key and its own text.

## 5. Adding a tour or a step

1. **Pick the targets.** First reuse an existing `data-*` hook of the page
   (`[data-home-hero]`, `[data-nb-new]`…). Otherwise put
   `data-tour="<page>.<element>"` on the element's outer wrapper, never on a
   text node. Prefer elements that are rendered as soon as the page has
   loaded.
2. **Register** in `tourRegistry.js`: `{ key: '<role>.<page>', role, path, steps: [{ id, target? }] }`.
   Use one key per (role, page). `path` is a react-router pattern matched
   exactly; the query string is ignored. If the URL cannot identify the page,
   use `page: '<name>'` instead of `path`, and call
   `useDeclarePageTour('<name>', condition)` in the component, before any
   early return.
3. **Write the text** in `i18n/locales/ar/tour.json` under
   `<role>.<page>.<stepId>.title|body`: a short title and one simple sentence.
4. **Run** `npx vitest run src/features/tours` (registry contract) and
   `node apps/web/e2e/page-tours.mjs` with Vite running (add the page to its
   `PAGES` list).

`tourRegistry.test.js` fails if a step has no Arabic title or body, if a
`data-*` hook it targets is set nowhere in the code (the scan covers `src/`
and the shared lesson engine `lessons/common`, but not lesson content), if a
tour has neither or both of `path` and `page`, if two tours share a
(role, page), or if a key does not match the server's format.
`tourModel.test.js` covers matching, auto-start, step skipping and placement.

## 6. Tests

| Test | What it proves |
|---|---|
| `apps/api/tests/Feature/PageTourTest.php` | empty list for a new account; finish and skip are stored per account; replay keeps one row with the last outcome; another role's key → 403, malformed key → 404, bad status → 422; admin → 403; unverified → 403; guest → 401; `eligible_since` |
| `features/tours/tourModel.test.js` | pure logic and placement |
| `features/tours/tourRegistry.test.js` | registry ↔ text ↔ code hooks |
| `apps/web/e2e/page-tours.mjs` | in the browser, student and teacher, desktop 1440 and phone 390: the tour opens on first visit with Arabic text (no raw key), the card stays on screen, there is no horizontal overflow, Finish → `completed`, Esc → `skipped`, a closed tour stays closed after reload, the dimmed layer does not intercept clicks, the replay button plays the tour again, and there are no console errors. For lessons: module « المعارف » does not open the tour, the first module does and includes the بطاقتي and كرّاسي steps, and once closed it stays closed on any lesson. The student sidebar's account tools fit on one row |
