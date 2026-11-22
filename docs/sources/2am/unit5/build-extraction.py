#!/usr/bin/env python3
"""Génère docs/sources/2am/unit5/extraction.json — 2AM, unité 5 « التناسبية » (manuel الجيل الثاني, منشورات الشهاب ;
pp. 70–85 du livre = PDF 67–82, décalage 3 — docs/sources/2am/textbook-map.json).

Transcription VISUELLE (pages rendues à 110–170 dpi). Le scan de 2AM est la seule copie (décisions D5/D9 : on prend l'idée, on ne
s'attarde pas sur l'illisible). Défauts connus de ces pages : le tableau de fin de l'activité 2 (p. 72) est coupé en bas, le bord droit de
la p. 73 (titres des activités 3 et 4), le bord droit des pp. 78, 79, 80 (fins de lignes, numéros 11 à 15, 27 à 32) et le bord gauche des
pp. 74, 76, 77, 79 sont coupés ; plusieurs nombres d'exercices sont tronqués (notés « reading »). Les éléments de la leçon GÉNÉRÉE ici
(rabi-mutanasib) sont relus à 170 dpi (`verified: True`) ; les autres sont transcrits plus brièvement (`verified: False`) : leur leçon
les relira. Les réponses sont CALCULÉES ici (Fraction / Decimal exacts), jamais tapées.

L'unité est générée LEÇON PAR LEÇON (file de génération, Phase A) ; les destinations vers une leçon encore `coming_soon` sont EN ATTENTE
(scripts/check-textbook-coverage.mjs).

FRONTIÈRES DES LEÇONS (à respecter par chaque lead qui génère la suite) :
  wadiya-tanasubiya-jadwal (2am.m6.r01, r02) — SERA GÉNÉRÉE PLUS TARD : RECONNAÎTRE un tableau de proportionnalité (quotients égaux,
        coefficient, un tableau qui n'en est pas un) et COMPLÉTER un tableau où l'on dispose d'une colonne complète (ou du coefficient)
        pour chaque case manquante : act-1 (a, b, c et le tableau à compléter), know-1a, now-75 ①, ex-1…ex-11 (ex-8, 9, 10 : compléter
        un tableau à plusieurs colonnes connues ; ex-11 : « نص مشكل »), self-1 (et self-2 pour la lecture du coefficient).
        « أستعدّ » de rabi-mutanasib la RAPPELLE (reconnaître, coefficient, colonne complète), ne la reconstruit pas.
  rabi-mutanasib (2am.m6.r02 pour les tableaux à TROIS nombres connus, 2am.m6.r03) — CETTE LEÇON : le quatrième proportionnel d'un tableau à
        deux colonnes dont une case manque ; les trois chemins déjà connus (par le coefficient, par la valeur de l'unité, par les
        propriétés additive et multiplicative — consolidés depuis 1AM `itmam-jadwal-tanasubiya`, jamais reconstruits), l'ÉGALITÉ DES
        PRODUITS EN CROIX a × d = b × c (NOUVEAU), le CHOIX du chemin selon les nombres : act-2, know-1b (le mot « الرابع المتناسب »,
        la propriété, les remarques 1 et 2), method-1 (p. 75), now-75 ②, ex-12…ex-18, self-3, deep-33, deep-34, l'ouverture p. 70
        (Ératosthène : un quatrième proportionnel), prep 1–5. Elle n'emploie NI le pourcentage, NI l'échelle, NI les conversions d'unités
        (km ⇄ cm), NI le graphique d'une proportionnalité.
  nisba-miawiya (2am.m6.r04) — SERA GÉNÉRÉE PLUS TARD : le pourcentage comme quatrième proportionnel ramené à 100, « t % d'un nombre »,
        comparer des parts (act-3, know-2a, method-2a, now-77 ①, ex-19…ex-25, self-4…self-7, deep-35…deep-38, deep-43…deep-47, ict 1, ict 2).
  miqyas-kharita (2am.m6.r05, r06) — SERA GÉNÉRÉE PLUS TARD : l'échelle d'une carte ou d'un plan, réduction / agrandissement, les
        conversions d'unités de longueur, d'aire, de volume (act-4, know-2b, method-2b, now-77 ②, ex-26…ex-32, self-8, self-9,
        deep-48…deep-50).
  wadiya-idmajiya-tanasubiya-2am — la synthèse : intégration (p. 84, « من القمح إلى عجين الخبز »), évaluation (le disque usb), les
        problèmes de double proportionnalité (deep-39, deep-40), deep-41, deep-42 (la peinture d'un cube : l'aire n'est PAS
        proportionnelle à l'arête), le تحدّي de l'unité (les lacs Tonga et Obeira, `units_2am › tanasubiya-2am.challenge`).

Usage : python3 docs/sources/2am/unit5/build-extraction.py
"""
import json
from decimal import Decimal as D
from fractions import Fraction as F
from pathlib import Path


def dec(s):
    return D(str(s).replace(',', '.').replace('−', '-'))


def rel(s):
    return F(dec(s))


def fr(x):
    """Un rationnel exact écrit à l'algérienne (virgule, signe moins ASCII) ; « a/b » si le développement n'est pas décimal fini."""
    x = F(x)
    d = x.denominator
    for p in (2, 5):
        while d % p == 0:
            d //= p
    if d != 1:
        return f'{x.numerator}/{x.denominator}'
    t = format(D(x.numerator) / D(x.denominator), 'f')
    if '.' in t:
        t = t.rstrip('0').rstrip('.')
    return t.replace('.', ',')


def fourth(a, b, c):
    """Le quatrième proportionnel de [[a, c], [b, x]] : x = b × c ÷ a (a ≠ 0)."""
    return F(rel(b) * rel(c) / rel(a))


def ratio(x, y):
    return F(rel(y) / rel(x))


E = []

# ── p. 70 : ouverture ──────────────────────────────────────────────────────────────────────────────
E.append({
    'id': 'objectives', 'kind': 'objectives', 'page': 70, 'section': 'سأتعلّم في هذا الباب', 'verified': True,
    'items': [
        'التعرف على وضعية تناسبية من جدول أعداد.', 'إتمام جدول أعداد يمثل تناسبية.', 'حساب الرابع المتناسب.',
        'حساب نسبة مئوية وتوظيفها.', 'حساب مقياس خريطة أو تصميم واستعماله.', 'تحويل وحدات القياس. (أطوال و مساحات و حجوم)',
    ],
})
ERA = fourth(1, 5000, 50)
E.append({
    'id': 'opener', 'kind': 'aside', 'page': 70, 'section': 'الرابع المتناسب وحساب محيط الأرض حوالي 300 ق.م', 'verified': True,
    'text': 'ولد إراتوستانس عالم الرياضيات والفلك والجغرافيا سنة 276 ق.م. استدلّ بالمسافة التي تفصل بين الإسكندرية وأسوان (بمصر) تُمثّل جزءا من 50 جزء من محيط الأرض، ولمّا كانت هذه المسافة معروفة (قُدّرت بـ 5000 أستاديوم) وبما أنّ المدينتين تقعان تقريبا بالضبط شمال-جنوب كان لزاما أنّ الرابع المتناسب في الجدول (1 | 50 ؛ 5000 | x) هو محيط الأرض: x = 50 × 5000 أي 250 000 أستاديوم. حوّل النتيجة إلى (km) وقارنها بالطول الحالي لمحيط الأرض (1 أستاديوم يساوي حوالي 157 m).',
    'table': {'top': ['1', '50'], 'bottom': ['5000', 'x']},
    'answer': {'stadia': int(ERA), 'km': float(ERA * F(157, 1000))}, 'answerSource': 'computed',
    'reading': 'texte lu à 110 dpi ; 250 000 stades × 157 m = 39 250 km (le périmètre réel est ≈ 40 075 km)',
})
E.append({
    'id': 'challenge', 'kind': 'challenge', 'page': 70, 'section': 'تحدّي', 'verified': False,
    'text': 'طونغا وأوبيرا بحيرتان تقعان بالقرب من مدينة القالة بالشرق الجزائري. على خريطة، طول بحيرة طونغا 12,4 cm وبجوارها بحيرة الأوبيرا طولها 9,2 cm. نعلم أن الطول الحقيقي لبحيرة طونغا يزيد عن طول بحيرة […] (نهاية النص مقطوعة في المسح)',
    'figure': 'صورة بحيرة وغابة.',
    'reading': 'la fin de l’énoncé manque au scan (en bas de la page 70) : on lit un lien d’échelle entre deux longueurs de carte ; la synthèse le complète',
})

