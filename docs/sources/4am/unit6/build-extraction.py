#!/usr/bin/env python3
"""Génère docs/sources/4am/unit6/extraction.json — unité 6 « الدالة الخطية والتناسبية » (pp. 65–76).

Transcription VISUELLE du scan (« وحدة التناسبية و الدالة الخطية.pdf », 12 pages, sans couche texte),
pages rendues à 200 dpi, relues à 300 dpi sur les passages douteux (نشاط 1, نشاط 4, نشاط 6, التحدّي,
exercices 12, 14, 18, 28, 32, QCM 4, la note sur la puissance électrique).
Le texte arabe est celui du manuel, au mot près ; les réponses (`answer`) ne viennent PAS du manuel
(il n'a pas de corrigé) : elles sont CALCULÉES ici avec sympy (`answerSource: computed`), jamais
tapées à la main — une coquille de transcription fait échouer la génération.

Les lectures de graphiques (التحدّي, نشاط 4, تمارين 11, 12, 18, 28, QCM 4) sont des lectures de
quadrillage, notées `reading` et recoupées entre elles (alignement avec O, cohérence des pentes).

Usage : python3 docs/sources/4am/unit6/build-extraction.py
"""
import json
from pathlib import Path

import sympy as sp

x, t = sp.symbols('x t')


def S(e):
    """Les décimaux du manuel (0,98 ; 1,4…) sont lus EXACTS : 1,4 → 7/5, jamais un flottant."""
    return e if isinstance(e, sp.Basic) else sp.sympify(str(e).replace(',', '.'), rational=True)


def fmt(e):
    """LaTeX exact, virgule décimale du manuel pour un décimal fini."""
    e = sp.nsimplify(S(e))
    if e.is_Rational and not e.is_Integer:
        q = int(e.q)
        while q % 2 == 0:
            q //= 2
        while q % 5 == 0:
            q //= 5
        if q == 1:  # décimal fini → 1{,}75
            s = format(sp.Float(e, 30), 'f').rstrip('0').rstrip('.')
            return s.replace('.', '{,}')
    return sp.latex(e)


def coef(m, n):
    """Le coefficient a de la fonction linéaire telle que f(m) = n (m ≠ 0) : a·m = n."""
    m, n = S(m), S(n)
    assert m != 0
    a = sp.solve(sp.Eq(sp.Symbol('a') * m, n), sp.Symbol('a'))[0]
    assert sp.simplify(a * m - n) == 0
    return sp.nsimplify(a)


def proportional(row1, row2):
    """Un tableau est de proportionnalité ⇔ tous les quotients ligne2/ligne1 sont égaux."""
    q = {sp.nsimplify(S(b) / S(a)) for a, b in zip(row1, row2)}
    return (len(q) == 1, q.pop() if len(q) == 1 else None)


E = []

E.append({
    'id': 'objectives', 'kind': 'objectives', 'page': 65, 'section': 'سأتعلّم في هذا الباب', 'verified': True,
    'items': [
        'معرفة الترميز $x \\longmapsto ax$ وتعيين صورة عدد بدالة خطية.',
        'تعيين عدد عُلِمَت صورته بدالة خطية.',
        'تعيين دالة خطية انطلاقا من عدد غير معدوم وصورته.',
        'تمثيل دالة خطية بيانيا.',
        'قراءة التمثيل البياني لدالة خطية وحساب معامل الدالة الخطية انطلاقا من تمثيلها البياني.',
        'تمثيل وقراءة وترجمة وضعية يتدخل فيها مقدار معطى بدلالة مقدار آخر.',
        'حل مشكلات تتدخل فيها النسبة المئوية أو المقادير المركّبة.',
    ],
})

E.append({
    'id': 'intro-road', 'kind': 'aside', 'page': 65, 'section': 'مدخل الباب', 'verified': True,
    'text': '«عندما تسير سيارة بسرعة 100km/h بدلا من 80km/h فإنّ الرّبح في الوقت هو 15min فقط لكل 100km. فلا يُعقل أن يضحي أحد بنفسه أو بالآخرين وأن يتسبّب في حوادث مرور نتائجها مؤلمة من أجل أن يربح 15min في 100km!». تخلل الملتقى الدوليّ الأوّل حول «دراسات وممارسات في علم نفس المرور» الذي نُظّم يومي 27 و28 أفريل 2016 بجامعة باتنة 1، تقديم إحصائيات حول حوادث المرور بالجزائر وأسبابها. فحسب المتدخلين، ومنهم مصالح الدرك الوطنيّ، تبيّن أن 37,62% من إجمالي الحوادث المسجلة سببها السرعة المفرطة وعدم ترك مسافة الأمان بين المركبات وبالتالي فإنّ العنصر البشري هو المتسبب الرئيس في هذه الحوادث.',
    'caption': 'صورة حادث مرور (صورة فوتوغرافية في الكتاب — لا تُنسخ).',
    # 100 km à 80 km/h = 75 min ; à 100 km/h = 60 min → 15 min gagnées.
    'answer': {'minutesAt80': 75, 'minutesAt100': 60, 'gain': 15},
    'answerSource': 'computed',
})
assert sp.Rational(100, 80) * 60 - sp.Rational(100, 100) * 60 == 15

# ── التحدّي : lecture du quadrillage (pas 0,5 h ; 50 km par grand carreau) ─────────────────
CH_A = [(0, 0), ('0.5', 55), (1, 115), ('1.5', 115), (2, 180), ('2.5', 240), (3, 255), ('3.5', 270), (4, 285), ('4.5', 300)]
CH_B = [(0, 0), ('0.5', '37.5'), (1, 75), ('1.5', '112.5'), (2, 150), ('2.5', '187.5'), (3, 225), ('3.5', '262.5'), (4, 300)]
okB, vB = proportional([p[0] for p in CH_B[1:]], [p[1] for p in CH_B[1:]])
okA, _ = proportional([p[0] for p in CH_A[1:]], [p[1] for p in CH_A[1:]])
assert okB and vB == 75 and not okA
E.append({
    'id': 'challenge', 'kind': 'challenge', 'page': 65, 'section': 'تحدّ', 'verified': True,
    'text': 'سُجلت في التمثيل البياني المقابل المسافات التي قطعتها مركبتان A و B كل نصف ساعة من لحظة انطلاقهما. احسب السرعة المتوسطة لكل مركبة خلال السفر. ثم صف حركة كل منهما. اشرح.',
    'figure': 'تمثيل بياني: المحور الأفقي «المدة (h)» من 0 إلى 4,5 بخطوة 0,5 ؛ المحور العمودي «المسافة المقطوعة (km)» من 0 إلى 300. المركبة (A) خط منكسر، المركبة (B) خط مستقيم يشمل المبدأ.',
    'reading': {'A': [[str(a), str(b)] for a, b in CH_A], 'B': [[str(a), str(b)] for a, b in CH_B],
                'note': 'Lecture de quadrillage : B passe par (1 ; 75), (2 ; 150), (4 ; 300) — alignés avec O ; A est à l’arrêt entre 1 h et 1,5 h (115 km) et arrive à 300 km en 4,5 h.'},
    'answer': {
        'vA': fmt(sp.Rational(300) / S('4.5')), 'vAdecimal': '66{,}67', 'vB': '75',
        'describe': 'المركبة B تسير بسرعة ثابتة 75km/h (المسافة متناسبة مع المدة: تمثيلها مستقيم يشمل المبدأ) ؛ المركبة A تتغير سرعتها وتتوقف بين 1h و 1,5h ، سرعتها المتوسطة 300 ÷ 4,5 ≈ 66,67km/h.',
    },
    'answerSource': 'computed',
})

# ── أستعدّ ──────────────────────────────────────────────────────────────────
PREP = [
    ('إذا كان $x = 3$ فإنّ $-3x - 1 = 10$ .', False, '$-3 \\times 3 - 1 = -10 \\neq 10$'),
    ('إذا كان $x - 5 = -20$ فإنّ $x = -15$ .', True, '$x = -20 + 5 = -15$'),
    ('إذا كان $-5x = 20$ فإنّ $x = 25$ .', False, 'نقسم على $-5$ : $x = \\dfrac{20}{-5} = -4$'),
    ('العدد الناقص في جدول التناسبية المقابل هو $-9$ . (السطر الأول: $-2$ ، $3$ ؛ السطر الثاني: $6$ ، $\\ldots$)', True, 'معامل التناسبية $\\dfrac{6}{-2} = -3$ ، و $3 \\times (-3) = -9$'),
    ('في متوسطة 260 تلميذا نصف داخلي وهو مايمثّل 65%. إذن العدد الإجمالي لتلاميذ المتوسطة هو 400.', True, '$65\\%$ من 400 هو $400 \\times 0{,}65 = 260$'),
    ('أخذ 2% من 150DA معناه أخذ 3DA.', True, '$150 \\times \\dfrac{2}{100} = 3$'),
    ('سعر جهاز هو 12 850DA. بعد زيادة بنسبة 8%، أصبح سعره 13 800DA.', False, '$12850 \\times 1{,}08 = 13878$ ، وليس 13800'),
    ('سعر جهاز هو 6 900DA. تخفيض بـ 15% على سعر الجهاز يقدر بـ 1 380DA.', False, '$6900 \\times 0{,}15 = 1035$ ؛ المبلغ 1380 يوافق 20%'),
    ('قطع درّاج مسافة 30km في مدة زمنية قدرها 1h30min. إذن السرعة المتوسطة للدرّاج تساوي 20km/h.', True, '$1h30min = 1{,}5h$ و $\\dfrac{30}{1{,}5} = 20$'),
]
_prep_truth = [
    -3 * 3 - 1 == 10,
    sp.solve(S('x-5+20'), x) == [-15],
    sp.solve(S('-5*x-20'), x) == [25],
    proportional([-2], [6])[1] * 3 == -9,
    S('0.65') * 400 == 260,
    150 * S('0.02') == 3,
    12850 * S('1.08') == 13800,
    6900 * S('0.15') == 1380,
    sp.Rational(30) / S('1.5') == 20,
]
assert [p[1] for p in PREP] == _prep_truth, ('prep: une réponse ne correspond pas au calcul', _prep_truth)
E.append({
    'id': 'prep', 'kind': 'prerequisites', 'page': 65, 'section': 'أستعدّ',
    'instruction': 'أصحيح أم خاطئ؟ برّر إجابتك.', 'verified': True,
    'items': [{'n': i + 1, 'text': tx, 'answer': a, 'why': w} for i, (tx, a, w) in enumerate(PREP)],
    'answerSource': 'computed',
})

