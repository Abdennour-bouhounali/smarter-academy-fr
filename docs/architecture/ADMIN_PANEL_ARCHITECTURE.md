# Smarter Academy — Admin Panel Specification

**Document:** `ADMIN_PANEL_ARCHITECTURE.md`  
**Status:** Approved product/technical specification  
**Scope:** Full administrator control center for the Smarter Academy platform

---

## 1. Purpose

The Admin Panel is the operational control center of Smarter Academy.

It must allow the administrator to:

1. Monitor platform and learning analytics.
2. Control publication/visibility of programmes, lessons, modules and exercises.
3. Receive, investigate, classify and resolve student reports.
4. Monitor students, their accounts, activity, progress and learning-point mastery.
5. Manage subscription/access status and payment records.
6. Manage the administrator account and credentials.
7. Maintain an auditable history of important administrative actions.

The Admin Panel must integrate with the existing lesson, module, exercise, learning-point, progress, authentication and subscription architecture rather than creating parallel or duplicate systems.

---

# 2. Core principles

## 2.1 One source of truth

The Admin Panel must consume the existing backend/API/domain models wherever they already exist.

Do not duplicate:

- users
- lessons
- modules
- exercises
- learning points
- progress
- attempts
- authentication
- subscriptions

If an existing model is insufficient, extend it carefully.

## 2.2 Backend is authoritative

Visibility, account status, subscription status and permissions must be enforced by the backend.

The frontend must never rely on a hidden button or client-side condition as a security mechanism.

## 2.3 Admin is a separate protected area

All admin routes must be protected by server-side authorization.

Student authentication must never grant admin access.

Recommended route namespace:

`/admin/*`

## 2.4 Preserve student data

Do not delete student learning history when an account is disabled.

Account lifecycle and data retention are separate concerns.

## 2.5 Mobile-ready

The current product is web-first, but architecture and responsive UI must remain compatible with a future React Native/client-mobile strategy.

---

# 3. Initial administrator

The initial administrator is:

- Email: `admin@gmail.com`
- Password: `Admin@2026`

These credentials are bootstrap credentials only.

## Mandatory security requirements

- Store only a secure password hash.
- Never store or expose the plaintext password in the database.
- Never return the password through an API.
- Never hard-code credentials in frontend source code.
- The bootstrap account must be able to change its email and password from the Admin Account page.
- Password changes must invalidate existing authenticated sessions/tokens where the authentication architecture supports this.
- The implementation must not expose the bootstrap password in production logs.

If environment/bootstrap configuration is used, document it clearly and avoid committing secrets to source control.

---

# 4. Admin navigation

The Admin Panel should use a dedicated sidebar:

```text
ADMIN

Dashboard

Analytics
  Platform
  Learning
  Content
  Students

Content
  Programmes
  Lessons
  Modules
  Exercises
  Learning Points
  Diagnostics

Reports
  All
  New
  In Review
  Resolved
  Dismissed

Students
  All
  Active
  Suspended
  Disabled

Subscriptions
  Active
  Expired
  Payments

Account
  Profile
  Security

System
  Activity Log
```

The exact visual style should reuse the platform's existing design system without making the admin UI look like a student lesson.

---

# 5. Dashboard

The Dashboard answers:

> What is happening on the platform right now?

## KPI cards

Display:

- Total students
- Active students
- Students active today
- New registrations
- Published lessons
- Hidden lessons
- Total modules
- Total exercises
- Exercise attempts
- Pending reports
- Active subscriptions
- Expired subscriptions

## Alerts

Surface important anomalies:

- High-priority reports
- Modules with unusually many reports
- Exercises with unusually low success rate
- Large completion drop-offs
- Technical error spikes
- Students/usage anomalies when meaningful

## Recent activity

Show:

- Recent reports
- Recent registrations
- Recent content changes
- Recent subscription changes
- Recent admin actions

---

# 6. Analytics

Analytics must be based on actual tracked platform events and existing learning data.

## 6.1 Platform analytics

Track where available:

- registrations
- active users
- daily active users
- weekly active users
- monthly active users
- sessions
- lesson starts
- lesson completions
- module starts
- module completions
- exercise attempts
- exercise completions
- reports
- subscriptions

Filters:

- Today
- 7 days
- 30 days
- 90 days
- Custom range

## 6.2 Learning analytics

Track:

- lessons opened
- lessons started
- lessons completed
- modules opened
- modules completed
- exercises started
- questions answered
- correct answers
- incorrect answers
- attempts
- hints
- skips
- time spent
- diagnostics
- final assessments
- learning-point mastery

## 6.3 Content analytics

For each lesson/module/exercise:

- views
- starts
- completions
- completion rate
- average time
- abandonment/drop-off
- exercise success
- attempts
- hints
- reports

## 6.4 Learning-point analytics

For each learning point:

- students exposed
- mastery/success rate
- first-attempt success
- average attempts
- students struggling
- associated exercises
- associated lessons/modules

The admin must be able to navigate:

`Learning Point → affected students → relevant attempts/exercises`

---

# 7. Content management

Content hierarchy:

```text
Programme
  └── Lesson
       └── Module
            └── Exercise
                 └── Question
                      └── Learning Point(s)
```

The Admin Panel must respect this hierarchy.

---

# 8. Content publication states

Do not use only a boolean `hidden`.

Recommended states:

```text
draft
published
hidden
archived
```

## Draft

Not available to students.

## Published

Available according to access rules.

## Hidden

Temporarily removed from student-facing access while preserving content and history.

## Archived

Retired content preserved for historical/reference purposes.

Visibility changes must be backend-enforced.

> **Who sees which state — implemented 2026-10-07 (owner decision).** One
> table, in `ContentAccess::visibleStatuses()`, for lessons, modules and
> exercises alike:
>
> | State | Admin | Ambassador teacher (« سفير ») | Other teacher | Student / visitor |
> |---|---|---|---|---|
> | `published` | ✓ | ✓ | ✓ | ✓ |
> | `hidden` | ✓ | ✓ | — | — |
> | `draft` | ✓ | — | — | — |
> | `archived` | ✓ | — | — | — |
>
> Tier, active grade and per-class visibility still apply on top. A **module**
> has no state of its own since 2026-11-11: it follows its lesson (Annexe A1).

---

# 9. Lesson management

> **Implemented (2026-09-25) — `/admin/contenu/lecons`.** Filters: search,
> grade, **الوحدة** (the textbook unit, `?unit=<code>`), publication, tier.
> The unit options are read from the database by the API
> (`GET /admin/content/lessons` → `units[]`: only units that carry at least one
> lesson, active grades only), never listed in the UI — today that is the one
> unit « الأعداد الطبيعيّة والأعداد النّاطقة », and a unit imported tomorrow
> appears on its own. Each row shows its unit under the title
> (`unit`, `unitTitle`), falling back to the ميدان.
>
> **Terminology (Arabic admin).** A lesson's *module* is **المحور**
> (plural المحاور); **الوحدة** is only ever the textbook unit — the level
> between the ميدان and the درس. The admin labels that used « الوحدة » for a
> module were corrected on 2026-09-25. (« وحدة البيع », the unit of sale of a
> teacher plan, is a different word use and stays.)

> **« Open lesson » — implemented 2026-10-05.** The lesson detail page
> (`/admin/contenu/lecons/{code}`) has a « فتح الدرس » link to the lesson
> itself. The administrator sees every state: a draft / hidden / archived lesson
> opens for them, with its state badge (Annexe A8). An ambassador sees only
> published and hidden content (§8).

Lesson list must support:

- search
- grade filter
- programme/category filter
- status filter
- visibility filter
- report count
- publication date
- last updated

Each lesson should expose:

- title
- grade
- modules
- exercises
- status
- tier/access
- analytics
- reports

Admin actions:

- publish
- hide
- archive
- restore where appropriate
- open lesson
- inspect modules
- inspect analytics

Avoid destructive deletion as a normal workflow.

---

# 10. Module management

Each module should support:

- visibility control
- publication state
- analytics
- reports
- exercise inspection

Admin must be able to hide a problematic module without necessarily hiding the complete lesson.

---

# 11. Exercise management

Exercise management must integrate with the existing exercise engine.

Filters:

- grade
- lesson
- module
- learning point
- exercise type
- status
- report count

Display:

- attempts
- students
- first-attempt success
- overall success
- average attempts
- average time
- hints
- skips
- reports

Admin can inspect the exercise and its questions.

Do not create a second exercise engine specifically for the Admin Panel.

---

# 12. Student reporting system

> **Superseded (2026-10-05) — see Annexe A8.** Reporting is no longer a
> student feature. Only **reviewers** — the administrator and teachers flagged
> as **ambassadors** (« سفراء ») — see the button and may call the API
> (middleware `reviewer`, 403 `not_a_reviewer` otherwise). Clicking the button
> only opens the form; ONE multipart `POST /api/v1/reports` sends context +
> category + optional note + optional **screenshot** (the reviewer captures
> the page or uploads an image and frames the problem area in red). The
> categories actually offered are `math_error, manipulation_not_working,
> unclear_question, answer_correction_problem, display_problem, typo, other`
> (`StudentReport::OFFERED_CATEGORIES`); the list below is the original
> wish-list.

Every student-facing module must provide:

**Signaler un problème**

Every student-facing exercise/question should provide an equivalent report action where appropriate.

The report UI must be short and easy to use.

Suggested categories:

```text
content_error
wrong_answer
unclear_question
technical_problem
display_problem
interaction_problem
typo
other
```

Optional student note:

