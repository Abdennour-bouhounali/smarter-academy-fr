#!/usr/bin/env python3
"""Génère docs/sources/3am/unit6/extraction.json — 3AM, unité 6 « التناسبية » (manuel الجيل الثاني, منشورات الشهاب 2017 ;
pp. 86–101 du livre = PDF 86–101, décalage 0 — docs/sources/3am/textbook-map.json).

Transcription VISUELLE (pages rendues à 110 dpi, puis TOUS les graphiques, tableaux et chiffres douteux relus à 220–330 dpi ; le scan
n'a pas de couche texte). Tout ce qui va aux leçons générées MAINTENANT (tanasub-tamthil-bayani puis nisba-miawiya-3am) est
`verified: True` ; les éléments de la leçon haraka-muntazama-sura (en attente) et de la synthèse sont transcrits plus brièvement,
`verified: False` : leur leçon les relira. Les réponses sont CALCULÉES ici (Fraction exacte), jamais tapées (`answerSource: computed`).

FRONTIÈRE entre les leçons de l'unité (ce que chacune possède) :
  • tanasub-tamthil-bayani (T, #9, générée MAINTENANT) — item 3am.m7.r01 côté REPRÉSENTATION : porter les colonnes d'un tableau comme
    POINTS dans un repère orthonormé ; propriété 1 (une situation de proportionnalité se représente par des points alignés avec
    l'origine du repère) ; propriété 2 (des points alignés avec l'origine représentent une situation de proportionnalité) et ses
    REFUS (droite qui ne passe pas par l'origine, points non alignés, courbe) ; lire le coefficient sur le graphique (ordonnée du
    point d'abscisse 1), écrire y = a·x, trouver une valeur inconnue sur le graphique ou par y = ax. NE traite PAS le mouvement
    uniforme (d = V × t) ni les unités de vitesse (H), ni les fonctions affines (4AM : y = ax + b n'y est que REFUSÉE comme « droite
    qui ne passe pas par O »).
  • nisba-miawiya-3am (N, #10, générée juste après T) — item 3am.m7.r01 côté POURCENTAGE ; elle CONSOLIDE la leçon 2AM `nisba-miawiya`
    (non reconstruite) : le pourcentage comme situation de proportionnalité — t % d'un nombre = × t/100 ; un pourcentage à partir de
    a/b ou d'un tableau de proportionnalité (a/b = t/100) ; augmentation / baisse de t % = × (1 + t/100) / × (1 − t/100) ; retrouver
    la valeur de départ ou le taux à partir de la valeur finale ; variations SUCCESSIVES rencontrées seulement dans دورك الآن (now-91),
    deep-39 et deep-40 (elles COMMUTENT : × 1,1 × 0,9 = × 0,9 × 1,1 ; deux baisses de 20 % puis 10 % ne font pas 30 %).
  • haraka-muntazama-sura (H, #11, PAS générée maintenant = EN ATTENTE) — mouvement uniforme, vitesse moyenne V = d/t, d = V × t,
    unités de temps (h / min / s, 1h = 3600 s, 0,25 h = 15 min), conversions km/h ↔ m/s (× 1000/3600).
  • wadiya-idmajiya-tanasubiya-sura (S, la synthèse, EN ATTENTE) — أدمج تعلّماتي p. 100 (القالة → تلمسان), وضعية للتقويم (batterie), ICT
    p. 101 (distance d'arrêt) et le texte d'ouverture p. 86.

Colonnes des QCM (أستعدّ p. 87, أؤكّد p. 97) : les options sont rangées [(1), (2), (3)] avec (1) la colonne la plus À DROITE (à côté
de la question) ; `correct` donne les indices 0-based des options justes. Les surlignages jaunes de la colonne (2) de la page 87 sont
un artefact du scan (la colonne entière est surlignée), PAS une clé de réponses : toutes les réponses sont recalculées ici.

Numérotation : les exercices d'أوظّف تعلّماتي sont 1…28 (`ex-N`) ; la page 98 (أتعمّق) s'ouvre sur 30 (pas d'exercice 29) et va jusqu'à
42 (`deep-N`) ; أؤكّد تعلّماتي p. 97 : `self-1` … `self-10`.

L'unité est générée LEÇON PAR LEÇON : les destinations vers une leçon encore coming_soon sont EN ATTENTE
(scripts/check-textbook-coverage.mjs).

Usage : python3 docs/sources/3am/unit6/build-extraction.py
"""
import json
from decimal import Decimal as D
from fractions import Fraction as F
from math import pi
from pathlib import Path


def dec(s):
    return D(str(s).replace(',', '.').replace(' ', ''))


def q(s):
    s = str(s).replace(' ', '')
    if '/' in s:
        n, d = s.split('/')
        return F(dec(n)) / F(dec(d))
    return F(dec(s))


def frac(x):
    x = F(x)
    return str(x.numerator) if x.denominator == 1 else f'{x.numerator}/{x.denominator}'


def fr(x):
    """Un décimal exact écrit à l'algérienne (virgule)."""
    x = F(x)
    s = format((D(x.numerator) / D(x.denominator)).normalize(), 'f')
    assert F(D(s)) == x, f'{x} n’est pas décimal'
    return s.replace('.', ',')


def pct(x):
    """x (Fraction, 0,25 → '25%') en pourcentage décimal exact."""
    return fr(F(x) * 100) + '%'


def approx(x, k=1):
    """Valeur arrondie à 10^-k, écrite avec virgule (pour les résultats non décimaux)."""
    x = F(x)
    m = F(10) ** k
    r = F(int(x * m + F(1, 2)), 1) / m
    return fr(r)


def hm(h):
    """Durée en heures (Fraction) → « 2h15min » (minutes entières exigées)."""
    h = F(h)
    mins = h * 60
    assert mins.denominator == 1, f'{h} h n’est pas un nombre entier de minutes'
    mins = int(mins)
    return f'{mins // 60}h{mins % 60:02d}min' if mins % 60 else f'{mins // 60}h'


def prop(xs, ys):
    """Les colonnes (x_i ; y_i) sont-elles proportionnelles ? Retourne le coefficient (y/x) ou None."""
    ks = set()
    for x, y in zip(xs, ys):
        x, y = F(x), F(y)
        if x == 0:
            if y != 0:
                return None
            continue
        ks.add(y / x)
    return ks.pop() if len(ks) == 1 else None


def aligned(pts):
    """Points alignés ? (produit en croix sur les deux premiers vecteurs)."""
    (x0, y0), (x1, y1) = pts[0], pts[1]
    return all((F(x1) - x0) * (F(y) - y0) == (F(y1) - y0) * (F(x) - x0) for x, y in pts[2:])


def aligned_with_origin(pts):
    return prop([p[0] for p in pts], [p[1] for p in pts]) is not None


LET6 = ['أ', 'ب', 'جـ', 'د', 'هـ', 'و']
E = []


def el(id, kind, page, section, text=None, verified=False, **extra):
    d = {'id': id, 'kind': kind, 'page': page, 'section': section, 'verified': verified}
    if text is not None:
        d['text'] = text
    d.update(extra)
    E.append(d)
    return d


# ── p. 86 : ouverture ─────────────────────────────────────────────────────────────────────────────
el('objectives', 'objectives', 86, 'سأتعلّم في هذا الباب', verified=True, items=[
    'التعرف على وضعية تناسبية في تمثيل بياني.',
    'استعمال التناسبية في وضعيات تدخل فيها النسبة المئوية.',
    'التعرف على الحركة المنتظمة.',
    'استعمال المساواة d = V × t في حسابات متعلقة بالمسافة المقطوعة والسرعة والزمن.',
    'تحويل وحدات قياس السرعة وتوظيف التناسبية لاستعمال وحدات الزمن.',
])
el('opener', 'aside', 86, 'تمهيد (نص تاريخي)', None,
   unreadable=True,
   reading='Le cadre violet (histoire) est détruit par des blocs de pixels : seuls des fragments isolés se devinent (« السرعة », « ساعة رملية », '
           '« عقدة » / « ميل بحري », des marins et une corde à nœuds) — IMPOSSIBLE à transcrire, NON reconstitué. Photo : un moulinet à corde '
           '(loch) et un sablier — la mesure de la vitesse des navires. Titre et liste « سأتعلّم » lisibles (voir `objectives`).')
el('challenge', 'challenge', 86, 'تحدّي',
   'البيان المقابل يُمثّل المسافة المقطوعة بدلالة الزمن لعدّاء. 1) ما هي المسافة التي قطعها هذا العداء في مُدّة 3min34s؟ '
   '2) ما هي المدة الموافقة لقطع مسافة 1500m؟',
   verified=True,
   figure={'type': 'graph', 'xAxis': 'الزمن (s)', 'yAxis': 'المسافة (m)', 'marked': {'x': 4, 'y': 24, 'dashed': True},
           'note': 'une demi-droite issue de O passant par le point marqué (4 s ; 24 m) ; AUCUNE autre graduation ni point imprimé'},
   reading='p. 86 relue à 220 dpi : axes (m) en ordonnée et (s) en abscisse ; seules graduations imprimées 0, 4 (s) et 24 (m) avec deux '
           'tirets menant au point (4 ; 24). La droite elle-même est quasi invisible dans le scan (quelques pointillés bleutés entre O et '
           '(4 ; 24) et au-delà) : lue comme une demi-droite issue de O. Les réponses se déduisent du coefficient 24/4.')
V_RUN = F(24, 4)
T1 = 3 * 60 + 34
D1 = V_RUN * T1
T2 = F(1500) / V_RUN
assert V_RUN == 6 and T1 == 214 and D1 == 1284 and T2 == 250 and T2 == 4 * 60 + 10
E[-1]['answer'] = {'speed': f'{frac(V_RUN)} m/s', '3min34s': f'{T1} s → {frac(D1)} m', '1500m': f'{frac(T2)} s = 4 min 10 s'}
E[-1]['answerSource'] = 'computed'

# ── p. 87 : أستعدّ ─────────────────────────────────────────────────────────────────────────────────


def prep(n, question, options, correct, truth, **extra):
    """options = [(1), (2), (3)] ; (1) = colonne la plus à droite. `truth` = [bool,…] CALCULÉ ; `correct` = indices 0-based lus."""
    got = [i for i, t in enumerate(truth) if t]
    assert got == correct, f'prep {n}: calcul {got} ≠ lecture {correct}'
    return {'n': n, 'question': question, 'options': options, 'correct': correct, **extra}


def tab(xs, ys):
    return 'x : ' + ' ; '.join(map(str, xs)) + '  /  y : ' + ' ; '.join(map(str, ys))


T_OPT = [([7, 6, 0], [56, 48, 8]), ([12, 6, 4], [18, 9, 6]), ([2, 3, 6], [5, F(15, 2), 15])]
X_FUEL = F(100) * 6 / 4
X_ALG = F(76, 10) * F(4, 10) / F(28, 10)
assert X_FUEL == 150 and X_ALG == F(38, 35)
PREP = [
    prep(1, 'الجدول الذي يُمثّل وضعية تناسبية هو الجدول…',
         ['7 ; 6 ; 0 فوق 56 ; 48 ; 8', '12 ; 6 ; 4 فوق 18 ; 9 ; 6 (قراءة العمودين 4→6, 6→9, 12→18)', '2 ; 3 ; 6 فوق 5 ; 7,5 ; 15'], [1, 2],
         [prop(*T_OPT[0]) is not None, prop(*T_OPT[1]) is not None, prop(*T_OPT[2]) is not None],
         columns_read={'(1)': [[7, 56], [6, 48], [0, 8]], '(2)': [[4, 6], [6, 9], [12, 18]], '(3)': [[2, 5], [3, 7.5], [6, 15]]},
         coefficients={'(2)': frac(prop(*T_OPT[1])), '(3)': frac(prop(*T_OPT[2]))}),
    prep(2, '5 عُلب متماثلة تزن 4kg. تزن العُلبة الواحدة…', ['1,25kg', '0,8kg', '1kg'], [1],
         [q('1,25') == F(4, 5), q('0,8') == F(4, 5), F(1) == F(4, 5)]),
    prep(3, 'في هذه الوضعية التناسبية… (كمية البنزين المستهلكة 4L ← المسافة 100km ؛ 6L ← x)',
         ['100 ÷ 4 = 25 ومنه: x = 25 × 6', '6 ÷ 4 = 1,5 ومنه: x = 100 × 1,5', '6 - 4 = 2 ومنه: x - 100 = 2'], [0, 1],
         [F(25) * 6 == X_FUEL, F(100) * F(3, 2) == X_FUEL, 100 + 2 == X_FUEL], x=frac(X_FUEL)),
    prep(4, 'معامل التناسبية المُشار إليه في الجدول هو: (الكتلة kg: 7 ، 14 ← السعر DA: 600 ، 1200)',
         ['7/600', '600/7', '600 × 7'], [1], [F(7, 600) == F(600, 7), F(600, 7) == F(600) / 7, F(600 * 7) == F(600, 7)],
         note='coefficient « السعر ÷ الكتلة » = 600/7 DA par kg (sens kg → DA, celui du tableau)'),
    prep(5, 'في جدول التناسبية هذا قيمة x تُساوي… (2,8 ← 0,4 ؛ 7,6 ← x)',
         ['2,8 × 7,6 / 0,4', '2,8 × 0,4 / 7,6', '0,4 × 7,6 / 2,8'], [2],
         [q('2,8') * q('7,6') / q('0,4') == X_ALG, q('2,8') * q('0,4') / q('7,6') == X_ALG, q('0,4') * q('7,6') / q('2,8') == X_ALG],
         x=frac(X_ALG), columns_read={'table': [[2.8, 0.4], [7.6, 'x']]}),
    prep(6, 'إحداثيا النقطة A في هذا المعلم هما… (A : فاصلتها 2 وترتيبها 3 ؛ تدريجان 1…4 على المحورين)',
         ['(2;3)', '(3;2)', 'الفاصلة 2 والترتيب 3'], [0, 2], [True, False, True], A=[2, 3]),
    prep(7, 'في إحدى الأقسام توجد 12 بنتا من بين 30 متمدرسا. النسبة المئوية للبنات في هذا القسم هي…', ['40%', '70%', '25%'], [0],
         [F(12, 30) * 100 == 40, F(12, 30) * 100 == 70, F(12, 30) * 100 == 25]),
    prep(8, 'لحساب 75% من 200 نُجري العملية…', ['200 × 0,75', '200 × 75 / 100', '200 - 75'], [0, 1],
         [F(200) * q('0,75') == 150, F(200) * 75 / 100 == 150, F(200 - 75) == 150]),
    prep(9, 'x عدد حيث 2 = 3/x إذن…', ['x = 6', 'x = 2/3', 'x = 1,5'], [2],
         [F(3, 6) == 2, F(3, F(2, 3)) == 2, F(3) / q('1,5') == 2]),
    prep(10, 'نعبّر عن الساعة ونصف الساعة بـ…', ['1,30h', '1,5h', '1h30min'], [1, 2],
         [q('1,30') == F(3, 2), q('1,5') == F(3, 2), F(1) + F(30, 60) == F(3, 2)]),
]
el('prep', 'prep', 87, 'أستعدّ', 'جد الإجابة الصحيحة (أو الإجابات الصحيحة) في كل حالة، مبرّرا إياها.', verified=True, items=PREP,
   columns='[(1), (2), (3)] ; (1) = colonne de droite', answerSource='computed',
   reading='p. 87 relue à 220 dpi (tableaux 1, 3, 4, 5 et repère 6 découpés). Item 1 : colonnes lues par paires (x ; y) — (1) contient une '
           'colonne (0 ; 8), donc non proportionnel. Item 4 : lignes « الكتلة 14 | 7 » et « السعر 1200 | 600 » : 7 kg ↔ 600 DA. Item 5 : '
           'colonnes (2,8 ; 0,4) et (7,6 ; x). Item 6 : A(2 ; 3) (fenêtre y 0…4, x 0…4). Le surlignage jaune de la colonne (2) est un artefact '
           'du scan (voir l’en-tête). Items 7, 8, 9 : 40 %, 75 % de 200, 2 = 3/x.')