# ── أنشطة ──────────────────────────────────────────────────────────────────
# نشاط 1 : le manuel imprime « 2% ». Avec 2 %, f(x) = 6 donne x = 300/49 et f(x) = 1,4 donne 10/7 —
# des antécédents qu'aucun manuel ne demande. Avec 20 % (lecture retenue, comme dans les éditions
# courantes) : 40, 80, 120, 160 ; f(120) = 96 ; x = 7,5 et x = 1,75.
_a = 1 - sp.Rational(20, 100)
_printed = 1 - sp.Rational(2, 100)
assert sp.solve(sp.Eq(_printed * x, 6), x) == [sp.Rational(300, 49)]
_tab1 = [50, 100, 150, 200]
assert proportional(_tab1, [_a * p for p in _tab1]) == (True, sp.Rational(4, 5))
E.append({
    'id': 'act-1', 'kind': 'activity', 'number': 1, 'page': 66, 'section': 'أنشطة', 'title': 'تعيين دالة خطية', 'verified': True,
    'text': 'قرر تاجر تخفيض ثمن سلعه بـ 2% بمناسبة عيد الفطر.',
    'table': {'rows': ['السعر قبل التخفيض (DA)', 'السعر بعد التخفيض (DA)'], 'values': [_tab1, ['…'] * 4]},
    'questions': [
        '1) انقل الجدول المقابل وأتممه: بيّن أنّ هذا الجدول هو جدول تناسبية، وعيّن معامل التناسبية.',
        '2) نسمي $x$ السعر قبل التخفيض ونرمز بـ $f(x)$ للسعر بعد التخفيض. لاحظ أنه من أجل أي قيمة نعطيها لـ $x$ يمكن حساب قيمة $f(x)$ . احسب $f(120)$ . لاحظ كذلك أنه يمكن حساب $x$ إذا عُلم $f(x)$ . احسب العدد $x$ في كل من الحالتين $f(x) = 6$ ثم $f(x) = 1{,}4$ . نقول أنّنا عرّفنا دالة ترفق بكل عدد $x$ العدد $f(x)$ . نرمز لهذه الدالة بـ $f : x \\longmapsto f(x)$',
        '3) تحقّق من أنّ عبارة $f(x)$ بدلالة $x$ هي من الشكل: $f(x) = ax$ حيث $a$ عدد ثابت يطلب تعيينه. نسمي دالة $f$ من الشكل $f(x) = ax$ حيث $a$ عدد معلوم، دالة خطية معاملها $a$ .',
    ],
    'correction': {
        'decidedBy': 'owner', 'decidedOn': '2026-10-02',
        'text': 'قرر تاجر تخفيض ثمن سلعه بـ 20% بمناسبة عيد الفطر.',
        'note': 'Le scan imprime « 2% » ; les questions f(x) = 6 et f(x) = 1,4 ne donnent alors que 300/49 et 10/7. Avec 20 % (40, 80, 120, 160 ; a = 0,8) elles donnent 7,5 et 1,75 : coquille corrigée en 20 % dans les leçons, une ligne discrète (politique du propriétaire : corriger les erreurs du manuel).',
    },
    'answer': {
        'table': [fmt(_a * p) for p in _tab1], 'coefficient': fmt(_a),
        'f120': fmt(_a * 120),
        'x6': fmt(sp.solve(sp.Eq(_a * x, 6), x)[0]), 'x14': fmt(sp.solve(sp.Eq(_a * x, S('1.4')), x)[0]),
        'formula': 'f(x) = 0{,}8x',
        'printed2pct': {'a': fmt(_printed), 'x6': '\\frac{300}{49}', 'x14': '\\frac{10}{7}'},
    },
    'answerSource': 'computed',
})
assert fmt(_a * 120) == '96' and fmt(sp.solve(sp.Eq(_a * x, 6), x)[0]) == '7{,}5' and fmt(sp.solve(sp.Eq(_a * x, S('1.4')), x)[0]) == '1{,}75'

T1 = (['-2', '1.5', 3, '4.5'], [-5, 2, 5, 8])
T2 = (['-2', '0.5', '2.5', 3], [-4, 1, 5, 6])
T3 = ([-3, 0, 1, 3], [9, 0, 1, 9])
_exprs = {'أ': x ** 2, 'ب': 2 * x, 'جـ': 2 * x - 1}
_match = {}
for name, (xs, ys) in {'1': T1, '2': T2, '3': T3}.items():
    hits = [k for k, ex in _exprs.items() if all(ex.subs(x, S(a)) == S(b) for a, b in zip(xs, ys))]
    assert len(hits) == 1, (name, hits)
    _match[name] = hits[0]
assert _match == {'1': 'جـ', '2': 'ب', '3': 'أ'}
assert proportional(*T2)[0] and not proportional(T1[0], T1[1])[0]
E.append({
    'id': 'act-2', 'kind': 'activity', 'number': 2, 'page': 66, 'section': 'أنشطة', 'title': 'تمييز دوال خطية', 'verified': True,
    'questions': [
        '1) أرفق بكلّ جدول العبارة الموافقة من بين: أ) $x \\longmapsto x^2$ ؛ ب) $x \\longmapsto 2x$ ؛ جـ) $x \\longmapsto 2x - 1$ .',
        '2) تحقّق من أنّ الجداول التي تمثّل وضعيات تناسبية فقط تكون مرتبطة بدوال خطية.',
        '3) عيّن الدوال الخطية من بين الدوال: أ) $x \\longmapsto x^2$ ؛ ب) $x \\longmapsto 2x$ ؛ جـ) $x \\longmapsto 2x - 1$ .',
    ],
    'tables': {
        '1': {'x': ['-2', '1{,}5', '3', '4{,}5'], 'y': ['-5', '2', '5', '8']},
        '2': {'x': ['-2', '0{,}5', '2{,}5', '3'], 'y': ['-4', '1', '5', '6']},
        '3': {'x': ['-3', '0', '1', '3'], 'y': ['9', '0', '1', '9']},
    },
    'answer': {'matching': _match, 'proportional': ['2'], 'linear': ['ب']},
    'answerSource': 'computed',
})

_f3 = lambda v: S('0.5') * S(v)
E.append({
    'id': 'act-3', 'kind': 'activity', 'number': 3, 'page': 66, 'section': 'أنشطة', 'title': 'تمثيل دالة خطية بيانيا', 'verified': True,
    'text': 'نعتبر الدالة الخطيّة $f : x \\longmapsto 0{,}5x$ . المستوي مزوّد بمعلم متعامد و متجانس مبدؤه O.',
    'table': {'x': ['0', '1', '4'], 'f(x)': ['', '', '']},
    'questions': [
        '1) أ) انقل ثمّ أكمل الجدول.',
        'ب) علّم النّقطتين $A(1 ; f(1))$ ، $B(4 ; f(4))$ ، وماذا تقول حول استقامة النقط O ، A ، B؟ برّر جوابك.',
        '2) أ) عيّن على المستقيم (OA) النقطة C ذات الفاصلة $-2$ ، ثم إقرأ بيانيا ترتيبها، وقارن بين $f(-2)$ وترتيب C.',
        'ب) لتكن $M(x ; y)$ نقطة من المستقيم (OA)، عبّر عن $y$ بدلالة $x$ .',
        'نقول أنّ التمثيل البياني للدالة الخطية $f : x \\longmapsto 0{,}5x$ هو المستقيم (OA).',
    ],
    'answer': {'table': [fmt(_f3(0)), fmt(_f3(1)), fmt(_f3(4))], 'A': '(1 ; 0{,}5)', 'B': '(4 ; 2)',
               'aligned': True, 'why': 'B ترتيبها 2 = 4 × 0,5 : النقط O و A و B على مستقيم واحد يشمل المبدأ (y = 0,5x)',
               'C': '(-2 ; -1)', 'fm2': fmt(_f3(-2)), 'equation': 'y = 0{,}5x'},
    'answerSource': 'computed',
})
assert fmt(_f3(-2)) == '-1' and _f3(4) / 4 == _f3(1) / 1

# نشاط 4 : lecture du quadrillage. Pommes de terre : (0,5 ; 25), (1,5 ; 75), (2,5 ; 125), (3 ; 150), (3,5 ; 175)
POT = [('0.5', 25), ('1.5', 75), ('2.5', 125), (3, 150), ('3.5', 175)]
assert proportional([p[0] for p in POT], [p[1] for p in POT]) == (True, 50)
E.append({
    'id': 'act-4', 'kind': 'activity', 'number': 4, 'page': 67, 'section': 'أنشطة', 'title': 'تمثيل وضعيات يعطى فيها مقدار بدلالة مقدار آخر وقراءتها وترجمتها', 'verified': True,
    'text': 'من بين التمثيلات البيانية التالية، ما هو التمثيل الذي يعبّر عن وضعية تناسبية؟ عيّن عندئذ معامل التناسبية $a$ . أعط تفسيرا هندسيا للعدد $a$ .',
    'figure': 'ثلاثة تمثيلات: (1) «السعر (DA)» بدلالة «كتلة البطاطا (kg)» — نقط على استقامة مع المبدأ ؛ (2) «محيط المستطيل EFGH (m)» بدلالة «عرض مستطيل EFGH طوله ثابت (m)» — نقط على مستقيم لا يشمل المبدأ ؛ (3) «مساحة المربع ABCD (m²)» بدلالة «طول ضلع المربع ABCD (m)» — نقط على منحنى.',
    'reading': {'potatoes': [[a, str(b)] for a, b in POT], 'note': 'Quadrillage : 0,5 kg et 25 DA par carreau ; les points (0,5 ; 25), (1,5 ; 75), (2,5 ; 125), (3 ; 150), (3,5 ; 175).'},
    'answer': {'proportional': 1, 'a': '50', 'meaning': 'a = 50 هو سعر 1kg من البطاطا (DA/kg) ؛ هندسيا: معامل توجيه المستقيم الذي يشمل المبدأ والنقط',
               'others': {'2': 'المحيط $2L + 2\\ell$ : مستقيم لا يشمل المبدأ — ليست وضعية تناسبية', '3': 'المساحة $c^2$ : النقط ليست على مستقيم — ليست وضعية تناسبية'}},
    'answerSource': 'computed',
})

_girls = sp.Rational(100 * 50 + 95 * 40 + 90 * 60 + 90 * 70, 100)
_tot = 100 + 95 + 90 + 90
_pct = _girls / _tot * 100
assert _girls == 205 and _tot == 375
_fuel = (S('6.7') - S('6.1')) / S('6.7') * 100
E.append({
    'id': 'act-5', 'kind': 'activity', 'number': 5, 'page': 67, 'section': 'أنشطة', 'title': 'استعمال النسبة المئوية', 'verified': True,
    'items': [
        {'n': 1, 'text': 'إليك توزيع تلاميذ متوسطة حسب المستوى و الجنس. احسب النسبة المئوية للبنات في هذه المتوسطة.',
         'table': {'المستوى': ['السنة الأولى', 'السنة الثانية', 'السنة الثالثة', 'السنة الرابعة'], 'عدد التلاميذ': [100, 95, 90, 90], 'النسبة المئوية للبنات': ['50%', '40%', '60%', '70%']}},
        {'n': 2, 'text': 'تستهلك سيارة 6,7L من البنزين لكل 100km. بعد ضبط المحرك، انخفض استهلاك البنزين إلى 6,1L لكل 100km. عبّر عن هذا الانخفاض بواسطة نسبة مئوية.'},
        {'n': 3, 'text': 'أقدم تاجر على رفع سعر منتوج بـ 5%. أ) إذا علمت أن سعر المنتوج قبل الزيادة هو 1200DA ، فما هو سعره بعد هذه الزيادة؟ ب) عبّر عن السعر $y$ للمنتوج بعد الزيادة بدلالة السعر $x$ قبل الزيادة.'},
    ],
    'answer': {'1': {'girls': 205, 'total': _tot, 'percent': fmt(_pct), 'percentDecimal': '54{,}67'},
               '2': {'percent': fmt(_fuel), 'percentDecimal': '8{,}96'},
               '3': {'a': fmt(1200 * S('1.05')), 'b': 'y = 1{,}05x'}},
    'answerSource': 'computed',
})
assert 1200 * S('1.05') == 1260

