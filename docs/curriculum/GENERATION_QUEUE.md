# File de génération des leçons 1AM–3AM

> **Généré** par `scripts/learning-net-queue.mjs` depuis le réseau des الكفاءات — ne pas éditer à la main.
> Priorité (propriétaire, 2026-10-25) — **Phase 0** : les leçons restantes des unités 3AM 1–5, plans par leçon dans
> `docs/curriculum/PLAN_3AM_UNITS_1_5.md`.
> Règle (propriétaire, 2026-10-20) — **Phase A d’abord** : ce dont l’élève de 4AM a besoin MAINTENANT. Les unités 4AM dans
> l’ordre du manuel ; pour chaque leçon, ses prérequis DIRECTS des années antérieures, pris dans l’année la plus récente
> (3AM, sinon 2AM, sinon 1AM). Ensuite (règle du 2026-10-13) : les chaînes complètes des leçons 4AM, de la plus ancienne
> à la plus récente ; puis depuis les leçons 3AM restantes, 2AM, 1AM ; les leçons isolées en dernier ; chaque synthèse
> juste après la dernière leçon de son unité. Contrat : `docs/architecture/LEARNING_NET.md` §4bis.

**130** leçons à générer (30 synthèses).

## Phase A — ce dont la 4AM a besoin maintenant, unité par unité (21)

### Unité 4AM 1 — الأعداد الطبيعيّة والأعداد النّاطقة (0) — rien à générer : ses prérequis directs sont publiés ou déjà dans la file.

### Unité 4AM 2 — الحساب على الجذور (0) — rien à générer : ses prérequis directs sont publiés ou déjà dans la file.

### Unité 4AM 3 — الحساب الحرفي (0) — rien à générer : ses prérequis directs sont publiés ou déjà dans la file.

### Unité 4AM 4 — معادلات ومتراجحات من الدرجة الأولى بمجهول واحد (0) — rien à générer : ses prérequis directs sont publiés ou déjà dans la file.

### Unité 4AM 5 — جمل معادلتين من الدرجة الأولى بمجهولين (0) — rien à générer : ses prérequis directs sont publiés ou déjà dans la file.

### Unité 4AM 6 — الدالة الخطية والتناسبية (2)

| # | leçon | السنة | unité | déclenchée par |
|---:|---|---|---|---|
| 1 | `haraka-muntazama-sura` — الحركة المنتظمة والسرعة المتوسطة | السنة الثالثة متوسط | `tanasubiya-sura` | `tatbiqat-tanasub` |
| 2 | `wadiya-idmajiya-tanasubiya-sura` — أدمج تعلّماتي — التناسبية _(synthèse)_ | السنة الثالثة متوسط | `tanasubiya-sura` | unité tanasubiya-sura complète |

### Unité 4AM 7 — الدالة التآلفية (0) — rien à générer : ses prérequis directs sont publiés ou déjà dans la file.

### Unité 4AM 8 — الإحصاء (2)

| # | leçon | السنة | unité | déclenchée par |
|---:|---|---|---|---|
| 3 | `fiat-takrarat` — تجميع المعطيات في فئات والتكرارات | السنة الثالثة متوسط | `tanzim-mutaayat` | `takrar-mujamma` |
| 4 | `mutawassit-mutawazin` — متوسط سلسلة إحصائية والمتوسط المتوازن | السنة الثالثة متوسط | `tanzim-mutaayat` | `mada-wasit-mutawassit` |

### Unité 4AM 9 — خاصية طالس (1)

| # | leçon | السنة | unité | déclenchée par |
|---:|---|---|---|---|
| 5 | `tanasub-atwal-muthallath` — تناسبية الأطوال في المثلث | السنة الثالثة متوسط | `muthallathat-3am` | `talis-hisab-atwal` |

### Unité 4AM 10 — حساب المثلثات في المثلث القائم (3)

| # | leçon | السنة | unité | déclenchée par |
|---:|---|---|---|---|
| 6 | `jayb-tamam-zawiya` — جيب تمام زاوية حادة | السنة الثالثة متوسط | `fitaghuras-jayb-tamam` | `nisab-muthallathiya` |
| 7 | `hisab-jayb-tamam` — حساب جيب التمام وتوظيفه | السنة الثالثة متوسط | `fitaghuras-jayb-tamam` | `hasiba-muthallathiya` |
| 8 | `mustaqimat-mutaamida-mutawazia` — إنشاء مستقيمات متعامدة ومتوازية | السنة الثانية متوسط | `inshaat-handasiya` | `alaqat-muthallathiya` |

