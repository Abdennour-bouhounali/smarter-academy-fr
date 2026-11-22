#!/usr/bin/env python3
"""Génère docs/sources/4am/unit13/extraction.json — unité 13 « الدوران - الزوايا - المضلّعات المنتظمة » (pp. 151–161).

Transcription VISUELLE du scan (« وحدة الدوران - الزوايا - الأضلاع المنتظمة.pdf », 11 pages CamScanner, sans couche
texte, page PDF N = page du manuel 150 + N — numéros imprimés relus en bas de page : 151 … 161), pages rendues à
300 dpi puis découpées passage par passage (≤ 1400 px).

Le texte arabe est celui du manuel, au mot près ; les passages illisibles sont complétés et marqués
`reading: 'completed'` (+ un écart `completion`). Les réponses ne viennent PAS du manuel : elles sont CALCULÉES ici
(`answerSource: computed`) — images par rotation (exactes sur quadrillage pour 90° / 180°, sinon cos / sin avec
tolérance), angle inscrit = moitié de l'angle au centre, angle au centre d'un n-gone régulier 360°/n, angle intérieur
(n − 2)·180°/n, côté 2r·sin(180°/n) (exact par sympy quand c'est possible) — et re-vérifiées par assert. Les figures
sont décrites ET données en coordonnées (`figure.points`, cercles centre + rayon, angles en degrés) cohérentes avec
chaque réponse calculée, pour être redessinées par GeoFigure.

Usage : python3 docs/sources/4am/unit13/build-extraction.py
"""
import json
import math
from pathlib import Path

import sympy as sp

TOL = 1e-9


# ── Géométrie (flottants contrôlés + exact sympy) ────────────────────────────
def rot(p, c, deg, direct=True):
    """Image de p par la rotation de centre c, d'angle deg, sens direct (anti-horaire) ou indirect (horaire)."""
    a = math.radians(deg if direct else -deg)
    x, y = p[0] - c[0], p[1] - c[1]
    return (c[0] + x * math.cos(a) - y * math.sin(a), c[1] + x * math.sin(a) + y * math.cos(a))


def rot_exact(p, c, deg, direct=True):
    """Version exacte (sympy) — renvoie des expressions simplifiées."""
    a = sp.rad(deg if direct else -deg)
    x, y = sp.nsimplify(p[0]) - sp.nsimplify(c[0]), sp.nsimplify(p[1]) - sp.nsimplify(c[1])
    return (sp.simplify(sp.nsimplify(c[0]) + x * sp.cos(a) - y * sp.sin(a)), sp.simplify(sp.nsimplify(c[1]) + x * sp.sin(a) + y * sp.cos(a)))


def d(a, b):
    return math.hypot(b[0] - a[0], b[1] - a[1])


def ang(a, o, b):
    """Mesure (degrés, 0–180) de l'angle géométrique aOb."""
    u = (a[0] - o[0], a[1] - o[1])
    v = (b[0] - o[0], b[1] - o[1])
    c = (u[0] * v[0] + u[1] * v[1]) / (math.hypot(*u) * math.hypot(*v))
    return math.degrees(math.acos(max(-1.0, min(1.0, c))))


def oriented(a, o, b):
    """Angle orienté de [Oa) vers [Ob) en degrés, dans ]−180 ; 180] (positif = sens direct)."""
    a1 = math.atan2(a[1] - o[1], a[0] - o[0])
    b1 = math.atan2(b[1] - o[1], b[0] - o[0])
    r = math.degrees(b1 - a1)
    while r <= -180:
        r += 360
    while r > 180:
        r -= 360
    return r


def on_circle(p, c, r, tol=1e-9):
    return abs(d(p, c) - r) < tol


def polar(c, r, deg):
    return (c[0] + r * math.cos(math.radians(deg)), c[1] + r * math.sin(math.radians(deg)))


def close(a, b, tol=1e-9):
    if isinstance(a, tuple):
        return all(abs(x - y) < tol for x, y in zip(a, b))
    return abs(a - b) < tol


def rnd(x, nd=4):
    """Nombre pour GeoFigure : entier si entier, sinon arrondi à nd décimales."""
    if abs(x - round(x)) < 1e-9:
        return int(round(x))
    return round(x, nd)


def pts(**kw):
    """Coordonnées GeoFigure : {nom: [x, y]} ; un `_` dans le nom devient ′ (A_ → A')."""
    return {k.replace('_', "'"): [rnd(x), rnd(y)] for k, (x, y) in kw.items()}


def dec(x, nd=2):
    """Écriture décimale à virgule (LaTeX {,})."""
    s = f'{x:.{nd}f}'
    return s.replace('.', '{,}')


def central(n):
    return 360 / n


def interior(n):
    return (n - 2) * 180 / n


def side_exact(n, r=1):
    """Côté du n-gone régulier inscrit dans un cercle de rayon r : 2r·sin(π/n) (exact sympy)."""
    return sp.nsimplify(sp.simplify(2 * sp.nsimplify(r) * sp.sin(sp.pi / n)))


def apothem_exact(n, r=1):
    return sp.nsimplify(sp.simplify(sp.nsimplify(r) * sp.cos(sp.pi / n)))


# sanity of helpers
assert side_exact(6, 1) == 1 and side_exact(4, 1) == sp.sqrt(2) and side_exact(3, 1) == sp.sqrt(3)
assert central(5) == 72 and interior(6) == 120 and close(interior(5), 108)
assert close(rot((1, 0), (0, 0), 90), (0, 1)) and close(rot((1, 0), (0, 0), 90, direct=False), (0, -1))

E = []
DISC = []

# ══ Page 151 — ouverture, تحدّ, أستعدّ ═══════════════════════════════════════
E.append({
    'id': 'objectives', 'kind': 'objectives', 'page': 151, 'section': 'سأتعلّم في هذا الباب', 'verified': True,
    'items': [
        'إنشاء صورة كل من: نقطة، قطعة مستقيم، مستقيم، نصف مستقيم و دائرة بدوران.',
        'معرفة خواص الدوران و توظيفها.',
        'التعرّف على الزاوية المركزية و الزاوية المحيطية.',
        'معرفة العلاقة بين الزاوية المحيطية و الزاوية المركزية اللتين تحصران نفس القوس و استعمالها.',
        'إنشاء مضلعات منتظمة (مثلث متقايس الأضلاع، مربع، سداسي منتظم).',
    ],
})
E.append({
    'id': 'intro-nature', 'kind': 'aside', 'page': 151, 'section': 'مدخل الباب', 'title': 'نجمة البحر', 'verified': True,
    'text': 'مصادفة الدقة الرياضياتية و البساطة الهندسية ليست محصورة فقط في أذهان الرياضياتيين و الكتب العلمية، إنها متواجدة في محيطنا أو هي مخفية في أركان الطبيعة. يمكن القول إنّ المثلثات و المربعات و الخماسيات ليست الوحيدة المتواجدة في الطبيعة. بالنسبة إلى المثلث المتقايس الأضلاع، يمكن مصادفة هذا الشكل في الطحالب المجهرية المتواجدة في مياه المحيطات و البحار، بينما المربع، فهو متواجد في العالم الجيولوجي و الكيمياوي مثل بلورات الملح المكعبة. يُعتبر الخماسي المنتظم شكلا نادرا جدا، و هذا الشكل يمكن تشكيله من رؤوس نجمة بحرية.',
    'caption': 'صورة: نجمة البحر (صورة في الكتاب — لا تُنسخ).',
    'note': 'Les cinq bras de l’étoile de mer = les sommets d’un pentagone régulier (rotation de 72° autour du centre) : entrée concrète commune aux leçons 1 (rotation) et 4 (polygones réguliers). « يمكن القول إنّ … ليست الوحيدة » est la phrase du manuel (logiquement maladroite, gardée).',
})

# تحدّ : étoile du drapeau algérien (pentagramme régulier). « المسافة بين كل رأسين متتاليين … 10cm ».
# Lecture retenue : les 5 pointes (sommets extérieurs) sont sur un cercle et forment un pentagone régulier de côté 10 cm.
s_star = 10
R_star = s_star / (2 * math.sin(math.radians(36)))           # côté = 2R·sin(180°/5)
R_exact = sp.nsimplify(5 / sp.sin(sp.pi / 5))
assert close(R_star, float(R_exact)) and close(R_star, 8.506508083520399)
phi = (1 + math.sqrt(5)) / 2
chord_star = s_star * phi                                     # branche de l'étoile (diagonale du pentagone)
tips = [polar((0, 0), R_star, 90 + 72 * k) for k in range(5)]
assert all(close(d(tips[k], tips[(k + 1) % 5]), 10) for k in range(5))
assert close(d(tips[0], tips[2]), chord_star) and close(chord_star, 16.18033988749895)
# sommets intérieurs du pentagramme (intersection des branches) : rayon r_in = R·cos72°/cos36°
r_in = R_star * math.cos(math.radians(72)) / math.cos(math.radians(36))
inner = [polar((0, 0), r_in, 90 + 36 + 72 * k) for k in range(5)]
tip_to_inner = d(tips[0], inner[0])
assert close(tip_to_inner, s_star / phi) and close(2 * tip_to_inner + d(inner[0], inner[1]), chord_star)
# lecture alternative : 10 cm entre une pointe et le sommet intérieur voisin (contour à 10 côtés)
R_alt = R_star * 10 / tip_to_inner
assert close(R_alt, R_star * phi)
E.append({
    'id': 'challenge', 'kind': 'challenge', 'page': 151, 'section': 'تحدّ', 'verified': True,
    'text': 'أنشئ على ورق غير مرصوف تصميما لنجمة العلم الجزائري بحيث تكون المسافة بين كل رأسين متتاليين من هذه النجمة تساوي 10cm.',
    'figure': {
        'description': 'صورة العلم الجزائري (نصفه الأيمن أبيض، الأيسر أخضر، هلال ونجمة خماسية حمراوان في الوسط). لا رسم هندسي.',
        'model': True,
        'construction': {'circle': {'center': 'O', 'radius': rnd(R_star)}, 'tipsDeg': [90 + 72 * k for k in range(5)],
                         'points': pts(O=(0, 0), A=tips[0], B=tips[1], C=tips[2], D=tips[3], E=tips[4]),
                         'starOrder': ['A', 'C', 'E', 'B', 'D'], 'innerVertices': pts(**{f'I{k + 1}': inner[k] for k in range(5)})},
        'reading': 'Pas de figure géométrique dans le manuel (photo du drapeau). La construction est celle de la plateforme : pointes A…E sur le cercle de centre O, à 90° + 72°k (pointe A en haut), étoile tracée A → C → E → B → D → A.',
    },
    'answer': {
        'idea': 'رؤوس النجمة الخمسة تقع على دائرة مركزها O وهي رؤوس خماسي منتظم: كل رأس صورة الرأس السابق بالدوران الذي مركزه O وزاويته $72^\\circ$ ($\\dfrac{360^\\circ}{5}$).',
        'radius': f'ضلع الخماسي $= 2R\\sin 36^\\circ = 10$ إذن $R = \\dfrac{{5}}{{\\sin 36^\\circ}} \\approx {dec(R_star)}$ cm',
        'construction': ['نرسم دائرة مركزها O ونصف قطرها حوالي 8,51 cm.', 'نعيّن عليها نقطة A ثم ننشئ بالمنقلة الزوايا المركزية $\\widehat{AOB} = \\widehat{BOC} = \\widehat{COD} = \\widehat{DOE} = 72^\\circ$ .', 'نتحقّق بالمدور أنّ AB = BC = CD = DE = EA = 10 cm.', 'نرسم النجمة بوصل كل رأس بالرأس الذي يليه بعد رأس: [AC]، [CE]، [EB]، [BD]، [DA].'],
        'starBranch': f'طول كل فرع [AC] من النجمة $= 10 \\times \\dfrac{{1 + \\sqrt{{5}}}}{{2}} \\approx {dec(chord_star)}$ cm (قطر الخماسي)',
        'alternative': f'إذا فُهمت « رأسان متتاليان » على محيط النجمة (رأس خارجي ورأس داخلي متجاوران، 10 أضلاع): نصف قطر الدائرة $\\approx {dec(R_alt)}$ cm.',
    },
    'answerSource': 'computed',
    'note': 'Sans papier quadrillé : seuls règle, compas et rapporteur (72°) — la rotation est l’outil. Le rayon exact $\\dfrac{5}{\\sin 36^\\circ}$ n’est pas du niveau 4AM : la construction attendue part de 72° au rapporteur et ajuste le rayon (ou part d’un côté de 10 cm et construit les angles intérieurs de 108°).',
})
DISC.append({'elementId': 'challenge', 'kind': 'reading', 'resolution': 'decided — the five tips form a regular pentagon of side 10 cm (R ≈ 8,51 cm); alternative reading given in answer.alternative',
             'text': '« المسافة بين كل رأسين متتاليين من هذه النجمة » est ambigu : une étoile à cinq branches a 5 pointes et 5 sommets rentrants. Lecture retenue : les 5 pointes consécutives (pentagone régulier de côté 10 cm, R = 5 / sin 36° ≈ 8,51 cm). Si l’on compte les 10 sommets du contour, pointe–sommet rentrant = 10 cm donne R ≈ 13,76 cm (assert).'})

# أستعدّ
p1 = {'A': (0, 0), 'B': (2, 2 * math.sqrt(3)), 'C': (-2, 2 * math.sqrt(3))}
assert close(ang(p1['A'], p1['C'], p1['B']), 60) and close(ang(p1['C'], p1['B'], p1['A']), 60) and close(ang(p1['B'], p1['A'], p1['C']), 60)
p2 = {'A': (0, 2), 'B': (-2, 0), 'C': (2, 0)}
assert close(ang(p2['B'], p2['A'], p2['C']), 90) and close(d(p2['A'], p2['B']), d(p2['A'], p2['C'])) and not close(d(p2['B'], p2['C']), d(p2['A'], p2['B']))
p3 = {'O': (0, 0), 'x': (-3, 0), 'z': (3, 0), 'y': polar((0, 0), 3, 35)}
assert close(ang(p3['x'], p3['O'], p3['y']), 145) and close(ang(p3['z'], p3['O'], p3['y']), 35)
p4 = {k: polar((0, 0), 2, a) for k, a in (('D', 100), ('C', 30), ('B', -60), ('A', 200))}
p5 = {'O': (0, 0), 'N': polar((0, 0), 2, 25), 'P': polar((0, 0), 2, 205), 'M': polar((0, 0), 2, 115)}
assert close(ang(p5['P'], p5['M'], p5['N']), 90) and close(ang(p5['M'], p5['O'], p5['N']), 90) and not on_circle(p5['O'], (0, 0), 2)
E.append({
    'id': 'prep', 'kind': 'prep', 'page': 151, 'section': 'أستعدّ', 'verified': True,
    'instruction': 'أصحيح أم خاطئ؟ برّر إجابتك.',
    'items': [
        {'number': 1, 'text': 'المثلث ABC المقابل متقايس الأضلاع.', 'answer': True,
         'justification': '$\\widehat{ACB} = \\widehat{ABC} = 60^\\circ$ إذن $\\widehat{BAC} = 180^\\circ - 60^\\circ - 60^\\circ = 60^\\circ$ : الزوايا الثلاث متقايسة.',
         'figure': {'description': 'مثلث رأسه A في الأسفل و [CB] أفقي في الأعلى (C على اليسار) ؛ الزاويتان في C و B مظلّلتان ومكتوب 60° في كل منهما.',
                    'points': pts(**p1), 'angles': [{'vertex': 'C', 'from': 'A', 'to': 'B', 'deg': 60, 'label': '60°'}, {'vertex': 'B', 'from': 'C', 'to': 'A', 'deg': 60, 'label': '60°'}]}},
        {'number': 2, 'text': 'المثلث ABC المقابل متقايس الأضلاع.', 'answer': False,
         'justification': 'المثلث قائم في A (رمز الزاوية القائمة) ومتساوي الساقين (AB = AC، علامتا الترميز) : $BC = AB\\sqrt{2} \\neq AB$ .',
         'figure': {'description': 'مثلث رأسه A في الأعلى (رمز زاوية قائمة) و [BC] أفقي في الأسفل ؛ علامة ترميز واحدة على [AB] وعلى [AC].',
                    'points': pts(**p2), 'rightAngles': ['A'], 'ticks': {'AB': 1, 'AC': 1}}},
        {'number': 3, 'text': 'في الشكل المقابل، قيس الزاوية $\\widehat{zOy}$ هو $55^\\circ$ .', 'answer': False,
         'justification': 'x، O، z في استقامية: $\\widehat{zOy} = 180^\\circ - 145^\\circ = 35^\\circ$ (الزاويتان متكاملتان) لا $55^\\circ$ .',
         'figure': {'description': 'مستقيم أفقي [x z] (x على اليسار) يمر بـ O ونصف مستقيم [Oy) نحو أعلى اليمين ؛ قوس مظلّل كبير في O مكتوب عليه 145° (الزاوية xOy).',
                    'points': pts(**p3), 'angles': [{'vertex': 'O', 'from': 'y', 'to': 'x', 'deg': 145, 'label': '145°'}],
                    'reading': '145° est écrit au-dessus de l’arc ombré côté x (angle obtus) ; y est tracé à 35° au-dessus de [Oz).'}},
        {'number': 4, 'text': 'في الشكل المقابل', 'statements': [
            {'text': '(E) هي الدّائرة المحيطة بالمثلث ABD.', 'answer': True, 'justification': 'الرؤوس A، B، D تنتمي إلى (E).'},
            {'text': '(E) هي الدّائرة المحيطة بالمثلث BCD.', 'answer': True, 'justification': 'الرؤوس B، C، D تنتمي إلى (E) : لدائرة واحدة تمرّ بالنقط الأربع.'}],
         'figure': {'description': 'دائرة (E) عليها D (أعلى)، C (أعلى اليمين)، B (أسفل اليمين)، A (يسار) ؛ القطع [DA]، [DB]، [CB] بالأسود و [DC]، [AB] بالرمادي.',
                    'circles': [{'center': [0, 0], 'radius': 2, 'label': '(E)'}], 'points': pts(**p4), 'segments': ['DA', 'DB', 'CB', 'DC', 'AB'],
                    'reading': 'Positions angulaires lues sur le dessin (≈ 100°, 30°, −60°, 200°) ; seules comptent les appartenances au cercle.'}},
        {'number': 5, 'text': 'في الشكل المقابل', 'statements': [
            {'text': '(E) هي الدّائرة المحيطة بالمثلث MNP.', 'answer': True, 'justification': 'M، N، P تنتمي إلى (E) (والمثلث قائم في M: [PN] قطر).'},
            {'text': '(E) هي الدّائرة المحيطة بالمثلث ONM.', 'answer': False, 'justification': 'O مركز (E) فهي لا تنتمي إليها ($OM = ON = r$ و $OO = 0$) : الدائرة المحيطة بـ ONM مركزها منتصف [MN].'}],
         'figure': {'description': 'دائرة (E) مركزها O ؛ القطر [PN] مائل (P أسفل اليسار، N أعلى اليمين) ؛ M على الدائرة في الأعلى ؛ [MP] و [MN] ورمز زاوية قائمة في M ؛ [MO] عمودي على [PN] (رمز زاوية قائمة في O).',
                    'circles': [{'center': [0, 0], 'radius': 2, 'label': '(E)'}], 'points': pts(**p5), 'segments': ['MP', 'MN', 'PN', 'MO'], 'rightAngles': ['M', 'O']}},
    ],
    'note': 'Items 4 et 5 : deux affirmations chacun, en tableau à côté de la figure, jugées séparément. Les prérequis testés : angles d’un triangle (1, 2 → polygones réguliers), angles supplémentaires (3 → angles inscrits / rotation), cercle circonscrit (4, 5 → angle inscrit, polygone inscrit).',
})

# >>> PAGE 152
# ══ Page 152 — أنشطة 1–3 ════════════════════════════════════════════════════
# نشاط 1 : quadrillage, O origine. (F) : A(−1;3), B(−1;6), C(−4;6) + demi-cercle de diamètre [CB] au-dessus.
F_ = {'A': (-1, 3), 'B': (-1, 6), 'C': (-4, 6)}
F1 = {k + '1': (-x, y) for k, (x, y) in F_.items()}                    # symétrie d'axe (Oy) (droite x = 0)
Fp = {k + "'": (y, x) for k, (x, y) in F1.items() for k in [k[0]]}     # symétrie d'axe y = x
assert F1 == {'A1': (1, 3), 'B1': (1, 6), 'C1': (4, 6)} and Fp == {"A'": (3, 1), "B'": (6, 1), "C'": (6, 4)}
for k in 'ABC':                                                        # composée = rotation de centre O, 90°, sens horaire
    assert close(rot(F_[k], (0, 0), 90, direct=False), Fp[k + "'"])
    assert d(F_[k], (0, 0)) == d(Fp[k + "'"], (0, 0)) and close(ang(F_[k], (0, 0), Fp[k + "'"]), 90)
    assert rot_exact(F_[k], (0, 0), 90, direct=False) == tuple(sp.Integer(v) for v in Fp[k + "'"])