# نشاط 6 : le cuivre — le scan imprime « 6cm³ … 71,2g » (11,9 g/cm³, plus dense que l'argent, impossible) ;
# 71,2 g de cuivre (8,9 g/cm³) occupent 8 cm³. La question (le plus lourd = l'or) ne change pas.
_gold = S('57.9') / 3          # kg/dm³ = g/cm³
_silver = sp.Rational(63, 6)
_copper_printed = S('71.2') / 6
_copper = S('71.2') / 8
assert _gold == S('19.3') and _silver == S('10.5') and _copper == S('8.9') and _copper_printed > _silver
E.append({
    'id': 'act-6', 'kind': 'activity', 'number': 6, 'page': 67, 'section': 'أنشطة', 'title': 'المقادير المركّبة', 'verified': True,
    'items': [
        {'n': 1, 'text': 'تسير سيّارة بسرعة متوسطة قدرها 25m/s على طريق حُدّدت السرعة القصوى فيه بـ 80km/h. هل ارتكب سائق هذه السيّارة مخالفة ؟'},
        {'n': 2, 'text': 'تُوَفِّر محطة توزيع المياه الصالحة للشرب 7 200 000L في الساعة. عبّر عن تدفق المياه من هذه المحطة بالوحدة متر مكعب في الثانية الواحدة $(m^3/s)$ .'},
        {'n': 3, 'text': 'يزن 3dm³ من الذهب 57,9kg ويزن 6cm³ من الفضة 63g، أما 6cm³ من النحاس فيَزن 71,2g. ماهو المعدن الأثقل؟'},
    ],
    'figure': 'صورتان فوتوغرافيتان في الكتاب: لافتة تحديد السرعة 80 وعلم جزائري (لا تُنسخان).',
    'correction': {
        'decidedBy': 'owner', 'decidedOn': '2026-10-02', 'item': 3,
        'text': 'يزن 3dm³ من الذهب 57,9kg ويزن 6cm³ من الفضة 63g، أما 8cm³ من النحاس فيَزن 71,2g. ماهو المعدن الأثقل؟',
        'note': '« 6cm³ » de cuivre pour 71,2 g donnerait 11,9 g/cm³, plus que l’argent (10,5) : impossible. 71,2 g de cuivre (8,9 g/cm³) occupent 8 cm³ — corrigé, une ligne discrète. La réponse (l’or, 19,3 g/cm³) ne change pas.',
    },
    'answer': {'1': {'kmh': fmt(25 * S('3.6')), 'infraction': True},
               '2': {'m3s': fmt(sp.Rational(7200000, 1000) / 3600)},
               '3': {'gold': fmt(_gold), 'silver': fmt(_silver), 'copper': fmt(_copper), 'unit': 'g/cm^3', 'heaviest': 'الذهب'}},
    'answerSource': 'computed',
})
assert 25 * S('3.6') == 90 and sp.Rational(7200000, 1000) / 3600 == 2

# ── معارف ──────────────────────────────────────────────────────────────────
E.append({
    'id': 'know-1', 'kind': 'knowledge', 'page': 68, 'section': 'معارف', 'title': 'الدّالة الخطية', 'verified': True,
    'definition': '$a$ عدد معطى. عندما نرفق كل عدد $x$ بالجداء $a \\times x$ نقول أننا عرّفنا دالة خطية $f$ معاملها $a$ . • العدد $a \\times x$ يسمى صورة $x$ بالدّالة $f$ ونرمز لهذه الصورة بالرمز $f(x)$ ونكتب $f(x) = ax$ . • نرمز لهذه الدّالة بـ $f : x \\longmapsto ax$',
    'examples': ['$f : x \\longmapsto 80x$ هي دالة خطية معاملها $a = 80$ .',
                 'كلّ من $g : x \\longmapsto 4x - 3$ ، $h : x \\longmapsto x^2$ ليست دالة خطية.'],
})
_k2x = ['-3', '-2', '-1.5', '-1', '0', '0.5']
_k2y = [fmt(-3 * S(v)) for v in _k2x]
assert _k2y == ['9', '6', '4{,}5', '3', '0', '-1{,}5']
E.append({
    'id': 'know-2', 'kind': 'knowledge', 'page': 68, 'section': 'معارف', 'title': 'الدّالة الخطية و التناسبية', 'verified': True,
    'definition': 'جدول قيم دالة خطية هو جدول فيه أعداد السّطر الثاني هي صور أعداد السّطر الأول بالدالة الخطيّة. جدول قيم دالة خطية هو جدول تناسبية. معامل الدالة الخطية هو معامل تناسبية لهذا الجدول.',
    'example': '$f$ هي الدّالة الخطية المعرّفة بالشّكل : $f(x) = -3x$ . جدول القيم للدالة $f$ الآتي هو جدول تناسبية. $(-3)$ هو معامل تناسبية لهذا الجدول و هو أيضا معامل الدالة الخطية.',
    'table': {'x': ['-3', '-2', '-1{,}5', '-1', '0', '0{,}5'], 'f(x)': _k2y, 'arrow': '\\times(-3)'},
})
E.append({
    'id': 'know-3', 'kind': 'knowledge', 'page': 68, 'section': 'معارف', 'title': 'التمثيل البياني لدالة خطية', 'verified': True,
    'property': 'في مَعلم، التمثيل البياني لدالة خطية معاملها $a$ هو مستقيم يشمل المبدأ O. نقول إنّ $y = ax$ هي معادلة لهذا المستقيم و $a$ هو معامل توجيه له.',
    'example': 'التمثيل البياني للدّالة الخطية $f : x \\longmapsto -2x$ هو مستقيم يشمل المبدأ O. لإنشائه يكفي تعيين نقطة ثانية من (D)، مثلا النقطة $A(1 ; -2)$ . (D′) هو التمثيل البياني للدالة $g : x \\longmapsto 2x$ .',
    'note': 'ملاحظة : يعيّن المعامل $a$ للدالة الخطية منحى المستقيم (D). • إذا كان $a > 0$ فإن (D) «يصعد» من اليسار إلى اليمين. • إذا كان $a < 0$ فإنّ (D) «ينزل» من اليسار إلى اليمين.',
    'figure': 'معلم: (D) يشمل O و $A(1 ; -2)$ (ينزل) ؛ (D′) يشمل O و $(1 ; 2)$ (يصعد).',
})
E.append({
    'id': 'know-4', 'kind': 'knowledge', 'page': 70, 'section': 'معارف', 'title': 'تطبيقات التناسبية', 'verified': True,
    'percentTable': [
        {'case': 'أخذ $t\\%$ من $x$', 'means': 'يعني ضرب $x$ في $\\dfrac{t}{100}$', 'function': 'x \\longmapsto \\dfrac{t}{100}x'},
        {'case': 'زيادة $x$ بـ $t\\%$', 'means': 'يعني ضرب $x$ في $1 + \\dfrac{t}{100}$', 'function': 'x \\longmapsto \\left(1 + \\dfrac{t}{100}\\right)x'},
        {'case': 'تخفيض $x$ بـ $t\\%$', 'means': 'يعني ضرب $x$ في $1 - \\dfrac{t}{100}$', 'function': 'x \\longmapsto \\left(1 - \\dfrac{t}{100}\\right)x'},
    ],
    'percentExamples': [
        'أخذ 5% من $x$ يعني ضرب $x$ في 0,05 والدالة الخطية المرفقة هي $x \\longmapsto 0{,}05x$ .',
        'زيادة $x$ بـ 5% يعني ضرب $x$ في 1,05 والدالة الخطية المرفقة هي $x \\longmapsto 1{,}05x$ .',
        'تخفيض $x$ بـ 5% يعني ضرب $x$ في 0,95 والدالة الخطية المرفقة هي $x \\longmapsto 0{,}95x$ .',
    ],
    'productQuantity': 'المقادير المركبة: عندما نحسب جداء مقدارين نتحصل على مقدار جداء.',
    'productExamples': [
        'مساحة مستطيل: طول مستطيل هو 8cm وعرضه هو 3cm. مساحته هي $(8 \\times 3)cm^2$ أي $24cm^2$ . $\\mathcal{A}$ هي مساحة مستطيل، L طوله و $\\ell$ عرضه. نكتب $\\mathcal{A} = L \\times \\ell$ . $\\mathcal{A}$ هو مقدار جداء.',
        'الطاقة الكهربائية: يستهلك جهاز كهربائي 1,2kw في 1h في 5h، يستهلك هذا الجهاز 1,2kw x 5h أي 6kw/h. إذن الطاقة الكهربائية E التي يستهلكها جهاز إستطاعته P في مدة زمنية t هي $E = P \\times t$ .',
    ],
    'quotientQuantity': 'مقدار حاصل القسمة: عندما نحسب حاصل قسمة مقدارين، نتحصل على مقدار حاصل القسمة.',
    'quotientExamples': [
        'السرعة المتوسطة لمتحرك هي حاصل قسمة المسافة المقطوعة على مدة قطع هذه المسافة. نكتب $v(km/h) = \\dfrac{d(km)}{t(h)}$ أو $v(m/s) = \\dfrac{d(m)}{t(s)}$ .',
        'الكتلة الحجمية لجسم هي حاصل قسمة كتلة هذا الجسم على حجمه. نكتب $m_v = \\dfrac{m}{V}(kg/m^3)$ .',
        'السرعة المتوسطة لدراجة عندما تقطع مسافة 42km في 1,5h هي $\\left(\\dfrac{42}{1{,}5}\\right)km/h$ أي $28km/h$ .',
        'الكتلة الحجمية لجسم كتلته 2,4kg وحجمه $0{,}01m^3$ هي $\\left(\\dfrac{2{,}4}{0{,}01}\\right)kg/m^3$ أي $240kg/m^3$ .',
    ],
    'correction': {
        'decidedBy': 'owner', 'decidedOn': '2026-10-02',
        'text': 'يستهلك جهاز كهربائي استطاعته 1,2kW لمدة 5h طاقة قدرها $1{,}2kW \\times 5h$ أي $6kWh$ .',
        'note': 'Le manuel écrit « 1,2kw … 6kw/h » : la puissance s’écrit kW et l’énergie kWh (kilowatt-heure), pas « kw/h ». Corrigé dans la leçon, une ligne discrète.',
    },
    'answer': {'energy': fmt(S('1.2') * 5), 'speed': fmt(42 / S('1.5')), 'density': fmt(S('2.4') / S('0.01'))},
    'answerSource': 'computed',
})
assert S('1.2') * 5 == 6 and 42 / S('1.5') == 28 and S('2.4') / S('0.01') == 240

