#!/usr/bin/env python3
"""Génère docs/sources/4am/unit9/extraction.json — unité 9 « خاصية طالس » (pp. 103–113).

Transcription VISUELLE du scan (« وحدة خاصية طاليس.pdf », 11 pages CamScanner, sans couche texte), pages
rendues à 110 dpi, relues à 260 dpi (figures du تحدّ, de أستعدّ 4–5, de la ملاحظة 1, du دوري الآن p. 107,
des تمارين 3, 5, 8, 9, 13, 14, 15, du QCM) et à 500 dpi (marques d'égalité du تمرين 23).
L'unité est COMPLÈTE : ouverture, تحدّ, أستعدّ, deux أنشطة, معارف (3 blocs), طرائق (5 méthodes, 2 « دوري الآن »),
أوظّف تعلّماتي (1–19), أؤكّد تعلّماتي (QCM 1–4), أدمج تعلّماتي et أتعمّق (20–26).

Le texte arabe est celui du manuel, au mot près ; les réponses (`answer`) ne viennent PAS du manuel quand
il n'en donne pas : elles sont CALCULÉES ici en fractions exactes (`answerSource: computed`), et chaque
nombre du manuel (rapports, produits en croix, longueurs données) est re-vérifié par une assertion.
Les figures sont DÉCRITES (`figure`) : la plateforme les redessine en SVG (jamais d'image du manuel).

Usage : python3 docs/sources/4am/unit9/build-extraction.py
"""
import json
from fractions import Fraction as F
from pathlib import Path


def D(s):
    """Les décimaux du manuel (3,2 …) sont lus EXACTS, jamais un flottant."""
    return F(str(s).replace(',', '.'))


def fmt(q):
    """Écriture du manuel : virgule décimale (LaTeX `{,}`) quand elle est finie, fraction sinon."""
    q = F(q)
    if q.denominator == 1:
        return str(q.numerator)
    d = q.denominator
    while d % 2 == 0:
        d //= 2
    while d % 5 == 0:
        d //= 5
    if d == 1:
        s = f'{float(q):.10f}'.rstrip('0').rstrip('.')
        return s.replace('.', '{,}')
    sign = '-' if q < 0 else ''
    return f'{sign}\\dfrac{{{abs(q.numerator)}}}{{{q.denominator}}}'


def fourth(a, b, c):
    """Le quatrième proportionnel : a/b = c/x ⇒ x = b·c/a."""
    return F(b) * F(c) / F(a)


E = []

# ── Ouverture ────────────────────────────────────────────────────────────────
E.append({
    'id': 'objectives', 'kind': 'objectives', 'page': 103, 'section': 'سأتعلّم في هذا الباب', 'verified': True,
    'items': ['معرفة خاصية طالس واستعمالها في حساب أطوال وإنجاز براهين وإنشاءات هندسية بسيطة.'],
})
E.append({
    'id': 'intro-thales', 'kind': 'aside', 'page': 103, 'section': 'مدخل الباب', 'title': 'طالس', 'verified': True,
    'text': 'يُعتبر طالس أحد حكماء الإغريق السبعة والذي كان مهتما بدراسة الهندسة وله العديد من الأعمال العلمية منها: - مبرهنة حول نسب بين أطوال قطع المستقيمين المتقاطعين في نقطة عندما يقطعهما مستقيمان متوازيان. - قياس ارتفاع أهرامات مصر بطريقة الظل.',
    'caption': 'صورة: تمثال طالس «طالس 625-546 ق م» (صورة في الكتاب — لا تُنسخ).',
})
CH_STICK, CH_D, CH_TOTAL = D(1), D(10), D('11.6')
CH_H = CH_STICK * CH_TOTAL / (CH_TOTAL - CH_D)
assert CH_H == D('7.25')
E.append({
    'id': 'challenge', 'kind': 'challenge', 'page': 103, 'section': 'تحدّ', 'verified': True,
    'text': 'في فترة معينة من يوم مشمس، تساءل فريد عن ارتفاع مئذنة المسجد الموجود بالحي الذي يسكن فيه. اقترح عليه مقران طريقة مكّنتهما من رسم الشكل المقابل ببعض القياسات. اشرح الطريقة المقترحة ثم ساعدهما على إيجاد ارتفاع المئذنة.',
    'figure': 'مئذنة (ارتفاعها مجهول، خط متقطع) وعصا طولها 1m على بعد 10m من قاعدة المئذنة ؛ شعاع الشمس المار برأس المئذنة يمر برأس العصا ويصل الأرض على بعد 11,6m من قاعدة المئذنة (نهاية ظل المئذنة = نهاية ظل العصا). في الكتاب خط رفيع ثانٍ من قاعدة المئذنة إلى رأس قطعة طولها 1m عند 11,6m لا تستعمله الطريقة.',
    'answer': {'method': 'نغرس عصا شاقولية بحيث تنطبق نهاية ظلها على نهاية ظل المئذنة: المئذنة والعصا متوازيتان (شاقوليتان) فالمثلثان في وضعية طالس.',
               'shadowStick': '11{,}6 - 10 = 1{,}6',
               'equation': '\\dfrac{h}{1} = \\dfrac{11{,}6}{1{,}6}', 'h': fmt(CH_H), 'unit': 'm'},
    'answerSource': 'computed',
})

# ── أستعدّ ───────────────────────────────────────────────────────────────────
assert fourth(D(3), D(4), D('1.5')) == 2          # 3/4 = 1,5/x ⇒ x = 2
P4_AD, P4_DC, P4_CE, P4_AB = 3, 6, 8, 7
P4_CB = F(P4_CE) * (P4_AD + P4_DC) / P4_DC          # CD/CA = CE/CB
assert P4_CB == 12 and P4_CB - P4_CE == 4
E.append({
    'id': 'prep', 'kind': 'prep', 'page': 103, 'section': 'أستعدّ', 'verified': True,
    'instruction': 'أصحيح أم خاطئ؟ برّر إجابتك.',
    'items': [
        {'number': 1, 'text': 'من المساواة $\\dfrac{3}{4} = \\dfrac{1{,}5}{x}$ ينتج أن $x = 2$ .', 'answer': True,
         'why': '$3 \\times x = 4 \\times 1{,}5 = 6$ إذن $x = 2$ .'},
        {'number': 2, 'text': 'ABC مثلث. I منتصف [AB] و J منتصف [AC]. ينتج أن (IJ)//(BC).', 'answer': True,
         'why': 'المستقيم الذي يشمل منتصفي ضلعين في مثلث يوازي حامل الضلع الثالث.'},
        {'number': 3, 'text': 'ABC مثلث. I منتصف [AB] و J منتصف [AC]. ينتج أن $IJ = \\dfrac{1}{2}BC$ .', 'answer': True,
         'why': 'طول القطعة الواصلة بين منتصفي ضلعين في مثلث يساوي نصف طول الضلع الثالث.'},
        {'number': 4, 'text': 'ABC مثلث حيث (AB)//(DE). إذن BE = 4.', 'answer': True,
         'figure': 'D من [AC] و E من [BC] ؛ AD = 3 ، DC = 6 ، CE = 8 ، AB = 7.',
         'why': '$\\dfrac{CD}{CA} = \\dfrac{CE}{CB}$ أي $\\dfrac{6}{9} = \\dfrac{8}{CB}$ إذن $CB = 12$ و $BE = 12 - 8 = 4$ (الطول AB = 7 لا يُستعمل).'},
        {'number': 5, 'text': 'في الشكل المقابل حيث (CE)//(DF) ينتج: أطوال المثلث ACE متناسبة مع أطوال المثلث ADE.',
         'figure': 'مستقيمان متقاطعان في A: النقط A، C، D على استقامة و النقط A، E، F على استقامة ؛ (CE)//(DF).',
         'correction': {'decidedBy': 'platform', 'decidedOn': '2026-10-02',
                        'printed': 'متناسبة مع أطوال المثلث ADE', 'corrected': 'متناسبة مع أطوال المثلث ADF',
                        'note': 'المثلث ADE ليس في وضعية طالس مع المثلث ACE ؛ المثلث الذي ضلعه (DF) هو ADF.'},
         'answer': True,
         'why': 'C من (AD) و E من (AF) و (CE)//(DF): المثلثان ACE و ADF في وضعية طالس فأطوال أضلاعهما متناسبة.'},
    ],
})

