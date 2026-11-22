#!/usr/bin/env python3
"""Génère docs/sources/4am/unit11/extraction.json — unité 11 « الأشعة والانسحاب » (pp. 127–138).

Transcription VISUELLE du scan (« وحدة الأشعة و الانسحاب.pdf », 12 pages CamScanner, sans couche texte, page PDF N =
page du manuel 126 + N), pages rendues à 150 dpi, relues à 300 dpi agrandies (ouverture, تحدّ, quadrillage du نشاط 1 —
page bombée près de la reliure —, quadrillages du نشاط 3, des معارف, des تمارين 2 et 4, figures du QCM et de la وضعية).
L'unité est COMPLÈTE : ouverture (سأتعلّم + encadré historique Chasles), تحدّ, أستعدّ (7 items), 4 أنشطة, معارف (6 blocs),
طرائق (4 méthodes, 2 « دوري الآن »), أوظّف تعلّماتي (1–16), أؤكّد تعلّماتي (QCM 1–7), أدمج تعلّماتي (وضعية), أتعمّق (17–25),
أوظّف تكنولوجيات الإعلام والاتصال (GeoGebra) + « دوري الآن » (p. 138).

Le texte arabe est celui du manuel, au mot près ; les débuts de ligne mangés par la marge droite (p. 129) sont
complétés et marqués `reading: 'completed'`. Les réponses ne viennent PAS du manuel (il n'en donne pas) : elles sont
CALCULÉES ici (`answerSource: computed`) en coordonnées exactes (fractions) — chaque égalité de vecteurs, chaque
parallélogramme, chaque milieu est re-vérifié par assert. Les figures sont DÉCRITES en données (`figure`, `points`) :
la plateforme les redessine (GeoFigure), jamais d'image du manuel. Quand le manuel ne donne pas de coordonnées
(figure libre), les `points` sont un MODÈLE de la plateforme qui respecte la disposition du dessin (`model: true`).

Usage : python3 docs/sources/4am/unit11/build-extraction.py
"""
import json
import math
from fractions import Fraction as F
from itertools import product
from pathlib import Path


# ── Vecteurs exacts ──────────────────────────────────────────────────────────
def P(x, y):
    return (F(x), F(y))


def vec(a, b):
    return (b[0] - a[0], b[1] - a[1])


def add(*vs):
    return (sum(v[0] for v in vs), sum(v[1] for v in vs))


def neg(v):
    return (-v[0], -v[1])


def mul(k, v):
    return (F(k) * v[0], F(k) * v[1])


def tr(p, v):
    """Image de p par la translation de vecteur v."""
    return (p[0] + v[0], p[1] + v[1])


def mid(a, b):
    return ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)


def sym(p, c):
    """Symétrique de p par rapport au point c."""
    return (2 * c[0] - p[0], 2 * c[1] - p[1])


def para(a, b, c, d):
    """ABCD (dans cet ordre) est un parallélogramme (non aplati) ⇔ AB = DC et A, B, C non alignés."""
    return vec(a, b) == vec(d, c) and cross(vec(a, b), vec(a, d)) != 0


def cross(u, v):
    return u[0] * v[1] - u[1] * v[0]


def n2(v):
    return v[0] * v[0] + v[1] * v[1]


def pts(**kw):
    """Coordonnées pour GeoFigure : {nom: [x, y]} (fractions écrites en chaînes si non entières)."""
    out = {}
    for k, (x, y) in kw.items():
        out[k.replace('_', "'")] = [int(x) if x.denominator == 1 else str(x), int(y) if y.denominator == 1 else str(y)]
    return out


def equal_to(v, named):
    """Tous les couples (X ; Y) de points nommés tels que XY = v."""
    return sorted(f'{a}{b}'.replace('_', "'") for a, b in product(named, named) if a != b and vec(named[a], named[b]) == v)


E = []
DISC = []

# ── Ouverture (p. 127) ───────────────────────────────────────────────────────
E.append({
    'id': 'objectives', 'kind': 'objectives', 'page': 127, 'section': 'سأتعلّم في هذا الباب', 'verified': True,
    'items': [
        'تعريف شعاع انطلاقا من الانسحاب.',
        'معرفة شروط تساوي شعاعين واستعمالها.',
        'معرفة علاقة شال واستعمالها لإنشاء مجموع شعاعين أو لإنشاء شعاع يحقق علاقة شعاعية معينة أو لإنجاز براهين بسيطة.',
    ],
    'note': 'Encadré jaune pâle, lu à 300 dpi ; mots sûrs.',
})
E.append({
    'id': 'intro-chasles', 'kind': 'aside', 'page': 127, 'section': 'مدخل الباب', 'title': 'ميشال شال', 'verified': True,
    'text': 'إن استعمال مفهوم الشعاع حديث العهد. لقد استعمل الرياضياتي قيستوبيلا فيتيس ما سمّاه «القطع المتسايرة» في سنة 1832، وفي إحدى مؤلفاته عرض طريقة التساير لأول مرة. بعد هذه الفترة، تغيّر اسم هذه الطريقة ليصبح تحت العنوان «الأشعة المتسايرة». أما الرمز $\\overrightarrow{AB}$ لتمثيل شعاع معيّن بنقطتين A و B فقد بدأ استعماله في البرامج التعليمية في بداية القرن العشرين. فيما يخص ميشال شال، لقد اهتم بدوره بإبراز الأهمية التي تتضمنها التحويلات الهندسية المحافظة لبعض الخواص مثل الاستقامية، التوازي... إنه يُعتبر أحد الباحثين الذين قدموا نتائج هامة في ميدان الحساب الشعاعي. ورغم أنه لم يكتب بصفة صريحة العلاقة الشعاعية، فقد نُسبت إليه وحملت اسمه إلى يومنا هذا: «علاقة شال» وهي $\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$ .',
    'caption': 'صورة: ميشال شال (1793م-1880م) (صورة في الكتاب — لا تُنسخ).',
    'note': '« قيستوبيلا فيتيس » est la transcription du manuel (Giusto Bellavitis, équipollences, 1832) ; la plateforme garde la graphie du manuel. Dates de la légende lues « 1793م-1880م » (petit texte rose incurvé).',
})

# ── تحدّ (p. 127) ────────────────────────────────────────────────────────────
VC, VS = 2, 4                         # courant, nageur (km/h)
SW_Y2 = VS * VS - VC * VC             # composante utile au carré : 12
assert SW_Y2 == 12
SW_ANGLE = math.degrees(math.asin(VC / VS))
assert abs(SW_ANGLE - 30) < 1e-12
E.append({
    'id': 'challenge', 'kind': 'challenge', 'page': 127, 'section': 'تحدّ', 'verified': True,
    'text': 'انطلق سبّاح محترف من الموقع A وهو يريد الوصول إلى الموقع B من النهر. المسار [AB] عمودي على حافتي هذا النهر (الشكل). في تلك اللحظة، و للأسف، اشتد تيار الماء في النهر حيث بلغت سرعته 2km/h . إذا علمت أن سرعة السبّاح هي 4km/h ، ففي أيّ اتجاه ينبغي عليه السباحة حتى يصل إلى النقطة B؟',
    'figure': {
        'description': 'نهر بين حافتين أفقيتين (عشب): A على الحافة السفلى و B على الحافة العليا، كلتاهما على اليمين، [AB] شاقولي عمودي على الحافتين. في وسط النهر إطار أبيض فيه سهم أفقي أحمر نحو اليمين: شعاع سرعة التيار (2km/h). طائر في السماء (زخرفة).',
        'points': pts(A=P(0, 0), B=P(0, 6)), 'current': {'vector': [1, 0], 'speed': '2km/h', 'sense': 'من اليسار إلى اليمين'},
        'reading': 'completed',
        'readingNote': 'Le petit libellé au-dessus de la flèche du courant est illisible (une lettre surmontée d’une flèche, probablement $\\vec{v}$) ; la plateforme n’en a pas besoin : la vitesse 2km/h est dans le texte.',
    },
    'answer': {
        'model': 'سرعة السبّاح بالنسبة إلى الماء $\\vec{s}$ (طويلتها 4) و سرعة التيار $\\vec{c}$ (طويلتها 2): الحركة الفعلية هي $\\vec{s} + \\vec{c}$ ويجب أن تكون على منحى (AB).',
        'direction': 'يسبح عكس التيار (نحو اليسار، أعلى النهر) بزاوية 30° مع (AB) — أي 60° مع الحافة.',
        'why': '$\\sin\\alpha = \\dfrac{2}{4} = \\dfrac{1}{2}$ ⇒ $\\alpha = 30°$',
        'groundSpeed': '$\\sqrt{4^2 - 2^2} = \\sqrt{12} = 2\\sqrt{3} \\approx 3{,}46$ km/h',
    },
    'answerSource': 'computed',
    'note': 'Le تحدّ mobilise la SOMME de deux vecteurs (vitesse propre + courant) et, pour l’angle exact, la trigonométrie de l’unité 10 ($\\sin 30° = \\dfrac{1}{2}$) ; une construction à la règle et au compas (cercle de rayon 4 centré à l’extrémité de $\\vec{c}$ coupant (AB)) suffit sans calcul.',
})

# ── أستعدّ (p. 127) ──────────────────────────────────────────────────────────
pA, pB, pC, pD = P(0, 3), P(6, 3), P(5, 0), P(-1, 0)        # modèle du dessin de l'item 3 (A haut-gauche, B haut-droit)
pO = mid(pA, pC)
assert para(pA, pB, pC, pD) and mid(pB, pD) == pO
assert {sym(pA, pO), sym(pB, pO), sym(pC, pO)} == {pC, pD, pA}       # ABC ↦ CDA (= ADC)
lA, lB, lC, lD = F(0), F(147, 10), F(189, 10), F(336, 10)            # item 4 : abscisses relevées (mm) sur le dessin
assert lC - lA == lD - lB and (lA + lD) / 2 == (lB + lC) / 2
E.append({
    'id': 'prep', 'kind': 'prep', 'page': 127, 'section': 'أستعدّ', 'verified': True,
    'instruction': 'أصحيح أم خاطئ؟ برّر إجابتك.',
    'items': [
        {'number': 1, 'text': 'الرباعي ABCD متوازي أضلاع يعني قطراه [AC] و [BD] لهما نفس المنتصف.', 'answer': True},
        {'number': 2, 'text': 'في رباعي ABCD، لدينا (AB) و (CD) متوازيان. إذن ABCD متوازي أضلاع.', 'answer': False,
         'justification': 'شبه المنحرف له ضلعان متوازيان فقط: يلزم أن يكون (AD) // (BC) أيضا (أو AB = CD مع التوازي).'},
        {'number': 3, 'text': 'الرباعي ABCD الآتي متوازي أضلاع. إذن المثلثان ABC و ADC متناظران بالنسبة إلى النقطة O.', 'answer': True,
         'figure': {'description': 'متوازي أضلاع ABCD: A أعلى اليسار، B أعلى اليمين، C أسفل اليمين، D أسفل اليسار؛ القطران يتقاطعان في O.',
                    'points': pts(A=pA, B=pB, C=pC, D=pD, O=pO), 'model': True},
         'justification': 'O منتصف [AC] و [BD]: نظيرة A هي C، نظيرة B هي D، نظيرة C هي A.'},
        {'number': 4, 'text': 'في الشكل أدناه، النقط A، B، C، D تقع على استقامة واحدة و AC = BD . إذن القطعتان [AD] و [BC] لهما نفس المنتصف.', 'answer': True,
         'figure': {'description': 'مستقيم عليه بالترتيب A، B، C، D (B و C متقاربتان في الوسط).', 'abscissae': {'A': 0, 'B': '14,7', 'C': '18,9', 'D': '33,6'}, 'model': True},
         'justification': 'AC = AB + BC و BD = BC + CD فـ AB = CD، ومنه منتصف [BC] هو منتصف [AD].'},
        {'number': 5, 'text': 'ABCD متوازي أضلاع. إذن C هي صورة D بالانسحاب الذي يحوّل A إلى B.', 'answer': True,
         'justification': '$\\overrightarrow{AB} = \\overrightarrow{DC}$'},
        {'number': 6, 'text': 'A، B، C، D نقط حيث D هي صورة C بالانسحاب الذي يحوّل B إلى A. إذن القطعتان [AB] و [CD] متقايستان.', 'answer': True,
         'justification': '$\\overrightarrow{CD} = \\overrightarrow{BA}$ فـ CD = BA.'},
        {'number': 7, 'text': 'MNPQ متوازي أضلاع، I نقطة تقاطع قطريه [MP] و [NQ]. إذن', 'statements': [
            {'text': 'M هي نظيرة P بالنسبة إلى I.', 'answer': True},
            {'text': 'N هي نظيرة Q بالنسبة إلى (MP).', 'answer': False,
             'justification': 'N نظيرة Q بالنسبة إلى النقطة I (تناظر مركزي) لا بالنسبة إلى المستقيم (MP) — إلا إذا كان MNPQ معينا.'}]},
    ],
    'note': 'Item 7 : deux affirmations en deux colonnes (droite : « M هي نظيرة P بالنسبة إلى I »، gauche : « N هي نظيرة Q بالنسبة إلى (MP) »), jugées séparément.',
})

# ── أنشطة (pp. 128–129) ──────────────────────────────────────────────────────
# نشاط 1 : quadrillage (x vers la droite, y vers le haut, N à l'origine de la colonne x = 2).
G1 = dict(A=P(0, 5), B=P(2, 2), C=P(2, 4), M=P(0, 3), N=P(2, 0), A_=P(0, 8), D=P(2, 7), C_=P(2, 5),
          G=P(0, 10), E=P(2, 9), R=P(4, 6), P=P(4, 4), H=P(3, 4), K=P(3, 1), L=P(2, 10), F=P(2, 11))
g = G1
v_AM, v_AA, v_AG, v_CR = vec(g['A'], g['M']), vec(g['A'], g['A_']), vec(g['A'], g['G']), vec(g['C'], g['R'])
# 1) a) A→G : C→E, B→D ; C→R : A→D, B→P ; A→M : C→B, B→N
assert tr(g['C'], v_AG) == g['E'] and tr(g['B'], v_AG) == g['D']
assert tr(g['A'], v_CR) == g['D'] and tr(g['B'], v_CR) == g['P']
assert tr(g['C'], v_AM) == g['B'] and tr(g['B'], v_AM) == g['N']
# 2) a) A→A′, C→D, K→H : même translation ; image de B = C′
assert tr(g['C'], v_AA) == g['D'] and vec(g['K'], g['H']) == v_AA and tr(g['B'], v_AA) == g['C_']
# 1) b–d) (AG), (CE), (KH), (AM) verticales ; sens et longueurs
for a, b in [('A', 'G'), ('C', 'E'), ('K', 'H'), ('A', 'M')]:
    assert vec(g[a], g[b])[0] == 0
