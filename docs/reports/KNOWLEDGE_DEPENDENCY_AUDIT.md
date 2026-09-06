# Audit des dépendances de connaissances

> Généré par `npm run audit:knowledge` (lexique v1). Ne pas éditer à la main.
>
> La loi : **avant toute demande, tout ce qui est nécessaire pour la comprendre doit déjà être
> disponible pour l'élève** (docs/architecture/KNOWLEDGE_DEPENDENCY.md). Les positions
> `explain`, `explainWrong`, `correction`, `feedback` et `footer` renforcent une notion ;
> elles ne l'établissent jamais.
>
> Le lexique est un **détecteur**, pas le juge : il signale les candidats à l'audit manuel.

## Périmètre courant — 3e et 2nde

50 leçon(s) · critiques 26 · hautes 38 · moyennes 9 · basses 6

| Leçon | Carte | Bricks | requires | Contrat | C | H | M | L |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `3e:fonctions-3e` | ✅ | 17 | 41/41 | 0 | 0 | 0 | 0 | 0 |
| `3e:fonctions-affines-3e` | — | 0 | 0/29 | 0 | 4 | 1 | 0 | 1 |
| `3e:fonctions-lineaires-3e` | — | 0 | 0/34 | 0 | 3 | 3 | 0 | 1 |
| `3e:lecture-graphique-3e` | — | 0 | 0/33 | 0 | 2 | 1 | 0 | 0 |
| `3e:modelisation-3e` | — | 0 | 0/41 | 0 | 1 | 5 | 0 | 1 |
| `3e:probabilites-3e` | — | 0 | 0/41 | 0 | 1 | 0 | 0 | 0 |
| `3e:proportionnalite-3e` | — | 0 | 0/47 | 0 | 1 | 1 | 0 | 1 |
| `3e:representation-graphique-3e` | — | 0 | 0/31 | 0 | 1 | 1 | 1 | 0 |
| `3e:statistiques-3e` | — | 0 | 0/42 | 0 | 1 | 2 | 2 | 0 |
| `3e:pythagore-3e` | — | 0 | 0/30 | 0 | 0 | 0 | 0 | 0 |
| `3e:reperage-droite-plan-3e` | — | 0 | 0/28 | 0 | 0 | 1 | 0 | 0 |
| `3e:representation-espace-3e` | — | 0 | 0/26 | 0 | 0 | 0 | 1 | 0 |
| `3e:thales-3e` | — | 0 | 0/29 | 0 | 1 | 1 | 1 | 0 |
| `3e:translations-vecteurs-3e` | — | 0 | 0/27 | 0 | 1 | 0 | 1 | 0 |
| `3e:triangles-3e` | — | 0 | 0/27 | 0 | 0 | 1 | 0 | 0 |
| `3e:trigonometrie-triangle-rectangle-3e` | — | 0 | 0/31 | 0 | 2 | 1 | 0 | 0 |
| `3e:calcul-litteral-algebrique` | — | 0 | 0/30 | 0 | 0 | 1 | 0 | 0 |
| `3e:equations-produit` | — | 0 | 0/26 | 0 | 0 | 1 | 0 | 0 |
| `3e:multiples-diviseurs` | — | 0 | 0/31 | 0 | 0 | 0 | 0 | 0 |
| `3e:nombres-rationnels` | — | 0 | 0/34 | 0 | 0 | 0 | 0 | 0 |
| `3e:puissances-3e` | — | 0 | 0/28 | 0 | 0 | 0 | 0 | 0 |
| `3e:racines-carrees-3e` | — | 0 | 0/32 | 0 | 0 | 0 | 0 | 0 |
| `3e:resolution-problemes-3e` | — | 0 | 0/30 | 0 | 0 | 0 | 0 | 0 |
| `seconde:fonction-affine-2nde` | ✅ | 0 | 0/32 | 0 | 0 | 0 | 0 | 0 |
| `seconde:fonctions-2nde` | ✅ | 0 | 0/37 | 0 | 1 | 1 | 1 | 0 |
| `seconde:fonctions-de-reference-2nde` | ✅ | 0 | 0/27 | 0 | 2 | 0 | 0 | 0 |
| `seconde:signe-fonctions-2nde` | ✅ | 0 | 0/31 | 0 | 0 | 3 | 0 | 0 |
| `seconde:variations-extremums-2nde` | ✅ | 0 | 0/32 | 0 | 1 | 2 | 0 | 0 |
| `seconde:colinearite-alignement-2nde` | ✅ | 0 | 0/27 | 0 | 0 | 1 | 0 | 0 |
| `seconde:equations-de-droites-2nde` | ✅ | 0 | 0/31 | 0 | 1 | 0 | 0 | 0 |
| `seconde:positions-relatives-droites-2nde` | ✅ | 0 | 0/29 | 0 | 0 | 0 | 1 | 0 |
| `seconde:vecteurs-2nde` | ✅ | 0 | 0/29 | 0 | 0 | 0 | 0 | 0 |
| `seconde:arithmetique-2nde` | ✅ | 0 | 0/32 | 0 | 0 | 0 | 0 | 0 |
| `seconde:calcul-litteral-2nde` | ✅ | 0 | 0/30 | 0 | 1 | 1 | 0 | 0 |
| `seconde:ensembles-et-intervalles-2nde` | ✅ | 0 | 0/28 | 0 | 0 | 0 | 0 | 0 |
| `seconde:equations-et-inequations-2nde` | ✅ | 0 | 0/34 | 0 | 0 | 4 | 0 | 0 |
| `seconde:logique-et-raisonnement-2nde` | ✅ | 0 | 0/29 | 0 | 0 | 1 | 0 | 0 |
| `seconde:nombres-reels-2nde` | ✅ | 0 | 0/24 | 0 | 0 | 1 | 1 | 1 |
| `seconde:valeur-absolue-distance-2nde` | ✅ | 0 | 0/27 | 0 | 1 | 1 | 0 | 0 |
| `seconde:arbres-probabilites-2nde` | ✅ | 0 | 0/26 | 0 | 0 | 0 | 0 | 0 |
| `seconde:boites-a-moustaches-2nde` | ✅ | 0 | 0/26 | 0 | 0 | 0 | 0 | 0 |
| `seconde:evolutions-successives-reciproques-2nde` | ✅ | 0 | 0/32 | 0 | 0 | 0 | 0 | 0 |
| `seconde:frequences-conditionnelles-2nde` | ✅ | 0 | 0/27 | 0 | 0 | 0 | 0 | 0 |
| `seconde:loi-grands-nombres-2nde` | ✅ | 0 | 0/24 | 0 | 0 | 0 | 0 | 1 |
| `seconde:probabilites-conditionnelles-2nde` | ✅ | 0 | 0/27 | 0 | 1 | 0 | 0 | 0 |
| `seconde:proportions-pourcentages-2nde` | ✅ | 0 | 0/34 | 0 | 0 | 0 | 0 | 0 |
| `seconde:series-regroupees-classes-2nde` | ✅ | 0 | 0/33 | 0 | 0 | 1 | 0 | 0 |
| `seconde:statistiques-une-variable-2nde` | ✅ | 0 | 0/34 | 0 | 0 | 2 | 0 | 0 |
| `seconde:tableaux-croises-2nde` | ✅ | 0 | 0/26 | 0 | 0 | 0 | 0 | 0 |
| `seconde:tests-diagnostiques-probabilites-2nde` | ✅ | 0 | 0/28 | 0 | 0 | 0 | 0 | 0 |

