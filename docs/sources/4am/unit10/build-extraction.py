#!/usr/bin/env python3
"""Génère docs/sources/4am/unit10/extraction.json — unité 10 « حساب المثلثات في المثلث القائم » (pp. 115–125).

Transcription VISUELLE du scan (« وحدة المثلثات في المثلث القائم.pdf », 11 pages CamScanner, sans couche texte),
pages rendues à 110 dpi, relues à 300 dpi (ouverture, tableau du تمرين 18, figures des تمارين 25, 29, 31, 32,
وضعية) et à 600 dpi (la distance de la وضعية, la base du palmier du تمرين 29).
La page 124 n'est pas numérotée sur le scan (أؤكّد تعلّماتي + أدمج تعلّماتي) ; l'unité est COMPLÈTE :
ouverture, تحدّ, أستعدّ (6 items), 5 أنشطة, معارف (4 blocs), طرائق (5 méthodes, 2 « دوري الآن »),
أوظّف تعلّماتي (1–23), أؤكّد تعلّماتي (QCM 1–6), أدمج تعلّماتي (وضعية) et أتعمّق (24–32).

Le texte arabe est celui du manuel, au mot près (les passages flous de l'ouverture sont lus au mieux et
marqués `verified: false`) ; les réponses ne viennent PAS du manuel quand il n'en donne pas : elles sont
CALCULÉES ici (`answerSource: computed`) — exactes en fractions/surds quand c'est possible, sinon par la
même trigonométrie que la calculatrice, et chaque nombre imprimé par le manuel est re-vérifié (assert).
Les figures sont DÉCRITES (`figure`) : la plateforme les redessine (GeoFigure), jamais d'image du manuel.

Usage : python3 docs/sources/4am/unit10/build-extraction.py
"""
import json
import math
from fractions import Fraction as F
from pathlib import Path


def D(s):
    return F(str(s).replace(',', '.'))


def r(x, digits=0):
    """L'arrondi du manuel, écrit avec la virgule LaTeX."""
    y = round(x * 10 ** digits + 1e-9) / 10 ** digits
    s = f'{y:.{digits}f}'
    return s.replace('.', '{,}')


sin = lambda d: math.sin(math.radians(d))
cos = lambda d: math.cos(math.radians(d))
tan = lambda d: math.tan(math.radians(d))
asin = lambda v: math.degrees(math.asin(v))
acos = lambda v: math.degrees(math.acos(v))
atan = lambda v: math.degrees(math.atan(v))


def right(a, b, c):
    a, b, c = sorted([D(a), D(b), D(c)])
    return a * a + b * b == c * c


E = []
DISC = []

# ── Ouverture ────────────────────────────────────────────────────────────────
E.append({
    'id': 'objectives', 'kind': 'objectives', 'page': 115, 'section': 'سأتعلّم في هذا الباب', 'verified': False,
    'items': [
        'تعريف جيب وظل زاوية حادة في مثلث قائم.',
        'استعمال حاسبة لتعيين قيمة مقربة (أو القيمة المضبوطة) لكل من جيب زاوية حادة وظلها أو لتعيين قيس زاوية بمعرفة الجيب أو الظل.',
        'حساب زوايا أو أطوال بتوظيف الجيب أو الجيب تمام أو الظل.',
        'إنشاء زاوية هندسيا (بالمسطرة غير المدرجة والمدور) بمعرفة القيمة المضبوطة لإحدى نسبها المثلثية.',
        'معرفة واستعمال العلاقتين: $\\cos^2 x + \\sin^2 x = 1$ و $\\tan x = \\dfrac{\\sin x}{\\cos x}$',
    ],
    'note': 'Encadré jaune peu contrasté sur le scan : lu à 300 dpi, mots sûrs, ponctuation reconstituée.',
})
E.append({
    'id': 'intro-tusi', 'kind': 'aside', 'page': 115, 'section': 'مدخل الباب', 'title': 'نصير الدين الطوسي', 'verified': False,
    'text': 'يُعتبر «نصير الدين الطوسي» و«أبو الوفاء» المؤسسين الحقيقيين لميدان حساب المثلثات، حيث سمحت نتائج بحوثهما بجعل هذا الميدان مادة تعليمية رياضياتية مستقلة. في أواخر القرون الوسطى، توصل هذان العالمان بصفة نهائية إلى إعطاء التسميات جيب «Sinus»، جيب التمام «Cosinus» والظل «Tangente» على المفاهيم المكتشفة. إن مفهوم الظل «Tangente» أدرج في الرياضيات من طرف الرياضياتي العربي حبش الحسيب. إن هذا المفهوم يترجم بكيفية مباشرة بأن المستقيم الذي يسمح بقراءة ظل زاوية يكون مماسا لدائرة. إن أهمية جداول قيم ظل زاوية متعلقة بارتفاعات كائنات ومعالم.',
    'caption': 'صورة: نصير الدين الطوسي (صورة في الكتاب — لا تُنسخ).',
    'note': 'Les mots latins Sinus / Cosinus / Tangente sont ceux du manuel ; une leçon les cite entre guillemets, jamais comme texte d’interface.',
})
CH_H, CH_A = D('1.6'), 59
CH_L = float(CH_H) / sin(CH_A)
assert r(CH_L, 1) == '1{,}9'
E.append({
    'id': 'challenge', 'kind': 'challenge', 'page': 115, 'section': 'تحدّ', 'verified': True,
    'text': 'اعتمادا على الشكل، احسب قيمة مقربة إلى الجزء من 10 لطول السلّم.',
    'figure': 'سلّم مستند إلى جدار شاقولي: رأس السلّم على الجدار على ارتفاع 1,60m من الأرض، والسلّم يصنع مع الأرض الأفقية زاوية قيسها 59°. الجدار عمودي على الأرض (مثلث قائم: الارتفاع ضلع مقابل للزاوية 59°، السلّم هو الوتر).',
    'answer': {'ratio': 'sin', 'equation': '\\sin 59^{\\circ} = \\dfrac{1{,}6}{L}', 'L': 'L = \\dfrac{1{,}6}{\\sin 59^{\\circ}}', 'Lexact': '1{,}8666…', 'L10': r(CH_L, 1), 'unit': 'm'},
    'answerSource': 'computed',
})

# ── أستعدّ ───────────────────────────────────────────────────────────────────
assert r(1.267103, 0) == '1' and r(1.267103, 1) == '1{,}3'
E.append({
    'id': 'prep', 'kind': 'prep', 'page': 115, 'section': 'أستعدّ', 'verified': True,
    'instruction': 'أصحيح أم خاطئ؟ برّر إجابتك.',
    'items': [
        {'number': 1, 'text': 'مجموع أقياس زوايا مثلث يساوي 180°.', 'answer': True},
        {'number': 2, 'text': 'مدوّر العدد 1,267103 إلى الوحدة هو 1.', 'answer': True},
        {'number': 3, 'text': 'مدوّر العدد 1,267103 إلى الجزء من 10 هو 1,2.', 'answer': False,
         'justification': 'رقم الأجزاء من مائة هو 6 ≥ 5، فالمدوّر إلى الجزء من 10 هو 1,3 (1,2 هو المقرَّب بالنقصان).'},
        {'number': 4, 'text': 'في المثلث ABC القائم في A:',
         'figure': 'ABC قائم في A: A أسفل اليسار، B فوقها، C على اليمين؛ الوتر [BC].',
         'statements': [
             {'text': 'الوتر هو [BC].', 'answer': True},
             {'text': 'الضلع المقابل للزاوية $\\widehat{C}$ هو [BC].', 'answer': False, 'justification': 'المقابل للزاوية C هو [AB]؛ [BC] هو الوتر.'},
             {'text': 'الضلع المجاور للزاوية $\\widehat{C}$ هو [AB].', 'answer': False, 'justification': 'المجاور للزاوية C هو [AC].'},
         ]},
        {'number': 5, 'text': 'في مثلث قائم جيب تمام زاوية حادة يساوي:', 'wordFraction': {'num': 'طول الضلع المقابل', 'den': 'طول الوتر'}, 'answer': False,
         'justification': 'جيب التمام = طول الضلع المجاور ÷ طول الوتر (المقابل ÷ الوتر هو الجيب).'},
        {'number': 6, 'text': 'اعتمادا على الشكل:',
         'figure': 'ABC قائم في C، $\\widehat{ABC} = 59°$ ؛ الوتر [AB].',
         'statements': [
             {'text': '$\\widehat{BAC} = 31°$', 'answer': True, 'justification': '180° - 90° - 59° = 31°'},
             {'text': '$\\cos\\widehat{ABC} = \\dfrac{AC}{AB}$', 'answer': False, 'justification': 'المجاور للزاوية B هو [BC]: $\\cos\\widehat{ABC} = \\dfrac{BC}{AB}$ ؛ $\\dfrac{AC}{AB}$ هو $\\sin\\widehat{ABC}$.'},
         ]},
    ],
})