arcF = {'center': [-2.5, 6], 'radius': 1.5, 'from': 'C', 'to': 'B', 'side': 'up'}
arcFp = {'center': [6, 2.5], 'radius': 1.5, 'from': "C'", 'to': "B'", 'side': 'right'}
assert close(rot((-2.5, 6), (0, 0), 90, direct=False), (6, 2.5))
E.append({
    'id': 'act-1', 'kind': 'activity', 'number': 1, 'page': 152, 'section': 'أنشطة', 'title': 'مقاربة تجريبية للدوران', 'verified': True,
    'intro': 'لاحظ الأشكال (F)، $(F_1)$ ، (F′) المقابلة.',
    'parts': [
        {'label': '1)', 'text': 'أ) كيف نحصل على الشّكل $(F_1)$ انطلاقا من الشّكل (F)؟ ب) كيف نحصل على الشّكل (F′) انطلاقا من الشّكل $(F_1)$ ؟ جـ) هل يمكن رسم الشّكل (F′) انطلاقا من الشّكل (F) بطريقة مماثلة لما وجدت في الجزأين أ) و ب)؟ اشرح.'},
        {'label': '2)', 'text': 'انقل الشّكل (F) والنقطة O على ورق شفاف، ثمّ ثبّته بوضع إبرة المدور على النقطة O، ودوّر الورق الشفاف في اتجاه حركة عقارب الساعة حتى ينطبق الشّكل (F) على الشّكل (F′). • على أيّ نقطة تنطبق النقطة A؟ والنقطة B؟ والنقطة C؟ نقول إنّ النقطة A′ هي صورة النقطة A بالدوران الذي مركزه O وزاويته $\\widehat{AOA\'}$ . • قارن بين كل طولين: OA و OA′، OB و OB′، OC و OC′. • تحقّق من أنّ $\\widehat{AOA\'} = \\widehat{BOB\'} = \\widehat{COC\'}$ . انقل ما يلي وأتمم: «نتحصّل على الشّكل (F′) انطلاقا من الشّكل (F) بـ … مركزه النقطة … وزاويته …»'},
    ],
    'figure': {
        'description': 'ورقة مرصوفة ؛ ثلاثة أشكال متقايسة على شكل «مخروط مثلّج»: مثلث قائم ونصف دائرة قطرها الضلع الأفقي. (F) في أعلى اليسار (A أسفل، B أعلى A، C على يسار B، نصف الدائرة فوق [CB]) ؛ $(F_1)$ على يمينه (نظيره بالنسبة إلى الشاقولي المار بـ O) ؛ (F′) في أسفل اليمين (A′ يسار، B′ يمين على نفس السطر، C′ فوق B′، نصف الدائرة على يمين [B′C′]) ؛ النقطة O (×) في الأسفل تحت A تقريبا.',
        'points': pts(O=(0, 0), **F_, **F1, **{k.replace("'", '_'): v for k, v in Fp.items()}),
        'segments': ['AB', 'AC', 'A1B1', 'A1C1', "A'B'", "A'C'"], 'arcs': [arcF, {'center': [2.5, 6], 'radius': 1.5, 'from': 'B1', 'to': 'C1', 'side': 'up'}, arcFp],
        'grid': {'unit': 1, 'xRange': [-5, 8], 'yRange': [-1, 8]},
        'reading': 'Lu à ≈ 49 px / carreau, O à l’origine : A (−1 ; 3), B (−1 ; 6), C (−4 ; 6) ; A1 (1 ; 3), B1 (1 ; 6), C1 (4 ; 6) ; A′ (3 ; 1), B′ (6 ; 1), C′ (6 ; 4). (F1) = symétrique de (F) par rapport à la verticale x = 0 ; (F′) = symétrique de (F1) par rapport à la droite y = x ; la composée est la rotation de centre O, 90°, sens HORAIRE (assert), cohérente avec « في اتجاه حركة عقارب الساعة ».',
    },
    'answer': {
        '1a': '$(F_1)$ نظير (F) بالنسبة إلى المستقيم الشاقولي المار بـ O (تناظر محوري).',
        '1b': '(F′) نظير $(F_1)$ بالنسبة إلى المستقيم المار بـ O والذي يصنع $45^\\circ$ مع الأفقي (منصّف الربع الأول).',
        '1c': 'لا يمكن بتناظر محوري واحد ولا بانسحاب: يلزم تناظران متتاليان (أو «تدوير» حول O).',
        '2points': 'A تنطبق على A′، B على B′، C على C′.',
        '2lengths': 'OA = OA′ = $\\sqrt{10}$ ، OB = OB′ = $\\sqrt{37}$ ، OC = OC′ = $\\sqrt{52} = 2\\sqrt{13}$ (وحدة: ضلع مربع).',
        '2angles': '$\\widehat{AOA\'} = \\widehat{BOB\'} = \\widehat{COC\'} = 90^\\circ$',
        'complete': 'نتحصّل على الشّكل (F′) انطلاقا من الشّكل (F) بـ الدوران الذي مركزه النقطة O وزاويته $90^\\circ$ في اتجاه حركة عقارب الساعة.',
    },
    'answerSource': 'computed',
    'note': 'L’angle de 90° n’est écrit nulle part : l’élève le mesure (ou le lit sur les carreaux). La composée de deux symétries d’axes sécants en O faisant 45° est la rotation de 90° — hors programme, mais c’est le ressort de la question 1 جـ).',
})

# نشاط 2 : construction de l'image de A, rotation de centre O, 70°, sens de la flèche (direct).
a2O, a2A = (0, 0), polar((0, 0), 2, 25)
a2Ap = rot(a2A, a2O, 70)
assert close(d(a2O, a2Ap), 2) and close(oriented(a2A, a2O, a2Ap), 70) and close(a2Ap, polar((0, 0), 2, 95))
E.append({
    'id': 'act-2', 'kind': 'activity', 'number': 2, 'page': 152, 'section': 'أنشطة', 'title': 'إنشاء صورة نقطة بدوران', 'verified': True,
    'intro': 'يعرض الشريط التالي مراحل إنشاء صورة نقطة A بالدوران مركزه O وزاويته $70^\\circ$ في اتجاه السّهم.',
    'strip': [
        {'step': 1, 'description': 'النقطتان O و A وسهم دائري أحمر في الاتجاه المعاكس لعقارب الساعة.'},
        {'step': 2, 'description': 'المدور: الإبرة في O والقلم في A ؛ نرسم الدائرة (𝒞) التي مركزها O وتشمل A.'},
        {'step': 3, 'description': 'المنقلة مركزها على O وتدريجتها 0 على [OA) ؛ نعلّم التدريجة $70^\\circ$ في اتجاه السهم (سهم من بطاقة « 70° » نحو المنقلة).'},
        {'step': 4, 'description': 'نرسم نصف المستقيم من O نحو العلامة ؛ يقطع (𝒞) في A′ ؛ الزاوية $\\widehat{AOA\'} = 70^\\circ$ مظلّلة.'},
    ],
    'parts': [
        {'label': '1)', 'text': 'صِفْ مراحل الإنشاء التي يعرضها الشريط أعلاه.'},
        {'label': '2)', 'text': 'نفذ البرنامج الذي وصَفته في السؤال 1).'},
        {'label': '3)', 'text': 'عيّن نقطة أخرى B تختلف عن O وA وأنشئ صورتها بهذا الدوران.'},
    ],
    'figure': {'description': 'شريط من أربع صور مرقّمة (1) إلى (4) من اليمين إلى اليسار (انظر `strip`).',
               'points': pts(O=a2O, A=a2A, A_=a2Ap), 'circles': [{'center': [0, 0], 'radius': 2, 'label': '(𝒞)'}],
               'angles': [{'vertex': 'O', 'from': 'A', 'to': "A'", 'deg': 70, 'label': '70°'}], 'direction': 'direct',
               'reading': 'A est dessinée à ≈ 25° au-dessus de l’horizontale de O, A′ à ≈ 95° ; rayon arbitraire 2. Le sens de la flèche rouge (vers le haut, à droite du cercle) est le sens direct.'},
    'answer': {
        '1': ['نرسم الدائرة (𝒞) التي مركزها O ونصف قطرها OA (المدور).', 'نضع مركز المنقلة على O وصفرها على [OA) ونعلّم $70^\\circ$ في اتجاه السهم (الاتجاه المباشر).', 'نرسم نصف المستقيم الذي مبدؤه O ويمرّ بالعلامة: يقطع (𝒞) في A′.', 'A′ تحقّق OA′ = OA و $\\widehat{AOA\'} = 70^\\circ$ .'],
        '3': 'نفس البرنامج مع الدائرة التي مركزها O وتشمل B: OB′ = OB و $\\widehat{BOB\'} = 70^\\circ$ في نفس الاتجاه.',
    },
    'answerSource': 'computed',
})

# نشاط 3 : rotation de centre O, 72°, sens direct.
R72 = lambda p, c=(0, 0): rot(p, c, 72)
s3A, s3B = (-3, 1.5), (1, 1.5)
s3Ap, s3Bp = R72(s3A), R72(s3B)
assert close(d(s3Ap, s3Bp), d(s3A, s3B)) and close(d(s3A, s3B), 4)
# ب) cas 1 : O ∈ (d)  — (d) passe par O, direction 18°
dA1 = polar((0, 0), 1, 198)
dA1p = R72(dA1)
assert close(oriented(dA1, (0, 0), dA1p), 72)
assert close(math.degrees(math.atan2(dA1p[1], dA1p[0])) % 180, (18 + 72) % 180)     # (d') passe par O et fait 72° avec (d)
# ب) cas 2 : O ∉ (d)
dA2, dB2 = (-2, 1), (0, 1.5)
dA2p, dB2p = R72(dA2), R72(dB2)
u = (dB2[0] - dA2[0], dB2[1] - dA2[1]); up = (dB2p[0] - dA2p[0], dB2p[1] - dA2p[1])
assert close(math.degrees(math.atan2(up[1], up[0])) - math.degrees(math.atan2(u[1], u[0])), 72)
# جـ) demi-droite [Ax)
hA, hB = (-2.5, 0), (-1, 0.5)
hAp, hBp = R72(hA), R72(hB)
assert close(d(hAp, hBp), d(hA, hB))
# د) cercle de centre W, rayon 2
cW = (-4.5, 3); cA = (-4.5, 5)
cWp, cAp = R72(cW), R72(cA)
assert close(d(cWp, cAp), 2)
E.append({
    'id': 'act-3', 'kind': 'activity', 'number': 3, 'page': 152, 'pages': '152–153', 'section': 'أنشطة', 'title': 'صور بعض الأشكال الهندسية بدوران', 'verified': True,
    'intro': 'في كل ما يلي، O مركز الدوران الذي زاويته $72^\\circ$ في الاتجاه المباشر. ننشئ صورة كل شكل من الأشكال الآتية :',
    'parts': [
        {'label': 'أ)', 'title': 'قطعة مستقيم', 'text': '[AB] قطعة مستقيم. أنشئ A′ و B′ صورتي A وB بهذا الدوران. ماهي صورة القطعة [AB] بهذا الدوران؟',
         'figure': {'description': 'قطعة [AB] أفقية ؛ O تحت B قليلا إلى اليسار ؛ سهم دائري (الاتجاه المباشر) على اليمين.', 'points': pts(O=(0, 0), A=s3A, B=s3B),
                    'reading': 'Positions relatives lues à ≈ 60 px / unité (A ≈ (−2,9 ; 1,5), B ≈ (0,9 ; 1,5)) arrondies.'},
         'answer': {'images': pts(A_=s3Ap, B_=s3Bp), 'image': 'صورة القطعة [AB] هي القطعة [A′B′] و A′B′ = AB = 4.'}},
        {'label': 'ب)', 'title': 'مستقيم', 'text': '(d) مستقيم و A نقطة من (d). الحالة الأولى: O تنتمي إلى (d). A تختلف عن O. أنشئ O′ و A′ صورتي O و A بهذا الدوران. استنتج صورة (d). الحالة الثانية: O لا تنتمي إلى (d). قالت غنيمة: «لإنشاء صورة (d)، يكفي إنشاء صورة نقطتين مختلفتين من (d) بهذا الدوران». هل توافقها؟ اشرح. A و B نقطتان مختلفتان من (d). A′ و B′ صورتا A و B بهذا الدوران على الترتيب. أنشئ A′ و B′ ثم صورة (d) بنفس الدوران.',
         'figures': [
             {'case': 1, 'page': 152, 'description': 'مستقيم (d) مائل قليلا يمرّ بـ A ثم O.', 'points': pts(O=(0, 0), A=dA1), 'lines': [{'through': ['A', 'O'], 'label': '(d)'}]},
             {'case': 2, 'page': 153, 'description': 'مستقيم (d) مائل عليه A و B ؛ O تحت المستقيم.', 'points': pts(O=(0, 0), A=dA2, B=dB2), 'lines': [{'through': ['A', 'B'], 'label': '(d)'}]},
         ],
         'answer': {'case1': 'O′ = O (المركز صورة نفسه)، فصورة (d) هي المستقيم (OA′) : يمرّ بـ O ويصنع $72^\\circ$ مع (d).',
                    'case1images': pts(A_=dA1p),
                    'case2': 'نعم: صورة مستقيم بدوران مستقيم، يكفي نقطتان مختلفتان ؛ صورة (d) هي المستقيم (A′B′) ($(d)$ و $(A\'B\')$ يصنعان زاوية $72^\\circ$).',
                    'case2images': pts(A_=dA2p, B_=dB2p)}},
        {'label': 'جـ)', 'title': 'نصف مستقيم', 'text': '[Ax) نصف مستقيم، أنشئ A′ و B′ صورتا A و B بنفس الدوران ثم استنتج صورة نصف مستقيم [Ax).',
         'figure': {'page': 153, 'description': 'نصف مستقيم [Ax) صاعد نحو اليمين، B عليه ؛ O تحته ؛ سهم الاتجاه المباشر.', 'points': pts(O=(0, 0), A=hA, B=hB), 'rays': [{'from': 'A', 'through': 'B', 'label': 'x'}]},
         'answer': {'images': pts(A_=hAp, B_=hBp), 'image': 'صورة [Ax) هي نصف المستقيم [A′B′) (مبدؤه A′ صورة المبدأ A).'}},
        {'label': 'د)', 'title': 'دائرة', 'text': '(𝒞) هي دائرة مركزها W و A نقطة من (𝒞). أنشئ W′ و A′ صورتي W و A بنفس الدوران. استنتج (𝒞′) صورة (𝒞) بهذا الدوران.',
         'figure': {'page': 153, 'description': 'دائرة (𝒞) مركزها W، A في أعلاها ؛ O خارجها أسفل اليمين ؛ سهم الاتجاه المباشر.', 'points': pts(O=(0, 0), W=cW, A=cA), 'circles': [{'center': [cW[0], cW[1]], 'radius': 2, 'label': '(𝒞)'}]},
         'answer': {'images': pts(W_=cWp, A_=cAp), 'image': '(𝒞′) هي الدائرة التي مركزها W′ ونصف قطرها W′A′ = WA (نفس نصف القطر).'}},
    ],
    'answerSource': 'computed',
    'reading': 'Images par rotation de 72° calculées en flottants (cos / sin, arrondi 4 décimales) ; seules les égalités de longueurs et l’angle de 72° entre (d) et son image sont assertés.',
    'note': 'Mise en page : la figure du cas 1 (A, O sur (d)) est en bas de la p. 152 ; en haut de la p. 153 la figure à côté de « الحالة الأولى » (A, B sur (d), O en dessous) illustre en fait le cas 2, et la figure suivante (étiquette x) la demi-droite [Ax) de جـ). « صورتا » (au lieu de « صورتي » après أنشئ) est la graphie du manuel.',
})
DISC.append({'elementId': 'act-3', 'kind': 'reading', 'resolution': 'decided — figures re-attached to their parts',
             'text': 'Haut de la p. 153 : la figure placée face à « الحالة الأولى: O تنتمي إلى (d) » montre O HORS de (d) (sous la droite, avec A et B dessus) — c’est la figure du cas 2 ; celle du cas 1 (A et O sur (d)) est en bas de la p. 152, et la figure suivante (droite terminée par « x ») est la demi-droite [Ax) de جـ). Chaque figure est rattachée à sa partie.'})

# ══ Page 153 — أنشطة 4–5 ════════════════════════════════════════════════════
c4 = (0, 0); r4 = 2
A4, B4 = polar(c4, r4, 130), polar(c4, r4, 30)
D4 = polar(c4, r4, 270)                                  # D sur le grand arc (hors de l'arc coloré AB)
assert close(ang(A4, c4, B4), 100) and close(ang(A4, D4, B4), 50)
D4d = (-A4[0], -A4[1])                                    # 1) [AD] diamètre
BAD = ang(B4, A4, D4d); ADB = ang(A4, D4d, B4); AOB = ang(A4, c4, B4)
assert close(2 * BAD + AOB, 180) and close(ADB + BAD, 90) and close(AOB, 2 * ADB)
for t in range(200, 360, 7):                              # 2) D quelconque sur le grand arc : la relation reste vraie
    Dq = polar(c4, r4, t)
    if 30 + 1 < t < 130 + 360 - 1 and not (30 <= t <= 130):
        assert close(ang(A4, Dq, B4), AOB / 2, 1e-7)
E.append({
    'id': 'act-4', 'kind': 'activity', 'number': 4, 'page': 153, 'section': 'أنشطة', 'title': 'الزاوية المركزية والزاوية المحيطية', 'verified': True,
    'intro': '(𝒞) هي دائرة مركزها النقطة O، A و B نقطتان من (𝒞). ارسم الزاوية $\\widehat{AOB}$ . ماذا تلاحظ بالنسبة إلى رأسها O؟ الزاوية $\\widehat{AOB}$ تسمى زاوية مركزية في الدائرة (𝒞). D نقطة من (𝒞) خارج القوس الملونة $\\overset{\\frown}{AB}$ . ارسم الزاوية $\\widehat{ADB}$ . ماذا تلاحظ بالنسبة إلى رأسها D؟ الزاوية $\\widehat{ADB}$ هي زاوية محيطية في (𝒞) التي تحصر القوس $\\overset{\\frown}{AB}$ و $\\widehat{AOB}$ زاوية مركزية في (𝒞) التي تحصر القوس $\\overset{\\frown}{AB}$ . نقول إنّ الزاوية المركزية $\\widehat{AOB}$ والزاوية المحيطية $\\widehat{ADB}$ تحصران نفس القوس.',
    'parts': [
        {'label': '1)', 'text': 'يقول مزيان: «إذا كان [AD] قطرًا في (𝒞)، فإنّ $\\widehat{AOB} = 2\\widehat{ADB}$ » هل هذا القول صحيح ؟ اشرح. أ) تحقق أنّ $2\\widehat{BAD} + \\widehat{AOB} = 180^\\circ$ وأنّ $\\widehat{ADB} + \\widehat{BAD} = 90^\\circ$ ب) استنتج قيمة $\\widehat{AOB}$ بدلالة $\\widehat{ADB}$ .'},
        {'label': '2)', 'text': 'تضيف زميلته هوارية: « تبقى هذه العلاقة صحيحة إذا كان [AD] و [BD] وتران كيفيان في (𝒞)». هل هي على صواب؟ برّر إجابتك.'},
    ],
    'figure': {'description': 'دائرة (𝒞) مركزها O ؛ A في أعلى اليسار و B على اليمين ؛ القوس الصغير $\\overset{\\frown}{AB}$ (العلوي) ملوّن بالأحمر. D غير مرسومة.',
               'circles': [{'center': [0, 0], 'radius': r4, 'label': '(𝒞)'}], 'points': pts(O=c4, A=A4, B=B4), 'arcs': [{'center': [0, 0], 'radius': r4, 'fromDeg': 30, 'toDeg': 130, 'color': 'red'}],
               'platformPoints': {'D': pts(D=D4)['D'], 'D_diameter': pts(D=D4d)['D']},
               'reading': 'A ≈ 130°, B ≈ 30° lus sur le dessin (≈ 85 px de rayon) : angle au centre 100°. D (à placer par l’élève) : la plateforme propose D à 270° (angle inscrit 50°) et, pour 1), D diamétralement opposé à A (310°).'},
    'answer': {
        'O': 'رأس الزاوية $\\widehat{AOB}$ هو مركز الدائرة.', 'D': 'رأس الزاوية $\\widehat{ADB}$ نقطة من الدائرة وضلعاها وتران [DA] و [DB].',
        '1a': 'OA = OB (نصفا قطر) فالمثلث AOB متساوي الساقين: $\\widehat{OAB} = \\widehat{OBA} = \\widehat{BAD}$ (O ∈ [AD]) ومجموع زواياه $2\\widehat{BAD} + \\widehat{AOB} = 180^\\circ$ . المثلث ABD قائم في B ([AD] قطر و B على الدائرة) إذن $\\widehat{ADB} + \\widehat{BAD} = 90^\\circ$ .',
        '1b': '$\\widehat{AOB} = 180^\\circ - 2\\widehat{BAD} = 180^\\circ - 2(90^\\circ - \\widehat{ADB}) = 2\\widehat{ADB}$ : قول مزيان صحيح.',
        '2': 'نعم: نرسم القطر [DD₁] ونطبّق الحالة 1) على $\\widehat{AOD_1}$ و $\\widehat{D_1OB}$ ثم نجمع (أو نطرح) ؛ مثال الشكل: $\\widehat{AOB} = 100^\\circ$ و $\\widehat{ADB} = 50^\\circ$ .',
    },
    'answerSource': 'computed',
    'note': '« القوس الملونة » (accord féminin du manuel). La justification générale de 2) (cas où O est à l’intérieur / à l’extérieur de l’angle) dépasse ce que demande la question ; la leçon peut se contenter de la vérification sur figure dynamique (D glisse sur le grand arc).',
})

