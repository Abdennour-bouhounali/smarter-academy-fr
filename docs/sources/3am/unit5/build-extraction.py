#!/usr/bin/env python3
"""Génère docs/sources/3am/unit5/extraction.json — 3AM, unité 5 « المساويات – المتباينات – المعادلات » (manuel الجيل الثاني,
منشورات الشهاب 2017 ; pp. 70–85 du livre = PDF 70–85, décalage 0 — docs/sources/3am/textbook-map.json).

Transcription VISUELLE (pages rendues à 110 dpi, p. 71 et p. 78 relues à 200–220 dpi ; le scan n'a pas de couche texte). Tout ce qui va
aux leçons générées (musawiyat-amaliyat, muadalat-darajat-ula, puis mutabayinat-amaliyat — relue à 170–600 dpi le 2026-10-26, puis
hasr-adad-ushri : pp. 71, 73, 76, 77, 79, 81, 83 relues à 200 dpi le 2026-10-26) est `verified: True` ; les éléments des autres leçons
(la synthèse) sont transcrits plus brièvement, `verified: False` : leur leçon les relira. Les réponses sont CALCULÉES ici (Fraction exacte), jamais tapées (`answerSource: computed`).

RE-ROUTAGE (plan README, appliqué le 2026-10-26 par mutabayinat-amaliyat) : ex-19, ex-23, ex-24, ex-26, ex-27 (« encadrer une expression
à partir d'un encadrement ») passent de hasr-adad-ushri à mutabayinat-amaliyat (LP4). ex-28 et ex-62 restent à hasr-adad-ushri (elles
partent d'un arrondi / d'approximations décimales). ex-8, ex-9, ex-10 restent à mutabayinat-amaliyat mais ne sont citées que par sa
BANQUE (comparer deux rationnels = 3am.m5.r04, unité 4).

FRONTIÈRE entre les leçons de l'unité (ce que chacune possède) :
  • musawiyat-amaliyat (#5, générée) — item 3am.m5.r05 côté ÉGALITÉS : si a = b alors a + c = b + c, a − c = b − c, a × c = b × c et
    a / c = b / c (c ≠ 0) ; l'opération s'applique aux DEUX membres (un seul membre casse l'égalité) ; utiliser ces propriétés pour
    TRANSFORMER une égalité connue (3 = 2x − 4 ⟹ 2x − 5 = 2) ou juger qu'une égalité en découle ou non. NE traite PAS : la résolution
    d'une équation en vue de x (leçon muadalat-darajat-ula), les inégalités (mutabayinat-amaliyat).
  • mutabayinat-amaliyat (générée) — le MÊME item 3am.m5.r05 côté INÉGALITÉS : a < b ⟹ a + c < b + c ; × c > 0 conserve le sens, × c < 0 le
    renverse ; × 0 détruit une inégalité stricte ; « déduire une inégalité d'une autre » (now-75-2, ex-14…16) ; encadrer ax + b à partir
    d'un encadrement de x (ex-19, 23, 24, 26, 27) ; comparer deux expressions PAR les propriétés (method-2), symboles ≤ ≥. Les égalités
    n'y sont que rappelées. NE possède PAS : le mot « متراجحة », « حلّ une inéquation », l'ensemble solution et sa droite graduée (4AM
    mutarajiha-ula) ; comparer deux rationnels par le signe de la différence (3am.m5.r04, unité 4 : rappelé, jamais ré-enseigné) ;
    l'arrondi d'un décimal (hasr-adad-ushri).
  • hasr-adad-ushri — item 3am.m5.x1 : encadrer un décimal positif entre deux entiers consécutifs, valeurs approchées par défaut / par
    excès à 1/10, 1/100, 1/1000, arrondi à une position (demi vers le haut), l'ENCADREMENT d'un nombre connu seulement par son arrondi
    (mesure 10,7 à 0,1 ⟹ 10,65 ≤ P < 10,75), encadrer un quotient lu sur la calculatrice, et employer un encadrement avec les
    propriétés de mutabayinat-amaliyat (ex-28, ex-62). NE traite PAS : les décimaux négatifs (l'item dit « موجب »), l'ordre des décimaux
    comme compétence (1AM muqaranat-adad-ashriya : ex-25 n'est qu'un échauffement), l'écriture scientifique et l'encadrement entre
    puissances de 10 (3am.m5/m3 kitaba-ilmiya-rutba), les propriétés des inégalités elles-mêmes (mutabayinat-amaliyat : utilisées, jamais
    ré-énoncées), √ comme notion (4AM ; la touche peut apparaître dans la banque, jamais dans les modules).
  • muadalat-darajat-ula (#6, générée ensuite) — item 3am.m5.r06 : reconnaître une équation du premier degré à une inconnue
    ax + b = cx + d et le sens de « résoudre » ; vérifier qu'un nombre est solution par SUBSTITUTION ; résoudre (opérations sur les deux
    membres, regrouper les x d'un côté, les nombres de l'autre, diviser par le coefficient) ; METTRE un problème en équation (choisir
    l'inconnue, traduire, résoudre, vérifier DANS le contexte). Elle ÉTEND l'item 2am.m4.r08 (a ÷ … = b) : « تذكّر — السنة الثانية »,
    jamais reconstruit. Elle s'appuie sur musawiyat-amaliyat (les opérations sur les deux membres) sans les ré-enseigner.
  • wadiya-idmajiya-musawiyat-mutabayinat — أدمج تعلّماتي p. 84 (deux cyclistes, deux voitures de sacs), تحدّ du père, ICT p. 85 en
    enrichissement.

Colonnes des QCM (أستعدّ p. 71, أؤكّد p. 81) : les options sont rangées [(1), (2), (3)] avec (1) la colonne la plus À DROITE (à côté
de la question) ; `correct` donne les indices 0-based des options justes.

L'unité est générée LEÇON PAR LEÇON : les destinations vers une leçon encore coming_soon sont EN ATTENTE
(scripts/check-textbook-coverage.mjs).

Usage : python3 docs/sources/3am/unit5/build-extraction.py
"""
import json
from decimal import Decimal as D
from fractions import Fraction as F
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


def solve1(a, b, c, d):
    """a x + b = c x + d  →  x exact (a ≠ c)."""
    a, b, c, d = map(F, (a, b, c, d))
    assert a != c
    return (d - b) / (a - c)


def lin(a, b, x):
    return F(a) * F(x) + F(b)


def rnd(x, k):
    """Arrondi à 1/10^k, demi vers le haut (x > 0)."""
    x = F(x)
    m = F(10) ** k
    return F(int(x * m + F(1, 2)), 1) / m


def floor_k(x, k):
    m = F(10) ** k
    return F(int(F(x) * m), 1) / m


E = []


def el(id, kind, page, section, text=None, verified=False, **extra):
    d = {'id': id, 'kind': kind, 'page': page, 'section': section, 'verified': verified}
    if text is not None:
        d['text'] = text
    d.update(extra)
    E.append(d)
    return d


# ── p. 70 : ouverture ─────────────────────────────────────────────────────────────────────────────
el('objectives', 'objectives', 70, 'سأتعلّم في هذا الباب', verified=True, items=[
    'معرفة الخواص المتعلقة بالمساويات (أو المتباينات) والعمليات واستعمالها في وضعيات بسيطة.',
    'حصر عدد موجب مكتوب في الشكل العشري باستعمال التدوير إلى رتبة معينة.',
    'ترييض مشكلات وحلها بتوظيف المعادلات من الدرجة الأولى ذات مجهول واحد.',
])
el('opener', 'aside', 70, 'تمهيد',
   'استعمال المعادلات الرياضية قديم قدم الحضارة الإنسانية: منذ 2000 سنة قبل الميلاد استعملت في مصر القديمة لتقسيم المحاصيل بين الفراعنة والكهنة والعمال، وعرفوا معادلات من الدرجة الثانية. الخوارزمي (القرن 8م) أول من حلّ معادلات من الدرجة الثانية بطريقة جبرية، ثم عمر الخيام (القرن 11) حلّ معادلات من الدرجة الثالثة، ولم يتم حلّ معادلات من الدرجة الرابعة إلا بعد 5 قرون (القرن 16) من طرف رافائيل بومبيلي.',
   reading='photo de عمر بن إبراهيم الخيام (1048م – 1131م)')
TOP = 15750
LOW = F(TOP, 4)
THIRD = F(TOP * 3, 10)
el('challenge', 'challenge', 70, 'تحدّي',
   'قرّر أبٌ مكافأة كل واحد من أبنائه الثلاثة بمبلغ مالي بمناسبة نجاحهم في امتحانات نهاية السنة الدراسية: يأخذ صاحب أعلى معدل مبلغ 15750 DA ويأخذ صاحب أدنى معدل ربع المبلغ، بينما يتحصل الولد الثالث على ثلاثة أعشار المبلغ. ماهي حصة كل من الولدين الآخرين؟',
   verified=True, answer={'lowest': fr(LOW) + ' DA', 'third': fr(THIRD) + ' DA'}, answerSource='computed',
   note='« المبلغ » = 15750 DA : ربع المبلغ = 3937,5 DA ؛ ثلاثة أعشاره = 4725 DA.')

# ── p. 71 : أستعدّ ─────────────────────────────────────────────────────────────────────────────────


def prep(n, question, options, correct, value=None, **extra):
    """options = [(1), (2), (3)] ; (1) = colonne la plus à droite. `correct` = indices 0-based ; `value` (Fraction) = contrôle de calcul."""
    if value is not None:
        got = [i for i, o in enumerate(options) if q(o) == value]
        assert got == correct, f'prep {n}: calcul {got} ≠ lecture {correct}'
    return {'n': n, 'question': question, 'options': options, 'correct': correct, **extra}


PREP = [
    prep(1, 'العدد المجهول في المساواة x + 5 = 0 هو ……', ['0', '5', '-5'], [2], F(-5)),
    prep(2, 'العدد المجهول في المساواة x - 4 = 0 هو ……', ['4', '-4', '0'], [0], F(4)),
    prep(3, 'العدد المجهول في المساواة 7 × x = 1 هو ……', ['7', '1/7', '-7'], [1], F(1, 7)),
    prep(4, 'العدد المجهول في المساواة -8x = 8 هو ……', ['0', '1', '-1'], [2], F(-1)),
    prep(5, 'العدد المجهول في المساواة 3 ÷ x = 3 هو ……', ['1', '1/9', '-1'], [0], F(1)),
    prep(6, 'العدد المجهول في المساواة x ÷ 10 = 1 هو ……', ['-9', '10', '1/10'], [1], F(10)),
    prep(7, 'العدد الأكبر من بين العددين 2/3 و -2/3 هو ……', ['2/3', '-2/3', 'لا يمكن تعيينه'], [0]),
    prep(8, 'العدد الأصغر من بين العددين -5/4 و -7/4 هو ……', ['-5/4', '-7/4', 'لا يمكن تعيينه'], [1]),
    prep(9, 'قيمة العبارة 7 + 3x من أجل x = 0 هي ……', ['10', '7', '-7/3'], [1], F(7)),
    prep(10, 'قيمة العبارة 8y - 8 من أجل y = 1 هي ……', ['8', '0', '1'], [1], F(0)),
    prep(11, 'العبارة (1 - x) × (1 + x) تبسّط على الشكل ……', ['2', '1 + x²', '1 - x²'], [2]),
    prep(12, 'العبارة (t + 3) × (t - 2) تبسّط على الشكل ……', ['t² + 1', 't² - 6', 't² + t - 6'], [2]),
    prep(13, 'المدوّر إلى الوحدة لحاصل القسمة 135/14 هو ……', ['9,6', '10', '9'], [1]),
    prep(14, 'المدوّر إلى الجزء من 10 لحاصل القسمة 135/14 هو ……', ['9,6', '10', '9'], [0]),
    prep(15, 'شاشة حاسبة: 46 ÷ 6 = 7.666666667. المدوّر إلى الوحدة هو ……؛ إلى 1/10 ……؛ إلى 1/100 ……', ['7,67', '7,7', '8'], [0, 1, 2], note='colonne (1) = 7,67 (1/100), (2) = 7,7 (1/10), (3) = 8 (unité)'),
]
assert q('2/3') > q('-2/3') and q('-7/4') < q('-5/4')
assert rnd(F(135, 14), 0) == 10 and rnd(F(135, 14), 1) == F(96, 10)
assert rnd(F(46, 6), 0) == 8 and rnd(F(46, 6), 1) == F(77, 10) and rnd(F(46, 6), 2) == F(767, 100)
assert [lin(3, 7, 0), lin(8, -8, 1)] == [7, 0]
el('prep', 'prep', 71, 'أستعدّ', 'جد الإجابة الصحيحة (أو الإجابات الصحيحة) في كل حالة، مبرّرا إياها.', verified=True, items=PREP,
   columns='[(1), (2), (3)] ; (1) = colonne de droite', answerSource='computed',
   reading='p. 71 relue à 220 dpi : lignes 1–8 nettes ; 5 « 3 ÷ x = 3 » (x = 1) ; 11 lu « (1 − x)(1 + x) » (seule option cohérente : 1 − x²).')

# ── pp. 72–73 : أنشطة ───────────────────────────────────────────────────────────────────────────────
el('act-1', 'activity', 72, 'أنشطة 1 — المساويات والعمليات',
   'المساويات والجمع: 1) عند أحمد ومريم نفس المبلغ المالي. أضاف أبوهما لكل واحد نفس المبلغ المقدّر بـ 200 DA. قارن بين المبلغين عند كل من الولدين. اشترى كل منهما كتابا بسعر 350 DA. قارن بين المبلغين المتبقيين عندهما. 2) a = b أعداد ناطقة a, b, c : احسب (a + c) − (b + c) ثم قارن بين a + c و b + c ؛ احسب (a − c) − (b − c) ثم قارن بين a − c و b − c. 3) أكمل: « إذا كان a = b فإن a + c … b + c » ؛ « إذا كان a = b فإن a − c … b − c ». المساويات والضرب: 1) a = b : حلّل إلى جداء عاملين ac − bc ؛ احسب الفرق ac − bc ثم قارن بين ac و bc ؛ أكمل « إذا كان a = b فإن ac … bc ». 2) c ≠ 0 : احسب a/c − b/c ثم قارن a/c و b/c ؛ أكمل « … فإن a/c … b/c ».',
   verified=True, answer={'addition': 'a + c = b + c ; a − c = b − c', 'multiplication': 'ac = bc ; a/c = b/c (c ≠ 0)',
                          'money': 'les deux enfants gardent le même montant : (m + 200) − 350 pour chacun'},
   answerSource='computed', figure='aucune',
   note='Posée en APPLICATION (guide §4ter) : le lab de la plateforme est l’entrée conçue.')
