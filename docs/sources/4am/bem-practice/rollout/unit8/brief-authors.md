# Brief — unité 8 « الإحصاء » au format BEM (2026-10-08)

Une leçon à la fois, dans l'ordre de `content/practice/active.json` : `takrar-mujamma` → `mada-wasit-mutawassit` →
`majdulat-ihsaiya` → `qiraat-wadiyat-ihsaiya` → `wadiya-idmajiya-ihsa`. Toutes les règles des briefs précédents
s'appliquent : `../unit2/brief-authors.md` §1–§7, `../unit1/brief-authors.md` §5 (contrôles sans vitest) et §7
(couverture), `../unit3/brief-authors.md` (saisie), `../unit5/brief-authors.md` (formules courtes séparées pour
360 px), `../unit6/brief-authors.md` (graphiques : tracer sans valeur = `selfCheck` ; lecture = valeur sur un nœud du
quadrillage, figure en `statement.figure` ; `statement.visual` est refusé sur une feuille d'examen). Contrat :
`docs/architecture/EXERCISE_CONTRACT.md` § « Présentation examen (BEM) » et § « One step split into several
questions ». RÉÉCRIS l'oracle `scripts/practice-oracle/<leçon>.mjs` de ta leçon.

## Annales

**Aucune leçon de l'unité 8 ne possède de sujet officiel** : la statistique n'apparaît dans aucun BEM 2007–2025
(index `../../annals-index.md`). Donc pas de badge « BEM <année> », seulement « على منوال BEM <année> » (au moins 15,
`kind: modelled`) + adapted. Décision du propriétaire (2026-10-06) : le libellé « على منوال BEM <année> » est GARDÉ
même quand seule la FORME du sujet nommé est reprise (en-tête, points, étapes 01/02/03, tableau « انقل وأكمل »,
الجزء الثاني en situation). Nomme une session dont tu reprends réellement la forme, varie les années. Modèles de
forme (jamais leurs nombres ni leur contexte mot pour mot) :
- tableau à compléter dans un الجزء الثاني : 2007 II, 2012 II, 2014 II, 2024 المسألة ;
- pourcentages / taux dans une situation : 2016 II II-02 (impôt 20 %), 2023 II 02 (frais 20 %, bénéfice) ;
- exercice du الجزء الأول en 2–3 étapes (03 / 02,5 ن) : n'importe quelle session, en reprenant son découpage.

## Règles propres à la statistique

- **Tableaux** : une série « القيمة / التكرار » passe par `statement.table` (`head` + `rows`, cases « … » à compléter),
  jamais par un `\begin{array}` KaTeX dans `content` (les feuilles actuelles en ont : convertis-les). « انقل وأكمل
  الجدول » = une question par case demandée (même `step`, `sub` différents).
- **Diagrammes** (أعمدة، مدرّج تكراري، مضلّع، دائري / نصف دائري) : DESSINÉS en `statement.figure` avec `kind: 'chart'`
  (StatChart, `apps/web/src/lessons/common/components/statChart.js`, contrat EXERCISE_CONTRACT « Statistical charts »). Chaque
  valeur non écrite tombe sur une ligne du quadrillage (le validateur refuse sinon) ; `missing` = la barre / le secteur à compléter.
  « مثّل بمخطط » sans valeur = `selfCheck` ; l'angle d'un secteur à calculer = valeur à saisir (`show: 'none'` ou `missing`).
- **Formules de tableur** (`majdulat-ihsaiya`) : code LTR (`<code dir="ltr">` / LRI…PDI dans les chaînes), JAMAIS en
  KaTeX (`docs/architecture/ARABIC_RTL_CONTRACT.md`). Écrire une formule = `choice` entre formules plausibles (chaque
  distracteur porteur d'une misconception) ou `selfCheck` ; pas de nouveau type de réponse.
- **Nombres** : virgule maison dans les énoncés (« 12,5 ») ; les deux séparateurs sont acceptés à la saisie. Une
  moyenne non entière : demande l'arrondi explicitement (« مدورا إلى 0,1 ») ou une fraction exacte. Médiane d'un
  effectif pair = demi-somme des deux valeurs centrales (dis lesquelles dans la solution).
- **Comptage** : retrouver une valeur ou un effectif manquant à partir d'une moyenne donnée COMPTE pour la leçon
  (c'est la définition de la moyenne) ; une étape purement algébrique ou d'une autre unité est `counted:false`
  (pourcentages et proportionnalité → unité 6, fractions → unité 1, équations hors stat → unité 4).
- **Niveau 5** : 10 NOUVELLES « الوضعية الإدماجية (08 ن) », situations algériennes sobres (notes d'une classe,
  températures d'une wilaya, consommation, tailles…), 2 à 4 étapes enchaînées. Les « مسائل » de la leçon restent des
  modules de la leçon : n'y touche pas, n'en recopie pas les situations.

## Fichiers et contrôle

Tu n'écris QUE tes 50 fichiers (ids conservés) et ton oracle. N'ajoute PAS ta leçon à `exam-style.json` (bascule par
le lead). Contrôles : ceux de `../unit2/brief-authors.md` §6 (`--strict` + oracle filtré sur ta leçon) et
`node scripts/check-textbook-coverage.mjs` (0 ✗ ; une copie adaptée garde `adaptedFrom`). Un seul oracle à la fois :
lancé en parallèle, le test bloque le CPU. Rapport : §7 du brief unité 2.

## Précédent fixé par `takrar-mujamma` (basculée 2026-10-08, e2e élève 112/112) — à suivre pour la cohérence

- Leçon de référence de l'unité : `content/practice/4am/takrar-mujamma/` + `scripts/practice-oracle/takrar-mujamma.mjs`.
- Diagrammes (demande du propriétaire, 2026-10-08) : DESSINÉS avec StatChart (`kind: 'chart'`), jamais « نُقلت … إلى الجدول ».
  Les 5 feuilles de `takrar-mujamma` issues d'un diagramme du manuel ont été redessinées (l1-004 أعمدة، l1-009 et l3-004 دائري،
  l4-001 et l4-003 مدرّج) : tout élément du manuel qui MONTRE un diagramme le montre aussi sur la feuille.
- Séries larges : tableau VERTICAL (une ligne par valeur / classe) pour tenir à 360 px.
- Grilles de tableur (`majdulat-ihsaiya`, 2026-10-08) : `statement.table` avec `sheet: true` (lecture de gauche à droite, colonne A à
  gauche). Une seule tâche ☜ qui mêle compétence et argent : deux questions de la même étape (compétence comptée, argent `counted:false`).
