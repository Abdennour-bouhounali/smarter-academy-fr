# Lesson method retrofit — PHASE 2: the 4AM units 2–14 (2026-10-15)

Detail of the retrofit « the textbook is the REFERENCE of the الكفاءات, not the script of the lesson » on the 4AM units 2–14 (everything except unit 1, which is
in [`LESSON_METHOD_RETROFIT.md`](LESSON_METHOD_RETROFIT.md)). Method, rules and phase-1 table there; guide §4ter–§4quinquies. Done by 31 agents of one or two lessons each
(brief: the same checklist as phase 1), then verified together: `apps/web/e2e/lesson-kit/moyen-retrofit-phase1.mjs` (one block per lesson: lab selector,
bricks hidden before the answer, no brief card above the lab, no overflow, no raw `$`, no page error; desktop 1280×800 only — owner: no mobile), web vitest,
`npm run check:lessons` and the 330 KB entry budget. Per lesson below: entry chosen (rejected → where it went), modules changed. « No destination moved » holds
for every lesson (no `build-extraction.py` change).

**Synthesis lessons** (« أدمج تعلّماتي », `wadiya-idmajiya-*`) kept their fixed 9-module format: only module 7 (the lab) was touched — brief card removed, the
situation statement moved into step 1, workspace title / lead removed, bricks gated — except `wadiya-idmajiya-judhur` (no lab: unchanged), `wadiya-idmajiya-taalufiya`
and `wadiya-idmajiya-khattiya` (the situation brief is KEPT above the lab: it is the statement of steps 1–8; judgement call, documented in their headers).

## Per unit

### hisab-judhur: amaliyat-judhur + jidhr-tarbii (done)

entries: amaliyat = square tiling beginner (36=4x9) kept as entry, tables→steps 2-8; jidhr-tarbii = square on BC area 5 refined by hand (tank challenge → step 7)

- **note: no onTrial on square-root-side; unit e2e unit-page step redirects to /register (pre-existing)**

### hisab-harfi: tahlil-ibara + wadiya-idmajiya-harfi (done)

