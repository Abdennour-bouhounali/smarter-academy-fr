#!/usr/bin/env python3
"""Génère docs/sources/3am/unit11/extraction.json — 3AM, unité 11 « خاصية فيثاغورس، جيب تمام زاوية »
(manuel الجيل الثاني, منشورات الشهاب 2017, pp. 166–181 ; PDF pages 168–183 : à partir de la page imprimée 149, PDF = page
imprimée + 2 — docs/sources/3am/textbook-map.json).

Transcription VISUELLE (pages rendues à 90 dpi, les exercices de la leçon khassiyat-fitaghuras relus à 160 dpi). Le texte arabe
est celui du manuel. Chaque longueur attendue est CALCULÉE ici en arithmétique EXACTE (Fraction : un carré décimal est un
rationnel ; une racine est exacte quand le radicande est le carré d’un décimal, sinon elle est gardée sous la forme √n et
arrondie avec Decimal) ; une lecture incertaine est dite dans `reading` et dans `discrepancies`.

L'unité est générée LEÇON PAR LEÇON (cycle moyen, phase 3, 2026-10-20). Première leçon générée : khassiyat-fitaghuras (ordre 48),
dont les éléments sont transcrits avec soin (`verified: True`) ; les éléments des trois autres leçons (aksiya-fitaghuras,
jayb-tamam-zawiya, hisab-jayb-tamam) et de la synthèse sont transcrits plus brièvement et marqués `verified: False` : leur leçon
les relira.

FRONTIÈRE (écrite une fois — les deux premières leçons portent les mêmes items 3am.m4.r03 et 3am.m4.x1) :
  * khassiyat-fitaghuras = la propriété DIRECTE et sa CONTRAPOSÉE. Elle possède : « dans un triangle rectangle, le carré de
    l’hypoténuse est la somme des carrés des deux autres côtés » (معارف 1), son usage pour CALCULER l’hypoténuse ou un côté de
    l’angle droit (طرائق « حساب طول ضلع في مثلث قائم »), la touche √ de la calculatrice pour la valeur exacte √n ou une valeur
    approchée (نشاط 2 — la touche seulement : la racine carrée est CONSTRUITE en 4AM par jidhr-tarbii, jamais ici), et la « نتيجة »
    de معارف 1 : si le carré du plus long côté N’EST PAS la somme des carrés des deux autres, le triangle N’EST PAS rectangle (moitié
    FEJ de la طريقة « المثلث قائم أم لا », دوري الآن 2-ب, تمرين 16-2, تمرين 17, أؤكّد 4 HDB).
  * aksiya-fitaghuras = la RÉCIPROQUE : prouver qu’un triangle EST rectangle (معارف 2, نشاط 3, moitié ABC de la même طريقة, les
    vérifications « قائم أم لا » dont la réponse est oui — 16-1, 20, 21, l’équerre des bâtisseurs 10, la corde à 12 nœuds du تمهيد),
    décider la nature d’un triangle dans les deux cas, et DISTINGUER propriété / réciproque dans une preuve.
  Règle de partage : un élément « قائم أم لا » est coupé par `items` (le cas « non » ici, le cas « oui » à la réciproque).

Usage : python3 docs/sources/3am/unit11/build-extraction.py
"""
import json
import math
from decimal import Decimal, ROUND_HALF_UP
from fractions import Fraction as F
from pathlib import Path


def q(s):
    """Un décimal du manuel (virgule) → Fraction exacte."""
    return F(str(s).replace(',', '.'))


def dec(x, places=None):
    """Une Fraction → texte décimal à virgule (exact si `places` est None et le décimal fini)."""
    if places is None:
        d = Decimal(x.numerator) / Decimal(x.denominator)
        s = format(d.normalize(), 'f')
    else:
        d = (Decimal(x.numerator) / Decimal(x.denominator)).quantize(Decimal(1).scaleb(-places), rounding=ROUND_HALF_UP)
        s = format(d, 'f')
    return s.replace('.', ',')


def exact_sqrt(x):
    """√x pour une Fraction ≥ 0 : la Fraction exacte si x est le carré d'un rationnel, sinon None."""
    n, d = x.numerator, x.denominator
    rn, rd = math.isqrt(n), math.isqrt(d)
    return F(rn, rd) if rn * rn == n and rd * rd == d else None


def sqrt_text(x, places=2):
    """√x : exact quand c'est possible, sinon « √x ≈ arrondi »."""
    r = exact_sqrt(x)
    if r is not None:
        return dec(r)
    return f'√{dec(x)} ≈ {dec(F(Decimal(math.sqrt(float(x))).quantize(Decimal("1e-12"))), places)}'


def hyp(a, b):
    return q(a) ** 2 + q(b) ** 2


def leg(h, a):
    return q(h) ** 2 - q(a) ** 2


def nature(a, b, c):
    """Les trois longueurs ; le plus long côté c. Rend (c², a² + b², rectangle ?)."""
    xs = sorted([q(a), q(b), q(c)])
    big = xs[2] ** 2
    rest = xs[0] ** 2 + xs[1] ** 2
    return big, rest, big == rest


E = []

# ── p. 166 : ouverture ───────────────────────────────────────────────────────────────────────────
E.append({'id': 'objectives', 'kind': 'objectives', 'page': 166, 'section': 'سأتعلّم في هذا الباب', 'verified': True,
          'items': ['معرفة خاصية فيثاغورس واستعمالها.', 'التعرّف على جيب تمام زاوية حادة في مثلث قائم.',
                    'تعيين القيمة المضبوطة أو قيمة مقرّبة لجيب تمام زاوية حادة، أو لزاوية بمعرفة جيب تمامها.',
                    'حساب أطوال بتوظيف جيب تمام زاوية.']})
E.append({'id': 'opener', 'kind': 'aside', 'page': 166, 'section': 'تمهيد', 'verified': True,
          'text': 'فيثاغورس (580-495 ق.م) هو فيلسوف وعالم رياضيات يوناني، عُرفت باسمه الخاصية الرياضية « في مثلث قائم، مساحة المربع المنشأ على الضلع المقابل للزاوية القائمة يساوي مجموع مساحتي المربعين المنشأين على الضلعين الآخرين » رغم أنها استعملت من قبل من طرف المصريين والبابليين. كان المصريون يستعملون حبلا مكوّنا من 12 قطعة متقايسة محدّدة بعقد، يقومون بوصل طرفي الحبل وطيّه حول ثلاث عقد بكيفية تسمح بتشكيل مثلثات خاصة.',
          'figure': 'حبل مغلق بثلاث عشرة عقدة مرقّمة 1…13، ومثلث ABC من حبل طول أضلاعه 4 و 3 و 5 قطع يمسكه رجل.',
          'answer': {'rope': '3 + 4 + 5 = 12 ; 3² + 4² = 5²'}, 'answerSource': 'computed'})
assert 3 ** 2 + 4 ** 2 == 5 ** 2 and 3 + 4 + 5 == 12
E.append({'id': 'challenge', 'kind': 'challenge', 'page': 166, 'section': 'تحدّي', 'verified': True,
          'text': 'يُعدّ كوكب الزُّهرة ثاني كواكب المجموعة الشمسية قربا من الشمس وأقربها إلى الأرض. مداره حول الشمس ليس دائريا تماما. يمكن رؤيته من على سطح الأرض فقط قبل الشروق أو بعد المغيب بوقت قصير لذلك يطلق عليه أحيانا تسمية نجم الصبح أو نجم المساء، وعند ظهوره في تلك الفترة يكون أسطع جسم مضيء في السماء. حين يكون كوكب الزهرة أبعد ما يمكن عن الشمس، يُشكّل معها ومع الأرض زاوية قائمة، عندئذ تُقدّر الزاوية α بحوالي 46°. احسب المسافة بين الزهرة والشمس.',
          'figure': 'الأرض والزهرة والشمس: مثلث قائم في الزهرة، الزاوية α عند الأرض، المسافة بين الأرض والشمس 1,4966 × 10⁸ km.',
          'answer': {'note': 'sin α relève de la 4AM ; en 3AM : distance Terre–Vénus = 1,4966 × 10⁸ × cos 46° ≈ 1,04 × 10⁸ km, puis Vénus–Soleil par Pythagore ≈ 1,08 × 10⁸ km'},
          'answerSource': 'computed'})
