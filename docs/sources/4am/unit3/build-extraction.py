#!/usr/bin/env python3
"""Génère docs/sources/4am/unit3/extraction.json — unité 3 « الحساب الحرفي » (pp. 31–41).

Transcription VISUELLE du scan (« وحدة الحساب الحرفي.pdf », 11 pages, sans couche texte),
relue à 220 dpi sur les passages douteux. Le texte arabe est celui du manuel, au mot près ;
les réponses (`answer`) ne viennent PAS du manuel (il n'a pas de corrigé) : elles sont
CALCULÉES ici avec sympy (`answerSource: computed`), jamais tapées à la main.

Usage : python3 docs/sources/4am/unit3/build-extraction.py
"""
import json
from pathlib import Path

import sympy as sp

x, y, a, b = sp.symbols('x y a b')
S = sp.sympify


def ex(e):
    """Forme développée réduite, écrite comme le manuel (virgule décimale, puissances décroissantes)."""
    return fmt(sp.expand(S(e)))


def fac(e):
    return fmt(sp.factor(S(e)))


def fmt(e):
    s = sp.latex(e, order='lex')
    return s.replace('.', '{,}')


def val(e, **subs):
    v = S(e).subs({sp.Symbol(k): S(v) for k, v in subs.items()})
    v = sp.nsimplify(v)
    return fmt(v)


def check_eq(lhs, rhs):
    assert sp.simplify(S(lhs) - S(rhs)) == 0, (lhs, rhs)
    return True


def item(tex, expr, kind='expand'):
    d = {'tex': tex, 'expr': expr}
    if kind == 'expand':
        d['expanded'] = ex(expr)
    elif kind == 'factor':
        d['factored'] = fac(expr)
    return d


E = []

E.append({
    'id': 'objectives', 'kind': 'objectives', 'page': 31, 'section': 'سأتعلّم في هذا الباب', 'verified': True,
    'items': [
        'معرفة المتطابقات الشهيرة وتوظيفها في الحساب المتمعن فيه وفي النشر والتحليل.',
        'نشر أو تحليل عبارات جبرية بسيطة.',
    ],
})

E.append({
    'id': 'history-descartes', 'kind': 'aside', 'page': 31, 'section': 'ديكارت', 'verified': True,
    'text': 'يعتبر الفيلسوف الفرنسي ديكارت (Descartes) أن الرياضيات هي أداة لتفسير معظم الظواهر. في إحدى الوثائق التي ألّفها في 06 جوان من سنة 1635 تحت عنوان «حوار الطريقة» اقترح إمكانيات وضع أسس تربط بين العمليات الحسابية والجبر من جهة، والجبر والهندسة من جهة أخرى. فهو يذكر أنه لحساب مربع عدد معطى بدلالة عدد مجهول، يمكن الاستعانة بمفهوم مساحة مربع. مثلا، لحساب العدد $(2x + 1)^2$ نظم العمل في الجدول المقابل: يجمع الأعداد المسجلة في الخانات ونتحصل على $(2x + 1)^2 = 4x^2 + 4x + 1$',
    'caption': 'روني ديكارت',
    'figure': 'جدول 3 × 3: السطر الأول x ، x ، 1 ؛ الخانات $x^2$ ، $x^2$ ، $x$ / $x^2$ ، $x^2$ ، $x$ / $x$ ، $x$ ، 1',
    'answer': {'check': check_eq('(2*x+1)**2', '4*x**2+4*x+1')},
})

E.append({
    'id': 'challenge', 'kind': 'challenge', 'page': 31, 'section': 'تحدّ', 'verified': True,
    'text': 'لاحظ الشكل المقابل حيث ABC مثلث. ما هي قيمة العدد $x$ التي من أجلها يكون المثلث ABC قائما في A ؟',
    'figure': 'مثلث ABC حيث $AB = x + 1$ ، $AC = x + 2$ ، $BC = x + 3$.',
    'answer': {
        'equation': '(x + 3)^2 = (x + 1)^2 + (x + 2)^2 \\iff x^2 = 4',
        'x': 2, 'sides': [3, 4, 5],
        'note': 'x = −2 donne AB = −1 : refusé, une longueur est positive.',
        'check': check_eq('(x+3)**2-(x+1)**2-(x+2)**2', '4-x**2'),
    },
    'answerSource': 'computed',
})

PREP = [
    ('من أجل $x = 0$ العبارة $3x - 3$ تساوي 0.', False, '$3 \\times 0 - 3 = -3$'),
    ('من أجل $x = \\sqrt{3}$ العبارة $x^2 - 3$ تساوي 0.', True, '$(\\sqrt{3})^2 - 3 = 3 - 3 = 0$'),
    ('نشر العبارة $-2 \\times (a - 1)$ هو $-2a + 2$.', True, '$-2 \\times a - 2 \\times (-1) = -2a + 2$'),
    ('نشر العبارة $4(2 - b)$ هو $8 - b$.', False, '$4(2 - b) = 4 \\times 2 - 4 \\times b = 8 - 4b$'),
    ('نشر العبارة $(1 + x)(1 + y)$ هو $1 + xy$.', False, '$(1 + x)(1 + y) = 1 + y + x + xy$'),
    ('نشر العبارة $(1 - x)(1 - y)$ هو $1 - x - y - xy$.', False, '$(1 - x)(1 - y) = 1 - y - x + xy$'),
    ('العبارة $3a + \\sqrt{3}$ تساوي $3\\left(a + \\dfrac{\\sqrt{3}}{3}\\right)$.', True, '$3 \\times a + 3 \\times \\dfrac{\\sqrt{3}}{3} = 3a + \\sqrt{3}$'),
    ('العبارة $16 - \\dfrac{1}{2}x$ تساوي $\\dfrac{1}{2}(8 - x)$.', False, '$\\dfrac{1}{2}(8 - x) = 4 - \\dfrac{1}{2}x$'),
    ('العبارة $x^2 + 3x$ تساوي $x(x + 3)$.', True, '$x(x + 3) = x \\times x + x \\times 3 = x^2 + 3x$'),
    ('العبارة $\\sqrt{2}x + 2\\sqrt{2}$ تساوي $3\\sqrt{2}x$.', False, '$\\sqrt{2}x + 2\\sqrt{2} = \\sqrt{2}(x + 2)$ : الحدان غير متشابهين'),
]
# Les vérités sont RECALCULÉES : une coquille dans la table ci-dessus ferait échouer la génération.
_prep_truth = [
    S('3*0-3') == 0,
    sp.simplify(S('sqrt(3)**2-3')) == 0,
    sp.expand(S('-2*(a-1)') - S('-2*a+2')) == 0,
    sp.expand(S('4*(2-b)') - S('8-b')) == 0,
    sp.expand(S('(1+x)*(1+y)') - S('1+x*y')) == 0,
    sp.expand(S('(1-x)*(1-y)') - S('1-x-y-x*y')) == 0,
    sp.simplify(S('3*(a+sqrt(3)/3)') - S('3*a+sqrt(3)')) == 0,
    sp.expand(S('16-x/2') - S('(8-x)/2')) == 0,
    sp.expand(S('x**2+3*x') - S('x*(x+3)')) == 0,
    sp.simplify(S('sqrt(2)*x+2*sqrt(2)') - S('3*sqrt(2)*x')) == 0,
]
assert [p[1] for p in PREP] == _prep_truth, 'prep: une réponse ne correspond pas au calcul'
E.append({
    'id': 'prep', 'kind': 'prerequisites', 'page': 31, 'section': 'أستعدّ',
    'instruction': 'أصحيح أم خاطئ؟ برّر إجابتك.', 'verified': True,
    'items': [{'n': i + 1, 'text': t, 'answer': ans, 'why': w} for i, (t, ans, w) in enumerate(PREP)],
    'answerSource': 'computed',
})

# ── أنشطة ──────────────────────────────────────────────────────────────────
E.append({
    'id': 'act-1', 'kind': 'activity', 'number': 1, 'page': 32, 'section': 'أنشطة', 'title': 'نشر عبارة جبرية', 'verified': True,
    'questions': [
        '1) احسب بطريقتين مختلفتين كلا مما يلي: $3x(9 + 5)$ و $(4 - 2{,}5)(3 + 1{,}2)$.',
        '2) ميّز بين العبارات التي تدلّ على مجموع والعبارات التي تدل على جداء فيما يلي: $x(3x + 1)$ ، $x + (3 - 2x)$ ، $5x(1 - x)$ ، $x(x + 1) - 2 + (x + 1)$ و $(3x - 1)(3 + x)$.',
        '3) انشر كل عبارة مما يلي وبسّطها: $x(3x + 1)$ ، $5x(1 - x)$ و $(3x - 1)(3 + x)$. اذكر في كل حالة الخاصية التي اعتمدت عليها.',
    ],
    'discrepancy': 'Q1 : « 3x(9 + 5) » — le « x » est le signe × composé en lettre latine (calcul numérique « بطريقتين »). Lu $3 \\times (9 + 5)$.',
    'correction': {
        'decidedBy': 'owner-policy', 'decidedOn': '2026-10-01',
        'questions0': '1) احسب بطريقتين مختلفتين كلا مما يلي: $3 \\times (9 + 5)$ و $(4 - 2{,}5)(3 + 1{,}2)$.',
        'note': 'Le « x » de « 3x(9 + 5) » est un signe × : la question est un calcul numérique.',
    },
    'answer': {
        'q1': {'3 × (9 + 5)': [42, '3 × 9 + 3 × 5 = 27 + 15 = 42'], '(4 − 2,5)(3 + 1,2)': ['6,3', '12 + 4,8 − 7,5 − 3 = 6,3']},
        'q2': {'sum': ['x + (3 − 2x)', 'x(x + 1) − 2 + (x + 1)'], 'product': ['x(3x + 1)', '5x(1 − x)', '(3x − 1)(3 + x)']},
        'q3': [ex('x*(3*x+1)'), ex('5*x*(1-x)'), ex('(3*x-1)*(3+x)')],
    },
    'answerSource': 'computed',
})

