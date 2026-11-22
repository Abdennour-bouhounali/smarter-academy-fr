#!/usr/bin/env python3
"""Génère docs/sources/4am/unit14/extraction.json — unité 14 « الهندسة في الفضاء » (pp. 163–169).

Transcription VISUELLE du scan (« وحدة الهندسة في الفضاء.pdf », 7 pages CamScanner, sans couche texte, page PDF
N = page du manuel 162 + N — numéros imprimés relus en bas de page : 163 … 169), pages rendues à 300 dpi puis
découpées passage par passage (≤ 900 px).

PÉRIMÈTRE : le scan s'arrête à la p. 169 (fin des طرائق de معارف 3). Les pages suivantes du manuel (section plane
d'une pyramide / d'un cône, التكبير والتصغير en معارف, تمارين, أؤكّد, أدمج تعلّماتي, أتعمّق) n'ont PAS été fournies :
écarts `missing_page`, contenus à écrire par la plateforme comme ajouts déclarés (`knowledge_formalization`).

Le texte arabe est celui du manuel, au mot près ; les passages illisibles sont complétés et marqués
`reading: 'completed'` (+ un écart `completion`). Les réponses ne viennent PAS du manuel : elles sont CALCULÉES ici
(`answerSource: computed`) — exactes par sympy (multiples de π, radicaux), arrondis contrôlés par assert — et les
figures d'espace sont données en coordonnées 3D (`figure.points3d`, repère orthonormé direct, z vers le haut, cm)
d'où chaque réponse est re-dérivée par assert.

Usage : python3 docs/sources/4am/unit14/build-extraction.py
"""
import json
from pathlib import Path

import sympy as sp

pi = sp.pi
R_ = sp.Rational
sqrt = sp.sqrt
TOL = 1e-9


# ── Outils ───────────────────────────────────────────────────────────────────
def num(x):
    """Nombre JSON : entier si entier, sinon flottant (arrondi 6)."""
    v = float(x)
    if abs(v - round(v)) < 1e-12:
        return int(round(v))
    return round(v, 6)


def p3(**kw):
    """points3d : {nom: [x, y, z]} ; un `_` final dans le nom devient ′ (M_ → M′)."""
    return {k.replace('_', '′'): [num(c) for c in v] for k, v in kw.items()}


def vec(a, b):
    return tuple(sp.nsimplify(b[i]) - sp.nsimplify(a[i]) for i in range(3))


def dist(a, b):
    return sp.sqrt(sum(c ** 2 for c in vec(a, b)))


def dot(u, v):
    return sp.simplify(sum(u[i] * v[i] for i in range(3)))


def cross(u, v):
    return (u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0])


def mid(a, b):
    return tuple((sp.nsimplify(a[i]) + sp.nsimplify(b[i])) / 2 for i in range(3))


def is_rectangle(P, Q, Rr, S):
    """PQRS (dans cet ordre) est un rectangle : parallélogramme + angle droit en P."""
    return all(sp.simplify(vec(P, Q)[i] - vec(S, Rr)[i]) == 0 for i in range(3)) and dot(vec(P, Q), vec(P, S)) == 0


def coplanar(*ps):
    a = ps[0]
    n = cross(vec(a, ps[1]), vec(a, ps[2]))
    return all(dot(n, vec(a, p)) == 0 for p in ps[3:])


def dec(x, nd=2):
    """Écriture décimale à virgule (LaTeX {,}) d'une valeur arrondie à nd décimales."""
    s = f'{float(x):.{nd}f}'
    return s.replace('.', '{,}')


def rnd(x, nd):
    return round(float(x) + 1e-12, nd)


E = []
DISC = []


def disc(elementId, kind, printed, corrected, reason, resolution):
    DISC.append({'elementId': elementId, 'kind': kind, 'printed': printed, 'corrected': corrected, 'reason': reason, 'resolution': resolution})


# Formules de référence (programme 4AM)
def V_cyl(r, h):
    return pi * sp.nsimplify(r) ** 2 * sp.nsimplify(h)


def V_cone(r, h):
    return pi * sp.nsimplify(r) ** 2 * sp.nsimplify(h) / 3


def V_ball(r):
    return R_(4, 3) * pi * sp.nsimplify(r) ** 3


def A_sphere(r):
    return 4 * pi * sp.nsimplify(r) ** 2


def V_frustum(r1, r2, h):
    r1, r2, h = map(sp.nsimplify, (r1, r2, h))
    return pi * h / 3 * (r1 ** 2 + r1 * r2 + r2 ** 2)


# ══ Page 163 — ouverture, مدخل (أرخميدس), تحدّ, أستعدّ ═════════════════════════
E.append({
    'id': 'objectives', 'kind': 'objectives', 'page': 163, 'section': 'سأتعلّم في هذا الباب', 'verified': True,
    'items': [
        'التعرّف على الكرة و الجلّة.',
        'تمثيل الكرة.',
        'حساب مساحة الكرة و حجم الجلة.',
        'معرفة و استعمال المقاطع المستوية للمجسمات المألوفة.',
        'معرفة الآثار على مساحة و حجم مجسم عند تكبير أو تصغير أبعاد هذا المجسم.',
    ],
})

# أرخميدس : كرة نصف قطرها R داخل أسطوانة ارتفاعها 2R ونصف قطر قاعدتها R
Rs = sp.symbols('R', positive=True)
A_lat_cyl = 2 * pi * Rs * (2 * Rs)
V_cyl_arch = pi * Rs ** 2 * (2 * Rs)
assert sp.simplify(A_sphere(1) * Rs ** 2 - A_lat_cyl) == 0                 # 4πR² = 2πR·2R
assert sp.simplify(V_ball(1) * Rs ** 3 - R_(2, 3) * V_cyl_arch) == 0       # 4/3πR³ = 2/3 · 2πR³
E.append({
    'id': 'intro-archimedes', 'kind': 'aside', 'page': 163, 'section': 'مدخل الباب', 'title': 'أرخميدس', 'verified': True,
    'text': 'أرخميدس (287 ق م - 212 ق م) هو عالم رياضيات و فيزياء و مخترع. أبرز اكتشافاته قانون طفو الأجسام و الذي ينص على أنّ وزن الجسم المغمور بالمياه يُساوي كميّة الماء المُزاح. و من أشهر اكتشافاته طُرق حساب المساحات و الحجوم، حيث اعتمد على استبدال الشكل الأصلي بأشكال يعلم حساب مساحتها أو حجمها و تكون مقرّبة كثيرا من الشكل الأصلي. وُضعت كُرة نصف قطرها R داخل أسطوانة ارتفاعها 2R و نصف قطر قاعدتها R (انظر الشكل). توصّل أرخميدس في هذه الوضعية إلى أنّ مساحة الكُرة تُساوي المساحة الجانبية للأسطوانة و أنّ حجم الكرة يُساوي ثُلثي حجم الأسطوانة.',
    'figure': {
        'description': 'أسطوانة دوران شفافة (قاعدتاها قطعان ناقصان، الجزء الخلفي منقّط) بداخلها كرة وردية مماسّة للقاعدتين وللسطح الجانبي ؛ قطر شاقولي منقّط يصل نقطة التماس العليا بالسفلى ؛ نصف قطر أفقي منقّط مكتوب عليه R ؛ دائرة كبرى أفقية (استواء) مرسومة بقطع ناقص (الخلفي منقّط).',
        'kind': 'space', 'solid': 'cylinder', 'inscribed': 'sphere',
        'dims': {'R': 1, 'cylinderRadius': 1, 'cylinderHeight': 2},
        'points3d': p3(O=(0, 0, 0), N=(0, 0, 1), S=(0, 0, -1), M=(1, 0, 0)),
        'reading': 'Repère : O centre de la boule à l’origine, axe du cylindre = (Oz), R = 1 (figure sans valeur numérique). N, S, M : noms de la plateforme (le manuel ne nomme aucun point).',
    },
    'answer': {
        'area': 'مساحة الكرة $4\\pi R^2$ ؛ المساحة الجانبية للأسطوانة $2\\pi R \\times 2R = 4\\pi R^2$ : متساويتان.',
        'volume': 'حجم الأسطوانة $\\pi R^2 \\times 2R = 2\\pi R^3$ ؛ حجم الجلّة $\\dfrac{4}{3}\\pi R^3 = \\dfrac{2}{3} \\times 2\\pi R^3$ .',
    },
    'answerSource': 'computed',
    'note': 'Le manuel écrit « حجم الكرة » : au sens strict du chapitre (know-1) le volume est celui de الجلّة (la boule) ; voir discrepancies.',
})
disc('intro-archimedes', 'reading', 'و أنّ حجم الكرة يُساوي ثُلثي حجم الأسطوانة', 'و أنّ حجم الجلّة يُساوي ثُلثي حجم الأسطوانة',
     'Le chapitre distingue الكرة (surface) et الجلّة (solide, know-1, know-2 « حجم الجلّة ») ; l’intro emploie « حجم الكرة » (usage courant). Texte cité tel quel sur la page d’unité ; les leçons, quand elles reformulent, écrivent « حجم الجلّة ».',
     'kept_in_quote — lessons reformulate with الجلّة')

# تحدّ — دلو (مخروط مبتور) : قطر الحافة العلوية 40 cm، قطر القاع 30 cm ؛ السهمان على اليسار متتاليان :
# 7cm من الحافة العلوية إلى مستوى الماء، 28cm من مستوى الماء إلى القاع  ⇒ ارتفاع الدلو 35 cm وعمق الماء 28 cm.
r_top, r_bot = 20, 15
H_b, h_w = 35, 28
r_w = sp.nsimplify(r_bot + R_(r_top - r_bot, H_b) * h_w)               # rayon à la surface de l'eau
assert r_w == 19
V_w = V_frustum(r_bot, r_w, h_w)
assert V_w == R_(24388, 3) * pi
# vérification par différence de cônes (sommet du cône complet sous le fond)
h_apex_bot = sp.nsimplify(r_bot * H_b / (r_top - r_bot))                 # 105 : hauteur du petit cône de base 15
assert h_apex_bot == 105 and sp.simplify(V_cone(r_w, h_apex_bot + h_w) - V_cone(r_bot, h_apex_bot) - V_w) == 0
assert rnd(V_w, 1) == 25539.1 and round(float(V_w) / 1000, 2) == 25.54
V_bucket = V_frustum(r_bot, r_top, H_b)
assert V_bucket == R_(32375, 3) * pi                                      # 35/3 · (225 + 300 + 400) π
# lecture alternative : 28 cm = hauteur totale du seau, eau à 21 cm du fond
h_w_alt = 21
r_w_alt = sp.nsimplify(r_bot + R_(r_top - r_bot, 28) * h_w_alt)
assert r_w_alt == R_(75, 4)
V_w_alt = V_frustum(r_bot, r_w_alt, h_w_alt)
assert V_w_alt == R_(96075, 16) * pi
assert rnd(V_w_alt, 1) == 18864.3
E.append({
    'id': 'challenge', 'kind': 'challenge', 'page': 163, 'section': 'تحدّ', 'verified': True,
    'text': 'يُمثّل الشكل المقابل دلوًا فيه ماء، و هو ناتج من مخروط مبتور. إذا علمت أنّ مستوى الماء يبعد عن الحافة العلوية للدلو بـ 7cm، فاحسب حجم الماء المُحتوى في هذا الدلو.',
    'figure': {
        'description': 'دلو على شكل مخروط دوران مبتور (القاعدة الكبرى في الأعلى) مع مقبض أحمر نصف دائري ؛ سهم أفقي فوقه 40cm (قطر الحافة العلوية) وسهم أفقي تحته 30cm (قطر القاع) ؛ على اليسار سهمان شاقوليان متتاليان: 7cm من مستوى الحافة العلوية إلى خطّ منقّط أحمر (مستوى الماء) ثم 28cm من مستوى الماء إلى مستوى القاع ؛ القطع الناقص للقاع منقّط في الخلف.',
        'kind': 'space', 'solid': 'frustum',
        'dims': {'topDiameter': 40, 'bottomDiameter': 30, 'height': H_b, 'rimToWater': 7, 'waterDepth': h_w, 'waterRadius': num(r_w)},
        'points3d': p3(O=(0, 0, 0), O1=(0, 0, H_b), W=(0, 0, h_w), A=(15, 0, 0), B=(20, 0, H_b), M=(19, 0, h_w)),
        'reading': 'Décidé au zoom 300 dpi : les deux flèches de cotation sont EMPILÉES — 7cm entre la ligne pointillée du bord supérieur et la ligne pointillée rouge du niveau d’eau, 28cm entre ce niveau et la ligne du fond. Hauteur du seau 35 cm, profondeur d’eau 28 cm. Repère : O centre du fond, axe (Oz) ; O1 centre du bord, W centre de la surface d’eau, A/B/M sur une génératrice (noms de la plateforme).',
    },
    'answer': {
        'method': 'نُكمل المخروط: الدلو جزء من مخروط دوران رأسه تحت القاع. نصف القطر يزداد بـ 5 cm على 35 cm، أي $\\dfrac{1}{7}$ cm لكل 1 cm من الارتفاع.',
        'waterRadius': 'نصف قطر سطح الماء: $15 + 28 \\times \\dfrac{5}{35} = 19$ cm (خاصية طالس في مقطع محوري).',
        'cones': 'المخروط الكامل الذي قاعدته القاع: ارتفاعه $\\dfrac{15 \\times 35}{5} = 105$ cm ؛ المخروط الذي قاعدته سطح الماء: ارتفاعه $105 + 28 = 133$ cm.',
        'volume': f'$V = \\dfrac{{1}}{{3}}\\pi \\times 19^2 \\times 133 - \\dfrac{{1}}{{3}}\\pi \\times 15^2 \\times 105 = \\dfrac{{24388}}{{3}}\\pi \\approx {dec(V_w, 1)}$ cm³ ، أي حوالي $25{{,}}54$ L.',
        'formula': 'أو مباشرة: $V = \\dfrac{\\pi h}{3}(R^2 + Rr + r^2) = \\dfrac{28\\pi}{3}(19^2 + 19 \\times 15 + 15^2) = \\dfrac{24388}{3}\\pi$ cm³ (صيغة خارج البرنامج).',
        'exact': '\\frac{24388}{3}\\pi', 'approx': rnd(V_w, 1), 'unit': 'cm³',
        'alternative': f'إذا قُرئ 28cm ارتفاعًا كليًا للدلو (الماء على ارتفاع 21 cm من القاع): نصف قطر سطح الماء $15 + 21 \\times \\dfrac{{5}}{{28}} = 18{{,}}75$ cm و $V = \\dfrac{{96075}}{{16}}\\pi \\approx {dec(V_w_alt, 1)}$ cm³ — قراءة مرفوضة: السهمان على الشكل متتاليان.',
        'bucketVolume': f'حجم الدلو كاملا (للمقارنة): $\\dfrac{{32375}}{{3}}\\pi \\approx {dec(V_bucket, 1)}$ cm³.',
    },
    'answerSource': 'computed',
    'note': 'Synthèse (wadiya-idmajiya-fada) : Thales dans la coupe axiale + volume du cône + le petit cône (fond) est une RÉDUCTION du cône complet de rapport 105/133 = 15/19 (volumes dans le rapport (15/19)³). La formule du tronc de cône n’est pas au programme 4AM : on passe par la différence de deux cônes.',
})
disc('challenge', 'reading', '7cm / 28cm (deux cotes verticales à gauche du seau)', 'profondeur d’eau = 28 cm, hauteur du seau = 35 cm (V = 24388π/3 ≈ 25539,1 cm³)',
     'Au zoom les flèches sont empilées : 7cm du bord au niveau d’eau, 28cm du niveau d’eau au fond. Lecture alternative (28 cm = hauteur totale, eau sur 21 cm) : V = 96075π/16 ≈ 18864,3 cm³, gardée sous answer.alternative.',
     'decided — water depth 28 cm; alternative in answer.alternative')