_ev = 1.4966e8 * math.cos(math.radians(46))
_vs = math.sqrt(1.4966e8 ** 2 - _ev ** 2)
assert round(_ev / 1e8, 2) == 1.04 and round(_vs / 1e8, 2) == 1.08

# ── p. 167 : أستعدّ ───────────────────────────────────────────────────────────────────────────────
PREP = [
    {'n': 1, 'question': 'الوتر في مثلث قائم هو:', 'options': ['أطول ضلع', 'أقصر ضلع', 'الضلع المقابل للزاوية القائمة'], 'correct': [0, 2],
     'why': 'الوتر يقابل الزاوية القائمة، وهو أطول أضلاع المثلث القائم'},
    {'n': 2, 'question': '3,7² = …', 'options': ['3,7 × 2', '3,7 × 3,7', '13,69'], 'correct': [1, 2], 'why': f'3,7 × 3,7 = {dec(q("3,7") ** 2)}'},
    {'n': 3, 'question': '6² + 4² = …', 'options': ['10²', '20', '52'], 'correct': [2], 'why': f'36 + 16 = {6 ** 2 + 4 ** 2} ≠ 100'},
    {'n': 4, 'question': '10² − 4² = …', 'options': ['6²', '84', '36'], 'correct': [1], 'why': f'100 − 16 = {10 ** 2 - 4 ** 2}'},
    {'n': 5, 'question': 'المثلث الذي أطوال أضلاعه 5cm ، 3,2cm ، 3,2cm هو مثلث:', 'options': ['متساوي الساقين', 'متقايس الأضلاع', 'لا يمكن تحديد نوعه'], 'correct': [0],
     'why': 'ضلعان متقايسان (3,2cm)'},
    {'n': 6, 'question': 'في الشكل الآتي (مربعان طولا ضلعيهما 4cm و 3cm) مجموع مساحتي المربعين تساوي:', 'options': ['28cm²', '25cm²', '49cm²'], 'correct': [1],
     'why': f'16 + 9 = {4 ** 2 + 3 ** 2} cm²'},
    {'n': 7, 'question': 'طول ضلع مربع مساحته 64cm² يساوي:', 'options': ['(64 ÷ 2)cm', '16cm', '8cm'], 'correct': [2], 'why': '8 × 8 = 64'},
    {'n': 8, 'question': 'في المثلث القائم ABC (قائم في A، الزاوية B قيسها 37°):', 'options': ['Ĉ = 90° − 37°', 'B̂ و Ĉ زاويتان متتامتان', 'B̂ و Ĉ زاويتان متكاملتان'], 'correct': [0, 1],
     'why': 'مجموع زوايا المثلث 180° والزاوية القائمة 90°'},
    {'n': 9, 'question': 'إذا كان α قيس زاوية حادة فإنّ:', 'options': ['0 < α < 90', '90 < α < 180', '180 < α < 360'], 'correct': [0], 'why': 'تعريف الزاوية الحادة'},
    {'n': 10, 'question': 'إذا كان x/6 = 5 فإنّ:', 'options': ['x = 6 × 5', 'x = 5/6', 'x/5 = 6'], 'correct': [0, 2], 'why': 'x = 30 ، و 30/5 = 6'},
    {'n': 11, 'question': 'إذا كان 4/x = 7 فإنّ:', 'options': ['x = 4 × 7', '4 = 7x', 'x = 4/7'], 'correct': [1, 2], 'why': '4 = 7x ومنه x = 4/7'},
]
assert q('3,7') ** 2 == q('13,69') and 6 ** 2 + 4 ** 2 == 52 and 10 ** 2 - 4 ** 2 == 84 and 4 ** 2 + 3 ** 2 == 25 and 8 * 8 == 64
E.append({'id': 'prep', 'kind': 'prerequisites', 'page': 167, 'section': 'أستعدّ', 'verified': True,
          'instruction': 'جد الإجابة الصحيحة (أو الإجابات الصحيحة) في كل حالة، مبرّرا إياها.', 'items': PREP, 'answerSource': 'computed',
          'reading': 'Tableau à trois colonnes de réponses ; plusieurs bonnes réponses possibles (1, 2, 8, 10, 11).'})

# ── p. 168 : أنشطة 1–3 ────────────────────────────────────────────────────────────────────────────
E.append({'id': 'act-1', 'kind': 'activity', 'number': 1, 'page': 168, 'section': 'أنشطة', 'title': 'خاصية فيثاغورس', 'verified': True,
          'text': 'في الشكل المقابل، ABC مثلث قائم في A أضلاعه [AB] ، [AC] و [BC]. 1) أنجز مثيلا للشكل المقابل مستعملا الورق الشفاف. 2) قم بقص المربع الأزرق والأجزاء الأربعة من المربع البني وفق الخطوط المتقطعة. 3) تأكّد أنه باستعمال الأجزاء الخمسة السابقة يمكن تغطية سطح المربع البنفسجي بالضبط. 4) استنتج أنه في المثلث ABC القائم في A، المساواة BC² = AB² + AC² صحيحة.',
          'figure': 'مثلث ABC قائم في A ؛ مربع بنفسجي على الوتر [BC] ، مربع أزرق (شفاف) على [AC] ، مربع برتقالي على [AB] مقسوم بخطين متقطعين إلى أربعة أجزاء (تقطيع Perigal).',
          'answer': {'conclusion': 'BC² = AB² + AC²'}, 'answerSource': 'textbook'})
SQ = {'0,81': q('0,81'), '49': F(49), '16': F(16)}
E.append({'id': 'act-2', 'kind': 'activity', 'number': 2, 'page': 168, 'section': 'أنشطة', 'title': 'اللمسة √', 'verified': True,
          'text': '1) ثلاثة مربعات مساحاتها على الترتيب 16cm² ، 49cm² ، 0,81cm² . احسب ذهنيا طول ضلع كل مربع. 2) a طول ضلع مربع مساحته 26cm². اشرح لماذا يمكن القول إنّ a محصور بين العددين 5 و 6. يقول يونس: إنّ اللمسة √ الموجودة على الآلة الحاسبة تُعطي قيمة تقريبية للعدد a. هل هذا صحيح؟ برّر جوابك. 3) أعط القيمة المضبوطة أو قيمة تقريبية للعدد b في كل حالة مما يأتي: أ) b² = 144 ب) b² = 28,09 جـ) b² = 32,04',
          'answer': {'sides': {k: dec(exact_sqrt(v)) for k, v in SQ.items()}, 'a': '5² = 25 < 26 < 36 = 6² ; √26 ≈ 5,099 (valeur approchée : 26 n’est pas un carré parfait)',
                     'b': {'144': dec(exact_sqrt(F(144))), '28,09': dec(exact_sqrt(q('28,09'))), '32,04': sqrt_text(q('32,04'), 2)}},
          'answerSource': 'computed'})
assert exact_sqrt(F(16)) == 4 and exact_sqrt(F(49)) == 7 and exact_sqrt(q('0,81')) == q('0,9') and exact_sqrt(F(26)) is None
assert exact_sqrt(F(144)) == 12 and exact_sqrt(q('28,09')) == q('5,3') and exact_sqrt(q('32,04')) is None
E.append({'id': 'act-3', 'kind': 'activity', 'number': 3, 'page': 168, 'section': 'أنشطة', 'title': 'الخاصية العكسية لفيثاغورس', 'verified': False,
          'text': '1) أنشئ مثلثا ABC بحيث AB = 3,9cm ، AC = 5,2cm ، BC = 6,5cm. 2) قارن بين AB² + AC² و BC². 3) D النقطة التي تحقق في آن واحد الشروط الثلاثة الآتية: AD = 3,9cm ، (AD) ⊥ (AC) ، B و D تقعان في جهتين مختلفتين بالنسبة إلى (AC). احسب CD، ثمّ استنتج نوع المثلث ABC.',
          'answer': {'AB2+AC2': dec(hyp('3,9', '5,2')), 'BC2': dec(q('6,5') ** 2), 'CD': '6,5', 'nature': 'ABC قائم في A'}, 'answerSource': 'computed'})
assert hyp('3,9', '5,2') == q('6,5') ** 2