# ── طرائق ──────────────────────────────────────────────────────────────────
assert coef(-2, 6) == -3
E.append({
    'id': 'method-determine', 'kind': 'method', 'page': 69, 'section': 'طرائق', 'title': 'تعيين دالة خطية انطلاقا من عدد وصورته', 'verified': True,
    'exercise': 'عيّن الدّالة الخطيّة $g$ إذا علمت أن $g(-2) = 6$ .',
    'solution': ['الدّالة $g$ من الشكل $g(x) = ax$ . إذن $g(-2) = 6$ معناه $-2a = 6$ أي $a = -3$ بالتالي $g(x) = -3x$ .'],
    'method': 'لتعيين دالة خطية $g$ علما أن $g(m) = n$ ، نحل المعادلة $am = n$ ذات المجهول $a$ .',
    'answer': {'a': fmt(coef(-2, 6))},
    'answerSource': 'computed',
})
_aread = coef(4, S('1.6'))
assert _aread == sp.Rational(2, 5) and S('3.5') / _aread == S('8.75')
E.append({
    'id': 'method-read', 'kind': 'method', 'page': 69, 'section': 'طرائق', 'title': 'قراءة تمثيل بياني لدالة خطية', 'verified': True,
    'exercise': 'المستقيم (D) يمثل بيان دالة خطية $f$ . بقراءة بيانية عيّن: أ) صورة 4 ب) عيّن العدد الذي صورته 3,5.',
    'figure': 'معلم من 0 إلى 7 أفقيا ومن 0 إلى 5 عموديا ؛ (D) يشمل O ؛ خط متقطع من $(4 ; 0)$ إلى (D) ثم إلى محور التراتيب عند $1{,}6$ .',
    'solution': ['أ) صورة 4 هي 1,6. إذن $f(4) = 1{,}6$ .', 'ب) 8,75 هو العدد الذي صورته 3,5. إذن $f(8{,}75) = 3{,}5$ .'],
    'method': '• لتعيين صورة عدد بدالة، نقرأ ترتيب النقطة من التمثيل البياني التي فاصلتها هذا العدد. • لتعيين عدد صورته معلومة $b$ بدالة، نقرأ فاصلة النقطة من التمثيل البياني التي ترتيبها $b$ .',
    'answer': {'a': fmt(_aread), 'f4': '1{,}6', 'x': '8{,}75'},
    'answerSource': 'computed',
})
E.append({
    'id': 'method-draw', 'kind': 'method', 'page': 69, 'section': 'طرائق', 'title': 'تمثيل دالة خطية بيانيا', 'verified': True,
    'exercise': 'في معلم مبدؤه O (الوحدة : 1cm) ارسم المستقيم $(d)$ الذي يمثّل الدالة الخطية المعرّفة بـ: $f(x) = 1{,}5x$ .',
    'solution': ['$(d)$ يشمل مبدأ الـمَعلم.', '$f(1) = 1{,}5$ ، إذن $(d)$ يشمل أيضا النقطة $A(1 ; 1{,}5)$ .', 'نرسم المستقيم الذي يشمل المبدأ والنقطة $A(1 ; 1{,}5)$ .'],
    'method': 'باعتبار أنّ التمثيل البياني لدالة خطية مستقيم يشمل مبدأ المعلم، فلإنشائه يكفي تعيين إحداثيي نقطة أخرى منه.',
    'answer': {'A': '(1 ; 1{,}5)'},
    'answerSource': 'computed',
})
_a69 = coef(sp.Rational(-2, 3), sp.Rational(-3, 2))
assert _a69 == sp.Rational(9, 4) and sp.simplify(_a69 * sp.sqrt(32) - sp.sqrt(162)) == 0
E.append({
    'id': 'now-69', 'kind': 'exercise', 'page': 69, 'section': 'دوري الآن', 'verified': True,
    'text': 'جد العبارة الجبرية للدّالة الخطية التي تمثيلها البياني (D) يشمل النقطة $A\\left(-\\dfrac{2}{3} ; -\\dfrac{3}{2}\\right)$ . ومثّلها بيانيا. هل النقطة $B(\\sqrt{32} ; \\sqrt{162})$ تنتمي إلى (D)؟ لماذا؟',
    'answer': {'a': fmt(_a69), 'formula': 'f(x) = \\frac{9}{4}x', 'B': True,
               'why': '$\\dfrac{9}{4} \\times \\sqrt{32} = \\dfrac{9}{4} \\times 4\\sqrt{2} = 9\\sqrt{2} = \\sqrt{162}$'},
    'answerSource': 'computed',
})
SPRING_X = [2, 3, 4, 5]
SPRING_Y = ['0.6', '0.9', '1.2', '1.5']
assert proportional(SPRING_X, SPRING_Y) == (True, sp.Rational(3, 10))
assert S('0.3') * 10 == 3 and S('2.1') / S('0.3') == 7
E.append({
    'id': 'method-spring', 'kind': 'method', 'page': 71, 'section': 'طرائق', 'title': 'تمثيل وقراءة وترجمة وضعية يتدخل فيها مقدار يعطى بدلالة مقدار آخر', 'verified': True,
    'exercise': 'يستطيل نابض بشكل متناسب مع الكتلة المعلّقة به. نعلق جسما كتلته $x$ (بالغرام) ونسجّل في كل مرة الاستطالة $y$ (بالسنتيمتر). 1) انقل وأتمم الجدول المقابل ومثّله بيانيا ثم عبّر عن $y$ بدلالة $x$ . 2) أ) عيّن استطالة النابض من أجل كتلة قدرها 10g. ب) ما هي الكتلة التي يمكن تعليقها للحصول على استطالة قدرها 2,1cm ؟',
    'table': {'x (غرام)': ['2', '…', '4', '…'], 'y (سنتيمتر)': ['0{,}6', '0{,}9', '…', '1{,}5']},
    'figure': 'نابضان معلقان، الثاني يحمل جسما كتلته $x$ واستطالته $y$ .',
    'solution': [
        '1) الجدول المعطى جدول تناسبية نعيّن قيم السطر الثاني من جدول التناسبية بضرب قيم السطر الأول في معامل التناسبية 0,3.',
        'نمثل بيانيا هذا الجدول في معلم بالنقط الآتية: $A(2 ; 0{,}6)$ ، $B(3 ; 0{,}9)$ ، $C(4 ; 1{,}2)$ ، $D(5 ; 1{,}5)$ . نستنتج أن $y = 0{,}3x$ .',
        '2) أ) من أجل $x = 10$ نجد $y = 0{,}3 \\times 10$ أي عندما نعلق جسما كتلته 10g نتحصل على استطالة النابض قدرها 3cm.',
        'ب) لدينا $2{,}1 = 0{,}3 \\times 7$ . إذن نتحصل على استطالة قدرها 2,1cm عندما نعلق كتلة قدرها 7g.',
    ],
    'method': 'لحساب مقدار بدلالة مقدار آخر يمكن الاستعانة بجدول تناسبية.',
    'answer': {'table': {'x': ['2', '3', '4', '5'], 'y': ['0{,}6', '0{,}9', '1{,}2', '1{,}5']}, 'a': '0{,}3', 'y10': '3', 'x21': '7'},
    'answerSource': 'computed',
})
_tank = 30 * (1 - sp.Rational(30, 100)) * (1 + sp.Rational(15, 100))
assert _tank == S('24.15')
E.append({
    'id': 'method-percent', 'kind': 'method', 'page': 71, 'section': 'طرائق', 'title': 'استعمال النسب المئوية', 'verified': True,
    'exercise': 'خزان ماء مملوء تبلغ سعته $30m^3$ . أفرغنا 30% منه ثم أضفنا 15% مما فيه. كم أصبح حجم محتواه؟',
    'solution': ['يصبح حجم الماء في الخزان $24{,}15m^3$ لأن $30 \\times \\left(1 - \\dfrac{30}{100}\\right) \\times \\left(1 + \\dfrac{15}{100}\\right) = 24{,}15$ .'],
    'method': "تخفيض $x$ بـ $t\\%$ ثم زيادة الناتج بـ $t'\\%$ ، يعني ضرب $x$ في الجداء $\\left(1 - \\dfrac{t}{100}\\right) \\times \\left(1 + \\dfrac{t'}{100}\\right)$ .",
    'answer': {'volume': fmt(_tank)},
    'answerSource': 'computed',
})
_dens = S('41.2') * 10 ** 6 / 2381740
assert abs(float(_dens) - 17.298) < 0.001
E.append({
    'id': 'method-compound', 'kind': 'method', 'page': 71, 'section': 'طرائق', 'title': 'استعمال المقادير المركّبة', 'verified': True,
    'exercise': 'تبلغ مساحة الجزائر $2\\,381\\,740km^2$ وعدد سكانها 41,2 مليون في سنة 2017. ما هي الكثافة السكانية؟',
    'solution': ['كثافة السكان في الجزائر هي حوالي 17 نسمة في الكيلومتر المربع لأن $\\dfrac{41{,}2}{2{,}381740} \\simeq 17{,}298$ .'],
    'method': 'نحسب الكثافة السكانية في منطقة بقسمة عدد سكانها على مساحتها بالكيلومتر المربع.',
    'answer': {'density': '17{,}298', 'rounded': '17'},
    'answerSource': 'computed',
})
_car = S('1.03') * S('0.98') * S('0.99')
assert _car == S('0.999306')
E.append({
    'id': 'now-71', 'kind': 'exercise', 'page': 71, 'section': 'دوري الآن', 'verified': True,
    'text': 'كان سعر سيارة 1 800 000DA. ارتفع سعرها بـ 3% ثم انخفض بـ 2% ثم انخفض مرة أخرى بـ 1%. في أي عدد يجب ضرب 1 800 000 لإيجاد السعر الجديد؟',
    'answer': {'multiplier': fmt(_car), 'product': '1{,}03 \\times 0{,}98 \\times 0{,}99', 'newPrice': fmt(1800000 * _car)},
    'answerSource': 'computed',
})
assert 1800000 * _car == S('1798750.8')

E.append({
    'id': 'tech-76', 'kind': 'ict', 'page': 76, 'section': 'أوظف تكنولوجيات الإعلام و الاتصال', 'verified': True,
    'items': [
        '1) تمثيل جدول قيم بمساعدة باستعمال البرمجية جيوجيبرا: استعمل البرمجية جيوجيبرا لتمثيل الجدول التالي بيانيا: t: 1 ، 2 ، 3 ؛ f(t): 2 ، 4 ، 6. أ) فتح المجدول وحجز الجدول (Affichage ثم Tableur). ب) تمثيل الجدول: حدّد الخلايا B1، C1، D1، B2، C2، D2 واضغط باليمنى على المنطقة المحددة ثم على Créer واختر Liste de points. ملاحظة: ماذا يظهر إذا اخترت Ligne brisée بدل Liste de points؟',
        '2) تمثيل دالة خطية بيانيا باستعمال البرمجية جيوجيبرا: أ) لتمثيل الدّالة الخطية $f$ بيانيا حيث $f : x \\longmapsto 0{,}25x$ : احجز أسفل الصفحة جيوجيبرا في شريط الحجز (Saisie) : $0{,}25x$ واضغط على Enter. ب) كيف يتحرك المستقيم الذي يمثّل دالة خطية معاملها $a$ ، عندما يتغير $a$ ؟ اضغط على (Curseur) ثم على الصفحة جيوجيبرا لإظهار النافذة ثم اختر OK ويظهر زالق (curseur) على الصفحة. احجز $ax$ واضغط على Enter. حرّك الزالق بالفأرة، ماذا تلاحظ عندما $a > 0$ ؟ عندما $a < 0$ ؟ عندما $a = 0$ ؟',
        'دوري الآن: استعمل المجدول إكسال لتمثيل جدول القيم السابق بيانيا باستخدام خاصية الأيقونة «Nuage de points» ثم اختيار أحد الأيقونات.',
    ],
    'answer': {'table': 'النقط $(1 ; 2)$ ، $(2 ; 4)$ ، $(3 ; 6)$ على استقامة مع المبدأ: $f(t) = 2t$',
               'slider': 'a > 0 : المستقيم يصعد ؛ a < 0 : ينزل ؛ a = 0 : ينطبق على محور الفواصل ؛ وكلما كبر |a| كان أشد ميلا'},
    'answerSource': 'computed',
})

# ── أوظّف تعلّماتي ─────────────────────────────────────────────────────────