# ── أنشطة ────────────────────────────────────────────────────────────────────
assert r(cos(25), 2) == '0{,}91' and r(cos(75), 2) == '0{,}26'
E.append({
    'id': 'act-1', 'kind': 'activity', 'number': 1, 'page': 116, 'section': 'أنشطة', 'title': 'جيب تمام زاوية حادة في مثلث قائم', 'verified': True,
    'parts': [
        {'label': '1)', 'text': 'إليك الشكل المقابل. لاحظ أن المثلث ABC قائم في A. ما هو وتره؟ عيّن قيس الزاوية $\\widehat{B}$ (بالدرجات). ما هو الضلع المجاور للزاوية $\\widehat{C}$؟ ما هو الضلع المقابل لها؟',
         'figure': 'ABC قائم في A، A أسفل اليمين، B فوقها، C بعيدة على اليسار؛ $\\widehat{C} = 25°$.'},
        {'label': '2)', 'text': 'النسبة $\\dfrac{AC}{BC}$ تسمى جيب تمام الزاوية $\\widehat{C}$ ويرمز إليها $\\cos\\widehat{C}$. انقل وأتمم: $\\cos 25° = \\dfrac{\\ldots}{\\ldots}$. ما هي القيمة المضبوطة للعدد $\\cos\\widehat{B}$؟ باستعمال حاسبة، عيّن المدوّر إلى الجزء من 100 للعددين $\\cos 75°$ و $\\cos 25°$.'},
    ],
    'answer': {'hypotenuse': '[BC]', 'B': '65°', 'adjacentC': '[AC]', 'oppositeC': '[AB]', 'cos25': '\\dfrac{AC}{BC}', 'cosB': '\\dfrac{AB}{BC}',
               'cos25_100': r(cos(25), 2), 'cos75_100': r(cos(75), 2)},
    'answerSource': 'computed',
    'note': 'Le manuel demande cos 75° alors que $\\widehat{B} = 65°$ : simple usage de la calculatrice, pas une coquille ($\\cos 65° \\approx 0{,}42$).',
})
assert r(sin(40), 2) == '0{,}64' and r(tan(40), 2) == '0{,}84'
E.append({
    'id': 'act-2', 'kind': 'activity', 'number': 2, 'page': 116, 'section': 'أنشطة', 'title': 'جيب زاوية حادة وظلها في مثلث قائم', 'verified': True,
    'parts': [
        {'label': '1)', 'text': 'أ) ارسم مثلثا ABC قائما في A حيث $\\widehat{ABC} = 40°$. ب) أنجز على الشكل القياسات اللازمة لحساب كل من $\\dfrac{AC}{BC}$ و $\\dfrac{AC}{AB}$. جـ) قارن ما وجدته مع زملائك. د) ماذا تلاحظ؟ ضع تخمينا اعتمادا على ملاحظتك.'},
        {'label': '2) من التخمين إلى البرهان', 'text': 'لاحظ الشكل المقابل. 1) برّر صحة المساواتين: $\\dfrac{BC}{BC\'} = \\dfrac{AC}{A\'C\'}$ و $BC\' \\times AC = BC \\times A\'C\'$ واستنتج أن $\\dfrac{AC}{BC} = \\dfrac{A\'C\'}{BC\'}$. 2) برّر المساواة $\\dfrac{BA}{BA\'} = \\dfrac{AC}{A\'C\'}$ ثم أثبت أن $\\dfrac{AC}{AB} = \\dfrac{A\'C\'}{A\'B}$. هل النسبتان $\\dfrac{AC}{BC}$ و $\\dfrac{AC}{AB}$ تتعلقان بموقع النقطة A على نصف المستقيم [Bx)؟ النسبة $\\dfrac{AC}{BC}$ تسمى جيب الزاوية $\\widehat{B}$ ويرمز إليها $\\sin\\widehat{B}$. النسبة $\\dfrac{AC}{AB}$ تسمى ظل الزاوية $\\widehat{B}$ ويرمز إليها $\\tan\\widehat{B}$.',
         'figure': 'نصفا مستقيمين [Bx) و [By) من B؛ A و A′ على [Bx)، C و C′ على [By)؛ (AC) و (A′C′) عموديان على [Bx) في A و A′ (فهما متوازيان: وضعية طالس).'},
    ],
    'answer': {'conjecture': 'النسبتان لا تتعلقان بطول الأضلاع بل بقيس الزاوية فقط: $\\dfrac{AC}{BC} \\approx ' + r(sin(40), 2) + '$ و $\\dfrac{AC}{AB} \\approx ' + r(tan(40), 2) + '$ لكل التلاميذ.',
               'proof': '(AC)//(A′C′) (عموديان على نفس المستقيم) فالمثلثان BAC و BA′C′ في وضعية طالس: $\\dfrac{BA}{BA\'} = \\dfrac{BC}{BC\'} = \\dfrac{AC}{A\'C\'}$ ؛ الجداء التصالبي يعطي النسبتين.',
               'depends': 'لا'},
    'answerSource': 'computed',
})
E.append({
    'id': 'act-3', 'kind': 'activity', 'number': 3, 'page': 116, 'section': 'أنشطة', 'title': 'في مثلث قائم', 'verified': True,
    'parts': [
        {'label': '1)', 'text': 'ABC مثلث قائم في A، $\\widehat{B}$ زاوية حادة. انقل ما يلي وأتمم باستعمال العبارات: الضلع المقابل، الضلع المجاور، الوتر. $\\sin\\widehat{B} = \\dfrac{\\ldots}{\\ldots}$ ، $\\tan\\widehat{B} = \\dfrac{\\ldots}{\\ldots}$',
         'figure': 'ABC قائم في A (A أسفل اليسار، B أسفل اليمين، C فوق A) ؛ الوتر [BC]، [AC] الضلع المقابل للزاوية B، [AB] الضلع المجاور للزاوية B.'},
        {'label': '2)', 'text': 'من أجل كل زاوية حادة $\\widehat{B}$، اشرح لماذا: $0 < \\sin\\widehat{B} < 1$ و $0 < \\cos\\widehat{B} < 1$'},
    ],
    'answer': {'sin': {'num': 'الضلع المقابل', 'den': 'الوتر'}, 'tan': {'num': 'الضلع المقابل', 'den': 'الضلع المجاور'},
               'bounds': 'الأطوال موجبة تماما، والوتر أطول من كل ضلع من ضلعي الزاوية القائمة (فيثاغورس: $BC^2 = AB^2 + AC^2 > AC^2$)، فالبسط أصغر من المقام.'},
    'answerSource': 'computed',
})
ACT4 = [10, 20, 30, 40, 45, 60, 75]
E.append({
    'id': 'act-4', 'kind': 'activity', 'number': 4, 'page': 117, 'section': 'أنشطة', 'title': 'استعمال حاسبة في حساب نسب مثلثية', 'verified': True,
    'parts': [
        {'label': '1)', 'text': 'انقل وأتمم الجدول الآتي (المدوّر إلى الجزء من 100): الزاوية 10° ، 20° ، 30° ، 40° ، 45° ، 60° ، 75° — جيب تمام الزاوية ، جيب الزاوية ، ظل الزاوية.'},
        {'label': '2)', 'text': 'استعمل حاسبة لإيجاد مدوّر x في كل حالة مما يلي (المدوّر إلى $\\dfrac{1}{100}$ ، إلى $\\dfrac{1}{10}$ ، المدوّر x إلى الوحدة): $\\sin x = 0{,}52$ ، $\\cos x = 0{,}25$ ، $\\tan x = 1{,}33$'},
    ],
    'answer': {
        'table': {str(a): {'cos': r(cos(a), 2), 'sin': r(sin(a), 2), 'tan': r(tan(a), 2)} for a in ACT4},
        'inverse': {k: [r(f(v), 2), r(f(v), 1), r(f(v), 0)] for k, f, v in [('sin', asin, 0.52), ('cos', acos, 0.25), ('tan', atan, 1.33)]},
    },
    'answerSource': 'computed',
})
assert E[-1]['answer']['inverse'] == {'sin': ['31{,}33', '31{,}3', '31'], 'cos': ['75{,}52', '75{,}5', '76'], 'tan': ['53{,}06', '53{,}1', '53']}
E.append({
    'id': 'act-5', 'kind': 'activity', 'number': 5, 'page': 117, 'section': 'أنشطة', 'title': 'العلاقات المثلثية', 'verified': True,
    'parts': [
        {'label': '1)', 'text': 'أ) باستعمال الجدول الوارد في النشاط السابق، انقل ثمّ أتمم: $\\dfrac{\\sin 30°}{\\cos 30°} = \\ldots$ و $(\\cos 30°)^2 + (\\sin 30°)^2 = \\ldots$ ؛ $\\dfrac{\\sin 45°}{\\cos 45°} = \\ldots$ و $(\\cos 45°)^2 + (\\sin 45°)^2 = \\ldots$ ؛ $\\dfrac{\\sin 60°}{\\cos 60°} = \\ldots$ و $(\\cos 60°)^2 + (\\sin 60°)^2 = \\ldots$ ب) ضع تخمينا حول النتائج السابقة.'},
        {'label': '2)', 'text': 'ABC مثلث قائم في A، ليكن x قيسا للزاوية $\\widehat{B}$. أ) عبّر عن $\\cos x$ ، $\\sin x$ ، $\\tan x$ بدلالة أطوال أضلاع المثلث ABC. ب) اكتب المساواة التي تعبّر عن خاصيّة فيثاغورس في هذا المثلث. جـ) أثبت أنّ $(\\cos x)^2 + (\\sin x)^2 = 1$ . د) أثبت أنّ $\\tan x = \\dfrac{\\sin x}{\\cos x}$'},
    ],
    'answer': {'1': {str(a): {'quotient': r(tan(a), 2), 'sumSquares': '1'} for a in (30, 45, 60)},
               'note': 'Avec les valeurs ARRONDIES du tableau, le quotient et la somme des carrés ne tombent pas toujours exactement (0,87² + 0,5² = 1,0069) : la conjecture porte sur la valeur exacte 1 — c’est la raison de la preuve 2).',
               '2': {'cos': '\\dfrac{AB}{BC}', 'sin': '\\dfrac{AC}{BC}', 'tan': '\\dfrac{AC}{AB}', 'pythagoras': 'BC^2 = AB^2 + AC^2'}},
    'answerSource': 'computed',
})

