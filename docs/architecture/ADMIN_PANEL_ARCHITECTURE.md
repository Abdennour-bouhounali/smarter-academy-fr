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

---

# 9. Lesson management

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
