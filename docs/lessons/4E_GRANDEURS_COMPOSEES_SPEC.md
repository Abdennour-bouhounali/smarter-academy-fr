# 4e — `grandeurs-composees-4e` « Grandeurs composées »

> Objet officiel `proportionnalite` (BO n°10 du 5 mars 2026), domaine
> `proportionnalite_fonctions`, rôle **approfondissement** dans la chaîne
> 6e → 5e → **4e** → 3e.
> Part 2 de la clé catalogue `4e_proportionnalite` (part 1 = `proportionnalite-4e`,
> le produit en croix et les évolutions).
> Périmètre : `docs/architecture/CURRICULUM_MATRIX_5E_4E.md`.

## 1. Pourquoi cette leçon existe, et où elle se rattache

Le référentiel 2026 ne porte **aucun objet « grandeurs et mesures » au cycle 4** :
il n'en existe qu'en 6e. Les grandeurs composées y vivent donc **à l'intérieur de
la proportionnalité** — la 5e y installe la vitesse moyenne (brique
`vitesse-moyenne`), la 3e y ajoute les « grandeurs quotient » (brique
`grandeurs-quotient` de `proportionnalite-3e`).

Cette leçon n'invente pas un objet : elle est la **part 2 de l'objet officiel
`proportionnalite`**, exactement comme `pythagore-4e` est la part 2 de
`4e_triangles`. La clé catalogue `4e_proportionnalite` devient un TABLEAU de
deux entrées (mécanisme `buildLesson`, partIndex 1 et 2).

**La coupe est pédagogique.** `proportionnalite-4e` traite le *nombre* : la
quatrième proportionnelle, le coefficient multiplicateur, les évolutions.
`grandeurs-composees-4e` traite la *grandeur* : ce qu'est un km/h, pourquoi le
débit n'est pas une notion de plus, et pourquoi « ÷ 3,6 » n'est pas une recette.

## 2. Ce que la leçon ajoute à la vitesse de 5e

La 5e **calcule** une vitesse moyenne. La 4e **comprend ce qu'est** cette vitesse :

1. une grandeur **QUOTIENT** — deux grandeurs divisées, avec une unité composée
   qui se lit « par » (km/h, L/min, g/cm³) ;
2. distincte d'une grandeur **PRODUIT** (le kWh, les ouvriers·jours), qui se lit
   « fois » ;
3. et dont on change l'unité **en raisonnant sur ce que l'unité signifie**,
   jamais par une recette.

## 3. Contrat curriculaire

| | |
|---|---|
| **Acquis 5e** (`priorKnowledge`) | `vitesse-moyenne`, `mem-vitesse`, `coefficient-proportionnalite` (`proportionnalite-5e`), `quotient` |
| **NOUVEAU en 4e** | grandeur quotient · grandeur produit · lire une unité composée · le débit · la masse volumique · km/h ↔ m/s par le sens · lire une formule reliant trois grandeurs |
| **Approfondi** | résoudre un problème de grandeurs composées en contexte |
| **Réservé à la 3e** (exclu, garde exécutable) | k² et k³ (agrandissement des aires et volumes) · les fonctions linéaires · les fonctions affines |

Les mots « fonction affine » et « coefficient directeur » n'apparaissent nulle
part dans la leçon. La frontière est **exécutable** : `assertScope4e` lève sur
`aire-agrandie`, `volume-agrandi`, `fonction-lineaire`, `fonction-affine`, et un
test vérifie que le noyau n'exporte aucune de ces fonctions.

## 4. Learning Points (catalogue, part 2 de `4e_proportionnalite`)

```
4e_grandeurs-composees-4e_P1  Relier distance, durée et vitesse
4e_grandeurs-composees-4e_P2  Reconnaître une grandeur quotient et une grandeur produit
4e_grandeurs-composees-4e_P3  Calculer un débit
4e_grandeurs-composees-4e_P4  Convertir une vitesse de km/h en m/s
4e_grandeurs-composees-4e_P5  Interpréter une formule reliant des grandeurs
4e_grandeurs-composees-4e_P6  Résoudre un problème de grandeurs composées
```

## 5. Modèle mathématique — `components/grandeurs4e.js`

Le noyau est **la source de vérité unique** de toute la leçon : aucune valeur
affichée n'est écrite à la main dans un module.

- `relation({distance, duree, vitesse})` — on en donne **deux**, elle calcule la
  troisième et dit laquelle via `manquante`. Les trois cadrans du tableau de bord
  lisent tous cet objet : ils **ne peuvent pas se contredire**.
- `siOnDouble({grandeur, fixee, etat})` — ce qui arrive à la troisième grandeur
  quand on en double une, l'autre étant fixée. La réponse **dépend de laquelle on
  fixe** : c'est la charnière de la leçon, donc une fonction, jamais une phrase.
- `debitRelation`, `tempsDeRemplissage`, `masseVolumiqueRelation` — délèguent à
  `relation`. Ce n'est pas une facilité d'implémentation : c'est **l'énoncé
  pédagogique** de la leçon, écrit en code.
- `kmhVersMs` / `msVersKmh` — exposent `etapes` (`metres`, `secondes`, `quotient`,
  `raccourci`) pour que « ÷ 3,6 » apparaisse comme la **conséquence** de « 1000 m
  en 3600 s », et jamais comme le point de départ.