# ── نشاط 1 : خاصية طالس ─────────────────────────────────────────────────────
A1 = {'AB': D(6), 'AC': D(7), 'ABp': D('3.2'), 'BC': D('6.1')}
A1_k = A1['ABp'] / A1['AB']
A1_ACp, A1_BpCp = A1_k * A1['AC'], A1_k * A1['BC']
assert A1_ACp == F(56, 15) and A1_BpCp == F(244, 75)
A1b = {'AB': D('3.2'), 'AC': D('4.5'), 'BC': D(3), 'ABp': D('1.6')}
A1b_k = A1b['ABp'] / A1b['AB']
assert A1b_k == F(1, 2) and A1b_k * A1b['AC'] == D('2.25') and A1b_k * A1b['BC'] == D('1.5')
E.append({
    'id': 'act-1', 'kind': 'activity', 'number': 1, 'page': 104, 'section': 'أنشطة', 'title': 'خاصية طالس', 'verified': True,
    'parts': [
        {'label': '1) الحالة الأولى',
         'text': '(d) و (d′) مستقيمان متقاطعان في النقطة A. B نقطة من (d) و C نقطة من (d′)، تختلفان عن A. B′ نقطة من [AB] و C′ نقطة من [AC] بحيث (B′C′)//(BC)، كما في الشكل. انقل وأتمم: $\\dfrac{AB\'}{AB} = \\dfrac{\\ldots}{\\ldots} = \\dfrac{\\ldots}{\\ldots}$',
         'figure': 'A رأس مشترك، B′ بين A و B على (d)، C′ بين A و C على (d′)، (B′C′)//(BC).',
         'numeric': ['نفرض أن AB = 6cm ، AC = 7cm و AB′ = 3,2cm. احسب AC′.', 'إذا كان BC = 6,1cm، احسب B′C′.']},
        {'label': '2) الحالة الثانية',
         'text': 'لاحظ وضعية النقط A، B، B′ و النقط A، C، C′ في الشكل المرفق. أ) أنشئ النقطتين B″ و C″ نظيرتي النقطتين B′ و C′ على الترتيب بالنسبة إلى A. ب) علما أن (B′C′)//(BC)، برّر توازي المستقيمين (BC) و (B″C″). جـ) اشرح لماذا $\\dfrac{AB\'\'}{AB} = \\dfrac{AC\'\'}{AC} = \\dfrac{B\'\'C\'\'}{BC}$ . د) استنتج أن $\\dfrac{AB\'}{AB} = \\dfrac{AC\'}{AC} = \\dfrac{B\'C\'}{BC}$ .',
         'figure': 'B′ و C′ من الجهة الأخرى للنقطة A بالنسبة إلى B و C (وضعية «الفراشة»)، (B′C′)//(BC).',
         'numeric': ['نفرض أن AB = 3,2cm ، AC = 4,5cm و BC = 3cm. احسب AC′ علما أن AB′ = 1,6cm.', 'استنتج قيمة B′C′.']},
        {'label': '3)',
         'text': 'انقل ما يلي وأتمم: « A، B، B′ تقع على استقامية والنقط A، C، C′ تقع كذلك على استقامية. إذا كان المستقيمان (BC) و … متوازيين فإن $\\dfrac{\\ldots}{AB} = \\dfrac{AC\'}{\\ldots} = \\dfrac{\\ldots}{BC}$ ». يسمى هذا النص «خاصية طالس».'},
    ],
    'answer': {'case1': {'ratios': '\\dfrac{AB\'}{AB} = \\dfrac{AC\'}{AC} = \\dfrac{B\'C\'}{BC}', 'k': fmt(A1_k),
                         'ACp': fmt(A1_ACp), 'ACpApprox': '3{,}73', 'BpCp': fmt(A1_BpCp), 'BpCpApprox': '3{,}25'},
               'case2': {'k': fmt(A1b_k), 'ACp': fmt(A1b_k * A1b['AC']), 'BpCp': fmt(A1b_k * A1b['BC']),
                         'why': 'B″C″ نظيرة B′C′ بالنسبة إلى A ، والتناظر المركزي يحوّل مستقيما إلى مستقيم يوازيه ويحفظ الأطوال.'},
               'statement': 'إذا كان المستقيمان (BC) و (B′C′) متوازيين فإن $\\dfrac{AB\'}{AB} = \\dfrac{AC\'}{AC} = \\dfrac{B\'C\'}{BC}$'},
    'answerSource': 'computed',
})

# ── نشاط 2 : الخاصية العكسية ─────────────────────────────────────────────────
E.append({
    'id': 'act-2', 'kind': 'activity', 'number': 2, 'page': 105, 'section': 'أنشطة', 'title': 'الخاصية العكسية لخاصية طالس', 'verified': True,
    'parts': [
        {'label': '1)',
         'text': 'في الشكل المقابل، (d) و (d′) مستقيمان متقاطعان في نقطة A. B نقطة من (d) و C نقطة من (d′). طلب الأستاذ من تلاميذه تعيين نقطتين B′ من (d) و C′ من (d′) بحيث $\\dfrac{AB\'}{AB} = \\dfrac{AC\'}{AC} = \\dfrac{1}{3}$ . إليك الأشكال 1 ، 2 ، 3 المُنجزة من طرف ثلاثة تلاميذ. أ) اشرح توافق الأشكال 1، 2 و 3 مع الشروط السابقة. ب) هل في كل شكل من الأشكال 1، 2 و 3، (BC) و (B′C′) متوازيان؟ (يمكنك التحقق باستعمال الأدوات الهندسية).',
         'figures': {'1': 'B′ و C′ كلتاهما من الجهة الأخرى للنقطة A (عكس B و C) ، AB′ = AB/3 و AC′ = AC/3.',
                     '2': 'B′ بين A و B و C′ بين A و C ، AB′ = AB/3 و AC′ = AC/3.',
                     '3': 'B′ بين A و B لكن C′ من الجهة الأخرى للنقطة A ، AB′ = AB/3 و AC′ = AC/3.'}},
        {'label': '2)',
         'text': 'انقل وأتمم «النقط A، B، B′ تقع في استقامية والنقط A، C، C′ تقع أيضا في استقامية وكذلك النقط A، B، B′ مرتبة بنفس ترتيب النقط A، C، C′. إذا كان $\\dfrac{\\ldots}{AB} = \\dfrac{\\ldots}{AC}$ فإن المستقيمين (BC) و (B′C′) …». هذا النص يسمى «الخاصية العكسية لخاصية طالس».'},
        {'label': 'ملاحظة',
         'text': 'النقط A، B، B′ مرتبة بنفس ترتيب النقط A، C، C′ يعني أيضا أن موقع B′ بالنسبة إلى A و B يماثل موقع C′ بالنسبة إلى A و C. يمكن التعبير عن هذه الوضعية بتنظيم الرؤوس كما يلي:',
         'tables': [['A', 'B', 'B′', 'A', 'C', 'C′'], ['B', 'B′', 'A', 'C', 'C′', 'A'], ['B', 'A', 'B′', 'C', 'A', 'C′']],
         'tail': '… إلخ'},
    ],
    'answer': {'a': 'في الأشكال الثلاثة: B′ من (d) و C′ من (d′) و $AB\' = \\dfrac{1}{3}AB$ و $AC\' = \\dfrac{1}{3}AC$ .',
               'b': {'1': 'متوازيان', '2': 'متوازيان', '3': 'غير متوازيين — النقط ليست مرتبة بنفس الترتيب'},
               'statement': 'إذا كان $\\dfrac{AB\'}{AB} = \\dfrac{AC\'}{AC}$ فإن المستقيمين (BC) و (B′C′) متوازيان.'},
    'answerSource': 'computed',
})

# ── معارف ────────────────────────────────────────────────────────────────────
K1_AN, K1_AM, K1_AB, K1_AC = 1, 2, 3, 2
assert F(K1_AM, K1_AB) != F(K1_AN, K1_AC)
E.append({
    'id': 'know-1', 'kind': 'knowledge', 'number': 1, 'page': 106, 'section': 'معارف', 'title': 'خاصية طالس', 'verified': True,
    'property': '(BM) و (CN) مستقيمان متقاطعان في النقطة A. إذا كان (MN) و (BC) متوازيين فإنّ $\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}$ .',
    'figures': 'ثلاث وضعيات: M و N على [AB] و [AC] ؛ M و N على امتداد [AB] و [AC] بعد B و C ؛ M و N من الجهة الأخرى للنقطة A.',
    'results': 'الجدول الآتي هو جدول تناسبية: أطوال أضلاع المثلث AMN : AM ، AN ، MN — أطوال أضلاع المثلث ABC : AB ، AC ، BC. والمثلث AMN هو تكبير أو تصغير للمثلث ABC.',
    'remarks': [
        {'number': 1, 'text': '(BM) و (CN) مستقيمان متقاطعان في النقطة A. يكفي عدم تساوي نسبتين من النسب $\\dfrac{AM}{AB}$ ، $\\dfrac{AN}{AC}$ و $\\dfrac{MN}{BC}$ للقول أنّ المستقيمين (MN) و (BC) غير متوازيين.',
         'figure': 'وضعية الفراشة: AN = 1 ، AM = 2 ، AB = 3 ، AC = 2.',
         'answer': '$\\dfrac{AM}{AB} = \\dfrac{2}{3}$ و $\\dfrac{AN}{AC} = \\dfrac{1}{2}$ : النسبتان مختلفتان، (MN) و (BC) غير متوازيين.'},
        {'number': 2, 'text': 'تسمح خاصية طالس بحساب الأطوال والنسب وإثبات عدم توازي مستقيمين.'},
    ],
})
E.append({
    'id': 'know-2', 'kind': 'knowledge', 'number': 2, 'page': 106, 'section': 'معارف', 'title': 'خاصية طالس وتناسب الأطوال', 'verified': True,
    'text': 'ABC و AB′C′ مثلثان في وضعية طالس. • لاستنتاج الأطوال المتناسبة في المثلثين ننظم رؤوسهما كالآتي: (A B C / A B′ C′) • ثم ننشئ جدول التناسبية التالي: (AB AC BC / AB′ AC′ B′C′) ×k. معامل التناسبية هو العدد الموجب تماما k. ولدينا AB′ = k × AB و AC′ = k × AC و B′C′ = k × BC. في الحالة k < 1 : k هو معامل التصغير والمثلث AB′C′ تصغير للمثلث ABC. في الحالة k > 1 : k هو معامل التكبير والمثلث AB′C′ تكبير للمثلث ABC.',
    'example': {
        'text': 'المثلثان AMN و ABC في وضعية طالس. لدينا $\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{AC} = \\dfrac{1}{3}$ ومنه $AM = \\dfrac{1}{3}AB$ و $AN = \\dfrac{1}{3}AC$ و $MN = \\dfrac{1}{3}BC$ . لدينا معامل التناسبية هو $\\dfrac{1}{3}$ إذن المثلث AMN هو تصغير للمثلث ABC.',
        'figure': '[AB] مقسمة إلى ثلاث قطع متقايسة و M أولى نقاط التقسيم من A ؛ [AC] كذلك و N أولى نقاطها.',
        'correction': {'decidedBy': 'platform', 'decidedOn': '2026-10-02',
                       'printed': '\\dfrac{MN}{AC}', 'corrected': '\\dfrac{MN}{BC}',
                       'note': 'النسبة الثالثة تقارن الضلعين المتوازيين MN و BC ؛ والسطر الموالي نفسه يكتب $MN = \\dfrac{1}{3}BC$ .'},
    },
})