E.append({
    'id': 'act-2a', 'kind': 'activity', 'number': 2, 'part': '1) مربع مجموع', 'page': 32, 'section': 'أنشطة', 'title': 'المتطابقات الشهيرة — مربع مجموع', 'verified': True,
    'figure': 'مربع MNPQ طول ضلعه $a + b$ ، مقسّم إلى المربع MRLV (ضلعه $a$) والمربع LSPT (ضلعه $b$) والرباعيين RNSL و VLTQ (بعدا كل منهما $a$ و $b$).',
    'questions': [
        'أ) احسب بطريقتين مختلفتين كلا مما يلي: $(8 + 2)^2$ و $(3 + 0{,}5)^2$.',
        'ب) $a$ و $b$ عددان موجبان. • عبّر عن مساحة المربع MNPQ مرة بدلالة طول ضلعه $a + b$ ومرة أخرى باستعمال مساحات الرباعيات MRLV ، LSPT ، RNSL ، VLTQ. • اكتب المساواة الناتجة عن العبارتين.',
        'جـ) من أجل كل عددين $a$ و $b$ ؛ انقل وأكمل: $(a + b)^2 = (a + b) \\times (\\ldots + \\ldots) = \\ldots + \\ldots + \\ldots + \\ldots = \\ldots + \\ldots + \\ldots$ استنتج عبارة مبسطة للعدد $(a + b)^2$.',
        'د) استعمل ما سبق لنشر كل من العبارتين $(x + 1)^2$ و $(2x + 3)^2$.',
        'هـ) احسب ذهنيا (دون وضع العملية) كلا من: $21^2$ و $53^2$.',
    ],
    'answer': {
        'a': {'(8 + 2)²': [100, '64 + 32 + 4 = 100'], '(3 + 0,5)²': ['12,25', '9 + 3 + 0,25 = 12,25']},
        'b': '(a + b)^2 = a^2 + ab + ab + b^2',
        'c': 'a^2 + ab + ba + b^2 = a^2 + 2ab + b^2',
        'd': [ex('(x+1)**2'), ex('(2*x+3)**2')],
        'e': {'21²': 21 ** 2, '53²': 53 ** 2},
    },
    'answerSource': 'computed',
})

E.append({
    'id': 'act-2b', 'kind': 'activity', 'number': 2, 'part': '2) مربع فرق', 'page': 32, 'section': 'أنشطة', 'title': 'المتطابقات الشهيرة — مربع فرق', 'verified': True,
    'figure': 'مربع KLMN طول ضلعه $a$ ، فيه المربع (1) ضلعه $a - b$ ، المربع (2) ضلعه $b$ ، والمستطيلان (1) و (2).',
    'questions': [
        'أ) احسب بطريقتين مختلفتين كلا مما يلي: $(9 - 3)^2$ و $(2{,}4 - 3)^2$.',
        'ب) $a$ و $b$ عددان موجبان. • عبّر عن مساحة المربع (1) مرة بدلالة طول ضلعه $a - b$ ومرّة أخرى باستعمال مساحات: المربع KLMN، المربع (2) المستطيل (1) و المستطيل (2). • اكتب المساواة الناتجة عن العبارتين.',
        'جـ) من أجل كل عددين $a$ و $b$ ؛ انقل وأكمل: $(a - b)^2 = (a - b) \\times (\\ldots - \\ldots) = \\ldots - \\ldots - \\ldots + \\ldots = \\ldots - \\ldots + \\ldots$ استنتج عبارة مبسطة للعدد $(a - b)^2$.',
        'د) استعمل ما سبق لنشر كل من العبارتين $(x - 1)^2$ و $(5 - 2x)^2$.',
        'هـ) احسب ذهنيا (دون وضع العملية) كلا من: $19^2$ و $37^2$.',
    ],
    'answer': {
        'a': {'(9 − 3)²': [36, '81 − 54 + 9 = 36'], '(2,4 − 3)²': ['0,36', '5,76 − 14,4 + 9 = 0,36']},
        'b': '(a - b)^2 = a^2 - 2(a - b)b - b^2 = a^2 - 2ab + b^2',
        'c': 'a^2 - ab - ba + b^2 = a^2 - 2ab + b^2',
        'd': [ex('(x-1)**2'), ex('(5-2*x)**2')],
        'e': {'19²': 19 ** 2, '37²': 37 ** 2},
    },
    'answerSource': 'computed',
})

E.append({
    'id': 'act-2c', 'kind': 'activity', 'number': 2, 'part': '3) جداء مجموع حدين وفرقهما', 'page': 33, 'section': 'أنشطة', 'title': 'المتطابقات الشهيرة — جداء مجموع حدين وفرقهما', 'verified': True,
    'figure': 'مربع KLMN طول ضلعه $a + b$ مقسّم إلى المستطيل (1) بعداه $a + b$ و $a - b$ ، والمستطيل (2) بعداه $a + b$ و $2b$.',
    'questions': [
        'أ) $a$ و $b$ عددان موجبان. • عبّر عن مساحة المستطيل (1)، مرة بدلالة بعديه $a + b$ و $a - b$ ومرة أخرى باستعمال مساحتي المربع KLMN، والمستطيل (2). • اكتب المساواة الناتجة عن العبارتين مع تبسيط العبارة الثانية.',
        'ب) لبرهان صحة المساواة التي وجدتها في الجزء (أ) من أجل كل عددين $a$ و $b$ : انقل وأكمل: من أجل كل عددين $a$ و $b$ : $(a + b)(a - b) = \\ldots - \\ldots + \\ldots - \\ldots = \\ldots - \\ldots$',
        'جـ) استعمل ما سبق لنشر كل من العبارتين $(x - 3)(x + 3)$ و $(2x - 5)(2x + 5)$.',
        'د) احسب ذهنيا (دون وضع العملية) كلا من: $105 \\times 95$ و $97^2 - 3^2$.',
    ],
    'answer': {
        'a': '(a + b)(a - b) = (a + b)^2 - 2b(a + b) = a^2 - b^2',
        'b': 'a^2 - ab + ba - b^2 = a^2 - b^2',
        'c': [ex('(x-3)*(x+3)'), ex('(2*x-5)*(2*x+5)')],
        'd': {'105 × 95': 105 * 95, '97² − 3²': 97 ** 2 - 3 ** 2},
    },
    'answerSource': 'computed',
})

E.append({
    'id': 'act-3', 'kind': 'activity', 'number': 3, 'page': 33, 'section': 'أنشطة', 'title': 'تحليل عبارة جبرية', 'verified': True,
    'figure': 'كراس إيمان: $3{,}5 \\times 1{,}7 + 3{,}5 \\times 0{,}3 = 3{,}5 \\times (1{,}7 + 0{,}3) = 3{,}5 \\times 2 = 7$',
    'questions': [
        '1) لاحظ كيف تحسب إيمان المجموع الآتي: $3{,}5 \\times 1{,}7 + 3{,}5 \\times 0{,}3$. أ) اشرح ما فعلته إيمان. ب) احسب باستعمال الطريقة نفسها كلا مما يأتي: $2{,}9 \\times 13 + 2{,}9 \\times 87$ ، $2{,}35 \\times 176 - 2{,}35 \\times 76$.',
        '2) اكتب على شكل جداء كل عبارة مما يلي: $9x + 3$ ، $(x - 2)(x + 4) - 3(x - 2)$ و $(x - 1) + (x - 1)^2$. اذكر في كل حالة الخاصية التي اعتمدت عليها.',
        '3) لتكن العبارات الآتية: $x^2 + 6x + 9$ ، $x^2 - 4x + 4$ ، $x^2 - 16$. • تقول إيمان: «لتحليل كل من هذه العبارات يمكن استغلال المساوايات». هل توافقها؟ اشرح. • حلّل كل عبارة واذكر المتطابقة التي اعتمدت عليها.',
    ],
    'box': 'عندما نكتب عبارة مجموع على شكل جداء نقول أننا حللنا هذه العبارة.',
    'aside': ['$(a + b)^2 = a^2 + 2ab + b^2$', '$(a - b)^2 = a^2 - 2ab + b^2$', '$(a + b)(a - b) = a^2 - b^2$'],
    'answer': {
        'q1b': {'2,9 × (13 + 87)': 290, '2,35 × (176 − 76)': 235},
        'q2': [fac('9*x+3'), fac('(x-2)*(x+4)-3*(x-2)'), fac('(x-1)+(x-1)**2')],
        'q3': [fac('x**2+6*x+9'), fac('x**2-4*x+4'), fac('x**2-16')],
    },
    'answerSource': 'computed',
})

# ── معارف ──────────────────────────────────────────────────────────────────
E.append({
    'id': 'know-1', 'kind': 'knowledge', 'number': 1, 'page': 34, 'section': 'معارف', 'title': 'النشر', 'verified': True,
    'definitions': [{'id': 'def-expand', 'text': 'نشر عبارة جداء يعني كتابة هذه العبارة على شكل مجموع (أو فرق).'}],
    'properties': [{'id': 'prop-distributive', 'text': '$a$ ، $b$ ، $c$ و $k$ أعداد. • $k(a + b) = ka + kb$ • $k(a - b) = ka - kb$ • $(a + b)(c + d) = ac + ad + bc + bd$'}],
    'examples': [
        '$5(x - 1) = 5 \\times x - 5 \\times 1 = 5x - 5$',
        '$(2x - 1)(x + 4) = 2x^2 + 8x - x - 4 = 2x^2 + 7x - 4$',
    ],
    'answer': {'check': [check_eq('5*(x-1)', '5*x-5'), check_eq('(2*x-1)*(x+4)', '2*x**2+7*x-4')]},
})

