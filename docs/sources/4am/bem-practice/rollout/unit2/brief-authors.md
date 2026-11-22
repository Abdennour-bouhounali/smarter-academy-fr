# Brief — unité 2 « الحساب على الجذور » au format BEM (pilote du déploiement, 2026-10-06)

Le propriétaire a approuvé l'extension de la feuille d'examen BEM (prototype `bahth-pgcd`) à toutes les
leçons, unité par unité ; l'unité 2 est le PILOTE. Ce brief complète le brief commun
`docs/sources/4am/bem-practice/brief-authors.md` (format, registre, contrôle) — lis-le EN ENTIER d'abord,
puis l'exemple de référence `content/practice/4am/bahth-pgcd/level-3/ex-4am-bahth-pgcd-l3-004.json` et
le contrat `docs/architecture/EXERCISE_CONTRACT.md` § « Présentation examen (BEM) » et § « Two zones on a
step that asks for working ». L'attribution des annales vient de `../../annals-index.md`.

## 1. Décisions du propriétaire (2026-10-06) — non négociables

1. **Banque remplacée EN PLACE, identifiants conservés.** Tu réécris les 50 fichiers existants
   `content/practice/4am/<leçon>/level-N/ex-4am-<leçon>-lN-NNN.json` (N = 1…5, NNN = 001…010). Aucun fichier
   créé ni supprimé, aucun id changé. Un exercice existant réécrit au format examen devient `kind: adapted`
   (source d'origine inchangée + `"adaptedFrom": "<son id>"` si tu changes ses nombres).
2. **Composition des 50** : les exercices OFFICIELS que l'index attribue à ta leçon (§3) — « BEM <année> »,
   texte MOT POUR MOT, mêmes points, corrigé = le corrigé OFFICIEL ; au moins 15 « على منوال BEM <année> »
   (nouveaux, dans le style de la session nommée, badge « على منوال BEM <année> », `kind: modelled`,
   source `platform_addition` / `bem_modelled`) ; le reste `adapted` (les exercices actuels de la banque,
   remis au format sujet : verbes à l'impératif, étapes 01/02/03, `solution`). Jamais d'année inventée :
   le badge « BEM <année> » n'existe que pour un sujet réel de l'index.
3. **Étapes hors leçon** (compétence d'une autre leçon ou d'une année antérieure : calcul fractionnaire,
   écriture scientifique, PGCD…) : gardées telles qu'imprimées, `"counted": false`, étiquetées avec un LP
   de TA leçon (règle du validateur).
4. **Niveau 5 = 10 NOUVELLES « الوضعية الإدماجية »** : `heading: "الوضعية الإدماجية"`, `points: "08"`, une
   situation réelle (algérienne, sobre, style الجزء الثاني du sujet), 2 à 4 étapes enchaînées ; une étape
   finale peut être UNE tâche « ☜ » comme BEM 2020. Ce ne sont PAS les « مسائل » de la leçon : elles restent
   des modules de la leçon, n'y touche pas, et n'en recopie pas les situations.
5. **Une coquille du sujet officiel** (ou un corrigé officiel qui contredit ton recalcul) : tu ne corriges
   PAS en silence. Tu gardes le texte officiel tel quel si le calcul tient ; sinon tu NE publies PAS cet
   exercice comme official (remplace-le par un adapted) et tu le SIGNALES dans ton rapport final
   (année, exercice, ce qui est imprimé, ce que donne le calcul, ce que dit le corrigé).

## 2. Répartition des niveaux (10 par niveau)

| Niveau | Contenu |
|---|---|
| 1 | une ou deux étapes, application directe (points « 02 ») ; adapted surtout |
| 2 | deux étapes enchaînées ; officiels courts ou extraits ; modelled |
| 3 | sujets complets du الجزء الأول (« 03 »، « 02,5 ») ; officiels |
| 4 | sujets complets plus longs, mélange de compétences, `counted:false` pour le hors-leçon |
| 5 | 10 « الوضعية الإدماجية (08 ن) » nouvelles (§1.4) |

Le `heading` d'un exercice du الجزء الأول est celui du sujet (« التمرين الأول »، « التمرين الثاني »…) pour
un official ; « التمرين » pour adapted / modelled. `points` comme le sujet.

## 3. Attribution des annales par leçon (index, citées UNE fois)

Pages : PDF des sujets `docs/official-BREVET-exams/حوليات شهادة التعليم المتوسط سابقة من 2007الى 2025.pdf`
(page + colonne, R = droite) ; corrigés : le fichier « … .pdf حلول » (sans extension .pdf : ne JAMAIS faire
`git add` d'aucun des deux). Rendu : `pdftoppm -r 150 -png -f <p> -l <p> "<fichier>" <ton dossier temporaire>/x`,
puis LIS l'image (couche texte illisible). Lis la page du corrigé de chaque official AVANT d'écrire son
`solution`, et recopie les étapes du corrigé officiel (style du livret).

| Leçon | Officials à citer (session · exercice · ن · page sujet · pages corrigé) |
|---|---|
| `tawzif-khawass-judhur` | 2007 I-1 (03) 1R · 1–4 ; 2009 I-1 (03) 1L · 8–11 ; 2011 I-2 (03) 2R→2L · 14–16 ; 2014 I-1 (03) 3L · 25–28 ; 2017 I-1 (03) 4L · 36–39 ; 2019 I-1 (02,5) 5R · 44–47 ; 2020 I-1 (02) 5L · 48–49 ; 2023 I-1 (03) 6L · 55–57 |
| `amaliyat-judhur` | 2013 I-1 (03) 3R · 21–24 ; 2018 I-1 (03) 5R · 40–43 |
| `wadiya-idmajiya-judhur` | 2012 I-1 (03) 2L · 17–20 ; 2022 I-1 (03) 6R · 53–54 |
| `jidhr-tarbii` | aucun — modelled sur les étapes « √(a²) »، « (√a)² » des sujets ci-dessus |
| `natiqa-ghayr-natiqa` | aucun — modelled sur « بيّن أن A × B عدد طبيعي / ناطق » (2009 I-1 02, 2012 I-1 02, 2013 I-1 02, 2022 I-1 03) |
| `muadalat-x-murabba` | aucun — modelled sur 2008 II 01 (أرض 2400m² عرضها ثلثا طولها), 2015 II ☜ (1000m² عرضها خمسا طولها), 2017 II I-01 (مربعة 324m²), 2021 I-1 03 (x/(4+√7) = (4−√7)/x) |

Ces exercices sont la propriété d'AUTRES leçons : ne les cite pas en official (modelled seulement) :
2008 I-2 (racines + littéral → tahlil-ibara), 2015 I-2, 2025 I-1, 2021 I-1 (bahth-pgcd), 2016 I-1 (bahth-pgcd).

### Textes officiels transcrits (à vérifier sur l'image ; réponses recalculées par le lead — RE-CALCULE-les)

- **BEM 2007 — التمرين الأول:(03 ن)** « ليكن العددان A و B حيث: » `A = \sqrt{98} + 3\sqrt{32} - \sqrt{128}` ،
  `B = \dfrac{3}{2} + \dfrac{5}{4} \times \dfrac{2}{3}`.
  01 اكتب العدد A على الشكل $a\sqrt{2}$ حيث $a$ عدد طبيعي. → 11
  02 بسّط العدد B ثم بيّن أن: $\dfrac{A^2}{33} - 3B = \dfrac{1}{3}$ . → B = 7/3 (counted:false) puis selfCheck
- **BEM 2009 — التمرين الأول:(03 ن)** « لتكن الأعداد C ، B ، A حيث: » `A = \sqrt{80}` ، `B = 2\sqrt{45}` ، `C = \sqrt{5} + 1`.
  01 اكتب A + B على الشكل $a\sqrt{5}$ حيث $a$ عدد طبيعي. → 10
  02 بيّن أن A × B هو عدد طبيعي. → 120 (fais saisir la valeur, ou selfCheck)
  03 اكتب $\dfrac{C^2}{\sqrt{5}}$ على شكل نسبة مقامها عدد ناطق. → (6√5 + 10)/5
- **BEM 2011 — التمرين الثاني:(03 ن)** 01 اكتب المجموع A على الشكل $a\sqrt{5}$ (مع $a$ عدد طبيعي) حيث:
  `A = \sqrt{125} + \sqrt{45} - \sqrt{20}` . → 6 ; 02 احسب الجداء $A \times \dfrac{\sqrt{5}}{30}$ مبينا مراحل الحساب. → 1
- **BEM 2012 — التمرين الأول:(03 ن)** « ليكن العددان الحقيقيان m و n حيث: » `m = \sqrt{112} - 3\sqrt{28} + 3\sqrt{7} - \sqrt{25}` و
  `n = (\sqrt{7} + 3)(4 - \sqrt{7})`. 01 اكتب كلا من العددين m و n على الشكل $a\sqrt{7} + b$ حيث a و b عددان نسبيان.
  → m = √7 − 5 ; n = √7 + 5. 02 بين أن الجداء m × n عدد ناطق. → −18. 03 اجعل مقام النسبة $\dfrac{\sqrt{7} - 5}{\sqrt{7}}$ عددا ناطقا. → (7 − 5√7)/7
- **BEM 2013 — التمرين الأول:(03 ن)** « ليكن العدد الحقيقي A حيث: » `A = \sqrt{3}(\sqrt{3} - 1) + \sqrt{27} + 1`.
  01 بين أن: $A = 4 + 2\sqrt{3}$ . 02 ليكن العدد الحقيقي B حيث: $B = 4 - 2\sqrt{3}$ . بين أن A × B عدد طبيعي. → 4
- **BEM 2014 — التمرين الأول:(03 ن)** « إليك الأعداد C ، B ، A حيث: » `A = \dfrac{3}{5} + \dfrac{2}{5} \times \dfrac{7}{4}` ،
  `B = \dfrac{1{,}2 \times 10^{-2} \times 7}{12{,}5 \times 10^{3}}` ، `C = \sqrt{175} - \sqrt{112} + 6\sqrt{7}`.
  01 احسب A ثم اكتبه على الشكل العشري. → 1,3 (counted:false) 02 أعط الكتابة العلمية للعدد B. → 6,72 × 10⁻⁶ (counted:false)
  03 اكتب C على أبسط شكل ممكن. → 7√7
- **BEM 2017 — التمرين الأول:(03 ن)** « A و B عددان حقيقيان حيث: » `A = \sqrt{108} - \sqrt{12}` ، `B = \dfrac{3}{2\sqrt{3}}`.
  01 اكتب العدد A على الشكل $a\sqrt{3}$ حيث $a$ عدد طبيعي. → 4 ; 02 اكتب العدد B على شكل نسبة مقامها عدد ناطق. → √3/2 ;
  03 بين أن C هو عدد طبيعي حيث: $C = (A + 1)(8B - 1)$ . → 47
- **BEM 2018 — التمرين الأول:(03 ن)** « A و B عددان حيث: » `A = 3\sqrt{8} \times \sqrt{2}` و `B = 2\sqrt{27} - 2\sqrt{3} + \sqrt{12}`.
  01 بيّن أن A عدد طبيعي. → 12 ; 02 اكتب العدد B على الشكل $a\sqrt{3}$ حيث $a$ عدد طبيعي. → 6 ; 03 بيّن أن: $\dfrac{A}{B} = \dfrac{2\sqrt{3}}{3}$ .
- **BEM 2019 — التمرين الأول:(02,5 ن)** « ليكن العددان الحقيقيان A و B حيث: » `A = \dfrac{9}{7} \times \left(\dfrac{10}{3} - 1\right)` و
  `B = 5\sqrt{3} + 3\sqrt{12} - \sqrt{48}`. 01 بيّن أن A عدد طبيعي. → 3 (counted:false) ; 02 اكتب العدد B على الشكل $a\sqrt{3}$ حيث $a$ عدد طبيعي. → 7 ;
  03 اكتب $\dfrac{A}{B}$ على شكل نسبة مقامها عدد ناطق. → √3/7
- **BEM 2020 — التمرين الأول:(02 ن)** « إليك العددين A و B حيث: » `A = \dfrac{2}{3} + \dfrac{7}{3} \times \dfrac{5}{14}` و
  `B = 2\sqrt{112} - 3\sqrt{28} + \sqrt{7}`. 01 اكتب A على شكل كسر غير قابل للاختزال. → 3/2 (counted:false) ;
  02 اكتب B على الشكل $a\sqrt{7}$ حيث $a$ عدد صحيح. → 3
- **BEM 2022 — التمرين الأول:(03 ن)** « A و B عددان حيث: » `A = \sqrt{80} + 2\sqrt{125} - 3\sqrt{20}` و `B = \dfrac{2 + \sqrt{2}}{\sqrt{2}}`.
  01 اكتب العدد A على الشكل $a\sqrt{5}$ حيث $a$ عدد طبيعي. → 8 ; 02 اكتب العدد B على شكل نسبة مقامها عدد ناطق. → √2 + 1 ;
  03 بيّن أن $B \times (\sqrt{2} - 1)$ عدد طبيعي. → 1
- **BEM 2023 — التمرين الأول:(03 نقاط)** « لتكن الأعداد C ، B ، A حيث: » `A = \dfrac{756}{216}` ، `B = \sqrt{117} + 3\sqrt{52} - \sqrt{637}` ،
  `C = \dfrac{3\sqrt{13}}{\sqrt{3}}`. 01 اكتب العدد A على شكل كسر غير قابل للاختزال. → 7/2 (counted:false) ;
  02 بين أن العدد B يكتب على الشكل $a\sqrt{3}$ حيث: $a$ عدد طبيعي. ⚠ le calcul donne B = 2√13 (a√13) : coquille
  probable du sujet ou du livret → vérifie le corrigé officiel (pages 55–57) et applique §1.5 ; 03 تحقق أن: $B \times C = 26\sqrt{3}$ .

## 4. Types de réponse dans cette unité

- Une valeur `a` de « $a\sqrt{b}$ » ou « $a\sqrt{7} + b$ » : `rational`, `answerFormat` qui dit QUOI saisir
  (« اكتب العدد $a$ فقط »), une question par inconnue si besoin (même `step`, même `sub` ou `sub` différents).
- Une nombre à racine au dénominateur rendu rationnel (« نسبة مقامها عدد ناطق ») : si l'évaluateur rationnel ne
  peut pas juger la forme, fais saisir les entiers (« اكتب العدد على الشكل $\dfrac{a\sqrt{b}}{c}$ ثم أعط $a$ »…), sinon
  `selfCheck` avec le corrigé. Ne crée PAS de nouveau type de réponse.
- « بيّن أن … » : `selfCheck` QUAND il n'y a pas de valeur à saisir ; « بيّن أن A × B عدد طبيعي » a une valeur → fais-la saisir.
- `work: "required"` (« مع كتابة مراحل الحساب » / « مبينا مراحل الحساب ») quand le sujet demande les étapes ;
  `"optional"` ailleurs si utile. Voir § « Two zones on a step that asks for working ».
- `timeSeconds` par étape (le prototype : 120–480 s selon l'étape).

## 5. Exactitude et oracle

Chaque réponse (officielle comprise) est RECALCULÉE dans `scripts/practice-oracle/<ta-leçon>.mjs` (stub déjà
créé, déjà branché dans `scripts/practice-answer-oracle.test.mjs`) : une entrée `'<id>:<qid>': R(...)` ou
`C('A')` par question non selfCheck, calculée à partir des nombres de l'énoncé (pour les racines : écris
un petit calcul `{rat, coefficient de √b}` exact, jamais `Math.sqrt` arrondi pour une valeur exacte). Le fichier
est À TOI seul ; ne modifie pas le fichier de test commun (les anciennes entrées en ligne de l'unité 2 y restent
jusqu'à l'audit du lead ; tes clés les remplacent).

## 6. Fichiers partagés et contrôle

- Tu n'écris QUE : tes 50 fichiers JSON et ton fichier d'oracle. Si tu dois toucher
  `content/practice/misconceptions.json` (réutilise d'abord : `MISC-…` existants de l'unité 2), passe par
  `python3 docs/sources/4am/bem-practice/rollout/unit2/locked_edit.py json-set …` (verrou global).
- N'ajoute PAS ta leçon à `content/practice/exam-style.json` : la bascule est faite par le lead après l'audit.
- Contrôle :
  ```bash
  node scripts/validate-exercises.mjs --strict 2>&1 | grep -E "<ta-leçon>|Validation"
  npx vitest run scripts/practice-answer-oracle.test.mjs -t "<ta-leçon>" 2>&1 | tail -5
  ```
  `--strict` n'écrit rien. Ignore SEULEMENT « index.generated.json … périmé ». Toute autre erreur sur tes
  fichiers se corrige. Pas de renvoi « المقابل » / « الشكل » sans figure dans l'exercice (`statement.figure`).
- Ne lance ni build, ni serveur, ni commit.

## 7. Rapport final (dans ton dernier message)

Fichiers réécrits (50), composition (official / modelled / adapted / وضعيات), années utilisées (exercice par
exercice, pour le registre « rien deux fois »), résultat des deux commandes, coquilles et désaccords
oracle ↔ corrigé officiel (§1.5).