# ── معارف ────────────────────────────────────────────────────────────────────
assert 2 * 2 + 3 * 3 == 13 and r(3 / math.sqrt(13), 2) == '0{,}83'
E.append({
    'id': 'know-1', 'kind': 'knowledge', 'number': 1, 'page': 118, 'section': 'معارف', 'title': 'جيب زاوية حادة', 'verified': True,
    'definition': 'في مثلث قائم، جيب زاوية حادة يساوي حاصل القسمة:', 'wordFraction': {'num': 'طول الضلع المقابل لهذه الزاوية', 'den': 'طول الوتر'},
    'example': 'ABC مثلث قائم في A، جيب الزاوية $\\widehat{B}$ يساوي النسبة $\\dfrac{AC}{BC}$ . يُرمز لهذه النسبة بالرمز $\\sin\\widehat{B}$ ونكتب $\\sin\\widehat{B} = \\dfrac{AC}{BC}$ .',
    'reminder': 'تذكير: جيب تمام الزاوية $\\widehat{B}$ يساوي النسبة $\\dfrac{AB}{BC}$ يُرمز لهذه النسبة بالرمز $\\cos\\widehat{B}$ ويقرأ جيب تمام الزاوية $\\widehat{B}$ . نكتب $\\cos\\widehat{B} = \\dfrac{AB}{BC}$ .',
    'remark': 'ملاحظة: الوتر هو أكبر ضلع في المثلث القائم. بالتالي $\\sin\\widehat{B}$ و $\\cos\\widehat{B}$ هما عددان محصوران بين 0 و 1',
    'example2': 'مثال: في الشكل المقابل: لدينا $\\sin\\widehat{E} = \\dfrac{3}{\\sqrt{13}}$ ، $\\cos\\widehat{E} = \\dfrac{2}{\\sqrt{13}}$ ، $\\sin\\widehat{F} = \\dfrac{2}{\\sqrt{13}}$ ، $\\cos\\widehat{F} = \\dfrac{3}{\\sqrt{13}}$ . $\\dfrac{3}{\\sqrt{13}}$ هي القيمة المضبوطة للعدد $\\sin\\widehat{E}$ . باستعمال حاسبة، نجد أن 0,83 هي قيمة مقربة إلى $\\dfrac{1}{100}$ للعدد $\\sin\\widehat{E}$ .',
    'figures': 'ABC قائم في A (وتر المثلث ABC، الضلع المقابل للزاوية B هو [AC]، الضلع المجاور هو [AB]) ؛ EFG قائم في G: FG = 3، GE = 2، EF = √13.',
})
E.append({
    'id': 'know-2', 'kind': 'knowledge', 'number': 2, 'page': 118, 'section': 'معارف', 'title': 'ظل زاوية حادة', 'verified': True,
    'definition': 'في مثلث قائم، ظل زاوية حادة يساوي حاصل القسمة:', 'wordFraction': {'num': 'طول الضلع المقابل لهذه الزاوية', 'den': 'طول الضلع المجاور لهذه الزاوية'},
    'example': 'مثال: ABC مثلث قائم في A، ظل الزاوية $\\widehat{B}$ يساوي النسبة $\\dfrac{AC}{AB}$ . يرمز لهذه النسبة بالرمز $\\tan\\widehat{B}$ ونكتب $\\tan\\widehat{B} = \\dfrac{AC}{AB}$ .',
    'remark': 'ملاحظة: ظل زاوية حادة في مثلث قائم هو عدد موجب.',
    'example2': 'مثال: EFG مثلث قائم في F. لدينا $\\tan\\widehat{E} = \\tan 30° = \\dfrac{\\sqrt{3}}{3}$ .',
    'remarks': ['$\\dfrac{\\sqrt{3}}{3}$ هي القيمة المضبوطة للعدد $\\tan 30°$ .', '0,58 هي قيمة عشرية مقرّبة للعدد $\\tan 30°$ .', '1,73 هي قيمة مقربة إلى الجزء من 100 للعدد $\\tan 60°$ .'],
    'figures': 'ABC قائم في A (الضلع المقابل للزاوية B هو [AC]، المجاور [AB]) ؛ EFG قائم في F: FG = 3، EG = 6، EF = $3\\sqrt{3}$ ، $\\widehat{E} = 30°$ ، $\\widehat{G} = 60°$ .',
    'correction': {'decidedBy': 'platform', 'decidedOn': '2026-10-04', 'printed': '\\tan\\widehat{B} = \\dfrac{AC}{BC}', 'corrected': '\\tan\\widehat{B} = \\dfrac{AC}{AB}',
                   'note': 'السطر السابق يقول إن الظل هو النسبة $\\dfrac{AC}{AB}$ ؛ $\\dfrac{AC}{BC}$ هو الجيب.'},
})
assert abs(tan(30) - math.sqrt(3) / 3) < 1e-12 and r(tan(30), 2) == '0{,}58' and r(tan(60), 2) == '1{,}73'
DISC.append({'elementId': 'know-2', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
             'text': 'Exemple : « tan B = AC/BC » — la ligne précédente définit tan B = AC/AB ; AC/BC est sin B.'})
assert r(sin(54), 2) == '0{,}81' and r(cos(54), 2) == '0{,}59' and r(tan(54), 2) == '1{,}38'
assert f'{sin(54):.10f}'[:11] == '0.809016994' and r(asin(0.4), 0) == '24' and r(atan(0.3), 0) == '17'
assert f'{asin(0.4):.8f}' == '23.57817848' and f'{atan(0.3):.8f}' == '16.69924423'
E.append({
    'id': 'know-3', 'kind': 'knowledge', 'number': 3, 'page': 120, 'section': 'معارف', 'title': 'استعمال حاسبة في حساب نسب مثلثية', 'verified': True,
    'intro': 'قبل استعمال الحاسبة، يجب برمجتها بالوحدة الدرجة (d°).',
    'example1': {'text': 'مثال 1: حساب المدوّر إلى $\\dfrac{1}{100}$ لكل من النسب $\\sin 54°$ ، $\\cos 54°$ ، $\\tan 54°$ .',
                 'steps': [{'keys': ['ON', 'sin', '54', '='], 'screen': '0,8090169944', 'rounded': '0,81'},
                           {'keys': ['ON', 'cos', '54', '='], 'screen': '0,5877852523', 'rounded': '0,59'},
                           {'keys': ['ON', 'tan', '54', '='], 'screen': '1,37638192', 'rounded': '1,38'}]},
    'example2': {'text': 'مثال 2: حساب قيس كل من الزاويتين $\\widehat{A}$ و $\\widehat{B}$ بالتدوير إلى الوحدة علما أن $\\sin\\widehat{A} = 0{,}4$ و $\\tan\\widehat{B} = 0{,}3$ .',
                 'steps': [{'keys': ['ON', '2nd', 'sin⁻¹', '0,4', '='], 'screen': '23,57817848', 'rounded': '24'},
                           {'keys': ['ON', '2nd', 'tan⁻¹', '0,3', '='], 'screen': '16,69924453', 'rounded': '17'}]},
    'note': 'Le manuel dit « (من اليسار إلى اليمين) » : l’ordre des touches se lit de gauche à droite. Écran imprimé « 16,69924453 » (valeur exacte 16,69924423…) : écart au 8e chiffre, sans effet sur l’arrondi 17° ; la leçon corrige d’une ligne (l’élève du lab lit …423).',
})
assert abs(cos(60) - 0.5) < 1e-12
E.append({
    'id': 'know-4', 'kind': 'knowledge', 'number': 4, 'page': 120, 'section': 'معارف', 'title': 'العلاقات المثلثية', 'verified': True,
    'property': 'من أجل كل x زاوية حادّة في مثلث قائم فإنّ: 1) $\\tan x = \\dfrac{\\sin x}{\\cos x}$ 2) $\\cos^2 x + \\sin^2 x = 1$',
    'remark': 'ملاحظة: الكتابة $\\sin^2 x + \\cos^2 x = 1$ تعني $(\\sin x)^2 + (\\cos x)^2 = 1$',
    'example': 'مثال: $\\cos 60° = \\dfrac{1}{2}$ و $\\sin 60° = \\dfrac{\\sqrt{3}}{2}$ ، $\\tan 60° = \\dfrac{\\frac{\\sqrt{3}}{2}}{\\frac{1}{2}} = \\sqrt{3}$ ، $(\\cos 60°)^2 + (\\sin 60°)^2 = \\left(\\dfrac{1}{2}\\right)^2 + \\left(\\dfrac{\\sqrt{3}}{2}\\right)^2 = \\dfrac{1}{4} + \\dfrac{3}{4} = 1$',
    'figure': 'مثلث قائم: الوتر 2، الضلع المجاور للزاوية 60° طوله 1، الضلع المقابل $\\sqrt{3}$ .',
    'correction': {'decidedBy': 'platform', 'decidedOn': '2026-10-04', 'printed': '\\sin^2 x + \\sin^2 x = 1', 'corrected': '\\cos^2 x + \\sin^2 x = 1',
                   'note': 'الملاحظة تحت الإطار والمثال يكتبان $\\cos^2 x + \\sin^2 x = 1$ ؛ $2\\sin^2 x = 1$ صحيحة لـ 45° فقط.'},
})
DISC.append({'elementId': 'know-4', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
             'text': 'Encadré : « sin²x + sin²x = 1 » — lire cos²x + sin²x = 1 (la remarque et l’exemple 60° du même bloc).'})

