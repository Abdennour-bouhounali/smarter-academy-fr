#!/usr/bin/env python3
"""Génère docs/sources/4am/unit12/extraction.json — unité 12 « الأشعة في معلم » (pp. 139–149).

Transcription VISUELLE du scan (« وحدة الأشعة في معلم.pdf », 11 pages, sans couche texte, page PDF N = page du manuel
138 + N — numéros imprimés relus en bas de page : 139 … 149), pages rendues à 300 dpi puis découpées passage par passage
(≤ 1400 px). L'unité est COMPLÈTE : ouverture (سأتعلّم + encadré historique Descartes / Fermat), تحدّ, أستعدّ, أنشطة,
معارف, طرائق + « دوري الآن », أوظّف تعلّماتي, أؤكّد تعلّماتي (QCM), أدمج تعلّماتي (وضعية), أتعمّق.

Le texte arabe est celui du manuel, au mot près ; les passages illisibles sont complétés et marqués
`reading: 'completed'`. Les réponses ne viennent PAS du manuel : elles sont CALCULÉES ici (`answerSource: computed`) en
coordonnées exactes (fractions) — composantes x_B − x_A, milieux, distances exactes (q√r ET valeur décimale),
parallélogrammes, triangles rectangles / isocèles, appartenance à un cercle — et re-vérifiées par assert. Les
coordonnées lues sur un quadrillage sont dans `figure.points` avec l'unité des axes ; un signe moins perdu (erreur
classique du scan) est arbitré par la cohérence figure ↔ calcul et déclaré dans `discrepancies`.

Usage : python3 docs/sources/4am/unit12/build-extraction.py
"""
import json
import math
from fractions import Fraction as F
from pathlib import Path


# ── Géométrie analytique exacte ──────────────────────────────────────────────
def P(x, y):
    return (F(x), F(y))


def vec(a, b):
    """Composantes de AB : (x_B − x_A ; y_B − y_A)."""
    return (b[0] - a[0], b[1] - a[1])


def add(*vs):
    return (sum(v[0] for v in vs), sum(v[1] for v in vs))


def tr(p, v):
    return (p[0] + v[0], p[1] + v[1])


def mid(a, b):
    return ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)


def sym(p, c):
    return (2 * c[0] - p[0], 2 * c[1] - p[1])


def cross(u, v):
    return u[0] * v[1] - u[1] * v[0]


def dot(u, v):
    return u[0] * v[0] + u[1] * v[1]


def d2(a, b):
    """Carré de la distance AB (exact)."""
    v = vec(a, b)
    return v[0] * v[0] + v[1] * v[1]


def para(a, b, c, d):
    """ABCD (dans cet ordre) parallélogramme non aplati ⇔ AB = DC et A, B, D non alignés."""
    return vec(a, b) == vec(d, c) and cross(vec(a, b), vec(a, d)) != 0


def right_at(a, b, c):
    """Triangle ABC rectangle en A (réciproque de Pythagore : BC² = AB² + AC²)."""
    return d2(b, c) == d2(a, b) + d2(a, c)


def sqrt_parts(q):
    """√q (q rationnel ≥ 0) = (k, r, m) avec √q = k√r / m, r sans facteur carré."""
    q = F(q)
    n, m = q.numerator * q.denominator, q.denominator      # √(n/m²)·… : √q = √(num·den)/den
    k, r = 1, n
    f = 2
    while f * f <= r:
        while r % (f * f) == 0:
            r //= f * f
            k *= f
        f += 1
    g = math.gcd(k, m)
    return k // g, r, m // g


def surd(q):
    """Écriture LaTeX exacte de √q (q rationnel)."""
    k, r, m = sqrt_parts(q)
    if r == 1:
        core = str(k)
    elif k == 1:
        core = f'\\sqrt{{{r}}}'
    else:
        core = f'{k}\\sqrt{{{r}}}'
    return core if m == 1 else f'\\dfrac{{{core}}}{{{m}}}'


def dec(q, nd=2):
    """Valeur décimale (virgule) de √q arrondie à nd chiffres."""
    return f'{math.sqrt(q):.{nd}f}'.replace('.', '{,}')


def dist(a, b):
    """{'squared', 'exact', 'approx'} de la distance AB."""
    q = d2(a, b)
    return {'squared': fr(q), 'exact': f'${surd(q)}$', 'approx': dec(q)}


def fr(x):
    x = F(x)
    return int(x) if x.denominator == 1 else str(x)


def pts(**kw):
    """Coordonnées GeoFigure : {nom: [x, y]} (fraction en chaîne 'p/q' si non entière)."""
    return {k.replace('_', "'"): [fr(x), fr(y)] for k, (x, y) in kw.items()}


def tex_pt(name, p):
    """$A(2\\,;\\,-1)$ — fractions en \\dfrac."""
    def t(x):
        x = F(x)
        if x.denominator == 1:
            return str(x.numerator)
        s = '-' if x < 0 else ''
        return f'{s}\\dfrac{{{abs(x.numerator)}}}{{{x.denominator}}}'
    return f'${name}({t(p[0])}\\,;\\,{t(p[1])})$'


def tex_vec(name, v):
    def t(x):
        x = F(x)
        if x.denominator == 1:
            return str(x.numerator)
        s = '-' if x < 0 else ''
        return f'{s}\\dfrac{{{abs(x.numerator)}}}{{{x.denominator}}}'
    return f'$\\overrightarrow{{{name}}}\\begin{{pmatrix}} {t(v[0])} \\\\ {t(v[1])} \\end{{pmatrix}}$'


E = []
DISC = []

# ══ Page 139 — ouverture, تحدّ, أستعدّ ═══════════════════════════════════════
E.append({
    'id': 'objectives', 'kind': 'objectives', 'page': 139, 'section': 'سأتعلّم في هذا الباب', 'verified': True,
    'items': [
        'قراءة مركّبتي شعاع في معلم.',
        'تمثيل شعاع بمعرفة مركّبتيه.',
        'حساب مركّبتي شعاع بمعرفة إحداثيات مبدإ ونهاية ممثله.',
        'حساب إحداثيتي منتصف قطعة بمعرفة إحداثيتي كل من طرفيها.',
        'حساب المسافة بين نقطتين في معلم متعامد ومتجانس.',
    ],
})
E.append({
    'id': 'intro-descartes', 'kind': 'aside', 'page': 139, 'section': 'مدخل الباب', 'title': 'ديكارت وفيرما', 'verified': True,
    'text': 'إحداثيتا نقطة هما عددان تحددان موضع هذه النقطة في المستوي بالنسبة إلى معلم معطى. كانت فكرة الإحداثيات مبهمة وحدسية عند المصريين القدماء، وأصبحت أكثر وضوحا مع أرخميدس (287 - 212 قبل الميلاد) وأبولونيوس دبيرغا Apollonius de Perga (القرن الثالث قبل الميلاد). وقد طُوِّر مفهوم الإحداثيات في أبحاث العالمين فيرما (1601 - 1665) وديكارت (1596 - 1650) كل على حدى، مما أدى إلى ظهور الهندسة التحليلية. ويحكى أن ديكارت، وبينما كان يشاهد ذبابة تحط على مواقع مختلفة من نافذته التي تتكون من بلاطات زجاجية صغيرة، أخذ يحدّد موقع هذه الذبابة بعددين سُمّيا فيما بعد إحداثيتي نقطة في معلم. يتميز ديكارت بإحدى مقولاته الشهيرة وهي «أنا أفكر، إذن أنا موجود».',
    'caption': 'صورة: بيار فيرما — روني ديكارت (صورة في الكتاب — لا تُنسخ).',
    'note': '« على حدى » et « دبيرغا » sont les graphies du manuel (gardées). Le récit de la mouche sur les carreaux de la fenêtre est la seule image concrète de l’unité : un repère = un quadrillage de carreaux.',
})

# تحدّ : A(2/3 ; −2), B(−4 ; 7/3), unité 1 cm.
cA, cB = P(F(2, 3), -2), P(-4, F(7, 3))
cAB = vec(cA, cB)
assert cAB == (F(-14, 3), F(13, 3)) and d2(cA, cB) == F(365, 9)
assert surd(d2(cA, cB)) == '\\dfrac{\\sqrt{365}}{3}'
E.append({
    'id': 'challenge', 'kind': 'challenge', 'page': 139, 'section': 'تحدّ', 'verified': True,
    'text': 'المستوي مزوّد بمعلم متعامد ومتجانس مبدؤه O. (الوحدة 1cm) $A\\left(\\dfrac{2}{3}\\,;\\,-2\\right)$ و $B\\left(-4\\,;\\,\\dfrac{7}{3}\\right)$ نقطتان من المستوي. احسب القيمة المضبوطة للمسافة AB.',
    'figure': {
        'description': 'معلم متعامد ومتجانس (ورقة مرصوفة، كل مربع = 1) مدرّج 1، 2، -1 على محور الفواصل و -1 على محور التراتيب ؛ B في أعلى اليسار و A أسفل يمين المبدإ — النقطتان مُعلّمتان دون إحداثيات.',
        'points': pts(A=cA, B=cB), 'grid': {'unit': 1, 'unitLength': '1cm', 'xRange': [-4, 2], 'yRange': [-2, 3]},
        'reading': 'Positions mesurées (51 px / unité) : A ≈ (0,65 ; −2), B ≈ (−4,1 ; 2,4) — cohérentes avec les coordonnées du texte.',
    },
    'answer': {'AB': tex_vec('AB', cAB), 'AB2': '$AB^2 = \\left(-\\dfrac{14}{3}\\right)^2 + \\left(\\dfrac{13}{3}\\right)^2 = \\dfrac{196 + 169}{9} = \\dfrac{365}{9}$',
               'distance': dist(cA, cB), 'final': '$AB = \\dfrac{\\sqrt{365}}{3}$ cm ≈ 6,37 cm'},
    'answerSource': 'computed',
    'note': '« القيمة المضبوطة » : la valeur exacte attendue est $\\dfrac{\\sqrt{365}}{3}$ (365 = 5 × 73, sans facteur carré) ; le piège est de mesurer sur le dessin (≈ 6,4 cm).',
})

# أستعدّ : item 1 sur quadrillage (A(2;3), B(−3;3), C(3;0), D(−3;0)).
pA, pB, pC, pD = P(2, 3), P(-3, 3), P(3, 0), P(-3, 0)
assert mid(pD, pC) == P(0, 0) and d2(pC, pD) == 36
pM, pN = P(0, 1), P(1, 0)
E.append({
    'id': 'prep', 'kind': 'prep', 'page': 139, 'section': 'أستعدّ', 'verified': True,
    'instruction': 'أصحيح أم خاطئ؟ برّر إجابتك.',
    'items': [
        {'number': 1, 'text': 'في المعلم الآتي:', 'figure': {
            'description': 'معلم متعامد ومتجانس على ورقة مرصوفة (المربع = 1، مدرّج 1 على المحورين) ؛ A و B على نفس الارتفاع (خط متقطع أفقي) ؛ D و C على محور الفواصل ؛ [BD] و [A·] متقطعان شاقوليان.',
            'points': pts(A=pA, B=pB, C=pC, D=pD), 'grid': {'unit': 1, 'xRange': [-4, 4], 'yRange': [-2, 4]},
            'reading': 'Lu à ≈ 50 px / unité : A (2 ; 3), B (−3 ; 3), C (3 ; 0), D (−3 ; 0).'},
         'statements': [
             {'text': 'إحداثيتا A هما (2;3).', 'answer': True},
             {'text': 'إحداثيتا B هما (3;3).', 'answer': False, 'justification': 'B على يسار محور التراتيب: إحداثيتاها $(-3\\,;\\,3)$ .'},
             {'text': 'إحداثيتا منتصف القطعة [DC] هما (0;0).', 'answer': True, 'justification': '$\\left(\\dfrac{-3 + 3}{2}\\,;\\,\\dfrac{0 + 0}{2}\\right) = (0\\,;\\,0)$ : المبدأ O.'},
             {'text': 'المسافة بين C و D هي 0.', 'answer': False, 'justification': 'CD = 3 − (−3) = 6 (لا 0 ؛ الخلط مع مجموع الفاصلتين 3 + (−3)).'},
         ]},
        {'number': 2, 'text': 'في معلم للمستوي، النقطتان $M(0\\,;\\,1)$ و $N(1\\,;\\,0)$ تقعان على محور الفواصل.', 'answer': False,
         'justification': 'N على محور الفواصل (ترتيبها 0) ؛ M على محور التراتيب (فاصلتها 0).'},
        {'number': 3, 'text': 'ABCD متوازي أضلاع، إذن $\\overrightarrow{AB} = \\overrightarrow{DC}$ .', 'answer': True},
        {'number': 4, 'text': 'ABCD متوازي أضلاع. إذن الانسحاب الذي يحول D إلى C يحوّل أيضا A إلى B.', 'answer': True,
         'justification': '$\\overrightarrow{DC} = \\overrightarrow{AB}$'},
        {'number': 5, 'text': 'M و N نقطتان. J منتصف [MN]، إذن $\\overrightarrow{MJ} = \\overrightarrow{JN}$ .', 'answer': True},
        {'number': 6, 'text': 'ABCD متوازي أضلاع. إذن $\\overrightarrow{AD} = \\overrightarrow{BC}$ .', 'answer': True},
    ],
    'note': 'Item 1 : quatre affirmations en tableau à côté du repère, jugées séparément. Items 3–6 rappellent l’unité 11 (vecteurs égaux ⇔ parallélogramme ⇔ milieu).',
})

# ══ Page 140 — أنشطة 1–2 ════════════════════════════════════════════════════
A1 = dict(A=P(-2, 4), C=P(6, 4), B=P(6, 2), D=P(3, -2))
a1 = A1
assert vec(a1['A'], a1['C']) == (8, 0) and vec(a1['C'], a1['B']) == (0, -2) and vec(a1['A'], a1['B']) == (8, -2)
assert vec(a1['B'], a1['D']) == (-3, -4)
O = P(0, 0)
A1_OM = {k: vec(O, a1[k]) for k in 'ABCD'}
assert all(A1_OM[k] == a1[k] for k in 'ABCD')
E.append({
    'id': 'act-1', 'kind': 'activity', 'number': 1, 'page': 140, 'section': 'أنشطة', 'title': 'قراءة مركّبتي شعاع', 'verified': True,
    'intro': 'المستوي مزوّد بمعلم متعامد ومتجانس (O ; I ,J) (يُسمّى المَعلم (O ; I ,J) مَعلمًا متعامدا ومتجانسا في حالة OI = OJ = 1 و ((OI) ⊥ (OJ)) (الشكل)',
    'parts': [
        {'label': '1)', 'text': 'عيّن إحداثيتي كل نقطة من النقاط A، B، C.'},
        {'label': '2)', 'text': 'النقطة C هي صورة النقطة A بالانسحاب الذي شعاعه $\\overrightarrow{AC}$ . ماهو طول هذا الشعاع ؟ ماهو منحاه ؟ ماهو اتجاهه ؟ النقطة B هي صورة النقطة C بانسحاب . ماهو شعاع هذا الانسحاب؟ عيّن منحى، اتّجاه وطول هذا الشعاع.'},
        {'label': '3)', 'text': 'لاحظ أنّ الإنتقال من A إلى C يكون، بموازاة المستقيم (OI)، في الاتجاه الموجب بـ 8 وحدات. ثم ننتقل من C إلى B، بموازاة المستقيم (OJ)، في الاتجاه السالب بوحدتين. نقول إنّ 8 و 2- هما مركبتا الشعاع $\\overrightarrow{AB}$ ونكتب $\\overrightarrow{AB}\\begin{pmatrix} 8 \\\\ -2 \\end{pmatrix}$ .'},
        {'label': '4)', 'text': 'D هي نقطة إحداثياها $(3\\,;\\,-2)$ . باستعمال نفس الكيفية التي رأيتها في الجزء (3) للانتقال من النقطة B إلى النقطة D، استنتج مركبتي الشعاع $\\overrightarrow{BD}$ .'},
        {'label': '5)', 'text': 'عيّن مركبتي كل شعاع من الأشعة $\\overrightarrow{OA}$ ، $\\overrightarrow{OB}$ ، $\\overrightarrow{OC}$ ، $\\overrightarrow{OD}$ ؟ انقل وأتمم، «إذا كانت M نقطة إحداثياها $(x\\,;\\,y)$ في مَعلَم من المستوي مبدؤه O، فإنّ مركبتي الشعاع $\\overrightarrow{OM}$ هما… و …».'},
    ],
    'figure': {
        'description': 'ورقة مرصوفة، معلم (O ; I, J) مدرّج 1 (I على محور الفواصل، J على محور التراتيب) ؛ سهم أحمر أفقي من A إلى C مكتوب عليه 8، سهم أحمر شاقولي من C إلى B مكتوب عليه -2، وسهم أسود من A إلى B. D غير مرسومة (تُعطى بإحداثيتيها في الجزء 4).',
        'points': pts(A=a1['A'], B=a1['B'], C=a1['C']), 'given': {'D': [3, -2]},
        'segments': ['AC', 'CB', 'AB'], 'grid': {'unit': 1, 'xRange': [-3, 8], 'yRange': [-2, 6]},
        'reading': 'Page bombée (quadrillage courbé vers le bas à droite) : lu contre les lignes de grille locales, ≈ 77 px / unité ; A (−2 ; 4), C (6 ; 4), B (6 ; 2) — exactement cohérent avec les étiquettes 8 et −2 des flèches (assert).',
    },
    'answer': {
        '1': {'A': tex_pt('A', a1['A']), 'B': tex_pt('B', a1['B']), 'C': tex_pt('C', a1['C'])},
        '2': {'AC': 'طوله 8 ، منحاه منحى (OI) (أفقي)، اتجاهه الاتجاه الموجب (من اليسار نحو اليمين)', 'CB': 'الشعاع $\\overrightarrow{CB}$ : منحى (OJ) (شاقولي)، الاتجاه السالب (نحو الأسفل)، طوله 2'},
        '4': tex_vec('BD', vec(a1['B'], a1['D'])) + ' : من B(6 ; 2) إلى D(3 ; −2) ننتقل بـ 3 وحدات في الاتجاه السالب بموازاة (OI) ثم بـ 4 وحدات في الاتجاه السالب بموازاة (OJ).',
        '5': {k: tex_vec('O' + k, A1_OM[k]) for k in 'ABCD'},
        '5rule': 'مركبتا الشعاع $\\overrightarrow{OM}$ هما x و y : $\\overrightarrow{OM}\\begin{pmatrix} x \\\\ y \\end{pmatrix}$',
    },
    'answerSource': 'computed',
    'note': 'Le manuel écrit les coordonnées « (3;-2) » de gauche à droite (abscisse d’abord) même dans une phrase arabe ; la plateforme les écrit $(3\\,;\\,-2)$ dans `$…$` (isolation LTR).',
})

