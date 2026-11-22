#!/usr/bin/env python3
"""Génère docs/sources/1am/unit5/extraction.json — 1AM, unité 5 « الأعداد النسبية »
(manuel الجيل الثاني, pp. 63–76 ; PDF pages 63–76, offset 0).

Transcription VISUELLE (pages rendues à 110 dpi). Les passages de la leçon `adad-nisbiya-siyaqat` (ouverture p. 63, نشاط 1 p. 65,
معارف p. 67, exercices 1–9 p. 71, أقوّم 1, 3, 4 p. 73, أتعمّق 1 p. 74) sont relus de près (`verified: True`) ; les éléments des leçons
qui ne sont pas encore générées (la synthèse) sont transcrits plus brièvement et marqués
`verified: False` : leur leçon les relira. Les éléments de `talim-fi-mustawi` (نشاط 3 p. 66, معارف 3 p. 69, طريقة 2 et « دوري الآن » p. 70, ex-16 … ex-21 p. 72, أقوّم 7–10 p. 73, أتعمّق 5–8 p. 74,
استعمل تكنولوجيات p. 76) ont été relus par cette leçon (2026-10-30, 110 dpi, ex-20/21 à 200 dpi) : `verified: True`. Les éléments de `talim-mustaqim-mudarraj` (نشاط 1 ①, نشاط 2, معارف 2, طريقة, « دوري الآن », ex-10 … ex-15, self-5, self-6, deep-2, deep-3) ont été relus
par cette leçon (2026-10-30) : `verified: True`. Les réponses sont CALCULÉES ici (entiers et décimaux EXACTS : `Fraction`, `Decimal`), jamais
tapées ; une lecture de figure incertaine est dite dans `reading` et dans `discrepancies`.

L'unité est générée LEÇON PAR LEÇON (cycle moyen, phase 3) : la première leçon générée est adad-nisbiya-siyaqat (ordre 20) ; les
destinations vers une leçon encore coming_soon sont EN ATTENTE (scripts/check-textbook-coverage.mjs).

FRONTIÈRE entre les leçons de l'unité (règle « pas de doublon », LEARNING_NET.md) — les quatre leçons de l'unité (ordre du catalogue) :
  L1 `adad-nisbiya-siyaqat` (1am.m5.r05) : les nombres négatifs dans des situations (températures, dates, altitudes et profondeurs, étages),
     le nombre relatif POSITIF / NÉGATIF, le signe distingué de la DISTANCE à zéro, deux nombres OPPOSÉS (0 est à la fois positif et négatif).
     Elle ne gradue pas de droite : tout nombre se lit sur une jauge verticale déjà graduée.
  L2 `talim-mustaqim-mudarraj` (1am.m5.r06, r05) : graduer une droite des DEUX côtés de l'origine, lire / placer une abscisse relative.
  L3 `talim-fi-mustawi` (1am.m5.r07) : le repère orthogonal, les coordonnées, placer / lire un point du plan.
  Synthèse `wadiya-idmajiya-adad-nisbiya`.
L'élément know-2 (p. 67) enjambe la frontière : le paragraphe « المسافة إلى الصفر - العددان المتعاكسان » (items) va à L1, le reste (droite
graduée, abscisse) à L2. L'élément act-1 (p. 65) est découpé en quatre : température (L1, entrée), fresque du temps (L1, application), le besoin
d'un nombre pour 6 + … = 4 (L1, معارف), tracé d'une demi-droite avec des abscisses négatives (L2).

Le تحدّ de l'unité : le manuel n'en imprime PAS pour l'unité 5 (la page d'ouverture p. 63 porte les objectifs, l'ascenseur et un encart sur les
bâtonnets de comptage chinois) ; `units_1am_2026_2027.json › adad-nisbiya.challenge` reste `null` (vérifié page 63 à 200 dpi).

Usage : python3 docs/sources/1am/unit5/build-extraction.py
"""
import json
from decimal import Decimal as D
from fractions import Fraction as F
from pathlib import Path


def dec(s):
    return D(str(s).replace(',', '.').replace('−', '-'))


def fr(x):
    """Un décimal exact écrit à la virgule (ex. -1,5), signe ASCII."""
    x = D(x).normalize()
    return format(x, 'f').replace('.', ',')


E = []

# ── p. 63 : ouverture ─────────────────────────────────────────────────────────────────────────────
E.append({
    'id': 'objectives', 'kind': 'objectives', 'page': 63, 'section': 'سأتعلّم في هذا الباب', 'verified': True,
    'items': [
        'إدراج الأعداد السالبة في وضعيات متنوعة.',
        'توظيف الأعداد النسبية في : ▪ تدريج مستقيم. ▪ قراءة فاصلة نقطة معلومة أو تعيين نقطة ذات فاصلة معلومة على مستقيم مدرج.',
        '▪ قراءة إحداثيي نقطة معلومة أو تعليم نقطة ذات إحداثيين معلومين في مُستوٍ مزوّد بمَعلم.',
    ],
})
E.append({
    'id': 'opener-lift', 'kind': 'aside', 'page': 63, 'section': 'تمهيد', 'verified': True,
    'text': 'صورة عمارة بمصعد وإلى يمينها لوحة طوابق : طوابق علوية 5 ، 4 ، 3 ، 2 ، 1 ، طابق أرضي 0 ، طوابق سفلية −1 ، −2 ، −3.',
    'figure': 'عمارة بخمسة طوابق علوية وثلاثة طوابق سفلية ومصعد ؛ لوحة خضراء للطوابق العلوية وزرقاء للطابق الأرضي (0) وكاكية للسفلية',
    'answer': {'floors': [5, 4, 3, 2, 1, 0, -1, -2, -3], 'above': 5, 'below': 3},
    'answerSource': 'read',
})
E.append({
    'id': 'opener-rods', 'kind': 'aside', 'page': 63, 'section': 'تمهيد', 'verified': True,
    'text': 'يرجع التعداد بالخشيبات إلى القرن الأول قبل الميلاد، وأصله الحضارة الصينية القديمة. هو نظام موضعي أساسه 10 : سلسلتان من الأرقام من 1 إلى 9 ، والصفر فراغ. '
            'السلسلة A للآحاد والمئات…، والسلسلة B للعشرات والآلاف…. اعتمد الصينيون على لون الخشيبات لتمييز الأعداد : الأحمر للعدد العادي أو الموجب، والأسود للعدد السالب. '
            'وفي الآثار المكتوبة يُشطب على الرقم الأخير بخط مائل. جدول الأرقام ثم عددان بالخشيبات (الثاني يُقرأ −654).',
    'figure': 'جدول الأرقام 0–9 بسلسلتين A وB ، وتحته عددان بالخشيبات ؛ الثاني بالأسود وعليه شطب مائل ويُقرأ −654',
    'answer': {'second': -654}, 'answerSource': 'read',
})