# ── طرائق : حساب أطوال ──────────────────────────────────────────────────────
M1_AB, M1_BC, M1_AM = 5, 3, 2
M1_MD = M1_BC - M1_AM
M1_DN = F(M1_AB) * M1_MD / M1_AM
assert M1_MD == 1 and M1_DN == D('2.5')
E.append({
    'id': 'method-lengths', 'kind': 'method', 'page': 107, 'section': 'طرائق', 'title': 'حساب أطوال', 'verified': True,
    'exercise': 'ABCD متوازي أضلاع حيث AB = 5 و BC = 3 (الوحدة 1cm). M نقطة من القطعة [AD] حيث AM = 2. المستقيم (BM) يقطع المستقيم (DC) في N. انجز شكلا مناسبا ثم احسب DN.',
    'solution': ['حساب DN: لدينا (AB)//(CD) (لأنّ ABCD متوازي أضلاع)، بما أن N تقع على (DC) إذن (DN)//(AB)، ينتج أنّ المثلثين MAB و MDN في وضعية طالس، وبالتالي يكون $\\dfrac{MA}{MD} = \\dfrac{MB}{MN} = \\dfrac{AB}{DN}$ .',
                 'نحتفظ بالمساواة المناسبة $\\dfrac{MA}{MD} = \\dfrac{AB}{DN}$',
                 'أي $\\dfrac{1}{2} = \\dfrac{5}{DN}$ ومنه $DN = \\dfrac{5}{2} = 2{,}5$ .'],
    'correction': {'decidedBy': 'platform', 'decidedOn': '2026-10-02',
                   'printed': '\\dfrac{1}{2} = \\dfrac{5}{DN}', 'corrected': '\\dfrac{2}{1} = \\dfrac{5}{DN}',
                   'note': '$MA = 2$ و $MD = AD - AM = 3 - 2 = 1$ ، إذن $\\dfrac{MA}{MD} = \\dfrac{2}{1}$ ؛ النسبة المطبوعة مقلوبة لكن النتيجة $DN = 2{,}5$ صحيحة.'},
    'answer': {'MD': str(M1_MD), 'DN': fmt(M1_DN)},
})

# ── طرائق : إنشاء قطعة مستقيم طولها معلوم ───────────────────────────────────
assert F(7) * 2 / 3 == F(14, 3)
E.append({
    'id': 'method-construct-length', 'kind': 'method', 'page': 107, 'section': 'طرائق', 'title': 'إنشاء قطعة مستقيم طولها معلوم', 'verified': True,
    'exercise': '(وحدة الأطوال هي السنتيمتر) أنشئ قطعة مستقيم [AB] بحيث يكون $AB = \\dfrac{14}{3}$ .',
    'solution': ['ملاحظة: يمكن كتابة $AB = \\dfrac{14}{3}$ على الشكل $3 \\times AB = 7 \\times 2$ ثم على شكل تناسب $\\dfrac{3}{7} = \\dfrac{2}{AB}$ وتوظيف خاصية طالس.',
                 'نرسم نصفي مستقيمين [Ax) و [Ay)، ونعيّن على [Ax) نقطتين C و D حيث AC = 3 و AD = 7. كما نعيّن على [Ay) نقطة E حيث AE = 2.',
                 'نرسم الموازي للمستقيم (CE) الذي يشمل D فيقطع [Ay) في نقطة B.',
                 'إنّ $AB = \\dfrac{14}{3}$ (ويمكن تبرير ذلك باستعمال خاصية طالس).'],
    'answer': {'why': '(CE)//(DB) و C من [AD] و E من [AB] : $\\dfrac{AC}{AD} = \\dfrac{AE}{AB}$ أي $\\dfrac{3}{7} = \\dfrac{2}{AB}$ ومنه $AB = \\dfrac{14}{3}$ .'},
})

# ── طرائق : تقسيم قطعة مستقيمة ──────────────────────────────────────────────
E.append({
    'id': 'method-divide', 'kind': 'method', 'page': 107, 'section': 'طرائق', 'title': 'تقسيم قطعة مستقيمة', 'verified': True,
    'exercise': 'ABC مثلث. D هي نظيرة B بالنسبة إلى C و E نظيرة C بالنسبة إلى D. قسّم الضلع [AB] إلى 3 قطع متقايسة.',
    'solution': ['المستقيم الذي يشمل C و يوازي (AE) يقطع (AB) في M. المستقيم الذي يشمل D و يوازي (AE) يقطع (AB) في N.',
                 '• المثلثان BCM و BEA في وضعية طالس إذن $\\dfrac{BM}{BA} = \\dfrac{BC}{BE} = \\dfrac{1}{3}$ ومنه $BM = \\dfrac{BA}{3}$ (*)',
                 '• المثلثان BDN و BEA في وضعية طالس إذن $\\dfrac{BN}{BA} = \\dfrac{BD}{BE} = \\dfrac{2}{3}$ ومنه $BN = \\dfrac{2BA}{3}$',
                 '• لدينا $NA = BA - BN = BA - \\dfrac{2BA}{3} = \\dfrac{BA}{3}$ (**)',
                 '• لدينا C منتصف [BD] و (MC)//(ND) إذن M منتصف [BN] ومنه BM = MN (***)',
                 'من (*) و (**) و (***) نستنتج أنّ $BM = MN = NA = \\dfrac{BA}{3}$ . و هكذا قسمنا الضلع [AB] إلى 3 قطع متقايسة.'],
    'figure': 'B ، C ، D ، E على استقامة بهذا الترتيب و BC = CD = DE ؛ الموازيان لـ (AE) المارّان بـ C و D يقطعان [AB] في M و N.',
})
NOW107 = {'EV': D('2.25'), 'EU': D('3.75'), 'ET': D('5.25')}
NOW107_EW = NOW107['EV'] * NOW107['ET'] / NOW107['EU']
assert NOW107_EW == D('3.15')
E.append({
    'id': 'now-107', 'kind': 'now', 'page': 107, 'section': 'دوري الآن', 'verified': True,
    'text': 'في الشكل المقابل المستقيمان (UT) و (VW) متقاطعان في النقطة E. والمستقيمان (UV) و (WT) متوازيان. احسب الطول EW.',
    'figure': 'U ، E ، T على استقامة و V ، E ، W على استقامة (E بين النقطتين في كل مرة) ؛ EV = 2,25 ، EU = 3,75 ، ET = 5,25.',
    'answer': {'equation': '\\dfrac{EW}{EV} = \\dfrac{ET}{EU}', 'EW': fmt(NOW107_EW)},
    'answerSource': 'computed',
})

# ── معارف : الخاصية العكسية ─────────────────────────────────────────────────
assert F(3) / D('2.4') == D('1.25') == F(5, 4)
E.append({
    'id': 'know-3', 'kind': 'knowledge', 'number': 3, 'page': 108, 'section': 'معارف', 'title': 'الخاصية العكسية لخاصية طالس', 'verified': True,
    'property': '(d) و (d′) مستقيمان متقاطعان في النقطة A. B و B′ نقطتان من (d) تختلفان عن A. C و C′ نقطتان من (d′) تختلفان عن A. إذا كان $\\dfrac{AB\'}{AB} = \\dfrac{AC\'}{AC}$ وكانت النقط A، B، B′ و النقط A، C، C′ مرتبة بنفس الترتيب فإن المستقيمين (BC) و (B′C′) متوازيان.',
    'figures': 'يمكن ترجمة هذه الخاصية بإحدى الوضعيتين التاليتين: B′ و C′ بين A و B ، A و C — أو B′ و C′ من الجهة الأخرى للنقطة A.',
    'remark': {'text': 'في الشكل المقابل، لدينا $\\dfrac{AB\'}{AB} = \\dfrac{AC\'}{AC} = \\dfrac{1}{2}$ . النقط A، B، B′ تقع على استقامة واحدة والنقط A، C، C′ تقع أيضا على استقامة واحدة. هذه النقط ليست مرتبة بنفس الترتيب. ينتج أن المستقيمين (BC) و (B′C′) غير متوازيين.',
               'figure': 'B′ من الجهة الأخرى للنقطة A بالنسبة إلى B ، و C′ منتصف [AC].'},
    'example': {'text': 'في الشكل المقابل لدينا $\\dfrac{OM}{OR} = \\dfrac{3}{2{,}4} = 1{,}25$ و $\\dfrac{ON}{OP} = \\dfrac{5}{4} = 1{,}25$ إذن $\\dfrac{OM}{OR} = \\dfrac{ON}{OP}$ . و بما أن النقط N، P، O و النقط M، R، O مرتبة بنفس الترتيب فإن (MN)//(PR).',
                'figure': 'M ، O ، R على استقامة و N ، O ، P على استقامة (O بين النقطتين) ؛ OM = 3 ، OR = 2,4 ، ON = 5 ، OP = 4.'},
})