A2 = dict(C=P(3, 1), D=P(2, -5))
A2['E'] = tr(A2['D'], (F(3), F(4)))
A2['F'] = P(6, 5)
assert vec(A2['C'], A2['D']) == (-1, -6) and A2['E'] == P(5, -1)
assert vec(A2['C'], A2['F']) == vec(A2['D'], A2['E']) == (3, 4)
E.append({
    'id': 'act-2', 'kind': 'activity', 'number': 2, 'page': 140, 'section': 'أنشطة', 'title': 'مركبتا شعاع علمت إحداثيات مبدئه ونهايته', 'verified': True,
    'intro': 'المستوي مزود بمعلم مبدؤه O. (الشكل)',
    'parts': [
        {'label': 'أ)', 'text': 'C و D نقطتان من المستوى. (الشكل) 1) عيّن إحداثيتي كل من C و D. 2) ما هما مركبتا الشعاع $\\overrightarrow{CD}$ ؟ 3) E نقطة حيث مركبتا $\\overrightarrow{DE}$ هما 3 و 4. أوجد إحداثيتي النقطة E.'},
        {'label': 'ب)', 'text': 'نفرض أن إحداثيتي النقطتين A و B هما $(x_A\\,;\\,y_A)$ و $(x_B\\,;\\,y_B)$ على الترتيب. مركبتي الشعاع $\\overrightarrow{AB}$ هما $a$ و $b$ . 1) عبّر عن $a$ بدلالة $x_A$ و $x_B$ وعن $b$ بدلالة $y_A$ و $y_B$ . 2) $F(6\\,;\\,5)$ نقطة من المستوي. عيّن الشعاع $\\overrightarrow{CF}$ . تحقّق أن للشعاعين $\\overrightarrow{DE}$ و $\\overrightarrow{CF}$ نفس المركبتين. نقول إنّ الشعاعين $\\overrightarrow{DE}$ و $\\overrightarrow{CF}$ متساويان. نكتب $\\overrightarrow{DE} = \\overrightarrow{CF}$ .'},
    ],
    'figure': {
        'description': 'ورقة مرصوفة، معلم مبدؤه O مدرّج 1 ؛ C فوق محور الفواصل على اليمين (خطان متقطعان نحو المحورين، الترتيب 1 مكتوب) ؛ D بعيدة تحت محور الفواصل (خطان متقطعان نحو المحورين).',
        'points': pts(C=A2['C'], D=A2['D']), 'grid': {'unit': 1, 'xRange': [-2, 6], 'yRange': [-6, 2]},
        'reading': 'Lu à ≈ 66 px / unité : C (3 ; 1), D (2 ; −5) — D est sur la 5e ligne sous l’axe (lignes à 265, 333, 401, 469, 537, 605 px).',
    },
    'answer': {
        'a1': {'C': tex_pt('C', A2['C']), 'D': tex_pt('D', A2['D'])},
        'a2': tex_vec('CD', vec(A2['C'], A2['D'])),
        'a3': tex_pt('E', A2['E']) + ' : $x_E = 2 + 3 = 5$ و $y_E = -5 + 4 = -1$',
        'b1': '$a = x_B - x_A$ و $b = y_B - y_A$',
        'b2': tex_vec('CF', vec(A2['C'], A2['F'])) + ' و ' + tex_vec('DE', vec(A2['D'], A2['E'])) + ' : نفس المركبتين.',
    },
    'answerSource': 'computed',
})

# ══ Page 141 — أنشطة 3–4 ════════════════════════════════════════════════════
K3, L3 = P(5, 3), P(-3, 1)
J3 = mid(K3, L3)
assert J3 == P(1, 2) and vec(K3, J3) == vec(J3, L3) == (-4, -1)
E.append({
    'id': 'act-3', 'kind': 'activity', 'number': 3, 'page': 141, 'section': 'أنشطة', 'title': 'إحداثيتا منتصف قطعة مستقيم', 'verified': True,
    'intro': 'المستوي مزود بمَعلم متعامد ومتجانس مبدؤه O.',
    'parts': [
        {'label': '1)', 'text': 'علّم النقط $K(5\\,;\\,3)$ و $L(-3\\,;\\,1)$ و J منتصف القطعة [KL]. أوجد مركبتي كل من الشعاعين $\\overrightarrow{KJ}$ و $\\overrightarrow{JL}$ . ماذا تستنتج؟'},
        {'label': '2)', 'text': 'نبحث الآن عن إحداثيتي منتصف قطعة مستقيم في الحالة العامة. نعتبر $A(x_A\\,;\\,y_A)$ ، $B(x_B\\,;\\,y_B)$ ، $I(x_I\\,;\\,y_I)$ حيث I منتصف [AB]. أ) اشرح لماذا $\\overrightarrow{AI} = \\overrightarrow{IB}$ . ب) أوجد مركبتي الشعاع $\\overrightarrow{AI}$ بدلالة إحداثيتي كل من النقطتين A و I. جـ) أوجد مركبتي الشعاع $\\overrightarrow{IB}$ بدلالة إحداثيتي كل من النقطتين B و I. عبّر عن $x_I$ بدلالة $x_A$ و $x_B$ ثم عن $y_I$ بدلالة $y_A$ و $y_B$ .'},
        {'label': '3)', 'text': 'انقل وأتمم: «إذا كانت $(x_A\\,;\\,y_A)$ إحداثيتي …… و …… إحداثيتي B فإن إحداثيتي I منتصف القطعة [AB] هما $x_I = \\ldots$ و $y_I = \\ldots$ ».'},
    ],
    'answer': {
        '1': {'J': tex_pt('J', J3), 'KJ': tex_vec('KJ', vec(K3, J3)), 'JL': tex_vec('JL', vec(J3, L3)),
              'conclusion': '$\\overrightarrow{KJ} = \\overrightarrow{JL}$ (نفس المركبتين) — يتوقّع التلميذ أن يقرأ J على الرسم ثم يتحقّق.'},
        '2': {'a': 'I منتصف [AB] (خاصية الوحدة 11)', 'b': '$\\overrightarrow{AI}\\begin{pmatrix} x_I - x_A \\\\ y_I - y_A \\end{pmatrix}$',
              'c': '$\\overrightarrow{IB}\\begin{pmatrix} x_B - x_I \\\\ y_B - y_I \\end{pmatrix}$',
              'solve': '$x_I - x_A = x_B - x_I$ إذن $2x_I = x_A + x_B$ أي $x_I = \\dfrac{x_A + x_B}{2}$ ؛ وبنفس الطريقة $y_I = \\dfrac{y_A + y_B}{2}$'},
        '3': 'A ، $(x_B\\,;\\,y_B)$ ، $x_I = \\dfrac{x_A + x_B}{2}$ و $y_I = \\dfrac{y_A + y_B}{2}$',
    },
    'answerSource': 'computed',
    'note': 'Pas de figure : K, L à placer par l’élève. Le manuel écrit « علّم النقط … و J منتصف » : J est à placer d’abord à vue (milieu sur le dessin), d’où (1 ; 2).',
})

K4, L4, M4 = P(5, 1), P(1, -2), P(5, -2)
assert vec(M4, K4) == (0, 3) and vec(M4, L4) == (-4, 0) and right_at(M4, K4, L4)
assert d2(K4, M4) == 9 and d2(L4, M4) == 16 and d2(K4, L4) == 25
E.append({
    'id': 'act-4', 'kind': 'activity', 'number': 4, 'page': 141, 'section': 'أنشطة', 'title': 'المسافة بين نقطتين', 'verified': True,
    'parts': [
        {'label': 'أ)', 'text': 'المَعلم متعامد ومتجانس (مبدؤه O) 1) اعتمادًا على الشكل المقابل اقرأ إحداثيتي كل من النقط K، L، M. 2) انقل الشكل المقابل ثم أنشئ المثلث KLM. 3) احسب الأطوال KM و LM و KL.',
         'figure': {'description': 'ورقة مرصوفة، معلم مبدؤه O مدرّج 1 ؛ K فوق محور الفواصل على اليمين ؛ M تحت K على نفس العمود ؛ L على يسار M على نفس السطر.',
                    'points': pts(K=K4, L=L4, M=M4), 'grid': {'unit': 1, 'xRange': [-3, 6], 'yRange': [-3, 3]},
                    'reading': 'Lu à ≈ 113 px / unité : K (5 ; 1), L (1 ; −2), M (5 ; −2). KLM rectangle en M (côtés sur le quadrillage 3 et 4).'}},
        {'label': 'ب)', 'text': 'نعتبر A و B نقطتان حيث $A(x_A\\,;\\,y_A)$ و $B(x_B\\,;\\,y_B)$ و C نقطة إحداثياها $(x_C\\,;\\,y_C)$ بحيث ABC مثلث قائم في C. 1) أوجد عبارة AC بدلالة $x_A$ ، $x_B$ ، ثم عبارة BC بدلالة $y_A$ و $y_B$ . 2) استنتج عبارة $AB^2$ بدلالة $x_A$ ، $x_B$ ، $y_A$ ، $y_B$ . 3) انقل وأكمل: «إذا كانت A و B نقطتان إحداثياتهما $(x_A\\,;\\,y_A)$ و $(x_B\\,;\\,y_B)$ على الترتيب، فإن $AB = \\ldots$ ». 4) باستعمال عبارة الطول AB المحصل عليها في السؤال 3) من الجزء ب) أوجد من جديد الأطوال KM، LM ثم KL. قارن هذه النتائج بالنتائج المحصل عليها في الجزء (أ).',
         'figure': {'description': 'معلم مبدؤه O (المحوران بالأحمر) ؛ B أعلى اليسار و A على اليمين أخفض ؛ C عند تقاطع الشاقولي المار بـ B والأفقي المار بـ A (رمز الزاوية القائمة في C) ؛ إسقاطات متقطعة: $x_B$ و $x_A$ على محور الفواصل، $y_A$ و $y_B$ على محور التراتيب ؛ [AB] متقطع.',
                    'symbolic': {'A': ['x_A', 'y_A'], 'B': ['x_B', 'y_B'], 'C': ['x_B', 'y_A']}, 'model': True}},
    ],
    'answer': {
        'a1': {k: tex_pt(k, p) for k, p in (('K', K4), ('L', L4), ('M', M4))},
        'a3': {'KM': 3, 'LM': 4, 'KL': '5 (فيثاغورس في KLM القائم في M: $KL^2 = 3^2 + 4^2 = 25$)'},
        'b1': 'في الشكل $x_A > x_B$ و $y_B > y_A$ : $AC = x_A - x_B$ و $BC = y_B - y_A$ (في الحالة العامة القيمة المطلقة للفرق).',
        'b2': '$AB^2 = (x_B - x_A)^2 + (y_B - y_A)^2$ (فيثاغورس في ABC القائم في C ؛ مربع الفرق لا يتعلق بالترتيب)',
        'b3': '$AB = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$',
        'b4': '$KM = \\sqrt{(5-5)^2 + (-2-1)^2} = 3$ ، $LM = \\sqrt{(5-1)^2 + (-2+2)^2} = 4$ ، $KL = \\sqrt{(1-5)^2 + (-2-1)^2} = \\sqrt{25} = 5$ : نفس النتائج.',
    },
    'answerSource': 'computed',
    'note': 'Le manuel ne donne pas C en coordonnées : la figure le place en $(x_B\\,;\\,y_A)$ ; le texte dit seulement « C … بحيث ABC مثلث قائم في C » (ce qui n’impose pas les côtés parallèles aux axes — implicite de la figure).',
})
DISC.append({'elementId': 'act-4', 'kind': 'inconsistency', 'resolution': 'kept — the figure fixes C = (x_B ; y_A); lessons state it',
             'text': 'Partie ب) : « C نقطة إحداثياها $(x_C\\,;\\,y_C)$ بحيث ABC مثلث قائم في C » ne suffit pas à rendre AC = |x_A − x_B| (il faut [AC] parallèle à l’axe des abscisses) ; c’est la figure qui place C en $(x_B\\,;\\,y_A)$. Les leçons le disent explicitement.'})

