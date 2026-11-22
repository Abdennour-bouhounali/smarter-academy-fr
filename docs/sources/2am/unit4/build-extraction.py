#!/usr/bin/env python3
"""Génère docs/sources/2am/unit4/extraction.json — 2AM, unité 4 « مفهوم معادلة » (manuel الجيل الثاني,
منشورات الشهاب ; pp. 54–69 du livre = PDF 51–66, décalage 3 — docs/sources/2am/textbook-map.json).

Transcription VISUELLE (pages rendues à 110 dpi ; les passages de la leçon ibara-harfiya-intaj relus à 110–200 dpi le
2026-10-29). Le scan de 2AM est la seule copie et il est médiocre (décision D5/D9 : on prend l'idée, on ne s'attarde pas
sur l'illisible). Les éléments des leçons qui ne sont pas encore générées (hall-mushkil-muadala,
ikhtibar-musawat-mutabayina, la synthèse) sont transcrits plus brièvement et marqués `verified: False` : leur leçon les
relira. Les réponses sont CALCULÉES ici (Fraction / Decimal / entiers exacts), jamais tapées.

L'unité est générée LEÇON PAR LEÇON : les destinations vers une leçon encore coming_soon sont EN ATTENTE
(scripts/check-textbook-coverage.mjs). Cette extraction a été construite ENTIÈRE par la première leçon, ibara-harfiya-intaj
(2026-10-29), d'après docs/sources/2am/unit4/plan/README.md.

FRONTIÈRES (copie de plan/README.md « Boundaries ») :
 - ibara-harfiya-intaj (sans item) = une lettre représente un nombre inconnu ou variable ; écrire une expression littérale
   d'une situation, d'un programme de calcul ou en GÉNÉRALISANT un motif croissant (k·n + c lu sur le dessin) ; sa valeur pour
   des valeurs données d'une ou deux lettres (priorités rappelées de l'unité 1), rangée dans un tableau de valeurs ; l'écriture
   simplifiée : × omis devant une lettre ou une parenthèse, 1 × a = a, 0 × a = 0, a × b = b × a, a × a = a², a × a × a = a³ et
   k·a + m·a = (k + m)·a LU comme une factorisation (unit-1 tawzi-darb-jam-tarh P3, rappelée). Elle ne résout jamais une équation,
   ne teste jamais une égalité ni une inégalité (elle peut OBSERVER que deux écritures du même décompte donnent le même tableau,
   jamais « pour toute valeur » : c'est P2 de l'autre), ne développe jamais un produit de deux parenthèses (3AM), ne supprime
   jamais de parenthèses précédées de − (3AM), ne calcule jamais avec des valeurs négatives (ordre de génération).
 - hall-mushkil-muadala (r08) = une équation est une égalité avec une inconnue nommée par une lettre ; sa solution est la valeur
   qui la rend vraie, vérifiée en calculant l'UNE opération ; traduire une situation en équation après avoir nommé l'inconnue ;
   résoudre « a × x = b », « x ÷ a = b » (x/a = b) et « a ÷ x = b » (a/x = b) avec a et b décimaux (a ≠ 0) par l'opération
   inverse (facteur manquant → quotient, dividende manquant → produit, diviseur manquant → quotient), les « a + … = b »,
   « a − … = b » de 1AM rappelés ; une équation à deux opérations k·x + c = d ou (x + c) ÷ k = d en défaisant la DERNIÈRE
   opération d'abord, toute valeur intermédiaire ≥ 0. Jamais x des deux côtés (3AM muadalat-darajat-ula), jamais le test d'une
   égalité à deux membres (ikhtibar), jamais « transposer un terme » (3AM musawiyat-amaliyat).
 - ikhtibar-musawat-mutabayina (r09) = substituer une valeur (ou un couple) dans les deux membres d'une égalité ou d'une inégalité
   (<, >, ≤, ≥), calculer chaque membre (priorités, sommes algébriques de l'unité 3) et comparer ; trouver, parmi des valeurs
   DONNÉES, celles qui la rendent vraie ; deux expressions sont égales quand elles donnent la même valeur pour TOUTE valeur de la
   lettre (justifiée par une règle connue) — un contre-exemple prouve qu'elles ne le sont pas, et des valeurs égales pour
   quelques valeurs ne prouvent rien. Jamais « معادلة » / « حلّ » (hall), jamais de résolution, jamais de transformation
   (3AM musawiyat-amaliyat, mutabayinat-amaliyat).
 - la synthèse = aucune notion nouvelle : six situations d'entraînement + la situation finale analysée + le test final.

Usage : python3 docs/sources/2am/unit4/build-extraction.py
"""
import json
from decimal import Decimal as D
from fractions import Fraction as F
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


def q(s):
    """Un « nombre » du manuel en Fraction exacte : '7/4', '4,5/3', '1,75', '12'."""
    s = str(s)
    if '/' in s:
        n, d = s.split('/')
        return F(dec(n)) / F(dec(d))
    return F(dec(s))


def num(x):
    """Une Fraction décimale exacte, écrite à l'algérienne."""
    x = F(x)
    return fr(D(x.numerator) / D(x.denominator)) if x.denominator != 1 else str(x.numerator)


E = []
I, H, T, S = 'ibara-harfiya-intaj', 'hall-mushkil-muadala', 'ikhtibar-musawat-mutabayina', 'wadiya-idmajiya-mafhum-muadala'


def el(id, kind, page, section, text=None, verified=False, **kw):
    d = {'id': id, 'kind': kind, 'page': page, 'section': section, 'verified': verified}
    if text is not None:
        d['text'] = text
    d.update(kw)
    E.append(d)


# ── p. 54 : ouverture ─────────────────────────────────────────────────────────────────────────────
el('objectives', 'objectives', 54, 'سأتعلّم في هذا الباب', verified=True, items=[
    'اختبار صحة مساواة أو متباينة تتضمن عددا مجهولا (أو عددين مجهولين) عندما نستبدله بقيمة معلومة.',
    'حل المعادلات من الشكل: a ÷ … = b حيث a و b عددان عشريان معلومان في وضعيات بسيطة.',
])
el('opener', 'aside', 54, 'تمهيد', verified=True,
   text='الرمز x يُستعمل عموما للدلالة على مجهول أو متغيّر رياضي. وأول من استعمل هذه الفكرة هو الرياضياتي الخوارزمي (781 م – 847 م)، أبرز علماء الرياضيات في الحضارة العربية الإسلامية، وقد سماه «شيء». وقبل أن تصل هذه الكلمة العربية بدورها إلى إسبانيا وتلفظ في لغتهم «كسي»، ثم تنتشر في أوروبا بعد ذلك بصيغتها النهائية «x».',
   figure='صورة الخوارزمي على طابع، وفي الخلفية مخطوط «الكتاب المختصر في حساب الجبر والمقابلة».')
# Le défi : n × n pommiers + une rangée de pins coupe-vent ; figures n = 1…4 (n = 1 : 1 pommier, 8 autres arbres)
_apple = lambda n: n * n
_wind = lambda n: 4 * n + 4
assert [(_apple(n), _wind(n)) for n in (1, 2, 3, 4)] == [(1, 8), (4, 12), (9, 16), (16, 20)]
el('challenge', 'challenge', 54, 'تحدّي', verified=True,
   text='يغرس فلاحون أشجار التفاح بتشكيل مربّعات. لوقاية الأشجار من الرياح، يغرسون أشجارا ذات أوراق مقاومة حول أشجار التفاح. يجسّد الشكل المقابل متتالية أشجار التفاح والأشجار المقاومة من أجل بعض قيم العدد (n) لصفوف أشجار التفاح. كيف يمكن معرفة عدد أشجار كل صنف من أجل كل قيمة لـ n ؟',
   figure='أربعة مربّعات n = 1 … 4 : n × n شجرة تفاح محاطة بصفّ من الأشجار المقاومة.',
   answer={'apples': 'n × n', 'windbreak': '4 × n + 4', 'table': {n: {'apples': _apple(n), 'windbreak': _wind(n)} for n in (1, 2, 3, 4)}},
   answerSource='computed',
   reading='Relu à 110 dpi (2026-10-29) : n = 1 donne 1 pommier et 8 arbres autour. Réécrit par la leçon ibara-harfiya-intaj (rangée de cellules de cire).')

