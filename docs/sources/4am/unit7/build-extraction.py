#!/usr/bin/env python3
"""Génère docs/sources/4am/unit7/extraction.json — unité 7 « الدالة التآلفية » (pp. 77–79).

Transcription VISUELLE du scan (« وحدة الدالة التآلفية.pdf », 3 pages CamScanner, sans couche texte),
pages rendues à 200 dpi, relues à 400 dpi sur les passages douteux (figure du أستعدّ 7, couple de
نشاط 3 2-أ, escalier de نشاط 4). Le PDF fourni s'arrête à la page 79 : ouverture de l'unité, تحدّ,
أستعدّ et les cinq أنشطة — il n'y a ni معارف, ni طرائق, ni تمارين, ni أدمج تعلّماتي dans la source.
Tout le reste des leçons (formalisation, exercices, synthèse) est donc un ajout DÉCLARÉ de la plateforme.

Le texte arabe est celui du manuel, au mot près ; les réponses (`answer`) ne viennent PAS du manuel
(il n'a pas de corrigé) : elles sont CALCULÉES ici avec sympy (`answerSource: computed`).

Usage : python3 docs/sources/4am/unit7/build-extraction.py
"""
import json
from pathlib import Path

import sympy as sp

x, y = sp.symbols('x y')


def S(e):
    """Les décimaux du manuel (1,8 …) sont lus EXACTS, jamais un flottant."""
    return e if isinstance(e, sp.Basic) else sp.sympify(str(e).replace(',', '.'), rational=True)


def affine_ab(expr):
    """(a, b) si expr est du premier degré en x, sinon None (x², 1/x)."""
    e = sp.expand(S(expr))
    p = sp.Poly(e, x) if e.is_polynomial(x) else None
    if p is None or p.degree() > 1:
        return None
    return sp.nsimplify(e.coeff(x, 1)), sp.nsimplify(e.coeff(x, 0))


E = []

E.append({
    'id': 'objectives', 'kind': 'objectives', 'page': 77, 'section': 'سأتعلّم في هذا الباب', 'verified': True,
    'items': [
        'معرفة الترميز $x \\longmapsto ax + b$ .',
        'تعيين صورة عدد بدالة تآلفية.',
        'تعيين عدد صورته بدالة تآلفية معلومة.',
        'تعيين دالة تآلفية انطلاقا من عددين وصورتيهما.',
        'تمثيل دالة تآلفية بيانيا.',
        'قراءة التمثيل البياني لدالة تآلفية.',
        'تعيين المعاملين $a$ و $b$ انطلاقا من التمثيل البياني لدالة تآلفية.',
        'إنجاز تمثيل بياني لوضعية يتدخل فيها مقداران أحدهما معطى بدلالة الآخر، قراءته و تفسيره.',
        'تفسير حل جملة معادلتين من الدرجة الأولى بمجهولين بيانيا.',
    ],
})

E.append({
    'id': 'intro-temperature', 'kind': 'aside', 'page': 77, 'section': 'مدخل الباب', 'title': 'قياس درجة الحرارة', 'verified': True,
    'text': 'تُستخدم في قياس الحرارة بعض الأنواع من الوحدات من أشهرها الدّرجة فهرنهايت (°F) التي تستعمل في البلدان الأنجلوساكسونية والدّرجة سلسيوس (أو الدرجة المئوية) (°C) المعتمدة في أغلبية البلدان. تعود تسمية « الدّرجة فهرنهايت» إلى العالم الألماني دانيال غابريل فهرنهايت وتسمية «الدّرجة سلسيوس» إلى العالم السويدي اندروس سلسيوس.',
    'caption': 'صورتان: غابريل فهرنهايت ، اندروس سلسيوس (صور في الكتاب — لا تُنسخ).',
})