# ══ Page 142 — معارف 1–3 ════════════════════════════════════════════════════
kB = P(-3, 4)
assert vec(O, kB) == (-3, 4)
E.append({
    'id': 'know-1', 'kind': 'knowledge', 'number': 1, 'page': 142, 'section': 'معارف', 'title': 'مركبتا شعاع', 'verified': True,
    'property': 'المستوي مُزوّد بمعلم (O ; I , J) مبدؤه النقطة O. إذا كانت M نقطة من المستوي إحداثيتاها $(x\\,;\\,y)$ ، فإنّ مركبتي الشعاع $\\overrightarrow{OM}$ هما x و y نكتب $\\overrightarrow{OM}\\begin{pmatrix} x \\\\ y \\end{pmatrix}$ .',
    'example': 'مثال: إحداثيتا النقطة B هما 3- و 4 نكتب $B(-3\\,;\\,4)$ . مركبتا الشعاع $\\overrightarrow{OB}$ هما 3- و 4 نكتب $\\overrightarrow{OB}\\begin{pmatrix} -3 \\\\ 4 \\end{pmatrix}$ .',
    'figure': {'description': 'ورقة مرصوفة، معلم (O ; I, J) مدرّج 1 ؛ سهمان من O: نحو B أعلى اليسار (إسقاطان متقطعان على -3 و 4) ونحو M أعلى اليمين (إسقاطان متقطعان على x و y).',
               'points': {'O': [0, 0], 'B': [-3, 4], 'M': [4, 3]}, 'symbolic': {'M': ['x', 'y']}, 'model': True,
               'reading': 'M est générique (étiquettes x et y sur les axes) ; (4 ; 3) n’est qu’une position de dessin.'},
})
kA = P(3, 2)
E.append({
    'id': 'know-2', 'kind': 'knowledge', 'number': 2, 'page': 142, 'section': 'معارف', 'title': 'أنواع المعالم', 'verified': True,
    'text': 'النقطة A إحداثياها 3 و 2 نكتب $A(3\\,;\\,2)$ والشعاع $\\overrightarrow{OA}$ مركبتاه 3 و 2 نكتب $\\overrightarrow{OA}\\begin{pmatrix} 3 \\\\ 2 \\end{pmatrix}$',
    'cases': [
        {'name': 'معلم متعامد متجانس', 'conditions': ['OI = OJ', '(OI) ⊥ (OJ)']},
        {'name': 'معلم متعامد', 'conditions': ['OI ≠ OJ', '(OI) ⊥ (OJ)']},
        {'name': 'معلم متجانس', 'conditions': ['OI = OJ', '(OI) ، (OJ) غير متعامدين']},
        {'name': 'معلم كيفي', 'conditions': ['OI ≠ OJ', '(OI) ، (OJ) غير متعامدين']},
    ],
    'figure': {'description': 'أربعة رسوم متجاورة (من اليمين إلى اليسار بنفس ترتيب `cases`) للنقطة A(3 ; 2) والشعاع $\\overrightarrow{OA}$ في كل نوع من المعالم: المحور (OJ) شاقولي في الأوّلين ومائل في الأخيرين ؛ وحدة (OJ) أقصر من وحدة (OI) في المعلم المتعامد والكيفي ؛ الخطوط المتقطعة توازي المحورين.',
               'points': pts(A=kA)},
    'note': 'Seul le repère orthonormé (متعامد ومتجانس) permet la formule de distance (p. 143) ; les composantes et le milieu valent dans tout repère. Le manuel ne le dit pas ici — à faire remarquer dans la leçon 3.',
})
K3P = dict(A=P(-4, 2), B=P(3, 5), C=P(2, -3), D=P(-3, -2))
assert vec(K3P['A'], K3P['B']) == (7, 3) and vec(K3P['C'], K3P['D']) == (-5, 1)
eA3, eB3 = P(F(-5, 2), 4), P(1, -1)
assert vec(eA3, eB3) == (F(7, 2), -5)
E.append({
    'id': 'know-3', 'kind': 'knowledge', 'number': 3, 'page': 142, 'section': 'معارف', 'title': 'مركبتا شعاع علمت إحداثيات مبدئه ونهايته', 'verified': True,
    'intro': 'المستوي مزود بمعلم متعامد ومتجانس (O ; I , J)، مبدؤه O.',
    'blocks': [
        {'label': 'أ) القراءة في تمثيل بياني', 'text': 'لقراءة مركبتي الشعاع $\\overrightarrow{AB}$ ، ننتقل من النقطة A بالتوازي مع المستقيم (OI) في الاتجاه الموجب (نحو اليمين) بـ 7 وحدات ثم ننتقل بالتوازي مع المستقيم (OJ) في الاتجاه الموجب (نحو الأعلى) بـ 3 وحدات للوصول إلى النقطة B. ونقرأ: مركبتي الشعاع $\\overrightarrow{AB}$ هما 7 و 3. ونكتب $\\overrightarrow{AB}\\begin{pmatrix} 7 \\\\ 3 \\end{pmatrix}$ . • لقراءة مركبتي الشعاع $\\overrightarrow{CD}$ ننتقل من النقطة C في الاتجاه السالب (نحو اليسار) بالتوازي مع المستقيم (OI) بـ 5 وحدات ثم ننتقل في الاتجاه الموجب (نحو الأعلى) بالتوازي مع المستقيم (OJ) بوحدة واحدة للوصول إلى النقطة D. ونقرأ: مركبتا الشعاع $\\overrightarrow{CD}$ هما 5- و 1. ونكتب عندئذ $\\overrightarrow{CD}\\begin{pmatrix} -5 \\\\ 1 \\end{pmatrix}$ .',
         'figure': {'description': 'ورقة مرصوفة، معلم (O ; I, J) مدرّج 1 ؛ $\\overrightarrow{AB}$ صاعد نحو اليمين مع مسار متقطع: سهم أفقي «+7» ثم شاقولي «+3» ؛ $\\overrightarrow{CD}$ تحت محور الفواصل صاعد قليلا نحو اليسار مع مسار متقطع: «-5» أفقيا ثم «+1» شاقوليا.',
                    'points': pts(**K3P), 'grid': {'unit': 1, 'xRange': [-5, 4], 'yRange': [-4, 6]},
                    'reading': 'Relu agrandi (≈ 125 px / unité à 600 dpi équivalent) : A (−4 ; 2), B (3 ; 5) sur des nœuds ; C (2 ; −3), D (−3 ; −2). Les flèches +7/+3 et −5/+1 sont exactement les composantes (assert).'}},
        {'label': 'ب) حساب مركبتي شعاع', 'property': 'خاصية: إذا كانت A و B نقطتان، إحداثياهما $(x_A\\,;\\,y_A)$ و $(x_B\\,;\\,y_B)$ على الترتيب في مَعلم فإن مركبتي الشعاع $\\overrightarrow{AB}$ هما $x_B - x_A$ و $y_B - y_A$ .',
         'example': 'مثال: نعتبر النقطتين $A(-2{,}5\\,;\\,4)$ و $B(1\\,;\\,-1)$ من المستوي المزوّد بمعلم متعامد ومتجانس مبدؤه O. لدينا $x_B - x_A = 1 - (-2{,}5) = 3{,}5$ و $y_B - y_A = -1 - 4 = -5$ . إذن مركبتا الشعاع $\\overrightarrow{AB}$ هما 3,5 و 5-. نكتب $\\overrightarrow{AB}\\begin{pmatrix} 3{,}5 \\\\ -5 \\end{pmatrix}$ .'},
    ],
    'note': 'La propriété vaut « في مَعلم » quelconque (pas besoin d’orthonormé) — contrairement à la distance.',
})

# ══ Page 143 — طرائق 1–2, دوري الآن ═════════════════════════════════════════
U1 = (F(3), F(-4))
mA = P(-2, 1); mA1 = tr(mA, (F(3), F(0))); mB = tr(mA1, (F(0), F(-4)))
assert mA1 == P(1, 1) and mB == P(1, -3) and vec(mA, mB) == U1
mE = P(1, 8); mF = tr(mE, U1)
assert mF == P(4, 4) and vec(mE, mF) == vec(mA, mB) and para(mE, mA, mB, mF)          # EABF parallélogramme (EA = FB)
E.append({
    'id': 'method-draw', 'kind': 'method', 'page': 143, 'section': 'طرائق', 'title': 'تمثيل شعاع علمت مركبتاه', 'verified': True,
    'exercise': 'تمرين: المستوي مزود بمعلم متعامد ومتجانس، مبدؤه النقطة O. الوحدة هي طول ضلع مربّع من المرصوفة. 1) أنشئ الشعاع $\\overrightarrow{AB}$ حيث $\\overrightarrow{AB} = \\vec{u}$ و $\\vec{u}\\begin{pmatrix} 3 \\\\ -4 \\end{pmatrix}$ . 2) أنشئ ممثلا آخر $\\overrightarrow{EF}$ للشعاع $\\vec{u}$ .',
    'solution': ['حل: 1) إنشاء الشعاع $\\overrightarrow{AB}$ حيث $\\overrightarrow{AB} = \\vec{u}$ .',
                 'للحصول على ممثل أوّل، نختار نقطة A إحداثياها مثلا $(-2\\,;\\,1)$ نحوّل A بانسحاب مُوازٍ لمحور الفواصل بـ 3 وحدات إلى اليمين (في الاتجاه الموجب) فنتحصل على النقطة $A_1$ .',
                 'نحوّل النقطة $A_1$ بانسحاب، مُوازٍ لمحور التراتيب بـ 4 وحدات إلى الأسفل (في الاتجاه السالب) فنتحصل على النقطة B.',
                 'ننشئ الشعاع $\\overrightarrow{AB}$ . وهكذا نتحصل على ممثّل للشعاع $\\vec{u}$ .',
                 '2) إنشاء الشعاع $\\overrightarrow{EF}$ حيث $\\overrightarrow{EF} = \\overrightarrow{AB}$ . نختار النقطة E ونعيّن النقطة F حيث $\\overrightarrow{EF} = \\overrightarrow{AB}$ . يعني الرباعي EABF متوازي أضلاع. لإنشاء F يكفي إنشاء المتوازي الأضلاع EABF.'],
    'rule': 'طريقة: لتمثيل شعاع عُلمت مركبتاه $\\begin{pmatrix} a \\\\ b \\end{pmatrix}$ ، نختار نقطة كمبدإ لهذا الممثل ثم نحولها بالانسحاب الذي شعاعه $\\vec{u}\\begin{pmatrix} a \\\\ 0 \\end{pmatrix}$ فنحصل على نقطة نحولها بدورها بالانسحاب الذي شعاعه $\\vec{v}\\begin{pmatrix} 0 \\\\ b \\end{pmatrix}$ للحصول على نهاية الشعاع المعطى.',
    'figure': {'description': 'معلم مدرّج 1 (المحاور فقط، بدون مرصوفة مرئية في الحل) ؛ A على يسار محور التراتيب، $A_1$ على يمينه على نفس الارتفاع (مسار متقطع)، B تحت $A_1$ ؛ السهم $\\overrightarrow{AB}$ (برتقالي) ؛ في الأعلى $\\overrightarrow{EF}$ مواز له.',
               'points': pts(A=mA, A1=mA1, B=mB, E=mE, F=mF), 'model': True,
               'reading': 'A, A₁, B sont donnés par le texte. E est « choisi » : (1 ; 8) et F (4 ; 4) sont lus à ≈ 47 px / unité sur le dessin (E juste à droite de l’axe des ordonnées, en haut).'},
    'note': '« EABF » : $\\overrightarrow{EF} = \\overrightarrow{AB}$ ⇔ ABFE parallélogramme, que le manuel parcourt depuis E (E, A, B, F). La « طريقة » réutilise la lettre $\\vec{u}$ pour $\\begin{pmatrix} a \\\\ 0 \\end{pmatrix}$ alors que $\\vec{u}$ désigne $\\begin{pmatrix} 3 \\\\ -4 \\end{pmatrix}$ dans l’exercice : la leçon peut écrire $\\vec{u}_1$ , $\\vec{u}_2$ .',
})
DISC.append({'elementId': 'method-draw', 'kind': 'inconsistency', 'resolution': 'kept — lessons may rename the two steps (a ; 0) and (0 ; b)',
             'text': 'Dans la « طريقة », $\\vec{u}\\begin{pmatrix} a \\\\ 0 \\end{pmatrix}$ réemploie le nom $\\vec{u}$ de l’exercice ($\\vec{u}\\begin{pmatrix} 3 \\\\ -4 \\end{pmatrix}$) pour le premier pas horizontal ; ambigu mais pas faux.'})

mmA, mmB, mmC, mmD = P(1, 0), P(0, 3), P(-3, 0), P(-2, -3)
assert vec(mmA, mmB) == vec(mmD, mmC) == (-1, 3) and para(mmA, mmB, mmC, mmD)
E.append({
    'id': 'method-equal', 'kind': 'method', 'page': 143, 'section': 'طرائق', 'title': 'حساب مركبتا شعاع، علمت إحداثيات مبدئه ونهايته', 'verified': True,
    'exercise': 'تمرين: المستوي مزود بمَعلم متعامد ومتجانس، مبدؤه النقطة O. $A(1\\,;\\,0)$ ، $B(0\\,;\\,3)$ ، $C(-3\\,;\\,0)$ ، $D(-2\\,;\\,-3)$ نقط من المستوى. 1) علّم النقط A، B، C، D. 2) احسب مركبتي كل من الشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{DC}$ . ماذا تلاحظ؟',
    'solution': ['حل: 1) تعليم النقط A، B، C، D (الشكل)',
                 '2) حساب مركبتي كل من الشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{DC}$ .',
                 'لدينا $x_B - x_A = 0 - 1 = -1$ و $y_B - y_A = 3 - 0 = 3$ . إذن $\\overrightarrow{AB}\\begin{pmatrix} -1 \\\\ 3 \\end{pmatrix}$ .',
                 '$x_C - x_D = -3 + 2 = -1$ و $y_C - y_D = 0 + 3 = 3$ . إذن $\\overrightarrow{DC}\\begin{pmatrix} -1 \\\\ 3 \\end{pmatrix}$ .',
                 'الملاحظة: للشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{DC}$ نفس المركبتين $\\overrightarrow{AB} = \\overrightarrow{CD}$ .'],
    'rule': 'طريقة: للتحقق من تساوي شعاعين، يمكن التحقّق من تساوي مركبتي أحدهما مع مركبتي الآخر.',
    'figure': {'description': 'معلم (O ; I, J) مدرّج 1 ؛ A على محور الفواصل (منطبقة على I)، B على محور التراتيب، C على الجزء السالب من محور الفواصل، D أسفل اليسار ؛ [AB] و [DC] بالأحمر، [BC] و [AD] بالأصفر: متوازي أضلاع ABCD.',
               'points': pts(A=mmA, B=mmB, C=mmC, D=mmD), 'grid': {'unit': 1, 'xRange': [-4, 2], 'yRange': [-4, 4]}},
    'correction': {'decidedBy': 'platform', 'decidedOn': '2026-10-04', 'printed': '$\\overrightarrow{AB} = \\overrightarrow{CD}$', 'corrected': '$\\overrightarrow{AB} = \\overrightarrow{DC}$'},
    'answer': {'AB=DC': True, 'ABCD': 'متوازي أضلاع (غير مسطّح)'},
    'answerSource': 'computed',
})
DISC.append({'elementId': 'method-equal', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
             'text': 'Conclusion imprimée « $\\overrightarrow{AB} = \\overrightarrow{CD}$ » juste après avoir montré que AB et DC ont les mêmes composantes ; $\\overrightarrow{CD}\\begin{pmatrix} 1 \\\\ -3 \\end{pmatrix}$ est l’OPPOSÉ. Correction : $\\overrightarrow{AB} = \\overrightarrow{DC}$ (assert).'})

nA, nB, nC, nD = P(2, 3), P(-4, 5), P(1, 0), P(-1, 1)
assert vec(nA, nB) == (-6, 2) and vec(nB, nC) == (5, -5) and vec(nD, nA) == (3, 2)
E.append({
    'id': 'now-143', 'kind': 'now', 'page': 143, 'section': 'دوري الآن', 'verified': True,
    'items': [
        {'number': 1, 'text': 'المستوي مزود بمَعلم متعامد ومتجانس، مبدؤه النقطة O. أنشئ ممثلا لكل شعاع من الشعاعين $\\vec{u}\\begin{pmatrix} 2 \\\\ 4 \\end{pmatrix}$ و $\\vec{v}\\begin{pmatrix} -3 \\\\ 2 \\end{pmatrix}$ .',
         'answer': {'u': 'مثلا من O إلى (2 ; 4): وحدتان يمينا ثم 4 إلى الأعلى', 'v': 'مثلا من O إلى (−3 ; 2): 3 وحدات يسارا ثم وحدتان إلى الأعلى'}},
        {'number': 2, 'text': 'المستوي مزود بمَعلم متعامد ومتجانس، مبدؤه النقطة O. نعتبر النقط $A(2\\,;\\,3)$ ، $B(-4\\,;\\,5)$ ، $C(1\\,;\\,0)$ ، $D(-1\\,;\\,1)$ . عيّن مركبتي كل شعاع مما يلي: $\\overrightarrow{AB}$ ؛ $\\overrightarrow{BC}$ ؛ $\\overrightarrow{DA}$ .',
         'answer': {'AB': tex_vec('AB', vec(nA, nB)), 'BC': tex_vec('BC', vec(nB, nC)), 'DA': tex_vec('DA', vec(nD, nA))}},
    ],
    'answerSource': 'computed',
})

# ══ Page 144 — معارف 3 (suite) : نتيجة, جـ) تساوي, د) منتصف, هـ) مسافة ══════════
oA = P(-3, F(5, 2))
assert vec(O, oA) == (-3, F(5, 2))
E.append({
    'id': 'know-origin', 'kind': 'knowledge', 'number': 3, 'page': 144, 'section': 'معارف', 'title': 'نتيجة (مركبتا الشعاع OM)', 'verified': True,
    'property': 'نتيجة: في مستوٍ منسوب إلى مَعلم مبدؤه O، إذا كانت M نقطة إحداثيتاها $(x\\,;\\,y)$ فإنّ مركبتي الشعاع $\\overrightarrow{OM}$ هما x و y. نكتب $\\overrightarrow{OM}\\begin{pmatrix} x \\\\ y \\end{pmatrix}$ .',
    'remark': 'ملاحظة: لتعيين ممثلا للشعاع $\\overrightarrow{OM}$ يكفي تعليم النقطة M.',
    'example': 'مثال: إحداثيتا النقطة A هما $(-3\\,;\\,2{,}5)$ . إذن مركبتا الشعاع $\\overrightarrow{OA}$ هما $\\begin{pmatrix} -3 \\\\ 2{,}5 \\end{pmatrix}$ . نكتب $\\overrightarrow{OA}\\begin{pmatrix} -3 \\\\ 2{,}5 \\end{pmatrix}$ .',
    'note': 'Suite (p. 144) du bloc 3 des معارف ; le manuel ne numérote pas ces sous-blocs (نتيجة, جـ), د), هـ)).',
})
DISC.append({'elementId': 'know-origin', 'kind': 'reading', 'resolution': 'decided — A(−3 ; 2,5) (bidi reversal in print)',
             'text': 'Les coordonnées de A s’impriment « (2,5 ; -3-) » : le couple a été retourné par la mise en page RTL (le signe moins se retrouve à droite). Les composantes imprimées juste dessous, $\\begin{pmatrix} -3 \\\\ 2{,}5 \\end{pmatrix}$ , fixent A(−3 ; 2,5). Rappel de la règle de la plateforme : tout couple dans `$…$`.'})

