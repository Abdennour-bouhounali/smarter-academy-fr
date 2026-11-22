# Navigation rebuild — plan

> **Status (2026-11-22).** Covers the navigation of the student and teacher spaces: the four doors, one menu, the colour
> tokens `nav-*` (§0 is what is built; the rest is a plan). Imported from the Algerian platform (DZ `dev` `7f4cef1c`) on
> 2026-11-22. True here: everything §0 lists as built (checked: `data/doors.js`, `studentNavigation.js`,
> `teacherNavigation.js`, `components/common/WorkspaceNav.jsx`, `tailwind.config.js › colors.nav`). Not true here: the
> labels quoted are Arabic and the layout is right to left until plan steps 1C–1D (`FRENCH_LANGUAGE_CONTRACT.md`); with
> no lesson and an empty school calendar, the lesson lists, the unit page and the teacher's « week » are empty. The
> measuring sizes 390×844 / 768×1024 predate the rule « 1366×768 alone » for lessons (root `CLAUDE.md`).

Written 2026-11-16 at the owner's request: « the navigation experience for both the student and the teacher must be
rebuilt in a better way regardless of the docs, also the navigation of lessons, in all the platform, for both accounts ».
Status: **PLAN — nothing here is built.** It is a proposal to decide on, section 7 lists the decisions.

## 0. What is BUILT (2026-11-16) — the rest of this document is the plan

Built and checked at 390×844, 768×1024 and 1366×768, for both accounts:

| Part | Where | State |
|---|---|---|
| The four doors, as data | `apps/web/src/data/studentNavigation.js`, `teacherNavigation.js`, `doors.js` (+ test) | built |
| ONE menu for both accounts | `components/common/WorkspaceNav.jsx` (`StudentNavbar` / `TeacherNavbar` are thin wrappers) | built |
| The line of pages under a door | `DoorTabs` (same file), mounted by `StudentLayout` / `TeacherLayout` | built |
| The account menu under the picture | `AccountMenu` (same file): account, plan, school, access state, settings, sign out | built |
| The colour tokens | `tailwind.config.js › colors.nav` (`nav-ink`, `nav-accent`, `nav-now`, `nav-done`, `nav-alert`, `nav-muted`, `nav-line`, `nav-page` + soft variants) | built |
| The teacher's home « اليوم » | `pages/teacher/TeacherHome.jsx`, `features/teacher/today/weekLessons.js` | built: each class with the lessons of the week from the school calendar; the answers waiting; the seats only when a limit is reached |
| The teacher's pages in the tokens | `pages/teacher`, `features/teacher`, `components/teacher` (teal removed) | built |
| The lesson card, lesson row, unit card | `components/student/LessonCard.jsx`, `LessonRow.jsx`, `UnitGroup.jsx`, `lessonTileParts.jsx` | built (section 5ter) |
| The unit page | `pages/UnitPage.jsx` | built (section 5ter) |
| The year map (`LessonNavigator`), the lesson bar with previous / next, the student's home, the colour check | — | **Not yet implemented** (the global search is cancelled: principle 4) |

**Cleaned after the rebuild (2026-11-16)** — so that a later generation does not copy what is gone:

- the sidebar-folding half of `WorkspaceLayoutContext` (manual fold, « open beside the map », their two storage keys,
  `sidebarCollapsed` / `toggleSidebar` / `sidebarWidth`, `SIDEBAR_WIDTH`, `sidebarCanOpenBesideColumn`): the context now
  exports `RAIL_WIDTH` (80) and `columnWidthFor(viewport)`;
- `SidebarToggle.jsx`, the helper `isDefaultPlan`, the old link lists `studentNavLinks` / `teacherNavLinks`;
- the strings nothing reads any more: the short menu labels, « فضاء التلميذ », the old home's meters and plan line, the
  « joined by » column, the card badges « قريبًا » / free / bonus chapter, the titles now carried by a pill or a fold;
- three unused imports (`Timer`, `ArrowRight`, `getLessonPath`).

How it was found: `npm run check:unreached` (files) plus a one-off scan of exports, imports and string keys against the
last commit. Since 2026-11-17 this is a CI check: `npm run lint` and `npm run check:unused` (`CODE_HEALTH.md`).

Rules that are now CODE, not proposal:

- **Three widths, one skeleton.** Under 768 px: a top bar and a bottom bar of the four doors. From 768 px (tablet upright
  included): a rail of 80 px on the start edge (`RAIL_WIDTH`), no top bar, no bottom bar. The student's and the teacher's
  `<main>` carry `data-rail`; the admin's and the school's sidebars still appear at 1024 px. The lesson's sticky offsets
  (`lessonChrome.js`) follow the same 768 px.