# ── p. 88 : أنشطة 1 et 2 ───────────────────────────────────────────────────────────────────────────
BOXES = [2, 6, 12, 14]


def shop1(n): return 5 * F(n)
def shop2(n): return F(5, 2) * n + 10
def shop3(n): return 5 * F(n) if n <= 8 else 5 * 8 + 2 * F(n - 8)


P1, P2, P3 = [shop1(n) for n in BOXES], [shop2(n) for n in BOXES], [shop3(n) for n in BOXES]
assert P1 == [10, 30, 60, 70] and P2 == [15, 25, 40, 45] and P3 == [10, 30, 48, 52]
assert prop(BOXES, P1) == 5 and prop(BOXES, P2) is None and prop(BOXES, P3) is None
assert aligned([(n, shop2(n)) for n in BOXES]) and not aligned([(n, shop3(n)) for n in BOXES])
assert not aligned_with_origin([(n, shop2(n)) for n in BOXES])
el('act-1', 'activity', 88, 'أنشطة 1 — تحديد خصائص وضعية تناسبية في تمثيل بياني',
   'يحتاج أيوب إلى دبابيس لتزيين القسم. لذلك عليه أن يختار بين العروض الثلاثة الآتية: المحل (1): 5DA للعُلبة الواحدة. المحل (2): 2,5DA للعُلبة '
   'الواحدة + قيمة جُزافية 10DA. المحل (3): من عُلبة إلى 8 عُلب: تُحسب العُلبة الواحدة بـ 5DA ، بدءًا من العُلبة التاسعة تُحسب العُلبة الواحدة بـ 2DA. '
   '1) من أجل كُل عرض من العُروض الثلاثة، انقل وأتمم الجدول المقابل (عدد العُلب 2 ، 6 ، 12 ، 14 ← الثمن DA) • اذكر في كُل حالة إن كان الجدول '
   'يُمثّل وضعية تناسبية؟ 2) ارسم معلما (على محور الفواصل مربع واحد يُمثّل عُلبة واحدة وعلى محور التراتيب مربّع واحد يُمثّل 5DA). مثّل في هذا '
   'المعلم وبألوان مُختلفة مُعطيات الجدول المُناسب لكُل عرض من العروض الثلاثة. 3) اشرح كيف يُمكن التعرّف بيانيا على جدول تناسبية.',
   verified=True,
   answer={'boxes': BOXES, 'shop1': [frac(x) for x in P1], 'shop2': [fr(x) for x in P2], 'shop3': [frac(x) for x in P3],
           'proportional': {'shop1': True, 'shop2': False, 'shop3': False}, 'coefficientShop1': '5 DA par boîte',
           'plottedSquares (x boîtes ; y × 5 DA)': {'shop1': [[n, frac(shop1(n) / 5)] for n in BOXES],
                                                    'shop2': [[n, fr(shop2(n) / 5)] for n in BOXES],
                                                    'shop3': [[n, fr(shop3(n) / 5)] for n in BOXES]},
           'graphReading': 'shop1 : points alignés avec l’origine ; shop2 : points alignés mais la droite ne passe pas par l’origine (ordonnée à l’origine 10 DA) ; shop3 : points NON alignés (la pente change après 8 boîtes)',
           '3': 'situation de proportionnalité ⇔ points alignés avec l’origine du repère'},
   answerSource='computed', note='Posée en APPLICATION (guide §4ter) : la plateforme conçoit son propre lab d’entrée ; cette activité sert d’exercice.',
   reading='Tableau relu à 220 dpi : 2, 6, 12, 14. Le texte du magasin 3 est lu « 5 DA la boîte jusqu’à 8 boîtes ; à partir de la 9e boîte, 2 DA la boîte ».')
POP, UNDER15, WOMEN, GROW = 40, q('0,29'), q('10,8'), q('0,375')
ADULT = POP * (1 - UNDER15)
assert ADULT == q('28,4') and WOMEN / POP == q('0,27') and POP * (1 + GROW) == 55
ENG = F(25, 100) * 200 + F(35, 100) * 300
assert ENG == 155 and ENG / 500 == q('0,31')
el('act-2', 'activity', 88, 'أنشطة 2 — استعمال النسبة المئوية',
   '1) بلغ عدد سُكان الجزائر 40 مليون نسمة سنة 2016. أ) خلال هذه السنة، بلغت نسبة فئة السكان الذين تقلّ أعمارهم عن 15 سنة 29%. ما هو عدد السكان '
   'البالغين 15 سنة فأكثر؟ ب) خلال هذه السنة حوالي 10,8 مليون امرأة تتراوح أعمارهن بين 15 سنة و 49 سنة. ما هي النسبة المئوية لهذه الفئة السكانية؟ '
   'جـ) إذا اعتبرنا أنّ عدد السكان سيرتفع بـ 37,5% بين 2016 و 2050، فما هو عدد السكان سنة 2050. 2) في إحدى المؤسسات الصناعية، 25% من أصل 200 عاملة '
   'هُنّ مُهندسات و 35% من أصل 300 عامل هُم مُهندسون. ما هي النسبة المئوية للمهندسين والمهندسات معا في هذه المؤسسة؟',
   verified=True,
   answer={'1a': f'{fr(1 - UNDER15)} → {fr(ADULT)} millions (71 %)', '1b': pct(WOMEN / POP), '1c': f'{fr(POP * (1 + GROW))} millions',
           '2': {'women engineers': 50, 'men engineers': 105, 'total': '155 sur 500', 'percent': pct(ENG / 500)}},
   answerSource='computed', note='Posée en APPLICATION (guide §4ter) : la plateforme conçoit son propre lab d’entrée ; cette activité sert d’exercice.')

# ── p. 89 : أنشطة 3 + هل تعلم ───────────────────────────────────────────────────────────────────────
D3B, V3B = F(3, 2) * 83, F(83)
TOT_D, TOT_T = 180 + D3B, F(2) + F(3, 2)
assert D3B == q('124,5') and TOT_D / TOT_T == 87
el('act-3', 'activity', 89, 'أنشطة 3 — احترام إشارة تحديد السرعة',
   'انطلق الأب وابنه في رحلة على متن سيارة. 1) قطع الأب في المرحلة الأولى مسافة 180km في مُدّة 2h. نفترض أنّه حافظ باستمرار على سرعة ثابتة أثناء قيادة السيارة. '
   'أ) ما هي المسافة التي قطعها خلال ساعة واحدة؟ نقول أنّ السرعة المتوسطة لهذه السيارة في هذه المرحلة هي 90 كيلومتر في الساعة ونكتب 90km/h. '
   'ب) في مرحلة ثانية من هذه الرحلة، ظلّ الأب يقود السيارة لمُدّة 1,5h وبسرعة متوسطة قدرها 83km/h. ما هي المسافة التي قطعها خلال هذه المرحلة؟ '
   'جـ) ما هي سرعته المتوسطة التي قطع بها المسافتين معا خلال المرحلتين؟ 2) طلب الأب من ابنه أن يساعده على قيادة السيارة، علما أنّ للابن رخصة سياقة جديدة '
   'تفرض عليه عدم تجاوز سرعة 80km/h. أ) قطع الابن مسافة 120km في مُدّة 1h30min. ما هي سرعته المتوسطة؟ هل احترم الابن تحديد السرعة الذي تفرضه رخصته؟ '
   'ب) قال الأب للابن: « كان عليك التوقّف مرتين عند الضوء الأحمر ». ماذا تستنتج؟',
   answer={'1a': '90 km', '1b': f'{fr(D3B)} km', '1c': f'{frac(TOT_D)}/{frac(TOT_T)} = {frac(TOT_D / TOT_T)} km/h (≠ moyenne de 90 et 83)',
           '2a': f'{frac(F(120) / F(3, 2))} km/h : limite respectée (exactement 80)',
           '2b': 'la vitesse MOYENNE cache des arrêts : pendant la marche la vitesse instantanée a dépassé 80 km/h'},
   answerSource='computed',
   reading='2b est une question de lecture : « à l’arrêt deux fois » ⇒ la voiture a roulé plus vite que 80 km/h entre les arrêts (la moyenne n’est pas la vitesse à chaque instant).')
el('know-0', 'aside', 89, 'هل تعلم؟',
   'تُعتبر السرعة مفهوما مألوفا ومتداولا عند العام والخاص في حياتنا المُعاصرة. فالسائق الذي يقطع مسافة 320km خلال مُدّة 4h يقول إن سرعته المتوسطة كانت '
   '80km/h، رغم أنّه لاحظ خلال سفره أنّ سرعته غير ثابتة (يحدث تسارع أو تباطؤ…) وأنّ عدّاد السيارة يُشير في كل لحظة لقيمة تارة أكبر وتارة أصغر من 80km/h لأنّ '
   'عدّاد السيارة يُشير إلى قيمة سرعة السيارة في كل لحظة. نقول أنّ هناك سرعتين: السرعة المتوسطة والسرعة اللحظية. السرعة المتوسطة هي السرعة التي يُفترض أن '
   'تكتسبها السيارة إذا قطعت مسافات متساوية في مُدد متساوية مُحافظة باستمرار على نفس السرعة.',
   answer={'320/4': '80 km/h'}, answerSource='computed', reading='figure : un compteur de vitesse gradué 20…220 km/h (aiguille près de 20)')
assert F(320, 4) == 80

# ── p. 90 : معارف 1, 2 ─────────────────────────────────────────────────────────────────────────────
TEMP = ([1, 3, 4], [10, 30, 40])
assert prop(*TEMP) == 10
el('know-1a', 'knowledge', 90, 'معارف 1 — التعرّف على وضعية تناسبية في تمثيل بياني (خاصية 1)',
   'خاصية 1: تُمثّل بيانيا كل وضعية تناسبية في معلم بنقاط في استقامية مع مبدإ المعلم. مثال: الجدول الآتي هو جدول تناسبية (الزمن h : 1 ، 3 ، 4 ← درجة الحرارة °C : '
   '10 ، 30 ، 40). يُمثَّل بيانيا في معلم بنقاط في استقامية مع مبدإ المعلم.',
   verified=True, answer={'coefficient': '10 °C par heure', 'points': [[1, 10], [3, 30], [4, 40]], 'alignedWithOrigin': True}, answerSource='computed',
   figure={'axes': 'x : (h) 0…4 ; y : (°C) 10…50', 'points': [[1, 10], [3, 30], [4, 40]], 'line': 'droite pointillée issue de O'},
   reading='graphique relu à 220 dpi : trois points (1;10), (3;30), (4;40) sur une droite pointillée issue de l’origine.')
G_A = [(0, 0), (2, 10), (4, 40)]
G_B = [(0, 50), (2, 40), (3, 35)]
G_C = [(0, 0), (1, 20), (2, 40)]
assert not aligned(G_A) and aligned(G_B) and not aligned_with_origin(G_B) and aligned_with_origin(G_C)
el('know-1b', 'knowledge', 90, 'معارف 1 — خاصية 2',
   'خاصية 2: كل تمثيل بياني نقاطه في استقامية مع مبدإ المعلم يُمثّل وضعية تناسبية. مثال: (أ) النقاط ليست في استقامية، إذن هذا البيان لا يُمثّل وضعية '
   'تناسبية. (ب) النقاط ليست في استقامية مع مبدإ المعلم، إذن هذا البيان لا يُمثّل وضعية تناسبية. (جـ) النقاط في استقامية مع مبدإ المعلم، إذن هذا البيان يُمثّل '
   'وضعية تناسبية.',
   verified=True,
   figure={'axes': 'x : (h) 0…4 ; y : (°C) 10…50 (même repère trois fois)',
           'rightGraph (curve)': {'points': G_A, 'shape': 'courbe pointillée convexe passant par O : points NON alignés'},
           'middleGraph': {'points': G_B, 'shape': 'droite décroissante qui coupe l’axe des ordonnées en 50 : points alignés mais PAS avec l’origine'},
           'leftGraph': {'points': G_C, 'shape': 'droite croissante issue de O : points alignés avec l’origine'}},
   answer={'curve': 'non', 'lineNotThroughO': 'non', 'lineThroughO': 'oui (coefficient 20)'}, answerSource='computed',
   reading='trois graphiques relus à 220 dpi (de droite à gauche dans le livre) : courbe (0;0)(2;10)(4;40) ; droite (0;50)(2;40)(≈3;35) — le troisième point est lu à ≈ 35–36, '
           'sans importance : le refus vient de l’ordonnée à l’origine ; droite (0;0)(1;20)(2;40).')
