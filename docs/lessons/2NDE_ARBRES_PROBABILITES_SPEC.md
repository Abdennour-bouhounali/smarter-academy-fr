# 2nde — Arbres de probabilités — Design & Implementation Spec

> Rétro-documenté depuis le code le 2026-09-09 (la leçon existait sans spec). Sections selon LESSON_DESIGN_PLAYBOOK §15.3.

## 1. Identity & curriculum contract
- Key `seconde_arbres_de_probabilites` · id `arbres-probabilites-2nde` · domain `statistiques_probabilites` · 🎲 · **80 min**.
- Route `/courses/lycee/seconde/statistiques_probabilites/arbres-probabilites-2nde`. LPs `seconde_arbres-probabilites-2nde_P1…P10`.
- Specificity : « En Seconde, l'arbre pondéré représente des expériences successives : produit des probabilités sur un chemin, somme sur plusieurs chemins, aller-retour avec le langage naturel. » (`level_specificity`, objet officiel `arbres_de_probabilites`).
- Neighbours NOT repeated : probabilités conditionnelles (une seule condition, sans arbre — leçon précédente), tests diagnostiques (arbre appliqué à un test médical, en aval) — cette leçon reste sur la construction et l'exploitation de l'arbre lui-même, jamais sa lecture inverse (P(cause \| effet)).

## 2. Central idea & misconceptions
Le long d'un même chemin les probabilités se multiplient (chaque étape se joue « sachant qu'on est arrivé jusqu'ici ») ; pour réunir plusieurs chemins menant au même événement on additionne ; la pondération d'un niveau n'est pas une proportion globale, et un premier niveau déséquilibré interdit de faire la moyenne simple des branches du second niveau.

| # | Misconception | Confronted |
|---|---|---|
| 1 | Poids du second niveau lu comme une proportion globale (« la moitié de TOUS les tirages ») plutôt que conditionnelle | M2 step 2, boss `ar-e3` |
| 2 | Somme des branches d'un même nœud non vérifiée = 1 | M2 step 3, boss `ar-e4` |
| 3 | Additionner au lieu de multiplier le long d'un chemin | M3 step 1 et 2, boss `ar-e5`/`ar-e8` |
| 4 | Moyenne non pondérée des deux branches au lieu de la somme des chemins (0,375 au lieu de 0,40) | M4 step 1, boss `ar-e7` |
| 5 | Un seul chemin compté au lieu de deux pour un même événement | M4 step 2, boss `ar-e6` |
| 6 | Ordre des niveaux traité comme arbitraire plutôt que dicté par la dépendance | M1 step 2 |

## 3. Signature interaction — « Construis l'arbre toi-même » (`TreeBuilder`)
Le module 1 (trigger) affiche deux sacs réels en pastilles colorées comptables (sac A : 3 rouges/3 bleues, sac B : 2 rouges/6 bleues) et 6 briques cliquables : 2 de niveau 1 (choix du sac), 2 de niveau 2 (couleur tirée), 2 « intrus » de niveau 0 (« On repose la bille dans le sac », « On compte toutes les billes des deux sacs »). Cliquer une brique de niveau 0 est rejeté (aucune ramification créée) ; cliquer une brique de niveau 2 avant que les deux branches de niveau 1 soient posées est rejeté (« On ne peut pas tirer une bille avant d'avoir choisi le sac »). Chaque clic valide fait croître un arbre SVG en direct : les nœuds de niveau 2 se greffent sur CHAQUE nœud de niveau 1. Une fois les 4 briques valides placées, l'étape se termine et débloque le `KnowledgeBrick` « arbre-structure ». Un bouton « Recommencer » réinitialise. Aucun glisser-déposer : c'est un clic-pour-placer contraint par l'ordre.

## 4. Module architecture (7 · 80 min)
| # | Slug | Stage | LPs | min | Interaction |
|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | diag |
| 1 | construis-larbre | trigger | P1 P9 | 14 | `TreeBuilder` |
| 2 | ce-que-pesent-les-branches | discovery | P2 P3 P4 | 14 | lecture des poids, vérification somme = 1 |
| 3 | multiplier-le-long-dun-chemin | discovery | P5 P6 | 14 | produit le long d'un chemin |
| 4 | additionner-les-chemins | formalization | P7 P8 | 14 | somme de deux chemins, P(rouge) = 0,40 |
| 5 | atelier-de-larbre-a-la-phrase | practice_lab | P10 P9 | 10 | 3 situations générées par `.map()` (voir ci-dessous) |
| 6 | mission-finale-larbre | evaluation | — | 10 | `BossFinal` (10 épreuves) |

Le module 5 (`Module05AtelierDeLArbreALaPhrase.jsx`) construit ses étapes par `SITUATIONS.map((s, i) => ({...}))` sur les 3 scénarios de `data.js` (météo, usine, quiz) : contenu et `requires` entièrement pilotés par la donnée, contrairement à l'atelier littéral de probabilités-conditionnelles.

Knowledge Map : M1 1 · M2 2 · M3 1 · M4 2 · M5 1 = 7 items.

## 5. Mathematical model — `data.js`
`SACS` (`A: {rouges:3, bleues:3, p:0.6}`, `B: {rouges:2, bleues:6, p:0.4}` — premier niveau **déséquilibré** 0,6/0,4), `sacTotal(s)`, `pRougeSachant(s)`, `pBleueSachant(s)`, `pChemin(s, couleur)` (produit pondéré niveau1 × niveau2), `pCouleur(couleur)` (somme des chemins, loi des probabilités totales), `arbreBilles()` (forme attendue par `ProbabilityTree`), `BRIQUES` (6 briques pour `TreeBuilder`, dont 2 intrus), `SITUATIONS` (3 scénarios pour le module 5). Tests : 14, dont un test dédié au piège central : `donne P(rouge) = 0,40 — et NON la moyenne naïve 0,375`, et `donne des réponses qui contredisent la moyenne non pondérée` (généralise le même contrôle aux 3 situations du module 5).

**Vérification numérique** — chemins : `pChemin('A','rouge') = 0,6 × 0,5 = 0,30`, `pChemin('B','rouge') = 0,4 × 0,25 = 0,10`. Réponse correcte (loi des probabilités totales) : **P(rouge) = 0,30 + 0,10 = 0,40**. Moyenne naïve non pondérée : **(0,5 + 0,25) / 2 = 0,375**. Écart de 0,025, jugé « assez net pour que le distracteur soit distinguable » par le test :
```js
it('donne P(rouge) = 0,40 — et NON la moyenne naïve 0,375', () => {
  expect(pCouleur('rouge')).toBeCloseTo(0.4, 10);
  const moyenneNaive = (pRougeSachant('A') + pRougeSachant('B')) / 2;
  expect(moyenneNaive).toBeCloseTo(0.375, 10);
  expect(Math.abs(pCouleur('rouge') - moyenneNaive)).toBeGreaterThan(0.02);
});
```
Ce test est la garantie exécutable que la pédagogie ne peut pas être cassée silencieusement par un re-réglage des données : tant qu'il passe, l'écart entre le raisonnement correct et l'intuition naïve reste assez large pour être un distracteur crédible dans le boss (`ar-e7` propose `'0,40'` et `'0,375'` comme options).

## 6. Validation
`validate:lessons` 10/10 LP couverts ; vitest 14/14 ; e2e `apps/web/e2e/lesson-kit/2nde-arbres-probabilites.mjs` (vite :5253).
