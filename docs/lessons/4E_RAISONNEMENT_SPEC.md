# 4e — `raisonnement-problemes-4e` « Le programme mystère »

> Objet officiel `calcul_litteral` (BO n°10 du 5 mars 2026), domaine `nombres_calculs`.
> **Part 3** de la clé catalogue `4e_calcul_litteral` — part 1 = `calcul-litteral-4e`
> (transformer les expressions), part 2 = `equations-4e` (s'en servir pour résoudre).
> Périmètre : `docs/architecture/CURRICULUM_MATRIX_5E_4E.md`.

## 1. Pourquoi cette leçon existe

Le référentiel 2026 fait de la résolution de problèmes un **AXE TRANSVERSAL**
(`generation_rules.problem_solving_rule`) : elle traverse tous les domaines et
tous les niveaux. Elle reçoit pourtant un objet propre en 6e
(`resolution-problemes-6e`) et en 3e (`resolution-problemes-3e`) — **jamais en
4e**. Le trou est réel, et il tombe exactement là où la 4e vient d'acquérir
l'outil qui manque aux deux autres niveaux : le calcul littéral.

D'où le rattachement. Cette leçon est la **suite naturelle** des deux autres
parts de `calcul_litteral` :

```
part 1  calcul-litteral-4e   TRANSFORMER   3x + 2x = 5x, 2(n+3) = 2n + 6
part 2  equations-4e         RÉSOUDRE      2x + 5 = 11 → x = 3
part 3  raisonnement-4e      PROUVER       2(n+3) − 2n = 6, pour TOUT n
```

Ce qu'on sait transformer, on peut désormais s'en servir pour **prouver**. La
lettre cesse d'être une inconnue à trouver : elle devient un nombre
quelconque, et c'est ce glissement — le seul de tout le collège — que cette
leçon fait vivre.

## 2. Identité — l'idée centrale, vécue avant d'être nommée

**Quelques exemples ne prouvent rien.** Un seul contre-exemple réfute
définitivement. Et le calcul littéral, lui, démontre pour TOUS les cas à la
fois.

Cette idée ne se dit pas, elle se subit : l'élève essaie son propre nombre,
puis un autre, puis un grand, puis un négatif — et le résultat ne bouge pas.
Il ne peut pas mettre le programme en défaut, et pourtant rien ne lui garantit
qu'il n'existe pas quelque part un nombre qui casserait tout. Le manque est
créé par le geste, pas par une phrase.

**Le noyau refuse de mentir.** `tester(conjecture, valeurs)` n'a
délibérément **PAS** de statut « prouvée » : après cent essais réussis, il
renvoie `statut: 'non-prouvee'` et le message « 100 essais sans exception —
mais 100 essais ne prouvent rien ». Ce message est CALCULÉ, jamais écrit dans
un module : la leçon ne peut pas contredire ses propres données.

## 3. Contrat curriculaire

| | |
|---|---|
| **Acquis 5e/4e** (`priorKnowledge`) | `programme-de-calcul` (5e `fonctions-5e`) · `substituer`, `distributivite-simple`, `factoriser`, `tester-une-egalite` (4e `calcul-litteral-4e`) · `modeliser-par-une-equation`, `controler-le-sens` (4e `equations-4e`) |
| **NOUVEAU en 4e** | le processus en sept temps · données utiles / inutiles · l'estimation avant le calcul · conjecture · contre-exemple · preuve par le calcul littéral · vérifier DANS l'histoire · la phrase-réponse |
| **Approfondi** | choisir entre plusieurs stratégies valides pour une même situation |
| **Réservé à la 3e** (exclu, **garde exécutable**) | systèmes d'équations · équation produit nul · identités remarquables · inéquations |

La frontière est du **code** : `assertScope4e('systeme' \| 'produit-nul' \|
'identite-remarquable' \| 'inequation')` lève, et `raisonnement4e.js` n'expose
aucune fonction correspondante (vérifié par
`components/raisonnement4e.test.js`).

## 4. Learning Points (catalogue, part 3 de `4e_calcul_litteral`)

```
4e_raisonnement-problemes-4e_P1  Comprendre un énoncé et en extraire les données utiles
4e_raisonnement-problemes-4e_P2  Représenter une situation par un schéma ou un tableau
4e_raisonnement-problemes-4e_P3  Estimer un résultat avant de calculer
4e_raisonnement-problemes-4e_P4  Conjecturer à partir d'exemples
4e_raisonnement-problemes-4e_P5  Réfuter par un contre-exemple
4e_raisonnement-problemes-4e_P6  Prouver une conjecture par le calcul littéral
4e_raisonnement-problemes-4e_P7  Vérifier et interpréter un résultat
```

## 5. Modèle mathématique — `components/raisonnement4e.js` (déjà livré, 27 tests)

- `ETAPES` / `etapeApres` — les **sept temps** : comprendre → extraire →
  représenter → choisir → calculer → vérifier → expliquer. Chaque module en
  travaille un ; le module 6 les enchaîne tous.
- `conjecture({id, enonce, predicat, vraie, preuve})` — un énoncé et le moyen
  de le tester ; `predicat` est une fonction **pure** de l'entier testé.
- `tester(conj, valeurs)` — `{resultats, verifies, contreExemples, statut,
  message}`. **Deux statuts seulement** : `'refutee'` et `'non-prouvee'`.
- `chercherContreExemple(conj, de, a)` — le PREMIER contre-exemple, ou `null`.
- `sommeTroisConsecutifs(n)` et `etapesPreuveConsecutifs(n)` — les trois
  écritures : `n + (n+1) + (n+2)` → `3n + 3` → `3 × (n+1)`.
- `programmeMystere(n)` et `etapesProgramme(n)` — quatre étapes, résultat
  toujours 6 : `2(n + 3) − 2n = 6`.
- `STRATEGIES` — essais organisés · remonter à l'envers · schéma en barres ·
  équation · calcul littéral, chacune avec son « quand ».
- `plausible(valeur, contraintes)` — positif, entier, min, max : le contrôle
  qu'on fait AVANT de vérifier le calcul.
- `verifierDansLHistoire(valeur, controles)` — remet la valeur trouvée dans
  l'ÉNONCÉ, pas dans la dernière ligne.
- `CONJECTURES` — une vraie (`sommeMultipleDe3`), deux fausses
  (`sommeToujoursPaire`, `carrePlusGrand`), chacune avec un contre-exemple
  atteignable dans l'intervalle que la leçon propose.
- `PROBLEME_FINAL` — 3 ballons + 2 filets = 74 €, un ballon coûte 4 € de plus
  qu'un filet → **filet = 12,40 €**. Volontairement **non rond** (pour que la
  vérification serve vraiment), avec deux données inutiles.