el('know-2a', 'knowledge', 90, 'معارف 2 — النسبة المئوية (خاصية)',
   'خاصية: t يُشير إلى عدد. لحساب t% من عدد، نضرب هذا العدد في t/100. طريقة: يؤول حساب نسبة مئوية إلى حساب مُعامل تناسبية والتعبير عنه بالكتابة t/100.',
   verified=True, answer={'example 70 % of 75': fr(q('0,7') * 75)}, answerSource='computed')
assert q('0,7') * 75 == q('52,5') and F(8, 32) == q('0,25')
el('know-2b', 'knowledge', 90, 'معارف 2 — أمثلة',
   'مثال 1: تحتوي قارورة عصير سعتها 75cL على 70% ماء. (جدول: ماء cL : 52,5 ، 70 ؛ عصير cL : 75 ، 100 ؛ المعامل × 70/100). يوجد 52,5cL من الماء في هذه القارورة. '
   'مثال 2: من بين 32 مُتمدرسا في أحد الأقسام، توجد 8 بنات. (8/32 = 0,25 = 25/100). النسبة المئوية للبنات في هذا القسم هي 25%.',
   verified=True, answer={'example1': f'{fr(q("0,7") * 75)} cL', 'example2': pct(F(8, 32))}, answerSource='computed',
   reading='deux tableaux de proportionnalité lus à 220 dpi : (eau 52,5 | 70 ; jus 75 | 100) et (8 | … ; 32 | 100) avec flèches × 70/100 et × ?')

# ── p. 91 : طرائق ──────────────────────────────────────────────────────────────────────────────────
GAS = [(0, 0), (1, F(3, 4)), (2, F(3, 2)), (4, 3)]
A_GAS = prop(*zip(*GAS))
assert A_GAS == F(3, 4) and A_GAS * 7 == q('5,25') and F(q('10,5')) / A_GAS == 14
el('method-1a', 'method', 91, 'طرائق — التناسبية والتمثيل البياني',
   'تمرين: يُمثّل التمثيل البياني المقابل، كتلة بنزين m بـ (kg) بدلالة حجمه V بـ (L). 1) ما هي كتلة 2L من هذا البنزين؟ 2) عبّر عن m بدلالة V. 3) احسب كتلة 7L من هذا البنزين. '
   '4) احسب حجم 10,5kg من هذا البنزين. حل: 1) 1,5kg هي كُتلة 2L من هذا البنزين. 2) يُمثّل البيان وضعية تناسبية لأن نقاطه في استقامية مع مبدإ المعلم. الجدول المُقابل هو جدول '
   'تناسبية. حسب مُساواة الجداءين المُتصالبين نجد: m = 1,5 × V / 2 ومنه m = 0,75 × V ؛ (0,75 هو معامل التناسبية و يُمثّل في هذه الوضعية كُتلة 1L بـ kg). '
   '3) كتلة 7L من هذا البنزين هي 5,25kg. 4) حجم 10,5kg من هذا البنزين هو 14L. تعاليق: الحجم مُمثّل على محور الفواصل والكُتلة مُمثّلة على محور التراتيب. للإجابة على '
   'السؤالين 3 و 4 يُمكن استعمال العبارة الحرفية m = 0,75V أو يُمكن إتمام جدول التناسبية الآتي بالإجراء المُناسب (الحجم L: 2 ، 7 ، y ؛ الكتلة kg: 1,5 ، x ، 10,5).',
   verified=True,
   figure={'axes': 'x : الحجم (L) 1…4 ; y : الكتلة (kg) 1…4', 'points': [[0, 0], [1, 0.75], [2, 1.5], [4, 3]], 'line': 'droite pointillée issue de O'},
   answer={'1': '1,5 kg', '2': f'm = {fr(A_GAS)} V', '3': f'{fr(A_GAS * 7)} kg', '4': f'{frac(F(q("10,5")) / A_GAS)} L'}, answerSource='computed',
   reading='graphique relu à 220 dpi : points (0;0), (1;≈0,75), (2;1,5), (4;3) ; le repère annexe de « تعاليق » marque 1,5 et 2 en pointillés.')
el('method-1b', 'method', 91, 'طريقة — M(x ; y) sur une droite issue de l’origine',
   'طريقة: إذا كانت M(x;y) نقطة من نقاط في استقامية مع مبدإ المعلم فإنّه يُمكن التعبير عن y بدلالة x في علاقة من الشكل y = ax.',
   verified=True, answer={'rule': 'y = a·x ; a = ordonnée du point d’abscisse 1'}, answerSource='computed')
P2000 = F(2000)
P_UP, P_DOWN = P2000 * q('1,1'), P2000 * q('1,1') * q('0,9')
assert P_UP == 2200 and P_DOWN == 1980 and P2000 * q('0,9') * q('1,1') == 1980 and P_DOWN != P2000
el('method-2', 'method', 91, 'طرائق — زيادة وتخفيض',
   'تمرين: سعر كتاب 2000DA ازداد سعره بـ 10%، ثم انخفض بـ 10%، ما هو سعره الجديد؟ حل: ازدياد السعر بـ 10% يعني أنّ السعر صار 2200DA (2000 + 0,1 × 2000 = 2200). '
   'انخفاض السعر السابق بـ 10% يعني أنّ السعر صار 1980DA (2200 − 0,1 × 2200 = 1980). إذن السعر الجديد للكتاب هو 1980DA. ملاحظة: زيادة سعر بـ 10% ثم تخفيضه بـ 10% لا يُعيدنا إلى السعر الأصلي. '
   'طريقة: 1) لحساب ناتج زيادة x بـ t%، نحسب x + x × t/100 أو نحسب (1 + t/100)x. 2) لحساب ناتج تخفيض x بـ t%، نحسب x − x × t/100 أو نحسب (1 − t/100)x.',
   verified=True, answer={'after +10%': frac(P_UP), 'after −10%': frac(P_DOWN), 'difference with start': frac(P_DOWN - P2000),
                          'factor': fr(q('1,1') * q('0,9')) + ' (= 0,99)'}, answerSource='computed')
el('now-91', 'now', 91, 'دورك الآن (p. 91)',
   'سعر كتاب 2000DA، انخفض سعره بـ 10%، ثم ازداد بـ 10%، ما هو سعره الجديد؟ • قارن النتيجة بنتيجة المشكل السابق، ماذا يُمكن أن تستنتج؟',
   verified=True, answer={'after −10%': frac(P2000 * q('0,9')), 'after +10%': frac(P2000 * q('0,9') * q('1,1')), 'conclusion': 'même résultat 1980 DA : l’ordre des deux variations ne change pas le prix final (les facteurs se multiplient dans n’importe quel ordre) ; et 1980 ≠ 2000'},
   answerSource='computed')

# ── p. 92 : معارف 3 ────────────────────────────────────────────────────────────────────────────────
MOTO = [(0, 0), (F(1, 2), 60), (1, 120), (2, 240), (4, 480)]
assert prop(*zip(*MOTO)) == 120 and F(246, 3) == 82 and q('1,5') * 50 == 75 and F(450, 90) == 5
el('know-3', 'knowledge', 92, 'معارف 3 — الحركة المنتظمة والسرعة المتوسطة',
   'نقول عن حركة أنّها منتظمة إذا كانت المسافات التي يقطعها مُتحرك مُتناسبة مع المُدد الموافقة لها. مُعامل التناسبية هو السرعة المتوسطة V. (الجدول: المُدّة t ← المسافة d ؛ × V) '
   'وبالتالي d = V × t. السرعة المتوسطة لمتحرك هي حاصل قسمة المسافة المقطوعة (d) على المدة الزمنية المستغرقة لقطع هذه المسافة (t): V = d/t. '
   'مثال 1: يُمثّل البيان المقابل المسافات المقطوعة لدراجة نارية بدلالة الزمن. التمثيل البياني عبارة عن نقاط في استقامية مع مبدإ المعلم، إذن المسافة المقطوعة مُتناسبة مع المُدّة '
   'المستغرقة لقطعها؛ فالحركة منتظمة. يقطع الدرّاج مسافة 120km خلال 1 ساعة. السرعة المتوسطة للدراجة هي V = 120Km/h. مثال 2: حساب سرعة متوسطة. قطعت سيارة مسافة 246km في 3h. '
   'V = d/t ومنه V = 246/3 = 82. السرعة المتوسطة للسيارة هي 82km/h أو 82km.h⁻¹. مثال 3: حساب مسافة. سار راجل مُدّة 50s بسرعة متوسطة قدرها 1,5m/s. d = V × t ومنه d = 1,5 × 50 = 75. '
   'قطع هذا الراجل مسافة 75m. مثال 4: حساب مُدّة زمنية. يقطع قطار مسافة 450km بسرعة متوسطة قدرها 90km/h. d = V × t ومنه 450 = 90 × t أي t = 450/90 = 5. مُدّة رحلة القطار هي 5h. '
   'ملاحظات: • في حركة منتظمة، يُعبّر عن المسافة بالمساواة d = V × t ويُعبّر عن المدة بالمساواة t = d/V حيث d هي المسافة المقطوعة و t المدة المستغرقة لقطع المسافة. '
   '• يُعبّر عن السرعة حسب الوحدات المختارة للمسافة وللمدة المستغرقة لقطع هذه المسافة. إذا عُبّر عن المسافة بالكيلومتر (km) وللمدة بالساعة (h) فإنّ السرعة يُعبّر عنها في الساعة '
   'بالكيلومتر ونكتب: Km/h أو Km.h⁻¹ (تُقرأ كيلومتر في الساعة). إذا عُبّر عن المسافة بالمتر (m) وللمدة بالثانية (s) فإنّ السرعة يُعبّر عنها بالمتر في الثانية ونكتب: m/s أو m.s⁻¹.',
   answer={'ex1': '120 km/h', 'ex2': '82 km/h', 'ex3': '75 m', 'ex4': '5 h'}, answerSource='computed',
   figure={'axes': 'x : الزمن (h) 1…5 ; y : المسافة (km) 60…540 par 60', 'points': [[0, 0], [0.5, 60], [1, 120], [2, 240], [4, 480]], 'line': 'droite pointillée issue de O'},
   reading='graphique de l’exemple 1 relu à 220 dpi : points (½;60), (1;120), (2;240), (4;480) sur une droite issue de O.')

# ── p. 93 : طرائق ──────────────────────────────────────────────────────────────────────────────────
KMH_TO_MS = F(1000, 3600)
assert F(q('15,3')) * KMH_TO_MS == q('4,25') and F(20) / KMH_TO_MS == 72
el('method-3', 'method', 93, 'طرائق — تحويل وحدات قياس السرعة',
   'تمرين: 1) عبّر عن السرعة V = 15,3Km.h⁻¹ بـ (m/s). 2) عبّر عن السرعة V = 20m/s بـ (Km/h). حل: 15,3Km.h⁻¹ تُكتب أيضا 15,3Km/1h وتعني أنّ المُدّة التي استُغرقت لقطع مسافة 15,3km هي 1h. '
   'نعلم أنّ 1h = 3600s و 1Km = 1000m. 1) V = 15,3Km.h⁻¹ = 15,3Km/1h = 15,3 × 1000m / 1 × 3600s = 4,25m.s⁻¹. 2) V = 20m.s⁻¹ = 20m/1s = 3600 × 20Km / 1000 × 1h = 72Km.h⁻¹. '
   'طريقة: تحويل وحدة قياس السرعة يؤول إلى تحويل وحدة الزمن ووحدة المسافة في عبارة السرعة. • للتحويل من km.h⁻¹ إلى m.s⁻¹ نضرب في 1000/3600. • للتحويل من m.s⁻¹ إلى km.h⁻¹ نضرب في 3600/1000.',
   answer={'1': f'{fr(q("15,3") * KMH_TO_MS)} m/s', '2': f'{frac(F(20) / KMH_TO_MS)} km/h'}, answerSource='computed')