# أستعدّ
C1 = 2 * pi * 3
A2 = pi * 3 ** 2
AD3, AB3, BC3 = 3, 5, 6
DE3 = R_(AD3, AB3) * BC3
V4, V5 = 2 ** 3, 2 * 3 * 4
V6, V7, V8 = V_cyl(2, 2), V_cone(2, 2), R_(1, 3) * 3 ** 2 * 3
assert C1 == 6 * pi and C1 != 6 and A2 == 9 * pi and DE3 == R_(18, 5) and DE3 / 6 == R_(3, 5)
assert V4 == 8 and V5 == 24 and V6 == 8 * pi and V7 == R_(8, 3) * pi and V8 == 9
# figure de l'item 3 : B origine, (BC) axe x, (BA) axe y (plan)
A3, B3, C3 = (0, 5), (0, 0), (6, 0)
D3, E3 = (0, 2), (float(DE3), 2)
assert abs((E3[1] - A3[1]) * (C3[0] - A3[0]) - (E3[0] - A3[0]) * (C3[1] - A3[1])) < TOL   # E ∈ (AC)
E.append({
    'id': 'prep', 'kind': 'prep', 'page': 163, 'section': 'أستعدّ', 'verified': True,
    'instruction': 'أصحيح أم خاطئ؟ برّر إجابتك.',
    'items': [
        {'number': 1, 'text': 'محيط دائرة نصف قطرها 3cm هو 6cm.', 'answer': False,
         'justification': 'المحيط $= 2\\pi r = 2 \\times \\pi \\times 3 = 6\\pi$ cm $\\approx 18{,}85$ cm لا 6 cm (نُسي العدد $\\pi$).'},
        {'number': 2, 'text': 'مساحة قرص نصف قطره 3cm هو $(9\\pi)\\text{cm}^2$ .', 'answer': True,
         'justification': 'المساحة $= \\pi r^2 = \\pi \\times 3^2 = 9\\pi$ cm² .'},
        {'number': 3, 'text': 'في الشكل المقابل، المثلثان ABC و ADE في وضعية طالس. إذن $\\dfrac{DE}{6} = \\dfrac{3}{5}$ .', 'answer': True,
         'justification': '(DE) و (BC) عموديان على (AB) فهما متوازيان ؛ D ∈ [AB] و E ∈ [AC] : $\\dfrac{AD}{AB} = \\dfrac{DE}{BC}$ أي $\\dfrac{3}{5} = \\dfrac{DE}{6}$ (DE = 3,6).',
         'figure': {'description': 'مثلث ABC قائم في B ([AB] شاقولي، A في الأعلى، [BC] أفقي في الأسفل) ؛ D على [AB] و E على [AC] و [DE] أفقي ؛ رمزا زاوية قائمة في D وفي B ؛ على يسار [AB] سهمان: 3 (من A إلى D) و 5 (من A إلى B) ؛ 6 تحت [BC].',
                    'kind': 'plane', 'points': {'A': list(A3), 'B': list(B3), 'C': list(C3), 'D': list(D3), 'E': [num(E3[0]), 2]},
                    'segments': ['AB', 'BC', 'CA', 'DE'], 'rightAngles': ['B', 'D'], 'labels': {'AD': '3', 'AB': '5', 'BC': '6'}}},
        {'number': 4, 'text': 'حجم مكعب طول حرفه 2cm هو 6cm³.', 'answer': False,
         'justification': '$V = 2^3 = 8$ cm³ لا 6 cm³ (الخطأ: $2 \\times 3$ بدل $2^3$).'},
        {'number': 5, 'text': 'حجم متوازي مستطيلات أبعاده 2cm، 3cm و 4cm هو 24cm³.', 'answer': True,
         'justification': '$V = 2 \\times 3 \\times 4 = 24$ cm³ .'},
        {'number': 6, 'text': 'حجم أسطوانة دوران نصف قطر قاعدتها 2cm و ارتفاعها 2cm هو $(4\\pi)\\text{cm}^3$ .', 'answer': False,
         'justification': '$V = \\pi r^2 h = \\pi \\times 2^2 \\times 2 = 8\\pi$ cm³ لا $4\\pi$ cm³ (مساحة القاعدة وحدها $4\\pi$ cm²).'},
        {'number': 7, 'text': 'حجم مخروط دوران نصف قطر قاعدته 2cm و ارتفاعه 2cm هو $(4\\pi)\\text{cm}^3$ .', 'answer': False,
         'justification': '$V = \\dfrac{1}{3}\\pi r^2 h = \\dfrac{1}{3}\\pi \\times 4 \\times 2 = \\dfrac{8}{3}\\pi$ cm³ $\\approx 8{,}38$ cm³ لا $4\\pi$ cm³ .'},
        {'number': 8, 'text': 'حجم هرم قاعدته مربع طول ضلعه 3cm و ارتفاعه 3cm هو 9cm³.', 'answer': True,
         'justification': '$V = \\dfrac{1}{3} \\times 3^2 \\times 3 = 9$ cm³ .'},
    ],
    'answerSource': 'computed',
    'note': 'Prérequis : périmètre / aire du disque (1–2, → kura-julla), Thales (3, → takbir-tasghir : rapport de réduction), volumes cube / pavé / cylindre (4–6, → misaha-hajm-kura), cône / pyramide (7–8, → takbir-tasghir : la section parallèle à la base est une réduction). « $(4\\pi)\\text{cm}^3$ » : les parenthèses du manuel signifient « 4π cm³ ».',
})
disc('prep', 'reading', '(4π)cm³ — items 6 et 7 ; (9π)cm² — item 2', '$4\\pi$ cm³ ; $9\\pi$ cm²',
     'Notation du manuel : la parenthèse groupe le coefficient π avant l’unité, sans produit caché. Items 6 et 7 sont faux (8π et 8π/3) ; item 2 vrai.',
     'kept — lessons write $4\\pi$ cm³')

# >>> PAGE 164
# ══ Page 164 — أنشطة 1–3 (الجزء 1) ═════════════════════════════════════════════
E.append({
    'id': 'act-1', 'kind': 'activity', 'number': 1, 'page': 164, 'section': 'أنشطة', 'title': 'الكُرة و الجُلّة', 'verified': True,
    'parts': [
        {'label': '1)', 'text': 'ميّز بين نقاط دائرة و نقاط قرص لهما نفس المركز و نصف قطر كل منهما 4cm.'},
        {'label': '2)', 'text': 'الكرة المستعملة في رياضة كرة اليد هو مجسّم كُروي أجوف، إنّه نموذج لكائن رياضياتي يُسمّى الكُرة. بينما الكُرية المستعملة في رياضة الكرة الحديدية هي مُجسّم كروي مملوء، إنّه نموذج لكائن رياضياتي يُسمّى الجُلّة.'},
        {'label': '3)', 'text': 'اذكر مُجسمات أخرى متواجدة في محيطك تُعتبر نموذجًا لكرة أو جُلّة.'},
        {'label': '4)', 'text': 'r عدد موجب تماما. انقل ثم اتمم ما يلي: مجموعة النقط من الفضاء التي تبعد بمسافة ثابتة r عن نقطة ثابتة O هي.....ذات المركز O و نصف القطر r. مجموعة النقط من الفضاء التي تبعد بمسافة أصغر من أو تُساوي r عن نقطة ثابتة O هي.....ذات المركز O و نصف القطر r.'},
    ],
    'figure': {
        'description': 'صورتان: كُرية حديدية لامعة (كرة حديدية / pétanque) على اليسار، و كرة يد (خماسيات صفراء و زرقاء) على اليمين. لا رسم هندسي.',
        'kind': 'photo',
    },
    'answer': {
        '1': 'نقاط الدائرة M تحقّق OM = 4 cm (على الحافة فقط) ؛ نقاط القرص تحقّق OM ≤ 4 cm (الحافة و الداخل).',
        '3': 'أمثلة: كرة القدم، الكرة الأرضية (تقريبًا)، فقاعة الصابون (كُرة) ؛ حبّة برتقال، كُرية زجاجية (بِلْية)، حبّة لؤلؤ (جُلّة).',
        '4': 'الأولى هي **الكُرة** ذات المركز O و نصف القطر r (OM = r) ؛ الثانية هي **الجُلّة** ذات المركز O و نصف القطر r (OM ≤ r).',
    },
    'answerSource': 'computed',
    'note': 'Analogie plan → espace : cercle / disque ↔ sphère (الكرة, creuse : ballon de handball) / boule (الجلّة, pleine : boule de pétanque « الكرة الحديدية »). Ce n’est pas un poids de lancer (shot-put) : la photo est une boule de pétanque.',
})

# نشاط 2 — مقطع كرة بمستو : O = origine, (NS) = axe z, R = 3, I(0,0,x), M(√(9 − x²), 0, x)
R2 = 3
xs = [0, R_(5, 4), 2, R_(14, 5)]
sec2 = {}
for x in xs:
    IM2 = R2 ** 2 - x ** 2
    r = sp.sqrt(IM2)
    M = (r, 0, x)
    assert sp.simplify(dist((0, 0, 0), M) - R2) == 0 and dot(vec((0, 0, x), M), (0, 0, 1)) == 0
    sec2[x] = (IM2, r)