### Unité 4AM 11 — الأشعة والانسحاب (2)

| # | leçon | السنة | unité | déclenchée par |
|---:|---|---|---|---|
| 9 | `suwar-ashkal-insihab` — صور الأشكال بانسحاب وخواصه | السنة الثالثة متوسط | `insihab-3am` | `insihab-shuaa` |
| 10 | `tarif-mutawazi-adla` — التعرّف على متوازي الأضلاع | السنة الثانية متوسط | `mutawazi-adla` | `shuaayn-mutasawiyayn` |

### Unité 4AM 12 — الأشعة في معلم (0) — rien à générer : ses prérequis directs sont publiés ou déjà dans la file.

### Unité 4AM 13 — الدوران - الزوايا - المضلّعات المنتظمة (4)

| # | leçon | السنة | unité | déclenchée par |
|---:|---|---|---|---|
| 11 | `qays-zawiya-minqala` — قيس زاوية بالمنقلة ورسم زاوية علم قيسها | السنة الأولى متوسط | `zawaya-qiyas` | `mafhum-dawaran` |
| 12 | `daira-mustalahat` — الدائرة: تسميات وتعاريف | السنة الأولى متوسط | `ashkal-mustawiya` | `zawiya-muhitiya` |
| 13 | `mudallaat-zawiya` — المضلّعات والزاوية | السنة الأولى متوسط | `ashkal-mustawiya` | `zawiya-muhitiya` |
| 14 | `majmu-zawaya-muthallath` — مجموع أقياس زوايا مثلث | السنة الثانية متوسط | `muthallath-daira` | `zawiya-muhitiya` |

### Unité 4AM 14 — الهندسة في الفضاء (7)

| # | leçon | السنة | unité | déclenchée par |
|---:|---|---|---|---|
| 15 | `manzur-mutasawi-qiyas` — التمثيل بالمنظور متساوي القياس | السنة الأولى متوسط | `mutawazi-mustatilat` | `kura-julla` |
| 16 | `ustuwana-dawaran-wasf` — أسطوانة الدوران: الوصف والتصميم والمساحة الجانبية | السنة الثانية متوسط | `mawshur-ustuwana` | `kura-julla` |
| 17 | `masahat-qurs` — مساحة القرص | السنة الثانية متوسط | `muthallath-daira` | `misaha-hajm-kura` |
| 18 | `mawshur-qaim-wasf` — الموشور القائم: الوصف والتصميم والمساحة الجانبية | السنة الثانية متوسط | `mawshur-ustuwana` | `maqati-mustawiya` |
| 19 | `wasf-tamthil-haram` — وصف الهرم وتمثيله وتصميمه | السنة الثالثة متوسط | `haram-makhrut` | `maqati-mustawiya` |
| 20 | `miqyas-kharita-mukhattat` — المقياس: الخرائط والمخططات | السنة الأولى متوسط | `tanasubiya-nisab-maqayis` | `takbir-tasghir` |
| 21 | `hajm-haram` — حجم الهرم | السنة الثالثة متوسط | `haram-makhrut` | `takbir-tasghir` |

## Phase B — les chaînes complètes des leçons 4AM (39)