# ── p. 64 : استحضر مكتسباتي ──────────────────────────────────────────────────────────────────────
PREP = [
    {'n': 1, 'question': 'العدد عشرة آلاف ومائة وواحد هو :', 'options': ['1101', '10101', '101001'], 'correct': [1], 'why': '10000 + 100 + 1 = 10101'},
    {'n': 2, 'question': 'العدد ... هو عدد طبيعي', 'options': ['0,44 × 100', '1,30 × 10', '0,4 ÷ 10'], 'correct': [0, 1],
     'why': f'0,44 × 100 = {fr(dec("0.44") * 100)} ؛ 1,30 × 10 = {fr(dec("1.30") * 10)} ؛ 0,4 ÷ 10 = {fr(dec("0.4") / 10)}'},
    {'n': 3, 'question': 'العدد ثلاثمائة وثلاثة أجزاء من الألف هو :', 'options': ['303,303', '3,303', '0,303'], 'correct': [2], 'why': '303 / 1000 = 0,303'},
    {'n': 4, 'question': 'عدد الأعشار في العدد 8,956 هو :', 'options': ['895', '89', '9'], 'correct': [1],
     'why': '8,956 = 89,56 أعشار : 89 عشرًا كاملًا (والرقم 9 هو رقم الأعشار)', 'reading': 'ambigu : « عدد الأعشار » (89) ou « رقم الأعشار » (9) ; lu 89 (partie entière de 8,956 × 10)'},
    {'n': 5, 'question': 'نتيجة الحساب 64 − 46 هي :', 'options': ['18', '22', 'غير ممكن'], 'correct': [0], 'why': '64 − 46 = 18'},
    {'n': 6, 'question': 'دون إجراء العملية وباستعمال تقدير الأعداد فقط نتيجة 32,17 ∘ 99,7 هي :', 'options': ['131,25', '131,97', '61,16'], 'correct': None,
     'why': None, 'reading': 'le signe de l\'opération est illisible (RTL) ; 32,17 + 99,7 = 131,87 ≈ 132 (131,97 est la plus proche) ; 99,7 − 32,17 = 67,53 (aucune option)'},
    {'n': 7, 'question': 'دون إجراء العملية وباستعمال تقدير الأعداد فقط نتيجة 111,1 ∘ 10,9 هي :', 'options': ['122', '100,2', '20,211'], 'correct': [1],
     'why': '111,1 − 10,9 = 100,2', 'reading': 'lu avec « − » : 111,1 − 10,9 = 100,2 (option 2)'},
    {'n': 8, 'question': 'دون إجراء العملية نتيجة الحساب 408,1 × 20 هي :', 'options': ['816,2', '8 162', '2 816'], 'correct': [1], 'why': f'408,1 × 20 = {fr(dec("408.1") * 20)}'},
    {'n': 9, 'question': 'حاصل قسمة 405 على 11 قريب من :', 'options': ['4', '40', '30'], 'correct': [1], 'why': f'405 / 11 = {float(F(405, 11)):.2f}'},
    {'n': 10, 'question': 'يُكتب العدد اثنان وخمسة أعشار على الشكل :', 'options': ['2,5', '5/2', '7,5/3'], 'correct': [0, 1], 'why': '2 + 5/10 = 2,5 = 5/2'},
    {'n': 11, 'question': 'الجزء من الساعة الذي يمثّل 30 دقيقة هو :', 'options': ['1/30', '1/2', '30/60'], 'correct': [1, 2], 'why': '30/60 = 1/2'},
]
assert dec('0.44') * 100 == 44 and dec('1.30') * 10 == 13 and F(30, 60) == F(1, 2) and 64 - 46 == 18
E.append({'id': 'prep', 'kind': 'prerequisites', 'page': 64, 'section': 'استحضر مكتسباتي', 'verified': False,
          'instruction': 'اختر الإجابة (أو الإجابات) الصحيحة في كل حالة، وبرّر اختيارك.', 'items': PREP, 'answerSource': 'computed',
          'note': 'Récapitulatif de TOUT le cycle numérique (unités 1–4) : aucun item ne porte sur les relatifs ; chaque leçon mesure ses propres items du réseau (platform_addition).'})

# ── p. 65 : اكتشف ① سياقات استعمال الأعداد النسبية ───────────────────────────────────────────────
E.append({
    'id': 'act-1-temp', 'kind': 'activity', 'number': 1, 'page': 65, 'section': 'اكتشف', 'title': 'سياقات استعمال الأعداد النسبية — درجات الحرارة', 'verified': True,
    'text': '① عيّن بالتقريب على الخريطة المقابلة موقع كلّ من المدن : الجزائر، عنابة، تلمسان، باتنة، تمنراست، تيزي وزو، قسنطينة، غرداية. '
            '② ذكرت مقدمة النشرة الجوية أنّ درجات الحرارة في بعض هذه المدن تحت الصفر وفوق الصفر في أخرى. أ) اذكر المدن التي درجات الحرارة فيها تحت الصفر. ب) اذكر المدن التي درجات الحرارة فيها فوق الصفر. '
            '③ ماذا تلاحظ بالنسبة إلى مدينة تيزي وزو ؟ ④ اذكر مدينتين درجتا الحرارة فيهما متعاكستان.',
    'figure': 'خريطة للجزائر عليها أعداد (درجات الحرارة بين −6 و 7 تقريبًا) ومحرار مدرّج من −40 إلى 50 على يسارها',
    'reading': 'les nombres de la carte sont lus approximativement (−6, −5, −3, −2, −2, −2, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 6, 7, 7) : la plateforme redessine son propre tableau',
    'answerSource': 'read',
})
E.append({
    'id': 'act-1-time', 'kind': 'activity', 'number': 1, 'page': 65, 'section': 'اكتشف', 'title': 'سياقات استعمال الأعداد النسبية — فسيفساء زمنية', 'verified': True,
    'text': 'فترات التاريخ : ما قبل التاريخ، العصور القديمة، العصور الوسطى، العصر الحديث، الفترة المعاصرة. انقل على ورقة مرصوفة فسيفساء الزمن أدناه ثم علّم عليها بالتقريب الأحداث الممثلة في الصور.',
    'events': [{'label': 'آثار طاسيلي ناجر', 'year': -6000}, {'label': 'غزو الفضاء (21 جويلية 1969)', 'year': 1969}, {'label': 'الملك بوغرطة', 'span': [-160, -104]},
               {'label': 'قلعة بني حماد', 'year': 1008}, {'label': 'نيلسون مونديلا', 'span': [1918, 2013]}, {'label': 'استقلال الجزائر', 'year': 1962}],
    'answer': {'order': ['آثار طاسيلي ناجر (−6000)', 'بوغرطة (−160 … −104)', 'قلعة بني حماد (1008)', 'مونديلا (1918 … 2013)', 'استقلال الجزائر (1962)', 'غزو الفضاء (1969)']},
    'answerSource': 'read',
})
E.append({
    'id': 'act-1-need', 'kind': 'activity', 'number': 1, 'page': 65, 'section': 'اكتشف', 'title': 'في الرياضيات ② — الحاجة إلى عدد جديد', 'verified': True,
    'text': '② أ) هذا الصباح، كان الجو باردًا، ثم زادت درجة الحرارة بـ 7°C وهي الآن 5°C. هل يمكن أن تكون درجة الحرارة في الصباح 4°C ؟ 0°C ؟ لماذا ؟ '
            'ب) أكمل الفراغات : 7 + … = 11 ؛ 28 + … = 85 ؛ 194 + … = 251 ؛ 37 + … = 37 ؛ 6 + … = 4.',
    'answer': {'morning': -2, 'blanks': [11 - 7, 85 - 28, 251 - 194, 37 - 37, 4 - 6], 'why': 'زادت بـ 7 فصارت 5 : كانت 5 − 7 = −2 (تحت الصفر) ؛ 6 + … = 4 يتطلّب −2 ، وهو غير ممكن بالأعداد الطبيعية'},
    'answerSource': 'computed',
})
assert 5 - 7 == -2 and 4 - 6 == -2
E.append({
    'id': 'act-1-line', 'kind': 'activity', 'number': 1, 'page': 65, 'section': 'اكتشف', 'title': 'في الرياضيات ① — نصف مستقيم بفواصل سالبة', 'verified': True,
    'text': '① أ) ارسم نصف مستقيم مدرّجًا مبدؤه النقطة O باختيار السنتيمتر كوحدة. علّم النقاط A(4) ، B(5) و D(7). ب) أنشئ النقطة F بحيث تكون A منتصف القطعة [BF] ؛ ما فاصلة F ؟ '
            'ج) نريد تعليم النقطة E بحيث تكون O منتصف القطعة [DE] ؛ ماذا تلاحظ ؟ كيف تتمّ التدريج حتى يكون ذلك ممكنًا ؟ ما هي عندئذ فاصلة E ؟',
    'answer': {'F': 4 * 2 - 5, 'E': -7}, 'answerSource': 'computed',
})
assert 4 * 2 - 5 == 3 and 0 * 2 - 7 == -7

# ── p. 66 : اكتشف ② ③ ────────────────────────────────────────────────────────────────────────────
E.append({
    'id': 'act-2', 'kind': 'activity', 'number': 2, 'page': 66, 'section': 'اكتشف', 'title': 'التعليم على مستقيم مدرّج', 'verified': True,
    'text': 'نعتبر درجات الحرارة المسجلة في مختلف مناطق الجزائر. ① أكمل الجدول (المدن : قسنطينة، ... بشار ؛ درجات : −6، 0، 7، 4، −5، 6...). ② انقل المستقيم المدرّج أدناه (من −8 إلى 8) وعلّم النقطة الممثلة للمدينة أمام خط التدريج الموافق لدرجة الحرارة المسجلة فيها. '
            '③ رتّب درجات الحرارة من الأكثر برودة إلى الأكثر دفئًا. كيف يمكن استنتاج ذلك من البيان ؟ ④ في ذلك اليوم سجّل أمين عنده في البيت 1,5°C. أين ينبغي أن يعلّم ذلك على المستقيم المدرّج ؟',
    'answer': {'order': sorted([-6, -5, 0, 4, 6, 7])}, 'answerSource': 'computed',
})
E.append({
    'id': 'act-3', 'kind': 'activity', 'number': 3, 'page': 66, 'section': 'اكتشف', 'title': 'التعليم في المستوي', 'verified': True,
    'text': 'رسمنا معلمًا للمستوي مبدؤه النقطة S التي تمثل مدينة عين صالح. طلب أستاذ من تلاميذه البحث عن إحداثيي مدينة غرداية بالنسبة إلى هذا المعلم، فكانت إجابات ثلاثة تلاميذ : '
            'مصطفى : « إحداثيا غرداية 1+ » ؛ أمين : « إحداثيا غرداية هما أولًا 1+ ثمّ 3+ » ؛ سيلين : « إحداثيا غرداية هما أولًا 3+ ثمّ 1+ ». '
            '① هل معلومات مصطفى كافية لتعليم مدينة غرداية ؟ لماذا ؟ ② ماذا تقول بالنسبة إلى إجابتي أمين وسيلين ؟ ③ في معلم للمستوي، كم عددًا يلزمنا لتعليم نقطة ؟ كيف نسمّي العدد الأول ؟ الثاني ؟ ④ بقراءة بيانية تقريبية، عيّن إحداثيي كلّ من سطيف ووهران وتمنراست.',
    'figure': 'خريطة الجزائر وعليها شبكة ومعلم مبدؤه S (عين صالح)', 'answerSource': 'read',
})