qA, qB, qC, qD = P(-4, -1), P(3, -1), P(-3, 2), P(4, 2)
assert vec(qA, qB) == vec(qC, qD) == (7, 0)
E.append({
    'id': 'know-equal', 'kind': 'knowledge', 'number': 3, 'page': 144, 'section': 'معارف', 'title': 'جـ) الشعاعان المتساويان', 'verified': True,
    'property': 'خاصية: $\\overrightarrow{AB}$ و $\\overrightarrow{CD}$ شعاعان، مركبتاهما $\\begin{pmatrix} x \\\\ y \\end{pmatrix}$ و $\\begin{pmatrix} x\' \\\\ y\' \\end{pmatrix}$ على الترتيب. نقول عن الشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{CD}$ إنّهما متساويان إذا كان $x = x\'$ و $y = y\'$ أي: $\\overrightarrow{AB} = \\overrightarrow{CD}$ معناه $x = x\'$ و $y = y\'$ .',
    'examples': [
        'مثال: نقول إنّ الشعاعين $\\overrightarrow{DE}$ و $\\overrightarrow{CF}$ متساويان. نكتب $\\overrightarrow{DE} = \\overrightarrow{CF}$ .',
        'مثال: A، B، C، D نقط إحداثياتها $(-4\\,;\\,-1)$ ، $(3\\,;\\,-1)$ ، $(-3\\,;\\,2)$ و $(4\\,;\\,2)$ على الترتيب. لدينا $x_B - x_A = 3 + 4 = 7$ و $y_B - y_A = -1 - (-1) = 0$ إذن $\\overrightarrow{AB}\\begin{pmatrix} 7 \\\\ 0 \\end{pmatrix}$ . ولدينا $x_D - x_C = 4 - (-3) = 7$ و $y_D - y_C = 2 - 2 = 0$ إذن $\\overrightarrow{CD}\\begin{pmatrix} 7 \\\\ 0 \\end{pmatrix}$ . الشعاعان $\\overrightarrow{AB}$ و $\\overrightarrow{CD}$ لهما نفس المركبتين. إذن $\\overrightarrow{AB} = \\overrightarrow{CD}$ .',
    ],
    'note': 'Le 1er exemple renvoie au نشاط 2 (D, E, C, F de la p. 140) sans le dire. Dans le 2e, ABDC est un parallélogramme (AB = CD ⇔ ABDC).',
})

iA, iB = P(3, -4), P(-4, 3)
assert mid(iA, iB) == P(F(-1, 2), F(-1, 2))
E.append({
    'id': 'know-mid', 'kind': 'knowledge', 'number': 3, 'page': 144, 'section': 'معارف', 'title': 'د) إحداثيتا منتصف قطعة مستقيم', 'verified': True,
    'property': 'خاصية: $A(x_A\\,;\\,y_A)$ و $B(x_B\\,;\\,y_B)$ نقطتان من المستوي. و I منتصف القطعة [AB]. إذا كانت $(x_I\\,;\\,y_I)$ إحداثيتا I فإن $x_I = \\dfrac{x_A + x_B}{2}$ و $y_I = \\dfrac{y_A + y_B}{2}$ .',
    'example': 'مثال: $A(3\\,;\\,-4)$ ، $B(-4\\,;\\,3)$ نقطتان من المستوي. I منتصف القطعة [AB]. لدينا $(x_I\\,;\\,y_I)$ إحداثيتا النقطة I : $x_I = \\dfrac{3 + (-4)}{2} = -\\dfrac{1}{2}$ و $y_I = \\dfrac{-4 + 3}{2} = -\\dfrac{1}{2}$ . إذن إحداثيتا I هما $\\left(-\\dfrac{1}{2}\\,;\\,-\\dfrac{1}{2}\\right)$ أي $I\\left(-\\dfrac{1}{2}\\,;\\,-\\dfrac{1}{2}\\right)$ .',
})

dA, dB = P(2, 5), P(-1, 1)
assert d2(dA, dB) == 25
E.append({
    'id': 'know-dist', 'kind': 'knowledge', 'number': 3, 'page': 144, 'section': 'معارف', 'title': 'هـ) المسافة بين نقطتين', 'verified': True,
    'intro': 'المستوي مزود بمعلم متعامد ومتجانس، مبدؤه النقطة O.',
    'property': 'خاصية: إذا كانت $A(x_A\\,;\\,y_A)$ و $B(x_B\\,;\\,y_B)$ فإن المسافة بين النقطتين A و B هي $AB = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$ .',
    'example': 'مثال: $A(2\\,;\\,5)$ ، $B(-1\\,;\\,1)$ نقطتان من مستوٍ مزود بمعلم متعامد ومتجانس. (الوحدة 1cm) لدينا $x_B - x_A = -1 - 2 = -3$ و $y_B - y_A = 1 - 5 = -4$ إذن $(x_B - x_A)^2 + (y_B - y_A)^2 = (-3)^2 + (-4)^2$ أي $(x_B - x_A)^2 + (y_B - y_A)^2 = 9 + 16 = 25$ . ينتج أن $AB = \\sqrt{25}$ أي AB = 5cm .',
    'answer': {'AB': dist(dA, dB)}, 'answerSource': 'computed',
})

# ══ Page 145 — طرائق 3–4, دوري الآن ═════════════════════════════════════════
rA, rB, rC = P(6, -1), P(2, 3), P(2, -5)
assert vec(rA, rB) == (-4, 4) and vec(rA, rC) == (-4, -4) and vec(rB, rC) == (0, -8)
assert d2(rA, rB) == d2(rA, rC) == 32 and d2(rB, rC) == 64 and right_at(rA, rB, rC)
assert surd(32) == '4\\sqrt{2}'
E.append({
    'id': 'method-proof', 'kind': 'method', 'page': 145, 'section': 'طرائق', 'title': 'إنجاز برهان', 'verified': True,
    'exercise': 'تمرين: المستوي مزود بمعلم متعامد ومتجانس، مبدؤه O. $A(6\\,;\\,-1)$ ، $B(2\\,;\\,3)$ ، $C(2\\,;\\,-5)$ نقط من المستوي. 1) علّم النقط A، B، C. 2) برهن أن المثلث ABC قائم في A ومتساوي الساقين.',
    'solution': ['حل: 1) تعليم النقط A، B، C (الشكل)',
                 '2) لإثبات أن المثلث ABC قائم في A ومتساوي الساقين نحتاج إلى حساب الأطوال AB ، AC ، BC.',
                 'لدينا $x_B - x_A = 2 - 6 = -4$ و $y_B - y_A = 3 + 1 = 4$ . إذن $\\overrightarrow{AB}\\begin{pmatrix} -4 \\\\ 4 \\end{pmatrix}$ .',
                 'لدينا $x_C - x_A = 2 - 6 = -4$ و $y_C - y_A = -5 + 1 = -4$ . إذن $\\overrightarrow{AC}\\begin{pmatrix} -4 \\\\ -4 \\end{pmatrix}$ .',
                 'لدينا $x_C - x_B = 2 - 2 = 0$ و $y_C - y_B = -5 - 3 = -8$ إذن $\\overrightarrow{BC}\\begin{pmatrix} 0 \\\\ -8 \\end{pmatrix}$ .',
                 'إذن $AB = \\sqrt{(-4)^2 + (4)^2} = \\sqrt{32}$ ، و $AC = \\sqrt{(-4)^2 + (-4)^2} = \\sqrt{32}$ أي $AC = \\sqrt{32}$ ، و $BC = \\sqrt{(-8)^2 + (0)^2} = \\sqrt{64} = 8$ أي BC = 8 .',
                 'لدينا $AB^2 + AC^2 = (\\sqrt{32})^2 + (\\sqrt{32})^2 = 64$ و $BC^2 = 64$ . بالتالي $AB^2 + AC^2 = BC^2$ .',
                 'ينتج حسب الخاصية العكسية لخاصية فيثاغورث أن المثلث ABC قائم في A وحيث أن AB = AC فإن ABC قائم ومتساوي الساقين.'],
    'figure': {'description': 'ورقة مرصوفة، معلم مدرّج 1 ؛ B فوق و C تحت على نفس الشاقولي x = 2 (خط متقطع)، A على اليمين تحت محور الفواصل ؛ إسقاطات متقطعة على 3، -1، -5 و 2، 6 ؛ [AB] بالأحمر، [AC] بالوردي.',
               'points': pts(A=rA, B=rB, C=rC), 'grid': {'unit': 1, 'xRange': [-1, 7], 'yRange': [-6, 4]}},
    'answer': {'AB': dist(rA, rB), 'AC': dist(rA, rC), 'BC': dist(rB, rC), 'nature': 'قائم في A ومتساوي الساقين ($\\sqrt{32} = 4\\sqrt{2}$)'},
    'answerSource': 'computed',
    'note': 'Le manuel garde $\\sqrt{32}$ sans simplifier ; la plateforme peut ajouter $\\sqrt{32} = 4\\sqrt{2}$ (unité 2). Dans BC il écrit $(-8)^2 + (0)^2$ (composantes interverties) : sans effet sur la somme des carrés.',
})

sA, sB = P(0, 2), P(-4, 0)
def C_of(y):
    return P(-2, y)
SOL = [y for y in range(-20, 21) if right_at(sB, sA, C_of(y))]
assert SOL == [-4]
sC = C_of(-4)
assert d2(sA, sB) == 20 and d2(sB, sC) == 20 and d2(sA, sC) == 40 and dot(vec(sB, sA), vec(sB, sC)) == 0
E.append({
    'id': 'method-unknown', 'kind': 'method', 'page': 145, 'section': 'طرائق', 'title': 'حساب مسافات', 'verified': True,
    'exercise': 'تمرين: المستوي مزود بمعلم متعامد ومتجانس، مبدؤه O. (الوحدة 1cm) $A(0\\,;\\,2)$ ، $B(-4\\,;\\,0)$ ، $C(-2\\,;\\,y)$ ثلاث نقط. عيّن y حتى يكون المستقيمان (AB) و (BC) متعامدين.',
    'solution': ['حل: يكون المستقيمان (AB) و (BC) متعامدين إذا كان المثلث ABC قائم في B. إذن يكفي تعيين y بحيث يكون ABC قائم في B.',
                 'أي نعيّن y بحيث يكون $AB^2 + BC^2 = AC^2$ .',
                 'لدينا $\\overrightarrow{AB}\\begin{pmatrix} -4 \\\\ -2 \\end{pmatrix}$ ، $\\overrightarrow{AC}\\begin{pmatrix} -2 \\\\ y - 2 \\end{pmatrix}$ ، $\\overrightarrow{BC}\\begin{pmatrix} 2 \\\\ y \\end{pmatrix}$ .',
                 'إذن $AB^2 = 20$ ، $AC^2 = 4 + (y - 2)^2$ ، $BC^2 = 4 + y^2$ .',
                 'بما أنّ $AB^2 + BC^2 = AC^2$ وبالتعويض نجد: $20 + 4 + y^2 = 4 + (y - 2)^2$ . ومنه ينتج $y = -4$ .'],
    'figure': {'description': 'ورقة مرصوفة، معلم مدرّج 1 ؛ المستقيم (AB) صاعد نحو اليمين يمر بـ B على محور الفواصل (-4) وبـ A على محور التراتيب ؛ مستقيم عمودي عليه في B (رمز الزاوية القائمة) نازل نحو اليمين، وسهم إلى الإطار «تقع C على هذا المستقيم».',
               'points': pts(A=sA, B=sB, C=sC), 'grid': {'unit': 1, 'xRange': [-6, 4], 'yRange': [-6, 4]}, 'reading': 'C n’est pas étiquetée sur la figure (seulement la droite qui la porte) ; C(−2 ; −4) est la solution calculée.'},
    'answer': {'expand': '$24 + y^2 = 4 + y^2 - 4y + 4$ ⇔ $4y = -16$ ⇔ $y = -4$', 'C': tex_pt('C', sC), 'check': '$AB^2 + BC^2 = 20 + 20 = 40 = AC^2$ (ABC قائم ومتساوي الساقين في B)'},
    'answerSource': 'computed',
    'note': 'Équation du 1er degré après simplification des $y^2$ (unité 4) ; le manuel saute le développement. Le titre « حساب مسافات » cache une recherche d’inconnue.',
})

wA, wB, wC, wD = P(2, 2), P(2, -2), P(-2, -2), P(-2, 2)
sides = [d2(wA, wB), d2(wB, wC), d2(wC, wD), d2(wD, wA)]
assert len(set(sides)) == 1 and d2(wA, wC) == d2(wB, wD) and para(wA, wB, wC, wD) and right_at(wB, wA, wC)
zA, zB = P(-2, 0), P(0, -2)
zI = mid(zA, zB)
assert zI == P(-1, -1) and d2(zI, O) == d2(zI, zA) == 2
E.append({
    'id': 'now-145', 'kind': 'now', 'page': 145, 'section': 'دوري الآن', 'verified': True,
    'items': [
        {'number': 1, 'text': '$A(2\\,;\\,2)$ ، $B(2\\,;\\,-2)$ ، $C(-2\\,;\\,-2)$ ، $D(-2\\,;\\,2)$ نقط من المستوي المزوّد بمعلم متعامد ومتجانس. برهن أن الرباعي ABCD مربع.',
         'answer': {'AB=DC': tex_vec('AB', vec(wA, wB)) + ' = ' + tex_vec('DC', vec(wD, wC)) + ' : متوازي أضلاع',
                    'sides': 'AB = BC = 4 : معين', 'diagonals': 'AC = BD = $\\sqrt{32} = 4\\sqrt{2}$ : مستطيل (أو $AB^2 + BC^2 = 32 = AC^2$ : قائم في B)', 'conclusion': 'ABCD مربع'}},
        {'number': 2, 'text': '$A(-2\\,;\\,0)$ ، $B(0\\,;\\,-2)$ نقطتان في معلم متعامد ومتجانس، مبدؤه النقطة O. • عيّن إحداثيتي I مركز الدائرة التي قطرها [AB]. • برهن أنّ النقطة O تنتمي إلى هذه الدائرة.',
         'answer': {'I': tex_pt('I', zI), 'radius': 'IA = $\\sqrt{2}$', 'OI': 'OI = $\\sqrt{(-1)^2 + (-1)^2} = \\sqrt{2}$ = IA : O تنتمي إلى الدائرة (أو: المثلث AOB قائم في O).'}},
    ],
    'answerSource': 'computed',
})

# ══ Page 146 — أوظّف تعلّماتي 1–8 ═══════════════════════════════════════════
def ex(n, page, section, text, answer, figure=None, **kw):
    e = {'id': f'ex-{n}', 'kind': 'exercise', 'number': n, 'page': page, 'section': section, 'verified': True, 'text': text}
    if figure:
        e['figure'] = figure
    e['answer'] = answer
    e['answerSource'] = 'computed'
    e.update(kw)
    E.append(e)


class R3:
    """a + b√3 exact (a, b rationnels) — pour l'exercice 6, 4)."""
    def __init__(self, a, b=0):
        self.a, self.b = F(a), F(b)

    def __sub__(self, o):
        return R3(self.a - o.a, self.b - o.b)

    def __eq__(self, o):
        return self.a == o.a and self.b == o.b

    def tex(self):
        def t(x):
            return str(x.numerator) if x.denominator == 1 else f'\\dfrac{{{x.numerator}}}{{{x.denominator}}}'
        parts = []
        if self.a:
            parts.append(t(self.a))
        if self.b:
            k = abs(self.b)
            s = '\\sqrt{3}' if k == 1 else (f'{k.numerator}\\sqrt{{3}}' if k.denominator == 1 else f'\\dfrac{{{k.numerator}\\sqrt{{3}}}}{{{k.denominator}}}')
            parts.append(('- ' if self.b < 0 else ('+ ' if parts else '')) + s)
        return ' '.join(parts) if parts else '0'


S_1 = 'إحداثيتا نقطة - مركبتا شعاع'
S_2 = 'مركبتا شعاع علمت إحداثيات مبدئه ونهايته'

x1 = dict(A=P(-1, 2), B=P(3, -3), C=P(F(1, 2), 1), D=P(F(-5, 2), 0))
ex(1, 146, S_1, '1) ارسم معلما متعامدا ومتجانسا في المستوي، مبدؤه O. علّم النقطتين $I(1\\,;\\,0)$ و $J(0\\,;\\,1)$ . 2) علّم النقط $A(-1\\,;\\,2)$ ، $B(3\\,;\\,-3)$ ، $C\\left(\\dfrac{1}{2}\\,;\\,1\\right)$ ، $D(-2{,}5\\,;\\,0)$ . 3) أنشئ الرباعي ABCD.',
   {'placement': {'A': 'الربع الثاني', 'B': 'الربع الرابع', 'C': 'الربع الأول (نصف وحدة يمين محور التراتيب)', 'D': 'على محور الفواصل (السالب)'},
    'ABCD': 'رباعي كيفي (لا أضلاع متوازية): ' + tex_vec('AB', vec(x1['A'], x1['B'])) + ' و ' + tex_vec('DC', vec(x1['D'], x1['C']))},
   figure={'points': pts(**x1), 'model': False, 'description': 'لا شكل في الكتاب — النقط تُعلّم من الإحداثيات.'})