E.append({
    'id': 'know-2', 'kind': 'knowledge', 'number': 2, 'page': 34, 'section': 'معارف', 'title': 'المتطابقات الشهيرة', 'verified': True,
    'definitions': [
        {'id': 'def-identity', 'text': 'المتطابقة هي مساواة صحيحة من أجل كل القيم المعطاة للحروف الواردة في المساواة.'},
        {'id': 'def-remarkable', 'text': 'تُسمى المتطابقات الآتية المتطابقات الشهيرة. $a$ و $b$ عددان.'},
    ],
    'properties': [
        {'id': 'id-square-sum', 'title': '1) مربع مجموع', 'text': '$(a + b)^2 = a^2 + 2ab + b^2$'},
        {'id': 'id-square-diff', 'title': '2) مربع فرق', 'text': '$(a - b)^2 = a^2 - 2ab + b^2$'},
        {'id': 'id-sum-diff', 'title': '3) جداء مجموع حدين وفرقهما', 'text': '$(a + b)(a - b) = a^2 - b^2$'},
    ],
    'examples': [
        '$(3x + 2)^2 = (3x)^2 + 2 \\times 3x(2) + 2^2 = 9x^2 + 12x + 4$',
        '$(4 - 2x)^2 = 4^2 - 2 \\times 4(2x) + (2x)^2 = 16 - 16x + 4x^2$',
        '$(5x - 1)(5x + 1) = (5x)^2 - 1^2 = 25x^2 - 1$',
    ],
    'answer': {'check': [check_eq('(3*x+2)**2', '9*x**2+12*x+4'), check_eq('(4-2*x)**2', '16-16*x+4*x**2'), check_eq('(5*x-1)*(5*x+1)', '25*x**2-1')]},
})

E.append({
    'id': 'know-3', 'kind': 'knowledge', 'number': 3, 'page': 34, 'section': 'معارف', 'title': 'التحليل', 'verified': True,
    'definitions': [{'id': 'def-factor', 'text': 'تحليل عبارة مجموع هو كتابتها على شكل جداء.'}],
    'properties': [
        {'id': 'prop-factor-distributive', 'text': '$a$ ، $b$ و $k$ أعداد. • الخاصية التوزيعية: $ka + kb = k(a + b)$ ، $k(a - b) = ka - kb$'},
        {'id': 'prop-factor-identities', 'text': '• المتطابقات الشهيرة: $a^2 + 2ab + b^2 = (a + b)^2$ ، $a^2 - 2ab + b^2 = (a - b)^2$ ، $a^2 - b^2 = (a + b)(a - b)$'},
    ],
    'correction': {
        'decidedBy': 'owner-policy', 'decidedOn': '2026-10-01',
        'text': '$a$ ، $b$ و $k$ أعداد. • الخاصية التوزيعية: $ka + kb = k(a + b)$ ، $ka - kb = k(a - b)$',
        'note': 'Le manuel imprime « k(a − b) = ka − kb » (le sens du NOTRE, p. 34 §1) dans le cadre de la FACTORISATION ; le sens de l’analyse est ka − kb = k(a − b).',
    },
    'examples': [
        '$6x^2 + 4x = 2x \\times 3x + 2x \\times 2 = 2x(3x + 2)$',
        '$5(x + 1) + 3x(x + 1) = (x + 1)(5 + 3x)$',
        '$9x^2 + 6x + 1 = (3x)^2 + 2(3x) \\times 1 + 1^2 = (3x + 1)^2$',
        '$4 - 4x + x^2 = 2^2 - 2 \\times 2 \\times x + x^2 = (2 - x)^2$',
        '$64 - 16x^2 = 8^2 - (4x)^2 = (8 - 4x)(8 + 4x)$',
    ],
    'answer': {'check': [check_eq('6*x**2+4*x', '2*x*(3*x+2)'), check_eq('5*(x+1)+3*x*(x+1)', '(x+1)*(5+3*x)'),
                         check_eq('9*x**2+6*x+1', '(3*x+1)**2'), check_eq('4-4*x+x**2', '(2-x)**2'), check_eq('64-16*x**2', '(8-4*x)*(8+4*x)')]},
})

# ── طرائق ──────────────────────────────────────────────────────────────────
E.append({
    'id': 'method-expand-identities', 'kind': 'method', 'page': 35, 'section': 'طرائق', 'title': 'نشر عبارة باستعمال المتطابقات الشهيرة', 'verified': True,
    'exercise': 'انشر ثم بسط كل من العبارات التالية: أ) $(2x + 1)^2$ ، ب) $(\\sqrt{3} - 4x)^2$ ، جـ) $(2x - \\sqrt{5})(2x + \\sqrt{5})$ .',
    'solution': [
        'أ) $(2x + 1)^2 = (2x)^2 + 2(2x) \\times 1 + 1^2 = 4x^2 + 4x + 1$ .',
        'ب) $(\\sqrt{3} - 4x)^2 = (\\sqrt{3})^2 - 2 \\times \\sqrt{3} \\times 4x + (4x)^2 = 3 - 8\\sqrt{3}x + 16x^2$ .',
        'جـ) $(2x - \\sqrt{5})(2x + \\sqrt{5}) = (2x)^2 - (\\sqrt{5})^2 = 4x^2 - 5$ .',
    ],
    'rule': 'لنشر عبارة باستعمال المتطابقات الشهيرة، نتعرّف على نوع المتطابقة: مربع مجموع أو مربع فرق أو جداء مجموع حدين وفرقهما ونعيّن الحدين ثم نستعمل نشرها.',
    'answer': {'check': [check_eq('(2*x+1)**2', '4*x**2+4*x+1'), check_eq('(sqrt(3)-4*x)**2', '3-8*sqrt(3)*x+16*x**2'), check_eq('(2*x-sqrt(5))*(2*x+sqrt(5))', '4*x**2-5')]},
})

E.append({
    'id': 'method-common-factor', 'kind': 'method', 'page': 35, 'section': 'طرائق', 'title': 'تحليل عبارة باستخراج عامل مشترك', 'verified': True,
    'exercise': 'حلّل كل عبارة مما يلي: أ) $A = 4x \\times (x + 1) - 12x^2$ ، ب) $B = (x - 5)(x + 1) + 2(x - 5)$ ، جـ) $C = 3(\\sqrt{2}x + 1) - (\\sqrt{2}x + 1)(x + \\sqrt{2})$ .',
    'solution': [
        'أ) بملاحظة أنّ $4x$ هو عامل مشترك بين $4x \\times (x + 1)$ و $12x^2$ نكتب $A = 4x \\times (x + 1) - 12x^2 = 4x \\times (x + 1) - 4x \\times 3x = 4x \\times (x + 1 - 3x) = 4x \\times (1 - 2x)$',
        'ب) بملاحظة أنّ $(x - 5)$ هو عامل مشترك بين $(x - 5)(x + 1)$ و $2(x - 5)$ نكتب $B = (x - 5)(x + 1) + 2(x - 5) = (x - 5)(x + 1 + 2) = (x - 5)(x + 3)$',
        'جـ) بملاحظة أنّ $(\\sqrt{2}x + 1)$ هو عامل مشترك بين $3(\\sqrt{2}x + 1)$ و $(\\sqrt{2}x + 1)(x + \\sqrt{2})$ نكتب $C = (\\sqrt{2}x + 1)[3 - (x + \\sqrt{2})] = (\\sqrt{2}x + 1)(3 - x - \\sqrt{2}) = (\\sqrt{2}x + 1)(3 - \\sqrt{2} - x)$',
    ],
    'rule': 'لتحليل عبارة باستخراج عامل مشترك، نحدّد العامل المشترك $k$ بين الحدين (أو الحدود) ثم نطبق الخاصة التوزيعية $k \\times a + k \\times b = k \\times (a + b)$ .',
    'answer': {'check': [check_eq('4*x*(x+1)-12*x**2', '4*x*(1-2*x)'), check_eq('(x-5)*(x+1)+2*(x-5)', '(x-5)*(x+3)'),
                         check_eq('3*(sqrt(2)*x+1)-(sqrt(2)*x+1)*(x+sqrt(2))', '(sqrt(2)*x+1)*(3-sqrt(2)-x)')]},
})

E.append({
    'id': 'now-35-1', 'kind': 'try-now', 'page': 35, 'section': 'دوري الآن', 'number': 1, 'verified': True,
    'text': 'انشر وبسّط كل مما يلي وبسّطها:',
    'items': [item('$(3x - 2)(7x - 4)$', '(3*x-2)*(7*x-4)'), item('$(8 - 3x)(x + \\sqrt{7}) + (8 + 3x)(x - \\sqrt{7})$', '(8-3*x)*(x+sqrt(7))+(8+3*x)*(x-sqrt(7))')],
    'answerSource': 'computed',
})
E.append({
    'id': 'now-35-2', 'kind': 'try-now', 'page': 35, 'section': 'دوري الآن', 'number': 2, 'verified': True,
    'text': 'حلّل كل عبارة مما يلي:',
    'items': [item('$A = (x - 1)(5x + 4) + (3 + x)(x - 1)$', '(x-1)*(5*x+4)+(3+x)*(x-1)', 'factor'), item('$B = (2x - 5)(x + 2) - (x - 2)(x + 2)$', '(2*x-5)*(x+2)-(x-2)*(x+2)', 'factor')],
    'answerSource': 'computed',
})