assert vec(g['A'], g['G']) == vec(g['C'], g['E']) == (0, 5) and vec(g['K'], g['H']) == (0, 3) and v_AM == (0, -2)
# d) GL ≠ EF (même longueur, directions différentes) ; RP ≠ EF (même direction et longueur, sens contraires)
GL, EF, RP = vec(g['G'], g['L']), vec(g['E'], g['F']), vec(g['R'], g['P'])
assert GL != EF and n2(GL) == n2(EF) == 4 and cross(GL, EF) != 0
assert RP == neg(EF) and RP != EF
# هـ) représentants de NM
NM = vec(g['N'], g['M'])
NM_REPS = [x for x in equal_to(NM, g) if x != 'NM']
assert NM_REPS == ["BA", "C'A'", 'DG', 'PD', 'RE'], NM_REPS
E.append({
    'id': 'act-1', 'kind': 'activity', 'number': 1, 'page': 128, 'section': 'أنشطة', 'title': 'الانسحاب ومفهوم الشعاع', 'verified': True,
    'intro': 'لاحظ الشكل.',
    'parts': [
        {'label': '1) أ)', 'text': 'عيّن في كل حالة مما يلي صورة المثلث ABC بواسطة الانسحاب الذي يحوّل: • A إلى G ، • C إلى R ، • A إلى M.'},
        {'label': 'ب)', 'text': 'المستقيمان (AG) و (CE) متوازيان، نقول إنّ لهما نفس المنحى. • تحقّق أن للمستقيمات: (AG) ، (CE) ، (KH) و (AM) نفس المنحى.'},
        {'label': 'جـ)', 'text': 'قارن اتجاهات أنصاف المستقيمات [AG) ، [CE) ، [KH) و [AM).'},
        {'label': 'د)', 'text': 'قارن بين الطولين AG و CE ثم بين AG و KH.'},
        {'label': '2) أ)', 'text': 'عيّن في كل حالة مما يلي صورة المثلث ABC بالانسحاب الذي يحوّل: • A إلى A′ ، • C إلى D ، • K إلى H.'},
        {'label': 'ب)', 'text': 'اشرح لماذا الانسحاب الذي يحوّل A إلى A′ هو نفسه الانسحاب الذي يحوّل C إلى D وهو أيضا الانسحاب الذي يحوّل K إلى H.'},
        {'label': 'جـ)', 'text': 'هل يُمكن إيجاد انسحاب آخر بحيث تكون صورة المثلث ABC بهذا الانسحاب هي نفسها بالانسحاب الذي يحوّل K إلى H.',
         'after': '• نقول إنّ الثنائيات (A ; A′) ، (C ; D) ، (K ; H) ، … المتكونة من نقطة و صورتها بهذا الانسحاب تُعرّف شعاعا $\\vec{u}$ يُرمز إليه بـ $\\overrightarrow{AA\'}$ أو بـ $\\overrightarrow{BB\'}$ أو بـ $\\overrightarrow{CC\'}$ ونكتب $\\vec{u} = \\overrightarrow{AA\'} = \\overrightarrow{CD} = \\overrightarrow{KH} = \\ldots$ . كُل من $\\overrightarrow{AA\'}$ ( أو $\\overrightarrow{CD}$ أو $\\overrightarrow{KH}$ …) هو مُمثّل للشعاع $\\vec{u}$ .'},
        {'label': 'د)', 'text': 'هل $\\overrightarrow{GL} = \\overrightarrow{EF}$ ؟ هل $\\overrightarrow{RP} = \\overrightarrow{EF}$ ؟ لماذا؟'},
        {'label': 'هـ)', 'text': 'عيّن ممثلين للشعاع $\\overrightarrow{NM}$ .'},
    ],
    'figure': {
        'description': 'ورقة مرصوفة (4 مربعات عرضا × 11 طولا، داخل إطار). المثلث ABC (A على الحافة اليسرى، B و C على العمود x = 2) وصوره الملوّنة: MBN (بالانسحاب A↦M)، A′DC′ (A↦A′)، GED (A↦G)، DRP (C↦R). القطعة [KH] شاقولية (x = 3). [EF] شاقولية فوق E، و L بين E و F ؛ قوسا مدوّر من G نحو L و F (علامات إنشاء).',
        'points': pts(**G1),
        'segments': ['AB', 'BC', 'CA', 'MB', 'BN', 'NM', "A'D", "DC'", "C'A'", 'GE', 'ED', 'DG', 'DR', 'RP', 'PD', 'KH', 'EF'],
        'grid': {'unit': 1, 'xRange': [0, 4], 'yRange': [0, 11]},
        'reading': 'Page bombée près de la reliure : le quadrillage est courbé et la colonne de gauche comprimée. Les ordonnées des points de gauche (A, M, A′, G) ont été relues contre la ligne de grille COURBÉE locale (A ≈ 4,8 lu contre la ligne droite, 5 contre la ligne courbée) ; les coordonnées retenues rendent les quatre translations de l’énoncé exactes (assert).',
    },
    'answer': {
        '1a': {'A→G': 'GED', 'C→R': 'DRP', 'A→M': 'MBN'},
        '1c': '[AG) و [CE) و [KH) لها نفس الاتجاه (نحو الأعلى) ؛ [AM) اتجاهها معاكس (نحو الأسفل).',
        '1d': 'AG = CE = 5 ؛ KH = 3 فـ AG ≠ KH (بوحدة الرصف).',
        '2a': "A′DC′ (A↦A′ ، C↦D ، B↦C′) في الحالات الثلاث",
        '2b': 'الانسحاب الذي يحوّل A إلى A′ يحوّل C إلى D و K إلى H: الثنائيات (A ; A′) ، (C ; D) ، (K ; H) لها نفس المنحى ونفس الاتجاه ونفس الطول (3 مربعات نحو الأعلى).',
        '2c': 'لا: الانسحاب يتعيّن بنقطة وصورتها.',
        '2d': {'GL=EF': False, 'GLwhy': 'نفس الطول (2) لكن منحيان مختلفان ([GL] أفقية و [EF] شاقولية).',
               'RP=EF': False, 'RPwhy': 'نفس المنحى ونفس الطول لكن اتجاهان متعاكسان: $\\overrightarrow{RP} = -\\overrightarrow{EF}$ .'},
        '2e': ['$\\overrightarrow{BA}$', "$\\overrightarrow{C'A'}$", '$\\overrightarrow{DG}$', '$\\overrightarrow{PD}$', '$\\overrightarrow{RE}$'],
    },
    'answerSource': 'computed',
})
DISC.append({'elementId': 'act-1', 'kind': 'reading', 'resolution': 'decided — G = (0 ; 10), A′ = (0 ; 8), labels restored',
             'text': 'Les étiquettes « G » (sommet en haut à gauche) et « ′ » de A′ sont mangées par la marge gauche ; seul « A » se lit au niveau de A′. Rétablies par l’énoncé (A ↦ G, A ↦ A′) et vérifiées par les images C ↦ E, C ↦ D.'})
DISC.append({'elementId': 'act-1', 'kind': 'reading', 'resolution': 'decided — coordinates in figure.points, all translations asserted',
             'text': 'Quadrillage bombé (reliure) : A mesuré 4,8 contre la grille droite ; 5 contre la grille courbée. A = (0 ; 5) est la seule lecture qui rend « C ↦ R » égal à « A ↦ D » (DRP image de ABC).'})
DISC.append({'elementId': 'act-1', 'kind': 'reading', 'resolution': 'omitted — compass arcs are not data',
             'text': 'Deux arcs (G→L et G→F) et un trait clair G–F près du haut : marques de compas sans rôle dans les questions ; GL = EF = 2 se lit sur la grille. La plateforme ne les redessine pas.'})

# نشاط 2 : أ) triangle libre ; ب) droite graduée.
A2, B2, C2 = P(0, 4), P(4, 3), P(3, 0)
D2 = tr(C2, vec(B2, A2))
assert para(A2, B2, C2, D2) and vec(A2, B2) == vec(D2, C2) and vec(A2, D2) == vec(B2, C2)
X = dict(C=F(-3), A=F(-1), O=F(0), D=F(1), B=F(3))
assert (X['B'] + X['C']) / 2 == X['O'] == (X['A'] + X['D']) / 2
assert X['B'] - X['A'] == X['D'] - X['C'] == 4 and X['C'] - X['A'] == -(X['B'] - X['D'])
E.append({
    'id': 'act-2', 'kind': 'activity', 'number': 2, 'page': 128, 'section': 'أنشطة', 'title': 'تساوي شعاعين', 'verified': True,
    'parts': [
        {'label': 'أ)', 'text': 'لاحظ الشكل المقابل حيث ABC مثلث كيفي. 1) انقل هذا الشكل ثم أنشئ النقطة D بحيث يكون الرباعي ABCD متوازي أضلاع. 2) قارن بين الشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{DC}$ . واستنتج العلاقة بينهما. اذكر شعاعين آخرين متساويين في الشكل.',
         'figure': {'description': 'مثلث كيفي: A أعلى اليسار، B أعلى اليمين (أخفض قليلا)، C في الأسفل قرب B.', 'points': pts(A=A2, B=B2, C=C2), 'model': True}},
        {'label': 'ب)', 'page': 129, 'text': 'A، B، C، D، O نقط من المستقيم (d). (الشكل). 1) تحقق أن للقطعتين [BC] و [AD] نفس المنتصف O. استنتج العلاقة بين $\\overrightarrow{AB}$ و $\\overrightarrow{CD}$ ؟ 2) قارن بين الشعاعين $\\overrightarrow{AC}$ و $\\overrightarrow{DB}$ .',
         'figure': {'description': 'مستقيم (d) عليه بالترتيب من اليسار: C، A، O، D، B ؛ ترميز: CA = DB (علامة /) و AO = OD (علامة //).', 'abscissae': {k: int(v) for k, v in X.items()}},
         'reading': 'completed', 'readingNote': 'Début des lignes mangé par la marge droite (« ب) »، « تحقق »، « استنتج »، « 2) قارن ») : complété.'},
    ],
    'answer': {'a': {'D': 'D صورة C بالانسحاب الذي يحوّل B إلى A', 'AB=DC': True, 'other': '$\\overrightarrow{AD} = \\overrightarrow{BC}$'},
               'b': {'1': 'OB = OC و OA = OD (الترميز) فـ O منتصف [BC] و [AD] ؛ ABDC متوازي أضلاع «مسطّح»: $\\overrightarrow{AB} = \\overrightarrow{CD}$',
                     '2': '$\\overrightarrow{AC} = -\\overrightarrow{DB}$ : نفس المنحى ونفس الطول واتجاهان متعاكسان.'}},
    'answerSource': 'computed',
})
DISC.append({'elementId': 'act-2', 'kind': 'reading', 'resolution': 'completed — reading: completed on part ب)',
             'text': 'p. 129 : les premiers mots de chaque ligne (ب)، تحقق، استنتج، قارن) sont coupés par la marge droite du scan ; complétés d’après le sens et la mise en page de la p. 128.'})

# نشاط 3 : quadrillage (relevé : colonnes et lignes du quadrillage, y vers le haut).
A3, B3, C3, M3 = P(2, 8), P(1, 3), P(4, 1), P(8, 7)
M3a = tr(M3, vec(A3, B3)); M3b = tr(M3a, vec(B3, C3))
assert (M3a, M3b) == (P(7, 2), P(10, 0))
assert para(A3, M3, M3a, B3) and para(B3, M3a, M3b, C3) and para(A3, C3, M3b, M3)
assert tr(M3, vec(A3, C3)) == M3b and add(vec(A3, B3), vec(B3, C3)) == vec(A3, C3)
E.append({
    'id': 'act-3', 'kind': 'activity', 'number': 3, 'page': 129, 'section': 'أنشطة', 'title': 'مجموع شعاعين', 'verified': True,
    'parts': [
        {'label': '1)', 'text': 'انقل الشكل المقابل على ورقة مرصوفة حيث ABC مثلث و M نقطة من المستوي.'},
        {'label': '2)', 'text': "أنشئ النقطة M′ صورة M بالانسحاب الذي شعاعه $\\overrightarrow{AB}$ ."},
        {'label': '3)', 'text': "عيّن النقطة M″ صورة M′ بالانسحاب الذي شعاعه $\\overrightarrow{BC}$ ."},
        {'label': '4)', 'text': "ما هي طبيعة كل من الرباعيين AMM′B و BM′M″C؟"},
        {'label': '5)', 'text': "برهن أن الرباعي ACM″M متوازي أضلاع. ما هي صورة M بالانسحاب الذي شعاعه $\\overrightarrow{AC}$ ؟"},
        {'label': '6)', 'text': 'بتطبيق الانسحاب الذي شعاعه $\\overrightarrow{AB}$ متبوعا بالانسحاب الذي شعاعه $\\overrightarrow{BC}$ ؛ ما هو الانسحاب الذي نتحصل عليه؟',
         'after': 'الانسحاب الذي وجدته يسمح لنا بكتابة المساواة: $\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$ . هذه المساواة تسمى علاقة «شال».'},
        {'label': '7)', 'text': 'انقل وأتمم: «مجموع الشعاعين … و … يساوي الشعاع …»'},
    ],
    'figure': {'description': 'ورقة مرصوفة 11 × 9 مربعا؛ المثلث ABC (A في الأعلى، B أسفل اليسار، C في الأسفل) و M نقطة معزولة أعلى اليمين.',
               'points': pts(A=A3, B=B3, C=C3, M=M3), 'grid': {'unit': 1, 'xRange': [0, 11], 'yRange': [0, 9]},
               'reading': 'Relu à 300 dpi : A, B, M sur des nœuds ; C est 0,15 carreau à gauche de son nœud (trait épais), lu au nœud (4 ; 1).'},
    'answer': {"M'": [7, 2], "M''": [10, 0], '4': "AMM′B و BM′M″C متوازيا أضلاع ($\\overrightarrow{MM\'} = \\overrightarrow{AB}$ ، $\\overrightarrow{M\'M\'\'} = \\overrightarrow{BC}$)",
               '5': "$\\overrightarrow{MM\'\'} = \\overrightarrow{MM\'} + \\overrightarrow{M\'M\'\'} = \\overrightarrow{AB} + \\overrightarrow{BC}$ و $\\overrightarrow{MM\'\'} = \\overrightarrow{AC}$ (عدّ المربعات: 2 يمينا، 7 أسفل) ؛ صورة M هي M″",
               '6': 'الانسحاب الذي شعاعه $\\overrightarrow{AC}$', '7': 'مجموع الشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{BC}$ يساوي الشعاع $\\overrightarrow{AC}$'},
    'answerSource': 'computed',
})
A4, B4, C4 = P(0, 0), P(2, 3), P(5, 3)
D4 = tr(C4, vec(B4, A4))
assert add(vec(A4, B4), vec(A4, D4)) == vec(A4, C4) and add(vec(A4, B4), vec(B4, A4)) == (0, 0)
E.append({
    'id': 'act-4', 'kind': 'activity', 'number': 4, 'page': 129, 'section': 'أنشطة', 'title': 'إنشاء ممثل لمجموع شعاعين', 'verified': True,
    'intro': 'A، B، C ثلاث نقط ليست على استقامة واحدة. (الشكل)',
    'parts': [
        {'label': '1)', 'text': 'أنشئ ممثلا للشعاع $\\overrightarrow{AB} + \\overrightarrow{BC}$ .'},
        {'label': '2)', 'text': 'أنشئ النقطة D بحيث الرباعي ABCD متوازي أضلاع.'},
        {'label': '3)', 'text': 'أنشئ ممثلا للشعاع $\\overrightarrow{AB} + \\overrightarrow{AD}$ .'},
        {'label': '4)', 'text': 'عيّن ممثلا للشعاع $\\overrightarrow{AB} + \\overrightarrow{BA}$ ثم للشعاع $\\overrightarrow{BA} + \\overrightarrow{AB}$ .',
         'after': 'نقول أن كلا من الشعاعين $\\overrightarrow{AA}$ و $\\overrightarrow{BB}$ هو الشعاع المعدوم ونرمز له بالرمز $\\vec{0}$ .'},
        {'label': '5)', 'text': 'قارن بين الشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{BA}$ .',
         'after': 'نقول عن الشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{BA}$ أنهما متعاكسان ونكتب $\\overrightarrow{AB} = -\\overrightarrow{BA}$ .'},
    ],
    'figure': {'description': 'ثلاث نقط معزولة: A أسفل اليسار، B فوقها إلى اليمين، C على يمين B بنفس الارتفاع تقريبا.', 'points': pts(A=A4, B=B4, C=C4), 'model': True},
    'answer': {'1': '$\\overrightarrow{AC}$ (علاقة شال)', '2': 'D صورة C بالانسحاب الذي يحوّل B إلى A', '3': '$\\overrightarrow{AC}$ (قاعدة متوازي الأضلاع)',
               '4': '$\\overrightarrow{AA}$ ثم $\\overrightarrow{BB}$ : الشعاع المعدوم', '5': 'نفس المنحى ونفس الطول واتجاهان متعاكسان'},
    'answerSource': 'computed',
    'reading': 'completed', 'readingNote': 'Débuts de ligne coupés par la marge droite (1)، 2)، 3) أنشئ، 4) عيّن، نقول، 5) قارن) : complétés.',
})