el('act-2', 'activity', 72, 'أنشطة 2 — المتباينات والعمليات',
   'المتباينات والجمع: 1) أنقل وأتمم الجدول (a, b, a − b, « قارن بين a و b ») : (3 ; 7), (−5 ; 1), (−2 ; −4), (5 ; −3). 2) أكمل: « إذا كان a … b فإن a − b > 0 » ؛ « إذا كان a … b فإن a − b < 0 ». 3) هل النص صحيح؟ برّر: « a + c < b + c إذا كان a < b ». 4) « a − c < b − c إذا كان a < b ». 5) a < b : أكمل بأحد الرمزين < ، > : a − 7/2 … b − 9/2 ؛ a + 3/5 … b + 6/5 ؛ a − 4 … b − 4 ؛ a + 3 … b + 3.',
   answer={'table': [{'a': a, 'b': b, 'a-b': a - b, 'cmp': '<' if a < b else '>'} for a, b in ((3, 7), (-5, 1), (-2, -4), (5, -3))]},
   answerSource='computed', reading='act-2 5) : les deux premiers compléments comparent des termes de la forme a − 7/2 et b − 9/2 (constantes différentes : aucun symbole sûr).')
el('act-2b', 'activity', 73, 'أنشطة 2 — المتباينات والضرب',
   '1) أتمم الجدول (a, b, c, ac, bc, قارن بين ac و bc) : (1/3 ; 2/5 ; 4), (−1/3 ; −2/9 ; −3), (2/9 ; −4/5 ; 5/4), (−7/3 ; 6/7 ; −1/2). 2) a < b : قارن بين ac و bc. 3) k < l : أكمل بأحد الرمزين: k/(−6) … l/(−6) ؛ k/5 … l/5 ؛ −3k … −3l ؛ 2k … 2l.',
   answer={'rows': [{'ac': frac(q(a) * q(c)), 'bc': frac(q(b) * q(c)), 'cmp': '<' if q(a) * q(c) < q(b) * q(c) else '>' } for a, b, c in (('1/3', '2/5', '4'), ('-1/3', '-2/9', '-3'), ('2/9', '-4/5', '5/4'), ('-7/3', '6/7', '-1/2'))]},
   answerSource='computed')
PERIM = F(107, 10)
el('act-3', 'activity', 73, 'أنشطة 3 — حصر عدد عشري موجب',
   '1) محيط مربع هو P ، مدوّر P إلى الجزء من 10 هو 10,7 (cm). أعط ثلاث قيم ممكنة للعدد P. انقل المستقيم المدرّج (10,5 … 11) ثم حدّد المنطقة التي يقع فيها P. أعط حصرا لقيم P. 2) استعمال حاسبة: 247 ÷ 83 = 2.975903614 ، A = 247/83 : 2 < A < 3 تسمّى حصرا بالعددين الطبيعيين 2 و 3؛ 2 قيمة مقرّبة بالنقصان إلى الوحدة و 3 قيمة مقرّبة بالزيادة. أعط حصرا للعدد A باستعمال قيم مقرّبة بالزيادة وبالنقصان إلى 1/10 ، 1/100 ، 1/1000.',
   answer={'P': '10,65 ≤ P < 10,75', 'A': {'1/10': '2,9 ≤ A < 3', '1/100': '2,97 ≤ A < 2,98', '1/1000': '2,975 ≤ A < 2,976',
                                             'value': str(D(247) / D(83))[:12]}},
   answerSource='computed')
assert floor_k(F(247, 83), 1) == F(29, 10) and floor_k(F(247, 83), 2) == F(297, 100) and floor_k(F(247, 83), 3) == F(2975, 1000)
# act-4 : le nombre choisi par Samir et Leila (x tel que 2(x + 3) ... ) — lecture du scan
# 1) Samir : (x + 3) × 2 ; Leila : x + 7 ; mêmes résultats ⟹ 2x + 6 = x + 7 ⟹ x = 1.   2) Karim : (x + 2) × 5 ; Souad : 2x + 25 ⟹ 5x + 10 = 2x + 25 ⟹ x = 5.
X41 = solve1(2, 6, 1, 7)
X42 = solve1(5, 10, 2, 25)
assert (X41, X42) == (1, 5)
el('act-4', 'activity', 73, 'أنشطة 4 — المعادلات من الدرجة الأولى بمجهول واحد',
   '1) اختار كل من سمير وليلى نفس العدد. أضاف سمير لهذا العدد 3 وضرب النتيجة في 2 ، بينما ليلى أضافت له 7. عند مقارنة النتيجتين تفاجأ بأنهما متساويتان. جد هذا العدد إذا أمكن. 2) اختار كريم وسعاد نفس العدد. أضاف له كريم 2 وضرب النتيجة في 5. ضاعفت سعاد العدد الذي اختارته وأضافت للنتيجة 25. عند مقارنة النتيجتين لاحظا أنهما متساويتان. جد، إذا أمكن، العدد الذي اختاره كل من كريم وسعاد.',
   answer={'1': frac(X41), '2': frac(X42)}, answerSource='computed')

# ── pp. 74, 76 : معارف ──────────────────────────────────────────────────────────────────────────────
el('know-1a', 'knowledge', 74, 'معارف 1 — المساويات والجمع',
   'خاصية: a, b, c أعداد ناطقة. إذا كان a = b فإن a + c = b + c و a − c = b − c. بتعبير آخر: لا تتغير مساواة عندما نضيف إلى (أو نطرح من) طرفيها نفس العدد الناطق. مثال: إذا كان a = −2 فإن a + 13 = 11 و a − 5 = −7.',
   verified=True, answer={'example': [-2 + 13, -2 - 5]}, answerSource='computed')
el('know-1b', 'knowledge', 74, 'معارف 1 — المساويات والضرب',
   'خاصية: a, b, c أعداد ناطقة. إذا كان a = b فإن ac = bc ؛ إذا كان a = b و c ≠ 0 فإن a/c = b/c. بتعبير آخر: لا تتغير مساواة عندما نضرب طرفيها في نفس العدد الناطق أو نقسّم طرفيها على نفس العدد الناطق غير المعدوم. مثال: إذا كان x = 3/2 فإن 5x = 15/2 و x/(−5) = −3/10.',
   verified=True, answer={'example': [frac(5 * F(3, 2)), frac(F(3, 2) / -5)]}, answerSource='computed')
el('know-2a', 'knowledge', 74, 'معارف 2 — المتباينات والجمع',
   'خاصية: إذا كان a < b فإن a + c < b + c و a − c < b − c. لا يتغير اتجاه متباينة عندما نضيف إلى (أو نطرح من) طرفيها نفس العدد الناطق. ملاحظة: يمكن استبدال < بأحد الرمزين ≤ ، ≥ و تبقى الخاصيتان صحيحتين؛ a ≤ b يُقرأ a أصغر أو يساوي b.',
   answer={'example': [str(F(3) + 4)]}, answerSource='computed')
el('know-2b', 'knowledge', 74, 'معارف 2 — المتباينات والضرب',
   'خاصية: إذا كان a < b و c > 0 فإن ac < bc و a/c < b/c. إذا كان a < b و c < 0 فإن ac > bc و a/c > b/c. إذا ضربنا طرفي متباينة في (أو قسمناهما على) نفس العدد الناطق السالب تماما فإننا نغيّر اتجاهها. مثال: z < −4 ⟹ 2z < −8 ؛ x < 15 ⟹ x/(−3) > −5.',
   answer={'example': ['2z < -8', frac(F(15) / -3)]}, answerSource='computed')
el('know-3', 'knowledge', 76, 'معارف 3 — حصر عدد عشري موجب',
   'x عدد عشري موجب مدوّره إلى الوحدة هو 15: لا يمكن أن يساوي 14,4 ولا 15,5 ؛ 14,5 ≤ x < 15,5 هي حصر لكل عدد مدوّره إلى الوحدة هو 15. المدوّر إلى الوحدة للعدد 3,647 هو 4 ؛ المدوّر إلى 1/10 هو 3,6 ؛ المدوّر إلى 1/100 هو 3,65.',
   answer={'3,647': {'unit': 4, '1/10': '3,6', '1/100': '3,65'}}, answerSource='computed',
   reading='معارف 3 : « المدوّر » est ici la valeur approchée par excès ou défaut selon le chiffre suivant ; 3,647 → 4 ; 3,6 (le chiffre suivant est 4) ; 3,65 (le chiffre suivant est 7) — lu tel quel.')
el('know-4', 'knowledge', 76, 'معارف 4 — المعادلات من الدرجة الأولى بمجهول واحد',
   'المعادلة هي مساواة تتضمن عددا أو أعدادا مجهولة معبّر عنها بحروف. مثال: 3x − 1 = 4x + 5 معادلة ذات المجهول x ، طرفها الأيسر 3x − 1 والأيمن 4x + 5. مثال: 5x + 3 = −8x − 1 معادلة من الدرجة الأولى ذات المجهول x. كل معادلة من الشكل ax + b = cx + d حيث a, b, c, d أعداد معلومة و x مجهول واحد تسمّى معادلة من الدرجة الأولى ذات المجهول x. حل معادلة ذات المجهول x يعود إلى تعيين قيمة هذا المجهول التي تحقق المساواة المعطاة. مثلا: −2 ليس حلا للمعادلة 0 = −8x + 4 بينما العدد 1/2 هو حل لها.',
   verified=True, answer={'-2': lin(-8, 4, -2) == 0, '1/2': lin(-8, 4, F(1, 2)) == 0}, answerSource='computed')
el('know-5', 'knowledge', 76, 'معارف 5 — ترييض مشكلة وحلها',
   'ترييض مشكلة وحلها يتطلب المرور على المراحل الآتية: اختيار المجهول، وليكن مثلا x ؛ ترجمة كل المعطيات الواردة في النص بدلالة x ؛ إيجاد معادلة مناسبة تعبّر عن المشكلة ؛ حل المعادلة ؛ التصريح بالحل ؛ التحقق من صحة النتيجة بالعودة إلى نص المشكلة. مثال: عند كريم 500 DA مكوّنة من قطع نقدية من فئتي 50 DA و 100 DA. ما هو عدد القطع من فئة 50 DA إذا علمت أنه يملك 3 قطع من فئة 100 DA؟ 50x + 300 = 500 ، حلها 4.',
   verified=True, answer={'x': frac(solve1(50, 300, 0, 500))}, answerSource='computed')
assert solve1(50, 300, 0, 500) == 4

# ── pp. 75, 77 : طرائق ──────────────────────────────────────────────────────────────────────────────
el('method-1a', 'method', 75, 'طرائق — توظيف خواص المساويات والعمليات (1)',
   'تمرين: x عدد ناطق حيث 3 = 2x − 4. هل المساواتان الآتيتان صحيحتان؟ 2 = 2x − 5 ؛ 2x + 4 = −3. حل: لدينا 3 = 2x − 4. بإضافة −1 إلى طرفي هذه المساواة نجد 3 − 1 = 2x − 4 − 1 أي 2 = 2x − 5 : المساواة صحيحة. بإضافة 8 إلى طرفيها نجد 11 = 2x + 4 : إذن 2x + 4 = −3 غير صحيحة. تعاليق: للتحقق من صحة كل مساواة لاحظ أننا استعملنا خواص المساواة وعمليتي الجمع والطرح.',
   verified=True, answer={'x': frac(solve1(2, -4, 0, 3)), '2x-5=2': True, '2x+4=-3': False, 'value of 2x+4': 11},
   answerSource='computed')
x = solve1(2, -4, 0, 3)
assert lin(2, -5, x) == 2 and lin(2, 4, x) == 11 != -3
el('method-1b', 'method', 75, 'طرائق — توظيف خواص المساويات والعمليات (2)',
   'تمرين: x عدد ناطق حيث 5 = −5x + 1. هل كل مساواة مما يلي صحيحة؟ 21 = −25x + 1 ؛ −1/2 x + 1/10 = 1/2. حل: بضرب طرفي المساواة 5 = −5x + 1 في 5 نجد 25 = −25x + 5 وبإضافة −4 إلى طرفيها نجد 21 = −25x + 1 : صحيحة. بقسمة طرفي 5 = −5x + 1 على 10 نجد ... −1/2 x + 1/10 = 1/2 : صحيحة.',
   verified=True, answer={'x': frac(solve1(-5, 1, 0, 5)), '21=-25x+1': True, '-x/2+1/10=1/2': True}, answerSource='computed',
   reading='La seconde équation du scan est lue « −1/2 x + 1/10 = 1/2 » (÷ 10 de 5 = −5x + 1).')
x2 = solve1(-5, 1, 0, 5)
assert x2 == F(-4, 5) and lin(-25, 1, x2) == 21 and lin(F(-1, 2), F(1, 10), x2) == F(1, 2)
el('method-2', 'method', 75, 'طرائق — توظيف خواص المتباينات والعمليات',
   'تمرين: x عدد ناطق حيث x > 7/5. A = 3x − 2 و B = 5 − 2x. قارن بين A و B من أجل x = 3/2 ثم x = 10. ضع تخمينا حول مقارنة العددين A و B. أثبت صحة هذا التخمين. حل: x = 3/2 : A = 5/2 و B = 2 ؛ x = 10 : A = 28 و B = −15 : A > B. A − B = 5x − 7 ، x > 7/5 إذن 5x > 7 ومنه A − B > 0.',
   answer={'3/2': [frac(lin(3, -2, F(3, 2))), frac(lin(-2, 5, F(3, 2)))], '10': [lin(3, -2, 10), lin(-2, 5, 10)]}, answerSource='computed')
