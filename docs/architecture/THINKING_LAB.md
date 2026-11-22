# « مختبر التفكير » — The thinking space contract

> **Status.**
>
> - **Phase 0 (« Foundations »), 2026-10-30, implemented:**
>   - the content model;
>   - the answer check, including the `expression` evaluator in JS and PHP with one shared fixture;
>   - per-student numbers;
>   - the content pipeline: schema → validator → oracle → generated index, in `check:lessons`.
> - **Phase 1 (« Ladder core »), 2026-11-01, implemented:**
>   - the two tables;
>   - the server (repository, presenter, honest attempts, keys, the gate, postpone, twin credit, ceiling and parts);
>   - the student API;
>   - screens 1–3 with the replay player and sounds;
>   - the access key;
>   - the deploy step;
>   - the seed bank, 46 challenges, all published.
> - **Planned, not yet implemented:** everything marked *Planned* below, which is phases 2–7 of
>   [`reports/THINKING_LAB_PLAN_2026-10-30.md`](../reports/THINKING_LAB_PLAN_2026-10-30.md). The plan stays the authority for
>   what is not built yet, and its §2 owner decisions D1–D10 are binding. This contract is the authority for what exists.
> - Content: [`curriculum/THINKING_LAB_CHALLENGE_BANK.md`](../curriculum/THINKING_LAB_CHALLENGE_BANK.md).

## 1. What it is

A student space that trains problem solving and critical thinking. The student tries first, then watches a
replay of a mathematician's thinking. The method is SMART (Scan, Math translate, Aim, Relate, Test) plus
« 👁 الملاحظة », observation used as a lens in every phase.

| Path | Content | Status |
|---|---|---|
| 1 · « سُلَّم التحدّيات » | numbered puzzles outside the curriculum, primary → university, band hidden | **implemented** (phase 1) for independent students; the teacher request flow is *Planned* (phase 2) |
| 2 · « مسار المنهاج » | problems tied to each grade's lessons, the « مسرح العقل » | *Planned* (phase 6) |

## 2. Where the code lives

```
content/thinking-lab/
  _schema/challenge.schema.json        the challenge schema (§3)
  _fixtures/expressions.json           JS ↔ PHP fixture of the expression evaluator (§4.2)
  _fixtures/answers.json               JS ↔ PHP fixture of the answer checker (§4.1)
  _fixtures/params.json                JS ↔ PHP fixture of per-student numbers (§3.3)
  challenges/<NNNN>-<id>.json          one file per challenge (46 published)
  index.generated.json                 GENERATED, checked in, SERVER-ONLY (§5.3)
packages/core/thinkingLab/             pure logic, imported BY PATH, never through the core barrel
  expression.js  checkAnswer.js  params.js
apps/api/
  config/thinking_lab.php              content path, edition, every gate threshold (§6)
  app/Domain/ThinkingLab/
    ExpressionEvaluator.php  AnswerChecker.php  Params.php      mirrors of the core JS (shared fixtures)
    ChallengeRepository.php            reads the generated index
    ChallengePresenter.php             the ONLY door to the client (§6.5)
    GateService.php                    the state machine, honest attempts, keys, replay, extras (§6)
    LadderService.php                  reach, open places (§6.1)
    ThinkingLabException.php           closed refusal reasons
  app/Http/Controllers/ThinkingLabController.php
  app/Models/ThinkingLabProgress.php  ThinkingLabAttempt.php
  database/migrations/2026_11_01_000001_create_thinking_lab_tables.php
apps/web/src/
  services/thinkingLabService.js
  pages/student/thinking/{ThinkingLadderPage,ThinkingChallengePage,ThinkingNumberPage}.jsx   lazy routes
  features/thinkingLab/
    thinkingModel.js                   pure helpers: state in words, phases, LTR math islands, Algiers time
    ThinkingParts.jsx                  MathRun, ChallengeFigure, AnswerInput, PhaseChip, SoundToggle, prettyMath
    ladder/LadderHome.jsx              screen 1
    workspace/Workspace.jsx            screen 2
    replay/ReplayPlayer.jsx  replay/AfterSolve.jsx   screen 3
    figures/                           one SVG component per figure + index.js (lazy glob) + palette.js (§7.2)
  i18n/locales/ar/thinking.json        on-demand namespace
scripts/
  build-thinking-lab-index.mjs  validate-thinking-lab.mjs  thinking-lab-oracle.test.mjs
  thinking-lab-oracle/{seed,primary,middle,secondary,university}.mjs
  lib/jsonSchemaSubset.mjs
```