FATIMA = F(105) * q('1,5')
IMAD_T = F(36) / 16
AYYOUB = F(10) / q('1,25')
assert FATIMA == q('157,5') and IMAD_T == q('2,25') and hm(IMAD_T) == '2h15min' and AYYOUB == 8
el('method-4', 'method', 93, 'طرائق — استعمال المساواة d = V × t',
   'تمرين: 1) سارت فاطمة على طريق سيار مُدّة 1h30min وبسرعة متوسطة قدرها 105Km.h⁻¹. ما هي المسافة التي قطعتها؟ 2) قطع عماد على متن دراجته مسافة 36km بسرعة متوسطة قدرها 16Km.h⁻¹. '
   'ما هي المدة الزمنية لقطع هذه المسافة؟ 3) قطع أيوب مسافة 10km مشيا، واستغرقت المسافة المقطوعة 1h15min. احسب سرعته المتوسطة. حل وتعاليق: 1) t = 1h30min = 1h + 0,5h = 1,5h '
   '(جدول: ساعة 1 ، x ؛ دقيقة 60 ، 30 ؛ x = 30/60 = 0,5) ؛ d = V × t إذن d = 105 × 1,5 = 157,5. المسافة التي قطعتها فاطمة هي 157,5Km. 2) نعلم أنّ d = V × t ومنه t = d/V = 36/16 = 2,25h '
   'أي 2h + 0,25h ؛ 0,25h = 0,25 × 60min = 15min. قطع عماد المسافة في مُدّة 2h15min. 3) t = 1h15min = 1h + 0,25h = 1,25h ؛ V = d/t = 10/1,25 = 8. مشى أيوب بسرعة متوسطة قدرها 8Km.h⁻¹. '
   'طريقة: • إذا عُلم عددان من بين الأعداد الثلاثة d ، V ، t فإنّه يُمكننا حساب العدد الثالث باستعمال الصيغة d = V × t. • لتحويل الساعات إلى دقائق نضرب في 60 (لأنّ 1h = 60min).',
   answer={'1': f'{fr(FATIMA)} km', '2': f'{fr(IMAD_T)} h = {hm(IMAD_T)}', '3': f'{frac(AYYOUB)} km/h'}, answerSource='computed')
NOW1_V = F(5400) / (12 * 60)
NOW1_KMH = NOW1_V * F(3600, 1000)
NOW2_T = F(260) / 80
assert NOW1_V == q('7,5') and NOW1_KMH == 27 and NOW2_T == q('3,25') and hm(NOW2_T) == '3h15min'
el('now-93-1', 'now', 93, 'دورك الآن (p. 93) — 1',
   'قطع درّاج مسافة 5400m في مُدّة 12min. احسب سرعته المتوسطة بـ m.s⁻¹ ثُمّ بـ Km.h⁻¹.', answer={'m/s': fr(NOW1_V), 'km/h': frac(NOW1_KMH)}, answerSource='computed')
el('now-93-2', 'now', 93, 'دورك الآن (p. 93) — 2',
   'قطعت سيارة 260km بسرعة متوسطة قدرها 80Km.h⁻¹. احسب مُدّة المسافة المقطوعة بالساعات و الدقائق.', answer={'hours': fr(NOW2_T), 'hm': hm(NOW2_T)}, answerSource='computed')

# ── pp. 94–96 : أوظّف تعلّماتي ─────────────────────────────────────────────────────────────────────
EX1_TABLES = {
    '①': ([0, 2, 6], [2, 3, 5]), '②': ([1, 4, 9], [2, 4, 6]), '③ (tel qu’imprimé)': ([1, 4, 6], [1, 2, 3]),
    '③ (corrigé : 2 au lieu de 1)': ([2, 4, 6], [1, 2, 3]), '④': ([1, 2, 4], [-10, -20, -40]),
}
EX1_PROP = {k: prop(*v) is not None for k, v in EX1_TABLES.items()}
assert EX1_PROP == {'①': False, '②': False, '③ (tel qu’imprimé)': False, '③ (corrigé : 2 au lieu de 1)': True, '④': True}
assert aligned([(0, 2), (2, 3), (6, 5)]) and not aligned([(1, 2), (4, 4), (9, 6)]) and prop([2, 4, 6], [1, 2, 3]) == F(1, 2) and prop([1, 2, 4], [-10, -20, -40]) == -10
el('ex-1', 'exercise', 94, 'أوظّف تعلّماتي — 1',
   'إليك أربعة جداول وأربعة بيانات: 1) صِل كُل جدول بالبيان المناسب له. 2) حدّد من بين الجداول الآتية الجدول الذي يُمثّل وضعية تناسبية. '
   'الجدول ①: (0 ، 2 ، 6 ← 2 ، 3 ، 5) ؛ ②: (1 ، 4 ، 9 ← 2 ، 4 ، 6) ؛ ③: (1 ، 4 ، 6 ← 1 ، 2 ، 3) ؛ ④: (1 ، 2 ، 4 ← −10 ، −20 ، −40).',
   verified=True,
   figure={'graphs (reading order in the scan)': {
       'G1 (top left)': 'points (2;1), (4;2), (6;3) : droite croissante issue de O (unité 1 sur les deux axes)',
       'G2 (top right)': 'points (1;−10), (2;−20), (4;−40) : droite décroissante issue de O (axe des ordonnées vers le bas)',
       'G3 (middle)': 'points (1;2), (4;4), (9;6) : courbe pointillée concave (racine carrée) — non alignés',
       'G4 (bottom)': 'points (0;2), (2;3), (6;5) : droite croissante coupant l’axe des ordonnées en 2 — alignés mais pas avec O'}},
   answer={'1 (matching)': {'①': 'G4', '②': 'G3', '③': 'G1', '④': 'G2'},
           '2 (proportional)': ['③ (après correction)', '④ (coefficient −10)'],
           'check': {k: ('oui' if v else 'non') for k, v in EX1_PROP.items()}}, answerSource='computed',
   reading='tableaux et quatre graphiques relus à 330 dpi. Le graphique G1 passe par (2;1), (4;2), (6;3) alors que le tableau ③ imprime « 1 4 6 / 1 2 3 » : voir discrepancies. '
           'Tableau ④ à valeurs négatives : proportionnel (coefficient −10) ; le livre attend « un » tableau au singulier, l’autre cas est signalé.')
CHEESE = [(50, 6), (100, 12), (150, 18)]
assert prop(*zip(*CHEESE)) == F(3, 25) and aligned_with_origin(CHEESE)
FAT = F(3, 25)
el('ex-2', 'exercise', 94, 'أوظّف تعلّماتي — 2',
   'يُمثّل التمثيل البياني الآتي كُتلة المواد الدسمة المحتواة في جُبن. 1) هل الوضعية هي وضعية تناسبية؟ اشرح. 2) ما أقصى كمية من هذا الجبن يُمكن تناولها بحيث لا تتعدى كمية المواد الدسمة 6g؟ '
   '3) ما هي النسبة المئوية للمواد الدسمة في هذا الجبن؟ 4) ما كمية المواد الدسمة المحتوية في 740g من هذا الجبن؟',
   verified=True,
   figure={'axes': 'x : كتلة الجبن (g) 50, 100, 150 ; y : كتلة المواد الدسمة (g) 6, 12, 18', 'points': CHEESE, 'line': 'droite pointillée issue de O'},
   answer={'1': 'oui : points alignés avec l’origine', 'coefficient': fr(FAT), '2': f'{frac(F(6) / FAT)} g', '3': pct(FAT), '4': f'{fr(740 * FAT)} g'}, answerSource='computed',
   reading='graphique relu à 330 dpi : points (50;6), (100;12), (150;18) sur une droite issue de O.')
CANS = (F(35, 10), 5, F(21, 10), 3)
assert prop([5, 3], [q('3,5'), q('2,1')]) == q('0,7') and 8 * q('0,7') == q('5,6') != q('5,8') and 13 * q('0,7') == q('9,1')
el('ex-3', 'exercise', 94, 'أوظّف تعلّماتي — 3',
   'إليك معلومات تتعلّق بعُلب (5 عُلب تزن 3,5kg ؛ 3 عُلب تزن 2,1kg). 1) التأكيدات الآتية صحيحة أم خاطئة؟ اشرح. فاطمة: « الكُتلة بدلالة عدد العُلب، تُمثّل بنقاط في استقامية مع مبدإ المعلم ». '
   'مريم: « 8 علب تزن 5,8kg ». 2) ما هي كُتلة 13 عُلبة؟', verified=True,
   figure={'picture': '5 boîtes identiques marquées 3,5 Kg ; 3 boîtes marquées 2,1 Kg'},
   answer={'coefficient': '0,7 kg par boîte', 'Fatima': 'vrai (proportionnel : 3,5/5 = 2,1/3 = 0,7)', 'Maryam': 'faux : 8 × 0,7 = 5,6 kg (≠ 5,8 kg)', '2': f'{fr(13 * q("0,7"))} kg'},
   answerSource='computed', reading='dessin relu à 330 dpi : 5 boîtes ↔ 3,5 Kg ; 3 boîtes ↔ 2,1 Kg.')
FUEL = [(100, q('6,5')), (200, 13), (400, 26)]
A_FUEL = prop(*zip(*FUEL))
assert A_FUEL == q('0,065') and A_FUEL * 200 == 13 and A_FUEL * 520 == q('33,8') and F(52) / A_FUEL == 800
el('ex-4', 'exercise', 94, 'أوظّف تعلّماتي — 4',
   'التمثيل البياني الآتي يُمثّل كمية البنزين المستهلكة بدلالة المسافة المقطوعة. 1) هل هذا البيان يُمثّل وضعية تناسبية؟ 2) ما هي كمية البنزين اللازمة لقطع مسافة 200km؟ '
   '3) احسب كمية البنزين اللازمة لقطع 520km؟ 4) ما هي المسافة التي يُمكن قطعها إذا استهلكنا 52L؟', verified=True,
   figure={'axes': 'x : المسافة (km) 100, 200, 300, 400 ; y : كمية البنزين (L) graduations 6, 13, 26', 'points': [[100, 6.5], [200, 13], [400, 26]], 'line': 'droite pointillée issue de O'},
   answer={'1': 'oui : points alignés avec l’origine', 'coefficient': f'{fr(A_FUEL)} L par km (6,5 L pour 100 km)', '2': '13 L', '3': f'{fr(A_FUEL * 520)} L', '4': f'{frac(F(52) / A_FUEL)} km'},
   answerSource='computed',
   reading='graphique relu à 330 dpi : points (200;13) et (400;26) sur les graduations 13 et 26 ; le premier point (100 ; ≈6,5) est un peu AU-DESSUS de la graduation imprimée « 6 » : voir discrepancies.')
BARREL = [(15, 40), (30, 80), (45, 120), (120, 320)]
A_BAR = prop(*zip(*BARREL))
assert A_BAR == F(8, 3) and F(250) / A_BAR == q('93,75')
el('ex-5', 'exercise', 95, 'أوظّف تعلّماتي — 5',
   'إليك معلومات متعلّقة ببراميل لتخزين الماء: (الارتفاع cm: 15 ، 30 ، 45 ، 120 ← السِعة L: 40 ، 80 ، 120 ، 320). 1) مثّل الجدول أعلاه في معلم (على محور الفواصل: خُذ لكل 10cm مربعا واحدا وعلى محور '
   'التراتيب: خُذ لكل 40L مربعا واحدا). 2) بيِّن إن كان جدول تناسبية بإجرائين: • باستعمال البيان. • باستعمال الجدول. 3) باستعمال البيان، أعط تقديرا لارتفاع برميل سعته 250L ثُمّ حدّد هذه '
   'النتيجة حسابيا.', verified=True,
   answer={'squares (x/10 cm ; y/40 L)': [[frac(F(x, 10)), frac(F(y, 40))] for x, y in BARREL], '2': 'points alignés avec l’origine (graphique) ; rapports 40/15 = 80/30 = 120/45 = 320/120 = 8/3 (tableau)',
           'coefficient': f'{frac(A_BAR)} L par cm (≈ 2,67)', '3': f'≈ 94 cm au graphique ; calcul : 250 × 3/8 = {fr(F(250) / A_BAR)} cm'}, answerSource='computed',
   reading='tableau relu à 220 dpi : 15, 30, 45, 120 / 40, 80, 120, 320.')
SIX = [(7, 10), (3, 5), (45, 50), (3, 8), (30, 80), (12, 20)]
el('ex-6', 'exercise', 95, 'أوظّف تعلّماتي — 6', 'عبّر بنسب مئوية عن كل مما يلي: أ) 7 من 10 ب) 3 من 5 جـ) 45 من 50 د) 3 من 8 هـ) 30 من 80 و) 12 من 20', verified=True,
   answer={k: pct(F(a, b)) for k, (a, b) in zip(LET6, SIX)}, answerSource='computed')
assert [F(a, b) * 100 for a, b in SIX] == [70, 60, 90, q('37,5'), q('37,5'), 60]
el('ex-7', 'exercise', 95, 'أوظّف تعلّماتي — 7', 'تُباع لعبة بـ 380DA، بعد مدة ارتفع سعرها بـ 15%. 1) ما هو مبلغ الزيادة؟ 2) ما هو السعر الجديد للعبة؟', verified=True,
   answer={'1': f'{fr(380 * q("0,15"))} DA', '2': f'{fr(380 * q("1,15"))} DA'}, answerSource='computed')
assert 380 * q('0,15') == 57 and 380 * q('1,15') == 437
el('ex-8', 'exercise', 95, 'أوظّف تعلّماتي — 8', 'انتقل سعر بضاعة من 3000DA إلى 3060DA. ما هي النسبة المئوية لهذه الزيادة؟', verified=True,
   answer={'increase': '60 DA', 'rate': pct(F(60, 3000))}, answerSource='computed')
assert F(3060 - 3000, 3000) == q('0,02')
W9 = (10 * q('0,9') + 15 * q('0,8')) / 25
assert W9 == q('0,84')
el('ex-9', 'exercise', 95, 'أوظّف تعلّماتي — 9',
   'يحتاج أيوب لتحضير مشروب إلى 10cL من عصير البرتقال و 15cL من عصير المشمش. يحتوي عصير البرتقال على 90% من الماء وعصير المشمش على 80% من الماء. ما هي النسبة المئوية للماء في هذا المشروب؟',
   verified=True, answer={'water': '9 + 12 = 21 cL', 'drink': '25 cL', 'rate': pct(W9)}, answerSource='computed')
SLEEP = F(6) + F(30, 60) + 24 - (F(23) + F(30, 60))
assert SLEEP == 7
el('ex-10', 'exercise', 95, 'أوظّف تعلّماتي — 10',
   'يحتاج الطفل المُراهق إلى 8 ساعات نوم على الأقل. نام أيوب على الساعة 23h30min واستيقظ على الساعة 6h30min. عبّر بنسبة مئوية عن نقص النوم عند أيوب.', verified=True,
   answer={'slept': '7 h', 'missing': '1 h', 'rate': pct((8 - SLEEP) / 8) + ' des 8 h nécessaires'}, answerSource='computed')
