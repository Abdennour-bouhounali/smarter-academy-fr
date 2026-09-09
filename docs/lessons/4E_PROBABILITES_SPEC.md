# 4e — `probabilites-4e` « Le sac qui se chevauche »

> Objet officiel `probabilites` (BO n°10 du 5 mars 2026), domaine
> `donnees_probabilites`, rôle **approfondissement** dans la chaîne
> 5e → **4e** → 3e. Périmètre : `docs/architecture/CURRICULUM_MATRIX_5E_4E.md`.
> Clé catalogue `4e_probabilites`.

## 1. Identité

**Idée centrale, vécue avant d'être nommée** : un événement est un ENSEMBLE
d'issues, et les mots « contraire », « et », « ou » sont des gestes sur cet
ensemble — on retire, on garde ce qui est dans les deux, on rassemble. Tant
qu'on liste les issues, on ne peut pas se tromper ; dès qu'on compte
séparément puis qu'on additionne, on double les billes communes. La deuxième
idée est expérimentale : répéter fait FLUCTUER la fréquence, et répéter
davantage la fait se RESSERRER autour de la probabilité.

## 2. Contrat curriculaire

| | |
|---|---|
| **Acquis 5e** (`priorKnowledge`) | `experience-aleatoire`, `issue`, `evenement`, `equiprobabilite`, `frequence-observee`, `probabilite`, `echelle-probabilite` |
| **NOUVEAU en 4e** | **événement contraire** et P(A) + P(Ā) = 1 · **intersection** décrite par ses issues · **réunion** décrite par ses issues · événement **impossible** / **certain** · **fluctuation** des fréquences puis stabilisation |
| **Approfondi** | la probabilité comme fraction irréductible ; l'échelle de 0 à 1 avec ses deux bornes enfin nommées |
| **Réservé à la 3e** (exclu, garde exécutable) | arbres pondérés · P(A∪B) = P(A)+P(B)−P(A∩B) **comme règle enseignée** · probabilités conditionnelles · expériences à deux épreuves |

La 5e a installé le vocabulaire sur UNE épreuve et des issues équiprobables.
La 4e garde l'épreuve unique — c'est la 3e qui en composera deux — et
travaille sur les ÉVÉNEMENTS eux-mêmes : les combiner, les nier, reconnaître
leurs deux cas extrêmes, et confronter la théorie à la répétition.

**Le point délicat.** L'intersection et la réunion se traitent en 4e par
LISTE D'ISSUES, jamais par formule. La formule additive est un objet de 3e :
elle n'existe pas dans le code, et `assertScope4e('formule-union')` lève.

## 3. Learning Points (catalogue, append-only)

```
4e_probabilites-4e_P1  Décrire l'événement contraire d'un événement
4e_probabilites-4e_P2  Calculer la probabilité d'un événement contraire
4e_probabilites-4e_P3  Décrire l'intersection de deux événements
4e_probabilites-4e_P4  Décrire la réunion de deux événements
4e_probabilites-4e_P5  Reconnaître un événement impossible et un événement certain
4e_probabilites-4e_P6  Observer la fluctuation des fréquences lors de répétitions
4e_probabilites-4e_P7  Relier fréquence observée et probabilité
```

## 4. Modèle mathématique — `components/proba4e.js`

Source de vérité unique, pure, sans React. **Ensembles-objets, jamais listes
de nombres** : un événement EST l'ensemble de ses issues, et les trois
opérations du programme sont les opérations ensemblistes correspondantes —
donc rien de ce que la leçon affirme ne peut être démenti par le code.

- `experience({id, nom, issues})` — les issues portent un **poids entier**
  (défaut 1) et des **attributs**. Poids entier ⇒ probabilité rationnelle
  exacte, et un poids se DESSINE (un secteur deux fois plus large).
- `evenement(exp, ids)` / `evenementSi(exp, predicat)` — la condition écrite
  en français et la liste affichée ne peuvent pas diverger.
