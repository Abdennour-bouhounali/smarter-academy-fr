# Audit of the answers the student validator uses — 2026-09-24

Trigger: `/espace/pratique/qasim-adad-tabii/session/…`, question «120 = 6 × 20 —
أي جملة ليس لها نفس معنى «6 قاسم للعدد 120»؟». A is the right answer; the
student picked A and it was refused.

## Scope

| Surface | Items audited | Method |
|---|---|---|
| Practice bank 4AM (`content/practice/4am`) | 109 questions / 9 lessons | math + Arabic review; independent oracle; evaluator round trip |
| Practice bank seconde (inactive) | 26 questions | math + Arabic review |
| Final tests (`Module0xItqan`, BossFinal) | 45 items | math + Arabic review; key presence/range |
| Prerequisite diagnostic | 10 items | review |
| Textbook exercises (`content/exercises.js`) | 62 | review |
| Learning modules (TapQuestion, discovery, manipulations) | lessons 1–9, ≈ 170 checks | review |
| Assessment registry (`assessment_items`, dev DB) | 154 live items | canonical diff content ↔ export ↔ DB |
| Server / JS evaluators | fixture 168 cases | JS ↔ PHP parity |
| Math Lab generators and judges (13 instruments) | ≈ 350 000 generated challenges | every answer recomputed independently |

## Root cause of the reported case

Content, registry and evaluator all said **A**. The bug was the retry path:
«أعد المحاولة» reuses the attempt id, and the server answered a duplicate with
the **first** verdict (`normalized: "B"`), which the screen displayed. After one
wrong pick, no answer, not even A, could ever be accepted.

**Fix:** `PracticeEvidenceRecorder` judges the retried answer on its own and
returns `duplicate: true, recorded: false`. Nothing is written, and mastery
still counts only the first outcome. `PracticeAnswerController` exposes
`recorded`. `PracticeSession.jsx` adds to its score only when
`recorded !== false`.

## Findings and corrections

### CRITICAL
| Where | Defect | Fix |
|---|---|---|
| Practice retry (server) | a retried answer got the first verdict, so the right answer was refused | above; `EvidenceTrustBoundaryTest` |
| seconde `fonction-affine-2nde` l5-001 q3 | `]-∞;15[` for a time interval that starts at 0 (the feedback says 0 belongs) | `[0;15[` |
| Math Lab numberLab | `75%` refused on «نسبة مئوية» questions (4 959/4 959) | `unit: 'percent'` |
| Math Lab sequences | second true behaviour label refused | `accepted` = every true label |
| Math Lab logic | real counterexamples outside the hidden sampling window refused | judged on the declared set |
| Math Lab analysis | continuous functions declared «no limit» (default screen 2x+1@0) | extrapolated one-sided limits, `limitsAgree` |

### HIGH
| Where | Defect | Fix |
|---|---|---|
| awwaliyan l1-001 C + module 01 | distractor «18 − 17 = 1» is a second valid proof | «18 زوجي و 17 فردي» |
| bahth-pgcd l1-001 C | distractor «14 + 7 = 21» true | «21 و 14 فرديان» |
| tayin-pgcd l5-001 + exercises.js ex-22 | «بين 40 و 55» read inclusively makes 40/55 also right | `40 < a < 55` |
| ikhtizal-kasr l1-001 q1 | «بعد القسمة على 4» as `rational` accepted any equal value | choice, A = 21/12 |
| bahth-pgcd final E1 | a second option was also right | distractors rewritten, key index unchanged |
| khawass-qawasim final E5 | same | same |
| qasim-adad-tabii final E3 | «120 = 6×19+6» is also a proof that 6 divides 120 | distractors rewritten |
| qawasim-adad-tabii final E5 | same | same |
| khawass-qawasim module 02 | «9 + 90» as a counterexample (99 is divisible by 9); «15 = 5 + 10» | replaced |
| Evaluator, irreducible form | `1,75` accepted as «a fraction in lowest terms» | decimal → `partially_correct / notIrreducible` (JS + PHP + fixture) |
| Math Lab numberLab | rounding prompt «قرّب … إلى -1» | rank named |
| Math Lab trigonometry | `√(3)/2`, `1/√2` unreadable | parser |
| Math Lab logic | fallacy text contradicted its expected name; domain and ⇔ never shown | reworded, `domainLabel`, ⇔ |
| Math Lab transformations | answer drawn before answering; reflection axis / centre / direction not stated | mask + full sentences |
| Math Lab algebra | «التحقق» called a correct inequality solution wrong | `verifyResolution` |
| Math Lab analysis | sufficient Riemann n refused | judged per n |
| Math Lab measurement | Pythagoras `a² + b²` never «found» | real-object samples |

### MEDIUM / LOW fixed
ikhtizal l2-002 hint 3; khawass l5-001 feedback; ikhtizal module 01 (raw
LaTeX); numberLab hint placeholders; trigonometry `°`, triangle mode
off-programme, `cosZero`; conics empty field = 0 and `−`; logic refutation
domain and negation distractors; transformations trivial questions; algebra
`c REL x`; analysis predictions, wording «القمّة» for a minimum, fixed
monotonic answer, raw LaTeX, Arabic digits; measurement duplicate scales and
the angle sum; vectors B = C; registry `optionCount` for `[…].map` options.

## Permanent integrity checks added
1. `validate-exercises.mjs` round trip: key accepted, every distractor
   rejected, no signature that is itself correct.
2. `scripts/practice-answer-oracle.test.mjs`: 76 tests. Every constructed 4AM
   answer is recomputed from the maths; a new constructed question without an
   oracle entry fails.
3. `validate-lessons.mjs --strict`: `correct` required and in range for
   assessed options and `<TapQuestion>` in live lessons.
4. Math Lab: each fixed judge has a test with an independently computed truth.

## Flagged, not changed (ambiguous or policy decisions)
- seconde l3-002 q2 (interval vs [0;7,5[), l4-003 C «compris entre 0 et 12»,
  l4-002 statement vs figure; misconception tags on l1-002 q2, l3-001 q2,
  l3-003 q2 (inactive grade).
- qasim-mushtarak l4-001 and qawasim l3-002: the statement contains data with
  no question attached; qawasim l2-001 q2 feedback word order.
- Final tests: khawass E1 «فقط» trap; qawasim E4 «يكفي»; qawasim E5
  «قاسمَي»; wadiya E1 «أصغر» vs «لا يفوق»; ex-33-B explanation.
- Modules: qawasim M02 «إلى أي عدد يكفي» (literally every option suffices);
  khawass M01 n = 9 example; the divisors of 48 are not checked; bahth
  M01/M02 true-fact distractors; wadiya textbook wording; ikhtizal M02
  «خطوة واحدة»; negative denominators accepted.
- **InfoSorter** shows French UI text (violates the Arabic rule).
- Trigonometry: rounded decimals (`0,87`) are refused (tolerance 1e-3).
- Sequences: difficulty never passed by the UI. Algebra: no x-term
  operations (level 4 needs «إظهار الحل»). Analysis: 1/√x horizontal
  asymptote ≈ 0.0003.
- Practice UI: the choice letter touches the content («B6 يقسم 120»).
