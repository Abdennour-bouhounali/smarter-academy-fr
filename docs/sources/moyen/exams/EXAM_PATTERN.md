# Examens trimestriels 1AM–3AM : index du corpus et analyse du modèle

Construit le 2026-10-13. Le corpus est `docs/Exames-1 AM to 3AM/{1am,2am,3am}/SEMESTER {1,2,3}/`, plus `2am/2AM.pdf`. Il compte
**186 PDF**, presque tous issus d'eddirasa.com. Les données lisibles par machine sont dans `exams-index.json` (même dossier) :
une entrée par fichier, puis `coverage` et `coverageOwnGrade`. Les ids des items viennent de
`packages/core/curriculum/dz/net/official_programme_moyen.json`. Ce corpus joue pour 1AM–3AM le rôle que les annales BEM jouent
pour 4AM (précédent : `docs/sources/4am/bem-practice/annals-index.md` et `docs/architecture/EXERCISE_CONTRACT.md`
§ « Présentation examen (BEM) »).

**Méthode.** Le texte a été extrait avec `pdftotext -layout`, puis normalisé (NFKC, marques RTL retirées). Ce texte a des
défauts connus : les ligatures lam-alif sont inversées (« األول » pour « الأول »), les fractions sont éclatées sur plusieurs
lignes et, dans certains fichiers, les chiffres sont substitués.

