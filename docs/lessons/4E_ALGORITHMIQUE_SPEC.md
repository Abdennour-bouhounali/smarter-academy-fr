# 4e — `algorithmique-programmation-4e` « Le programme qui choisit »

> Objet officiel `algorithmique_programmation` (BO n°10 du 5 mars 2026), domaine
> `pensee_informatique`, rôle **approfondissement** dans la chaîne 6e → 5e → **4e** → 3e.
> Clé catalogue `4e_algorithmique_programmation`.
> Périmètre : `docs/architecture/CURRICULUM_MATRIX_5E_4E.md`.

## 1. Identité

**Idée centrale, vécue avant d'être nommée** : un programme n'est plus une liste
d'ordres qu'on subit du début à la fin. Il **choisit** son chemin (SI…ALORS…SINON), et
il **garde une mémoire qui change** (une variable qu'on écrit, pas seulement qu'on
lit). D'où le fait le plus contre-intuitif de la 4e : *la même instruction, rencontrée
deux fois, peut ne pas faire la même chose*.

En 5e, KIWI obéissait ; en 4e, KIWI **décide**. L'élève ne peut pas le voir en
regardant un dessin fini : il faut **arrêter le programme au milieu** et regarder
l'état. C'est pourquoi le geste signature de cette leçon n'est pas un curseur mais un
**pas-à-pas** — le premier débogueur de la scolarité.

## 2. Contrat curriculaire

