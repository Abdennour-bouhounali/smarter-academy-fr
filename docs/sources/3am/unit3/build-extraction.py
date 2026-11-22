#!/usr/bin/env python3
"""Génère docs/sources/3am/unit3/extraction.json — 3AM, unité 3 « القوى ذات أسس نسبية صحيحة » (manuel الجيل الثاني,
منشورات الشهاب 2017 ; pp. 38–53 du livre = PDF 38–53, décalage 0 — docs/sources/3am/textbook-map.json).

Transcription VISUELLE (pages rendues à 110 dpi ; le scan n'a pas de couche texte). Tout ce qui va à la leçon
quwat-adad-nisbi a été RELU à 220–800 dpi (exposants des act-6, ex-34 … ex-53, self-22 … self-25, معارف 6–8, طريقة p. 45) :
`verified: True`. Depuis le 2026-10-26 les éléments de quwa-adad-ashara (prep 1–15 et 18–25, act-1 … act-3, know-1, know-2,
method-43a/b, ex-1 … ex-13, self-1, self-2, self-3, self-11) sont RELUS à 220–500 dpi : `verified: True` (corrections et doutes
dans DISCREPANCIES). Les éléments des leçons non encore générées (qawaid-quwa-ashara, kitaba-ilmiya-rutba, la synthèse) sont
transcrits plus brièvement et marqués `verified: False` : leur leçon les relira. Les réponses sont
CALCULÉES ici (Fraction exacte), jamais tapées.

FRONTIÈRE entre les leçons de l'unité (ce que chacune possède) :
  • quwa-adad-ashara — 10^n pour n entier relatif : 10^n = 10 × … × 10, 10^0 = 1, 10^-n = 1/10^n, écriture décimale d'une
    puissance de 10 (1 suivi de n zéros / 1 au rang n après la virgule), écrire un décimal avec des puissances de 10,
    préfixes et unités (km, mg, octets…).
  • qawaid-quwa-ashara — les TROIS règles sur les puissances de 10 : 10^m × 10^n = 10^(m+n), 10^m / 10^n = 10^(m−n),
    (10^m)^n = 10^(mn), et les calculs a × 10^p × b × 10^q.
  • kitaba-ilmiya-rutba — écriture scientifique a × 10^n (1 ≤ a < 10), encadrement 10^n ≤ A < 10^(n+1), ordre de grandeur
    a' × 10^n (a arrondi à l'unité), comparaison de nombres en écriture scientifique.
  • quwat-adad-nisbi (la leçon générée MAINTENANT) — a^n pour a RELATIF non nul (et a = p/q) : définition (n facteurs),
    a^1 = a, a^0 = 1, a^-n = 1/a^n, le SIGNE de (−a)^n selon la parité de n (et −a^n ≠ (−a)^n), les CINQ règles
    a^m × a^n, a^m / a^n, (a^m)^n, (ab)^n = a^n b^n, (a/b)^n = a^n / b^n, et la PRIORITÉ des puissances dans une chaîne
    de calculs. Les puissances de 10 y sont un cas particulier déjà connu (rappel), jamais réenseigné.
  • wadiya-idmajiya-quwa-nisbiya — أدمج تعلّماتي (CO2), وضعية للتقويم (globules rouges), ICT (l'échiquier 2^n).
    Les أتعمّق 63, 64, 68, 69 (puissances de 2 / 8, doublement) NE sont PAS dans la synthèse (MASAIL §14 : pas d'أتعمّق dans
    أدمج تعلّماتي) : déclarés `notIntegrated` (décision du propriétaire en attente : adaptation dans la banque de quwat-adad-nisbi).

Colonnes des QCM (أستعدّ p. 39, أؤكّد p. 49) : les options sont rangées [(1), (2), (3)] avec (1) la colonne la plus À DROITE
(à côté de la question) ; `correct` donne les indices 0-based des options justes.

L'unité est générée LEÇON PAR LEÇON : les destinations vers une leçon encore coming_soon sont EN ATTENTE
(scripts/check-textbook-coverage.mjs).

Usage : python3 docs/sources/3am/unit3/build-extraction.py
"""
import json
from decimal import Decimal as D
from fractions import Fraction as F
from pathlib import Path


def dec(s):
    return D(str(s).replace(',', '.').replace(' ', ''))


def q(s):
    """Un nombre du manuel en Fraction exacte : '7/4', '0,25', '12'."""
    s = str(s).replace(' ', '')
    if '/' in s:
        n, d = s.split('/')
        return F(dec(n)) / F(dec(d))
    return F(dec(s))


def frac(x):
    x = F(x)
    return str(x.numerator) if x.denominator == 1 else f'{x.numerator}/{x.denominator}'


def fr(x):
    """Un décimal exact écrit à l'algérienne (virgule) ; x Fraction à dénominateur 2^a 5^b."""
    x = F(x)
    s = format((D(x.numerator) / D(x.denominator)).normalize(), 'f')
    assert F(D(s)) == x, f'{x} n’est pas décimal'
    return s.replace('.', ',')


def P(a, n):
    return F(a) ** n


def sci(x):
    """Écriture scientifique exacte (a, n) avec 1 ≤ |a| < 10."""
    x = F(x)
    n = 0
    s = -1 if x < 0 else 1
    x = abs(x)
    while x >= 10:
        x /= 10
        n += 1
    while x < 1:
        x *= 10
        n -= 1
    m = s * x
    if F(D(m.numerator) / D(m.denominator)) == m:
        return f'{fr(m)} × 10^{n}', n
    return f'≈ {format((D(m.numerator) / D(m.denominator)).quantize(D("0.001")), "f").replace(".", ",")} × 10^{n}', n


def order(x):
    """Ordre de grandeur a' × 10^n, a' = a arrondi à l'unité (méthode p. 45)."""
    _, n = sci(x)
    a = abs(F(x)) / F(10) ** n
    r = int(a + F(1, 2))
    if r == 10:
        r, n = 1, n + 1
    return f'{r} × 10^{n}'


E = []

# ── p. 38 : ouverture ─────────────────────────────────────────────────────────────────────────────
E.append({
    'id': 'objectives', 'kind': 'objectives', 'page': 38, 'section': 'سأتعلّم في هذا الباب', 'verified': True,
    'items': [
        'تعيين القوة من الرتبة n للعدد 10.',
        'معرفة واستعمال قواعد الحساب على قوى العدد 10.',
        'كتابة عدد عشري باستعمال قوى 10.',
        'تعيين الكتابة العلمية لعدد عشري.',
        'استعمال الكتابة العلمية لحصر عدد عشري ولإيجاد رتبة مقدار عدد.',
        'حساب قوة عدد نسبي.',
        'معرفة قواعد الحساب على قوة عدد نسبي واستعمالها في وضعيات بسيطة.',
        'إجراء حساب يتضمن قوى.',
    ],
})
UA = dec('149597870.700')
E.append({
    'id': 'opener', 'kind': 'aside', 'page': 38, 'section': 'تمهيد', 'verified': False,
    'text': 'تأسست نهائيا في سنة 2009 الوحدة الفلكية (UA) والتي توافق المسافة بين الأرض والشمس. هذه المسافة لا تتغير … نُقشت على رخام من طرف الاتحاد الدولي للفلك. هذه المسافة أساسية في الوحدة الفلكية وتتماشى مع جميع الثوابت في النظام الشمسي. تقدر هذه المسافة بـ: 149 597 870,700 Km. ولتبسيط قراءة هذه المسافة نقول أنها تقارب 150 مليون كيلومتر.',
    'reading': 'quelques mots masqués par des carrés blancs du scan (ligne 2)',
    'answer': {'scientific': sci(F(UA))[0], 'order': order(F(UA)), 'approx': '150 × 10^6 km'}, 'answerSource': 'computed',
})
FLOWERS = [1, 3, 9]
assert all(FLOWERS[i + 1] == 3 * FLOWERS[i] for i in range(2))
DAY10 = 3 ** 9
assert DAY10 == 19683 and DAY10 != 300
E.append({
    'id': 'challenge', 'kind': 'challenge', 'page': 38, 'section': 'تحدّي', 'verified': True,
    'text': 'قالت ليلى: «في اليوم العاشر يكون عدد الأزهار 300». هل هي على صواب؟',
    'figure': 'ثلاث رسوم: اليوم الأول (ساق بزهرة واحدة)، اليوم الثاني (3 أزهار)، اليوم الثالث (9 أزهار).',
    'reading': 'Fleurs comptées à 300 dpi : 1, 3, 9 (chaque fleur en donne 3 le lendemain).',
    'answer': {'flowers': FLOWERS, 'rule': 'عدد الأزهار في اليوم n هو 3^(n−1)', 'day10': '3^9', 'day10Value': DAY10,
               'lailaRight': False},
    'answerSource': 'computed',
})

# ── p. 39 : أستعدّ ─────────────────────────────────────────────────────────────────────────────────


def prep(n, question, options, value, **extra):
    """options = [(1), (2), (3)] ; (1) = colonne la plus à droite. `value` = la valeur exacte attendue (Fraction ou str)."""
    correct = [i for i, o in enumerate(options) if (q(o) == value if isinstance(value, F) else o == value)]
    assert correct, f'prep {n}: aucune option juste'
    return {'n': n, 'question': question, 'options': options, 'correct': correct, **extra}


PREP = [
    prep(1, '12,3 × 10 = ……', ['1,23', '123', '0,123'], q('12,3') * 10),
    prep(2, '1,9327 × 10 = ……', ['0,19327', '193,27', '19,327'], q('1,9327') * 10),
    prep(3, '0,00123 × 10 = ……', ['0,123', '0,0123', '1,23'], q('0,00123') * 10),
    prep(4, '23,456 × 100 = ……', ['0,23456', '234,56', '2345,6'], q('23,456') * 100),
    prep(5, '0,00123 × 100 = ……', ['0,123', '1,23', '12,3'], q('0,00123') * 100),
    prep(6, '12,56 × 0,01 = ……', ['1,256', '125,6', '0,1256'], q('12,56') * q('0,01')),
    prep(7, 'القسمة على 0,01 هي الضرب في ……', ['10', '100', '1000'], 1 / q('0,01')),
    prep(8, '85,36 × …… = 8,536', ['10', '0,01', '0,1'], q('8,536') / q('85,36')),
    prep(9, '0,326 × …… = 3,26', ['0,1', '10', '0,01'], q('3,26') / q('0,326')),
    prep(10, '0,326 × …… = 0,0326', ['0,1', '0,01', '0,001'], q('0,0326') / q('0,326')),
    prep(11, '0,00045 × …… = 4,5', ['100', '1000', '10000'], q('4,5') / q('0,00045')),
    prep(12, '3926,3 × …… = 3,9263', ['0,1', '0,001', '0,0001'], q('3,9263') / q('3926,3')),
    prep(13, '8000 × 8000 = ……', ['640000', '64000', '64000000'], F(8000 * 8000)),
    prep(14, '0,5 × 4000 = ……', ['20000', '2000', '200'], q('0,5') * 4000),
    prep(15, 'مقلوب 10 هو ……', ['-10', '1/10', '0,1'], F(1, 10)),
    prep(16, 'جداء خمسة عوامل كلها مساوية للعدد 3 هو ……', ['15', '243', '75'], P(3, 5)),
    prep(17, '(-5) × (-5) × (-5) = ……', ['125', '-125', '75'], P(-5, 3)),
    prep(18, '2×5×2×5×2×5×2×5×2×5 = ……', ['10000', '100000', '1000000'], P(10, 5)),
    prep(19, 'مساحة مربع ضلعه 9cm هي ……', ['18cm²', '36cm³', '81cm²'], '81cm²'),
    prep(20, 'حجم مكعب حرفه 7cm هو ……', ['343cm³', '56cm³', '27cm³'], '343cm³'),
    prep(21, '718mm = …… m', ['7,18', '0,718', '0,0718'], q('718') / 1000),
    prep(22, '5,12Km = …… m', ['5,12', '5120', '512'], q('5,12') * 1000),
    prep(23, '2365dam² = …… dm²', ['236500', '23,65', '23650000'], F(2365 * 100 ** 2)),
    prep(24, '51,12Kg = …… g', ['511,2', '51120', '0,05112'], q('51,12') * 1000),
    prep(25, '0,01g = …… Kg', ['0,00001', '0,0001', '0,000001'], q('0,01') / 1000),
]
assert [p['correct'] for p in PREP][15:17] == [[1], [1]] and PREP[14]['correct'] == [1, 2]
E.append({'id': 'prep', 'kind': 'prerequisites', 'page': 39, 'section': 'أستعدّ', 'verified': True,
          'instruction': 'جد الإجابة الصحيحة (أو الإجابات الصحيحة) في كل حالة، مبرّرا إياها.', 'items': PREP,
          'answerSource': 'computed',
          'note': 'Items 16–17 (puissance d’un entier, d’un négatif) mesurent les prérequis de quwat-adad-nisbi ; 19–20 (aire, volume) sont des carrés/cubes ; 18 = 10^5.'})

# ── pp. 40–41 : أنشطة ──────────────────────────────────────────────────────────────────────────────
E.append({'id': 'act-1', 'kind': 'activity', 'number': 1, 'page': 40, 'section': 'أنشطة', 'title': 'قوى ذات أسس صحيحة موجبة', 'verified': True,
          'text': '1) اكتشاف قوة عدد ذي أس موجب: تنقسم خلية إلى 10 خلايا خلال ساعة. أ) كم يصبح عدد الخلايا في: 3 ساعات ؛ 5 ساعات ؛ 9 ساعات. عبّر عن هذه الأعداد بـ 10 و × فقط. ب) كم يصبح عدد الخلايا في n ساعة؟ جـ) ما هو عدد الساعات اللازم حتى يكون عدد الخلايا عشرة ملايير؟ 2) الترميز 10^n: نرمز إلى 10 × 10 بـ 10^2 ونكتب 10^2 = 10 × 10 ؛ نرمز إلى 10 × 10 × 10 بـ 10^3 … نرمز إلى 10 × 10 × …… × 10 (n عاملا) بـ 10^n. استعمل الترميز 10^n للتعبير عن: مساحة مربع طول ضلعه 10cm • حجم مكعب طول حرفه 10dm.',
          'figure': 'صورة: انقسام الخلية.',
          'answer': {'cells': {'3': '10^3', '5': '10^5', '9': '10^9'}, 'n': '10^n', 'tenBillion': 10, 'square': '10^2 cm²', 'cube': '10^3 dm³'},
          'answerSource': 'computed'})
assert P(10, 10) == 10_000_000_000
E.append({'id': 'act-2', 'kind': 'activity', 'number': 2, 'page': 40, 'section': 'أنشطة', 'title': 'قوى ذات أسس صحيحة سالبة', 'verified': True,
          'text': '1) انقل ثم أتمم الجدول الموالي: (سطر « ترميز 10^n »: 10^4 ؛ 10^… ؛ 10^2 ؛ 10^1 ؛ 10^… ؛ 10^… … ؛ سطر « كتابة عشرية »: …) مع أسهم « ÷ 10 » بين الخانات (اثنتان « ÷ …. » للإتمام). 2) ماذا يساوي 10^0 ؛ 10^1 ؟ 3) عبّر بعدد كسري عن كل من 10^-1 ؛ 10^-2 ؛ 10^-3 ؛ 10^-4 . 4) اكتب مساواة تعبّر على أنّ 10^-n هو مقلوب 10^n .',
          'reading': 'relu à 220 dpi : 9 colonnes (de droite à gauche 10^4, 10^3, 10^2, 10^1, 10^0, 10^-1, 10^-2, 10^-3, 10^-4) ; les exposants des 5 dernières colonnes sont à demi effacés (« 10 » sans exposant, « 10^-… ») mais la suite des flèches ÷ 10 les impose ; 8 flèches, dont 2 cases « ÷ …. » à compléter',
          'answer': {'table': {f'10^{k}': fr(P(10, k)) for k in range(4, -5, -1)}, '10^0': 1, '10^1': 10,
                     'fractions': [f'1/{10 ** k}' for k in range(1, 5)], 'reciprocal': '10^-n = 1/10^n'},
          'answerSource': 'computed'})
E.append({'id': 'act-3', 'kind': 'activity', 'number': 3, 'page': 40, 'section': 'أنشطة', 'title': 'الكتابة العشرية لقوة العدد 10', 'verified': True,
          'text': '1) أعط الكتابة العشرية للأعداد التالية: 10^2 ؛ 10^6 ؛ 10^9 . 2) انقل وأتمم: «الكتابة العشرية لـ 10^12 هي 1 متبوعا بـ …… صفرا». 3) اكتب على شكل قوة العدد 10 الأعداد التالية: 100 ؛ 10 000 ؛ 100 000 ؛ 1 000 000 ؛ 1 000 000 000 . 4) أعط الكتابة العشرية للأعداد التالية: 10^-2 ؛ 10^-3 ؛ 10^-5 ؛ 10^-9 . 5) انقل وأتمم: «الكتابة العشرية للعدد 10^-11 تحتوي على …… صفرا متبوعة بـ 1. الفاصلة موضوعة بعد …… الأول» «في الكتابة العشرية للعدد 10^-13 رتبة العدد 1 بعد الفاصلة هي ……».',
          'answer': {'1': [str(10 ** k) for k in (2, 6, 9)], '2': 12, '3': ['10^2', '10^4', '10^5', '10^6', '10^9'],
                     '4': [fr(P(10, k)) for k in (-2, -3, -5, -9)], '5': {'zeros': 11, 'after': 'الصفر', 'rank13': 13}},
          'answerSource': 'computed'})