c5 = (0, 0); r5 = 2
M5, N5, P5 = polar(c5, r5, 90), polar(c5, r5, 210), polar(c5, r5, 330)
assert all(close(d(a, b), r5 * math.sqrt(3)) for a, b in ((M5, N5), (N5, P5), (P5, M5)))
assert close(ang(N5, c5, P5), 120) and close(ang(N5, M5, P5), 60) and close(ang(N5, c5, P5), 2 * ang(N5, M5, P5))
assert close(rot(P5, c5, 120), M5) and close(rot(M5, c5, 120), N5) and close(rot(N5, c5, 120), P5)
E.append({
    'id': 'act-5', 'kind': 'activity', 'number': 5, 'page': 153, 'section': 'أنشطة', 'title': 'المضلعات المنتظمة', 'verified': True,
    'intro': '• المثلث المتقايس الأضلاع: انقل المثلث متقايس الأضلاع MPN والدائرة المحيطة به.',
    'parts': [
        {'label': 'أ)', 'text': 'ارسم الزاوية المركزية التي تحصر مع الزاوية $\\widehat{NMP}$ نفس القوس، وعيّن قيسها.'},
        {'label': 'ب)', 'text': 'أعد نفس العمل مع كل من الزاويتين $\\widehat{MNP}$ و $\\widehat{MPN}$ .'},
        {'label': 'جـ)', 'text': 'حدّد مركز وزاوية الدوران الذي يحول P الى M، وعيّن صورة كل من النقطتين M و N بهذا الدوران.'},
    ],
    'figure': {'description': 'دائرة (𝒞) مركزها O ومثلث متقايس الأضلاع مرسوم داخلها: M في الأعلى، P في أسفل اليمين، الرأس الثالث (N) في أسفل اليسار ؛ سهم دائري على اليمين في الاتجاه المباشر.',
               'circles': [{'center': [0, 0], 'radius': r5, 'label': '(𝒞)'}], 'points': pts(O=c5, M=M5, N=N5, P=P5), 'segments': ['MN', 'NP', 'PM'], 'direction': 'direct',
               'reading': 'completed', 'readingNote': 'L’étiquette N (sommet en bas à gauche) est mangée par la marge gauche du scan ; complétée d’après le nom du triangle « MPN ».'},
    'answer': {
        'a': '$\\widehat{NOP} = 120^\\circ$ ($= 2 \\times \\widehat{NMP} = 2 \\times 60^\\circ$)',
        'b': '$\\widehat{MON} = \\widehat{POM} = 120^\\circ$ : الزوايا المركزية الثلاث متقايسة ومجموعها $360^\\circ$ .',
        'c': 'الدوران الذي مركزه O وزاويته $120^\\circ$ في الاتجاه المباشر يحوّل P إلى M، و M إلى N، و N إلى P : المثلث صورة نفسه.',
    },
    'answerSource': 'computed',
    'note': 'Seule l’activité « المثلث المتقايس الأضلاع » est présente : le manuel ne propose pas ici le carré ni l’hexagone (ils apparaissent dans les معارف et les exercices).',
})

# >>> PAGE 154
# ══ Page 154 — معارف 1–3 ════════════════════════════════════════════════════
k1M, k1Mp = (-2, 3), (3, 2)
assert close(rot(k1M, (0, 0), 90, direct=False), k1Mp) and rot_exact(k1M, (0, 0), 90, direct=False) == (3, 2)
E.append({
    'id': 'know-1', 'kind': 'knowledge', 'number': 1, 'page': 154, 'section': 'معارف', 'title': 'الدوران', 'verified': True,
    'definition': 'تعريف: تحويل شكل بدوران هو تدويره بزاوية معيّنة حول نقطة ثابتة وفي اتجاه معيّن.',
    'remark': 'ملاحظة: يتميّز الدوران بزاوية واتجاه ومركز هو النقطة التي دوّرنا حولها. (الشّكل)',
    'convention': 'اصطلاح: يُسمّى الاتجاه المعاكس لاتجاه عقارب الساعة الاتجاه المباشر أو الاتجاه الموجب. كما يُسمّى الاتجاه الآخر الاتجاه غير المباشر أو الاتجاه السالب.',
    'example': 'مثال: الشّكل (F′) هو صورة الشّكل (F) بالدوران الذي مركزه O وزاويته $90^\\circ$ ، في اتجاه حركة عقارب الساعة.',
    'figure': {'description': 'شكلان (F) و (F′) متقايسان (مثلث بضلع مقعّر) ؛ M على (F) و M′ على (F′) ؛ [OM] و [OM′] متقطعان ورمز زاوية قائمة في O ؛ سهم منحنٍ في الأعلى في اتجاه عقارب الساعة. تحته ساعتان: «الاتجاه المباشر» (سهم + عكس عقارب الساعة) و «الاتجاه غير المباشر» (سهم − مع عقارب الساعة).',
               'points': pts(O=(0, 0), M=k1M, M_=k1Mp), 'rightAngles': ['O'], 'direction': 'indirect', 'clocks': [{'label': 'الاتجاه المباشر', 'sign': '+', 'sense': 'anticlockwise'}, {'label': 'الاتجاه غير المباشر', 'sign': '−', 'sense': 'clockwise'}],
               'reading': 'M (−2 ; 3) et M′ (3 ; 2) choisis pour reproduire OM ≈ OM′ et l’angle droit en O (rotation horaire de 90°, assert) ; (F) et (F′) sont des formes libres non cotées.'},
    'note': 'Les intertitres « تعريف », « ملاحظة », « اصطلاح » sont imprimés en jaune pâle, à peine lisibles sur le scan (relus d’après leur forme et la structure habituelle des معارف).',
})

k2A = (4, 0); k2Ap = rot(k2A, (0, 0), 35)
k2M = polar((0, 0), 3, 55); k2Mp = rot(k2M, (0, 0), 35)
assert close(oriented(k2A, (0, 0), k2Ap), 35) and close(d((0, 0), k2Mp), 3) and close(oriented(k2M, (0, 0), k2Mp), 35)
assert rot_exact((5, 0), (0, 0), 180) == (-5, 0)
E.append({
    'id': 'know-2', 'kind': 'knowledge', 'number': 2, 'page': 154, 'section': 'معارف', 'title': 'صورة نقطة بدوران علم مركزه وقيس زاويته', 'verified': True,
    'definition': 'تعريف: O نقطة معلومة و $\\alpha$ زاوية. صورة نقطة M تختلف عن O بالدوران الذي مركزه O وزاويته $\\alpha$ في اتجاه معيّن هي النقطة M′ حيث OM′ = OM و $\\widehat{MOM\'} = \\alpha$ .',
    'remark': 'ملاحظة: صورة نقطة O بالدّوران الذي مركزه O هي النقطة O نفسها.',
    'specialCase': 'حالة خاصة: الدّوران الذي مركزه O وزاويته $180^\\circ$ هو التناظر بالنسبة إلى النقطة O.',
    'examples': [
        {'text': 'مثال: على الشّكل المقابل A′ صورة A بالدّوران الذي مركزه O وزاويته $35^\\circ$ في الاتجاه المباشر. M′ هي صورة M بنفس الدّوران حيث OM′ = OM و $\\widehat{MOM\'} = \\alpha$ .',
         'figure': {'description': 'O في أسفل اليسار ؛ [OA] أفقي و [OA′] مائل بزاوية 35° (علامتا ترميز متساويتان على [OA] و [OA′]) وقوس متقطع من A إلى A′ وسهم الاتجاه المباشر ؛ M و M′ أقرب إلى O مع قوس متقطع وزاوية 35° بين [OM] و [OM′].',
                    'points': pts(O=(0, 0), A=k2A, A_=k2Ap, M=k2M, M_=k2Mp), 'angles': [{'vertex': 'O', 'from': 'A', 'to': "A'", 'deg': 35}, {'vertex': 'O', 'from': 'M', 'to': "M'", 'deg': 35}], 'ticks': {'OA': 2, "OA'": 2},
                    'reading': 'Rayons et position de M choisis (OA = 4, OM = 3, M à 55°) : le dessin du manuel est schématique (A′ y est tracé vers 45°).'}},
        {'text': 'مثال: النقطة M′ هي صورة النقطة M: • بالدوران الذي مركزه O وزاويته $180^\\circ$ . • بالتناظر الذي مركزه O.',
         'figure': {'description': 'M′، O، M على استقامية (O منتصف [MM′]، علامتا ترميز) ونصف دائرة متقطعة فوق O مكتوب عليها 180°.', 'points': pts(M_=(-5, 0), O=(0, 0), M=(5, 0)), 'ticks': {"M'O": 2, 'OM': 2}}},
    ],
    'note': 'Dans le 1er exemple, « $\\widehat{MOM\'} = \\alpha$ » réutilise la lettre de la définition : ici $\\alpha = 35^\\circ$ .',
})

k3 = {k: polar((0, 0), r, -10) for k, r in (('A', 2), ('B', 4), ('C', 5.5))}
k3p = {k + '_': rot(p, (0, 0), 20) for k, p in k3.items()}
assert close(d(k3['A'], k3['B']), 2) and close(d(k3p['A_'], k3p['B_']), 2)
assert close(abs((k3p['B_'][0] - k3p['A_'][0]) * (k3p['C_'][1] - k3p['A_'][1]) - (k3p['B_'][1] - k3p['A_'][1]) * (k3p['C_'][0] - k3p['A_'][0])), 0)
E.append({
    'id': 'know-3', 'kind': 'knowledge', 'number': 3, 'page': 154, 'section': 'معارف', 'title': 'خواص الدّوران', 'verified': True,
    'property': 'خاصية: الدّوران يحافظ على : • الأطوال • استقامية النقط • الزوايا • المساحات',
    'example': 'مثال: A′، B′، C′ هي، على الترتيب، صور النقط A، B، C بالدوران الذي مركزه O و زاويته $20^\\circ$ في الاتجاه المباشر. إذا كان AB = 2cm فإن A′B′ = 2cm. A، B، C على استقامية واحدة إذن A′، B′، C′ على استقامية.',
    'figure': {'description': 'نصفا مستقيمين من O يصنعان زاوية 20° : الأسفل عليه A، B، C والأعلى عليه A′، B′، C′ ؛ خطوط متقطعة تصل كل نقطة بصورتها (أقواس صغيرة) ؛ سهم الاتجاه المباشر على اليمين.',
               'points': pts(O=(0, 0), **k3, **k3p), 'reading': 'A, B, C pris sur une demi-droite issue de O (à −10°) avec OA = 2, OB = 4, OC = 5,5 (AB = 2 cm comme le texte) ; le manuel n’a pas O sur (ABC) obligatoirement, mais le dessin l’y place.'},
    'answerSource': 'computed',
})

# >>> PAGE 155
# ══ Page 155 — طرائق, دوري الآن ═════════════════════════════════════════════
m1A = (3, 0); m1Ap = rot(m1A, (0, 0), 50)
assert close(oriented(m1A, (0, 0), m1Ap), 50) and close(d((0, 0), m1Ap), 3)
E.append({
    'id': 'method-point', 'kind': 'method', 'page': 155, 'section': 'طرائق', 'title': 'إنشاء صور أشكال هندسية — تمرين 1', 'verified': True,
    'exercise': 'تمرين 1: O، A نقطتان متمايزتان. أنشئ A′ صورة النقطة A بالدّوران الذي مركزه O و زاويته $50^\\circ$ في الاتجاه المباشر.',
    'solution': ['حل: • رسم نصف المستقيم [OA).', '• نستعمل منقلة ومسطرة ونرسم [Ox) حيث $\\widehat{AOx} = 50^\\circ$ في الاتجاه المباشر.', '• نستعمل المدور لتعيين النقطة A′ على نصف المستقيم [Ox) حيث OA = OA′.'],
    'figure': {'description': '[OA] أفقي (O يسار)، [Ox) مائل بزاوية 50° (مظلّلة) و A′ عليه ؛ قوس متقطع من A إلى A′ وسهم أحمر للاتجاه المباشر.',
               'points': pts(O=(0, 0), A=m1A, A_=m1Ap), 'angles': [{'vertex': 'O', 'from': 'A', 'to': "A'", 'deg': 50, 'label': '50°'}], 'direction': 'direct'},
    'answer': {'A_': pts(A_=m1Ap)["A'"]}, 'answerSource': 'computed',
    'note': 'Le manuel écrit « A ،O » (ordre visuel) : O, A.',
})

m2O, m2A, m2B = (0, 0), (3, 2.5), (7, 2.5)
m2Ap, m2Bp = rot(m2A, m2O, 40, direct=False), rot(m2B, m2O, 40, direct=False)
assert close(oriented(m2A, m2O, m2Ap), -40) and close(oriented(m2B, m2O, m2Bp), -40)
assert close(d(m2Ap, m2Bp), d(m2A, m2B)) and close(d(m2A, m2B), 4)
E.append({
    'id': 'method-segment', 'kind': 'method', 'page': 155, 'section': 'طرائق', 'title': 'إنشاء صور أشكال هندسية — تمرين 2', 'verified': True,
    'exercise': 'تمرين 2: انقل الشّكل المعطى، وأنشئ صورة القطعة [AB] بالدّوران الذي مركزه O وزاويته $40^\\circ$ في الاتجاه غير المباشر.',
    'solution': ['حل: • ننشئ A′ صورة A و B′ صورة B بالدّوران الذي مركزه O وزاويته $40^\\circ$ في الاتجاه السالب.', '• نرسم القطعة [A′B′].', 'القطعة [A′B′] هي صورة [AB] بالدّوران المعطى.'],
    'rule': 'طريقة: لإنشاء صورة قطعة مستقيم بدوران، يكفي إنشاء صورتي طرفيها ورسم قطعة المستقيم المحدّدة بالصورتين.',
    'figure': {'description': 'المعطى: قطعة [AB] أفقية تقريبا و O تحتها على اليسار. الحل: أنصاف مستقيمات متقطعة من O نحو A، A′، B، B′ ؛ قوسان متقطعان (مركزهما O) يمرّان بـ A و A′ ثم بـ B و B′ ؛ زاويتان 40° (برتقالي) ؛ علامات ترميز OA = OA′ و OB = OB′ ؛ سهم في اتجاه عقارب الساعة.',
               'points': pts(O=m2O, A=m2A, B=m2B, A_=m2Ap, B_=m2Bp), 'segments': ['AB', "A'B'"], 'direction': 'indirect',
               'reading': 'Lu à ≈ 60 px / unité : [OA) à ≈ 41°, [OB) à ≈ 19°, A′ ≈ −1°, B′ ≈ −22° ; arrondi à A (3 ; 2,5), B (7 ; 2,5) (AB = 4, horizontal comme le dessin), images calculées.'},
    'answer': {'images': pts(A_=m2Ap, B_=m2Bp), "A'B'": 'A′B′ = AB = 4'}, 'answerSource': 'computed',
})

uA, uC = (4, -2), (-1, 2)
uB, uD = rot(uA, (0, 0), 90), rot(uC, (0, 0), 90)
assert rot_exact(uA, (0, 0), 90) == (2, 4) and rot_exact(uC, (0, 0), 90) == (-2, -1)
uB, uD = (2, 4), (-2, -1)
AC = (uC[0] - uA[0], uC[1] - uA[1]); BD = (uD[0] - uB[0], uD[1] - uB[1])
assert AC[0] * BD[0] + AC[1] * BD[1] == 0 and AC[0] ** 2 + AC[1] ** 2 == BD[0] ** 2 + BD[1] ** 2 == 41
assert close(ang(uA, (0, 0), uB), 90) and d((0, 0), uA) == d((0, 0), uB) and close(ang(uC, (0, 0), uD), 90) and d((0, 0), uC) == d((0, 0), uD)
E.append({
    'id': 'method-properties', 'kind': 'method', 'page': 155, 'section': 'طرائق', 'title': 'استعمال خواص الدّوران في الإنشاءات', 'verified': True,
    'exercise': 'تمرين: OAB و OCD مثلثان كل منهما قائم ومتساوي الساقين. • بيّن أن [BD] هي صورة [AC] بدوران يُطلب تعيين مركزه وزاويته. • استنتج أنّ AC = BD و (BD) ⊥ (AC).',
    'solution': ['حل: • بما أن OAB قائم ومتساوي الساقين، فإنّ B هي صورة A بالدوران الذي مركزه O وزاويته $90^\\circ$ .', 'وكذلك فإنّ D هي صورة C بنفس الدوران.', 'ومنه فإنّ [BD] هي صورة [AC] بالدوران الذي مركزه O وزاويته $90^\\circ$ .', '• ومن خواص الدوران نستنتج أنّ AC = BD و كذلك (BD) ⊥ (AC).'],
    'figure': {'description': 'المثلثان OAB (كبير، B في الأعلى و A أسفل اليمين) و OCD (صغير، C أعلى اليسار و D أسفل اليسار) قائمان في O (رمزا زاوية قائمة) ؛ القطعتان [AC] و [BD] بالبرتقالي/الأحمر تتقاطعان.',
               'points': pts(O=(0, 0), A=uA, B=uB, C=uC, D=uD), 'segments': ['OA', 'OB', 'AB', 'OC', 'OD', 'CD', 'AC', 'BD'], 'rightAngles': ['O'],
               'reading': 'Lu à ≈ 65 px / unité, O à l’origine : A (4 ; −2), B (2 ; 4), C (−1 ; 2), D (−2 ; −1) — B et D images de A et C par la rotation de centre O, 90°, sens DIRECT (assert exact).'},
    'answer': {'rotation': 'المركز O، الزاوية $90^\\circ$ في الاتجاه المباشر (A → B ، C → D)', 'AC=BD': 'AC = BD = $\\sqrt{41}$ (وحدة الشكل)', 'perp': '$\\overrightarrow{AC}\\begin{pmatrix} -5 \\\\ 4 \\end{pmatrix}$ ، $\\overrightarrow{BD}\\begin{pmatrix} -4 \\\\ -5 \\end{pmatrix}$ : (BD) ⊥ (AC)'},
    'answerSource': 'computed',
    'note': '« قائم ومتساوي الساقين » sans préciser le sommet : c’est la figure qui met l’angle droit en O. Le sens de la rotation (direct, A → B) n’est pas dit non plus.',
})
DISC.append({'elementId': 'method-properties', 'kind': 'inconsistency', 'resolution': 'kept — lessons state « قائم في O » and the direction; the perpendicularity is justified by « صورة مستقيم بدوران زاويته 90° تعامده »',
             'text': '(1) L’énoncé dit « OAB و OCD مثلثان كل منهما قائم ومتساوي الساقين » sans dire « في O » ni le sens de la rotation (direct d’après la figure : A → B, C → D). (2) La solution conclut (BD) ⊥ (AC) « من خواص الدوران » alors que la propriété listée p. 154 (longueurs, alignement, angles, aires) ne contient pas « une droite et son image par une rotation de 90° sont perpendiculaires » ; il faut l’ajouter (ou passer par l’angle entre (AC) et (BD)).'})

nO, nA, nB, nK = (0, 0), polar((0, 0), 3, 45), (4, 0), (1.5, -0.7)
nOp, nAp, nBp = (rot(p, nK, 60) for p in (nO, nA, nB))
assert close(ang(nAp, nOp, nBp), 45) and close(d(nOp, nBp), 4) and close(oriented(nO, nK, nOp), 60)
E.append({
    'id': 'now-155', 'kind': 'now', 'page': 155, 'section': 'دوري الآن', 'verified': True,
    'items': [
        {'number': 1, 'text': '$\\widehat{AOB}$ زاوية قيسها $45^\\circ$ . أنشئ صورة هذه الزاوية بالدوران الذي مركزه K و زاويته $60^\\circ$ في الاتجاه المباشر.',
         'figure': {'description': '[OB] أفقي و [OA] مائل بزاوية 45° (مظلّلة) ؛ النقطة K تحت [OB] قرب O.', 'points': pts(O=nO, A=nA, B=nB, K=nK),
                    'angles': [{'vertex': 'O', 'from': 'B', 'to': 'A', 'deg': 45, 'label': '45°'}], 'reading': 'Positions schématiques (≈ 30 px / unité) : OB = 4, OA = 3, K (1,5 ; −0,7).'},
         'answer': {'images': pts(O_=nOp, A_=nAp, B_=nBp), 'angle': "صورة الزاوية $\\widehat{AOB}$ هي $\\widehat{A'O'B'}$ و $\\widehat{A'O'B'} = 45^\\circ$ (الدوران يحافظ على الزوايا) ؛ ننشئ O′ ثم نصفي المستقيمين [O′A′) و [O′B′)."}},
    ],
    'answerSource': 'computed',
})

