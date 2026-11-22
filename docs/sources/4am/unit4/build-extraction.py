#!/usr/bin/env python3
"""Génère docs/sources/4am/unit4/extraction.json — unité 4 « معادلات ومتراجحات من الدرجة الأولى بمجهول واحد » (pp. 43–53).

Transcription VISUELLE du scan (« وحدة المعادلات و المتراجحات.pdf », 11 pages, sans couche texte),
relue à 220 dpi sur les passages douteux (pages d'exercices, droites graduées du QCM, أستعدّ).
Le texte arabe est celui du manuel, au mot près ; les réponses (`answer`) ne viennent PAS du manuel
(il n'a pas de corrigé) : elles sont CALCULÉES ici avec sympy (`answerSource: computed`), jamais
tapées à la main — une coquille de transcription fait échouer la génération.

Usage : python3 docs/sources/4am/unit4/build-extraction.py
"""
import json
from pathlib import Path

import sympy as sp

x = sp.symbols('x')
def S(e):
    """Les décimaux du manuel (2,5 ; 1,2…) sont lus EXACTS : 2.5 → 5/2, jamais un flottant."""
    return e if isinstance(e, sp.Basic) else sp.sympify(e, rational=True)


def fmt(e):
    s = sp.latex(sp.nsimplify(e) if not isinstance(e, sp.Basic) or e.is_number else e, order='lex')
    return s.replace('.', '{,}')


def ex(e):
    return fmt(sp.expand(S(e)))


def fac(e):
    return fmt(sp.factor(S(e)))


def check_eq(lhs, rhs):
    assert sp.simplify(S(lhs) - S(rhs)) == 0, (lhs, rhs)
    return True


def eq(lhs, rhs):
    """Solutions d'une équation en x : liste LaTeX triée (vide si aucune ; 'all' si identité)."""
    d = sp.simplify(S(lhs) - S(rhs))
    if d == 0:
        return 'all'
    sols = sorted(sp.solve(sp.Eq(S(lhs), S(rhs)), x), key=lambda v: float(v))
    for v in sols:
        assert sp.simplify(S(lhs).subs(x, v) - S(rhs).subs(x, v)) == 0
    return [fmt(v) for v in sols]


REL = {'<': sp.StrictLessThan, '<=': sp.LessThan, '>': sp.StrictGreaterThan, '>=': sp.GreaterThan}
TEX = {'<': '<', '<=': '\\leq', '>': '>', '>=': '\\geq'}
FLIP = {'<': '>', '<=': '>=', '>': '<', '>=': '<='}


def ineq(lhs, rhs, rel):
    """Résout une inéquation du premier degré : ramène à a·x REL b, divise par a (sens inversé si a < 0)."""
    d = sp.expand(S(lhs) - S(rhs))
    assert sp.degree(d, x) == 1, (lhs, rhs, 'pas du premier degré')
    a, b0 = d.coeff(x, 1), d.coeff(x, 0)
    bound = sp.nsimplify(-b0 / a)
    r = rel if a > 0 else FLIP[rel]
    # Vérification indépendante : sympy résout aussi, et l'on compare sur des points témoins.
    sol = sp.solve_univariate_inequality(REL[rel](S(lhs), S(rhs)), x, relational=False)
    for t in [bound - 1, bound, bound + 1, bound - sp.Rational(1, 7), bound + sp.Rational(1, 7)]:
        mine = {'<': t < bound, '<=': t <= bound, '>': t > bound, '>=': t >= bound}[r]
        assert bool(mine) == bool(sol.contains(t)), (lhs, rhs, rel, t)
    return {'relation': r, 'bound': fmt(bound), 'tex': f'x {TEX[r]} {fmt(bound)}', 'flipped': bool(a < 0)}


def truth(lhs, rhs, rel, value):
    v = S(value)
    return bool(REL[rel](S(lhs).subs(x, v), S(rhs).subs(x, v)))


E = []

E.append({
    'id': 'objectives', 'kind': 'objectives', 'page': 43, 'section': 'سأتعلّم في هذا الباب', 'verified': True,
    'items': [
        'حل معادلة يؤول حلها إلى حل «معادلة جداء معدوم».',
        'حل متراجحة من الدرجة الأولى بمجهول واحد وتمثيل حلولها على مستقيم مدرج.',
        'حل مشكلات بتوظيف معادلات أو متراجحات من الدرجة الأولى بمجهول واحد.',
    ],
})

E.append({
    'id': 'history-khwarizmi', 'kind': 'aside', 'page': 43, 'section': 'الخوارزمي', 'verified': True,
    'text': 'أبو جعفر محمد بن موسى الخوارزمي عالم موسوعي، برز في الرياضيات والفلك؛ فهو أول من استعمل كلمة «جبر» للعلم المعروف الآن بهذا الاسم. وكفاه فخرا أنّه ألّف « كتاب الجبر والمقابلة». في هذا الكتاب الذي شُيّد عليه تقدّم الجبر، قسّم الخوارزمي الأعداد التي يحتاج إليها في الجبر إلى ثلاثة أنواع : جذر أي «$x$» ومال أي «$x^2$» ومفرد وهو العدد الخالي من «$x$». جاء في كتاب الخوارزمي المثل الآتي: «... وأمّا الأموال والعدد التي تعدل الجذور فنحو قولك مال وواحد وعشرون من العدد يعدل 10 أجذاره» وبحسب الرموز الحالية تكون المعادلة: $x^2 + 21 = 10x$ . وقد حلّها واستخرج جذريها 3 و 7.',
    'caption': 'الخوارزمي (780م-850م)',
    'answer': {'roots': eq('x**2+21', '10*x'), 'factored': fac('x**2-10*x+21'), 'check': check_eq('x**2-10*x+21', '(x-3)*(x-7)')},
    'answerSource': 'computed',
})

E.append({
    'id': 'challenge', 'kind': 'challenge', 'page': 43, 'section': 'تحدّ', 'verified': True,
    'text': 'في الشكل المقابل، $x$ يُمثل طول ضلع المربع AEGF. عيّن قيمة $x$ علما أنّ $x^2 + 12x = 85$',
    'figure': 'مربع ABCD مقسّم إلى المربع AEGF (ضلعه $x$)، والمستطيلين EBHG و FGKD (بعدا كل منهما $x$ و 6)، والمربع GHCK (ضلعه 6) ؛ $EB = 6$ و $FD = 6$.',
    'answer': {
        'completedSquare': '(x + 6)^2 = x^2 + 12x + 36 = 85 + 36 = 121',
        'factored': '(x + 6)^2 - 121 = (x - 5)(x + 17) = 0',
        'roots': eq('x**2+12*x', '85'), 'x': 5,
        'note': 'x = −17 est refusé : x est une longueur.',
        'check': [check_eq('x**2+12*x-85', '(x-5)*(x+17)'), check_eq('(x+6)**2-121', 'x**2+12*x-85')],
    },
    'answerSource': 'computed',
})

PREP = [
    ('إذا كان $2x - 1 = 0$ فإن $x = 1$ .', False, '$2 \\times 1 - 1 = 1 \\neq 0$ ؛ الحل هو $x = \\dfrac{1}{2}$'),
    ('حل المعادلة $x + 3 = 2x + 3$ هو 0.', True, '$0 + 3 = 3$ و $2 \\times 0 + 3 = 3$'),
    ('الجداء $x(x - 1)$ ينشر على الشكل $x^2 - x$ .', True, '$x \\times x - x \\times 1 = x^2 - x$'),
    ('المجموع $x + 4x^2$ يحلل على الشكل $x(4x + 1)$ .', True, '$x(4x + 1) = 4x^2 + x$'),
    ('المجموع $b^2 + 16b + 64$ يحلل على الشكل $(b + 8)^2$ .', True, '$(b + 8)^2 = b^2 + 2 \\times 8 \\times b + 8^2 = b^2 + 16b + 64$'),
    ('إذا كان $x$ عددا حيث $25x < 0$ فإنّ $x$ يُمكن أن يُساوي 0.', False, '$25 \\times 0 = 0$ و $0 < 0$ خاطئة'),
    ('إذا كان $x$ عددا حيث $2x - 1 \\leq 6$ فإنّ $x$ يُمكن أن يُساوي $\\dfrac{7}{2}$ .', True, '$2 \\times \\dfrac{7}{2} - 1 = 6$ و $6 \\leq 6$ صحيحة'),
    ('نطرح العدد 2 من طرفي المتباينة $4x + 2 < -1$ فنحصل على : $4x > -3$ .', False, 'طرح عدد يحافظ على اتجاه المتباينة: $4x < -3$'),
    ('نقسم طرفي المتباينة $5x < -1$ على العدد 5 فنحصل على: $x < \\dfrac{1}{5}$ .', False, '$x < -\\dfrac{1}{5}$'),
    ('نقسم طرفي المتباينة $-2x \\geq -1$ على العدد (-2) فنحصل على: $x \\geq \\dfrac{1}{2}$ .', False, 'القسمة على عدد سالب تغيّر الاتجاه: $x \\leq \\dfrac{1}{2}$'),
    ('إذا كان $x \\leq 3$ فإن $-3x \\geq -6$ .', False, 'من أجل $x = 3$ : $-3x = -9$ و $-9 \\geq -6$ خاطئة ؛ الصحيح $-3x \\geq -9$'),
]
_prep_truth = [
    eq('2*x-1', '0') == ['1'],
    0 in [S(v) for v in eq('x+3', '2*x+3')],
    sp.expand(S('x*(x-1)') - S('x**2-x')) == 0,
    sp.expand(S('x+4*x**2') - S('x*(4*x+1)')) == 0,
    sp.expand(S('(x+8)**2') - S('x**2+16*x+64')) == 0,
    truth('25*x', '0', '<', 0),
    truth('2*x-1', '6', '<=', sp.Rational(7, 2)),
    ineq('4*x+2-2', '-1-2', '<')['relation'] == '>',
    ineq('5*x', '-1', '<')['bound'] == '\\frac{1}{5}',
    ineq('-2*x', '-1', '>=')['tex'] == 'x \\geq \\frac{1}{2}',
    all(truth('-3*x', '-6', '>=', v) for v in [3, 2, 0, -5]),
]
assert [p[1] for p in PREP] == _prep_truth, ('prep: une réponse ne correspond pas au calcul', _prep_truth)
E.append({
    'id': 'prep', 'kind': 'prerequisites', 'page': 43, 'section': 'أستعدّ',
    'instruction': 'أصحيح أم خاطئ؟ برّر إجابتك.', 'verified': True,
    'items': [{'n': i + 1, 'text': t, 'answer': a, 'why': w} for i, (t, a, w) in enumerate(PREP)],
    'answerSource': 'computed',
})