# ── p. 169 : أنشطة 4–6 ────────────────────────────────────────────────────────────────────────────
E.append({'id': 'act-4', 'kind': 'activity', 'number': 4, 'page': 169, 'section': 'أنشطة', 'title': 'جيب تمام زاوية حادّة', 'verified': False,
          'text': '1) ارسم مثلثا EFR قائما في R. 2) ما هما الزاويتان الحادّتان في هذا المثلث؟ 3) ما هما ضلعا الزاوية REF؟ أحد الضلعين هو وتر المثلث، ما هو؟ الضلع الآخر يُسمّى الضلع المجاور للزاوية REF. 4) حدّد الضلع المجاور للزاوية RFE. أ) ارسم مثلثا قائما قيس إحدى زواياه 35°. ب) قم بالقياسات اللازمة لتحسب: طول الضلع المجاور للزاوية 35° / طول الوتر. قارن ما توصلت إليه مع ما وجده زملاؤك. • في الشكل المقابل المثلثان ABC و MBN قائمان في النقطتين A و M على الترتيب. أ) اشرح لماذا BA/BM = BC/BN. ب) استنتج أنّ BA/BC = BM/BN. النسبة BA/BC تُسمّى جيب تمام الزاوية B ونرمز إليها بالرمز cos B̂.'})
E.append({'id': 'act-5', 'kind': 'activity', 'number': 5, 'page': 169, 'section': 'أنشطة', 'title': 'حساب جيب تمام زاوية حادّة باستعمال الحاسبة', 'verified': False,
          'text': '• لحساب قيمة تقريبية لـ cos 41° مثلا، نضغط من اليسار إلى اليمين على: cos 41 = (أو 41 cos =) يظهر على الشاشة 0.75470958 ، يمكن أن نكتب cos 41° ≃ 0,75. • أعط قيمة مقرّبة إلى الجزء من 10 لكل من: 1) cos 43° 2) cos 30° 3) cos 15° 4) cos 77°',
          'answer': {d: dec(F(Decimal(math.cos(math.radians(d))).quantize(Decimal('1e-12'))), 1) for d in (43, 30, 15, 77)}, 'answerSource': 'computed'})
E.append({'id': 'act-6', 'kind': 'activity', 'number': 6, 'page': 169, 'section': 'أنشطة', 'title': 'حساب قيس زاوية عُلم جيب تمامها باستعمال الحاسبة', 'verified': False,
          'text': '• لحساب قيمة القيس α لزاوية حادة علما أنّ cos α = 0,7 مثلا، نضغط من اليسار إلى اليمين على: 2nde cos 0,7 = أو SHIFT cos 0,7 = يظهر على الشاشة 45.572996 يمكن أن نكتب α ≃ 46°. • أعط القيمة التامة أو قيمة مقرّبة إلى الجزء من عشرة بالدرجات لقيس زاوية جيب تمامها: 1) 0,6 2) 0,5 3) 0,046 4) 0,0001',
          'answer': {c: dec(F(Decimal(math.degrees(math.acos(float(q(c))))).quantize(Decimal('1e-9'))), 1) for c in ('0,6', '0,5', '0,046', '0,0001')}, 'answerSource': 'computed'})

# ── p. 170 : معارف 1–2 ────────────────────────────────────────────────────────────────────────────
E.append({'id': 'know-1', 'kind': 'knowledge', 'number': 1, 'page': 170, 'section': 'معارف', 'title': 'خاصية فيثاغورس', 'verified': True,
          'text': 'إذا كان مثلث قائما، فإنّ مربع طول وتره يُساوي مجموع مربعي طولي ضلعيه الآخرين. مثال: المثلث ABC قائم في A ووتر هذا المثلث هو الضلع [BC] فالمساواة BC² = AB² + AC² صحيحة. يُمكن ترجمة ما جاء في المثال بالمخطط الآتي: نعلم أنّ المثلث ABC قائم في A ← حسب خاصية فيثاغورس ← نستنتج أنّ BC² = AB² + AC². ملاحظات: • خاصية فيثاغورس لا تُطبق إلا في المثلثات القائمة. • تسمح خاصية فيثاغورس بحساب طول ضلع في مثلث قائم بمعلومية طولي الضلعين الآخرين. نتيجة: إذا كان في مثلث، مربعُ أطولِ أضلاعه لا يساوي مجموع مربعي طولي الضلعين الآخرين فإنّ هذا المثلث غير قائم.',
          'figure': 'مثلث ABC قائم في A (رمز الزاوية القائمة عند A)، الوتر [BC].'})
E.append({'id': 'know-2', 'kind': 'knowledge', 'number': 2, 'page': 170, 'section': 'معارف', 'title': 'الخاصية العكسية لفيثاغورس', 'verified': True,
          'text': 'إذا كان في مثلث مربعُ طول أحد الأضلاع مساويا مجموع مربعي طولي الضلعين الآخرين فإنّ هذا المثلث قائم. مثال: إذا كان في مثلث ABC المساواة BC² = AB² + AC² صحيحة ← الخاصية العكسية لفيثاغورس ← نستنتج أنّ المثلث ABC قائم في A. ملاحظة: تسمح الخاصية العكسية لفيثاغورس بإثبات أنّ مثلثا عُلمت أطوال أضلاعه الثلاثة قائم.'})

# ── p. 171 : طرائق ────────────────────────────────────────────────────────────────────────────────
M1a = hyp('3,2', '2,4')
M1b = leg(5, 2)
assert M1a == 16 and exact_sqrt(M1a) == 4 and M1b == 21 and exact_sqrt(M1b) is None
E.append({'id': 'method-1', 'kind': 'method', 'number': 1, 'page': 171, 'section': 'طرائق', 'title': 'حساب طول ضلع في مثلث قائم', 'verified': True,
          'text': 'تمرين: احسب القيمة المضبوطة أو قيمة مقرّبة إلى الجزء من 100 للطول AB في كل مما يأتي: 1) ABC مثلث قائم في C حيث AC = 2,4cm و BC = 3,2cm. 2) ABC مثلث قائم في A حيث AC = 2cm و BC = 5cm. حل: 1) المثلث ABC قائم في C، حسب خاصية فيثاغورس: AB² = CB² + CA² أي AB² = 3,2² + 2,4² أي AB² = 10,24 + 5,76 ، AB² = 16 منه AB = 4cm (16 = 4 × 4). 2) المثلث ABC قائم في A، حسب خاصية فيثاغورس BC² = AB² + AC² ، 5² = AB² + 2² ، 25 = AB² + 4 ، AB² = 25 − 4 ، AB² = 21 ، AB ≃ 4,58cm. لحساب AB نستعمل الحاسبة: √ 21 = أو 21 √ = يظهر على الشاشة 4,58257569. طريقة: 1) يمكن رسم شكل بسيط بيد حرّة للمثلث القائم وتسمية رؤوسه. 2) كتابة مساواة فيثاغورس المناسبة، ثمّ إجراء الحسابات بعد التعويضات العددية. 3) يمكن عند الضرورة استعمال اللمسة √ على الآلة الحاسبة لتحديد الطول المطلوب.',
          'answer': {'1': dec(exact_sqrt(M1a)), '2': sqrt_text(M1b, 2), 'screen': '4,58257569'}, 'answerSource': 'computed'})
assert f'{math.sqrt(21):.8f}' == '4.58257569'
MA = nature('4,2', '5,6', 7)
MF = nature('3,5', '5,5', '6,5')
assert MA == (49, 49, True) and MF == (q('42,25'), q('42,5'), False)
E.append({'id': 'method-2', 'kind': 'method', 'number': 2, 'page': 171, 'section': 'طرائق', 'title': 'المثلث قائم أم لا', 'verified': True,
          'text': 'تمرين: هل المثلثان ABC و FEJ قائمان؟ برّر جوابك. (ABC: AB = 4,2cm ، BC = 7cm ، AC = 5,6cm ؛ FEJ: EF = 3,5cm ، EJ = 5,5cm ، FJ = 6,5cm). حل: بالنسبة إلى المثلث ABC: أطول الأضلاع هو [BC] ، نقارن بين BC² و AB² + AC² ؛ AB² + AC² = 4,2² + 5,6² = 17,64 + 31,36 = 49 ؛ BC² = 7² = 49 ؛ بما أنّ AB² + AC² = BC² فحسب الخاصية العكسية لفيثاغورس فالمثلث ABC قائم في A. بالنسبة إلى المثلث FEJ: أطول الأضلاع هو [FJ] ، نقارن بين FJ² و EF² + EJ² ؛ EF² + EJ² = 3,5² + 5,5² = 12,25 + 30,25 = 42,5 ؛ FJ² = 6,5² = 42,25 ؛ بما أنّ EF² + EJ² ≠ FJ² فحسب خاصية فيثاغورس، المثلث FEJ ليس قائما.',
          'items': {'ABC': {'sum': dec(MA[1]), 'square': dec(MA[0]), 'right': True}, 'FEJ': {'sum': dec(MF[1]), 'square': dec(MF[0]), 'right': False}},
          'answerSource': 'computed'})