def exercise(n, page, group, text, section='أوظّف تعلّماتي', **extra):
    d = {'id': f'ex-{n}', 'kind': 'exercise', 'number': n, 'page': page, 'section': section, 'group': group, 'verified': True, 'text': text}
    d.update(extra)
    d['answerSource'] = 'computed'
    return d


G1 = 'تعيين دالة خطية'
G2 = 'تعيين صورة عدد وتعيين عدد صورته معلومة'
G3 = 'تمثيل دالة خطية وقراءة تمثيل بياني'
G4 = 'التعرف على وضعية تناسبية'
G5 = 'استعمال النسب المئوية'
G6 = 'المقادير المركّبة'

_e1 = coef(2500, 2400)
assert _e1 == S('0.96')
E.append(exercise(1, 72, G1, 'سعر سروال هو 2500DA. أصبح هذا السعر 2400DA بعد التخفيض. عيّن الدّالة الخطية التي تنمذج هذه الوضعية. ما هي نسبة هذا التخفيض؟',
                  answer={'a': fmt(_e1), 'formula': 'f(x) = 0{,}96x', 'percent': fmt((1 - _e1) * 100)}))
_e2 = sp.sqrt(3) - sp.sqrt(2)
_e2img = sp.expand(_e2 * _e2)
assert _e2img == 5 - 2 * sp.sqrt(6) and sp.simplify(_e2img - (sp.sqrt(3) + sp.sqrt(2))) != 0
E.append(exercise(2, 72, G1, 'عيّن الدّالة الخطية التي تمثيلها البياني هو المستقيم (D) الذي يشمل النقطة $A(1 ; \\sqrt{3} - \\sqrt{2})$ . هل النقطة $A\'(\\sqrt{3} - \\sqrt{2} ; \\sqrt{3} + \\sqrt{2})$ تنتمي إلى المستقيم (D)؟',
                  answer={'a': '\\sqrt{3} - \\sqrt{2}', 'imageOfAprime': sp.latex(_e2img), 'belongs': False}))
E.append(exercise(3, 72, G1, 'خفّض تاجر سعر منتوج بـ 5%. 1) عبّر عن السعر $y$ للمنتوج بعد التخفيض بدلالة السعر $x$ قبل التخفيض. 2) إذا كان سعر المنتوج هو 1200DA قبل التخفيض فما هو سعره بعد التخفيض؟ 3) إذا كان سعر المنتوج هو 1900DA بعد التخفيض فما هو سعره قبل التخفيض؟',
                  answer={'1': 'y = 0{,}95x', '2': fmt(1200 * S('0.95')), '3': fmt(1900 / S('0.95'))}))
assert 1200 * S('0.95') == 1140 and 1900 / S('0.95') == 2000
_e4 = coef(3000, 3240)
assert _e4 == S('1.08')
E.append(exercise(4, 72, G1, 'سعر حذاء هو 3000DA. أصبح هذا السعر بعد الزيادة 3240DA. 1) ما هو معامل الدّالة الخطية التي تنمذج هذه الوضعية؟ 2) استنتج النسبة المئوية لهذه الزيادة.',
                  answer={'a': fmt(_e4), 'percent': fmt((_e4 - 1) * 100)}))
E.append(exercise(5, 72, G1, 'عندما يتجمد الماء يزداد حجمه بنحو 8%. 1) في أي عدد يجب ضرب حجم الماء للحصول على حجم الجليد؟ 2) نسمي $f$ الدّالة التي ترفق بكل $x$ سنتيمتر مكعب من الماء الحجم $f(x)$ للجليد الناتج. هل $f$ دالة خطية؟ في حالة الإيجاب، عيّن معاملها.',
                  answer={'1': '1{,}08', '2': {'linear': True, 'a': '1{,}08', 'formula': 'f(x) = 1{,}08x'}}))
_e6 = coef(sp.Rational(-2, 3), sp.Rational(-3, 5))
assert _e6 == sp.Rational(9, 10)
E.append(exercise(6, 72, G1, 'عيّن الدّالة الخطية $g$ إذا علمت أن $g\\left(\\dfrac{-2}{3}\\right) = \\dfrac{-3}{5}$ .',
                  answer={'a': fmt(_e6), 'formula': 'g(x) = \\frac{9}{10}x'}))
E.append(exercise(7, 72, G1, 'هل الدّوال التالية دوال خطية؟ في حالة الإيجاب عيّن المعامل. $f : x \\longmapsto 3\\pi x$ ، $g : x \\longmapsto 3x + \\sqrt{2}$ ، $h : x \\longmapsto x^2$ .',
                  answer={'f': {'linear': True, 'a': '3\\pi'}, 'g': {'linear': False}, 'h': {'linear': False}}))
_a8 = -sp.sqrt(3) / 2
_f8 = lambda v: sp.simplify(_a8 * v)
_e8 = {
    '1': {'f(2√3/3)': sp.latex(_f8(2 * sp.sqrt(3) / 3)), 'f(-2)': sp.latex(_f8(-2)), 'f(4)': sp.latex(_f8(4))},
    '2': {'-3': sp.latex(_f8(-3)), '6': sp.latex(_f8(6)), '0': sp.latex(_f8(0))},
    '3': sp.latex(sp.simplify(sp.sqrt(3) / _a8)), '4': sp.latex(sp.simplify(sp.sqrt(12) / _a8)),
}
assert _f8(2 * sp.sqrt(3) / 3) == -1 and _f8(-2) == sp.sqrt(3) and _f8(4) == -2 * sp.sqrt(3)
assert sp.simplify(sp.sqrt(3) / _a8) == -2 and sp.simplify(sp.sqrt(12) / _a8) == -4
E.append(exercise(8, 72, G2, '$f$ هي الدّالة الخطية المعرّفة بالدّستور $f(x) = -\\dfrac{\\sqrt{3}}{2}x$ . 1) احسب $f\\left(\\dfrac{2\\sqrt{3}}{3}\\right)$ ، $f(-2)$ ، $f(4)$ . 2) عيّن صور الأعداد $-3$ ، 6 ، 0. 3) عيّن العدد الذي صورته $\\sqrt{3}$ . 4) عيّن العدد الذي صورته $\\sqrt{12}$ .',
                  answer=_e8))
_a9 = S('2.1')
_e9 = {'x': [fmt(-3), fmt(0), fmt(S('14.7') / _a9), fmt(S('-2.1') / _a9)], 'f(x)': [fmt(-3 * _a9), fmt(0), '14{,}7', '-2{,}1']}
assert _e9 == {'x': ['-3', '0', '7', '-1'], 'f(x)': ['-6{,}3', '0', '14{,}7', '-2{,}1']}
E.append(exercise(9, 72, G2, '$f$ هي الدّالة الخطية التي معاملها 2,1. انقل الجدول التالي ثم أتممه:',
                  table={'x': ['-3', '…', '…', '…'], 'f(x)': ['…', '0', '14{,}7', '-2{,}1']}, answer=_e9))
_a10 = coef(sp.Rational(2, 7), sp.Rational(-1, 3))
assert _a10 == sp.Rational(-7, 6)
_e10 = {'a': fmt(_a10), 'x': ['2', fmt(-3 / _a10), '0', '10'], 'f(x)': [fmt(_a10 * 2), '-3', '0', fmt(_a10 * 10)]}
E.append(exercise(10, 72, G2, 'النقطة $M\\left(\\dfrac{2}{7} ; -\\dfrac{1}{3}\\right)$ تنتمي إلى المستقيم الذي يمثل الدّالة الخطية $f$ . انقل ثم أتمم الجدول التالي',
                  table={'x': ['2', '…', '0', '10'], 'f(x)': ['…', '-3', '…', '…']}, answer=_e10))
_a11 = coef(400, 80)
assert _a11 == sp.Rational(1, 5)
E.append(exercise(11, 72, G3, 'في المعلم أدناه المستقيم (D) هو التمثيل البياني للدالة $f$ . 1) احسب $f(1954)$ و $f(2018)$ . 2) عيّن العدد الذي صورته 10 085.',
                  figure='(D) يشمل المبدأ والنقطة $(400 ; 80)$ (خطان متقطعان).',
                  answer={'a': '0{,}2', 'f1954': fmt(_a11 * 1954), 'f2018': fmt(_a11 * 2018), 'x': fmt(10085 / _a11)}))
assert _a11 * 1954 == S('390.8') and _a11 * 2018 == S('403.6') and 10085 / _a11 == 50425
_a12 = coef(S('2.5'), 200)
assert _a12 == 80 and _a12 * S('1.5') == 120
E.append(exercise(12, 72, G3, 'يبيّن الشكل أدناه تمثيلا بيانيا لسعر نوع من الفواكه (بالدينار) حسب كتلتها (بالكيلوغرام). ماهو سعر 2,5kg من هذه الفواكه؟ دفع زبون 120DA. ما هي الكمية التي اشتراها؟',
                  figure='مستقيم يشمل المبدأ ؛ المحور الأفقي «كتلة (kg)» من 0 إلى 3 ؛ المحور العمودي «السعر (DA)» من 0 إلى 250.',
                  reading={'points': [['1', '80'], ['1{,}5', '120'], ['2{,}5', '200']], 'note': 'Quadrillage : 0,5 kg et 25 DA par carreau ; la droite passe par (2,5 ; 200).'},
                  answer={'a': '80', 'price': '200', 'mass': '1{,}5'}))
E.append(exercise(13, 73, G3, 'مثّل بيانيا الدّوال التالية: $f : x \\longmapsto -\\dfrac{3}{2}x$ ، $g : x \\longmapsto \\dfrac{3}{2}x$ ، $h : x \\longmapsto \\dfrac{2}{3}x$ .',
                  correction={'decidedBy': 'owner', 'decidedOn': '2026-10-02', 'text': 'مثّل بيانيا الدّوال التالية: $f : x \\longmapsto \\dfrac{-3}{2}x$ ، $g : x \\longmapsto \\dfrac{3}{2}x$ ، $h : x \\longmapsto \\dfrac{2}{3}x$ .',
                              'note': 'Le manuel écrit « h :⟼ 2/3 x » (le x de la flèche manque) : notation complétée, sans changer la fonction.'},
                  answer={'points': {'f': '(2 ; -3)', 'g': '(2 ; 3)', 'h': '(3 ; 2)'}}))
_e14 = {p: sp.Rational(-16, 5) * S(px) == S(py) for p, (px, py) in {'A': ('2.5', '8.5'), 'B': (5, 16), 'C': (10, 32)}.items()}
assert _e14 == {'A': False, 'B': False, 'C': False}
assert sp.Rational(16, 5) * 5 == 16 and sp.Rational(16, 5) * 10 == 32 and sp.Rational(16, 5) * S('2.5') != S('8.5')
E.append(exercise(14, 73, G3, '(D) هو المستقيم الذي يمثل بيان الدّالة $f : x \\longmapsto -3{,}2x$ . هل النقط $A(2{,}5 ; 8{,}5)$ ، $B(5 ; 16)$ ، $C(10 ; 32)$ تنتمي إلى (D)؟ اشرح.',
                  answer={'belongs': _e14, 'images': {'A': '-8', 'B': '-16', 'C': '-32'},
                          'note': 'B و C على مستقيم الدالة $x \\longmapsto 3{,}2x$ لا على (D): انتبه إلى إشارة المعامل.'}))
