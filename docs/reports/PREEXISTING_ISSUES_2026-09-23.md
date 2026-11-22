# Pre-existing issues found while building the Analysis & Calculus Lab

**Date:** 2026-09-23 · **Branch:** `dev` · **Context:** built
`مختبر التحليل والدوال` (MATH_LAB §5m), integrated MathLive into its inputs and
Nerdamer as the symbolic engine (§4b).

> **Why this document exists.** Everything below was observed during that work
> but is **not caused by it**. Each entry names the evidence that it predates
> the change, so it can be picked up independently. Nothing here is fixed.

---

## Summary

| # | Where | Severity | Status |
|---|---|---|---|
| 1 | `e2e/mathlab-grapher.mjs` — viewport persistence check | Low (test only) | Feature works; **the check races** |
| 2 | `e2e/mathlab-sequences.mjs` — « les TERMES ne sont pas stockés » | Unknown | Not reproduced from a fresh document |
| 3 | `npm audit` on the web app | Informational | Pre-existing advisories |
| 4 | `nerdamer` — `limit(abs(x)/x, x, 0)` never returns | High (library) | **Worked around**, upstream unfixed |
| 5 | `nerdamer` — limits at infinity wrong 5 times in 22 | High (library) | **Worked around**, upstream unfixed |

Items 4 and 5 are defects **in Nerdamer**, not in this repository. They are
listed because the workarounds are load-bearing: if Nerdamer is ever upgraded,
re-measure before removing them.

---

## 1. Grapher QA: « persistance : la fenêtre est enregistrée » fails

**Where:** `apps/web/e2e/mathlab-grapher.mjs`, the check after
`await page.click('[data-ml-zoom-in]')`.

**Observed:** 107/108 instead of 108/108, on two separate runs.

**This is a flaky check, not a broken feature.** Reproduced by hand: after
zooming, the on-screen viewport read `xMin = -6.4000`, and the document stored
on the server read `{"xMin": -6.4, "xMax": 6.4, …}` — they match exactly. The
viewport *is* persisted.

**Cause.** `waitSaved` (line ~96) is:

```js
await page.waitForSelector('[data-ml-status="dirty"], [data-ml-status="saving"]', { timeout: 2500 }).catch(() => {});
await page.waitForSelector('[data-ml-status="saved"]', { timeout });
```

The grapher reports a viewport change only after a settle delay (~400 ms), and
the shell then waits for its own autosave delay. If the "dirty" indicator has
not appeared within 2.5 s, the first line swallows the timeout and the second
line matches the **previous** `saved` state — so the test reads the document
before the zoom has been written.

**Suggested fix (not applied).** Make the check wait for the *value* rather
than the status, e.g. poll `GET /math-lab/documents/{id}` until
`data.viewport.xMin` matches the on-screen value, with a deadline. Or have
`waitSaved` first wait for the status to leave `saved`.

**Evidence it predates this work:** the only change made to the grapher in this
session is `\frac12` tokenisation in `expressionParser.js` (plus its tests). It
cannot affect viewport persistence. `useMathLabDocument.js` and
`functionGrapher/index.js` also differ from `HEAD`, but that is the
**uncommitted summary/favourite work already in the tree** before this session
(`git diff HEAD` shows the `summary` column and the teacher-workspace redirect
fix, neither of which is mine).

---

## 2. Sequences QA: « persistance : les TERMES ne sont pas stockés »

**Where:** `apps/web/e2e/mathlab-sequences.mjs`, the `/"terms"/` assertion.

**Observed:** one failure in a regression run.

**Not reproduced from a fresh document.** `createSequencesData()` returns keys
`primary, secondary, count, cursor, probe, layers, view, cobwebView, practice,
preset` — 638 bytes, no `terms`. So either some interaction in the QA path adds
a `terms` key to the saved state, or the assertion matches `"terms"` somewhere
incidental (a preset name, an expression source).