# ── طرائق ────────────────────────────────────────────────────────────────────
BC = 2.5 / sin(25); RS = 3.5 * cos(37); FG = 4.5 * tan(53)
assert f'{BC:.9f}'.startswith('5.915503958') and r(BC, 2) == '5{,}92'
assert f'{RS:.9f}'.startswith('2.795224285') and r(RS, 1) == '2{,}8'
assert f'{FG:.9f}'.startswith('5.971701') and r(FG, 2) == '5{,}97'
E.append({
    'id': 'method-sin', 'kind': 'method', 'page': 119, 'section': 'طرائق', 'title': 'حساب طول ضلع مثلث قائم باستعمال الجيب', 'verified': True,
    'exercise': 'ABC مثلث قائم في A حيث AC = 2,5cm و $\\widehat{B} = 25°$ . احسب BC. أعط المدوّر إلى الجزء من 100 للطول BC.',
    'solution': ['في المثلث ABC القائم في A، الضلع [BC] هو وتره و [AC] هو الضلع المقابل للزاوية $\\widehat{B}$ . إذن $\\sin\\widehat{B} = \\dfrac{AC}{BC}$',
                 'إذن $\\sin 25° = \\dfrac{2{,}5}{BC}$ بالتالي $BC = \\dfrac{2{,}5}{\\sin 25°}$',
                 'لحساب المدوّر إلى الجزء من 100 للطول BC، نستعمل حاسبة. نبرمج هذه الآلة إلى وحدة الدرجة ثم ننفذ البرنامج الآتي: (من اليسار إلى اليمين) ON 2,5 ÷ sin 25 يظهر على الشاشة 5,915503958',
                 'المدوّر إلى الجزء من 100 للطول BC هو 5,92. نكتب BC ≈ 5,92cm.'],
    'rule': 'لحساب طول ضلع في مثلث قائم يمكن استعمال النسبة المثلثية sin.',
    'figure': 'ABC قائم في A: B فوق A، C على اليمين؛ AC = 2,5cm، $\\widehat{B} = 25°$ .',
    'answer': {'BC': r(BC, 2), 'screen': '5,915503958'},
})
E.append({
    'id': 'method-cos', 'kind': 'method', 'page': 119, 'section': 'طرائق', 'title': 'حساب طول ضلع مثلث قائم باستعمال جيب تمام', 'verified': True,
    'exercise': 'RST مثلث قائم في S حيث RT = 3,5cm و $\\widehat{R} = 37°$ . احسب RS. أعط المدوّر إلى الجزء من 10 للطول RS.',
    'solution': ['في المثلث RST القائم في S، الضلع [RT] هو وتره و [RS] هو الضلع المجاور للزاوية $\\widehat{R}$ . إذن $\\cos\\widehat{R} = \\dfrac{RS}{RT}$',
                 'إذن $\\cos 37° = \\dfrac{RS}{3{,}5}$ بالتالي $RS = 3{,}5 \\times \\cos 37°$ .',
                 'لحساب المدوّر إلى الجزء من 10 للطول RS، ننفذ البرنامج الآتي (من اليسار إلى اليمين): ON 3,5 × cos 37 يظهر على الشاشة 2,795224285',
                 'المدوّر إلى الجزء من 10 للطول RS هو 2,8. نكتب RS ≈ 2,8cm.'],
    'rule': 'لحساب طول ضلع في مثلث قائم يمكن استعمال النسبة المثلثية cos.',
    'figure': 'RST قائم في S: R على اليسار، S أعلى اليمين، T أسفل اليمين؛ RT = 3,5cm، $\\widehat{R} = 37°$ .',
    'answer': {'RS': r(RS, 1), 'screen': '2,795224285'},
})
E.append({
    'id': 'method-tan', 'kind': 'method', 'page': 119, 'section': 'طرائق', 'title': 'حساب طول ضلع مثلث قائم باستعمال الظل', 'verified': True,
    'exercise': 'EFG مثلث قائم في F حيث EF = 4,5cm و $\\widehat{E} = 53°$ . احسب FG. أعط المدوّر إلى الجزء من 100 للطول FG.',
    'solution': ['في المثلث EFG القائم في F، الضلع [EF] هو الضلع المجاور للزاوية $\\widehat{E}$ و [FG] هو الضلع المقابل لها.',
                 'إذن $\\tan\\widehat{E} = \\dfrac{FG}{EF}$ أي $\\tan 53° = \\dfrac{FG}{4{,}5}$ بالتالي $FG = 4{,}5 \\times \\tan 53°$',
                 'لحساب المدوّر إلى الجزء من 100 للطول FG، ننفذ البرنامج المقابل (من اليسار إلى اليمين): ON 4,5 × tan 53 يظهر على الشاشة 5,971701697',
                 'المدوّر إلى الجزء من 100 للطول FG هو 5,97. نكتب FG ≈ 5,97cm.'],
    'figure': 'EFG قائم في F: E على اليسار، F في الأعلى، G أسفل اليمين؛ EF = 4,5cm، $\\widehat{E} = 53°$ .',
    'answer': {'FG': r(FG, 2), 'screen': '5,971701697'},
})
LM = 6 * cos(45); PQ = 2.8 / tan(72)
E.append({
    'id': 'now-119', 'kind': 'now', 'page': 119, 'section': 'دوري الآن', 'verified': True,
    'items': [
        {'number': 1, 'text': 'KLM مثلث قائم في L ومتقايس الساقين حيث KM = 6cm. احسب LM بطريقتين. أعط المدوّر إلى الجزء من 10 للطول LM.',
         'answer': {'pythagoras': '2LM^2 = 36 \\Rightarrow LM = \\sqrt{18} = 3\\sqrt{2}', 'cos': 'LM = 6\\cos 45°', 'LM': r(LM, 1)}},
        {'number': 2, 'text': 'PQR مثلث قائم في Q حيث QR = 2,8cm و $\\widehat{P} = 72°$ . احسب PQ. أعط المدوّر إلى الجزء من 10 للطول PQ.',
         'answer': {'tan': '\\tan 72° = \\dfrac{QR}{PQ} \\Rightarrow PQ = \\dfrac{2{,}8}{\\tan 72°}', 'PQ': r(PQ, 1)}},
    ],
    'answerSource': 'computed',
})
assert r(LM, 1) == '4{,}2' and r(PQ, 1) == '0{,}9'
E.append({
    'id': 'method-relations', 'kind': 'method', 'page': 121, 'section': 'طرائق', 'title': 'استعمال العلاقات المثلثية', 'verified': True,
    'exercise': 'x هو قيس زاوية حادة حيث $\\cos x = 0{,}6$ . احسب القيمة المضبوطة للعدد $\\sin x$ . استنتج عندئذ القيمة المضبوطة للعدد $\\tan x$ . أعط المدوّر إلى الجزء من 100 للعدد $\\tan x$ .',
    'solution': ['نعلم أن $\\cos^2 x + \\sin^2 x = 1$ إذن $\\sin^2 x = 1 - \\cos^2 x$ . لكن $\\cos x = 0{,}6$ بالتالي $\\sin^2 x = 1 - 0{,}36$ أي $\\sin^2 x = (0{,}8)^2$ .',
                 'إذن $\\sin x = 0{,}8$ ($\\sin x$ عدد موجب).',
                 'لدينا $\\tan x = \\dfrac{\\sin x}{\\cos x}$ إذن $\\tan x = \\dfrac{0{,}8}{0{,}6} = \\dfrac{4}{3}$ أي $\\tan x = \\dfrac{4}{3}$ .',
                 'لدينا $\\dfrac{4}{3} \\simeq 1{,}33333\\ldots$ إذن المدوّر إلى الجزء من 100 للعدد $\\tan x$ هو 1,33.'],
    'answer': {'sin': '0{,}8', 'tan': '\\dfrac{4}{3}', 'tan100': '1{,}33'},
})
X1 = asin(0.4); X2 = atan(7 / 3)
assert r(X1, 1) == '23{,}6' and r(X2, 1) == '66{,}8'
E.append({
    'id': 'method-construct', 'kind': 'method', 'page': 121, 'section': 'طرائق', 'title': 'إنشاء هندسي لزاوية حادة علمت القيمة المضبوطة لإحدى نسبها المثلثية', 'verified': True,
    'exercises': [
        {'number': 1, 'text': 'أنشئ، بدون استعمال منقلة زاوية قيسها x حيث $\\sin x = \\dfrac{2}{5}$ . تحقق بحاسبة ثم بمنقلة.',
         'solution': ['نعتبر وحدة الطول (السنتيمتر مثلا).', 'ننشئ زاوية قائمة $\\widehat{AOB}$ رأسها O.',
                      'نعيّن على أحد ضلعيها النقطة A حيث OA = 2cm. نرسم الدائرة التي مركزها A ونصف قطرها 5cm تقطع هذه الدائرة الضلع الثاني لهذه الزاوية في النقطة B.',
                      'في المثلث AOB القائم في O، لدينا: $\\sin\\widehat{B} = \\dfrac{OA}{AB} = \\dfrac{2}{5}$ . إذن $x = \\widehat{B}$ .',
                      'عند التحقق بحاسبة نجد $\\widehat{B} \\simeq 23{,}6°$ ، وبالمنقلة نجد $\\widehat{B} = 24°$ .'],
         'figure': 'AOB قائم في O: O أسفل اليسار، A على اليمين (OA = 2cm)، B فوق O على الضلع الشاقولي؛ قوس دائرة مركزها A ونصف قطرها 5cm يقطع الضلع في B؛ AB = 5cm.'},
        {'number': 2, 'text': 'أنشئ، بدون استعمال منقلة الزاوية التي قيسها x حيث $\\tan x = \\dfrac{7}{3}$ . تحقق بحاسبة ثم بمنقلة.',
         'solution': ['نضع وحدة الطول هي 1cm.', 'ننشئ زاوية قائمة $\\widehat{MNP}$ رأسها N.',
                      'نعيّن على الضلعين النقطتين M و P حيث MN = 7cm و NP = 3cm (نستعمل مسطرة مدرّجة مدور).',
                      'في المثلث MNP القائم في N، لدينا: $\\tan\\widehat{P} = \\dfrac{NM}{NP} = \\dfrac{7}{3}$ . إذن $x = \\widehat{P}$ .',
                      'عند التحقق بحاسبة نجد $\\widehat{P} \\simeq 66{,}8°$ ، وبالمنقلة نجد $\\widehat{P} = 67°$ .'],
         'figure': 'MNP قائم في N: N أسفل اليسار، P فوقها (NP = 3cm)، M على اليمين (MN = 7cm).'},
    ],
    'answer': {'1': r(X1, 1), '2': r(X2, 1)},
})
NOW_COS = math.sqrt(0.84); NOW_TAN = 0.4 / NOW_COS; X3 = acos(0.75)
assert r(NOW_COS, 2) == '0{,}92' and r(NOW_TAN, 2) == '0{,}44' and r(X3, 0) == '41'
E.append({
    'id': 'now-121', 'kind': 'now', 'page': 121, 'section': 'دوري الآن', 'verified': True,
    'items': [
        {'number': 1, 'text': 'x هو قيس زاوية حادة حيث $\\sin x = 0{,}4$ . احسب القيمة المضبوطة للعدد $\\cos x$ . أعط المدوّر إلى الجزء من 100 للعدد $\\cos x$ . استنتج المدوّر إلى الجزء من 100 للعدد $\\tan x$ .',
         'answer': {'cos': '\\dfrac{\\sqrt{21}}{5}', 'cos100': r(NOW_COS, 2), 'tan100': r(NOW_TAN, 2)}},
        {'number': 2, 'text': 'أنشئ، بدون استعمال منقلة، الزاوية التي قيسها x حيث $\\cos x = \\dfrac{3}{4}$ . تحقق بحاسبة ثم بمنقلة.',
         'answer': {'construction': 'زاوية قائمة رأسها O، OA = 3 على ضلع، دائرة مركزها A ونصف قطرها 4 تقطع الضلع الآخر في B: $\\cos\\widehat{A} = \\dfrac{3}{4}$', 'x': r(X3, 1), 'x1': r(X3, 0)}},
    ],
    'answerSource': 'computed',
})

# ── أوظّف تعلّماتي (pp. 122–123) ─────────────────────────────────────────────
assert right('7.8', '10.4', 13) and right('10.5', 14, '17.5') and right('3.5', '3.7', '1.2') and right(3, 4, 5)


def ex(n, page, section, text, answer, figure=None, **kw):
    e = {'id': f'ex-{n}', 'kind': 'exercise', 'number': n, 'page': page, 'section': section, 'verified': True, 'text': text}
    if figure:
        e['figure'] = figure
    e['answer'] = answer
    e['answerSource'] = 'computed'
    e.update(kw)
    E.append(e)