N1 = hyp('0,7', '2,4')
assert exact_sqrt(N1) == q('2,5')
E.append({'id': 'now-1', 'kind': 'exercise', 'number': 1, 'page': 171, 'section': 'دوري الآن', 'verified': True,
          'text': 'EFG مثلث قائم في F، حيث FG = 0,7cm ، EF = 2,4cm. احسب القيمة المضبوطة للطول EG.',
          'answer': {'EG2': dec(N1), 'EG': dec(exact_sqrt(N1))}, 'answerSource': 'computed'})
N2a = nature(70, 24, 74)
N2b = nature('6,1', '6,3', '8,7')
assert N2a[2] is True and N2b[2] is False and N2b == (q('75,69'), q('76,9'), False)
E.append({'id': 'now-2', 'kind': 'exercise', 'number': 2, 'page': 171, 'section': 'دوري الآن', 'verified': True,
          'text': 'بيّن في كل حالة مما يأتي، إن كان المثلث RST قائما أم لا. أ) RS = 24mm ، RT = 70mm ، ST = 74mm ب) RS = 6,3cm ، RT = 6,1cm ، ST = 8,7cm',
          'items': {'a': {'square': dec(N2a[0]), 'sum': dec(N2a[1]), 'right': True}, 'b': {'square': dec(N2b[0]), 'sum': dec(N2b[1]), 'right': False}},
          'answerSource': 'computed'})

# ── p. 172–173 : معارف 3–4, طرائق (جيب التمام) ────────────────────────────────────────────────────
E.append({'id': 'know-3', 'kind': 'knowledge', 'number': 3, 'page': 172, 'section': 'معارف', 'title': 'جيب تمام زاوية حادّة', 'verified': False,
          'text': 'تعابير: ABC مثلث قائم في A، نقول إنّ: القطعة المستقيمة [BC] هي الوتر ؛ [AB] هو الضلع المجاور للزاوية B̂ ؛ [AC] هو الضلع المجاور للزاوية Ĉ. جيب تمام زاوية حادة في مثلث قائم يساوي حاصل قسمة طول الضلع المجاور لهذه الزاوية على طول الوتر. مثال: ABC مثلث قائم في C ؛ جيب تمام الزاوية B̂ يساوي BC/AB ؛ نكتب cos B̂ = BC/AB.'})
E.append({'id': 'know-4', 'kind': 'knowledge', 'number': 4, 'page': 172, 'section': 'معارف', 'title': 'استعمال الآلة الحاسبة لإيجاد جيب تمام زاوية حادّة', 'verified': False,
          'text': 'يمكن استعمال الآلة الحاسبة العلمية لحساب: القيمة المضبوطة أو قيمة مقرّبة لجيب تمام زاوية عُلم قيسها باستعمال اللمسة cos ؛ القيمة المضبوطة أو قيمة مقرّبة لزاوية عُلم جيب تمامها باستعمال اللمسة cos⁻¹. ملاحظة: يجب التأكد أولا من الوضع MODE Degrés. مثال: cos 43° ≃ 0,73 (0,731353701) ؛ cos α = 0,8 : α ≃ 36,9° (36,86989765).'})
E.append({'id': 'method-3', 'kind': 'method', 'number': 3, 'page': 173, 'section': 'طرائق', 'title': 'حساب طولي ضلعين بمعرفة زاوية حادّة وطول الوتر', 'verified': False,
          'text': 'تمرين: ABC قائم في A، BC = 4,25m ، Ĉ = 28°. احسب: 1) قيمة مقرّبة إلى الجزء من عشرة للطول AC. 2) قيس الزاوية B̂. 3) قيمة مقرّبة إلى الوحدة للطول AB. حل: AC = 4,25 × cos 28° ≃ 3,8m ؛ B̂ = 62° ؛ AB = 4,25 × cos 62° ≃ 2m (أو BA² = 4,25² − 3,8² ≃ 3,62).'})
E.append({'id': 'method-4', 'kind': 'method', 'number': 4, 'page': 173, 'section': 'طرائق', 'title': 'حساب طول وتر مثلث قائم علمت فيه زاوية حادّة وطول ضلع قائم', 'verified': False,
          'text': 'تمرين: PON قائم في N، ON = 4cm ، P̂ = 40°. احسب قيمة مقرّبة إلى الجزء من عشرة للطول OP. حل: Ô = 50° ؛ cos 50° = 4/OP ؛ OP = 4/cos 50° ≃ 6,2cm. احذر الخطأ: cos 40° = 4/OP.'})
E.append({'id': 'now-3', 'kind': 'exercise', 'number': 3, 'page': 173, 'section': 'دوري الآن', 'verified': False,
          'text': 'احسب في كل حالة، طول الضلع المجهول. (مثلث ABC قائم في C، AB = 10cm ، B̂ = 35° ؛ مثلث FGI قائم في G، FG = 5,4cm ، F̂ = 46°).'})

# ── pp. 174–176 : أوظّف تعلّماتي ─────────────────────────────────────────────────────────────────
X = {}
X['ex-3'] = {'HF': exact_sqrt(hyp('3,6', '7,7')), 'AB': exact_sqrt(hyp(6, 8))}
X['ex-4'] = {'RB': exact_sqrt(leg('7,3', '5,5')), 'HC': exact_sqrt(leg('9,7', '6,5'))}
X['ex-5'] = {'LC': exact_sqrt(leg('4,1', 4)), 'GE2': hyp(4, '5,3')}
X['ex-6'] = {'BC2': hyp(5, 12), 'BC': exact_sqrt(hyp(5, 12))}
X['ex-7'] = {'NP': exact_sqrt(leg('3,7', '3,5'))}
X['ex-8'] = {'RS2': leg(6, '5,5')}
X['ex-9'] = {'EG2': leg(17, 15), 'EG': exact_sqrt(leg(17, 15)), 'wrong': hyp(17, 15)}
X['ex-11'] = {'BD': exact_sqrt(hyp('2,4', 7))}
X['ex-12'] = {'d2': hyp(3, 3)}
X['ex-13'] = {'KH2': leg(3, '2,5')}
X['ex-14'] = {'h2': leg(4, 2)}
X['ex-15'] = {'h2': leg(6, '3,5')}
assert X['ex-3'] == {'HF': q('8,5'), 'AB': 10} and X['ex-4'] == {'RB': q('4,8'), 'HC': q('7,2')}
assert X['ex-5']['LC'] == q('0,9') and X['ex-5']['GE2'] == q('44,09') and exact_sqrt(X['ex-5']['GE2']) is None
assert X['ex-6'] == {'BC2': 169, 'BC': 13} and X['ex-7']['NP'] == q('1,2') and X['ex-8']['RS2'] == q('5,75')
assert X['ex-9'] == {'EG2': 64, 'EG': 8, 'wrong': 514} and X['ex-11']['BD'] == q('7,4')
assert X['ex-12']['d2'] == 18 and X['ex-13']['KH2'] == q('2,75') and X['ex-14']['h2'] == 12 and X['ex-15']['h2'] == q('23,75')
S16a = nature(60, 45, 75)
S16b = nature('5,5', '4,5', '3,5')
S17 = nature('5,7', '7,6', '9,4')
assert S16a[2] and not S16b[2] and S16b == (q('30,25'), q('32,5'), False)
assert S17 == (q('88,36'), q('90,25'), False) and q('9,5') ** 2 == q('90,25')