# ── أنشطة ──────────────────────────────────────────────────────────────────
PROG = '3*(3*x+2)-5'
E.append({
    'id': 'act-1', 'kind': 'activity', 'number': 1, 'page': 44, 'section': 'أنشطة', 'title': 'المعادلات من الدرجة الأولى بمجهول واحد', 'verified': True,
    'program': ['اختر عددا.', 'اضربه في 3 ثمّ أضف 2.', 'اضرب الناتج في 3.', 'اطرح 5.', 'أعلن النتيجة.'],
    'text': 'إليك برنامج الحساب التالي :',
    'questions': [
        '1) تحقّق أنّه عند اختيار العدد 2 في البداية، نتحصّل على العدد 19 في نهاية البرنامج.',
        '2) بيّن أنّه عند اختيار العدد $x$ في البداية، نتحصّل على العبارة $9x + 1$ في نهاية البرنامج.',
        '3) اختارت فاطمة عددا وقامت بتفعيل البرنامج، فحصلت على $-26$ . • ما هو العدد الذي اختارته في البداية؟',
        '4) اختار مصطفى عددا وقام بتفعيل البرنامج، فحصل على ضعف العدد الذي اختاره في البداية. • ما هو العدد الذي اختاره في البداية؟',
    ],
    'answer': {
        'q1': int(S(PROG).subs(x, 2)), 'q2': ex(PROG),
        'q3': {'equation': '9x + 1 = -26', 'x': eq(PROG, '-26')},
        'q4': {'equation': '9x + 1 = 2x', 'x': eq(PROG, '2*x')},
        'check': check_eq(PROG, '9*x+1'),
    },
    'answerSource': 'computed',
})

E.append({
    'id': 'act-2a', 'kind': 'activity', 'number': 2, 'part': 'الجداء المعدوم', 'page': 44, 'section': 'أنشطة', 'title': 'خاصية الجداء المعدوم', 'verified': True,
    'questions': [
        'الجداء المعدوم: انقل وأكمل كلا مما يلي: 1) $2 \\times \\ldots = 0$ ، $\\ldots \\times 5 = 0$ ، $-\\dfrac{3}{7} \\times \\ldots = 0$ ، $\\ldots \\times \\sqrt{3} = 0$',
        '2) $a$ و $b$ عددان، إذا كان $a \\times b = 0$ فإنّ $a = \\ldots$ أو $b = \\ldots$ .',
        '3) عبّر لغويا عن الخاصية السابقة، التي تُسمى خاصية الجداء المعدوم.',
    ],
    'answer': {'q1': [0, 0, 0, 0], 'q2': 'a = 0 \\text{ أو } b = 0', 'q3': 'إذا كان جداء عاملين معدوما فإن أحد هذين العاملين على الأقل معدوم.'},
    'answerSource': 'computed',
})

E.append({
    'id': 'act-2b', 'kind': 'activity', 'number': 2, 'part': 'تطبيق أ', 'page': 44, 'section': 'أنشطة', 'title': 'حل معادلة من الشكل $(ax + b)(cx + d) = 0$', 'verified': True,
    'figure': 'كراس إلياس: $3(x - 5) = 0$ ؛ $3x - 15 = 0$ ؛ $3x = 15$ ؛ $x = 5$ ومنه نجد. كراس أمين: $3(x - 5) = 0$ ؛ $x - 5 = 0$ بما أنّ $3 \\neq 0$ ؛ $x = 5$ ومنه.',
    'questions': [
        '1) لاحظ عمل كل من إلياس وأمين لحل المعادلة $3(x - 5) = 0$ ، وحدّد أيّا منهما استعمل خاصية الجداء المعدوم، واشرح طريقة الآخر.',
        '2) حل المعادلة $-1{,}2(3x + 2{,}7) = 0$ بالطريقة التي استعملها إلياس، ثم بطريقة أمين.',
        '3) حل المعادلة $(x - 2)(x + 5) = 0$ .',
    ],
    'answer': {
        'q1': 'أمين استعمل خاصية الجداء المعدوم ؛ إلياس نشر ثم حل معادلة من الدرجة الأولى.',
        'q2': eq('-1.2*(3*x+2.7)', '0'), 'q3': eq('(x-2)*(x+5)', '0'),
        'q3note': 'بطريقة إلياس نحصل على $x^2 + 3x - 10 = 0$ : ليست من الدرجة الأولى.',
    },
    'answerSource': 'computed',
})

E.append({
    'id': 'act-2c', 'kind': 'activity', 'number': 2, 'part': 'تطبيق ب', 'page': 44, 'section': 'أنشطة', 'title': 'حل معادلة تؤول إلى الشكل $(ax + b)(cx + d) = 0$', 'verified': True,
    'text': 'إليك المعادلة (E): $(1 - 4x)(x + 3) + 7(x + 3) = 0$ .',
    'questions': [
        '1) تحقّق من أنّ $(1 - 4x)(x + 3) + 7(x + 3) = (x + 3)(8 - 4x)$ .',
        '2) حل المعادلة (E).',
    ],
    'answer': {'q1': check_eq('(1-4*x)*(x+3)+7*(x+3)', '(x+3)*(8-4*x)'), 'q2': eq('(1-4*x)*(x+3)+7*(x+3)', '0')},
    'answerSource': 'computed',
})

E.append({
    'id': 'act-3a', 'kind': 'activity', 'number': 3, 'part': 'المتراجحة وحلولها', 'page': 45, 'section': 'أنشطة', 'title': 'المتراجحات من الدرجة الأولى بمجهول واحد', 'verified': True,
    'text': 'بمناسبة عيد الفطر، وتسهيلا لعملية التواصل عبر الرسائل النصية، اقترح متعامل للهاتف النقال العرض الآتي على زبائنه: 2,5DA للرسالة الواحدة و 100DA اقتطاع جزافي من الرصيد. يرغب يونس في عدم تجاوز المبلغ 150DA الموجود في رصيده.',
    'questions': [
        '1) هل يمكن ليونس القيام بإرسال: أ) 21 رسالة؟ ب) 20 رسالة؟ جـ) 16 رسالة؟',
        '2) نرمز إلى عدد الرسائل القصيرة بالرمز $x$ . أ) من بين المتباينات الآتية، حدّد تلك التي توافق رغبة يونس : $150x + 100 \\leq 2{,}5$ ، $150x - 100 \\leq 2{,}5$ ، $2{,}5x + 100 \\leq 150$ . ب) اقترح قيمة لـ $x$ توافق رغبة يونس، وقيمة أخرى لـ $x$ لا توافقها.',
        'جـ) هل العدد 2 حل للمتراجحة $2{,}5x + 100 \\leq 150$ ؟ السؤال نفسه من أجل العدد 21.',
    ],
    'box': ['كل متباينة من المتباينات الثلاثة السّابقة تُسمّى متراجحة ذات المجهول $x$ .', 'كل قيمة لـ $x$ تجعل المتراجحة متباينة صحيحة، تُسمّى حلاً لهذه المتراجحة.'],
    'answer': {
        'q1': {'21': truth('2.5*x+100', '150', '<=', 21), '20': truth('2.5*x+100', '150', '<=', 20), '16': truth('2.5*x+100', '150', '<=', 16)},
        'q1costs': {'21': fmt(S('2.5*21+100')), '20': fmt(S('2.5*20+100')), '16': fmt(S('2.5*16+100'))},
        'q2a': '2{,}5x + 100 \\leq 150', 'q2aSolutions': ineq('2.5*x+100', '150', '<='),
        'q3': {'2': truth('2.5*x+100', '150', '<=', 2), '21': truth('2.5*x+100', '150', '<=', 21)},
    },
    'answerSource': 'computed',
})

E.append({
    'id': 'act-3b', 'kind': 'activity', 'number': 3, 'part': 'حل متراجحة', 'page': 45, 'section': 'أنشطة', 'title': 'حل متراجحة وتمثيل حلولها على مستقيم مدرّج', 'verified': True,
    'text': 'حل متراجحة : نريد فيما يأتي حل المتراجحة $-3x + 5 \\leq 20$ وتمثيل حلولها على مستقيم مدرّج.',
    'questions': [
        '1) انقل ثمّ أتمم مبرّرا كل خطوة تقوم بها: $-3x + 5 \\leq 20$ ← الخطوة 1 $(-\\ldots)$ ← $-3x \\ldots 15$ ← الخطوة 2 $(\\div \\ldots)$ ← $x \\ldots -5$',
        '2) نقبل أنّ حلول المتراجحة $-3x + 5 \\leq 20$ هي نفسها حلول المتراجحة $x \\geq -5$ . اعتمادا على محتوى السطرين الأول والثاني من الجدول الآتي، أتمم السطر الأخير.',
    ],
    'table': [
        {'inequality': '$x < 3$', 'words': 'كل قيم $x$ الأصغر من 3', 'graph': 'الجزء الملوّن على يسار 3، والرمز [ عند 3'},
        {'inequality': '$x \\geq 2$', 'words': 'كل قيم $x$ الأكبر من أو تساوي 2', 'graph': 'الجزء الملوّن على يمين 2، والرمز [ عند 2'},
        {'inequality': '$-3x + 5 \\leq 20$', 'words': '..................', 'graph': '..................'},
    ],
    'answer': {
        'step1': 'نطرح 5 من الطرفين: $-3x \\leq 15$', 'step2': 'نقسم الطرفين على $-3$ (عدد سالب، نغيّر الاتجاه): $x \\geq -5$',
        'solution': ineq('-3*x+5', '20', '<='), 'words': 'كل قيم $x$ الأكبر من أو تساوي $-5$',
    },
    'answerSource': 'computed',
})