# ── تحدّ : le graphique °C → °F (lecture des pointillés) ─────────────────────────────────
CH = [(0, 32), (5, 41), (10, 50), (15, 59), (20, 68), (25, 77), (30, 86), (35, 95), (40, 104)]
_a = sp.Rational(CH[-1][1] - CH[0][1], CH[-1][0] - CH[0][0])
assert _a == S('1.8') and all(S('1.8') * c + 32 == f for c, f in CH)
E.append({
    'id': 'challenge', 'kind': 'challenge', 'page': 77, 'section': 'تحدّ', 'verified': True,
    'text': 'يُمثّل البيان المقابل العلاقة بين الدرجة سلسيوس والدرجة فهرنهايت حيث يُرمز بـ $x$ لدرجة الحرارة بـ (°C) و $f(x)$ لدرجة الحرارة بـ (°F). 1) إذا كانت درجة الحرارة 10°C فما هي الدرجة المقابلة لها بالفهرنهايت؟ 2) عبّر عن $f(x)$ بدلالة $x$ .',
    'figure': 'مستقيم لا يشمل المبدأ: المحور الأفقي (°C) من 0 إلى 40 بخطوة 5 ؛ المحور العمودي (°F) مدرّج 16 ، 32 ، 41 ، 50 ، 59 ، 68 ، 77 ، 86 ، 95 ، 104 مع خطوط متقطعة من كل فاصلة إلى ترتيبها.',
    'reading': {'points': [[str(c), str(f)] for c, f in CH], 'note': 'Lecture des pointillés : l’ordonnée à l’origine est 32 ; +9 °F tous les 5 °C.'},
    'answer': {'f10': '50', 'a': '1{,}8', 'b': '32', 'rule': 'f(x) = 1{,}8x + 32'},
    'answerSource': 'computed',
})

# ── أستعدّ ──────────────────────────────────────────────────────────────────
s2 = sp.sqrt(2)
PREP = [
    ('إذا كان $x = 6$ فإنّ $\\dfrac{1}{2}x = 12$ .', sp.Rational(1, 2) * 6 == 12, '$\\dfrac{1}{2} \\times 6 = 3$ ، وليس 12'),
    ('صورة العدد 0 بالدّالة الخطية $x \\longmapsto -\\sqrt{2}x$ هي 0.', -s2 * 0 == 0, '$-\\sqrt{2} \\times 0 = 0$'),
    ('صورة العدد $\\sqrt{2}$ بالدّالة الخطية $x \\longmapsto -\\sqrt{2}x$ هي $-1$ .', sp.simplify(-s2 * s2) == -1, '$-\\sqrt{2} \\times \\sqrt{2} = -2$ ، وليس $-1$'),
    ('الدّالة $x \\longmapsto \\dfrac{1}{3}x + 1 + x + 2$ هي دالة خطية.', affine_ab('x/3+1+x+2')[1] == 0, 'بعد الاختزال: $\\dfrac{4}{3}x + 3$ ، وفيها حدّ ثابت 3 فهي ليست خطية'),
    ('العدد الذي صورته 1 بالدّالة الخطية $x \\longmapsto 4x$ هو $\\dfrac{1}{4}$ .', sp.solve(4 * x - 1, x) == [sp.Rational(1, 4)], '$4 \\times \\dfrac{1}{4} = 1$'),
    ('التمثيل البياني للدّالة $x \\longmapsto \\dfrac{1}{2}x$ هو مستقيم يشمل مبدأ المعلم و النقطة $A(2 ; 1)$ .', sp.Rational(1, 2) * 2 == 1, 'دالة خطية: مستقيم يشمل المبدأ ، و $\\dfrac{1}{2} \\times 2 = 1$'),
    ('لاحظ التمثيل أدناه. أ) الدّالة الخطية التي تمثيلها البياني هو $(d)$ هي الدّالة $f$ حيث $f(x) = -x$ .', False, '$(d)$ يشمل المبدأ والنقطة $(1 ; 1)$ : $f(x) = x$'),
    ('لاحظ التمثيل أدناه. ب) الدّالة الخطية التي تمثيلها البياني هو $(d\')$ هي الدّالة $g$ حيث $g(x) = -x$ .', True, '$(d\')$ يشمل المبدأ والنقطة $(1 ; -1)$ : $g(x) = -x$'),
]
assert [t for _, t, _ in PREP] == [False, True, False, False, True, True, False, True]
E.append({
    'id': 'prep', 'kind': 'prerequisites', 'page': 77, 'section': 'أستعدّ', 'verified': True,
    'instruction': 'أصحيح أم خاطئ؟ برّر إجابتك.',
    'figure': 'البند 7: معلم متعامد ومتجانس (الوحدة مربعان) ؛ $(d)$ بالأسود يصعد ويشمل المبدأ و $(1 ; 1)$ ؛ $(d\')$ بالأحمر ينزل ويشمل المبدأ و $(-1 ; 1)$ .',
    'items': [{'n': min(i + 1, 7), **({'part': 'أ' if i == 6 else 'ب'} if i >= 6 else {}), 'text': t, 'answer': bool(v), 'why': j}
              for i, (t, v, j) in enumerate(PREP)],
    'answerSource': 'computed',
})

