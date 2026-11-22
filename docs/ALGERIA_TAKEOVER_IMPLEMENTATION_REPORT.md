# Algeria Platform — Takeover Implementation Report

Date: 2026-09-16. Scope: independent review of the inherited Phase 1–4 work,
correction of defects found, and preparation for the 4AM curriculum.

Method: the **repository** was treated as the source of truth, not the previous
agent's report. Every claim below was checked against code, database, test runs
or a running browser. Statuses use: COMPLETE / PARTIAL / NOT STARTED / BLOCKED /
`UNKNOWN — REQUIRES VERIFICATION`.

---

## 1. Executive Summary

The inherited work is **structurally sound and worth keeping**. The clone is
clean, the dormant-content isolation is real (not cosmetic), and the RTL
direction switch was correctly scoped to the shared shell rather than sprayed
across 573 dormant French lesson files.

Six real defects were found and fixed. Three were in isolation/architecture (a
duplicate, unwired activation list; admin exposing dormant French grades; an
untracked `.env.example`), and three in the RTL foundation (an Arabic font rule
that could never match, invalid DOM for block math, and a Knowledge Map hard-wired
to the physical right edge). A seventh — three files using an icon they never
imported, blanking the homepage in a production build — was caught only by
browser QA, which is the strongest argument for keeping that step mandatory.

Nothing was reverted wholesale. The previous agent's decisions were, on review,
mostly right; the corrections are to mechanics, not to direction.

**The platform is ready for Phase 5 (Authentication).** It is *not* ready for
curriculum work: the official Algerian programme has not been supplied in a
verifiable form (§14, §15).

---

## 2. Repository State

| Item | State |
|---|---|
| `smarter-academy-dz` HEAD | `960bf29` (2 takeover commits on top of the inherited 5) |
| Git remote | none configured — independent history, no French remote |
| Working tree | clean after commit |
| `smarter-academy-fr` | **untouched** — HEAD still `03199c4`, same 16 pre-existing uncommitted files as before the session |
| Runtime dependency DZ → FR | none found |
| Tracked secrets | none. `.env*` ignored; `.env.example` templates now tracked (fixed, §6) |
| Local database | `smarter-academy-dz`, 50 migrations applied, 8 grades / 36 chapters / 133 lessons / 1067 learning points |

Commit history:

```
960bf29 fix(dz): correct Arabic RTL foundation              ← this takeover
05dd579 chore(dz): audit and stabilize inherited implementation ← this takeover
84ede72 fix(dz): stop /espace/bienvenue from trapping students with no grade
699026b feat(dz): establish Arabic RTL foundation (Phase 4)
98e9d8d feat(dz): isolate inactive French curriculum (Phase 3)
e09ad1c chore(dz): begin independent infrastructure (Phase 2, code-level)
984fb2a docs(dz): record Phase 1 completion and baseline-validation findings
ec46a0e chore(dz): establish independent project baseline
```

---

## 3. Previous Agent Work Reviewed

| Commit | Claimed | Verified finding |
|---|---|---|
| `ec46a0e` | Phase 1 clone | Accurate. 3729 files, fresh history, no `.git` from FR, no production SQL dump, no real `.env`. |
| `e09ad1c` | Phase 2 (code-level) | Accurate and honestly scoped — it changed one doc and deferred real provisioning. |
| `98e9d8d` | Phase 3 isolation | Real and effective, but with a duplicate activation list (§5.1) and no admin coverage (§5.2). |
| `699026b` | Phase 4 RTL | Real; three mechanical defects (§5.4–5.6). |
| `84ede72` | ChooseGrade fix | Correct and necessary — a genuine redirect trap. Kept as-is. |

---

## 4. Changes Found

Inherited from the previous agent and **kept**:

- `packages/core/curriculum/activeGrades.js` — `ACTIVE_GRADE_IDS`, empty. Correct: no Algerian grade exists yet.
- `coursesData.js` split into `allCourseLevels` (full, for DB import and tooling) and `courseLevels` (active-filtered, for the app). Good design — it starves every student-facing consumer at one point.
- `registry.js` glob filtered by grade — defence in depth.
- `App.jsx` — all 132 French lesson routes unmounted; files retained on disk.
- `check-dormant-isolation.mjs` + extended `check-routes.mjs` (fails on an *unexpected* mount, not only a missing one).
- `src/locale.js`, `src/i18n/` with real Arabic for the shared shell.
- `MathText`/`MathInput`/`CoordPlane` LTR isolation.