_a15 = coef(S('-2.5'), 4)
assert _a15 == S('-1.6')
E.append(exercise(15, 73, G3, 'نعتبر الدّالة الخطية $h$ حيث $h(-2{,}5) = 4$ . 1) مثّل بيانيا الدّالة $h$ . 2) ماهو معامل الدّالة $h$ ؟ 3) عيّن العدد الذي صورته 2,5.',
                  answer={'a': fmt(_a15), 'x': fmt(S('2.5') / _a15), 'xDecimal': '-1{,}5625'}))
_b = sp.Symbol('b')
_e16 = sorted(sp.solve(sp.Eq((_b - 1) * (1 - _b), 4 * -16), _b))
assert _e16 == [-7, 9]
for bv in _e16:
    assert proportional([bv - 1, 4], [-16, 1 - bv])[0]
E.append(exercise(16, 73, G4, 'عيّن العدد $b$ إذا علمت أن الجدول الآتي جدول تناسبية.',
                  table={'row1': ['b - 1', '4'], 'row2': ['-16', '1 - b']},
                  answer={'equation': '(b - 1)(1 - b) = 4 \\times (-16)', 'solutions': [str(v) for v in _e16],
                          'check': {'9': 'الجدول $8 , 4 / -16 , -8$ : المعامل $-2$', '-7': 'الجدول $-8 , 4 / -16 , 8$ : المعامل $2$'}}))
_r = ['2.5', 3, 8, '9.5']
_P = [2 * sp.pi * S(v) for v in _r]
_A = [sp.pi * S(v) ** 2 for v in _r]
assert _P[0] == 5 * sp.pi and _A[3] == S('90.25') * sp.pi
assert len({sp.simplify(p / S(v)) for p, v in zip(_P, _r)}) == 1 and len({sp.simplify(a / S(v)) for a, v in zip(_A, _r)}) > 1
E.append(exercise(17, 73, G4, 'نعتبر قرصا نصف قطره r . محيطه P ومساحته A . 1) انقل الجدول السابق وأتممه. 2) هل A و P متناسبان؟ في حالة الإيجاب عيّن معامل التناسبية. 3) هل A و r متناسبان؟ في حالة الإيجاب عيّن معامل التناسبية.',
                  table={'r (بالمتر)': ['2{,}5', '3', '8', '9{,}5'], 'P (بالمتر)': ['5\\pi', '', '', ''], 'A (بالمتر المربع)': ['', '', '', '90{,}25\\pi']},
                  correction={'decidedBy': 'owner', 'decidedOn': '2026-10-02',
                              'text': '1) انقل الجدول السابق وأتممه. 2) هل P و r متناسبان؟ في حالة الإيجاب عيّن معامل التناسبية. 3) هل A و r متناسبان؟ في حالة الإيجاب عيّن معامل التناسبية.',
                              'note': 'Le manuel demande en 2) « A و P » puis en 3) « A و r » : la question 2) porte sur le périmètre et le rayon (P = 2πr, coefficient 2π) — « A و P » n’est pas proportionnel et ferait doublon. Corrigé en « P و r ».'},
                  answer={'P': ['5\\pi', '6\\pi', '16\\pi', '19\\pi'], 'A': ['6{,}25\\pi', '9\\pi', '64\\pi', '90{,}25\\pi'],
                          'Pr': {'proportional': True, 'a': '2\\pi'}, 'Ar': {'proportional': False}, 'AP': {'proportional': False}}))
E.append(exercise(18, 73, G4, 'إليك التمثيلين البيانيين التاليين. أي بيان منهما يمثل وضعية تناسبية؟ما هو عندئذ معامل التناسبية؟',
                  figure='(1) مستقيم يشمل المبدأ والنقطة $(1 ; 1{,}5)$ ؛ (2) منحنى يبدأ من $(0 ; 0{,}3)$ تقريبا ويصعد بانحناء.',
                  reading={'note': 'Pente lue 1,5 : la droite passe par (1 ; 1,5) et atteint 2 vers x ≈ 1,33.'},
                  answer={'proportional': 1, 'a': '1{,}5'}))
E.append(exercise(19, 73, G5, '1) اكتب عبارة الدّالة الخطيّة التي تُترجم أخذ $t\\%$ من مقدار $x$ . 2) يوجد في كيس 30 برتقالة و 10 تفحات. أخذ أحمد 20% من البرتقالات وأخذت لينة 30% من التفّاحات. ما هو عدد الفواكه التي بقيت في الكيس؟',
                  answer={'1': 'x \\longmapsto \\frac{t}{100}x', '2': {'oranges': 6, 'apples': 3, 'left': 31}}))
assert 40 - (30 * sp.Rational(20, 100) + 10 * sp.Rational(30, 100)) == 31
E.append(exercise(20, 73, G5, 'سعر كتاب هو 560DA، خفض هذا السعر بـ 6%. ما هو السعر الجديد لهذا الكتاب؟',
                  answer={'price': fmt(560 * S('0.94'))}))
assert 560 * S('0.94') == S('526.4')
E.append(exercise(21, 73, G5, '1) اكتب عبارة الدّالة الخطّية التي تترجم انخفاض مقدار $x$ بنسبة 15%. 2) انخفض عدد رؤوس قطيع من الحيوانات المكوّن من 40 رأسا بـ 15%. ما هو عدد رؤوس القطيع بعد هذا الانخفاض؟',
                  answer={'1': 'x \\longmapsto 0{,}85x', '2': fmt(40 * S('0.85'))}))
E.append(exercise(22, 73, G5, '1) من بين الدّوال الآتية، ميّز تلك التي تعبّر عن زيادة 5% في مقدار $x$ . أ) $f : x \\longmapsto 0{,}05x$ ب) $g : x \\longmapsto 1{,}05x$ جـ) $h : x \\longmapsto 0{,}95x$ . 2) راتب عامل مصنع هو 25 000DA شهريا. استفاد هذا العامل من زيادة قدرها 5%. ما هو راتبه الجديد؟',
                  answer={'1': 'ب', '2': fmt(25000 * S('1.05'))}))
assert 25000 * S('1.05') == 26250
_a23 = coef(4500, 4140)
E.append(exercise(23, 73, G5, 'سعر بذلة قبل التخفيض 4500DA وبعد التخفيض 4140DA. ما هي نسبة هذا التخفيض؟',
                  answer={'a': fmt(_a23), 'percent': fmt((1 - _a23) * 100)}))
assert (1 - _a23) * 100 == 8
_m24 = S('0.97') * S('0.96')
E.append(exercise(24, 73, G5, 'تباع غسالة بـ 48 000DA. خضع سعرها إلى تخفيضين متتابعين قدرهما 3% و 4%. 1) ما هو السعر الجديد للغسالة؟ 2) ما هي النسبة المئوية الكلية للتخفيض؟',
                  answer={'1': fmt(48000 * _m24), 'multiplier': fmt(_m24), '2': fmt((1 - _m24) * 100)}))
assert 48000 * _m24 == S('44697.6') and (1 - _m24) * 100 == S('6.88')
E.append(exercise(25, 73, G6, 'يمثل الماء 75% من كتلة جسم الإنسان. 1) ما هي كتلة الماء وحجمه لشخص يزن 63kg إذا علمت أن الكتلة الحجمية للماء هي $1g/cm^3$ . 2) عيّن كتلة شخص إذا علمت أنّ حجم الماء المتواجد في جسمه هو 47L.',
                  answer={'1': {'mass': fmt(63 * S('0.75')), 'unit': 'kg', 'volume': fmt(63 * S('0.75')), 'volumeUnit': 'L'},
                          '2': {'mass': fmt(47 / S('0.75')), 'massDecimal': '62{,}67'}}))
assert 63 * S('0.75') == S('47.25')
E.append(exercise(26, 73, G6, 'الكتلة الحجمية للزئبق تساوي 13600 كيلوغرام لكل متر مكعب. احسب بالسنتيمتر المكعب حجم كيلوغرام واحد من الزئبق.',
                  answer={'volume': fmt(sp.Rational(10 ** 6, 13600)), 'volumeDecimal': '73{,}53', 'unit': 'cm^3'}))
E.append(exercise(27, 73, G6, 'يبلغ متوسط تدفق نهر $2200m^3/s$ . عبّر عن هذه التدفقات باللتر في الدقيقة.',
                  answer={'flow': fmt(2200 * 1000 * 60)}))
assert 2200 * 1000 * 60 == 132000000

# ── أتعمّق ─────────────────────────────────────────────────────────────────


def deep(n, text, **extra):
    return exercise(n, 75, None, text, section='أتعمّق', **extra)


# ex-28 : lecture du quadrillage (l'axe des abscisses du scan est légèrement courbé) : (1 ; 40), (2 ; 70), (3 ; 130), (4 ; 155).
ST = [(0, 0), (1, 40), (2, 70), (3, 130), (4, 155)]
_t100 = 2 + sp.Rational(100 - 70, 130 - 70)
_last = sp.Rational(155 - 130, 1) / 2
assert _t100 == S('2.5') and _last == S('12.5')
E.append(deep(28, 'إليك التمثيل البياني للمسافة المقطوعة لدرّاج بدلالة المدّة الزمنية المستغرقة. بقراءة بيانية أجب عن الأسئلة التالية: أ) ما هي المسافة الكلية المقطوعة؟ ب) ما هي المدة الزمنية التي يستغرقها الدراج لقطع 100 كيلومتر الأولى؟ جـ) ما هي المسافة المقطوعة خلال نصف الساعة الأخيرة؟ د) عيّن سرعة الدّراج في المرحلة الأولى.',
               figure='خط منكسر من 4 مراحل: من O إلى $(1 ; 40)$ ، ثم $(2 ; 70)$ ، ثم $(3 ; 130)$ ، ثم $(4 ; 155)$ (الزمن بالساعات، المسافة بالكيلومتر).',
               reading={'points': [[str(a), str(b)] for a, b in ST]},
               answer={'a': '155', 'b': fmt(_t100), 'c': fmt(_last), 'd': '40'}))
_y29 = sp.expand(x * (1 + t / 100) * (1 - t / 100))
assert _y29 == x - x * t ** 2 / 10000
E.append(deep(29, 'كان سعر منتوج $x$ دينار. بعد زيادة بـ $t\\%$ متبوعة بتخفيض قدره هو نسبة هذه الزيادة، أصبح السعر الجديد $y$ . عبّر عن السعر الجديد $y$ بدلالة $x$ و $t$ .',
               answer={'y': 'y = \\left(1 + \\frac{t}{100}\\right)\\left(1 - \\frac{t}{100}\\right)x = \\left(1 - \\frac{t^2}{10000}\\right)x',
                       'note': 'السعر الجديد أصغر من السعر الأصلي (إلا إذا كان $t = 0$ ).'}))
_a30 = sp.solve(sp.Eq(sp.Symbol('a') * (x + sp.sqrt(2)) - sp.Symbol('a') * (x - sp.sqrt(2)), 4), sp.Symbol('a'))[0]
assert sp.simplify(_a30 - sp.sqrt(2)) == 0
E.append(deep(30, 'عيّن ثم مثّل بيانيا الدّالة الخطية $f$ التي تحقّق: $f(x + \\sqrt{2}) - f(x - \\sqrt{2}) = 4$',
               answer={'equation': 'a(x + \\sqrt{2}) - a(x - \\sqrt{2}) = 2\\sqrt{2}a = 4', 'a': '\\sqrt{2}', 'formula': 'f(x) = \\sqrt{2}x'}))