el('now-75-1', 'now', 75, 'دوري الآن — 1', 'x عدد ناطق حيث x < −6. ما هي المتباينة التي يمكن كتابتها من أجل x + 4 ؟ −6x ؟ x/12 ؟', answer={'x+4': '< -2', '-6x': '> 36', 'x/12': '< -1/2'}, answerSource='computed')
el('now-75-2', 'now', 75, 'دوري الآن — 2', 'في كل حالة مما يلي: 7 > x − 8 ؛ −3x > 15 ؛ −x/4 < 9. استعمل خواص المتباينات للحصول على متباينة من الشكل x > … أو x < …', answer={'1': 'x < 15', '2': 'x < -5', '3': 'x > -36'}, answerSource='computed')
el('method-3', 'method', 77, 'طرائق — حصر عدد عشري موجب',
   'تمرين: 1) احصر العدد 4,679 بين عددين طبيعيين متتاليين. 2) عيّن حصرا لهذا العدد باستعمال قيم مقرّبة بالنقصان وبالزيادة إلى 1/10. حل: 4 ≤ 4,679 < 5 ؛ 4,6 ≤ 4,679 < 4,7.', answer={'1': '4 ≤ 4,679 < 5', '2': '4,6 ≤ 4,679 < 4,7'}, answerSource='computed')
x3 = solve1(9, 1, 5, -7)
assert x3 == -2 and lin(9, 1, x3) == -17 == lin(5, -7, x3)
el('method-4', 'method', 77, 'طرائق — حل معادلة من الدرجة الأولى بمجهول واحد',
   'تمرين: حلّ المعادلة 9x + 1 = 5x − 7. حل: 1) نتبع المراحل: نقل كل الحدود التي تتضمن المجهول x إلى الطرف الأيسر للمعادلة (9x + 1 − 5x = 5x − 7 − 5x أي 4x + 1 = −7) ؛ نقل كل الحدود التي لا تتضمن x إلى الطرف الأيمن (4x + 1 − 1 = −7 − 1 أي 4x = −8) ؛ حساب قيمة المجهول (4x/4 = −8/4 ، x = −2). 2) تحقق: 9 × (−2) + 1 = −17 و 5 × (−2) − 7 = −17. 3) الخلاصة: العدد −2 هو حل المعادلة.',
   verified=True, answer={'x': frac(x3), 'both sides at x': [lin(9, 1, x3), lin(5, -7, x3)]}, answerSource='computed')
x5 = solve1(7, -190, 6, 110)
assert x5 == 300 and lin(7, -190, x5) == 1910 and lin(6, 110, x5) == 1910
el('method-5', 'method', 77, 'طرائق — ترييض مشكلة وحلها',
   'تمرين: يريد مدير متوسطة شراء كتب علمية تباع بنفس السعر لوضعها في مكتبة المؤسسة. إذا اشترى 7 كتب، فينقصه 190DA و إذا اشترى 6 كتب، فيبقى عنده 110DA. ما هو سعر الكتاب الواحد؟ حل: نسمّي x سعر الكتاب الواحد. 7x − 190 = 6x + 110 (نفس المبلغ في الحالتين). حل المعادلة 300. التحقق: 7 × 300 − 190 = 1910 و 6 × 300 + 110 = 1910. سعر الكتاب 300 DA.',
   verified=True, answer={'price': '300 DA', 'budget': '1910 DA'}, answerSource='computed')
NOW771 = {t: rnd(q(t), 2) == q('8,34') for t in ('8,342', '8,336', '8,345')}
assert NOW771 == {'8,342': True, '8,336': True, '8,345': False}, NOW771  # 8,345 → 8,35 (demi vers le haut)
assert (q('8,335') <= q('8,342') < q('8,345')) and (q('8,335') <= q('8,336') < q('8,345')) and not (q('8,335') <= q('8,345') < q('8,345'))
el('now-77-1', 'now', 77, 'دوري الآن — 1', 'a ، 8,34 هو المدوّر إلى الجزء من 100 للعدد a. هل يمكن أن يكون a يساوي 8,342 ؟ 8,336 ؟ 8,345 ؟ أعط حصرا للعدد a باستعمال قيمتين تقريبيتين إلى الجزء من 100 للعدد a.',
   answer={'8,342': True, '8,336': True, '8,345': False, 'range': '8,335 ≤ a < 8,345'}, answerSource='computed',
   reading='Recalculé le 2026-10-26 (corrige la transcription brève) : 8,342 et 8,336 arrondissent à 8,34 (oui) ; 8,345 arrondit à 8,35 (non, demi vers le haut) ; encadrement 8,335 ≤ a < 8,345. Les valeurs sont lues sur le scan p. 77 par la leçon hasr-adad-ushri.')
AGE = solve1(1, 42, 3, 12 * 3)
el('now-77-2', 'now', 77, 'دوري الآن — 2', 'عُمر أب هو 42 سنة و عُمر ابنه هو 12 سنة. بعد كم سنة يكون عُمر الأب ثلاث أضعاف عُمر ابنه؟', verified=True, answer={'years': frac(solve1(1, 42, 3, 36))}, answerSource='computed')
assert solve1(1, 42, 3, 36) == 3 and 42 + 3 == 3 * (12 + 3)

# ── pp. 78–80 : أوظّف تعلّماتي ──────────────────────────────────────────────────────────────────────
el('ex-1', 'exercise', 78, 'أوظّف تعلّماتي — 1', 'x عدد ناطق. أكمل: إذا كان x = 24 فإن x + 6 = … ؛ x = −3 فإن x − 4 = … ؛ x = 0 فإن 2x + 8 = … ؛ x = 1/2 فإن 4x − 1/2 = …',
   verified=True, answer=[frac(24 + 6), frac(-3 - 4), frac(8), frac(4 * F(1, 2) - F(1, 2))], answerSource='computed')
el('ex-2', 'exercise', 78, 'أوظّف تعلّماتي — 2', 'a عدد ناطق. أكمل: إذا كان 3a − 4 = 0 فإن a = … ؛ −2a + 1 = −1 فإن a = … ؛ 5a = −a + 2 فإن a = … ؛ 7a − 3 = 7 − 3a فإن a = …',
   verified=True, answer=[frac(solve1(3, -4, 0, 0)), frac(solve1(-2, 1, 0, -1)), frac(solve1(5, 0, -1, 2)), frac(solve1(7, -3, -3, 7))], answerSource='computed')
el('ex-3', 'exercise', 78, 'أوظّف تعلّماتي — 3', 'صحيح أو خاطئ: إذا كان 3x = 4 فإن x = 1 ؛ إذا كان 17 − x = 0 فإن x = 17 ؛ إذا كان 8x = 8 فإن x = 0 ؛ إذا كان 2 − 5x = 0 فإن x = 2/5',
   verified=True, answer=[solve1(3, 0, 0, 4) == 1, solve1(-1, 17, 0, 0) == 17, solve1(8, 0, 0, 8) == 0, solve1(-5, 2, 0, 0) == F(2, 5)], answerSource='computed',
   reading='p. 78 relue à 200 dpi.')
el('ex-4', 'exercise', 78, 'أوظّف تعلّماتي — 4', 'اكتب المساواة التي تتحصل عليها عندما تضرب طرفي المساواة 2 = 2x − 5 في العدد −3 ؛ ثم طرفي المساواة 1 = 3x − 15 (لا يُقرأ بوضوح : −15 + 3x = 1) في العدد −1.',
   verified=True, answer={'1': '-6 = -6x + 15', '2': '-1 = -3x + 15'}, answerSource='computed',
   reading='« 3x − 15 + 1 = … » : le scan imprime « −15 + 3x = 1 » ; lu ainsi.')
el('ex-5', 'exercise', 78, 'أوظّف تعلّماتي — 5', 'x عدد نسبي حيث 2x = −1. أكمل كل مساواة: −4x = … ؛ x − 3 = … ؛ 2x + 5 = … ؛ −5/2 x + 5/2 = … ؛ x/2 − 1 = … ؛ x + 1/2 = …',
   verified=True, answer=[frac(-4 * F(-1, 2)), frac(F(-1, 2) - 3), frac(2 * F(-1, 2) + 5), frac(F(-5, 2) * F(-1, 2) + F(5, 2)), frac(F(-1, 2) / 2 - 1), frac(F(-1, 2) + F(1, 2))], answerSource='computed')
for i, (idn, txt) in enumerate([
    ('ex-6', 'x عدد ناطق. أكمل: إذا كان x > 10 فإن x − 10 > … ؛ x < −3 فإن x + 3 < … ؛ x ≥ −2 فإن x + 2 ≥ … ؛ x ≤ 1/2 فإن x − 1/2 ≤ …'),
    ('ex-7', 'm عدد ناطق، أكمل: إذا كان m ≥ 0 فإن 5m ≥ … ؛ m ≤ 0 … ؛ m − 1 ≤ 0 … ؛ 1 + 4m > 0 … ؛ 3 − 2m < 0 …'),
    ('ex-8', 'قارن بين العددين الناطقين 6/5 و 5/4.'),
    ('ex-9', 'قارن بين العددين الناطقين a و b في كل حالة: أ) a = 4/3 ، b = −9/14 ؛ ب) …'),
    ('ex-10', 'تحصلت ليلى على علامتين في الرياضيات، إحداهما ثلاثة أخماس والأخرى إحدى عشرة على عشرين. أي علامة أكبر؟'),
    ('ex-11', 'إذا كان a عددا أصغر من 2000، فما الذي يمكن قوله عن العدد a + 18 ؟'),
    ('ex-12', 'إذا كان x عددا أكبر من أو يساوي 5، فما الذي يمكن قوله عن العدد x − 10 ؟'),
    ('ex-13', 'm عدد نسبي حيث m > 3. استنتج متباينة يحققها كل عدد مما يلي: m + 3 ؛ m − 3 ؛ −5 + m ؛ 3m ؛ −3m ؛ −1/4 m + 4'),
    ('ex-14', 'x عدد ناطق حيث −2x + 3 ≤ 18. استنتج متباينة يكون فيها x هو الحد الأول.'),
    ('ex-15', 'y عدد ناطق حيث 3y + 5 ≤ −5. استنتج متباينة يكون فيها y هو الحد الأول.'),
    ('ex-16', 'z عدد ناطق حيث −2z ≥ −7. استنتج متباينة يكون فيها z هو الحد الأول.'),
    ('ex-17', 'انقل وأكمل: إذا كان a ≥ b فإن a … b ؛ … '),
    ('ex-18', 'a و b عددان ناطقان. انقل وأكمل: إذا كان a ≥ b فإن 7a … 7b ؛ إذا كان a > b فإن −2/5 a … −2/5 b ؛ …')]):
    el(idn, 'exercise', 78 if int(idn[3:]) <= 17 else 79, f'أوظّف تعلّماتي — {idn[3:]}', txt, reading='transcription brève (leçon mutabayinat-amaliyat à relire)')
for i in range(19, 29):
    el(f'ex-{i}', 'exercise', 79, f'أوظّف تعلّماتي — {i} (حصر عدد عشري موجب)',
       {19: 't عدد عشري موجب حيث 1 ≤ t ≤ 3 : أعط حصرا لكل عبارة: t + 10 ؛ 3t − 1 ؛ 1/2 t ؛ 14/3 t − 2.',
        20: 'أثبت أنّ 17/19 < 1 < 19/17.', 21: 'استعمل حاسبة لإثبات أنّ 3 + 10/71 < π < 3 + 1/7.', 22: 'أثبت أنّ 2/5 < 33/50 < 3/4.',
        23: 'x هو طول ضلع معيّن 3 < x < 8 (cm). عيّن حصرا لمحيط هذا المعيّن.',
        24: 'ABC مثلث متقايس الأضلاع محيطه P محصور بين 5cm و 6cm. عيّن حصرا لطول ضلع هذا المثلث.',
        25: 'a ، b ، c أعداد عشرية حيث a = 5,12 ؛ b = 5,3 ؛ c = 5,115. أثبت أنّ c < a < b.',
        26: 'x عدد عشري حيث 1 ≤ 2x + 1 < 3. استنتج حصرا للعدد x.',
        27: 'طول ملعب كرة القدم محصور بين 100m و 110m وعرضه محصور بين 64m و 75m. علما أن الملعب مستطيل الشكل، عيّن حصرا لمساحة هذا الملعب.',
        28: 'الشكل متوازي مستطيلات 5cm × 3cm × h. 1) عيّن حصرا للارتفاع h علما أن المدوّر إلى الجزء من 100 لـ h هو 5,41. 2) استنتج حصرا للحجم V.'}[i],
       reading='transcription brève (leçon hasr-adad-ushri à relire)')
el('ex-29', 'exercise', 79, 'أوظّف تعلّماتي — 29 (المعادلات)', 'انقل وأتمم: إذا كانت 0 = x + 8 فإن x = … ؛ −2x = 0 فإن x = … ؛ x/2 = 1 فإن x = … ؛ 4x − 4 = 0 فإن x = …',
   answer=[frac(solve1(1, 8, 0, 0)), frac(solve1(-2, 0, 0, 0)), frac(solve1(F(1, 2), 0, 0, 1)), frac(solve1(4, -4, 0, 0))], answerSource='computed',
   reading='transcription brève ; les quatre lignes sont lues « 0 = x + 8 », « 0 = −2x », « x/2 = 1 », « 0 = 4x − 4 ».')
el('ex-30', 'exercise', 79, 'أوظّف تعلّماتي — 30', 'تحقق إن كانت المعادلة الآتية من الدرجة الأولى بمجهول واحد. برّر إجابتك: 3x + 1/2 = 7 − 2x', answer=True, answerSource='computed')
el('ex-31', 'exercise', 79, 'أوظّف تعلّماتي — 31', 'تحقق إن كانت المعادلة الآتية من الدرجة الأولى بمجهول واحد: −2(x + 1/2) = 3x + 4 − 5x', answer={'first degree': False, 'reason': 'les x s’annulent : −2x − 1 = −2x + 4'}, answerSource='computed')
el('ex-32', 'exercise', 79, 'أوظّف تعلّماتي — 32', 'هل العدد 0 هو حل للمعادلة 2x + 1 = 3x − 5 ؟', answer=lin(2, 1, 0) == lin(3, -5, 0), answerSource='computed')
el('ex-33', 'exercise', 79, 'أوظّف تعلّماتي — 33', 'هل العدد −1 هو حل للمعادلة −m − 2 = 2m + 1 ؟', answer=lin(-1, -2, -1) == lin(2, 1, -1), answerSource='computed')
el('ex-34', 'exercise', 79, 'أوظّف تعلّماتي — 34',
   'حلّ كل معادلة من المعادلات الآتية: x − 5 = 6 ؛ 3 + x = 8,4 ؛ −30x = 90 ؛ 4x = x + 4 ؛ −x/3 = 3 ؛ 7x = 2,8 ؛ 11x + 5 = 4x + 9 ؛ 3x − 5 = 5 − 3x',
   answer=[frac(solve1(1, -5, 0, 6)), fr(solve1(1, 3, 0, q('8,4'))), frac(solve1(-30, 0, 0, 90)), frac(solve1(4, 0, 1, 4)), frac(solve1(F(-1, 3), 0, 0, 3)), fr(solve1(7, 0, 0, q('2,8'))),
           frac(solve1(11, 5, 4, 9)), frac(solve1(3, -5, -3, 5))], answerSource='computed')