assert cross(vec(x1['A'], x1['B']), vec(x1['D'], x1['C'])) != 0 and cross(vec(x1['B'], x1['C']), vec(x1['A'], x1['D'])) != 0

x2 = dict(A=P(3, 3), B=P(-3, 3), C=P(0, 2), D=P(7, -2), E=P(-2, -2), F=P(0, -2))
ex(2, 146, S_1, 'المستوي مزوّد بمعلم متعامد ومتجانس، مبدؤه النقطة O. (الوحدة 1cm) A، B، C، D، E، F نقط من المستوي (الشكل) 1) بقراءة بيانية، عيّن كل من النقط A، B، C، D، E و F. 2) أوجد مركبتي كل من الأشعة: $\\overrightarrow{OA}$ ، $\\overrightarrow{OB}$ ، $\\overrightarrow{OC}$ ، $\\overrightarrow{OD}$ ، $\\overrightarrow{OE}$ ، $\\overrightarrow{OF}$ .',
   {'1': {k: tex_pt(k, p) for k, p in x2.items()}, '2': {k: tex_vec('O' + k, vec(O, p)) for k, p in x2.items()},
    'rule': 'مركبتا $\\overrightarrow{OM}$ هما إحداثيتا M.'},
   figure={'description': 'معلم مدرّج (علامات كل وحدة على محور الفواصل، 1 على المحورين) وخطوط شاقولية متقطعة باهتة ؛ B أعلى اليسار و A أعلى اليمين على نفس الارتفاع ؛ C و F على محور التراتيب (فوق و تحت) ؛ E أسفل اليسار ؛ D بعيدة أسفل اليمين.',
           'points': pts(**x2), 'grid': {'unit': 1, 'unitLength': '1cm', 'xRange': [-4, 7], 'yRange': [-3, 4]},
           'reading': 'Scan très pâle, relu sur un recadrage contrasté ×2 (≈ 88 px / unité) : A (3 ; 3), B (−3 ; 3), C (0 ; 2), D (7 ; −2), E (−2 ; −2), F (0 ; −2). D est hors des graduations (au-delà de la flèche de l’axe, x ≈ 7,0).'})
DISC.append({'elementId': 'ex-2', 'kind': 'reading', 'resolution': 'decided — D(7 ; −2), the platform may redraw with longer axes',
             'text': 'Figure presque effacée. Les six points se lisent sur des nœuds entiers ; D (lettre seule, point à peine visible) est mesuré à x ≈ 7,0 et y ≈ −2,1, c’est-à-dire AU-DELÀ de la dernière graduation (6) et de la pointe de l’axe. Gardé tel quel (7 ; −2) ; la plateforme prolonge l’axe.'})

x3 = dict(A=P(1, 3), B=P(-2, -3))
x3['C'] = sym(x3['A'], O)
x3['D'] = P(-x3['B'][0], x3['B'][1])
x3['E'] = P(x3['D'][0], -x3['D'][1])
x3['F'] = tr(x3['B'], (F(-1), F(0)))
assert vec(x3['F'], x3['B']) == (1, 0) and x3['C'] == P(-1, -3) and x3['D'] == P(2, -3) and x3['E'] == P(2, 3) and x3['F'] == P(-3, -3)
ex(3, 146, S_1, 'المستوي مُزوّد بمعلم متعامد ومتجانس مبدؤه النقطة O. (الوحدة 1cm). 1) A و B نقطتان حيث $A(1\\,;\\,3)$ و $B(-2\\,;\\,-3)$ علّم النقطتين A و B. 2) عيّن النقط C، D، E، F بحيث: • C نظير A بالنسبة لـ O. • D نظير B بالنسبة لمحور التراتيب. • E نظير D بالنسبة لمحور الفواصل. • $\\overrightarrow{FB}\\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}$ .',
   {k: tex_pt(k, x3[k]) for k in 'CDEF'} | {'rules': 'نظير (x ; y): بالنسبة لـ O هو (−x ; −y)، لمحور التراتيب (−x ; y)، لمحور الفواصل (x ; −y) ؛ $\\overrightarrow{FB}\\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}$ ⇔ $x_B - x_F = 1$ و $y_B - y_F = 0$ .'})

u4 = (F(-2), F(3))
pairs4 = [(P(0, 0), P(-2, 3)), (P(3, -1), P(1, 2))]
assert all(vec(a, b) == u4 for a, b in pairs4)
ex(4, 146, S_1, '$\\vec{u}$ شعاع حيث $\\vec{u}\\begin{pmatrix} -2 \\\\ 3 \\end{pmatrix}$ . مثّل في معلم لمستوٍ، ثنائيتين نقطيتين تُمثّل كل منهما الشعاع $\\vec{u}$ .',
   {'example': 'مثلا (O ; U) مع U(−2 ; 3) و (E ; F) مع E(3 ; −1) و F(1 ; 2)', 'rule': 'نختار مبدأ كيفيا ثم وحدتان نحو اليسار و 3 نحو الأعلى.', 'pairs': [[pts(X=a)['X'], pts(X=b)['X']] for a, b in pairs4]},
   note='Réponse ouverte (toute paire avec x_B − x_A = −2 et y_B − y_A = 3).')

x5 = dict(A=P(-2, 4), B=P(-1, -2), C=P(6, -2))
x5['I'] = tr(x5['A'], vec(x5['B'], x5['C']))
assert vec(x5['A'], x5['B']) == (1, -6) and x5['I'] == P(5, 4) and para(x5['A'], x5['I'], x5['C'], x5['B'])
assert dot(vec(x5['A'], x5['I']), vec(x5['A'], x5['B'])) != 0 and d2(x5['A'], x5['I']) != d2(x5['A'], x5['B'])
ex(5, 146, S_1, 'لاحظ الشكل الآتي: 1) بقراءة بيانيّة عيّن مركبتي الشعاع $\\overrightarrow{AB}$ . 2) عيّن النقطة I حيث $\\overrightarrow{AI} = \\overrightarrow{BC}$ . 3) ما هي طبيعة الرباعي AICB؟',
   {'1': tex_vec('AB', vec(x5['A'], x5['B'])), '2': tex_vec('BC', vec(x5['B'], x5['C'])) + ' إذن ' + tex_pt('I', x5['I']),
    '3': 'متوازي أضلاع ($\\overrightarrow{AI} = \\overrightarrow{BC}$) — ليس معينا (AI = 7 ، AB = $\\sqrt{37}$) ولا مستطيلا.'},
   figure={'description': 'معلم بخطوط شاقولية (كل وحدة) ومدرّج 1 على المحورين ؛ السهم $\\overrightarrow{AB}$ نازل بشدّة: A أعلى اليسار و B تحت محور الفواصل يسار محور التراتيب ؛ C أسفل اليمين.',
           'points': pts(A=x5['A'], B=x5['B'], C=x5['C']), 'grid': {'unit': 1, 'xRange': [-3, 7], 'yRange': [-5, 6]},
           'reading': 'Page inclinée (l’axe des abscisses descend vers la droite) : lu contre l’axe local, ≈ 66 px / unité horizontale et ≈ 69 px verticale ; A (−2 ; 4,07), B (−1,0 ; −1,98), C (6,0 ; −2,04).'})

M6 = [
    (P(1, 6), P(-2, -6), P(-2, 4)),
    (P(-1, F(1, 2)), P(F(1, 2), F(13, 3)), P(0, 4)),
    (P(F(3, 2), F(1, 2)), P(F(1, 4), F(5, 6)), P(-4, 7)),
]
ans6 = {}
for i, (m, n, p) in enumerate(M6, 1):
    ans6[str(i)] = {'MN': tex_vec('MN', vec(m, n)), 'NP': tex_vec('NP', vec(n, p)), 'MP': tex_vec('MP', vec(m, p))}
    assert add(vec(m, n), vec(n, p)) == vec(m, p)
assert vec(*M6[1][:2]) == (F(3, 2), F(23, 6)) and vec(M6[2][0], M6[2][2]) == (F(-11, 2), F(13, 2))
m4, n4, p4 = (R3(0, 1), R3(2)), (R3(6), R3(0, 1)), (R3(0, F(1, 3)), R3(4))      # √3/3 = (1/3)√3
v = lambda a, b: (b[0] - a[0], b[1] - a[1])
assert v(m4, p4)[0] == R3(0, F(-2, 3)) and v(n4, p4) == (R3(-6, F(1, 3)), R3(4, -1))
ans6['4'] = {k: f'$\\overrightarrow{{{k}}}\\begin{{pmatrix}} {vv[0].tex()} \\\\ {vv[1].tex()} \\end{{pmatrix}}$' for k, vv in (('MN', v(m4, n4)), ('NP', v(n4, p4)), ('MP', v(m4, p4)))}
ex(6, 146, S_2, 'المستوي مزوّد بمعلم مبدؤه O. (الوحدة 1cm). في كل حالة مما يلي، عيّن مركبتي كل شعاع من الأشعة $\\overrightarrow{MN}$ ، $\\overrightarrow{NP}$ ، $\\overrightarrow{MP}$ . 1) $M(1\\,;\\,6)$ ، $N(-2\\,;\\,-6)$ ، $P(-2\\,;\\,4)$ . 2) $M\\left(-1\\,;\\,\\dfrac{1}{2}\\right)$ ، $N\\left(\\dfrac{1}{2}\\,;\\,\\dfrac{13}{3}\\right)$ ، $P(0\\,;\\,4)$ . 3) $M\\left(\\dfrac{3}{2}\\,;\\,\\dfrac{1}{2}\\right)$ ، $N\\left(\\dfrac{1}{4}\\,;\\,\\dfrac{5}{6}\\right)$ ، $P(-4\\,;\\,7)$ . 4) $M(\\sqrt{3}\\,;\\,2)$ ، $N(6\\,;\\,\\sqrt{3})$ ، $P\\left(\\dfrac{\\sqrt{3}}{3}\\,;\\,4\\right)$ .',
   ans6, note='Contrôle : $\\overrightarrow{MN} + \\overrightarrow{NP} = \\overrightarrow{MP}$ (Chasles, unité 11) dans chaque cas (assert). Cas 4 : calcul sur les racines (unité 2), $\\dfrac{\\sqrt{3}}{3} - \\sqrt{3} = -\\dfrac{2\\sqrt{3}}{3}$ .')

a7, b7 = P(F(3, 2), -6), P(F(-7, 2), F(-5, 2))
assert vec(a7, b7) == (-5, F(7, 2)) and vec(b7, a7) == (5, F(-7, 2))
ex(7, 146, S_2, 'المستوي مزوّد بمعلم مبدؤه O. (الوحدة 1cm). $A(1{,}5\\,;\\,-6)$ ، $B(-3{,}5\\,;\\,-2{,}5)$ . 1) أوجد مركبتي كل من $\\overrightarrow{AB}$ و $\\overrightarrow{BA}$ ، ماذا تُلاحظ؟ 2) أوجد مركبتي كل من $\\overrightarrow{OB}$ و $\\overrightarrow{OA}$ ، ماذا تُلاحظ؟',
   {'1': '$\\overrightarrow{AB}\\begin{pmatrix} -5 \\\\ 3{,}5 \\end{pmatrix}$ و $\\overrightarrow{BA}\\begin{pmatrix} 5 \\\\ -3{,}5 \\end{pmatrix}$ : مركبات متعاكسة ($\\overrightarrow{BA} = -\\overrightarrow{AB}$)',
    '2': '$\\overrightarrow{OB}\\begin{pmatrix} -3{,}5 \\\\ -2{,}5 \\end{pmatrix}$ و $\\overrightarrow{OA}\\begin{pmatrix} 1{,}5 \\\\ -6 \\end{pmatrix}$ : مركبتا $\\overrightarrow{OM}$ هما إحداثيتا M (و $\\overrightarrow{AB}$ = مركبات $\\overrightarrow{OB}$ ناقص مركبات $\\overrightarrow{OA}$)'})

b8 = P(-10, 10); a8 = tr(b8, (F(-3), F(-2)))
c8 = P(-4, F(3, 2)); d8 = tr(c8, (F(2), F(-5)))
assert vec(a8, b8) == (3, 2) and a8 == P(-13, 8) and d8 == P(-2, F(-7, 2))
ex(8, 146, S_2, 'المستوي مزوّد بمعلم متعامد ومتجانس مبدؤه O. 1) عيّن إحداثيتي النقطة A حيث $B(-10\\,;\\,10)$ و $\\overrightarrow{AB}\\begin{pmatrix} 3 \\\\ 2 \\end{pmatrix}$ . 2) عيّن إحداثيتي النقطة D حيث $C(-4\\,;\\,1{,}5)$ و $\\overrightarrow{CD}\\begin{pmatrix} 2 \\\\ -5 \\end{pmatrix}$ .',
   {'1': '$-10 - x_A = 3$ و $10 - y_A = 2$ إذن ' + tex_pt('A', a8), '2': '$x_D + 4 = 2$ و $y_D - 1{,}5 = -5$ إذن $D(-2\\,;\\,-3{,}5)$'},
   correction={'decidedBy': 'platform', 'decidedOn': '2026-10-04', 'printed': 'CD(2;-5)', 'corrected': '$\\overrightarrow{CD}\\begin{pmatrix} 2 \\\\ -5 \\end{pmatrix}$'})
DISC.append({'elementId': 'ex-8', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
             'text': 'Question 2) imprimée « … حيث C(-4;1,5) و CD(2;-5) » : sans flèche et en ligne (couple de coordonnées) au lieu des composantes en colonne de la question 1). La lecture « D(2;−5) » rendrait la question vide (D donné) ; « CD » ne peut être qu’un vecteur. Correction : $\\overrightarrow{CD}\\begin{pmatrix} 2 \\\\ -5 \\end{pmatrix}$ , d’où D(−2 ; −3,5) (assert).'})

# ══ Pages 146–147 — أوظّف تعلّماتي 9–20 ═════════════════════════════════════
S_3 = 'إحداثيتا منتصف قطعة - المسافة بين نقطتين'
a9, b9 = P(2, 2), P(-3, F(5, 2))
p9a = vec(a9, b9); p9b = (-p9a[0], -p9a[1])
assert p9a == (-5, F(1, 2)) and vec(O, p9a) == vec(a9, b9) and vec(p9b, O) == vec(a9, b9)
ex(9, 146, S_2, 'المستوي مزوّد بمعلم مبدؤه O. (الوحدة 1cm). A، B، P نقط من المستوي حيث $A(2\\,;\\,2)$ ، $B(-3\\,;\\,2{,}5)$ ، $P(x\\,;\\,y)$ . عيّن x و y في كل حالة من الحالتين الآتيتين: 1) $\\overrightarrow{AB} = \\overrightarrow{OP}$ 2) $\\overrightarrow{AB} = \\overrightarrow{PO}$',
   {'AB': '$\\overrightarrow{AB}\\begin{pmatrix} -5 \\\\ 0{,}5 \\end{pmatrix}$', '1': '$\\overrightarrow{OP}\\begin{pmatrix} x \\\\ y \\end{pmatrix}$ : $x = -5$ و $y = 0{,}5$',
    '2': '$\\overrightarrow{PO}\\begin{pmatrix} -x \\\\ -y \\end{pmatrix}$ : $x = 5$ و $y = -0{,}5$'},
   pages='146–147', note='L’énoncé commence en bas de la p. 146 (colonne gauche) et finit en haut de la p. 147.')

a10, b10 = P(-5, 2), P(-6, -3)
i10 = mid(a10, b10); j10 = mid(O, b10)
assert i10 == P(F(-11, 2), F(-1, 2)) and vec(j10, b10) == vec(O, j10) and j10 == P(-3, F(-3, 2))
ex(10, 147, S_3, 'المستوي مزوّد بمعلم مبدؤه O. (الوحدة 1cm). A و B نقطتان من المستوي بحيث $A(-5\\,;\\,2)$ و $B(-6\\,;\\,-3)$ . 1) أوجد إحداثيتي النقطة I منتصف القطعة [AB]. 2) أوجد إحداثيتي النقطة J بحيث $\\overrightarrow{JB} = \\overrightarrow{OJ}$ .',
   {'1': '$I\\left(-\\dfrac{11}{2}\\,;\\,-\\dfrac{1}{2}\\right)$', '2': '$\\overrightarrow{OJ} = \\overrightarrow{JB}$ ⇔ J منتصف [OB] : $J\\left(-3\\,;\\,-\\dfrac{3}{2}\\right)$'})

a11, b11 = P(5, 9), P(1, -3)
k11 = mid(a11, b11)
assert k11 == P(3, 3) and d2(k11, a11) == 40
ex(11, 147, S_3, 'نعتبر النقطتين $A(5\\,;\\,9)$ ، $B(1\\,;\\,-3)$ . [AB] قطر للدائرة (𝒞). احسب إحداثيتي النقطة K مركز الدائرة (𝒞).',
   {'K': tex_pt('K', k11), 'radius': 'نصف القطر (إضافة): KA = $\\sqrt{40} = 2\\sqrt{10}$'})

