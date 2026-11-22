# Smarter Academy: Capacity and Scalability Audit

**Type:** read-only code audit. No code, configuration, data or documentation was changed.
**Date:** 2026-09-28. **Branch audited:** `dev` @ `88b299f`. It matches `main` in content: the last deploy was `88b299f fix(practice)…`.
**Hosting baseline, as supplied by the owner:** 1 CPU core, 2,048 MB RAM, 20 GB disk, 400,000 inodes, 80 processes, 40 PHP workers, 3 websites, unlimited bandwidth. `smarter-academy.com` and `smarter-academy.fr` share these resources.

---

## 0. Executive summary

The platform does little work on the server. There is no AI, no PDF or image generation, no WebSockets, and no symbolic maths on the server. Lesson content, exercise content, all 14 Math Lab instruments, Classroom Mode and the Knowledge Map layout run in the browser.

The server's job is to authenticate, record answers (Mastery V2 evidence), store documents and notes, and aggregate history for teachers and administrators. On a single core, the limit is **how many dynamic PHP requests per second the platform can absorb**. Which user actions generate those requests is known from the code.

| Estimate | Value | Confidence |
|---|---|---|
| Sustainable dynamic API throughput on 1 core | **≈ 6–12 req/s comfortable**, ≈ 15–25 req/s hard ceiling | Low–Medium |
| Concurrent active users, mixed realistic usage | **≈ 80–150 comfortable**, ≈ 150–250 strained, > 250 overloaded | Medium–Low |
| Registered (authenticated) users, comfortable | **≈ 2,000–3,500** (≈ 1,000 weekly active) | Low–Medium |
| Registered users before the plan is clearly insufficient | ≈ 5,000 (evening and exam peaks exceed the CPU) | Low |
| Students practising at the same moment | ≈ 100–180 (spread out); **3–5 whole classes** doing a synchronised timed activity | Medium–Low |
| Teachers browsing class analytics at the same moment | ≈ 20–40 in the first school year; this falls as history accumulates | Low |
| Classes | No structural limit on how many are stored (hundreds to thousands is fine). The limit is **how many are live at once**: ≈ 3–5 synchronised, ≈ 5–8 unsynchronised | Medium–Low |
| Students per class | ≈ 40–60 comfortable; above ≈ 100 the O(S²) and O(S×P) paths become noticeable | Medium |

**Four problems will bite before the CPU does. All four are observed in the code:**

1. **Login is limited to 6 per minute per IP address** (`routes/api.php:114-117`, `throttle:6,1`, unauthenticated, so keyed by IP). A class of 30 behind one school NAT, or students behind mobile carrier CGNAT, needs about 5 minutes to log in. This is a functional capacity ceiling for classroom use, independent of hardware.
2. **Pre-deploy database backups are never pruned.** `deploy.yml` writes `storage/app/backups/pre-deploy-*.sql`, but `DbBackup::prune()` only deletes files matching `db-*.sql` (`DbBackup.php:274`). `--keep=10` therefore has no effect. Each push to `main` adds a full, uncompressed dump to the same 20 GB disk (29 pushes to `main` in the last 12 days). Disk use grows as **database size × number of deploys**.
3. **The admin dashboard scans the largest tables in full on every open.** It runs a `GROUP BY` over the whole history of `question_attempts ⋈ exercise_attempts`, plus unindexed `COUNT`s (`DashboardService.php:50-51, 144-155`). It is harmless today and becomes a multi-second, worker-holding query once there are millions of answer rows.
4. **Math Lab autosave is the most frequent request any single user makes.** It sends a `PATCH` of the whole document at most every 2.5 s while the user edits (`mathLabDocument.js:29`), with no rate limit. The instruments cost the server nothing; their autosave does.

---

## 1. Method, and how to read this report

### 1.1 Labels

Every statement in this report carries one of three labels.

- **[Observed]**: read directly in the code, configuration, migrations, local database statistics, or an existing test output. A `file:line` reference is given.
- **[Estimated]**: derived from observed facts by stated reasoning. These are not measurements.
- **[Assumed]**: a variable that cannot be known without production data or a load test, such as how often a student answers or how many users are online in the evening. Each assumption is stated where it is used.

### 1.2 What was inspected

- Documentation map (`docs/README.md`), deployment documentation (`docs/deployment/*`), and the `ci.yml` and `deploy.yml` workflows.
- All of `apps/api/routes/api.php`: about 200 endpoints across public, student, teacher (40) and admin (85) routes.
- The middleware, rate limiters, services and models under `apps/api/app/Domain/*`.
- All 88 migrations.
- Configuration: `session`, `cache`, `queue`, `logging`, `sanctum`, `filesystems`.
- The frontend API client, pollers, autosave, the lesson runtime, the practice player, Math Lab, the notebook, the teacher UI and the admin UI.

### 1.3 Existing measurements reused

These are the only measurements available. None of them are production measurements.

- `apps/api/storage/logs/mastery-scale.json`, written by `tests/Feature/Scale/MasteryScaleTest.php`: the **answer-write path costs 11 queries and about 5–6 ms of database time**. This stays constant as the exercise bank grows from 15 to 2,500 exercises. It was measured on a developer machine. [Observed]
- `tests/Feature/Scale/ClassroomInsightScaleTest.php:84`: teacher reads (map, attention, point, dossier, progress, interventions) must run **≤ 45 queries whatever the class size** (tested with 5 and 40 students). So there is no N+1 query pattern on the teacher side. Row volume still grows; see §5. [Observed]
- Local MySQL `information_schema`, read-only, from the demo dataset: 28 users, 1,563 evidence rows, 43 Math Lab documents. These numbers calibrate bytes per row (§7.6). [Observed]

### 1.4 What was not done

No load test. No connection to production. No `EXPLAIN` on production data. No measurement of PHP memory on the host. Every throughput figure below is therefore an estimate.

---

## 2. Hosting baseline and one discrepancy