# ── طرائق : إثبات توازي (أو عدم توازي) مستقيمين ─────────────────────────────
MP = {'AB': D('3.2'), 'AD': D('3.5'), 'DC': D('1.8'), 'DF': D('1.5'), 'AE': D('4.6'), 'BD': D('4.2')}
assert MP['AD'] * MP['DC'] == MP['DF'] * MP['BD'] == D('6.3')
assert MP['AB'] * (MP['AD'] + MP['DF']) == 16 and MP['AE'] * MP['AD'] == D('16.1')
E.append({
    'id': 'method-parallel', 'kind': 'method', 'page': 109, 'section': 'طرائق', 'title': 'إثبات توازي (أو عدم توازي) مستقيمين', 'verified': True,
    'exercise': 'في الشكل المقابل نُعطى: AB = 3,2cm ، AD = 3,5cm ، DC = 1,8cm ، DF = 1,5cm ، AE = 4,6cm ، BD = 4,2cm. 1) بيّن أنّ المستقيمين (AB) و (CF) متوازيان؟ 2) هل المستقيمان (BD) و (EF) متوازيان؟',
    'figure': 'A ، B ، E على استقامة (B بين A و E) ؛ A ، D ، F على استقامة (D بين A و F) ؛ B ، D ، C على استقامة (D بين B و C).',
    'solution': ['1) • النقاط A، D، F والنقاط B، D، C في استقامية وبنفس الترتيب.',
                 '• $\\dfrac{DA}{DF} = \\dfrac{3{,}5}{1{,}5}$ و $\\dfrac{DB}{DC} = \\dfrac{4{,}2}{1{,}8}$ ولدينا $3{,}5 \\times 1{,}8 = 6{,}3$ و $1{,}5 \\times 4{,}2 = 6{,}3$ إذن $\\dfrac{DA}{DF} = \\dfrac{DB}{DC}$ .',
                 '• على المستقيمين (CB) و (FA) المتقاطعين في النقطة D، النقاط A، D، F من جهة والنقاط B، D، C من جهة أخرى في استقامية وبنفس الترتيب و $\\dfrac{DA}{DF} = \\dfrac{DB}{DC}$ فحسب الخاصية العكسية لطالس نستنتج أنّ (CF)//(AB).',
                 '2) • النقاط E، B، A والنقاط F، D، A في استقامية وبنفس الترتيب.',
                 '• $\\dfrac{AB}{AE} = \\dfrac{3{,}2}{4{,}6}$ و $\\dfrac{AD}{AF} = \\dfrac{3{,}5}{3{,}5 + 1{,}5} = \\dfrac{3{,}5}{5}$ ولدينا $3{,}2 \\times 5 = 16$ و $4{,}6 \\times 3{,}5 = 16{,}1$ إذن $\\dfrac{AB}{AE} \\neq \\dfrac{AD}{AF}$ .',
                 '• لو كان المستقيمان (BD) و (EF) متوازيين لكان $\\dfrac{AB}{AE} = \\dfrac{AD}{AF}$ حسب خاصية طالس، لكن المساواة خاطئة، إذن المستقيمان (BD) و (EF) غير متوازيين.'],
})
E.append({
    'id': 'method-ratio-point', 'kind': 'method', 'page': 109, 'section': 'طرائق', 'title': 'إنشاء النقطة التي تقسم قطعة مستقيم إلى نسبة معلومة', 'verified': True,
    'exercise': '[AB] قطعة مستقيم. أنشئ نقطة M من القطعة [AB] حيث $\\dfrac{MA}{MB} = \\dfrac{3}{2}$ . (استعمل مسطرة غير مدرّجة ومدور)',
    'solution': ['نرسم مستقيمين (d₁) و (d₂) متوازيين ويشملان النقطتين A و B على الترتيب ومدرجين بانتظام وبنفس الوحدة.',
                 'للحصول على وضعية طالس يكفي تعيين نقطة E على (d₂) بحيث BE = 2 ونقطتين K و F على (d₁) بحيث AK = AF = 3.',
                 'لدينا (EF) يقطع (AB) في M.',
                 'بتطبيق خاصية طالس في المثلثين MAF و MBE ينتج أن $\\dfrac{MA}{MB} = \\dfrac{AF}{EB} = \\dfrac{3}{2}$ .',
                 'وبالتالي M هي النقطة من [AB] تقسم [AB] في النسبة $\\dfrac{3}{2}$ .'],
    'figure': 'F و E من جهتين مختلفتين للمستقيم (AB) ؛ K على (d₁) من جهة E (تعطي (EK) نقطة خارج [AB]).',
})
E.append({
    'id': 'now-109', 'kind': 'now', 'page': 109, 'section': 'دوري الآن', 'verified': True,
    'text': '(xy) مستقيم، A و B نقطتان منه. استعمل مسطرة غير مدرّجة ومدور لإنشاء نقطة C من المستقيم (xy) حيث $\\dfrac{CA}{CB} = \\dfrac{2}{5}$ .',
    'answer': {'hint': 'موازيان مدرّجان بنفس الوحدة يشملان A و B: AF = 2 من جهة و BE = 5 من الجهة الأخرى يعطيان C بين A و B ؛ و AK = 2 من جهة E تعطي نقطة ثانية خارج [AB] .',
               'positions': {'inside': 'AC = \\dfrac{2}{7}AB', 'outside': 'AC = \\dfrac{2}{3}AB'}},
    'answerSource': 'computed',
})


# ── أوظّف تعلّماتي ───────────────────────────────────────────────────────────
def ex(n, page, text, sub=None, **kw):
    e = {'id': f'ex-{n}', 'kind': 'exercise', 'number': n, 'page': page, 'section': sub or 'أوظّف تعلّماتي', 'verified': True, 'text': text}
    e.update(kw)
    if 'answer' in e:
        e.setdefault('answerSource', 'computed')
    return e


T = 'خاصية طالس'
E.append(ex(1, 110, 'في الشكل المقابل، المستقيمان (AB) و (EF) متوازيان. 1) اذكر المثلثين اللذين أطوال أحدهما متناسبة مع أطوال أضلاع الآخر. 2) استنتج كل النسب المتساوية.', T,
            figure='(AE) و (BF) يتقاطعان في O ، A و B من جهة و E و F من الجهة الأخرى ؛ (AB)//(EF).',
            answer={'triangles': 'OAB و OEF', 'ratios': '\\dfrac{OA}{OE} = \\dfrac{OB}{OF} = \\dfrac{AB}{EF}'}))
X2 = {'AC': D('4.5'), 'AF': D(9), 'AB': D(3), 'BE': D(3), 'FE': D(10)}
assert X2['AC'] / X2['AF'] == X2['AB'] / (X2['AB'] + X2['BE']) == F(1, 2)
E.append(ex(2, 110, 'في الشكل المقابل، (EF) يوازي (BC). احسب BC.', T,
            figure='A ، C ، F على استقامة و A ، B ، E على استقامة ؛ AC = 4,5 ، AF = 9 ، AB = 3 ، BE = 3 ، FE = 10.',
            answer={'k': '\\dfrac{1}{2}', 'BC': fmt(X2['FE'] / 2)}))
E.append(ex(3, 110, 'برّر أنّه في كل شكل من الأشكال الأربعة الآتية يمكن تطبيق خاصية طاليس ثم اكتب النسب الثلاث المتساوية.', T,
            figures={'1': '(AD)//(EB) ؛ (AB) و (ED) يتقاطعان في C.',
                     '2': 'I ، H ، F على استقامة ؛ (HJ) و (FG) عموديان على (IF) في H و F ؛ I ، J ، G على استقامة.',
                     '3': 'S ، K′ ، K على استقامة و K ، L ، M على استقامة ؛ الزاويتان المعلّمتان في L و M متقايستان (متماثلتان) فـ (K′L)//(SM).',
                     '4': 'N ، O ، R على استقامة و P ، O ، Q على استقامة ؛ $\\widehat{NPO} = 40°$ ، $\\widehat{NOP} = 35°$ ، $\\widehat{ORQ} = 105°$ .'},
            answer={'1': '\\dfrac{CA}{CB} = \\dfrac{CD}{CE} = \\dfrac{AD}{BE}',
                    '2': '(HJ)//(FG) لأنهما عموديان على (IF) ؛ \\dfrac{IH}{IF} = \\dfrac{IJ}{IG} = \\dfrac{HJ}{FG}',
                    '3': '\\dfrac{KK\'}{KS} = \\dfrac{KL}{KM} = \\dfrac{K\'L}{SM}',
                    '4': '\\widehat{PNO} = 180° - 40° - 35° = 105° = \\widehat{ORQ} (زاويتان متبادلتان داخليا) إذن (PN)//(QR) ؛ \\dfrac{OP}{OQ} = \\dfrac{ON}{OR} = \\dfrac{PN}{QR}'}))
assert 180 - 40 - 35 == 105
X4 = {'AB': 4, 'OA': 3, 'OB': 2, 'OC': 5}
X4_OD, X4_CD = fourth(X4['OA'], X4['OC'], X4['OB']), fourth(X4['OA'], X4['OC'], X4['AB'])
assert X4_OD == F(10, 3) and X4_CD == F(20, 3)
E.append(ex(4, 110, 'في الرباعي ABCD الآتي، (AB) و (CD) متوازيان. (AC) و (BD) يتقاطعان في النقطة O. 1) احسب القيمتين المضبوطتين لكل من OD و CD. 2) جد المدوّر إلى الجزء من 10 لكل من OD و CD.', T,
            figure='AB = 4 ، OA = 3 ، OB = 2 ، OC = 5.',
            answer={'OD': fmt(X4_OD), 'CD': fmt(X4_CD), 'ODRound': '3{,}3', 'CDRound': '6{,}7'}))