# >>> PAGE 156
# ══ Page 156 — معارف 4–5 ════════════════════════════════════════════════════
k4 = {k: polar((0, 0), 2, a) for k, a in (('A', 240), ('B', 320), ('M', 160), ('N', 100))}
AOB4 = ang(k4['A'], (0, 0), k4['B']); AMB4 = ang(k4['A'], k4['M'], k4['B']); ANB4 = ang(k4['A'], k4['N'], k4['B'])
MAN4 = ang(k4['M'], k4['A'], k4['N']); MON4 = ang(k4['M'], (0, 0), k4['N'])
assert close(AOB4, 80) and close(AMB4, 40) and close(ANB4, 40) and close(MAN4, MON4 / 2) and close(MAN4, 30)
E.append({
    'id': 'know-4', 'kind': 'knowledge', 'number': 4, 'page': 156, 'section': 'معارف', 'title': 'الزاوية المحيطية و الزاوية المركزية في دائرة', 'verified': True,
    'definition': 'تعريف: (𝒞) دائرة مركزها O. • نُسمّي زاوية مركزية في الدائرة (𝒞) كل زاوية رأسها المركز O. • نُسمّي زاوية محيطية في الدائرة (𝒞) كل زاوية رأسها تنتمي إلى الدائرة (𝒞)، وضلعاها يقطعان الدائرة (𝒞).',
    'properties': [
        'خاصية 1: قيس الزاوية المحيطية في دائرة، هو نصف قيس الزاوية المركزية التي تحصر معها نفس القوس',
        'خاصية 2: إذا كانت زاويتان محيطيتان في دائرة تحصران القوس نفسه فهما متقايستان.',
    ],
    'examples': [
        {'label': 'مثال 1', 'text': '• $\\widehat{AOB}$ هي زاوية مركزية في الدائرة (𝒞)، تحصر القوس $\\overset{\\frown}{AB}$ . • $\\widehat{MAN}$ هي زاوية محيطية في الدائرة (𝒞) تحصر القوس $\\overset{\\frown}{MN}$ .',
         'figure': {'description': 'دائرة (𝒞) مركزها O ؛ الزاوية المركزية AOB مظلّلة بالأحمر والقوس AB الصغير (الأسفل) أحمر ؛ الزاوية المحيطية MAN (رأسها A، ضلعاها نحو M على اليسار و N في الأعلى) مظلّلة.',
                    'circles': [{'center': [0, 0], 'radius': 2, 'label': '(𝒞)'}], 'points': pts(O=(0, 0), A=k4['A'], B=k4['B'], M=k4['M'], N=k4['N']), 'segments': ['OA', 'OB', 'AM', 'AN']}},
        {'label': 'مثال 2', 'text': '• بما أنّ $\\widehat{AOB}$ زاوية مركزية و $\\widehat{AMB}$ زاوية محيطية وتحصران القوس $\\overset{\\frown}{AB}$ نفسه. فإنّ $\\widehat{AMB} = \\dfrac{1}{2}\\widehat{AOB}$ .',
         'figure': {'description': 'نفس الدائرة ؛ الزاوية المركزية AOB (أحمر) والزاوية المحيطية AMB (M على اليسار) تحصران القوس AB الأحمر.',
                    'circles': [{'center': [0, 0], 'radius': 2, 'label': '(𝒞)'}], 'points': pts(O=(0, 0), A=k4['A'], B=k4['B'], M=k4['M']), 'segments': ['OA', 'OB', 'MA', 'MB']}},
        {'label': 'مثال 3', 'text': '• بما أنّ $\\widehat{AMB}$ و $\\widehat{ANB}$ زاويتان محيطيتان وتحصران القوس $\\overset{\\frown}{AB}$ نفسه. فإنّ $\\widehat{AMB} = \\widehat{ANB}$ .',
         'correction': {'decidedBy': 'platform', 'decidedOn': '2026-10-04', 'printed': 'بما أنّ $\\widehat{AOB}$ و $\\widehat{ANB}$ زاويتان محيطيتان', 'corrected': 'بما أنّ $\\widehat{AMB}$ و $\\widehat{ANB}$ زاويتان محيطيتان'},
         'figure': {'description': 'نفس الدائرة ؛ الزاويتان المحيطيتان AMB (M يسار) و ANB (N أعلى) مظلّلتان وتحصران القوس AB الأحمر ؛ O غير موصول.',
                    'circles': [{'center': [0, 0], 'radius': 2, 'label': '(𝒞)'}], 'points': pts(O=(0, 0), A=k4['A'], B=k4['B'], M=k4['M'], N=k4['N']), 'segments': ['MA', 'MB', 'NA', 'NB']}},
    ],
    'measures': {'AOB': 80, 'AMB': 40, 'ANB': 40, 'MAN': 30, 'MON': 60},
    'reading': 'Positions angulaires choisies (A 240°, B 320°, M 160°, N 100°, rayon 2) pour reproduire les dessins (arc AB en bas, M à gauche, N en haut) avec des mesures rondes : AOB = 80°, AMB = ANB = 40°, MAN = 30° (assert). Le manuel ne donne aucune mesure.',
    'answerSource': 'computed',
})
DISC.append({'elementId': 'know-4', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see examples[2].correction',
             'text': 'مثال 3 : « بما أنّ $\\widehat{AOB}$ و $\\widehat{ANB}$ زاويتان محيطيتان … فإنّ $\\widehat{AMB} = \\widehat{ANB}$ » — $\\widehat{AOB}$ est l’angle AU CENTRE (exemple 2) ; la conclusion et la figure (angles ombrés en M et N, O non relié) exigent $\\widehat{AMB}$ . Correction : « $\\widehat{AMB}$ و $\\widehat{ANB}$ ».'})

k5 = {}
for name, n, start, labels in (('triangle', 3, 75, 'ABC'), ('square', 4, 150, 'ABCD'), ('hexagon', 6, 175, 'ABCDEF')):
    P_ = {lab: polar((0, 0), 2, start + 360 / n * i) for i, lab in enumerate(labels)}
    for i, lab in enumerate(labels):
        nxt = labels[(i + 1) % n]
        assert close(ang(P_[lab], (0, 0), P_[nxt]), central(n)) and close(d(P_[lab], P_[nxt]), float(side_exact(n, 2)))
        prv = labels[i - 1]
        assert close(ang(P_[prv], P_[lab], P_[nxt]), interior(n))
        assert close(rot(P_[lab], (0, 0), central(n)), P_[nxt])
    k5[name] = P_
E.append({
    'id': 'know-5', 'kind': 'knowledge', 'number': 5, 'page': 156, 'section': 'معارف', 'title': 'المضلعات المنتظمة', 'verified': True,
    'definition': 'تعريف: نسمّي مضلعا منتظما كل مضلّع أضلاعه كلّها لها نفس الطول وزواياه كلّها متقايسة.',
    'properties': [
        'خاصية 1: توجد دائرة تشمل كل رؤوس مضلع منتظم، تُسمّى الدائرة المحيطة بهذا المضلع ويُسمى مركزها مركز المضلع المنتظم.',
        'خاصية 2: الزوايا المركزية التي كل منها تحصر ضلعا في مضلع منتظم متقايسة، وكل منها تساوي $\\left(\\dfrac{360^\\circ}{n}\\right)$ حيث $n$ عدد أضلاع المضلّع.',
        'خاصية 3: إذا كان [AB] ضلعا في مضلع منتظم مركزه O، فإن صورة هذا المضلع بالدّوران الذي مركزه O وزاويته $\\widehat{AOB}$ هو المضلع نفسه.',
    ],
    'examples': [
        {'name': 'مثلث متقايس الأضلاع', 'formula': '$\\widehat{AOB} = \\left(\\dfrac{360^\\circ}{3}\\right) = 120^\\circ$',
         'figure': {'description': 'مثلث ABC متقايس الأضلاع في دائرته المحيطة (A أعلى، B يسار، C أسفل اليمين) ؛ [OA]، [OB]، [OC] متقطعة ؛ 60° عند A و 120° للزاوية المركزية BOC ؛ أقواس متعددة عند O.',
                    'circles': [{'center': [0, 0], 'radius': 2}], 'points': pts(O=(0, 0), **k5['triangle']), 'labels': {'A': '60°', 'BOC': '120°'}}},
        {'name': 'مربع', 'formula': '$\\widehat{AOB} = \\left(\\dfrac{360^\\circ}{4}\\right) = 90^\\circ$',
         'figure': {'description': 'مربع ABCD مائل في دائرته المحيطة (A أعلى اليسار، B أسفل، C يمين، D أعلى) ؛ القطران [AC] و [BD] متعامدان في O (رمز زاوية قائمة، 90°) ؛ رموز الزوايا القائمة عند الرؤوس.',
                    'circles': [{'center': [0, 0], 'radius': 2}], 'points': pts(O=(0, 0), **k5['square']), 'labels': {'DOC': '90°'}}},
        {'name': 'سداسي منتظم', 'formula': '$\\widehat{AOB} = \\left(\\dfrac{360^\\circ}{6}\\right) = 60^\\circ$',
         'figure': {'description': 'سداسي منتظم ABCDEF في دائرته المحيطة (A يسار، B أسفل اليسار، C أسفل، D يمين، E أعلى اليمين، F أعلى) ؛ الأقطار [AD]، [BE]، [CF] تمر بـ O ؛ 60° للزاوية المركزية FOE و 120° للزاوية الداخلية عند B ؛ أقواس عند كل رأس.',
                    'circles': [{'center': [0, 0], 'radius': 2}], 'points': pts(O=(0, 0), **k5['hexagon']), 'labels': {'FOE': '60°', 'B': '120°'}}},
    ],
    'reading': 'Polygones posés sur un cercle de rayon 2, sommets dans le sens direct (A→B→C… anti-horaire, comme sur les dessins) à partir de 75° (triangle), 150° (carré), 175° (hexagone). Le scan déforme légèrement le cercle de l’hexagone (ellipse) : redessiné régulier. Côtés : $2\\sqrt{3}$ , $2\\sqrt{2}$ , 2 (assert).',
    'answer': {'central': {'3': 120, '4': 90, '6': 60}, 'interior': {'3': 60, '4': 90, '6': 120}, 'sideForR2': {'3': '$2\\sqrt{3}$', '4': '$2\\sqrt{2}$', '6': '2'}},
    'answerSource': 'computed',
    'note': 'La formule de l’angle intérieur (n − 2)·180°/n n’est PAS dans les معارف : les figures montrent seulement 60° (triangle), 90° (carré), 120° (hexagone).',
})

# >>> PAGE 157
# ══ Page 157 — طرائق (مضلعات منتظمة), دوري الآن ════════════════════════════
pent = {lab: polar((0, 0), 2, 126 + 72 * i) for i, lab in enumerate('ABCDE')}
AOE = ang(pent['A'], (0, 0), pent['E']); OAE = ang((0, 0), pent['A'], pent['E']); BAE = ang(pent['B'], pent['A'], pent['E'])
assert close(AOE, 72) and close(OAE, 54) and close(BAE, 108) and close(BAE, interior(5)) and close(pent['C'], (0, -2))
E.append({
    'id': 'method-angle', 'kind': 'method', 'page': 157, 'section': 'طرائق', 'title': 'حساب قيس زاوية مضلع منتظم', 'verified': True,
    'exercise': 'تمرين: ABCDE خماسي منتظم مركزه O. ما هو قيس الزاوية $\\widehat{BAE}$ .',
    'solution': ['حل: عدد أضلاع ABCDE هو 5 إذن قيس الزاوية المركزية $\\widehat{AOE}$ هو $\\dfrac{360^\\circ}{5}$ أي $72^\\circ$ .',
                 'المثلث AOE متساوي الساقين رأسه الأساسي هو O إذن $\\widehat{OAE} = \\widehat{OEA} = \\dfrac{180^\\circ - 72^\\circ}{2} = 54^\\circ$',
                 'نستنتج عندئذ أن $\\widehat{BAE} = 2 \\times \\widehat{OAE} = 2 \\times 54^\\circ$ أي $\\widehat{BAE} = 108^\\circ$'],
    'figure': {'description': 'خماسي منتظم ABCDE (أضلاعه بالأحمر) في دائرته المحيطة: A أعلى اليسار، B يسار، C أسفل، D يمين، E أعلى اليمين ؛ [OA]…[OE] متقطعة ؛ الزاوية BAE مظلّلة.',
               'circles': [{'center': [0, 0], 'radius': 2}], 'points': pts(O=(0, 0), **pent), 'polygon': list('ABCDE')},
    'correction': {'decidedBy': 'platform', 'decidedOn': '2026-10-04', 'printed': '$\\widehat{BAE} = 180^\\circ$', 'corrected': '$\\widehat{BAE} = 108^\\circ$'},
    'answer': {'BAE': 108, 'general': 'زاوية مضلع منتظم ذي n ضلعا: $\\dfrac{(n-2) \\times 180^\\circ}{n}$ (للخماسي $\\dfrac{3 \\times 180^\\circ}{5} = 108^\\circ$)'},
    'answerSource': 'computed',
    'note': 'Le raisonnement suppose (OA) bissectrice de $\\widehat{BAE}$ ($\\widehat{OAB} = \\widehat{OAE}$ : triangles OAB et OAE isométriques) — non dit.',
})
DISC.append({'elementId': 'method-angle', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
             'text': 'Dernière ligne de la solution : « $\\widehat{BAE} = 2 \\times \\widehat{OAE} = 2 \\times 54^\\circ$ أي $\\widehat{BAE} = 180^\\circ$ » — 2 × 54° = 108° (angle d’un pentagone régulier, (5 − 2) × 180° / 5, assert), repris d’ailleurs comme « $\\widehat{BAE} = 108^\\circ$ (التمرين السابق) » dans la méthode suivante. Correction : 108°.'})

sAB = 3
Rp = sAB / (2 * math.sin(math.radians(36)))
pent3 = {lab: polar((0, 0), Rp, 126 + 72 * i) for i, lab in enumerate('ABCDE')}
assert close(d(pent3['A'], pent3['B']), 3) and close(rot(pent3['B'], pent3['A'], 108), pent3['E'])
assert close(Rp, float(sp.nsimplify(sp.Rational(3, 2) / sp.sin(sp.pi / 5)))) and abs(Rp - 2.552) < 1e-3
E.append({
    'id': 'method-construct', 'kind': 'method', 'page': 157, 'section': 'طرائق', 'title': 'إنشاء مضلع منتظم عُلم طول ضلعه', 'verified': True,
    'exercise': 'تمرين: أنشئ خماسيًّا منتظما ABCDE حيث AB = 3cm.',
    'solution': ['حل: لدينا AB = AE و $\\widehat{BAE} = 108^\\circ$ (التمرين السابق)',
                 'إذن يمكن إنشاء النقطة E صورة B بالدّوران الذي مركزه A و زاويته $108^\\circ$ .',
                 'ننشئ المستقيم $(D_1)$ محور [AB] و المستقيم $(D_2)$ محور [AE].',
                 '$(D_1)$ و $(D_2)$ متقاطعان في نقطة O و OA = OB = OE.',
                 'O هي مركز الدّائرة المحيطة بالمثلث ABE و هي مركز ABCDE.',
                 'ثم ننشئ الرأسين C و D بالمدور بحيث BC = CD = AB.'],
    'figure': {'description': 'خماسي منتظم ABCDE (أضلاعه بالأحمر) ودائرته المحيطة ؛ سهم 108° من [AB] نحو [AE] ؛ المستقيمان المتقطعان $(\\Delta_1)$ (محور [AB]، رمز زاوية قائمة، يمر بـ O و D) و $(\\Delta_2)$ (محور [AE]، يمر بـ O و C).',
               'circles': [{'center': [0, 0], 'radius': rnd(Rp)}], 'points': pts(O=(0, 0), **pent3), 'polygon': list('ABCDE'),
               'lines': [{'label': '(Δ1)', 'through': ['O', 'D'], 'perpendicularBisectorOf': 'AB'}, {'label': '(Δ2)', 'through': ['O', 'C'], 'perpendicularBisectorOf': 'AE'}],
               'angles': [{'vertex': 'A', 'from': 'B', 'to': 'E', 'deg': 108, 'label': '108°'}], 'direction': 'direct',
               'reading': 'Même disposition que la figure précédente (A à 126°, sens direct), rayon calculé R = 3 / (2 sin 36°) ≈ 2,55 cm pour AB = 3 cm. La médiatrice de [AB] passe par le sommet opposé D, celle de [AE] par C (assert implicite par symétrie).'},
    'answer': {'R': f'$R = \\dfrac{{AB}}{{2\\sin 36^\\circ}} \\approx {dec(Rp)}$ cm (غير مطلوب)', 'rotation': 'E صورة B بالدوران الذي مركزه A وزاويته $108^\\circ$ في الاتجاه المباشر (حسب الشكل)'},
    'answerSource': 'computed',
})
DISC.append({'elementId': 'method-construct', 'kind': 'inconsistency', 'resolution': 'kept — lessons use one name; the platform writes (Δ1), (Δ2) as on the figure',
             'text': 'Le texte nomme les médiatrices « $(D_1)$ » et « $(D_2)$ » ; la figure les étiquette « $(\\Delta_1)$ » et « $(\\Delta_2)$ ». Le sens de la rotation de 108° (direct d’après la flèche) n’est pas précisé.'})

r_tri = sp.sqrt(3)
side_tri = side_exact(3, r_tri)
assert side_tri == 3
triE = {lab: polar((0, 0), math.sqrt(3), a) for lab, a in (('A', 160), ('C', 40), ('B', 280))}
H = ((triE['A'][0] + triE['B'][0]) / 2, (triE['A'][1] + triE['B'][1]) / 2)
assert close(d(triE['A'], triE['B']), 3) and close(ang(triE['A'], (0, 0), triE['B']), 120) and close(ang(H, (0, 0), triE['A']), 60) and close(ang((0, 0), triE['A'], H), 30)
assert sp.sqrt(3) * sp.cos(sp.pi / 6) == sp.Rational(3, 2)
E.append({
    'id': 'method-side', 'kind': 'method', 'page': 157, 'section': 'طرائق', 'title': 'حساب طول ضلع مضلع منتظم عُلم نصف قطر الدّائرة المحيطة به', 'verified': True,
    'exercise': 'تمرين: ABC مثلث متقايس الأضلاع و (E) الدّائرة المحيطة به، مركزها O و نصف قطرها $\\sqrt{3}$ . الوحدة هي السنتيمتر. احسب القيمة المضبوطة لطول ضلع هذا المثلث.',
    'solution': ['حل: في المثلث ABC، الارتفاع (OH) هو أيضا منصّف الزاوية $\\widehat{AOB}$ و محور القطعة [AB]. لدينا $\\widehat{ACB} = 60^\\circ$ إذن $\\widehat{AOB} = 120^\\circ$ و منه $\\widehat{HOA} = 60^\\circ$ .',
                 'في المثلث OAH القائم في H، لدينا $\\widehat{OAH} = 90^\\circ - 60^\\circ = 30^\\circ$ .',
                 'لدينا $\\cos\\widehat{OAH} = \\dfrac{AH}{OA} = \\dfrac{AH}{\\sqrt{3}}$ أي $\\cos 30^\\circ = \\dfrac{AH}{\\sqrt{3}}$ أي $AH = \\sqrt{3} \\times \\cos 30^\\circ$',
                 'و نستنتج أن $AH = \\sqrt{3} \\times \\dfrac{\\sqrt{3}}{2}$ لدينا $AB = 2 \\times AH = 3$ إذن AB = 3cm.'],
    'figure': {'description': 'دائرة (E) مركزها O ومثلث ABC متقايس الأضلاع (A يسار، C أعلى اليمين، B أسفل) ؛ [OA]، [OB]، [OC] متقطعة ؛ H على [AB] مع رمز زاوية قائمة و [OH].',
               'circles': [{'center': [0, 0], 'radius': rnd(math.sqrt(3)), 'label': '(E)', 'radiusExact': '\\sqrt{3}'}], 'points': pts(O=(0, 0), H=H, **triE), 'rightAngles': ['H'],
               'reading': 'Rayon √3 ; sommets à 160° (A), 40° (C), 280° (B) comme sur le dessin ; H milieu de [AB].'},
    'answer': {'AB': '3 cm', 'general': 'ضلع المثلث المتقايس الأضلاع المحاط بدائرة نصف قطرها r هو $r\\sqrt{3}$ ($\\sqrt{3} \\times \\sqrt{3} = 3$)'},
    'answerSource': 'computed',
    'note': '« الارتفاع (OH) » : la hauteur issue de C est (CH), qui passe par O ; (OH) en est une partie. Mobilise le cosinus (unité 10).',
})

hep_c = 360 / 7; hep_i = interior(7)
assert close(hep_c, 51.428571428571) and close(hep_i, 128.5714285714) and close(hep_i, 900 / 7) and round(hep_c) == 51 and round(hep_i) == 129
hept = {lab: polar((0, 0), 2, 90 + 360 / 7 * i) for i, lab in enumerate('ABCDEFG')}
assert close(ang(hept['A'], hept['B'], hept['C']), hep_i)
E.append({
    'id': 'now-157', 'kind': 'now', 'page': 157, 'section': 'دوري الآن', 'verified': True,
    'items': [
        {'number': 1, 'text': 'ABCDEFG سباعي منتظم مركزه O. احسب القيمة المضبوطة للزاوية $\\widehat{AOB}$ ثم للزاوية $\\widehat{ABC}$ . عيّن المدوّر إلى الوحدة لكل منهما.',
         'answer': {'AOB': '$\\widehat{AOB} = \\dfrac{360^\\circ}{7} \\approx 51^\\circ$', 'ABC': '$\\widehat{ABC} = 180^\\circ - \\dfrac{360^\\circ}{7} = \\dfrac{900^\\circ}{7} \\approx 129^\\circ$ (أو $2 \\times \\widehat{OBA}$ مع $\\widehat{OBA} = \\dfrac{180^\\circ - \\frac{360^\\circ}{7}}{2} = \\dfrac{450^\\circ}{7}$)'},
         'platformFigure': {'circles': [{'center': [0, 0], 'radius': 2}], 'points': pts(O=(0, 0), **hept), 'reading': 'Pas de figure dans le manuel ; heptagone de rayon 2, A à 90°, sens direct.'}},
    ],
    'answerSource': 'computed',
    'note': '« القيمة المضبوطة » d’un angle : fraction $\\dfrac{360}{7}$ degrés — rare dans le manuel ; la plateforme accepte $\\dfrac{360^\\circ}{7}$ et ≈ 51°.',
})