# ── p. 71 : أستعدّ (10 items) ──────────────────────────────────────────────────────────────────────
PREP = [
    {'n': 1, 'question': 'خمس علبات متماثلة تزن 4 kg. كتلة علبة واحدة هي …', 'options': ['0,8 kg', '1,25 kg', '1 kg'], 'correct': [0],
     'why': '4 ÷ 5 = 0,8', 'verified': True},
    {'n': 2, 'question': 'ثمن 10 لترات من البنزين هو 230 DA. …', 'options': ['ثمن 5 L هو 115 DA', 'ثمن 15 L هو 345 DA', 'ثمن 20 L هو 240 DA'], 'correct': [0, 1],
     'why': '23 DA للتر: 5 L = 115 DA ؛ 15 L = 345 DA ؛ 20 L = 460 DA', 'verified': True},
    {'n': 3, 'question': 'العدد الذي ينقص في المساواة 3 × □ = 5 هو …', 'options': ['1,66', '5/3', '3/5'], 'correct': [1],
     'why': '5 ÷ 3 = 5/3', 'verified': True},
    {'n': 4, 'question': 'معامل التناسبية الذي ينقص في الجدول (طول ضلع مثلث متقايس الأضلاع cm : 4 ; 8 — المحيط cm : 12 ; 24) هو …', 'options': ['0,33', '3', '1/3'], 'correct': [1],
     'why': '12 ÷ 4 = 3', 'verified': True},
    {'n': 5, 'question': 'جدول تناسبية: عدد الأقلام 2 ؛ 8 — السعر (DA) ؛ 320. لحساب سعر قلمين نجري العملية …', 'options': ['320/8 × 2', '320/4 × 2', '40 × 2'], 'correct': [2],
     'why': '320 ÷ 8 = 40 ثمن قلم واحد ؛ ثمن قلمين 40 × 2 (ملاحظة: السعر 320 DA هو ثمن 8 أقلام)', 'verified': False,
     'reading': 'les colonnes (2 ; ?) (8 ; 320) sont mal lisibles ; lecture 8 stylos pour 320 DA, on cherche le prix de 2 stylos = 80 DA'},
    {'n': 6, 'question': '4/3 × 72 يساوي …', 'options': ['54', '96', '95,76'], 'correct': [1], 'why': '72 ÷ 3 × 4 = 96', 'verified': False},
    {'n': 7, 'question': 'لحساب 5 % من 35 نجري العملية …', 'options': ['5/100 × 35', '35 × 100/5', '5 × 100 × 35'], 'correct': [0], 'why': '5 % = 5/100', 'verified': False},
    {'n': 8, 'question': 'قرص صلب سعته 16 Go. استُعمل منه 75 %. السعة التي لا تزال متوفرة بالجيغاأكتي …', 'options': ['12 Go', '4 Go', '25 %'], 'correct': [1], 'why': '25 % من 16 = 4', 'verified': False},
    {'n': 9, 'question': 'على مخطط 1 cm تُمثّل 300 cm. إذن 1,5 cm تُمثّل في الحقيقة …', 'options': ['450 cm', '45 cm', '4,5 cm'], 'correct': [0], 'why': '1,5 × 300 = 450', 'verified': False},
    {'n': 10, 'question': 'على مخطط، 4 m تُمثّل بـ 10 cm. المقياس هو …', 'options': ['4/10', '10/4', '1/40'], 'correct': [2], 'why': '10 cm ↔ 400 cm: 10/400 = 1/40', 'verified': False},
]
E.append({'id': 'prep', 'kind': 'prerequisites', 'page': 71, 'section': 'أستعدّ', 'verified': True,
          'instruction': 'اختر الإجابة الصحيحة (أو الإجابات الصحيحة) في كل حالة، مبرّرا إياها.', 'items': PREP, 'answerSource': 'computed',
          'reading': 'les enveloppes des questions sont coupées à droite : lues à 110 dpi, items 1 à 4 confirmés (les réponses sont recalculées ici)'})

# ── pp. 72–73 : أنشطة ──────────────────────────────────────────────────────────────────────────────
FUEL = [('8', '285,76'), ('11,5', '410,78'), ('12', '428,64')]
E.append({
    'id': 'act-1', 'kind': 'activity', 'number': 1, 'page': 72, 'section': 'أنشطة', 'title': 'أتعرّف على وضعية تناسبية من جدول', 'verified': True,
    'text': '1) الجدول الآتي يشير إلى الثمن المسدّد مقابل كمية البنزين المشتراة (كمية البنزين L : 8 ؛ 11,5 ؛ 12 — الثمن المسدّد DA : 285,76 ؛ 410,78 ؛ 428,64). أ) استعمل الحاسبة لحساب كل حاصل من الحواصل الآتية: 285,76/8 ؛ 410,78/11,5 ؛ 428,64/12 . ماذا تُلاحظ؟ في أي عدد تُضرب كمية البنزين للحصول على الثمن المقابل لها؟ ب) هل الثمن المسدّد متناسب مع كمية البنزين المشتراة؟ اشرح لماذا. جـ) في حالة الإيجاب، ما هو معامل التناسبية لهذا الجدول؟ 2) أنقل وأتمّ جدول التناسبية الآتي مستعملا لكل حساب الطريقة التي تراها أنسب لذلك (المسافة المقطوعة Km : 100 ؛ □ ؛ 170 ؛ □ — كمية البنزين باللتر : 7 ؛ 14 ؛ □ ؛ 18,9).',
    'table': {'quantities': ['8', '11,5', '12'], 'prices': ['285,76', '410,78', '428,64']},
    'answer': {'quotients': [fr(rel(p) / rel(q)) for q, p in FUEL], 'proportional': len({rel(p) / rel(q) for q, p in FUEL}) == 1,
               'coefficient': fr(rel('285,76') / rel('8')),
               'table2': {'km': ['100', fr(F(100) * 14 / 7), '170', fr(rel('18,9') * 100 / 7)],
                          'liters': ['7', '14', fr(F(170) * 7 / 100), '18,9']}},
    'answerSource': 'computed',
    'reading': 'la deuxième ligne du tableau 2 est lue 7 ; 14 ; □ ; 18,9 (100 km ↔ 7 L : 200 km ↔ 14 L ; 170 km ↔ 11,9 L ; 18,9 L ↔ 270 km)',
})
E.append({
    'id': 'act-2', 'kind': 'activity', 'number': 2, 'page': 72, 'section': 'أنشطة', 'title': 'تعيين رابع متناسب', 'verified': True,
    'text': 'يظهر على أنبوب اختبار فقط التدريجة 20 cL ، يُقابلها ارتفاع 6 cm. ونعلَم أنّ الارتفاع يتناسب مع كمية السائل المسكوب في الأنبوب. استعملت فاطمة الجدول الآتي لحساب كمية سائل ارتفاعه 15 cm على الأنبوب نفسه (السائل cL : 20 ؛ x — الارتفاع cm : 6 ؛ 15). 1) اشرح لماذا 20/6 = x/15 . انقل وأتمم 20 × … / 6 × 15 = x × … / 6 × 15 ثم اذكر لماذا يمكن أن نكتب 6x = 300 ؟ احسب قيمة x ؟ تُعبّر هذه المساواة (20 × 15 = 6 × x) على تساوي الجُداءين المُتصالبين. 2) نقترح عليك تعيين ارتفاع سائل مسكوب في نفس الأنبوب. أ) لاحظ الجدول المقابل ثم اكتب مساواة الجُداءين المُتصالبين (20 ؛ x — 6 ؛ 15 في مربّعات متقاطعة). ب) عيّن قيمة y ثم استنتج ارتفاع السائل (حجم السائل cL : 20 ؛ 32 — الارتفاع cm : 6 ؛ y).',
    'table': {'volume_cL': ['20', 'x'], 'height_cm': ['6', '15']},
    'answer': {'x': fr(fourth(6, 20, 15)), 'equation': '6 × x = 20 × 15 = 300', 'y': fr(fourth(20, 6, 32)), 'heightFor32cL': fr(fourth(20, 6, 32))}, 'answerSource': 'computed',
    'reading': 'le tableau du 2) b) est coupé en bas : on lit (20 ; 32) pour le volume et (6 ; y) pour la hauteur, donc y = 6 × 32 ÷ 20 = 9,6 cm',
})
E.append({
    'id': 'act-3', 'kind': 'activity', 'number': 3, 'page': 73, 'section': 'أنشطة', 'title': 'أقارن حصصا وأحسب نسبة مئوية', 'verified': False,
    'text': 'حضّرت فاطمة وزميلتها مريم مشروبين بإضافة محلول مركّز من السكّر. المشروب 1: ضمن 25 cL من المشروب، يوجد 11 cL من محلول السكر المركّز. المشروب 2: ضمن 20 cL من المشروب، يوجد 9 cL من محلول السكر المركّز. أيّ مشروب أكثر حلاوة دون تذوّقهما؟ فاطمة: «سآخذ نفس الحجم (100 cL) من كلا المشروبين.» 1) ما هو حجم المحلول المركّز اللازم لتحضير 100 cL من المشروب 1؟ ما هي النسبة المئوية للمحلول المركّز في المشروب 1؟ 2) على المنوال، احسب النسبة المئوية للمحلول المركّز في المشروب 2. ماذا تستنتج؟ مريم: «احسب نسبة المحلول المركّز في كل مشروب.» 1) نقول إن نسبة المحلول المركّز في هذا المشروب هو 11/25 . اكتب الكتابة العشرية لهذه النسبة. 2) احسب نسبة المحلول المركّز في المشروب 2. 3) أيّ المشروبين أكثر حلاوة؟',
    'answer': {'drink1_per100': fr(fourth(25, 11, 100)), 'drink2_per100': fr(fourth(20, 9, 100)), 'sweeter': 2, 'decimal1': fr(F(11, 25))}, 'answerSource': 'computed',
    'reading': 'titre coupé à droite (« …حصصا وأحسب نسبة مئوية ») ; énoncé lu à 110 dpi',
})
E.append({
    'id': 'act-4', 'kind': 'activity', 'number': 4, 'page': 73, 'section': 'أنشطة', 'title': 'حساب مقياس', 'verified': False,
    'text': 'مقياس هذه الخريطة هو 1/4000000 . 1) 1 cm على المخطّط تُمثّل 4000000 cm في الحقيقة. 2) أكمل «1 cm على المخطّط تُمثّل … Km في الحقيقة.» 3) احسب بالكيلومتر المسافة الحقيقية بين: ورقلة والمنيعة ثم بين ورقلة وحاسي مسعود (6,5 cm و 5 cm على الخريطة). 4) المسافة الحقيقية بين ورقلة وغرداية هي 127 Km. احسب المسافة بين ورقلة وغرداية على هذه الخريطة. 5) على شاشة جهاز نظام تحديد المواقع (GPS) مسافة 7 Km طولها 5 cm. عيّن مقياس خريطة الجهاز.',
    'answer': {'kmPerCm': fr(F(4000000, 100000)), 'Ouargla_Menia': fr(rel('6,5') * 40), 'Ouargla_HassiMessaoud': fr(rel('5') * 40), 'Ouargla_Ghardaia_cm': fr(F(127, 40)), 'gps_scale': f'1/{int(F(7 * 100000, 5))}'}, 'answerSource': 'computed',
    'reading': 'texte coupé à droite (numéros et fins de lignes) ; ordre de lecture reconstitué à partir de la carte',
})

