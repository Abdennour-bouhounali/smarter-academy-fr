# « فضاء الوليّ » — the parent link, real study time, closed garden

> Authoritative contract since 2026-10-22 (phase 1 of the « safe device » plan).
> The problem it answers: parents and teachers are afraid to hand a child an
> internet-connected laptop. The child can open other sites while « studying »,
> and nobody can tell real work from an open tab.

A web page cannot lock a device: it cannot see or block another tab. The
platform therefore answers in three layers, and claims nothing more:

| Layer | What it does | Where |
|---|---|---|
| **Prove the work** | measures REAL study time on the platform's own pages and shows a parent what was done, through a private link with no account | §2 link, §3 time, §4 report |
| **Lock the device** | explains how to restrict the device itself with the OS's own free tools | §6 guide `/himaya` |
| **Closed garden** | nothing inside the student space leads off the platform | §7 |

Phase 2 (study sessions with a goal, a teacher's live « on task » view, a
kiosk shortcut) and phase 3 (Android lock-task app, offline mode) are
**Planned**, not built.

## 1. How a parent sees the work — no account (owner, 2026-10-23)

Many Algerian parents are not at ease with accounts. Two accounts (the child's
and the parent's) plus a code to type was too much at the start. So **the
parent has no account**. They read through « رابط الوليّ », a private link,
which reaches them in one of two ways:

| Way | Who makes it | How the parent opens it |
|---|---|---|
| The child's link | the student, in « حسابي » ← « وليّ الأمر » (§2) | the child sends it (system share sheet, copy), or the parent scans the QR on the child's screen |
| « بطاقة الوليّ » | the teacher, « التلاميذ » ← « بطاقات الأولياء (QR) » (§2bis) | the parent scans the printed QR, for example at the parents' meeting |

Both lead to the same link of that child, and to the same page `/w/:token`.

The parent account (§2ter) still exists in the code, but nobody can sign up
for one any more.

## 2. « رابط الوليّ » — the private link

```text
student  /espace/profil › « وليّ الأمر »
         reads « ما سيراه وليّك » / « ما لن يراه أبدًا »
         taps « أوافق وأنشئ رابط وليّي »  → POST /student/parent-link {consent:true}
         gets https://smarter-academy.com/w/<32 chars> + its QR (shown on screen)
parent   opens /w/<token> from WhatsApp or the camera → the report, no login
```

**Storage.** `parent_access_links`:

- The token is found by `token_hash` (sha256) and kept encrypted
  (`token_encrypted`, Laravel `encrypted` cast). The student and the teacher can
  show the SAME link or QR again without replacing it.
- One live link per student. `POST` again (« رابط جديد ») revokes the previous
  one (`revoked_by = system`).
- `DELETE /student/parent-link` revokes it (`revoked_by = student`).
- Nothing is deleted.
- `consent_version` / `consented_at` record the student's gesture.
  `created_by` is `student` or `teacher`.

**The parent's page** — `pages/parent/ParentLinkPage.jsx`, public, outside
every shell, phone-first. The API is public and rate-limited by named limiters:
`parent-link` (60/min/IP) and `parent-link-pin` (10/min/IP/token). Two
anonymous `throttle:n,1` would share one key.

| Endpoint | Gives |
|---|---|
| `GET /parent-link/{token}` | `{child: {firstName, lastName, grade}, pinSet, unlocked}`, and counts an opening (at most once per 10 min) |
| `GET /parent-link/{token}/report?week=n` | the week report (§4) |
| `GET /parent-link/{token}/progress` | « التقدّم بالتفصيل » (§4bis) |
| `POST /parent-link/{token}/pin {pin}` | sets the parent's 4-digit code, once (409 `pin_already_set`), and returns a pass |
| `POST /parent-link/{token}/unlock {pin}` | returns a pass. A wrong code gives 422 `pin_wrong`; 5 wrong codes lock it for 15 min (429 `pin_locked`) |

How each response behaves:

- An unknown token gives **404 `link_invalid`**. A revoked one gives
  **410 `link_revoked`**. The page turns each into a sentence that says what
  to do: ask the child for a new link, or the teacher for the card.
- Every response is `Cache-Control: no-store` and `X-Robots-Tag: noindex, nofollow`.
- No response carries an email.

**The optional code.** On the first opening, the parent can « احمِ هذا الرابط
برمز »:

- From then on, a browser without a valid pass sees « أدخل رمزك ». A request
  without the pass gets **401 `pin_required`**.
- The pass is an encrypted `{link, pin fingerprint, expiry 30 days}`. The browser
  keeps it in `localStorage` (`sa.parent-pass.<token prefix>`), wrapped in
  try/catch.
- A forgotten code is fixed by a **new link**, which drops the code and every
  pass.

**What the student sees.** `features/family/ParentLinkCard.jsx`, lazy in the
profile:

- before the link: the disclosure, then the consent button;
- after:
  - the QR (to scan from the laptop screen with the parent's phone);
  - the URL;
  - « مشاركة الرابط » (`navigator.share`, falling back to copy);
  - « نسخ الرابط »;
  - « فُتح N مرّة — آخر مرّة … »;
  - whether a code is set;
  - « أنشأه أستاذك » when the link came from the teacher;
  - « رابط جديد » and « إلغاء الرابط ».

There is **no WhatsApp link in the student space** (closed garden, §7). Sharing
goes through the phone's own share sheet.

`ParentAccessLinkTest` locks all of this: consent, an identical report and
progress for parent and student, replacement and revocation (410), unknown
token (404), PIN set / unlock / pass / lock / unlock after 15 min, no email,
and the headers.

## 2bis. « بطاقات الأولياء » — the teacher's QR cards

In a class's « التلاميذ » tab, the teacher selects students and calls
`POST /teacher/classrooms/{id}/students/parent-cards {studentIds}` (`manage`,
throttle 10/min, `no-store`). The dialog is
`features/teacher/members/ParentCardsDialog.jsx`, lazy.

The server (`Domain/Classroom/ParentCards`):

- accepts only active members (`ClassroomAccess::activeStudentIds`, otherwise
  422 `not_member`);
- **reuses each student's existing link** (`ensure`): printing never breaks a
  link the child already sent;
- creates one (`created_by = teacher`) for a student who has none;
- answers `{id, firstName, lastName, url}` and never an email;
- logs `teacher.parent_cards_issued`.

Each card shows the class, the child's name, « تابِع عمل ابنك », three steps
(open the camera, tap the link, keep it, optionally protect it) and the QR,
printed from a `[data-parent-cards-print]` portal (`parentCards.css`).

**The QR.** `features/family/QrCode.jsx` draws the
[`qrcode-generator`](https://www.npmjs.com/package/qrcode-generator) 1.4.4
matrix as a React SVG: error correction M, Byte mode, a 4-module quiet zone.
It is a lazy chunk, never in the entry. `QrCode.test.js` checks the finder
patterns and determinism. A generated link was also decoded back with OpenCV
during development.

**Consent.** A student who joined the class already accepted that their
teacher reads their work; the card passes that reading on to the child's
guardian. The student sees the link in their profile (« أنشأه أستاذك ») and
can renew or revoke it, as with their own.

## 2ter. The parent account (kept, not offered)

`users.role = 'parent'`, the `/api/v1/parent/*` routes (`can:parent`), the
`/wali` space and the code link (`parent_links`, `parent_link_codes`) remain
for later and for accounts that already exist. **Since 2026-10-23 `parent`
is no longer in `User::SELF_REGISTERABLE_ROLES`**, so `/register` and Google
refuse it (422). The register page and the Google step no longer show
« أنا وليّ أمر », and the student profile no longer issues codes
(`ParentsCard.jsx` was removed).

What still works for an existing parent account:

- `/wali` lists the linked children and opens the same report and progress
  (`/parent/children/{id}/report|progress`, through
  `ParentLinkService::activeLink`, 404 otherwise);
- the Sunday email (§5);
- the code-linking API (6 children / 4 parents; reasons `invalid_code`,
  `expired_code`, `already_linked`…; a student unlinking emails the parent).

`ParentSpaceTest` keeps it tested.

## 3. Real study time

**Client** (`features/studyTime/`):

- `studyClock.js` is pure and tested.
- `StudyTimeTracker.jsx` is a null component mounted ONCE under the router in
  `App.jsx`, for verified student accounts only.

Each elapsed slice goes to exactly one state:

| state | condition | bound |
|---|---|---|
| `active` | page visible, window focused, an input (pointer, key, wheel, scroll, touch) in the last 90 s | — |
| `idle` | page visible, no input | counted up to 10 min in a row, then nothing |
| `away` | page hidden or window blurred | counted up to 30 min in a row; each switch into `away` is one **leave** |

One step never covers more than 90 s, so a sleeping laptop or a frozen tab
cannot inflate the counts.

The **surface** comes from the URL (`surfaceFor`):

| surface | URLs |
|---|---|
| `lesson` | `/courses/<level>/<grade>/<chapter>/<lesson>…` |
| `practice` | `/espace/pratique`, `/espace/tashih` |
| `challenge` | `/espace/defi`, `/espace/diagnostic` |
| `lab` | `/espace/atelier`, `/espace/cahier` |
| `game` | `/espace/jeux` |
| `other` | the rest of `/espace` and `/courses` |
| `null` (not counted) | public pages, books |

« Study » = `lesson + practice + challenge + lab`. Games are shown apart.

**Transport.** Every 60 s, and when the page hides or closes, the tracker sends
`POST /student/study-time {segments:[{surface, active, idle, away, leaves}]}`
(seconds) with `fetch keepalive` (it survives tab close). A failed send is put
back into the clock — except a 401/403 (revoked or expired token): those seconds
are dropped and the tracker stops sending. On logout, `AuthContext` first awaits
`flushStudyTimeNow()` (the mounted tracker registers its flush in
`studyTimeService`; bounded to 2 s), THEN clears the session and revokes the
token, so the last beat never leaves with a dead token. Throttle 30/min,
`learner` only.

**Server** (`Domain/Family/StudyTimeService`):

- It does not trust a beat. A beat covers at most the time elapsed since the
  previous one, plus 15 s (cache key `study-time:last:{id}`), and never more
  than 180 s. An over-claim is scaled down.
- Rows go into `study_time_days (user_id, day, surface)`: Algiers day,
  counters capped at 16 h. `day` is a plain `Y-m-d` string (no date cast).

**What it never is.** The platform does not see, log or infer other sites.
`away` means only « not on this page ». That sentence is shown to the parent
(`report.howAway`) and to the student (`student.never2`).

## 4. The week report — one shape, two readers

`ParentReportService::week($student, $weeksBack)`:

- The week runs Sunday → Saturday in Algiers (`FamilyClock`), up to 8 weeks back.
- It returns:
  - `time`: 7 `days` with study / game / other / idle / away / leaves, plus
    `bySurface`, the totals and `activeDays` (≥ 1 study minute);
  - `practice`: `question_attempts` submitted in the week, abandoned ones
    excluded — answered, correct (+ equivalent), partial;
  - `lessons`: `student_lesson_progress` touched in the week — worked, completed
    this week, 12 titles;
  - `mastered`: Mastery V2 transitions into `mastered` in the week, distinct
    الكفاءات, 20 titles;
  - `lastSeenAt`.
- It never includes an email, a notebook note or an answer photo.

Who reads it:

- the parent through « رابط الوليّ »: `GET /parent-link/{token}/report?week=n`,
  page `/w/:token`;
- an existing parent account: `GET /parent/children/{id}/report?week=n`;
- **the student: `GET /student/parents/report?week=n`, page
  `/espace/profil/wali` « ما يراه وليّك »**.

All of them use the same service and the same component
(`features/family/WeekReport.jsx`). `ParentAccessLinkTest` and `ParentSpaceTest`
assert that the responses are identical. Transparency is that page, not a
promise.

`/wali` lists the children with `glance()`: today's and this week's study
time, and the last time seen.

The week report names a Learning Point state with the platform's single label
set (`ARABIC_RTL_CONTRACT.md`): « كفاءات صارت « متحكَّم فيها » هذا الأسبوع »,
never « المتقنة ».

## 4bis. Detailed progress « التقدّم بالتفصيل » (2026-10-23)

The link page `/w/:token`, the parent account's child page and « ما يراه وليّك »
have two tabs (`features/family/ReportTabs.jsx`):

- « الأسبوع »: the week report (§4);
- « التقدّم بالتفصيل »: the whole year (`?tab=progress`, so a link can open it).

**Server.** `ParentProgressService::forStudent($student)` serves both readers:
`GET /parent-link/{token}/progress` (the link), `GET /parent/children/{id}/progress`
(an existing parent account, through `activeLink`, 404 otherwise) and
`GET /student/parents/progress`. Since 2026-10-26 it has a fourth reader, the
school director of a student who consented to the school
(`GET /school/students/{id}/progress`, `ProgressDetail audience="school"` —
`SCHOOL_ADMIN_SPACE.md` §6); the WEEK report (study time) is NOT shown to the
school. It recomputes nothing:

- totals and the timeline come from `StudentDossier` (the dossier the teacher
  reads, without a class scope);
- الكفاءات states come from Mastery V2 (`student_learning_point_progress`).

It returns:

- `summary`:
  - lessons of the child's grade completed out of the published ones, as a
    percentage;
  - lessons started;
  - answers and success rate (`OutcomeStats`, already 0–100);
  - `masteryCounts`.
- `needsSupport`: up to 12 الكفاءات in `gap`, then `reinforce`, lowest
  confidence first. This is the parent's first question: « where does my child
  need help? ».
- `lessons`: every lesson the child touched (progress, practice or mastery),
  in unit order. Each one carries:
  - status (`completed` / `in_progress` / `not_started`);
  - modules done out of the active published ones;
  - practice: sessions, correct out of answered, best completed level;
  - the best final test;
  - every non-retired الكفاءة of the lesson with its state (`unassessed` when
    no row).
- `timeline`: the 20 latest events of `StudentDossier::timeline`, with
  timestamps in ISO and **without** the French `detail` field. The client
  composes the Arabic from `family.progress.event.*`.

**Client.** `features/family/ProgressDetail.jsx`, one column first: the year
bar, three figures, the state distribution, « ما يحتاج دعمًا », one
collapsible card per lesson, and the timeline.

- State labels come from `stateLabel()` (`student:mastery.*`, the single set).
- Titles go through `MathLabel`: a title such as `a = b × q` is isolated.

`ParentSpaceTest` asserts that the parent and the student get identical
payloads, the lesson's الكفاءات in order, and no `detail` and no email in the
timeline.

## 5. The Sunday email (parent accounts only)

A link has no email address, so a parent who reads through « رابط الوليّ » gets
no email: the link always shows the current week. A weekly WhatsApp message to
a phone number the parent gives is **Planned**; it needs a WhatsApp Business
provider.

`smarter:family:weekly-reports` (`routes/console.php`) runs Sundays at 08:00
Africa/Algiers. It sends one `ParentWeeklyReportNotification` (mail) per active
link that meets all of these conditions:

- `weekly_email` is on (the parent's checkbox on the child page);
- the parent is active and verified.

The email covers the week that just ended. It is idempotent through
`parent_links.last_weekly_report_week`.

WhatsApp delivery is **Not yet implemented**: it needs a WhatsApp Business API
provider, which is an owner decision.

## 6. The device guide « اجعل الجهاز للدراسة فقط »

- Public at `/himaya` (footer link `marketing.footer.deviceGuide`). It ends on
  how to get « رابط الوليّ » (from the child's profile or the teacher's card);
  there is no account to create.
- Linked from the bottom of `/w/:token`.
- Inside the parent space at `/wali/himaya`.
- Component: `features/family/DeviceGuide.jsx`. Text: `family.json › guide.*`.

It covers:

- Windows: Microsoft Family Safety, « allowed websites only ».
- Android: Family Link « approved sites only », or app pinning.
- iPad / iPhone: Screen Time « Allowed Websites Only », or Guided Access.
- The home router: Cloudflare for Families DNS `1.1.1.3` / `1.0.0.3`.
- Habits.

`ALLOWED_HOSTS` lists what a restricted browser must allow:

- `smarter-academy.com` (site + API);
- `fonts.googleapis.com` and `fonts.gstatic.com` (fonts);
- `accounts.google.com` (Google sign-in only).

**Adding a third-party domain to the student space means updating this list.**
The guide has no outgoing links: addresses are selectable text.

## 7. The closed garden

The student space contains no link off the platform: no embedded video, no
social network, no ad, no `window.open`.

- `pages/studentClosedGarden.test.js` scans:
  - `lessons/`, `pages/student`, `components/student`;
  - the student `features/*`;
  - `StudentLayout` and `CourseLayout`.
- It fails on any external URL or `window.open`. The allowed exceptions are
  resources, never links: SVG/XML namespaces, the exam sheet's Amiri font, and
  the `VITE_API_URL` fallback.
- The whiteboard (Excalidraw) was the one open door:
  - `validateEmbeddable={() => false}` (no YouTube / Vimeo / Figma embeds);
  - `onLinkOpen` cancels any link on a shape that leaves the platform;
  - the external « browse libraries » button was already hidden by CSS.

## 8. Files

| Side | Files |
|---|---|
| Link | migration `2026_10_23_000001_create_parent_access_links`, model `ParentAccessLink`, `Domain/Family/ParentAccessLinkService`, `Domain/Classroom/ParentCards`, `Http/Controllers/Family/ParentLinkController`, rate limiters `parent-link` / `parent-link-pin`; web `pages/parent/ParentLinkPage.jsx` (route `/w/:token`), `features/family/ParentLinkCard.jsx`, `features/family/QrCode.jsx`, `features/teacher/members/ParentCardsDialog.jsx` + `parentCards.css`; dependency `qrcode-generator@1.4.4` |
| API | `config/family.php`, migration `2026_10_22_000005_create_family_tables`, models `ParentLink`, `ParentLinkCode`, `StudyTimeDay`, `Domain/Family/*` (`FamilyClock`, `FamilyException`, `ParentLinkService`, `ParentReportService`, `StudyTimeService`), `Http/Controllers/Family/*`, notifications `ParentLinkRevokedNotification`, `ParentWeeklyReportNotification`, command `SendParentWeeklyReports` |
| Web | `features/studyTime/*`, `features/family/*`, `services/familyService.js`, `services/studyTimeService.js`, `components/layout/ParentLayout.jsx`, `pages/parent/*`, `pages/student/ParentView.jsx`, i18n namespace `family` (on demand) |
| Progress | `Domain/Family/ParentProgressService.php`, `features/family/ProgressDetail.jsx`, `features/family/ReportTabs.jsx` |
| Tests | `tests/Feature/ParentAccessLinkTest.php`, `tests/Feature/ParentSpaceTest.php`, `features/family/QrCode.test.js`, `features/studyTime/studyClock.test.js`, `features/family/format.test.js`, `pages/studentClosedGarden.test.js` |

Entry-bundle cost: +1.6 KB gzip (326.5 → 328.1 KB, budget 330). That is the
tracker, the lazy route stubs, the eager keys `common.apiErrors.family`,
`marketing.footer.deviceGuide` and `teacher.students.parentCards.open`.
Everything else is lazy, including the QR library (`BUNDLE_BOUNDARIES.md`).

**Screens — phone-first (owner, 2026-10-23).** Parents arrive from WhatsApp, a
QR or the Sunday email, on a phone. So these pages are designed for the phone
first and tested at 390×844 AND 1366×768, an exception to the tablet/laptop
rule like `/books` and the game space:

- the link page `/w/:token`;
- `/wali/*`;
- the public guide `/himaya`.

Tip: a browser window rarely shrinks to 390 px, but a same-origin `<iframe>`
390 px wide gives the page a true phone viewport.

« احفظ هذا الرابط » tells the parent to keep the WhatsApp message or **bookmark**
the page, never to add it to the home screen. The PWA manifest's
`start_url: "/"` would install the homepage and lose the token.

What that means in practice:

- the bar keeps the mark, the two links and a logout icon (the name and long
  labels appear from `sm` / `md`);
- touch targets are at least 44 px;
- the tabs show short labels (`tabs.*Short`) under `sm`;
- the day chart shows short day names (`daysShort`) and minutes under the
  columns, with the duration above the bars from `sm`;
- no horizontal scroll at 390 px (measured: `scrollWidth = clientWidth`).