PUPIL = [('10^3 × 10^7 = 10^10', P(10, 3) * P(10, 7) == P(10, 10)), ('10^5 × 10^3 = 10^15', P(10, 5) * P(10, 3) == P(10, 15)),
         ('10^5 / 10^2 = 10^3', P(10, 5) / P(10, 2) == P(10, 3)), ('10^-5 × 10^2 = 10^7', P(10, -5) * P(10, 2) == P(10, 7)),
         ('10^5 / 10^-2 = 10^3', P(10, 5) / P(10, -2) == P(10, 3)), ('(10^3)^4 = 10^7', P(10, 3) ** 4 == P(10, 7))]
assert [ok for _, ok in PUPIL] == [True, False, True, False, False, False]
E.append({'id': 'act-4', 'kind': 'activity', 'number': 4, 'page': 41, 'section': 'أنشطة', 'title': 'قواعد الحساب على قوى العدد 10', 'verified': False,
          'text': '1) جداء قوتين للعدد 10 — انقل وأتمم: 10^3 × 10^4 = 10 × … × … × … × … × … × 10 (…… عاملا). 2) نسبة قوتين للعدد 10 — انقل وأتمم: 10^9/10^5 = 10^9 × 1/…. = 10^9 × 10 = 10 . 3) قوة قوة العدد 10 — انقل وأتمم: (10^3)^5 = (10^3) × … × … × (10^3) = 10 × 10 × 10 × …… × 10 (…… عاملا). • قام أحد التلاميذ بالحساب وهذه نتائجه (مصحّحة بالأحمر): 10^3 × 10^7 = 10^10 (صحيح) ؛ 10^5 × 10^3 = 10^15 (خطأ) ؛ 10^5/10^2 = 10^3 (صحيح) ؛ 10^-5 × 10^2 = 10^7 (خطأ) ؛ 10^5/10^-2 = 10^3 (خطأ) ؛ (10^3)^4 = 10^7 (خطأ). أ) اشرح ملاحظات المصحح. ب) ضع تخمينا للنتائج التالية حيث n و m عددان صحيحان: 10^m × 10^n = …. ؛ 10^m/10^n = …. ؛ (10^m)^n = ….',
          'answer': {'1': {'factors': 7, 'power': '10^7'}, '2': '10^4', '3': {'factors': 15, 'power': '10^15'},
                     'pupil': [{'line': l, 'true': ok} for l, ok in PUPIL],
                     'corrections': ['10^5 × 10^3 = 10^8', '10^-5 × 10^2 = 10^-3', '10^5 / 10^-2 = 10^7', '(10^3)^4 = 10^12'],
                     'conjecture': ['10^(m+n)', '10^(m−n)', '10^(mn)']},
          'answerSource': 'computed'})
assert 16384 * 31250 == 512_000_000 and 163840 * 312500 == 51_200_000_000
PLANETS = {'المريخ': F(2279, 10) * P(10, 6), 'عطارد': F(57_910_000), 'زحل': q('14,29') * P(10, 8), 'الأرض': F(150_000_000), 'الزهرة': q('108,2') * P(10, 5)}
E.append({'id': 'act-5', 'kind': 'activity', 'number': 5, 'page': 41, 'section': 'أنشطة', 'title': 'الكتابة العلمية - رتبة قدر', 'verified': False,
          'text': '1) أ) استعمل الآلة الحاسبة لإجراء الجداء: 16 384 × 31 250 . ب) بدون استعمال الآلة الحاسبة، احسب الجداء: 163 840 × 312 500 (يمكنك استعمال نتيجة السؤال السابق). جـ) تحقق من صحة النتيجة باستعمال الآلة الحاسبة. هل وجدت نفس النتيجة؟ 2) يعبّر الجدول الموالي عن المسافة إلى الشمس: المريخ 227,9 × 10^6 Km ؛ عطارد 57 910 000Km ؛ زحل 14,29 × 10^8 Km ؛ الأرض 150 000 000Km ؛ الزهرة 108,2 × 10^5 Km . اقترح كل من أمين وإيمان ونسرين كتابة أخرى للمسافة بين الأرض والشمس. أمين: 150 × 10^6 Km ؛ إيمان: 15 × 10^7 Km ؛ نسرين: 1,5 × 10^8 Km . أ) أيهم على صواب؟ ب) أكتب كُلًا من المسافات المذكورة على الشكل a × 10^n ، حيث a عدد عشري برقم واحد قبل الفاصلة يختلف عن الصفر، ثم رتّب هذه المسافات ترتيبا تصاعديا. 3) استعمل الكتابة العلمية لإعطاء رتبة قدر بالمتر للأشياء التالية: • حبة رمل: 0,00025m . • بكتيريا: 0,2µm (µm تعني ميكرومتر ؛ 1µm = 10^-3 mm). • ذرّة الكربون: 0,14nm (nm تعني نانومتر ؛ 1nm = 10^-6 µm).',
          'reading': 'la valeur de الزهرة se lit « 108,2 × 10^5 » sur le scan (la distance réelle est 108,2 × 10^6 km) — voir discrepancies',
          'answer': {'1': {'a': 512_000_000, 'b': 51_200_000_000},
                     '2': {'allRight': True, 'scientific': {k: sci(v)[0] for k, v in PLANETS.items()},
                           'ascending': sorted(PLANETS, key=PLANETS.get)},
                     '3': {'sand': order(q('0,00025')), 'bacteria': order(q('0,2') * P(10, -6)), 'carbon': order(q('0,14') * P(10, -9))}},
          'answerSource': 'computed'})

ACT6 = [
    ('3^2 × 3^5', P(3, 2) * P(3, 5), 3, 7),
    ('7^2 × 7^-5', P(7, 2) * P(7, -5), 7, -3),
    ('5^10 / 5^2', P(5, 10) / P(5, 2), 5, 8),
    ('7^3 / 7^-2', P(7, 3) / P(7, -2), 7, 5),
    ('(11^3)^2', P(11, 3) ** 2, 11, 6),
    ('(13^2)^-5', P(13, 2) ** -5, 13, -10),
    ('6^-8 × 6^-2', P(6, -8) * P(6, -2), 6, -10),
]
for _, v, a, n in ACT6:
    assert v == P(a, n)
E.append({'id': 'act-6', 'kind': 'activity', 'number': 6, 'page': 41, 'section': 'أنشطة', 'title': 'قوة عدد نسبي', 'verified': True,
          'text': 'اكتب على الشكل a^n الأعداد التالية: 3^2 × 3^5 ؛ 7^2 × 7^-5 ؛ 5^10 / 5^2 ؛ 7^3 / 7^-2 ; (11^3)^2 ؛ (13^2)^-5 ؛ 6^-8 × 6^-2 .',
          'items': [{'expr': e, 'answer': f'{a}^{n}'} for e, _, a, n in ACT6],
          'reading': 'exposants relus à 450–800 dpi : 5^10 / 5^2 (dénominateur 5², pas 5⁴) et 6^-8 × 6^-2 (premier exposant −8, pas 3) — voir discrepancies',
          'answerSource': 'computed'})

# ── p. 42 : معارف 1–3 ───────────────────────────────────────────────────────────────────────────────
E.append({'id': 'know-1', 'kind': 'knowledge', 'number': 1, 'page': 42, 'section': 'معارف', 'title': 'قوى 10 ذات أسس موجبة', 'verified': True,
          'text': 'تدل الكتابة 10^n على جداء n عاملا كلها مساوية للعدد 10. يُقرأ 10^n : « 10 أس n ». 10^n = 10 × 10 × 10 × …… × 10 (n عاملا) ؛ 10^n = 100……0 (n صفرا). ملاحظة: 10^1 = 10 ؛ 10^0 = 1 . أمثلة: • 10^5 = 10 × 10 × 10 × 10 × 10 ، 10^5 = 100 000 . • 10^19 = 10 × 10 × …… × 10 (19 عاملا) ، 10^19 = 10 000 000……000 (19 صفرا).',
          'answer': {'10^5': P(10, 5).numerator, '10^19zeros': len(str(10 ** 19)) - 1}, 'answerSource': 'computed'})
E.append({'id': 'know-2', 'kind': 'knowledge', 'number': 2, 'page': 42, 'section': 'معارف', 'title': 'قوى ذات أسس سالبة', 'verified': True,
          'text': 'تدل الكتابة 10^-n على مقلوب 10^n. 10^-n = 1/10^n = 1/(10 × …… × 10) (n عاملا) = 1/10……0 (n صفرا). 10^-n = 0,000……01 (n صفرا) ، 1 في الرتبة n بعد الفاصلة. أمثلة: • 10^-5 = 1/10^5 ، 10^-5 = 0,00001 ، رتبة العدد 1 هي 5 بعد الفاصلة. • 10^-23 = 1/10^23 = 0,000………0001 (23 صفرا) ، رتبة العدد 1 هي 23 بعد الفاصلة.',
          'answer': {'10^-5': fr(P(10, -5))}, 'answerSource': 'computed'})
KNOW3 = [('10^3 × 10^5', P(10, 3) * P(10, 5), 8), ('10^4 × 10^-6', P(10, 4) * P(10, -6), -2), ('10^7 / 10^2', P(10, 7) / P(10, 2), 5),
         ('10^5 / 10^-2', P(10, 5) / P(10, -2), 7), ('(10^3)^2', P(10, 3) ** 2, 6), ('(10^-3)^2', P(10, -3) ** 2, -6)]
for _, v, n in KNOW3:
    assert v == P(10, n)
E.append({'id': 'know-3', 'kind': 'knowledge', 'number': 3, 'page': 42, 'section': 'معارف', 'title': 'قواعد الحساب على قوى العدد 10', 'verified': False,
          'text': 'n و m عددان صحيحان ؛ لدينا: 10^m × 10^n = 10^(m+n) ؛ 10^m / 10^n = 10^(m−n) ؛ (10^m)^n = 10^(mn) . أمثلة: 10^3 × 10^5 = 10^(3+5) = 10^8 ؛ 10^4 × 10^-6 = 10^(4−6) = 10^-2 ؛ 10^7/10^2 = 10^(7−2) = 10^5 ؛ 10^5/10^-2 = 10^5 × 10^2 = 10^(5+2) = 10^7 ؛ (10^3)^2 = 10^(3×2) = 10^6 ؛ (10^-3)^2 = 10^(−3×2) = 10^-6 .',
          'answer': {e: f'10^{n}' for e, _, n in KNOW3}, 'answerSource': 'computed'})

# ── p. 43 : طرائق + دوري الآن ───────────────────────────────────────────────────────────────────────
E.append({'id': 'method-43a', 'kind': 'method', 'page': 43, 'section': 'طرائق', 'title': 'قوة 10 ذات أس موجب', 'verified': True,
          'text': 'تمرين: 1) اكتب على شكل قوة 10: a = 10 000 ؛ b = 100 000 ؛ c = 1000 000 . 2) اكتب كتابة عشرية للعدد e = 10^9 . حلّ: a = 10^4 ؛ b = 10^5 ؛ c = 10^6 ؛ e = 1000 000 000 . طريقة: لكتابة a ؛ b ؛ c على شكل قوة 10 نكتب 10^n حيث n عدد الأصفار. لكتابة e على شكل عشري نكتب 1 متبوعًا بـ 9 أصفار.',
          'answer': {'a': '10^4', 'b': '10^5', 'c': '10^6', 'e': 10 ** 9}, 'answerSource': 'computed'})
E.append({'id': 'method-43b', 'kind': 'method', 'page': 43, 'section': 'طرائق', 'title': 'قوة 10 ذات أس سالب', 'verified': True,
          'text': 'تمرين: 1) اكتب على شكل قوة 10: f = 0,01 ؛ g = 0,001 ؛ h = 0,0001 . 2) أعط كتابة عشرية للعدد i = 10^-6 . حلّ: f = 10^-2 ؛ g = 10^-3 ؛ h = 10^-4 ؛ i = 0,000001 . طريقة: لكتابة f ؛ g ؛ h على شكل قوة للعدد 10 نكتب 10^-n حيث n رتبة 1 بعد الفاصلة. لكتابة i على الشكل العشري نكتب i = 0,00…..1 حيث 1 في الرتبة 6 بعد الفاصلة (5 أصفار بين الفاصلة و 1).',
          'answer': {'f': '10^-2', 'g': '10^-3', 'h': '10^-4', 'i': fr(P(10, -6))}, 'answerSource': 'computed'})
M43C = {'A': (P(10, 3) * P(10, 5), 8), 'B': (P(10, -3) * P(10, 5), 2), 'C': (P(10, -4) * P(10, -5), -9), 'D': (P(10, 7) / P(10, 3), 4),
        'E': (P(10, -7) / P(10, 3), -10), 'F': (P(10, 7) / P(10, -3), 10), 'G': (P(10, 3) ** 5, 15), 'H': (P(10, -3) ** 5, -15), 'I': (P(10, 3) ** -5, -15)}
for v, n in M43C.values():
    assert v == P(10, n)
E.append({'id': 'method-43c', 'kind': 'method', 'page': 43, 'section': 'طرائق', 'title': 'قواعد الحساب على قوى العدد 10', 'verified': False,
          'text': 'تمرين: أكتب الأعداد الموالية على شكل قوة واحدة للعدد 10: A = 10^3 × 10^5 ؛ B = 10^-3 × 10^5 ؛ C = 10^-4 × 10^-5 ؛ D = 10^7/10^3 ؛ E = 10^-7/10^3 ؛ F = 10^7/10^-3 ؛ G = (10^3)^5 ؛ H = (10^-3)^5 ؛ I = (10^3)^-5 . حلّ: A = 10^8 ؛ B = 10^2 ؛ C = 10^-9 ؛ D = 10^4 ؛ E = 10^-10 ؛ F = 10^10 ؛ G = 10^15 ؛ H = 10^-15 ؛ I = 10^-15 . طريقة: لكتابة A ؛ B ؛ C على شكل قوة 10 نكتب 10^p حيث p هو مجموع الأسّين (10^m × 10^n = 10^(m+n)). لكتابة D ؛ E ؛ F نكتب 10^q حيث q هو فرق الأسّين (10^m/10^n = 10^(m−n)). لكتابة G ؛ H ؛ I نكتب 10^r حيث r هو جداء الأسّين ((10^m)^n = 10^(m×n)).',
          'answer': {k: f'10^{n}' for k, (_, n) in M43C.items()}, 'answerSource': 'computed'})
NOW43 = {'P': 7 * P(10, 3) * 3 * P(10, 9), 'Q': q('0,5') * P(10, -2) * 20 * P(10, 4), 'R': 8 * P(10, -5) * q('0,3') * P(10, -3),
         'S': q('0,2') * P(10, -6) * q('0,3') * P(10, 9) / (6 * P(10, -1)), 'T': 20 * P(10, 3) ** -2 / (5 * P(10, 5)),
         'U': 7 * P(10, -2) * 4 * P(10, -5) / (5 * P(10, -3) ** 7)}
assert NOW43['Q'] == 1000 and NOW43['S'] == 100 and NOW43['T'] == 4 * P(10, -11)
E.append({'id': 'now-43', 'kind': 'practice', 'page': 43, 'section': 'دوري الآن', 'verified': False,
          'text': 'احسب ما يلي وأعط النتيجة على أبسط شكل ممكن: P = 7 × 10^3 × 3 × 10^9 ؛ Q = 0,5 × 10^-2 × 20 × 10^4 ؛ R = 8 × 10^-5 × 0,3 × 10^-3 ؛ S = (0,2 × 10^-6 × 0,3 × 10^9)/(6 × 10^-1) ؛ T = (20 × (10^3)^-2)/(5 × 10^5) ؛ U = (7 × 10^-2 × 4 × 10^-5)/(5 × (10^-3)^7) .',
          'answer': {k: sci(v)[0] for k, v in NOW43.items()}, 'answerSource': 'computed'})