**Bundle rule** ([`BUNDLE_BOUNDARIES.md`](./BUNDLE_BOUNDARIES.md) §3–§4):

- `packages/core/thinkingLab/*` is imported by path.
- The three pages are `lazy()`, the namespace `thinking` is on demand, and every figure is its own lazy chunk.
- The entry carries only the nav labels and `common.apiErrors.thinkingLab`. Measured on 2026-11-01: 237.8 KB gzip
  (budget 245); the `--chain features/thinkingLab` probe finds no path into the entry.
- `content/thinking-lab/` holds the answers. **No web module may import it**; `features/thinkingLab/serverOnly.test.js`
  scans the sources to enforce this.

## 3. Content model

### 3.1 A challenge

Every field is required, and `null` is written when a field does not apply. The exception is `whiteboard`,
which may be left out. The schema is `content/thinking-lab/_schema/challenge.schema.json`.

| Field | Meaning |
|---|---|
| `id` | stable slug. It never changes; links and progress use it. |
| `number` | position in the current edition. The file name is `String(number).padStart(4,'0')-<id>.json`. |
| `title` | Arabic title for authors and teachers. The student sees the number only (the presenter never sends it). |
| `status` | `draft` or `published`. In `--strict` mode nothing stays `draft` (owner rule). |
| `family` | `logic`, `numbers`, `patterns`, `algebra`, `geometry`, `counting`, `probability`, `functions`, `analysis`, `invariants` or `critical`. |
| `band` | **hidden**; it must match the number (§3.2). |
| `summit` | `true` exactly for multiples of 25. |
| `licence`, `source` | `PD`, `FOLK` or `TYPE`, plus what inspired it (challenge bank §1). Never a copied statement. |
| `examTag` | `bem`, `bac` or `null`; shown as « فكرة تتكرّر في امتحان … ». |
| `rating` | the author's initial estimate (Elo scale, 400–3000). |
| `statement` | Arabic text with maths in plain Unicode (no LaTeX). `{name}` placeholders are filled from `params`. Line breaks are kept on screen. |
| `figure` | `{kind: "svg", component, props}` or `null` (§7.2). |
| `whiteboard` | optional `{seed, observe[]}`: the observation targets. Unused until phase 3. |
| `params` | `{vars: {name: [values…]}}` or `null` (§3.3). |
| `answer` | §4. |
| `parts` | summits: 1 or more follow-ups `[{prompt, answer}]`, shown once the main answer is solved or the gate is open. The statement asks only the main question, and only `answer` drives the gate. |
| `mistakes` | frequent wrong answers and their « ليس بعد » reply (§4.3). |
| `keys` | 1–3 entries; a published challenge has exactly **3** (S → 👁 → R). Each key is a question and never gives the answer. |
| `example` | the primary band's worked example `{statement, steps[], answer}`, shown BEFORE trying. It is required for that band and `null` for the others. |
| `replay` | steps `{phase, think, layers?, math?, ask?}`. The phases are `S M A R T O B` (O = 👁 observation, B = ↩ dead end). |
| `keyMoves` | 1–3 sentences: the short replay for a student who solved alone. |
| `move` | `{id, title}`: the thinking move. Two challenges may share a move id; the card levels up in phase 4. |
| `twin` | the id of the twin challenge, or `null`. |
| `ceiling` | « ارفع السقف » `{statement, answer}`, or `null`. |

### 3.2 Hidden bands

| Numbers | Band | Mode (enforced by the gate, §6) |
|---|---|---|
| 1–120 | `primary` | example first (`example` required); the replay opens after 3 attempts **with no day of waiting** (`gate.primary_think_hours` = 0) |
| 121–260 | `middle` | try first: 3 attempts + 24 h |
| 261–420 | `secondary` | try first: 3 attempts + 24 h |
| 421+ | `university` | try first: 3 attempts + 24 h |

### 3.3 Per-student numbers (`params`)

- **Tuple choice:** a student's tuple is `fnv1a32("${userId}:${challengeId}:${edition}") mod tupleCount`.
  - The hash is FNV-1a, 32 bits, over UTF-8 bytes.
  - Variables are sorted by name, and the last one varies fastest.
- **Mirrors:** `params.js` and `Params.php` both pass `_fixtures/params.json`.
- **Storage:** the tuple index is stored in `thinking_lab_progress.params_index` when progress is created, so a change of
  edition never changes a student's numbers in the middle of a challenge.