Avant la consigne du propriétaire (« texte inutilisable → ignoré, pas d'OCR »), un échantillon de 38 fichiers sans texte a été
rendu (`pdftoppm -r 70`) et lu. Après la consigne, aucun autre fichier n'a été rendu. Tout fichier sans texte et non échantillonné
a `exercises: null`.

## 1. Le corpus en chiffres

| | 1AM | 2AM | 3AM | Total |
|---|---|---|---|---|
| Fichiers | 50 | 81 | 55 | **186** |
| Copies (`duplicateOf`) | 3 | 1 | 6 | 10 |
| Fichiers où le corrigé est réellement présent (`hasCorrection`) | — | — | — | 40 distincts (20 seulement ont « مع التصحيح » dans le nom) |
| Fichiers avec exercices indexés (hors copies) | 27 | 51 | 30 | 108 |

Couche texte des 176 fichiers distincts : **51 `good`**, **38 `poor`** (mojibake, arabe sans maths, maths sans arabe, une seule
page en texte) et **87 `none`** (scans).

Au total, **504 exercices distincts** sont indexés, dont **97 situations d'intégration**. Ce décompte exclut les copies et le
livre commercial.

Exercices indexés par niveau réel (`gradeInFile`) et par trimestre, comptés en fichiers :

| | S1 | S2 | S3 |
|---|---|---|---|
| 1AM | 11 | 9 | 7 |
| 2AM | 19 | 14 | 17 |
| 3AM | 12 | 12 | 6 |

**Fichiers à part :**
- **`2am/2AM.pdf`** (115 p.) n'est pas un examen. C'est un livre commercial scanné, « 250 تمرين في الرياضيات – 2 متوسط » (Dar El
  Maarifa). Il ne sert qu'à l'analyse du modèle, est exclu de `coverage` et ne doit jamais être recopié.
- **Livrets de modèles :** `3am-s1-2` (« 7 نماذج لاختبار الفصل الأول ») et `3am-s1-112`.
- **Rangés dans le mauvais dossier** (`misfiled: true`, la couverture utilise `gradeInFile`) :
  - `1am-s1-100` est un examen 3AM ;
  - `1am-s2-79` est un examen 2AM ;
  - `2am-s2-65` est un examen 3AM ;
  - `3am-s1-112` contient deux modèles 2AM ;
  - `1am-s2-62` est un « الاختبار الأخير », donc probablement S3.
- **Rattrapages** (« استدراك », 1 h, sans situation d'intégration) : `1am-s3-44` et `1am-s3-45`.
- **Sujets de révision d'enseignants** (`examType: "other"`) : `1am-s1-97` et `1am-s2-65`.
- **Contexte à ne jamais réutiliser :** `2am-s2-61`, dont la situation d'intégration porte sur des bombardements et des soldats tués.
- **Recyclage fréquent :** la même situation d'intégration revient dans plusieurs examens sans que ce soient des copies. C'est le
  cas du fermier qui laboure en 3 jours (`2am-s1-92`, `2am-s1-67`, `2am-s1-74`), de la terre plus clôture plus les 2/5 en
  tomates (`1am-s2-78`, `1am-s3-39`) et de l'hôpital, des lunettes et du don (`2am-s3-43`, `2am-s3-31`).

## 2. Le modèle commun à toutes les années

Le cadre est quasi invariable sur les trois niveaux et les trois trimestres :

- **2 heures, 20 points, 2 pages.** La page 1 porte le « الجزء الأول (12 ن) » ; la page 2 porte le « الجزء الثاني (08 ن) :
  الوضعية الإدماجية », souvent avec une figure.
- **4 exercices courts plus 1 situation d'intégration.** Sur les examens trimestriels indexés, on trouve 4+1 dans environ 80 %
  des cas et 3+1 dans la plupart des autres.
- **Barème modal : 3+3+3+3 + 8.** Les variantes vont de 2 à 5 points par exercice et de 6 à 8 points pour l'intégration.
  Quelques sujets réservent « 01 ن تنظيم الورقة », ou 0,5 de cohérence plus 0,5 de présentation à l'intérieur des 8 points.
  Quelques erreurs de barème ont été relevées : totaux de 19, 21 ou 22.
- **Ordre stable :**
  1. l'exercice 1 est le calcul du segment numérique du trimestre ;
  2. l'exercice 2 est un autre calcul numérique, ou un tableau ;
  3. les exercices 3 et 4 sont de la géométrie (construction, puis nature de la figure, puis justification) ;
  4. vient ensuite la situation d'intégration.
- **Situation d'intégration :**
  - une histoire de la vie courante (terrain, achats, argent de la famille, école, ferme, voyage), 3 à 7 questions, souvent en
    « الجزء الأول / الجزء الثاني » ;
  - elle mêle le segment numérique du trimestre et une mesure (aire, périmètre, clôture avec une entrée, coût) ;
  - elle finit presque toujours sur une décision à justifier : « هل المبلغ كافٍ؟ علّل », « هل القسمة عادلة؟ », « أيّ العرضين أفضل؟ ».
- **Types de questions** (504 exercices) :

  | Type | Exercices |
  |---|---|
  | compute | 375 |
  | justify | 142 |
  | construct | 137 |
  | word-problem | 117 |
  | read-figure | 96 |
  | prove | 70 |
  | complete-table | 58 |
  | compare-order | 45 |
  | simplify | 41 |
  | fill-blank | 40 |
  | solve-equation | 37 |
  | fraction-of-quantity | 35 |
  | convert-units | 15 |
  | draw-graph | 15 |
  | true-false | 11 |
  | mcq | 8 |
  | read-graph | 4 |

  Le vrai/faux et le QCM sont rares, et le QCM est toujours « مع التعليل ».
- **Formules récurrentes :**
  - « أحسب (بتمعّن) … مع إظهار مراحل الحساب »
  - « أكمل / أتمم الفراغ »
  - « أكمل الجدول »
  - « رتّب تصاعديا »
  - « أنشئ … (اترك آثار الإنشاء) »
  - « ما نوع المثلث / الرباعي؟ علّل »
  - « بيّن أنّ … »
  - « استنتج … »
  - « اختبر صحة المساواة من أجل x = … »
  - « عبّر بدلالة x »
  - « (الأطوال غير حقيقية) »

  La calculatrice est généralement interdite en 1AM et 2AM.
- **Corrigés** (« التصحيح النموذجي ») :
  - Ils déroulent le calcul pas à pas, une opération par ligne.
  - Les justifications géométriques citent la propriété : « لأنهما عموديان على نفس المستقيم », « حسب خاصية فيثاغورس ».
  - Le barème par question (0,25 / 0,5 / 0,75 / 1 ن), en marge ou en tableau « العلامة | الإجابة », n'apparaît que dans une
    minorité de fichiers (`1am-s1-91`, `2am-s1-87`, `2am-s3-45`, `3am-s3-56`…).
  - Quand il est présent, il se termine par des points globaux : « الانسجام / الوحدات ومعقولية النتائج / تنظيم الورقة: 0,5 ن ».
  - On trouve des erreurs : `2am-s1-87` écrit 800 × 600 = 48000 ; dans `2am-s3-43`, l'énoncé donne 25 % et le corrigé utilise 40 %.

## 3. Par niveau et par trimestre

### 1AM

| Trimestre | Segments (`1am.m*`) | Ce qui revient |
|---|---|---|
| S1 | m1 ≫ m2 (+ m4.r10) | écriture décimale/fractionnaire, décomposition (« المفكوك النموذجي »), ×/÷ 10, 100, 0,1…, comparaison et rangement, ordre de grandeur ; parallèle/perpendiculaire par un point, symboles ∈ ∉ ⊥ //, vocabulaire du cercle, médiatrice |
| S2 | m4, m5, m3, m2 | division euclidienne (« اكتب المساواة »), tableau de divisibilité par 2, 3, 4, 5, 9, division décimale avec tableau des valeurs approchées ; angles (nommer, nature, mesurer, calculer sans rapporteur), symétrie axiale, bissectrice ; fractions sur une demi-droite graduée, « أكمل » du type a × … = b |
| S3 | m5, m6, m4, m7 | calcul fractionnaire et simplification, nombres relatifs et repère ; tableaux de proportionnalité, pourcentages ; volume du pavé |

**Situations d'intégration.**
- En S1 : liste d'achats aux prix décimaux et reste d'un budget, ou clôture d'un champ (périmètre moins l'entrée, multiplié par
  le prix au mètre) puis location d'une machine.
- En S2 : terrain composé (rectangle, carré, triangle rectangle) ; on calcule l'aire, le périmètre, la clôture, puis la fraction
  plantée.
- En S3 : pourcentages, plan à l'échelle, citerne en m³ convertie en L.

Les nombres sont des décimaux à 1–3 chiffres après la virgule, et des prix de 3 à 5 chiffres en DA. Les dénominateurs sont 2, 4,
5, 10, 100 ou 1000. Les longueurs de construction vont de 3 à 8 cm.

**Exemples (verbatim)**

*1am-s1-91, التمرين الثاني (03 ن)*
> أتمم الفراغ بما يناسب:
> (أ) $7,03 \times 0,1 = \ldots$ (ب) $\ldots \div 0,01 = 1$ (ج) $12 \ldots 100 = 0,12$ (د) $100 \ldots 1\,000 = 0,1$

*1am-s1-91, التمرين الرابع (04 ن)*
> تأمّل في الشكل المرفق حيث $AB = 7\text{ cm}$ و $AO = 4\text{ cm}$.
> 1. عيّن على المستقيم $(\Delta)$ نقطة $C$ بحيث $OC = 4,5\text{ cm}$.
> 2. (أ) ارسم المستقيم $(d_1)$ الذي يشمل $C$ و يعامد $(\Delta)$. (ب) أتمم: $(d_1) \ldots (AB)$ لأن ……
> 3. (أ) أنشئ بالمدور المستقيم $(d_2)$، محور القطعة $[AC]$. (ب) اشرح لماذا $O \notin (d_2)$.

*1am-s1-96, الوضعية الإدماجية (08 ن), extrait*
> لدى علي حقل كما هو موضح في الشكل المقابل. أراد علي إحاطة حقله بسياج.
> 1. ما هو طول السياج؟ تذكّر علي أنه يجب عليه ترك مدخل عرضه $3,5\text{ m}$. 2. ما هو طول السياج الجديد؟
> إذا علمت أن ثمن المتر الواحد من السياج هو $250\text{ DA}$. 3. احسب تكلفة التسييج (بعد ترك المدخل).
> … 6. إذا علمت أنه كان مع علي مبلغ $200000\text{ DA}$، احسب المبلغ المتبقي بعد عمليتي التسييج و الحرث.

### 2AM

| Trimestre | Segments (`2am.m*`) | Ce qui revient |
|---|---|---|
| S1 | m1 (r01–r09), m2 (+ m3 un peu ; m4 dans 3 sujets) | chaînes d'opérations avec crochets et barre de fraction, distributivité ; division décimale avec tableau « بالنقصان / بالزيادة » et encadrement ; comparer, additionner et multiplier des fractions ; constructions, médiatrice, symétrie centrale, puis « ما نوع الرباعي؟ » |
| S2 | m4 (colonne vertébrale), m3, m2, m5 | sommes algébriques à chaque sujet (ex. 1), droite graduée et repère, équations a + x = b, ax = b, a ÷ x = b, « اختبر صحة المساواة/المتباينة » ; parallèles et sécante (« بالتبادل الداخلي »), somme des angles, triangle donné par un côté et 2 angles, cercle circonscrit, aire du disque ; symétrique d'un point, puis nature du quadrilatère |
| S3 | m6 (chaque sujet), m7, rappels m2/m3/m5 | tableau de proportionnalité (ex. 1 dans environ 80 % des cas), quatrième proportionnelle, pourcentage (remise), échelle ; statistiques (effectifs, fréquences, diagramme en bâtons ou circulaire) ; prisme et cylindre (aire latérale, volume) ; construction d'un triangle avec son cercle circonscrit |

**Situations d'intégration.**
- En S1 : trois parts fractionnaires d'un tout. Les dénominateurs sont multiples les uns des autres (12, 6, 4 ; 24, 8, 3) et la
  dernière part est « الباقي ». On demande la plus grande part, la fraction restante, puis les valeurs une fois le tout donné
  (aire d'un rectangle, somme en DA).
- En S2 : plan de terrain ou de maison « بدلالة x ». On en tire une équation, puis une valeur, puis un coût (clôture, carrelage).
  Une variante pose une inégalité : un camion devant un pont limité à 7500 kg.
- En S3 :
  - environ 60 % sont des statistiques : tableau, puis diagramme, puis pourcentage ;
  - environ 40 % sont une figure composée « بدلالة x ».

**Exemples (verbatim)**

*2am-s1-87, التمرين الأول (03 ن)*
> أحسب بتمعّن العبارات التالية:
> $A = 2 \times 3 + 35 \div 5 - 7$ ؛ $B = 1,2 \times (3,4 + 6,6) \div 6$ ؛ $C = 27 - 2\,[\,13 - 4 \times (10 - 8)\,]$

*2am-s2-53, التمرين الرابع (03 ن)*
> 1) أنشئ مثلثا $ABC$ بحيث: $AB = 5cm$ ; $\widehat{CAB} = 50°$ ; $\widehat{CBA} = 70°$
> 2) أحسب قيس الزاوية $\widehat{BCA}$
> 3) أنشئ $E$ منتصف $[CA]$ ثم أنشئ المستقيم $(\Delta)$ الذي يشمل $E$ ويوازي $(CB)$ ويقطع $(BA)$ في $D$. اشرح لماذا $\widehat{AED} = \widehat{ECB}$
> 4) أنشئ $M$ نظيرة $D$ بالنسبة إلى $E$ ثم بيّن نوع الرباعي $MCDA$