# ── p. 74 : معارف 1 ────────────────────────────────────────────────────────────────────────────────
E.append({'id': 'know-1a', 'kind': 'knowledge', 'number': 1, 'page': 74, 'section': 'معارف', 'title': 'جداول التناسبية — التعرّف على جدول تناسبية', 'verified': False,
          'text': 'نقول عن جدول بسطرين إنه يترجم وضعية تناسبية، إذا أمكن الانتقال من سطر إلى آخر بالضرب في نفس العدد. يسمى هذا العدد معامل التناسبية. مثال (جدول تناسبية): عدد الأزهار 6 ؛ 10 ؛ 15 — السعر (DA) 138 ؛ 230 ؛ 345 : 138/6 = 23 ؛ 230/10 = 23 ؛ 345/15 = 23 ، كل حواصل القسمة متساوية، إذن عدد الأزهار يتناسب مع السعر. معامل التناسبية لهذا الجدول 23، أي أنّ سعر زهرة واحدة 23 DA. مثال (جدول لا تناسبية): المدة الزمنية لكراء سيارة (h) 4 ؛ 12 — السعر (DA) 5000 ؛ 9000 : 5000/4 = 1250 و 9000/12 = 750 ، 1250 ≠ 750 إذن هذا الجدول لا يمثل تناسبية.',
          'answer': {'flowers': fr(F(138, 6)), 'cars': [fr(F(5000, 4)), fr(F(9000, 12))], 'carsProportional': F(5000, 4) == F(9000, 12)}, 'answerSource': 'computed'})
E.append({'id': 'know-1b', 'kind': 'knowledge', 'number': 1, 'page': 74, 'section': 'معارف', 'title': 'حساب رابع متناسب', 'verified': True,
          'text': 'كلما عُلمت في جدول تناسبية ثلاثة أعداد غير معدومة منها اثنان متقابلان فإنّه يُمكن حساب العدد الرابع الذي ينقص. يُسمّى هذا العدد الذي ينقص الرابع المتناسب. مثال: سعر البرتقال بالدينار الجزائري يتناسب مع كتلته (الكتلة Kg : 5 ؛ 6 — السعر DA : 625 ؛ x) : 625 ، 5 ، 6 ثلاثة أعداد معلومة ، عددان متقابلان. إليك طُرقًا مختلفة لحساب قيمة x : (معامل التناسبية) x = 6 × 125 = 750 ؛ (المرور بالوحدة ثم الخاصية الجمعية) 6 = 5 + 1 ، 625 ← 125 ، x = 625 + 125 = 750 ؛ (الخاصية الضربية) 5 × 1,2 = 6 ، x = 6 × 1,2 = 750 ؛ (مساواة الجداءين المتصالبين) 5 × x = 6 × 625 . خاصية: الجدول (a ؛ c — b ؛ d) يمثّل وضعية تناسبية. يمكن إذن أن نكتب مساواة الجداءين المتصالبين a × d = b × c . ملاحظة 1: تسمح هذه الخاصية بحساب إحدى القيم a ، b ، c ، d إذا علمنا ثلاث قيم منها. ملاحظة 2: في كل عمودين من جدول تناسبية يكون الجداءان المتصالبان متساويين.',
          'examples': {'orange': {'coefficient': fr(F(625, 5)), 'x': fr(fourth(5, 625, 6)), 'viaUnit': [fr(F(625, 5)), fr(F(625, 5) + 625)], 'factor': fr(F(6, 5)), 'cross': f'5 × x = 6 × 625 = {6 * 625}'}},
          'answer': {'x': fr(fourth(5, 625, 6))}, 'answerSource': 'computed',
          'reading': 'le bord gauche de la page est coupé : la 3e ligne de l’exemple (« المرور بالوحدة ثم الخاصية الجمعية ») est lue à 170 dpi ; les deux remarques sont complètes'})

# ── p. 75 : طرائق 1 ────────────────────────────────────────────────────────────────────────────────
E.append({'id': 'method-1', 'kind': 'method', 'number': 1, 'page': 75, 'section': 'طرائق', 'title': 'تشكيل وإتمام جدول تناسبية', 'verified': True,
          'exercise': 'يعمل عامل في إحدى المؤسسات بالساعات. أُجرته تتناسب مع الساعات المنجزة في العمل. عمل في إحدى الأيام 8 ساعات وقبض 1880 DA. 1) ما هي أجرة 5 ساعات عمل؟ 2) استنتج أجرة 13 ساعة عمل. 3) ما هو عدد ساعات العمل التي يجب أن يُنجزها ليتقاضى أجرة 30550 DA؟',
          'solution': ['1) معامل التناسبية 1880/8 = 235 : أجرة 5 ساعات 5 × 235 = 1175 DA (أو مساواة الجداءين المتصالبين 8 × x = 1880 × 5 ، x = 1175).',
                       '2) أجرة 13 ساعة هي مجموع أجرتي 5 ساعات و 8 ساعات (الخاصية الجمعية): 1175 + 1880 = 3055 DA.',
                       '3) الخاصية الضربية: 30550 = 3055 × 10 ، إذن 13 × 10 = 130 ساعة (أو مساواة الجداءين المتصالبين: 8 × x = 1880 × ... ، x = 130).'],
          'rule': 'لحساب الرابع المتناسب، نختار الإجراء المناسب: معامل التناسبية أو خواص الخطية أو المرور بالوحدة أو مساواة الجداءين المتصالبين.',
          'answer': {'coefficient': fr(F(1880, 8)), 'wage5': fr(fourth(8, 1880, 5)), 'wage13': fr(fourth(8, 1880, 13)), 'hours': fr(fourth(1880, 8, 30550))}, 'answerSource': 'computed',
          'reading': 'les trois questions et le tableau final (8 · 5 · 13 · 130 / 1880 · 1175 · 3055 · 30550, ×235) sont lus à 170 dpi'})
E.append({'id': 'now-75', 'kind': 'now', 'page': 75, 'section': 'دوري الآن', 'verified': True,
          'text': '① هل الجدول الآتي هو جدول تناسبية؟ (12 ؛ 30 ؛ 39 — 1,2 ؛ 2,1 ؛ 3). ② من 15 Kg من القمح نحصل على 12 Kg من الدقيق. نفرض أنّه توجد تناسبية بين كمية القمح وكمية الدقيق الناتج. انقل وأتمم الجدول (كمية القمح Kg : 15 ؛ 25 ؛ … — كمية الدقيق Kg : 12 ؛ … ؛ 32).',
          'items': {'1': {'quotients': [fr(F(12, 1) / rel('1,2')), fr(F(30) / rel('2,1')), fr(F(39) / rel('3'))], 'proportional': len({F(12) / rel('1,2'), F(30) / rel('2,1'), F(39) / rel('3')}) == 1},
                    '2': {'flour25': fr(fourth(15, 12, 25)), 'wheat32': fr(fourth(12, 15, 32))}},
          'answer': {'1': False, '2': [fr(fourth(15, 12, 25)), fr(fourth(12, 15, 32))]}, 'answerSource': 'computed'})

# ── p. 76 : معارف 2 ────────────────────────────────────────────────────────────────────────────────
E.append({'id': 'know-2a', 'kind': 'knowledge', 'number': 2, 'page': 76, 'section': 'معارف', 'title': 'حساب نسبة مئوية', 'verified': False,
          'text': 'يؤول حساب نسبة مئوية إلى حساب رابع متناسب. مثال: يملك 7 تلاميذ من بين 35 تلميذا في إحدى الأقسام هاتفا نقّالا. نحسب النسبة المئوية للتلاميذ الذين يملكون هاتفا: نستعمل معامل التناسبية 100 × 1/5 = 100/5 = 20 ، أو نستعمل مساواة الجداءين المتصالبين فنجد 20 = 7 × 100/35 . ملاحظة: النسبة المئوية هي معامل التناسبية ممثّل في الشكل t/100 . خاصية: لحساب t % من عدد، نضرب هذا العدد في t/100 . مثال: 65 % من 160 g : 65/100 × 160 g = 0,65 × 160 g = 104 g.',
          'answer': {'phones': fr(fourth(35, 7, 100)), 'sixtyFivePercent': fr(F(65, 100) * 160)}, 'answerSource': 'computed'})