assert (8 - SLEEP) / 8 == q('0,125')
G11 = (q('0,45') * 40 + q('0,45') * 40) / 80
assert G11 == q('0,45')
el('ex-11', 'exercise', 95, 'أوظّف تعلّماتي — 11',
   'القسم 3م1: يوجد به 45% بنات من أصل 40 تلميذا وتلميذة. القسم 3م2: يوجد به 45% بنات من أصل 40 تلميذا وتلميذة. ما هي النسبة المئوية للبنات في القسمين معا؟', verified=True,
   answer={'girls': '18 + 18 = 36 sur 80', 'rate': pct(G11)}, answerSource='computed',
   reading='transcrit tel qu’imprimé (les deux classes portent 45 % de 40 : données identiques, donc 45 % — voir discrepancies).')
PASS = (q('0,6') * 70 + q('0,9') * 50) / 120
assert q('0,6') * 70 == 42 and q('0,9') * 50 == 45 and PASS == q('0,725')
el('ex-12', 'exercise', 95, 'أوظّف تعلّماتي — 12',
   'خلال مباراة في كرة القدم، نجح الفريق الوطني في استغلال الكرة في الشوط الأول بـ 60% من أصل 70 تمريرة، وخلال الشوط الثاني نجح في استغلال الكرة بـ 90% من أصل 50 تمريرة. ما النسبة المئوية للتمريرات التي نجح في استغلالها هذا الفريق؟',
   verified=True, answer={'success': '42 + 45 = 87 sur 120', 'rate': pct(PASS)}, answerSource='computed')
EARTH = q('360,5') / q('0,7')
assert EARTH == 515
el('ex-13', 'exercise', 95, 'أوظّف تعلّماتي — 13 (جغرافيا)',
   'تُغطي المُحيطات تقريبا 70% من سطح الكرة الأرضية. مساحة سطح المُحيطات هي 360,5 مليون كيلومتر مربع. أعط تقديرا لمساحة سطح الكرة الأرضية؟', verified=True,
   answer={'earth surface': f'{frac(EARTH)} millions de km²'}, answerSource='computed')
CO2 = F(15, 10) / q('7,5')
assert 1 - CO2 == q('0,8')
el('ex-14', 'exercise', 95, 'أوظّف تعلّماتي — 14 (التنمية المستدامة)',
   'يواجه العالم خطورة التدهور البيئي الذي يجب التغلب عليه مع عدم التخلي عن حاجات التنمية الاقتصادية وكذلك المساواة والعدل الاجتماعي. حسب إحصائيات 2007 فإنّ الاستهلاك السنوي للفرد الأوروبي 7,5 طن من '
   'ثاني أكسيد الكربون CO₂. يعتقد الخُبراء أنّ ديمومة حياة الأرض مرهون بأن تكون كمية الاستهلاك 1,5 طن. • عبّر بنسبة مئوية عن التخفيض الضروري لاستهلاك CO₂ عند الفرد الأوروبي.', verified=True,
   answer={'reduction': '7,5 − 1,5 = 6 t', 'rate': pct(1 - CO2)}, answerSource='computed')
assert 200 * q('1,075') == 215
el('ex-15', 'exercise', 95, 'أوظّف تعلّماتي — 15', 'عندما يتجمّد الماء، فإنّ حجمه يزداد بـ 7,5%. ما حجم قطعة الجليد التي نحصل عليها بعد تجميد 200L من الماء؟', verified=True,
   answer={'ice': f'{fr(200 * q("1,075"))} L'}, answerSource='computed')
COAST = F(1644, 6343 + 1644)
assert approx(COAST * 100, 1) == '20,6'
el('ex-16', 'exercise', 96, 'أوظّف تعلّماتي — 16',
   'يبلغ طول الحدود البرية الجزائرية حوالي 6343km وشريط ساحلي طوله حوالي 1644km. • احسب النسبة المئوية لما يُمثّله طول الساحل بالنسبة إلى مُحيط التراب الجزائري.', verified=True,
   answer={'perimeter': '6343 + 1644 = 7987 km', 'rate': f'1644/7987 ≈ {approx(COAST * 100, 1)} %'}, answerSource='computed',
   reading='« مُحيط التراب » lu comme la somme frontières terrestres + littoral (7987 km) ; l’autre lecture 1644/6343 ≈ 25,9 % est signalée.')
# ── السرعة المتوسطة (H) — transcription brève
CONV17 = [('4h5min', F(4 * 60 + 5), 'min'), ('7h', F(420), 'min'), ('1h30min', F(90), 'min'), ('30s', F(1, 2), 'min'), ('0,1h', F(6), 'min'), ('15s', F(1, 4), 'min')]
assert q('0,1') * 60 == 6
el('ex-17', 'exercise', 96, 'أوظّف تعلّماتي — 17 (السرعة المتوسطة)', 'حوّل ما يلي ذهنيا إلى الدقائق. أ) 4h5min ب) 7h جـ) 1h30min د) 30s هـ) 0,1h و) 15s',
   answer={k: f'{fr(v)} min' for k, (_, v, _) in zip(LET6, CONV17)}, answerSource='computed')
C18 = [45, 12, 18, 30, 90, 15]
el('ex-18', 'exercise', 96, 'أوظّف تعلّماتي — 18', 'حوّل ما يلي ذهنيا إلى الساعات بكتابة عشريّة. أ) 45min ب) 12min جـ) 18min د) 30min هـ) 90min و) 15min',
   answer={k: f'{fr(F(m, 60))} h' for k, m in zip(LET6, C18)}, answerSource='computed')
C19 = ['2,4', '3,75', '4,9', '5,45', '2,5', '1,3']
el('ex-19', 'exercise', 96, 'أوظّف تعلّماتي — 19', 'حوّل ما يلي إلى الساعات والدقائق. أ) 2,4h ب) 3,75h جـ) 4,9h د) 5,45h هـ) 2,5h و) 1,3h',
   answer={k: hm(q(v)) for k, v in zip(LET6, C19)}, answerSource='computed')
Y20 = F(10) * 24 * 60 / 15
assert Y20 == 960
el('ex-20', 'exercise', 96, 'أوظّف تعلّماتي — 20',
   'نفترض أنّ سيارة تسير بسرعة ثابتة. إليك إنجاز مريم: (المسافة 10km ، y ؛ الزمن 15min ، 24h) y × 15 = 10 × 24 ومنه y = 10 × 24 / 15 — خطأ. اشرح لماذا أخطأت مريم.',
   answer={'error': 'elle mélange les unités : 15 min et 24 h ne sont pas dans la même unité (24 h = 1440 min)', 'correct': f'y = 10 × 1440 / 15 = {frac(Y20)} km'}, answerSource='computed')
EX21 = {'أ 4h45min': F(120) * q('4,75'), 'ب 2h': F(240), 'ج 1h30min': F(180)}
EX21T = {'أ 240km': F(240, 120), 'ب 105km': F(105, 120), 'ج 30km': F(30, 120)}
assert EX21['أ 4h45min'] == 570 and EX21T['أ 240km'] == 2 and EX21T['ج 30km'] == F(1, 4)
assert (F(105, 120) * 60) == F(105, 2)
el('ex-21', 'exercise', 96, 'أوظّف تعلّماتي — 21',
   'تسير سيارة بحركة منتظمة على الطريق السيار بسرعة 120Km.h⁻¹. 1) عبّر عن المسافة المقطوعة d بدلالة المدة الزمنية للتنقل t. 2) أحسب المسافات المقطوعة خلال: أ) 4h45min ب) 2h جـ) 1h30min. '
   '3) عبّر عن t بدلالة d، ثم احسب مُدد المسافات المقطوعة الآتية: أ) 240km ب) 105km جـ) 30km.',
   answer={'1': 'd = 120 t', '2': {k: f'{frac(v)} km' for k, v in EX21.items()},
           '3': {'t': 't = d/120', 'أ 240km': '2 h', 'ب 105km': '7/8 h = 52,5 min = 52 min 30 s', 'ج 30km': '1/4 h = 15 min'}}, answerSource='computed')
S22 = {'الزرافة 51 km/h': F(51), 'الفيل 12 m/s': F(12) * F(3600, 1000), 'الأيل 20 m/s': F(20) * F(3600, 1000)}
assert S22['الفيل 12 m/s'] == q('43,2') and S22['الأيل 20 m/s'] == 72
el('ex-22', 'exercise', 96, 'أوظّف تعلّماتي — 22', 'رتّب الحيوانات الآتية من السريع إلى البطيء: الزرافة 51km.h⁻¹ ؛ الفيل 12m.s⁻¹ ؛ الأيل 20m.s⁻¹.',
   answer={'in km/h': {k: fr(v) for k, v in S22.items()}, 'order': 'الأيل (72) > الزرافة (51) > الفيل (43,2)'}, answerSource='computed')
el('ex-23', 'exercise', 96, 'أوظّف تعلّماتي — 23',
   'في ما يلي، احسب السرعة المتوسطة للحيوانات، مُحدّدا الوحدة. 1) يقطع حصان مسافة 21km في 3h. 2) يقطع كلب مسافة 24m في 4s. 3) يقطع عصفور مسافة 7km في 20min.',
   answer={'1': '7 km/h', '2': '6 m/s', '3': f'{frac(F(7) / F(1, 3))} km/h'}, answerSource='computed')
assert F(21, 3) == 7 and F(24, 4) == 6 and F(7) / F(1, 3) == 21
assert F(8000, 20) == 400
el('ex-24', 'exercise', 96, 'أوظّف تعلّماتي — 24',
   'تُحسب سرعة تدفّق مياه نهر، بقسمة حجم الماء بـ m³ على مدّة التدفق بالثانية. 1) ما هي الوِحدة المُعبّرة عن سرعة التدفق؟ 2) يَصُبُّ أحد الأنهار 8000m³ في البحر خلال 20s. احسب ذهنيا سرعة تدفّق هذا النهر؟',
   answer={'1': 'm³/s (m³.s⁻¹)', '2': '400 m³/s'}, answerSource='computed')
assert F(14) / q('2,5') == q('5,6') and q('5,6') * q('1,75') == q('9,8')
el('ex-25', 'exercise', 96, 'أوظّف تعلّماتي — 25', 'قطع أيوب 14km خلال 2h30min. 1) احسب سرعته المتوسطة بـ km/h. 2) بهذه السرعة، ما المسافة المقطوعة خلال 1h45min؟',
   answer={'1': '5,6 km/h', '2': '9,8 km'}, answerSource='computed')
assert F(9) / F(1, 4) == 36 and 36 * q('1,25') == 45 and F(q('10,8')) / 36 * 60 == 18
el('ex-26', 'exercise', 96, 'أوظّف تعلّماتي — 26',
   'يُمكن للدلفين أن يقطع مسافة 9km خلال 15min. 1) احسب سرعته المتوسطة بـ km/h. 2) بهذه السرعة: أ) ما المسافة التي يقطعها هذا الدلفين خلال 1h15min؟ ب) ما المُدّة التي يستغرقها الدلفين ليقطع مسافة 10,8km؟ تُعطى النتيجة بالدقائق.',
   answer={'1': '36 km/h', '2a': '45 km', '2b': '18 min'}, answerSource='computed')
assert q('0,2') * 40 == 8 and F(12, 60) == q('0,2')
el('ex-27', 'exercise', 96, 'أوظّف تعلّماتي — 27',
   'تستغرق فاطمة مُدّة 12min للذهاب إلى العمل بواسطة حافلة. سرعتها المتوسطة 40km/h. أ) عبّر عن 12min بالساعات في كتابة عشرية. ب) ما المسافة التي تفصل إقامة فاطمة عن العمل؟',
   answer={'أ': '0,2 h', 'ب': '8 km'}, answerSource='computed')
assert F(q('11,7') * 1000, 36) == q('325') and F(325) * 60 / 1000 == q('19,5')
el('ex-28', 'exercise', 96, 'أوظّف تعلّماتي — 28', 'مُتزحلق على الأمواج، قطع على نفس الموجة مسافة 11,7km في مُدّة 36min. احسب سرعته المتوسطة بـ m/min، ثُمّ بـ km/h.',
   answer={'m/min': '325', 'km/h': '19,5'}, answerSource='computed')

# ── p. 97 : أؤكّد تعلّماتي ─────────────────────────────────────────────────────────────────────────
el('self-1', 'self', 97, 'أؤكّد تعلّماتي — 1',
   'اختر البيان الذي يمثل وضعية تناسبية… (ثلاثة بيانات في معلم 0…4 : (1) على اليمين، (2) في الوسط، (3) على اليسار)', verified=True,
   options=['droite décroissante : points (0;3), (1;2), (2;1), (3;0)', 'droite croissante issue de O : points (1;1), (2;2), (3;3), (4;4)',
            'courbe convexe issue de O : points ≈(1,4;1), (2;2), ≈(2,5;3,3)'],
   correct=[1],
   truth=[aligned_with_origin([(0, 3), (1, 2), (2, 1), (3, 0)]), aligned_with_origin([(1, 1), (2, 2), (3, 3), (4, 4)]), aligned_with_origin([(F(14, 10), 1), (2, 2), (F(25, 10), F(33, 10))])],
   answer='le graphique du milieu (droite issue de O, coefficient 1)', answerSource='computed', retour='90',
   reading='p. 97 relue à 220 dpi : unité de 1 carreau ; le premier graphique coupe l’axe des ordonnées en 3 (non proportionnel), le deuxième passe par O, le troisième est une courbe.')
