#!/usr/bin/env python3
"""Génère docs/sources/4am/unit5/extraction.json — unité 5 « جمل معادلتين من الدرجة الأولى بمجهولين » (pp. 55–63).

Transcription VISUELLE du scan (« وحدة جملة معادلتين من الدرجة الأولى بمجهولين.pdf », 9 pages, sans couche texte),
relue à 300 dpi sur les passages douteux (exercices 6, 8, 12, 13, la figure de l'exercice 21).
Le texte arabe est celui du manuel, au mot près ; les réponses (`answer`) ne viennent PAS du manuel
(il n'a pas de corrigé) : elles sont CALCULÉES ici avec sympy (`answerSource: computed`), jamais
tapées à la main — une coquille de transcription fait échouer la génération.

Usage : python3 docs/sources/4am/unit5/build-extraction.py
"""
import json
from pathlib import Path

import sympy as sp

x, y = sp.symbols('x y')


def S(e):
    """Les décimaux du manuel (4,2 ; 39,5…) sont lus EXACTS : 4.2 → 21/5, jamais un flottant."""
    return e if isinstance(e, sp.Basic) else sp.sympify(str(e).replace(',', '.'), rational=True)


def fmt(e):
    return sp.latex(sp.nsimplify(e)).replace('.', '{,}')


def side(eq):
    l, r = eq.split('=')
    return S(l) - S(r)


def system(e1, e2, u='x', v='y'):
    """Résout la jumla { e1 ; e2 } en (u ; v) : {u, v} exacts, ou 'none' / 'infinite'.
    Vérification indépendante : le couple trouvé est réinjecté dans les DEUX équations."""
    U, V = sp.symbols(f'{u} {v}')
    d1 = side(e1).subs({sp.Symbol(u): U, sp.Symbol(v): V})
    d2 = side(e2).subs({sp.Symbol(u): U, sp.Symbol(v): V})
    for d in (d1, d2):
        assert sp.Poly(d, U, V).total_degree() <= 1, (e1, e2, 'pas du premier degré')
    sol = sp.solve([d1, d2], [U, V], dict=True)
    if not sol:
        return 'none'
    s = sol[0]
    if U not in s or V not in s or s[U].free_symbols or s[V].free_symbols:
        return 'infinite'
    assert sp.simplify(d1.subs(s)) == 0 and sp.simplify(d2.subs(s)) == 0
    return {u: fmt(s[U]), v: fmt(s[V])}


def holds(eq, xv, yv, u='x', v='y'):
    return sp.simplify(side(eq).subs({sp.Symbol(u): S(xv), sp.Symbol(v): S(yv)})) == 0


E = []

E.append({
    'id': 'objectives', 'kind': 'objectives', 'page': 55, 'section': 'سأتعلّم في هذا الباب', 'verified': True,
    'items': [
        'حل جملة معادلتين من الدرجة الأولى بمجهولين جبريا.',
        'حل مشكلات بتوظيف جملة معادلتين من الدرجة الأولى بمجهولين.',
    ],
})

# Abou Kamil : un mois de 30 jours, x jours travaillés, y jours d'arrêt ; 6 dirhams par mois
# complet travaillé, 4 dirhams payés par mois complet d'arrêt — au prorata des jours. Ni reçu ni payé :
# 6x/30 = 4y/30. Lecture déclarée (l'énoncé ne dit pas « au prorata »).
_abu = system('x + y = 30', '6*x = 4*y')
E.append({
    'id': 'history-abu-kamil', 'kind': 'aside', 'page': 55, 'section': 'أبو كامل', 'verified': True,
    'text': 'أبو كامل شجاع بن أسلم محمد (850م - 930م) عالم مصري اهتم بالحساب و الجبر و الهندسة. و يُعرف أيضا باسم كامل الحاسب. من مؤلفاته: «كتاب الجمع و التفريق»، «كتاب المساحة و الهندسة و الجبر»، «كتاب الطرائق في الحساب»... وقد عكف على تطوير أبحاث الخوارزمي وحلّ مسائل كثيرة في الجبر و الهندسة بطرق مبتكرة لم يسبقه إليها أحد. كما أوجد الجذرين الحقيقيين للمعادلة الجبرية ذات الدرجة الثانية و وضع مسألة هذا نصها: «إذا وظفت أجيرا و اشترطت عليه أنه إذا عمل شهرا كاملا يتقاضى 6 دراهم و إذا انقطع عن العمل شهرا كاملا يدفع 4 دراهم و في أحد الشهور عمل و انقطع و في النهاية لم يدفع و لم يتقاض أي درهم. كم يوما عمل في الشهر؟»',
    'caption': 'أبو كامل شجاع',
    'answer': {'reading': 'x أيام العمل و y أيام الانقطاع في شهر من 30 يوما ؛ الأجر والغرامة بالتناسب مع عدد الأيام',
               'system': '\\begin{cases} x + y = 30 \\\\ 6x = 4y \\end{cases}', 'solution': _abu, 'days': 12},
    'discrepancy': 'Énoncé historique sans « au prorata » ni durée du mois : la lecture retenue (mois de 30 jours, salaire et pénalité proportionnels aux jours) est la lecture classique du problème d’Abū Kāmil ; elle donne 12 jours.',
    'answerSource': 'computed',
})
assert _abu == {'x': '12', 'y': '18'}

_ch = system('x + y = 37', '20*x + 10*y = 610')
assert _ch == {'x': '24', 'y': '13'}
E.append({
    'id': 'challenge', 'kind': 'challenge', 'page': 55, 'section': 'تحدّ', 'verified': True,
    'text': 'لتزيين قسمهم، جمع التلاميذ مبلغ 610DA مُشكّلا من 37 قطعة نقدية من فئتي 20DA و 10DA. ما هو عدد القطع النقدية التي جمعها التلاميذ من كل فئة؟',
    'figure': 'صورة قسم دراسي فارغ (صورة فوتوغرافية في الكتاب — لا تُنسخ).',
    'answer': {'unknowns': 'x عدد قطع 20DA و y عدد قطع 10DA', 'system': '\\begin{cases} x + y = 37 \\\\ 20x + 10y = 610 \\end{cases}',
               'solution': _ch, 'check': [24 + 13 == 37, 20 * 24 + 10 * 13 == 610]},
    'answerSource': 'computed',
})

# ── أستعدّ ──────────────────────────────────────────────────────────────────
PREP = [
    ('إذا كان $5x = -3$ فإن $x = -3 - 5$ .', False, 'نقسم على 5 ولا نطرح: $x = -\\dfrac{3}{5}$'),
    ('حل المعادلة $5x = -8$ هو العدد 0.', False, '$5 \\times 0 = 0 \\neq -8$ ؛ الحل هو $-\\dfrac{8}{5}$'),
    ('العلاقة $x + 6 = 6x + 1$ هي معادلة من الدرجة الأولى ذات المجهول $x$ .', True, 'تؤول إلى $-5x = -5$ : المجهول $x$ من الدرجة الأولى'),
    ('حل المعادلة $5x - 5 = 5 - 5x$ هو العدد 5.', False, '$5 \\times 5 - 5 = 20$ و $5 - 5 \\times 5 = -20$ ؛ الحل هو 1'),
    ('من أجل $x = 1$ و $y = 0$ ، المساواة $2x - y = 0$ محققة.', False, '$2 \\times 1 - 0 = 2 \\neq 0$'),
    ('من أجل $x = -3$ و $y = -2$ ، المساواتان $x - 2y = 7$ و $\\dfrac{1}{3}x + \\dfrac{1}{3}y = 0$ محققتان معا.', False, '$-3 - 2 \\times (-2) = 1 \\neq 7$'),
    ('4 هو حل للمعادلة $3 - 2x = 5$ .', False, '$3 - 2 \\times 4 = -5 \\neq 5$ ؛ الحل هو $-1$'),
    ('حل المعادلة $2x + 7 = 3 - x$ هو نفسه حل المعادلة $3x = -4$ .', True, 'ننقل $-x$ و 7: $2x + x = 3 - 7$ أي $3x = -4$'),
    ('إذا كان $y + 2x = 1$ فإنّ $y = 1 + 2x$ .', False, 'نطرح $2x$ من الطرفين: $y = 1 - 2x$'),
    ('إذا كان $y + 2x = 1$ و $x = 3$ فإنّ $y = 5$ .', False, '$y + 6 = 1$ أي $y = -5$'),
]
_xs = sp.Symbol('x')
_prep_truth = [
    sp.solve(S('5*x+3'), _xs) == [S(-3) - 5],
    sp.solve(S('5*x+8'), _xs) == [0],
    sp.degree(sp.expand(S('x+6-(6*x+1)')), _xs) == 1,
    sp.solve(S('5*x-5-(5-5*x)'), _xs) == [5],
    holds('2*x - y = 0', 1, 0),
    holds('x - 2*y = 7', -3, -2) and holds('x/3 + y/3 = 0', -3, -2),
    sp.solve(S('3-2*x-5'), _xs) == [4],
    sp.solve(S('2*x+7-(3-x)'), _xs) == sp.solve(S('3*x+4'), _xs),
    sp.simplify(sp.solve(S('y+2*x-1'), y)[0] - S('1+2*x')) == 0,
    sp.solve(S('y+6-1'), y) == [5],
]
assert [p[1] for p in PREP] == _prep_truth, ('prep: une réponse ne correspond pas au calcul', _prep_truth)
E.append({
    'id': 'prep', 'kind': 'prerequisites', 'page': 55, 'section': 'أستعدّ',
    'instruction': 'أصحيح أم خاطئ؟ برّر إجابتك.', 'verified': True,
    'items': [{'n': i + 1, 'text': t, 'answer': a, 'why': w} for i, (t, a, w) in enumerate(PREP)],
    'answerSource': 'computed',
})

