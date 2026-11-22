#!/usr/bin/env python3
"""Génère docs/sources/1am/unit11/extraction.json — 1AM, unité 11 « السطوح المستوية : الأطوال، المحيطات، المساحات »
(manuel الجيل الثاني, pp. 147–160 ; PDF pages 147–161 : la page imprimée 150 est DOUBLÉE à la page PDF 151, donc PDF = page
imprimée + 1 à partir de la page imprimée 151).

Transcription VISUELLE (pages rendues à 100 dpi ; les figures de la leçon masahat-muhit-sath relues à 200–300 dpi). Le texte
arabe est celui du manuel. Les figures quadrillées sont données en CELLULES (« rows », « # » = carreau plein) et l'aire et le
périmètre sont CALCULÉS ici (jamais tapés) ; une lecture incertaine est dite dans `reading` et dans `discrepancies`.

L'unité est générée LEÇON PAR LEÇON (cycle moyen, phase 3). Première leçon générée : masahat-muhit-sath (ordre 49), dont les
éléments sont transcrits avec soin (`verified: True` quand la figure a été relue à haute résolution) ; les éléments des quatre
autres leçons (wahdat-tul-masaha, mustatil-murabba-masaha, masahat-muthallath-qaim, muhit-qurs) et de la synthèse sont transcrits
plus brièvement et marqués `verified: False` : leur leçon les relira.

FRONTIÈRE (à écrire une fois) : masahat-muhit-sath = DISTINGUER le périmètre (longueur du bord) de l’aire (ce que la surface
recouvre), mesurer une aire par un PAVAGE simple avec une unité d’aire (carreaux, demi-carreaux, une unité double), COMPARER des
aires et des périmètres. Elle ne donne ni les unités mm² … km², ni les conversions (wahdat-tul-masaha), ni P = 2(a+b), A = a × b
(mustatil-murabba-masaha), ni l’aire du triangle rectangle, ni π.

Usage : python3 docs/sources/1am/unit11/build-extraction.py
"""
import json
import math
from fractions import Fraction as F
from pathlib import Path


def cells(rows):
    """Une figure quadrillée : une liste de chaînes, « # » = carreau plein (de gauche à droite sur la page)."""
    return {(r, c) for r, row in enumerate(rows) for c, ch in enumerate(row) if ch == '#'}


def area_perimeter(cs):
    """Aire (en carreaux) et périmètre (en côtés de carreau) d'une réunion de carreaux : arêtes ayant UN seul carreau voisin."""
    per = 0
    for (r, c) in cs:
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            if (r + dr, c + dc) not in cs:
                per += 1
    return len(cs), per


def fig(name, rows, **extra):
    a, p = area_perimeter(cells(rows))
    return {'name': name, 'rows': rows, 'area': a, 'perimeter': p, **extra}


E = []

# ── p. 147 : ouverture ───────────────────────────────────────────────────────────────────────────
E.append({'id': 'objectives', 'kind': 'objectives', 'page': 147, 'section': 'سأتعلّم في هذا الباب', 'verified': True,
          'items': ['تعيين مساحة سطح مستو باستعمال رصف بسيط.', 'مقارنة مساحات في وضعيات بسيطة.', 'حساب محيط ومساحة مستطيل.',
                    'حساب مساحة مثلث قائم.', 'حساب محيط قرص.', 'إجراء تحويلات لوحدات الأطوال والمساحات.']})
E.append({'id': 'opener', 'kind': 'aside', 'page': 147, 'section': 'تمهيد', 'verified': True,
          'text': 'من أوحى إلى النحل صنع بيته على شكل سداسي منتظم! مجتمع النحل مجتمع متكامل ومتميّز بالتنظيم، وقد ألهمه الله صنع قرص الشمع على شكل سداسي منتظم تنعدم فيه الفراغات البينية، ما يجعل بيت النحل من أقوى البيوت مقاومة وتحملا للعدد الكبير من ساكنيه، ويتطلّب أقل كمية ممكنة من الشمع لتقسيمه إلى حيّزات متساوية. وفي نهاية تسعينات القرن الماضي (سنة 1999) أثبت علماء الرياضيات أنّ من بين المضلّعات التي تحدّ مساحة معطاة، فإنّ السداسي المنتظم هو المضلّع الأصغر محيطا.',
          'figure': 'صورتا قرص شمع (خلايا سداسية)، وفي إحداهما سداسي منتظم مؤشّر عليه وثلاث زوايا 120° عند رأس مشترك.',
          'note': 'Le texte dit « تنعدم فيه الفراغات البينية » (pas de vide entre les cellules) et attribue au résultat de Hales (1999) « le plus petit périmètre pour une aire donnée ».'})

# ── p. 148 : استحضر مكتسباتي ─────────────────────────────────────────────────────────────────────
P2 = {'أ': fig('أ', ['.##', '###', '.#.']), 'ب': fig('ب', ['.##', '###']), 'ج': fig('ج', ['#..', '###', '###']),
      # (د) : un pentagone-flèche ; sa pointe triangulaire (sommets au milieu d'un côté vertical de 2 carreaux) vaut 1 carreau
      'د': {'name': 'د', 'rows': ['.##', '.###'], 'tip': 'triangle de base 2 carreaux et de hauteur 1 carreau = 1 carreau', 'area': 2 + 3 + 1, 'perimeter': None}}
P3 = {'أ': fig('أ', ['#....', '#....', '#####', '.####']),
      'ب': fig('ب', ['#####', '#####', '#####', '.####']),
      'ج': fig('ج', ['...##', '#####', '.####', '.####']),
      'د': fig('د', ['...##', '#..##', '#####', '#####'])}