assert sec2[0] == (9, 3)
assert sec2[R_(5, 4)] == (R_(119, 16), sp.sqrt(119) / 4) and rnd(sec2[R_(5, 4)][1], 2) == 2.73
assert sec2[2] == (5, sp.sqrt(5)) and rnd(sec2[2][1], 2) == 2.24
assert sec2[R_(14, 5)] == (R_(29, 25), sp.sqrt(29) / 5) and rnd(sec2[R_(14, 5)][1], 2) == 1.08
assert R2 ** 2 - 3 ** 2 == 0
E.append({
    'id': 'act-2', 'kind': 'activity', 'number': 2, 'page': 164, 'section': 'أنشطة', 'title': 'مقطع كُرة بمستو', 'verified': True,
    'intro': 'وحدة الأطوال هي السنتيمتر. (d) كرة مركزها O و نصف قطرها 3 . I نقطة من قطرها [NS]. (P) هو المستوي العمودي في النقطة I على المستقيم (NS). يُسمّى الطول OI المسافة بين النقطة O و المستوي (P)، نضع OI = x. (انظر الشكل). نسمي مقطع الكرة (d) بالمستوي (P) مجموعة النقط المشتركة بين الكرة (d) و المستوي (P).',
    'parts': [
        {'label': '1)', 'text': 'لتكن M نقطة من هذا المقطع، اكتب عبارة $IM^2$ بدلالة x. حدّد في كل حالة ممّا يلي طبيعة و عناصر المقطع المتحصّل عليه. $x = 0$ ؛ $x = 1{,}25$ ؛ $x = 2$ ؛ $x = 2{,}8$'},
        {'label': '2)', 'text': 'حدّد موضع النقطة M في حالة $x = 3$ . ما هي النقط المشتركة بين الكرة و المستوي في هذه الحالة؟'},
    ],
    'figure': {
        'description': 'كرة (دائرة محيطها) مركزها O و قطرها الشاقولي [NS] منقّط ؛ دائرة كبرى أفقية (قطع ناقص، الخلفي منقّط) ؛ مستو (P) أفقي أخضر شفاف قرب القمة يقطع [NS] في I ؛ المقطع دائرة صغيرة (قطع ناقص منقّط) عليها M ، و [IM] منقّط مع رمز زاوية قائمة في I.',
        'kind': 'space', 'solid': 'sphere', 'dims': {'R': R2, 'x': 2},
        'points3d': p3(O=(0, 0, 0), N=(0, 0, 3), S=(0, 0, -3), I=(0, 0, 2), M=(sec2[2][1], 0, 2)),
        'plane': {'name': '(P)', 'normal': [0, 0, 1], 'through': 'I'},
        'reading': 'Repère : O origine, (NS) = axe (Oz), N en haut. Le dessin place (P) vers OI ≈ 2,4 ; les coordonnées sont données pour x = 2 (OM = 3, IM = √5, assert) et se recalculent pour chaque x : I(0 ; 0 ; x), M(√(9 − x²) ; 0 ; x).',
    },
    'answer': {
        '1': 'المثلث OIM قائم في I ($[IM] \\subset (P) \\perp (NS)$) و OM = 3 (M على الكرة) ؛ حسب فيثاغورس: $IM^2 = OM^2 - OI^2 = 9 - x^2$ .',
        'x=0': 'IM² = 9 ، IM = 3 : المقطع دائرة مركزها I = O و نصف قطرها 3 (دائرة كبرى).',
        'x=1,25': f'$IM^2 = 9 - 1{{,}}5625 = 7{{,}}4375$ ، $IM = \\dfrac{{\\sqrt{{119}}}}{{4}} \\approx {dec(sec2[R_(5, 4)][1])}$ : دائرة مركزها I و نصف قطرها $\\approx 2{{,}}73$ .',
        'x=2': f'$IM^2 = 9 - 4 = 5$ ، $IM = \\sqrt{{5}} \\approx {dec(sec2[2][1])}$ : دائرة مركزها I و نصف قطرها $\\sqrt{{5}}$ .',
        'x=2,8': f'$IM^2 = 9 - 7{{,}}84 = 1{{,}}16$ ، $IM = \\dfrac{{\\sqrt{{29}}}}{{5}} \\approx {dec(sec2[R_(14, 5)][1])}$ : دائرة مركزها I و نصف قطرها $\\approx 1{{,}}08$ .',
        'trend': 'كلما ابتعد (P) عن O (x يكبر) صغُر نصف قطر المقطع.',
        '2': '$IM^2 = 9 - 9 = 0$ : M منطبقة على I = N. للكرة و المستوي نقطة مشتركة وحيدة N (المستوي مماس للكرة في N).',
    },
    'answerSource': 'computed',
    'note': 'La sphère est nommée (d) dans le manuel (notation inhabituelle, gardée). Le cas x > 3 (pas d’intersection) n’est pas demandé ici ; il figure dans le tableau de know-3.',
})

# نشاط 3 — بلاطة قائمة ABCDEFGH : repère H origine, x le long de [HG] (25), y le long de [HE] (20), z le long de [HD] (6)
L3, W3, T3 = 25, 20, 6
CUB = {'H': (0, 0, 0), 'G': (L3, 0, 0), 'F': (L3, W3, 0), 'E': (0, W3, 0),
       'D': (0, 0, T3), 'C': (L3, 0, T3), 'B': (L3, W3, T3), 'A': (0, W3, T3)}
assert dist(CUB['A'], CUB['B']) == 25 and dist(CUB['D'], CUB['A']) == 20 and dist(CUB['D'], CUB['H']) == 6 and dist(CUB['H'], CUB['G']) == 25
assert is_rectangle(CUB['C'], CUB['B'], CUB['F'], CUB['G'])
t3 = 10                                                         # abscisse de la coupe (lue ≈ 0,4 × 25)
F1 = {'I': (t3, 0, T3), 'J': (t3, W3, T3), 'K': (t3, W3, 0), 'L': (t3, 0, 0)}
assert is_rectangle(F1['I'], F1['J'], F1['K'], F1['L'])
assert all(sp.Matrix(vec(F1['I'], F1[k])).dot(sp.Matrix([1, 0, 0])) == 0 for k in 'JKL')   # plan x = 10 ∥ face x = 25
assert dist(F1['I'], F1['J']) == 20 and dist(F1['I'], F1['L']) == 6
area31 = dist(F1['I'], F1['J']) * dist(F1['I'], F1['L'])
assert area31 == 120 == dist(CUB['C'], CUB['B']) * dist(CUB['C'], CUB['G'])
F2 = {'I': (t3, 0, T3), 'J': (t3, W3, T3)}
assert coplanar(F2['I'], F2['J'], CUB['F'], CUB['G']) and is_rectangle(F2['I'], F2['J'], CUB['F'], CUB['G'])
n2 = cross(vec(F2['I'], F2['J']), vec(F2['I'], CUB['G']))
assert cross(n2, (1, 0, 0)) != (0, 0, 0)                         # (P) de la figure (2) n'est PAS parallèle à x = 25
E.append({
    'id': 'act-3', 'kind': 'activity', 'number': 3, 'page': 164, 'pages': '164–165', 'section': 'أنشطة', 'title': 'مقطع بلاطة قائمة بمستو', 'verified': True,
    'parts': [
        {'label': '1)', 'page': 164,
         'text': 'نقطع البلاطة القائمة ABCDEFGH بمستو يوازي الوجه CBFG. من بين الشكلين الآتيين، ما هو الشكل الذي يُبيّن المقطع المُناسب؟ اشرح ثُمّ احسب مساحة هذا المقطع.',
         'figures': [
             {'label': 'الشكل (1)', 'description': 'بلاطة قائمة: الوجه العلوي ABCD (A خلف اليسار، B خلف اليمين، C أمام اليمين، D أمام اليسار) و الوجه السفلي EFGH (E تحت A ...) ؛ 25cm على [AB] و 20cm على [DA] ؛ مستو (P) أخضر شاقولي يقطع [DC] في I و [AB] في J و [EF] في K و [HG] في L ؛ المقطع IJKL.',
              'kind': 'space', 'solid': 'cuboid', 'dims': {'length': L3, 'width': W3, 'height': T3},
              'points3d': p3(**CUB, **F1), 'section': ['I', 'J', 'K', 'L']},
             {'label': 'الشكل (2)', 'description': 'نفس البلاطة (20cm على [DA]، 6cm على [DH]، 25cm على [HG]) ؛ مستو (P) أخضر مائل يقطع [DC] في I و [AB] في J و يشمل الحرف [GF] ؛ المقطع IJFG.',
              'kind': 'space', 'solid': 'cuboid', 'dims': {'length': L3, 'width': W3, 'height': T3},
              'points3d': p3(**CUB, **F2), 'section': ['I', 'J', 'F', 'G']},
         ]},
    ],
    'answer': {
        '1': 'الشكل (1) هو المناسب: مستوي المقطع IJKL يوازي الوجه CBFG (I، J، K، L على الأحرف [DC]، [AB]، [EF]، [HG] العمودية على الوجه CBFG، و [IJ] // [CB] و [IL] // [CG]) ؛ في الشكل (2) المستوي يشمل الحرف [GF] من الوجه CBFG و يقطعه، فلا يوازيه.',
        '1nature': 'المقطع IJKL مستطيل له نفس بعدي الوجه CBFG: IJ = CB = 20 cm و IL = CG = 6 cm.',
        '1area': f'مساحة المقطع $= 20 \\times 6 = {area31}$ cm² .',
    },
    'answerSource': 'computed',
    'figureFrame': 'H origine ; x le long de [HG] (25), y le long de [HE] (20), z le long de [HD] (6) ; coupe à x = 10 (position lue, sans effet sur l’aire).',
})

# >>> PAGE 165
# ══ Page 165 — نشاط 3 (الجزء 2)، أنشطة 4–6 ═════════════════════════════════════
# نشاط 3 (2) : M ∈ [DC], DM = 21 ; N ∈ [CB], BN = 17 ⇒ CM = 4, CN = 3, MN = 5 ; plan vertical par M et N
M32 = (21, 0, T3)
N32 = (L3, W3 - 17, T3)
O32, P32 = (21, 0, 0), (L3, W3 - 17, 0)
assert dist(CUB['D'], M32) == 21 and dist(CUB['B'], N32) == 17
assert dist(CUB['C'], M32) == 4 and dist(CUB['C'], N32) == 3 and dist(M32, N32) == 5
assert is_rectangle(M32, N32, P32, O32) and vec(M32, O32) == (0, 0, -6)            # MO ∥ CG
assert cross(vec(M32, O32), vec(CUB['C'], CUB['G'])) == (0, 0, 0)
area32 = dist(M32, N32) * dist(M32, O32)
assert area32 == 30
n32 = cross(vec(M32, N32), vec(M32, CUB['G']))                                       # figure (1) : plan MNG
assert dot(n32, vec(CUB['C'], CUB['G'])) != 0                                         # MNG n'est pas parallèle à [CG]
assert sp.simplify(dist(M32, CUB['G']) - sp.sqrt(52)) == 0 and sp.simplify(dist(N32, CUB['G']) - sp.sqrt(45)) == 0
act3 = next(e for e in E if e['id'] == 'act-3')
act3['parts'].append({
    'label': '2)', 'page': 165,
    'text': 'نقطع البلاطة القائمة ABCDEFGH بمستو يوازي الحرف [CG]. حيث BN = 17cm و DM = 21cm. من بين الشكلين (1) و(2)، ما هو الشكل الذي يُبيّن المقطع المناسب؟ اشرح، ثُمّ احسب مساحة هذا المقطع.',
    'figures': [
        {'label': 'الشكل (1)', 'description': 'نفس البلاطة (25cm على [AB]، 20cm على [DA]) ؛ M على [DC] و N على [CB] ؛ مستو (P) أخضر يشمل M و N و الرأس G: المقطع المثلث MNG ([MG] و [NG] منقّطان) ؛ نقطتان O على [HG] و P على [GF] مكتوبتان دون أن تنتميا إلى المقطع.',
         'kind': 'space', 'solid': 'cuboid', 'dims': {'length': L3, 'width': W3, 'height': T3, 'DM': 21, 'BN': 17},
         'points3d': p3(**CUB, M=M32, N=N32, O=O32, P=P32), 'section': ['M', 'N', 'G']},
        {'label': 'الشكل (2)', 'description': 'نفس البلاطة ؛ مستو (P) أخضر شاقولي يقطع [DC] في M و [CB] في N و [GF] في P و [HG] في O ؛ المقطع MNPO ([MO] و [NP] شاقوليان يوازيان [CG]).',
         'kind': 'space', 'solid': 'cuboid', 'dims': {'length': L3, 'width': W3, 'height': T3, 'DM': 21, 'BN': 17},
         'points3d': p3(**CUB, M=M32, N=N32, O=O32, P=P32), 'section': ['M', 'N', 'P', 'O']},
    ],
})
act3['answer'].update({
    '2': 'الشكل (2) هو المناسب: [MO] و [NP] يوازيان [CG] فالمستوي MNPO يوازي الحرف [CG] ؛ في الشكل (1) المستوي MNG يقطع [CG] في G فلا يوازيه.',
    '2lengths': 'CM = DC − DM = 25 − 21 = 4 cm ؛ CN = BC − BN = 20 − 17 = 3 cm ؛ المثلث MCN قائم في C: $MN^2 = 4^2 + 3^2 = 25$ ، MN = 5 cm.',
    '2nature': 'المقطع MNPO مستطيل أحد بعديه MO = CG = 6 cm (طول الحرف [CG]) و الآخر MN = 5 cm.',
    '2area': f'مساحة المقطع $= 5 \\times 6 = {area32}$ cm² .',
})
act3['figureFrame'] += ' Partie 2 : M(21 ; 0 ; 6) sur [DC], N(25 ; 3 ; 6) sur [CB], O(21 ; 0 ; 0) sur [HG], P(25 ; 3 ; 0) sur [GF].'
disc('act-3', 'figure', 'étiquette « I » au croisement apparent de l’arête cachée [AE] et de [DC], dans les deux figures de la partie 2', 'étiquette supprimée',
     'Point « I » isolé, nommé nulle part dans l’énoncé de la partie 2 (vestige de la partie 1, où I est le point de [DC] de la coupe IJKL). Les données BN = 17 (N ∈ [CB]) et DM = 21 (M ∈ [DC]) sont cohérentes avec la figure (CM = 4, CN = 3, MN = 5 : triangle 3-4-5, assert) — pas d’inversion BN / DM.',
     'figure_redrawn — stray label dropped')

# نشاط 4 — أسطوانة الدوران r = 1,7 , h = 6 ; O′ centre de la base inférieure (origine), O centre de la base supérieure
r4, h4, d4 = R_(17, 10), 6, R_(4, 5)
half4 = sp.sqrt(r4 ** 2 - d4 ** 2)
assert half4 == R_(3, 2) and 2 * half4 == 3
Hh = (-d4, 0, h4)
K4, I4 = (-d4, half4, h4), (-d4, -half4, h4)
L4, J4 = (-d4, -half4, 0), (-d4, half4, 0)
for P_ in (K4, I4, L4, J4):
    assert sp.simplify(P_[0] ** 2 + P_[1] ** 2 - r4 ** 2) == 0                      # sur la surface latérale
