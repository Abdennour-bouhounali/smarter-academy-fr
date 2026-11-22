#!/usr/bin/env python3
"""Génère docs/sources/2am/unit1/extraction.json — 2AM, unité 1 « العمليات على الأعداد الطبيعية والأعداد العشرية » (manuel الجيل الثاني,
منشورات الشهاب ; pp. 6–21 du livre = PDF 3–18, décalage 3 — docs/sources/2am/textbook-map.json). Unité id : amaliyat-tabiiya-ushriya.

Transcription VISUELLE (pages rendues à 130 dpi ; les îlots douteux relus à 200–260 dpi). Le scan de 2AM est la seule copie et il est
médiocre (marge droite coupée, bas de page coupé) : on prend l'idée, on ne s'attarde pas sur l'illisible. Ce fichier est une SOURCE INTERNE,
jamais montrée aux élèves. Les éléments de la leçon `silsila-bidun-aqwas` (L1, générée en premier) sont `verified: True` (relus, réponses
assertées) ; les éléments des autres leçons sont transcrits plus brièvement, `verified: False` : leur leçon les relira. Les réponses sont
CALCULÉES ici (Fraction exacte), jamais tapées (`answerSource: computed`).

L'unité est générée LEÇON PAR LEÇON : les destinations vers une leçon encore coming_soon sont EN ATTENTE
(scripts/check-textbook-coverage.mjs). Modules de silsila-bidun-aqwas : 0 أستعدّ · 1 نشاط · 2 معارف · 3 طريقة · 4 أتمرّن · 5–7 مسائل ·
8 إختبار أولي ; `None` = banque de pratique seulement. Codes : L1 silsila-bidun-aqwas, L2 silsila-bi-aqwas, L3 wasf-silsila-hisab,
L4 tawzi-darb-jam-tarh, S wadiya-idmajiya-amaliyat-tabiiya-ushriya (plans : docs/sources/2am/unit1/plan/).

## Boundaries (written ONCE here; from docs/sources/2am/unit1/plan/README.md)

- **`silsila-bidun-aqwas` (r01, without brackets)** = chains with NO brackets and no fraction bar: + and − only from left to right, × and
  ÷ only from left to right, × ÷ before + −, on naturals and decimals; translating a situation into such a chain and computing it; the
  scientific calculator applies the same rule (it is shown, not typed for brackets). It never writes a bracket, never names a chain by its
  last operation, never distributes. Every intermediate result is ≥ 0 (2AM unit 3 owns relative numbers).
- **`silsila-bi-aqwas` (r01 + r02)** = brackets first; nested brackets from the inside, outer pair as [ ]; necessary vs useless brackets;
  the fraction bar as two bracketed chains, both ways (with ↔ without the bar); typing a chain on a calculator with the brackets it needs;
  translating a situation that NEEDS brackets. It never names a chain by its last operation (it may say « القوسان يجعلان الجمع أوّلًا »),
  never distributes, never removes brackets preceded by − (3AM `tabsit-hadhf-aqwas`), never computes algebraic sums (2AM unit 3
  `majmu-jabri`).
- **`wasf-silsila-hisab` (r01 + r02)** = the last operation names the chain; its two terms / factors / dividend and divisor; a sentence that
  describes it, nested (« جداء العدد 4 ومجموع العددين 9 و 6 »); writing a chain (with the brackets it needs) from a sentence or a calculation
  program, then computing it; trees ↔ chains. It never distributes and never uses letters beyond « اختر عددًا » programs computed on
  numbers (a letter program `5 × (n + 3)` is read, never simplified).
- **`tawzi-darb-jam-tarh` (r03)** = k × (a + b) = k × a + k × b and k × (a − b) = k × a − k × b (a ≥ b) on naturals and decimals, read
  both ways: نشر (product → sum) and تحليل (sum → product, the common factor visible); mental calculation (×11, ×99, ×101, 48 × 7 =
  (50 − 2) × 7); with ONE letter in the simple form k × (x ± b) and its notation 3 × x = 3x (owner question 1). It never multiplies two
  brackets (`nashr-jabri-3am`), never uses negative numbers, never simplifies sums of like terms beyond « (4 + 3)x = 7x » read as a
  factorisation (`tabsit-hadhf-aqwas` P1), never removes brackets preceded by −.
- **Synthesis** = no new notion: six training situations + the analysed final situation + the final test.

Usage : python3 docs/sources/2am/unit1/build-extraction.py
"""
import json
import re
from decimal import Decimal as D
from fractions import Fraction as F
from itertools import product
from pathlib import Path


def dec(s):
    return D(str(s).replace(',', '.'))


def fr(x):
    """Un décimal exact écrit à l'algérienne (virgule)."""
    x = D(x).normalize()
    return format(x, 'f').replace('.', ',')


def frac(x):
    x = F(x)
    return str(x.numerator) if x.denominator == 1 else f'{x.numerator}/{x.denominator}'


def num(x):
    """Une valeur exacte : décimal à virgule si elle est décimale, sinon a/b."""
    x = F(x)
    d = x.denominator
    while d % 2 == 0:
        d //= 2
    while d % 5 == 0:
        d //= 5
    return fr(D(x.numerator) / D(x.denominator)) if d == 1 else frac(x)


def ev(s):
    """Évalue une chaîne du manuel (× ÷ − + ( ) [ ], virgule décimale) avec les priorités, en Fraction exacte."""
    t = s.replace('×', '*').replace('÷', '/').replace('−', '-').replace('[', '(').replace(']', ')')
    t = re.sub(r'(\d+(?:[.,]\d+)?)', lambda m: "F('" + m.group(1).replace(',', '.') + "')", t)
    return eval(t, {'F': F})


def vals(exprs):
    return [num(ev(e)) for e in exprs]


E = []


def add(id, kind, page, section, verified, **kw):
    E.append({'id': id, 'kind': kind, 'page': page, 'section': section, 'verified': verified, **kw})


# ── p. 6 : ouverture ───────────────────────────────────────────────────────────────────────────────
add('objectives', 'objectives', 6, 'سأتعلّم في هذا الباب', True, items=[
    'إجراء سلسلة عمليات.',
    'استعمال الأقواس.',
    'التعرّف على خاصية توزيع الضرب على الجمع والطرح واستعمالها.',
])
add('opener', 'aside', 6, 'تمهيد', True,
    text='اخترعت الأرقام في الهند في القرن الثالث قبل الميلاد، ثم استعملها علماء الحضارة العربية الإسلامية ابتداء من القرن التاسع الميلادي وهم الذين أعطوها الصيغة الكتابية المستعملة اليوم، ولهذا تُعرف بالأرقام العربية، وطوّرها الرياضياتي الخوارزمي، حينما استعمل الصفر في حساباته، الشيء الذي ساهم في إبراز الأعداد الطبيعية و تحوّل الحساب إلى النظام العشري المعروف في الجمع والطرح، وقد كان من قبل نظام العدّ يعتمد على أسلوب قديم دون الصفر. وقد دخلت هذه الأعداد إلى أوروبا بفضل الرياضياتي الإيطالي فيبوناتشي (Fibonacci) 1170م - 1250م الذي أخذها من بجاية حيث درس على يد علمائها آنذاك. وقد كانت قوة النظام العشري في الحساب باستعمال هذه الأعداد العامل الحاسم في انتشارها في مختلف أنحاء العالم.',
    figure='صورة أربعة أسطر من الأرقام بخطوط مختلفة (الأرقام الهندية والمغاربية والعربية).',
    reading='la phrase du Khwarizmi (« النظام العشري المعروف في الجمع والطرح ») est un peu confuse sur le scan ; on ne retient que l\'histoire : Inde → savants arabes → Khwarizmi → Fibonacci appris à Béjaïa.')
# Le défi : deux arbres de calcul de 30 − 8 + 2.
assert ev('30 - (8 + 2)') == 20 and ev('(30 - 8) + 2') == 24 and ev('30 - 8 + 2') == 24
assert ev('40 - 12 + 6') == 34 and ev('40 - (12 + 6)') == 22      # la réécriture proposée pour la carte de l'unité
add('challenge', 'challenge', 6, 'تحدّي', True,
    text='احسب: 30 - 8 + 2 = ? — شجرتا حساب: عند يونس 8 + 2 أوّلًا فيعطي 10 ثم 30 - 10 = 20 ؛ عند إيناس 30 - 8 أوّلًا فيعطي 22 ثم 22 + 2 = 24.',
    trees={'يونس': {'first': '8 + 2', 'then': '30 - 10', 'result': 20}, 'إيناس': {'first': '30 - 8', 'then': '22 + 2', 'result': 24}},
    answer={'leftToRight': 24, 'younes': 20, 'ines': 24, 'agreedReading': 24,
            'note': 'Une chaîne sans parenthèses a UNE lecture : de gauche à droite pour + et − seuls, donc 30 - 8 + 2 = 24 (Inès) ; Younès a calculé 30 - (8 + 2).'},
    answerSource='computed',
    platformRewrite={'textAr': 'احسب: 40 − 12 + 6 . وجدت سلمى 34 ووجد أنس 22. من منهما على صواب؟ ولماذا؟', 'values': {'leftToRight': 34, 'bracketed': 22},
                     'use': 'texte proposé pour units_2am_2026_2027.json › challenge (sourceElementId: challenge) ; idée = tâche t1 du labo de L1'})

# ── p. 7 : أستعدّ (11 QCM : 3 colonnes de réponses, une ou plusieurs justes) ─────────────────────────
assert ev('13 + 24 + 17') == 54 == ev('13 + 17 + 24')
assert ev('37,3 + 456,2 + 62,7') == F('556.2') and ev('37,3 + 62,7') == 100
assert ev('427,3 - 219,54') == F('207.76') and ev('219,54 - 427,3') < 0 and F('208.71') != F('207.76')
assert ev('8,5 + 13') == F('21.5')                                   # AC = AB + BC
assert 14 - 9 == 5                                                   # figure : AC = 14 − 9 (l'option imprimée dit 14,5 — discrepancy 10)
assert 20 / 5 == 4                                                   # AB = 20 ÷ 5 : cinq segments égaux
assert ev('2,4 * 2 + 2,4 * 3') == F('12') == ev('2,4 * (2 + 3)') and ev('2,4 * 7') == F('16.8') and ev('2,4 * 7') != 12
assert ev('9,2 / 4') == F('2.3') and ev('9,2 / 4') == F(92, 40)
PREP = [
    {'n': 1, 'question': '3,6 + 8,7 عبارة عن:', 'options': ['جُداء', 'مجموع', 'فرق'], 'correct': [1], 'why': '3,6 + 8,7 = ' + num(ev('3,6 + 8,7')) + ' : la dernière opération est l\'addition', 'verified': False},
    {'n': 2, 'question': 'في العبارة 8 × 3,5 ، العددان 8 و 3,5 يسمّيان:', 'options': ['عاملان', 'حدّان', 'القاسم والمقسوم'], 'correct': [0], 'why': 'dans un produit les nombres sont des facteurs (عاملان)', 'verified': False},
    {'n': 3, 'question': '13 + 24 + 17 = …', 'options': ['13 + 17 + 24', '45', '54'], 'correct': [0, 2], 'why': 'l\'ordre des termes d\'une somme est libre : 13 + 24 + 17 = 13 + 17 + 24 = ' + num(ev('13 + 24 + 17'))},
    {'n': 4, 'question': '37,3 + 456,2 + 62,7', 'options': ['يمكن حسابه ذهنيا', '555,12', '556,2'], 'correct': [0, 2], 'why': '37,3 + 62,7 = 100 puis 100 + 456,2 = ' + num(ev('37,3 + 456,2 + 62,7'))},
    {'n': 5, 'question': '427,3 − 219,54 = …', 'options': ['219,54 − 427,3', '208,71', '207,76'], 'correct': [2], 'why': '427,3 − 219,54 = ' + num(ev('427,3 - 219,54')) + ' ; 219,54 − 427,3 serait négatif'},
    {'n': 6, 'question': 'الشكل: A —8,5cm— B —13cm— C. طول AC مقدّرا بالسنتيمتر يساوي:', 'options': ['13 − 8,5', '13 + 8,5', '13 × 8,5'], 'correct': [1], 'why': 'AC = AB + BC = ' + num(ev('8,5 + 13')) + ' cm'},
    {'n': 7, 'question': 'الشكل: النقطة C على [AB] ، CB = 9cm ، AB = 14cm. طول AC مقدّرا بالسنتيمتر يساوي:', 'options': ['14,5 × 9', '14,5 − 9', '14,5 + 9'], 'correct': [1], 'why': 'AC = AB − CB : une soustraction (la figure dit 14 cm, les options 14,5 — discrepancy 10)',
     'reading': 'figure : 14cm sous la flèche pointillée, 9cm sur [CB] ; options imprimées avec « 14,5 »'},
    {'n': 8, 'question': 'الشكل: A B C D E F ست نقط تُقسّم القطعة [AF] طولها 20cm إلى 5 قطع متقايسة. طول AB مقدّرا بالسنتيمتر يساوي:', 'options': ['20 − 5', '20 ÷ 5', '20 × 5'], 'correct': [1], 'why': 'AB = 20 ÷ 5 = 4 cm', 'verified': False},
    {'n': 9, 'question': 'مستطيل ABCD عرضه 2,4cm وطوله مكوّن من القطعتين 2cm و 3cm. مساحة المستطيل ABCD تساوي:', 'options': ['2,4cm × 7cm', '2,4cm × 2cm + 2,4cm × 3cm', '16,8cm'], 'correct': [1], 'why': '2,4 × 2 + 2,4 × 3 = 12 (cm²) ; 2,4 × 7 = 16,8 est faux car 2 + 3 = 5', 'verified': False},
    {'n': 10, 'question': 'العدد 9,2/4 يُكتب على الشكل:', 'options': ['9,2 ÷ 4', '9,2 × 4', '2,3'], 'correct': [0, 2], 'why': '9,2 ÷ 4 = 2,3 (une écriture fractionnaire est un quotient)', 'verified': False},
    {'n': 11, 'question': 'الجداء 2 × a يمكن كتابته على الشكل:', 'options': ['a + 2', 'a × 2', '2a'], 'correct': [1, 2], 'why': '2 × a = a × 2 = 2a', 'verified': False},
]
add('prep', 'prerequisites', 7, 'أستعدّ', True, instruction='اختر الإجابة الصحيحة (أو الإجابات الصحيحة) في كل حالة، مبرّرا إياها.',
    items=PREP, answerSource='computed',
    note='Les items 3, 4, 5, 6, 7 sont ceux de silsila-bidun-aqwas (verified: True) ; 1, 2 → L3, 8, 10 → L2, 9, 11 → L4 (verified: False, leur leçon les relira).')