el('ex-35', 'exercise', 79, 'أوظّف تعلّماتي — 35', 'عند ليلى 27 زهرة، هي تعلم أن لديها 5 زهرات زائدة عن ضعف عدد الأزهار الموجودة عند مريم. 1) اكتب معادلة تترجم بها هذه الوضعية. 2) جد عدد الأزهار الموجودة عند مريم.',
   answer={'equation': '2x + 5 = 27', 'x': frac(solve1(2, 5, 0, 27))}, answerSource='computed')
el('ex-36', 'exercise', 80, 'أوظّف تعلّماتي — 36', 'نعتبر المعادلة 4x − 8 = 2x + 3. 1) تصوّر وضعية يمكن ترجمتها بالمعادلة السابقة. 2) حلّ هذه المعادلة.', answer={'x': frac(solve1(4, -8, 2, 3))}, answerSource='computed')
el('ex-37', 'exercise', 80, 'أوظّف تعلّماتي — 37', 'المحيط P للمستطيل يعطى بالصيغة P = 2L + 2ℓ. 1) انقل وأكمل 2L = … 2) عبّر عن L بدلالة P و ℓ. 3) احسب L إذا كان P = 31cm و ℓ = 6,4cm.',
   answer={'L': fr(F(31, 2) - q('6,4'))}, answerSource='computed')
el('ex-38', 'exercise', 80, 'ترييض مشكلات — 38', 'مجموع ثلاثة أعداد طبيعية متتابعة هو 30. ما هي هذه الأعداد؟', answer=[9, 10, 11], answerSource='computed')
assert 9 + 10 + 11 == 30
el('ex-39', 'exercise', 80, 'ترييض مشكلات — 39', 'مجموع ثلاثة أعداد صحيحة متتابعة هو −12. ما هي هذه الأعداد؟', answer=[-5, -4, -3], answerSource='computed')
assert -5 - 4 - 3 == -12
el('ex-40', 'exercise', 80, 'ترييض مشكلات — 40', 'يقول سمير: أفكر في عدد، أضفت 21 إلى ضعفه، إني أجد نفس النتيجة إذا طرحت 13 من ثلاثة أضعاف هذا العدد. ما هو العدد الذي فكر فيه سمير؟',
   answer=frac(solve1(2, 21, 3, -13)), answerSource='computed')
assert solve1(2, 21, 3, -13) == 34
el('ex-41', 'exercise', 80, 'ترييض مشكلات — 41', 'ABC مثلث. أحسب قيسي الزاويتين ACB و BAC (الزاوية B = 83°, A = 2x, C = x) 1) ذهنيا 2) بكتابة معادلة ثم حلها.',
   answer={'x': frac(solve1(3, 83, 0, 180))}, answerSource='computed', reading='angles 2x, x et 83° : 3x + 83 = 180 → x = 97/3 (≈ 32,33°) ; lecture du scan à confirmer')
el('ex-42', 'exercise', 80, 'ترييض مشكلات — 42', 'في مثلث قائم، قيس زاوية حادة منه هو ثلاثة أضعاف قيس الزاوية الحادة الأخرى. ما هو قيس الزاوية الحادة الأصغر (بالدرجة)؟ استنتج قيس الزاوية الحادة الأكبر.',
   answer={'small': frac(solve1(4, 0, 0, 90)), 'big': frac(3 * solve1(4, 0, 0, 90))}, answerSource='computed')
el('ex-43', 'exercise', 80, 'ترييض مشكلات — 43', 'ABC مثلث أنجزته باليد الحرة (A = 3x ، B = 2x ، C = x). عيّن قيس زوايا هذا المثلث.', answer={'x': frac(solve1(6, 0, 0, 180))}, answerSource='computed')
el('ex-44', 'exercise', 80, 'ترييض مشكلات — 44', 'طول مستطيل هو ثلاثة أضعاف عرضه، جد بعدي هذا المستطيل إذا علمت أن محيطه هو 168m.', answer={'width': frac(solve1(8, 0, 0, 168))}, answerSource='computed')
el('ex-45', 'exercise', 80, 'ترييض مشكلات — 45', 'ABC مثلث أضلاعه x − 2 ، x ، x + 2 . جد x إذا علمت أن محيط هذا المثلث يساوي 90cm.', answer={'x': frac(solve1(3, 0, 0, 90))}, answerSource='computed')
el('ex-46', 'exercise', 80, 'ترييض مشكلات — 46', 'عندما نضيف 20cm إلى طول مستطيل، تزداد مساحته بـ 250 cm². ما هو عرض هذا المستطيل؟', answer={'width': frac(F(250, 20))}, answerSource='computed')
el('ex-47', 'exercise', 80, 'ترييض مشكلات — 47', 'ABCD مستطيل عرضه 50cm، جد x إذا علمت أن مساحة هذا المستطيل هي 280 cm².', answer={'x': frac(F(280, 50))}, answerSource='computed', reading='figure : segment x ; lecture à confirmer')
el('ex-48', 'exercise', 80, 'ترييض مشكلات — 48', 'لاحظ الرسم المقابل. محيط المستطيل هو نفس محيط المثلث متقايس الأضلاع. جد x.', reading='figure d’un triangle équilatéral (côté 5, x) et d’un rectangle', answer='à lire sur la figure')
el('ex-49', 'exercise', 80, 'ترييض مشكلات — 49', 'اشترى رضا من المكتبة 5 كراريس و 3 أقلام و دفع له 420DA. إذا علمت أن سعر الكراس الواحد يبلغ خمسة أضعاف سعر القلم الواحد، ماهو سعر كل كراس و كل قلم بالدينار؟',
   answer={'pen': frac(solve1(28, 0, 0, 420)), 'notebook': frac(5 * solve1(28, 0, 0, 420))}, answerSource='computed')
assert 5 * 75 + 3 * 15 == 420
el('ex-50', 'exercise', 82, 'أتعمّق — 50', 'يبلغ عمر رجل 45 سنة بينما يبلغ عمر ابنه فيفضل 6 سنوات. بعد كم سنة يكون عمر الأب ضعف عمر ابنه؟', answer=frac(solve1(1, 45, 2, 12)), answerSource='computed',
   reading='« عمر ابنه 6 سنوات » : lu « ابنه 6 ans » (45 + n = 2(6 + n) → n = 33)')
el('ex-51', 'exercise', 82, 'أتعمّق — 51', 'يبلغ عمر سامية ثلث عمر أمها بينما يبلغ عمر أم سامية نصف عمر أمها (جدتها). إذا علمت أن مجموع أعمار سامية وأمها وجدتها هو 110 سنوات، فما هو عمر سامية؟', answer={'samia': frac(F(110) / (1 + 3 + 6))}, answerSource='computed')
assert F(110, 10) == 11
el('ex-52', 'exercise', 82, 'أتعمّق — 52', 'يريد فلاح تكبير حقله بالاعتماد على التصميم (80m × 100m + x). ما قيمة العدد x إذا علمت أن هذا الفلاح يملك 150m من السياج؟', answer='à lire sur la figure', reading='figure : 80 × 100, extension x')
el('ex-53', 'exercise', 82, 'أتعمّق — 53', 'ABC مثلث متساوي الساقين في A حيث BC = 7cm. نسمي x طول الضلع [AC]. ما هو الشرط الذي يجب أن يحققه x حتى يكون الشكل ممكنا؟ احسب x إذا علمت أن محيط ABC يساوي 16cm.', answer={'x': fr(F(16 - 7, 2))}, answerSource='computed')
el('ex-54', 'exercise', 82, 'أتعمّق — 54', 'مساحة الشكل ABCDE هي 1161 cm². استعمل المعطيات على الشكل لإيجاد الطول AB.', answer='à lire sur la figure', reading='figure : 43 cm ; transcription brève')
el('ex-55', 'exercise', 82, 'أتعمّق — 55', 'تضمنت مسابقة اختبارات في ثلاث مواد: الرياضيات والعلوم الفيزيائية واللغة العربية مع العلم أن معامل الرياضيات هو 4 ومعامل العلوم الفيزيائية هو 2 ومعامل اللغة العربية هو 5. تحصلت عائشة على 12 من 20 في الرياضيات و 11 من 20 في العلوم الفيزيائية. ما هي العلامة التي تحصلت عليها في اللغة العربية إذا علمت أن معدلها بلغ 11,5 ؟',
   answer={'arabic': fr((q('11,5') * 11 - 4 * 12 - 2 * 11) / 5)}, answerSource='computed')
assert (4 * 12 + 2 * 11 + 5 * q('11,3')) / 11 == q('11,5')
el('ex-56', 'exercise', 82, 'أتعمّق — 56', 'تحصلت خديجة على معدل 13,5 من 20 في 3 فروض في الرياضيات. ما هي العلامة التي ينبغي أن تتحصل عليها في الفرض القادم حتى يبلغ معدلها 14 من 20 ؟', answer=fr(solve1(1, 3 * q('13,5'), 0, 4 * 14)), answerSource='computed')
assert 3 * q('13,5') + 15.5 == 56
el('ex-57', 'exercise', 82, 'أتعمّق — 57', 't = 5/9 × (T − 32). ما هي الدرجة (°F) التي سيسجلها المحرار إذا كانت الدرجة المسجلة (°C) هي 25 ؟', answer=frac(F(25) * F(9, 5) + 32), answerSource='computed')
assert F(25) * F(9, 5) + 32 == 77
el('ex-58', 'exercise', 82, 'أتعمّق — 58', 'لاحظ أن المسلكين الأسود والأحمر يؤديان إلى نفس العبارة (× 4 ثم + 27 ؛ × 7). ما هي الأعداد التي نسجلها في الأقراص الثلاثة ؟', answer={'start': frac(solve1(4, 27, 7, 0))}, answerSource='computed')
assert solve1(4, 27, 7, 0) == 9
el('ex-59', 'exercise', 83, 'أتعمّق — 59', 'ABC مثلث والشكل الملوّن بالأحمر هو مربع (x ، 6cm). جد العدد x حتى يكون للمربع الأحمر والمثلث ABC نفس المساحة.', answer='à lire sur la figure')
el('ex-60', 'exercise', 83, 'أتعمّق — 60', 'لاحظ الشكل الآتي (cm): مستطيل 5 × 12 وجانب مربع. عيّن العدد x حتى يكون للمربع والمستطيل نفس المحيط.', answer='à lire sur la figure')
el('ex-61', 'exercise', 83, 'أتعمّق — 61', 'يقول بائع الأزهار لسمير: «أقترح عليك باقة من 9 أزهار حتى يبقى عندك 14DA. للحصول على باقة من 11 زهرة اعلم أنه ينقصك 36DA». حدّد سعر الزهرة الواحدة.',
   answer=frac(solve1(9, 14, 11, -36)), answerSource='computed')
assert solve1(9, 14, 11, -36) == 25 and 9 * 25 + 14 == 11 * 25 - 36
el('ex-62', 'exercise', 83, 'أتعمّق — 62', 'مسبح دائري نصف قطر قاعدته 2,5m. احسب القيمة المضبوطة لمحيط قاعدة المسبح. عيّن حصرا لمحيط هذه القاعدة إذا علمت أن 3,14 < π < 3,15.', answer={'exact': '5π', 'bounds': '15,7 < P < 15,75'}, answerSource='computed')
el('ex-63', 'exercise', 83, 'أتعمّق — 63', 'لاحظ الشكل: مربعان (x + 2) و x . عبّر بدلالة x عن مساحة الجزء الملوّن. احسب مساحة هذا الجزء من أجل x = 3.', answer={'area': '4x + 4', 'x=3': 4 * 3 + 4}, answerSource='computed', reading='(x + 2)² − x² = 4x + 4')
el('ex-64', 'exercise', 83, 'أتعمّق — 64', 'قرّر صاحب محل تجاري تهيئته حسب التصميم (10m × 5m ؛ ورشة 1 عرضها 2m ؛ ورشة 2 عرضها x). كيف يجب اختيار عرض الورشة 1 حتى يكون للورشتين 1 و 2 نفس المساحة ؟', answer='à lire sur la figure')
el('ex-65', 'exercise', 83, 'أتعمّق — 65', 'تريد إكمالية تنظيم رحلة لصالح التلاميذ إلى حديقة الحيوانات. إذا ساهم كل مشارك بمبلغ 80DA فينقص 1620DA لتسديد مبلغ كلفة السفر، وإذا ساهم كل مشارك بمبلغ 120DA فيتعدّى مبلغ المساهمة مبلغ كلفة السفر بـ 540DA. ما هو عدد التلاميذ؟',
   answer={'n': frac(solve1(80, 1620, 120, -540)), 'cost': frac(lin(80, 1620, solve1(80, 1620, 120, -540)))}, answerSource='computed')
assert solve1(80, 1620, 120, -540) == 54 and 80 * 54 + 1620 == 120 * 54 - 540 == 5940