### `3e:fonctions-affines-3e`

- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/fonctions-affines-3e/modules/Module00Diagnostic.jsx:21 · terme « notation-fx »  
  « notation f(x) » is a target concept of this lesson but its first appearance is diag.prompt (module 0); it is only taught later at apps/web/src/lessons/college/3e/donnees_probabilites/fonctions-affines-3e/modules/Module01TaxiEtForfait.jsx:243
- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/fonctions-affines-3e/modules/Module00Diagnostic.jsx:31 · terme « representation-graphique »  
  « représentation graphique » is a target concept of this lesson but its first appearance is diag.prompt (module 0) and it is never taught in a teaching position
- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/fonctions-affines-3e/modules/Module02BoutonA.jsx:168 · terme « coefficient-directeur »  
  « coefficient directeur » is a target concept of this lesson but its first appearance is q.option (module 2, étape 4) and it is never taught in a teaching position
- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/fonctions-affines-3e/modules/Module02BoutonA.jsx:169 · terme « ordonnee-origine »  
  « ordonnée à l'origine » is a target concept of this lesson but its first appearance is q.option (module 2, étape 4); it is only taught later at apps/web/src/lessons/college/3e/donnees_probabilites/fonctions-affines-3e/modules/Module05DeuxPoints.jsx:132
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/fonctions-affines-3e/modules/Module03BoutonB.jsx:96 · terme « appartient »  
  « symbole ∈ » first appears at q.explain (module 3, étape 1) and is never established in a teaching position in this lesson
- **LOW** `L_DISTRACTOR_ONLY` — apps/web/src/lessons/college/3e/donnees_probabilites/fonctions-affines-3e/modules/Module02BoutonA.jsx:171 · terme « antecedent »  
  « antécédent » appears only as a wrong answer, first at q.option (module 2, étape 4) — a distractor still creates a first exposure