a12, b12, c12 = P(1, -1), P(0, 3), P(-2, 0)
d12 = tr(a12, add(vec(a12, b12), vec(a12, c12)))
assert d12 == P(-3, 4) and para(a12, b12, d12, c12)
assert cross(vec(b12, c12), vec(b12, a12)) * cross(vec(b12, c12), vec(b12, d12)) < 0 and cross(vec(a12, d12), vec(a12, b12)) * cross(vec(a12, d12), vec(a12, c12)) < 0  # [BC] et [AD] se coupent : ABCD croisé
assert d2(a12, b12) != d2(a12, c12) and dot(vec(a12, b12), vec(a12, c12)) != 0
ex(12, 147, S_3, 'في معلم متعامد ومتجانس لمستوٍ، (الوحدة 1cm). تُعطى النقط $A(1\\,;\\,-1)$ ، $B(0\\,;\\,3)$ ، $C(-2\\,;\\,0)$ . 1) احسب إحداثيتي النقطة D بحيث $\\overrightarrow{AB} + \\overrightarrow{AC} = \\overrightarrow{AD}$ . 2) علّم النقط A، B، C، D. 3) ما نوع الرباعي ABCD؟ برّر إجابتك.',
   {'1': tex_vec('AB', vec(a12, b12)) + ' ، ' + tex_vec('AC', vec(a12, c12)) + ' إذن ' + tex_vec('AD', vec(a12, d12)) + ' و ' + tex_pt('D', d12),
    '3asPrinted': 'الرباعي المرسوم بالترتيب A، B، C، D متقاطع (القطعتان [BC] و [AD] تتقاطعان): ليس رباعيا بسيطا.',
    '3': 'ABDC متوازي أضلاع (قاعدة متوازي الأضلاع، أو $\\overrightarrow{AB} = \\overrightarrow{CD}$) ؛ ليس معينا ($AB^2 = 17$ ، $AC^2 = 10$) ولا مستطيلا ($BC^2 = 13 \\neq AD^2 = 41$).'},
   correction={'decidedBy': 'platform', 'decidedOn': '2026-10-04', 'printed': 'ما نوع الرباعي ABCD؟', 'corrected': 'ما نوع الرباعي ABDC؟',
               'note': 'Avec D défini par AB + AC = AD (règle du parallélogramme, unité 11), le parallélogramme est ABDC ; « ABCD » parcouru dans l’ordre est croisé (assert).'})
DISC.append({'elementId': 'ex-12', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
             'text': '« ما نوع الرباعي ABCD؟ » alors que $\\overrightarrow{AB} + \\overrightarrow{AC} = \\overrightarrow{AD}$ fait de ABDC le parallélogramme : A, B, C, D dans cet ordre donnent un quadrilatère CROISÉ ([BC] et [AD] se coupent, assert). Correction : ABDC (l’élève qui suit l’ordre imprimé trouverait « pas un quadrilatère »).'})

a13, b13, c13, d13 = P(3, 0), P(0, 2), P(2, 5), P(5, 3)
assert mid(a13, c13) == mid(b13, d13) == P(F(5, 2), F(5, 2))
assert d2(a13, b13) == d2(b13, c13) == 13 and d2(a13, c13) == 26 and right_at(b13, a13, c13) and d2(b13, d13) == 26
ex(13, 147, S_3, 'في معلم متعامد ومتجانس لمستوٍ، (الوحدة ). تُعطى النقط $A(3\\,;\\,0)$ ، $B(0\\,;\\,2)$ ، $C(2\\,;\\,5)$ ، $D(5\\,;\\,3)$ . 1) تحقّق أنّ للقطعتين [AC] و [BD] نفس المنتصف. ماذا تستنتج؟ 2) تحقّق أنّ AB = BC. ماذا تستنتج؟ 3) تحقّق أنّ $AB^2 + BC^2 = AC^2$ ماذا تستنتج؟ 4) ما نوع الرباعي ABCD؟',
   {'1': 'منتصف [AC] و [BD] هو $\\left(\\dfrac{5}{2}\\,;\\,\\dfrac{5}{2}\\right)$ : ABCD متوازي أضلاع', '2': 'AB = BC = $\\sqrt{13}$ : ABCD معيّن', '3': '$13 + 13 = 26 = AC^2$ : المثلث ABC قائم في B (زاوية قائمة)', '4': 'مربّع'},
   correction={'decidedBy': 'platform', 'decidedOn': '2026-10-04', 'printed': '(الوحدة )', 'corrected': '(الوحدة 1cm)'})
DISC.append({'elementId': 'ex-13', 'kind': 'misprint', 'resolution': 'completed — unit 1cm like exercises 12, 14, 18, 20',
             'text': '« (الوحدة ) » : la longueur de l’unité est absente. Complétée en 1cm (toutes les autres données de la page) ; sans effet sur les réponses (aucune longueur numérique demandée).'})

a14, b14, c14 = P(1, 1), P(-1, 4), P(3, 3)
d14 = tr(c14, (-vec(a14, b14)[0], -vec(a14, b14)[1]))
assert d14 == P(5, 0) and vec(a14, b14) == vec(d14, c14) and para(a14, b14, c14, d14)
assert d2(a14, b14) != d2(b14, c14) and dot(vec(a14, b14), vec(b14, c14)) != 0
ex(14, 147, S_3, 'في معلم متعامد ومتجانس لمستوٍ، (الوحدة 1cm). تُعطى النقط $A(1\\,;\\,1)$ ، $B(-1\\,;\\,4)$ ، $C(3\\,;\\,3)$ . 1) علّم النقط A، B و C. 2) عيّن إحداثيتي النقطة D بحيث $\\overrightarrow{AB} = \\overrightarrow{DC}$ . 3) ما نوع الرباعي ABCD؟',
   {'2': tex_vec('AB', vec(a14, b14)) + ' ؛ $3 - x_D = -2$ و $3 - y_D = 3$ إذن ' + tex_pt('D', d14), '3': 'متوازي أضلاع ($\\overrightarrow{AB} = \\overrightarrow{DC}$ و A، B، C ليست في استقامية) — ليس معيّنا ($AB^2 = 13 \\neq BC^2 = 17$) ولا مستطيلا.'})

k15, l15, m15 = P(0, 2), P(3, 4), P(1, 2)
assert (d2(k15, l15), d2(k15, m15), d2(m15, l15)) == (13, 1, 8)
ex(15, 147, S_3, 'تُعطى النقاط $K(0\\,;\\,2)$ ، $L(3\\,;\\,4)$ ، $M(1\\,;\\,2)$ . احسب القيمة المضبوطة لكل من: KL، KM، ML.',
   {'KL': dist(k15, l15), 'KM': dist(k15, m15), 'ML': dist(m15, l15)},
   note='ML = $\\sqrt{8} = 2\\sqrt{2}$ : simplification (unité 2) attendue par « القيمة المضبوطة ». Pas de repère précisé : orthonormé implicite (distance).')

r2 = F(2)
a16 = (F(2), F(0))          # coordonnées au carré : A(√2 ; 0) → x² = 2, y² = 0
b16 = (F(2), F(2))          # B(√2 ; √2)
assert sum(a16) == r2 and sum(b16) == 4 != r2
ex(16, 147, S_3, '(𝒞) الدائرة التي مركزها O مبدأ المعلم ونصف قطرها $\\sqrt{2}$ . 1) هل النقطة $A(\\sqrt{2}\\,;\\,0)$ تنتمي إلى (𝒞)؟ 2) هل النقطة $B(\\sqrt{2}\\,;\\,\\sqrt{2})$ تنتمي إلى (𝒞)؟',
   {'1': 'نعم: $OA = \\sqrt{(\\sqrt{2})^2 + 0^2} = \\sqrt{2}$', '2': 'لا: $OB = \\sqrt{(\\sqrt{2})^2 + (\\sqrt{2})^2} = \\sqrt{4} = 2 \\neq \\sqrt{2}$'},
   note='Méthode : M ∈ (𝒞) ⇔ OM = rayon (comparer OM² et r² évite les racines).')

p17, m17 = P(2, 1), P(-1, 1)
assert d2(p17, m17) == 9
ex(17, 147, S_3, 'احسب نصف قطر الدائرة (𝒞) التي مركزها النقطة $P(2\\,;\\,1)$ وتشمل النقطة $M(-1\\,;\\,1)$ .',
   {'r': 'PM = $\\sqrt{(-1-2)^2 + (1-1)^2} = 3$'})

a18, b18, c18 = P(1, 0), P(0, 3), P(3, 4)
i18 = mid(a18, c18)
assert i18 == P(2, 2) and d2(a18, b18) == 10 and d2(a18, c18) == 20 and d2(i18, b18) == d2(i18, a18) == 5
assert dot(vec(b18, i18), vec(a18, c18)) == 0 and d2(b18, c18) == 10 and right_at(b18, a18, c18)
ex(18, 147, S_3, 'في معلم متعامد ومتجانس لمستوٍ، (الوحدة 1cm). تُعطى النقط $A(1\\,;\\,0)$ ، $B(0\\,;\\,3)$ ، $C(3\\,;\\,4)$ . 1) احسب AB و AC. 2) عيّن إحداثيتي النقطة I مركز الدائرة (𝒞) التي قطرها [AC]. 3) بيّن أنّ B نقطة من الدائرة (𝒞). 4) بيّن أنّ (BI) ⊥ (AC). 5) ما نوع المثلث ABC.',
   {'1': {'AB': dist(a18, b18), 'AC': dist(a18, c18)}, '2': tex_pt('I', i18), '3': 'IB = $\\sqrt{5}$ = IA = نصف القطر ($\\dfrac{AC}{2} = \\dfrac{2\\sqrt{5}}{2}$)',
    '4': 'BA = BC = $\\sqrt{10}$ : المثلث ABC متساوي الساقين رأسه B، و I منتصف القاعدة [AC] فالمتوسط (BI) هو أيضا ارتفاع: (BI) ⊥ (AC).',
    '5': 'قائم في B ($AB^2 + BC^2 = 10 + 10 = 20 = AC^2$ ، أو B على الدائرة التي قطرها [AC]) ومتساوي الساقين.'},
   note='4AM n’a pas le produit scalaire : la perpendicularité passe par le triangle isocèle (médiane = hauteur) ou la médiatrice (IA = IC et BA = BC).')

sq3 = F(3, 4)               # (√3/2)²
A19 = (F(1), F(0)); B19x, C19x = F(-1, 2), F(-1, 2)
AB2 = (B19x - A19[0]) ** 2 + sq3          # (−3/2)² + 3/4
BC2 = (2 * 2) * sq3                       # (√3)² = 3
AC2 = (C19x - A19[0]) ** 2 + sq3
assert AB2 == BC2 == AC2 == 3 and B19x ** 2 + sq3 == 1 == A19[0] ** 2
ex(19, 147, S_3, 'المستوي مزود بمعلم متعامد ومتجانس، مبدؤه النقطة O. نعتبر النقط $A(1\\,;\\,0)$ ، $B\\left(-\\dfrac{1}{2}\\,;\\,\\dfrac{\\sqrt{3}}{2}\\right)$ ، $C\\left(-\\dfrac{1}{2}\\,;\\,-\\dfrac{\\sqrt{3}}{2}\\right)$ . 1) أثبت أن المثلث ABC متقايس الأضلاع. 2) تحقّق أن مبدأ المعلم هو مركز الدائرة المحيطة بالمثلث ABC.',
   {'1': '$AB^2 = \\left(-\\dfrac{3}{2}\\right)^2 + \\left(\\dfrac{\\sqrt{3}}{2}\\right)^2 = \\dfrac{9}{4} + \\dfrac{3}{4} = 3$ ، $BC^2 = 0^2 + (\\sqrt{3})^2 = 3$ ، $AC^2 = 3$ : AB = BC = AC = $\\sqrt{3}$',
    '2': 'OA = OB = OC = 1 ($\\dfrac{1}{4} + \\dfrac{3}{4} = 1$) : O متساوي البعد عن الرؤوس الثلاثة.'})

a20, b20, c20 = P(2, 1), P(3, -1), P(-1, 1)
m20, n20, k20 = sym(c20, a20), sym(c20, b20), tr(b20, vec(c20, a20))
assert (m20, n20, k20) == (P(5, 1), P(7, -3), P(6, -1)) and mid(m20, n20) == k20
ex(20, 147, S_3, 'في معلم متعامد ومتجانس لمستوٍ، (الوحدة 1cm). تُعطى النقط $A(2\\,;\\,1)$ ، $B(3\\,;\\,-1)$ ، $C(-1\\,;\\,1)$ . 1) علّم النقط A، B، C. 2) M نظيرة C بالنسبة إلى النقطة A، N نظيرة C بالنسبة إلى النقطة B و K صورة النقطة B بالانسحاب الذي شعاعه $\\overrightarrow{CA}$ . 3) احسب إحداثيتي كل من النقط M، N و K ثم علّمها وتأكّد من الحسابات التي قُمت بها سابقا. 4) بيّن أنّ النقطة K هي منتصف [MN] بطريقتين مختلفتين (مرة باستعمال الإحداثيات ومرة باستعمال خواص هندسية).',
   {'3': {'M': tex_pt('M', m20) + ' (A منتصف [CM])', 'N': tex_pt('N', n20) + ' (B منتصف [CN])', 'K': tex_pt('K', k20) + ' ($\\overrightarrow{BK} = \\overrightarrow{CA}$)'},
    '4coords': 'منتصف [MN]: $\\left(\\dfrac{5 + 7}{2}\\,;\\,\\dfrac{1 - 3}{2}\\right) = (6\\,;\\,-1)$ = K',
    '4geometry': 'في المثلث CMN: A منتصف [CM] و B منتصف [CN] ؛ $\\overrightarrow{BK} = \\overrightarrow{CA} = \\overrightarrow{AM}$ فالرباعي ABKM متوازي أضلاع و $\\overrightarrow{MK} = \\overrightarrow{AB}$ ؛ (AB) // (MN) و $AB = \\dfrac{MN}{2}$ (مستقيم المنتصفين) فـ $\\overrightarrow{MK} = \\overrightarrow{KN}$ .'})

# ══ Page 148 — أؤكّد تعلّماتي (QCM), أدمج تعلّماتي (وضعية) ══════════════════
qa1, qb1 = P(3, 2), P(-2, -2)
assert vec(qa1, qb1) == (-5, -4)
qa2, qb2 = P(-2, -1), P(-1, 1)
assert mid(qa2, qb2) == P(F(-3, 2), 0)
assert d2(O, P(4, 3)) == 25
qa4, qb4 = P(3, 3), P(-3, -3)
assert d2(qa4, qb4) == 72 and surd(72) == '6\\sqrt{2}' and 9 * 9 != 72
qa5, qb5 = P(2, 3), P(4, 1)
assert d2(qa5, qb5) == 8 and surd(8) == '2\\sqrt{2}'
E.append({
    'id': 'qcm', 'kind': 'qcm', 'page': 148, 'section': 'أؤكّد تعلّماتي', 'verified': True,
    'instruction': 'في كل حالة مما يلي اختر الإجابة أو الإجابات الصحيحة، وبرّر اختيارك.',
    'items': [
        {'number': 1, 'text': 'في الشكل المقابل، مركبتا الشعاع $\\overrightarrow{AB}$ هما …',
         'figure': {'description': 'ورقة مرصوفة، معلم مدرّج 1 ؛ A أعلى اليمين و B أسفل اليسار (إسقاطات متقطعة على المحورين) ؛ سهم أحمر من A إلى B.',
                    'points': pts(A=qa1, B=qb1), 'grid': {'unit': 1, 'xRange': [-3, 4], 'yRange': [-3, 3]}, 'reading': '≈ 112 px / unité : A (3,0 ; 2,0), B (−2,0 ; −2,05).'},
         'options': ['$(-5\\,;\\,-4)$', '$(-5\\,;\\,3)$', '$(5\\,;\\,-3)$'], 'correct': [0], 'pages': '142',
         'justification': '$x_B - x_A = -2 - 3 = -5$ و $y_B - y_A = -2 - 2 = -4$ (الشعاع نحو الأسفل واليسار: مركبتان سالبتان)'},
        {'number': 2, 'text': '$A(-2\\,;\\,-1)$ ، $B(-1\\,;\\,1)$ نقطتان من المستوي المزود بمعلم. إحداثيتا I منتصف [AB] هما…',
         'options': ['$\\left(-\\dfrac{3}{2}\\,;\\,0\\right)$', '$\\left(\\dfrac{3}{2}\\,;\\,0\\right)$', '$\\left(0\\,;\\,-\\dfrac{3}{2}\\right)$'], 'correct': [0], 'pages': '144',
         'justification': '$\\left(\\dfrac{-2 + (-1)}{2}\\,;\\,\\dfrac{-1 + 1}{2}\\right)$'},
        {'number': 3, 'text': '$A(4\\,;\\,3)$ نقطة من المستوي المزوّد بمعلم متعامد ومتجانس مبدؤه O. الطول OA هي…',
         'options': ['5', '3,5', '7'], 'correct': [0], 'pages': '144 و 145', 'justification': '$\\sqrt{4^2 + 3^2} = \\sqrt{25}$ (7 = خطأ جمع المركبتين)'},
        {'number': 4, 'text': 'على الشكل المقابل، المسافة AB تساوي…',
         'figure': {'description': 'ورقة مرصوفة، معلم مدرّج 1 ؛ A أعلى اليمين و B أسفل اليسار (نقطتان بدون إسقاطات).',
                    'points': pts(A=qa4, B=qb4), 'grid': {'unit': 1, 'xRange': [-5, 4], 'yRange': [-3, 4]}, 'reading': '≈ 104 px / unité : A (2,97 ; 3,0), B (−2,98 ; −3,0).'},
         'options': ['9', '$6\\sqrt{2}$', '$\\sqrt{72}$'], 'correct': [1, 2], 'pages': '144 و 145',
         'justification': '$\\overrightarrow{AB}\\begin{pmatrix} -6 \\\\ -6 \\end{pmatrix}$ ، $AB = \\sqrt{36 + 36} = \\sqrt{72} = 6\\sqrt{2}$'},
        {'number': 5, 'text': '$A(2\\,;\\,3)$ ، $B(4\\,;\\,1)$ نقطتان من المستوي المزوّد بمعلم متعامد ومتجانس مبدؤه O. الطول AB يساوي.',
         'options': ['$\\sqrt{8}$', '$2\\sqrt{2}$', '0'], 'correct': [0, 1], 'pages': '144 و 145', 'justification': '$\\sqrt{2^2 + (-2)^2} = \\sqrt{8} = 2\\sqrt{2}$'},
    ],
    'note': 'Colonnes imprimées (1) (2) (3) de droite à gauche ; options rangées ici (1), (2), (3) → index 0, 1, 2. Items 4 et 5 ont DEUX bonnes réponses (même nombre écrit avec et sans simplification). Les composantes de l’item 1 sont imprimées en couples « (−5;−4) » et non en colonne.',
})