| # | leçon | السنة | unité | déclenchée par |
|---:|---|---|---|---|
| 22 | `mustatil-murabba-masaha` — محيط ومساحة المستطيل والمربع | السنة الأولى متوسط | `sutuh-masahat-muhitat` | `jidhr-tarbii` |
| 23 | `wadiyat-tanasubiya` — وضعيات تناسبية وجداول تناسبية | السنة الأولى متوسط | `tanasubiya-nisab-maqayis` | `tanasub-muamil` |
| 24 | `itmam-jadwal-tanasubiya` — إتمام جدول تناسبية | السنة الأولى متوسط | `tanasubiya-nisab-maqayis` | `tanasub-muamil` |
| 25 | `wadiya-tanasubiya-jadwal` — التعرّف على وضعية تناسبية من جدول | السنة الثانية متوسط | `tanasubiya-2am` | `tanasub-muamil` |
| 26 | `nisba-miawiya-tatbiq` — تطبيق نسبة مئوية | السنة الأولى متوسط | `tanasubiya-nisab-maqayis` | `tatbiqat-tanasub` |
| 27 | `wahdat-tul-masaha` — وحدات الطول ووحدات المساحة | السنة الأولى متوسط | `sutuh-masahat-muhitat` | `tatbiqat-tanasub` |
| 28 | `nisba-miawiya` — حساب نسبة مئوية وتوظيفها | السنة الثانية متوسط | `tanasubiya-2am` | `tatbiqat-tanasub` |
| 29 | `miqyas-kharita` — مقياس خريطة أو تصميم | السنة الثانية متوسط | `tanasubiya-2am` | `tatbiqat-tanasub` |
| 30 | `wadiya-idmajiya-tanasubiya-2am` — أدمج تعلّماتي — التناسبية _(synthèse)_ | السنة الثانية متوسط | `tanasubiya-2am` | unité tanasubiya-2am complète |
| 31 | `tanzim-muatayat-jadwal` — تنظيم معطيات في جدول | السنة الأولى متوسط | `tanzim-muatayat` | `takrar-mujamma` |
| 32 | `qiraat-jadwal-malumat` — قراءة جدول واستخراج معلومات | السنة الأولى متوسط | `tanzim-muatayat` | `takrar-mujamma` |
| 33 | `takrarat-nisbiya` — التكرارات والتكرارات النسبية | السنة الثانية متوسط | `tanzim-mutayat-2am` | `takrar-mujamma` |
| 34 | `mustaqim-qita-istiqamiya` — المستقيم ونصف المستقيم وقطعة المستقيم والاستقامية | السنة الأولى متوسط | `tawazi-taamud` | `majdulat-ihsaiya` |
| 35 | `tasnif-zawaya-munassif` — مقارنة الزوايا وتصنيفها ومنصّف زاوية | السنة الأولى متوسط | `zawaya-qiyas` | `majdulat-ihsaiya` |
| 36 | `tamthil-mukhattatat` — تمثيل معطيات إحصائية بمخطّطات | السنة الثانية متوسط | `tanzim-mutayat-2am` | `majdulat-ihsaiya` |
| 37 | `tanzim-fiat` — تلخيص سلسلة إحصائية في شكل فئات | السنة الثانية متوسط | `tanzim-mutayat-2am` | `majdulat-ihsaiya` |
| 38 | `tamthil-silsila-ihsaiya` — تمثيل سلسلة إحصائية بمخطط أو بيان | السنة الثالثة متوسط | `tanzim-mutaayat` | `majdulat-ihsaiya` |
| 39 | `wadiya-idmajiya-tanzim-mutaayat` — أدمج تعلّماتي — تنظيم معطيات _(synthèse)_ | السنة الثالثة متوسط | `tanzim-mutaayat` | unité tanzim-mutaayat complète |
| 40 | `mustaqimat-mutaamida` — المستقيمان المتقاطعان والمتعامدان | السنة الأولى متوسط | `tawazi-taamud` | `talis-hisab-atwal` |
| 41 | `ashkal-mutanazira` — الأشكال المتناظرة بالنسبة إلى مستقيم | السنة الأولى متوسط | `tanazur-mihwari` | `talis-hisab-atwal` |
| 42 | `nazir-shakl-khawas` — نظير شكل وخواص التناظر المحوري | السنة الأولى متوسط | `tanazur-mihwari` | `talis-hisab-atwal` |
| 43 | `markaz-tanazur-shakl` — مركز تناظر شكل | السنة الثانية متوسط | `tanazur-markazi` | `talis-hisab-atwal` |
| 44 | `nazir-shakl-khawas-2` — نظير شكل وخواص التناظر المركزي | السنة الثانية متوسط | `tanazur-markazi` | `talis-hisab-atwal` |
| 45 | `nazirat-nuqta` — التناظر المركزي ونظيرة نقطة | السنة الثانية متوسط | `tanazur-markazi` | `talis-hisab-atwal` |
| 46 | `wadiya-idmajiya-tanazur-markazi` — أدمج تعلّماتي — التناظر المركزي _(synthèse)_ | السنة الثانية متوسط | `tanazur-markazi` | unité tanazur-markazi complète |
| 47 | `zawaya-mutajawira-mutatamma` — زاويتان متجاورتان، متتامتان، متكاملتان | السنة الثانية متوسط | `zawaya-tawazi` | `talis-hisab-atwal` |
| 48 | `tawazi-zawaya` — التوازي والزوايا | السنة الثانية متوسط | `zawaya-tawazi` | `talis-hisab-atwal` |
| 49 | `mustaqim-muntasafayn` — مستقيم المنتصفين في مثلث | السنة الثالثة متوسط | `muthallathat-3am` | `talis-hisab-atwal` |
| 50 | `naql-tul-muntasaf` — نقل طول ومنتصف قطعة مستقيم | السنة الأولى متوسط | `tawazi-taamud` | `alaqat-muthallathiya` |
| 51 | `tarif-insihab` — الانسحاب ومتوازي الأضلاع | السنة الثالثة متوسط | `insihab-3am` | `insihab-shuaa` |
| 52 | `sura-nuqta-insihab` — إنشاء صورة نقطة بانسحاب | السنة الثالثة متوسط | `insihab-3am` | `insihab-shuaa` |
| 53 | `wadiya-idmajiya-insihab-3am` — أدمج تعلّماتي — الانسحاب _(synthèse)_ | السنة الثالثة متوسط | `insihab-3am` | unité insihab-3am complète |
| 54 | `wasf-mutawazi-mustatilat` — وصف متوازي المستطيلات والمكعب | السنة الأولى متوسط | `mutawazi-mustatilat` | `kura-julla` |
| 55 | `muhit-qurs` — محيط القرص والعدد π | السنة الأولى متوسط | `sutuh-masahat-muhitat` | `misaha-hajm-kura` |
| 56 | `masahat-muthallath-qaim` — مساحة المثلث القائم | السنة الأولى متوسط | `sutuh-masahat-muhitat` | `takbir-tasghir` |
| 57 | `wadiya-idmajiya-sutuh-masahat-muhitat` — أدمج تعلّماتي — السطوح المستوية: الأطوال، المحيطات، المساحات _(synthèse)_ | السنة الأولى متوسط | `sutuh-masahat-muhitat` | unité sutuh-masahat-muhitat complète |
| 58 | `hajm-mutawazi-mustatilat` — حجم متوازي المستطيلات ووحدات الحجوم | السنة الأولى متوسط | `mutawazi-mustatilat` | `takbir-tasghir` |
| 59 | `masahat-muthallath` — مساحة المثلث | السنة الثانية متوسط | `muthallath-daira` | `takbir-tasghir` |
| 60 | `hajm-mawshur-qaim` — حجم الموشور القائم | السنة الثانية متوسط | `mawshur-ustuwana` | `takbir-tasghir` |

