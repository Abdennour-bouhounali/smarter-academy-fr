# Page tours — « Visite de la page »

> **Authoritative** for: the first-visit guided tour of each student and
> teacher page — when it opens, how its completion is stored, the registry,
> the overlay, the replay button, and how to add a page or a step.
> Implemented 2026-10-07. Code is the source of truth; this file describes it.
>
> **Status (2026-11-22).** Imported from the Algerian platform (DZ dev 7f4cef1c) on 2026-11-22. True here: storage, the
> provider, the overlay, the replay button and the workspace tours of §4. Not true here: the lesson and lesson-overview
> tours were deleted with the module lessons (the registry has no `page` tour today); the walk `e2e/page-tours.mjs` is
> deleted. The interface is French and left to right since 2026-11-22: every tour text is French
> (`i18n/locales/fr/tour.json`). The daily challenge is OFF (`config/features.js`): its home card and its page are not
> rendered, so the `student.home` challenge step is skipped and `student.challenge` never plays. No walk has checked the
> tours in the French interface.

## 1. Behaviour

- Each **student** or **teacher** page in the registry has its own tour. It
  opens **by itself the first time the account visits that page**: a short
  sequence of steps, each highlighting one key element with a title and one
  sentence of explanation.
- Controls: **Suivant**, **Précédent** (hidden on the first step),
  **Passer** (Skip) and the ✕ button (« Fermer la visite »), **Terminer** (on the last step).
  Keyboard: `Esc` skips; `→` goes to the next step and `←` to the previous one
  (left to right). Keys are ignored while the user types in a field.
- **Finish** stores the tour as `completed`, and **Skip** (or ✕ or `Esc`)
  stores it as `skipped`. Both **close** the tour: it never opens by itself
  again for that account, on any device.
- **Leaving the page in the middle of a tour does not close it.** It opens
  again on the next visit.
- **Nothing is blocked.** The dimmed layer and the spotlight have
  `pointer-events: none`, so the page stays clickable, scrollable and
  navigable during the tour. Only the card takes clicks. Changing route
  closes the card.
- **Replay:** the « Visite de la page » button (signpost icon) in the workspace
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
  TourReplayButton.jsx  « Visite de la page » (label `nav.tourReplay`)         [entry bundle]
  TourOverlay.jsx       card + spotlight + keyboard — React.lazy              [own chunk]
services/tourService.js fetchPageTours / closePageTour
i18n/locales/fr/tour.json   all tour text — ON-DEMAND namespace `tour`        [own chunk]
```

- `PageTourProvider` wraps the shell in **`StudentLayout`** and
  **`TeacherLayout`**. Lesson pages rendered through `CourseLayout` get the
  provider too.
- **How a page's tour is found:** the tour has a `path`, a react-router
  pattern matched exactly against the URL. The other way — a tour declared by
  its component (`useDeclarePageTour`, `findDeclaredTour`, the `autoStart`
  option) — served only the lesson tours and was deleted with them on
  2026-11-22 (commit `4511da19`).
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
  - A step without a target is a centred card, such as « Bienvenue dans ton espace ».
- **Placement** (`placeCard`): the card goes below the target, else above
  it, else at the bottom of the screen overlapping the target. It is kept
  12 px inside the viewport. Rectangles are physical
  (`getBoundingClientRect`). The spotlight
  follows its target every frame (scroll, resize, animations) and slides
  between steps in 200 ms; with `prefers-reduced-motion` there is no slide
  and no smooth scroll.
- **Accessibility:** the card is `role="dialog"` with `aria-modal="false"`
  (the page stays usable) and `aria-labelledby` / `aria-describedby`. It
  receives focus at every step without scrolling. Focus is not trapped.
- **Layers:** the overlay uses `z-[95]` and `z-[96]`, above the workspace
  bars (`z-40`) and modals (`z-50`).

### Text

- The progress counter is `{{current}} sur {{total}}` (« 2 sur 5 ») — a word,
  never `N / M`. The contract test enforces this.
- All text is in `tour.json`. Language, register and vocabulary follow
  `FRENCH_LANGUAGE_CONTRACT.md` (for example « savoir-faire », never
  « compétence » for a learning point).

## 4. Current tours

| Key | Page | Steps (targets) |
|---|---|---|
| `student.home` | `/espace` | welcome · `[data-home-hero]` · `[data-daily-challenge-card]` · `[data-home-stats]` · `[data-home-where]` · nav · replay button |
| `student.courses` | `/espace/cours` | search · themes (« Les thèmes ») filter · view toolbar · lesson list (`catalogue.*`) |
| `student.challenge` | `/espace/defi` | mission · start button · score · history (intro phase only) — the route is closed while the daily challenge is off |
| `student.explorer` | `/espace/explorer` | search · my grade · other grades · themes · list |
| `student.mathlab` | `/espace/atelier` | shared tools · lab choice · lab switch · tools · « Mes travaux » (landing and `?lab=` views each keep the steps they show) |
| `student.progression` | `/espace/progression` | stats · « À travailler maintenant » · curriculum |
| `student.notebook` | `/espace/cahier` | new note · search · views · filters (sidebar on desktop, button on phone) |
| `student.class` | `/espace/classe` | current classes · teacher recommendations · join by code |
| `student.profile` | `/espace/profil` | identity · access · settings |
| `student.unit` | `/courses/:levelId/:gradeId/:chapterId/units/:unitId` | objectives · challenge · progress · first lesson card — each target also matches the student view of a converted unit (`UnitMissionView`) |
| `teacher.home` | `/enseignant` | welcome · usage · new class · classes · nav · replay button |
| `teacher.courses` | `/enseignant/cours` | search · grades · themes · list |
| `teacher.mathlab` | `/enseignant/atelier` | same targets as the student, teacher text |
| `teacher.notebook` | `/enseignant/cahier` | new note · search · views |
| `teacher.classes` | `/enseignant/classes` | new class · class card |
| `teacher.class` | `/enseignant/classes/:id` | join access · tab bar · « Les élèves » · « Les savoir-faire » · « Les leçons » tabs |
| `teacher.reviews` | `/enseignant/corrections` | queue · class filter · an answer · send |
| `teacher.plan` | `/enseignant/offre` | current plan · how-to · seats · activation code |
| `teacher.profile` | `/enseignant/profil` | name |
| `teacher.unit` | same path as `student.unit` | objectives · lesson card · « Les étapes » chips (`[data-lesson-modules]`) · « La fiche du professeur et le mode classe » (`[data-teacher-lesson-actions]`) |

The unit tour plays **once per account across all units**, not once per unit.

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
   exactly; the query string is ignored.
3. **Write the text** in `i18n/locales/fr/tour.json` under
   `<role>.<page>.<stepId>.title|body`: a short title and one simple sentence.
4. **Run** `npx vitest run src/features/tours` (registry contract).

`tourRegistry.test.js` fails if a step has no French title or body (or carries an Arabic letter), if a
`data-*` hook it targets is set nowhere in the code (the scan covers `src/`),
or if the shared controls or the replay label are missing.
`tourModel.test.js` covers matching, auto-start, step skipping and placement.

## 6. Tests

| Test | What it proves |
|---|---|
| `apps/api/tests/Feature/PageTourTest.php` | empty list for a new account; finish and skip are stored per account; replay keeps one row with the last outcome; another role's key → 403, malformed key → 404, bad status → 422; admin → 403; unverified → 403; guest → 401; `eligible_since` |
| `features/tours/tourModel.test.js` | pure logic and placement |
| `features/tours/tourRegistry.test.js` | registry ↔ text ↔ code hooks |
