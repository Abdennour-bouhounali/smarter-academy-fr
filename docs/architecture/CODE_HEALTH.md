# CODE_HEALTH — lint, format, and « nothing unused »

> **Status (2026-11-22).** Covers lint, format and the unused-code checks. Imported from the Algerian platform (DZ `dev`
> `7f4cef1c`) on 2026-11-22. True here: every check and rule below (the scripts are the same files). Not true here: the
> i18n files are still `locales/ar/` (French ones come with plan step 1D); the baseline and the `KEPT` lists were
> rewritten in step 1B (§3).

Since 2026-11-17 on the Algerian platform. This document owns the rules that keep the code clean and says which command
enforces each one. Every command below runs in CI.

## 1. The checks

| What | Command | Where | In CI |
|---|---|---|---|
| Unused imports and variables, an undefined name, a duplicated key, a branch that can never run, a hook called out of order | `npm run lint` (ESLint, `eslint.config.js`) | every `.js` / `.jsx` / `.mjs` of `apps/web`, `packages/core`, `scripts` | Frontend job |
| Unused exports, unused i18n keys, unused entries of a string table | `npm run check:unused` (`scripts/check-unused.mjs`) | `apps/web/src`, `packages/core` | Frontend job |
| Unused classes, controller actions no route names | same command (`scripts/check-unused-php.mjs`) | `apps/api/app` | Frontend job (it reads PHP as text) |
| Unused `use` lines in PHP | `npm run check:unused:php-imports` (Pint, ONE rule: `apps/api/pint.unused.json`) | `apps/api` | Backend job |
| A whole file that nothing reaches | `npm run check:unreached` | `apps/web/src` | Frontend job |
| Format (Prettier, 120 columns) | `npm run check:format` / `npm run format:v2` | the areas listed in `package.json › format:v2` | Frontend job |

A full lint takes about one minute; the unused check about twenty seconds. Run both before a commit that removes code:
removing one thing often leaves another without a user.

## 2. Lint (`eslint.config.js`)

One flat config for the whole repository. It is `eslint:recommended` plus:

- `unused-imports/no-unused-imports` — fixed by `npm run lint:fix` (the ONLY automatic fix; everything else is read by a person).
- `unused-imports/no-unused-vars` — a name beginning with `_` is allowed for a positional parameter that must stay.
  **`const { removed, ...rest } = props` — `removed` is used** (`ignoreRestSiblings`): it is taken out on purpose.
- `react/jsx-uses-vars` — a name used only as `<Tag />` is used.
- `react-hooks/rules-of-hooks` — so **a function that is not a hook is never named `use…`** (the pilot's `useCase` became
  `keyCase`). Logic tests (`*.test.js`) are exempt: they call pure functions named `useHint`, `useRoot`.

Choices that are deliberate — do not « fix » them:

| Choice | Why |
|---|---|
| `no-irregular-whitespace` skips strings, templates, comments, JSX text | the no-break space is used on purpose in counters and before French high punctuation (`FRENCH_LANGUAGE_CONTRACT.md`) |
| `no-constant-condition` / `no-constant-binary-expression` are off in tests and in `scripts/practice-oracle/` (the oracle's engine; its per-lesson files were deleted in step 1B) | a test writes the arithmetic of a statement on purpose: `expect(3 * 5 > 12 && 3 * 4 <= 12)` |
| `no-empty` allows an empty `catch {}` | « storage may be closed, go on » |
| unused `eslint-disable` comments are not reported | the tree carries 900+ `react-hooks/exhaustive-deps` comments for a rule this config does not turn on |
| `no-useless-escape` stays ON | **it catches real mistakes in mathematics**: `'\;'` in an ordinary string is `;`, so the student saw « ; » instead of a LaTeX space, and `'\le'` printed « le ». Write `'\\;'`, or `String.raw` |

Never silence a finding with `eslint-disable` unless the line says why after `--`.

## 3. Nothing unused (`scripts/check-unused.mjs`)

It reads the code as a tree (Babel), never by searching text. **When it cannot be sure, it says « used »: it must
never ask to delete something alive.** Its own test (`scripts/check-unused.test.mjs`, a small tree in
`scripts/__fixtures__/unused/`) holds every rule below.

**Exports.** An export is used when a file of the app, a script or a walk imports it.

- An export that only a TEST imports is used when its own file also uses it (it is exported to be tested). Otherwise it
  is dead code that happens to have a test.
- `import * as ns`: `ns.name` uses that name; **`ns` handed over whole — passed, spread `...ns`, read with a computed
  key — uses everything**.
- `import('./file')`, `import.meta.glob(...)`, `new URL('./worker.js', import.meta.url)` use every export of the file.
- A barrel does not hide a dead export: `export { a } from './x'` is used only if someone imports `a` from the barrel.
- Files the tools load by a path they BUILD count as used entirely (`READ_BY_PATH`: a lesson's `lesson.config.js` and
  `content/*.js`).

**i18n keys** (`apps/web/src/i18n/locales/ar/*.json` today). A key is used when its path is written in the code — whole
(`t('home.title')`), in parts (`const NS = 'status'` then `${NS}.${id}`), or open
(`t(`status.${kind}`)` uses everything under `status.`). Strings written in `apps/api/app` count too (the server may
send a key). Plural forms follow their base key.

**String tables** (`strings.js`, `text.js`: an exported object of sentences). Each read is followed from its import:
`T.objective.cross` uses that entry; `T.objective` handed over whole (assigned, passed, spread, `T.objective[kind]`)
uses everything under it.

**Keeping something on purpose**: add it to `KEPT` in the script, with the reason. A `KEPT` line that keeps nothing
any more fails the check.
On 2026-11-22 (commit `4511da19`) `KEPT` names 72 exports of the lesson engine, each with the reason « lesson engine —
no French lesson yet »: the engine is kept whole with no lesson to call it. `check:unreached` has its own `KEPT` in
`scripts/check-unreached.mjs`: 8 files of the lesson path that no lesson mounts yet; each line leaves when the first
French lesson reaches its file. 1,283 files are reached from `main.jsx`.

### The baseline — it only shrinks

`scripts/check-unused.baseline.json` names what was already unused and is not removed yet: 233 lines on 2026-11-22
(175 exports, 58 i18n keys), after the clean-up of step 1B (commit `4511da19`).

Rules: a NEW unused thing fails CI; a baseline line that is no longer unused fails CI too (delete the line).
`node scripts/check-unused.mjs --update-baseline` rewrites the file — read its diff: it must only remove lines.
**The baseline is never a place to park new code.**

## 4. The PHP side (`scripts/check-unused-php.mjs`)

- A class of `app/` is used when its name is written in another file of the application (app, routes, config,
  bootstrap, database). A name written only in `tests/` does not count. Console commands and `<Model>Policy` classes
  are found by Laravel itself: they are used.
- A public method of a controller is used when a route names it or the controller calls it.
- **Not covered**: a route that no page calls (the web client builds its addresses from pieces), unused private
  methods, unused PHP variables. No tool for them is installed.

## 5. What a change must do

1. Delete what the change makes useless **in the same change** — code, export, i18n key, sentence, test of dead code.
2. `npm run lint && npm run check:unused && npm run check:unreached` pass.
3. A new or rebuilt area is added to `format:v2` and `check:format`. A v2 lesson enters with its `world/`, `board/` and
   `lesson.pack.js` when its pack is written (no lesson exists yet).
4. Never add to the baseline, never widen `KEPT` without a reason a reader can check.

## 6. State on 2026-11-17 (the first run, Algerian tree)

Before the clean-up: 2,312 unused imports, 389 unused variables, 62 useless escapes (37 of them LaTeX spaces that reached
the student as « ; »), 1,949 unused exports, 211 unused i18n keys. After it: lint 0 finding. The list of 23 dead
variables that looked like forgotten checks concerned Algerian lessons and was deleted with them on 2026-11-22
(`git show 049380e:docs/reports/LINT_FIRST_RUN_2026-11-17.md`).