### `3e:fonctions-lineaires-3e`

- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/fonctions-lineaires-3e/modules/Module00Diagnostic.jsx:21 · terme « notation-fx »  
  « notation f(x) » is a target concept of this lesson but its first appearance is diag.prompt (module 0); it is only taught later at apps/web/src/lessons/college/3e/donnees_probabilites/fonctions-lineaires-3e/modules/Module01PrixAuKilo.jsx:322
- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/fonctions-lineaires-3e/modules/Module00Diagnostic.jsx:21 · terme « fonction »  
  « fonction » is a target concept of this lesson but its first appearance is diag.prompt (module 0); it is only taught later at apps/web/src/lessons/college/3e/donnees_probabilites/fonctions-lineaires-3e/modules/Module01PrixAuKilo.jsx:322
- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/fonctions-lineaires-3e/modules/Module01PrixAuKilo.jsx:245 · terme « fonction-lineaire »  
  « fonction linéaire » is a target concept of this lesson but its first appearance is q.explain (module 1, étape 4); it is only taught later at apps/web/src/lessons/college/3e/donnees_probabilites/fonctions-lineaires-3e/modules/Module01PrixAuKilo.jsx:322
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/fonctions-lineaires-3e/modules/Module00Diagnostic.jsx:39 · terme « antecedent »  
  « antécédent » first appears at diag.explain (module 0) and is never established in a teaching position in this lesson
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/fonctions-lineaires-3e/modules/Module01PrixAuKilo.jsx:270 · terme « appartient »  
  « symbole ∈ » first appears at q.explain (module 1, étape 5) and is never established in a teaching position in this lesson
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/fonctions-lineaires-3e/modules/Module01PrixAuKilo.jsx:312 · terme « fonction-affine »  
  « fonction affine » first appears at q.explain (module 1, étape 6) and is never established in a teaching position in this lesson
- **LOW** `L_DISTRACTOR_ONLY` — apps/web/src/lessons/college/3e/donnees_probabilites/fonctions-lineaires-3e/modules/Module02Coefficient.jsx:166 · terme « extremum »  
  « extremum / maximum / minimum » appears only as a wrong answer, first at q.option (module 2, étape 4) — a distractor still creates a first exposure

### `3e:lecture-graphique-3e`

- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/lecture-graphique-3e/modules/Module02ImageOuAntecedent.jsx:149 · terme « antecedent »  
  « antécédent » is a target concept of this lesson but its first appearance is q.option (module 2, étape 3); it is only taught later at apps/web/src/lessons/college/3e/donnees_probabilites/lecture-graphique-3e/modules/Module02ImageOuAntecedent.jsx:182
- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/lecture-graphique-3e/modules/Module04CurseurSonde.jsx:206 · terme « intervalle »  
  « intervalle » is a target concept of this lesson but its first appearance is q.correction (module 4, étape 4); it is only taught later at apps/web/src/lessons/college/3e/donnees_probabilites/lecture-graphique-3e/modules/Module04CurseurSonde.jsx:222
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/lecture-graphique-3e/modules/Module00Diagnostic.jsx:21 · terme « notation-fx »  
  « notation f(x) » first appears at diag.prompt (module 0) and is never established in a teaching position in this lesson

### `3e:modelisation-3e`

- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/modelisation-3e/modules/Module03TableauGraphique.jsx:122 · terme « fonction-affine »  
  « fonction affine » is a target concept of this lesson but its first appearance is q.option (module 3, étape 3); it is only taught later at apps/web/src/lessons/college/3e/donnees_probabilites/modelisation-3e/modules/Module04QuelModele.jsx:134
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/modelisation-3e/modules/Module00Diagnostic.jsx:22 · terme « notation-fx »  
  « notation f(x) » first appears at diag.prompt (module 0) and is never established in a teaching position in this lesson
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/modelisation-3e/modules/Module02GrandeursRepresentations.jsx:117 · terme « extremum »  
  « extremum / maximum / minimum » first appears at q.feedback (module 2, étape 4) and is never established in a teaching position in this lesson
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/modelisation-3e/modules/Module03TableauGraphique.jsx:122 · terme « variations »  
  « variations / croissante / décroissante » first appears at q.option (module 3, étape 3) and is never established in a teaching position in this lesson
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/modelisation-3e/modules/Module05Traduire.jsx:150 · terme « antecedent »  
  « antécédent » first appears at q.explain (module 5, étape 3) and is never established in a teaching position in this lesson
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/modelisation-3e/modules/Module07GrandProjet.jsx:159 · terme « ensemble-reels »  
  « ensemble ℝ » first appears at q.option (module 7, étape 4) and is never established in a teaching position in this lesson