# ── نشاط 1 : la paie (35000 + 185 par heure supplémentaire) ────────────────────────────
H = [5, 8, 10, 12, 15]
SAL = [35000 + 185 * h for h in H]
assert SAL[2] == 36850 and len({sp.Rational(s, h) for s, h in zip(SAL, H)}) > 1
E.append({
    'id': 'act-1', 'kind': 'activity', 'page': 78, 'section': 'أنشطة', 'number': 1, 'title': 'تعيين دالة تآلفية', 'verified': True,
    'text': 'توظف مؤسسة اقتصادية عمالا و تقترح على كل واحد منهم أجرة يتم حسابها بالصيغة التالية: أجرة قاعدية شهرية قدرها 35000DA، يضاف إليها 185DA لكل ساعة إضافية منجزة في نفس الشهر. 1) إذا أنجز عامل 10 ساعات إضافية، تحقق من أنّ أجرته لهذا الشهر تساوي 36 850DA. 2) أ) انقل الجدول التالي وأتممه. ب) هل الجدول المقابل جدول تناسبية؟ اشرح. 3) نسمّي $x$ عدد الساعات الإضافية التي أنجزها عامل، عبّر عن أجرته $S(x)$ بدلالة $x$ . 4) كل دالة من الشكل: $x \\longmapsto ax + b$ حيث $a$ و $b$ عددان معلومان تسمى دالة تآلفية. أ) هل الوضعية المقترحة تعرّف دالة تآلفية؟ ب) صف الدالة $S$ ببرنامج حساب من الشكل: «اضرب $x$ في …، أضيف …»',
    'table': {'rows': ['عدد الساعات الإضافية', 'الأجرة الشهرية (بالدينار)'], 'x': [str(h) for h in H], 'y': ['…', '…', '36 850', '…', '…']},
    'correction': {'printed': '«اضرب $x$ في …، أضيف …»', 'corrected': '«اضرب $x$ في …، أضف …»',
                   'note': 'صيغة الأمر في برنامج الحساب هي «أضف» (كما «اضرب»)، والمطبوع «أضيف».'},
    'answer': {'q1': '35000 + 10 \\times 185 = 36850', 'table': [str(s) for s in SAL], 'proportional': False,
               'why': '$\\dfrac{35925}{5} = 7185$ و $\\dfrac{36480}{8} = 4560$ : النسب غير متساوية',
               'S': 'S(x) = 185x + 35000', 'a': '185', 'b': '35000', 'program': 'اضرب $x$ في 185، أضف 35000'},
    'answerSource': 'computed',
})

# ── نشاط 2 : reconnaître des fonctions affines ─────────────────────────────────────────
A2 = [('أ', '3*x**2+1', '$x \\longmapsto 3x^2 + 1$'), ('ب', '-2*x+1', '$x \\longmapsto -2x + 1$'), ('ج', '5*x', '$x \\longmapsto 5x$'),
      ('د', 'x/2-1', '$x \\longmapsto \\dfrac{x}{2} - 1$'), ('هـ', '2+3*x', '$x \\longmapsto 2 + 3x$'), ('و', '1/x-3', '$x \\longmapsto \\dfrac{1}{x} - 3$')]
_ans2 = {}
for k, e, _ in A2:
    ab = affine_ab(e)
    _ans2[k] = None if ab is None else {'a': sp.latex(ab[0]), 'b': sp.latex(ab[1])}