# ── p. 55 : أستعدّ (PDF 52, relu à 110 dpi) ─────────────────────────────────────────────────────────
assert 36 - 10 - 6 == 20 and 36 - (10 - 6) == 32 and 12 + 4 * 3 == 24 and 3 * (2 * 3 + 7) == 39
PREP = [
    {'n': 1, 'question': 'نتيجة الحساب 36 − 10 − 6 هي :', 'options': ['10', '20', '26'], 'correct': [1], 'why': '36 − 10 = 26 ثم 26 − 6 = 20'},
    {'n': 2, 'question': 'نتيجة الحساب 36 − (10 − 6) هي :', 'options': ['20', '32', '52'], 'correct': [1], 'why': '10 − 6 = 4 ثم 36 − 4 = 32'},
    {'n': 3, 'question': 'نتيجة الحساب 12 + 4 × 3 هي :', 'options': ['24', '58', '144'], 'correct': [0], 'why': '4 × 3 = 12 ثم 12 + 12 = 24'},
    {'n': 4, 'question': 'نتيجة الحساب 3 × (2 × 3 + 7) هي :', 'options': ['126', '39', '60'], 'correct': [1], 'why': '2 × 3 + 7 = 13 ثم 3 × 13 = 39'},
    {'n': 5, 'question': 'العبارة التي تمثّل مجموع العددين a و b من بين العبارات: a + b ، a × b ، 2 × a + b :', 'options': ['a + b', 'a × b', '2 × a + b'], 'correct': [0], 'why': 'المجموع يُكتب a + b'},
    {'n': 6, 'question': 'على الشكل قطعة [AB] : الطول AB = 9 − x (القطعة الحمراء 9 والخضراء x تُنقَص)', 'options': ['9 − x', '9 + x', '9 × x'], 'correct': [0], 'why': 'طول AB = 9 ناقص x', 'verified': False, 'reading': 'texte de l’énoncé coupé à droite ; options lues dans les colonnes (1) (2) (3)'},
    {'n': 7, 'question': 'على الشكل : الطول AB = 12 − x', 'options': ['12 + x', '12 × x', '12 − x'], 'correct': [2], 'why': 'AB = 12 ناقص x', 'verified': False},
    {'n': 8, 'question': 'على الشكل المدرّج : الطول AB = 6 × x (6 مرّات الطول x)', 'options': ['x', '6 × x', '6 + x'], 'correct': [1], 'why': 'AB هو 6 مرّات الطول x', 'verified': False},
    {'n': 9, 'question': 'على الشكل : AB = 7 + 2 × x', 'options': ['9 + x', '7 + 2 × x', '2 × x + 7'], 'correct': [1, 2], 'why': 'AB = 7 ثم 2 مرّات x', 'verified': False},
    {'n': 10, 'question': 'محيط الخماسي (أضلاعه 2x و 3 كما في الشكل) هو :', 'options': ['2 × x + 3', '3 × 2 × x + 6', '3 × (2 × x + 3)'], 'correct': [], 'why': 'القراءة: خماسي فيه ضلعان طول كلّ منهما 3 وثلاثة أضلاع 2x', 'verified': False,
     'reading': 'figure du pentagone (côtés 3, 3, 2x, 2x, 2x) ; la clé exacte dépend du dessin : à relire par ibara-harfiya-intaj (3 × (2 × x + 3) est lue comme 3 côtés de la forme 2x + 3 ?). Le périmètre exact N’EST PAS repris.'},
]
el('prep', 'prerequisites', 55, 'أستعدّ', verified=True,
   instruction='اختر الإجابة الصحيحة (أو الإجابات الصحيحة) في كل حالة، مبرّرا إياها.', items=PREP, answerSource='computed',
   reading='Relu à 110 dpi : items 1–5 et 10 (ibara-harfiya-intaj) ; 6–9 sont des longueurs AB en x (hall-mushkil-muadala). La marge droite des énoncés 6–10 est coupée.')

# ── p. 56 : أنشطة 1 et 2 (PDF 53, relu à 110 dpi) ─────────────────────────────────────────────────
_chairs = lambda n: 2 * n + 2  # tables CARRÉES jointes, une chaise sur chaque côté libre
assert [_chairs(n) for n in (1, 2, 3, 10, 51)] == [4, 6, 8, 22, 104]
el('act-1', 'activity', 56, 'أنشطة', number=1, title='إنتاج عبارة حرفية', verified=True,
   text='أراد مسؤول قرية تنظيم مأدبة طعام في الساحة العمومية. فكّر في وضع طاولات مربّعة الشكل في بوضعها واحدة جنب الأخرى بحيث يمكن وضع كرسيّ على كلّ ضلع حرّ منها. أراد أن يجد صيغة لحساب الأماكن المتوفّرة، تبعا لعدد الطاولات الموضوعة.',
   questions=['1) ما هو عدد الأماكن المتوفّرة عند وضع طاولة واحدة؟ طاولتين؟ 3 طاولات؟', '2) ما هو عدد الأماكن المتوفّرة عند وضع 10 طاولات؟ 51 طاولة؟',
              '3) اكتب جملة تشرح فيها كيف نعرف عدد الأماكن المتوفّرة بعد معرفة عدد الطاولات الموضوعة.', '4) جد صيغة حرفية تُمكّننا من حساب عدد الكراسي بمعلومية عدد الطاولات.'],
   figure='ثلاثة أشكال لطاولات مربّعة صُفّت في صفّ واحد (1 ثم 2 ثم 3) وكرسيّ على كل ضلع حرّ.',
   answer={'chairs': {n: _chairs(n) for n in (1, 2, 3, 10, 51)}, 'formula': '2 × n + 2'}, answerSource='computed')
_club = lambda x: 2000 + 150 * x
assert [_club(x) for x in (10, 50, 100)] == [3500, 9500, 17000]
el('act-2', 'activity', 56, 'أنشطة', number=2, title='استعمال عبارة حرفية', verified=True,
   text='في نادٍ رياضي، ندفع مبلغ 2000 DA للاشتراك السنوي و 150 DA مقابل كلّ حصّة. 1) عبّر عن الوضعية بعبارة حرفية مناسبة. 2) احسب المبالغ اللازمة مقابل 10 حصص، 50 حصة و 100 حصّة. 3) لإنجاز ورقة حساب باستعمال مجدول، تمكّننا من معرفة المبالغ اللازمة من 1 إلى 100 حصّة. أ) احجز قيَم x كما في الجدول المقابل (0 ، 1 ، 2 ، … ، 100). ب) في الخلية B2 ، اكتب الدستور (العبارة) المناسبة للوضعية والمحصّل عليها في 1). (جـ) … (أسفل الصفحة مقصوص).',
   answer={'expression': '2000 + 150 × x', 'values': {x: _club(x) for x in (10, 50, 100)}}, answerSource='computed',
   reading='Les questions 3 ب–جـ sont coupées au bas de la page (discrepancy 5).')

# ── p. 57 : أنشطة 3 et 4 (PDF 54) ───────────────────────────────────────────────────────────────────
_bal = lambda b, c: 3 * c == 2 * b + 200
assert not _bal(10, 70) and _bal(20, 80)
assert (7 * 6 + 8, 12 * 6 - 4) == (50, 68) and 9 * 1 + 8 == 7 * 1 + 10 == 17
_ineq = [x for x in range(0, 12) if 10 * x - 2 < 55 - 3 * x]
assert _ineq == [0, 1, 2, 3, 4]
el('act-3', 'activity', 57, 'أنشطة', number=3, title='اختبار متساويات أو متباينات', verified=True,
   text='يمثّل الشكل المقابل كفتي ميزان في وضع توازن. على الكفة اليمنى 3 مكعبات متماثلة وعلى الكفة اليسرى جلّتان متماثلتان وكتلة 200 g. 1) ترجم الوضعية بالعبارة 3 × c = 2 × b + 200. ماذا يمثّل كل من الحرفين b و c ؟ 2) هل يكون الميزان في توازن عندما تكون كتلة الجلّة 10 g وكتلة المكعّب 70 g ؟ 3) … كتلة الجلّة 20 g وكتلة المكعّب 80 g ؟ 4) عيّن في ما يلي، إن كانت كلّ مساواة صحيحة أم خاطئة من أجل القيمة المعطاة: 7 × x + 8 = 12 × x − 4 من أجل x = 6 ؛ 9 × x + 8 = 7 × x + 10 من أجل x = 1. 5) من بين القيم الآتية، عيّن التي تكون من أجلها المتباينة 10x − 2 < 55 − 3x صحيحة: … ، 5 ، 6 ، 7.',
   answer={'balance': {'10,70': _bal(10, 70), '20,80': _bal(20, 80)}, 'equalities': {'7x+8=12x-4 at 6': False, '9x+8=7x+10 at 1': True},
           'inequalityTrueFor': _ineq}, answerSource='computed',
   reading='La liste de valeurs de la question 5 est coupée à droite (discrepancy 4) : seules 5, 6, 7 (fausses) sont lisibles. Relu à 110 dpi.')
_eggs = 5760
assert 240 * 24 == _eggs and 480 * 12 == _eggs and q('258,6') / q('21,55') == F(12) and F(489, 163) == 3 and F(250) * F(1, 5) == 50 and F(217, 10) * 3 == F('65.1')
el('act-4', 'activity', 57, 'أنشطة', number=4, title='حلّ مشكل باستعمال معادلة', verified=False,
   text='جمع فلاّح 5760 بيضة. لتسويقها، وضعها في أطباق، فتحصّل على حمولتين من 240 طبق لكلّ واحدة. 1) ما هو عدد البيضات في كلّ طبق ؟ 2) نرمز بالرمز x لعدد البيضات في الطبق الواحد. اربط الوضعية بالحساب (أو الحسابات) المناسب(ة) لها : أ) 240 × x = 5760 ب) 480 × x = 5760 جـ) 5760 / x = 480. أنجز، عندئذ، الحساب ثمّ عيّن عدد البيضات في الطبق الواحد. 3) حلّ المعادلات الآتية : 1/3 × x = 21,7 ، x/250 = 1/5 ، 489/x = 163 ، 258,6/x = 21,55.',
   answer={'eggsPerTray': {'480 x = 5760': 12, '5760/x = 480': 12, '240 x = 5760': 24}, 'solutions': {'1/3 x = 21,7': num(F(217, 10) * 3), 'x/250 = 1/5': 50, '489/x = 163': 3, '258,6/x = 21,55': 12}},
   answerSource='computed', reading='Le texte parle de « حمولتين من 240 طبق » : 2 × 240 = 480 plateaux ; le bon appariement est 480 × x = 5760 et 5760/x = 480 (x = 12).')

# ── p. 58 : معارف 1 et 2 (PDF 55, relu à 110 dpi) ───────────────────────────────────────────────────
el('know-1', 'knowledge', 58, 'معارف', number=1, title='العبارات الحرفية', verified=True,
   text='العبارة الحرفية هي عبارة تكون فيها بعض الأعداد ممثّلة بحروف. أمثلة: 1) يمثّل الشكل مربّعا طول ضلعه x. نعبّر عن محيط هذا المربّع بالعبارة: 4 × x. 2) نكتب متتاليات التعليمات: «اختر عددا؛ اضربه في 2؛ اطرح من النتيجة 3» على شكل عبارة ونجد: (2 × x) − 3 أي 2x − 3.',
   answer={'perimeterSquare': '4 × x', 'program': '2x − 3'}, answerSource='computed')