## Phase C — depuis les leçons 3AM restantes (22)

| # | leçon | السنة | unité | déclenchée par |
|---:|---|---|---|---|
| 61 | `rutbat-miqdar-jam` — رتبة مقدار مجموع وفرق | السنة الأولى متوسط | `jam-tarh-ashriya` | `kitaba-ilmiya-rutba` |
| 62 | `hasr-qiyam-muqarraba` — حصر عدد عشري وقيمه المقرّبة | السنة الأولى متوسط | `adad-tabiiya-ashriya` | `hasr-adad-ushri` |
| 63 | `wadiya-idmajiya-adad-tabiiya-ashriya` — أدمج تعلّماتي — الأعداد الطبيعية والأعداد العشرية _(synthèse)_ | السنة الأولى متوسط | `adad-tabiiya-ashriya` | unité adad-tabiiya-ashriya complète |
| 64 | `insha-muthallath-mutabayina` — المتباينة المثلثية وإنشاء مثلثات | السنة الثانية متوسط | `muthallath-daira` | `taqayus-muthallathat` |
| 65 | `taqayus-muthallathat` — المثلثات المتقايسة | السنة الثالثة متوسط | `muthallathat-3am` | `taqayus-muthallathat` |
| 66 | `daira-muhita-muthallath` — الدائرة المحيطة بمثلث | السنة الثانية متوسط | `muthallath-daira` | `mahawir-munassifat` |
| 67 | `wadiya-idmajiya-muthallath-daira` — أدمج تعلّماتي — المثلث والدائرة _(synthèse)_ | السنة الثانية متوسط | `muthallath-daira` | unité muthallath-daira complète |
| 68 | `mahawir-munassifat` — بعد نقطة عن مستقيم، المحاور والمنصفات | السنة الثالثة متوسط | `muthallathat-3am` | `mahawir-munassifat` |
| 69 | `mutawassitat-irtifaat` — المتوسطات والارتفاعات في المثلث | السنة الثالثة متوسط | `muthallathat-3am` | `mutawassitat-irtifaat` |
| 70 | `mahawir-tanazur-ashkal` — محاور تناظر الأشكال المألوفة | السنة الأولى متوسط | `tanazur-mihwari` | `daira-muhita-qaim` |
| 71 | `mutawaziyat-adla-khassa` — متوازيات الأضلاع الخاصة | السنة الثانية متوسط | `mutawazi-adla` | `daira-muhita-qaim` |
| 72 | `daira-muhita-qaim` — الدائرة المحيطة بالمثلث القائم | السنة الثالثة متوسط | `muthallath-qaim-daira` | `daira-muhita-qaim` |
| 73 | `awda-daira-mustaqim` — الأوضاع النسبية لدائرة ومستقيم | السنة الثالثة متوسط | `muthallath-qaim-daira` | `awda-daira-mustaqim` |
| 74 | `mumass-daira` — مماس دائرة في نقطة منها | السنة الثالثة متوسط | `muthallath-qaim-daira` | `mumass-daira` |
| 75 | `wadiya-idmajiya-muthallath-qaim-daira` — أدمج تعلّماتي — المثلث القائم والدائرة _(synthèse)_ | السنة الثالثة متوسط | `muthallath-qaim-daira` | unité muthallath-qaim-daira complète |
| 76 | `aksiya-fitaghuras` — الخاصية العكسية لفيثاغورس | السنة الثالثة متوسط | `fitaghuras-jayb-tamam` | `aksiya-fitaghuras` |
| 77 | `wadiya-idmajiya-fitaghuras-jayb-tamam` — أدمج تعلّماتي — خاصية فيثاغورس، جيب تمام زاوية _(synthèse)_ | السنة الثالثة متوسط | `fitaghuras-jayb-tamam` | unité fitaghuras-jayb-tamam complète |
| 78 | `tasmim-mutawazi-mustatilat` — تصميم متوازي المستطيلات وصنعه | السنة الأولى متوسط | `mutawazi-mustatilat` | `wasf-tamthil-haram` |
| 79 | `wadiya-idmajiya-mutawazi-mustatilat` — أدمج تعلّماتي — متوازي المستطيلات والمكعب _(synthèse)_ | السنة الأولى متوسط | `mutawazi-mustatilat` | unité mutawazi-mustatilat complète |
| 80 | `wasf-tamthil-makhrut` — وصف مخروط الدوران وتمثيله وتصميمه | السنة الثالثة متوسط | `haram-makhrut` | `wasf-tamthil-makhrut` |
| 81 | `hajm-makhrut` — حجم مخروط الدوران | السنة الثالثة متوسط | `haram-makhrut` | `hajm-makhrut` |
| 82 | `wadiya-idmajiya-haram-makhrut` — أدمج تعلّماتي — الهرم و مخروط الدوران _(synthèse)_ | السنة الثالثة متوسط | `haram-makhrut` | unité haram-makhrut complète |