assert E[-1]['truth'] == [False, True, False]
el('self-2', 'self', 97, 'أؤكّد تعلّماتي — 2',
   'إليك الجدول الآتي: (4 ، 8 ، 12 ← 10 ، 20 ، 30). التمثيل البياني لهذا الجدول في معلم هو… أ) نقاط في استقامية مع مبدإ المعلم. ب) نقاط ليست في استقامية. جـ) نقاط من مستقيم لا يمر من المبدإ. اختر الإجابة الصحيحة من بين الإجابات الآتية:',
   verified=True, options=['أ', 'ب', 'جـ'], correct=[0], truth=[prop([4, 8, 12], [10, 20, 30]) is not None, False, False],
   answer={'correct': 'أ', 'coefficient': '5/2'}, answerSource='computed', retour='90')
assert prop([4, 8, 12], [10, 20, 30]) == F(5, 2)
G3 = (30 * q('0,2') + 20 * q('0,8')) / 50
assert 30 * q('0,2') == 6 and 20 * q('0,8') == 16 and G3 == q('0,44')
el('self-3', 'self', 97, 'أؤكّد تعلّماتي — 3',
   'القسم 3م1 تعداده 30 و 20% منه بنات. القسم 3م2 تعداده 20 و 80% منه بنات. ما هي النسبة المئوية للبنات في القسمين معا؟', verified=True,
   answer={'girls': '6 + 16 = 22 sur 50', 'rate': pct(G3)}, answerSource='computed', retour='90 و 91')
assert F(10500 - 8400, 10500) == q('0,2')
el('self-4', 'self', 97, 'أؤكّد تعلّماتي — 4', 'لباس ثمنه 10500DA، بيع بعد تخفيض بثمن 8400DA. ما هي النسبة المئوية لهذا التخفيض؟', verified=True,
   answer={'reduction': '2100 DA', 'rate': pct(F(2100, 10500))}, answerSource='computed', retour='90 و 91')
assert 200 * q('0,9') * q('1,1') == 198
el('self-5', 'self', 97, 'أؤكّد تعلّماتي — 5', 'غرض ثمنه 200DA، انخفض ثمنه بـ 10% ثُمّ ارتفع بـ 10%. ما هو ثمنه الجديد؟', verified=True,
   answer={'after −10%': '180', 'after +10%': fr(200 * q('0,9') * q('1,1')) + ' DA'}, answerSource='computed', retour='90 و 91')
assert F(84) / q('0,6') == 140
el('self-6', 'self', 97, 'أؤكّد تعلّماتي — 6', 'ينطلق أيوب في رحلة فيقطع مسافة 84km أي 60% من مسافة هذه الرحلة. ما هي مسافة هذه الرحلة؟', verified=True,
   answer={'trip': f'{frac(F(84) / q("0,6"))} km'}, answerSource='computed', retour='90 و 91')
assert q('27') * F(1000, 3600) == q('7,5')
el('self-7', 'self', 97, 'أؤكّد تعلّماتي — 7', '27Km.h⁻¹ = ……. ضع العلامة x على الإجابة الصحيحة: 7,5m.s⁻¹ ؛ 9,72m.s⁻¹ ؛ 97,2m.s⁻¹',
   options=['7,5m.s⁻¹', '9,72m.s⁻¹', '97,2m.s⁻¹'], correct=[0], answer='7,5 m/s', answerSource='computed', retour='93')
assert F(12000, 8) / 60 == 25
el('self-8', 'self', 97, 'أؤكّد تعلّماتي — 8', 'يقطع أيوب بدراجته مسافة 12km بسرعة متوسطة قدرها 8m.s⁻¹. يقطع أيوب هذه المسافة في مُدّة…. 25min ؛ 30min ؛ 1h6min',
   options=['1h6min', '30min', '25min'], correct=[2], answer='1500 s = 25 min', answerSource='computed', retour='93')
assert F(42) / q('1,2') == 35
el('self-9', 'self', 97, 'أؤكّد تعلّماتي — 9', 'يقطع أيوب مسافة 42km في مُدّة 1h12min. ما هي سرعته المتوسطة؟', answer='35 km/h (1h12min = 1,2 h)', answerSource='computed', retour='92 و 93')
assert round(float(F(23) / q('4,25')), 2) == 5.41
el('self-10', 'self', 97, 'أؤكّد تعلّماتي — 10',
   'يمشي أيوب مسافة 5km خلال 1h15min ثُمّ يمشي مسافة 18km خلال 3h. سرعته المتوسطة هي… ضع العلامة x على الإجابة الصحيحة: ≃ 5,4km.h⁻¹ ؛ 5km.h⁻¹ ؛ 6km.h⁻¹',
   options=['6km.h⁻¹', '5km.h⁻¹', '≃ 5,4km.h⁻¹'], correct=[2], answer='23 km en 4,25 h = 92/17 ≈ 5,41 km/h', answerSource='computed', retour='92 و 93')

# ── pp. 98–99 : أتعمّق ─────────────────────────────────────────────────────────────────────────────
assert F(1) - F(1, 8) - F(1, 2) == q('0,375')
assert F(800) / 72 * F(3600, 1000) == 40 and F(18, 1) * F(1000, 3600) == 5
el('deep-30', 'exercise', 98, 'أتعمّق — 30 (أفكّر وأجيب)',
   'أجب بصحيح أو خاطئ مع التبرير. أ) في أحد الأندية الرياضية ثُمن الأنصار هم قُصّر ونصف الأنصار أعمارهم أكبر من 25 سنة. 37,5% هي النسبة المئوية للأنصار الذين تتراوح أعمارهم بين 18 سنة و 25 سنة. '
   'ب) تلزمنا مُدّة 1min12s لقطع مسافة 800m بسرعة متوسطة قدرها 40km/h. جـ) السرعة المتوسطة للدرّاج الذي يقطع مسافة 18km خلال ساعة واحدة هي أكبر تماما من سرعة سيارة يُتحكّم فيها عن بُعد تقطع 5m خلال 1s.',
   verified=True,
   answer={'أ': 'vrai : 1 − 1/8 − 1/2 = 3/8 = 37,5 %', 'ب': 'vrai : 800 m en 72 s = 100/9 m/s = 40 km/h', 'ج': 'faux : 18 km/h = 5 m/s (les deux vitesses sont ÉGALES)'},
   answerSource='computed', note='أ = pourcentage (N) ; ب et جـ = vitesses (H)')
GRAPH31 = [(0, 0), (1, 45), (2, 45), (5, 110)]
el('deep-31', 'exercise', 98, 'أتعمّق — 31 (قراءة وتحليل بيان)',
   'التمثيل البياني أدناه يُمثّل حجم الخرسانة التي تنتجها آلة بدلالة زمن تشغيلها. 1) ما هو حجم الخرسانة المنتجة: أ) خلال 1 ساعة؟ ب) بين الساعة الثانية والساعة الخامسة؟ 2) ماذا حصل بين الساعة الأولى والساعة الثانية؟ '
   '3) هل حجم الخرسانة المنتجة بهذه الآلة متناسب مع زمن تشغيلها؟', verified=True,
   figure={'axes': 'x : الزمن (h) 0…5 ; y : الحجم (m³) graduations 45 et 110', 'brokenLine': GRAPH31, 'dashed': 'tirets verticaux en x = 1, 2, 5 et horizontaux en y = 45 et y = 110'},
   answer={'1a': '45 m³', '1b': '110 − 45 = 65 m³', '2': 'le graphique est horizontal : aucun béton produit entre 1 h et 2 h (la machine ne produit pas), le volume reste 45 m³',
           '3': 'non : ce n’est pas une droite issue de O (segment, palier, puis segment de pente différente)'}, answerSource='computed',
   reading='graphique relu à 330 dpi : (0;0) → (1;45) → palier (2;45) → (5;110) ; tirets verticaux en 1, 2, 5 ; graduations 45 et 110 imprimées.')
assert F(45) / 1 != F(110 - 45, 5 - 2) and not aligned_with_origin(GRAPH31[1:])
B32 = F(15, 4) * 7
assert B32 == q('26,25')
el('deep-32', 'exercise', 98, 'أتعمّق — 32 (أين أضع النقطة؟)',
   'وضعت فاطمة على المعلم المُقابل النقطة A ثم أرادت أن تضع نقطة B بحيث تكون النقطتان A و B في استقامية مع مبدإ المعلم. إذا علمت أنّ فاصلة النقطة B هي 7 فما هو ترتيبها؟', verified=True,
   figure={'axes': 'x : 0…4 (graduation 1) ; y : graduations 10 et 20 (et traits intermédiaires)', 'A': [4, 15]},
   answer={'coefficient': '15/4 = 3,75', 'B': f'(7 ; {fr(B32)})'}, answerSource='computed',
   reading='repère relu à 330 dpi : A au-dessus de l’abscisse 4, à la graduation intermédiaire entre 10 et 20 (= 15).')
el('deep-33', 'exercise', 98, 'أتعمّق — 33 (أبرهن)',
   'في المعلم المُقابل، [Ot) نصف مستقيم يمر من المبدإ. M نقطة إحداثياها (x;y) و A نقطة فاصلتها 1 وترتيبها a على نصف المستقيم [Ot). 1) باستعمال خاصية المثلثين المعيّنين بمستقيمين متوازيين '
   'يقطعهما مستقيمان غير متوازيين، بيّن أنّ 1/x = a/y. 2) لماذا يُمكن أن نكتب y = ax ؟ 3) عمّ تُعبّر المُساواة y = ax ؟ 4) هل العلاقة بين إحداثيي النقطة M مرتبطة بموضع النقطة M؟ برّر. '
   '5) انقل وأتمم: إذا كانت نقط ………… مع مبدإ المعلم فإنّ ………… هذه النقط ………… مع ……………',
   verified=True,
   figure={'points': 'O(0;0), I(1;0), A(1;a) avec J(0;1) et a repéré sur l’axe des ordonnées, H(x;0), M(x;y) ; droites (AI) et (MH) parallèles (pointillés verticaux) ; [Ot) = demi-droite OAM'},
   answer={'1': 'triangles OIA et OHM : (AI) // (MH) ⟹ OI/OH = IA/HM, soit 1/x = a/y', '2': 'produit en croix : y = a·x', '3': 'les ordonnées sont proportionnelles aux abscisses, de coefficient a (ordonnée du point d’abscisse 1)',
           '4': 'non : la relation y = ax est la même pour TOUT point M de la demi-droite', '5': 'points ALIGNÉS avec l’origine du repère ⟹ leurs ORDONNÉES sont proportionnelles à leurs ABSCISSES (même rapport y/x = a)'},
   answerSource='computed',
   reading='figure relue à 330 dpi. Cet exercice repose sur la propriété de Thales (triangles à côtés parallèles), introduite à l’unité 9 « المثلثات » du livre : voir discrepancies.')
assert F(110 - 45, 3) == F(65, 3)
el('deep-34', 'exercise', 98, 'أتعمّق — 34 (عدّاد السيارة)',
   'يُشير العدّاد إلى 56782km عندما تنطلق سيارة على الساعة 12h30min، وعند وصولها على الساعة 14h10min نقرأ على العدّاد 56887km. ما هي السرعة المتوسطة بالكيلومتر في الساعة لهذه السيارة خلال هذا الانتقال؟',
   answer={'distance': '105 km', 'time': '1h40min = 5/3 h', 'speed': '63 km/h'}, answerSource='computed')
assert 56887 - 56782 == 105 and F(105) / F(5, 3) == 63
assert 330 * 6 == 1980 and F(9900, 330) == 30
el('deep-35', 'exercise', 99, 'أتعمّق — 35 (الصاعقة والبرق)',
   'ينتشر الصوت بسرعة 330m/s. يُرافق ظاهرة حدوث الصاعقة في فصل الشتاء مُشاهدة البرق وسماع دوي الرعد. 1) إذا سمعت صوت دوي الرعد بعد 6s من رؤية البرق، فما هي المسافة التي تفصلك عن المكان الذي سقطت فيه الصاعقة الرعدية؟ '
   '2) يتواجد أيوب على مسافة 9,9km من سقوط صاعقة رعدية. ما هي المدة الزمنية الفاصلة بين رؤيته للبرق وسماعه لدوي الرعد؟',
   answer={'1': '1980 m', '2': '30 s'}, answerSource='computed', reading='la question 35 commence en bas de la page 98 et se termine en haut de la page 99')
EARTH_SUN = F(95, 10) * 10 ** 8 / (365 * 24 * 3600)
assert approx(EARTH_SUN, 0) == '30'
el('deep-36', 'exercise', 99, 'أتعمّق — 36 (سرعة دوران الأرض حول الشمس)',
   'تدُور الأرض حول الشمس خلال سنة (365 يوما). عندما تدور دورة كاملة فإنّها تقطع مسافة 9,5 × 10⁸ Km. أحسب سرعة دوران الأرض حول الشمس بالكيلومتر في الثانية. تُدوّر النتيجة إلى الوحدة.',
   answer={'seconds in a year': '31 536 000', 'speed': f'≈ {float(EARTH_SUN):.2f} km/s → {approx(EARTH_SUN, 0)} km/s'.replace('.', ',')}, answerSource='computed')
EQ = 2 * pi * 6371
assert round(EQ) == 40030 and abs(EQ - 40030.2) < 0.1
V37 = F(40030, 24)
el('deep-37', 'exercise', 99, 'أتعمّق — 37 (دوران الأرض حول نفسها)',
   'يُقدّر نصف القطر المتوسط للأرض بـ 6371km. نعلم أنّ الأرض تدور دورة كاملة حول نفسها خلال 24h. 1) يتواجد رجل على سطح الأرض على مستوى خط الاستواء، بيّن أنّه يقطع حوالي 40030km خلال 24h. 2) حدّد سرعته المتوسطة بـ km/h.',
   answer={'1': f'2 × π × 6371 ≈ {EQ:.1f} km ≈ 40 030 km'.replace('.', ','), '2': f'40030/24 ≈ {approx(V37, 0)} km/h'}, answerSource='computed')