E.append({
    'id': 'method-factor-identities', 'kind': 'method', 'page': 36, 'section': 'طرائق', 'title': 'تحليل عبارة باستعمال المتطابقات الشهيرة', 'verified': True,
    'exercise': 'تمرين 1: حلّل كل عبارة مما يلي: أ) $A = 25 + 10x + x^2$ ، ب) $B = 49x^2 - 14x + 1$ ، جـ) $C = (4x - 1)^2 - (x + 4)^2$ .',
    'solution': [
        'أ) لدينا $A = 25 + 10x + x^2 = 5^2 + 2 \\times 5 \\times x + x^2$ أي العبارة A من الشكل $a^2 + 2ab + b^2$ حيث $a = 5$ و $b = x$. ومنه $A = (5 + x)^2$ .',
        'ب) لدينا $B = 49x^2 - 14x + 1 = (7x)^2 - 2 \\times (7x) + 1^2$ أي العبارة B من الشكل $a^2 - 2ab + b^2$ حيث $a = 7x$ و $b = 1$. ومنه $B = (7x - 1)^2$ .',
        'جـ) العبارة C من الشكل $a^2 - b^2$ حيث $a = 4x - 1$ و $b = x - 4$. ومنه $C = (4x - 1)^2 - (x - 4)^2 = [(4x - 1) + (x - 4)][(4x - 1) - (x - 4)] = (5x - 5)(3x + 3) = 5(x - 1) \\times 3(x + 1)$ . $C = 15(x - 1)(x + 1)$ .',
    ],
    'rule': 'لتحليل عبارة باستعمال المتطابقات الشهيرة، نتعرّف على نوع المتطابقة: مربع مجموع أو مربع فرق أو جداء مجموع حدين وفرقهما ونعيّن الحدين ثم نستعمل تحليلها.',
    'discrepancy': 'L’énoncé imprime $C = (4x - 1)^2 - (x + 4)^2$ ; la solution prend $b = x - 4$ et conclut $15(x - 1)(x + 1)$. Avec l’énoncé imprimé on obtiendrait $(5x + 3)(3x - 5)$.',
    'correction': {
        'decidedBy': 'owner-policy', 'decidedOn': '2026-10-01',
        'exercise': 'تمرين 1: حلّل كل عبارة مما يلي: أ) $A = 25 + 10x + x^2$ ، ب) $B = 49x^2 - 14x + 1$ ، جـ) $C = (4x - 1)^2 - (x - 4)^2$ .',
        'note': 'L’énoncé est aligné sur la solution imprimée (b = x − 4), qui est complète et juste.',
    },
    'answer': {'check': [check_eq('25+10*x+x**2', '(5+x)**2'), check_eq('49*x**2-14*x+1', '(7*x-1)**2'), check_eq('(4*x-1)**2-(x-4)**2', '15*(x-1)*(x+1)')],
               'printedStatement': fac('(4*x-1)**2-(x+4)**2')},
    'answerSource': 'computed',
})

E.append({
    'id': 'method-expand-factor', 'kind': 'method', 'page': 36, 'section': 'طرائق', 'title': 'تمرين 2 — نشر عبارة ثم تحليلها', 'verified': True,
    'exercise': 'لتكن العبارة الجبرية A حيث: $A = (x - 3)^2 + 2(x - 3)$ . أ) انشر A وبسّطها ثم حللها إلى جداء عاملين من الدرجة الأولى. ب) احسب A من أجل $x = 1$ .',
    'solution': [
        'أ) • نشر A وتبسيطها: $(x - 3)^2 = (x)^2 - 2(x) \\times 3 + 3^2 = x^2 - 6x + 9$ و $2(x - 3) = 2x - 6$ إذن $A = x^2 - 6x + 9 + 2x - 6 = x^2 + 4x + 3$ .',
        '• تحليل A: نلاحظ أن $(x - 3)$ عامل مشترك بين $(x - 3)^2$ و $2(x - 3)$ . $A = (x - 3)[x - 3 + 2] = (x - 3)(x - 1)$',
        'ب) من أجل $x = 1$ ، $x - 1 = 0$ . بالتالي $A = 0$ .',
    ],
    'discrepancy': 'La solution imprime « x² − 6x + 9 + 2x − 6 = x² + 4x + 3 » : −6x + 2x = −4x, la forme réduite est x² − 4x + 3 (qui est bien (x − 3)(x − 1)).',
    'correction': {
        'decidedBy': 'owner-policy', 'decidedOn': '2026-10-01',
        'solution0': 'أ) • نشر A وتبسيطها: $(x - 3)^2 = (x)^2 - 2(x) \\times 3 + 3^2 = x^2 - 6x + 9$ و $2(x - 3) = 2x - 6$ إذن $A = x^2 - 6x + 9 + 2x - 6 = x^2 - 4x + 3$ .',
        'note': '−6x + 2x = −4x.',
    },
    'answer': {'expanded': ex('(x-3)**2+2*(x-3)'), 'factored': fac('(x-3)**2+2*(x-3)'), 'A(1)': 0},
    'answerSource': 'computed',
})

E.append({
    'id': 'now-36-1', 'kind': 'try-now', 'page': 36, 'section': 'دوري الآن', 'number': 1, 'verified': True,
    'text': 'انشر كل عبارة مما يلي وبسّطها:',
    'items': [item('$A = (x - 2)^2 + 4(3x - 1)(3x + 3)$', '(x-2)**2+4*(3*x-1)*(3*x+3)'), item('$B = 9x(9x + 1)^2 - x(x - 1)^2$', '9*x*(9*x+1)**2-x*(x-1)**2')],
    'answerSource': 'computed',
})
E.append({
    'id': 'now-36-2', 'kind': 'try-now', 'page': 36, 'section': 'دوري الآن', 'number': 2, 'verified': True,
    'text': 'حلّل كل عبارة مما يلي:',
    'items': [item('$E = 144x^2 - 24x + 1$', '144*x**2-24*x+1', 'factor'), item('$F = (4x^2 - 1) + (12x^2 - 6x)$', '(4*x**2-1)+(12*x**2-6*x)', 'factor')],
    'answerSource': 'computed',
})

# ── أوظّف تعلّماتي ─────────────────────────────────────────────────────────
G1, G2, G3 = 'نشر عبارة جبرية وتبسيطها', 'الجداءات الشهيرة', 'التحليل'


def exercise(n, page, group, text, items=None, **extra):
    d = {'id': f'ex-{n}', 'kind': 'exercise', 'number': n, 'page': page, 'section': 'أوظّف تعلّماتي', 'group': group, 'verified': True, 'text': text}
    if items is not None:
        d['items'] = items
    d.update(extra)
    d['answerSource'] = 'computed'
    return d


E.append(exercise(1, 37, G1, 'انشر كل عبارة مما يلي وبسّطها:', [
    item('$A = 2(5x - 1)$', '2*(5*x-1)'), item('$B = -3(3 - x)$', '-3*(3-x)'),
    item('$C = \\dfrac{2}{5}\\left(-20x + \\dfrac{15}{2}\\right)$', 'Rational(2,5)*(-20*x+Rational(15,2))'),
    item('$D = -4\\left(7 - \\dfrac{3}{2}x\\right)$', '-4*(7-Rational(3,2)*x)')]))
E.append(exercise(2, 37, G1, 'لتكن العبارة A: $A = (x + 2)(3x - 1)$ . 1) احسب قيمة A من أجل $x = 0$ . 2) انشر العبارة A وبسّطها. 3) احسب، باستعمال عبارة A التي حصلت عليها في السؤال 2، قيمة A من أجل $x = 0$ . هل وجدت نفس القيمة التي حصلت عليها في السؤال 1؟ إذا كان الجواب (لا) ابحث عن الخطأ وصحّحه.',
                      answer={'A(0)': int(S('(0+2)*(0-1)')), 'expanded': ex('(x+2)*(3*x-1)')}))
E.append(exercise(3, 37, G1, 'انشر كل عبارة مما يلي وبسّطها:', [
    item('$K = (2x + 1)(x + 2)$', '(2*x+1)*(x+2)'), item('$L = (3x + 2)(4x - 5)$', '(3*x+2)*(4*x-5)'),
    item('$M = (x - 7)(1 - x)$', '(x-7)*(1-x)'), item('$P = (-x - 2)(5 - x)$', '(-x-2)*(5-x)')]))
E.append(exercise(4, 37, G1, 'لتكن العبارة A حيث: $A = \\left(\\dfrac{2}{3}x + 5\\right)\\left(4 - \\dfrac{1}{3}x\\right)$ . 1) تحقّق من أنّه من أجل $x = 3$ فإنّ $A = 21$ . 2) انشر وبسط العبارة A. 3) استعمل عبارة A التي حصلت عليها في السؤال 2 للتحقق من قيمة A من أجل $x = 3$ مرّة ثانية.',
                      answer={'A(3)': val('(Rational(2,3)*x+5)*(4-Rational(1,3)*x)', x=3), 'expanded': ex('(Rational(2,3)*x+5)*(4-Rational(1,3)*x)')}))
E.append(exercise(5, 37, G1, 'انشر كل عبارة مما يلي وبسّطها:', [
    item('$B = \\left(2x + \\dfrac{1}{5}\\right)\\left(x + \\dfrac{2}{5}\\right)$', '(2*x+Rational(1,5))*(x+Rational(2,5))'),
    item('$C = \\left(\\dfrac{4}{3}x - 2\\right)\\left(\\dfrac{3}{2}x - \\dfrac{1}{4}\\right)$', '(Rational(4,3)*x-2)*(Rational(3,2)*x-Rational(1,4))')]))
E.append(exercise(6, 37, G1, 'إليك إجابة تلميذين حول نشر وتبسيط العبارة $P = 3(x - 1) - (x + 1)(4x - 3)$ . أجاب الأول: $P = 3x - 3 - 4x^2 - 3x + 4x - 3 = -4x^2 + 4x + 6$ . أجاب الثاني: $P = 3x - 3 - (4x^2 - 3x + 4x - 3) = 3x - 3 - 4x^2 + 3x - 4x + 3 = -4x^2 + 2x$ . أي الإجابتين صحيحة؟',
                      answer={'expanded': ex('3*(x-1)-(x+1)*(4*x-3)'), 'correct': 'الثاني',
                              'firstError': 'حذف القوسين المسبوقين بـ − دون تغيير إشارات الحدود داخلهما'},
                      note='La copie du premier élève (transcrite du cahier manuscrit) : « = −4x² + 4x + 6 » ; son calcul donne en réalité −4x² + 4x − 6. Les deux lectures sont fausses ; seule la seconde copie est juste.'))