EXS = [
    ('ex-1', 'اكتب المساواة التي تعبّر عن خاصية فيثاغورس في كل ممّا يأتي: • DEF مثلث قائم في E • TUV مثلث قائم، وتره [UV]',
     {'DEF': 'DF² = DE² + EF²', 'TUV': 'UV² = TU² + TV²'}, True),
    ('ex-2', 'اكتب جميع المساواة الممكنة التي تعبّر عن خاصية فيثاغورس في كل شكل من الشكلين الآتيين: (ABCD: B و C قائمتان، القطر [AC] ؛ HSUV: H قائمة، E على [VU] و (SE) ⊥ (VU))',
     {'ABCD': ['AC² = AB² + BC²', 'AD² = AC² + CD²'], 'HSUV': ['VS² = HV² + HS²', 'SV² = SE² + EV²', 'SU² = SE² + EU²']}, True),
    ('ex-3', 'احسب طول الضلع الثالث في كل مثلث من المثلثين الآتيين. (HEF قائم في E: EH = 3,6cm ، EF = 7,7cm ؛ ABC قائم في C: AC = 6cm ، BC = 8cm)',
     {k: dec(v) for k, v in X['ex-3'].items()}, True),
    ('ex-4', 'احسب طول الضلع الثالث في كل مثلث من المثلثين الآتيين. (RAB قائم في R: RA = 5,5cm ، AB = 7,3cm ؛ HCE قائم في C: CE = 6,5cm ، HE = 9,7cm)',
     {k: dec(v) for k, v in X['ex-4'].items()}, True),
    ('ex-5', 'نعتبر الشكل المقابل (C على [LE]، (GC) ⊥ (LE)، GL = 4,1cm ، GC = 4cm ، CE = 5,3cm). 1) احسب LC 2) احسب GE 3) احسب مساحة المثلث GEL',
     {'LC': dec(X['ex-5']['LC']), 'GE': sqrt_text(X['ex-5']['GE2'], 2), 'area': dec((X['ex-5']['LC'] + q('5,3')) * 4 / 2)}, True),
    ('ex-6', '1) أنجز بآلة حاسبة السلسلة: 5 x² + 12 x² = 2) استنتج ذهنيا طول الوتر [BC] لمثلث ABC قائم في A وطولا الضلعين الآخرين [AB] و [AC] هما 5cm و 12cm.',
     {'screen': '169', 'BC': '13'}, True),
    ('ex-7', 'MNP مثلث قائم في N حيث MP = 3,7cm و MN = 3,5cm عند القيام بـ: √ ( 3,7 x² − 3,5 x² ) = ماذا نريد أن نحسب؟ أعط قيمة مقرّبة إلى الجزء من عشرة لنتيجة الحساب السابقة.',
     {'what': 'NP', 'NP': dec(X['ex-7']['NP'])}, True),
    ('ex-8', 'RST مثلث قائم في S بحيث RT = 6cm و ST = 5,5cm. احسب الطول RS مدوّرا إلى الجزء من العشرة من السنتيمتر.',
     {'RS': sqrt_text(X['ex-8']['RS2'], 1)}, True),
    ('ex-9', 'تصويب برهان: طلب الأستاذ من تلاميذه حساب الطول EG في المثلث EFG القائم المرسوم في الشكل (قائم في E، EF = 15cm ، FG = 17cm). إليك البرهان الذي قام به زميلك خالد: EFG مثلث قائم في E حسب خاصية فيثاغورس EG² = GF² + FE² ؛ EG² = 17² + 15² ؛ EG² = 194 ؛ EG ≃ 22,67cm. هل البرهان السابق صحيح؟ وضّح إجابتك.',
     {'correct': 'FG² = EF² + EG² ⇒ EG² = 17² − 15² = 64 ⇒ EG = 8cm', 'error': 'الوتر هو [FG] لا [EG]'}, True),
    ('ex-10', 'برّر الطريقة التي يستعملها البناؤون عادة للتحقق من أنّ ركن غرفة يشكّل فعلا زاوية قائمة.', {'note': '3 – 4 – 5 (الخاصية العكسية)'}, False),
    ('ex-11', 'ABCD مستطيل حيث AB = 7cm و AD = 2,4cm. 1) ارسم الشكل بيد حرّة. 2) احسب طول قطر في هذا المستطيل.',
     {'BD': dec(X['ex-11']['BD'])}, True),
    ('ex-12', 'EFGH مربّع طول ضلعه 3cm. أعط قيمة مقرّبة إلى الجزء من 10 لطول قطر في هذا المربّع.', {'d': sqrt_text(X['ex-12']['d2'], 1), 'exact': '3√2'}, True),
    ('ex-13', 'KJL مثلث متساوي الساقين رأسه الأساسي K. JL = 5cm ، KJ = 3cm. 1) أنشئ المثلث KJL، ثمّ ارسم الارتفاع [KH]. 2) أعط قيمة مقرّبة إلى الجزء من 10 للطول KH.',
     {'KH': sqrt_text(X['ex-13']['KH2'], 1)}, True),
    ('ex-14', 'KJL مثلث متقايس الأضلاع طول ضلعه 4cm. أعط قيمة مقرّبة إلى الجزء من 10 لكل ارتفاع من ارتفاعاته.', {'h': sqrt_text(X['ex-14']['h2'], 1), 'exact': '2√3'}, True),
    ('ex-15', 'أنشئ مثلثا RST متساوي الساقين رأسه الأساسي S حيث RS = 6cm و RT = 7cm. 1) أثبت أنّ حامل الارتفاع الذي يشمل S يقطع الضلع [RT] في منتصفه. 2) أعط قيمة مقرّبة إلى الجزء من 10 لطول الارتفاع السابق. 3) استنتج قيمة مقرّبة لمساحة المثلث RST.',
     {'h': sqrt_text(X['ex-15']['h2'], 1), 'area': dec(F(Decimal(7 * math.sqrt(23.75) / 2).quantize(Decimal('1e-9'))), 1)}, True),
    ('ex-16', 'بيّن في كل حالة مما يأتي، إن كان المثلث RST قائما أم لا. 1) RS = 75cm ، RT = 45cm ، ST = 60cm 2) RS = 3,5cm ، RT = 4,5cm ، ST = 5,5cm',
     {'1': {'square': dec(S16a[0]), 'sum': dec(S16a[1]), 'right': True}, '2': {'square': dec(S16b[0]), 'sum': dec(S16b[1]), 'right': False}}, True),
    ('ex-17', 'KJL مثلث حيث KJ = 5,7cm ، JL = 7,6cm و KL = 9,4cm. أنشئ المثلث KJL بأبعاده الحقيقية؟ هل يبدو لك المثلث KJL قائما؟ تحقق من ذلك حسابيا.',
     {'square': dec(S17[0]), 'sum': dec(S17[1]), 'right': False, 'note': '9,5² = 90,25 : le triangle « paraît » rectangle mais ne l’est pas'}, True),
    ('ex-18', '1) حدّد مع التبرير نوع المثلث ABC (I منتصف [BC]، AI = IB = IC = 6,5cm ، AC = 12cm). 2) احسب محيط ومساحة المثلث ABC.',
     {'nature': 'قائم في A (المتوسط = نصف الضلع)', 'AB': dec(exact_sqrt(leg(13, 12))), 'perimeter': '30', 'area': '30'}, False),
    ('ex-19', 'ارسم مثلثا TUV بحيث: UV = 5cm ، TU = 4cm ، TV = 6,4cm. 1) ارسم الدائرة (C) التي مركزها T وتشمل U. 2) هل المستقيم (UV) مماس للدائرة (C)؟ برّر جوابك.',
     {'square': dec(q('6,4') ** 2), 'sum': '41', 'tangent': False}, False),
    ('ex-20', 'في الشكل المقابل، المستقيمان (EF) و (DA) متوازيان (AD = 3,9 ، DB = 8,9 ، AB = 8). برهن أنّ المستقيمين (EB) و (EF) متعامدان.',
     {'AD2+AB2': dec(hyp('3,9', 8)), 'DB2': dec(q('8,9') ** 2)}, False),
    ('ex-21', 'للتحقق إن كانت سارية العلم مثبتة شاقوليا على سطح الأرض، قام زميلك يونس بتوصيل حبل بين نقطتين، إحداهما على السارية والأخرى على سطح الأرض كما هو مبيّن في الشكل، ثمّ أجرى قياسات مُحدّدة. هل السارية عمودية على سطح الأرض؟ برّر جوابك. (الأطوال المطبوعة: 75m ، 1m ، 1,25m)',
     {'reading': '0,75² + 1² = 1,5625 = 1,25²', 'right': True}, False),
    ('ex-22', 'احسب الطول CK (الشكل: ABK قائم في A، AB̂K… B̂ = 62° ، K̂ = 28° ، AB = 3,5cm ؛ BCK قائم في C).', {}, False),
    ('ex-23', 'عموميات: المثلث FAC قائم في A و H المسقط العمودي لـ A على [FC]. أسئلة حول الوتر وجيب التمام في FAC و CAH و AFH.', {}, False),
    ('ex-24', 'اعتمادا على الشكلين: عيّن القيمة المضبوطة لكل من cos Ĥ ، cos D̂.', {}, False),
    ('ex-25', 'باستعمال الآلة الحاسبة، أعط قيمة مقرّبة إلى الجزء من المائة لكل ممّا يأتي: cos 15° ، cos 26° ، cos 45° ، cos 62° ، cos 87°', {}, False),
    ('ex-26', 'باستعمال الآلة الحاسبة، أعط قيمة مقرّبة إلى الوحدة (الدرجة) للزوايا التي جيوب تمامها: 0,2 ، 0,6 ، 0,426 ، 0,01 ، 0,975', {}, False),
    ('ex-27', 'احسب إن أمكن أطوال جميع الأضلاع في الشكلين الآتيين.', {}, False),
    ('ex-28', 'MNP مثلث قائم في M حيث MN = 4cm ، NP = 6cm. احسب قيمتين مقرّبتين إلى الجزء من عشرة لكل من P̂ ، N̂.', {}, False),
    ('ex-29', '1) ارسم مثلثا FEG قائما في F بحيث FG = 5cm ، EG = 9cm. 2) احسب قيمة تقريبية لـ cos FĜE واستنتج قيمة تقريبية للزاوية FĜE. 3) استنتج قيمة تقريبية للزاوية FÊG.', {}, False),
    ('ex-30', '1) ارسم نصف دائرة (P) مركزها O و [AB] قطر لها حيث AB = 10cm … BÂC = 40° … المماس (d) … أطوال AC ، CB ، AD ، BD ، CD.', {}, False),
]
for i, (eid, text, answer, verified) in enumerate(EXS):
    n = int(eid.split('-')[1])
    page = 174 if n <= 6 else (175 if n <= 21 else 176)
    entry = {'id': eid, 'kind': 'exercise', 'number': n, 'page': page, 'section': 'أوظّف تعلّماتي', 'verified': verified, 'text': text}
    if answer:
        entry['answer'] = answer
        entry['answerSource'] = 'computed'
    if eid in ('ex-16',):
        entry['items'] = {'1': 'right', '2': 'not right'}
    E.append(entry)

