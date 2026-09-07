# Knowledge Map — migration des leçons de Seconde

> État de la migration des leçons générées de 2nde vers la carte des connaissances
> cumulative décrite par `KNOWLEDGE_MAP.md`. Ce document ne décrit que ce qui a été
> réellement implémenté et vérifié.

Référence d'architecture : `KNOWLEDGE_MAP.md`.
Implémentation de référence : `vecteurs-2nde` (géométrie).
Référence secondaire (première migrée) : `ensembles-et-intervalles-2nde`.

---

## Statut

| Leçon | Carte intégrée | Synthèse supprimée | Révélation progressive | Impression | Build |
| --- | --- | --- | --- | --- | --- |
| Ensembles et intervalles | ✅ | ✅ | ✅ | ✅ | ✅ |
| Logique et raisonnement | ✅ | ✅ | ✅ | ✅ | ✅ |
| Arithmétique | ✅ | ✅ | ✅ | ✅ | ✅ |
| Nombres réels | ✅ | ✅ | ✅ | ✅ | ✅ |
| Valeur absolue et distance | ✅ | ✅ | ✅ | ✅ | ✅ |
| Calcul littéral | ✅ | ✅ | ✅ | ✅ | ✅ |
| Équations et inéquations | ✅ | ✅ | ✅ | ✅ | ✅ |
| Colinéarité et alignement | ✅ | ✅ | ✅ | ✅ | ✅ |
| Équations de droites | ✅ | ✅ | ✅ | ✅ | ✅ |
| Positions relatives de deux droites (2026-09-06, implémentation partagée) | ✅ | — (jamais eu) | ✅ | ✅ | ✅ |
| Fonctions (2026-09-06, partagée) | ✅ | — | ✅ | ✅ | ✅ |
| Fonctions de référence (2026-09-06, partagée) | ✅ | — | ✅ | ✅ | ✅ |
| Signe d'une fonction (2026-09-06, partagée) | ✅ | — | ✅ | ✅ | ✅ |
| Variations et extremums (2026-09-06, partagée) | ✅ | — | ✅ | ✅ | ✅ |
| Fonction affine (2026-09-06, partagée) | ✅ | — | ✅ | ✅ | ✅ |

