# « الوصول والحدود » — Access & Limits for features

> **Authoritative** for: which subscription **tier** (free / premium) may use
> each Math Lab instrument, the notebook (كرّاسي) and saved Math Lab works;
> the quotas on **notebook copies** and **document generations**; the usage
> ledger; the admin configuration screen and its API. Established
> 2026-09-25. The code is the source of truth; this file describes it.
>
> Not in scope (see their own contracts): the tier of a **lesson or
> exercise** (`lessons.tier` — `ADMIN_PANEL_ARCHITECTURE.md` Annexe A6),
> teacher **plans and seats** (`TEACHER_CLASSROOM_ARCHITECTURE.md` §5), the
> Math Lab **file** quotas (1 MB, 3 per work, 50 per account —
> `MATH_LAB.md` §5.7, fixed technical bounds, not a commercial rule).

## 1. The rule this document exists to enforce

**No Free/Premium rule is written in code.** No component, controller or
service writes `if (plan === 'premium')`, `if (user.isPremium)`, or holds a
number such as `FREE_LIMIT = 3`. There is exactly one question, asked in one
place:

```text
FeatureAccessService::decide(user, featureKey)      apps/api/app/Domain/Access/Features/
   ↓ tier      EntitlementService::decide(user, premium)   ← the ONLY tier authority (unchanged)
   ↓ policy    feature_access_policies row                 ← what the admin configured (DB)
   ↓ quota     usage_events counted in the period          ← counted under a row lock
   = FeatureDecision {allowed, reason, tier, quota{used, limit, remaining, unlimited, period, resetsAt}}
```

The frontend **reads** `GET /me/feature-access` to draw locks and counters
(`features/access/featureAccess.js`, `hooks/useFeatureAccess.js`). It never
authorises anything: every protected action is re-checked on the server.
`featureAccess.test.js` fails if a tier comparison appears in the client
helper.

## 2. Tiers

Two, closed (`App\Domain\Access\AccessTier`): `free` and `premium`. A user's
tier is **not** stored: it is `EntitlementService::decide($user, 'premium')`:

| Tier | Who | `tierReason` |
|---|---|---|
| premium | student with a running subscription entitlement | `subscription_entitlement` |
| premium | student with an activation code | `activation_code` |
| premium | student with an admin override | `admin_override` |
| premium | student covered by their teacher's plan (Model B) | `teacher_subscription` |
| premium | **every teacher account** | `teacher_role` |
| premium | **every admin account** (since 2026-10-05: the admin is a content reviewer) | `admin_role` |
| free | everyone else | `premium_required` |

**Publication by viewer** (2026-10-07, `ContentAccess::visibleStatuses`):
`published` → everyone; `hidden` → admin and teachers flagged ambassador
« سفير »; `draft` and `archived` → admin only. Grade activation is still
checked, class visibility never applies to admin/ambassador, and no learning
write opens (`learner`). See `ADMIN_PANEL_ARCHITECTURE.md` §8 and Annexe A8.

**Teachers** are therefore premium **explicitly**, through the existing
`VIA_TEACHER_ROLE` rule, not by an accidental bypass. They receive exactly
what the premium column says, limits included if the admin sets some, and a
feature switched off globally is off for them too. Their Math Lab
(`/enseignant/atelier`) and their own notebook (`/enseignant/cahier`) go
through the same checks. Reading a **student's** notebook
(`…/students/{id}/notebook`) is never subject to the student's tier.

## 3. Features (the closed registry)

`App\Domain\Access\Features\FeatureRegistry` — keys are code, values are DB.

| Key | Group | Quota (usage type) | What is gated |
|---|---|---|---|
| `math_lab.tool.<id>` — one per id in `MathLabTools` (14 today) | `math_lab_tool` | none | opening a saved work of that instrument, changing its state, duplicating it, attaching a file to it, creating a work in it |
| `notebook` | `notebook` | `notebook_copy` | creating, editing and reviewing notes |
| `math_lab.documents` | `documents` | `document_generation` | creating a saved Math Lab work (first save or copy) |
| `thinking_lab.ladder` (2026-11-01) | `thinking_lab` | none | every `/thinking-lab/*` route of « مختبر التفكير » (`THINKING_LAB.md` §6.6). No row = open to both tiers (plan §17 n° 4, proposed); the admin's « مختبر التفكير » section closes it. The teacher's read-only preview (`/teacher/thinking-lab/*`) is behind `can:teacher` only and is not affected. |