# ── معارف (pp. 130, 132) ─────────────────────────────────────────────────────
U = (4, 6)
K1 = dict(A=P(2, 6), B=P(6, 12), E=P(3, 2), F=P(7, 8), C=P(9, 4), D=P(13, 10), M=P(14, 4), N=P(18, 10))
assert all(vec(K1[a], K1[b]) == U for a, b in ['AB', 'EF', 'CD', 'MN'])
K1b = dict(A=P(2, 0), B=P(8, 6), C=P(9, -1), D=P(15, 5))
assert vec(K1b['A'], K1b['B']) == vec(K1b['C'], K1b['D']) == (6, 6)
E.append({
    'id': 'know-1', 'kind': 'knowledge', 'number': 1, 'page': 130, 'section': 'معارف', 'title': 'الانسحاب ومفهوم الشعاع', 'verified': True,
    'blocks': [
        {'label': '1) المنحى والاتجاه', 'text': 'عندما يكون مستقيمان متوازيين، نقول إنّ لهذين المستقيمين نفس المنحى. للمستقيمين (d) و (d′) نفس المنحى معناه (d) // (d′). النقطتان المتمايزتان A و B تعيّنان على المستقيم (AB)، اتجاهين أحدهما من A نحو B والآخر من B نحو A.',
         'figure': 'مستقيمان متوازيان مائلان (d) و (d′) ؛ ثم قطعتان [AB] بسهم: «الاتجاه من A نحو B» (سهم نحو B) و «الاتجاه من B نحو A» (سهم نحو A).'},
        {'label': '2) الانسحاب ومفهوم الشعاع', 'text': 'A و B نقطتان متمايزتان. الانسحاب الذي يحوّل A إلى B يحوّل أيضا C إلى D، E إلى F و M إلى N. كل من الثنائيات (A ; B) ، (E ; F) ، (C ; D) ، (M ; N) ، تعرّف نفس الشعاع $\\vec{u}$ الذي: • منحاه هو منحى المستقيم (AB). • اتجاهه هو من A نحو B. • طويلته هي طول القطعة [AB]. يمكن أن نرمز لهذا الشعاع بالرمز $\\overrightarrow{AB}$ (مبدؤه A ونهايته B) أو $\\overrightarrow{CD}$ أو $\\overrightarrow{EF}$ أو $\\overrightarrow{MN}$ . نقول إنّ كل من $\\overrightarrow{AB}$ ، $\\overrightarrow{CD}$ ، $\\overrightarrow{EF}$ ، $\\overrightarrow{MN}$ ، … هو مُمثّل للشعاع $\\vec{u}$ .',
         'figure': {'description': 'ورقة مرصوفة: أربعة أسهم متوازية متساوية الطول مكتوب على كل منها $\\vec{u}$ : AB، EF (تحت AB وإلى يمينها)، CD، MN.', 'points': pts(**K1), 'vector': list(U),
                    'reading': 'Pointes de flèche en deçà des nœuds ; pas lu ≈ (4 ; 6) carreaux sur les 4 flèches (mesures 4,0 / 3,7 / 4,1 / 4,0 en x).'}},
        {'label': '3) تساوي شعاعين', 'text': 'القول عن شعاعين أنّهما متساويان يعني أنّ لهما نفس المنحى ونفس الاتجاه ونفس الطول.',
         'example': 'مثال: $\\overrightarrow{AB} = \\overrightarrow{CD}$ معناه: • للشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{CD}$ : نفس المنحى، نفس الاتجاه ونفس الطول. • الانسحاب الذي يحوّل A إلى B يحوّل أيضا C إلى D.',
         'figure': {'description': 'ورقة مرصوفة: سهمان متوازيان $\\overrightarrow{AB}$ و $\\overrightarrow{CD}$ بزاوية 45°.', 'points': pts(**K1b)}},
    ],
})
KA, KB, KC, KD = P(1, 2), P(5, 2), P(4, 0), P(0, 0)
assert vec(KA, KB) == vec(KD, KC) and mid(KA, KC) == mid(KB, KD) and vec(KA, KD) == vec(KB, KC)
LA, LB, LE, LD, LC = F(0), F(4), F(5), F(6), F(10)
assert LB - LA == LC - LD and (LA + LC) / 2 == (LB + LD) / 2 == LE
E.append({
    'id': 'know-2', 'kind': 'knowledge', 'number': 2, 'page': 130, 'section': 'معارف', 'title': 'الشعاعان المتساويان ومتوازي الأضلاع', 'verified': True,
    'property': 'خاصية: A، B، C، D أربع نقط بحيث كل ثلاثة منها ليست في استقامية. $\\overrightarrow{AB} = \\overrightarrow{DC}$ تعني أنّ الرباعي ABCD متوازي أضلاع.',
    'remarks': ['ملاحظات: من أجل كل أربع نقط A، B، C، D لدينا:',
                '• $\\overrightarrow{AB} = \\overrightarrow{DC}$ معناه للقطعتين [AC] و [BD] نفس المنتصف.',
                '• إذا كان $\\overrightarrow{AB} = \\overrightarrow{DC}$ فإن $\\overrightarrow{AD} = \\overrightarrow{BC}$ .'],
    'special': 'حالة خاصة: النقط A، B، C، D في استقامية.',
    'figures': {'parallelogram': {'description': 'متوازي أضلاع ABCD (A أعلى اليسار، B أعلى اليمين، C أسفل اليمين، D أسفل اليسار) ؛ السهمان $\\overrightarrow{AB}$ و $\\overrightarrow{DC}$ بالأحمر ؛ القطران مع ترميز المنتصف.', 'points': pts(A=KA, B=KB, C=KC, D=KD), 'model': True},
                'collinear': {'description': 'مستقيم عليه A، B، E، D، C ؛ السهمان $\\overrightarrow{AB}$ و $\\overrightarrow{DC}$ ؛ E منتصف [AC] و [BD] (غير مسمّاة في النص).', 'abscissae': {'A': 0, 'B': 4, 'E': 5, 'D': 6, 'C': 10}, 'model': True}},
    'note': 'Le dessin du « حالة خاصة » nomme un point E sans le citer : c’est le milieu commun de [AC] et [BD] (mesuré 347 px entre B 300 et D 395, milieu de A 90 – C 607).',
})
E.append({
    'id': 'know-3', 'kind': 'knowledge', 'number': 3, 'page': 132, 'section': 'معارف', 'title': 'الشعاعان المتساويان ومفهوم منتصف قطعة', 'verified': True,
    'property': 'خاصية: I، A، B ثلاث نقط. إذا كان I منتصف [AB] فإن $\\overrightarrow{AI} = \\overrightarrow{IB}$ . إذا كان $\\overrightarrow{AI} = \\overrightarrow{IB}$ فإن I منتصف [AB].',
    'example': 'على الشكل المقابل لدينا $\\overrightarrow{AI} = \\overrightarrow{IB}$ لأن للشعاعين $\\overrightarrow{AI}$ و $\\overrightarrow{IB}$ نفس المنحى ونفس الاتجاه و AI = IB إذن I منتصف [AB].',
    'figure': 'قطعة [AB] و I منتصفها، ترميز AI = IB (//).',
})
S1 = dict(A=P(0, 9), B=P(7, 19), C=P(20, 15), M=P(0, 0))
S1['M_'] = tr(S1['M'], vec(S1['A'], S1['B'])); S1['M__'] = tr(S1['M_'], vec(S1['B'], S1['C']))
assert vec(S1['M'], S1['M__']) == vec(S1['A'], S1['C'])
E.append({
    'id': 'know-4', 'kind': 'knowledge', 'number': 4, 'page': 132, 'section': 'معارف', 'title': 'مجموع شعاعين', 'verified': True,
    'blocks': [
        {'label': '1) صورة نقطة بانسحابين متتابعين', 'text': "A، B، C ثلاث نقط. إذا كانت صورة نقطة كيفية M بالانسحاب الذي شعاعه $\\overrightarrow{AB}$ هي M′ و صورة M′ بالانسحاب الذي شعاعه $\\overrightarrow{BC}$ هي M″ فإن: M″ هي صورة M بالانسحاب الذي شعاعه $\\overrightarrow{AC}$ . ونقول $\\overrightarrow{AC}$ هو مجموع الشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{BC}$ .",
         'figure': {'description': "ورقة مرصوفة (مربعات كبيرة مقسمة): المثلث ABC بأسهم حمراء $\\overrightarrow{AB}$ ، $\\overrightarrow{BC}$ و $\\overrightarrow{AC}$ ؛ تحته M و M′ و M″ بنفس الشكل (M تحت A على نفس الخط الشاقولي).",
                    'points': pts(**S1), 'model': True, 'reading': 'Grille fine bombée : coordonnées en petits carreaux approximatives (même disposition) ; la plateforme peut changer les nombres, la relation M ↦ M″ = translation de vecteur AC reste vraie (assert).'}},
        {'label': '2) مجموع شعاعين', 'text': 'A، B، C ثلاث نقط. مجموع الشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{BC}$ هو الشعاع $\\overrightarrow{AC}$ . نكتب $\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$ . المساواة $\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$ تسمى علاقة شـال (لاحظ أن نهاية الشعاع $\\overrightarrow{AB}$ هو مبدأ الشعاع $\\overrightarrow{BC}$).',
         'figure': 'مثلث ABC: الأسهم $\\overrightarrow{AB}$ (صاعد)، $\\overrightarrow{BC}$ (نازل) و $\\overrightarrow{AC}$ (أحمر، أفقي).'},
        {'label': 'حالة خاصة', 'text': '• إذا كانت A منطبقة على B، نقول أن $\\overrightarrow{AB}$ هو الشعاع المعدوم ويرمز إليه بـ $\\vec{0}$ . لدينا $\\overrightarrow{AA} = \\overrightarrow{BB} = \\vec{0}$ .'},
    ],
})
E.append({
    'id': 'know-5', 'kind': 'knowledge', 'number': 5, 'page': 132, 'section': 'معارف', 'title': 'الشعاعان المتعاكسان', 'verified': True,
    'text': 'A، B نقطتان. نعلم أنّ $\\overrightarrow{BA} + \\overrightarrow{AB} = \\vec{0}$ . نقول أن الشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{BA}$ متعاكسان، ونكتب $\\overrightarrow{BA} = -\\overrightarrow{AB}$ . للشعاعين المتعاكسين نفس الطول، ونفس المنحى واتجاهين متعاكسين.',
    'example': 'مثال: الشعاعان $\\vec{u}$ و $\\vec{v}$ متعاكسان. $\\vec{v} = -\\vec{u}$',
    'figure': {'description': 'ورقة مرصوفة: $\\vec{u}$ سهم أفقي نحو اليمين طوله 6 مربعات صغيرة، $\\vec{v}$ تحته سهم أفقي نحو اليسار بنفس الطول.', 'u': [6, 0], 'v': [-6, 0]},
})
R6 = dict(A=P(0, 0), B=P(9, 0), C=P(2, 3))
R6['D'] = tr(R6['B'], vec(R6['A'], R6['C']))
assert add(vec(R6['A'], R6['B']), vec(R6['A'], R6['C'])) == vec(R6['A'], R6['D']) and para(R6['A'], R6['B'], R6['D'], R6['C'])
assert mid(R6['B'], R6['C']) == mid(R6['A'], R6['D'])
E.append({
    'id': 'know-6', 'kind': 'knowledge', 'number': 6, 'page': 132, 'section': 'معارف', 'title': 'قاعدة متوازي الأضلاع', 'verified': True,
    'property': 'A، B و C ثلاث نقط ليست على استقامية. $\\overrightarrow{AB} + \\overrightarrow{AC} = \\overrightarrow{AD}$ معناه ABDC متوازي أضلاع.',
    'remark': 'ملاحظة: D هي نظيرة A بالنسبة إلى منتصف القطر [BC].',
    'figures': {'rule': {'description': 'A أسفل اليسار، B على اليمين، C فوق A قليلا إلى اليمين ؛ السهمان $\\overrightarrow{AB}$ و $\\overrightarrow{AC}$ ، الضلعان المتقطعان [CD] و [BD] ، السهم الأحمر $\\overrightarrow{AD}$ مكتوب عليه $\\overrightarrow{AB} + \\overrightarrow{AC}$ .', 'points': pts(**R6), 'model': True},
                'remark': 'المثلث ABC، I منتصف [BC] و D نظيرة A بالنسبة إلى I (ترميز ///، //).'},
})

# ── طرائق (p. 131) ───────────────────────────────────────────────────────────
mA, mB, mC = P(0, 3), P(1, 0), P(4, 2)
mD = tr(mC, vec(mA, mB)); mI = mid(mB, mC)
assert para(mA, mC, mD, mB) and sym(mA, mI) == mD and vec(mA, mC) == vec(mB, mD)
mE = tr(mB, neg(vec(mA, mC)))      # EB = AC
assert vec(mE, mB) == vec(mA, mC) == vec(mB, mD) and mid(mD, mE) == mB
E.append({
    'id': 'method-image', 'kind': 'method', 'page': 131, 'section': 'طرائق', 'title': 'إنشاء صورة نقطة بانسحاب عُلم شعاعه', 'verified': True,
    'exercise': 'تمرين: 1) أنشئ مثلثا ABC ثم النقطة D صورة C بالانسحاب الذي شعاعه $\\overrightarrow{AB}$ . 2) أنشئ النقطة E حيث $\\overrightarrow{EB} = \\overrightarrow{AC}$ .',
    'solution': ['1) ننشئ مثلثا ABC (انظر الشكل المقابل).',
                 'D هي صورة C بالانسحاب الذي شعاعه $\\overrightarrow{AB}$ يعني $\\overrightarrow{CD} = \\overrightarrow{AB}$ . إذن الرباعي ACDB متوازي أضلاع.',
                 'قطرا الرباعي ACDB هما [AD] و [BC].',
                 'ينتج أن D هي نظيرة A بالنسبة إلى النقطة I منتصف [BC].',
                 '2) على الشكل لدينا $\\overrightarrow{AC} = \\overrightarrow{BD}$ إذن $\\overrightarrow{EB} = \\overrightarrow{AC}$ أي $\\overrightarrow{EB} = \\overrightarrow{BD}$ .',
                 'نلاحظ أن للشعاعين $\\overrightarrow{BD}$ و $\\overrightarrow{EB}$ نفس المنحى وهو منحى (BD)، نفس الطول وهو BD و نفس الاتجاه.',
                 'بالتالي B هي منتصف [DE] أي النقطة E هي نظيرة D بالنسبة إلى B (ومنه إنشاء E).',
                 'ينتج أن الانسحاب الذي يحول D إلى B هو الانسحاب الذي يحول B إلى E.'],
    'figure': {'description': 'A في الأعلى، B تحتها، C على اليمين، D أسفل اليمين ؛ متوازي الأضلاع ACDB بقطريه [AD] و [BC] متقاطعين في I ؛ E على امتداد [DB] من جهة B (BE = BD، ترميز).', 'points': pts(A=mA, B=mB, C=mC, D=mD, I=mI, E=mE), 'model': True},
    'note': '« ACDB » est le même quadrilatère que ABDC parcouru dans l’autre sens ($\\overrightarrow{CD} = \\overrightarrow{AB}$ ⇔ ABDC parallélogramme, connaissance 2).',
})
eO, eA, eB = P(0, 0), P(4, 0), P(2, 3)
eC = sym(eO, eA); eD = tr(eA, vec(eB, eA))
assert mid(eO, eC) == eA == mid(eB, eD) and vec(eO, eD) == vec(eB, eC)
E.append({
    'id': 'method-equal', 'kind': 'method', 'page': 131, 'section': 'طرائق', 'title': 'إثبات تساوي شعاعين', 'verified': True,
    'exercise': 'تمرين: OAB مثلث كيفي. نسمي C نظيرة O بالنسبة إلى النقطة A و D النقطة حيث $\\overrightarrow{AD} = \\overrightarrow{BA}$ . برهن أن $\\overrightarrow{OD} = \\overrightarrow{BC}$ .',
    'solution': ['A هي منتصف [OC] ومنتصف [BD] لأن C هي نظيرة O بالنسبة إلى A و $\\overrightarrow{AD} = \\overrightarrow{BA}$ .',
                 'وبالتالي الانسحاب الذي يحول B إلى C هو نفسه الذي يحوّل O إلى D.',
                 'إذن $\\overrightarrow{OD} = \\overrightarrow{BC}$ .'],
    'rule': 'طريقة: لإثبات تساوي شعاعين نعتمد على متوازي أضلاع أو على الانسحاب.',
    'figure': {'description': 'O على اليسار، A في الوسط، C على اليمين على استقامة (ترميز OA = AC: |||) ؛ B في الأعلى، D في الأسفل على استقامة مع A (ترميز BA = AD: //) ؛ [OD] و [BC] بالبرتقالي.', 'points': pts(O=eO, A=eA, B=eB, C=eC, D=eD), 'model': True},
})
nF, nH, nG = P(0, 0), P(3, 1), P(1, 3)
nE = tr(nH, vec(nF, nH)); nK = tr(nH, neg(vec(nH, nG)))
assert vec(nF, nH) == vec(nH, nE) and vec(nK, nH) == vec(nH, nG) and cross(vec(nE, nG), vec(nF, nK)) == 0 and vec(nE, nG) == vec(nK, nF)
E.append({
    'id': 'now-131', 'kind': 'now', 'page': 131, 'section': 'دوري الآن', 'verified': True,
    'items': [{'number': 1, 'text': 'أنشئ مثلثا FHG. أنشئ النقطة E حيث $\\overrightarrow{FH} = \\overrightarrow{HE}$ والنقطة K حيث $\\overrightarrow{KH} = \\overrightarrow{HG}$ . أثبت أن (EG) و (FK) متوازيان.',
               'answer': {'proof': 'H منتصف [FE] و [KG] فالرباعي FGEK متوازي أضلاع (قطراه [FE] و [GK] لهما نفس المنتصف) ومنه $\\overrightarrow{GE} = \\overrightarrow{FK}$ : (EG) // (FK).'}}],
    'answerSource': 'computed',
})