- `contraire`, `intersection`, `reunion` — trois opérations sur les
  ensembles. `reunion` construit l'ensemble ; elle n'additionne rien.
- `compteNaifReunion(a, b)` = |A| + |B| — **ce n'est pas une formule
  enseignée, c'est l'erreur visée**, exposée pour être mise côte à côte avec
  le vrai décompte.
- `probabilite(evenement)` — **rationnel exact** (`algebra4e/exprCore.rat`) :
  P(rouge) EST 1/2, jamais « 0,5 ». `probaContraire` = 1 − P(A), par
  soustraction exacte.
- `estImpossible` / `estCertain` / `qualifier` — reconnus par leurs ISSUES
  (aucune / toutes) ; « P = 0 » est la conséquence, pas la définition.
- `simuler`, `trajectoire`, `series`, `tableauDeStabilisation`,
  `ecartALaProbabilite`, `amplitude`, `ecartMoyen` — le hasard est **injecté**
  (`makeRng` de `common/stats/randomUtils`), jamais tiré dans un rendu.
- **Gardes de périmètre** : ni `arbre`, ni `probaConditionnelle`, ni
  `deuxEpreuves`, ni `formuleUnion` — testés absents ; `assertScope4e` lève
  sur les quatre sujets.

### Le sac, choisi pour que le chevauchement soit inévitable

Huit billes, **deux attributs** (couleur ET taille) — un seul attribut
rendrait toute intersection triviale :

```
rouges          R1 R2 R3 R4          (4)   P = 1/2
grandes         R1 R2 B1 V1          (4)   P = 1/2
rouges ET grandes    R1 R2           (2)   P = 1/4
rouges OU grandes    R1 R2 R3 R4 B1 V1 (6) P = 3/4
comptage naïf 4 + 4 = 8              → P = 1 : « certain »
```

**Pourquoi ce sac et pas un autre.** Le comptage naïf annonce 8 billes sur 8,
donc un événement CERTAIN. Or B2 et B3 sont bleues ET petites : elles sont
dans le sac, sous les yeux de l'élève, et échappent à la réunion. L'erreur se
réfute **à l'œil, sur la figure**, pas par autorité de l'enseignant.

La **roue** (secteurs 3-2-2-1) complète le dispositif : issues NON
équiprobables, probabilité 3/8 qui se lit sur le dessin autant que dans le
calcul, et preuve que la stabilisation n'est pas un artefact du 1/2.

## 5. Manipulation signature (M1) — `SacLab`

Le sac est ouvert, les huit billes visibles avec leur couleur et leur taille.
L'élève **glisse les billes** dans un cerceau « rouge » et un cerceau
« grande » posés sur la table. Les deux cerceaux se recouvrent : R1 et R2 ne
peuvent aller QUE dans la zone commune — la géométrie de la manipulation
impose le fait avant que le mot « intersection » soit prononcé.

```
billes en vrac  →  un cerceau  →  deux cerceaux  →  la zone commune
                →  ce qui reste dehors (le contraire)
```

Puis le bouton « compte vite » : la leçon additionne 4 + 4 et affiche
**8 billes sur 8, donc certain**. L'élève regarde le sac, voit B2 et B3
dehors, et le contredit. **Aha** : rassembler deux ensembles n'est pas
additionner deux nombres.

Laissé aux modules suivants : le contraire formalisé (M2), P(A)+P(Ā)=1 (M3),
impossible et certain (M4), la fluctuation (M5–M6).

## 6. Modules

