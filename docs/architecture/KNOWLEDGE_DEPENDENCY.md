# Knowledge Dependency Contract

> **La loi : avant toute demande, tout ce qui est nécessaire pour la comprendre doit déjà être
> disponible pour l'élève.** Ce document définit ce que « déjà disponible » veut dire
> mécaniquement, comment une leçon le déclare, et comment l'audit le vérifie.
>
> Docs compagnons : `INTERACTION_PEDAGOGY.md` (§6, §6quinquies — comment un module enseigne),
> `KNOWLEDGE_MAP.md` (la carte, source unique des connaissances), `LESSON_CONTRACT.md`
> (structure et stages), `LESSON_DESIGN_PLAYBOOK.md` §2bis (la loi côté auteur).

---

## Le problème que ceci résout

Une leçon peut être mathématiquement juste et pédagogiquement impossible. Exemple réel, corrigé
depuis, dans `fonctions-3e` module 2 :

```text
étape 1   « Que vaut f(6) ? »                    ← f(x) n'a jamais été introduit
          explain: « 13 est l'IMAGE de 6 »       ← le mot arrive APRÈS la réponse
étape 2   explain: « 4 est un ANTÉCÉDENT de 9 »  ← idem
étape 3   « f(4) = 9 : que dit cette ligne ? »   ← on teste les trois mots
footer    « On écrit f(x) l'image de x par f »   ← la définition, tout en bas
```

L'élève doit répondre avec un vocabulaire qu'il rencontrera plus tard. Ce n'est pas une faute de
rédaction : c'est la structure du kit qui y pousse, puisque `explain` et `footer` sont les
emplacements les plus commodes pour écrire une définition — et les seuls que l'élève lit trop tard.

---

## Les quatre états valides

Avant chaque demande, chaque connaissance requise est dans l'un de ces états :

| État | Sens | Déclaration dans le code |
| --- | --- | --- |
| **A — acquis** | vient des années précédentes | `priorKnowledge: [...]` dans `lesson.config.js`, diagnostiqué par le module 0 |
| **B — vient d'être enseigné** | posé juste avant, en position d'enseignement | `<KnowledgeBrick id variant="new">` plus haut dans le flux |
| **C — juste à temps** | montré à l'instant parce que la demande l'exige | `<KnowledgeBrick variant="rappel">` |
| **D — enrichissement** | signalé comme facultatif, jamais requis | `<KnowledgeBrick variant="enrichment">`, jamais dans un `requires` |

Tout le reste est une erreur pédagogique.

## Ce qu'est une « demande »

Question, QCM, saisie numérique, glisser-déposer, cible de manipulation, « complète », « détermine »,
« calcule », « place », « lis », « interprète », question de diagnostic, épreuve du test final —
**et le texte des options**, y compris les distracteurs. Un mot rencontré pour la première fois dans
une mauvaise réponse est une première exposition comme une autre.

## Positions d'enseignement et positions de renforcement

```text
ENSEIGNENT                          RENFORCENT (jamais une première fois)
  brief, intro                        explain
  titre et sous-titre d'étape         explainWrong
  contenu d'étape                     correction (BatchChoiceQuestion)
  révélation conditionnée             explainFor
    par une manipulation              feedback
  <KnowledgeBrick>                    footer
```

La **révélation conditionnée** (`{done && <Feedback>…}`) enseigne : elle est la conséquence d'un
geste, et elle précède les questions qui suivent. C'est le motif « manipuler puis nommer » de
`INTERACTION_PEDAGOGY.md` §6, et il reste encouragé.

Le `footer` renforce, même s'il contient une définition : `ContentModule` ne le rend qu'une fois
**toutes** les étapes faites. Une connaissance qui n'existe que là est arrivée trop tard pour
chacune des questions du module.

---

## Le flux d'exposition

L'audit lit une leçon comme un **flux ordonné** de tout ce qu'un élève peut lire, dans l'ordre où il
le rencontre. Chaque segment porte un `slot` (d'où vient le texte) et un `kind` (ce qu'il fait).