# ── pp. 8–9 : أنشطة ────────────────────────────────────────────────────────────────────────────────
assert ev('25 - 7 + 3') == 21 and ev('25 - (7 + 3)') == 15 and ev('25 - 7 + 5') == 23
assert [ev(c) for c in ['19 + 12 - 2', '45 - 26 - 13', '18 / 2 * 3', '5 * 4 / 2']] == [29, 6, 27, 10]
assert ev('230 - 160 + 100') == 170
add('act-1', 'activity', 8, 'أنشطة', True, number=1, title='إجراء سلسلة عمليات جمع وطرح (أو ضرب وقسمة)',
    text='1) طلب الأستاذ من تلاميذه إنجاز سلسلة العمليات: 25 - 7 + 3 . بعد مراقبة محاولات التلاميذ لاحظ الأستاذ وجود نتيجتين مختلفتين: 15 و 21. أ) اشرح كيف تمّ الحصول على النتيجتين السابقتين. ب) قم بحجز السلسلة السابقة على آلة حاسبة علمية متّبعا الخُطوات الآتية: [2][5][−][7][+][5][=] • ما هو ترتيب تنفيذ عمليتي الجمع والطرح الذي اعتمدته الآلة في إنجاز الحسابات؟ 2) إليك نتائج صحيحة لحسابات أنجزت بواسطة آلة حاسبة علمية. أ) 19 + 12 − 2 = 29 ب) 45 − 26 − 13 = 6 ج) 18 ÷ 2 × 3 = 27 د) 5 × 4 ÷ 2 = 10 • وضّح في كل حالة مراحل الحساب المناسبة. • خمّن قاعدة تسمح بإنجاز سلسلة عمليات تتضمّن فقط: الجمع والطرح أو الضرب والقسمة. 3) يملك يونس مبلغ 230DA ، اشترى عند خروجه من المتوسّطة آلة حاسبة ثمنها 160DA ثمّ التقى جدّه فأعطاه مبلغ 100DA مكافأة له على اجتهاده. اكتب سلسلة عمليات تسمح بإيجاد المبلغ الذي صار عند يونس، ثمّ احسبه.',
    answer={'q1': {'leftToRight': 21, 'other': 15, 'otherReading': '25 − (7 + 3)', 'calculatorKeysPrinted': '2 5 − 7 + 5 =', 'calculatorKeysValue': 23,
                   'note': 'Les touches imprimées finissent par 5, pas 3 (discrepancy 2) ; l\'ordre de la machine : de gauche à droite (25 − 7 = 18, puis + 3 = 21).'},
            'q2': {'allTrue': True, 'steps': ['19 + 12 = 31 ; 31 − 2 = 29', '45 − 26 = 19 ; 19 − 13 = 6', '18 ÷ 2 = 9 ; 9 × 3 = 27', '5 × 4 = 20 ; 20 ÷ 2 = 10']},
            'q3': {'chain': '230 − 160 + 100', 'value': 170}},
    answerSource='computed')

assert [ev(c) for c in ['8 + 3 * 4', '30 / 5 - 2', '3 * 7 - 4 / 2']] == [20, 4, 19]
assert 54000 - 3 * 1500 == 49500
add('act-2', 'activity', 8, 'أنشطة', True, number=2, title='أولوية العمليات',
    text='1) استعمل آلة حاسبة علمية للتأكد من صحة النتائج الآتية: أ) 8 + 3 × 4 = 20 ب) 30 ÷ 5 − 2 = 4 ج) 3 × 7 − 4 ÷ 2 = 19 . 1) وضّح في كل حالة مراحل الحساب التي سمحت بالحصول على النتيجة. 2) صِف طريقة عمل الآلة الحاسبة التي نفّذت بها سلاسل العمليات السّابقة. 3) خمّن قاعدة لحساب سلاسل عمليات مُختلفة. 2) اختار العم أحمد تسديد مبلغ 54 000DA ثمن جهاز الحاسوب الذي اقتناه، على أربع دفعات، سدّد منها ثلاث دفعات، مبلغ كل دفعة 1500DA. • اكتب سلسلة عمليات تسمح بحساب مبلغ الدّفعة الرّابعة، ثمّ احسبه.',
    answer={'q1': {'allTrue': True, 'steps': ['3 × 4 = 12 ; 8 + 12 = 20', '30 ÷ 5 = 6 ; 6 − 2 = 4', '3 × 7 = 21 ; 4 ÷ 2 = 2 ; 21 − 2 = 19'], 'rule': '× et ÷ avant + et −'},
            'q2': {'chain': '54 000 − 3 × 1 500', 'value': 49500, 'note': 'imprimé « 1500DA » : la 4e dépense serait 49 500 DA (15 000 probable) — discrepancy 3'}},
    answerSource='computed')