```text
What happened?
[____________________________]
```

The note is optional.

---

# 13. Automatic report context

> **As implemented.** The client sends content CODES only (`lessonCode`,
> `grade`, `moduleNumber`, `step`, `exerciseCode`, `questionId`, `sessionId`,
> `attemptUuid`) plus `route`, `browser`, `os`, `screen`; the server resolves
> every foreign key itself (`ReportService::resolveContext`). `app_version`
> and `error_ref` exist as columns and are validated but **no client sends
> them today**. Browser / OS / screen are kept only for technical categories.

The student must not manually identify the problematic content.

For a module report, capture automatically:

- student_id
- lesson_id
- module_id
- current step
- timestamp
- route/context

For an exercise/question report, capture where available:

- student_id
- lesson_id
- module_id
- exercise_id
- question_id
- attempt_id
- timestamp

For technical debugging, capture only useful non-sensitive diagnostic context such as:

- browser
- operating system
- screen size
- application version
- route
- frontend error identifier when available

---

# 14. Report lifecycle

Report status:

```text
new
in_review
resolved
dismissed
duplicate
```

Priority:

```text
low
medium
high
critical
```

Admin actions:

- open
- mark in review
- change priority
- assign
- resolve
- dismiss
- mark duplicate
- open source lesson/module/exercise/question

---

# 15. Report dashboard

Report filters:

- status
- priority
- grade
- lesson
- module
- exercise
- question
- category
- date
- assigned admin

Columns:

- report ID
- date
- student
- location/content
- category
- priority
- status
- assigned admin

---

# 16. Report details

A report detail page must show:

## Source

```text
Lesson
Module
Exercise
Question
```

## Student

- student identity
- account status

## Student message

Original optional note.

## Attempt context

Where available:

- student's answer
- expected answer
- evaluation result
- attempt number
- hints
- time

## Admin workflow

- status
- priority
- assignment
- internal notes
- resolution
- timestamps

Internal admin notes must never be exposed to students.

---

# 17. Report aggregation

The system should detect repeated reports concerning the same content/problem.

Example:

```text
Issue #34

25 student reports

Lesson: Fractions
Module: Compare fractions
Exercise: FRAC-034
Question: Q4

Category: wrong_answer
```

Do not force implementation of sophisticated AI clustering in the first version.

A deterministic grouping mechanism based on content/question/category should be sufficient initially.

---

# 18. Students

Student list:

- name
- email where appropriate
- grade
- account status
- subscription
- progress
- last activity
- registration date

Filters:

- grade
- status
- subscription
- last activity
- registration date

Search:

- name
- email
- account ID

---

# 19. Account statuses

Recommended:

```text
active
suspended
disabled
```

## Active

Normal access.

## Suspended

Temporarily restricted.

## Disabled

Cannot access the platform.

Account status must be enforced server-side.

Do not confuse account status with subscription status.

Example:

```text
Account: active
Subscription: expired
```

is valid.

---

# 20. Student profile

Student detail page:

## Account

- name
- email
- grade
- account status
- registration date
- last activity

## Subscription

- plan
- status
- start date
- end date
- payment information

## Learning

- overall progress
- lessons completed
- modules completed
- exercises attempted
- exercise success
- diagnostic results
- final assessment
- learning-point mastery

## Timeline

Show important learning events chronologically.

---

# 21. Learning profile

For each student, show learning-point state based on actual exercise/progress data.

Examples:

```text
Mastered
Developing
Needs attention
```

Do not manually store a duplicated "weakness" field if it can be derived from the existing mastery model.

Admin should be able to navigate:

`Student → Weak learning point → Exercise attempts → Relevant content`

---

# 22. Subscriptions

Subscription status should be independent from account status.

Recommended statuses:

```text
free
active
expired
cancelled
pending
```

Track:

- plan
- status
- start date
- end date
- payment date
- amount
- currency
- provider
- transaction/reference ID where available

The model should remain provider-agnostic so future Stripe integration does not require redesigning the whole system.

---

# 23. Payment history

Student subscription/payment page should show:

- date
- amount
- plan
- status
- provider
- transaction/reference
- subscription period

Never store sensitive payment-card data.

---

# 24. Access model

Access should follow:

```text
Account status
      ↓
Subscription/entitlement
      ↓
Plan/tier
      ↓
Content publication state
      ↓
Lesson/module/exercise access
```

Do not scatter subscription checks throughout frontend components.

Centralize authorization/access decisions.

> **Implémenté — voir §A6** pour la chaîne réelle, les trois types de droit et
> l'invariant « un droit n'est jamais un passe-droit vers du contenu non
> publié ». L'autorité est `App\Domain\Access\EntitlementService`, composée
> avec la publication dans `ContentAccess`, et dans aucun autre endroit.

---

# 25. Admin account

Admin → Account → Profile

Allow changing:

- email
- password

Optional future fields:

- display name
- avatar
- timezone

## Change email

Require:

- current password
- new email
- confirmation if supported

## Change password

Require:

- current password
- new password
- confirmation

Password policy should reject obviously weak credentials.

After a sensitive credential change:

- invalidate/revoke sessions where possible
- require re-authentication if appropriate

---

# 26. Activity log

Record important admin actions.

Example:

```text
admin
action
entity_type
entity_id
before
after
timestamp
```

Actions include:

- publish lesson
- hide lesson
- hide module
- publish exercise
- change student status
- change subscription state
- resolve report
- dismiss report
- change admin email
- change admin password

Do not log passwords or sensitive secrets.

---

# 27. Content versioning

Because reports reference exact content states, the architecture should be ready for content versions.

Example:

```text
Fractions
Version 1.2
```

An exercise attempt/report should remain attributable to the content version the student experienced when practical.

Full versioning UI can be introduced progressively, but the data model must not make future versioning impossible.

---

# 28. Event/analytics architecture

Where the existing backend already records progress/attempts, reuse it.

For missing events, establish a consistent event model.

Possible events:

```text
lesson_viewed
lesson_started
module_viewed
module_started
module_completed
exercise_started
question_answered
exercise_completed
diagnostic_completed
lesson_completed
report_created
```

Events should contain:

- actor/student
- event type
- relevant entity IDs
- timestamp
- useful metadata

Do not collect unnecessary personal information.

---

# 29. Dashboard content-health signals

A later content-health layer can combine:

- report frequency
- exercise failure
- abandonment
- completion
- technical errors
- student difficulty

Example:

```text
Healthy
Needs attention
Critical
```

This is a derived analytical layer, not a replacement for raw data.

---

# 30. Recommended database direction

Before creating tables, audit the current schema.

Potential entities, only where missing:

```text
admin_users / roles
student_reports
report_notes
report_assignments
report_clusters
subscriptions
payments
admin_activity_logs
analytics_events
```

Do not blindly create all of these if equivalent existing entities already exist.

The first implementation step must be a schema/API audit.

---

# 31. API requirements

> **Paths as implemented** are under `/api/v1/admin/…` (not `/api/admin`).
> Publication is `PATCH /api/v1/admin/content/{lesson|module|exercise}/{id}/status`;
> reports add `GET /api/v1/admin/reports/clusters`, `POST …/reports/{id}/notes`
> and `GET …/reports/{id}/screenshot`; teachers add
> `PATCH /api/v1/admin/teachers/{id}/ambassador` (Annexe A8).

The backend should expose protected admin endpoints for:

```text
GET    /api/admin/dashboard
GET    /api/admin/analytics/...
GET    /api/admin/content/...
PATCH  /api/admin/lessons/{id}/status
PATCH  /api/admin/modules/{id}/status
PATCH  /api/admin/exercises/{id}/status

GET    /api/admin/reports
GET    /api/admin/reports/{id}
PATCH  /api/admin/reports/{id}

GET    /api/admin/students
GET    /api/admin/students/{id}
PATCH  /api/admin/students/{id}/status

GET    /api/admin/subscriptions
GET    /api/admin/payments

GET    /api/admin/account
PATCH  /api/admin/account/email
PATCH  /api/admin/account/password

GET    /api/admin/activity-log
```

These are conceptual endpoints. Adapt them to the existing Laravel API conventions.

---

# 32. Authorization

Every admin endpoint must verify:

1. authenticated user
2. admin role/permission
3. allowed operation

Frontend route protection is supplementary only.

Future role model:

```text
super_admin
content_admin
support_admin
teacher
```

Even if only `super_admin` is implemented initially, keep authorization extensible.

---

# 33. UX requirements

## 33.0 The panel is the same product as the student space

> **Authoritative since 2026-09-22.** The Student Space is the single source
> of truth for the visual identity of the DZ platform. The admin panel is
> another **mode of the same application**, not a second application — only
> the role and the available functionality change.

This is a contract, not a preference, and `apps/web/src/pages/adminContract.test.js`
enforces it on the source. Four commitments:

**1 · Arabic.** Every user-facing string in the panel is Arabic, read from the
`admin` i18n namespace (`apps/web/src/i18n/locales/ar/admin.json`). This
covers page titles, `useDocumentMeta` titles, table column headers, filter and
search labels, buttons, dialog titles and messages, empty/loading/error states,
status badges, pagination and every `aria-label`. There is no "internal tool"
exemption — see `ARABIC_RTL_CONTRACT.md` §1.

Since 2026-11-17 the `admin` namespace is loaded **on demand, together with `AdminLayout`** — it is no longer part
of what every visitor downloads (`BUNDLE_BOUNDARIES.md` §3). Only `pages/admin/` and `components/admin/` may read
it. The primitives of `components/admin/ui/` that other spaces render too (`Modal`, `FilterBar` / `Pagination`,
`DataTable`, `states`) read the eager `common › ui.*` instead; a new string of such a primitive goes there.