# ── طرائق (p. 133) ───────────────────────────────────────────────────────────
sB, sA, sD, sC = P(0, 0), P(6, 1), P(8, -3), P(4, -3)
sM = tr(sC, vec(sA, sB)); sI = mid(sB, sC); sE = tr(sB, vec(sA, sD))
assert para(sA, sB, sM, sC) and sym(sA, sI) == sM and add(vec(sA, sB), vec(sA, sD)) == vec(sA, sE)
E.append({
    'id': 'method-sum', 'kind': 'method', 'page': 133, 'section': 'طرائق', 'title': 'إنشاء ممثل لمجموع شعاعين', 'verified': True,
    'exercise': 'تمرين: 1) لاحظ الشكل المقابل ثم انقله. أنشئ النقطة M حيث $\\overrightarrow{CM} = \\overrightarrow{AB}$ . 2) أنشئ النقطة N حيث $\\overrightarrow{AN} = \\overrightarrow{AB} + \\overrightarrow{AD}$ .',
    'solution': ['حل: 1) $\\overrightarrow{CM} = \\overrightarrow{AB}$ يعني الرباعي ABMC متوازي أضلاع أي [AM] و [BC] لهما نفس المنتصف.',
                 'و بالتالي M هي نظيرة A بالنسبة إلى I منتصف [BC] (الشكل).',
                 '2) لإنشاء $\\overrightarrow{AB} + \\overrightarrow{AD}$ نعيّن شعاعا مبدؤه B ويساوي $\\overrightarrow{AD}$ وليكن $\\overrightarrow{BE}$ .',
                 'أي $\\overrightarrow{BE} = \\overrightarrow{AD}$ ومنه $\\overrightarrow{AB} + \\overrightarrow{AD} = \\overrightarrow{AB} + \\overrightarrow{BE} = \\overrightarrow{AE}$ (حسب علاقة شال).',
                 'ينتج أن $\\overrightarrow{AN} = \\overrightarrow{AE}$ أي N تنطبق على E.'],
    'rule': 'طريقة: لإنشاء ممثل لمجموع شعاعين يمكن استعمال علاقة شال أو قاعدة متوازي الأضلاع.',
    'figure': {'description': 'رباعي ABDC: B أعلى اليسار، A أعلى اليمين، D أسفل اليمين، C أسفل الوسط ؛ في الحل: M أسفل اليسار (نظيرة A بالنسبة إلى I منتصف [BC])، E (= N) في الأسفل، J منتصف [AE] و [BD].',
               'points': pts(A=sA, B=sB, C=sC, D=sD, M=sM, I=sI, E=sE, J=mid(sA, sE)), 'model': True},
})
pA_, pB_, pC_ = P(1, 2), P(0, 0), P(5, 0)
pI = mid(pB_, pC_); pD_ = sym(pA_, pI)
assert vec(pA_, pI) == vec(pI, pD_) and vec(pA_, pB_) == vec(pC_, pD_) and para(pA_, pB_, pD_, pC_)
E.append({
    'id': 'method-proof', 'kind': 'method', 'page': 133, 'section': 'طرائق', 'title': 'استعمال تساوي شعاعين لإنجاز برهان', 'verified': True,
    'exercise': 'تمرين: ABC مثلث، I منتصف [BC] و D نقطة حيث $\\overrightarrow{AI} = \\overrightarrow{ID}$ . برهن أن $\\overrightarrow{AB} = \\overrightarrow{CD}$ .',
    'solution': ['حل: نبرهن أن $\\overrightarrow{AB} = \\overrightarrow{CD}$ .',
                 '$\\overrightarrow{AB} = \\overrightarrow{CD}$ يعني الرباعي ABDC متوازي أضلاع.',
                 '$\\overrightarrow{AI} = \\overrightarrow{ID}$ يعني أن I منتصف القطعة [AD]، علما أن I منتصف [BC].',
                 'إذن في الرباعي ABDC القطران [AD] و [BC] لهما نفس المنتصف I.',
                 'و بالتالي الرباعي ABDC متوازي أضلاع. ينتج أن $\\overrightarrow{AB} = \\overrightarrow{CD}$ .'],
    'rule': 'طريقة: لإثبات أن شعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{CD}$ متساويان، يكفي إثبات أن الرباعي ABDC متوازي أضلاع.',
    'figure': {'description': 'متوازي أضلاع ABDC: A أعلى اليسار، C أعلى اليمين، B أسفل اليسار، D أسفل اليمين ؛ القطران [AD] و [BC] يتقاطعان في I (ترميز).', 'points': pts(A=pA_, B=pB_, C=pC_, D=pD_, I=pI), 'model': True},
})
qA, qB, qC = P(0, 0), P(4, 0), P(1, 3)
qD = tr(qC, vec(qA, qB)); qE = sym(qA, qC)
assert para(qA, qB, qD, qC) and vec(qB, qC) == vec(qD, qE)
rA, rB, rC, rD = P(0, 0), P(5, 0), P(5, 3), P(0, 3)
r1 = tr(rA, add(vec(rA, rB), vec(rB, rD))); r2 = tr(rD, add(vec(rD, rA), vec(rD, rB))); r3 = tr(rA, add(vec(rA, rC), vec(rB, rC)))
assert r1 == rD and r2 == sym(rC, rB) and r3 == P(5, 6)
E.append({
    'id': 'now-133', 'kind': 'now', 'page': 133, 'section': 'دوري الآن', 'verified': True,
    'items': [
        {'number': 1, 'text': 'ABDC متوازي أضلاع. E نظيرة A بالنسبة إلى C. برهن أن $\\overrightarrow{BC} = \\overrightarrow{DE}$ .',
         'answer': {'proof': 'ABDC متوازي أضلاع: $\\overrightarrow{AC} = \\overrightarrow{BD}$ ؛ C منتصف [AE]: $\\overrightarrow{AC} = \\overrightarrow{CE}$ . إذن $\\overrightarrow{BD} = \\overrightarrow{CE}$ فـ BDEC متوازي أضلاع ومنه $\\overrightarrow{BC} = \\overrightarrow{DE}$ .'}},
        {'number': 2, 'text': 'ABCD مستطيل. أ) أنشئ ممثلا لكل شعاع من الشعاعين التاليين: $\\overrightarrow{AB} + \\overrightarrow{BD}$ ، $\\overrightarrow{DA} + \\overrightarrow{DB}$ . ب) أنشئ الممثل الذي مبدؤه A للشعاع $\\overrightarrow{AC} + \\overrightarrow{BC}$',
         'answer': {'a1': '$\\overrightarrow{AD}$ (شال)', 'a2': '$\\overrightarrow{DE}$ حيث E نظيرة C بالنسبة إلى B (قاعدة متوازي الأضلاع: DAEB متوازي أضلاع)',
                    'b': '$\\overrightarrow{AF}$ حيث $\\overrightarrow{CF} = \\overrightarrow{BC}$ (F نظيرة B بالنسبة إلى C)'}},
    ],
    'answerSource': 'computed',
})
assert r3 == sym(rB, rC)

# ── أوظّف تعلّماتي (pp. 134–135) ─────────────────────────────────────────────
def ex(n, page, section, text, answer, figure=None, **kw):
    e = {'id': f'ex-{n}', 'kind': 'exercise', 'number': n, 'page': page, 'section': section, 'verified': True, 'text': text}
    if figure:
        e['figure'] = figure
    e['answer'] = answer
    e['answerSource'] = 'computed'
    e.update(kw)
    E.append(e)


S_1 = 'الأشعة والمساواة الشعاعية'
xA, xB, xC = P(0, 0), P(5, 0), P(7, 4)
uu = vec(xA, xB); lenAC = n2(vec(xA, xC))
ex(1, 134, S_1, 'ABC مثلث كيفي. $\\vec{u}$ هو الشعاع الذي منحاه هو منحى المستقيم (AB)، اتجاهه من A إلى B وطوله AC. 1) انقل الشكل التالي: 2) أنشئ الشعاعين $\\overrightarrow{BE}$ و $\\overrightarrow{GC}$ الممثلين للشعاع $\\vec{u}$ .',
   {'u': 'منحى (AB)، اتجاه من A نحو B، طويلته AC (لا AB)', 'E': 'على نصف المستقيم [AB) بعد B حيث BE = AC', 'G': 'على الموازي لـ (AB) المار بـ C، من جهة A، حيث GC = AC (G قبل C في اتجاه $\\vec{u}$)'},
   figure={'description': 'مثلث: A أسفل اليسار، B أسفل الوسط، C أعلى اليمين ؛ AC أطول من AB.', 'points': pts(A=xA, B=xB, C=xC), 'model': True},
   note='G n’est pas défini ailleurs : « $\\overrightarrow{GC}$ représentant de $\\vec{u}$ » le définit (extrémité C donnée, origine G à construire).')
G2 = dict(A=P(1, -2), B=P(5, -2), E=P(7, -3), C=P(2, -5), D=P(6, -5), F=P(8, -6))
assert vec(G2['A'], G2['C']) == vec(G2['B'], G2['D']) == (1, -3) and vec(G2['A'], G2['E']) == vec(G2['C'], G2['F']) == (6, -1)
ex(2, 134, S_1, 'لاحظ الشكل. هل المساواة $\\overrightarrow{AC} = \\overrightarrow{BD}$ صحيحة؟ هل المساواة $\\overrightarrow{AE} = \\overrightarrow{CF}$ صحيحة؟',
   {'AC=BD': True, 'AE=CF': True, 'why': 'عدّ المربعات: $\\overrightarrow{AC}$ و $\\overrightarrow{BD}$ : 1 يمينا، 3 أسفل ؛ $\\overrightarrow{AE}$ و $\\overrightarrow{CF}$ : 6 يمينا، 1 أسفل (ABDC و ACFE متوازيا أضلاع).'},
   figure={'description': 'ورقة مرصوفة 10 × 7 ؛ النقط على عُقد الرصف (العمود من اليسار، السطر من الأعلى بالسالب).', 'points': pts(**G2), 'grid': {'unit': 1, 'xRange': [0, 10], 'yRange': [-7, 0]}})
tA, tB, tC = P(0, 0), P(1, 4), P(5, 1)
tK = mid(tB, tC); tK2 = tr(tK, vec(tA, tK))
assert tK2 == sym(tA, tK)
ex(3, 134, S_1, 'ABC مثلث كيفي. K هي منتصف [BC]. 1) أنشئ ممثلين للشعاع $\\overrightarrow{AB}$ . 2) أنشئ الممثل الذي مبدؤه K للشعاع $\\overrightarrow{AK}$ .',
   {'1': 'مثلا $\\overrightarrow{CX}$ حيث ABXC متوازي أضلاع، و $\\overrightarrow{KY}$ حيث ABYK متوازي أضلاع', '2': '$\\overrightarrow{KA\'}$ حيث A′ نظيرة A بالنسبة إلى K (A′ هي أيضا الرأس الرابع لمتوازي الأضلاع ABA′C)'})
T4 = dict(O=P(3, 5), A=P(0, 4), M=P(2, 4), N=P(4, 4), B=P(6, 4), C=P(0, 3), P=P(2, 3), Q=P(4, 3), D=P(6, 3),
          E=P(0, 2), R=P(2, 2), S=P(4, 2), F=P(6, 2), H=P(2, 0), K=P(4, 0))
assert tr(T4['R'], vec(T4['E'], T4['M'])) == T4['N']
SP_EQ = [x for x in equal_to(vec(T4['S'], T4['P']), T4) if x != 'SP']
CM_EQ = [x for x in equal_to(vec(T4['C'], T4['M']), T4) if x != 'CM']
assert SP_EQ == ['DN', 'FQ', 'PA', 'QM', 'RC'], SP_EQ
assert CM_EQ == ['EP', 'PN', 'QB', 'RQ', 'SD'], CM_EQ
ex(4, 134, S_1, 'لاحظ الشكل التالي. 1) عيّن صورة R بالانسحاب الذي شعاعه $\\overrightarrow{EM}$ . 2) اذكر 3 أشعة مساوية للشعاع $\\overrightarrow{SP}$ . 3) اذكر 6 أشعة مساوية للشعاع $\\overrightarrow{CM}$ .',
   {'1': 'N', '2': ['$\\overrightarrow{' + x + '}$' for x in SP_EQ], '3': ['$\\overrightarrow{' + x + '}$' for x in CM_EQ],
    'note3': 'خمسة أشعة فقط بين النقط المسمّاة ؛ السادس يتطلب نقطة غير مسمّاة (مثلا نقطة الرصف (4 ; 1) صورة H).'},
   figure={'description': 'شجرة (صنوبرة) على ورقة مرصوفة (مربعات كبيرة مقسمة إلى 5): القمة O ؛ الفروع AM و NB، CP و QD، ER و SF أفقية ؛ المائلات OA، OB، MC، ND، PE، QF ؛ الجذع [RH]، [HK]، [KS].',
           'points': pts(**T4), 'grid': {'unit': 'مربع كبير', 'xRange': [0, 6], 'yRange': [0, 5]},
           'segments': ['OA', 'OB', 'AM', 'NB', 'MC', 'ND', 'CP', 'QD', 'PE', 'QF', 'ER', 'SF', 'RH', 'HK', 'KS']},
   reading='Relu à 300 dpi : tous les points sur les nœuds des GRANDS carreaux (O au-dessus de la colonne médiane).')
DISC.append({'elementId': 'ex-4', 'kind': 'inconsistency', 'resolution': 'kept — lessons ask for 5 (or name the 6th as the grid point (4 ; 1) image of H)',
             'text': '« اذكر 6 أشعة مساوية للشعاع CM » : entre points nommés il n’en existe que 5 (EP, PN, RQ, SD, QB), vérifié par énumération exhaustive. La plateforme demande 5, ou accepte H→(nœud non nommé).'})
hA, hB, hC = P(0, 0), P(4, 1), P(5, 5)
hD = tr(hA, vec(hB, hC))
assert n2(vec(hA, hB)) == n2(vec(hB, hC)) == 17 and para(hA, hB, hC, hD)
hM = tr(hC, vec(hA, hB)); hN = tr(hC, vec(hB, hC))
assert mid(hB, hN) == hC == mid(hD, hM) and n2(vec(hB, hN)) == n2(vec(hD, hM)) and para(hB, hM, hN, hD)
assert sorted(x for x in equal_to(vec(hN, hC), dict(A=hA, B=hB, C=hC, D=hD, M=hM, N=hN)) if x != 'NC') == ['CB', 'DA']
ex(5, 134, S_1, 'ABCD معين. 1) أنشئ النقطة M حيث $\\overrightarrow{CM} = \\overrightarrow{AB}$ و النقطة N حيث $\\overrightarrow{CN} = \\overrightarrow{BC}$ . 2) ما هي طبيعة الرباعي BMND؟ 3) اذكر شعاعين مساويين للشعاع $\\overrightarrow{NC}$ .',
   {'2': 'مستطيل: C منتصف [DM] و [BN] (متوازي أضلاع) و DM = 2DC = 2BC = BN (القطران متقايسان)', '3': ['$\\overrightarrow{CB}$', '$\\overrightarrow{DA}$']},
   note='Vérifié sur le losange modèle A(0;0), B(4;1), C(5;5), D(1;4) (côté √17).')

S_2 = 'الأشعة ومتوازي الأضلاع'
oO, oA, oB = P(0, 0), P(4, 1), P(1, 3)
oM = tr(oO, vec(oA, oO)); oN = tr(oA, vec(oB, oM))
assert para(oB, oM, oN, oA)
ex(6, 134, S_2, 'OAB مثلث. 1) أنشئ النقطة M صورة O بالانسحاب الذي شعاعه $\\overrightarrow{AO}$ . 2) أنشئ النقطة N صورة A بالانسحاب الذي شعاعه $\\overrightarrow{BM}$ . 3) ما هي طبيعة الرباعي BMNA؟',
   {'1': 'M نظيرة A بالنسبة إلى O', '2': '$\\overrightarrow{AN} = \\overrightarrow{BM}$', '3': 'BMNA متوازي أضلاع ($\\overrightarrow{BM} = \\overrightarrow{AN}$)'})