assert is_rectangle(K4, I4, L4, J4) and dist(K4, I4) == 3 and dist(I4, L4) == 6 and dist(K4, I4) * dist(I4, L4) == 18
assert dist((0, 0, h4), Hh) == d4 and dot(vec((0, 0, h4), Hh), vec(K4, I4)) == 0      # OH ⊥ (KI), OH = 0,8
assert dot(cross(vec(K4, I4), vec(I4, L4)), (0, 0, 1)) == 0                           # plan ∥ axe
B4 = (0, 0, R_(7, 2))
E.append({
    'id': 'act-4', 'kind': 'activity', 'number': 4, 'page': 165, 'section': 'أنشطة', 'title': 'مقطع أسطوانة الدوران بمستو', 'verified': True,
    'intro': 'أسطوانة دوران نصف قطر قاعدتها 1,7cm و ارتفاعها 6cm. في الشكل (1): المستوي (P) يقطع الأسطوانة و يُوازي محورها حيث يكون بُعد النقطة O عن المستقيم (IK) هو 0,8cm. في الشكل (2): المستوي (P) يقطع الأسطوانة و يُوازي قاعدتها.',
    'parts': [{'label': '', 'text': 'حدّد في كل شكل طبيعة المقطع الناتج ثمّ أنشئه بأبعاده الحقيقية.'}],
    'figures': [
        {'label': 'الشكل (1)', 'description': 'أسطوانة دوران شاقولية محورها (OO′) (O مركز القاعدة العليا، O′ مركز السفلى) ؛ مستو (P) أخضر شاقولي يقطعها وفق المستطيل KILJ (K و I على الدائرة العليا، J و L على السفلى، [KJ] منقّط) ؛ [OH] منقّط عمودي على [KI] مع رمز زاوية قائمة في H.',
         'kind': 'space', 'solid': 'cylinder', 'dims': {'r': 1.7, 'h': 6, 'OH': 0.8},
         'points3d': p3(O_=(0, 0, 0), O=(0, 0, h4), H=Hh, K=K4, I=I4, L=L4, J=J4), 'section': ['K', 'I', 'L', 'J']},
        {'label': 'الشكل (2)', 'description': 'نفس الأسطوانة ؛ مستو (P) أخضر أفقي يقطع المحور في B ؛ المقطع قرص مظلّل (قطع ناقص، الخلفي منقّط) مركزه B مع نصف قطر منقّط و رمز زاوية قائمة في B ؛ نصف قطر منقّط مع زاوية قائمة في O′ و آخر في O.',
         'kind': 'space', 'solid': 'cylinder', 'dims': {'r': 1.7, 'h': 6},
         'points3d': p3(O_=(0, 0, 0), O=(0, 0, h4), B=B4), 'section': {'circle': {'center': 'B', 'radius': 1.7}}},
    ],
    'answer': {
        '1nature': 'الشكل (1): المقطع KILJ مستطيل (المستوي يوازي المحور) أحد بعديه KJ = IL = 6 cm (ارتفاع الأسطوانة).',
        '1width': 'H منتصف الوتر [KI] (OK = OI = 1,7) و المثلث OHI قائم في H: $HI^2 = 1{,}7^2 - 0{,}8^2 = 2{,}89 - 0{,}64 = 2{,}25$ ، HI = 1,5 cm و KI = 3 cm.',
        '1draw': 'نُنشئ مستطيلا بُعداه 3 cm و 6 cm (مساحته 18 cm²).',
        '2': 'الشكل (2): المقطع دائرة (قرص) مركزها B على المحور و نصف قطرها 1,7 cm — تقايس القاعدة.',
    },
    'answerSource': 'computed',
    'figureFrame': 'O′ (centre de la base inférieure) origine, axe (O′O) = (Oz) ; plan de coupe x = −0,8 ; H(−0,8 ; 0 ; 6) pied de la perpendiculaire issue de O ; B à mi-hauteur environ (z = 3,5, position lue sans effet).',
})
disc('act-4', 'reading', 'بُعد النقطة O عن المستقيم (IK) هو 0,8cm', 'inchangé — OH = 0,8 cm, H ∈ [KI]',
     'Vérifié au zoom : le texte dit bien « (IK) » et la figure porte H, pied de la perpendiculaire issue de O sur [KI] (angle droit en H). Pas de confusion « OI » / « IK » : I est un sommet de la section (sur le cercle supérieur), OI = 1,7 ≠ 0,8. La largeur KI = 2√(1,7² − 0,8²) = 3 tombe juste (triangle 8-15-17).',
     'kept')

# نشاط 5 — هرم منتظم SABCD : centre de la base origine, AB = 4, hauteur non donnée (6 choisie pour la figure)
hS = 6
A5, B5, C5, D5, S5 = (-2, -2, 0), (2, -2, 0), (2, 2, 0), (-2, 2, 0), (0, 0, hS)
k5 = R_(3, 4)


def on_edge(V, k=k5):
    return tuple(sp.nsimplify(S5[i]) + k * (sp.nsimplify(V[i]) - S5[i]) for i in range(3))


E5, F5, G5, H5 = on_edge(A5), on_edge(B5), on_edge(C5), on_edge(D5)
assert all(P_[2] == R_(3, 2) for P_ in (E5, F5, G5, H5))                           # plan z = 1,5 ∥ base
assert dist(E5, F5) == dist(F5, G5) == dist(G5, H5) == dist(H5, E5) == 3
AC5 = dist(A5, C5); EG5 = dist(E5, G5)
assert AC5 == 4 * sp.sqrt(2) and EG5 == 3 * sp.sqrt(2) and EG5 == k5 * AC5
assert EG5 ** 2 == dist(E5, F5) ** 2 + dist(F5, G5) ** 2 == 18
assert dot(vec(F5, E5), vec(F5, G5)) == 0 and is_rectangle(E5, F5, G5, H5)
for hh in (3, 6, 10):                                                                 # indépendance de la hauteur
    S_ = (0, 0, hh)
    E_ = tuple(S_[i] + k5 * (A5[i] - S_[i]) for i in range(3)); F_ = tuple(S_[i] + k5 * (B5[i] - S_[i]) for i in range(3))
    assert dist(E_, F_) == 3
E.append({
    'id': 'act-5', 'kind': 'activity', 'number': 5, 'page': 165, 'section': 'أنشطة', 'title': 'مقطع هرم بمستو', 'verified': True,
    'intro': 'SABCD هرم منتظم قاعدته المربع ABCD حيث AB = 4cm. E نقطة من الحرف [SA] حيث $SE = \\dfrac{3}{4}SA$ . (P) هو المستوي الموازي للقاعدة و الذي يشمل النقطة E. نقبل أنّ (AD) // (EH) و (BC) // (FG) و (DC) // (HG) و (AB) // (EF) و (EG) // (AC).',
    'parts': [
        {'label': '1)', 'text': 'احسب EH ؛ HG ؛ FG ؛ EF.'},
        {'label': '2)', 'text': 'احسب AC ثم استنتج أنّ $EG = 3\\sqrt{2}$ cm.'},
        {'label': '3)', 'text': 'تحقّق أنّ $EG^2 = EF^2 + FG^2$ ثم استنتج طبيعة الرباعي EFGH.'},
    ],
    'figure': {
        'description': 'هرم SABCD (S في الأعلى، A أمام اليسار، B أمام، C يمين، D خلف منقّط) ؛ مستو (P) أخضر أفقي يقطع الأحرف [SA]، [SB]، [SC]، [SD] في E، F، G، H ؛ المقطع EFGH بالأحمر ([EH] و [HG] منقّطان).',
        'kind': 'space', 'solid': 'pyramid', 'dims': {'AB': 4, 'height': hS, 'k': 0.75},
        'points3d': p3(S=S5, A=A5, B=B5, C=C5, D=D5, E=E5, F=F5, G=G5, H=H5), 'section': ['E', 'F', 'G', 'H'],
        'reading': 'Hauteur non donnée dans le manuel : 6 cm choisie pour la figure (les longueurs EF … EG n’en dépendent pas, assert pour h = 3, 6, 10). Centre de la base à l’origine, base dans z = 0, (P) : z = 1,5.',
    },
    'answer': {
        '1': 'في المثلث SAB: E ∈ [SA]، F ∈ [SB] و (EF) // (AB): حسب خاصية طالس $\\dfrac{EF}{AB} = \\dfrac{SE}{SA} = \\dfrac{3}{4}$ ، EF = 3 cm. بنفس الطريقة في SAD، SBC، SDC: EH = FG = HG = 3 cm.',
        '2': '$AC^2 = 4^2 + 4^2 = 32$ ، $AC = 4\\sqrt{2}$ cm ؛ في المثلث SAC: $EG = \\dfrac{3}{4} \\times 4\\sqrt{2} = 3\\sqrt{2}$ cm.',
        '3': '$EG^2 = 18$ و $EF^2 + FG^2 = 9 + 9 = 18$ : المثلث EFG قائم في F (عكس فيثاغورس). EFGH أضلاعه الأربعة متقايسة (معيّن) و له زاوية قائمة: مربع ضلعه 3 cm.',
        'reduction': 'المقطع EFGH تصغير للقاعدة ABCD بنسبة $\\dfrac{3}{4}$ ؛ مساحته $9 = \\left(\\dfrac{3}{4}\\right)^2 \\times 16$ cm².',
    },
    'answerSource': 'computed',
    'note': 'F, G, H ne sont pas définis dans le texte (implicitement : intersections de (P) avec [SB], [SC], [SD], visibles sur la figure). Les parallélismes sont admis (« نقبل ») : la propriété « un plan parallèle à la base coupe les faces selon des parallèles » n’est pas au programme.',
})
disc('act-5', 'completion', 'F، G، H non définis dans l’énoncé', 'F، G، H نقط تقاطع (P) مع الأحرف [SB]، [SC]، [SD] على الترتيب',
     'Le texte ne nomme que E ; F, G, H n’apparaissent que sur la figure et dans les parallélismes admis. Les leçons ajoutent la définition.',
     'completed_in_lessons')
assert sp.simplify(dist(E5, F5) ** 2 - k5 ** 2 * dist(A5, B5) ** 2) == 0

# نشاط 6 — التكبير و التصغير : متوازي مستطيلات AB = 5, BC = 4, AE = 3
a6, b6, c6 = 5, 4, 3
V6a = a6 * b6 * c6
A6a = 2 * (a6 * b6 + b6 * c6 + a6 * c6)
k6 = R_(3, 5)
a6p, b6p, c6p = k6 * a6, k6 * b6, k6 * c6
V6p = a6p * b6p * c6p
A6p = 2 * (a6p * b6p + b6p * c6p + a6p * c6p)
assert V6a == 60 and A6a == 94
assert (a6p, b6p, c6p) == (3, R_(12, 5), R_(9, 5))
assert V6p == R_(324, 25) and float(V6p) == 12.96 and A6p == R_(846, 25) and float(A6p) == 33.84
assert V6p == k6 ** 3 * V6a and A6p == k6 ** 2 * A6a
CUB6 = {'A': (0, 0, c6), 'B': (a6, 0, c6), 'C': (a6, b6, c6), 'D': (0, b6, c6), 'E': (0, 0, 0), 'F': (a6, 0, 0), 'G': (a6, b6, 0), 'H': (0, b6, 0)}
assert dist(CUB6['A'], CUB6['B']) == 5 and dist(CUB6['B'], CUB6['C']) == 4 and dist(CUB6['A'], CUB6['E']) == 3
CUB6p = {k + '_': tuple(k6 * c for c in v) for k, v in CUB6.items()}
assert dist(CUB6p['A_'], CUB6p['B_']) == 3 and dist(CUB6p['A_'], CUB6p['E_']) == R_(9, 5)
E.append({
    'id': 'act-6', 'kind': 'activity', 'number': 6, 'page': 165, 'section': 'أنشطة', 'title': 'التكبير - التصغير', 'verified': True,
    'parts': [
        {'label': '1)', 'text': 'ABCDEFGH متوازي مستطيلات. حيث AB = 5cm ؛ BC = 4cm ؛ AE = 3cm. حجمه $\\mathcal{V}$ و $\\mathcal{A}$ المساحة الكلّية لأوجهه. أحسب $\\mathcal{V}$ و $\\mathcal{A}$ .'},
        {'label': '2)', 'text': 'أ) احسب أبعاد المُجسّم A′B′C′D′E′F′G′H′ الناتج عن تصغير متوازي المستطيلات ABCDEFGH بنسبة $\\dfrac{3}{5}$ ثُمّ مثّله باستعمال وسائل هندسية مناسبة. ب) احسب حجمه $\\mathcal{V}\'$ و $\\mathcal{A}\'$ المساحة الكلّية لأوجهه. تحقّق أنّ: $\\mathcal{V}\' = \\left(\\dfrac{3}{5}\\right)^3\\mathcal{V}$ و $\\mathcal{A}\' = \\left(\\dfrac{3}{5}\\right)^2\\mathcal{A}$ .'},
    ],
    'platformFigure': {
        'description': 'Pas de figure dans le manuel. Plateforme : متوازي المستطيلات ABCDEFGH (ABCD en haut, EFGH en bas, AE vertical) et son réduit A′B′C′D′E′F′G′H′ de rapport 3/5, côte à côte en perspective cavalière.',
        'kind': 'space', 'solid': 'cuboid', 'dims': {'AB': 5, 'BC': 4, 'AE': 3, 'k': 0.6},
        'points3d': p3(**CUB6, **CUB6p),
    },
    'answer': {
        '1': f'$\\mathcal{{V}} = 5 \\times 4 \\times 3 = {V6a}$ cm³ ؛ $\\mathcal{{A}} = 2(5 \\times 4 + 4 \\times 3 + 5 \\times 3) = 2 \\times 47 = {A6a}$ cm².',
        '2a': 'A′B′ = $\\dfrac{3}{5} \\times 5 = 3$ cm ؛ B′C′ = $\\dfrac{3}{5} \\times 4 = 2{,}4$ cm ؛ A′E′ = $\\dfrac{3}{5} \\times 3 = 1{,}8$ cm.',
        '2b': '$\\mathcal{V}\' = 3 \\times 2{,}4 \\times 1{,}8 = 12{,}96$ cm³ ؛ $\\mathcal{A}\' = 2(7{,}2 + 4{,}32 + 5{,}4) = 2 \\times 16{,}92 = 33{,}84$ cm².',
        '2check': '$\\left(\\dfrac{3}{5}\\right)^3 \\times 60 = \\dfrac{27}{125} \\times 60 = 12{,}96 = \\mathcal{V}\'$ ؛ $\\left(\\dfrac{3}{5}\\right)^2 \\times 94 = \\dfrac{9}{25} \\times 94 = 33{,}84 = \\mathcal{A}\'$ .',
    },
    'answerSource': 'computed',
    'note': 'Le solide est appelé ici « متوازي مستطيلات » (synonyme de « البلاطة القائمة » des act-3, know-3). La règle générale (aires × k², volumes × k³) est la معرفة absente du scan (missing_page) — à écrire comme ajout déclaré.',
})