# >>> PAGE 158
# ══ Page 158 — أوظّف تعلّماتي 1–6 (صورة شكل بدوران) ══════════════════════════
def ex(n, page, section, text, answer, figure=None, **kw):
    e = {'id': f'ex-{n}', 'kind': 'exercise', 'number': n, 'page': page, 'section': section, 'verified': True, 'text': text}
    if figure:
        e['figure'] = figure
    e['answer'] = answer
    e['answerSource'] = 'computed'
    e.update(kw)
    E.append(e)


def seg_image(pdict, name, deg, direct=True, c=(0, 0)):
    """Nom du point de pdict qui est l'image de pdict[name] (rotation de centre c)."""
    img = rot(pdict[name], c, deg, direct)
    hits = [k for k, p in pdict.items() if close(p, img, 1e-6)]
    assert len(hits) == 1, (name, deg, hits)
    return hits[0]


S_1 = 'صورة شكل بدوران'
x1 = {'C': polar((0, 0), 3, 22), 'B': polar((0, 0), 3, 67), 'A': polar((0, 0), 3, 117), 'D': polar((0, 0), 3, 247)}
assert close(ang(x1['A'], (0, 0), x1['B']), 50) and close(ang(x1['B'], (0, 0), x1['C']), 45) and close(ang(x1['A'], (0, 0), x1['D']), 130) and close(ang(x1['C'], (0, 0), x1['D']), 135)
assert close(ang(x1['B'], (0, 0), x1['D']), 180)
q1 = seg_image(x1, 'C', 95); q2 = seg_image(x1, 'D', 230)
q3 = [k for k in x1 if close(rot(x1[k], (0, 0), 265), x1['C'], 1e-6)]
assert q1 == 'A' and q2 == 'A' and q3 == ['A']
ex(1, 158, S_1, '[OA]، [OB]، [OC]، [OD] قطع مستقيم متقايسة (الشكل). 1) ما هي صورة [OC] بالدوران الذي مركزه O وزاويته $95^\\circ$ في الاتجاه المباشر؟ 2) ما هي صورة [OD] بالدوران الذي مركزه O وزاويته $230^\\circ$ في الاتجاه المباشر؟ 3) ما هي قطعة المستقيم التي صورتها [OC] بالدوران الذي مركزه O وزاويته $265^\\circ$ في الاتجاه المباشر؟',
   {'1': '[OA] : $\\widehat{COA} = 45^\\circ + 50^\\circ = 95^\\circ$ في الاتجاه المباشر (C → B → A).',
    '2': '[OA] : من D في الاتجاه المباشر: $135^\\circ$ (نحو C) + $45^\\circ$ (نحو B) + $50^\\circ$ (نحو A) = $230^\\circ$ .',
    '3': '[OA] : من A في الاتجاه المباشر: $130^\\circ + 135^\\circ = 265^\\circ$ نصل إلى C.',
    'remark': 'الأجوبة الثلاثة هي [OA] ؛ $265^\\circ$ في الاتجاه المباشر = $95^\\circ$ في الاتجاه غير المباشر.'},
   figure={'description': 'أربع قطع متقايسة من O: [OB] و [OD] على استقامية واحدة (B أعلى اليمين، D أسفل اليسار) ؛ [OA] نحو أعلى اليسار و [OC] نحو اليمين ؛ الزوايا: $\\widehat{AOB} = 50^\\circ$ ، $\\widehat{BOC} = 45^\\circ$ ، $\\widehat{COD} = 135^\\circ$ (قوس من الأسفل) ، $\\widehat{AOD} = 130^\\circ$ .',
           'points': pts(O=(0, 0), **x1), 'segments': ['OA', 'OB', 'OC', 'OD'], 'angles': [{'vertex': 'O', 'from': 'B', 'to': 'A', 'deg': 50}, {'vertex': 'O', 'from': 'C', 'to': 'B', 'deg': 45}, {'vertex': 'O', 'from': 'A', 'to': 'D', 'deg': 130}, {'vertex': 'O', 'from': 'D', 'to': 'C', 'deg': 135}],
           'reading': 'Directions posées à C 22°, B 67°, A 117°, D 247° (rayon 3) : exactement les quatre mesures imprimées (somme 360°, B, O, D alignés, assert). Le dessin du manuel met C vers 22° et B vers 67°.'},
   note='Rotations d’angle > 180° (230°, 265°) : le manuel les admet ici seulement.')
DISC.append({'elementId': 'ex-1', 'kind': 'reading', 'resolution': 'kept — all three answers are [OA] (assert)',
             'text': 'Les trois questions ont la même réponse [OA] (95° depuis C, 230° depuis D, et l’antécédent de [OC] par 265°) — vérifié par calcul ; probablement voulu (même point d’arrivée par trois chemins), à signaler aux auteurs pour ne pas croire à une erreur de lecture.'})

tri = {}
for lab, a in (('1', 180), ('2', 90), ('3', 0), ('4', 270)):
    base = polar((0, 0), 2, a); apex = polar((0, 0), 4, a)
    tri[lab] = [apex, polar(base, 0.8, a + 90), polar(base, 0.8, a - 90)]


def tri_img(t, deg, direct=True):
    img = [rot(p, (0, 0), deg, direct) for p in tri[t]]
    for k, v in tri.items():
        if all(any(close(q, p, 1e-6) for p in v) for q in img):
            return k
    return None


assert tri_img('1', 90, False) == '2' and tri_img('2', 90, False) == '3' and tri_img('4', 90, False) == '1'
assert tri_img('1', 90, True) == '4' and tri_img('1', 180) == '3' and tri_img('4', 180) == '2'
ex(2, 158, S_1, 'الشكل الآتي يتكون من أربعة مثلثات. 1) الدوران الذي مركزه O و زاويته $90^\\circ$ يحوّل المثلث ① إلى المثلث ② في الاتجاه غير المباشر. ما هي صورة المثلث ② وصورة المثلث ④ بهذا الدوران؟ 2) ما هو مركز و زاوية و اتجاه الدوران الذي يحوّل المثلث ① إلى المثلث ④ ؟ المثلث ① إلى المثلث ③؟ المثلث ④ إلى المثلث ② ؟',
   {'1': {'2': 'المثلث ③', '4': 'المثلث ①'},
    '2': {'1→4': 'المركز O، الزاوية $90^\\circ$ ، الاتجاه المباشر (أو $270^\\circ$ في الاتجاه غير المباشر)',
          '1→3': 'المركز O، الزاوية $180^\\circ$ (الاتجاهان متكافئان: التناظر المركزي بالنسبة إلى O)',
          '4→2': 'المركز O، الزاوية $180^\\circ$ (التناظر بالنسبة إلى O)'}},
   figure={'description': 'صليب: قطعتان متعامدتان في O (رمز زاوية قائمة) وفي طرف كل ذراع مثلث متساوي الساقين رأسه نحو الخارج: ① يسار، ② أعلى، ③ يمين، ④ أسفل.',
           'points': pts(O=(0, 0)), 'polygons': {k: [[rnd(x), rnd(y)] for x, y in v] for k, v in tri.items()},
           'reading': 'Quatre triangles isométriques à distance égale de O (≈ 85 px) ; posés base à 2, sommet à 4, demi-base 0,8. Les triangles sont symétriques : seule leur POSITION compte (assert sur les sommets).'},
   note='Les numéros ① … ④ sont des cercles numérotés dans le manuel ; la plateforme peut les écrire T1 … T4.')

x3A, x3B = (0, 0), (4, 1)
x3C, x3D = rot(x3B, x3A, 50, False), rot(x3B, x3A, 139, False)
assert close(ang(x3C, x3A, x3D), 89)
ex(3, 158, S_1, 'A و B نقطتان كيفيتان. 1) أنشئ C صورة B بالدوران الذي مركزه A وزاويته $50^\\circ$ في اتجاه عقارب الساعة. 2) أنشئ D صورة B بالدوران الذي مركزه A وزاويته $139^\\circ$ في اتجاه عقارب الساعة. 3) ما هو قيس الزاوية $\\widehat{CAD}$ .',
   {'1-2': 'AC = AD = AB', '3': '$\\widehat{CAD} = 139^\\circ - 50^\\circ = 89^\\circ$ (الدورانان في نفس الاتجاه)', 'example': pts(A=x3A, B=x3B, C=x3C, D=x3D)},
   note='Pas de figure ; exemple de la plateforme A (0 ; 0), B (4 ; 1). Piège : 89° ≠ 90° — l’angle CAD n’est PAS droit (ne pas conclure à l’œil).')

x4 = {'A': (0, 0), 'B': (3, 0), 'C': (0, 3)}
x4Ap = rot_exact(x4['A'], x4['B'], 90, direct=False)
assert x4Ap == (3, 3)
C4 = x4['C']
A1x = rot_exact(x4['A'], C4, 45); B1x = rot_exact(x4['B'], C4, 45)
assert sp.simplify(A1x[0] - 3 * sp.sqrt(2) / 2) == 0 and sp.simplify(A1x[1] - (3 - 3 * sp.sqrt(2) / 2)) == 0
assert sp.simplify(B1x[0] - 3 * sp.sqrt(2)) == 0 and B1x[1] == 3
ex(4, 158, S_1, 'ABC مثلث قائم في A و متساوي الساقين. 1) أنشئ A′ صورة A بالدوران الذي مركزه B وزاويته $90^\\circ$ في الاتجاه غير المباشر. هل ABA′C مربع؟ لماذا؟ 2) أنشئ صورة المثلث بالدوران الذي مركزه C وزاويته $45^\\circ$ في الاتجاه المباشر.',
   {'1': 'A′ (3 ; 3) في الشكل: BA′ = BA و $\\widehat{ABA\'} = 90^\\circ$ . ABA′C مربع: $\\widehat{CAB} = \\widehat{ABA\'} = 90^\\circ$ ، AB = BA′ = AC، و [AC] و [BA′] متوازيان ومتقايسان (الاتجاه غير المباشر يضع A′ في جهة C).',
    '2': {'C': 'C صورة نفسها (المركز)', "A1": '$A_1\\left(\\dfrac{3\\sqrt{2}}{2}\\,;\\,3 - \\dfrac{3\\sqrt{2}}{2}\\right)$ ($CA_1 = CA = 3$)', 'B1': '$B_1(3\\sqrt{2}\\,;\\,3)$ : تقع على المستقيم (CA′) لأنّ $\\widehat{ACB} = 45^\\circ$', 'image': 'المثلث $CA_1B_1$ قائم في $A_1$ ومتساوي الساقين'}},
   figure={'description': 'مثلث ABC قائم في A (A أسفل اليسار، B أسفل اليمين، C فوق A).', 'points': pts(**x4), 'rightAngles': ['A'],
           'platformPoints': pts(A_=(3, 3), A1=tuple(float(v) for v in A1x), B1=tuple(float(v) for v in B1x)),
           'reading': 'Coordonnées de la plateforme : A (0 ; 0), B (3 ; 0), C (0 ; 3) (AB = AC, comme le dessin).'})

pin = {}
for lab, (a1, a2) in {'BD': (255, 285), 'EF': (315, 345), 'MN': (15, 45), 'PQ': (105, 135), 'RS': (165, 195)}.items():
    pin[lab[0]] = polar((0, 0), 4, a1); pin[lab[1]] = polar((0, 0), 4, a2)
pin['A'] = (0, 0)
assert close(ang(pin['A'], pin['B'], pin['D']), 75) and close(ang(pin['B'], pin['A'], pin['D']), 30)


def tri_map(src, dst, deg, direct):
    return all(close(rot(pin[s], (0, 0), deg, direct), pin[t]) for s, t in zip(src, dst))


assert tri_map('BD', 'MN', 120, True) and tri_map('BD', 'PQ', 150, False) and tri_map('BD', 'RS', 90, False) and tri_map('MN', 'EF', 60, False)
assert tri_map('BD', 'PQ', 210, True) and tri_map('BD', 'RS', 270, True) and tri_map('BD', 'EF', 60, True)
ex(5, 158, S_1, 'لاحظ الشكل التالي: أتمم ما يلي: 1) المثلث AMN صورة ABD بالدوران الذي مركزه … و زاويته … في الاتجاه… . 2) المثلث APQ صورة ABD بالدوران الذي مركزه … و زاويته … في الاتجاه… . 3) المثلث ARS صورة ABD بالدوران الذي مركزه … و زاويته … في الاتجاه… . 4) المثلث AEF صورة AMN بالدوران الذي مركزه … و زاويته … في الاتجاه… .',
   {'1': 'مركزه A و زاويته $120^\\circ$ في الاتجاه المباشر (B → M ، D → N)',
    '2': 'مركزه A و زاويته $150^\\circ$ في الاتجاه غير المباشر (أو $210^\\circ$ في الاتجاه المباشر)',
    '3': 'مركزه A و زاويته $90^\\circ$ في الاتجاه غير المباشر (أو $270^\\circ$ في الاتجاه المباشر)',
    '4': 'مركزه A و زاويته $60^\\circ$ في الاتجاه غير المباشر',
    'apex': '$\\widehat{BAD} = 180^\\circ - 2 \\times 75^\\circ = 30^\\circ$ (المثلث ABD متساوي الساقين: AB = AD)'},
   figure={'description': 'ورقة مرصوفة ؛ «مروحة» من خمسة مثلثات خضراء متقايسة رأسها المشترك A: ABD نحو الأسفل (B يسار، D يمين، 75° عند B، ضلعاه [AB] و [AD] بالأحمر)، AEF أسفل اليمين، AMN أعلى اليمين، APQ أعلى اليسار، ARS يسار.',
           'points': pts(**pin), 'polygons': {'ABD': ['A', 'B', 'D'], 'AEF': ['A', 'E', 'F'], 'AMN': ['A', 'M', 'N'], 'APQ': ['A', 'P', 'Q'], 'ARS': ['A', 'R', 'S']},
           'angles': [{'vertex': 'B', 'from': 'D', 'to': 'A', 'deg': 75, 'label': '75°'}],
           'reading': 'Directions mesurées depuis A (≈ 210 px de rayon) : B 256,5°, D 284,8°, E 313,9°, F 342,1°, M 13,4°, N 49,9°, P 104,9°, Q 133,1°, R 165,1°, S 197,8°. Redessinées exactes (rayon 4, angle au sommet 30°) : BD à 255°/285°, EF +60°, MN +120°, PQ +210°, RS +270° — écart ≤ 5° avec le scan.'})
DISC.append({'elementId': 'ex-5', 'kind': 'reading', 'resolution': 'decided — rotation angles 120° direct, 150° indirect, 90° indirect, 60° indirect',
             'text': 'Aucun angle de rotation n’est imprimé : seuls 75° (en B) et les positions des cinq triangles. Mesuré sur le scan (directions des sommets depuis A, erreur ≈ ±5°, N le plus écarté : 49,9° pour 45°) puis arrondi aux multiples de 30° compatibles avec un angle au sommet de 30° ; figure redessinée exacte pour que les réponses soient vraies.'})

x6A, x6B = (0, 0), (4, 0)
x6C = rot(x6B, x6A, 90); x6M = (0, 1.5); x6N = rot(x6M, x6A, 90)
assert close(x6C, (0, 4)) and close(x6N, (-1.5, 0)) and close(d(x6B, x6M), d(x6C, x6N))
ex(6, 158, S_1, 'A و B نقطتان كيفيتان. C هي صورة B بالدّوران الذي مركزه A و زاويته $90^\\circ$ في الاتجاه المباشر. M نقطة تنتمي إلى [AC]. N هي صورة M بالدّوران الذي مركزه A و زاويته $90^\\circ$ في الاتجاه المباشر. برهن أن BM = CN.',
   {'proof': 'الدوران الذي مركزه A و زاويته $90^\\circ$ في الاتجاه المباشر يحوّل B إلى C و M إلى N، إذن يحوّل القطعة [BM] إلى القطعة [CN]. والدوران يحافظ على الأطوال: BM = CN.',
    'example': pts(A=x6A, B=x6B, C=x6C, M=x6M, N=x6N)},
   note='Pas de figure ; exemple de la plateforme A (0 ; 0), B (4 ; 0), C (0 ; 4), M (0 ; 1,5), N (−1,5 ; 0) : BM = CN = $\\sqrt{18{,}25}$ . N est sur la demi-droite opposée à [AB).')

# >>> PAGE 159
# ══ Page 159 — أوظّف تعلّماتي 7–14 ══════════════════════════════════════════
f1 = {'A': (-5, -4), 'B': (-1, -4), 'C': (-5, -2), 'D': (-3, 0), 'E': (-3, -2)}
f2 = {'H': (2, -5), 'F': (4, -5), 'G': (4, -1), 'K': (2, -3), 'L': (0, -3)}
corr7 = {'A': 'F', 'B': 'G', 'C': 'H', 'D': 'L', 'E': 'K'}
for s_, t_ in corr7.items():
    assert rot_exact(f1[s_], (0, 0), 90) == f2[t_]
ex(7, 159, S_1, 'لاحظ في الشكلين الآتيين، ② صورة ① بدوران مركزه O. عيّن زاوية و اتجاه هذا الدّوران.',
   {'angle': '$90^\\circ$', 'direction': 'الاتجاه المباشر', 'correspondence': 'A → F ، B → G ، C → H ، D → L ، E → K (الضلع [CA] الشاقولي يصبح [HF] الأفقي)'},
   figure={'description': 'ورقة مرصوفة ؛ الشكل ① (أخضر): مثلث ABC قائم في A (A أسفل، C فوقه، B على اليمين) ومثلث CDE قائم في E (D أعلى E) ؛ الشكل ② (أصفر): مثلث HFG قائم في F ومثلث HKL قائم في K ؛ النقطة O في الأعلى بين الشكلين.',
           'points': pts(O=(0, 0), **f1, **f2), 'polygons': {'ABC': ['A', 'B', 'C'], 'CDE': ['C', 'D', 'E'], 'HFG': ['H', 'F', 'G'], 'HKL': ['H', 'K', 'L']},
           'grid': {'unit': 1, 'xRange': [-6, 5], 'yRange': [-6, 1]},
           'reading': 'Mesuré à ≈ 145 px pour 2 carreaux (≈ 72 px / carreau) avec O à l’origine : A (−4,94 ; −4,30), B (−1,04 ; −4,16), C (−4,94 ; −2,24), D (−3,00 ; −0,06), E (−3,00 ; −2,14), H (1,90 ; −5,14), F (3,88 ; −5,14), G (3,88 ; −1,06), K (1,94 ; −3,08), L (−0,02 ; −3,10) → arrondis aux nœuds ; ② = image exacte de ① par la rotation de centre O, 90°, sens direct (assert).'})

sq = {'B': (-1, 1), 'C': (1, 1), 'D': (1, -1), 'E': (-1, -1)}
s3_ = math.sqrt(3)
x8 = dict(sq, O=(0, 0), A=(0, 1 + s3_), M=(-3, -1), N=(3, -1))
assert close(d(x8['A'], x8['B']), 2) and close(d(x8['A'], x8['C']), 2) and d(x8['M'], x8['E']) == 2 and d(x8['D'], x8['N']) == 2
assert close(rot(x8['B'], x8['A'], 60), x8['C']) and close(rot(x8['B'], (0, 0), 90, False), x8['C'])
assert close(rot(x8['B'], (0, 0), 90), x8['E']) and close(rot(x8['E'], (0, 0), 90), x8['D'])
assert close(rot(x8['D'], x8['E'], 180), x8['M']) and close(rot(x8['B'], x8['E'], 90), x8['M'])
ex(8, 159, S_1, 'لاحظ الشكل التالي: انقل و أتمم ما يلي: 1) C هي صورة B بالدوران الذي مركزه… و زاويته… في الاتجاه… . 2) E هي صورة B بالدوران الذي مركزه O وزاويته …في الاتجاه … . 3) D هي صورة E بالدوران الذي مركزه … وزاويته $90^\\circ$ في الاتجاه… . 4) M هي صورة D بالدوران الذي مركزه… وزاويته… في الاتجاه… . 5) M هي صورة B بالدوران الذي مركزه … وزاويته… في الاتجاه… .',
   {'1': 'مركزه A و زاويته $60^\\circ$ في الاتجاه المباشر (ABC متقايس الأضلاع) — أو مركزه O و زاويته $90^\\circ$ في الاتجاه غير المباشر',
    '2': 'زاويته $90^\\circ$ في الاتجاه المباشر', '3': 'مركزه O، في الاتجاه المباشر',
    '4': 'مركزه E و زاويته $180^\\circ$ (التناظر بالنسبة إلى E: ME = ED)', '5': 'مركزه E و زاويته $90^\\circ$ في الاتجاه المباشر (EB = EM و $\\widehat{BEM} = 90^\\circ$)'},
   figure={'description': 'مربع BCDE (B أعلى اليسار، C أعلى اليمين، D أسفل اليمين، E أسفل اليسار) قطراه يتقاطعان في O ؛ مثلث متقايس الأضلاع ABC فوقه (علامات ترميز على AB، AC، BC، BE، CD) ؛ M و N على المستقيم (ED) (علامات ترميز ME = EB و DN = DC) ؛ القطع [MB] و [NC] ؛ رموز زوايا قائمة في B، C، D، E.',
           'points': pts(**x8), 'segments': ['AB', 'AC', 'BC', 'CD', 'DE', 'EB', 'BD', 'CE', 'ME', 'DN', 'MB', 'NC'],
           'reading': 'Carré de côté 2 centré en O ; A (0 ; 1 + √3) ; M (−3 ; −1), N (3 ; −1) (ME = EB = 2, DN = DC = 2 d’après les codages). Le dessin du manuel a A un peu trop haut (hauteur ≈ 0,95 × BC au lieu de 0,87).'},
   note='Q1 admet deux réponses justes (A, 60°, direct ou O, 90°, indirect) ; le contexte (triangle équilatéral codé) vise A, 60°.')