# ── p. 44 : معارف 4–8 ───────────────────────────────────────────────────────────────────────────────
E.append({'id': 'know-4', 'kind': 'knowledge', 'number': 4, 'page': 44, 'section': 'معارف', 'title': 'الكتابة العلمية لعدد عشري', 'verified': False,
          'text': 'تعني الكتابة العلمية لعدد عشري كتابته على الشكل a × 10^n حيث a عدد عشري مكتوب برقم واحد غير معدوم قبل الفاصلة و n عدد صحيح نسبي. ملاحظة: تسمح الكتابة العلمية بقراءة وفهم الأعداد الكبيرة جدا والصغيرة جدا بسهولة. مثال: عبّر عن الأبعاد الموالية بالمتر: • المسافة بين الأرض والقمر 384 400Km • قطر فيروس: 149nm (1 نانومتر، 1nm = 10^-6 mm).',
          'answer': {'moon': sci(384_400 * 1000)[0] + ' m', 'virus': sci(149 * P(10, -9))[0] + ' m'}, 'answerSource': 'computed'})
MARS = q('227,9') * P(10, 6)
E.append({'id': 'know-5', 'kind': 'knowledge', 'number': 5, 'page': 44, 'section': 'معارف', 'title': 'حصر عدد عشري - رتبة قدر عدد', 'verified': False,
          'text': 'تسمح الكتابة العلمية لعدد عشري بحصره بين قوتين ذات أسين متتاليين. إذا كانت الكتابة العلمية لعدد عشري A هي: a × 10^n فإن 10^n ≤ A < 10^(n+1) ؛ رتبة قَدْر العدد A هي: a\' × 10^n حيث a\' هو مدور a إلى الوحدة. أمثلة: • المسافة بين المريخ والشمس هي: 227,9 × 10^6 Km ؛ الكتابة العلمية هي 2,279 × 10^8 Km ؛ رتبة قدر هي: 2 × 10^8 Km .',
          'answer': {'scientific': sci(MARS)[0], 'order': order(MARS), 'bracket': '10^8 ≤ A < 10^9'}, 'answerSource': 'computed'})
assert P(3, 4) == 81 and P(5, -2) == F(1, 25) == q('0,04') and P(-7, 1) == -7 and P(-7, 0) == 1
E.append({'id': 'know-6', 'kind': 'knowledge', 'number': 6, 'page': 44, 'section': 'معارف', 'title': 'قوة عدد نسبي', 'verified': True,
          'text': 'a عدد صحيح غير معدوم و n عدد طبيعي. تدل الكتابة a^n على جداء n عاملا كلها مساوية للعدد a . a^n = a × a × …… × a (n عاملا). يُقرأ a^n : « a أس n ». تدل الكتابة a^-n على مقلوب a^n . ملاحظة هامة: a^-n = 1/a^n .',
          'examples': ['3^4 = 3 × 3 × 3 × 3 (4 عوامل)', '3^4 = 81', 'ملاحظة: a^1 = a ؛ a^0 = 1', '5^-2 = 1/5^2 = 1/25 = 0,04'],
          'answer': {'3^4': int(P(3, 4)), '5^-2': frac(P(5, -2)), '5^-2decimal': fr(P(5, -2))}, 'answerSource': 'computed',
          'note': 'Le manuel écrit « a عدد صحيح غير معدوم » sous le titre « قوة عدد نسبي » (et des a fractionnaires en ex-40) : la leçon pose a relatif non nul — voir discrepancies.'})
KNOW7 = [('8^2 × 8^5', P(8, 2) * P(8, 5), '8^7'), ('3^6 / 3^2', P(3, 6) / P(3, 2), '3^4'), ('7^-3 / 7', P(7, -3) / 7, '7^-4'),
         ('(2^3)^5', P(2, 3) ** 5, '2^15'), ('(7 × 4)^2', F(7 * 4) ** 2, '7^2 × 4^2 = 784'), ('(3/4)^2', F(3, 4) ** 2, '3^2/4^2 = 9/16')]
assert KNOW7[0][1] == P(8, 7) and KNOW7[1][1] == 81 and KNOW7[2][1] == P(7, -4) and KNOW7[3][1] == P(2, 15)
assert KNOW7[4][1] == P(7, 2) * P(4, 2) == 784 and KNOW7[5][1] == P(3, 2) / P(4, 2) == F(9, 16)
E.append({'id': 'know-7', 'kind': 'knowledge', 'number': 7, 'page': 44, 'section': 'معارف', 'title': 'قواعد الحساب على قوى عدد نسبي', 'verified': True,
          'text': 'a و b عددان غير معدومين ؛ n و m عددان صحيحان نسبيان. a^m × a^n = a^(m+n) ؛ a^m / a^n = a^(m−n) ؛ (a^m)^n = a^(m.n) ؛ (ab)^n = a^n × b^n ؛ (a/b)^n = a^n / b^n .',
          'examples': {'instruction': 'بسّط العبارات الموالية:', 'items': [e for e, _, _ in KNOW7]},
          'answer': {e: a for e, _, a in KNOW7}, 'answerSource': 'computed',
          'note': 'Le manuel donne les exemples SANS solution ; les réponses sont calculées ici.'})
K8 = [('1/2 × (2^3)^2', F(1, 2) * P(2, 3) ** 2, 32), ('5 × (2^3)', 5 * P(2, 3), 40), ('3 × 10^3 + 9 × 10^2 + 8 × 10 + 5', 3 * P(10, 3) + 9 * P(10, 2) + 80 + 5, 3985)]
for _, v, r in K8:
    assert v == r
E.append({'id': 'know-8', 'kind': 'knowledge', 'number': 8, 'page': 44, 'section': 'معارف', 'title': 'إجراء حساب يتضمن قوى', 'verified': True,
          'text': 'عند إجراء سلسلة حسابات تتضمن قوى تعطى الأولوية لحساب القوى.',
          'examples': ['أ) 1/2 × (2^3)^2 = 8^2/2 = 64/2 = 32', 'ب) 5 × (2^3) = 5 × 8 = 40', 'جـ) 3 × 10^3 + 9 × 10^2 + 8 × 10 + 5 = 3 985'],
          'answer': {e: r for e, _, r in K8}, 'answerSource': 'computed'})

# ── p. 45 : طرائق + دوري الآن ───────────────────────────────────────────────────────────────────────
assert sci(352000)[0] == '3,52 × 10^5' and sci(q('0,043'))[0] == '4,3 × 10^-2'
E.append({'id': 'method-45a', 'kind': 'method', 'page': 45, 'section': 'طرائق', 'title': 'الكتابة العلمية', 'verified': False,
          'text': 'تمرين: أعط الكتابة العلمية لكل من: A = 352 000 ؛ B = 0,043 . حلّ: الكتابة العلمية للعدد A هي: A = 3,52 × 10^5 . طريقة: • في أي عدد نضرب 3,52 حتى نتحصل على 352 000 ؟ • وكأنه أزحنا الفاصلة نحو اليسار بـ 5 رتب إذن نضرب في 10^5 ويكون 352 000 = 3,52 × 10^5 . • الكتابة العلمية للعدد B هي B = 4,3 × 10^-2 . طريقة: • في أي عدد نضرب 04,3 حتى نحصل على 0,043 ؟ • وكأنه أزحنا الفاصلة نحو اليمين برتبتين إذن نضرب في 10^-2 ويكون 0,043 = 4,3 × 10^-2 .',
          'answer': {'A': sci(352000)[0], 'B': sci(q('0,043'))[0]}, 'answerSource': 'computed',
          'note': '« 04,3 » imprimé tel quel (lire 4,3).'})
A45, B45 = F(526_000_000), q('0,00027')
assert order(A45) == '5 × 10^8' and order(B45) == '3 × 10^-4'
E.append({'id': 'method-45b', 'kind': 'method', 'page': 45, 'section': 'طرائق', 'title': 'رتبة قدر عدد عشري', 'verified': False,
          'text': 'تمرين: إليك العددين A و B حيث A = 526 000 000 ؛ B = 0,00027 . 1) اكتب كُلًا من A و B كتابة علمية. 2) أعط حصرا لكل من A و B بين قوتين متتاليتين للعدد 10. 3) أعط رتبة قدر لكل من A و B. حلّ: A = 5,26 × 10^8 ؛ B = 2,7 × 10^-4 ؛ 10^8 ≤ A < 10^9 ؛ 10^-4 ≤ B < 10^-3 . • رتبة قدر A هي 5 × 10^8 . • رتبة قدر B هي 3 × 10^-4 . طريقة 1: عندما تكون الكتابة العلمية لعدد A هي a × 10^n فيكون حصر A كالتالي: 10^n ≤ A < 10^(n+1) . طريقة 2: رتبة قدر عدد مكتوب على شكله العلمي a × 10^n هو a\' × 10^n حيث a\' هو مدوّر a إلى الوحدة.',
          'answer': {'A': sci(A45)[0], 'B': sci(B45)[0], 'orderA': order(A45), 'orderB': order(B45)}, 'answerSource': 'computed'})
M45C = P(2, 5) * P(3, 8) / (P(3, 5) * P(2, 3))
assert M45C == P(2, 2) * P(3, 3) == 108
E.append({'id': 'method-45c', 'kind': 'method', 'page': 45, 'section': 'طرائق', 'title': 'قواعد الحساب على قوى عدد نسبي', 'verified': True,
          'text': 'تمرين: بسّط العبارة: A = (2^5 × 3^8)/(3^5 × 2^3) . حلّ: A = 2^5/2^3 × 3^8/3^5 = 2^(5−3) × 3^(8−5) = 2^2 × 3^3 إذن A = 4 × 27 = 108 .',
          'answer': {'A': '2^2 × 3^3', 'value': int(M45C)}, 'answerSource': 'computed'})
EARTH_SUN, CARBON = q('149,59789') * P(10, 6), 199 * P(10, -28)
NOW45_2 = F(5 ** 2 - 3 * 7) ** 2 / (10 - 2 ** 3)
assert NOW45_2 == 8 and order(EARTH_SUN) == '1 × 10^8' and order(CARBON) == '2 × 10^-26'
E.append({'id': 'now-45', 'kind': 'practice', 'page': 45, 'section': 'دوري الآن', 'verified': True,
          'text': '① أعط الكتابة العلمية ثم رتبة قدر لكل من: المسافة أرض - شمس: 149,59789 × 10^6 Km ؛ كتلة الكربون: 199 × 10^-28 Kg . ② بسّط ما يلي: (5^2 − 3 × 7)^2/(10 − 2^3) .',
          'answer': {'1': {'earthSun': sci(EARTH_SUN)[0] + ' Km', 'earthSunOrder': order(EARTH_SUN) + ' Km',
                           'carbon': sci(CARBON)[0] + ' Kg', 'carbonOrder': order(CARBON) + ' Kg'},
                     '2': {'steps': '(25 − 21)^2/(10 − 8) = 4^2/2 = 16/2', 'value': int(NOW45_2)}},
          'answerSource': 'computed'})

# ── pp. 46–48 : أوظّف تعلّماتي ─────────────────────────────────────────────────────────────────────


def exercise(n, page, group, text, verified=None, **extra):
    if verified is None:
        verified = n <= 13   # ex-1 … ex-13 relus le 2026-10-26 (quwa-adad-ashara) ; les autres : voir l'appel
    E.append({'id': f'ex-{n}', 'kind': 'exercise', 'number': n, 'page': page, 'section': 'أوظّف تعلّماتي', 'group': group, 'verified': verified, 'text': text, **extra})


G1, G2, G3, G4, G5 = 'قوى 10', 'عمليات على قوى 10', 'الكتابة العلمية لعدد عشري', 'رتبة قدر والحصر', 'قوة عدد نسبي'
exercise(1, 46, G1, 'اكتب الأعداد التالية كتابة عشرية: 10^2 ؛ 10^5 ؛ 10^7 ؛ 10^10 .', answer=[10 ** k for k in (2, 5, 7, 10)], answerSource='computed')
exercise(2, 46, G1, 'عبّر لغويا عن الأعداد التالية: 10^1 ؛ 10^2 ؛ 10^3 ؛ 10^6 ؛ 10^9 .', answer=['عشرة', 'مئة', 'ألف', 'مليون', 'مليار'])
exercise(3, 46, G1, 'اكتب الأعداد التالية كتابة عشرية: 10^-5 ؛ 10^-7 ؛ 10^-9 .', answer=[fr(P(10, k)) for k in (-5, -7, -9)], answerSource='computed')
exercise(4, 46, G1, 'عبّر لغويا عن الأعداد التالية: 10^-1 ؛ 10^-2 ؛ 10^-3 ؛ 10^-6 ؛ 10^-9 .', answer=['جزء من عشرة', 'جزء من مئة', 'جزء من ألف', 'جزء من مليون', 'جزء من مليار'])
exercise(5, 46, G1, 'اكتب الأعداد التالية على شكل قوة 10 ثم كتابة عشرية: 1/10^2 ؛ 1/10^3 ؛ 1/10^5 ؛ 1/10^-4 ؛ 1/10^-6 ؛ 1/10^-9 .',
         reading='relu à 500 dpi : les trois derniers dénominateurs portent un exposant NÉGATIF (10^-4, 10^-6, 10^-9) ; 1/10^2 (exposant pâle) lu 2',
         answer={f'1/10^{k}': [f'10^{-k}', fr(P(10, -k))] for k in (2, 3, 5, -4, -6, -9)}, answerSource='computed')
EX6 = ['10000', '100000', '100000000', '1000000000', '0,01', '0,0001', '0,0000001', '0,000000001']
exercise(6, 46, G1, 'اكتب على شكل قوة 10: 10 000 ؛ 100 000 ؛ 100 000 000 ؛ 1 000 000 000 ؛ 0,01 ؛ 0,0001 ؛ 0,0000001 ؛ 0,000000001 ؛ 1/10^3 ؛ 1/10^+5 ؛ 1/10^9 ؛ 1/10^-4 ؛ 1/10^-6 ؛ 1/10^-7 .',
         reading='relu à 500 dpi : dernière ligne (de droite à gauche) 1/10^3 ؛ 1/10^+5 (signe + imprimé) ؛ 1/10^9 ؛ 1/10^-4 ؛ 1/10^-6 (exposant pâle, 6 plutôt que 0/8) ؛ 1/10^-7. 1 000 000 000 est imprimé avec un zéro épais',
         answer={**{s: f'10^{sci(q(s))[1]}' for s in EX6}, **{f'1/10^{k}': f'10^{-k}' for k in (3, 5, 9, -4, -6, -7)}}, answerSource='computed')
exercise(7, 46, G1, 'اكتب الأعداد التالية على شكل قوة للعدد 10: مئة ؛ ألف ؛ مليون ؛ مئة ألف ؛ مئة مليون ؛ مئة مليار.', answer=['10^2', '10^3', '10^6', '10^5', '10^8', '10^11'])
EX8 = {'أ': P(10, 3) * P(10, 2), 'ب': F(6_000_000), 'جـ': P(10, 2) ** 3, 'د': P(10, 6)}
exercise(8, 46, G1, 'اختر الإجابات الصحيحة: 10^6 يساوي: أ) 10^3 × 10^2 ؛ ب) 6 000 000 ؛ جـ) (10^2)^3 ؛ د) 10×10×10×10×10×10 .',
         answer=[k for k, v in EX8.items() if v == P(10, 6)], answerSource='computed')
exercise(9, 46, G1, 'انقل الكتابات التي تدل على نفس العدد، وعبّر عنها لغويا: 0,001 ؛ 0,000001 ؛ 10 000 000 ؛ 10^-8 ؛ 10^-3 ؛ 0,0001 ؛ 10^-4 ؛ 10^9 ؛ 10^7 ؛ 10^-9 ؛ 1/10^3 ؛ 1 000 000 001 ؛ 0,000000001 .',
         answer={'0,001': ['10^-3', '1/10^3'], '10 000 000': ['10^7'], '0,0001': ['10^-4'], '0,000000001': ['10^-9']}, answerSource='computed')
exercise(10, 46, G1, 'انقل وأتمم بالوحدة المناسبة: 1hm = 10^5 …. ؛ 1kg = 10^3 …. ؛ 1mL = 10^-2 …. ؛ 1m² = 10^4 …. ؛ 1dam = 10^3 …. ؛ 1cm³ = 10^-9 …. .',
         answer={'1hm': 'cm', '1kg': 'g', '1mL': 'dL', '1m²': 'cm²', '1dam': 'cm', '1cm³': 'dam³'},
         reading='relu à 500 dpi : 1mL = 10^-2 …. (dL, pas L) et 1cm³ = 10^-9 …. (dam³, pas m³) ; les quatre autres : 10^5, 10^3, 10^4, 10^3')
assert 10 ** 5 == 1 * 10 ** 3 * 10 ** 2 and F(1, 10 ** 2) * 100 == 1 and F(1, 10 ** 9) * 10 ** 9 == 1
exercise(11, 46, G1, 'املأ الفراغ بقوة للعدد 10: 1hm = …..m ؛ 1km = …..cm ؛ 1g = …..mg ؛ 1dag = …..dg ؛ 10^4 mm = …..m ؛ 10^2 cm = …..m ؛ 10^5 g = …..kg ؛ 10^1 kg = …..mg .',
         answer=['10^2', '10^5', '10^3', '10^2', '10^1', '10^0', '10^2', '10^7'], answerSource='computed')
