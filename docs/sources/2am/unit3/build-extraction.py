#!/usr/bin/env python3
"""Génère docs/sources/2am/unit3/extraction.json — 2AM, unité 3 « الأعداد النسبية » (manuel الجيل الثاني, منشورات الشهاب ;
pp. 38–53 du livre = PDF 35–50, décalage 3 — docs/sources/2am/textbook-map.json).

Transcription VISUELLE (pages rendues à 90–200 dpi). Le scan de 2AM est la seule copie (décisions D5/D9 : on prend l'idée,
on ne s'attarde pas sur l'illisible) ; défauts connus de ces pages : le bord droit des pp. 41, 43, 44, 45, 46, 47 est coupé
(titres des activités 3–6, fins de lignes), les nombres de plusieurs exercices sont tronqués. Les éléments de la leçon
GÉNÉRÉE ici (muqarana-nisbiya) sont relus à 200 dpi (`verified: True`) ; les autres sont transcrits plus brièvement
(`verified: False`) : leur leçon les relira. Les réponses sont CALCULÉES ici (Fraction / Decimal exacts), jamais tapées.

L'unité est générée LEÇON PAR LEÇON (file de génération, Phase A) ; les destinations vers une leçon encore `coming_soon`
sont EN ATTENTE (scripts/check-textbook-coverage.mjs).

FRONTIÈRES DES LEÇONS (à respecter par chaque lead qui génère la suite) :
  talim-mustaqim-mudarraj-2 (2am.m4.r01) — GÉNÉRÉE le 2026-10-29 (lab `corniche-ruler`) ; destinations : act-1 a-b, ex-1…11 → module 4, know-1a → 2, prep 1-4 → 0, self-4 → 8.
        CE QUI EST DEVANT : le nombre relatif (signe + distance à zéro), deux nombres
        opposés, la LECTURE d'une abscisse et le placement d'un point sur une droite graduée, le choix de l'origine et de
        l'unité (act-1 a, b ; know-1a ; ex-1…11). NON générée : « أستعدّ » de muqarana-nisbiya la RAPPELLE, ne la reconstruit pas.
  muqarana-nisbiya (2am.m4.r02, r03) — CETTE LEÇON : comparer deux relatifs (règles négatif/négatif, positif/positif, signes
        différents), ranger dans l'ordre croissant / décroissant avec < et > (act-2 ; know-1b ; method-1 ; ex-12…20 ;
        self-5, self-6 ; deep-38, deep-40 à moitié). Elle n'emploie PAS le repère du plan ni les sommes.
  talim-nuqta-mustawi (2am.m4.r04) — SERA GÉNÉRÉE PLUS TARD DANS CETTE CAMPAGNE : le repère orthogonal, abscisse / ordonnée d'un
        point du plan (act-1 c ; know-1c ; method-2 ; ex-21…24 ; self-1…3 ; deep-55…56). Elle devra relire act-1 c p. 40 et p. 43.
  jam-tarh-nisbiya (2am.m4.r05) — GÉNÉRÉE le 2026-10-29 (lab `balloon-ballast`) : somme et différence de DEUX relatifs (act-3, act-4 → module 4 ; know-2a, 2b → 2 ; method-3, method-4, now-45 → 3 ;
        ex-25…28, ex-30…34 → 4 ; self-7, self-8 → 8 ; deep-45, deep-48, deep-57 → banque). ex-29, deep-49, deep-50, deep-58 (trois termes ou plus) → majmu-jabri.
  masafa-nuqtatayn (2am.m4.r07) — GÉNÉRÉE le 2026-10-29 (lab `gap-caliper`) : act-5, ict-1, ex-35, deep-40…42 → module 4 ; know-2c → 2 ; self-9 → 8 ; la distance entre deux points d'une droite graduée
        (act-5 ; know-2c ; ex-35 ; self-9 ; ict) ; elle lit la distance comme « le plus grand moins le plus petit », ce
        qui réutilise la comparaison de muqarana-nisbiya.
  majmu-jabri (2am.m4.r06) — GÉNÉRÉE le 2026-10-29 (lab `tug-rope`) : somme algébrique de 3 termes ou plus, simplification d'écriture (act-6, ex-29, ex-36…37, deep-39, 43, 44, 46, 58 → module 4 ; know-2d, 2e → 2 ; method-5 → 3 ; self-10, self-11 → 8 (non cités) ; deep-47, 49, 50, 59 → banque).
  wadiya-idmajiya-adad-nisbiya-2 — la synthèse : intégration (p. 52), évaluation, tahaddi (les Grands Lacs).

Usage : python3 docs/sources/2am/unit3/build-extraction.py
"""
import json
from decimal import Decimal as D
from fractions import Fraction as F
from pathlib import Path


def dec(s):
    return D(str(s).replace(',', '.').replace('−', '-'))


def fr(x):
    """Un décimal exact écrit à l'algérienne (virgule, signe moins ASCII)."""
    x = D(x).normalize()
    t = format(x, 'f').replace('.', ',')
    return t


def rel(s):
    return F(dec(s))


E = []

# ── p. 38 : ouverture ──────────────────────────────────────────────────────────────────────────────
E.append({
    'id': 'objectives', 'kind': 'objectives', 'page': 38, 'section': 'سأتعلّم في هذا الباب', 'verified': True,
    'items': [
        '1. الأعداد النسبية تعليم، مقارنة: التعليم على مستقيم مدرّج، مقارنة عددين نسبيين، تعليم نقطة في مستوي.',
        '2. الأعداد النسبية جمع وطرح: جمع وطرح عددين نسبيين، حساب مجموع جبري، حساب المسافة بين نقطتين ذات فاصلتين معلومتين على مستقيم مدرّج.',
    ],
})
E.append({
    'id': 'opener', 'kind': 'aside', 'page': 38, 'section': 'تمهيد', 'verified': False,
    'text': 'أبرد الأماكن المأهولة على سطح الأرض هي في شمال شرق سيبيريا في روسيا، انخفض الزئبق في مدن فيرخويانسك وأويمياكون إلى −67,8° في 1892 و 1933 على التوالي. أسخن الأماكن (المأهولة) فنذكر منها منطقة وادي الموت بولاية نيفادا في الولايات المتحدة الأمريكية التي بلغت 56,7° سنة 1913، وكذا منطقة عين صالح بالجزائر إذ تتجاوز فيها الحرارة 50° … (النص مقصوص من الجهة اليمنى).',
    'figure': 'صورة منطقة أراك بقرب عين صالح.',
    'reading': 'texte coupé à droite sur le scan ; les deux températures extrêmes (−67,8° et 56,7°) sont lisibles',
    'answer': {'coldest': '-67,8', 'hottest': '56,7', 'coldestSmaller': rel('-67,8') < rel('56,7')}, 'answerSource': 'computed',
})
# les Grands Lacs : altitude de la surface et du fond (m)
LAKES = [('البحيرة العليا', 183, -223), ('بحيرة هيرون', 176, -63), ('بحيرة ميشيغان', 176, -105), ('بحيرة إيري', 173, 109), ('بحيرة أونتاريو', 74, -170)]
DEPTHS = {n: top - bottom for n, top, bottom in LAKES}
E.append({
    'id': 'challenge', 'kind': 'challenge', 'page': 38, 'section': 'تحدّي', 'verified': False,
    'text': 'تمثّل الوثيقة أدناه مخططا للبحيرات العظمى بأمريكا الشمالية. باستغلال المعلومات الواردة على الوثيقة، احسب عمق كلّ بحيرة (من سطح البحيرة إلى أعمق نقطة فيها).',
    'figure': 'مقطع شاقولي: ارتفاع سطح كل بحيرة (+183 m، +176 m، +173 m، +74 m …) وارتفاع قاعها (−223 m للبحيرة العليا، −63 m هيرون، −105 m ميشيغان، +109 m إيري، −170 m أونتاريو) بالنسبة إلى مستوى سطح البحر (0 m).',
    'answer': {'depths': DEPTHS}, 'answerSource': 'computed',
    'reading': 'les chiffres de Huron (−63 ?) et d’Érié (+109) sont lus sur un scan flou ; profondeur = altitude de la surface − altitude du fond',
})