## Phase D — depuis les leçons 2AM restantes (18)

| # | leçon | السنة | unité | déclenchée par |
|---:|---|---|---|---|
| 83 | `qisma-ashriya-taqrib` — القسمة العشرية والقيمة المقرّبة لحاصل قسمة | السنة الأولى متوسط | `darb-qisma-ashriya` | `qisma-iqlidiya-hasr` |
| 84 | `qiraat-mutayat-ihsaiya` — قراءة معطيات إحصائية وتفسيرها | السنة الثانية متوسط | `tanzim-mutayat-2am` | `qiraat-mutayat-ihsaiya` |
| 85 | `wadiya-idmajiya-tanzim-mutayat-2am` — أدمج تعلّماتي — تنظيم معطيات _(synthèse)_ | السنة الثانية متوسط | `tanzim-mutayat-2am` | unité tanzim-mutayat-2am complète |
| 86 | `mihwar-qita-insha` — إنشاء محور قطعة مستقيم | السنة الثانية متوسط | `inshaat-handasiya` | `mihwar-qita-insha` |
| 87 | `munassif-zawiya-insha` — إنشاء منصّف زاوية | السنة الثانية متوسط | `inshaat-handasiya` | `munassif-zawiya-insha` |
| 88 | `muthallathat-khassa-insha` — إنشاء مثلثات خاصة | السنة الثانية متوسط | `inshaat-handasiya` | `muthallathat-khassa-insha` |
| 89 | `rubaiyat-khassa-insha` — إنشاء مستطيل، مربع، معيّن | السنة الثانية متوسط | `inshaat-handasiya` | `rubaiyat-khassa-insha` |
| 90 | `daira-qaws-insha` — إنشاء دائرة وقوس دائرة | السنة الثانية متوسط | `inshaat-handasiya` | `daira-qaws-insha` |
| 91 | `wadiya-idmajiya-inshaat-handasiya` — أدمج تعلّماتي — إنشاء أشكال هندسية بسيطة _(synthèse)_ | السنة الثانية متوسط | `inshaat-handasiya` | unité inshaat-handasiya complète |
| 92 | `zawaya-mutaqabila-ras` — الزاويتان المتقابلتان بالرأس | السنة الثانية متوسط | `zawaya-tawazi` | `zawaya-mutaqabila-ras` |
| 93 | `zawaya-mutabadila-mutamathila` — الزاويتان المتبادلتان داخليا والمتماثلتان | السنة الثانية متوسط | `zawaya-tawazi` | `zawaya-mutabadila-mutamathila` |
| 94 | `wadiya-idmajiya-zawaya-tawazi` — أدمج تعلّماتي — الزوايا والتوازي _(synthèse)_ | السنة الثانية متوسط | `zawaya-tawazi` | unité zawaya-tawazi complète |
| 95 | `khawas-mutawazi-adla` — خواص متوازي الأضلاع | السنة الثانية متوسط | `mutawazi-adla` | `khawas-mutawazi-adla` |
| 96 | `masahat-mutawazi-adla` — مساحة متوازي الأضلاع | السنة الثانية متوسط | `mutawazi-adla` | `masahat-mutawazi-adla` |
| 97 | `wadiya-idmajiya-mutawazi-adla` — أدمج تعلّماتي — متوازي الأضلاع _(synthèse)_ | السنة الثانية متوسط | `mutawazi-adla` | unité mutawazi-adla complète |
| 98 | `mutawazi-mustatilat-hajm-saa` — متوازي المستطيلات: التمثيل والتصميم والحجم والسعة | السنة الثانية متوسط | `mawshur-ustuwana` | `mutawazi-mustatilat-hajm-saa` |
| 99 | `hajm-ustuwana-dawaran` — حجم أسطوانة الدوران | السنة الثانية متوسط | `mawshur-ustuwana` | `hajm-ustuwana-dawaran` |
| 100 | `wadiya-idmajiya-mawshur-ustuwana` — أدمج تعلّماتي — الموشور القائم وأسطوانة الدوران _(synthèse)_ | السنة الثانية متوسط | `mawshur-ustuwana` | unité mawshur-ustuwana complète |

