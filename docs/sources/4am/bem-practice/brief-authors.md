# Brief — banque d'exercices « على شكل BEM » — prototype `bahth-pgcd` (2026-10-06)

> **Déploiement à toutes les leçons (2026-10-06).** Ce brief est le FORMAT commun. Pour une leçon
> d'une autre unité, lis d'abord le brief de son unité `rollout/unit<N>/brief-authors.md` : il
> remplace les §3–4 ci-dessous (emplacements, textes officiels) et la liste des learning points du §2
> par ceux de la leçon. L'attribution des exercices d'annales à une leçon vient de
> `annals-index.md` : un exercice n'est cité (official / excerpt) QUE par sa leçon propriétaire.
> Décisions du propriétaire : banque remplacée en place (ids conservés, existants → `adapted`) ;
> étapes d'une autre année ou leçon gardées telles quelles en `counted: false` ; pas d'annales
> pour la leçon → « على منوال » + adapted ; niveau 5 = NOUVELLES وضعيات إدماجية (08 ن).

Décision du propriétaire (2026-10-06) : la banque de pratique doit **ressembler au sujet de شهادة التعليم المتوسط**,
présentation ET énoncés. Prototype sur UNE leçon, `bahth-pgcd` (البحث عن القاسم المشترك الأكبر لعددين طبيعيين),
**50 exercices = 10 par niveau**. Les autres leçons attendent l'accord du propriétaire.

Sources : `docs/official-BREVET-exams/` (annales 2007–2025 + corrigés). Exemple de référence À COPIER pour le style :
`content/practice/4am/bahth-pgcd/level-3/ex-4am-bahth-pgcd-l3-004.json` (BEM 2008, exercice 1).

## 1. Le format (contrat complet : `docs/architecture/EXERCISE_CONTRACT.md` § « Présentation examen (BEM) »)

Un exercice qui porte `metadata.exam` est rendu comme une FEUILLE D'EXAMEN : en-tête « التمرين الأول (02,5 ن) »,
badge « BEM 2008 », énoncé, puis TOUTES les étapes 01 / 02 / 03 visibles, avec (ا)(ب)(ج), l'élève répondant étape par étape.

```jsonc
"metadata": {
  "title": "BEM 2008 — التمرين الأول",          // h1 discret ; modelled : « على منوال BEM 2015 — … » ; adapted : sujet court
  "estimatedMinutes": 6,
  "tags": ["خوارزمية إقليدس"],
  "source": { "type": "bem", "year": 2008, "part": 1, "exercise": 1 },   // official / excerpt
  //        { "type": "platform_addition", "reason": "bem_modelled", "learningPoint": "...", "modelledOn": "BEM 2015 I-1" }  // modelled
  //        source d'origine INCHANGÉE + "adaptedFrom": "<id d'origine>"  (adapted, exercices déjà présents)
  "exam": {
    "kind": "official" | "excerpt" | "modelled" | "adapted",
    "badge": "BEM 2008" | "على منوال BEM 2015" | null,   // official/excerpt : « BEM <année> » ; modelled : « على منوال BEM <année> » ; adapted : null
    "heading": "التمرين الأول" | "التمرين الثاني" | "التمرين" | "الوضعية الإدماجية",
    "points": "03"                                          // écrit comme le sujet : « 03 »، « 02,5 »، « 08 »
  }
},
"statement": {
  "content": "ليكن العددان A و B حيث:",       // la phrase de mise en place, style sujet ; "" s'il n'y en a pas
  "formulas": ["P = \\dfrac{696}{406} - \\dfrac{3}{7} \\times \\dfrac{5}{2}"],   // facultatif : formules centrées, sur une ligne, comme le sujet
  "table": { "head": ["...", "..."], "rows": [["...", "..."]] }                   // facultatif (« انقل وأكمل الجدول »)
},
"questions": [{
  "id": "q1",
  "step": "01",            // OBLIGATOIRE : 01 … 06, croissant
  "sub": "ا",              // facultatif : (ا) (ب) (ج) (د) — on écrit « ا » sans hamza, comme le sujet
  "lead": "…",             // facultatif : texte de l'étape AVANT ses (ا)(ب) — sur la 1re sous-question seulement
  "statement": "جد القاسم المشترك الأكبر للعددين 945 و 1215.",
  "counted": false,        // facultatif : étape jugée mais HORS maîtrise (relève d'une autre leçon : fraction irréductible, calcul fractionnaire…)
  "answerType": "rational" | "choice" | "integerSet" | "selfCheck",
  "solution": {            // OBLIGATOIRE : le corrigé type, style du livret de corrigés
    "lines": ["باستعمال خوارزمية إقليدس:", "$1215 = 945 \\times 1 + 270$", "…", "آخر باقٍ غير معدوم هو 135، إذن:"],
    "result": "PGCD(945 ; 1215) = 135"     // LaTeX, affiché ENCADRÉ ; facultatif
  },
  …                        // learningPoints, answerFormat, expectedAnswer, hints, feedback : inchangés (voir l'exemple)
}]
```