assert [k for k, v in _ans2.items() if v] == ['ب', 'ج', 'د', 'هـ']
E.append({
    'id': 'act-2', 'kind': 'activity', 'page': 78, 'section': 'أنشطة', 'number': 2, 'title': 'التعرّف على دوال تآلفية', 'verified': True,
    'text': '1) نقترح الدوال الآتية: ' + ' ؛ '.join(f'{k}) {t}' for k, _, t in A2) + ' . ما هي الدوال التي تعتبر دوال تآلفية؟ عيّن عندئذ المعاملين $a$ و $b$ لكلّ دالة تآلفية. 2) ما رأيك في التصريح: «الدالة الخطيّة هي أيضا دالة تآلفية»؟',
    'answer': {'affine': _ans2, 'q2': 'صحيح: الدالة الخطية $x \\longmapsto ax$ هي الدالة التآلفية $x \\longmapsto ax + b$ في الحالة $b = 0$ .'},
    'answerSource': 'computed',
})

# ── نشاط 3 : la droite de 3/2 x + 1 ───────────────────────────────────────────────────
g = sp.Rational(3, 2) * x
f = g + 1
assert g.subs(x, 2) == 3 and f.subs(x, 2) == 4 and f.subs(x, 0) == 1 and f.subs(x, 1) != 0
E.append({
    'id': 'act-3', 'kind': 'activity', 'page': 78, 'section': 'أنشطة', 'number': 3, 'title': 'تمثيل دالة تآلفية', 'verified': True,
    'text': 'الشكل المقابل هو تمثيل الدّالة الخطية $g$ حيث $g(x) = \\dfrac{3}{2}x$ . أعد إنشاء المستقيم $(d)$ في معلم متعامد ومتجانس مبدؤه O حيث الوحدة هي 1cm. 1) $f$ هي الدّالة التآلفية حيث $f(x) = \\dfrac{3}{2}x + 1$ و $(d\')$ تمثيلها البياني. أ) ما هو ترتيب النقطة من $(d)$ التي فاصلتها 2؟ استنتج دون حساب ترتيب النقطة من $(d\')$ التي فاصلتها 2. ب) بشكل عام، كيف نجد ترتيب نقطة من $(d\')$ انطلاقا من نقطة من $(d)$ التي لها نفس الفاصلة؟ 2) أ) برهن أنّ النقطة التي إحداثياها $(1 ; 0)$ تنتمي إلى المستقيم $(d\')$ . ب) بشكل عام، برهن أنّ النقطة التي إحداثياها $(0 ; b)$ تنتمي إلى المستقيم الممثل للدالة $f$ حيث $f(x) = ax + b$ . (نسمّي العدد $b$ في عبارة الدالة $f$ حيث $f(x) = ax + b$ الترتيب عند المبدأ).',
    'figure': 'المستقيم $(d)$ يشمل المبدأ والنقطة المعلّمة $(1 ; 1{,}5)$ ؛ المحور الأفقي من 0 إلى 5 ، المحور العمودي من 0 إلى 4.',
    'correction': {'printed': '$(1 ; 0)$', 'corrected': '$(0 ; 1)$',
                   'note': 'Couple inversé à l’impression (bidi) : f(1) = 5/2 ≠ 0, la question vise l’ordonnée à l’origine — 2-ب écrit bien (0 ; b).'},
    'answer': {'g2': '3', 'f2': '4', 'rule': 'نضيف 1 إلى ترتيب النقطة من $(d)$', 'f0': '1', 'general': '$f(0) = a \\times 0 + b = b$'},
    'answerSource': 'computed',
})

# ── نشاط 4 : l'abonnement au stade (2000 + 200 par match) ─────────────────────────────
fx = 200 * x + 2000
STEPS = [(0, 1), (1, 4), (4, 6), (6, 10), (10, 12), (12, 15)]
assert fx.subs(x, 7) == 3400 and sp.solve(fx - 4800, x) == [14] and sp.solve(fx - 2000, x) == [0]
for p, q in [(4, 1), (1, 0), (6, 4)]:
    assert (fx.subs(x, p) - fx.subs(x, q)) / (p - q) == 200