# ── معارف ──────────────────────────────────────────────────────────────────
E.append({
    'id': 'know-1', 'kind': 'knowledge', 'number': 1, 'page': 46, 'section': 'معارف', 'title': 'المعادلة من الدرجة الأولى بمجهول واحد', 'verified': True,
    'properties': [{'id': 'prop-ax-b', 'text': 'يؤول حل كل معادلة من الدرجة الأولى بمجهول واحد إلى حل معادلة من الشكل $ax = b$ حيث $a \\neq 0$ . الحل الوحيد لهذه المعادلة هو العدد $\\dfrac{b}{a}$ .'}],
    'examples': [
        'المعادلة $4x - 3 = 2x + 6$ . تكتب $4x - 3 - 2x = 2x + 6 - 2x$ . أي $2x - 3 = 6$ ويمكن كتابة هذه المعادلة الأخيرة على الشكل $2x = 9$ . بتقسيم الطرفين على العدد 2 أي $x = \\dfrac{9}{2}$ . ينتج أنّ $\\dfrac{9}{2}$ هو الحل الوحيد للمعادلة $4x - 3 = 2x + 6$ .',
    ],
    'answer': {'example': eq('4*x-3', '2*x+6')},
})

E.append({
    'id': 'know-2', 'kind': 'knowledge', 'number': 2, 'page': 46, 'section': 'معارف', 'title': 'معادلات جداء معدوم', 'verified': True,
    'definitions': [{'id': 'def-zero-product-eq', 'text': 'كل معادلة من الشكل $(ax + b)(cx + d) = 0$ حيث $a$ ، $b$ ، $c$ و $d$ أعداد معلومة، تُسمّى معادلة جداء معدوم.'}],
    'properties': [
        {'id': 'prop-zero-product', 'title': 'خاصية الجداء المعدوم', 'text': '• إذا كان جداء عاملين معدومًا فإن أحد هذين العاملين على الأقل معدوم. • بعبارة أخرى إذا كان $a \\times b = 0$ فإن $a = 0$ أو $b = 0$ .'},
        {'id': 'note-zero-product', 'title': 'ملاحظة', 'text': 'تسمح هذه الخاصية بحل معادلة «جُداء معدوم».'},
        {'id': 'prop-zero-product-solutions', 'text': 'حلول المعادلة $(ax + b)(cx + d) = 0$ هي حلول المعادلتين $ax + b = 0$ و $cx + d = 0$ .'},
    ],
    'examples': [
        'مثال 1: $(3x - 4)(-2x + 1) = 0$ هي معادلة جُداء معدوم.',
        'مثال 2: $2x = 0$ يعني أنّ $x = 0$ لأنّ $2 \\neq 0$ .',
        'مثال 3: نحل المعادلة $(3x - 4)(-2x + 1) = 0$ . $(3x - 4)(-2x + 1) = 0$ يعني $3x - 4 = 0$ أو $-2x + 1 = 0$ . $3x - 4 = 0$ يعني $3x = 4$ أي $x = \\dfrac{4}{3}$ . $-2x + 1 = 0$ يعني $-2x = -1$ أي $x = \\dfrac{1}{2}$ . إذن للمعادلة $(3x - 4)(-2x + 1) = 0$ حلان هما $\\dfrac{1}{2}$ و $\\dfrac{4}{3}$ .',
    ],
    'answer': {'example3': eq('(3*x-4)*(-2*x+1)', '0')},
})

E.append({
    'id': 'know-3', 'kind': 'knowledge', 'number': 3, 'page': 48, 'section': 'معارف', 'title': 'المتراجحات من الدرجة الأولى بمجهول واحد', 'verified': True,
    'definitions': [
        {'id': 'def-inequation', 'text': '• المتراجحة بمجهول $x$ هي متباينة قد تكون صحيحة وقد تكون خاطئة وهذا حسب قيم $x$ . • قيم $x$ التي من أجلها تكون المتباينة صحيحة هي حلول المتراجحة. • حل متراجحة هو إيجاد كل حلولها.'},
        {'id': 'def-first-degree', 'text': 'يُقال عن متراجحة أنّها من الدرجة الأولى لمجهول $x$ ، إذا أمكن كتابتها على أحد الأشكال الآتية : $ax + b < cx + d$ أو $ax + b > cx + d$ ، $ax + b \\leq cx + d$ أو $ax + b \\geq cx + d$ .'},
    ],
    'properties': [{'id': 'method-rules', 'title': 'طريقة', 'text': 'لحل متراجحة من الدرجة الأولى بمجهول واحد، نستعمل القواعد الآتية: • نُحافظ على اتجاه المتراجحة عندما نُضيف إلى (أو نطرح من) طرفيها نفس العدد. • نُحافظ على نفس اتجاه المتراجحة عندما نضرب طرفيها في (أو نقسم طرفيها على) نفس العدد الموجب تماما. • نُغيّر اتجاه المتراجحة عندما نضرب طرفيها في (أو نقسم طرفيها على) العدد السالب تماما نفسه.'}],
    'examples': [
        'مثال 1: المتباينة $4x > -3$ هي متراجحة ذات المجهول $x$ . من أجل $x = -2$ نكتب $4 \\times (-2) > -3$ فنحصل على متباينة خاطئة $-8 > -3$ إذن العدد $(-2)$ ليس حلا للمتراجحة $4x > -3$ .',
        'مثال 2: 1) حل المتراجحة $4x - 1 \\leq x + 3$ . نطرح $x$ من الطرفين فنحصل على $3x - 1 \\leq 3$ . نضيف 1 للطرفين، نحصل على $3x \\leq 4$ . نقسم على 3 إذن $x \\leq \\dfrac{4}{3}$ (لاحظ اتجاه المتراجحة لم يتغير). حلول المتراجحة $4x - 1 \\leq x + 3$ هي كل الأعداد $x$ الأصغر من أو يساوي $\\dfrac{4}{3}$ . 2) حل المتراجحة $-3x + 2 > 20$ . نطرح 2 من الطرفين، فنحصل على $-3x > 18$ . نقسم الطرفين على العدد السالب $-3$ ، نحصل على $x < -6$ (لاحظ اتجاه المتراجحة قد يتغير). حلول المتراجحة $-3x + 2 > 20$ هي كل الأعداد $x$ الأصغر من $-6$ .',
    ],
    'discrepancy': 'Exemple 2, 2) : « لاحظ اتجاه المتراجحة قد يتغير » — après une division par −3 le sens CHANGE (il ne « peut » pas changer) ; lu « قد تغيّر ».',
    'correction': {'decidedBy': 'owner-policy', 'decidedOn': '2026-10-01', 'text': '(لاحظ أنّ اتجاه المتراجحة قد تغيّر)', 'note': '« قد يتغير » (peut changer) → « قد تغيّر » (a changé) : la division par un négatif change toujours le sens.'},
    'answer': {'example1': truth('4*x', '-3', '>', -2), 'example2a': ineq('4*x-1', 'x+3', '<='), 'example2b': ineq('-3*x+2', '20', '>')},
})

E.append({
    'id': 'know-4', 'kind': 'knowledge', 'number': 4, 'page': 48, 'section': 'معارف', 'title': 'التمثيل البياني لحلول متراجحة', 'verified': True,
    'definitions': [{'id': 'def-graph', 'text': 'تُمثل حلول متراجحة على مستقيم عددي مُدرّج.'}],
    'examples': [
        'مثال 1: حل المتراجحة $5x \\leq 3$ . نضرب الطرفين في العدد $\\dfrac{1}{5}$ ، نجد $x \\leq \\dfrac{3}{5}$ . حلول المتراجحة هي كل الأعداد $x$ الأصغر من أو تساوي $\\dfrac{3}{5}$ . تُمثل حلول المتراجحة على المستقيم المُدرّج بالجزء المُلوّن بالأحمر. ملاحظة: الرمز ] موجه نحو الجزء الملوّن بالأحمر للتعبير عن أن العدد $\\dfrac{3}{5}$ هو أيضا حل للمتراجحة المعطاة.',
        'مثال 2: حل المتراجحة $-\\dfrac{1}{2}x + 2 < -1$ . نطرح العدد 2 من الطرفين، نجد $-\\dfrac{1}{2}x < -3$ . نضرب الطرفين في العدد $(-2)$ ، نجد $x > 6$ (لاحظ اتجاه المتراجحة قد يتغير). حلول المتراجحة هي كل الأعداد $x$ الأكبر من 6. تمثل حلول المتراجحة على المستقيم المُدرّج بالجزء الملون بالأحمر. ملاحظة: الرمز ] غير موجه في إتجاه الجزء الملون وذلك للتعبير على أن العدد 6 ليس حل للمتراجحة المعطاة.',
    ],
    'figures': ['مستقيم مدرّج من $-2$ إلى 1، الجزء الملوّن بالأحمر على يسار $\\dfrac{3}{5}$ والرمز ] عند $\\dfrac{3}{5}$ موجّه نحوه.',
                'مستقيم مدرّج من 4 إلى 7، الجزء الملوّن بالأحمر على يمين 6 والرمز ] عند 6 غير موجّه نحوه.'],
    'discrepancy': 'Exemple 2 : « لاحظ اتجاه المتراجحة قد يتغير » après une multiplication par −2 — le sens CHANGE toujours ; lu « قد تغيّر » (même coquille que know-3).',
    'correction': {'decidedBy': 'owner-policy', 'decidedOn': '2026-10-01', 'text': '(لاحظ أنّ اتجاه المتراجحة قد تغيّر)', 'note': '« قد يتغير » → « قد تغيّر », comme know-3.'},
    'convention': {'note': 'Le manuel colore les SOLUTIONS en rouge ; le crochet est TOURNÉ vers la partie colorée quand la borne est solution (≤, ≥), DÉTOURNÉ quand elle ne l’est pas (<, >).',
                   'closedLeft': 'x ≤ a : rouge à gauche de a, crochet « ] »', 'openRight': 'x > a : rouge à droite de a, crochet « ] »',
                   'closedRight': 'x ≥ a : rouge à droite de a, crochet « [ »', 'openLeft': 'x < a : rouge à gauche de a, crochet « [ »'},
    'answer': {'example1': ineq('5*x', '3', '<='), 'example2': ineq('-x/2+2', '-1', '<')},
})

