# Index des annales BEM 2007 → 2025 (étape 0 du déploiement « feuille d’examen »)

Construit le 2026-10-06 en lisant les pages rendues (`pdftoppm -r 150`) des deux fichiers de `docs/official-BREVET-exams/`
(sujets : 8 pages denses, 2 colonnes, lues colonne droite puis gauche ; corrigés : 62 pages). Source machine : `annals-index.json`.

**Couverture.** 19 sessions (2007 → 2025), une par an, aucune manquante ; chacune = 4 exercices du الجزء الأول + 1 الجزء الثاني (2024 : « المسألة » ; 2025 : « الوضعية الإدماجية »). 95 exercices.

**Légende.** Page sujet : `3L` = page 3, colonne gauche. Pages corrigé : plage de la session dans le fichier « … حلول ». Étapes : `étape → leçon` ; `hors-4AM` = compétence d’une année antérieure (Pythagore, calcul fractionnaire, aires, volumes 3AM…) → `counted:false`. **Leçon propriétaire** = la seule leçon qui cite l’exercice ; ses autres étapes deviennent `counted:false` (ou sont retirées : `excerpt`).

## 1. Par année

| Session | Exercice | ن | Page sujet | Pages corrigé | Thème | Leçon propriétaire (unité) | Étapes → leçons | Mixte | Notes |
|---|---|---|---|---|---|---|---|---|---|
| 2007 | التمرين الأول | 03 | 1R | 1–4 | جذور: a√2 ؛ تبسيط كسر ؛ بيّن أن A²/33 − 3B = 1/3 | **tawzif-khawass-judhur** (2) | 01→tawzif-khawass-judhur ؛ 02→hors-4AM | oui | 02 calcul fractionnaire + ‹بيّن أن› |
| 2007 | التمرين الثاني | 03 | 1R | 1–4 | E = 10² − (x−2)² − (x+8) : نشر، تحليل، معادلة جداء | **tahlil-ibara** (3) | 01→nashr-tabsit ؛ 02→tahlil-ibara ؛ 03→jidaa-maadum | oui |  |
| 2007 | التمرين الثالث | 02,5 | 1R | 1–4 | جملة 4x+5y=105 ، 6x+4y=112 ؛ مشكلة كراريس وأقلام | **mushkilat-jumla** (5) | 01→hall-jabri ؛ 02→mushkilat-jumla | oui |  |
| 2007 | التمرين الرابع | 03,5 | 1R | 1–4 | مثلث قائم AB=4,5 BC=7,5 ؛ AC ؛ عكس طالس ثم DE | **aksiya-talis** (9) | 01→hors-4AM ؛ 02→hors-4AM ؛ 03→aksiya-talis | oui | 01–02 Pythagore (3AM) |
| 2007 | الجزء الثاني | 08 | 1R | 1–4 | تسعيرتا سيارات أجرة 15DA/km و 12DA/km+900DA ؛ جدول ؛ متراجحة ؛ تمثيل f ، g ؛ أفضل تسعيرة | **tarrid-taalufi** (7) | 01→dala-khattiya ؛ 02→mutarajiha-ula ؛ 03→tafsir-bayani-jumla | oui |  |
| 2008 | التمرين الأول | 02,5 | 1R | 5–7 | PGCD(945 ; 1215) ؛ كسر غير قابل للاختزال | **bahth-pgcd** (1) | 01→bahth-pgcd ؛ 02→ikhtizal-kasr | oui | UTILISÉ par le prototype (l3-004) |
| 2008 | التمرين الثاني | 03,5 | 1R | 5–7 | A = (2−√3)² ؛ E = x² − (7−4√3) : قيمة عند √7 ، تحليل ، معادلة جداء | **tahlil-ibara** (3) | 01→mutatabiqat-shahira ؛ 02أ→amaliyat-judhur ؛ 02ب→tahlil-ibara ؛ 02ج→jidaa-maadum | oui | mêle racines et calcul littéral |
| 2008 | التمرين الثالث | 03 | 1R→1L | 5–7 | مثلث قائم AB=3 BC=5 ؛ AC ؛ طالس BM ؛ cos ABC ثم الزاوية EMB | **talis-hisab-atwal** (9) | 01→hors-4AM ؛ 02أ→talis-hisab-atwal ؛ 02ب→hasiba-muthallathiya | oui |  |
| 2008 | التمرين الرابع | 03 | 1L | 5–7 | A(0;4) B(1;0) ؛ عبارة الدالة التآلفية التي تمثيلها (AB) ؛ تمثيل g ؛ نقطة التقاطع | **tanasub-taghayyurat** (7) | 01→murakkibata-shuaa ؛ 02→tanasub-taghayyurat ؛ 03أ→tamthil-bayani-taalufi ؛ 03ب→tafsir-bayani-jumla | oui |  |
| 2008 | الجزء الثاني | 08 | 1L | 5–7 | أرض مستطيلة 2400m² عرضها ثلثا طولها ؛ حظيرة سيارات وشاحنات ؛ تعريفة يومية 8960DA و 30% | **tarrid-mushkila** (4) | 01→muadalat-x-murabba ؛ 02→tarrid-mushkila ؛ 03→tarrid-mushkila | oui | 03 : le corrigé officiel n’utilise qu’une inconnue (a = 30 % de b ; 56b = 8960) → ترييض مشكلة, compté |
| 2009 | التمرين الأول | 03 | 1L | 8–11 | A=√80 B=2√45 C=√5+1 ؛ a√5 ؛ A×B طبيعي ؛ C²/√5 بمقام ناطق | **tawzif-khawass-judhur** (2) | 01→tawzif-khawass-judhur ؛ 02→amaliyat-judhur ؛ 03→tawzif-khawass-judhur | oui |  |
| 2009 | التمرين الثاني | 03 | 1L | 8–11 | E = 2x − 10 − (x−5)² : نشر، تحليل، معادلة جداء | **tahlil-ibara** (3) | 01→nashr-tabsit ؛ 02→tahlil-ibara ؛ 03→jidaa-maadum | oui |  |
| 2009 | التمرين الثالث | 02,5 | 1L | 8–11 | دوران مركزه A وزاويته 90° ؛ نوع المثلث ABC ؛ BC | **mafhum-dawaran** (13) | 01→mafhum-dawaran ؛ 02→khawas-dawaran ؛ 03→hors-4AM | oui | 03 Pythagore |
| 2009 | التمرين الرابع | 03,5 | 1L | 8–11 | جملة x+y=14 ، x+4y=32 ؛ PGCD(500 ; 125) ؛ علب شاي 125g و 500g | **mushkilat-jumla** (5) | 01→hall-jabri ؛ 02→bahth-pgcd ؛ 03→mushkilat-jumla | oui | 02 = unité 1 (counted:false) ; cité par le prototype comme modèle seulement |
| 2009 | الجزء الثاني | 08 | 1L→2R | 8–11 | خزان أسطواني ومسبح ؛ تدفق 12m³/h ؛ f(x)=314−12x ، g(x)=12x ؛ تمثيل ؛ f(x)=g(x) | **tafsir-bayani-jumla** (7) | 01→hors-4AM ؛ 02→dala-khattiya ؛ 03→tafsir-bayani-jumla | oui | 01 volumes cylindre/pavé (3AM) |
| 2010 | التمرين الأول | 03 | 2R | 12–13 | المعدل الفصلي m = (2a+3b)/5 ؛ جد a | **muadala-ula** (4) | —→muadala-ula |  | une seule tâche |
| 2010 | التمرين الثاني | 03 | 2R | 12–13 | PGCD(140 ; 220) ؛ صفيحة زجاجية 2,20m × 1,4m | **bahth-pgcd** (1) | 01→bahth-pgcd ؛ 02→bahth-pgcd |  | UTILISÉ par le prototype (l4-004) |
| 2010 | التمرين الثالث | 03 | 2R | 12–13 | A(0;2) B(1;0) C(−1;0) ؛ نوع ABC ؛ دوران 180° ؛ نوع ABDC | **ithbat-khawas-maalam** (12) | 01→murakkibata-shuaa ؛ 02→muntasaf-masafa ؛ 03→ithbat-khawas-maalam | oui | rotation 180° = symétrie centrale |
| 2010 | التمرين الرابع | 03 | 2R | 12–13 | (BC)//(EF) ؛ احسب EF و FC (شكل) | **talis-hisab-atwal** (9) | —→talis-hisab-atwal |  | figure à redessiner |
| 2010 | الجزء الثاني | 08 | 2R | 12–13 | قاعة: مربع + مستطيل + نصف قرص ؛ قطران مجموعهما 28m ؛ cos α = 0,8 ؛ سعر البلاط 800DA | **tarrid-muthallathiya** (10) | 01→muadala-ula ؛ 02→tarrid-muthallathiya ؛ 03→hors-4AM | oui | 03 aires |
| 2011 | التمرين الأول | 03 | 2R | 14–16 | تحقق بالنشر ؛ A = 2x²−7x+3+(2x−1)(3x+2) تحليل ؛ معادلة جداء | **tahlil-ibara** (3) | 01→nashr-tabsit ؛ 02→tahlil-ibara ؛ 03→jidaa-maadum | oui |  |
| 2011 | التمرين الثاني | 03 | 2R→2L | 14–16 | A = √125+√45−√20 على الشكل a√5 ؛ A × √5/30 | **tawzif-khawass-judhur** (2) | 01→tawzif-khawass-judhur ؛ 02→amaliyat-judhur | oui |  |
| 2011 | التمرين الثالث | 03 | 2L | 14–16 | مثلث قائم وارتفاعه ؛ بيّن أن AB² = BH × BC بـ cos | **nisab-muthallathiya** (10) | —→nisab-muthallathiya |  | preuve (selfCheck) |
| 2011 | التمرين الرابع | 03 | 2L | 14–16 | A(−1;2) B(3;2) M(1;−1) ؛ B صورة A بدوران مركزه M | **ithbat-khawas-maalam** (12) | 01→murakkibata-shuaa ؛ 02→ithbat-khawas-maalam | oui | MA = MB par distances |
| 2011 | الجزء الثاني | 08 | 2L | 14–16 | وكالة اتصالات: ثلاث صيغ 11DA/min ، 600+5x ، 1200+3x ؛ تمثيل ؛ أقل تكلفة | **tarrid-taalufi** (7) | 01→tarrid-taalufi ؛ 02→tamthil-bayani-taalufi | oui |  |
| 2012 | التمرين الأول | 03 | 2L | 17–20 | m و n على الشكل a√7+b ؛ m×n ناطق ؛ (√7−5)/√7 بمقام ناطق | **wadiya-idmajiya-judhur** (2) | 01→tawzif-khawass-judhur ؛ 02→amaliyat-judhur ؛ 03→tawzif-khawass-judhur | oui | mêle les trois compétences → synthèse de l’unité 2 |
| 2012 | التمرين الثاني | 03 | 2L | 17–20 | E = (4x−1)² − (3x+2)(4x−1) ؛ نشر ، تحليل ، معادلة ، متراجحة | **tahlil-ibara** (3) | 01→nashr-tabsit ؛ 02→tahlil-ibara ؛ 03→jidaa-maadum ؛ 04→mutarajiha-ula | oui |  |
| 2012 | التمرين الثالث | 03 | 2L | 17–20 | دائرة قطرها 8cm ، BC=3cm ؛ زاوية BAC ثم BOC ؛ انسحاب ثم طالس DF | **zawiya-muhitiya** (13) | 01→zawiya-muhitiya ؛ 02→talis-hisab-atwal | oui | 01 utilise aussi le sinus |
| 2012 | التمرين الرابع | 03 | 2L | 17–20 | A(2;−1) B(−2;3) C(−4;−3) ؛ AC ونوع ABC ؛ D حيث CA = BD ؛ (AB) ⊥ (CD) | **ithbat-khawas-maalam** (12) | 01→murakkibata-shuaa ؛ 02→muntasaf-masafa ؛ 03→hisab-murakkibatay ؛ 04→ithbat-khawas-maalam | oui |  |
| 2012 | الجزء الثاني | 08 | 2L→3R | 17–20 | جريدة: 10DA أو 8DA + اشتراك 500DA ؛ جدول ؛ f ، g ؛ f(x)=g(x) ؛ 150 و 270 جريدة | **tamthil-bayani-taalufi** (7) | 01→mafhum-taalufiya ؛ 02→tamthil-bayani-taalufi ؛ 04→tafsir-bayani-jumla ؛ 05→tarrid-taalufi | oui |  |
| 2013 | التمرين الأول | 03 | 3R | 21–24 | A = √3(√3−1)+√27+1 = 4+2√3 ؛ A × B عدد طبيعي | **amaliyat-judhur** (2) | 01→amaliyat-judhur ؛ 02→amaliyat-judhur |  |  |
| 2013 | التمرين الثاني | 03,5 | 3R | 21–24 | A = 3x−5 : قيمة مقربة عند √2 ، متراجحة ؛ B = (3x−5)²+9x²−25 : نشر ، تحليل ، معادلة | **tahlil-ibara** (3) | 01أ→natiqa-ghayr-natiqa ؛ 01ب→mutarajiha-ula ؛ 02→tahlil-ibara | oui | 01أ : le livret de corrigés donne 3√2 − 5 ≈ −0,75 par défaut, la valeur juste est −0,76 (signalé par l’auteur jidhr-tarbii) |
| 2013 | التمرين الثالث | 02 | 3R | 21–24 | مثلث قائم AB=4 CB=8 ؛ طالس MH ؛ tan AMB ثم الزاوية | **talis-hisab-atwal** (9) | 01→talis-hisab-atwal ؛ 02→hasiba-muthallathiya | oui |  |
| 2013 | التمرين الرابع | 03,5 | 3R | 21–24 | A(2;0) B(−4;3) C(5;3) ؛ مركبتا AB وطوله ؛ D بانسحاب ؛ تقاطع (BC) و (AD) | **hisab-murakkibatay** (12) | 01→murakkibata-shuaa ؛ 02→hisab-murakkibatay ؛ 03→hisab-murakkibatay ؛ 04→ithbat-khawas-maalam | oui |  |
| 2013 | الجزء الثاني | 08 | 3R | 21–24 | كراء سيارة: ثلاث وكالات ؛ f ، g ، h ؛ جدول ؛ g=h ، f=h ، f=g | **tarrid-taalufi** (7) | 01→hors-4AM ؛ 02→mafhum-taalufiya ؛ 03→tamthil-bayani-taalufi ؛ 04→tafsir-bayani-jumla | oui |  |
| 2014 | التمرين الأول | 03 | 3L | 25–28 | A كسر عشري ؛ B كتابة علمية ؛ C = √175 − √112 + 6√7 أبسط شكل | **tawzif-khawass-judhur** (2) | 01→hors-4AM ؛ 02→hors-4AM ؛ 03→tawzif-khawass-judhur | oui | 01–02 hors 4AM |
| 2014 | التمرين الثاني | 03 | 3L | 25–28 | E = (2x+5)² − 36 ؛ تحقق بالنشر ؛ تحليل ؛ معادلة | **mutatabiqat-shahira** (3) | 01→mutatabiqat-shahira ؛ 02→tahlil-ibara ؛ 03→jidaa-maadum | oui |  |
| 2014 | التمرين الثالث | 03 | 3L | 25–28 | شبه منحرف قائم ACB = 25° ؛ AB بـ tan ؛ مساحات | **tarrid-muthallathiya** (10) | 01→hasiba-muthallathiya ؛ 02→hors-4AM | oui | figure à redessiner |
| 2014 | التمرين الرابع | 03 | 3L | 25–28 | A(−2;−3) B(4;1) C(2;4) ؛ AB ؛ ABC قائم ؛ E بانسحاب ؛ ABCE مستطيل | **muntasaf-masafa** (12) | 01→murakkibata-shuaa ؛ 02→muntasaf-masafa ؛ 03→barahin-ashia | oui |  |
| 2014 | الجزء الثاني | 08 | 3L | 25–28 | عرضا SMS: 3DA أو 1,5DA + 30DA ؛ جدول ؛ f ، g ؛ قراءة بيانية | **tafsir-bayani-jumla** (7) | 01→dala-khattiya ؛ 02→mafhum-taalufiya ؛ 03→tamthil-bayani-taalufi ؛ 04→tafsir-bayani-jumla | oui |  |
| 2015 | التمرين الأول | 03 | 3L | 29–31 | PGCD(696 ; 406) ؛ كسر ؛ حساب P | **bahth-pgcd** (1) | 01→bahth-pgcd ؛ 02→ikhtizal-kasr ؛ 03→hors-4AM | oui | UTILISÉ par le prototype |
| 2015 | التمرين الثاني | 03,5 | 3L | 29–31 | F = (2x−3)² − 16 ؛ تحليل ؛ معادلة ؛ F عند x = 1+√2 | **mutatabiqat-shahira** (3) | 01→mutatabiqat-shahira ؛ 02→tahlil-ibara ؛ 03→jidaa-maadum ؛ 04→amaliyat-judhur | oui |  |
| 2015 | التمرين الثالث | 03 | 4R | 29–31 | دائرة قطرها ST=9cm ، SOR=46° ؛ STR=23° ؛ SRT قائم ؛ RS | **zawiya-muhitiya** (13) | 01→zawiya-muhitiya ؛ 02→zawiya-muhitiya ؛ 03→hasiba-muthallathiya | oui |  |
| 2015 | التمرين الرابع | 02,5 | 4R | 29–31 | رباعي قطراه متعامدان ؛ (CD)//(AB) ؛ AB | **aksiya-talis** (9) | 01→aksiya-talis ؛ 02→hors-4AM | oui | 02 Pythagore ; figure |
| 2015 | الجزء الثاني | 08 | 4R | 29–31 | عمي أحمد: أرض 1000m² عرضها خُمسا طولها ؛ ABMD و BCM ؛ f ، g ؛ تمثيل | **tafsir-bayani-jumla** (7) | ☜→muadalat-x-murabba ؛ 01→muadala-ula ؛ 02→tafsir-bayani-jumla | oui |  |
| 2016 | التمرين الأول | 03 | 4R | 32–35 | PGCD(1053 ; 832) ؛ كسر ؛ A = √1053 + 2√832 − 8√117 على الشكل a√13 | **bahth-pgcd** (1) | 01→bahth-pgcd ؛ 02→ikhtizal-kasr ؛ 03→tawzif-khawass-judhur | oui | UTILISÉ (extrait 01–02) ; 03 non utilisé |
| 2016 | التمرين الثاني | 03 | 4R | 32–35 | تحقق 5(2x+1)(2x−1) ؛ تحليل A ؛ متراجحة وتمثيل حلولها | **tahlil-ibara** (3) | 01→mutatabiqat-shahira ؛ 02→tahlil-ibara ؛ 03→mutarajiha-ula | oui |  |
| 2016 | التمرين الثالث | 02,5 | 4R | 32–35 | دالة تآلفية تمثيلها يشمل A(2;5) B(−1;−4) ؛ f(x) = 3x−1 ؛ استقامية ؛ سابقة 29 | **tanasub-taghayyurat** (7) | 01→tanasub-taghayyurat ؛ 02→mafhum-taalufiya ؛ 03→mafhum-taalufiya | oui |  |
| 2016 | التمرين الرابع | 03,5 | 4R→4L | 32–35 | EFG قائم متساوي الساقين ؛ صور بانسحاب ؛ EGDC مربع ؛ U = ED | **barahin-ashia** (11) | 01→hors-4AM ؛ 02→insihab-shuaa ؛ 03→barahin-ashia ؛ 04→majmu-shuaayn | oui |  |
| 2016 | الجزء الثاني | 08 | 4L | 32–35 | أرض 50m × 40m ؛ MA/MN = 2/3 ؛ BN ؛ زاوية MAD ؛ دوران 90° ؛ ضريبة 20% وكتابة علمية | **wadiya-idmajiya-talis** (9) | I-01→talis-hisab-atwal ؛ I-02→talis-hisab-atwal ؛ I-03→hasiba-muthallathiya ؛ II-01→khawas-dawaran ؛ II-02→tatbiqat-tanasub | oui | figure à redessiner |
| 2017 | التمرين الأول | 03 | 4L | 36–39 | A = √108 − √12 ؛ B = 3/(2√3) بمقام ناطق ؛ C = (A+1)(8B−1) طبيعي | **tawzif-khawass-judhur** (2) | 01→tawzif-khawass-judhur ؛ 02→tawzif-khawass-judhur ؛ 03→amaliyat-judhur | oui |  |
| 2017 | التمرين الثاني | 03 | 4L | 36–39 | P = (1−3x)(3x+3) − 2(3x+3) ؛ نشر ، تحليل ، معادلة | **nashr-tabsit** (3) | 01→nashr-tabsit ؛ 02→tahlil-ibara ؛ 03→jidaa-maadum | oui |  |
| 2017 | التمرين الثالث | 04 | 4L | 36–39 | A(0;4) B(−3;1) C(5;−1) ؛ منتصف [BC] ؛ دوران 180° ؛ ABDC مستطيل | **muntasaf-masafa** (12) | 01→murakkibata-shuaa ؛ 02→muntasaf-masafa ؛ 03→mafhum-dawaran ؛ 04→ithbat-khawas-maalam | oui |  |
| 2017 | التمرين الرابع | 02 | 4L | 36–39 | MU=28 MO=21 MI=36 MA=27 ؛ (OU)//(AI) ؛ زاوية AIM | **aksiya-talis** (9) | 01→aksiya-talis ؛ 02→hasiba-muthallathiya | oui | figure |
| 2017 | الجزء الثاني | 08 | 4L→5R | 36–39 | أرض مربعة 324m² ؛ ضلعها ؛ S1 ، S2 بدلالة x ؛ f(x)=12x ، g(x)=−6x+324 ؛ قراءة بيانية | **wadiya-idmajiya-taalufiya** (7) | I-01→muadalat-x-murabba ؛ I-02→muadala-ula ؛ II-01→tamthil-bayani-taalufi ؛ II-02→tafsir-bayani-jumla | oui |  |
| 2018 | التمرين الأول | 03 | 5R | 40–43 | A = 3√8 × √2 طبيعي ؛ B على الشكل a√3 ؛ A/B = 2√3/3 | **amaliyat-judhur** (2) | 01→amaliyat-judhur ؛ 02→tawzif-khawass-judhur ؛ 03→tawzif-khawass-judhur | oui |  |
| 2018 | التمرين الثاني | 03 | 5R | 40–43 | تحقق (3x+1)(x−4) ؛ تحليل E ؛ متراجحة | **tahlil-ibara** (3) | 01→nashr-tabsit ؛ 02→tahlil-ibara ؛ 03→mutarajiha-ula | oui |  |
| 2018 | التمرين الثالث | 03 | 5R | 40–43 | مستطيل AD=6 DC=8 ؛ AC ؛ (EF)//(AC) ؛ زاوية BEF | **aksiya-talis** (9) | 01→hors-4AM ؛ 02→aksiya-talis ؛ 03→hasiba-muthallathiya | oui |  |
| 2018 | التمرين الرابع | 03 | 5R | 40–43 | TIC: TC=12 TI=5 CI=13 ؛ قائم ومساحته ؛ TH | **nisab-muthallathiya** (10) | 01→hors-4AM ؛ 02→nisab-muthallathiya | oui | surtout 3AM (réciproque de Pythagore) |
| 2018 | الجزء الثاني | 08 | 5R | 40–43 | عبد الله ومحمد: 20000+200x و 30000+100x ؛ تمثيل ؛ جملة وتفسيرها البياني | **tafsir-bayani-jumla** (7) | I-01→mafhum-taalufiya ؛ I-02→mafhum-taalufiya ؛ II-01→tamthil-bayani-taalufi ؛ II-02→tafsir-bayani-jumla | oui |  |
| 2019 | التمرين الأول | 02,5 | 5R | 44–47 | A = 9/7 × (10/3 − 1) ؛ B على الشكل a√3 ؛ A/B بمقام ناطق | **tawzif-khawass-judhur** (2) | 01→hors-4AM ؛ 02→tawzif-khawass-judhur ؛ 03→tawzif-khawass-judhur | oui |  |
| 2019 | التمرين الثاني | 03 | 5R→5L | 44–47 | E = (x+1)² − (x+1)(2x−3) ؛ نشر ، تحليل ؛ متراجحة 3x+4 ≥ 6x−2 | **tahlil-ibara** (3) | 01→nashr-tabsit ؛ 02→tahlil-ibara ؛ 03→mutarajiha-ula | oui |  |
| 2019 | التمرين الثالث | 03 | 5L | 44–47 | RST قائم ، sin RTS = 0,8 ، RS = 8cm ؛ TR و ST ؛ MN | **nisab-muthallathiya** (10) | 01→nisab-muthallathiya ؛ 02→talis-hisab-atwal | oui |  |
| 2019 | التمرين الرابع | 03,5 | 5L | 44–47 | A(−1;5) B(2;2) C(−1;−1) ؛ AB و BC ؛ منتصف ؛ دوران 180° ؛ نوع ABCD | **muntasaf-masafa** (12) | 01→murakkibata-shuaa ؛ 02→muntasaf-masafa ؛ 03→muntasaf-masafa ؛ 04→ithbat-khawas-maalam | oui |  |
| 2019 | الجزء الثاني | 08 | 5L | 44–47 | مسبح بلدي: 100DA للحصة أو 80DA + 400DA ؛ عدد الحصص بـ 2800DA ؛ تمثيل | **mafhum-taalufiya** (7) | 01→muadala-ula ؛ 02→tafsir-bayani-jumla | oui |  |
| 2020 | التمرين الأول | 02 | 5L | 48–49 | A كسر غير قابل للاختزال ؛ B = 2√112 − 3√28 + √7 على الشكل a√7 | **tawzif-khawass-judhur** (2) | 01→hors-4AM ؛ 02→tawzif-khawass-judhur | oui | corrigé officiel faux : recopie « + 3√7 » et trouve B = 5√7 ; le sujet (+√7) donne 3√7 — publié official avec le bon calcul |
| 2020 | التمرين الثاني | 03 | 5L | 48–49 | E = (3x+1)² − (x−2)² ؛ نشر ، تحليل ، معادلة | **mutatabiqat-shahira** (3) | 01→mutatabiqat-shahira ؛ 02→tahlil-ibara ؛ 03→jidaa-maadum | oui |  |
| 2020 | التمرين الثالث | 03 | 5L | 48–49 | دائرة قطرها 10cm ، BM = 6cm ؛ نوع MBA و AM ؛ زاوية MBA ؛ BF بطالس | **talis-hisab-atwal** (9) | 01→zawiya-muhitiya ؛ 02→hasiba-muthallathiya ؛ 03→talis-hisab-atwal | oui | figure |
| 2020 | التمرين الرابع | 03,5 | 5L | 48–49 | A(1;2) B(5;−2) C(−1;−3) ؛ مركبتا BC ؛ منتصف [AC] ؛ D حيث BM = MD ؛ نوع ABCD | **hisab-murakkibatay** (12) | 01→murakkibata-shuaa ؛ 02→hisab-murakkibatay ؛ 03→muntasaf-masafa ؛ 04→ithbat-khawas-maalam | oui |  |
| 2020 | الجزء الثاني | 08 | 5L→6R | 48–49 | عمي محمود: أرض 60m × 42m وأشجار ؛ ثمن الشجيرة الأقصى | **bahth-pgcd** (1) | ☜→bahth-pgcd |  | UTILISÉ par le prototype (l5-004) |
| 2021 | التمرين الأول | 03 | 6R | 50–52 | PGCD(567 ; 448) ؛ A و B على الشكل a+b√7 ؛ x/(4+√7) = (4−√7)/x | **bahth-pgcd** (1) | 01→bahth-pgcd ؛ 02→tawzif-khawass-judhur ؛ 03→muadalat-x-murabba | oui | UTILISÉ (extrait 01) ; 02–03 non utilisés |
| 2021 | التمرين الثاني | 03 | 6R | 50–52 | E = (x−3)(x−10) + 3(x−3) ؛ نشر ، تحليل ، معادلة ، E عند 50 | **tahlil-ibara** (3) | 01→nashr-tabsit ؛ 02→tahlil-ibara ؛ 03→jidaa-maadum ؛ 04→nashr-tabsit | oui |  |
| 2021 | التمرين الثالث | 03 | 6R | 50–52 | BEM قائم ، BE = 4,8 ، tan M = 4/3 ؛ BM و ME ؛ (KL)//(BM) | **nisab-muthallathiya** (10) | 01→nisab-muthallathiya ؛ 02→aksiya-talis | oui |  |
| 2021 | التمرين الرابع | 03 | 6R | 50–52 | K(−1;4) L(−5;1) M(1;−3) ؛ مركبتا LK ؛ منتصف [LM] ؛ KLMN متوازي أضلاع | **hisab-murakkibatay** (12) | 01→hisab-murakkibatay ؛ 02→muntasaf-masafa ؛ 03→hisab-murakkibatay | oui |  |
| 2021 | الجزء الثاني | 08 | 6R | 50–52 | طلاء غرفة 5m × 8m × 3m بفتحات ؛ أكبر ثمن لدلو الدهن | **tarrid-mushkila** (4) | ☜→tarrid-mushkila |  | une seule tâche (inéquation) |
| 2022 | التمرين الأول | 03 | 6R | 53–54 | A على الشكل a√5 ؛ B = (2+√2)/√2 بمقام ناطق ؛ B × (√2−1) طبيعي | **wadiya-idmajiya-judhur** (2) | 01→tawzif-khawass-judhur ؛ 02→tawzif-khawass-judhur ؛ 03→amaliyat-judhur | oui | mêle les compétences → synthèse de l’unité 2 |
| 2022 | التمرين الثاني | 03 | 6R | 53–54 | نشر E = (2x−3)(x−2) ؛ تحليل F ؛ معادلة جداء | **tahlil-ibara** (3) | 01→nashr-tabsit ؛ 02→tahlil-ibara ؛ 03→jidaa-maadum | oui |  |
| 2022 | التمرين الثالث | 03 | 6R | 53–54 | أي الثنائيتين حل للجملة ؛ حل جملة x+y=30 ، 2x+5y=45 | **mafhum-jumla** (5) | 01→mafhum-jumla ؛ 02→hall-jabri | oui | 02 : COQUILLE confirmée — le sujet imprime 2x + 5y = 45 (solution (35 ; −5)), le corrigé lit 2x + 5y = 90 (solution (20 ; 10)) ; publié en excerpt (01 seule) dans mafhum-jumla l3-001, signalé au propriétaire |
| 2022 | التمرين الرابع | 03 | 6L | 53–54 | A(3;2) B(1;−2) C(−3;0) ؛ نوع ABC ؛ D بانسحاب ؛ ABCD مربع | **ithbat-khawas-maalam** (12) | 01→muntasaf-masafa ؛ 02→insihab-shuaa ؛ 03→ithbat-khawas-maalam | oui |  |
| 2022 | الجزء الثاني | 08 | 6L | 53–54 | فلاح: 1188 و 528 صندوقًا ؛ ممر بين البطاطا والجزر | **bahth-pgcd** (1) | 01→bahth-pgcd ؛ 02→talis-hisab-atwal | oui | UTILISÉ (extrait 01) ; 02 (Thalès) non utilisé |
| 2023 | التمرين الأول | 03 | 6L | 55–57 | A = 756/216 غير قابل للاختزال ؛ B على الشكل a√3 ؛ B × C = 26√3 | **tawzif-khawass-judhur** (2) | 01→ikhtizal-kasr ؛ 02→tawzif-khawass-judhur ؛ 03→amaliyat-judhur | oui | 01 = unité 1 (counted:false) ; 02 imprimé « a√3 » alors que B = 2√13 (le corrigé calcule 2√13) : NON publié en official, remplacé par « على منوال BEM 2023 » (tawzif l4-003) — signalé au propriétaire |
| 2023 | التمرين الثاني | 03 | 6L | 55–57 | شكل: مربع ضلعه x−2 ومستطيل ؛ مساحتان بدلالة x ؛ E + F = 2x(x−2) ؛ محيط ≥ 20cm | **nashr-tabsit** (3) | 01→nashr-tabsit ؛ 02→nashr-tabsit ؛ 03→mutarajiha-ula | oui | figure |
| 2023 | التمرين الثالث | 03 | 6L | 55–57 | (JK) ⊥ (IM) ؛ IK ؛ موازٍ لـ (JM) ثم NK | **talis-hisab-atwal** (9) | 01→hors-4AM ؛ 02→hors-4AM ؛ 03→talis-hisab-atwal | oui | figure |
| 2023 | التمرين الرابع | 03 | 6L | 55–57 | f(x) = −2x + 3 ؛ x_A و y_B ؛ استقامية D ، O ، C ؛ تمثيل f | **tamthil-bayani-taalufi** (7) | 01→mafhum-taalufiya ؛ 02→tamthil-bayani-taalufi ؛ 03→tamthil-bayani-taalufi | oui |  |
| 2023 | الجزء الثاني | 08 | 7R | 55–57 | روضة أطفال: 1500000DA ؛ عشب اصطناعي وبساط ؛ جملة ؛ ربح أو خسارة المقاول | **mushkilat-jumla** (5) | 01→mushkilat-jumla ؛ 02→tatbiqat-tanasub | oui |  |
| 2024 | التمرين الأول | 03 | 7R | 58–60 | E = 49x² − 16 + (x+3)(7x−4) ؛ تحقق ؛ تحليل ؛ معادلة | **mutatabiqat-shahira** (3) | 01→nashr-tabsit ؛ 02→mutatabiqat-shahira ؛ 03→jidaa-maadum | oui |  |
| 2024 | التمرين الثاني | 03 | 7R | 58–60 | خياط: قماش 270cm × 378cm ؛ مربعات متقايسة | **bahth-pgcd** (1) | 01→bahth-pgcd ؛ 02→bahth-pgcd |  | UTILISÉ par le prototype (l4-005) |
| 2024 | التمرين الثالث | 03 | 7R | 58–60 | R(5;6) S(1;−2) T(−5;1) ؛ TS = 3√5 ، TR = 5√5 ؛ زاوية TRS | **muntasaf-masafa** (12) | 01→murakkibata-shuaa ؛ 02→muntasaf-masafa ؛ 03→hasiba-muthallathiya | oui |  |
| 2024 | التمرين الرابع | 03 | 7R | 58–60 | جملة x+y=90 ، x−1,5y=0 ؛ طالس: OA + OB و OA/OB | **hall-jabri** (5) | 01→hall-jabri ؛ 02→talis-hisab-atwal | oui | figure |
| 2024 | المسألة | 08 | 7R→7L | 58–60 | مكتبة: ثلاثة عروض لاستئجار الكتب 45DA ، 15DA + 600DA ، 1350DA ؛ جدول ؛ تمثيل | **tarrid-taalufi** (7) | 01→mafhum-taalufiya ؛ 02→tarrid-taalufi | oui |  |
| 2025 | التمرين الأول | 03 | 7L | 61–62 | E = x² − 14x − 32 = (x−7)² − 81 ؛ تحليل ؛ E عند √3−2 ؛ E − x² موجبة | **mutatabiqat-shahira** (3) | 01→mutatabiqat-shahira ؛ 02→tahlil-ibara ؛ 03→amaliyat-judhur ؛ 04→mutarajiha-ula | oui |  |
| 2025 | التمرين الثاني | 03 | 7L | 61–62 | PGCD(1352 ; 507) ؛ منتصف [AC] ؛ استقامية مع تمثيل دالة خطية | **bahth-pgcd** (1) | 01→bahth-pgcd ؛ 02→muntasaf-masafa ؛ 03→dala-khattiya | oui | UTILISÉ (extrait 01) ; 02–03 non utilisés |
| 2025 | التمرين الثالث | 03 | 7L | 61–62 | R(3;−1) S(2;3) T(−2;2) ؛ ST ، RT ، RS ؛ نوع RST ؛ K بانسحاب | **muntasaf-masafa** (12) | 01→muntasaf-masafa ؛ 02→ithbat-khawas-maalam ؛ 03→hisab-murakkibatay | oui |  |
| 2025 | التمرين الرابع | 03 | 7L | 61–62 | f تآلفية: H(2;5) و K(3;8) ؛ g(x) = 5x − 7 ؛ تقاطع حسابيًا | **tanasub-taghayyurat** (7) | 01→tanasub-taghayyurat ؛ 02أ→mafhum-taalufiya ؛ 02ب→tafsir-bayani-jumla | oui |  |
| 2025 | الوضعية الإدماجية | 08 | 7L→8 | 61–62 | سباق 8 ماي 1945 ؛ مسافات الفئات الثلاث (طالس ، tan CEF = 0,75) ؛ سرعة | **wadiya-idmajiya-muthallathat** (10) | 1→tarrid-muthallathiya ؛ 2→tatbiqat-tanasub | oui | figure |