## Phase E — leçons 1AM restantes (24)

| # | leçon | السنة | unité | déclenchée par |
|---:|---|---|---|---|
| 101 | `injaz-jam-tarh-mudad` — إنجاز عمليات الجمع والطرح والحساب على المدد | السنة الأولى متوسط | `jam-tarh-ashriya` | `injaz-jam-tarh-mudad` |
| 102 | `wadiya-idmajiya-jam-tarh-ashriya` — أدمج تعلّماتي — الحساب على الأعداد الطبيعية والأعداد العشرية: الجمع والطرح _(synthèse)_ | السنة الأولى متوسط | `jam-tarh-ashriya` | unité jam-tarh-ashriya complète |
| 103 | `darb-adad-ashriya` — ضرب الأعداد العشرية | السنة الأولى متوسط | `darb-qisma-ashriya` | `darb-adad-ashriya` |
| 104 | `wadiya-idmajiya-darb-qisma-ashriya` — أدمج تعلّماتي — الحساب على الأعداد الطبيعية والأعداد العشرية: الضرب والقسمة _(synthèse)_ | السنة الأولى متوسط | `darb-qisma-ashriya` | unité darb-qisma-ashriya complète |
| 105 | `hasil-qisma-mustaqim` — حاصل القسمة على نصف مستقيم مدرّج | السنة الأولى متوسط | `kitabat-kasriya` | `hasil-qisma-mustaqim` |
| 106 | `akhdh-kasr-min-adad` — أخذ كسر من عدد | السنة الأولى متوسط | `kitabat-kasriya` | `akhdh-kasr-min-adad` |
| 107 | `wadiya-idmajiya-kitabat-kasriya` — أدمج تعلّماتي — الكتابات الكسرية _(synthèse)_ | السنة الأولى متوسط | `kitabat-kasriya` | unité kitabat-kasriya complète |
| 108 | `intaj-ibara-harfiya` — إنتاج عبارات حرفية | السنة الأولى متوسط | `ibarat-harfiya` | `intaj-ibara-harfiya` |
| 109 | `wadiya-idmajiya-ibarat-harfiya` — أدمج تعلّماتي — الحساب الحرفي _(synthèse)_ | السنة الأولى متوسط | `ibarat-harfiya` | unité ibarat-harfiya complète |
| 110 | `muqaranat-hisas` — مقارنة حصص | السنة الأولى متوسط | `tanasubiya-nisab-maqayis` | `muqaranat-hisas` |
| 111 | `wadiya-idmajiya-tanasubiya-nisab-maqayis` — أدمج تعلّماتي — التناسبية _(synthèse)_ | السنة الأولى متوسط | `tanasubiya-nisab-maqayis` | unité tanasubiya-nisab-maqayis complète |
| 112 | `mukhattat-bil-amida` — تمثيل معطيات بمخطط بالأعمدة | السنة الأولى متوسط | `tanzim-muatayat` | `mukhattat-bil-amida` |
| 113 | `tamthil-bayani-dairi` — التمثيل البياني والمخطط الدائري | السنة الأولى متوسط | `tanzim-muatayat` | `tamthil-bayani-dairi` |
| 114 | `wadiya-idmajiya-tanzim-muatayat` — أدمج تعلّماتي — تنظيم معطيات _(synthèse)_ | السنة الأولى متوسط | `tanzim-muatayat` | unité tanzim-muatayat complète |
| 115 | `mustaqimat-mutawaziya` — المستقيمان المتوازيان | السنة الأولى متوسط | `tawazi-taamud` | `mustaqimat-mutawaziya` |
| 116 | `wadiya-idmajiya-tawazi-taamud` — أدمج تعلّماتي — التوازي والتعامد _(synthèse)_ | السنة الأولى متوسط | `tawazi-taamud` | unité tawazi-taamud complète |
| 117 | `muthallathat-khassa` — المثلثات الخاصة | السنة الأولى متوسط | `ashkal-mustawiya` | `muthallathat-khassa` |
| 118 | `rubaiyat-khassa` — الرباعيات الخاصة | السنة الأولى متوسط | `ashkal-mustawiya` | `rubaiyat-khassa` |
| 119 | `wadiya-idmajiya-ashkal-mustawiya` — أدمج تعلّماتي — الأشكال المستوية _(synthèse)_ | السنة الأولى متوسط | `ashkal-mustawiya` | unité ashkal-mustawiya complète |
| 120 | `mafhum-zawiya-tasmiya` — مفهوم الزاوية وتسميتها | السنة الأولى متوسط | `zawaya-qiyas` | `mafhum-zawiya-tasmiya` |
| 121 | `wadiya-idmajiya-zawaya-qiyas` — أدمج تعلّماتي — الزوايا _(synthèse)_ | السنة الأولى متوسط | `zawaya-qiyas` | unité zawaya-qiyas complète |
| 122 | `mihwar-qita-mustaqim` — محور قطعة مستقيم | السنة الأولى متوسط | `tanazur-mihwari` | `mihwar-qita-mustaqim` |
| 123 | `wadiya-idmajiya-tanazur-mihwari` — أدمج تعلّماتي — التناظر المحوري _(synthèse)_ | السنة الأولى متوسط | `tanazur-mihwari` | unité tanazur-mihwari complète |
| 124 | `wadiya-idmajiya-adad-nisbiya` — أدمج تعلّماتي — الأعداد النسبية _(synthèse)_ | السنة الأولى متوسط | `adad-nisbiya` | unité adad-nisbiya complète |