# ── طرائق ──────────────────────────────────────────────────────────────────
E.append({
    'id': 'method-equation', 'kind': 'method', 'page': 47, 'section': 'طرائق', 'title': 'حل معادلة من الدرجة الأولى بمجهول واحد', 'verified': True,
    'exercise': 'حل كل معادلة من المعادلتين الآتيين: أ) $2x - 5 = 8$ ب) $2{,}5x + 4{,}6 = 1{,}3x - 0{,}2$',
    'solution': [
        'أ) لحل المعادلة $2x - 5 = 8$ نضيف 5 إلى كل طرف فنجد $2x - 5 + 5 = 8 + 5$ أي $2x = 13$ ومنه $x = \\dfrac{13}{2}$ وللمعادلة $2x - 5 = 8$ حل وحيد هو $\\dfrac{13}{2}$ .',
        'ب) حل المعادلة $2{,}5x + 4{,}6 = 1{,}3x - 0{,}2$ . نطرح $1{,}3x$ من كل طرف فنجد $2{,}5x + 4{,}6 - 1{,}3x = 1{,}3x - 0{,}2 - 1{,}3x$ أي $1{,}2x + 4{,}6 = -0{,}2$ . نطرح $4{,}6$ من كل طرف فنجد $1{,}2x + 4{,}6 - 4{,}6 = -0{,}2 - 4{,}6$ أي $1{,}2x = -4{,}8$ ومنه $x = -\\dfrac{4{,}8}{1{,}2} = -4$ . وللمعادلة $2{,}5x + 4{,}6 = 1{,}3x - 0{,}2$ حل وحيد هو $-4$ .',
    ],
    'answer': {'a': eq('2*x-5', '8'), 'b': eq('2.5*x+4.6', '1.3*x-0.2')},
})

E.append({
    'id': 'method-zero-product', 'kind': 'method', 'page': 47, 'section': 'طرائق', 'title': 'حل معادلة من الشكل $(ax + b)(cx + d) = 0$', 'verified': True,
    'exercise': 'لتكن العبارة $F = (1 - 2x)(4x - 3) - 3(4x - 3)$ . 1) حلّل العبارة F إلى جداء عاملين من الدرجة الأولى. 2) حل المعادلة $(1 - 2x)(4x - 3) - 3(4x - 3) = 0$ .',
    'solution': [
        '1) لاحظ: العامل المشترك للجدائين $(1 - 2x)(4x - 3)$ و $3(4x - 3)$ هو $(4x - 3)$ . إذن $F = (4x - 3)[(1 - 2x) - 3]$ ومنه $F = (4x - 3)(-2x - 2)$',
        '2) ممّا سبق نستنتج أنّ حل المعادلة $(1 - 2x)(4x - 3) - 3(4x - 3) = 0$ يؤول إلى حل المعادلة $(4x - 3)(-2x - 2) = 0$ . ينتج من المعادلة $(4x - 3)(-2x - 2) = 0$ أنّ: $4x - 3 = 0$ أو $-2x - 2 = 0$ . أي $x = \\dfrac{3}{4}$ أو $x = -1$ . إذن للمعادلة $(1 - 2x)(4x - 3) - 3(4x - 3) = 0$ حلّان هما: $-1$ و $\\dfrac{3}{4}$',
    ],
    'answer': {'factored': fac('(1-2*x)*(4*x-3)-3*(4*x-3)'), 'check': check_eq('(1-2*x)*(4*x-3)-3*(4*x-3)', '(4*x-3)*(-2*x-2)'), 'roots': eq('(1-2*x)*(4*x-3)-3*(4*x-3)', '0')},
})

E.append({
    'id': 'now-47-1', 'kind': 'try-now', 'page': 47, 'section': 'دوري الآن', 'number': 1, 'verified': True,
    'text': 'حل كل معادلة مما يلي: $7 - 2x = 0$ ، $\\dfrac{-x + 3}{2} = \\dfrac{2x + 1}{3}$ ، $2x - \\dfrac{1}{3} = \\dfrac{x}{5} + 2$ .',
    'answer': {'7 - 2x = 0': eq('7-2*x', '0'), '(-x+3)/2 = (2x+1)/3': eq('(-x+3)/2', '(2*x+1)/3'), '2x - 1/3 = x/5 + 2': eq('2*x-Rational(1,3)', 'x/5+2')},
    'answerSource': 'computed',
})

E.append({
    'id': 'now-47-2', 'kind': 'try-now', 'page': 47, 'section': 'دوري الآن', 'number': 2, 'verified': True,
    'text': 'حل كلا من المعادلات الآتية: $4x(-x + 1) = 0$ ، $(2x + 1)^2 = 0$ ، $4x^2 - 1 = 0$ ، $9x^2 = 4x$ .',
    'answer': {'4x(-x+1) = 0': eq('4*x*(-x+1)', '0'), '(2x+1)² = 0': eq('(2*x+1)**2', '0'), '4x² - 1 = 0': eq('4*x**2-1', '0'), '9x² = 4x': eq('9*x**2', '4*x')},
    'answerSource': 'computed',
})

E.append({
    'id': 'method-inequality', 'kind': 'method', 'page': 49, 'section': 'طرائق', 'title': 'حل متراجحة من الدرجة الأولى بمجهول واحد', 'verified': True,
    'exercise': 'حل كل متراجحة مما يلي ثم مثّل بيانيا حلولها. أ) $-7x + 1 < x - 3$ ؛ ب) $\\dfrac{3x + 2}{6} \\geq \\dfrac{2x - 3}{5}$ .',
    'solution': [
        'أ) نطرح العدد 1 من طرفي المتراجحة $-7x + 1 < x - 3$ فنحصل على $-7x < x - 3 - 1$ أي $-7x < x - 4$ . نطرح العدد $x$ من طرفي المتراجحة الأخيرة، فنحصل على $-7x - x < -4$ أي $-8x < -4$ . نقسم طرفي المتراجحة $-8x < -4$ على العدد $-8$ ، فنحصل على $x > \\dfrac{-4}{-8}$ أي $x > \\dfrac{1}{2}$ . ينتج أن حلول المتراجحة $-7x + 1 < x - 3$ هي كل الأعداد $x$ الأكبر من $\\dfrac{1}{2}$ . الجزء الملوّن بالأحمر هو التمثيل البياني لحلول المتراجحة $-7x + 1 < x - 3$ .',
        'ب) نضرب طرفي المتراجحة في العدد 30 (30 هو المقام المشترك للنسبتين $\\dfrac{3x + 2}{6}$ و $\\dfrac{2x - 3}{5}$ ). فنحصل على المتراجحة $15x + 10 \\geq 12x - 18$ . بعد التبسيط، نحصل على المتراجحة $3x \\geq -28$ وبقسمة الطرفين على العدد 3، نحصل على $x \\geq \\dfrac{-28}{3}$ . ينتج أن حلول المتراجحة $\\dfrac{3x - 2}{6} \\geq \\dfrac{2x - 3}{5}$ هي كل الأعداد $x$ الأكبر من أو تساوي $\\dfrac{-28}{3}$ . الجزء الملوّن بالأحمر هو التمثيل البياني لحلول المتراجحة $\\dfrac{3x - 2}{6} \\geq \\dfrac{2x - 3}{5}$ .',
    ],
    'discrepancy': 'Solution b) : l’énoncé est (3x + 2)/6 ≥ (2x − 3)/5 et le calcul 15x + 10 ≥ 12x − 18 lui correspond, mais les deux conclusions écrivent « (3x − 2)/6 ».',
    'correction': {'decidedBy': 'owner-policy', 'decidedOn': '2026-10-01', 'text': 'ينتج أن حلول المتراجحة $\\dfrac{3x + 2}{6} \\geq \\dfrac{2x - 3}{5}$ هي كل الأعداد $x$ الأكبر من أو تساوي $\\dfrac{-28}{3}$ .', 'note': '« 3x − 2 » → « 3x + 2 » dans les deux phrases de conclusion, comme dans l’énoncé et le calcul.'},
    'answer': {'a': ineq('-7*x+1', 'x-3', '<'), 'b': ineq('(3*x+2)/6', '(2*x-3)/5', '>=')},
})

E.append({
    'id': 'method-modelling', 'kind': 'method', 'page': 49, 'section': 'طرائق', 'title': 'ترييض مشكلة', 'verified': True,
    'exercise': 'شخص عمره 36 سنة و أعمار أبنائه الثلاثة بالسنوات هي 4 ، 6 ، 8 على التوالي. بعد كم سنة يكون عمر الأب يساوي مجموع أعمار أبنائه الثلاثة؟',
    'solution': [
        'أ) نسمي $x$ عدد السنوات التي يكون بعدها عمر الأب هو مجموع أعمار أبنائه الثلاثة.',
        'ب) نُعبّر عن هذه الوضعية بالمعادلة $36 + x = (4 + x) + (6 + x) + (8 + x)$ .',
        'جـ) نحل المعادلة التي وجدناها والتي تكتب على الشكل $36 + x = 3x + 18$ ومنه يكون $2x = 18$ أي $x = 9$ . بالتالي يكون عمر الأب مساويا مجموعَ أعمار أبنائه الثلاثة بعد 9 سنوات.',
        'التحقق: بعد 9 سنوات يكون عمر الأب هو 45 سنة وأعمار الأبناء هي 13 ، 15 و 17 ولدينا $13 + 15 + 17 = 45$ .',
    ],
    'answer': {'x': eq('36+x', '(4+x)+(6+x)+(8+x)'), 'check': 13 + 15 + 17 == 45},
})

E.append({
    'id': 'now-49-1', 'kind': 'try-now', 'page': 49, 'section': 'دوري الآن', 'number': 1, 'verified': True,
    'text': 'حل كل متراجحة مما يلي ثم مثل بيانيا حلولها : $-5(2x - 1) \\leq 2 - 4x$ ، $\\dfrac{5x - 1}{2} + 3 > 1 + 2x$ .',
    'answer': {'-5(2x-1) ≤ 2-4x': ineq('-5*(2*x-1)', '2-4*x', '<='), '(5x-1)/2 + 3 > 1 + 2x': ineq('(5*x-1)/2+3', '1+2*x', '>')},
    'answerSource': 'computed',
})