# ── p. 177 : أؤكّد تعلّماتي ──────────────────────────────────────────────────────────────────────
S3a_leg = leg(7, '5,2')  # IGH rectangle en H : IG = 7 est l'hypoténuse
R4a = nature('3,6', '4,8', 6)
R4b = nature('5,7', '4,1', 7)
assert R4a[2] and not R4b[2] and R4b == (49, q('49,3'), False)
assert exact_sqrt(S3a_leg) is None and exact_sqrt(hyp('14,1', '18,8')) == q('23,5')
SELF = [
    ('self-1', 'اكتب مساواة تعبّر عن خاصية فيثاغورس في المثلث TRS (قائم في T).', {'eq': 'RS² = TR² + TS²'}, True, 'K'),
    ('self-2', 'من بين المساواة الآتية، حدّد تلك التي تعبّر عن خاصية فيثاغورس في المثلث RST القائم في R: أ) RS² + RT² = ST² ب) SR² + ST² = RT² جـ) TR² + TS² = RS²', {'correct': 'أ'}, True, 'K'),
    ('self-3', 'احسب قيمة مقرّبة إلى الجزء من المائة لطول الضلع الثالث للمثلث القائم في كل من الحالتين: أ) IGH مثلث قائم في H حيث IG = 7cm و IH = 5,2cm ب) UPR مثلث قائم في P حيث PR = 14,1cm و PU = 18,8cm',
     {'a': sqrt_text(S3a_leg, 2), 'b': sqrt_text(hyp('14,1', '18,8'), 2)}, True, 'K'),
    ('self-4', 'RPM و HDB مثلثان حيث: RM = 6cm ، PM = 3,6cm ، RP = 4,8cm ؛ HB = 7cm ، DB = 5,7cm ، HD = 4,1cm. أنشئ المثلثين RPM و HDB. بيّن إن كان المثلثان RPM و HDB قائمين أم لا.',
     {'RPM': {'square': dec(R4a[0]), 'sum': dec(R4a[1]), 'right': True}, 'HDB': {'square': dec(R4b[0]), 'sum': dec(R4b[1]), 'right': False}}, True, 'K'),
    ('self-5', 'احسب cos 50° ، cos 1° ، cos 89° ، cos 25°', {}, False, 'H'),
    ('self-6', 'يرمز a إلى قيس زاوية حادة مقدّرا بالدرجات. أعط إن أمكن قيمة مقرّبة إلى 1/10 للعدد a في كل حالة: cos a = 0,3 ، cos a = 0,547 ، cos a = 2/3 ، cos a = 1,5 ، cos a = 1', {}, False, 'H'),
    ('self-7', 'TIC مثلث قائم في C حيث TI = 6cm ، T̂ = 30°. أعط قيمة مقرّبة إلى الجزء من عشرة للطول TC.', {}, False, 'H'),
    ('self-8', 'ABC مثلث قائم في B حيث AB = 6cm ، AC = 10cm ، BC = 8cm. احسب القيمة المضبوطة لجيب تمام الزاوية Â.', {}, False, 'J'),
    ('self-9', 'باستعمال معطيات الشكل المقابل: احسب قيمة تقريبية للطول AF.', {}, False, 'H'),
]
for eid, text, answer, verified, _ in SELF:
    entry = {'id': eid, 'kind': 'self_check', 'number': int(eid.split('-')[1]), 'page': 177, 'section': 'أؤكّد تعلّماتي', 'verified': verified, 'text': text}
    if answer:
        entry['answer'] = answer
        entry['answerSource'] = 'computed'
    if eid == 'self-4':
        entry['items'] = {'RPM': 'right', 'HDB': 'not right'}
    E.append(entry)

