# 4e — `fonctions-4e` « La machine qu'on remonte »

> Objet officiel `fonctions` (BO n°10 du 5 mars 2026), domaine
> `proportionnalite_fonctions`, rôle **approfondissement** dans la chaîne
> 5e → **4e** → 3e → seconde. Périmètre : `docs/architecture/CURRICULUM_MATRIX_5E_4E.md`.
> Clé catalogue `4e_fonctions`.

## 1. Identité

**Idée centrale, vécue avant d'être nommée** : un programme de calcul est une
CHAÎNE ORIENTÉE, pas une recette. Parce qu'elle est orientée, on peut la
descendre (exécuter), la remonter (inverser) et la RÉSUMER d'un seul trait —
une formule. Ces trois gestes portent sur le même objet, et c'est ce qui fait
qu'une formule n'est pas une écriture de plus : c'est la machine, dite en une
ligne.

La 5e faisait exécuter le programme. La 4e le retourne, et lui demande son nom.

## 2. Contrat curriculaire

| | |
|---|---|
| **Acquis 5e** (`priorKnowledge`) | `dependance`, `meme-entree-meme-sortie`, `en-fonction-de`, `tableau-de-valeurs`, `programme-de-calcul`, `couple-point`, `lire-graphique` |
| **NOUVEAU en 4e** | **inverser** un programme (remonter de la sortie à l'entrée) · **produire la formule** qui le résume · passer d'un **tableau de valeurs à une formule** · **modéliser** une situation par une formule ET un graphique |
| **Approfondi** | la dépendance (elle peut DÉCROÎTRE) · l'exécution sur plusieurs valeurs, en rationnels exacts · la représentation graphique, désormais produite depuis une formule |
| **Réservé à la 3e** (exclu, garde exécutable) | la notation f(x) · les mots « image » et « antécédent » · fonctions linéaires et affines · coefficient directeur · ordonnée à l'origine |

La 5e installait l'intuition (« qui commande, qui suit ») et la lecture
(tableau, graphique). La 4e ajoute le seul outil qui manque pour MODÉLISER :
l'écriture qui tient toute la machine, et sa réversibilité.

**La frontière, dite précisément.** La 4e écrit bel et bien « 3x + 2 » : c'est
du calcul littéral de 4e, une EXPRESSION. Ce qui appartient à la 3e, c'est de
la NOMMER f et d'en évaluer f(3) — la notation, pas l'écriture. De même, la 4e
demande « quelle entrée donne 47 ? » et la fait trouver en remontant le
programme ; elle ne dit jamais « l'antécédent de 47 ».

## 3. Learning Points (catalogue, append-only)

```
4e_fonctions-4e_P1  Identifier la dépendance entre deux grandeurs
4e_fonctions-4e_P2  Exécuter un programme de calcul sur plusieurs valeurs
4e_fonctions-4e_P3  Produire la formule qui résume un programme de calcul
4e_fonctions-4e_P4  Passer d'un tableau de valeurs à une formule
4e_fonctions-4e_P5  Représenter graphiquement une dépendance
4e_fonctions-4e_P6  Modéliser une situation par une formule et un graphique
```

## 4. Modèle mathématique — `components/fonctions4e.js`

Source de vérité unique. **Règle-objets, jamais listes de valeurs** (§6ter.2) :
un programme est une SUITE ORDONNÉE D'ÉTAPES, `[{op:'×',val:3},{op:'+',val:2}]`,
et non les quatre nombres qu'on lui a vu produire. C'est ce qui permet, du même
objet, de l'exécuter, de l'inverser, de le résumer et de le tracer.

- **Construire** — `etape(op, val)`, `programme(...)`, `programmeValide`, `OPS`.
  Quatre opérations seulement (`+ − × ÷`) : le carré ferait un programme à deux
  entrées possibles, c'est-à-dire la question de 3e.
- **Exécuter** — `executer(prog, x)` en **rationnels exacts**
  (`algebra4e/exprCore`), `trace(prog, x)` pour la valeur après chaque étape.
  « ÷ 3 » sur 1 rend 1/3, jamais 0,333 : sans exactitude, l'aller-retour ne
  refermerait pas et la leçon montrerait un mensonge.
- **Inverser** — `estInversible`, `raisonNonInversible`, `inverser(prog)`,
  `remonter(prog, y)`. L'ordre s'inverse ET les opérations se défont : « ×3
  puis +2 » se remonte par « −2 puis ÷3 ». Seul « × 0 » n'est pas inversible,
  et la raison est montrable (toutes les entrées y donnent 0).
- **Produire la formule** — `formule(prog)` → `{x, k}`, `formuleTex(prog)` via
  `exprTex` (« 3x + 2 », jamais « f(x) = … »), `memeFormule(p, q)`,
  `programmeDepuisFormule(f)` pour le chemin retour.
- **Tableau** — `tableau(prog, xs)` exact, `enPoints` (conversion en flottant
  au dernier moment, une seule fois), `tableauDecimal`.
- **Du tableau à la formule** — `testerFormule(candidate, couples)` (le patron
  « testeur de règle » de `fonctions-3e` M1 : le rapport nomme les couples qui
  démentent la candidate), `formuleDepuisTableau(couples)` qui rend `null`
  quand aucune formule n'explique le tableau — une réponse, pas un échec.
- **Graphique** — `planeFor(points)` : étendue jamais dégénérée, axes
  contenant 0, nombre de graduations borné même pour 100 000 ; `pasRond` admet
  des pas décimaux, car les situations modélisées sont des prix et des longueurs.
- **Situations** (`SITUATIONS`, règle-objets portant leur DOMAINE) :
  `forfait` (7x + 12), `perimetreFixe` (10 − x, la sortie DÉCROÎT),
  `conversion` (8/5·x, sans part fixe), `citerne` (300 − 25x, vide à 12 min).
- **Garde de périmètre** : `assertScope4e(sujet)` lève pour `image`,
  `antecedent`, `notation-fx`, `fonction-lineaire`, `fonction-affine`,
  `coefficient-directeur`, `ordonnee-origine`.

## 5. Manipulation signature (M1) — `ProgrammeLab`

Une chaîne de cases : l'élève glisse un nombre d'entrée, et le voit DESCENDRE
les étapes une à une (`trace`) — il ne voit pas seulement le résultat tomber.
Puis il attrape la sortie et la tire vers le haut : la chaîne se retourne
sous ses doigts, chaque opération devenant son contraire.

```
entrée → [×3] → [+2] → sortie        puis, à rebours :
sortie → [−2] → [÷3] → entrée
```

**Aha** : ce n'est pas la même chaîne écrite à l'envers — l'ORDRE aussi s'est
retourné. Le contre-exemple est à portée : une case « ×0 », et la remontée
devient impossible, parce que toutes les entrées donnaient la même sortie.

Laissé aux modules suivants : la formule (M3), le tableau retourné (M4), le
graphique (M5), la modélisation (M6).

## 6. Modules

| M | Titre | Stage | Manipulation | LP |
|---|---|---|---|---|
| 0 | Mission de départ | prerequisite_check | diagnostic des 7 `priorKnowledge` de 5e | — |
| 1 | La chaîne | trigger | `ProgrammeLab` : descendre la chaîne, puis la remonter ; « ×0 » la casse | P1, P2 |
| 2 | Plusieurs entrées d'un coup | discovery | la même chaîne nourrie de plusieurs entrées ; le tableau se remplit tout seul | P2 |
| 3 | Dire la machine en une ligne | manipulation | assembler la formule terme à terme, la comparer à la chaîne sur TOUTE entrée | P3 |
| 4 | Le tableau muet | manipulation | `TesteurDeFormule` : des couples sans machine ; une candidate juste « parfois » est rejetée | P4 |
| 5 | La formule devient un dessin | manipulation | chaque couple devient un point, le repère s'ajuste (`planeFor`) | P5 |
| 6 | L'enclos et la citerne | practice_lab | deux situations où la sortie DÉCROÎT : modéliser de bout en bout | P6, P1 |
| 7 | 🏆 Mission finale | evaluation | 10 épreuves, ≥ 1 par LP | — |

Durée : 4+12+9+12+11+10+10+6 = **74 min** (≤ 90, catalogue : 70).

## 7. Continuité d'état

`continuity: null`. La chaîne de M1 est un objet abstrait ; les situations de
M6 sont des contextes réels. Les relier de force ferait croire qu'une formule
appartient à son histoire, alors que le transfert entre contextes EST l'objet
de la modélisation.

## 8. Erreurs visées

- **remonter sans retourner l'ordre** (« ÷3 puis −2 ») → M1, la valeur de
  retour n'est pas celle de départ, et le chiffre le dit ;
- **valider une formule sur un seul couple** → M4, le testeur affiche l'accord
  partiel et NOMME les couples qui démentent ;
- **croire que « dépendre » = « augmenter ensemble »** → M6, l'enclos et la
  citerne décroissent et restent des dépendances ;
- **confondre le programme et sa formule** (« ×2 puis ×3 » ≠ « ×6 ») → M3,
  deux chaînes différentes, une seule formule.

## 9. Vérification

Noyau : `fonctions4e.test.js` — **56 tests** : périmètre exécutable (absence
des API de 3e + `assertScope4e` qui lève + aucune écriture ne contenant
« f(x) », « image », « antécédent », « affine », « linéaire »), exactitude
rationnelle, aller-retour de `inverser` sur une **grille exhaustive** de
4 × 8 × 4 × 8 = 1 024 programmes × 8 entrées, non-inversibilité de « ×0 »,
rejet d'une formule d'accord partiel, `planeFor` non dégénéré et borné sur dix
cas extrêmes (vide, confondus, négatifs, 100 000, décimaux), et chaque
situation balayée sur TOUT son domaine (jamais négative, périmètre 20 vérifié
à chaque longueur, citerne vide exactement à 12).
Navigateur (à venir) : `apps/web/e2e/lesson-kit/4e-fonctions.mjs` — labo balayé
aux deux bornes, chemins faux non bloquants, boss complet, carte, mobile
375 px, console vide.