S1 = 'النسب المثلثية - استعمال حاسبة'
ex(1, 122, S1, 'JKL مثلث حيث JK = 7,8cm ، JL = 10,4cm ، KL = 13cm. 1) برهن أن المثلث JKL قائم في J. 2) احسب $\\tan\\widehat{K}$ ، $\\tan\\widehat{L}$ .',
   {'right': '7{,}8^2 + 10{,}4^2 = 60{,}84 + 108{,}16 = 169 = 13^2', 'tanK': '\\dfrac{JL}{JK} = \\dfrac{10{,}4}{7{,}8} = \\dfrac{4}{3}', 'tanL': '\\dfrac{JK}{JL} = \\dfrac{3}{4}'})
ex(2, 122, S1, 'نفس الأسئلة بالنسبة للمثلث ABC حيث AB = 10,5cm ، AC = 14cm ، BC = 17,5cm.',
   {'right': 'قائم في A: $10{,}5^2 + 14^2 = 110{,}25 + 196 = 306{,}25 = 17{,}5^2$', 'tanB': '\\dfrac{AC}{AB} = \\dfrac{14}{10{,}5} = \\dfrac{4}{3}', 'tanC': '\\dfrac{AB}{AC} = \\dfrac{3}{4}'},
   note='« نفس الأسئلة » : l’angle droit est en A (côté le plus long BC) ; on demande tan B et tan C.')
ex(3, 122, S1, '1) أنشئ مثلثا قائما حيث قيس إحدى الزاويتين الحادتين هو 40°. اذكر الوسائل التي تستعملها لإنجاز الشكل. 2) بتدوير النتائج إلى الجزء من 100، احسب $\\sin 40°$ ، $\\cos 40°$ ، $\\tan 40°$ أ) باستعمال أقياس أطوال أضلاع المثلث. ب) باستعمال حاسبة. جـ) قارن النتائج المتحصّل عليها، ماذا تستنتج؟',
   {'tools': 'مسطرة مدرّجة، كوس (زاوية قائمة) ومنقلة', 'sin40': r(sin(40), 2), 'cos40': r(cos(40), 2), 'tan40': r(tan(40), 2),
    'conclusion': 'القيم بالقياس قريبة من قيم الحاسبة؛ الفرق يأتي من دقة القياس: النسب لا تتعلق إلا بقيس الزاوية.'})
ex(4, 122, S1, 'ABC مثلث حيث AC = 3,5dm ، AB = 3,7dm ، BC = 1,2dm. 1) أثبت أن المثلث ABC قائم. 2) احسب كلا من $\\cos\\widehat{A}$ ، $\\sin\\widehat{A}$ ، $\\tan\\widehat{A}$ .',
   {'right': 'قائم في C: $3{,}5^2 + 1{,}2^2 = 12{,}25 + 1{,}44 = 13{,}69 = 3{,}7^2$', 'cosA': '\\dfrac{AC}{AB} = \\dfrac{35}{37}', 'sinA': '\\dfrac{BC}{AB} = \\dfrac{12}{37}', 'tanA': '\\dfrac{BC}{AC} = \\dfrac{12}{35}'})
KC = math.sqrt(485)
ex(5, 122, S1, 'المثلث KBC الآتي قائم في B حيث KB = 14cm و BC = 17cm. 1) احسب $\\tan\\widehat{CKB}$ . 2) احسب $\\sin\\widehat{CKB}$ ، $\\cos\\widehat{CKB}$ . تعطى القيمة المضبوطة ثم المدوّر إلى الجزء من 100.',
   {'tan': '\\dfrac{BC}{KB} = \\dfrac{17}{14}', 'KC': '\\sqrt{14^2 + 17^2} = \\sqrt{485}', 'sin': '\\dfrac{17}{\\sqrt{485}} \\approx ' + r(17 / KC, 2), 'cos': '\\dfrac{14}{\\sqrt{485}} \\approx ' + r(14 / KC, 2), 'tan100': r(17 / 14, 2)},
   figure='KBC قائم في B: B في الأعلى، K على اليسار، C أسفل اليمين؛ KB = 14cm، BC = 17cm، الوتر [KC].')
SK = 10 * cos(55)
ex(6, 122, S1, 'JSK مثلث قائم في S حيث JK = 10cm (الشكل). 1) عيّن القيمة المضبوطة للطول SK. 2) احسب المدوّر إلى الجزء من 100 للطول SK.',
   {'SK': 'SK = 10\\cos 55°', 'SK100': r(SK, 2)},
   figure='JSK قائم في S: J أعلى اليسار، S أعلى اليمين، K أسفل اليمين؛ JK = 10cm (الوتر)، $\\widehat{K} = 55°$ .',
   note='« القيمة المضبوطة » = l’écriture exacte 10 cos 55° (cos 55° n’a pas d’écriture plus simple).')
C7 = acos(4 / 4.4)
ex(7, 123, S1, 'في الشكل الآتي، احسب القيمة المقربة إلى الوحدة من الدرجة لـ $\\widehat{ACB}$ (اكتب البرنامج الذي تنفذه بالحاسبة).',
   {'cos': '\\cos\\widehat{ACB} = \\dfrac{CB}{CA} = \\dfrac{4}{4{,}4} = \\dfrac{10}{11}', 'keys': 'ON 2nd cos⁻¹ ( 4 ÷ 4,4 ) =', 'ACB': r(C7, 0)},
   figure='ABC قائم في B: A في الأعلى، C على اليسار، B على اليمين؛ CA = 4,4cm (الوتر)، CB = 4cm.')
DE = math.sqrt(49 - 4.2 ** 2); E8 = asin(4.2 / 7)
assert abs(DE - 5.6) < 1e-12
ex(8, 123, S1, 'FDE مثلث قائم في D. (الشكل) 1) احسب DE. 2) احسب القيمة المقربة إلى الوحدة لقيس الزاوية $\\widehat{FED}$ .',
   {'DE': '\\sqrt{7^2 - 4{,}2^2} = \\sqrt{31{,}36} = 5{,}6', 'sin': '\\sin\\widehat{FED} = \\dfrac{DF}{EF} = \\dfrac{4{,}2}{7} = 0{,}6', 'FED': r(E8, 0)},
   figure='FDE قائم في D: D في الأعلى، E على اليسار، F على اليمين؛ DF = 4,2cm، EF = 7cm (الوتر).')
AC9 = 5.2 * sin(23)
ex(9, 123, S1, 'ABC مثلث قائم في A حيث BC = 5,2cm و $\\widehat{ABC} = 23°$ . احسب المدوّر إلى $\\dfrac{1}{10}$ للطول AC.',
   {'AC': 'AC = 5{,}2 \\times \\sin 23°', 'AC10': r(AC9, 1)})
ex(10, 123, S1, 'أنهت نبيلة حل التمرين الذي اقترحه عليها أستاذ الرياضيات وكتبت $\\cos\\widehat{A} = 1{,}5$ . غير أن زميلتها مريم بيّنت لها خطأ نتيجتها دون إجراءها لأي حساب. ما رأيك أنت؟ اشرح.',
   {'verdict': 'مريم محقة', 'reason': 'جيب تمام زاوية حادة محصور بين 0 و 1 لأن الوتر أطول أضلاع المثلث القائم، و 1,5 > 1.'})
R11 = atan(2 / 5)
ex(11, 123, S1, 'TRI هو مثلث قائم في I حيث IT = 2cm و IR = 5cm. 1) أنجز شكلا باليد الحرة. 2) احسب قيس الزاوية $\\widehat{R}$ . تدوّر النتيجة إلى الجزء من 10.',
   {'tan': '\\tan\\widehat{R} = \\dfrac{IT}{IR} = \\dfrac{2}{5} = 0{,}4', 'R': r(R11, 1)})
S2 = 'البرهان باستعمال النسب المثلثية'
ex(12, 123, S2, 'ABC مثلث حيث AB = 3cm ، AC = 4cm و BC = 5cm. 1) أثبت أن المثلث ABC قائم في A. 2) احسب $\\cos\\widehat{B}$ ، $\\sin\\widehat{B}$ ، $\\tan\\widehat{B}$ ، $\\cos\\widehat{C}$ ، $\\sin\\widehat{C}$ ، $\\tan\\widehat{C}$ .',
   {'right': '3^2 + 4^2 = 25 = 5^2', 'cosB': '\\dfrac{3}{5}', 'sinB': '\\dfrac{4}{5}', 'tanB': '\\dfrac{4}{3}', 'cosC': '\\dfrac{4}{5}', 'sinC': '\\dfrac{3}{5}', 'tanC': '\\dfrac{3}{4}'})
assert right('3.4', '2.55', '4.25') and D(3) / D('4.25') == D('2.4') / D('3.4')
A13 = acos(3.4 / 4.25)
ex(13, 123, S2, 'إليك شكلا أنجز باليد الحرة. برهن أن (BE) عمودي على (AD). احسب المدوّر إلى الدرجة لقيس الزاوية $\\widehat{A}$ .',
   {'right': 'AC = 1,25 + 3 = 4,25 و AD = 2,4 + 1 = 3,4: $3{,}4^2 + 2{,}55^2 = 11{,}56 + 6{,}5025 = 18{,}0625 = 4{,}25^2$ فالمثلث ACD قائم في D',
    'parallel': '$\\dfrac{AB}{AC} = \\dfrac{3}{4{,}25} = \\dfrac{12}{17}$ و $\\dfrac{AE}{AD} = \\dfrac{2{,}4}{3{,}4} = \\dfrac{12}{17}$ والنقط بنفس الترتيب: (BE)//(CD) (الخاصية العكسية لخاصية طالس)',
    'perp': '(CD) ⊥ (AD) و (BE)//(CD) إذن (BE) ⊥ (AD)', 'cosA': '\\dfrac{AD}{AC} = \\dfrac{3{,}4}{4{,}25} = 0{,}8', 'A': r(A13, 0)},
   figure='رباعي ACD…: A على اليمين، D أسفل اليسار، C أعلى اليسار؛ B على [AC] و E على [AD]؛ CB = 1,25cm، BA = 3cm، AE = 2,4cm، ED = 1cm، CD = 2,55cm.',
   note='Aucun angle droit n’est marqué : on le PROUVE par la réciproque de Pythagore dans ACD (4,25 ; 3,4 ; 2,55) puis la réciproque de Thalès — l’exercice réinvestit l’unité 9.')