E.append(exercise(7, 37, G1, 'انشر كل عبارة مما يلي وبسّطها:', [
    item('$R = a - 3 - 2(a + 3)$', 'a-3-2*(a+3)'), item('$S = -(a + 2) - (3a - 5)(2a - 4)$', '-(a+2)-(3*a-5)*(2*a-4)'),
    item('$T = (a + 3)\\left(a + \\dfrac{1}{3}\\right) - (a + 2)\\left(a - \\dfrac{1}{2}\\right)$', '(a+3)*(a+Rational(1,3))-(a+2)*(a-Rational(1,2))')]))
E.append(exercise(8, 37, G1, 'لنشر العبارة $A = -5(x + 2)(3x - 1)$ وتبسيطها، إليك بداية عمل كل من رياض وإيمان. رياض: $A = -5(x + 2)(3x - 1) = (-5x - 10)(3x - 1)$ . إيمان: $A = -5(x + 2)(3x - 1) = -5(3x^2 - x + 6x - 2)$ . 1) اشرح عمل كل من رياض وإيمان. 2) أكمل عمل كل منهما. ماذا تلاحظ؟',
                      answer={'expanded': ex('-5*(x+2)*(3*x-1)')}))
E.append(exercise(9, 37, G2, 'انشر كل عبارة مما يلي وبسّطها:', [
    item('$A = (x + 5)^2$', '(x+5)**2'), item('$B = (x + 0{,}3)^2$', '(x+Rational(3,10))**2'), item('$C = \\left(x + \\dfrac{2}{3}\\right)^2$', '(x+Rational(2,3))**2')]))
E.append(exercise(10, 37, G2, 'سؤال التمرين السابق نفسه من أجل:', [
    item('$A = (4x + 1)^2$', '(4*x+1)**2'), item('$B = (2x + 0{,}5)^2$', '(2*x+Rational(1,2))**2'), item('$C = \\left(3x + \\dfrac{5}{3}\\right)^2$', '(3*x+Rational(5,3))**2')]))
E.append(exercise(11, 37, G2, 'احسب ذهنيا (دون وضع العملية) كل عدد مما يلي: $31^2$ ، $105^2$ ، $1009^2$ .',
                      answer={'31²': 31 ** 2, '105²': 105 ** 2, '1009²': 1009 ** 2}))
E.append(exercise(12, 37, G2, 'انقل، باستعمال $a^2 + 2ab + b^2 = (a + b)^2$ المساويات الآتية وأتممها: 1) $x^2 + \\ldots x + \\ldots = (\\ldots + 3)^2$ 2) $9x^2 + \\ldots + 1 = (\\ldots + 1)^2$ 3) $\\ldots + 10x + 25 = (\\ldots + \\ldots)^2$',
                      answer=['x^2 + 6x + 9 = (x + 3)^2', '9x^2 + 6x + 1 = (3x + 1)^2', 'x^2 + 10x + 25 = (x + 5)^2'],
                      note='3) : x² + 10x + 25 = (x + 5)² est la complétion attendue (25 = 5², 10x = 2 × x × 5).'))
E.append(exercise(13, 38, G2, 'انشر كل عبارة مما يلي وبسّطها:', [
    item('$A = (x - 4)^2$', '(x-4)**2'), item('$B = (x - 1{,}5)^2$', '(x-Rational(3,2))**2'), item('$C = \\left(x - \\dfrac{5}{11}\\right)^2$', '(x-Rational(5,11))**2')]))
E.append(exercise(14, 38, G2, 'انشر كل عبارة مما يلي وبسّطها:', [
    item('$A = (2x - 3)^2$', '(2*x-3)**2'), item('$B = (5x - 1{,}4)^2$', '(5*x-Rational(7,5))**2'), item('$C = \\left(\\dfrac{4}{3}x - \\dfrac{3}{5}\\right)^2$', '(Rational(4,3)*x-Rational(3,5))**2')]))
E.append(exercise(15, 38, G2, 'انشر كل عبارة مما يلي وبسّطها:', [
    item('$A = (3x - 4)^2 + (x - 3)^2$', '(3*x-4)**2+(x-3)**2'), item('$B = 4(1 - 2x)^2 + (4x - 1)^2$', '4*(1-2*x)**2+(4*x-1)**2')]))
E.append(exercise(16, 38, G2, 'انشر كل عبارة مما يلي وبسّطها:', [
    item('$D = (5x + 1)^2 + 5(x - 1)^2$', '(5*x+1)**2+5*(x-1)**2'), item('$E = (3x - 4)^2 - 4(1 - x)^2$', '(3*x-4)**2-4*(1-x)**2')]))
E.append(exercise(17, 38, G2, 'انشر كل عبارة مما يلي وبسّطها:', [
    item('$A = (x + 7)(x - 7)$', '(x+7)*(x-7)'), item('$B = (x + 0{,}2)(x - 0{,}2)$', '(x+Rational(1,5))*(x-Rational(1,5))'),
    item('$C = \\left(x - \\dfrac{1}{3}\\right)\\left(x + \\dfrac{1}{3}\\right)$', '(x-Rational(1,3))*(x+Rational(1,3))')]))
E.append(exercise(18, 38, G2, 'سؤال التمرين السابق نفسه من أجل:', [
    item('$A = (3x + 5)(3x - 5)$', '(3*x+5)*(3*x-5)'), item('$B = (1{,}5 + 2x)(1{,}5 - 2x)$', '(Rational(3,2)+2*x)*(Rational(3,2)-2*x)'),
    item('$C = \\left(\\dfrac{\\sqrt{2}}{5}x - \\dfrac{1}{3}\\right)\\left(\\dfrac{\\sqrt{2}}{5}x + \\dfrac{1}{3}\\right)$', '(sqrt(2)/5*x-Rational(1,3))*(sqrt(2)/5*x+Rational(1,3))')]))
E.append(exercise(19, 38, G2, '1) انشر العبارة $A = x^2 - (x - 1)(x + 1)$ وبسطها. 2) اشرح كيف تستعمل نتيجة السؤال 1 لإعطاء نتيجة كل مما يلي دون حساب: $B = 978654321^2 - 978654320 \\times 978654322$ ، $C = 999888777^2 - 999888778 \\times 999888776$',
                      answer={'A': ex('x**2-(x-1)*(x+1)'), 'B': 978654321 ** 2 - 978654320 * 978654322, 'C': 999888777 ** 2 - 999888778 * 999888776}))
E.append(exercise(20, 38, G3, 'إليك العبارات: $A = x^2 - 5x$ ، $B = (x + 3)(1 - 2x) + 5(1 - 2x)$ ، $C = (1 + x)(x - 5) - (1 + 2x)(1 + x)$ . 1) بملاحظة أنّ $x^2 = x \\times x$ حلّل العبارة A الى جداء عاملين. 2) حدّد العامل المشترك بين $(x + 3)(1 - 2x)$ و $5(1 - 2x)$ ، ثمّ حلّل العبارة B الى جداء عوامل. 3) حلّل العبارة C الى جداء عوامل.',
                      items=[item('$A = x^2 - 5x$', 'x**2-5*x', 'factor'), item('$B = (x + 3)(1 - 2x) + 5(1 - 2x)$', '(x+3)*(1-2*x)+5*(1-2*x)', 'factor'),
                             item('$C = (1 + x)(x - 5) - (1 + 2x)(1 + x)$', '(1+x)*(x-5)-(1+2*x)*(1+x)', 'factor')]))
E.append(exercise(21, 38, G3, 'لتحليل العبارة $A = (x - 1)(x + 2) + x(x + 2) - (x + 2)$ إلى جداء عوامل كتب أحد التلاميذ: $A = (x - 1)(x + 2) + x(x + 2) - (x + 2) = (x + 2)(x - 1 + x) = (x + 2)(2x - 1)$ . 1) للمصادقة على ما عمله هذا التلميذ، احسب من أجل $x = 0$ قيمة A في العبارة المعطاة وقيمتها في النتيجة التي وجدها هذا التلميذ. ماذا تستنتج؟ 2) ابحث عن الخطإ المرتكب في عمل هذا التلميذ ثم اكتب التحليل الصحيح للعبارة A.',
                      answer={'A(0)': int(S('(0-1)*(0+2)+0-(0+2)')), 'student(0)': int(S('(0+2)*(2*0-1)')), 'factored': fac('(x-1)*(x+2)+x*(x+2)-(x+2)'),
                              'error': 'نسي العامل −1 للحد −(x + 2) = (x + 2) × (−1)'}))
E.append(exercise(22, 38, G3, 'حلّل كل عبارة مما يلي:', [
    item('$C = 5x(2x + 1) + (2x + 1)$', '5*x*(2*x+1)+(2*x+1)', 'factor'), item('$D = (x + 7)(x - 3) - (x - 3)$', '(x+7)*(x-3)-(x-3)', 'factor'),
    item('$E = (x + 1)(x - 4) - x + 4$', '(x+1)*(x-4)-x+4', 'factor')]))
E.append(exercise(23, 38, G3, 'حلّل كل عبارة مما يلي:', [
    item('$A = 2x + 6$', '2*x+6', 'factor'), item('$B = 7x - 21$', '7*x-21', 'factor'), item('$C = x^2 - 3x$', 'x**2-3*x', 'factor')]))
E.append(exercise(24, 38, G3, 'حلّل كل عبارة مما يلي: (لاحظ وجود عامل مشترك).', [
    item('$D = (x - \\sqrt{2})(4x + 3) - (x + 2)(x - \\sqrt{2})$', '(x-sqrt(2))*(4*x+3)-(x+2)*(x-sqrt(2))', 'factor'),
    item('$E = (2 - 5x)\\left(x - \\dfrac{2}{3}\\right) + (2 - 5x)\\left(x - \\dfrac{4}{3}\\right)$', '(2-5*x)*(x-Rational(2,3))+(2-5*x)*(x-Rational(4,3))', 'factor')]))
