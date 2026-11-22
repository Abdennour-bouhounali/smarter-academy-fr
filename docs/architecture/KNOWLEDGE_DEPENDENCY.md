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
depuis, dans `fonctions-3e` module 2 *(historique — leçon française supprimée le 2026-09-25 ;
à lire dans l'historique git)* :

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
| **A — acquis** | vient des années précédentes **ou** d'une leçon antérieure de la même unité | `priorKnowledge: [...]` dans `lesson.config.js` (diagnostiqué par le module 0 quand la leçon en a un). **D'où vient-il dans le programme ?** Le réseau des الكفاءات le dit au grain du programme officiel : `reviewLinksForLesson(code)` (`LEARNING_NET.md`), affiché sous le résultat du module 0 (« راجع قبل أن تنطلق »). Les slugs `priorKnowledge` restent le vocabulaire de l'audit ; ils ne sont pas (encore) reliés aux items du réseau. |
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

Des ids de connaissances établies **soit** dans les années précédentes, **soit** dans une leçon
antérieure de la même unité (ex. `qasim-adad-tabii` : `priorKnowledge: ['qisma-iqlidiya',
'qawaid-qabiliyat-al-qisma']`). Les 9 leçons 4AM ont un module 0 depuis le 2026-09-30 ; il diagnostique ces prérequis — et **rien d'autre** : un
diagnostic mesure les prérequis, il n'enseigne pas la matière de la leçon. Un `priorKnowledge`
qu'aucune question de module 0 ne mesure lève `W_PRIOR_NOT_DIAGNOSED`, un avertissement `medium`
(non bloquant, `high` seulement en `--strict`). L'audit lit les `questions` du module 0
statiquement : un tableau construit par `.map()` lui est invisible, d'où des objets littéraux
`{ ...prepQuestion(item), id, requires: [...] }` (LESSON_DEVELOPMENT_GUIDE §4).

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

## « أتوقّع القاعدة » — l'élève écrit la règle AVANT de la lire (2026-10-06)

**Décision du propriétaire, toutes les leçons, présentes et futures.** L'élève doit
TROUVER la règle lui-même : après la manipulation et les questions guidées, avant
qu'une règle ne s'affiche, il l'écrit avec ses mots ; dès qu'il a écrit un minimum,
la règle complète apparaît, sa prédiction au-dessus pour comparer. **Rien n'est
validé, noté ni envoyé** (stockage local de l'élève : `smarter_predictions_<leçon>`).

**Où, sans rien écrire dans la leçon.** `KnowledgeBrick` l'applique d'office
(`kit/PredictRule.jsx`, décision pure `kit/predictRule.js › shouldPredict`) :
- seulement une brique `variant="new"` dont l'item est d'une sorte qu'on peut
  CONCLURE : `concepts`, `regles`, `methodes`, `memoriser`, `formules` — jamais
  `vocabulaire` (un nom ne se devine pas) ;
- jamais pour un enseignant / administrateur (`freeNavigation`), jamais pour une
  règle déjà acquise (module validé, ou établie ailleurs dans la page) ni déjà
  prédite (la revisite rappelle « توقّعك » et ne redemande rien) ;
- pendant l'attente, NI titre, NI `lead`, NI corps (ils diraient la règle), et la
  carte ne reçoit l'item qu'à la révélation (`unlockItem` différé) ;
- ce qui SUIT la brique dans le même conteneur (la question d'application) reste
  masqué (`.sa-predict-pending ~ *`, `index.css`) : on ne répond pas avant d'avoir
  vu la règle.

**Le bouton** « أظهر القاعدة » s'active après `PREDICT_MIN_CHARS` (8) caractères
écrits. **La zone** est `components/MathTextArea.jsx` (partagée avec la rédaction
des مسائل) : RTL, calculs isolés en LTR au fil de la frappe (`isolateMath`), et une
palette des **seuls symboles qu'utilise la règle**, déduits de son texte
(`components/mathSymbols.js › symbolsFor` : titre, résumé, corps de l'item, ou la
boîte du manuel enveloppée ; LaTeX `$…$` compris ; parenthèses de prose arabe
ignorées ; les sigles PGCD / PPCM restent des mots, jamais éclatés en lettres P, G, C, D — corrigé le 2026-10-06). Une règle sans mathématiques n'a pas de palette.

**Ce que l'auteur écrit (leçon nouvelle ou reprise) :**
1. `predictPrompt` sur chaque item prédictible de `knowledge.jsx` — la question qui
   fait conclure la règle à partir de ce que l'élève VIENT de faire (nombres de la
   manipulation), sans donner la réponse. Sans lui, un texte générique s'affiche
   (`predict.prompt`) : acceptable, jamais aussi bon.
2. Une règle posée par un `TextbookBox kind="definition|property"` SANS brique
   avant elle s'enveloppe : `<PredictRule id="<item>" prompt="…"><TextbookBox …/></PredictRule>`.
   Une boîte qui ne fait que reformuler une règle déjà posée par une brique
   antérieure, ou qui ne donne qu'un nom, reste telle quelle.
3. **Jamais une boîte qui énonce la règle juste AVANT sa brique** (elle la
   dévoilerait) : envelopper la boîte avec l'id de la brique — une seule
   prédiction, puis boîte et brique, une seule « توقّعك ».
   Même règle pour une QUESTION dont la bonne option énonce la règle (« ما هو معيار التصنيف؟ ») :
   `<PredictRule id="<item>"><TapQuestion …/></PredictRule>` — l'élève écrit d'abord, puis la question et la
   brique suivent, une seule « توقّعك » (`natiqa-ghayr-natiqa`, module 1, 2026-10-06).
4. `predict={false}` (brique, item, PredictRule) quand prédire n'a pas de sens ;
   `predict` (vrai) pour forcer un vocabulaire qu'on peut raisonnablement conclure.

**Couverture au 2026-10-06 :** ~417 briques nouvelles (toutes les leçons) par
défaut ; 12 boîtes du manuel enveloppées après audit des 34 boîtes sans brique
(22 reformulent une règle déjà posée ou ne donnent qu'un nom) ; prompts précis
écrits pour `qasim-adad-tabii` (prototype) et les 12 boîtes — les autres leçons
utilisent le texte générique jusqu'à ce que leurs `predictPrompt` soient écrits.
Suivi : `npm run audit:predict` (15 / 410 au 2026-10-06 avant la reprise ; 296 / 296 le 2026-10-07 : toutes les règles demandées ont leur prompt, et `check:lessons` exécute `audit-predict-prompts.mjs --strict`). **Écrire les prompts :
[`../lessons/PREDICT_PROMPT_GUIDE.md`](../lessons/PREDICT_PROMPT_GUIDE.md).**
Vérification navigateur : `apps/web/e2e/lesson-kit/predict-rule.mjs`.

## L'audit

```bash
npm run audit:knowledge            # rapport complet + contrats JSON
npm run audit:knowledge:gate       # sortie 1 si un contrat est violé
npm run check:lessons              # validate:lessons && audit:knowledge:gate

node scripts/audit-knowledge-dependencies.mjs --lesson qasim-adad-tabii --strict
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
| `W_BRICK_MODULE_MISMATCH` | la brique et `knowledge.jsx` ne s'accordent pas sur le module (ignoré pour une brique `variant="rappel"`, posée exprès hors de son module d'origine) |
| `W_ITEM_WITHOUT_BRICK` | un item n'apparaît que dans l'« À retenir » de fin de module |
| `W_UNPARSEABLE_STEPS` | les étapes ne se résolvent pas en tableau littéral : le module est invisible à l'audit |

### Contrôle 2 — le lexique (détecteur, non juge)

> **Limite actuelle :** `scripts/audit/lexicon.json` ne contient **que des termes français**. Pour
> les leçons arabes de l'unité 4AM, le contrôle lexical ne trouve donc rien — son silence n'est
> pas une preuve. Un lexique arabe : *Not yet implemented*. Pour le 4AM, seul le contrôle 1 (le
> contrat déclaré) et la lecture manuelle comptent.

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

- `docs/reports/KNOWLEDGE_DEPENDENCY_AUDIT.md` — le rapport, régénéré par `npm run audit:knowledge` ;
  son périmètre courant est celui des classes actives (`ACTIVE_GRADE_IDS` de
  `packages/core/curriculum/activeGrades.js`), soit aujourd'hui les 9 leçons 4AM.
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

`apps/web/src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-mushtarak-akbar/modules/Module02Maarif.jsx`
est l'implémentation de référence (chaque question déclare `requires={[…]}`) :

```text
module 1  ranger les livres (manipulation)  →  brique « qasim-baqi » (après le geste)
module 2
étape 1  manipulation  →  essai « تعريف بالباقي »            requires qasim-baqi (établi au module 1)
étape 2  brique « qasim-jidaa »  →  essai « تعريف بالجداء »  requires qasim-jidaa
étape 3  briques « siyagh-mutakafia », « wahid-wa-nafsuh »  →  essai  requires siyagh-mutakafia
```

Vérifié par `npm run audit:knowledge:gate` (sortie 1 si un contrat est violé ; inclus dans
`npm run check:lessons`). Le moment d'apparition de la brique sur la carte est couvert par les
tests vitest de `apps/web/src/lessons/common/knowledge/*.test.js` ; aucune suite e2e 4AM ne le
vérifie dans le navigateur (`4am-aadad-tabiiya-natiqa.mjs` garde la page d'unité et le laboratoire
d'ouverture). *(Historique : l'ancienne référence `fonctions-3e` module 2
et sa suite `3e-fonctions-carte.mjs` ont été supprimées le 2026-09-25.)*