X5 = {'EF': D(2), 'OE': D('1.3'), 'OG': D(4), 'OH': D('3.9')}
X5_k = X5['OH'] / X5['OE']
assert X5_k == 3 and X5['OG'] / X5_k == F(4, 3) and X5_k * X5['EF'] == 6
E.append(ex(5, 110, 'الأطوال في الشكل هي بالسنتيمتر وليست حقيقية. المستقيمان (GF) و (EH) متقاطعان في O. المستقيمان (EF) و (GH) متوازيان. أ) احسب كُلّا من الطولين OF و GH. ب) أيّ من المثلثين OEF و OGH يمثل تكبيرا للآخر؟ اذكر معامل التكبير.', T,
            figure='E ، O ، H على استقامة و F ، O ، G على استقامة ؛ EF = 2 ، OE = 1,3 ، OG = 4 ، OH = 3,9.',
            answer={'OF': fmt(X5['OG'] / X5_k), 'GH': fmt(X5_k * X5['EF']), 'enlargement': 'OGH تكبير للمثلث OEF', 'k': '3'}))
X6 = {'BE': 12, 'BM': 9, 'EM': 6, 'EK': 4}
X6_BK = X6['BE'] - X6['EK']
X6_k = F(X6_BK, X6['BE'])
X6_per = X6_k * (X6['BE'] + X6['BM'] + X6['EM'])
assert X6_k == F(2, 3) and X6_per == 18 and X6_k * X6['BM'] == 6 and X6_k * X6['EM'] == 4
E.append(ex(6, 110, 'BEM مثلث حيث BE = 12cm ، BM = 9cm و EM = 6cm. K هي نقطة من [BE] حيث EK = 4cm والمستقيم الذي يشمل K ويوازي (EM) يقطع (BM) في L. 1) أنجز شكلا مناسبا. 2) احسب محيط المثلث BKL.', T,
            answer={'BK': str(X6_BK), 'k': '\\dfrac{2}{3}', 'BL': '6', 'KL': '4', 'perimeter': fmt(X6_per)}))
X7 = {'AB': 4, 'AC': 5, 'BC': 6, 'BI': 1, 'CJ': 1}
assert F(X7['AB'] - X7['BI'], X7['AB']) == F(3, 4) and F(X7['AC'] - X7['CJ'], X7['AC']) == F(4, 5)
E.append(ex(7, 110, '1) أ) ارسم مثلثا ABC حيث AB = 4cm ، AC = 5cm ، BC = 6cm. ب) علّم النقطتين I و J حيث: I ∈ [AB] ، J ∈ [AC] و BI = CJ = 1cm. 2) يبدو أنّ المستقيمين (IJ) و (BC) متوازيان، هل هذا صحيح؟ برّر جوابك.', T,
            answer={'AI/AB': '\\dfrac{3}{4}', 'AJ/AC': '\\dfrac{4}{5}', 'parallel': False,
                    'why': '$\\dfrac{3}{4} \\neq \\dfrac{4}{5}$ فالمستقيمان غير متوازيين (يكفي عدم تساوي نسبتين).'}))
X8 = {'AN': 15, 'AM': 9, 'AL': 6}
X8_AP = fourth(X8['AM'], X8['AN'], X8['AL'])
assert X8_AP == 10 and X8_AP - X8['AL'] == 4
E.append(ex(8, 110, 'وحدة الطول هي السنتيمتر: في الشكل المقابل (NP)//(ML) و (MN) و (LP) يتقاطعان في A. احسب كلا من الطولين AP و LP.', T,
            figure='A ، M ، N على استقامة (M بين A و N) و A ، L ، P على استقامة (L بين A و P) ؛ AN = 15 ، AM = 9 ، AL = 6.',
            answer={'AP': fmt(X8_AP), 'LP': fmt(X8_AP - X8['AL'])}))
X9 = {'AB': D('2.8'), 'AE': D('3.3'), 'ED': D(2), 'BD': D('4.5')}
assert X9['AB'] ** 2 + X9['BD'] ** 2 == (X9['AE'] + X9['ED']) ** 2
X9_AF = X9['BD'] * X9['AE'] / X9['ED']
assert X9_AF == D('7.425')
E.append(ex(9, 110, 'وحدة الطول هي السنتيمتر، والأطوال على الشكل ليست حقيقية. احسب AF.', T,
            figure='(AF) عمودي على (AB) في A ؛ A ، E ، D على استقامة و B ، E ، F على استقامة ؛ AB = 2,8 ، AE = 3,3 ، ED = 2 ، BD = 4,5. لا ترميز لزاوية قائمة في B.',
            answer={'pythagoras': '2{,}8^2 + 4{,}5^2 = 7{,}84 + 20{,}25 = 28{,}09 = 5{,}3^2 = AD^2',
                    'why': 'حسب عكس خاصية فيثاغورس المثلث ABD قائم في B ، إذن (BD) و (AF) عموديان على (AB) فهما متوازيان.',
                    'equation': '\\dfrac{AF}{BD} = \\dfrac{EA}{ED}', 'AF': fmt(X9_AF)}))

T2 = 'الخاصية العكسية لخاصية طالس'
X10 = {'CA': 2, 'CB': 4, 'CE': 3, 'CF': 6}
assert F(X10['CA'], X10['CE']) == F(X10['CB'], X10['CF'])
E.append(ex(10, 111, 'لاحظ الشكل المقابل. هل (AB) يوازي (EF)؟', T2,
            figure='A ، C ، E على استقامة و B ، C ، F على استقامة (C بين النقطتين في كل مرة) ؛ CA = 2 ، CB = 4 ، CE = 3 ، CF = 6.',
            answer={'ratios': '\\dfrac{CA}{CE} = \\dfrac{2}{3} = \\dfrac{4}{6} = \\dfrac{CB}{CF}', 'parallel': True}))
X11 = {'AB': 36, 'MB': 20, 'AN': 20, 'AC': 45}
assert F(X11['AB'] - X11['MB'], X11['AB']) == F(X11['AN'], X11['AC']) == F(4, 9)
E.append(ex(11, 111, 'لاحظ الشكل التالي: بيّن أنّ المستقيمين (MN) و (BC) متوازيان.', T2,
            figure='M من [AB] و N من [AC] ؛ AB = 36 ، MB = 20 ، AN = 20 ، AC = 45.',
            answer={'AM': '16', 'ratios': '\\dfrac{AM}{AB} = \\dfrac{16}{36} = \\dfrac{4}{9} = \\dfrac{20}{45} = \\dfrac{AN}{AC}', 'parallel': True}))
X12 = {'EA': D('1.2'), 'EC': D('1.8'), 'ED': D('3.2'), 'EB': D('4.8')}
assert X12['EA'] / X12['EC'] == X12['ED'] / X12['EB'] == F(2, 3)
E.append(ex(12, 111, 'لاحظ الشّكل المعطى: هل (BC) يوازي (AD)؟', T2,
            figure='A ، E ، C على استقامة و D ، E ، B على استقامة (E بين النقطتين في كل مرة) ؛ EA = 1,2 ، EC = 1,8 ، ED = 3,2 ، EB = 4,8.',
            answer={'ratios': '\\dfrac{EA}{EC} = \\dfrac{2}{3} = \\dfrac{ED}{EB}', 'parallel': True}))
X13 = {'AB': D(8), 'EB': D('2.4'), 'AD': D(6), 'AF': D('1.2')}
assert (X13['AB'] - X13['EB']) / X13['AB'] != X13['AF'] / X13['AD']
assert X13['EB'] / X13['AB'] != X13['AF'] / X13['AD']
E.append(ex(13, 111, 'لاحظ الشكل المعطى: هل (EF) يوازي (BD)؟', T2,
            figure='المثلث ABD قائم في A ؛ E من [AB] و F من [AD] ؛ AB = 8 ، EB = 2,4 (الوسم على [EB]) ، AD = 6 ، AF = 1,2.',
            answer={'ratios': '\\dfrac{AE}{AB} = \\dfrac{5{,}6}{8} = 0{,}7 \\neq 0{,}2 = \\dfrac{1{,}2}{6} = \\dfrac{AF}{AD}', 'parallel': False}))
X14 = {'OC': D(4), 'DC': D(5), 'OB': D('1.5'), 'AB': D('2.5')}
X14_OD = (X14['DC'] ** 2 - X14['OC'] ** 2)
X14_OA = (X14['AB'] ** 2 - X14['OB'] ** 2)
assert X14_OD == 9 and X14_OA == 4
assert F(2) / X14['OC'] == X14['OB'] / 3 == F(1, 2)
E.append(ex(14, 111, 'لاحظ الشكل المعطى: المستقيمان (d₁) و (d₂) متعامدان. هل (AB) يوازي (DC)؟', T2,
            figure='(d) و (d′) متعامدان في O ؛ A و C على المستقيم الأفقي من جهتي O ، D و B على المستقيم الشاقولي من جهتي O ؛ OC = 4 ، DC = 5 ، OB = 1,5 ، AB = 2,5.',
            answer={'OD': '3', 'OA': '2', 'ratios': '\\dfrac{OA}{OC} = \\dfrac{2}{4} = \\dfrac{1}{2} = \\dfrac{1{,}5}{3} = \\dfrac{OB}{OD}', 'parallel': True,
                    'note': 'OD و OA بخاصية فيثاغورس في المثلثين القائمين ODC و OAB.'}))
assert F(2, 10) == F(3, 15)
E.append(ex(15, 111, 'لاحظ الشكل المعطى ABCD مستطيل. برهن أن المستقيمين (MN) و (BD) متوازيان.', T2,
            figure='ABCD مستطيل (A أعلى اليسار، D أعلى اليمين، B أسفل اليسار، C أسفل اليمين) ؛ M من [AB] و N من [AD] ؛ AN = 3 ، AM = 2 ، DC = 10 ، BC = 15.',
            answer={'ratios': '\\dfrac{AM}{AB} = \\dfrac{2}{10} = \\dfrac{1}{5} = \\dfrac{3}{15} = \\dfrac{AN}{AD}', 'parallel': True}))