# ── p. 81 : أؤكّد تعلّماتي ──────────────────────────────────────────────────────────────────────────
el('self-1', 'self', 81, 'أؤكّد تعلّماتي — 1', 'a عدد ناطق. أكمل: إذا كان a = −2 فإن a + 2 = …', verified=True, answer=frac(-2 + 2), answerSource='computed', retour='74')
el('self-2', 'self', 81, 'أؤكّد تعلّماتي — 2', 'b عدد ناطق. أكمل: إذا كان 0 = 5 − 3b فإن b = …', verified=True, answer=frac(solve1(-3, 5, 0, 0)), answerSource='computed', retour='74')
el('self-3', 'self', 81, 'أؤكّد تعلّماتي — 3', 'x عدد ناطق. أكمل: إذا كان x < −3 فإن −x > …', answer=frac(3), answerSource='computed', retour='74 و 75')
el('self-4', 'self', 81, 'أؤكّد تعلّماتي — 4', 'y عدد ناطق. أكمل: إذا كان 2y − 2 ≥ 4 فإن y ≥ …', answer=frac(3), answerSource='computed', retour='74 و 75')
el('self-5', 'self', 81, 'أؤكّد تعلّماتي — 5', 'عيّن المدوّر إلى الوحدة لحاصل القسمة 136/14. احصر هذا العدد بين عددين طبيعيين متتاليين.', answer={'rounded': 10, 'bracket': '9 ≤ 136/14 < 10'}, answerSource='computed', retour='76 و 77')
assert rnd(F(136, 14), 0) == 10 and 9 <= F(136, 14) < 10
el('self-6', 'self', 81, 'أؤكّد تعلّماتي — 6', 'أفكر في عدد. أضربه في 7 وأجد 4. ما هو هذا العدد؟', verified=True, answer=frac(F(4, 7)), answerSource='computed', retour='76 و 77')
el('self-7', 'self', 81, 'أؤكّد تعلّماتي — 7', 'احسب قيمة العبارة 13y − 4 من أجل y = −2. ما هي قيمة هذه العبارة من أجل y = 4/13 ؟', verified=True, answer=[frac(lin(13, -4, -2)), frac(lin(13, -4, F(4, 13)))], answerSource='computed', retour='75')
el('self-8', 'self', 81, 'أؤكّد تعلّماتي — 8', 'هل العدد 5 هو حل للمعادلة 2x − 7 = 3x + 11 ؟', verified=True, answer=lin(2, -7, 5) == lin(3, 11, 5), answerSource='computed', retour='76 و 77')
el('self-9', 'self', 81, 'أؤكّد تعلّماتي — 9', 'هل للمعادلتين 5x − 3 = 0 و 2x + 1 = −3x + 4 نفس الحل؟', verified=True, answer=solve1(5, -3, 0, 0) == solve1(2, 1, -3, 4), answerSource='computed', retour='76 و 77')
el('self-10', 'self', 81, 'أؤكّد تعلّماتي — 10', 'حل المعادلة: 2x − 1 = 3x + 5.', verified=True, answer=frac(solve1(2, -1, 3, 5)), answerSource='computed', retour='76 و 77')
el('self-11', 'self', 81, 'أؤكّد تعلّماتي — 11', 'لاحظ الشكل المقابل: قطعة طولها 36 مقسّمة بعلامات (x ثم أقسام متساوية). عيّن العدد x.', verified=False, answer='à lire sur la figure', retour='76 و 77')
el('self-12', 'self', 81, 'أؤكّد تعلّماتي — 12', 'لاحظ الشكل (الوحدة 1cm): مثلث أضلاعه 5 ، 8 ، x + 2. عيّن x إذا علمت أن محيط المثلث هو 22cm.', verified=True, answer=frac(solve1(1, 15, 0, 22)), answerSource='computed', retour='76 و 77',
   reading='les côtés sont lus 5, 8 et x + 2 (périmètre 22 → x = 7)')
assert 5 + 8 + 7 + 2 == 22
el('self-13', 'self', 81, 'أؤكّد تعلّماتي — 13', 'لاحظ الشكل المقابل (مثلث بزاوية 70° وضلعين متقايسين وزاوية قائمة). عيّن العدد a.', verified=False, answer='à lire sur la figure', retour='76 و 77')

# ── pp. 84–85 : أدمج تعلّماتي, تقويم, تكنولوجيات ───────────────────────────────────────────────────
T_CATCH = solve1(50, 0, 45, 1)
el('integration', 'integration', 84, 'أدمج تعلّماتي — وضعية',
   'في منافسة سباق الدراجات، انطلق دراج بسرعة متوسطة قدرها 50km/h وهو يتابع دراجا آخر انطلق قبله بسرعة متوسطة قدرها 45km/h. ما هي المدة الزمنية اللازمة لهذا الدراج للالتحاق بمنافسه إذا علمت أن المسافة التي كانت تفصلهما عند الانطلاق هي 1km ؟ ما هي المسافة التي يقطعها الدراجان عندما يلتحق الدراج الثاني بالدراج الأول؟ تحليل: المجهول t الزمن؛ 50 × t = 45 × t + 1 ؛ t = 1/5 h = 12 min ؛ المسافة 10 km.',
   answer={'t': 'قيمة 1/5 h = 12 min', 'distance': frac(F(50) * T_CATCH) + ' km'}, answerSource='computed')
assert T_CATCH == F(1, 5) and 60 * T_CATCH == 12
MASS = solve1(15, 25, 10, 150)
el('evaluation', 'integration', 84, 'وضعية للتقويم',
   'تحمل سيارة 15 كيسا من الفرينة و 25kg من السكر، وتحمل سيارة أخرى 10 أكياس مماثلة من الفرينة و 150kg من السكر. يقول إحدى السائقين للآخر: «إن السيارتين تحملان نفس الكتلة من السلع». ماهي كتلة كل كيس من الفرينة؟',
   answer={'sack': frac(MASS) + ' kg'}, answerSource='computed')
assert MASS == 25
el('ict', 'ict', 85, 'أوظّف تكنولوجيات الإعلام والاتصال — جيوجبرا',
   'حل معادلات أو متراجحات باستعمال جيوجبرا. مسألة: [KL] قطعة طولها 10cm، M نقطة متحركة عليها. كيف يجب اختيار طول ضلع المربع KMNP حتى يكون لهذا المربع والمثلث المتقايس الأضلاع MLS نفس المحيط؟ تمرين: نفس العملية بتعويض المربع KMNL بمستطيل حيث KM = 2LP.',
   answer={'KM': frac(solve1(4, 0, -3, 30)) + ' (4 KM = 3(10 − KM))', 'rect': 'KM = 2LP : 6 KM/2... à relire'},
   answerSource='computed', reading='4m = 3(10 − m) → m = 30/7 ≈ 4,29')
assert solve1(4, 0, -3, 30) == F(30, 7)

# ── mutabayinat-amaliyat : relecture 2026-10-26 (pages 71–75, 78–79, 81 rendues à 170 dpi ; p. 75 « دوري الآن » à 400–600 dpi) ──────
def patch(id, **kw):
    e = next(x for x in E if x['id'] == id)
    e.update(kw)
    e['verified'] = True
    return e


def sym(x, y):
    return '<' if x < y else '>' if x > y else '='


GRID = [F(n, d) for d in (1, 2, 3, 5) for n in range(-12, 13)]
PAIRS = [(a, b) for a in GRID for b in GRID]

# act-2 : tableau a, b, a − b ; 2) ; 3)–4) vrais ; 5) a − 7/2 … b − 9/2 INDÉCIDABLE, a + 3/5 … b + 6/5 « < », a − 4 « < », a + 3 « < »
for a, b in ((3, 7), (-5, 1), (-2, -4), (5, -3)):
    assert (a - b > 0) == (a > b)
assert all((a + c < b + c) and (a - c < b - c) for a, b in PAIRS if a < b for c in (F(-7, 2), F(3, 5), F(-4), F(3)))
und = {sym(a - F(7, 2), b - F(9, 2)) for a, b in PAIRS if a < b}
assert und == {'<', '=', '>'}, und      # (a − 7/2) − (b − 9/2) = (a − b) + 1 : signe inconnu → aucun symbole sûr
assert all(a + F(3, 5) < b + F(6, 5) for a, b in PAIRS if a < b)   # a + 3/5 < b + 3/5 < b + 6/5
assert all(a - 4 < b - 4 and a + 3 < b + 3 for a, b in PAIRS if a < b)
patch('act-2', reading='act-2 relue à 170 dpi (pp. 72–73). Partie 5 (p. 73, en haut) : « a − 7/2 … b − 9/2 ؛ a + 3/5 … b + 6/5 ؛ a − 4 … b − 4 ؛ a + 3 … b + 3 » avec « أكمل، إن أمكن ». La table est en 72, les parties 1)–4) y finissent, la partie 5) est en 73.',
      answer={'table': [{'a': a, 'b': b, 'a-b': a - b, 'cmp': sym(a, b)} for a, b in ((3, 7), (-5, 1), (-2, -4), (5, -3))],
              '2': ['>', '<'], '3': True, '4': True,
              '5': {'a-7/2 … b-9/2': 'indécidable (a−b)+1 de signe inconnu : peut être <, = ou >', 'a+3/5 … b+6/5': '<', 'a-4 … b-4': '<', 'a+3 … b+3': '<'}})

# act-2b : tableau ac / bc et k < l
ROWS = (('1/3', '2/5', '4'), ('-1/3', '-2/9', '-3'), ('2/9', '-4/5', '5/4'), ('-7/3', '6/7', '-1/2'))
for a, b, c in ROWS:
    assert sym(q(a) * q(c), q(b) * q(c)) == (sym(q(a), q(b)) if q(c) > 0 else sym(q(b), q(a)))   # ac et bc : même sens si c > 0, sens contraire si c < 0
assert all(sym(k / -6, l / -6) == '>' and sym(k / 5, l / 5) == '<' and sym(-3 * k, -3 * l) == '>' and sym(2 * k, 2 * l) == '<' for k, l in PAIRS if k < l)
patch('act-2b', answer={'rows': [{'ac': frac(q(a) * q(c)), 'bc': frac(q(b) * q(c)), 'cmp': sym(q(a) * q(c), q(b) * q(c))} for a, b, c in ROWS],
                        '2': 'a < b : ac < bc si c > 0, ac > bc si c < 0', '3': ['>', '<', '>', '<']},
      reading='act-2b relue à 170 dpi (p. 73) : les quatre lignes (1/3 ; 2/5 ; 4), (−1/3 ; −2/9 ; −3), (2/9 ; −4/5 ; 5/4), (−7/3 ; 6/7 ; −1/2) confirmées ; k/(−6), k/5, −3k, 2k.')

# know-2a / know-2b : exemples du manuel (p. 74)
assert 3 + 4 == 7 and F(3) - F(1, 2) == F(5, 2)
patch('know-2a', answer={'example': ['y < 3 ⟹ y + 4 < 7', 'y − 1/2 < 5/2'], 'readings': ['≤ : أصغر أو يساوي', '≥ : أكبر أو يساوي', '< : أصغر تماما', '> : أكبر تماما']},
      reading='p. 74 relue à 170 dpi : exemples y < 3 ⟹ y + 4 < 7 et y − 1/2 < 5/2 ; remarque sur ≤ ≥ et lectures « أصغر / أكبر (تماما) ».')
assert 2 * -4 == -8 and F(15) / -3 == -5
patch('know-2b', answer={'example': ['z < -4 ⟹ 2z < -8', 'x < 15 ⟹ x/(-3) > ' + frac(F(15) / -3)]}, reading='p. 74 relue à 170 dpi : c > 0 conserve ; c < 0 renverse (ac > bc et a/c > b/c).')

# method-2 : x > 7/5, A = 3x − 2, B = 5 − 2x
assert (lin(3, -2, F(3, 2)), lin(-2, 5, F(3, 2))) == (F(5, 2), 2) and (lin(3, -2, 10), lin(-2, 5, 10)) == (28, -15)
assert all(lin(3, -2, x) > lin(-2, 5, x) for x in GRID if x > F(7, 5)) and lin(3, -2, F(7, 5)) == lin(-2, 5, F(7, 5)) == F(11, 5)
patch('method-2', answer={'3/2': [frac(lin(3, -2, F(3, 2))), frac(lin(-2, 5, F(3, 2)))], '10': [lin(3, -2, 10), lin(-2, 5, 10)], 'conjecture': 'A > B', 'A-B': '5x − 7 > 0'},
      reading='p. 75 relue à 170 dpi (x > 7/5 ; A = 3x − 2 ; B = 5 − 2x ; x = 3/2 puis x = 10 ; A − B = 5x − 7).')

# now-75-1 / now-75-2 (400–600 dpi : l'ordre visuel des symboles a été contrôlé pixel par pixel)
assert all(x + 4 < -2 and -6 * x > 36 and x / 12 < F(-1, 2) for x in GRID if x < -6)
patch('now-75-1', answer={'x+4': '< -2', '-6x': '> 36', 'x/12': '< -1/2'}, reading='« x < −6 » lu à 600 dpi (le « −6 » est imprimé « 6- » à droite de « x < »).')
assert all((x > 15) == (x - 8 > 7) for x in GRID) and all((x < -5) == (-3 * x > 15) for x in GRID) and all((x > -36) == (9 > -x / 4) for x in GRID)
patch('now-75-2', text='في كل حالة مما يلي: x − 8 > 7 ؛ −3x > 15 ؛ 9 > −x/4. استعمل خواص المتباينات للحصول على متباينة من الشكل x > … أو x < …',
      answer={'1': 'x > 15', '2': 'x < -5', '3': 'x > -36'},
      reading='Relue à 400–600 dpi : la première inégalité est imprimée « x − 8 > 7 » (x à gauche du symbole « > », 7 à droite) : x > 15 — et NON « 7 > x − 8 ⟹ x < 15 » comme transcrit avant (voir DISCREPANCIES). −3x > 15 ⟹ x < −5 ; 9 > −x/4 ⟹ x > −36.')

# exercices 6 à 18 (p. 78–79, 170 dpi)
assert all(x - 10 > 0 for x in GRID if x > 10) and all(x + 3 < 0 for x in GRID if x < -3) and all(x + 2 >= 0 for x in GRID if x >= -2) and all(x - F(1, 2) <= 0 for x in GRID if x <= F(1, 2))
patch('ex-6', answer=[{'x-10': '> 0', 'x+3': '< 0', 'x+2': '≥ 0', 'x-1/2': '≤ 0'}], answerSource='computed', reading='p. 78 relue à 170 dpi : x > 10, x < −3, x ≥ −2, x ≤ 1/2 ; les quatre réponses sont « … 0 ».')
EX7 = [(F(0), '≥', lambda m: 5 * m >= 0, lambda m: m >= 0), (F(1), '≤', lambda m: m - 1 <= 0, lambda m: m <= 1),
       (F(-1, 4), '>', lambda m: 1 + 4 * m > 0, lambda m: m > F(-1, 4)), (F(3, 2), '>', lambda m: 3 - 2 * m < 0, lambda m: m > F(3, 2))]