tahlil-ibara: entry = football turf (turf-factoring rows 9x+3) (rejected: Imane's notebook as opening → application step 3). M1, M2 changed (M2 opens on x²+25 contrast lab, levels={false}; order contrast→definition).

wadiya-idmajiya-harfi: minimal: Module07 only (no brief, lab lead = context, step 1 asks what stayed fixed).


### hisab-judhur: tawzif-khawass-judhur + wadiya-idmajiya-judhur (done)

tawzif: entry = square-tiling 32 then 288 (book ex 1 → application step 2). M1, M2 (brick gated), M3 (brick after reveal). synthesis: no change (no lab; rappel bricks kept; 6 W_PRIOR_NOT_DIAGNOSED medium warnings pre-existing).


### hisab-judhur: muadalat-x-murabba + natiqa-ghayr-natiqa (done)

muadalat-x-murabba: entry = Murad/Omar debate x²=9 on the folding line (rejected: table of squares from memory); M1 (7 steps), M2. natiqa: entry = graduated ruler on 3 areas (9, .25, 7) (rejected: printed classification then √169); M1, M2 (ghayr-natiq gated), M3 brief reworded.

- **note: square-fold no onTrial; natiqa m2 teacher free-nav sees empty step 2 until step 1 answered**

### hisab-harfi: mutatabiqat-shahira + nashr-tabsit (done)

mutatabiqat: entry = pitch-expansion (x+3)² then (x−2)² (rejected: act 2 MNPQ from memory → step 2; worker/trainer stories → closing applications); M1 (13 steps), M2, M3. nashr-tabsit: entry = school pitch 3(x+5) (rejected: act 1 as 3 computed consignes → steps 1–3 / advanced); M1, M2.

- **note: pre-existing BatchChoiceQuestion row overlaps chips in nashat-murabba step 2 (kit layout, not fixed)**

### jumal-muadalatayn: hall-jabri + mafhum-jumla (done)

hall-jabri: entry = kiosk cards elimination-cards (x+y=10; x−y=2), the hand makes an unknown disappear (rejected: book q أ,ب as entry; riddle card → step 6 transfer); M1, M2 (3 bricks gated). mafhum-jumla: entry = club season card pair-scoreboard football (10 matches 22 pts) (rejected: challenge+activity card; 37 coins → step 5 transfer); M1, M2.

- **note: both beginner labs set experience.reason=platform_designed_entry (owner to confirm for football/kiosk worlds)**

### jumal-muadalatayn: mushkilat-jumla + wadiya-idmajiya-jumal (done)

mushkilat-jumla: entry = derby story-modeller (20 tickets 4800 DA), the lab refuses 300x+150y=20 (rejected: museum as only entry → advanced); M1 (4 WHY steps; old translation batch / PairQuestion / verification batch dropped), M2. synthesis: Module07 only (brief removed, situation moved into step 1, analysis gated).

- **note: unit e2e 4am-jumal-muadalatayn.mjs line ~187 loops mushkilat levels — may need a look**

### ashia-insihab: barahin-ashia + insihab-shuaa (done)

barahin-ashia: entry kept = 4-station Algiers metro (rejected: ex 18 proof posed first → advanced); M1 (WHY chaining accepted), M2 (method box + conclusions after answer), M3 (no brief, lead=دوري الآن). insihab-shuaa: entry kept = drone show beginner (rejected: نشاط 1 as plain entry → advanced); M1 (no card; steps = book Qs unchanged — only partly tied to student's trials), M2/M3 bricks gated, requires shifted down.

- **note: DroneShowVignette.jsx now unmounted (file left). unit e2e unit-page step pre-existing failure.**

### muadalat-mutarajihat: mutarajiha-ula + tarrid-mushkila + wadiya-idmajiya-muadalat (done)

mutarajiha-ula: entry kept = solution-ray on Younes's credit (book's own activity; no platform_designed_entry) (rejected: statement card; Riyad 600 DA → masala 1); M1 (WHY 20 enough/21 not), M2 (brief+title removed, batch → one question), M3 (brick after). tarrid-mushkila: entry kept = growth-race age (platform); M1, M2 (3 bricks gated). synthesis: Module07 only (statement into step 1).

- **note: tarrid lab left platform_adaptation (owner may want platform_designed_entry)**

### ashia-insihab: majmu-shuaayn + shuaayn-mutasawiyayn + wadiya-idmajiya-ashia (done)

majmu-shuaayn: entry = scooter in Alger vector-sum (platform_designed_entry) (rejected: swimmer challenge → advanced/step 2); M1 now 4 steps, M2 gated. shuaayn-mutasawiyayn: entry = tifo scarf parallelogram-pin (platform_designed_entry) (rejected: نشاط 2 ب → steps 2–4); M1, M2, M3 (defaultLevel advanced); TifoVignette now unused. synthesis: Module07 only.

- **note: unit e2e may count majmu M1 steps (3→4); advanced swim lab keeps built-in title**

### dawaran-mudalaat: khawas-dawaran + mafhum-dawaran (done)

khawas: entry = Tlemcen tracing paper shape-turn (platform_designed_entry) (rejected: p.155 method [AC]/[BD] → advanced, module 3); M1, M2, M3 (defaultLevel→advanced). mafhum: entry = Ben Aknoun Ferris wheel rotation-dial (platform_designed_entry) (rejected: نشاط 1 three shapes → application); M1, M2, M3. ZelligeVignette/FerrisVignette unmounted.


### dawaran-mudalaat: mudalaat-muntazama + zawiya-muhitiya + wadiya-idmajiya-dawaran (done)

mudalaat: entry = beehive cell polygon-forge (platform_designed_entry) (rejected: flag-star تحدّ → advanced, step 4); M1, M2 (new first question). zawiya: entry = shooter on circle inscribed-angle (platform_designed_entry) (rejected: نشاط 4 → advanced, steps 2-3); M1, M2, M3. synthesis: Module07 only. ShootingVignette etc. unmounted.


### ashia-maalam: muntasaf-masafa + murakkibata-shuaa + wadiya-idmajiya-maalam (done)

muntasaf: entry = GPS meeting-pin midpoint-distance (platform_designed_entry) (rejected: تحدّ 6.4cm → M1 step 3 / module 3); M1 reordered, M2, M3. murakkibata: entry = delivery app component-steps (platform_designed_entry) (rejected: نشاط 1 → advanced); M1, M2, M3 (lab to intro). synthesis: Module07.

- **note: unit e2e ashia-maalam not run by that agent; maarif M3 definition box still before question (applies definition)**

### muadalat-mutarajihat: jidaa-maadum + muadala-ula (done)

jidaa: entry = training pitch vanishing-pitch 3(x−5) (platform_designed_entry) (rejected: نشاط 2 « انقل وأكمل » → step 2); M1, M2 (lab opens). muadala-ula: entry = locker-room balance equation-balance 3x+2=11 (platform_designed_entry) (rejected: calculation program → step 2); M1, M2. BalanceVignette/HOOK unused.

- **note: KnowledgeSnapshot footer (shared kit) shows brick text under module M1 for teacher free-nav — not checked for student**

### ashia-maalam: hisab-murakkibatay + ithbat-khawas-maalam (done)

hisab-murakkibatay: entry = beginner portals A(1;2) B(4;3) component-calc (platform_designed_entry) (rejected: نشاط 2 as written → advanced + M1 steps 3–6); M1 now 6 steps, M2, M3 (lab first, advanced default); knowledge.jsx predictPrompts reworded (farq-ihdathiyat, nuqta-majhula). ithbat-khawas-maalam: entry = VAR pitch shape-prover (platform_designed_entry) (rejected: p.145 method → advanced/module 3); M1, M2, M3.

- **note: GameMapVignette unused; PredictRule student flow not seen (teacher free-nav)**

### handasa-fada: kura-julla + maqati-mustawiya (done)

kura-julla: entry = glass lamp-globe sphere-probe R=3 (reason left smaller_numbers_for_first_contact) (rejected: نشاط 1 circle/disc → advanced, after first answer); M1 (new WHY step 1), M2 (bricks after answers, new q4a), M3. maqati: entry = fablab 3D printer section-slicer R=5 (reason unchanged) (rejected: نشاط 2 IM² first → advanced); M1 (new WHY step 1), M2, M3. requires ratio of kura 24/24→16/24 (expected).


### handasa-fada: misaha-hajm-kura + takbir-tasghir + wadiya-idmajiya-fada (done)

misaha: entry kept = orange of Boufarik orange-peel (platform_designed_entry both levels) (rejected: Archimedes text + 4 cylinder questions as opening → step 3); M1 (3 steps), M2, M3, M4 brief reworded. takbir: entry kept = cube construction game scale-blocks (platform_designed_entry beginner only) (rejected: نشاط 6 first → advanced steps 2–5); M1 (new WHY step 1, now 5 steps), M2, M3, M4 brief reworded. synthesis: Module07 only. VoxelVignette orphan.


### hisab-muthallathat: nisab-muthallathiya + tarrid-muthallathiya + wadiya-idmajiya-muthallathat (done)  [URL domain = handasa]

nisab: entry = skatepark ramp ramp-ratios 30° (platform_designed_entry) (rejected: نشاط 1 25° figure from memory → "in the book's triangle" after student readings); M1, M2. tarrid: entry = mural ladder clinometer (advanced level) (rejected: floodlight; brief card stating the challenge); M1 defaultLevel beginner→ADVANCED (reverses 2026-10-09 'open on مبتدئ' — OWNER TO CONFIRM). synthesis: Module07 only. SkateparkVignette unmounted.

- **note: KnowledgeSnapshot footer lists bricks as "new" before answer (shared kit, pre-existing)**

### ihsa: mada-wasit-mutawassit + majdulat-ihsaiya (done)  [URL domain = tanasubiya_duwal]

mada: entry = esport balance stat-balance (platform_designed_entry) (rejected: activity 3 salaries, activity 4 11 salaries → applications); M1 (evidence line), M2 (6 steps, new WHY curtain). majdulat: entry = sheet-lab beginner 5 quiz scores (default level, platform_designed_entry) (rejected: ex-7 card → advanced + steps 1–4); M1, M3, M4.

- **CAUTION: audit:knowledge:gate CRITICAL lexicon C_TARGET_DEMANDED_BEFORE_TAUGHT « moyenne » in majdulat-ihsaiya Module01Majdul step 3 (=MOYENNE(A1:F1) quoted before dasatir-arbaa brick) — exit 0 but must be resolved. Last browser edit of mada M2 step 1 not browser-checked (server down at that moment).**

### hisab-muthallathat: alaqat-muthallathiya + hasiba-muthallathiya (done)  [URL domain = handasa]

alaqat: entry kept = kite lab مبتدئ sin x=3/5 (platform_designed_entry) (rejected: نشاط 5 table 0,87²+0,50²=1,0069 → steps 2–3); M1, M2 (new step 1), M3 (lab to intro). KiteVignette unused. hasiba: entry kept = drone calculator 30/45/60° (platform_designed_entry) (rejected: نشاط 4 seven angles → advanced); M1, M2. 

- **NOTE: hasiba gate has 3 CRITICAL C_TARGET_DEMANDED_BEFORE_TAUGHT (cosinus, sinus, tangente) — PRE-EXISTING (verified by swapping original M2 back).**

### dala-taalufiya: mafhum-taalufiya + tafsir-bayani-jumla (done)  [URL domain = tanasubiya_duwal]

mafhum: entry = taxi ride affine-meter 100DA+40DA/km (platform_designed_entry) (rejected: payroll text card, "verify 36850" → advanced); M1 (5 steps, book activity step 3), M2 brief reworded, M3. tafsir: entry = two laser beams line-crossing 2x−y=1, x+y=5 (platform_designed_entry) (rejected: coins text card → step 3); M1 (6 steps), M2.


### dala-taalufiya: tarrid-taalufi + wadiya-idmajiya-taalufiya (done)

tarrid-taalufi: entry = game hall plan-compare 500DA once + 150DA/h (platform_designed_entry) (rejected: supporter bill نشاط 4 → advanced, steps 2–4); M1 (5 steps), M2, M3. synthesis: Module07 title/lead removed; situation BRIEF KEPT above the lab (judgement call: statement for steps 1–8; documented in headers).

- **note: unit e2e dala-taalufiya timed out (unit-page step); dev server reset connections for a while mid-run (it was down; restarted by parent)**

### dala-taalufiya: tamthil-bayani-taalufi + tanasub-taghayyurat (done)  [URL domain = tanasubiya_duwal]

(a duplicate agent for tanasub-taghayyurat was started by mistake and stopped within seconds — verify tanasub-taghayyurat files are coherent in final gates)

tamthil: entry = skatepark ramp lifted onto a base, affine-line beginner ½x+2 (platform_designed_entry) (rejected: نشاط 3 card with g figure + 4 calc questions → advanced); M1, M2, M3 (hidden-line lab to intro). tanasub: entry = cadets' subscription 100+50/match slope-stairs beginner (platform_designed_entry) (rejected: نشاط 4 card + 7 matches/3400DA/14 matches → advanced); M1 now 5 steps, M2.

- **note: steps written for advanced numbers while beginner is default (pre-existing in tamthil M1 step 1)**

### ihsa: qiraat-wadiyat-ihsaiya + takrar-mujamma + wadiya-idmajiya-ihsa (done)  [URL domain = tanasubiya_duwal]

qiraat: entry kept = group-tanks beginner (bet 9.5, water stops at 9) (reason left smaller_numbers_for_first_contact) (rejected: two-class table first → step 3 after bet); M1, M2, M3. takrar: entry = funpark height gate cumul-gate (platform_designed_entry) (rejected: reading the 20-value list); M1, M3. synthesis: Module07 (brief → step 1 [data-situation="midaliyat"]).


### tanasubiya-dala-khattiya: tatbiqat-tanasub + wadiya-idmajiya-khattiya (done)  [URL domain = tanasubiya_duwal]

tatbiqat: entry kept = percent-tag +5% on 1200DA (book's own activity; reason unchanged) (rejected: نشاط 5 girls %/fuel → applications); M1 (5 steps), M2 brief, M3. SoldesVignette orphaned. synthesis: Module07: workspace title removed, تحليل الوضعية gated; BRIEF KEPT + lab titles/lead kept (does NOT strictly follow lab-first — judgement call).

- **note: check:lessons not run by that agent; unit e2e only references al-wadiya**

### tanasubiya-dala-khattiya: dala-khattiya + tamthil-bayani-khatti (done)  [URL domain = tanasubiya_duwal]

dala-khattiya: entry = hidden-rule machine linear-machine, souk/Eid discount (book's own activity; reason empty) (rejected: table filled from memory → follows student's trials); M1, M2 (brief kept). tamthil: entry = cable-car origin-line (book's own; reason unchanged) (rejected: completing table f(0),f(1),f(4) first); M1, M2 (brief reworded).

- **note: PredictRule property boxes appear open in teacher session (design); dala-khattiya lead revert not re-browser-checked**

### khassiyat-talis: aksiya-talis + inshaat-talis + talis-hisab-atwal + wadiya-idmajiya-talis (done)  [URL domain = handasa]

aksiya: entry = double ladder on the neighbourhood wall parallel-level (platform_designed_entry) (rejected: نشاط 2 card of 3 student figures → step 1 opening under lab); M1, M2 (3 bricks gated). inshaat: entry = derby tifo banner segment-divider (platform_designed_entry) (rejected: طرائق p.107 → step 4); M1, M2 (دوري الآن lab to intro). talis-hisab-atwal: entry = «ساحة الحيّ» shadow-world (platform_designed_entry) (rejected: نشاط 1 general-letters figure → step 4); M1, M2, M3. synthesis: Module07 (situation → step 3). MuralVignette, TifoVignette unused.


### tanasubiya-dala-khattiya: tanasub-muamil + tarrid-khatti (done)  [URL domain = tanasubiya_duwal]

tanasub-muamil: entry = scooter ride-meter ratio-ride beginner (platform_designed_entry) (rejected: Eid-discount activity → steps 2–3; opening on definition); M1 (rappel brick before step 3 removed), M2 (every step question first; step 4 new first question). tarrid-khatti: entry kept = cable-car origin-line beginner (platform_designed_entry) (rejected: نشاط 4 three graphs → step 1; spring a=0.3 → advanced); M1, M2.

- **note: unit e2e 4am-tanasub-muamil.mjs failed at ratio-ride visible (line 87) — not diagnosed**

## Open points for the owner (collected from the agents)

1. **`tarrid-muthallathiya`**: the lab now opens on the MATHEMATICAL level `advanced` (the module's steps are about the ladder) — this reverses the 2026-10-09 « open on مبتدئ » choice. Confirm, or restore `defaultLevel="beginner"`.
2. **`experience.reason: platform_designed_entry`** was set on the beginner lab of most lessons where that lab is a platform situation (football, kiosk, esport…). Where the lab is the book's own activity (e.g. `tatbiqat-tanasub`, `dala-khattiya`, `tamthil-bayani-khatti`, `mutarajiha-ula`, `kura-julla`, `maqati-mustawiya`, `qiraat-wadiyat-ihsaiya`) the reason was left unchanged.
3. **Evidence lines** in labs without `onTrial` (`coprime-explorer`, `pgcd-differences`, `euclidean-algorithm`, `factor-pairs`, `common-divisors`, `square-root-side`, `square-fold`, …) say whether the lab was finished but cannot quote the student's own numbers — a kit task (add `onTrial`) for the coach rollout.
4. **Lab shells without `titleHidden`** (`TeamBuilder`, `CommonDivisors`, `vanishing-pitch`, `equation-balance`, the advanced swim lab…) still show their built-in title above the lesson's one-question `lead`.
5. **Audit CRITICAL lexicon findings (`C_TARGET_DEMANDED_BEFORE_TAUGHT`, gate still exits 0)**: three in `hasiba-muthallathiya` (cosinus / sinus / tangente — PRE-EXISTING, verified by swapping the original module back) and one in `majdulat-ihsaiya` module 1 step 3 (« moyenne »: the question quotes `=MOYENNE(A1:F1)` before the `dasatir-arbaa` brick; the student has already typed that formula in the beginner lab). Left open rather than putting the brick back above the question.
6. **Unused vignette components** (files left in place, no longer mounted): `DroneShowVignette`, `TifoVignette`, `ZelligeVignette`, `FerrisVignette`, `BalanceVignette`, `GameMapVignette`, `KiteVignette`, `MuralVignette`, `SkateparkVignette`, `VoxelVignette`, `SoldesVignette`, … — delete when convenient.
7. **The unit e2e scripts** `apps/web/e2e/lesson-kit/4am-*.mjs` could not be exercised: their first step visits the unit page anonymously and times out / redirects to /register (`UnitPage.jsx` untouched — predates this work; `4am-tanasub-muamil.mjs` also failed at `ratio-ride` visible, line 87, undiagnosed; `4am-jumal-muadalatayn.mjs` ~line 187 loops `mushkilat-jumla` levels and may need a look). Their module-structure assertions were not re-verified; `moyen-retrofit-phase1.mjs` covers the structure instead.
8. The shared `KnowledgeSnapshot` footer lists a module's bricks before the student answers (seen with the free-navigation teacher login; not checked for a student).
9. Not browser-checked after the agents' last edits: `mada-wasit-mutawassit` module 2 step 1 wording, `dala-khattiya` module 1 lead revert.

## Gate (not added yet)
The `check:lessons` gate described in the phase-1 prompt (a module with both a `brief` and an `intro` lab, a `ManipulationWorkspace` with `title` / `lead`, a `KnowledgeBrick` before the first question of its step) is still NOT added: the synthesis lessons keep some of those shapes on purpose (`briefOverLab`). Add it once the owner has reviewed this retrofit.