E.append({'id': 'know-2b', 'kind': 'knowledge', 'number': 2, 'page': 76, 'section': 'معارف', 'title': 'المقياس', 'verified': False,
          'text': 'مقياس مخطط هو معامل التناسبية بين المسافات على المخطط والمسافات الحقيقية مُعبّر عنها بالوحدة نفسها: المسافة على المخطط / المسافة الحقيقية. مثال: على خريطة 2 cm تُمثّل 100 Km أي 10 000 000 cm ، مقياس الخريطة هو 2/10 000 000 = 1/5 000 000 ، أي كل 1 cm على الخريطة يُمثّل مسافة حقيقية قدرها 5 000 000 cm. ملاحظات: في وضعية تصغير، يعبّر عن المقياس بعدد محصور بين 0 و 1 ويكتب على شكل كسر بسطه 1 في حالة الإمكان. في وضعية تكبير يعبّر عن المقياس بعدد أكبر من 1 . مثال: قمنا بتكبير دائرة نصف قطرها 3 cm بمقياس 2,5 ، نحصل على دائرة نصف قطرها 7,5 cm.',
          'answer': {'scale': '1/5000000', 'enlarged': fr(rel('3') * rel('2,5'))}, 'answerSource': 'computed'})

# ── p. 77 : طرائق 2 ────────────────────────────────────────────────────────────────────────────────
E.append({'id': 'method-2a', 'kind': 'method', 'number': 2, 'page': 77, 'section': 'طرائق', 'title': 'مقارنة حصص', 'verified': False,
          'exercise': 'لتحضير مشروبين بذوق الفراولة. وضعت فاطمة 6 cL من محلول الفراولة المركّز في كأس يحتوي على 24 cL من الماء. ووضعت مريم 8 cL من محلول الفراولة المركّز في كأس يحتوي على 42 cL من الماء. في أي مشروب تكون نسبة الفراولة أكثر؟',
          'solution': ['فاطمة: 6/(24+6) = 6/30 = 1/5 = 20/100 = 20 % ؛ مريم: 8/(42+8) = 8/50 = 16/100 = 16 %.', 'إذن نسبة الفراولة الأكثر هي في مشروب فاطمة. أو بالكتابة العشرية: 0,2 > 0,16.'],
          'rule': 'لمقارنة حصص نستعمل النسبة المئوية أو الكتابة العشرية.',
          'answer': {'fatima': fr(F(6, 30) * 100), 'meriem': fr(F(8, 50) * 100), 'larger': 'fatima'}, 'answerSource': 'computed'})
E.append({'id': 'method-2b', 'kind': 'method', 'number': 2, 'page': 77, 'section': 'طرائق', 'title': 'استعمال مقياس', 'verified': False,
          'exercise': '1) على خريطة بمقياس 1/2000000 ، المسافة بين مدينتين هي 2,4 cm. ما هي في الحقيقة المسافة بين المدينتين؟ 2) المسافة الحقيقية بين مدينتين هي 250 Km. ما هو الطول الممثّل لهذه المسافة على الخريطة؟',
          'solution': ['المقياس يعني أنّ 1 cm على الخريطة تُمثّل 2000000 cm في الحقيقة أي 20 Km. 1) x = 2,4 × 20 = 48 Km. 2) y = 250 × 1/20 = 12,5 cm.'],
          'rule': 'لحساب مسافات باستعمال مقياس يمكن تشكيل جدول تناسبية وتوظيف طرق إتمامه.',
          'answer': {'real_km': fr(rel('2,4') * 20), 'map_cm': fr(F(250, 20))}, 'answerSource': 'computed',
          'reading': 'la distance sur la carte est 2,4 cm (la virgule est lisible dans la solution : 2,4 × 20 = 48 km)'})
E.append({'id': 'now-77', 'kind': 'now', 'page': 77, 'section': 'دوري الآن', 'verified': False,
          'text': '① خلال مباراة في كرة السلة، نجح عماد في تسديد 15 رمية وضيّع 9 رميات، كما نجح أيوب في تسديد 12 رمية وضيّع 8 رميات. من منهما كان أكثر براعة؟ ② أنجز نموذجا لعربة طولها 4 m وعرضها 2 m بمقياس 1/50 . ما هو طول وعرض هذا النموذج؟',
          'items': {'1': {'imad': fr(F(15, 24) * 100), 'ayoub': fr(F(12, 20) * 100)}, '2': {'length_cm': fr(F(400, 50)), 'width_cm': fr(F(200, 50))}},
          'answer': {'1': 'ayoub', '2': ['8', '4']}, 'answerSource': 'computed',
          'reading': 'la question ① est lue : 15 réussis et 9 manqués (24 tirs) contre 12 réussis et 8 manqués (20 tirs) ; scan à 110 dpi'})

# ── pp. 78–80 : أوظّف تعلّماتي (1–32) ──────────────────────────────────────────────────────────────

def exercise(n, page, group, text, verified=False, **extra):
    E.append({'id': f'ex-{n}', 'kind': 'exercise', 'number': n, 'page': page, 'section': 'أوظّف تعلّماتي', 'group': group, 'verified': verified, 'text': text, **extra})


G1, G2, G3, G4, G5 = 'التعرّف على جدول تناسبية', 'إتمام جدول تناسبية', 'حساب رابع متناسب', 'النسبة المئوية', 'المقياس'
exercise(1, 78, G1, 'في كل حالة أجب ذهنيا، هل الجدول هو جدول تناسبية؟ ① (9 ؛ 27 — 12 ؛ 36) ② (10 ؛ 25 — 8 ؛ 20).',
         answer=[F(27, 9) == F(36, 12), F(25, 10) == F(20, 8)], answerSource='computed')
exercise(2, 78, G1, 'هل الجداول الآتية تُترجم وضعية تناسبية؟ ① نسبة مئوية: الحجم (L) 252 ؛ 350 — n% 72 ؛ 100. ② البريد الداخلي: الكتلة 20 ؛ 40 ؛ 80 — السعر (DA) 50 ؛ 60 ؛ 70. ③ (1,8 ؛ 2 ؛ 3 ؛ 3,8 — 9 ؛ 10 ؛ 15 ؛ 19). ④ (150 ؛ 200 ؛ 250 — 126 ؛ 168 ؛ 212).',
         answer=[F(72, 252) == F(100, 350), len({F(50, 20), F(60, 40), F(70, 80)}) == 1,
                 len({rel('9') / rel('1,8'), rel('10') / rel('2'), rel('15') / rel('3'), rel('19') / rel('3,8')}) == 1,
                 len({F(126, 150), F(168, 200), F(212, 250)}) == 1], answerSource='computed')
exercise(3, 78, G1, 'يُمثّل الجدول الآتي المدّة الزمنية لتحميل ملفات من الإنترنت (المدّة s : 10 ؛ 40 ؛ 60 ؛ 120 — الحجم Mo : 12 ؛ 48 ؛ 72 ؛ 144). هل حجم الملفات المحمّلة متناسب مع مدّة التحميل؟',
         answer=len({F(12, 10), F(48, 40), F(72, 60), F(144, 120)}) == 1, answerSource='computed')
exercise(4, 78, G1, 'انقل وأتمم الجدول (طول ضلع مربع m : 2 ؛ 5 ؛ 6 ؛ 10 — مساحة مربع m² : □). هل توجد تناسبية بين المساحة وطول الضلع؟',
         answer={'areas': [4, 25, 36, 100], 'proportional': False}, answerSource='computed')
exercise(5, 78, G1, 'هل سعر الاشتراك متناسب مع مدّة المكالمة؟ أسعار الاشتراكات للمكالمات الهاتفية: 600 دقيقة : 3300 DA ؛ 360 دقيقة : 2200 DA …',
         answer={'quotients': [fr(F(3300, 600)), fr(F(2200, 360))], 'proportional': F(3300, 600) == F(2200, 360)}, answerSource='computed',
         reading='la liste des abonnements est coupée à droite : seuls les deux premiers tarifs sont lisibles')
exercise(6, 78, G1, 'هل الجدول الآتي هو جدول تناسبية؟ (النقط A ؛ B ؛ C ؛ D — الفاصلة 1 ؛ 2 ؛ 3 ؛ 4 — الترتيب 12 ؛ 20 ؛ 28 ؛ 36).',
         answer=len({F(12, 1), F(20, 2), F(28, 3), F(36, 4)}) == 1, answerSource='computed')
exercise(7, 78, G1, 'باستعمال البيان، انقل وأتمم الجدول أدناه (نقط A ، B ، C ، D على مستقيم). هل ترتيب النقط متناسبة مع فواصلها؟ كيف هي النقط؟',
         reading='le graphique (points sur une droite) n’est lisible que partiellement : non transcrit ; la réponse dépend de la figure')
exercise(8, 78, G2, 'إليك جدول تناسبية (عدد دورات دوّاسة دراجة : 3 ؛ 8 ؛ 11 — المسافة m : 5,4 ؛ x ؛ y). اقترح في كل حالة طريقتين لحساب القيمتين x و y.',
         answer={'x': fr(fourth(3, '5,4', 8)), 'y': fr(fourth(3, '5,4', 11)), 'coefficient': fr(rel('5,4') / 3)}, answerSource='computed')
exercise(9, 78, G2, 'انقل ثم أتمم جدول التناسبية الآتي (كتلة الجبن g : 20 ؛ 120 ؛ … — السعرة الحرارية : 65 ؛ … ؛ 975).',
         answer={'cal120': fr(fourth(20, 65, 120)), 'mass975': fr(fourth(65, 20, 975)), 'coefficient': fr(F(65, 20))}, answerSource='computed')
exercise(10, 78, G2, 'يحتوي حجم 60 L من الهواء على معدّل … mL من ثاني أكسيد الكربون (CO₂). انقل ثم أتمم الجدول (حجم الهواء L : 60 ؛ 1 ؛ 100 ؛ 160 ؛ …).',
         reading='la quantité de CO₂ est coupée à droite : non calculable ici')