exercise(12, 46, G1, 'في ميدان الإعلام الآلي الأكتي (octet) هو وحدة كمية المعلومات التي تخزّن ؛ مضاعفات هذه الوحدة هي: • كيلو أكتي 1Ko = 1000 octets • ميغا أكتي 1Mo = 1000Ko • جيغا أكتي 1Go = 1000Mo • تيرا أكتي 1To = 1000Go (Ko : Kilooctet - Mo : Mégaoctet - Go : Gigaoctet - To : Téraoctet). اكتب هذه الوحدات بدلالة الأكتي (octet) مستعملا قوى العدد 10.',
         answer={'Ko': '10^3', 'Mo': '10^6', 'Go': '10^9', 'To': '10^12'}, answerSource='computed')
exercise(13, 46, G1, 'اكتب على شكل قوة العدد 10: 1) ألف مليار لألف كتاب. 2) مئة ألف مليار قصة. 3) جزء من المئة لجزء من المليون.',
         answer={'1': {'ألف مليار': '10^3 × 10^9 = 10^12', 'ألف': '10^3', 'ratioReading': '10^12 / 10^3 = 10^9'},
                 '2': '10^2 × 10^3 × 10^9 = 10^14',
                 '3': {'جزء من المئة': '10^-2', 'جزء من المليون': '10^-6', 'ratioReading': '10^-2 / 10^-6 = 10^4', 'productReading': '10^-2 × 10^-6 = 10^-8'}},
         reading='relu à 500 dpi, énoncé exact : « 1) ألف مليار لألف كتاب. 2) مئة ألف مليار قصة. 3) جزء من المئة لجزء من المليون. » La préposition « ل » de 1) et 3) est ambiguë (rapport « pour » ou composition) : la leçon qui s’en sert doit fixer le sens ; la lecture « rapport » (÷) donne 10^9 et 10^4, la lecture « produit » 10^15 et 10^-8',
         note='Reçoit les règles 10^m × 10^n et 10^m / 10^n : destiné à qawaid-quwa-ashara ; sa banque l’adapte.')
exercise(14, 46, G2, 'عبّر ذهنيا بدلالة قوة على الشكل 10^n : 10^4 × 10^7 ؛ 10^9/10^3 ؛ 10^4/10^-5 ؛ (10^3)^2 ؛ (10^-4)^3 ؛ (10^5)^-3 ؛ 10^5 × 10^4 ؛ 10^-6 × 10^-3 ؛ (10^4 × 10^6)/10^5 ؛ (10^-6 × 10^3)/10^-7 ؛ 10^5(10^3)^2 .',
         reading='un terme coupé à gauche (« (10^-4)^… »)',
         answer=['10^11', '10^6', '10^9', '10^6', '10^-12', '10^-15', '10^9', '10^-9', '10^5', '10^4', '10^11'], answerSource='computed')
A15 = P(10, 2) * P(10, -5) * P(10, -3) ** 4 / (P(10, -2) ** 3 * P(10, 3) * P(10, 5))
B15 = P(10, -4) ** 2 * P(10, 3) ** -2 * P(10, 2) ** 3 / (P(10, 3) ** 4 * P(10, -4) * P(10, 2) ** -4)
exercise(15, 46, G2, 'احسب وأعط النتيجة على شكل 10^n : A = (10^2 × 10^-5 × (10^-3)^4)/((10^-2)^3 × 10^3 × 10^5) ؛ B = ((10^-4)^2 × (10^3)^-2 × (10^2)^3)/((10^3)^4 × (10^-4) × (10^2)^-4) . 3) اكتب على الشكل 10^n : 100 × 10^3 ؛ 1000 000 × 10^-8 ؛ 10^-8/10 000 ؛ 0,001 × 10^-2 ؛ 1000/10^12 ؛ 0,0001/10^9 ؛ 1/0,001 .',
         answer={'A': f'10^{sci(A15)[1]}', 'B': f'10^{sci(B15)[1]}', '3': ['10^5', '10^-2', '10^-12', '10^-5', '10^-9', '10^-13', '10^3']}, answerSource='computed')
exercise(16, 46, G2, 'أعط كتابة عشرية: 10^-13 × (10^15 + 10^-13) ؛ 10^-17 × (10^19 − 10^18) .',
         reading='premier facteur lu 10^-13 ou 10^15 (scan)', answer={'2': int(P(10, -17) * (P(10, 19) - P(10, 18)))}, answerSource='computed')
EX17 = {'A': P(10, 2) / P(10, 8), 'B': P(10, -2) * P(10, -4), 'C': P(10, 3) * P(10, -9), 'D': 1 / P(10, 6), 'E': q('0,01') * P(10, -4),
        'F': P(10, -8) / 100, 'G': q('0,001') / P(10, 3), 'H': P(10, -9) * 1000, 'I': P(10, -12) * (P(10, 12) + P(10, 6))}
exercise(17, 46, G2, 'من بين العبارات التالية، جد التي تساوي 10^-6 : A = 10^2/10^8 ؛ B = 10^-2 × 10^-4 ؛ C = 10^3 × 10^-9 ؛ D = 1/10^6 ؛ E = 0,01 × 10^-4 ؛ F = 10^-8/100 ؛ G = 0,001/10^3 ؛ H = 10^-9 × 1000 ؛ I = 10^-12 × (10^12 + 10^6) .',
         answer=[k for k, v in EX17.items() if v == P(10, -6)], answerSource='computed')
exercise(18, 47, G2, 'هذه شاشة آلة حاسبة: 10^-3 × (10^-4 × 10^9)/10^5 (تظهر النتيجة 10^-3). ما هي النتيجة التي نتحصل عليها إذا استبدلنا في العبارة على الشاشة 10^-3 بـ a ؛ a عدد كيفي؟',
         answer='a × 10^0 = a', answerSource='computed')
exercise(19, 47, G2, 'تحقق من أن كل جدول من الجدولين المواليين هو مربع سحري ضربيا؛ بمعنى أنّ نتيجة جداء العوامل في كل سطر وفي كل عمود وفي كل قطر متساوية. الجدول (1): 10^8 ، 10 ، 10^6 / 10^3 ، 10^5 ، 10^7 / 10^4 ، 10^9 ، 10^2 . الجدول (2): 100 ، 10^3 ، 10^-2 / 10^-3 ، 10 ، 10^5 / 10^4 ، 0,1 ، 1 .', reading='exposants des tableaux lus à 110 dpi')
exercise(20, 47, G2, 'صحيح أم خطأ: • الجزء من المليار هو 10^-9 . • نصف 10^2018 هو 10^1009 . • 10^2 + 10^3 يساوي 10^5 . • 1000 × 10^-5 = 10^-2 . • 58,475 × 10^8 = 5847,5 × 10^-6 .',
         answer=[True, P(10, 2018) / 2 == P(10, 1009), P(10, 2) + P(10, 3) == P(10, 5), 1000 * P(10, -5) == P(10, -2), q('58,475') * P(10, 8) == q('5847,5') * P(10, -6)], answerSource='computed')
exercise(21, 47, G3, 'انقل وأتمم: 9372 = …. × 10^3 ؛ 0,1375 = …. × 10^-2 ؛ 2376,7 = 23,767 × 10^… ؛ 0,865 = 0,000865 × 10^… .',
         answer=['9,372', '13,75', '10^2', '10^3'], answerSource='computed')
EX22 = ['15 × 10^4', '3,236 × 10^-3', '0,845 × 10^3', '8,879 × 10^-2', '9 × 10^10', '1,85 × 10^6']
exercise(22, 47, G3, 'اذكر في كل حالة إذا كانت الكتابة كتابة علمية: 15 × 10^4 ؛ 3,236 × 10^-3 ؛ 0,845 × 10^3 ؛ 8,879 × 10^-2 ؛ 9 × 10^10 ؛ 1,85 × 10^6 .',
         answer={s: 1 <= q(s.split(' × ')[0]) < 10 for s in EX22}, answerSource='computed')
exercise(23, 47, G3, 'من بين هذه الأعداد، اذكر المتساوية منها: 0,0145 ؛ 14,5 × 10^-5 ؛ 0,000145 × 10^-4 ؛ 13 500 × 10^-8 ؛ 135 × 10^-7 ؛ 1450 000 × 10^-8 ؛ 1,35 × 10^5 .', reading='exposants à relire')
exercise(24, 47, G3, 'اكتب كل عدد على الشكل a × 10^6 : 267,3 ؛ 9 738 459 ؛ 0,025 × 10^8 ؛ 79,58 × 10^3 − 59,8 × 10^4 ؛ 74 368 × 10^-2 .')
exercise(25, 47, G3, 'اكتب على الشكل 68 × 10^n : 68 000 ؛ 6 800 × 10^9 ؛ 0,068 × 10^-4 .', answer=['68 × 10^3', '68 × 10^11', '68 × 10^-7'], answerSource='computed')
EX26 = ['397000', '0,036', '985754', '0,98', '843200000', '0,0000253']
exercise(26, 47, G3, 'أعط كتابة علمية لكل من الأعداد: 397 000 ؛ 0,036 ؛ 985 754 ؛ 0,98 ؛ 843 200 000 ؛ 0,0000253 .', answer={s: sci(q(s))[0] for s in EX26}, answerSource='computed')
exercise(27, 47, G3, 'صحيح أم خطأ: 16 × 10^3 > 14 × 10^4 ؛ 3,8 × 10^5 > 5,7 × 10^4 ؛ 21 × 10^8 > 1,8 × 10^9 ؛ 4,3 × 10^5 > 0,78 × 10^7 .',
         answer=[16 * P(10, 3) > 14 * P(10, 4), q('3,8') * P(10, 5) > q('5,7') * P(10, 4), 21 * P(10, 8) > q('1,8') * P(10, 9), q('4,3') * P(10, 5) > q('0,78') * P(10, 7)], answerSource='computed')
exercise(28, 47, G3, 'صحيح أم خطأ: 6 × 10^-3 > 5 × 10^-4 ؛ 9,8 × 10^-5 > 5,7 × 10^-4 .',
         answer=[6 * P(10, -3) > 5 * P(10, -4), q('9,8') * P(10, -5) > q('5,7') * P(10, -4)], answerSource='computed')
EX29 = {'1 × 10^4': P(10, 4), '78,96 × 10^3': q('78,96') * P(10, 3), '120,04 × 10^2': q('120,04') * P(10, 2), '8354': F(8354), '123 897 × 10^-1': F(123897, 10), '0,09999 × 10^5': q('0,09999') * P(10, 5)}
exercise(29, 47, G3, 'رتّب الأعداد التالية ترتيبا تصاعديا بعد كتابتها كتابة علمية: 120,04 × 10^2 ؛ 1 × 10^4 ؛ 78,96 × 10^3 ؛ 8354 ؛ 123 897 × 10^-1 ؛ 0,09999 × 10^5 .',
         answer=sorted(EX29, key=EX29.get), answerSource='computed')
exercise(30, 47, G3, 'احسب واكتب النتيجة كتابة علمية: A = 85,7 × 10^9 + 45 × 10^11 ؛ B = (0,6 × (10^3)^2 × 6 × 10^-4)/(9 × 10^5) .',
         answer={'A': sci(q('85,7') * P(10, 9) + 45 * P(10, 11))[0], 'B': sci(q('0,6') * P(10, 6) * 6 * P(10, -4) / (9 * P(10, 5)))[0]}, answerSource='computed')
exercise(31, 47, G3, 'احسب واكتب النتيجة كتابة علمية: A = 2 400 × 8 000 ؛ B = 0,00009 × 0,003 ؛ C = 7 000 × 0,0015 ؛ D = 36 000 000/0,00018 .',
         answer={'A': sci(2400 * 8000)[0], 'B': sci(q('0,00009') * q('0,003'))[0], 'C': sci(7000 * q('0,0015'))[0], 'D': sci(36_000_000 / q('0,00018'))[0]}, answerSource='computed')
EX32 = {'المريخ': q('0,21') * P(10, 9), 'عطارد': F(46_000_000), 'زحل': 1350 * P(10, 6), 'الأرض': q('14,7') * P(10, 7), 'الزهرة': 1075 * P(10, 5)}
exercise(32, 47, G4, 'إليك المسافات الدنيا بالكيلومتر بين الشمس والكواكب التالية: المريخ (Mars) 0,21 × 10^9 Km ؛ عطارد (Mercure) 46 000 000Km ؛ زحل (Saturne) 1350 × 10^6 Km ؛ الأرض (Terre) 14,7 × 10^7 Km ؛ الزهرة (Venus) 1075 × 10^5 Km . اكتب كل مسافة كتابة علمية واحصرها بين قوتين متتاليتين للعدد 10، ثم أعط رتبة قدر لكل منها.',
         reading='exposants du tableau lus à 110 dpi', answer={k: {'sci': sci(v)[0], 'order': order(v)} for k, v in EX32.items()}, answerSource='computed')
A33, B33 = q('0,0039') * P(10, -7), 23678 * P(10, 15)
exercise(33, 48, G4, 'إليك العددين: A = 0,0039 × 10^-7 ؛ B = 23 678 × 10^15 . أعط رتبة قدر كل من A × B ، A/B .',
         answer={'AxB': order(A33 * B33), 'A/B': order(A33 / B33)}, answerSource='computed')

# — قوة عدد نسبي (leçon quwat-adad-nisbi) : relu à 400–800 dpi —
EX34 = [('-3^-2', -P(3, -2)), ('(-3)^3', P(-3, 3)), ('3^-3', P(3, -3)), ('(2/3)^3', F(2, 3) ** 3), ('-2^4', -P(2, 4)), ('(-2)^1', P(-2, 1)), ('2^4', P(2, 4))]
assert [v for _, v in EX34] == [F(-1, 9), -27, F(1, 27), F(8, 27), -16, -2, 16]
exercise(34, 48, G5, 'احسب ذهنيا: -3^-2 ؛ (-3)^3 ؛ 3^-3 ؛ (2/3)^3 ؛ -2^4 ؛ (-2)^1 ؛ 2^4 .', verified=True,
         items=[{'expr': e, 'answer': frac(v)} for e, v in EX34], answerSource='computed',
         reading='« (-2)^1 » imprimé (exposant 1 net à 800 dpi ; (-2)^4 = 16 était sans doute voulu, en face de -2^4) ; dernier exposant pâle, lu 2^4')
EX35 = [('(0,4)^2 - 25^2', q('0,4') ** 2 - P(25, 2)), ('8^2 × 1,25^2', P(8, 2) * q('1,25') ** 2), ('(0,25)^2 × 4^2', q('0,25') ** 2 * P(4, 2)),
        ('5^3 × 2^3', P(5, 3) * P(2, 3)), ('25^3 × 0,04^3', P(25, 3) * q('0,04') ** 3), ('(0,05)^4 × 20^4', q('0,05') ** 4 * P(20, 4))]
assert [v for _, v in EX35][1:] == [100, 1, 1000, 1, 1] and EX35[0][1] == q('-624,84') and (q('0,4') * 25) ** 2 == 100
exercise(35, 48, G5, 'احسب ذهنيا: (0,4)^2 - 25^2 ؛ 8^2 × 1,25^2 ؛ (0,25)^2 × 4^2 ؛ 5^3 × 2^3 ؛ 25^3 × 0,04^3 ؛ (0,05)^4 × 20^4 .', verified=True,
         items=[{'expr': e, 'answer': fr(v), 'rule': '(ab)^n = a^n × b^n' if '×' in e else None} for e, v in EX35],
         intended={'(0,4)^2 × 25^2': 100}, answerSource='computed',
         reading='le premier calcul imprime « − » (net à 800 dpi) ; la série est celle de a^n × b^n = (ab)^n : « × » est sans doute voulu (= 100) — voir discrepancies')
EX36 = [('3^4 × 3^… = 3^-2', -6, P(3, 4) * P(3, -6) == P(3, -2)), ('7^3 × 7^… = 7^7', 4, P(7, 3) * P(7, 4) == P(7, 7)),
        ('6^3 = 2^3 × …^3', 3, P(6, 3) == P(2, 3) * P(3, 3)), ('56^2 = 7^2 × …^2', 8, P(56, 2) == P(7, 2) * P(8, 2))]
assert all(ok for _, _, ok in EX36)
exercise(36, 48, G5, 'انقل واملأ الفراغ في كل حالة: 3^4 × 3^… = 3^-2 ؛ 7^3 × 7^… = 7^7 ؛ 6^3 = 2^3 × ….^3 ؛ 56^2 = 7^2 × ….^2 .', verified=True,
         items=[{'expr': e, 'answer': a} for e, a, _ in EX36], answerSource='computed')
EX37 = [('3^-2 / 3^… = 3^6', -8, P(3, -2) / P(3, -8) == P(3, 6)), ('9^10 / 9^… = 9^7', 3, P(9, 10) / P(9, 3) == P(9, 7)),
        ('1,5^10 = 3^10 × ….^10', '0,5', q('1,5') ** 10 == P(3, 10) * q('0,5') ** 10), ('4,5^2 = 0,9^2 × ….^2', 5, q('4,5') ** 2 == q('0,9') ** 2 * P(5, 2))]