- **The rail does not fold.** `SidebarToggle` is deleted; « بطاقتي » as a column sits beside the 80 px rail.
- **ONE blue (owner, 2026-11-16: « the black is everywhere, try the best blue »).** Every filled or outlined shape —
  button, lit door, avatar, link — is `nav-accent` (#3B5BDB). `nav-ink` is for TEXT only. The teacher's lit door is filled
  blue, the student's is soft blue. This replaces « the teacher in ink » of section 6bis.
- **The blue is GENERAL (owner, 2026-11-16: « generalize it on the platform »).** In `pages/`, `components/` and `features/`
  the primary fills, outlines and links that were indigo, royal blue, teal or dark slate are `nav-accent`; the blue-to-violet
  gradient of the student, onboarding, diagnostic, tour and sign-in screens is the same solid blue. The teacher's lesson card,
  the lesson tools bar, the memo and the lesson file follow. **Left as they were, on purpose:** the lesson engine and its labs
  (`lessons/` — frozen lab snapshots, semantic colours), the game worlds, the class board screens, the marketing pages and
  the admin space; violet stays the mark of paid content; amber, green and red keep their meaning.
- **A door lights by address** (`activeDoorId`): the longest matching prefix wins; a lesson and its tools light « دروسي »;
  the account pages light none.
- **No halo behind the student's space either** (`BackgroundLayer` is no longer mounted by `StudentLayout`).
- « استكشاف » is still a page: it is the second entry of the line under « دروسي » until the year map replaces it (N8).

## 1. What existed before the rebuild (measured)

| Fact | Number |
|---|---|
| Entries in the student's menu (`data/studentNavigation.js`) | 10 |
| Entries in the teacher's menu (`data/teacherNavigation.js`) | 11 (6 on the phone's bottom bar) |
| Routes in `App.jsx` | 158 |
| Pages that list lessons, each with its own list | 7 or more: `Courses`, `MesCours`, `Explorer`, `UnitPage`, `StudentHome`, `Progression`, the teacher's lessons, the class pages |
| « Next lesson » / « previous lesson » inside a lesson | none |
| « Continue where I stopped » | none for the teacher |
| Search (`CommandPalette`) | student and public shells only, not the teacher's — **deleted on 2026-11-17** (owner: no command palette, no global search) |

What is wrong, in one sentence each:

- **The menu is a list of rooms, not of intentions.** « المختبر », « مختبر التفكير », « كرّاسي », « فضاء الألعاب », « عرضي »,
  « مؤسستي » sit at the same level as « الدروس ». Nothing says what to do now.
- **A lesson is found seven different ways**, and none of them is organised like the school year (فصل → وحدة → درس), although
  the calendar and the learning net already hold that order.
- **A lesson is a dead end.** From inside it there is no next lesson, no « where am I in the unit », only a way back.
- **On a phone the bottom bar has six tabs** and the page's own header adds more rows; little is left for the page.
- **The lesson lives outside both spaces** (`/courses/…`), so entering one changes the frame around it.

## 2. The idea: four doors, one map, one lesson bar

1. **Four doors, named by what the person wants**, the same count on a phone and on a laptop.
2. **One map of the year** — « خريطة السنة » — is the only way lessons are listed, everywhere, for both accounts.
3. **One lesson bar** on every lesson: where I am, previous, next, back to the map.
4. ~~**One search** for everything, in both spaces.~~ **CANCELLED by the owner on 2026-11-17**: no command palette and no
   global search. The search field of a lesson list (« ابحث عن درس ») stays: it filters the page it is on.

Everything else is reached from inside a door, never from the menu.

## 3. The student

```
phone (bottom bar, 4 tabs)                laptop (thin rail, same 4)
┌────────────────────────────────┐
│            the page            │        اليوم
│                                │        دروسي
├───────┬───────┬───────┬────────┤        أتدرّب
│ اليوم │ دروسي │ أتدرّب │  أنا   │        أنا
└───────┴───────┴───────┴────────┘
```

| Door | What it answers | What moves inside it |
|---|---|---|
| **اليوم** | « What do I do now? » ONE next step, then the week | `/espace` led by « بوصلتي », daily challenge |
| **دروسي** | « Where is lesson X? Where am I in the year? » | the year map (section 5): replaces « دروسي », « استكشف », the unit pages' lists |
| **أتدرّب** | « I want to play or train » | games, « مختبر التفكير », the Math Lab, practice by lesson |
| **أنا** | « How am I doing? » | progress, « كرّاسي », my class, account, what my parent sees |