## Phase F — leçons isolées (6)

| # | leçon | السنة | unité | déclenchée par |
|---:|---|---|---|---|
| 125 | `qawaid-niqash-mithal-mudad` — قواعد النقاش الرياضي والمثال المضاد | السنة الثالثة متوسط | `burhan-riyadi` | isolée |
| 126 | `nusus-idha-fa-in` — النصوص «إذا … فإنّ …» والنص العكسي | السنة الثالثة متوسط | `burhan-riyadi` | isolée |
| 127 | `burhan-handasi` — البحث عن برهان في الهندسة وتحريره | السنة الثالثة متوسط | `burhan-riyadi` | isolée |
| 128 | `wadiya-idmajiya-burhan-riyadi` — أدمج تعلّماتي — البرهان في الرياضيات _(synthèse)_ | السنة الثالثة متوسط | `burhan-riyadi` | unité burhan-riyadi complète |
| 129 | `mutabayina-muthallathiya` — المتباينة المثلثية وإنشاء مثلث | السنة الثالثة متوسط | `muthallathat-3am` | isolée |
| 130 | `wadiya-idmajiya-muthallathat-3am` — أدمج تعلّماتي — المثلثات _(synthèse)_ | السنة الثالثة متوسط | `muthallathat-3am` | unité muthallathat-3am complète |