dA, dB, dD = P(0, 3), P(5, 3), P(3, 0)
dC = tr(dD, vec(dA, dB)); dE = tr(dD, vec(dB, dA))
assert para(dA, dB, dC, dD) and para(dA, dB, dD, dE) and vec(dD, dE) == neg(vec(dA, dB)) and vec(dE, dA) == vec(dD, dB)
ex(7, 134, S_2, '1) انقل المثلث ABD (كما في الشكل). 2) أنشئ النقطة C حيث ABCD متوازي أضلاع. 3) أنشئ النقطة E حيث ABDE متوازي أضلاع. 4) ماذا تقول عن الشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{DE}$ ؟ 5) قارن بين الشعاعين $\\overrightarrow{EA}$ و $\\overrightarrow{DB}$ ؟',
   {'4': 'متعاكسان: $\\overrightarrow{DE} = -\\overrightarrow{AB}$ (و $\\overrightarrow{DC} = \\overrightarrow{AB}$ : D منتصف [EC])', '5': '$\\overrightarrow{EA} = \\overrightarrow{DB}$'},
   figure={'description': 'مثلث ABD: A أعلى اليسار، B أعلى اليمين، D في الأسفل تحت B تقريبا.', 'points': pts(A=dA, B=dB, D=dD), 'model': True})
R8 = dict(A=P(0, 2), B=P(0, 0), C=P(4, 0), D=P(4, 2))
R8.update(E=mid(R8['A'], R8['D']), F=mid(R8['B'], R8['C']), G=mid(R8['A'], R8['B']), H=mid(R8['D'], R8['C']), O=mid(R8['A'], R8['C']))
GE_EQ = [x for x in equal_to(vec(R8['G'], R8['E']), R8) if x != 'GE']
assert GE_EQ == ['BO', 'FH', 'OD'], GE_EQ
assert vec(R8['G'], R8['F']) == vec(R8['O'], R8['C']) == mul(F(1, 2), vec(R8['A'], R8['C']))
ex(8, 134, S_2, 'لاحظ الشكل أدناه. 1) اذكر 4 أشعة مساوية للشعاع $\\overrightarrow{GE}$ . 2) برهن بطريقتين أن المستقيمين (GF) و (AC) متوازيان.',
   {'1': ['$\\overrightarrow{BO}$', '$\\overrightarrow{OD}$', '$\\overrightarrow{FH}$'],
    'note1': 'ثلاثة أشعة فقط بين النقط المسمّاة (تحقق شامل).',
    '2': ['$\\overrightarrow{GF} = \\overrightarrow{OC}$ (أو $= \\overrightarrow{AO}$) فـ GFCO متوازي أضلاع ومنه (GF) // (OC) = (AC).', 'خاصية مستقيم المنتصفين في المثلث ABC: G منتصف [AB] و F منتصف [BC].']},
   figure={'description': 'مستطيل ABCD (A أعلى اليسار، D أعلى اليمين، B أسفل اليسار، C أسفل اليمين، زوايا قائمة مرمّزة) ؛ E و F منتصفا [AD] و [BC]، G و H منتصفا [AB] و [DC] (ترميز) ؛ O المركز ؛ القطع: القطران [AC] و [BD]، [EF]، [GH]، والمعين GEHF.',
           'points': pts(**R8), 'segments': ['AC', 'BD', 'EF', 'GH', 'GE', 'EH', 'HF', 'FG']})
DISC.append({'elementId': 'ex-8', 'kind': 'inconsistency', 'resolution': 'kept — lessons ask for 3 vectors',
             'text': '« اذكر 4 أشعة مساوية للشعاع GE » : seuls BO, OD, FH existent entre points nommés (énumération exhaustive, vraie pour tout rectangle). Le manuel compte peut-être GE lui-même.'})
nA, nB, nC, nD = P(0, 4), P(6, 4), P(6, 0), P(0, 0)
nF_ = P(4, -3); nE_ = tr(nF_, vec(nC, nD))
assert para(nC, nD, nE_, nF_) and vec(nA, nB) == vec(nE_, nF_) and para(nA, nB, nF_, nE_)
ex(9, 134, S_2, 'ABCD مستطيل و CDEF متوازي أضلاع (الشكل). برهن أن الرباعي ABFE متوازي أضلاع.',
   {'proof': 'ABCD مستطيل: $\\overrightarrow{AB} = \\overrightarrow{DC}$ ؛ CDEF متوازي أضلاع: $\\overrightarrow{DC} = \\overrightarrow{EF}$ . إذن $\\overrightarrow{AB} = \\overrightarrow{EF}$ فالرباعي ABFE متوازي أضلاع.'},
   figure={'description': 'مستطيل ABCD ملوّن (A أعلى اليسار، B أعلى اليمين، C أسفل اليمين، D أسفل اليسار) ؛ تحته متوازي الأضلاع CDEF (E أسفل اليسار، F أسفل الوسط).', 'points': pts(A=nA, B=nB, C=nC, D=nD, E=nE_, F=nF_), 'model': True})

S_3 = 'مجموع شعاعين - علاقة شال'
T10 = dict(A=P(0, 0), B=P(-1, -1), C=P(1, -1), E=P(-2, 0), F=P(2, 0), D=P(0, -2))   # base (1/2 ; √3/2) : linéaire, égalités exactes
v = lambda a, b: vec(T10[a], T10[b])
assert add(v('E', 'A'), v('E', 'B')) == v('E', 'C')
assert add(v('B', 'A'), v('A', 'F')) == v('B', 'F')
assert add(v('B', 'A'), v('C', 'A')) == v('D', 'A')
assert add(v('E', 'A'), v('F', 'A')) == (0, 0)
assert tr(T10['C'], add(v('B', 'C'), v('C', 'A'))) == T10['F']
X10 = tr(T10['E'], add(v('A', 'B'), v('A', 'C')))
assert X10 not in T10.values() and add(v('A', 'B'), v('A', 'C')) == v('A', 'D')
assert tr(T10['A'], add(v('B', 'D'), v('C', 'D'))) == T10['D']
ex(10, 135, S_3, 'ABC ، BCD ، AFC و EAB هي مثلثات متقايسة الأضلاع. 1) عيّن في كل حالة مما يلي ممثلا للشعاع: $\\overrightarrow{EA} + \\overrightarrow{EB}$ ، $\\overrightarrow{BA} + \\overrightarrow{AF}$ ، $\\overrightarrow{BA} + \\overrightarrow{CA}$ و $\\overrightarrow{EA} + \\overrightarrow{FA}$ . 2) أنشئ الممثل الذي مبدؤه C للشعاع $\\overrightarrow{BC} + \\overrightarrow{CA}$ . 3) أنشئ الممثل الذي مبدؤه E للشعاع $\\overrightarrow{AB} + \\overrightarrow{AC}$ . 4) أنشئ الممثل الذي مبدؤه A للشعاع $\\overrightarrow{BD} + \\overrightarrow{CD}$ .',
   {'1': ['$\\overrightarrow{EC}$ (EACB معين)', '$\\overrightarrow{BF}$ (شال)', '$\\overrightarrow{DA}$', '$\\vec{0}$ (A منتصف [EF])'],
    '2': '$\\overrightarrow{CF}$ ($= \\overrightarrow{BA}$)', '3': '$\\overrightarrow{EX}$ حيث $\\overrightarrow{EX} = \\overrightarrow{AD}$ (X نقطة جديدة: صورة E بالانسحاب الذي يحوّل A إلى D)', '4': '$\\overrightarrow{AD}$'},
   figure={'description': 'مثلث متقايس الأضلاع كبير EFD (E أعلى اليسار، F أعلى اليمين، D في الأسفل) و A، B، C منتصفات [EF]، [ED]، [FD] ؛ القطع [AB]، [BC]، [CA] ترسم أربعة مثلثات متقايسة الأضلاع.',
           'points': {'A': [0, 0], 'B': [-1, '-√3'], 'C': [1, '-√3'], 'E': [-2, 0], 'F': [2, 0], 'D': [0, '-2√3']},
           'pointsNote': 'Coordonnées réelles pour un côté 2. Les asserts du script travaillent dans la base (1/2 ; √3/2) — linéaire, donc les égalités de vecteurs sont exactes.'})
pa_, pb_, pd_ = P(0, 0), P(-2, 3), P(4, 0)
pc_ = tr(pb_, vec(pa_, pd_)); pN = sym(pb_, pc_); pM = sym(pa_, pd_)
assert para(pa_, pb_, pc_, pd_)
assert tr(tr(pb_, vec(pc_, pd_)), vec(pa_, pM)) == pM
assert tr(tr(pN, vec(pM, pa_)), vec(pb_, pc_)) == pc_
ex(11, 135, S_3, 'ABCD متوازي أضلاع (الشكل). نسمي N نظيرة B بالنسبة إلى C و M نظيرة A بالنسبة إلى D. 1) ماهي صورة B بالانسحاب الذي شعاعه $\\overrightarrow{CD}$ متبوعًا بالانسحاب الذي شعاعه $\\overrightarrow{AM}$ ؟ 2) ماهي صورة N بالانسحاب الذي شعاعه $\\overrightarrow{MA}$ متبوعًا بالانسحاب الذي شعاعه $\\overrightarrow{BC}$ ؟',
   {'1': 'M ($\\overrightarrow{CD} + \\overrightarrow{AM} = \\overrightarrow{BA} + \\overrightarrow{AM} = \\overrightarrow{BM}$)', '2': 'C ($\\overrightarrow{MA} + \\overrightarrow{BC} = \\overrightarrow{NC}$ لأن $\\overrightarrow{MA} = 2\\overrightarrow{DA} = 2\\overrightarrow{CB} = \\overrightarrow{NB}$ ؛ $\\overrightarrow{NB} + \\overrightarrow{BC} = \\overrightarrow{NC}$)'},
   figure={'description': 'متوازي أضلاع: A أسفل الوسط، D أسفل اليمين، B أعلى اليسار، C أعلى الوسط-اليمين (الضلعان [BC] و [AD] أفقيان).', 'points': pts(A=pa_, B=pb_, C=pc_, D=pd_), 'model': True})
cO, cOp = P(0, 0), P(4, 0)
cB = mid(cO, cOp); cM = P(F(6, 5), F(8, 5)); cN = tr(cOp, neg(vec(cO, cM)))   # M sur le cercle (O ; 2); cN = tr(cOp, neg(vec(cO, cM)))
assert n2(vec(cO, cM)) == 4 == n2(vec(cOp, cN)) and n2(vec(cO, cB)) == 4
assert vec(cM, cOp) == vec(cO, cN) and vec(cM, cB) == vec(cB, cN) and add(vec(cB, cM), vec(cB, cN)) == (0, 0)
ex(12, 135, S_3, 'لاحظ الشكل أدناه. 1) برهن أن $\\overrightarrow{MO\'} = \\overrightarrow{ON}$ . 2) هل MB = BN ؟ هل $\\overrightarrow{MB} = \\overrightarrow{BN}$ ؟ لماذا؟ 3) عيّن $\\overrightarrow{BM} + \\overrightarrow{BN}$ .',
   {'1': 'OM = O′N (ترميز) و $\\widehat{MOO\'} = \\widehat{NO\'O}$ (زاويتان متبادلتان) فـ (OM) // (O′N) والشعاعان $\\overrightarrow{OM}$ و $\\overrightarrow{NO\'}$ متساويان: OMO′N متوازي أضلاع ومنه $\\overrightarrow{MO\'} = \\overrightarrow{ON}$',
    '2': 'نعم و نعم: B منتصف [OO′] (الدائرتان متقايستان ومتماستان في B) فهي منتصف القطر الآخر [MN] لمتوازي الأضلاع OMO′N.', '3': '$\\vec{0}$'},
   figure={'description': 'دائرتان متقايستان مركزاهما O و O′ متماستان خارجيا في B ([OO′] أفقي) ؛ M على الدائرة الأولى (أعلى)، N على الثانية (أسفل) ؛ OM = O′N (ترميز //) والزاويتان $\\widehat{MOB}$ و $\\widehat{NO\'B}$ مرمّزتان متقايستين.',
           'points': pts(O=cO, O_=cOp, B=cB, M=cM, N=cN), 'radius': 2, 'model': True})
gA, gB, gC = P(6, 6), P(0, 0), P(9, -3)
gA1, gB1, gC1 = mid(gB, gC), mid(gA, gC), mid(gA, gB)
gG = ((gA[0] + gB[0] + gC[0]) / 3, (gA[1] + gB[1] + gC[1]) / 3)
assert add(vec(gA, gA1), vec(gA1, gB)) == vec(gA, gB) and add(vec(gB, gB1), vec(gC, gB)) == vec(gC, gB1)
assert add(vec(gA, gC), vec(gA, gA)) == vec(gA, gC)
assert add(vec(gA, gC1), vec(gA, gB1)) == vec(gA, gA1)
assert add(vec(gG, gA), vec(gG, gC)) == vec(gB, gG) and add(vec(gB, gG), vec(gC, gG)) == vec(gG, gA)
g3 = tr(gG, add(vec(gA, gB), vec(gA, gC)))
assert vec(gG, g3) == mul(2, vec(gA, gA1))
ex(13, 135, S_3, 'ABC مثلث مركز ثقله G. 1) بسّط الكتابات التالية: $\\overrightarrow{AA\'} + \\overrightarrow{A\'B}$ ، $\\overrightarrow{BB\'} + \\overrightarrow{CB}$ و $\\overrightarrow{AC} + \\overrightarrow{AA}$ . 2) عيّن في كل حالة مما يلي ممثلا للشعاع: $\\overrightarrow{AC\'} + \\overrightarrow{AB\'}$ ، $\\overrightarrow{GA} + \\overrightarrow{GC}$ و $\\overrightarrow{BG} + \\overrightarrow{CG}$ . 3) أنشئ الممثل الذي مبدؤه G للشعاع $\\overrightarrow{AB} + \\overrightarrow{AC}$ .',
   {'1': ['$\\overrightarrow{AB}$', "$\\overrightarrow{CB'}$", '$\\overrightarrow{AC}$ ($\\overrightarrow{AA} = \\vec{0}$)'],
    '2': ["$\\overrightarrow{AA'}$ (AC′A′B′ متوازي أضلاع)", "$\\overrightarrow{BG}$ ($= 2\\overrightarrow{GB'}$ : GAKC متوازي أضلاع مركزه B′)", "$\\overrightarrow{GA}$ ($\\overrightarrow{BG} + \\overrightarrow{CG} = 2\\overrightarrow{A'G} = \\overrightarrow{GA}$)"],
    '3': "$\\overrightarrow{GX}$ حيث $\\overrightarrow{GX} = 2\\overrightarrow{AA'}$ (نظيرة A بالنسبة إلى A′ مُزاحة إلى G)"},
   figure={'description': "مثلث ABC (A في الأعلى، B على اليسار، C أسفل اليمين) ؛ A′، B′، C′ منتصفات [BC]، [AC]، [AB] ؛ المتوسطات [AA′]، [BB′]، [CC′] تتقاطع في G.", 'points': pts(A=gA, B=gB, C=gC, A_=gA1, B_=gB1, C_=gC1, G=gG), 'model': True},
   note='A′, B′, C′ ne sont pas définis dans le texte : le dessin les place aux milieux des côtés (médianes concourantes en G).')
DISC.append({'elementId': 'ex-13', 'kind': 'misprint', 'resolution': 'kept — the platform asks it as printed (AA = 0 is a legitimate check of the zero vector)',
             'text': '« $\\overrightarrow{AC} + \\overrightarrow{AA}$ » : lu à 300 dpi sans prime ni lettre manquante ; trivial ($\\overrightarrow{AA} = \\vec{0}$), probablement une coquille pour une somme avec prime (ex. $\\overrightarrow{AC\'} + \\overrightarrow{C\'A\'}$) ; gardé tel quel, la réponse est $\\overrightarrow{AC}$ .'})
DISC.append({'elementId': 'ex-13', 'kind': 'reading', 'resolution': 'decided — A′, B′, C′ midpoints (from the figure)',
             'text': 'A′, B′, C′ utilisés sans définition ; la figure les met aux milieux de [BC], [AC], [AB].'})