- `enHeuresMinutes` / `texteDuree` — 1,5 h s'affiche « 1 h 30 min », avec report
  géré (1,999 h ne donne jamais « 1 h 60 »).
- `GRANDEURS` — trois quotients, deux produits, chacun avec sa `lecture`
  (« des kilomètres par heure », « des kilowatts fois des heures »).
- `CYCLISTE`, `BORNES` — l'état de départ du tableau de bord et les bornes
  atteignables des trois cadrans.

## 6. Manipulation signature (M1) — `DashboardLab`

**Trois cadrans liés** : distance, durée, vitesse. L'élève **choisit lequel
tenir fixe**, puis en glisse un autre ; le troisième suit, calculé par
`relation()`. Les trois cadrans ne peuvent donc jamais se contredire, dans aucun
état atteignable.

**L'aha, et où il se trouve vraiment.** Le contraste n'est PAS entre les deux
grandeurs qu'on peut doubler à fixée constante : ces deux facteurs sont
**toujours égaux** (à durée fixée, doubler la distance et doubler la vitesse
donnent ×2 toutes les deux). Défaut trouvé au navigateur, où la phrase-clé du
labo ne pouvait jamais s'afficher.

Le contraste est entre les deux **fixations** d'un même geste : doubler la durée
**divise la vitesse par deux** si l'on fixe la distance, mais **double la
distance** si l'on fixe la vitesse. Le labo ouvre donc sur « je règle la durée,
distance fixée », le seul réglage de départ qui porte l'aha — et là où le
contraste n'existe pas (régler la distance), il le **dit** au lieu de feindre.
`siOnDouble` fournit les deux réponses ; `parcours.test.js` verrouille les trois
faits.

Les durées sont écrites avec `texteDuree` : le cadran montre « 1 h 30 min », pas
« 1,5 h ». Le nombre décimal reste lisible juste à côté — c'est la même durée,
dite deux fois.

**Laissé aux modules suivants** : le mot « quotient » et le tri quotient/produit
(M2), le débit (M3), le changement d'unité (M4), la formule écrite (M5).

## 7. Modules

| M | Titre | Stage | Manipulation | LP |
|---|---|---|---|---|
| 0 | Mission de départ | prerequisite_check | diagnostic des acquis de 5e | — |
| 1 | Le tableau de bord | trigger | `DashboardLab` : fixer l'un, glisser l'autre, le troisième suit | P1 |
| 2 | « Par » ou « fois » ? | discovery | trieur d'unités composées : la lecture à voix haute décide | P2 |
| 3 | Le robinet | manipulation | `TankLab` : le niveau monte, et c'est la MÊME structure | P3 |
| 4 | 1000 mètres en 3600 secondes | manipulation | `ConversionLab` : le raisonnement, puis le raccourci qu'il produit | P4 |
| 5 | Lire une formule | manipulation | `FormuleLab` : d = v × t et ses trois lectures | P5 |
| 6 | Le carnet de route | practice_lab | trois problèmes réels, l'outil n'est pas donné | P6, P3 |
| 7 | 🏆 Mission finale | evaluation | 10 épreuves, ≥ 1 par LP | — |

Durée : 4 + 13 + 9 + 11 + 11 + 10 + 10 + 9 = **77 min** (≤ 90), égale au
`durationMinutes` du catalogue.

## 8. Continuité d'état

`continuity: null`. Chaque module a son contexte propre — le cycliste, les
étiquettes d'unités, le robinet, l'autoroute, le carnet. C'est **délibéré** :
l'objectif de la leçon est précisément que la structure « une grandeur par une
autre » se **transporte** d'un contexte à l'autre. Garder le cycliste partout
enfermerait la leçon dans un seul décor et détruirait son argument central.

## 9. Erreurs visées

- croire que doubler la durée double la vitesse (**la question dépend de ce
  qu'on fixe** — M1, testée dans `parcours.test.js`) ;
- lire km/h comme « des kilomètres fois des heures » (M2) ;
- traiter le débit comme une notion nouvelle à réapprendre (M3 : même structure,
  démontrée) ;
- appliquer « ÷ 3,6 » dans le mauvais sens (M4 : le sens dit lequel — 36 km/h
  font 10 m/s, un nombre **plus petit**) ;
- confondre les trois lectures de d = v × t (M5) ;
- additionner des grandeurs quotient (M6, M7).

## 10. Vérification

`grandeurs4e.test.js` (32 tests : exactitude, périmètre, cohérence des trois
lectures sur toute la grille, report des minutes) + `parcours.test.js` (tous les
nombres annoncés par les modules, et l'atteignabilité de chaque cible de
curseur). Navigateur : `apps/web/e2e/lesson-kit/4e-grandeurs.mjs` sur le port
**5411**, 68/68.

Trois défauts ont été trouvés par cette vérification, et aucun ne l'aurait été
par le noyau seul :
1. le choix `vitesse: 45` du module 5 faisait mentir la ligne « on retombe bien
   dessus » (30 km à 45 km/h → 0,67 h, dont 45 × 0,67 = 30,15) ;
2. les trois labos écrivaient leur `id` en dur alors qu'ils sont rendus à
   plusieurs étapes : chaque `<label for>` pointait vers la première occurrence
   — corrigé par `useId` ;
3. la comparaison « si je double » du labo signature ne pouvait produire aucun
   contraste (voir § 6).