assert 2 * 7 + 5 * 7 - 3 * 7 == (2 + 5 - 3) * 7 and 2 * 2 + 5 * 2 - 3 * 2 == (2 + 5 - 3) * 2 and 10 * 10 == 100 and 10 * 10 * 10 == 1000
el('know-2', 'knowledge', 58, 'معارف', number=2, title='تبسيط حساب حرفي', verified=True,
   text='يمكن تبسيط حساب حرفي : (أ) باستعمال اصطلاحات: يمكن الاستغناء عن الإشارة × عندما تكون أمام حرف أو قوس. مثال: بسّط 7 × a ؛ 7 × (a + 1) ؛ 7 × a + 3 × b حيث a و b عددان كيفيان. نكتب 7a ؛ 7(a + 1) ؛ 7a + 3b. (ب) باستعمال خواص الضرب: 1 × a = a ، 0 × a = 0 ، a × b = b × a. مثال: 1 × a + 0 × b + 1 × b = a + 0 + b = a + b. (جـ) باستعمال كتابات مبسّطة: نكتب الجداء a × a على الشكل a² ونقرأ «a مربّع»، ونكتب a × a × a على الشكل a³ ونقرأ «a مكعّب». مثال: بسّط ثمّ احسب: أ) 2 × a + 5 × a − 3 × a ب) 10 × 10 جـ) 10 × 10 × 10 ؛ الحل: (2 + 5 − 3) × a = 4a ، 10 × 10 = 10² = 100 ، 10 × 10 × 10 = 10³ = 1000.',
   answer={'simplify': {'2a + 5a - 3a': '4a', '10 x 10': 100, '10 x 10 x 10': 1000}}, answerSource='computed')
# ── p. 59 : طرائق 1 et 2 (PDF 56, relu à 110 dpi) ───────────────────────────────────────────────────
el('method-1', 'method', 59, 'طرائق', number=1, title='التعبير بدلالة x', verified=True,
   text='تمرين: جمع أمين 50 طابعا جزائريا و x طابعا أجنبيا. 1) عبّر بدلالة x عن عدد كلّ الطوابع التي جمعها أمين. 2) جمع أيمن سيارته الصغيرة في 5 علب. في كلّ علبة توجد x سيارة. عبّر بدلالة x عن عدد كلّ سيارات أيمن. 3) عبّر بدلالة x عن محيط الشكل (مضلّع بأطوال 5 ، 5 ، x ، 1 وأضلاع متقابلة متماثلة: x مرّات الطول x 6 مرّات). الحل: 1) 50 + x ؛ 2) 5 × x ؛ 3) 22 + 6 × x. التعاليق: عدد مرّات الطول x على الشكل 6 نضيف إليه الأطوال المعطاة بالأعداد وهي 22.',
   answer={'stamps': '50 + x', 'cars': '5 × x', 'perimeter': '22 + 6 × x'}, answerSource='computed')
_border = lambda n: 4 * n + 4
assert [_border(n) for n in (5, 6, 7)] == [24, 28, 32] and 4 * 5 + 4 == 4 * (5 + 1)
el('method-2', 'method', 59, 'طرائق', number=2, title='بالتعميم', verified=True,
   text='تمرين: 1) احسب عدد البلاطات الملوّنة على حافة مربّع ضلعه: 5 بلاطات ، 6 بلاطات ، 7 بلاطات. 2) مربّع له n بلاطة على ضلعه. عبّر بدلالة n عن عدد البلاطات الملوّنة على حافته. الحل: من أجل n = 5 ، يكون عدد البلاطات الملوّنة هو: 4 × 5 + 4 ؛ n = 6: 4 × 6 + 4 ؛ n = 7: 4 × 7 + 4. 2) من أجل مربّع له n بلاطة على ضلعه، يكون عدد البلاطات الملوّنة هو 4 × n + 4. التعاليق: نستعين برسم مربّع لكلّ حالة لتسهيل عملية عدّ البلاطات على الحافة. نختار استراتيجية معينة لعدّ البلاطات: مثل أن نعدّ 4 مرّات عدد البلاطات على أضلاع المربّع و 4 بلاطات على الأركان الأربعة. ملاحظة: يمكن إنتاج عبارات أخرى لعدّ البلاطات ونتأكّد من تساويها بتحويلها.',
   answer={'border': {n: _border(n) for n in (5, 6, 7)}, 'formula': '4 × n + 4'}, answerSource='computed',
   reading='« مربّع له n بلاطة على ضلعه » avec « 4 × n + 4 » : la formule compte le contour AUTOUR d’un carré de n × n (discrepancy 3).')
assert 2 * 0 + 13 == 13 and 2 * 5 + 13 == 23
el('now-59', 'now', 59, 'دوري الآن', verified=True,
   text='① عبّر بدلالة x و y على الطول AB (قطعة مقسومة إلى x ثم y ثم 2). ② احسب النتيجة عندما نطبّق برنامج الحساب باختيار 0 ثمّ 5 : اختر عددا ؛ اضربه في 2 ؛ أضف إلى النتيجة 13.',
   answer={'AB': 'x + y + 2', 'program': {0: 13, 5: 23}}, answerSource='computed')

# ── p. 60 : معارف 3 à 5 (PDF 57, bas coupé) ─────────────────────────────────────────────────────────
assert 2 * 4 + 3 == 11 and 5 * 4 == 20 and 11 != 20 and 4 + 6 * 3 < 27 and not (4 + 6 * 4 < 27)
assert all(x * x + 9 == 4 * x + 6 for x in (1, 3)) and 0 + 9 != 0 + 6
el('know-3', 'knowledge', 60, 'معارف', number=3, title='اختبار تساوي عبارتين حرفيتين', verified=False,
   text='نعني باختبار تساوي عبارتين حرفيتين تعويض الحروف فيهما بأعداد لمعرفة إن كانت هذه المساواة صحيحة أم خاطئة من أجل هذه الأعداد. مثال: لنختبر تساوي العبارتين 2x + 3 و 5x نعطي قيمة لـ x ونحسب قيمتي العبارتين من أجلها مثلا من أجل x = 4 نجد: 11 و 20 ؛ نقارن النتيجتين وكون 20 ≠ 11 فالعبارتان غير متساويتين. في الحالة التي تعطي فيها العبارتان الحرفيتان نفس النتيجة، مهما كانت القيم المعطاة للحروف، نقول إنّ العبارتين الحرفيتين متساويتان. مثال: العبارتان 2 × (x + 3) و 2x + 6 متساويتان: حسب خاصية التوزيع، العبارتان تعطيان نفس النتيجة مهما كانت القيمة المعطاة للحرف x. خاصية: يكفي إيجاد مثال واحد تعطي من أجله العبارتان الحرفيتان نتيجتين مختلفتين لتبرير أنّ العبارتين الحرفيتين غير متساويتين. مثال: العبارتان x² + 9 و 4x + 6 تعطيان نفس النتيجة من أجل x = 1 و x = 3 ، لكنهما لا تعطيان نفس النتيجة من أجل x = 0 مثلا، فهما عبارتان غير متساويتين.',
   answer={'2x+3 vs 5x at 4': [11, 20], 'x^2+9 vs 4x+6': {'equalAt': [1, 3], 'counterexample': 0}}, answerSource='computed',
   reading='Marge droite des exemples coupée.')
el('know-4', 'knowledge', 60, 'معارف', number=4, title='اختبار صحّة متباينة', verified=False,
   text='نعني باختبار صحة متباينة تعويض الحروف فيها بأعداد لمعرفة إن كانت صحيحة أم خاطئة من أجل هذه الأعداد. مثال: المتباينة 4 + 6x < 27 صحيحة من أجل x = 3 وخاطئة من أجل x = 4.',
   answer={'4+6x<27': {3: True, 4: False}}, answerSource='computed')
el('know-5', 'knowledge', 60, 'معارف', number=5, title='المعادلات', verified=False,
   text='عندما يكون، من أجل قيم معيّنة، لعبارتين A و B نفس النتيجة، نقول إنّ هذه القيم هي حلول المعادلة A = B. وجدنا في مثال سابق أنّ العبارتين 2x + 3 و … (بقية التعريف ومثاله مقصوصان في أسفل الصفحة؛ « … تعطيان نفس النتيجة 5 »).',
   answer={'2x+3 = 3x at 3': True}, answerSource='computed', reading='Fin de la définition et exemple coupés au bas de la page (discrepancy 8).')

# ── p. 61 : طرائق 3 à 5, دوري الآن (PDF 58) ─────────────────────────────────────────────────────────
assert 6 + 5 == 3 * 6 - 7 == 11 and 2 + 5 == 7 and 3 * 2 - 7 == -1
el('method-3', 'method', 61, 'طرائق', number=3, title='اختبار مساواة', verified=False,
   text='اختبر المساواة x + 5 = 3x − 7 من أجل x = 6 ثمّ x = 2. الحل: من أجل x = 6 : 6 + 5 = 11 و 3 × 6 − 7 = 11 ، فالمساواة صحيحة. من أجل x = 2 : 2 + 5 = 7 و 3 × 2 − 7 = −1 ، فالمساواة خاطئة. (جدول: x ، الطرف الأوّل، الطرف الثاني، «النتيجة»).',
   answer={'x=6': [11, 11, True], 'x=2': [7, -1, False]}, answerSource='computed')
assert (200 + 3 * 0 + 0 == 200) and 3 * 50 + 100 == 250 and 50 + 200 == 250
el('method-4', 'method', 61, 'طرائق', number=4, title='ترجمة مشكل بمعادلة', verified=False,
   text='أنفق أمين x + 200 DA وأنفقت سيليا 3x + 100 DA (ثلاثة أضعاف ما أنفقه أمين ناقصا 100 …). إذا كانا قد أنفقا نفس المبلغ فالوضعية تُترجم بالمعادلة x + 200 = 3x + 100.',
   answer={'equation': 'x + 200 = 3 × x + 100', 'solution': 50, 'amount': 250}, answerSource='computed',
   reading='La dernière ligne de la solution imprime « 3 × x + 1000 » (coquille ; énoncé et commentaire : 100) — discrepancy 1.')
assert F(84, 14) == 6 and 14 * 6 == 84
el('method-5', 'method', 61, 'طرائق', number=5, title='حلّ معادلة من الشكل a/x = b', verified=False,
   text='حلّ المعادلة 84/x = 14. نبحث عن عدد x بحيث 14 × x = 84 ، أي x = 84/14 = 6. تحقّق: 84/6 = 14. (البحث عن قاسم مجهول يؤول إلى حساب جداء عددين [sic] .)',
   answer={'x': 6, 'check': 14}, answerSource='computed', reading='Le cadre dit « جداء » ; le calcul est un quotient (discrepancy 2).')