| | |
|---|---|
| **Acquis 5e** (`priorKnowledge`) | `instruction-programme`, `boucle` (6e) · `instruction-parametree`, `prevoir-executer`, `variable-informatique`, `entree-programme`, `formule-programme`, `repeter-n-fois`, `angle-exterieur`, `deboguer` (5e, leçon `algorithmique-programmation-5e`) |
| **NOUVEAU en 4e** | l'instruction conditionnelle « si… alors… sinon » · écrire une condition qui teste une valeur · prévoir le chemin suivi selon la valeur testée · la variable qu'on ÉCRIT (affectation) et qui évolue · le compteur `i ← i + 1` · l'exécution pas à pas comme méthode |
| **Approfondi** | modifier un programme existant pour changer son résultat · tester et corriger (le débogage de 5e, appliqué à des bugs qu'un tracé seul ne révèle pas) |
| **Réservé à la 3e** (exclu, garde exécutable) | la boucle « tant que » · les conditions composées (ET / OU) · la création de blocs ou de fonctions · l'imbrication de structures |

La frontière n'est pas une consigne d'auteur : elle est **portée par le moteur**.
`components/trace4e.js` expose un `KINDS` clos qui ne contient pas TANT QUE ;
`evalTest` ne connaît qu'UNE comparaison ; `makeSi` et `makeRepeat` aplatissent toute
imbrication. Un test unitaire (`trace4e.test.js`, 46 cas) échoue si on les élargit.

## 3. Learning Points (catalogue `4e_algorithmique_programmation`)

```
4e_algorithmique-programmation-4e_P1  Lire une instruction conditionnelle « si… alors… sinon »
4e_algorithmique-programmation-4e_P2  Écrire une condition qui teste une valeur
4e_algorithmique-programmation-4e_P3  Prévoir le chemin suivi par un programme selon la valeur testée
4e_algorithmique-programmation-4e_P4  Manipuler une variable qui évolue au cours du programme
4e_algorithmique-programmation-4e_P5  Modifier un programme existant pour changer son résultat
4e_algorithmique-programmation-4e_P6  Tester un programme et corriger son erreur
```

## 4. Modèle — `apps/web/src/lessons/common/turtle/trace4e.js` (déjà écrit, 46 tests verts)

Moteur partagé du niveau, pas un composant de leçon : il vit sous `lessons/common/`
et non dans le dossier de la leçon, exactement comme `geo5e` ou `algebra4e`.

- État canonique `{ x, y, cap }` + `env` : les variables, qui **changent**.
- `makeSi(test, alors, sinon)`, `affecter(nom, valeur)`, `condition(g, op, d)`.
- `derouler(programme, env)` — un SI ne déroule qu'UNE branche, et les affectations
  prennent effet au fil de l'eau ; le déroulement n'est donc pas calculable à l'avance.
- **`executerPasAPas(programme, {env, depart})`** — un état par instruction exécutée,
  index 0 = état de départ. C'est ce qui rend une variable observable.
- `premiereDifference(a, b)` et `premiereDifferenceVariables(a, b)` — le point de
  divergence, **calculé**, pour le module de débogage.
- `cadre(resultat)` / `toSvg` — le cadre est DÉRIVÉ du tracé, jamais fixé.

## 5. Manipulation signature (M1) — `AlgoLab`

> Le premier débogueur de l'élève.

Un programme en blocs que l'élève **réordonne** (monter / descendre), **reparamètre**
(le côté, l'angle, le nombre de tours), puis **exécute — met en pause — avance pas à
pas**. À chaque pas, quatre choses sont montrées ENSEMBLE, depuis le même état :

1. le **dessin jusqu'ici** (`segmentsJusquIci`) — ni plus, ni moins ;
2. la **position** et le **cap** (dans le DOM, jamais en `<text>` SVG) ;
3. les **variables** et leur valeur à cet instant ;
4. l'**instruction en cours**, surlignée par `srcIndex`, et — dans un SI — la
   **branche réellement prise** (`branche`).

**Aha** : « le programme s'arrête au milieu, et je vois ce qu'il a dans la tête ».

Le lab reste vivant après validation (jamais de `disabled={done}`), et le
programme parcouru va du carré au rectangle au polygone régulier — l'élève
**prédit** la figure avant de lancer.

Laissé aux modules suivants : le SI (M2), écrire une condition (M3), le compteur qui
grandit (M4), modifier pour atteindre une cible (M5), réparer (M6).

## 6. Modules

| M | Titre | Stage | Manipulation | LP |
|---|---|---|---|---|
| 0 | Mission de départ | prerequisite_check | diagnostic des 6 acquis de 5e | — |
| 1 | Le programme au ralenti | trigger | `AlgoLab` : réordonner, reparamétrer, **pas à pas** | P3 |
| 2 | Le bloc qui choisit | discovery | un SI dans la boucle ; on change l'entrée, la branche change | P1, P3 |
| 3 | Écrire la condition | manipulation | choisir gauche / comparateur / droite, et tester aux **bornes** | P2, P3 |
| 4 | Le compteur qui grandit | manipulation | `i ← i + 1` dans la boucle : la spirale, inspectée pas à pas | P4 |
| 5 | Changer le résultat | manipulation | modifier un programme donné pour atteindre une figure imposée | P5 |
| 6 | Le labo de réparation | practice_lab | trois programmes cassés, trois causes ; divergence **calculée** | P6 |
| 7 | 🏆 Mission finale | evaluation | 10 épreuves, ≥ 1 par LP | — |

Durée : 5 + 13 + 11 + 11 + 12 + 9 + 10 + 9 = **80 min** (≤ 90, = `durationMinutes`).

## 7. Continuité d'état

`continuity: { key: 'programme', chain: [1, 2] }` — le programme réglé au module 1 est
celui dans lequel on **glisse un SI** au module 2 : l'élève reconnaît son propre
travail au moment exact où on lui ajoute le choix. Au-delà, les modules ont besoin de
programmes CHOISIS (une condition à écrire, un compteur, trois bugs précis) : imposer
la continuité y serait artificiel.

## 8. Erreurs visées

- croire qu'un SI exécute **les deux** branches (M2 : le pas-à-pas montre qu'une seule
  ligne s'exécute) ;
- confondre `<` et `⩽` **à la borne** (M3 : la question porte exactement sur la valeur
  frontière, jamais sur un cas confortable) ;
- lire `i ← i + 1` comme une **équation impossible** au lieu d'une affectation (M4) ;
- croire qu'une variable garde la valeur de sa dernière lecture affichée, alors qu'elle
  a changé depuis (M4, visible seulement au pas-à-pas) ;
- chercher un bug **partout** au lieu de s'arrêter au premier écart (M6) ;
- ne pas voir un bug de **compteur**, parce que le dessin ne diverge que plus tard que
  la variable (M6 : `premiereDifferenceVariables` < `premiereDifference`).

## 9. Vérification

`trace4e.test.js` (46 cas — exactitude et périmètre, déjà verts) +
`components/parcours.test.js` : **chaque affirmation** que les modules font sur le
comportement d'un programme est rejouée sur le moteur — « ce programme trace un
carré », « la branche sinon est prise pour n = 3 », « le compteur vaut 5 à la fin »,
« le programme cassé n° 2 diverge au pas que le module annonce ».
Navigateur : `apps/web/e2e/lesson-kit/4e-algorithmique.mjs` sur le port **5410**.