exercise(11, 79, G2, 'نص مشكل: تحتوي حزمة ورقية على 500 ورقة. تزن هذه الحزمة 400 g. ① كم تزن حزمة تحتوي على 200 ورقة؟ ② كم عدد أوراق حزمة وزنها 80 g؟ المطلوب: استعمل معطيات نص المشكل، انقل وأتمم الجدول ثم أجب عن الأسئلة المطروحة في النص (عدد الأوراق / الكتلة g).',
         answer={'mass200': fr(fourth(500, 400, 200)), 'sheets80': fr(fourth(400, 500, 80))}, answerSource='computed')
exercise(12, 79, G3, 'تزن 12 عُلبة فاصوليا 18 kg. احسب ذهنيا كُتلة 18 عُلبة.', verified=True,
         answer={'kg': fr(fourth(12, 18, 18))}, answerSource='computed')
exercise(13, 79, G3, 'تحتوي 50 g من الزبادي على 4 g من المواد الدسمة. احسب ذهنيا في كلّ من الحالتين كُتلة المواد الدسمة الموجودة في: أ) 100 g من الزبادي ب) 25 g من الزبادي.', verified=True,
         answer={'a': fr(fourth(50, 4, 100)), 'b': fr(fourth(50, 4, 25))}, answerSource='computed')
exercise(14, 79, G3, 'تغطي 5 L من الدهن مساحة 20 m². ① احسب ذهنيا في كل حالة الكميّة اللازمة من الدهن لتغطية: أ) 10 m² ب) 40 m² جـ) 100 m² د) 30 m². ② احسب ذهنيا في كل حالة المساحة التي يمكن دهنها بـ: أ) 1 L ب) 15 L جـ) 50 L د) 2,5 L.', verified=True,
         answer={'paint': [fr(fourth(20, 5, s)) for s in (10, 40, 100, 30)], 'area': [fr(fourth(5, 20, v)) for v in ('1', '15', '50', '2,5')]}, answerSource='computed')
# ex-15 : ① (6 ; 24 — 13 ; x) ② (3 ; x — 7 ; 24,5) ③ (11 ; x — 7 ; 29,4) ④ (2 ; 5 — 3,6 ; x) — la case manquante par a × d = b × c
def solve15():
    return [{'bottomRight': fr(fourth(6, 13, 24))}, {'topRight': fr(rel('3') * rel('24,5') / rel('7'))},
            {'topRight': fr(rel('11') * rel('29,4') / rel('7'))}, {'bottomRight': fr(fourth(2, '3,6', 5))}]


exercise(15, 79, G3, 'انقل ثم أتمم كل جدول من جداول التناسبية الآتية: ① (6 ؛ 24 — 13 ؛ □) ② (3 ؛ □ — 7 ؛ 24,5) ③ (11 ؛ □ — 7 ؛ 29,4) ④ (2 ؛ 5 — 3,6 ؛ □).', verified=True,
         answer=solve15(), answerSource='computed',
         reading='les tableaux ① et ③ sont lus avec leurs flèches croisées (produits en croix), ② et ④ avec la flèche × … (coefficient)')
exercise(16, 79, G3, 'إليك جدول تناسبية (x ؛ 6 ؛ 15 — 2,1 ؛ 7 ؛ y). ① احسب x. ② احسب y.', verified=True,
         answer={'x': fr(fourth(7, '2,1', 6)), 'y': fr(fourth(6, 7, 15))}, answerSource='computed')
exercise(17, 79, G3, 'هل كُتلة الرمل متناسبة مع حجمه؟ (حجم الرمل m³ : 8 ؛ 20 — الكتلة بالطن : 5 ؛ 12,5). ② احسب بطريقتين مختلفتين كتلة 12 m³ من الرمل. ③ الحمولة القصوى لشاحنة هي 4,5 طن. ما هو أقصى حجم من الرمل يُمكن نقله على متن هذه الشاحنة؟', verified=True,
         answer={'proportional': F(5, 8) == F(125, 200), 'coefficient': fr(F(5, 8)), 'mass12': fr(fourth(8, 5, 12)), 'maxVolume': fr(fourth(5, 8, '4,5'))}, answerSource='computed')
exercise(18, 79, G3, 'يتسرّب الماء من حنفية بصفة منتظمة حيث تتدفّق كمية 360 cL خلال ساعتين. أجب على الأسئلة الآتية بتشكيل جدول تناسبية. ① ما هي كمية الماء المتدفّق من الحنفية خلال: أ) 35 min ب) 40 min جـ) 1h15min ؟ ② أرادت فاطمة أن تملأ دلوا سعته 3 L بالماء المتسرّب. ما هي المدّة التي تقضيها تنتظر حتى يُملأ الدلو؟', verified=True,
         answer={'cL': [fr(fourth(120, 360, m)) for m in (35, 40, 75)], 'minutes': fr(fourth(360, 120, 300))}, answerSource='computed',
         reading='le tableau en minutes (120 min ↔ 360 cL) est dressé ici ; 3 L = 300 cL')
exercise(19, 79, G4, 'احسب ذهنيا: أ) 50 % من 80 L ب) 10 % من 30 Kg جـ) 25 % من 48 m² د) 20 % من 50 DA.',
         answer=[fr(F(1, 2) * 80), fr(F(1, 10) * 30), fr(F(1, 4) * 48), fr(F(1, 5) * 50)], answerSource='computed')
exercise(20, 79, G4, 'عبّر ذهنيا في كل حالة عن كل نسبة من النسب الآتية في شكل نسبة مئوية: أ) 6 تلاميذ من 10 ب) 7 L من 25 L جـ) 140 Kg من 200 Kg د) 70 DA من 500 DA.',
         answer=[fr(F(6, 10) * 100), fr(F(7, 25) * 100), fr(F(140, 200) * 100), fr(F(70, 500) * 100)], answerSource='computed')
exercise(21, 79, G4, 'حدّد ذهنيا النسبة المئوية الموافقة لكل كسر من الكسور: أ) 1/2 ب) 1/4 جـ) 3/4 د) 8/200.',
         answer=[fr(F(1, 2) * 100), fr(F(1, 4) * 100), fr(F(3, 4) * 100), fr(F(8, 200) * 100)], answerSource='computed')
exercise(22, 79, G4, 'تحتوي 33 cL من مشروب غازي على 35 g من السكر. ما هي كمية السكر في 1 L من هذا المشروب؟ تُعطى النتيجة مقرّبة بالنقصان للوحدة.',
         answer={'g_per_L': float(F(35) * 100 / F(33)), 'floor': int(F(35) * 1000 / F(33))}, answerSource='computed',
         reading='lecture : 33 cL ↔ 35 g (1 L = 100 cL) ; 35 × 100 ÷ 33 = 106,06… g par litre')
exercise(23, 80, G4, 'سُئل تلاميذ السنة الثانية متوسط بإحدى المتوسطات حول استعمال أو عدم استعمال الأنترنت. ① انقل وأتمم الجدول (الإناث : نعم 27 ، لا … ، المجموع 60 ؛ الذكور : نعم …، لا 77 ، المجموع … ؛ المجموع : … ؛ … ؛ 160). ② احسب النسبة المئوية للتلاميذ الذين يستعملون الأنترنت. ③ هل النسبة المئوية للتلاميذ مستعملي الأنترنت هي أكثر أهمية عند الذكور أو أكثر أهمية عند الإناث؟ ④ من بين كل التلاميذ مستعملي الأنترنت، ما هي النسبة المئوية للذكور؟ ما هي النسبة المئوية للإناث؟',
         answer={'females_no': 33, 'males_yes': 23, 'males_total': 100, 'total_yes': 50, 'total_no': 110, 'pctInternet': fr(F(50, 160) * 100),
                 'pctFemales': fr(F(27, 60) * 100), 'pctMales': fr(F(23, 100) * 100), 'shareMales': fr(F(23, 50) * 100), 'shareFemales': fr(F(27, 50) * 100)}, answerSource='computed',
         reading='les valeurs « 33 / 23 / 100 / 50 / 110 » sont déduites des totaux 60, 77, 160 et du 27 lu')
exercise(24, 80, G4, 'على إحدى واجهات المتاجر، نقرأ اللافتة المقابلة: تلفاز 35000 DA → 28000 DA. ① احسب النسبة المئوية لهذا التخفيض. ② نفرض أنّ هذا التاجر عمّم نسبة التخفيض على جميع الأجهزة الكهرومنزلية وأنّ السعر الأصلي لثلاجة هو 50000 DA، فما هو السعر الجديد للثلاجة؟',
         answer={'discountPct': fr(F(35000 - 28000, 35000) * 100), 'fridge': fr(F(50000) * (1 - F(35000 - 28000, 35000)))}, answerSource='computed',
         reading='la bande de prix est lue 35000 DA → 28000 DA')
exercise(25, 80, G4, 'أي من المراهم الآتية تحتوي على أكبر نسبة من الماء؟ (50 mL : 30 mL ماء ؛ 190 mL : 60 mL ماء ؛ 180 mL : 70 mL ماء).',
         answer={'pcts': [fr(F(30, 50) * 100), fr(F(60, 190) * 100), fr(F(70, 180) * 100)], 'greatest': 0}, answerSource='computed',
         reading='les trois pots sont lus : 50 mL dont 30 d’eau ; 190 mL dont 60 ; 180 mL dont 70')