e9 = {lab: polar((0, 0), 2, 90 + 120 * i) for i, lab in enumerate('ABC')}
img9 = {k: rot(p, (0, 0), 45) for k, p in e9.items()}
for extra in (165, 285):
    assert sorted((rnd(x, 6), rnd(y, 6)) for x, y in (rot(p, (0, 0), extra) for p in e9.values())) == sorted((rnd(x, 6), rnd(y, 6)) for x, y in img9.values())
ex(9, 159, S_1, 'ABC مثلث متقايس الأضلاع مركزه O. 1) أنشئ صورة ABC بالدوران الذي مركزه O وزاويته $45^\\circ$ في الاتجاه المباشر. نسمي A′، B′، C′ صور الرؤوس A، B، C، على الترتيب، بهذا الدّوران. 2) هل يمكن أن يكون المثلث A′B′C′ صورة ABC بدورانات أخرى؟ اشرح.',
   {'1': {'images': pts(A_=img9['A'], B_=img9['B'], C_=img9['C']), 'rule': 'OA′ = OA و $\\widehat{AOA\'} = 45^\\circ$ … ؛ A′B′C′ متقايس الأضلاع مركزه O'},
    '2': 'نعم (كمثلث، دون ترتيب الرؤوس): الدوران الذي مركزه O و زاويته $45^\\circ + 120^\\circ = 165^\\circ$ في الاتجاه المباشر، والدوران الذي مركزه O و زاويته $75^\\circ$ في الاتجاه غير المباشر ($45^\\circ - 120^\\circ$) ؛ لأنّ ABC صورة نفسه بالدوران الذي مركزه O و زاويته $120^\\circ$ (خاصية 3 ص 156).'},
   note='Pas de figure ; plateforme : cercle de rayon 2, A à 90°. Q2 ne garde pas la correspondance A → A′ (sinon la rotation est unique).')

x10 = {'A': polar((0, 0), 2, 60), 'B': polar((0, 0), 2, 180), 'C': polar((0, 0), 2, 300), 'D': polar((0, 0), 2, 135), 'E': polar((0, 0), 2, 315)}
BOC = ang(x10['B'], (0, 0), x10['C']); BDC = ang(x10['B'], x10['D'], x10['C']); DAB = ang(x10['D'], x10['A'], x10['B']); DBC = ang(x10['D'], x10['B'], x10['C'])
assert close(BOC, 120) and close(BDC, 60) and close(DAB, 22.5) and close(DBC, 97.5) and close(DAB + DBC, 120)
for t in (95, 110, 150, 170):                                   # D quelconque sur le petit arc AB : DAB + DBC = 120° constant
    Dt = polar((0, 0), 2, t)
    assert close(ang(Dt, x10['A'], x10['B']) + ang(Dt, x10['B'], x10['C']), 120) and close(ang(x10['B'], Dt, x10['C']), 60)
S_2 = 'الزوايا المحيطية و الزوايا المركزية'
ex(10, 159, S_2, 'ABC مثلث متقايس الأضلاع و O هي مركز الدّائرة المحيطة به. D و E نقطتان من هذه الدّائرة متناظرتان بالنسبة إلى O. عيّن أقياس الزوايا : $\\widehat{BOC}$ ، $\\widehat{BDC}$ ، $\\widehat{DAB}$ و $\\widehat{DBC}$ .',
   {'BOC': '$\\widehat{BOC} = 2\\widehat{BAC} = 120^\\circ$ (زاوية مركزية تحصر القوس BC مع الزاوية المحيطية BAC)',
    'BDC': '$\\widehat{BDC} = \\widehat{BAC} = 60^\\circ$ (زاويتان محيطيتان تحصران القوس BC)',
    'DAB': '$\\widehat{DAB} = \\dfrac{1}{2}\\widehat{DOB}$ — في الشكل ($\\widehat{DOB} \\approx 45^\\circ$): $\\widehat{DAB} \\approx 22{,}5^\\circ$',
    'DBC': '$\\widehat{DBC} = \\widehat{DBA} + 60^\\circ$ — في الشكل: $\\widehat{DBC} \\approx 97{,}5^\\circ$',
    'invariant': 'مهما كان موضع D على القوس AB الصغير: $\\widehat{DAB} + \\widehat{DBC} = 120^\\circ$'},
   figure={'description': 'دائرة مركزها O ومثلث متقايس الأضلاع ABC (A أعلى اليمين، B يسار، C أسفل) ؛ القطر [DE] (D أعلى اليسار بين A و B، E أسفل اليمين قرب C).',
           'circles': [{'center': [0, 0], 'radius': 2}], 'points': pts(O=(0, 0), **x10), 'segments': ['AB', 'BC', 'CA', 'DE'],
           'reading': 'Mesuré : A 62°, B 180°, C 301°, D 135°, E 317° (rayon ≈ 300 px) → A 60°, B 180°, C 300°, D 135°, E 315°.'})
DISC.append({'elementId': 'ex-10', 'kind': 'inconsistency', 'resolution': 'kept — figure value used (∠BOD = 45°); lessons should add « $\\widehat{BOD} = 45^\\circ$ » or ask only BOC, BDC and DAB + DBC',
             'text': 'L’énoncé ne fixe pas D (seulement D et E diamétralement opposés) : $\\widehat{BOC} = 120^\\circ$ et $\\widehat{BDC} = 60^\\circ$ sont déterminés, mais $\\widehat{DAB}$ et $\\widehat{DBC}$ dépendent de la position de D (seule leur somme vaut 120°, assert). La figure place D à ≈ 45° de B (∠BOD ≈ 45°) → 22,5° et 97,5°. E ne sert à rien dans les questions posées.'})

x11 = {'C': polar((0, 0), 2, 10), 'A': polar((0, 0), 2, 190), 'B': polar((0, 0), 2, -70), 'D': polar((0, 0), 2, 110)}
assert close(ang(x11['B'], (0, 0), x11['C']), 80) and close(ang(x11['B'], x11['A'], x11['C']), 40) and close(ang(x11['A'], x11['C'], x11['D']), 40)
assert close(ang(x11['B'], (0, 0), x11['D']), 180)
ex(11, 159, S_2, 'لاحظ الشكل التالي: برهن أن النقط O، B و D على استقامية.',
   {'proof': ['$\\widehat{BAC}$ زاوية محيطية و $\\widehat{BOC}$ زاوية مركزية تحصران القوس BC : $\\widehat{BAC} = \\dfrac{80^\\circ}{2} = 40^\\circ$ .',
              'الزاويتان المحيطيتان $\\widehat{BAC}$ و $\\widehat{ACD}$ متقايستان (الترميز) : $\\widehat{ACD} = 40^\\circ$ ، فالزاوية المركزية $\\widehat{AOD} = 80^\\circ$ .',
              '[AC] قطر: $\\widehat{COD} = 180^\\circ - 80^\\circ = 100^\\circ$ و $\\widehat{BOD} = \\widehat{BOC} + \\widehat{COD} = 80^\\circ + 100^\\circ = 180^\\circ$ : O، B، D على استقامية.']},
   figure={'description': 'دائرة مركزها O ؛ [AC] قطر (A يسار، C يمين) ؛ B أسفل و D أعلى اليسار ؛ القطع [AB]، [OB]، [CD] ؛ $\\widehat{BOC} = 80^\\circ$ ؛ قوسان مزدوجان متساويان في A ($\\widehat{BAC}$) وفي C ($\\widehat{ACD}$).',
           'circles': [{'center': [0, 0], 'radius': 2}], 'points': pts(O=(0, 0), **x11), 'segments': ['AC', 'AB', 'OB', 'CD'],
           'angles': [{'vertex': 'O', 'from': 'B', 'to': 'C', 'deg': 80, 'label': '80°'}], 'equalAngles': [['BAC', 'ACD']],
           'reading': 'Diamètre [AC] légèrement incliné (≈ 10°) comme le dessin ; B à −70° (∠BOC = 80°), D à 110° — [OD] n’est PAS tracé dans le manuel (c’est la conclusion).'},
   note='Les données (diamètre [AC], ∠BOC = 80°, angles égaux en A et C) ne sont QUE sur la figure. Autre preuve : angles alternes-internes égaux ⇒ (AB) ∥ (CD) ⇒ ABCD rectangle inscrit… (plus long).')
DISC.append({'elementId': 'ex-11', 'kind': 'reading', 'resolution': 'decided — data read on the figure, stated in the lessons',
             'text': 'Énoncé réduit à « لاحظ الشكل التالي: برهن أن النقط O، B و D على استقامية » : que [AC] est un diamètre (O sur [AC]), que $\\widehat{BOC} = 80^\\circ$ et que $\\widehat{BAC} = \\widehat{ACD}$ (doubles arcs) se lit uniquement sur la figure. Les leçons écrivent ces données.'})

x12 = {'B': (-2, 0), 'D': (2, 0), 'A': polar((0, 0), 2, 60), 'C': polar((0, 0), 2, 120)}


def inter(p1, p2, p3, p4):
    (x1_, y1_), (x2_, y2_), (x3_, y3_), (x4_, y4_) = p1, p2, p3, p4
    den = (x1_ - x2_) * (y3_ - y4_) - (y1_ - y2_) * (x3_ - x4_)
    t = ((x1_ - x3_) * (y3_ - y4_) - (y1_ - y3_) * (x3_ - x4_)) / den
    return (x1_ + t * (x2_ - x1_), y1_ + t * (y2_ - y1_))


x12['M'] = inter(x12['A'], x12['B'], x12['C'], x12['D'])
assert d(x12['M'], (0, 0)) < 2 and close(x12['M'], (0, 2 / math.sqrt(3)))
AMD = ang(x12['A'], x12['M'], x12['D']); CDB = ang(x12['C'], x12['D'], x12['B']); ABD = ang(x12['A'], x12['B'], x12['D'])
CMB = ang(x12['C'], x12['M'], x12['B']); COB = ang(x12['C'], (0, 0), x12['B']); AOD = ang(x12['A'], (0, 0), x12['D'])
assert close(AMD, CDB + ABD) and close(CMB, (COB + AOD) / 2) and close(CMB, 60)
for (ta, tc) in ((50, 140), (70, 100), (40, 150)):               # identités vraies hors du cas symétrique
    Aa, Cc = polar((0, 0), 2, ta), polar((0, 0), 2, tc)
    Mm = inter(Aa, x12['B'], Cc, x12['D'])
    assert close(ang(Aa, Mm, x12['D']), ang(Cc, x12['D'], x12['B']) + ang(Aa, x12['B'], x12['D']))
    assert close(ang(Cc, Mm, x12['B']), (ang(Cc, (0, 0), x12['B']) + ang(Aa, (0, 0), x12['D'])) / 2)
ex(12, 159, S_2, 'لاحظ الشكل أدناه : (P) دائرة مركزها O و [BD] قطر لها. (AB) و (CD) مستقيمان متقاطعان في M. 1) هل الزاوية $\\widehat{AMD}$ محيطية؟ 2) برهن أن $\\widehat{AMD} = \\widehat{CDB} + \\widehat{ABD}$ . 3) برهن أن $\\widehat{CMB} = \\dfrac{\\widehat{COB} + \\widehat{AOD}}{2}$ .',
   {'1': 'لا: رأسها M داخل الدائرة (لا ينتمي إلى (P)).',
    '2': 'في المثلث MBD، $\\widehat{AMD}$ زاوية خارجية (A، M، B على استقامية): $\\widehat{AMD} = 180^\\circ - \\widehat{BMD} = \\widehat{MBD} + \\widehat{MDB} = \\widehat{ABD} + \\widehat{CDB}$ .',
    '3': '$\\widehat{CMB} = \\widehat{AMD}$ (متقابلتان بالرأس) ؛ $\\widehat{CDB} = \\dfrac{1}{2}\\widehat{COB}$ و $\\widehat{ABD} = \\dfrac{1}{2}\\widehat{AOD}$ (محيطية / مركزية) ومنه النتيجة.',
    'figureValues': 'في الشكل (A عند $60^\\circ$ ، C عند $120^\\circ$): $\\widehat{COB} = \\widehat{AOD} = 60^\\circ$ و $\\widehat{CMB} = \\widehat{AMD} = 60^\\circ$'},
   figure={'description': 'دائرة (P) مركزها O والقطر [BD] أفقي (B يسار، D يمين) ؛ C و A على نصف الدائرة العلوي (C يسار، A يمين) ؛ نقطة سوداء غير مسمّاة داخل الدائرة فوق O هي M ؛ المستقيمان (AB) و (CD) غير مرسومين.',
           'circles': [{'center': [0, 0], 'radius': 2, 'label': '(P)'}], 'points': pts(O=(0, 0), **x12), 'segments': ['BD'],
           'reading': 'Mesuré : C ≈ 117°, A ≈ 64° → posés à 120° et 60° (symétriques, comme le dessin) ; le point sans nom au-dessus de O est exactement l’intersection M de (AB) et (CD) (0 ; 2/√3 ≈ 1,15 pour un rayon 2 ; mesuré ≈ 0,61 × rayon). Identités vérifiées aussi pour des positions non symétriques (assert).'},
   correction={'decidedBy': 'platform', 'decidedOn': '2026-10-04', 'printed': '1) هل الزاوية محيطية؟', 'corrected': '1) هل الزاوية $\\widehat{AMD}$ محيطية؟'})
DISC.append({'elementId': 'ex-12', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
             'text': 'Q1 imprimée « هل الزاوية محيطية؟ » : le nom de l’angle manque. Complété par $\\widehat{AMD}$ (l’angle des Q2–Q3, sommet M intérieur au cercle → non). Aussi : M est un point noir NON étiqueté sur la figure, et les droites (AB), (CD) ne sont pas tracées.'})

dec_c, dec_i = central(10), interior(10)
assert dec_c == 36 and close(dec_i, 144)
deca = {lab: polar((0, 0), 2, 108 - 36 * i) for i, lab in enumerate('ABCDEFGHIJ')}
assert close(ang(deca['A'], (0, 0), deca['B']), 36) and close(ang(deca['A'], deca['B'], deca['C']), 144)
S_3 = 'المضلعات المنتظمة'
ex(13, 159, S_3, 'ABCDEFGHIJ عشاري منتظم مركزه O. احسب القيمة المضبوطة للزاوية $\\widehat{ABC}$ ثم للزاوية $\\widehat{AOB}$ .',
   {'ABC': '$\\widehat{ABC} = \\dfrac{(10-2) \\times 180^\\circ}{10} = 144^\\circ$ (أو $2 \\times \\widehat{OBA}$ مع $\\widehat{OBA} = \\dfrac{180^\\circ - 36^\\circ}{2} = 72^\\circ$)', 'AOB': '$\\widehat{AOB} = \\dfrac{360^\\circ}{10} = 36^\\circ$'},
   figure={'description': 'عشاري منتظم ABCDEFGHIJ (A و B في الأعلى، الرؤوس في اتجاه عقارب الساعة) ؛ [OA]، [OB]، [OC] ؛ الزاوية ABC معلّمة بقوس.',
           'circles': [{'center': [0, 0], 'radius': 2, 'dashed': True}], 'points': pts(O=(0, 0), **deca), 'polygon': list('ABCDEFGHIJ'), 'segments': ['OA', 'OB', 'OC'],
           'reading': 'Sommets dans le sens HORAIRE (A 108°, B 72°, C 36°, D 0°, …) comme le dessin ; le cercle circonscrit n’est pas tracé dans le manuel.'},
   note='Ordre imprimé : ABC puis AOB (l’inverse de la méthode p. 157) ; on calcule naturellement AOB d’abord.')

R14 = sp.sqrt(8)
OL = sp.simplify(R14 * sp.cos(sp.pi / 4)); BL = sp.simplify(R14 * sp.sin(sp.pi / 4))
area14 = sp.simplify(8 * sp.Rational(1, 2) * R14 * BL)
assert OL == 2 and BL == 2 and area14 == 16 * sp.sqrt(2) and close(float(area14), 22.627416997969522)
assert sp.simplify(4 * R14 ** 2 * sp.sin(sp.pi / 4)) == area14 and close(interior(8), 135)
oct_ = {lab: polar((0, 0), math.sqrt(8), 90 + 45 * i) for i, lab in enumerate('ABCDEFGH')}
L14 = ((oct_['B'][0] + oct_['H'][0]) / 2, (oct_['B'][1] + oct_['H'][1]) / 2)
assert close(d((0, 0), L14), 2) and close(d(oct_['B'], L14), 2) and close(ang(oct_['B'], L14, (0, 0)), 90)
ex(14, 159, S_3, 'ABCDEFGH ثماني منتظم مركزه O حيث $OA = \\sqrt{8}$ (الوحدة هي cm) 1) عيّن قيس الزاوية $\\widehat{ABC}$ . 2) لماذا (BH) يعامد (OA) في L؟ 3) قارن $\\sin\\widehat{BOL}$ و $\\cos\\widehat{BOL}$ ثم احسب $\\sin 45^\\circ$ و $\\cos 45^\\circ$ . 4) احسب OL و BL. 5) احسب مساحة ABCDEFGH.',
   {'1': '$\\widehat{ABC} = \\dfrac{6 \\times 180^\\circ}{8} = 135^\\circ$',
    '2': 'AB = AH (ضلعان) و OB = OH (نصفا قطر) : (OA) محور القطعة [BH] فهو يعامدها في منتصفها L.',
    '3': '$\\widehat{BOL} = \\widehat{AOB} = 45^\\circ$ والمثلث BOL قائم في L فهو متساوي الساقين (BL = OL) : $\\sin\\widehat{BOL} = \\cos\\widehat{BOL}$ ؛ ومع $\\sin^2 + \\cos^2 = 1$ : $\\sin 45^\\circ = \\cos 45^\\circ = \\dfrac{\\sqrt{2}}{2}$',
    '4': '$OL = BL = \\sqrt{8} \\times \\dfrac{\\sqrt{2}}{2} = \\dfrac{\\sqrt{16}}{2} = 2$ cm',
    '5': 'المساحة = 8 × مساحة OAB = $8 \\times \\dfrac{1}{2} \\times OA \\times BL = 8 \\times \\dfrac{1}{2} \\times \\sqrt{8} \\times 2 = 8\\sqrt{8} = 16\\sqrt{2} \\approx 22{,}63$ cm²'},
   platformFigure={'circles': [{'center': [0, 0], 'radius': rnd(math.sqrt(8)), 'radiusExact': '\\sqrt{8}'}], 'points': pts(O=(0, 0), L=L14, **oct_), 'segments': ['BH', 'OA', 'OB'],
                   'reading': 'Pas de figure dans le manuel ; octogone de rayon √8, A à 90°, sens direct ; L milieu de [BH] sur [OA] à 2 cm de O.'},
   note='Mobilise l’unité 10 (sin, cos, sin² + cos² = 1). Q5 : la hauteur du triangle OAB issue de B est BL (puisque (BL) ⊥ (OA)).')

