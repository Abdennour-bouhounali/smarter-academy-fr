#!/usr/bin/env python3
"""Génère docs/sources/1am/unit4/extraction.json — 1AM, unité 4 « الكتابات الكسرية »
(manuel الجيل الثاني, pp. 51–62 ; PDF pages 51–62, offset 0).

Transcription VISUELLE (pages rendues à 110 dpi, passages de la leçon ikhtizal-kitaba-kasriya et toutes les figures relus
à 220–400 dpi). Le texte arabe est celui du manuel ; les éléments des leçons qui ne sont pas encore générées
(hasil-qisma-kasr, hasil-qisma-mustaqim, akhdh-kasr-min-adad, la synthèse) sont transcrits plus brièvement et marqués
`verified: False` : leur leçon les relira. Les réponses sont CALCULÉES ici (fractions et décimaux EXACTS : `Fraction`,
`Decimal`), jamais tapées ; une lecture de figure incertaine est dite dans `reading` et dans `discrepancies`.

L'unité est générée LEÇON PAR LEÇON (cycle moyen, phase 3) : la première leçon générée est ikhtizal-kitaba-kasriya
(ordre 18), AVANT hasil-qisma-kasr (ordre 15) dans la file du réseau ; les destinations vers une leçon encore
coming_soon sont EN ATTENTE (scripts/check-textbook-coverage.mjs).

Usage : python3 docs/sources/1am/unit4/build-extraction.py
"""
import json
from decimal import Decimal as D
from fractions import Fraction as F
from math import gcd
from pathlib import Path


def dec(s):
    return D(str(s).replace(',', '.'))


def fr(x):
    """Un décimal exact écrit à la virgule (ex. 1,75)."""
    x = D(x).normalize()
    return format(x, 'f').replace('.', ',')


def frac(f):
    """Une fraction exacte écrite a/b (un entier s'écrit seul)."""
    f = F(f)
    return str(f.numerator) if f.denominator == 1 else f'{f.numerator}/{f.denominator}'


def to_decimal(f):
    """La valeur décimale EXACTE d'une fraction décimale, sinon None (2 et 5 seuls au dénominateur réduit)."""
    f = F(f)
    d = f.denominator
    for p in (2, 5):
        while d % p == 0:
            d //= p
    if d != 1:
        return None
    return fr(D(f.numerator) / D(f.denominator))


def reduce_steps(n, d):
    """La réduction d'une fraction de naturels pas à pas par 2, 3, 5, 9 puis tout diviseur premier — le chemin du manuel."""
    steps = []
    for k in (9, 5, 3, 2, 7, 11, 13, 17, 19, 23, 113):
        while n % k == 0 and d % k == 0 and n > 0:
            steps.append({'k': k, 'from': f'{n}/{d}', 'to': f'{n // k}/{d // k}'})
            n, d = n // k, d // k
    assert gcd(n, d) == 1, (n, d)
    return {'steps': steps, 'irreducible': f'{n}/{d}' if d != 1 else str(n)}


E = []

# ── p. 51 : ouverture ─────────────────────────────────────────────────────────────────────────────
E.append({
    'id': 'objectives', 'kind': 'objectives', 'page': 51, 'section': 'سأتعلّم في هذا الباب', 'verified': True,
    'items': [
        'مفهوم الكسر كحاصل القسمة.',
        'تحديد موضع حاصل قسمة عددين طبيعيين على نصف مستقيم مدرج في وضعيات بسيطة.',
        'ضرب عدد في كسر (أخذ كسر من كمية).',
        'تحويل الكتابة الكسرية لحاصل قسمة.',
        'اختزال كتابة كسرية.',
    ],
})
E.append({
    'id': 'opener', 'kind': 'aside', 'page': 51, 'section': 'تمهيد', 'verified': True,
    'text': 'لما كانت الأعداد الطبيعية غير كافية للاستجابة لكلّ حاجيات الإنسان، اكتشف الأعداد الكسرية واستعملت للتعبير عن بعض الكميات الحقيقية من الواقع مثل الأطوال، المساحات … يوجد أثر «للكسور» (الكتابات الكسرية) في الكتابات المصرية القديمة وعند الصينيين وعند المسلمين (في كتابات الخوارزمي المتعلقة بالحساب ودراسة الكسور والعمليات عليها). ويعتبر العالم غياث الدين الكاشي (توفي عام 1429) أوّل رياضي مسلم عرض «نظرية الكسور العشرية»، وأثبت أنّ العمليات عليها تُنجز مثل العمليات على الأعداد الطبيعية، وهو أوّل من أعطى قيمة للعدد π إلى درجة من التقريب لم يسبقه إليها أحد، والتي وصلت إلى 16 رقما بعد الفاصلة. π ≈ 3,1415925358979325',
    'note': 'Le manuel imprime « 3,1415925358979325 » ; π = 3,14159265358979… : le 8e chiffre après la virgule est 6, pas 5 (coquille, voir discrepancies).',
})
CH = F(235017, 1000)
E.append({
    'id': 'challenge', 'kind': 'challenge', 'page': 51, 'section': 'تحدّ', 'verified': True,
    'text': 'أين أضع الفاصلة؟ $\\frac{235017}{1000}$',
    'figure': 'العدد 235017 بأرقام حمراء كبيرة وطفل يفكّر: أين أضع الفاصلة؟',
    'answer': {'decimal': to_decimal(CH), 'decomposition': '235017/1000 = 235 + 17/1000 = 235,017'},
    'answerSource': 'computed',
})
assert to_decimal(CH) == '235,017'

# ── p. 52 : استحضر مكتسباتي ──────────────────────────────────────────────────────────────────────
PREP = [
    {'n': 1, 'question': 'العدد 8,225 يمثّل :', 'options': ['8225/1000', '8 + 2/10 + 25/1000', '329 ÷ 40'], 'correct': [0, 1, 2],
     'why': f"8225/1000 = {to_decimal(F(8225, 1000))} ؛ 8 + 2/10 + 25/1000 = {to_decimal(8 + F(2, 10) + F(25, 1000))} ؛ 329 ÷ 40 = {to_decimal(F(329, 40))}"},
    {'n': 2, 'question': 'نتيجة الفرق 9,23 − 4,6 هي:', 'options': ['5,17', '4,63', '463/100'], 'correct': [1, 2], 'why': fr(dec('9.23') - dec('4.6'))},
    {'n': 3, 'question': 'حاصل القسمة الإقليدية للعدد 78 على 4 هو:', 'options': ['19,5', '19', '20'], 'correct': [1], 'why': f'78 = 4 × {78 // 4} + {78 % 4}'},
    {'n': 4, 'question': 'المساواة التي تترجم القسمة الإقليدية للعدد 96 على 13 هي:', 'options': ['96 = 13 × 7 + 5', '96 = 13 × 6 + 18', '96 = 13 × 7 + 1'], 'correct': [0],
     'why': f'13 × 7 + 5 = {13 * 7 + 5} و 5 < 13 ؛ 18 > 13 ؛ 13 × 7 + 1 = {13 * 7 + 1}'},
    {'n': 5, 'question': 'حاصل قسمة العدد 2 على 3 هو عدد عشري:', 'options': ['نعم', 'لا', 'لا، هو عدد طبيعي'], 'correct': [1], 'why': f'2/3 عشري؟ {to_decimal(F(2, 3)) is not None}'},
    {'n': 6, 'question': 'السّطح المشطب من هذا القرص يمثّل بالكسر:', 'figure': 'قرص مقسّم إلى 8 أجزاء متقايسة، 3 منها مشطّبة', 'options': ['3/5', '3/8', '5/3'], 'correct': [1], 'why': '3 أجزاء من 8'},
    {'n': 7, 'question': 'هل السّطح المشطب من هذا القرص يمثّل بالكسر 1/3:', 'figure': 'قرص مقسّم إلى نصفين، والنصف السفلي إلى ربعين؛ ربع واحد مشطّب', 'options': ['نعم', 'لا لأن القرص غير مقسّم إلى 3 أجزاء متساوية', 'لا هو 3/1'], 'correct': [1], 'why': 'الجزء المشطب ربع القرص: 1/4'},
    {'n': 8, 'question': 'نشطب 5/4 من سطح هذا المستطيل فنحصل على:', 'figure': 'المستطيل ABCD ؛ الاقتراحات: (1) 4/5 مشطّبة من ABCD ، (2) ABCD مقسّم إلى 4 أجزاء وجزء خامس مثله خارجه ، (3) ABCD كله مشطّب', 'options': ['(1)', '(2)', '(3)'], 'correct': [1], 'why': '5/4 = 1 + 1/4 : المستطيل كله وربع مستطيل آخر'},
    {'n': 9, 'question': 'السّطح الملوّن من هذا المربع يمثّل بـ:', 'figure': 'مربع مقسّم إلى 4 مربعات، 3 منها ملوّنة', 'options': ['1/3', '1/2 + 1/4', '3/4'], 'correct': [1, 2], 'why': f'1/2 + 1/4 = {frac(F(1, 2) + F(1, 4))}'},
    {'n': 10, 'question': 'أكلت أمينة وزميلاتها ثلثي قطعة الشكولاطة، قالت إحدى زميلاتها أكلنا:', 'figure': 'لوح شكولاطة 4 × 9 = 36 مربعا', 'options': ['24 مربعة', '12 مربعة', '18 مربعة'], 'correct': [0], 'why': f'2/3 × 36 = {F(2, 3) * 36}'},
]
assert F(8225, 1000) == 8 + F(2, 10) + F(25, 1000) == F(329, 40)
assert dec('9.23') - dec('4.6') == D('4.63') and F(2, 3) * 36 == 24 and 78 // 4 == 19
E.append({'id': 'prep', 'kind': 'prerequisites', 'page': 52, 'section': 'استحضر مكتسباتي', 'verified': True,
          'instruction': 'اختر الإجابة (أو الإجابات) الصحيحة في كل حالة، وبرّر اختيارك.', 'items': PREP, 'answerSource': 'computed'})