# ── p. 39 : أستعدّ (13 items) ──────────────────────────────────────────────────────────────────────
PREP = [
    {'n': 1, 'question': '−2 هو عدد:', 'options': ['صحيح نسبي', 'موجب', 'سالب'], 'correct': [0, 2], 'why': '−2 عدد نسبي سالب', 'verified': False},
    {'n': 2, 'question': 'في قائمة الأعداد: −45 ؛ 5 ؛ 3,1 ؛ 0,333 ؛ 0 ؛ 1/7 ، يوجد عدد ليس عددا نسبيا، هو:', 'options': ['0,333', '1/7', '0'], 'correct': [1], 'why': '1/7 لا يُكتب كتابة عشرية منتهية (لا يوجد من بين الأعداد النسبية للمنهاج)', 'verified': False},
    {'n': 3, 'question': 'العدد المعاكس للعدد النسبي (−8) هو:', 'options': ['8', '1/8', '−(−8)'], 'correct': [0, 2], 'why': 'معاكس −8 هو 8 = −(−8)', 'verified': False},
    {'n': 4, 'question': 'العددان النسبيان (+1,2) و (−2,1) متعاكسان.', 'options': ['صحيح', 'خاطئ', 'لا يمكن الحكم'], 'correct': [1], 'why': 'معاكس 1,2 هو −1,2 وليس −2,1', 'verified': False},
    {'n': 5, 'question': 'المسافة إلى الصفر للعدد النسبي (−1,7) هي:', 'options': ['1,7', '−1,7', '17'], 'correct': [0], 'why': 'المسافة إلى الصفر موجبة: 1,7', 'verified': True},
    {'n': 6, 'question': 'فاصلة النقطة M على المستقيم المدرّج هي:', 'options': ['−2', '0', '−2,5'], 'correct': [0], 'why': 'M على التدريجة −2', 'figure': 'مستقيم مدرّج من −4 إلى 3، M عند −2 و N عند 2', 'verified': True, 'reading': 'M est lue sur la graduation −2 (scan à 90 dpi)'},
    {'n': 7, 'question': 'النقطة التي فاصلتها 3 هي:', 'options': ['M', 'N', 'L'], 'correct': [2], 'why': 'L على التدريجة 3', 'figure': 'مستقيم مدرّج من −3 إلى 3، M عند −2 و N عند 2 و L عند 3', 'verified': True},
    {'n': 8, 'question': 'إحداثيا النقطة P هما:', 'options': ['(3;5)', '(5;3)', '(5;4)'], 'correct': [1], 'why': 'الفاصلة 5 ثم الترتيب 3', 'verified': False},
    {'n': 9, 'question': 'النقطة ذات الإحداثيين (0;3) هي:', 'options': ['R', 'S', 'T'], 'correct': [0], 'why': 'فاصلتها معدومة: على محور التراتيب', 'verified': False},
    {'n': 10, 'question': 'إذا كان موضع نقطة على محور الفواصل، فإنّ:', 'options': ['فاصلتها معدومة', 'ترتيبها معدوم', 'إحداثياها معدومان'], 'correct': [1], 'why': 'ترتيبها معدوم', 'verified': False},
    {'n': 11, 'question': 'إذا كان موضع نقطة على محور التراتيب، فإنّ:', 'options': ['فاصلتها معدومة', 'ترتيبها معدوم', 'إحداثياها معدومان'], 'correct': [0], 'why': 'فاصلتها معدومة', 'verified': False},
    {'n': 12, 'question': 'النقاط M(−1;1) ، O(0;0) و N(−3;3) هي:', 'options': ['في استقامة', 'ليست في استقامة'], 'correct': [0], 'why': 'النقط على المستقيم y = −x', 'verified': False},
    {'n': 13, 'question': 'النقطتان K(2;5) و L(−2;5) هما:', 'options': ['متناظرتان بالنسبة إلى محور الفواصل', 'متناظرتان بالنسبة إلى محور التراتيب'], 'correct': [1], 'why': 'نفس الترتيب وفاصلتان متعاكستان', 'verified': False},
]
E.append({'id': 'prep', 'kind': 'prerequisites', 'page': 39, 'section': 'أستعدّ', 'verified': True,
          'instruction': 'اختر الإجابة الصحيحة (أو الإجابات الصحيحة) في كل حالة، مبرّرا إياها.', 'items': PREP, 'answerSource': 'computed'})

# ── pp. 40–41 : أنشطة ──────────────────────────────────────────────────────────────────────────────
DATES = [('باب البنود – بجاية', 1067), ('مقام الشهيد – الجزائر', 1981), ('حديقة التجارب – الجزائر', 1832), ('الضريح الملكي – تيپازة', -25)]
ordered = sorted(DATES, key=lambda t: t[1])
E.append({
    'id': 'act-1', 'kind': 'activity', 'number': 1, 'page': 40, 'section': 'أنشطة', 'title': 'تعليم نقاط', 'verified': False,
    'text': '• التعليم في الزمن: أ) رتّب المنشآت الآتية حسب تاريخ إنجازها (باب البنود – بجاية 1067 م ؛ مقام الشهيد – الجزائر 1981 م ؛ حديقة التجارب – الجزائر 1832 م ؛ الضريح الملكي – تيپازة 25 ق.م). ب) ضع تواريخ المنشآت A و B و C و D على مستقيم مدرّج مناسب. جـ) قارن النتيجة المحصّل عليها في أ) مع مواضع النقاط على المستقيم المدرّج.\n'
            '• تعليم نقاط على مستقيم مدرّج: عيّن فواصل النقاط K و L و M و N (مستقيم من −4 إلى 3). أ) ارسم مستقيما مدرّجا مماثلا ثم ضع عليه النقاط A(−4) ، B(+3) ، C(−2,5) ، D(+4). ب) ارسم، في كل مرّة، مستقيما مدرّجا وضع عليه النقاط المفروضة باختيار تدريج مناسب: A(+100) ، B(0) ، C(−25) ، D(+75) ؛ M(+0,1) ، N(−0,5) ، O(0) ، P(−1).\n'
            '• تعليم نقاط في المستوي: 1) ارسم الشكل المقابل. إحداثيا النقطة A هما (4;2). ما هي إحداثيات النقاط B و C و D؟ 2) ضع النقطة E نظيرة D بالنسبة إلى محور الفواصل. 3) ارسم قطعتي المستقيم [BC] و [DE] . ما هو الرقم الذي تتحصّل عليه؟',
    'answer': {'chronological': [n for n, y in ordered]}, 'answerSource': 'computed',
    'reading': 'trois sous-activités : la ligne du temps et le placement (talim-mustaqim-mudarraj-2), le plan (talim-nuqta-mustawi)',
})
TEMPS = [5, -3, -4, 6, -1, 4]
E.append({
    'id': 'act-2', 'kind': 'activity', 'number': 2, 'page': 40, 'section': 'أنشطة', 'title': 'مقارنة عددين نسبيين', 'verified': True,
    'text': 'فيما يلي درجات الحرارة المسجّلة في بعض المدن الجزائرية في أحد أيّام فصل الشتاء (ستة مقاييس حرارة مدرّجة من −6 إلى 6). أ) بالاستعانة بمستقيم مدرّج، قارن درجات الحرارة المسجّلة. ب) أكمل بالرّمز المناسب: < أو > . −4 … 5 ؛ −2 … −3 ؛ 0 … −6 ؛ 5,27 … 3,58 ؛ −2,8 … −5,7 ؛ 16 … −1,6 . جـ) رتّب تصاعديا الأعداد النسبية الآتية: …',
    'figure': 'ستة مقاييس حرارة (الزئبق عند 5,5 ؛ −3,5 ؛ −3 ؛ 5 ؛ −1 ؛ 4,5 تقريبا)، التدريج من −6 إلى 6.',
    'items': [('-4', '5'), ('-2', '-3'), ('0', '-6'), ('5,27', '3,58'), ('-2,8', '-5,7'), ('16', '-1,6')],
    'answer': {'b': ['<' if rel(a) < rel(b) else '>' for a, b in [('-4', '5'), ('-2', '-3'), ('0', '-6'), ('5,27', '3,58'), ('-2,8', '-5,7'), ('16', '-1,6')]]},
    'answerSource': 'computed',
    'reading': 'six thermomètres lus à 200 dpi ; la liste de c) est coupée à droite (non transcrite)',
})
GAINS = [('الأحد', 10, -4), ('الاثنين', 9, 7), ('الثلاثاء', -8, 8), ('الأربعاء', 5, 3), ('الخميس', -10, 15), ('الجمعة', -10, -9), ('السبت', 10, -15)]
E.append({
    'id': 'act-3', 'kind': 'activity', 'number': 3, 'page': 41, 'section': 'أنشطة', 'title': 'جمع عددين نسبيين', 'verified': False,
    'text': 'في العطلة، يلعب أمين لعبة فيديو مرّتين كلّ يوم. تتمثّل اللعبة في ربح أو خسارة نقط. أ) أكمل الجدول وأكمل عمود الحصيلة. ب) لمعرفة حصيلة الأسبوع، اقترح أمين كتابة حصيلة كلّ يوم على الشكل: (+6) + (−4) = (+2) . ج) احسب الحصيلة بنفس الكيفية. د) بالتمعّن في الحسابات السابقة، ضع تخمينا مناسبا لمجموع عددين نسبيين.',
    'table': [{'day': d, 'round1': a, 'round2': b, 'total': a + b} for d, a, b in GAINS],
    'answer': {'dayTotals': [a + b for _, a, b in GAINS], 'week': sum(a + b for _, a, b in GAINS)}, 'answerSource': 'computed',
    'reading': 'bord droit coupé : les titres des activités 3 à 6 sont incomplets',
})
E.append({
    'id': 'act-4', 'kind': 'activity', 'number': 4, 'page': 41, 'section': 'أنشطة', 'title': 'طرح عددين نسبيين', 'verified': False,
    'text': 'ارتفعت درجة الحرارة منذ حين إلى −2 °C ثم انخفضت بـ 5 °C . أ) بالاستعانة بمحرار، ترجم تغيّر وضعيّة الطقس بحساب مناسب. ب) لحساب (−7) − (+5) ، اقترح أستاذ مساعدة لتلاميذه تتمثّل في إضافة (−7) + (+7) + … إلى الحساب. ج) بالمثل، اقترح أمين الحساب المقابل: (+5) − (−7) = (+5) + (+7) = (+12) . د) اشرح لماذا يمكن إضافة ما كُتب بالأحمر دون تغيير نتيجة الحساب. هـ) بنفس الكيفية، احسب: (+15) − (−3) ؛ (+6) − (+7) ؛ (+2) − (−9) ؛ (−6) − (−8) . و) اقترح طريقة لحساب فرق عددين نسبيين.',
    'answer': {'items': {'(+5)-(-7)': 12, '(+15)-(-3)': 18, '(+6)-(+7)': -1, '(+2)-(-9)': 11, '(-6)-(-8)': 2, '(-7)-(+5)': -12}}, 'answerSource': 'computed',
})
PTS = {'A': 5, 'B': -1, 'C': -6}
E.append({
    'id': 'act-5', 'kind': 'activity', 'number': 5, 'page': 41, 'section': 'أنشطة', 'title': 'المسافة بين نقطتين', 'verified': True,
    'text': 'ضع على المستقيم المدرّج النقاط A(…) ، B(5) ، C(−1) و D(−6) . ما هي المسافات AB و AC و BC و CD ؟ احسب المسافات AB و AC و BC و CD باستعمال فواصل النقاط. قارن النتائج مع القياس المباشر. استنتج قاعدة لحساب المسافة بين نقطتين عُلمت فاصلتاهما.',
    'answer': {'BC': 6, 'CD': 5}, 'answerSource': 'computed',
    'reading': 'relu à 110 dpi (2026-10-29) : la ligne est coupée à droite — on lit B(5), C(−1), D(−6) et l’abscisse de A est perdue ; les réponses BC et CD sont calculées sur ces points (la leçon utilise ses propres points)',
})
E.append({
    'id': 'act-6', 'kind': 'activity', 'number': 6, 'page': 41, 'section': 'أنشطة', 'title': 'حساب مجموع جبري', 'verified': True,
    'text': 'أ) أكمل الحساب. A = (−9) − (+2) + (−5) − (…) = (−9) + (…) + (…) + (…) = (…) . ب) احسب: A = (−12) − (+7) − (−10) − (+3) ؛ B = (+6) + (−1) − (−4) + (+3) .',
    'answer': {'A': -12 - 7 + 10 - 3, 'B': 6 - 1 + 4 + 3}, 'answerSource': 'computed',
})