# ── p. 67 : أحوصل تعلّماتي ───────────────────────────────────────────────────────────────────────
E.append({
    'id': 'know-1', 'kind': 'knowledge', 'number': 1, 'page': 67, 'section': 'أحوصل تعلّماتي', 'title': 'الأعداد النسبية', 'verified': True,
    'text': 'تتشكّل الأعداد النسبية من أعداد موجبة وأعداد سالبة. يكون العدد السالب دائمًا مسبوقًا بإشارة − ، وهو أصغر من الصفر. '
            'يكون العدد الموجب مسبوقًا بإشارة + أو غير مسبوق بإشارة، وهو أكبر من الصفر.',
    'examples': 'إليك قائمة من أعداد نسبية : +3 ؛ 9 ؛ −5 ؛ 1,7 ؛ −6,8 ؛ 60. في هذه القائمة توجد أربعة أعداد موجبة هي 9 ؛ +3 ؛ 1,7 ؛ 60. ويوجد أيضًا عددان سالبان هما −5 ؛ −6,8.',
    'remarks': ['العدد 0 هو العدد الوحيد الذي يكون سالبًا وموجبًا في آن واحد.', 'الأعداد النسبية التي هي صحيحة تسمّى الأعداد الصحيحة النسبية.',
                'يمكن الاستغناء عن كتابة الرمز + في كتابة الأعداد النسبية الموجبة (الحاسبة لا تظهره).'],
    'answer': {'positives': ['+3', '9', '1,7', '60'], 'negatives': ['-5', '-6,8'], 'zero': 'both'}, 'answerSource': 'read',
})
E.append({
    'id': 'know-2', 'kind': 'knowledge', 'number': 2, 'page': 67, 'section': 'أحوصل تعلّماتي', 'title': 'التعليم على مستقيم مدرّج', 'verified': True,
    'items': {
        'half-line-def': 'المستقيم المدرّج (أو المحور) هو مستقيم نختار عليه : نقطة ثابتة تسمّى المبدأ، اتجاهًا، ووحدة قياس أطوال. (مثال : مستقيم عليه المبدأ O والنقطة A ، أعداد سالبة على اليسار وموجبة على اليمين.)',
        'abscissa': 'كل عدد نسبي يمثّل بنقطة على مستقيم مدرّج ويسمّى فاصلة هذه النقطة. (مثال : فاصلة النقطة M هي −3,5 ونكتب M(−3,5).)',
        'distance-opposites': 'المسافة إلى الصفر — العددان المتعاكسان : يكون عددان نسبيان متعاكسين عندما يكون لهما نفس المسافة إلى الصفر وإشارتان متعاكستان. '
                              '(مثال : M(3) و M\'(−3) على جهتي المبدأ O بنفس المسافة : ثلاث وحدات.) '
                              'ملاحظات : المسافة إلى 0 للعدد −3 هي طول القطعة [OM\'] أي 3 ؛ المسافة إلى 0 للعدد 3 هي طول القطعة [OM] أي 3 ؛ العددان النسبيان 3 و −3 متعاكسان.',
    },
    'answer': {'oppositeOf3': -3, 'distance': 3}, 'answerSource': 'read',
})

# ── p. 68 : أكتسب طرائق ──────────────────────────────────────────────────────────────────────────
E.append({
    'id': 'method-1', 'kind': 'method', 'number': 1, 'page': 68, 'section': 'أكتسب طرائق', 'title': 'تدريج مستقيم وتعليم نقطة', 'verified': True,
    'text': 'مثال : درّج مستقيمًا، علّم عليه النقطتين A و B ذاتي الفاصلتين −3 و 2,7 على الترتيب. (1) نرسم مستقيمًا، نختار المبدأ O ووحدة لقياس الطول OI. (2) فاصلة A سالبة : A على يسار O ، نواصل التدريج بنقل الطول OI. '
            '(3) نعيّن موضع A عند العدد −3 بالضبط. (4) فاصلة B موجبة على يمين O ، لا تظهر بعد التدريج. (5) نعيّن موضع B بين العددين 2 و 3 بالتقريب. '
            'طريقة : لتعليم نقاط بمستقيم، نختار اتجاهه ونقطة المبدأ ووحدة قياس الطول. ندرّج المستقيم من جهتي المبدأ بنقل الوحدة عدة مرّات حسب الحاجة. تُعلّم كلّ نقطة بفاصلتها : العدد هو المسافة بين النقطة والمبدأ، والإشارة (+) على يمين المبدأ و (−) على يساره.',
    'answerSource': 'read',
})
E.append({
    'id': 'now-68', 'kind': 'now', 'page': 68, 'section': 'دوري الآن', 'verified': True,
    'text': '① على المستقيم المدرّج أدناه، اقرأ فواصل النقاط A ، B و C (المبدأ 0 والعلامة 10 معطاتان). ② أ) ارسم مستقيمًا مدرّجًا باختيار المبدأ O ووحدة قياس الطول 5cm واتجاه. ب) ضع عليه النقاط M ، N و K التي فواصلها 10 ، −15 و −7,5 على الترتيب.',
    'answerSource': 'read',
})

# ── p. 69–70 : المستوي ───────────────────────────────────────────────────────────────────────────
E.append({
    'id': 'know-3', 'kind': 'knowledge', 'number': 3, 'page': 69, 'section': 'أحوصل تعلّماتي', 'title': 'التعليم في المستوي', 'verified': True,
    'text': 'يتشكّل المعلم المتعامد للمستوي من مستقيمين مدرّجين متعامدين ولهما نفس المبدأ. المحور الأفقي يسمّى محور الفواصل والمحور الشاقولي يسمّى محور التراتيب. '
            'خاصية : في معلم للمستوي، يمكن تعليم كلّ نقطة بعددين هما إحداثيا النقطة. الإحداثي الأول، الذي نقرأه على محور الفواصل، يسمّى فاصلة النقطة. والإحداثي الثاني، الذي نقرأه على محور التراتيب، يسمّى ترتيب النقطة. مثال : M(−3 ; 5). '
            'لقراءة إحداثيي نقطة نرسم الموازيين للمحورين المارين بالنقطة : نقرأ أولًا الفاصلة ثم الترتيب.',
    'answerSource': 'read',
})
E.append({
    'id': 'method-2', 'kind': 'method', 'number': 2, 'page': 70, 'section': 'أكتسب طرائق', 'title': 'تعليم نقاط في المستوي', 'verified': True,
    'text': 'مثال : في المستوي المزوّد بمعلم متعامد علّم النقاط A(−3 ; 2) ، B(4 ; 0) و C(0 ; −4). طريقة 1 على ورقة مرصوفة : نستعين بخطوط المرصوفة لتحديد موضع كلّ نقطة بتعيين خط فاصلتها أولًا ثم خط ترتيبها. '
            'طريقة 2 على ورقة غير مرصوفة : نرسم الموازي لمحور التراتيب الذي يمرّ بالتدريج −3 لمحور الفواصل، ثم الموازي لمحور الفواصل الذي يمرّ بالتدريج 2 لمحور التراتيب، ونعيّن A عند تقاطع المستقيمين.',
    'answerSource': 'read',
})
E.append({
    'id': 'now-70', 'kind': 'now', 'page': 70, 'section': 'دوري الآن', 'verified': True,
    'text': '① في معلم متعامد، علّم النقاط الآتية : A(−3 ; 2) ، B(0 ; 4) ، C(−4 ; 0) ، O(0 ; 0). ② في المعلم المقابل رسمنا الحرف « ك ». عيّن إحداثيات النقاط التي تسمح برسم الحرف بدءًا بالنقطة M(4 ; 3).',
    'answerSource': 'read',
})