**Next step.** Re-run `node apps/web/e2e/mathlab-sequences.mjs` and dump the
`raw` string at the assertion to see what actually matched. Do not change
`sequenceState.js` before that: its contract (terms are recomputed, never
stored — MATH_LAB §5h.8) appears to be respected at creation.

**Evidence it predates this work:** `apps/web/src/features/mathlab/tools/sequences/`
is **entirely untracked** (`git status` shows `?? …/sequences/`) and was not
touched in this session.

---

## 3. `npm audit` advisories

`npm install nerdamer` printed pre-existing advisories and suggested
`npm audit fix --force`. These were **already present** — the install added
`nerdamer`, which has **zero dependencies**, so it introduced no new
transitive packages.

**Next step.** Run `npm audit` in `apps/web/` and triage separately. Do not run
`--force` casually: it applies breaking major upgrades.

---

## 4. Nerdamer can hang: `limit(abs(x)/x, x, 0)` never returns

**Upstream defect** (nerdamer 1.1.13). Measured: the call ran for several
minutes before the process was killed. In a browser this **freezes the tab** —
no curve, no buttons.

**Worked around** in `features/mathlab/symbolic/symbolicEngine.js`: every call
goes through `guard`, which measures elapsed time and puts the offending
expression in quarantine so a slider drag cannot relaunch it every frame.

**Honest limit of that workaround:** JavaScript is single-threaded, so the
guard **cannot abort** a runaway call already in flight. It prevents
accumulation, not the first hit. This is precisely why no display in the lab
depends on the symbolic engine — the numerical path always answers, and the
symbolic one only enriches it.

**If you want a real fix:** run Nerdamer in a Web Worker and terminate it on
timeout. That is a larger change (the facade becomes async everywhere) and was
not in scope.

---

## 5. Nerdamer's limits at infinity are wrong 5 times in 22

**Upstream defect** (nerdamer 1.1.13). Measured against hand-computed truth on
eleven school functions × two bounds:

| Function | Bound | Nerdamer | Truth |
|---|---|---|---|
| `2x+1` | x → −∞ | `+∞` | `−∞` |
| `5-2x` | x → +∞ | `+∞` | `−∞` |
| `x³−3x` | x → −∞ | `+∞` | `−∞` |
| `x³−3x` | x → +∞ | `−∞` | `+∞` |
| `e^x` | x → +∞ | `e^Infinity` | `+∞` |

It computes |x| → ∞ without direction, and indeterminate `∞ − ∞` forms stop it
entirely (`limit(x^2-4x+3, x, Infinity)` throws
*"(-Infinity)+(Infinity) is not defined"*). Factoring rescues `x²−4x+3` but
makes `x³−3x` worse.

**Worked around** by `verifiedLimitAtInfinity`: Nerdamer is asked (at −∞ via the
identity `lim(t→+∞) f(−t)`, and with a factored retry), then its answer is
compared with the function's actual behaviour sampled far out. They agree →
Nerdamer's exact answer is returned; they contradict → nothing is returned.
Measured after verification: **17 exact, 7 honest blanks, 0 wrong.**

**If Nerdamer is upgraded**, re-run `symbolicEngine.test.js` and re-measure
before relaxing any of this. The tests encode the contract (*a right answer or
none*), not the current failure list, so they will keep holding.

---

## What was verified green

For contrast, so the items above are not mistaken for general instability:

- `npx vitest run` (whole web app): **7098 passed / 276 files**, stable.
- `php artisan test --filter=MathLab`: **39 passed, 236 assertions**.
- `vite build`: succeeds; Nerdamer is its own lazy chunk (327 kB / 130 kB gz)
  and is **absent** from the grapher, whiteboard and Math Lab shell bundles.
- `e2e/mathlab-analysis.mjs`: **69/69**, no JS or console errors.
- `e2e/mathlab-conics.mjs`: **69/69**.
- `e2e/mathlab-grapher.mjs`: **107/108** (item 1 above).