| Resource | Value | What it means for this application |
|---|---|---|
| CPU | 1 core | Every PHP request, and possibly MySQL, shares one core. **This is the primary constraint** (§7.1). |
| RAM | 2,048 MB | Caps simultaneous PHP processes at about 30–40 (§7.2). |
| PHP workers | 40 | Cannot all do CPU work at once on 1 core (§7.4). |
| Max processes | 80 | Includes cron and SSH during a deploy. |
| Disk | 20 GB | Holds code, stale assets, uploads, logs and **unpruned backups**. The database probably counts toward it too [Assumed]. |
| Inodes | 400,000 | Vendor has about 10k files; each SPA build has 710; stale builds accumulate (§7.6). |

**Discrepancy [Observed].** The repository describes `smarter-academy.fr` as the French product on another server and IP (`docs/deployment/DZ_FIRST_DEPLOYMENT.md:21`, "IP ≠ celle du produit français"). `deploy.yml:189-203` refuses to deploy if `.fr` appears in its variables.

As instructed, this report treats both domains as **sharing one plan**. The `.fr` code is not in this repository, because the French lessons were deleted on 2026-09-25. **Its load therefore cannot be audited here.** All capacity figures below assume the `.fr` site uses between 10% and 30% of the plan [Assumed]. If `.fr` is busy, reduce every figure proportionally.

---

## 3. What runs where

This split matters most for capacity: most interactive work never reaches the server.

| Feature | Browser only | API reads | API writes | Frequency [Observed cadence] |
|---|---|---|---|---|
| Lesson content, modules, manipulations | **Yes.** Bundled JS chunks (`import.meta.glob`), drawn in SVG | `learning-profile?lesson=` on the lesson index and Knowledge Map | `PUT /lessons/{code}/progress` | PUT debounced 3 s (`progressQueue.js:24`); visits throttled to one per 60 s per module (`useProgress.js:91`) |
| Classroom Mode (وضع القسم) | **Yes, entirely.** No fetch in `lessons/common/classroom/*` | — | — | none |
| Knowledge Map | Structure and visibility from `knowledge.jsx` and localStorage | Mastery dots from `learning-profile` | — | on each open (no cache) |
| Practice exercises | Exercise JSON bundled; display only | overview, next | open question, answer (graded **on the server**), hint, completion | **About 3–4 requests per question** (`PracticeSession.jsx:118,234,292,311,348`) |
| Final lesson test | Display | final-test-attempt, then profile and recommendations | **1 POST evidence per question** plus 1 PUT | once per submission |
| Daily challenge (student) | Timer | today | start, next, answers, complete (server-timed) | about 2 requests per question, synchronised across a class |
| Math Lab (14 instruments: mafs, three.js, Nerdamer, compute-engine, Excalidraw) | **Yes, entirely.** No tool code calls the API | documents list/get, files, blobs | POST create; **PATCH the whole document** | PATCH ≤ every 2.5 s while editing; one in flight at a time (`useMathLabDocument.js:73-81`) |
| Notebook (كرّاسي) | Draft in localStorage (300 ms); export = `window.print()` | notes list (20 per page), search | POST/PATCH on **explicit Save only** | rare |
| Teacher dashboards | — | 1–3 GETs per page or tab | CRUD | on mount; no polling |
| Teacher challenge projector | — | `GET …/daily-challenge/display` | — | **every 20 s, even in a hidden tab** (`ChallengeDisplayPage.jsx:44`) |
| Admin | — | paginated lists, dashboard, analytics | CRUD | on mount or filter change |
| Content availability | — | `/content/availability[/public]` | — | on start, and on tab refocus at most once per 30 s, **for every visitor including anonymous ones** (`ContentAvailabilityContext.jsx:116-125`) |

**Not present [Observed].** No WebSocket, SSE, Pusher or Echo. No AI or LLM API. No server-side PDF (dompdf/snappy). No image processing (GD/Imagick). No zip. No server-side Nerdamer. The only outbound HTTP is Stripe (throttled 10/min) and Google OAuth, both synchronous. Static assets are served by the web server, not PHP. Hashed assets are cached for one year (`apps/web/public/assets/.htaccess`).

---

## 4. Backend cost map

### 4.1 Fixed overhead on every authenticated request [Observed]

| Cost | Source |
|---|---|
| Laravel boot **without** `config:cache` / `route:cache`. This is deliberate: `deploy.yml:396-399` keeps `.env` editable, so config and about 200 routes are rebuilt on every request. | `deploy.yml:547-555` |
| Sanctum: SELECT token + SELECT user + **UPDATE `personal_access_tokens.last_used_at` on every request** | `vendor/laravel/sanctum/src/Guard.php:167-171` |
| Possibly also a **database session** read and write on every request: `statefulApi()` is enabled and the SPA shares the API's domain, although auth uses Bearer tokens. The production `SANCTUM_STATEFUL_DOMAINS` value decides it [Assumed]. | `bootstrap/app.php:19`, `config/session.php:21` (`SESSION_DRIVER=database`) |
| `CACHE_STORE=database`: each `Cache::` call and each `throttle:` hit is SQL on the `cache` table | `config/cache.php:18` |
| No global API throttle. Only about 20 routes are rate-limited; practice answers and the Math Lab PATCH are not. | `bootstrap/app.php`, `routes/api.php` |

**[Estimated]** A trivial authenticated request, such as `/auth/me`, costs about 3–5 queries and roughly **15–30 ms of PHP CPU** on shared-hosting hardware, assuming OPcache is enabled. The repository does not mention OPcache [Assumed].

### 4.2 Endpoint classes [Observed query paths; Estimated costs]