# ── أنشطة ──────────────────────────────────────────────────────────────────
_a1 = system('x + y = 32', '2*(x-5) = y - 3')
assert _a1 == {'x': '13', 'y': '19'} and system('x + y = 32', '2*x - y = 7') == _a1
assert not (holds('x + y = 32', 24, 8) and holds('2*(x-5) = y - 3', 24, 8))
E.append({
    'id': 'act-1', 'kind': 'activity', 'number': 1, 'page': 56, 'section': 'أنشطة', 'title': 'جملة معادلتين من الدرجة الأولى بمجهولين', 'verified': True,
    'text': 'يعمل في مصلحة إدارية 32 عاملا. أُحيل 5 رجال و 3 نساء إلى التقاعد ولم يتم تعويضهم، فأصبح عدد النساء بالمصلحة ضعف عدد الرجال. نريد معرفة عدد الرجال و عدد النساء العاملين بهذه المؤسسة قبل الإحالة على التقاعد.',
    'questions': [
        'أ) هل يمكن أن يكون عدد الرجال 24 وعدد النساء 8؟ اشرح.',
        'ب) نرمز بـ $x$ إلى عدد الرجال وبـ $y$ إلى عدد النساء. بيّن أنّ الوضعية السابقة تُترجم بالمعادلتين الآتيتين معا: $x + y = 32$ ...(1) و $2(x - 5) = y - 3$ ...(2)',
        'جـ) بسط المعادلة (2)، وتحقّق أنّ المعادلتين محققتان معًا من أجل $x = 13$ و $y = 19$ . ولكنّهما غير محققتين معا من أجل $x = 24$ و $y = 8$ .',
        'نقول أنّ $\\begin{cases} x + y = 32 \\\\ 2x - y = 7 \\end{cases}$ هي جملة معادلتين من الدرجة الأولى بمجهولين، والثنائيّة $(13 ; 19)$ هي حل لهذه الجملة.',
        'د) استنتج عدد الرجال و عدد النساء العاملين بهذه المؤسسة قبل الإحالة على التقاعد.',
    ],
    'answer': {
        'a': {'possible': False, 'why': 'بعد التقاعد: 19 رجلا و 5 نساء، و 5 ليست ضعف 19', 'check': [24 - 5 == 19, 8 - 3 == 5, 2 * 19 != 5]},
        'c': {'simplified': '2x - y = 7', 'solution': _a1},
        'd': {'men': 13, 'women': 19},
    },
    'answerSource': 'computed',
})

_a2 = system('2*x + y = 7', '3*x - 2*y = 4.2')
assert _a2 == {'x': '\\frac{13}{5}', 'y': '\\frac{9}{5}'}  # 2,6 et 1,8
_a2q2 = system('x + 4*y = 7', '5*x + 3*y = 1')
assert _a2q2 == {'x': '-1', 'y': '2'}
E.append({
    'id': 'act-2', 'kind': 'activity', 'number': 2, 'page': 56, 'section': 'أنشطة', 'title': 'حل جملة معادلتين من الدرجة الأولى بمجهولين جبريا', 'verified': True,
    'text': 'إليك جملة المعادلتين الآتية: $\\begin{cases} 2x + y = 7 & ...(1) \\\\ 3x - 2y = 4{,}2 & ...(2) \\end{cases}$',
    'questions': [
        'أ) تحقق أنّ الثنائيّة $(2 ; 3)$ حل للمعادلة (1)؟ هل هي حل لجملة المعادلتين؟',
        'ب) اقترح ثنائية أخرى حلا للمعادلة (1). هل هي حل لجملة المعادلتين؟',
        'جـ) لحل هذه الجملة كتب تلميذان:',
        '1) اشرح عمل كل من التلميذين، واستنتج حل الجملة.',
        '2) حل باستعمال الطريقتين السّابقتين جملة المعادلتين الآتية: $\\begin{cases} x + 4y = 7 \\\\ 5x + 3y = 1 \\end{cases}$',
    ],
    'figure': 'التلميذ 1: من المعادلتين (1) و (2) نحصل على المعادلة: $3x - 2(7 - 2x) = 4{,}2$ وهي معادلة من الدرجة الأولى بالمجهول $x$ . وبحلها نجد $x = 2{,}6$ . وبالتعويض في إحدى المعادلتين (1) أو (2) نجد $y = 1{,}8$ . — التلميذ 2: بضرب المعادلة (1) في العدد 2 نجد $4x + 2y = 14$ وبالجمع مع المعادلة (2) طرفا الى طرف نجد المعادلة ذات المجهول $x$ : $7x = 18{,}2$ وهي المعادلة من الدرجة الأولى وبحلّها نجد $x = 2{,}6$ . وبالتعويض في إحدى المعادلتين (1) أو (2) نجد $y = 1{,}8$ .',
    'answer': {
        'a': {'eq1': holds('2*x + y = 7', 2, 3), 'eq2': holds('3*x - 2*y = 4.2', 2, 3), 'solutionOfSystem': False},
        'student1': {'method': 'التعويض', 'substituted': '3x - 2(7 - 2x) = 4{,}2', 'x': '2{,}6', 'check': sp.solve(S('3*x-2*(7-2*x)-4.2'), _xs) == [S('2.6')]},
        'student2': {'method': 'الجمع', 'scaled': '4x + 2y = 14', 'sum': '7x = 18{,}2', 'check': sp.solve(S('7*x-18.2'), _xs) == [S('2.6')]},
        'c1': _a2, 'c2': _a2q2,
    },
    'answerSource': 'computed',
})
assert holds('2*x + y = 7', 2, 3) and not holds('3*x - 2*y = 4.2', 2, 3)

_a3 = system('x + y = 140', '300*x + 150*y = 30300')
assert _a3 == {'x': '62', 'y': '78'}
E.append({
    'id': 'act-3', 'kind': 'activity', 'number': 3, 'page': 57, 'section': 'أنشطة', 'title': 'حل مشكلات بتوظيف جمل معادلتين من الدرجة الأولى بمجهولين', 'verified': True,
    'text': 'يقترح متحف تذكرتين لعطلة نهاية الأسبوع: • 300 DA للبالغين. • 150 DA للصّغار. في هذا اليوم، استقبل المتحف 140 زائرا وبلغت مداخيله 30 300 DA. أوجد عدد البالغين وعدد الصغار الذين زاروا المتحف هذا اليوم.',
    'figure': 'صورة «المتحف الوطني للمجاهد» (صورة فوتوغرافية في الكتاب — لا تُنسخ).',
    'table': [
        {'stage': '1) اختيار المجاهيل.', 'task': 'ما هي المجاهيل في هذه المشكلة؟'},
        {'stage': '2) ترجمة المشكلة بجملة معادلتين.', 'task': 'عبّر بدلالة المجاهيل السابقة عن المعلومة «استقبل المتحف 140 زائرا»'},
        {'stage': '2) ترجمة المشكلة بجملة معادلتين.', 'task': 'عبّر بدلالة المجاهيل السابقة عن المعلومة «بلغت مداخيل المتحف 30300DA»'},
        {'stage': '2) ترجمة المشكلة بجملة معادلتين.', 'task': 'ما هي جملة المعادلتين التي تترجم معطيات المشكلة؟'},
        {'stage': '3) حل الجملة', 'task': 'حل جملة المعادلتين باختيار طريقة مناسبة.'},
        {'stage': '4) تحقق', 'task': 'تحقق من صحة النتيجة.'},
        {'stage': '5) الإجابة', 'task': 'ترجم النتيجة واجب عن السؤال.'},
    ],
    'tableColumns': ['مراحل (خطوات) الحل', 'المهمات', 'حل'],
    'answer': {
        'unknowns': 'x عدد البالغين و y عدد الصغار', 'eq1': 'x + y = 140', 'eq2': '300x + 150y = 30300',
        'solution': _a3, 'check': [62 + 78 == 140, 300 * 62 + 150 * 78 == 30300],
        'answer': 'زار المتحف 62 بالغا و 78 صغيرا.',
    },
    'answerSource': 'computed',
})