## 6. Manipulation signature (M1) — `EnqueteLab`

**L'élève tape SES nombres.** Le programme mystère se déroule étape par
étape : « choisis un nombre » → « ajoute 3 » → « multiplie par 2 » → « retire
le double du nombre de départ ». Les trois valeurs intermédiaires **changent
sous ses yeux** à chaque essai ; la quatrième ne bouge pas.

Chaque essai se **verse au tableau de bord** comme une pièce à conviction :
une ligne, quatre colonnes, la dernière toujours à 6. L'élève choisit ses
nombres — 7, 100, 0, un négatif : le champ accepte tout entier de −99 à 999.
Le panneau de verdict est piloté par `tester()`, donc il affiche **le message
calculé** : « 5 essais sans exception — mais 5 essais ne prouvent rien. »

Le système ne donne **JAMAIS** la réponse. Il ne dit pas « c'est parce que les
2n s'annulent ». Il constate, il compte, et il refuse de conclure.

**Aha visé** : « je n'arrive pas à le mettre en défaut… mais **pourquoi** ? »

C'est seulement à l'étape 3, une fois la conjecture énoncée par l'élève, que
`TileBoard` (partagé, `common/algebra4e`) montre l'expression `2(n + 3) − 2n`
en tuiles : les deux tuiles `2n` sont là, l'une positive et l'autre négative,
et les 6 unités restent. La lettre remplace tous les essais d'un coup.

**Laissé aux modules suivants** : les données inutiles (M2), le schéma et
l'estimation (M3), le choix entre stratégies (M4), le contre-exemple et la
somme de trois consécutifs (M5), le problème complet (M6).

## 7. Les autres laboratoires

