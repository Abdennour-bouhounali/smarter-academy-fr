# 4e — `statistiques-4e` « L'observatoire des données »

> Objet officiel `statistiques` (BO n°10 du 5 mars 2026), domaine
> `donnees_probabilites`, rôle **approfondissement** dans la chaîne
> 5e → **4e** → 3e. Périmètre : `docs/architecture/CURRICULUM_MATRIX_5E_4E.md`.
> Clé catalogue `4e_statistiques`.

## 1. Identité

**Idée centrale, vécue avant d'être nommée** : un seul nombre ne résume pas une
série. Moyenne, médiane et étendue répondent à des questions DIFFÉRENTES, et
la preuve est qu'aucun des trois ne suffit : on peut déplacer une donnée sans
que la médiane bouge d'un millième, et trouver deux séries que la moyenne ne
distingue pas alors que tout les sépare. Le bon indicateur ne dépend pas de la
série, il dépend de la QUESTION.

## 2. Contrat curriculaire

| | |
|---|---|
| **Acquis 5e** (`priorKnowledge`) | `serie-donnees`, `effectif`, `tableau-effectifs`, `frequence`, `diagramme-barres`, `diagramme-circulaire`, `moyenne`, `interpreter` |
| **NOUVEAU en 4e** | **moyenne pondérée** (par coefficients et par effectifs) · **médiane** · **étendue** · **comparaison de deux séries** |
| **Approfondi** | la moyenne de 5e devient le cas particulier « tous les poids valent 1 » · lire un diagramme devient le METTRE EN CAUSE (axe tronqué) |
| **Réservé à la 3e** (exclu, garde exécutable) | quartiles · boîte à moustaches · écart type · variance |

La 5e installait la série, l'effectif, la fréquence, les deux diagrammes et la
moyenne simple lue comme un partage équitable ; son noyau refuse explicitement
d'aller plus loin (`assertScope5e('mediane')` y lève). La 4e ouvre l'autre côté
de cette frontière : le résumé cesse d'être UN nombre pour devenir un CHOIX
entre trois. La 3e (`statistiques-3e`) reprendra ces mêmes indicateurs sur des
séries plus grandes ; le plafond que la 4e ne franchit jamais est le quartile.

## 3. Learning Points (catalogue, append-only)

```
4e_statistiques-4e_P1  Calculer une moyenne pondérée
4e_statistiques-4e_P2  Déterminer la médiane d'une série
4e_statistiques-4e_P3  Interpréter la médiane comme valeur de partage
4e_statistiques-4e_P4  Calculer l'étendue d'une série
4e_statistiques-4e_P5  Distinguer ce que disent la moyenne et la médiane
4e_statistiques-4e_P6  Comparer deux séries statistiques
```

## 4. Modèle mathématique — `components/stats4e.js`

Source de vérité unique, pure, sans React. **Rien n'est réimplémenté** :
`mean`, `weightedMean`, `median`, `range`, `frequencyTable`, `sorted`, `sum` et
`formatNumber` viennent de `common/stats`. Une seule définition de la médiane
dans le dépôt — celle du programme, demi-somme des deux valeurs centrales quand
l'effectif est pair.

**La série est un OBJET, pas une liste.** `serie({id, nom, unite, items})`
porte des valeurs munies chacune d'un poids (1 par défaut). Une série brute est
donc exactement une série pondérée dont tous les poids valent 1 : la moyenne
pondérée EST la moyenne, et la continuité avec la 5e est une propriété testée
plutôt qu'une promesse de texte. Les gestes de l'Observatoire —
`remplacerValeur`, `changerPoids`, `ajouterValeur`, `retirerValeur` — rendent
tous une série NEUVE, jamais la même mutée (un état React muté en place ne
redéclenche aucun rendu et le laboratoire paraît gelé).