## Renvois en avant dans une même année (17)

La leçon de droite suppose un item que le manuel n’enseigne que PLUS LOIN : elle le rappelle elle-même (encadré « تذكّر »), sans le construire.

| leçon | suppose | enseigné plus loin dans |
|---|---|---|
| `hasr-qiyam-muqarraba` (1am.m3.r04) | 1am.m3.r03 — إجراء القسمة العشرية لعدد طبيعي أو عشري على عدد طبيعي. | `qisma-ashriya-taqrib` |
| `qays-zawiya-minqala` (1am.m4.r04) | 1am.m4.r03 — الاستعمال السليم في وضعية معطاة للمصطلحات: زاوية حادة، زاوية منفرجة، زاوية قائمة، زاوية مستقيمة. | `tasnif-zawaya-munassif` |
| `naql-tul-muntasaf` (1am.m4.r10) | 1am.m4.r08 — التعرّف على خواص التناظر المحوري (حفظ المسافات، الزوايا والأشكال، ...). | `nazir-shakl-khawas` |
| `tasnif-zawaya-munassif` (1am.m4.r11) | 1am.m4.r08 — التعرّف على خواص التناظر المحوري (حفظ المسافات، الزوايا والأشكال، ...). | `nazir-shakl-khawas` |
| `kusur-ashriya-kitaba` (1am.m5.r03) | 1am.m5.r01 — التعرّف في حالات بسيطة على الكتابات الكسرية لعدد. | `hasil-qisma-kasr` |
| `kusur-ashriya-kitaba` (1am.m5.r03) | 1am.m1.r05 — جمع، طرح وضرب أعداد عشرية في وضعية معيّنة. | `mana-jam-tarh` |
| `adad-ashri-mustaqim-mudarraj` (1am.m5.r04) | 1am.m1.r04 — ترتيب أعداد عشرية. | `muqaranat-adad-ashriya` |
| `tatbiq-qaida-harfiya` (1am.m5.r08) | 1am.m2.r08 — حساب محيط ومساحة مستطيل. | `mustatil-murabba-masaha` |
| `kusur-ashriya-kitaba` (1am.m5.x1) | 1am.m5.r01 — التعرّف في حالات بسيطة على الكتابات الكسرية لعدد. | `hasil-qisma-kasr` |
| `qisma-iqlidiya-hasr` (2am.m1.r06) | 2am.m1.r05 — تعيين قيمة مقرّبة بالزيادة (أو بالنقصان) لحاصل قسمة عشري. | `kasr-hasil-qisma` |
| `jam-tarh-kusur` (2am.m1.r09) | 2am.m1.r08 — مقارنة كسرين لهما نفس المقام أو مقام أحدهما مضاعف لمقام الآخر. | `muqarana-kasrayn` |
| `nazirat-nuqta` (2am.m2.r03) | 2am.m2.r02 — التعرّف على شكل يقبل مركز تناظر. | `markaz-tanazur-shakl` |
| `mawshur-qaim-wasf` (2am.m7.r07) | 2am.m7.r05 — تمثيل تصميم أسطوانة دوران أبعادها معلومة. | `ustuwana-dawaran-wasf` |
| `hajm-mawshur-qaim` (2am.m7.r08) | 2am.m7.r04 — وصف أسطوانة دوران. | `ustuwana-dawaran-wasf` |
| `mahawir-munassifat` (3am.m4.r04) | 3am.m4.r03 — معرفة خاصية فيثاغورس واستعمالها. | `khassiyat-fitaghuras` |
| `mutawassit-mutawazin` (3am.m7.r11) | 3am.m7.r08 — حساب تكرارات. | `fiat-takrarat` |
| `mutawassit-mutawazin` (3am.m7.r12) | 3am.m7.r09 — تقديم سلسلة إحصائية في جدول وتمثيلها بمخطّط أو بيان (الأشرطة، المدرج التكراري). | `tamthil-silsila-ihsaiya` |