`selfCheck` (« بيّن أن »، « برّر »، « علّل ») : PAS d'`expectedAnswer`. L'élève ÉCRIT sa démonstration dans une zone de
texte et valide : elle est enregistrée et verrouillée, le corrigé type (`solution`) s'ouvre, puis il se note « مطابق / غير
مطابق ». Jamais compté pour la maîtrise. `answerFormat` obligatoire (« اكتب برهانك هنا، ثم اضغط «سجّل إجابتي» لتطّلع على
الحل النموذجي. »). `feedback.correct/incorrect` obligatoires.
N'utilise `selfCheck` QUE si l'étape n'a pas de valeur vérifiable ; sinon fais saisir la valeur.

## 2. Règles d'écriture (le registre du sujet)

- **Verbes du sujet, à l'impératif** : احسب، جد، أوجد، عيّن، اكتب … على شكل …، بيّن أن، تحقّق أن، استنتج، برّر،
  أعط، ما هو …؟ Jamais : « أي الكيفيتين أنسب؟ »، « صحيح أم خطأ »، « من الكتاب (ص 12): »، « من بين الاقتراحات ».
- **Mise en place** : « ليكن العددان … »، « نعتبر … »، ou une petite situation réelle (sujet, pas conte).
- **Étapes enchaînées** : 2 à 4 étapes, la suivante utilise le résultat de la précédente (PGCD → كسر غير قابل للاختزال →
  حساب ; PGCD → طول الضلع → عدد المربعات). Une étape seule est permise aux niveaux 1–2.
- **Chiffres et unités comme le sujet** : `945 و 1215`، `2,20m`، `1,4m`، `cm`، `m²` (`m^2` en `$…$`)، `DA` (le sujet
  écrit DA ; sur ces feuilles on garde DA). Virgule décimale. Dans `$…$`, virgule `{,}`.
- **Pas de QCM déguisé** : le sujet n'a pas de QCM. `choice` seulement quand le sujet pose une question fermée
  (« هل يمكن …؟ » → نعم / لا ; « ما نوع … ») — et alors le corrigé (`solution`) donne la justification.
- **Points** : exercices du الجزء الأول : « 02 » à « 04 » selon le nombre d'étapes (une étape : « 02 ») ; la وضعية
  الإدماجية : « 08 ».
- **Indices** : 1 à 3, look → direction → strategy, sans JAMAIS écrire la réponse (le validateur le vérifie, et vérifie
  aussi `answerFormat` et `feedback.incorrect`). Le corrigé (`solution`) et `feedback.correct`, eux, la donnent.
- **Learning points** : UNIQUEMENT ceux de `bahth-pgcd` (le validateur refuse les autres) :
  - `4am_bahth-pgcd_P1` — justifier / utiliser PGCD(a ; b) = PGCD(b ; a − b)
  - `4am_bahth-pgcd_P2` — calculer le PGCD par les différences successives (آخر فرق غير معدوم)
  - `4am_bahth-pgcd_P3` — justifier / utiliser PGCD(a ; b) = PGCD(b ; r)
  - `4am_bahth-pgcd_P4` — calculer le PGCD par l'algorithme d'Euclide (آخر باقٍ غير معدوم)
  - `4am_bahth-pgcd_P5` — comparer les deux algorithmes, choisir, et INVESTIR le PGCD dans une situation
  Une étape qui relève d'une autre leçon (fraction irréductible, calcul fractionnaire, nombre de paquets…) garde un LP
  de la leçon comme étiquette ET porte `"counted": false`. Le nombre de paquets/carrés DÉDUIT du PGCD reste compté (P5).