---

## 5. Problems Found

**5.1 — Two competing sources of truth for grade activation. (High)**
`ContentAccess` read `config('curriculum.active_grades')`, fed by a
`CURRICULUM_ACTIVE_GRADES` env var that was **empty and never connected to
`activeGrades.js`**. The frontend and the API could therefore disagree silently,
and activating 4AM would have required editing two unrelated places — with the
failure mode being "the API serves content the catalogue hides", i.e. exactly
the leak the phase exists to prevent.

**5.2 — Admin exposed every dormant French grade. (High)**
Master spec §20 forbids it. `ContentService::lessons/modules/exercises` and
`AnalyticsService::content` had no activation filter; the three admin filter
dropdowns were hard-coded French arrays (`['6e','5e',…,'terminale_specialite']`).

**5.3 — `.env.example` untracked. (Medium)**
`.gitignore` ignored `.env*` wholesale, so the only file that documents which
variables exist was absent from a fresh clone.

**5.4 — The Arabic font rule could never match. (High, user-visible)**
`[dir="rtl"] html { font-family: Tajawal … }` — `<html>` has no ancestor, so the
selector never matches. Arabic text rendered in Inter/Space Grotesk, neither of
which contains Arabic glyphs, leaving shaping to an arbitrary system fallback.
The phase's central typography claim was not in effect.

**5.5 — Block math produced invalid DOM. (Medium)**
`MathText` wrapped `BlockMath` — which renders a `<div>` — inside a `<span>`.
React reports a nesting violation and browsers reparent the node, which can
detach it from its intended layout context.

**5.6 — Knowledge Map hard-wired to the physical right edge. (High)**
Geometry (`vpOuter - maCarteWidth`), slide-in (`x: '100%'`), the resize-handle
maths and the border/radius classes all assumed "right". Under RTL the sidebar
occupies the right, so the panel would have opened **on top of it**. The previous
report documented this as an accepted exception; on review it is a functional
defect in a core lesson surface, not a cosmetic trade-off, so it was fixed.

**5.7 — Missing imports blanked the homepage. (Critical, introduced during this takeover)**
While centralising directional icons, three files (`FreePremiumTeaser`,
`MethodTeaser`, `PracticeSession`) ended up using `ArrowForward`/`ArrowBack`
without importing them — the lucide import line they were being removed from had
become empty. `npm run build` passed; the page threw at render and `#root` stayed
empty. Found by browser QA, fixed before commit.

**5.8 — Physical/`rtl:`-pair duplication. (Low, maintainability)**
The inherited pass paired each `pl-*`/`left-*` with an `rtl:` override. Correct,
but it doubles the surface to keep in sync.

---

## 6. Problems Fixed

| # | Fix | Files |
|---|---|---|
| 5.1 | Activation travels with the catalogue: `exportCurriculum.mjs` emits `active` per grade → `smarter:import-curriculum` mirrors it into a new `grades.is_active` column → `ContentAccess` reads that column. Duplicate config key deleted. `smarter:registry-health` now reports source↔DB drift. | `exportCurriculum.mjs`, `CurriculumImporter.php`, `Grade.php`, migration `2026_09_16_000001`, `ContentAccess.php`, `config/curriculum.php`, `RegistryHealthService.php` |
| 5.2 | Admin lists/analytics filter on `grades.is_active` unless `scope=all` is passed explicitly; admin grade dropdowns derive from the active catalogue. | `ContentService.php`, `AnalyticsService.php`, admin `Lessons/Modules/Exercises.jsx` |
| 5.3 | `!.env.example` un-ignored; `apps/web/.env.example` created (the missing `VITE_API_URL`). | `.gitignore`, both `.env.example` |
| 5.4 | Tajawal is now the Arabic **fallback inside every stack** (`html`, headings, `font-inter`, `font-space`) — which also fixes mixed Arabic/Latin lines: Latin keeps the identity font, Arabic resolves per glyph. | `index.css`, `tailwind.config.js` |
| 5.5 | Block math → `<div class="sa-math-block">`, inline → `<span class="sa-math-inline">`; styles moved to CSS classes. | `MathText.jsx`, `index.css` |
| 5.6 | End-edge derived from `IS_RTL` in one place per case (3 geometries, slide-in sign, handle maths); borders/radii use logical utilities; the floating trigger moved to the opposite edge so the panel cannot cover it. | `KnowledgeMap.jsx`, `index.css` |
| 5.7 | Imports added; every consumer re-verified programmatically. | 3 files |
| 5.8 | 105 physical/`rtl:` pairs collapsed to logical utilities (`ps-*`, `start-*`, `border-s`, `text-start`, `rounded-es-*`). Physical values kept **deliberately** where the element is physical (password toggle on its `dir="ltr"` field; `translate-x` nudges mirrored explicitly). | ~40 files |
| — | Directional icons centralised in `DirectionalIcons.jsx` (22 files + a literal `→` in `LessonCard`). Fixed-meaning glyphs (⏎, play, math arrows) deliberately excluded. | `DirectionalIcons.jsx` + consumers |
| — | Nav strings moved to i18n `labelKey`s. | `navigation.js`, `studentNavigation.js`, `Navbar`, `Footer`, `StudentNavbar` |
| — | Math **figures** pinned LTR: bar model and table of values. | `BarModel.jsx`, `ValueTable.jsx` |