assert F(6, 12) == F(1, 2)
el('deep-38', 'exercise', 99, 'أتعمّق — 38 (ساعة الوصول)',
   'ينطلق أيوب بدراجته من منزله على الساعة 7h55min بسرعة 12km/h متوجها إلى المتوسطة التي تبعد عن منزله بمسافة 6km. على أي ساعة يلتحق بالمتوسطة؟',
   answer={'duration': '6/12 = 0,5 h = 30 min', 'arrival': '8h25min'}, answerSource='computed')
assert F(3875) / q('1,25') == 3100 and 3875 * q('0,75') == q('2906,25') and 3100 * q('1,25') * q('0,75') == q('2906,25')
el('deep-39', 'exercise', 99, 'أتعمّق — 39 (ارتفاع ثُمّ انخفاض للأسعار)',
   '1) اشترى شخص معطفا في فترة ارتفعت فيها الأسعار بـ 25%. دفع 3875DA ثمنا لهذا المعطف. كم كان ثمنه قبل ارتفاع الأسعار؟ 2) بعد فترة انخفضت الأسعار بنسبة 25%. ما هو الثمن الجديد للمعطف؟', verified=True,
   answer={'1': f'{frac(F(3875) / q("1,25"))} DA (3875 ÷ 1,25)', '2': f'{fr(3875 * q("0,75"))} DA (3875 × 0,75 ; idem 3100 × 1,25 × 0,75)'}, answerSource='computed',
   reading='question 2 lue comme « la baisse de 25 % s’applique au prix 3875 DA » : résultat 2906,25 DA (même valeur en repartant de 3100 DA).')
P40 = F(20800) * q('0,8') * q('0,9')
assert P40 == 14976 and 1 - P40 / 20800 == q('0,28') and 20800 * q('0,9') * q('0,8') == P40
el('deep-40', 'exercise', 99, 'أتعمّق — 40 (تخفيضان متتاليان)',
   'تُباع غسّالة بـ 20800DA. خضع سعرها إلى تخفيضين متتاليين في إحدى الفترات بـ 20% ثم بـ 10%. 1) ما هو السعر الجديد للغسّالة؟ 2) ما هي النسبة المئوية الكلية للتخفيض؟ '
   '3) إذا كان التخفيض بـ 10% أولا ثمّ بـ 20% ثانيا هل يكون سعر الغسّالة هو السعر نفسه الذي تحصّلت عليه في السؤال 1؟', verified=True,
   answer={'1': f'{frac(F(20800) * q("0,8"))} puis {frac(P40)} DA', '2': pct(1 - P40 / 20800) + ' (pas 30 %)', '3': 'oui : 20800 × 0,9 × 0,8 = 14976 (le produit des facteurs ne dépend pas de l’ordre)'},
   answerSource='computed')
W70 = q('9,8') * 70
assert W70 == 686 and prop([3, 10, 25, 40, 55], [q('5,1'), 17, q('42,5'), 68, q('93,5')]) == q('1,7')
el('deep-41', 'exercise', 99, 'أتعمّق — 41 (الكتلة والوزن)',
   'وزن جسم في مكان ما مُرتبط بكتلته وتسارع الجاذبية ويُعبَّر عن هذا بعلاقة نيوتن p = mg حيث P: هو وزن هذا الجسم في هذا المكان معبَّرًا عنه بالنيوتن (N) (هو مقدار قوة جذب الكوكب لهذا الجسم). m كُتلة الجسم بـ kg. '
   'g تسارُع جاذبية هذا الكوكب. 1) على الأرض تسارع جاذبية الأرض هي g_T = 9,8. احسب الوزن (بالنيوتن) على الأرض لرجل كُتلته 70kg. 2) العلاقة p = mg تبقى صحيحة على كوكب القمر. الجدول الآتي يُعطي قيمًا لكُتل تُقابلها '
   'أوزانها على سطح كوكب القمر (الكتلة kg: 3 ، 10 ، 25 ، 40 ، 55 ← الوزن N: 5,1 ، 17 ، 42,5 ، 68 ، 93,5). أ) هل الجدول جدول تناسبية؟ ب) احسب تسارُع جاذبية القمر (نرمزه بـ g_L). '
   'جـ) هل صحيح أنّنا نَزنُ على القمر 6 مرات أقل من الأرض؟', verified=True,
   answer={'1': f'{frac(W70)} N', '2a': 'oui : le rapport poids/masse vaut toujours 1,7', '2b': 'g_L = 1,7 N/kg', '2c': f'9,8/1,7 ≈ {approx(F(98, 17), 2)} : « 6 fois moins » est une approximation (≈ 5,8), pas une égalité'},
   answerSource='computed')
assert F(20) / F(1, 4) == 80 and F(35 - 20) / F(3, 4) == 20 and F(35) / F(5, 4) == 28
el('deep-42', 'exercise', 99, 'أتعمّق — 42 (أفهم بيانا / أستخرج معلومات)',
   'البيان الآتي يُمثّل المسافة المقطوعة بدلالة الزمن لمركبة. احسب السرعة المتوسطة لهذه المركبة في مُختلف المراحل.',
   figure={'axes': 'x : التوقيت 2h, 2h15, 2h30, 2h45, 3h, 3h15 ; y : المسافة (km) 10, 20, 30, 35', 'points': {'A': ['2h', 0], 'B': ['2h15', 20], 'C': ['2h30', 20], 'D': ['3h15', 35]}, 'shape': 'ligne brisée A-B-C-D (BC horizontal)'},
   answer={'AB': '20 km en 15 min = 80 km/h', 'BC': '0 km/h (arrêt de 15 min)', 'CD': '15 km en 45 min = 20 km/h'}, answerSource='computed',
   reading='graphique relu à 330 dpi : A(2h;0), B(2h15;20), C(2h30;20), D(3h15;35).')

# ── p. 100 : أدمج تعلّماتي ──────────────────────────────────────────────────────────────────────────
T_TOT, D40 = F(912) / 100, F(912) * q('0,4')
T40 = F(3) + F(2, 60) + F(24, 3600)
V40 = D40 / T40
REM_D, REM_T = 912 - D40, T_TOT - T40
V_REM = REM_D / REM_T
LITRES = F(912) * 5 / 100
COST = LITRES * q('35,72')
assert T40 == q('3,04') and D40 == q('364,8') and V40 == 120 and V_REM == 90 and COST == q('1628,832') and round(COST) == 1629
el('integration', 'integration', 100, 'أدمج تعلّماتي — وضعية (رحلة من القالة إلى تلمسان)',
   'انطلقت عائلة مريم في رحلة على متن سيارة من القالة إلى تلمسان على الطريق السيار غرب شرق وكان الأب قد قرّر أن تكون سرعته المتوسطة خلال هذه الرحلة 100km/h، لكنه في البداية قطع 40% من المسافة الكُليّة '
   'في مُدّة 3h 2min 24s. هل يُواصل رحلته بنفس السرعة؟ إذا كان الجواب بالنفي فما هي السرعة الثابتة التي يجب أن يقود بها السيارة كي يحترم قراره؟ • ما هي تكلفة البنزين خلال هذه الرحلة؟ (تُدوّر إلى الوحدة من '
   'الدينار). (استعمل الوثائق المُرفقة بهذا النص). الوثائق: الطريق القالة ← تلمسان 912km ؛ استهلاك البنزين: 5L/100Km ؛ سعر اللتر من البنزين: 35,72DA. '
   'توجيهات: قراءة وفهم الوضعية: عمّ يتحدّث النص؟ رتّب المعطيات ثُمّ حذف التعليمة (أو التعليمات). تحليل الوضعية واختيار استراتيجية حل مناسبة: ما هي المقادير المُتداخلة في النص؟ ما علاقتها ببعضها؟ ما المقصود بالسرعة المتوسطة؟ '
   'ماذا نحسب في البداية؟ ماذا نوظّف؟ ولماذا؟ هل هذا كاف؟ إذن عمّ نبحث فيما بعد؟ تنفيذ استراتيجية الحل المختارة: أفكّر في تقسيم ثلاث مراحل ثُمّ أُجيب… أستخدم الوحدات بعناية. أختار العملية المناسبة لكل مرحلة. أُنجز الحسابات. أفسّر نتائج الحسابات. أحرّر حلا. '
   'حل مختصر: السرعة الثابتة التي يجب أن يقود بها السيارة كي يحترم قراره هي 90km/h. تكلفة البنزين 1629DA.',
   answer={'planned total time': f'912/100 = {fr(T_TOT)} h', 'first part': f'{fr(D40)} km en {fr(T40)} h (3h 2min 24s) → {frac(V40)} km/h ≠ 100 : non, il doit ralentir',
           'remaining': f'{fr(REM_D)} km en {fr(REM_T)} h', 'constant speed': f'{frac(V_REM)} km/h', 'fuel': f'{fr(LITRES)} L × 35,72 = {fr(COST)} → {round(COST)} DA'},
   answerSource='computed', note='Le livre donne 90 km/h et 1629 DA : RECALCULÉS ici, identiques (1628,832 arrondi à l’unité).',
   reading='carte relue à 220 dpi : « 912Km » entre القالة et تلمسان (passant par مدينة الجزائر) ; encadré jaune « استهلاك البنزين : 5L/100Km ; سعر اللتر من البنزين : 35,72DA ».')
BAT = F(26) / q('0,22')
assert approx(BAT, 0) == '118'
el('evaluation', 'integration', 100, 'وضعية للتقويم',
   'يُصدِر مؤشر بطارية كمبيوتر محمول صوتا ثُمّ تظهر رسالة على الشاشة تفيد بقُرب نفاد البطارية. أتساءل، ما المُدّة الزمنية التي يُمكن أن أعمل خلالها بهذا الكمبيوتر بعيدا عن مأخذ التيار الكهربائي حينما تكون البطارية مشحونة كُليّا. '
   '(صورة الشاشة: « 22% » و « باقي 26 min »). أعط تقديرا لذاتية هذا الكمبيوتر حينما تكون البطارية مشحونة كُليّا.',
   answer={'estimate': f'26 min ↔ 22 % : 26 / 0,22 ≈ {approx(BAT, 0)} min ≈ 1h58min, soit environ 2 h'}, answerSource='computed',
   reading='photo relue à 220 dpi : « 22 % » (icône batterie) et « 26 min » (« باقي 26 min ») ; la page 100 est d’image dégradée (blocs de pixels roses autour du texte) mais les chiffres sont nets.')

# ── p. 101 : ICT ───────────────────────────────────────────────────────────────────────────────────
SPEEDS = list(range(20, 140, 10))
D1S = [F(v) / q('3,6') for v in SPEEDS]
D2S = [F(v) ** 2 / (254 * q('0,8')) for v in SPEEDS]
assert approx(D1S[0], 2) == '5,56' and approx(D2S[0], 2) == '1,97' and approx(D1S[1], 2) == '8,33' and approx(D2S[1], 2) == '4,43'
el('ict', 'ict', 101, 'أوظّف تكنولوجيات الإعلام والاتصال — مسافة التوقّف والأمان من الحوادث',
   'نشاط: يسير سائق عربة مُحترس بسرعة مُعبّر عنها بـ V km/h. 1) حساب مسافة رد الفعل: حين يُشاهد هذا السائق عائقا أمامه فإنّ 1s هي مُدّة ضرورية تسمح له بالتريّث قبل اتخاذ أي إجراء. خلال هذه المُدّة تكون العربة قد قطعت '
   'مسافة d1 (يُعبّر عنها بالمتر) وتُسمى مسافة رد الفعل وتُعطى بالعلاقة d1 = V/3,6. اشرح لماذا تُعطى هذه المسافة خلال 1s بهذه العلاقة. • انقل على ورقة الحساب اكمل مُعطيات الورقة الحسابية (V: 20 ، 30 ، … ، 130 km/h ؛ الخلايا B1…M1)، '
   'ثُمّ احجز في الخلية B2 الطلبة المناسبة لحساب مسافة رد الفعل d1(m) من أجل V = 20km/h. ومن ثمّ عمّم محتوى الخلية B2 إلى M2. 2) حساب مسافة الفرملة: d2 هي المسافة التي تقطعها العربة خلال المُدّة الزمنية التي يضغط فيها السائق على دواسة الفرامل. '
   'نقبل أنّ قيمة مقرّبة لهذه المسافة تُعطى بالعلاقة d2 = V² / (254 × C) حيث d2 يُعبّر عنها بـ (m) و V بـ (km/h) و C مُعامل الالتصاق يتعلّق بوضع الطريق. في كُل ما يلي نعتبر الطريق جافًا إذن C = 0,8. '
   '• عُد إلى ورقة الحساب السابقة واملأ الخلية A3 كما هو مبيّن على الورقة المقابلة. ثُمّ احجز في الخلية B3 الطلبة =B1^2/(254*0,8) ومن ثمّ عمّم محتوى الخلية B3 إلى M3. '
   '3) حساب مسافة التوقّف: نرمز بـ d لمسافة التوقّف، لدينا d = d1 + d2. أ) عُد مرّة أخرى إلى ورقة الحساب السابقة واملأ الخلية A4 كما هو مبيّن على الورقة المقابلة. ثُمّ احجز في الخلية B4 الطلبة =B2+B3 ومن ثمّ عمّم محتوى الخلية B4 إلى M4. '
   'ب) هل مسافة التوقّف مُتناسبة مع السرعة؟ اشرح. جـ) ما السلوكيات الواجب أن تُحرّك مشاعر وتصرّفات السائق عند قراءته لمسافات التوقّف هذه؟',
   answer={'speeds': SPEEDS, 'd1 (m)': [approx(x, 2) for x in D1S], 'd2 (m)': [approx(x, 2) for x in D2S],
           'd = d1 + d2 (m)': [approx(a + b, 2) for a, b in zip(D1S, D2S)],
           'proportional': 'non : d1 est proportionnelle à V (V/3,6) mais d2 croît comme V² ; d = d1 + d2 n’est pas proportionnelle à V (les distances d’arrêt augmentent plus vite que la vitesse)'},
   answerSource='computed', reading='tableur : ligne 1 « V(km/h) » 20…130, lignes 2–4 « d1(m) », « d2(m) », « d(m) » ; valeurs imprimées B2 = 5,56 ; C2 = 8,33 ; B3 = 1,97 ; C3 = 4,43 (retrouvées par le calcul).')