E.append({
    'id': 'now-49-2', 'kind': 'try-now', 'page': 49, 'section': 'دوري الآن', 'number': 2, 'verified': True,
    'text': '1) حل المتراجحة $4x \\geq 84 - 3x$ . 2) ما هو أقصر ضلع المربع بحيث يكون محيطه أكبر من أو يساوي محيط المثلث؟',
    'figure': 'مربع ضلعه $x$ ومثلث متقايس الأضلاع ملتصقان، طول قاعدتيهما معا 28cm.',
    'answer': {'q1': ineq('4*x', '84-3*x', '>='), 'q2': {'model': '4x \\geq 3(28 - x)', 'shortestSide': 12}, 'check': check_eq('3*(28-x)', '84-3*x')},
    'answerSource': 'computed',
})

# ── أوظّف تعلّماتي ─────────────────────────────────────────────────────────
G1, G2, G3 = 'المعادلات من الدرجة الأولى بمجهول واحد', 'المعادلات من الشكل $(ax + b)(cx + d) = 0$', 'المتراجحات من الدرجة الأولى بمجهول واحد'


def exercise(n, page, group, text, **extra):
    d = {'id': f'ex-{n}', 'kind': 'exercise', 'number': n, 'page': page, 'section': 'أوظّف تعلّماتي', 'group': group, 'verified': True, 'text': text}
    d.update(extra)
    d['answerSource'] = 'computed'
    return d


def items(*pairs):
    """[(tex, lhs, rhs)] → items avec solutions ; rel optionnel en 4e position pour une inéquation."""
    out = []
    for p in pairs:
        if len(p) == 3:
            out.append({'tex': p[0], 'solutions': eq(p[1], p[2])})
        else:
            out.append({'tex': p[0], 'solution': ineq(p[1], p[2], p[3])})
    return out


E.append(exercise(1, 50, G1, 'حل كل معادلة من المعادلات المقترحة:', items=items(
    ('$2x = 11$', '2*x', '11'), ('$-3x = 5$', '-3*x', '5'), ('$2{,}8x = 5{,}6$', '2.8*x', '5.6'), ('$\\dfrac{x}{4} = 7$', 'x/4', '7'))))
E.append(exercise(2, 50, G1, 'حل كل معادلة من المعادلات المقترحة:', items=items(
    ('$10x = 10^2$', '10*x', '10**2'), ('$10^5x = 10^3$', '10**5*x', '10**3'), ('$7^2x = 7^3$', '7**2*x', '7**3'))))
E.append(exercise(3, 50, G1, 'حل كل معادلة من المعادلات المقترحة:', items=items(
    ('$x + 11 = 2$', 'x+11', '2'), ('$x - 4 = 4$', 'x-4', '4'), ('$\\sqrt{2} - x = 1 - \\sqrt{2}$', 'sqrt(2)-x', '1-sqrt(2)'), ('$3{,}2 + x = 5$', '3.2+x', '5'))))
E.append(exercise(4, 50, G1, 'حل كل معادلة من المعادلات المقترحة:', items=items(
    ('$5x + 6 = 11$', '5*x+6', '11'), ('$2x - 3 = 3x + 1$', '2*x-3', '3*x+1'), ('$4x - 3 = -2x + 5$', '4*x-3', '-2*x+5'), ('$5x + 11 = 11x + 5$', '5*x+11', '11*x+5'))))
E.append(exercise(5, 50, G1, 'حل كل معادلة من المعادلات الآتية:', items=items(
    ('$\\sqrt{2}x = \\sqrt{8}$', 'sqrt(2)*x', 'sqrt(8)'), ('$2\\sqrt{3}x = \\sqrt{3}x + \\sqrt{27}$', '2*sqrt(3)*x', 'sqrt(3)*x+sqrt(27)'),
    ('$\\sqrt{2}x + \\sqrt{8}x = 4\\sqrt{2} + 8\\sqrt{2}$', 'sqrt(2)*x+sqrt(8)*x', '4*sqrt(2)+8*sqrt(2)'),
    ('$\\dfrac{1}{\\sqrt{2}}x - \\dfrac{1}{2}x = \\dfrac{5}{\\sqrt{2} + 1}$', 'x/sqrt(2)-x/2', '5/(sqrt(2)+1)'),
    ('$2\\sqrt{5}x - \\dfrac{\\sqrt{5}}{3}x = \\dfrac{\\sqrt{5}}{5}$', '2*sqrt(5)*x-sqrt(5)/3*x', 'sqrt(5)/5'))))
E.append(exercise(6, 50, G1, '1) انشر العبارة وبسطها $2x + 24 - 7(x - 2)$ . 2) حل المعادلة $2x + 24 - 7(x - 2) = 138$ .',
                  answer={'expanded': ex('2*x+24-7*(x-2)'), 'solutions': eq('2*x+24-7*(x-2)', '138')}))
E.append(exercise(7, 50, G1, '1) انشر كلا من العبارتين وبسطها $2(2x - 1) + 3$ و $5(x + 3) - 3x$ . 2) حل المعادلة $2(2x - 1) + 3 = 5(x + 3) - 3x$ .',
                  answer={'A': ex('2*(2*x-1)+3'), 'B': ex('5*(x+3)-3*x'), 'solutions': eq('2*(2*x-1)+3', '5*(x+3)-3*x')}))
E.append(exercise(8, 50, G1, 'حل كل معادلة من المعادلتين الآتيتين:', items=items(
    ('$\\dfrac{1}{2}(2x - 1) - 3\\left(\\dfrac{2}{3}x - \\dfrac{1}{2}\\right) = 0$', '(2*x-1)/2-3*(Rational(2,3)*x-Rational(1,2))', '0'),
    ('$4x^2 - 2(x + 5) - 3 - 2x(2x - 3) = 0$', '4*x**2-2*(x+5)-3-2*x*(2*x-3)', '0'))))
E.append(exercise(9, 50, G1, 'حل كل معادلة من المعادلات الآتية:', items=items(
    ('$\\dfrac{x - 1}{9} = \\dfrac{x + 1}{3}$', '(x-1)/9', '(x+1)/3'), ('$\\dfrac{2 + x}{2} = \\dfrac{2x + 1}{4}$', '(2+x)/2', '(2*x+1)/4'),
    ('$\\dfrac{x + 4}{10} = \\dfrac{3}{10} - \\dfrac{2x}{5}$', '(x+4)/10', 'Rational(3,10)-2*x/5'), ('$x = \\dfrac{x + 3}{5} + 1$', 'x', '(x+3)/5+1')),
    note='La deuxième équation se réduit à 4 = 1 : elle n’a AUCUNE solution (le manuel ne l’annonce pas ; la plateforme le dit, sans prétendre à une théorie hors programme).'))
E.append(exercise(10, 50, G1, 'ما هو العدد الذي إذا ضربته في 6 و أضفت إلى الناتج 7، تحصل على 31؟',
                  answer={'equation': '6x + 7 = 31', 'solutions': eq('6*x+7', '31')}))
E.append(exercise(11, 50, G1, 'ما هو العدد الذي إذا ضربته في 3 و طرحت منه 21، تحصل على ضعف العدد الذي اخترته في البداية؟',
                  answer={'equation': '3x - 21 = 2x', 'solutions': eq('3*x-21', '2*x')}))
E.append(exercise(12, 50, G1, 'يبلغ عمر أب 43 سنة وعمرا إبنيه 4 و 7 سنوات بعد كم سنة يكون عمر الأب ضعف مجموع عمري إبنيه؟',
                  answer={'equation': '43 + x = 2[(4 + x) + (7 + x)]', 'solutions': eq('43+x', '2*((4+x)+(7+x))'), 'check': 43 + 7 == 2 * (11 + 14)}))
E.append(exercise(13, 50, G1, 'بلغت النسبة المئوية لإنجاز بناء سَدّ 75% من المدة المقرّرة، ثم تواصل البناء لمدة 4 سنوات. إذا علمت أنّ المُدّة المتبقية لإنجاز المشروع هي 11 سنة، فما هي المُدّة المُقرّرة لبنائه؟',
                  discrepancy='Énoncé elliptique : la lecture retenue (la seule qui donne une équation du premier degré cohérente) est « le temps écoulé a atteint 75 % de la durée prévue D, puis 4 ans de plus, et il reste 11 ans » : 0,75D + 4 + 11 = D.',
                  answer={'equation': '0{,}75x + 4 + 11 = x', 'solutions': eq('Rational(3,4)*x+4+11', 'x')}))
E.append(exercise(14, 50, G2, 'حل كل معادلة من المعادلات الآتية:', items=items(
    ('$7(x + 2) = 0$', '7*(x+2)', '0'), ('$(x + 5)(2 - x) = 0$', '(x+5)*(2-x)', '0'),
    ('$\\dfrac{2}{3}x(x - 4) = 0$', 'Rational(2,3)*x*(x-4)', '0'), ('$(5 - 3x)(2x - 4) = 0$', '(5-3*x)*(2*x-4)', '0'))))
E.append(exercise(15, 50, G2, '1) حلّل إلى جداء عاملين العبارة $6x^2 - 3x$ . 2) حل المعادلة $6x^2 - 3x = 0$ .',
                  answer={'factored': fac('6*x**2-3*x'), 'solutions': eq('6*x**2-3*x', '0')}))
E.append(exercise(16, 50, G2, '1) حلّل إلى جداء عاملين العبارة : $5(x + 3) + (x - 1)(x + 3)$ . 2) حل المعادلة $5(x + 3) + (x - 1)(x + 3) = 0$ .',
                  answer={'factored': fac('5*(x+3)+(x-1)*(x+3)'), 'solutions': eq('5*(x+3)+(x-1)*(x+3)', '0')}))
E.append(exercise(17, 50, G2, '1) حلّل إلى جداء عاملين العبارة $x^2 - 25$ . 2) حل المعادلة $x^2 - 25 = 0$ .',
                  answer={'factored': fac('x**2-25'), 'solutions': eq('x**2-25', '0')}))
E.append(exercise(18, 50, G2, 'لتكن العبارة $p$ حيث $p = (9x^2 - 1) + 6x^2 + 7x - 3$ . 1) تحقّق أنّ: $(3x - 1)(2x + 3) = 6x^2 + 7x - 3$ 2) حلّل العبارة $9x^2 - 1$ . 3) حلّل العبارة $p$ إلى جداء عاملين من الدرجة الأولى 4) حل المعادلة $p = 0$ .',
                  answer={'q1': check_eq('(3*x-1)*(2*x+3)', '6*x**2+7*x-3'), 'q2': fac('9*x**2-1'), 'q3': fac('(9*x**2-1)+6*x**2+7*x-3'), 'solutions': eq('(9*x**2-1)+6*x**2+7*x-3', '0')}))