X16 = {'OM': D(9), 'ON': D(5), 'OP': D(3), 'OA': D('5.4')}
assert X16['ON'] / X16['OP'] == X16['OM'] / X16['OA'] == F(5, 3)
E.append(ex(16, 111, 'إليك الشكل المقابل. هل المستقيمان (MN) و (AP) متوازيان؟ إليك إجابتي التلميذين «يونس» و«إيناس». أيّ التلميذين على صواب؟', 'وضع نقط على مستقيم',
            figure='M ، O ، A على استقامة و N ، O ، P على استقامة (O بين النقطتين) ؛ OM = 9cm ، ON = 5cm ، OP = 3cm ، OA = 5,4cm.',
            answers={'يونس': 'النقط M، O، A والنقط N، O، P في استقامية وفي نفس الترتيب. $\\dfrac{ON}{OP} = \\dfrac{5}{3} \\approx 1{,}7$ و $\\dfrac{OM}{OA} = \\dfrac{9}{5{,}4} \\approx 1{,}7$ . حسب الخاصية العكسية لخاصية طالس، المستقيمات (MN) و (AP) متوازيات.',
                     'إيناس': 'النقط M، O، A والنقط N، O، P في استقامية وفي نفس الترتيب. $\\dfrac{OP}{ON} = \\dfrac{3}{5} = 0{,}6$ و $\\dfrac{OA}{OM} = \\dfrac{5{,}4}{9} = 0{,}6$ . حسب الخاصية العكسية لخاصية طالس، المستقيمات (MN) و (AP) متوازيات.'},
            answer={'right': 'إيناس', 'why': 'قيمتان مقرّبتان متساويتان (≈ 1,7) لا تثبتان تساوي نسبتين ؛ إيناس كتبت قيمتين مضبوطتين متساويتين (0,6). (النسبتان في الحقيقة متساويتان $\\dfrac{5}{3} = \\dfrac{9}{5{,}4}$ ، لكن تبرير يونس غير كاف.)'}))
E.append(ex(17, 111, 'ارسم قطعة مستقيم [AB]. أنشئ، دون استعمال مسطرة مدرجة، النقطة M من [AB] حيث $\\dfrac{AM}{AB} = \\dfrac{3}{7}$ .', 'وضع نقط على مستقيم',
            answer={'method': 'نصف مستقيم [Ax) نعيّن عليه بالمدور 7 قطع متقايسة ، نصل النقطة السابعة بـ B ، والموازي له المار بالنقطة الثالثة يقطع [AB] في M.'}))
E.append(ex(18, 111, 'ارسم مستقيما (AB). أنشئ، دون استعمال مسطرة مدرّجة، النقطة M من (AB) ولا تنتمي إلى [AB] حيث $\\dfrac{AM}{AB} = \\dfrac{4}{9}$ .', 'وضع نقط على مستقيم',
            answer={'method': 'على نصف مستقيم [Ax) نعيّن 9 قطع متقايسة ونصل النقطة التاسعة بـ B ؛ على نصف المستقيم المعاكس [Ax′) نعيّن النقطة الرابعة ، والموازي المار بها يقطع (AB) في M من الجهة الأخرى للنقطة A.'}))
E.append(ex(19, 111, 'ضع نقطتين متمايزتين M و N، أنشئ نقطة P من (MN) حيث $\\dfrac{PM}{PN} = \\dfrac{11}{7}$ .', 'وضع نقط على مستقيم',
            answer={'inside': 'MP = \\dfrac{11}{18}MN', 'outside': 'MP = \\dfrac{11}{4}MN',
                    'method': 'موازيان مدرّجان بنفس الوحدة يشملان M و N : 11 وحدة من جهة و 7 من الجهة الأخرى تعطيان P بين M و N ؛ 11 و 7 من نفس الجهة تعطيان P خارج [MN] .'}))
assert F(11, 18) / (1 - F(11, 18)) == F(11, 7) and F(11, 4) / (F(11, 4) - 1) == F(11, 7)

# ── أؤكّد تعلّماتي ───────────────────────────────────────────────────────────
Q1 = {'AI': 3, 'IB': 2, 'JC': 3, 'BC': 10}
Q1_x = F(Q1['AI'], Q1['AI'] + Q1['IB']) * Q1['BC']
Q1_y = F(Q1['AI'] * Q1['JC'], Q1['IB'])
assert Q1_x == 6 and Q1_y == F(9, 2)
Q2 = {'BC': 4, 'AM': 3, 'ML': 2, 'AL': 2}
Q2_k = F(Q2['BC'], Q2['ML'])
assert Q2_k * Q2['AL'] == 4 and Q2_k * Q2['AM'] == 6
Q3 = {'AB': 11, 'BE': 22, 'AC': 15, 'CF': 45}
assert F(Q3['AB'], Q3['AB'] + Q3['BE']) == F(1, 3) != F(Q3['AC'], Q3['AC'] + Q3['CF'])
E.append({
    'id': 'qcm', 'kind': 'qcm', 'page': 112, 'section': 'أؤكّد تعلّماتي', 'verified': True,
    'instruction': 'في كل حالة مما يلي اختر الإجابة أو الإجابات الصحيحة، وبرّر اختيارك.',
    'items': [
        {'number': 1, 'text': 'في الشكل الآتي (BC)//(IJ). ينتج ………',
         'figure': 'I من [AB] و J من [AC] ؛ AI = 3 ، IB = 2 ، JC = 3 ، BC = 10 ، IJ = x ، AJ = y.',
         'options': ['x = 6 ، y = 6', 'x = 1,5 ، $y = \\dfrac{9}{2}$', '$x = \\dfrac{3}{2}$ ، y = 4,5'],
         'cells': {'x': ['6', '1{,}5', '\\dfrac{3}{2}'], 'y': ['6', '\\dfrac{9}{2}', '4{,}5']},
         'correct': {'x': [0], 'y': [1, 2]}, 'pages': '106 و 107',
         'answer': {'x': fmt(Q1_x), 'y': fmt(Q1_y)}},
        {'number': 2, 'text': 'في الشكل الآتي، (LM)//(BC) ينتج ………',
         'figure': 'B ، A ، L على استقامة و C ، A ، M على استقامة (A بين النقطتين) ؛ BC = 4 ، AM = 3 ، ML = 2 ، AL = 2 ، AB = x ، AC = y.',
         'cells': {'x': ['4', '\\dfrac{1}{2}', '8'], 'y': ['6', '24', '3']},
         'correct': {'x': [0], 'y': [0]}, 'pages': '106 و 107',
         'answer': {'x': '4', 'y': '6'}},
        {'number': 3, 'text': 'في الشكل الآتي، ينتج ………',
         'figure': 'A ، B ، E على استقامة و A ، C ، F على استقامة ؛ AB = 11 ، BE = 22 ، AC = 15 ، CF = 45.',
         'options': ['(EF) لا يوازي (BC)', '(BC)//(EF)', '$BC = \\dfrac{1}{2}EF$'],
         'correct': [0], 'pages': '108 و 109',
         'answer': {'ratios': '\\dfrac{AB}{AE} = \\dfrac{11}{33} = \\dfrac{1}{3} \\neq \\dfrac{1}{4} = \\dfrac{15}{60} = \\dfrac{AC}{AF}'}},
        {'number': 4, 'text': 'نختار تدريجا منتظما على [AB] ونرسم مستقيمات موازية لـ (BC)، كما هو مبيّن في الشكل. ينتج …',
         'figure': '[AB] مقسمة بتدريج منتظم إلى 5 قطع متقايسة و M النقطة الثالثة من A ؛ موازيات لـ (BC) تمر بنقاط التدريج وتقطع [AC] ؛ N نقطة تقاطع الموازي المار بـ M مع [AC].',
         'options': ['$\\dfrac{AN}{AC} = \\dfrac{AM}{AB} = \\dfrac{3}{5}$', '$\\dfrac{AM}{AB} = \\dfrac{NM}{CB} = \\dfrac{3}{5}$', '$5 \\times NM = 3 \\times CB$'],
         'correct': [0, 1, 2], 'pages': '106 و 107 و 109'},
    ],
})

# ── أدمج تعلّماتي ────────────────────────────────────────────────────────────
S_H, S_R = 18, 6
S_r = F(S_R * S_H, S_H + S_R)        # r/6 = (18 − h)/18 et h = r
assert S_r == D('4.5') and F(S_r, S_R) == F(S_H - S_r, S_H)
S_V = S_r ** 3                        # V = π r² h = π r³
assert S_V == F(729, 8)
E.append({
    'id': 'situation', 'kind': 'situation', 'page': 112, 'section': 'أدمج تعلّماتي', 'verified': True,
    'title': 'وضعية',
    'text': 'الشكل المقابل يمثّل أسطوانة دوران ارتفاعها h ونصف قطر قاعدتها r، مرسومة داخل مخروط دوران ارتفاعه 18cm ونصف قطر قاعدته 6cm. احسب حجم هذه الأسطوانة في الحالة h = r.',
    'figure': 'مخروط مائل أفقيا: قاعدته (نصف قطرها 6) على اليسار ورأسه على اليمين، طوله 18 ؛ أسطوانة لها نفس محور المخروط، قاعدتها على قاعدة المخروط ودائرة قاعدتها الأخرى على سطح المخروط.',
    'analysis': {
        'قراءة الوضعية وفهمها': ['ما المطلوب في النص؟', 'أي شكل هندسي يمكن ربطه بالصورة المعطاة؟', 'ما هي الموارد المعرفية التي لها علاقة بهذه الوضعية؟'],
        'تحليل الوضعية واختيار استراتيجية حل مناسبة': ['اختر أجزاء الصورة التي اعتمد عليها لانجاز الشكل المطلوب.', 'اختر الخواص الهندسية المناسبة لحساب r.'],
        'تنفيذ استراتيجية الحل المختارة': ['تفسير الشكل بمثلثين يشتركان في النقطة O.', 'تطبيق خاصية طالس وحل معادلة لإيجاد r.'],
    },
    'answer': {'section': 'في المقطع المحوري: O رأس المخروط ، المثلث الكبير (الارتفاع 18 ونصف القطر 6) والمثلث الصغير (الارتفاع $18 - h$ ونصف القطر r) في وضعية طالس.',
               'equation': '\\dfrac{r}{6} = \\dfrac{18 - h}{18}', 'withHequalR': '18r = 6(18 - r) \\Rightarrow 24r = 108',
               'r': fmt(S_r), 'V': '\\pi \\times 4{,}5^2 \\times 4{,}5 = 91{,}125\\pi', 'Vexact': fmt(S_V) + '\\pi', 'Vapprox': '286{,}28', 'unit': 'cm^3'},
    'answerSource': 'computed',
})