Technical and mathematical identifiers are **not** translated (PGCD, PPCM, API,
CSV, HTML, activity-log action codes, the brand name *Smarter Academy*), but
the Arabic sentence around them is. `إدارة درس PGCD`, never `إدارة PGCD Lesson`.

**2 · One design system.** The panel imports the product's tokens; it defines
none of its own.

| Concern | Source |
|---|---|
| Page gutter | `.sa-page` (20 / 40 / 60 px) — `index.css`; `.sa-page--flush` keeps 20 px at every size for a full-width workspace (practice player) |
| Workspace shell | `.sa-workspace-main`, `.sa-workspace-sidebar` |
| Type scale, fonts | `tailwind.config.js` (+25 % body scale; Cairo behind every stack) |
| Background | `#FAFAFA` — identical to `StudentLayout` / `TeacherLayout` |
| Cards | white surface, `border-slate-200`, `rounded-xl`; KPI tiles reuse `components/common/StatTile` — the same component as « تقدّمي » |
| Semantic colour | emerald = success, rose = error, amber = warning, violet = premium/accent, slate = muted |

The **only** role-level difference is the accent gradient, which names the
space rather than rebuilding it:

| Space | Accent |
|---|---|
| Student | `#3B82F6 → #8B5CF6` (blue → violet) |
| Teacher | `#0F766E → #3B82F6` (teal → blue) |
| Admin | `#8B5CF6 → #3B82F6` (violet → blue) — `ADMIN_GRADIENT` |

The sidebar used to be `bg-slate-900`. It is now the student sidebar: white,
`border-e border-slate-200`, gradient active pill, identity block in the
footer. A dark admin theme is a regression the contract test rejects.

**3 · RTL by construction.** `<html lang="ar" dir="rtl">` is global. Admin code
uses **logical** properties only — `ms-`/`me-`, `ps-`/`pe-`, `start-`/`end-`,
`text-start`/`text-end`, `border-e` — never `ml-`/`mr-`/`left-`/`right-`/
`text-left`/`text-right`. Directional icons ("previous", "next", the sidebar
rail) come from `components/common/DirectionalIcons`; semantic icons (search,
trash, user, warning, vertical sort chevrons) are imported straight from lucide
and are **never** mirrored.

Numbers, ratios (`3 / 10`), emails, activation codes, join codes, IDs and URLs
stay LTR inside the RTL shell — wrap them in `<Num>` or `dir="ltr"`, the same
isolation `.sa-math-inline` gives mathematics.

**4 · Shared chrome, not per-page invention.** `apps/web/src/pages/admin/adminUi.jsx`
is the panel's only chrome module — the twin of `pages/teacher/teacherUi.jsx`:

- `AdminPage`, `AdminSection`, `AdminCard` — page header and containers
- `Loading`, `ErrorBox` — states
- `useAdminLabels()` — the Arabic labels handed to `DataTable`, `Pagination`,
  `ConfirmDialog` and `FilterBar`
- `btnPrimary` / `btnSecondary` / `btnDanger` / `btnGhost`, `input`, `label`
- `formatDate` (`ar-DZ`), `Num`, `ADMIN_GRADIENT`

A new admin screen composes these. It does not restyle a button, redeclare a
font, or write a date formatter.

The shared kit (`components/admin/ui/*`) now defaults to Arabic and keeps every
label overridable, so the teacher space can keep passing its own.

**5 · The API sends codes, the panel writes the sentence.** A server response
is not a localization surface (`ARABIC_RTL_CONTRACT.md` §2), and that applies
to anything the panel *displays*, not just to error messages. Dashboard alerts
therefore carry a `kind` and structured `params`:

```php
// DashboardService::alerts()
['kind' => 'low_success_exercise',
 'params' => ['exercise' => $id, 'rate' => $rate, 'total' => $total],
 'label' => "Exercice … : …% de réussite…"]   // filet, pas l'affichage
```

The client resolves `dashboard.alerts.<kind>` with those params and falls back
to `label` only for a `kind` it does not know. The same rule covers enum-ish
values (`status`, module `stage`, analytics metric keys), each translated
through a catalogue sub-map with a raw-key fallback.

---

The Admin Panel must be:

- fast
- desktop-first but responsive
- consistent
- information-dense without being cluttered
- searchable
- filterable
- paginated
- keyboard accessible
- accessible
- clear about destructive actions

Use confirmation for consequential operations such as:

- disabling accounts
- changing critical publication states
- destructive actions

Use optimistic UI only where rollback is safe.

---

# 34. Error/loading/empty states

Every admin page must handle:

- loading
- empty
- API error
- unauthorized
- forbidden
- stale data
- mutation failure

Never silently fail.

---

# 35. Audit-first implementation rule

Before implementation:

1. Read this specification.
2. Inspect existing documentation.
3. Inspect database/schema.
4. Inspect Laravel models/migrations.
5. Inspect API routes/controllers/services.
6. Inspect authentication/authorization.
7. Inspect frontend routing/layout.
8. Inspect lesson/module/exercise models.
9. Inspect learning-point model.
10. Inspect progress and exercise-attempt tracking.
11. Inspect subscription/payment implementation.
12. Identify what already exists.
13. Identify what must be extended.
14. Identify what is genuinely missing.

Then produce an implementation plan.

Do not duplicate existing architecture.

---

# 36. Definition of done

The Admin Panel is complete when:

- admin can log in
- admin routes are protected
- initial admin exists securely
- admin can change email/password
- dashboard works
- analytics work from real data
- lessons can be published/hidden/archived
- modules can be controlled
- exercises can be inspected/controlled
- students can be searched and inspected
- accounts can be activated/suspended/disabled
- subscriptions are visible
- payments are visible where implemented
- students can report module problems
- students can report exercise/question problems
- reports retain automatic content context
- reports can be filtered and managed
- reports can be resolved/dismissed/duplicated
- admin actions are auditable
- no plaintext credentials are stored
- no security-sensitive control exists only in the frontend
- existing student functionality remains intact
- existing exercise/progress architecture remains intact

---

# ANNEXE — État d'implémentation après durcissement (2026-09-13)

Cette annexe décrit ce qui EST, par opposition au corps du document qui décrit
ce qui était visé. En cas de désaccord, c'est le code — et les tests qui le
verrouillent — qui font foi.

## A1. L'autorité de publication

`lessons.publication_status`, `lesson_modules.publication_status` et
`practice_exercises.publication_status` sont les **trois seules** autorités.

`lessons.status` (`available` / `coming_soon`) reste **informatif** : il
alimente l'affichage du catalogue côté frontend et n'ouvre ni ne ferme aucun
accès. Les deux colonnes ne se contredisent pas — elles ne parlent pas de la
même chose.

**Liste blanche** : pour un élève, un visiteur ou un enseignant, seul
`published` ouvre ; l'ambassadeur ajoute `hidden`, l'admin voit tout (§8).
Un état inconnu ajouté plus tard sera fermé par défaut (sauf pour l'admin),
jamais ouvert par oubli.

**Un module n'a pas d'état propre (2026-11-11, décision propriétaire, remplace
la cascade du 2026-10-07)** : un module est ouvert exactement quand sa leçon
l'est — `ContentAccess::assertModuleAvailable` ne lit que la leçon, et
`closedInventory()` ne ferme plus aucun module à part (`modules` toujours vide).
La colonne `lesson_modules.publication_status` reste, comme COPIE de l'état de
la leçon : changer l'état d'une LEÇON (geste unitaire ou lot) le recopie sur
TOUS ses modules en registre, dans la même transaction, avec une ligne
`module.status_changed` par module changé (`after.cascadeFromLesson`). Aucune
route n'accepte plus le type `module` pour l'état (`PATCH …/module/{id}/status`
et `POST …/module/bulk-status` → 404). Il n'y a plus de page admin
« المحاور » (`/admin/contenu/modules` et `GET /admin/content/modules` supprimés) ;
la fiche leçon liste ses modules sans colonne d'état.

**« Je publie la leçon, tout est publié » (2026-11-11, décision propriétaire)** :
le même geste donne aussi l'état de la leçon à tous ses **exercices** en
registre, avec une ligne `exercise.status_changed` par exercice
(`after.cascadeFromLesson`). La réponse de `PATCH …/lesson/{id}/status` porte
`modules: {applied, skipped}` (`skipped` est vide) et `exercises: {applied}`.
Un exercice peut ensuite être masqué SEUL (liste « التمارين » ou fiche leçon).
Publier une leçon reste refusé (422) si elle a des modules en registre et
qu'AUCUN ne passe les contrôles structurels.

**La page « التمارين » est organisée PAR LEÇON (2026-11-11, décision
propriétaire)** : on ne publie pas un exercice à la fois. Chaque ligne est une
leçon qui a des exercices (`GET /admin/content/lessons?withExercises=1`), avec
sa banque résumée par état (`exerciseStatusCounts`) et UN geste qui change
toute la banque (`ExerciseBankControl`, ci-dessous). Masquer ou régler le
palier d'UN exercice se fait sur la fiche de la leçon.

**Banque d'exercices d'une leçon (2026-10-07)** : en plus de la cascade
ci-dessus, les exercices ont leur propre geste groupé —
`PATCH /api/v1/admin/content/lesson/{id}/exercises-status` `{status}` donne
cet état à tous les exercices en registre (non retirés) de la leçon. C'est
`bulkChangeStatus('exercise', …)` sur la liste de la leçon : même validation,
une ligne `exercise.status_changed` par exercice, réponse `applied /
unchanged / failed`. Chaque exercice reste ensuite modifiable seul (publier
la banque, puis masquer UN exercice). Panneau : `ExerciseBankControl` dans
l'en-tête de la section تمارين de la fiche leçon (résumé par état + choix +
confirmation). Ni la leçon ni ses modules ne bougent.