_k31 = sp.Rational(4000, 20)
assert _k31 == 200 and 20 * 500 > 4000
E.append(deep(31, 'تقترح شركة سيارات أجرة تسعيرتين للمسافة 500km. التسعيرة الأولى: 20DA للكيلومتر الواحد. التسعيرة الثانية: مبلغ ثابت قدره 4000DA. استعمل تمثيلا بيانيا لتحديد أفضل التسعيرتين.',
               answer={'first': '20x', 'second': '4000', 'equal': '200', 'at500': {'first': '10000', 'second': '4000'},
                       'best': 'التسعيرة الثانية لمسافة 500km (تكون الأولى أفضل فقط لمسافة أقل من 200km)'}))
_g32 = sp.expand(x * sp.sqrt(8) * (sp.Rational(1, 2) - x * sp.sqrt(2)) + 8 - 16 * (x / 2 - sp.sqrt(2)) ** 2)
assert _g32 == -8 * x ** 2 + 17 * sp.sqrt(2) * x - 24
E.append(deep(32, 'هل الدّالة $g$ المعرّفة بالدستور: $g(x) = x\\sqrt{8}\\left(\\dfrac{1}{2} - x\\sqrt{2}\\right) + 8 - 16\\left(\\dfrac{x}{2} - \\sqrt{2}\\right)^2$ دالة خطية؟ في حالة الإيجاب عيّن معاملها.',
               answer={'expanded': sp.latex(_g32), 'linear': False, 'why': 'بعد النشر يبقى حد في $x^2$ وحد ثابت: $g(x) = -8x^2 + 17\\sqrt{2}x - 24$ ليست من الشكل $ax$'}))
_x33 = sp.solve(sp.Eq(-sp.Rational(5, 2) * x, 4), x)[0]
assert _x33 == sp.Rational(-8, 5)
E.append(deep(33, '1) حل بيانيا ثم جبريا المعادلة $-\\dfrac{5}{2}x = 4$ . 2) حل بيانيا ثم جبريا المتراجحة $-\\dfrac{5}{2}x \\leqslant 3$ .',
               answer={'1': fmt(_x33), '2': 'x \\geqslant -\\frac{6}{5}', 'bound': fmt(sp.Rational(-6, 5))}))