| Class | Endpoints | Queries | Est. PHP CPU |
|---|---|---|---|
| **Light** | `/auth/me`, logout, `/students/me/lesson-progress`, notebook list/show, Math Lab list/show/quota, curriculum reads, `/billing/plans` | 3–8 | 15–30 ms |
| **Medium, the student hot path** | `POST /practice/sessions/{id}/answers` (≈ 18–25 queries in one transaction: evidence insert, pivot, progress upsert, transition; mastery is **incremental**, not replayed, `ProgressEngine.php:221-246`) · `POST …/questions` (≈ 8–10) · `GET /lessons/{c}/practice/overview` (**N `cache`-table reads, one per exercise in the lesson**, `LearningPointPracticeProgress.php:40-45`) · `POST /lessons/{c}/evidence` (≈ 20–30) · `PUT …/progress` (10–15, plus ≈ 4 per newly completed module) · daily challenge answer (25–35, row locks) · Math Lab PATCH (gate 2–7 queries + `json_encode` of up to 2 MB + blob UPDATE) · `/content/availability` (8–15 **+ N+1 over unpublished lessons**, `ContentAccess.php:299-306`) | 10–35 | 30–80 ms |
| **CPU-bound but throttled** | login and register (bcrypt cost 12, ≈ 100–250 ms CPU), `throttle:6,1` | few | 100–250 ms |
| **Blocking on I/O** | register, resend verification, classroom invitation, activation-code email: **mail is sent synchronously** (no `ShouldQueue`, `Notifications/*.php`) · Stripe checkout/portal · Google callback | few | low CPU, **holds a worker for the network round-trip** |
| **Grows with class size or history (teacher)** | attention, learning map, roster/progress, student snapshot, interventions, learning-point detail (§5.2) | ≤ 45, constant | 20 ms → several hundred ms as history grows |
| **Grows with the whole platform (admin)** | dashboard, analytics, teacher list (N+1), student list sorted by lessons completed (§5.3) | 25 → ~1,000 | seconds at scale |
| **Background** | `ReplayMasteryJob` (admin-triggered, database queue, up to 1 h in-process). `smarter:mastery:verify` daily 03:30 (`ORDER BY RAND()` over progress). **No cron or worker setup is documented**, so both probably never run in production [Assumed]. | — | a full core while running |

---

## 5. Database audit

### 5.1 Tables that grow with student activity [Observed schema; Estimated sizes]

**Size calibration.** From local `information_schema`, data plus indexes per row:

| Table | Bytes per row |
|---|---|
| `learning_evidence` | ≈ 800 B (7 secondary indexes) |
| `question_attempts` | ≈ 425 B |
| `learning_point_state_transitions` | ≈ 330 B |
| `learning_evidence_learning_point` | ≈ 177 B |
| `exercise_attempts` | ≈ 240 B |

InnoDB overhead inflates these figures on small tables; at scale they will probably be 60–80% of the values shown.

**Per answered question, about 1.5–2 KB is written across 4–6 tables.** The tables are append-only and **nothing prunes them**.

| Table | Grows with | Notes |
|---|---|---|
| `learning_evidence` (+ pivot) | every answer: practice, final test, daily challenge | `answer` JSON validated only as `nullable\|array`, with no size cap (`PracticeAnswerController.php:94`) |
| `question_attempts` | every question **opened** (a new UUID on each open) | `submitted_answer` JSON, no cap |
| `learning_point_state_transitions` | up to one per evidence row per learning point, **only when state changes** | locally ≈ 1 per evidence row |
| `student_learning_point_progress` | **bounded**: students × learning points | updated on every answer |
| `hint_events` | ≤ 3 per question | |
| `math_lab_documents` | Math Lab use | `data` JSON: whiteboard cap **2,000,000 B**; other instruments 8–120 KB (`MathLabTools.php:25-166`). Local average is 6 KB and local maximum 20 KB. Free tier: 10 new documents per month. |
| `math_lab_files` | uploads | metadata in the database; bytes **on disk** under `storage/app/private/math-lab/{user}`, ≤ 1 MB × 50 per user |
| `notebook_notes` | notes | `content` + `content_text` ≤ 12,000 characters each |
| `personal_access_tokens` | **one per login**, 30-day expiry, **never pruned** | UPDATEd on every request |
| `sessions`, `cache` | traffic | pruned only by lottery or on read |
| `daily_challenge_*` | per student per day | 1 attempt + N (default 5) answers + N evidence |

### 5.2 Teacher queries: where cost grows [Observed]

The number of queries is constant (the test guarantees it). **The number of rows read is not.** Notation: S = students in the class, P = learning points in the grade scope, E and QA = a student's lifetime evidence and question-attempt rows, N = all students on the platform.

| Read | Complexity | Location |
|---|---|---|
| Roster / progress: **unbounded** `question_attempts ⋈ exercise_attempts ⋈ practice_sessions GROUP BY user` + `MAX(submitted_at)` over lifetime evidence (the index `(user_id, lesson_id)` does not cover `submitted_at`) | **O(S × (QA + E))**; grows every week of the school year | `ClassroomProgressService.php:253-263`, `ClassroomFacts.php:343-365` |
| Attention « تستحقّ نظرة »: S × P progress rows hydrated into PHP, plus nested S × P loops | O(S × P) rows and CPU + O(S × E) | `ClassroomFacts.php:132-298`, `AttentionSignals.php:471-544` |
| Student snapshot « لمحة »: **loads the whole class's facts to display one student** | O(S × P) per student view; O(S² × P) if the teacher opens each student in turn | `ClassroomInsightService.php:54-64` |
| Intervention measure: raw evidence rows since the oldest open intervention on the page, filtered in PHP | O(I × S × E_since) | `ClassroomInterventionService.php:263-338` |
| Learning-point detail: `trajectory()` does `in_array` inside an 8-week × S loop | O(8·S²) CPU; `items()` may read that point's evidence **platform-wide**, depending on the query plan | `ClassroomLearningPointService.php:586-598, 630-671` |
| Learning map `distribution()` | O(P × S) with a good plan; **O(P × N)** if MySQL drives the join from `(learning_point_id, status)`. Needs an `EXPLAIN` in production. | `ClassroomLearningPointService.php:547-571` |
| Challenge projector (20 s poll): `results()` + **two** `ranking()` passes, each running a Carbon loop of up to 366 days per standing row | O(2 × S × 366) per poll, unthrottled, uncached | `ClassDailyChallengeService.php:118-285`, `DailyChallengeLeaderboard.php:326-364` |
| A student finishing the challenge: `rankOf()` twice **inside a locked transaction**, recomputing the full class ranking | O(S²) when the whole class finishes together | `DailyChallengeService.php:515, 560` |
| Joining a class: `lockForUpdate` on the classroom **and on the teacher's `users` row** | joins to the same teacher run one at a time; a whole class entering a code at once waits in a queue | `ClassroomMembershipService.php:254-255` |

**Nothing on the teacher or admin side is cached across requests.** The only cross-request caches are practice content and assessment-item counts [Observed].

### 5.3 Admin queries: where cost grows with the whole platform [Observed]