# ── pp. 71–72 : أتمرّن ───────────────────────────────────────────────────────────────────────────
E.append({'id': 'ex-1', 'kind': 'exercise', 'number': 1, 'page': 71, 'section': 'أتمرّن — سياقات استعمال الأعداد النسبية', 'verified': True,
          'text': 'أ) ما هي درجة الحرارة التي يقرؤها المحرار ؟ ب) نعتبر درجات الحرارة : −5°C ؛ 6°C ؛ 0°C ؛ −8°C. انقل المحرار ثم علّم عليه درجات الحرارة.',
          'figure': 'محرار عمودي مدرّج', 'answer': {'values': [-5, 6, 0, -8], 'coldest': -8}, 'answerSource': 'computed'})
E.append({'id': 'ex-2', 'kind': 'exercise', 'number': 2, 'page': 71, 'section': 'أتمرّن — سياقات استعمال الأعداد النسبية', 'verified': True,
          'text': 'تتكوّن عمارة من عشرة طوابق وثلاثة مستويات تحت سطح الأرض. كيف تتصوّر لوحة مفاتيح مصعد العمارة ؟',
          'answer': {'keys': list(range(10, 0, -1)) + [0, -1, -2, -3], 'count': 14, 'note': '10 طوابق علوية + الأرضي + 3 سفلية (إن عُدّ الأرضي طابقًا غير مضاف إلى العشرة)'},
          'answerSource': 'computed'})
BIRTH = {'طالس': (-625, -546), 'فيثاغورس': (-580, -495), 'ديكارت': (1596, 1650), 'الخوارزمي': (780, 850)}
AGES = {k: b - a for k, (a, b) in BIRTH.items()}
assert AGES == {'طالس': 79, 'فيثاغورس': 85, 'ديكارت': 54, 'الخوارزمي': 70}
E.append({'id': 'ex-3', 'kind': 'exercise', 'number': 3, 'page': 71, 'section': 'أتمرّن — سياقات استعمال الأعداد النسبية', 'verified': True,
          'text': 'نقرأ على وثيقة لتواريخ الرياضيّين ما يلي : طالس : 625 ق.م — 546 ق.م ؛ فيثاغورس : 580 ق.م — 495 ق.م ؛ ديكارت : 1596 م — 1650 م ؛ الخوارزمي : 780 م — 850 م. '
          'أ) مثّلنا على مستقيم مدرّج أسفله كلّ عالم بحرف (T P K D…) ؛ ب) عبّر بعدد نسبي مناسب عن تاريخ ميلاد كلّ من علماء الرياضيات المذكورين أعلاه.',
          'answer': {'births': {k: a for k, (a, b) in BIRTH.items()}, 'ages': AGES}, 'answerSource': 'computed'})
EVENTS = {'فتح مكة': 630, 'اختراع الكتابة': -3400, 'إعلان حقوق الطفل': 1959, 'ميلاد ماسينيسا': -238}
E.append({'id': 'ex-4', 'kind': 'exercise', 'number': 4, 'page': 71, 'section': 'أتمرّن — سياقات استعمال الأعداد النسبية', 'verified': True,
          'text': 'أرفق كلّ تاريخ بالحدث الموافق : −238 ؛ 630 ؛ 1959 ؛ −3400 مع : فتح مكة ؛ اختراع الكتابة ؛ إعلان حقوق الطفل ؛ ميلاد ماسينيسا.',
          'answer': {'match': EVENTS}, 'answerSource': 'read',
          'reading': 'l\'appariement est une connaissance historique, pas un calcul : fatḥ Makka 630 ; invention de l\'écriture ≈ −3400 ; Déclaration des droits de l\'enfant 1959 ; naissance de Massinissa ≈ −238'})
E.append({'id': 'ex-5', 'kind': 'exercise', 'number': 5, 'page': 71, 'section': 'أتمرّن — سياقات استعمال الأعداد النسبية', 'verified': True,
          'text': 'بالاستعانة بقاموس أو محرّك بحث في الإنترنت : عيّن الارتفاعات والأعماق الآتية : أ) إفرست ب) ألشبيلية (الأوراس) ج) لالة خديجة (جرجرة) د) البحر الأبيض المتوسط هـ) بحيرة فيكتوريا (إفريقيا) و) بحيرة طبريا (فلسطين). عبّر عن ذلك بأعداد نسبية.',
          'answer': None, 'answerSource': 'external', 'note': 'recherche sur Internet : pas de clé unique (une plateforme fermée n\'envoie pas l\'élève dehors) ; la leçon écrit ses propres altitudes connues'})
E.append({'id': 'ex-6', 'kind': 'exercise', 'number': 6, 'page': 71, 'section': 'أتمرّن — الأعداد النسبية', 'verified': True,
          'text': 'صحيح أم خاطئ ؟ هل الجمل الآتية صحيحة أم خاطئة ؟ أ) −0,5 و −5 عددان سالبان. ب) معاكس عدد سالب هو عدد سالب. جـ) العدد 0 أكبر من أيّ عدد سالب. د) العدد يكون دائمًا أكبر من معاكسه.',
          'answer': {'a': True, 'b': False, 'c': True, 'd': False,
                     'why': {'b': 'معاكس −3 هو 3 وهو موجب', 'd': 'العدد −3 أصغر من معاكسه 3'}}, 'answerSource': 'computed'})
EX7 = ['-1,5', '+5,5', '-1,7', '-50', '-0,1', '-7']
E.append({'id': 'ex-7', 'kind': 'exercise', 'number': 7, 'page': 71, 'section': 'أتمرّن — الأعداد النسبية', 'verified': True,
          'text': 'عيّن المسافة إلى 0 للأعداد النسبية الآتية : −1,5 ؛ +5,5 ؛ −1,7 ؛ −50 ؛ −0,1 ؛ −7.',
          'answer': {n: fr(abs(dec(n))) for n in EX7}, 'answerSource': 'computed'})
EX8 = ['-4,5', '+20', '-0,36', '-4,6', '-0,1', '-0,5']
E.append({'id': 'ex-8', 'kind': 'exercise', 'number': 8, 'page': 71, 'section': 'أتمرّن — الأعداد النسبية', 'verified': True,
          'text': 'أ) عيّن العدد المعاكس لكلّ من الأعداد النسبية الآتية : −4,5 ؛ +20 ؛ −0,36 ؛ −4,6 ؛ −0,1 ؛ −0,5. ب) بخصوص العدد المعاكس يقول أمين : « أن آخذ معاكس معاكس عدد لا يغيّر العدد ». هل توافقه ؟',
          'answer': {'opposites': {n: fr(-dec(n)) for n in EX8}, 'amine': 'نعم : معاكس معاكس a هو a'}, 'answerSource': 'computed'})
EX9 = ['2,1', '1,6', '8,2']
E.append({'id': 'ex-9', 'kind': 'exercise', 'number': 9, 'page': 71, 'section': 'أتمرّن — الأعداد النسبية', 'verified': True,
          'text': 'عيّن الأعداد النسبية التي مسافتها إلى الصفر : 2,1 ؛ 1,6 ؛ 8,2.',
          'answer': {n: [fr(dec(n)), fr(-dec(n))] for n in EX9}, 'answerSource': 'computed'})
E.append({'id': 'ex-10', 'kind': 'exercise', 'number': 10, 'page': 71, 'section': 'أتمرّن — الأعداد النسبية', 'verified': True,
          'text': 'نعتبر المستقيم المدرّج الآتي (علّمت عليه −3,1 ؛ −1 ؛ 0 ؛ 2,5 والنقطتان S و T). أكمل الجمل بالعبارات المناسبة : أ) كلّ الأعداد المكتوبة على المستقيم المدرّج … ب) العددان −1 و −3,1 … جـ) −4 هي … النقطة S و +4 هي … النقطة T. د) العددان اللذان لهما نفس … وإشارتان … هما عددان … .',
          'answerSource': 'read', 'note': 'lecture d\'abscisses sur une droite graduée : la leçon talim-mustaqim-mudarraj (L2) la relira'})
E.append({'id': 'ex-11', 'kind': 'exercise', 'number': 11, 'page': 71, 'section': 'أتمرّن — التعليم على مستقيم مدرّج', 'verified': True,
          'text': 'انقل المستقيمات المدرّجة الآتية ثم أكمل التدريج بكتابة الأعداد النسبية المناسبة تحت التدريجات (أمثلة : المبدأ 0 والعلامة 5 ؛ −6 و 2).', 'answerSource': 'read'})