# ── أتعمّق ───────────────────────────────────────────────────────────────────
TQ = 'أتعمّق'
E.append(ex(20, 113, 'EBCF شبه منحرف قاعدته الصغرى [EF] نصف قاعدته الكبرى [BC] أي $EF = \\dfrac{1}{2}BC$ . 1) ارسم شكلا مناسبا. 2) يتقاطع قطراه [BF] و [EC] في النقطة G. بيّن أنّ $\\dfrac{GE}{GC} = \\dfrac{GF}{GB} = \\dfrac{1}{2}$ . 3) يتقاطع (CF) و (BE) في النقطة A. بيّن أنّ F هي منتصف [CA]، وأنّ E هي منتصف [BA]. 4) المستقيم (AG) يقطع [BC] في النقطة L. بيّن أنّ L هي منتصف [BC]. (يمكن استعمال خاصية المتوسطات في مثلث).', TQ,
            answer={'2': '(EF)//(BC): المثلثان GEF و GCB في وضعية طالس، $\\dfrac{GE}{GC} = \\dfrac{GF}{GB} = \\dfrac{EF}{CB} = \\dfrac{1}{2}$',
                    '3': 'المثلثان AEF و ABC في وضعية طالس: $\\dfrac{AF}{AC} = \\dfrac{AE}{AB} = \\dfrac{EF}{BC} = \\dfrac{1}{2}$',
                    '4': '[BF] و [CE] متوسطان في المثلث ABC فـ G مركز ثقله ، و (AG) يحمل المتوسط الثالث.'}))
X21 = {'EF': 4, 'EG': 3}
X21_A1 = F(X21['EF'] * X21['EG'], 2)
X21_EL, X21_EP = F(2, 3) * X21['EF'], F(2, 3) * X21['EG']
X21_FG = 5
assert X21['EF'] ** 2 + X21['EG'] ** 2 == X21_FG ** 2
X21_LP = F(2, 3) * X21_FG
X21_A2 = X21_EL * X21_EP / 2
X21_h = 2 * X21_A2 / X21_LP
assert X21_A1 == 6 and X21_LP == F(10, 3) and X21_A2 == F(8, 3) == F(4, 9) * X21_A1 and X21_h == F(8, 5)
E.append(ex(21, 113, 'أنشئ مثلثا EFG قائما في E حيث EF = 4cm و EG = 3cm. 1) احسب $\\mathcal{A}_1$ مساحة المثلث EFG. 2) أنشئ، دون استعمال مسطرة مدرجة، النقطة L من نصف المستقيم [FE) حيث L لا تنتمي إلى [FE] و $\\dfrac{EL}{EF} = \\dfrac{2}{3}$ ، والنقطة P من نصف المستقيم [GE) حيث P لا تنتمي إلى [GE] و $\\dfrac{EP}{EG} = \\dfrac{2}{3}$ ، واستنتج (GF)//(LP). 3) احسب القيمة المضبوطة لكل من الطول LP، وارتفاع المثلث ELP المتعلّق بالرأس E. 4) احسب القيمة المضبوطة لـ $\\mathcal{A}_2$ مساحة المثلث ELP، ثم تحقّق أنّ $\\mathcal{A}_2 = \\left(\\dfrac{2}{3}\\right)^2 \\mathcal{A}_1$ .', TQ,
            answer={'A1': fmt(X21_A1), 'EL': fmt(X21_EL), 'EP': fmt(X21_EP), 'FG': '5', 'LP': fmt(X21_LP), 'height': fmt(X21_h),
                    'A2': fmt(X21_A2), 'check': '\\left(\\dfrac{2}{3}\\right)^2 \\times 6 = \\dfrac{8}{3}',
                    'parallel': 'L و P من الجهة الأخرى للنقطة E ، $\\dfrac{EL}{EF} = \\dfrac{EP}{EG} = \\dfrac{2}{3}$ والنقط مرتبة بنفس الترتيب: (GF)//(LP) حسب الخاصية العكسية.'}))
X22 = {'AB': 2, 'CD': 5, 'BD': 6}
X22_OB = F(X22['AB'] * X22['BD'], X22['CD'] - X22['AB'])
assert X22_OB == 4 and F(X22_OB, X22_OB + X22['BD']) == F(X22['AB'], X22['CD'])
E.append(ex(22, 113, 'أراد عبد القادر تقدير عرض نهر، لهذا رسم مستقيمين متوازيين (AB) و (CD). عن طريق البصر جعل على استقامية النقط O، B، D من ناحية والنقط O، A، C من الجانب الآخر. قاس عبد القادر الأطوال AB، CD، BD فوجد AB = 2m ، CD = 5m ، BD = 6m. احسب OB.', TQ,
            figure='O على الضفة الأخرى من النهر ؛ B بين O و D ، A بين O و C ؛ (AB)//(CD).',
            answer={'equation': '\\dfrac{OB}{OB + 6} = \\dfrac{2}{5}', 'OB': fmt(X22_OB), 'unit': 'm'}))
X23 = {'AK': 30, 'KB': 20, 'AL': 20, 'CB': 30, 'LD': D('13.5')}
X23_k = F(X23['AK'], X23['AK'] + X23['KB'])
X23_AC = X23['AL'] / X23_k
X23_LC = X23_AC - X23['AL']
X23_LK = X23_k * X23['CB']
assert X23_k == F(3, 5) and X23_LC == F(40, 3) and X23_LK == 18
assert F(X23['AL']) / X23_LC == F(3, 2) and X23['LD'] / X23_LK == F(3, 4)
E.append(ex(23, 113, 'الأطوال في الشكل هي بالسنتيمتر وليست حقيقية. (CB) و (LK) متوازيان. هل (CK) يوازي (DA)؟', TQ,
            figure='A ، K ، B على استقامة ؛ L نقطة تقاطع (AC) و (DK) ؛ AK = 30 ، KB = 20 ، LD = 13,5 ؛ ترميز التقايس: [AL] و [KB] بشرطتين ، [AK] و [CB] بثلاث شرطات (AL = 20 ، CB = 30).',
            answer={'k': '\\dfrac{3}{5}', 'AC': fmt(X23_AC), 'LC': fmt(X23_LC), 'LK': fmt(X23_LK),
                    'ratios': '\\dfrac{LA}{LC} = \\dfrac{3}{2} \\neq \\dfrac{3}{4} = \\dfrac{LD}{LK}', 'parallel': False}))
E.append(ex(24, 113, 'ABC و DBC مثلثان، O هي منتصف [BC]. J هي مركز ثقل المثلث ABC و K هي مركز ثقل المثلث DBC. برهن أنّ (JK) يوازي (AD).', TQ,
            answer={'why': 'مركز الثقل يقع على المتوسط في ثلثه من جهة القاعدة: $\\dfrac{OJ}{OA} = \\dfrac{OK}{OD} = \\dfrac{1}{3}$ والنقط O، J، A و O، K، D مرتبة بنفس الترتيب ، إذن (JK)//(AD).'}))
E.append(ex(25, 113, 'ABC مثلث كيفي. (AD) المتوسط المتعلّق بالضلع [BC]. M نقطة من [AD] تختلف عن A وعن D. المستقيم الذي يشمل M ويوازي (AC) يقطع [BC] في E، والمستقيم الذي يشمل M ويوازي (AB) يقطع [BC] في F. 1) ارسم شكلا مناسبا. 2) أثبت أنّ $\\dfrac{DE}{DC} = \\dfrac{DF}{DB}$ ، استنتج أنّ D هي منتصف [EF].', TQ,
            answer={'why': '$\\dfrac{DE}{DC} = \\dfrac{DM}{DA} = \\dfrac{DF}{DB}$ (طالس مرتين) و DB = DC فإن DE = DF.'}))
E.append(ex(26, 113, 'RST مثلثا كيفيا. منصف زاوية الرأس R يقطع الضلع [ST] في النقطة P. المستقيم الذي يشمل T ويوازي (RP) يقطع (SR) في النقطة E. 1) ارسم شكلا مناسبا. 2) أثبت أنّ $\\dfrac{ST}{SP} = \\dfrac{SE}{SR}$ ، واستنتج $\\dfrac{PT}{SP} = \\dfrac{RE}{SR}$ . 3) بيّن أنّ المثلث RTE متساوي الساقين. 4) بيّن أنّ $\\dfrac{PT}{SP} = \\dfrac{RT}{SR}$ .', TQ,
            answer={'2': 'المثلثان SRP و SET في وضعية طالس ؛ بطرح 1 من الطرفين: $\\dfrac{ST - SP}{SP} = \\dfrac{SE - SR}{SR}$',
                    '3': 'الزاويتان $\\widehat{RTE}$ و $\\widehat{RET}$ تساويان نصفي زاوية R (متبادلتان ومتماثلتان) ، إذن RE = RT.',
                    '4': 'نعوّض RE بـ RT في 2).'}))