**Défaut publié à l'import (2026-11-11, décision propriétaire — « pousser en
production publie », remplace « un module importé naît `draft` »)** :
`CurriculumImporter` publie une leçon `available` encore `draft` à chaque
synchronisation ; `ContentRegistryImporter` donne à chaque module l'état de sa
leçon (création ET resynchro) et fait naître un exercice `published` sous une
leçon publiée (un `draft` y est publié). `hidden` et `archived` sont gardés :
c'est ainsi que l'admin RETIENT une leçon écrite. `smarter:curriculum-sql`
(Hostinger) émet les mêmes règles. Verrouillé par `ContentRegistrySyncTest`.

**L'inconnu reste ouvert** : une leçon, un module ou un exercice absent du
registre est accessible. La base MIROITE le contenu, elle n'en est pas
l'autorité — refuser l'inconnu fermerait la plateforme au premier oubli de
synchronisation.

**Homonymes** : un code de leçon se répète d'une classe à l'autre
(`resolution-problemes` existe en 6e et en 3e). Un code n'est fermé que si
AUCUNE des leçons qui le portent n'est publiée.

### Où c'est appliqué

`App\Domain\Access\ContentAccess` est le point unique. Il est appelé sur
**tous les chemins d'écriture** :

| Chemin | Contrôle |
|---|---|
| `PUT /lessons/{code}/progress` | leçon + chaque module **nouvellement** déclaré terminé |
| `POST /lessons/{code}/evidence` | leçon |
| `PUT /lessons/{code}/final-test-attempt` | leçon |
| `POST /lessons/{code}/practice/sessions` | leçon |
| `GET /lessons/{code}/practice/overview` | leçon |
| `POST /practice/sessions/{id}/questions` | exercice |
| `GET /lessons/{code}/exercises` | leçon + exercice (listage) |

**Lecture vs écriture** : la progression et le test final déjà enregistrés se
LISENT toujours, même sur une leçon retirée. Ce que l'élève a fait lui
appartient ; le lui masquer serait lui mentir sur son parcours. Seule
l'écriture est fermée.

**Le piège de l'union monotone** : `completedModules` est renvoyé en ENTIER à
chaque sauvegarde. Contrôler toute la liste ferait qu'un module masqué
aujourd'hui empêcherait l'élève d'enregistrer quoi que ce soit demain. Seuls
les modules **nouvellement ajoutés** sont contrôlés.

## A2. L'inventaire côté élève

Deux points d'entrée alignent l'affichage sur la décision serveur :

- `GET /content/availability` — la liste des **fermetures** (jamais des
  ouvertures : envoyer « voici les 132 leçons ouvertes » ferait de la base une
  seconde définition du catalogue, qui dériverait).
- `GET /lessons/{code}/exercises` — l'inventaire des exercices, servi par le
  **registre**. Corrige le trou connu : un exercice masqué n'est plus listé,
  et pas seulement refusé à l'ouverture.

Côté React, `ContentAvailabilityContext` porte cette information.
**Politique d'ouverture** : tant que la réponse n'est pas arrivée — ou si elle
échoue — RIEN n'est fermé. Le serveur refuse de toute façon toute écriture ;
verrouiller l'interface sur une requête en vol enfermerait l'élève hors de son
parcours pour une raison purement technique.

### Ce que le client ne garantit PAS

Le contenu pédagogique des exercices est **embarqué dans le bundle**. Masquer
un exercice l'empêche d'être **listé, ouvert, commencé, tenté et corrigé** —
ce sont les cinq gestes qui comptent. Cela ne rend pas son texte secret pour
qui inspecte le bundle. Le registre contrôle la DISPONIBILITÉ ; les fichiers
portent le CONTENU. Ne pas confondre les deux.

## A3. Le registre

**Deux propriétaires, une table** : la synchro
(`smarter:import-content-registry`) possède l'IDENTITÉ (code, titre, étape,
points enseignés) ; l'administration possède l'ÉTAT (`publication_status`).
Une resynchro ne touche jamais l'état d'une ligne existante.

**Politique du brouillon** : un contenu **nouvellement découvert** naît en
`draft`. Publier doit rester un geste, pas un effet de bord du déploiement.
La règle ne rétroagit pas — le contenu déjà en base garde son état.

**Et la LEÇON elle-même** (`smarter:import-curriculum`, 2026-10-14) : une leçon `coming_soon` du catalogue
(1AM–3AM, pas encore écrite) naît `draft` — sinon le défaut de colonne `published` l'ouvrait côté serveur ; une
leçon `available` naît `published`. L'administration garde l'état d'une leçon existante, à deux exceptions dictées
par le catalogue : une leçon `coming_soon` n'est jamais `published` (→ `draft`), et le passage `coming_soon` →
`available` (la PUBLICATION d'une leçon générée) promeut le `draft` posé par l'import en `published`
(`CurriculumImporter::publicationOnCreate/OnUpdate`, même règle dans `smarter:curriculum-sql` ; `LEARNING_NET.md`
§3bis). Ses modules et exercices, eux, naissent `draft` comme tout contenu découvert.

**On ne supprime pas** : un code disparu prend `retired_at` ;
`student_lesson_progress.completed_modules` référence ces codes en clair.

**Diagnostic** : `smarter:registry-health` et `GET /admin/health`
(admin uniquement) — orphelins des deux côtés, doublons de code, leçons
publiées sans module publié, points d'apprentissage inconnus ou retirés
encore référencés.

## A4. Sémantique de « actif »

`users.last_activity_at`, écrit par `App\Domain\Progress\StudentActivity`, aux
**gestes d'apprentissage déjà enregistrés** : connexion, écriture de
progression, soumission de preuve, réponse à une question d'exercice.

Ce n'est **pas** « il a ouvert une page » : rien n'enregistre les vues, et
construire un pipeline d'événements pour une seule colonne serait
disproportionné. DAU/WAU/MAU mesurent donc l'**engagement réel**, pas la
fréquentation — une mesure plus stricte, et volontairement.

Écriture amortie à une par tranche de 5 minutes.

## A5. Honnêteté des statistiques

Trois formes de réponse, jamais confondues :

- `{available: true, value: N}` — mesuré.
- `{available: true, value: N, approximate: true, reason: …}` — la donnée
  existe, la méthode est approximative. C'est le cas des **modules terminés** :
  `completed_modules` est un tableau JSON sans date par module, donc le compte
  répond à « combien de modules ont été terminés par les élèves actifs sur
  cette période » et NON à « combien ont été terminés pendant cette période ».
- `{available: false, reason: 'no_tracking'}` — rien ne le mesure. Vues,
  sessions, temps passé, abandon, questions passées.

Un zéro se lit « ça ne marche pas » ; ces trois formes disent la vérité.

## A6. Les droits d'accès (entitlement)

**Implémenté.** Cette section décrivait une couture à venir ; elle décrit
maintenant ce qui tourne. Les deux points d'accroche annoncés sont ceux qui
ont été utilisés, et aucun autre.

### La chaîne d'accès

```text
authentification            middleware auth:sanctum
      ↓
statut de compte            middleware account.active  (users.account_status)
      ↓
DROIT D'ACCÈS               EntitlementService         (entitlements + palier)
      ↓
publication leçon           ContentAccess              (lessons.publication_status)
      ↓
publication module          ContentAccess              (lesson_modules)
      ↓
publication exercice        ContentAccess              (practice_exercises)
      ↓
règles de progression       lessonAccess.js            (déverrouillage séquentiel)
```

Chaque maillon a UNE autorité, et `ContentAccess` est le seul endroit qui les
compose.

### Les trois types de droit

```text
free             règle, pas une ligne : tout compte actif le satisfait
subscription     écrit par SubscriptionEntitlementSynchronizer à partir d'un abonnement
                 activé À LA MAIN (activation directe par un administrateur, ou code
                 d'activation lié à une offre) — jamais d'un paiement en ligne
admin_override   dérogation accordée par un administrateur
```

Le vocabulaire de la colonne `type` est clos à ces trois valeurs. `book_access`,
`school_access`, `partner_access` ne sont pas implémentés — la colonne est une
chaîne libre pour qu'ils restent additifs, mais rien ne les connaît aujourd'hui.

**Une cinquième raison d'accès, sans ligne (2026-10-26) :** `school_licence` — un élève
membre actif d'une classe active d'un établissement dont la licence court est premium
*par son établissement* (`Domain\School\SchoolCoverage`, évalué à chaque requête, AVANT
`teacher_subscription`) ; contrat : `SCHOOL_ADMIN_SPACE.md` §5bis.

**Une quatrième raison d'accès, sans ligne (2026-09-22) :** `teacher_subscription`.
Un élève membre actif d'une classe (قسم) dont l'enseignant a un abonnement en
cours portant le droit `students.covered` est premium *par son enseignant*.
C'est évalué à chaque requête (`Domain\Plans\TeacherCoverage`, mémo vidé avec
les autres), après `activation_code` dans l'ordre des raisons, et rien n'est
écrit dans `entitlements` : suspendre l'abonnement de l'enseignant ferme la
couverture à la requête suivante. Contrat complet dans
[`TEACHER_CLASSROOM_ARCHITECTURE.md`](./TEACHER_CLASSROOM_ARCHITECTURE.md) §6.

