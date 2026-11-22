# « عُدّة الانطلاق » — build plan (approved by the owner on 2026-11-17, « go on »)

Contract of what is built: `docs/architecture/LAUNCH_KIT.md`. This file keeps the whole idea, the decisions and the phases.

## The idea (owner, 2026-11-16)

Before starting a lesson, in every lesson of every grade, the student plays a game of five minutes at most: fun, and above all
a test of the earlier الكفاءات the lesson needs (his grade and the grades before). At the end: a score and direct links to the
lessons to revise, with an easy return. Under a threshold he cannot start. A teacher sees the last score of his students. The
tracking of a الكفاءة must tell a problem in a prerequisite from a problem in the new idea; a click on a الكفاءة opens the window
of the earlier ones; a strong result on a الكفاءة that leans heavily on others updates those — many students join in 4AM with no
data on the earlier grades.

## The design (accepted)

1. **The game**: the robot charges 2–4 tools (one per earlier الكفاءة, from the learning net), a station per tool, the answer
   as a gesture (write / sort by dragging / place), adaptive, ✓ or « سنعود إليه » and never the answer, « نجمة الصدق », a kit
   that lasts the year.
2. **Three ideas kept from the « from scratch » answer**: the repair INSIDE the launch (quick workshop), wrong answers that name
   a mistake, the game stops as soon as it knows.
3. **The picture of a الكفاءة — four sources**, a higher one always replacing a lower one: (1) work on the الكفاءة itself (today's
   mastery), (2) measured at a launch or in « بوصلتي », (3) deduced from success on what depends on it (dotted, « يبدو ثابتًا »),
   (4) nothing (« لم نفحصها بعد »).
4. **The automatic update**: when a الكفاءة is mastered by today's strict rule, its CORE prerequisites with no data become
   « يبدو ثابتًا » — one step back in full, a second step only through core links, never further; a prerequisite measured weak
   is not overwritten but flagged for a two-question re-check; a deduced level never counts as mastered; computed when read,
   never written.
5. **Prerequisite or new idea?** One core prerequisite measured weak → the cause is named, with its repair; all measured solid
   → the new idea; unknown → a two-minute check of exactly those.
6. **Who sees what**: the student, a window under each الكفاءة; the teacher, « جاهزية القسم » per lesson (students ×
   prerequisites, the weakest prerequisite of the class, last score with first score and tries) and the same window per
   student; the director, counts only; the parent, one line.

## Decisions

Asked on 2026-11-16; the owner answered on 2026-11-17 (« I accept it all », with two notes).

| # | Question | Decision |
|---|---|---|
| 1 | The gate | **Accepted (owner, 2026-11-17): the door opens by DOING, not by scoring.** A CORE tool left at « نبدأ منها » replaces the take-off by ONE required short capsule of that tool (≈ 3 min: card, worked example, instrument, two easy questions); after it the student goes in whatever the re-check says, the tool stays flagged and the teacher sees it. Never a second lock, never a dead end. It replaces the « under 10 % » lock. **Built the same day in the browser prototype** (`LAUNCH_KIT.md` §3bis); the teacher seeing it waits for phase 2 |
| 2 | Who opens lessons? | **The teacher** is responsible for opening lessons for his class (owner). The teacher's interface of a lesson is different and will be updated later — nothing is built for it now. **All the earlier lessons of the earlier grades are open to the student**: a lesson to revise is never locked. **An independent student, who belongs to no class, has ALL lessons open** (owner, 2026-11-17). **He passes through the capsule like everyone** (owner, 2026-11-17, after seeing the capsule: « yes ») |
| 3 | Does the launch move the mastery of the الكفاءة itself? | **No, separate** (owner): the launch is a first, quick insight on the student's level; the exercises are what really measures it |
| 4 | The revise link: capsule or whole lesson? | **The short capsule first** (owner), the whole lesson one tap further |
| 5 | Core / support | **Accepted and done for 4AM (2026-11-17).** The owner: « the net of learning point architecture needs your expert touch to make it solid ». 122 links classified (85 core, 37 support), 13 missing links added, three resolver functions, a test that forbids the catalogue to contradict the net, and a review table for the owner: `docs/curriculum/LEARNING_NET_WEIGHTS_4AM.md` (`LEARNING_NET.md` §2.2bis, §7bis, §8bis). 1AM–3AM are classified when their lessons get a launch |

## Phases

| Phase | Content | State |
|---|---|---|
| 1 | Engine, families of the pilot's two prerequisites, the game, the kit, the return, the gate and its capsule — on `qasim-adad-tabii`, browser only | **built 2026-11-17, to be judged by the owner** |
| 2 | The server asks and grades (as « بوصلتي »); the result is stored and synced; the gate decided by the server; the teacher's « جاهزية القسم », last score and who needed a capsule | not built |
| 3 | Link weights (core / support); the picture with its sources; the window; the automatic update; the diagnosis | not built |
| 4 | Rollout unit by unit as families are written (it replaces « أستعدّ » in the same place; its ten written questions per lesson become seed questions); errors of the bank tagged with their الكفاءة; the live class launch | not built |

## The real cost

Questions. Each prerequisite needs a family (two levels, several forms, named mistakes, a worked example). Two exist. The
direct prerequisites of the 4AM lessons come first. « بوصلتي » coverage with both levels on 2026-11-09, as a measure of what the
bank can seed: 4AM 36 of 52 items, 3AM 16 of 58, 2AM 12 of 54, 1AM 10 of 60.

## A rule that will change

« أستعدّ » today « never gates, sends no evidence » (`LEARNING_NET.md` §3, guide §4septies). Phase 2 changes that for the lessons
that get a launch; until the owner validates phase 1, « أستعدّ » stays as it is everywhere.