# ── p. 42 : معارف 1 (تعليم، مقارنة) ───────────────────────────────────────────────────────────────
E.append({
    'id': 'know-1a', 'kind': 'knowledge', 'number': 1, 'page': 42, 'section': 'معارف', 'title': 'التعليم على مستقيم مدرّج', 'verified': True,
    'text': 'يسمّى العدد النسبي الذي يسمح بتعليم نقطة على مستقيم مدرّج فاصلة هذه النقطة. مثال: فاصلة A هي (−3) ونكتب: A(−3). المسافة إلى الصفر لكلّ من العددين النسبيين (+3) و (−3) هي 3 ؛ (+3) و (−3) عددان نسبيان متعاكسان.',
})
E.append({
    'id': 'know-1b', 'kind': 'knowledge', 'number': 1, 'page': 42, 'section': 'معارف', 'title': 'مقارنة عددين نسبيين', 'verified': True,
    'properties': [
        'خاصية 1 : إذا كان عددان نسبيان سالبين، فإنّ الأصغر هو الذي له أكبر مسافة إلى الصفر.',
        'خاصية 2 : إذا كان عددان نسبيان موجبين، فإنّ الأصغر هو الذي له أصغر مسافة إلى الصفر.',
        'خاصية 3 : إذا كان عددان نسبيان من إشارتين مختلفتين، فإنّ الأصغر هو العدد السالب.',
    ],
    'examples': 'بالتنقّل على المستقيم المدرّج في الاتجاه المبيّن بالسهم نجد: النقطة F قبل النقطة E، منه −2,5 < −4 (كما كُتب) ؛ النقطة G قبل النقطة H، منه 2,5 < 5 ؛ النقطة E قبل النقطة G، منه −2,5 < 2,5.',
    'reading': 'le premier exemple imprimé « −2,5 < −4 » est une coquille (le texte précise F avant E) : −4 < −2,5. Relu à 200 dpi. Correction à la génération.',
    'answer': {'F_E': '-4 < -2,5', 'G_H': '2,5 < 5', 'E_G': '-2,5 < 2,5'}, 'answerSource': 'computed',
})
E.append({
    'id': 'know-1c', 'kind': 'knowledge', 'number': 1, 'page': 42, 'section': 'معارف', 'title': 'تعليم نقطة في المستوي', 'verified': False,
    'text': 'في معلم للمستوي، يمثّل موضع نقطة عددين نسبيين هما إحداثيا النقطة: يسمّى العدد الأول الفاصلة ويُقرأ على المحور الأفقي ؛ ويسمّى العدد الثاني الترتيب ويُقرأ على المحور العمودي. مثال: فاصلة النقطة A هي −3 وترتيبها 2 ؛ إحداثيا A هما (−3 ; 2) ونكتب A(−3 ; 2).',
})

# ── p. 43 : طرائق 1 ────────────────────────────────────────────────────────────────────────────────
ORD1 = ['1,7', '3,2', '-4,1', '5,5', '0', '-5,6', '7']
ASC1 = sorted(ORD1, key=rel)
E.append({
    'id': 'method-1', 'kind': 'method', 'number': 1, 'page': 43, 'section': 'طرائق', 'title': 'مقارنة وترتيب أعداد نسبية', 'verified': True,
    'exercise': 'رتّب تصاعديا الأعداد النسبية الآتية: 1,7 ؛ 3,2 ؛ −4,1 ؛ 5,5 ؛ 0 ؛ −5,6 ؛ 7.',
    'solution': '−5,6 < −4,1 < 0 < 1,7 < 3,2 < 5,5 < 7 (على مستقيم مدرّج من −8 إلى 8).',
    'method': ['أرسم مستقيما وأختار عليه تدريجا مناسبا.', 'أضع الأعداد النسبية عليه.', 'أقرأ الأعداد من اليسار إلى اليمين.'],
    'remarks': ['المقصود بترتيب أعداد تصاعديا، ترتيبها من العدد الأصغر إلى العدد الأكبر.', 'في المقارنة، يمكن الاستعانة بمستقيم عددي.'],
    'answer': {'ascending': ASC1}, 'answerSource': 'computed',
})
E.append({
    'id': 'method-2', 'kind': 'method', 'number': 2, 'page': 43, 'section': 'طرائق', 'title': 'وضع نقطة في معلم المستوي', 'verified': False,
    'exercise': 'ارسم معلما متعامدا ومتجانسا للمستوي، ثم علّم عليه النقطة R(−1,5 ; 4).',
    'method': ['نرسم الموازي لمحور التراتيب المارّ من التدريجة −1,5 لمحور الفواصل.', 'نرسم الموازي لمحور الفواصل والمارّ من التدريجة 4 لمحور التراتيب.', 'يكون موضع النقطة عند تقاطع الموازيين.'],
})
E.append({
    'id': 'now-43', 'kind': 'now', 'page': 43, 'section': 'دوري الآن', 'verified': True,
    'text': '① ضع على مستقيم مدرّج مناسب النقاط A ، B ، C ، D و E والتي فواصلها على الترتيب: −5,1 ؛ 3,2 ؛ −3,5 ؛ −4 ؛ 6. رتّب تنازليا الأعداد: −5,1 ؛ 3,2 ؛ −3,5 ؛ −4 ؛ 6.\n② ضع في معلم للمستوى النقطتين R(−4;4) و R(4;−4). أنشئ النقطة S حتى يكون المثلث RST قائما ومتساوي الساقين. ما هما إحداثيا النقطة S؟',
    'answer': {'descending': sorted(['-5,1', '3,2', '-3,5', '-4', '6'], key=rel, reverse=True)}, 'answerSource': 'computed',
    'reading': 'le texte du ① est le même ordre que le ② (placer puis ranger) ; le ② concerne le plan (talim-nuqta-mustawi)',
})

# ── p. 44 : معارف 2 (جمع، طرح) ───────────────────────────────────────────────────────────────────
E.append({
    'id': 'know-2a', 'kind': 'knowledge', 'number': 2, 'page': 44, 'section': 'معارف', 'title': 'جمع عددين نسبيين', 'verified': True,
    'properties': ['خاصية 1 : لجمع عددين نسبيين من نفس الإشارة: نجمع مسافتيهما إلى الصفر، ونضع أمام النتيجة الإشارة المشتركة للعددين.',
                   'خاصية 2 : لجمع عددين نسبيين من إشارتين مختلفتين: نطرح المسافة الأصغر إلى الصفر من المسافة الأكبر إلى الصفر، ونضع أمام النتيجة إشارة العدد النسبيّ الذي له أكبر مسافة إلى الصفر.'],
    'examples': ['(−3,2) + (−5) = (−8,2)', '(+3,2) + (+5) = (+8,2)', '(−9) + (+5) = (−4)', '(+9) + (−5) = (+4)'],
    'answer': {'ex': [-3.2 - 5, 3.2 + 5, -9 + 5, 9 - 5]}, 'answerSource': 'computed',
})
E.append({'id': 'know-2b', 'kind': 'knowledge', 'number': 2, 'page': 44, 'section': 'معارف', 'title': 'طرح عددين نسبيين', 'verified': True,
          'properties': ['خاصية : لطرح عدد نسبيّ، نضيف معاكسه.'], 'examples': ['(+11) − (−5) = (+11) + (+5) = (+16)'], 'answer': {'ex': 16}, 'answerSource': 'computed'})
