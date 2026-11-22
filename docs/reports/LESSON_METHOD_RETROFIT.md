# Lesson method retrofit — « the textbook is the reference, not the script » on EVERY lesson (owner, 2026-10-14)

Reference lesson, validated by the owner: `kitabat-adad-tabii` (1AM). Rules: `docs/lessons/LESSON_DEVELOPMENT_GUIDE.md` §4ter (the textbook
fixes the الكفاءات, the platform designs the entry, examples and order), §4quater (one track per module), §4quinquies (the checklist of what was
done). The LabCoach onboarding is NOT part of this retrofit (own rollout: `LAB_COACH_ROLLOUT.md`).

## Status (the agent keeps this table current)

Lessons in scope: every published lesson — 1AM–3AM generated lessons (batches 1–2: `mana-jam-tarh`, `qisma-iqlidiya-baqi`, `qawaid-qabiliyat-qisma`,
`qisma-iqlidiya-hasr`, `ikhtizal-kitaba-kasriya`, …) first, then the 4AM units 1–14. Done: `kitabat-adad-tabii`, the five PHASE 1 lessons and 4AM unit 1 below, and 4AM units 2–14 (phase 2, 2026-10-15: see `LESSON_METHOD_RETROFIT_PHASE2.md`). A synthesis lesson (« أدمج تعلّماتي »)
keeps its fixed 9-module format: only §4quater item 3 (name after the answer) and the lab-first top apply where it has a lab.
Columns: lesson · entry chosen (and the book's activity moved where) · modules changed · destinations moved · tests/gates · screenshots reviewed.

| Lesson | Entry chosen (rejected) | Modules changed | Destinations moved | Tests / gates | Screenshots (1280×800 only, owner: no mobile) |
|---|---|---|---|---|---|
| `kitabat-adad-tabii` (1AM) | pencil workshop (the book's نشاط 1 → أتمرّن) | 1–3 (+ 5) | `act-1` → module 4 | reference, validated | — |
| `mana-jam-tarh` (1AM) | the health-check height gauge (the book's six texts stay as the advanced level of the SAME lab) | 1: no brief / title / lead, steps ask WHY (not « which calculation » — the lab asked), brick after the classification; 3: lab in `intro` with no brief, brick + Ines's dialogue after the « where does □ go » answer | none (activity already hosted by the advanced lab) | `1am-jam-tarh-ashriya.mjs` green; `moyen-retrofit-phase1.mjs` green | modules 1 and 3 top + lab; audit: brief card + workspace title/lead above the lab, brick before its question (3 places), two steps repeating the lab's calculation |
| `qisma-iqlidiya-baqi` (1AM) | the garden (47 flowers, bouquets of 6) (the book's 279 / 14 stays as the advanced level) | 1: no brief / title / lead, step 3 = remainder then WHY stop, brick after the answer; 2: opens on the 253 / 17 lab (no brief), « why 14 not 15 » first, the book's remark after the answer | none | `1am-darb-qisma-ashriya.mjs` green | modules 1 and 2 top + lab; audit: brief above the lab, brick before the answer, step 3 repeating the lab (« largest number of bouquets ») |
| `qawaid-qabiliyat-qisma` (1AM) | the 0–48 table coloured by hand (kept: the hand decides, each cell is judged by its remainder); rejected: exercise 26 cards as entry (it applies the rules) | 1: no brief / title / lead, the two bricks after their answers; 2: the rules box after the first question, bricks gated | none | `1am-qawaid-qabiliyat-qisma.mjs` green | module 1 top + lab; audit: a card listing the book's questions above the lab, two ungated bricks |
| `qisma-iqlidiya-hasr` (2AM) | Salma's basket (50 eggs, boxes of 12) (the book's 2145 / 30 stays as the advanced level) | 1: no brief; the 1AM « تذكّر » box moved AFTER the first answer (link kept); the son's division asks WHY it is refused (the lab already judged it); brick gated; 2: remark and definition boxes after the question they would answer | none | `2am-kusur-amaliyat.mjs` (recall assertion updated), green | module 1 top + lab; audit: brief + recall box above the lab, brick before its question, a step repeating the lab's judgment |
| `ikhtizal-kitaba-kasriya` (1AM) | grandmother's tray, the knife (the book's three rectangles + the grandfather's gift stay as the advanced level) | 1: no brief / title / lead, brick after the answer, the grandfather question asks WHY (the lab already made the student predict), the book's text after; 2: rule box after its first application, bricks gated | none | `1am-ikhtizal-kitaba-kasriya.mjs` green | module 1 top + lab; audit: brief with the book's questions above the lab, ungated bricks (module 1 and 2), a step repeating the lab's prediction |
| `awwaliyan-fima-baynahuma` (4AM u1) | school bags, 17 pens / 18 notebooks (coprime-explorer; the book's نشاط 7 as a card, and the 22 / 35 lists lab, rejected as first contact — the lists stay as advanced) | 1: no brief / lab titles, WHY only one kit worked, bricks after; step 2 asks what is enough to refute Maryam (the lab judged her); 2: lab opens, « is 15 prime ? », definition boxes after | none | vitest 18, gates, 1280 browser pass green | modules 1, 2 |
| `bahth-pgcd` (4AM u1) | sewing-workshop ribbons, small pair first (21/14, 45/18) (the book's 252/140, the 936/845 aprons challenge rejected as entry — it presupposes the method) | 1: no brief, WHY the PGCD does not change after a cut; 2: property / example boxes after the answer; 3: no brief, `euclidean-algorithm` first, bricks after the lab finishes | none | same | modules 1, 2, 3 |
| `ikhtizal-kasr` (4AM u1) | shared recipe, fraction-reduction kitchen lab (نشاط 8 Samir's chain as a card, rejected: answered from memory; it comes after the first answer, 84/48 stays advanced) | 1: no brief, WHY the value stays, bricks after; 2: lab opens, « why one division by 12 suffices », definition after the 15/22 question | none | same | modules 1, 2 |
| `khawass-qawasim` (4AM u1) | the construction site (divisor-properties walls), first question « why no half-brick » (نشاط 3 as three triplets to « verify », rejected; cases 2–3 become the application) | 1: no brief / scene, new step 1, cases 2–3 step 2; 2: `khassiya-1/2` after their questions | none | same | modules 1, 2 |
| `qasim-adad-tabii` (4AM u1) | the football pitch, 15 then 16 players (team-builder) (the book's 420 books « 26 or 28 ? » rejected as entry — a binary test — it stays advanced) | 1: no brief, WHY the 16th has no team, evidence from the student's own team trials, bridge box after; 2: lab opens, new step on 13, 4 steps instead of 3 | none | same; unit e2e could not run (see below) | modules 1, 2 |
| `qasim-mushtarak-akbar` (4AM u1) | 12 balls and 18 shirts in teams (the book's 90 / 54 roses rejected as entry — too big to SEE why a number fails — they stay advanced) | 1: no brief, WHY 4 teams fail, then the book's « 9 bouquets », step 3 asks per-colour counts (the old one repeated the lab); 2: split the PGCD-notation question in two (the gate flagged a brick-before-teaching), 4 steps instead of 3 | none | same | modules 1, 2 |
| `qawasim-adad-tabii` (4AM u1) | library rectangles (factor-pairs, 24 then 60) (the book's table of 60 = a × b rejected as entry) | 1: no brief, step 1 « what does a perfect rectangle give », `jidaa-aamilayn` after; 2: lab opens, « why 15 needs no test », method after the « up to which number » question | none | same | modules 1, 2 |
| `tayin-pgcd` (4AM u1) | identical bags, 8 pens / 12 notebooks (common-divisors) (the book's 42 / 60 consignes rejected as entry — they feed step 2 and stay advanced) | 1: no brief, WHY 3 bags fail although 3 divides 12, method box and `tayin-bil-hasr` after; 2: no-lab brief reworded (no fact), PGCD-without-lists first, bricks after | none | same | modules 1, 2 |

**Improved after looking (phase 1).** The first screenshots showed the coach bubble pinned over the lab's own header (target below the fold, edge mode — as designed, reviewed after scrolling the lab into view); the retrofit left every lab at the TOP of its module so the first gesture is visible at 1280×800. Question wording: « which calculation » repeated the lab, « why » does not.
**Phase 2, unit 1 (2026-10-15).** The eight lessons of `aadad-tabiiya-natiqa` (the synthesis `wadiya-idmajiya-aadad` keeps its fixed format, untouched) were retrofitted by four parallel agents (two lessons each) with the phase-1 lessons as the worked example, then verified together: `moyen-retrofit-phase1.mjs` now holds a block per lesson (lab selector + bricks hidden before the answer), vitest, `check:lessons` and the entry budget (322.8 KB) green. **Known limits of the unit.** (1) `coprime-explorer`, `pgcd-differences`, `euclidean-algorithm`, `factor-pairs` and `common-divisors` have no `onTrial` (only `onFinished`), so the evidence lines say whether the lab was finished but cannot quote the student's own numbers — adding `onTrial` to those labs is a kit task for the coach rollout. (2) `TeamBuilder`, `CommonDivisors` and the books lab show their built-in title and mission above the lesson's one-question `lead` (no `titleHidden` in those shells). (3) The unit's own e2e `4am-aadad-tabiiya-natiqa.mjs` times out on its anonymous visit to the unit page (`[data-unit=…]`, line 37) before reaching any lesson — three agents and I hit it; `UnitPage.jsx` is unmodified, so it predates this work; its assertions on module structure were not re-verified (`moyen-retrofit-phase1.mjs` covers the structure). **Phase 2 (units 2–14, all 4AM lessons) is done the same day: detail, per-lesson entries and the open points for the owner in [`LESSON_METHOD_RETROFIT_PHASE2.md`](LESSON_METHOD_RETROFIT_PHASE2.md).**
**Not done / judgement calls.** No new manipulation type was invented; in every lesson the platform entry was ALREADY the beginner lab, so the retrofit changed its place (top, no card), the questions and the order of bricks, and recorded the design in each `lesson.config.js` header. The book's activity was not moved (it is hosted by the advanced level of the same lab), hence no `build-extraction.py` change. Modules 3–9 of each lesson (practice, مسائل, test) are untouched, except `mana-jam-tarh` module 3. The gate (guide §4quater) is NOT added yet: the 4AM lessons are not retrofitted.

## The prompt (paste into a fresh session; one batch = N lessons, resumable from the table)

```
Retrofit of the lesson method — apply « the textbook is the reference of the الكفاءات, not the script of the lesson » to EXISTING lessons.
PHASE 1 = the 1AM–2AM lessons ALREADY GENERATED on the cycle-moyen rollout (kitabat-adad-tabii is the reference and is done): mana-jam-tarh,
qisma-iqlidiya-baqi, qawaid-qabiliyat-qisma, qisma-iqlidiya-hasr (2AM), ikhtizal-kitaba-kasriya — 5 lessons, all in this one run, in this
order (read docs/reports/MOYEN_ROLLOUT_PROGRESS.md for what each one did). Later phases (not now): the 4AM units.

Read first: CLAUDE.md, docs/README.md, docs/reports/LESSON_METHOD_RETROFIT.md (status), docs/lessons/LESSON_DEVELOPMENT_GUIDE.md §4ter, §4quater,
§4quinquies, §5 (« Discovery pass », « Values in story contexts »), §14; docs/architecture/MANIPULATION_DNA.md §1–§2, §16, §17.9–§17.10;
docs/architecture/KNOWLEDGE_DEPENDENCY.md; and the reference lesson end to end:
apps/web/src/lessons/moyen/1am/ansab_al_aadad_wal_hisab/adad-tabiiya-ashriya/kitabat-adad-tabii/ (lesson.config.js header, modules 01–05,
content/textbook.js › WORKSHOP, content/exercises.js › 'act-1', knowledge.jsx, knowledgeGraph.js) and `git log -p` of its redesign.

Take the PHASE 1 lessons listed above, one after the other (a lesson is finished — audited, redesigned, tested, screenshots reviewed, table updated — before the next). For EACH lesson:
1. AUDIT, writing the findings in the table before changing anything: for every module — what is on top of the page (a brief / card of textbook
   questions above a lab? two competing starts?), does a question repeat what the lab already asked, are bricks / definition boxes visible BEFORE
   the answer, does a step title state its answer, is the entry the book's activity copied as is, which textbook examples could be replaced by
   the student's own numbers.
2. DESIGN the entry per §4ter: list at least two candidate entries (the book's activity + a platform situation where the idea becomes NECESSARY
   for the hand — MANIPULATION_DNA §1–§2), choose, and write the choice, the rejected candidates and the order of ideas in the
   `lesson.config.js` header. The mathematics, the الكفاءات (ids and order), the programme items and the boundary with neighbouring lessons DO
   NOT change. If a better entry needs a lab that does not exist, reuse an existing registry type or keep the current lab and only change its
   place and the questions — never invent a new manipulation type in this retrofit.
3. APPLY §4quinquies to every module: lab (or first question) at the top with NO brief and no workspace title / lead above it; questions on what
   the student did, in their own numbers, with the non-blocking evidence line; bricks and naming boxes only after the answer; no question
   that repeats the lab; step titles are questions; the book's activity (when not the entry) becomes an application in أتمرّن with its
   destination moved in `docs/sources/<g>/unit<N>/build-extraction.py` (rebuild `extraction.json`); knowledge items and map nodes that
   quoted the book's numbers quote the student's own; the new `addition('platform_designed_entry')` / lab resource reason
   `platform_designed_entry` where the lab is the designed entry. Keep `done` on ANSWERED (never on correct), `requires` honest
   (`audit:knowledge:gate`), values woven into stories, Arabic/RTL rules, « أتوقّع القاعدة » intact.
4. KEEP the lesson publishable: module count and numbers, slugs and URLs, `lesson.config.js` `modules[]` ↔ files, `estimatedDurationMin ≤ 90`,
   the final test and « مسائل » untouched unless a question there repeats a changed idea. Regenerate what depends on it
   (`npm run generate:lesson-index` only if modules changed; `node packages/core/curriculum/exportContentRegistry.mjs` + the local import so the
   owner sees it; the lesson memo and knowledge map still pass).
5. TEST: extend the lesson's content test (moved activity keys, WORKSHOP-style data recomputed by integers), the e2e `lesson-kit/<unit>.mjs`
   assertions (« no [data-module-brief] above the lab », « brick hidden before the answer »), run web tests FROM apps/web, then from the repo root
   `npm run check:lessons` (includes check:textbook, audit:knowledge:gate, the 330 KB entry budget) and `npm test` once per batch. In the browser
   (Playwright, 1280×800 / 390×844 / 320×640, student and teacher): open every changed module, answer the questions, confirm the single track
   reads top to bottom, no « aucun item », no horizontal overflow, no raw `$`/keys; LOOK at screenshots of each changed module and iterate.
6. DOCUMENT: update the table (entry chosen, what moved, screenshots reviewed, what you improved after looking), the lesson's section in
   docs/reports/MOYEN_ROLLOUT_PROGRESS.md or the unit's report, and any contract you extended. Follow the documentation synchronization rule.

Do NOT add the gate yet in phase 1 (the 4AM lessons are not retrofitted and would fail it). When ALL lessons of ALL phases are done, add a gate to `check:lessons` that fails (a) a content module with a `brief` AND an `intro` lab above its steps
(except the ones declared `briefOverLab: '<reason>'`), (b) a `ManipulationWorkspace` with `title` / `lead` in a module, (c) a `KnowledgeBrick`
rendered before the first question of its step without a gate — document it in guide §4quater.
Start the dev server and the API only for the browser checks and stop them at the end, by pid (never `pkill -f` a pattern). Do NOT commit or push unless I ask.
End each batch with: per lesson — entry chosen vs rejected, modules changed, screenshots reviewed, improvements; the updated table; the prompt
for the next batch. End with the Documentation Sync section.
```