kA, kB, kC = P(0, 0), P(4, 0), P(1, 3)
kD = tr(kB, add(vec(kA, kB), vec(kA, kC))); kE = tr(kC, add(vec(kB, kC), vec(kC, kA))); kF = tr(kB, add(vec(kB, kA), vec(kA, kC)))
assert kE == tr(kC, vec(kB, kA)) and kF == kC and kD == P(9, 3)
ex(14, 135, S_3, 'ABC مثلث كيفي. 1) أنشئ النقطة D حيث $\\overrightarrow{BD} = \\overrightarrow{AB} + \\overrightarrow{AC}$ . 2) أنشئ النقطة E حيث $\\overrightarrow{CE} = \\overrightarrow{BC} + \\overrightarrow{CA}$ . 3) أنشئ النقطة F حيث $\\overrightarrow{BF} = \\overrightarrow{BA} + \\overrightarrow{AC}$ .',
   {'1': 'D صورة B بالانسحاب الذي شعاعه $\\overrightarrow{AX}$ حيث ABXC متوازي أضلاع', '2': '$\\overrightarrow{CE} = \\overrightarrow{BA}$ (شال): E صورة C بالانسحاب الذي يحوّل B إلى A', '3': '$\\overrightarrow{BF} = \\overrightarrow{BC}$ (شال): F تنطبق على C'})
fA, fB, fC, fD = P(0, 0), P(7, 5), P(9, 5), P(12, 3)
assert add(vec(fD, fC), vec(fA, fD)) == vec(fA, fC) and add(vec(fB, fC), vec(fA, fB)) == vec(fA, fC)
fS = tr(fB, vec(fC, fD))
assert add(vec(fA, fB), vec(fC, fD)) == vec(fA, fS)
ex(15, 135, S_3, 'يعطى الشعاعان $\\overrightarrow{AB}$ و $\\overrightarrow{CD}$ : 1) أنشئ ممثلا للشعاع $\\overrightarrow{DC} + \\overrightarrow{AD}$ . 2) أنشئ ممثلا للشعاع $\\overrightarrow{BC} + \\overrightarrow{AB}$ . 3) أنشئ بطريقتين شعاعا يساوي $\\overrightarrow{AB} + \\overrightarrow{CD}$ .',
   {'1': '$\\overrightarrow{AC}$ ($\\overrightarrow{AD} + \\overrightarrow{DC}$)', '2': '$\\overrightarrow{AC}$ ($\\overrightarrow{AB} + \\overrightarrow{BC}$)',
    '3': ['شال: $\\overrightarrow{BS} = \\overrightarrow{CD}$ ثم $\\overrightarrow{AB} + \\overrightarrow{BS} = \\overrightarrow{AS}$', 'متوازي الأضلاع: $\\overrightarrow{AT} = \\overrightarrow{CD}$ ثم الرأس الرابع S لمتوازي الأضلاع ABST']},
   figure={'description': 'سهم طويل $\\overrightarrow{AB}$ (A أسفل اليسار، B أعلى الوسط) وسهم قصير $\\overrightarrow{CD}$ (C على يمين B قليلا، D أسفل يمين C).', 'points': pts(A=fA, B=fB, C=fC, D=fD), 'model': True})
jA, jB, jC = P(0, 0), P(1, 3), P(6, 0)
jE = mid(jA, jC); jD = sym(jB, jE)
assert para(jA, jB, jC, jD) and tr(jA, add(vec(jA, jB), vec(jA, jD))) == jC and tr(jB, add(vec(jB, jA), vec(jB, jC))) == jD
ex(16, 135, S_3, 'A، B، C، D، E نقط حيث $\\overrightarrow{AE} = \\overrightarrow{EC}$ و $\\overrightarrow{BE} = \\overrightarrow{ED}$ و B لا تنتمي إلى (AC). 1) أنجز شكلا مناسبا. 2) ماهو نوع الرباعي ABCD؟ اشرح. 3) عيّن F حيث $\\overrightarrow{AF} = \\overrightarrow{AB} + \\overrightarrow{AD}$ و K حيث $\\overrightarrow{BK} = \\overrightarrow{BA} + \\overrightarrow{BC}$ .',
   {'2': 'متوازي أضلاع: E منتصف قطريه [AC] و [BD] (و B ∉ (AC) فهو غير مسطّح)', '3': 'F تنطبق على C و K تنطبق على D (قاعدة متوازي الأضلاع)'})

# ── أؤكّد تعلّماتي (p. 136) ───────────────────────────────────────────────────
Q1 = dict(M=P(4, 5), N=P(0, 5), A=P(2, 4), C=P(6, 4), D=P(6, 0), G=P(-1, 1), H=P(3, 1), E=P(0, 0), F=P(4, 0))
assert vec(Q1['G'], Q1['H']) == vec(Q1['A'], Q1['C']) == vec(Q1['E'], Q1['F']) and vec(Q1['M'], Q1['N']) == neg(vec(Q1['G'], Q1['H']))
Q3 = dict(A=P(7, 4), B=P(1, 4), C=P(0, 2), D=P(6, 2), E=P(9, 4), H=P(9, 0), G=P(5, 0))
assert vec(Q3['A'], Q3['B']) == neg(vec(Q3['C'], Q3['D'])) and vec(Q3['A'], Q3['B']) != neg(vec(Q3['G'], Q3['H'])) and cross(vec(Q3['G'], Q3['H']), vec(Q3['E'], Q3['H'])) != 0
qa, qb, qc = P(0, 3), P(0, 0), P(4, 3)
assert vec(qa, tr(qb, vec(qa, qc))) == add(vec(qa, qb), vec(qa, qc))
assert n2(add((F(4), F(0)), (F(0), F(3)))) == 25
assert vec(P(0, 0), P(2, 0)) == vec(P(-2, 0), P(0, 0))      # AB = CA ⇔ A milieu de [BC]
E.append({
    'id': 'qcm', 'kind': 'qcm', 'page': 136, 'section': 'أؤكّد تعلّماتي', 'verified': True,
    'instruction': 'في كل حالة مما يلي اختر الإجابة أو الإجابات الصحيحة، وبرّر اختيارك.',
    'items': [
        {'number': 1, 'text': 'على الشكل المقابل الشعاعان اللذان لهما نفس المنحى ونفس الاتجاه ونفس الطول هما…',
         'figure': {'description': 'ورقة مرصوفة: $\\overrightarrow{MN}$ أفقي نحو اليسار ؛ تحته $\\overrightarrow{AC}$ أفقي نحو اليمين و $\\overrightarrow{AD}$ مائل نحو الأسفل ؛ $\\overrightarrow{GH}$ و $\\overrightarrow{EF}$ أفقيان نحو اليمين ؛ الأسهم الأفقية الأربعة بنفس الطول.', 'points': pts(**Q1), 'model': True,
                    'reading': 'completed', 'readingNote': 'L’étiquette de l’extrémité de la flèche horizontale issue de A est masquée par le texte de la colonne ; lue « C » d’après l’option (2) « $\\overrightarrow{GH}$ و $\\overrightarrow{AC}$ ».'},
         'options': ['$\\overrightarrow{MN}$ و $\\overrightarrow{GH}$', '$\\overrightarrow{AC}$ و $\\overrightarrow{GH}$', '$\\overrightarrow{GH}$ و $\\overrightarrow{EF}$'], 'correct': [1, 2], 'pages': '130'},
        {'number': 2, 'text': 'إذا كانت النقطة T هي صورة S بالانسحاب الذي شعاعه $\\overrightarrow{AB}$ فإن…',
         'options': ['$\\overrightarrow{TS} = \\overrightarrow{AB}$', '$\\overrightarrow{TS} = \\overrightarrow{BA}$', '$\\overrightarrow{ST} = \\overrightarrow{AB}$'], 'correct': [1, 2], 'pages': '130 و 131'},
        {'number': 3, 'text': 'في الشكل المقابل لدينا…',
         'figure': {'description': '$\\overrightarrow{AB}$ أفقي نحو اليسار، $\\overrightarrow{CD}$ أفقي نحو اليمين بنفس الطول تحته ؛ $\\overrightarrow{EH}$ شاقولي نحو الأسفل ؛ $\\overrightarrow{GH}$ أفقي نحو اليمين أقصر.', 'points': pts(**Q3), 'model': True},
         'options': ['الشعاعان $\\overrightarrow{AB}$ و $\\overrightarrow{CD}$ متعاكسان', 'الشعاعان $\\overrightarrow{AB}$ و $\\overrightarrow{GH}$ متعاكسان', 'الشعاعان $\\overrightarrow{GH}$ و $\\overrightarrow{EH}$ متعاكسان'], 'correct': [0], 'pages': '130'},
        {'number': 4, 'text': 'A، B، C ثلاث نقط. ممثل الشعاع $\\overrightarrow{AB} + \\overrightarrow{AC}$ هو …',
         'options': [{'label': 'الشعاع $\\overrightarrow{CB}$', 'figure': 'A أعلى اليسار، C أعلى اليمين، سهم من C إلى B (B في الأسفل).'},
                     {'label': 'الشعاع $\\overrightarrow{BC}$', 'figure': 'A أعلى اليسار، سهم من B (أسفل) إلى C (أعلى اليمين).'},
                     {'label': 'الشعاع $\\overrightarrow{AE}$', 'figure': 'A أعلى اليسار، C أعلى اليمين، B أسفل اليسار، سهم من A إلى E (أسفل اليمين): ABEC متوازي أضلاع.'}],
         'correct': [2], 'pages': '132 و 133'},
        {'number': 5, 'text': 'ABC مثلث قائم في A حيث AB = 4 و AC = 3 . طول الشعاع $\\overrightarrow{AB} + \\overrightarrow{AC}$ هو..',
         'options': ['7', '$\\sqrt{7}$', '5'], 'correct': [2], 'pages': '132',
         'justification': '$\\overrightarrow{AB} + \\overrightarrow{AC} = \\overrightarrow{AD}$ قطر المستطيل ABDC: $AD = BC = \\sqrt{4^2 + 3^2} = 5$'},
        {'number': 6, 'text': 'A، B، C ثلاث نقط حيث $\\overrightarrow{AB} = \\overrightarrow{CA}$ . إذن',
         'options': ['B و C متناظرتان بالنسبة إلى A', 'A و B متناظرتان بالنسبة إلى C', 'A و C متناظرتان بالنسبة إلى B'], 'correct': [0], 'pages': '131 و 132'},
        {'number': 7, 'text': 'الشعاع $\\overrightarrow{MN} + \\overrightarrow{NP}$ يساوي الشعاع',
         'options': ['$\\vec{0}$', '$\\overrightarrow{MP}$', '$\\overrightarrow{PM}$'], 'correct': [1], 'pages': '132'},
    ],
    'note': 'Le tableau imprime les colonnes (1) (2) (3) de droite à gauche ; les options sont rangées ici dans l’ordre (1), (2), (3) (index 0, 1, 2). Les items 1 et 2 ont DEUX bonnes réponses (« الإجابة أو الإجابات »).',
})

# ── أدمج تعلّماتي (p. 136) ───────────────────────────────────────────────────
# Illustration de la plateforme (le manuel ne donne aucun nombre) : bords y = 0 (N) et y = 2 (M), passage ⟂.
SA, SB = P(-3, 5), P(4, -3)
NMv = (F(0), F(2))
SB1 = tr(SB, NMv)
t = (SA[1] - 2) / (SA[1] - SB1[1])
SM = (SA[0] + t * (SB1[0] - SA[0]), F(2)); SN = (SM[0], F(0))
assert SM == P(F(1, 2), 2) and para(SM, SB1, SB, SN)


def path(x):
    return math.hypot(x - float(SA[0]), float(SA[1]) - 2) + 2 + math.hypot(float(SB[0]) - x, float(SB[1]))


best = path(float(SM[0]))
assert abs(best - (math.sqrt(85) + 2)) < 1e-12
assert all(path(x / 100) >= best - 1e-12 for x in range(-1000, 1000))
E.append({
    'id': 'situation', 'kind': 'situation', 'page': 136, 'section': 'أدمج تعلّماتي', 'verified': True, 'title': 'وضعية',
    'text': 'تجنُّبا لحوادث المرور الأليمة، قرّرت إحدى البلديات وضع ممر الراجلين بين حافتين متوازيتين للطريق وهذا لأجل مساعدة أطفال الحي للتنقل إلى المدرسة بأمان. حدّد موقع الممر بحيث يكون طول المسلك من A إلى B مرورا بالموضعين M و N أقصر ما يمكن.',
    'figure': {'description': 'طريق (شريط أزرق) بين حافتين أفقيتين متوازيتين وخط متقطع في الوسط ؛ A (الحي) فوق الحافة العليا على اليسار، B (المدرسة) تحت الحافة السفلى على اليمين ؛ ممر الراجلين (شريط مخطط) عمودي على الحافتين من M (على الحافة العليا) إلى N (على الحافة السفلى) ؛ المسلك A→M→N→B. تسميات: (الحي)، (المدرسة)، (الممر)، (الطريق).',
               'points': pts(A=SA, B=SB, M=SM, N=SN), 'banks': {'top': 2, 'bottom': 0}, 'model': True},
    'analysis': {
        'قراءة الوضعية وفهمها': ['نُعبّر على طول المسلك بـ: AM + MN + NB ما هي النقط الثابتة و النقط المتغيّرة؟'],
        'تحليل الوضعية واختيار استراتيجية حل': ['إنجاز شكل هندسي لتمثيل الوضعية. ما هو أقصر مسافة بين مستقيمين متوازيين؟',
                                                'في حالة نقطتين متمايزتين A و B′ ما هو الشرط الذي تحقّقه النّقطة M حتى تكون AM + MB′ أقصر ما يمكن.',
                                                'التفكير في استبدال المسلك المطلوب بمسلك له نفس الطول.'],
        'تنفيذ استراتيجية الحل المختارة': ['تعيين B′ صورة B بالإنسحاب الذي شعاعه $\\overrightarrow{NM}$ . دراسة الشكل الرباعي MB′BN.',
                                          'ما هو موقع النقطة M حتى يكون AM + MB′ أقصر ما يمكن؟ ما هو موقع النقطة N؟'],
    },
    'answer': {
        'fixed': 'A و B ثابتتان، وكذلك الطول MN (عرض الطريق، لأن الممر عمودي على الحافتين) ؛ M و N متغيّرتان.',
        'translation': '$\\overrightarrow{BB\'} = \\overrightarrow{NM}$ فالرباعي MB′BN متوازي أضلاع و NB = MB′ ؛ إذن AM + MN + NB = (AM + MB′) + MN.',
        'M': 'MN ثابت، فالمسلك أقصر ما يمكن عندما تكون AM + MB′ أصغر ما يمكن أي عندما تكون M على القطعة [AB′] : M نقطة تقاطع [AB′] مع الحافة العليا.',
        'N': 'N المسقط العمودي للنقطة M على الحافة السفلى (أي صورة M بالانسحاب الذي شعاعه $\\overrightarrow{MN}$).',
        'illustration': {'note': 'أعداد من المنصّة (الكتاب لا يعطي أعدادا): الحافتان y = 0 و y = 2 ، A(−3 ; 5) ، B(4 ; −3).',
                         "B'": [4, -1], 'M': ['1/2', 2], 'N': ['1/2', 0], 'minLength': '$\\sqrt{85} + 2$'},
    },
    'answerSource': 'computed',
})

# ── أتعمّق (p. 137) ──────────────────────────────────────────────────────────
S_5 = 'أتعمّق'
JA, JB, JC = P(0, 0), P(6, 0), P(8, 4)
JD = tr(JC, vec(JB, JA)); JJ = mid(JA, JC)
JO = tr(JJ, add(vec(JJ, JA), vec(JJ, JB))); JM = tr(JJ, add(vec(JJ, JC), vec(JJ, JD)))
assert mid(JO, JM) == JJ and vec(JJ, JO) == vec(JD, JA) == vec(JC, JB)
ex(17, 137, S_5, 'النقطة J هي تقاطع قطري متوازي الأضلاع ABCD. 1) أنشئ النقطتين O و M بحيث يكون $\\overrightarrow{JO} = \\overrightarrow{JA} + \\overrightarrow{JB}$ و $\\overrightarrow{JM} = \\overrightarrow{JC} + \\overrightarrow{JD}$ . 2) بيّن أن J منتصف [OM]. 3) بيّن أن $\\overrightarrow{JO} = \\overrightarrow{DA} = \\overrightarrow{CB}$ .',
   {'2': '$\\overrightarrow{JC} = -\\overrightarrow{JA}$ و $\\overrightarrow{JD} = -\\overrightarrow{JB}$ فـ $\\overrightarrow{JM} = -\\overrightarrow{JO}$', '3': '$\\overrightarrow{JA} + \\overrightarrow{JB} = \\overrightarrow{DJ} + \\overrightarrow{JA} = \\overrightarrow{DA}$ (شال) و $\\overrightarrow{DA} = \\overrightarrow{CB}$'})