# وضعية : coureurs, 1 cm ↔ 1 km.
SM, SP1, SQ, SN = P(-2, 3), P(1, 1), P(3, 2), P(4, -2)
segs = [d2(SM, SP1), d2(SP1, SQ), d2(SQ, SN)]
assert segs == [13, 5, 17]
L1len = 3 * math.pi * 1                      # trois demi-cercles de rayon 1 : 3 × π r
L2len = sum(math.sqrt(s) for s in segs)
assert abs(L1len - 9.42477796) < 1e-6 and abs(L2len - 9.96474) < 1e-4 and L1len < L2len
for c in (P(-1, 0), P(1, 0), P(3, 0)):        # extrémités des demi-cercles sur l'axe des abscisses
    assert d2(c, tr(c, (F(1), F(0)))) == 1
E.append({
    'id': 'situation', 'kind': 'situation', 'page': 148, 'section': 'أدمج تعلّماتي', 'verified': True, 'title': 'وضعية',
    'text': 'يتدرّب عدّاءان استعدادا لمنافسة دُوليّة على مسارين مُمثّلين بالمنحنيين (1) و (2) في الشكل المقابل. حدّد أقصر المسارين (1) و (2).',
    'figure': {
        'description': 'ورقة مرصوفة، معلم مدرّج (-2، -1، 0، 1 على محور الفواصل، 1 على محور التراتيب) ؛ المسار (1) بالأحمر من A إلى B: نصف دائرة علوي مركزه (−1 ; 0)، ثم نصف دائرة سفلي مركزه (1 ; 0)، ثم نصف دائرة علوي مركزه (3 ; 0) — الأنصاف المكمّلة للدوائر الثلاث متقطعة ؛ المسار (2) خط منكسر أحمر M → (1 ; 1) → (3 ; 2) → N. تحت الشكل: «1cm على المعلم يمثل 1km في الواقع».',
        'points': {**pts(A=P(-2, 0), B=P(4, 0), M=SM, N=SN), 'P1': [1, 1], 'P2': [3, 2]},
        'arcs': [{'center': [-1, 0], 'radius': 1, 'half': 'upper'}, {'center': [1, 0], 'radius': 1, 'half': 'lower'}, {'center': [3, 0], 'radius': 1, 'half': 'upper'}],
        'polyline': ['M', 'P1', 'P2', 'N'], 'scale': '1cm ↔ 1km', 'grid': {'unit': 1, 'xRange': [-3, 5], 'yRange': [-3, 4]},
        'reading': 'Relu à ≈ 152 px / unité : M (−2 ; 3), sommets intermédiaires du chemin (2) en (1 ; 1) (point noir sur le cercle pointillé central) et (3 ; 2) (étiquette « (2) »), N (4 ; −2). Les deux sommets intermédiaires ne sont pas nommés dans le manuel : P1, P2 sont des noms de la plateforme.',
    },
    'analysis': {
        'قراءة الوضعية وفهمها': ['عمّ يتحدث النص؟', 'كيف أرتب المعطيات والتعليمات الواردة في نص المشكل؟'],
        'تحليل الوضعية واختيار استراتيجية حل مناسبة': ['كيف أفسّر التمثيلين البيانيين (1) و (2)؟'],
        'تنفيذ استراتيجية الحل المختارة': ['إحداثيتا كل نقطة من نقاط المسار (1) مع حامل محور الفواصل.', 'أعبّر عن طول المسار (1) بمحيط ثلاثة أنصاف دوائر.', 'أبحث عن إحداثيتي كل طرف من قِطع المسار (2).'],
    },
    'answer': {
        'path1': {'axisPoints': 'A(−2 ; 0) ، O(0 ; 0) ، (2 ; 0) ، B(4 ; 0) : ثلاثة أنصاف دوائر قطر كل منها 2 (نصف القطر 1)',
                  'length': '$3 \\times \\dfrac{2\\pi \\times 1}{2} = 3\\pi \\approx 9{,}42$ km'},
        'path2': {'vertices': 'M(−2 ; 3) ، (1 ; 1) ، (3 ; 2) ، N(4 ; −2)',
                  'segments': ['$\\sqrt{(1+2)^2 + (1-3)^2} = \\sqrt{13}$', '$\\sqrt{(3-1)^2 + (2-1)^2} = \\sqrt{5}$', '$\\sqrt{(4-3)^2 + (-2-2)^2} = \\sqrt{17}$'],
                  'length': '$\\sqrt{13} + \\sqrt{5} + \\sqrt{17} \\approx 3{,}61 + 2{,}24 + 4{,}12 \\approx 9{,}96$ km'},
        'conclusion': 'المسار (1) هو الأقصر (حوالي 9,42 km مقابل 9,96 km ، فرق ≈ 0,54 km).',
    },
    'answerSource': 'computed',
    'note': 'La vraie difficulté : les deux longueurs sont proches (≈ 9,4 / 10 km) — l’œil ne tranche pas, le calcul exact (π et trois racines) si. Le chemin (2) mobilise la distance entre deux points (leçon 3) ; le chemin (1) la lecture des coordonnées sur l’axe et le périmètre du cercle.',
})

# ══ Page 149 — أتعمّق 21–27 ═════════════════════════════════════════════════
S_5 = 'أتعمّق'
a21, b21, c21 = P(1, 2), P(4, 3), P(6, -3)
assert (vec(a21, b21), vec(b21, c21), vec(a21, c21)) == ((3, 1), (2, -6), (5, -5))
assert (d2(a21, b21), d2(b21, c21), d2(a21, c21)) == (10, 40, 50) and right_at(b21, a21, c21)
ex(21, 149, S_5, 'المستوي منسوب إلى معلم متعامد ومتجانس مبدؤه O. (الوحدة 1cm). A، B، C أربع نقط حيث $A(1\\,;\\,2)$ ، $B(4\\,;\\,3)$ ، $C(6\\,;\\,-3)$ . 1) علّم النقط A، B، C. 2) عيّن مركبتي كل شعاع من الأشعة $\\overrightarrow{AB}$ ، $\\overrightarrow{BC}$ و $\\overrightarrow{AC}$ . 3) احسب الأطوال AB، BC، AC. 4) ما نوع المثلث ABC.',
   {'2': {k: tex_vec(k, vec(p, q)) for k, p, q in (('AB', a21, b21), ('BC', b21, c21), ('AC', a21, c21))},
    '3': {'AB': dist(a21, b21), 'BC': dist(b21, c21), 'AC': dist(a21, c21)},
    '4': 'قائم في B: $AB^2 + BC^2 = 10 + 40 = 50 = AC^2$ (BC = $2\\sqrt{10}$ = 2AB : ليس متساوي الساقين)'},
   correction={'decidedBy': 'platform', 'decidedOn': '2026-10-04', 'printed': 'A، B، C أربع نقط', 'corrected': 'A، B، C ثلاث نقط'})
DISC.append({'elementId': 'ex-21', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
             'text': '« C، B، A أربع نقط » : trois points seulement (copie de l’énoncé de l’exercice 22 « أربع نقط … D »). Correction : « ثلاث نقط ».'})

a22, b22, c22, d22 = P(1, 3), P(2, 4), P(5, 1), P(2, 0)
i22 = mid(a22, c22)
assert right_at(b22, a22, c22) and (d2(a22, b22), d2(b22, c22), d2(a22, c22)) == (2, 18, 20)
assert i22 == P(3, 2) and all(d2(i22, p) == 5 for p in (a22, b22, c22, d22)) and right_at(d22, a22, c22)
ACD = math.degrees(math.atan(math.sqrt(d2(a22, d22) / d2(d22, c22))))
BCA = math.degrees(math.atan(math.sqrt(d2(a22, b22) / d2(b22, c22))))
assert abs(ACD - 45) < 1e-9 and abs(BCA - 18.4349488) < 1e-6
angC = ACD + BCA; angA = 360 - 90 - 90 - angC
assert abs(angA - (90 - BCA + 90 - ACD)) < 1e-9
ex(22, 149, S_5, 'المستوي منسوب إلى معلم متعامد ومتجانس مبدؤه O. (الوحدة 1cm). A، B، C و D أربع نقط حيث $A(1\\,;\\,3)$ ، $B(2\\,;\\,4)$ ، $C(5\\,;\\,1)$ و $D(2\\,;\\,0)$ . 1) بيّن أنّ المثلث ABC قائم. 2) بيّن أن النقط A، B، C و D تنتمي إلى دائرة واحدة، يُطلب تعيين إحداثيتي مركزها I ونصف قطرها. 3) احسب قيمة مقرّبة لكل من الزاويتين $\\widehat{ACD}$ و $\\widehat{BCA}$ ، ثم أعط قيم زوايا الرباعي ABCD.',
   {'1': '$AB^2 + BC^2 = 2 + 18 = 20 = AC^2$ : قائم في B',
    '2': 'I منتصف الوتر [AC]: ' + tex_pt('I', i22) + ' ، IA = IB = IC = ID = $\\sqrt{5}$ (نصف القطر)',
    '3': {'ACD': 'المثلث ACD قائم في D و DA = DC = $\\sqrt{10}$ : $\\tan\\widehat{ACD} = 1$ ، $\\widehat{ACD} = 45°$',
          'BCA': '$\\tan\\widehat{BCA} = \\dfrac{AB}{BC} = \\dfrac{\\sqrt{2}}{3\\sqrt{2}} = \\dfrac{1}{3}$ ، $\\widehat{BCA} \\approx 18{,}4°$',
          'ABCD': f'$\\widehat{{B}} = \\widehat{{D}} = 90°$ ، $\\widehat{{C}} \\approx {angC:.1f}°$ ، $\\widehat{{A}} \\approx {angA:.1f}°$'.replace('.', '{,}')}},
   note='Mobilise l’unité 10 (tangente). Les quatre angles somment à 360° (contrôle).')

a23, b23, c23 = P(-3, 1), P(3, 5), P(5, 2)
d23 = tr(b23, add(vec(b23, a23), vec(b23, c23)))
U23 = (F(2), F(0))
assert right_at(b23, a23, c23) and (d2(a23, b23), d2(b23, c23), d2(a23, c23)) == (52, 13, 65)
assert d23 == P(-1, -2) and para(a23, b23, c23, d23) and right_at(b23, a23, c23)
area23 = math.sqrt(d2(a23, b23) * d2(b23, c23))
assert area23 == 26
img23 = {k + "'": tr(p, U23) for k, p in (('A', a23), ('B', b23), ('C', c23), ('D', d23))}
assert img23["A'"] == P(-1, 1) and img23["D'"] == P(1, -2)
ex(23, 149, S_5, 'المستوي منسوب إلى معلم متعامد ومتجانس مبدؤه O. (الوحدة 1cm). A، B، C ثلاث نقط بحيث $A(-3\\,;\\,1)$ ، $B(3\\,;\\,5)$ ، $C(5\\,;\\,2)$ . 1) علّم النقط A، B، C. 2) ما نوع المثلث ABC؟ 3) علّم النقطة D بحيث $\\overrightarrow{BD} = \\overrightarrow{BA} + \\overrightarrow{BC}$ ثم احسب إحداثيتي النقطة D. 4) ما نوع الرباعي ABCD؟ 5) احسب مساحة الرباعي ABCD. 6) $\\vec{u}$ شعاع حيث $\\vec{u}\\begin{pmatrix} 2 \\\\ 0 \\end{pmatrix}$ . الرباعي A′B′C′D′ هو صورة الرباعي ABCD بالانسحاب الذي شعاعه $\\vec{u}$ . استنتج إحداثيتي كل رأس من رؤوس الرباعي A′B′C′D′.',
   {'2': 'قائم في B: $AB^2 + BC^2 = 52 + 13 = 65 = AC^2$', '3': '$\\overrightarrow{BA}\\begin{pmatrix} -6 \\\\ -4 \\end{pmatrix} + \\overrightarrow{BC}\\begin{pmatrix} 2 \\\\ -3 \\end{pmatrix}$ = $\\overrightarrow{BD}\\begin{pmatrix} -4 \\\\ -7 \\end{pmatrix}$ إذن ' + tex_pt('D', d23),
    '4': 'مستطيل (متوازي أضلاع بقاعدة متوازي الأضلاع وفيه زاوية قائمة في B) — ليس مربعا (AB = $2\\sqrt{13}$ ≠ BC = $\\sqrt{13}$)',
    '5': 'AB × BC = $2\\sqrt{13} \\times \\sqrt{13} = 26$ cm²', '6': {k: tex_pt(k, p) for k, p in img23.items()}})

a24, b24, c24, d24 = P(1, 2), P(3, 4), P(5, 2), P(3, 0)
assert mid(a24, c24) == mid(b24, d24) == P(3, 2) and d2(a24, c24) == d2(b24, d24) == 16
assert vec(a24, b24) == (2, 2) and vec(b24, c24) == (2, -2) and d2(a24, b24) == d2(b24, c24) == 8 and right_at(b24, a24, c24)
ex(24, 149, S_5, 'المستوي مزود بمعلم متعامد ومتجانس $(O\\,;\\,\\vec{i},\\,\\vec{j})$ . 1) علّم النقط: $A(1\\,;\\,2)$ ، $B(3\\,;\\,4)$ ، $C(5\\,;\\,2)$ ، $D(3\\,;\\,0)$ . 2) بيّن أنّ للقطعتين [AC] و [BD] نفس الطول ونفس المنتصف ثم استنتج نوع الرباعي ABCD. 3) احسب مركبتي كل من الشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{BC}$ ثم احسب الطولين AC و BD. 4) استنتج أنّ (BD) ⊥ (AC).',
   {'2': 'المنتصف المشترك $(3\\,;\\,2)$ و AC = BD = 4 : ABCD مستطيل', '3': tex_vec('AB', vec(a24, b24)) + ' ، ' + tex_vec('BC', vec(b24, c24)) + ' ؛ AC = BD = 4 (و AB = BC = $\\sqrt{8} = 2\\sqrt{2}$)',
    '4': 'AB = BC : المستطيل ABCD معيّن أيضا (مربع) وقطرا المعيّن متعامدان: (BD) ⊥ (AC)'},
   note='Q3 demande « AC و BD » déjà calculées en Q2 : la déduction de Q4 attend AB = BC (calculées à partir des composantes). Repère noté $(O\\,;\\,\\vec{i},\\,\\vec{j})$ — seule apparition de cette notation dans l’unité (avec l’exercice 25).')
DISC.append({'elementId': 'ex-24', 'kind': 'inconsistency', 'resolution': 'kept — lessons may read Q3 as « AB و BC »',
             'text': 'Q3 « احسب الطولين AC و BD » redemande les longueurs de Q2 ; pour « استنتج أنّ (BD) ⊥ (AC) » il faut AB = BC (losange), que les composantes de Q3 donnent. Probable coquille pour « AB و BC » ; gardé tel quel, la réponse donne les quatre longueurs.'})