---

## 7. Phase 1 Verification — COMPLETE

Independent repo ✓ · no FR remote ✓ · no production SQL dump ✓ · no real `.env`
committed ✓ · independent `APP_KEY` ✓ · independent MySQL database ✓ ·
50 migrations apply clean ✓ · build/tests/gate green ✓.

---

## 8. Phase 2 Verification — PARTIAL (as documented, not overstated)

Local infrastructure COMPLETE: own database, own `APP_KEY`, own local env.

**NOT STARTED, and genuinely owner-blocked** (§19): production hosting,
production database, DZ Google OAuth application, SMTP, analytics, backups.

---

## 9. Phase 3 Verification — COMPLETE (after fixes)

Frontend catalogue filtered ✓ · lesson registry filtered ✓ · zero French lesson
routes mounted ✓ · backend gate ✓ (now on `grades.is_active`) · **admin filtered
✓ (fixed)** · French curriculum physically retained in the database ✓ (8 grades /
133 lessons / 1067 LPs still present) · CI gate ✓.

Verified by API call: an admin listing returns only active grades; `?scope=all`
returns the dormant ones. Covered by `DormantGradeIsolationTest` (6 tests).

---

## 10. Phase 4 / RTL Verification — COMPLETE for the shell; lesson content deferred

| Area | Status | Evidence |
|---|---|---|
| `dir="rtl" lang="ar"` | COMPLETE | all 17 QA pages |
| Arabic typography | COMPLETE (fixed) | Tajawal now reachable as per-glyph fallback |
| Logical CSS | COMPLETE for the shell | 105 pairs → logical utilities; `inset-inline-start` confirmed in-browser |
| Shell layout mirror | COMPLETE (fixed) | RTL = gutter left + sidebar right; LTR = exact opposite, both asserted on computed style |
| KaTeX | **PASS** | 7 expressions (inline, block, fraction, inequality, root, power) all `direction: ltr` + `unicode-bidi: isolate`; 0 nesting errors |
| Coordinate planes / SVG | PASS by construction, `UNKNOWN — REQUIRES VERIFICATION` visually | `CoordPlane` pinned `dir="ltr"`; no mounted lesson exists to render it |
| MathLive | `UNKNOWN — REQUIRES VERIFICATION` | `MathInput.jsx` has **zero importers** — dead code. Defensive `dir="ltr"` applied; caret/selection behaviour untestable until a real exercise uses it |
| Icons | COMPLETE for the live tree | centralised; fixed-meaning glyphs excluded by design |
| Animations | COMPLETE | slide-in sign and `translate-x` nudges mirrored |
| Admin UI | COMPLETE (layout) / French copy (intentional, Phase 12) | sidebar right, `<main>` reserves right |
| Mobile | COMPLETE | 390×844, drawer opens, no overflow |
| Lesson content (573 dormant files) | NOT STARTED — deliberate | unmounted; handled per-lesson in Phase 8/9 |

---

## 11. Authentication Status — PARTIAL

Untouched by both agents beyond page translation; architecture inherited intact.