E.append({'id': 'know-2c', 'kind': 'knowledge', 'number': 2, 'page': 44, 'section': 'معارف', 'title': 'المسافة بين نقطتين', 'verified': True,
          'properties': ['خاصية : لحساب المسافة بين نقطتين على مستقيم مدرّج، نحسب الفرق بين أكبر فاصلة وأصغر فاصلة.'],
          'examples': ['A(+6) و B(−2,5): الفرق (+6) − (−2,5) لأنّ (+6) > (−2,5) ، إذن AB = (+6) + (+2,5) = (+8,5)'],
          'remark': 'ملاحظة : المسافة هي عدد موجب دائما.', 'answer': {'AB': 8.5}, 'answerSource': 'computed'})
E.append({'id': 'know-2d', 'kind': 'knowledge', 'number': 2, 'page': 44, 'section': 'معارف', 'title': 'حساب مجموع جبري', 'verified': False,
          'text': 'المجموع الجبري هو سلسلة عمليات جمع وطرح أعداد نسبية. مثال: S = (+5) − (+6) + (−8) + (−3) = (+5) + (−6) + (−8) + (−3) = (+5) + (−17) ، إذن S = (−12). ملاحظة : في حساب سلسلة عمليات جمع وطرح، يمكن نقل وتجميع الحدود.',
          'answer': {'S': 5 - 6 - 8 - 3}, 'answerSource': 'computed'})
E.append({'id': 'know-2e', 'kind': 'knowledge', 'number': 2, 'page': 44, 'section': 'معارف', 'title': 'تبسيط كتابة', 'verified': False,
          'text': 'اصطلاح : يمكن حذف الإشارة + وأقواس الأعداد الموجبة. يمكن حذف إشارة العدد الموجب عندما يكون في أوّل المجموع. مثال: نكتب (+6) = 6 ؛ (+5) − (+4) = 5 − 4.'})

# ── p. 45 : طرائق 3–5 ─────────────────────────────────────────────────────────────────────────────
E.append({'id': 'method-3', 'kind': 'method', 'number': 3, 'page': 45, 'section': 'طرائق', 'title': 'حساب مجموع عددين نسبيين', 'verified': True,
          'exercise': 'أجرِ عمليتي الجمع: A = (−4) + (−7) ؛ B = (−4) + (+7).',
          'solution': {'A': -11, 'B': 3}, 'answer': {'A': -4 - 7, 'B': -4 + 7}, 'answerSource': 'computed'})
E.append({'id': 'method-4', 'kind': 'method', 'number': 4, 'page': 45, 'section': 'طرائق', 'title': 'حساب فرق عددين نسبيين', 'verified': True,
          'exercise': 'احسب: A = (+8,4) − (−5,2) ؛ B = (+3) − (+7) ؛ C = (−3) − (+7).',
          'answer': {'A': float(D('8.4') + D('5.2')), 'B': 3 - 7, 'C': -3 - 7}, 'answerSource': 'computed'})
E.append({'id': 'method-5', 'kind': 'method', 'number': 5, 'page': 45, 'section': 'طرائق', 'title': 'حساب مجموع جبري', 'verified': False,
          'exercise': 'احسب المجموع S = (+5,2) + (−6) − (+9) + (+6,3) − (−5,2) − (−11).',
          'answer': {'S': float(D('5.2') - 6 - 9 + D('6.3') + D('5.2') + 11)}, 'answerSource': 'computed'})
E.append({'id': 'now-45', 'kind': 'now', 'page': 45, 'section': 'دوري الآن', 'verified': True,
          'text': '① احسب: A = (−11) + (−9) ؛ A = (+8) + (−13) ؛ A = (−3,3) − (−5) ؛ B = (+6,1) − (−2).'})

# ── pp. 46–48 : أوظّف تعلّماتي (1–37) ─────────────────────────────────────────────────────────────

def exercise(n, page, group, text, verified=False, **extra):
    E.append({'id': f'ex-{n}', 'kind': 'exercise', 'number': n, 'page': page, 'section': 'أوظّف تعلّماتي', 'group': group, 'verified': verified, 'text': text, **extra})


G1, G2, G3, G4, G5, G6, G7 = 'سياقات استعمال الأعداد النسبية', 'تعليم نقاط على مستقيم مدرّج', 'مقارنة وترتيب أعداد نسبية', 'تعليم نقاط في المستوي', 'جمع أعداد نسبية', 'طرح أعداد نسبية', 'حساب مجاميع جبرية'
exercise(1, 46, G1, 'اذكر وضعيات من الحياة تستعمل فيها الأعداد النسبية.')
exercise(2, 46, G1, 'باستعمال محرّك بحث في الإنترنيت، أعط بالدرجات المئوية: أ) درجة حرارة جسم الإنسان في الحالة العادية. ب) درجة تجمّد الماء. ج) درجة تبخّر الماء. د) درجة حرارة « الصفر المطلق ».')
exercise(3, 46, G1, 'اربط كلّ حدث بالتاريخ المناسب له.')
exercise(4, 46, G2, 'بقراءة بيانية، عيّن فواصل النقاط A و B و C و D (مستقيم مدرّج بالوحدة، الصفر والواحد مبيّنان).')
exercise(5, 46, G2, 'نفس السؤال (مستقيم مدرّج آخر).')
exercise(6, 46, G2, 'نفس السؤال (مستقيم مدرّج وحدته 5).')
exercise(7, 46, G2, 'نفس السؤال (مستقيم مدرّج وحدته 10).')
exercise(8, 46, G2, 'نفس السؤال (مستقيم مدرّج بتدريج دقيق، وحدة واحدة مقسّمة إلى أجزاء).')
exercise(9, 46, G2, 'ضع على مستقيم مدرّج النقاط A و B و C و D التي فواصلها على الترتيب: −4 ؛ 3 ؛ −2,5 و −0,75.')
exercise(10, 46, G2, 'أ) ارسم مستقيما مدرّجا مبدؤه O ووحدته السنتيمتر. ضع عليه النقاط A و B و C و D التي فواصلها على الترتيب … ب) ما هي النقاط التي فواصلها أعداد ليست نسبية؟ ج) هل توجد نقاط فواصلها أعداد نسبية متعاكسة؟', reading='texte coupé à droite')
exercise(11, 46, G2, 'أ) عيّن فاصلة كلّ من النقاط A و B و C و D على المستقيم المدرّج الآتي (تدريج دقيق). ب) ما هي النقاط التي فواصلها ليست أعدادا صحيحة نسبية؟ ج) هل توجد نقاط فواصلها أعداد نسبية متعاكسة؟')
exercise(12, 46, G3, 'أكمل بأحد الرمزين: < أو > . أ) (+5) … (+45) ب) (−4) … (+9) ج) (−7) … (−8) د) (−6,5) … (−6,05)', verified=True,
         items=[('5', '45'), ('-4', '9'), ('-7', '-8'), ('-6,5', '-6,05')],
         answer=['<' if rel(a) < rel(b) else '>' for a, b in [('5', '45'), ('-4', '9'), ('-7', '-8'), ('-6,5', '-6,05')]], answerSource='computed')
exercise(13, 46, G3, 'نفس السؤال. أ) (+3,5) … (+5,3) ب) (−1,6) … (−2) ج) (−0,9) … (−1) د) (−0,9) … (−0,09)', verified=True,
         items=[('3,5', '5,3'), ('-1,6', '-2'), ('-0,9', '-1'), ('-0,9', '-0,09')],
         answer=['<' if rel(a) < rel(b) else '>' for a, b in [('3,5', '5,3'), ('-1,6', '-2'), ('-0,9', '-1'), ('-0,9', '-0,09')]], answerSource='computed')
STUDENT = [('3,5', '5,3', '<'), ('-1,6', '-2', '<'), ('-1,9', '-1,91', '>'), ('-12,65', '-12,7', '<')]
exercise(14, 46, G3, 'هذه إجابة تلميذ. صحّحها مع التبرير. أ) (+3,5) < (+5,3) ب) (−1,6) < (−2) ج) (−1,9) > (−1,91) د) (−12,65) < (−12,7)', verified=True,
         claims=[{'a': a, 'b': b, 'symbol': s, 'true': (rel(a) < rel(b)) == (s == '<')} for a, b, s in STUDENT],
         answer=[(rel(a) < rel(b)) == (s == '<') for a, b, s in STUDENT], answerSource='computed')
L15 = ['2,6', '0', '-1,4', '5', '-5,8', '-5,79']
exercise(15, 46, G3, 'إليك قائمة الأعداد النسبية: 2,6 ؛ 0 ؛ −1,4 ؛ 5 ؛ −5,8 ؛ −5,79. أكمل: أ) أكبر أعداد القائمة هو …… ب) …', verified=True,
         answer={'greatest': max(L15, key=rel), 'smallest': min(L15, key=rel), 'ascending': sorted(L15, key=rel)}, answerSource='computed',
         reading='la suite de la question (b, c) est coupée à droite')
NEAR = ['0', '-4,9', '-4,95', '-5,2']
exercise(16, 47, G3, 'من بين الأعداد النسبية الآتية، ما هو العدد الأقرب إلى −5 ؟ −5,2 ؛ −4,95 ؛ −4,9 ؛ 0 ؛ …', verified=False,
         answer={'nearestToMinus5': min(NEAR, key=lambda x: abs(rel(x) + 5))}, answerSource='computed', reading='début de la liste coupé')