assert P2['أ']['area'] == 6 and P2['ب']['area'] == 5 and P2['ج']['area'] == 7 and P2['د']['area'] == 6
assert [P3[k]['perimeter'] for k in 'أبجد'] == [18, 18, 18, 20]
PREP = [
    {'n': 1, 'question': 'يُسمّى طول الخط الأحمر في هذا الشكل:', 'figure': 'سطح أخضر (خماسي) محاط بخط أحمر',
     'options': ['سطحا', 'مضلّعا', 'محيطا'], 'correct': [2], 'why': 'طول الخط الذي يحدّ السطح هو محيطه'},
    {'n': 2, 'question': 'الشكلان اللذان لهما نفس المساحة هما:', 'figure': 'أربعة أشكال (أ) (ب) (ج) (د) على ورقة مرصوفة', 'cells': P2,
     'options': ['الشكلان (أ) و (ب)', 'الشكلان (أ) و (ج)', 'الشكلان (أ) و (د)'], 'correct': [2],
     'why': 'مساحات: (أ) 6 ، (ب) 5 ، (ج) 7 ، (د) 6 (مثلث الرأس = مربع واحد)'},
    {'n': 3, 'question': 'شكل واحد ليس له نفس المحيط مع الشكل (أ)، وهو:', 'figure': 'أشكال (أ) (ب) (ج) (د) على ورقة مرصوفة', 'cells': P3,
     'options': ['الشكل (ب)', 'الشكل (ج)', 'الشكل (د)'], 'correct': [2],
     'why': 'المحيطات: (أ) 18 ، (ب) 18 ، (ج) 18 ، (د) 20'},
    {'n': 4, 'question': 'أيّهما أصغر محيطا؟ مربع طول ضلعه 4cm أم دائرة قطرها 4cm.', 'options': ['المربع', 'الدائرة', 'لا أستطيع الحكم'], 'correct': [1],
     'why': 'محيط المربع 16cm ؛ محيط الدائرة π × 4 ≈ 12,57cm', 'destination': 'muhit-qurs'},
    {'n': 5, 'question': 'طول الدائرة في هذا الشكل هو:', 'figure': 'دائرة نصف قطرها 3cm تقريبا مرسومة على ورقة مرصوفة (وحدة 1cm)',
     'options': ['16cm', '24cm', 'محصور بين 16cm و 24cm'], 'correct': [2],
     'why': 'محيط الدائرة بين محيط المربع المحاط (24) والمربع (مضلّع) المحاط داخلها (16)', 'destination': 'muhit-qurs', 'reading': 'Cercle lu à 100 dpi : diamètre 6 carreaux (à relire par muhit-qurs).'},
]
E.append({'id': 'prep', 'kind': 'prerequisites', 'page': 148, 'section': 'استحضر مكتسباتي', 'verified': True,
          'instruction': 'اختر الإجابة (أو الإجابات) الصحيحة في كل حالة، وبرّر اختيارك.', 'items': PREP, 'answerSource': 'computed',
          'reading': 'Items 1–3 relus à 250–300 dpi (figures en cellules, aire et périmètre calculés) ; 4 et 5 appartiennent à muhit-qurs.'})

# ── pp. 149–150 : اكتشف ──────────────────────────────────────────────────────────────────────────
ACT1 = {'①': fig('①', ['###.', '####', '####', '#...']),
        '②': fig('②', ['...#', '##.#', '####', '####']),
        '③': fig('③', ['#....', '#####', '###..', '###..']),
        '④': fig('④', ['#...', '#...', '####', '####'])}
assert [(ACT1[k]['area'], ACT1[k]['perimeter']) for k in '①②③④'] == [(12, 16), (12, 18), (12, 18), (10, 16)]
E.append({'id': 'act-1', 'kind': 'activity', 'number': 1, 'page': 149, 'section': 'اكتشف', 'title': 'تعيين مساحة ومحيط سطح مستو', 'verified': True,
          'text': '① انقل الجدول أدناه وأكمله باستعمال وحدة المساحة ووحدة الطّول المعطاتين في الشكل المرفق (الشكل ① مرصوف، ② ③ ④ أشكال أخرى؛ الجدول: الشكل — مساحته — محيطه). ② قارن مساحتي كلّ من السّطحين، ومحيطيهما في كل حالة: ① و ② ، ③ و ② ، ① و ④ . ③ ماذا يمكن أن تستنتج؟ ④ باستعمال وحدة طول ووحدة مساحة مماثلتين للوحدتين الواردتين في الشكل، ارسم على مرصوفة: أ) سطحين لهما نفس المساحة وليس لهما نفس المحيط. ب) سطحين لهما نفس المحيط وليس لهما نفس المساحة.',
          'figure': 'ورقة مرصوفة: وحدة مساحة = مربع واحد (أخضر)، وحدة طول = ضلع مربع (أحمر). أربعة أشكال ①②③④ ؛ ① مرصوف بالأزرق ؛ ② مرسوم بخط فقط ؛ ③ أصفر ؛ ④ أخضر.',
          'cells': ACT1, 'reading': 'Relu à 220 dpi : ① 3+4+4+1 carreaux ; ② 1+3+4+4 (l’encoche au 2e rang) ; ③ 1+5+3+3 ; ④ 1+1+4+4 (L). Aire et périmètre calculés.',
          'answer': {'table': {k: {'area': ACT1[k]['area'], 'perimeter': ACT1[k]['perimeter']} for k in ACT1},
                     'sameAreaNotPerimeter': ['①②', '①③'], 'samePerimeterNotArea': ['①④'],
                     'sameBoth': ['②③']}, 'answerSource': 'computed'})
assert ACT1['①']['perimeter'] == ACT1['④']['perimeter'] == 16 and ACT1['②']['perimeter'] == ACT1['③']['perimeter'] == 18
E.append({'id': 'act-2', 'kind': 'activity', 'number': 2, 'page': 149, 'section': 'اكتشف', 'title': 'وحدات الطول والمساحة', 'verified': False,
          'text': 'الميليمتر المربع هو مساحة مربع طول ضلعه 1mm، ونكتبها 1mm² ونقرأها «واحد ميليمتر مربع». أ) عبّر بـ cm² ثم بـ mm² عن مساحة مربع طول ضلعه 1cm. عبّر بـ m² ثم بـ cm² عن مساحة مربع طول ضلعه 1m. ب) انقل وأكمل: 1cm² = … mm² ، 1m² = … cm² . ج) عبّر بـ dam ثم بـ m عن طول ضلع مربع مساحته 1dam².',
          'answer': {'1cm2': '100 mm²', '1m2': '10000 cm²', 'side 1dam2': '1 dam = 10 m'}, 'answerSource': 'computed'})
E.append({'id': 'act-3', 'kind': 'activity', 'number': 3, 'page': 149, 'section': 'اكتشف', 'title': 'محيط ومساحة مستطيل', 'verified': False,
          'text': 'أ) عبّر بالسنتيمتر عن عرض وطول المستطيل ABCD (مرصوف، 6cm × 4cm تقريبا). ما مساحة ABCD وما محيطه؟ ارسم مستطيلا EFGH عرضه 3cm له نفس مساحة ABCD. هل لهما نفس المحيط؟ ب) ارسم مستطيلا عرضه 3cm وطوله 7cm واحسب مساحته. ارسم مستطيلا له نفس محيط المستطيل السابق. هل لهما نفس المساحة؟ ج) ارسم مربعا طول ضلعه 5cm، واحسب مساحته.',
          'reading': 'Dimensions de ABCD non relues (à relire par mustatil-murabba-masaha).'})