The tool keys **derive** from `MathLabTools::ids()`: a new instrument has a
key the moment it is in the server registry. A key with **no row** in
`feature_access_policies` resolves to `FeatureRegistry::defaults()` — open to
both tiers, no limit — and the admin screen marks it « غير مضبوطة بعد ».
Same philosophy as `lessons.tier`: nothing closes because a row is missing;
closing is a decision.

What stays allowed when a feature is closed — **a closed feature never
confiscates work**: listing, renaming, starring and deleting Math Lab works;
reading, archiving and deleting notes.

## 4. What counts as one unit

| Usage type | Counts one | Does NOT count |
|---|---|---|
| `document_generation` | a **new** Math Lab work stored on the server: `POST /math-lab/documents` (the first save of a new work — autosave creates it only after the first change) or `POST /math-lab/documents/{id}/duplicate` | autosave / `PATCH`, rename, favourite, file attachments, PNG export (client-side), opening a tool, using a tool in the lesson overlay (nothing is saved there) |
| `notebook_copy` | a **new** note: `POST /practice/notes`, whatever its origin (lesson, exercise, « أضف إلى كرّاسي », Math Lab « أضف إلى كرّاستي ») | editing, reviewing, archiving, pinning, printing (client-side `window.print`) |

« Notebook copy » had no prior meaning in the code (there is no notebook
duplication or export on the server); a *new note* is the only server-side
creation the notebook has, so it is the unit. The two types are never added
together.

**Consumption, not stock.** Deleting a work or a note does **not** give the
unit back. The ledger is append-only.

## 5. The ledger and the period

`usage_events` — one immutable row per unit:
`user_id, usage_type, feature_key, context (the Math Lab tool id for a work),
subject_id (created object, no FK), tier (at the time), created_at`.

"Used this period" is **counted**, never a stored counter:
`created_at ≥ period start`. The period is per feature
(`feature_access_policies.quota_period`):

| Period | Window | Reset |
|---|---|---|
| `month` (default) | calendar month in the app timezone (`config('app.timezone')`, UTC today) | the 1st of the next month, `resetsAt` in every quota payload |
| `lifetime` | everything ever consumed | never (`resetsAt: null`) |

Changing the period loses nothing (it only moves the window). Nothing resets
on the client: there is no counter in `localStorage`.

## 6. Atomicity — two simultaneous requests cannot exceed a quota

`FeatureAccessService::consume($user, $key, $create, $context)`:

```text
DB::transaction
  SELECT … FROM users WHERE id = ? FOR UPDATE      ← same lock discipline as MathLabFileService
  decide()  → recount usage_events INSIDE the lock
  refuse (FeatureAccessDenied) if not allowed or nothing remains
  $create() → the note / the document
  INSERT usage_events
commit
```

The check, the creation and the ledger row succeed or fail together: a
refusal creates nothing, a failed creation consumes nothing.
`FeatureQuotaConcurrencyTest` forks 4 processes on separate MySQL
connections that race for the last unit (with a 300 ms sleep inside the
critical section): exactly one wins. Removing the `lockForUpdate` line makes
it fail (verified). It is skipped on SQLite / without `pcntl`.

## 7. Refusals

`FeatureAccessDenied` → **403**, rendered by the exception itself, never
logged as an error (it is a normal answer):

```json
{ "success": false, "code": "premium_required", "message": "premium_required",
  "access": { "feature": "math_lab.tool.logic", "allowed": false, "reason": "premium_required", "tier": "free", "quota": null } }
```