| M | Titre | Stage | Manipulation | LP |
|---|---|---|---|---|
| 0 | Mission de départ | prerequisite_check | diagnostic des 7 `priorKnowledge` de 5e | — |
| 1 | Le sac de billes | trigger | `SacLab` : glisser les billes dans deux cerceaux qui se recouvrent ; le comptage rapide se fait démentir | P3, P4 |
| 2 | Tout ce qui reste | discovery | `ContraireLab` : un cerceau, et l'élève ramasse ce qui est DEHORS ; le contraire se construit, il ne se récite pas | P1 |
| 3 | Les deux parts font le tout | manipulation | même sac : la barre 0→1 se remplit des deux parts, qui se rejoignent EXACTEMENT à 1 | P2, P1 |
| 4 | Jamais, toujours | manipulation | `EchelleLab` : composer un événement à la demande jusqu'à en obtenir un de probabilité 0, puis un de probabilité 1 | P5 |
| 5 | Cinq séries à la fois | manipulation | `FluctuationLab` : cinq séries de 10 lancers côte à côte — cinq résultats différents pour une seule probabilité | P6 |
| 6 | Ça se resserre | manipulation | même labo, curseur 10 → 100 → 1 000 → 10 000 : l'amplitude et l'écart moyen s'affichent et fondent | P7, P6 |
| 7 | L'atelier | practice_lab | la roue non équiprobable, de bout en bout : contraire, et, ou, impossible, certain | P3, P4, P5 |
| 8 | 🏆 Mission finale | evaluation | 10 épreuves, ≥ 1 par LP | — |

Durée : 4+11+9+9+8+9+9+8+9 = **76 min** (≤ 90).

## 7. Continuité d'état

`continuity: null` sauf entre **M5 et M6**, qui partagent le même labo de
simulation : c'est exactement là que la continuité porte du sens, puisque
l'élève doit voir SA série se prolonger et se resserrer, et non repartir sur
une autre. Partout ailleurs le contexte change (sac, échelle, roue), et le
transfert entre contextes est l'objectif.

## 8. Erreurs visées

- **additionner les cardinaux d'une réunion** (« 4 rouges + 4 grandes = 8 ») →
  M1, les billes B2 et B3 restées dehors le contredisent visuellement ;
- **confondre « et » et « ou »** → M1, les deux cerceaux et leur zone commune
  sont trois régions distinctes qu'on remplit à la main ;
- **croire le contraire « symétrique »** (le contraire de « rouge » serait
  « bleue ») → M2, ce qui reste dehors contient AUSSI la bille verte ;
- **croire qu'une petite fréquence observée réfute la probabilité** → M5, cinq
  séries donnent cinq nombres différents et pourtant une seule probabilité ;
- **attendre la fréquence exacte** (« 1000 lancers donneront 500 rouges ») →
  M6, l'écart diminue mais ne s'annule jamais.

## 9. Vérification

Noyau : `proba4e.test.js` — **59 tests**. P(A) + P(Ā) = 1 est vérifiée en
rationnels **exacts sur les 256 parties du sac ET les 16 parties de la roue**
(`toEqual({n:1,d:1})`, aucune tolérance flottante) ; l'écart entre comptage
naïf et vraie réunion est prouvé égal au cardinal de l'intersection sur une
grille exhaustive ; la stabilisation (écart moyen ET amplitude décroissants à
chaque palier 10 → 100 → 1 000 → 10 000) est **balayée sur huit graines**, sur
le sac et sur la roue — jamais sur une graine chanceuse ; le déterminisme à
graine égale et la différence à graines distinctes sont tous deux testés.

**Piège mesuré et gardé par un test** : `graine + 1` ne convient pas pour un
bouton « relance » — mulberry32 avance son état d'un pas fixe, si bien que les
graines 1, 2, 3 et 5 donnent toutes la bille B2 en premier tirage. D'où
`graineSuivante`, qui avance d'un pas premier (1 000 000 007) ; le test vérifie
à la fois que le piège existe et que le pas premier le désamorce.

Navigateur : `apps/web/e2e/lesson-kit/4e-probabilites.mjs` — labo balayé aux
deux bornes, chemins faux non bloquants, boss complet, carte, mobile 375 px,
console vide.