E.append(exercise(19, 51, G2, '$p$ عبارة حيث: $p = (x^2 + 10x + 25) - (x^2 - 25)$ . 1) حلّل كل عبارة من العبارتين: $A = x^2 + 10x + 25$ و $B = x^2 - 25$ 2) حلّل العبارة $p$ إلى جداء عاملين من الدرجة الأولى. حل المعادلة $p = 0$ .',
                  discrepancy='« إلى جداء عاملين من الدرجة الأولى » : p = 10(x + 5), un seul facteur du premier degré (10 est une constante).',
                  answer={'A': fac('x**2+10*x+25'), 'B': fac('x**2-25'), 'p': fac('(x**2+10*x+25)-(x**2-25)'), 'pAsProduct': '(x + 5)[(x + 5) - (x - 5)] = 10(x + 5)', 'solutions': eq('(x**2+10*x+25)-(x**2-25)', '0')}))
E.append(exercise(20, 51, G2, '1) تحقّق أنّ $(2x - 1)^2 - 81 = 4x^2 - 4x - 80$ . 2) استنتج تحليلا للعبارة $A = 4x^2 - 4x - 80$ . 3) حل المعادلة $4x^2 - 4x - 80 = 0$ .',
                  answer={'q1': check_eq('(2*x-1)**2-81', '4*x**2-4*x-80'), 'q2': '(2x - 1 - 9)(2x - 1 + 9) = (2x - 10)(2x + 8)', 'check': check_eq('4*x**2-4*x-80', '(2*x-10)*(2*x+8)'), 'solutions': eq('4*x**2-4*x-80', '0')}))
E.append(exercise(21, 51, G3, 'أكمل في كل حالة مما يلي بالرمز المناسب < أو >. 1) $-1{,}8 \\ldots -1{,}84$ 2) $3{,}49 \\times 10^3 \\ldots 3{,}5 \\times 10^3$ 3) $1 + \\dfrac{3}{2} \\ldots \\dfrac{7}{3}$',
                  answer=['>' if S('-1.8') > S('-1.84') else '<', '<' if S('3.49e3') < S('3.5e3') else '>', '>' if S('1+3/2') > S('7/3') else '<']))
E.append(exercise(22, 51, G3, 'إذا علمت أن $x > \\dfrac{3}{2}$ . أكمل كلا مما يلي: $2x > \\ldots$ ، $-4x \\ldots -6$ ، $2x + 5 \\ldots\\ldots$ .',
                  answer={'2x': '2x > 3', '-4x': '-4x < -6', '2x+5': '2x + 5 > 8'}))
E.append(exercise(23, 51, G3, 'إذا علمت أن $x < -2$ . أكمل كلا مما يلي: $5x < \\ldots$ ، $-2x \\ldots 4$ ، $3x - 1 \\ldots\\ldots$ .',
                  answer={'5x': '5x < -10', '-2x': '-2x > 4', '3x-1': '3x - 1 < -7'}))
E.append(exercise(24, 51, G3, 'حل كل متراجحة مما يلي:', items=items(
    ('$3x \\geq -2$', '3*x', '-2', '>='), ('$-2x < 4$', '-2*x', '4', '<'), ('$\\dfrac{5}{3}x > 10$', 'Rational(5,3)*x', '10', '>'))))
E.append(exercise(25, 51, G3, '1) إليك المتراجحة $3x - 2 < 6$ . عين قيم $x$ التي تحقّق هذه المتراجحة من بين القيم الآتية: $x = 0$ ، $x = -2$ ، $x = 3$ ، $x = \\dfrac{8}{3}$ . 2) حل المتراجحة المعطاة.',
                  answer={'q1': {str(v): truth('3*x-2', '6', '<', v) for v in ['0', '-2', '3', '8/3']}, 'q2': ineq('3*x-2', '6', '<')}))
E.append(exercise(26, 51, G3, 'حل المتراجحة $4x - 1 \\leq 17 - 2x$ .', answer=ineq('4*x-1', '17-2*x', '<=')))
E.append(exercise(27, 51, G3, 'حل كل متراجحة مما يلي:', items=items(
    ('$\\dfrac{5}{2}x - \\dfrac{1}{3} > 0$', 'Rational(5,2)*x-Rational(1,3)', '0', '>'), ('$1{,}2x - 0{,}6 \\leq 3$', '1.2*x-0.6', '3', '<='),
    ('$\\dfrac{x}{2} - \\dfrac{3}{4} \\geq 1$', 'x/2-Rational(3,4)', '1', '>='), ('$\\dfrac{x + 1}{2} < 3x - 1$', '(x+1)/2', '3*x-1', '<'))))
E.append(exercise(28, 51, G3, '1) حل المتراجحة $2x - 1 \\leq 6$ . 2) مثّل بيانيا حلول هذه المتراجحة.', answer=ineq('2*x-1', '6', '<=')))
E.append(exercise(29, 51, G3, '1) انشر وبسّط العبارة P حيث: $P = (-3x - 1)^2 - 3x(3x + 7)$ . 2) حلّل العبارة $R = (4x^2 - 1) - (2x + 1)(2x + 3)$ 3) حل المتراجحة $P \\leq R$ ثمّ مثّل بيانيا حلولها.',
                  answer={'P': ex('(-3*x-1)**2-3*x*(3*x+7)'), 'R': fac('(4*x**2-1)-(2*x+1)*(2*x+3)'), 'Rexpanded': ex('(4*x**2-1)-(2*x+1)*(2*x+3)'),
                          'solution': ineq('(-3*x-1)**2-3*x*(3*x+7)', '(4*x**2-1)-(2*x+1)*(2*x+3)', '<=')}))
E.append(exercise(30, 51, G3, 'لاحظ الشكل التالي: ما هي قيم $x$ التي من أجلها يكون محيط المستطيل أكبر من محيط المثلث المتقايس الأضلاع؟',
                  figure='مستطيل بعداه $x$ و 6cm، وفوقه مثلث متقايس الأضلاع قاعدته الضلع العلوي للمستطيل (طوله $x$).',
                  answer={'model': '2x + 12 > 3x', 'solution': ineq('2*x+12', '3*x', '>'), 'withLength': '0 < x < 12'}))
E.append(exercise(31, 51, G3, '1) حل المتراجحة الآتية: $5(2x - 1) \\geq 4x - 1$ . 2) مثّل بيانيا حلول هذه المتراجحة.', answer=ineq('5*(2*x-1)', '4*x-1', '>=')))
E.append(exercise(32, 51, G3, '1) حلّ كلا من المتراجحتين الآتيتين: 2) مثّل بيانيا حلول كل متراجحة.', items=items(
    ('$3(2x - 6) + 4(2x - 3) \\geq 2x - 5(2x - 3)$', '3*(2*x-6)+4*(2*x-3)', '2*x-5*(2*x-3)', '>='),
    ('$6(1 - 2x) - 4(-2x - 5) > 3(x - 7) - 2(8 - 9x)$', '6*(1-2*x)-4*(-2*x-5)', '3*(x-7)-2*(8-9*x)', '>'))))
E.append(exercise(33, 51, G3, 'ABCD مستطيل. 1) عبّر عن محيطه P بدلالة طوله $x$ . 2) ما القيم التي يمكن أن يأخذها $x$ حتى يكون محيط المستطيل أكبر من أو يساوي 40cm.',
                  figure='مستطيل ABCD عرضه $BC = 3cm$ وطوله $DC = x$.',
                  answer={'P': ex('2*(x+3)'), 'solution': ineq('2*(x+3)', '40', '>=')}))

# ── أؤكّد تعلّماتي ─────────────────────────────────────────────────────────
assert eq('-2+x', '5') == ['7'] and eq('4*x', '5*x') == ['0']
assert eq('(x-3)*(2*x+2)', '0') == ['-1', '3'] and eq('x**2-1', '0') == ['-1', '1']
assert all(truth('2*x+2', '0', '>=', v) and truth('2*x', '-2', '>=', v) and not truth('2*x-2', '0', '<', 5) for v in [-1, 0, 4])
assert not truth('2*x', '-3', '<', -1) and truth('2*x+1', '0', '<', -1) and truth('-x+1', '0', '>', -1)
assert ineq('-x/3', '1', '>')['tex'] == 'x < -3' and ineq('x+1', '-1', '>')['tex'] == 'x > -2'
E.append({
    'id': 'qcm', 'kind': 'qcm', 'page': 52, 'section': 'أؤكّد تعلّماتي', 'verified': True,
    'instruction': 'في كل حالة مما يلي اختر الإجابة أو الإجابات الصحيحة، وبرّر اختيارك.',
    'items': [
        {'n': 1, 'text': 'حل المعادلة $-2 + x = 5$ هو...', 'options': ['2', '7', '3'], 'correct': [1], 'backToPage': [46, 47]},
        {'n': 2, 'text': 'حل المعادلة $4x = 5x$ هو ...', 'options': ['$\\dfrac{5}{4}$', '0', '$\\dfrac{4}{5}$'], 'correct': [1], 'backToPage': [46, 47]},
        {'n': 3, 'text': 'المعادلة $(x - 3)(2x + 2) = 0$ تقبل...', 'options': ['حلا واحدا هو 3', 'حلا واحدا هو $-1$', 'حلين هما 3 و $-1$'], 'correct': [2], 'backToPage': [46, 47]},
        {'n': 4, 'text': 'المعادلة $x^2 - 1 = 0$ تقبل ...', 'options': ['حلين هما 1 و $-1$', 'حلا واحدا هو 1', 'حلا واحدا هو $-1$'], 'correct': [0], 'backToPage': [46, 47]},
        {'n': 5, 'text': 'إذا كان $x \\geq -1$ فإن ...', 'options': ['$2x + 2 \\geq 0$', '$2x - 2 < 0$', '$2x \\geq -2$'], 'correct': [0, 2], 'backToPage': [48, 49]},
        {'n': 6, 'text': 'التمثيل على مستقيم مدرّج للأعداد $x$ حيث $x > -3$ هو ...',
         'options': ['الجزء الملوّن على يسار $-3$ والرمز ] عند $-3$', 'الجزء الملوّن على يمين $-3$ والرمز ] عند $-3$', 'الجزء الملوّن على يسار 0 والرمز [ عند 0'],
         'optionsMean': ['x \\leq -3', 'x > -3', 'x < 0'], 'correct': [1], 'backToPage': [48, 49]},
        {'n': 7, 'text': '$-1$ هو حل للمتراجحة ...', 'options': ['$2x < -3$', '$2x + 1 < 0$', '$-x + 1 > 0$'], 'correct': [1, 2], 'backToPage': [48, 49]},
        {'n': 8, 'text': 'حلول المتراجحة $-\\dfrac{1}{3}x > 1$ هي الأعداد $x$ حيث ...', 'options': ['$x > 3$', '$x < -3$', '$x > -3$'], 'correct': [1], 'backToPage': [48, 49]},
        {'n': 9, 'text': 'التمثيل البياني لحلول المتراجحة $x + 1 > -1$ هو ...',
         'options': ['الجزء الملوّن على يمين $-2$ والرمز ] عند $-2$', 'الجزء الملوّن على يسار $-2$ والرمز [ عند $-2$', 'الجزء الملوّن على يسار 0 والرمز [ عند 0'],
         'optionsMean': ['x > -2', 'x < -2', 'x < 0'], 'correct': [0], 'backToPage': [48, 49]},
    ],
    'answerSource': 'computed',
})