_tot34 = 48000 + 2400
_disc34 = (_tot34 // 1000) * 10
assert _tot34 - _disc34 == 49900
E.append(deep(34, 'قدم تاجر العرض الترويجي التالي: من 1 أفريل 2018 إلى 5 أفريل 2018 خفّض 10DA لكل شراء قدره 1000DA. اشترى سليمان جهاز كمبيوتر بـ 48 000DA وقرص فلاش بـ 2400DA. ما هو المبلغ الذي دفعه؟',
               answer={'total': str(_tot34), 'discount': str(_disc34), 'paid': str(_tot34 - _disc34),
                       'reading': 'التخفيض 10DA عن كل 1000DA كاملة من مبلغ المشتريات: 50 مرة'}))
_v35 = 20000000 * S('1.1') * S('0.92')
assert _v35 == 20240000
E.append(deep(35, 'بلغ حجم المياه بأحد السدود $20\\,000\\,000m^3$ . في سنة 2016 ارتفع مخزون المياه بنسبة قدرها 10%. في سنة 2017 انخفض المخزون بنسبة 8%. ما هو حجم المياه المخزنة في السنة 2017؟',
               answer={'volume': str(_v35)}))
_p36 = sp.Rational(20 * 60 + 10 * 70, 100) / 30 * 100
assert sp.Rational(20 * 60 + 10 * 70, 100) == 19
E.append(deep(36, 'في قسم متكوّن من 30 تلميذا، 20 منهم يدرسون اللغة الإنجليزية و10 يدرسون اللغة الألمانية. 60% من التلاميذ الذين يدرسون الإنجليزية يمارسون رياضة كرة القدم و 70% من الذين يدرسون الألمانية يمارسون أيضا هذه الرياضة. ما هي النسبة المئوية لتلاميذ هذا القسم الذين يمارسون كرة القدم؟',
               answer={'players': '19', 'percent': fmt(_p36), 'percentDecimal': '63{,}33'}))
_c37 = sp.Rational(8) / S('0.13')
assert _c37 > 45
E.append(deep(37, 'يجب ألّا تتجاوز الكتلة الحجمية لنترات مياه الشرب 45mg/L. كأس سعته 13cL. عند ملئه بالماء تتحصل على 8mg من النترات. هل يمكن أن نقول أن هذا الماء صالح للشرب؟',
               answer={'concentration': fmt(_c37), 'concentrationDecimal': '61{,}54', 'drinkable': False}))
assert sp.Rational(5, 6) * 100 > 80
E.append(deep(38, 'هل صحيح أنه إذا كان سُدس عدد الناخبين في انتخابات لم يصوتوا، فإنه يمكن القول أن 80% منهم صوتوا؟',
               answer={'voted': '\\frac{5}{6}', 'percentDecimal': '83{,}33', 'claim': True,
                       'why': 'صوّت $\\dfrac{5}{6}$ من الناخبين أي حوالي 83,33% ، وهي أكثر من 80% : القول «80% منهم صوتوا» صحيح (بل أكثر).'}))
_c39 = S('0.4') / S('0.54')
E.append(deep(39, '500mL من عصير البرتقال يحتوي على 40cg من السكر. وجد عبد الحميد هذا المشروب حلوًا جدا فأضاف له 40mL من الماء. ما هو تركيز السكر في المشروب الجديد؟',
               answer={'concentration': fmt(_c39), 'concentrationDecimal': '0{,}74', 'unit': 'g/L', 'before': '0{,}8'}))

# ── أؤكّد تعلّماتي ─────────────────────────────────────────────────────────
assert coef(2, 7) == S('3.5') and coef(-6, -9) == S('1.5') and coef(8, 14) == S('1.75')
assert proportional([-5, 25, 10], [2, -10, -4]) == (True, S('-0.4'))
assert S('135.1') / 7 == S('19.3')
E.append({
    'id': 'qcm', 'kind': 'qcm', 'page': 74, 'section': 'أؤكّد تعلّماتي', 'verified': True,
    'instruction': 'في كل حالة مما يلي اختر الإجابة أو الإجابات الصحيحة، وبرّر اختيارك.',
    'items': [
        {'n': 1, 'text': 'معامل الدّالة الخطية التي تمثيلها البياني يشمل النقطة $A(2 ; 7)$ هو:', 'options': ['2', '3,5', '7'], 'correct': [1], 'backToPage': [68]},
        {'n': 2, 'text': '$-9$ هي صورة $-6$ بالدّالة الخطية:', 'options': ['$f : x \\longmapsto -\\dfrac{6}{4}x$', '$g : x \\longmapsto 1{,}5x$', '$h : x \\longmapsto -\\dfrac{4}{6}x$'], 'correct': [1], 'backToPage': [69]},
        {'n': 3, 'text': '8 هو العدد الذي صورته 14 بالدّالة الخطية:', 'options': ['$f : x \\longmapsto 1{,}75x$', '$g : x \\longmapsto \\dfrac{8}{14}x$', '$h : x \\longmapsto \\dfrac{4}{7}x$'], 'correct': [0], 'backToPage': [69]},
        {'n': 4, 'text': 'المستقيم (D) أدناه هو التمثيل البياني للدّالة:', 'figure': '(D) يشمل المبدأ والنقطة $(1 ; 0{,}25)$ .',
         'options': ['$f : x \\longmapsto x + 0{,}25$', '$g : x \\longmapsto 0{,}75x$', '$h : x \\longmapsto 0{,}25x$'], 'correct': [2], 'backToPage': [68, 69]},
        {'n': 5, 'text': '$f$ دالة خطية حيث $f(m) = n$ و $m \\neq 0$ ، معاملها هو:', 'options': ['$\\dfrac{n}{m}$', '$mn$', '$n$'], 'correct': [0], 'backToPage': [68, 69]},
        {'n': 6, 'text': 'معامل الدّالة الخطية $f$ هو: (الجدول: $x$ : $-5$ ، 25 ، 10 ؛ $f(x)$ : 2 ، $-10$ ، $-4$ )', 'options': ['$\\dfrac{52}{130}$', '$-0{,}4$', '$-\\dfrac{5}{2}$'], 'correct': [1], 'backToPage': [68]},
        {'n': 7, 'text': '$7cm^3$ من الذهب يزن 135,1g. إذن الكتلة الحجمية للذهب هي :', 'options': ['$19\\,300kg/m^3$', '$19{,}3kg/L$', '$19{,}3g/cm^3$'], 'correct': [0, 1, 2], 'backToPage': [70, 71]},
        {'n': 8, 'text': 'يمكن ترجمة خفض مقدار بـ 10% بالدّالة الخطية :', 'options': ['$f : x \\longmapsto 0{,}9x$', '$g : x \\longmapsto x - 10$', '$h : x \\longmapsto \\dfrac{10}{100}x$'], 'correct': [0], 'backToPage': [70, 71]},
    ],
    'answer': {'1': '3{,}5', '2': '1{,}5', '3': '1{,}75', '4': '0{,}25', '6': '-0{,}4', '7': '19{,}3'},
    'answerSource': 'computed',
})

# ── أدمج تعلّماتي ──────────────────────────────────────────────────────────
_AB = sp.sqrt(2500 ** 2 + (1400 - 900) ** 2)
assert _AB == 500 * sp.sqrt(26)
_sec = _AB / S('5.5')
_max = sp.Rational(2000) / (2 + 3 * S('0.6'))
assert 2 + 3 * S('0.6') == S('3.8')
E.append({
    'id': 'situation', 'kind': 'situation', 'page': 74, 'section': 'أدمج تعلّماتي', 'title': 'وضعية', 'verified': True,
    'text': '1) ينطلق مصعد هوائي من ارتفاع 900m ليصل ارتفاع 1400m (الشكل). ما هي المدة الزمنية (مقدّرة بالدقائق والثواني) لصعود واحد، إذا كانت سرعة المصعد الهوائي 5,5m/s؟ 2) ليكن $x$ سعر التذكرة لشخص بالغ لرحلة واحدة (ذهابا وإيابا). أ) عبّر عن تكلفة الرحلة بدلالة $x$ لعائلة متكوّنة من شخصين بالغين و 3 أطفال، علما أنّ كلّ طفل يستفيد من تخفيض قدرة 40% من قيمة $x$ . ب) ما هي أكبر قيمة لسعر التذكرة التي تسمح للعائلة بدفع ثمن الرحلة في حدود المبلغ المخصص لذلك والمقدر بـ 2000DA؟',
    'figure': 'مصعد هوائي (تيليفيريك) فوق غابة: الحبل [AB] ؛ H المسقط العمودي لـ B على مستوى A ؛ AH = 2500m.',
    'analysis': [
        'قراءة الوضعية وفهمها: قراءة نصّ المشكلة وفهم معاني المفردات الواردة فيه. فهم الوضعية وتشكيل صورة ذهنية لها. فهم التعليمات وإدراك المهمة المركّبة: التعبير عن تكلفة الرحلة بدلالة المتغيّر (سعر تذكرة الشخص البالغ) تعيين طبيعة الدالة.',
        'تحليل الوضعية واختيار استراتيجية حل مناسبة: يتعلق الجزء الأول من المشكل بتعيين المدة الزمنية التي يستغرقها المصعد للانتقال من A إلى B. لذلك، نحتاج إلى تعيين المسافة AB. استغلال الفرق في الارتفاعين A و B والمعلومات الواردة على الرسم التخطيطي للمكان. في الجزء الثاني، يتعلق الأمر بتعيين عبارة تكلفة الرحلة بالنسبة إلى كلّ العائلة بدلالة سعر تذكرة شخص بالغ. عدة متغيرات يجب اعتبارها، منها تشكيل العائلة، تخفيض سعر التذكرة بالنسبة لكل طفل، حدود إمكانيات العائلة.',
        'تنفيذ استراتيجية الحل المختارة: نوظف مبرهنة فيثاغورس ونمثل بيانيا الدالة الخطية التي ترفق بكل قيمة لـ $x$ تكلفة الرحلة.',
    ],
    'answer': {
        'BH': '500', 'AB': '500\\sqrt{26}', 'ABdecimal': '2549{,}51',
        'seconds': sp.latex(sp.simplify(_sec)), 'secondsDecimal': '463{,}55', 'duration': '7min 43s تقريبا (7 دقائق و 43,55 ثانية)',
        'cost': 'C(x) = 2x + 3 \\times 0{,}6x = 3{,}8x', 'a': '3{,}8',
        'maxExact': sp.latex(_max), 'maxDecimal': '526{,}32', 'maxInteger': '526',
    },
    'answerSource': 'computed',
})
assert abs(float(_sec) - 463.547) < 0.01 and int(_sec // 60) == 7 and _max == sp.Rational(10000, 19)

# ── Plan de couverture ─────────────────────────────────────────────────────
L1, L2, L3, L4, L5, L6 = 'tanasub-muamil', 'dala-khattiya', 'tamthil-bayani-khatti', 'tatbiqat-tanasub', 'tarrid-khatti', 'wadiya-idmajiya-khattiya'
DEST = {
    '_comment': 'elementId → { lesson, module } ; `duplicatedIn` autorise une seconde utilisation déclarée ; `items` répartit un élément à plusieurs sous-éléments. Vérifié par scripts/check-textbook-coverage.mjs.',
    'objectives': {'lesson': 'unit', 'module': 'page'},
    'intro-road': {'lesson': 'unit', 'module': 'page'},
    'challenge': {'lesson': 'unit', 'module': 'page', 'duplicatedIn': [
        {'lesson': L5, 'module': 2, 'note': 'deux véhicules : B proportionnel (droite par O, 75 km/h), A non — vitesse moyenne et lecture graphique'}]},
    'prep': {'lesson': L1, 'module': 0, 'items': {
        '4-5': {'lesson': L1, 'module': 0},
        '1-3': {'lesson': L2, 'module': 0},
        '6-9': {'lesson': L4, 'module': 0}}},
    'act-1': {'lesson': L2, 'module': 1, 'duplicatedIn': [
        {'lesson': L1, 'module': 1, 'note': 'question 1 seulement : le tableau de la remise, proportionnel, coefficient 0,8'}]},
    'act-2': {'lesson': L2, 'module': 2},
    'know-1': {'lesson': L2, 'module': 2},
    'know-2': {'lesson': L2, 'module': 2},
    'method-determine': {'lesson': L2, 'module': 2},
    **{f'ex-{n}': {'lesson': L2, 'module': 3} for n in [1, 6, 7, 8, 9]},
    **{f'ex-{n}': {'lesson': L1, 'module': 3} for n in [16, 17, 18]},
    'act-3': {'lesson': L3, 'module': 1},
    'know-3': {'lesson': L3, 'module': 2},
    'method-read': {'lesson': L3, 'module': 2},
    'method-draw': {'lesson': L3, 'module': 2},
    'now-69': {'lesson': L3, 'module': 2},
    'tech-76': {'lesson': L3, 'module': 1},
    **{f'ex-{n}': {'lesson': L3, 'module': 3} for n in [2, 10, 11, 12, 13, 14, 15, 30, 33]},
    'act-5': {'lesson': L4, 'module': 1},
    'act-6': {'lesson': L4, 'module': 2},
    'know-4': {'lesson': L4, 'module': 3},
    'method-percent': {'lesson': L4, 'module': 3},
    'method-compound': {'lesson': L4, 'module': 3},
    'now-71': {'lesson': L4, 'module': 3},
    **{f'ex-{n}': {'lesson': L4, 'module': 4} for n in [3, 4, 5, 19, 20, 21, 22, 23, 24, 25, 26, 27]},
    'act-4': {'lesson': L5, 'module': 1},
    'method-spring': {'lesson': L5, 'module': 2},
    **{f'ex-{n}': {'lesson': L5, 'module': 3} for n in [28, 29, 31, 34, 35, 36]},
    'situation': {'lesson': L6, 'module': 1, 'duplicatedIn': [{'lesson': L6, 'module': 4}]},
    'qcm': {'lesson': L6, 'module': 2, 'duplicatedIn': [
        {'lesson': L2, 'module': 4, 'items': [2, 3, 5, 6]},
        {'lesson': L3, 'module': 4, 'items': [1, 4]},
        {'lesson': L4, 'module': 5, 'items': [7, 8]}]},
    **{f'ex-{n}': {'lesson': L6, 'module': 3} for n in [32, 37, 38, 39]},
}

DISCREPANCIES = [
    {'elementId': 'act-1', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
     'text': '« 2% » : avec 0,98 les antécédents demandés (f(x) = 6 et 1,4) valent 300/49 et 10/7 ; avec 20 % (0,8) ils valent 7,5 et 1,75. Lecture 20 % retenue.'},
    {'elementId': 'act-6', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
     'text': 'Cuivre « 6cm³ … 71,2g » = 11,9 g/cm³ (> argent 10,5) : physiquement impossible ; 8 cm³ (8,9 g/cm³). La réponse (l’or) ne change pas.'},
    {'elementId': 'know-4', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
     'text': '« 1,2kw … 6kw/h » : puissance en kW, énergie en kWh.'},
    {'elementId': 'ex-13', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
     'text': '« h :⟼ 2/3 x » : la variable x manque avant la flèche ; notation complétée.'},
    {'elementId': 'ex-17', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
     'text': '2) « هل A و P متناسبان » puis 3) « هل A و r » : la question 2 porte sur P et r (P = 2πr) ; corrigé.'},
    {'elementId': 'ex-14', 'kind': 'note', 'text': 'Relu à 300 dpi : « −3,2x » est bien imprimé. Aucun des trois points n’est sur (D) ; B et C sont sur la droite de x ↦ 3,2x — un piège de signe que la leçon exploite, sans rien changer.'},
    {'elementId': 'ex-32', 'kind': 'note', 'text': 'Relu à 300 dpi : g(x) = −8x² + 17√2x − 24 après développement — g n’est pas linéaire. Réponse « non », énoncé inchangé.'},
    {'elementId': 'ex-34', 'kind': 'ambiguity', 'text': '« 10DA لكل شراء قدره 1000DA » lu comme 10 DA par tranche complète de 1000 DA du total (50 400 DA → 500 DA) : 49 900 DA.'},
    {'elementId': 'challenge', 'kind': 'note', 'text': 'Valeurs lues sur le quadrillage (pas de tableau dans le manuel) ; B : 75 km/h constants ; A : 300 km en 4,5 h.'},
    {'elementId': 'ex-28', 'kind': 'note', 'text': 'Points lus (1 ; 40), (2 ; 70), (3 ; 130), (4 ; 155) — l’axe des abscisses du scan est courbé, la lecture tient compte de la courbure.'},
    {'elementId': 'unit', 'kind': 'placement', 'text': 'Le programme (programme_4am_2026_2027.json) range « الدوال الخطية » (duwal_khattiya) dans « ميدان الحساب الحرفي » ; le propriétaire a demandé (2026-10-02) un ميدان d’affichage « ميدان التناسبية والدوال » (units_4am_2026_2027.json › ownerChapters), sous lequel l’unité est placée (unit › placement).'},
]

doc = {
    '_comment': [
        'EXTRACTION CANONIQUE du manuel scolaire officiel — 4AM, الجيل الثاني, unité 6 « الدالة الخطية والتناسبية ».',
        'Source : « وحدة التناسبية و الدالة الخطية.pdf » (12 pages PDF = pages 65 à 76 du manuel), scan sans couche texte.',
        'Ce fichier est LA source de vérité pédagogique de l’unité dans le dépôt. Tout contenu de leçon, toute manipulation,',
        'tout exercice de pratique cite un `id` d’ici via `source.elementId`.',
        'Transcription VISUELLE (pages rendues à 200 dpi, zooms à 300 dpi sur les passages douteux) ; la formulation arabe est celle du manuel.',
        'Les réponses (`answer`) NE viennent PAS du manuel (il n’a pas de corrigé) : elles sont calculées par sympy dans',
        'build-extraction.py et marquées `answerSource: computed`. Les lectures de graphiques sont dans `reading`.',
        'Les coquilles sont CORRIGÉES dans les leçons (champ `correction`, politique du propriétaire) ; `discrepancies` les liste.',
        'Les `destinations` sont le plan de couverture : chaque élément a UNE destination (ou une répartition `items`),',
        'une seconde utilisation est déclarée dans `duplicatedIn`. scripts/check-textbook-coverage.mjs le vérifie.',
        'Généré par docs/sources/4am/unit6/build-extraction.py — ne pas éditer à la main.',
    ],
    'unitCode': 'tanasubiya-dala-khattiya',
    'textbook': {'title': 'كتاب الرياضيات — السنة الرابعة من التعليم المتوسط', 'generation': 'الجيل الثاني', 'unitNumber': 6,
                 'unitTitle': 'الدالة الخطية والتناسبية',
                 'pages': {'first': 65, 'last': 76}, 'pdfPageOffset': 64,
                 'sections': ['سأتعلّم في هذا الباب', 'تحدّ', 'أستعدّ', 'أنشطة', 'معارف', 'طرائق', 'دوري الآن', 'أوظّف تعلّماتي', 'أؤكّد تعلّماتي', 'أدمج تعلّماتي', 'أتعمّق', 'أوظف تكنولوجيات الإعلام و الاتصال']},
    'frozenAt': '2026-10-02',
    'terminology': {'note': 'Le manuel écrit « دالة خطية » (pluriel « دوال خطية »), « معاملها a », « صورة x بالدالة f » notée f(x), « الترميز x ⟼ ax », « جدول تناسبية », « معامل التناسبية », « التمثيل البياني » (« بيان »), « مستقيم يشمل المبدأ O », « معامل توجيه », « يصعد / ينزل من اليسار إلى اليمين », « قراءة بيانية », « فاصلة / ترتيب », « النسبة المئوية », « زيادة / تخفيض بـ t% », « الدالة الخطية المرفقة », « المقادير المركّبة », « مقدار جداء », « مقدار حاصل القسمة », « السرعة المتوسطة », « الكتلة الحجمية », « الكثافة السكانية », « التدفق ».',
                    'terms': ['دالة خطية', 'معامل', 'صورة', 'جدول تناسبية', 'معامل التناسبية', 'التمثيل البياني', 'مستقيم يشمل المبدأ', 'معامل توجيه', 'فاصلة', 'ترتيب', 'قراءة بيانية', 'النسبة المئوية', 'زيادة', 'تخفيض', 'الدالة الخطية المرفقة', 'مقدار جداء', 'مقدار حاصل القسمة', 'السرعة المتوسطة', 'الكتلة الحجمية', 'الكثافة السكانية', 'التدفق', 'الرابع المتناسب']},
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
assert len([i for i in ids if i.startswith('ex-')]) == 39

out = Path(__file__).with_name('extraction.json')
out.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
print(f'{out} — {len(E)} éléments')
