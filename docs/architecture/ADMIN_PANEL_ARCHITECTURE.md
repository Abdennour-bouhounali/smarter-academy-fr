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

**Liste blanche** : seul `published` ouvre. Un état inconnu ajouté plus tard
sera fermé par défaut, jamais ouvert par oubli.

**Pas de cascade** : publier une leçon ne publie aucun module. Une leçon
publiée dont un module est en brouillon garde ce module fermé. C'est ce qui
permet de retirer *un* module cassé sans fermer la leçon, et ce qui évite
qu'une publication ouvre par surprise du contenu jamais relu.

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
subscription     écrit plus tard par une synchronisation de paiement
admin_override   dérogation accordée par un administrateur
```

Le vocabulaire est clos à ces trois valeurs. `book_access`, `school_access`,
`partner_access` ne sont pas implémentés — la colonne `type` est une chaîne
libre pour qu'ils restent additifs, mais rien ne les connaît aujourd'hui.

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

### Le palier du contenu, et son défaut

`lessons.tier` vaut `free` ou `premium`. **Le défaut est `free`**, à trois
niveaux : la colonne, `CurriculumImporter` et `AccessTier::normalize()`, qui
traite tout ce qui n'est pas exactement `premium` (NULL, chaîne vide, faute de
frappe) comme gratuit.

Ce sens est délibéré et c'est la protection principale de tout le dispositif :
un palier oublié laisse une leçon OUVERTE. Le contenu payant se déclare ; il ne
s'obtient pas par distraction. C'est l'inverse de la liste blanche de
publication (où l'inconnu ferme) parce que l'inconnu n'y signifie pas la même
chose : un état de publication inconnu est un bug, un palier absent veut dire
« personne n'a décidé de le vendre ».

À ce jour les 133 leçons sont `free` : **aucun contenu n'est verrouillé**.

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
| `GET /content/availability` | élève | `closed.lessons` (retiré), `closed.locked` (verrouillé), `access` (résumé) |
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

`ContentAvailabilityContext` porte la décision du serveur et la donne à
`isLessonUnlocked(lesson, {isPremiumUser})`. La carte de cours consulte aussi
`closed.locked`, parce que le bundle peut être en retard sur la base — une
leçon rendue payante côté serveur reste `free` dans le catalogue embarqué
jusqu'au prochain déploiement, et la carte afficherait sinon « Commencer » sur
une leçon qui refusera de s'ouvrir.

Un élève qui forcerait cet état dans son navigateur verrait une carte
cliquable et rien de plus : chaque écriture repasse par `ContentAccess`, qui ne
lit jamais l'état du client.

Politique d'ouverture, comme partout ailleurs : tant que la réponse n'est pas
arrivée, rien n'est verrouillé.

### La synchronisation des abonnements

**Implémentée.** `App\Domain\Access\SubscriptionEntitlementSynchronizer`
traduit un état d'abonnement faisant autorité en lignes `entitlements` de type
`subscription`.

```text
fournisseur de paiement      ← PAS ENCORE (phase suivante)
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
remboursements, page de tarifs marchande, accès livre, accès établissement.