assert approx(D1S[0] + D2S[0], 2) == '7,52'  # 5,5556 + 1,9685 = 7,5241
assert len(SPEEDS) == 12

# ── destinations ───────────────────────────────────────────────────────────────────────────────────
T, N, H, S = 'tanasub-tamthil-bayani', 'nisba-miawiya-3am', 'haraka-muntazama-sura', 'wadiya-idmajiya-tanasubiya-sura'


def d(lesson, module=None, **kw):
    return {'lesson': lesson, 'module': module, **kw}


DEST = {
    '_comment': 'elementId → { lesson, module } ; `items` répartit un élément ; une leçon encore coming_soon est une destination EN ATTENTE (check-textbook-coverage.mjs). Modules de tanasub-tamthil-bayani et de nisba-miawiya-3am : 0 أستعدّ · 1 نشاط (un lab) · 2 معارف · 3 طريقة · 4 أتمرّن · 5–7 مسائل · 8 إختبار أولي ; `None` = leçon en attente ou banque d’exercices.',
    'objectives': d('unit', 'page'), 'challenge': d('unit', 'page'), 'opener': d(S),
    'prep': d(T, 0, items={'1-4-5-6': d(T, 0), '7-8-9': d(N, 0), '2-3-10': d(H)}),
    'act-1': d(T, 4, note='APPLICATION (guide §4ter) : la plateforme conçoit son propre lab d’entrée (points d’un tableau dans un repère) ; l’activité des trois magasins est posée en أتمرّن.'),
    'act-2': d(N, 4, note='APPLICATION (guide §4ter) : la plateforme conçoit son propre lab d’entrée sur le pourcentage ; les usages de la population sont posés en أتمرّن.'),
    'act-3': d(H), 'know-0': d(H),
    'know-1a': d(T, 2), 'know-1b': d(T, 2), 'method-1a': d(T, 3), 'method-1b': d(T, 3),
    'know-2a': d(N, 2), 'know-2b': d(N, 2), 'method-2': d(N, 3), 'now-91': d(N, 3),
    'know-3': d(H), 'method-3': d(H), 'method-4': d(H), 'now-93-1': d(H), 'now-93-2': d(H),
    **{f'ex-{n}': d(T, 4) for n in range(1, 6)},
    **{f'ex-{n}': d(N, 4) for n in range(6, 17)},
    **{f'ex-{n}': d(H) for n in range(17, 29)},
    'self-1': d(T, 8), 'self-2': d(T, 8),
    **{f'self-{n}': d(N, 8) for n in range(3, 7)},
    **{f'self-{n}': d(H) for n in range(7, 11)},
    'deep-30': d(N, 4, items={'a': d(N, 4), 'b-c': d(H)}),
    **{f'deep-{n}': d(T, 4) for n in (31, 32, 33, 41)},
    'deep-39': d(N, 4), 'deep-40': d(N, 4),
    **{f'deep-{n}': d(H) for n in (34, 35, 36, 37, 38, 42)},
    'integration': d(S), 'evaluation': d(S), 'ict': d(S),
}

DISCREPANCIES = [
    {'elementId': 'opener', 'kind': 'scan', 'text': 'Le cadre historique de la page 86 (sous « سأتعلّم ») est presque entièrement détruit par des blocs de pixels : ILLISIBLE, non transcrit, non reconstitué (seuls des mots isolés — sablier, loch, nœuds, vitesse des navires — se devinent).'},
    {'elementId': 'challenge', 'kind': 'reading', 'text': 'Le graphique du défi est quasi vide dans le scan : seuls les repères 4 (s) et 24 (m) et les tirets du point (4 ; 24) sont nets ; la droite issue de O n’est visible qu’en pointillés très pâles. Réponses déduites du coefficient 24/4 = 6 m/s (1284 m ; 250 s = 4 min 10 s) — le livre ne les imprime pas.'},
    {'elementId': 'prep', 'kind': 'scan', 'text': 'Surlignage jaune de la colonne (2) sur la page 87 : artefact du scan (colonne entière surlignée, y compris des options fausses comme 6 ÷ 4 = 1,5 à l’item 3 et 2,8×0,4/7,6 à l’item 5), PAS une clé. Réponses recalculées : 1 → (2),(3) ; 2 → (2) ; 3 → (1),(2) ; 4 → (2) ; 5 → (3) ; 6 → (1),(3) ; 7 → (1) ; 8 → (1),(2) ; 9 → (3) ; 10 → (2),(3).'},
    {'elementId': 'prep', 'kind': 'ambiguity', 'text': 'Item 4 « معامل التناسبية المُشار إليه في الجدول » : le sens kg → DA (600/7) est lu ; le sens inverse (7/600) est l’option (1) fausse. Item 10 : « 1,30h » (option 1) est un piège (1,30 h = 1 h 18 min).'},
    {'elementId': 'act-1', 'kind': 'reading', 'text': 'Dans le tableau des trois magasins le libellé « عدد العلب » est imprimé à GAUCHE des nombres 2, 6, 12, 14 (inhabituel). Magasin 3 lu « 5 DA la boîte jusqu’à 8 boîtes, 2 DA à partir de la 9e » : 10, 30, 48, 52 DA.'},
    {'elementId': 'know-1b', 'kind': 'reading', 'text': 'Deuxième graphique (droite décroissante) : le troisième point est lu à (3 ; ≈35) ; la valeur exacte n’a pas d’importance (la droite coupe l’axe des ordonnées en 50, donc ne passe pas par O).'},
    {'elementId': 'ex-1', 'kind': 'misprint', 'text': 'Le tableau ③ est imprimé « 1 4 6 / 1 2 3 » mais le graphique correspondant (droite issue de O) passe par (2 ; 1), (4 ; 2), (6 ; 3) : lire « 2 4 6 / 1 2 3 » (coefficient 1/2). Tel qu’imprimé, ③ ne serait pas proportionnel (1/1 ≠ 2/4). Texte conservé tel qu’imprimé ; correction : première colonne (2 ; 1).'},
    {'elementId': 'ex-1', 'kind': 'ambiguity', 'text': 'La question 2 est au singulier (« الجدول الذي يُمثّل… ») mais DEUX tableaux sont proportionnels : ③ (corrigé) et ④ (coefficient négatif −10 : points alignés avec l’origine). La leçon décidera si le coefficient négatif est admis (il ne décrit pas une grandeur physique).'},
    {'elementId': 'ex-4', 'kind': 'misprint', 'text': 'Le premier point du graphique est à (100 ; ≈6,5) mais la graduation imprimée au bord de l’axe est « 6 » (à ≈6,1) : lu 6,5 (cohérent avec 13 L pour 200 km et 26 L pour 400 km ; 52 L ⇒ 800 km exactement).'},
    {'elementId': 'ex-11', 'kind': 'misprint', 'text': 'Les deux classes sont imprimées avec les MÊMES données (45 % de 40) : réponse triviale 45 % ; conservé tel quel. La leçon peut proposer ses propres effectifs.'},
    {'elementId': 'ex-16', 'kind': 'ambiguity', 'text': '« نسبة طول الساحل بالنسبة إلى مُحيط التراب الجزائري » : lu 1644 / (6343 + 1644) = 1644/7987 ≈ 20,6 %. L’autre lecture (1644/6343 ≈ 25,9 %) est écartée.'},
    {'elementId': 'deep-33', 'kind': 'scope', 'text': 'L’exercice démontre y = ax par la propriété de Thales (triangles OIA et OHM). Le livre étudie cette propriété à l’unité 9 « المثلثات » (pp. 128–149), APRÈS l’unité 6 : la leçon T doit l’aborder sans Thales (rapport de 1 à x) ou le présenter en enrichissement.'},
    {'elementId': 'deep-33', 'kind': 'reading', 'text': 'Question 5 : les pointillés sont laissés à compléter ; la complétion proposée (« points alignés avec l’origine ⟹ ordonnées proportionnelles aux abscisses ») est CALCULÉE/dérivée, pas imprimée.'},
    {'elementId': 'deep-39', 'kind': 'ambiguity', 'text': 'Question 2 : « بعد فترة انخفضت الأسعار بنسبة 25% » lue comme une baisse de 25 % appliquée au prix payé (3875 DA) : 2906,25 DA ; même résultat en repartant du prix initial 3100 DA (× 1,25 × 0,75).'},
    {'elementId': 'deep-41', 'kind': 'scope', 'text': 'Question jـ : 9,8 / 1,7 ≈ 5,76 ; « 6 fois moins » est donc une approximation, pas une égalité exacte.'},
    {'elementId': 'integration', 'kind': 'check', 'text': 'Solution brève du livre (90 km/h ; 1629 DA) RECALCULÉE : 40 % de 912 = 364,8 km en 3,04 h (3h 2min 24s) = 120 km/h ≠ 100 ; il reste 547,2 km en 9,12 − 3,04 = 6,08 h ⇒ 90 km/h ; carburant 912 × 5/100 = 45,6 L × 35,72 = 1628,832 ⇒ 1629 DA. Concordant.'},
    {'elementId': 'evaluation', 'kind': 'estimate', 'text': 'Le livre ne donne pas de réponse : 26 min restantes pour 22 % ⇒ 26/0,22 ≈ 118 min, soit environ 2 h d’autonomie (estimation, pas valeur exacte).'},
    {'elementId': 'ict', 'kind': 'reading', 'text': 'Tableur : les valeurs imprimées B2 = 5,56, C2 = 8,33, B3 = 1,97, C3 = 4,43 sont retrouvées par le calcul ; le texte imprime « اكمل » et « الطلبة » (= الصيغة) tels quels. d est calculé ici pour V = 20…130 km/h ; la question jـ (comportements) est ouverte.'},
    {'elementId': 'unit', 'kind': 'scope', 'text': 'Pages 86–101 complètes. Il n’y a pas d’exercice 29 : la page 98 (أتعمّق) s’ouvre sur le 30 « أفكر وأجيب » ; les exercices 1–28 sont les « أوظّف تعلّماتي » (pp. 94–96), les items 1–10 les « أؤكّد تعلّماتي » (p. 97). Les éléments de la leçon haraka-muntazama-sura et de la synthèse sont transcrits plus brièvement (verified: false).'},
]

doc = {
    '_comment': [
        'EXTRACTION CANONIQUE du manuel scolaire officiel — 3AM, الجيل الثاني (منشورات الشهاب 2017), unité 6 « التناسبية ».',
        'Source : docs/official-book-pdfs/كتاب الرياضيات للسنة الثالثة متوسط الجيل الثاني.pdf, pages 86 à 101 du livre (PDF 86 à 101).',
        'Ce fichier est LA source de vérité pédagogique de l’unité ; tout contenu cite un `id` d’ici via `source.elementId`.',
        'Transcription VISUELLE ; réponses calculées (Fraction exacte) dans build-extraction.py, `answerSource: computed`.',
        'Généré par docs/sources/3am/unit6/build-extraction.py — ne pas éditer à la main.',
    ],
    'unitCode': 'tanasubiya-sura',
    'textbook': {'title': 'كتاب الرياضيات — السنة الثالثة من التعليم المتوسط', 'generation': 'الجيل الثاني', 'unitNumber': 6,
                 'unitTitle': 'التناسبية', 'pages': {'first': 86, 'last': 101}, 'pdfPageOffset': 0,
                 'sections': ['سأتعلّم في هذا الباب', 'تحدّي', 'أستعدّ', 'أنشطة', 'معارف', 'طرائق', 'دورك الآن', 'أوظّف تعلّماتي', 'أؤكّد تعلّماتي', 'أتعمّق', 'أدمج تعلّماتي', 'وضعية للتقويم', 'أوظّف تكنولوجيات الإعلام والاتصال']},
    'frozenAt': '2026-10-21',
    'terminology': {'note': 'Le manuel écrit « التناسبية », « جدول تناسبية », « مُعامل التناسبية », « التمثيل البياني », « نقاط في استقامية مع مبدإ المعلم », « الفاصلة / الترتيب », « النسبة المئوية », « الحركة المنتظمة », « السرعة المتوسطة », « السرعة اللحظية ».',
                    'terms': ['تناسبية', 'جدول تناسبية', 'مُعامل التناسبية', 'تمثيل بياني', 'استقامية', 'مبدأ المعلم', 'فاصلة', 'ترتيب', 'نسبة مئوية', 'حركة منتظمة', 'سرعة متوسطة']},
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
for e in E:
    dest = DEST[e['id']]
    lessons = {dest['lesson'], *(s['lesson'] for s in dest.get('items', {}).values())}
    if lessons & {T, N}:
        assert e.get('verified') is True, f'{e["id"]} va à {lessons & {T, N}} sans relecture'
assert [i for i in ids if i.startswith('ex-')] == [f'ex-{n}' for n in range(1, 29)]
assert [i for i in ids if i.startswith('self-')] == [f'self-{n}' for n in range(1, 11)]
assert [i for i in ids if i.startswith('deep-')] == [f'deep-{n}' for n in range(30, 43)]

out = Path(__file__).with_name('extraction.json')
out.write_text(json.dumps(doc, ensure_ascii=False, indent=1, default=str) + '\n', encoding='utf-8')
cnt = {}
for k, v in DEST.items():
    if k != '_comment':
        cnt[v['lesson']] = cnt.get(v['lesson'], 0) + 1
print(f'{out} — {len(E)} éléments ; par destination principale : {cnt}')