ex(14, 123, S2, 'لاحظ الشكل المقابل. 1) برهن أن $\\dfrac{AB}{OB} = \\dfrac{EF}{OE}$ . 2) برهن أن $\\dfrac{AB}{OA} = \\dfrac{EF}{OF}$ .',
   {'1': 'في OAB القائم في A: $\\sin\\widehat{O} = \\dfrac{AB}{OB}$ ، وفي OFE القائم في F: $\\sin\\widehat{O} = \\dfrac{EF}{OE}$', '2': '$\\tan\\widehat{O} = \\dfrac{AB}{OA} = \\dfrac{EF}{OF}$'},
   figure='O على اليمين؛ F و A على نصف مستقيم أفقي من O (F أبعد)؛ B و E على نصف مستقيم مائل من O (E أبعد)؛ زاويتان قائمتان في A (OAB) و F (OFE).')
A15 = asin(8.4 / 10.5)
ex(15, 123, S2, 'طلب أستاذ الرياضيات من ثلاثة تلاميذ: عمر، ليلى ومختارية الاختيار بين جيب تمام أو الجيب أو الظل لحساب قيس الزاوية $\\widehat{A}$ . عمر: جيب تمام — ليلى: الجيب — رضا: الظل. من الذي أحسن الاختيار؟ اشرح.',
   {'best': 'ليلى (الجيب)', 'reason': 'المعلومان هما BC = 8,4 (المقابل للزاوية A) و AC = 10,5 (الوتر): $\\sin\\widehat{A} = \\dfrac{8{,}4}{10{,}5} = 0{,}8$', 'A': r(A15, 0)},
   figure='ABC قائم في B: B أعلى اليسار، A أعلى اليمين، C في الأسفل؛ BC = 8,4cm، AC = 10,5cm (الوتر).',
   note='Le texte nomme « عمر، ليلى ومختارية » puis attribue la tangente à « رضا » : incohérence de prénoms sans effet mathématique ; la plateforme garde les trois réponses et écrit « رضا » (la liste).')
DISC.append({'elementId': 'ex-15', 'kind': 'inconsistency', 'resolution': 'kept — lessons name the third pupil رضا as in the answer list',
             'text': 'Le texte annonce « عمر، ليلى ومختارية » mais la liste des réponses écrit « رضا: الظل ». Sans effet sur la réponse (ليلى).'})
S3 = 'العلاقات المثلثية'
ex(16, 123, S3, 'x هو قيس زاوية حادة حيث $\\cos x = \\dfrac{\\sqrt{2}}{2}$ . احسب، بدون استعمال حاسبة، القيمة المضبوطة للعدد $\\sin x$ . استنتج القيمة المضبوطة للعدد $\\tan x$ .',
   {'sin': '\\dfrac{\\sqrt{2}}{2}', 'tan': '1'})
ex(17, 123, S3, 'x هو قيس زاوية حادة حيث $\\sin x = \\dfrac{\\sqrt{3}}{2}$ . 1) بدون استعمال حاسبة، عيّن القيمة المضبوطة للعدد $\\cos x$ . 2) استنتج قيمة مقربة للعدد $\\tan x$ تدوّر النتيجة إلى الجزء من 100.',
   {'cos': '\\dfrac{1}{2}', 'tan': '\\sqrt{3}', 'tan100': r(math.sqrt(3), 2)})
ex(18, 123, S3, 'x قيس بالدرجات لزاوية حادة. بدون حساب قيمة x، أتمم إن أمكن الجدول الآتي.',
   {'col1': {'cos': '0{,}4', 'sin': '\\dfrac{\\sqrt{21}}{5}', 'tan': '\\dfrac{\\sqrt{21}}{2}'},
    'col2': {'sin': '\\dfrac{3}{2}', 'possible': False, 'reason': '\\dfrac{3}{2} > 1'},
    'col3': {'sin': '\\dfrac{\\sqrt{5}}{2}', 'possible': False, 'reason': '\\sqrt{5} > 2 \\Rightarrow \\dfrac{\\sqrt{5}}{2} > 1'}},
   figure='جدول: الأسطر $\\cos x$ ، $\\sin x$ ، $\\tan x$ ؛ العمود 1: $\\cos x = 0{,}4$ ؛ العمود 2: $\\sin x = \\dfrac{3}{2}$ ؛ العمود 3: $\\sin x = \\dfrac{\\sqrt{5}}{2}$ .',
   note='Lu à 300 dpi : « 3/2 » et « √5/2 » sont bien imprimés. Les deux dépassent 1 : c’est le sens de « إن أمكن » (pas une coquille). √5/2 ≈ 1,118 est le piège subtil.')
ex(19, 123, S3, 'ABC مثلث متقايس الأضلاع طول ضلعه 1، [AH] الارتفاع المتعلّق بالضلع [BC]. 1) أنجز شكلا مناسبا. 2) برّر صحة المساواة $\\cos 60° = \\dfrac{1}{2}$ واستنتج أنّ $\\sin 60° = \\dfrac{\\sqrt{3}}{2}$ و $\\tan 60° = \\sqrt{3}$ . 3) ما هو قيس الزاوية $\\widehat{BAH}$ ؟ برّر صحة المساواة $\\sin 30° = \\dfrac{1}{2}$ واستنتج أنّ $\\cos 30° = \\dfrac{\\sqrt{3}}{2}$ و $\\tan 30° = \\dfrac{\\sqrt{3}}{3}$',
   {'BH': '\\dfrac{1}{2}', 'cos60': '\\dfrac{BH}{AB} = \\dfrac{1}{2}', 'AH': '\\dfrac{\\sqrt{3}}{2}', 'BAH': '30°'})
S4 = 'إنشاءات هندسية'
ex(20, 123, S4, 'أنشئ، بدون استعمال منقلة، زاوية بحيث جيبها التمام يساوي 0,18. عيّن قيس هذه الزاوية. (بالحاسبة وبالمنقلة). تدوّر النتيجة إلى الدرجة.',
   {'construction': 'وتر 50 وحدة وضلع مجاور 9 وحدات (0,18 = 9/50)، أو 1,8cm و 10cm', 'x': r(acos(0.18), 0)})
ex(21, 123, S4, 'أنشئ، بدون استعمال منقلة، زاوية ظلها يساوي 5,4. تحقق بالحاسبة وبالمنقلة.',
   {'construction': 'ضلعا زاوية قائمة: المقابل 5,4cm والمجاور 1cm (أو 27 و 5)', 'x': r(atan(5.4), 1), 'x1': r(atan(5.4), 0)})
ex(22, 123, S4, 'أنشئ، بدون استعمال منقلة، زاوية قيسها x يحقق $\\sin x = \\dfrac{3}{5}$ . أعط المدوّر إلى الجزء من 10 لهذا القيس. تحقق باستعمال حاسبة ثم بمنقلة.',
   {'construction': 'ضلع 3cm ووتر 5cm (دائرة نصف قطرها 5)', 'x': r(asin(0.6), 1)})
K23 = acos(5 / 9)
ex(23, 123, S4, 'طلب أستاذ الرياضيات من تلاميذه حساب قيمة مقربة إلى الوحدة للزاوية $\\widehat{KML}$ اعتمادًا على الشكل الآتي: — ليلى: $\\cos\\widehat{KML} = \\dfrac{MK}{ML}$ ، $\\cos\\widehat{KML} = \\dfrac{5}{9}$ ، $\\widehat{KML} = 0{,}6$ — رضا: KLM قائم في K. $\\tan\\widehat{KML} = \\dfrac{MK}{ML}$ ، $\\tan\\widehat{KML} = \\dfrac{5}{9}$ ، $\\widehat{KML} = 29$ . صوّب الأخطاء المُرتكبة في الإجابتين مع الشرح.',
   {'leila': 'الاختيار صحيح لكن 0,6 هي قيمة $\\cos\\widehat{KML}$ وليست قيس الزاوية: $\\widehat{KML} = \\cos^{-1}\\left(\\dfrac{5}{9}\\right)$',
    'rida': '$\\dfrac{MK}{ML}$ هو المجاور على الوتر (جيب التمام) لا الظل؛ والقيس دون وحدة الدرجة.', 'KML': r(K23, 0)},
   figure='KLM قائم في K: M أسفل اليسار، K أسفل اليمين، L فوق K؛ ML = 9cm (الوتر)، MK = 5cm.',
   note='Le bloc 23 est placé sous « إنشاءات هندسية » dans la mise en page mais c’est un exercice de calculatrice / choix du rapport.')

# ── أؤكّد تعلّماتي (p. 124) ───────────────────────────────────────────────────
E.append({
    'id': 'qcm', 'kind': 'qcm', 'page': 124, 'section': 'أؤكّد تعلّماتي', 'verified': True,
    'instruction': 'في كل حالة مما يلي اختر الإجابة أو الإجابات الصحيحة، وبرّر اختيارك.',
    'items': [
        {'number': 1, 'text': 'في المثلث MOB القائم في O، لدينا:', 'figure': 'MOB قائم في O: M على اليسار، O على اليمين، B فوق O.',
         'options': ['$\\cos\\widehat{M} = \\dfrac{OM}{OB}$', '$\\cos\\widehat{M} = \\dfrac{OM}{MB}$', '$\\cos\\widehat{M} = \\dfrac{OB}{MB}$'], 'correct': [1], 'pages': '118 و 119'},
        {'number': 2, 'text': 'في المثلث LMN القائم في M، لدينا:', 'figure': 'LMN قائم في M: L في الأعلى، M أسفل L، N بعيدة على اليمين.',
         'options': ['$\\sin\\widehat{L} = \\dfrac{MN}{LN}$', '$\\sin\\widehat{L} = \\dfrac{LM}{LN}$', '$\\sin\\widehat{L} = \\dfrac{MN}{LM}$'], 'correct': [0], 'pages': '118 و 119'},
        {'number': 3, 'text': 'في المثلث ABC القائم في B، لدينا:', 'figure': 'ABC قائم في B: A فوق B، C على اليمين؛ AB = 7، $\\widehat{C} = 35°$ .',
         'options': ['$\\sin 35° = \\dfrac{7}{AC}$', '$\\sin 35° = \\dfrac{AC}{7}$', '$\\sin 35° \\times AC = 7$'], 'correct': [0, 2], 'pages': '118 و 119'},
        {'number': 4, 'text': 'إذا كان $\\cos 70° = \\dfrac{2}{MN}$ فإن…',
         'options': ['$MN = 2 \\times \\cos 70°$', '$MN = \\dfrac{\\cos 70°}{2}$', '$MN = \\dfrac{2}{\\cos 70°}$'], 'correct': [2], 'pages': '118 و 119'},
        {'number': 5, 'text': 'في الشكل المقابل، لدينا:', 'figure': 'LIE قائم في I: L فوق I، E بعيدة على اليمين؛ IL = 6cm، $\\widehat{L} = 50°$ .',
         'rows': {'IE': ['IE = \\dfrac{6}{\\tan 50°}', 'IE = 6 \\times \\tan 50°', 'IE = 6 \\times \\sin 50°'],
                  'EL': ['EL = 6 \\times \\sin 50°', 'EL = \\dfrac{6}{\\cos 50°}', 'EL = 6 \\times \\sin 50°']},
         'correct': {'IE': [1], 'EL': [1]}, 'pages': '118 و 119',
         'note': 'Deux lignes jugées séparément (comme le QCM de l’unité 9) ; colonnes (1)(2)(3) dans l’ordre du manuel.'},
        {'number': 6, 'text': 'من أجل كل قيس زاوية حادة في مثلث قائم، لدينا:',
         'options': ['$\\cos^2 x = \\sin^2 x - 1$', '$\\cos^2 x = 1 - \\sin^2 x$', '$\\cos x = 1 - \\sin x$'], 'correct': [1], 'pages': '120 و 121'},
    ],
    'note': 'Le tableau imprime les colonnes (1) (2) (3) de droite à gauche ; les options sont rangées ici dans l’ordre (1), (2), (3).',
})