assert all(h(m) == c(m) for _, _, h, c in EX7 for m in GRID + [F(-1, 4), F(3, 2), F(1), F(0)])
assert [lin(5, 0, 0), lin(1, -1, 1), lin(4, 1, F(-1, 4)), lin(-2, 3, F(3, 2))] == [0, 0, 0, 0]
patch('ex-7', text='m عدد ناطق، أكمل كل جملة مما يلي: إذا كان 5m ≥ 0 فإن m ≥ … ؛ إذا كان m − 1 ≤ 0 فإن m ≤ … ؛ إذا كان 1 + 4m > 0 فإن m > … ؛ إذا كان 3 − 2m < 0 فإن m > …',
      answer=[{'cond': f'm {r} {frac(v)}'} for v, r, _, _ in EX7], answerSource='computed',
      reading='p. 78 relue à 170 dpi : l’HYPOTHÈSE est imprimée à droite (5m ≥ 0, m − 1 ≤ 0, 1 + 4m > 0, 3 − 2m < 0) et la CONCLUSION à compléter « m ≥ … » etc. La transcription brève avait inversé hypothèse et conclusion et perdu la ligne « m ≤ 0 … ». Réponses : m ≥ 0 ; m ≤ 1 ; m > −1/4 ; m > 3/2.')
assert q('6/5') < q('5/4')
patch('ex-8', answer='6/5 < 5/4', answerSource='computed', reading='p. 78 : 6/5 et 5/4 ; 24/20 < 25/20.')
EX9 = [('4/3', '24/21', '>'), ('-4/7', '-9/14', '>'), ('4/15', '-15/4', '>'), ('2/3', '3/2', '<')]
assert [sym(q(a), q(b)) for a, b, _ in EX9] == [r for *_, r in EX9]
patch('ex-9', text='قارن بين العددين الناطقين a و b في كل حالة مما يلي: أ) a = 4/3 ، b = 24/21 ؛ ب) a = −4/7 ، b = −9/14 ؛ جـ) a = 4/15 ، b = −15/4 ؛ د) a = 2/3 ، b = 3/2',
      answer=[r for *_, r in EX9], answerSource='computed',
      reading='p. 78 relue à 170 dpi : quatre paires (4/3 ; 24/21), (−4/7 ; −9/14), (4/15 ; −15/4), (2/3 ; 3/2) → > ; > ; > ; < (la transcription brève ne donnait que a = 4/3, b = −9/14 mélangées).')
assert q('3/5') > q('11/20')
patch('ex-10', answer='3/5 > 11/20', answerSource='computed', reading='p. 78 : 3/5 = 12/20 > 11/20.')
assert all(a + 18 < 2018 for a in GRID if a < 2000) and all(x - 10 >= -5 for x in GRID if x >= 5)
patch('ex-11', answer='a + 18 < 2018', answerSource='computed', reading='p. 78.')
patch('ex-12', answer='x − 10 ≥ −5', answerSource='computed', reading='p. 78.')
assert all(m + 3 > 6 and m - 3 > 0 and -5 + m > -2 and 3 * m > 9 and -3 * m < -9 and -m / 4 + 4 < F(13, 4) for m in GRID if m > 3)
patch('ex-13', text='m عدد نسبي حيث m > 3. استنتج متباينة يحققها كل عدد مما يلي: أ) m + 3 ؛ ب) m − 3 ؛ جـ) −5 + m ؛ د) 3m ؛ هـ) −3m ؛ و) −1/4 m + 4',
      answer=['m + 3 > 6', 'm − 3 > 0', '−5 + m > −2', '3m > 9', '−3m < −9', '−1/4 m + 4 < 13/4'], answerSource='computed', reading='p. 78 relue à 170 dpi.')
assert all(x >= F(-15, 2) for x in GRID if lin(-2, 3, x) <= 18) and all(y <= F(-10, 3) for y in GRID if lin(3, 5, y) <= -5) and all(z <= F(7, 2) for z in GRID if -2 * z >= -7)
assert (F(18 - 3, -2), F(-5 - 5, 3), F(-7, -2)) == (F(-15, 2), F(-10, 3), F(7, 2))
patch('ex-14', answer='x ≥ -15/2', answerSource='computed', reading='p. 78 : −2x + 3 ≤ 18.')
patch('ex-15', answer='y ≤ -10/3', answerSource='computed', reading='p. 78 : 3y + 5 ≤ −5.')
patch('ex-16', answer='z ≤ 7/2', answerSource='computed', reading='p. 78 : −2z ≥ −7.')
assert all(b <= a for a, b in PAIRS if a >= b) and all(b - a <= 0 for a, b in PAIRS if a >= b)
assert all(5 * b - 3 * a >= 1 for a, b in PAIRS if 3 * a <= 5 * b - 1) and all(a - b >= -20 for a, b in PAIRS if a + 10 >= b - 10)
patch('ex-17', text='انقل وأكمل كل جملة مما يلي: إذا كان a ≥ b فإن b … a ؛ إذا كان a ≥ b فإن b − a … 0 ؛ إذا كان 3a ≤ 5b − 1 فإن 5b − 3a … 1 ؛ إذا كان a + 10 ≥ b − 10 فإن a − b … −20',
      answer=['≤', '≤', '≥', '≥'], answerSource='computed',
      reading='pp. 78–79 relue à 170 dpi : la 1re ligne est en bas de p. 78, les trois autres en haut de p. 79. Réponses ≤ ; ≤ ; ≥ ; ≥ (la transcription brève avait perdu les trois dernières lignes).')
assert all(7 * a >= 7 * b for a, b in PAIRS if a >= b) and all(F(-2, 5) * a < F(-2, 5) * b for a, b in PAIRS if a > b)
assert all(4 * a + 1 <= 4 * b + 1 for a, b in PAIRS if a <= b) and all(-a + 3 > -b + 3 for a, b in PAIRS if a < b)
patch('ex-18', text='a و b عددان ناطقان. انقل وأكمل كل جملة مما يلي: إذا كان a ≥ b فإن 7a … 7b ؛ إذا كان a > b فإن −2/5 a … −2/5 b ؛ إذا كان a ≤ b فإن 4a + 1 … 4b + 1 ؛ إذا كان a < b فإن −a + 3 … −b + 3',
      answer=['≥', '<', '≤', '>'], answerSource='computed', reading='p. 79 relue à 170 dpi : ≥ ; < ; ≤ ; > (quatre lignes, la transcription brève s’arrêtait à la première).')

# exercices 19, 23, 24, 26, 27 (re-routés ; p. 79)
assert all(11 <= t + 10 <= 13 and 2 <= 3 * t - 1 <= 8 and F(1, 2) <= t / 2 <= F(3, 2) and F(8, 3) <= F(14, 3) * t - 2 <= 12 for t in GRID if 1 <= t <= 3)
assert (lin(1, 10, 1), lin(1, 10, 3), lin(3, -1, 1), lin(3, -1, 3), lin(F(14, 3), -2, 1), lin(F(14, 3), -2, 3)) == (11, 13, 2, 8, F(8, 3), 12)
patch('ex-19', answer=['11 ≤ t + 10 ≤ 13', '2 ≤ 3t − 1 ≤ 8', '1/2 ≤ t/2 ≤ 3/2', '8/3 ≤ 14/3 t − 2 ≤ 12'], answerSource='computed',
      reading='p. 79 relue à 170 dpi : 1 ≤ t ≤ 3 ; expressions t + 10, 3t − 1, 1/2 t, 14/3 t − 2.')
assert (4 * 3, 4 * 8) == (12, 32)
patch('ex-23', text='x هو طول ضلع معيّن حيث 3 < x < 8 (الوحدة cm). عيّن حصرا لمحيط هذا المعيّن.', answer={'P': '12 < 4x < 32'}, answerSource='computed',
      reading='p. 79 : le losange a quatre côtés égaux, P = 4x ; 3 < x < 8.')
assert (F(5, 3), F(6, 3)) == (F(5, 3), 2)
patch('ex-24', answer={'side': '5/3 < P/3 < 2'}, answerSource='computed',
      reading='p. 79 : triangle équilatéral de périmètre P « محصور بين 5cm و 6cm » (les symboles ne sont pas imprimés : lu 5 < P < 6, comme le plan) ; côté = P/3.')
assert all(0 <= x < 1 for x in GRID if 1 <= 2 * x + 1 < 3) and (F(1 - 1, 2), F(3 - 1, 2)) == (0, 1)
patch('ex-26', answer={'x': '0 ≤ x < 1'}, answerSource='computed', reading='p. 79 : 1 ≤ 2x + 1 < 3 (x décimal).')
assert (100 * 64, 110 * 75) == (6400, 8250)
patch('ex-27', answer={'A': '6400 ≤ A ≤ 8250'}, answerSource='computed', reading='p. 79 : 100 ≤ L ≤ 110 et 64 ≤ ℓ ≤ 75 (m) ; A = L × ℓ ; les bornes sont des produits de bornes positives.')

# أؤكّد 3 et 4 (p. 81)
assert all(-x > 3 for x in GRID if x < -3) and all(y >= 3 for y in GRID if 2 * y - 2 >= 4) and F(4 + 2, 2) == 3
patch('self-3', reading='p. 81 relue à 170 dpi : x < −3 ⟹ −x > … ; réponse 3.')
patch('self-4', reading='p. 81 relue à 170 dpi : 2y − 2 ≥ 4 ⟹ y ≥ … ; réponse 3.')

# ── hasr-adad-ushri : relecture 2026-10-26 (pp. 71, 73, 76, 77, 79, 81, 83 rendues à 200 dpi) ───────────────────────────────────
from decimal import ROUND_HALF_UP
import math


def dround(x, k):
    """Contrôle indépendant de rnd() : Decimal ROUND_HALF_UP à 10^-k."""
    d = D(x.numerator) / D(x.denominator) if isinstance(x, F) else D(str(x))
    return d.quantize(D(1).scaleb(-k), rounding=ROUND_HALF_UP)


def roundbox(r, k):
    """[r − ½u ; r + ½u[ pour un arrondi à r (rang 10^-k)."""
    u = F(1, 10 ** k)
    return q(r) - u / 2, q(r) + u / 2


# prep 13–15 (p. 71) : lignes recalculées, colonnes relues
assert dround(F(135, 14), 0) == 10 and dround(F(135, 14), 1) == D('9.6')
assert dround(F(46, 6), 0) == 8 and dround(F(46, 6), 1) == D('7.7') and dround(F(46, 6), 2) == D('7.67')
assert str(D(46) / D(6))[:6] == '7.6666' and f'{D(46) / D(6):.9f}' == '7.666666667'  # affichage de la calculatrice : dernier chiffre ARRONDI
PREP[13] = prep(14, 'المدوّر إلى الجزء من 10 لحاصل القسمة 135/14 هو ……', ['9', '10', '9,6'], [2], rnd(F(135, 14), 1),
                note='options relues p. 71 à 200 dpi : (1) = 9, (2) = 10, (3) = 9,6 (la transcription brève avait inversé l’ordre)')
SUBS15 = [('المدوّر إلى الوحدة لحاصل القسمة 46/6 هو ……', ['7', '7,6', '8'], 0, rnd(F(46, 6), 0)),
          ('المدوّر إلى الجزء من 10 لحاصل القسمة 46/6 هو ……', ['7,6', '7,7', '8'], 1, rnd(F(46, 6), 1)),
          ('المدوّر إلى الجزء من 100 لحاصل القسمة 46/6 هو ……', ['7,67', '7,66', '8'], 2, rnd(F(46, 6), 2))]
# [(1), (2), (3)] = colonnes de droite à gauche ; une ligne par sous-question
PREP15_ROWS = [dict(question=t, options=o, correct=[o.index(fr(v))]) for t, o, _, v in SUBS15]
for r in PREP15_ROWS:
    assert [i for i, o in enumerate(r['options']) if q(o) == q(r['options'][r['correct'][0]])] == r['correct']
assert [r['correct'][0] for r in PREP15_ROWS] == [2, 1, 0]
PREP[14] = {'n': 15, 'question': 'شاشة حاسبة: 46 ÷ 6 = 7.666666667 (ثلاثة أسئلة: إلى الوحدة ؛ إلى 1/10 ؛ إلى 1/100)', 'options': None, 'correct': None,
            'rows': PREP15_ROWS,
            'note': 'p. 71 à 200 dpi : TROIS lignes de trois options chacune — unité : 7 / 7,6 / 8 → 8 ; 1/10 : 7,6 / 7,7 / 8 → 7,7 ; 1/100 : 7,67 / 7,66 / 8 → 7,67 (la transcription brève avait mélangé les trois lignes).'}
patch('prep', items=PREP, reading='p. 71 relue à 220 dpi (items 1–12) puis 200 dpi (13–15, 2026-10-26) : 13 : 9,6 / 10 / 9 → 10 ; 14 : 9 / 10 / 9,6 → 9,6 ; 15 : trois lignes (voir items[14].rows).')

# act-3 (p. 73)
P_LO, P_HI = roundbox('10,7', 1)
assert (P_LO, P_HI) == (q('10,65'), q('10,75'))
for v in ('10,65', '10,7', '10,74'):
    assert dround(q(v), 1) == D('10.7')
for v in ('10,64', '10,75'):
    assert dround(q(v), 1) != D('10.7')
A_ = F(247, 83)
assert f'{D(247) / D(83):.9f}' == '2.975903614' and str(D(247) / D(83))[:12] == '2.9759036144'  # écran : dernier chiffre arrondi (…6144 → …614)
BR = {k: (floor_k(A_, k), floor_k(A_, k) + F(1, 10 ** k)) for k in (0, 1, 2, 3)}
assert BR[0] == (2, 3) and BR[1] == (q('2,9'), 3) and BR[2] == (q('2,97'), q('2,98')) and BR[3] == (q('2,975'), q('2,976'))
assert all(lo <= A_ < hi for lo, hi in BR.values())
patch('act-3', answer={'P': '10,65 ≤ P < 10,75', 'P_values': ['10,65', '10,7', '10,74'],
                       'A': {'unit': '2 < A < 3', '1/10': '2,9 ≤ A < 3', '1/100': '2,97 ≤ A < 2,98', '1/1000': '2,975 ≤ A < 2,976',
                             'screen': '2.975903614', 'trueDigits': '2.97590361445…'}},
      reading='p. 73 relue à 200 dpi : le texte est conforme. Écran « 247 ÷ 83 = 2.975903614 » : dernier chiffre ARRONDI par la calculatrice (chiffres exacts 2.97590361445…). P (cm) : mesure arrondie à 0,1 = 10,7 ; droite graduée de 10,5 à 11.')