- **Filling:** `{name}` is replaced in every string.
  - `answer.value`, `mistakes[].value` and `scaleWith` are filled **between parentheses** (`{a}^2` with a = −3 reads `(-3)^2`).
  - An `integer` or `rational` answer may therefore be a constant expression after filling (`{n}*({n}-1)/2`). It is read
    **exactly**: + − × ÷ and integer powers, through `exactValue` in JS and `AnswerChecker::exactValue` in PHP. √ and π are
    not allowed there; use `number`.
  - The screen shows the computed value (« 21 », never the filled template).

## 4. Checking an answer

### 4.1 Checks

| `answer.check` | How it is checked |
|---|---|
| `integer`, `rational` | the expected value is read exactly (§3.3), then the check is delegated to the practice evaluator (`answerEvaluator.js` / `AnswerEvaluator.php`) as `answerType: "rational"`. `tolerance` is a rational. The student types a number, fraction, decimal or %. |
| `choice` | delegated as `answerType: "choice"`. `value` is the id of the correct choice, and `choices` is `[{id, text}]`. |
| `number` | the answer is read as a rational, falling back to an expression with no variable (`π/4`, `e-2`), and compared with `relTol` (default 1e-6) and `absTol` (default 1e-9). With **`percent: true`**, « −4 % » or « −4 ٪ » is read as −4. |
| `expression` | equivalence by evaluation (§4.2). |

The outcomes are the practice outcomes: `correct`, `equivalent_correct`, `incorrect` and `syntax_error`.

- An unreadable or empty answer is a `syntax_error`, never an `incorrect`, and it is never counted (§6.2).
- Both `checkAnswer.js` and `AnswerChecker.php` return `{outcome, correct, normalized, mistakeIndex}`. They pass the same
  59 cases in `_fixtures/answers.json`.
- An unreadable expected answer throws, because it is a content error.
- **The server grades** (`AnswerChecker.php`). The client never receives what it would need to grade.

### 4.2 The `expression` evaluator

**Grammar.** A recursive-descent parser, written twice with one grammar. Neither copy uses `eval`, and a test checks this on both sides.

```
expr    := term (('+' | '-') term)*
term    := unary (('*' | '/') unary | <implicit product> power)*
unary   := ('-' | '+') unary | power
power   := primary ('^' unary)?              right-associative; -x^2 = -(x^2); 2^-1 allowed
primary := number | pi | e | variable | '(' expr ')' | '|' expr '|'
         | fn '(' expr ')' | fn unary        fn ∈ sqrt sin cos tan ln exp abs
```

**Reading conventions:**

- An implicit product has the precedence of a written product and reads left to right. `1/2x` is `(1/2)·x`.
- A function written without parentheses takes the next unary operand. `√3x` is `√3·x`, and `sin x^2` is `sin(x²)`.
- `e` is always the constant. Variables are single letters declared in `answer.vars`; any other letter, including an
  Arabic letter, is `unknown_symbol`.
- `|…|` cannot nest; use `abs()` for nested absolute values.

**Input normalisation**, identical on both sides:

- Arabic-Indic and Persian digits become Latin, and `٫` becomes `.`.
- Whitespace is removed.
- **`-:` becomes `/`** (MathLive writes `÷` as `-:` in ascii-math). This happens before the dashes are normalised.
- `− – —` become `-`, `× · ⋅` become `*`, `÷ ∕` become `/`, and `**` becomes `^`.
- `π` becomes `pi`, and `√` becomes `sqrt`.
- `\cdot \times \div \sqrt \pi \left \right` are rewritten or removed.
- `{ } [ ]` are read as parentheses.
- Superscripts `⁰…⁹` become `^n`.
- A comma between two digits is a decimal point.

MathLive's ascii-math (`(3+pi-3sqrt(3))/(3)x^2`, `3 * 4`, `12 -: 4`) is read as written. The fixture holds cases taken from
its real output.

**Errors and values:**

- Error codes are `empty`, `too_long` (more than 300 code points), `unknown_symbol`, `bad_number`, `unexpected_token`,
  `unbalanced` and `too_deep` (depth above 60).
- An undefined value is NaN. That covers ÷0, √ of a negative, ln ≤ 0, a negative base with a non-integer exponent,
  `0^negative`, and any non-finite result.
- **Canonical writing** (`normalized`) is fully parenthesised (`((x^2)*((1+(pi/3))-sqrt(3)))`). It is stored as
  `answer_norm` and used by the repeat rule.