E.append({'id': 'act-4', 'kind': 'activity', 'number': 4, 'page': 150, 'section': 'اكتشف', 'title': 'مساحة مثلث قائم', 'verified': False,
          'text': 'أ) ما طبيعة المثلث ABC (AB = 7cm ، BC = 4cm ، قائم في B) ؟ أنشئ ABC بأطواله الحقيقية، عيّن D بحيث ABCD مستطيل، احسب مساحة ABCD واستنتج مساحة ABC. ب) احسب مساحة المثلث الملوّن في ثلاث حالات (6 × 4,2 ؛ 6,5 × 3,8 ؛ 5 × 5). ج) جد صيغة لحساب مساحة مثلث قائم بدلالة طولي ضلعيه القائمين.'})
E.append({'id': 'act-5', 'kind': 'activity', 'number': 5, 'page': 150, 'section': 'اكتشف', 'title': 'محيط قرص', 'verified': False,
          'text': 'عندما تدور العجلة دورة واحدة دون أن تنزلق، تقطع المسافة من A إلى B. ما علاقة الطول AB بطول الإطار الخارجي للعجلة؟ كرّر التجربة بأشياء مختلفة إطارها الخارجي دائري، سجّل في جدول P (طول الدائرة) و d (قطرها) و P/d، ماذا تلاحظ بالنسبة إلى حاصل قسمة طول الدائرة على قطرها؟'})

# ── pp. 151–152 (PDF 152–153) : أوظّف تعلّماتي ; أكتسب طرائق ─────────────────────────────────────
E.append({'id': 'know-1', 'kind': 'knowledge', 'number': 1, 'page': 151, 'section': 'أوظّف تعلّماتي', 'title': 'مساحة سطح مستو ومحيطه', 'verified': True,
          'text': 'أ) يمكن لسطوح مختلفة أن يكون لها نفس المساحة ونفس المحيط. مثال: الشكلان ① و ② . ب) يمكن لسطوح مختلفة أن يكون لها نفس المساحة دون أن يكون لها نفس المحيط. مثال: الشكلان ① و ③ . ج) يمكن لسطوح مختلفة أن يكون لها نفس المحيط دون أن يكون لها نفس المساحة. مثال: الشكلان ④ و ⑤ .',
          'figure': 'خمسة أشكال على مرصوفة: ① وردي ② أصفر ③ أزرق (متقايسة المساحة)، ④ مستطيل بنهايتين دائريتين (أصفر) ، ⑤ مستطيل بجانبين مقوّسين إلى الداخل (بنّي).',
          'reading': 'Cinq surfaces à comparer : ①②③ de même aire ; ①② de même périmètre, ③ non ; ④⑤ de même périmètre (côtés arrondis compensés) et d’aires différentes. La plateforme les REDESSINE (guide §4ter-bis).',
          'answer': {'statements': ['même aire et même périmètre', 'même aire, périmètres différents', 'même périmètre, aires différentes']}, 'answerSource': 'computed'})
E.append({'id': 'know-2', 'kind': 'knowledge', 'number': 2, 'page': 151, 'section': 'أوظّف تعلّماتي', 'title': 'وحدات الطول ووحدات المساحة', 'verified': False,
          'text': 'كل مربع طول ضلعه وحدة طول، يمكن اعتبار مساحته وحدة مساحة، وهكذا نرفق بكل وحدة طول وحدة مساحة. 1m² هي مساحة مربع طول ضلعه 1m ، 1cm² ... ؛ جدول وحدات المساحة km² hm² dam² m² dm² cm² mm² (كل وحدة = 100 مرة التي تليها) ؛ 1m² = 100dm² = 10000cm² = 1000000mm² ؛ 1dam² = 100m² ؛ 1hm² = 10000m² ؛ 1km² = 1000000m². الوحدات الفلاحية: 1ha = 1hm² = 10000m² ، 1a = 1dam² = 100m² ، 1ca = 1m² ؛ 1ha = 100a ، 1a = 100ca.'})
E.append({'id': 'method-1', 'kind': 'method', 'number': 1, 'page': 152, 'section': 'أكتسب طرائق', 'title': 'تعيين مساحة سطح مستو باستعمال رصف بسيط', 'verified': True,
          'text': 'نص: عيّن مساحة السطح الملوّن بالبنفسجي في الشكل أدناه، مرّة باستعمال الوحدة ① ومرّة أخرى باستعمال الوحدة ② . حل: يتكوّن السطح الملوّن بالبنفسجي من 21 مربعا مثيلا للوحدة ①، ومنه مساحته 21 مربعا (وحدة ①). الوحدة ② هي ضعف الوحدة ①، ومنه فالمساحة باستعمال الوحدة ② هي نصف المساحة باستعمال الوحدة ①. وعليه مساحة السطح الملوّن بالبنفسجي هي 10,5 (وحدة ②). توجيهات: يمكن البحث عن علاقة تربط الوحدتين والاستفادة منها لتعيين المساحة باستعمال الوحدة الأخرى. طريقة: • نعتمد على العدّ في تعيين مساحة سطح مستو على مرصوفة. • للتعبير عن مساحة سطح بوحدتين مختلفتين يمكن الاستفادة من العلاقة التي تربط الوحدتين.',
          'figure': 'سطح بنفسجي على مرصوفة (6 أعمدة × 3 صفوف تقريبا بثقب أبيض واحد) ؛ وحدة ① = مربع أصفر ؛ وحدة ② = مستطيل أخضر من مربعين.',
          'answer': {'unit1': 21, 'unit2': '21/2', 'unit2decimal': '10,5', 'relation': 'unit2 = 2 × unit1'}, 'answerSource': 'computed',
          'reading': 'Le nombre 21 est celui du manuel ; la figure n’a pas été recomptée carreau par carreau (la plateforme redessine son propre pavage).'})
assert F(21, 2) == F('10.5')
E.append({'id': 'method-2', 'kind': 'method', 'number': 2, 'page': 152, 'section': 'أكتسب طرائق', 'title': 'تحويل وحدات المساحة', 'verified': False,
          'text': 'نص: ① حوّل إلى m² كلا من: 3dam² ، 5,7hm² ، 14,625km² . ② نفس السؤال من أجل: 276dm² ، 2835cm² ، 857105mm² . طريقة: استعمال الجدول (كل وحدة = 100 مرة التي تليها) ؛ 3dam² = 300m² ؛ 5,7hm² = 57000m² ؛ 14,625km² = 14625000m² ؛ 276dm² = 2,76m² ؛ 2835cm² = 0,2835m² ؛ 857105mm² = 0,857105m².',
          'answer': {'3dam2': '300', '5,7hm2': '57000', '14,625km2': '14625000', '276dm2': '2,76', '2835cm2': '0,2835', '857105mm2': '0,857105'}, 'answerSource': 'computed'})