- **Misconceptions** : réutilise `MISC-PGCD-LAYSA-AKBAR`، `MISC-PGCD-HASIL-BADAL-QASIM`، `MISC-PGCD-SIFR`،
  `MISC-IKHTIZAL-NAQIS` (content/practice/misconceptions.json). N'en crée pas.
- **Exactitude** : chaque réponse et chaque ligne de corrigé est RECALCULÉE par un script (python : `math.gcd`,
  `fractions.Fraction`) — jamais de tête. Une coquille du sujet se corrige et se signale dans ton rapport.

## 3. Les 50 emplacements (10 par niveau)

| Niveau | Emplacements | Auteur |
|---|---|---|
| 1 | 001 (existant) | B |
| 1 | 002–005 | C |
| 1 | 006–010 | D |
| 2 | 001–002 (existants) | B |
| 2 | 003 BEM 2021 · 004 BEM 2025 | A |
| 2 | 005–008 | C |
| 2 | 009–010 | D |
| 3 | 001–003 (existants) | B |
| 3 | 004 BEM 2008 (FAIT, référence) · 005 BEM 2016 · 006 BEM 2015 | A |
| 3 | 007–009 | C |
| 3 | 010 | D |
| 4 | 001–003 (existants) | B |
| 4 | 004 BEM 2010 · 005 BEM 2024 | A |
| 4 | 006–008 | C |
| 4 | 009–010 | D |
| 5 | 001–002 (existants) | B |
| 5 | 003 BEM 2022 (الجزء الثاني) · 004 BEM 2020 (الجزء الثاني) | A |
| 5 | 005–006 | C |
| 5 | 007–010 | D |

Fichiers : `content/practice/4am/bahth-pgcd/level-N/ex-4am-bahth-pgcd-lN-NNN.json`. N'écris QUE tes emplacements.

## 4. Textes officiels (transcrits des annales, à reprendre MOT POUR MOT — `kind: official` ; `excerpt` = étapes hors unité 1 retirées)

- **BEM 2008 — التمرين الأول (02,5 ن)** — FAIT (l3-004).
- **BEM 2010 — التمرين الثاني (03 ن)** — official.
  01 احسب القاسم المشترك الأكبر للعددين 140 و 220. → 20
  02 صفيحة زجاجية مستطيلة الشكل بعداها 2,20m و 1,4m جُزّئت إلى مربعات متساوية بأكبر ضلع دون ضياع.
  (ا) ما هو طول ضلع كل مربع ؟ → 20 cm (= 0,2 m ; demander en cm dans answerFormat) (ب) ما هو عدد المربعات الناتجة ؟ → 77
- **BEM 2015 — التمرين الأول (03 ن)** — official.
  01 احسب القاسم المشترك الأكبر للعددين 696 و 406 مع كتابة مراحل الحساب. → 58 (696 = 406×1+290 ; 406 = 290×1+116 ; 290 = 116×2+58 ; 116 = 58×2+0)
  02 اكتب $\dfrac{696}{406}$ على شكل كسر غير قابل للاختزال. → 12/7 (counted:false)
  03 احسب العدد P حيث: $P = \dfrac{696}{406} - \dfrac{3}{7} \times \dfrac{5}{2}$ . → 9/14 (counted:false)