E.append({'id': 'ex-12', 'kind': 'exercise', 'number': 12, 'page': 72, 'section': 'أتمرّن — التعليم على مستقيم مدرّج', 'verified': True,
          'text': 'اقرأ فاصلة كلّ من النقاط A ، B ، C و D على المستقيم المدرّج (المبدأ 0 والعلامة 100 معطاتان).', 'answerSource': 'read'})
E.append({'id': 'ex-13', 'kind': 'exercise', 'number': 13, 'page': 72, 'section': 'أتمرّن — التعليم على مستقيم مدرّج', 'verified': True,
          'text': 'عيّن النقطة التي تمثّل المبدأ في كلّ من المستقيمين المدرّجين الآتيين : (1) علّم عليه −3 و 3 ؛ (2) علّم عليه −6 و −3.', 'answerSource': 'read'})
E.append({'id': 'ex-14', 'kind': 'exercise', 'number': 14, 'page': 72, 'section': 'أتمرّن — التعليم على مستقيم مدرّج', 'verified': True,
          'text': 'أ) ارسم مستقيمًا مدرّجًا طول الوحدة فيه 3cm. ب) علّم عليه النقاط : M(−2,2) ؛ K(1,7) ؛ S(−0,7).', 'answerSource': 'read'})
E.append({'id': 'ex-15', 'kind': 'exercise', 'number': 15, 'page': 72, 'section': 'أتمرّن — التعليم على مستقيم مدرّج', 'verified': True,
          'text': 'أ) ارسم مستقيمًا مدرّجًا طول الوحدة فيه 2cm. ب) علّم عليه النقاط : A(+2,3) ؛ B(+1,4) ؛ C(+3,1) و D(−0,5).', 'answerSource': 'read'})
for n, t in [(16, 'أ) ارسم معلمًا متعامدًا معتبرًا ضلع مربع ورقة كراس كوحدة قياس الطول على المحورين. ب) علّم النقاط : K(−3 ; 5) ، S(−2 ; 3) ، J(4 ; 3).'),
             (17, 'في معلم متعامد، نعتبر النقاط : A(0 ; −2) ، B(2 ; −5) ، C(−1 ; −1) ، D(3 ; 0) ، E(4 ; 0) ، F(0 ; 0) ، G(−3,5 ; 2) ، H(−2 ; 0). أ) عيّن النقاط التي تنتمي إلى محور الفواصل. ب) عيّن النقاط التي تنتمي إلى محور التراتيب.'),
             (18, 'هذه شبكة أخفى فيها مبدأ ومحوري المعلم المتعامد. (نقاط A ، B ، C ، D) إذا علمت أنّ (−2 ; −3) هما إحداثيا النقطة B بالضبط، علّم المبدأ ثم ارسم المحورين.'),
             (19, 'أ) ارسم مستقيمًا واختر التدريج المناسب بالتمعن في فواصل النقاط الآتية ثم علّم النقاط. ب) ...'),
             (20, 'عيّن بقراءة بيانية إحداثيات النقط A ، B ، C ، D ، E ، F ، G و H. ب) اذكر النقاط التي لها نفس الفاصلة. جـ) اذكر النقاط التي لها نفس الترتيب. د) ماذا تلاحظ بالنسبة إلى النقطتين A و F ؟'),
             (21, 'أ) إليك المعلم الآتي. انقل الجمل الآتية ثم أكملها باستعمال المفردات : إحداثيات، فاصلة، ترتيب.')]:
    E.append({'id': f'ex-{n}', 'kind': 'exercise', 'number': n, 'page': 72, 'section': 'أتمرّن — التعليم في المستوي', 'verified': True, 'text': t, 'answerSource': 'read'})

# ── p. 73 : أقوّم تعلّماتي ───────────────────────────────────────────────────────────────────────
SELF1 = [-4, 4, -0.5, 12, 0, 5, -8]
POS = [x for x in SELF1 if x >= 0]
NEG = [x for x in SELF1 if x <= -0.0000001]
OPP = [(a, b) for a in SELF1 for b in SELF1 if a < b and a == -b]
assert len(POS) == 4 and len(NEG) == 3 and OPP == [(-4, 4)]
E.append({'id': 'self-1', 'kind': 'self', 'number': 1, 'page': 73, 'section': 'أقوّم تعلّماتي', 'verified': True,
          'text': 'أجب بصحيح أو خطأ مع التعليل. في قائمة الأعداد النسبية الآتية : −4 ؛ 4 ؛ −0,5 ؛ 12 ؛ 0 ؛ 5 ؛ −8 : أ) يوجد أربعة أعداد موجبة. ب) يوجد ثلاثة أعداد سالبة. جـ) يوجد عددان متعاكسان.',
          'answer': {'a': True, 'b': True, 'c': True, 'positives': POS, 'negatives': NEG, 'opposites': [-4, 4]},
          'answerSource': 'computed', 'reading': 'la liste est lue (ordre RTL brouillé) : {−8, 5, 12, 0, −0,5, 4, −4} ; 0 compte parmi les positifs (« 0 est à la fois positif et négatif »)'})
E.append({'id': 'self-2', 'kind': 'self', 'number': 2, 'page': 73, 'section': 'أقوّم تعلّماتي', 'verified': True,
          'text': 'في قائمة الأعداد الآتية، يوجد عدد ليس عددًا نسبيًّا. ما هو ؟ −12 ؛ 4 ؛ −2,5 ؛ 0 ؛ 0,33 ؛ 5 ؛ 1/7 ؛ −2.',
          'answer': {'notRelative': '1/7'}, 'answerSource': 'read',
          'note': 'dans le programme 1AM un nombre relatif est un entier ou un décimal signé ; 1/7 n\'est ni l\'un ni l\'autre. La synthèse le relira : L1 ne pose pas ce piège'})
E.append({'id': 'self-3', 'kind': 'self', 'number': 3, 'page': 73, 'section': 'أقوّم تعلّماتي', 'verified': True,
          'text': 'على الساعة العاشرة ليلًا كانت درجة الحرارة −2°C ؛ بعد خمس ساعات من ذلك نقصت بـ 4 درجات. ما هي درجة الحرارة التي يشير إليها المحرار آنذاك ؟',
          'answer': {'temperature': -2 - 4}, 'answerSource': 'computed'})
E.append({'id': 'self-4', 'kind': 'self', 'number': 4, 'page': 73, 'section': 'أقوّم تعلّماتي', 'verified': True,
          'text': 'عاش طالس في الفترة : نحو 625 ق.م — نحو 546 ق.م. ما هو عمره عند وفاته ؟',
          'answer': {'age': 625 - 546}, 'answerSource': 'computed'})
E.append({'id': 'self-5', 'kind': 'self', 'number': 5, 'page': 73, 'section': 'أقوّم تعلّماتي', 'verified': True,
          'text': 'بقراءة بيانية، عيّن فواصل النقاط M ، J ، K ، N (المبدأ 0 والعلامة 25 معطاتان).', 'answerSource': 'read'})
E.append({'id': 'self-6', 'kind': 'self', 'number': 6, 'page': 73, 'section': 'أقوّم تعلّماتي', 'verified': True,
          'text': 'علّم على مستقيم مدرّج النقاط : A(+2) ، B(−5) ، C(+4,5) ، E(0).', 'answerSource': 'read'})
E.append({'id': 'self-7', 'kind': 'self', 'number': 7, 'page': 73, 'section': 'أقوّم تعلّماتي', 'verified': True,
          'text': 'إحداثيا النقطة G : (1 ; 3) ، (3 ; −1) ، (−1 ; 3) (قائمة اختيار على معلم).', 'answerSource': 'read'})
E.append({'id': 'self-8', 'kind': 'self', 'number': 8, 'page': 73, 'section': 'أقوّم تعلّماتي', 'verified': True,
          'text': 'إذا كانت نقطة على محور الفواصل، فإنّ : ترتيبها معدوم ؛ هي المبدأ ؛ فاصلتها معدومة.', 'answerSource': 'read'})
E.append({'id': 'self-9', 'kind': 'self', 'number': 9, 'page': 73, 'section': 'أقوّم تعلّماتي', 'verified': True,
          'text': 'إذا كانت نقطة على محور التراتيب، فإنّ : ترتيبها معدوم ؛ هي المبدأ ؛ فاصلتها معدومة.', 'answerSource': 'read'})
E.append({'id': 'self-10', 'kind': 'self', 'number': 10, 'page': 73, 'section': 'أقوّم تعلّماتي', 'verified': True,
          'text': 'في معلم متعامد للمستوي، علّم النقاط : A(1,5 ; −3) ، B(−3 ; 0) ، C(−1 ; 0,5) ، D(2,5 ; −1,5) ، E(−5 ; −2).', 'answerSource': 'read'})