- **LOW** `L_DISTRACTOR_ONLY` — apps/web/src/lessons/college/3e/donnees_probabilites/modelisation-3e/modules/Module05Traduire.jsx:123 · terme « fonction-lineaire »  
  « fonction linéaire » appears only as a wrong answer, first at q.rowOption (module 5, étape 2) — a distractor still creates a first exposure

### `3e:probabilites-3e`

- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/probabilites-3e/modules/Module01LaboratoireDuDe.jsx:379 · terme « frequence »  
  « fréquence » is a target concept of this lesson but its first appearance is q.explain (module 1, étape 3); it is only taught later at apps/web/src/lessons/college/3e/donnees_probabilites/probabilites-3e/modules/Module01LaboratoireDuDe.jsx:466

### `3e:proportionnalite-3e`

- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/proportionnalite-3e/modules/Module04Agrandir.jsx:164 · terme « theoreme-thales »  
  « théorème de Thalès » is a target concept of this lesson but its first appearance is q.explain (module 4, étape 4); it is only taught later at apps/web/src/lessons/college/3e/donnees_probabilites/proportionnalite-3e/modules/Module04Agrandir.jsx:195
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/proportionnalite-3e/modules/Module07MissionFinale.jsx:71 · terme « fonction »  
  « fonction » first appears at boss.prompt (module 7) and is never established in a teaching position in this lesson
- **LOW** `L_DISTRACTOR_ONLY` — apps/web/src/lessons/college/3e/donnees_probabilites/proportionnalite-3e/modules/Module01Recette.jsx:152 · terme « extremum »  
  « extremum / maximum / minimum » appears only as a wrong answer, first at q.option (module 1, étape 4) — a distractor still creates a first exposure

### `3e:representation-graphique-3e`

- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/representation-graphique-3e/modules/Module07MissionFinale.jsx:48 · terme « fonction »  
  « fonction » is a target concept of this lesson but its first appearance is boss.prompt (module 7) and it is never taught in a teaching position
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/representation-graphique-3e/modules/Module00Diagnostic.jsx:41 · terme « notation-fx »  
  « notation f(x) » first appears at diag.prompt (module 0) and is never established in a teaching position in this lesson
- **MEDIUM** `M_TAUGHT_TOO_LATE` — apps/web/src/lessons/college/3e/donnees_probabilites/representation-graphique-3e/modules/Module05QuatreHistoires.jsx:98 · terme « variations »  
  « variations / croissante / décroissante » first appears at q.explain (module 5, étape 1), before its teaching position at apps/web/src/lessons/college/3e/donnees_probabilites/representation-graphique-3e/modules/Module05QuatreHistoires.jsx:151

### `3e:statistiques-3e`

- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/statistiques-3e/modules/Module02PointDequilibre.jsx:170 · terme « mediane-stat »  
  « médiane (statistique) » is a target concept of this lesson but its first appearance is q.explainWrong (module 2, étape 3); it is only taught later at apps/web/src/lessons/college/3e/donnees_probabilites/statistiques-3e/modules/Module03ValeurDuMilieu.jsx:85
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/statistiques-3e/modules/Module00Diagnostic.jsx:58 · terme « variations »  
  « variations / croissante / décroissante » first appears at diag.explain (module 0) and is never established in a teaching position in this lesson
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/college/3e/donnees_probabilites/statistiques-3e/modules/Module03ValeurDuMilieu.jsx:140 · terme « appartient »  
  « symbole ∈ » first appears at q.explain (module 3, étape 2) and is never established in a teaching position in this lesson
- **MEDIUM** `M_TAUGHT_IN_FEEDBACK_THEN_DEMANDED` — apps/web/src/lessons/college/3e/donnees_probabilites/statistiques-3e/modules/Module01LancerLeDe.jsx:355 · terme « frequence »  
  « fréquence » is introduced in feedback (apps/web/src/lessons/college/3e/donnees_probabilites/statistiques-3e/modules/Module01LancerLeDe.jsx:355) and then demanded before any teaching position
- **MEDIUM** `M_TAUGHT_TOO_LATE` — apps/web/src/lessons/college/3e/donnees_probabilites/statistiques-3e/modules/Module03ValeurDuMilieu.jsx:169 · terme « extremum »  
  « extremum / maximum / minimum » first appears at q.explainFor (module 3, étape 3), before its teaching position at apps/web/src/lessons/college/3e/donnees_probabilites/statistiques-3e/modules/Module05TroisIndicateurs.jsx:63

### `3e:reperage-droite-plan-3e`

- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/college/3e/espace_geometrie/reperage-droite-plan-3e/modules/Module05LongueursSansRegle.jsx:159 · terme « notation-fx »  
  « notation f(x) » first appears at q.prompt (module 5, étape 4) and is never established in a teaching position in this lesson

### `3e:representation-espace-3e`

- **MEDIUM** `M_TAUGHT_TOO_LATE` — apps/web/src/lessons/college/3e/espace_geometrie/representation-espace-3e/modules/Module04TournerPourVerifier.jsx:60 · terme « cote-oppose »  
  « côté opposé » first appears at q.explain (module 4, étape 1), before its teaching position at apps/web/src/lessons/college/3e/espace_geometrie/representation-espace-3e/modules/Module04TournerPourVerifier.jsx:66

### `3e:thales-3e`

- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/college/3e/espace_geometrie/thales-3e/modules/Module02Reconnaitre.jsx:63 · terme « theoreme-thales »  
  « théorème de Thalès » is a target concept of this lesson but its first appearance is q.explain (module 2, étape 1); it is only taught later at apps/web/src/lessons/college/3e/espace_geometrie/thales-3e/modules/Module02Reconnaitre.jsx:158
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/college/3e/espace_geometrie/thales-3e/modules/Module02Reconnaitre.jsx:64 · terme « cote-oppose »  
  « côté opposé » first appears at q.explainWrong (module 2, étape 1) and is never established in a teaching position in this lesson
- **MEDIUM** `M_TAUGHT_TOO_LATE` — apps/web/src/lessons/college/3e/espace_geometrie/thales-3e/modules/Module02Reconnaitre.jsx:56 · terme « secantes »  
  « droites sécantes » first appears at q.option (module 2, étape 1), before its teaching position at apps/web/src/lessons/college/3e/espace_geometrie/thales-3e/modules/Module02Reconnaitre.jsx:158

### `3e:translations-vecteurs-3e`

- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/college/3e/espace_geometrie/translations-vecteurs-3e/modules/Module02DirectionSensLongueur.jsx:128 · terme « vecteur »  
  « vecteur » is a target concept of this lesson but its first appearance is q.correction (module 2, étape 2); it is only taught later at apps/web/src/lessons/college/3e/espace_geometrie/translations-vecteurs-3e/modules/Module04FlecheVagabonde.jsx:70
- **MEDIUM** `M_TAUGHT_TOO_LATE` — apps/web/src/lessons/college/3e/espace_geometrie/translations-vecteurs-3e/modules/Module00Diagnostic.jsx:61 · terme « cote-oppose »  
  « côté opposé » first appears at diag.prompt (module 0), before its teaching position at apps/web/src/lessons/college/3e/espace_geometrie/translations-vecteurs-3e/modules/Module06VecteurEtTranslation.jsx:124

### `3e:triangles-3e`

- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/college/3e/espace_geometrie/triangles-3e/modules/Module00Diagnostic.jsx:59 · terme « intervalle-crochets »  
  « crochets d'intervalle » first appears at diag.explain (module 0) and is never established in a teaching position in this lesson

### `3e:trigonometrie-triangle-rectangle-3e`

- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/college/3e/espace_geometrie/trigonometrie-triangle-rectangle-3e/modules/Module02NommerLesCotes.jsx:110 · terme « cote-oppose »  
  « côté opposé » is a target concept of this lesson but its first appearance is q.correction (module 2, étape 2); it is only taught later at apps/web/src/lessons/college/3e/espace_geometrie/trigonometrie-triangle-rectangle-3e/modules/Module02NommerLesCotes.jsx:203
- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/college/3e/espace_geometrie/trigonometrie-triangle-rectangle-3e/modules/Module04TroisRapportsTroisNoms.jsx:53 · terme « tangente »  
  « tangente » is a target concept of this lesson but its first appearance is q.rowOption (module 4, étape 1); it is only taught later at apps/web/src/lessons/college/3e/espace_geometrie/trigonometrie-triangle-rectangle-3e/modules/Module04TroisRapportsTroisNoms.jsx:161
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/college/3e/espace_geometrie/trigonometrie-triangle-rectangle-3e/modules/Module03LeRapportNeDependQueDeLangle.jsx:148 · terme « fonction »  
  « fonction » first appears at q.explain (module 3, étape 3) and is never established in a teaching position in this lesson

### `3e:calcul-litteral-algebrique`

- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/college/3e/nombres_calculs/calcul-litteral-algebrique/modules/Module03Reduire.jsx:365 · terme « cote-oppose »  
  « côté opposé » first appears at q.explainWrong (module 3, étape 4) and is never established in a teaching position in this lesson

### `3e:equations-produit`

- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/college/3e/nombres_calculs/equations-produit/modules/Module01ZeroOuPas.jsx:166 · terme « cote-oppose »  
  « côté opposé » first appears at q.option (module 1, étape 2) and is never established in a teaching position in this lesson

### `seconde:fonctions-2nde`

- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/lycee/seconde/fonctions/fonctions-2nde/modules/Module02ImageAntecedentDomaine.jsx:79 · terme « intervalle »  
  « intervalle » is a target concept of this lesson but its first appearance is q.prompt (module 2, étape 3); it is only taught later at apps/web/src/lessons/lycee/seconde/fonctions/fonctions-2nde/modules/Module05QuatreRegistres.jsx:145
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/fonctions/fonctions-2nde/modules/Module02ImageAntecedentDomaine.jsx:81 · terme « intervalle-crochets »  
  « crochets d'intervalle » first appears at q.option (module 2, étape 3) and is never established in a teaching position in this lesson
- **MEDIUM** `M_TAUGHT_TOO_LATE` — apps/web/src/lessons/lycee/seconde/fonctions/fonctions-2nde/modules/Module05QuatreRegistres.jsx:52 · terme « extremum »  
  « extremum / maximum / minimum » first appears at q.correction (module 5, étape 1), before its teaching position at apps/web/src/lessons/lycee/seconde/fonctions/fonctions-2nde/modules/Module07AtelierModeliser.jsx:49

### `seconde:fonctions-de-reference-2nde`

- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/lycee/seconde/fonctions/fonctions-de-reference-2nde/modules/Module02LaParabole.jsx:80 · terme « variations »  
  « variations / croissante / décroissante » is a target concept of this lesson but its first appearance is q.rowOption (module 2, étape 4); it is only taught later at apps/web/src/lessons/lycee/seconde/fonctions/fonctions-de-reference-2nde/modules/Module03LHyperbole.jsx:76
- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/lycee/seconde/fonctions/fonctions-de-reference-2nde/modules/Module04LeV.jsx:92 · terme « extremum »  
  « extremum / maximum / minimum » is a target concept of this lesson but its first appearance is q.rowLabel (module 4, étape 4) and it is never taught in a teaching position

### `seconde:signe-fonctions-2nde`

- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/fonctions/signe-fonctions-2nde/modules/Module02LesZerosEtLeTableau.jsx:62 · terme « intervalle-crochets »  
  « crochets d'intervalle » first appears at q.correction (module 2, étape 3) and is never established in a teaching position in this lesson
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/fonctions/signe-fonctions-2nde/modules/Module02LesZerosEtLeTableau.jsx:62 · terme « appartient »  
  « symbole ∈ » first appears at q.correction (module 2, étape 3) and is never established in a teaching position in this lesson
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/fonctions/signe-fonctions-2nde/modules/Module05ResoudreAvecLeSigne.jsx:60 · terme « inclus »  
  « symbole ⊂ » first appears at q.correction (module 5, étape 4) and is never established in a teaching position in this lesson

### `seconde:variations-extremums-2nde`

- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/lycee/seconde/fonctions/variations-extremums-2nde/modules/Module01LeRandonneur.jsx:77 · terme « intervalle »  
  « intervalle » is a target concept of this lesson but its first appearance is q.explain (module 1, étape 3); it is only taught later at apps/web/src/lessons/lycee/seconde/fonctions/variations-extremums-2nde/modules/Module02CroissanteDecroissante.jsx:78
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/fonctions/variations-extremums-2nde/modules/Module03LeTableauDeVariations.jsx:55 · terme « appartient »  
  « symbole ∈ » first appears at q.correction (module 3, étape 2) and is never established in a teaching position in this lesson
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/fonctions/variations-extremums-2nde/modules/Module05ComparerSansCalculer.jsx:48 · terme « inclus »  
  « symbole ⊂ » first appears at q.correction (module 5, étape 3) and is never established in a teaching position in this lesson

### `seconde:colinearite-alignement-2nde`

- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/geometrie/colinearite-alignement-2nde/modules/Module03Proportionnelles.jsx:125 · terme « valeur-absolue »  
  « valeur absolue » first appears at q.explainFor (module 3, étape 3) and is never established in a teaching position in this lesson

### `seconde:equations-de-droites-2nde`

- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/lycee/seconde/geometrie/equations-de-droites-2nde/modules/Module00Diagnostic.jsx:41 · terme « colineaire »  
  « colinéaire » is a target concept of this lesson but its first appearance is diag.prompt (module 0); it is only taught later at apps/web/src/lessons/lycee/seconde/geometrie/equations-de-droites-2nde/modules/Module01LaboratoireDesDroites.jsx:88

### `seconde:positions-relatives-droites-2nde`