# ── معارف ──────────────────────────────────────────────────────────────────
assert holds('x - y = 2', 2, 0) and holds('2*x - 5*y = 4', 2, 0)
assert holds('x - y = 2', 3, 1) and not holds('2*x - 5*y = 4', 3, 1)
assert not holds('x - y = 2', 0, 2)
E.append({
    'id': 'know-1', 'kind': 'knowledge', 'page': 58, 'section': 'معارف', 'title': 'جملة معادلتين من الدرجة الأولى بمجهولين', 'verified': True,
    'definition': 'نسمّي جملة معادلتين من الدرجة الأولى بمجهولين $x$ و $y$ كل جملة من الشكل $\\begin{cases} ax + by = c \\\\ a\'x + b\'y = c\' \\end{cases}$ حيث $a$ ، $b$ ، $c$ و $a\'$ ، $b\'$ ، $c\'$ أعداد معلومة.',
    'example': 'الجملة $\\begin{cases} x - y = 2 \\\\ 2x - 5y = 4 \\end{cases}$ هي جملة معادلتين من الدرجة الأولى، حيث $a = 1$ ، $b = -1$ ، $c = 2$ و $a\' = 2$ ، $b\' = -5$ ، $c\' = 4$',
})
E.append({
    'id': 'know-2', 'kind': 'knowledge', 'page': 58, 'section': 'معارف', 'title': 'حل جملة معادلتين من الدرجة الأولى بمجهولين جبريا', 'verified': True,
    'definition': 'نسمّي حلا للجملة $\\begin{cases} ax + by = c \\\\ a\'x + b\'y = c\' \\end{cases}$ : كل ثنائية $(x_0 ; y_0)$ تكون من أجلها معادلتا الجملة محققتين في آن واحد.',
    'rule': 'حل جملة، يعني إيجاد كلّ الثنائيات $(x ; y)$ التي من أجلها تكون معادلتا الجملة محققتين في آن واحد.',
    'examples': [
        'في المثال أعلاه: • من أجل $x = 2$ و $y = 0$ نجد: $2 - 0 = 2$ و $2(2) - 5(0) = 4$ منه الثنائية $(2 ; 0)$ حل للجملة.',
        '• من أجل $x = 3$ و $y = 1$ نجد: $3 - 1 = 2$ و $2(3) - 5(1) \\neq 4$ منه الثنائية $(3 ; 1)$ ليست حلا للجملة.',
    ],
    'note': 'ملاحظة: في الثنائية $(x ; y)$ الترتيب مهم، فمثلا: إنّ الثنائية $(2 ; 0)$ تختلف عن الثنائية $(0 ; 2)$ ففي الثنائية $(2 ; 0)$ لدينا $x = 2$ و $y = 0$ بينما في الثنائية $(0 ; 2)$ لدينا $x = 0$ و $y = 2$ وهي ليست حلا للجملة في المثال أعلاه.',
})
assert system('4*x + 6*y = 2', '-2*x - 3*y = -1') == 'infinite'
assert system('2*x - y = 0', '-x + y/2 = -2') == 'none'
assert sp.simplify(side('-x + y/2 = -2') * -2 - side('2*x - y = 4')) == 0
E.append({
    'id': 'know-cases', 'kind': 'knowledge', 'page': 58, 'section': 'معارف', 'title': 'حالات خاصة', 'verified': True,
    'items': [
        '1) الجملة $\\begin{cases} 4x + 6y = 2 \\\\ -2x - 3y = -1 \\end{cases}$ تبسّط إلى الشكل $\\begin{cases} 2x + 3y = 1 \\\\ 2x + 3y = 1 \\end{cases}$ أي معادلة واحدة بمجهولين $2x + 3y = 1$ وفيها يمكن حساب قيمة $y$ من أجل أي قيمة نعطيها لـ $x$ ، إذن الجملة المعتبرة لها عدد غير منته من الحلول.',
        '2) الجملة $\\begin{cases} 2x - y = 0 \\\\ -x + \\dfrac{y}{2} = -2 \\end{cases}$ تبسّط إلى الشكل $\\begin{cases} 2x - y = 0 \\\\ 2x - y = 4 \\end{cases}$ وهذا غير ممكن. إذن الجملة المعتبرة ليس لها حلول.',
    ],
    'answer': {'1': 'infinite', '2': 'none'},
    'answerSource': 'computed',
})

# ── طرائق ──────────────────────────────────────────────────────────────────
_m1 = system('3*x + y = -4', 'x - y = 2')
_m2 = system('4*x + 2*y = 9', '-4*x + 3*y = 6')
assert _m1 == {'x': '- \\frac{1}{2}', 'y': '- \\frac{5}{2}'} and _m2 == {'x': '\\frac{3}{4}', 'y': '3'}
E.append({
    'id': 'method-example', 'kind': 'method', 'page': 59, 'section': 'طرائق', 'title': 'حل جملة معادلتين من الدرجة الأولى بمجهولين', 'verified': True,
    'exercise': 'حل كل من الجملتين: $\\begin{cases} 3x + y = -4 \\\\ x - y = 2 \\end{cases}$ ....(1) و $\\begin{cases} 4x + 2y = 9 \\\\ -4x + 3y = 6 \\end{cases}$ ....(2)',
    'solution1': [
        'حل الجملة (1) بطريقة التعويض.',
        'من المعادلة $x - y = 2$ ينتج أن $y = x - 2$ .',
        'بتعويض $y$ بالعبارة $x - 2$ في المعادلة $3x + y = -4$ نجد: $3x + (x - 2) = -4$ . هذه المعادلة تبسّط على الشكل $4x - 2 = -4$ . إذن $4x = -2$ . بالتالي $x = -\\dfrac{1}{2}$',
        'نعوض $x$ بالعدد $-\\dfrac{1}{2}$ في المعادلة $y = x - 2$ ونجد $y = -\\dfrac{1}{2} - 2$ . بالتالي $y = -\\dfrac{5}{2}$ . إذن $x = -\\dfrac{1}{2}$ و $y = -\\dfrac{5}{2}$ .',
        'للتحقق، نعوض $x$ بالعدد $-\\dfrac{1}{2}$ و $y$ بالعدد $-\\dfrac{5}{2}$ في الجملة المعطاة ونجد: $3\\left(-\\dfrac{1}{2}\\right) - \\dfrac{5}{2} = -4$ و $-\\dfrac{1}{2} - \\left(-\\dfrac{5}{2}\\right) = 2$ بالتالي الثنائية $\\left(-\\dfrac{1}{2} ; -\\dfrac{5}{2}\\right)$ تحقق الجملة (1).',
        'إذن الثنائية $\\left(-\\dfrac{1}{2} ; -\\dfrac{5}{2}\\right)$ هي الحل الوحيد للجملة.',
    ],
    'solution2': [
        'حل الجملة (2) بطريقة الجمع والتعويض.',
        'بجمع المعادلتين في الجملة (2) طرفا بطرف، نحصل على: $5y = 15$ . منه $y = 3$ .',
        'بالتعويض عن قيمة $y$ في إحدى المعادلتين، نجد: $4x + 2 \\times 3 = 9$ . منه $x = \\dfrac{3}{4}$ .',
        'للتحقق، نعوّض $x$ بالقيمة $\\dfrac{3}{4}$ و $y$ بالقيمة 3 في المعادلتين ونجد: $4\\left(\\dfrac{3}{4}\\right) + 2 \\times 3 = 9$ و $-4\\left(\\dfrac{3}{4}\\right) + 3 \\times 3 = 6$ أي أنّ الثنائية $\\left(\\dfrac{3}{4} ; 3\\right)$ تحقق الجملة (2).',
        'إذن الثنائية $\\left(\\dfrac{3}{4} ; 3\\right)$ هي الحل الوحيد للجملة.',
    ],
    'answer': {'1': _m1, '2': _m2},
    'answerSource': 'computed',
})
E.append({
    'id': 'method-systems', 'kind': 'method', 'page': 59, 'section': 'طرائق', 'title': 'طريقة', 'verified': True,
    'text': 'لحل جملة معادلتين من الدرجة الأولى بمجهولين، يمكن استعمال إحدى الطريقتين:',
    'items': [
        'طريقة التعويض: بالتعبير عن أحد المجهولين بدلالة الآخر من إحدى المعادلتين، ثم تعويض ذلك المجهول بالعبارة الناتجة في المعادلة الأخرى.',
        'طريقة الجمع: نضرب طرفي كل معادلة بمعامل مناسب ثم نجمع المعادلتين طرفًا لطرف للحصول على معادلة من الدرجة الأولى بمجهول واحد.',
    ],
})
_n1 = system('2*x + y = 6', 'x/2 - y = -2')
_n2 = system('6*x - 2*y = 8', 'x + 3*y = 1')
assert _n1 == {'x': '\\frac{8}{5}', 'y': '\\frac{14}{5}'} and _n2 == {'x': '\\frac{13}{10}', 'y': '- \\frac{1}{10}'}
E.append({
    'id': 'now-59', 'kind': 'exercise', 'page': 59, 'section': 'دوري الآن', 'verified': True,
    'text': 'حل الجملتين الآتيتين مبيّنا طريقة الحل المستعملة. $\\begin{cases} 2x + y = 6 \\\\ \\dfrac{1}{2}x - y = -2 \\end{cases}$ ، $\\begin{cases} 6x - 2y = 8 \\\\ x + 3y = 1 \\end{cases}$',
    'answer': {'1': _n1, '1decimal': '(1{,}6 ; 2{,}8)', '2': _n2, '2decimal': '(1{,}3 ; -0{,}1)'},
    'answerSource': 'computed',
})