Working: email/password via Sanctum ✓ · registration ✓ · login/logout ✓ ·
protected routes ✓ · admin authorisation ✓ (`can:admin` + `account.active`) ·
email verification ✓. Verified by logging in as a real student and admin and
driving authenticated pages.

Google OAuth: code present and correct, **credentials are FR's**. The redirect
URI the backend will use is read from config, not the request:

```
GOOGLE_REDIRECT_URI = http://localhost:8000/api/v1/auth/google/callback
```

`BLOCKED` on the owner creating a **separate DZ Google Cloud project** (§19).
Do not reuse the French client.

---

## 12. Entitlement / Activation Code Status — COMPLETE (phase 6, 2026-09-16)

> **MISE À JOUR.** La phase 6 a été exécutée : voir
> `ALGERIA_PHASE6_IMPLEMENTATION_REPORT.md`. Le constat ci-dessous décrit
> l'état d'AVANT, et il s'est vérifié juste : la couche d'accès était bien la
> bonne fondation, et elle n'a pas été remplacée — un type de droit de plus a
> suffi (`Entitlement::TYPE_ACTIVATION_CODE`). `ContentAccess` et `AccessTier`
> sont inchangés. « 3 leçons gratuites » est resté un étiquetage de contenu,
> désormais porté par une liste nommée (`freeLessons.js`).

### L'état d'avant la phase 6



`Entitlement` / `EntitlementService` / `ContentAccess` / `AccessTier` are
inherited, server-authoritative, and suitable. `Entitlement::TYPES` is
`subscription | admin_override` — no activation-code type, no `activation_codes`
table, no redemption endpoint, no admin screen. Nothing fake was introduced.
`lessons.tier` already exists, so "3 free lessons" is a content-tagging decision
rather than new code. This is Phase 6.

---

## 13. Admin Status — PARTIAL

Exists and works: RBAC, dashboard, content lists (lessons/modules/exercises),
publication + tier control, bulk actions, students, reports, analytics, activity
log, registry health. Dormant French grades are now excluded (§6).

Missing for Algeria: activation-code management (Phase 6/12), Arabic admin copy
(deliberately deferred — staff surface, Phase 12).

---

## 14. Curriculum Readiness — NOT STARTED, and correctly blocked

`ACTIVE_GRADE_IDS` is empty; `grades.is_active` is false for all 8 French grades;
no `4am` grade exists in `coursesData.js` or the database. No Algerian curriculum
content has been written or invented. This is the correct state.

---

## 15. 4AM Curriculum Working Specification — status of the supplied outline

> **MISE À JOUR 2026-09-16.** Le propriétaire du projet a depuis fourni le
> programme 4AM comme **spécification officielle** pour 2026/2027. Il est
> transcrit au mot près dans `docs/ALGERIA_4AM_CURRICULUM.md` et en données
> dans `packages/core/curriculum/dz/programme_4am_2026_2027.json`. La réserve
> ci-dessous reste vraie sur un point : il n'a pas été confronté à un document
> ministériel dans ce dépôt, et le document d'accompagnement n'a pas été
> fourni. Les questions qu'il ne tranche pas portent toujours
> `[À VÉRIFIER DANS LE PROGRAMME OFFICIEL]`.



The outline supplied in the takeover brief (4 domains: أنساب الأعداد والحساب /
الحساب الحرفي / الهندسة / تنظيم المعطيات) is recorded as a **candidate working
specification provided by the project owner**.

It is **NOT** verified against an authoritative source. Searched for and **not
found** in this repository: any official Algerian curriculum document, ONEFD/ONPS
publication, or ministry PDF. The Facebook references mentioned in the brief are
not sufficient to establish official status.

Therefore every curriculum-dependent decision is marked:

```
[À VÉRIFIER DANS LE PROGRAMME OFFICIEL]
```

Gaps must not be filled from the French curriculum, general mathematical
knowledge, another Algerian grade, or another generation/year.

**Owner action required:** supply the official *Programme de mathématiques —
4ᵉ année moyenne, 2ᵉ génération* for the target school year (2026/2027), plus the
official *document d'accompagnement* if available.

---

## 16. Automated Test Results (actually executed)