# >>> PAGE 166
# ══ Page 166 — معارف 1–2 ═════════════════════════════════════════════════════
# معارف 1 : figure 1 — sphère de centre O (origine), R = 2 (sans valeur dans le manuel)
R_k1 = 2
u = sp.sqrt(2)
K1 = {'O': (0, 0, 0), 'N': (0, 0, R_k1), 'S': (0, 0, -R_k1),
      'N_': (-u, 0, u), 'S_': (u, 0, -u),                     # diamètre oblique [N′S′]
      'N1': (0, -R_k1, 0), 'S1': (0, R_k1, 0),                 # diamètre horizontal [N1S1] (avant-gauche → arrière-droite)
      'M': (-R_k1, 0, 0), 'P': (R_(1, 2), R_(3, 4), 0), 'Q': (-R_(5, 2), 0, R_(5, 2))}
for a, b in (('N', 'S'), ('N_', 'S_'), ('N1', 'S1')):
    assert dist(K1[a], K1[b]) == 2 * R_k1 and mid(K1[a], K1[b]) == (0, 0, 0)
assert dist(K1['O'], K1['M']) == R_k1 and dist(K1['O'], K1['P']) < R_k1 and dist(K1['O'], K1['Q']) > R_k1
E.append({
    'id': 'know-1', 'kind': 'knowledge', 'number': 1, 'page': 166, 'section': 'معارف', 'title': 'الكُرة و الجلّة', 'verified': True,
    'definitions': {
        'heading': 'تعاريف',
        'intro': 'O نقطة من الفضاء و R عدد موجب تماما.',
        'items': [
            'الكرة التي مركزها O و نصف قطرها R هي مجموعة النقط M من الفضاء حيث OM = R.',
            'الجلة التي مركزها O و نصف قطرها R هي مجموعة النقط M من الفضاء حيث OM ≤ R.',
        ],
    },
    'text': 'على الشكل المقابل، القِطع [NS]، [N′S′] و [N₁S₁] لها نفس المنتصف O. إنها أقطار للكرة، طول كل منها هو 2R.',
    'example': {
        'text': '(δ) هي الكرة التي مركزها O و نصف قطرها R، (β) هي الجلة التي مركزها O و نصف قطرها R. لدينا M نقطة من الكرة (δ) لأنّ OM = R. P ليست نقطة من الكرة (δ) لأنّ OP < R. نقول إنّ P تنتمي إلى الجلة (β). Q ليست نقطة من الكرة (δ) و من الجلة (β) لأنّ OQ > R.',
    },
    'notes': {
        'heading': 'ملاحظات',
        'items': [
            'عند تدوير دائرة مركزها O و نصف قطرها R حول أحد أقطارها فإنّه يُولد من هذا الدوران كرة مركزها O و نصف قطرها R.',
            'تُسمى الدوائر التي مركزها O و نصف قطرها مُساوٍ لنصف قطر الكرة، بالدوائر الكُبرى في الكرة.',
            'تُسمّى الدوائر التي مركزها يختلف عن O و نصف قطرها أصغر من نصف قطر الكرة، بالدوائر الصُغرى في الكرة.',
        ],
    },
    'figures': [
        {'label': 'الشكل 1 (الأقطار و النقط M، P، Q)', 'description': 'كرة وردية مركزها O ؛ ثلاثة أقطار منقّطة [NS] (شاقولي)، [N′S′] (مائل: N′ أعلى اليسار، S′ أسفل اليمين)، [N₁S₁] (أفقي: N₁ أمام اليسار، S₁ خلف اليمين) ؛ دائرة كبرى أفقية (استواء) و دائرة صغرى أفقية قرب القمة و دائرة كبرى شاقولية (قطع ناقص) ؛ M على حافة الاستواء يسارًا، P داخل الكرة قرب S₁، Q خارج الكرة أعلى اليسار.',
         'kind': 'space', 'solid': 'sphere', 'dims': {'R': R_k1},
         'points3d': p3(**K1),
         'reading': 'Pas de valeur numérique dans le manuel (R = 2 choisi). Repère : O origine, (NS) = (Oz), y vers l’arrière (N1 devant, S1 derrière). Le dessin du manuel est déformé (contour en « œuf », plus large en bas).'},
        {'label': 'الشكل 2 (دوائر كبرى و صغرى)', 'description': 'كرة (مرسومة أطول من عرضها) محورها (NS) شاقولي مع سهم دوران دائري أسفل S ؛ عدة دوائر كبرى تمرّ بـ N و S (أهلّة ملوّنة بالأخضر و الأصفر) مع سهام حمراء نحوها و عنوان « دوائر كبرى » ؛ دائرة الاستواء الأفقية و عليها M مع [OM] منقّط ؛ دائرة صغرى أفقية قرب S مع سهم و عنوان « دوائر صغيرة » ؛ نقطة على المحور مركز الدائرة الصغرى.',
         'kind': 'space', 'solid': 'sphere', 'dims': {'R': R_k1},
         'points3d': p3(O=(0, 0, 0), N=(0, 0, R_k1), S=(0, 0, -R_k1), M=(R_k1, 0, 0), O1=(0, 0, -R_(3, 2))),
         'smallCircle': {'center': 'O1', 'radius': num(sp.sqrt(R_k1 ** 2 - R_(9, 4)))},
         'reading': 'Contour dessiné ovale (hauteur > largeur) : une sphère se représente par un CERCLE (méthode p. 167) — figure à redessiner. O1 : nom de la plateforme pour le centre de la petite section (z = −1,5, rayon √1,75 ≈ 1,32).'},
    ],
})
assert sp.simplify(sp.sqrt(R_k1 ** 2 - R_(9, 4)) - sp.sqrt(7) / 2) == 0
disc('know-1', 'figure', 'sphères dessinées en « œuf » (figure 1 élargie en bas, figure 2 plus haute que large)', 'sphère représentée par un cercle (contour apparent) + ellipses pour les grands cercles',
     'Le contour apparent d’une sphère est toujours un cercle ; la méthode p. 167 le dit (« نرسم دائرة كبرى ») mais les deux figures de know-1 sont ovales. Les leçons redessinent (guide §5 : même concept, meilleur dessin).',
     'figure_redrawn')
disc('know-1', 'reading', '« دوائر صغيرة » (étiquette de la figure 2) / « الدوائر الصُغرى » (texte)', 'الدوائر الصُغرى',
     'Deux formulations du même terme ; la plateforme emploie celle du texte (« الدوائر الكُبرى / الصُغرى »).', 'kept — lessons use الدوائر الصغرى')

# معارف 2 — مساحة الكرة و حجم الجلة ; exemple R = 1,4 cm
R_k2 = R_(7, 5)
A_k2, V_k2 = A_sphere(R_k2), V_ball(R_k2)
assert A_k2 == R_(196, 25) * pi and V_k2 == R_(1372, 375) * pi
assert rnd(A_k2, 2) == 24.63 and rnd(V_k2, 3) == 11.494
assert abs(float(A_k2) - 24.630086) < 1e-6 and abs(float(V_k2) - 11.494040) < 1e-6
E.append({
    'id': 'know-2', 'kind': 'knowledge', 'number': 2, 'page': 166, 'section': 'معارف', 'title': 'مساحة الكرة و حجم الجلّة', 'verified': True,
    'definitions': {
        'heading': 'تعريف',
        'items': [
            'مساحة الكرة التي مركزها O و نصف قطرها R هي $\\mathcal{A}$ حيث $\\mathcal{A} = 4\\pi R^2$ .',
            'حجم الجلة التي مركزها O و نصف قطرها R هو $\\mathcal{V}$ حيث $\\mathcal{V} = \\dfrac{4}{3}\\pi R^3$ .',
        ],
    },
    'example': {
        'text': 'مساحة كرة نصف قطرها 1,4cm هي $\\mathcal{A}$ حيث $\\mathcal{A} = 4\\pi R^2 = 4\\pi(1{,}4)^2$ أي $\\mathcal{A} = 24{,}63\\text{cm}^2$ بالتدوير إلى $1\\text{mm}^2$ . حجم جلة نصف قطرها 1,4cm هو $\\mathcal{V}$ حيث $\\mathcal{V} = \\dfrac{4}{3}\\pi R^3 = \\dfrac{4}{3}\\pi(1{,}4)^3$ أي $\\mathcal{V} = 11{,}494\\text{cm}^3$ بالتدوير إلى $1\\text{mm}^3$ .',
        'answer': {'area': {'exact': '7{,}84\\pi', 'approx': rnd(A_k2, 2), 'unit': 'cm²', 'value': f'$4\\pi \\times 1{{,}}96 = 7{{,}}84\\pi \\approx {dec(A_k2, 2)}$ cm² (1 mm² = 0,01 cm²)'},
                   'volume': {'exact': '\\frac{1372}{375}\\pi', 'approx': rnd(V_k2, 3), 'unit': 'cm³', 'value': f'$\\dfrac{{4}}{{3}}\\pi \\times 2{{,}}744 \\approx 3{{,}}6587\\pi \\approx {dec(V_k2, 3)}$ cm³ (1 mm³ = 0,001 cm³)'}},
    },
    'answerSource': 'computed',
    'figure': {
        'description': 'كرة (دائرة) مركزها O ؛ دائرة كبرى أفقية (قطع ناقص، النصف الخلفي منقّط، الأمامي بالأحمر) ؛ نصف قطر منقّط [O…] مكتوب عليه R.',
        'kind': 'space', 'solid': 'sphere', 'dims': {'R': 1.4},
        'points3d': p3(O=(0, 0, 0), M=(R_k2, 0, 0)),
    },
    'note': 'Le manuel présente les formules comme « تعريف » (admises au cycle moyen). Les arrondis imprimés sont justes : 24,630086… → 24,63 cm² (au mm²) et 11,494040… → 11,494 cm³ (au mm³) (assert). Le lien avec Archimède (intro) : 4πR² = aire latérale du cylindre 2πR × 2R ; 4/3 πR³ = 2/3 de 2πR³.',
})

# >>> PAGE 167
# ══ Page 167 — طرائق : تمثيل كرة، تمثيل نقطة، دوري الآن ═══════════════════════
R_m1 = R_(5, 2)
E.append({
    'id': 'method-sphere-draw', 'kind': 'method', 'page': 167, 'section': 'طرائق', 'title': 'تمثيل كرة', 'verified': True,
    'exercise': {'heading': 'تمرين', 'text': 'مثّل كرة مركزها O و نصف قطرها 2,5cm.'},
    'solution': {
        'heading': 'حل',
        'intro': 'يُمكن تمثيل الكرة في المستوي كما يلي:',
        'steps': [
            'أ) نرسم دائرة كُبرى مركزها O و نصف قطرها 2,5cm (الشكل 1)',
            'ب) نرسم باليد الحرّة دائرة كُبرى أخرى بيضوية الشكل داخل النطاق المُلوّن (الشكل 2). الجزء الأمامي للشكل البيضوي يكون بخط مستمر و الجزء الخلفي يكون بخط متقطّع.',
            'جـ) الشكل 3 هو تمثيل للكرة.',
        ],
    },
    'figures': [
        {'label': 'الشكل 1', 'description': 'ورقة مرصوفة ؛ مدوّر رأسه في O يرسم دائرة نصف قطرها 2,5 cm (5 مربعات).', 'kind': 'plane',
         'circles': [{'center': [0, 0], 'radius': 2.5}], 'points': {'O': [0, 0]}, 'grid': {'unit': 0.5}},
        {'label': 'الشكل 2', 'description': 'نفس الدائرة ؛ خطّان أفقيان أحمران منقّطان فوق O و تحتها يحدّان « النطاق الملوّن » ؛ قلم يرسم باليد قطعا ناقصا أفقيا يلامس الدائرة يمينا و يسارا داخل هذا النطاق (النصف الأمامي السفلي مستمر، الخلفي العلوي متقطّع).', 'kind': 'plane',
         'circles': [{'center': [0, 0], 'radius': 2.5}], 'ellipses': [{'center': [0, 0], 'rx': 2.5, 'ry': 0.75, 'front': 'solid', 'back': 'dashed'}], 'grid': {'unit': 0.5}},
        {'label': 'الشكل 3', 'description': 'الدائرة (الكفاف) و القطع الناقص: النصف السفلي (الأمامي) مستمر و النصف العلوي (الخلفي) متقطّع ؛ O في الوسط.', 'kind': 'space', 'solid': 'sphere',
         'dims': {'R': 2.5}, 'points3d': p3(O=(0, 0, 0))},
    ],
    'note': 'Le contour apparent d’une sphère est un cercle de rayon R (vrai rayon) ; le grand cercle « horizontal » se dessine en ellipse aplatie de grand axe 2R (rapport d’aplatissement libre, ≈ 0,3 sur la figure). C’est la règle que contredisent les figures ovales de know-1.',
})