# >>> PAGE 160
# ══ Page 160 — أؤكّد تعلّماتي (QCM), أدمج تعلّماتي (وضعية) ══════════════════
q1 = {'A': polar((0, 0), 2, 30), 'B': polar((0, 0), 2, 150), 'C': polar((0, 0), 2, 210), 'D': polar((0, 0), 2, 330)}
assert close(ang(q1['B'], (0, 0), q1['C']), 60) and close(d(q1['A'], q1['B']), d(q1['C'], q1['D']))
img_q1 = {k: [n for n, p in q1.items() if close(rot(v, (0, 0), 60), p)] for k, v in q1.items()}
assert img_q1 == {'A': [], 'B': ['C'], 'C': [], 'D': ['A']}
assert [n for n, p in q1.items() if close(rot(q1['A'], (0, 0), 60, False), p)] == ['D']
q2 = {'O': (0, 0), 'A': polar((0, 0), 2, 180), 'C': polar((0, 0), 2, 70), 'B': polar((0, 0), 2, -70), 'E': (0.7, 0)}
q2['D'] = (2.9, 0)
assert not on_circle(q2['D'], (0, 0), 2) and not on_circle(q2['E'], (0, 0), 2) and close(ang(q2['B'], q2['A'], q2['C']), ang(q2['B'], (0, 0), q2['C']) / 2)
q3 = {'O': (0, 0), 'B': polar((0, 0), 2, 108), 'C': polar((0, 0), 2, 288), 'A': polar((0, 0), 2, 171)}
assert close(ang(q3['B'], q3['A'], q3['C']), 90) and close(ang(q3['B'], (0, 0), q3['C']), 180)
assert not close(ang(q3['A'], q3['B'], q3['C']), ang(q3['A'], q3['C'], q3['B']), 1e-3)
q4 = {'A': (0, 1), 'B': (1, 1), 'C': (1 + math.sqrt(3) / 2, 0.5), 'D': (1, 0), 'E': (0, 0)}
order4 = 'ABCDE'
sides4 = [d(q4[order4[i]], q4[order4[(i + 1) % 5]]) for i in range(5)]
angles4 = [ang(q4[order4[i - 1]], q4[order4[i]], q4[order4[(i + 1) % 5]]) for i in range(5)]
assert all(close(s_, 1) for s_ in sides4) and [round(a_) for a_ in angles4] == [90, 150, 60, 150, 90] and close(sum(angles4), 540)
E.append({
    'id': 'qcm', 'kind': 'qcm', 'page': 160, 'section': 'أؤكّد تعلّماتي', 'verified': True,
    'instruction': 'في كل حالة مما يلي اختر الإجابة أو الإجابات الصحيحة، وبرّر اختيارك.',
    'items': [
        {'number': 1, 'text': 'في الشكل أدناه: بالدوران الذي مركزه O و زاويته $60^\\circ$ في الاتجاه المباشر',
         'figure': {'description': 'مستطيل (B أعلى اليسار، A أعلى اليمين، D أسفل اليمين، C أسفل اليسار) قطراه [AC] و [BD] يتقاطعان في O ؛ $\\widehat{BOC} = 60^\\circ$ (قوس على اليسار).',
                    'points': pts(O=(0, 0), **q1), 'segments': ['AB', 'BC', 'CD', 'DA', 'AC', 'BD'], 'angles': [{'vertex': 'O', 'from': 'B', 'to': 'C', 'deg': 60, 'label': '60°'}],
                    'reading': 'Rapport des côtés mesuré ≈ 125 / 210 → demi-angle 30,8° : sommets à 30°, 150°, 210°, 330° sur le cercle de rayon OA (∠BOC = ∠AOD = 60°).'},
         'subItems': [
             {'text': 'صورة A هي', 'options': ['B', 'C', 'D'], 'correct': [], 'correctedText': 'صورة B هي', 'correctedCorrect': [1],
              'justification': 'A عند $30^\\circ$ ؛ صورتها بـ $60^\\circ$ في الاتجاه المباشر عند $90^\\circ$ : ليست رأسا من رؤوس المستطيل (D هي صورة A في الاتجاه غير المباشر). بعد التصحيح: صورة B ($150^\\circ$) هي C ($210^\\circ$).'},
             {'text': 'صورة D هي', 'options': ['B', 'C', 'A'], 'correct': [2], 'justification': 'OD = OA و $\\widehat{DOA} = 60^\\circ$ في الاتجاه المباشر (المثلث AOD متقايس الأضلاع).'},
             {'text': 'صورة O هي', 'options': ['A', 'O', 'C'], 'correct': [1], 'justification': 'المركز صورة نفسه.'},
         ], 'pages': '155 ,154'},
        {'number': 2, 'text': 'في الشكل الآتي',
         'figure': {'description': 'دائرة مركزها O ؛ A يسار، C أعلى، B أسفل على الدائرة ؛ D خارج الدائرة على اليمين و E داخلها بين O و D ؛ القطع [AC]، [AB]، [OC]، [OB]، [EC]، [EB]، [DC]، [DB].',
                    'circles': [{'center': [0, 0], 'radius': 2}], 'points': pts(**q2), 'segments': ['AC', 'AB', 'OC', 'OB', 'EC', 'EB', 'DC', 'DB']},
         'options': ['الزاوية $\\widehat{BAC}$ محيطية و الزاوية $\\widehat{BOC}$ مركزية مرفقة بها', 'الزاوية $\\widehat{BDC}$ محيطية و الزاوية $\\widehat{BEC}$ مركزية مرفقة بها', 'الزاوية $\\widehat{BDC}$ محيطية و الزاوية $\\widehat{BAC}$ مركزية مرفقة بها'],
         'correct': [0], 'pages': '156', 'justification': 'A على الدائرة و O مركزها ؛ D خارج الدائرة (فـ $\\widehat{BDC}$ ليست محيطية) و E ليست المركز.'},
        {'number': 3, 'text': 'في الشكل الآتي',
         'figure': {'description': 'دائرة مركزها O ؛ [BC] قطر (B أعلى، C أسفل) ؛ A على الدائرة يسارا ؛ [AB] و [AC].',
                    'circles': [{'center': [0, 0], 'radius': 2}], 'points': pts(**q3), 'segments': ['AB', 'AC', 'BC'], 'reading': 'Mesuré : B ≈ 109°, C ≈ 288° (diamètre), A ≈ 171°.'},
         'options': ['$\\widehat{BAC} = \\dfrac{1}{2}\\widehat{BOC}$', '$\\widehat{BAC} = 2\\widehat{BOC}$', '$\\widehat{ABC} = \\widehat{ACB}$'],
         'correct': [0], 'pages': '156', 'justification': '$\\widehat{BOC} = 180^\\circ$ (زاوية مستقيمة) و $\\widehat{BAC} = 90^\\circ$ ؛ (3) خطأ لأنّ A ليست منتصف القوس BC (في الشكل AB < AC).'},
        {'number': 4, 'text': 'المضلع الآتي',
         'figure': {'description': 'خماسي ABCDE: [AE] شاقولي، [AB] و [ED] أفقيان، C رأس على اليمين ؛ علامة ترميز واحدة على كل ضلع من الأضلاع الخمسة (أضلاع متقايسة) ؛ الزاويتان A و E قائمتان.',
                    'points': pts(**q4), 'polygon': list('ABCDE'), 'ticks': {'AB': 1, 'BC': 1, 'CD': 1, 'DE': 1, 'EA': 1}},
         'options': ['خماسي منتظم', 'خماسي غير منتظم', 'ليس خماسيا'], 'correct': [1], 'pages': '156',
         'justification': 'الأضلاع متقايسة لكن الزوايا لا: $\\widehat{A} = \\widehat{E} = 90^\\circ$ ، $\\widehat{B} = \\widehat{D} = 150^\\circ$ ، $\\widehat{C} = 60^\\circ$ (زاوية الخماسي المنتظم $108^\\circ$).'},
    ],
    'note': 'Colonnes imprimées (1) (2) (3) de droite à gauche ; options rangées ici (1), (2), (3) → index 0, 1, 2. Colonne « عند الحاجة أعود الى الصفحة » : 155 ,154 / 156 / 156 / 156. Item 1 a trois sous-questions.',
})
DISC.append({'elementId': 'qcm', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — item 1 first row asks « صورة B هي » (answer C); see items[0].subItems[0]',
             'text': 'QCM item 1, 1re ligne « صورة A هي » (options B, C, D) : avec ∠BOC = 60° dans le rectangle, A est à 30°, son image par 60° sens DIRECT est à 90° — aucun sommet ; aucune option n’est juste (D serait l’image en sens indirect, alors que la 2e ligne « صورة D هي … A » n’est juste qu’en sens direct). Correction minimale gardant les options : « صورة B هي » → C (assert).'})
DISC.append({'elementId': 'qcm', 'kind': 'reading', 'resolution': 'decided — central angle BOC = 180° accepted as « زاوية مركزية »',
             'text': 'QCM item 3 : la bonne réponse $\\widehat{BAC} = \\dfrac{1}{2}\\widehat{BOC}$ suppose qu’un angle plat (180°) soit une « زاوية مركزية » — cas limite (angle inscrit dans un demi-cercle = 90°) que les معارف ne mentionnent pas ; à expliciter dans la leçon.'})

R_sit, n_sit = 3, 6
chord_sit = side_exact(n_sit, R_sit)
arc_sit = 2 * math.pi * R_sit / n_sit
assert chord_sit == 3 and close(arc_sit, math.pi) and central(6) == 60
poles = {f'P{k + 1}': polar((0, 0), 3, 90 + 60 * k) for k in range(6)}
assert all(close(d(poles[f'P{k + 1}'], poles[f'P{(k + 1) % 6 + 1}']), 3) for k in range(6))
E.append({
    'id': 'situation', 'kind': 'situation', 'page': 160, 'section': 'أدمج تعلّماتي', 'verified': True, 'title': 'وضعية',
    'text': 'لإضافة لمسة جمالية على الحديقة العمومية للبلدية ارتأت المصلحة المعنية تخصيص حيّز دائريّ نصف قطره 3m لغرس الأزهار على أن تحيط به 6 أعمدة كهربائية متباعدة بنفس المسافة. اقترح مخططا لوضع هذه الأعمدة على محيط الحيز، مُحدّدا المسافة بين كل عمودين.',
    'analysis': {
        'قراءة الوضعية وفهمها': ['ما هو شكل الجزء المخصص لزراعة الأزهار؟', 'كيف توضع الأعمدة الكهربائية؟'],
        'تحليل الوضعية واختيار استراتيجية حل مناسبة': ['ماهي المهمة المطلوب إنجازها؟ كيف سيتم ذلك؟', 'ماذا يلزم لاختيار موقع الأعمدة؟', 'ما هي المسافة التي تفصل بين عمودين متتاليين؟'],
        'تنفيذ استراتيجية الحل المختارة': ['نختار مقياس مناسب، ثم نُنشئ مضلعا منتظما بحيث يكون كل رأس من المضلع هو موقع عمود إنارة.'],
    },
    'platformFigure': {'circles': [{'center': [0, 0], 'radius': 3, 'label': 'الحيّز'}], 'points': pts(O=(0, 0), **poles), 'polygon': list(poles), 'scale': '1 وحدة ↔ 1m',
                       'reading': 'Pas de figure dans le manuel ; poteaux P1…P6 aux sommets de l’hexagone régulier inscrit (P1 en haut).'},
    'answer': {
        'shape': 'الحيّز دائرة نصف قطرها 3m ؛ الأعمدة الستة رؤوس سداسي منتظم محاط بهذه الدائرة.',
        'angle': 'الزاوية المركزية بين عمودين متتاليين $\\dfrac{360^\\circ}{6} = 60^\\circ$ (كل عمود صورة السابق بالدوران الذي مركزه مركز الحيز وزاويته $60^\\circ$).',
        'distance': 'المثلث الذي رأساه عمودان متتاليان ورأسه الثالث المركز متساوي الساقين وزاويته الرئيسية $60^\\circ$ فهو متقايس الأضلاع: المسافة بين عمودين متتاليين = نصف القطر = 3m.',
        'plan': 'بمقياس مثلا 1cm ↔ 1m: نرسم دائرة نصف قطرها 3cm ونحمل عليها بالمدور (بنفس الفتحة 3cm) ست نقط متتالية.',
        'alongTheEdge': f'(إضافة) المسافة على طول المحيط بين عمودين: $\\dfrac{{2\\pi \\times 3}}{{6}} = \\pi \\approx {dec(arc_sit)}$ m',
    },
    'answerSource': 'computed',
    'note': 'Le cas favorable de l’hexagone (côté = rayon) rend la construction au compas immédiate. « نختار مقياس مناسب » (sic, pour « مقياسا مناسبا ») : graphie du manuel. Le brief du propriétaire évoquait aussi « distances entre les pointes d’une étoile » : c’est le تحدّ (p. 151), pas la وضعية.',
})

# >>> PAGE 161
# ══ Page 161 — أتعمّق 15–20 ═════════════════════════════════════════════════
S_5 = 'أتعمّق'
x15 = {'A': (0, 0), 'B': (4, 0)}
for prev, nxt in zip('BCDE', 'CDEF'):
    x15[nxt] = rot(x15[prev], x15['A'], 72)
FB = d(x15['F'], x15['B'])
assert close(rot(x15['F'], x15['A'], 72), x15['B']) and close(FB, 8 * math.sin(math.radians(36))) and abs(FB - 4.702) < 1e-3
assert all(close(d(x15['A'], x15[k]), 4) for k in 'BCDEF') and all(close(d(x15[a_], x15[b_]), FB) for a_, b_ in ('BC', 'CD', 'DE', 'EF'))
assert close(16 * math.pi, 50.26548245743669)
ex(15, 161, S_5, 'A و B نقطتان حيث AB = 4cm. C هي صورة B بالدّوران الذي مركزه A و زاويته $72^\\circ$ في الاتجاه المباشر. D هي صورة C، E صورة D و F صورة E بالدوران السابق. 1) احسب FB. 2) برهن أن المضلع ABCDEF منتظم. 3) احسب مساحة الدائرة المحيطة بـ ABCDEF.',
   {'1': f'F صورة E، و $4 \\times 72^\\circ = 288^\\circ$ فصورة F بنفس الدوران هي B ($5 \\times 72^\\circ = 360^\\circ$) : FB = BC = CD = DE = EF ؛ $FB = 2 \\times 4 \\times \\sin 36^\\circ \\approx {dec(FB)}$ cm',
    '2': 'B، C، D، E، F على الدائرة التي مركزها A ونصف قطرها 4cm، أضلاع BCDEF متقايسة والزوايا المركزية $\\widehat{BAC} = \\widehat{CAD} = … = 72^\\circ$ : BCDEF خماسي منتظم مركزه A (A ليست رأسا).',
    '3': 'الدائرة المحيطة بـ BCDEF مركزها A ونصف قطرها 4cm : مساحتها $\\pi \\times 4^2 = 16\\pi \\approx 50{,}27$ cm²'},
   correction={'decidedBy': 'platform', 'decidedOn': '2026-10-04', 'printed': 'المضلع ABCDEF … الدائرة المحيطة بـ ABCDEF', 'corrected': 'المضلع BCDEF … الدائرة المحيطة بـ BCDEF'},
   platformFigure={'circles': [{'center': [0, 0], 'radius': 4}], 'points': pts(**x15), 'polygon': list('BCDEF')})
DISC.append({'elementId': 'ex-15', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
             'text': '« برهن أن المضلع ABCDEF منتظم » et « الدائرة المحيطة بـ ABCDEF » : A est le CENTRE de la rotation, donc le centre du pentagone régulier BCDEF (5 × 72° = 360°, F → B, assert) ; ABCDEF n’est pas un polygone régulier (AB = 4 ≠ BC ≈ 4,70). Correction : BCDEF. FB ≈ 4,70 cm demande sin 36° (unité 10).'})

x16 = {'C': polar((0, 0), 2, -40), 'E': polar((0, 0), 2, 100), 'B': polar((0, 0), 2, 240), 'D': polar((0, 0), 2, 200)}
x16['A'] = inter(x16['E'], x16['D'], x16['B'], x16['C'])
assert close(ang(x16['E'], (0, 0), x16['C']), 140) and close(ang(x16['B'], x16['D'], x16['C']), 40)
assert close(ang(x16['E'], x16['B'], x16['C']), 70) and close(ang(x16['B'], x16['E'], x16['C']), 40)
ACE = ang(x16['A'], x16['C'], x16['E']); AEC = ang(x16['A'], x16['E'], x16['C']); EAC = ang(x16['E'], x16['A'], x16['C'])
assert close(ACE, 70) and close(AEC, 60) and close(EAC, 50) and d(x16['A'], (0, 0)) > 2
for t in (190, 210, 220):                                   # D ailleurs sur l'arc EB : ACE fixe, AEC varie
    Dt = polar((0, 0), 2, t); At = inter(x16['E'], Dt, x16['B'], x16['C'])
    assert close(ang(At, x16['C'], x16['E']), 70) and not close(ang(At, x16['E'], x16['C']), 60, 1e-3)
ex(16, 161, S_5, 'لاحظ الشكل التالي: عيّن أقياس زوايا المثلث AEC.',
   {'ACE': '$\\widehat{EBC} = \\dfrac{1}{2}\\widehat{EOC} = 70^\\circ$ و $\\widehat{BEC} = \\widehat{BDC} = 40^\\circ$ (تحصران القوس BC) ، ففي المثلث EBC: $\\widehat{BCE} = 180^\\circ - 70^\\circ - 40^\\circ = 70^\\circ$ أي $\\widehat{ACE} = 70^\\circ$',
    'AEC': '$\\widehat{AEC} = \\widehat{DEC}$ تحصر القوس DC ؛ في الشكل المعاد رسمه ($\\widehat{DOB} = 40^\\circ$): $\\widehat{AEC} = \\dfrac{40^\\circ + 80^\\circ}{2} = 60^\\circ$',
    'EAC': '$\\widehat{EAC} = 180^\\circ - 70^\\circ - 60^\\circ = 50^\\circ$',
    'determined': 'المعطيات تحدّد $\\widehat{ACE} = 70^\\circ$ والمثلث EBC ($70^\\circ$ ، $40^\\circ$ ، $70^\\circ$) فقط.'},
   figure={'description': 'دائرة مركزها O ؛ E أعلى، D يسار، B أسفل، C يمين ؛ المستقيمان (ED) و (CB) يتقاطعان في A خارج الدائرة (أسفل اليسار) ؛ القطع [EB]، [EO]، [OC]، [EC]، [DC]، [DB] ؛ $\\widehat{EOC} = 140^\\circ$ و $\\widehat{BDC} = 40^\\circ$ مظلّلتان.',
           'circles': [{'center': [0, 0], 'radius': 2}], 'points': pts(O=(0, 0), **x16), 'segments': ['EB', 'EO', 'OC', 'EC', 'DC', 'DB'], 'lines': [{'through': ['E', 'A']}, {'through': ['A', 'C']}],
           'angles': [{'vertex': 'O', 'from': 'C', 'to': 'E', 'deg': 140, 'label': '140°'}, {'vertex': 'D', 'from': 'B', 'to': 'C', 'deg': 40, 'label': '40°'}],
           'reading': 'Mesuré (rayon ≈ 252 px) : E 100°, C −40°, B 242°, D 196°. Posé C −40°, E 100°, B 240° (arc BC = 80° imposé par 40°), D 200° (arc DB = 40°, à 4° du scan).'})
DISC.append({'elementId': 'ex-16', 'kind': 'inconsistency', 'resolution': 'decided — D fixed at ∠DOB = 40° (figure ≈ 46°) → AEC = 60°, EAC = 50°; lessons add « $\\widehat{DOB} = 40^\\circ$ » or ask the triangle EBC',
             'text': 'Les données (∠EOC = 140°, ∠BDC = 40°) fixent ∠ACE = 70° (et le triangle EBC : 70°, 40°, 70°) mais PAS ∠AEC ni ∠EAC, qui dépendent de la position de D sur l’arc EB (assert). La figure place D à ≈ 46° de B ; la plateforme fixe 40° (AEC = 60°, EAC = 50°) et le déclare. Possible intention du manuel : « زوايا المثلث EBC ».'})

A17, B17, C17 = (0, 4), (-3, 1), (5, -1)
E17 = ((B17[0] + C17[0]) / 2, (B17[1] + C17[1]) / 2)
D17 = rot_exact(A17, E17, 180)
assert E17 == (1, 0) and D17 == (2, -4)
D17 = (2, -4)
AB17 = (B17[0] - A17[0], B17[1] - A17[1]); AC17 = (C17[0] - A17[0], C17[1] - A17[1])
assert AB17[0] * AC17[0] + AB17[1] * AC17[1] == 0 and (D17[0] - B17[0], D17[1] - B17[1]) == AC17
cr = lambda o, p, q: (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0])
assert cr(B17, C17, A17) * cr(B17, C17, D17) < 0 and cr(A17, D17, B17) * cr(A17, D17, C17) < 0      # [BC] et [AD] se coupent : ABCD croisé, ABDC rectangle
ex(17, 161, S_5, 'من امتحان شهادة التعليم المتوسط. المستوي مزود بمعلم متعامد ومتجانس $(O\\,;\\,\\vec{i},\\,\\vec{j})$ . 1) علّم النقط: $A(0\\,;\\,4)$ ، $B(-3\\,;\\,1)$ ، $C(5\\,;\\,-1)$ . 2) احسب إحداثيتي النقطة E منتصف القطعة [BC]. 3) أنشئ النقطة D صورة A بالدوران الذي مركزه E وزاويته $180^\\circ$ ثم استنتج إحداثيتي D. 4) بيّن أن الرباعي ABCD مستطيل.',
   {'2': '$E\\left(\\dfrac{-3 + 5}{2}\\,;\\,\\dfrac{1 - 1}{2}\\right) = (1\\,;\\,0)$',
    '3': 'الدوران الذي زاويته $180^\\circ$ هو التناظر بالنسبة إلى E : E منتصف [AD] و $D(2\\,;\\,-4)$',
    '4': 'E منتصف القطرين [BC] و [AD] : ABDC متوازي أضلاع ؛ $AB^2 = 18$ ، $AC^2 = 50$ ، $BC^2 = 68 = 18 + 50$ : قائم في A فـ ABDC مستطيل (أو: AD = BC = $\\sqrt{68}$).'},
   correction={'decidedBy': 'platform', 'decidedOn': '2026-10-04', 'printed': 'بيّن أن الرباعي ABCD مستطيل', 'corrected': 'بيّن أن الرباعي ABDC مستطيل'},
   grid={'unit': 1, 'xRange': [-4, 6], 'yRange': [-5, 5]})