assert 2 + 7 * 1 == 9 * 1 and 2 + 7 * 3 != 9 * 3 and F(40, 16) == F(5, 2)
el('now-61', 'now', 61, 'دوري الآن', verified=False,
   text='① نعتبر المساواة 2 + 7x = 9x . هل هي صحيحة من أجل x = 1 ؟ من أجل x = 3 ؟ هل هي صحيحة من أجل كل قيم x ؟ ② حلّ المعادلة 40/x = 16.',
   answer={'1': {'x=1': True, 'x=3': False, 'always': False}, '2': num(F(40, 16))}, answerSource='computed')

# ── pp. 62–63 : أوظّف تعلّماتي — إنتاج عبارات حرفية (PDF 59–60, relus à 110 dpi) ───────────────────────
EX = {}


def ex(n, page, section, text, verified=False, **kw):
    el(f'ex-{n}', 'exercise', page, section, text, verified=verified, number=n, **kw)


S1 = 'إنتاج عبارات حرفية'
ex(1, 62, S1, 'n عدد طبيعي. عبّر بدلالة n عن : أ) نصف n ب) العدد الطبيعي الذي يلي n ج) ضعف ثلث n د) العدد الطبيعي الذي يسبق n هـ) n مربّع و) ربع n.', verified=True,
   answer={'half': 'n/2', 'next': 'n + 1', 'prev': 'n − 1', 'doubleThird': '2n/3', 'quarter': 'n/4', 'square': 'n²'}, answerSource='computed')
_p = [(9 * k + 7) for k in (7, 6, 5, 10, 9, 8)]
ex(2, 62, S1, 'اكتب تعليمة تجنّب كتابة قائمة كلّ الحسابات: 9 × 7 + 7 ، 9 × 6 + 7 ، 9 × 5 + 7 ، 9 × 10 + 7 ، 9 × 9 + 7 ، 9 × 8 + 7.', verified=True,
   answer={'instruction': '9 × n + 7', 'n': [5, 6, 7, 8, 9, 10], 'values': sorted(_p)}, answerSource='computed')
ex(3, 62, S1, 'اكتب تعليمة تجنّب كتابة قائمة كلّ الحسابات: 5 − 4 + 4 ، 5 − 4 + 3 ، 5 − 4 + 2 ، 5 − 4 + 7 ، 5 − 4 + 6 ، 5 − 4 + 5.', verified=True,
   answer={'instruction': '5 − 4 + n', 'n': [2, 3, 4, 5, 6, 7]}, answerSource='computed')
ex(4, 62, S1, 'اكتب تعليمة تجنّب كتابة قائمة كلّ الحسابات: (5 + 5) × 4 ، (5 + 4) × 4 ، (5 + 3) × 4 ، (5 + 8) × 4 ، (5 + 7) × 4 ، (5 + 6) × 4.', verified=True,
   answer={'instruction': '(5 + n) × 4', 'n': [3, 4, 5, 6, 7, 8]}, answerSource='computed')
ex(5, 62, S1, 'اكتب بدلالة x الطول AB (قطعة [AB] : جزء 8 ثم جزء x).', verified=True, answer={'AB': '8 + x'}, answerSource='computed')
ex(6, 62, S1, 'اكتب بدلالة x الطول AB (قطعة طولها 13 منها جزء x).', verified=True, answer={'AB': '13 − x'}, answerSource='computed')
ex(7, 62, S1, 'اكتب بدلالة x الطول AB (قطعة مقسومة إلى 10 أجزاء كل منها x).', verified=True, answer={'AB': '10 × x'}, answerSource='computed', reading='nombre de segments à relire (lu 10)')
ex(8, 62, S1, 'اكتب بدلالة x محيط المثلث ABC المتساوي الساقين (الساقان x cm والقاعدة 5 cm).', verified=True, answer={'P': '2 × x + 5'}, answerSource='computed')
ex(9, 63, S1, 'وحدة الطول cm. اكتب P محيط المثلث بدلالة الحرف x (ساقان x والقاعدة 5).', verified=True, answer={'P': '2 × x + 5'}, answerSource='computed', reading='doublon visuel avec 8 (même triangle, p. 62 gauche)')
ex(10, 63, S1, 'وحدة الطول cm. اكتب A مساحة المستطيل بدلالة الحرف ℓ (طول المستطيل يساوي ضعف عرضه).', verified=True, answer={'A': '2 × ℓ × ℓ = 2ℓ²', 'note': 'lecture : ℓ = largeur, longueur 2ℓ'}, answerSource='computed', reading='énoncé ambigu (ℓ = largeur ?) ; à relire à 200 dpi')
ex(11, 63, S1, 'وحدة الطول cm. اكتب P محيط الشكل الآتي بدلالة الحرف x (مستطيل ضلعه x يتبعه مثلث متساوي الساقين).', verified=True, answer={'P': 'à relire sur la figure'}, answerSource='computed', reading='figure composite ; non utilisée telle quelle')
ex(12, 63, S1, 'x هو قيس زاوية بالدرجات. عبّر، في كلّ حالة، عن قيس الزاوية ABC بدلالة x (مثلثان بزوايا x و x و 2x).', verified=False, answer={'angles': 'à relire sur la figure'}, answerSource='computed')
ex(13, 63, S1, 'هذا برنامج حساب: «اختر عددا، اضربه في 3، أضف إليه 7 ثمّ خذ نصف النتيجة». طُلب من 3 تلاميذ كتابة العبارة التي تترجم برنامج الحساب: أمين 3x + 7/2 ، سيلين (3x + 7)/2 ، حمزة 3(x + 7)/2. ما هو التلميذ الذي كتب العبارة الصحيحة؟', verified=True,
   answer={'correct': 'سيلين', 'expression': '(3x + 7)/2', 'check x=5': str(F(3 * 5 + 7, 2))}, answerSource='computed')
S2 = 'أستعمل عبارات حرفية'
assert [3 * x + 5 for x in (3, 4, 5)] == [14, 17, 20] and [2 - 5 * x for x in (0, 1)] == [2, -3]
ex(14, 63, S2, 'نعتبر العبارة الحرفية A = 3x + 5. احسب A من أجل x = 3 ؛ x = 4 ؛ x = 5.', verified=True, answer={'A': {3: 14, 4: 17, 5: 20}}, answerSource='computed')
ex(15, 63, S2, 'نعتبر العبارة الحرفية B = 2 − 5x. احسب B من أجل x = 0 ؛ x = 1 ؛ x = −1.', verified=True, answer={'B': {0: 2, 1: -3, -1: 7}}, answerSource='computed', reading='valeurs négatives : après l’unité 3 (discrepancy 10)')
_c = {x: 100 * q(x) + 25 for x in ('0,25', '0,5', '12,5')}
ex(16, 63, S2, 'نعتبر العبارة الحرفية C = 100x + 25. احسب C من أجل x = 0,25 ؛ x = 0,5 ؛ x = 12,5.', verified=True, answer={'C': {k: num(v) for k, v in _c.items()}}, answerSource='computed',
   reading='le signe imprimé semble « − » sur le scan (100x − 25) ; lu « + » avec la table de l’exercice 20 (6x + 25) — à relire')
assert 3 * 2 + 4 * 3 + 1 == 19 and 3 * 4 + 4 * 9 + 1 == 49
ex(17, 63, S2, 'احسب العبارة 1 + 3 × x + 4 × y من أجل : أ) x = 2 و y = 3 ؛ ب) x = 4 و y = 9. (3x + 4y + 1)', verified=True, answer={'a': 19, 'b': 49}, answerSource='computed')
ex(18, 63, S2, 'أكمل الجدول (x = 1 ، x = 3 ، x = 12,5) للعبارات 4 × x − 5 ، 6 × x + 25 ، 3 × (x + 5).', verified=True,
   answer={'4x-5': {1: -1, 3: 7, '12,5': num(4 * F(25, 2) - 5)}, '6x+25': {1: 31, 3: 43, '12,5': num(6 * F(25, 2) + 25)}, '3(x+5)': {1: 18, 3: 24, '12,5': num(3 * (F(25, 2) + 5))}}, answerSource='computed')
S3 = 'تبسيط حساب حرفي'
ex(19, 63, S3, 'اكتب بشكل مبسّط كلا من : أ) ½ × a ب) 5 × (a + b) ج) 2 × a × a د) 7 × a × b.', verified=True, answer={'a': 'a/2', 'b': '5(a + b)', 'c': '2a²', 'd': '7ab'}, answerSource='computed')
ex(20, 63, S3, 'اربط بين كلّ عبارتين متساويتين: 2(a + 6) ، 12a ، 12 + a ، 2 + 6a ، 2 × 6 + a ، 2 × 6 × a ، 2 + a × 6 ، 2 × (a + 6).', verified=True,
   answer={'pairs': [['2(a + 6)', '2 × (a + 6)'], ['12a', '2 × 6 × a'], ['12 + a', '2 × 6 + a'], ['2 + 6a', '2 + a × 6']]}, answerSource='computed')
ex(21, 63, S3, 'بسّط قدر الإمكان كلا من العبارات: أ) 2a + 0 × b − 4 + a ب) 3a × b − 3a − 3ab ج) c + c × c + c د) a × a − 2 × a × b + b × b.', verified=True,
   answer={'a': '3a − 4', 'b': '−3a', 'c': '2c + c²', 'd': 'a² − 2ab + b²'}, answerSource='computed', reading='d est parfois lue c × c ; ib. 21 b donne 3ab − 3a − 3ab = −3a (négatif : bank après l’unité 3)')
ex(22, 63, S3, 'x عدد. نعتبر العبارة الحرفية 5 × x + 2 × x + 3 × 8. 1) هذه العبارة مجموع. ما هو عدد حدوده؟ 2) أ) بسّط كتابة هذه العبارة. ب) ما هو العامل المشترك بين الحدّين الأوّل والثاني من العبارة؟ ج) أكمل: 5x + 2x = (… + …)x. 3) اكتب العبارة على شكل مجموع حدّين مبسّطين.', verified=True,
   answer={'terms': 3, 'simplified': '7x + 24', 'commonFactor': 'x', 'factorisation': '(5 + 2)x'}, answerSource='computed')