DISC.append({'elementId': 'qcm', 'kind': 'misprint', 'resolution': 'kept — lessons show the duplicated option once, with one line',
             'text': 'Item 5, ligne EL : les colonnes (1) et (3) impriment la même expression « EL = 6 × sin 50° » (toutes deux fausses) ; la bonne réponse (2) EL = 6 / cos 50° n’en dépend pas.'})

DISC.append({'elementId': 'know-3', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — one line in hasiba-muthallathiya M2',
             'text': 'Exemple 2 : l’écran imprimé « 16,69924453 » pour tan⁻¹ 0,3 ; la calculatrice donne 16,69924423. Arrondi 17° inchangé.'})

# ── أدمج تعلّماتي (p. 124) ───────────────────────────────────────────────────
SIT_POLE, SIT_D, SIT_E = D('2.30'), D('95.65'), D('2.45')
SIT_H = SIT_POLE * (SIT_D + SIT_E) / SIT_E
SIT_X = atan(float(SIT_POLE / SIT_E))
assert r(float(SIT_H), 2) == '92{,}09' and r(SIT_X, 0) == '43'
E.append({
    'id': 'situation', 'kind': 'situation', 'page': 124, 'section': 'أدمج تعلّماتي', 'verified': True, 'title': 'وضعية',
    'text': 'يريد أريس قياس ارتفاع المعلم التاريخي «مقام الشهيد» المتواجد بالجزائر العاصمة. لإنجاز هذه المهمة، استعان بعمود كهربائي طوله 2,30m ووقف في مكان حيث يشاهد قمة العمود الكهربائي وقمة «مقام الشهيد». ساعد أريس على إيجاد ارتفاع هذا المقام. عيّن قيس الزاوية x المحدّدة على الشكل. (يعطى المدوّر إلى الدرجة للزاوية x)',
    'figure': 'مقام الشهيد على اليسار (ارتفاعه مجهول، سهم شاقولي)؛ عمود كهربائي شاقولي طوله 2,30m (زاوية قائمة عند قاعدته)؛ أريس على اليمين، خط النظر المتقطع يمر بقمة العمود ويصل قمة المقام؛ المسافة بين قاعدة المقام وقاعدة العمود 95,65m وبين العمود وأريس 2,45m ؛ x الزاوية بين الأرض وخط النظر عند أريس. (الشكل يهمل طول أريس: خط النظر يبدأ من الأرض.)',
    'analysis': {
        'قراءة الوضعية وفهمها': ['المطلوب البحث عن ارتفاع مقام الشهيد وقيس الزاوية x، الأخذ بعين الاعتبار الشكل والأبعاد المُعطاة.'],
        'تحليل الوضعية واختيار استراتيجية حل مناسبة': ['ماهي المعارف الرياضية التي قد تكون لها علاقة بالشكل؟ (خاصيّة طالس، النسب المثلثية في مثلث قائم، خاصيّة فيثاغورس،.....).', 'اختيار المعرفة المناسبة تبعا للمعطيات.'],
        'تنفيذ استراتيجية الحل': ['كتابة المساواة اللازمة وحساب الارتفاع.', 'توظيف الارتفاع والمعارف المناسبة لحساب القيس x.'],
    },
    'answer': {'thales': '\\dfrac{h}{2{,}30} = \\dfrac{95{,}65 + 2{,}45}{2{,}45} = \\dfrac{98{,}1}{2{,}45}', 'h': r(float(SIT_H), 2), 'hRounded': '92',
               'tan': '\\tan x = \\dfrac{2{,}30}{2{,}45} = \\dfrac{h}{98{,}1}', 'x': r(SIT_X, 0), 'unit': 'm'},
    'answerSource': 'computed',
    'reading': 'La distance monument–poteau est imprimée en petits caractères roses sur fond gris : « 95,65 » ou « 96,65 » (lu à 600 dpi, le 2e chiffre reste ambigu). 95,65 m donne h ≈ 92,09 m, soit la hauteur réelle du مقام الشهيد (92 m) ; 96,65 m donnerait 93,03 m. La plateforme lit 95,65 m.',
})
DISC.append({'elementId': 'situation', 'kind': 'reading', 'resolution': 'decided — 95,65 m (h ≈ 92 m, hauteur réelle du monument)',
             'text': 'Distance monument–poteau illisible entre 95,65 et 96,65 ; le contexte (مقام الشهيد mesure 92 m) tranche pour 95,65.'})

# ── أتعمّق (p. 125) ──────────────────────────────────────────────────────────
S5 = 'أتعمّق'
ex(24, 125, S5, 'ارسم دائرة مركزها O ونصف قطرها 2,5cm. ارسم قطرا [AB]. ضع نقطة C على الدائرة بحيث تبعد عن A بمسافة 3cm. 1) ماهو نوع المثلث ABC؟ علّل إجابتك. 2) احسب أقياس زوايا المثلث ABC.',
   {'type': 'قائم في C (مرسوم في نصف دائرة قطرها [AB] — أو BC = 4 و $3^2 + 4^2 = 5^2$)', 'BC': '4', 'B': r(asin(3 / 5), 0), 'A': r(acos(3 / 5), 0), 'C': '90'})
ex(25, 125, S5, 'ABCD مستطيل، طولا قطريه 10cm. يتقاطع القطران في النقطة O (الشكل). 1) احسب قيس الزاوية $\\widehat{OAB}$ . 2) احسب طول وعرض المستطيل ABCD.',
   {'OAD': '\\dfrac{180° - 30°}{2} = 75°', 'OAB': '90° - 75° = 15°', 'AB': '10\\cos 15° \\approx ' + r(10 * cos(15), 2), 'AD': '10\\sin 15° \\approx ' + r(10 * sin(15), 2)},
   figure='مستطيل ABCD: A أعلى اليسار، B أعلى اليمين، C أسفل اليمين، D أسفل اليسار؛ القطران [AC] و [BD] يتقاطعان في O؛ الزاوية 30° مرسومة في O بين [OA] و [OD] ($\\widehat{AOD} = 30°$).',
   reading='Lu à 300 dpi : l’arc « 30° » est au sommet O, côté gauche (entre OA et OD), pas en A. OA = OD = 5 ⇒ OAD = 75° ⇒ OAB = 15°. Le dessin du manuel n’est pas à l’échelle (trop haut).')
DISC.append({'elementId': 'ex-25', 'kind': 'reading', 'resolution': 'decided — 30° = angle AOD (at O)',
             'text': 'L’arc 30° est en O entre [OA] et [OD] ; la figure n’est pas à l’échelle. Réponse : OAB = 15°, AB ≈ 9,66 cm, AD ≈ 2,59 cm.'})
ex(26, 125, S5, 'ABC مثلث قائم في A حيث $\\widehat{B} = 18°$ و BC = 6cm. 1) أنجز شكلا مناسبا. احسب AC. تدوّر النتيجة إلى الجزء من 10. 2) احسب AB في كل حالة مما يلي: • باستعمال $\\cos\\widehat{B}$ . • استعمال خاصية فيثاغورس. • استعمال $\\tan\\widehat{B}$ . • استعمال $\\sin\\widehat{C}$ .',
   {'AC': r(6 * sin(18), 1), 'AB_cos': r(6 * cos(18), 1), 'AB_pyth': r(math.sqrt(36 - (6 * sin(18)) ** 2), 1), 'AB_tan': r(6 * sin(18) / tan(18), 1), 'AB_sinC': r(6 * sin(72), 1),
    'note': 'بالقيمة المدوّرة AC ≈ 1,9 تعطي فيثاغورس $\\sqrt{36 - 1{,}9^2} \\approx 5{,}69$ و tan تعطي $\\dfrac{1{,}9}{\\tan 18°} \\approx 5{,}85$ : استعمال قيمة مدوّرة في حساب لاحق يُراكم الخطأ.'})
assert r(6 * cos(18), 1) == '5{,}7'
ex(27, 125, S5, 'MSF مثلث قائم في M حيث $\\widehat{S} = 32°$ و MF = 9cm. 1) احسب MS (تدوّر النتيجة إلى الجزء من 100). 2) احسب SF في كل حالة مما يلي: (تدوّر النتيجة إلى الجزء من 10). • بحساب $\\sin\\widehat{S}$ . • باستعمال خاصية فيثاغورث. • باستعمال $\\cos\\widehat{S}$ . • باستعمال $\\cos\\widehat{F}$ .',
   {'MS': r(9 / tan(32), 2), 'SF': r(9 / sin(32), 1)})
AH28 = D('10.35') / D('4.5')
assert AH28 == D('2.3')
D28 = asin(2.3 / 2.7)
ex(28, 125, S5, 'ABCD متوازي أضلاع حيث CD = 4,5cm و BC = 2,7cm. [AH] الارتفاع المتعلّق بالضلع [CD]. مساحة ABCD هي 10,35cm². 1) أنجز شكلا باليد الحرة. 2) احسب الارتفاع AH. 3) استنتج قيسي الزاويتين $\\widehat{ADC}$ و $\\widehat{BCD}$ (تدوّر النتيجتان إلى الوحدة).',
   {'AH': '\\dfrac{10{,}35}{4{,}5} = 2{,}3', 'sinD': '\\sin\\widehat{ADC} = \\dfrac{AH}{AD} = \\dfrac{2{,}3}{2{,}7}', 'ADC': r(D28, 0), 'BCD': str(180 - int(r(D28, 0)))},
   note='AD = BC = 2,7 (côtés opposés) ; H est sur [CD] car ADC est aigu. BCD = 180° − ADC (angles consécutifs d’un parallélogramme).')
