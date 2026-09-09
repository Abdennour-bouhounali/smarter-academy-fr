# 4e — `proportionnalite-4e` « La fabrique à proportions »

> Objet officiel `proportionnalite` (BO n°10 du 5 mars 2026), domaine
> `proportionnalite_fonctions`, rôle **approfondissement** dans la chaîne
> 6e → 5e → **4e** → 3e. Périmètre : `docs/architecture/CURRICULUM_MATRIX_5E_4E.md`.
> Part 1 de la clé catalogue `4e_proportionnalite` (part 2 = `grandeurs-composees-4e`).

## 1. Identité

**Idée centrale, vécue avant d'être nommée** : une situation proportionnelle est
UNE relation, et cette relation se lit indifféremment comme des objets, une
table, un rapport, un coefficient ou un alignement de points. Quand la
situation n'est pas proportionnelle, les CINQ lectures cassent ensemble — c'est
ce simultané qui prouve qu'elles décrivent bien la même chose.

## 2. Contrat curriculaire

| | |
|---|---|
| **Acquis 5e** (`priorKnowledge`) | `coefficient-proportionnalite`, `tableau-proportionnalite`, `pourcentage`, `graphique-proportionnalite`, `quotient` |
| **NOUVEAU en 4e** | quatrième proportionnelle par le **produit en croix** · **coefficient multiplicateur** · augmentation / diminution en % · retrouver la **valeur initiale** |
| **Approfondi** | détecter la non-proportionnalité (rapport constant ? alignement AVEC l'origine ?) · valeurs rationnelles non entières |
| **Réservé à la 3e** (exclu, garde exécutable) | fonctions linéaires · k² / k³ sur les aires et volumes · Thalès |

La 5e installait le coefficient comme opérateur et ouvrait le graphique ; la 4e
ajoute l'outil qui manque quand aucun passage n'est entier (le produit en
croix) et le raisonnement multiplicatif sur les évolutions.

## 3. Learning Points (catalogue, append-only)

```
4e_proportionnalite-4e_P1  Déterminer une quatrième proportionnelle par le produit en croix
4e_proportionnalite-4e_P2  Calculer une augmentation en pourcentage
4e_proportionnalite-4e_P3  Calculer une diminution en pourcentage
4e_proportionnalite-4e_P4  Utiliser un coefficient multiplicateur
4e_proportionnalite-4e_P5  Retrouver une valeur initiale après une évolution
4e_proportionnalite-4e_P6  Résoudre un problème de proportionnalité en contexte
```

## 4. Modèle mathématique — `components/prop4e.js`

Source de vérité unique. **Règle-objets, jamais listes de valeurs** (§6ter.2) :
une situation est une FONCTION de l'entrée, donc le non-proportionnel se
comporte comme tel à TOUTE entrée atteignable, y compris celles auxquelles
l'auteur n'a pas pensé.

- `proportionnelle({k})` / `affine({base,k})` / `parPalier(...)` — les règles.
- `rapports(couples)` — la colonne « ÷ entrée », qui est constante ou ne l'est pas.
- `quatriemeProportionnelle(a, b, c)` — **rationnel exact** (`algebra4e/exprCore.rat`),
  car 3 pour 7 € donne 7/3 et « 2,333 » serait une faute.
- `coefficientMultiplicateur(t)` = 1 + t, `appliquerEvolution(v, t)`,
  `valeurInitiale(final, k)`, `evolutionEntre(a, b)` — délégués à
  `common/stats/percentUtils` (une seule définition dans le dépôt).
- **Gardes de périmètre** : ni `fonctionLineaire`, ni `aireAgrandie`/`k2`, ni
  `thales` — testés absents.

## 5. Manipulation signature (M1) — `UsineLab`

Une presse à jus : l'élève glisse le nombre d'oranges, le jus suit. Les
représentations se dévoilent **progressivement**, jamais toutes à la fois :

```
objets  →  table  →  colonne « ÷ oranges »  →  coefficient  →  points
```

Puis un bouton « l'autre machine » : une presse qui facture 2 € de mise en
service. Le geste est le même, mais la colonne des rapports cesse d'être
constante, les points ne passent plus par l'origine, et le coefficient
n'existe plus. **Aha** : les cinq lectures cassent ENSEMBLE.

Laissé aux modules suivants : le produit en croix (M2), les pourcentages
(M3–M4), le graphique comme critère (M5).

## 6. Modules

| M | Titre | Stage | Manipulation | LP |
|---|---|---|---|---|
| 0 | Mission de départ | prerequisite_check | diagnostic des 5 `priorKnowledge` | — |
| 1 | La fabrique | trigger | `UsineLab` : glisser l'entrée, révéler les 5 lectures, casser avec la 2e machine | P1 |
| 2 | La case vide | discovery | `CroixLab` : quatre cases, l'élève tire les diagonales ; le produit en croix apparaît quand aucun passage n'est entier | P1 |
| 3 | Le prix qui change | manipulation | `EvolutionLab` : glisser un taux, la barre et le coefficient bougent ensemble (×1,2 / ×0,8) | P2, P3, P4 |
| 4 | Revenir en arrière | manipulation | même barre, sens inverse : −20 % n'annule pas +20 % ; retrouver le prix d'avant | P5, P4 |
| 5 | Le graphique décide | manipulation | `AlignementLab` : placer les points de deux situations, la droite par O tranche | P6 |
| 6 | L'atelier | practice_lab | trois situations réelles (recette, change, soldes) de bout en bout | P6, P1 |
| 7 | 🏆 Mission finale | evaluation | 10 épreuves, ≥ 1 par LP | — |

Durée : 4+12+11+11+10+11+9+9 = **77 min** (≤ 90).

## 7. Continuité d'état

`continuity: null`. Chaque module a son propre contexte (jus, recette, prix,
graphique) : réutiliser la presse de M1 en M5 n'apporterait rien
mathématiquement et enfermerait la leçon dans un seul contexte, alors que le
transfert entre contextes EST l'objectif de la proportionnalité.

## 8. Erreurs visées

- additif au lieu de multiplicatif (« +3 oranges donc +3 € ») → M1, la colonne
  des rapports le contredit ;
- « −20 % annule +20 % » → M4, la valeur de retour est 0,96 fois celle de départ ;
- confondre POINTS et POUR CENT → M3, les deux lectures sont affichées côte à côte ;
- croire proportionnelle toute situation croissante → M1 et M5.

## 9. Vérification

Noyau : `prop4e.test.js` (exactitude rationnelle, gardes de périmètre, chaque
situation distingue le juste de l'erreur visée) + `parcours.test.js` (les
chiffres que la rédaction annonce). Navigateur : `apps/web/e2e/lesson-kit/4e-proportionnalite.mjs`
sur le port 5401 — labo balayé aux deux bornes, chemins faux non bloquants,
boss complet, carte, mobile 375 px, console vide.