assert all(ok for _, _, ok in EX37)
exercise(37, 48, G5, 'انقل واملأ الفراغ في كل حالة: 3^-2 / 3^… = 3^6 ؛ 9^10 / 9^… = 9^7 ؛ 1,5^10 = 3^10 × ….^10 ؛ 4,5^2 = 0,9^2 × ….^2 .', verified=True,
         items=[{'expr': e, 'answer': a} for e, a, _ in EX37], answerSource='computed')
EX38 = [(2, None, 32), (None, -1, q('0,5')), (None, 5, -32), (9, None, 1), (None, 4, 1296), (-4, None, -1024)]
SOL38 = [{'n': 5}, {'a': 2}, {'a': -2}, {'n': 0}, {'a': [6, -6]}, {'n': 5}]
assert P(2, 5) == 32 and P(2, -1) == q('0,5') and P(-2, 5) == -32 and P(9, 0) == 1 and P(6, 4) == P(-6, 4) == 1296 and P(-4, 5) == -1024
exercise(38, 48, G5, 'انقل الجدول واملأ الفراغات (يمكنك استعمال الآلة الحاسبة): a : 2 ، … ، … ، 9 ، … ، -4 ؛ n : … ، -1 ، 5 ، … ، 4 ، … ؛ a^n : 32 ، 0,5 ، -32 ، 1 ، 1296 ، -1024 .', verified=True,
         columns=[{'a': a, 'n': n, 'a^n': fr(v)} for a, n, v in EX38], answer=SOL38, answerSource='computed',
         note='Colonne 5 : 1296 = 6^4 = (−6)^4 — deux réponses.')
EX39 = [('3^2 + 4^2 = ….^2', 5, P(3, 2) + P(4, 2) == P(5, 2)), ('….^2 + 15^2 = 17^2', 8, P(8, 2) + P(15, 2) == P(17, 2)),
        ('….^3 + 6^3 + 8^3 = 9^3', 1, P(1, 3) + P(6, 3) + P(8, 3) == P(9, 3)), ('4^4 + 6^4 + 8^4 + 9^4 + 14^4 = 15^…', 4, sum(P(k, 4) for k in (4, 6, 8, 9, 14)) == P(15, 4))]
assert all(ok for _, _, ok in EX39)
exercise(39, 48, G5, 'اكتب العدد الناقص في كل حالة: أ) 3^2 + 4^2 = ….^2 ؛ ب) ….^2 + 15^2 = 17^2 ؛ جـ) ….^3 + 6^3 + 8^3 = 9^3 ؛ د) 4^4 + 6^4 + 8^4 + 9^4 + 14^4 = 15^… .', verified=True,
         items=[{'expr': e, 'answer': a} for e, a, _ in EX39], answerSource='computed')
EX40 = [('(3/10)^2', F(3, 10) ** 2), ('(4/5)^3', F(4, 5) ** 3), ('(5/3)^2', F(5, 3) ** 2), ('(-2/5)^3', F(-2, 5) ** 3),
        ('(-2/3)^4', F(-2, 3) ** 4), ('(3/4)^-1', F(3, 4) ** -1), ('(1/5)^-1', F(1, 5) ** -1), ('(7/5)^-1', F(7, 5) ** -1),
        ('(10/47)^-1', F(10, 47) ** -1), ('(-2/3)^-1', F(-2, 3) ** -1), ('(-1/4)^-1', F(-1, 4) ** -1), ('(-7/5)^-1', F(-7, 5) ** -1),
        ('(-3/5)^2', F(-3, 5) ** 2), ('(-4/3)^-3', F(-4, 3) ** -3), ('(-1/2)^-4', F(-1, 2) ** -4)]
assert EX40[-1][1] == 16 and EX40[-2][1] == F(-27, 64) and EX40[3][1] == F(-8, 125)
exercise(40, 48, G5, 'احسب: (3/10)^2 ؛ (4/5)^3 ؛ (5/3)^2 ؛ (-2/5)^3 ؛ (-2/3)^4 ؛ (3/4)^-1 ؛ (1/5)^-1 ؛ (7/5)^-1 ؛ (10/47)^-1 ؛ (-2/3)^-1 ؛ (-1/4)^-1 ؛ (-7/5)^-1 ؛ (-3/5)^2 ؛ (-4/3)^-3 ؛ (-1/2)^-4 .', verified=True,
         items=[{'expr': e, 'answer': frac(v)} for e, v in EX40], answerSource='computed',
         reading='suite de l’exercice en haut de la colonne gauche p. 48 ; l’exposant de (-1/2) se lit « -4 » à 600 dpi (glyphe épais, « -1 » non exclu → -2)')
EX41 = [('أ', '6^4 × 36', P(6, 4) * 36, '6^6'), ('ب', '8 × 2^5', 8 * P(2, 5), '2^8'), ('جـ', '125/5^4', 125 / P(5, 4), '5^-1'),
        ('د', '25 × 0,2^2', 25 * q('0,2') ** 2, '(5 × 0,2)^2 = 1^2'), ('هـ', '16^3 × 2^4', P(16, 3) * P(2, 4), '2^16'), ('و', '9^4/3^3', P(9, 4) / P(3, 3), '3^5'),
        ('ز', '2^3 × 125', P(2, 3) * 125, '10^3'), ('حـ', '5^4 × 16', P(5, 4) * 16, '10^4'), ('ط', '81 × 5^2', 81 * P(5, 2), '45^2'), ('ي', '0,16 × 0,81', q('0,16') * q('0,81'), '0,36^2')]
TARGET41 = [P(6, 6), P(2, 8), P(5, -1), F(1), P(2, 16), P(3, 5), P(10, 3), P(10, 4), P(45, 2), q('0,36') ** 2]
assert [v for _, _, v, _ in EX41] == TARGET41
exercise(41, 48, G5, 'اكتب على شكل قوة واحدة: أ) 6^4 × 36 ؛ ب) 8 × 2^5 ؛ جـ) 125/5^4 ؛ د) 25 × 0,2^2 ؛ هـ) 16^3 × 2^4 ؛ و) 9^4/3^3 ؛ ز) 2^3 × 125 ؛ حـ) 5^4 × 16 ؛ ط) 81 × 5^2 ؛ ي) 0,16 × 0,81 .', verified=True,
         items=[{'label': l, 'expr': e, 'answer': a} for l, e, _, a in EX41], answerSource='computed',
         reading='exposants pâles de 5^4 (جـ), 2^4 (هـ) et 5^2 (ط) relus à 450 dpi')
assert P(36, 3) == P(6, 6) and P(27, 4) == P(3, 12)
exercise(42, 48, G5, 'بدون إجراء عمليات؛ اشرح لماذا: أ) 36^3 = 6^6 ؛ ب) 27^4 = 3^12 .', verified=True,
         answer={'أ': '36^3 = (6^2)^3 = 6^(2×3) = 6^6', 'ب': '27^4 = (3^3)^4 = 3^(3×4) = 3^12'}, answerSource='computed')
EX43 = [('أ', '(3^3 × 9)/(3 × 3^2)', P(3, 3) * 9 / (3 * P(3, 2)), '3^2'), ('ب', '(2^4 × 16)/2^6', P(2, 4) * 16 / P(2, 6), '2^2'),
        ('جـ', '(5 × 5^3)/125', 5 * P(5, 3) / 125, '5^1'), ('د', '8/2^4', 8 / P(2, 4), '2^-1')]
assert [v for _, _, v, _ in EX43] == [P(3, 2), P(2, 2), F(5), P(2, -1)]
exercise(43, 48, G5, 'اكتب على شكل قوة واحدة: أ) (3^3 × 9)/(3 × 3^2) ؛ ب) (2^4 × 16)/2^6 ؛ جـ) (5 × 5^3)/125 ؛ د) 8/2^4 .', verified=True,
         items=[{'label': l, 'expr': e, 'answer': a} for l, e, _, a in EX43], answerSource='computed',
         reading='exposant du numérateur de أ) coupé en haut du crop à 450 dpi, lu 3^3 à 220 dpi')
EX44 = [('أ', '(8 - 3 × 2)^2', F(8 - 3 * 2) ** 2), ('ب', '8 - 3 × 2^2', 8 - 3 * P(2, 2)), ('جـ', '(8 - 3) × 2^2', (8 - 3) * P(2, 2)), ('د', '8 - (3 × 2)^2', 8 - F(3 * 2) ** 2)]
assert [v for _, _, v in EX44] == [4, -4, 20, -28]
exercise(44, 48, G5, 'احسب ما يلي: أ) (8 - 3 × 2)^2 ؛ ب) 8 - 3 × 2^2 ؛ جـ) (8 - 3) × 2^2 ؛ د) 8 - (3 × 2)^2 .', verified=True,
         items=[{'label': l, 'expr': e, 'answer': int(v)} for l, e, v in EX44], answerSource='computed')
EX45 = [('a', '2 + 4 × 7^2', 2 + 4 * P(7, 2)), ('b', '(-3)^2 + 2 × 5^2', P(-3, 2) + 2 * P(5, 2)), ('c', '-3(-8 + 6)^2', -3 * F(-8 + 6) ** 2), ('d', '[3 - 2(-4)]^2 × 3', F(3 - 2 * (-4)) ** 2 * 3)]
assert [v for _, _, v in EX45] == [198, 59, -12, 363]
exercise(45, 48, G5, 'احسب ما يلي: a = 2 + 4 × 7^2 ؛ b = (-3)^2 + 2 × 5^2 ؛ c = -3(-8 + 6)^2 ؛ d = [3 - 2(-4)]^2 × 3 .', verified=True,
         items=[{'label': l, 'expr': e, 'answer': int(v)} for l, e, v in EX45], answerSource='computed')
EX46 = [('a', '(4 + 2)^2 ÷ 9', F(4 + 2) ** 2 / 9), ('b', '16 ÷ (9 - 7)^2', 16 / F(9 - 7) ** 2), ('c', '54/(5 × 9 - 6^2)', 54 / (5 * 9 - P(6, 2))), ('d', '(5^2 - 3 × 7)^2/(10 - 2^3)', F(5 ** 2 - 3 * 7) ** 2 / (10 - P(2, 3)))]
assert [v for _, _, v in EX46] == [4, 4, 6, 8]
exercise(46, 48, G5, 'احسب ما يلي: a = (4 + 2)^2 ÷ 9 ؛ b = 16 ÷ (9 - 7)^2 ؛ c = 54/(5 × 9 - 6^2) ؛ d = (5^2 - 3 × 7)^2/(10 - 2^3) .', verified=True,
         items=[{'label': l, 'expr': e, 'answer': int(v)} for l, e, v in EX46], answerSource='computed',
         note='d est exactement le دوري الآن ② p. 45 (now-45 item 2).')
assert P(15, 5) ** 2 == P(15, 10) and P(7, 5) ** 3 == P(7, 15) and P(12, 7) ** 3 == P(12, 21) and 12 * P(12, 7) == P(12, 8)
exercise(47, 48, G5, '1) ما هو طول ضلع مربع مساحته 15^10 cm² ؟ 2) ما هو طول حرف مكعب حجمه 7^15 cm³ ؟ 3) ما هو الطول الإجمالي لكل أحرف مكعب حجمه 12^21 cm³ ؟', verified=True,
         answer={'1': '15^5 cm', '2': '7^5 cm', '3': {'edge': '12^7 cm', 'total': '12 × 12^7 = 12^8 cm'}}, answerSource='computed')

# ── p. 49 : أؤكّد تعلّماتي ─────────────────────────────────────────────────────────────────────────


def self_item(n, pages, question, options, value, verified=False, **extra):
    """options = [(1), (2), (3)], (1) = colonne la plus à droite. value : Fraction (comparée), ou liste d'indices imposée."""
    if isinstance(value, list):
        correct = value
    else:
        correct = [i for i, o in enumerate(options) if OPT.get(o, None) == value]
    E.append({'id': f'self-{n}', 'kind': 'selfcheck', 'number': n, 'page': 49, 'section': 'أؤكّد تعلّماتي', 'reviewPages': pages,
              'verified': verified, 'question': question, 'options': options, 'correct': correct, 'answerSource': 'computed', **extra})


def ev(s):
    """Évalue une option écrite « a × 10^n », « a^n », « 1/2,5 », un décimal."""
    s = s.replace(' ', '')
    if '×10^' in s:
        a, n = s.split('×10^')
        return q(a) * P(10, int(n))
    if s.startswith('2×4^'):
        return 2 * P(4, int(s[4:]))
    if '^' in s:
        a, n = s.split('^')
        return P(int(a), int(n))
    return q(s)


S_OPTS = {
    1: ['10 000', '0,0001', '100 000'], 2: ['-40', '0,0001', '10 000'], 3: ['0,1', '-0,1', '0,01'], 4: ['10^6', '10^5', '100^6'],
    5: ['100', '1', '10 000'], 6: ['1 000 000', '100 000', '10 000'], 7: ['20^2', '100,001', '20^-2'], 8: ['99,9', '99,99', '0'],
    9: ['0,101', '10,1', '1,01'], 10: ['10^3', '10^-3', '0,010'], 11: ['3,6 × 10^8', '3,6 × 10^5', '36 × 10^6'],
    12: ['52 × 10^5', '5 200 × 10^3', '5,2 × 10^6'], 13: ['4,326 × 10^5', '4,326 × 10^9', '4,326 × 10^4'],
    14: ['1,2 × 10^-3', '1,2 × 10^-4', '1,2 × 10^-5'], 15: ['3,1 × 10^10', '3,1 × 10^11', '3,1 × 10^12'],
    16: ['1,9 × 10^-3', '1,9 × 10^-2', '-1,9 × 10^-2'], 17: ['0,00719', '0,0000719', '0,000719'], 18: ['0,025', '1/2,5', '2^-2'],
    19: ['9 × 10^14', '9 × 10^8', '9,1 × 10^8'], 20: ['0,0035', '534 × 10^-4', '0,786 × 10^-3'],
    21: ['B < C < A', 'A < C < B', 'A < B < C'], 22: ['-10', '-32', '32'], 23: ['3^10', '3^7', '45'], 24: ['100', '-50', '-100'],
    25: ['4^4', '2^4', '2 × 4^7'],
}
OPT = {}
for n_, opts in S_OPTS.items():
    if n_ == 21:
        continue
    for o in opts:
        OPT[o] = ev(o)