| `kind` | `slot` |
| --- | --- |
| `teaching` | `brief`, `intro`, `step.title`, `step.subtitle`, `step.content`, `gated`, `footer` |
| `brick` | `brick.lead`, `brick.item` (le texte de l'item de `knowledge.jsx`, injecté à la position de la brique) |
| `jit` | `q.intro`, `q.above`, `boss.extra` |
| `demand` | `q.prompt`, `q.option`, `q.rowLabel`, `q.rowOption`, `diag.*`, `boss.prompt`, `boss.option` |
| `postAnswer` | `q.explain`, `q.explainWrong`, `q.correction`, `q.explainFor`, `q.feedback`, `diag.explain`, `boss.explain` |

**L'ordre du source est la ligne du temps.** Une brique placée après une question, dans la même
étape, n'établit que pour ce qui suit. C'est voulu : c'est exactement ce que voit l'élève.

Le texte de l'item entre dans le flux **à la position de la brique**, si bien qu'un item dont
l'exemple anticipe un module ultérieur est signalé comme n'importe quelle exposition prématurée.

---

## Les trois déclarations

### 1. `priorKnowledge` — ce que la leçon suppose

```js
// lesson.config.js
priorKnowledge: ['abscisse', 'ordonnee', 'coordonnees', 'calcul-litteral'],
```

Des ids du lexique, venus des années précédentes. Le module 0 doit les diagnostiquer — et **rien
d'autre** : un diagnostic mesure les prérequis, il n'enseigne pas la matière de la leçon.

### 2. `<KnowledgeBrick id>` — ce que la leçon établit

```jsx
{ranOnce && (
  <KnowledgeBrick id="image" variant="new" lead="Tu as donné 4, il est sorti 9.">
    <NumericQuestion prompt="…" requires={['image']} … />
  </KnowledgeBrick>
)}
```

Le texte vient de `knowledge.jsx` : la brique et la carte montrent le même item, écrit une seule
fois. Ce qui reste en ligne est narratif (`lead`) ou actif (l'essai immédiat, en `children`).

Séquence rendue : **sens → représentation → exemple et lien → essai immédiat**. Court. La réparation
n'est pas « ajouter de la théorie », c'est mettre la bonne connaissance au bon moment.

`establishes` permet à une brique de couvrir plusieurs ids (défaut : `[id]`).

### 3. `requires` — ce que la question exige

```jsx
<TapQuestion requires={['image', 'antecedent', 'notation-fx']} … />
```

Sans effet à l'exécution ; c'est un contrat lu par l'audit. Accepté sur les trois composants de
question, et comme clé sur les objets `QUESTIONS` (module 0) et `EPREUVES` (test final).

---

## L'audit

```bash
npm run audit:knowledge            # rapport complet + contrats JSON
npm run audit:knowledge:gate       # sortie 1 si un contrat est violé
npm run check:lessons              # validate:lessons && audit:knowledge:gate

node scripts/audit-knowledge-dependencies.mjs --lesson fonctions-3e --strict
```

### Contrôle 1 — le contrat déclaré (exact, bloquant)

| Code | Sens |
| --- | --- |
| `E_REQUIRES_NOT_ESTABLISHED` | la question exige une connaissance qu'aucune brique ne pose et que `priorKnowledge` ne déclare pas |
| `E_REQUIRES_ESTABLISHED_LATER` | la brique qui la pose vient après la question |
| `E_REQUIRES_ENRICHMENT` | une question du parcours principal dépend d'un enrichissement |
| `E_REQUIRES_NOT_LITERAL` | `requires` n'est pas un tableau littéral de chaînes |
| `E_BRICK_ITEM_MISSING` | `<KnowledgeBrick id>` sans item correspondant dans `knowledge.jsx` |
| `E_DIAG_REQUIRES_UNDECLARED` | une question du module 0 exige autre chose qu'un `priorKnowledge` |
| `E_PRIOR_KNOWLEDGE_NOT_LITERAL` | `priorKnowledge` n'est pas un tableau littéral |
| `E_QUESTION_WITHOUT_REQUIRES` | *(--strict)* une question ne déclare pas ses dépendances |
| `W_PRIOR_NOT_DIAGNOSED` | un prérequis déclaré qu'aucune question du module 0 ne mesure |
| `W_BRICK_MODULE_MISMATCH` | la brique et `knowledge.jsx` ne s'accordent pas sur le module |
| `W_ITEM_WITHOUT_BRICK` | un item n'apparaît que dans l'« À retenir » de fin de module |
| `W_UNPARSEABLE_STEPS` | les étapes ne se résolvent pas en tableau littéral : le module est invisible à l'audit |

### Contrôle 2 — le lexique (détecteur, non juge)

`scripts/audit/lexicon.json` liste des termes et notations mathématiques avec le niveau où ils
deviennent la matière de l'élève. Un terme dont la **première** apparition est une demande ou un
renforcement est signalé :

| Sévérité | Cas |
| --- | --- |
| `critical` | le terme est une cible de la leçon (`teachingScope.include` ∪ `pointsToLearn`) |
| `high` | il n'est jamais posé en position d'enseignement dans la leçon |
| `medium` | il est posé, mais plus tard que sa première demande |
| `low` | il n'apparaît que comme distracteur |

Les termes d'un niveau antérieur sont considérés comme acquis, sauf en `--strict`. Un terme listé
dans `priorKnowledge`, ou établi par une brique antérieure, n'est pas signalé.

**Le lexique ne prouve rien.** Il ne remplace pas la lecture d'un module dans l'ordre, avec la
question : *un élève qui n'a vu que ce qui précède pourrait-il répondre sans deviner ?* Quand l'audit
manuel trouve un terme que le détecteur a manqué, on **ajoute le terme au lexique** — on ne corrige
pas en silence.

`knowledgeAudit: { ignore: [{ term, reason }] }` dans `lesson.config.js` neutralise un faux positif ;
l'entrée est rapportée comme « ignorée », jamais tue. Ne jamais abaisser le niveau d'un terme pour
faire taire un constat.

### Sorties

- `docs/reports/KNOWLEDGE_DEPENDENCY_AUDIT.md` — le rapport, 3e/2nde d'abord, 6e/4e relevés hors
  périmètre.
- `docs/reports/knowledge-contracts/<niveau>_<leçon>.json` — le contrat par leçon : connaissances
  introduites, et pour chaque question ses `requires`, l'état de chacun (`prior`,
  `established@M2`, `later@M5`, `missing`, `enrichment`) et `pedagogicallyValid`.

---

## Réparer

Le plus petit correctif juste, dans cet ordre de préférence :

- **A — enseigner avant.** Insérer une brique au point où le geste vient de donner du sens au mot.
- **B — remplacer.** Poser une question que l'état actuel des connaissances permet de traiter.
- **C — découper.** Transformer une demande composite en échelle progressive.
- **D — dévoiler progressivement.** N'introduire que ce dont l'instant a besoin.

Jamais : un « Rappel : … » générique, un bloc de théorie, une définition en post-réponse, un
vidage de connaissances en bas de module, ni la suppression d'une interaction utile.

## Le module 0 et le test final

Le module 0 **mesure** des prérequis : ses questions ne portent que sur `priorKnowledge`, ne
bloquent rien et ne produisent aucune preuve. Le test final **consolide** : il peut exiger tout ce
que la leçon a enseigné, et ne doit rien introduire de neuf — ni concept, ni vocabulaire, ni
notation.

## Exemple de référence

`fonctions-3e` module 2 est l'implémentation de référence :

```text
étape 1  manipuler la machine  →  brique « image »        →  essai « image de 3 »
étape 2                           brique « notation-fx »  →  essai « f(6) »
étape 3  remonter la machine   →  brique « antécédent »   →  essai « antécédent de 11 »
étape 4  les trois mots ensemble (la question d'origine, désormais légitime)
étape 5  deux entrées, une sortie → brique « à mémoriser »
```

Vérifié par `apps/web/e2e/lesson-kit/3e-fonctions-carte.mjs` : la brique n'existe pas avant le
geste, la carte grandit à l'instant où la brique paraît — sans attendre la fin du module —, et
aucune connaissance d'un module ultérieur ne fuite.