ex(23, 63, S3, 'أعد كتابة كلّ من العبارات بإضافة كلّ إشارات العمليات غير الظاهرة: أ) 7x ب) 2x + y ج) 1 − 3x د) 3(2x + y) هـ) 2x² + 12 و x³.', verified=True,
   answer={'a': '7 × x', 'b': '2 × x + y', 'c': '1 − 3 × x', 'd': '3 × (2 × x + y)', 'e': '2 × x × x + 12', 'f': 'x × x × x'}, answerSource='computed')
ex(24, 63, 'اختبار تساوي عبارتين حرفيتين', 'احسب من أجل x = 3 : أ) 3x ب) 1/9 x² ج) 4x − 1 د) 7(x − 3).', verified=True,
   answer={'a': 9, 'b': 1, 'c': 11, 'd': 0}, answerSource='computed')
_abc = dict(a=3, b=4, c=10)
ex(25, 63, 'اختبار تساوي عبارتين حرفيتين', 'احسب من أجل a = 3 ، b = 4 ، c = 10 : C = 5a ، B = b + 6 ، A = a + b + c ، E = 2a + 3b − c ، D = 3 + 10a ، F = 4c + 3b × 2a.', verified=True,
   answer={'C': 15, 'B': 10, 'A': 17, 'E': 2 * 3 + 3 * 4 - 10, 'D': 33, 'F': 4 * 10 + 3 * 4 * 2 * 3}, answerSource='computed', reading='F lue 4c + 3b × 2a (le scan est flou)')
ex(26, 63, 'اختبار تساوي عبارتين حرفيتين', 'نضع x = 2 و y = 3. 1) احسب قيمة A = 3x − 4y + 12. 2) احسب قيمة B = 4 + x(2y − 3).', verified=True,
   answer={'A': 3 * 2 - 4 * 3 + 12, 'B': 4 + 2 * (2 * 3 - 3)}, answerSource='computed')

# ── p. 64 : أوظّف تعلّماتي (PDF 61) — اختبار المساواة والمعادلات ─────────────────────────────────────
assert 28 + 4 * 6 == 52 and 9 * 6 - 2 == 52
ex(27, 64, 'اختبار تساوي عبارتين حرفيتين', 'نريد معرفة إن كانت المساواة 28 + 4x = 9x − 2 صحيحة من أجل x = 6. 1) احسب من أجل x = 6 : أ) قيمة 28 + 4x ب) قيمة 9x − 2. 2) هل المساواة صحيحة من أجل x = 6 ؟', verified=False,
   answer={'28+4x': 52, '9x-2': 52, 'holds': True}, answerSource='computed')
_t = {x: [(1 + q(x)) == 2 * q(x) + F(1, 5), 2 + 2 * q(x) == 2 * (q(x) + 1)] for x in ('2', '5', '0,2')}
ex(28, 64, 'اختبار تساوي عبارتين حرفيتين', 'أ) اختبر كلّ مساواة من أجل القيم المعطاة في الجدول: x = 2 ، x = 5 ، x = 0,2 ؛ 1 + x = 2x + 0,2 و 2 + 2x = 2(x + 1). ب) ما هي العبارة الصحيحة دائما ؟ برّر.', verified=True,
   answer={'1+x=2x+0,2': {'2': False, '5': False, '0,2': False}, '2+2x=2(x+1)': {'2': True, '5': True, '0,2': True}, 'always': '2 + 2x = 2(x + 1)'}, answerSource='computed',
   reading='la première ligne n’est vraie qu’en x = 0,8 : fausse pour les trois valeurs du tableau')
assert (-4 + 6 * 5, 2 * (5 + 8)) == (26, 26) and (-4 + 6 * 7, 2 * (7 + 8)) == (38, 30)
ex(29, 64, 'اختبار تساوي عبارتين حرفيتين', 'هل المساواة −4 + 6x = 2(x + 8) صحيحة من أجل : أ) x = 5 ؟ ب) x = 7 ؟', verified=False,
   answer={'x=5': True, 'x=7': False}, answerSource='computed', reading='−4 + 6x : valeur signée (unité 3) — x = 5 : 26 = 26 vrai, x = 7 : 38 ≠ 30')
ex(30, 64, 'اختبار تساوي عبارتين حرفيتين', 'هل المساواات الآتية صحيحة؟ أ) x + 2x = 3x² ب) 2x + 4x = 8x² ج) 3 + 4x = 7x د) 3(x + 5) = 3x + 15.', verified=True,
   answer={'a': False, 'b': False, 'c': False, 'd': True}, answerSource='computed', reading='ce sont des égalités vraies « pour tout x » ou non : seule d (distributivité) ; contre-exemples x = 1 pour a, b, c')
assert [x for x in (1, F(3, 2), 2, F(5, 2)) if 6 * x + 7 == 22] == [F(5, 2)]
ex(31, 64, 'اختبار تساوي عبارتين حرفيتين', 'نعتبر العبارة : 22 = 6x + 7. من بين القيم الآتية توجد قيمة واحدة تحقّق المساواة، ما هي ؟ أ) x = 1 ب) x = 1,5 ج) x = 2 د) x = 2,5.', verified=True,
   answer={'x': '2,5'}, answerSource='computed')
ex(32, 64, 'اختبار تساوي عبارتين حرفيتين', 'من بين العبارات الآتية، اذكر التي تساوي العبارة 4n + 4 : أ) 4(n + 1) ب) 8n ج) 4n + 1 د) n + 1 + n + 1 + n + 1 + n + 1.', verified=False,
   answer={'equal': ['4(n + 1)', 'n + 1 + n + 1 + n + 1 + n + 1']}, answerSource='computed')
ex(33, 64, 'اختبار تساوي عبارتين حرفيتين', 'اكتب عبارات أخرى تساوي العبارة 6n + 14.', verified=False, answer={'examples': ['2(3n + 7)', '6n + 10 + 4']}, answerSource='computed')
S4 = 'المعادلات'
ex(34, 64, S4, 'احسب ذهنيا. أ) ما هو العدد الذي إذا أضفناه إلى 16 نحصل على … ؟ ب) ما هو العدد الذي إذا طرحناه من 48 نحصل على … ؟ ج) ما هو العدد الذي إذا ضربناه في 3 نحصل على … ؟ د) على أيّ عدد نقسم 144 لنحصل على 12 ؟', verified=False,
   answer={'d': 12}, answerSource='computed', reading='les résultats cibles sont coupés à droite ; seule la question d est complète (144 ÷ 12 = 12)')
ex(35, 64, S4, 'احسب ذهنيا. 1) ما هو العدد الذي إذا أضفناه إلى 1,5 نحصل على … 2) … طرحناه من 20 … 3) … ضربناه في 7 … 4) على أيّ عدد نقسم 12 لنحصل على 2,4 ؟', verified=False,
   answer={'4': 5}, answerSource='computed', reading='cibles coupées ; la question 4 : 12 ÷ 5 = 2,4')
ex(36, 64, S4, 'عيّن العدد الناقص في كلّ من المساويات الآتية: أ) 150 − □ = 75 ب) 5 + □ = 135 ج) 0,5 × □ = 2 د) 24 − □ = −6.', verified=True,
   answer={'a': 75, 'b': 130, 'c': 4, 'd': 30}, answerSource='computed', reading='d : −6 signé (unité 3)')
ex(37, 64, S4, 'عيّن العدد الناقص في كلّ من المساويات الآتية: أ) □ − 0,75 = 9 ب) 15 × □ = 87 ج) 5 × □ = 11 د) 0,1 × □ = 0,47 هـ) 121/□ = 11 و) 0,47/□ = 0,1.', verified=True,
   answer={'a': num(q('9.75')), 'b': num(F(87, 15)), 'c': num(F(11, 5)), 'd': num(q('4,7')), 'e': 11, 'f': num(q('4,7'))}, answerSource='computed')
ex(38, 64, S4, 'حلّ المعادلتين : أ) x/7 = 11 ب) 21/x = 3.', verified=True, answer={'a': 77, 'b': 7}, answerSource='computed')
ex(39, 64, S4, 'حلّ المعادلات : أ) 169/x = 13 ب) 145/x = 29 ج) 47/x = 0,1 د) 2530/x = 0,01.', verified=True,
   answer={'a': 13, 'b': 5, 'c': 470, 'd': 253000}, answerSource='computed')
assert q('15') / (3 - 1) == q('7,5')
ex(40, 64, S4, 'طول خطوة أمين 75 cm وطول خطوة العملاق ثلاث مرّات خطوة أمين. 1) عبّر بدلالة x عن المسافة التي يقطعها كلّ من أمين والعملاق في x خطوة. 2) بعد x خطوة، تأخّر أمين بمسافة 15 m عن العملاق : ما هي المعادلة التي يجب أن يحقّقها x ؟', verified=False,
   answer={'amine': '75 × x', 'giant': '225 × x', 'equation': '225x − 75x = 1500', 'x': 10}, answerSource='computed')
assert 225 * 10 - 75 * 10 == 1500
# ex-41 … ex-43 : absents du scan — une DISCREPANCY, pas un élément