**Equivalence:**

- Points are drawn by Park–Miller (×48271 mod 2³¹−1, seed `20261030`) in `domain[v] = {min, max, exclude[]}`, default
  [−4, 4], skipping points within 1e-3 of an excluded value, at most 8 × `samples` draws.
- At each point:
  - both values undefined: the point is skipped;
  - exactly one undefined: refused (`domain`);
  - values farther apart than `relTol` 1e-6 or `absTol` 1e-9: refused (`differs`).
- `samples` (default 6) agreeing points are needed; fewer than half defined is refused (`undefined`). A geometric challenge declares a positive domain.
- **Shared fixture** `_fixtures/expressions.json`: 226 cases (120 parse, 106 equivalence). Verdicts are authored, values
  come from independent formulas, and when PHP diverges, PHP is fixed.

The client-side `compareMathExpressions` (compute-engine) and the nerdamer facade are **not** used for grading.

### 4.3 Declared mistakes

`mistakes[]`: the first match gives `mistakeIndex`. Matches by value come first, then matches by range.

- **`{value, scaleWith?, reply}`** matches an answer equal to `value`. For an `expression` the comparison is with
  `(value)*(scaleWith)`.
- **`{value, outside: [lo, hi], at?, reply}`** matches any answer whose value at `at` is ≤ lo or ≥ hi. Here `value` is an
  example the validator refuses.

The reply is shown under « ليس بعد ». An undeclared wrong answer gets an order-of-magnitude sentence when the value is more
than ×10 away (`reply.kind = magnitude`, with no direction given). Otherwise it gets a generic sanity sentence
(`generic`). Both sentences live in `thinking.json`.

## 5. The content pipeline

### 5.1 `scripts/validate-thinking-lab.mjs [--strict] [--json]`

**Every run checks:**

- **Schema:** the file follows the schema, with `jsonSchemaSubset.mjs`. A schema keyword the subset does not handle is an error.
- **Identity:**
  - the file name is `NNNN-<id>.json`, and ids and numbers are unique;
  - the band follows the number, and `summit` is set exactly for multiples of 25;
  - `example` is present for the primary band only;
  - a published challenge has 3 keys;
  - a challenge is not its own twin;
  - `figure.component` exists as `apps/web/src/features/thinkingLab/figures/<Name>.jsx`.
- **Replay:** a replay of 6 steps or more has an `ask`, and `ask.correct` is one of the option indexes.
- **For every params tuple:**
  - no `{name}` is left unfilled in the statement, keys or replay;
  - the answer accepts itself, as the number a student would type (the exact value for `integer` and `rational`);
  - every mistake is readable, refused, and recognised as itself;
  - `parts` and `ceiling` answers are readable;
  - **nothing before the gate leaks the answer**. That covers the keys, the mistake replies and the example, whether
    the answer appears as text or as an equivalent value.
- **Forbidden words** (rule « Cultural and religious respect »):
  - Arabic whole words, with only the article allowed as a prefix (« برهان », « كبيرة » pass);
  - Arabic phrases, English words and emoji;
  - « عيد الميلاد » alone is allowed, because it also means a birthday.
- **Warning only:** a `twin` that does not exist yet.

**`--strict`** (the mode `check:lessons` runs) also requires: no `draft`, a fresh index, and at least one challenge in five
with a dead end (`B`).

### 5.2 The oracle

- `scripts/thinking-lab-oracle/<batch>.mjs` (one batch per band) exports `ORACLE[id] = { answer, ceiling?, parts?, tolerance? }`,
  each `(params, point) => value`. Every value is recomputed by an INDEPENDENT path, for example:
  - simulation: the snail day by day, Josephus on an array;
  - enumeration: coin combinations, permutations, draws;
  - search: BFS over the river crossing;
  - numerical integration: the #318 area, the lens;
  - BigInt arithmetic: 100!, 2¹⁰⁰ mod 7.
- `scripts/thinking-lab-oracle.test.mjs` checks, for every published challenge and every tuple:
  - expression answers against 12 points of the domain;
  - other checks by submitting the oracle's value to `checkAnswer`;
  - that every mistake is readable and refused;
  - that no published challenge lacks an oracle;
  - the phase-0 acceptance on #318.

### 5.3 The index and its deployment

- **The index:** `npm run build:thinking-lab-index` writes `content/thinking-lab/index.generated.json` as
  `{ $comment, count, challenges[] }`: the published challenges, complete, sorted by number. `--check` and `--strict` fail
  on a stale index.
