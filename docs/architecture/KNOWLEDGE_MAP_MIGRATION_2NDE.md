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

Toutes les cases sont cochées après exécution effective des suites e2e (voir
[Validation](#validation)), pas par construction.

`vecteurs-2nde` avait déjà la carte et n'avait plus de module de synthèse ; il a seulement
reçu la version générique du tiroir (titre d'impression en props), pour que les dix leçons
partagent exactement le même composant. Son comportement est inchangé (64/64 et 70/70).

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