# ── p. 65 : أؤكّد تعلّماتي (PDF 62, relu à 110 dpi) ─────────────────────────────────────────────────
x35 = F(35, 10)
assert 7 + 3 * (2 * 4 - 5) == 16 and 6 * q('3,5') + 4 == 25 and 73 * q('43,75') + 27 * q('43,75') == q('4375')
assert 3 * 4 + 20 == 32 == 8 * 4 and 5 * (4 - 2) == 5 * 4 - 10 and q('40,6') / q('0,7') == 58
SELF = [
    (1, 'العبارة بدلالة x التي تترجم برنامج الحساب : «أختار عددا x ، أضيف إليه 1/2 وأضرب النتيجة في 3» هي : أ) x + 1/2 × 3 ب) 1/2 (x + 3) ج) 3(x + 1/2)', 'ج', I, 58),
    (2, 'العبارة التي تترجم : «أختار عددا x ، أضيف له 1 أضرب المجموع في 3 وأطرح من النتيجة 2» هي : أ) 2 − (x + 1) × 3 ب) 3x + 1 ج) 3x + 2', 'ب', I, 58),
    (3, 'العبارة التي تلخّص قائمة الحسابات: 5 × 1 + 1 ، 5 × 2 + 1 ، … ، 5 × 10 + 1 هي : أ) 5n + 1 ب) 5 + n + 1 ج) 5 × (n + 1)', 'أ', I, 58),
    (4, 'عند تعويض x بـ 4 في العبارة A = 7 + 3(2x − 5) نجد : أ) A = 16 ب) A = −2 ج) A = 10', 'أ', I, 60),
    (5, 'قيمة العبارة الحرفية 6x + 4 من أجل x = 3,5 هي : أ) 21 ب) 25 ج) 22', 'ب', I, 60),
    (6, '3(5x + 4) هي الكتابة المبسّطة للعبارة : أ) 3 + (5x + 4) ب) 3 + 5 + x + 4 ج) 3 × (5 × x + 4)', 'ج', I, 58),
    (7, 'قيمة العبارة E = 73x + 27x ، من أجل x = 43,75 هي : أ) 437,5 ب) 4375 ج) 43750', 'ب', I, 60),
    (8, 'المساواة 3x + 20 = 8x محقّقة من أجل : أ) x = −4 ب) x = 4 ج) x = 2,4', 'ب', T, 60),
    (9, 'العبارتان A = 5(x − 2) و B = 5x − 10 : أ) متساويتان من أجل جميع قيم x ب) متساويتان من أجل x = 0 فقط ج) غير متساويتين دوما', 'أ', T, 61),
    (10, 'مساحة المستطيل الذي عرضه 9 cm وطوله x تكتب بدلالة x على الشكل : أ) 2x(9 + x) ب) 9x ج) 2 × (9 + 2x)', 'ب', I, 59),
    (11, 'العدد الناقص في المساواة 58 = 40,6/□ هو : أ) 7 ب) 0,7 ج) 0,07', 'ب', H, 61),
]
for n, t, a, owner, back in SELF:
    el(f'self-{n}', 'qcm', 65, 'أؤكّد تعلّماتي', t, verified=(owner == I), number=n, answer=a, answerSource='computed', onFailPage=back)

# ── p. 66 : أتعمّق (PDF 63) ────────────────────────────────────────────────────────────────────────
S5 = 'أتعمّق'
el('deep-44', 'deep', 66, S5, 'عبّر بدلالة x عن طول كلّ أحرف العلبة (متوازي مستطيلات : 42 cm و x).', verified=True, number=44, answer={'edges': 'à relire sur la figure'}, answerSource='computed')
el('deep-45', 'deep', 66, S5, 'على الشكل الآتي، ABCD و AEFG مربّعان. 1) عبّر بدلالة x و y عن مساحة المستطيل EBHF. 2) عبّر بدلالة x و y عن مساحة المستطيل GHCD. 3) استنتج عبارة مبسّطة للجزء الملوّن.', verified=True, number=45,
   answer={'EBHF': 'y × (x − y)', 'GHCD': 'x × (x − y)'}, answerSource='computed', reading='lecture : AB = x, AE = y ; à relire (la figure est dense)')
assert 10 - 2 * 3 == 4 and 2 * (3 + 2) == 10
el('deep-46', 'deep', 66, S5, 'نصنع بخيط طوله 10 cm مستطيلا. نعتبر x أحد بعديه. 1) اكتب بدلالة x عبارة محيط المستطيل P. تحقّق من أنّ P = 10 cm. 2) اكتب بدلالة x عبارة مساحة المستطيل A. 3) احسب مساحة المستطيل من أجل x = 3 cm.', verified=True, number=46,
   answer={'otherSide': '5 − x', 'P': '2 × (x + 5 − x) = 10', 'A': 'x × (5 − x)', 'A(3)': 3 * (5 - 3)}, answerSource='computed')
_match = lambda n: 2 * n + 1
assert [_match(n) for n in (1, 2, 3, 10, 265)] == [3, 5, 7, 21, 531]
el('deep-47', 'deep', 66, S5, 'باستعمال أعواد كبريت، نصنع مثلثات حسب النموذج الآتي (مثلثات متتالية تتشارك ضلعا). أ) ما هو عدد الأعواد اللازمة لصنع مثلث واحد؟ ب) … لصنع مثلثين؟ 3 مثلثات؟ 5 مثلثات؟ 10 مثلثات؟ 265 مثلث؟ جـ) أوجد عبارة تسمح بمعرفة عدد الأعواد اللازمة …', verified=True, number=47,
   answer={'sticks': {n: _match(n) for n in (1, 2, 3, 5, 10, 265)}, 'formula': '2 × n + 1'}, answerSource='computed', reading='la figure : n triangles en chaîne, chaque nouveau triangle ajoute 2 allumettes ; 2n + 1')