- **Who reads it:** it is the only content file the server reads, through `ChallengeRepository` and
  `config('thinking_lab.content_path')` (default `base_path('../../content/thinking-lab')`).
- **Deployment:** `.github/workflows/deploy.yml › Deploy the thinking-lab content` ships **only that file**, outside the web
  root, beside `content/practice/`.

### 5.4 How to add a challenge

1. Write `content/thinking-lab/challenges/<NNNN>-<id>.json` from the bank entry, in our own words with our own numbers.
2. If it has a figure, add `apps/web/src/features/thinkingLab/figures/<Name>.jsx` (§7.2).
3. Add its oracle to the batch of its band in `scripts/thinking-lab-oracle/`.
4. Run `npm run build:thinking-lab-index`, `npm run validate:thinking-lab -- --strict`,
   `npx vitest run --dir scripts thinking-lab` and `cd apps/web && npx vitest run src/features/thinkingLab`.
5. Look at the figure: render it and view the PNG.
6. Set `status: "published"`; nothing generated stays `draft`.
7. Update the challenge bank's status line.

## 6. The ladder and the gate (implemented, phase 1)

**Tables:**

- `thinking_lab_progress` holds one row per (student, challenge): `state` (`trying`, `solved` or `learned`),
  `attempts_counted`, `keys_opened`, `first_attempt_at`, `last_counted_at`, `solved_at`, `learned_at`, `outcome`
  (`alone`, `keys`, `learned` or `twin`), `params_index`, `edition`, `postponed_at` and `extras` (solved parts and ceiling).
- `thinking_lab_attempts` holds every submission, counted or not, with `answer_raw`, `answer_norm`, `correct`,
  `counted`, `reason`, `mistake_index`, `draft` and `created_at`.
- Both have `user_id` foreign keys with cascade delete, so account deletion removes them. `challenge_id` is the content
  slug, never a foreign key.

**Config:** every threshold below is in `config/thinking_lab.php`, never in the code.

### 6.1 The ladder (`LadderService`)

- The first number is always reachable. Number *n* becomes reachable once the student has **one counted attempt** on
  the number before it, or has solved or learned it. The student is never stuck behind a challenge.
- The **twin** of a challenge the student has passed is reachable at once.
- At most **`max_open` = 3** challenges are open (in progress and not postponed). A new or resumed attempt beyond
  that is refused with `too_many_open` (409, carrying `maxOpen`).
- **« أرجئه »** (`postpone`) frees a place and keeps the state. Attempting the challenge again resumes it, if a place
  is free.
- A student's status per number is `solved`, `learned`, `trying`, `postponed`, `open` or `locked`.

### 6.2 An attempt (`GateService::attempt`)

The check runs inside a transaction locked on the `users` row.

- A **correct** answer is always counted and solves the challenge. The outcome is `alone`, or `keys` if any key was opened.
- A **wrong** answer is counted only if it is honest (plan §6.1). The refusal reasons are checked in this order:

  | Reason | When |
  |---|---|
  | `syntax` | the answer is unreadable |
  | `repeat` | it equals a previously counted answer: the same canonical writing, or for an expression, an equivalent one |
  | `too_soon` | less than `honest.min_seconds_between` = 120 s since the last counted attempt |
  | `no_draft` | from the 2nd attempt, the draft « ماذا غيّرت هذه المرّة؟ » is shorter than `honest.min_draft_chars` = 12 |

- An answer that is not counted is still stored, with its reason.

### 6.3 Keys

Key *k* is unlocked after counted attempt *k*. Keys open **in order** (`k ≤ keys_opened + 1`). A key is refused with
`key_locked` before it is unlocked, and with `closed` once the gate is passed. Each key is stored with its phase. The key
stake belongs to phase 4.

### 6.4 The gate and the replay

- **When it opens:** `unlockAt = first_attempt_at + think_hours` once `attempts_counted ≥ attempts_to_unlock`.
  - The defaults are 3 attempts and 24 h; the primary band waits 0 h.
  - Time is the server's clock and stored in UTC; the screen shows it in Africa/Algiers.
- **Before it opens:** `GET …/replay` answers `gate_closed` (403).
- **Opening it:** the first read after it opens turns `trying` into `learned` (outcome `learned`).
- **Twin credit:** solving the twin **alone** afterwards turns the original's outcome into `twin` (plan §6).
- **Afterwards:**
  - attempts and keys answer `closed` (409);
  - the summit `parts` and « ارفع السقف » become checkable through `POST …/extra`, with no attempt limit and nothing
    revealed.