**Et une cinquième, par le rôle :** `teacher_role`. Un compte ENSEIGNANT actif
lit tout le contenu publié, gratuit ou payant — il prépare ses cours, il ne les
achète pas (l'unité de vente de son offre est l'élève). Aucune ligne : c'est
`EntitlementService::decide` qui l'accorde, après le statut de compte et avant
toute lecture de droits. La publication reste souveraine et la visibilité par
classe ne le concerne pas (§8b du même contrat). Un enseignant n'ÉCRIT jamais
de progression : middleware `learner`.

### L'invariant central : droit ≠ publication

```text
droit valide  +  leçon masquée    =  REFUS
leçon publiée +  aucun droit      =  REFUS
```

Une dérogation d'administration **ne donne pas accès au contenu non publié**.
Elle répond « cet élève a la permission commerciale », jamais « ce contenu peut
être servi ». Un contenu masqué l'est parce qu'il est faux ou en relecture : le
montrer à quelqu'un qui a payé serait pire, pas mieux. Verrouillé par
`EntitlementAccessMatrixTest`.

### Le gratuit ne crée aucune ligne

Aucun élève n'a de ligne `entitlements` pour accéder au contenu gratuit : la
règle suffit. Une ligne par élève produirait des millions d'enregistrements qui
ne portent aucune information — leur absence dit déjà la même chose — et
créerait un risque d'élève enfermé dehors parce qu'une migration a oublié de
lui fabriquer son droit.

> **Les fonctionnalités (instruments du مختبر, cahier, travaux) ont leur
> propre réglage par palier** — écran « الوصول والحدود »
> (`/admin/offres/acces`), table `feature_access_policies`, journal
> `access_policy.updated`. Le palier de l'UTILISATEUR y est celui
> d'`EntitlementService` décrit ici. Contrat : [`ACCESS_AND_LIMITS.md`](./ACCESS_AND_LIMITS.md).

### Le palier du contenu, et son défaut

**`lessons.tier` est la seule source de vérité** du palier d'une leçon
(`free` | `premium`), et **l'administrateur en est l'autorité** (révisé le
2026-09-25). Il n'existe AUCUNE liste figée de leçons gratuites ou payantes :
ni dans le code, ni dans le catalogue, ni dans un fichier de configuration.
L'ancienne liste `FREE_LESSON_IDS` (`packages/core/curriculum/freeLessons.js`),
que chaque import recopiait dans `lessons.tier` en écrasant les décisions de
l'administration, a été supprimée.

```text
leçon NOUVELLE (import, SQL de rattrapage)   → tier = 'free'   (défaut de CRÉATION, pas une classification)
leçon EXISTANTE (tout import, tout déploiement) → tier JAMAIS réécrit
changement de palier                          → administration uniquement : PATCH /admin/content/lesson/{id}/tier
                                                 (ou le geste en lot), journalisé
```

- Le **catalogue ne porte aucun palier** : ni `coursesData.js`, ni
  `dz/lessons_4am_*.json`, ni l'export (`exportCurriculum.mjs`). Un `tier`
  présent dans un export ancien est ignoré, même à la création.
  `scripts/check-dormant-isolation.mjs` fait échouer la CI si un `tier`
  réapparaît dans le catalogue algérien.
- `CurriculumImporter` pose `tier = 'free'` **à la création seulement** ; la
  mise à jour d'une leçon existante ne contient pas la colonne.
  `smarter:curriculum-sql` suit la même règle : `'free'` dans l'`INSERT`,
  aucune mention de `tier` dans l'`ON DUPLICATE KEY UPDATE`.
- Le défaut reste `free` à trois niveaux : la colonne, `CurriculumImporter` et
  `AccessTier::normalize()`, qui traite tout ce qui n'est pas exactement
  `premium` (NULL, chaîne vide, faute de frappe) comme gratuit.

Ce sens est délibéré et c'est la protection principale de tout le dispositif :
un palier oublié laisse une leçon OUVERTE. Le contenu payant se déclare — par
l'administrateur ; il ne s'obtient pas par distraction. C'est l'inverse de la
liste blanche de publication (où l'inconnu ferme) parce que l'inconnu n'y
signifie pas la même chose : un état de publication inconnu est un bug, un
palier absent veut dire « personne n'a décidé de le vendre ».

#### Synchronisation du contenu ≠ autorité du palier

```text
synchronisation du catalogue (import, SQL, déploiement)   décrit ce qu'EST une leçon : titre, unité, points, modules
administration                                            décide QUI peut l'ouvrir : lessons.tier, publication_status
```

La synchronisation met à jour le contenu et **préserve** toute configuration
d'accès décidée par l'administrateur — le palier comme la publication.
`smarter:registry-health` ne compare donc plus le palier au catalogue (une
décision d'administration n'est pas une « dérive ») ; il contrôle la base sur
sa propre règle : chaque leçon d'une classe active porte un palier explicite et
connu. La présence en base d'une leçon que le catalogue ne déclare plus est
signalée à part, comme une question de PÉRIMÈTRE (`lessonsOutsideCatalogue`).

#### Base locale, base de production

Chaque base porte SES leçons et SES paliers : la base locale fait foi pour le
développement, la base de production fait foi pour la production. Aucun code ne
déduit le palier de production d'une donnée embarquée. Le déploiement
(`deploy.yml`, étape « Synchronise the curriculum mirror ») applique les
migrations puis rejoue la MÊME synchronisation qu'un développeur en local
(`smarter:import-curriculum`, `smarter:import-content-registry`,
`smarter:prune-retired-learning-points`, sans `--with-history` — une leçon
absente du catalogue est supprimée si aucun élève ne l'a touchée, ARCHIVÉE
sinon), capture
`smarter:lesson-inventory --tiers-only` avant et après, et **échoue si le
palier d'une leçon existante a changé**. Il imprime ensuite l'inventaire des
leçons de production (classe, unité, publication, palier). Procédure :
[`deployment/DZ_FIRST_DEPLOYMENT.md`](../deployment/DZ_FIRST_DEPLOYMENT.md).

### Validité temporelle

Heure du serveur, jamais celle du client.

```text
starts_at  NULL ou <= maintenant   → commencé   (borne INCLUSE)
expires_at NULL                    → sans terme
expires_at >  maintenant           → valide     (borne EXCLUE)
expires_at <= maintenant           → expiré
```

Les bornes sont écrites deux fois — `Entitlement::isValid()` pour l'autorité,
le scope `validNow()` pour que la question reste une requête indexée — et
`EntitlementServiceTest::test_sql_scope_and_php_agree` les tient ensemble.

Les droits **se cumulent** : il suffit qu'un seul ouvre. Un abonnement expiré
doublé d'une dérogation valide donne l'accès.

### Révocation

`status = revoked`, jamais de suppression. « Cet élève a eu accès du 3 au 12 »
est précisément ce qu'un audit vient chercher.

Perdre un droit **ne touche à aucun apprentissage** : progression, maîtrise,
preuves et tentatives restent intactes, et redeviennent accessibles si le droit
revient. L'accès change, l'histoire reste.

### Ce qui est exposé

| Point d'entrée | Qui | Quoi |
| --- | --- | --- |
| `GET /content/availability` | élève | `closed.lessons` (retiré), `closed.premium` (payant), `closed.locked` (verrouillé), `closed.hiddenByClass`, `access` (résumé) |
| `GET /content/availability/public` | visiteur (sans compte) | le même inventaire pour un utilisateur `null` : `locked` = `premium`, aucune donnée personnelle ; un jeton éventuel est ignoré |
| `GET /me/access` | élève | le résumé seul |
| `GET /admin/students/{id}/entitlements` | admin | état + historique complet |
| `POST /admin/students/{id}/entitlements/override` | admin | accorder |
| `DELETE /admin/students/{id}/entitlements/override` | admin | retirer |

`closed.lessons` et `closed.locked` sont **deux listes distinctes** : une leçon
retirée n'existe pas pour l'élève, une leçon verrouillée existe et lui dit ce
qui lui manque. Les confondre afficherait « indisponible » là où il fallait
expliquer qu'un accès premium est requis.

Aucun point d'entrée ne laisse un élève modifier un droit, et le résumé
n'expose ni référence externe, ni identité de l'administrateur.

Un administrateur ne peut accorder qu'une **dérogation**. Un abonnement ne se
crée pas au clavier : ce serait un abonnement que personne n'a payé, invisible
dans toute réconciliation comptable. Les deux mutations sont journalisées
(`entitlement.granted`, `entitlement.revoked`) dans la même transaction que
l'écriture.

### Le frontend n'autorise rien

Le bundle ne connaît AUCUN palier : `ContentAvailabilityContext` porte la
décision du serveur (`/content/availability`, et `/content/availability/public`
pour un visiteur) et chaque surface la lit par `isLessonPremium(code)` (badge)
et `isLessonLocked(code)` (verrou). `isLessonUnlocked(lesson, …)`, qui lisait un
`lesson.tier` embarqué, a été supprimé. Surfaces concernées : `LessonCard` et
sa ligne `LessonRow` (catalogue, « دروسي », exploration — état lu une fois par
`useLessonTileState`), `StudentHome` (compte des leçons premium),
`LessonIndex` (sommaire), `ModuleLayout` (un module verrouillé n'écrit ni visite
ni complétion) et **`LessonAccessGate`**, que la fabrique de routes de l'unité
(`_unit/lessonRoutes.jsx`) pose autour de CHAQUE page d'une leçon — sommaire et
modules, avant le chargement paresseux du module : une URL de module tapée
directement tombe sur le même panneau (`PremiumLessonLocked`) que le sommaire,
et une leçon générée demain en hérite sans code.

Le contenu d'une leçon est du JSX livré dans le bundle : le serveur ne peut pas
le retenir. La frontière de sécurité est donc chaque ÉCRITURE et chaque
ressource servie par l'API — progression, preuve, test final, liste des
exercices, séance et question de pratique — qui repasse par `ContentAccess`, et
celui-ci ne lit jamais l'état du client. Un élève qui forcerait l'état du
contexte dans son navigateur verrait une page et rien de plus : aucune
progression, aucune pratique, aucune maîtrise.

**Fraîcheur.** Aucun cache ne porte le palier : ni HTTP, ni Laravel (le mémo
d'`EntitlementService` vit le temps d'une requête), ni service worker. Le
contexte relit l'inventaire au changement de compte, à la saisie d'un code
d'activation (`refresh`), et quand l'élève REVIENT sur l'onglet (au plus une fois
toutes les 30 s, `AVAILABILITY_REFRESH_MIN_MS`) : une décision de
l'administrateur atteint un navigateur déjà ouvert sans rechargement complet.