a25, b25, c25 = P(-2, -3), P(4, 1), P(2, 4)
e25 = tr(a25, vec(b25, c25))
assert d2(a25, b25) == 52 and surd(52) == '2\\sqrt{13}' and d2(a25, c25) == 65 and d2(b25, c25) == 13 and right_at(b25, a25, c25)
assert e25 == P(-4, 0) and para(a25, b25, c25, e25)
ex(25, 149, S_5, 'من امتحان شهادة التعليم المتوسط. المستوي مزود بمعلم متعامد ومتجانس $(O\\,;\\,\\vec{i},\\,\\vec{j})$ . 1) علّم النقط: $A(-2\\,;\\,-3)$ ، $B(4\\,;\\,1)$ ، $C(2\\,;\\,4)$ . 2) أ) أعط القيمة المضبوطة للطول AB. ب) علما أنّ: $AC = \\sqrt{65}$ و $BC = \\sqrt{13}$ ، بيّن أنّ المثلث ABC قائم. 3) أنشئ النقطة E صورة A بالإنسحاب الذي شعاعه $\\overrightarrow{BC}$ ، أثبت أنّ ABCE مستطيل.',
   {'2a': '$AB = \\sqrt{6^2 + 4^2} = \\sqrt{52} = 2\\sqrt{13}$', '2b': '$AB^2 + BC^2 = 52 + 13 = 65 = AC^2$ : قائم في B',
    '3': tex_pt('E', e25) + ' ؛ $\\overrightarrow{AE} = \\overrightarrow{BC}$ فـ ABCE متوازي أضلاع، وزاويته B قائمة: مستطيل'})

a26, b26, c26 = P(2, -2), P(-3, 3), P(-4, -3)
d26 = tr(b26, vec(c26, a26))
assert (d2(a26, b26), d2(b26, c26), d2(a26, c26)) == (50, 37, 37) and not right_at(c26, a26, b26)
assert d26 == P(3, 4) and para(c26, a26, d26, b26) and d2(c26, a26) == d2(c26, b26)          # CADB losange
assert dot(vec(a26, b26), vec(c26, d26)) == 0 and d2(c26, d26) == 98
area26 = F(1, 2) * F(math.isqrt(50 * 98))
assert 50 * 98 == 70 ** 2 and area26 == 35
assert cross(vec(a26, b26), vec(a26, c26)) * cross(vec(a26, b26), vec(a26, d26)) < 0          # C et D de part et d'autre de (AB) : ABCD croisé
ex(26, 149, S_5, 'المستوي منسوب إلى معلم متعامد ومتجانس مبدؤه O. (الوحدة 1cm). نعتبر النقط $A(2\\,;\\,-2)$ ، $B(-3\\,;\\,3)$ ، $C(-4\\,;\\,-3)$ . 1) احسب القيم المضبوطة للأطوال AB ، BC ، AC. 2) ما نوع المثلث ABC؟ 3) احسب إحداثيتي النقطة D بحيث $\\overrightarrow{CA} = \\overrightarrow{BD}$ . 4) بيّن أن (AB) ⊥ (CD). 5) ماذا يُمثّل الجداء $\\dfrac{1}{2} \\times AB \\times CD$ بالنسبة للرباعي ABCD.',
   {'1': {'AB': dist(a26, b26), 'BC': dist(b26, c26), 'AC': dist(a26, c26)}, '2': 'متساوي الساقين رأسه C (CA = CB = $\\sqrt{37}$) — ليس قائما ($37 + 37 \\neq 50$)',
    '3': tex_pt('D', d26), '4': 'CADB متوازي أضلاع ($\\overrightarrow{CA} = \\overrightarrow{BD}$) فيه CA = CB : معيّن، وقطراه [AB] و [CD] متعامدان.',
    '5': 'مساحة المعيّن (نصف جداء القطرين): $\\dfrac{1}{2} \\times 5\\sqrt{2} \\times 7\\sqrt{2} = 35$ cm²'},
   correction={'decidedBy': 'platform', 'decidedOn': '2026-10-04', 'printed': 'بالنسبة للرباعي ABCD', 'corrected': 'بالنسبة للرباعي ACBD',
               'note': 'Le losange est ACBD (côtés AC, CB, BD, DA) ; ABCD dans cet ordre est croisé (C et D de part et d’autre de (AB), assert).'})
DISC.append({'elementId': 'ex-26', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
             'text': '« الرباعي ABCD » : avec CA = BD, le quadrilatère non croisé est ACBD (losange de diagonales [AB] et [CD]) ; A, B, C, D dans l’ordre imprimé forment un quadrilatère croisé. Correction : ACBD (même coquille que l’exercice 12).'})

a27, b27, c27 = P(-3, 1), P(1, 4), P(4, 0)
d27 = tr(a27, vec(b27, c27))
assert d2(a27, b27) == d2(b27, c27) == 25 and right_at(b27, a27, c27) and d27 == P(0, -3)
assert para(a27, b27, c27, d27) and d2(a27, b27) == d2(b27, c27)
ex(27, 149, S_5, 'المستوي منسوب إلى معلم متعامد ومتجانس مبدؤه O. (الوحدة 1cm). نعتبر النقط $A(-3\\,;\\,1)$ ، $B(1\\,;\\,4)$ ، $C(4\\,;\\,0)$ . 1) علّم النقط A، B، C. ما نوع المثلث ABC؟ 2) D هي صورة النقطة A بالانسحاب الذي شعاعه $\\overrightarrow{BC}$ . أ) علّم النقطة D، احسب إحداثيتي النقطة D. ب) أثبت أنّ الرباعي ABCD مربع.',
   {'1': 'AB = BC = 5 و $AC^2 = 50 = 25 + 25$ : قائم ومتساوي الساقين في B', '2a': tex_pt('D', d27) + ' ($\\overrightarrow{AD} = \\overrightarrow{BC}$)',
    '2b': 'ABCD متوازي أضلاع ($\\overrightarrow{AD} = \\overrightarrow{BC}$) فيه زاوية قائمة (B) وضلعان متتاليان متقايسان: مربّع'})

# ══ Destinations ═════════════════════════════════════════════════════════════
L1, L2, L3, L4, L5 = 'murakkibata-shuaa', 'hisab-murakkibatay', 'muntasaf-masafa', 'ithbat-khawas-maalam', 'wadiya-idmajiya-maalam'
DEST = {
    '_comment': 'elementId → { lesson, module } ; `duplicatedIn` autorise une seconde utilisation déclarée ; `items` répartit un élément. Modules : 0 أستعدّ, 1 أنشطة/entrée, 2 معارف, 3 طرائق, 4 تمارين (synthèse : 1 وضعية, 2 QCM, 3 تمارين).',
    'objectives': {'lesson': 'unit', 'module': 'page'},
    'intro-descartes': {'lesson': 'unit', 'module': 'page', 'duplicatedIn': [{'lesson': L1, 'module': 1, 'note': 'la mouche sur les carreaux de la fenêtre de Descartes : entrée concrète du repère (lire deux nombres)'}]},
    'challenge': {'lesson': 'unit', 'module': 'page', 'duplicatedIn': [{'lesson': L3, 'module': 1, 'note': 'entrée de la leçon distance : « القيمة المضبوطة » de AB avec des coordonnées fractionnaires — la règle graduée ne suffit pas'}]},
    'prep': {'lesson': L1, 'module': 0, 'items': {'1': {'lesson': L1, 'module': 0}, '2': {'lesson': L1, 'module': 0}, '3': {'lesson': L2, 'module': 0},
                                                  '4': {'lesson': L2, 'module': 0}, '5': {'lesson': L3, 'module': 0}, '6': {'lesson': L2, 'module': 0}}},
    'act-1': {'lesson': L1, 'module': 1},
    'know-1': {'lesson': L1, 'module': 2}, 'know-2': {'lesson': L1, 'module': 2}, 'know-origin': {'lesson': L1, 'module': 2},
    'know-3': {'lesson': L2, 'module': 2, 'items': {'أ': {'lesson': L1, 'module': 2}, 'ب': {'lesson': L2, 'module': 2}}},
    'method-draw': {'lesson': L1, 'module': 3},
    'now-143': {'lesson': L1, 'module': 3, 'items': {'1': {'lesson': L1, 'module': 3}, '2': {'lesson': L2, 'module': 3}}},
    'act-2': {'lesson': L2, 'module': 1}, 'know-equal': {'lesson': L2, 'module': 2}, 'method-equal': {'lesson': L2, 'module': 3},
    'act-3': {'lesson': L3, 'module': 1}, 'act-4': {'lesson': L3, 'module': 1},
    'know-mid': {'lesson': L3, 'module': 2}, 'know-dist': {'lesson': L3, 'module': 2},
    'method-proof': {'lesson': L4, 'module': 3}, 'method-unknown': {'lesson': L4, 'module': 3},
    'now-145': {'lesson': L4, 'module': 3},
    'qcm': {'lesson': L5, 'module': 2, 'duplicatedIn': [{'lesson': L1, 'module': 5, 'note': 'item 1 dans le إختبار'}, {'lesson': L3, 'module': 5, 'note': 'items 2–5'}]},
    'situation': {'lesson': L5, 'module': 1, 'duplicatedIn': [{'lesson': L5, 'module': 4, 'note': 'transposée : autres demi-cercles / autre ligne brisée'}]},
}
for n in (1, 2, 3, 4, 5):
    DEST[f'ex-{n}'] = {'lesson': L1, 'module': 4}
for n in (6, 7, 8, 9, 12, 14):
    DEST[f'ex-{n}'] = {'lesson': L2, 'module': 4}
for n in (10, 11, 15, 16, 17, 20):
    DEST[f'ex-{n}'] = {'lesson': L3, 'module': 4}
for n in (13, 18, 19, 21, 24, 26, 27):
    DEST[f'ex-{n}'] = {'lesson': L4, 'module': 4}
for n in (22, 23, 25):
    DEST[f'ex-{n}'] = {'lesson': L5, 'module': 3}

ids = [e['id'] for e in E]
assert len(ids) == len(set(ids)), ids
missing = [i for i in ids if i not in DEST]
assert not missing, missing
extra = [k for k in DEST if k != '_comment' and k not in ids]
assert not extra, extra
assert sorted(int(i[3:]) for i in ids if i.startswith('ex-')) == list(range(1, 28))
per = {}
for k, d in DEST.items():
    if k.startswith('ex-'):
        per[d['lesson']] = per.get(d['lesson'], 0) + 1
assert per == {L1: 5, L2: 6, L3: 6, L4: 7, L5: 3}, per
for e in E:                                   # chaque page citée appartient à l'unité
    assert 139 <= e['page'] <= 149, e['id']

NOTES = {
    'destinationRationale': {
        'challenge': 'Le تحدّ (AB exacte entre A(2/3 ; −2) et B(−4 ; 7/3)) est mot pour mot la compétence de ' + L3 + ' (distance) avec les fractions comme obstacle : il entre là (déclaré `duplicatedIn`), la page d’unité le montre sans réponse.',
        'know-3': 'Bloc 3 des معارف p. 142 : أ) lecture graphique (marche « +7 puis +3 ») → ' + L1 + ' ; ب) propriété $x_B - x_A$ , $y_B - y_A$ → ' + L2 + '. Ses suites p. 144 sont des éléments séparés (know-origin → L1, know-equal → L2, know-mid / know-dist → L3).',
        'prep': 'Item 1 (lire des coordonnées, puis milieu et distance « naïfs ») et item 2 (axes) → L1 ; items 3, 4, 6 (parallélogramme ⇔ vecteurs égaux, unité 11) → L2 (égalité, 4e sommet) ; item 5 (milieu ⇔ MJ = JN) → L3 (preuve vectorielle de la formule du milieu, نشاط 3).',
        'method-unknown': 'Titré « حساب مسافات » mais c’est une perpendicularité par la réciproque de Pythagore avec une inconnue → ' + L4 + ' (nature d’un triangle), pas ' + L3 + '.',
        'now-145': 'Item 1 (ABCD carré) et item 2 (O sur le cercle de diamètre [AB]) sont les deux preuves types de ' + L4 + ' (quadrilatère ; appartenance à un cercle).',
        'exercises': 'Sections du manuel : 1–5 (إحداثيتا نقطة - مركبتا شعاع) → L1 ; 6–9 (مركبتا شعاع علمت إحداثيات مبدئه ونهايته) + 12, 14 (4e sommet d’un parallélogramme) → L2 ; 10, 11, 15, 16, 17, 20 (milieu, distance, cercle simple) → L3 ; 13, 18, 19, 21, 24, 26, 27 (nature de triangles / quadrilatères, perpendicularité) → L4 ; 22 (cercle + angles par la tangente, unité 10), 23 (somme, rectangle, aire, translation) et 25 (BEM) → synthèse.',
        'balance': 'L1 5 (+ act-1, know-1/2/origin, know-3 أ, method-draw, now-143 #1, QCM 1) · L2 6 (+ act-2, know-3 ب, know-equal, method-equal, now-143 #2) · L3 6 (+ act-3, act-4, know-mid, know-dist, تحدّ, QCM 2–5) · L4 7 (+ method-proof, method-unknown, now-145) · L5 3 (+ وضعية, QCM). L1 n’atteint que 5 : la seule autre candidate (ex-7 « OA, OB ») exige d’abord AB = (x_B − x_A ; y_B − y_A), compétence de L2 ; la banque de pratique de L1 complète.',
    },
    'labAdvancedLevel': {
        L1: ['act-1 (marche A → C → B « +8 puis −2 » sur le quadrillage, puis BD vers D(3 ; −2) HORS figure, puis OA…OD ⇒ règle « OM = coordonnées de M »)', 'ex-3 (symétriques par rapport à O et aux axes, puis F tel que $\\overrightarrow{FB}\\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}$ : composantes à l’envers)'],
        L2: ['act-2 (C, D lus, E par $\\overrightarrow{DE}\\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}$ , F(6 ; 5) et DE = CF : égalité par les composantes)', 'ex-12 (D par AB + AC = AD, ABDC parallélogramme — piège de l’ordre ABCD croisé)'],
        L3: ['act-4 (KLM sur quadrillage rectangle en M, puis la formule générale par Pythagore et retour sur KL = 5)', 'challenge (distance exacte avec fractions : √365 / 3)'],
        L4: ['method-unknown (C(−2 ; y) qui glisse sur sa droite : y = −4 rend (AB) ⊥ (BC))', 'ex-18 (cercle de diamètre [AC], B dessus, (BI) ⊥ (AC) par le triangle isocèle)'],
        L5: ['situation (trois demi-cercles 3π ≈ 9,42 km contre la ligne brisée √13 + √5 + √17 ≈ 9,96 km)', 'ex-23 (rectangle par la règle du parallélogramme, aire 26 cm², image par translation)'],
    },
}

OUT = {
    '_comment': 'EXTRACTION CANONIQUE du manuel scolaire officiel — 4AM, الجيل الثاني, unité 12 « الأشعة في معلم ». Générée par build-extraction.py (ne pas éditer à la main).',
    'unitCode': 'ashia-maalam',
    'textbook': {'title': 'كتاب الرياضيات — السنة الرابعة من التعليم المتوسط', 'generation': 'الجيل الثاني', 'unitNumber': 12,
                 'unitTitle': 'الأشعة في معلم', 'chapter': 'handasa', 'pages': {'first': 139, 'last': 149}, 'pdfPageOffset': 138,
                 'sections': ['سأتعلّم في هذا الباب', 'تحدّ', 'أستعدّ', 'أنشطة', 'معارف', 'طرائق', 'دوري الآن', 'أوظّف تعلّماتي', 'أؤكّد تعلّماتي', 'أدمج تعلّماتي', 'أتعمّق']},
    'frozenAt': '2026-10-04',
    'scope': 'Unité complète, 11 pages : pas de page « أوظّف تكنولوجيات الإعلام والاتصال » (contrairement à l’unité 11).',
    'terminology': {'note': 'Le manuel écrit « مَعلم متعامد ومتجانس » (repère orthonormé), « إحداثيتا نقطة » (coordonnées), « فاصلة / ترتيب » (abscisse / ordonnée), « مركّبتا شعاع » (composantes, écrites en COLONNE $\\overrightarrow{AB}\\begin{pmatrix} x \\\\ y \\end{pmatrix}$), « المنتصف », « المسافة بين نقطتين », « القيمة المضبوطة » (valeur exacte), « محور الفواصل / محور التراتيب ». Un point s’écrit $A(x\\,;\\,y)$ avec point-virgule, abscisse d’abord, de gauche à droite même dans la phrase arabe.',
                    'terms': ['مَعلم متعامد ومتجانس', 'معلم متعامد', 'معلم متجانس', 'معلم كيفي', 'إحداثيتا نقطة', 'مركّبتا شعاع', 'منتصف قطعة', 'المسافة بين نقطتين', 'القيمة المضبوطة', 'محور الفواصل', 'محور التراتيب']},
    'notes': NOTES,
    'elements': E,
    'discrepancies': DISC,
    'destinations': DEST,
}
Path(__file__).with_name('extraction.json').write_text(json.dumps(OUT, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{len(E)} éléments, {len(DISC)} écarts, {len(DEST) - 1} destinations')