- **Who follows this rule (phase 1):** every student, independent or in a class. The teacher request is phase 2, and the
  plan's 48 h fallback already returns a request to this rule.

### 6.5 What reaches the client (`ChallengePresenter`)

**Before the gate the client receives:**

- the number, `summit`, `examTag`, the filled statement and figure, and the example;
- the **answer format** only: `check`, `vars`, `percent`, and the choices without the correct id;
- each key's phase and state, with the text of **opened** keys only;
- the state, and the student's own attempts with their replies.

**It never receives** the answer, its domain or tolerances, the mistake values, a closed key's text, the replay,
`keyMoves`, `move`, the ceiling and parts answers, `band`, `family`, `rating`, `title` or `source`.

**After the gate**, `GET …/replay` adds: the replay, `keyMoves`, `move`, every key, the parts and ceiling (prompts and
formats), the twin with its status, and the answer value for display.

`ThinkingLabLeakTest` plays every pre-gate endpoint and searches the raw JSON for each secret (933 assertions).

### 6.6 API (student: `learner` middleware, then `FeatureRegistry::THINKING_LAB_LADDER`)

```
GET  /thinking-lab                                 home: trail, open challenges with state, next, totals
GET  /thinking-lab/n/{number}                      number → stable id (shared links cite the number)
GET  /thinking-lab/challenges/{id}                 the presented challenge (403 locked)
POST /thinking-lab/challenges/{id}/attempts        {answer, draft} → {attempt: {counted, correct, outcome, reason, reply}, challenge}
POST /thinking-lab/challenges/{id}/keys/{k}        → {challenge}
POST /thinking-lab/challenges/{id}/postpone        → {home}
GET  /thinking-lab/challenges/{id}/replay          → {replay}  (403 gate_closed)
POST /thinking-lab/challenges/{id}/extra           {kind: ceiling|part, index?, answer} → {correct, outcome}
```

The refusal reasons are `not_found` (404), `locked`, `gate_closed` and `key_locked` (403), `too_many_open` and `closed`
(409), and `not_started` (422).

**Access:**

- **Feature key:** `thinking_lab.ladder` (group `thinking_lab`, no quota). It is open to both tiers until the admin closes
  it in « الوصول والحدود » (§17 n° 4, proposed). `ACCESS_AND_LIMITS.md` §3 lists it.
- **Not open to teachers for PLAYING:** the routes are student-only (`learner`); a teacher gets a 403. A teacher uses the read-only preview (§8bis).

## 7. Screens (implemented, phase 1)

### 7.1 Routes, layout and rules

- **Routes:** `/espace/tafkir` (screen 1), `/espace/tafkir/:challengeId` (screens 2 and 3) and `/espace/tafkir/n/:number`
  (redirect). They sit inside `StudentLayout`, behind `RequireLargeScreen` (≥ 768 px), as `lazy()` pages.
- **Navigation:** `data/studentNavigation.js` (lucide `Brain`, `nav.thinkingLab` / `nav.thinkingLabShort`).
- **Screen 1, the ladder (`LadderHome`):**
  - the next number, in a large card, with its start button. When 3 challenges are open it says why it cannot start.
  - the open challenges (at most 3), each with its **state in words** (`stateLines`: « محاولة 2 من 3 · الحلّ يُفتح غدًا 09:40 »);
  - while a challenge waits for its day, light activities: a maths game, or another challenge;
  - the trail of numbered stones in RTL, coloured by status, summits larger, locked stones with a padlock.
- **Screen 2, the workspace (`Workspace`):**
  - the example card (primary band), the statement and the figure;
  - the draft, which is highlighted until it is long enough;
  - the answer, in `AnswerInput`: MathLive with the **thinking keyboard** `thinkingKeyboard(vars)` (π, √, x², xⁿ, a/b, |x|,
    and the challenge's variables), or choice cards;
  - **one primary action « تحقّق »**, plus « أرجئه »;
  - the verdict in a live region: « ليس بعد » in **amber, never red**, followed by the mistake reply or the generic or
    magnitude sentence, and the reason when the attempt was not counted;
  - the keys (locked, available or open), each with its phase chip;
  - the student's attempts;
  - « شاهد كيف فكّر الرياضي » once `canReplay`.
- **Screen 3, after the gate (`AfterSolve`):**
  - the statement and the answer;
  - **solved alone:** the key moves first, with « شاهد العرض الكامل » for the full replay. **Otherwise:** the replay;
  - then « ماذا تأخذ معك؟ » (the move card), the summit parts, the twin and « ارفع السقف ».
- **Mathematics:**
  - `MathRun` renders Arabic text with its math islands (`mathRuns`) in `<bdi dir="ltr">` **inline-block**, so a formula
    that wraps stays LTR. `( |` start an island only when maths follows.
  - Plain Unicode is the content format: `½`, `…`, `°`, `²`.
  - `prettyMath` prints an ascii answer for the eye (`x²×(1+π/3−√3)`).
- **Sound and motion:** sound is off by default, through the platform's single « الصوت » switch (`EffectsToggle` +
  `useEffectsPreference`), and reduced motion is respected (`MotionConfig reducedMotion="user"`).