# ── pp. 178–179 : أتعمّق (deux exercices sont numérotés 39 : le second devient deep-39b) ─────────────
D31 = exact_sqrt(leg(26, 10))
assert D31 == 24
DEEP = [
    ('deep-31', 178, 'في الشكل الموالي، طول كل مفصل 26cm. ما المقدار الذي ترتفع به السيارة عندما يكون طول المحور بين المفصلين 20cm؟',
     {'halfHeight': '24', 'height': '48', 'reading': 'losange de côté 26, demi-diagonale horizontale 10 → demi-hauteur √(26² − 10²) = 24'}, True),
    ('deep-32', 178, 'ABCD مربع و AG = 5cm (طول الضلع 20cm، L منتصف [AD]). 1) احسب LC و GC. 2) ما نوع المثلث LGC؟ برّر إجابتك.', {}, False),
    ('deep-33', 178, 'B و F نقطتان من الدائرة التي مركزها النقطة D. احسب الطول FB.', {}, False),
    ('deep-34', 178, 'في الشكل الموالي [AC] قطر لنصف الدائرة، AC = 41cm ، BC = 40cm. احسب مساحة الشكل المظلّل.', {}, False),
    ('deep-35', 178, 'ABIH مستطيل، النقاط A ، G ، H في استقامية. هل المثلث BGI قائم في G؟ برّر إجابتك.', {}, False),
    ('deep-36', 178, 'بيّن أنّ مجموع مساحتي نصفي القرصين الصغيرين يساوي مساحة نصف القرص الكبير.', {}, False),
    ('deep-37', 178, 'أنشئ مستطيلا ABCD حيث AB = 7,5cm و AC = 8,5cm. 1) احسب BC، ثمّ مساحة المثلث ABC. 2) باستعمال مساحة المثلث ABC، احسب بُعد النقطة B عن المستقيم (AC).',
     {'BC': dec(exact_sqrt(leg('8,5', '7,5')))}, False),
    ('deep-38', 178, 'أثبت أنّ محيط المثلث CGF يساوي 30cm.', {}, False),
    ('deep-39', 178, 'ABCDEFGH مكعب طول حرفه 3cm. 1) ما نوع المثلث EFG؟ برّر إجابتك. 2) أثبت أنّ EG² = 18. 3) أعط قيمة مقرّبة إلى الميليمتر لطول القطر [AG].', {}, False),
    ('deep-39b', 178, 'ABCDEFGH متوازي مستطيلات قائم. HB = 7,5cm ، FG = 3,6cm ، HG = 4,8cm. 1) ما نوع الرباعي EFGH؟ 2) احسب FB ارتفاع متوازي المستطيلات ABCDEFGH.', {}, False),
    ('deep-40', 178, 'أنشئ مثلثا GFE حيث FG = 13cm ، EG = 5cm ، EF = 12cm. 2) برّر كون المثلث EFG قائم في E. 3) أعط قيمة مقرّبة إلى الوحدة لقيس الزاوية EFG.', {}, False),
    ('deep-41', 179, 'نعتبر الشكل الآتي المرسوم بيد حرّة، حيث النقاط I ، H ، K في استقامية (وحدة الطول هي السنتيمتر). 1) أعد رسم الشكل بأبعاده الحقيقية. 2) أثبت أنّ (JH) و (IK) متعامدان. 3) بيّن أنّ IH = 6cm. 4) أعط قيمة مقرّبة إلى الوحدة لقيس HJK.', {}, False),
    ('deep-42', 179, '1) أنشئ دائرة (C) مركزها O، [ST] قطر لها حيث ST = 7cm، U على الدائرة حيث SU = 3cm. 2) بيّن أنّ المثلث STU قائم في U. 3) احسب قيس الزاوية UST مدوّرا إلى الوحدة.', {}, False),
    ('deep-43', 179, 'في الشكل الموالي، النقطة D تنتمي إلى كل من [FB] و [GC]. احسب قيمة تقريبية للزاوية DCB.', {}, False),
    ('deep-44', 179, 'احسب قيمة تقريبية لكل من محيط ومساحة الشكل المشكّل من المثلث القائم NBC وربع دائرة ذات المركز C.', {}, False),
    ('deep-45', 179, 'تدلّ الإشارة المرورية المقابلة على وجود انحدار قدره 10%… 1) حدّد قيس الزاوية BCA مدوّرا إلى الوحدة. 2) حدّد الإشارة التي تعبّر عن أشدّ الانحدارين (15% أو 1:5).', {}, False),
    ('deep-46', 179, 'باستعمال المعطيات الواردة في الشكل أعط تقديرا لارتفاع مقام الشهيد (GE = 120m ، 37° ، 1,5m).', {}, False),
]
for eid, page, text, answer, verified in DEEP:
    num = eid.split('-')[1]
    entry = {'id': eid, 'kind': 'deepening', 'number': int(num.rstrip('b')), 'page': page, 'section': 'أتعمّق', 'verified': verified, 'text': text}
    if answer:
        entry['answer'] = answer
        entry['answerSource'] = 'computed'
    E.append(entry)

# ── p. 180–181 : أدمج تعلّماتي ; TIC ─────────────────────────────────────────────────────────────
E.append({'id': 'integration', 'kind': 'integration', 'page': 180, 'section': 'أدمج تعلّماتي', 'verified': False,
          'text': 'وضعية: عند مدخل أحد أجنحة مستشفى، تمّ تكليف مقاول بإنجاز سُلّم مشكّل من ست درجات متماثلة يسمح بتخطي مستو مائل ارتفاعه 96cm (المخطط: BC = 150cm ، CD = 55cm). معايير المصالح التقنية: 60 ≤ 2h + p ≤ 65 حيث h ارتفاع الدرجة و p عمقها ؛ طول المستوي المائل AD محصور بين 2,20m و 2,50m ؛ يُشكّل المستوي المائل مع أفق سطح الأرض زاوية قيسها محصور بين 20° و 30° (الزاوية BDA). هل المخطط الذي أعدّه المقاول يستجيب للمعايير المتفق عليها؟ حل مختصر: h = 16cm ، p = 30cm ، BDA ≃ 25,1°.',
          'answer': {'h': '16', 'p': '30', '2h+p': '62', 'AD': sqrt_text(hyp(96, 205), 2), 'BDA': '25,1'}, 'answerSource': 'computed'})
assert 96 / 6 == 16 and 150 / 5 == 30 and 60 <= 2 * 16 + 30 <= 65
E.append({'id': 'evaluation', 'kind': 'integration', 'page': 180, 'section': 'وضعية للتقويم', 'verified': False,
          'text': 'أنجز العم أحمد درجا مواصفاته في الشكل المقابل (العمق 27,3cm ، طول المستوي 457cm). من أجل ضمان راحة في الصعود أو النزول في أي سلّم يجب أن يكون ارتفاع الدرجة الواحدة منه محصورا بين 17cm و 21cm. هل يستجيب درج العم أحمد إلى الشروط السابقة؟'})
E.append({'id': 'ict', 'kind': 'ict', 'page': 181, 'section': 'أوظّف تكنولوجيات الإعلام والاتصال', 'verified': False,
          'text': 'إنشاء حلزونية فيثاغورس باستعمال جيوجيبرا. المرحلة 1: أنشئ مثلثا قائما ومتساوي الساقين طول ضلعه القائم 1 ثم احسب طول وتر هذا المثلث (مربع طول الوتر يساوي 2، أي أنّ طول الوتر يُساوي بالتقريب 1,414). المرحلة 2: أنشئ مثلثا قائما آخر، أحد أضلاعه وتر المثلث السابق وطول ضلعه الآخر 1، ثمّ احسب طول وتره (√3 ≈ 1,732). المرحلة 3: واصل الإنشاء إلى غاية الحصول على المثلث القائم الذي طول وتره يساوي 3. اشرح لماذا ظهر عددان طبيعيان كطول للوتر؟ كم مثلثا قائما يلزمنا رسمه بالكيفية السابقة للحصول على مثلث قائم طول وتره عدد طبيعي؟',
          'answer': {'naturals': '√4 = 2 et √9 = 3 : les carrés parfaits', 'count': 'هـ du 1er au 8e triangle : 8 triangles pour √9 = 3'}, 'answerSource': 'computed'})