R_m2 = 2
A_m2 = (R_(6, 5), R_(8, 5), 0)
M_m2 = (-1, -1, -sp.sqrt(2))
B_m2 = tuple(c / 2 for c in M_m2)
assert dist((0, 0, 0), A_m2) == R_m2 and dist((0, 0, 0), M_m2) == R_m2 and dist((0, 0, 0), B_m2) == 1 < R_m2
assert cross(B_m2, M_m2) == (0, 0, 0)                                                # B ∈ [OM]
E.append({
    'id': 'method-point', 'kind': 'method', 'page': 167, 'section': 'طرائق', 'title': 'تمثيل نقطة من كرة أو من جلّة', 'verified': True,
    'exercise': {'heading': 'تمرين', 'text': 'لاحظ الشكل المقابل. A نقطة من الكرة التي مركزها O و نصف قطرها R و B نقطة من الجلة المعيّنة بهذه الكرة. انقل الشكل ثم مثّل النقطتين A و B.'},
    'solution': {
        'heading': 'حل',
        'steps': [
            '1) تمثيل A : نرسم [OA] ثم دائرة كبرى ذات نصف القطر [OA].',
            '2) تمثيل B : نرسم نصف القطر [OM] للكرة حيث B تقع عليه ثم نرسم إحدى الدوائر الكبرى ذات نصف القطر [OM].',
        ],
    },
    'method': {'heading': 'طريقة', 'text': 'لتمثيل نقطة على كرة أو داخلها نستعمل إحدى الدوائر الكبرى لهذه الكرة.'},
    'figures': [
        {'label': 'الشكل (المعطى)', 'description': 'دائرة (كفاف الكرة) فقط، و بداخلها ثلاث نقط: A (أعلى اليمين)، O (المركز)، B (أسفل اليسار). على الرسم المستوي لا يُميَّز A (على الكرة) من B (في الجلة): هذا موضوع الطريقة.', 'kind': 'plane',
         'circles': [{'center': [0, 0], 'radius': 2}], 'points': {'A': [0.6, 0.9], 'O': [0, 0], 'B': [-0.4, -0.9]}},
        {'label': 'الشكل (الحل)', 'description': 'الكرة مع دائرة كبرى أفقية (قطع ناقص، الخلفي منقّط) تمرّ بـ A (على الجزء الخلفي) ؛ دائرة كبرى شاقولية بالوردي (قطع ناقص ضيّق) تمرّ بـ M على الكفاف أسفل اليسار ؛ قطعة منقّطة من A إلى M تمرّ بـ O و B (B بين O و M) ؛ R مكتوب على نصف قطر منقّط أفقي.',
         'kind': 'space', 'solid': 'sphere', 'dims': {'R': R_m2},
         'points3d': p3(O=(0, 0, 0), A=A_m2, M=M_m2, B=B_m2),
         'reading': 'R = 2 choisi. A sur le grand cercle horizontal (face arrière), M sur un grand cercle vertical (avant-bas-gauche), B milieu de [OM] (OB = 1 < R, assert). Sur le dessin [OA] et [OM] paraissent alignés : effet de perspective, ce sont deux rayons distincts.'},
    ],
})

# دوري الآن p.167 : (d) coupe la sphère (O ; 2) en A et B, AB = 2
R_n7 = 2
A_n7 = (-1, 0, sp.sqrt(3))
B_n7 = (1, 0, sp.sqrt(3))
I_n7 = mid(A_n7, B_n7)
assert dist((0, 0, 0), A_n7) == 2 and dist((0, 0, 0), B_n7) == 2 and dist(A_n7, B_n7) == 2
cosAOB = sp.nsimplify(dot(A_n7, B_n7) / (R_n7 * R_n7))
assert cosAOB == R_(1, 2) and sp.acos(cosAOB) == pi / 3
OI_n7 = dist((0, 0, 0), I_n7)
assert OI_n7 == sp.sqrt(3) and OI_n7 ** 2 == R_n7 ** 2 - 1 and rnd(OI_n7, 2) == 1.73
assert dot(vec((0, 0, 0), I_n7), vec(A_n7, B_n7)) == 0
E.append({
    'id': 'now-167', 'kind': 'now', 'page': 167, 'section': 'دوري الآن', 'verified': True,
    'text': 'يقطع مستقيم (d) كرة مركزها O و نصف قطرها 2cm في نقطتين A و B حيث AB = 2cm.',
    'parts': [
        {'label': '1)', 'text': 'أنجز شكلا مناسبا.'},
        {'label': '2)', 'text': 'برهن أنّ $\\widehat{AOB} = 60^\\circ$ .'},
        {'label': '3)', 'text': 'I هو منتصف [AB]. احسب OI.'},
    ],
    'answer': {
        '1': 'نمثّل الكرة (دائرة نصف قطرها 2 cm + قطع ناقص) ثم دائرة كبرى تمرّ بـ A و B (المستوي OAB يقطع الكرة وفق دائرة كبرى) و عليها الوتر [AB] طوله 2 cm و المستقيم (d) الحامل له.',
        '2': 'A و B من الكرة: OA = OB = 2 cm، و AB = 2 cm: المثلث AOB متقايس الأضلاع إذن $\\widehat{AOB} = 60^\\circ$ .',
        '3': 'المثلث AOB متساوي الساقين و I منتصف [AB] إذن (OI) ⊥ (AB) و AI = 1 cm ؛ حسب فيثاغورس في AIO القائم في I: $OI^2 = 2^2 - 1^2 = 3$ ، $OI = \\sqrt{3} \\approx 1{,}73$ cm.',
        'exact': '\\sqrt{3}',
    },
    'answerSource': 'computed',
    'platformFigure': {
        'description': 'Pas de figure dans le manuel (« أنجز شكلا »). Plateforme : sphère de centre O, rayon 2 ; A et B dans le plan vertical y = 0 (grand cercle de face), corde [AB] horizontale, I milieu, [OI] ⊥ [AB].',
        'kind': 'space', 'solid': 'sphere', 'dims': {'R': R_n7, 'AB': 2},
        'points3d': p3(O=(0, 0, 0), A=A_n7, B=B_n7, I=I_n7),
    },
    'note': 'OI est la distance de O à la droite (d) : prépare la méthode p. 169 (rayon d’une section). Par le plan OAB on se ramène à la géométrie plane (triangle équilatéral, Pythagore).',
})

# >>> PAGE 168
# ══ Page 168 — معارف 3 : المقاطع المستوية لمجسمات مألوفة ═══════════════════════
# أ) الكرة : O origine, R = 2 ; cas 0 < h < R (h = 6/5 ⇒ AM = 8/5), h = 0, h = R (point de contact S)
R_k3 = 2
h_a = R_(6, 5)
A_a = (0, 0, h_a)
M_a = (sp.sqrt(R_k3 ** 2 - h_a ** 2), 0, h_a)
assert M_a[0] == R_(8, 5) and dist(A_a, M_a) == sp.sqrt(dist((0, 0, 0), M_a) ** 2 - dist((0, 0, 0), A_a) ** 2)
assert dot(vec(A_a, M_a), vec((0, 0, 0), A_a)) == 0                                   # OAM rectangle en A
M_b = (-R_k3, 0, 0)
assert dist((0, 0, 0), M_b) == R_k3
S_c = (0, 0, -R_k3)
assert dist((0, 0, 0), S_c) == R_k3 and R_k3 ** 2 - R_k3 ** 2 == 0
SPHERE_CUBE = {'H': (0, 0, 0), 'G': (6, 0, 0), 'F': (6, 4, 0), 'E': (0, 4, 0), 'D': (0, 0, 3), 'C': (6, 0, 3), 'B': (6, 4, 3), 'A': (0, 4, 3)}
# ب) بلاطة : figure de droite — plan x = 2 ∥ face ADHE (x = 0) ; figure de gauche — plan vertical oblique ∥ [AE]
Cb = SPHERE_CUBE
face_I, face_J, face_K, face_L = (2, 4, 3), (2, 0, 3), (2, 0, 0), (2, 4, 0)
assert is_rectangle(face_I, face_J, face_K, face_L)
assert dist(face_I, face_J) == dist(Cb['A'], Cb['D']) and dist(face_J, face_K) == dist(Cb['D'], Cb['H'])     # mêmes dimensions que ADHE
edge_I, edge_J, edge_K, edge_L = (1, 4, 3), (5, 0, 3), (5, 0, 0), (1, 4, 0)
assert is_rectangle(edge_I, edge_J, edge_K, edge_L)
assert cross(vec(edge_I, edge_L), vec(Cb['A'], Cb['E'])) == (0, 0, 0) and dist(edge_I, edge_L) == dist(Cb['A'], Cb['E'])   # côté = arête [AE]
assert dist(edge_I, edge_J) == 4 * sp.sqrt(2)
# جـ) أسطوانة : R = 2, h = 4 ; plan x = 1 ∥ axe → ABCD ; plan z = 2,5 ∥ base → cercle de rayon R
Rc, hc = 2, 4
cyl_A, cyl_B = (1, -sp.sqrt(3), hc), (1, sp.sqrt(3), hc)
cyl_C, cyl_D = (1, sp.sqrt(3), 0), (1, -sp.sqrt(3), 0)
for P_ in (cyl_A, cyl_B, cyl_C, cyl_D):
    assert P_[0] ** 2 + P_[1] ** 2 == Rc ** 2