Politique d'ouverture, comme partout ailleurs : tant que la réponse n'est pas
arrivée, rien n'est verrouillé.

### La synchronisation des abonnements

**Implémentée.** `App\Domain\Access\SubscriptionEntitlementSynchronizer`
traduit un état d'abonnement faisant autorité en lignes `entitlements` de type
`subscription`.

```text
activation MANUELLE           SubscriptionActivationService : activation directe par un
                              administrateur, ou code d'activation lié à une offre
                              (jamais un fournisseur de paiement — produit DZ, Annexe A7)
      ↓
subscriptions                 l'état qui FAIT AUTORITÉ
      ↓
SubscriptionEntitlementSynchronizer
      ↓
entitlements (type=subscription)
      ↓
EntitlementService
      ↓
ContentAccess
```

Le service ne fait QUE cette traduction : il n'autorise rien, ne regarde
aucune publication, ne sait pas ce qu'est une leçon payante, ne crée aucune
dérogation et ne traite aucun paiement. Cette étroitesse est le but — c'est
elle qui permettra de brancher un fournisseur sans toucher à la couche
d'accès.

#### La règle, explicitement

Le vocabulaire vient de `Subscription::STATUSES`, tel qu'il existait déjà :

| statut | droit | pourquoi |
| --- | --- | --- |
| `active` | ACTIF, de `started_at` à `ends_at` | — |
| `trialing` | ACTIF, de `started_at` à `ends_at` | ajouté le 2026-09-22 (essai accordé à la main) |
| `suspended` | RÉVOQUÉ | ajouté le 2026-09-22 : suspendre ferme l'accès, `resume` le rouvre, rien n'est supprimé |
| `cancelled` | ACTIF jusqu'à `ends_at` | résilier n'est pas se faire rembourser : la période déjà payée reste due |
| `cancelled` sans `ends_at` | aucun | rien à honorer |
| `expired` | RÉVOQUÉ | — |
| `pending` | aucun | ouvrir sur « en attente » donnerait l'accès avant le paiement |
| `free` | aucune ligne | le gratuit est une règle, pas une donnée |

#### Les paiements ne sont jamais lus

`payments` n'apparaît pas dans le synchroniseur, et ne doit jamais y
apparaître. « Un paiement existe » et « l'accès est ouvert » sont deux faits
distincts qu'un remboursement sépare : un paiement réussi dont l'abonnement a
expiré n'ouvre rien. Verrouillé par
`SubscriptionSynchronizationTest::test_a_successful_payment_never_grants_access_by_itself`.

#### Idempotence

La ligne de droit est retrouvée par sa `reference`, `subscription:<id>` —
construite depuis l'identifiant INTERNE, donc stable : elle ne dépend ni de la
date d'exécution, ni du statut, ni des dates. Dix exécutions produisent une
seule ligne, et un renouvellement MET À JOUR au lieu d'empiler. Sans cela, une
tâche horaire aurait fabriqué un droit par heure.

L'identifiant interne plutôt que `external_reference` : ce dernier est
nullable et appartient à un fournisseur qui n'existe pas encore.

#### Le temps reste la barrière, pas la synchronisation

Les dates sont COPIÉES dans le droit, si bien qu'un droit expire tout seul
même si le synchroniseur n'a pas tourné depuis des semaines. **Ne pas lancer la
commande ne donne l'accès à personne.** La synchronisation entretient l'état ;
elle n'est pas le rempart.

Conséquence observée en vérification : modifier `subscriptions.ends_at`
directement en base ne ferme pas l'accès tant que la synchronisation n'a pas
propagé la nouvelle date — le droit garde la sienne. C'est la séparation qui
fonctionne, pas un défaut.

#### Où elle tourne

```text
php artisan smarter:sync-entitlements [--subscription=ID] [--dry-run]
POST /v1/admin/students/{id}/entitlements/sync
```

Aucun webhook : aucun fournisseur n'est branché. Les deux points d'entrée
existent pour rattraper un état modifié hors de l'application (import,
correction en base) et, le jour venu, un webhook manqué.

La route d'administration n'est NI un encaissement NI une création
d'abonnement : sans abonnement, elle ne produit rien. Un administrateur ne
peut donc pas fabriquer un accès payant par ce chemin — la dérogation reste le
seul mécanisme d'exception manuelle, et elle porte son nom.

### Le palier des exercices

`practice_exercises.tier` est **nullable**, et `null` veut dire « hérite de la
leçon ». La distinction avec `'free'` est toute la règle :

```text
exercice null      → suit sa leçon              (le défaut)
exercice premium   → payant, même leçon gratuite
exercice free      → gratuit, MÊME leçon payante (exception explicite)
```

Sans le `null`, rendre une leçon payante laisserait ses exercices ouverts et le
contenu vendu fuirait par sa pratique. Le troisième cas existe pour ouvrir une
démonstration sous une leçon vendue ; il ne s'obtient que si un administrateur
l'a posé, et **repasser la leçon en gratuit ne l'efface pas** — l'intention
survit. Règle dans `AccessTier::effective()`, table de vérité dans
`ContentTierControlTest`.

Les modules n'ont pas de palier : un module suit sa leçon. Lui en donner un
permettrait de vendre le module 7 d'une leçon gratuite, ce qui découperait un
parcours pédagogique en péage.

### Le contrôle du palier par l'administration

```text
PATCH /v1/admin/content/{lesson|exercise}/{id}/tier
```

Route DISTINCTE de `/status`, parce que publication et palier sont deux
dimensions indépendantes : sans cela on ne pourrait plus vendre une leçon sans
la republier, ni la retirer sans la rendre gratuite. Les quatre combinaisons
ont un sens. Journalisé (`lesson.tier_changed`, `exercise.tier_changed`), et
ne touche à aucune donnée d'apprentissage.

### Le badge suit le contenu, le verrou suit l'élève

`/content/availability` renvoie DEUX listes :

```text
closed.premium  ce qui est payant          (indépendant du lecteur)
closed.locked   ce qui lui est fermé       (vide s'il a accès)
```

Une seule ne suffisait pas : `locked` se vide dès que l'élève a accès, si bien
qu'une leçon payante qu'il peut ouvrir n'apparaissait plus nulle part comme
payante. Le contenu vendu se déguisait en gratuit, et sa disparition à
l'échéance serait devenue incompréhensible. Défaut trouvé au navigateur, pas
aux tests.

### Ce qui reste hors périmètre

Stripe, encaissement, tunnel d'achat, webhooks de fournisseur, facturation,
remboursements, page de tarifs marchande, accès livre, accès établissement
comme objet propre (une école est servie par un lot de codes lié à une offre).
Les offres configurables, les abonnements manuels, les enseignants et leurs
classes sont l'Annexe A7.

## A7. Enseignants, classes et offres configurables (2026-09-22)

**Implémenté.** Le contrat vit dans
[`TEACHER_CLASSROOM_ARCHITECTURE.md`](./TEACHER_CLASSROOM_ARCHITECTURE.md),
qui fait autorité ; cette annexe ne dit que ce que le panneau en montre.

### La règle commerciale du produit algérien

```text
aucun paiement en ligne, pour personne     ni tunnel, ni carte, ni fournisseur, ni webhook, ni « payer »
gratuit                                     automatique : l'offre PAR DÉFAUT du type (plans.is_default), sans ligne
vente individuelle                          l'argent est reçu HORS plateforme, puis l'administrateur
                                            · active l'offre directement sur le compte, OU
                                            · envoie UN code d'activation unique lié à l'offre
vente en nombre (école, classe)             un lot de X codes lié à une version d'offre (et à une capacité) = X activations
demande d'offre                             facultative, ne donne JAMAIS l'accès ; pending → fulfilled | rejected | cancelled
unité de vente enseignant (2026-09-22)      le SIÈGE ÉLÈVE : l'enseignant choisit combien d'élèves distincts il encadre,
                                            la grille de la version (plan_pricing_tiers) donne le prix par élève, total = N × prix ;
                                            les classes sont illimitées et n'entrent dans aucun prix
```