E.append(exercise(25, 38, G3, 'حلّل كل عبارة مما يلي:', [
    item('$F = 2x\\left(\\dfrac{2}{7} - x\\right) + \\left(\\dfrac{2}{7} - x\\right)\\left(\\dfrac{5x - 4}{3}\\right)$', '2*x*(Rational(2,7)-x)+(Rational(2,7)-x)*((5*x-4)/3)', 'factor'),
    item('$G = (1{,}2x - 3{,}5)(3{,}7x + x) - (0{,}2x - 6{,}5)(3{,}7 + x) + (3{,}7 + x)$', '(Rational(6,5)*x-Rational(7,2))*(Rational(37,10)+x)-(Rational(1,5)*x-Rational(13,2))*(Rational(37,10)+x)+(Rational(37,10)+x)', 'factor')],
    discrepancy='G : le premier facteur est imprimé « (3,7x + x) » ; les deux autres termes ont le facteur (3,7 + x). Lu (3,7 + x) : l’exercice demande d’extraire un facteur commun.',
    correction={'decidedBy': 'owner-policy', 'decidedOn': '2026-10-01', 'item1': '$G = (1{,}2x - 3{,}5)(3{,}7 + x) - (0{,}2x - 6{,}5)(3{,}7 + x) + (3{,}7 + x)$',
                'note': '(3,7x + x) → (3,7 + x) : facteur commun des trois termes.'}))
E.append(exercise(26, 39, G3, 'تحليل عبارة باستعمال المتطابقة $a^2 + 2ab + b^2 = (a + b)^2$ . حلّل كل عبارة مما يلي: إرشاد: لتحليل العبارة A باستعمال المتطابقة $a^2 + 2ab + b^2 = (a + b)^2$ يمكن البدء بكتابة العبارة A على الشكل $a^2 + 2ab + b^2$ وتحديد كل من $a$ و $b$ ثمّ استعملها لتحليل العبارة A.', [
    item('$A = x^2 + 6x + 9$', 'x**2+6*x+9', 'factor'), item('$B = 4x^2 + 20x + 25$', '4*x**2+20*x+25', 'factor'),
    item('$C = 9x^2 + 42x + 49$', '9*x**2+42*x+49', 'factor'), item('$D = 1 + 8x + 16x^2$', '1+8*x+16*x**2', 'factor')]))
E.append(exercise(27, 39, G3, 'تحليل عبارة باستعمال المتطابقة $a^2 - 2ab + b^2 = (a - b)^2$ . حلّل كل عبارة مما يلي: إرشاد: لتحليل العبارة A باستعمال المتطابقة $a^2 - 2ab + b^2 = (a - b)^2$ يمكن البدء بكتابة العبارة A على الشكل $a^2 - 2ab + b^2$ وتحديد كل من $a$ و $b$ ثمّ استعملها لتحليل العبارة A.', [
    item('$A = x^2 - 10x + 25$', 'x**2-10*x+25', 'factor'), item('$B = 9x^2 - 12x + 4$', '9*x**2-12*x+4', 'factor'),
    item('$C = 81x^2 - 18x + 1$', '81*x**2-18*x+1', 'factor'), item('$D = 9 - 6x + x^2$', '9-6*x+x**2', 'factor')]))
E.append(exercise(28, 39, G3, 'احسب ذهنيا (دون وضع العملية) كل عدد مما يلي: أ) $21 \\times 19$ ، $101 \\times 99$ ، $1008 \\times 992$ . ب) $98^2 - 2^2$ ، $408^2 - 407^2$ ، $777^2 - 223^2$ .',
                      answer={'a': [21 * 19, 101 * 99, 1008 * 992], 'b': [98 ** 2 - 2 ** 2, 408 ** 2 - 407 ** 2, 777 ** 2 - 223 ** 2]}))
E.append(exercise(29, 39, G3, 'انقل المساويات الآتية وأتممها باستعمال المتطابقات الشهيرة: 1) $x^2 + 6x + \\ldots = (\\ldots + \\ldots)^2$ 2) $36x^2 - \\ldots + 1 = (\\ldots - \\ldots)^2$ 3) $\\ldots - \\ldots + 25 = (x - \\ldots)^2$ 4) $\\ldots - 81 = (x + \\ldots)(x - \\ldots)$',
                      answer=['x^2 + 6x + 9 = (x + 3)^2', '36x^2 - 12x + 1 = (6x - 1)^2', 'x^2 - 10x + 25 = (x - 5)^2', 'x^2 - 81 = (x + 9)(x - 9)']))
E.append(exercise(30, 39, G3, 'حلّل إلى جداء عوامل كل عبارة مما يلي:', [
    item('$A = 9x^2 + 24x + 16$', '9*x**2+24*x+16', 'factor'), item('$B = 121 - 22x + x^2$', '121-22*x+x**2', 'factor')]))
E.append(exercise(31, 39, G3, 'نفس سؤال التمرين السابق من أجل:', [
    item('$R = \\dfrac{1}{9}x^2 + \\dfrac{1}{3}x + \\dfrac{1}{4}$', 'Rational(1,9)*x**2+Rational(1,3)*x+Rational(1,4)', 'factor'),
    item('$S = \\dfrac{25}{9}x^2 - \\dfrac{5}{2}x + \\dfrac{9}{16}$', 'Rational(25,9)*x**2-Rational(5,2)*x+Rational(9,16)', 'factor')],
    answer={'R': '\\left(\\dfrac{1}{3}x + \\dfrac{1}{2}\\right)^2', 'S': '\\left(\\dfrac{5}{3}x - \\dfrac{3}{4}\\right)^2',
            'check': [check_eq('Rational(1,9)*x**2+Rational(1,3)*x+Rational(1,4)', '(x/3+Rational(1,2))**2'),
                      check_eq('Rational(25,9)*x**2-Rational(5,2)*x+Rational(9,16)', '(Rational(5,3)*x-Rational(3,4))**2')]}))
E.append(exercise(32, 39, G3, 'تحليل عبارة باستعمال المتطابقة $a^2 - b^2 = (a + b)(a - b)$ . حلّل كل عبارة مما يلي: إرشاد: لتحليل عبارة A باستعمال المتطابقة $a^2 - b^2 = (a + b)(a - b)$ يمكن البدء بكتابة العبارة A على الشّكل $a^2 - b^2$ وتحديد كلا من $a$ و $b$ ثمّ استعملها لتحليل العبارة A.', [
    item('$A = (3 - 2x)^2 - 9$', '(3-2*x)**2-9', 'factor'), item('$B = \\dfrac{1}{4} - \\left(x + \\dfrac{3}{2}\\right)^2$', 'Rational(1,4)-(x+Rational(3,2))**2', 'factor'),
    item('$C = (x + 2)^2 - (3x - 1)^2$', '(x+2)**2-(3*x-1)**2', 'factor')]))
E.append(exercise(33, 39, G3, '1) حلّل كل عبارة مما يلي: $A = (2 - x)^2 - 4x^2$ و $B = (2x + 3)^2 - (x + 1)^2$ . 2) انشر كلا من العبارتين A و B وبسّطهما ثمّ احسب كلا من $A + B$ و $A - B$ .',
                      items=[item('$A = (2 - x)^2 - 4x^2$', '(2-x)**2-4*x**2', 'factor'), item('$B = (2x + 3)^2 - (x + 1)^2$', '(2*x+3)**2-(x+1)**2', 'factor')],
                      answer={'A': ex('(2-x)**2-4*x**2'), 'B': ex('(2*x+3)**2-(x+1)**2'), 'A+B': ex('(2-x)**2-4*x**2+(2*x+3)**2-(x+1)**2'), 'A-B': ex('(2-x)**2-4*x**2-(2*x+3)**2+(x+1)**2')}))
E.append(exercise(34, 39, G3, 'ABC مثلث قائم في B، و $x$ عدد موجب، ووحدة الطول هي السنتيمتر. 1) تحقّق من أنّ مساحة المثلث ABC تساوي $2x^2 + 8x$ ، واحسب هذه المساحة من أجل $x = 1$ . 2) عبّر عن $AC^2$ بدلالة $x$، واكتب العبارة على شكل نشر مبسّط. 3) احسب الطول AC من أجل $x = 2$ .',
                      figure='مثلث ABC قائم في B حيث $AB = x + 4$ و $BC = 4x$.',
                      answer={'area': ex('(x+4)*4*x/2'), 'area(1)': 10, 'AC2': ex('(x+4)**2+(4*x)**2'), 'AC(2)': int(sp.sqrt(S('(2+4)**2+(8)**2')))}))

