# Teachers, classes (الأقسام) and configurable plans

> **Status (2026-11-22).** Covers the teacher role, classes, per-class visibility, progress views, plans, seats and
> activation codes. Imported from the Algerian platform (DZ dev 7f4cef1c) on 2026-11-22. True here: the whole
> mechanism (API and web), on an EMPTY catalogue. Not true here: the interface is still Arabic and right to left
> (steps 1C–1E); the commercial model of §5 is Algeria's (no online payment, prices in DZD) — France's (Stripe, euros)
> is plan §4 step 1F and §7 n° 5, not yet applied in the code. The module-lesson gates of §8b are deleted.

> The authoritative document for: the `teacher` role, teacher-created classes
> and their membership, per-class lesson visibility, class and student
> progress views, the DZ commercial model (no online payment, **teacher plans
> sold by student seats, classes unlimited**), DB-driven plans / versions /
> pricing tiers / entitlements, subscription requests, manual subscription
> activation, activation-code batches bound to a plan and a seat capacity,
> and the admin control surface for all of it.
> Scope: `apps/api/app/Domain/{Classroom,Plans,Progress}`, `app/Policies`,
> `app/Http/Controllers/{Teacher,Admin}`, `apps/web/src/{pages,features,
> services}/teacher`, `pages/student/Qism.jsx`, `pages/admin/{teachers,
> classrooms,plans,requests}`.
> Where this document and an older one disagree, this one wins; the others
> link here.

## 0. Vocabulary

| Arabic (UI) | Means | Code / DB | Never means |
|---|---|---|---|
| **الأستاذ** | a teacher account (`role = teacher`) | `User::ROLE_TEACHER` | an admin |
| **القسم / الأقسام** (« قسمي », « أقسامي ») | a teacher's class: a roster of students of one grade | `classrooms`, `Classroom`, frontend identifier `classGroup` | the presentation mode |
| **وضع القسم** | Classroom Mode, the projector presentation shell | `lessons/common/classroom/` — see `CLASSROOM_MODE.md` | a class roster |
| **رمز الانضمام** | the join code a teacher gives orally / on the board | `classrooms.join_code` | an activation code |
| **رابط الانضمام** | the class's join link `/rejoindre/classe/{token}` — the recommended way in | `classrooms.join_link_token` | an activation code, an invitation |
| ~~الدعوة~~ | the e-mail invitation — **removed 2026-10-01**; its table is kept read-only for history | `classroom_invitations` (no code reads or writes it) | — |
| **العرض / العروض** | a plan (offer) | `plans` | a "presentation" (« عرض » in Classroom Mode is a different word in a different place) |
| **الاشتراك** | a subscription: the fact that a paid plan is running on an account | `subscriptions` | account status |
| **رمز التفعيل** | an activation code (paid access, cash-sold) | `activation_codes` | a join code |

`القسم` is the teacher's class. It is never `الصف`, never `الفصل`, and never
« classroom » transliterated. Server-side the model is `Classroom` because
`App\Domain\Classroom` has no collision with the presentation layer, which is
frontend-only.

## 1. Who exists

```text
role        registers via                       lands on         gate
admin       seeded / promoted only              /admin           can:admin
teacher     /register?type=enseignant, Google   /enseignant      can:teacher
student     /register, Google                   /espace          (default)
parent      not self-registerable (2026-10-23)  /wali            can:parent
school_admin created by the platform admin       /idara           can:school   (the school director, 2026-10-26 — SCHOOL_ADMIN_SPACE.md)
```

- **Ambassador (« سفير », 2026-10-05)** is not a role: it is a flag
  (`users.is_ambassador`) the administrator toggles on a **teacher**
  (`PATCH /admin/teachers/{id}/ambassador`). An ambassador is a *reviewer*
  like the admin (`User::canReviewAllContent()`): they see every
  **published** and **hidden** lesson, module and exercise, with a state
  badge on the hidden ones — but **not** `draft` or `archived`, which only the
  admin sees (2026-10-07, `ContentAccess::visibleStatuses`). Only reviewers
  can report problems. Classes, plan and account status
  are untouched. Contract: `ADMIN_PANEL_ARCHITECTURE.md` Annexe A8.

- **Parent (« وليّ الأمر », 2026-10-22)** is a role kept for later. Since
  2026-10-23 a parent needs no account: they read through « رابط الوليّ », a
  private link, which may come from a teacher's « بطاقات الأولياء » (QR).
  Contract: `PARENT_SPACE.md`.
- `users.role` stays a free string. `User::SELF_REGISTERABLE_ROLES` is
  `['student', 'teacher']`; `POST /auth/register` accepts an optional
  `accountType` from that list and **ignores any `role` field**. Nothing else
  self-registers.
- **Google** works for both self-registerable roles. The account type travels
  in the OAuth `state` (`type:teacher`), survives the callback into the
  pending-signup handoff (`PendingGoogleSignup::issue($identity, $role)`), and
  `POST /auth/google/complete` accepts `accountType` for the consent step. The
  role is whitelisted at each hop; a tampered value falls back to `student`.
- **« الاسم و اللقب » for every account (2026-09-29).** The register form
  and the Google consent step both collect first name + family name
  in Arabic letters only today (`PersonName` rule — Latin names are step 1E, not yet applied in the code); a teacher or student
  account without one is sent to a name step before its space
  (`/enseignant/bienvenue`, `/espace/bienvenue/nom`), and both edit it from
  their profile (`PATCH /auth/profile`). This is what makes the identity
  below readable: a teacher lists students by name, never by email.
- Teachers verify their e-mail exactly like students (`email.verified`
  middleware on every teacher route).
- **Account status ≠ subscription status.** `users.account_status`
  (`active|suspended|disabled`, `account.active` middleware) says whether the
  person may log in. A subscription says which plan runs. Suspending an
  account never touches its subscription and vice versa. `pending`/`rejected`
  account approval is **Planned**, not built: today a verified teacher is
  active immediately.
- Three authorization layers, in this order, on every teacher request:

```text
role         Gate 'teacher'                  route group can:teacher → 403 for admin and student
ownership    ClassroomPolicy (view/update)   teacher_id === user.id → 403 (never 404-leak of another's class)
entitlement  PlanEntitlementResolver         limits and features of the effective plan → 422 reason
```

Members, lessons and progress are always resolved **through the
owner** (`$classroom->memberships()`), never from an id in the request body.
`TeacherAuthorizationTest` sweeps every `/api/v1/teacher` route as guest,
student and admin.

## 2. Classes (الأقسام)

### Tables

| Table | Key columns | Rules |
|---|---|---|
| `classrooms` | `teacher_id`, `name`, `grade` (same code as `users.grade`, e.g. `3e`), `academic_year`, `status` `active\|archived\|suspended`, `join_code` (unique), **`join_link_token`** (unique, 32 base62, born with the class), `join_code_enabled` (**« الانضمام مفتوح » — closes the link AND the code**; historical name), `archived_at` | grade must be allowed by `content.allowed_grades` and exist in `grades`; **classes are not a commercial unit** — a teacher creates as many as they want unless the technical limit `classrooms.max` is configured (null = unlimited) |
| `classroom_memberships` | `classroom_id`, `student_id`, `status` `active\|left\|removed`, `joined_via` `join_link\|join_code\|school_enrolment` (`invitation` on historical rows only), `school_consent_at`/`school_consent_by` (`SCHOOL_ADMIN_SPACE.md` §4), `invitation_id` (historical), `removed_by`, **`consented_at`, `consent_version`** | **unique `(classroom_id, student_id)`**: rejoining reactivates the row; only `role = student`; class must be `active`; **one class per student** (owner, 2026-10-24): no join while the student has an active membership in another *active* class (`already_in_class`); **joining requires the explicit consent** (see « Consent and what the teacher may read ») |
| `classroom_invitations` | **historical, read-only** (e-mail invitations, removed 2026-10-01) | kept because old memberships point to it (`invitation_id`); the migration `2026_10_01_000002` revoked the rows still pending; no model, route or service remains |
| `users.pending_class_join_token` / `pending_class_join_at` | a join the student consented to on the link page **before having an account** | written at registration (`PendingClassJoin::remember`), consumed when the e-mail is verified (`complete`); hidden from every serialization |
| `classroom_lessons` | `classroom_id`, `lesson_id`, `status` `visible\|hidden`, `created_by`, `updated_by` | **absence of a row = visible**; unique `(classroom_id, lesson_id)` |
| `teacher_lab_settings` | `user_id`, `lesson_id`, `checkpoints_off` (json) | 2026-10-28, for the in-lab questions of the legacy lab system — that system is deleted; the table, its model and `TeacherLabSettingsController` remain in the API and no web code calls them (2026-11-22) |

### Services (`app/Domain/Classroom/`)