exercise(26, 80, G5, 'ماذا تعني العبارات الآتية؟ أ) مقياس خريطة هو 1/10000 ب) مقياس رسم هو 10 جـ) مقياس تمثال هو 2 د) مقياس مخطط هو 1/100.')
exercise(27, 80, G5, 'قمنا بنسخ صورة مستطيلة الشكل طولها 12 cm وعرضها 7 cm بمقياس 1,2 …', reading='énoncé coupé à droite : le facteur 1,2 est lu ; la suite manque')
exercise(28, 80, G5, 'طول نملة على صورة مُنجزة بواسطة مجهر هو 6 cm. إذا علمت أنّ 20 mm على الصورة تُمثّل … في الحقيقة، أحسب الطول الحقيقي للنملة.', reading='nombres coupés à droite')
exercise(29, 80, G5, 'على مخطط، تُمثّل بناية بمستطيل بُعداه على المخطط 12,5 cm و … الطول الحقيقي للبناية هو 7 m. ① انقل ثم أتمم الجدول (المسافة على الخريطة 14 ؛ 1 ؛ 12,5 — المسافة الحقيقية m : …). ② اكتب مقياس هذا المخطط على الشكل 1/….',
         reading='texte coupé : la longueur réelle de 7 m est lue ; non calculable seule')
exercise(30, 80, G5, 'تريّد متوسطة على أرضية مستطيلة الشكل … 120 m. هذه الأرضية مُمثّلة بثلاثة مقاييس مختلفة: 1/8000 ، 1/6000 ، 1/4000. ارفق كل مخطط بالمقياس المناسب.', reading='figure à trois rectangles ; énoncé coupé')
exercise(31, 80, G5, '① المسافة بين منزل أيوب ومنزل عبد القادر هي … ؛ المسافة بين المنزلين على الخريطة هي 8 cm ؛ ما هو مقياس هذه الخريطة؟ ② المسافة بين منزل أيوب ومحطة القطار على الخريطة هي 18,5 cm ، ما هي هذه المسافة في الحقيقة؟', reading='nombres coupés à gauche')
exercise(32, 80, G5, 'شكل غرفة أيوب مستطيل طوله 4,5 m وعرضه 3,5 m. لرسم تصميم لهذه الغرفة رسم أيوب مستطيلا طوله … ① ما هو مقياس هذا الرسم؟ ② ارسم المستطيل الذي يمثّل هذه الغرفة، ثم داخله ضع تصميم سرير …', reading='nombres coupés')

# ── p. 81 : أؤكّد تعلّماتي (9 items) ───────────────────────────────────────────────────────────────

def self_item(n, pages, text, **extra):
    E.append({'id': f'self-{n}', 'kind': 'selfcheck', 'number': n, 'page': 81, 'section': 'أؤكّد تعلّماتي', 'reviewPages': pages, 'verified': extra.pop('verified', False), 'text': text, **extra})


self_item(1, [74], 'جدول التناسبية هو الجدول … أ) (4 ؛ 8 ؛ 12 — 10 ؛ 20 ؛ 30) ب) (3 ؛ 4 ؛ 5 — 12 ؛ 13 ؛ 14) جـ) (3 ؛ 5 ؛ 0 — 24 ؛ 40 ؛ 8).',
          options=['أ', 'ب', 'جـ'],
          answer={'proportional': [len({F(10, 4), F(20, 8), F(30, 12)}) == 1, len({F(12, 3), F(13, 4), F(14, 5)}) == 1, False]}, answerSource='computed',
          reading='le tableau ج) contient la colonne (0 ; 8) : non proportionnel')
self_item(2, [74, 75], 'هذا جدول تناسبية، معامل التناسبية الذي ينقص هو … (5 ؛ 2,5 — 3 ؛ y ، سهم × …) أ) 5/3 ب) 3/5 جـ) 1,5.', verified=True,
          options=['5/3', '3/5', '1,5'], answer={'coefficientBottomOverTop': fr(F(3, 5)), 'optionIndex': 1}, answerSource='computed')
self_item(3, [74], 'العدد المجهول y في جدول التناسبية السابق هو … أ) 1,5 ب) 3,5 جـ) 6.', verified=True,
          options=['1,5', '3,5', '6'], answer={'y': fr(fourth(5, 3, '2,5')), 'optionIndex': 0}, answerSource='computed')
self_item(4, [76], 'تعداد إحدى المتوسطات هو 420 تلميذا. إذا كانت النسبة المئوية للبنات تُقدّر بـ 40 % ، فإن عدد البنين هو: أ) 210 ب) 252 جـ) 168.',
          options=['210', '252', '168'], answer={'boys': fr(F(420) * F(60, 100)), 'optionIndex': 1}, answerSource='computed')
self_item(5, [76], 'في محلول كيميائي، مزجنا 12 cL من الحمض و 48 cL من الماء. النسبة المئوية للحمض في هذا المحلول هي … أ) 25 % ب) 4 % جـ) 20 %.',
          options=['25 %', '4 %', '20 %'], answer={'acidPct': fr(F(12, 60) * 100), 'optionIndex': 2}, answerSource='computed')
self_item(6, [76], 'أخذ 20 % من عدد يؤول إلى: أ) قسمة هذا العدد على 5 ب) ضرب هذا العدد في 5 جـ) قسمة هذا العدد على 4.', options=['÷ 5', '× 5', '÷ 4'], answer={'optionIndex': 0}, answerSource='computed')
self_item(7, [76], 'يوجد في قسم 15 بنتا و 25 ولدا. النسبة المئوية للبنات هي … (استعمل طريقتين لحسابها). أ) 50 % ب) 60 % جـ) 30 %.',
          answer={'girlsPct': fr(F(15, 40) * 100)}, answerSource='computed',
          reading='le décompte lu ne correspond à aucune des options 50 / 60 / 30 % (15 filles sur 40 : 37,5 %) : le nombre est mal lu sur le scan ; la leçon des pourcentages le relira')
self_item(8, [77], 'على مخطط بمقياس 1/250 ، طول واجهة بناية 12 m مُثلت بقطعة مستقيم طولها: أ) 48 mm ب) 48 cm جـ) 0,48 m.', options=['48 mm', '48 cm', '0,48 m'],
          answer={'cm': fr(F(1200, 250)), 'optionIndex': 0}, answerSource='computed')
self_item(9, [77], 'إذا مثّلنا 15 m بـ 3 cm على المخطط فإنّ المقياس المستعمل هو: أ) 1/5 ب) 1/50 جـ) 1/500.', options=['1/5', '1/50', '1/500'],
          answer={'scale': fr(F(3, 1500)), 'optionIndex': 2}, answerSource='computed')

# ── pp. 82–83 : أتعمّق (33–50) ─────────────────────────────────────────────────────────────────────

def deep(n, page, text, **extra):
    E.append({'id': f'deep-{n}', 'kind': 'deepening', 'number': n, 'page': page, 'section': 'أتعمّق', 'verified': extra.pop('verified', False), 'text': text, **extra})


RECIPE = {'flour': (200, 600), 'butter': (90, 250), 'sugar': (80, 230), 'eggs': (1, 4)}
BATCHES = {k: F(stock, need) for k, (need, stock) in RECIPE.items()}
deep(33, 82, 'استعمل حصصا: تريد فاطمة تحضير كعكات. تتوفّر على 600 g من الدقيق الناعم، قطعة 250 g من الزبدة، 230 g من السكر و 4 حبّات بيض. كم أقصى عدد من الكعكات يُمكن تحضيرها باستعمال الوصفة المقابلة؟ اشرح. (وصفة لثمانية كعكات: 200 g دقيق ناعم، 90 g زبدة، 80 g سكر، 1 بيضة.)', verified=True,
     answer={'batches': {k: fr(v) for k, v in BATCHES.items()}, 'limiting': 'butter', 'maxCakes': int(min(BATCHES.values()) * 8)}, answerSource='computed',
     reading='la recette est celle d’une « octuple » de gâteaux (huit gâteaux) ; le facteur limitant est le beurre : 250/90 de la recette, soit 22 gâteaux entiers')
CHOC = {'سوداء': (0, 80, 20), 'بالحليب': (0, 50, 50), 'باللوز المحلّى': (20, 40, 40), 'بالبندق': (40, 20, 40)}
deep(34, 82, 'الشكولاطة: يُريد حلواني صناعة أنواع مختلفة من الشكولاطة انطلاقا من الوصفة المشكّلة في الجدول الآتي (لتحضير 100 g شكولاطة، المكوّنات حليب / كاكاو / بندق: سوداء 20 g حليب و 80 g كاكاو ؛ بالحليب 50 و 50 ؛ باللوز المحلّى 40 حليب و 40 كاكاو و 20 لوز ؛ بالبندق 40 و 20 و 40 بندق). ما هي كُتلة كل مكوّن يحتاجه لصناعة 250 g من كل نوع؟', verified=True,
     answer={name: [fr(fourth(100, v, 250)) for v in vals] for name, vals in CHOC.items()}, answerSource='computed',
     reading='le tableau est lu à 110 dpi : colonnes (noisette ; cacao ; lait) ; pour 250 g on multiplie chaque masse par 2,5')
deep(35, 82, 'أبحث عن عدد: في إحدى المتوسطات، عدد المنتقلين إلى السنة الثالثة متوسط هو 380 تلميذ. يُمثّل هذا 80 % من إجمالي تلاميذ السنة الثانية متوسط. ما هو عدد تلاميذ السنة …؟',
     answer={'total': fr(fourth(80, 380, 100))}, answerSource='computed')