10 entries become 4. Nothing is deleted: each page keeps its address and is reached from its door.

## 4. The teacher

```
┌────────────────────────────────┐        laptop rail
│            the page            │        اليوم
│                                │        دروسي
├───────┬───────┬────────┬───────┤        أقسامي      ● 3
│ اليوم │ دروسي │ أقسامي │ أدواتي│        أدواتي
└───────┴───────┴────────┴───────┘        ─────
                                          (avatar) حسابي · عرضي · مؤسستي
```

| Door | What it answers | What moves inside it |
|---|---|---|
| **اليوم** | « What do I teach this week, and who needs me? » per class: the lesson of the week from the school calendar, its card in one tap; answers waiting for correction | `/enseignant`, the badge of « تصحيح الإجابات » |
| **دروسي** | « Take me to lesson X » | the same year map, in the teacher's reading (taught · this week · has its board) |
| **أقسامي** | « How is 4م2 doing? » | classes, tracking, « تصحيح الإجابات », students' notebooks, the class's games |
| **أدواتي** | « I need an instrument » | Math Lab, « مختبر التفكير », « كرّاسي » |
| *avatar menu* | the account, not the work | profile, « عرضي », « مؤسستي », sign out |

11 entries become 4 plus the avatar. « تصحيح الإجابات » is no longer a menu entry: its count shows on « أقسامي » and on « اليوم ».

## 5. The year map — the one way to reach a lesson

One component, `LessonNavigator`, fed by the school calendar (`schoolCalendar.js`) and the catalogue. It replaces every
list of lessons of the platform.

```
السنة الرابعة متوسط                         🔍 ابحث عن درس
[ الفصل 1 ● ]  [ الفصل 2 ]  [ الفصل 3 ]        ← the term of today is open
┌ الأعداد الطبيعية والناطقة ──── 6 / 9 ┐
│ ✓ التعرّف على قاسم لعدد طبيعي           │
│ ✓ قواسم عدد طبيعي                      │
│ ▶ خواص القواسم            هذا الأسبوع  │   ← one line per lesson, one tap
│ ○ القاسم المشترك الأكبر                 │
└────────────────────────────────────────┘
┌ الحساب على الجذور ─────────── 0 / 6 ┐
```

- **Organised like school**: term → unit → lesson, in the order of the progression. The week's lessons are marked.
- **One line, two readings**: the student sees done · next · not yet; the teacher sees taught · this week · tools ready.
- **It opens where you are**: today's term, the current unit unfolded, the next lesson in view.
- **Earlier years are one switch away** (1AM–3AM), for revision and for a lesson's prerequisites.
- **On a phone** it is one column of the same lines; nothing else changes.

Places that become this component: the student's lessons page, « استكشف », the unit page's list, the lesson lists of the
home and of the progress page, the teacher's lessons, the lesson picker of a class, the public catalogue's list.

## 5bis. The pages behind the doors: the two homes, « دروسي », « استكشف »

What they are today (read in the code, 2026-11-16):

| Page | Today | Problem |
|---|---|---|
| Student home `/espace` | led by « بوصلتي » when open, then a folded « المزيد » holding the greeting, recent lessons, stats, daily challenge, a curriculum preview, the premium card | the base is right; the folded list is a second menu |
| Teacher home `/enseignant` | the SEATS and plan meters first, then the list of classes | it opens on the licence, not on teaching: nothing says what to teach or who needs him |
| Student « دروسي » `/espace/cours` (`MesCours`) | search, a filter by ميدان, a grid / list switch, cards | a catalogue to browse, not a path; no term, no « this week » |
| « استكشف » `/espace/explorer` (`Explorer`) | the same page again, plus the other grades | a near copy of « دروسي » (same filter, same search, same switch) |
| Teacher « الدروس » `/enseignant/cours` | it IS the student's `Explorer` component | the teacher browses a student catalogue; nothing of his classes or his tools |

**The student's home — « اليوم »: one screen, one decision.**

```
صباح الخير ياسين
┌──────────────────────────────────────────┐
│ ▶ واصل: خواص القواسم                      │   ← ONE next step, the biggest thing on the page
│   الجزيرة 3 من 8                    [ هيّا ] │
└──────────────────────────────────────────┘
هذا الأسبوع     ✓ قواسم عدد    ▶ خواص القواسم    ○ القاسم المشترك الأكبر
تحدّي اليوم 🔥 3            نجومي هذا الأسبوع ★ 12
```