assert is_rectangle(cyl_A, cyl_B, cyl_C, cyl_D) and dist(cyl_B, cyl_C) == hc
E.append({
    'id': 'know-3', 'kind': 'knowledge', 'number': 3, 'page': 168, 'section': 'معارف', 'title': 'المقاطع المستوية لمجسمات مألوفة', 'verified': True,
    'subParts': {
        'sphere': {
            'label': 'أ)', 'title': 'مقطع كُرة بمستو',
            'property': {'heading': 'خاصية', 'text': 'مقطع كُرة بمستو هو دائرة.'},
            'setup': '(S) كرة مركزها O و نصف قطرها R. ليكن [NS] أحد أقطارها. (P) هو المستوي العمودي على (NS) في النقطة A. يُعبّر الطول OA عن المسافة بين النقطة O و المستوي (P). نضع OA = h.',
            'outside': 'إذا كان h > R فإنّ المستوي (P) لا يقطع الكُرة.',
            'table': [
                {'case': 'إذا كان 0 < h < R', 'text': 'فإنّ مقطع الكرة (S) بالمستوي (P) هو الدائرة ذات المركز A و نصف القطر AM حيث $AM = \\sqrt{MO^2 - OA^2}$ لأنّه من أجل كل نقطة M من هذه الدائرة فإنّ المثلث OAM قائم في A.',
                 'figure': {'description': 'كرة (S) مركزها O، [NS] شاقولي منقّط ؛ مستو (P) أزرق أفقي فوق O يقطع [NS] في A ؛ الدائرة المقطع (قطع ناقص أحمر) عليها M ؛ المثلث OAM ([OA] منقّط، [AM] و [OM] مستمران) قائم في A.',
                            'kind': 'space', 'solid': 'sphere', 'dims': {'R': R_k3, 'h': 1.2}, 'points3d': p3(O=(0, 0, 0), N=(0, 0, R_k3), S=S_c, A=A_a, M=M_a),
                            'reading': 'R = 2, h = 1,2 choisis (AM = 1,6, triangle 6-8-10 réduit, assert).'}},
                {'case': 'إذا كان h = 0 (أيّ أنّ النقطتين A و O منطبقتان)', 'text': 'فإنّ مقطع الكرة (S) بالمستوي (P) هو الدائرة التي مركزها O و نصف قطرها R. مقطع الكرة بهذا المستوي في هذه الحالة هي دائرة كبرى.',
                 'figure': {'description': 'كرة مركزها O ؛ مستو (P) أزرق أفقي يمرّ بـ O ؛ المقطع دائرة كبرى (قطع ناقص أحمر) عليها M ؛ [OM] منقّط مكتوب عليه R.',
                            'kind': 'space', 'solid': 'sphere', 'dims': {'R': R_k3, 'h': 0}, 'points3d': p3(O=(0, 0, 0), N=(0, 0, R_k3), S=S_c, M=M_b)}},
                {'case': 'إذا كان h = R', 'text': 'المستوي (P) و الكرة (S) يشتركان في نقطة واحدة إمّا N و إمّا S. في هذه الحالة يكون المستوي (P) مماسًا للكرة في إحدى النقطتين إمّا N و إمّا S (انظر الشكل). تُسمى النقطة S، نقطة تماس الكرة بالمستوي (P).',
                 'figure': {'description': 'كرة مركزها O و دائرة كبرى أفقية (قطع ناقص، الخلفي منقّط) مع نصف قطر R ؛ مستو (P) أزرق أفقي تحت الكرة يلامسها في S.',
                            'kind': 'space', 'solid': 'sphere', 'dims': {'R': R_k3, 'h': R_k3}, 'points3d': p3(O=(0, 0, 0), N=(0, 0, R_k3), S=S_c, M=M_b)}},
            ],
        },
        'cuboid': {
            'label': 'ب)', 'title': 'مقطع بلاطة قائمة بمستو', 'reading': 'completed',
            'properties': {'heading': 'خواص', 'items': [
                'مقطع بلاطة قائمة بمستو مُواز لأحد أوجهها هو مستطيل له نفس بُعدي الوجه الموازي له.',
                'مقطع بلاطة قائمة بمستو مُواز لأحد أحرفه هو مستطيل طوله أو عرضه يُساوي طول ذلك الحرف.',
            ]},
            'figures': [
                {'label': 'مواز لوجه', 'description': 'بلاطة قائمة (A أعلى الخلف يسارا، D أعلى الأمام يسارا، E و H تحتهما) ؛ مستو (P) شاقولي يوازي الوجه ADHE يقطعها وفق المستطيل IJKL (I و J في الأعلى، K و L في الأسفل، رموز زوايا قائمة).',
                 'kind': 'space', 'solid': 'cuboid', 'dims': {'length': 6, 'width': 4, 'height': 3}, 'points3d': p3(**Cb, I=face_I, J=face_J, K=face_K, L=face_L), 'section': ['I', 'J', 'K', 'L'],
                 'reading': 'Dimensions non données (6 × 4 × 3 choisies). Repère H origine, x le long de [HG], y le long de [HE], z le long de [HD] ; coupe x = 2 ∥ ADHE (x = 0).'},
                {'label': 'مواز لحرف', 'description': 'بلاطة قائمة (A أعلى الأمام يسارا و E تحته) ؛ مستو (P) شاقولي مائل يوازي الحرف [AE] يقطع الوجه العلوي وفق [IJ] المائل و الوجه السفلي وفق [LK] ؛ المقطع IJKL مستطيل ([IL] و [JK] شاقوليان، رموز زوايا قائمة).',
                 'kind': 'space', 'solid': 'cuboid', 'dims': {'length': 6, 'width': 4, 'height': 3}, 'points3d': p3(**Cb, I=edge_I, J=edge_J, K=edge_K, L=edge_L), 'section': ['I', 'J', 'K', 'L'],
                 'reading': 'Position de la coupe choisie (I(1 ; 4 ; 3), J(5 ; 0 ; 3)) : IL = AE = 3 (assert), IJ = 4√2.'},
            ],
        },
        'cylinder': {
            'label': 'جـ)', 'title': 'المقاطع المستوية لأسطوانة الدوران',
            'properties': {'heading': 'خواص', 'items': [
                'مقطع أسطوانة الدوران، نصف قطرها R بمستو مُواز لقاعدتها هو دائرة، نصف قطرها R و مركزها نقطة من محورها.',
                'مقطع أسطوانة الدوران بمستو مُواز لمحورها هو مستطيل، طوله أو عرضه يُساوي ارتفاع الأسطوانة.',
            ]},
            'figures': [
                {'label': 'مواز للقاعدة', 'description': 'أسطوانة محورها (OO′) شاقولي منقّط ؛ R مكتوب على نصف قطر القاعدة العليا ؛ مستو (P) أزرق أفقي يقطعها وفق دائرة (قطع ناقص) نصف قطرها R مكتوب.',
                 'kind': 'space', 'solid': 'cylinder', 'dims': {'R': Rc, 'h': hc}, 'points3d': p3(O_=(0, 0, 0), O=(0, 0, hc), O1=(0, 0, R_(5, 2))), 'section': {'circle': {'center': 'O1', 'radius': Rc}},
                 'reading': 'R = 2, h = 4 choisis ; O1 (nom plateforme) centre de la section sur l’axe.'},
                {'label': 'مواز للمحور', 'description': 'أسطوانة (O مركز القاعدة العليا، O′ مركز السفلى) ؛ مستو (P) شاقولي يوازي المحور يقطعها وفق المستطيل ABCD (A و B على الدائرة العليا، D و C على السفلى).',
                 'kind': 'space', 'solid': 'cylinder', 'dims': {'R': Rc, 'h': hc}, 'points3d': p3(O_=(0, 0, 0), O=(0, 0, hc), A=cyl_A, B=cyl_B, C=cyl_C, D=cyl_D), 'section': ['A', 'B', 'C', 'D'],
                 'reading': 'Coupe x = 1 : AB = 2√3, BC = h = 4 (assert).'},
            ],
        },
    },
    'note': 'Le manuel n’imprime PAS l’intitulé « ب) » de la partie bloc (on passe de « أ) مقطع كُرة بمستو » directement à l’encadré « خواص » des pavés, puis à « جـ) ») : la plateforme rétablit « ب) مقطع بلاطة قائمة بمستو ». Les sections de la pyramide et du cône (et la معرفة sur l’agrandissement–réduction) ne sont pas sur ces pages : voir discrepancies (missing_page).',
})
disc('know-3', 'completion', '(intitulé absent entre أ) et جـ))', 'ب) مقطع بلاطة قائمة بمستو',
     'La numérotation saute de « أ) » à « جـ) » : l’encadré des pavés n’a pas de titre. Intitulé repris de l’activité 3 (« مقطع بلاطة قائمة بمستو »).', 'completed_in_lessons')
disc('know-3', 'missing_page', '(pages après la p. 169 non fournies)', 'د) مقطع هرم / مخروط دوران بمستو مواز للقاعدة — ajout déclaré de la plateforme (knowledge_formalization)',
     'Le scan s’arrête p. 169 ; l’activité 5 (p. 165) prépare la section d’une pyramide parallèle à la base (réduction de rapport SE/SA) mais la معرفة correspondante (pyramide ET cône : section parallèle à la base = réduction de la base) n’est pas dans le scan. maqati-mustawiya l’écrit comme knowledge_formalization, à partir de act-5.',
     'platform_addition — knowledge_formalization')
disc('act-6', 'missing_page', '(pages après la p. 169 non fournies)', 'معرفة « التكبير و التصغير » : dans un agrandissement / une réduction de rapport k, les longueurs sont multipliées par k, les aires par k², les volumes par k³ (k > 1 agrandissement, 0 < k < 1 réduction) — ajout déclaré (knowledge_formalization)',
     'Act-6 fait vérifier 𝒱′ = (3/5)³𝒱 et 𝒜′ = (3/5)²𝒜 mais la معرفة et ses طرائق ne sont pas dans le scan. takbir-tasghir les écrit comme knowledge_formalization.',
     'platform_addition — knowledge_formalization')

disc('objectives', 'missing_page', '(pp. 170 et suivantes non fournies)', 'تمارين أوظّف، أؤكّد (QCM)، أدمج تعلّماتي (وضعية)، أتعمّق — écrits par la plateforme',
     'Le scan (7 pages) s’arrête à la fin des طرائق p. 169 : aucun exercice, QCM, situation d’intégration ni أتعمّق. Les modules 4 des leçons et les modules 2–3 de wadiya-idmajiya-fada sont des ajouts déclarés ; la وضعية de synthèse est le تحدّ (seau).',
     'platform_addition — practice bank')

# >>> PAGE 169
# ══ Page 169 — طرائق : حساب نصف قطر مقطع كرة بمستو ؛ دوري الآن ═══════════════════
R_ms, OO_ms = R_(5, 2), R_(3, 2)
O1_ms = (0, 0, OO_ms)
M_ms = (-sp.sqrt(R_ms ** 2 - OO_ms ** 2), 0, OO_ms)
assert M_ms[0] == -2 and dist((0, 0, 0), M_ms) == R_ms and dist(O1_ms, M_ms) == 2
assert dist((0, 0, 0), M_ms) ** 2 == OO_ms ** 2 + dist(O1_ms, M_ms) ** 2 and R_ms ** 2 - OO_ms ** 2 == 4
E.append({
    'id': 'method-section-radius', 'kind': 'method', 'page': 169, 'section': 'طرائق', 'title': 'حساب نصف قطر مقطع كُرة بمستو', 'verified': True,
    'exercise': {'heading': 'تمرين', 'text': 'يقطع مستو (P) كرة مركزها O و نصف قطرها 2,5cm وفق دائرة مركزها O′ نقطة تقاطع المستقيم الذي يشمل O و العمودي على هذا المستوي حيث OO′ = 1,5cm. أنجز تمثيلا مناسبا ثُم عيّن نصف قطر الدائرة.'},
    'solution': {
        'heading': 'حل',
        'text': 'لتكن M نقطة من الدائرة (مقطع الكرة بهذا المستوي (P)). OM هو نصف قطر الكرة و O′M نصف قطر الدائرة و (O′M) ⊥ (OO′). بتطبيق خاصية فيثاغورث في المثلث OO′M القائم في O′، يكون $OM^2 = OO\'^2 + O\'M^2$ و منه $2{,}5^2 = 1{,}5^2 + O\'M^2$ أي $O\'M^2 = 2{,}5^2 - 1{,}5^2$ و عليه $O\'M^2 = 4$ أي $O\'M = \\sqrt{4} = 2$ . إذن نصف قطر الدائرة هو 2cm.',
    },
    'method': {'heading': 'طريقة', 'text': 'يُمكن استعمال خاصية فيثاغورس لحساب نصف قطر مقطع كُرة بمستو لا يمر بمركزها'},
    'answer': {'radius': '$O\'M = \\sqrt{6{,}25 - 2{,}25} = 2$ cm', 'exact': '2'},
    'answerSource': 'computed',
    'figure': {
        'description': 'كرة مركزها O و دائرة كبرى أفقية منقّطة ؛ مستو (P) أصفر شفاف أفقي قرب القمة يقطعها وفق دائرة صغرى (قطع ناقص) مركزها O′ و عليها M ؛ [OO′] شاقولي و [O′M] أفقي مع رمز زاوية قائمة في O′ ؛ [OM] غير مرسوم.',
        'kind': 'space', 'solid': 'sphere', 'dims': {'R': 2.5, 'OO′': 1.5},
        'points3d': p3(O=(0, 0, 0), O_=O1_ms, M=M_ms),
    },
    'note': 'Le manuel écrit « فيثاغورث » dans la solution et « فيثاغورس » dans l’encadré « طريقة » (deux graphies du même nom). Triangle 3-4-5 réduit de moitié (1,5 ; 2 ; 2,5).',
})
disc('method-section-radius', 'reading', 'فيثاغورث (solution) / فيثاغورس (encadré)', 'فيثاغورس',
     'Deux graphies dans le même encadré ; la plateforme uniformise sur « فيثاغورس » (graphie de l’encadré et des unités 9–10).', 'kept_in_quote — lessons use فيثاغورس')

R_n9, h_n9, d_n9 = 2, 3, 1
half_n9 = sp.sqrt(R_n9 ** 2 - d_n9 ** 2)
A_n9, B_n9 = (-half_n9, -d_n9, h_n9), (half_n9, -d_n9, h_n9)
C_n9, D_n9 = (half_n9, -d_n9, 0), (-half_n9, -d_n9, 0)
for P_ in (A_n9, B_n9, C_n9, D_n9):
    assert P_[0] ** 2 + P_[1] ** 2 == R_n9 ** 2
assert is_rectangle(A_n9, B_n9, C_n9, D_n9)
AB_n9 = dist(A_n9, B_n9)
assert AB_n9 == 2 * sp.sqrt(3) and dist(B_n9, C_n9) == 3
area_n9 = AB_n9 * dist(B_n9, C_n9)
assert area_n9 == 6 * sp.sqrt(3) and rnd(area_n9, 2) == 10.39
Hn9 = mid(A_n9, B_n9)
assert dist((0, 0, h_n9), Hn9) == 1 and dot(vec((0, 0, h_n9), Hn9), vec(A_n9, B_n9)) == 0
E.append({
    'id': 'now-169', 'kind': 'now', 'page': 169, 'section': 'دوري الآن', 'verified': True,
    'text': '(P) مستو مُواز لمحور أسطوانة دوران ارتفاعها 3cm و نصف قطر قاعدتها 2cm. يقطع الأسطوانة وفق الرباعي ABCD.',
    'parts': [
        {'label': '1)', 'text': 'ما نوع الرباعي ABCD.'},
        {'label': '2)', 'text': 'نفرض أنّ المسافة بين النقطة O و المستقيم (AB) هي 1cm. احسب القيمة المضبوطة لمساحة الرباعي ABCD.'},
    ],
    'answer': {
        '1': 'ABCD مستطيل (مقطع أسطوانة دوران بمستو مُواز لمحورها) أحد بعديه BC = AD = 3 cm (ارتفاع الأسطوانة).',
        '2': 'ليكن H المسقط العمودي لـ O على (AB): OH = 1 cm و H منتصف الوتر [AB] (OA = OB = 2) ؛ $AH^2 = 2^2 - 1^2 = 3$ ، $AH = \\sqrt{3}$ و $AB = 2\\sqrt{3}$ cm.',
        '2area': 'مساحة ABCD $= 2\\sqrt{3} \\times 3 = 6\\sqrt{3}$ cm² (≈ 10,39 cm²).',
        'exact': '6\\sqrt{3}',
    },
    'answerSource': 'computed',
    'figure': {
        'description': 'أسطوانة دوران شاقولية ارتفاعها 3cm (سهم على اليسار) ؛ O مركز القاعدة العليا و محور منقّط ؛ A و B على الدائرة العليا ([AB] وتر)، D و C على السفلى ؛ [AD] شاقولي مستمر و [BC] منقّط، [DC] منقّط ؛ مركز القاعدة السفلى نقطة غير مسمّاة.',
        'kind': 'space', 'solid': 'cylinder', 'dims': {'R': R_n9, 'h': h_n9, 'distOtoAB': d_n9},
        'points3d': p3(O_=(0, 0, 0), O=(0, 0, h_n9), H=Hn9, A=A_n9, B=B_n9, C=C_n9, D=D_n9), 'section': ['A', 'B', 'C', 'D'],
        'reading': 'Repère : centre de la base inférieure (O′, non nommé dans le manuel) à l’origine ; coupe y = −1 ; H (nom plateforme) milieu de [AB].',
    },
    'note': 'Même calcul que act-4 (distance axe–plan puis Pythagore dans la base) avec un résultat irrationnel : « القيمة المضبوطة » = $6\\sqrt{3}$ (unité 2 « الحساب على الجذور »).',
})