E.append({
    'id': 'situation', 'kind': 'situation', 'page': 52, 'section': 'أدمج تعلّماتي', 'title': 'وضعية', 'verified': True,
    'text': 'لممارسة رياضة السباحة في المسبح البلدي، يقترح نادٍ رياضيٌّ على التلاميذ المتمدرسين صيغتين للاشتراك. الصيغة الأولى: الدفع الفوري 75 دينارًا لكل حصة. الصيغة الثانية: اشتراك سنوي قدره 560 دينارا ودفع فوري قدره 5 دنانير لكل حصة. ابتداءً من أي عدد للحصص تكون التسعيرة الثانية أفضل ؟',
    'figure': 'صورة مسبح أولمبي مغطّى (صورة فوتوغرافية في الكتاب — ترسمها المنصّة ولا تنسخها).',
    'analysis': [
        'قراءة الوضعية وفهمها: ترجمة كل صيغة بعبارة حرفية، لتحديد الصيغة الأفضل نقارن الصيغتين.',
        'تحليل الوضعية واختيار استراتيجية حل مناسبة: يمكن التفكير في التجريب، كتابة متراجحة مناسبة وحلّها فيما بعد.',
        'تنفيذ استراتيجية الحل: إجراء تجريب ، حل متراجحة ، ....، تفسير النتائج',
    ],
    'answer': {
        'formula1': '75x', 'formula2': '560 + 5x', 'inequality': '560 + 5x < 75x',
        'solution': ineq('560+5*x', '75*x', '<'), 'equalAt': eq('560+5*x', '75*x'),
        'conclusion': 'ابتداءً من 9 حصص تكون الصيغة الثانية أفضل (عند 8 حصص تتساوى الصيغتان: 600 دينار).',
        'check': [75 * 8 == 560 + 5 * 8, 75 * 9 > 560 + 5 * 9, 75 * 7 < 560 + 5 * 7],
    },
    'answerSource': 'computed',
})

# ── أتعمّق ─────────────────────────────────────────────────────────────────


def deep(n, text, **extra):
    d = {'id': f'ex-{n}', 'kind': 'exercise', 'number': n, 'page': 53, 'section': 'أتعمّق', 'verified': True, 'text': text}
    d.update(extra)
    d['answerSource'] = 'computed'
    return d


E.append(deep(34, 'لتكن العبارة E حيث $E = (5x - 1)^2 - (2x + 3)(5x - 1)$ 1) انشر وبسّط العبارة E. 2) حلّل العبارة E إلى جداء عاملين. 3) احسب قيمة E من أجل كل من: $x = \\dfrac{1}{5}$ و $x = -1$ . 4) حل المعادلة $E = 0$ .',
              answer={'expanded': ex('(5*x-1)**2-(2*x+3)*(5*x-1)'), 'factored': fac('(5*x-1)**2-(2*x+3)*(5*x-1)'),
                      'E(1/5)': fmt(S('(5*x-1)**2-(2*x+3)*(5*x-1)').subs(x, sp.Rational(1, 5))), 'E(-1)': fmt(S('(5*x-1)**2-(2*x+3)*(5*x-1)').subs(x, -1)),
                      'solutions': eq('(5*x-1)**2-(2*x+3)*(5*x-1)', '0')}))
E.append(deep(35, '1) تحقّق من صحة المساواة $6(3x + 4)(3x - 4) = 54x^2 - 96$ 2) حلّل العبارة A بحيث $A = (3x + 4)(x - 7) - (54x^2 - 96)$ 3) حل المعادلة $A = 0$ . 4) حل المتراجحة $54x^2 - 96 \\leq 18x(3x + 1) - 90$ . مثّل بيانيا حلولها على مستقيم مدرّج.',
              answer={'q1': check_eq('6*(3*x+4)*(3*x-4)', '54*x**2-96'), 'A': fac('(3*x+4)*(x-7)-(54*x**2-96)'), 'AasTextbook': '(3x + 4)(-17x + 17)',
                      'check': check_eq('(3*x+4)*(x-7)-(54*x**2-96)', '(3*x+4)*(-17*x+17)'),
                      'solutions': eq('(3*x+4)*(x-7)-(54*x**2-96)', '0'), 'inequality': ineq('54*x**2-96', '18*x*(3*x+1)-90', '<=')}))
E.append(deep(36, '1) انشر كلا من العبارتين وبسطها: $A = (x + 4)^2 - x(x - 2)$ ، $B = (3x - 1)(3x + 1) - (3x - 2)^2$ 2) حل المتراجحة $A \\geq B$ ذات المجهول $x$ .',
              answer={'A': ex('(x+4)**2-x*(x-2)'), 'B': ex('(3*x-1)*(3*x+1)-(3*x-2)**2'), 'solution': ineq('(x+4)**2-x*(x-2)', '(3*x-1)*(3*x+1)-(3*x-2)**2', '>=')}))
E.append(deep(37, 'إليك برنامج حساب. • اختر عددا. • اضربه في 3 • أضف له 5. 1) ماهو العدد الذي ينبغي اختياره إذا أردنا الحصول في النتيجة على العدد 32؟ 2) ماهو العدد الذي ينبغي إختياره إذا أردنا الحصول في النتيجة على ضعفه؟',
              answer={'q1': eq('3*x+5', '32'), 'q2': eq('3*x+5', '2*x')}))
E.append(deep(38, 'ما هي قيم $x$ التي من أجلها يُمكن إنشاء مثلث أطوال أضلاعه بالسنتيمتر: 5 ، $x$ و 7.',
              answer={'model': ['x < 5 + 7', '7 < 5 + x', '5 < x + 7'], 'solution': '2 < x < 12',
                      'checks': [ineq('x', '5+7', '<'), ineq('7', '5+x', '<')]},
              note='Inégalité triangulaire (programme de 1AM–2AM) : chaque côté est inférieur à la somme des deux autres ; les deux inéquations utiles donnent 2 < x < 12.'))
E.append(deep(39, 'في الشكل المقابل، كل من الرباعيين ABCD و EFGH هو مربع. 1) عبّر عن مساحة المربع EFGH بدلالة $x$ . 2) تحقّق أنّ $2x^2 - 16x + 30 = (2x - 10)(x - 3)$ 3) عيّن قيم $x$ التي من أجلها تكون مساحة المربع EFGH تُساوي $34cm^2$ .',
              figure='مربع ABCD ضلعه 8cm ؛ $AH = BE = CF = DG = x$ و $AE = BF = CG = DH = 8 - x$ ؛ المربع EFGH رؤوسه على أضلاع ABCD.',
              answer={'area': ex('64-4*x*(8-x)/2'), 'q2': check_eq('2*x**2-16*x+30', '(2*x-10)*(x-3)'), 'solutions': eq('64-4*x*(8-x)/2', '34'), 'both': 'x = 3 أو x = 5 (كلاهما بين 0 و 8)'}))
E.append(deep(40, 'لاحظ الشكل الآتي حيث الرباعي ABCD مربع (الوحدة 1cm). 1) عبّر عن مساحة المستطيل الملوّن بدلالة $x$ . 2) تحقّق أنّ $(x - 12)(x + 7) = x^2 - 5x - 84$ . 3) عيّن قيمة $x$ التي من أجلها تكون مساحة المستطيل المُلوّن تساوي $60cm^2$ .',
              figure='مربع ABCD ضلعه $x$ ؛ النقطة E على امتداد [AB] حيث $BE = 3$ ؛ النقطة G على [AD] حيث $GD = 8$ ؛ المستطيل الملوّن AEFG بعداه $x + 3$ و $x - 8$ .',
              discrepancy='Le dessin porte « 3m » et « 8m » alors que l’énoncé fixe l’unité à 1cm (aire en cm²) : lu 3 et 8 (cm).',
              correction={'decidedBy': 'owner-policy', 'decidedOn': '2026-10-01', 'figure': '$BE = 3cm$ و $GD = 8cm$', 'note': 'm → cm, comme l’unité annoncée.'},
              answer={'area': ex('(x+3)*(x-8)'), 'q2': check_eq('(x-12)*(x+7)', 'x**2-5*x-84'), 'equation': 'x^2 - 5x - 24 = 60 \\iff x^2 - 5x - 84 = 0',
                      'solutions': eq('(x+3)*(x-8)', '60'), 'x': 12, 'rejected': -7}))
E.append(deep(41, 'من امتحان شهادة التعليم المتوسط لتكن العبارة E حيث : $E = (4x - 1)^2 - (3x + 2)(4x - 1)$ 1) انشر وبسط العبارة E. 2) حلل العبارة E الى جداء عاملين. 3) حل المعادلة: $(4x - 1)(x - 3) = 0$ حل المتراجحة: $4x^2 - 13x + 3 \\leq 4x^2 + 29$',
              answer={'expanded': ex('(4*x-1)**2-(3*x+2)*(4*x-1)'), 'factored': fac('(4*x-1)**2-(3*x+2)*(4*x-1)'), 'solutions': eq('(4*x-1)*(x-3)', '0'),
                      'inequality': ineq('4*x**2-13*x+3', '4*x**2+29', '<=')}))