el('deep-48', 'deep', 66, S5, 'مشكل مفتوح: في مضلع، القطر هو طول قطعة مستقيم يكون طرفاها رأسين غير متتابعين للمضلع. ما هو عدد أقطار مضلع له x ضلعا ؟', verified=True, number=48,
   answer={'diagonals': 'x(x − 3)/2', 'table': {k: k * (k - 3) // 2 for k in (3, 4, 5, 6, 7, 8)}}, answerSource='computed')
el('deep-49', 'deep', 66, S5, 'نعتبر المساواة : 5 × (x + 6) + 5 = 5 × (x + 8) − 5. 1) اختبر المساواة من أجل : x = 1 ، x = 4 و x = 12. 2) ماذا تلاحظ ؟ 3) هل يمكن أن نستنتج أنّ هذه المساواة صحيحة دائما ؟', verified=False, number=49,
   answer={'x=1': [40, 40], 'x=4': [55, 55], 'x=12': [95, 95], 'always': True}, answerSource='computed')
assert all(5 * (x + 6) + 5 == 5 * (x + 8) - 5 for x in range(0, 20)) and all(4 * (x + 3) - 8 == 4 * (x + 1) for x in range(0, 20))
el('deep-50', 'deep', 66, S5, 'نعتبر المساواة : 4 × (x + 3) − 8 = 4 × (x + 1). 1) اختبر المساواة من أجل عدّة أعداد من اختيارك. 2) ما هو التخمين الذي يمكن أن تضعه حول المساواة ؟ 3) برّر.', verified=False, number=50, answer={'always': True}, answerSource='computed')
assert 46 * 35 == 230 + 1380 == 1610
el('deep-51', 'deep', 66, S5, 'عند وضع العملية 35 × 46 عموديا، نلاحظ أنّ الطريقة تؤول إلى حساب 230 + 1380. اشرح ذلك.', verified=True, number=51, answer={'product': 1610, 'split': '5 × 46 + 30 × 46 = 230 + 1380'}, answerSource='computed')
_prog = lambda n: ((n + (n + 1)) * 2 - 2) / 4
assert all(_prog(n) == n for n in (5, 12, 25))
el('deep-52', 'deep', 66, S5, 'برنامج حساب: اختر عددا طبيعيا غير معدوم. أضف إليه التالي له مباشرة. اضرب في 2. اطرح 2. قسّم على 4. 1) طبّق البرنامج باختيار 5 ، 12 و 25 كعدد البداية. 2) ماذا تلاحظ ؟ …', verified=True, number=52,
   answer={'results': {5: 5, 12: 12, 25: 25}, 'expression': '((n + (n + 1)) × 2 − 2) ÷ 4 = n'}, answerSource='computed')

# ── p. 67 : أتعمّق (PDF 64) ────────────────────────────────────────────────────────────────────────
assert 3 * 8 + 7 == 31
el('deep-53', 'deep', 67, S5, 'ورقة حساب في المجدول: العبارة 3x + 7 = 31 ، مع قيم x من 0 إلى 10 (عمود للطرف الأيسر وعمود للنتيجة).', verified=False, number=53, answer={'x': 8}, answerSource='computed', reading='marge droite coupée (discrepancy 7)')
el('deep-54', 'deep', 67, S5, 'مجموع ثلاثة أعداد طبيعية متتالية يساوي 3 مرّات العدد الأوسط. هل هذا صحيح دائما ؟ برّر.', verified=False, number=54,
   answer={'always': True, 'expression': '(n − 1) + n + (n + 1) = 3n'}, answerSource='computed')
assert 0 + 0 == 0 * 0 and 2 + 2 == 2 * 2 and 3 + 3 != 3 * 3
el('deep-55', 'deep', 67, S5, 'نقول: n + n = n × n من أجل n = 0. هل هذه المساواة صحيحة دائما ؟', verified=False, number=55, answer={'n=0': True, 'n=1': False, 'n=2': True, 'always': False}, answerSource='computed')
el('deep-56', 'deep', 67, S5, 'ترجم بمعادلة: ارتفعت درجة الحرارة بـ 10 °C فبلغت 9 °C ؛ عمر أمين 10 سنوات ويكبره … بـ 9 ؛ مستطيل مساحته 9 cm² وطوله 10 cm.', verified=False, number=56,
   answer={'temperature': {'equation': 'x + 10 = 9', 'x': -1}, 'rectangle': {'equation': '10 × x = 9', 'x': num(F(9, 10))}}, answerSource='computed', reading='x = −1 : après l’unité 3')
el('deep-57', 'deep', 67, S5, 'حوار: محيط مثلث أضلاعه x ، x − 2 ، x + 2 يساوي 27 ؛ هل x = 9 ؟', verified=False, number=57, answer={'x=9': 9 + 7 + 11 == 27}, answerSource='computed')
assert 9 + 7 + 11 == 27
el('deep-58', 'deep', 67, S5, 'زوايا مثلث قيسها x ، 2x ، 3x بالدرجات : عيّن x.', verified=False, number=58, answer={'x': 30, 'equation': '6x = 180'}, answerSource='computed')
el('deep-59', 'deep', 67, S5, 'ورقة مستطيلة بها فتحة (شكل مقصوص): محيطها ومساحتها بدلالة x ؛ المحيط P = 45 cm : عيّن x.', verified=False, number=59, answer={'note': 'figure à relire à 200 dpi'}, answerSource='computed')
el('deep-60', 'deep', 67, S5, 'أربعة أعداد متتالية الفرق بينها 2 : مجموعها مضاعف للعدد 4. برّر.', verified=False, number=60, answer={'sum': '4n + 12 = 4(n + 3)'}, answerSource='computed')
_tank = F(3000 - 450, 4)
el('deep-61', 'deep', 67, S5, 'ثلاثة خزّانات وقود: B = A + 150 ، C = 2B ، المجموع 3000 L. عيّن A.', verified=False, number=61, answer={'A': num(_tank), 'equation': '4A + 450 = 3000'}, answerSource='computed')
assert _tank == F('637.5')

# ── pp. 68–69 : أدمج تعلّماتي، وضعية للتقويم، تكنولوجيات (PDF 65–66) ─────────────────────────────────
assert 1300 + 150 * 25 == 5050 == 800 + 170 * 25 and all(1300 + 150 * n > 800 + 170 * n for n in range(0, 25)) and (1300 - 800) / (170 - 150) == 25
el('integration', 'integration', 68, 'أدمج تعلّماتي', title='النادي', verified=False,
   text='نادي A : 1300 DA للاشتراك + 150 DA مقابل كلّ حصّة. نادي B : 800 DA + 170 DA مقابل كلّ حصّة. 1) عبّر عن المبلغ في كلّ نادٍ بدلالة عدد الحصص n. 2) أنجز جدولا. 3) متى يتساوى المبلغان ؟ ومتى يكون B أرخص ؟',
   answer={'A': '1300 + 150n', 'B': '800 + 170n', 'equalAt': 25, 'cost': 5050, 'BCheaperFor': 'n < 25'}, answerSource='computed', reading='la 1re formule est « الصيغة A », la 2e « النادي B » (discrepancy 9)')
assert D('130') ** 2 / D('101.6') != D('166.33')
_brake = lambda v, k: F(v * v) / q(k)
el('evaluation', 'integration', 68, 'وضعية للتقويم', title='مسافة الكبح', verified=False,
   text='مسافة الكبح D = V × V / 203,2 على طريق جافّ و V × V / 101,6 على طريق مبلل (V بـ km/h و D بالمتر). سيارة تسير بسرعة 130 km/h ، وحيوان على بعد 150 m. هل تتوقّف السيارة قبل الحيوان ؟',
   answer={'dry': num(_brake(130, '203,2')), 'wet': num(_brake(130, '101,6'))}, answerSource='computed', reading='130² ÷ 101,6 n’est pas un décimal exact : la synthèse remplace la formule (README, owner question 13)')
assert 2 * q('10,5') + 3 == 24 and 2 * 4 + 3 == 11 == 3 * 4 - 1
assert (10.5 + 3) * 2 + 2 * 10.5 == 48
el('ict', 'ict', 69, 'أوظّف تكنولوجيات الإعلام والاتصال', title='باستعمال مجدول', verified=False,
   text='نشاط: نريد حلّ المعادلة (x + 3) × 2 + 2x = 48 باستعمال مجدول: نحسب العبارة من أجل قيم x بخطوة 0,5. ثم «دوري الآن» : حلّ المعادلة 2x + 3 = 3x − 1 بجدول قيم x = 0 … 11.',
   answer={'activity': {'equation': '(x + 3) × 2 + 2x = 48', 'x': '10,5'}, 'nowYourTurn': {'equation': '2x + 3 = 3x − 1', 'x': 4}}, answerSource='computed')

DISCREPANCIES = [
    {'elementId': 'method-4', 'kind': 'misprint', 'text': 'p. 61 : la dernière ligne de la solution imprime « x + 200 = 3 × x + 1000 » ; l’énoncé et le commentaire donnent 100.'},
    {'elementId': 'method-5', 'kind': 'misprint', 'text': 'p. 61 : le cadre dit « البحث عن قاسم مجهول يؤول إلى حساب جداء عددين » alors que le calcul est un QUOTIENT (x = 84 ÷ 14) ; la 2e flèche de calcul « 84 ×x→ 14 » devrait être « 14 ×x→ 84 ». La plateforme écrit « … يؤول إلى حساب حاصل قسمة » (hall-mushkil-muadala, module 3).'},
    {'elementId': 'method-2', 'kind': 'reading', 'text': 'p. 59 : « مربّع له n بلاطة على ضلعه » avec « 4 × n + 4 » : un carré de n tuiles par côté a 4n − 4 tuiles de bord ; le décompte du livre est celui du contour AUTOUR d’un carré de n × n. La plateforme dit toujours « حوض من n × n بلاطة، يحيط به إطار » (ibara-harfiya-intaj, module 3).'},
    {'elementId': 'act-3', 'kind': 'cut', 'text': 'p. 57, question 5 : la liste de valeurs est coupée à droite (« … ، 5 ، 6 ، 7 ») ; la première valeur lisible est illisible (10x − 2 < 55 − 3x est vraie pour x ≤ 4 seulement, donc la liste imprimée contient une valeur ≤ 4).'},
    {'elementId': 'act-2', 'kind': 'cut', 'text': 'p. 56 : la question 3 b–c est coupée au bas de la page.'},
    {'elementId': 'unit', 'kind': 'cut', 'text': 'p. 64 : ex-41 … ex-43 sont absents du scan (le bas de la page est coupé après ex-40 et ex-33).'},
    {'elementId': 'unit', 'kind': 'cut', 'text': 'pp. 63 et 67 : ex-14 … ex-20 et deep-53 … deep-57 ont leurs nombres et débuts de lignes coupés sur le bord droit ; la numérotation est déduite de la suite.'},
    {'elementId': 'know-5', 'kind': 'cut', 'text': 'p. 60 : la fin de la définition de « المعادلات » et son exemple sont coupés au bas de la page (« … تعطيان نفس النتيجة 5 »).'},
    {'elementId': 'integration', 'kind': 'naming', 'text': 'p. 68 : « الصيغة A » puis « النادي B » (appellation) ; les deux formules coûtent 5050 DA pour n = 25.'},
    {'elementId': 'unit', 'kind': 'scope', 'text': 'Valeurs négatives du livre (ex-15 : B = 2 − 5x en x = 1 et −1 ; ex-36 d : 24 − □ = −6 ; deep-56 : +10 °C → 9 °C) : légitimes après l’unité 3, mais l’ordre de génération (ibara et hall avant majmu-jabri) les exclut des modules et des étapes comptées d’ibara et de hall (README, question 10).'},
    {'elementId': 'deep-61', 'kind': 'scope', 'text': 'p. 67 : hors du périmètre 2AM (4x + 450 = 3000 demande un regroupement et une équation décimale à deux opérations : 3AM muadalat-darajat-ula). Aucune leçon ne l’intègre (`notIntegrated`).'},
    {'elementId': 'unit', 'kind': 'scope', 'text': 'pp. 54–69 lues à 110 dpi (marge droite et bas de plusieurs pages coupés : scan médiocre). Les éléments d’ibara-harfiya-intaj sont relus et `verified: True` ; ceux de hall-mushkil-muadala, ikhtibar-musawat-mutabayina et de la synthèse restent `verified: False` : leur leçon les relira.'},
    {'elementId': 'prep', 'kind': 'reading', 'text': 'p. 55 : items 6–10 : l’énoncé est coupé à droite ; les options sont lues dans les colonnes (1) (2) (3) ; l’item 10 (périmètre du pentagone, côtés 2x et 3) est repris par ibara-harfiya-intaj avec ses propres nombres.'},
    {'elementId': 'ex-21', 'kind': 'scope', 'text': 'p. 63 : 3ab − 3a − 3ab = −3a est un résultat négatif signé ; ibara ne le prend pas (valeurs ≥ 0).'},
]

DEST = {
    '_comment': 'elementId → { lesson, module } ; `items` répartit un élément ; une leçon encore coming_soon est une destination EN ATTENTE (check-textbook-coverage.mjs). Modules de ibara-harfiya-intaj : 0 أستعدّ · 1 نشاط (خلايا الشمع) · 2 معارف · 3 طريقة · 4 أتمرّن · 5–7 مسائل · 8 إختبار أولي. `None` = la banque de pratique seulement.',
    'objectives': {'lesson': 'unit', 'module': 'page'},
    'opener': {'lesson': I, 'module': 2},
    'challenge': {'lesson': 'unit', 'module': 'page', 'duplicatedIn': [{'lesson': I, 'module': 1}],
                  'note': "l'idée (compter un motif croissant pour TOUT n) entre par le laboratoire `wax-cells` ; la carte de l'unité porte le texte réécrit (README du plan, § « Le تحدّي »), sourceElementId « challenge »"},
    'prep': {'lesson': I, 'module': 0, 'items': {'1-2-3-4-5': {'lesson': I, 'module': 0}, '6-7-8-9': {'lesson': H, 'module': 0}, '10': {'lesson': I, 'module': 4}}},
    'act-1': {'lesson': I, 'module': 4}, 'act-2': {'lesson': I, 'module': 5},
    'act-3': {'lesson': T, 'module': 4}, 'act-4': {'lesson': H, 'module': 4},
    'know-1': {'lesson': I, 'module': 2}, 'know-2': {'lesson': I, 'module': 2},
    'know-3': {'lesson': T, 'module': 2}, 'know-4': {'lesson': T, 'module': 2}, 'know-5': {'lesson': H, 'module': 2},
    'method-1': {'lesson': I, 'module': 3}, 'method-2': {'lesson': I, 'module': 3}, 'method-3': {'lesson': T, 'module': 3},
    'method-4': {'lesson': H, 'module': 3}, 'method-5': {'lesson': H, 'module': 3},
    'now-59': {'lesson': I, 'module': 4},
    'now-61': {'lesson': T, 'module': 4, 'items': {'1': {'lesson': T, 'module': 4}, '2': {'lesson': H, 'module': 4}}},
    **{f'ex-{n}': {'lesson': I, 'module': 4 if n in (1, 2, 5, 13, 14, 17, 19, 21, 22) else None} for n in range(1, 27) if n not in (10, 11, 12, 15, 16, 18, 20)},
    'ex-10': {'lesson': I, 'module': None, 'notIntegrated': 'énoncé ambigu (ℓ largeur ou longueur ?) : l\'aire d\'un rectangle en x est reprise par la مسألة 2'},
    'ex-11': {'lesson': I, 'module': None, 'notIntegrated': 'figure composite à relire à 200 dpi : le périmètre en x est repris par les exercices 4 et la مسألة 2'},
    'ex-12': {'lesson': I, 'module': None, 'notIntegrated': 'mesures d\'angles en x : figure à relire ; hors des idées de la leçon (angles : 3AM)'},
    'ex-15': {'lesson': I, 'module': None, 'notIntegrated': 'valeur négative (B = 2 − 5x en x = 1, −1) : après l\'unité 3, ordre de génération (README, question 10)'},
    'ex-16': {'lesson': I, 'module': None, 'notIntegrated': 'le signe imprimé de C = 100x ± 25 est illisible sur le scan'},
    'ex-18': {'lesson': I, 'module': None, 'notIntegrated': 'le tableau contient 4x − 5 en x = 1 (valeur négative) : après l\'unité 3'},
    'ex-20': {'lesson': T, 'module': None, 'note': 'apparier des écritures égales : c\'est tester une égalité (ikhtibar-musawat-mutabayina P2), pas produire une écriture'},
    **{f'ex-{n}': {'lesson': T, 'module': 4 if n in (27, 28, 30, 31) else None} for n in range(27, 34)},
    **{f'ex-{n}': {'lesson': H, 'module': {34: 0, 37: 4, 38: 4, 39: 4, 40: 5}.get(n)} for n in range(34, 41)},
    **{f'self-{n}': {'lesson': I, 'module': None} for n in (1, 2, 3, 4, 5, 6, 7, 10)},
    **{f'self-{n}': {'lesson': T, 'module': None} for n in (8, 9)},
    'self-11': {'lesson': H, 'module': None},
    # wadiya-idmajiya-mafhum-muadala (2026-10-30) : le banc de la synthèse reprend `self-2` (niveau 2, copie adaptée) — seconde utilisation déclarée.
    'self-2': {'lesson': I, 'module': None, 'duplicatedIn': [{'lesson': S, 'module': None}]},
    'deep-44': {'lesson': I, 'module': None, 'notIntegrated': 'figure à relire à 200 dpi (arêtes d\'une boîte de 42 cm et x) ; l\'idée « longueur en x » est celle des exercices 2 et 4 du module 4'},
    'deep-45': {'lesson': I, 'module': None, 'notIntegrated': 'figure dense (deux carrés ABCD et AEFG, aires en x et y) : demande une soustraction de longueurs, hors du périmètre de la leçon ; l\'aire d\'un rectangle en x est reprise par la مسألة 2'},
    'deep-46': {'lesson': I, 'module': 6},
    'deep-47': {'lesson': I, 'module': None},
    'deep-48': {'lesson': I, 'module': None, 'notIntegrated': 'x(x − 3)/2 demande de développer un produit : 3AM (nashr-jabri-3am) ; problème ouvert sans sa conclusion exacte au niveau 2AM'},
    'deep-49': {'lesson': T, 'module': None}, 'deep-50': {'lesson': T, 'module': 7},
    'deep-51': {'lesson': I, 'module': None, 'notIntegrated': 'la multiplication posée 35 × 46 = 230 + 1380 est la distributivité de l\'unité 1 (tawzi-darb-jam-tarh)'}, 'deep-52': {'lesson': I, 'module': 7},
    'deep-53': {'lesson': H, 'module': None},
    'deep-54': {'lesson': T, 'module': 7}, 'deep-55': {'lesson': T, 'module': 4},
    'deep-56': {'lesson': H, 'module': 4}, 'deep-57': {'lesson': T, 'module': None},
    'deep-58': {'lesson': S, 'module': None}, 'deep-59': {'lesson': H, 'module': None}, 'deep-60': {'lesson': T, 'module': None},
    'deep-61': {'lesson': S, 'module': None, 'notIntegrated': '4x + 450 = 3000 demande un regroupement et une équation décimale à deux opérations : 3AM muadalat-darajat-ula (hors périmètre 2AM)'},
    'integration': {'lesson': S, 'module': 1}, 'evaluation': {'lesson': S, 'module': 2},
    'ict': {'lesson': S, 'module': 6, 'items': {'activity': {'lesson': S, 'module': 6}, 'nowYourTurn': {'lesson': T, 'module': 4}}},
}

# ibara-harfiya-intaj (2026-10-29) : pp. 51–53, 55, 56, 59, 60 du PDF relues à 110 dpi — tous ses éléments sont `verified: True`.
_IBARA = {'opener', 'challenge', 'objectives', 'prep', 'act-1', 'act-2', 'know-1', 'know-2', 'method-1', 'method-2', 'now-59',
          *(f'ex-{n}' for n in range(1, 27)), *(f'self-{n}' for n in (1, 2, 3, 4, 5, 6, 7, 10)), 'deep-44', 'deep-45', 'deep-46', 'deep-47', 'deep-48', 'deep-51', 'deep-52'}
_UNSURE = {'ex-10', 'ex-11', 'ex-12', 'ex-16'}  # énoncé ou figure illisibles : jamais citées comme textuelles
for _e in E:
    _e['verified'] = _e['id'] in _IBARA and _e['id'] not in _UNSURE

doc = {
    '_comment': [
        'EXTRACTION CANONIQUE du manuel scolaire officiel — 2AM, الجيل الثاني (منشورات الشهاب 2017), unité 4 « مفهوم معادلة ».',
        'Source : docs/official-book-pdfs/كتاب الرياضيات للسنة الثانية متوسط الجيل الثاني.pdf, pages 54 à 69 du livre (PDF 51 à 66).',
        'Ce fichier est LA source de vérité pédagogique de l’unité ; tout contenu cite un `id` d’ici via `source.elementId`.',
        'Transcription VISUELLE d’un scan médiocre ; réponses calculées (Fraction, Decimal, entiers) dans build-extraction.py, `answerSource: computed`.',
        'Généré par docs/sources/2am/unit4/build-extraction.py — ne pas éditer à la main.',
    ],
    'unitCode': 'mafhum-muadala',
    'textbook': {'title': 'كتاب الرياضيات — السنة الثانية من التعليم المتوسط', 'generation': 'الجيل الثاني', 'unitNumber': 4,
                 'unitTitle': 'مفهوم معادلة', 'pages': {'first': 54, 'last': 69}, 'pdfPageOffset': 3,
                 'sections': ['سأتعلّم في هذا الباب', 'تحدّي', 'أستعدّ', 'أنشطة', 'معارف', 'طرائق', 'دوري الآن', 'أوظّف تعلّماتي', 'أؤكّد تعلّماتي', 'أتعمّق', 'أدمج تعلّماتي', 'وضعية للتقويم', 'أوظّف تكنولوجيات الإعلام والاتصال']},
    'frozenAt': '2026-10-29',
    'terminology': {'note': 'Le manuel écrit « عبارة حرفية », « تبسيط حساب حرفي », « من أجل x = … », « اختبار صحة مساواة / متباينة », « معادلة », « حلّ معادلة », « حلول معادلة ».',
                    'terms': ['عبارة حرفية', 'مجهول', 'متغيّر', 'تبسيط', 'قيمة عبارة', 'مساواة', 'متباينة', 'معادلة', 'حلّ', 'تعويض']},
    'elements': E,
    'discrepancies': DISCREPANCIES,
    'destinations': DEST,
}

# hall-mushkil-muadala (2026-10-29) : pages 57, 58, 60 et 64 du livre (PDF 54, 57, 58, 61) relues à 90 dpi par la leçon ; les éléments qu'elle destine à son contenu sont vérifiés
# (la marge droite de ex-34 … ex-40 et le bas de know-5 restent coupés : l'idée est prise, jamais le mot à mot).
HALL_READ = {'act-4', 'know-5', 'method-4', 'method-5', 'ex-34', 'ex-35', 'ex-36', 'ex-37', 'ex-38', 'ex-39', 'ex-40'}
for _e in E:
    if _e['id'] in HALL_READ:
        _e['verified'] = True

# ikhtibar-musawat-mutabayina (2026-10-30) : pages 57, 58, 61, 64 et 66 du livre (PDF 54, 57, 58, 61, 66 relues à 100 dpi) — les éléments qu'elle destine à son contenu sont vérifiés (act-3 q4 : la liste « … ، 5 ، 6 ، 7 » reste coupée à gauche).
IKHTIBAR_READ = {'act-3', 'know-3', 'know-4', 'method-3', 'now-61', 'ex-27', 'ex-28', 'ex-29', 'ex-30', 'ex-31', 'ex-32', 'ex-33', 'ict'}
for _e in E:
    if _e['id'] in IKHTIBAR_READ:
        _e['verified'] = True

# wadiya-idmajiya-mafhum-muadala (2026-10-30) : pages 67, 68 et 69 du livre (PDF 64, 65, 66 relues à 90 dpi) — integration, evaluation, ict et deep-58 vérifiés (la synthèse n'en cite aucun mot).
SYNTH_READ = {'integration', 'evaluation', 'ict', 'deep-58'}
for _e in E:
    if _e['id'] in SYNTH_READ:
        _e['verified'] = True

ids = [e['id'] for e in E]
assert len(ids) == len(set(ids)), 'id en double'
missing = [i for i in ids if i not in DEST]
assert not missing, f'éléments sans destination : {missing}'
extra = [k for k in DEST if k != '_comment' and k not in ids]
assert not extra, f'destinations sans élément : {extra}'

out = Path(__file__).with_name('extraction.json')
out.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
mine = sum(1 for k, v in DEST.items() if k != '_comment' and v['lesson'] in ('unit', I))
print(f'{out} — {len(E)} éléments ({mine} pour {I} ou l’unité, {len(E) - mine} pour les autres leçons)')