| Composant | Module | Geste | Ce qu'il rend visible |
|---|---|---|---|
| `EnqueteLab` | 1 | taper un nombre, verser l'essai au tableau | les intermédiaires bougent, le résultat non |
| `InfoSorter` (partagé) | 2 | glisser-déposer les cartes-données dans deux bacs | trois données servent, deux ne servent à rien |
| `BarModel` (partagé) | 3 | construire la barre segment par segment | 5 filets + 12 € = 74 € |
| `ConjectureLab` | 5 | choisir ses valeurs, lancer le test | le verdict de `tester()` — jamais « prouvée » |

`ConjectureLab` est le **jumeau critique** de `EnqueteLab` : même refus de
conclure, mais cette fois l'élève rencontre aussi une conjecture FAUSSE, où
un seul essai suffit à trancher. Le contraste est la leçon.

## 8. Modules

| M | Titre | Stage | Laboratoire | LP |
|---|---|---|---|---|
| 0 | Mission de départ | prerequisite_check | diagnostic des 7 prérequis | — |
| 1 | Le programme mystère | trigger | `EnqueteLab` + `TileBoard` | P4, P6 |
| 2 | Ce que l'énoncé raconte | discovery | `InfoSorter` : utile / inutile | P1 |
| 3 | Dessiner, puis estimer | manipulation | `BarModel` + une estimation avant calcul | P2, P3 |
| 4 | Deux chemins, une réponse | manipulation | la même situation résolue deux fois | P3 |
| 5 | Le contre-exemple | manipulation | `ConjectureLab` : vraie, fausse, preuve | P4, P5, P6 |
| 6 | L'enquête complète | practice_lab | `PROBLEME_FINAL` de bout en bout | P1, P7 |
| 7 | 🏆 Mission finale | evaluation | 10 épreuves, ≥ 1 par LP | — |

Durée : 4 + 14 + 10 + 11 + 10 + 13 + 12 + 9 = **83 min** (≤ 90) = catalogue
`durationMinutes`.

## 9. Continuité d'état

`continuity: null`. Le module 1 travaille sur un programme de calcul, le
module 2 sur un énoncé de club sportif, le module 5 sur des entiers
consécutifs : ce sont trois objets mathématiques **différents par nécessité**,
et la leçon a besoin de cette variété pour montrer que le raisonnement est
transversal. Imposer un objet commun serait un artifice d'architecture, pas un
choix pédagogique — et la règle du dépôt dit alors de déclarer `null` avec sa
raison plutôt que de fabriquer une chaîne.

## 10. Erreurs visées

- **« ça marche sur mes cinq exemples, donc c'est prouvé »** — l'erreur
  centrale, attaquée par `tester()` lui-même (M1, M5, boss e5).
- **« un contre-exemple ne suffit pas, il en faut plusieurs »** — la symétrie
  fausse : la réfutation, elle, est immédiate (M5).
- **utiliser toutes les données de l'énoncé** parce qu'elles y sont (M2).
- **calculer sans estimer**, donc ne pas voir qu'un résultat est aberrant (M3).
- **vérifier dans la dernière ligne** au lieu de l'énoncé : une erreur de
  calcul se reproduit à l'identique (M6).
- **rendre un nombre nu** au lieu d'une phrase qui répond à la question (M6).
- **refuser un résultat parce qu'il n'est pas rond** — 12,40 € est la bonne
  réponse (M6, boss e9).

## 11. Ce que la leçon ne dit JAMAIS

Aucune copie de cette leçon n'écrit qu'une conjecture est « prouvée » parce
que des essais ont réussi. Le noyau ne peut pas le produire ; les modules ne
doivent pas le contredire. Un test `components/parcours.test.js` interdit
mécaniquement le statut, et l'e2e vérifie que « ne prouvent rien » est bien à
l'écran après une série d'essais réussis.

## 12. Vérification

```
npx vitest run --root apps/web src/lessons/college/4e/nombres_calculs/raisonnement-problemes-4e/
node scripts/audit-knowledge-dependencies.mjs --lesson raisonnement-problemes-4e --strict
npm run validate:lessons && npm run check:routes
node apps/web/e2e/lesson-kit/4e-raisonnement.mjs      # KIT_BASE=http://localhost:5412
```