DISC.append({'elementId': 'ex-17', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
             'text': '« بيّن أن الرباعي ABCD مستطيل » : E est le milieu de [BC] et de [AD], donc les diagonales sont [BC] et [AD] et le rectangle est ABDC ; A, B, C, D dans l’ordre imprimé donnent un quadrilatère CROISÉ (assert). Même coquille que l’unité 12 (ex. 12 et 26). Correction : ABDC.'})

g18 = {'A': (0, 1), 'B': (1, 0), 'A_': (2, 0), 'B_': (3, 1), 'M': (1, 3), 'N': (0, 2), 'P': (2, 2), 'M_': (3, 3), 'N_': (4, 2), 'P_': (4, 4)}
O18, W18 = (1.5, 1.5), (2, 4)
assert close(rot(g18['A'], O18, 90), g18['A_']) and close(rot(g18['B'], O18, 90), g18['B_'])
assert all(close(rot(g18[k], W18, 90), g18[k + '_']) for k in 'MNP')
assert not all(close(rot(g18[k], (2, 2), 90, False), g18[k + '_']) for k in 'MNP')
ex(18, 161, S_5, 'لاحظ الشكل التالي: 1) [A′B′] هي صورة [AB] بدوران مركزه O. أنشئ O. 2) المثلث M′N′P′ هو صورة المثلث MNP بدوران مركزه W. أنشئ W.',
   {'method': 'المركز متساوي البعد عن كل نقطة وصورتها: هو نقطة تقاطع محوري [AA′] و [BB′] (وكذلك محوري [MM′] و [NN′]).',
    '1': 'O (1,5 ; 1,5) في معلم المرصوفة (مركز مربع) ؛ زاوية الدوران $90^\\circ$ في الاتجاه المباشر.',
    '2': 'W (2 ; 4) (عقدة من المرصوفة) ؛ زاوية الدوران $90^\\circ$ في الاتجاه المباشر (N → N′ أسفل، P → P′ أعلى).'},
   figure={'description': 'ورقة مرصوفة باهتة ؛ مثلث MNP (M أعلى، N يسار، P يمين، [NP] أفقي) ومثلث M′N′P′ على يمينه ([N′P′] شاقولي، M′ يسار) ؛ في الأسفل [AB] نازلة نحو اليمين و [A′B′] صاعدة نحو اليمين.',
           'points': pts(**g18), 'polygons': {'MNP': ['M', 'N', 'P'], "M'N'P'": ["M'", "N'", "P'"]}, 'segments': ['AB', "A'B'"], 'grid': {'unit': 1, 'xRange': [0, 4], 'yRange': [0, 4]},
           'reading': 'completed', 'readingNote': 'Scan très pâle, relu en contraste renforcé : lignes à ≈ 100 px, tous les points sur des nœuds (repère choisi : origine au nœud de N … A en (0 ; 1)). Étiquettes N′ (en bas) et P′ (en haut) à peine lisibles : confirmées par la seule rotation qui envoie M sur M′ (assert ; l’ordre inverse n’est l’image d’aucune rotation).'})
DISC.append({'elementId': 'ex-18', 'kind': 'completion', 'resolution': 'completed — labels N′/P′ and node positions fixed by the unique rotation (assert)',
             'text': 'Figure quasi effacée (quadrillage et étiquettes) : coordonnées relues en contraste renforcé sur les nœuds ; les étiquettes N′ (bas) et P′ (haut) sont déduites — avec cet ordre M′N′P′ est l’image de MNP par la rotation de centre W (2 ; 4), 90° direct ; et [A′B′] celle de [AB] par la rotation de centre O (1,5 ; 1,5), 90° direct.'})

side19 = sp.Rational(96, 6)
OH19 = sp.simplify(side19 * sp.sqrt(3) / 2)
aAOB = sp.simplify(sp.Rational(1, 2) * side19 * OH19)
S19 = 6 * aAOB; Sp19 = sp.pi * side19 ** 2
ratio19 = sp.simplify(S19 / Sp19)
assert side19 == 16 and OH19 == 8 * sp.sqrt(3) and aAOB == 64 * sp.sqrt(3) and S19 == 384 * sp.sqrt(3)
assert sp.simplify(ratio19 - 3 * sp.sqrt(3) / (2 * sp.pi)) == 0 and abs(float(ratio19) - 0.827) < 1e-3 and side_exact(6, 16) == 16
hexa = {lab: polar((0, 0), 16, a) for lab, a in zip('ABCDEF', (180, 120, 60, 0, 300, 240))}
H19 = ((hexa['B'][0] + hexa['C'][0]) / 2, (hexa['B'][1] + hexa['C'][1]) / 2)
assert close(d((0, 0), H19), float(OH19))
ex(19, 161, S_5, 'محيط السداسي المنتظم ABCDEF المقابل هو 96m. 1) أحسب طول ضلع منه. 2) [OH] هو ارتفاع في المثلث المتقايس الأضلاع OBC. - بيّن أنّ $OH = 8\\sqrt{3}$ m. 3) احسب المساحة المضبوطة للمثلث AOB ثم استنتج S مساحة السداسي المنتظم ABCDEF. 4) احسب النسبة $\\dfrac{S}{S\'}$ حيث S′ هي مساحة القرص الذي مركزه O ونصف قطره OA.',
   {'1': '$\\dfrac{96}{6} = 16$ m', '2': 'OB = BC = 16 و H منتصف [BC] : $OH^2 = 16^2 - 8^2 = 192$ ، $OH = \\sqrt{192} = 8\\sqrt{3}$ m',
    '3': 'مساحة AOB = $\\dfrac{16 \\times 8\\sqrt{3}}{2} = 64\\sqrt{3}$ m² (متقايس الأضلاع مثل OBC) ؛ $S = 6 \\times 64\\sqrt{3} = 384\\sqrt{3} \\approx 665{,}11$ m²',
    '4': '$S\' = \\pi \\times 16^2 = 256\\pi$ m² ؛ $\\dfrac{S}{S\'} = \\dfrac{384\\sqrt{3}}{256\\pi} = \\dfrac{3\\sqrt{3}}{2\\pi} \\approx 0{,}83$'},
   figure={'description': 'سداسي منتظم ABCDEF (أضلاعه بالأحمر) في دائرته المحيطة: A يسار، B أعلى اليسار، C أعلى اليمين، D يمين، E أسفل اليمين، F أسفل اليسار ؛ الأقطار [AD]، [BE]، [CF] متقطعة تمر بـ O ؛ [OH] عمودي على [BC] (رمز زاوية قائمة في H).',
           'circles': [{'center': [0, 0], 'radius': 16}], 'points': pts(O=(0, 0), H=H19, **hexa), 'polygon': list('ABCDEF'), 'rightAngles': ['H'],
           'reading': 'Sommets dans le sens HORAIRE (A 180°, B 120°, …), rayon 16 (= côté). Le manuel ne demande pas d’arrondi pour S.'})

AB20, BC20 = 8, 3
BAC20 = math.degrees(math.asin(BC20 / AB20))
assert round(BAC20) == 22 and close(BAC20, 22.024312837042164) and 2 * round(BAC20) == 44
DF20 = sp.Rational(BC20) * (AB20 + AB20 // 2) / AB20
assert DF20 == sp.Rational(9, 2)
O20, A20, B20 = (0, 0), (-4, 0), (4, 0)
C20 = polar(O20, 4, 2 * BAC20)
F20 = (8, 0)
D20 = inter(A20, C20, F20, (F20[0] + C20[0] - B20[0], F20[1] + C20[1] - B20[1]))
assert close(d(B20, C20), 3) and close(ang(A20, C20, B20), 90) and close(d(D20, F20), 4.5)
ex(20, 161, S_5, 'من امتحان شهادة التعليم المتوسط. (T) دائرة مركزها O وقطرها AB = 8cm، C نقطة من الدائرة حيث: BC = 3cm. 1) احسب بالتدوير إلى الوحدة من الدرجة قيس الزاوية $\\widehat{BAC}$ ثم استنتج قيس الزاوية $\\widehat{BOC}$ . 2) F هي صورة B بالإنسحاب الذي شعاعه $\\overrightarrow{OB}$ ، المستقيم الذي يشمل F ويوازي (BC) يقطع (AC) في D. - أحسب DF. ملاحظة: يُطلب إنجاز الشكل الهندسي.',
   {'1': 'المثلث ABC قائم في C ([AB] قطر) : $\\sin\\widehat{BAC} = \\dfrac{BC}{AB} = \\dfrac{3}{8}$ ، $\\widehat{BAC} \\approx 22^\\circ$ ؛ $\\widehat{BOC} = 2\\widehat{BAC} \\approx 44^\\circ$ (زاوية مركزية / محيطية تحصران القوس BC)',
    '2': 'AF = AB + BF = 8 + 4 = 12 cm ؛ (BC) // (DF) : خاصية طالس في المثلث AFD: $\\dfrac{AB}{AF} = \\dfrac{BC}{FD}$ أي $\\dfrac{8}{12} = \\dfrac{3}{DF}$ ومنه DF = 4,5 cm'},
   platformFigure={'circles': [{'center': [0, 0], 'radius': 4, 'label': '(T)'}], 'points': pts(O=O20, A=A20, B=B20, C=C20, F=F20, D=D20),
                   'reading': 'Pas de figure (« يُطلب إنجاز الشكل ») ; O origine, [AB] horizontal, C au-dessus (∠BOC exact = 2 arcsin(3/8) ≈ 44,05°).'},
   note='Mobilise les unités 9 (Thales) et 10 (sinus) ; « بالتدوير إلى الوحدة » : 22° puis 44° (le calcul exact 2 × 22,02° = 44,05° arrondit aussi à 44°).')

# ══ Destinations ═════════════════════════════════════════════════════════════
L1, L2, L3, L4, L5 = 'mafhum-dawaran', 'khawas-dawaran', 'zawiya-muhitiya', 'mudalaat-muntazama', 'wadiya-idmajiya-dawaran'
DEST = {
    '_comment': 'elementId → { lesson, module } ; `duplicatedIn` autorise une seconde utilisation déclarée ; `items` répartit un élément. Modules : 0 أستعدّ, 1 أنشطة/entrée, 2 معارف, 3 طرائق, 4 تمارين (synthèse : 1 وضعية, 2 QCM, 3 تمارين).',
    'objectives': {'lesson': 'unit', 'module': 'page'},
    'intro-nature': {'lesson': 'unit', 'module': 'page', 'duplicatedIn': [{'lesson': L4, 'module': 1, 'note': 'les bras de l’étoile de mer : pentagone régulier, rotation de 72°'}]},
    'challenge': {'lesson': L4, 'module': 1, 'duplicatedIn': [{'lesson': 'unit', 'module': 'page', 'note': 'énoncé seul, sans réponse'}]},
    'prep': {'lesson': L1, 'module': 0, 'items': {'1': {'lesson': L4, 'module': 0}, '2': {'lesson': L2, 'module': 0}, '3': {'lesson': L1, 'module': 0},
                                                  '4': {'lesson': L3, 'module': 0}, '5': {'lesson': L3, 'module': 0}}},
    'act-1': {'lesson': L1, 'module': 1}, 'act-2': {'lesson': L1, 'module': 1}, 'act-3': {'lesson': L1, 'module': 1},
    'know-1': {'lesson': L1, 'module': 2}, 'know-2': {'lesson': L1, 'module': 2},
    'method-point': {'lesson': L1, 'module': 3}, 'method-segment': {'lesson': L1, 'module': 3},
    'know-3': {'lesson': L2, 'module': 2}, 'method-properties': {'lesson': L2, 'module': 3},
    'now-155': {'lesson': L2, 'module': 3, 'duplicatedIn': [{'lesson': L1, 'module': 3, 'note': 'construction point par point de O′, A′, B′'}]},
    'act-4': {'lesson': L3, 'module': 1}, 'know-4': {'lesson': L3, 'module': 2},
    'act-5': {'lesson': L4, 'module': 1}, 'know-5': {'lesson': L4, 'module': 2},
    'method-angle': {'lesson': L4, 'module': 3}, 'method-construct': {'lesson': L4, 'module': 3}, 'method-side': {'lesson': L4, 'module': 3}, 'now-157': {'lesson': L4, 'module': 3},
    'qcm': {'lesson': L5, 'module': 2, 'items': {'1': {'lesson': L5, 'module': 2, 'dup': L1}, '2': {'lesson': L5, 'module': 2, 'dup': L3}, '3': {'lesson': L5, 'module': 2, 'dup': L3}, '4': {'lesson': L5, 'module': 2, 'dup': L4}},
            'duplicatedIn': [{'lesson': L1, 'module': 5, 'note': 'item 1 (corrigé) dans le إختبار'}, {'lesson': L3, 'module': 5, 'note': 'items 2–3'}, {'lesson': L4, 'module': 5, 'note': 'item 4'}]},
    'situation': {'lesson': L5, 'module': 1, 'duplicatedIn': [{'lesson': L5, 'module': 4, 'note': 'transposée : autre rayon / autre nombre de poteaux (4, 8, 5 → côté r√2, 2r sin 22,5°, 2r sin 36°)'}]},
}
for n in (1, 2, 3, 5, 7):
    DEST[f'ex-{n}'] = {'lesson': L1, 'module': 4}
for n in (4, 6, 8, 17, 18):
    DEST[f'ex-{n}'] = {'lesson': L2, 'module': 4}
for n in (10, 11, 12, 16):
    DEST[f'ex-{n}'] = {'lesson': L3, 'module': 4}
for n in (9, 13, 14, 19):
    DEST[f'ex-{n}'] = {'lesson': L4, 'module': 4}
DEST['ex-15'] = {'lesson': L5, 'module': 3, 'duplicatedIn': [{'lesson': L4, 'module': 4, 'note': 'pentagone BCDEF construit par rotations de 72° (après correction)'}]}
DEST['ex-20'] = {'lesson': L5, 'module': 3, 'duplicatedIn': [{'lesson': L3, 'module': 4, 'note': 'question 1 : angle au centre = 2 × angle inscrit'}]}

ids = [e['id'] for e in E]
assert len(ids) == len(set(ids)), ids
missing = [i for i in ids if i not in DEST]
assert not missing, missing
extra = [k for k in DEST if k != '_comment' and k not in ids]
assert not extra, extra
assert sorted(int(i[3:]) for i in ids if i.startswith('ex-')) == list(range(1, 21))
per = {}
for k, d_ in DEST.items():
    if k.startswith('ex-'):
        per[d_['lesson']] = per.get(d_['lesson'], 0) + 1
assert per == {L1: 5, L2: 5, L3: 4, L4: 4, L5: 2}, per
for e in E:
    assert 151 <= e['page'] <= 161, e['id']

NOTES = {
    'destinationRationale': {
        'challenge': 'Le تحدّ (étoile du drapeau, 10 cm entre pointes consécutives) est une construction de pentagone régulier par rotation de 72° → ' + L4 + ' (entrée, module 1) ; la page d’unité le montre sans réponse (duplicatedIn).',
        'prep': 'Item 1 (triangle équilatéral par les angles) → ' + L4 + ' ; item 2 (triangle rectangle isocèle, réutilisé par method-properties et ex-4) → ' + L2 + ' ; item 3 (mesure d’angles, angles supplémentaires) → ' + L1 + ' (rapporteur) ; items 4–5 (cercle circonscrit, triangle inscrit dans un demi-cercle) → ' + L3 + '.',
        'now-155': 'Image d’un angle de 45° : la réponse attendue repose sur « الدوران يحافظ على الزوايا » → ' + L2 + ' (dup ' + L1 + ' pour la construction).',
        'exercises': 'Sections du manuel : صورة شكل بدوران (1–9), الزوايا المحيطية والمركزية (10–12), المضلعات المنتظمة (13–14), أتعمّق (15–20). L1 = construire / reconnaître une rotation (1, 2, 3, 5, 7) ; L2 = utiliser les propriétés (4 carré, 6 BM = CN, 8 rotations multiples dans une figure codée, 17 BEM rotation 180° + rectangle, 18 retrouver le centre par médiatrices) ; L3 = 10, 11, 12, 16 ; L4 = 9 (triangle équilatéral invariant par 120°), 13, 14, 19 ; L5 = 15 (rotation 72° ⇒ pentagone + aire du cercle) et 20 (BEM : angle inscrit + translation + Thales).',
        'balance': 'Le manuel n’a que 20 exercices : 5 + 5 + 4 + 4 + 2. L3 et L4 n’en possèdent que 4 chacune mais reçoivent un doublon déclaré (ex-20 → L3, ex-15 → L4) ; L5 garde deux أتعمّق transversaux comme demandé. La banque de pratique complète L3/L4.',
        'qcm': 'Item 1 → L1 (image d’un point, après correction « صورة B ») ; items 2–3 → L3 ; item 4 → L4.',
    },
    'labAdvancedLevel': {
        L1: ['act-2 (image d’un point par 70° au compas + rapporteur, sens de la flèche)', 'act-3 (rotation de 72° d’un segment, d’une droite passant / ne passant pas par O, d’une demi-droite, d’un cercle)'],
        L2: ['method-properties (OAB, OCD rectangles isocèles en O : [AC] → [BD] par 90°, AC = BD et (AC) ⊥ (BD))', 'ex-18 (retrouver le centre O / W comme intersection de médiatrices)'],
        L3: ['act-4 (D glisse sur le grand arc : ∠ADB reste la moitié de ∠AOB — Mezian puis Houaria)', 'ex-12 (M intérieur : ∠CMB = (∠COB + ∠AOD)/2, angle NON inscrit)'],
        L4: ['method-construct (pentagone de côté 3 cm : E = rotation de B autour de A de 108°, puis médiatrices)', 'challenge (étoile du drapeau : pentagone de côté 10 cm, R ≈ 8,51 cm)'],
        L5: ['situation (6 poteaux sur un cercle de 3 m : hexagone, distance = rayon = 3 m)', 'ex-15 (cinq rotations de 72° autour de A ⇒ pentagone régulier BCDEF)'],
    },
}

OUT = {
    '_comment': 'EXTRACTION CANONIQUE du manuel scolaire officiel — 4AM, الجيل الثاني, unité 13 « الدوران - الزوايا - المضلّعات المنتظمة ». Générée par build-extraction.py (ne pas éditer à la main).',
    'unitCode': 'dawaran-mudalaat',
    'textbook': {'title': 'كتاب الرياضيات — السنة الرابعة من التعليم المتوسط', 'generation': 'الجيل الثاني', 'unitNumber': 13,
                 'unitTitle': 'الدوران - الزوايا - المضلّعات المنتظمة', 'chapter': 'handasa', 'pages': {'first': 151, 'last': 161}, 'pdfPageOffset': 150,
                 'sections': ['سأتعلّم في هذا الباب', 'تحدّ', 'أستعدّ', 'أنشطة', 'معارف', 'طرائق', 'دوري الآن', 'أوظّف تعلّماتي', 'أؤكّد تعلّماتي', 'أدمج تعلّماتي', 'أتعمّق']},
    'frozenAt': '2026-10-04',
    'scope': 'Unité complète, 11 pages (151–161) : 5 activités (la 5e ne traite que le triangle équilatéral), 5 blocs de معارف, 7 طرائق, 2 « دوري الآن », 14 exercices أوظّف, QCM 4 items, une وضعية, 6 exercices أتعمّق. Pas de page « أوظّف تكنولوجيات الإعلام والاتصال ».',
    'terminology': {'note': 'Le manuel écrit « الدّوران الذي مركزه O وزاويته α في الاتجاه المباشر » ; « الاتجاه المباشر » = « الاتجاه الموجب » = sens inverse des aiguilles d’une montre ; « الاتجاه غير المباشر » = « الاتجاه السالب » = « اتجاه حركة عقارب الساعة ». Angles notés $\\widehat{AOA\'}$ , arcs $\\overset{\\frown}{AB}$ ; « تحصر القوس » (intercepte l’arc), « مرفقة بها » (angle au centre associé). Le titre de la page d’unité écrit « المضلّعات المنتظمة » (le nom du fichier PDF dit « الأضلاع المنتظمة »).',
                    'terms': ['الدوران', 'مركز الدوران', 'زاوية الدوران', 'اتجاه الدوران', 'الاتجاه المباشر', 'الاتجاه الموجب', 'الاتجاه غير المباشر', 'الاتجاه السالب', 'اتجاه حركة عقارب الساعة', 'صورة نقطة بدوران', 'التناظر بالنسبة إلى نقطة',
                              'الزاوية المركزية', 'الزاوية المحيطية', 'القوس', 'تحصر القوس', 'مرفقة بها', 'وتر', 'قطر', 'الدائرة المحيطة', 'المضلع المنتظم', 'مركز المضلع المنتظم',
                              'مثلث متقايس الأضلاع', 'مربع', 'خماسي منتظم', 'سداسي منتظم', 'سباعي منتظم', 'ثماني منتظم', 'عشاري منتظم', 'استقامية النقط', 'محور قطعة']},
    'notes': NOTES,
    'elements': E,
    'discrepancies': DISC,
    'destinations': DEST,
}
Path(__file__).with_name('extraction.json').write_text(json.dumps(OUT, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{len(E)} éléments, {len(DISC)} écarts, {len(DEST) - 1} destinations')