`code` ∈ `feature_disabled` (switched off for everyone) · `premium_required`
(closed to free, open to premium) · `not_available` (closed to this tier
otherwise) · `quota_exceeded` (allowed, period consumed — `access.quota`
carries used / limit / remaining / resetsAt). It deliberately does **not**
extend `DomainException`, which the Math Lab and notebook controllers turn
into 404/422.

## 8. API

| Verb | Route | Who | Returns |
|---|---|---|---|
| GET | `/me/feature-access` | any verified user | `{tier, tierReason, features: {key: {group, toolId, enabled, allowed, reason, quota}}}` |
| GET | `/admin/access-policies` | `can:admin` | `{tiers, features: [{key, group, toolId, usageType, hasQuota, enabled, free{allowed, unlimited, limit}, premium{…}, period, configured, updatedAt}]}` |
| PUT | `/admin/access-policies/{key}` | `can:admin` | validated replacement of one row (below); logs `access_policy.updated` with before/after in `admin_activity_logs` |
| GET | `/admin/access-usage` | `can:admin` | this month, per tier: `document_generation` / `notebook_copy` totals and distinct users; works created per tool per tier |
| GET | `/admin/users/{id}/feature-usage` | `can:admin` | one student/teacher: tier + reason, used / limit / remaining per quota, locked tools, works per tool (all time); 404 for an admin account |

`PUT` body — `unlimited` is **explicit**, never a huge number:

```json
{ "enabled": true,
  "free":    { "allowed": true, "unlimited": false, "limit": 50 },
  "premium": { "allowed": true, "unlimited": true },
  "period":  "month" }
```

Refused with 422: unknown key, a missing tier, `allowed` not boolean, a
quota feature without `unlimited`, a limit that is not an integer in
0…1 000 000 (strings too), a limit on a feature without quota, an unknown
period. In the DB `NULL` means unlimited (the project convention of
`EntitlementKeys`); the API and the UI speak `unlimited: true`.

Every change takes effect on the **next request** of every user: the
service memoises the policies for one request only (flushed on
`RequestHandled`, `AppServiceProvider`), there is no other cache, no deploy,
no frontend rebuild.

## 9. Initial values (seed data, not rules)

Inserted **once** by the migration `2026_09_30_000001_…` (the deploy does not
run seeders). Edit them in the admin screen, not in code.

| Feature | Free | Premium |
|---|---|---|
| Instruments anchored in the 4AM programme: whiteboard, functionGrapher, geometry3d, probabilityStats, algebra, vectors, trigonometry, transformations, numberLab, measurement | ✔ | ✔ |
| Beyond-programme instruments: sequences, conics, analysis, logic | ✘ | ✔ |
| Notebook | ✔, **50 new notes / month** | ✔, unlimited |
| Saved Math Lab works | ✔, **10 new works / month** | ✔, unlimited |

No Free/Premium classification of the Math Lab existed before; this one
follows the « beyond the programme stays one click away » split of
`MATH_LAB.md`. **Pending owner confirmation** (see the 2026-09-25 report).

## 10. Frontend

| Surface | Behaviour |
|---|---|
| `useFeatureAccess()` (`hooks/`) | one module-level store, one fetch per token, `refreshFeatureAccess()` after each creation, `reportRefusal()` applies a 403 body without a second call. No provider above the router (bundle rule 1). Until the summary arrives **nothing is closed** — the server decides. |
| Math Lab home, « جديد » menu, lesson-overlay picker | a tool switched off globally is hidden; a tool closed to the tier stays **visible with a lock badge** (« وصول كامل »); the works counter (`QuotaMeter`) sits under « أعمالي » |
| Tool page (`MathLabToolPage` → `ToolGate`) and overlay (`ToolHost`) | closed → `FeatureLockedPanel` (reason, Arabic explanation, « تفعيل الوصول الكامل » for students), the tool is not mounted |
| Saving a new work | a 403 stops the autosave loop (`saveState: 'blocked'`, no retry storm) and shows the panel with used / limit / reset date as the shell's banner |
| « أعمالي » duplicate | a refused copy shows the panel, not a generic error |
| Notebook window | new-note counter while the limit is finite; a refused save shows the panel; the text stays in the window and in the local draft |
| « Mon cahier » | counter of new notes in the header |
| Admin `/admin/offres/acces` (« الوصول والحدود », under العروض) | tiers explained; a table of every instrument (enabled / free / premium); notebook and works editors (access per tier, unlimited switch or a number, period); **confirmation** for any restrictive change (switch off, close a tier, lower a limit, unlimited → number, month → lifetime — `isRestrictive`, `accessPolicies.test.js`); this month's usage per tier and per tool |
| Student / teacher detail pages | `FeatureUsagePanel`: tier + reason, used / limit / remaining, locked tools, works per tool |