E.append({
    'id': 'qcm', 'kind': 'qcm', 'page': 40, 'section': 'أؤكّد تعلّماتي', 'verified': True,
    'instruction': 'في كل حالة مما يلي اختر الإجابة أو الإجابات الصحيحة، وبرّر اختيارك.',
    'items': [
        {'n': 1, 'text': 'نشر الجداء $2x(x + 2)$ هو ........', 'options': ['$2x^2 + 2x$', '$2x^2 + 4x$', '$2x + 4x$'], 'correct': [1], 'backToPage': [34]},
        {'n': 2, 'text': 'نشر الجداء $(1 - x)(-x)$ هو ........', 'options': ['$x^2 - x$', '$x + x^2$', '$1 - x^2$'], 'correct': [0], 'backToPage': [34]},
        {'n': 3, 'text': 'نشر الجداء $(4 + x)(1 - x)$ هو ........', 'options': ['$4 - x^2$', '$4 - 3x - x^2$', '$5 - x^2$'], 'correct': [1], 'backToPage': [34]},
        {'n': 4, 'text': 'تحليل العبارة $ab + b$ هو ........', 'options': ['$ab^2$', '$(a + 1)b$', '$2ab$'], 'correct': [1], 'backToPage': [34]},
        {'n': 5, 'text': 'تحليل العبارة $\\sqrt{2}x + 2$ هو ........', 'options': ['$\\sqrt{2}(x + \\sqrt{2})$', '$2\\sqrt{2}x$', '$2\\left(\\dfrac{\\sqrt{2}}{2}x + 1\\right)$'], 'correct': [0, 2], 'backToPage': [34, 35]},
        {'n': 6, 'text': 'تحليل العبارة $a - ab$ هو ........', 'options': ['$a(1 - b)$', '$b(a - 1)$', '$-a^2b$'], 'correct': [0], 'backToPage': [34, 35]},
        {'n': 7, 'text': 'نشر العبارة $(\\sqrt{3} + x)^2$ هو ........', 'options': ['$3 + x^2$', '$\\sqrt{3} + x^2$', '$3 + 2\\sqrt{3}x + x^2$'], 'correct': [2], 'backToPage': [34, 35]},
        {'n': 8, 'text': 'نشر العبارة $(1 - \\sqrt{2}x)^2$ هو ........', 'options': ['$1 - 2x^2$', '$1 - 2\\sqrt{2}x + 2x^2$', '$-2x^2$'], 'correct': [1], 'backToPage': [34, 35]},
        {'n': 9, 'text': 'العبارة $x^2 + 25$ تحلل على الشكل', 'options': ['$(x + 5)^2$', '$x^2 + 5^2$', 'لا تقبل تحليلا'], 'correct': [2], 'backToPage': [34, 35]},
        {'n': 10, 'text': 'العبارة $x^2 + 10x + 25$ تحلل على الشكل', 'options': ['$(x + 5)^2$', '$x^2 + 5^2$', 'لا تقبل تحليلا'], 'correct': [0], 'backToPage': [34, 36]},
        {'n': 11, 'text': 'العبارة $x^2 - 25$ تحلل على الشكل', 'options': ['$(x - 5)^2$', '$(x - 5)(x + 5)$', 'لا تقبل تحليلا'], 'correct': [1], 'backToPage': [34, 36]},
        {'n': 12, 'text': 'العبارة $x^2 - 10x + 25$ تحلل على الشكل', 'options': ['$(x - 5)(x + 5)$', '$(x - 5)^2$', 'لا تقبل تحليلا'], 'correct': [1], 'backToPage': [34, 36]},
        {'n': 13, 'text': 'الجداء $19 \\times 21$ يساوي', 'options': ['399', '401', '309'], 'correct': [0], 'backToPage': [34, 36]},
    ],
    'answerSource': 'computed',
})

E.append({
    'id': 'situation', 'kind': 'situation', 'page': 40, 'section': 'أدمج تعلّماتي', 'title': 'وضعية', 'verified': True,
    'text': 'الشكل الملوّن بالأزرق هو حوض شكله مربع، طول ضلعه 10m. نريد تهيئة شريط منتظم حول هذا الحوض يخصص للراجلين عرضه $x$. ماهي قيمة $x$ حتى تكون مساحة الشريط تساوي $44m^2$؟ مساعدة : $x^2 + 10x - 11 = (x - 1)(x + 11)$',
    'figure': 'حوض مربع ضلعه 10m (أزرق)، يحيط به من كل الجهات شريط عرضه $x$ (المربع الخارجي ضلعه $10 + 2x$).',
    'analysis': [
        'قراءة الوضعية وفهمها: المطلوب البحث عن العرض $x$ للشريط الذي من أجله تكون مساحة هذا الشريط $44m^2$.',
        'تحليل الوضعية واختيار استراتيجية حل مناسبة: التعبير عن مساحة الشريط بدلالة $x$ (هناك طرق متعددة)؛ توظيف المعلومة « مساحة هذا الشريط $44m^2$ »',
        'تنفيذ استراتيجية الحل: كتابة المساواة المناسبة ، حل معادلة ، ...',
    ],
    'answer': {
        'stripArea': ex('(10+2*x)**2-100'),
        'equation': '4x^2 + 40x = 44 \\iff x^2 + 10x - 11 = 0 \\iff (x - 1)(x + 11) = 0',
        'x': 1, 'rejected': -11,
        'check': [check_eq('(10+2*x)**2-100', '4*x**2+40*x'), check_eq('x**2+10*x-11', '(x-1)*(x+11)')],
    },
    'answerSource': 'computed',
})


def deep(n, text, **extra):
    d = {'id': f'ex-{n}', 'kind': 'exercise', 'number': n, 'page': 41, 'section': 'أتعمّق', 'verified': True, 'text': text}
    d.update(extra)
    d['answerSource'] = 'computed'
    return d


E.append(deep(35, 'لتكن العبارة E حيث $E = (x + 1)(x + 9) - (x + 3)^2$ . 1) انشر وبسّط العبارة E. 2) استعمل نتيجة السؤال (1) لحساب كل مما يلي ذهنيا: $101 \\times 109 - 103^2$ ، $1{,}5 \\times 9{,}5 - (3{,}5)^2$',
                  answer={'E': ex('(x+1)*(x+9)-(x+3)**2'), '101 × 109 − 103²': 101 * 109 - 103 ** 2, '1,5 × 9,5 − 3,5²': fmt(sp.nsimplify('1.5*9.5-3.5**2'))}))
E.append(deep(36, '1) استعمل حاسبة لحساب كل عدد مما يلي: $a = 35^2 - 36 \\times 34$ ، $b = 97^2 - 98 \\times 96$ ، $c = 321^2 - 322 \\times 320$ . 2) خمّن نتيجة الحساب $2018^2 - 2019 \\times 2017$ ، ثمّ تحقّق من ذلك. 3) اشرح لماذا كل من الصيغ الآتية تعبّر عن الحسابات السابقة، ثمّ انشر كلا منها وبسّطها: $E_1 = x^2 - (x + 2)(x - 1)$ ، $E_2 = (x - 1)^2 - x(x - 2)$ ، $E_3 = (x + 1)^2 - (x + 2)x$ .',
                  discrepancy='E₁ imprimé « x² − (x + 2)(x − 1) » vaut 2 − x : il n’exprime aucune des différences a, b, c (toutes égales à 1). La forme qui les exprime est x² − (x + 1)(x − 1).',
                  correction={'decidedBy': 'owner-policy', 'decidedOn': '2026-10-01', 'E1': '$E_1 = x^2 - (x + 1)(x - 1)$',
                              'note': '(x + 2) → (x + 1) : E₁ = 1 comme E₂ et E₃, ce que la question 3 fait expliquer.'},
                  answer={'a': 35 ** 2 - 36 * 34, 'b': 97 ** 2 - 98 * 96, 'c': 321 ** 2 - 322 * 320, '2018² − 2019 × 2017': 2018 ** 2 - 2019 * 2017,
                          'E1': ex('x**2-(x+1)*(x-1)'), 'E1printed': ex('x**2-(x+2)*(x-1)'), 'E2': ex('(x-1)**2-x*(x-2)'), 'E3': ex('(x+1)**2-(x+2)*x')}))
E.append(deep(37, 'وحدة الطول هي السنتيمتر، و $x$ عدد موجب. لوّنا في المربع ABCD مستطيلين ومربّعا كما في الشكل. 1) أوجد حصرا للعدد $x$. 2) بيّن أنّ الطولين EF و GH متساويان، وعبّر عنهما بدلالة $x$. 3) تحقّق بطريقتين مختلفتين أنّ مساحة الجزء غير الملوّن من الشكل هي $\\mathcal{A} = 60 - 4x - x^2$ . 4) احسب مساحة الجزء غير الملوّن من أجل $x = 4$ .',
                  figure='مربع ABCD ضلعه 10؛ $AE = x$ ، $FB = 4$ ، $DH = 4$ ؛ المربع ضلعه $x$ (في الركن A)، المستطيل (1) بعداه 4 و 10 (على الضلع BC)، المستطيل (2) بعداه $x$ و 4 (في الركن D).',
                  answer={'bounds': '0 < x < 6', 'EF = GH': '6 - x', 'A': ex('100-x**2-40-4*x'), 'A(4)': int(S('60-4*4-4**2'))}))
E.append(deep(38, 'باستعمال معطيات الشّكل المرفق. 1) عبّر بدلالة $x$ عن $AB^2$. 2) اكتب عبارة $AB^2$ التي وجدتها مرّة على شكل جداء، ومرّة أخرى على شكل نشر مبسّط. 3) احسب في حالة $x = 0$ وبطريقتين مختلفتين الطول AB بالتدوير إلى $10^{-2}$.',
                  figure='مثلث ABC قائم في B حيث $BC = x + 2$ و $AC = 2x + 5$.',
                  answer={'AB2': '(2x + 5)^2 - (x + 2)^2', 'factored': fac('(2*x+5)**2-(x+2)**2'), 'expanded': ex('(2*x+5)**2-(x+2)**2'), 'AB(0)': '√21 ≈ 4,58'}))
E.append(deep(39, 'إليك العبارة الجبرية D حيث $D = x^2 - 4 + (x - 2)(3x + 5)$ . 1) انشر العبارة D. 2) حلّل $x^2 - 4$ استنتج تحليلا للعبارة D. 3) استعمل العبارة المناسبة لحساب قيمة D من أجل: $x = 2$ ؛ $x = 0$ ؛ $x = -1{,}75$ .',
                  answer={'expanded': ex('x**2-4+(x-2)*(3*x+5)'), 'x2-4': fac('x**2-4'), 'factored': fac('x**2-4+(x-2)*(3*x+5)'),
                          'D(2)': 0, 'D(0)': -14, 'D(-1,75)': int(sp.nsimplify(S('x**2-4+(x-2)*(3*x+5)').subs(x, sp.Rational(-7, 4))))}))
E.append(deep(40, '1) نضع : $E = 4x^2 - 8x - 5$ . احسب E من أجل $x = 0{,}5$ . 2) نضع : $F = (2x - 2)^2 - 9$ . أ) انشر ثمّ بسّط العبارة F. ب) حلّل العبارة F. جـ) ميّز العبارة المناسبة التي تسمح بمعرفة قيمة F من أجل $x = 0{,}5$ . دون حساب.',
                  answer={'E(0,5)': int(S('4*x**2-8*x-5').subs(x, sp.Rational(1, 2))), 'F': ex('(2*x-2)**2-9'), 'Ffactored': fac('(2*x-2)**2-9'), 'F = E': check_eq('(2*x-2)**2-9', '4*x**2-8*x-5')}))