## 2. Par leçon (pilote les 50 exercices)

« Cite » = exercices dont la leçon est propriétaire (official / excerpt). « Étapes ailleurs » = étapes de la leçon dans un exercice cité par une AUTRE leçon : à utiliser seulement en `adapted` / « على منوال », jamais en second official.

| Unité | Leçon | Cite (official/excerpt) | n | Étapes ailleurs (modèles) |
|---|---|---|---|---|
| 1 | awwaliyan-fima-baynahuma | — | 0 | — |
| 1 | bahth-pgcd | 2008-I-1, 2010-I-2, 2015-I-1, 2016-I-1, 2020-II, 2021-I-1, 2022-II, 2024-I-2, 2025-I-2 | 9 | 2009-I-4 (02) |
| 1 | ikhtizal-kasr | — | 0 | 2008-I-1 (02), 2015-I-1 (02), 2016-I-1 (02), 2023-I-1 (01) |
| 1 | khawass-qawasim | — | 0 | — |
| 1 | qasim-adad-tabii | — | 0 | — |
| 1 | qasim-mushtarak-akbar | — | 0 | — |
| 1 | qawasim-adad-tabii | — | 0 | — |
| 1 | tayin-pgcd | — | 0 | — |
| 1 | wadiya-idmajiya-aadad | — | 0 | — |
| 2 | amaliyat-judhur | 2013-I-1, 2018-I-1 | 2 | 2008-I-2 (02أ), 2009-I-1 (02), 2011-I-2 (02), 2012-I-1 (02), 2015-I-2 (04), 2017-I-1 (03), 2022-I-1 (03), 2023-I-1 (03), 2025-I-1 (03) |
| 2 | jidhr-tarbii | — | 0 | — |
| 2 | muadalat-x-murabba | — | 0 | 2008-II (01), 2015-II (☜), 2017-II (I-01), 2021-I-1 (03) |
| 2 | natiqa-ghayr-natiqa | — | 0 | 2013-I-2 (01أ) |
| 2 | tawzif-khawass-judhur | 2007-I-1, 2009-I-1, 2011-I-2, 2014-I-1, 2017-I-1, 2019-I-1, 2020-I-1, 2023-I-1 | 8 | 2012-I-1 (01), 2012-I-1 (03), 2016-I-1 (03), 2018-I-1 (02), 2018-I-1 (03), 2021-I-1 (02), 2022-I-1 (01), 2022-I-1 (02) |
| 2 | wadiya-idmajiya-judhur | 2012-I-1, 2022-I-1 | 2 | — |
| 3 | mutatabiqat-shahira | 2014-I-2, 2015-I-2, 2020-I-2, 2024-I-1, 2025-I-1 | 5 | 2008-I-2 (01), 2016-I-2 (01) |
| 3 | nashr-tabsit | 2017-I-2, 2023-I-2 | 2 | 2007-I-2 (01), 2009-I-2 (01), 2011-I-1 (01), 2012-I-2 (01), 2018-I-2 (01), 2019-I-2 (01), 2021-I-2 (01), 2021-I-2 (04), 2022-I-2 (01), 2024-I-1 (01) |
| 3 | tahlil-ibara | 2007-I-2, 2008-I-2, 2009-I-2, 2011-I-1, 2012-I-2, 2013-I-2, 2016-I-2, 2018-I-2, 2019-I-2, 2021-I-2, 2022-I-2 | 11 | 2014-I-2 (02), 2015-I-2 (02), 2017-I-2 (02), 2020-I-2 (02), 2025-I-1 (02) |
| 3 | wadiya-idmajiya-harfi | — | 0 | — |
| 4 | jidaa-maadum | — | 0 | 2007-I-2 (03), 2008-I-2 (02ج), 2009-I-2 (03), 2011-I-1 (03), 2012-I-2 (03), 2014-I-2 (03), 2015-I-2 (03), 2017-I-2 (03), 2020-I-2 (03), 2021-I-2 (03), 2022-I-2 (03), 2024-I-1 (03) |
| 4 | muadala-ula | 2010-I-1 | 1 | 2010-II (01), 2015-II (01), 2017-II (I-02), 2019-II (01) |
| 4 | mutarajiha-ula | — | 0 | 2007-II (02), 2012-I-2 (04), 2013-I-2 (01ب), 2016-I-2 (03), 2018-I-2 (03), 2019-I-2 (03), 2023-I-2 (03), 2025-I-1 (04) |
| 4 | tarrid-mushkila | 2008-II, 2021-II | 2 | — |
| 4 | wadiya-idmajiya-muadalat | — | 0 | — |
| 5 | hall-jabri | 2024-I-4 | 1 | 2007-I-3 (01), 2009-I-4 (01), 2022-I-3 (02) |
| 5 | mafhum-jumla | 2022-I-3 | 1 | — |
| 5 | mushkilat-jumla | 2007-I-3, 2009-I-4, 2023-II | 3 | — |
| 5 | wadiya-idmajiya-jumal | — | 0 | — |
| 6 | dala-khattiya | — | 0 | 2007-II (01), 2009-II (02), 2014-II (01), 2025-I-2 (03) |
| 6 | tamthil-bayani-khatti | — | 0 | — |
| 6 | tanasub-muamil | — | 0 | — |
| 6 | tarrid-khatti | — | 0 | — |
| 6 | tatbiqat-tanasub | — | 0 | 2016-II (II-02), 2023-II (02), 2025-II (2) |
| 6 | wadiya-idmajiya-khattiya | — | 0 | — |
| 7 | mafhum-taalufiya | 2019-II | 1 | 2012-II (01), 2013-II (02), 2014-II (02), 2016-I-3 (02), 2016-I-3 (03), 2018-II (I-01), 2018-II (I-02), 2023-I-4 (01), 2024-II (01), 2025-I-4 (02أ) |
| 7 | tafsir-bayani-jumla | 2009-II, 2014-II, 2015-II, 2018-II | 4 | 2007-II (03), 2008-I-4 (03ب), 2012-II (04), 2013-II (04), 2017-II (II-02), 2019-II (02), 2025-I-4 (02ب) |
| 7 | tamthil-bayani-taalufi | 2012-II, 2023-I-4 | 2 | 2008-I-4 (03أ), 2011-II (02), 2013-II (03), 2014-II (03), 2017-II (II-01), 2018-II (II-01) |
| 7 | tanasub-taghayyurat | 2008-I-4, 2016-I-3, 2025-I-4 | 3 | — |
| 7 | tarrid-taalufi | 2007-II, 2011-II, 2013-II, 2024-II | 4 | 2012-II (05) |
| 7 | wadiya-idmajiya-taalufiya | 2017-II | 1 | — |
| 8 | mada-wasit-mutawassit | — | 0 | — |
| 8 | majdulat-ihsaiya | — | 0 | — |
| 8 | qiraat-wadiyat-ihsaiya | — | 0 | — |
| 8 | takrar-mujamma | — | 0 | — |
| 8 | wadiya-idmajiya-ihsa | — | 0 | — |
| 9 | aksiya-talis | 2007-I-4, 2015-I-4, 2017-I-4, 2018-I-3 | 4 | 2021-I-3 (02) |
| 9 | inshaat-talis | — | 0 | — |
| 9 | talis-hisab-atwal | 2008-I-3, 2010-I-4, 2013-I-3, 2020-I-3, 2023-I-3 | 5 | 2012-I-3 (02), 2016-II (I-01), 2016-II (I-02), 2019-I-3 (02), 2022-II (02), 2024-I-4 (02) |
| 9 | wadiya-idmajiya-talis | 2016-II | 1 | — |
| 10 | alaqat-muthallathiya | — | 0 | — |
| 10 | hasiba-muthallathiya | — | 0 | 2008-I-3 (02ب), 2013-I-3 (02), 2014-I-3 (01), 2015-I-3 (03), 2016-II (I-03), 2017-I-4 (02), 2018-I-3 (03), 2020-I-3 (02), 2024-I-3 (03) |
| 10 | nisab-muthallathiya | 2011-I-3, 2018-I-4, 2019-I-3, 2021-I-3 | 4 | — |
| 10 | tarrid-muthallathiya | 2010-II, 2014-I-3 | 2 | 2025-II (1) |
| 10 | wadiya-idmajiya-muthallathat | 2025-II | 1 | — |
| 11 | barahin-ashia | 2016-I-4 | 1 | 2014-I-4 (03) |
| 11 | insihab-shuaa | — | 0 | 2016-I-4 (02), 2022-I-4 (02) |
| 11 | majmu-shuaayn | — | 0 | 2016-I-4 (04) |
| 11 | shuaayn-mutasawiyayn | — | 0 | — |
| 11 | wadiya-idmajiya-ashia | — | 0 | — |
| 12 | hisab-murakkibatay | 2013-I-4, 2020-I-4, 2021-I-4 | 3 | 2012-I-4 (03), 2025-I-3 (03) |
| 12 | ithbat-khawas-maalam | 2010-I-3, 2011-I-4, 2012-I-4, 2022-I-4 | 4 | 2013-I-4 (04), 2017-I-3 (04), 2019-I-4 (04), 2020-I-4 (04), 2025-I-3 (02) |
| 12 | muntasaf-masafa | 2014-I-4, 2017-I-3, 2019-I-4, 2024-I-3, 2025-I-3 | 5 | 2010-I-3 (02), 2012-I-4 (02), 2020-I-4 (03), 2021-I-4 (02), 2022-I-4 (01), 2025-I-2 (02) |
| 12 | murakkibata-shuaa | — | 0 | 2008-I-4 (01), 2010-I-3 (01), 2011-I-4 (01), 2012-I-4 (01), 2013-I-4 (01), 2014-I-4 (01), 2017-I-3 (01), 2019-I-4 (01), 2020-I-4 (01), 2024-I-3 (01) |
| 12 | wadiya-idmajiya-maalam | — | 0 | — |
| 13 | khawas-dawaran | — | 0 | 2009-I-3 (02), 2016-II (II-01) |
| 13 | mafhum-dawaran | 2009-I-3 | 1 | 2017-I-3 (03) |
| 13 | mudalaat-muntazama | — | 0 | — |
| 13 | wadiya-idmajiya-dawaran | — | 0 | — |
| 13 | zawiya-muhitiya | 2012-I-3, 2015-I-3 | 2 | 2020-I-3 (01) |
| 14 | kura-julla | — | 0 | — |
| 14 | maqati-mustawiya | — | 0 | — |
| 14 | misaha-hajm-kura | — | 0 | — |
| 14 | takbir-tasghir | — | 0 | — |
| 14 | wadiya-idmajiya-fada | — | 0 | — |