*2am-s2-72, الوضعية الإدماجية (08 ن), الجزء الأول*
> تزن شاحنة لنقل مواد البناء وهي فارغة $5000kg$، حُمّلت بأكياس من الإسمنت وزن الكيس الواحد منها $50kg$ وأكياس من الرمل وزن كل واحد منها $80kg$. يريد صاحب هذه الشاحنة عبور جسر بجانبه لافتة مكتوب عليها « لا يسمح بمرور الشاحنة التي وزنها $7500kg$ أو أكثر ».
> تترجم هذه الوضعية بالمتباينة $50x + 80y + 5000 < 7500$
> أ) ماذا يمثل كل من المجهولين $x$ و $y$ بالنسبة للوضعية السابقة. ب) اختبر صحة المتباينة السابقة في الحالتين: $x = 10$ ، $y = 30$ — $x = 8$ ، $y = 25$ ج) استنتج في أي حالة يمكن للشاحنة عبور الجسر.

### 3AM

| Trimestre | Segments (`3am.m*`) | Ce qui revient |
|---|---|---|
| S1 | m1 et m2 dans chaque sujet (+ m3 dans 3 sujets sur 12) | produit et quotient de relatifs, règle des signes (« C جداء 123 عاملا منها 16 موجبة »), inverse, opérations sur les fractions jusqu'au « كسر غير قابل للاختزال », « بيّن أن A عدد طبيعي » ; construction d'un triangle, triangles égaux, droite des milieux, proportionnalité des longueurs, droites remarquables |
| S2 | m4 (dominant), m3, m5 | Pythagore et sa réciproque, cercle circonscrit au triangle rectangle, médiane relative à l'hypoténuse, tangente, cosinus avec arrondi au degré ; écriture scientifique, encadrement entre deux puissances de 10, ordre de grandeur ; développer, réduire, calculer pour x = … ; pas de m6 ni de m7 |
| S3 | m5, m7, m6 | mise en équation de problèmes, propriétés des inégalités ; pourcentages enchaînés (+30 % puis −35 %), vitesse d = v × t, statistiques (classes, histogramme, moyenne pondérée) ; translation, pyramide et cône (volume) |

