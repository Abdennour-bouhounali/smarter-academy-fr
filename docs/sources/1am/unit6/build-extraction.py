#!/usr/bin/env python3
"""Génère docs/sources/1am/unit6/extraction.json — 1AM, unité 6 « الحساب الحرفي »
(manuel الجيل الثاني, pp. 77–88 ; PDF pages 77–88, offset 0).

Transcription VISUELLE (pages rendues à 110 dpi, zones à 200–220 dpi). Les passages de la leçon `bahth-adad-naqisa` (نشاط 1 p. 79, طريقة et « دوري الآن » p. 82,
« البحث عن أعداد ناقصة » ex. 15–18 p. 84, أتعمّق 6 et 7 p. 86, أقوّم 5 p. 85, أتعمّق 1 p. 86) sont relus de près (`verified: True`) ; les éléments des leçons qui ne sont pas
encore générées (`intaj-ibara-harfiya`, la synthèse) sont transcrits plus brièvement et marqués `verified: False` : leur leçon les relira. Les éléments de `tatbiq-qaida-harfiya` (act-2, act-4, know-1, know-2,
ex-4 à ex-6, deep-5, ict, ict-ex ; pp. 79, 80, 81, 83, 86, 88) ont été RELUS à 110 dpi lors de la génération de cette leçon (2026-10-30) et sont `verified: True`.
Les réponses sont CALCULÉES ici (`Fraction`, `Decimal` exacts), jamais tapées ; une lecture de figure incertaine est dite dans `reading` et dans `discrepancies`.

L'unité est générée LEÇON PAR LEÇON (cycle moyen, phase 3) : la première leçon générée est bahth-adad-naqisa (ordre 24, 2026-10-30, paire 2 B) ; les destinations vers une
leçon encore coming_soon sont EN ATTENTE (scripts/check-textbook-coverage.mjs).

FRONTIÈRE entre les leçons de l'unité (règle « pas de doublon », LEARNING_NET.md) — les quatre entrées de l'unité (ordre du catalogue) :
  L1 `bahth-adad-naqisa` (1am.m5.r10) : le nombre MANQUANT d'une égalité de la forme a + … = b, a − … = b (et … − a = b), a × … = b, trouvé par l'OPÉRATION INVERSE
     et VÉRIFIÉ par substitution ; les nombres sont naturels, décimaux, ou le quotient d'une division qui ne s'arrête pas (une fraction). Aucune LETTRE : le manquant est □.
     Le « programme de calcul » à deux étapes (× 3 puis + 5 donne 26) y est REMONTÉ étape par étape (ex-18), sans écrire d'expression littérale.
  L2 `tatbiq-qaida-harfiya` (1am.m5.r08) : appliquer une règle littérale (P = 2(a + b), I = (a + b + c − 200)/10, F + 2 = S) en substituant des nombres, y compris le contre-exemple (act-4) ; elle NOMME aussi
     la lettre et l'écriture sans × (know-1 : la définition de la « عبارة حرفية » et les اصطلاحات : a × b = ab, 2 × x = 2x, 3(x + 2), le nombre avant la lettre, jamais de × omis entre deux nombres : 2 × 3 ≠ 23), car la
     substitution en dépend (P1 du catalogue). Le périmètre et l'aire d'un rectangle n'y sont qu'un « تذكّر » (1am.m2.r08, enseigné plus tard par la géométrie). Les REMARQUES restantes de know-1 (x × 1 = x, ba = ab,
     x × 0 = 0, a × a = a²) et « أكتب بدلالة x » restent à L3.
  L3 `intaj-ibara-harfiya` (1am.m5.r09) : produire une expression littérale (3x + 5, 2x + 3, périmètres en x), les conventions d'écriture (× omis, 5² …), traduire un programme de calcul.
  Synthèse `wadiya-idmajiya-ibarat-harfiya` : le تحدّ de l'unité (la jardinière d'al-Kāshī), l'intégration (la voiture « حسن سيارة للسنة »), la situation d'évaluation, les
     éléments qui mêlent lettre et nombre manquant (self-6 : les angles x, 3x, 5x ; self-8), et les restes.
Éléments qui enjambent : `know-2` (p. 81) : « أكتب بدلالة x » → L3, « أطبّق قاعدة حرفية » → L2 ; `prep` (p. 78) récapitule les unités 1–5 : la synthèse le relira ; le prep 1 (la machine
+ 85 donne 104) est le germe de L1 mais « أستعدّ » de L1 mesure ses propres items du réseau (platform_addition).

Le تحدّ de l'unité EST imprimé (p. 77, « مثال من مفتاح الحساب للكاشي ») : `units_1am_2026_2027.json › ibarat-harfiya.challenge` le cite déjà ; il va à la synthèse (n(n+1)/2 = 6n → n = 11).

Usage : python3 docs/sources/1am/unit6/build-extraction.py
"""
import json
from decimal import Decimal as D
from fractions import Fraction as F
from pathlib import Path


def dec(s):
    return D(str(s).replace(',', '.').replace('−', '-'))


def fr(x):
    """Un décimal exact écrit à la virgule (ex. 2,7), signe ASCII ; une fraction irréductible « p/q » quand le quotient ne s'arrête pas."""
    if isinstance(x, F):
        if x.denominator == 1:
            return str(x.numerator)
        d = x.denominator
        for p in (2, 5):
            while d % p == 0:
                d //= p
        if d == 1:
            return format(D(x.numerator) / D(x.denominator), 'f').replace('.', ',')
        return f'{x.numerator}/{x.denominator}'
    x = D(x).normalize()
    return format(x, 'f').replace('.', ',')


def q(s):
    return F(dec(s))


E = []

# ── p. 77 : ouverture ─────────────────────────────────────────────────────────────────────────────
E.append({
    'id': 'objectives', 'kind': 'objectives', 'page': 77, 'section': 'سأتعلّم في هذا الباب', 'verified': True,
    'items': [
        'إتمام مساويات من الشكل : a × … = b ، a − … = b ، a + … = b حيث a و b عددان مفروضان.',
        'تطبيق قاعدة حرفية في وضعية بسيطة.',
        'إنتاج عبارة حرفية بسيطة.',
    ],
})
KASHANI = 6 * 11
assert 11 * 12 // 2 == KASHANI  # 1 + 2 + … + 11 = 66 = 6 × 11
E.append({
    'id': 'opener-challenge', 'kind': 'challenge', 'page': 77, 'section': 'مثال من مفتاح الحساب للكاشي', 'verified': True,
    'text': 'دخلت جماعة بستانا، فقطف أحدهم رمانة واحدة والثاني اثنتين والثالث ثلاثة وهكذا بتزايد واحدة في كلّ مرّة، ثم اقتسموا جميع ما معهم بالسوية، فكانت حصّة كل واحد منهم ستة. ما هو عدد أفراد هذه الجماعة ؟',
    'answer': {'members': 11, 'total': KASHANI, 'why': 'مجموع 1 + 2 + … + n هو n(n+1)/2 ، وحصّة كلّ واحد 6 : n(n+1)/2 = 6n ، أي n + 1 = 12 ، n = 11'},
    'answerSource': 'computed',
})
E.append({
    'id': 'opener-khwarizmi', 'kind': 'aside', 'page': 77, 'section': 'تمهيد', 'verified': True,
    'text': 'الخوارزمي (781 م – 847 م) : عالم الرياضيات والفلك والجغرافيا، من أهمّ علماء القرون الوسطى الذين أثّروا في التفكير الرياضي. شكّل كتابه « حساب الجبر والمقابلة » أساس الجبر، ونجد فيه تصنيفًا للمعادلات وطرقًا لحلّها. صورة : تمثال الخوارزمي في خيوا (أوزبكستان).',
    'figure': 'تمثال برونزي للخوارزمي جالسًا يحمل لفافة', 'answerSource': 'read',
})