## 3. Constats

- **Leçons sans aucun exercice d’annales (32)** : awwaliyan-fima-baynahuma, khawass-qawasim, qasim-adad-tabii, qasim-mushtarak-akbar, qawasim-adad-tabii, tayin-pgcd, wadiya-idmajiya-aadad, jidhr-tarbii, wadiya-idmajiya-harfi, wadiya-idmajiya-muadalat, wadiya-idmajiya-jumal, tamthil-bayani-khatti, tanasub-muamil, tarrid-khatti, wadiya-idmajiya-khattiya, mada-wasit-mutawassit, majdulat-ihsaiya, qiraat-wadiyat-ihsaiya, takrar-mujamma, wadiya-idmajiya-ihsa, inshaat-talis, alaqat-muthallathiya, shuaayn-mutasawiyayn, wadiya-idmajiya-ashia, wadiya-idmajiya-maalam, mudalaat-muntazama, wadiya-idmajiya-dawaran, kura-julla, maqati-mustawiya, misaha-hajm-kura, takbir-tasghir, wadiya-idmajiya-fada. Toute l’unité 8 (الإحصاء) et toute l’unité 14 (الهندسة في الفضاء) sont absentes du corpus 2007–2025 ; les المضلعات المنتظمة aussi. Pour elles, seul « على منوال BEM » (style) est possible, sans énoncé officiel.
- **Très concentré** : chaque session ouvre sur les racines (→ tawzif-khawass-judhur) puis le calcul littéral (→ tahlil-ibara / mutatabiqat-shahira) ; le الجزء الثاني est presque toujours une comparaison de tarifs (→ unité 7).
- **Déjà utilisés par le prototype bahth-pgcd** : 2008 I-1, 2010 I-2, 2015 I-1, 2016 I-1 (01–02), 2020 II, 2021 I-1 (01), 2022 II (01), 2024 I-2, 2025 I-2 (01). Leurs étapes NON utilisées (2016 I-1 03, 2021 I-1 02–03, 2022 II 02, 2025 I-2 02–03) restent propriété de bahth-pgcd : ne pas les re-citer sans accord du propriétaire.
- **À vérifier contre le corrigé** : 2022 I-3 02 (x + y = 30 ; 2x + 5y = 45 donne y = −5) — lire la page du corrigé avant d’écrire l’exercice ; tout désaccord avec l’oracle est rapporté au propriétaire.
- **Ancien programme** : les sessions 2007–2019 sont antérieures au programme de 2e génération (BEM 2020 et après). Les thèmes restent tous au programme actuel de 4AM ; ce qui sort de 4AM est marqué `hors-4AM` étape par étape (Pythagore et sa réciproque, calcul fractionnaire, écriture scientifique, aires/volumes 3AM).
- **Figures** : sujets avec figure à redessiner (dz-textbook-figure-redesign) : 2008 II, 2010 I-4, 2010 II, 2014 I-3, 2015 I-3, 2015 I-4, 2015 II, 2016 II, 2017 I-4, 2017 II, 2018 I-3, 2020 I-3, 2022 II, 2023 I-2, 2023 I-3, 2024 I-4, 2025 II.