- **Indicateurs** : `moyenne` (pondérée), `moyenneSimple` (l'erreur visée sur
  un bulletin), `mediane`, `medianeDetail` (rangs centraux, valeurs
  encadrantes, `estUneValeurDeLaSerie`), `etendue`, `extremes`, `indicateurs`
  (les trois d'un coup), `tableauEffectifs`, `developpee`.
- **`sensibilite(serie, i, v)`** — le cœur de la leçon. Rend l'AVANT, l'APRÈS
  et les trois écarts quand l'élève déplace UNE valeur, plus les trois verdicts
  `moyenneABouge` / `medianeABouge` / `etendueABouge`. `deltaMoyenne` vaut
  exactement (v − ancienne)/N, ce qui rend la sensibilité prévisible donc
  démontrable. `balayerSensibilite` fait la même chose sur tout un domaine, et
  `indicateursRobustes` en déduit ceux qui n'ont bougé sur AUCUN cran.
  « La moyenne est sensible, la médiane est robuste » n'est écrit nulle part
  comme un fait : c'est ce que le nombre montre.
- **`comparer(a, b)`** — rend `separent` et `neSeparentPas` comme deux LISTES,
  jamais un « meilleur ». `verdict` est construit à partir d'elles, pas saisi
  dans un module.
- **`exagerationAxe({basse, haute, depart})`** — le facteur d'exagération d'un
  axe tronqué : le quotient du rapport VU (haute−depart)/(basse−depart) par le
  rapport RÉEL haute/basse. Vaut exactement 1 quand l'axe part de zéro ; lève
  si le départ coupe la barre basse, plutôt que de rendre un ∞ traduit en
  pixels absurdes.
- **Gardes de périmètre** : `assertScope4e(sujet)` lève sur `quartile`, `q1`,
  `q3`, `ecart-interquartile`, `boite-a-moustaches`, `ecart-type`, `variance`.
  Et rien de tout cela n'est exporté — bien que `common/stats` les contienne,
  ce module réexporte NOMMÉMENT et jamais par `export *`, ce qu'un test vérifie
  par l'absence.

## 5. Manipulation signature (M1) — `ObservatoireLab`

Douze temps de trajet domicile–collège, affichés en pastilles sur un axe, avec
les trois indicateurs en permanence au-dessus. **Un seul geste** : l'élève tire
la pastille de Soline, la seule qui vienne de loin, de 23 à 90 minutes.

```
moyenne  ●────────────────→  bouge à chaque cran, de (Δ)/12
médiane  ●                   ne bouge JAMAIS, sur tout le domaine
étendue  ●────────────────→  bouge, parce qu'on touche un extrême
```

Puis l'élève tire une pastille du CENTRE (Lise, 13 min) : cette fois la médiane
bouge et l'étendue non. **Aha** : ce ne sont pas des indicateurs « plus ou
moins précis », ils regardent des choses différentes.

La série est choisie pour ce qu'elle rend visible, et chaque point est TESTÉ :
moyenne 16 min exactement, médiane 12,5 min — un nombre qui n'appartient à
aucun élève, ce qui installe le cas pair dès la première seconde. Huit des
douze élèves sont sous la moyenne : « la moyenne, c'est le milieu » est démenti
par la donnée elle-même, pas par le professeur.

Laissé aux modules suivants : le calcul de la médiane (M3), la pondération
(M2), la comparaison (M5–M6), le diagramme trompeur (M7).

## 6. Modules

| M | Titre | Stage | Manipulation | LP |
|---|---|---|---|---|
| 0 | Mission de départ | prerequisite_check | diagnostic des 8 `priorKnowledge` de 5e | — |
| 1 | L'observatoire | trigger | `ObservatoireLab` : tirer une pastille, lire les trois écarts | P5 |
| 2 | Tous les devoirs ne pèsent pas pareil | discovery | `BulletinLab` : glisser les coefficients, la moyenne se déplace | P1 |
| 3 | Couper le groupe en deux | manipulation | `PartageLab` : déplacer une barre jusqu'à ce que les deux moitiés s'équilibrent — la médiane est trouvée avant d'être nommée | P2, P3 |
| 4 | Du plus petit au plus grand | manipulation | l'axe se rétracte sur les extrêmes ; bouger une valeur intérieure ne change rien | P4 |
| 5 | Deux groupes, une seule moyenne | manipulation | `ComparaisonLab` : Rouge et Bleu, même moyenne ET même étendue — seule la médiane parle | P6, P5 |
| 6 | Deux villes, une seule médiane | manipulation | même labo, paire inverse : seule l'étendue parle. Aucun indicateur n'est « le bon » | P6, P4 |
| 7 | Le graphique qui ment | practice_lab | `AxeLab` : glisser le départ de l'axe d'un sondage 48/52, lire le facteur d'exagération | P5, P6 |
| 8 | 🏆 Mission finale | evaluation | 10 épreuves, ≥ 1 par LP | — |

Durée : 4+11+10+11+8+10+9+8+9 = **80 min** (≤ 90).

## 7. Continuité d'état

`continuity: null`. Chaque module a son contexte propre (trajets, bulletin,
groupes, villes, sondage), et c'est délibéré : le LP P6 demande de choisir un
indicateur EN FONCTION DE LA QUESTION, or une leçon qui resterait sur une seule
série laisserait croire que le bon indicateur est une propriété de la série.
Le transfert entre contextes EST l'objectif.

## 8. Erreurs visées

- **« la moyenne, c'est le milieu »** → M1, huit des douze élèves sont en
  dessous de la moyenne, et la donnée le dit avant le texte ;
- **oublier les coefficients** → M2, `moyenneSimple(BULLETIN)` vaut 12,5 et la
  vraie moyenne 11,2 : l'erreur fait changer de côté de 12 ;
- **diviser par le nombre de LIGNES au lieu de l'effectif** → M2 bis, la série
  `FRATRIES` a 5 lignes pour 25 élèves ; l'erreur donne 2,2 frères et sœurs au
  lieu de 1,68 ;
- **chercher la médiane dans la liste quand l'effectif est pair** → M3, la
  médiane des trajets vaut 12,5 et n'est le trajet de personne ;
- **croire qu'un indicateur est meilleur que les autres** → M5 puis M6, deux
  paires construites en miroir : la médiane sauve la première comparaison et
  est aveugle à la seconde ;
- **lire un diagramme sans regarder l'axe** → M7, l'écart réel de 4 points
  paraît plus de deux fois plus grand qu'il n'est.

## 9. Les données, et ce que chacune doit prouver

Chaque jeu est vérifié par un test qui échoue si la donnée cesse de démontrer
son point — la contrainte « un schéma ne contredit jamais la leçon » (§28bis)
appliquée aux nombres, pas seulement aux dessins.

| Donnée | Ce qu'elle doit montrer | Vérifié par |
|---|---|---|
| `TRAJETS` (12 trajets) | moyenne 16 ≠ médiane 12,5 ; médiane hors série ; médiane immobile sur les 68 crans de la poignée | balayage complet de `DOMAINE_ELOIGNE` |
| `BULLETIN` (4 épreuves) | pondérer change la moyenne de plus d'un point et fait changer de côté de 12 ; coefficients totalisant 10 ; gros coefficients sur les PETITES notes | comparaison simple / pondérée |
| `FRATRIES` (5 lignes, 25 élèves) | l'effectif n'est pas le nombre de lignes | 1,68 contre 2,2 |
| `GROUPE_ROUGE` / `GROUPE_BLEU` | même moyenne (12) ET même étendue (15) : **seule** la médiane sépare | `separent === ['mediane']` |
| `VILLE_ABRITEE` / `VILLE_EXPOSEE` | même moyenne (18) ET même médiane (18) : **seule** l'étendue sépare | `separent === ['etendue']` |
| `SONDAGE_TRUQUE` (48 / 52) | facteur exactement 1 à l'axe zéro, strictement croissant ensuite, > 2 dès 45 | balayage de `departs` |

Les deux paires de comparaison sont la construction la plus fragile de la
leçon : les tests vérifient les TROIS indicateurs de chaque paire, pas seulement
celui que la rédaction met en avant. Sans cela, un module pourrait affirmer
« la moyenne ne les distingue pas » devant deux nombres différents.

## 10. Vérification

Noyau : `stats4e.test.js` — 55 tests. Gardes de périmètre (absence des
quartiles / boîte / écart type, `assertScope4e` qui lève, détection d'un
`export *` accidentel de `common/stats`), sérialité et immutabilité des quatre
gestes, moyenne pondérée dont la simple est le cas particulier, médiane aux
deux parités avec le cas « hors série », étendue insensible à l'intérieur,
sensibilité balayée sur tout le domaine de la poignée, les deux paires de
comparaison dans les deux sens, axe tronqué et ses deux levées, écritures
françaises (vrai signe moins U+2212).

Navigateur : `apps/web/e2e/lesson-kit/4e-statistiques.mjs` — laboratoire balayé
aux deux bornes, manipulation jamais gelée après validation, chemins faux non
bloquants, boss complet, carte des connaissances, mobile 375 px, console vide.