HA, HB, HC = P(0, 0), P(6, 0), P(2, 4)
HO = mid(HA, HC); HD = sym(HB, HO)
HH = tr(HB, vec(HA, HO)); HL = tr(HC, vec(HO, HC)); HK = tr(HC, add(vec(HA, HB), vec(HA, HO)))
assert vec(HH, HK) == vec(HO, HL) == vec(HA, HC) and para(HO, HH, HK, HL)
HG = ((HO[0] + HK[0] + HL[0]) / 3, (HO[1] + HK[1] + HL[1]) / 3)
assert cross(vec(HC, HK), vec(HC, HG)) == 0 and cross(vec(HL, HH), vec(HL, HG)) == 0
assert HC == mid(HO, HL) and mid(HO, HK) == mid(HH, HL)
ex(18, 137, S_5, 'ABC مثلث كيفي، النقطة O هي منتصف [AC] و D نظيرة B بالنسبة إلى O. 1) أنشئ النقط H، K و L حيث $\\overrightarrow{BH} = \\overrightarrow{AO}$ ، $\\overrightarrow{CL} = \\overrightarrow{OC}$ و $\\overrightarrow{CK} = \\overrightarrow{AB} + \\overrightarrow{AO}$ . 2) برهن أن $\\overrightarrow{HK} = \\overrightarrow{OL} = \\overrightarrow{AC}$ . 3) ما هي طبيعة الرباعي OHKL. 4) المستقيمان (CK) و (LH) متقاطعان في النقطة G. برهن أن G مركز ثقل المثلث OKL.',
   {'2': '$\\overrightarrow{OL} = \\overrightarrow{OC} + \\overrightarrow{CL} = 2\\overrightarrow{OC} = \\overrightarrow{AC}$ ؛ $\\overrightarrow{HK} = \\overrightarrow{HB} + \\overrightarrow{BC} + \\overrightarrow{CK} = \\overrightarrow{OA} + \\overrightarrow{BC} + \\overrightarrow{AB} + \\overrightarrow{AO} = \\overrightarrow{AC}$',
    '3': 'متوازي أضلاع ($\\overrightarrow{OL} = \\overrightarrow{HK}$)', '4': 'C منتصف [OL] فـ (KC) متوسط في OKL ؛ (LH) يمر بمنتصف [OK] (مركز متوازي الأضلاع OHKL) فهو متوسط ثانٍ: G نقطة تقاطع متوسطين.'},
   figure={'description': 'ABCD متوازي أضلاع (A أسفل اليسار، B أسفل اليمين، C أعلى الوسط، D أعلى اليسار) ؛ القطر [AC] و O منتصفه.', 'points': pts(A=HA, B=HB, C=HC, D=HD, O=HO), 'model': True})
eF, eE, eG = P(0, 0), P(0, 4), P(4, 0)
eD_ = tr(eF, vec(eE, eF)); eC_ = tr(eE, vec(eG, eD_))
sq = [eE, eG, eD_, eC_]
sides = [n2(vec(sq[i], sq[(i + 1) % 4])) for i in range(4)]
assert len(set(sides)) == 1 and vec(eE, eG)[0] * vec(eG, eD_)[0] + vec(eE, eG)[1] * vec(eG, eD_)[1] == 0 and para(*sq)
assert sides[0] == 32
assert add(vec(eE, eF), vec(eE, eC_), vec(eF, eG)) == vec(eE, eD_)
ex(19, 137, S_5, 'من امتحان شهادة التعليم المتوسط. 1) أنشئ مثلثا EFG قائما في F حيث EF = FG = 4cm . 2) أنشئ النقطتين: D صورة النقطة F بالإنسحاب الذي شعاعه $\\overrightarrow{EF}$ و C صورة النقطة E بالإنسحاب الذي شعاعه $\\overrightarrow{GD}$ . 3) بيّن أنّ الرباعي EGDC مربع. - احسب مساحته. 4) ليكن الشعاع $\\vec{U}$ حيث $\\vec{U} = \\overrightarrow{EF} + \\overrightarrow{EC} + \\overrightarrow{FG}$ ، بيّن أنّ $\\vec{U} = \\overrightarrow{ED}$ .',
   {'3': 'F منتصف [ED] و [GC] ($\\overrightarrow{EF} = \\overrightarrow{FD}$ ، $\\overrightarrow{EC} = \\overrightarrow{GD}$) ؛ القطران متقايسان (8cm) ومتعامدان: EGDC مربع', 'area': '$\\dfrac{8 \\times 8}{2} = 32$ cm² (ضلعه $4\\sqrt{2}$)',
    '4': '$\\overrightarrow{EF} + \\overrightarrow{FG} = \\overrightarrow{EG}$ ثم $\\overrightarrow{EG} + \\overrightarrow{EC} = \\overrightarrow{ED}$ (قاعدة متوازي الأضلاع في المربع EGDC)'})
zA, zB, zD = P(0, 6), P(0, 0), P(2, 3)
zE = sym(zA, zD); zF = sym(zB, zD); zC = tr(zD, vec(zA, zB))
assert para(zA, zB, zE, zF) and para(zA, zB, zC, zD) and vec(zB, zC) == vec(zD, zE)
assert add(vec(zC, zE), vec(zF, zE)) == vec(zA, zD)
assert vec(zB, zE) == add(vec(zD, zE), vec(zC, zE))      # M = E
ex(20, 137, S_5, 'لاحظ في الشكل التالي متوازي أضلاع ABEF مركزه D و متوازي أضلاع ABCD. 1) بيّن أن $\\overrightarrow{BC} = \\overrightarrow{DE}$ . 2) بسّط الكتابة $\\overrightarrow{CE} + \\overrightarrow{FE}$ . 3) أنشئ النقطة M حيث $\\overrightarrow{BM} = \\overrightarrow{DM} + \\overrightarrow{CM}$ .',
   {'1': '$\\overrightarrow{BC} = \\overrightarrow{AD}$ (ABCD) و $\\overrightarrow{AD} = \\overrightarrow{DE}$ (D منتصف [AE])', '2': '$\\overrightarrow{CE} = \\overrightarrow{BD}$ (BCED متوازي أضلاع) و $\\overrightarrow{FE} = \\overrightarrow{AB}$ : المجموع $\\overrightarrow{AB} + \\overrightarrow{BD} = \\overrightarrow{AD}$',
    '3': 'M تنطبق على E ($\\overrightarrow{BM} - \\overrightarrow{DM} = \\overrightarrow{BD}$ فـ $\\overrightarrow{CM} = \\overrightarrow{BD}$ ، و $\\overrightarrow{CE} = \\overrightarrow{BD}$)'},
   figure={'description': 'A أعلى اليسار، B أسفل اليسار ([AB] شاقولي)، F أعلى اليمين، E يمين الوسط ([FE] شاقولي) ؛ القطران [AE] (متصل) و [BF] (متقطع) يتقاطعان في D ؛ C تحت D ([DC] شاقولي) و [BC] مائل.', 'points': pts(A=zA, B=zB, C=zC, D=zD, E=zE, F=zF)})
wA, wB, wK = P(0, 0), P(6, 0), P(2, 4)
wL = mid(wA, wB); wD = tr(wB, vec(wL, wK)); wE = tr(wL, add(vec(wL, wA), vec(wL, wK)))
assert para(wB, wL, wK, wD)
assert mid(wE, wD) == wK and mid(wE, wD) != wL
wD_alt = tr(wB, vec(wK, wL))
assert mid(wE, wD_alt) == wL                      # avec BKLD (et non BLKD), L serait bien le milieu
ex(21, 137, S_5, 'A، B، K ثلاث نقط ليست في استقامية. نسمّي L منتصف [AB]. D النقطة التي من أجلها يكون الرباعي BLKD متوازي أضلاع و E النقطة المعرّفة كالآتي: $\\overrightarrow{LE} = \\overrightarrow{LA} + \\overrightarrow{LK}$ . أثبت أنّ L منتصف [ED].',
   {'asPrinted': 'خاطئة كما طُبعت: $\\overrightarrow{KD} = \\overrightarrow{LB}$ و $\\overrightarrow{KE} = \\overrightarrow{LA} = -\\overrightarrow{LB}$ فـ K هي منتصف [ED] (لا L).',
    'corrected': 'أثبت أنّ K منتصف [ED]', 'proof': 'BLKD متوازي أضلاع: $\\overrightarrow{KD} = \\overrightarrow{LB}$ ؛ LAEK متوازي أضلاع (قاعدة متوازي الأضلاع): $\\overrightarrow{KE} = \\overrightarrow{LA}$ ؛ L منتصف [AB]: $\\overrightarrow{LA} = -\\overrightarrow{LB}$ ، إذن $\\overrightarrow{KE} = -\\overrightarrow{KD}$ .'},
   correction={'decidedBy': 'platform', 'decidedOn': '2026-10-04', 'printed': 'أثبت أنّ L منتصف [ED]', 'corrected': 'أثبت أنّ K منتصف [ED]',
               'note': 'Avec les définitions imprimées (BLKD, LE = LA + LK), le milieu de [ED] est K (assert). Les autres lectures qui sauveraient « L » (parallélogramme BKLD, ou LE = LA + KL) changent deux données au lieu d’une ; on corrige la conclusion.'})
DISC.append({'elementId': 'ex-21', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
             'text': '« أثبت أنّ L منتصف [ED] » est FAUX avec les données imprimées : D = B + LK et E = A + LK, donc le milieu de [ED] est L + LK = K. Correction : « K منتصف [ED] » (alternative documentée : BKLD au lieu de BLKD rendrait L juste).'})
QA, QB, QC, QD = P(0, 3), P(2, 0), P(8, 0), P(4, 5)
QM, QN, QP, QQ = mid(QD, QA), mid(QA, QB), mid(QB, QC), mid(QC, QD)
assert add(vec(QA, QD), vec(QB, QC)) == add(vec(QA, QC), vec(QB, QD)) and para(QM, QN, QP, QQ)
ex(22, 137, S_5, 'ABCD رباعي و M، N، P، Q هي على الترتيب، منتصفات [DA]، [AB]، [BC]، [CD]. 1) بيّن أن $\\overrightarrow{AD} + \\overrightarrow{BC} = \\overrightarrow{AC} + \\overrightarrow{BD}$ . 2) برهن أن الرباعي MNPQ متوازي أضلاع.',
   {'1': '$\\overrightarrow{AD} + \\overrightarrow{BC} = \\overrightarrow{AC} + \\overrightarrow{CD} + \\overrightarrow{BD} + \\overrightarrow{DC} = \\overrightarrow{AC} + \\overrightarrow{BD}$', '2': '$\\overrightarrow{MN} = \\dfrac{1}{2}\\overrightarrow{DB} = \\overrightarrow{QP}$ (مستقيم المنتصفين في DAB و CDB)'},
   figure={'description': 'رباعي كيفي ABCD: A على اليسار، D في الأعلى، C على اليمين، B في الأسفل ؛ M على [AD]، N على [AB]، P على [BC]، Q على [DC].', 'points': pts(A=QA, B=QB, C=QC, D=QD, M=QM, N=QN, P=QP, Q=QQ), 'model': True},
   note='« MN = ½ DB » sort du programme vectoriel de 4AM (pas de produit par un réel) : la preuve attendue est le théorème des milieux (vu en 3AM/4AM) ou la caractérisation par milieux des diagonales.')
yA, yB, yC, yM = P(2, 5), P(0, 0), P(6, 0), P(5, 5)
yK = tr(yM, add(vec(yM, yA), vec(yB, yC))); yL = tr(yM, add(vec(yM, yB), vec(yC, yA)))
assert mid(yK, yL) == yA
ex(23, 137, S_5, 'M نقطة خارج مثلث ABC. 1) أنشئ النقطتين K و L حيث $\\overrightarrow{MK} = \\overrightarrow{MA} + \\overrightarrow{BC}$ و $\\overrightarrow{ML} = \\overrightarrow{MB} + \\overrightarrow{CA}$ . 2) بيّن أن A منتصف [KL].',
   {'1': '$\\overrightarrow{AK} = \\overrightarrow{BC}$ و $\\overrightarrow{BL} = \\overrightarrow{CA}$ (شال)', '2': '$\\overrightarrow{AL} = \\overrightarrow{AB} + \\overrightarrow{BL} = \\overrightarrow{AB} + \\overrightarrow{CA} = \\overrightarrow{CB} = -\\overrightarrow{AK}$'},
   figure={'description': 'مثلث ABC (A في الأعلى، B أسفل اليسار، C أسفل اليمين) و M نقطة خارجه أعلى اليمين.', 'points': pts(A=yA, B=yB, C=yC, M=yM), 'model': True})
iK, iM = P(0, 0), P(6, 0); iL = P(3, 4)
assert n2(vec(iK, iL)) == 25 == n2(vec(iM, iL)) and n2(vec(iK, iM)) == 36
iI, iJ = mid(iK, iM), mid(iK, iL)
iJ2 = tr(iJ, vec(iM, iJ))
assert add(vec(iK, iM), vec(iK, iJ2)) == vec(iK, iL)
ex(24, 137, S_5, 'KLM مثلث متساوي الساقين رأسه الأساسي L حيث KM = 6cm ، KL = 5cm . I منتصف [KM] و J منتصف [KL]. J′ صورة J بالانسحاب الذي شعاعه $\\overrightarrow{MJ}$ . بيّن أن $\\overrightarrow{KM} + \\overrightarrow{KJ\'} = \\overrightarrow{KL}$ .',
   {'proof': "$\\overrightarrow{KJ'} = \\overrightarrow{KJ} + \\overrightarrow{JJ'} = \\overrightarrow{KJ} + \\overrightarrow{MJ}$ ؛ إذن $\\overrightarrow{KM} + \\overrightarrow{KJ'} = \\overrightarrow{KM} + \\overrightarrow{MJ} + \\overrightarrow{KJ} = \\overrightarrow{KJ} + \\overrightarrow{KJ} = \\overrightarrow{KL}$ (J منتصف [KL])"},
   note='I et les longueurs 6 cm / 5 cm ne servent pas à la preuve (données de construction) ; la plateforme peut les garder pour la figure.')
DISC.append({'elementId': 'ex-24', 'kind': 'inconsistency', 'resolution': 'kept — I and the lengths are construction data only',
             'text': 'Le point I (milieu de [KM]) et les longueurs KM = 6 cm, KL = 5 cm ne sont utilisés par aucune question.'})
bA, bB, bC = P(1, 4), P(0, 0), P(6, 0)
bM = mid(bB, bC); bE = sym(bA, bM); bF = tr(bC, vec(bB, bA))
assert vec(bE, bC) == vec(bB, bA) and mid(bE, bF) == bC and para(bA, bB, bC, bF)
ex(25, 137, S_5, '1) أرسم مثلثا ABC ثم عيّن النقطة M منتصف القطعة [BC]. 2) أنشئ النقطة E، نظيرة النقطة A بالنسبة للنقطة M. أثبت أنّ $\\overrightarrow{EC} = \\overrightarrow{BA}$ . 3) أنشئ النقطة F، صورة النقطة C بالانسحاب الذي شعاعه $\\overrightarrow{BA}$ . بيّن أن النقطة C هي منتصف القطعة [EF] ثم استنتج نوع الرباعي ABCF.',
   {'2': 'M منتصف [BC] و [AE] فـ ABEC متوازي أضلاع: $\\overrightarrow{EC} = \\overrightarrow{BA}$', '3': '$\\overrightarrow{CF} = \\overrightarrow{BA} = \\overrightarrow{EC}$ فـ C منتصف [EF] ؛ $\\overrightarrow{AF} = \\overrightarrow{BC}$ : ABCF متوازي أضلاع'})