# ── Plan de couverture ─────────────────────────────────────────────────────
L1, L2, L3, L4 = 'talis-hisab-atwal', 'aksiya-talis', 'inshaat-talis', 'wadiya-idmajiya-talis'
DEST = {
    '_comment': 'elementId → { lesson, module } ; `duplicatedIn` autorise une seconde utilisation déclarée ; `items` répartit un élément à plusieurs sous-éléments. Vérifié par scripts/check-textbook-coverage.mjs.',
    'objectives': {'lesson': 'unit', 'module': 'page'},
    'intro-thales': {'lesson': 'unit', 'module': 'page', 'duplicatedIn': [
        {'lesson': L4, 'module': 1, 'note': 'Thalès et l’ombre des pyramides : la méthode de l’ombre du تحدّ'}]},
    'challenge': {'lesson': 'unit', 'module': 'page', 'duplicatedIn': [
        {'lesson': L4, 'module': 1, 'note': 'la minaret mesurée par l’ombre d’un bâton : 7,25 m'}]},
    'prep': {'lesson': L1, 'module': 0, 'items': {
        '1-3': {'lesson': L1, 'module': 0},
        '4-5': {'lesson': L1, 'module': 4}}},
    'act-1': {'lesson': L1, 'module': 1},
    'know-1': {'lesson': L1, 'module': 2, 'duplicatedIn': [
        {'lesson': L2, 'module': 2, 'note': 'ملاحظة 1 : deux rapports inégaux suffisent pour conclure au non-parallélisme'}]},
    'know-2': {'lesson': L1, 'module': 2},
    'method-lengths': {'lesson': L1, 'module': 3},
    'now-107': {'lesson': L1, 'module': 3},
    **{f'ex-{n}': {'lesson': L1, 'module': 4} for n in [1, 2, 3, 4, 5, 6, 8, 9, 26]},
    'act-2': {'lesson': L2, 'module': 1},
    'know-3': {'lesson': L2, 'module': 2},
    'method-parallel': {'lesson': L2, 'module': 3},
    **{f'ex-{n}': {'lesson': L2, 'module': 4} for n in [7, 10, 11, 12, 13, 14, 15, 16, 23, 24, 25]},
    'method-divide': {'lesson': L3, 'module': 1},
    'method-construct-length': {'lesson': L3, 'module': 2},
    'method-ratio-point': {'lesson': L3, 'module': 2},
    'now-109': {'lesson': L3, 'module': 2},
    **{f'ex-{n}': {'lesson': L3, 'module': 3} for n in [17, 18, 19, 21]},
    'situation': {'lesson': L4, 'module': 1, 'duplicatedIn': [{'lesson': L4, 'module': 4}]},
    'qcm': {'lesson': L4, 'module': 2, 'duplicatedIn': [
        {'lesson': L1, 'module': 5, 'items': [1, 2]},
        {'lesson': L2, 'module': 5, 'items': [3]},
        {'lesson': L3, 'module': 4, 'items': [4]}]},
    **{f'ex-{n}': {'lesson': L4, 'module': 3} for n in [20, 22]},
}

DISCREPANCIES = [
    {'elementId': 'prep', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see items[4].correction',
     'text': 'Item 5 : « متناسبة مع أطوال المثلث ADE » — avec (CE)//(DF), le triangle en situation de Thalès avec ACE est ADF (ADE n’a pas de côté parallèle à CE). Corrigé en ADF ; réponse صحيح.'},
    {'elementId': 'know-2', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see example.correction',
     'text': 'Exemple : « AM/AB = AN/AC = MN/AC = 1/3 » — la troisième fraction est MN/BC (la ligne suivante écrit MN = 1/3 BC).'},
    {'elementId': 'method-lengths', 'kind': 'misprint', 'resolution': 'corrected_in_lessons — see element.correction',
     'text': '« أي 1/2 = 5/DN ومنه DN = 5/2 » — MA = 2 et MD = 3 − 2 = 1, donc MA/MD = 2/1 ; la fraction imprimée est renversée (1/2 donnerait DN = 10), le résultat 2,5 est juste.'},
    {'elementId': 'challenge', 'kind': 'note', 'text': 'Lecture de la figure : bâton de 1 m à 10 m du pied de la minaret, extrémité commune des ombres à 11,6 m ⇒ h = 1 × 11,6 / 1,6 = 7,25 m. La figure du manuel porte aussi un trait fin du pied de la minaret au sommet d’une marque de 1 m à 11,6 m (lecture « deux visées croisées » ⇒ 6,25 m) ; le texte (« يوم مشمس ») et l’encadré (« قياس ارتفاع أهرامات مصر بطريقة الظل ») désignent la méthode de l’ombre — retenue.'},
    {'elementId': 'ex-13', 'kind': 'note', 'text': 'Étiquette « 2,4 » posée sur [EB] (AE = 5,6) ; si elle désignait AE, AE/AB = 0,3 — dans les deux lectures AE/AB ≠ AF/AD = 0,2 : la réponse « غير متوازيين » ne dépend pas de la lecture.'},
    {'elementId': 'ex-9', 'kind': 'note', 'text': 'Pas de coquille : aucun angle droit n’est marqué en B, mais 2,8² + 4,5² = 5,3² (AD = 3,3 + 2) : la réciproque de Pythagore donne ABD rectangle en B, donc (BD)//(AF) ; AF = 4,5 × 3,3 / 2 = 7,425.'},
    {'elementId': 'ex-16', 'kind': 'note', 'text': 'Les deux rapports sont réellement égaux (5/3 = 9/5,4) : la question porte sur la JUSTIFICATION — « ≈ 1,7 » ne prouve pas l’égalité, Inès écrit des valeurs exactes.'},
    {'elementId': 'ex-23', 'kind': 'note', 'text': 'Marques lues à 500 dpi : AL = KB (deux traits) = 20, AK = CB (trois traits) = 30. AC = 100/3, LC = 40/3, LK = 18 : LA/LC = 3/2 ≠ 3/4 = LD/LK — (CK) et (DA) ne sont pas parallèles.'},
    {'elementId': 'act-1', 'kind': 'note', 'text': 'Application numérique 1 : AC′ = 56/15 ≈ 3,73 et B′C′ = 244/75 ≈ 3,25 — non décimaux, le manuel ne demande pas d’arrondi ; les leçons donnent la valeur exacte et l’arrondi au centième.'},
    {'elementId': 'qcm', 'kind': 'note', 'text': 'Items 1 et 2 : une ligne x et une ligne y par question, chaque cellule se juge seule (item 1 : x = 6 ; y = 9/2 = 4,5 — deux cellules justes). Item 4 : les trois réponses sont justes. La colonne « عند الحاجة أعود إلى الصفحة » renvoie aux pp. 106–109.'},
]

doc = {
    '_comment': [
        'EXTRACTION CANONIQUE du manuel scolaire officiel — 4AM, الجيل الثاني, unité 9 « خاصية طالس ».',
        'Source : « وحدة خاصية طاليس.pdf » (11 pages PDF = pages 103 à 113 du manuel), scan CamScanner sans couche texte.',
        'Ce fichier est LA source de vérité pédagogique de l’unité dans le dépôt. Tout contenu de leçon, toute manipulation,',
        'tout exercice de pratique cite un `id` d’ici via `source.elementId`.',
        'Transcription VISUELLE (110 dpi, zooms à 260 et 500 dpi sur les passages douteux) ; la formulation arabe est celle du manuel.',
        'Les réponses (`answer`) sont calculées en fractions exactes dans build-extraction.py (`answerSource: computed`).',
        'Les coquilles sont CORRIGÉES dans les leçons (champ `correction`, politique du propriétaire) ; `discrepancies` les liste.',
        'Les `destinations` sont le plan de couverture ; scripts/check-textbook-coverage.mjs le vérifie.',
        'Généré par docs/sources/4am/unit9/build-extraction.py — ne pas éditer à la main.',
    ],
    'unitCode': 'khassiyat-talis',
    'textbook': {'title': 'كتاب الرياضيات — السنة الرابعة من التعليم المتوسط', 'generation': 'الجيل الثاني', 'unitNumber': 9,
                 'unitTitle': 'خاصية طالس',
                 'pages': {'first': 103, 'last': 113}, 'pdfPageOffset': 102,
                 'sections': ['سأتعلّم في هذا الباب', 'تحدّ', 'أستعدّ', 'أنشطة', 'معارف', 'طرائق', 'دوري الآن', 'أوظّف تعلّماتي', 'أؤكّد تعلّماتي', 'أدمج تعلّماتي', 'أتعمّق']},
    'frozenAt': '2026-10-02',
    'terminology': {'note': 'Le manuel écrit « خاصية طالس » (titre de couverture « خاصية طاليس »), « الخاصية العكسية لخاصية طالس », « وضعية طالس », « مستقيمان متقاطعان », « متوازيان », « على استقامة / في استقامية », « مرتبة بنفس الترتيب », « معامل التناسبية », « معامل التكبير / التصغير », « تكبير / تصغير », « جدول تناسبية », « قطع متقايسة », « مسطرة غير مدرّجة ومدور », « نصف مستقيم [Ax) », « نظيرة … بالنسبة إلى ».',
                    'terms': ['خاصية طالس', 'الخاصية العكسية لخاصية طالس', 'وضعية طالس', 'مستقيمان متقاطعان', 'متوازيان', 'على استقامة', 'مرتبة بنفس الترتيب', 'معامل التناسبية', 'معامل التكبير', 'معامل التصغير', 'تكبير', 'تصغير', 'جدول تناسبية', 'قطع متقايسة', 'مسطرة غير مدرّجة', 'مدور', 'نصف مستقيم']},
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