Strings: student-facing in `access.json` (`feature.*`, eager — the panel is
shared by the Math Lab and the notebook), admin in `admin.json` (`access.*`,
`nav.accessLimits`), one Math Lab status in `mathlab.json`
(`shell.saveBlocked`). Tool names in admin come from `mathlab`
`tools.<id>.name` (the convention is pinned by `accessPolicies.test.js`)
instead of importing the tool registry and its engines.

**Honest limit.** Every Math Lab instrument runs entirely in the browser;
its code is in the bundle. A determined user can render a closed instrument
locally (the lesson overlay saves nothing). What the server **can** protect
— and does — is everything that touches it: creating, opening, changing,
copying a work of that instrument and attaching files to it.

## 11. How to…

**Add a Math Lab instrument.** Follow `MATH_LAB.md` §3.2. Its feature key
exists automatically (derived from `MathLabTools`) and is **open to both
tiers** until the admin decides otherwise. To ship it closed, add a migration
that inserts its `feature_access_policies` row — never a condition in code.

**Add a new gated feature.** (1) A constant and an entry in
`FeatureRegistry::all()` (with a usage type if it has a quota — add the type
to `USAGE_TYPES` and define precisely what one unit is, in §4 of this file).
(2) At the server choke point: `ensure()` for access, `consume()` around the
creation for a quota. (3) Optionally a migration inserting its initial row.
(4) In the client, read it with `featureState(summary, key)`. (5) Tests in
`FeatureAccessTest`. The admin screen lists it without change for quota
features and tools; a new *group* needs a section in `AccessLimits.jsx`.

**Give one account an exception.** Not here: rows are per tier. Grant the
account premium (admin override / activation code) — `ADMIN_PANEL_ARCHITECTURE.md` A6.

## 12. Tests that own this document

- `apps/api/tests/Feature/FeatureAccessTest.php` — initial rows cover every
  tool; the 4-case tool matrix; direct-API refusal (create, open, change
  state, duplicate, attach) while list / rename / delete stay allowed;
  global switch closes teachers too; teacher = premium (`teacher_role`);
  notebook and document quotas per tier (below / at the limit); edits and
  autosave do not count, copies do, deletion does not refund; the two
  resources are separate; monthly reset and lifetime; the summary payload;
  admin-only endpoints; admin changes (tool free → premium, a limit)
  applied at the next request and logged; invalid values refused; the
  admin list covers the registry; usage reports.
- `apps/api/tests/Feature/FeatureQuotaConcurrencyTest.php` — the real race (§6).
- `apps/web/src/features/access/featureAccess.test.js`,
  `apps/web/src/features/admin/access/accessPolicies.test.js`.
- `apps/web/e2e/access-limits.mjs` — browser: locks, panel, direct API,
  counters, mobile overflow, admin round-trip with confirmation
  (`QA_ADMIN_TOKEN` for the admin part).
- Suites that test something else call `openAllFeatures()`
  (`tests/Support/FeatureAccessFixtures.php`) instead of depending on the
  seed values.

**E2E note.** The QA student `qa-eleve@smarter.dz` is on the free tier, so
the Math Lab e2e scripts of the premium-only instruments (`mathlab-logic`,
`mathlab-sequences`, `mathlab-conics`, `mathlab-analysis`) meet the lock
with the initial values: give the QA account premium (admin override) or
open those tools in the admin screen before running them.