self_item(1, [42, 43], '10^5 = ……', S_OPTS[1], P(10, 5), verified=True)
self_item(2, [42, 43], '10^4 = ……', S_OPTS[2], P(10, 4), verified=True, reading='relu à 500 dpi : « 10 ⁴ », exposant 4 imprimé positif, précédé d’un blanc (celui de 10^-1 en dessous est collé) ; le signe « − » est peut-être tombé — voir discrepancies')
self_item(3, [42, 43], '10^-1 = ……', S_OPTS[3], P(10, -1), verified=True)
self_item(4, [42, 43], '10^3 × 10^2 = ……', S_OPTS[4], P(10, 5))
self_item(5, [42, 43], '10^3 × 10^-3 = ……', S_OPTS[5], F(1))
self_item(6, [42, 43], '(10^3)^2 = ……', S_OPTS[6], P(10, 6))
self_item(7, [42, 43], '10^2 + 10^-2 = ……', S_OPTS[7], P(10, 2) + P(10, -2), note='Aucune option juste : 10^2 + 10^-2 = 100,01 (imprimé 100,001) — voir discrepancies')
self_item(8, [42, 43], '10^2 - 10^-2 = ……', S_OPTS[8], P(10, 2) - P(10, -2))
self_item(9, [42, 43], '(10^-1 + 10^1)/10 = ……', S_OPTS[9], (P(10, -1) + 10) / 10)
self_item(10, [42, 43], '10^17 ÷ 10^20 = ……', S_OPTS[10], P(10, -3), note='0,010 = 10^-2 ≠ 10^-3')
self_item(11, [42, 43], '36 مليون تُكتب: ……', S_OPTS[11], F(36_000_000), verified=True, note='3,6 × 10^8 imprimé (3,6 × 10^7 serait juste) : seule 36 × 10^6 est juste')
self_item(12, [44, 45], 'الكتابة العلمية لـ 5 200 000 هي ……', S_OPTS[12], [2], check=sci(5_200_000)[0])
self_item(13, [44, 45], 'الكتابة العلمية لـ 432,6 × 10^7 هي ……', S_OPTS[13], q('432,6') * P(10, 7))
self_item(14, [44, 45], 'الكتابة العلمية لـ 0,012 × 10^-3 هي ……', S_OPTS[14], q('0,012') * P(10, -3))
self_item(15, [44, 45], 'الكتابة العلمية لـ 6,2 × 10^25 × 5 × 10^-14 هي ……', S_OPTS[15], q('6,2') * P(10, 25) * 5 * P(10, -14))
self_item(16, [44, 45], 'الكتابة العلمية لـ 23 × 10^-3 - 0,4 × 10^-2 هي ……', S_OPTS[16], 23 * P(10, -3) - q('0,4') * P(10, -2))
self_item(17, [44, 45], '7,19 × 10^-5 هي الكتابة العلمية لـ ……', S_OPTS[17], q('7,19') * P(10, -5))
self_item(18, [44, 45], '2,5 × 10^-1 هي الكتابة العلمية لـ ……', S_OPTS[18], q('2,5') * P(10, -1), note='0,25 = 2^-2 (option (3)) ; 1/2,5 = 0,4')
self_item(19, [44, 45], 'رتبة قَدْر 0,00912 × 10^11 هي ……', S_OPTS[19], [1], check=order(q('0,00912') * P(10, 11)))
assert order(q('0,00912') * P(10, 11)) == '9 × 10^8'
self_item(20, [44, 45], 'عدد محصور بين 10^-4 و 10^-3 هو ……', S_OPTS[20], [i for i, o in enumerate(S_OPTS[20]) if P(10, -4) < ev(o) < P(10, -3)])
A21, B21, C21 = q('0,56') * P(10, -4), 63 * P(10, -6), q('7,25') * P(10, -5)
assert A21 < B21 < C21
self_item(21, [44, 45], 'A = 0,56 × 10^-4 ؛ B = 63 × 10^-6 ؛ C = 7,25 × 10^-5', S_OPTS[21], [2])
self_item(22, [42, 43], '(-2)^5 = ……', S_OPTS[22], P(-2, 5), verified=True, note='reviewPages imprimées « 42 و 43 » (le savoir est p. 44)')
self_item(23, [42, 43], '(3^2)^5 = ……', S_OPTS[23], P(3, 10), verified=True, note='reviewPages imprimées « 42 و 43 » (le savoir est p. 44) ; 45 et 3^7 sont les leurres 3^2 × 5 et 3^(2+5)')
self_item(24, [44, 45], '-2 × 5^2 = ……', S_OPTS[24], -2 * P(5, 2), verified=True, note='priorité : la puissance d’abord (5^2 = 25), puis × (−2) → −50 ; −100 = (−2 × 5)^2 × (−1)… leurre, 100 = (−2 × 5)^2')
self_item(25, [44, 45], 'نصف 4^8 هو ……', S_OPTS[25], P(4, 8) / 2, verified=True, note='4^8/2 = 2^16/2 = 2^15 = 2 × 4^7 ; 4^4 et 2^4 sont les leurres « diviser l’exposant »')
SELF_CORRECT = {e['number']: e['correct'] for e in E if e['kind'] == 'selfcheck'}
assert SELF_CORRECT[22] == [1] and SELF_CORRECT[23] == [0] and SELF_CORRECT[24] == [1] and SELF_CORRECT[25] == [2]
assert SELF_CORRECT[7] == [] and SELF_CORRECT[2] == [2] and SELF_CORRECT[11] == [2] and SELF_CORRECT[20] == [2]
assert all(SELF_CORRECT[n] for n in SELF_CORRECT if n != 7)

# ── pp. 50–51 : أتعمّق (ex-48 … ex-70) ──────────────────────────────────────────────────────────────


def deep(n, page, text, verified=False, **extra):
    E.append({'id': f'ex-{n}', 'kind': 'deepen', 'number': n, 'page': page, 'section': 'أتعمّق', 'verified': verified, 'text': text, **extra})


EX48 = [('4^3/2^3', P(4, 3) / P(2, 3), '2^3'), ('100^3/10^3', P(100, 3) / P(10, 3), '10^3'), ('15^4/3^4', P(15, 4) / P(3, 4), '5^4'), ('9^6/27^6', P(9, 6) / P(27, 6), '(1/3)^6 = 3^-6')]
assert [v for _, v, _ in EX48] == [P(2, 3), P(10, 3), P(5, 4), P(3, -6)]
deep(48, 50, 'اكتب على شكل قوة واحدة: 4^3/2^3 ؛ 100^3/10^3 ؛ 15^4/3^4 ؛ 9^6/27^6 .', verified=True,
     items=[{'expr': e, 'answer': a} for e, _, a in EX48], answerSource='computed',
     reading='exposants pâles de 15^4/3^4 et du dénominateur 27^6 relus à 600 dpi (27^4 non exclu : 9^6/27^4 = 3^0 = 1)')
EX49 = [('2^6 × 5^5', P(2, 6) * P(5, 5), '2 × 10^5'), ('(2^2 × 5^2)/10', P(2, 2) * P(5, 2) / 10, '1 × 10^1'),
        ('0,003 × 2^4 × 5^4', q('0,003') * P(2, 4) * P(5, 4), '3 × 10^1'), ('0,5 × 5^7 × 2^9', q('0,5') * P(5, 7) * P(2, 9), '2 × 10^7')]
assert [v for _, v, _ in EX49] == [2 * P(10, 5), 10, 30, 2 * P(10, 7)]
deep(49, 50, 'احسب وأعط النتيجة على شكل جداء عدد طبيعي (أصغر ما يمكن) وقوة للعدد 10: 2^6 × 5^5 ؛ (2^2 × 5^2)/10 ؛ 0,003 × 2^4 × 5^4 ؛ 0,5 × 5^7 × 2^9 .', verified=True,
     items=[{'expr': e, 'answer': a, 'value': fr(v)} for e, v, a in EX49], answerSource='computed')
A50 = P(10000, 2) * P(100, 5) / q('0,01') ** 3
assert A50 == P(10, 24)
deep(50, 50, 'بدون آلة حاسبة احسب: A = (10 000^2 × 100^5)/0,01^3 .', answer='10^24', answerSource='computed')
EX51 = [('5^30 + 5^30 + 5^30 + 5^30 + 5^30', 5 * P(5, 30), '5 × 5^30 = 5^31'), ('2^60 + 2^60 + 2^60 + 2^60', 4 * P(2, 60), '4 × 2^60 = 2^2 × 2^60 = 2^62')]
assert EX51[0][1] == P(5, 31) and EX51[1][1] == P(2, 62)
deep(51, 50, 'عبّر على شكل قوة: 5^30 + 5^30 + 5^30 + 5^30 + 5^30 ؛ 2^60 + 2^60 + 2^60 + 2^60 .', verified=True,
     items=[{'expr': e, 'answer': a} for e, _, a in EX51], answerSource='computed',
     reading='5 termes 5^30 (le crop à 600 dpi en coupe deux à gauche, lus à 300 dpi) ; le 3e terme de la 2e somme ressemble à « 2^50 » sur le scan (glyphe 5/6 ambigu) — lu 2^60, seule lecture qui donne une puissance')
A52 = 3 * P(10, 2) * q('1,8') * P(10, -3) / (6 * P(10, 4))
deep(52, 50, 'أعط كتابة علمية لكل من الأعداد: A = (3 × 10^2 × 1,8 × 10^-3)/(6 × 10^4) ؛ B = (4 × 10^-2 × 9 × 10^3)/(6 × 10^7 × 12 × (10^3)^2) .',
     reading='exposants de B lus à 110 dpi (à relire par kitaba-ilmiya-rutba)',
     answer={'A': sci(A52)[0], 'B': sci(4 * P(10, -2) * 9 * P(10, 3) / (6 * P(10, 7) * 12 * P(10, 6)))[0]}, answerSource='computed')
# Carré magique multiplicatif : exposants (de 3, de 7) puis (de 3, de 2, de 5).
T1 = [[(1, 1), (4, 2), (1, 0)], [(2, 0), (2, 1), (2, 2)], [(3, 2), (0, 0), (3, 1)]]
T2_GIVEN = {(0, 0): (4, 2, 1), (1, 0): (4, 0, 2), (1, 1): (3, 2, 2), (1, 2): (2, 4, 2)}


def vadd(*vs):
    return tuple(map(sum, zip(*vs)))


def vsub(a, b):
    return tuple(x - y for x, y in zip(a, b))


def magic(t):
    lines = [t[i] for i in range(3)] + [[t[i][j] for i in range(3)] for j in range(3)] + [[t[i][i] for i in range(3)], [t[i][2 - i] for i in range(3)]]
    sums = {vadd(*l) for l in lines}
    return len(sums) == 1, sums


ok1, s1 = magic(T1)
assert ok1 and s1 == {(6, 3)}
TOT = vadd(T2_GIVEN[(1, 0)], T2_GIVEN[(1, 1)], T2_GIVEN[(1, 2)])
c = T2_GIVEN[(1, 1)]
a00 = T2_GIVEN[(0, 0)]
a22 = vsub(vadd(c, c), a00)
a20 = vsub(vsub(TOT, a00), T2_GIVEN[(1, 0)])
a02 = vsub(vsub(TOT, c), a20)
a01 = vsub(vsub(TOT, a00), a02)
a21 = vsub(vsub(TOT, a01), c)
T2 = [[a00, a01, a02], [T2_GIVEN[(1, 0)], c, T2_GIVEN[(1, 2)]], [a20, a21, a22]]
ok2, s2 = magic(T2)
assert ok2 and s2 == {(9, 6, 6)} and all(x >= 0 for row in T2 for cell in row for x in cell)


def name2(e):
    parts = [f'{b}^{k}' if k > 1 else str(b) for b, k in zip((3, 2, 5), e) if k]
    return ' × '.join(parts) or '1'


deep(53, 50, '1) تحقق أنّ الجدول الموالي هو جدول سحري ضربيا بمعنى أنّ جداء الأعداد في كل سطر وفي كل عمود وفي كل قطر متساوي: [3 × 7 ؛ 3^4 × 7^2 ؛ 3] / [3^2 ؛ 3^2 × 7 ؛ (3 × 7)^2] / [7^2 × 3^3 ؛ 1 ؛ 3^3 × 7] . 2) انقل وأتمم الجدول الموالي بحيث يكون سحريا ضربيا: [3^4 × 2^2 × 5 ؛ ….. ؛ …..] / [3^4 × 5^2 ؛ 3^3 × 2^2 × 5^2 ؛ (3 × 5)^2 × 2^4] / [….. ؛ ….. ؛ …..] .', verified=True,
     answer={'1': {'magicProduct': '3^6 × 7^3', 'value': int(P(3, 6) * P(7, 3))},
             '2': {'magicProduct': '3^9 × 2^6 × 5^6', 'grid': [[name2(e) for e in row] for row in T2]}},
     note='Cases écrites de gauche à droite comme sur la page ; exposants vérifiés ligne / colonne / diagonales.', answerSource='computed')
deep(54, 50, 'عبّر بدلالة كتابة علمية عن المقادير التالية: عُمر الأرض: 4,5 مليار سنة. عرض بكتيريا هو 1,5µm (1µm = 0,001mm). عدد سكان الكرة الأرضية هو 7,3 مليار. سرعة الضوء: 300 000 000m/s . انقراض الديناصورات (-65 000 000) سنة. سمك ورقة ألومنيوم: 0,002cm .',
     answer=[sci(q('4,5') * P(10, 9))[0], sci(q('1,5') * P(10, -6))[0] + ' m', sci(q('7,3') * P(10, 9))[0], sci(300_000_000)[0], sci(-65_000_000)[0], sci(q('0,002'))[0] + ' cm'], answerSource='computed')
deep(55, 50, 'إليك برنامج الحساب: 1) اختر عددا 2) اضربه في 10^7 3) اطرح منه 10^5 4) أعط النتيجة النهائية. أ) ماذا يساوي العدد النهائي إذا اخترنا: 1 ؛ 10^3 ؛ 10^-2 ؟ ب) ما هو العدد الذي اخترناه إذا تحصلنا على النتيجة 10^8 ؟',
     answer={'أ': [int(x * P(10, 7) - P(10, 5)) for x in (1, P(10, 3), P(10, -2))], 'ب': fr((P(10, 8) + P(10, 5)) / P(10, 7))}, answerSource='computed')
deep(56, 50, 'إليك برنامج حساب: 1) اختر عدد 2) اضربه في 10^7 3) اضربه في 10^-3 4) قسّمه على 10^2 . باستعمال هذا البرنامج؛ ما هو العدد الذي نتحصل عليه إذا اخترنا في البداية: 2 ؛ -5 ؛ 0,75 ؟ تقترح ليلى ضرب العدد المختار في 100 للحصول على النتيجة. ما رأيك؟ علل إجابتك.',
     answer={'results': [fr(x * P(10, 7) * P(10, -3) / P(10, 2)) for x in (2, -5, q('0,75'))], 'laila': 'صحيح: 10^7 × 10^-3 / 10^2 = 10^2'}, answerSource='computed')
deep(57, 50, 'يدق قلب الإنسان حوالي 75 دقة في الدقيقة. علما أنّ متوسط عمر الإنسان هو 80 سنة؛ ما هو عدد دقات قلب الإنسان خلال حياته؟ أعط النتيجة على شكل كتابة علمية.',
     answer=sci(75 * 60 * 24 * 365 * 80)[0], answerSource='computed', note='année de 365 jours')
deep(58, 50, 'يُقدّر عدد المجرات القابلة للرؤية في الكون بـ 100 مليار؛ إذا افترضنا أن مجرة تحتوي على مئة مليار نجمة؛ أعط عدد النجوم القابلة للرؤية في الكون على شكل قوة للعدد 10.', answer='10^11 × 10^11 = 10^22', answerSource='computed')
deep(59, 50, 'يرمش الإنسان بعينيه حوالي 30000 مرة في اليوم. علما أنّ متوسط عمر الانسان هو 80 سنة؛ كم من مرة يرمش الإنسان في حياته؟ اكتب النتيجة كتابة علمية.', answer=sci(30000 * 365 * 80)[0], answerSource='computed')
deep(60, 50, 'إليك المعطيات التالية: مساحة الكرة الأرضية حوالي: 5 × 10^8 Km² . مساحة المحيطات حوالي: 35 × 10^7 Km² . مساحة اليابسة حوالي: 150 × 10^6 Km² . ما هي النسبة المئوية من مساحة الكرة الأرضية التي تمثلها: المحيطات؟ اليابسة؟ اشرح لماذا يسمى كوكب الأرض بالكوكب الأزرق؟',
     answer={'oceans': f'{int(35 * P(10, 7) / (5 * P(10, 8)) * 100)} %', 'land': f'{int(150 * P(10, 6) / (5 * P(10, 8)) * 100)} %'}, answerSource='computed')
deep(61, 50, 'عندما يكون القمر نصف مضاء (بالنظر إليه من الأرض)؛ هذا يعني أن الزاوية (الأرض-القمر-الشمس) تساوي 90°. احسب حينئذ المسافة بين الشمس والقمر بالكيلومتر؟ • المسافة بين الشمس والأرض: 149 597 870Km • المسافة بين الأرض والقمر: 384 400Km .',
     figure='مثلث قائم في L (القمر) رؤوسه T (الأرض)، L (القمر)، S (الشمس).', note='Pythagore (programme 4AM) : SL = √(TS² − TL²) ≈ 149 597 376 km.')
deep(62, 51, 'المستقيمان (AC) و (BD) متوازيان. AE = 4,2 × 10^4 ؛ EB = 3,2 × 10^3 ؛ EC = 6,8 × 10^5 . احسب الطول ED .', figure='مستقيمان متقاطعان في E ، A و C من جهة، D و B من جهة.',
     reading='exposants à relire ; relation de Thalès (programme 4AM) — à trancher par kitaba-ilmiya-rutba')