Les prix sont informatifs : un montant fixe (`plan_prices`) pour une offre
sans grille, un calcul serveur (`TeacherPricingService`) pour l'offre
enseignant par sièges — le client affiche un aperçu et n'est jamais cru. La
grille se modifie sur une version en BROUILLON et se publie ; un abonné garde
sa version, ses sièges achetés et son prix figé (`student_seat_limit`,
`seat_unit_price_cents`, `seat_total_cents`). `PlanCatalog` (dormant,
`config/billing.php`) reste « config d'abord, base ensuite » : les offres
commerciales enseignant/élève ne vivent qu'en base et aucun écran DZ ne lit
`/billing/*`.

### Ce que le panneau ajoute

| Navigation | Page | Sert à |
|---|---|---|
| Enseignants | `/admin/enseignants`, `/admin/enseignants/{id}` | compte, **capacité élèves** (encadrés / capacité, restants, classes illimitées, sièges achetés, palier et prix à l'activation), offre courante, **Activer une offre** (avec le nombre d'élèves), **Envoyer un code d'activation** (avec sa capacité), demande (sièges, palier, total calculé), abonnement + historique, droits (valeur · utilisation · source, dérogations), classes, activité |
| Élèves | `/admin/eleves`, `/admin/eleves/{id}` | **la liste** (depuis 2026-10-24) : colonne « تفعيل عرض » — un menu des offres élève activables (actives ou masquées, jamais l'offre par défaut), confirmé, sans date ni note (l'offre garde sa durée ; `PlanActivateControl`) — et le même geste **en lot** : cases à cocher (seulement s'il existe une offre activable) + `BulkActionBar`, une action « تفعيل «<offre>» » par offre (`bulkPlanActions.jsx`). Pas de route groupée : le lot rappelle `POST /admin/students/{id}/subscriptions` élève par élève, séquentiellement, et nomme chaque refus avec le motif du serveur ; chaque ligne prend le statut réellement renvoyé. **La fiche** : le même bloc commercial (`CommercialPanel`, rôle-agnostique) sous la fiche apprentissage — le chemin complet (date de fin, note, code) |
| Classes | `/admin/classes`, `/admin/classes/{id}` | lecture seule : enseignant, effectif, leçons masquées, dernière activité |
| Offres | `/admin/offres`, `/admin/offres/{id}` | éditeur : informations · demandes autorisées · versions (nouvelle, publier, gel) · capacité élèves · **grille de prix par élève** (paliers min/max/prix/devise/actif/ordre, erreurs listées avant l'enregistrement, aperçu « pour N élèves » local + vérification serveur) · durée activée · fonctionnalités · contenu · limites techniques · abonnés (sièges) |
| Offres › Demandes | `/admin/offres/demandes` | la file `subscription_requests` avec sièges demandés et total calculé par le serveur ; « Activer » ouvre la fiche du compte, « Refuser » exige un motif |
| Offres › Abonnements | `/admin/offres/abonnements` | offre, version, source (`acquisition_source`), accordé par ; Suspendre / Reprendre / Annuler / Prolonger / Changer d'offre |
| Offres › التحدّي اليومي | `/admin/offres/defi-quotidien` | the daily challenge's scale and defaults (closed key list, validated server-side, journaled `daily_challenge.config_updated`; every challenge freezes its configuration). Contract: `DAILY_CHALLENGE.md` §12 |
| Offres › الوصول والحدود | `/admin/offres/acces` | par palier (مجاني / وصول كامل) : chaque instrument du مختبر (activé, gratuit, premium), le cahier et les travaux (accès, limite ou « غير محدود », période mois / à vie), confirmation de tout geste restrictif, consommation du mois par palier et par instrument ; la fiche élève / enseignant montre utilisé / limite / restant (`FeatureUsagePanel`). Contrat : `ACCESS_AND_LIMITS.md` |
| Accès › Codes | `/admin/codes-activation` | le formulaire de lot gagne « Offre » (obligatoire pour une offre enseignant, facultatif pour un lot élève) et « Élèves par code » pour une offre par sièges ; les listes montrent l'offre et la capacité |

Le tableau de bord compte enseignants, classes et demandes en attente ; une
demande en attente est une alerte vers `/admin/offres/demandes`. Tout est
journalisé dans la même transaction (`plan.*`, `plan_version.*`,
`plan_override.*`, `subscription_request.*`, `subscription.*`,
`activation_code.issued`, `teacher.status_changed`, `classroom*.*`).

### Deux invariants que le panneau ne peut pas contourner

- **Statut de compte ≠ statut d'abonnement.** Suspendre un compte ne touche
  pas son abonnement ; suspendre un abonnement ne ferme pas le compte.
- **Une rétrogradation ne détruit rien.** Expiration, suspension, annulation
  ou offre plus petite : le résolveur retombe sur l'offre par défaut et
  `overLimit` bloque la création (classe, adhésion par lien ou par code). Classes,
  membres, visibilités et progression restent lisibles.

## A8. Les relecteurs : ambassadeurs, état de publication, signalement (2026-10-05, révisé 2026-10-07)

Un **relecteur** est l'administrateur ou un enseignant **ambassadeur**
(« سفير ») — `User::canReviewAllContent()`, qui ne décide plus que du
SIGNALEMENT. Ce que chacun VOIT est décidé par
`ContentAccess::visibleStatuses()` (§8) : l'administrateur voit tous les
états ; l'ambassadeur voit `published` et `hidden`, **pas** `draft` ni
`archived` (révision du 2026-10-07 — avant, il voyait tout). Un ambassadeur
reste un enseignant : ses classes, son offre et son statut de compte ne
changent pas.

### Désigner un ambassadeur

- Colonnes `users.is_ambassador` (booléen, défaut faux) et
  `users.ambassador_since`. `User::isAmbassador()` exige AUSSI le rôle
  enseignant : un drapeau resté sur un autre compte n'ouvre rien.
- `PATCH /api/v1/admin/teachers/{id}/ambassador` `{ambassador: bool}`
  (`can:admin`) → `AmbassadorService::set` : enseignants seulement (422
  sinon), transaction, journal `teacher.ambassador_changed` ; redemander
  l'état courant ne journalise rien.
- Panneau : interrupteur « سفير » (`components/admin/ui/AmbassadorSwitch.jsx`)
  dans la liste `/admin/enseignants` (colonne, compteur `counts.ambassadors`,
  filtre `?ambassador=1`) et dans la fiche enseignant.
- `/auth/me` (UserPresenter) porte `isAmbassador` et `canReviewContent`
  (vrai aussi pour l'admin). L'interface lit `canReviewContent` ; le serveur
  décide.

### Voir le contenu non publié, avec son état

- `ContentAccess::visibleStatuses($user)` / `canSee($user, $state)` : la seule
  table « qui voit quel état » ; `seesUnpublished($user)` vaut vrai pour
  l'admin et l'ambassadeur. Seul l'axe PUBLICATION varie : classe active et
  palier restent évalués (l'admin passe le palier comme l'enseignant :
  `AccessDecision::VIA_ADMIN_ROLE`). La visibilité par classe ne concerne que
  les élèves. (`bypassesPublication`, qui levait tout l'axe, est supprimé.)
- `GET /content/availability` ferme pour chacun ce qu'IL ne voit pas
  (`closed.lessons`, `closed.modules`) et rend à l'admin et à l'ambassadeur
  `closed.statuses = {lessons: {code: état}, modules: {code: {numéro: état}}}`
  — seulement le non publié QU'IL VOIT ; un code dont une version est publiée
  n'y figure pas. Admin : rien n'est fermé. Ambassadeur : le brouillon et
  l'archivé sont fermés, le masqué porte son état. Aucun autre compte ne
  reçoit `statuses`.
- `GET /lessons/{code}/exercises` liste les exercices dont l'état est visible
  pour le compte, avec `publicationStatus` pour l'admin et l'ambassadeur.
- Frontend : `ContentAvailabilityContext` expose `lessonStatus(code)` et
  `moduleStatus(code, n)` (« published » par défaut) ; la pastille
  `components/content/PublicationBadge.jsx` (couleurs de `StatusBadge`) est
  posée sur `LessonCard` / `LessonRow`, la page d'unité, le sommaire (en-tête + cartes de
  module) et l'en-tête de module. Elle ne rend rien pour un contenu publié.
- Pour tous les autres, le sommaire d'une leçon non publiée ouverte par URL
  directe affiche désormais « هذا الدرس غير متاح حالياً » (le trou connu de
  `LessonIndex`, qui ne lisait pas `isLessonClosed`, est fermé).
- **Aucune écriture ne s'ouvre** : progression, preuves, test final et
  pratique restent derrière `learner`.

### Le signalement

- Middleware `reviewer` (`EnsureContentReviewer`) sur `POST /reports` ;
  `PATCH /reports/{id}` (l'ancienne complétion) est supprimée.
- UN envoi multipart → `ReportService::submit` : catégorie obligatoire
  (`OFFERED_CATEGORIES` seulement — les anciennes ne se créent plus), note
  ≤ 2000, capture facultative. Plus de signal posé au clic, plus de
  brouillon réutilisé : chaque envoi crée une ligne complète
  (`details_completed_at` posé à la création).
- **Capture d'écran** : `student_reports.screenshot_path`, disque privé
  `local` sous `reports/{id}/`, PNG / JPEG / WebP lus sur le CONTENU (finfo
  + getimagesize, jamais de SVG), 2 Mo au plus (`ReportScreenshotStore`). Une
  capture refusée annule l'envoi entier. Servie par
  `GET /admin/reports/{id}/screenshot` (`can:admin`, `nosniff`).
- **Où est le bouton** : variante `prominent` (ambre, libellé visible) EN
  HAUT — dans la rangée de repères du module (`ModuleLayout`) et du sommaire
  (`LessonIndex`) ; le pied de page du module n'en porte plus.
- **La capture, comme l'outil d'un système d'exploitation** : « التقاط منطقة من
  الصفحة » retire la fenêtre (le défilement est libéré) et ouvre
  `ScreenSnipper` : le relecteur fait défiler la page (molette ; au doigt, mode
  « تمرير ») puis glisse pour tracer la région, ou prend « الشاشة كاملة » ; la
  fenêtre revient avec l'image, la catégorie et la note conservées. Il peut
  encore y encadrer des détails (`ScreenshotAnnotator`) et les cadres sont
  brûlés dans l'image (WebP, ≤ 1600 px de large) à l'envoi. `captureRegion`
  (`features/reports/screenshot.js`) sérialise la page en SVG avec
  `html-to-image` **chargé à la demande** et ne dessine QUE la région sur la
  toile — une longue leçon ne produit jamais une toile géante. La fenêtre et
  l'outil portent `data-report-ignore` (exclus de l'image) et sont rendus dans
  `<body>` par un portail : la rangée de repères du module forme un contexte
  d'empilement que la barre de navigation recouvrait.
- **Dev Vite** : `html-to-image` est dans `optimizeDeps.include`
  (`vite.config.js`) — découvert en cours de session, sa ré-optimisation
  rendait des 504 « Outdated Optimize Dep » aux onglets ouverts (liens qui
  changent l'URL sans changer la page).
- Liste admin : colonne et filtre « لقطة الشاشة » (`?screenshot=1`,
  `counts.withScreenshot`) ; la colonne « اكتمال البلاغ » et le filtre
  `completion` ont disparu. La fiche montre la capture et le rôle de
  l'auteur (`student.role`, `student.isAmbassador`).
- Les signalements antérieurs étaient des tests : la migration
  `2026_10_05_000002` les a effacés, notes comprises.

## A9. Suppression définitive d'un compte (2026-10-07)

À ne pas confondre avec la **désactivation** (`AccountStatusService`), qui
ferme le compte en gardant tout. La suppression ne laisse **rien**.

- **Qui** : un administrateur, sur un compte **élève ou enseignant**. Jamais
  un administrateur (ni soi-même) — 422.
- **API** (`can:admin`) : `GET /api/v1/admin/users/{id}/deletion-preview` →
  `summary` (progression, séances, tentatives, copies, carnet, Math Lab,
  abonnements, paiements, signalements, appartenances ; pour un enseignant
  `classrooms` et `studentsInClassrooms`), puis
  `DELETE /api/v1/admin/users/{id}` `{confirmEmail}` → `{id, role,
  filesDeleted}`. L'e-mail retapé est **revérifié par le serveur** (casse et
  espaces ignorés) ; faux ou absent → 422, rien n'est touché.
- **Ce qui part** (`UserDeletionService`) : la ligne `users`, et avec elle
  toutes les tables en CASCADE sur `users.id` (30 tables : progression,
  preuves, tentatives, séances, classes de l'enseignant et leurs
  appartenances, abonnements, paiements, signalements, carnet, Math Lab…) ;
  les colonnes qui ne font que citer l'utilisateur comme auteur d'un geste
  (`granted_by`, `reviewer_id`, `created_by`…) passent à NULL. Le service
  ajoute ce que la base ne sait pas faire : jetons Sanctum, `sessions`,
  `password_reset_tokens`, et les **fichiers** du disque privé (copies et leur
  version annotée, fichiers Math Lab, captures de signalement), effacés APRÈS
  la transaction.
- **Un enseignant supprimé** emporte ses classes : ses élèves en sortent,
  leurs comptes et leur progression restent.
- **Journal** : `user.deleted`, entité `user` + id, `before = {role}` —
  aucune donnée personnelle ne survit dans l'audit.
- **Panneau** : « منطقة الخطر » en bas des fiches élève et enseignant
  (`components/admin/DeleteUserSection.jsx`) : avertissement « لا رجعة فيه »,
  ce qui sera perdu (l'aperçu), e-mail à retaper — le bouton reste inactif
  tant qu'il ne correspond pas —, puis retour à la liste.
- Tests : `AdminUserDeletionTest` (API), `DeleteUserSection.render.test.jsx`.

---

# Annexe A10 — La librairie (2026-10-17)

Section « الكتب » de la barre latérale (`/admin/livres/*`) : commandes de
livres papier (états contrôlés, frais de livraison fixé après coup, paiements
en lignes, historique), fiches livres (prix, publication, contenu de la page
publique) et messages reçus. Même chrome que les autres écrans (`AdminPage`,
`DataTable`, `FilterBar`), routes `can:admin`, gestes dans le journal
(`book.*`, `book_order.*`). Contrat complet : [`BOOKS_STORE.md`](./BOOKS_STORE.md).

# Annexe A11 — Les établissements (2026-10-26)

« المؤسسات » (`/admin/etablissements`, groupe « الأساتذة » de la barre latérale) :
l'administration crée un établissement, le suspend ou l'archive, et en nomme le
DIRECTEUR — un nouveau compte `school_admin` dont le mot de passe n'est montré
qu'une fois. Le directeur n'est pas un administrateur : il ne passe jamais
`can:admin`, et l'administrateur ne passe jamais `can:school`. Routes `can:admin`,
gestes dans le journal (`school.*`, jamais le mot de passe). La fiche porte aussi
« رخصة المؤسسة » : activer une licence de sièges (une nouvelle annule l'actuelle),
la suspendre, la reprendre, l'annuler (§5bis). Contrat complet :
[`SCHOOL_ADMIN_SPACE.md`](./SCHOOL_ADMIN_SPACE.md) §5.

## A10. Ouvrir ou fermer les inscriptions, créer un compte élève (2026-11-21)

Demande du propriétaire : « make it configurable open or close registration from the dashboard of the admin, and also
the possibility to create the account for a student as an admin ».

### L'interrupteur « التسجيل »

- **Où** : la carte « التسجيل » en tête du tableau de bord (`components/admin/RegistrationCard.jsx`, montée par
  `pages/admin/Dashboard.jsx` hors des données du tableau, pour rester utilisable quand elles ne chargent pas). Deux
  interrupteurs : l'inscription publique (formulaire + Google) ; et, visible seulement quand elle est fermée,
  « التسجيل برابط القسم » (l'élève invité par le lien de la classe de son enseignant). OUVRIR demande une confirmation.
- **Où c'est gardé** : table `platform_settings`, ligne `registration` (`values.open`, `values.class_links`,
  `updated_by`). `App\Domain\Registration\RegistrationGate` est le SEUL lecteur : la ligne l'emporte sur
  `config/registration.php` (`REGISTRATION_OPEN`, `REGISTRATION_CLASS_LINKS`), qui n'est plus que le DÉFAUT tant que
  l'administrateur n'a pas touché l'interrupteur. Une valeur absente de la ligne retombe sur le défaut.
- **Routes** (`can:admin`) : `GET /admin/registration` → `{ registration: { open, classLinks } }` ;
  `PATCH /admin/registration` avec `open` et/ou `classLinks` (booléens). Le geste est journalisé
  (`registration.settings_changed`, avant → après). `GET /registration` (public) rend les valeurs effectives.
- `platform_settings` est une table générale (clé unique, valeurs JSON) : un prochain réglage de plateforme y prend
  une ligne, il ne crée pas une table.

### Créer un compte élève

- **Où** : « إنشاء حساب تلميذ » sur la liste des élèves (`pages/admin/students/CreateStudent.jsx`) : prénom et nom
  ARABES (`PersonName`, la règle de l'inscription), courriel FACULTATIF, classe scolaire facultative.
- **Route** : `POST /admin/students` (`StudentService::create`) → 201 `{ student, login, password }`,
  `Cache-Control: no-store`. Le mot de passe (`StudentCredentials::generate`) n'existe en clair que dans cette
  réponse : la page le montre UNE fois (`components/admin/OneTimeCredentials.jsx`, la même carte que
  « مسيّرو المكتبة »), l'administrateur le remet lui-même.
- **Sans courriel** : un identifiant généré `a.<6 caractères>@<school.student_login_domain>`
  (`StudentCredentials::uniqueLogin`, partagé avec l'import d'un établissement, préfixe `s<id>`). Il n'a pas de boîte
  aux lettres : aucun courriel ne lui part, donc PAS de « نسيت كلمة المرور » — `Not yet implemented` : la
  réinitialisation du mot de passe d'un élève par l'administrateur.
- **Ce que le compte est** : élève, adresse vérifiée, aucun consentement légal écrit à sa place (comme un élève importé
  par un établissement), aucune classe, aucune notification « new_student ». Sans classe scolaire, sa première
  connexion passe par « /espace/bienvenue ». Fonctionne que les inscriptions soient ouvertes ou fermées
  (`RegistrationGate` n'est pas consulté). Courriel déjà pris : 422 `reason: email_taken`. Journal : `student.created`
  (jamais le mot de passe).
- La classe scolaire doit être un code de `grades` (actif quand `curriculum.enforce_active_grades`).

Tests : `AdminRegistrationSwitchTest`, `AdminStudentCreationTest`, `RegistrationClosedTest` ;
`RegistrationCard.render.test.jsx`, `CreateStudent.render.test.jsx`. Composants partagés nés ici :
`components/admin/ui/Switch.jsx` (l'interrupteur accessible, repris par `AmbassadorSwitch`) et `OneTimeCredentials.jsx`.