`vecteurs-2nde` avait déjà la carte et n'avait plus de module de synthèse ; il a seulement
reçu la version générique du tiroir (titre d'impression en props), pour que les dix leçons
partagent exactement le même composant. Son comportement est inchangé (64/64 et 70/70).

> ### ⚠️ Correction du 2026-09-07 — ce tableau était faux
>
> Un audit de l'intégralité des leçons a montré que **neuf** des lignes ci-dessus
> décrivaient une intention, pas le dépôt. Le `knowledge.jsx` existait bien, mais :
>
> - **sept leçons ne montaient le provider nulle part** — ni dans `routes.jsx`, ni dans
>   `index.jsx` : `vecteurs-2nde` (la « référence » de ce document), `colinearite-alignement-2nde`,
>   `arithmetique-2nde`, `logique-et-raisonnement-2nde`, `nombres-reels-2nde`,
>   `valeur-absolue-distance-2nde`, `equations-et-inequations-2nde`. Aucun élève ne
>   voyait la carte ;
> - **six d'entre elles gardaient leur module « À retenir »**, alors que les clés de leur
>   `knowledge.jsx` — et les suites `*-carte.mjs` — supposaient déjà sa suppression et la
>   renumérotation ;
> - **deux leçons de plus** (`calcul-litteral-2nde`, `ensembles-et-intervalles-2nde`)
>   montaient bien le provider mais n'avaient aucun `<KnowledgeSnapshot>` : leurs pieds de
>   module et la synthèse du boss restaient des résumés écrits à la main — la deuxième
>   source de vérité que ce document dit avoir supprimée.
>
> **Pourquoi personne ne l'a vu.** Ni `validate:lessons` ni `audit:knowledge:gate` ne
> détectent ce défaut : la porte ne vérifie que `requires` contre les briques, et
> « 0 brique / 0 requires » est vide donc vert. Une leçon peut être entièrement verte
> avec une carte morte. La colonne « Build » l'était pour la même raison : rien ne
> casse à la compilation quand un composant n'est simplement jamais rendu.
>
> Les neuf leçons ont été réparées le 2026-09-07 (voir la section « Réparation » en fin de
> document). **Ne jamais cocher une ligne de ce tableau sans avoir ouvert la page.**

---

## Ce que chaque leçon a reçu

Structure identique dans les sept leçons, copiée depuis `vecteurs-2nde` :

```text
<leçon>/
├── knowledge.jsx                  ← les connaissances, par module (source unique)
├── lesson.config.js               ← knowledgeMap: true
├── routes.jsx                     ← chaque page enveloppée dans le provider
└── components/
    ├── KnowledgeMap.jsx           ← le tiroir (générique, non forké)
    ├── knowledgeState.js          ← réducteur cumulatif pur
    ├── knowledgeState.test.js     ← ses 9 tests
    ├── KnowledgeProvider.jsx      ← état cumulatif + montage du tiroir
    └── KnowledgeSnapshot.jsx      ← l'« À retenir » de fin de module
```

Aucun composant spécifique à une leçon n'a été créé : seules les **données**
(`knowledge.jsx`) et les **chaînes d'impression** diffèrent.

### Connaissances par leçon

| Leçon | Items | Répartition par module |
| --- | ---: | --- |
| Ensembles et intervalles | 23 | M1 3 · M2 5 · M3 4 · M4 4 · M5 4 · M6 3 |
| Logique et raisonnement | 18 | M1 4 · M2 4 · M3 4 · M4 3 · M5 3 |
| Arithmétique | 16 | M1 4 · M2 4 · M3 2 · M4 3 · M5 3 |
| Nombres réels | 17 | M1 3 · M2 4 · M3 4 · M4 3 · M5 3 |
| Valeur absolue et distance | 14 | M1 3 · M2 2 · M3 3 · M4 4 · M5 2 |
| Calcul littéral | 19 | M1 3 · M2 4 · M3 3 · M4 3 · M5 3 · M6 3 |
| Équations et inéquations | 20 | M1 4 · M2 3 · M3 3 · M4 4 · M5 3 · M6 3 |

Le module de diagnostic (M0) et le test final ne contribuent rien : le premier teste
des prérequis, le second évalue.

---

## Suppression de l'ancienne synthèse

Deux situations distinctes ont été rencontrées, et traitées différemment.

### Quatre leçons avaient un module « À retenir » dédié

`logique-et-raisonnement-2nde`, `arithmetique-2nde`, `nombres-reels-2nde` et
`valeur-absolue-distance-2nde` avaient un `Module05ARetenir.jsx` (stage
`formalization`) qui ne faisait que réciter les règles des modules 1 à 4.

Il a été **supprimé**, et les deux modules suivants renumérotés :

```text
M05 « À retenir »   → supprimé
M06 <practice_lab>  → M05
M07 <evaluation>    → M06
```

Renumérotation appliquée partout : nom de fichier, `number`, `id`, `getNavLinks(n)`,
`moduleNumber`, tag « Mission NN », clés de `knowledge.jsx`, seeds e2e.

### Trois leçons avaient la formalisation intégrée à un vrai module

`ensembles-et-intervalles-2nde` (M5 « Croiser deux intervalles »),
`calcul-litteral-2nde` (M5 « Trois formes, trois usages ») et
`equations-et-inequations-2nde` (M5 « Quotient et valeur interdite ») portaient le stage
`formalization` mais enseignaient une notion nouvelle par la manipulation.

Le module a été **conservé** ; seul l'encadré « À retenir » recopié a été retiré,
et le stage passé à `manipulation`. Pour Ensembles et Équations, cet encadré était une
étape à part entière : les étapes suivantes ont été renumérotées.

### Les sept synthèses du boss

Chacune était un composant `Synthese()` écrit à la main, dupliquant les mathématiques
de la leçon. Les sept ont été supprimées et remplacées par :

```jsx
synthese={<KnowledgeSnapshot variant="complete" complete />}
```

### Les pieds de module

Les 38 pieds de module `<Feedback tone="ok">…</Feedback>` qui résumaient la leçon ont
été remplacés par `<KnowledgeSnapshot moduleNumber={N} />`. Quand le texte contenait une
phrase de transition vers le module suivant, elle a été conservée comme enfant du
snapshot — une phrase de narration, jamais un rappel de mathématiques.

Les « À retenir » **locaux à une activité d'apprentissage** n'ont pas été touchés.

---

## Écart assumé avec la référence

`PrintView` codait en dur le titre (`LES VECTEURS`) et la ligne de niveau. Plutôt que de
recopier sept fois ce littéral, `KnowledgeMap.jsx` accepte désormais deux props,
transmises par `KnowledgeMapTrigger` puis par `KnowledgeProvider` :

```jsx
<KnowledgeMapTrigger … printTitle="ENSEMBLES ET INTERVALLES" printSubject="Mathématiques · 2nde" />
```

Les valeurs par défaut préservent le comportement existant. C'est exactement le point
signalé par `KNOWLEDGE_MAP.md` comme « à corriger lors de la généralisation ». Le
`vecteurs-2nde` d'origine n'a pas été modifié.

Le reste du tiroir (géométrie, redimensionnement, modes, impression, responsive) est
copié **à l'identique** dans les sept leçons.

---

## Validation

Exécutée, pas supposée.

| Contrôle | Commande | Résultat |
| --- | --- | --- |
| Tests du réducteur | `npx vitest run --root apps/web src/lessons/lycee/seconde` | 224/225 (voir ci-dessous) — 7 × 9 tests de `knowledgeState` verts |
| Contrat des leçons | `node scripts/validate-lessons.mjs` | aucune erreur sur les 10 leçons de 2nde |
| Build | `npm run build` | passe |
| Carte — e2e | `2nde-<leçon>-carte.mjs` (vite sur :5240) | 7 suites, 388 assertions, toutes vertes |
| Leçons — e2e | `2nde-<leçon>.mjs` | 7 suites, 334 assertions, toutes vertes |

Détail, suite par suite :

| Leçon | `*-carte.mjs` | leçon |
| --- | ---: | ---: |
| Ensembles et intervalles | 58/58 | 62/62 |
| Logique et raisonnement | 52/52 | 47/47 |
| Arithmétique | 52/52 | 42/42 |
| Nombres réels | 52/52 | 45/45 |
| Valeur absolue et distance | 52/52 | 39/39 |
| Calcul littéral | 58/58 | 47/47 |
| Équations et inéquations | 58/58 | 52/52 |
| Colinéarité et alignement | 52/52 | 49/49 |
| Équations de droites | — | 54/54 |
| Vecteurs (référence, non migré) | 70/70 | 64/64 |

`equations-de-droites-2nde` n'a pas de suite de leçon préexistante : seule la suite carte
a été écrite. La suite `2nde-colinearite.mjs` a été réalignée sur la nouvelle numérotation
(module « À retenir » supprimé, durée 64 min, synthèse du boss = carte complète).

L'unique test unitaire en échec, `positions-relatives-droites-2nde/labelLayout.test.js`,
concerne une leçon de géométrie **non touchée** par cette migration (aucun fichier
modifié) : il échouait déjà — vérifié en remisant les modifications.

### Ce que les suites `*-carte.mjs` vérifient

Copiées de `2nde-vecteurs-carte.mjs`, elles asservissent pour chaque leçon :

- la carte est **vide** à l'ouverture de la leçon (état vide explicite) ;
- ouvrir un module ne débloque **rien** — seule sa complétion le fait ;
- pour chaque module N validé : snapshot = tiroir = cumul exact de M1..MN ;
- **aucune fuite** : aucun item d'un module ultérieur n'apparaît ;
- seuls les items du module courant sont détaillés et marqués « nouveau » ;
- le mode navigation ouvre le détail d'un item et revient à la grille ;
- l'impression n'affiche que les items **courants**, avec le bon titre de leçon,
  et bascule bien `.sa-screen-view` → `.sa-print-view` ;
- la synthèse du boss rend la carte complète dans la page, et le tiroir suit ;
- un élève qui saute au boss avec seulement M1 fait ne voit que M1 ;
- mobile 375 px : pas de scroll horizontal, bord droit affleurant, haut sous
  `#app-header` ;
- zéro erreur console sur toute la traversée.

### Impression vérifiée en navigateur

En plus des assertions e2e, trois leçons ont été imprimées en A4 réel
(`page.pdf`, media `print`) : titre de leçon correct, bandeau ⭐ en tête, KaTeX et SVG
rendus, aucun contrôle d'écran visible (`data-km-noprint` = 0 visible), et aucun élément
du reste de la page (`body > *:not(#km-root)` = 0 visible).

### Cohérence entre leçons

`KnowledgeMap.jsx`, `knowledgeState.js`, `knowledgeState.test.js` et
`KnowledgeSnapshot.jsx` sont **strictement identiques** (md5) dans les dix leçons,
`vecteurs-2nde` compris depuis qu'il a reçu la version à props d'impression.
Les `KnowledgeProvider.jsx` ne diffèrent que par le nom de la leçon et les deux chaînes
d'impression.

---

## Points restants

- **Composants encore dupliqués.** Les cinq fichiers génériques sont copiés dans chaque
  leçon, conformément à l'architecture actuelle (`KNOWLEDGE_MAP.md` §Future Work). Ils
  sont désormais présents dans dix leçons : leur remontée dans
  `apps/web/src/lessons/common/` est devenue clairement rentable, et les props
  d'impression introduites ici rendent cette remontée triviale.
- **`positions-relatives-droites-2nde`** : construite le 2026-09-06 (elle n'était qu'un dossier
  d'utilitaires) ; son test de placement d'étiquettes ne comptait pas les cordes invisibles
  (droite passant par un seul coin du cadre) — corrigé, 16/16.
- **Import inutilisé** `MathText` dans `logique-et-raisonnement-2nde/Module04Equivalence.jsx` :
  antérieur à la migration, laissé en l'état.
- **Les deux leçons de géométrie sont migrées.** `colinearite-alignement-2nde` et
  `equations-de-droites-2nde` ont reçu le même traitement : module « À retenir » supprimé
  (ex-05 et ex-06), modules suivants renumérotés, `Synthese()` manuscrite du boss remplacée
  par `<KnowledgeSnapshot variant="complete" complete />`.
  (`positions-relatives-droites-2nde` est `coming_soon` et reste hors périmètre.)

---

## Réparation du 2026-09-07

Audit de **75 leçons** (6e, 4e, 3e, 2nde) : état réel de la carte dans chacune.
Résultat : 65 conformes, 9 à réparer en 2nde, 1 hors périmètre (4e, antérieure au kit).

### Ce qui a été appliqué

| Leçon | Module « À retenir » | Renumérotation | Provider | Snapshots |
| --- | --- | --- | --- | --- |
| `arithmetique-2nde` | supprimé (ex-05) | 06→05, 07→06 | monté | 6 |
| `logique-et-raisonnement-2nde` | supprimé (ex-05) | 06→05, 07→06 | monté | 6 |
| `nombres-reels-2nde` | supprimé (ex-05) | 06→05, 07→06 | monté | 6 |
| `valeur-absolue-distance-2nde` | supprimé (ex-05) | 06→05, 07→06 | monté | 6 |
| `colinearite-alignement-2nde` | supprimé (ex-05) | 06→05, 07→06 | monté | 6 |
| `vecteurs-2nde` | supprimé (ex-07) | 08→07, 09→08 | monté | 8 |
| `equations-et-inequations-2nde` | — (n'en avait pas) | aucune | monté | 7 |
| `calcul-litteral-2nde` | — | aucune | déjà monté | 7 |
| `ensembles-et-intervalles-2nde` | — | aucune | déjà monté | 7 |

Dans chacune : `knowledgeMap: true` déclaré (c'est lui qui dispense la leçon du stage
`formalization` — sans lui, `validate:lessons` réclame le module « À retenir » qu'on vient
de supprimer), la `Synthese()` manuscrite du boss remplacée par
`<KnowledgeSnapshot variant="complete" complete />`, les 44 pieds de module
`<Feedback tone="ok">` remplacés par `<KnowledgeSnapshot moduleNumber={N}>` — en ne
gardant que la **phrase de transition** vers le module suivant, jamais le rappel de
mathématiques —, et l'îlot de composants dupliqués supprimé (les cinq fichiers copiés,
morts depuis la remontée dans `common/knowledge/`).

`equations-de-droites-2nde` garde ses `components/Knowledge*.jsx` : ce sont des
**ré-exports d'une ligne** vers `common/knowledge/` (le motif prévu par `KNOWLEDGE_MAP.md`),
pas des copies.

### Numérotation : la source de vérité

Les clés de `knowledge.jsx` et les `SLUG` des suites `apps/web/e2e/lesson-kit/2nde-*-carte.mjs`
décrivaient **déjà** l'état d'arrivée (« À retenir » supprimé, modules suivants décalés).
Ce sont elles qui ont dicté la renumérotation, module par module.

### Validation

| Contrôle | Commande | Résultat |
| --- | --- | --- |
| Contrat des leçons | `npm run validate:lessons` | 0 erreur, 0 avertissement |
| Dépendances de connaissances | `npm run audit:knowledge:gate` | aucun blocage (75 leçons) |
| KaTeX | `npm run check:katex` | aucun antislash avalé |
| Routage | `npm run check:routes` | 75/75 branchées |
| Build | `npm run build` | passe |
| Tests unitaires | `npx vitest run --root apps/web` | 1298/1298 |
| Carte, en navigateur | contrat cumulatif, 9 leçons | 177 assertions, 0 échec |

Le contrôle en navigateur vérifie, pour chaque leçon et chaque module N : carte **vide**
à l'ouverture, tiroir = cumul exact de M1..MN, **aucune fuite** d'un module ultérieur,
zéro erreur console.

### Reste à faire (hors périmètre de cette réparation)

- **Les briques de connaissance en 2nde.** 19 leçons de 2nde n'avaient aucun
  `<KnowledgeBrick>` : leur carte était complète et cumulative, mais les connaissances
  n'étaient pas *posées dans le flux* avant les demandes qui en dépendent. C'est le
  chantier que la 6e a mené (`KNOWLEDGE_MAP_REFONTE_6E.md`) et que la 3e a mené avant
  elle : un travail pédagogique par leçon, pas un câblage.

  **Six leçons traitées le 2026-09-07** (voir « Briques de connaissance » ci-dessous) ;
  il en reste treize.
- **Les suites `*-carte.mjs` ne s'exécutent plus** : elles asservissent `#app-header`, un
  élément que la coquille n'émet plus (refonte de mise en page en cours dans l'arbre de
  travail). L'échec est **antérieur et indépendant** de cette réparation — vérifié sur une
  leçon témoin non touchée. À réaligner avec `useLessonViewport`.
- **`racines-carrees-4e`** : 5 modules en `ModuleLayout` direct, antérieurs au kit de
  leçon. Aucune carte n'est possible avant sa migration au kit — l'audit la classe
  `[legacy]`.


---

## Briques de connaissance — les six leçons de fonctions et de droites (2026-09-07)

Les six leçons visées existaient déjà, complètes et branchées : modules, laboratoires,
carte cumulative, catalogue, routes. Ce qui manquait était le contrat
`KNOWLEDGE_DEPENDENCY.md` — **poser la connaissance dans le flux avant la demande qui
l'exige**. Aucune leçon n'a été régénérée : 51 fichiers modifiés, **aucun créé, aucun
supprimé**.

### Avant / après (`--strict`)

| Leçon | Avant | Après | Briques | `requires` |
| --- | --- | --- | ---: | ---: |
| Positions relatives de deux droites | 1C · 34H · 2M | **0 · 0 · 0** | 21 | 29/29 |
| Fonctions | 0C · 10H | **0 · 0 · 0** | 23 | 43/43 |
| Fonction affine | 4C · 33H · 1M | **0 · 0 · 0** | 14 | 32/32 |
| Fonctions de référence | 2C · 30H · 2M | **0 · 0 · 0** | 19 | 27/27 |
| Signe d'une fonction | 3C · 31H | **0 · 0 · 0** | 17 | 32/32 |
| Variations et extremums | 3C · 34H · 1M | **0 · 0 · 0** | 15 | 35/35 |
| **Total** | **13C · 172H · 6M** | **0 · 0 · 0** | **109** | **198/198** |

`contract 0E` partout : plus une seule question sans `requires`, plus un seul item
de `knowledge.jsx` qui n'existe que dans l'« À retenir » de fin de module.

### Ce qui a été appliqué

**L'ordre geste → brique → demande.** Les connaissances vivaient dans les `Feedback`
de fin d'étape — position de *renforcement*, lue après la réponse. Elles sont devenues
des `<KnowledgeBrick>` placées **après le geste qui donne son sens au mot, avant la
question qui l'emploie**. L'ordre du source est la ligne du temps : une brique posée
après une question n'établit que pour ce qui suit. Le texte n'a pas été réécrit — la
brique rend l'item de `knowledge.jsx` par son `id`, source unique.

Quand aucun geste ne précède (modules de résolution, ateliers), la brique est en **tête
d'étape**. Deux fois, elle est délibérément placée *après* la question, parce que la
poser avant aurait donné la réponse (`fonctions-de-reference-2nde` M5).

**Les prérequis, déclarés ET diagnostiqués.** Les CRITICAL venaient presque tous du
module 0 : il demandait « notation f(x) », « abscisse », « coefficient directeur »,
« aire »… des acquis de 6e/3e que la leçon ne réenseigne pas. Ils sont maintenant dans
`priorKnowledge` — et **chaque id déclaré est mesuré par une question du module 0 qui
le `requires`**, sinon la déclaration est une promesse que la leçon ne tient pas
(`W_PRIOR_NOT_DIAGNOSED`). `variations-extremums-2nde` a reçu pour cela une question
de diagnostic supplémentaire (aire et périmètre d'un rectangle).

**Le test final n'introduit rien.** Deux CRITICAL venaient d'un terme dont la première
apparition était un `boss.prompt` — et un `L_DISTRACTOR_ONLY` d'un mot (« droites
perpendiculaires ») rencontré pour la première fois dans une mauvaise réponse. Un
distracteur est une première exposition comme une autre : il a été remplacé par une
confusion issue de la leçon elle-même.

### Manipulations jamais gelées

Le même passage a corrigé **42 expressions de verrouillage** de laboratoire : 23 gels
purs supprimés (`disabled={done1}`, `disabled={seen50}`, `disabled={reached}`,
`disabled={q4}`…) et 19 ramenés au seul verrou d'antériorité. Ces laboratoires se
figeaient à l'instant où l'élève réussissait l'étape : il ne pouvait plus rejouer le
phénomène qu'il venait de comprendre. Seul le verrou d'**antériorité** subsiste
(`disabled={doneN || !doneN-1}` → `disabled={!doneN-1}`), parce qu'une étape garde son
ordre. Les instantanés figés (`state={done1 ? snap1 : state}`) rendent la main à l'état
vivant ; les `snapN` restent quand le texte de la révélation cite la valeur atteinte.

Les `PredictionChips` gardent leur `disabled` : une prédiction se recueille **une fois**,
avant la révélation — la geler est le comportement correct.

### Validation — exécutée, pas supposée

| Contrôle | Commande | Résultat |
| --- | --- | --- |
| Dépendances, par leçon | `audit-knowledge-dependencies.mjs --lesson … --strict` | 6 × `0C/0H/0M/0L`, `contract 0E` |
| Porte du dépôt | `npm run check:lessons` | validate + gate + katex + routes + level-leak, tout vert |
| Tests unitaires | `npx vitest run --root apps/web` | **1298/1298** |
| Build | `npm run build` | passe |
| Collisions SVG | `npm run audit:collisions` | 0 collision |
| Navigateur, 6 leçons | harnais dédié, 37 modules | **216/216** — 0 erreur console, aucune brique orpheline, 375 px sans scroll horizontal |

### Ce que le contrôle en navigateur a dû contourner

Les suites `2nde-*.mjs` et `*-carte.mjs` **ne s'exécutent toujours pas** : elles
asservissent `#app-header`, que la coquille n'émet plus au format bureau depuis la
refonte de mise en page (`lg:hidden` pour un élève connecté). L'échec est **antérieur
et indépendant** de ce chantier — vérifié sur `vecteurs-2nde`, leçon non touchée, qui
échoue à la même assertion. Le contrôle a donc été fait par un harnais dédié, qui
vérifie ce que ce chantier engage : rendu sans erreur, briques présentes et non
orphelines, variantes valides, 375 px sans scroll horizontal. **Les suites restent à
réaligner sur `useLessonViewport`.**

### Un faux positif assumé

`fonctions-2nde` M3 : `domOverflow` signale les en-têtes KaTeX du `ValueTable`
(« 4x(10−x) ») comme débordant de `<main>`. Vérification faite, la page **ne défile
pas** horizontalement et la table défile dans son propre conteneur, qui reste dans
l'écran — le comportement voulu pour un tableau large. L'audit signale tout descendant
plus large que `<main>`, y compris à l'intérieur d'un `overflow-x-auto` légitime.
`ValueTable` est partagé par 32 leçons : il n'a pas été touché pour un signalement
cosmétique.