**Situations d'intégration.**
- En S1 : partage fractionnaire d'une terre entre frères, puis une longueur de clôture trouvée par la droite des milieux ou par
  Thalès, puis une aire ou un coût.
- En S2 : terrain ou cour aux côtés en x, ou trajet en plusieurs segments (Pythagore plus cosinus).
- En S3 : plan d'une nouvelle école, citerne pyramide plus pavé, voyage et vitesse, notes au BEM blanc présentées en tableau
  statistique.

**Exemples (verbatim)**

*3am-s1-113, التمرين الثاني (03 ن)*
> A و B عددان حيث: $A = 0,0036 \times 10^{-2}$ ، $B = 5,4 \times 10^{8}$
> 1) أعطِ الكتابة العلمية للعددين A و B. 2) أوجد رتبة قدر العدد A. 3) أحصر العدد B بين قوتين متتاليتين للعدد 10.

*3am-s1-113, التمرين الثالث (03 ن)*
> 1) أنشئ مثلثا ABC بحيث: $AB = 7\,cm$ ، $BC = 9\,cm$ ، $\hat{B} = 130°$. 2) أنشئ الدائرة المحيطة بالمثلث ABC.
> 3) اشرح سبب وجود مركز هذه الدائرة خارج المثلث. 4) المثلث EFG فيه: $EF = 7\,cm$ و $EG = 9\,cm$ و $\hat{G} = 130°$. – هل المثلث EFG يقايس المثلث ABC؟ علّل.