L17 = ['-65', '5', '75', '0', '-40']
exercise(17, 47, G3, 'رتّب تصاعديا الأعداد النسبية الآتية: −65 ؛ 5 ؛ 75 ؛ 0 ؛ −40 .', verified=True, answer={'ascending': sorted(L17, key=rel)}, answerSource='computed')
L18 = ['-5,8', '-5,12', '-1,5', '0', '-5']
exercise(18, 47, G3, 'رتّب تنازليا الأعداد النسبية الآتية: −5,8 ؛ −5,12 ؛ −1,5 ؛ 0 ؛ −5 .', verified=True, answer={'descending': sorted(L18, key=rel, reverse=True)}, answerSource='computed')
exercise(19, 47, G3, 'أكمل بعددين صحيحين نسبيين متتاليين: … < −5,3 < … ؛ … < 7,9 < … ؛ … < 0,9 < … ؛ … < −9,8 < …', verified=True,
         answer=[{'x': x, 'before': int(-(-rel(x) // 1)) - 1 if rel(x) == int(rel(x)) else int(rel(x) // 1), 'after': int(rel(x) // 1) + 1} for x in ['-5,3', '7,9', '0,9', '-9,8']], answerSource='computed')
exercise(20, 47, G3, 'أوجد عددا نسبيا مناسبا لكلّ من الحالات الآتية: 4 < … < ؟ ؛ 2,5 < … < 2,6 ؛ −4,3 < … < −4,5 (كما طُبع) ؛ −8 < … < ؟', verified=False,
         reading='les bornes de la 1re et 4e ligne sont coupées ; la 3e est imprimée « −4,3 < … < −4,5 » (bornes dans le mauvais ordre) : lire −4,5 < … < −4,3',
         answer={'second': '2,5 < 2,55 < 2,6', 'third': '-4,5 < -4,4 < -4,3'}, answerSource='computed')
exercise(21, 47, G4, 'في المعلم المتعامد والمتجانس المقابل، عيّن إحداثيات النقاط A و B و C و D و E.')
exercise(22, 47, G4, 'في المعلم أعلاه، اذكر النقاط ذات: أ) فواصل موجبة وتراتيب سالبة. ب) فواصل سالبة وتراتيب سالبة. ج) تراتيب متساوية. د) تراتيب معدومة.')
exercise(23, 47, G4, 'في المعلم الآتي: أ) ضع النقطة A نظيرة M بالنسبة إلى محور الفواصل وعيّن إحداثيها. ب) ضع النقطة B نظيرة M بالنسبة إلى محور التراتيب وعيّن إحداثيها. ج) ماذا تلاحظ بالنسبة إلى إحداثيات A و B؟')
exercise(24, 47, G4, 'أ) ارسم معلما للمستوي مبدؤه O باختيار وحدة السنتيمتر على المحورين، ثم ضع النقاط: A(4 ; −3) ، B(0 ; −5) ، C(−3 ; −4). ب) تحقّق بالمدور من أنّ النقاط A ، B و C تنتمي إلى الدائرة التي مركزها O ونصف قطرها 5 cm.',
         answer={'OA': 5, 'OB': 5, 'OC': 5}, answerSource='computed')
exercise(25, 48, G5, 'احسب. D = (+8) + (−3) ؛ E = (−8) + (+7) ؛ F = (−8) + (−3) ؛ A = (−9) + (+11) ؛ B = (+5) + (−13) ؛ C = (+7) + (+11).',
         answer={'D': 5, 'E': -1, 'F': -11, 'A': 2, 'B': -8, 'C': 18}, answerSource='computed')
exercise(26, 48, G5, 'احسب. 1) (−5) + (−7) ؛ (+13) + (−4) ؛ (+5) + (−12) 2) (−12) + (+7) ؛ (−6) + (+6) ؛ (−12) + (−3).',
         answer=[-12, 9, -7, -5, 0, -15], answerSource='computed')
exercise(27, 48, G5, 'احسب دون استعمال حاسبة. D = (−5,4) + (+4,5) ؛ E = (−1,8) + (+1,8) ؛ F = (+5,75) + (−6,89) ؛ A = (+4,3) + (−3,7) ؛ B = (−6,1) + (−3,5) ؛ C = (+2,7) + (−11).',
         answer={'D': float(D('-5.4') + D('4.5')), 'E': 0, 'F': float(D('5.75') - D('6.89')), 'A': float(D('4.3') - D('3.7')), 'B': float(D('-6.1') - D('3.5')), 'C': float(D('2.7') - 11)}, answerSource='computed')
exercise(28, 48, G5, 'أكمل ملء الفراغات بأعداد مناسبة. 1) … + (+5) = (−8) ؛ … + (+2) = (+7) 2) (−5) + … = (−11) ؛ (−4) + … = (+9) 3) (−4) + … = (+9) ؛ (+7) + … = (−2).', answer=[-13, 5, -6, 13, 13, -9], answerSource='computed')
exercise(29, 48, G5, 'احسب. A = (−7) + (+10) + (−4) + (+7) + (−10) ؛ B = (+6) + (−9) + (+4) + (−10) ؛ C = (−5) + (+18) + (−4) + (+5) + (+4) + (−9).',
         answer={'A': -7 + 10 - 4 + 7 - 10, 'B': 6 - 9 + 4 - 10, 'C': -5 + 18 - 4 + 5 + 4 - 9}, answerSource='computed', reading='C : le chiffre « 118 » imprimé est probablement « +18 »')
exercise(30, 48, G5, 'أكمل كلّ هرم علما أنّ العدد المكتوب في كلّ خانة فيها يساوي مجموع العددين المكتوبين في الخانتين اللتين ترتكز عليهما.')
exercise(31, 48, G6, 'أكمل الحساب. A = (+5) − (+16) ؛ A = (−9) − (−5) ؛ A = (+5) + (…) ؛ A = (−9) + (…).', answer={'A1': -11, 'A2': -4}, answerSource='computed')
exercise(32, 48, G6, 'احسب. (−12) − (−3) ؛ A = (+9) − (+5) ؛ (+13) − (−13) ؛ B = −(+7) − (−10) ؛ (−3) − (−7) ؛ C = (−11) − (−11).',
         answer=[-9, 4, 26, 3, 4, 0], answerSource='computed')
exercise(33, 48, G6, 'اربط كلّ حساب من العمود الأيمن بالحساب الذي يناسبه في العمود الأيسر والذي يعطي نفس النتيجة.')
exercise(34, 48, G6, 'احسب. (+2,4) − (+3,33) ؛ A = (+12,5) − (+3,7) ؛ (+6,8) − (−6,8) ؛ B = (−6,1) − (+9,5) ؛ (−5,75) − (+2,25) ؛ C = (+8,7) − (−5,6).',
         answer=[float(D('2.4') - D('3.33')), float(D('12.5') - D('3.7')), float(D('13.6')), float(D('-6.1') - D('9.5')), -8.0, float(D('8.7') + D('5.6'))], answerSource='computed')
exercise(35, 48, G6, 'عيّن المسافتين AB و CD في كلّ من الحالات: أ) A(−2,3) ، B(+0,6) ، C(−0,1) ، D(+1) ب) A(−5) ، B(−12) ، C(+3,5) ، D(−10) ج) A(−150) ، B(+75) ، C(+125) ، D(−12,5).',
         answer={'a': [float(D('0.6') + D('2.3')), float(D('1.1'))], 'b': [7, float(D('13.5'))], 'c': [225, float(D('137.5'))]}, answerSource='computed', reading='relu à 110 dpi (2026-10-29) : le bord gauche est rogné mais les trois lignes se lisent : (a) A(−2,3) B(+0,6) C(−0,1) D(+1) ; (b) A(−5) B(−12) C(+3,5) D(−10) ; (c) A(−150) B(+75) C(+125) D(−12,5)', verified=True)
exercise(36, 48, G7, 'احسب المجاميع الجبرية. A = (+6) + (−5) − (+9) − (−3) + (−8) ؛ B = (−12) − (−9) − (−7) + (+5) − (+11) ؛ C = (−5) + (−13) − (−4) − (+5) + (+14).',
         answer={'A': 6 - 5 - 9 + 3 - 8, 'B': -12 + 9 + 7 + 5 - 11, 'C': -5 - 13 + 4 - 5 + 14}, answerSource='computed')
exercise(37, 48, G7, 'لحساب (+9) − (+5) + (−5) + (−12) اقترح تلميذ ما يأتي: A = (+9) + (−12) = (−3) ، منه (+5) + (−5) = 0 …', answer={'A': 9 - 5 - 5 - 12}, answerSource='computed', reading='bas de page coupé')

# ── p. 49 : أؤكّد تعلّماتي (11 items) ─────────────────────────────────────────────────────────────

def self_item(n, pages, text, **extra):
    E.append({'id': f'self-{n}', 'kind': 'selfcheck', 'number': n, 'page': 49, 'section': 'أؤكّد تعلّماتي', 'reviewPages': pages, 'verified': extra.pop('verified', False), 'text': text, **extra})


self_item(1, [42, 43], 'إحداثيا النقطة A في المعلم المقابل هما: أ) (2;3) ب) (−3;2) ج) (3;−2) …', answer={'correct': 'depends on the figure'}, answerSource='computed', reading='figure A(3;2) probable')
self_item(2, [42, 43], 'فاصلة النقطة B في المعلم السابق هي: أ) 1 ب) 3 ج) −3 .')
self_item(3, [42, 43], 'ترتيب النقطة C في المعلم السابق هو: أ) −3 ب) 2 ج) −2 .')
self_item(4, [44], 'معاكس العدد النسبي −5 هو: أ) 5 ب) 1/5 ج) −1/5 .', answer=[5], answerSource='computed')
SELF5 = ['-3,2', '0', '0,5', '-1,5', '-15']
self_item(5, [42, 43], 'أكبر الأعداد في القائمة التالية: −1,5 ؛ 0 ؛ −3,2 ؛ 0,5 ؛ −15 هو: أ) 0,5 ب) −15 ج) −3,2 .', verified=True,
          options=['0,5', '-15', '-3,2'], answer={'greatest': max(['-1,5', '0', '-3,2', '0,5', '-15'], key=rel), 'optionIndex': 0}, answerSource='computed')
SELF6 = [('x = +3', '3'), ('x = −2', '-2'), ('x = 0', '0')]
self_item(6, [42, 43], 'العدد x محصور بين −5 و −1 إذا كان: أ) x = +3 ب) x = −2 ج) x = 0 .', verified=True,
          answer={'inside': [lab for lab, v in SELF6 if rel('-5') < rel(v) < rel('-1')]}, answerSource='computed')
self_item(7, [44, 45], 'الحساب الذي نتيجته −2 هو: أ) (+4) − (−2) ب) (+2) + (−4) ج) (−1) + (−1) …', answer={'b': 2 - 4, 'c': -2}, answerSource='computed')
self_item(8, [44, 45], 'الفرق (−12) − (−20) يساوي: أ) 8 ب) −8 ج) 32 .', answer=[-12 + 20], answerSource='computed')
self_item(9, [44, 45], 'المسافة AB تساوي: أ) 8 ب) 7 ج) −8 (مستقيم مدرّج، A عند −3 و B عند 5 تقريبا).', reading='figure relue à 110 dpi (2026-10-29)', verified=True, answer=[8], answerSource='computed')
self_item(10, [44, 45], 'الشكل المبسّط للعبارة 5,5 − 3 هو: أ) (+3) − (−5,5) ب) (+3) + (−5,5) ج) (−3) + (−5,5) د) (−3) + (+5,5) …', answer=[float(D('5.5') - 3)], answerSource='computed')
self_item(11, [44], 'العبارة A = (−3) − (+4) − (−7,1) + (−2,5) − (+4,7) تساوي: أ) −18,8 ب) −21,3 ج) −11,9 .',
          answer=[float(D('-3') - 4 + D('7.1') - D('2.5') - D('4.7'))], answerSource='computed', reading='la ligne écrite A = (−3) − (+4) − (−7,1) + … est coupée à gauche')

# ── pp. 50–51 : أتعمّق (38–59) ────────────────────────────────────────────────────────────────────

def deep(n, page, text, **extra):
    E.append({'id': f'deep-{n}', 'kind': 'deepening', 'number': n, 'page': page, 'section': 'أتعمّق', 'verified': extra.pop('verified', False), 'text': text, **extra})


deep(38, 50, 'اختلف أمين وسيلين حول النص الآتي: (مجموع عددين يكون دائما أصغر من كلّ من العددين). يقول أمين إنّ النص صحيح دائما، بينما تصرّ سيلين على أنّه خاطئ. ما رأيك في ذلك؟ برّر.',
     answer={'counterexample': '(+3) + (+2) = +5 > 3', 'always': False}, answerSource='computed')
deep(39, 50, 'اختصر الكتابة ثم احسب. A = (−6) + (+13) + (−2) + (−8) ؛ B = (+7) + (−3) − (+7) − (−10).', answer={'A': -6 + 13 - 2 - 8, 'B': 7 - 3 - 7 + 10}, answerSource='computed')
deep(40, 50, 'في كلّ من الحالات، عيّن فاصلة منتصف [AB]. أ) A(−28) و B(+12) ب) A(−69) و B(−33) ج) A(−5,8) و B(+2,3).',
     answer={'a': -8, 'b': -51, 'c': float(D('-5.8') + D('2.3')) / 2}, answerSource='computed', verified=True)
deep(41, 50, 'أ) على مستقيم مدرّج مبدؤه O ووحدته السنتيمتر، ضع النقطة M(−1). ب) N نقطة من المستقيم المدرّج حيث MN = 3,5 cm. ما هي فاصلة النقطة N ؟', answer={'N': [2.5, -4.5]}, answerSource='computed', verified=True)
deep(42, 50, 'وضعنا على مستقيم مدرّج النقاط A و B و C بحيث: AB = 0,9 ، AC = 4,2 ، A(−1,3) و BC = 3,3 . ما هي الإحداثيات الممكنة للنقطتين B و C ؟',
     answer={'B': [float(D('-1.3') + D('0.9')), float(D('-1.3') - D('0.9'))], 'C': [float(D('-1.3') + D('4.2')), float(D('-1.3') - D('4.2'))]}, answerSource='computed', verified=True)
deep(43, 50, 'اكتب الإشارات المناسبة حتى تصبح المساويات صحيحة. أ) (+3) … (−7) … (+5) … (−1) = (+2) ب) (+6) … (−5) … (−2) … (−3) = (+12) ج) (−15) … (−3) … (−9) … (−7) = (−16).')
deep(44, 50, 'احسب العبارتين: أ) 100 − 99 + 98 − 97 + … + 2 − 1 ؛ ب) 1000 − 999 + 998 − 997 + 996 − … + 4 − 3 + 2 − 1.', answer={'a': 50, 'b': 500}, answerSource='computed')
deep(45, 50, 'أكمل كلّ هرم علما أنّ العدد المكتوب في كلّ خانة فيها يساوي مجموع العددين المكتوبين في الخانتين اللتين ترتكز عليهما (هرمان، −26 و −25 في القمّة).')
deep(46, 50, 'باستعمال الأعداد (−7,6) ، (−7) ، (+3,9) و (+15) مرّة واحدة وإشارات + و − ، اكتب عبارة تكون نتيجتها أكبر عدد ممكن.',
     answer={'max': float(D('7.6') + 7 + D('3.9') + 15)}, answerSource='computed', reading='texte coupé')
deep(47, 51, 'انقل ثم أكمل: جدول (a ; b ; c ; a−b ; (a−b)+c ; b−c ; a−(b−c)). ماذا تلاحظ؟ ماذا تستنتج؟')
deep(48, 51, 'لقياس درجة الحرارة، نستعمل مقياس الدرجة المئوية (°C). توجد مقاييس أخرى منها مقياس كلفن (K). للانتقال من (°C) إلى (K)، نستعمل العلاقة: T(K) = T(°C) + 273,15. أكمل الجدول.',
     answer={'-22,7': float(D('-22.7') + D('273.15')), '-3': float(D('-3') + D('273.15')), '24': float(D('24') + D('273.15')), '127,7 K': float(D('127.7') - D('273.15')), '500 K': float(D('500') - D('273.15'))}, answerSource='computed')
deep(49, 51, 'أوجد الخطأ الوارد في المربّع السحري وصحّحه (جدول 4×4: 5 −2 3 −8 / 2 −8 4 −1 / −4 7 −6 1 / −5 0 −3 6).', reading='figure à relire')
deep(50, 51, 'نتنقّل على الشبكة الآتية وفق الأسهم ونجمع الأعداد الواردة في المحطات لكلّ مسار (من الانطلاق S إلى الوصول R).', reading='réseau de nombres à relire')
deep(51, 51, 'انقل الشكل على ورقة مرصوفة. ارسم عليه معلما حتى يكون للنقطتين A و B الإحداثيات … (مستوي).')
deep(52, 51, 'اختر، في كلّ حالة، المعلم المناسب لوضع النقاط: أ) A(−20 ; 60) ب) A(−2 ; −3) …', reading='texte coupé')
deep(53, 51, 'نقطة A(−3 ; 5) في معلم متعامد: ضع النقطة B نظيرة A بالنسبة إلى محور الفواصل، C نظيرة A بالنسبة إلى محور التراتيب، D نظيرة A بالنسبة إلى مبدأ المعلم. ما هي إحداثياتها؟')
deep(54, 51, 'في المعلم، أنشئ النقاط A ، B ، C بحيث يكون المثلث ABC … (مستطيل).', reading='texte coupé')
deep(55, 51, '1) في معلم متعامد للمستوي، علّم النقطتين A(−3 ; 2) و B(−3 ; −3) . 2) علّم النقطة C بحيث يكون المثلث ABC قائما في B ومتقايس الضلعين.')
deep(56, 51, '1) علّم النقطة A(+5 ; +3). ارسم الدائرة (C) التي مركزها O والتي تمرّ بالنقطة A. 2) B نقطة من (C) فاصلتها 5+ وتختلف عن A. علّم B. ما هما إحداثيا B ؟ 3) D نقطة من (C) ترتيبها 3+ وتختلف عن A. علّم D. ما هما إحداثيا D ؟')
deep(57, 51, 'عددان صحيحان سالبان، مجموعهما −12 والفرق بينهما 2. أوجد العددين.', answer={'numbers': [-5, -7]}, answerSource='computed')
deep(58, 51, 'باستعمال الأعداد الصحيحة النسبية من −4 إلى 4، املأ المربّع السحري 3×3 بحيث يكون مجموع أعداد كلّ سطر وكلّ عمود والقطرين معدوما.')
deep(59, 51, 'لاحظ المثال: 1 + 23 − 4 + 56 + 7 + 8 + 9 = 100. بإدراج إشارات + و − في (123456789) كما في المثال السابق، اكتب عبارات أخرى تكون نتيجتها 100.', answer={'example': 1 + 23 - 4 + 56 + 7 + 8 + 9}, answerSource='computed')

# ── p. 52 : أدمج تعلّماتي ; p. 53 : تكنولوجيات ──────────────────────────────────────────────────────
E.append({'id': 'integration', 'kind': 'integration', 'page': 52, 'section': 'أدمج تعلّماتي', 'title': 'الوضعية المالية للعائلة', 'verified': False,
          'text': 'الورقة المقابلة لمتابعة الوضعية المالية لعائلة في شهر سبتمبر (جدول: التاريخ، العملية، المصاريف DA، المداخيل DA). 1) أعد حجز الورقة على صفحة لمجدول إكسال. 2) باختيار الدوائر المناسبة، احسب مصاريف ومداخيل العائلة. 3) ماذا تستنتج بالنسبة للوضعية المالية للعائلة؟',
          'answer': {'expenses': 6500 + 4000 + 6500 + 1500 + 2000 + 6500 + 12000 + 980 + 6500 + 3500, 'income': 55000 + 1600, 'openingBalance': 8000}, 'answerSource': 'computed',
          'reading': 'tableau lu à 90 dpi : plusieurs montants coupés ; à relire par la synthèse'})
E.append({'id': 'evaluation', 'kind': 'integration', 'page': 52, 'section': 'وضعية للتقويم', 'verified': False,
          'text': 'باستعمال محرّك بحث في الإنترنيت، استعلم حول الفرق في التوقيت بين مناطق العالم، ثمّ أجب: 1) كيف تبرّر الدول التي لها نفس الفرق في التوقيت مع الجزائر؟ 2) تشير الساعة إلى 12h في الجزائر العاصمة، ما هو التوقيت في كلّ من: طوكيو – واشنطن – بيروت – القاهرة – لندن – جنوب إفريقيا.'})
E.append({'id': 'ict-1', 'kind': 'ict', 'page': 53, 'section': 'أوظّف تكنولوجيات الإعلام والاتصال', 'title': 'استعمال جيوجبرا في تعليم نقط وحساب أطوال', 'verified': True,
          'text': 'افتح ورقة عمل جديدة واختر الشبكة، ثم علّم النقطتين A(−3 ; 0) و B(4 ; 0) على مستقيم مدرّج ، وأظهر المسافة AB (AB = 7). جد مواضع أخرى للنقطتين على نفس المحور بحيث تكون المسافة بين كلّ نقطتين 7 (وحدات الطول). اشرح كيف يمكن حساب المسافة انطلاقا من فاصلتي النقطتين. احسب AB في الحالتين: A(−41,5) و B(…) ؛ …',
          'answer': {'AB': 7}, 'answerSource': 'computed'})

# ── destinations ──────────────────────────────────────────────────────────────────────────────────
L1, L2, L3, L4, L5, L6 = 'talim-mustaqim-mudarraj-2', 'muqarana-nisbiya', 'talim-nuqta-mustawi', 'jam-tarh-nisbiya', 'masafa-nuqtatayn', 'majmu-jabri'
SYN = 'wadiya-idmajiya-adad-nisbiya-2'
DEST = {
    '_comment': 'elementId → { lesson, module } ; `items` répartit un élément ; une leçon encore coming_soon est une destination EN ATTENTE (check-textbook-coverage.mjs). Les modules de muqarana-nisbiya : 0 أستعدّ · 1 نشاط · 2 معارف · 3 طريقة · 4 أتمرّن · 5–7 مسائل · 8 إختبار أولي.',
    'objectives': {'lesson': 'unit', 'module': 'page'},
    'opener': {'lesson': L2, 'module': 4},
    'challenge': {'lesson': SYN, 'module': 3, 'duplicatedIn': [{'lesson': 'unit', 'module': 'page'}],   # redessiné (shatt Melghir / Tahat) en situation 3 ; la carte de l'unité reçoit la version de la plateforme (2026-10-30)
                  'note': "altitudes algériennes (Tahat, chott Melghir, avion, puits) ; profondeur = altitude de la surface − altitude du fond"},
    'prep': {'lesson': L2, 'module': 0, 'items': {
        '5-6-7': {'lesson': L2, 'module': 0},
        '1-2-3-4': {'lesson': L1, 'module': 0},
        '8-9-10-11-12-13': {'lesson': L3, 'module': 0}}},
    'act-1': {'lesson': L1, 'module': 4, 'items': {'a-b': {'lesson': L1, 'module': 4}, 'c': {'lesson': L3, 'module': 4}}},   # a-b : l'entrée est le labo de la plateforme ; la frise du livre devient une application (2026-10-29)
    'act-2': {'lesson': L2, 'module': 4},
    'act-3': {'lesson': L4, 'module': 4}, 'act-4': {'lesson': L4, 'module': 4},   # l'entrée est le labo `balloon-ballast` de la plateforme ; les activités du livre deviennent des applications (2026-10-29)
    'act-5': {'lesson': L5, 'module': 4}, 'act-6': {'lesson': L6, 'module': 4},   # act-6 : l'entrée est le labo `tug-rope` de la plateforme ; l'activité du livre devient une application (majmu-jabri, 2026-10-29)
    'know-1a': {'lesson': L1, 'module': 2}, 'know-1b': {'lesson': L2, 'module': 2}, 'know-1c': {'lesson': L3, 'module': 2},
    'method-1': {'lesson': L2, 'module': 3}, 'method-2': {'lesson': L3, 'module': 3},
    'now-43': {'lesson': L2, 'module': 3, 'items': {'1': {'lesson': L2, 'module': 3}, '2': {'lesson': L3, 'module': 3}}},
    'know-2a': {'lesson': L4, 'module': 2}, 'know-2b': {'lesson': L4, 'module': 2}, 'know-2c': {'lesson': L5, 'module': 2},
    'know-2d': {'lesson': L6, 'module': 2}, 'know-2e': {'lesson': L6, 'module': 2},
    'method-3': {'lesson': L4, 'module': 3}, 'method-4': {'lesson': L4, 'module': 3}, 'method-5': {'lesson': L6, 'module': 3},
    'now-45': {'lesson': L4, 'module': 3},
    **{f'ex-{n}': {'lesson': L1, 'module': 4} for n in range(1, 12)},
    **{f'ex-{n}': {'lesson': L2, 'module': 4} for n in range(12, 21)},
    **{f'ex-{n}': {'lesson': L3, 'module': 4} for n in (21, 22, 23, 24)},
    **{f'ex-{n}': {'lesson': L4, 'module': 4} for n in (25, 26, 27, 28, 30, 31, 32, 33, 34)}, 'ex-29': {'lesson': L6, 'module': 4},   # ex-29 : sommes de 4 à 6 termes = majmu-jabri
    'ex-35': {'lesson': L5, 'module': 4},
    **{f'ex-{n}': {'lesson': L6, 'module': 4} for n in (36, 37)},
    'self-1': {'lesson': L3, 'module': 8}, 'self-2': {'lesson': L3, 'module': 8}, 'self-3': {'lesson': L3, 'module': 8},
    'self-4': {'lesson': L1, 'module': 8}, 'self-5': {'lesson': L2, 'module': 8}, 'self-6': {'lesson': L2, 'module': 8},
    'self-7': {'lesson': L4, 'module': 8}, 'self-8': {'lesson': L4, 'module': 8}, 'self-9': {'lesson': L5, 'module': 8},
    'self-10': {'lesson': L6, 'module': 8}, 'self-11': {'lesson': L6, 'module': 8},
    'deep-38': {'lesson': L4, 'module': 4},
    **{f'deep-{n}': {'lesson': L6, 'module': 4} for n in (39, 43, 44, 46)},
    **{f'deep-{n}': {'lesson': L6, 'module': None} for n in (47, 59)},   # banque d'exercices (adaptés) de majmu-jabri ; deep-47 : nombres seulement, aucune règle (3AM)
    'deep-40': {'lesson': L5, 'module': 4}, 'deep-41': {'lesson': L5, 'module': 4}, 'deep-42': {'lesson': L5, 'module': 4},
    **{f'deep-{n}': {'lesson': L4, 'module': None} for n in (45, 48, 57)},   # banque d'exercices (adaptés) de jam-tarh-nisbiya
    **{f'deep-{n}': {'lesson': L6, 'module': 4} for n in (58,)}, **{f'deep-{n}': {'lesson': L6, 'module': None} for n in (49, 50)},   # carrés magiques / chemins : sommes de 3 à 4 termes = majmu-jabri
    **{f'deep-{n}': {'lesson': L3, 'module': 4} for n in (52, 55)}, **{f'deep-{n}': {'lesson': L3, 'module': None} for n in (51, 53, 54, 56)},   # deep-51/53/54/56 : banque d'exercices (adaptés) de talim-nuqta-mustawi ; l'entrée est le labo `dig-grid` (2026-10-29)
    'integration': {'lesson': SYN, 'module': 1}, 'evaluation': {'lesson': SYN, 'module': 2},   # redessinées en situations d'entraînement 1 et 2 (synthèse, 2026-10-30)
    'ict-1': {'lesson': L5, 'module': 4},   # adapté sans logiciel : « d'autres positions avec AB = 7 » est un exercice de choix (masafa-nuqtatayn, 2026-10-29)
}

DISCREPANCIES = [
    {'elementId': 'act-5', 'kind': 'reading', 'text': 'Relu à 110 dpi (masafa-nuqtatayn, 2026-10-29) : la ligne des points est coupée à droite ; on lit B(5), C(−1), D(−6) et l’abscisse de A est perdue (le plan supposait A(5), B(−1), C(−6)). La leçon pose ses propres points : A(+4), B(−2), C(−7) en أتمرّن.'},
    {'elementId': 'ict-1', 'kind': 'scope', 'text': 'GeoGebra : redessiné sans logiciel (le labo `gap-caliper` fait « d\'autres positions avec AB = 7 » et un exercice de choix en أتمرّن).'},
    {'elementId': 'self-11', 'kind': 'reading', 'text': 'Relu à 110 dpi (majmu-jabri, 2026-10-29) : A = (−3) − (+4) − (7,1) + (−2,5) − (+4,7) a pour valeur −21,3, une des trois options (−18,8 ; −21,3 ; −11,9) ; le début de l’énoncé reste coupé à gauche : la leçon pose son épreuve réécrite (autres nombres, calcul d’une écriture simplifiée) sans reprendre l’énoncé coupé.'},
    {'elementId': 'self-10', 'kind': 'reading', 'text': 'Relu (majmu-jabri) : « 5,5 − 3 est la forme simplifiée de l’expression » ; les options entre parenthèses sont à demi lisibles : la leçon pose son épreuve de simplification réécrite (autres nombres), sans reprendre les options à demi lisibles.'},
    {'elementId': 'deep-47', 'kind': 'scope', 'text': 'Le « ماذا تستنتج ؟ » de a − (b − c) mène à la règle des parenthèses précédées de « − » (3AM) : majmu-jabri s’en sert avec des nombres seulement (banque), sans énoncer de règle.'},
    {'elementId': 'ex-2', 'kind': 'scope', 'text': 'Le texte envoie l’élève à un moteur de recherche (température du corps, congélation, ébullition, zéro absolu). Hors périmètre (indépendance du livre) : la plateforme DONNE les valeurs (37 ; 0 ; 100 ; −273,15 °C) dans talim-mustaqim-mudarraj-2.'},
    {'elementId': 'ex-10', 'kind': 'scope', 'text': 'Le point b parle de points dont les abscisses ne sont pas des nombres relatifs (fractions) : gardé seulement comme « 1/7 n’est pas un relatif de cette année » (« أستعدّ » item 2) ; jamais une fraction placée.'},
    {'elementId': 'know-1b', 'kind': 'misprint', 'text': 'Le premier exemple imprime « −2,5 < −4 » à côté de « la point F avant la point E » : c’est −4 < −2,5 (F est à gauche de E). Les deux autres exemples (2,5 < 5 ; −2,5 < 2,5) sont corrects. La leçon écrit −4 < −2,5.'},
    {'elementId': 'ex-20', 'kind': 'misprint', 'text': 'La troisième ligne est imprimée « −4,3 < … < −4,5 » (bornes dans le mauvais ordre : −4,3 > −4,5). La leçon lit −4,5 < … < −4,3.'},
    {'elementId': 'ex-29', 'kind': 'reading', 'text': 'La ligne C contient « (118) » : lire (+18) sur le scan flou.'},
    {'elementId': 'integration', 'kind': 'reading', 'text': 'Relu à 170 dpi (synthèse, 2026-10-30, pdf p. 49) : la feuille de septembre part d’un solde de 8000 DA au 31/8 ; dépenses 6500, 4000, 6500, 1500 + 2000, 6500, 12000, 980 (eau), 6500, 3500 ; recettes 55000 (salaire) et 1600 (médicaments) ; le « 80 » lu à 90 dpi est 980 ; le solde final est daté « 30/9/2016 » (coquille pour 2017). La consigne parle d’Excel (« دوائر » = cellules) : hors périmètre, la plateforme redessine la situation SANS logiciel (budget d’un mois semaine par semaine, montants propres, sans prêt ni intérêt).'},
    {'elementId': 'evaluation', 'kind': 'scope', 'text': 'Relu à 170 dpi (synthèse) : « باستعمال محرّك بحث في الإنترنيت » envoie l’élève hors de la plateforme ; les décalages horaires changent avec l’heure d’été (Le Caire, Washington) alors qu’Alger reste à GMT+1 : la plateforme DONNE les décalages d’HIVER par rapport à Londres (Alger +1, Le Caire +2, Beyrouth +2, Johannesburg +2, Tokyo +9, Washington −5) et pose l’heure à 12 h à Alger.'},
    {'elementId': 'challenge', 'kind': 'reading', 'text': 'Relu à 170 dpi (synthèse, pdf p. 35) : le fond de Huron est −53 m (et non −63) ; la partie gauche du schéma (+183 m, −223 m…) est coupée par la reliure. Les valeurs ne sont pas reprises : la plateforme pose sa propre version algérienne (chott Melghir ≈ −40 m, Tahat ≈ +2908 m, avion à +3500 m, puits de 160 m) avec « حوالي ».'},
    {'elementId': 'opener', 'kind': 'scope', 'text': 'Texte coupé à droite sur la page 38 ; seules les deux températures extrêmes (−67,8 et 56,7) sont lisibles.'},
    {'elementId': 'unit', 'kind': 'scope', 'text': 'Pages 38–53 complètes mais scan médiocre : bord droit des pp. 41, 43, 44, 45, 46, 47 coupé, plusieurs lignes d’exercices tronquées, numéros de 6 exercices à peine lisibles. Les éléments hors de muqarana-nisbiya sont brefs (verified: false) : leur leçon les relira.'},
]

doc = {
    '_comment': [
        'EXTRACTION CANONIQUE du manuel scolaire officiel — 2AM, الجيل الثاني (منشورات الشهاب 2017), unité 3 « الأعداد النسبية ».',
        'Source : docs/official-book-pdfs/كتاب الرياضيات للسنة الثانية متوسط الجيل الثاني.pdf, pages 38 à 53 du livre (PDF 35 à 50).',
        'Ce fichier est LA source de vérité pédagogique de l’unité ; tout contenu cite un `id` d’ici via `source.elementId`.',
        'Transcription VISUELLE d’un scan médiocre ; réponses calculées (Fraction / Decimal) dans build-extraction.py, `answerSource: computed`.',
        'Généré par docs/sources/2am/unit3/build-extraction.py — ne pas éditer à la main.',
    ],
    'unitCode': 'adad-nisbiya-2',
    'textbook': {'title': 'كتاب الرياضيات — السنة الثانية من التعليم المتوسط', 'generation': 'الجيل الثاني', 'unitNumber': 3,
                 'unitTitle': 'الأعداد النسبية', 'pages': {'first': 38, 'last': 53}, 'pdfPageOffset': 3,
                 'sections': ['سأتعلّم في هذا الباب', 'تحدّي', 'أستعدّ', 'أنشطة', 'معارف', 'طرائق', 'دوري الآن', 'أوظّف تعلّماتي', 'أؤكّد تعلّماتي', 'أتعمّق', 'أدمج تعلّماتي', 'وضعية للتقويم', 'أوظّف تكنولوجيات الإعلام والاتصال']},
    'frozenAt': '2026-10-21',
    'terminology': {'note': 'Le manuel écrit « عدد نسبي », « فاصلة نقطة », « مستقيم مدرّج », « المسافة إلى الصفر », « عددان متعاكسان », « مقارنة », « ترتيب تصاعديا / تنازليا », « الأصغر / الأكبر », « مجموع جبري », « إحداثيا نقطة (الفاصلة، الترتيب) ».',
                    'terms': ['عدد نسبي', 'فاصلة', 'مستقيم مدرّج', 'المسافة إلى الصفر', 'متعاكسان', 'ترتيب تصاعدي', 'ترتيب تنازلي', 'أصغر', 'أكبر', 'مجموع جبري', 'إحداثيا', 'ترتيب نقطة']},
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
# les éléments de la leçon générée maintenant doivent être relus
LESSON = L2
bad = [e['id'] for e in E if DEST[e['id']].get('lesson') == LESSON and not e.get('verified') and e['id'] not in ('opener', 'ex-16', 'ex-20', 'deep-38', 'self-5', 'self-6')]
assert not bad, f'éléments de {LESSON} non vérifiés : {bad}'

for _id in ('integration', 'evaluation', 'challenge'):
    _el = next(e for e in E if e['id'] == _id)
    _el['verified'] = True
    _el['reading'] = (_el.get('reading', '') + ' Relu par la synthèse (2026-10-30) à 170 dpi (pdf p. 35 et 49).').strip()

out = Path(__file__).with_name('extraction.json')
out.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
pending = sum(1 for k, v in DEST.items() if k != '_comment' and v['lesson'] not in ('unit', LESSON))
print(f'{out} — {len(E)} éléments ({len(E) - pending} pour {LESSON} ou l’unité, {pending} pour les autres leçons)')