K = 'khassiyat-fitaghuras'
A = 'aksiya-fitaghuras'
J = 'jayb-tamam-zawiya'
H = 'hisab-jayb-tamam'
SYN = 'wadiya-idmajiya-fitaghuras-jayb-tamam'
DEST = {
    '_comment': 'elementId → { lesson, module } ; `items` répartit un élément ; une leçon encore coming_soon est une destination EN ATTENTE (check-textbook-coverage.mjs). Première leçon générée : khassiyat-fitaghuras (2026-10-20). Frontière propriété / réciproque : en-tête de build-extraction.py.',
    'objectives': {'lesson': 'unit', 'module': 'page'},
    'challenge': {'lesson': H, 'module': None},
    'opener': {'lesson': A, 'module': None, 'note': 'la corde à 12 nœuds (3-4-5) : la réciproque'},
    'prep': {'lesson': K, 'module': 0, 'items': {'1-2-3-4-6-7': {'lesson': K, 'module': 0}, '5': {'lesson': A, 'module': 0}, '8-9': {'lesson': J, 'module': 0}, '10-11': {'lesson': H, 'module': 0}}},
    'act-1': {'lesson': K, 'module': 4, 'note': 'APPLICATION (guide §4ter) : le labo `pythagoras-tanks` est l’entrée conçue par la plateforme ; le découpage de Perigal devient une question d’aires en أتمرّن'},
    'act-2': {'lesson': K, 'module': 3, 'note': 'la touche √ seulement (no-rebuild : jidhr-tarbii construit la racine carrée en 4AM)'},
    'act-3': {'lesson': A, 'module': None}, 'act-4': {'lesson': J, 'module': None}, 'act-5': {'lesson': H, 'module': None}, 'act-6': {'lesson': H, 'module': None},
    'know-1': {'lesson': K, 'module': 2},
    'know-2': {'lesson': A, 'module': None},
    'method-1': {'lesson': K, 'module': 3},
    'method-2': {'lesson': K, 'module': 3, 'items': {'FEJ': {'lesson': K, 'module': 3}, 'ABC': {'lesson': A, 'module': None}}},
    'now-1': {'lesson': K, 'module': 4},
    'now-2': {'lesson': K, 'module': 4, 'items': {'b': {'lesson': K, 'module': 4}, 'a': {'lesson': A, 'module': None}}},
    'know-3': {'lesson': J, 'module': None}, 'know-4': {'lesson': H, 'module': None},
    'method-3': {'lesson': H, 'module': None}, 'method-4': {'lesson': H, 'module': None}, 'now-3': {'lesson': H, 'module': None},
    **{f'ex-{n}': {'lesson': K, 'module': 4} for n in (1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 17)},
    'ex-16': {'lesson': K, 'module': 4, 'items': {'2': {'lesson': K, 'module': 4}, '1': {'lesson': A, 'module': None}}},
    'ex-10': {'lesson': A, 'module': None}, 'ex-18': {'lesson': A, 'module': None}, 'ex-19': {'lesson': A, 'module': None},
    'ex-20': {'lesson': A, 'module': None}, 'ex-21': {'lesson': A, 'module': None},
    'ex-22': {'lesson': H, 'module': None}, 'ex-23': {'lesson': J, 'module': None}, 'ex-24': {'lesson': J, 'module': None},
    **{f'ex-{n}': {'lesson': H, 'module': None} for n in range(25, 31)},
    'self-1': {'lesson': K, 'module': 8}, 'self-2': {'lesson': K, 'module': 8}, 'self-3': {'lesson': K, 'module': 8},
    'self-4': {'lesson': K, 'module': 8, 'items': {'HDB': {'lesson': K, 'module': 8}, 'RPM': {'lesson': A, 'module': None}}},
    'self-5': {'lesson': H, 'module': None}, 'self-6': {'lesson': H, 'module': None}, 'self-7': {'lesson': H, 'module': None},
    'self-8': {'lesson': J, 'module': None}, 'self-9': {'lesson': H, 'module': None},
    'deep-31': {'lesson': K, 'module': 6, 'note': 'le cric (losange) : une مسألة'},
    'deep-32': {'lesson': A, 'module': None}, 'deep-33': {'lesson': SYN, 'module': None}, 'deep-34': {'lesson': SYN, 'module': None},
    'deep-35': {'lesson': A, 'module': None}, 'deep-36': {'lesson': SYN, 'module': None}, 'deep-37': {'lesson': SYN, 'module': None},
    'deep-38': {'lesson': SYN, 'module': None}, 'deep-39': {'lesson': SYN, 'module': None}, 'deep-39b': {'lesson': SYN, 'module': None},
    'deep-40': {'lesson': H, 'module': None}, 'deep-41': {'lesson': H, 'module': None}, 'deep-42': {'lesson': H, 'module': None},
    'deep-43': {'lesson': H, 'module': None}, 'deep-44': {'lesson': H, 'module': None}, 'deep-45': {'lesson': H, 'module': None}, 'deep-46': {'lesson': H, 'module': None},
    'integration': {'lesson': SYN, 'module': None}, 'evaluation': {'lesson': SYN, 'module': None}, 'ict': {'lesson': SYN, 'module': None},
}

DISCREPANCIES = [
    {'elementId': 'unit', 'kind': 'scan', 'text': 'Pages imprimées 166–181 = PDF 168–183 (décalage +2 à partir de la page imprimée 149, textbook-map.json). Filigrane « elbassair.net » sur chaque page ; aucune page manquante.'},
    {'elementId': 'ex-9', 'kind': 'misprint', 'text': 'Dans le « برهان » de خالد, la ligne « EG² = 194 » ne suit pas de « 17² + 15² » (= 514) ; « EG ≃ 22,67 » est √514. L’erreur visée par l’exercice est le CHOIX de l’hypoténuse ([FG], pas [EG]) : EG² = 17² − 15² = 64, EG = 8 cm. La leçon redessine l’exercice avec ses propres nombres.'},
    {'elementId': 'ex-21', 'kind': 'misprint', 'text': 'La hauteur sur le mât est imprimée « 75m » à côté de « 1m » et « 1,25m » : c’est 0,75 m (0,75² + 1² = 1,25²). Élément de aksiya-fitaghuras.'},
    {'elementId': 'deep-39', 'kind': 'misprint', 'text': 'Deux exercices sont numérotés 39 (le cube, puis le pavé droit) : le second est `deep-39b`.'},
    {'elementId': 'self-3', 'kind': 'reading', 'text': 'أ) IGH rectangle en H, IG = 7 cm est donc l’hypoténuse : GH = √(7² − 5,2²) = √21,96 ≈ 4,69 cm ; ب) UPR rectangle en P : UR = √(14,1² + 18,8²) = √552,25 = 23,5 cm (exact).'},
    {'elementId': 'ex-17', 'kind': 'intended', 'text': '5,7² + 7,6² = 90,25 = 9,5², alors que KL = 9,4 : le triangle a l’AIR rectangle (angle en J ≈ 89°) mais 9,4² = 88,36 ≠ 90,25 — l’exemple même de la « نتيجة » de معارف 1 (khassiyat-fitaghuras).'},
    {'elementId': 'challenge', 'kind': 'scope', 'text': 'Le تحدّ demande la distance Vénus–Soleil ; en 3AM elle se calcule avec cos α (Terre–Vénus) puis Pythagore. Élément de hisab-jayb-tamam.'},
    {'elementId': 'unit', 'kind': 'scope', 'text': 'Les éléments de aksiya-fitaghuras, jayb-tamam-zawiya, hisab-jayb-tamam et de la synthèse sont transcrits plus brièvement (verified: false) : leur leçon les relira (surtout les figures de ex-22 … ex-30 et deep-32 … deep-46).'},
]

doc = {
    '_comment': [
        'EXTRACTION CANONIQUE du manuel scolaire officiel — 3AM, الجيل الثاني (منشورات الشهاب 2017), unité 11 « خاصية فيثاغورس، جيب تمام زاوية ».',
        'Source : docs/official-book-pdfs/كتاب الرياضيات للسنة الثالثة متوسط الجيل الثاني.pdf, pages imprimées 166 à 181 (PDF 168 à 183).',
        'Ce fichier est LA source de vérité pédagogique de l’unité ; tout contenu cite un `id` d’ici via `source.elementId`.',
        'Transcription VISUELLE ; longueurs calculées en arithmétique exacte par build-extraction.py, `answerSource: computed`.',
        'Généré par docs/sources/3am/unit11/build-extraction.py — ne pas éditer à la main.',
    ],
    'unitCode': 'fitaghuras-jayb-tamam',
    'textbook': {'title': 'كتاب الرياضيات — السنة الثالثة من التعليم المتوسط', 'generation': 'الجيل الثاني', 'unitNumber': 11,
                 'unitTitle': 'خاصية فيثاغورس، جيب تمام زاوية', 'pages': {'first': 166, 'last': 181}, 'pdfPageOffset': 2,
                 'sections': ['سأتعلّم في هذا الباب', 'تحدّي', 'أستعدّ', 'أنشطة', 'معارف', 'طرائق', 'دوري الآن', 'أوظّف تعلّماتي', 'أؤكّد تعلّماتي', 'أتعمّق',
                              'أدمج تعلّماتي', 'وضعية للتقويم', 'أوظّف تكنولوجيات الإعلام والاتصال']},
    'frozenAt': '2026-10-20',
    'terminology': {'note': 'Le manuel écrit « مثلث قائم في A », « الوتر », « الضلعان الآخران / الضلعان القائمان », « مربع طول », « خاصية فيثاغورس », « الخاصية العكسية لفيثاغورس », « اللمسة √ », « القيمة المضبوطة », « قيمة مقرّبة إلى الجزء من 10 / 100 », « جيب تمام » (cos).',
                    'terms': ['مثلث قائم', 'الوتر', 'خاصية فيثاغورس', 'الخاصية العكسية لفيثاغورس', 'اللمسة √', 'القيمة المضبوطة', 'قيمة مقرّبة', 'جيب تمام']},
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
pending = sum(1 for k, v in DEST.items() if k != '_comment' and v['lesson'] not in ('unit', K))
print(f'{out} — {len(E)} éléments ({pending} vers les autres leçons de l’unité)')