*3am-s2-82, التمرين الثالث (03 ن), puis الوضعية الإدماجية (08 ن), الجزء الثاني*
> (C) دائرة مركزها O، [AB] قطر لها حيث AB = 7.5cm. M نقطة من الدائرة (C) حيث: BM = 4.5cm.
> 1) ما نوع المثلث AMB؟ برر جوابك. 2) احسب الطول AM. 3) استنتج طول MO.

> قام أستاذ الرياضة بنقل الأشجار من مزرعة ليغرسها في الساحة شاقوليا على أرض مستوية فاستعمل رابطين [AD] و[DC] طول كل منهما 2,5 m، فاستعان ببستاني لمعرفة إن كان عمله صائبا. قاس البستاني الأطوال: AD=2,5 m، BD=1,4 m، AB=2 m ليجد بعد الحساب أن الشجرة ليست شاقولية.
> 1) بين أن حساب البستاني صحيح. 2) كم يجب أن يكون الطول BD لتصبح الشجرة شاقولية؟

## 4. Peut-on générer de nouveaux exercices « على منوال » ? Oui.

Les sujets sont **très réguliers**. Les trois points suivants sont des invariants qu'un générateur peut reproduire.

**Le cadre :** 12 + 8 points en 2 h, 4 exercices plus 1 situation d'intégration, et le même registre de formules (§ 2).

**La carte trimestre → segments :**

| Niveau | S1 | S2 | S3 |
|---|---|---|---|
| 1AM | m1 + m2 | m3 + m4 + m5 | m5 + m6 + m7 |
| 2AM | m1 + m2 | m4 + m3 + m2/m5 | m6 + m7 + rappels |
| 3AM | m1 + m2 (+ m3) | m4 + m3 + m5 | m5 + m6 + m7 |