- **MEDIUM** `M_TAUGHT_TOO_LATE` — apps/web/src/lessons/lycee/seconde/geometrie/positions-relatives-droites-2nde/modules/Module00Diagnostic.jsx:56 · terme « colineaire »  
  « colinéaire » first appears at diag.option (module 0), before its teaching position at apps/web/src/lessons/lycee/seconde/geometrie/positions-relatives-droites-2nde/modules/Module02LaDirection.jsx:96

### `seconde:calcul-litteral-2nde`

- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/lycee/seconde/nombres_calculs/calcul-litteral-2nde/modules/Module05TroisFormes.jsx:43 · terme « extremum »  
  « extremum / maximum / minimum » is a target concept of this lesson but its first appearance is q.explain (module 5, étape 3); it is only taught later at apps/web/src/lessons/lycee/seconde/nombres_calculs/calcul-litteral-2nde/modules/Module05TroisFormes.jsx:51
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/nombres_calculs/calcul-litteral-2nde/modules/Module03Developper.jsx:64 · terme « appartient »  
  « symbole ∈ » first appears at q.explainWrong (module 3, étape 2) and is never established in a teaching position in this lesson

### `seconde:equations-et-inequations-2nde`

- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/nombres_calculs/equations-et-inequations-2nde/modules/Module00Diagnostic.jsx:13 · terme « intervalle-crochets »  
  « crochets d'intervalle » first appears at diag.option (module 0) and is never established in a teaching position in this lesson
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/nombres_calculs/equations-et-inequations-2nde/modules/Module01ScannerDeSolutions.jsx:70 · terme « inclus »  
  « symbole ⊂ » first appears at q.explain (module 1, étape 2) and is never established in a teaching position in this lesson
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/nombres_calculs/equations-et-inequations-2nde/modules/Module06Modeliser.jsx:46 · terme « appartient »  
  « symbole ∈ » first appears at q.option (module 6, étape 2) and is never established in a teaching position in this lesson
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/nombres_calculs/equations-et-inequations-2nde/modules/Module06Modeliser.jsx:48 · terme « extremum »  
  « extremum / maximum / minimum » first appears at q.explainWrong (module 6, étape 2) and is never established in a teaching position in this lesson

### `seconde:logique-et-raisonnement-2nde`

- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/nombres_calculs/logique-et-raisonnement-2nde/modules/Module00Diagnostic.jsx:9 · terme « appartient »  
  « symbole ∈ » first appears at diag.option (module 0) and is never established in a teaching position in this lesson

### `seconde:nombres-reels-2nde`

- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/nombres_calculs/nombres-reels-2nde/modules/Module02FamillesDeNombres.jsx:84 · terme « appartient »  
  « symbole ∈ » first appears at q.correction (module 2, étape 2) and is never established in a teaching position in this lesson
- **MEDIUM** `M_TAUGHT_TOO_LATE` — apps/web/src/lessons/lycee/seconde/nombres_calculs/nombres-reels-2nde/modules/Module00Diagnostic.jsx:26 · terme « variations »  
  « variations / croissante / décroissante » first appears at diag.prompt (module 0), before its teaching position at apps/web/src/lessons/lycee/seconde/nombres_calculs/nombres-reels-2nde/modules/Module05EncadrerEtComparer.jsx:78
- **LOW** `L_DISTRACTOR_ONLY` — apps/web/src/lessons/lycee/seconde/nombres_calculs/nombres-reels-2nde/modules/Module06MissionFinale.jsx:43 · terme « ensemble-reels »  
  « ensemble ℝ » appears only as a wrong answer, first at boss.option (module 6) — a distractor still creates a first exposure

### `seconde:valeur-absolue-distance-2nde`

- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/lycee/seconde/nombres_calculs/valeur-absolue-distance-2nde/modules/Module00Diagnostic.jsx:19 · terme « appartient »  
  « symbole ∈ » is a target concept of this lesson but its first appearance is diag.prompt (module 0) and it is never taught in a teaching position
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/nombres_calculs/valeur-absolue-distance-2nde/modules/Module00Diagnostic.jsx:20 · terme « intervalle-crochets »  
  « crochets d'intervalle » first appears at diag.explain (module 0) and is never established in a teaching position in this lesson

### `seconde:loi-grands-nombres-2nde`

- **LOW** `L_DISTRACTOR_ONLY` — apps/web/src/lessons/lycee/seconde/statistiques_probabilites/loi-grands-nombres-2nde/modules/Module06MissionFinaleLeGrandNombre.jsx:17 · terme « variations »  
  « variations / croissante / décroissante » appears only as a wrong answer, first at boss.option (module 6) — a distractor still creates a first exposure

### `seconde:probabilites-conditionnelles-2nde`

- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/lycee/seconde/statistiques_probabilites/probabilites-conditionnelles-2nde/modules/Module02LaNotationSachantQue.jsx:77 · terme « frequence-conditionnelle »  
  « fréquence conditionnelle » is a target concept of this lesson but its first appearance is q.explainFor (module 2, étape 2); it is only taught later at apps/web/src/lessons/lycee/seconde/statistiques_probabilites/probabilites-conditionnelles-2nde/modules/Module02LaNotationSachantQue.jsx:87

### `seconde:series-regroupees-classes-2nde`

- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/statistiques_probabilites/series-regroupees-classes-2nde/modules/Module03LesFrequencesCumulees.jsx:127 · terme « extremum »  
  « extremum / maximum / minimum » first appears at q.correction (module 3, étape 3) and is never established in a teaching position in this lesson

### `seconde:statistiques-une-variable-2nde`

- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/statistiques_probabilites/statistiques-une-variable-2nde/modules/Module03LesQuartiles.jsx:109 · terme « extremum »  
  « extremum / maximum / minimum » first appears at q.correction (module 3, étape 4) and is never established in a teaching position in this lesson
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/statistiques_probabilites/statistiques-une-variable-2nde/modules/Module07MissionFinaleResumerUneSerie.jsx:18 · terme « appartient »  
  « symbole ∈ » first appears at boss.explain (module 7) and is never established in a teaching position in this lesson


## Hors périmètre — 6e et 4e (relevé, non réparé)

Ces niveaux ne sont pas traités par le chantier en cours. Les constats sont enregistrés ici pour
mémoire ; **aucune leçon 6e/4e ne doit être modifiée**.

25 leçon(s) · critiques 1 · hautes 19 · moyennes 5 · basses 0

| Leçon | Carte | Bricks | requires | Contrat | C | H | M | L |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `4e:racines-carrees-4e` | — | 0 | 0/0 | 0 | 0 | 0 | 0 | 0 |
| `6e:algorithmique-programmation` | — | 0 | 0/21 | 0 | 0 | 2 | 0 | 0 |
| `6e:graphiques` | — | 0 | 0/31 | 0 | 0 | 0 | 1 | 0 |
| `6e:proportionnalite` | — | 0 | 0/31 | 0 | 0 | 0 | 0 | 0 |
| `6e:tableaux` | — | 0 | 0/34 | 0 | 0 | 0 | 0 | 0 |
| `6e:constructions-geometriques` | — | 0 | 0/28 | 0 | 0 | 2 | 1 | 0 |
| `6e:droites-segments` | — | 0 | 0/26 | 0 | 0 | 0 | 0 | 0 |
| `6e:figures-planes` | — | 0 | 0/27 | 0 | 0 | 1 | 0 | 0 |
| `6e:parallelisme-perpendicularite` | — | 0 | 0/29 | 0 | 0 | 0 | 0 | 0 |
| `6e:reperage-plan` | — | 0 | 0/27 | 0 | 0 | 3 | 0 | 0 |
| `6e:solides-patrons` | — | 0 | 0/26 | 0 | 0 | 3 | 0 | 0 |
| `6e:symetrie` | — | 0 | 0/26 | 0 | 1 | 2 | 2 | 0 |
| `6e:aires` | — | 0 | 0/31 | 0 | 0 | 0 | 1 | 0 |
| `6e:angles` | — | 0 | 0/26 | 0 | 0 | 0 | 0 | 0 |
| `6e:contenances` | — | 0 | 0/20 | 0 | 0 | 0 | 0 | 0 |
| `6e:durees` | — | 0 | 0/35 | 0 | 0 | 0 | 0 | 0 |
| `6e:longueurs` | — | 0 | 0/26 | 0 | 0 | 2 | 0 | 0 |
| `6e:masses` | — | 0 | 0/25 | 0 | 0 | 1 | 0 | 0 |
| `6e:perimetres` | — | 0 | 0/33 | 0 | 0 | 0 | 0 | 0 |
| `6e:fractions` | — | 0 | 0/23 | 0 | 0 | 1 | 0 | 0 |
| `6e:nombres-decimaux` | — | 0 | 0/29 | 0 | 0 | 0 | 0 | 0 |
| `6e:nombres-entiers` | — | 0 | 0/32 | 0 | 0 | 0 | 0 | 0 |
| `6e:ordre-grandeur-estimation` | — | 0 | 0/28 | 0 | 0 | 0 | 0 | 0 |
| `6e:quatre-operations` | — | 0 | 0/22 | 0 | 0 | 1 | 0 | 0 |
| `6e:resolution-problemes` | — | 0 | 0/26 | 0 | 0 | 1 | 0 | 0 |