| Query | Complexity | Location |
|---|---|---|
| Dashboard "low success" alert: `GROUP BY exercise_id` over **all** `question_attempts`, on every open, plus full `COUNT`s of `question_attempts` and `exercise_attempts` | O(all answers ever) | `DashboardService.php:50-51, 144-155` |
| 5–6 `COUNT`s on `users WHERE role=…`; **`users.role` has no index** | O(N) each | `DashboardService.php:37-41`, `AnalyticsService.php:282-351` |
| Analytics date-range counts on columns with no leading index (`question_attempts.submitted_at`, `learning_evidence.submitted_at`, `practice_sessions.started_at`, `exercise_attempts.*`, `student_lesson_progress.*`, `users.created_at`) and `GROUP BY DATE(col)` | full scans | `AnalyticsService.php:282-573` |
| `countCompletedModules()` hydrates **every** matching `StudentLessonProgress` model into PHP memory | memory O(rows) | `AnalyticsService.php:548-553` |
| `learningPoints()`: 6 correlated `COUNT`s per learning point over the whole progress table | O(P_total × N) | `AnalyticsService.php:480-531` |
| Teacher list: `summaryFor()` per row, about 10 queries each | **≈ 1,000 queries** for a 100-row page | `TeacherService.php:181-199` |
| Student list sorted by lessons completed | subquery evaluated for all N | `StudentService.php:24-67` |
| `LIKE '%…%'` search (students, teachers, subscriptions, classrooms) | full scans | several services |

### 5.4 Missing indexes [Observed]

- `users.role`
- a standalone index on `question_attempts.submitted_at`
- a standalone index on `learning_evidence.submitted_at`
- a covering `(user_id, lesson_id, submitted_at)` on `learning_evidence`
- `exercise_attempts.started_at` / `completed_at`
- `practice_sessions.started_at`
- the date columns of `student_lesson_progress`
- `users.created_at`
- `lessons.code` on its own; only `UNIQUE(chapter_id, code)` exists, while `where('code')` runs on almost every practice request. The table is tiny, so impact is low.

**The student write and read paths are well indexed** [Observed]. The gaps affect admin analytics and teacher history aggregation.

---

## 6. Usage scenarios

The rates below are **[Estimated]**. They multiply the observed request cadence by an **[Assumed]** human pace: a practice question every 30–60 s, a lesson module every 1–3 min, and a teacher click every 15–30 s.

### Scenario A: lesson consumption

1. **Login and home: about 7 requests.** These are `/auth/me`, `/content/availability`, `/student/study-context`, `/students/me/lesson-progress`, `learning-profile`, `/daily-challenge` and diagnostic. Plus the login itself, which costs bcrypt, about 150–250 ms CPU.
2. **Inside a lesson: no read request when moving between modules.** Manipulations cost nothing. Progress is saved as a small debounced PUT; the Knowledge Map or lesson index adds one GET.
3. **Steady state: ≈ 0.01–0.02 req/s per student, mostly light and medium requests.**
4. **Server load: very low.** A single core can carry **several hundred** students who are only reading lessons [Estimated].
5. The real cost is the **start burst**: when a whole class logs in at once, the per-IP login throttle stops it before the CPU matters.

### Scenario B: exercise-heavy session

Each question makes these requests:

- open (≈ 8–10 queries)
- answer (≈ 18–25 queries, one transaction, 4–6 rows written)
- overview **re-fetched after every answer** (`PracticeSession.jsx:311`), with N cache-table reads
- next or completion about every second question

This comes to **≈ 3.5–4 requests per question** at ≈ 40–60 ms average CPU per request, i.e. **≈ 0.06–0.13 req/s per student**, **5–10× Scenario A** per user, and **about 1.5–2 KB of permanent database growth per question**.

**Capacity: ≈ 100–180 students practising at the same time, if they are not synchronised** [Estimated, Low–Medium].

### Scenario C: one teacher supervising

- Dashboard: about 15 queries, cheap.
- Class detail and Overview tab: **3 parallel heavy GETs** (attention, learning map, interventions; `OverviewTab.jsx:30-35`).
- Students tab: an unbounded history aggregate.
- Each student snapshot recomputes the whole class.