deep(36, 82, 'حساب نسبة مئوية للتخفيض: تحوّلت مساحة غابة الأمازون خلال فترة من 6250000 Km² إلى 5500000 Km². عبّر بنسبة مئوية عن هذا الانخفاض.',
     answer={'decreasePct': fr(F(6250000 - 5500000, 6250000) * 100)}, answerSource='computed')
deep(37, 82, 'أتعرّف على إشارة مرور: على منحدر طريق، نجد العلامة المرورية التي تُشير إلى ميل الطريق. وتعني أنه كلّما انتقلنا أفقيا بـ 10 m فإنّنا نرتفع بـ 1 m ، أي الميل هو 1/10 = 10 % . ① ما هو الارتفاع المقابل لانتقال أفقي قدره 3,5 Km ؟ ② على طريق سيّار نرتفع بـ 180 m من أجل انتقال أفقي قدره 1,5 Km : ارسم علامة توضّح ميل الطريق.',
     answer={'rise_m': fr(F(35, 100) * 1000), 'slopePct': fr(F(180, 1500) * 100)}, answerSource='computed',
     reading='texte coupé à gauche ; l’unité de la première question est lue : 3,5 km → 350 m')
deep(38, 82, 'تغيّرات: قبل سنتين كان تعداد تلاميذ إحدى المتوسطات … تلميذ. في السنة الماضية انخفض هذا العدد بـ … % وهذه السنة ارتفع بـ 10 %. ما هو العدد الحالي للتلاميذ في هذه المتوسطة؟', reading='nombres coupés')
deep(39, 82, 'تحدّي: ثماني دجاجات تبيض 8 بيضات في 8 أيام. كم بيضة تبيضها أربع دجاجات خلال أربعة أيام؟',
     answer={'eggs': fr(F(8) * F(4, 8) * F(4, 8))}, answerSource='computed')
deep(40, 83, 'في المصنع: تُنتج ثلاث آلات 600 قطعة خلال 4 أيام. نفترض أنّ عدد القطع يتناسب مع عدد الأيام وعدد القطع يتناسب مع عدد الآلات. ما هو عدد القطع التي تنتجها آلتان خلال 7 أيام؟',
     answer={'pieces': fr(F(600) * F(7, 4) * F(2, 3))}, answerSource='computed', reading='lu : 3 machines, 600 pièces, 4 jours ; 2 machines, 7 jours')
deep(41, 83, 'لون الصبغة: صباغ عيّنة بالصبغ بخلط ثلاثة ألوان من الصبغ … ، 35 g زرقاء و 30 g صفراء. … لون برتقالي داكن. … كل دهن ينبغي خلطه لنحصل على صبغة لها … العيّنة وتزن 500 g.', reading='énoncé presque entièrement coupé')
deep(42, 83, 'الدهن: يكفي 4 cL من الدهن لطلاء الوجوه الستة لمكعّب طول حرفه 5 cm. ما هي الكمية الكافية لطلاء الوجوه الستة لمكعّب طول حرفه 15 cm ؟',
     answer={'naive': fr(F(4) * 3), 'correct': fr(F(4) * 9)}, answerSource='computed',
     reading='lu à 110 dpi ; la surface se multiplie par k² (9) et non par k (3) : piège de non-proportionnalité pour la synthèse')
deep(43, 83, 'مؤسسة بها 240 موظف. 40 % من الموظفين هم نساء. 20 % من الموظفين سنّهم أقل من 30 سنة. 25 % من الرجال سنّهم أكثر من 30 سنة. ما هو عدد النساء …؟', reading='énoncé coupé à gauche')
deep(44, 83, 'الزيادة: استهلكت عائلة 600 KWh من الكهرباء في الثلاثي الأول لبداية السنة ثم 750 KWh في الثلاثي الثاني من نفس السنة. احسب النسبة المئوية لزيادة الاستهلاك بين الثلاثيين.',
     answer={'increasePct': fr(F(750 - 600, 600) * 100)}, answerSource='computed')
exercise(45, 83, 'هل أنت موافق أم غير موافق؟', 'محيط دائرة يتناسب مع نصف القطر.', answer=True, answerSource='computed', reading='classé avec les exercices « موافق أم غير موافق » p. 83')
E[-1]['kind'] = 'deepening'; E[-1]['section'] = 'أتعمّق'; E[-1]['id'] = 'deep-45'
exercise(46, 83, 'هل أنت موافق أم غير موافق؟', 'إذا ارتفع سعر بـ 5 % في كل سنة، فإنّه يرتفع بـ 10 % بعد سنتين.', answer=False, answerSource='computed')
E[-1]['kind'] = 'deepening'; E[-1]['section'] = 'أتعمّق'; E[-1]['id'] = 'deep-46'; E[-1]['answerDetail'] = {'twoYears': fr((F(105, 100) ** 2 - 1) * 100)}
exercise(47, 83, 'هل أنت موافق أم غير موافق؟', 'ارتفع سعر بضاعة بـ 10 %. بعد شهر انخفض سعر البضاعة بـ 10 %. إذن عاد السعر لما كان عليه.', answer=False, answerSource='computed')
E[-1]['kind'] = 'deepening'; E[-1]['section'] = 'أتعمّق'; E[-1]['id'] = 'deep-47'; E[-1]['answerDetail'] = {'factor': fr(F(11, 10) * F(9, 10))}
deep(48, 83, 'استعمل المقياس لحساب مساحة مستطيل محيطه 8 Km الممثّل في المخطّط الآتي (مستطيل ومثلث على شبكة مربّعات). ما هي مساحة المثلث في الحقيقة؟', reading='figure sur quadrillage : non transcrite')
deep(49, 83, 'المربّع المكبّر: محيط المربّع الملوّن بالأحمر هو 0,8 mm. بأي مقياس تمّ رسمه؟ (EVAMP 5e)', reading='figure : non transcrite')
deep(50, 83, 'نقل شكل: تريد فاطمة نقل المثلث المرسوم في الأسفل، لكن بأطوال أصغر، لذلك قرّرت أن يكون على رسمها AB = 4 cm (AB = 6 ؛ BC = 36 ؛ AC = 24 ؛ AB… 18). أنجز إنشاء فاطمة، مبرّرا الأبعاد المختارة.',
     answer={'scale': fr(F(4, 18)), 'ratios': ['4/18']}, answerSource='computed', reading='lecture partielle de la figure (24 cm, 18 cm, 36 cm) ; à relire par miqyas-kharita')

# ── p. 84 : أدمج تعلّماتي ; p. 85 : تكنولوجيات ────────────────────────────────────────────────────
E.append({'id': 'integration', 'kind': 'integration', 'page': 84, 'section': 'أدمج تعلّماتي', 'title': 'من القمح إلى عجين الخبز', 'verified': False,
          'text': 'يلزمنا 100 Kg من القمح لإنتاج 75 Kg من الدقيق و 100 Kg من الدقيق تسمح بتحضير 125 Kg من العجين. يُريد خبّاز تحضير 200 رغيف، علما أنّ عجينة وزنها 750 g تُنتج رغيفا. ما كُتلة القمح اللازمة لهذا الخبّاز.',
          'answer': {'doughKg': fr(F(200 * 750, 1000)), 'flourKg': fr(F(150) * 100 / 125), 'wheatKg': fr(F(120) * 100 / 75)}, 'answerSource': 'computed'})
E.append({'id': 'evaluation', 'kind': 'integration', 'page': 84, 'section': 'وضعية للتقويم', 'verified': False,
          'text': 'يملك عماد قرصا وامضا (usb) يحتوي على صور ووثائق. أهداه أبوه قرصا (usb) جديدا سعته 2 Go تماما من البيانات. حوّل عماد محتويات القرص القديم إلى القرص الجديد. مثّل بمخطّط دائري الحيّز المشغول على القرص (usb) الجديد. الوثيقة 1: قرص عماد القديم 1 Go (مخطط دائري: 25 % و 65 %). الوثيقة 2: وحدات القياس في نظام المعلومات: 1 Mo = 1000 Ko ، 1 Go = 1000 Mo.',
          'answer': {'newDiskShare': fr(F(1, 2) * 100)}, 'answerSource': 'computed', 'reading': 'texte du 1) coupé à gauche ; le disque ancien de 1 Go sur un nouveau de 2 Go occupe 50 %'})
E.append({'id': 'ict-1', 'kind': 'ict', 'page': 85, 'section': 'أوظّف تكنولوجيات الإعلام والاتصال', 'title': 'تطبيق نسبة مئوية لتخفيض', 'verified': False,
          'text': 'يخفّض تاجر أسعار بعض السلع بـ 40 %. فاستحدث ورقة الحساب (من اكسل) كي يُحدد عليها الأسعار الجديدة. الأسعار الأصلية: 150 ؛ 200 ؛ 300 ؛ 400 ؛ 500 ؛ 600 ؛ 700 ؛ 900 ؛ 1000 ؛ 1200 ؛ 1500 ؛ 1900. السطر 2: المبلغ المخفّض B1*40/100 ؛ السطر 3: السعر الجديد = B1 − B2.',
          'answer': {'reduced': [fr(F(p) * F(40, 100)) for p in (150, 200, 300, 400, 500, 600, 700, 900, 1000, 1200, 1500, 1900)],
                     'new': [fr(F(p) * F(60, 100)) for p in (150, 200, 300, 400, 500, 600, 700, 900, 1000, 1200, 1500, 1900)]}, 'answerSource': 'computed'})