# ── Cohérence des vérifications embarquées ─────────────────────────────────
assert S('(0+2)*(0-1)') == -2

DEST = {
    '_comment': 'elementId → { lesson, module } ; `duplicatedIn` autorise une seconde utilisation déclarée ; `items` répartit un élément à plusieurs sous-éléments. Vérifié par scripts/check-textbook-coverage.mjs.',
    'objectives': {'lesson': 'unit', 'module': 'page'},
    'history-descartes': {'lesson': 'unit', 'module': 'page', 'duplicatedIn': [{'lesson': 'mutatabiqat-shahira', 'module': 1, 'note': 'le tableau de Descartes (2x + 1)² : la même lecture par aires que le carré MNPQ'}]},
    'challenge': {'lesson': 'unit', 'module': 'page', 'duplicatedIn': [{'lesson': 'wadiya-idmajiya-harfi', 'module': 1, 'note': 'le triangle x + 1, x + 2, x + 3 : l’accroche de la synthèse, résolue en fin de module'}]},
    'prep': {'lesson': 'nashr-tabsit', 'module': 0, 'items': {
        '1-2': {'lesson': 'wadiya-idmajiya-harfi', 'module': 0},
        '3-4': {'lesson': 'nashr-tabsit', 'module': 0},
        '5-6': {'lesson': 'mutatabiqat-shahira', 'module': 0},
        '7-8': {'lesson': 'nashr-tabsit', 'module': 0},
        '9-10': {'lesson': 'tahlil-ibara', 'module': 0}}},
    'act-1': {'lesson': 'nashr-tabsit', 'module': 1},
    'know-1': {'lesson': 'nashr-tabsit', 'module': 2},
    'now-35-1': {'lesson': 'nashr-tabsit', 'module': 3},
    **{f'ex-{n}': {'lesson': 'nashr-tabsit', 'module': 3} for n in range(1, 9)},
    'act-2a': {'lesson': 'mutatabiqat-shahira', 'module': 1},
    'act-2b': {'lesson': 'mutatabiqat-shahira', 'module': 1},
    'act-2c': {'lesson': 'mutatabiqat-shahira', 'module': 2},
    'know-2': {'lesson': 'mutatabiqat-shahira', 'module': 3},
    'method-expand-identities': {'lesson': 'mutatabiqat-shahira', 'module': 4},
    'now-36-1': {'lesson': 'mutatabiqat-shahira', 'module': 4},
    **{f'ex-{n}': {'lesson': 'mutatabiqat-shahira', 'module': 4} for n in range(9, 20)},
    'ex-28': {'lesson': 'mutatabiqat-shahira', 'module': 4, 'items': {'a': {'lesson': 'mutatabiqat-shahira', 'module': 4}, 'b': {'lesson': 'tahlil-ibara', 'module': 4}}},
    'ex-35': {'lesson': 'mutatabiqat-shahira', 'module': 4},
    'ex-36': {'lesson': 'mutatabiqat-shahira', 'module': 4},
    'act-3': {'lesson': 'tahlil-ibara', 'module': 1},
    'know-3': {'lesson': 'tahlil-ibara', 'module': 2},
    'method-common-factor': {'lesson': 'tahlil-ibara', 'module': 3},
    'now-35-2': {'lesson': 'tahlil-ibara', 'module': 3},
    'method-factor-identities': {'lesson': 'tahlil-ibara', 'module': 3},
    'method-expand-factor': {'lesson': 'tahlil-ibara', 'module': 3},
    'now-36-2': {'lesson': 'tahlil-ibara', 'module': 3},
    **{f'ex-{n}': {'lesson': 'tahlil-ibara', 'module': 4} for n in [20, 21, 22, 23, 24, 25, 26, 27, 29, 30, 31, 32, 33]},
    'situation': {'lesson': 'wadiya-idmajiya-harfi', 'module': 1, 'duplicatedIn': [{'lesson': 'wadiya-idmajiya-harfi', 'module': 4}]},
    'qcm': {'lesson': 'wadiya-idmajiya-harfi', 'module': 2, 'duplicatedIn': [
        {'lesson': 'nashr-tabsit', 'module': 4, 'items': [1, 2, 3]},
        {'lesson': 'mutatabiqat-shahira', 'module': 5, 'items': [7, 8, 13]},
        {'lesson': 'tahlil-ibara', 'module': 5, 'items': [4, 6, 10, 11, 12]},
        {'lesson': 'tahlil-ibara', 'module': 4, 'items': [5, 9], 'note': 'formative : 5 (deux bonnes options, « يساويه / لا يساويه ») et 9 (« لا تقبل تحليلا ») dans أوظّف تعلّماتي'}]},
    **{f'ex-{n}': {'lesson': 'wadiya-idmajiya-harfi', 'module': 3} for n in [34, 37, 38, 39, 40]},
}

DISCREPANCIES = [
    {'elementId': 'act-1', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
     'text': '« 3x(9 + 5) » : le « x » est le signe × (question 1 est un calcul numérique « بطريقتين مختلفتين »).'},
    {'elementId': 'know-3', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
     'text': 'Dans « التحليل — خواص », la seconde égalité est imprimée « k(a − b) = ka − kb » (sens du développement) ; en factorisation : ka − kb = k(a − b).'},
    {'elementId': 'method-factor-identities', 'kind': 'statement-vs-solution', 'resolution': 'corrected_in_lessons — see element.correction',
     'text': 'Énoncé C = (4x − 1)² − (x + 4)², solution avec b = x − 4 → 15(x − 1)(x + 1). L’énoncé est aligné sur la solution.'},
    {'elementId': 'method-expand-factor', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
     'text': '« x² − 6x + 9 + 2x − 6 = x² + 4x + 3 » : la réduction juste est x² − 4x + 3.'},
    {'elementId': 'ex-6', 'kind': 'handwritten-copy', 'text': 'La copie du premier élève conclut « + 6 » alors que son propre calcul donne « − 6 » ; les deux sont faux, la leçon garde la copie telle quelle (c’est une copie d’élève à juger).'},
    {'elementId': 'ex-25', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
     'text': 'G : « (3,7x + x) » lu (3,7 + x), facteur commun des trois termes.'},
    {'elementId': 'ex-36', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
     'text': 'E₁ = x² − (x + 2)(x − 1) vaut 2 − x et n’exprime pas a, b, c (= 1) ; corrigé en x² − (x + 1)(x − 1).'},
    {'elementId': 'unit', 'kind': 'placement', 'text': 'Le programme (programme_4am_2026_2027.json) range النشر والتبسيط et التحليل dans « ميدان الحساب الحرفي » ; le propriétaire a demandé (2026-10-01) de placer l’unité sous « ميدان أنساب الأعداد والحساب », comme les unités 1 et 2 du manuel. Voir units_4am_2026_2027.json › placement.'},
]

doc = {
    '_comment': [
        'EXTRACTION CANONIQUE du manuel scolaire officiel — 4AM, الجيل الثاني, unité 3 « الحساب الحرفي ».',
        'Source : « وحدة الحساب الحرفي.pdf » (11 pages PDF = pages 31 à 41 du manuel), scan sans couche texte.',
        'Ce fichier est LA source de vérité pédagogique de l’unité dans le dépôt. Tout contenu de leçon, toute manipulation,',
        'tout exercice de pratique cite un `id` d’ici via `source.elementId`.',
        'Transcription VISUELLE (pages rendues à 220 dpi, zooms sur les passages douteux) ; la formulation arabe est celle du manuel.',
        'Les réponses (`answer`) NE viennent PAS du manuel (il n’a pas de corrigé) : elles sont calculées par sympy dans',
        'build-extraction.py et marquées `answerSource: computed`. `expanded` / `factored` : formes LaTeX calculées.',
        'Les coquilles sont CORRIGÉES dans les leçons (champ `correction`, politique du propriétaire du 2026-09-30) ; `discrepancies` les liste.',
        'Les `destinations` sont le plan de couverture : chaque élément a UNE destination (ou une répartition `items`),',
        'une seconde utilisation est déclarée dans `duplicatedIn`. scripts/check-textbook-coverage.mjs le vérifie.',
        'Généré par docs/sources/4am/unit3/build-extraction.py — ne pas éditer à la main.',
    ],
    'unitCode': 'hisab-harfi',
    'textbook': {'title': 'كتاب الرياضيات — السنة الرابعة من التعليم المتوسط', 'generation': 'الجيل الثاني', 'unitNumber': 3, 'unitTitle': 'الحساب الحرفي',
                 'pages': {'first': 31, 'last': 41}, 'pdfPageOffset': 30,
                 'sections': ['سأتعلّم في هذا الباب', 'تحدّ', 'أستعدّ', 'أنشطة', 'معارف', 'طرائق', 'دوري الآن', 'أوظّف تعلّماتي', 'أؤكّد تعلّماتي', 'أدمج تعلّماتي', 'أتعمّق']},
    'frozenAt': '2026-10-01',
    'terminology': {'note': 'Le manuel écrit « نشر » (développer), « تبسيط » (réduire), « تحليل » (factoriser), « جداء » / « مجموع » / « فرق », « عامل مشترك », « المتطابقات الشهيرة » (et « الجداءات الشهيرة » en titre d’exercices), « مربع مجموع », « مربع فرق », « جداء مجموع حدين وفرقهما », « الحساب المتمعن فيه », « احسب ذهنيا (دون وضع العملية) ».',
                    'terms': ['نشر', 'تبسيط', 'تحليل', 'جداء', 'مجموع', 'فرق', 'عامل مشترك', 'الخاصية التوزيعية', 'المتطابقة', 'المتطابقات الشهيرة', 'مربع مجموع', 'مربع فرق', 'جداء مجموع حدين وفرقهما', 'حدود متشابهة', 'احسب ذهنيا']},
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