For a class of 30 with P ≈ 32 (today's single unit):

- **Early in the year [Estimated]:** each read costs tens of milliseconds.
- **Later in the year [Estimated]:** with a full-year 4AM curriculum (P possibly ≈ 250–350 [Assumed]) and ≈ 2,000–3,000 evidence rows per student, a snapshot hydrates ≈ 10,000 progress rows and aggregates ≈ 100,000+ history rows. That is **≈ 150–500 ms of CPU and database time per click**.

### Scenario D: many teachers at once

- Teacher reads are the **most expensive per request** of anything a non-admin does.
- They are unthrottled and uncached, and their cost grows with the class's history.
- **Estimated:** ≈ 20–40 teachers actively clicking through analytics at the same time early in the year, falling to ≈ 10–20 by the end of the year, if nothing else is loading the server.
- A projector display adds ≈ 0.05 req/s per open screen, **including hidden tabs**. Ten screens left open all day cost about 30 requests per minute, around the clock.

### Scenario E: Math Lab

- **All computation is local:** plotting, three.js, the CAS, Excalidraw, probability simulation. None of it touches the server [Observed].
- **Server cost comes only from persistence:**
  - Opening a document costs about 2 GETs.
  - While editing, a **PATCH of the whole document** is sent at most every 2.5 s. Each PATCH runs the feature-access gate (2–7 queries) plus a `json_encode` of up to 2 MB and a blob UPDATE. Nothing throttles it.
  - A student drawing continuously on the whiteboard produces up to ≈ 0.4 req/s, **3–6× a practising student**. Typical intermittent editing produces ≈ 0.05–0.2 req/s [Estimated].
- **Risk:** a whole class of 30 using the whiteboard together produces ≈ 3–12 req/s, **which alone can fill the whole comfortable budget**.

### Scenario F: Notebook (كرّاسي)

- It is a rich-text HTML editor. The draft is stored in localStorage, and **the server write happens only on an explicit Save**.
- Export is `window.print()`.
- No server-side document generation, no files, no AI, no external API [Observed].
- The `document_generation` quota exists in the access tables, but no server-side generator was found.
- **Server impact: negligible.** Growth is ≤ 12,000 characters × 2 columns per note, with 50 new notes per month on the free tier.

### Scenario G: admin dashboard

- Admins are few, but **each dashboard open scans the whole answer history** (§5.3).
- **Estimated:** at around 1 million `question_attempts` rows (≈ 500 active students × 1 year [Assumed]), the dashboard takes 1–5 s. At 10 million rows it takes tens of seconds. Each open holds a PHP worker and the database for that long, and may hit `max_execution_time`.
- The analytics pages behave the same way. The teacher list page issues about 1,000 queries.
- This is the **first thing to become slow as data grows**. It does not affect students unless it runs during a peak, where it competes for the same core.

---

## 7. Resource estimation

### 7.1 CPU: the binding constraint [Estimated]

- **Mostly client-side, so no CPU:** lessons, manipulations, Classroom Mode, all Math Lab computation, notebook drafts, Knowledge Map layout.
- **Server CPU is spent on:**
  - framework boot, which is costly here because config and routes are not cached;
  - Eloquent hydration;
  - answer grading (`AnswerEvaluator`, rationals; cheap);
  - JSON encode and decode of Math Lab documents and the database cache;
  - bcrypt on login;
  - teacher and admin aggregation in PHP (S × P loops, the Carbon loops in the ranking);
  - MySQL itself, if it runs on the same core [Assumed].
- **Weighted average across realistic student traffic:** ≈ 35–60 ms of CPU per dynamic request. On 1 core that gives a theoretical 17–28 req/s at 100% utilisation.
- After leaving headroom for `.fr`, MySQL, cron and deploys (each deploy runs a **PDO dump through PHP**, because `proc_open` is disabled, `DbBackup.php:110-117`), a **comfortable sustained budget is ≈ 6–12 dynamic req/s**.
- **Confidence: Low–Medium.** The per-query costs are measured (§1.3), but per-request CPU on this host, OPcache status and the location of MySQL are unknown.

### 7.2 RAM [Estimated]

- A PHP 8.4 Laravel 13 worker is typically ≈ 40–70 MB resident. On a 2 GB plan, **≈ 30–35 PHP processes fit before memory runs out**, which is below the 40-worker limit.
- **Memory-heavy paths:**
  - a Math Lab PATCH near the 2 MB cap (decode, validate, re-encode: ≈ 10–20 MB)
  - teacher attention hydrating S × P rows (≈ 10–30 MB late in the year)
  - admin `countCompletedModules()` (unbounded)
  - the PDO backup (chunked, bounded)
- Memory is **not** the first limit under normal traffic. It becomes the limit only when the CPU is already saturated and requests pile up.

### 7.3 PHP workers [Estimated]

Using Little's law (requests in flight = rate × duration): at 10 req/s × 80 ms, fewer than 1 request is in flight on average. **Normal traffic will never approach 40 workers.**

Workers saturate only when requests become slow:

1. **CPU saturation:** once the core is at 100%, every request stretches, in-flight requests multiply, and the plan's process and entry limits trip. Visible as 503/508 errors or "resource limit reached".
2. **Slow queries:** admin dashboard and analytics, and teacher history aggregates late in the year.
3. **Synchronous I/O:** SMTP on register, invitation and activation (1–3 s each); Stripe; Google.
4. **Lock waits:** daily-challenge finalisation (`lockForUpdate` + ranking) when a whole class finishes; class joins serialised on the teacher row.

### 7.4 One core vs 40 workers

**The CPU is the practical limit, not the worker count.** Forty workers on one core do not give 40 requests' worth of computation. They time-slice the same core, so the extra workers only help while requests wait on I/O (database, SMTP, Stripe). Under CPU-bound load, more than about 2–4 in-flight requests just raise everyone's latency.

The 40-worker limit therefore acts as a **queue depth**. When it is reached, the CPU has already been saturated for some time, or something is blocking on I/O [Estimated, Medium].

### 7.5 Database [Observed patterns; Estimated effects]

- **Write amplification per request:** the token UPDATE, possibly a session UPDATE, the cache-table reads, and a `throttle` write where applicable. MySQL handles this easily at 10 req/s, but it adds latency on shared MySQL.
- **Growth:** ≈ 1.5–2 KB per answered question, append-only. Assuming an active student answers ≈ 1,500–2,700 questions a year (practice plus final tests plus 5 daily-challenge questions a day on school days) [Assumed], that is **≈ 3–5 MB per active student per year**, plus Math Lab documents (≈ 0.1–1 MB typical; up to ≈ 20 MB per month worst case on the free tier).
- **Likely database bottlenecks, in order:**
  1. admin full scans
  2. teacher unbounded history aggregates (`lastActivity`, roster)
  3. the database cache table as a hot spot
  4. `ORDER BY RAND()` in the nightly verify (if cron ever runs)
  5. **the deploy backup**: the PDO fallback uses `chunk(1000)` with offset pagination (`DbBackup.php:223`), which degrades roughly quadratically on large tables and loads the production core for the whole backup

| Scale (active students) | Evidence rows / year [Est.] | Database growth / year [Est.] |
|---|---|---|
| 500 | ≈ 1–1.4 M | ≈ 1.5–2.5 GB |
| 1,000 | ≈ 2–2.7 M | ≈ 3–5 GB |
| 5,000 | ≈ 10–13 M | ≈ 15–25 GB |

These figures assume heavy usage. For light usage, divide by 3–4.

### 7.6 Disk and inodes [Observed sources; Estimated growth]

| Consumer | Size and growth | Notes |
|---|---|---|
| Application code | ≈ 55 MB vendor (`--no-dev`) + 5 MB API + 21 MB SPA | fixed |
| **Stale SPA assets** | each deploy adds its changed hashed chunks; **`rsync` has no `--delete`** | ≈ 1–5 MB and 20–200 files per deploy [Est.]. At the current pace (≈ 60–70 deploys a month) that is **≈ 0.1–0.35 GB and 1.5k–14k inodes a month**. |
| **Pre-deploy backups** | **one full uncompressed dump per deploy, never pruned** (§0, item 2) | ≈ database size × number of deploys. With a 100 MB database, 60 deploys = 6 GB. **Once the database reaches a few hundred MB, this alone fills 20 GB within weeks.** |
| Database | §7.5 | probably counts against the 20 GB [Assumed]; check whether the plan caps database size |
| `laravel.log` | single file, **no rotation**, `LOG_LEVEL=debug` by default | 3.3 MB locally already. Production level unknown [Assumed]. |
| `mastery` log | daily, 30 days kept | bounded |
| Math Lab uploads | ≤ 1 MB × 50 files per user, on disk | ≈ 0–2 MB per active user [Assumed typical] |
| `.fr` site | unknown | shares the quota [Assumed] |

**How long 20 GB lasts [Estimated]:**

- **As the code stands:** the backup multiplier dominates. With about 1,000 active students, the database reaches ~0.5–1 GB within a school term, and **the disk fills within weeks of that point** under the current deploy frequency.
- **If backups are pruned or kept off-host** (not done; this audit is read-only): 20 GB covers ≈ 2–3 years at 1,000 active students, and **under a year at 5,000**.
- **Inodes (400k):** vendor ≈ 7–10k plus stale builds plus uploads. Comfortable for ≈ 1–2 years at the current deploy pace, then stale assets become the concern.

---

## 8. Concurrency: definitions and figures

| Term | Meaning in this report |
|---|---|
| **Authenticated (registered) users** | accounts that can log in. They cost only disk while offline. |
| **Active users** | used the platform in a given window: daily active users (DAU) or weekly active users (WAU). |
| **Concurrent active users** | users generating requests within the same ~5-minute window: reading, practising, drawing. |
| **Request concurrency** | PHP requests executing at the same instant. Typically **1–5% of concurrent active users**, because students spend most of their time thinking, reading or manipulating in the browser. |

**Assumed traffic mix:** 50% reading lessons, 35% practising, 10% Math Lab, 5% teachers. This gives **≈ 0.05–0.07 req/s per concurrent active user** [Estimated].

| Concurrent active users | Dynamic req/s [Est.] | Request concurrency [Est.] | Expected state |
|---|---|---|---|
| 25 | ≈ 1.5 | < 1 | Idle. p95 latency set by boot and query count (≈ 100–250 ms). |
| 50 | ≈ 3 | ≈ 1 | Comfortable. |
| 100 | ≈ 6 | ≈ 1–2 | Comfortable, with some headroom for `.fr` and admin. |
| 150 | ≈ 9 | ≈ 2–4 | **Upper comfortable bound.** A heavy admin query or a deploy backup during this window causes visible slowdowns. |
| 250 | ≈ 15 | CPU ≈ 100% | **Strained.** Latency grows non-linearly; process limits start to trip; login bursts fail. |
| 500 | ≈ 30 | above the core | **Overloaded.** 503/508 errors, timeouts; the 40-worker and 80-process limits are reached. |

**Confidence: Medium–Low.** The request cadences are observed. Per-request CPU and human pacing are estimated. No production traffic data exists.

**Synchronised class sessions are the real peak.** A teacher who starts the daily challenge or a practice session for 30 students at once produces:

- a login burst, stopped by the per-IP throttle;
- ≈ 3–6 req/s for the class during a timed challenge;
- an O(S²) ranking at the finish, under locks.

**Estimated:** 3–5 such classes at the same moment fill the comfortable budget.

---

## 9. Registered-user scale

**Assumptions:** evening peak concurrency is ≈ 3–6% of registered users, and ≈ 8–10% during exam periods. Weekly active users are ≈ 30–40% of registered users.

| Registered users | Peak concurrent [Est.] | Assessment |
|---|---|---|
| **1,000** | 30–60 | **Comfortable on CPU.** Real issues: the per-IP login throttle in classrooms; unpruned backups; stale assets; debug logging if enabled. |
| **3,000** | 90–180 | **Comfortable most of the time; strained at exam peaks or during synchronised class use.** Database ≈ 3–5 GB/year: disk depends on fixing the backups. Teacher history queries start to show in the second term. |
| **5,000** | 150–300 | **Around the practical limit.** Evening peaks exceed one core. The admin dashboard takes seconds. The database's yearly growth approaches the disk size. **Reassess before this point.** |
| **10,000** | 300–600 | **Beyond one core and 2 GB.** Needs several cores, a tuned or dedicated MySQL, cache and sessions outside MySQL, a real queue worker, and more disk. |
| **25,000** | 750–1,500 | **Well beyond this plan.** Also needs the index and caching fixes (§5.4) and possibly a separate database server. |

---

## 10. Student, teacher and class capacity

### Students [Estimated]

| | Estimate | Confidence | Why |
|---|---|---|---|
| Registered students | ≈ 2,000–3,500 comfortable; ≈ 5,000 practical ceiling | Low–Medium | derived from the concurrency budget and peak ratios; disk dependency noted |
| Active students (weekly) | ≈ 800–1,500 | Low | depends on how often they practise |
| Concurrent students | ≈ 80–150 mixed; ≈ 100–180 if all are practising but unsynchronised | Medium–Low | observed cadence × estimated CPU |
| Students logging in together from one IP | **6 per minute** | **High** | `throttle:6,1`, keyed by IP [Observed] |

### Teachers [Estimated]

| | Estimate | Confidence | Why |
|---|---|---|---|
| Registered teachers | hundreds to low thousands; not a limit (small rows; seats counted with a cheap `COUNT DISTINCT`) | Medium | schema and query review |
| Active teachers | limited by the **students they bring**, not by their own reads | Medium | |
| Concurrent teachers browsing analytics | ≈ 20–40 early in the year, ≈ 10–20 late | Low | reads grow with S × history; no measurements |
| Open projector screens | ≈ 10–30 is fine; each costs ≈ 3 requests per minute, **including hidden tabs** | Medium | observed 20 s poll |

### Classes [Estimated]

| | Estimate | Confidence |
|---|---|---|
| Number of classes stored | no structural limit; plans say classes are unlimited, and rows are trivial. Thousands are fine. | Medium–High |
| Students per class | ≈ 40–60 comfortable. The query count is constant (tested at 40), but ranking is O(S²), the snapshot O(S × P), the trajectory O(S²). Above ≈ 100 these become noticeable. | Medium |
| Classes live at the same moment | ≈ 5–8 unsynchronised; **≈ 3–5 in a synchronised timed activity** | Low–Medium |
| Class joins | serialised on the teacher's row; 10 per minute per user and 60 per hour per IP. A 30-student class joining from one school IP fits, but 3 classes from the same school within an hour do not. | High (limits) / Medium (effect) |

---

## 11. Capacity table

| Scale | Registered users | Typical peak concurrent users | Expected state on the current plan | Main concern |
|---|---:|---:|---|---|
| Level 1 | ≤ 1,000 | 30–60 | Comfortable | Per-IP login throttle in classrooms; unpruned deploy backups; stale assets |
| Level 2 | 1,000–3,000 | 60–180 | Comfortable, strained at peaks and in synchronised classes | Disk (backups + ≈ 3–5 GB/year of evidence); teacher history aggregates; admin dashboard getting slow |
| Level 3 | 3,000–5,000 | 150–300 | At the practical limit; evening and exam peaks saturate the core | CPU; admin full scans (seconds); database growth close to the disk size |
| Level 4 | 5,000–10,000 | 300–600 | Insufficient | CPU, RAM, disk; database cache and session tables become hot spots; no queue worker |
| Level 5 | 10,000–25,000 | 600–1,500 | Far beyond | Needs a multi-core plan, a tuned or dedicated database, Redis, a worker, and index and caching work |

---

## 12. Bottleneck ranking (current architecture)

| # | Bottleneck | Evidence | Label | Hits at |
|---|---|---|---|---|
| 1 | **Per-IP login throttle (6/min)**, plus class-join and activation limits keyed by IP | `routes/api.php:114-117`, `AppServiceProvider.php:142-170` | Observed | the first real classroom session |
| 2 | **Unpruned pre-deploy backups on the same disk** | `deploy.yml:421-424`, `DbBackup.php:269-285` | Observed | once the database reaches a few hundred MB |
| 3 | **CPU (1 core)**, with every request paying boot without config or route cache, Sanctum's write, and database-cache reads | §4.1 | Observed causes, estimated threshold | ≈ 150–250 concurrent active users |
| 4 | **Admin dashboard and analytics full scans** | §5.3 | Observed | ≈ 10⁶ answer rows (seconds) |
| 5 | **Teacher history aggregates** (unbounded roster and last activity; the snapshot recomputes the whole class) | §5.2 | Observed | the second school term, large classes, many teachers at once |
| 6 | **Math Lab autosave**: unthrottled full-document PATCH every ≤ 2.5 s | `mathLabDocument.js:29` | Observed | a whole class on the whiteboard together |
| 7 | **Synchronised daily challenge**: O(S²) ranking inside locks; 20 s projector poll that never pauses | `DailyChallengeService.php:515,560`, `ChallengeDisplayPage.jsx:44` | Observed | several classes finishing at once |
| 8 | **Synchronous mail**, holding workers during registration or invitation bursts | `Notifications/*.php` | Observed | a class registering together, if SMTP is slow |
| 9 | **Database as cache and session store** (`cache`, `sessions`, throttles) | `config/cache.php:18`, `session.php:21` | Observed config; production values Assumed | above ≈ 10 req/s |
| 10 | **No scheduler or queue worker** (verify and replay never run; tokens and cache never pruned) | no cron documented | Assumed (production cron unknown) | slow table growth |
| 11 | **Stale-asset inode growth** | `rsync` without `--delete` | Observed | 1–2 years |

**Not bottlenecks [Observed]:** notebook generation (none exists), external AI (none), server-side Math Lab computation (none), real-time channels (none), static asset bandwidth (served by the web server with year-long cache headers).

---

## 13. Load testing: what, how, and when

**Can it be load-tested here?**

- Functionally yes, on the local stack: MySQL and the QA fixtures exist. But `php artisan serve` is single-threaded and the hardware differs, so **local numbers do not transfer** to the plan.
- A meaningful test needs **the same plan type**. The production plan is shared with `.fr`, so a test there would degrade production. Use a staging copy on an identical plan, or a quiet window with the owner's approval.
- **Test harness requirement:** because login is limited to 6 per minute per IP, the harness must **create tokens once and reuse them**. It must not log in per virtual user.

**Scenarios, each with realistic think time:**

1. Lesson reader: start burst, then a progress PUT every 60–120 s.
2. Practice loop: open → answer → overview, every 30–60 s.
3. Synchronised class: 30 virtual users start the daily challenge at the same second, answer, and finish, while a projector poll runs.
4. Math Lab: whiteboard PATCH every 2.5 s with a 20 KB and a 500 KB document.
5. Teacher: overview (attention, map, interventions) → roster → 5 student snapshots, on a class **seeded with a year's history** (e.g. 30 students × 2,500 evidence rows each).
6. Admin: dashboard and analytics against a database seeded with 1M and then 5M `question_attempts` rows.
7. Mixed: 50/35/10/5 %, ramping 10 → 25 → 50 → 100 → 150 → 200 → 250 virtual users, 10 minutes per step.

**Metrics to watch:**

- hPanel / CloudLinux LVE: CPU %, entry processes (EP) and process-count (NPROC) faults, physical memory (PMEM) and I/O faults
- p50 and p95 latency per endpoint
- 5xx, 503 and 508 rates
- MySQL: slow-query log, `Threads_running`, lock waits
- `cache` and `sessions` row counts
- disk and inode usage before and after

**Thresholds that mean "approaching the practical limit":**

- LVE CPU above 80% for more than 5 minutes, or any EP or NPROC fault
- p95 of `POST /practice/…/answers` above 800 ms, or of `/auth/me` above 400 ms
- error rate above 0.5%
- the admin dashboard slower than 3 s
- disk above 70% or inodes above 70%

---

## 14. Final recommendation

**1. Comfortable authenticated-user range:** ≈ **2,000–3,500 registered users** (≈ 800–1,500 weekly active). This assumes the backup-pruning and per-IP login issues are dealt with; until then, the practical limit is operational, not computational. *Confidence: Low–Medium.*

**2. Active and concurrent range:** ≈ **80–150 concurrent active users** comfortable, ≈ 150–250 strained, > 250 overloaded. Request concurrency ≈ 2–5. *Confidence: Medium–Low.*

**3. Students:** ≈ 100–180 practising at the same time if spread out; **3–5 whole classes** in a synchronised timed activity. Login from a shared IP is capped at **6 per minute** (*High*).

**4. Teachers:** the number of registered teachers is not a constraint. ≈ **20–40 teachers browsing analytics at the same time**, falling to 10–20 as the year's history accumulates. *Low.*

**5. Classes:** unlimited in storage; **≈ 40–60 students per class** comfortable; ≈ 5–8 live classes at once, or 3–5 synchronised. *Medium–Low.*

**6. Expected bottlenecks, in order:**

1. per-IP login throttle
2. unpruned backups on disk
3. single-core CPU
4. admin full scans
5. teacher history aggregation
6. Math Lab autosave
7. synchronised challenge ranking

**7. Warning signs that the plan is reaching its limits:**

- hPanel resource graphs showing CPU at 100% or EP/NPROC faults
- intermittent 503 or 508 errors at peak hours
- students reporting "too many attempts" at login in class (HTTP 429)
- the admin dashboard taking more than 3 s
- teacher Overview taking more than 1–2 s
- `storage/app/backups` growing after every deploy
- disk or inodes above 70%
- `laravel.log` above 100 MB
- the database above ~1 GB

**8. What to measure in production before deciding on infrastructure:**

- daily and weekly active users, and **peak concurrency by hour** (the evening peak and school-hour class peaks), which you can derive from `personal_access_tokens.last_used_at` or `users.last_activity_at`
- requests per second by endpoint, from the access log
- LVE CPU, EP and PMEM history
- p95 latency of the answer, overview, PATCH, attention and dashboard endpoints
- the size of `learning_evidence` and `question_attempts` and their monthly growth
- the size of `storage/app/backups`
- whether MySQL runs inside the account's CPU limit
- whether OPcache is enabled
- the production values of `SANCTUM_STATEFUL_DOMAINS`, `CACHE_STORE`, `SESSION_DRIVER` and `LOG_LEVEL`
- whether any cron exists
- how much of the plan `.fr` actually uses

**9. What type of upgrade addresses each bottleneck.** No specific provider is recommended.

| Bottleneck | Addressed by |
|---|---|
| CPU (1 core) | A plan with **2–4 dedicated vCPUs** (cloud or VPS). This is the largest lever, because the load is mostly PHP. Separating `.fr` onto its own resources also returns its share. |
| RAM / workers | Grows with the vCPU upgrade; 4 GB supports ≈ 60+ workers. Not needed on its own. |
| Database (admin and teacher aggregation) | Mainly a **software** fix: the missing indexes (§5.4), caching or precomputing dashboard statistics, time-bounded history queries. A dedicated or tunable MySQL (configurable buffer pool) helps above ≈ 5,000 users. |
| Cache, session and throttle traffic in MySQL | A host that offers **Redis or APCu**, or at least a file cache. Requires a VPS or cloud tier. |
| Synchronous mail, replay, nightly verify | A host with **cron and a persistent queue worker**. |
| Disk | Software first: prune or ship backups off-host, compress them, and delete stale assets. Then a larger disk or **off-host object storage** for backups and Math Lab uploads. |
| Login and join throttles by IP | **Configuration or code, not hardware:** key the throttle by email and IP, and raise the per-IP ceiling for classroom NAT. No upgrade fixes this. |

> **Scope reminder.** Nothing in this report was implemented. The software levers are listed because several of them (backup pruning, login throttle key, admin query caching, indexes, `CACHE_STORE`, pausing the projector poll in hidden tabs) would **delay the need for a hardware upgrade** more cheaply than a plan change. Deciding on them is the owner's call.

---

## Appendix A: evidence index

| Topic | Location |
|---|---|
| Routes, groups, throttles | `apps/api/routes/api.php` (login `:114-117`; teacher `:373-451`; admin `:455-617`) |
| Named limiters | `apps/api/app/Providers/AppServiceProvider.php:142-170` |
| Sanctum `last_used_at` write | `apps/api/vendor/laravel/sanctum/src/Guard.php:162-173` |
| Stateful API | `apps/api/bootstrap/app.php:19` |
| Answer path | `PracticeAnswerController.php:245`, `PracticeEvidenceRecorder.php:47-151`, `ProgressEngine.php:81-246` |
| Measured query counts | `apps/api/storage/logs/mastery-scale.json`, `tests/Feature/Scale/MasteryScaleTest.php`, `tests/Feature/Scale/ClassroomInsightScaleTest.php:84` |
| Overview re-fetch after each answer | `apps/web/src/pages/student/practice/PracticeSession.jsx:116-122, 311, 348` |
| Math Lab autosave | `apps/web/src/features/mathlab/mathLabDocument.js:29`, `useMathLabDocument.js:73-142` |
| Math Lab size caps | `apps/api/app/Domain/MathLab/MathLabTools.php:25-166`, `MathLabFilePolicy.php:17-21` |
| Projector poll | `apps/web/src/pages/teacher/ChallengeDisplayPage.jsx:44` |
| Teacher aggregates | `ClassroomProgressService.php:253-263`, `Insights/ClassroomFacts.php:132-365`, `Insights/AttentionSignals.php:471-544`, `ClassroomInsightService.php:54-64`, `ClassroomInterventionService.php:263-338`, `ClassroomLearningPointService.php:547-671` |
| Challenge ranking | `DailyChallengeLeaderboard.php:326-364`, `DailyChallengeService.php:471-566` |
| Admin scans | `Admin/DashboardService.php:37-155`, `Admin/AnalyticsService.php:282-573`, `Admin/TeacherService.php:181-199` |
| Backup pruning mismatch | `.github/workflows/deploy.yml:421-424` vs `apps/api/app/Console/Commands/DbBackup.php:269-285` |
| No config or route cache | `.github/workflows/deploy.yml:396-399, 547-555` |
| `rsync` without `--delete` | `.github/workflows/deploy.yml:288-339` |
| Cache, session, queue, log configuration | `apps/api/config/{cache,session,queue,logging,sanctum}.php`, `apps/api/.env.example` |
| Local table sizes | `information_schema.tables`, local database `smarter-academy-dz` (read-only query) |
| `.fr` described as a separate server | `docs/deployment/DZ_FIRST_DEPLOYMENT.md:21`, `.github/workflows/deploy.yml:189-203` |