# ── p. 74 : أتعمّق ───────────────────────────────────────────────────────────────────────────────
E.append({'id': 'deep-1', 'kind': 'deepen', 'number': 1, 'page': 74, 'section': 'أتعمّق', 'title': 'حرارة غير عادية', 'verified': True,
          'text': 'تعدّ سنة 2014 السنة الأكثر حرارة منذ 1880 إذ زادت درجة الحرارة فيها بمقدار 0,69 مقارنة بالمتوسط المرجعي للقرن العشرين 13,9°C. '
                  'أ) خلال الفترة المحددة في البيان أعلاه بيّن : — السنوات الأكثر برودة. — السنوات الأكثر حرارة. ب) ما هو التوجه العام لتغيّر الطقس ؟',
          'figure': 'مخطط أعمدة سنوي (1950–2010) : أعمدة زرقاء سالبة (طقس بارد) أقصى انخفاض ≈ −1,8 نحو 1955 ، وحمراء موجبة (طقس حار) أقصاها ≈ +0,85 نحو 2005',
          'answer': {'temp2014': fr(dec('13.9') + dec('0.69')), 'trend': 'من أعمدة زرقاء (سالبة) في الخمسينيات والسبعينيات إلى أعمدة حمراء (موجبة) بعد 1990 : الحرارة في ارتفاع'},
          'reading': 'les valeurs du graphique sont lues approximativement (barres de −1,8 à +0,85) ; la plateforme redessine son propre graphique à valeurs simples',
          'answerSource': 'computed'})
assert dec('13.9') + dec('0.69') == dec('14.59')
E.append({'id': 'deep-2', 'kind': 'deepen', 'number': 2, 'page': 74, 'section': 'أتعمّق', 'title': 'الفسيفساء الزمنية', 'verified': True,
          'text': 'طُلب منك رسم مستقيم مدرّج لغرض تعليم نقاط فواصلها −3000 ، −2500 ، +2500 و 5000. فاخترت استعمال ورقة كراسك وعلّمت المبدأ O ونقطة A كما هو مبيّن. ① تعلم أنّ فاصلة المبدأ هي 0. ماذا تختار بالنسبة إلى النقطة A ؟ ② علّم النقاط المطلوبة.',
          'answerSource': 'read'})
E.append({'id': 'deep-3', 'kind': 'deepen', 'number': 3, 'page': 74, 'section': 'أتعمّق', 'verified': True,
          'text': '17 ، 18 و 19 هي ثلاثة أعداد موجبة متتابعة. اكتب ثلاثة أعداد صحيحة نسبية سالبة متتابعة أحدها −30.',
          'answer': {'ex': [-31, -30, -29]}, 'answerSource': 'computed', 'note': 'plusieurs réponses : (−32, −31, −30), (−31, −30, −29), (−30, −29, −28)'})
E.append({'id': 'deep-4', 'kind': 'deepen', 'number': 4, 'page': 74, 'section': 'أتعمّق', 'title': 'رحلة الحلزون', 'verified': False,
          'text': 'ينتقل حلزون على مستقيم مدرّج وفق اتجاه السهم ليقطع وحدتين كلّ ساعة. كان في الفاصلة +5 عند الساعة 12h. ① عبّر عن مواقع الحلزون بأعداد نسبية مناسبة عند الساعة 5h ، 7h ، 9h ، 12h. ② عند أيّة فاصلة كانت بداية الرحلة إذا علمت أنّ الانطلاق كان على الساعة 0h ؟',
          'answer': {'5h': 5 - 2 * 7, '7h': 5 - 2 * 5, '9h': 5 - 2 * 3, '12h': 5, 'start': 5 - 2 * 12}, 'answerSource': 'computed',
          'reading': 'le sens de la flèche (vers la droite, 5 h … 12 h) suppose que l\'abscisse augmente de 2 par heure : 5 h → −9 ; 7 h → −5 ; 9 h → −1 ; 12 h → 5 ; départ (0 h) → −19. Sens non vérifié sur le scan.'})
E.append({'id': 'deep-5', 'kind': 'deepen', 'number': 5, 'page': 74, 'section': 'أتعمّق', 'title': 'المعلم المفقود', 'verified': True,
          'text': 'انقل على ورقة كراس الشكل الموالي ثم ارسم معلمًا متعامدًا للمستوي بحيث تكون إحداثيا النقطتين A و B كما يأتي : A(−1 ; −2) ، B(−3 ; +2). ما هما عندئذ إحداثيا كلّ من C و D ؟', 'answerSource': 'read'})
E.append({'id': 'deep-6', 'kind': 'deepen', 'number': 6, 'page': 74, 'section': 'أتعمّق', 'title': 'لعبة السهام', 'verified': True,
          'text': 'تتمثل اللعبة في رمي سهم تجاه هدف عددًا من المرّات واحسب مجموع النقاط المسجلة تبعًا للمنطقة كما هو مبيّن على هامش الهدف. لتحديد موضع وصول السهم، علّمنا مستوي الهدف كما في الشكل. تبارى ثلاثة أصدقاء ... من الفائز ؟', 'answerSource': 'read'})
E.append({'id': 'deep-7', 'kind': 'deepen', 'number': 7, 'page': 74, 'section': 'أتعمّق', 'title': 'الأعداد النسبية والهندسة', 'verified': True,
          'text': '① علّم النقاط A(−1 ; 4) ، B(1 ; 4) ، C(3 ; 4) و D(1 ; −1) في معلم للمستوي. ② ارسم قطعتي المستقيم [AC] و [BD]. ماذا تلاحظ بالنسبة إلى النقاط A ، B ، C ، D ؟', 'answerSource': 'read'})
E.append({'id': 'deep-8', 'kind': 'deepen', 'number': 8, 'page': 74, 'section': 'أتعمّق', 'verified': True,
          'text': 'في معلم متعامد للمستوي، لدينا A(−2 ; −1). ① علّم النقطة A\' نظيرة A بالنسبة إلى محور الفواصل. ما هي إحداثيات A\' ؟ ② علّم النقطة B\' نظيرة A بالنسبة إلى محور التراتيب. ما هي إحداثيات B\' ؟ ماذا تستنتج ؟',
          'answer': {"A'": [-2, 1], "B'": [2, -1]}, 'answerSource': 'computed'})