# ── p. 78 : استحضر مكتسباتي ──────────────────────────────────────────────────────────────────────
PREP = [
    {'n': 1, 'question': 'وجدنا 104 عندما طبقنا برنامج الحساب (دخول ← « + 85 » ← خروج). عدد الدخول هو :', 'options': ['19', '19 + 85', '104 − 85'], 'correct': [0, 2], 'why': f'104 − 85 = {104 - 85}'},
    {'n': 2, 'question': 'بتطبيق برنامج الحساب « أختار عددا، أضربه في 2 وأضيف إلى النتيجة 1 ». عندما أختار 10، أجد :', 'options': ['20', '21', '11'], 'correct': [1], 'why': f'10 × 2 + 1 = {10 * 2 + 1}'},
    {'n': 3, 'question': 'العدد 54 مضاعف لـ :', 'options': ['2', '3', '4'], 'correct': [0, 1], 'why': f'54 = 2 × 27 = 3 × 18 ؛ 54 ÷ 4 = {fr(F(54, 4))}'},
    {'n': 4, 'question': 'محيط مستطيل بعداه a و b هو :', 'options': ['2(a + b)', '2(L + l)', 'a + b + a + b'], 'correct': [0, 1, 2], 'why': 'الثلاث كتابات لعدد واحد : مجموع الأضلاع الأربعة'},
    {'n': 5, 'question': 'مساحة مربع طول ضلعه 5,5 m هي :', 'options': ['5,5 m²', '11 m²', '30,25 m²'], 'correct': [2], 'why': f'5,5 × 5,5 = {fr(q("5.5") * q("5.5"))}'},
    {'n': 6, 'question': 'مساحة مستطيل عرضه 5,3 cm وطوله 7,4 cm هي :', 'options': ['39,22 cm', '25,4 cm²', '39,22 cm²'], 'correct': [2], 'why': f'5,3 × 7,4 = {fr(q("5.3") * q("7.4"))}'},
    {'n': 7, 'question': 'العدد 21 873 يقبل القسمة على :', 'options': ['2', '3', '4'], 'correct': [1], 'why': 'مجموع أرقامه 2 + 1 + 8 + 7 + 3 = 21 يقبل القسمة على 3 ؛ وهو فردي فلا يقبلها على 2 ولا على 4'},
]
assert q('5.5') * q('5.5') == q('30.25') and q('5.3') * q('7.4') == q('39.22') and 21873 % 3 == 0 and 21873 % 2 == 1 and 54 % 4 != 0
E.append({'id': 'prep', 'kind': 'prerequisites', 'page': 78, 'section': 'استحضر مكتسباتي', 'verified': False,
          'instruction': 'اختر الإجابة (أو الإجابات) الصحيحة في كل حالة، وبرّر اختيارك.', 'items': PREP, 'answerSource': 'computed',
          'note': 'Récapitulatif des unités précédentes ; le prep 1 (la machine « + 85 » donne 104, la réponse « 104 − 85 ») est le germe de L1 mais chaque leçon mesure ses propres items du réseau (platform_addition).'})