E.append({'id': 'ict-2', 'kind': 'ict', 'page': 85, 'section': 'دوري الآن', 'title': 'مقارنة نسب', 'verified': False,
          'text': 'تقوم إحدى المؤسسات بملء البيانات المتعلّقة بالمكالمات الهاتفية في ورقة حساب (النموذج المقابل). انقل الجدول على ورقة اكسل وأتممه موضّحا جميع الخطوات. حدّد الشهر (أو الأشهر) التي كانت فيها نسبة المكالمات المرسلة أكثر. مساعدة لحساب النسبة المئوية: في الخلية E2 انقر على C2/D2 … Format de cellule … Pourcentage.',
          'reading': 'tableau de données illisible : non transcrit'})

# ── destinations ──────────────────────────────────────────────────────────────────────────────────
WT, RM, NM, MK = 'wadiya-tanasubiya-jadwal', 'rabi-mutanasib', 'nisba-miawiya', 'miqyas-kharita'
SYN = 'wadiya-idmajiya-tanasubiya-2am'
DEST = {
    '_comment': 'elementId → { lesson, module } ; `items` répartit un élément ; une leçon encore coming_soon est une destination EN ATTENTE (check-textbook-coverage.mjs). Les modules de rabi-mutanasib : 0 أستعدّ · 1 نشاط · 2 معارف · 3 طريقة · 4 أتمرّن · 5–7 مسائل · 8 إختبار أولي. Les numéros de module des autres leçons sont indicatifs (leur lead les décide).',
    'objectives': {'lesson': 'unit', 'module': 'page'},
    'opener': {'lesson': RM, 'module': 4},
    'challenge': {'lesson': 'unit', 'module': 'page'},
    'prep': {'lesson': RM, 'module': 0, 'items': {
        '1-2-3-4-5': {'lesson': RM, 'module': 0},
        '6-7-8': {'lesson': NM, 'module': 0},
        '9-10': {'lesson': MK, 'module': 0}}},
    'act-1': {'lesson': WT, 'module': 1}, 'act-2': {'lesson': RM, 'module': 4},
    'act-3': {'lesson': NM, 'module': 1}, 'act-4': {'lesson': MK, 'module': 1},
    'know-1a': {'lesson': WT, 'module': 2}, 'know-1b': {'lesson': RM, 'module': 2},
    'method-1': {'lesson': RM, 'module': 3},
    'now-75': {'lesson': RM, 'module': 3, 'items': {'1': {'lesson': WT, 'module': 3}, '2': {'lesson': RM, 'module': 3}}},
    'know-2a': {'lesson': NM, 'module': 2}, 'know-2b': {'lesson': MK, 'module': 2},
    'method-2a': {'lesson': NM, 'module': 3}, 'method-2b': {'lesson': MK, 'module': 3},
    'now-77': {'lesson': NM, 'module': 3, 'items': {'1': {'lesson': NM, 'module': 3}, '2': {'lesson': MK, 'module': 3}}},
    **{f'ex-{n}': {'lesson': WT, 'module': 4} for n in range(1, 12)},
    **{f'ex-{n}': {'lesson': RM, 'module': 4} for n in range(12, 19)},
    **{f'ex-{n}': {'lesson': NM, 'module': 4} for n in range(19, 26)},
    **{f'ex-{n}': {'lesson': MK, 'module': 4} for n in range(26, 33)},
    'self-1': {'lesson': WT, 'module': 8}, 'self-2': {'lesson': RM, 'module': 8}, 'self-3': {'lesson': RM, 'module': 8},
    **{f'self-{n}': {'lesson': NM, 'module': 8} for n in (4, 5, 6, 7)},
    **{f'self-{n}': {'lesson': MK, 'module': 8} for n in (8, 9)},
    'deep-33': {'lesson': RM, 'module': 6}, 'deep-34': {'lesson': RM, 'module': 4},
    **{f'deep-{n}': {'lesson': NM, 'module': 4} for n in (35, 36, 37, 38, 43, 44, 45, 46, 47)},
    **{f'deep-{n}': {'lesson': SYN, 'module': None} for n in (39, 40, 41, 42)},
    **{f'deep-{n}': {'lesson': MK, 'module': 4} for n in (48, 49, 50)},
    'integration': {'lesson': SYN, 'module': None}, 'evaluation': {'lesson': SYN, 'module': None},
    'ict-1': {'lesson': NM, 'module': None}, 'ict-2': {'lesson': NM, 'module': None},
}

DISCREPANCIES = [
    {'elementId': 'unit', 'kind': 'scope', 'text': 'Pages 70–85 complètes mais scan médiocre : le tableau final de l’activité 2 (p. 72) est coupé en bas, le bord droit des pp. 73, 78, 79, 80 et le bord gauche des pp. 74, 76, 77, 79 sont coupés, plusieurs lignes d’exercices sont tronquées (reading). Les éléments hors de rabi-mutanasib sont brefs (verified: false) : leur leçon les relira.'},
    {'elementId': 'act-2', 'kind': 'reading', 'text': 'Le tableau du 2) b) (volume 20 ; 32 — hauteur 6 ; y) est coupé : lu avec la hauteur 6 en face de 20 cL. y = 6 × 32 ÷ 20 = 9,6 cm.'},
    {'elementId': 'challenge', 'kind': 'reading', 'text': 'La fin de l’énoncé du تحدّي (lacs Tonga et Obeira) manque au scan : la synthèse le complète (`units_2am › tanasubiya-2am.challenge`).'},
    {'elementId': 'prep', 'kind': 'reading', 'text': 'Les énoncés de p. 71 sont coupés à droite : lus à 110 dpi, les items 1 à 4 sont confirmés, l’item 5 est lu 8 stylos pour 320 DA.'},
    {'elementId': 'self-7', 'kind': 'misprint', 'text': 'L’énoncé lu (15 filles, 25 garçons) donne 37,5 % de filles ; aucune des trois options (50 %, 60 %, 30 %) n’y correspond. Soit le scan altère un nombre, soit l’énoncé est fautif ; nisba-miawiya le relira.'},
    {'elementId': 'method-1', 'kind': 'reading', 'text': 'La solution de la question 3 est écrite par produits en croix puis par la propriété multiplicative (13 × 10 = 130) ; les deux sont lues à 170 dpi (130 heures).'},
    {'elementId': 'ex-15', 'kind': 'reading', 'text': 'Les tableaux ① et ③ portent les flèches croisées (produits en croix), ② et ④ la flèche × … (coefficient / propriété multiplicative) : lues ainsi à 110 dpi, réponses 52 ; 10,5 ; 46,2 ; 9.'},
]

doc = {
    '_comment': [
        'EXTRACTION CANONIQUE du manuel scolaire officiel — 2AM, الجيل الثاني (منشورات الشهاب 2017), unité 5 « التناسبية ».',
        'Source : docs/official-book-pdfs/كتاب الرياضيات للسنة الثانية متوسط الجيل الثاني.pdf, pages 70 à 85 du livre (PDF 67 à 82).',
        'Ce fichier est LA source de vérité pédagogique de l’unité ; tout contenu cite un `id` d’ici via `source.elementId`.',
        'Transcription VISUELLE d’un scan médiocre ; réponses calculées (Fraction / Decimal) dans build-extraction.py, `answerSource: computed`.',
        'Généré par docs/sources/2am/unit5/build-extraction.py — ne pas éditer à la main.',
    ],
    'unitCode': 'tanasubiya-2am',
    'textbook': {'title': 'كتاب الرياضيات — السنة الثانية من التعليم المتوسط', 'generation': 'الجيل الثاني', 'unitNumber': 5,
                 'unitTitle': 'التناسبية', 'pages': {'first': 70, 'last': 85}, 'pdfPageOffset': 3,
                 'sections': ['سأتعلّم في هذا الباب', 'تحدّي', 'أستعدّ', 'أنشطة', 'معارف', 'طرائق', 'دوري الآن', 'أوظّف تعلّماتي', 'أؤكّد تعلّماتي', 'أتعمّق', 'أدمج تعلّماتي', 'وضعية للتقويم', 'أوظّف تكنولوجيات الإعلام والاتصال']},
    'frozenAt': '2026-10-21',
    'terminology': {'note': 'Le manuel écrit « جدول تناسبية », « معامل التناسبية », « الرابع المتناسب », « الخاصية الجمعية / الضربية », « المرور بالوحدة », « مساواة الجداءين المتصالبين », « نسبة مئوية », « مقياس ».',
                    'terms': ['جدول تناسبية', 'معامل التناسبية', 'الرابع المتناسب', 'الخاصية الجمعية', 'الخاصية الضربية', 'المرور بالوحدة', 'الجداءان المتصالبان', 'نسبة مئوية', 'مقياس']},
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
# les éléments de la leçon générée maintenant doivent être relus
LESSON = RM
bad = [e['id'] for e in E if DEST[e['id']].get('lesson') == LESSON and not e.get('verified') and e['id'] not in ()]
assert not bad, f'éléments de {LESSON} non vérifiés : {bad}'
# exactitude des réponses clés de la leçon (contrôle indépendant)
assert fourth(5, 625, 6) == 750
assert fourth(6, 20, 15) == 50 and fourth(20, 6, 32) == F(48, 5)
assert fourth(8, 1880, 5) == 1175 and fourth(8, 1880, 13) == 3055 and fourth(1880, 8, 30550) == 130

out = Path(__file__).with_name('extraction.json')
out.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
pending = sum(1 for k, v in DEST.items() if k != '_comment' and v['lesson'] not in ('unit', LESSON))
print(f'{out} — {len(E)} éléments ({len(E) - pending} pour {LESSON} ou l’unité, {pending} pour les autres leçons)')