# ── أوظّف تعلّماتي ─────────────────────────────────────────────────────────
G1 = 'المعادلات من الدرجة الأولى بمجهولين'
G2 = 'جمل معادلتين من الدرجة الأولى بمجهولين'
G3 = 'حل مشكلات باستعمال جمل معادلتين'


def exercise(n, page, group, text, section='أوظّف تعلّماتي', **extra):
    d = {'id': f'ex-{n}', 'kind': 'exercise', 'number': n, 'page': page, 'section': section, 'group': group, 'verified': True, 'text': text}
    d.update(extra)
    d['answerSource'] = 'computed'
    return d


def systems(*pairs, u='x', v='y'):
    return [{'tex': t, 'solution': system(a, b, u, v)} for t, a, b in pairs]


E.append(exercise(1, 60, G1, 'نعتبر المعادلة من الدرجة الأولى بمجهولين الآتية: $x - 2y = 7$ . اذكر إن كانت كلّ من الثنائيات الآتية حلا لهذه المعادلة. علل. أ) $(0 ; 1)$ ب) $(7 ; 0)$ جـ) $(1 ; -3)$',
                  answer={'(0;1)': holds('x - 2*y = 7', 0, 1), '(7;0)': holds('x - 2*y = 7', 7, 0), '(1;-3)': holds('x - 2*y = 7', 1, -3)}))
_E2 = [('أ', '3*x + 2*y = -1', '$3x + 2y = -1$'), ('ب', '3*x + 5*y = 1', '$3x + 5y = 1$'), ('جـ', 'x - 2*y = 4', '$x - 2y = 4$'),
       ('د', 'x - y = 2', '$x - y = 2$'), ('هـ', '5*x + 3*y = 1', '$5x + 3y = 1$')]
_P2 = [('0.5', '-1.5', '$(0{,}5 ; -1{,}5)$'), ('0', '-2', '$(0 ; -2)$'), ('0', '1/3', '$\\left(0 ; \\dfrac{1}{3}\\right)$'),
       ('1', '-2', '$(1 ; -2)$'), ('1/5', '0', '$\\left(\\dfrac{1}{5} ; 0\\right)$')]
_m2 = {k: [tp for (px, py, tp) in _P2 if holds(e, px, py)] for (k, e, _) in _E2}
assert _m2 == {'أ': ['$(1 ; -2)$'], 'ب': [], 'جـ': ['$(0 ; -2)$'], 'د': ['$(0{,}5 ; -1{,}5)$', '$(0 ; -2)$'],
               'هـ': ['$\\left(0 ; \\dfrac{1}{3}\\right)$', '$\\left(\\dfrac{1}{5} ; 0\\right)$']}
E.append(exercise(2, 60, G1, 'أرفق بكل معادلة الثنائية أو الثنائيات (في حالة وجودها) التي هي حلول لها فيما يأتي:',
                  equations=[f'{k}) {t}' for (k, _, t) in _E2], pairs=[tp for (_, _, tp) in _P2],
                  answer={'matching': _m2, 'note': 'المعادلة ب) لا تقبل أيا من الثنائيات المقترحة.'}))
E.append(exercise(3, 60, G1, '1) اذكر حلين مختلفين لكل معادلة من المعادلات الآتية: أ) $x - y = 0$ ب) $4x + 2y = 5$ جـ) $4x - 5y = -2$ . 2) عيّن ذهنيا الثنائية حل كلّ جملة: أ) $\\begin{cases} x = \\dfrac{1}{3} \\\\ 3x - y = 4 \\end{cases}$ ب) $\\begin{cases} y = x - 1 \\\\ y = 2x \\end{cases}$',
                  answer={'1': {'examples': {'أ': ['(0 ; 0)', '(1 ; 1)'], 'ب': ['(0 ; 2{,}5)', '(1 ; 0{,}5)'], 'جـ': ['(2 ; 2)', '(-0{,}5 ; 0)']},
                                'check': [holds('x - y = 0', 1, 1), holds('4*x + 2*y = 5', 0, 2.5), holds('4*x + 2*y = 5', 1, 0.5),
                                          holds('4*x - 5*y = -2', 2, 2), holds('4*x - 5*y = -2', -0.5, 0)]},
                          '2': {'أ': system('x = 1/3', '3*x - y = 4'), 'ب': system('y = x - 1', 'y = 2*x')}}))
E.append(exercise(4, 60, G2, 'أ) هل الثنائية $(3 ; -2)$ حل للجملة $\\begin{cases} 2x + y = 4 \\\\ x + y = 3 \\end{cases}$ ؟ ب) نفس السؤال من أجل الثنائية $(1 ; 2)$ .',
                  answer={'(3;-2)': {'eq1': holds('2*x + y = 4', 3, -2), 'eq2': holds('x + y = 3', 3, -2), 'solution': False},
                          '(1;2)': {'eq1': holds('2*x + y = 4', 1, 2), 'eq2': holds('x + y = 3', 1, 2), 'solution': True}}))
assert holds('2*x + y = 4', 3, -2) and not holds('x + y = 3', 3, -2) and system('2*x + y = 4', 'x + y = 3') == {'x': '1', 'y': '2'}
E.append(exercise(5, 60, G2, 'حل الجملتين الآتيتين باستعمال طريقة التعويض.', items=systems(
    ('أ) $\\begin{cases} x + 3y = 10 \\\\ 3x + 5y = 18 \\end{cases}$', 'x + 3*y = 10', '3*x + 5*y = 18')) + systems(
    ('ب) $\\begin{cases} 3a + 2b = 0 \\\\ 6a + 3b = -24 \\end{cases}$', '3*a + 2*b = 0', '6*a + 3*b = -24'), u='a', v='b')))
E.append(exercise(6, 60, G2, 'نفس التمرين مع الجملتين:', items=systems(
    ('أ) $\\begin{cases} 2x - 3y = 1 \\\\ 3x + 5y = 21 \\end{cases}$', '2*x - 3*y = 1', '3*x + 5*y = 21')) + systems(
    ('ب) $\\begin{cases} d = 90t \\\\ d + 50t = 280 \\end{cases}$', 'd = 90*t', 'd + 50*t = 280'), u='d', v='t'),
    note='أ) : القيم غير صحيحة ($\\dfrac{68}{19}$ و $\\dfrac{39}{19}$) — مقروءة بتكبير 300 dpi، ليست خطأ استخراج.'))