E.append({
    'id': 'act-4', 'kind': 'activity', 'page': 79, 'section': 'أنشطة', 'number': 4, 'title': 'تناسب التغيّرات', 'verified': True,
    'text': '1) لمتابعة مباريات كرة القدم، يعرض مركّب رياضي على مناصري فريق المدينة الصيغة التالية: اشتراك سنوي لموسم رياضي حيث يدفع كل مناصر مبلغ 2000DA يضاف إليه مبلغ 200DA يدفعه عند كل دخول للملعب لمشاهدة مقابلة فريقه المفضّل. • إذا تابع مناصر 7 مقابلات خلال موسم رياضي، فما هو المبلغ الإجمالي الذي يدفعه؟ • إذا دفع مناصر مبلغا إجماليا قدره 4800DA، فما هو عدد المقابلات التي تابعها؟ 2) $f$ هي الدّالة التآلفية التي ترفق بكل عدد المقابلات $x$ المبلغ $f(x)$ الذي يدفعه مناصر. • بيّن أن $f(x) = 200x + 2000$ . • ما هي صورة الأعداد 1 ، 4 ، 6 ، 9 ؟ • احسب $f(11)$ و $f(15)$ . • ما هو العدد الذي صورته 2000؟ • احسب $\\dfrac{f(4) - f(1)}{4 - 1}$ ، $\\dfrac{f(1) - f(0)}{1 - 0}$ ، $\\dfrac{f(6) - f(4)}{6 - 4}$ . ماذا تلاحظ؟ • على الشكل المقابل $(d)$ هو التمثيل البياني للدالة $f$ ، أكمل البيانات على الشكل بالأعداد المناسبة في مكان النقاط.',
    'figure': 'المستقيم $(d)$ يبدأ من $(0 ; 2000)$ ؛ المحور الأفقي «عدد المقابلات» مدرّج 1 ، 4 ، 6 ، 10 ، 12 ، 15 ؛ المحور العمودي «المبلغ (DA)» مدرّج 400 ، 2000 ، 2200 ، 2800 ، 3200 ، 4000 ، 4400 ، 4800. سلّم من أسهم أفقية وعمودية بين النقاط ذات الفواصل 0 ، 1 ، 4 ، 6 ، 10 ، 12 ، 15 ؛ المكتوب: 200 (من 0 إلى 1) ، 3 و 600 (من 1 إلى 4) ، والباقي نقاط.',
    'reading': {'steps': [{'from': p, 'to': q, 'dx': q - p, 'dy': int(fx.subs(x, q) - fx.subs(x, p))} for p, q in STEPS],
                'note': 'Les marches lues 0→1→4→6→10→12→15 ; les nombres imprimés : 200 (0→1), 3 et 600 (1→4).'},
    'answer': {'seven': '3400', 'matches4800': '14', 'images': {'1': '2200', '4': '2800', '6': '3200', '9': '3800'},
               'f11': '4200', 'f15': '5000', 'pre2000': '0', 'ratios': ['200', '200', '200'],
               'observe': 'النسبة $\\dfrac{f(x_1) - f(x_2)}{x_1 - x_2}$ ثابتة وتساوي المعامل $a = 200$ : تغيّرات $f(x)$ متناسبة مع تغيّرات $x$ .',
               'fill': [{'dx': q - p, 'dy': int(fx.subs(x, q) - fx.subs(x, p))} for p, q in STEPS[2:]]},
    'answerSource': 'computed',
})