assert 3 * 100 == 300 and 57 * 1000 == 57000 and 14625 * 1000 == 14625000
E.append({'id': 'know-3', 'kind': 'knowledge', 'number': 3, 'page': 153, 'section': 'أوظّف تعلّماتي', 'title': 'محيط ومساحة مستطيل', 'verified': False,
          'text': 'محيط مستطيل هو مجموع أطوال أضلاعه. إذا كان طوله a وعرضه b فإنّ محيطه P = 2 × (a + b). مساحة مستطيل هي جداء طوله وعرضه A = a × b. لحساب محيط أو مساحة شكل، ينبغي التأكد من أنّ كل الأطوال المستعملة معبّر عنها بنفس الوحدة.'})
E.append({'id': 'know-4', 'kind': 'knowledge', 'number': 4, 'page': 153, 'section': 'أوظّف تعلّماتي', 'title': 'محيط ومساحة مربّع', 'verified': False,
          'text': 'مربّع طول ضلعه a: محيطه P = 4 × a ، مساحته A = a × a = a².'})
E.append({'id': 'know-5', 'kind': 'knowledge', 'number': 5, 'page': 153, 'section': 'أوظّف تعلّماتي', 'title': 'محيط ومساحة مثلث قائم', 'verified': False,
          'text': 'المثلّث القائم هو نصف مستطيل. محيط مثلث هو مجموع أطوال أضلاعه. مساحة مثلث قائم طولا ضلعيه القائمين a و b هي نصف مساحة مستطيل بعداه a و b : A = (a × b)/2 = ½ ab.'})
E.append({'id': 'know-6', 'kind': 'knowledge', 'number': 6, 'page': 153, 'section': 'أوظّف تعلّماتي', 'title': 'محيط قرص والعدد π', 'verified': False,
          'text': 'محيط قرص هو طول الدائرة التي تحدّه. محيط قرص نصف قطره r وقطره d هو: P = 2 × π × r أو P = π × d. نأخذ 3,14 كقيمة مقرّبة للعدد π عند الحساب. باستعمال آلة حاسبة: عندما نضغط على المسة π تظهر قيمة مقرّبة للعدد π، مثل 3.141592654.'})
E.append({'id': 'method-3', 'kind': 'method', 'number': 3, 'page': 154, 'section': 'أكتسب طرائق', 'title': 'حساب مساحة سطح بالتجزئة', 'verified': False,
          'text': 'نص: احسب مساحة السطح الملوّن في كل من الحالتين (① شكل L : 7cm × 6cm ناقص مربع ضلعه 4cm ؛ ② مستطيل 8cm × 3cm ومثلثان قائمان). حل: ① (7 × 6) − (4 × 4) = 26cm² ، أو (4 × 3) + (7 × 2) = 26 ؛ ② (8 × 3) + (4 × 3)/2 + (2 × 3)/2 = 33cm². طريقة: لحساب مساحات بعض السطوح يمكن تجزئتها إلى سطوح مألوفة (كالمربع والمستطيل والمثلث…)، ثم نجمع أو نطرح المساحات الناتجة حسب الحالة.',
          'answer': {'case1': 26, 'case2': 33}, 'answerSource': 'computed'})
assert 7 * 6 - 4 * 4 == 26 == 4 * 3 + 7 * 2 and 8 * 3 + 4 * 3 // 2 + 2 * 3 // 2 == 33
E.append({'id': 'now-154', 'kind': 'practice', 'page': 154, 'section': 'دوري الآن', 'verified': False,
          'text': '① باستعمال معطيات الشكل المرفق (سطح أخضر بشكل «زهرة» على مرصوفة، 1cm) احسب محيط الشكل الملوّن، خذ 3,14 كقيمة مقرّبة للعدد π. ② ارسم مربعا ABCD طول ضلعه 6cm ؛ ارسم داخل المربع نصف الدائرة التي قطرها [AB] ونصف الدائرة التي قطرها [CD] ؛ امسح كلا من [AB] و [CD] واحسب محيط الشكل الناتج.'})

# ── pp. 155–156 (PDF 156–157) : أتمرّن ───────────────────────────────────────────────────────────
EX3 = {'①': {'area': 9, 'halves': 2, 'note': 'rectangle 4×2 + 2 demi-carreaux en haut (deux bords en biais)'},
       '②': {'area': 13}, '③': {'area': 8}}
E.append({'id': 'ex-1', 'kind': 'exercise', 'number': 1, 'page': 155, 'section': 'مقارنة محيطات ومساحات في وضعيات بسيطة', 'verified': True,
          'text': 'ارسم، دون استعمال مسطرة مدرّجة، قطعة مستقيم طولها محيط السطح.',
          'figure': 'خماسي أخضر غير منتظم بلا تدريج (لا أطوال مقروءة).', 'reading': 'Aucune longueur n’est donnée : la consigne se fait au compas (report de longueurs), geste non disponible à l’écran.'})
E.append({'id': 'ex-2', 'kind': 'exercise', 'number': 2, 'page': 155, 'section': 'مقارنة محيطات ومساحات في وضعيات بسيطة', 'verified': True,
          'text': 'قارن، دون استعمال مسطرة مدرّجة، بين محيطي السطحين (أ) و (ب).',
          'figure': '(أ) مثلث ؛ (ب) رباعي (وردي) ؛ بلا تدريج.', 'reading': 'Comparaison de périmètres sans règle graduée : report de longueurs au compas, ou fil. Sur écran : « le fil » du labo (la plateforme redessine l’exercice avec des longueurs au carreau).'})
E.append({'id': 'ex-3', 'kind': 'exercise', 'number': 3, 'page': 155, 'section': 'مقارنة محيطات ومساحات في وضعيات بسيطة', 'verified': False,
          'text': 'قارن محيطات وكذا مساحات الأشكال.', 'figure': 'ثلاثة أشكال ①②③ على مرصوفة بأضلاع مائلة (قطرية).', 'cells': EX3,
          'reading': 'Lu à 250 dpi : aires ③ = 8 (2,5 + 2,5 + 2 + 1), ② = 13, ① = 9 carreaux, avec des demi-carreaux le long des bords obliques ; périmètres non calculés (côtés en diagonale √2 d’un carreau).'})
E.append({'id': 'ex-4', 'kind': 'exercise', 'number': 4, 'page': 155, 'section': 'مقارنة محيطات ومساحات في وضعيات بسيطة', 'verified': True,
          'text': 'ارسم على ورقة كراسك ثلاثة مضلّعات لها نفس المحيط وليس لها نفس المساحة.'})