E.append(exercise(7, 60, G2, 'حل الجملتين الآتيتين باستعمال طريقة الجمع والتعويض.', items=systems(
    ('أ) $\\begin{cases} -x + 3y = 2 \\\\ 2x + y = 3 \\end{cases}$', '-x + 3*y = 2', '2*x + y = 3'),
    ('ب) $\\begin{cases} 5x + 4y = 16 \\\\ 3x + 6y = 15 \\end{cases}$', '5*x + 4*y = 16', '3*x + 6*y = 15'))))
E.append(exercise(8, 60, G2, 'نفس التمرين مع الجملتين:', items=systems(
    ('أ) $\\begin{cases} 2x - y = 1 \\\\ 3x + 5y = 21 \\end{cases}$', '2*x - y = 1', '3*x + 5*y = 21'),
    ('ب) $\\begin{cases} 3x + 7y = 11 \\\\ -5x + 2y = 5 \\end{cases}$', '3*x + 7*y = 11', '-5*x + 2*y = 5')),
    note='ب) : القيم غير صحيحة ($-\\dfrac{13}{41}$ و $\\dfrac{70}{41}$) — مقروءة بتكبير 300 dpi.'))
E.append(exercise(9, 60, G2, 'حل الجملتين الآتيتين باستعمال طريقة من اختيارك.', items=systems(
    ('أ) $\\begin{cases} -2x + y = 0 \\\\ 3x - y = 4 \\end{cases}$', '-2*x + y = 0', '3*x - y = 4'),
    ('ب) $\\begin{cases} \\dfrac{x}{6} - y = -1 \\\\ 3x - 2y = 6 \\end{cases}$', 'x/6 - y = -1', '3*x - 2*y = 6'))))
E.append(exercise(10, 60, G2, 'نفس التمرين السابق مع الجملتين:', items=systems(
    ('أ) $\\begin{cases} 3x = 2y \\\\ y = 3(x - 3) \\end{cases}$', '3*x = 2*y', 'y = 3*(x - 3)'),
    ('ب) $\\begin{cases} x = y \\\\ 3x + 2y = 0 \\end{cases}$', 'x = y', '3*x + 2*y = 0'))))
E.append(exercise(11, 60, G2, 'حل كلّ جملة باختيار طريقة مناسبة.', items=systems(
    ('أ) $\\begin{cases} x + y = 12 \\\\ 3x + 2y = 31 \\end{cases}$', 'x + y = 12', '3*x + 2*y = 31'),
    ('ب) $\\begin{cases} 4x - 3y = 1 \\\\ 12x - y = -5 \\end{cases}$', '4*x - 3*y = 1', '12*x - y = -5'),
    ('جـ) $\\begin{cases} 6x - 5y = 0 \\\\ 2x - y = 12 \\end{cases}$', '6*x - 5*y = 0', '2*x - y = 12')) + systems(
    ('د) $\\begin{cases} a - b = 6 \\\\ 3a - \\dfrac{b}{2} = 3 \\end{cases}$', 'a - b = 6', '3*a - b/2 = 3'), u='a', v='b')))
E.append(exercise(12, 61, G2, 'حلّ الجملة باستعمال طريقة من اختيارك. $\\begin{cases} x + 3y = 7 \\\\ 5y - 2 = 3(x - 1) \\end{cases}$',
                  answer={'reduced': '3x - 5y = 1', 'solution': system('x + 3*y = 7', '5*y - 2 = 3*(x - 1)')}))
E.append(exercise(13, 61, G2, 'السؤال نفسه مع الجملة: $\\begin{cases} x - 2y = 1 \\\\ -3(x - y) = 6 \\end{cases}$',
                  answer={'reduced': 'x - y = -2', 'solution': system('x - 2*y = 1', '-3*(x - y) = 6')}))

# Problèmes : chaque énoncé est REJOUÉ (force brute sur les entiers) indépendamment de la jumla.
_p14 = system('a + b = 133', '7*(a + 5) = 4*(b + 5)', 'a', 'b')
assert _p14 == {'a': '47', 'b': '86'} and sp.Rational(47 + 5, 86 + 5) == sp.Rational(4, 7)
E.append(exercise(14, 61, G3, 'مجموع عددين $a$ و $b$ هو 133. إذا أضفنا إلى كل منهما 5، أصبحت نسبتهما $\\dfrac{4}{7}$ . ما هما العددان؟',
                  answer={'system': '\\begin{cases} a + b = 133 \\\\ 7(a + 5) = 4(b + 5) \\end{cases}', 'solution': _p14}))
_p15 = system('a + 2 = 3*b', 'a - 2 = 4*b', 'a', 'b')
assert _p15 == {'a': '-14', 'b': '-4'} and sp.Rational(-12, -4) == 3 and sp.Rational(-16, -4) == 4
E.append(exercise(15, 61, G3, 'نعتبر النسبة $\\dfrac{a}{b}$ حيث $b \\neq 0$ . إذا أضفنا 2 إلى البسط $a$ ، تكون النسبة تساوي 3. إذا أنقصنا 2 من البسط $a$ ، تكون النسبة تساوي 4. ما هي هذه النسبة؟',
                  answer={'system': '\\begin{cases} a + 2 = 3b \\\\ a - 2 = 4b \\end{cases}', 'solution': _p15, 'ratio': '\\frac{-14}{-4} = \\frac{7}{2}'}))
_p16 = system('x + y = 206', 'x = 4*y + 1')
assert _p16 == {'x': '165', 'y': '41'} and 165 % 41 == 1 and 165 // 41 == 4
E.append(exercise(16, 61, G3, 'عددان مجموعهما يساوي 206. عند قسمة أكبرهما على أصغرهما، يكون حاصل القسمة 4 وباقي القسمة 1 . ما هما العددان؟',
                  answer={'system': '\\begin{cases} x + y = 206 \\\\ x = 4y + 1 \\end{cases}', 'solution': _p16}))
_p17 = system('x - y = 24', 'x + 8 = 3*(y + 8)')
assert _p17 == {'x': '28', 'y': '4'}
E.append(exercise(17, 61, G3, 'الفرق بين عددين هو 24. إذا أضفنا 8 إلى كل من العددين، نحصل على عددين آخرين أكبرهما هو ثلاث مرات أكثر من أصغرهما. ما هما العددان؟',
                  answer={'system': '\\begin{cases} x - y = 24 \\\\ x + 8 = 3(y + 8) \\end{cases}', 'solution': _p17}))
_p18 = system('2*(x + y) = 220', '(x - 2)*(y + 2) - x*y = 16')
assert _p18 == {'x': '60', 'y': '50'} and (60 - 2) * (50 + 2) - 60 * 50 == 16
E.append(exercise(18, 61, G3, 'حقل مستطيل الشكل محيطه يساوي 220m. عند إنقاص 2m من طوله وزيادة 2m إلى عرضه، تزداد مساحته بـ $16m^2$ . ما هما بعدا الحقل في البداية؟',
                  answer={'system': '\\begin{cases} x + y = 110 \\\\ 2x - 2y = 20 \\end{cases}', 'solution': _p18, 'note': '$(x - 2)(y + 2) = xy + 16$ تؤول إلى $2x - 2y - 4 = 16$ : الحد $xy$ يختفي.'}))
_p19 = system('x + 2*y = 180', 'y = 2*x')
assert _p19 == {'x': '36', 'y': '72'}
E.append(exercise(19, 61, G3, 'في الشكل الآتي، المثلث ABC متقايس الساقين. (d) منصّف الزاوية $\\widehat{C}$ يقطع [AB] في D و AD = DC. عيّن $x$ و $y$ قيسي الزاويتين $\\widehat{A}$ و $\\widehat{B}$ .',
                  figure='مثلث ABC رأسه A ؛ $\\widehat{A} = x$ و $\\widehat{B} = y$ ؛ المستقيم (d) يمرّ بـ C ويقطع [AB] في D ؛ علامتا تقايس على AB و AC.',
                  answer={'reasoning': 'ABC متقايس الساقين رأسه A: $\\widehat{C} = \\widehat{B} = y$ ؛ ADC متقايس الساقين (AD = DC): $\\widehat{ACD} = \\widehat{A} = x$ ؛ (d) منصّف: $\\widehat{C} = 2x$ ؛ مجموع الزوايا: $x + 2y = 180$',
                          'system': '\\begin{cases} x + 2y = 180 \\\\ y = 2x \\end{cases}', 'solution': _p19}))