# ── p. 75 : أتعلّم الإدماج ───────────────────────────────────────────────────────────────────────
E.append({'id': 'integration', 'kind': 'integration', 'page': 75, 'section': 'أتعلّم الإدماج', 'title': 'الجبال الجليدية', 'verified': True,
          'text': 'لا تزال الجبال الجليدية العائمة تشكّل خطرًا حقيقيًّا على السفن. تمثّل الصورة (2) جبلًا جليديًّا عائمًا ارتفاعه الكلّي 800m ، وخمس ارتفاعه خارج الماء. '
                  '① اكتب في شكل كسر الجزء المغمور منه. ② مثّل وضع الجبل الجليدي بمستقيم مدرّج. ③ ما هو العمق الذي ينبغي أن تكون فيه غواصة (الصورة 1) تتواجد قريبة من المكان، حتى تجتاز الحاجز بسلام ؟',
          'answer': {'submerged': '4/5', 'submergedMeters': 800 - 800 // 5, 'above': 800 // 5, 'deeperThan': 640}, 'answerSource': 'computed',
          'shortSolution': ['الجزء المغمور 640m.', 'العمق يزيد عن 640m.']})
assert 800 - 800 // 5 == 640
SKI = {500: F(-3, 2) * (500 - 900) / 100, 1900: F(-3, 2) * (1900 - 900) / 100}
assert SKI[500] == 6 and SKI[1900] == -15 and SKI[500] - SKI[1900] == 21
E.append({'id': 'evaluation', 'kind': 'integration', 'page': 75, 'section': 'وضعية تقويم', 'title': 'المتزلّج', 'verified': True,
          'text': 'ورد في النشرة الجوية أنّ درجة الحرارة هي 0°C عند علوّ 900m عن سطح البحر وأنّ الحرارة تنقص بـ 1,5°C كلّما ارتفعنا 100m. يسكن متزلّق على الثلوج قريبة من ارتفاع 500m وهو متواجد في مضمار تزلّج على ارتفاع 1900m في أعالي جرجرة. '
                  'ما هو الفرق في درجة الحرارة بين لحظة انطلاق المتزلّق ولحظة وصوله، علمًا أنّ مدة النزول هي 20 دقيقة ؟',
          'answer': {'startTemp': -15, 'endTemp': 6, 'difference': 21}, 'answerSource': 'computed'})

# ── p. 76 : استعمل تكنولوجيات الإعلام والاتصال ────────────────────────────────────────────────────
E.append({'id': 'ict', 'kind': 'ict', 'page': 76, 'section': 'استعمل تكنولوجيات الإعلام والاتصال', 'title': 'تعليم نقطة في المستوي باستعمال جيوجبرا', 'verified': True,
          'text': 'تهيئة : افتح ورقة عمل جديدة، انقر يمينًا واختر الشبكة. تعليم نقطة في مستوٍ مزوّد بمعلم : نريد حجز النقطة M(−2 ; 3). انقر على أداة نقطة جديدة، حدّد موضع النقطة M بقراءة بيانية وانقر عنده. لتغيير التسمية انقر بالأيمن واختر إعادة تسمية.',
          'answerSource': 'read'})
E.append({'id': 'ict-ex', 'kind': 'ict', 'page': 76, 'section': 'تمرين', 'verified': True,
          'text': 'احجز النقاط : A(6 ; 2) ، B(3 ; 2) ، C(3 ; −2) ، D(6 ; −2) ، E(−1 ; −2) ، F(−1 ; 5) ، G(−3 ; −2) ، H(−3 ; −2) ، I(−5 ; 1) ، J(−5 ; −2) ، K(−7 ; 1) ، L(−7 ; 5). '
          '① ما هو الشرط الذي يجب أن تحققه إحداثيات النقط حتى تكون في نفس ربع مستوٍ معيّن ؟ ② صل بين النقاط وفق الترتيب ABCDEF ثم FEJHIKL. ③ ما هي الكلمة التي تتحصل عليها ؟', 'answerSource': 'read',
          'note': 'relu par talim-fi-mustawi à 110 dpi : G et H sont imprimés tous deux (−3 ; −2) (coquille du manuel, non reprise)'})

# ── Destinations ────────────────────────────────────────────────────────────────────────────────────
L1, L2, L3, SYN = 'adad-nisbiya-siyaqat', 'talim-mustaqim-mudarraj', 'talim-fi-mustawi', 'wadiya-idmajiya-adad-nisbiya'
DEST = {
    '_comment': 'elementId → { lesson, module } ; `items` répartit un élément ; une leçon encore coming_soon est une destination EN ATTENTE (check-textbook-coverage.mjs). Première leçon générée de l’unité : adad-nisbiya-siyaqat (2026-10-30). Frontière entre les leçons : voir l’en-tête de build-extraction.py.',
    'objectives': {'lesson': 'unit', 'module': 'page'},
    'opener-lift': {'lesson': L1, 'module': 1, 'note': 'l\'ascenseur de la couverture devient la 3e scène du labo frost-gauge (les étages −2 … 5)'},
    'opener-rods': {'lesson': L1, 'module': 2, 'note': 'une carte « من التاريخ » en fin de معارف : les bâtonnets rouges (positifs) et noirs (négatifs)'},
    'prep': {'lesson': SYN, 'module': 0, 'note': 'p. 64 récapitule les unités 1–4 (aucun item ne porte sur les relatifs) : l\'« أستعدّ » de la synthèse le relira ; chaque leçon de l\'unité mesure ses items du réseau par des platform_addition'},
    'act-1-temp': {'lesson': L1, 'module': 1, 'note': 'ENTRÉE de la plateforme (guide §4ter) : le labo frost-gauge pose les températures d\'une semaine d\'hiver à Djelfa ; la carte du manuel n\'est pas reproduite'},
    'act-1-time': {'lesson': L1, 'module': 4, 'note': 'APPLICATION : dates avant et après (ق.م / م) en أتمرّن'},
    'act-1-need': {'lesson': L1, 'module': 2, 'note': '« 6 + … = 4 » : le besoin d\'un nombre au-dessous de 0 — première question de معارف'},
    'act-1-line': {'lesson': L2, 'module': 4, 'note': 'le symétrique d\'un point par rapport à O (E tel que O soit le milieu de [DE]) devient l\'exercice « نقطتان متناظرتان » de أتمرّن ; le tracé sur papier n\'est pas repris'},
    'act-2': {'lesson': L2, 'module': 1, 'note': 'repérer des points sur une droite graduée de −8 à 8 : devient la tâche `place` du labo stride-stamp (la température est l\'entrée de la leçon précédente)'},
    'act-3': {'lesson': L3, 'module': 1, 'note': 'ENTRÉE de la plateforme : la carte de l\'Algérie n\'est pas reproduite ; le labo courtyard-drone pose la cour d\'une école, la MÊME question (un nombre ne suffit pas, deux nombres dans un certain ordre) avec un drone'},
    'know-1': {'lesson': L1, 'module': 2},
    'know-2': {'lesson': L2, 'module': 2, 'items': {
        'half-line-def': {'lesson': L2, 'module': 2},
        'abscissa': {'lesson': L2, 'module': 2},
        'distance-opposites': {'lesson': L1, 'module': 2, 'note': 'P2 (distance à zéro) et P3 (opposés) : programme 1am.m5.r05 ; la leçon les NOMME après le labo'}}},
    'method-1': {'lesson': L2, 'module': 3},
    'now-68': {'lesson': L2, 'module': 4, 'note': 'lire A, B, C sur une droite à origine et repère 10 donnés, puis graduer avec 5 cm : repris par ex-12 (lecture) et ex-14 (graduer avec une unité en cm)'},
    'know-3': {'lesson': L3, 'module': 2, 'note': 'معلم متعامد, محور الفواصل / التراتيب, إحداثيا نقطة, فاصلة puis ترتيب : les mots NOMMENT ce que la main a fait'},
    'method-2': {'lesson': L3, 'module': 3, 'note': 'ورقة مرصوفة / غير مرصوفة : la plateforme écrit sa propre méthode (les deux parallèles aux axes) avec d\'autres nombres'},
    'now-70': {'lesson': L3, 'module': 4, 'note': 'placer des points dont deux sont sur un axe, puis lire les sommets d\'une lettre dessinée : repris par ex-16, ex-17 et ex-20 avec d\'autres points'},
    **{f'ex-{n}': {'lesson': L1, 'module': 4} for n in range(1, 10)},
    **{f'ex-{n}': {'lesson': L2, 'module': 4} for n in range(10, 16)},
    **{f'ex-{n}': {'lesson': L3, 'module': 4} for n in range(16, 22)},
    # ex-16 (placer K, S, J), ex-17 (points des axes), ex-18 (repère caché), ex-19 (choisir l\'échelle), ex-20 (lire sur la figure, même abscisse / même ordonnée), ex-21 (compléter avec les mots) : tous réécrits avec d\'autres points
    'self-1': {'lesson': L1, 'module': 8},
    'self-2': {'lesson': SYN, 'module': None, 'note': '1/7 « n\'est pas un nombre relatif » dépend de la définition 1AM (entier ou décimal signé) : la synthèse le relira'},
    'self-3': {'lesson': SYN, 'module': None, 'note': 'une baisse de 4 degrés à partir de −2 : addition de relatifs par la jauge, hors L1'},
    'self-4': {'lesson': L1, 'module': 4},
    'self-5': {'lesson': L2, 'module': 8, 'note': 'lire une abscisse à partir de deux graduations (0 et 25) : l\'épreuve E2 du إختبار أولي avec d\'autres nombres'},
    'self-6': {'lesson': L2, 'module': 8, 'note': 'placer A(+2), B(−5), C(+4,5), E(0) : en أتمرّن (lecture de positions) et l\'épreuve E4 du إختبار أولي'},
    'self-7': {'lesson': L3, 'module': 8, 'note': 'lire (x ; y) de G sur une figure : l\'épreuve E2 du إختبار أولي avec un autre point'},
    'self-8': {'lesson': L3, 'module': 8, 'note': 'sur l\'axe des abscisses l\'ordonnée est nulle : l\'épreuve E4'},
    'self-9': {'lesson': L3, 'module': 8, 'note': 'sur l\'axe des ordonnées l\'abscisse est nulle : l\'épreuve E5'},
    'self-10': {'lesson': L3, 'module': 4, 'note': 'placer cinq points dont deux sur un axe (décimaux compris) : repris en أتمرّن (positions et axes) et dans la banque'},
    'deep-1': {'lesson': L1, 'module': 6, 'note': 'مسألة 2 : le graphique est REDESSINÉ par la plateforme (écarts à la moyenne, valeurs simples)'},
    'deep-2': {'lesson': L2, 'module': 6, 'note': 'مسألة 2 : REDESSINÉE (une frise de l\'histoire d\'une école sur 24 cm, choisir l\'échelle) ; les dates du manuel ne sont pas reprises'},
    'deep-3': {'lesson': L2, 'module': 4, 'note': 'trois entiers négatifs consécutifs dont −30 : la lecture de la droite (voisins) en أتمرّن'}, 'deep-4': {'lesson': L2, 'module': 4, 'note': 'le sens du déplacement du limaçon n\'est pas vérifié sur le scan : l\'exercice de la plateforme DIT le sens (vers la droite) et ses propres heures et abscisses'},
    'deep-5': {'lesson': L3, 'module': 4, 'note': 'le repère caché : retrouver l\'origine à partir des coordonnées d\'un point (ex-18 aussi) ; réécrit'},
    'deep-6': {'lesson': L3, 'module': 6, 'note': 'مسألة 2 : REDESSINÉE (le jet de sacs dans une cible à couronnes carrées, trois élèves, les points marqués selon la couronne) ; la cible du manuel n\'est pas reproduite'},
    'deep-7': {'lesson': L3, 'module': 4, 'note': 'points d\'une même ordonnée, d\'une même abscisse, deux segments perpendiculaires : repris avec d\'autres points'},
    'deep-8': {'lesson': L3, 'module': 7, 'note': 'مسألة 3 : les symétriques de A par rapport aux axes (A\'(−2 ; 1), B\'(2 ; −1)) avec d\'autres points ; le sens des signes'},
    'integration': {'lesson': SYN, 'module': None},
    'evaluation': {'lesson': SYN, 'module': None},
    'ict': {'lesson': L3, 'module': 1, 'note': 'M(−2 ; 3) est le point-piège du labo (la même place avec les nombres dans l\'autre ordre) ; GeoGebra n\'est pas utilisé (jardin clos de la plateforme)'},
    'ict-ex': {'lesson': L3, 'module': 7, 'note': 'la condition pour que deux points soient dans le même quart de plan (mêmes signes), dans مسألة 3 ; le dessin de la lettre n\'est pas repris'},
}

DISCREPANCIES = [
    {'elementId': 'unit', 'kind': 'scope', 'text': 'Pas de تحدّ pour l\'unité 5 : la page d\'ouverture porte les objectifs, l\'ascenseur et l\'encart des bâtonnets chinois ; units_1am › adad-nisbiya.challenge reste null.'},
    {'elementId': 'prep', 'kind': 'reading', 'text': 'Item 6 : l\'opération entre 32,17 et 99,7 est illisible (RTL) — 32,17 + 99,7 = 131,87 ≈ 132 (131,97) ; 99,7 − 32,17 = 67,53 : aucune option ne convient. Item 4 : « عدد الأعشار » ambigu (89 ou 9). Récapitulatif du cycle, hors L1.'},
    {'elementId': 'act-1-temp', 'kind': 'reading', 'text': 'Les nombres de la carte (±7) sont lus approximativement ; l\'activité est repensée avec un tableau de la plateforme.'},
    {'elementId': 'ex-4', 'kind': 'content', 'text': 'L\'appariement date/événement est de culture générale (630 : fatḥ Makka ; −3400 : invention de l\'écriture ; 1959 : droits de l\'enfant ; −238 : naissance de Massinissa, valeurs approximatives) : la leçon utilise ses propres événements algériens, sans demander une date de mémoire.'},
    {'elementId': 'ex-5', 'kind': 'content', 'text': 'Recherche d\'altitudes sur Internet : l\'élève de la plateforme ne sort pas du jardin clos ; la leçon donne elle-même des altitudes et des profondeurs.'},
    {'elementId': 'self-1', 'kind': 'reading', 'text': 'La liste est lue {−8, 5, 12, 0, −0,5, 4, −4} (ordre RTL brouillé) ; les trois affirmations sont vraies (0 compte parmi les positifs).'},
    {'elementId': 'self-2', 'kind': 'scope', 'text': '1/7 : l\'énoncé suppose la définition 1AM des relatifs (entiers ou décimaux signés) ; 1/7 est un rationnel mais pas un relatif au sens du manuel de 1AM. Hors L1.'},
    {'elementId': 'deep-4', 'kind': 'reading', 'text': 'Le sens du déplacement du limaçon n\'est pas vérifié sur le scan : lu vers la droite, 2 unités par heure.'},
    {'elementId': 'act-1-line', 'kind': 'reading', 'text': 'Relu à 110 dpi par talim-mustaqim-mudarraj (2026-10-30) : A(4), B(5), D(7) ; F tel que A soit le milieu de [BF] → F(3) ; E tel que O soit le milieu de [DE] → E(−7). Les éléments act-2 (le tableau des températures −6, 0, 7, 4, −5, 6), method-1 (A(−3), B(2,7)), now-68, ex-10 … ex-15, self-5, self-6, deep-2 et deep-3 sont relus et vérifiés ; self-5 : les graduations de la figure (0 et 25 donnés) sont lues approximativement, l\'épreuve de la leçon utilise ses propres nombres.'},
    {'elementId': 'ict-ex', 'kind': 'misprint', 'text': 'Relu à 110 dpi par talim-fi-mustawi (2026-10-30) : G et H sont imprimés tous deux (−3 ; −2) ; la leçon n\'utilise pas cette liste. Les éléments act-3, know-3, method-2, now-70, ex-16 … ex-21, self-7 … self-10, deep-5 … deep-8 et ict sont relus et vérifiés ; ex-20 (200 dpi) : A(−5 ; 0), B(−3 ; 1), C(−2 ; 2), D(−1 ; 4), E(−1 ; −1), F(0 ; −3), G(3 ; 1), H(3 ; −1) ; self-7 : G(3 ; −1) ; les figures du manuel ne sont pas reproduites.'},
    {'elementId': 'unit', 'kind': 'scope', 'text': 'Pages 63–76 complètes. Les éléments de la synthèse sont transcrits plus brièvement (verified: false) : sa leçon les relira.'},
]

doc = {
    '_comment': [
        'EXTRACTION CANONIQUE du manuel scolaire officiel — 1AM, الجيل الثاني (موفم 2017), unité 5 « الأعداد النسبية ».',
        'Source : docs/official-book-pdfs/كتاب الرياضيات للسنة الأولى متوسط الجيل الثاني.pdf, pages 63 à 76.',
        'Ce fichier est LA source de vérité pédagogique de l’unité ; tout contenu cite un `id` d’ici via `source.elementId`.',
        'Transcription VISUELLE ; réponses calculées (Fraction, Decimal) dans build-extraction.py, `answerSource: computed`.',
        'Généré par docs/sources/1am/unit5/build-extraction.py — ne pas éditer à la main.',
    ],
    'unitCode': 'adad-nisbiya',
    'textbook': {'title': 'كتاب الرياضيات — السنة الأولى من التعليم المتوسط', 'generation': 'الجيل الثاني', 'unitNumber': 5,
                 'unitTitle': 'الأعداد النسبية', 'pages': {'first': 63, 'last': 76}, 'pdfPageOffset': 0,
                 'sections': ['سأتعلّم في هذا الباب', 'استحضر مكتسباتي', 'اكتشف', 'أحوصل تعلّماتي', 'أكتسب طرائق', 'دوري الآن', 'أتمرّن', 'أقوّم تعلّماتي', 'أتعمّق', 'أتعلّم الإدماج', 'وضعية تقويم', 'استعمل تكنولوجيات الإعلام والاتصال']},
    'frozenAt': '2026-10-30',
    'terminology': {'note': 'Le manuel écrit « الأعداد النسبية », « عدد نسبي موجب / سالب », « العددان المتعاكسان », « المسافة إلى الصفر », « المبدأ », « فاصلة نقطة », « إحداثيا نقطة », « محور الفواصل / التراتيب ». Écriture : « −3 » (signe moins), « +3 » ou « 3 » (le + peut être omis).',
                    'terms': ['عدد نسبي', 'عدد موجب', 'عدد سالب', 'إشارة', 'المسافة إلى الصفر', 'عددان متعاكسان', 'عدد صحيح نسبي', 'المستقيم المدرّج', 'المبدأ', 'فاصلة', 'معلم متعامد', 'إحداثيا نقطة']},
    'elements': E,
    'discrepancies': DISCREPANCIES,
    'destinations': DEST,
}

ids = [e['id'] for e in E]
assert len(ids) == len(set(ids)), 'id en double'
missing = [i for i in ids if i not in DEST]
assert not missing, f'éléments sans destination : {missing}'
extra = [k for k in DEST if k != '_comment' and k not in ids]
assert not extra, f'destinations sans élément : {extra}'

out = Path(__file__).with_name('extraction.json')
out.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
mine = sum(1 for k, v in DEST.items() if k != '_comment' and v['lesson'] == L1)
pending = sum(1 for k, v in DEST.items() if k != '_comment' and v['lesson'] not in ('unit', L1))
print(f'{out} — {len(E)} éléments ({mine} pour {L1}, {pending} vers les autres leçons de l’unité)')