E.append({'id': 'ex-5', 'kind': 'exercise', 'number': 5, 'page': 155, 'section': 'مقارنة محيطات ومساحات في وضعيات بسيطة', 'verified': True,
          'text': 'ارسم على ورقة كراسك ثلاثة مضلّعات لها نفس المساحة، وليس لها نفس المحيط.'})
E.append({'id': 'ex-6', 'kind': 'exercise', 'number': 6, 'page': 155, 'section': 'مقارنة محيطات ومساحات في وضعيات بسيطة', 'verified': True,
          'text': 'ارسم على ورقة كراسك ثلاثة مضلّعات مختلفة لها نفس المساحة، ولها نفس المحيط.'})
for n, t in [(7, 'عبّر بالمتر عن الأطوال: أ) 27dam ب) 3hm جـ) 32km د) 35dm هـ) 569cm و) 8500mm'),
             (8, 'انقل وأكمل: 24m = … cm ؛ 7km = … m ؛ 61,78dm = … mm ؛ 61,78dm = … m ؛ 43dam = … hm ؛ 43cm = … dam'),
             (9, 'انقل وأكمل: 75m = 750 … ؛ 395m = 3,95 … ؛ 5km = 500 … ؛ 3458cm = 3,458 … ؛ 9 … = 900000cm ؛ 2107 … = 2,107m'),
             (10, 'عبّر بالمتر المربع (m²) عن المساحات: 9dam² ، 5,27hm² ، 3km² ، 52dm² ، 52134cm² ، 50000mm²'),
             (11, 'انقل وأكمل: 3m² = … cm² ؛ 0,0065km² = … m² ؛ 5,21dm² = … mm² ؛ 8716dm² = … m² ؛ 3,12cm² = … dm² ؛ 43dam² = … hm²'),
             (12, 'انقل وأكمل: 75m² = 750000 … ؛ 2759m² = 27,59 … ؛ 5km² = 500 … ؛ 1234cm² = 0,1234 … ؛ 12 … = 120000cm² ؛ 21070 … = 2,107m²'),
             (13, 'انقل وأكمل: 5a = … ca ؛ 23a = … m² ؛ 324a = … ha ؛ 5,12ha = … dam² ؛ 27,605ha = … ca ؛ 2345ca = … m²')]:
    E.append({'id': f'ex-{n}', 'kind': 'exercise', 'number': n, 'page': 155, 'section': 'إجراء تحويلات لوحدات الأطوال والمساحات', 'verified': False, 'text': t})
for n, t, pg in [
    (14, '① احسب في كل حالة محيط ومساحة المربع الذي طول ضلعه: 5cm ، 0,32m ، 12dm ، 725mm ② عبّر عن المحيط بالمتر (m) وعن المساحة بالمتر المربع (m²).', 155),
    (15, 'احسب في كل حالة محيط ومساحة المستطيل الذي بعداه (طوله وعرضه): 7cm و 5cm ؛ 0,37m و 0,2m ؛ 12dm و 45cm ؛ 0,5m و 208mm.', 155),
    (16, 'باستعمال معطيات الشكلين ① ، ② احسب مساحة ومحيط كل منهما (شكلان بزوايا قائمة، أطوال 2 ، 4 ، 7 ، 3 ، 4 ، 7 cm).', 156),
    (17, 'ارسم مربعا ABCD طول ضلعه 4cm ، عيّن النقطة E من [CD] حيث CE = 1,5cm ، والنقطة F من [AD] حيث DF = 1,5cm . احسب مساحة الرباعي BEDF.', 156),
    (18, 'ارسم مثلثا ABC قائما في A بحيث AB = 6cm و AC = 45mm . احسب مساحة المثلث ABC.', 156),
    (19, 'احسب مساحة مثلث قائم ومتساوي الساقين طول كل من ضلعيه القائمين 8cm.', 156),
    (20, 'أنشئ معينا قطراه 6cm و 9cm ، واحسب مساحته.', 156),
    (21, 'أ) أنشئ مستطيلا عرضه نصف طوله، وبيّن أنّه يمكن تقسيمه إلى مربعين متقايسين. ب) مستطيل عرضه نصف طوله ومساحته 50cm²، احسب بعديه.', 156),
    (22, 'بأخذ 3,14 كقيمة مقرّبة للعدد π ، احسب بالمتر طول دائرة نصف قطرها 6cm.', 156),
    (23, 'يمثّل خط الاستواء أكبر دائرة على الكرة الأرضية، ويقدّر نصف قطرها بـ 6376km. بأخذ 3,14 كقيمة مقرّبة للعدد π ، احسب طول خط الاستواء.', 156),
    (24, 'أراد صاحب حقل (مستطيل 15m × 5,5m تقريبا) أن يستحدث فيه ممرا له نفس العرض وبالأبعاد المقترحة على المخطط (9m ، 80cm ، 70cm) ويحيطه بسياج مع ترك باب عند مدخل كل ممر. أ) احسب مساحة الحقل المتبقية. ب) إذا علمت أنّ ثمن المتر الواحد من السياج هو 125DA ، احسب ثمن السياج.', 156),
    (25, 'مستطيل طوله 14,7cm وعرضه ثلثا (2/3) طوله. احسب مساحته ومحيطه.', 156),
    (26, 'يقول إلياس إنّ مساحة مثلث قائم أحد ضلعيه القائمين 5cm والآخر هو ضعف الأول هي نفس مساحة مربّع طول ضلعه 5cm. هل توافقه الرأي؟ برّر جوابك.', 156),
    (27, 'أ) ارسم مربعا ABCD طول ضلعه 4cm ، وعيّن النقطتين F و E بحيث F منتصف [BC] و E منتصف [BF]. ب) جد العلاقة بين مساحتي المثلثين ABE و AEF . ج) جد العلاقة بين مساحتي المثلثين AEF و AFC.', 156),
    (28, 'احسب بالسنتيمتر المربع مساحة السطح (شبه منحرف قائم قاعدتاه 3cm و 7cm وارتفاعه 4cm تقريبا).', 156),
    (29, 'احسب طول السلسلة باستعمال البيانات الموجودة على الشكل أدناه (دراجة: عجلتان وسلسلة، 48cm).', 156)]:
    E.append({'id': f'ex-{n}', 'kind': 'exercise', 'number': n, 'page': pg, 'section': 'حساب محيطات ومساحات بسيطة', 'verified': False, 'text': t})