# ── نشاط 5 : la cagnotte de la classe (43 pièces, 5000 DA) ─────────────────────────────
sol = sp.solve([x + y - 43, 100 * x + 200 * y - 5000], [x, y])
assert sol == {x: 36, y: 7}
assert sp.solve(100 * x + 200 * y - 5000, y) == [25 - x / 2]
E.append({
    'id': 'act-5', 'kind': 'activity', 'page': 79, 'section': 'أنشطة', 'number': 5, 'title': 'التفسير البياني لحل جملة معادلتين', 'verified': True,
    'text': '1) لتزيين قسمهم جمع التلاميذ مبلغ 5000DA من قطع 100DA و 200DA. عدد كلّ القطع النقدية هو 43. ما هو عدد قطع كلّ فئة؟ 2) نعتبر الجملة: $\\begin{cases} y = 43 - x & (1) \\\\ y = 25 - \\dfrac{1}{2}x & (2) \\end{cases}$ . أ) ما هي طبيعة كلّ من الدالتين $f : x \\longmapsto 43 - x$ و $g : x \\longmapsto 25 - \\dfrac{1}{2}x$ ؟ ب) الشكل المقابل هو للتمثيلين البيانيين لهاتين الدالتين. أرفق كلّ مستقيم بالدالة الموافقة له. جـ) أعد الرّسم باستعمال ورق مليمتري. هل توجد نقاط إحداثياتها تحقّق معادلتي المستقيمين في آن واحد؟ د) كيف تفسّر النتيجة في سياق الوضعية أعلاه؟',
    'figure': 'مستقيمان نازلان: الأشدّ ميلا يقطع محور التراتيب في 43 ومحور الفواصل في 43 ؛ الآخر يقطع محور التراتيب في 25 ومحور الفواصل في 50 ؛ يتقاطعان في $(36 ; 7)$ . تدريج كل 10.',
    'answer': {'x': '36', 'y': '7', 'meaning': '$x$ عدد قطع 100DA و $y$ عدد قطع 200DA : 36 قطعة من 100DA و 7 قطع من 200DA',
               'nature': 'دالتان تآلفيتان: $a = -1 ، b = 43$ و $a = -\\dfrac{1}{2} ، b = 25$',
               'match': 'المستقيم الذي يقطع محور التراتيب في 43 (الأشدّ ميلا) يمثل $f$ ، والذي يقطعه في 25 يمثل $g$',
               'intersection': '(36 ; 7)', 'equation2': '100x + 200y = 5000 \\iff y = 25 - \\dfrac{1}{2}x'},
    'answerSource': 'computed',
})

# ── Plan de couverture ─────────────────────────────────────────────────────
L1, L2, L3, L4, L5, L6 = 'mafhum-taalufiya', 'tamthil-bayani-taalufi', 'tanasub-taghayyurat', 'tafsir-bayani-jumla', 'tarrid-taalufi', 'wadiya-idmajiya-taalufiya'
DEST = {
    '_comment': 'elementId → { lesson, module } ; `duplicatedIn` autorise une seconde utilisation déclarée ; `items` répartit un élément à plusieurs sous-éléments. Vérifié par scripts/check-textbook-coverage.mjs.',
    'objectives': {'lesson': 'unit', 'module': 'page', 'duplicatedIn': [
        {'lesson': L6, 'module': 1, 'note': 'objectif 8 (« إنجاز تمثيل بياني لوضعية … قراءته وتفسيره ») : les tarifs comparés sur plan-compare — la seule référence manuel de la synthèse, que le PDF fourni ne contient pas'}]},
    'intro-temperature': {'lesson': 'unit', 'module': 'page'},
    'challenge': {'lesson': 'unit', 'module': 'page', 'duplicatedIn': [
        {'lesson': L3, 'module': 2, 'note': 'deux points lus (10 ; 50) et (30 ; 86) → a = 1,8 puis b = 32 : f(x) = 1,8x + 32'}]},
    'prep': {'lesson': L1, 'module': 0, 'items': {
        '1-5': {'lesson': L1, 'module': 0},
        '6-7': {'lesson': L2, 'module': 0}}},
    'act-1': {'lesson': L1, 'module': 1},
    'act-2': {'lesson': L1, 'module': 2},
    'act-3': {'lesson': L2, 'module': 1},
    'act-4': {'lesson': L3, 'module': 1, 'duplicatedIn': [
        {'lesson': L5, 'module': 1, 'note': 'question 1 seulement : modéliser l’abonnement (2000 + 200 par match), 7 matchs → 3400 DA, 4800 DA → 14 matchs'}]},
    'act-5': {'lesson': L4, 'module': 1},
}