| Service | Responsibility |
|---|---|
| `ClassroomService` | create (limit + allowed grade), update, archive, restore (re-checks the limit), suspend, rotate join code, list, show |
| `JoinCode` | 6 characters, same unambiguous alphabet as activation codes, unique in the table |
| `ClassroomMembershipService` | `joinByCode`, **`joinByLink`** (idempotent: an active member gets `alreadyMember: true`, no consent asked, even if joining was closed since), `classroomForLink`, `remove`, `leave`, `confirmConsent`; **both doors end in the same `join()`**; **`currentClassroomOf($student, except)`** = the active class the student is already an active member of (the one-class rule and the link preview both read it); every join takes `consented: true` or fails with `consent_required`; capacity checked **at join, under `DB::transaction` with `lockForUpdate` on the class AND on the teacher row** (so two joins into two different classes of one teacher serialise): the technical per-class limit, then the seat capacity through `TeacherCapacityService` |
| `TeacherCapacityService` | the **seat capacity**: `seatLimit` (`students_total.max` resolved from the plan / purchased seats / override), `currentStudentCount` (**distinct** active students across the teacher's non-archived classes — a student in two classes, possible only for memberships from before the one-class rule of 2026-10-24, is one seat), `remainingSeats`, `isSeated`, `canAddStudent` (an already-seated student never consumes a second seat), `assertCanSeat` → `seats_exhausted`, `summary` |
| `JoinLinkToken` | 32 base62 symbols from `random_int` (CSPRNG, ≈190 bits), derived from nothing (not the id, teacher, code); unique; **stored in clear** like `join_code`, because the teacher must re-read it on the class page and it is semi-public by nature (shared on WhatsApp). Protected by its length, the rate limit, `join_code_enabled` and rotation |
| `PendingClassJoin` | the join that waits for the verified address: `remember` at registration (valid link of an open class + consent + student, otherwise silently ignored — registration never fails on a stale link; since 2026-10-22 it also gives the student the class's grade when they have none), `complete` in `EmailVerificationController::verify` (re-validates the token; any refusal just clears the wait) |
| `ClassroomLessonService` | the class's curriculum tree (ميادين → وحدات → دروس) with `publicationStatus`, `tier`, `classStatus`, `effectiveForStudents`; `setStatus`; `bulkSetStatus` (a unit = its lessons repeated) → `{applied, unchanged, failed}` in the `ContentService::bulk()` shape |
| `ClassroomProgressService` | **singleton** (per-request memo of the effective lessons, flushed on `RequestHandled` and on every visibility change); per-student rows (`studentList`) + `rosterFor` (statistics only with `progress.class`), from existing progress data only |
| `ClassroomAccess` | **the one teacher → student gate and the one teacher-facing identity** — see « Consent and what the teacher may read » |
| `ClassroomLearningPointService` | the learning map (whole scope or one lesson), one LP × students with trajectory / items / prerequisites, one LP × one student (evidence) — § 4 |
| `ClassroomInsightService` + `Insights/*` | DETECT: attention signals, recent changes, the student snapshot — § 4a |
| `ClassroomInterventionService` | INTERVENE and MEASURE — § 4b |
| `StudyContextService` | singleton, per-request memo: `{mode, classrooms[], primary, hiddenLessonCodes}` for a student |
| `StudentCredentials` | « بطاقات الدخول » (2026-10-22): `issue(teacher, classroom, studentIds)` — active class, active members only (one outsider refuses all), a NEW password per student (`generate()`: 4 unambiguous letters + 4 digits, e.g. `kmar4827`), stored hashed, returned ONCE with the email; logs `teacher.student_credentials_issued` (ids only) |
| `ClassroomException` | closed reasons: `limit_reached`, `grade_not_allowed`, `feature_unavailable`, `class_inactive`, `class_full`, `seats_exhausted`, `already_member`, **`already_in_class`** (the student is an active member of another active class — one class per student, 2026-10-24), `not_a_student`, `invalid`, **`joining_closed`** (link only: a valid link of a class that no longer accepts new members; the CODE answers `invalid` there, since six symbols can be guessed and a distinct reason would reveal which exist), `expired`, `revoked`, `not_member`, `lesson_out_of_scope`, `consent_required` → 422 `{reason}`; the client renders Arabic from the reason, never the French message |

Rate limiter `classroom-join` (per user and per IP, registered beside
`activation-redeem`) guards `POST /student/classrooms/join` (code and link);
the public preview `GET /join-links/{token}` is `throttle:30,1`.

### The two doors: join link and join code (2026-10-01)

```text
join link  /rejoindre/classe/{token} ─┐  (recommended: one tap from WhatsApp)
                                      ├──> ClassroomMembershipService::join()  (consent, capacity, unique row)
join code  6 symbols in «قسمي» ───────┘  (manual fallback: written on the board)
```

- **A student who joins without a grade takes the class's grade**
  (`join()`, only when `users.grade` is null): a brand-new account arriving
  by the link lands in its class instead of the grade picker. Since
  2026-10-22 (owner) the grade is written **at registration** already
  (`PendingClassJoin::remember`, e-mail sign-up), and `ChooseGrade` sends a
  student with a consented pending join back to the link page instead of
  asking (Google sign-up) — `ARCHITECTURE.md` §10.
- **One class per student** (owner, 2026-10-24). `join()` refuses
  `already_in_class` when the student is an active member of another
  **active** class — any teacher, by the code or by the link. The check runs
  inside the join transaction **after locking the student row**, so two tabs
  joining two classes cannot both pass. Order: same class first (the link
  stays idempotent: `alreadyMember: true`), then the other class, then the
  capacity. A membership in an archived or suspended class does not count
  (the student no longer sees it in « قسمي » and could not leave it).
  To change class the student **leaves first**: leaving frees their seat, so
  moving between two classes of one teacher at exact capacity still works;
  a teacher already *over* limit (downgrade) blocks the move like any new
  seat. Rows from before the rule (a student in two classes) are kept, not
  migrated. The link preview gives a logged-in student
  `currentClassroomName` (their own class, never another student's), and the
  link page shows « أنت في قسم آخر » with a link to « قسمي » instead of the
  consent button; a pending join is dropped, never auto-played.
  Locked by `ClassroomOneClassTest`.
- **Closing** (`joinCodeEnabled: false`, « السماح بالانضمام » in الإعدادات)
  refuses new students by both doors; members stay, and a member reopening
  the link is still sent to the class. **Rotating the link**
  (`POST …/join-link/rotate`) kills the old link at once (`invalid`) and does
  *not* reopen closed joining (rotating the code still does, as before).
- The e-mail invitation was removed on 2026-10-01: routes, controller,
  service, token, notification, entitlement key `invitations.active.max`
  (stored rows of that key are inert — the resolver skips unknown keys), the
  teacher panel and the « الدعوات المعلّقة » meter. The old address
  `/rejoindre/:token` renders the « رابط غير صالح » page.

### Capacity is counted in students, never in classes

```text
commercial dimension      how many DISTINCT students may this teacher cover?     students_total.max (seats)
organisational dimension  how many classes did the teacher create?               unlimited (classrooms.max is technical, null)
educational dimension     which lessons are visible, who is in which class, what progress
access dimension          which subscription / entitlement opens paid content
```

The link goes through the same door as the code: opening it costs nothing,
**joining** by it is counted against the seats (`TeacherCapacityTest`). A downgrade puts the teacher in
an over-limit state that blocks new seats only.

### Leaving and removal never delete anything

A student who leaves or is removed keeps every progress row, attempt, mastery
value and note. Only the membership row changes status. Archiving a class
keeps its memberships and visibility rows. `ClassroomProgressTest` locks this.

What leaving DOES change is what the teacher may read — next section.

### Consent and what the teacher may read (2026-09-25)

**The product rule.** A student who joins a قسم agrees that its teacher reads
their learning *in the class's effective lessons*: progress, mastery per
learning point, answers to exercises and final tests, the notebook notes taken
in those lessons (not archived ones), and that the teacher may record
interventions about them and suggest a lesson or practice. **The student's
email is never shared.** Leaving the class ends the teacher's per-student
reading.

Since 2026-10-06, the teacher also reads the PHOTOS of handwritten work that
students attach to exam steps (every lesson whose practice is in exam format —
`content/practice/exam-style.json`; no lesson today), and may correct
and annotate them in « تصحيح الإجابات ». These are photos of minors:
- private disk, metadata stripped, kept 12 months;
- served only to the student and to a teacher of their ACTIVE class;
- leaving the class ends the teacher's access (404).

The contract is in `EXERCISE_CONTRACT.md` § « Image answers and teacher
validation ».

**Consent is a gesture, dated and versioned.**

- `POST /student/classrooms/join` requires `consent: true`, otherwise 422
  `consent_required` and nothing is created. The student-side button «أوافق
  وأنضمّ» sits under the disclosure text (`student.json` → `qism.sharing.*`,
  one component `components/student/SharingDisclosure.jsx` for the code form,
  the join-link page and the re-confirmation card).
- **A join link never joins by being opened.** `/rejoindre/classe/:token`
  shows the class, the teacher and the same disclosure *before* any button.
  The consent gesture is the button itself: « أوافق وأنضمّ » for a signed-in
  student, « أوافق، أنشئ حسابي وأنضمّ » / « أوافق، سجّل دخولي وأنضمّ » for a
  visitor. The visitor's gesture is kept (`features/classJoin/pendingClassJoin.js`,
  localStorage, 7 days, token-shaped only) and — for a registration — sent
  to the server (`classJoinLink`, `classJoinConsent`), so the join completes
  **automatically** after login, Google, or e-mail verification, even when
  the verification mail is opened in another browser. The page's only
  automatic join is `autoJoinRequest(pending, token)`: it exists only if the
  gesture was made *for this link* (`pages/JoinClassLink.test.jsx` guards
  it). (Until 2026-09-25 a logged-in student joined on opening an invitation
  link.)
- `consented_at` + `consent_version` (`config('classroom.consent_version')`)
  are stored on the membership (current version `2026-10-28`: the text now also
  announces that a later attachment of the class to a school brings the student
  in automatically — `SCHOOL_ADMIN_SPACE.md` §4). Changing the disclosure text means bumping the
  version: `studyContext.classrooms[].consentRequired` becomes true and «قسمي»
  asks once (`POST /student/classrooms/{id}/consent`, or leave). Memberships
  older than the text have `consented_at = null` and are asked the same way.
  The request is **non-blocking**: the teacher's reading of an existing member
  is not suspended while the student has not answered (decision recorded in
  `reports/TEACHER_PEDAGOGICAL_MONITORING_PLAN_2026-09-24.md`, D-2 variant).

**The gate — `Domain\Classroom\ClassroomAccess`.** Every per-student teacher
read goes through `ClassroomAccess::activeStudent($classroom, $studentId)`:
an **active** membership in an **active** class, otherwise **404** (not 403:
the teacher does not learn that the student was a member). This covers the
dossier, the notebook (list and single note), the LP evidence, and the
targets of an intervention (`activeStudentIds`, all-or-nothing). Aggregates
(roster, map, signals) count active members only. A student who left, was
removed, or whose class is archived is therefore no longer readable one by one
— which is what the leave dialog promises. (Until 2026-09-25 the per-student
endpoints accepted a membership in any status.)

**The identity — `ClassroomAccess::identity()`**: `{id, firstName,
lastName}`, loaded with `IDENTITY_COLUMNS` — never `email`. It is the only
place a teacher-facing student shape is built; the frontend falls back on the
Arabic placeholder «تلميذ بدون اسم» (`common.unnamedStudent`), never on an
email. Since 2026-09-29 that placeholder is transitional: every student is
asked for « الاسم و اللقب » at signup or, for older accounts, at their next
visit (see §1 « Who exists »). The admin detail of a class adds the email itself
(`ClassroomAdminService::withEmails`) — the admin surface may show it.

**The one exception — « بطاقات الدخول » (owner, 2026-10-22).** A teacher may print
login cards for the students of their class: « التلاميذ » → « طباعة بيانات الدخول »
(`features/teacher/members/CredentialsDialog.jsx`) → choose students →
`POST /teacher/classrooms/{id}/students/credentials {studentIds}` (`manage`,
throttle 10/min, `Cache-Control: no-store`). A password is hashed and cannot be
read back, so the teacher never sees the one the student chose: the server
**issues a new one** (it replaces the old one; open sessions are kept) and the
response — the only place it exists in clear — carries `{id, firstName,
lastName, email, password}`. The cards are printed from a portal
`[data-credentials-print]` (`credentials.css` hides the rest of the page) and
vanish when the dialog closes. The email is therefore shown in this gesture's
response only; no `/teacher` READ returns it (`TeacherPrivacyContractTest` is
unchanged), and `pages/teacherContract.test.js` allows `.email` in
`CredentialsDialog.jsx` alone. Locked by `TeacherStudentCredentialsTest`. The
public join-link preview returns the class name, grade, teacher name,
`schoolName` (the NAME of the class's school, or null — 2026-10-26),
`joiningOpen`, and — for a logged-in student only — `alreadyMember` and
`currentClassroomName` (the viewer's OWN current class) — never an id, an
address or the roster.

**Classes of a school (2026-10-26).** A class may carry `classrooms.school_id`:
the school's director becomes a SECOND reader (never a second owner — this
section's gate and `ClassroomPolicy` are unchanged). The school reads a student
only with `classroom_memberships.school_consent_at`, given by the link gesture
(the disclosure names the school), by « قسمي » afterwards (`POST
/student/classrooms/{id}/school-consent`), or by the director's enrolment
(`joined_via = school_enrolment`, `ClassroomMembershipService::enrolBySchool` —
same one-class rule and capacity as `join()`, which both go through `admit()`).
The code join records no school consent. Contract: `SCHOOL_ADMIN_SPACE.md` §4.

**« بطاقات الأولياء » (owner, 2026-10-23).** « التلاميذ » → « بطاقات الأولياء (QR) »
(`features/teacher/members/ParentCardsDialog.jsx`) →
`POST /teacher/classrooms/{id}/students/parent-cards {studentIds}`.

- It follows the same rules as the login cards: `manage`, active members only,
  throttle 10/min, `no-store`, audit `teacher.parent_cards_issued`.
- It returns each student's « رابط الوليّ » (`{id, firstName, lastName, url}`,
  never an email), printed as a QR for the guardian.
- An existing link is REUSED, never replaced.
- The student sees the link in their profile and can revoke it.

Contract: `PARENT_SPACE.md` §2bis. Locked by `ParentAccessLinkTest`.

**Scope.** Teacher reads stay bounded to the class's effective lessons
(published, not hidden, of the class grade). History before joining in those
lessons is visible (D-3); archived notebook notes are not
(`NotebookService::searchForReader`/`countsForReader`/`findForReader`).
`lastActivityAt` shown to a teacher is the last learning activity **inside
that scope** (`ClassroomFacts::lastActivity`: latest evidence or lesson
progress on an effective lesson), not `users.last_activity_at`.

**Audit.** A teacher's reading of a student's notebook writes
`admin_activity_logs` `teacher.notebook_read` (one line per teacher, student
and day). Interventions write `classroom_intervention.created/updated`; a
consent confirmation writes `classroom_member.consented`.

`TeacherPrivacyContractTest` locks all of this: it walks every `/teacher` read
of a seeded class and fails on any `email` key or student address at any
depth, re-reads every per-student route after leave / removal / archive (404),
tries every route as another teacher and as a student, and checks archived
notes and the join-link preview. `ClassroomConsentTest` locks consent;
`pages/teacherContract.test.js` fails if a teacher screen reads `.email` of a
student.

## 3. Per-class lesson visibility — the third access axis

`ContentAccess` is still the **only** place that composes access. It now
composes three independent axes:

```text
publication   lessons.publication_status      published opens for all; hidden also for (admin)
                                              ambassadors; draft/archived admin only
tier          lessons.tier + entitlements      free / premium                          (admin + commercial)
class         classroom_lessons                visible / hidden for THIS student       (teacher)
```

Rules, locked by `ClassroomLessonVisibilityTest`:

- A hidden lesson is refused on **every** entry point that already checks
  publication — lesson access, module access, practice overview, progress
  upsert — with the same 422 `{success: false, message}` shape those entry
  points already use for unpublished content. The *why* reaches the client
  through `GET /content/availability`: `closed.hiddenByClass` lists the
  hidden lesson codes, and the UI reads it before rendering a card.
  `ContentAccess::HIDDEN_BY_TEACHER` (`hidden_by_teacher`) names the reason
  for any future entry point that returns reason codes. The frontend never
  decides.
- Visibility applies to the class's grade. Lessons of other grades keep the
  normal rules.
- A student in several active classes of that grade (only rows from before the
  one-class rule of 2026-10-24) sees a lesson if **any** of them shows it
  (hidden = hidden in all).
- A teacher can only hide what is published: showing a lesson never opens
  unpublished content, and hiding never changes `lessons.publication_status`.
  Publication (global) and visibility (per class) are two columns in two
  tables written by two roles.
- `GET /content/availability` gains `closed.hiddenByClass` beside `premium`
  and `locked`; the student UI renders « أخفاه الأستاذ » through
  `ContentAvailabilityContext.isLessonHiddenByClass(code)`, exactly where it
  renders a closed lesson.

## 4. Progress views — derived, never duplicated

`ClassroomProgressService` and `Domain\Progress\StudentDossier` (extracted
from `Admin\StudentService`, used by the admin *and* the teacher) read:

```text
student_lesson_progress             completion per lesson
student_learning_point_progress     mastery per learning point (the canonical state)
learning_point_state_transitions    how that state moved (history, § 4c)
learning_evidence (+ pivot)         every judged answer, append-only
question_attempts ⋈ exercise_attempts ⋈ practice_sessions   practice evidence
```

scoped to the class's grade, to the lessons **effective** for that class and
to its **active** members (§ 2 « Consent and what the teacher may read »).
There is no teacher-side progress table, and no second mastery: a teacher
reads the same status the student and the admin read (`PROGRESS_MODEL.md`,
`LEARNING_ARCHITECTURE.md`). A student's « last activity » in the roster is
computed on activity **inside the class's scope** (its effective lessons), not
on `users.last_activity_at`.

There is **no class-average view**. The former « التقدّم » tab and the
`/enseignant/progression` page (class averages + one bar per student, backed
by `GET /teacher/classrooms/{id}/progress` and `classSummary()`) were removed
on 2026-09-29: an average hides the group in difficulty, and the per-student
bars already live in « التلاميذ ». Class-level reading is the learning map
below and « نظرة عامة ».

The teacher's space is organised around one loop — **DETECT → UNDERSTAND →
INTERVENE → MEASURE** — and three entry points onto the SAME data: the class
(« نظرة عامة »), the learning point (« الكفاءات ») and the student (the
dossier). None of them computes a status of its own.

### Class × Learning Point — the learning map (Mastery V2)

`Domain\Classroom\ClassroomLearningPointService` answers « what do the
students of this قسم know about each Learning Point? » with ONE `GROUP BY`
over `student_learning_point_progress` joined to the active memberships —
never a replay of evidence, never a copy:

- **the map** (`map()`): without `?lesson=` every non-retired LP of the
  effective lessons, grouped by lesson (`{students, lessons[{code, title,
  learningPoints[]}]}`); with `?lesson=` one lesson (`{lesson, students,
  learningPoints[]}`, the historic shape; a lesson out of scope → 422). For
  each LP `counts {mastered, reinforce, gap, unassessed}` (unassessed =
  members without a row), `reasons {insufficientEvidence, needsAssessment}`,
  `staleMastered`, and **`difficultyScope`** — `none | isolated | small_group
  | class_wide` (`Insights\LearningTrend::difficultyScope`): how many students
  are in ثغرة among the ASSESSED ones. A class shows a **distribution, never an
  average**: a class « at 70 % » can hide five students in ثغرة, the counts
  show them;
- **one LP** (`learningPointDetail()`): every active member with `status`,
  `statusReason`, `confidence`, counters, `freshness` and **`recentDirection`**
  (the movement over the window, `LearningTrend::direction`), sorted gap →
  reinforce → unassessed → mastered, then by confidence; plus
  - `trajectory`: for each of the last 8 weeks (weeks ending Saturday — the Algerian week, not yet changed in the code,
    `Insights\InsightWindow::weekEnds`), how many members were in
    each status — read from the history (§ 4c); a member whose state
    predates the recorded history is counted `unknown`, never guessed;
  - `items`: the assessment items of this LP the members answered, the most
    failed first (`title`, `source` practice / final_test, `failures`,
    `studentsFailing`) — the evidence behind « the class struggles here »;
  - `prerequisites`: the LP's prerequisites (`learning_point_prerequisites`)
    and how many members are in ثغرة on each;
- **one LP × one student** (`studentEvidence()`, route `…/explanation`):
  `explanation` (the same `MasteryExplainer` text the student sees),
  `history` (the student's state transitions on that LP), `notebook` (the
  student's notes on that LP, teacher scope, non-archived, the 10 most
  recent), and `interventions` (this teacher's gestures on that student and
  LP). Active member only (404 otherwise).

Cost: constant in queries whatever the class size (`ClassroomInsightScaleTest`:
the same query count for 5 and 40 students on the map, the attention, one LP,
the dossier and the interventions) and whatever the bank size
(`MasteryScaleTest`).

**The notebook in these views.** The roster and the student dossier
carry no note (`ClassroomProgressTest`). The student × LP evidence DOES show
the student's own notes on that LP — they are evidence the teacher reads,
never counted, never aggregated across the class, never mixed into mastery
(`NOTEBOOK.md` owns the rule). The full notebook keeps its own read-only
surface:

```
GET /teacher/classrooms/{id}/students/{studentId}/notebook[/{noteId}]
```

read-only, scoped to the class's **effective** lessons, behind `can:teacher` +
`ClassroomPolicy@view` + `ClassroomAccess::activeStudent`, archived notes
excluded, paginated. `TeacherClassroomNotebookTest` and
`TeacherPrivacyContractTest` lock it.

Feature keys `progress.class` and `progress.student` gate the views: the map,
the overview and the attention need `progress.class`; one LP, the dossier,
the evidence and the interventions need `progress.student`. The roster
(`/students`) is always readable but carries statistics only with
`progress.class`. `analytics.advanced` and `reports.export` are declared in
the registry and have **no consumer screen yet** (`Planned`).

### 4a. DETECT and UNDERSTAND — « تستحقّ نظرة » (2026-09-25)

`Domain\Classroom\ClassroomInsightService` loads the class's facts ONCE
(`Insights\ClassroomFacts`, ≈ 8 grouped queries) and applies pure functions
to them. Three layers stay apart, in code and on screen:

```text
raw facts        Insights\ClassroomFacts   canonical states, the window's evidence per (student, LP)
                                           (OutcomeStats definition), the window's transitions,
                                           scoped last activity, prerequisites
indicators       Insights\LearningTrend    direction (improved / declined / unchanged /
                                           first_assessed), difficulty scope
interpretation   Insights\AttentionSignals the signals, each with its indicator and its evidence
```

« Recently » is a window of `teacher_insights.window_days` (14) full days in
`classroom.timezone` (Africa/Algiers), `Insights\InsightWindow`. A movement is
read from the state at the START of the window (the `status_before` of its
first transition) to the state NOW — three round trips that end where they
started are not progress. A window that contains a recalculation (engine
version change) is not interpreted.

**The signals** (`config/teacher_insights.php`, `rule_version` carried by
every response):

| Type | Rule | Why this threshold |
|---|---|---|
| `class_difficulty` | ≥ `class_difficulty_min_students` (2) active members in ثغرة on one LP; `class_wide` when ≥ `class_wide_share` (50 %) of the ASSESSED ones and ≥ 3 assessed | one student is an isolated case (dossier), two share a difficulty |
| `repeated_difficulty` | in ثغرة AND ≥ `repeated_difficulty_min_failures` (3) wrong answers on that LP in the window | one wrong answer can already produce ثغرة (V2 arithmetic); repetition is what makes it a signal |
| `declined` | status at window start → now went DOWN (mastered/reinforce → lower) | the engine's own order, no number |
| `stalled` | ≥ `stalled_min_attempts` (5) answers on the LP in the window, still gap/reinforce, no upward movement | effort without progress |
| `no_recent_activity` | ENGAGEMENT, not learning: no learning activity in the class's scope for `inactive_days` (14) — shown apart, with the reminder that work may happen on paper | inactivity is never read as failure |

Rules for every signal: it names WHO (teacher identity), WHAT (type), WHY
(`indicator` numbers), the EVIDENCE (per student: status, status at window
start, the window's answered / failures / successes / items, last evidence),
the LP and its lesson, WHEN (`lastEvidenceAt`), a lead (`prerequisites` in
ثغرة among the same students) and the gestures that fit (`actions`). **No
duplicate**: a student counted in a `class_difficulty` signal gets no
per-student signal on that LP; per (student, LP) at most one of repeated
difficulty > declined > stalled. **Never a difficulty**: `unassessed`,
`insufficient_evidence`, `needs_assessment` (not knowing is not struggling),
the notebook (a reflective student would look weak), time spent (not
collected, D10), any class average. Signals are **never stored**, never
notified: they exist while the facts do and disappear with them. The order
groups (shared difficulties first, most students first); students inside a
signal are ordered by status then name — never ranked by a score.

`recentChanges` (`Insights\RecentChanges`): improved / declined / first
assessed / recalculated over the window, the LPs that moved most, the students
who improved and declined.

**The student snapshot** (« لمحة », `Insights\StudentSnapshot`, in the dossier
response as `snapshot`, with `signals` = the class signals filtered to this
student): LP counts by status; strengths (mastered, with freshness);
difficulties (gap, or reinforce by threshold — never insufficient evidence);
the window's changes and a `trend` read on status movements (`improving`,
`declining`, `mixed`, `started`, `stable`, `no_recent_evidence`); ACTIVITY kept
apart (last activity in scope, answers and success rate in the window, the LP
last worked on) with the reminder that activity is not learning.

`GET /teacher/classrooms/{id}/attention` → `{ruleVersion, window, signals[],
summary, recentChanges}`. `AttentionSignalsTest` (pure, per rule and its
negative case), `ClassroomLearningLoopTest` (end to end on real evidence) lock
it.

### 4b. INTERVENE and MEASURE — « التدخّلات » (2026-09-25)

`classroom_interventions` + `classroom_intervention_students`,
`Domain\Classroom\ClassroomInterventionService`. An intervention belongs to
the teacher and the class: `kind`, optional `learning_point_id` / `lesson_id`,
the students (active members, all-or-nothing), a **private** `note`, an
optional `student_message`, `status` open / closed, `review_after`,
`source_signal`.

| Kind | Needs an LP | The student sees it |
|---|---|---|
| `individual_followup`, `observation` | no | no |
| `class_reinforcement` | yes | no |
| `recommend_practice`, `review_prerequisite` | yes | yes — a suggestion in «قسمي» |
| `recommend_lesson` | an LP or a lesson | yes |

A student-visible intervention appears in «قسمي» → «اقتراحات أستاذك»
(`GET /student/teacher-recommendations`) while it is open and the student an
active member: teacher name, class, the LP / lesson, the `student_message`.
Never the note, never a lock, never a deadline (D8). The student's notebook is
never touched: an intervention is teacher data.

**MEASURE.** On creation the service FREEZES each targeted student's canonical
state on the LP (`baseline`: status, reason, confidence, counters). The
outcome is computed on read, in constant queries per page: for each still-active
student, `before` (the baseline), `now`, the evidence `since` opened_at
(answered / successes / partials / failures, OutcomeStats), the `direction`
(LearningTrend), `observed` (new evidence or not), and in detail the `trail` of
transitions since. The summary counts improved / declined / unchanged / first
assessed / no new evidence. The wording is **descriptive, never causal**
(«وقائع مُلاحَظة منذ التدخّل، وليست دليلًا على أنّه السبب»); a student without
new evidence is « no new evidence », never « no progress ». A student who
left drops out of the measure.

Routes: `GET|POST /teacher/classrooms/{id}/interventions` (filters status,
studentId, learningPointCode; paginated), `GET|PATCH …/{interventionId}`
(status, note, review date — the targets, the LP and the baseline never
change). Resolved by class AND teacher (404 otherwise); writing needs the
`manage` ability. `ClassroomLearningLoopTest` locks the loop,
`TeacherPrivacyContractTest` the access.

### 4c. History — how a state moved

`learning_point_state_transitions` (`LEARNING_ARCHITECTURE.md` « State
history ») is written by `ProgressEngine::advance` inside the evidence
transaction: one line per real change of a (student, LP) state, with the
state before and after, the engine version and the evidence date. It feeds the
trajectory, the student's history on an LP, `declined` / `stalled`, the
recent changes and the intervention trail. The teacher views never replay
evidence on read.

## 5. The DZ commercial model — no online payment, for anyone

> **Algerian by nature, and what the code does today.** France sells with Stripe (`Domain/Billing`, in the tree and
> unused): plan §4 step 1F, §7 n° 5. Until then this section describes the code.

```text
FREE                register → verify e-mail → the type's DEFAULT plan is effective at once
                    (plans.is_default, no subscription row, no approval)
                    teacher: N student seats (students_total.max of the default plan, initially 5), unlimited classes

INDIVIDUAL PAID     teacher picks HOW MANY STUDENTS to cover → the pricing tier of the current version gives
                    the price per student → total = N × price (server-side, informational) →
                    (optional request, stores seats + calculated total) → money received OUTSIDE the platform →
                    the admin EITHER activates the plan on the account WITH that seat count
                      (subscription: student_seat_limit + unit price + total frozen, acquisition_source manual_admin_activation)
                    OR sends the user ONE unique activation code bound to the plan AND a seat count
                      (single-seat batch with student_seat_limit, e-mailed, shown once → redeem → subscription: activation_code)

BULK / SCHOOL       institution pays outside → admin picks plan + version + SEATS PER CODE + quantity X →
                    X unique codes → each user redeems one → one subscription each, with that capacity

NEVER               checkout, card, Stripe, provider, webhook, "pay now", price-to-pay wording
```

> **Teacher plans are seat-based.** The unit of sale is the distinct student
> the teacher covers, never the class. `Teacher Basic = 1 class` / `Pro = 5
> classes` no longer exist: one paid plan (`teacher-seats`) with a
> configurable, versioned grid of price-per-student tiers replaces them.

- Prices are **informational**: what the admin tells the customer to pay by
  cash or transfer. For a seat-based plan the price is **computed** by
  `TeacherPricingService` from the version's `plan_pricing_tiers`; `plan_prices`
  keeps only the activation length (`duration_days`) and a fixed amount for
  plans without a grid. The platform collects nothing. The inherited provider
  code (`Domain\Billing`, `/billing/*`) stays
  in the repository, dormant and reached by no DZ screen;
  `PaymentProviderBoundaryTest` and `pages/teacherContract.test.js` (no
  billing/checkout import under `features/teacher`, `pages/teacher`,
  `pages/student`, `pages/admin/{plans,requests,teachers}`) keep it that way.
- **Requests never activate anything.** `subscription_requests` (`pending →
  fulfilled | rejected | cancelled`) is a queue for the admin. One pending
  request per user; only public, active, non-default plans of the user's type
  with `plans.allows_requests = true`. A request becomes `fulfilled`
  automatically when a subscription for that plan appears on the account
  (direct activation or code). There is no `requires_approval` flag.
  For a seat-based plan the request carries `requested_student_seats` and the
  **server-calculated** `unit_price_cents` / `calculated_total_cents` /
  `currency`; any price sent by the client is ignored. Reasoned refusals
  (`SubscriptionRequestException`, 422 `{reason}`): `seats_required`,
  `seats_not_covered` (no tier covers the number), `covered_by_default` (the
  free allowance already covers it), `seats_below_usage` (fewer seats than
  students currently covered — nothing is deleted, so nothing fits),
  `already_pending`, `not_requestable`.
- The default plan cannot be requested, activated, or bound to a batch: it is
  already effective.

### Plans, versions, prices, entitlements

```text
plans                    slug, type student|teacher, status draft|active|hidden|archived,
                         is_public, is_default (one per type), allows_requests, display_order
plan_versions            plan_id, version n, status draft|current|superseded, published_at
plan_prices              per version: DZD amount_cents (fixed price, plans without a grid), billing_interval,
                         duration_days (length granted on activation), trial_days
plan_pricing_tiers       per version: min_students … max_students (NULL = open-ended), price_per_student_cents,
                         currency, sort_order, is_active         ← the SEAT GRID of a teacher plan
plan_entitlements        per version: key → json value           (unique version+key)
plan_entitlement_overrides   per USER: key → json value, reason, starts_at/ends_at, revoked_at
```

### The seat grid (`plan_pricing_tiers`) and its engine

`Domain\Plans\TeacherPricingService` is the **only** authority on a teacher
price:

```text
quote(version, N)         → the ACTIVE tier that covers N → unitPriceCents, totalCents = N × unit, currency, free (unit = 0)
applicableTier(version,N) → the tier or null (a number no tier covers is refused, 422)
validateTiers(rows)       → normalises camelCase rows and REFUSES: min < 1, max < min, negative price,
                            overlapping active tiers, gaps between active tiers, an open-ended tier followed by another
tiersFor(version)         → ordered by sort_order, then min_students
```

Initial grid (seed values, **not rules** — the admin edits them from the
panel, in DZD; the French price is plan §7 n° 5). Inactive tiers are kept but
ignored for coverage and continuity. The frontend mirrors the calculation for
the instant preview (`features/teacher/subscription/seatPricing.js`,
`features/admin/plans/pricingTiers.js`) and is **never trusted**: the request
and the activation recompute on the server from the version they reference.

A version is `seatBased` when it holds at least one active tier. Editing the
grid is only possible on a **draft** version (`PUT /admin/plan-versions/{id}/pricing`
or the `pricingTiers` field of `PATCH /admin/plan-versions/{id}`); publishing
makes it current. Existing subscriptions keep their version, their purchased
seats and their frozen price (`SeatPricingTest::test_les_prix_sont_versionnes…`).

- **A version referenced by ≥ 1 subscription is frozen** (`PlanVersion::isFrozen()`).
  Editing means `createVersion` (copies the current one) → edit the draft →
  `publishVersion` (draft → current, old current → superseded). Existing
  subscriptions keep their version; nobody's limits change behind their back.
- `EntitlementKeys` (`app/Domain/Plans/`) is the **closed registry**:

| Key | Type | Category | Meaning |
|---|---|---|---|
| `students_total.max` | limit | **capacity** | the commercial unit: distinct active students across the teacher's non-archived classes. Default 0 (a forgotten capacity closes). On a seat-based subscription the purchased `student_seat_limit` **replaces** the version's value |
| `classrooms.max` | limit | technical | non-archived classes; default **null = unlimited**. Never a pricing unit |
| `students_per_classroom.max` | limit | technical | active members per class; default null |
| `lessons.visibility` | feature | may hide / show lessons per class |
| `lessons.bulk_actions` | feature | bulk hide / show (unit-level) |
| `progress.class` | feature | class progress view |
| `progress.student` | feature | per-student progress view |
| `analytics.advanced` | feature | declared; no consumer yet (`Planned`) |
| `reports.export` | feature | declared; no consumer yet (`Planned`) |
| `students.covered` | feature | **Model B**: members of this teacher's classes get premium through the teacher |
| `content.allowed_grades` | list | grade codes a class may be created for |

  A limit is an integer, `null` = unlimited. An unknown key is refused (422)
  by the admin API; a key missing from a version falls back to the registry
  default: **most restrictive for the commercial capacity (0), unlimited for
  the technical limits**. Values live only in the DB and change without a
  deploy.

> **Math Lab, notebook and saved works are not plan keys.** They are gated
> per **tier** (free / premium) in « الوصول والحدود »
> ([`ACCESS_AND_LIMITS.md`](./ACCESS_AND_LIMITS.md)), and a teacher account
> is premium there explicitly (`teacher_role`) — whatever its plan. A
> plan key for them would have been a second, contradictory authority.

### Resolution precedence (`PlanEntitlementResolver`, singleton, per-request memo)

```text
1. the user's RUNNING subscription   status ∈ {active, trialing}, or cancelled with ends_at in the future,
                                     plan_version_id set, latest started_at            → that version
   + its PURCHASED SEATS              subscriptions.student_seat_limit, when set          → students_total.max
2. otherwise the type's DEFAULT plan  plans.is_default, its current version           → that version
3. then active OVERRIDES              plan_entitlement_overrides by user_id, within [starts_at, ends_at], not revoked
                                     (they apply on the default plan too)
```

`defaultValue(type, key)` reads the default plan alone (the free allowance),
whatever the account's subscription — used to refuse a request the free plan
already covers.

`summaryFor($user)` feeds the teacher's « عرضي » page and the admin's
*Droits* section: `{plan{…, seatBased, studentSeatLimit, seatUnitPriceCents,
seatTotalCents, seatCurrency}, request, classes{current,maximum,remaining,
canCreate,overLimit}, students{current,maximum,remaining,canAdd,overLimit},
features, allowedGrades}`. `explain($user)` says, per key,
whether the value comes from the plan, the subscription (purchased seats) or
which override. `GET /teacher/capacity` returns the seat summary alone.

### Subscriptions — one manual lifecycle for every role

`Plans\SubscriptionActivationService` is the **only write path** for DZ
subscriptions (`Subscription::PROVIDER_MANUAL`, `PROVIDER_ACTIVATION_CODE`):

| Action | Effect |
|---|---|
| `activate(admin, user, plan, ?version, ?endsAt, ?note, ?studentSeats)` | plan must be `active`, of the user's type, not default; a running manual subscription of the user is cancelled at `now` first; row created with `acquisition_source = manual_admin_activation`, `granted_by`; `ends_at` from `duration_days` unless given; fulfils a matching pending request. **Seat terms**: a seat-based version *requires* `studentSeats`, quotes it (`TeacherPricingService`) and freezes `student_seat_limit`, `seat_unit_price_cents`, `seat_total_cents`, `seat_currency` on the row; a capacity below the students currently covered is refused (nothing is deleted, so nothing fits) |
| `activateFromCode(code, user)` | called inside the redemption transaction; `provider = activation_code`, `external_reference = activation_code:{id}`; capacity from the batch's `student_seat_limit`, price from the batch's **frozen** version — never from today's grid; a paid code is always accepted, even if it leaves the teacher over-limit |
| `suspend / resume / cancel / extend / changePlan(…, ?studentSeats)` | `suspended` and `cancelled` fall back to the default plan; `extend` sets a new `ends_at`; `changePlan` cancels the current row at `now` and creates a new one on the new version with the new seat count (this is how an upgrade 20 → 30 seats is done) |
| every mutation | `SubscriptionEntitlementSynchronizer::sync` (student tier entitlement opened / revoked; `trialing` grants), activity log, resolver + `EntitlementService` memo `forget()` |

It **refuses provider-managed rows** (the dormant Stripe path). Statuses:
`free|active|trialing|expired|cancelled|suspended|pending`; `isRunning()` is
the access question. Every subscription records how it was obtained
(`acquisition_source`: `manual_admin_activation | activation_code | provider
| promotion | partnership | other`, `granted_by`, `activation_note`) and, for
a teacher, **what was bought** (`student_seat_limit`, `seat_unit_price_cents`,
`seat_total_cents`, `seat_currency`, exposed with the tier label used at
activation). Metadata, never payment logic.

### Downgrade never destroys data

Expiry, suspension, cancellation or a smaller plan → the resolver falls back
(e.g. 30 purchased seats → the free 5) and `overLimit` becomes true. **Nothing
is deleted or archived.** What over-limit blocks: seating a **new** student
(join code or join link). Since 2026-10-24 a student has one class at a
time, so a seated student no longer joins a second class (`already_in_class`);
leaving then rejoining counts as a new seat. Classes may still be created. Existing classes, members,
visibility rows and progress stay readable. A downgrade *request* below the
current usage is refused up front (`seats_below_usage`); the admin cannot
activate a capacity below usage either. `SubscriptionLifecycleTest` and
`TeacherCapacityTest` lock this.

### Activation codes bound to a plan

- `activation_code_batches.plan_version_id` (nullable) and
  `student_seat_limit` (nullable). A batch **with** a plan version: each
  redemption creates one subscription on that frozen version, then syncs. A
  batch on a **seat-based** version *requires* `studentSeats` (« 10 codes ×
  30 élèves »), checked against the grid at creation, and every redeemed code
  opens exactly that capacity at that version's price — never recomputed
  from today's grid. A student batch **without** a plan keeps the legacy path
  (tier entitlement directly) unchanged and refuses a seat count.
- Every code is unique (`activation_codes.code_hash` unique, redraw on
  collision), redeemable once (conditional update on `activated_by`), never
  reissued; the plan type must match the redeeming role (`plan_mismatch`).
- Revoking a plan-bound code cancels its subscription and re-syncs, so
  revocation still closes access.
- **Individual code**: `POST /admin/{teachers|students}/{id}/activation-codes`
  = a single-seat batch with `recipient_user_id`, label « Code individuel —
  {email} », `ActivationCodeIssuedNotification` (Arabic mail), the plain code
  returned once to the admin. Redemption by another account is still allowed
  (the code is the secret) and the admin sees who redeemed it.

## 6. The two student access models

```text
A  the student's own access          activation code / manual student subscription → entitlements   (unchanged)
B  covered by the teacher            active membership in a class of a teacher whose RUNNING subscription
                                     has students.covered = true → premium, reason teacher_subscription
C  covered by the school's licence  active membership in an active class of a school whose licence RUNS → premium,
                                     reason school_licence, ordered BEFORE teacher_subscription; the class's students
                                     use the SCHOOL's seats, not the teacher's (2026-10-26 — SCHOOL_ADMIN_SPACE.md §5bis)
```

Model B is evaluated **dynamically** in `EntitlementService` through
`Domain\Plans\TeacherCoverage` (fourth per-request memo, flushed with the
others). No per-student row is written: suspending or expiring the teacher's
subscription closes the coverage on the next request. The allow reason is
`AccessDecision::VIA_TEACHER_SUBSCRIPTION` (`teacher_subscription`), ordered after
`activation_code`; `EntitlementService::summarize()` exposes `teacherCoverageActive`
and `usePremiumStatus().viaTeacher` renders it. Annexe A6
of `ADMIN_PANEL_ARCHITECTURE.md` now lists four allow reasons while
`entitlements.type` stays three values. `PaymentProviderBoundaryTest` still
forbids any `Domain\Billing` import in `Domain\Access`: the resolver lives in
`Domain\Plans`.

## 7. Study context (the student side)

`GET /student/study-context` → `{mode: independent|classroom, classrooms:[{id,
name, grade, teacherName, joinedAt, consentRequired, schoolName,
schoolConsentRequired}], primary, hiddenLessonCodes}` (the two school fields
since 2026-10-26 — `SCHOOL_ADMIN_SPACE.md` §4); the
frontend holds it in `StudyContextContext` (one fetch, `refresh()`).

| Surface | What it does |
|---|---|
| `StudentHome` class chip (`CompassHomeSections`, since 2026-11-09 — the banner `ClassContextBanner` was removed with the old home) | « القسم X · الأستاذ Y » (`YEAR_COMPASS.md` §6bis) |
| `/espace/qism` (« قسمي ») | join by code (LTR input) **only while independent** — in a class, the form is hidden and « يمكنك أن تكون في قسم واحد فقط… » says to leave first (`data-qism-one-class`); current class, leave (confirm: history preserved); shows « انضممت إلى القسم … » when arriving from the link (`location.state.joinedClassroom`) |
| `/rejoindre/classe/:token` (public, `pages/JoinClassLink.jsx`) | preview → invalid / closed / member (→ قسمي) / in another class (« أنت في قسم آخر », → قسمي, no consent button) / consent + join, or consent → register / login → automatic join → قسمي. Built on `AuthShell plain` (one column, no brand panel) |
| `/rejoindre/:token` | old invitation addresses → the same page, « رابط غير صالح » |

After any authentication (`Login`, `Register`, `AuthGoogle`,
`VerificationEmail`) the landing path goes through
`postAuthPath(user, fallback)`: a verified student with a pending join is
sent back to the link page; nobody else is affected. No `?next=` URL is ever
read — the only produced path is `/rejoindre/classe/` + a token that passed
the format check, so there is no open redirect.

**No reload after joining.** Before navigating to «قسمي», the join page
re-reads the user, the study context (the class, its teacher, the home
banner) and content availability (`access`: the teacher's coverage, shown as
« وصول كامل ») — also when the answer was `alreadyMember`, since the server
may have joined at e-mail verification after those were first read. Both
providers apply only their most recent response (a request sequence), so the
read started at login cannot overwrite the post-join one
(`pages/JoinClassLink.test.jsx` guards the refresh).
| `LessonCard`, `UnitPage`, `LessonIndex` | hidden-by-teacher state, same visual as closed |

A student who is in no class is « independent » and sees exactly what they saw
before this phase. `StudyContextTest` and `contentAvailability.test.js` lock
both branches.

## 8. The teacher space

> Arabic and right to left today; the French rules are `FRENCH_LANGUAGE_CONTRACT.md` — not yet applied in the code.

Routes under `/enseignant` (`ProtectedRoute allowedRoles={['teacher']}`,
`TeacherLayout` + `TeacherNavbar`, pattern of the student shell, no grade
gate; `data/teacherNavigation.js`). Since 2026-09-29 it is the SAME workspace
shell as the student's: `<main class="sa-workspace-main">` with the sidebar /
gutter variables and a fixed 80 px rail (`components/common/WorkspaceNav.jsx`, `RAIL_WIDTH` —
`docs/reports/NAVIGATION_REBUILD_PLAN.md` §0):

```text
/enseignant                      TeacherHome          usage tiles (UsageMeter, N / M in dir="ltr"), classes, next steps
/enseignant/classes              ClassGroupList       « قسم جديد » opens ClassGroupForm in a centred Modal, on the page
/enseignant/classes/nouveau      ClassGroupCreate     same form full-page (direct links, bookmarks); grade from getAllGrades() ∩ allowedGrades
/enseignant/classes/:id          ClassGroupDetail     JoinAccessCard on top (join LINK, then the CODE below), then tabs نظرة عامة (default) / التلاميذ / الكفاءات / التدخّلات / التحدّي اليومي / الدروس / الإعدادات
/enseignant/classes/:id/eleves/:studentId   StudentProgressPage   « لمحة », signals, interventions, completion, mastery, timeline
/enseignant/classes/:id/eleves/:studentId/cahier   StudentNotebookPage   read-only, paginated
/enseignant/classes/:id/defi/affichage   ChallengeDisplayPage   the daily challenge on the classroom screen — outside TeacherLayout, full screen (DAILY_CHALLENGE.md §10)
/enseignant/offre                SubscriptionPage     « عرضي »
/enseignant/profil               TeacherProfile
/enseignant/muassasa             TeacherSchoolPage    « مؤسستي »: what the school sees (TeacherFacts), attach classes, leave — SCHOOL_ADMIN_SPACE.md §7
/enseignant/muassasa/rejoindre/:token  TeacherSchoolJoin   join a school after reading what it will see
```

Creating a قسم never leaves « أقسامي ». The « قسم جديد » button opens
`features/teacher/members/ClassGroupForm.jsx` inside the shared
`components/admin/ui/Modal` — centred, dimmed backdrop, focus trapped, an X
labelled « إغلاق », closed by Escape, by the backdrop, by that X or by
« إلغاء », with the list still behind it. On success the modal closes and the
teacher lands on the new قسم. `ClassGroupCreate` renders the *same* component
full-page so `/enseignant/classes/nouveau` keeps working for direct links and
for the « قسم جديد » button of `TeacherHome`; the form owns the fields, the
validation and the call, and the caller only decides what follows through
`onCreated(classroom)`. **Reusable pattern**: a teacher form that belongs to a
list lives in `features/teacher/`, takes `onCreated`/`onCancel`, and is
mounted both in a `Modal` and on its route — never duplicated. `Modal` takes
`closeLabel` so its X is Arabic on teacher screens and French in the admin
panel (default « Fermer »). It renders through a portal on `document.body` (a
`glass-card` ancestor would otherwise capture `position: fixed` and shrink the
dialog and its backdrop to the card), its height is capped to the viewport with
a scrolling body, and sizes are `sm | md | lg | xl` (the LP evidence panel uses
`xl`).

« عرضي » shows the effective plan with the purchased seats and the seat
meter (« سعة التلاميذ N / M », classes shown as unlimited), then **the seat
selector** of the seat-based plan: « كم عدد التلاميذ الذين تريد تأطيرهم؟ », a
LTR number input (floor = free allowance + 1 and never below the students
currently covered, ceiling = the grid's last bound), and the live quote —
tier, « … دج للتلميذ », « عدد التلاميذ », « المبلغ الإجمالي » — recomputed at
every keystroke from `plan.pricingTiers` (`seatPricing.js`, unit-tested), so
20 → 21 visibly changes tier. It states « الأقسام غير محدودة… », « المبلغ
المستحق », « الدفع يتم خارج المنصّة… », and offers « اطلب هذه السعة » when
`allowsRequests`; the request sends **only the number** (`studentSeats`) and
renders the server's reason codes in Arabic. Below: the pending (with seats
and total) / rejected state, the plans without a grid, and **the
activation-code entry, always**. No card form, no payment button.
`subscriptionState.js` derives the rendering state and is unit-tested. The
home page shows the seat meter first, with a « bلغت سعة التلاميذ » hint
linking to « عرضي » when full; the members tab of a class shows the same
hint.

Frontend code uses `classGroup` as the identifier; i18n namespace `teacher`
(with the six Arabic plural forms for counts — French forms at step 1D); services under
`services/teacher/` (token-first, `apiMessage` reasons). The admin UI kit
(`DataTable`, `states`, `FilterBar.Pagination`, `Modal.ConfirmDialog`) takes
label props so no French default reaches a teacher screen;
`pages/teacherContract.test.js` scans `pages/teacher/**` for French defaults
and for any billing import.

Since 2026-11-17 the `teacher` namespace is loaded **on demand, together with `TeacherLayout`** (`BUNDLE_BOUNDARIES.md`
§3). A component outside `pages/teacher/`, `features/teacher/` and `components/teacher/` that needs one of its strings
reads it in its own component, mounted for a teacher only, and is named in `i18n/onDemandNamespaces.test.js`.

Teachers may present in Classroom Mode: `'teacher'` is in
`CLASSROOM_PRESENTER_ROLES` (`packages/core/auth.js`).

### 8a. Mastery in the teacher space (Mastery V2, 2026-09-24)

- **« الكفاءات » tab** (`features/teacher/learningPoints/LearningPointsTab.jsx`,
  gated by `progress.class` like « نظرة عامة »): a lesson picker (visible class
  lessons), one row per LP with a four-segment bar (mastered / reinforce / gap
  / unassessed) and chips « دليل ناقص », « بحاجة إلى اختبار », « متقن لكن
  قديم »; a row opens the drill-down (`LearningPointDrilldown.jsx`, students
  weakest first) and a student opens the explanation
  (`MasteryExplanationPanel.jsx`, a Modal dialog — not a route).
- **Student dossier** (`pages/teacher/StudentProgressPage.jsx`): the tiles
  separate COMPLETION (« دروس مكتملة ») from MASTERY (« كفاءات متقنة » =
  `masteryCounts.mastered`); « نسبة النجاح » says « التمارين فقط »; the LP list
  is complete, grouped by lesson, weakest first, with reason, confidence bar,
  counters, freshness and « لماذا؟ ».
- **One visual vocabulary.** Every teacher screen showing a mastery status
  imports `MasteryPill`, `ReasonChip`, `FreshnessMark`, `ConfidenceBar`
  (`features/teacher/learningPoints/MasteryPill.jsx`) and the colours of
  `lpBar.js` (`LP_STATUS_BAR`) — never a local redefinition.

### 8c. The learning loop in the teacher space (2026-09-25)

The class page opens on **« نظرة عامة »** (`features/teacher/overview/OverviewTab.jsx`),
in the order of the teacher's questions and nothing else: « تستحقّ نظرة »
(the learning signals, the most shared first, 4 visible then « عرض الكل »),
« ما الذي تغيّر؟ » (recent changes), « خريطة التعلّم » (the whole-scope map,
bars of counts, no average), then engagement apart. No average of the class
is shown on this screen.

Reusable pieces — every screen imports them, none redefines them:

- `features/teacher/insights/insights.js` — pure (tested): `studentName`
  (never an email fallback), the intervention kinds and their rules mirrored
  from the server, `interventionDefaults(signal)`, `signalWhyParams`,
  `trajectoryColumns`, `outcomeLine`, tones. It FORMATS what the server
  decided; it never computes a pedagogical rule.
- `insights/SignalCard.jsx` — one signal: title from the type and the LP,
  « why » from the indicator, the students (each to their dossier), the
  prerequisites lead, the last evidence, « افتح النقطة » and « تدخّل ».
- `insights/StatusTrail.jsx` — a state's path as coloured dots (no
  percentages); recalculated / rebuilt steps marked.
- `interventions/InterventionForm.jsx` — THE intervention form, in the kit
  `Modal`, opened from a signal, an LP drill-down, the evidence panel or the
  dossier with a prefill (`candidates`, `prefill`, `point`); it says whether
  the student will see the gesture and that the state is frozen now.
- `interventions/InterventionsTab.jsx` (+ exported `InterventionCard`),
  `interventions/InterventionOutcome.jsx` — the list, the measure, the
  non-causal disclaimer.
- `snapshot/StudentSnapshot.jsx` — « لمحة » at the top of the dossier.

« الكفاءات » opens on « كل الدروس » (the map) and accepts a `focusCode`
to open one LP directly (from a signal or a change). The drill-down adds the
week-by-week trajectory, the items the class fails, the prerequisites, each
student's direction, and « تدخّل مع من هم في ثغرة ». The evidence panel
(`MasteryExplanationPanel`) adds the state history, the student's notes on
that LP (link to the notebook) and the interventions on that LP.

No teacher component reads `.email` of a student (`teacherContract.test.js`);
labels live in `teacher.json` → `attention.*`, `interventions.*`,
`snapshot.*`, `learningPoints.{allLessons, scope, direction, trajectory,
items, prerequisites, evidence}`, `common.unnamedStudent`. Browser QA:
`apps/web/e2e/teacher-intelligence.mjs` (demo dataset; 31 checks including no
email on screen, 390 / 1280 px without overflow, a member re-opening the join
link lands on «قسمي» without a second row, the student's suggestion).

### 8b. The teacher learns like a student — same engine, no progression

A teacher uses the platform exactly as a student would while preparing a
lesson, minus the pedagogical constraints. There is **one lesson engine**;
what changes is the **reader**, described once by
`features/learning/learningViewer.js`:

```text
                     student        visitor        teacher        admin
freeNavigation       no             no             YES            YES      the sequential lock is a student guide
tracksProgress       yes (server)   yes (local)    NO             NO       nothing is written, anywhere
workspaceBase        /espace        —              /enseignant    —        cahier, مختبر, cours links
usesWorkspaceShell   StudentLayout  MainLayout     TeacherLayout  MainLayout
```

- **Routes.** Lessons stay on their `/courses/…` paths; `CourseLayout` renders
  `TeacherLayout` for a teacher (the lesson chrome offsets follow
  `usesWorkspaceShell`). The teacher space adds `/enseignant/cours`
  (the `Explorer` catalogue), `/enseignant/atelier[/:toolSlug[/:documentId]]`
  (the same Math Lab pages) and `/enseignant/cahier[/revision|/:noteId]` (the
  same notebook pages), mounted under `ProtectedRoute allowedRoles={['teacher']}`.
  `data/teacherNavigation.js` lists الدروس · المختبر · كرّاسي before أقسامي.
- **Modules, parts, knowledge map.** The gates of the module lesson (`moduleGate.js`, `stepUnlock.js`,
  `ContentModule`, `BossFinal`, the old knowledge map) were deleted with that system on 2026-11-22. A v2 lesson has no
  sequential lock for any reader (`LESSON_V2.md`).
- **No progress, ever.** `useProgress` (visit, completion, XP),
  `useLessonProgressSync` (login hydration and queue flush),
  `useEvidenceSubmission` (learning evidence) and `useFinalTestAttempt`
  (server copy of the final test) all read `tracksProgress`; for a teacher
  they are silent, locally and remotely. The server is the authority: the
  `learner` middleware (`EnsureLearnerRole`) answers 403 `not_a_learner` on
  `PUT /lessons/{code}/progress`, `POST …/evidence`, `PUT|DELETE
  …/final-test-attempt` for any non-student, so no client can create a
  student progress row for a teacher. Reads (`GET /students/me/lesson-progress`,
  `GET …/final-test-attempt`) stay open and return nothing.
- **Content.** `EntitlementService::decide` allows a teacher with an active
  account on every tier with the reason `teacher_role` (`AccessDecision::VIA_TEACHER_ROLE`):
  the teacher prepares content, the paying unit is the student seat. Publication
  is still checked first by `ContentAccess` (unpublished stays closed), and the
  per-class visibility axis never applies to non-students — a lesson the
  teacher hid for قسم 1 stays open to the teacher (`TeacherLearningAccessTest`).
- **Finding a lesson (2026-09-29).** `/enseignant/cours` (and the student's
  « دروسي » / « استكشاف ») carry the **same search as `/courses`** —
  `components/student/GradeLessonSearch.jsx`, one field and one rule for the
  four pages: title + description, case-insensitive, across every ميدان of
  the grade, live while typing. Empty → the catalogue keeps its **unit
  cards** (الوحدة level, unchanged); typing → the matching lessons, flat, in
  catalogue order; no match → « لا يوجد درس يطابق … » (`common.noCourseMatches`).
  Since 2026-10-07 the same four pages let the reader choose the **view**
  (« الوحدات » / « حسب الميادين » / « كل الدروس », شبكة / قائمة) — one
  renderer and one stored preference, see `ARCHITECTURE.md` « Catalogue
  views »; the unit cards stay the default.
- **The teacher's lesson block (unit page).** The catalogue stays at the
  الوحدة level; lesson-level gestures live one level down, on the unit page
  (`pages/UnitPage.jsx`), for the teacher reader only
  (`useLearningViewer().isTeacher`; a student's unit page is unchanged):
  the lesson's **محاور** as compact numbered chips, in `lesson.config.js`
  order (`LessonModuleChips`), and two distinct actions
  (`TeacherLessonActions`): **« مذكرة الدرس »** and the class session [NOT CHECKED 2026-11-22: which entries
  `TeacherLessonActions` still shows now that Classroom Mode of module lessons is deleted].
- **« مذكرة الدرس » — `/enseignant/cours/:lessonId/memoire`.** A teacher-only
  orchestration document for one lesson, a single continuous page meant to
  stay open during the class (`pages/teacher/LessonMemoPage.jsx`,
  `features/teacher/lessonMemo/`). **It is built, never written:**
  **Its sources are the module lesson's files (`lesson.config.js` modules, `knowledge.jsx`, `content/*.js` globbed
  under `lessons/college/`); no lesson has them today, so the memo has nothing to build** — what it becomes for a v2
  lesson (its pack's `board` memo, `CLASS_SESSION.md`) is open. As imported:
  `buildLessonMemo` (pure) turns the catalogue
  entry, `lesson.config.js`, `knowledge.jsx` and `content/*.js` into
  sections — header (level, domain, unit, duration, planned minutes, محاور),
  objectives (skills / knowledge bricks / scope include–exclude / unit
  objectives), prerequisites (catalogue notions + prerequisite lessons),
  starting activity (`ACTIVITY` / `ACTIVITY_A` / `SITUATION`, its questions and closing), a **timeline** with one phase per
  محور (stage, minutes and cumulative clock, teacher / students / support /
  intention, expected outcome = the learning points and bricks it teaches,
  stage prompts, vigilance = the `commonError` of the
  exercises on those points, transition to the next محور), examples, anticipated
  errors (with the brick as the nudge and the exercise's `explain` as the
  fix), differentiation (exercise `difficulty` only), the trace to build, the end-of-session check (oral questions from
  brick summaries, the evaluation محور, success indicators = learning points,
  an exit ticket = the first `facile` exercise) and « ما بعد الحصة » (next
  lesson in the unit, lessons that depend on it, remediation lessons). What a
  phase *asks of the teacher and the students* is the only authored text: one
  paragraph **per stage** in the on-demand `memo` i18n namespace, never per
  lesson. A section with no source data is not rendered. Sticky bar:
  « رجوع » (to `location.state.from`, else history, else `/enseignant/cours`),
  « كرّاسي », print, open the lesson; `@media print` gives a
  preparation sheet without the app chrome.
  **Access:** the route is under `ProtectedRoute allowedRoles={['teacher']}`
  (a student or a visitor is redirected; its walk `e2e/teacher-memo.mjs` was deleted on 2026-11-22);
  the page also refuses an unknown, unbuilt or admin-closed lesson. The memo's
  content is lesson content the teacher can already read; the only
  server-side data is the teacher's notes, below.
- **The teacher's notes in the مذكرة (« كرّاسي »).** Not a second notes
  system: the same `notebook_notes` and `/practice/notes` API as the
  teacher's notebook, context `lessonCode` (`MemoNotes.jsx`, see
  `NOTEBOOK.md`). Autosave (POST on the first pause, PATCH after — never a
  duplicate), « ✓ حُفظ », local draft as a safety net, edit and delete; a rich
  note written in the lesson's notebook window is shown and edited in
  « كرّاسي ». No migration, no new endpoint.
- **Fullscreen.** The presentation layer (`lessons/common/classroom/`, used by practice, the Math Lab and the class
  board) admits presenter roles only: `student` is not in `CLASSROOM_PRESENTER_ROLES` (see `CLASSROOM_MODE.md` §3).
- **Notebook, Math Lab.** The notebook pages and the Math Lab
  pages are reused under `/enseignant` with links built from
  `useWorkspaceBase()` (`notebookPaths(base)`, `mathLabBasePath(base)`,
  `mathLabToolPath(tool, id, root)`). Notes and lab documents belong to the
  authenticated account only (`PracticeNotebookController`,
  `MathLabDocumentController` resolve everything from `$request->user()`);
  a teacher never sees a student's or another teacher's note. An exercise
  note opened from the teacher's notebook links to the lesson, since practice
  is a student surface (`sourceLinkFor(note, base)`).
- **Practice sessions** (`/espace/pratique`) remain a student surface. Since
  2026-10-05 the server enforces it: every practice WRITE (open a session,
  open a question, answer, hint, complete an exercise or a session) is behind
  `learner` — 403 `not_a_learner` for a teacher, an ambassador or an admin
  (`PracticeLearnerGuardTest`). Before, only the web route guard kept teachers
  out.
- **The teacher's practice (2026-10-05) — not a separate space.** The teacher
  enters it THROUGH THE LESSON, exactly like the student [NOT CHECKED 2026-11-22: the entry card after the module
  summary's deletion]; it links to `/enseignant/pratique/:lessonCode`,
  which renders the **student's own `PracticeHub`** in teacher mode: the
  overview is built locally (`teacherBank.teacherOverview`: every level open,
  no progress, the lesson's learning points with unlit stars and no counters;
  `LevelSelector showProgress={false}` shows « N تمارين », never « أنهيتها »).
  Choosing a level opens its first exercise in
  `/enseignant/pratique/:lessonCode/:level/:exerciseId` —
  `TeacherPracticePlayer`, the same layout as `PracticeSession` (grid, side
  column, header, question card with `SessionProgress`, same buttons, same
  classroom presentation). It checks answers in the browser
  (`checkLocally` → `packages/core/practice/answerEvaluator.js`), shows hints
  from the content and can reveal the expected answer; nothing is written.
  There is no « بنك التمارين » nav entry or lesson list any more.
- **« إجابات تلاميذي »** — the player's side column (where the student sees
  their learning point) lists how many of the teacher's students did this
  exercise; a click unfolds one student's answers question by question, each
  attempt with its outcome and hints (`StudentResponsesPanel`). API, read-only,
  `can:teacher`:
  `GET /teacher/practice/{lessonCode}/exercises/{exerciseId}/students` and
  `…/students/{studentId}` (`TeacherPracticeResponses`). Scope: ACTIVE members
  of the teacher's NON-archived classes; identity via
  `ClassroomAccess::identity` (never the email); a student outside that scope
  is a 404; the last attempt of each question counts in the summary
  (`TeacherPracticeResponsesTest`). Answers are rendered by
  `teacherBank.formatStudentAnswer` (choice → its text, point → `(x ; y)`,
  composite forms → the server's normalized answer).
- **Collapsible side column** — in both players (student and teacher) a
  button (from `xl`, where the column sits beside the exercise) hides the side
  column so the exercise takes the full width (`useSideColumn`, remembered per
  browser in `localStorage`, guarded; below `xl` the column stays stacked
  above the exercise).


### « حصّة القسم » — the class session (2026-11-18, steps 1–2, not validated)

A teacher runs a lesson's test on the board with his class — the seating map, the editable test, the student's name on top,
the podium of teams — from `/enseignant/hissa/:lessonId` (full screen, outside the teacher shell, like the challenge and
مدار displays). It follows the three locks of every teacher route and writes four tables of its own
(`class_seatings`, `class_tests`, `class_sessions`, `class_session_answers`), **never** `learning_evidence`. The whole
contract is `docs/architecture/CLASS_SESSION.md`; this document only points to it.

Since 2026-11-22 Classroom Mode of module lessons is deleted; a lesson whose pack declares `board` opens « حصّة القسم »
from the catalogue card and the memo (`features/classSession/boardLessons.js`, read from the generated lesson index —
empty today). The teacher's practice for a v2 lesson is its bank (`TeacherBankGate`, `CLASS_SESSION.md` §5quater).

## 9. The admin control surface (French)

Navigation: **Enseignants** (Tous / Demandes), **Classes**, **Offres** (Offres /
Demandes / Abonnements). Pages under `pages/admin/{teachers,classrooms,plans,
requests}` and the revived `Subscriptions.jsx` (plan, version, source,
`grantedBy`, lifecycle actions; no provider notice).

**The account page is the commercial control surface**, shared by teachers and
students through `components/admin/commercial/CommercialPanel.jsx`:

| Section | What the admin does |
|---|---|
| Compte | name, e-mail, verified, status; Activer / Suspendre / Désactiver / Réactiver (`AccountStatusService`, role-agnostic) |
| Offre actuelle | plan, version, source, status, dates (resolver) |
| Capacité élèves (teachers) | `current / limit`, remaining, over-limit badge, classes count (unlimited), purchased seats, tier and price per student **at activation** |
| **Activer une offre** | plan + version, end, note, and for a seat-based plan the **number of students** with the local quote → `POST /admin/{role}/{id}/subscriptions {studentSeats}`; the server recomputes and freezes the price |
| **Envoyer un code d'activation** | plan + version, validity, seats for a seat-based plan → `POST /admin/{role}/{id}/activation-codes`; the code is shown once, the mail is confirmed, issued codes are listed with their state and capacity |
| Demande | plan, **seats, tier, server-calculated total**, date, note; « Activer » pre-fills plan and seats above, « Refuser » with a mandatory reason |
| Abonnement + historique | seats and unit price per row; Suspendre / Reprendre / Annuler / Prolonger / Changer d'offre (with a new seat count) |
| Droits (teachers) | per key: value · usage · source (`Sièges 25 / 30 — abonnement`, `+5 — Dérogation`); override form (`POST/DELETE …/entitlements/overrides`) |
| Classes, Activité | read-only |

Plan editor sections: Informations · Demandes (`allows_requests`) · Versions
(Nouvelle version, Publier, immutability notice) · per version: **Capacité
élèves** (the free allowance on the default plan) · **Tarification par élève
— paliers** (teacher plans: an editable grid min / max / prix par élève /
devise / actif / ordre with add, remove, move; overlaps, gaps and inverted
bounds are listed *before* saving and block the save; an **Aperçu** « pour
N élèves » shows the local quote and a « Vérifier côté serveur » button that
calls `GET /admin/plan-versions/{id}/pricing/quote?seats=N`) · Durée activée et
prix fixe (hors grille) · Fonctionnalités · Contenu · **Limites techniques**
(vide = illimité, never the unit of sale) · Abonnés (with seats). The
activation batch form has an « Offre » selector (required for teacher
batches, optional for student batches, « X codes = X activations ») and, for a
seat-based plan, « Élèves par code » with the quote; batch lists show the
plan and the seats per code; the requests queue shows seats and the
calculated total; the subscriptions list shows seats.

The dashboard counts teachers, classes and pending requests; a pending request
is an alert linking to `/admin/offres/demandes`.

Everything above is logged by `ActivityLogger` in the same transaction
(`classroom.*` incl. `classroom.join_link_rotated`, `classroom_member.*`, historical `classroom_invitation.*`,
`classroom_lesson.status_changed`, `plan.*`, `plan_version.*`,
`plan_override.*`, `plan_pricing.updated` (before / after grid),
`subscription_request.*` (seats and total), `subscription.*` (seats and
price), `activation_code.issued`, `teacher.status_changed`).

## 10. API

All ids `whereNumber`; JSON camelCase; `{success: true, <noun>: …}`; domain
refusals → 422 `{success: false, reason, message}`.

```text
# any verified user (plan type = role)
GET  /me/plans                 → plans[{…, seatBased, pricingTiers[], currentVersionId}], freeSeats
GET  /me/plans/{planId}/quote?seats=N   → the server quote (tier, unitPriceCents, totalCents)
GET  /me/subscription
GET  /me/subscription-requests POST /me/subscription-requests {planId, studentSeats?, note?}   POST /me/subscription-requests/{requestId}/cancel
POST /activation-codes/redeem  (existing)

# student
GET  /student/study-context    POST /student/classrooms/join {code|link, consent:true}   POST /student/classrooms/{id}/leave
     (link: 201 joined, 200 {alreadyMember:true}; 422 invalid | joining_closed | consent_required | seats_exhausted …)
POST /student/classrooms/{id}/consent            GET /student/teacher-recommendations
GET  /join-links/{token}       (public, throttle:30,1 → {classroomName, grade, teacherName, joiningOpen, alreadyMember})
                               (alreadyMember only with a student's bearer token, else null)
POST /auth/register            + optional classJoinLink, classJoinConsent (pending join, completed at e-mail verification)

# teacher  (auth:sanctum + account.active + email.verified + can:teacher)
GET  /teacher/dashboard        GET /teacher/entitlements (+capacity)   GET /teacher/capacity
GET  /teacher/plans            GET /teacher/plans/{planId}/quote?seats=N   GET /teacher/subscription
GET|POST /teacher/subscription-requests            POST /teacher/subscription-requests/{requestId}/cancel
GET|POST /teacher/classrooms   GET|PATCH /teacher/classrooms/{id}
POST /teacher/classrooms/{id}/archive | restore | join-code/rotate | join-link/rotate
     (classroom JSON carries joinCode, joinCodeEnabled, joinLinkToken — the client builds the URL on its own origin)
GET  /teacher/classrooms/{id}/students             DELETE /teacher/classrooms/{id}/students/{studentId}
GET  /teacher/classrooms/{id}/students/{studentId}/progress
GET  /teacher/classrooms/{id}/lessons              POST /teacher/classrooms/{id}/lessons/bulk
PATCH /teacher/classrooms/{id}/lessons/{lessonId}
GET  /teacher/labs/{lessonCode}     PATCH /teacher/labs/{lessonCode} { lab: "<module>:<type>", checkpoints: bool }   (in-lab questions for the teacher's own account, 2026-10-28)
GET  /teacher/classrooms/{id}/learning-points[?lesson={code}]      (the map: whole scope, or one lesson; progress.class)
GET  /teacher/classrooms/{id}/learning-points/{code}               (one LP: students, trajectory, items, prerequisites; progress.student)
GET  /teacher/classrooms/{id}/students/{studentId}/learning-points/{code}/explanation   (explanation, history, notebook, interventions)
GET  /teacher/classrooms/{id}/attention                            (signals + recent changes; progress.class)
GET|POST /teacher/classrooms/{id}/interventions   GET|PATCH /teacher/classrooms/{id}/interventions/{interventionId}
GET|PATCH /teacher/classrooms/{id}/daily-challenge/settings   GET …/daily-challenge/results?date=   GET …/daily-challenge/display?date=   (DAILY_CHALLENGE.md)
GET  /teacher/practice/{lessonCode}/exercises/{exerciseId}/students[/{studentId}]   (« إجابات تلاميذي »: who did it, then one student's answers — §8b; with photos and review)
GET  /teacher/reviews[?classroom=]   GET /teacher/reviews/count   POST /teacher/reviews/{id} {verdict: correct|incorrect, comment?}
GET  /teacher/answer-images/{uuid}[?annotated=1]   POST /teacher/answer-images/{uuid}/annotation (multipart image)
     (« تصحيح الإجابات », 2026-10-06 — EXERCISE_CONTRACT.md § Image answers; scope = rosterOf, foreign classroom 403, 409 already_reviewed)

# admin  (can:admin)
GET  /admin/teachers[?ambassador=1]  GET /admin/teachers/{id}  PATCH /admin/teachers/{id}/status  PATCH /admin/teachers/{id}/ambassador
GET  /admin/teachers/{id}/entitlements   POST …/entitlements/overrides   DELETE …/entitlements/overrides/{overrideId}
GET  /admin/{teachers|students}/{id}/subscription            (+ capacity for a teacher)
POST /admin/{teachers|students}/{id}/subscriptions {planId, studentSeats?, …}   (activate directly)
POST /admin/{teachers|students}/{id}/activation-codes {planId, studentSeats?, …} (send one unique code)
GET  /admin/subscription-requests?status=&type=   POST /admin/subscription-requests/{requestId}/reject
POST /admin/subscriptions/{subscriptionId}/suspend | resume | cancel | extend | change-plan {planId, studentSeats?}
GET  /admin/classrooms  GET /admin/classrooms/{id}
GET|POST /admin/plans   GET|PATCH /admin/plans/{id}   PATCH /admin/plans/{id}/status
POST /admin/plans/{id}/duplicate   POST /admin/plans/{id}/versions   GET /admin/plans/{id}/subscriptions
PATCH /admin/plan-versions/{id} (draft only; + pricingTiers[])   POST /admin/plan-versions/{id}/publish
GET  /admin/plan-versions/{id}/pricing   PUT /admin/plan-versions/{id}/pricing {pricingTiers[]} (draft only)
GET  /admin/plan-versions/{id}/pricing/quote?seats=N   (preview, any version)
GET  /admin/entitlements/keys
POST /admin/activation-codes/batches   (+ planVersionId, + studentSeats for a seat-based plan)
```

`POST /auth/register` accepts `accountType`; `GET /auth/google/redirect?accountType=teacher`
(carried as OAuth `state` = `type:teacher`) and `POST /auth/google/complete {accountType}`
carry the same choice.

## 11. Configuration and seeds

- `config/classroom.php`: `consent_version`, `timezone` (the invitation
  settings were removed with the feature; the server returns only the link
  token, never a URL). **No commercial
  limit lives in config**: limits are plan data.
- `PlanSeeder` (wired in `DatabaseSeeder`): `teacher-free` (« الأستاذ —
  مجاني », default: 5 seats, unlimited classes), `teacher-seats` (« الأستاذ —
  حسب عدد التلاميذ », the seat-priced plan with the initial six-tier grid,
  covers students), `student-premium` (« التلميذ — وصول كامل »). Plan names and descriptions are seeded in the
  product's language — Arabic today (`PlanSeederLanguageTest`; French at step 1D–1F, not yet applied); only the slug
  is latin. Idempotent by
  slug, never overwrites a plan the admin has edited — so a database seeded
  before the seat model keeps its old `teacher-free` values until the admin
  publishes a new version of it (the dev database was updated this way; the
  former `teacher-basic` / `teacher-pro` rows are archived there). Production
  applies `docs/deployment/HOSTINGER_TEACHER_PLANS_MIGRATION.sql` (sixteen
  additive migrations + the same seed rows as replayable upserts).
- `smarter:scope-curriculum` cascades `classroom_lessons`;
  `smarter:purge-students` deletes `role = student` only (teachers and their
  classes survive).

## 12. Tests that own this document

Backend (`apps/api/tests/Feature`, MySQL, `php artisan test -c phpunit.local.xml`):
`TeacherAuthorizationTest`, `TeacherRegistrationTest`, `GoogleSignInTest`
(teacher cases), `SubscriptionRequestTest`, `SubscriptionActivationTest`,
`SubscriptionLifecycleTest`, `ActivationCodeBulkPlanTest`,
`IndividualActivationCodeTest`, `PlanEntitlementResolverTest`, `PlanAdminTest`,
`ClassroomLimitTest`, `ClassroomJoinCodeTest`, `ClassroomMembershipCapacityTest`,
**`ClassroomJoinLinkTest`** (token randomness and scope, public preview, idempotent re-join, code + link = one row, closed joining keeps members, rotation, owner-only management, pending join through registration and e-mail verification), `ClassroomLessonVisibilityTest`, `StudyContextTest`,
`ClassroomProgressTest`, **`AnswerImagesAndTeacherReviewTest`** (photos: re-encoding without metadata, limits, scope, teacher verdict → evidence + medal + notification, leaving the class), **`TeacherPrivacyContractTest`** (no email in any /teacher response, including the review queue, left / removed / archived → 404 per student, cross-teacher IDOR, archived notes private, invitation preview), **`ClassroomConsentTest`**, **`ClassroomLearningLoopTest`** (detect → understand → intervene → measure on real evidence, the student's suggestion, the signal following the facts), **`LearningPointTransitionTest`**, **`Scale/ClassroomInsightScaleTest`** (constant queries for 5 and 40 students), `Unit/Classroom/{LearningTrendTest, AttentionSignalsTest}`, **`ClassroomLearningPointTest`** (class × LP counts and reasons, outsiders excluded, hidden lesson out of scope, drill-down order, explanation for members only), `TeacherCoverageAccessTest`, `AdminTeacherClassroomTest`,
**`TeacherLearningAccessTest`** (published and premium content open by role, hidden-for-class does not block the teacher, unpublished stays closed, progress / evidence / final-test writes refused and no row created, own notebook and Math Lab only),
**`SeatPricingTest`** (tier boundaries 5/6/20/21/30, N × price, grid
validation, versioning, the client's price is ignored, admin and teacher
quotes), **`TeacherCapacityTest`** (free seats + unlimited classes, distinct
students, join by code and by link refused at capacity, over-limit after expiry
without deletion, a teacher cannot grant themselves seats, technical class
limit still honoured when configured), **`SeatSubscriptionFlowTest`** (request
with seats pending and priceless, reasoned refusals, manual activation with
frozen seat terms and upgrade, activation below usage refused, codes carry
their capacity whatever today's grid, legacy student batches unchanged),
plus the extended `AdminAuthorizationTest`, `PurgeStudentAccountsTest`,
`CurriculumScopeTest`. Shared fixtures: `Tests\Support\CommercialFixtures`
(its `withToken` flushes the Sanctum guard so one test can act as several
users).

Frontend (vitest): `features/learning/learningViewer.test.js` (the reader
table above), `features/practice/notebook/space/noteMeta.test.js`
(`notebookPaths`, exercise note → lesson outside the student space),
`features/mathlab/mathLabDocument.test.js` (paths per workspace),
`features/teacher/**/*.test.js` (**insights helpers**, entitlement summary,
subscription state, **seat pricing preview**, lesson selection),
`features/admin/plans/pricingTiers.test.js` (grid editor validation),
`services/teacher/teacherServices.test.js`,
`pages/teacherContract.test.js` (+ no `.email` of a student, no e-mail invitation left, link above code), `pages/student/{qismConsent.test.js, Qism.render.test.jsx}` (consent gesture, joined confirmation), `features/classJoin/pendingClassJoin.test.js` (pending join, TTL, no open redirect, `autoJoinRequest`), `pages/JoinClassLink.test.jsx`,
E2E `apps/web/e2e/class-join-link.mjs` (link above code, copy, register → verify → class, login → class, re-open, code, closed / rotated / invalid, desktop + mobile), `context/contentAvailability.test.js`,
`adminServices.test.js` (navigation snapshot), `legalConsentContract.test.js`.

Any change to a rule in this document changes one of those tests first.

## 13. Not built (Planned)

- Account approval states (`pending` / `rejected` teacher accounts).
- Consumers for `analytics.advanced` and `reports.export` (the school's reports export CSV without that gate — `SCHOOL_ADMIN_SPACE.md` §6).
- Notifications of any kind for signals or interventions (deliberately not
  built: signals live while the teacher looks).
- A student-side dismissal of a teacher suggestion (it disappears when the
  teacher closes the intervention).
- Seat re-check on `restore` of an archived class, and showing archived
  classes in «قسمي» (audit 2026-09-24, G5/G6 — not part of the learning loop).
- Online payment of any kind. If it ever comes, it is a new acquisition source
  writing through `SubscriptionActivationService`, not a new access path.