_p20 = system('x + y = 36', '4*x + 2*y = 90')
assert _p20 == {'x': '9', 'y': '27'}
E.append(exercise(20, 61, G3, 'يريد فلّاح أن يعرف عدد الأرانب وعدد الدجاج في مزرعته. عندما عدّ الرؤوس، وجد 36 رأسا. عندما عدّ السيقان، وجد 90 ساقا. ما هو عدد الأرانب وعدد الدجاج في المزرعة؟',
                  answer={'unknowns': 'x عدد الأرانب و y عدد الدجاج', 'system': '\\begin{cases} x + y = 36 \\\\ 4x + 2y = 90 \\end{cases}', 'solution': _p20}))
# Thalès (3AM) : (AD) ∥ (BC) dans le triangle EBC, EA = 10, AB = 4, DC = 5 → AD/BC = EA/EB = 10/14.
_p21 = system('x + y = 13.8 - 9', '14*y = 10*x')
assert _p21 == {'x': '\\frac{14}{5}', 'y': '2'}
E.append(exercise(21, 61, G3, 'وحدة الطول هي السنتيمتر، والأطوال على الشكل ليست حقيقية. علما أنّ ABCD شبه منحرف محيطه يساوي 13,8cm احسب كلا من $x$ و $y$ .',
                  figure='مثلث EBC ؛ A على [EB] و D على [EC] ؛ EA = 10cm ، AB = 4cm ، DC = 5cm ، AD = $y$ ، BC = $x$ ؛ (AD) يوازي (BC).',
                  answer={'reasoning': 'المحيط: $4 + 5 + x + y = 13{,}8$ ؛ طالس في المثلث EBC: $\\dfrac{AD}{BC} = \\dfrac{EA}{EB} = \\dfrac{10}{14}$',
                          'system': '\\begin{cases} x + y = 4{,}8 \\\\ 14y = 10x \\end{cases}', 'solution': _p21, 'decimal': '(2{,}8 ; 2)'},
                  correction={'decidedBy': 'owner', 'decidedOn': '2026-10-07', 'printed': 'EA = 10cm ، AB = 4cm ، DC = 5cm ، محيط ABCD = 13,8cm', 'corrected': 'EA = 6cm ، AB = 4cm ، DC = 5cm ، محيط ABCD = 25cm', 'note': 'بالمعطيات المطبوعة المثلث EBC غير موجود: EB = 14 ، BC = 2,8 ، EC = 17,5 و 14 + 2,8 < 17,5 . بالمعطيات المصحّحة: $x = 10$ و $y = 6$ ، والمثلثان (10 ; 10 ; 12,5) و (6 ; 6 ; 7,5) موجودان (نفس معطيات تمرين الممارسة l4-003).'}))

# ── أؤكّد تعلّماتي ─────────────────────────────────────────────────────────
assert holds('x - 3*y = 0', 0, 0) and holds('3*x + y = 0', 0, 0) and not holds('x/3 - y = 3', 0, 0)
assert holds('x + y = 0', '1/2', '-1/2') and not holds('2*x - y/2 = 0', '1/2', '-1/2') and not holds('x/2 + y - 1/4 = 0', '1/2', '-1/2')
assert system('3*x - y = -1', '3*x + y = 5') == {'x': '\\frac{2}{3}', 'y': '3'}
assert system('x + y = 180', 'x = y + 15') == {'x': '\\frac{195}{2}', 'y': '\\frac{165}{2}'}
assert system('y = 180 - x', 'y + x = 15') == 'none'
E.append({
    'id': 'qcm', 'kind': 'qcm', 'page': 62, 'section': 'أؤكّد تعلّماتي', 'verified': True,
    'instruction': 'في كل حالة مما يلي اختر الإجابة أو الإجابات الصحيحة، وبرّر اختيارك.',
    'items': [
        {'n': 1, 'text': 'المعادلة $8x - 1 = y$ هي معادلة من الدرجة الأولى ...', 'options': ['ذات المجهول $x$ .', 'ذات المجهولين $x$ و $y$ .', 'ذات المجهول $y$ .'], 'correct': [1], 'backToPage': [58]},
        {'n': 2, 'text': 'الثنائية $(0 ; 0)$ هي حل للمعادلة ...', 'options': ['$3x + y = 0$', '$x - 3y = 0$', '$\\dfrac{1}{3}x - y = 3$'], 'correct': [0, 1], 'backToPage': [58]},
        {'n': 3, 'text': 'الثنائية $\\left(\\dfrac{1}{2} ; -\\dfrac{1}{2}\\right)$ هي حل للمعادلة...', 'options': ['$x + y = 0$', '$2x - \\dfrac{1}{2}y = 0$', '$\\dfrac{1}{2}x + y - \\dfrac{1}{4} = 0$'], 'correct': [0], 'backToPage': [58]},
        {'n': 4, 'text': 'الجملة $\\begin{cases} 2a - b = 3 \\\\ a - 2b = -5 \\end{cases}$ ...', 'options': ['هي جملة معادلتين ذات مجهول واحد.', 'ليست جملة معادلتين من الدرجة الأولى.', 'هي جملة معادلتين من الدرجة الأولى ذات المجهولين $a$ و $b$ .'], 'correct': [2], 'backToPage': [58]},
        {'n': 5, 'text': 'إليك الجملة الآتية: $\\begin{cases} 3x - y = -1 \\\\ 3x + y = 5 \\end{cases}$ حل هذه الجملة هو...', 'options': ['$(1 ; 4)$', '$(4 ; 1)$', '$\\left(\\dfrac{2}{3} ; 3\\right)$'], 'correct': [2], 'backToPage': [59]},
        {'n': 6, 'text': 'من المعادلة $3x - y = 1$ ينتج أن...', 'options': ['$y = 3x - 1$', '$x = \\dfrac{y + 1}{3}$', '$3x = y + 1$'], 'correct': [0, 1, 2], 'backToPage': [58]},
        {'n': 7, 'text': '$x$ و $y$ قيسا زاويتين متكاملتين بالدرجات. يزيد $x$ عن $y$ بـ $15°$ . لإيجاد $x$ و $y$ ، نحل الجملة الآتية:',
         'options': ['$\\begin{cases} x + y = 180 \\\\ x = y + 15 \\end{cases}$', '$\\begin{cases} y + x = 90 \\\\ y + 15 = x \\end{cases}$', '$\\begin{cases} y = 180 - x \\\\ y + x = 15 \\end{cases}$'], 'correct': [0], 'backToPage': [58, 59]},
    ],
    'answer': {'5': system('3*x - y = -1', '3*x + y = 5'), '7': system('x + y = 180', 'x = y + 15')},
    'answerSource': 'computed',
})

# ── أدمج تعلّماتي ──────────────────────────────────────────────────────────
_sit = system('150*x + 150*y = 11250', '24*x + 30*y = 2100')
assert _sit == {'x': '25', 'y': '50'}
E.append({
    'id': 'situation', 'kind': 'situation', 'page': 62, 'section': 'أدمج تعلّماتي', 'title': 'وضعية', 'verified': True,
    'text': 'بمناسبة الاحتفال بالمولد النبوي الشريف، نظمت بلدية حفل استقبال لفائدة التلاميذ النجباء للمؤسسات التعليمية التابعة لها، حضره ممثلون عن قطاع التربية وبعض الأولياء. بهذه المناسبة، اقتنت البلدية 150 علبة عصير برتقال و 150 قطعة حلوى متماثلة ودفعت 11 250 DA لكل المصاريف. في نهاية الحفل، بقيت 24 علبة عصير و30 قطعة حلوى ثمنها معا 2 100 DA. ما هو سعر علبة عصير وسعر قطعة حلوى؟',
    'analysis': [
        'قراءة الوضعية وفهمها: • قراءة نص المشكل وتحديد المعطيات والمطلوب. • كيف تجد روابط بين المعطيات والمفاهيم الرياضية المناسبة والمكتسبة.',
        'تحليل الوضعية واختيار استراتيجية حل مناسبة: • ماهي المهمة المطلوب إنجازها؟ كيف يتم ذلك؟ • ماذا يلزمك لترييض الوضعية؟ • ماهي الموارد الرياضية (معارف وإجراءات) التي تسمح بحل هذه الوضعية؟',
        'تنفيذ استراتيجية الحل المختارة: • ترييض الوضعية باختيار المجاهيل المناسبة وكتابة جملة المعادلتين التي تعبر عن هذه المعطيات. • اختيار طريقة حل وتطبيقها. • التحقق من صحة الحل وتحرير الإجابة المناسبة.',
    ],
    'answer': {
        'unknowns': 'x سعر علبة عصير و y سعر قطعة حلوى (بالدينار)',
        'system': '\\begin{cases} 150x + 150y = 11250 \\\\ 24x + 30y = 2100 \\end{cases}', 'simplified': '\\begin{cases} x + y = 75 \\\\ 4x + 5y = 350 \\end{cases}',
        'solution': _sit, 'check': [150 * 25 + 150 * 50 == 11250, 24 * 25 + 30 * 50 == 2100],
        'conclusion': 'سعر علبة العصير 25DA وسعر قطعة الحلوى 50DA.',
    },
    'answerSource': 'computed',
})