**Les gabarits d'exercices :**
- calcul à étapes ;
- tableau à compléter ;
- construction, puis nature de la figure, puis « علّل » ;
- situation d'intégration en deux parties, avec une décision finale.

Seuls varient le contexte, les nombres (petits, « propres ») et la répartition des points. Les auteurs recyclent eux-mêmes les
situations d'un examen à l'autre, ce qui confirme qu'il s'agit d'un genre stable plutôt que d'une suite de sujets uniques.

## 5. Couverture du programme

`coverageOwnGrade` compte, pour chaque item, les exercices des examens du même niveau qui le touchent. Ces nombres sont des
bornes basses, pour deux raisons :
- 87 fichiers sont sans texte et ne sont pas indexés ;
- les S3 sont sous-représentés (1AM : 7 sujets, 3AM : 6).

**Totaux par segment (examens du même niveau) :**

| Segment | Exercices | Segment | Exercices | Segment | Exercices |
|---|---|---|---|---|---|
| 1am.m1 | 79 | 2am.m1 | 160 | 3am.m1 | 85 |
| 1am.m2 | 73 | 2am.m2 | 61 | 3am.m2 | 58 |
| 1am.m3 | 24 | 2am.m3 | 106 | 3am.m3 | 55 |
| 1am.m4 | 54 | 2am.m4 | 104 | 3am.m4 | 76 |
| 1am.m5 | 65 | 2am.m5 | 43 | 3am.m5 | 67 |
| 1am.m6 | **23** | 2am.m6 | 102 | 3am.m6 | **16** |
| 1am.m7 | **3** | 2am.m7 | **17** | 3am.m7 | **18** |

**Bien couverts.** Ces leçons peuvent s'appuyer sur le corpus (au moins 10 exercices) :
- 1am.m1.r02/r03/r05, m2.r01/r02/r08, m5.r01/r10 ;
- 2am.m1.r01/r02/r05/r06/r07/r08/r09, m2.r01/r03/r05, m3.r03–r08, m4.r04–r09, m5.r02, m6.r02/r04/r06/r10/r12 ;
- 3am.m1.r01/r04/r06/r08, m2.r01–r03, m3.r02/r04/r05, m4.r01/r03/r08/x1, m5.r01–r03/r06.

**Lacunes.** Ces items sont touchés par au plus 1 exercice du même niveau. Leurs leçons demandent des exercices générés
« على منوال » :