# ── p. 157 (PDF 158) : أقوّم تعلّماتي ─────────────────────────────────────────────────────────────
E.append({'id': 'self-1', 'kind': 'self', 'number': 1, 'page': 157, 'section': 'أقوّم تعلّماتي', 'verified': False,
          'text': '① قارن بين مساحتي السطحين ① و ② . ② قارن بين محيطي السطحين ① و ② .',
          'figure': 'سطح أصفر ① فوق سطح أحمر ② على مرصوفة (عرض 6 مربعات تقريبا) ؛ ② مستطيل بنتوءين جانبيين.',
          'reading': 'Deux surfaces empilées dans un rectangle 6 × 4 environ : ① jaune (en haut, avec une encoche), ② rouge (en bas, deux « oreilles »). Carreaux non recomptés ; la plateforme redessine l’exercice avec ses propres figures.'})
E.append({'id': 'self-2', 'kind': 'self', 'number': 2, 'page': 157, 'section': 'أقوّم تعلّماتي', 'verified': False,
          'text': 'ارسم على مرصوفة مستطيلا ومربعا لكل منهما نفس مساحة المضلّع، وليس له نفس المحيط.',
          'figure': 'مضلّع أخضر غامق (سداسي مقعّر : ساعة رملية) داخل مستطيل برتقالي على مرصوفة.',
          'reading': 'Sablier : 2 trapèzes (haut et bas) dans un rectangle 8 × 5 environ ; aire non recomptée.'})
for n, t, d in [(3, 'أحد هذه القياسات لا يعبّر عن نفس المساحة التي تعبّر عنها البقية، حدّده: 2345m² ؛ 0,2345hm² ؛ 2345000mm² ؛ 234500dm².', 'wahdat-tul-masaha'),
                (4, 'رتّب المساحات الآتية ترتيبا تنازليا: 72dam² ، 13hm² ، 2km² ، 513m².', 'wahdat-tul-masaha'),
                (5, 'اختر الجواب الصحيح وبرّر اختيارك: إذا كان طول ضلع مربع 5cm فإنّ محيطه: 25cm² ، 25cm ، 20cm ؛ ومساحته: 25cm² ، 25cm ، 20cm.', 'mustatil-murabba-masaha'),
                (6, 'المستطيل الذي طوله 13cm وعرضه 65mm فإنّ مساحته: 845cm² ، 84,5cm² ، 845mm².', 'mustatil-murabba-masaha'),
                (7, 'مستطيل محيطه 24cm وعرضه 5cm. احسب طوله.', 'mustatil-murabba-masaha'),
                (8, 'قارن بين مساحتي المثلثين ① و ② (مثلثان داخل مثلث قائم 4cm × 6cm).', 'masahat-muthallath-qaim'),
                (9, 'بأخذ 3,14 كقيمة مقرّبة للعدد π ، احسب بالمتر طول دائرة نصف قطرها 50cm.', 'muhit-qurs'),
                (10, 'كل الأقواس في الشكل أنصاف دوائر. يقول إلياس إنّ الخط الأسود أطول من كل من الخطين الأخضر والأحمر (AB = 8cm). هل هذا صحيح؟ برّر جوابك.', 'muhit-qurs'),
                (11, 'من كم نصف دائرة يتكوّن الخط الأحمر؟ احسب طوله (مربع ضلعه 6cm، أربع بتلات).', 'muhit-qurs')]:
    E.append({'id': f'self-{n}', 'kind': 'self', 'number': n, 'page': 157, 'section': 'أقوّم تعلّماتي', 'verified': False, 'text': t})

# ── p. 158 (PDF 159) : أتعمّق ─────────────────────────────────────────────────────────────────────
for n, t in [
    (1, 'علما أنّ كل الأقواس في الشكل هي أنصاف دوائر متقايسة، احسب بالسنتيمتر محيط السطح أدناه (سطح أخضر على مرصوفة، 2cm).'),
    (2, 'السطح الملوّن في الشكل المرفق ليس مضلّعا. ارسم على ورقة مرصوفة مستطيلا ومربعا لكل منهما نفس مساحة هذا السطح الملوّن.'),
    (3, 'مربع طول ضلعه 6cm. أ) احسب طول المستطيل الذي عرضه 2cm والذي له نفس محيط المربع. ب) قارن بين مساحتيهما. ج) أعد نفس السؤالين (أ) و (ب) من أجل مستطيل عرضه 4cm.'),
    (4, 'مستطيل ومربّع لهما نفس المحيط. إذا علمت أنّ طول المستطيل 12cm ومساحته 96cm²، احسب مساحة المربّع.'),
    (5, 'مربّع ومثلّث متقايس الأضلاع لهما نفس المحيط. إذا علمت أنّ مساحة المربّع 36cm²، احسب طول ضلع المثلث.'),
    (6, 'في الشكل ABCD الضلعان [AD] و [BC] متوازيان، و AB = CD ويُسمّى شبه منحرف متساوي الساقين (AD = 3cm ، BC = 2 + 3 + … = 8cm ، الارتفاع 3cm). احسب مساحته بطريقتين مختلفتين.'),
    (7, 'احسب محيط ومساحة السطح الملوّن في الشكل أدناه (AF = 1cm ; FD = 9cm ; FE = 3cm ; AE = 3,16cm ; ED = 9,49cm ; AB = 5cm).'),
    (8, 'كل الرباعيات في الشكل هي مستطيلات. قارن بين مساحتي الجزأين الملوّنين.'),
    (9, 'ABC مثلث متقايس الأضلاع، طول ضلعه 6cm و AH = 5,2cm. احسب محيطه ومساحته.'),
    (10, 'السداسي المنتظم هو مضلّع له ستة أضلاع متقايسة، وزواياه متقايسة. يمكن تقسيم السداسي المنتظم إلى ستة مثلثات متقايسة الأضلاع. احسب محيط سداسي منتظم طول ضلعه 6cm.'),
    (11, 'الشكل أدناه هو تمثيل لمظلة شمسية على سطح مستو. الأقواس التي تكوّن هذا التمثيل كلها أنصاف دوائر، والتي تقع في الأسفل كلها متقايسة. احسب محيط الجزء الملوّن بالأصفر.')]:
    E.append({'id': f'deep-{n}', 'kind': 'deepen', 'number': n, 'page': 158, 'section': 'أتعمّق', 'verified': n == 2, 'text': t,
              **({'reading': 'Surface « stade » : un rectangle sur quadrillage dont deux bords courbes cèdent à l’extérieur ce que deux autres reçoivent (demi-disques). Aire par COMPENSATION : on déplace les parties en excès sur les creux. Non recomptée carreau par carreau ; la plateforme conçoit sa propre surface.'} if n == 2 else {})})

