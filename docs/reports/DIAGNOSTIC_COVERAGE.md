# Diagnostic Coverage

The 6e diagnostic's 13 skills, what each evaluates, and how each relates to
the learning-point vocabulary. Mapping policy: **uncertain means unmapped** —
an invented link would poison future analytics, a missing one costs nothing
(nothing in the diagnostic reads these links). Verified links are seeded by
`database/seeders/DiagnosticSkillLinkSeeder.php` into
`learning_points.diagnostic_skill_id`.

## Skill-by-skill analysis

| Diagnostic skill | Evaluates | Learning-point link | Verdict |
|---|---|---|---|
| `nombres.lecture-ecriture` | Lire, écrire et décomposer les nombres entiers | — | **Unmapped**: the skill spans two LPs (`6e_nombres-entiers_P2` lire/écrire + `P4` décomposer); a single-column link would misattribute evidence between them. |
| `nombres.valeur-position` | Comprendre la valeur de position de chaque chiffre | `6e_nombres-entiers_P3` | **Linked** — titles are identical. |
| `nombres.comparaison-rangement` | Comparer et ranger des nombres entiers et décimaux | `6e_nombres-entiers_P5`, `6e_nombres-decimaux_P5` | **Linked (both)** — the skill explicitly spans integer and decimal comparison; each LP is the same competency in its number domain. |
| `nombres.droite-graduee` | Repérer un nombre sur une droite graduée | `6e_nombres-entiers_P6` | **Linked** — same competency. The decimal analogue (`6e_nombres-decimaux_P6`) was NOT linked: whether the skill's question bank actually probes decimal placement wasn't verified. |
| `fractions.sens` | Comprendre le sens d'une fraction | — | **Unmapped**: plausibly `6e_fractions_P1` and/or `P2` — "construire une fraction" vs "sens du numérateur/dénominateur" split differently than the skill; ambiguous. |
| `fractions.quantite-quotient` | Fraction d'une quantité et fraction-quotient | — | **Unmapped**: spans `6e_fractions_P3` (fraction d'une quantité) and `P4` (fraction-quotient) — one skill, two LPs. |
| `decimaux.ecriture-virgule` | Écritures décimales et écritures équivalentes | — | **Unmapped**: spans `6e_nombres-decimaux_P2` (fraction décimale ↔ virgule) and `P4` (écritures équivalentes). |
| `operations.sens-technique` | Sens des quatre opérations et techniques posées | — | **Unmapped**: spans `6e_quatre-operations_P1` (sens) and `P2` (posées). |
| `operations.division-reste` | Division euclidienne et interprétation du reste | — | **Unmapped, close call**: `6e_quatre-operations_P5` («Réaliser la division euclidienne et interpréter le reste») matches well — left for the quatre-operations lesson-migration pass to confirm against the actual question bank. |
| `mesures.conversions` | Convertir des unités de longueur, masse et contenance | — | **Unmapped**: one skill spans three lessons' conversion LPs (longueurs/masses/contenances P4-ish each). |
| `mesures.perimetre` | Calculer le périmètre d'un polygone | — | **Unmapped, close call**: `6e_longueurs_P6` matches — confirm during the longueurs pass. |
| `estimation.ordre-grandeur` | Estimer, arrondir et trouver un ordre de grandeur | — | **Unmapped**: spans several `6e_ordre-grandeur-estimation` LPs (P1 estimer avant, P2 arrondir, P3 ordre de grandeur). |
| `problemes.resolution` | Résoudre et communiquer la réponse à un problème | — | **Unmapped**: spans `6e_resolution-problemes_P5` (résoudre) and `P6` (communiquer); attributing its evidence to either alone would be wrong. |

**4 verified links, 9 deliberately unmapped** (5 of them because one skill
genuinely spans several learning points — a structural granularity mismatch,
not missing analysis).

## Gaps and observations

- **Learning points relevant to a diagnostic but not evaluated**: the
  diagnostic tests *prerequisites* at its own granularity; per-LP diagnostic
  coverage is not a goal of the current 24-question adaptive design. If
  finer-grained initial profiles are wanted later, the right lever is adding
  targeted questions per skill, not remapping.
- **No redundant diagnostic questions found**: the adaptive selector already
  minimizes question count (per-skill cap 4, decisive single-attempt
  resolution).
- **No diagnostic questions were generated or modified** in this migration
  (per the brief: analyze before generating; the existing structure is sound).
- The two "close call" rows above are the cheap wins for the next mapping
  pass, each verifiable in minutes against `SixiemeDiagnosticProvider`'s
  question bank while migrating the corresponding lesson.