# ── pp. 53–54 : اكتشف ─────────────────────────────────────────────────────────────────────────────
E.append({'id': 'act-1', 'kind': 'activity', 'number': 1, 'page': 53, 'section': 'اكتشف', 'title': 'حاصل القسمة والكسر — تقسيم رغيف تقليدي', 'verified': False,
          'text': 'أرادت فاطمة وزميلتها مريم تقسيم خمسة أرغفة متماثلة على ستة أشخاص بالتساوي. ① بما أن مريم تجيد القسمة العشرية، قسمت 5 على 6. ما هو حاصل القسمة الذي تجده؟ هل هذا العدد يفيدها في تقسيم الأرغفة؟ ② بينما قسّمت فاطمة كلّ رغيف إلى ستّ حصص متساوية، كيف تتصرّف بعد ذلك لكي يأخذ كلّ شخص نفس الكمية؟ ③ باستعمال ورق شفاف، أُنقل رسم رغيف واحد، ثمّ لوّن على هذا الرسم نصيب كلّ شخص. ما هو الكسر الذي يمثّل نصيب كلّ شخص؟ ④ انطلاقا من هذه الوضعية، وباستعمال الشكل، انقل وأكمل ما يلي: 5/6 + 5/6 + 5/6 + 5/6 + 5/6 + 5/6 = … × 5/6 = … ؛ اشرح لماذا يمكن أن نكتب: 5 ÷ 6 = 5/6 .',
          'answer': {'share': '5/6', 'decimal': to_decimal(F(5, 6)), 'six': frac(6 * F(5, 6))}, 'answerSource': 'computed'})
E.append({'id': 'act-2', 'kind': 'activity', 'number': 2, 'page': 53, 'section': 'اكتشف', 'title': 'تحديد موضع حاصل قسمة عددين طبيعيين على نصف مستقيم مدرّج', 'verified': False,
          'text': '① على نصف المستقيم المدرّج أدناه، عيّن كتابة كسرية ثمّ كتابة عشرية لفاصلة كلّ من النقطتين A و B. ② أعد رسم التدريج السابق ثمّ علّم عليه حواصل القسمة: 1/4 ، 1/2 ، 5/4 ، 8/4 ، 9/4 ، 5 ÷ 2 .',
          'reading': 'Unité = 4 carreaux (graduation en quarts) : A au 3e quart après 1, B au 3e quart après 2.',
          'answer': {'A': {'fraction': '7/4', 'decimal': to_decimal(F(7, 4))}, 'B': {'fraction': '11/4', 'decimal': to_decimal(F(11, 4))},
                     'marks': {s: to_decimal(v) for s, v in [('1/4', F(1, 4)), ('1/2', F(1, 2)), ('5/4', F(5, 4)), ('8/4', F(8, 4)), ('9/4', F(9, 4)), ('5÷2', F(5, 2))]}},
          'answerSource': 'computed'})
E.append({'id': 'act-3', 'kind': 'activity', 'number': 3, 'page': 53, 'pages': [53, 54], 'section': 'اكتشف', 'title': 'أخذ كسر من عدد', 'verified': False,
          'text': 'مشروب حجمه 225cL يمثّل 2/5 منه عصير برتقال. لحساب حجم عصير البرتقال المحتوى في هذا المشروب، يجب حساب 2/5 من 225cL، أي 2/5 × 225cL. يعرض ثلاثة تلاميذ طرقا للحلّ: فاطمة: قسمت 2 على 5 ثم ضربت النتيجة في 225 ؛ مريم: ضربت 2 في 225 ثم قسّمت النتيجة على 5 ؛ سعيدة: قسّمت 225 على 5 ثم ضربت النتيجة في 2. ① تحقق أنّ الطرق الثلاث تعطي نفس النتيجة. ② ما هو حجم عصير البرتقال المحتوى في هذا المشروب؟ ③ أُنقل وأتمم بإحدى العلامتين ÷ أو × : 2/5 × 225 = (2…225)/5 = (2…225)…5 ؛ 2/5 × 225 = 2…(225/5) = 2…(225…5) ؛ 2/5 × 225 = (2…5)…225 ④ شرب التلاميذ 2/3 من هذا المشروب. باستعمال الطريقة التي تراها مناسبة، أُحسب حجم المشروب الذي تناوله التلاميذ. برّر هذا الاختيار.',
          'answer': {'juice': fr(dec('0.4') * 225), 'methods': [fr((dec(2) / 5) * 225), fr(dec(2 * 225) / 5), fr((dec(225) / 5) * 2)], 'drunk': frac(F(2, 3) * 225)},
          'answerSource': 'computed'})
assert F(2, 5) * 225 == 90 and F(2, 3) * 225 == 150
ACT4 = [F(3, 5), F(6, 10), F(12, 20)]
E.append({
    'id': 'act-4', 'kind': 'activity', 'number': 4, 'page': 54, 'section': 'اكتشف', 'title': 'تحويل الكتابة الكسرية لحاصل قسمة', 'verified': True,
    'text': 'إليك ثلاثة مستطيلات متماثلة:',
    'figure': 'ثلاثة مستطيلات متماثلة على ورقة مرصوفة: (1) مقسّم بخطوط أفقية إلى 5 أشرطة متقايسة ؛ (2) نفس الأشرطة الخمسة وخط عمودي يقسم كل شريط إلى قسمين: 10 أجزاء ؛ (3) نفس الأشرطة الخمسة وثلاثة خطوط عمودية: 20 جزءا.',
    'questions': [
        '① أعد رسم المستطيلات على ورقة مرصوفة. أ) لوّن بالأصفر 3/5 من سطح المستطيل 1. ب) لوّن بالأحمر 6/10 من سطح المستطيل 2. جـ) لوّن بالأخضر 12/20 من سطح المستطيل 3.',
        '② قارن بين مساحات السطوح الملوّنة الثلاث. ماذا يمكن أن نستنتج بالنسبة للكسور: 3/5 ، 6/10 و 12/20 ؟',
        '③ أ) أُنقل وأتمم: 3/5 = (3×…)/(5×…) = 6/10 ؛ 12/20 = (12÷…)/(20÷…) = 3/5 .',
        'ب) قال الجدّ لحفيدته فاطمة: "بمناسبة عيد ميلادك، أعطيك 3/5 من 3500DA أو أعطيك 27/45 من 3500DA". ماذا تختارين؟ أجب نيابة عنها دون إجراء الحساب.',
    ],
    'answer': {'equal': len(set(ACT4)) == 1, 'parts': [[3, 5], [6, 10], [12, 20]], 'times': 2, 'divide': 4,
               'grandfather': {'27/45': frac(F(27, 45)), 'same': F(27, 45) == F(3, 5), 'amount': frac(F(3, 5) * 3500), 'k': 9}},
    'answerSource': 'computed',
})
assert F(27, 45) == F(3, 5) and F(3, 5) * 3500 == 2100