The next step comes from « بوصلتي » when it is open, otherwise from the progression (the first lesson of the week not
finished). The week is three lessons, not a list. « المزيد » disappears: what it held is behind the four doors.

**The teacher's home — « اليوم »: his week, class by class.**

```
هذا الأسبوع · الأسبوع 8
┌ 4م2 ─────────────────────────────────────┐
│ الدرس: خواص القواسم        [ بطاقة الدرس ] [ حصّة القسم ] │
│ 5 تلاميذ يحتاجونك · 3 إجابات تنتظر التصحيح              │
└───────────────────────────────────────────┘
┌ 4م3 ─────────────────────────────────────┐ …
```

One card per class: the lesson of the week (from the school calendar, corrected by the teacher in one tap), two
buttons, and the two numbers that call him. The seats and the plan move to « عرضي » under the avatar; the home keeps one
thin line only when a limit is near.

**« دروسي », both accounts: the year map of section 5.** The student's opens on his grade and his week. The teacher's
opens on the grades of HIS classes, each lesson line carrying what is ready for him (card, board, memo). The grid of
cards, the filter by ميدان and the grid / list switch go: the term and the unit are the structure.

**« استكشف » stops being a page.** Its only real content — the other years — becomes the grade switch at the top of the
year map, and the search. `/espace/explorer` redirects to « دروسي ». `MesCours` and `Explorer` are deleted once the
navigator has replaced them.

## 5ter. The cards and the unit page — BUILT (owner, 2026-11-16: « small content »)

**A card is four lines at most.** Where it sits (« الوحدة 1 · … », optional), its NAME (two lines at most), ONE status
line and a thin progress line. No emoji, no paragraph, no « min »: the description is the tooltip and is read on the
lesson's own page.

| State (`tileKind`) | Mark | Status line |
|---|---|---|
| not started | ▶ in a blue ring | « ابدأ · 45 د » |
| started | ▶ on amber | « متابعة · 63% » |
| finished | ✓ on green | « تمّ » |
| paid, not open to this student | lock | « تفعيل الوصول » + the paid mark |
| closed by the teacher | eye | « غير متاح في قسمك » (dashed card) |
| not written yet | empty dashed ring | « قيد الإعداد » (dashed card, never a link) |

The unit card has the same form: « الوحدة n », the name, « 8 دروس · 0 / 8 ». The row layout is the same content on one line.
`lessonTileParts.jsx` holds what they share (`StatusDot`, `ProgressLine`, `tileKind`, `minutesOf`).

**The unit page is a short header and ONE line per lesson.**

- Header: the unit's number and name, and for the student « دروس مكتملة 0 / 8 » with its bar. The goals, the challenge and
  the aside are three folded boxes on one line: reduced, never deleted. The textbook reference shows to the TEACHER only.
- A lesson line: its rank (or ✓ / ▶), its name (the link), two facts (« 4 كفاءات · 45 د »), ONE gesture — the student's
  « أبدأ الدرس » (filled only on the lesson to open NOW, the first one not finished), the teacher's « مذكرة الدرس » and
  « حصّة القسم ».
- The arrow at the end of the line unfolds the rest: description, محاور (teacher), الكفاءات with their mastery,
  prerequisites, labs and methods. It is open by default only on the student's next lesson.

## 5quater. The class page — BUILT (owner, 2026-11-16: « coherent, intelligent, organised, less repeated content »)

`/enseignant/classes/:id` (`pages/teacher/ClassGroupDetail.jsx`). Measured before → after at 1366 px: the overview
11,655 → about 1,320 px; « الكفاءات » 15,012 → about 1,190 px; « الدروس » 6,179 → one screen.

- **Header**: back to « أقسامي », the class's name, ONE line of facts (grade · students · note), « دعوة التلاميذ ».
  The join card (link, code) is no longer pinned above every tab: it opens from that button, by itself while the class
  is empty, and lives in « الإعدادات ».
- **Five sections instead of eight tabs** (`SECTIONS`), underlined tabs; a section with several pages shows them as a
  small line of pills. The address keeps `?tab=<page>`, so old links work.

  | Section | Pages (`?tab=`) |
  |---|---|
  | نظرة عامة | `overview` |
  | التلاميذ | `students` |
  | التعلّم | `learningPoints` « الكفاءات », `interventions` « التدخّلات » |
  | الأنشطة | `dailyChallenge`, `madar` |
  | الإعدادات | `settings` « القسم » (joining, name, archive), `lessons` « الدروس الظاهرة » |