### 7.2 Figures (`features/thinkingLab/figures/`)

**One file per figure**, found by a lazy `import.meta.glob`, so no list needs maintaining. Each figure exports:

- `LAYERS`: every layer it can draw;
- `BASE_LAYERS`: the layers of the statement;
- a default `({ layers, props, ariaLabel }) => <svg>` drawn in code from `props` (the student's numbers), using
  `palette.js` colours (never red), LTR letters and numbers (`ltrText`), and **computed** geometry. No raster image.

**A replay step's `layers` are ADDED to `BASE_LAYERS`.** The square and its arcs stay on screen when the triangle is lit.
A step without `layers` keeps the last ones shown.

`figures.test.jsx` checks the contract and renders every figure with its base layers and with all its layers: an `<svg>`,
no raster, no NaN. It also checks that every replay layer of every challenge exists in its figure.

There are 15 figures on 2026-11-01:

- FourArcs, Lens, IncircleRight and GridPaths;
- HandshakeCircle, SnailWell, FencePosts, RiverCrossing and BalanceNine;
- TiltedSquare, SlidingLadder, OddGnomons and TreeShadow;
- ChocolateBar and JosephusCircle.

The river (#33) and the balance (#47) are static in phase 1. Playing them is not in V1.

### 7.3 The replay player (`ReplayPlayer`)

- **Cursor:** it runs on the Math Lab step player (`useStepReveal` / `stepPlayerModel`): manual or auto, back, restart.
  The cursor is interface state and is never serialised.
- **Layout:** the current step leads, and earlier steps sit in a collapsed « الخطوات السابقة ». Below `lg`, the step column
  comes first.
- **The `math` lines** accumulate in a dark notebook « دفتر الحساب ».
- **An `ask` step (« اشرح لنفسك »)** pauses auto-play and blocks « التالي » until the student chooses. The choice is shown
  as right or « ليس بعد », followed by `why`.

### 7.4 Sounds

These names are added to `playSfx`:

| Sound | When |
|---|---|
| `lock` | a key opens |
| `spark` | an O step |
| `slide` | a B step |
| `notyet` | two soft falling notes, never a buzzer |
| `stepTick` | each replay step |

A solved challenge plays `playMedal('gold')`. All of them are silent unless « الصوت » is on (`MANIPULATION_CONTRACT.md`
« Sound effects »).

## 8. Open decisions in effect (plan §17)

Phase 1 met these decisions and applies the **proposed** values, all in config:

| § | Value in effect | Where |
|---|---|---|
| 1 | not reached yet: the 48 h fallback is phase 2 | — |
| 4 | the ladder is free and open to all students | `FeatureRegistry` default (no row) |
| 5 | the edition is a school term; edition 1 is current | `thinking_lab.edition` |
| 6 | a summit counts as an attempt like any number; its `parts` are follow-ups | `GateService` |
| — | the honest-attempt thresholds: 120 s, 12 characters | `thinking_lab.honest.*` |
| — | at most 3 open challenges | `thinking_lab.max_open` |
| — | the primary band has no day lock | `thinking_lab.gate.primary_think_hours` = 0 |

## 8bis. The teacher's read-only preview (implemented, 2026-10-31)

Owner decision, 2026-10-31: a teacher sees « مختبر التفكير » as a **read-only preview**, the same rule as lessons and
practice (everything open, nothing written). Plan §17 n° 3 ("who can use the ladder") is therefore answered for teachers:
they preview, they do not play.

- **Server** (`TeacherPreview`, `TeacherThinkingLabController`, routes under `/teacher/thinking-lab`, `can:teacher`):
  - `GET …/challenges` lists the 46 challenges with what a teacher may know: `band`, `family`, `title`, `summit`, `examTag`.
  - `GET …/challenges/{id}?tuple=n` returns the whole challenge with no gate: the answer, the declared mistakes
    with their replies, all keys, the replay, `keyMoves`, `move`, the parts and ceiling with their answers, and the twin.
    `n` walks through the student's possible number sets (`params`).
  - `POST …/challenges/{id}/check` `{answer, kind: answer|part|ceiling, index, tuple}` tests an answer with the **student's judge**
    (`AnswerChecker`, the same declared mistakes) and returns `{outcome, correct, normalized, reply}`.
- **Nothing is written.** There is no progress row, no attempt row, no quota and no feature check.
  `TeacherThinkingLabTest` asserts that both tables stay empty after a full tour.
- **The student's routes stay student-only** (`learner`): a teacher still gets a 403 on `/thinking-lab`, and a student gets
  a 403 on `/teacher/thinking-lab/*`. This preview is the **only** place where an answer leaves the server before a gate.
- **Closing the ladder** (`thinking_lab.ladder`) hides it from students. It does **not** hide the preview.
- **Web:** `/enseignant/tafkir` (list, filter by band) and `/enseignant/tafkir/:challengeId`, inside `TeacherLayout` and
  `RequireLargeScreen`. The nav entry « مختبر التفكير » sits after « المختبر » (`data/teacherNavigation.js`).
  The view reuses the student's pieces: `MathRun`, `ChallengeFigure`, `AnswerInput` with the thinking keyboard, `PhaseChip`,
  `ReplayPlayer` and `answerText`. A banner says « معاينة الأستاذ — للقراءة فقط ».
- **Not in the preview:** the student's own flow (attempts, keys, gate). The teacher's *class* tools (requests, queue,
  « اشرحه في القسم ») are phase 2 and will sit beside the preview.

## 9. Planned (phases 2–7, plan §8–§15)

- **Phase 2 · Class flow:**
  - the request to the teacher and the grouped queue with its badge;
  - accept, key or in-class, and the 48 h job;
  - notifications, `ClassroomAccess`, the Classroom Mode replay and the teacher settings.
- **Phase 3 · Writing:**
  - the whiteboard seed and observation detection (« لاحظت! »);
  - frozen board snapshots with a red layer;
  - photos through a shared `ImageEncoder`, with a quota.
- **Phase 4 · Motivation:**
  - points and the key stake;
  - the streak of thinking days, move cards and summits;
  - the pseudonymous weekly league;
  - the cooperative class challenge;
  - the morning reminder.
- **Phase 5:** content to 150 challenges.
- **Phase 6:** path 2.
- **Phase 7:** ratings and the edition renumbering.

## 10. Tests

| Suite | File | What it proves |
|---|---|---|
| Vitest (core) | `packages/core/thinkingLab/{expression,checkAnswer,params}.test.js` | the three shared fixtures, no `eval`, the #318 acceptance |
| PHPUnit (unit) | `tests/Unit/ThinkingLab/{ExpressionEvaluatorFixtureTest,AnswerCheckerFixtureTest}.php` | the same fixtures, PHP side |
| PHPUnit (feature) | `tests/Feature/ThinkingLabFlowTest.php` | the plan's phase-1 acceptance (1 → 2 → 3 attempts → +24 h, time travelled), honest-attempt refusals, keys, reach, open places, postpone, the primary band, twin credit, extras, access |
| PHPUnit (feature) | `tests/Feature/ThinkingLabLeakTest.php` | no answer, closed key or replay in any pre-gate response |
| Vitest (scripts) | `scripts/validate-thinking-lab.test.mjs`, `scripts/thinking-lab-oracle.test.mjs` | each validator rule; the oracle for all 46 challenges |
| Vitest (web) | `features/thinkingLab/{thinkingModel,serverOnly}.test.js`, `figures/figures.test.jsx` | state in words, math islands, Algiers time; the server-only content; every figure and every replay layer |
| PHPUnit (feature) | `tests/Feature/TeacherThinkingLabTest.php` | the teacher preview: everything open, a tested answer judged like the student's, nothing written, a student refused (§8bis) |
| Gate | `npm run validate:thinking-lab -- --strict` (in `check:lessons`) | §5.1 |

The feature tests use a fixed content (`tests/Support/ThinkingLabFixtures.php`): the real #318 plus synthetic challenges
with marker strings, so the tests do not move when the bank grows.