# ── p. 55 : أوظّف تعلّماتي ────────────────────────────────────────────────────────────────────────
E.append({
    'id': 'know-1', 'kind': 'knowledge', 'number': 1, 'page': 55, 'section': 'أوظّف تعلّماتي', 'title': 'حاصل القسمة والكسر', 'verified': True,
    'definition': 'الحرفان a و b يشيران إلى عددين حيث b ≠ 0 . الكتابة الكسرية لحاصل قسمة a على b هي a/b . نكتب: a ÷ b = a/b',
    'result': 'نتيجة: a/b هو العدد الذي إذا ضرب في العدد b يعطينا a . نكتب a/b × b = a',
    'vocabulary': 'مفردات: إذا كان a و b عددين طبيعيين حيث b ≠ 0 فإن a/b يسمى كسرا، العدد a يسمى البسط والعدد b يسمى المقام.',
    'remarks': ['يختلف مقام الكسر دائما عن الصفر.', 'لا يكون دائما الكسر عددا عشريا.'],
    'examples': [
        'الكسر 7/3 هو العدد الذي إذا ضرب في 3 ينتج 7، أي: 7/3 × 3 = 7 . الكسر 7/3 يمثّل أيضا حاصل قسمة 7 على 3.',
        'العدد 7/3 ليس عددًا عشريًا، لأن القسمة العشرية غير منتهية. • 2,33 هي قيمة مقربة للعدد 7/3 . • 7/3 هي القيمة المضبوطة لحاصل قسمة 7 على 3.',
        'العدد العشري يمكن دائما كتابته على شكل كسر عشري: 0,7 = 7/10',
    ],
    'answer': {'check': frac(F(7, 3) * 3), 'decimal73': to_decimal(F(7, 3)), 'approx': fr((dec(7) / 3).quantize(D('0.01'), rounding='ROUND_DOWN')), 'decimalFraction': frac(F(7, 10)) + ' = ' + to_decimal(F(7, 10))},
    'answerSource': 'computed',
})
E.append({
    'id': 'know-2', 'kind': 'knowledge', 'number': 2, 'page': 55, 'section': 'أوظّف تعلّماتي', 'title': 'حاصل القسمة ونصف المستقيم المدرج', 'verified': False,
    'text': 'أضع على نصف المستقيم المدرج حواصل القسمة: 7/5 ، 3/5 ، 19/5 . (نصف مستقيم مدرّج بأخماس: 5 تدريجات للوحدة، 3/5 و 7/5 معلّمتان). 3/5 = 1/5 × 3 . الكسر 3/5 يمثّل 3 مرات 1/5 . ملاحظة: لوضع 19/5 على نصف المستقيم المدرج، يمكن إجراء القسمة الإقليدية لـ 19 على 5 (حاصل القسمة 3 وباقي القسمة 4) إذا يمكن أن نكتب 19/5 = 3 + 4/5 و يكفي حينها عدّ أربعة أخماس بعد التدريجة 3، وبهذا نتجنب العدّ انطلاقا من التدريجة 0.',
    'answer': {'19/5': f'19 = 5 × {19 // 5} + {19 % 5}', 'bracket': [19 // 5, 19 // 5 + 1]}, 'answerSource': 'computed',
})
K3 = {'7/4': (F(7, 4), 25), '54/45': (F(54, 45), 9)}
E.append({
    'id': 'know-3', 'kind': 'knowledge', 'number': 3, 'page': 55, 'section': 'أوظّف تعلّماتي', 'title': 'الكتابات الكسرية لحاصل القسمة', 'verified': True,
    'rule': 'a و b عددان حيث b ≠ 0 . لا يتغير حاصل القسمة a/b عندما: • نضرب كلا من البسط والمقام في نفس العدد غير المعدوم. • نقسم كلا من البسط والمقام على نفس العدد غير المعدوم.',
    'remarks': 'ملاحظات: عندما نكتب 54/45 = 6/5 ، إننا نعطي كسرا مساويا لـ 54/45 ولكن ببسط أصغر و مقام أصغر. نقول: إننا اختزلنا الكسر 54/45 .',
    'examples': [
        {'n': 1, 'text': '7/4 = (7×25)/(4×25) = 175/100 ؛ 54/45 = (54÷9)/(45÷9) = 6/5'},
        {'n': 2, 'text': 'لاحظ في هذا المثال أننا أعطينا كتابة عشرية لحاصل قسمة 2,1 على 3,5 بتحويل كتاباته الكسرية دون إجراء عملية القسمة. 2,1 ÷ 3,5 = 2,1/3,5 = (2,1×10)/(3,5×10) = 21/35 = (21÷7)/(35÷7) = 3/5 = 6/10 = 0,6'},
    ],
    'answer': {'7/4': {'x25': '175/100', 'decimal': to_decimal(F(7, 4))}, '54/45': {'k': 9, 'reduced': frac(F(54, 45))},
               '2,1÷3,5': {'times10': '21/35', 'k': 7, 'reduced': frac(F(21, 35)), 'tenths': '6/10', 'decimal': to_decimal(F(21, 35))}},
    'answerSource': 'computed',
})
assert F(7 * 25, 4 * 25) == F(175, 100) and F(54, 45) == F(6, 5) and dec('2.1') / dec('3.5') == D('0.6')

# ── p. 56 : أكتسب طرائق ; دوري الآن ───────────────────────────────────────────────────────────────
E.append({'id': 'method-1', 'kind': 'method', 'number': 1, 'page': 56, 'section': 'أكتسب طرائق', 'title': 'أخذ كسر من عدد', 'verified': False,
          'text': 'نص: تعداد تلاميذ أحد أقسام السنة أولى من التعليم المتوسط هو 35 ؛ 3/5 من عدد تلاميذ القسم هم أولاد، ما هو عدد البنات؟ طريقة: أخذ كسر من عدد يعود إلى ضرب هذا الكسر في هذا العدد. لضرب عدد في a/b يمكن: ضرب هذا العدد في a ثم تقسيم النتيجة على b ؛ تقسيم هذا العدد على b ثم ضرب النتيجة في a ؛ ضرب هذا العدد في حاصل قسمة a على b. حل: 3/5 × 35 = (3 ÷ 5) × 35 = 0,6 × 35 = 21 أو 3 × (35 ÷ 5) = 3 × 7 = 21 أو (3 × 35) ÷ 5 = 105 ÷ 5 = 21 ومنه عدد البنات هو 35 − 21 = 14 . لاحظ: 1 - في هذه الوضعية الإجراء الأكثر فعالية من بين الإجراءات الثلاثة هو الإجراء الثاني، فهو يمكّنك من الحساب ذهنيا. 2 - إذا كانت كل من القسمتين غير منتهية، نبدأ بالضرب ونحتفظ بالنتيجة على شكل كتابة كسرية ويمكن حينها إعطاء قيمة مقربة لها.',
          'answer': {'boys': frac(F(3, 5) * 35), 'girls': frac(35 - F(3, 5) * 35)}, 'answerSource': 'computed'})
M2 = reduce_steps(45, 567)
E.append({
    'id': 'method-2', 'kind': 'method', 'number': 2, 'page': 56, 'section': 'أكتسب طرائق', 'title': 'اختزال كتابة كسرية', 'verified': True,
    'text': 'مثال: اختزل الكسر 45/567',
    'solution': [
        {'step': '1. نبحث عن قاسم مشترك للبسط والمقام', 'lines': ['نلاحظ أن 45 = 5 × 9 إذًا 45 يقبل القسمة على 9.', 'ونلاحظ 5 + 6 + 7 = 18 = 2 × 9 إذًا 567 يقبل القسمة على 9.', 'نجري قسمة 567 على 9 فنجد 63 أي 567 = 9 × 63'],
         'hints': ['استخدم جداول الضرب.', 'استخدم قواعد قابلية القسمة.']},
        {'step': '2. نقسم كلا من البسط والمقام على هذا القاسم', 'lines': ['إذًا: 45/567 = (45÷9)/(567÷9) = 5/63'],
         'hints': ['9 هو قاسم لكل من 567 و 45', 'نقول إننا اختزلنا كلا من البسط والمقام على 9.']},
    ],
    'answer': {'k': 9, 'reduced': frac(F(45, 567)), 'digitSum567': 5 + 6 + 7, 'irreducible': gcd(5, 63) == 1, 'path': M2},
    'answerSource': 'computed',
})
assert F(45, 567) == F(5, 63) and 567 == 9 * 63
GAUGES = [(F(3, 4), 50), (F(5, 6), 60), (F(3, 8), 70)]
NOW56_2 = {'24/56': ('3×8', '7×8', F(24, 56)), '25/45': ('5×5', '9×5', F(25, 45))}
NOW56_3 = [(21, 14), (8, 10), (14, 21), (44, 33), (32, 56)]
E.append({
    'id': 'now-56', 'kind': 'practice', 'page': 56, 'section': 'دوري الآن', 'verified': True,
    'items': [
        {'n': 1, 'text': 'إليك عدادات لثلاث سيارات (خزّانات 50L ، 60L ، 70L). أُحسب كمية البنزين الموجودة في كل خزّان.', 'verified': False,
         'reading': 'Lecture des cadrans : 1) 4 graduations, aiguille sur la 3e (3/4 de 50 L) ; 2) 6 graduations, aiguille sur la 5e (5/6 de 60 L) ; 3) 8 graduations, aiguille sur la 3e (3/8 de 70 L) — à relire avec akhdh-kasr-min-adad.',
         'answer': [fr(D(f.numerator * c) / D(f.denominator)) + ' L' for f, c in GAUGES]},
        {'n': 2, 'text': 'أُنقل وأتمم : 24/56 = (3×8)/(7×…) = 3/… ؛ 25/45 = (5×5)/(…×5) = 5/…',
         'answer': {k: {'blank': v[1], 'reduced': frac(v[2])} for k, v in NOW56_2.items()}},
        {'n': 3, 'text': 'اختزل كلا من الكسور الآتية: 32/56 ، 44/33 ، 14/21 ، 8/10 ، 21/14',
         'answer': {f'{n}/{d}': reduce_steps(n, d)['irreducible'] for n, d in NOW56_3}},
    ],
    'answerSource': 'computed',
})
assert [F(n, d) for n, d in NOW56_3] == [F(3, 2), F(4, 5), F(2, 3), F(4, 3), F(4, 7)]

# ── pp. 57–58 : أتمرّن ─────────────────────────────────────────────────────────────────────────────


def exercise(n, page, group, text, verified=True, **extra):
    E.append({'id': f'ex-{n}', 'kind': 'exercise', 'number': n, 'page': page, 'section': 'أتمرّن', 'group': group, 'verified': verified, 'text': text, **extra})


G1, G2, G3 = 'الكسر وحاصل القسمة', 'حاصل القسمة ونصف المستقيم المدرج', 'ضرب كسر في عدد'
exercise(1, 57, G1, 'في كل حالة، عبّر بكسر عن السطح الملون بالأزرق. (ثلاثة مستطيلات: ① قطرا المستطيل وخط أفقي في منتصفه ؛ ② مستطيل 2 × 3 مربعات، كل مربع مقسوم بقطره ؛ ③ مستطيل مقسوم إلى 2 × 6 مستطيلات)', verified=False,
         reading='① le triangle du haut (1/4) + les moitiés basses des triangles gauche et droit (1/8 + 1/8) ; ② 5 demi-carrés bleus sur 12 ; ③ 7 cases bleues sur 12.',
         answer={'1': frac(F(1, 4) + F(1, 8) + F(1, 8)), '2': frac(F(5, 12)), '3': frac(F(7, 12))}, answerSource='computed')
exercise(2, 57, G1, 'في كل حالة من الحالات الآتية، هل الجزء الملوّن يمثّل 3/4 من سطح الشكل؟ (① شريط من 7 خانات، 3 منها ملوّنة ؛ ② مربع 4 × 4 ؛ ③ قرص مقسوم بأوتار متوازية إلى أجزاء غير متقايسة)', verified=True,
         reading='① 3 cases sur 7 (relu à 300 dpi, 2026-10-15 : sept cases, non huit) ; ② 12 cases sur 16 colorées (la 4e case de la 2e rangée, teintée par le filigrane, est blanche) ; ③ parts non égales.',
         answer={'1': F(3, 7) == F(3, 4), '2': F(12, 16) == F(3, 4), '3': False}, answerSource='computed')
EX3 = ['13/9', '6/8', '9/11', '11/6', '17/17', '9/13']
exercise(3, 57, G1, 'اذكر من بين الكسور: 9/13 ، 17/17 ، 11/6 ، 9/11 ، 6/8 ، 13/9 : 1) الكسر الذي نضربه في 9 يعطينا 13. 2) الكسر الذي يساوي 9 ÷ 11. 3) الكسر الذي يساوي 0,75. 4) الكسر الذي يساوي 1. 5) الكسر الذي بسطه 11. 6) الكسر الذي مقامه 13.', verified=False,
         answer={'1': '13/9', '2': '9/11', '3': next(s for s in EX3 if F(s) == F(3, 4)), '4': '17/17', '5': '11/6', '6': '9/13'}, answerSource='computed')
exercise(4, 57, G1, 'في كل حالة، اكتب العدد الذي ينقص على شكل كسر: 9 × … = 7 ؛ 3 × … = 7 ؛ 13 × … = 19 ؛ 7 × … = 1', verified=False,
         answer={'9': '7/9', '3': '7/3', '13': '19/13', '7': '1/7'}, answerSource='computed')
exercise(5, 57, G1, 'انقل وأتمم: … × 8 = 13 ؛ 6 × 7/6 = … ؛ 8 × … = 19 ؛ … × 11 = 11', verified=False,
         answer={'a': '13/8', 'b': frac(6 * F(7, 6)), 'c': '19/8', 'd': '1'}, answerSource='computed')
for n, unit, pts in [(6, 3, {'A': 1, 'B': 5, 'C': 8}), (7, 2, {'A': 1, 'B': 3, 'C': 8}), (8, 7, {'A': 1, 'B': 3, 'C': 8})]:
    exercise(n, 57, G2, 'بالنسبة للتمارين 6، 7، 8 أعط على شكل كسر فاصلة كل من النقط A، B، C .', verified=False,
             reading=f'La graduation coupe l’unité en {unit} ; A, B, C sont aux graduations {pts["A"]}, {pts["B"]}, {pts["C"]}.',
             answer={k: frac(F(v, unit)) if F(v, unit).denominator == 1 else f'{v}/{unit}' for k, v in pts.items()}, answerSource='computed')
exercise(9, 57, G2, '1) ارسم نصف مستقيم مدرج، وحدته 4cm 2) حدّد عليه مواضع حواصل القسمة: 16/4 ، 7/2 ، 3 ÷ 4 ، 7/4 ، 1/4', verified=False,
         answer={s: fr(v * 4) + ' cm' for s, v in [('16/4', D(4)), ('7/2', D('3.5')), ('3÷4', D('0.75')), ('7/4', D('1.75')), ('1/4', D('0.25'))]}, answerSource='computed')
exercise(10, 57, G3, 'احسب ذهنيا: 26,75/13 × 13 ؛ 9 × 8/10 ؛ 3/2 × 16 ؛ 15/3 × 7', verified=False,
         answer=['26,75', fr(dec(9) * dec('0.8')), frac(F(3, 2) * 16), frac(F(15, 3) * 7)], answerSource='computed')
exercise(11, 57, G3, 'احسب ذهنيا: 21,3/10 × 100 ؛ 27/3 × 8 ؛ 18 × 7/9 ؛ 23/7 × 7', verified=False,
         answer=[fr(dec('21.3') * 10), frac(F(27, 3) * 8), frac(18 * F(7, 9)), frac(F(23, 7) * 7)], answerSource='computed')
exercise(12, 57, G3, 'حافلة فيها 54 مقعدا، سبعة أتساع المقاعد محجوزة، كم راكبا في هذه الحافلة؟', verified=False, answer=frac(F(7, 9) * 54), answerSource='computed')
exercise(13, 57, G3, 'عبّر بالدقائق عن كل من كسور الساعة الآتية: 1) h 1/2 2) h 3/4 3) h 1/10 4) h 2/6 5) h 1/4', verified=False,
         answer=[frac(f * 60) for f in (F(1, 2), F(3, 4), F(1, 10), F(2, 6), F(1, 4))], answerSource='computed')
exercise(14, 57, G3, 'تقاسم ثلاثة أولاد مبلغ 700 DA. الأول أخذ 3/7 من المبلغ والثاني 2/5 من المبلغ. – ما هو المبلغ الذي يتحصل عليه الثالث؟', verified=False,
         answer={'first': frac(F(3, 7) * 700), 'second': frac(F(2, 5) * 700), 'third': frac(700 - F(3, 7) * 700 - F(2, 5) * 700)}, answerSource='computed')

G4, G5, G6 = 'تحويل الكتابة الكسرية لحاصل قسمة', 'اختزال كسور', 'قواعد قابلية القسمة واختزال الكسور'
EX15 = [('18/32 = …/16', F(18, 32) * 16), ('28/20 = 7/…', 7 / F(28, 20)), ('3/8 = 24/…', 24 / F(3, 8)), ('3/7 = …/35', F(3, 7) * 35)]
exercise(15, 58, G4, 'انقل وأتمم : 1) 18/32 = …/16 2) 28/20 = 7/… 3) 3/8 = 24/… 4) 3/7 = …/35',
         answer={k: frac(v) for k, v in EX15}, answerSource='computed')
EX16 = {'12/20': F(12, 20), '0,8': F(8, 10), '1,25': F(125, 100), '4,5': F(45, 10), '8/10': F(8, 10)}
exercise(16, 58, G4, 'من بين الأعداد الآتية، اذكر التي تكون مساوية للكسر 4/5 : 12/20 ، 0,8 ، 1,25 ، 4,5 ، 8/10',
         answer=[k for k, v in EX16.items() if v == F(4, 5)], answerSource='computed')
EX17 = {'24 ÷ 36': F(24, 36), '24 ÷ 16': F(24, 16), '3 ÷ 2': F(3, 2), '2 ÷ 3': F(2, 3)}
exercise(17, 58, G4, 'من بين حواصل القسمة الآتية، اذكر التي تكون مساوية للكسر 8/12 : 24 ÷ 36 ، 24 ÷ 16 ، 3 ÷ 2 ، 2 ÷ 3',
         answer=[k for k, v in EX17.items() if v == F(8, 12)], answerSource='computed')
EX18 = [(6, 10), (9, 15), (24, 40), (12, 20), (27, 35)]
odd = [f'{n}/{d}' for n, d in EX18 if F(n, d) != F(3, 5)]
exercise(18, 58, G4, 'كسر واحد من بين الكسور الآتية لا يساوي الكسور الأخرى، ابحث عنه وبرّر إجابتك. 1) 6/10 2) 9/15 3) 24/40 4) 12/20 5) 27/35',
         answer={'odd': odd, 'others': frac(F(3, 5)), 'why': '27/35: 27 ÷ 9 = 3 لكن 35 لا يقبل القسمة على 9'}, answerSource='computed')
assert odd == ['27/35']
EX19 = {'den10': F(6, 10), 'den5': F(3, 5), 'den15': F(9, 15), 'num18': F(18, 30)}
exercise(19, 58, G4, '1) اكتب كسرا يساوي 0,6 ومقامه 10. 2) استنتج كسرا يساوي 0,6 ومقامه 5. 3) استنتج كسرا يساوي 0,6 ومقامه 15. 4) استنتج كسرا يساوي 0,6 وبسطه 18.',
         answer={'1': '6/10', '2': '3/5', '3': '9/15', '4': '18/30'}, answerSource='computed')
assert all(v == F(3, 5) for v in EX19.values())
EX20 = ['3,6', '0,20', '1,5', '4,6', '0,8']
exercise(20, 58, G5, 'اكتب كل عدد عشري على شكل كسر أبسط ما يمكن : 3,6 ، 0,20 ، 1,5 ، 4,6 ، 0,8',
         answer={s: frac(F(dec(s))) for s in EX20}, answerSource='computed')
EX21 = [(35, 25), (63, 36), (36, 28), (24, 36), (75, 45)]
EX22 = [(25, 25), (13, 39), (16, 18), (64, 24), (24, 14)]
exercise(21, 58, G5, 'في التمارين 21، 22، 23 اختزل إلى أبسط شكل ممكن الكتابات الكسرية الآتية : 1) 35/25 2) 63/36 3) 36/28 4) 24/36 5) 75/45',
         answer={f'{n}/{d}': reduce_steps(n, d) for n, d in EX21}, answerSource='computed')
exercise(22, 58, G5, '1) 25/25 2) 13/39 3) 16/18 4) 64/24 5) 24/14',
         answer={f'{n}/{d}': reduce_steps(n, d) for n, d in EX22}, answerSource='computed')
EX23 = [('2,5', '0,5'), ('6,4', '0,4'), ('6,5', '2,5'), ('3,2', '0,1'), ('5,6', '1,2')]
exercise(23, 58, G5, '1) 2,5/0,5 2) 6,4/0,4 3) 6,5/2,5 4) 3,2/0,1 5) 5,6/1,2',
         answer={f'{a}/{b}': {'times10': f'{int(dec(a) * 10)}/{int(dec(b) * 10)}', 'simplest': frac(F(dec(a)) / F(dec(b)))} for a, b in EX23},
         answerSource='computed')
NUM24 = [81, 111, 142, 153, 300, 675, 1211, 65808]
exercise(24, 58, G6, 'إليك الأعداد الطبيعية الآتية : 81 ، 111 ، 142 ، 153 ، 300 ، 675 ، 1211 ، 65808 – اذكر من بينها التي: 1) تقبل القسمة على 2. 2) تقبل القسمة على 3. 3) تقبل القسمة على 4. 4) تقبل القسمة على 5. 5) تقبل القسمة على 9. 6) تقبل القسمة على 10.',
         answer={str(k): [n for n in NUM24 if n % k == 0] for k in (2, 3, 4, 5, 9, 10)}, answerSource='computed',
         note='La divisibilité par 10 n’est pas une règle du معارف de l’unité 3 (2, 3, 4, 5, 9) : 10 = 2 × 5, chiffre des unités 0.')
EX25 = [(198, 495), (135, 105), (84, 63)]
exercise(25, 58, G6, 'باستعمال قواعد قابلية القسمة، اختزل الكسور الآتية: 198/495 ، 135/105 ، 84/63',
         answer={f'{n}/{d}': reduce_steps(n, d) for n, d in EX25}, answerSource='computed')
exercise(26, 58, G6, 'تحقق أنّ : 414/391 = 18/17',
         answer={'common': 23, '414': '18 × 23', '391': '17 × 23', 'equal': F(414, 391) == F(18, 17), 'crossCheck': 414 * 17 == 391 * 18},
         note='Aucune règle de divisibilité ne donne le diviseur commun 23 : la vérification se fait par 414 = 18 × 23 et 391 = 17 × 23 (ou 414 × 17 = 391 × 18 = 7038).',
         answerSource='computed')
assert 18 * 23 == 414 and 17 * 23 == 391
exercise(27, 58, G6, 'سأل الأستاذ التلاميذ «هل العدد 91 يقبل قاسما محصورا بين 2 و 10؟». – سامي: لا. حسب قواعد قابلية القسمة، 91 ليس له قاسم. – فاطمة: نعم. وجدت قاسما. من منهما على صواب؟',
         answer={'right': 'فاطمة', 'divisors2to10': [k for k in range(2, 11) if 91 % k == 0], 'why': '91 = 7 × 13 : 7 قاسم لا تكشفه قواعد 2 ، 3 ، 4 ، 5 ، 9'},
         answerSource='computed')
assert [k for k in range(2, 11) if 91 % k == 0] == [7]
E.append({'id': 'aside-58', 'kind': 'aside', 'page': 58, 'section': 'أتمرّن', 'title': 'قسمة الجمال', 'verified': False,
          'text': 'يحكى أنّه جاء إلى رجل ثلاثة رجال يختصمون في سبعة عشر بعيراً. أولهم يدعي نصفها وثانيهم ثلثها، وثالثهم تُسعها. فاحتاروا في قسمتها، لأن في ذلك سيكون كسراً (أي جزء من بعير). فقال الرجل: أترضون أن أضع بعيراً مني فوقها وأقسّمها بينكم؟ قالوا: نعم. فوضع الرجل بعيراً بين الجمال، فصارت ثمانية عشر، فأعطى الأول نصفها وهو تسعة، وأعطى الثاني ثلثها وهو ستة، وأعطى الثالث تسعها وهو اثنان وبقي بعير هو بعيره فأخذه.',
          'answer': {'shares': [frac(F(1, 2) * 18), frac(F(1, 3) * 18), frac(F(1, 9) * 18)], 'sum': frac(F(1, 2) + F(1, 3) + F(1, 9)), 'why': '1/2 + 1/3 + 1/9 = 17/18 < 1 : les trois parts ne font pas tout l’héritage.'},
          'answerSource': 'computed'})
assert F(1, 2) + F(1, 3) + F(1, 9) == F(17, 18)

# ── p. 59 : أقوّم تعلّماتي ──────────────────────────────────────────────────────────────────────────


def self_item(n, refs, text, verified=True, **extra):
    E.append({'id': f'self-{n}', 'kind': 'self_assessment', 'number': n, 'page': 59, 'section': 'أقوّم تعلّماتي', 'verified': verified, 'reviewPages': refs, 'text': text, **extra})


self_item(1, [57, 60], 'إليك أربعة أنابيب اختبار، يحتوي كل منها على كمية من الماء. املإ الفراغات في الجدول المقابل (عبّر بكسر عن كمية الماء المحتوى في الأنبوب A ، B ، C ، D).', verified=False,
          reading='Les graduations des quatre tubes sont trop petites à cette résolution : à relire au rendu 400 dpi avec hasil-qisma-kasr (C est plein).')
self_item(2, [57, 60], 'الكسر 7/3 يمثّل: 7 مرات 1/3 ؛ العدد الذي إذا ضرب في 3 ينتج 7 ؛ 7 ÷ 3 ؛ العدد الذي إذا ضرب في 7 ينتج 3', verified=False,
          answer={'correct': [0, 1, 2], 'check': [frac(7 * F(1, 3)), frac(F(7, 3) * 3), frac(F(3, 7) * 7)]}, answerSource='computed')
self_item(3, [57, 60], 'حاصل القسمة 11/7 يساوي: 11 ÷ 7 ؛ 11,7 ؛ 7 ÷ 11 ؛ 1,571', verified=False,
          answer={'correct': [0], 'approx': fr((dec(11) / 7).quantize(D('0.001'), rounding='ROUND_DOWN')), 'decimal': to_decimal(F(11, 7))}, answerSource='computed')
S4 = {'0,75': F(75, 100), '24/28': F(24, 28), '3/4': F(3, 4), '6/8': F(6, 8)}
self_item(4, [59, 60, 61], 'الكسر 12/16 يساوي: 0,75 ؛ 24/28 ؛ 3/4 ؛ 6/8',
          answer={'correct': [k for k, v in S4.items() if v == F(12, 16)], 'wrong': {'24/28': frac(F(24, 28))}}, answerSource='computed')
assert [k for k, v in S4.items() if v == F(12, 16)] == ['0,75', '3/4', '6/8']
S5 = {'4/2': F(4, 2), '11/6': F(11, 6), '22/12': F(22, 12), '1 + 5/6': 1 + F(5, 6)}
self_item(5, [59, 60, 61], 'الكسر 44/24 يساوي: 4/2 ؛ 11/6 ؛ 22/12 ؛ 1 + 5/6',
          answer={'correct': [k for k, v in S5.items() if v == F(44, 24)], 'reduced': frac(F(44, 24))}, answerSource='computed')
assert [k for k, v in S5.items() if v == F(44, 24)] == ['11/6', '22/12', '1 + 5/6']
self_item(6, [58, 60], '1. اقرأ فواصل النقط A, B, C . 2. إليك التدريج الآتي (من 0 إلى 2، الوحدة 6 خانات): ضع عليه حواصل القسمة: 5/6 ، 2 − 1/3 ، 11 ÷ 6 ، 55/33', verified=False,
          reading='1. unité = 3 carreaux : A au 1er tiers, B au 2e tiers après 1, C au 1er tiers après 2.',
          answer={'A': '1/3', 'B': '5/3', 'C': '7/3', 'marks': {'5/6': frac(F(5, 6)), '2−1/3': frac(2 - F(1, 3)), '11÷6': frac(F(11, 6)), '55/33': frac(F(55, 33))}},
          note='55/33 = 5/3 = 2 − 1/3 : le même point — une réduction (÷ 11) cachée dans un exercice de graduation.', answerSource='computed')
self_item(7, [58, 61], 'لحساب الجداء 2/13 × 39 نقترح عليك أربع إجابات. حدّد فيما إذا كان كل منها صحيحًا أو خاطئًا: (39×2)/(39×13) ؛ 78/13 ؛ 5,85 ؛ 6', verified=False,
          answer={'value': frac(F(2, 13) * 39), '(39×2)/(39×13)': F(39 * 2, 39 * 13) == F(2, 13) * 39, '78/13': F(78, 13) == 6, '5,85': False, '6': True}, answerSource='computed')
self_item(8, [58, 61], 'إذا طُلب منك أن تحسب ذهنيا الجداء 2/3 × 27 فأي إجراء من الإجراءات المقابلة تختار؟ (27 × 2) ÷ 3 ؛ (27 ÷ 3) × 2 ؛ (2 ÷ 3) × 27', verified=False,
          answer={'value': frac(F(2, 3) * 27), 'best': '(27 ÷ 3) × 2', 'why': '2 ÷ 3 n’est pas décimal ; 27 ÷ 3 = 9 tombe juste'}, answerSource='computed')
self_item(9, [57, 58, 61], 'في كل حالة أُكتب العدد الناقص: … × 3 = 2 ؛ 8 = 5 × … ؛ 7 × … = 5 ؛ 9 × … = 2 ؛ 7 × … = 0,7 ؛ 9 × … = 1 ؛ 5/12 × 3 = … ؛ 14/5 × … = 14 ؛ 7 × 2/21 = … ؛ 27 × … = 0,27', verified=False,
          answer={'…×3=2': '2/3', '8=5×…': '8/5', '7×…=5': '5/7', '9×…=2': '2/9', '7×…=0,7': '0,1', '9×…=1': '1/9',
                  '5/12×3': frac(F(5, 12) * 3), '14/5×…=14': '5', '7×2/21': frac(7 * F(2, 21)), '27×…=0,27': '0,01'},
          note='5/12 × 3 = 15/12 = 5/4 et 7 × 2/21 = 14/21 = 2/3 : deux résultats à réduire.', answerSource='computed')

# ── p. 60 : أتعمّق ─────────────────────────────────────────────────────────────────────────────────


def deep(n, text, verified=True, **extra):
    E.append({'id': f'deep-{n}', 'kind': 'deepen', 'number': n, 'page': 60, 'section': 'أتعمّق', 'verified': verified, 'text': text, **extra})


def tri_area2(p, q, r):
    return abs(p[0] * (q[1] - r[1]) + q[0] * (r[1] - p[1]) + r[0] * (p[1] - q[1]))


T1, T2 = [(1, 4), (0, 1), (3, 0)], [(2, 4), (0, 0), (4, 2)]
deep(1, 'تحدّي: عبّر بكسر عن الجزء الملوّن من المربع. (مربعان 4 × 4 على ورقة مرصوفة، في كل منهما مثلث ملوّن رؤوسه على عقد الشبكة)',
     figure={'square': 4, 'triangle1': T1, 'triangle2': T2, 'coords': '(x من اليسار، y من الأسفل) بالخانات'},
     answer={'1': {'area': frac(F(tri_area2(*T1), 2)), 'fraction': frac(F(tri_area2(*T1), 2) / 16), 'raw': f'{F(tri_area2(*T1), 2)}/16'},
             '2': {'area': frac(F(tri_area2(*T2), 2)), 'fraction': frac(F(tri_area2(*T2), 2) / 16), 'raw': f'{F(tri_area2(*T2), 2)}/16'}},
     note='Aire par différence (le carré moins trois triangles rectangles) ; le 2 donne 6/16, à RÉDUIRE en 3/8.', answerSource='computed')
assert F(tri_area2(*T1), 2) == 5 and F(tri_area2(*T2), 2) == 6
q = dec('38.2') / dec('1.4')
deep(2, 'تحقق من نتيجة: لحساب 38,2 ÷ 1,4 أجرت فاطمة القسمة العشرية (382,00 على 14 : الحاصل 27,28 والباقي المكتوب 08). ولكي تتأكد كتبت: 27,28 × 14 + 8 = … 1) ما هي الخاصية التي أرادت فاطمة تطبيقها؟ 2) أُحسب 27,28 × 14 + 8 3) أصابت فاطمة خيبة أمل، ماذا كانت تأمل أن تجد؟ – أين الخطأ؟', verified=False,
     answer={'property': 'المقسوم = المقسوم عليه × الحاصل + الباقي', 'computed': fr(dec('27.28') * 14 + 8), 'hoped': '382', 'error': 'الباقي هو 0,08 لا 8 : 27,28 × 14 + 0,08 = ' + fr(dec('27.28') * 14 + dec('0.08'))},
     answerSource='computed')
assert dec('27.28') * 14 + dec('0.08') == 382
deep(3, 'الحرّ شديد: فتحت فاطمة في هذا الصباح قارورة ماء سعتها 1,5L وشربت منها 2/5 . وفي منتصف النهار شربت 2/3 من الباقي. – ما هي كمية الماء المتبقية في القارورة؟', verified=False,
     answer=fr(dec('1.5') * (1 - D(2) / 5) * D(1) / 3) + ' L', answerSource='computed')
assert F(3, 2) * F(3, 5) * F(1, 3) == F(3, 10)
G = 1 - F(1, 4) - F(3, 7)
deep(4, 'زراعة الخضر: خصّص عماد رُبع مساحة حديقته لزراعة الطماطم وثلاثة أسباع لزراعة نبات الخسّ، أمّا الباقي فقد خصّصه لزراعة الفول. 1) أ) مثّل الحديقة بمستطيل طوله 8cm وعرضه 7cm. ب) لوّن بالأحمر الجزء المخصص للطماطم، وبالأخضر الجزء المخصص لنبات الخس. جـ) حدّد بكسر الجزء المخصص للفول. 2) إذا علمت أنّ مساحة المزرعة 364m²، أُحسب مساحة كل جزء من الحديقة.', verified=False,
     answer={'beans': frac(G), 'cells56': [frac(F(1, 4) * 56), frac(F(3, 7) * 56), frac(G * 56)], 'areas': [frac(F(1, 4) * 364), frac(F(3, 7) * 364), frac(G * 364)]},
     answerSource='computed')
JUP = 143000
deep(5, 'نافذة على الفلك: يعتبر كوكب المشتري أكبر كواكب النظام الشمسي حيث يبلغ قطره 143 000 km . 5/6 من قطر المشتري هو قطر كوكب زحل. يبلغ قطر كوكب الزهرة 9/100 من قطر المشتري. تقريبا 2/5 من قطر كوكب الزهرة هو قطر كوكب عطارد. – أُحسب قطر كل من زحل، الزهرة وعطارد. تعطى القيم مقربة إلى الوحدة.', verified=False,
     answer={'saturn': str(round(F(5, 6) * JUP)), 'venus': frac(F(9, 100) * JUP), 'mercury': frac(F(2, 5) * F(9, 100) * JUP)}, answerSource='computed')
deep(6, 'أبحث عن ارتفاع بناية: بنايتان مجموع ارتفاعهما 39,2m . ارتفاع البناية الصغرى هو ثلاثة أرباع ارتفاع البناية الكبرى. – ما هو ارتفاع كل من البنايتين؟', verified=False,
     answer={'big': fr(dec('39.2') * 4 / 7), 'small': fr(dec('39.2') * 3 / 7)}, answerSource='computed')
deep(7, 'أفهم النص وأجيب: يُقذف بكرة من ارتفاع 12,15m ؛ وكلما تصطدم بسطح الأرض، ترتد بـ 2/3 من الارتفاع السابق. – ما هو الارتفاع الذي تبلغه بعد الاصطدام الرابع؟', verified=False,
     answer=to_decimal(F(1215, 100) * F(2, 3) ** 4) + ' m', answerSource='computed')
assert F(1215, 100) * F(2, 3) ** 4 == F(12, 5)
A8 = [(t, u) for t in range(10) for u in range(10)]
num8 = lambda t, u: 5000 + t * 100 + 20 + u
deep(8, 'أفكّر وأشكّل: نعتبر العدد A = 5Δ2□ حيث لا نعرف رقم آحاده ولا رقم مئاته. 1) عيّن بعض الأعداد A حسب كل شرط من الشروط الآتية: أ) A يقبل القسمة على 2 و 5 معا. ب) A يقبل القسمة على 2 و 3 معا. جـ) A يقبل القسمة على 3 و 4 معا. 2) عيّن كل الأعداد A التي تقبل القسمة على 5 و 9 معا.',
     answer={'2&5': [num8(t, u) for t, u in A8 if num8(t, u) % 10 == 0], '2&3': [num8(t, u) for t, u in A8 if num8(t, u) % 6 == 0],
             '3&4': [num8(t, u) for t, u in A8 if num8(t, u) % 12 == 0], '5&9': [num8(t, u) for t, u in A8 if num8(t, u) % 45 == 0]},
     answerSource='computed')
assert [num8(t, u) for t, u in A8 if num8(t, u) % 45 == 0] == [5220, 5625]

# ── p. 61 : أتعلّم الإدماج ; وضعية تقويم ──────────────────────────────────────────────────────────
L = F(400) / (1 + F(2, 3))
W = F(2, 3) * L
AREA = L * W
APPLE = F(3, 5) * AREA
POM = AREA - APPLE
n_apple = APPLE / 12
n_pom = -(-POM.numerator // (17 * POM.denominator))  # arrondi à l'unité par excès, comme le manuel
E.append({'id': 'integration', 'kind': 'integration', 'page': 61, 'section': 'أتعلّم الإدماج', 'title': 'استثمار فلاحي', 'verified': False,
          'text': 'في إطار دمج الشباب في قطاع الاستثمار الفلاحي، تحصّل خريج مدرسة فلاحية على قطعة أرض مستطيلة الشكل محيطها 800m وعرضها يساوي 2/3 من طولها، ولهذا الغرض اقترض من البنك مبلغ 7 500 000 DA بدون فوائد. وبعد استصلاحها غرس الشاب 3/5 المساحة أشجار تفاح، بمعدل شجرة في كل 12m² وغرس المساحة المتبقية رمانا بمعدل شجرة في كل 17m². ما هو معدل كلفة شجرة واحدة من الأشجار المغروسة؟',
          'shortSolution': ['عدد أشجار التفاح 1920 شجرة.', 'عدد أشجار الرمان 904 شجرة (نأخذ القيمة المقربة إلى الوحدة بالزيادة لحاصل القسمة 15360 ÷ 17).', 'عدد الأشجار الإجمالية 2824 شجرة.', 'تقدّر كلفة شجرة واحدة بمبلغ 2656DA.'],
          'answer': {'L': frac(L), 'W': frac(W), 'area': frac(AREA), 'apple': frac(n_apple), 'pomArea': frac(POM), 'pom': n_pom, 'total': int(n_apple) + n_pom,
                     'cost': fr((D(7500000) / D(int(n_apple) + n_pom)).quantize(D('1'), rounding='ROUND_HALF_UP'))},
          'answerSource': 'computed'})
assert (L, W, n_apple, n_pom) == (240, 160, 1920, 904)
P1, P2 = 135, 108  # 1AM et 2AM : somme 243, différence 27
went = F(1, 3) * P1 + F(1, 4) * P2
E.append({'id': 'evaluation', 'kind': 'integration', 'page': 61, 'section': 'وضعية تقويم', 'verified': False,
          'text': 'نظمت إحدى المتوسطات رحلة ترفيهية، شارك فيها 5 مشرفين و 1/3 تلاميذ السنة الأولى و 1/4 تلاميذ السنة الثانية. علما أنّ مجموع تلاميذ المستويين هو 243 تلميذا ؛ وعدد تلاميذ السنة الأولى يفوق عدد تلاميذ السنة الثانية بـ 27 تلميذا. بلغت كلفة الرحلة بالدينار 12800DA، حيث ساهمت المتوسطة بـ 2/5 من المبلغ وخُصّصت مجانية المشاركة للمشرفين الخمسة و12 تلميذا ؛ وتقاسم المشاركون الآخرون بقية تكاليف الرحلة بالتساوي. - احسب بالدينار المبلغ الذي دفعه كل تلميذ ساهم في الرحلة.',
          'answer': {'1am': P1, '2am': P2, 'pupils': frac(went), 'school': frac(F(2, 5) * 12800), 'rest': frac(F(3, 5) * 12800), 'payers': frac(went - 12), 'each': frac(F(3, 5) * 12800 / (went - 12))},
          'answerSource': 'computed'})
assert P1 + P2 == 243 and P1 - P2 == 27 and F(3, 5) * 12800 / (went - 12) == 128

# ── p. 62 : استعمل تكنولوجيات الإعلام والاتصال ────────────────────────────────────────────────────
ICT_NOW = [(285, 684), (250, 1250), (9592, 11336), (35922, 5987)]
E.append({
    'id': 'ict', 'kind': 'ict', 'page': 62, 'section': 'استعمل تكنولوجيات الإعلام والاتصال', 'title': 'الآلة الحاسبة', 'verified': True,
    'examples': [
        {'n': 1, 'text': 'نريد اختزال الكسر 52/65 ثم نعطي له كتابة عشرية. المعالجة: نلمس بالترتيب 52 ← a b/c ← 65 ، تُظهر الشاشة 52┘65 هذا يعني 52/65 . نلمس على = ، تُظهر الشاشة 4┘5 هذا يعني 4/5 إذًا: 52/65 = 4/5 . استنتج قاسمًا مشتركًا لـ 52 و 65. نلمس من جديد على a b/c تظهر الشاشة 0,8 الكتابة العشرية للكسر 52/65 .'},
        {'n': 2, 'text': 'نريد اختزال الكسر 1921/791 ثم نعطي له كتابة عشرية. المعالجة: نلمس بالترتيب على 1921 ← a b/c ← 791 ، تُظهر الشاشة 1921┘791 . نلمس على = ، تُظهر الشاشة 2┘3┘7 هذا يعني 1921/791 = 2 + 3/7 . نلمس SHIFT ثم a b/c ، تُظهر الشاشة 17┘7 هذا يعني إذن: 1921/791 = 17/7 . استنتج قاسمًا مشتركًا لـ 1921 و 791. نلمس من جديد على a b/c ، تُظهر الشاشة 2,428571429 قيمة تقريبية للكسر 1921/791 . الكسر 1921/791 ليس كسرًا عشريًا.'},
    ],
    'now': 'دوْرك الآن: من أجل كل كسر من الكسور الآتية 285/684 ، 250/1250 ، 9592/11336 ، 35922/5987 اختزل الكسر ثم أعط الكتابة العشرية للعدد أو قيمته المقربة إلى 0,01 بالنقصان.',
    'answer': {
        '52/65': {'reduced': frac(F(52, 65)), 'common': 52 // 4, 'decimal': to_decimal(F(52, 65))},
        '1921/791': {'reduced': frac(F(1921, 791)), 'common': 1921 // 17, 'mixed': '2 + 3/7', 'decimal': to_decimal(F(1921, 791))},
        'now': {f'{n}/{d}': {'reduced': frac(F(n, d)), 'gcd': gcd(n, d),
                             'decimal': to_decimal(F(n, d)) or fr((D(n) / D(d)).quantize(D('0.01'), rounding='ROUND_DOWN')),
                             'exact': to_decimal(F(n, d)) is not None} for n, d in ICT_NOW},
    },
    'answerSource': 'computed',
})
assert F(52, 65) == F(4, 5) and F(1921, 791) == F(17, 7) and 113 * 17 == 1921 and 113 * 7 == 791
assert F(35922, 5987) == 6 and F(285, 684) == F(5, 12)
E.append({'id': 'ict-opinion', 'kind': 'ict', 'page': 62, 'section': 'ما رأيك؟', 'verified': False,
          'text': 'إليك اللمسات المستعملة بالترتيب من قبل ثلاثة تلاميذ لأخذ خمسة أسداس 18 Kg من البرتقال: • التلميذ الأول 5 ÷ 6 × 18 = • التلميذ الثاني 5 × 18 ÷ 6 = • التلميذ الثالث 18 ÷ 6 × 5 =',
          'answer': {'value': frac(F(5, 6) * 18), 'note': 'Les trois suites donnent 15 ; la 1re passe par 0,8333… (arrondi de la machine).'}, 'answerSource': 'computed'})

# ── Destinations ────────────────────────────────────────────────────────────────────────────────────
L1, L2, L3, L4, SYN = 'hasil-qisma-kasr', 'hasil-qisma-mustaqim', 'akhdh-kasr-min-adad', 'ikhtizal-kitaba-kasriya', 'wadiya-idmajiya-kitabat-kasriya'
DEST = {
    '_comment': 'elementId → { lesson, module } ; `items` répartit un élément ; une leçon encore coming_soon est une destination EN ATTENTE (check-textbook-coverage.mjs). Première leçon générée de l’unité : ikhtizal-kitaba-kasriya (2026-10-14).',
    'objectives': {'lesson': 'unit', 'module': 'page'},
    'opener': {'lesson': L1, 'module': 2, 'note': 'تمهيد p. 51 (الكاشي والكسور العشرية) : une carte « من تاريخ الكسور » à la fin de معارف'},
    'challenge': {'lesson': 'unit', 'module': 'page', 'duplicatedIn': [{'lesson': L4, 'module': 5, 'note': '« أين أضع الفاصلة؟ » 235017/1000 = 235,017 : le passage كسر عشري → كتابة عشرية (P2) — module « تحدّ » de la leçon'}]},
    'prep': {'lesson': L4, 'module': 0, 'items': {
        '1-2-9': {'lesson': L4, 'module': 0},
        '5-6-7': {'lesson': L1, 'module': 0},
        '3-4': {'lesson': L2, 'module': 0},
        '8-10': {'lesson': L3, 'module': 0}}},
    'act-1': {'lesson': L1, 'module': 4, 'note': 'APPLICATION (guide §4ter) : le labo `fair-share` est l’entrée conçue par la plateforme ; نشاط 1 (5 ÷ 6 = 5/6) est posé dans أتمرّن'}, 'act-2': {'lesson': L2, 'module': 1}, 'act-3': {'lesson': L3, 'module': 1},
    'act-4': {'lesson': L4, 'module': 1},
    'know-1': {'lesson': L1, 'module': 2, 'items': {'definition-result-vocabulary-remarks-7/3': {'lesson': L1, 'module': 2},
                                                    '0,7=7/10': {'lesson': L4, 'module': 2, 'note': 'programme 1am.m5.x1 (عشري → كسري) : la leçon le cite dans son معارف'}}},
    'know-2': {'lesson': L2, 'module': 2},
    'know-3': {'lesson': L4, 'module': 2},
    'method-1': {'lesson': L3, 'module': 3},
    'method-2': {'lesson': L4, 'module': 3},
    'now-56': {'lesson': L4, 'module': 3, 'items': {'1': {'lesson': L3, 'module': 3}, '2-3': {'lesson': L4, 'module': 3}}},
    **{f'ex-{n}': {'lesson': L1, 'module': 4} for n in range(1, 6)},
    **{f'ex-{n}': {'lesson': L2, 'module': 4} for n in range(6, 10)},
    **{f'ex-{n}': {'lesson': L3, 'module': 4} for n in range(10, 15)},
    **{f'ex-{n}': {'lesson': L4, 'module': 4} for n in range(15, 28)},
    'aside-58': {'lesson': L3, 'module': None},
    'self-1': {'lesson': L1, 'module': 4, 'note': 'figure REDESSINÉE : tubes gradués en 4, 5, 6, 8 (3/4, 2/5, 6/6, 5/8)'},
    'self-2': {'lesson': L1, 'module': 8}, 'self-3': {'lesson': L1, 'module': 8},
    'self-9': {'lesson': L1, 'module': 4},
    'self-4': {'lesson': L4, 'module': 9}, 'self-5': {'lesson': L4, 'module': 9},
    'self-6': {'lesson': L2, 'module': None},
    'self-7': {'lesson': L3, 'module': None}, 'self-8': {'lesson': L3, 'module': None},
    'deep-1': {'lesson': L4, 'module': 6},
    'deep-2': {'lesson': L1, 'module': 6},
    **{f'deep-{n}': {'lesson': L3, 'module': None} for n in (3, 4, 5, 6, 7)},
    'deep-8': {'lesson': L4, 'module': 7},
    'integration': {'lesson': SYN, 'module': None},
    'evaluation': {'lesson': SYN, 'module': None},
    'ict': {'lesson': L4, 'module': 5},
    'ict-opinion': {'lesson': L3, 'module': None},
}

DISCREPANCIES = [
    {'elementId': 'act-3', 'kind': 'misprint', 'text': 'La 3e ligne du ③ imprime « 2/5 × 225 = (2…5)…255 » : lire 225 (chiffres permutés).'},
    {'elementId': 'opener', 'kind': 'misprint', 'text': 'π imprimé « 3,1415925358979325 » : π = 3,14159265358979… (le 6 après 3,141592 manque) — sans conséquence pour la leçon.'},
    {'elementId': 'ex-3', 'kind': 'bidi', 'text': '« الكسر الذي يساوي 11 ÷ 9 » s’affiche dans une ligne RTL ; lu 9 ÷ 11 = 9/11, la seule fraction de la liste qui convienne (11/9 n’y est pas).'},
    {'elementId': 'ex-24', 'kind': 'scope', 'text': 'La divisibilité par 10 (question 6) n’est pas une règle du معارف de l’unité 3 : 10 = 2 × 5, chiffre des unités 0 (déjà vu au primaire et dans ex-22 de l’unité 3).'},
    {'elementId': 'ex-25', 'kind': 'scope', 'text': 'Les critères (9, 5, 3) font le premier pas ; le dernier passe par les tables de multiplication : 198/495 → 22/55 (÷ 9) → 2/5 (÷ 11), 84/63 → 28/21 (÷ 3) → 4/3 (÷ 7) — c’est la consigne « استخدم جداول الضرب » de la طريقة p. 56.'},
    {'elementId': 'ex-26', 'kind': 'scope', 'text': '414/391 = 18/17 par le diviseur commun 23, qu’aucune règle de divisibilité ne donne : la vérification se fait par les produits (18 × 23, 17 × 23) ou en croix — ce n’est pas une réduction « par les critères ».'},
    {'elementId': 'ex-27', 'kind': 'intended', 'text': '91 = 7 × 13 : les règles (2, 3, 4, 5, 9) ne disent rien de 7 — « pas de diviseur selon les règles » ≠ « pas de diviseur ». C’est la question.'},
    {'elementId': 'now-56', 'kind': 'reading', 'text': 'Les trois jauges (item 1) sont lues 3/4, 5/6, 3/8 (4, 6, 8 graduations) ⇒ 37,5 L ; 50 L ; 26,25 L — à relire avec akhdh-kasr-min-adad.'},
    {'elementId': 'self-1', 'kind': 'reading', 'text': 'Les graduations des quatre tubes ne se lisent pas sûrement au scan, même à 400 dpi (A, B, D à demi pleins, C plein) : hasil-qisma-kasr REDESSINE la figure (tubes gradués en 4, 5, 6 et 8 parts égales, remplis de 3, 2, 6 et 5 parts : 3/4, 2/5, 6/6 = 1, 5/8) et dit en une ligne que la plateforme l’a redessinée.'},
    {'elementId': 'ex-2', 'kind': 'reading', 'text': '① Le ruban de la 1re figure compte SEPT cases (relu à 300 dpi), pas huit : 3 cases sur 7 ; la réponse (non) ne change pas.'},
    {'elementId': 'self-9', 'kind': 'scope', 'text': '« 7 × … = 0,7 → 0,1 » et « 27 × … = 0,27 → 0,01 » sont des nombres décimaux : le facteur manquant n’est pas toujours une fraction a/b. 5/12 × 3 = 5/4 et 7 × 2/21 = 2/3 se réduisent (réduction = ikhtizal-kitaba-kasriya) : la leçon accepte la fraction telle qu’elle vient, 15/12 ou 14/21.'},
    {'elementId': 'self-6', 'kind': 'scope', 'text': '55/33 = 5/3 = 2 − 1/3 : un même point ; la réduction (÷ 11) sert la graduation (lesson hasil-qisma-mustaqim).'},
    {'elementId': 'deep-1', 'kind': 'reading', 'text': 'Sommets lus sur la grille 4 × 4 : triangle 1 (1;4) (0;1) (3;0) ⇒ 5/16 ; triangle 2 (2;4) (0;0) (4;2) ⇒ 6/16 = 3/8.'},
    {'elementId': 'deep-2', 'kind': 'intended', 'text': 'Le reste écrit « 08 » est 0,08 (centièmes) : 27,28 × 14 + 0,08 = 382 ; Fatima a ajouté 8 au lieu de 0,08.'},
    {'elementId': 'integration', 'kind': 'reading', 'text': '15 360 ÷ 17 = 903,5… : le manuel prend 904 (« بالزيادة ») ; 7 500 000 ÷ 2 824 = 2 655,8… ≈ 2 656 DA.'},
    {'elementId': 'unit', 'kind': 'scope', 'text': 'Pages 51–62 complètes. Les éléments de hasil-qisma-kasr, hasil-qisma-mustaqim, akhdh-kasr-min-adad et de la synthèse sont transcrits plus brièvement (verified: false) : leur leçon les relira.'},
    {'elementId': 'unit', 'kind': 'order', 'text': 'La file du réseau génère ikhtizal-kitaba-kasriya (ordre 18) AVANT hasil-qisma-kasr (ordre 15) : la leçon ne reconstruit pas « الكسر حاصل قسمة » (un « تذكّر » d’une ligne, la fraction-partie-de-surface du primaire suffit à son lab) ; voir docs/sources/1am/unit4/brief-authors.md.'},
]

doc = {
    '_comment': [
        'EXTRACTION CANONIQUE du manuel scolaire officiel — 1AM, الجيل الثاني (موفم 2017), unité 4 « الكتابات الكسرية ».',
        'Source : docs/official-book-pdfs/كتاب الرياضيات للسنة الأولى متوسط الجيل الثاني.pdf, pages 51 à 62.',
        'Ce fichier est LA source de vérité pédagogique de l’unité ; tout contenu cite un `id` d’ici via `source.elementId`.',
        'Transcription VISUELLE ; réponses calculées (Fraction, Decimal) dans build-extraction.py, `answerSource: computed`.',
        'Généré par docs/sources/1am/unit4/build-extraction.py — ne pas éditer à la main.',
    ],
    'unitCode': 'kitabat-kasriya',
    'textbook': {'title': 'كتاب الرياضيات — السنة الأولى من التعليم المتوسط', 'generation': 'الجيل الثاني', 'unitNumber': 4,
                 'unitTitle': 'الكتابات الكسرية', 'pages': {'first': 51, 'last': 62}, 'pdfPageOffset': 0,
                 'sections': ['سأتعلّم في هذا الباب', 'استحضر مكتسباتي', 'اكتشف', 'أوظّف تعلّماتي', 'أكتسب طرائق', 'دوري الآن', 'أتمرّن', 'أقوّم تعلّماتي', 'أتعمّق', 'أتعلّم الإدماج', 'وضعية تقويم', 'استعمل تكنولوجيات الإعلام والاتصال']},
    'frozenAt': '2026-10-14',
    'terminology': {'note': 'Le manuel écrit « الكتابة الكسرية », « كسر », « البسط », « المقام », « حاصل القسمة », « كسر عشري », « الكتابة العشرية », « اختزال / اختزلنا الكسر », « قاسم مشترك للبسط والمقام », « أبسط شكل ممكن », « القيمة المضبوطة / المقربة ».',
                    'terms': ['الكتابة الكسرية', 'كسر', 'البسط', 'المقام', 'حاصل القسمة', 'كسر عشري', 'الكتابة العشرية', 'اختزال', 'قاسم مشترك', 'أبسط شكل ممكن', 'القيمة المضبوطة', 'القيمة المقربة']},
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
pending = sum(1 for k, v in DEST.items() if k != '_comment' and v['lesson'] not in ('unit', L4))
print(f'{out} — {len(E)} éléments ({pending} vers les autres leçons de l’unité)')