- **نظرة عامة** answers three questions on about one screen: the lessons of THIS week (the same `WeekLessonList` as the
  teacher's home), the class on all its الكفاءات as ONE bar with « what changed » as three numbers, then the two most
  shared signals (the rest on demand). The full map is not repeated: it is « التعلّم ».
- **التلاميذ**: filters « الكل · بدؤوا · لم يبدؤوا بعد » with counts; two quiet icons per row (notebook, take out of the
  class); the seats line only when the plan is 90 % full.
- **The students list is its own list, not the generic table** (`MembersTab`, `data-students-list`): a round mark with the
  initials, the name with « آخر نشاط · date » or « لم يبدأ بعد » under it, a compact progress bar that fills from the
  right, lessons done, success rate, two icons. Above it, on ONE line: the three filters, a search by name, a sort (most
  advanced · last activity · name) and the two print buttons. On a phone a student is two short rows.
- **The lesson menu of « الكفاءات » has a search inside it** (`learningPoints/LessonPicker.jsx`): type a word of the title
  (Arabic is matched without its marks), Enter picks the first match, « كل الدروس » stays the first choice. Use it
  wherever a menu would list more than about fifteen lessons, instead of a native `<select>`.
- **الكفاءات**: one fold per lesson with its own bar; only the lessons where a student was assessed are listed, the lesson
  with the most difficulty is open, « كل الدروس (n) » shows the rest.
- **الدروس الظاهرة**: one fold per ميدان with « shown / total »; one switch per lesson instead of a state pill plus a button.
- **التحدّي اليومي** (4,468 → about 860 px): the results are the page; the settings are one `Fold` away, and the choice of
  lessons inside them is a short box that scrolls (it was 74 chips in a column).
- **فضاء الألعاب** (4,515 → about 830 px): the four numbers on one card; the students who PLAYED this week first, one line
  when nobody played, « كل التلاميذ (n) » on demand; the hearts history only when there is one; the refuel questions and
  the game settings each in a `Fold`.
- **التدخّلات**: no title repeated under the pill, the same filter pills as everywhere.
- **Whole page**: the section tabs stay in view while a long section scrolls (`data-class-nav`, sticky); « التلاميذ »
  carries its count; every card of the teacher's pages is the same flat card (`rounded-2xl border border-nav-line bg-white`
  — `glass-card` is no longer used there).
- **`Fold`** (`pages/teacher/teacherUi.jsx`) is the shared pattern for « set once, one tap away »: a native `<details>`
  with a title, an optional one-line hint and an icon. Use it instead of a second column of settings.

## 6. Inside a lesson: never a dead end

One bar on every lesson, for both accounts, under the space's own frame:

```
‹ خريطة السنة    الأعداد الطبيعية · 3 / 9    خواص القواسم        ‹ السابق   التالي ›
```

- **Where I am**: the unit and the lesson's rank in it. Tapping the unit opens the map on that unit.
- **Previous · next** follow the progression, across units.
- **The teacher's bar adds his tools** — it is today's `LessonToolsBar`, kept, with the position and previous / next added.
- **The lesson opens inside the person's own space**: the address `/courses/…` stays (links, shares, the public page keep
  working), the frame around it is the student's or the teacher's.
- A page a phone cannot open is shown closed with « على الحاسوب », as on the pilot: never a link to a refusal.

## 6bis. The look: colours, shapes, sizes

Mock-up to open in a browser: `docs/reports/mockups/navigation-look.html` (a static drawing, not the product).

Measured today on the two menus, the two homes and the lesson lists: **12 colour families** (slate, blue, indigo, amber,
emerald, teal, violet, rose, orange, sky, red, cyan), **13 gradients**, **5 corner radii**. There are no design tokens:
`tailwind.config` names three accent colours and every page picks its own.

**Nine colours, no other, in the navigation and its pages:**