# ── أوظّف تكنولوجيات الإعلام والاتصال (p. 138) ───────────────────────────────
tA_, tB_, tC_ = P(0, 0), P(3, 1), P(1, 3)
tw = add(vec(tA_, tB_), vec(tA_, tC_))
assert tr(tA_, tw) == tr(tB_, vec(tA_, tC_))
sqA, sqB = P(0, 0), P(4, 0)
sqC, sqD = P(4, 4), P(0, 4)
assert vec(sqA, sqD) == vec(sqB, sqC) and vec(sqA, sqB) == vec(sqD, sqC) and add(vec(sqA, sqB), vec(sqA, sqD)) != vec(sqB, sqD)
assert add(vec(sqA, sqB), vec(sqA, sqD)) == vec(sqA, sqC)
E.append({
    'id': 'tice', 'kind': 'tice', 'page': 138, 'section': 'أوظّف تكنولوجيات الإعلام و الاتصال', 'title': 'الأشعة و الانسحاب باستخدام البرمجية جيوجبرا', 'verified': True,
    'parts': [
        {'label': '1) رسم شعاع $\\overrightarrow{AB}$', 'steps': [
            'انقر مرتين على [أداة النقطة] و اختر Point ثم انقر على الصفحة جيوجبرا فتظهر النقطة A.',
            '(في حالة عدم ظهور A ، نضغط باليمنى على النقطة ونختار Afficher l’étiquette).',
            'ارسم نقطة B بنفس الكيفية.',
            'انقر على [أداة الشعاع] و اختر Vecteur و انقر على A ثم على B. ماذا تلاحظ؟']},
        {'label': '2) إنشاء ممثل الشعاع $\\overrightarrow{AB} + \\overrightarrow{AC}$ الذي مبدؤه A', 'steps': [
            'احجز Saisie Vecteur(A;B)+Vecteur(A;C) فيظهر ممثل w للشعاع $\\overrightarrow{AB} + \\overrightarrow{AC}$ .',
            'انقر على [أداة] و اختر [شعاع من نقطة] ثم انقر على الشعاع $\\vec{w}$ و على النقطة A فنحصل على شعاع $\\overrightarrow{AA\'}$ .',
            'انقر على [أداة] و اختر Relation و انقر على $\\vec{w}$ ثم على $\\overrightarrow{AA\'}$ . ماذا تلاحظ؟',
            'ارسم نقطة M و الممثل $\\overrightarrow{ME}$ للشعاع $\\overrightarrow{AB} + \\overrightarrow{AC}$ . استعمل الأيقونة Relation لمقارنة الشعاعين $\\overrightarrow{ME}$ و $\\overrightarrow{AB} + \\overrightarrow{AC}$ . ماذا تلاحظ؟ اشرح.']},
        {'label': '3) رسم دائرة مركزها معطى و نصف قطرها معطى', 'steps': [
            'انقر على [أداة الدائرة] و اختر Cercle (centre-rayon) و انقر على النقطة D و احجز 1 في النافذة الظاهرة ثم OK و تظهر الدائرة (Γ) التي مركزها D و نصف قطرها 1.']},
        {'label': '4) صورة دائرة بانسحاب', 'steps': [
            'انقر على [أداة] و اختر Translation و اضغط على الدائرة (Γ) ثم على الشعاع $\\overrightarrow{BC}$ فتظهر الدائرة (Γ′) صورة (Γ) بالانسحاب الذي شعاعه $\\overrightarrow{BC}$ .']},
        {'label': '5) مقارنة أشعة', 'steps': [
            'ارسم نقطتين A و B.', 'احجز Saisie polygone(A,B,4) فيظهر مربع ABCD.',
            'استعمل الأيقونة Relation لمقارنة: $\\overrightarrow{AB}$ و $\\overrightarrow{AD}$ ، $\\overrightarrow{AB}$ و $\\overrightarrow{CD}$ ، $\\overrightarrow{BC}$ و $\\overrightarrow{AD}$ ثم $\\overrightarrow{AB} + \\overrightarrow{AD}$ و $\\overrightarrow{BD}$ .']},
    ],
    'answer': {'2': '$\\overrightarrow{AA\'} = \\vec{w}$ و $\\overrightarrow{ME} = \\overrightarrow{AB} + \\overrightarrow{AC}$ : شعاع واحد له ممثلات عديدة (مبدأ كيفي).',
               '5': {'AB,AD': 'غير متساويين (منحيان مختلفان)', 'AB,CD': 'متعاكسان', 'BC,AD': 'متساويان', 'AB+AD,BD': 'غير متساويين: $\\overrightarrow{AB} + \\overrightarrow{AD} = \\overrightarrow{AC}$'}},
    'answerSource': 'computed',
    'note': 'Les noms d’outils GeoGebra sont ceux de l’interface FRANÇAISE imprimée (Point, Vecteur, Relation, Cercle (centre-rayon), Translation, Saisie) : LTR, entre balises <bdi> dans une leçon. Les icônes sont décrites entre crochets.',
    'reading': 'La commande imprimée se lit « Vecteur(A;B)*Vecteur(A;C) » : le signe est flou (« + » ou « * ») ; l’énoncé dit « AB + AC » → « + ».',
})
DISC.append({'elementId': 'tice', 'kind': 'reading', 'resolution': 'decided — « + » in the Saisie command',
             'text': 'Commande « Vecteur(A;B)?Vecteur(A;C) » : opérateur flou ; « + » d’après le titre de la partie 2.'})
DISC.append({'elementId': 'tice', 'kind': 'inconsistency', 'resolution': 'kept — the platform adds « ارسم نقطة D » before step 3',
             'text': 'Partie 3 : « انقر على النقطة D » alors qu’aucun point D n’a été créé (seuls A, B, C, M, E existent) ; la partie 4 translate (Γ) de vecteur BC, donc C doit aussi exister (créé implicitement en partie 2).'})
iA, iB, iC, iE = P(0, 0), P(4, 1), P(1, 3), P(6, 4)
g1 = add(vec(iA, iB), vec(iA, iC)); g2 = add(vec(iB, iE), vec(iC, iA))
assert tr(iE, g1) == P(11, 8) and tr(iE, g2) == tr(iE, add(vec(iB, iE), vec(iC, iA)))
E.append({
    'id': 'now-138', 'kind': 'now', 'page': 138, 'section': 'دوري الآن', 'verified': True,
    'items': [{'number': 1, 'text': 'نعتبر النقط A، B، C، E و الدّائرة (Γ) التي مركزها E و نصف قطرها 2 . $(\\Gamma_1)$ هي صورة (Γ) بالانسحاب الذي شعاعه $\\overrightarrow{AB} + \\overrightarrow{AC}$ و $(\\Gamma_2)$ هي صورة (Γ) بالانسحاب الذي شعاعه $\\overrightarrow{BE} + \\overrightarrow{CA}$ . أنشئ الدّوائر (Γ) و $(\\Gamma_1)$ و $(\\Gamma_2)$ .',
               'answer': {'Γ1': 'مركزها $E_1$ حيث $\\overrightarrow{EE_1} = \\overrightarrow{AD}$ (ABDC متوازي أضلاع) ونصف قطرها 2',
                          'Γ2': 'مركزها $E_2$ حيث $\\overrightarrow{EE_2} = \\overrightarrow{BE} + \\overrightarrow{CA}$ (نعيّن $\\overrightarrow{EX} = \\overrightarrow{BE}$ ثم $\\overrightarrow{XE_2} = \\overrightarrow{CA}$ — شال) ونصف قطرها 2',
                          'rule': 'صورة دائرة بانسحاب دائرة لها نفس نصف القطر ومركزها صورة المركز.'}}],
    'answerSource': 'computed',
})

# ── Destinations ─────────────────────────────────────────────────────────────
L1, L2, L3, L4, L5 = 'insihab-shuaa', 'shuaayn-mutasawiyayn', 'majmu-shuaayn', 'barahin-ashia', 'wadiya-idmajiya-ashia'
DEST = {
    '_comment': 'elementId → { lesson, module } ; `duplicatedIn` autorise une seconde utilisation déclarée ; `items` répartit un élément. Vérifié par scripts/check-textbook-coverage.mjs. Modules : 0 أستعدّ, 1 أنشطة/entrée, 2 معارف, 3 طرائق, 4 تمارين (synthèse : 1 وضعية, 2 QCM, 3 تمارين).',
    'objectives': {'lesson': 'unit', 'module': 'page'},
    'intro-chasles': {'lesson': 'unit', 'module': 'page', 'duplicatedIn': [{'lesson': L3, 'module': 2, 'note': 'le nom « علاقة شال » et son histoire (Bellavitis 1832, Chasles 1793–1880) au moment où la relation est formalisée'}]},
    'challenge': {'lesson': 'unit', 'module': 'page', 'duplicatedIn': [{'lesson': L3, 'module': 1, 'note': 'entrée de la leçon « مجموع شعاعين » : la vitesse réelle du nageur est la SOMME vitesse propre + courant'}]},
    'prep': {'lesson': L1, 'module': 0, 'items': {'1': {'lesson': L1, 'module': 0}, '2': {'lesson': L1, 'module': 0}, '3': {'lesson': L2, 'module': 0}, '4': {'lesson': L2, 'module': 0},
                                                  '5': {'lesson': L1, 'module': 0}, '6': {'lesson': L1, 'module': 0}, '7': {'lesson': L2, 'module': 0}}},
    'act-1': {'lesson': L1, 'module': 1},
    'act-2': {'lesson': L1, 'module': 1, 'items': {'أ': {'lesson': L1, 'module': 1}, 'ب': {'lesson': L2, 'module': 1}}},
    'know-1': {'lesson': L1, 'module': 2}, 'know-2': {'lesson': L1, 'module': 2},
    'know-3': {'lesson': L2, 'module': 2},
    'method-image': {'lesson': L2, 'module': 3}, 'method-equal': {'lesson': L2, 'module': 3}, 'now-131': {'lesson': L2, 'module': 3},
    'act-3': {'lesson': L3, 'module': 1}, 'act-4': {'lesson': L3, 'module': 1},
    'know-4': {'lesson': L3, 'module': 2}, 'know-5': {'lesson': L3, 'module': 2}, 'know-6': {'lesson': L3, 'module': 2},
    'method-sum': {'lesson': L3, 'module': 3}, 'tice': {'lesson': L3, 'module': 3},
    'method-proof': {'lesson': L4, 'module': 2},
    'now-133': {'lesson': L4, 'module': 2, 'items': {'1': {'lesson': L4, 'module': 2}, '2': {'lesson': L3, 'module': 3}}},
    'now-138': {'lesson': L4, 'module': 3},
    'qcm': {'lesson': L5, 'module': 2, 'duplicatedIn': [{'lesson': L1, 'module': 5, 'note': 'items 1–3 dans le إختبار'}, {'lesson': L2, 'module': 5, 'note': 'item 6'}, {'lesson': L3, 'module': 5, 'note': 'items 4, 5, 7'}]},
    'situation': {'lesson': L5, 'module': 1, 'duplicatedIn': [{'lesson': L5, 'module': 4, 'note': 'transposée à d’autres positions de A et B / autre largeur de route'}]},
}
for n in (1, 2, 3, 4, 5, 8):
    DEST[f'ex-{n}'] = {'lesson': L1, 'module': 4}
for n in (6, 7, 9, 12, 25):
    DEST[f'ex-{n}'] = {'lesson': L2, 'module': 4}
for n in (10, 11, 13, 14, 15, 16):
    DEST[f'ex-{n}'] = {'lesson': L3, 'module': 4}
for n in (17, 18, 20, 21, 23, 24):
    DEST[f'ex-{n}'] = {'lesson': L4, 'module': 4}
for n in (19, 22):
    DEST[f'ex-{n}'] = {'lesson': L5, 'module': 3}

ids = [e['id'] for e in E]
assert len(ids) == len(set(ids))
missing = [i for i in ids if i not in DEST]
assert not missing, missing
extra = [k for k in DEST if k != '_comment' and k not in ids]
assert not extra, extra
assert sorted(int(i[3:]) for i in ids if i.startswith('ex-')) == list(range(1, 26))
per = {}
for k, d in DEST.items():
    if k.startswith('ex-'):
        per[d['lesson']] = per.get(d['lesson'], 0) + 1
assert per == {L1: 6, L2: 5, L3: 6, L4: 6, L5: 2}, per

NOTES = {
    'destinationRationale': {
        'challenge': 'Le تحدّ (nageur + courant) est l’entrée de ' + L3 + ' : la vitesse réelle est la SOMME de deux vecteurs (composition de deux translations), exactement la compétence de cette leçon ; ' + L4 + ' (preuves) n’a pas besoin d’une situation physique d’entrée et la synthèse a déjà la وضعية du passage piéton.',
        'act-2': 'Partie أ) (construire D, AB = DC ⇔ parallélogramme) pour ' + L1 + ' ; partie ب) (milieu commun sur une droite, AB = CD, AC = −DB) pour ' + L2 + ' (milieu ⇔ vecteurs égaux).',
        'method-proof': 'Le titre du manuel « استعمال تساوي شعاعين لإنجاز برهان » est la compétence de ' + L4 + ' ; c’est son exemple travaillé, avec دوري الآن 1 p. 133.',
        'now-138': 'Images de cercles par des translations de vecteurs SOMMES de plusieurs vecteurs → ' + L4 + ' (constructions de sommes de plusieurs vecteurs).',
        'exercises': 'Sections du manuel : 1–5 (الأشعة والمساواة الشعاعية) → L1 sauf 3 et 5 qui y restent aussi (représentants, losange) ; 6–9 (الأشعة ومتوازي الأضلاع) → L1/L2 (8 → L1 : égalités sur un rectangle) ; 10–16 (مجموع شعاعين - علاقة شال) → L3 ; 12 (cercles tangents : milieu ⇒ MB = BN) → L2 ; أتعمّق 17–25 → L4 (preuves avec sommes) sauf 25 (milieu, L2), 19 (BEM, synthèse) et 22 (Varignon, synthèse).',
        'balance': 'L1 6 · L2 5 (+ method-image, method-equal, now-131, act-2 ب, know-3) · L3 6 (+ tice, now-133 #2) · L4 6 (+ method-proof, now-133 #1, now-138) · L5 2 (+ وضعية, QCM en entier). L2 n’atteint que 5 : un 6e emprunté priverait L4 ou L3 d’une preuve ; sa banque de pratique complète.',
    },
    'labAdvancedLevel': {
        L1: ['act-1 (quadrillage : quatre translations du triangle ABC, d) GL vs EF — direction —, RP vs EF — sens —, هـ) représentants de NM)', 'ex-4 (sapin sur quadrillage : 5 vecteurs égaux à SP et à CM)'],
        L2: ['method-image (D image de C, puis E tel que EB = AC : B milieu de [DE])', 'ex-25 (E symétrique, F image : C milieu de [EF], ABCF parallélogramme)'],
        L3: ['act-3 (M → M′ → M″ sur quadrillage : composée = translation de vecteur AC, ACM″M parallélogramme)', 'challenge (nageur : somme vitesse propre + courant)'],
        L4: ['ex-18 (H, K, L par sommes ; OHKL parallélogramme ; G centre de gravité de OKL)', 'ex-20 (ABEF et ABCD : M tel que BM = DM + CM tombe sur E)'],
        L5: ['situation (passage piéton : B′ = translaté de B de vecteur NM, M sur [AB′])'],
    },
}

OUT = {
    '_comment': 'EXTRACTION CANONIQUE du manuel scolaire officiel — 4AM, الجيل الثاني, unité 11 « الأشعة والانسحاب ». Générée par build-extraction.py (ne pas éditer à la main).',
    'unitCode': 'ashia-insihab',
    'textbook': {'title': 'كتاب الرياضيات — السنة الرابعة من التعليم المتوسط', 'generation': 'الجيل الثاني', 'unitNumber': 11,
                 'unitTitle': 'الأشعة والانسحاب', 'chapter': 'handasa', 'topic': 'insihab_shuaa', 'pages': {'first': 127, 'last': 138}, 'pdfPageOffset': 126,
                 'sections': ['سأتعلّم في هذا الباب', 'تحدّ', 'أستعدّ', 'أنشطة', 'معارف', 'طرائق', 'دوري الآن', 'أوظّف تعلّماتي', 'أؤكّد تعلّماتي', 'أدمج تعلّماتي', 'أتعمّق', 'أوظّف تكنولوجيات الإعلام والاتصال']},
    'frozenAt': '2026-10-04',
    'terminology': {'note': 'Le manuel écrit « شعاع / أشعة » (vecteur), « انسحاب » (translation), « المنحى » (direction), « الاتجاه » (sens), « الطول / الطويلة » (norme), « مُمثّل » (représentant), « مبدأ / نهاية » (origine / extrémité), « الشعاع المعدوم » ($\\vec{0}$), « متعاكسان » (opposés), « علاقة شال », « قاعدة متوازي الأضلاع », « صورة … بالانسحاب الذي شعاعه … », « متبوعا بـ » (composée). Un vecteur s’écrit $\\overrightarrow{AB}$, un vecteur nommé $\\vec{u}$ ; « AB » sans flèche est une LONGUEUR.',
                    'terms': ['شعاع', 'انسحاب', 'المنحى', 'الاتجاه', 'الطول', 'مُمثّل', 'مبدأ', 'نهاية', 'الشعاع المعدوم', 'متعاكسان', 'علاقة شال', 'قاعدة متوازي الأضلاع', 'متبوعا بـ']},
    'notes': NOTES,
    'elements': E,
    'discrepancies': DISC,
    'destinations': DEST,
}
Path(__file__).with_name('extraction.json').write_text(json.dumps(OUT, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{len(E)} éléments, {len(DISC)} écarts, {len(DEST) - 1} destinations')