E.append(deep(42, '1) عيّن قيم $x$ التي من أجلها تتحقق المتراجحتان الآتيتان معًا: $-3x + 1 > 7x + 11$ و $\\dfrac{1}{2}x - 3 \\leq x - 1$ 2) مثّل بيانيا هذه الحلول.',
              answer={'first': ineq('-3*x+1', '7*x+11', '>'), 'second': ineq('x/2-3', 'x-1', '<='), 'both': '-4 \\leq x < -1'}))

assert ineq('-3*x+1', '7*x+11', '>')['tex'] == 'x < -1' and ineq('x/2-3', 'x-1', '<=')['tex'] == 'x \\geq -4'

DEST = {
    '_comment': 'elementId → { lesson, module } ; `duplicatedIn` autorise une seconde utilisation déclarée ; `items` répartit un élément à plusieurs sous-éléments. Vérifié par scripts/check-textbook-coverage.mjs.',
    'objectives': {'lesson': 'unit', 'module': 'page'},
    'history-khwarizmi': {'lesson': 'unit', 'module': 'page', 'duplicatedIn': [
        {'lesson': 'muadala-ula', 'module': 1, 'note': '« الجبر والمقابلة » : la balance des deux membres, le geste même de la leçon'},
        {'lesson': 'jidaa-maadum', 'module': 3, 'note': 'x² + 21 = 10x, jadhrâhâ 3 et 7 : (x − 3)(x − 7) = 0'}]},
    'challenge': {'lesson': 'unit', 'module': 'page', 'duplicatedIn': [{'lesson': 'jidaa-maadum', 'module': 3, 'note': 'x² + 12x = 85 : le carré complété (x + 6)² = 121, puis le produit nul (x − 5)(x + 17) = 0'}]},
    'prep': {'lesson': 'muadala-ula', 'module': 0, 'items': {
        '1-2': {'lesson': 'muadala-ula', 'module': 0},
        '3-5': {'lesson': 'jidaa-maadum', 'module': 0},
        '6-11': {'lesson': 'mutarajiha-ula', 'module': 0}}},
    'act-1': {'lesson': 'muadala-ula', 'module': 1},
    'know-1': {'lesson': 'muadala-ula', 'module': 2},
    'method-equation': {'lesson': 'muadala-ula', 'module': 3},
    'now-47-1': {'lesson': 'muadala-ula', 'module': 3},
    **{f'ex-{n}': {'lesson': 'muadala-ula', 'module': 4} for n in range(1, 10)},
    'act-2a': {'lesson': 'jidaa-maadum', 'module': 1},
    'act-2b': {'lesson': 'jidaa-maadum', 'module': 1},
    'act-2c': {'lesson': 'jidaa-maadum', 'module': 2},
    'know-2': {'lesson': 'jidaa-maadum', 'module': 2},
    'method-zero-product': {'lesson': 'jidaa-maadum', 'module': 3},
    'now-47-2': {'lesson': 'jidaa-maadum', 'module': 3},
    **{f'ex-{n}': {'lesson': 'jidaa-maadum', 'module': 4} for n in range(14, 21)},
    'act-3a': {'lesson': 'mutarajiha-ula', 'module': 1},
    'act-3b': {'lesson': 'mutarajiha-ula', 'module': 2},
    'know-3': {'lesson': 'mutarajiha-ula', 'module': 3},
    'know-4': {'lesson': 'mutarajiha-ula', 'module': 3},
    'method-inequality': {'lesson': 'mutarajiha-ula', 'module': 4},
    'now-49-1': {'lesson': 'mutarajiha-ula', 'module': 4},
    **{f'ex-{n}': {'lesson': 'mutarajiha-ula', 'module': 5} for n in [21, 22, 23, 24, 25, 26, 27, 28, 29, 31, 32]},
    'method-modelling': {'lesson': 'tarrid-mushkila', 'module': 1},
    'now-49-2': {'lesson': 'tarrid-mushkila', 'module': 2},
    **{f'ex-{n}': {'lesson': 'tarrid-mushkila', 'module': 3} for n in [10, 11, 12, 13, 30, 33, 37, 38, 39, 40]},
    'situation': {'lesson': 'wadiya-idmajiya-muadalat', 'module': 1, 'duplicatedIn': [{'lesson': 'wadiya-idmajiya-muadalat', 'module': 4}]},
    'qcm': {'lesson': 'wadiya-idmajiya-muadalat', 'module': 2, 'duplicatedIn': [
        {'lesson': 'muadala-ula', 'module': 5, 'items': [1, 2]},
        {'lesson': 'jidaa-maadum', 'module': 5, 'items': [3, 4]},
        {'lesson': 'mutarajiha-ula', 'module': 6, 'items': [5, 6, 7, 8, 9]}]},
    **{f'ex-{n}': {'lesson': 'wadiya-idmajiya-muadalat', 'module': 3} for n in [34, 35, 36, 41, 42]},
}

DISCREPANCIES = [
    {'elementId': 'know-3', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
     'text': 'Exemple 2, 2) : « لاحظ اتجاه المتراجحة قد يتغير » après une division par −3 — le sens CHANGE toujours ; lu « قد تغيّر ». Même tournure dans know-4, exemple 2 (multiplication par −2).'},
    {'elementId': 'know-4', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
     'text': 'Exemple 2 : « قد يتغير » après une multiplication par −2 ; lu « قد تغيّر ».'},
    {'elementId': 'method-inequality', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
     'text': 'Solution b) : l’énoncé et le calcul portent sur (3x + 2)/6, les deux conclusions écrivent (3x − 2)/6.'},
    {'elementId': 'ex-9', 'kind': 'note', 'text': '(2 + x)/2 = (2x + 1)/4 se réduit à 4 = 1 : aucune solution. Le manuel ne l’annonce pas ; la leçon le dit honnêtement (« لا يوجد أي عدد يحقّق المساواة ») sans introduire de théorie hors programme.'},
    {'elementId': 'ex-13', 'kind': 'ambiguity', 'text': 'Énoncé elliptique ; lecture retenue 0,75D + 4 + 11 = D (D = 60). Voir element.discrepancy.'},
    {'elementId': 'ex-19', 'kind': 'wording', 'text': '« جداء عاملين من الدرجة الأولى » : p = 10(x + 5) n’a qu’un facteur du premier degré.'},
    {'elementId': 'ex-40', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
     'text': 'Figure : « 3m » et « 8m » alors que l’unité annoncée est 1cm (aire 60cm²).'},
    {'elementId': 'unit', 'kind': 'placement', 'text': 'Le programme (programme_4am_2026_2027.json) range ces sujets (muadalat_daraja_ula, muadalat_jida_maadum, mutarajihat) dans « ميدان الحساب الحرفي » ; le propriétaire a demandé (2026-10-01) de placer l’unité sous « ميدان أنساب الأعداد والحساب », comme les unités 1 à 3. Voir units_4am_2026_2027.json › placement.'},
]

doc = {
    '_comment': [
        'EXTRACTION CANONIQUE du manuel scolaire officiel — 4AM, الجيل الثاني, unité 4 « معادلات ومتراجحات من الدرجة الأولى بمجهول واحد ».',
        'Source : « وحدة المعادلات و المتراجحات.pdf » (11 pages PDF = pages 43 à 53 du manuel), scan sans couche texte.',
        'Ce fichier est LA source de vérité pédagogique de l’unité dans le dépôt. Tout contenu de leçon, toute manipulation,',
        'tout exercice de pratique cite un `id` d’ici via `source.elementId`.',
        'Transcription VISUELLE (pages rendues à 220 dpi, zooms sur les passages douteux) ; la formulation arabe est celle du manuel.',
        'Les réponses (`answer`) NE viennent PAS du manuel (il n’a pas de corrigé) : elles sont calculées par sympy dans',
        'build-extraction.py et marquées `answerSource: computed`. Une inéquation résolue porte { relation, bound, tex, flipped }.',
        'Les coquilles sont CORRIGÉES dans les leçons (champ `correction`, politique du propriétaire du 2026-09-30) ; `discrepancies` les liste.',
        'Les `destinations` sont le plan de couverture : chaque élément a UNE destination (ou une répartition `items`),',
        'une seconde utilisation est déclarée dans `duplicatedIn`. scripts/check-textbook-coverage.mjs le vérifie.',
        'Généré par docs/sources/4am/unit4/build-extraction.py — ne pas éditer à la main.',
    ],
    'unitCode': 'muadalat-mutarajihat',
    'textbook': {'title': 'كتاب الرياضيات — السنة الرابعة من التعليم المتوسط', 'generation': 'الجيل الثاني', 'unitNumber': 4,
                 'unitTitle': 'معادلات ومتراجحات من الدرجة الأولى بمجهول واحد',
                 'pages': {'first': 43, 'last': 53}, 'pdfPageOffset': 42,
                 'sections': ['سأتعلّم في هذا الباب', 'تحدّ', 'أستعدّ', 'أنشطة', 'معارف', 'طرائق', 'دوري الآن', 'أوظّف تعلّماتي', 'أؤكّد تعلّماتي', 'أدمج تعلّماتي', 'أتعمّق']},
    'frozenAt': '2026-10-01',
    'terminology': {'note': 'Le manuel écrit « معادلة من الدرجة الأولى بمجهول واحد », « حل » / « حلول », « الحل الوحيد », « معادلة جداء معدوم » (et « جُداء »), « خاصية الجداء المعدوم », « متباينة » (énoncé numérique vrai ou faux) vs « متراجحة » (avec inconnue), « اتجاه المتراجحة » (نحافظ / نغيّر), « مستقيم مدرّج », « الجزء الملوّن بالأحمر », « ترييض مشكلة », « نسمي x … ».',
                    'terms': ['معادلة', 'مجهول', 'حل', 'الحل الوحيد', 'طرفا المعادلة', 'معادلة جداء معدوم', 'خاصية الجداء المعدوم', 'عامل', 'متباينة', 'متراجحة', 'حلول المتراجحة', 'اتجاه المتراجحة', 'مستقيم مدرّج', 'التمثيل البياني', 'ترييض مشكلة', 'التحقق']},
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
assert len([i for i in ids if i.startswith('ex-')]) == 42

out = Path(__file__).with_name('extraction.json')
out.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
print(f'{out} — {len(E)} éléments')