| Token | Value | The ONLY use |
|---|---|---|
| ink | `#0B1B3F` | TEXT only |
| accent | `#3B5BDB` (the logo's blue) | every button, the active door of both accounts, the avatar, links |
| now | `#F59E0B` | the next step, « this week » |
| done | `#12A36B` | finished |
| alert | `#D6455D` | « needs you », a count waiting |
| muted · line · page · surface | `#5B6785` · `#E3E8F2` · `#F6F8FC` · `#FFFFFF` | second text, borders, behind the cards, cards |

Rules:

1. **Colour is meaning, never decoration.** Amber = now, green = done, red = needs you; none is used for anything else.
2. **One filled block per page**: the student's next step, the teacher's first button. The rest is white and lines.
3. **A state is never colour alone**: ✓ ▶ ○ always go with it.
4. **No gradient, no halo** in the navigation and its pages (the owner already refused them in the teacher's space).
   The game world inside a lesson keeps its own palette: it is a place, not a menu.
5. **Same skeleton for both accounts, ONE blue** (owner, 2026-11-16): the student's active door is soft blue, the teacher's is filled blue; ink is for text only.
6. **Finger first**: every target at least 44 px; text at least 14 px on a phone; four tabs with their names always shown.
7. **Two shapes**: a card with 16 px corners, a round pill. One light shadow or none.
8. **The tokens are code**: one file of CSS variables / Tailwind theme names; a check forbids a raw colour class in the
   navigation and its pages, so the count cannot climb back to twelve.

## 7. Decisions for the owner

| # | Question | My recommendation |
|---|---|---|
| N1 | The four doors and their names, for each account | As in sections 3 and 4 |
| N2 | Where do games sit for the student: their own door, or inside the third door? | **DECIDED (owner, 2026-11-16): the third door is named « أتدرّب »**, not « ألعب وأتدرّب ». Games are reached inside it; the door's name speaks of training |
| N3 | Does the public catalogue `/courses` use the year map too? | Yes for the list; its marketing header stays |
| N4 | Before or after the lesson v2 rollout? | The lesson bar (section 6) BEFORE lesson 2: every rebuilt lesson sits under it. The rest in parallel |
| N5 | Laptop: a thin rail with icons and names, or today's wide sidebar? | **BUILT as recommended (2026-11-16)**: an 80 px rail from 768 px, tablet upright included |
| N6 | The teacher's « اليوم » needs, per class, where the class is in the progression. Set by the teacher, or guessed from the date? | Guessed from the calendar — BUILT; the teacher's one-tap correction is **Not yet implemented** |
| N7 | The teacher's home drops the seats and plan meters (they move to « عرضي »)? | **BUILT as recommended (2026-11-16)**: one line when a limit is reached |
| N8 | « استكشف » disappears as a page (other years = a switch of the year map)? | Yes |
| N9 | The look of section 6bis: nine colours, no gradient? | **DECIDED (owner, 2026-11-16): blue for both accounts, not ink** — built in the menus, the teacher's pages, the cards and the unit page |

## 8. Build order

| Step | What | Done when |
|---|---|---|
| 0 | Decisions N1–N9 | the owner has answered |
| 1a | The tokens of section 6bis as code, and the check that forbids a raw colour in the navigation | the check passes on the new shells |
| 1 | The model: ONE file describes the doors per account and what each contains; both menus and the bottom bar read it (the global search is cancelled: principle 4) | no menu entry is written anywhere else |
| 2 | `LessonNavigator` and the year map, student and teacher readings | every lesson of 4AM is reached in two taps from « دروسي » on a phone and on a laptop |
| 3 | The lesson bar with previous / next, on every lesson; lessons inside the person's space | from any lesson, the next one is one tap away |
| 4 | The two shells: four doors, the avatar menu (no global search: principle 4) | the old menus are deleted |
| 5 | Replace the seven lists by the navigator; old addresses redirect | no second list of lessons exists in the code |
| 6 | The two homes « اليوم » (section 5bis): the student's one next step and week; the teacher's week class by class | a student starts his next step in one tap; a teacher reaches this week's lesson card in one tap |
| 7 | Walks at 390×844, 800×370, 1366×768; contract `docs/architecture/NAVIGATION.md`; the superseded docs marked | the walks pass and the docs match |

How it will be judged:

- any lesson in **two taps** from anywhere; the next lesson in **one**;
- **four** entries on a phone, for both accounts;
- **one** list of lessons in the code;
- no tap that lands on « open it on a computer ».

## 9. Risks

- **Habits.** Teachers who know today's menu lose their landmarks once; old addresses must redirect and the first visit
  needs a ten-second tour.
- **The teacher's « اليوم » is only as good as the progression.** A class that is late or ahead makes it wrong until the
  teacher corrects it (decision N6).
- **Scope.** Seven lists and 158 routes: step 5 is the long one. Steps 1–3 already change what people feel.
- **Not measured**: how people actually move today. There is no navigation analytics in the code, so this plan rests on
  reading the product, not on usage data.