# ── p. 159 (PDF 160) : أتعلّم الإدماج ; وضعية تقويم ─────────────────────────────────────────────────
E.append({'id': 'integration', 'kind': 'integration', 'page': 159, 'section': 'أتعلّم الإدماج', 'title': 'تجديد أرضية منزل', 'verified': False,
          'text': 'يريد صاحب منزل فرش قاعة الضيوف والغرف الثلاث بالسجاد، وتجديد بلاط الشرفة (انظر المخطط المقابل). إذا علمت أنّ تكلفة المتر المربع الواحد من البلاط هي 1200DA، وتكلفة المتر المربع الواحد من السجاد هي 500DA، وأنّ السجاد يثبت على طول حافة الحائط بشرائط خشبية سعر المتر الواحد منها هو 45DA، وأنّ فتحات الأبواب متساوية وتساوي 0,9m. احسب تكلفة الأشغال.',
          'shortSolution': ['تكلفة تبليط الشرفة هي 28800DA.', 'تكلفة السجاد هي 38550DA.', 'ثمن الشريط الخشبي اللازم هو 2853DA ومنه تكلفة الأشغال هي 70203DA.'],
          'answer': {'total': 70203, 'pieces': [28800, 38550, 2853]}, 'answerSource': 'computed'})
assert 28800 + 38550 + 2853 == 70203
E.append({'id': 'evaluation', 'kind': 'integration', 'page': 159, 'section': 'وضعية تقويم', 'verified': False,
          'text': 'الشكل المقابل (مستطيل 9m × 4m ناقص مربع 1m عند الزاوية السفلية اليسرى) يمثّل أعلى الوجه العلوي لمسبح المنزل. لضمان أمن أولاده والمحافظة على نظافة مسبح المنزل، يريد صاحب المسبح تغطيته بقماش مشمع نظافة المسبح. يثبت القماش على قضيب ألمنيوم يحيط بكافة المسبح على بعد 20cm من حافته. يقترح حرفي: ثمن المتر المربع من القماش هو 1250DA ، ثمن المتر من قضيب الألمنيوم هو 240DA ، مبلغ اليد العاملة 6500DA. احسب تكلفة تغطية المسبح.'})
E.append({'id': 'ict', 'kind': 'ict', 'page': 160, 'section': 'استعمل تكنولوجيات الإعلام والاتصال', 'verified': False,
          'text': 'نشاط 1 (جيوجبرا): حل مسألة بمساعدة جيوجبرا — مستقيم (d) ونقطتان A و B من نفس الجهة، عيّن النقطة C من (d) بحيث يكون محيط المثلث ABC أصغر ما يمكن. نشاط 2: استعمال جيوجبرا لوضع تخمين — مربع ABCD ، النقطة M من [CD] والنقطة E من [BC] حيث CE = DM ، المضلّع AECM : حرّك M وقارن مساحة AECM مع مساحة المربع.'})

# ── Destinations ──────────────────────────────────────────────────────────────────────────────────
L, W, R, T, C, SYN = ('masahat-muhit-sath', 'wahdat-tul-masaha', 'mustatil-murabba-masaha', 'masahat-muthallath-qaim', 'muhit-qurs',
                      'wadiya-idmajiya-sutuh-masahat-muhitat')
DEST = {
    '_comment': 'elementId → { lesson, module } ; `items` répartit un élément ; une leçon encore coming_soon est une destination EN ATTENTE (check-textbook-coverage.mjs). Première leçon générée : masahat-muhit-sath (2026-10-15).',
    'objectives': {'lesson': 'unit', 'module': 'page'},
    'opener': {'lesson': L, 'module': 2, 'note': 'تمهيد p. 147 (le rayon de miel : le plus petit périmètre pour une aire donnée) : une carte « لماذا السداسي؟ » à la fin de معارف'},
    'prep': {'lesson': L, 'module': 0, 'items': {'1-2-3': {'lesson': L, 'module': 0}, '4-5': {'lesson': C, 'module': 0}}},
    'act-1': {'lesson': L, 'module': 4, 'note': 'APPLICATION (guide §4ter) : le labo `tile-yard` est l’entrée conçue par la plateforme ; نشاط 1 (le tableau aire / périmètre de quatre figures) est posé dans أتمرّن'},
    'act-2': {'lesson': W, 'module': None}, 'act-3': {'lesson': R, 'module': None}, 'act-4': {'lesson': T, 'module': None}, 'act-5': {'lesson': C, 'module': None},
    'know-1': {'lesson': L, 'module': 2},
    'know-2': {'lesson': W, 'module': None},
    'method-1': {'lesson': L, 'module': 3},
    'method-2': {'lesson': W, 'module': None},
    'know-3': {'lesson': R, 'module': None}, 'know-4': {'lesson': R, 'module': None},
    'know-5': {'lesson': T, 'module': None}, 'know-6': {'lesson': C, 'module': None},
    'method-3': {'lesson': R, 'module': None},
    'now-154': {'lesson': C, 'module': None},
    **{f'ex-{n}': {'lesson': L, 'module': 4} for n in range(1, 7)},
    **{f'ex-{n}': {'lesson': W, 'module': None} for n in range(7, 14)},
    'ex-14': {'lesson': R, 'module': None}, 'ex-15': {'lesson': R, 'module': None}, 'ex-16': {'lesson': R, 'module': None}, 'ex-17': {'lesson': R, 'module': None},
    'ex-18': {'lesson': T, 'module': None}, 'ex-19': {'lesson': T, 'module': None}, 'ex-20': {'lesson': T, 'module': None},
    'ex-21': {'lesson': R, 'module': None}, 'ex-22': {'lesson': C, 'module': None}, 'ex-23': {'lesson': C, 'module': None},
    'ex-24': {'lesson': R, 'module': None}, 'ex-25': {'lesson': R, 'module': None},
    'ex-26': {'lesson': T, 'module': None}, 'ex-27': {'lesson': T, 'module': None}, 'ex-28': {'lesson': T, 'module': None}, 'ex-29': {'lesson': C, 'module': None},
    'self-1': {'lesson': L, 'module': 8}, 'self-2': {'lesson': L, 'module': 4, 'note': 'consigne de dessin → choix (aire par pavage puis rectangle et carré de même aire)'},
    'self-3': {'lesson': W, 'module': None}, 'self-4': {'lesson': W, 'module': None},
    'self-5': {'lesson': R, 'module': None}, 'self-6': {'lesson': R, 'module': None}, 'self-7': {'lesson': R, 'module': None},
    'self-8': {'lesson': T, 'module': None}, 'self-9': {'lesson': C, 'module': None}, 'self-10': {'lesson': C, 'module': None}, 'self-11': {'lesson': C, 'module': None},
    'deep-1': {'lesson': C, 'module': None},
    'deep-2': {'lesson': L, 'module': 6, 'note': 'surface non polygonale : l’aire se lit par COMPENSATION (on déplace une pièce en excès sur un creux) — une مسألة'},
    'deep-3': {'lesson': R, 'module': None}, 'deep-4': {'lesson': R, 'module': None}, 'deep-5': {'lesson': R, 'module': None},
    'deep-6': {'lesson': T, 'module': None}, 'deep-7': {'lesson': T, 'module': None}, 'deep-8': {'lesson': T, 'module': None}, 'deep-9': {'lesson': T, 'module': None},
    'deep-10': {'lesson': R, 'module': None}, 'deep-11': {'lesson': C, 'module': None},
    'integration': {'lesson': SYN, 'module': None}, 'evaluation': {'lesson': SYN, 'module': None},
    'ict': {'lesson': SYN, 'module': None},
}