assert all([ev('7 + 3 * 4') == 19, ev('(7 + 3) * 4') == 40, ev('7 + (3 * 4)') == 19, ev('48 - 12 / 3') == 44, ev('(48 - 12) / 3') == 12, ev('48 - (12 / 3)') == 44])
assert F(12 + 102, 5) == F(114, 5) and -(-114 // 5) == 23
add('act-3', 'activity', 8, 'أنشطة', False, number=3, title='إنجاز سلسلة عمليات تتضمّن أقواسا',
    text='1) استعمل آلة حاسبة علمية للتأكد من صحة النتائج الآتية: أ) 7 + 3 × 4 = 19 ب) (7 + 3) × 4 = 40 ج) 7 + (3 × 4) = 19 د) 48 − 12 ÷ 3 = 44 هـ) (48 − 12) ÷ 3 = 12 و) 48 − (12 ÷ 3) = 44 . 2) ما دور القوسين في كل من السلسلتين ب) و د)؟ 3) هل وجود القوسين في كل من السلسلتين ج) و هـ) ضروري؟ (الأسطر مقطوعة أسفل الصفحة 8) 4) يريد مكتبي تصفيف 12 كتابا مدرسيا و 102 كتابا آخر في رفوف المكتبة المدرسية، على أن يتضمن كل رف 5 كتب على الأكثر. اكتب سلسلة عمليات تسمح بحساب عدد الرفوف اللازمة لترتيب جميع الكتب، ثمّ احسب عدد هذه الرفوف.',
    answer={'q1': 'les six égalités sont vraies', 'q4': {'chain': '(12 + 102) ÷ 5', 'value': '22,8', 'shelves': 23}}, answerSource='computed',
    note='bas de la p. 8 coupé (q2–q3) ; la q4 commence en haut de la p. 9')
assert ev('(14 + 6) / (3 + 1)') == 5 and ev('1 + 4 / 4 + 16') == 18
add('act-4', 'activity', 9, 'أنشطة', False, number=4, title='الأقواس وحاصل القسمة',
    text='نعتبر A = (14 + 6)/(3 + 1) ، نفترض أنّ كلّا من البسط والمقام عبارة بين قوسين. أ) اكتب A دون رمز خط الكسر، ثم احسبه. ب) أعد حساب A مستعملا الآلة الحاسبة. جـ) إذا حجزنا العبارة 1 + 4 ÷ 4 + 16 على الآلة الحاسبة، ما هي النتيجة التي ستظهر؟',
    answer={'a': '(14 + 6) ÷ (3 + 1) = 5', 'c': 18}, answerSource='computed')
ACT5 = ['(41 + 9) / 5', '24 - (6 + 4)', '12 + 4 * 5', '8 * (13 - 4)']
assert vals(ACT5) == ['10', '14', '32', '72']
add('act-5', 'activity', 9, 'أنشطة', False, number=5, title='وصف سلسلة حسابات',
    text='إليك سلاسل العمليات الآتية: أ) (41 + 9) ÷ 5 ب) 24 − (6 + 4) ج) 12 + 4 × 5 د) 8 × (13 − 4). 1) في كل سلسلة ضع خطّا تحت رمز العملية التي نقوم بها كآخر مرحلة من الحساب. 2) آخر عملية نقوم بها في إجراء سلسلة عمليات هي التي تسمح لنا بوصف تلك السلسلة على أنها مجموع أو فرق أو جداء أو حاصل قسمة. صف كل سلسلة ممّا سبق من خلال ربطها بالملصقة المناسبة (مجموع، جداء، حاصل قسمة، فرق).',
    answer={'names': ['حاصل قسمة', 'فرق', 'مجموع', 'جداء'], 'values': vals(ACT5)}, answerSource='computed')
assert ev('3 * (4,8 + 2,1)') == ev('3 * 4,8 + 3 * 2,1') == F('20.7') and ev('3 * (4,8 - 1,3)') == ev('3 * 4,8 - 3 * 1,3') == F('10.5')
add('act-6', 'activity', 9, 'أنشطة', False, number=6, title='توزيع الضرب على الجمع والطرح',
    text='إليك الشكلين (1) و (2) (وحدة الطول هي cm): مستطيل عرضه 3 وطوله 4,8 + 2,1 (الشكل 1) ، ومستطيل عرضه 3 وطوله 4,8 − 1,3 (الشكل 2). • ماذا تمثل كل من العبارتين؟ 3 × (4,8 + 2,1) و 3 × (4,8 − 1,3). • برّر المساواتين: 3 × (4,8 + 2,1) = 3 × 4,8 + 3 × 2,1 و 3 × (4,8 − 1,3) = 3 × 4,8 − 3 × 1,3 .',
    answer={'areas': [num(ev('3 * (4,8 + 2,1)')), num(ev('3 * (4,8 - 1,3)'))]}, answerSource='computed')

# ── pp. 10–13 : معارف وطرائق ───────────────────────────────────────────────────────────────────────
KNOW1 = {'A': '35 + 12 - 4', 'B': '17 - 7 + 4', 'C1': '36 / 3 * 4', 'D1': '15 / 5 * 4 / 6', 'C2': '13 + 7 * 4', 'D2': '2,5 + 3 * 7 - 35 / 5'}
assert [num(ev(v)) for v in KNOW1.values()] == ['43', '14', '48', '2', '41', '16,5']
add('know-1', 'knowledge', 10, 'معارف', True, number=1, title='إجراء سلسلة عمليات لا تتضمّن أقواسا',
    text='• إجراء سلسلة عمليات جمع وطرح — قاعدة: في سلسلة عمليات جمع وطرح فقط دون أقواس، نُجري العمليات من اليسار نحو اليمين. أمثلة: A = 35 + 12 − 4 = 47 − 4 = 43 ؛ B = 17 − 7 + 4 = 10 + 4 = 14. • إجراء سلسلة عمليات ضرب وقسمة — قاعدة: في سلسلة عمليات ضرب وقسمة فقط دون أقواس، نُجري العمليات من اليسار نحو اليمين. أمثلة: C = 36 ÷ 3 × 4 = 12 × 4 = 48 ؛ D = 15 ÷ 5 × 4 ÷ 6 = 3 × 4 ÷ 6 = 12 ÷ 6 = 2. • أولوية العمليات — قاعدة: في سلسلة عمليات دون أقواس، نُجري الضرب والقسمة قبل الجمع والطرح. نقول إنّ الأولوية للضرب والقسمة. أمثلة: C = 13 + 7 × 4 = 13 + 28 = 41 ؛ D = 2,5 + 3 × 7 − 35 ÷ 5 = 2,5 + 21 − 7 = 23,5 − 7 = 16,5 (نجري أولا عمليتي الضرب والقسمة، تبقى معنا عمليتا الجمع والطرح نجري الحسابات من اليسار إلى اليمين).',
    rules=['+ − فقط: من اليسار نحو اليمين', '× ÷ فقط: من اليسار نحو اليمين', '× ÷ قبل + −'],
    answer=dict(zip(KNOW1.keys(), [num(ev(v)) for v in KNOW1.values()])), answerSource='computed')
assert ev('(4,5 + 27) / 9') == F('3.5') and ev('(3 + 6) * (15 - 5)') == 90 and ev('3 + 6 * 15 - 5') == 88 and ev('8 * (12 - 7)') == 40
add('know-2', 'knowledge', 10, 'معارف', False, number=2, title='إجراء سلسلة عمليات تتضمّن أقواسا',
    text='قاعدة: في سلسلة عمليات تتضمّن أقواسا نبدأ بإنجاز العمليات الموجودة بين قوسين ثم نطبّق إحدى القاعدتين السابقتين حسب ما هو مناسب (صورة منصّة التتويج: ( ) أولا، ثم × ÷ ثم + −). أمثلة: G = (4,5 + 27) ÷ 9 = 31,5 ÷ 9 = 3,5 ؛ F = 3 + 6 × 15 − 5 [imprimé] puis (3 + 6) × (15 − 5) = 9 × 10 = 90 ؛ E = 8 × (12 − 7) = 8 × 5 = 40.',
    answer={'G': '3,5', 'F_printed': 88, 'F_worked': 90, 'E': 40}, answerSource='computed', note='F : voir discrepancy 1.')
assert ev('2,5 * (7 - (5 - 3))') == F('12.5') and ev('(40 + 8) / (15 - 9)') == 8 and ev('(40 + 8) / (15 - 7)') == 6 and ev('36 / (3 * 5 - 6) + 6') == 10
add('method-1', 'method', 11, 'طرائق', False, number=1, title='إنجاز سلسلة عمليات تتضمّن مستويات مختلفة من الأقواس',
    text='تمرين: أنجز سلسلة الحسابات الآتية: A = 2,5 × (7 − (5 − 3)). حل: السلسلة A تتضمّن مستويين من الأقواس: A = 2,5 × (7 − 2) = 2,5 × 5 = 12,5. تعاليق: لإنجاز سلسلة تتضمّن أقواسا متداخلة، نُجري العمليات بدءا من الأقواس الداخلية. ملاحظة: لتفادي الالتباس بين مستويي الأقواس، يُمكن استبدال القوسين الخارجيين ( ) بمعاكفتين [ ]، فنكتب A = 2,5 × [7 − (5 − 3)].',
    answer={'A': '12,5'}, answerSource='computed')
add('method-2', 'method', 11, 'طرائق', False, number=2, title='إنجاز سلسلة عمليات تتضمّن خط كسر',
    text='تمرين: لتكن العبارتان A = (40 + 8)/(15 − 9) و B = 36/(3 × 5 − 6) + 6 . اكتب كل عبارة دون استعمال خط الكسر ثم أنجز الحسابات الضرورية. حل: A = (40 + 8) ÷ (15 − 9) = 48 ÷ 8 [imprimé] = 6 [imprimé] ؛ B = 36 ÷ (3 × 5 − 6) + 6 = 36 ÷ (15 − 6) + 6 = 36 ÷ 9 + 6 = 4 + 6 = 10. تعاليق: في حالة حاصل قسمة المعين بخط كسر، نعتبر البسط أو المقام كعبارة بين قوسين.',
    answer={'A_printed': 6, 'A_true': 8, 'B': 10}, answerSource='computed', note='A : voir discrepancy (15 − 9 = 6, donc 48 ÷ 6 = 8 ; le livre écrit 48 ÷ 8 = 6).')
NOW11B = ['[17 - (5 + 4)] * 2', '24 / [(4 + 2) * 2]', '[13 - (6 - 2)] * 8', '0,5 * [54 - (2 + 8)]']
assert vals(NOW11B) == ['16', '2', '72', '22'] and ev('5 / (11 + 9)') == F(1, 4)
add('now-11', 'practice', 11, 'دوري الآن', False,
    text='① اكتب كل عبارة ممّا يأتي دون استعمال خط الكسر ثم أنجز الحسابات الضرورية: E = 17 + …/20 − … (مقطوعة) ، F = 5/(11 + 9) ، G = 11…/… (مقطوعة) ، H = 17 − 45/(6 × 4 − 9) + 3 . ② أنجز سلسلة الحسابات في كل ممّا يلي: A = [17 − (5 + 4)] × 2 ، C = [13 − (6 − 2)] × 8 ، B = 24 ÷ [(4 + 2) × 2] ، D = 0,5 × [54 − (2 + 8)] .',
    answer={'1': {'F': '1/4', 'H': num(ev('17 - 45 / (6 * 4 - 9) + 3'))}, '2': dict(zip('ABCD', ['16', '2', '72', '22']))}, answerSource='computed',
    note='bord droit coupé : E et G de ① illisibles (discrepancy 8).')
assert ev('3 + 6 * 8') == 51 and ev('(3 + 6) * 8') == 72
add('know-3', 'knowledge', 12, 'معارف', False, number=3, title='وصف سلسلة حسابات',
    text='آخر عملية نقوم بها في إجراء سلسلة عمليات هي التي تسمح لنا بوصف تلك السلسلة على أنها مجموع أو فرق أو جداء أو حاصل قسمة. مثال 1: A = 3 + 6 × 8 ، آخر عملية لحساب السلسلة A هي الجمع، فالسلسلة A عبارة عن مجموع. الحد الأول لهذا المجموع هو 3 والحد الثاني هو الجداء 6 × 8. نقول إنّ السلسلة A هي مجموع العدد 3 و جداء العددين 6 و 8. مثال 2: B = (3 + 6) × 8 ، آخر عملية لحساب السلسلة B هي الضرب، فالسلسلة B عبارة عن جداء. العامل الأول لهذا الجداء هو المجموع 3 + 6 والحد الثاني هو العدد 8. نقول إنّ السلسلة B هي جداء مجموع العددين 3 و 6 والعدد 8.',
    answer={'A': {'name': 'مجموع', 'value': 51}, 'B': {'name': 'جداء', 'value': 72}}, answerSource='computed')
assert ev('3 * (5 + 7)') == ev('3 * 5 + 3 * 7') == 36 and ev('9 * (6 - 2)') == ev('9 * 6 - 9 * 2') == 36
add('know-4', 'knowledge', 12, 'معارف', False, number=4, title='توزيع الضرب على الجمع والطرح',
    text='خاصية: k ، a ، b أعداد عشرية، المساواتان الآتيتان صحيحتان دوما: k × (a + b) = k × a + k × b ؛ k × (a − b) = k × a − k × b. ضرب عدد في مجموع، يعني ضرب هذا العدد في حدّي هذا المجموع. نقول إنّ الضرب توزيعي على الجمع (وعلى الطرح). مثال 1: A = 3 × (5 + 7) = 3 × 5 + 3 × 7 = 15 + 21 = 36. مثال 2: B = 9 × (6 − 2) = 9 × 6 − 9 × 2 = 54 − 18 = 36. ملاحظة: عند الانتقال من جداء إلى مجموع (أو إلى فرق)، نقول إنّنا قمنا بنشر الجداء. عند الانتقال من مجموع (أو فرق) إلى جداء، نقول إنّنا قمنا بتحليل المجموع (أو الفرق).',
    answer={'A': 36, 'B': 36, 'terms': {'نشر': 'جداء → مجموع أو فرق', 'تحليل': 'مجموع أو فرق → جداء'}}, answerSource='computed')
assert ev('17 * 6,1 + 17 * 3,9') == 170 == ev('17 * (6,1 + 3,9)') and ev('13,1 * 16 - 3,1 * 16') == 160 and ev('2,5 * 11') == F('27.5')
add('method-3', 'method', 13, 'طرائق', False, number=3, title='توظيف توزيعية الضرب على الجمع والطرح في الحساب الذهني',
    text='تمرين: اشرح كيف يمكن حساب كل عبارة مما يأتي ذهنيا: أ) A = 17 × 6,1 + 17 × 3,9 ب) B = 13,1 × 16 − 3,1 × 16 ج) C = 2,5 × 11. حل: A = 17 × (6,1 + 3,9) = 17 × 10 = 170 ؛ B = (13,1 − 3,1) × 16 = 10 × 16 = 160 ؛ C = 2,5 × 11 = 2,5 × (10 + 1) = 2,5 × 10 + 2,5 × 1 = 25 + 2,5 = 27,5.',
    answer={'A': 170, 'B': 160, 'C': '27,5'}, answerSource='computed')
E3 = lambda x: ev(f'3 * ({x} - 5)')
assert [E3(12), E3(5), E3('7,5')] == [21, 0, F('7.5')] and ev('3 * (12 - 5)') == 21 and ev('3 * (12 - 5)') == 3 * 12 - 3 * 5
add('method-4', 'method', 13, 'طرائق', False, number=4, title='نشر عبارة جبرية',
    text='تمرين: 1) انشر العبارة E = 3(x − 5). 2) احسب قيمة E من أجل القيم الآتية لـ x : أ) x = 12 ب) x = 5 ج) x = 7,5 . حل: E = 3 × (x − 5) [إظهار الإشارة ×] = 3 × x − 3 × 5 [توظيف توزيعية الضرب على الجمع] = 3x − 15 [3 × x تُكتب 3x و 3 × 5 = 15]. إذا كان x = 12 فإنّ E = 3 × (12 − 5) = 3 × 7 = 35 [sic : 21] ؛ إذا كان x = 5 فإنّ E = 3 × 0 = 0 ؛ إذا كان x = 7,5 فإنّ E = 3 × 2,5 = 7,5. تعاليق: يمكن ألّا نكتب الإشارة × قبل حرف أو قبل قوس. أمثلة: 3 × x = 3x ؛ x × y = xy ؛ 5 × (x − 2) = 5(x − 2) ؛ k × (x − y) = k(x − y) ؛ (x − y) × (a − b) = (x − y)(a − b).',
    answer={'E': '3x − 15', 'values': {'12': 21, '5': 0, '7,5': '7,5'}}, answerSource='computed',
    note='le livre écrit « 3 × 7 = 35 » pour x = 12 : le produit est 21 (3 × 7) — coquille d\'impression (35 = 5 × 7).')
NOW13_2 = ['37 * 9', '6,15 * 110', '26 * 11', '0,84 * 999', '2,3 * 99', '17 * 5,39 - 17 * 2,39']
assert vals(NOW13_2) == ['333', '676,5', '286', '839,16', '227,7', '51']
add('now-13', 'practice', 13, 'دوري الآن', False,
    text='① انشر العبارة F = 5(3a − 2). ② احسب بكيفيتين مختلفتين قيمة F من أجل a = 0,5 . ثم أنجز ذهنيا الحسابات الآتية: 37 × 9 ، 6,15 × 110 ، 26 × 11 ، 0,84 × 999 ، 2,3 × 99 ، 17 × 5,39 − 17 × 2,39 .',
    answer={'F': '15a − 10', 'F_at_0,5': num(ev('5 * (3 * 0,5 - 2)')), 'mental': dict(zip(['37×9', '6,15×110', '26×11', '0,84×999', '2,3×99', '17×5,39−17×2,39'], vals(NOW13_2)))},
    answerSource='computed', note='F(0,5) = −2,5 : résultat négatif avant l\'unité 3 (discrepancy 4).')

# ── pp. 14–16 : أوظّف تعلّماتي ─────────────────────────────────────────────────────────────────────


def exercise(n, page, group, text, verified=False, **extra):
    E.append({'id': f'ex-{n}', 'kind': 'exercise', 'number': n, 'page': page, 'section': 'أوظّف تعلّماتي', 'group': group, 'verified': verified, 'text': text, **extra})


EX1 = ['27 - 15 + 2', '27 - 15 - 2', '27 + 15 - 2', '27 + 15 + 2']
assert vals(EX1) == ['14', '10', '40', '44']
exercise(1, 14, 'إجراء سلسلة عمليات دون أقواس', 'احسب العبارات الآتية: A = 27 − 15 + 2 ، B = 27 − 15 − 2 ، C = 27 + 15 − 2 ، D = 27 + 15 + 2 .', True,
         answer=dict(zip('ABCD', vals(EX1))), answerSource='computed')
EX2 = ['20 / 2 * 5', '10 * 4 / 5 * 2', '50 / 5 / 2 * 9', '12 * 3 / 6 / 2']
assert vals(EX2) == ['50', '16', '45', '3']
exercise(2, 14, 'إجراء سلسلة عمليات دون أقواس', 'احسب العبارات الآتية: A = 20 ÷ 2 × 5 ، B = 10 × 4 ÷ 5 × 2 ، C = 50 ÷ 5 ÷ 2 × 9 ، D = 12 × 3 ÷ 6 ÷ 2 .', True,
         answer=dict(zip('ABCD', vals(EX2))), answerSource='computed')
EX3 = ['15 - 7 + 3', '15 + 7 - 3', '15 - 7 - 3', '15 + 7 + 3', '6 * 3 / 3 * 2', '6 / 1,5 * 2']
assert vals(EX3) == ['11', '19', '5', '25', '12', '8']
exercise(3, 14, 'إجراء سلسلة عمليات دون أقواس', 'احسب ذهنيا: A = 15 − 7 + 3 ، B = 15 + 7 − 3 ، C = 15 − 7 − 3 ، D = 15 + 7 + 3 ، E = 6 × 3 ÷ 3 × 2 ، F = 6 ÷ 1,5 × 2 .', True,
         answer=dict(zip('ABCDEF', vals(EX3))), answerSource='computed')
EX4 = ['7 + 3 * 9', '42 - 9 * 3', '21 / 3 + 4', '37 - 12 / 5', '6,5 - 1,5 * 3', '0,6 * 8 - 3 * 0,2']
assert vals(EX4) == ['34', '15', '11', '34,6', '2', '4,2']
exercise(4, 14, 'أولوية العمليات', 'احسب العبارات الآتية بعد أن تُحيط بلون مميّز العملية التي تُنجزها أوّلًا: A = 7 + 3 × 9 ، B = 42 − 9 × 3 ، C = 21 ÷ 3 + 4 ، D = 37 − 12 ÷ 5 ، E = 0,6 × 8 − 3 × 0,2 ، F = 6,5 − 1,5 × 3 .', True,
         answer=dict(zip('ABCDEF', vals(EX4))), answerSource='computed')
# Khaled : trois erreurs de priorité / d'ordre (lignes imprimées) ; C est incohérent (discrepancy 9).
assert ev('7 + 3 * 5') == 22 and (7 + 3) * 5 == 50           # A : il a additionné avant de multiplier
assert ev('15 - 4 + 2') == 13 and 15 - (4 + 2) == 9           # B : il a calculé 4 + 2 d'abord
assert ev('3 + 2 * 5 + 4') == 17 and 5 * 9 == 45              # D : il a additionné 3 + 2 puis multiplié par (5 + 4)
assert ev('30 - 9 / 2') == F('25.5') and (30 - 9) / 3 == 7    # C : « 21 ÷ 3 » ne découle pas de « 30 − 9 ÷ 2 »
exercise(5, 14, 'أولوية العمليات', 'تمعّن في العمل الذي قام به زميلك خالد، ثمّ صحّح الأخطاء المرتكبة. A = 7 + 3 × 5 = 10 × 5 = 50 ؛ B = 15 − 4 + 2 = 15 − 6 = 9 ؛ C = 30 − 9 ÷ 2 = 21 ÷ 3 = 7 ؛ D = 3 + 2 × 5 + 4 = 5 × 9 = 45 .', True,
         answer={'corrections': {'A': {'wrong': 50, 'right': 22, 'error': 'a additionné 7 + 3 avant de multiplier'},
                                 'B': {'wrong': 9, 'right': 13, 'error': 'a calculé 4 + 2 avant de soustraire (de droite à gauche)'},
                                 'C': {'wrong': 7, 'right': '25,5', 'error': 'a soustrait avant de diviser ; la ligne « 21 ÷ 3 » suppose 30 − 9 ÷ 3 (discrepancy 9)'},
                                 'D': {'wrong': 45, 'right': 17, 'error': 'a additionné avant de multiplier puis multiplié par le reste'}}},
         answerSource='computed', reading='C relu à 220 dpi : « C = 30 − 9 ÷ 2 » puis « C = 21 ÷ 3 » (2 ≠ 3).')
EX6 = ['18 - 12 / 3', '6 + 3 * 10', '20 / 2 * 5', '9 * 8 + 1']
assert vals(EX6) == ['14', '36', '50', '73']
exercise(6, 14, 'الحساب الذهني', 'احسب ذهنيا: A = 6 + 3 × 10 ، B = 18 − 12 ÷ 3 ، C = 9 × 8 + 1 ، D = 20 ÷ 2 × 5 .', True,
         answer={'A': '36', 'B': '14', 'C': '73', 'D': '50'}, answerSource='computed')
# ex-7 : compléter avec + − × ÷ (la 2e ligne est coupée au bas de la page).
OPS = '+-×÷'


def fill(a, b, c, target):
    out = []
    for o1, o2 in product(OPS, repeat=2):
        s = f'{a} {o1} {b} {o2} {c}'
        try:
            if ev(s) == target:
                out.append(s.replace('-', '−'))
        except ZeroDivisionError:
            pass
    return out


EX7A, EX7B = fill(2, 7, 6, 20), fill(5, 15, 3, 10)
assert '2 × 7 + 6' in EX7A and '5 + 15 ÷ 3' in EX7B
exercise(7, 14, 'أتمم بالعمليات', 'أتمم مستعملا + ، − ، × أو ÷ بحيث تكون كل مساواة مما يأتي صحيحة: 2 … 7 … 6 = 20 ؛ 5 … 15 … 3 = 10 … (السطر الثاني مقطوع في أسفل الصفحة).', True,
         answer={'2…7…6 = 20': EX7A, '5…15…3 = 10': EX7B}, answerSource='computed', note='bas de la p. 14 coupé : au moins un autre item de cette liste est illisible (discrepancy 8).')
EX8 = ['3 * (17 + 3)', '45 - (22 + 8)', '(13 + 8) / 7 + 3', '62 - (8 + 3) * 2', '(9,1 - 4,3) * 10', '7 + 3 * (8 - 2)', '16 / (5 * 1,2 + 6 / 3)', '4 * (7,1 * 14 - 9,5)']
exercise(8, 14, 'إجراء سلسلة عمليات بأقواس', 'احسب العبارات الآتية: A = 45 − (22 + 8) ، B = 3 × (17 + 3) ، C = 62 − (8 + 3) × 2 ، D = (13 + 8) ÷ 7 + 3 ، E = 7 + 3 × (8 − 2) ، F = (9,1 − 4,3) × 10 ، G = 4 × (7,1 × 14 − 9,5) ، H = 16 ÷ (5 × 1,2 + 6 ÷ 3) .',
         answer=dict(zip('BADCFEHG', vals(EX8))), answerSource='computed')
assert ev('(6 + 4) * 15') == 150 and ev('(5 + 2,7) * (2,5 * 4)') == 77 and ev('(23 - 8) * 2 + 5') == 35
exercise(9, 14, 'أشجار الحساب', 'الشجرة A: الأعداد 6 ، 4 ، 15 (6 + 4 ثم × 15) ؛ الشجرة B: 5 ، 2,7 ، 2,5 ، 4 (5 + 2,7 و 2,5 × 4 ثم ×). 1) انقل ثمّ أتمم الشجرة A. 2) أي العبارتين 15 × 4 + 6 ؛ 15 × (4 + 6) تُوافق الحساب المنجز وفق الشجرة A؟ 3) انقل وأتمم الشجرة B ، ثم اكتب عبارة تترجم الحساب المنجز وفقها. 4) ارسم ثم أتمم شجرة توافق السلسلة (23 − 8) × 2 + 5 .',
         answer={'A': '(6 + 4) × 15 = 150', 'B': '(5 + 2,7) × (2,5 × 4) = 77', '4': '(23 − 8) × 2 + 5 = 35'}, answerSource='computed',
         note='l\'énoncé 2) est écrit « 6 + 4 × 15 ; (6 + 4) × 15 » ; la première est 66, la seconde 150.')
assert ev('9 * 7 - 4') == 59 and ev('9 * (7 - 4)') == 27 and ev('(8 + 5) * 2') == 26 and ev('3 * (4 + 2) * 5') == 90 and ev('12 - (9 + 3)') == 0
exercise(10, 14, 'وضع الأقواس', 'أظهر الأقواس في المكان المناسب بحيث تكون كل مساواة مما يأتي صحيحة: 9 × 7 − 4 = 27 ؛ 8 + 5 × 2 = 26 ؛ 3 × 4 + 2 × 5 = 90 ؛ 12 − 9 + 3 = 0 .',
         answer=['9 × (7 − 4)', '(8 + 5) × 2', '3 × (4 + 2) × 5', '12 − (9 + 3)'], answerSource='computed')
EX11 = ['3 * (8 + 7)', '17 - (9 + 8)', '(18,5 - 3,5) - (9 - 4)', '32 - (24 - 8)', '(4 + 6) * 2 + 5', '(7 - 3) * (6 + 2)']
exercise(11, 14, 'الحساب الذهني', 'احسب ذهنيا: A = 17 − (9 + 8) ، B = 3 × (8 + 7) ، C = 32 − (24 − 8) ، D = (18,5 − 3,5) − (9 − 4) ، E = (7 − 3) × (6 + 2) ، F = (4 + 6) × 2 + 5 .',
         answer=dict(zip('BADCFE', vals(EX11))), answerSource='computed')
assert num(ev('60,8 + 39,9 - 51,02')) == '49,68'
exercise(12, 14, 'رتبة مقدار', 'أ) جد ذهنيا رتبة مقدار كل نتيجة: A = 60,8 + 39,9 − 51,02 ، B ، C (مقطوعتان أسفل الصفحة 14) ، D = (75,3 − 65,4) × 40,2… ، E = 9,7 × 4 × (107,9 − 8… (مقطوعتان على الحافة اليمنى). ب) أنجز الحسابات السابقة باستعمال آلة حاسبة.',
         answer={'A': '49,68 (≈ 50)'}, answerSource='computed', reading='D et E coupées à droite ; B et C coupées en bas de page (discrepancy 7) : verified false.')
assert ev('15 * 6 + 4') == 94 and ev('15 * (6 + 4)') == 150 and ev('(15 + 6) * 4') == 84
exercise(13, 15, 'ترجمة وضعية', 'اربط كل مشكلة مما يأتي بالعبارة الحسابية التي تسمح بحلّها: أ) 15 × 6 + 4 ب) 15 × (6 + 4) ج) (15 + 6) × 4 . • خلال العطلة الشتوية التي دامت 15 يوما، يقوم الخال أحمد بالعدو يوميا، فيقطع مسافة 6km صباحا و 4km مساء؛ احسب المسافة الكلية. • قرّر 15 تلميذا من قسم 2م1 و 6 تلاميذ من قسم 2م2 القيام بجمع الطوابع البريدية القديمة؛ قام كل تلميذ بإحضار 4 طوابع؛ احسب عدد الطوابع التي تم جمعها. • بعد أن لاحظ مقتصد المؤسسة وجود 4 أقلام حبر فقط في المخزن، قام باقتناء 15 علبة، تحتوي كل علبة على 6 أقلام؛ احسب العدد الكلي للأقلام.',
         answer={'ب': 150, 'ج': 84, 'أ': 94}, answerSource='computed', note='les trois énoncés se suivent dans l\'ordre ب، ج، أ ; bord droit coupé.')
assert vals(['[19 - (21 - 17)] * 3', '4 * [2 + (11 + 9) / 5]', '52 - [17 - (3 + 4) * 2]']) == ['45', '24', '49']
exercise(14, 15, 'أقواس متداخلة', 'احسب العبارات الآتية: A = [19 − (21 − 17)] × 3 ، B = 4 × [2 + (11 + 9) ÷ 5] ، C = 52 − [17 − (3 + 4) × 2] .',
         answer={'A': 45, 'B': 24, 'C': 49}, answerSource='computed')
assert vals(['16,8 / (13 - 9)', '(13 + 5) / (19 - 14)', '24 / (9 - 3)', '21 / 7 - 2']) == ['4,2', '3,6', '4', '1']
exercise(15, 15, 'الأقواس وحاصل القسمة', 'اكتب العبارات الآتية دون استعمال خط الكسر: 16,8/(13 − 9) ، (13 + 5)/(19 − 14) ، 24/(9 − 3) ، 21/7 − 2 (الأخيرة مقطوعة).',
         answer=['16,8 ÷ (13 − 9) = 4,2', '(13 + 5) ÷ (19 − 14) = 3,6', '24 ÷ (9 − 3) = 4', '21 ÷ 7 − 2 = 1'], answerSource='computed')
assert vals(['7 - 6 / 2', '9 / (11 + 8)', '25 / (18 / 9)']) == ['4', '9/19', '12,5']
exercise(16, 15, 'الأقواس وحاصل القسمة', 'اكتب العبارات الآتية مستعملا خط الكسر: B = 7 − 6 ÷ 2 ، A = 9 ÷ (11 + 8) ، D = 25 ÷ (18 ÷ 9) ، C = (5 + 12) ÷ (14 + 4 (مقطوعة).',
         answer={'B': '7 − 6/2 = 4', 'A': '9/(11 + 8)', 'D': '25/(18 ÷ 9)', 'C': '(5 + 12)/(14 + 4)'}, answerSource='computed')
assert ev('12 + 3 / 5') == F('12.6') and ev('(12 + 3) / 5') == 3
exercise(17, 15, 'الآلة الحاسبة', 'من أجل حساب (12 + 3)/5 حجز يونس على آلته الحاسبة سلسلة الملامس الآتية: [1][2][+][3][÷][5] ، فظهرت على الشاشة النتيجة 12,6 . 1) احسب باليد (دون استعمال الآلة الحاسبة) العبارة (12 + 3)/5 ، ماذا تستنتج؟ 2) اشرح النتيجة التي ظهرت على شاشة الآلة الحاسبة. 3) ما هي سلسلة الملامس التي كان على يونس حجزها؟',
         answer={'1': 3, '2': '12 + 3 ÷ 5 = 12,6 (la machine divise 3 par 5 d\'abord)', '3': '( 1 2 + 3 ) ÷ 5 ='}, answerSource='computed')
assert vals(['7 + 6 * 5', '(23 - 7) / 4', '25 * (18 - 14)', '25 - (18 - 14)']) == ['37', '4', '100', '21']
exercise(18, 15, 'وصف سلسلة حسابات', 'اكتب سلسلة العمليات الموافقة لكل جملة ثمّ أنجز الحساب: • مجموع العددين 7 و 6 × 5 . • حاصل قسمة العددين 23 − 7 على 4 . • جُداء العددين 25 و 18 − 14 . • فرق العددين 25 و 18 − 14 بهذا الترتيب.',
         answer=['7 + 6 × 5 = 37', '(23 − 7) ÷ 4 = 4', '25 × (18 − 14) = 100', '25 − (18 − 14) = 21'], answerSource='computed')
EX19 = ['35 - (14 + 9)', '4 + 5 * 8', '45 - 21 / 7', '9 * (2,5 + 0,9)', '6 * 3 + 4 * 5', '15 / 2 * 3']
assert vals(EX19) == ['12', '44', '42', '30,6', '38', '22,5']
exercise(19, 15, 'وصف سلسلة حسابات', 'أحط بدائرة العملية التي تُنجز آخرا، ثمّ صف كل عبارة مما يأتي كما هو موضّح في المثال: 7 × (4 + 5) عبارة عن جُداء (جُداء العدد 7 ومجموع العددين 4 و 5). ب) 35 − (14 + 9) ج) 4 + 5 × 8 د) 45 − 21 ÷ 7 هـ) 9 × (2,5 + 0,9) و) 6 × 3 + 4 × 5 ز) 15 ÷ 2 × 3 .',
         answer={'values': vals(EX19), 'names': ['فرق', 'مجموع', 'فرق', 'جداء', 'مجموع', 'جداء']}, answerSource='computed')
assert [ev(f'{a} + {b} / {c}') for a, b, c in [(32, 6, 10)]] == [F('32.6')] and ev('(32 + 6) / 10') == F('3.8') and ev('32 / (6 + 10)') == 2
exercise(20, 15, 'وصف سلسلة حسابات', 'نضع: a = 32 ؛ b = 6 ؛ c = 10 . احسب: أ) a + b/c ؛ ب) (a + b)/c ؛ ج) a/(b + c) .',
         answer={'a+b/c': '32,6', '(a+b)/c': '3,8', 'a/(b+c)': 2}, answerSource='computed')
assert ev('13 * (24 + 3)') == ev('13 * 24 + 13 * 3') and ev('4 * 8 - 4 * 3') == ev('4 * (8 - 3)') and ev('23 * 30 - 23 * 7') == ev('23 * (30 - 7)') and ev('(12 - 5) * 17') == ev('12 * 17 - 5 * 17')
exercise(21, 15, 'توزيع الضرب بالنسبة إلى الجمع والطرح', 'انقل ثمّ أتمم: أ) 13 × (24 + 3) = 13 × … + 13 × … ب) 4 × 8 − 4 × 3 = 4 × ( … − … ) ج) 23 × 30 − 23 × 7 = … × (30 − …) د) (12 − 5) × 17 = 12 × … − … × … .',
         answer=['13 × 24 + 13 × 3', '4 × (8 − 3)', '23 × (30 − 7)', '12 × 17 − 5 × 17'], answerSource='computed')
EX22 = {'B': ('(24 + 6) * 1,5', False), 'A': ('15 - (3 * 4)', True), 'D': ('6 * (8 * 2)', True), 'C': ('(12 * 4) - (9,5 - 7)', True)}
exercise(22, 15, 'أقواس غير ضرورية', 'أعد كتابة كل عبارة من العبارات الآتية بعد حذف الأقواس غير الضرورية، ثمّ أنجز الحسابات: B = (24 + 6) × 1,5 ، A = 15 − (3 × 4) ، D = 6 × (8 × 2) ، C = (12 × 4) − (9,5 − 7) .',
         answer={'A': '15 − 3 × 4 = 3', 'B': 'les brackets sont nécessaires : 45', 'C': '12 × 4 − (9,5 − 7) = 45,5', 'D': '6 × 8 × 2 = 96'}, answerSource='computed')
assert ev('6 * (25 + 9)') != ev('6 * 25 - 6 * 9') and ev('14 * (11 - 9)') != ev('14 * 11 - 9') and ev('50 * 7 - 50 * 3') != ev('50 * (7 + 3)') and ev('8 * 13 - 8 * 7') != ev('8 * (13 - 8)')
exercise(23, 16, 'أخطاء', 'تمعّن في وثيقة زميلتك سميرة، ثمّ صحّح الأخطاء المرتكبة: 6 × (25 + 9) = 6 × 25 − 6 × 9 ؛ 14 × (11 − 9) = 14 × 11 − 9 ؛ 50 × 7 − 50 × 3 = 50 × (7 + 3) ؛ 8 × 13 − 8 × 7 = 8 × (13 − 8) .',
         answer=['6 × 25 + 6 × 9', '14 × 11 − 14 × 9', '50 × (7 − 3)', '8 × (13 − 7)'], answerSource='computed')
exercise(24, 16, 'نشر', 'انشر العبارات الآتية دون إجراء الحسابات: B = 9,5 × (4,2 − 5) ، A = 15 × (7 + 9) ، D = (9,7 − 5,8) × 100 ، C = (9 + 14) × 3,6 .',
         answer={'A': '15 × 7 + 15 × 9', 'C': '9 × 3,6 + 14 × 3,6', 'D': '9,7 × 100 − 5,8 × 100', 'B': '9,5 × 4,2 − 9,5 × 5 (différence négative : discrepancy 5)'}, answerSource='computed')
EX25 = ['3,4 * 15 - 3,4 * 11', '5 * 13 + 5 * 19', '17,8 * 4 - 6,6 * 4', '9,3 * 7 + 5,4 * 7']
exercise(25, 16, 'تحليل', 'حلّل المجاميع أو الفروق الآتية دون إجراء حسابات: B = 3,4 × 15 − 3,4 × 11 ، A = 5 × 13 + 5 × 19 ، D = 17,8 × 4 − 6,6 × 4 ، C = 9,3 × 7 + 5,4 × 7 .',
         answer={'B': '3,4 × (15 − 11) = 13,6', 'A': '5 × (13 + 19) = 160', 'D': '(17,8 − 6,6) × 4 = 44,8', 'C': '(9,3 + 5,4) × 7 = 102,9', 'check': vals(EX25)}, answerSource='computed')
EX26 = ['6,5 * (9 - 4)', '8 * (7 + 2)', '54,8 * 10 - 32,6 * 10', '3 * 12 + 3 * 5,5']
assert vals(EX26) == ['32,5', '72', '222', '52,5']
exercise(26, 16, 'بطريقتين', 'احسب بطريقتين مختلفتين كل عبارة مما يأتي: B = 6,5 × (9 − 4) ، A = 8 × (7 + 2) ، D = 54,8 × 10 − 32,6 × 10 ، C = 3 × 12 + 3 × 5,5 .',
         answer=dict(zip('BADC', vals(EX26))), answerSource='computed')
assert ev('8 * 12 - 3 * 12') == ev('(8 - 3) * 12') == 60
exercise(27, 16, 'مسألة', 'قام العم أحمد بغرس 8 صفوف من فاكهة الفراولة، يحتوي كل صف على 12 نبتة، إلّا أنّ 3 صفوف منها أُتلفت. احسب بطريقتين مختلفتين عدد النبتات المتبقّية.',
         answer={'two ways': ['8 × 12 − 3 × 12', '(8 − 3) × 12'], 'value': 60}, answerSource='computed')
assert 574 * 58 == 574 * 60 - 574 * 2 == 33292
exercise(28, 16, 'الحساب بالآلة', 'الملمسان ( ) و 8 في الآلة الحاسبة لزميلك يونس معطّلان. ما هي العبارة التي يحجزها على الآلة كي يحسب 574 × 58 ؟',
         answer={'idea': '574 × 60 − 574 × 2 (58 = 60 − 2, sans la touche 8 ni les parenthèses)', 'value': 33292}, answerSource='computed')
exercise(29, 16, 'مثلث متساوي الساقين', 'محيط المثلث المتساوي الساقين 22cm (القاعدة 7cm). من بين المساويات الآتية، حدّد تلك التي تمكّن من حساب طول الساق ثم احسبه: B = (22 − 7) × 2 ، A = 22 − 7 ÷ 2 ، D = 22 − 7 × 2 ، C = (22 − 7) ÷ 2 .',
         answer={'right': 'C', 'leg': num(ev('(22 - 7) / 2'))}, answerSource='computed')
assert ev('3,3 + 1,9 + 3,8') == 9 and ev('(3,3 + 2,1) * 1,9 / 2') == F('5.13')
exercise(30, 16, 'مثلثان', 'اكتب عبارتين تمكّنان من حساب كل من: أ) محيط المثلث ABD ب) مساحة المثلث ACD ثمّ أنجز الحسابات اللازمة. (الشكل: AB = 3,3 ، BD = 1,9 ، AD = 3,8 ، BC = 2,1 ، BD ⟂ AC).',
         answer={'perimeterABD': '3,3 + 1,9 + 3,8 = 9', 'areaACD': '(3,3 + 2,1) × 1,9 ÷ 2 = 5,13'}, answerSource='computed', reading='étiquettes de la figure lues à 130 dpi : 2,1 sur [BC] à vérifier par L2.')
assert ev('6,2 * 1,6 + 3,8 * 1,6') == 16 == ev('(6,2 + 3,8) * 1,6')
exercise(31, 16, 'مساحة بالذهن', 'حسب يونس مساحة الشكل الآتي ذهنيا (الأبعاد مقدّرة بالسنتيمتر: 6,2 ، 1,6 ، 3,8 ، 1,6) ووجد 16cm². كيف تمكّن من ذلك؟ (شكل T).',
         answer={'idea': '(6,2 + 3,8) × 1,6 = 16', 'value': 16}, answerSource='computed')
EX32 = ['27 * 9', '23 * 11', '15 * 99', '13 * 999', '34 * 1,1', '16 * 0,9']
exercise(32, 16, 'الحساب الذهني', 'احسب ذهنيا: أ) 27 × 9 ب) 23 × 11 ج) 15 × 99 د) 13 × 999 هـ) 34 × 1,1 و) 16 × 0,9 .', answer=vals(EX32), answerSource='computed')
assert ev('6 * 43') == 258 and ev('6 * (43 - 8)') == 210 and ev('7 * 524') == 3668 and ev('7 * (524 + 2)') == 3682
exercise(33, 16, 'استغلال نتيجة', 'إذا علمت أنّ 6 × 43 = 258 احسب ذهنيا 6 × (43 − 8) . (2) إذا علمت أنّ 7 × 524 = 3668 احسب ذهنيا 7 × (524 + 2) .',
         answer={'1': 210, '2': 3682}, answerSource='computed')
assert ev('35,4 * 8') == F('283.2') and ev('35,4 * 6') == F('212.4') and ev('35,4 * 608') == F('21523.2')
exercise(34, 16, 'استغلال نتيجة', 'إذا علمت أنّ 35,4 × 8 = 283,2 و 35,4 × 6 = 212,4 اشرح كيف يمكن استغلال النتيجتين السابقتين لحساب 35,4 × 608 = 283,2 [sic].',
         answer={'idea': '35,4 × 608 = 35,4 × 600 + 35,4 × 8 = 21 240 + 283,2', 'value': '21523,2', 'printedValue': '283,2'}, answerSource='computed',
         reading='la fin de l\'énoncé écrit « = 283,2 » : valeur imprimée fausse (discrepancy 9).')
exercise(35, 16, 'مجموع وفرق', 'انقل ثمّ أتمم العبارات: 4x + 3x = (4 + …)x = …x ؛ 7x − 2x = (7 − …)x = …x ؛ 9x + x = (9 + …)x = …x ؛ 17x − x = (17 − …)x = …x .',
         answer=['7x', '5x', '10x', '16x'], answerSource='computed')
exercise(36, 16, 'تبسيط', 'بسّط العبارات الآتية (حاول ذهنيا إن أمكن ذلك): 15x − 10x + 7x ، 5x + 2x + 3x ، 25b − 24b ، 5a + a … (الأسطر الأخيرة مقطوعة).',
         answer=['12x', '10x', 'b', '6a'], answerSource='computed', reading='bas de la p. 16 coupé (discrepancy 8).')

# ── p. 17 : أؤكّد تعلّماتي (10 items, colonne « عند الإخفاق أعود إلى الصفحة ») ─────────────────────────


def self_item(n, pages, text, verified=False, **extra):
    E.append({'id': f'self-{n}', 'kind': 'selfcheck', 'number': n, 'page': 17, 'section': 'أؤكّد تعلّماتي', 'reviewPages': pages, 'verified': verified, 'text': text, **extra})


SELF1 = ['64 - 37 + 3', '17 - 7 * 2', '45 - 15 / 3 + 7', '27 - 2 + 8', '5 * 8 - 8 / 4', '5 * 4 - 2 / 2 * 3,3']
assert vals(SELF1) == ['30', '3', '47', '33', '38', '16,7']
self_item(1, [10], 'احسب: A = 64 − 37 + 3 ، B = 17 − 7 × 2 ، C = 45 − 15 ÷ 3 + 7 ، D = 27 − 2 + 8 ، E = 5 × 8 − 8 ÷ 4 ، F = 5 × 4 − 2 ÷ 2 × 3,3 .', True,
          answer=dict(zip('ABCDEF', vals(SELF1))), answerSource='computed')
assert vals(['23 - 3 * (22 - 17)', '10 * (5,4 + 9)', '47 - (13 + 63 / 7)', '2 * (11 * 10 - 1)']) == ['8', '144', '25', '218']
self_item(2, [10], 'احسب: أ) 23 − 3 × (22 − 17) ب) 10 × (5,4 + 9) ج) 47 − (13 + 63 ÷ 7) د) 2 × (11 × 10 − 1) .', answer=['8', '144', '25', '218'], answerSource='computed')
assert vals(['7 - 7 + 7 / 7 * 7', '(7 - 7 / 7) * 7 + 7', '[(7 + 7) * 7 - 7] / 7']) == ['7', '49', '13']
self_item(3, [10, 11], 'احسب: A = 7 − 7 + 7 ÷ 7 × 7 ، B = (7 − 7 ÷ 7) × 7 + 7 ، C = [(7 + 7) × 7 − 7] ÷ 7 .', answer={'A': 7, 'B': 49, 'C': 13}, answerSource='computed')
self_item(4, [10], 'اكتب ما ينبغي حجزه على الآلة الحاسبة من أجل حساب كل عبارة ممّا يأتي: A = 24 + 22,2/6 − 3,3 ، B = (24 + 22,2)/6 − 3,6 ، C = 24 + (22,2 − 3,6)/6 .',
          answer={'A': '24 + 22,2 ÷ 6 − 3,3', 'B': '( 24 + 22,2 ) ÷ 6 − 3,6', 'C': '24 + ( 22,2 − 3,6 ) ÷ 6', 'values': vals(['24 + 22,2 / 6 - 3,3', '(24 + 22,2) / 6 - 3,6', '24 + (22,2 - 3,6) / 6'])}, answerSource='computed')
assert ev('2,5 - 2 * 7') < 0 and ev('(45 - 14) / 0,3') > 0
self_item(5, [12], 'اربط كل عبارة من العمود الموجود على اليمين بما يناسبها في العمود الموجود على اليسار: 2,5 − 2 × 7 ؛ (45 − 14) ÷ 0,3 ؛ (14 + 29,5) × (12 − 2) ؛ 9 + (15 − 4) — مجموع ، فرق ، جداء ، حاصل قسمة .',
          answer={'2,5 − 2 × 7': 'فرق', '(45 − 14) ÷ 0,3': 'حاصل قسمة', '(14 + 29,5) × (12 − 2)': 'جداء', '9 + (15 − 4)': 'مجموع'}, answerSource='computed',
          note='2,5 − 2 × 7 est NÉGATIF (−11,5) : nommer seulement, jamais calculer (discrepancy 6).')
assert 82 - 27 - 33 == 22
self_item(6, [10], 'إذا علمت أنّ DOA = 82° ، اكتب عبارة عددية واحدة تسمح بحساب قيس الزاوية BOC . (الشكل: أشعة OA ، OB ، OC ، OD ، قيس AOB = 27° وقيس COD = 33°).', True,
          answer={'chain': '82 − 27 − 33', 'value': 22, 'unit': '°'}, answerSource='computed')
EX_S7 = ['13 * (45 - 5,5)', '3,2 * 7 + 3,2 * 14', '8 * 1,25 + 5 * 1,25', '(70 - 0,9) * 0,1']
self_item(7, [12], 'احسب بطريقتين مختلفتين كل عبارة ممّا يأتي: A = 13 × (45 − 5,5) ، B = 3,2 × 7 + 3,2 × 14 ، C = 8 × 1,25 + 5 × 1,25 ، D = (70 − 0,9) × 0,1 .',
          answer=dict(zip('ABCD', vals(EX_S7))), answerSource='computed')
assert 48 * 7 == (40 + 8) * 7 == (50 - 2) * 7 == 336
self_item(8, [12], 'احسب ذهنيا 48 × 7 موظّفا: أ) 48 × 7 = (40 + 8) × 7 ب) 48 × 7 = (50 − 2) × 7 .', answer={'value': 336}, answerSource='computed')
assert [9 * F('0.5') - 4, 9 * 2 - 4] == [F('0.5'), 14]
self_item(9, [13], 'احسب قيمة العبارة 9x − 4 من أجل: أ) x = 0,5 ب) x = 2 .', answer={'x=0,5': '0,5', 'x=2': 14}, answerSource='computed')
self_item(10, [13], 'انشر كل عبارة من العبارات: أ) 5(x − 7) ب) (a + 4) × 3 ج) 6(2x − 1) .', answer=['5x − 35', '3a + 12', '12x − 6'], answerSource='computed')

# ── pp. 18–19 : أتعمّق (numérotés 37–53) ───────────────────────────────────────────────────────────


def deep(n, page, text, verified=False, **extra):
    E.append({'id': f'deep-{n}', 'kind': 'deepen', 'number': n, 'page': page, 'section': 'أتعمّق', 'verified': verified, 'text': text, **extra})


CW_H = ['505 * 4 - 2', '63 - [6 / 2 * (5 - 1)]', '36 - 12 / 3', '2 * [(80 - 9) * 10 + 9]', '120 / 2 + 61']
deep(37, 18, 'أعداد متقاطعة (شبكة 5 × 5 بخانات ملوّنة): أفقيا ① 505 × 4 − 2 ② 63 − [6 ÷ 2 × (5 − 1)] ؛ 36 − 12 ÷ 3 ③ 2 × [(80 − 9) × 10 + 9] ④ 120/2 + 61 ؛ رتبة مقدار لنتيجة 2,03 × 6 − 4 ⑤ سنة اندلاع الثورة التحريرية. عموديا: ① جُداء العدد 2 ومجموع 40 و 0,5 ؛ 2 × 2,4 + 4,6 × 2 ② 3 × 25 × 211 ③ 15 − 1 + 6,5 × 2 ؛ 11 × 29 ④ 3,2 × 7 × 10 ؛ 10 × 0,1 ⑤ 50 × 6 + 6 × 3 .',
     answer={'horizontal': vals(CW_H), 'vertical': vals(['2 * (40 + 0,5)', '2 * 2,4 + 4,6 * 2', '3 * 25 * 211', '15 - 1 + 6,5 * 2', '11 * 29', '3,2 * 7 * 10', '10 * 0,1', '50 * 6 + 6 * 3']), 'revolution': 1954},
     answerSource='computed', reading='la grille et la numérotation des lignes ne sont lisibles qu\'en partie ; verified false.')
assert vals(['[44 + 5 * (17 - 2 * 6)] / 2', '2 * [(25 - 17,1) * 3 + 11,3]', '(14,7 - 6,2) * [30 - (12,1 + 17,8)]']) == ['34,5', '70', '0,85']
deep(38, 18, 'احسب العبارات الآتية: A = [44 + 5 × (17 − 2 × 6)] ÷ 2 ، B = 2 × [(25 − 17,1) × 3 + 11,3] ، C = (14,7 − 6,2) × [30 − (12,1 + 17,8)] .',
     answer={'A': '34,5', 'B': 70, 'C': '0,85'}, answerSource='computed')
assert (29 - 8) / 2 == F('10.5') and (25 - 4) / 3 == 7 and (19 - 9 + 4) / 2 == 7 and (50 - 42) / 4 == 2
assert ev('8 + 2 * 10,5') == 29 and ev('4 + 3 * 7') == 25 and ev('9 - 4 + 2 * 7') == 19 and ev('7 * 6 + 4 * 2') == 50
deep(39, 18, 'انقل ثمّ أتمم: أ) 8 + 2 × … = 29 ب) 4 + 3 × … = 25 ج) 9 − 4 + 2 × … = 19 د) 7 × 6 + 4 × … = 50 .', True,
     answer={'أ': '10,5', 'ب': 7, 'ج': 7, 'د': 2}, answerSource='computed', note='le nombre de أ) est décimal (10,5) ; les trois autres sont naturels.')
deep(40, 18, 'باستبدال النقط في السلسلة: 4 … 4 … 4 … 4 … 4 بإشارات العمليات الحسابية (+ ، − ، × ، ÷) وأقواس استطاع يونس أن يتحصل على جميع الأعداد الطبيعية من 0 إلى 9. اشرح كيف فعل ذلك؟',
     answer={'examples': {'0': '4 + 4 − 4 − 4 + 4 …', '1': '(4 + 4 − 4) ÷ 4 ... (cinq 4)'}}, answerSource='computed', reading='cinq 4 imprimés ; réponses non unifiées ; verified false.')
deep(41, 18, 'إليك العبارتين: [le texte des deux expressions est coupé au bord gauche de la page] استبدل في كل من الحالتين السابقتين كل حرف بعدد من الأعداد الأربعة السابقة (لا تستعمل أي عدد إلّا مرّة واحدة)، لتحصل على أكبر نتيجة.',
     reading='bord gauche de la page coupé : les expressions sont illisibles (discrepancy 8).')
deep(42, 18, 'احسب 243 528 729 × 574 . يُمكنك استعمال الآلة الحاسبة.', answer={'value': 243528729 * 574, 'digits': len(str(243528729 * 574))}, answerSource='computed',
     note='le produit dépasse l\'affichage d\'une calculatrice ordinaire (distributivité : 243 528 729 × (500 + 74)).')
deep(43, 18, 'اكتب سلسلة عمليات واحدة تسمح بحساب الطول BN. (قطعة [AB] طولها 25,4cm ، AM = 4,4cm ، عليها تقسيمات متقايسة).',
     reading='le comptage des graduations sur la figure n\'est pas fait ici.')
deep(44, 19, 'اكتب عبارة تَسمح بحساب محيط الشكل الآتي (مستطيل 3cm × 7cm مضاف إليه دائرة) وأعط قيمة مقرّبة إلى الجزء من الألف لهذا المحيط.',
     reading='figure à analyser par la leçon de synthèse (le rayon du cercle se lit sur le pointillé).')
assert ev('10,5 * 10,5 - 10,5 * 2 / 2') == F('99.75')
deep(45, 19, 'الرباعي BCDE مربّع (ضلعه 10,5cm). اكتب سلسلة عمليات تسمح بحساب مساحة الخماسي BCDEA . (A داخل المربّع وبعده عن [BE] يساوي 2cm).',
     answer={'chain': '10,5 × 10,5 − 10,5 × 2 ÷ 2', 'value': '99,75'}, answerSource='computed', reading='cote « 2cm » lue entre la ligne pointillée de A et le sommet E.')
deep(46, 19, 'طول القطر [AB] يساوي 10cm. احسب طول محيط المضلّع المرسوم داخل المستطيل (مسابقة أجنبية). (الشكل: دائرة ومستطيل مقسّم إلى مربّعات والمضلّع المرسوم بخطوط خضراء).',
     reading='la figure est coupée à droite et en bas : illisible (discrepancy 8).')
EX47 = ['(4 + 3) * 5', '(1,5 + 3) * 5']
assert vals(EX47) == ['35', '22,5']
deep(47, 19, 'برنامج الحساب الآتي: اختر عددا. أضف إليه 3. اضرب الناتج في 5. أ) فعّل البرنامج معتبرا العدد المختار في البداية: 4 ؛ ب) 1,5 . ب) إذا رمزنا إلى العدد المُختار في بداية البرنامج بالرمز a ، فأي العبارتين 5a + 3 ، 5(a + 3) تترجم البرنامج؟',
     answer={'أ': '35', 'ب': '22,5', 'translation': '5(a + 3)'}, answerSource='computed', reading='première valeur coupée au bord droit (4 probable).')
assert vals(['(3 + 10) * 2 / 20', '(5 + 10) * 2 / 20', '(4,5 + 10) * 2 / 20', '(10 + 10) * 2 / 20']) == ['1,3', '1,5', '1,45', '2']
assert [(x + 10) * 2 / 20 for x in (110, 160, 105)] == [12, 17, F('11.5')]
deep(48, 19, 'برنامج الحساب الآتي: اختر عددا. أضف إليه 10. اضرب الناتج في 2. قسّم الناتج على 20. فعّل البرنامج معتبرا العدد المختار في البداية: 3 ؛ 5 ؛ 4,5 ؛ 10 . ماذا تلاحظ بالنسبة لعلاقة العدد الناتج بالعدد المختار في البداية؟ جِد في كل حالة العدد الذي يجب أن نختاره في البداية حتى يكون ناتج البرنامج: 12 ؛ 17 ؛ 11,5 . اكتب برنامج حساب أبسط من الأول ويؤدّي نفس المهمّة.',
     answer={'values': ['1,3', '1,5', '1,45', '2'], 'relation': 'le résultat est le dixième de (x + 10)', 'starts': [num(10 * F(r) - 10) for r in ('12', '17', '11.5')], 'simpler': 'أضف 10 ثم قسّم على 10'}, answerSource='computed')
assert vals(['(2 + 5) * 2 / 10', '(6 + 5) * 2 / 10', '(7,5 + 5) * 2 / 10']) == ['1,4', '2,2', '2,5']
deep(49, 19, 'برنامج الحساب المسمّى بالسّاحر: اختر عددا. أضف إليه 5. اضرب الناتج في 2. قسّم الناتج على 10. فعّل البرنامج من أجل عدد البداية: 2 ؛ 6 ؛ 7,5 . من السّهل معرفة العدد المختار في بداية البرنامج إذا علمت النتيجة النهائية، هذا ما قاله عصام لزميله سامي: «أنت ساحر». ما رأيك أنت؟',
     answer={'values': ['1,4', '2,2', '2,5'], 'magic': 'résultat r → départ 5r − 5'}, answerSource='computed')
DEEP50 = {x: [num(ev(f'2 * {x} + 5')), num(ev(f'2 * ({x} - 3)')), num(ev(f'({x} + 6) / 5')), num(ev(f'{x} / 5 + 6')), num(ev(f'12 - {x} / 4'))] for x in ('3', '4,5')}
assert DEEP50['3'] == ['11', '0', '1,8', '6,6', '11,25'] and DEEP50['4,5'] == ['14', '3', '2,1', '6,9', '10,875']
deep(50, 19, 'انقل ثمّ أتمم الجدول: x = 3 و 4,5 ؛ العبارات: 2x + 5 ، 2(x − 3) ، (x + 6)/5 ، x/5 + 6 ، 12 − x/4 .', answer=DEEP50, answerSource='computed')
assert 5 + 3 * 7 == 26 and 3 + 3 * 4 == 15 and 26 + 15 * 7 == 131
deep(51, 19, 'تحصّل يونس مؤخرا على حوض سمك به 5 أسماك، ثلاث منها إناث. تُنتج كل أنثى شهريا 7 سمكات، منها 4 إناث. ما عدد الأسماك التي ستصير لدى يونس بعد مرور شهرين؟',
     answer={'month1': {'fish': 26, 'females': 15}, 'month2': 131}, answerSource='computed')
sol = [(r, 11 - r) for r in range(12) if 5 * r + 4 * (11 - r) == 52]
assert sol == [(8, 3)]
deep(52, 19, 'وضعت سارة 52 حبّة حلوى في حوزتها في 11 علبة من لونين مختلفين؛ الأحمر والأزرق. تحتوي كل علبة حمراء على 5 حبّات حلوى، بينما تحتوي كل علبة زرقاء اللون على 4 حبّات حلوى. ما عدد العلب من كل لون؟',
     answer={'red': 8, 'blue': 3}, answerSource='computed')
deep(53, 19, 'إليك الجدول (4 × 4): 6 7 3 1 / 2 6 1 8 / 4 9 8 1 / 4 2 1 6 . باستعمال أربع خانات من نفس السطر أو نفس العمود أو نفس القطر، والعمليات الأربع والأقواس، جد أكبر عدد من الكيفيات التي تسمح بالحصول على العدد 24.',
     grid=[[6, 7, 3, 1], [2, 6, 1, 8], [4, 9, 8, 1], [4, 2, 1, 6]], reading='énumération non faite ici (banque de S).')

# ── pp. 20–21 : أدمج تعلّماتي ; تكنولوجيات الإعلام والاتصال ─────────────────────────────────────────
assert ev('(50 - 32) * 5 / 9') == 10
add('integration', 'integration', 20, 'أدمج تعلّماتي', False, title='الفهرنهايت والسيليزيوس',
    text='وضعية: الفهرنهايت (°F) هو وحدة لقياس درجة الحرارة، يشيع استعماله في الولايات المتحدة الأمريكية، سُمّي باسم منشئه العالم الألماني دانيال غابريل فهرنهايت عام 1724 ؛ بينما تستعمل معظم دول العالم الأخرى السلزيوس (°C) (لدرجة المئوية بالعربية). للانتقال من الدرجة بالفهرنهايت (°F) إلى ما يقابلها من درجة مئوية (°C) يمكن أن نستعمل برنامج الحساب الآتي: اختر عددا بالفهرنهايت. اطرح 32 منه. اضرب الناتج في 5. قسّم الناتج على 9. يبدو أنّ الجو كان حارا في ولاية الأغواط، هل هذا صحيح؟ برّر جوابك. (الصورة: ميزان حرارة على خريطة الأغواط يشير إلى 50°F). حل مختصر: الدرجة 50°F تُقابلها 10 درجات مئوية فالجو بارد (10°C). فائدة: ما هي درجة تجمد الماء في النظام الفهرنهايتي؟',
    answer={'celsius': 10, 'chain': '(50 − 32) × 5 ÷ 9', 'cold': True, 'freezingF': 32}, answerSource='computed')
STOCK = {'long': (16, 4), 'short': (33, 6), 'smallAngle': (200, 12), 'bigAngle': (20, 2), 'screw': (510, 5)}
assert {k: a // b for k, (a, b) in STOCK.items()} == {'long': 4, 'short': 5, 'smallAngle': 16, 'bigAngle': 10, 'screw': 102} and min(a // b for a, b in STOCK.values()) == 4
add('evaluation', 'integration', 20, 'وضعية للتقويم', False,
    text='لصناعة رف كامل يحتاج نجار إلى الوسائل الآتية: 4 قطع خشبية طويلة، 6 قطع خشبية قصيرة، 12 زاوية قائمة حديدية صغيرة، زاويتان قائمتان حديديتان كبيرتا الحجم، 5 براغي. إذا علمت أنّه يوجد بمستودع النجّار 16 قطعة خشبية طويلة و 33 قطعة خشبية قصيرة و 200 زاوية حديدية صغيرة و 20 زاوية حديدية كبيرة و 510 برغي ؛ فما عدد الرفوف … [السؤال مقطوع أسفل الصفحة 20].',
    answer={'perShelf': {k: a // b for k, (a, b) in STOCK.items()}, 'shelves': 4, 'limiting': 'القطع الخشبية الطويلة', 'leftoverShort': 33 - 4 * 6},
    answerSource='computed', reading='la dernière ligne de la question est coupée (discrepancy 8) ; le sens (nombre maximal d\'étagères) se déduit des stocks.')
assert ev('(129 - 25) / (5 + 4 * 2)') == 8 and ev('15 / (2 + 13) + 8') == 9 and ev('14 / 2 + 5') == 12 and ev('14 / (2 + 5)') == 2
assert ev('2,28 / (11,4 + 8,6)') == F('0.114') and ev('760 / (2,5 + 12,5)') == F(152, 3) and ev('760 / 2,5 + 12,5') == F('316.5')
assert ev('3,08 * (12 + 3,15) / 3 - 15') == F('0.554')
add('ict', 'ict', 21, 'أوظّف تكنولوجيات الإعلام والاتصال', False, title='استعمل حاسبة لإنجاز حسابات تتضمّن حواصل قسمة',
    text='نشاط: احسب كل من العبارتين A = (129 − 25)/(5 + 4 × 2) و B = 15/(2 + 13) + 8 باستعمال حاسبة. 1) تبسيط العبارة A: قبل الشروع في استعمال الآلة الحاسبة، يُفضّل تصوّر (ولو ذهنيا) وضع الأقواس في العبارة A = (129 − 25)/(5 + 4 × 2) ؛ المرحلة الأولى: حجز العبارة التي تمثّل البسط بالكيفية [( 1 2 9 − 2 5 )] ؛ الثانية: النقر على اللمسة [÷] لتعويض خط الكسر ؛ الثالثة: حجز العبارة التي تمثّل المقام بالكيفية [( 5 + 4 × 2 )] ؛ بالنقر على اللمسة [=] تظهر على شاشة الحاسبة النتيجة 8 ، أي أنّ A = 8 . 2) تبسيط العبارة B: B = 15/(2 + 13) + 8 ؛ حجز 15 ثم [÷] ثم ( 2 + 13 ) ثم + 8 ثم [=] ، النتيجة 9 أي أنّ B = 9 . دوري الآن: 1) إليك برنامج الحساب الآتي: [1][4][÷][2][+][5][=] أ) البرنامج السابق يسمح بحساب 14/2 + 5 أم 14/(2 + 5) ؟ ب) اكتب برنامجا يُمكّنك من حساب 2,28/(11,4 + 8,6) . 2) أعط رتبة مقدار ثم القيمة المضبوطة لكل من B = 3,08 × (12 + 3,15)/3 − 15 و A = 101/(0,89 + 4,1… (مقطوعة). 3) طلب الأستاذ من تلاميذه حساب 760/(2,5 + 12,5) فوجد زميلك عصام النتيجة 316,5 . اعترض بعض التلاميذ على نتيجة عصام وأتفقوا على أنها خاطئة. اشرح لزميلك عصام الخطأ الذي ارتكبه. (يُمكن الاستعانة بحاسبة).',
    answer={'A': 8, 'B': 9, 'now1': {'a': '14 ÷ 2 + 5 = 12 (pas 14/(2 + 5) = 2)', 'b': '2,28 ÷ ( 11,4 + 8,6 ) = 0,114'},
            'now2': {'B': '0,554 (3,08 × 15,15 ÷ 3 − 15)', 'A': 'coupée'}, 'now3': {'rightValue': '152/3 (≈ 50,67)', 'assimTyped': '760 ÷ 2,5 + 12,5 = 316,5', 'error': 'a oublié les parenthèses du dénominateur'}},
    answerSource='computed', reading='bord droit de la p. 21 coupé : ② A (dénominateur) illisible (discrepancy 8).')

# ── Destinations ───────────────────────────────────────────────────────────────────────────────────
L1, L2, L3, L4, S = 'silsila-bidun-aqwas', 'silsila-bi-aqwas', 'wasf-silsila-hisab', 'tawzi-darb-jam-tarh', 'wadiya-idmajiya-amaliyat-tabiiya-ushriya'


def d(lesson, module, **kw):
    return {'lesson': lesson, 'module': module, **kw}


DEST = {
    '_comment': 'elementId → { lesson, module } ; `items` répartit un élément ; `duplicatedIn` déclare une seconde utilisation ; une leçon encore coming_soon est une destination EN ATTENTE (check-textbook-coverage.mjs). Modules de silsila-bidun-aqwas : 0 أستعدّ · 1 نشاط · 2 معارف · 3 طريقة · 4 أتمرّن · 5–7 مسائل · 8 إختبار أولي ; None = banque de pratique seulement. Destinations des leçons autres que L1 : README du plan, affinées par leur plan.',
    'objectives': d('unit', 'page'),
    'opener': d(S, 0, note='« هل تعلم » avec les mots de la plateforme (histoire des chiffres : Inde, savants arabes, Khwarizmi, Fibonacci à Béjaïa)'),
    'challenge': d('unit', 'page', duplicatedIn=[d(L1, 1)], note='carte de l\'unité : texte RÉÉCRIT (platformRewrite : 40 − 12 + 6) avec challenge.sourceElementId = challenge ; son idée (une chaîne a UNE lecture) est la tâche t1 du labo de L1'),
    'prep': d(L1, 0, items={'3-4-5-6-7': d(L1, 0), '8-10': d(L2, 0), '1-2': d(L3, 0), '9-11': d(L4, 0)}),
    'act-1': d(L1, 4, note='application (nombres propres 31 − 9 + 4), jamais l\'entrée'),
    'act-2': d(L1, 4, items={'1': d(L1, 4), '2': d(L1, 5)}, note='q1 → أتمرّن (vérifier à la calculatrice) ; q2 → مسألة 1 réécrite (la 4e échéance)'),
    'act-3': d(L2, 4, items={'1-2-3': d(L2, 4), '4': d(L2, 5)}),
    'act-4': d(L2, 4), 'act-5': d(L3, 4), 'act-6': d(L4, 4),
    'know-1': d(L1, 2), 'know-2': d(L2, 2), 'method-1': d(L2, 3), 'method-2': d(L2, 3), 'now-11': d(L2, 4),
    'know-3': d(L3, 2), 'know-4': d(L4, 2), 'method-3': d(L4, 3), 'method-4': d(L4, 3, note='étape 4 de la طريقة (question du propriétaire n° 1)'),
    'now-13': d(L4, 4, note='① réécrit avec une valeur positive (discrepancy 4)'),
    **{f'ex-{n}': d(L1, None) for n in (1, 2, 3)},
    **{f'ex-{n}': d(L1, 4) for n in (4, 5, 6, 7)},
    **{f'ex-{n}': d(L2, 4) for n in (8, 10, 13, 14, 15, 16, 17)},
    **{f'ex-{n}': d(L2, None) for n in (11, 12, 22, 29, 30)},
    **{f'ex-{n}': d(L3, 4) for n in (9, 18, 19)},
    'ex-20': d(L3, None),
    **{f'ex-{n}': d(L4, 4) for n in (21, 23, 24, 25, 26, 27, 31)},
    'ex-28': d(L4, 7),
    **{f'ex-{n}': d(L4, None) for n in (32, 33, 34, 35, 36)},
    'self-1': d(L1, None), 'self-6': d(L1, 4),
    **{f'self-{n}': d(L2, None) for n in (2, 3, 4)},
    'self-5': d(L3, None),
    **{f'self-{n}': d(L4, None) for n in (7, 8, 9, 10)},
    'deep-37': d(S, None),
    **{f'deep-{n}': d(L2, None) for n in (38, 41, 43, 50, 53)},
    'deep-40': d(L2, None, duplicatedIn=[d(S, 6)], note='aussi le bonus de la situation d\'entraînement 6 de la synthèse (registre « quatre 4 » avec des 3, nombres propres)'),
    'deep-39': d(L1, 4),
    'deep-42': d(L4, 7),
    **{f'deep-{n}': d(S, None) for n in (44, 45, 46, 51, 52)},
    'deep-47': d(L3, 5), 'deep-48': d(L3, None), 'deep-49': d(L3, 7),
    'integration': d(S, 1, note='réécrite : un AUTRE programme (le Fahrenheit est déjà dans la synthèse 3AM de l\'unité 1) — programme de la distance de l\'orage'),
    'evaluation': d(S, 7, modules=[7, 8], note='réécrite : ateliers de nichoirs ; la situation est ANALYSÉE au module 7 (non résolue) et résolue dans la وضعية الاختبار النهائي (module 8)'),
    'ict': d(L2, 7, items={'act': d(L2, 7), '1': d(L2, 4), '2': d(L2, None), '3': d(L2, None)}, note='le geste « ( ) pour le numérateur et le dénominateur » → مسألة 3 réécrite ; « دوري الآن » ① ③ → m4 ou banque ; ② → banque'),
}

DISCREPANCIES = [
    {'elementId': 'know-2', 'kind': 'misprint', 'text': 'Exemple F : imprimé « F = 3 + 6 × 15 − 5 » (= 88) mais traité comme « (3 + 6) × (15 − 5) = 9 × 10 » (= 90) — relu à 220 dpi : les deux lignes sont bien ainsi sur le scan. La plateforme n\'utilise pas cet exemple.'},
    {'elementId': 'act-1', 'kind': 'misprint', 'text': 'La chaîne est 25 − 7 + 3 (résultats 15 et 21) mais les touches de la calculatrice montrent « 2 5 − 7 + 5 = » (= 23) — relu à 260 dpi : le dernier chiffre imprimé est 5.'},
    {'elementId': 'act-2', 'kind': 'reading', 'text': 'q2 : échéances de « 1500DA » sur un ordinateur de 54 000 DA (confirmé à 260 dpi) : la 4e échéance serait 54 000 − 3 × 1 500 = 49 500 DA ; 15 000 est probable. La plateforme redessine le problème (vélo, 4 échéances de 3 200 DA).'},
    {'elementId': 'now-13', 'kind': 'scope', 'text': '① F = 5(3a − 2) à a = 0,5 vaut −2,5 : résultat NÉGATIF avant l\'unité 3 (nombres relatifs). Réécrit avec une valeur positive.'},
    {'elementId': 'ex-24', 'kind': 'scope', 'text': 'B = 9,5 × (4,2 − 5) : la différence est négative (développement « sans calculer » seulement). Non repris tel quel.'},
    {'elementId': 'self-5', 'kind': 'scope', 'text': '« 2,5 − 2 × 7 » est une différence de valeur négative (−11,5) : nommer seulement, ne jamais calculer.'},
    {'elementId': 'ex-12', 'kind': 'reading', 'text': 'D = (75,3 − 65,4) × 40,2… et E = 9,7 × 4 × (107,9 − 8… coupées au bord droit ; B et C coupées en bas de la p. 14 (livre). verified: false, partie illisible notée.'},
    {'elementId': 'unit', 'kind': 'scope', 'text': 'Coupures du scan (en plus de textbook-map.json › scanIssues) : bas de la p. 8 (act-3 q2–q3), bord droit de la p. 11 (now-11 ① E et G), bas de la p. 14 (ex-7 2e ligne, ex-12 B C), bas de la p. 16 (ex-36), p. 18 (deep-41 énoncé, deep-46 figure), bord droit de la p. 19 (deep-47–deep-49 premiers mots), bas de la p. 20 (question de l\'évaluation), bord droit de la p. 21 (ict ② A). Pages 6–21 sinon complètes.'},
    {'elementId': 'ex-5', 'kind': 'misprint', 'text': 'Feuille de Khaled : C est imprimé « 30 − 9 ÷ 2 = 21 ÷ 3 = 7 » (relu à 220 dpi) : la 2e ligne (21 ÷ 3) ne découle pas de ÷ 2 (probablement 30 − 9 ÷ 3). A, B, D sont cohérents (priorité oubliée / ordre inversé). Et ex-34 : la fin de l\'énoncé écrit « 35,4 × 608 = 283,2 » alors que 35,4 × 608 = 21 523,2 (283,2 = 35,4 × 8). La plateforme dessine sa propre feuille et ses propres nombres.'},
    {'elementId': 'prep', 'kind': 'misprint', 'text': 'Item 7 : la figure porte 14cm (AB) et 9cm (CB), mais les trois options sont écrites « 14,5 × 9 », « 14,5 − 9 », « 14,5 + 9 » ; la bonne colonne est la soustraction dans tous les cas (AC = AB − CB). Item 9 : les options 1 (2,4 × 7) et 3 (16,8) sont fausses (2 + 3 = 5, aire 12) : seule la colonne 2 est juste (le livre ne propose pas la valeur 12).'},
    {'elementId': 'method-2', 'kind': 'misprint', 'text': 'Exemple A = (40 + 8)/(15 − 9) : le livre écrit « (40 + 8) ÷ (15 − 9) = 48 ÷ 8 = 6 » (relu à 230 dpi) alors que 15 − 9 = 6 et 48 ÷ 6 = 8 ; 6 correspondrait à (40 + 8)/(15 − 7). B = 36/(3 × 5 − 6) + 6 = 10 est juste.'},
    {'elementId': 'deep-39', 'kind': 'scope', 'text': 'Item أ) 8 + 2 × … = 29 donne 10,5 (décimal, non naturel) ; ب) 7 ; ج) 7 ; د) 2. L\'activité L1 m4 item 6 écrit ses propres nombres.'},
]

doc = {
    '_comment': [
        'EXTRACTION CANONIQUE du manuel scolaire officiel — 2AM, الجيل الثاني (منشورات الشهاب 2017), unité 1 « العمليات على الأعداد الطبيعية والأعداد العشرية ».',
        'Source : docs/official-book-pdfs/كتاب الرياضيات للسنة الثانية متوسط الجيل الثاني.pdf, pages 6 à 21 du livre (PDF 3 à 18).',
        'Ce fichier est LA source de vérité pédagogique de l’unité ; tout contenu cite un `id` d’ici via `source.elementId`. SOURCE INTERNE : jamais montrée aux élèves.',
        'Transcription VISUELLE d’un scan médiocre ; réponses calculées (Fraction) dans build-extraction.py, `answerSource: computed`.',
        'Généré par docs/sources/2am/unit1/build-extraction.py — ne pas éditer à la main.',
    ],
    'unitCode': 'amaliyat-tabiiya-ushriya',
    'textbook': {'title': 'كتاب الرياضيات — السنة الثانية من التعليم المتوسط', 'generation': 'الجيل الثاني', 'unitNumber': 1,
                 'unitTitle': 'العمليات على الأعداد الطبيعية والأعداد العشرية', 'pages': {'first': 6, 'last': 21}, 'pdfPageOffset': 3,
                 'sections': ['سأتعلّم في هذا الباب', 'تحدّي', 'أستعدّ', 'أنشطة', 'معارف', 'طرائق', 'دوري الآن', 'أوظّف تعلّماتي', 'أؤكّد تعلّماتي', 'أتعمّق', 'أدمج تعلّماتي', 'وضعية للتقويم', 'أوظّف تكنولوجيات الإعلام والاتصال']},
    'frozenAt': '2026-10-28',
    'terminology': {'note': 'Le manuel écrit « سلسلة عمليات », « أقواس », « معاكفتين [ ] », « خط الكسر », « أولوية العمليات », « مجموع / فرق / جداء / حاصل قسمة », « الحد الأول / الحد الثاني », « العامل », « توزيع الضرب على الجمع والطرح », « نشر / تحليل ».',
                    'terms': ['سلسلة عمليات', 'أقواس', 'معاكفتان', 'خط الكسر', 'أولوية العمليات', 'مجموع', 'فرق', 'جداء', 'حاصل قسمة', 'عامل', 'حد', 'توزيعية', 'نشر', 'تحليل']},
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
# L2 (silsila-bi-aqwas, 2026-10-29) : les éléments RELUS sur les pages rendues (PDF 5, 8, 11, 18 ; transcription comparée mot à mot, aucune correction nécessaire). Les autres éléments de L2
# (prep 8 et 10, act-4, now-11 ①②, ex-13…ex-17, ex-22, ex-29, ex-30, self-2…4, deep-*) restent `verified: False` : leurs pages n'ont pas été rendues (bord droit de la p. 8, bas des p. 14–16 coupés au scan).
L2_VERIFIED = {'act-3', 'method-1', 'method-2', 'ex-8', 'ex-10', 'ex-11', 'ict'}
# L4 (tawzi-darb-jam-tarh, 2026-10-29) : معارف 4 (PDF 9), طرائق 3 et 4 et « دوري الآن » ① ② (PDF 10) relus sur les pages rendues à 75 dpi (transcription comparée mot à mot ; seule la faute d'impression
# de طريقة 4 — E = 3 × 7 = 35 au lieu de 21 pour x = 12 — est déjà notée `[sic : 21]`). Les exercices 21–36, أؤكّد 7–10 et أتعمّق 42 (bas des p. 15–18 coupé au scan) restent `verified: False`.
L4_VERIFIED = {'know-4', 'method-3', 'method-4', 'now-13'}
# S (wadiya-idmajiya-amaliyat-tabiiya-ushriya, 2026-10-29) : la synthèse — `integration` et `evaluation` (p. 20, question coupée notée), `opener`, et les six `deep-*` de la banque
# (deep-46 : figure illisible, redessinée par la plateforme) sont relus ; leurs destinations ne sont plus en attente.
S_VERIFIED = {'integration', 'evaluation', 'opener', 'deep-37', 'deep-44', 'deep-45', 'deep-46', 'deep-51', 'deep-52'}
for _e in E:
    if _e['id'] in L2_VERIFIED | L4_VERIFIED | S_VERIFIED:
        _e['verified'] = True
L1_REQUIRED = {'challenge', 'objectives', 'opener', 'prep', 'act-1', 'act-2', 'know-1', 'self-1', 'self-6', 'deep-39'} | {f'ex-{n}' for n in range(1, 8)}
assert all(next(e for e in E if e['id'] == i)['verified'] for i in L1_REQUIRED), 'élément de L1 non vérifié'
assert all(not e['verified'] for e in E if e['id'] not in L1_REQUIRED | L2_VERIFIED | L4_VERIFIED | S_VERIFIED), 'élément hors L1/L2/L4 marqué vérifié'

out = Path(__file__).with_name('extraction.json')
out.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
pending = sum(1 for k, v in DEST.items() if k != '_comment' and v['lesson'] not in ('unit', L1))
print(f'{out} — {len(E)} éléments ({sum(e["verified"] for e in E)} vérifiés ; {len(E) - pending} pour {L1} ou l’unité, {pending} pour les autres leçons)')