| Command | Result |
|---|---|
| `npm run check:lessons` | **exit 0** — validate:lessons, validate:exercises, audit:knowledge:gate, check:katex, check:routes (0 active of 132 mounted, and only those), check:level-leak (24 lessons), check:non-blocking, check:dormant-isolation |
| `npm test` | **5172 passed, 4 skipped** (200 `packages/core` + 4929 `apps/web` + 43 scripts) |
| `php artisan test` | **641 passed, 2362 assertions** (+1 new admin-isolation test) |
| `npm run build` | **✓ built**, no errors |
| `php artisan migrate` | 50/50 applied |
| Lint / typecheck | **none configured** in this project — no `lint` or `typecheck` script exists in any `package.json` |

The Laravel suite must be run against MySQL (`DB_CONNECTION=mysql
DB_DATABASE=smarter-academy-dz-testing …`): `phpunit.xml` declares SQLite, but a
migration uses MySQL-only `MODIFY` DDL. Pre-existing French defect, documented in
the roadmap, not fixed here.

---

## 17. Browser QA Results (Playwright, production build)

17 pages at 1280×900 / 1400×950, plus 390×844 mobile. **Zero page errors, zero
console errors, zero horizontal overflow**; every page `dir=rtl lang=ar`.

Public: home, login, register, courses, FAQ.
Student (real authenticated session): espace, mes cours, progression, profil, bienvenue.
Admin (real authenticated session): dashboard, leçons, élèves, cohérence.
Mobile: home + drawer open, student home.

Measured, not eyeballed:
- Admin sidebar `x = 1144…1400` on a 1400px viewport (right edge), `inset-inline-start: 0`, `<main>` reserves `padding-right: 256px`.
- Workspace mirror: with a gutter set, **RTL** → `padding-left: 380px` (map) + `padding-right: 256px` (rail); **LTR** → exactly reversed.
- Knowledge Map under RTL: panel at `x = 0…400` (left edge), resize handle at `x ≈ 399` (its content-facing edge).
- Math: 7 expressions, each `direction: ltr` + `unicode-bidi: isolate`; 0 DOM-nesting errors.

`UNKNOWN — REQUIRES VERIFICATION`: no *real lesson page* was rendered, because
none is mounted (Phase 3, by design). Knowledge Map and math were exercised
through a temporary probe mounting the real components; the probe was removed
after use. Full lesson QA belongs to Phase 8.

---

## 18. Remaining Risks

1. ~~**Screenshot capture on the probe page was unreliable.**~~ **FERMÉ (phase 6)** : une surface de QA isolée (`apps/web/src/qa/rtlLessonFixture/`, absente du lot de production) monte les vrais composants du moteur avec du texte arabe. Captures d'écran obtenues et lues. Trois défauts réels trouvés en regardant : `NumberLine` et quatre autres figures non épinglées LTR (« -5 » rendu « 5- »), et le déclencheur de la carte des connaissances inatteignable sous RTL. Voir le rapport de phase 6 §11.
2. **MathLive is dead code.** Its RTL behaviour is unverifiable until something uses it; caret/selection under RTL is a known failure class.
3. ~~**Activation drift.**~~ **FERMÉ (phase 6)** : `npm run check:activation-drift` est désormais dans `check:lessons`. Il vérifie que l'export reflète le catalogue, puis délègue la comparaison base ↔ export à `smarter:registry-health --gate`. Le **palier** est surveillé en plus de l'activation — la dérive commerciale (« le catalogue vend, la base offre ») ne l'était nulle part. Une source absente est un échec en mode porte.
4. **Admin copy is French.** Acceptable for staff, must not leak into student surfaces.
5. **Marketing/legal copy is French and mentions French grades and €35/an.** Phases 6 and 13.
6. **`phpunit.xml` declares SQLite but migrations need MySQL.** Any CI must override it.

---

## 19. Blockers (genuine, owner-side)