# ── p. 79 : اكتشف ① البحث عن أعداد ناقصة ───────────────────────────────────────────────────────────
E.append({
    'id': 'act-1', 'kind': 'activity', 'number': 1, 'page': 79, 'section': 'اكتشف', 'title': 'البحث عن أعداد ناقصة', 'verified': True,
    'text': 'وضعية ① : وُزّعت 54 بيضة على 9 أطباق، بحيث يحتوي كل منها على نفس العدد من البيض. وضعية ② : تحتوي سلّة على 54 بيضة ؛ أخذنا من هذه السلّة عددا من البيض فبقيت فيها 9 بيضات. '
            'وضعية ③ : تحتوي سلة على عدد من البيض، وبعد أن أضيف إليها 9 بيضات صارت تحتوي على 54 بيضة. '
            '① نرمز بـ □ إلى العدد المجهول في كل وضعية. أرفق كل وضعية من الوضعيات أعلاه بالمساواة التي توافقها من بين المساويات الآتية : 54 − □ = 9 ؛ 9 × □ = 54 ؛ □ + 9 = 54. '
            '② ما هو الحساب الذي يسمح بإيجاد العدد المجهول □ في كل وضعية ؟ أنجز هذا الحساب.',
    'answer': {'situation1': {'equality': '9 × □ = 54', 'value': 54 // 9, 'calc': '54 ÷ 9'},
               'situation2': {'equality': '54 − □ = 9', 'value': 54 - 9, 'calc': '54 − 9'},
               'situation3': {'equality': '□ + 9 = 54', 'value': 54 - 9, 'calc': '54 − 9'}},
    'answerSource': 'computed',
})
assert 54 // 9 == 6 and 9 * 6 == 54 and 54 - 45 == 9 and 45 + 9 == 54
E.append({
    'id': 'act-2', 'kind': 'activity', 'number': 2, 'page': 79, 'section': 'أطبّق قاعدة حرفية', 'title': 'اختبار روفيي', 'verified': True,
    'text': 'اختبار روفيي لتكيّف القلب مع المجهود البدني : I = (a + b + c − 200) / 10 حيث a نبض القلب في الراحة قبل النشاط، b نبض القلب مباشرة بعد النشاط، c نبض القلب في الراحة بعد النشاط ؛ '
            'مقياس : I < 5 تكيّف جيّد ؛ 5 < I < 10 مقبول ؛ 10 < I < 15 متوسط ؛ I > 15 ناقص. ثلاثة أصدقاء : سمير (95 ؛ 140 ؛ 120) ، أمين (80 ؛ 130 ؛ 85) ، سيلين (65 ؛ 110 ؛ 70). انقل الجدول وأكمل I والترجمة.',
    'answer': {'samir': (95 + 140 + 120 - 200) / 10, 'amine': (80 + 130 + 85 - 200) / 10, 'selin': (65 + 110 + 70 - 200) / 10}, 'answerSource': 'computed',
})
assert [(95 + 140 + 120 - 200) / 10, (80 + 130 + 85 - 200) / 10, (65 + 110 + 70 - 200) / 10] == [15.5, 9.5, 4.5]

# ── p. 80 : اكتشف ③ ④ ───────────────────────────────────────────────────────────────────────────
E.append({
    'id': 'act-3', 'kind': 'activity', 'number': 3, 'page': 80, 'section': 'أنتج عبارات حرفية', 'title': 'اكتب « ... بدلالة ... »', 'verified': False,
    'text': 'أ) تحقّق من أنّ الطول AB يعبّر عنه بـ 3x + 5 (قطعة مقسّمة إلى ثلاث قطع طول كلّ منها x ثم قطعة طولها 5). ب) اكتب بدلالة x الطول MN (القطعة كلّها 10 وجزؤها الأيسر x). ج) عبّر بدلالة x عن محيط الشكل المرفق (خماسي : 7 ، 3 ، 7 وضلعان x).',
    'answer': {'ab': '3x + 5', 'mn': '10 − x', 'perimeter': '17 + 2x'}, 'answerSource': 'read',
    'reading': 'ج : المحيط 7 + 3 + 7 + x + x = 17 + 2x',
})
E.append({
    'id': 'act-calc', 'kind': 'activity', 'page': 80, 'section': 'حسابات على الهاتف', 'verified': False,
    'text': '25 حسابا طلب الأستاذ إنجازها : (2 × 5) + 3 ، (2 × 6) + 3 ، … ، (2 × 29) + 3. ما هي العبارة التي تقولها لزميلك ليتمكّن من إنجاز الواجب ؟',
    'answer': {'expression': '2 × n + 3', 'count': 29 - 5 + 1}, 'answerSource': 'computed',
})
assert 29 - 5 + 1 == 25
E.append({
    'id': 'act-prog', 'kind': 'activity', 'page': 80, 'section': 'برنامج حساب', 'verified': False,
    'text': 'برنامج الحساب : ① أختار عددا. ② أحسب ضعف العدد. ③ أضيف 3. طبّق البرنامج باختيار العدد 1 ، 2 ، 3 ثم 4. اكتب عبارة حرفية تترجم هذا البرنامج.',
    'answer': {'results': [2 * n + 3 for n in (1, 2, 3, 4)], 'expression': '2 × x + 3'}, 'answerSource': 'computed',
})
assert [2 * n + 3 for n in (1, 2, 3, 4)] == [5, 7, 9, 11]
E.append({
    'id': 'act-4', 'kind': 'activity', 'number': 4, 'page': 80, 'section': 'أبرّر بالمثال المضاد', 'verified': True,
    'text': 'تمعّن أمين في مكعّب، فلاحظ أنّ له 6 أوجه و 8 رؤوس، فوضع القاعدة F + 2 = S حيث F عدد الأوجه و S عدد الرؤوس. هل القاعدة صحيحة في حالة متوازي مستطيلات ؟ في حالة الشكل المقابل (هرم قاعدته رباعية) ؟ ماذا تستنتج ؟',
    'answer': {'cube': 6 + 2 == 8, 'cuboid': 6 + 2 == 8, 'pyramid': 5 + 2 == 5, 'note': 'الهرم الرباعي : 5 أوجه و 5 رؤوس ؛ 5 + 2 ≠ 5 : مثال مضاد'}, 'answerSource': 'computed',
})
assert 6 + 2 == 8 and 5 + 2 != 5

# ── p. 81 : أحوصل تعلّماتي ────────────────────────────────────────────────────────────────────────
E.append({
    'id': 'know-1', 'kind': 'knowledge', 'number': 1, 'page': 81, 'section': 'أحوصل تعلّماتي', 'title': 'العبارة الحرفية', 'verified': True,
    'text': 'العبارة الحرفية هي عبارة يكون فيها عدد أو عدّة أعداد معيّنة بحروف. مثال : مساحة مستطيل بعداه a و b : a × b ؛ برنامج الحساب (نختار عددًا، نحسب ضعفه، نضيف 3) : نسمّي x العدد المختار : 2 × x ثم 2 × x + 3. '
            'اصطلاحات : يمكن الاستغناء عن الإشارة × بين حرفين، بين عدد وحرف أو أمام قوس : a × b = ab ؛ x × 2 = 2x ؛ 3 × (x + 2) = 3(x + 2). ملاحظات : لا نحذف × في جداء عددين ؛ يكتب العدد قبل الحرف ؛ x × 1 = x ؛ ba = ab ؛ x × 0 = 0 ؛ a × a = a² .',
    'items': {
        'definition-convention': 'la « عبارة حرفية » (a × b, 2 × x puis 2 × x + 3) et les اصطلاحات : × omis entre deux lettres, entre un nombre et une lettre, devant une parenthèse ; le nombre avant la lettre ; × jamais omis entre deux nombres (L2, module 2)',
        'remarks': 'x × 1 = x ; ba = ab ; x × 0 = 0 ; a × a = a² (L3, module 2)',
    },
    'answerSource': 'read',
})
E.append({
    'id': 'know-2', 'kind': 'knowledge', 'number': 2, 'page': 81, 'section': 'أستعمل عبارة حرفية', 'verified': True,
    'items': {
        'write-in-x': 'أكتب بدلالة x : نعني بكتابة نتيجة بدلالة x ترجمتها بعبارة حرفية تتضمن x. (مثال : AB = 2x + 3 في الشكل : قطعتان طول كل منهما x ثم 3.)',
        'apply-rule': 'أطبّق قاعدة حرفية : القاعدة الحرفية هي مساواة تسمح بحساب مقدار بمعرفة مقادير أخرى. تطبيق قاعدة هو تعويض المقادير المعلومة بأعداد ثم إجراء الحسابات. (مثال : P = 2(a + b) ؛ a = 6 و b = 2 : P = 2(6 + 2) = 16.)',
    },
    'answer': {'P': 2 * (6 + 2)}, 'answerSource': 'computed',
})
assert 2 * (6 + 2) == 16

# ── p. 82 : أكتسب طرائق — البحث عن العدد الذي ينقص ────────────────────────────────────────────────
M1S, M1B = q('25.3'), q('61.2')
M2A, M2B = q('26'), q('332.8')
assert M1B - M1S == q('35.9') and q('35.9') + M1S == M1B
assert M2B / M2A == q('12.8') and q('12.8') * M2A == M2B
E.append({
    'id': 'method-1', 'kind': 'method', 'number': 1, 'page': 82, 'section': 'أكتسب طرائق', 'title': 'البحث عن العدد الذي ينقص', 'verified': True,
    'text': 'مثال 1 (مجموع) : عيّن قيمة □ بحيث □ + 25,3 = 61,2. نترجم المساواة بمخطط حساب (□ ← + 25,3 ← 61,2) ؛ نستعمل العملية العكسية للجمع : □ = 61,2 − 25,3 ؛ نتحقّق : 35,9 + 25,3 = 61,2 ؛ نجيب : 35,9. '
            'مثال 2 (جداء) : عيّن قيمة □ بحيث □ × 26 = 332,8. المخطط (□ ← × 26 ← 332,8) ؛ العملية العكسية للضرب : □ = 332,8 ÷ 26 ؛ نتحقّق : 12,8 × 26 = 332,8 ؛ نجيب : 12,8. '
            'طريقة : البحث عن العدد الذي ينقص في مجموع يحوّل إلى حساب فرق عددين ؛ في جداء يحوّل إلى حساب حاصل قسمة عددين.',
    'answer': {'sum': fr(M1B - M1S), 'product': fr(M2B / M2A)}, 'answerSource': 'computed',
})
NOW1 = q('47.23') + q('18.9')   # □ − 18,9 = 47,23
NOW2 = q('123.8') / 13         # □ × 13 = 123,8 (lecture)
E.append({
    'id': 'now-82', 'kind': 'now', 'page': 82, 'section': 'دوري الآن', 'verified': True,
    'text': 'عيّن في كلّ حالة العدد الذي ينقص. (1) □ − 18,9 = 47,23 ؛ (2) □ − 123,8 ÷ 13.',
    'answer': {'1': fr(NOW1), '2': fr(NOW2)}, 'answerSource': 'computed',
    'reading': 'le (2) est imprimé « □ − 123,8 ÷ 13 » : faute d\'impression pour « □ × 13 = 123,8 » (la division 123,8 ÷ 13 = 619/65 ne s\'arrête pas) ; lu ainsi',
})
assert NOW1 == q('66.13') and NOW2 == F(619, 65)

# ── pp. 83–84 : أتمرّن ──────────────────────────────────────────────────────────────────────────
E.append({'id': 'ex-1', 'kind': 'exercise', 'number': 1, 'page': 83, 'section': 'أتمرّن — أمثلة لعبارات حرفية', 'verified': False,
          'text': 'ماذا توافق كلّ عبارة من العبارات الحرفية بالنسبة إلى الأشكال الآتية : L × l ؛ 2 × π × r ؛ c × c ؛ 2 × (L + l) ؟ (مربع ضلعه c ، قرص نصف قطره r ، مستطيل L و l).', 'answerSource': 'read'})
E.append({'id': 'ex-2', 'kind': 'exercise', 'number': 2, 'page': 83, 'section': 'أتمرّن — أمثلة لعبارات حرفية', 'verified': False,
          'text': 'اربط كلّ عبارة لفظية بالعبارة الحرفية المناسبة : مجموع 5 والفرق بين y و 3 ؛ جداء 5 في مجموع y و 3 ؛ الفرق بين جداء 5 في y و 3 …', 'answerSource': 'read'})
E.append({'id': 'ex-3', 'kind': 'exercise', 'number': 3, 'page': 83, 'section': 'أتمرّن — كتابة عبارات حرفية باحترام الاصطلاحات', 'verified': False,
          'text': 'اكتب العبارات الآتية بإعادة كتابة الإشارة × أين يمكن ذلك : A = 2x − 27 ؛ B = (3x − 1) × 5 ؛ C = 3x − 2y + 1.', 'answerSource': 'read'})
A4 = lambda x: x + 15 - x / 2
assert A4(F(2)) == 16 and A4(F(1, 2)) == F(61, 4)
E.append({'id': 'ex-4', 'kind': 'exercise', 'number': 4, 'page': 83, 'section': 'تطبيق قاعدة حرفية', 'verified': True,
          'text': 'نضع العبارة A = x + 15 − x/2 : احسب قيمة A من أجل x = 2 ، ثم من أجل x = 0,5.', 'answer': {'x=2': fr(A4(F(2))), 'x=0,5': fr(A4(F(1, 2)))}, 'answerSource': 'computed'})
assert (3 * 2) - (4 * 1) + 5 == 7
E.append({'id': 'ex-5', 'kind': 'exercise', 'number': 5, 'page': 83, 'section': 'تطبيق قاعدة حرفية', 'verified': True,
          'text': 'نضع x = 2 و y = 1. احسب قيمة العبارة A = (3 × x) − (4 × y) + 5.', 'answer': {'A': 7}, 'answerSource': 'computed'})
E.append({'id': 'ex-6', 'kind': 'exercise', 'number': 6, 'page': 83, 'section': 'تطبيق قاعدة حرفية', 'verified': True,
          'text': 'التركيز الكتلي لمحلول مائي T = m / v (m كتلة السكر بالغرام ، v حجم المحلول باللتر). أكمل جدولا : كتلة السكر 2 ؛ 4 ؛ … ؛ 10 ؛ … والحجم 100 ؛ … ؛ 300 ؛ 400 ؛ 500 والتركيز … ؛ 20 ؛ 30 ؛ … ؛ 50.', 'answerSource': 'read',
          'reading': 'les volumes du tableau sont imprimés en mL (100 ; 300 ; 400 ; 500) alors que la règle T = m / v demande des litres : la lecture du tableau est incohérente (2 g dans 100 mL = 20 g/L) ; la leçon ne reprend pas ce tableau, elle écrit sa propre règle V = d ÷ t'})
E.append({'id': 'ex-7', 'kind': 'exercise', 'number': 7, 'page': 83, 'section': 'كتابة ... بدلالة ...', 'verified': False,
          'text': 'n عدد طبيعي. عبّر بدلالة n عن كلّ من : نصف n ؛ العدد الذي يلي n ؛ العدد الذي يسبق n ؛ ضعف n ؛ ثلث n.', 'answer': {'expr': ['n/2', 'n + 1', 'n − 1', '2n', 'n/3']}, 'answerSource': 'read'})
E.append({'id': 'ex-8', 'kind': 'exercise', 'number': 8, 'page': 83, 'section': 'كتابة ... بدلالة ...', 'verified': False,
          'text': 'وحدة الأطوال هي cm. عبّر عن AB بدلالة x (قطعة بها ثلاث قطع x وقطعة 5).', 'answerSource': 'read'})
E.append({'id': 'ex-9', 'kind': 'exercise', 'number': 9, 'page': 83, 'section': 'كتابة ... بدلالة ...', 'verified': False,
          'text': 'وحدة الأطوال هي cm. عبّر عن EF بدلالة x (قطعة بها ثلاث قطع x وقطعتان 2).', 'answerSource': 'read'})
E.append({'id': 'ex-10', 'kind': 'exercise', 'number': 10, 'page': 84, 'section': 'أتمرّن — أنتج واستعمل عبارات حرفية', 'verified': False,
          'text': 'يتركب الشكل الآتي من مستطيلين، عبّر بدلالة x عن محيطه (AB = x ، BC = 1,5 ، CD = 3).', 'answer': {'perimeter': '2x + 9'}, 'answerSource': 'read',
          'reading': 'P = 2 × (x + 1,5) + 2 × 3 = 2x + 9'})
E.append({'id': 'ex-11', 'kind': 'exercise', 'number': 11, 'page': 84, 'section': 'أتمرّن — أنتج واستعمل عبارات حرفية', 'verified': False,
          'text': 'في الشكل الآتي كلّ الزوايا قائمة. عبّر عن محيط الشكل بدلالة x و y.', 'answerSource': 'read'})
E.append({'id': 'ex-12', 'kind': 'exercise', 'number': 12, 'page': 84, 'section': 'أتمرّن — أنتج واستعمل عبارات حرفية', 'verified': False,
          'text': 'ماذا تعني العبارات الحرفية الآتية بالنسبة إلى الشكل (مستطيلان : مربع ضلعه b وشريط عرضه 1,5) : أ) b² + 1,5b ؛ ب) 4b + 3 ؛ ج) 2(1,5 + 2b) ؛ د) b(1,5 + b).', 'answerSource': 'read'})
E.append({'id': 'ex-13', 'kind': 'exercise', 'number': 13, 'page': 84, 'section': 'أتمرّن — أنتج واستعمل عبارات حرفية', 'verified': False,
          'text': 'ملأ أمين الجدول الآتي : a = 5 ؛ 10 ؛ 12 ؛ 15 و b = 21 ؛ 41 ؛ 49 ؛ x. أ) ما هو الحساب الذي استعمله أمين ليحوّل a إلى b ؟ ب) عيّن قيمة x. ج) اكتب العبارة التي تعطي a بدلالة b.',
          'answer': {'rule': 'b = 4 × a + 1', 'x': 4 * 15 + 1}, 'answerSource': 'computed',
          'reading': 'la règle b = 4a + 1 (5 → 21, 10 → 41, 12 → 49) ; x = 61 ; la question ج demande a en fonction de b : a = (b − 1)/4 (renversement : concerne aussi L1 mais pas de nombre manquant isolé)'})
assert [4 * a + 1 for a in (5, 10, 12)] == [21, 41, 49] and 4 * 15 + 1 == 61
E.append({'id': 'ex-14', 'kind': 'exercise', 'number': 14, 'page': 84, 'section': 'التدريب على التعميم والاستدلال', 'verified': False,
          'text': 'هذا برنامج حساب : أختار عددا أوّلا ؛ أضيف العدد الذي يليه ؛ أضيف العدد الذي يسبق العدد الأوّل. برّر تأكيد أمين : « نتيجة الحساب هي عدد يقبل القسمة على 3 دائما ».',
          'answer': {'expression': 'n + (n + 1) + (n − 1) = 3n'}, 'answerSource': 'computed'})
# ── la section « البحث عن أعداد ناقصة » (p. 84) : ex-15 à ex-18 ─────────────────────────────────
E15 = {'a': ('63 + … = 208', q('208') - q('63')), 'b': ('… − 8 = 56', q('56') + q('8')), 'c': ('11,7 = 9 + …', q('11.7') - q('9')), 'd': ('… − (1 + 6,45) = 3', q('3') + q('1') + q('6.45'))}
assert [fr(v) for _, v in E15.values()] == ['145', '64', '2,7', '10,45']
E.append({'id': 'ex-15', 'kind': 'exercise', 'number': 15, 'page': 84, 'section': 'البحث عن أعداد ناقصة', 'verified': True,
          'text': 'في التمرينين 15 و 16، المطلوب إيجاد الأعداد الناقصة المناسبة في كلّ حالة : أ) 63 + … = 208 ؛ ب) … − 8 = 56 ؛ ج) 11,7 = 9 + … ؛ د) … − (1 + 6,45) = 3.',
          'answer': {k: {'equality': e, 'value': fr(v)} for k, (e, v) in E15.items()}, 'answerSource': 'computed'})
E16 = {'a': ('10 × … = 53', q('53') / 10), 'b': ('… × 5 = 44', q('44') / 5), 'c': ('72 = 3 × …', q('72') / 3), 'd': ('326 = 4 × …', q('326') / 4)}
assert [fr(v) for _, v in E16.values()] == ['5,3', '8,8', '24', '81,5']
E.append({'id': 'ex-16', 'kind': 'exercise', 'number': 16, 'page': 84, 'section': 'البحث عن أعداد ناقصة', 'verified': True,
          'text': 'أ) 10 × … = 53 ؛ ب) … × 5 = 44 ؛ ج) 72 = 3 × … ؛ د) 326 = 4 × … .',
          'answer': {k: {'equality': e, 'value': fr(v)} for k, (e, v) in E16.items()}, 'answerSource': 'computed'})
assert q('84.5') / q('6.5') == 13
E.append({'id': 'ex-17', 'kind': 'exercise', 'number': 17, 'page': 84, 'section': 'البحث عن أعداد ناقصة', 'verified': True,
          'text': 'مستطيل مساحته 84,5 cm². احسب عرضه علما أنّ طوله يساوي n.',
          'answerSource': 'read', 'answer': None,
          'reading': 'la longueur est imprimée « n » (une lettre : faute d\'impression ou énoncé littéral laissé sans valeur) : L1 le rend avec sa propre longueur (6,5 cm → 84,5 ÷ 6,5 = 13 cm ; un produit à trou ℓ × … = aire).'})
assert (26 - 5) // 3 == 7 and 7 * 3 + 5 == 26
E.append({'id': 'ex-18', 'kind': 'exercise', 'number': 18, 'page': 84, 'section': 'البحث عن أعداد ناقصة', 'verified': True,
          'text': 'أختار عددا، أضربه في 3 وأضيف 5 للنتيجة. ما هو العدد الذي أكون قد اخترته إذا كنت سأحصل على 26 ؟',
          'answer': {'start': 7, 'steps': ['26 − 5 = 21', '21 ÷ 3 = 7'], 'check': '7 × 3 + 5 = 26'}, 'answerSource': 'computed'})

# ── p. 85 : أقوّم تعلّماتي ───────────────────────────────────────────────────────────────────────
E.append({'id': 'self-1', 'kind': 'self', 'number': 1, 'page': 85, 'section': 'أقوّم تعلّماتي', 'verified': False,
          'text': 'أجب بصحيح أم خاطئ مع التعليل : أ) العبارة الحرفية 2a + 7 هي جداء 2 و a + 7. ب) العبارة الحرفية 3 − (a + 7) هي فرق a + 7 و 3.', 'answer': {'a': False, 'b': False}, 'answerSource': 'read',
          'reading': 'lecture des deux affirmations (a : 2a + 7 est la somme de 2a et 7 → faux ; b : 3 − (a+7) est la différence de 3 et (a + 7) dans cet ordre → faux)'})
E.append({'id': 'self-2', 'kind': 'self', 'number': 2, 'page': 85, 'section': 'أقوّم تعلّماتي', 'verified': False,
          'text': '5 × x + 2 × y = … (7x + y ؛ 10xy ؛ 5x + 2y ؛ 7xy).', 'answer': {'correct': '5x + 2y'}, 'answerSource': 'computed'})
E.append({'id': 'self-3', 'kind': 'self', 'number': 3, 'page': 85, 'section': 'أقوّم تعلّماتي', 'verified': False,
          'text': 'وحدة الأطوال هي السنتيمتر. أ) اكتب العبارة الحرفية التي تعبّر عن محيط المستطيل (البعدان 5 و x). ب) احسب محيط المستطيل من أجل x = 2,5 ؛ x = 4. ج) أعد رسم المستطيل بحيث يكون محيطه مساويا 22.',
          'answer': {'P': '2 × (5 + x)', 'x=2,5': fr(2 * (q('5') + q('2.5'))), 'x=4': 18, 'x for 22': 22 // 2 - 5}, 'answerSource': 'computed'})
assert 2 * (5 + 2.5) == 15 and 2 * (5 + 4) == 18 and 22 // 2 - 5 == 6
E.append({'id': 'self-4', 'kind': 'self', 'number': 4, 'page': 85, 'section': 'أقوّم تعلّماتي', 'verified': False,
          'text': 'بتطبيق البرنامجين بيّن إن كان التأكيد صحيحا مع التعليل : ① اختر عددا ؛ أضف 4 ؛ اضرب في 2 ؛ اطرح 8 : الناتج ضعف عدد البداية دائما. ② اختر عددا يختلف عن 0 ؛ أربعه ؛ أضف ثلاثة أمثال العدد ؛ أقسم على عدد البداية : الناتج يزيد بثلاث وحدات عن عدد البداية دائما.',
          'answer': {'1': 'صحيح : (n + 4) × 2 − 8 = 2n', '2': 'خاطئ : (4n + 3n) ÷ n = 7 ، لا يتعلّق بعدد البداية'}, 'answerSource': 'computed',
          'reading': 'le programme ② est lu « n ; ×4 ; + 3n ; ÷ n » → 7'})
E.append({'id': 'self-5', 'kind': 'self', 'number': 5, 'page': 85, 'section': 'أقوّم تعلّماتي', 'verified': True,
          'text': 'بجمع عدد طبيعي وضعفه وثلاثة أمثاله أجد 102. العدد الطبيعي هو : أ) 7 ؛ ب) 17 ؛ ج) 71.',
          'answer': {'correct': 'ب', 'value': 102 // (1 + 2 + 3), 'why': 'n + 2n + 3n = 6n = 102 : n = 17 (6 × … = 102)'}, 'answerSource': 'computed'})
assert 102 // 6 == 17 and 17 + 34 + 51 == 102 and 6 * 7 != 102 and 6 * 71 != 102
assert 20 + 3 * 20 + 5 * 20 == 180
E.append({'id': 'self-6', 'kind': 'self', 'number': 6, 'page': 85, 'section': 'أقوّم تعلّماتي', 'verified': False,
          'text': 'مجموع أقيسة الزوايا الداخلية لمثلث هو 180°. ما هو قيس كلّ زاوية من زوايا المثلث (x ، 3x ، 5x) ؟',
          'answer': {'x': 180 // 9, 'angles': [20, 60, 100]}, 'answerSource': 'computed'})
assert 9 * 20 == 180
E.append({'id': 'self-7', 'kind': 'self', 'number': 7, 'page': 85, 'section': 'أقوّم تعلّماتي', 'verified': False,
          'text': 'وحدة الأطوال هي السنتيمتر. قيمة x هي : أ) 6 ؛ ب) 8 ؛ ج) 9 (قطعة 20 مقسّمة إلى أجزاء : x مرّات و 2).', 'answerSource': 'read'})
FIB = [2, 3, 5, 8, 13, 21]
assert all(FIB[i] == FIB[i - 1] + FIB[i - 2] for i in range(2, 6)) and 13 + 21 == 34
E.append({'id': 'self-8', 'kind': 'self', 'number': 8, 'page': 85, 'section': 'أقوّم تعلّماتي', 'verified': False,
          'text': 'لاحظ الانتظام في قائمة الأعداد الطبيعية الآتية : 2 3 5 8 13 21. اكتب قائمة أخرى من ستة أعداد على نفس المنوال.', 'answer': {'rule': 'كلّ عدد هو مجموع العددين السابقين له (من الثالث)', 'next': 13 + 21}, 'answerSource': 'computed'})

# ── p. 86 : أتعمّق ───────────────────────────────────────────────────────────────────────────────
CAR_MONTH = F(1700000 - 500000, 12)
assert CAR_MONTH == 100000 and 500000 + 12 * 100000 == 1700000
E.append({'id': 'deep-1', 'kind': 'deepen', 'number': 1, 'page': 86, 'section': 'أتعمّق — إنتاج واستعمال عبارات حرفية', 'title': 'شراء سيارة', 'verified': True,
          'text': 'تقترح وكالة بيع سيارات العرض الآتي : ثمن سيارة 1 700 000 DA ؛ إمكانية تسبيق 500 000 DA والباقي بالتقسيط على 12 شهرا دون فائدة. 1) بفرض المبلغ الشهري y، ترجم الوضعية بعبارة حرفية بدلالة y. 2) ما هو المبلغ الشهري الذي سيدفعه شخص مهتم بشراء السيارة ؟',
          'answer': {'expression': '500 000 + 12 × y = 1 700 000', 'y': fr(CAR_MONTH)}, 'answerSource': 'computed',
          'reading': 'deux étapes : 1 700 000 − 500 000 = 1 200 000 puis 1 200 000 ÷ 12 = 100 000 (un nombre manquant dans un produit après une soustraction)'})
E.append({'id': 'deep-2', 'kind': 'deepen', 'number': 2, 'page': 86, 'section': 'أتعمّق — إنتاج واستعمال عبارات حرفية', 'title': 'مربعات ملوّنة', 'verified': False,
          'text': 'يتشكّل المربع من مربعات صغيرة متقايسة بعضها ملوّن (القطر). 1) احسب عدد المربعات الصغيرة الملوّنة في الشكل. 2) اكتب قاعدة حرفية تعبّر عن عدد المربعات الصغيرة الملوّنة في كلّ شكل مصنوع على نفس المنوال.', 'answerSource': 'read'})
E.append({'id': 'deep-3', 'kind': 'deepen', 'number': 3, 'page': 86, 'section': 'أتعمّق — إنتاج واستعمال عبارات حرفية', 'title': 'لعبة المكعبات', 'verified': False,
          'text': 'لاحظ البناء الآتي (ثلاثة أبنية بطوابق من المكعبات). 1) ما هو عدد المكعبات اللازمة لكلّ بناء ؟ 2) C عدد المكعبات و E عدد الطوابق : عبارة واحدة فقط تسمح بمعرفة عدد المكعبات : C = 2 + E ؛ C = E × E ؛ C = 2 × E. 3) احسب عدد المكعبات لبناء له 10 طوابق.', 'answerSource': 'read',
          'reading': 'figure non relue (3 constructions) : à relire par L3 / la synthèse'})
E.append({'id': 'deep-4', 'kind': 'deepen', 'number': 4, 'page': 86, 'section': 'التدريب على التعميم والاستدلال', 'verified': False,
          'text': 'برنامج الحساب : أختار عددا ؛ أضيف 3 ؛ أضرب النتيجة في 2 ؛ أطرح 6 ؛ أطرح ضعف العدد البداية. 1) اختبر هذا البرنامج باستعمال عدّة أعداد. 2) ماذا تلاحظ ؟ برّر صدق ملاحظتك.',
          'answer': {'always': 0, 'why': '(n + 3) × 2 − 6 − 2n = 0'}, 'answerSource': 'computed'})
assert all((n + 3) * 2 - 6 - 2 * n == 0 for n in range(0, 20))
E.append({'id': 'deep-5', 'kind': 'deepen', 'number': 5, 'page': 86, 'section': 'التدريب على التعميم والاستدلال', 'verified': True,
          'text': 'حسبت سيلين العبارتين 2 × n × n و n × n × 2 من أجل n = 0 و n = 2 ثم قالت : « العبارتان n × n × 2 و 2 × n × n متساويتان ». هل توافقها ؟ برّر.', 'answer': {'n=0': [0, 0], 'n=2': [8, 8], 'yes': True}, 'answerSource': 'computed'})
assert 2 * 2 * 2 == 8
STAIR = (63 - 2 * 17)  # (2 × h) + g = 63, h = 17
assert STAIR == 29
E.append({'id': 'deep-6', 'kind': 'deepen', 'number': 6, 'page': 86, 'section': 'البحث عن أعداد ناقصة', 'title': 'الدرج الجيّد', 'verified': True,
          'text': 'وحدة الأطوال : cm. الدرج الجيّد هو الذي تُحترم فيه القاعدة (2 × h) + g = 63 حيث h ارتفاع درجة و g عرضها. احسب عرض درجة علما أنّ الارتفاع يساوي 17 cm.',
          'answer': {'g': STAIR, 'steps': ['2 × 17 = 34', '34 + g = 63', 'g = 63 − 34 = 29']}, 'answerSource': 'computed'})
# La pyramide : la dalle du dessus est la somme des deux dalles qui la portent.
# Rangée du bas : b1 b2 b3 13 ; deuxième : 66, r2, 20 ; troisième : s1 s2 ; sommet : 146.
b4 = 13; r3 = 20; b3 = r3 - b4; r1 = 66; top = 146
r2 = (top - r1 - r3) // 2
assert (top - r1 - r3) % 2 == 0
b2 = r2 - b3; b1 = r1 - b2; s1 = r1 + r2; s2 = r2 + r3
assert b1 + b2 == r1 and b2 + b3 == r2 and b3 + b4 == r3 and s1 + s2 == top
PYR = {'bottom': [b1, b2, b3, b4], 'third': [r1, r2, r3], 'second': [s1, s2], 'top': top}
assert PYR == {'bottom': [43, 23, 7, 13], 'third': [66, 30, 20], 'second': [96, 50], 'top': 146}
E.append({'id': 'deep-7', 'kind': 'deepen', 'number': 7, 'page': 86, 'section': 'البحث عن أعداد ناقصة', 'title': 'جدار البلاطات', 'verified': True,
          'text': 'أكمل القيم الناقصة على الحائط، علما أنّ العدد المكتوب على كلّ بلاطة هو مجموع العددين المكتوبين على البلاطتين اللتين تستند عليهما هذه البلاطة. (القمّة 146 ؛ الصفّ الثالث 66 ، … ، 20 ؛ الصفّ الأخير … ، … ، … ، 13).',
          'answer': PYR, 'answerSource': 'computed',
          'reading': 'figure : 4 rangées (1, 2, 3, 4 dalles) ; 146 au sommet, 66 et 20 sur la troisième rangée, 13 à droite du bas ; le reste se retrouve par sommes et différences'})

# ── p. 87 : أتعلّم الإدماج ───────────────────────────────────────────────────────────────────────
N = lambda s, c, e, t: 3 * s + 2 * c + e + t
V = {'V1': (3, 1, 2, 3), 'V2': (2, 2, 2, 2), 'V3': (2, 2, 1, 2), 'V4': (3, 3, 3, 1), 'V5': (1, 1, 3, 3)}
SCORE = {k: N(*v) for k, v in V.items()}
assert SCORE == {'V1': 16, 'V2': 14, 'V3': 13, 'V4': 19, 'V5': 11}
E.append({'id': 'integration', 'kind': 'integration', 'page': 87, 'section': 'أتعلّم الإدماج', 'title': 'أحسن سيارة للسنة', 'verified': False,
          'text': 'مجلة مختصة في السيارات تستعمل نظاما لتقييم السيارات الجديدة. جدول علامات خمس سيارات V1 … V5 حسب المعايير : جهاز الأمان S ، استهلاك الوقود C ، الجانب الجمالي E ، تجهيز داخلي T ؛ N = 3S + 2C + E + T. '
            '1) عيّن أحسن سيارة. 2) اقترح عبارة تتضمن نفس المعايير بحيث تكون V5 هي الفائزة بالشعار.',
          'answer': {'scores': SCORE, 'best': 'V4'}, 'answerSource': 'computed',
          'reading': 'lecture du tableau à 110 dpi : (S, C, E, T) = V1 (3,1,2,3), V2 (2,2,2,2), V3 (2,2,1,2), V4 (3,3,3,1), V5 (1,1,3,3) ; l\'ordre des colonnes est RTL (T, E, C, S) : à relire par la synthèse'})
E.append({'id': 'evaluation', 'kind': 'integration', 'page': 87, 'section': 'وضعية تقويم', 'title': 'حافة المسبح', 'verified': False,
          'text': 'الوجه العلوي لمسبح له شكل مستطيل، يريد صاحبه وضع حافة من البلاط من حوله بنفس العرض. أبعاد المسبح 5 m و 12 m ؛ عرض الحافة 1,5 m ؛ يباع البلاط في صناديق يحتوي كلّ منها على 1 متر مربع من البلاط ؛ ثمن الصندوق الواحد 1600 DA ؛ البناء 700 DA للمتر المربع الواحد. ما هي تكاليف وضع البلاط على حافة المسبح ؟',
          'answer': {'borderArea': 60, 'note': 'مساحة الحافة = (5 + 3)(12 + 3) − 5 × 12 = 120 − 60 = 60 m²'}, 'answerSource': 'computed'})
assert (5 + 3) * (12 + 3) - 5 * 12 == 60 and 60 * 1600 + 60 * 700 == 138000

# ── p. 88 : استعمل تكنولوجيات الإعلام والاتصال ────────────────────────────────────────────────────
E.append({'id': 'ict', 'kind': 'ict', 'page': 88, 'section': 'استعمل تكنولوجيات الإعلام والاتصال', 'title': 'تعيين قيمة عددية لعبارة حرفية باستعمال مجدول', 'verified': True,
          'text': 'مثال : احسب القيم العددية للعبارة 7x − 15 من أجل القيم الصحيحة لـ x والمحصورة بين 3 و 15. فتح ورقة حساب جديدة ؛ في الخلية B2 نكتب « =7*A2-15 » ؛ نضيف 1 في كلّ خانة انطلاقا من 3 من العمود A ؛ ننقل الحساب إلى الخلايا الواقعة أسفل B2 بسحب اليد (ظهور العلامة +). ما هي العبارة الظاهرة عند fx ؟',
          'answer': {'first': 7 * 3 - 15, 'last': 7 * 15 - 15}, 'answerSource': 'computed'})
E.append({'id': 'ict-ex', 'kind': 'ict', 'page': 88, 'section': 'تمرين', 'verified': True,
          'text': 'احسب القيم العددية للعبارة 2(x − 1) + 3 ، من أجل القيم الصحيحة لـ x والمحصورة بين 2 و 20.', 'answer': {'first': 2 * (2 - 1) + 3, 'last': 2 * (20 - 1) + 3}, 'answerSource': 'computed'})
assert 2 * (2 - 1) + 3 == 5 and 2 * (20 - 1) + 3 == 41

# ── Destinations ────────────────────────────────────────────────────────────────────────────────
L1, L2, L3, SYN = 'bahth-adad-naqisa', 'tatbiq-qaida-harfiya', 'intaj-ibara-harfiya', 'wadiya-idmajiya-ibarat-harfiya'
DEST = {
    '_comment': 'elementId → { lesson, module } ; `items` répartit un élément ; une leçon encore coming_soon est une destination EN ATTENTE (check-textbook-coverage.mjs). Première leçon générée de l’unité : bahth-adad-naqisa (2026-10-30). Frontière entre les leçons : voir l’en-tête de build-extraction.py.',
    'objectives': {'lesson': 'unit', 'module': 'page'},
    'opener-challenge': {'lesson': SYN, 'module': None, 'note': 'le تحدّ de l\'unité (units_1am › ibarat-harfiya.challenge) : n(n+1)/2 = 6n, n = 11 ; il mêle lettre et nombre manquant'},
    'opener-khwarizmi': {'lesson': L1, 'module': 2, 'note': 'une carte « من تاريخ الرياضيات » en fin de معارف : al-Khwarizmi et « الجبر والمقابلة » (la restauration d\'une égalité), sans renvoi au livre'},
    'prep': {'lesson': SYN, 'module': 0, 'note': 'p. 78 récapitule les unités précédentes ; chaque leçon de l\'unité mesure ses items du réseau par des platform_addition ; le prep 1 (machine « + 85 » donne 104) est l\'idée de L1, repris par son labo'},
    'act-1': {'lesson': L1, 'module': 4, 'note': 'les trois situations (9 × … = 54 ; 54 − … = 9 ; … + 9 = 54) deviennent l\'exercice « اربط الوضعية بمساواتها » de أتمرّن avec d\'autres contextes et nombres ; l\'ENTRÉE est le labo rewind-belt (l\'atelier d\'emballage)'},
    'act-2': {'lesson': L2, 'module': 4, 'note': "le test de Ruffier (I = (a + b + c − 200)/10, trois valeurs) devient l'exercice « les points d'un classement » P = 3 × w + d de أتمرّن (une règle à deux lettres, trois équipes) ; l'ENTRÉE est le labo letter-dial"},
    'act-3': {'lesson': L3, 'module': 1},
    'act-calc': {'lesson': L3, 'module': 1},
    'act-prog': {'lesson': L3, 'module': 1},
    'act-4': {'lesson': L2, 'module': 1, 'note': "la règle F + 2 = S réfutée par un contre-exemple : le labo letter-dial (tâche a3 : « a + b = a × b » vraie pour (2 ; 2), réfutée par (3 ; 4)) et l'exercice « ضعف أيّ عدد أكبر منه » (n = 0)"},
    'know-1': {'lesson': L3, 'module': 2, 'note': "partagé : la définition et les اصطلاحات (× omis, nombre avant la lettre, jamais entre deux nombres) sont nommés par L2 (module 2, P1 du catalogue) ; les remarques x × 1, ba = ab, x × 0, a × a sont à L3",
              'items': {'definition-convention': {'lesson': L2, 'module': 2}, 'remarks': {'lesson': L3, 'module': 2}}},
    'know-2': {'lesson': L3, 'module': 2, 'items': {
        'write-in-x': {'lesson': L3, 'module': 2},
        'apply-rule': {'lesson': L2, 'module': 2}}},
    'method-1': {'lesson': L1, 'module': 3, 'note': 'la méthode du manuel (traduire par un schéma de calcul, opération inverse, vérifier, répondre) est celle du module 3, avec d\'autres nombres : □ + 18,6 = 45,1 et □ × 13 = 41,6'},
    'now-82': {'lesson': L1, 'module': 4, 'note': '(1) □ − 18,9 = 47,23 : le moins en première position (→ addition) ; (2) imprimé « □ − 123,8 ÷ 13 » : lu « □ × 13 = 123,8 » (619/65, un quotient qui ne s\'arrête pas) ; repris avec d\'autres nombres'},
    'ex-1': {'lesson': L3, 'module': 4}, 'ex-2': {'lesson': L3, 'module': 4}, 'ex-3': {'lesson': L3, 'module': 4},
    'ex-4': {'lesson': L2, 'module': 4}, 'ex-5': {'lesson': L2, 'module': 4}, 'ex-6': {'lesson': L2, 'module': 4},
    'ex-7': {'lesson': L3, 'module': 4}, 'ex-8': {'lesson': L3, 'module': 4}, 'ex-9': {'lesson': L3, 'module': 4}, 'ex-10': {'lesson': L3, 'module': 4}, 'ex-11': {'lesson': L3, 'module': 4},
    'ex-12': {'lesson': L3, 'module': 4}, 'ex-13': {'lesson': L3, 'module': 4}, 'ex-14': {'lesson': L3, 'module': 4},
    'ex-15': {'lesson': L1, 'module': 4, 'note': 'les quatre égalités de somme et de différence, avec d\'autres nombres : un moins en première position (… − 8), un décimal, une parenthèse (… − (1 + 6,45) = 3)'},
    'ex-16': {'lesson': L1, 'module': 4, 'note': 'les quatre produits (dont 53 ÷ 10 et 326 ÷ 4 : décimaux, 5,3 et 81,5), avec d\'autres nombres'},
    'ex-17': {'lesson': L1, 'module': 4, 'note': 'la longueur « n » est une faute d\'impression : L1 donne sa propre longueur et pose « ℓ × … = aire »'},
    'ex-18': {'lesson': L1, 'module': 7, 'note': 'le programme à deux étapes (× 3 puis + 5 donne 26) est REMONTÉ : la مسألة 3 (l\'escalier) et la مسألة 2 (le paiement par mensualités) reprennent cette remontée à deux cartes, avec d\'autres nombres'},
    'self-1': {'lesson': L3, 'module': 8}, 'self-2': {'lesson': L3, 'module': 8}, 'self-3': {'lesson': L3, 'module': 8}, 'self-4': {'lesson': L3, 'module': 8},
    'self-5': {'lesson': L1, 'module': 8, 'note': '« un nombre + son double + son triple = 102 » : 6 × … = 102 ; repris en épreuve du إختبار أولي avec d\'autres nombres, sans lettre'},
    'self-6': {'lesson': SYN, 'module': None, 'note': 'x + 3x + 5x = 180 : exige l\'expression littérale 9x (L3) puis 9 × … = 180'},
    'self-7': {'lesson': L3, 'module': 8}, 'self-8': {'lesson': SYN, 'module': None},
    'deep-1': {'lesson': L1, 'module': 6, 'note': 'مسألة 2 REDESSINÉE (le club d\'informatique du collège : un acompte puis 8 versements égaux) ; la voiture n\'est pas reprise'},
    'deep-2': {'lesson': L3, 'module': 6}, 'deep-3': {'lesson': L3, 'module': 6}, 'deep-4': {'lesson': L3, 'module': 4}, 'deep-5': {'lesson': L2, 'module': 4},
    'deep-6': {'lesson': L1, 'module': 7, 'note': 'مسألة 3 : l\'escalier « (2 × h) + g = 63 », avec ses propres hauteurs et largeurs ; trouver g (somme) puis h (produit après une différence)'},
    'deep-7': {'lesson': L1, 'module': 4, 'note': 'la pyramide de dalles (146) est cherchée dans la banque et dans l\'une des étapes de أتمرّن : chaque dalle du dessus est une somme, un nombre manquant se trouve par une différence'},
    'integration': {'lesson': SYN, 'module': None}, 'evaluation': {'lesson': SYN, 'module': None},
    'ict': {'lesson': L2, 'module': 4, 'note': "la page du tableur devient l'exercice « صيغة في مجدول » (=6*A2-4 : le signe × est écrit dans un tableur) ; les valeurs de 6x − 4 pour x = 2, 5 et 10"},
    'ict-ex': {'lesson': L2, 'module': 4, 'note': "cité par le même exercice (une règle à parenthèse dans un tableur)"},
}

DISCREPANCIES = [
    {'elementId': 'ex-6', 'kind': 'reading', 'text': "Le tableau de la concentration est imprimé avec un volume en mL (100 ; 300 ; 400 ; 500) alors que la règle T = m / v est donnée pour des litres ; la leçon L2 ne le reprend pas (sa propre règle de vitesse V = d ÷ t, d en km et t en h)."},
    {'elementId': 'know-1', 'kind': 'scope', 'text': "Deux leçons se partagent ce bloc : L2 (tatbiq-qaida-harfiya) nomme la lettre et les اصطلاحات de l'écriture (nécessaires à la substitution : 2x = 2 × x, 2 × 3 ≠ 23) ; L3 garde les remarques (× 1, ba = ab, × 0, a²) et la production d'expressions."},
    {'elementId': 'unit', 'kind': 'scope', 'text': 'Le تحدّ de l\'unité EST imprimé (p. 77, « مثال من مفتاح الحساب للكاشي ») et le catalogue le cite déjà ; il va à la synthèse.'},
    {'elementId': 'now-82', 'kind': 'misprint', 'text': 'Le (2) est imprimé « □ − 123,8 ÷ 13 » : lu « □ × 13 = 123,8 » (□ = 123,8 ÷ 13 = 619/65 ≈ 9,52…, un quotient qui ne s\'arrête pas). L1 reprend le cas avec ses propres nombres.'},
    {'elementId': 'ex-17', 'kind': 'misprint', 'text': 'La longueur du rectangle d\'aire 84,5 cm² est imprimée « n » (une lettre) : sans valeur on ne peut pas calculer la largeur ; L1 donne sa propre longueur (6,5 cm → largeur 13 cm).'},
    {'elementId': 'act-1', 'kind': 'content', 'text': 'Les situations ② et ③ donnent le MÊME nombre manquant (45) par deux égalités différentes (54 − □ = 9 et □ + 9 = 54) : c\'est voulu (la soustraction y est l\'opération du calcul dans les deux cas). L1 en tire sa propre version.'},
    {'elementId': 'prep', 'kind': 'content', 'text': 'Récapitulatif des unités précédentes ; la synthèse le relira. Les items 1 (104 − 85) et 3 (54 multiple de 2 et de 3) sont lus et recalculés ici.'},
    {'elementId': 'integration', 'kind': 'reading', 'text': 'Le tableau (S, C, E, T) est lu avec l\'ordre des colonnes de l\'impression RTL ; la synthèse le relira.'},
    {'elementId': 'unit', 'kind': 'scope', 'text': 'Pages 77–88 complètes. Les éléments de tatbiq-qaida-harfiya, intaj-ibara-harfiya et de la synthèse sont transcrits plus brièvement (verified: false) : leur leçon les relira.'},
]

doc = {
    '_comment': [
        'EXTRACTION CANONIQUE du manuel scolaire officiel — 1AM, الجيل الثاني (موفم 2017), unité 6 « الحساب الحرفي ».',
        'Source : docs/official-book-pdfs/كتاب الرياضيات للسنة الأولى متوسط الجيل الثاني.pdf, pages 77 à 88.',
        'Ce fichier est LA source de vérité pédagogique de l’unité ; tout contenu cite un `id` d’ici via `source.elementId`.',
        'Transcription VISUELLE ; réponses calculées (Fraction, Decimal) dans build-extraction.py, `answerSource: computed`.',
        'Généré par docs/sources/1am/unit6/build-extraction.py — ne pas éditer à la main.',
    ],
    'unitCode': 'ibarat-harfiya',
    'textbook': {'title': 'كتاب الرياضيات — السنة الأولى من التعليم المتوسط', 'generation': 'الجيل الثاني', 'unitNumber': 6,
                 'unitTitle': 'الحساب الحرفي', 'pages': {'first': 77, 'last': 88}, 'pdfPageOffset': 0,
                 'sections': ['سأتعلّم في هذا الباب', 'استحضر مكتسباتي', 'اكتشف', 'أحوصل تعلّماتي', 'أكتسب طرائق', 'دوري الآن', 'أتمرّن', 'أقوّم تعلّماتي', 'أتعمّق', 'أتعلّم الإدماج', 'وضعية تقويم', 'استعمل تكنولوجيات الإعلام والاتصال']},
    'frozenAt': '2026-10-30',
    'terminology': {'note': 'Le manuel écrit « إتمام مساويات », « العدد الناقص / الذي ينقص », « العملية العكسية », « عبارة حرفية », « قاعدة حرفية », « مجهول » (□ ou « … »). Écriture : « 63 + … = 208 », « □ + 9 = 54 », décimaux à la virgule.',
                    'terms': ['عدد ناقص', 'مساواة', 'العملية العكسية', 'مجموع', 'فرق', 'جداء', 'حاصل قسمة', 'تحقّق', 'عبارة حرفية', 'قاعدة حرفية']},
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
print(f'{len(E)} éléments écrits dans {out}')