- **BEM 2016 — التمرين الأول (03 ن)** — excerpt (l'étape 03 sur √ est retirée).
  01 احسب القاسم المشترك الأكبر للعددين 1053 و 832. → 13
  02 اكتب الكسر $\dfrac{1053}{832}$ على شكل كسر غير قابل للاختزال. → 81/64 (counted:false)
- **BEM 2021 — التمرين الأول (03 ن)** — excerpt (étapes 02–03 sur √7 retirées).
  01 احسب القاسم المشترك الأكبر للعددين 567 و 448. → 7
- **BEM 2024 — التمرين الثاني (03 نقاط)** — official.
  « يملك خياط قطعة قماش مستطيلة الشكل عرضها 270cm وطولها 378cm، يريد تجزئة هذه القطعة إلى مربعات متقايسة دون ضياع. »
  01 هل يمكن أن يكون طول ضلع كل مربع 10cm ؟ 18cm ؟ برّر إجابتك. → 10cm : لا (378 لا يقبل القسمة على 10) ; 18cm : نعم (270 = 18 × 15 و 378 = 18 × 21).
     Deux questions `choice` sur le même step 01 (une pour 10cm, une pour 18cm), justification dans `solution`.
  02 أوجد عدد المربعات التي يمكن الحصول عليها بحيث يكون طول ضلع كل مربع أكبر ما يمكن. → PGCD = 54 ; 5 × 7 = 35
- **BEM 2025 — التمرين الثاني (03 نقاط)** — excerpt (02–03 sur le repère retirées).
  01 احسب: PGCD(1352 ; 507). → 169
- **BEM 2022 — الجزء الثاني (08 ن)** — excerpt (l'étape 02, géométrie, retirée).
  « خصص فلاح قطعة أرض لإنتاج البطاطا و الجزر، فكان المحصول: 1188 صندوقٍ من البطاطا و 528 صندوقًا من الجزر. »
  01 lead: « قصد مساعدة دُور العجزة و مراكز الأيتام و ذوي الاحتياجات الخاصة، يريد هذا الفلاح أن يُجمِّع الصناديق في تشكيلات
  متماثلة من حيث النوع و العدد (أي كل تشكيلة تحتوي على نفس عدد الصناديق من البطاطا و نفس عدد الصناديق من الجزر). »
  (ا) ما هو أكبر عدد من التشكيلات التي يمكن تكوينها ؟ → 132
  (ب) ما هو عدد صناديق البطاطا و عدد صناديق الجزر في كل تشكيلة. → 9 et 4 (deux questions sur le même (ب))
- **BEM 2020 — الجزء الثاني (08 ن)** — official, UNE seule tâche ☜ (les indices et le corrigé portent les étapes).
  « يريد عمي محمود إحاطة قطعة أرض مستطيلة الشكل بُعداها 60m و 42m بأشجار من نفس النوع بحيث تكون المسافة متساوية و أكبر
  ما يمكن بين كل شجرتين متتاليتين، على أن يغرس في كل ركن شجرة.
  المشتلة التي قصدها عمي محمود تعرض شجيرات مختلفة، أثمانها من 200DA إلى 1000DA حسب نوعيتها (كلما كانت الشجيرة أفضل كان ثمنها أكبر).
  • تكلفة غرس كل شجيرة تمثل 125% من ثمنها المعروض. • مصاريف النقل 1400DA مهما كان عدد الشجيرات. • مع عمي محمود 32000DA. »
  ☜ أعط القيمة التي لا يمكن أن يتجاوزها ثمن الشجيرة حتى يتسنى لعمي محمود إحاطة هذه القطعة حسب الشروط المذكورة. → 400 DA
  (PGCD(60 ; 42) = 6 ; محيط 204 m ; 34 شجرة ; 34 × 2,25 p + 1400 ≤ 32000 ⇒ p ≤ 400)

Autres sujets d'où tirer des modèles (`modelled`) : 2009 I-4 (02 PGCD(500 ; 125)), 2023 I-1 (01 كسر 756/216).

## 5. Contrôle avant de rendre

```bash
node scripts/validate-exercises.mjs --strict 2>&1 | grep -E "bahth-pgcd|Validation"
```
`--strict` n'écrit rien (plusieurs auteurs en parallèle). Ignore SEULEMENT l'erreur « index.generated.json … périmé ».
Toute autre erreur sur tes fichiers se corrige. Rapporte : fichiers écrits, réponses vérifiées par script, coquilles trouvées.