| # | Blocker | Exact action required |
|---|---|---|
| B1 | Official 4AM curriculum | **PARTIELLEMENT RÉSOLU (2026-09-16)** : le propriétaire a fourni le programme 4AM (4 domaines, 28 sujets), transcrit dans `docs/ALGERIA_4AM_CURRICULUM.md`. Restent non fournis : le document d'accompagnement, la répartition horaire et les attendus de fin de cycle — d'où le découpage en leçons, qui reste une décision à prendre. **Terminale-DZ reste entièrement bloquée** (aucun programme fourni). |
| B2 | DZ Google Cloud project | Create a project independent of France; set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, authorised redirect URI `{APP_URL}/api/v1/auth/google/callback`. Blocks Google sign-in only — email/password is unaffected. |
| B3 | Production infrastructure | Hosting, production DB, SMTP, domain, backups, analytics. Blocks deployment, not development. |
| ~~B4~~ | ~~« 3 free lessons » definition~~ | **RÉSOLU (phase 6)** : une liste NOMMÉE (`packages/core/curriculum/freeLessons.js`), jamais un rang — « les trois premières » aurait fait dépendre le modèle commercial d'un ordre de tri. Vide aujourd'hui : aucune leçon algérienne n'existe. À remplir en phase 7. |

---

## 20. Recommended Next Steps

Order confirmed after audit, with one deviation: **Phase 6 before Phase 5's
Google half**, because activation codes depend only on email/password auth (which
works today) whereas Google is blocked on B2. This removes an external dependency
from the critical path.

1. **Phase 5 — Authentication (email/password half).** Verify the full DZ flow end to end; translate remaining auth copy. Leave Google pending B2.
2. ~~**Phase 6 — Activation codes.**~~ **FAIT (2026-09-16).** `activation_codes` table; `Entitlement::TYPES` + `activation_code`; `ActivationCodeRedemptionService` writing an entitlement transactionally; `POST /activation-codes/redeem` throttled like `/auth/login`; admin generate/list/revoke/export; resolve B4 and tag the three free lessons. Do **not** touch `EntitlementService`/`ContentAccess` — they are already correct.
3. **Phase 7 — Curriculum foundation.** Only once B1 is satisfied. Build the Algerian source of truth from the official document, add `4am` to `ACTIVE_GRADE_IDS`, re-run the export/import, confirm `registry-health` shows no drift.
4. **Phase 8 — 4AM, lesson by lesson.** Per lesson: curriculum mapping → LP-by-LP classification against French (MATCHING / PARTIAL / MISSING / DIFFERENT / ALGERIAN-SPECIFIC / VERIFY) → architecture → content → interaction → Knowledge Map → exercises → BossFinal → QA. The first lesson doubles as the end-to-end validation of the lesson engine under RTL, which is the one thing this audit could not exercise.

Before Phase 8 authoring begins, add a CI gate asserting `grades.is_active`
matches `ACTIVE_GRADE_IDS` (risk 3), and run one real lesson through full visual
QA (risk 1).

---

## 21. 4AM Implementation Plan (to execute once B1 is satisfied)

**Curriculum.** Verify the supplied outline against the official programme;
record every divergence. Extract domains → sequences → lessons → learning points
→ official Arabic terminology → prerequisites. Anything unconfirmed stays
`[À VÉRIFIER DANS LE PROGRAMME OFFICIEL]`.

**Mapping.** For each Algerian LP, classify against the French implementation.
"Same mathematical topic" is *not* "same learning point": Algerian progression,
terminology and expectations take precedence. Troisième is a technical reference
for module architecture and interaction patterns only — never a content source.

**Content, per lesson.** Objective · prerequisites · LPs · modules · examples in
Algerian context (DZD, local geography, school life — only where it aids
comprehension) · manipulation · exercises · BossFinal.

**Pedagogy.** Preserve the loop: Concret → Visuel → Numérique → Symbolique →
Automatisation. The student must never wonder what to do. No premature
terminology, no unexplained notation, no blocking on wrong answers, non-gating
diagnostics.

**Arabic.** Official terminology once verified — not a translation of the French
lesson text. Mathematics stays LTR inside the RTL page (already enforced by
`MathText`); every new lesson must be QA'd for mixed Arabic/math rendering.

---

## Appendix — commands used

```bash
# validation
npm run check:lessons && npm test && npm run build
cd apps/api && DB_CONNECTION=mysql DB_DATABASE=smarter-academy-dz-testing \
  DB_HOST=127.0.0.1 DB_PORT=3306 DB_USERNAME=root DB_PASSWORD=*** php artisan test

# activation handshake (after editing ACTIVE_GRADE_IDS)
node packages/core/curriculum/exportCurriculum.mjs
cd apps/api && php artisan smarter:import-curriculum
php artisan smarter:registry-health   # reports source ↔ database drift
```