H29 = 10 * tan(36)
ex(29, 125, S5, 'احسب ارتفاع النخلة باستعمال المعطيات المسجلة على الشكل. (تدوّر النتيجة إلى الجزء $\\dfrac{1}{10}$).',
   {'tan': 'h = 10 \\times \\tan 36°', 'h': r(H29, 1)},
   figure='نخلة شاقولية ارتفاعها h؛ من نقطة على الأرض على بعد 10m من قاعدة النخلة يُرى رأسها بزاوية 36° مع الأرض (مثلث قائم عند قاعدة النخلة).',
   reading='Base lue « 10m » et angle « 36° » à 600 dpi (gris très pâle).')
ex(30, 125, S5, 'ABCD مربع طول ضلعه 1. 1) برّر صحة المساواة $AC = \\sqrt{2}$ . 2) استنتج القيم المضبوطة لكل من $\\cos 45°$ ، $\\sin 45°$ ، $\\tan 45°$ .',
   {'AC': '\\sqrt{1^2 + 1^2} = \\sqrt{2}', 'cos45': '\\dfrac{1}{\\sqrt{2}} = \\dfrac{\\sqrt{2}}{2}', 'sin45': '\\dfrac{\\sqrt{2}}{2}', 'tan45': '1'})
AC31 = math.sqrt(3.15 ** 2 + 2.35 ** 2); AD31 = math.sqrt(AC31 ** 2 + 1.55 ** 2); DAC = asin(1.55 / AD31)
ex(31, 125, S5, 'ABCDEFGH متوازي مستطيلات. 1) احسب القيمتين المضبوطتين لكل من AC و AD. أعط المدوّر إلى الوحدة لكل من AC و AD. 2) عيّن القيمة المضبوطة للعدد $\\sin\\widehat{DAC}$ . احسب المدوّر إلى الدرجة لقيس الزاوية $\\widehat{DAC}$ .',
   {'AC': '\\sqrt{3{,}15^2 + 2{,}35^2} = \\sqrt{15{,}445}', 'AD': '\\sqrt{15{,}445 + 1{,}55^2} = \\sqrt{17{,}8475}', 'AC1': r(AC31, 0), 'AD1': r(AD31, 0),
    'sin': '\\dfrac{1{,}55}{\\sqrt{17{,}8475}}', 'DAC': r(DAC, 0)},
   figure='متوازي مستطيلات: الوجه الأمامي ABEF (A أسفل اليسار، B أسفل اليمين، E أعلى اليمين، F أعلى اليسار)، AB = 3,15cm، AF = 1,55cm، FG = 2,35cm (العمق)؛ C خلف B، D فوق C، H خلف A؛ القطعتان [AC] (قطر القاعدة) و [AD] (قطر المجسم) مرسومتان. المثلث ACD قائم في C.')
HALF = 231 * math.sqrt(2) / 2; H32 = math.sqrt(220 ** 2 - HALF ** 2)
assert r(H32, 0) == '147'
ex(32, 125, S5, 'هرم «خوفو» هو هرم منتظم قاعدته مربع طول ضلعه 231m. رأسه متواجد على المستقيم العمودي على قاعدة الهرم في مركزها. يبعد هذا الرأس بنفس المسافة 220m عن رؤوس القاعدة. احسب طول ارتفاع هذا الهرم. تدوّر النتيجة إلى الوحدة.',
   {'halfDiagonal': '\\dfrac{231\\sqrt{2}}{2} \\approx ' + r(HALF, 2), 'h': '\\sqrt{220^2 - \\left(\\dfrac{231\\sqrt{2}}{2}\\right)^2} = \\sqrt{21719{,}5}', 'h1': r(H32, 0), 'unit': 'm'},
   figure='هرم منتظم قاعدته مربعة ضلعها 231m، أحرفه الجانبية 220m، الارتفاع من الرأس إلى مركز القاعدة H؛ المثلث (الرأس، H، رأس من القاعدة) قائم في H.',
   note='Exercice sans trigonométrie (Pythagore dans l’espace) ; une variante de la plateforme peut demander l’angle d’une arête avec la base (cos = 163,3/220).')

# ── Destinations ─────────────────────────────────────────────────────────────
L1, L2, L3, L4, L5 = 'nisab-muthallathiya', 'hasiba-muthallathiya', 'alaqat-muthallathiya', 'tarrid-muthallathiya', 'wadiya-idmajiya-muthallathat'
DEST = {
    '_comment': 'elementId → { lesson, module } ; `duplicatedIn` autorise une seconde utilisation déclarée ; `items` répartit un élément. Vérifié par scripts/check-textbook-coverage.mjs.',
    'objectives': {'lesson': 'unit', 'module': 'page'},
    'intro-tusi': {'lesson': 'unit', 'module': 'page', 'duplicatedIn': [{'lesson': L1, 'module': 2, 'note': 'les noms جيب / جيب التمام / ظل et leurs auteurs (الطوسي، أبو الوفاء، حبش الحاسب)'}]},
    'challenge': {'lesson': 'unit', 'module': 'page', 'duplicatedIn': [{'lesson': L4, 'module': 1, 'note': 'entrée de la leçon de modélisation : l’échelle, 1,9 m'}]},
    'prep': {'lesson': L1, 'module': 0, 'items': {'1': {'lesson': L1, 'module': 0}, '2-3': {'lesson': L2, 'module': 0}, '4-6': {'lesson': L1, 'module': 0}}},
    'act-1': {'lesson': L1, 'module': 1}, 'act-2': {'lesson': L1, 'module': 1}, 'act-3': {'lesson': L1, 'module': 2},
    'know-1': {'lesson': L1, 'module': 2}, 'know-2': {'lesson': L1, 'module': 2},
    'method-sin': {'lesson': L1, 'module': 3}, 'method-cos': {'lesson': L1, 'module': 3}, 'method-tan': {'lesson': L1, 'module': 3}, 'now-119': {'lesson': L1, 'module': 3},
    'act-4': {'lesson': L2, 'module': 1}, 'know-3': {'lesson': L2, 'module': 2},
    'act-5': {'lesson': L3, 'module': 1}, 'know-4': {'lesson': L3, 'module': 2},
    'method-relations': {'lesson': L3, 'module': 3}, 'method-construct': {'lesson': L3, 'module': 3}, 'now-121': {'lesson': L3, 'module': 3},
    'qcm': {'lesson': L5, 'module': 2, 'duplicatedIn': [{'lesson': L1, 'module': 5, 'note': 'items 1–5 dans le إختبار أولي'}, {'lesson': L3, 'module': 5, 'note': 'item 6'}]},
    'situation': {'lesson': L5, 'module': 1, 'duplicatedIn': [{'lesson': L5, 'module': 4, 'note': 'transposée à d’autres nombres'}]},
}
for n in (1, 2, 4, 5, 6, 9, 10, 12, 14, 15):
    DEST[f'ex-{n}'] = {'lesson': L1, 'module': 4}
for n in (3, 7, 8, 11, 23):
    DEST[f'ex-{n}'] = {'lesson': L2, 'module': 3}
for n in (16, 17, 18, 19, 20, 21, 22, 30):
    DEST[f'ex-{n}'] = {'lesson': L3, 'module': 4}
for n in (13, 24, 25, 26, 27, 28, 29):
    DEST[f'ex-{n}'] = {'lesson': L4, 'module': 3}
for n in (26, 27):  # exemples travaillés de la طريقة de la plateforme (M2), choix de l'auteur D
    DEST[f'ex-{n}'] = {'lesson': L4, 'module': 2}
for n in (31, 32):
    DEST[f'ex-{n}'] = {'lesson': L5, 'module': 3}

ids = [e['id'] for e in E]
assert len(ids) == len(set(ids))
missing = [i for i in ids if i not in DEST]
assert not missing, missing
assert sorted(int(i[3:]) for i in ids if i.startswith('ex-')) == list(range(1, 33))

OUT = {
    '_comment': 'EXTRACTION CANONIQUE du manuel scolaire officiel — 4AM, الجيل الثاني, unité 10 « حساب المثلثات في المثلث القائم ». Générée par build-extraction.py (ne pas éditer à la main).',
    'unitCode': 'hisab-muthallathat',
    'textbook': {'title': 'كتاب الرياضيات — السنة الرابعة من التعليم المتوسط', 'generation': 'الجيل الثاني', 'unitNumber': 10,
                 'unitTitle': 'حساب المثلثات في المثلث القائم', 'pages': {'first': 115, 'last': 125}, 'pdfPageOffset': 114,
                 'sections': ['سأتعلّم في هذا الباب', 'تحدّ', 'أستعدّ', 'أنشطة', 'معارف', 'طرائق', 'دوري الآن', 'أوظّف تعلّماتي', 'أؤكّد تعلّماتي', 'أدمج تعلّماتي', 'أتعمّق']},
    'frozenAt': '2026-10-04',
    'terminology': {'wordFraction': 'Une fraction dont les termes sont des MOTS (wordFraction { num, den }) se rend avec lessons/common/components/WordFraction.jsx — jamais de \\text{} arabe dans KaTeX.', 'note': 'Le manuel écrit « جيب التمام » (cos), « الجيب » (sin), « الظل » (tan), « الوتر », « الضلع المقابل », « الضلع المجاور », « زاوية حادة », « القيمة المضبوطة », « قيمة مقربة », « المدوّر إلى الجزء من 10 / 100 / إلى الوحدة », « قيس زاوية », « منقلة », « حاسبة » ; les touches ON, 2nd, sin⁻¹ en latin (code de calculatrice, LTR).',
                    'terms': ['جيب التمام', 'الجيب', 'الظل', 'الوتر', 'الضلع المقابل', 'الضلع المجاور', 'زاوية حادة', 'القيمة المضبوطة', 'قيمة مقربة', 'المدوّر', 'قيس زاوية', 'منقلة', 'حاسبة']},
    'elements': E,
    'discrepancies': DISC,
    'destinations': DEST,
}
Path(__file__).with_name('extraction.json').write_text(json.dumps(OUT, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{len(E)} éléments, {len(DISC)} écarts, {len(DEST) - 1} destinations')