DISCREPANCIES = [
    {'elementId': 'unit', 'kind': 'scan', 'text': 'La page imprimée 150 (activités 4–5) est DOUBLÉE à la page PDF 151 ; à partir de la page imprimée 151, page PDF = page imprimée + 1 (153 imprimée = 154 PDF …). « أقوّم تعلّماتي » p. 157 renvoie à « pp. 170–172 » (erreur du manuel).'},
    {'elementId': 'prep', 'kind': 'reading', 'text': 'Item 2 relu à 300 dpi : (أ) 6 carreaux, (ب) 5, (ج) 7, (د) 6 — la pointe triangulaire de (د) (base 2 carreaux, hauteur 1) vaut 1 carreau. Item 3 relu à 200 dpi : périmètres 18, 18, 18, 20 (le seul différent est (د) : encoche ouverte vers le haut).'},
    {'elementId': 'act-1', 'kind': 'reading', 'text': 'Figures relues à 220 dpi (carreaux de 54 px) : ① 12 carreaux / périmètre 16, ② 12 / 18, ③ 12 / 18, ④ 10 / 16 (calculés par area_perimeter). Réponses attendues : ① et ② ont même aire et des périmètres différents ; ② et ③ mêmes aire et périmètre ; ① et ④ même périmètre et des aires différentes.'},
    {'elementId': 'know-1', 'kind': 'reading', 'text': 'Les figures ④ et ⑤ ont des bords courbes (demi-disques ajoutés ou retranchés) : « même périmètre » entre elles ne se lit pas au carreau (le périmètre des arcs est le sujet de muhit-qurs) ; la plateforme n’en reprend que l’idée (deux surfaces de même périmètre et d’aires différentes) avec ses propres figures au carreau.'},
    {'elementId': 'method-1', 'kind': 'scope', 'text': 'Le manuel écrit « المساحة باستعمال الوحدة ② هي نصف المساحة باستعمال الوحدة ① » (unité ② = 2 carreaux) : 21 carreaux = 10,5 unités ②. La leçon le fait manipuler avec des unités d’aire (pas de cm² : ce sont celles de wahdat-tul-masaha).'},
    {'elementId': 'ex-1', 'kind': 'scope', 'text': 'ex 1–2 se font au compas / à la bande de papier (report de longueurs) : geste non disponible à l’écran ; la plateforme les redessine (un fil virtuel, des longueurs en carreaux).'},
    {'elementId': 'ex-3', 'kind': 'reading', 'text': 'Les bords obliques coupent des carreaux EN DEUX (demi-carreaux) : aires ③ 8, ② 13, ① 9 ; les périmètres comparent des côtés en diagonale (√2 > 1) sans valeur exacte attendue : la comparaison se fait côté à côté.'},
    {'elementId': 'ex-6', 'kind': 'intended', 'text': 'ex 6 demande trois polygones DIFFÉRENTS de même aire et de même périmètre (exemple : ② et ③ de l’activité 1) ; la consigne de dessin devient un choix de couples.'},
    {'elementId': 'deep-2', 'kind': 'reading', 'text': 'Surface non polygonale : l’aire se lit par compensation de bords courbes ; la leçon n’emploie que des surfaces dont les creux et les bosses se COMPENSENT exactement au carreau (demi-carreaux).'},
    {'elementId': 'unit', 'kind': 'scope', 'text': 'Pages 147–160 complètes. Les éléments de wahdat-tul-masaha, mustatil-murabba-masaha, masahat-muthallath-qaim, muhit-qurs et de la synthèse sont transcrits plus brièvement (verified: false) : leur leçon les relira.'},
]

doc = {
    '_comment': [
        'EXTRACTION CANONIQUE du manuel scolaire officiel — 1AM, الجيل الثاني (موفم 2017), unité 11 « السطوح المستوية : الأطوال، المحيطات، المساحات ».',
        'Source : docs/official-book-pdfs/كتاب الرياضيات للسنة الأولى متوسط الجيل الثاني.pdf, pages imprimées 147 à 160 (PDF 147 à 161).',
        'Ce fichier est LA source de vérité pédagogique de l’unité ; tout contenu cite un `id` d’ici via `source.elementId`.',
        'Transcription VISUELLE ; figures quadrillées en cellules, aires et périmètres calculés par build-extraction.py, `answerSource: computed`.',
        'Généré par docs/sources/1am/unit11/build-extraction.py — ne pas éditer à la main.',
    ],
    'unitCode': 'sutuh-masahat-muhitat',
    'textbook': {'title': 'كتاب الرياضيات — السنة الأولى من التعليم المتوسط', 'generation': 'الجيل الثاني', 'unitNumber': 11,
                 'unitTitle': 'السطوح المستوية: الأطوال، المحيطات، المساحات', 'pages': {'first': 147, 'last': 160}, 'pdfPageOffset': 1,
                 'sections': ['سأتعلّم في هذا الباب', 'استحضر مكتسباتي', 'اكتشف', 'أوظّف تعلّماتي', 'أكتسب طرائق', 'دوري الآن', 'أتمرّن', 'أقوّم تعلّماتي', 'أتعمّق',
                              'أتعلّم الإدماج', 'وضعية تقويم', 'استعمل تكنولوجيات الإعلام والاتصال']},
    'frozenAt': '2026-10-15',
    'terminology': {'note': 'Le manuel écrit « السطح », « المساحة », « المحيط », « وحدة طول », « وحدة مساحة », « رصف / مرصوفة », « المضلّع », « القرص », « الدائرة ».',
                    'terms': ['السطح', 'المساحة', 'المحيط', 'وحدة الطول', 'وحدة المساحة', 'الرصف', 'المرصوفة', 'مضلّع', 'القرص']},
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
pending = sum(1 for k, v in DEST.items() if k != '_comment' and v['lesson'] not in ('unit', L))
print(f'{out} — {len(E)} éléments ({pending} vers les autres leçons de l’unité)')