# ── أتعمّق ─────────────────────────────────────────────────────────────────


def deep(n, text, **extra):
    return exercise(n, 63, None, text, section='أتعمّق', **extra)


E.append(deep(22, 'حل الجملة الآتية باستعمال طريقة من اختيارك. $\\begin{cases} 8x + 3y = 39{,}5 \\\\ 7x + 9y = 50{,}5 \\end{cases}$',
              answer={'solution': system('8*x + 3*y = 39.5', '7*x + 9*y = 50.5'), 'decimal': '(4 ; 2{,}5)'}))
E.append(deep(23, 'حل الجملة باستعمال طريقة من اختيارك. $\\begin{cases} 2x + y = 1 \\\\ -2x + 4y = -6 \\end{cases}$',
              answer={'solution': system('2*x + y = 1', '-2*x + 4*y = -6')}))
E.append(deep(24, 'عددان طبيعيان مجموعهما 2019 والفرق بينهما 25. عيّن هذين العددين.',
              answer={'system': '\\begin{cases} x + y = 2019 \\\\ x - y = 25 \\end{cases}', 'solution': system('x + y = 2019', 'x - y = 25')}))
_p25 = system('2*(x + y) = 60', '(x + 5)*(y - 2) - x*y = 0')
assert _p25 == {'x': '20', 'y': '10'} and 25 * 8 == 20 * 10
E.append(deep(25, 'مستطيل محيطه 60cm. إذا زدنا طوله بـ 5cm وأنقصنا عرضه بـ 2cm، بقيت مساحته نفسها. عيّن بُعدَي هذا المستطيل.',
              answer={'system': '\\begin{cases} x + y = 30 \\\\ -2x + 5y = 10 \\end{cases}', 'solution': _p25}))
_p26 = system('x + y = 34', 'x + 4 = 2*(y + 4)')
assert _p26 == {'x': '24', 'y': '10'}
E.append(deep(26, 'اليوم، مجموع عمرَيْ أمين وحمزة هو 34 سنة. بعد 4 سنوات، يصير عمر أمين ضعف عمر حمزة. عيّن عمر أمين وعمر حمزة.',
              answer={'system': '\\begin{cases} x + y = 34 \\\\ x + 4 = 2(y + 4) \\end{cases}', 'solution': _p26}))
_p27 = system('5*x + 3*y = 1050', '3*y = 2*x')
assert _p27 == {'x': '150', 'y': '100'}
E.append(deep(27, 'تزن 5 تفاحات و 3 إجاصات معا 1kg 50g. إذا علمت أنّ وزن إجّاصة هو $\\dfrac{2}{3}$ وزن تفاحة. عيّن وزن كلّ ثمرة. (الثمرات متماثلة).',
              answer={'unit': 'g', 'system': '\\begin{cases} 5x + 3y = 1050 \\\\ y = \\dfrac{2}{3}x \\end{cases}', 'solution': _p27}))
_p28 = system('2*x + y = 33', 'x + 2*y = 39')
assert _p28 == {'x': '9', 'y': '15'} and (2 * 9 + 15) / 3 == 11 and (9 + 2 * 15) / 3 == 13
E.append(deep(28, 'تنقّط أعمال التلاميذ على 20. تحصّل تلميذ على علامة في فرض محروس بمعامل 2 وعلامة ثانية في واجب منزلي بمعامل 1 وكان معدله 11. بتبادل المعاملين، كان معدل التلميذ 13. ما هي العلامة التي تحصل عليها التلميذ في الفرض وفي الواجب المنزلي؟',
              answer={'system': '\\begin{cases} \\dfrac{2x + y}{3} = 11 \\\\ \\dfrac{x + 2y}{3} = 13 \\end{cases}', 'solution': _p28}))
_p29 = system('x + y = 18', '500*x + 250*y = 7000')
assert _p29 == {'x': '10', 'y': '8'}
E.append(deep(29, 'تحصل فلّاح مختصّ في تربية النحل على 7kg من العسل. لتسويق هذه الكمية، تمكّن من توزيعها على 18 علبة زجاجية، بعضها من فئة 500g والأخرى من فئة 250g، ممتلئة بالعسل. ما هو عدد قارورات كلّ فئة؟',
              answer={'system': '\\begin{cases} x + y = 18 \\\\ 500x + 250y = 7000 \\end{cases}', 'solution': _p29}))
_p30 = system('x + y = 356', '1000*x + 2000*y = 454000')
assert _p30 == {'x': '258', 'y': '98'}
E.append(deep(30, 'خلال يوم واحد، سُحب من موزّع آلي للأوراق النقدية 356 ورقة نقدية كلها من فئة 1000DA أو 2000 DA. وبلغ المبلغ الإجمالي الموزّع 454 000 DA. ما هو عدد أوراق كلّ فئة؟',
              answer={'system': '\\begin{cases} x + y = 356 \\\\ 1000x + 2000y = 454000 \\end{cases}', 'solution': _p30}))
_p31 = system('6*x + y = 720', '0.8*(5*x + 5*y) = 1080')
assert _p31 == {'x': '90', 'y': '180'} and system('6*x + y = 720', 'x + y = 270') == _p31
_wrong31 = system('6*x + y = 720', 'x + y = 216')
assert _wrong31 == {'x': '\\frac{504}{5}', 'y': '\\frac{576}{5}'}  # la coquille donne des prix non entiers
E.append(deep(31, 'اشترى زبون من متجر كبير 6 علب من الحليب وقارورة عصير ودفع 720 DA. زبون آخر يملك بطاقة إخلاص تمكّنه من الاستفادة من تخفيض قدره 20% على ثمن كلّ مشترياته عند الدفع. اشترى هذا الزبون 5 علب من الحليب و5 قارورات عصير من النوع نفسه ودفع 1080 DA بعد استظهار بطاقته. 1) ماذا نعني بكلّ من $x$ و $y$ في المعادلة التي تترجم مشتريات الزبون الأوّل: $6x + y = 720$ . 2) أ) اشرح لماذا عند تطبيق تخفيض بـ 20%، نضرب الثمن في 0,8. ب) اكتب معادلة تعبّر عن مشتريات الزبون الثاني. بيّن أنّ هذه المعادلة تكتب على الشكل: $x + y = 216$ 3) حل الجملة: $\\begin{cases} 6x + y = 720 \\\\ x + y = 270 \\end{cases}$ 4) ما هو سعر علبة الحليب وسعر قارورة العصير؟',
              answer={'1': 'x سعر علبة الحليب و y سعر قارورة العصير (بالدينار)', '2a': 'الثمن بعد التخفيض = الثمن - 20% منه = 80% من الثمن = 0,8 × الثمن',
                      '2b': {'equation': '0{,}8(5x + 5y) = 1080', 'simplified': 'x + y = 270'}, '3': _p31, '4': 'علبة الحليب 90DA وقارورة العصير 180DA'},
              correction={'decidedBy': 'owner', 'decidedOn': '2026-09-30',
                          'text': 'بيّن أنّ هذه المعادلة تكتب على الشكل: $x + y = 270$',
                          'note': 'Le manuel écrit « x + y = 216 » en 2) b) alors que 0,8(5x + 5y) = 1080 donne x + y = 270, et que la jumla du 3) porte bien 270 (216 = 1080 ÷ 5, la réduction oubliée). Corrigé en 270 dans la leçon, une ligne discrète.'}))