# ══ Destinations ═════════════════════════════════════════════════════════════
L1, L2, L3, L4, L5 = 'kura-julla', 'misaha-hajm-kura', 'maqati-mustawiya', 'takbir-tasghir', 'wadiya-idmajiya-fada'
DEST = {
    '_comment': 'elementId → { lesson, module } ; `duplicatedIn` autorise une seconde utilisation déclarée ; `items` répartit un élément. Modules : 0 أستعدّ, 1 أنشطة/entrée, 2 معارف, 3 طرائق, 4 تمارين/أوظّف (synthèse : 1 وضعية, 2 أؤكّد, 3 أتعمّق).',
    'objectives': {'lesson': 'unit', 'module': 'page'},
    'intro-archimedes': {'lesson': 'unit', 'module': 'page', 'duplicatedIn': [{'lesson': L2, 'module': 1, 'note': 'entrée : la boule dans le cylindre — aire = aire latérale, volume = 2/3 du cylindre'}]},
    'challenge': {'lesson': L5, 'module': 1, 'duplicatedIn': [{'lesson': 'unit', 'module': 'page', 'note': 'énoncé seul, sans réponse'}]},
    'prep': {'lesson': L1, 'module': 0, 'items': {'1': {'lesson': L1, 'module': 0}, '2': {'lesson': L1, 'module': 0},
                                                  '3': {'lesson': L4, 'module': 0}, '4': {'lesson': L2, 'module': 0}, '5': {'lesson': L2, 'module': 0},
                                                  '6': {'lesson': L2, 'module': 0}, '7': {'lesson': L4, 'module': 0}, '8': {'lesson': L4, 'module': 0}}},
    'act-1': {'lesson': L1, 'module': 1},
    'act-2': {'lesson': L3, 'module': 1}, 'act-3': {'lesson': L3, 'module': 1}, 'act-4': {'lesson': L3, 'module': 1},
    'act-5': {'lesson': L3, 'module': 1, 'duplicatedIn': [{'lesson': L4, 'module': 1, 'note': 'la section parallèle à la base est une réduction de rapport 3/4 (aire 9 = (3/4)² × 16)'}]},
    'act-6': {'lesson': L4, 'module': 1},
    'know-1': {'lesson': L1, 'module': 2}, 'know-2': {'lesson': L2, 'module': 2}, 'know-3': {'lesson': L3, 'module': 2},
    'method-sphere-draw': {'lesson': L1, 'module': 3}, 'method-point': {'lesson': L1, 'module': 3}, 'now-167': {'lesson': L1, 'module': 3},
    'method-section-radius': {'lesson': L3, 'module': 3}, 'now-169': {'lesson': L3, 'module': 3},
}

ids = [e['id'] for e in E]
assert ids == ['objectives', 'intro-archimedes', 'challenge', 'prep', 'act-1', 'act-2', 'act-3', 'act-4', 'act-5', 'act-6',
               'know-1', 'know-2', 'method-sphere-draw', 'method-point', 'now-167', 'know-3', 'method-section-radius', 'now-169'], ids
assert len(ids) == len(set(ids))
missing = [i for i in ids if i not in DEST]
assert not missing, missing
extra = [k for k in DEST if k != '_comment' and k not in ids]
assert not extra, extra
assert sorted(int(k) for k in DEST['prep']['items']) == list(range(1, 9)) == [it['number'] for it in E[3]['items']]
for e in E:
    assert 163 <= e['page'] <= 169, e['id']
    assert 'answerSource' not in e or e['answerSource'] == 'computed'
assert set(E[ids.index('know-3')]['subParts']) == {'sphere', 'cuboid', 'cylinder'}
for d_ in DISC:
    assert d_['kind'] in ('misprint', 'reading', 'completion', 'missing_page', 'figure') and d_['elementId'] in ids, d_

NOTES = {
    'frames': 'Toutes les figures d’espace (`figure.points3d`) sont en repère orthonormé direct, unité = cm, z vers le haut, y « vers l’arrière » (profondeur), x vers la droite. Pavés (act-3, know-3) : H à l’origine, x le long de [HG], y le long de [HE], z le long de [HD] ; act-6 : E à l’origine, x le long de [EF] (AB), y le long de [FG]… (BC), z le long de [EA]. Sphères : centre O à l’origine, axe (NS) = (Oz). Cylindres : centre de la base inférieure (O′) à l’origine, axe (Oz). Pyramide (act-5) : centre de la base à l’origine, sommet S sur (Oz) (hauteur 6 choisie). Seau (challenge) : centre du fond à l’origine. Les dimensions non données par le manuel (R des figures de know-1/know-3, position des coupes, hauteur de la pyramide) sont choisies et déclarées dans `reading` ; elles n’influent sur aucune réponse (assert quand c’est le cas).',
    'destinationRationale': {
        'challenge': 'Le تحدّ (seau = tronc de cône, eau à 28 cm de profondeur) mobilise Thales dans la coupe axiale, le volume du cône et une réduction de rapport 15/19 → ' + L5 + ' (وضعية, module 1) ; la page d’unité en montre l’énoncé seul.',
        'prep': 'Items 1–2 (cercle, disque : l’analogie plan → espace de la sphère et de la boule) → ' + L1 + ' ; items 4–6 (volumes cube, pavé, cylindre : prérequis du volume de la boule, 2/3 du cylindre d’Archimède) → ' + L2 + ' ; items 3, 7, 8 (Thales, cône, pyramide : la section parallèle à la base d’un cône / d’une pyramide est une réduction) → ' + L4 + '. ' + L3 + ' n’a pas d’item du manuel : la leçon ajoute des items de plateforme (Pythagore, rectangle).',
        'act-5': 'Section d’une pyramide parallèle à la base : activité d’entrée de ' + L3 + ' (nature du quadrilatère EFGH), dupliquée dans ' + L4 + ' (EFGH est la réduction de rapport 3/4 de ABCD).',
        'now-167': 'N’utilise que la sphère (OA = OB = R), le triangle équilatéral et Pythagore → ' + L1 + ' (module 3), même s’il annonce le calcul de rayon de section de ' + L3 + '.',
        'missing': 'Le scan n’a ni تمارين, ni أؤكّد (QCM), ni أدمج تعلّماتي, ni أتعمّق : les modules 4 de toutes les leçons et les modules 2–3 de ' + L5 + ' sont écrits par la plateforme (banque de pratique), sans élément du manuel à citer.',
    },
    'labAdvancedLevel': {
        L1: ['act-1 (cercle/disque → sphère/boule : OM = R vs OM ≤ R)', 'know-1 example ((δ) / (β) : M sur la sphère, P dans la boule, Q à l’extérieur)'],
        L2: ['intro-archimedes (boule dans le cylindre de hauteur 2R : 4πR² = aire latérale, V = 2/3 du cylindre)', 'know-2 example (R = 1,4 : 24,63 cm² au mm², 11,494 cm³ au mm³)'],
        L3: ['act-2 (le plan (P) glisse le long de [NS] : IM² = 9 − x², du grand cercle (x = 0) au point de contact (x = 3))'],
        L4: ['act-6 (pavé 5 × 4 × 3 réduit de 3/5 : 𝒱′ = (3/5)³𝒱 = 12,96, 𝒜′ = (3/5)²𝒜 = 33,84)'],
        L5: ['challenge (seau : 24388π/3 ≈ 25 539,1 cm³ par différence de deux cônes)'],
    },
}

OUT = {
    '_comment': 'EXTRACTION CANONIQUE du manuel scolaire officiel — 4AM, الجيل الثاني, unité 14 « الهندسة في الفضاء ». Générée par build-extraction.py (ne pas éditer à la main).',
    'unitCode': 'handasa-fada',
    'textbook': {'title': 'كتاب الرياضيات — السنة الرابعة من التعليم المتوسط', 'generation': 'الجيل الثاني', 'unitNumber': 14,
                 'unitTitle': 'الهندسة في الفضاء', 'chapter': 'handasa', 'pages': {'first': 163, 'last': 169}, 'pdfPageOffset': 162,
                 'sections': ['سأتعلّم في هذا الباب', 'تحدّ', 'أستعدّ', 'أنشطة', 'معارف', 'طرائق', 'دوري الآن'],
                 'missingPages': {'from': 170, 'content': ['معارف: مقطع هرم / مخروط دوران بمستو', 'معارف: التكبير و التصغير', 'طرائق المقابلة', 'أوظّف تعلّماتي (تمارين)', 'أؤكّد تعلّماتي (QCM)', 'أدمج تعلّماتي (وضعية)', 'أتعمّق'],
                                  'note': 'Contenus usuels d’une unité du manuel, absents du scan fourni (7 pages). Écarts missing_page dans `discrepancies` ; les leçons les écrivent comme ajouts déclarés (knowledge_formalization, banque de pratique).'}},
    'frozenAt': '2026-10-05',
    'scope': 'Scan PARTIEL, 7 pages (163–169) : ouverture (objectifs, Archimède, تحدّ, أستعدّ 8 items), 6 activités (pp. 164–165), 3 blocs de معارف (pp. 166, 168 ; le 3e couvre sphère, pavé, cylindre seulement), 3 طرائق et 2 « دوري الآن » (pp. 167, 169). missing_pages : aucune page d’exercices (أوظّف), pas de QCM (أؤكّد), pas de وضعية (أدمج تعلّماتي), pas de أتعمّق ; ni la معرفة des sections de pyramide / cône, ni celle de l’agrandissement–réduction (pages au-delà de 169 non fournies).',
    'terminology': {
        'note': 'Le manuel distingue الكرة (la SPHÈRE, surface : OM = R) et الجلّة (la BOULE, solide : OM ≤ R) ; on dit « مساحة الكرة » et « حجم الجلّة » (l’intro d’Archimède écrit encore « حجم الكرة »). « البلاطة القائمة » = pavé droit (act-3, know-3) ; act-6 dit « متوازي مستطيلات » (synonyme, aussi dans أستعدّ item 5). « المخروط المبتور » = tronc de cône (تحدّ). Volume 𝒱 et aire 𝒜 en lettres calligraphiées ($\\mathcal{V}$, $\\mathcal{A}$). « الدوائر الكبرى / الصغرى » (la figure de know-1 dit aussi « دوائر صغيرة »). « فيثاغورث » et « فيثاغورس » coexistent p. 169.',
        'terms': {
            'الكرة': 'sphère (surface, ensemble des M avec OM = R)',
            'الجلّة': 'boule (solide, OM ≤ R)',
            'مركز الكرة': 'centre', 'نصف القطر': 'rayon', 'قطر الكرة': 'diamètre (segment de milieu O, longueur 2R)',
            'الدائرة الكبرى': 'grand cercle (centre O, rayon R)',
            'الدائرة الصغرى': 'petit cercle (centre ≠ O, rayon < R)',
            'مساحة الكرة': 'aire de la sphère 4πR²', 'حجم الجلّة': 'volume de la boule 4/3 πR³',
            'المقطع المستوي': 'section plane', 'مقطع … بمستو': 'section de … par un plan',
            'المسافة بين نقطة و مستو': 'distance d’un point à un plan (OA, A pied de la perpendiculaire)',
            'مماس': 'tangent (plan tangent à la sphère)', 'نقطة التماس': 'point de contact',
            'البلاطة القائمة': 'pavé droit (= متوازي المستطيلات)', 'متوازي المستطيلات': 'parallélépipède rectangle (synonyme utilisé en act-6 et أستعدّ)',
            'وجه': 'face', 'حرف': 'arête', 'رأس': 'sommet',
            'أسطوانة الدوران': 'cylindre de révolution', 'محور الأسطوانة': 'axe', 'قاعدة': 'base', 'الارتفاع': 'hauteur',
            'مخروط الدوران': 'cône de révolution', 'المخروط المبتور': 'tronc de cône',
            'الهرم المنتظم': 'pyramide régulière',
            'التكبير': 'agrandissement', 'التصغير': 'réduction', 'نسبة التكبير / التصغير': 'rapport k',
            'المساحة الكلّية لأوجهه': 'aire totale des faces', 'المساحة الجانبية': 'aire latérale',
            'تمثيل': 'représentation (perspective)', 'الشكل البيضوي': 'ellipse (grand cercle vu en perspective)', 'خط متقطّع': 'trait pointillé (partie cachée)',
            'القيمة المضبوطة': 'valeur exacte', 'بالتدوير إلى': 'arrondi à',
        },
    },
    'notes': NOTES,
    'elements': E,
    'discrepancies': DISC,
    'destinations': DEST,
}
Path(__file__).with_name('extraction.json').write_text(json.dumps(OUT, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
print(f'{len(E)} éléments, {len(DISC)} écarts, {len(DEST) - 1} destinations')