# know-3 (p. 76)
assert roundbox('15', 0) == (q('14,5'), q('15,5'))
assert dround(q('14,4'), 0) == 14 and dround(q('15,5'), 0) == 16 and dround(q('14,5'), 0) == 15
assert dround(q('3,647'), 0) == 4 and dround(q('3,647'), 1) == D('3.6') and dround(q('3,647'), 2) == D('3.65')
assert 3 <= q('3,647') < 4 and q('3,6') <= q('3,647') < q('3,7') and q('3,64') <= q('3,647') < q('3,65')
patch('know-3', answer={'range for rounding 15': '14,5 ≤ x < 15,5', '14,4 → 14': True, '15,5 → 16': True,
                        '3,647': {'unit': 4, '1/10': '3,6', '1/100': '3,65',
                                  'brackets': ['3 ≤ 3,647 < 4', '3,6 ≤ 3,647 < 3,7', '3,64 ≤ 3,647 < 3,65']}},
      reading='p. 76 relue à 200 dpi : conforme ; figure = droite avec 14,5 · 15 · 15,5 et la bulle « الأعداد العشرية التي مدوّرها إلى الوحدة هو 15 » ; le livre écrit aussi 14 ≤ x < 14,5 ⟹ 14 et 15,5 ≤ x < 16 ⟹ 16 (vrais, bornes à demi-unité).')

# method-3 (p. 77)
assert 4 <= q('4,679') < 5 and q('4,6') <= q('4,679') < q('4,7')
patch('method-3', reading='p. 77 relue à 200 dpi : conforme ; commentaire du livre « on emploie les valeurs approchées par défaut et par excès à un rang pour encadrer un décimal positif ».')

# now-77-1 (p. 77) : déjà recalculé ci-dessus (NOW771) ; relu sur le scan
assert NOW771 == {'8,342': True, '8,336': True, '8,345': False}
assert roundbox('8,34', 2) == (q('8,335'), q('8,345'))
patch('now-77-1', reading='p. 77 relue à 200 dpi (2026-10-26) : texte conforme (« 8,34 هو المدوّر إلى الجزء من 100 للعدد a ; هل يمكن أن يكون a يساوي 8,342 ؟ 8,336 ؟ 8,345 ؟ ») ; le livre ne donne pas la réponse. Recalculé par rnd() ET Decimal ROUND_HALF_UP : 8,342 oui, 8,336 oui, 8,345 NON (→ 8,35) ; encadrement 8,335 ≤ a < 8,345.')

# ex-20, 21, 22, 25, 28 (p. 79), ex-62 (p. 83)
assert F(17, 19) < 1 < F(19, 17)
PI = D(str(math.pi))
lo21, hi21 = 3 + F(10, 71), 3 + F(1, 7)
assert D(lo21.numerator) / D(lo21.denominator) < PI < D(hi21.numerator) / D(hi21.denominator)
assert f'{D(lo21.numerator) / D(lo21.denominator):.5f}' == '3.14085' and f'{D(hi21.numerator) / D(hi21.denominator):.5f}' == '3.14286'
assert F(2, 5) < F(33, 50) < F(3, 4) and (q('0,4'), q('0,66'), q('0,75')) == (F(2, 5), F(33, 50), F(3, 4))
assert q('5,115') < q('5,12') < q('5,3')
H_LO, H_HI = roundbox('5,41', 2)
assert (H_LO, H_HI) == (q('5,405'), q('5,415'))
assert dround(H_LO, 2) == D('5.41') and dround(H_HI, 2) == D('5.42')  # borne haute exclue
V_LO, V_HI = 15 * H_LO, 15 * H_HI
assert (V_LO, V_HI) == (q('81,075'), q('81,225'))
assert (5 * q('3,14'), 5 * q('3,15')) == (q('15,7'), q('15,75')) and 2 * q('2,5') == 5
assert dround(F(136, 14), 0) == 10 and 9 <= F(136, 14) < 10
patch('ex-20', answer={'17/19 < 1': True, '1 < 19/17': True}, answerSource='computed', reading='p. 79 relue à 200 dpi : « أثبت أنّ 17/19 < 1 < 19/17 ».')
patch('ex-21', answer={'lowerValue': str(D(lo21.numerator) / D(lo21.denominator))[:9], 'pi': '3.14159265…', 'upperValue': str(D(hi21.numerator) / D(hi21.denominator))[:9],
                       'chain': '3,14084… < 3,14159… < 3,14285…'}, answerSource='computed',
      reading='p. 79 relue à 200 dpi : « استعمل حاسبة لإثبات أنّ 3 + 10/71 < π < 3 + 1/7 ». 3 + 10/71 = 3.1408450… ; 3 + 1/7 = 3.1428571….')
patch('ex-22', answer={'2/5 = 0,4': True, '33/50 = 0,66': True, '3/4 = 0,75': True, 'chain': '0,4 < 0,66 < 0,75'}, answerSource='computed',
      reading='p. 79 relue à 200 dpi : « أثبت أنّ 2/5 < 33/50 < 3/4 ».')
patch('ex-25', answer={'order': 'c < a < b', 'values': 'c = 5,115 < a = 5,12 < b = 5,3 (5,115 < 5,120 < 5,300)'}, answerSource='computed',
      reading='p. 79 relue à 200 dpi : a = 5,12 ; b = 5,3 ; c = 5,115 (l’ordre imprimé est « a = 5,12 ، b = 5,3 و c = 5,115 »).')
patch('ex-28', answer={'h': '5,405 ≤ h < 5,415', 'V': 'V = 5 × 3 × h = 15h ; 81,075 ≤ V < 81,225'}, answerSource='computed',
      reading='p. 79 relue à 200 dpi : parallélépipède 5cm × 3cm × h ; 1) h tel que son arrondi à 1/100 soit 5,41 ; 2) en déduire un encadrement de V.')
patch('ex-62', answer={'exact': '5π (2π × 2,5)', 'bounds': '15,7 < P < 15,75'}, answerSource='computed',
      reading='p. 83 relue à 200 dpi : rayon 2,5 m ; encadrement imprimé 3,14 < π < 3,15 (inégalités strictes).')
patch('self-5', answer={'rounded': 10, 'bracket': '9 ≤ 136/14 < 10', 'value': '9,714…'}, answerSource='computed',
      reading='p. 81 relue à 200 dpi : « عيّن المدوّر إلى الوحدة لحاصل القسمة 136/14 ; احصر هذا العدد بين عددين طبيعيين متتاليين » ; retour 76 و 77.')


# ── wadiya-idmajiya-musawiyat-mutabayinat (synthèse) : relecture 2026-10-28 (pp. 70 et 84 rendues à 130 dpi : lisibles, conformes à la transcription) ──────
patch('opener', reading='p. 70 relue à 130 dpi : conforme en substance ; le cadre rose cite aussi les Babyloniens et les Grecs et compte « 27 siècles » après l\'Égypte ancienne (détail non repris). Photo de عمر بن إبراهيم الخيام (1048م – 1131م).')
patch('challenge', reading='p. 70 relue à 130 dpi : conforme (15 750 DA, un quart, trois dixièmes).')
patch('integration', reading='p. 84 relue à 130 dpi : conforme (50 / 45 km/h, 1 km ; t = 1/5 h = 12 min ; 10 km ; analyse en cinq temps et « حل مختصر » inclus).')
patch('evaluation', reading='p. 84 relue à 130 dpi : conforme (15 sacs + 25 kg contre 10 sacs + 150 kg ; 25 kg le sac).')

A, B, C, D_, S = 'musawiyat-amaliyat', 'mutabayinat-amaliyat', 'hasr-adad-ushri', 'muadalat-darajat-ula', 'wadiya-idmajiya-musawiyat-mutabayinat'
DEST = {
    '_comment': 'elementId → { lesson, module } ; `items` répartit un élément ; une leçon encore coming_soon est une destination EN ATTENTE (check-textbook-coverage.mjs). Modules de musawiyat-amaliyat : 0 أستعدّ · 1 نشاط (lab) · 2 معارف · 3 طريقة · 4 أتمرّن · 5–7 مسائل · 8 إختبار أولي.',
    'objectives': {'lesson': 'unit', 'module': 'page'},
    'opener': {'lesson': S, 'module': 7, 'note': 'la « حكاية » du module 7 (ouverture historique réécrite), montrée après la dernière réponse'},
    'challenge': {'lesson': S, 'module': 1, 'note': 'situation 1 « مكافأة النجاح » (T inconnu, 24 800 DA distribués, autres nombres)'},
    'prep': {'lesson': A, 'module': 0, 'items': {'1-3-4-9': {'lesson': A, 'module': 0}, '7-8': {'lesson': B, 'module': 0}, '13-14-15': {'lesson': C, 'module': 0}, '2-5-6-10-11-12': {'lesson': D_, 'module': None}}},
    'act-1': {'lesson': A, 'module': 4, 'note': 'APPLICATION (guide §4ter) : le lab `equality-lanes` est l’entrée conçue ; l’activité du manuel est posée en أتمرّن.'},
    'act-2': {'lesson': B, 'module': 4, 'note': 'أتمرّن E1–E2 (« إن أمكن » avec une ligne indécidable) ; la table de signe de a − b est RAPPELÉE (r04), jamais ré-enseignée.'},
    'act-2b': {'lesson': B, 'module': 4, 'note': 'أتمرّن E3 (entrée candidate rejetée : le tableau se répond par calcul, l’entrée conçue est le lab loom-threads).'},
    'act-3': {'lesson': C, 'module': 1, 'note': 'module 1 : le lab « ميزان العطّار » (entrée conçue, l’activité du livre est reposée) ; module 4 : أتمرّن E1 (1) et E2 (2) avec nombres propres.'},
    'act-4': {'lesson': D_, 'module': None},
    'know-1a': {'lesson': A, 'module': 2}, 'know-1b': {'lesson': A, 'module': 2},
    'know-2a': {'lesson': B, 'module': 2}, 'know-2b': {'lesson': B, 'module': 2},
    'know-3': {'lesson': C, 'module': 2, 'note': 'معارف, avec les nombres du lab et des exemples propres.'},
    'know-4': {'lesson': D_, 'module': None}, 'know-5': {'lesson': D_, 'module': None},
    'method-1a': {'lesson': A, 'module': 3}, 'method-1b': {'lesson': A, 'module': 3},
    'method-2': {'lesson': B, 'module': 3, 'note': 'طريقة B : comparer deux expressions (conjecture sur deux valeurs puis preuve par A − B).'},
    'now-75-1': {'lesson': B, 'module': 4, 'note': 'أتمرّن E4 (avec ex-13).'},
    'now-75-2': {'lesson': B, 'module': 3, 'note': 'طريقة A (déduire « x seul ») ; repris aussi en أتمرّن E5 (module 4) avec ex-14, 15, 16.'},
    'method-3': {'lesson': C, 'module': 3, 'note': 'طريقة A (encadrer à un rang) ; B (encadrer depuis un arrondi) ; C (quotient à la calculatrice) : nombres propres.'},
    'now-77-1': {'lesson': C, 'module': 4, 'note': 'أتمرّن E3 (nombres propres) ; l’élément stocké avait deux réponses fausses, voir discrepancies.'},
    'method-4': {'lesson': D_, 'module': None}, 'method-5': {'lesson': D_, 'module': None}, 'now-77-2': {'lesson': D_, 'module': None},
    **{f'ex-{n}': {'lesson': A, 'module': 4} for n in range(1, 6)},
    'ex-6': {'lesson': B, 'module': 4, 'note': 'E1'}, 'ex-7': {'lesson': B, 'module': 4, 'note': 'E6 (condition sur m : sens inverse) ; aussi banque niveau 2.'},
    **{f'ex-{n}': {'lesson': B, 'module': None, 'note': 'cited by the bank (comparaison / mot « أصغر من » : niveau 1 adapté ; la comparaison pure est 3am.m5.r04)'} for n in (8, 9, 10, 11, 12)},
    'ex-13': {'lesson': B, 'module': 4, 'note': 'E4'},
    **{f'ex-{n}': {'lesson': B, 'module': 4, 'note': 'E5 (déduire une inégalité de premier terme x)'} for n in (14, 15, 16)},
    'ex-17': {'lesson': B, 'module': 4, 'note': 'E6'}, 'ex-18': {'lesson': B, 'module': None, 'note': 'cited by the bank'},
    'ex-19': {'lesson': B, 'module': 3, 'note': 'RE-ROUTÉ depuis hasr-adad-ushri : طريقة C (encadrer ax + b) ; aussi banque.'},
    'ex-20': {'lesson': C, 'module': 4, 'note': 'E7 (encadrer par écritures décimales) + banque niveau 1.'},
    'ex-21': {'lesson': C, 'module': 4, 'note': 'E5 (3,14 < π < 3,15 puis 8π) ; aussi banque.'},
    'ex-22': {'lesson': C, 'module': 4, 'note': 'E7 + banque niveau 1.'},
    'ex-25': {'lesson': C, 'module': 4, 'note': 'E7 (échauffement : ordre de décimaux par encadrement) + banque niveau 1.'},
    'ex-28': {'lesson': C, 'module': 4, 'note': 'E6 (arrondi → encadrement de h → encadrement du volume 15h) ; aussi banque.'},
    'ex-62': {'lesson': C, 'module': None, 'note': 'banque (niveau 3, adapté) : seulement inspire la banque, pas de module.'},
    'ex-23': {'lesson': B, 'module': 4, 'note': 'RE-ROUTÉ depuis hasr-adad-ushri : E7'}, 'ex-24': {'lesson': B, 'module': 4, 'note': 'RE-ROUTÉ depuis hasr-adad-ushri : E7'},
    'ex-26': {'lesson': B, 'module': 4, 'note': 'RE-ROUTÉ depuis hasr-adad-ushri : E8 (encadrer « à rebours »)'},
    'ex-27': {'lesson': B, 'module': 7, 'note': 'RE-ROUTÉ depuis hasr-adad-ushri : مسألة 3 (deux produits de bornes positives)'},
    **{f'ex-{n}': {'lesson': D_, 'module': None} for n in (*range(29, 62), 63, 64, 65)},
    'self-1': {'lesson': A, 'module': 8}, 'self-2': {'lesson': A, 'module': 8},
    'self-3': {'lesson': B, 'module': 8}, 'self-4': {'lesson': B, 'module': 8}, 'self-5': {'lesson': C, 'module': 8, 'note': 'إختبار أولي item 1 (nombres propres).'},
    **{f'self-{n}': {'lesson': D_, 'module': None} for n in range(6, 14)},
    'integration': {'lesson': S, 'module': 7, 'note': 'module 7 : la poursuite de Tipaza (40 / 36 km/h, 2 km), analysée et résolue ; variantes : ligne d\'arrivée, arrondi à la minute, borne de l\'écart'},
    'evaluation': {'lesson': S, 'module': 8, 'note': 'module 8 : les deux camions de dattes et d\'oranges (12 caisses + 40 kg contre 8 caisses + 140 kg), autres nombres'},
    'ict': {'lesson': D_, 'module': None},
}