deep(63, 51, 'مُزّق شخص ورقة إلى 8 أجزاء (مرحلة أولى) ؛ ثم أخذ جزءًا ومزقه إلى 8 أجزاء (مرحلة ثانية)؛ وهكذا في كل مرحلة يأخذ جزءًا ويمزقه إلى 8 أجزاء. بَعد كم من مرحلة يكون عدد الأجزاء المحصل عليها 2017 إذا افترضنا أن هذا الشخص قادر على تمزيق الورق حتى ولو كان صغيرا ؟',
     answer={'parts': '1 + 7n', 'stages': (2017 - 1) // 7}, answerSource='computed', note='chaque étape ajoute 7 morceaux : 1 + 7n = 2017 → n = 288')
assert 1 + 7 * 288 == 2017
deep(64, 51, '1) علبة ذات 500 ورقة من الشكل A4 لها سُمْك 5cm . أ) ما هو سُمك الورقة الواحدة؟ ب) استعمل قوة للعدد 10 للتعبير عن هذا السُمك بالمتر. 2) نطوي هذه الورقة على اثنين. ما هو سُمك هذه الورقة بعد الطي؟ 3) نطوي الورقة مجددا على اثنين. ما هو السُمك المحصل عليه بعد الطي؟ 4) نفترض أنه بمقدورنا طي الورقة على 2 بعدد المرات الذي نريد. ما هو السُمك المحصل عليه عند طي الورقة 10 مرات؟',
     answer={'sheet': '0,01 cm = 10^-4 m', 'fold10': f'2^10 × 10^-4 m = {fr(P(2, 10) * P(10, -4))} m'}, answerSource='computed')
deep(65, 51, '1) مساحة الكرة الأرضية تساوي بالتقريب 510 067 420Km² . تمثل المحيطات 71 % من هذه المساحة؛ ما هي مساحة المحيطات؟ 2) نفرض أن متوسط عمق المحيطات هو 3 800m . أعط قيمة مقربة لحجم المحيطات. 3) يمثل هذا الحجم 97 % من الحجم الكلي للماء الموجود على الأرض؛ ما هو الحجم الكلي للماء الموجود على الأرض؟ 4) أعط تقديرا لحجم قاعة دراسة في مؤسستك؟ كم يلزم من قاعة دراسة لاحتواء كل الكمية الموجودة في الأرض؟',
     answer={'oceans': sci(510_067_420 * F(71, 100))[0] + ' Km²'}, answerSource='computed')
deep(66, 51, '1) يقطع الضوء في الفراغ وفي الهواء مسافة 299 792 458m/s . احسب بالدقائق المدة التي يستغرقها الضوء لقطع المسافة من الشمس إلى الأرض (149 597 870Km). 2) السنة الضوئية هي المسافة التي يقطعها الضوء خلال سنة. أ) عبّر بالمتر عن سنة ضوئية، باستعمال الكتابة العلمية وبالتدوير إلى رقم واحد بعد الفاصلة. ب) Proxima Centauri هي النجمة الأقرب من المجموعة الشمسية ؛ وهي تقع على مسافة 11,5al (سنة ضوئية) من المجموعة الشمسية. على كم من كيلومتر من المجموعة الشمسية تقع النجمة Proxima Centauri؟',
     reading='« 11,5al » lu tel quel (la valeur réelle est ≈ 4,2 al)')
deep(67, 51, 'في سنة 2009، قُدّرت كمية المعلومات المخزنة في العالم بـ: 800 مليار Gigaoctet ؛ في نهاية سنة 2020 تُقدّر كمية المعلومات المتوقعة للاحتفاظ بـ 45 مرة أكبر من كمية 2009. كم يلزم من قرص صلب ذي سعة 500Go لتخزين معلومات 2020؟ عبّر عن هذه الكمية بكتابة علمية.',
     answer=sci(800 * P(10, 9) * 45 / 500)[0], answerSource='computed')
deep(68, 51, 'أضع جرثومة واحدة في علبة ياغورت؛ تنقسم الجرثومة إلى اثنين كل ثانية؛ بحيث بعد دقيقة امتلأت كل علبة الياغورت. ما هي المدة اللازمة لملء نفس العلبة إذا وضعنا 4 جرثومات مماثلة في البداية؟',
     answer='58 s (4 = 2^2 : on gagne 2 secondes)', answerSource='computed')
deep(69, 51, '1) انقل وأتمم الجدول الموالي: العدد: 2 ؛ 2^2 ؛ 2^3 ؛ 2^4 ؛ 2^5 ؛ 2^6 ؛ 2^7 ؛ 2^8 — رقم الآحاد: … . 2) عيّن رقم آحاد الأعداد التالية: 2^3 ؛ 2^13 ؛ 2^18 ؛ 2^40 . 3) عيّن رقم آحاد 2^2012 .',
     answer={'1': [2 ** k % 10 for k in range(1, 9)], '2': [pow(2, k, 10) for k in (3, 13, 18, 40)], '3': pow(2, 2012, 10)}, answerSource='computed')
deep(70, 51, 'السنة الضوئية (al) هي المسافة التي يقطعها الضوء خلال سنة. سرعة الضوء في الفراغ والهواء هي: 299 792 458m/s . في سنة 2005 لاحظ علماء الفلك انفجار نجمة تقع على بُعد 13 مليار سنة ضوئية من الأرض. عبّر عن هذه المسافة بالكيلومتر.',
     answer=sci(13 * P(10, 9) * 299_792_458 * 365 * 24 * 3600 / 1000)[0] + ' Km', answerSource='computed', note='année de 365 jours')

# ── p. 52 : أدمج تعلّماتي ; p. 53 : تكنولوجيات ───────────────────────────────────────────────────────
R1, R2, DD = 48 * P(10, -12), 67 * P(10, -12), q('0,112') * P(10, -9)
E.append({'id': 'integration', 'kind': 'integration', 'page': 52, 'section': 'أدمج تعلّماتي', 'title': 'جزيء ثاني أكسيد الكربون', 'verified': False,
          'text': 'وضعية: ثنائي أكسيد الكربون هو جزيء مكون من ذرة واحدة للكربون وذرتي أكسجين. r1 نصف قطر ذرة الأكسجين هو 48pm ؛ r2 نصف قطر ذرة الكربون هو 67pm ؛ d المسافة بين مركزي الذرتين هي 0,112nm . 1) أعط الكتابة العلمية لكل من r1 ؛ r2 و d . 2) ما هو طول جزيء ثاني أكسيد الكربون؟ استعن بالجدول التالي (البادئات: تيرا 10^12 ، جيغا 10^9 ، ميغا 10^6 ، كيلو 10^3 ، هكتو 10^2 ، ديكا 10^1 ؛ ديسي 10^-1 ، سنتي 10^-2 ، ميلي 10^-3 ، ميكرو 10^-6 ، نانو 10^-9 ، بيكو 10^-12). توجيهات — قراءة وفهم الوضعية: 1) ما دلالة كل من r1 ؛ r2 ؛ d ؟ 2) ما دلالة pm ؛ nm ؟ 3) ما هو المطلوب؟ تحليل الوضعية واختيار استراتيجية حل مناسبة: 1) كيف نكتب عددا عشريا كتابة علمية؟ 2) ما هي الوحدة المناسبة التي نختارها لتحويل الأطوال المعطاة إليها. 3) هل الشكل متناظر؟ أعط عبارة مبسطة لطول الجزيء بدلالة r1 ؛ r2 ؛ d . حل مختصر: 1pm = 10^-12 m ؛ r1 = 48pm = 48 × 10^-12 m ؛ r1 = 48p = 48 × 10^-11 m ؛ r2 = 67pm = 1,7 × 10^-11 m ؛ 1nm : d = 0,112nm ؛ d = 0,112 × 10^-9 m ؛ d = 1,12 × 10^-10 m ؛ d = 2(r1 + r2 + d) ؛ 4,54 × 10^-10 m ؛ 4,54 × 10^-7 nm .',
          'reading': 'jeu de préfixes : le tableau imprime « 10^-12 » sous تيرا et « 10^6 » sous جيغا (coquilles, voir discrepancies)',
          'answer': {'r1': sci(R1)[0] + ' m', 'r2': sci(R2)[0] + ' m', 'd': sci(DD)[0] + ' m',
                     'printedLength': sci(2 * (R1 + R2 + DD))[0] + ' m', 'linearO=C=O': sci(2 * (DD + R1))[0] + ' m'},
          'answerSource': 'computed'})
RBC = 4_500_000 * 6 * P(10, 6)
E.append({'id': 'evaluation', 'kind': 'integration', 'page': 52, 'section': 'وضعية للتقويم', 'verified': False,
          'text': '1) يحتوي 1mm³ من الدم على 4 500 000 كرية دم حمراء، ويحتوي جسم الإنسان على 6L من الدم. كم كرية حمراء يحتوي عليها؟ 2) شكل الكرية الحمراء قابل للتشبيه مع أسطوانة قطرها 7,5µm وارتفاعها 2µm (1µm = 10^-3 mm). إذا تراكمت الكريات الحمراء ؛ ما هو ارتفاع العمود المتحصّل عليه؟',
          'answer': {'cells': sci(RBC)[0], 'column': sci(RBC * 2 * P(10, -6))[0] + ' m'}, 'answerSource': 'computed'})
GRAINS = 2 ** 64 - 1
assert sum(2 ** k for k in range(64)) == GRAINS
E.append({'id': 'ict', 'kind': 'ict', 'page': 53, 'section': 'أوظّف تكنولوجيات الإعلام والاتصال', 'title': 'حساب قوى عدد نسبي باستعمال مجدول إكسال', 'verified': False,
          'text': 'مكافأة «سيسا»: وعد «شيران» وهو ملك هندي، «سيسا» مخترع لعبة الشطرنج، بأن يعطيه كل ما يطلبه مكافأة له على اختراعه ؛ وطلب منه ما يريد، فأجاب سيسا: أعطني حبة قمح في الخانة الأولى من لعبة الشطرنج، وحبتين في الخانة الثانية وأربع حبات في الخانة الثالثة وهكذا بوضع الضعف في الخانة الموالية حتى الخانة الرابعة والستين. 1) هل تظن كما ظن الملك أن هذا الطلب متواضع جدا؟ 2) ما هو عدد حبات القمح في كل خانة؟ 3) ما هو عدد حبات القمح الإجمالي؟ 4) إذا كانت حبة القمح تزن 50mg ما هي بالطن الكمية اللازمة؟ 5) إذا كانت حصيلة القمح السنوية هي 50 000 طن، كم من سنة يلزم الملك للوفاء بعهده؟ حل: (مجدول: A رقم الخانة، B عدد حبات القمح ؛ A3 = A2+1 ؛ B3 = B2*2 ؛ سحب القاعدتين حتى B65 ؛ D2 = SOMME(B2:B65)).',
          'answer': {'cell_n': '2^(n−1)', 'total': GRAINS, 'totalSci': sci(GRAINS)[0], 'tonnes': sci(F(GRAINS * 50, 10 ** 9))[0],
                     'years': sci(F(GRAINS * 50, 10 ** 9) / 50_000)[0]},
          'answerSource': 'computed'})

Q, L1, L2, L3, SYN = 'quwat-adad-nisbi', 'quwa-adad-ashara', 'qawaid-quwa-ashara', 'kitaba-ilmiya-rutba', 'wadiya-idmajiya-quwa-nisbiya'
PREP_REST = '1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-18-19-20-21-22-23-24-25'
DEST = {
    '_comment': 'elementId → { lesson, module } (ou { notIntegrated: raison }) ; `items` répartit un élément ; une leçon encore coming_soon est une destination EN ATTENTE (check-textbook-coverage.mjs). Modules de quwat-adad-nisbi : 0 أستعدّ · 1 نشاط (lab) · 2 معارف · 3 طريقة · 4 أتمرّن · 5–7 مسائل · 8 إختبار أولي.',
    'objectives': {'lesson': 'unit', 'module': 'page'},
    'opener': {'lesson': L3, 'module': None, 'note': 'Ouverture (unité astronomique ≈ 150 millions de km) : NON reprise comme entrée — la plateforme a ses objets (le mur de la foire des sciences) ; citée comme trace dans content/textbook.js.'},
    'challenge': {'lesson': Q, 'module': 5},
    'prep': {'lesson': Q, 'module': 0, 'items': {'16-17': {'lesson': Q, 'module': 0}, PREP_REST: {'lesson': L1, 'module': 0}}},
    'act-1': {'lesson': L1, 'module': 4}, 'act-2': {'lesson': L1, 'module': 2}, 'act-3': {'lesson': L1, 'module': 1},
    'act-4': {'lesson': L2, 'module': 2, 'note': 'Le cahier corrigé en rouge devient les lignes à juger du module 2 (mêmes TYPES d’erreur, autres nombres) ; l’écriture des facteurs n’est pas l’entrée (le train de quwat-adad-nisbi l’a faite).'}, 'act-5': {'lesson': L3, 'module': None},
    'act-6': {'lesson': Q, 'module': 4, 'note': 'APPLICATION (guide §4ter) : le lab de la plateforme est l’entrée conçue ; l’activité du manuel est posée en أتمرّن.'},
    'know-1': {'lesson': L1, 'module': 2}, 'know-2': {'lesson': L1, 'module': 2}, 'know-3': {'lesson': L2, 'module': 2},
    'know-4': {'lesson': L3, 'module': 2}, 'know-5': {'lesson': L3, 'module': 2},
    'know-6': {'lesson': Q, 'module': 2}, 'know-7': {'lesson': Q, 'module': 2}, 'know-8': {'lesson': Q, 'module': 3},
    'method-43a': {'lesson': L1, 'module': 3}, 'method-43b': {'lesson': L1, 'module': 3}, 'method-43c': {'lesson': L2, 'module': 3},
    'now-43': {'lesson': L2, 'module': 3},
    'method-45a': {'lesson': L3, 'module': 3}, 'method-45b': {'lesson': L3, 'module': 3}, 'method-45c': {'lesson': Q, 'module': 3},
    'now-45': {'lesson': Q, 'module': 3, 'items': {'1': {'lesson': L3, 'module': 3}, '2': {'lesson': Q, 'module': 3}}},
    **{f'ex-{n}': {'lesson': L1, 'module': 4} for n in range(1, 13)},
    'ex-13': {'lesson': L2, 'module': None, 'note': 'Le libellé (« ألف مليار لألف كتاب », « جزء من المئة لجزء من المليون ») demande le produit 10^m × 10^n ou le rapport 10^m / 10^n : il appartient à qawaid-quwa-ashara, dont la banque l’adapte.'},
    **{f'ex-{n}': {'lesson': L2, 'module': 4} for n in (14, 17, 20, 50, 56)},
    **{f'ex-{n}': {'lesson': L2, 'module': 'practice', 'note': 'banque d’exercices (adaptée)'} for n in (13, 15, 16, 18, 19)},
    'ex-55': {'lesson': L2, 'module': 7},
    **{f'ex-{n}': {'lesson': L3, 'module': 4} for n in (21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 52, 57, 58, 59)},
    **{f'ex-{n}': {'lesson': L3, 'module': 'practice', 'note': 'banque d’exercices (adaptée, avec ses propres nombres)'} for n in (32, 33, 54, 60, 65, 66, 67, 70)},
    'ex-61': {'notIntegrated': 'Pythagore (la distance Soleil–Lune d’un triangle Terre–Lune–Soleil rectangle en Lune, avec des nombres en écriture scientifique) : l’outil appartient à la leçon publiée `khassiyat-fitaghuras` (3AM unité 7, plus loin dans le livre) ; la leçon kitaba-ilmiya-rutba n’en possède ni la propriété ni l’étape géométrique (décision du lead, 2026-10-26 ; adaptation possible plus tard dans la banque de khassiyat-fitaghuras avec l’étape donnée).'},
    'ex-62': {'notIntegrated': 'Thalès (AE, EB, EC en écriture scientifique, calculer ED) : l’outil est de 4AM (`khassiyat-talis`) ; kitaba-ilmiya-rutba ne possède pas l’étape géométrique (décision du lead, 2026-10-26).'},
    **{f'ex-{n}': {'lesson': Q, 'module': 4} for n in (*range(34, 50), 51, 53)},
    **{f'ex-{n}': {'notIntegrated': 'أتعمّق sur les puissances de 2 / de 8 et le doublement : exclu de la synthèse (MASAIL §14, pas d’أتعمّق dans أدمج تعلّماتي) ; à adapter dans la banque de quwat-adad-nisbi lors d’une passe ultérieure — décision du propriétaire en attente'} for n in (63, 64, 68, 69)},
    **{f'self-{n}': {'lesson': L1, 'module': 8} for n in (1, 2, 3)},
    'self-11': {'lesson': L1, 'module': 4},
    **{f'self-{n}': {'lesson': L2, 'module': 8} for n in (4, 5, 6)},
    **{f'self-{n}': {'lesson': L2, 'module': 'practice'} for n in (7, 8, 9, 10)},
    **{f'self-{n}': {'lesson': L3, 'module': 8} for n in (12, 14, 19, 20, 21)},
    **{f'self-{n}': {'lesson': L3, 'module': 'practice'} for n in (13, 15, 16, 17, 18)},
    **{f'self-{n}': {'lesson': Q, 'module': 8} for n in range(22, 26)},
    # `wadiya-idmajiya-quwa-nisbiya` (synthèse, 2026-10-28) : l'intégration (feuille d'or) → module 8 (test final ; citée aussi par « هل تعلم » du module 0 et le module 7), la وضعية للتقويم → situation 4, l'ICT → situation 1.
    'integration': {'lesson': SYN, 'module': 8, 'note': 'redessinée : la feuille d\'or de Nour (288 pm, 0,1 µm) ; et la banque (feuille adaptée « طول جزيء », module practice)'},
    'evaluation': {'lesson': SYN, 'module': 4, 'note': 'situation 4 « الكريات الحمراء » (autres nombres) ; et la banque (feuille adaptée)'},
    'ict': {'lesson': SYN, 'module': 1, 'note': 'situation 1 « رقعة القمح » (2ⁿ, rang de grandeur, masse) ; et la banque (feuille adaptée « تضاعف خانات لوحة »)'},
}
assert set(DEST['prep']['items']) and sorted(int(x) for k in DEST['prep']['items'] for x in k.split('-')) == list(range(1, 26))

DISCREPANCIES = [
    {'elementId': 'act-6', 'kind': 'reading', 'text': 'Relu à 450–800 dpi : « 5^10 / 5^2 » (dénominateur 5², pas 5⁴) → 5^8, et « 6^-8 × 6^-2 » (premier exposant −8 précédé d’un signe moins net, pas 6³) → 6^-10. Les autres : 3^2 × 3^5 = 3^7 ; 7^2 × 7^-5 = 7^-3 ; 7^3 / 7^-2 = 7^5 ; (11^3)^2 = 11^6 ; (13^2)^-5 = 13^-10.'},
    {'elementId': 'challenge', 'kind': 'reading', 'text': 'Fleurs comptées à 300 dpi : 1 (jour 1), 3 (jour 2), 9 (jour 3) ; jour n : 3^(n−1) ; jour 10 : 3^9 = 19 683 ≠ 300 → ليلى a tort (300 serait la lecture « ×3 en additionnant » ou 3 × 10 × 10).'},
    {'elementId': 'know-6', 'kind': 'scope', 'text': 'Le معارف 6 pose « a عدد صحيح غير معدوم » sous le titre « قوة عدد نسبي », alors que ex-40 et ex-48 élèvent des fractions et des décimaux : la leçon pose a RELATIF non nul (et a = p/q avec la règle (a/b)^n du معارف 7). Le « n عدد طبيعي » de la définition est étendu aux entiers relatifs par a^-n = 1/a^n.'},
    {'elementId': 'know-7', 'kind': 'misprint', 'text': 'La règle est imprimée « (a^m)^n = a^(m.n) » (point pour ×) ; les six exemples « بسّط » sont sans solution — réponses calculées (8^7, 3^4, 7^-4, 2^15, 784, 9/16).'},
    {'elementId': 'method-45a', 'kind': 'misprint', 'text': 'La طريقة écrit « في أي عدد نضرب 04,3 حتى نحصل على 0,043 ؟ » : lire 4,3 (texte gardé verbatim).'},
    {'elementId': 'ex-34', 'kind': 'reading', 'text': '« (-2)^1 » est imprimé (exposant 1 net à 800 dpi) ; à côté de « -2^4 », c’est sans doute « (-2)^4 » (= 16) qui était voulu pour opposer −2^4 et (−2)^4. La leçon peut poser la paire −2^4 / (−2)^4 en le disant.'},
    {'elementId': 'ex-35', 'kind': 'misprint', 'text': 'Le premier calcul est imprimé « (0,4)^2 - 25^2 » (= −624,84) dans une série de produits a^n × b^n = (ab)^n : « (0,4)^2 × 25^2 » = (0,4 × 25)^2 = 100 est sans doute voulu.'},
    {'elementId': 'ex-40', 'kind': 'reading', 'text': 'L’exposant de (−1/2) se lit « −4 » à 600 dpi (→ 16) ; « −1 » (→ −2) n’est pas exclu. Les 14 autres sont nets.'},
    {'elementId': 'ex-48', 'kind': 'reading', 'text': 'Exposants pâles : 15^4/3^4 (→ 5^4) et 9^6/27^6 (→ 3^-6) ; si le dénominateur est 27^4, 9^6/27^4 = 3^12/3^12 = 3^0 = 1.'},
    {'elementId': 'ex-51', 'kind': 'reading', 'text': 'Le 3e terme de « 2^60 + 2^60 + 2^?0 + 2^60 » ressemble à 2^50 sur le scan ; lu 2^60 (4 × 2^60 = 2^62), seule lecture qui donne une puissance.'},
    {'elementId': 'prep', 'kind': 'reading', 'text': 'Relus à 220 dpi (p. 39) : les 25 questions et leurs 3 colonnes (1)(2)(3) = ordre du script, aucune erreur de transcription ; items 1–15 et 18–25 `verified: true`. Rappel de la convention : options rangées [(1) colonne la plus à droite, (2), (3)].'},
    {'elementId': 'act-2', 'kind': 'reading', 'text': 'Tableau relu à 220 dpi : 9 colonnes 10^4 … 10^-4 (de droite à gauche), exposants des 5 dernières à demi effacés mais imposés par la suite ÷ 10 ; 8 cases d’opérations (6 « ÷ 10 », 2 « ÷ …. »). Questions 2–4 : 10^0, 10^1 ; 10^-1 … 10^-4 en fractions ; 10^-n = 1/10^n.'},
    {'elementId': 'ex-5', 'kind': 'reading', 'text': 'Erreur de transcription corrigée (500 dpi) : les dénominateurs sont 10^2, 10^3, 10^5 puis 10^-4, 10^-6, 10^-9 (exposants NÉGATIFS pour les trois derniers) — l’ancienne lecture mettait 4, 6, 9 positifs. Réponses : 10^-2, 10^-3, 10^-5, 10^4, 10^6, 10^9.'},
    {'elementId': 'ex-6', 'kind': 'reading', 'text': 'Ligne de fractions relue à 500 dpi (de droite à gauche) : 1/10^3 ; 1/10^+5 (signe + imprimé, ancienne lecture « 10^-5 » fausse) ; 1/10^9 ; 1/10^-4 ; 1/10^-6 (exposant pâle, lu 6) ; 1/10^-7. Réponses : 10^-3, 10^-5, 10^-9, 10^4, 10^6, 10^7. Les huit premiers nombres : 10 000 ; 100 000 ; 100 000 000 ; 1 000 000 000 ; 0,01 ; 0,0001 ; 0,0000001 ; 0,000000001.'},
    {'elementId': 'ex-9', 'kind': 'reading', 'text': 'Relu à 500 dpi : 0,001 ; 0,000001 ; 10 000 000 ; 10^-8 ; 10^-3 ; 0,0001 ; 10^-4 ; 10^9 ; 10^7 ; 10^-9 ; 1/10^3 ; 1 000 000 001 ; 0,000000001. Le glyphe de « 10^-8 » est ambigu (8 ou 6, boucles fermées : lu 8) ; avec 10^-6 il s’apparierait à 0,000001. Paires retenues : 0,001 = 10^-3 = 1/10^3 ; 10 000 000 = 10^7 ; 0,0001 = 10^-4 ; 0,000000001 = 10^-9 (sans doute 10^-9 imprimé à la fin de la 3e ligne). Leurres : 10^-8, 0,000001, 10^9, 1 000 000 001.'},
    {'elementId': 'ex-10', 'kind': 'reading', 'text': 'Erreur de transcription corrigée (500 dpi) : 1mL = 10^-2 …. (réponse dL) et 1cm³ = 10^-9 …. (réponse dam³) ; l’ancienne lecture 10^-3 (L) et 10^-6 (m³) était fausse. Les autres : 1hm = 10^5 cm ; 1kg = 10^3 g ; 1m² = 10^4 cm² ; 1dam = 10^3 cm.'},
    {'elementId': 'ex-11', 'kind': 'reading', 'text': 'Relu à 500 dpi, disposition 2 colonnes (de droite à gauche) : 1hm = …m (10^2) ; 1km = …cm (10^5) ; 1g = …mg (10^3) ; 1dag = …dg (10^2) ; 10^4 mm = …m (10^1) ; 10^2 cm = …m (10^0) ; 10^5 g = …kg (10^2) ; 10^1 kg = …mg (10^7). Aucune erreur.'},
    {'elementId': 'ex-13', 'kind': 'reading', 'text': 'Énoncé exact (500 dpi) : « اكتب على شكل قوة العدد 10 : 1) ألف مليار لألف كتاب. 2) مئة ألف مليار قصة. 3) جزء من المئة لجزء من المليون. » La préposition « ل » (1 et 3) est ambiguë : rapport (10^12/10^3 = 10^9 ; 10^-2/10^-6 = 10^4) ou produit (10^15 ; 10^-8). Destiné à qawaid-quwa-ashara (règles du produit et du quotient), dont la banque l’adapte.'},
    {'elementId': 'ex-14', 'kind': 'reading', 'text': 'Relu à 260 dpi (qawaid-quwa-ashara, 2026-10-26) : 10^-4 × 10^7 ; 10^9/10^3 ; 10^4/10^-5 ; (10^3)^2 ; (10^-4)^3 ; (10^5)^-3 ; 10^5 × 10^4 ; 10^-6 × 10^-3 ; 10^5 (10^3)^2 ; (10^-6 × 10^3)/10^-7 ; (10^4 × 10^6)/10^5. Réponses : 10^3, 10^6, 10^9, 10^6, 10^-12, 10^-15, 10^9, 10^-9, 10^11, 10^4, 10^5.'},
    {'elementId': 'ex-16', 'kind': 'reading', 'text': 'Relu à 130–260 dpi : 10^-17 × (10^19 − 10^18) et 10^15 × (10^-15 + 10^-13) (exposants fins) ; la leçon n’en reprend que l’IDÉE (distribuer puis une somme n’est pas une puissance), avec ses propres nombres.'},
    {'elementId': 'ex-55', 'kind': 'reading', 'text': 'Programme relu à 130 dpi : choisir un nombre ; × 10^7 ; ÷ 10^5 ... ; résultat attendu 10^-2, 10^3 ; l’idée (une chaîne = une seule multiplication) est reprise dans la مسألة 3 avec un autre programme.'},
    {'elementId': 'self-7', 'kind': 'misprint', 'text': 'Relu (p. 49) : « 10^2 + 10^-2 » avec options 20^-2 · 100,001 · 20^2 — aucune option juste (100,01).'},
    {'elementId': 'ex-63', 'kind': 'scope', 'text': 'ex-63, ex-64, ex-68, ex-69 (أتعمّق) : plus destinés à la synthèse (MASAIL §14) ; déclarés notIntegrated, adaptation dans la banque de quwat-adad-nisbi en attente d’une décision du propriétaire (plan/README issue 3).'},
    {'elementId': 'self-2', 'kind': 'reading', 'text': '« 10 ⁴ » avec un blanc avant l’exposant : tel quel la réponse est 10 000 (option (3)) ; le leurre −40 et l’option 0,0001 suggèrent que « 10^-4 » était voulu (réponse 0,0001, option (2)). `correct` suit l’imprimé.'},
    {'elementId': 'self-7', 'kind': 'misprint', 'text': '10^2 + 10^-2 = 100,01 n’est dans aucune option (imprimé « 100,001 ») : aucune réponse juste.'},
    {'elementId': 'self-10', 'kind': 'reading', 'text': 'L’option (3) « 0,010 » vaut 10^-2 ≠ 10^-3 : seule 10^-3 (option (2)) est juste.'},
    {'elementId': 'self-11', 'kind': 'reading', 'text': '36 مليون : l’option (1) est imprimée « 3,6 × 10^8 » (3,6 × 10^7 serait juste) ; seule 36 × 10^6 (option (3)) est juste. Destination quwa-adad-ashara (écrire un décimal avec une puissance de 10 ; pages de révision 42–43), pas la notation scientifique.'},
    {'elementId': 'self-22', 'kind': 'reviewPages', 'text': 'self-22 et self-23 renvoient aux pages « 42 و 43 » (puissances de 10) alors que le savoir est p. 44 (معارف 6–7).'},
    {'elementId': 'act-5', 'kind': 'reading', 'text': 'La distance الزهرة–الشمس se lit « 108,2 × 10^5 Km » (≈ 1,08 × 10^7 km) alors que la valeur réelle est 108,2 × 10^6 km ; à relire par kitaba-ilmiya-rutba.'},
    {'elementId': 'integration', 'kind': 'misprint', 'text': 'Le « حل مختصر » contient plusieurs erreurs : « r1 = 48p = 48 × 10^-11 m » (48 pm = 4,8 × 10^-11 m), « r2 = 67pm = 1,7 × 10^-11 m » (6,7 × 10^-11 m), « 4,54 × 10^-7 nm » (0,454 nm = 4,54 × 10^-1 nm) ; la formule « d = 2(r1 + r2 + d) » n’est pas la longueur de O=C=O (linéaire : 2(d + r1) = 3,2 × 10^-10 m). Le tableau des préfixes imprime « 10^-12 » sous تيرا et « 10^6 » sous جيغا. À trancher par la synthèse.'},
    {'elementId': 'opener', 'kind': 'reading', 'text': 'Des carrés blancs (filigrane du scan) masquent quelques mots du texte sur l’unité astronomique.'},
    {'elementId': 'ex-66', 'kind': 'reading', 'text': '« Proxima Centauri … 11,5al » imprimé ; la distance réelle est ≈ 4,24 al.'},
    {'elementId': 'unit', 'kind': 'scope', 'text': 'Pages 38–53 complètes. Éléments des leçons non générées transcrits brièvement à 110–170 dpi (verified: false) ; exposants de p. 46–47 et 50–51 à relire par leur leçon.'},
]

# 2026-10-26 — kitaba-ilmiya-rutba a RELU à 120–220 dpi les pages 38, 41, 44, 45, 47, 48, 49, 50, 51 : ses éléments sont `verified`.
READ_L3 = {'opener', 'act-5', 'know-4', 'know-5', 'method-45a', 'method-45b', 'now-45', *{f'ex-{n}' for n in (*range(21, 34), 52, 54, 57, 58, 59, 60, 61, 62, 65, 66, 67, 70)}, *{f'self-{n}' for n in range(12, 22)}}

# 2026-10-26 — qawaid-quwa-ashara a RELU à 130–260 dpi les pages 41, 43, 46, 47, 49, 50 : ses éléments sont `verified`.
READ_L2 = {'act-4', 'know-3', 'method-43c', 'now-43', 'ex-13', 'ex-14', 'ex-15', 'ex-16', 'ex-17', 'ex-18', 'ex-19', 'ex-20', 'ex-50', 'ex-55', 'ex-56', 'self-4', 'self-5', 'self-6', 'self-7', 'self-8', 'self-9', 'self-10'}
# 2026-10-28 — wadiya-idmajiya-quwa-nisbiya a RELU à 110 dpi les pages 52 et 53 : conforme à la transcription ; les deux erreurs d'impression (tableau des préfixes, « solution brève ») restent notées.
READ_SYN = {'integration', 'evaluation', 'ict'}
for e in E:
    if e['id'] in READ_L2 or e['id'] in READ_L3 or e['id'] in READ_SYN:
        e['verified'] = True
        if e['id'] in READ_SYN: e['reading'] = (e.get('reading', '') + ' Relu par la synthèse (2026-10-28) à 110 dpi (pdf pp. 52–53) : conforme ; réécrit avec d\'autres nombres.').strip()

doc = {
    '_comment': [
        'EXTRACTION CANONIQUE du manuel scolaire officiel — 3AM, الجيل الثاني (منشورات الشهاب 2017), unité 3 « القوى ذات أسس نسبية صحيحة ».',
        'Source : docs/official-book-pdfs/كتاب الرياضيات للسنة الثالثة متوسط الجيل الثاني.pdf, pages 38 à 53 du livre (PDF 38 à 53).',
        'Ce fichier est LA source de vérité pédagogique de l’unité ; tout contenu cite un `id` d’ici via `source.elementId`.',
        'Transcription VISUELLE ; réponses calculées (Fraction exacte) dans build-extraction.py, `answerSource: computed`.',
        'Généré par docs/sources/3am/unit3/build-extraction.py — ne pas éditer à la main.',
    ],
    'unitCode': 'quwa-nisbiya',
    'textbook': {'title': 'كتاب الرياضيات — السنة الثالثة من التعليم المتوسط', 'generation': 'الجيل الثاني', 'unitNumber': 3,
                 'unitTitle': 'القوى ذات أسس نسبية صحيحة', 'pages': {'first': 38, 'last': 53}, 'pdfPageOffset': 0,
                 'sections': ['سأتعلّم في هذا الباب', 'تحدّي', 'أستعدّ', 'أنشطة', 'معارف', 'طرائق', 'دوري الآن', 'أوظّف تعلّماتي', 'أؤكّد تعلّماتي', 'أتعمّق', 'أدمج تعلّماتي', 'وضعية للتقويم', 'أوظّف تكنولوجيات الإعلام والاتصال']},
    'frozenAt': '2026-10-20',
    'terminology': {'note': 'Le manuel écrit « قوة عدد نسبي », « a أس n », « الأس », « مقلوب », « الكتابة العلمية », « رتبة قَدْر », « حصر », « مدوّر a إلى الوحدة », « الأولوية لحساب القوى », « عاملا ».',
                    'terms': ['قوة', 'أس', 'a أس n', 'مقلوب', 'الكتابة العلمية', 'رتبة قدر', 'حصر', 'مدوّر', 'الأولوية', 'عامل', 'جداء', 'نسبة قوتين', 'قوة قوة']},
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
    if DEST[e['id']].get('lesson') == Q:
        assert e.get('verified') is True, f'{e["id"]} va à {Q} sans relecture'

out = Path(__file__).with_name('extraction.json')
out.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
toQ = sum(1 for k, v in DEST.items() if k != '_comment' and v.get('lesson') == Q)
pending = sum(1 for k, v in DEST.items() if k != '_comment' and v.get('lesson') not in ('unit', Q, None))
print(f'{out} — {len(E)} éléments ({toQ} pour {Q}, {pending} pour les autres leçons, en attente)')
