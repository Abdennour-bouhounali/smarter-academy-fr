# Prompt — « no back-and-forth » on every lesson already built (owner, 2026-11-11)

Paste everything below the line into a new session, at the repository root, branch `dev`.

---

Apply the owner's rule « NO BACK-AND-FORTH » to every lesson already converted to the mission player, then stop and report.

## The rule (BINDING, owner, 2026-11-11)

In the mission player the student must never go back a screen to read something and forward again to answer. Everything a question asks
the student to LOOK AT is on the question's screen: the figure, the table, the numbers of the statement, the rule it applies, the student's
own earlier result. The owner's example: module 1, step 2 of `talis-hisab-atwal` showed the Thales figure on one screen and « أيّ مساواة
صحيحة؟ » on the next; now the figure sits on the right and the four options on the left, on ONE screen.

Read first:
- `docs/lessons/LESSON_DEVELOPMENT_GUIDE.md` §4septies, the bullets « NO BACK-AND-FORTH », « a figure and its question share ONE screen » and
  « a drawing is never split », and the « Rollout recipe » bullet « No back-and-forth »;
- `docs/reports/MISSION_ROLLOUT_PROGRESS.md` § « Cross-lesson fix — a figure and its question on ONE screen (2026-11-11, owner) »;
- the code already in place: `apps/web/src/lessons/common/classroom/ClassroomPaged.jsx` (`isAtomic`, `holdsFigure`, `isFigureOnly`,
  `isQuestionBlock`, `pairFigures`, the `data-paging-pair` marking in `plan()`), `apps/web/src/lessons/common/mission/mission.css` (the
  `data-paging-pair` rules), commits `d3001eed` and `18e59b9d`.

## What is already done (do not redo it)

- A drawing is never split into pages, and a block that shows figures followed by its question (with at most two short lines between)
  is put on ONE screen, the figure beside the question. This is automatic for every lesson in the player.
- A scan of the 20 converted lessons pressing « واصل » only, at 1366×768 and 1024×768: 13 paired screens, 0 overflow, 1 lone figure kept on
  purpose (`aksiya-talis` module 1 step 1, the situation read before the question whose own three figures sit beside it).

## What is left — your job

The scan never ANSWERS a question, so it misses the screens that appear after an answer. Find and fix, lesson by lesson, every remaining
case where a question needs something shown on another screen:
1. **A later sub-question of the same statement** (part 2 appears after part 1 is answered and the pager gives it its own screen, without
   the figure): draw the figure again beside it (`<GeoFigure {...FIG} maxWidth={180} />` — figures are data), or keep the sub-questions in
   ONE `data-paging-keep` block with the figure when they fit.
2. **Statement data or a table on one screen, the question on the next:** one `data-paging-keep` row (data beside the question), or the
   needed numbers repeated in one short line of the question's prompt.
3. **A question about what the student did before** (a lab round, an earlier answer): its result line on the question's screen (the
   `wonLine` pattern, `talis-hisab-atwal/modules/Module01Nashat.jsx`).
4. **Any figure screen the scan reports as `LONE`:** fix it, or justify it as a reading screen in the lesson's section of
   `MISSION_ROLLOUT_PROGRESS.md`.
If one fix fits many lessons, make it in shared code (`ClassroomPaged`, `ContentModule`, `GuidedProblem`, the question kit) and test it,
rather than editing lessons one by one.

## The lessons (every lesson whose `lesson.config.js` has `studentView: 'mission'`)

Unit 1 (`aadad-tabiiya-natiqa`): `qasim-adad-tabii`, `qawasim-adad-tabii`, `khawass-qawasim`, `qasim-mushtarak-akbar`, `tayin-pgcd`,
`bahth-pgcd`, `awwaliyan-fima-baynahuma`, `ikhtizal-kasr`. Unit 2 (`hisab-judhur`): `jidhr-tarbii`, `natiqa-ghayr-natiqa`, `muadalat-x-murabba`,
`amaliyat-judhur`, `tawzif-khawass-judhur`. Unit 9 (`khassiyat-talis`): `talis-hisab-atwal`, `aksiya-talis`, `inshaat-talis`,
`wadiya-idmajiya-talis`. Unit 3 (`hisab-harfi`): `nashr-tabsit`, `mutatabiqat-shahira`, `tahlil-ibara`. Re-list them with
`grep -rl "studentView: 'mission'" apps/web/src/lessons --include=lesson.config.js` in case another session converted more. Work unit by
unit, geometry first (unit 9: most figures), then units 2, 3 and 1.

## How, for each lesson

1. Vite on http://localhost:5173 (start it from `apps/web` in the background if it is not running).
2. `node apps/web/e2e/no-back-and-forth.mjs <lesson id>` — read every `LONE` and `OVER`; look at the `pair-*` captures in
   `/tmp/no-back-and-forth-qa` with your own eyes.
3. Walk every module of the lesson in the player at 1366×768 and 1024×768, ANSWERING each question (a wrong answer once, then the right
   one), with a Playwright script (a mocked student session: copy the `open()` of `apps/web/e2e/no-back-and-forth.mjs`). After each answer,
   screenshot the screen that appears and ask: can the student answer it without going back? Include « أستعدّ », the مسألة modules (`GuidedProblem`
   sub-steps), the training situations of a synthesis, the final test.
4. Fix (player only: `PlayerSwitch` / `useInMissionPlayer()`; the page, the teacher and Classroom Mode stay byte-for-byte the same).
   Saved answers are keyed by the question's prompt and options: drawing a figure beside a question changes nothing; rewording a prompt
   gives it a new key — say so in your report.
5. Re-run step 2 and the walk: 0 `OVER`, no unjustified `LONE`, no back-and-forth left.

## Constraints

- Other sessions have uncommitted work in this tree (« بوصلتي » files, home deletions, `CLAUDE.md`, i18n files, docs). Never `git add -A`,
  never stash, reset or revert their work. Commit ONLY your files, with explicit paths (`git commit -- <paths>`), ONE commit per unit:
  `fix(player): no back-and-forth — unit <n> « <title> »`, ending with the line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
  In a shared file that other sessions also changed, commit only your own hunks. Do not push.
- `lesson.manipulation.json`: Edit-tool insertions only, never re-indent.
- No raster images; book independence (no textbook text or page numbers to students); the Islam rules of `CLAUDE.md`.
- Supported screens: 1366×768, 1024×768 (and 1920×1080 for a last look); no scrolling anywhere in the player.

## Verification before each commit

- `cd apps/web && npx vitest run src/lessons` green; `npm run check:lessons` from the repo root exits 0 (entry ≤ 245 KB);
- `node apps/web/scripts/lab-rollout-status.mjs --lesson <id>` still ✅ for each lesson touched;
- `node apps/web/e2e/no-back-and-forth.mjs <the unit's lessons>`: 0 `OVER`;
- the walk of step 3 at both sizes, screenshots looked at.

## Documentation (same work)

- `docs/reports/MISSION_ROLLOUT_PROGRESS.md`: in the « Cross-lesson fix — a figure and its question on ONE screen » section, one line per
  unit (screens fixed, screens justified, numbers of the scan); in each lesson's section, any `LONE` kept on purpose and why.
- `docs/lessons/LESSON_DEVELOPMENT_GUIDE.md` « NO BACK-AND-FORTH »: any new pattern you introduce (a shared fix, a new case).

## Final report

Per unit: the commit; the screens fixed (lesson, module, step, what was on the other screen, the fix); the `LONE` screens kept and why;
the scan numbers at both sizes; saved-answer keys that changed; anything not done; a « Documentation Sync » section.
