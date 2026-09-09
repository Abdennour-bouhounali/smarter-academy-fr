# Rubrique de jugement — couverture des Learning Points en 2de

Ce dossier contient UN fichier par leçon : `<lessonId>.json`. Ils portent le
jugement humain. `scripts/audit-2de-learning-points.mjs` les LIT, les valide et
les fusionne au rendu — il ne les écrit jamais, et une réexécution ne peut donc
pas écraser un jugement.

## La question, pour chaque LP

> Un élève qui n'a JAMAIS rencontré cette notion pourrait-il l'apprendre en
> faisant ce module — geste, puis nom, puis demande — sans lire ailleurs ?

Ne comptent pas comme enseignement : une formule affichée, une définition
écrite dans un `brief`, un `explain` d'après-réponse, un mot dans la carte des
connaissances, un `requires` (sans effet à l'exécution), un titre d'étape.

## Statuts (dans l'ordre d'examen)

| Statut | Quand |
| --- | --- |
| `COVERED` | Un geste (manipulation) ou une révélation conditionnée établit la notion, une brique la nomme, une demande l'éprouve, et une épreuve du boss la mesure. La demande n'est pas devinable à partir de son énoncé seul. |
| `PARTIALLY_COVERED` | Enseigné, mais une facette de l'intitulé manque (« lire ET représenter » avec seulement « lire »), ou seul le cas facile est éprouvé. |
| `MENTIONED_ONLY` | La notion apparaît en texte, aucune étape ne dépend d'elle. |
| `EXERCISED_ONLY` | Des questions l'exigent, rien ne l'établit : l'élève doit déjà savoir. |
| `MANIPULATION_ONLY` | Une manipulation l'incarne, aucune brique ne la nomme, aucune question ne la vérifie. |
| `ASSESSMENT_ONLY` | Seules les épreuves du boss la citent. |
| `MISSING` | Rien dans la leçon. |
| `DUPLICATED` | Enseignée comme neuve dans deux leçons du niveau (citer les deux). |
| `MISALIGNED` | L'intitulé du LP et ce que le module enseigne divergent. |

## Preuves

Chaque preuve cite `module` (numéro), `moduleSlug`, `step` (numéro d'étape) et
`mechanism` parmi : `manipulation:<Composant>`, `brick:<idItem>`,
`question:<id>`, `feedback` (révélation conditionnée), `snapshot`, `intro`.
Un jugement sans preuve citable ne peut pas valoir mieux que `MENTIONED_ONLY`.

## Schéma

```jsonc
{
  "lesson": "<lessonId>", "auditedAt": "2026-09-09", "auditor": "<batch>",
  "learningPoints": {
    "seconde_<lessonId>_P1": {
      "status": "COVERED",
      "evidence": [{ "module": 2, "moduleSlug": "le-taux", "step": 1, "mechanism": "manipulation:RateProbes" }],
      "manipulation": "RateProbes — deux instants, le quotient se recalcule",
      "assessmentQuestionIds": ["fa-e3"],
      "knowledgeItems": ["taux-accroissement"],
      "notes": "…",
      "crossGrade": { "overlapsWith": ["3e:fonctions-affines-3e"], "kind": "consolidation|repetition|anticipation|none" },
      "confidence": "high|medium|low"
    }
  },
  "lessonLevel": {
    "pedagogicalProblems": ["…"], "technicalProblems": ["…"],
    "duplicates": ["…"], "recommendations": ["…"],
    "verticalPositioning": { "revised": "…", "extended": "…", "new": "…", "formalized": "…", "tool": "…" }
  }
}
```