| Niveau | Items à 0 ou 1 exercice |
|---|---|
| 1AM | m2.r06 (aire par pavage) 0, m2.r07 (comparer des aires) 0, m4.r05/r06 (figures symétriques, axes de symétrie) 0, m5.x1 1 ; **tout m6 sauf r03/r04/r06** (r02, r05, r07, r08, r10, r11, r12 à 1 ; r01, r09 à 2) ; **m7.r01–r04** (pavé : décrire, perspective, patron, fabriquer) 0 |
| 2AM | m4.r02 (comparer deux relatifs) 0, m6.r07 (séries statistiques) 0 ; **m7.r02–r06** (patron et fabrication du prisme, description, patron et fabrication du cylindre) 0–1 ; m7.r01 2, m2.r02 2 |
| 3AM | m1.r07 (reconnaître un rationnel) 1, m3.r03 1, m4.r04 (distance d'un point à une droite) 0, m4.r05 (positions droite/cercle) 0, m5.r04 (comparer deux rationnels) 0 ; **m6.r01, r04–r07** (définir la translation, pyramide et cône : décrire, représenter, patron, fabriquer) 0–1 ; **m7.r01, r02, r05, r07, r10, r11, r12** (graphique de proportionnalité, mouvement uniforme, conversion de vitesses, regroupement en classes, fréquences, moyenne pondérée, tableur) 0–1 |

On retrouve partout le même schéma. Les items de **description, représentation, patron et fabrication de solides** et les items
de **tableur** ne sont presque jamais évalués à l'écrit. Les items du dernier segment de chaque année (m6 et m7) sont minces,
parce que les examens de S3 sont peu nombreux dans le corpus.

## 6. Recette recommandée pour les banques de pratique 1–3AM (5 niveaux × 10 exercices)

Cette section est une recommandation, pas encore implémentée. Elle reprend le format « feuille d'examen » de 4AM.

1. **Gabarit par niveau.**

   | Niveau | Contenu |
   |---|---|
   | 1 | « التمرين » 2–3 ن, une seule compétence directe : calcul, « أتمم », « أكمل الجدول » |
   | 2 | 3 ن, calcul puis « علّل / برّر » |
   | 3 | 3 ن, exercice complet à 3–4 questions comme l'exercice 1 ou 2 d'un sujet |
   | 4 | 3–4 ن, exercice qui mobilise une leçon antérieure du même trimestre ; les étapes hors leçon sont marquées `counted: false`, comme en 4AM |
   | 5 | « الوضعية الإدماجية (08 ن) » en deux parties, terminée par une décision justifiée (§ 2) |

2. **Part du corpus.**
   - Pour un item bien couvert (au moins 5 exercices dans `coverageOwnGrade`), environ la moitié des feuilles des niveaux 3 à 5
     sont construites **sur un exercice précis du corpus**. On garde sa structure et son registre, mais on change les nombres et
     le contexte. Les autres feuilles sont générées à partir du modèle du trimestre.
   - Pour un item en lacune (§ 5), on génère 100 % des feuilles à partir du modèle du trimestre et du segment.
   - On ne copie jamais un sujet mot pour mot. Ces examens sont des sujets d'établissement rediffusés par un site tiers, sans
     statut officiel, et le propriétaire autorise « على منوال ». Il n'y a donc **pas** d'équivalent du badge `official` ni de
     `excerpt` de 4AM.
3. **Étiquetage de la provenance** (miroir de « على منوال BEM <year> ») :
   - **badge :** « على منوال اختبار الفصل الأول » (ou « … الفصل الثاني », « … الفصل الثالث »), selon le trimestre du modèle ;
   - **exercice calqué sur un exercice précis :** `metadata.exam.kind: "modelled"`, avec
     `metadata.source: {type:"term_exam", grade, semester, file:"<id de exams-index.json>", exercise:n}` ;
   - **exercice généré à partir du modèle seul :** `metadata.source: {type:"platform_addition", reason:"term_exam_modelled", modelledOn:"<grade>-s<sem>"}`.

   **Implémenté le 2026-10-14 (phase 2)** : le type `term_exam`, la raison `term_exam_modelled` et le badge sont dans le
   contrat (`EXERCISE_CONTRACT.md` § « Term-exam provenance (1AM–3AM) »), le validateur (`scripts/lib/examProvenance.mjs`,
   appelé par `validate-exercises.mjs`) et la feuille (`examPaper` : « على منوال اختبارات الفصل », « n متوسط »). Un sujet
   `misfiled` y compte pour son en-tête ; `2am-s2-61` y est refusé.
4. **Points et intitulés écrits comme sur la copie** : « التمرين الأول:(03 ن) », « الجزء الثاني: الوضعية الإدماجية (08 ن) ».
   Les figures sont redessinées en `GeoFigure` avec « (الأطوال غير حقيقية) » ; on n'importe jamais d'image.
5. **Correction et barème.** Chaque exercice reçoit un corrigé pas à pas dans le style « التصحيح النموذجي » : une ligne par
   opération et la propriété citée pour chaque justification. Le barème est écrit par question (0,25 / 0,5 ن), même là où le
   corpus n'en donne pas.

   Les items de construction et de solides (patrons, perspective) appellent des réponses dessinées. Ils s'appuient sur la
   réponse photo et la validation enseignant, déjà en place en 4AM.
6. **Exclusions :**
   - le livre `2am/2AM.pdf`, qui est protégé ;
   - le contexte de guerre de `2am-s2-61` ;
   - tout fichier `misfiled`, qui doit servir au niveau de `gradeInFile` et non à celui de son dossier ;
   - les corrigés fautifs signalés en § 2.

   Les contextes culturels et religieux (Omra, Mawlid, solidarité avec Gaza, voisinage) sont fréquents dans le corpus. Ils sont
   à réécrire plutôt qu'à recopier, comme les autres contextes du corpus (la couche « القيم الإسلامية » et son contrat
   `ISLAMIC_VALUES.md` ont été retirés le 2026-10-13).