DISCREPANCIES = [
    {'elementId': 'act-3', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
     'text': '2-أ imprime « (1 ; 0) » (couple inversé à la composition bidi) : f(1) = 5/2 ≠ 0. La question vise (0 ; 1), le point d’abscisse 0 — 2-ب écrit correctement (0 ; b).'},
    {'elementId': 'act-1', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
     'text': '« أضيف » dans le programme de calcul : l’impératif est « أضف » (comme « اضرب »).'},
    {'elementId': 'act-5', 'kind': 'note', 'text': 'Question 1 ne nomme pas les inconnues ; la question 2 pose x = nombre de pièces de 100 DA, y = nombre de pièces de 200 DA (100x + 200y = 5000 ⇔ y = 25 − x/2).'},
    {'elementId': 'prep', 'kind': 'note', 'text': 'Item 7 : unité = deux carreaux ; (d) passe par O et (1 ; 1), (d′) par O et (−1 ; 1). Item 3 (−√2 × √2 = −2) et item 4 ((4/3)x + 3) sont FAUX par construction, pas des coquilles.'},
    {'elementId': 'unit', 'kind': 'scope', 'text': 'Le PDF fourni (3 pages, 77–79) ne contient ni معارف, ni طرائق, ni تمارين, ni أؤكّد / أدمج تعلّماتي : formalisations, banques d’exercices et synthèse sont des ajouts déclarés de la plateforme (addition()).'},
    {'elementId': 'unit', 'kind': 'placement', 'text': 'Le programme range « الدوال التآلفية » (duwal_taalufiya) et « التمثيل البياني » dans « ميدان الحساب الحرفي » ; le propriétaire place l’unité sous le ميدان d’affichage « ميدان التناسبية والدوال » (units_4am_2026_2027.json › ownerChapters), comme l’unité 6.'},
]

doc = {
    '_comment': [
        'EXTRACTION CANONIQUE du manuel scolaire officiel — 4AM, الجيل الثاني, unité 7 « الدالة التآلفية ».',
        'Source : « وحدة الدالة التآلفية.pdf » (3 pages PDF = pages 77 à 79 du manuel), scan CamScanner sans couche texte.',
        'Ce fichier est LA source de vérité pédagogique de l’unité dans le dépôt. Tout contenu de leçon, toute manipulation,',
        'tout exercice de pratique cite un `id` d’ici via `source.elementId`.',
        'Transcription VISUELLE (pages rendues à 200 dpi, zooms à 400 dpi sur les passages douteux) ; la formulation arabe est celle du manuel.',
        'Les réponses (`answer`) NE viennent PAS du manuel : elles sont calculées par sympy dans build-extraction.py (`answerSource: computed`).',
        'Les coquilles sont CORRIGÉES dans les leçons (champ `correction`, politique du propriétaire) ; `discrepancies` les liste.',
        'Les `destinations` sont le plan de couverture ; scripts/check-textbook-coverage.mjs le vérifie.',
        'Généré par docs/sources/4am/unit7/build-extraction.py — ne pas éditer à la main.',
    ],
    'unitCode': 'dala-taalufiya',
    'textbook': {'title': 'كتاب الرياضيات — السنة الرابعة من التعليم المتوسط', 'generation': 'الجيل الثاني', 'unitNumber': 7,
                 'unitTitle': 'الدالة التآلفية',
                 'pages': {'first': 77, 'last': 79}, 'pdfPageOffset': 76,
                 'sections': ['سأتعلّم في هذا الباب', 'تحدّ', 'أستعدّ', 'أنشطة']},
    'frozenAt': '2026-10-02',
    'terminology': {'note': 'Le manuel écrit « دالة تآلفية » (pluriel « دوال تآلفية »), « الترميز x ⟼ ax + b », « المعاملين a و b », « صورة عدد », « عدد صورته », « التمثيل البياني », « مستقيم », « الترتيب عند المبدأ » (b), « فاصلة / ترتيب », « تناسب التغيّرات », « الدالة الخطية » (cas b = 0), « جملة معادلتين », « التفسير البياني », « برنامج حساب ».',
                    'terms': ['دالة تآلفية', 'الترميز', 'المعاملان', 'صورة', 'التمثيل البياني', 'مستقيم', 'الترتيب عند المبدأ', 'فاصلة', 'ترتيب', 'تناسب التغيّرات', 'دالة خطية', 'جملة معادلتين', 'التفسير البياني', 'برنامج حساب']},
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
print(f'{out} — {len(E)} éléments')