DISCREPANCIES = [
    {'elementId': 'prep', 'kind': 'reading', 'text': 'Ligne 5 lue « 3 ÷ x = 3 » (x = 1, option (1)) et ligne 6 « x ÷ 10 = 1 » (x = 10, option (2)) à 220 dpi ; la ligne 11 imprime « (x − 1)(1 + x) » dans le texte mais la seule option cohérente est 1 − x² : lue « (1 − x)(1 + x) ». Ligne 15 : trois sous-questions (unité, 1/10, 1/100) pour les options 8 / 7,7 / 7,67 (les colonnes de réponses sont lues par rang).'},
    {'elementId': 'act-1', 'kind': 'reading', 'text': 'L’activité 1 pose la propriété pour a, b, c RATIONNELS ; le texte « أعداد ناطقة » est gardé (la leçon travaille avec des nombres relatifs et des fractions).'},
    {'elementId': 'know-3', 'kind': 'scope', 'text': 'معارف 3 définit le « مدوّر » : la leçon hasr-adad-ushri relira les cas limites (14,5 ≤ x < 15,5) ; 3,647 → 4 ; 3,6 ; 3,65.'},
    {'elementId': 'method-1b', 'kind': 'reading', 'text': 'La seconde égalité (−1/2 x + 1/10 = 1/2) obtenue en divisant 5 = −5x + 1 par 10 : le scan écrit « −1/2 x + 1/10 = 1/2 » (valeur 1/2 correcte : x = −4/5).'},
    {'elementId': 'ex-4', 'kind': 'reading', 'text': '« 1 = 3x − 15 » est lu « −15 + 3x = 1 » dans le scan ; × (−1) donne 15 − 3x = −1.'},
    {'elementId': 'ex-41', 'kind': 'reading', 'text': 'Les angles du triangle sont lus A = 2x, C = x et B = 83° : 3x = 97, x = 97/3 non décimal — à confirmer par la leçon qui l’utilisera.'},
    {'elementId': 'ex-50', 'kind': 'reading', 'text': '« يبلغ عمر ابنه فيفضل 6 سنوات » est ambigu ; lu : le fils a 6 ans (45 + n = 2(6 + n), n = 33).'},
    {'elementId': 'act-2', 'kind': 'reading', 'text': 'Partie 5) (p. 73) : « a − 7/2 … b − 9/2 » est INDÉCIDABLE ((a − 7/2) − (b − 9/2) = (a − b) + 1 de signe inconnu : <, = ou > selon a, b) ; « a + 3/5 … b + 6/5 » est DÉCIDABLE : « < » (a + 3/5 < b + 3/5 < b + 6/5) ; a − 4 < b − 4 ; a + 3 < b + 3. La lecture antérieure disait qu’aucune des deux premières n’était décidable (fausse pour la seconde). Contrôlé par balayage exact. Confirmé sur le scan (le plan avait raison).'},
    {'elementId': 'ex-7', 'kind': 'reading', 'text': 'Hypothèse et conclusion étaient inversées dans la transcription brève : le scan imprime « إذا كان 5m ≥ 0 فإن m ≥ … ؛ m − 1 ≤ 0 ⟹ m ≤ … ؛ 1 + 4m > 0 ⟹ m > … ؛ 3 − 2m < 0 ⟹ m > … » ; réponses 0 ; 1 ; −1/4 ; 3/2 (le plan avait raison). La ligne « m ≤ 0 … » de la transcription n’existe pas.'},
    {'elementId': 'ex-9', 'kind': 'reading', 'text': 'Quatre paires : (4/3 ; 24/21), (−4/7 ; −9/14), (4/15 ; −15/4), (2/3 ; 3/2) → > ; > ; > ; < (le plan avait raison ; la transcription brève mélangeait a de la 1re paire et b de la 2e).'},
    {'elementId': 'ex-17', 'kind': 'reading', 'text': 'Quatre lignes (la 1re en bas de p. 78, les trois autres en haut de p. 79) : b … a ; b − a … 0 ; 5b − 3a … 1 (hyp. 3a ≤ 5b − 1) ; a − b … −20 (hyp. a + 10 ≥ b − 10) → ≤ ; ≤ ; ≥ ; ≥ (le plan avait raison).'},
    {'elementId': 'ex-18', 'kind': 'reading', 'text': 'Quatre lignes (p. 79) : 7a … 7b ; −2/5 a … −2/5 b ; 4a + 1 … 4b + 1 ; −a + 3 … −b + 3 → ≥ ; < ; ≤ ; > (le plan avait raison).'},
    {'elementId': 'now-75-2', 'kind': 'reading', 'text': 'DIFFÉRENCE AVEC LE PLAN (le scan l’emporte) : la 1re inégalité est imprimée « x − 8 > 7 » (p. 75, relue à 400–600 dpi, forme du symbole et ordre des glyphes contrôlés par analyse de pixels) et NON « 7 > x − 8 » ; réponse x > 15 (l’ancienne réponse « x < 15 » et le plan « 7 > x − 8 » sont faux). Les deux autres sont conformes : −3x > 15 ⟹ x < −5 ; 9 > −x/4 ⟹ x > −36. Aucune réponse n’est montrée à l’élève : la leçon utilise ses propres nombres.'},
    {'elementId': 'ex-24', 'kind': 'reading', 'text': '« محيطه P محصور بين 5cm و 6cm » : aucun symbole imprimé ; lu 5 < P < 6 (le plan) ; la leçon peut aussi poser ≤ sans conséquence.'},
    {'elementId': 'now-77-1', 'kind': 'textbook-error', 'text': 'Appartient à hasr-adad-ushri. Les DEUX réponses stockées étaient fausses : 8,336 s’arrondit à 8,34 (oui, pas « non ») ; 8,345 s’arrondit à 8,35 (demi vers le haut) donc NON (pas « oui »). Recalculé par rnd() : 8,342 oui, 8,336 oui, 8,345 non ; encadrement 8,335 ≤ a < 8,345. Ne jamais le montrer à l’élève.'},
    {'elementId': 'prep', 'kind': 'transcription-error', 'text': 'hasr-adad-ushri, p. 71 relue à 200 dpi : ligne 14 (arrondi à 1/10 de 135/14) imprimée (1) = 9, (2) = 10, (3) = 9,6 ; la transcription brève avait [9,6 ; 10 ; 9] avec l’indice 0 juste (faux ordre) : corrigé en [9 ; 10 ; 9,6], juste = (3) = 9,6. Ligne 13 conforme (9,6 / 10 / 9 → 10). Ligne 15 : ce sont TROIS lignes de trois options — unité : 7 / 7,6 / 8 → 8 ; 1/10 : 7,6 / 7,7 / 8 → 7,7 ; 1/100 : 7,67 / 7,66 / 8 → 7,67 (items[14].rows) ; la transcription brève avait fusionné les colonnes. Écran imprimé 7.666666667 (dernier chiffre arrondi par la calculatrice ; vrai 7,6666…).'},
    {'elementId': 'act-3', 'kind': 'reading', 'text': 'hasr-adad-ushri : l’écran imprimé « 2.975903614 » est l’AFFICHAGE d’une calculatrice dont le dernier chiffre est arrondi : les chiffres exacts de 247/83 sont 2.97590361445… ; les encadrements 2,9 ≤ A < 3 ; 2,97 ≤ A < 2,98 ; 2,975 ≤ A < 2,976 sont corrects. P (cm) : arrondi à 0,1 égal à 10,7 ⟺ 10,65 ≤ P < 10,75.'},
    {'elementId': 'know-3', 'kind': 'reading', 'text': 'hasr-adad-ushri, p. 76 à 200 dpi : conforme (14,5 ≤ x < 15,5 ; 3,647 → 4 / 3,6 / 3,65 ; encadrements 3 ≤ 3,647 < 4, 3,6 ≤ 3,647 < 3,7, 3,64 ≤ 3,647 < 3,65). Le livre écrit aussi 14 ≤ x < 14,5 ⟹ 14 et 15,5 ≤ x < 16 ⟹ 16 (vrais).'},
    {'elementId': 'ex-28', 'kind': 'reading', 'text': 'hasr-adad-ushri : h arrondi à 1/100 = 5,41 ⟺ 5,405 ≤ h < 5,415 ; V = 5 × 3 × h = 15h ⟹ 81,075 ≤ V < 81,225 (bornes calculées exactement, borne haute exclue).'},
    {'elementId': 'ex-62', 'kind': 'reading', 'text': 'hasr-adad-ushri : P = 2π × 2,5 = 5π ; 3,14 < π < 3,15 ⟹ 15,7 < P < 15,75 (strict, comme imprimé).'},
    {'elementId': 'ex-21', 'kind': 'reading', 'text': 'hasr-adad-ushri : 3 + 10/71 = 3,140845… < π = 3,141592… < 3 + 1/7 = 3,142857… (vérifié exactement).'},
    {'elementId': 'ex-25', 'kind': 'reading', 'text': 'hasr-adad-ushri : a = 5,12 ; b = 5,3 ; c = 5,115 imprimés dans cet ordre ; c < a < b (5,115 < 5,120 < 5,300).'},
    {'elementId': 'self-5', 'kind': 'reading', 'text': 'hasr-adad-ushri : 136/14 = 9,714… ; arrondi à l’unité 10 ; 9 ≤ 136/14 < 10 (le livre demande « entre deux naturels consécutifs » : borne basse atteinte possible, ici stricte des deux côtés pour un non-entier).'},
    {'elementId': 'unit', 'kind': 'scope', 'text': 'Pages 70–85 complètes. Éléments de mutabayinat-amaliyat relus et vérifiés le 2026-10-26 ; hasr-adad-ushri relus et vérifiés le 2026-10-26 (200 dpi) ; ceux de la synthèse transcrits brièvement à 110 dpi (verified: false) ; figures des ex-47, 48, 52, 54, 59, 60, 64 à relire par leur leçon (réponses « à lire sur la figure »).'},
]

doc = {
    '_comment': [
        'EXTRACTION CANONIQUE du manuel scolaire officiel — 3AM, الجيل الثاني (منشورات الشهاب 2017), unité 5 « المساويات – المتباينات – المعادلات ».',
        'Source : docs/official-book-pdfs/كتاب الرياضيات للسنة الثالثة متوسط الجيل الثاني.pdf, pages 70 à 85 du livre (PDF 70 à 85).',
        'Ce fichier est LA source de vérité pédagogique de l’unité ; tout contenu cite un `id` d’ici via `source.elementId`.',
        'Transcription VISUELLE ; réponses calculées (Fraction exacte) dans build-extraction.py, `answerSource: computed`.',
        'Généré par docs/sources/3am/unit5/build-extraction.py — ne pas éditer à la main.',
    ],
    'unitCode': 'musawiyat-mutabayinat',
    'textbook': {'title': 'كتاب الرياضيات — السنة الثالثة من التعليم المتوسط', 'generation': 'الجيل الثاني', 'unitNumber': 5,
                 'unitTitle': 'المساويات – المتباينات – المعادلات', 'pages': {'first': 70, 'last': 85}, 'pdfPageOffset': 0,
                 'sections': ['سأتعلّم في هذا الباب', 'تحدّي', 'أستعدّ', 'أنشطة', 'معارف', 'طرائق', 'دوري الآن', 'أوظّف تعلّماتي', 'أؤكّد تعلّماتي', 'أتعمّق', 'أدمج تعلّماتي', 'وضعية للتقويم', 'أوظّف تكنولوجيات الإعلام والاتصال']},
    'frozenAt': '2026-10-21',
    'terminology': {'note': 'Le manuel écrit « المساويات », « المتباينات », « المعادلة », « المجهول », « طرفا المساواة », « حل معادلة », « ترييض مشكلة », « الحصر », « المدوّر », « قيمة مقرّبة بالنقصان / بالزيادة ».',
                    'terms': ['مساواة', 'متباينة', 'طرفا المساواة', 'معادلة', 'مجهول', 'حل', 'ترييض', 'حصر', 'مدوّر', 'قيمة مقرّبة']},
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
    if DEST[e['id']]['lesson'] in (A, D_):
        pass
for e in E:
    if DEST[e['id']]['lesson'] in (A, B, C):
        assert e.get('verified') is True, f'{e["id"]} va à {DEST[e["id"]]["lesson"]} sans relecture'
for n in (19, 23, 24, 26, 27):
    assert DEST[f'ex-{n}']['lesson'] == B, f'ex-{n} doit être re-routé vers {B}'
for n in (28, 62):
    assert DEST[f'ex-{n}']['lesson'] == C

out = Path(__file__).with_name('extraction.json')
out.write_text(json.dumps(doc, ensure_ascii=False, indent=1, default=str) + '\n', encoding='utf-8')
toA = sum(1 for k, v in DEST.items() if k != '_comment' and v['lesson'] == A)
pending = sum(1 for k, v in DEST.items() if k != '_comment' and v['lesson'] not in ('unit', A))
print(f'{out} — {len(E)} éléments ({toA} pour {A}, {pending} pour les autres leçons, en attente)')