# ── Plan de couverture ─────────────────────────────────────────────────────
L1, L2, L3, L4 = 'mafhum-jumla', 'hall-jabri', 'mushkilat-jumla', 'wadiya-idmajiya-jumal'
DEST = {
    '_comment': 'elementId → { lesson, module } ; `duplicatedIn` autorise une seconde utilisation déclarée ; `items` répartit un élément à plusieurs sous-éléments. Vérifié par scripts/check-textbook-coverage.mjs.',
    'objectives': {'lesson': 'unit', 'module': 'page'},
    'history-abu-kamil': {'lesson': 'unit', 'module': 'page', 'duplicatedIn': [
        {'lesson': L3, 'module': 2, 'note': 'le problème du أجير : x + y = 30 et 6x = 4y, une jumla écrite mille ans avant la notation'}]},
    'challenge': {'lesson': 'unit', 'module': 'page', 'duplicatedIn': [
        {'lesson': L1, 'module': 1, 'note': '37 pièces et 610DA : deux conditions à la fois, le lab de la leçon (متقدم)'},
        {'lesson': L3, 'module': 2, 'note': 'le تحدّ résolu par les cinq étapes de la méthode'}]},
    'prep': {'lesson': L1, 'module': 0, 'items': {
        '1-8': {'lesson': L1, 'module': 0},
        '9-10': {'lesson': L2, 'module': 0}}},
    'act-1': {'lesson': L1, 'module': 1},
    'know-1': {'lesson': L1, 'module': 2},
    'know-2': {'lesson': L1, 'module': 2},
    'know-cases': {'lesson': L1, 'module': 2},
    **{f'ex-{n}': {'lesson': L1, 'module': 3} for n in range(1, 5)},
    'act-2': {'lesson': L2, 'module': 1},
    'method-example': {'lesson': L2, 'module': 2},
    'method-systems': {'lesson': L2, 'module': 2},
    'now-59': {'lesson': L2, 'module': 2},
    **{f'ex-{n}': {'lesson': L2, 'module': 3} for n in [5, 6, 7, 8, 9, 10, 11, 12, 13, 22, 23]},
    'act-3': {'lesson': L3, 'module': 1},
    **{f'ex-{n}': {'lesson': L3, 'module': 3} for n in [14, 15, 16, 17, 18, 19, 20, 21, 24, 25, 26, 27, 28]},
    'situation': {'lesson': L4, 'module': 1, 'duplicatedIn': [{'lesson': L4, 'module': 4}]},
    'qcm': {'lesson': L4, 'module': 2, 'duplicatedIn': [
        {'lesson': L1, 'module': 4, 'items': [1, 2, 3, 4]},
        {'lesson': L2, 'module': 4, 'items': [5, 6]},
        {'lesson': L3, 'module': 4, 'items': [7]}]},
    **{f'ex-{n}': {'lesson': L4, 'module': 3} for n in [29, 30, 31]},
}

DISCREPANCIES = [
    {'elementId': 'ex-31', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
     'text': '2) ب) « x + y = 216 » : 0,8(5x + 5y) = 1080 donne x + y = 270, la valeur que la jumla du 3) utilise (216 = 1080 ÷ 5 sans la réduction). Avec 216 les prix seraient 504/5 et 576/5 DA.'},
    {'elementId': 'history-abu-kamil', 'kind': 'ambiguity', 'text': 'Le problème du أجير ne précise ni la durée du mois ni la proportionnalité aux jours ; lecture classique : 30 jours, 6x = 4y → 12 jours. Voir element.discrepancy.'},
    {'elementId': 'ex-6', 'kind': 'note', 'text': 'a) 2x − 3y = 1 et 3x + 5y = 21 donnent (68/19 ; 39/19) : relu à 300 dpi, ce sont bien les nombres du manuel (pas une erreur d’extraction).'},
    {'elementId': 'ex-8', 'kind': 'note', 'text': 'b) 3x + 7y = 11 et −5x + 2y = 5 donnent (−13/41 ; 70/41) : relu à 300 dpi, nombres du manuel.'},
    {'elementId': 'ex-15', 'kind': 'note', 'text': 'Les termes trouvés sont négatifs (a = −14, b = −4) ; la NISBA demandée vaut 7/2. La leçon le dit sans rien changer.'},
    {'elementId': 'unit', 'kind': 'placement', 'text': 'Le programme (programme_4am_2026_2027.json) range « جمل معادلتين من الدرجة الأولى بمجهولين » (jumal_muadalatayn) dans « ميدان الحساب الحرفي » ; le propriétaire a demandé (2026-10-01) de placer l’unité sous « ميدان أنساب الأعداد والحساب », comme les unités 1 à 4. Voir units_4am_2026_2027.json › placement.'},
]

doc = {
    '_comment': [
        'EXTRACTION CANONIQUE du manuel scolaire officiel — 4AM, الجيل الثاني, unité 5 « جمل معادلتين من الدرجة الأولى بمجهولين ».',
        'Source : « وحدة جملة معادلتين من الدرجة الأولى بمجهولين.pdf » (9 pages PDF = pages 55 à 63 du manuel), scan sans couche texte.',
        'Ce fichier est LA source de vérité pédagogique de l’unité dans le dépôt. Tout contenu de leçon, toute manipulation,',
        'tout exercice de pratique cite un `id` d’ici via `source.elementId`.',
        'Transcription VISUELLE (pages rendues à 150 dpi, zooms à 300 dpi sur les passages douteux) ; la formulation arabe est celle du manuel.',
        'Les réponses (`answer`) NE viennent PAS du manuel (il n’a pas de corrigé) : elles sont calculées par sympy dans',
        'build-extraction.py et marquées `answerSource: computed`. Une jumla résolue porte { x, y } (LaTeX exact) ou « none » / « infinite ».',
        'Les coquilles sont CORRIGÉES dans les leçons (champ `correction`, politique du propriétaire du 2026-09-30) ; `discrepancies` les liste.',
        'Les `destinations` sont le plan de couverture : chaque élément a UNE destination (ou une répartition `items`),',
        'une seconde utilisation est déclarée dans `duplicatedIn`. scripts/check-textbook-coverage.mjs le vérifie.',
        'Généré par docs/sources/4am/unit5/build-extraction.py — ne pas éditer à la main.',
    ],
    'unitCode': 'jumal-muadalatayn',
    'textbook': {'title': 'كتاب الرياضيات — السنة الرابعة من التعليم المتوسط', 'generation': 'الجيل الثاني', 'unitNumber': 5,
                 'unitTitle': 'جمل معادلتين من الدرجة الأولى بمجهولين',
                 'pages': {'first': 55, 'last': 63}, 'pdfPageOffset': 54,
                 'sections': ['سأتعلّم في هذا الباب', 'تحدّ', 'أستعدّ', 'أنشطة', 'معارف', 'طرائق', 'دوري الآن', 'أوظّف تعلّماتي', 'أؤكّد تعلّماتي', 'أدمج تعلّماتي', 'أتعمّق']},
    'frozenAt': '2026-10-01',
    'terminology': {'note': 'Le manuel écrit « جملة معادلتين من الدرجة الأولى بمجهولين » (pluriel « جمل »), « ثنائية » pour le couple (x ; y) — ordre important, séparateur « ; » —, « حل للجملة » / « الحل الوحيد للجملة », « محققتين في آن واحد » / « محققتان معا », « طريقة التعويض », « طريقة الجمع » (et « الجمع والتعويض »), « بدلالة », « طرفا بطرف », « معامل مناسب », « عدد غير منته من الحلول », « ليس لها حلول ».',
                    'terms': ['جملة معادلتين', 'معادلة من الدرجة الأولى بمجهولين', 'ثنائية', 'حل للجملة', 'الحل الوحيد', 'محققتين في آن واحد', 'طريقة التعويض', 'طريقة الجمع', 'بدلالة', 'طرفا بطرف', 'معامل', 'عدد غير منته من الحلول', 'ليس لها حلول', 'المجاهيل', 'ترجمة المشكلة', 'التحقق']},
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
assert len([i for i in ids if i.startswith('ex-')]) == 31

out = Path(__file__).with_name('extraction.json')
out.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
print(f'{out} — {len(E)} éléments')
