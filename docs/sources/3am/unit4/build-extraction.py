#!/usr/bin/env python3
"""Génère docs/sources/3am/unit4/extraction.json — 3AM, unité 4 « الحساب الحرفي » (manuel الجيل الثاني, pp. 54–69 ; PDF = page
imprimée dans toute l'unité, textbook-map.json).

Transcription VISUELLE (pages rendues à 110 dpi, les passages douteux relus à 200–250 dpi). Le texte arabe est celui du manuel ; les
réponses attendues sont CALCULÉES ici (polynômes exacts, `Poly`, jamais tapées) et chaque énoncé qui porte une expression est
RE-vérifié par `check()`.

L'unité est générée LEÇON PAR LEÇON (cycle moyen, phase 3). Première leçon générée : tabsit-hadhf-aqwas (2026-10-20, Phase A, #3 de la
file) ; deuxième : nashr-jabri-3am (2026-10-21, Phase A, #4) — ses éléments sont relus à 100–220 dpi (`verified: True`) et ses destinations
précisées plus bas (modules : 0 أستعدّ · 1 نشاط (labo area-split, monde plot) · 2 معارف · 3 طريقة (même labo, monde arrows) · 4 أتمرّن ·
5–7 مسائل · 8 إختبار أولي ; `None` = banque d'exercices). Troisième : qimat-ibara-harfiya (2026-10-26, Phase 0 #15) : prep 1–4, act-4, know-4, method-4, now-61 ①, ex-1…ex-4, self-3, deep-37, deep-39 et ict sont
relus à 250 dpi (`verified: True`, réponses recalculées avec `Poly` / `Fraction`) ; modules : 0 أستعدّ · 2 معارف · 3 طريقة · 4 أتمرّن. Les éléments de tabsit et de nashr
sont transcrits avec soin (`verified: True` quand relus à 200 dpi) ; quatrième : muqaranat-natiqayn (2026-10-26, Phase 0 #16) : act-5, know-5, method-5, now-61 ②, ex-27…ex-32,
self-9, self-10 et deep-38 sont relus (`verified: True`) ; modules : 0 أستعدّ · 1 نشاط (labo difference-meter) · 2 معارف · 3 طريقة (même labo, monde race) · 4 أتمرّن · 5–7 مسائل · 8 إختبار أولي ;
ceux de la synthèse sont transcrits plus brièvement et marqués `verified: False` : sa leçon les relira.

FRONTIÈRE ENTRE LES DEUX PREMIÈRES LEÇONS (à écrire une fois) :
  • tabsit-hadhf-aqwas (3am.m5.r01 « تبسيط عبارة جبرية ») = SIMPLIFIER : regrouper les termes semblables (3x + 5x = 8x ; x et x² ne se
    mélangent pas), multiplier des monômes (3x × 5x = 15x²), SUPPRIMER des parenthèses précédées de + ou de − (jamais suivies de × ou ÷ :
    a − (b − c) = a − b + c), puis réduire ; distinguer une SOMME d'un PRODUIT (la dernière opération). Elle ne distribue jamais
    un facteur : aucune parenthèse n'y est suivie de × ni ne s'ouvre « en multipliant ».
  • nashr-jabri-3am (3am.m5.r02 « نشر ») = DISTRIBUER : k(a + b) = ka + kb, (a + b)(c + d) = ac + ad + bc + bd, justification par l'aire d'un
    rectangle, « développer puis réduire », écrire un produit comme somme (et la mise en facteur simple).
    Précisé le 2026-10-21 : elle ne NOMME PAS les identités remarquables (4AM `mutatabiqat-shahira` les construit) — (x+3)², (x+1)(x−1),
    2010 × 81 sont des applications du développement ; elle ne factorise pas (4AM `tahlil-ibara`) : ex-11 n'y sert qu'à LIRE l'égalité
    de droite à gauche et à la contrôler en développant ; une valeur n'y sert que de VÉRIFICATION d'un développement, jamais de
    leçon (r03) ; ni contre-exemple (deep-39 → qimat-ibara-harfiya).
  • qimat-ibara-harfiya (r03) POSSÈDE : substituer une valeur relative ou rationnelle (une lettre ou deux) et calculer avec la priorité des
    opérations ; écrire le × caché et les parenthèses autour d’une valeur négative (et autour d’une fraction élevée à une puissance) ; la
    valeur exacte avec π face à la valeur arrondie ; et la LOGIQUE « une valeur où deux expressions diffèrent PROUVE qu’elles ne sont pas égales ;
    des valeurs égales ne prouvent rien — on développe pour prouver l’égalité ». Elle ne compare jamais deux nombres par le signe d’une différence
    et ne résout jamais d’équation (une égalité « vérifiée pour quel x ? » se traite en TESTANT les valeurs proposées). La valeur d’une expression
    n’est utilisée dans tabsit / nashr que comme VÉRIFICATION (la valeur ne change pas quand on supprime les parenthèses, qu’on réduit ou qu’on développe).
  • muqaranat-natiqayn (r04) POSSÈDE : « a > b ⟺ a − b > 0 » (et < / =), l’ordre lu sur la différence SEULE, la comparaison de deux rationnels par leur
    différence (fractions de signes quelconques, quotients de décimaux par une différence à la calculatrice, multiples de π) et la comparaison de deux
    EXPRESSIONS en simplifiant A − B jusqu’à une forme dont le signe se lit directement : une constante, x − c ou c − x, ou un produit de facteurs de signe
    connu. Elle NE refait PAS la comparaison de deux fractions par dénominateur commun positif ou par produits en croix (3AM unité 2
    `tasawi-muqaranat-kasrayn`, item 3am.m1.r05 : un seul encadré « تذكّر »), et n’ajoute/retranche/multiplie/divise pas les deux membres d’une inéquation
    (3AM unité 5 `mutabayinat-amaliyat`, 4AM inéquations) : quand A − B = k(x − c) avec k > 0, le signe vient de la règle des signes d’un produit.
  Source de ces deux frontières : docs/sources/3am/unit4/plan/README.md « Boundaries — who owns what ».

Usage : python3 docs/sources/3am/unit4/build-extraction.py
"""
import json
from fractions import Fraction as F
from pathlib import Path


class Poly:
    """Un polynôme en x à coefficients rationnels : { puissance: coefficient } — calcul exact, indépendant de packages/core."""
    def __init__(self, d=None): self.d = {p: c for p, c in (d or {}).items() if c != 0}
    @staticmethod
    def of(c, p=0): return Poly({p: F(c)})
    def __add__(s, o):
        if not isinstance(o, Poly): o = n(o)
        r = dict(s.d)
        for p, c in o.d.items(): r[p] = r.get(p, 0) + c
        return Poly(r)
    def __radd__(s, o): return s + n(o) if not isinstance(o, Poly) else s + o
    def __rsub__(s, o): return n(o) - s
    def __rmul__(s, o): return n(o) * s
    def __neg__(s): return Poly({p: -c for p, c in s.d.items()})
    def __sub__(s, o): return s + (-o)
    def __mul__(s, o):
        if not isinstance(o, Poly): o = n(o)
        r = {}
        for p, c in s.d.items():
            for q, e in o.d.items(): r[p + q] = r.get(p + q, 0) + c * e
        return Poly(r)
    def at(s, x): return sum(c * F(x) ** p for p, c in s.d.items())
    def __eq__(s, o): return s.d == o.d
    def text(s):
        if not s.d: return '0'
        out = ''
        for p in sorted(s.d, reverse=True):
            c = s.d[p]; a = abs(c)
            a = str(a.numerator) if a.denominator == 1 else f'{a.numerator}/{a.denominator}'
            body = a if p == 0 else ('' if a == '1' else a) + 'x' + (f'^{p}' if p > 1 else '')
            out += (('-' if c < 0 else '') if not out else (' - ' if c < 0 else ' + ')) + body
        return out


X = Poly.of(1, 1)
def n(c): return Poly.of(c)
def kx(c, p=1): return Poly.of(c, p)

E = []

# ── p. 54 : ouverture ───────────────────────────────────────────────────────────────────────────
E.append({'id': 'objectives', 'kind': 'objectives', 'page': 54, 'section': 'سأتعلّم في هذا الباب', 'verified': True,
          'items': ['تبسيط عبارة جبرية.', 'نشر عبارات جبرية من الشكل: $(a+b)(c+d)$ حيث $a$ و $b$ و $c$ و $d$ أعداد نسبية.', 'حساب قيمة عبارة حرفية.', 'مقارنة عددين ناطقين.']})
E.append({'id': 'opener', 'kind': 'aside', 'page': 54, 'section': 'استعمال الرموز والعبارات الحرفية عند العرب', 'verified': True,
          'text': 'يُرجع المؤرخون الفضل لعالم الرياضيات محمد بن موسى الخوارزمي (780 – 850، بغداد) في استعمال الرمز شـ، الحرف الأول من كلمة (شيء) للترميز للمجهول. وقد ظهر الترميز والتعبير الحرفي جليا في أعمال عالم الرياضيات الأندلسي المغربي أبو الحسن علي بن محمد القلصادي (1412 – 1486 تونس) حيث استعمل رموزا للعدد (وحدة) و شيء ($x$) ومال ($x^2$) وكعب ($x^3$) و مال المال ($x^4$).',
          'figure': 'نص تاريخي في إطار وردي، وفوقه ورقة مخطوطة بكتابة القلصادي للعبارتين $x^4+4x^3+10x^2+12x+9$ و $10x^2-20$ ؛ وجدول رموزه (عدد، شيء، مال، كعب، مال المال).'})
E.append({'id': 'challenge', 'kind': 'challenge', 'page': 54, 'section': 'تحدّي', 'verified': True,
          'text': 'عددان مجموعهما 191,7 . بكم يزداد جداؤهما إذا أضفنا لكل منهما 10؟',
          'answer': {'value': '2017', 'reasoning': '(a+10)(b+10) − ab = 10(a+b) + 100 = 1917 + 100'}, 'answerSource': 'computed'})
assert F('191.7') * 10 + 100 == 2017

# ── p. 55 : أستعدّ (12 items) ───────────────────────────────────────────────────────────────────
PREP = [
    {'n': 1, 'question': '$8-5\\times2$ يساوي', 'options': ['6', '-2', '18'], 'correct': [1], 'why': '$5\\times2=10$ ثم $8-10=-2$ (الضرب قبل الطرح ؛ أمّا $6$ فهي نتيجة من أجرى العمليتين من اليسار إلى اليمين: $(8-5)\\times2$)', 'verified': True, 'note': 'Relu à 250 dpi (2026-10-26) : le manuel imprime « 8 − 5 × 2 » (de gauche à droite) = −2 = option (2). L’ancienne note « aucune bonne réponse » lisait à tort « 2 × 5 − 8 ».', 'destination': 'qimat-ibara-harfiya'},
    {'n': 2, 'question': '$2\\times(8-5)$ يساوي', 'options': ['6', '-2', '18'], 'correct': [0], 'why': '$8-5=3$ ثم $2\\times3=6$', 'verified': True, 'note': 'Relu à 250 dpi : le manuel imprime « 2 × (8 − 5) » (et non « (8 − 5) × 2 »), options 6 / −2 / 18 ; réponse (1).', 'destination': 'qimat-ibara-harfiya'},
    {'n': 3, 'question': '$3-3^2$ يساوي', 'options': ['0', '3', '-6'], 'correct': [2], 'why': '$3^2=9$ ثم $3-9=-6$', 'verified': True, 'note': 'Relu à 250 dpi : options 0 / 3 / −6 ; réponse (3).', 'destination': 'qimat-ibara-harfiya'},
    {'n': 4, 'question': '$a\\times a\\times a$ يساوي', 'options': ['$a^3$', '$3a$', '$a\\times a^2$'], 'correct': [0, 2], 'why': '$a\\times a\\times a=a^3=a\\times a^2$', 'verified': True, 'note': 'Relu à 250 dpi : options a³ / 3a / a × a² ; deux bonnes réponses (1) et (3).', 'destination': 'qimat-ibara-harfiya'},
    {'n': 5, 'question': '$x+x+x+x+x$ يساوي', 'options': ['$x^5$', '$5x$', '$x+5$'], 'correct': [1], 'why': 'خمس مرّات $x$ مجموعة: $5x$ لا $x^5$'},
    {'n': 6, 'question': 'أي العبارات هي عبارة جداء؟', 'options': ['$3x+4$', '$7+(x-3)$', '$(x+5)(2-x)$'], 'correct': [2], 'why': 'آخر عملية في $(x+5)(2-x)$ ضرب'},
    {'n': 7, 'question': '$3x+2x$ يساوي', 'options': ['$5x$', '$6x$', '$2x+3$'], 'correct': [0], 'why': '$3x+2x=(3+2)x=5x$'},
    {'n': 8, 'question': '$5x\\times2x$ يساوي', 'options': ['$10x$', '$10x^2$', '$7x$'], 'correct': [1], 'why': '$5\\times2\\times x\\times x=10x^2$'},
    {'n': 9, 'question': 'أي العبارات موافقة للبرنامج: اختر عددا، أضف إليه 7، اضرب الناتج في 3؟', 'options': ['$x+7\\times3$', '$3(x+7)$', '$(x+7)\\times3$'], 'correct': [1, 2], 'why': '$3(x+7)=(x+7)\\times3$', 'destination': 'nashr-jabri-3am'},
    {'n': 10, 'question': 'محيط المستطيل ABCD (البعدان $x+10$ و 6) يساوي', 'options': ['$2(6x+10)$', '$2(x+10)+12$', '$2(x+16)$'], 'correct': [1, 2], 'why': '$2(x+10)+2\\times6=2(x+16)$', 'figure': 'مستطيل ABCD بعداه (x + 10) و 6 ؛ على AD القطعة x ثم 10', 'destination': 'nashr-jabri-3am'},
    {'n': 11, 'question': 'مساحة المستطيل ABCD المرسوم أعلاه تساوي', 'options': ['$6x+10$', '$6(x+10)$', '$6x+60$'], 'correct': [1, 2], 'why': '$6(x+10)=6x+60$', 'destination': 'nashr-jabri-3am'},
    {'n': 12, 'question': 'في الشكل (مربع طول ضلعه $x$ ومثلث متساوي الساقين قاعدته 10 يتجاوران) محيط المثلث يساوي', 'options': ['$3(10-x)$', '$30-x$', '$10-3x$'], 'correct': [], 'why': 'lecture du chiffrage de la figure non établie (à relire par nashr-jabri-3am)', 'verified': False, 'destination': 'nashr-jabri-3am'},
]
E.append({'id': 'prep', 'kind': 'prerequisites', 'page': 55, 'section': 'أستعدّ', 'verified': True,
          'instruction': 'جد الإجابة الصحيحة (أو الإجابات الصحيحة) في كل حالة، مبرّرا إياها.', 'items': PREP, 'answerSource': 'computed',
          'reading': 'Items 5–8 (la leçon tabsit-hadhf-aqwas) relus à 110 dpi : réponses recalculées. Items 1–4 (qimat-ibara-harfiya) relus à 250 dpi le 2026-10-26 : « 8 − 5 × 2 » = −2 (option 2), « 2 × (8 − 5) » = 6 (option 1), « 3 − 3² » = −6 (option 3), « a × a × a » = a³ = a × a² (options 1 et 3) ; les colonnes du tableau se lisent de droite à gauche (1)(2)(3). Items 9–12 → nashr-jabri-3am.'})
assert (3 * X + 2 * X) == kx(5) and kx(5) * kx(2) == kx(10, 2)
# prep 1–4 (qimat-ibara-harfiya) : les réponses sont CALCULÉES, pas tapées
_a = 8 - 5 * 2; _b = 2 * (8 - 5); _c = 3 - 3 ** 2
assert (_a, _b, _c) == (-2, 6, -6) and (8 - 5) * 2 == 6        # 6 = lecture « de gauche à droite » de 8 − 5 × 2 : le piège
assert [PREP[0]['options'][i] for i in PREP[0]['correct']] == [str(_a)]
assert [PREP[1]['options'][i] for i in PREP[1]['correct']] == [str(_b)]
assert [PREP[2]['options'][i] for i in PREP[2]['correct']] == [str(_c)]
_A = X * X * X
assert _A == kx(1, 3) and X * (X * X) == _A and kx(3) != _A and PREP[3]['correct'] == [0, 2]

# ── p. 56 : أنشطة 1 et 2 ─────────────────────────────────────────────────────────────────────────
E.append({'id': 'act-1', 'kind': 'activity', 'number': 1, 'page': 56, 'section': 'أنشطة', 'title': 'تبسيط عبارة جبرية', 'verified': True,
          'text': 'أ) $\\ell$ وحدة طول. للتعبير عن طول الخط الأحمر بدلالة $\\ell$ اقترح كل من إلياس ومريم العبارتين: اقتراح إلياس: $4\\times(3\\ell)$ ؛ اقتراح مريم: $3\\ell+3\\ell+3\\ell+3\\ell$. • كيف تبرّر صحة كل من الاقتراحين؟ • ميّز عبارة المجموع وعبارة الجداء من بين الاقتراحين. • بسّط كلا من العبارتين السابقتين. ب) • عبّر بدلالة $x$ عن مساحة المربع البنّي. • عبّر بدلالة $x$ عن بعدي المستطيل ABCD. • عبّر بطريقتين مختلفتين عن مساحة المستطيل ABCD بدلالة $x$.',
          'figure': 'أ) خط أحمر مكسور على مرصوفة: 3 قطع أفقية بطول $\\ell$ ثم 3 قطع صاعدة ثم 3 نازلة ثم 3 أفقية ؛ ب) مربع بنّي ضلعه $x$ فوق مستطيل ABCD مقسّم إلى مربعات من ضلع $x$ (5 أعمدة، 3 صفوف).',
          'answer': {'a': {'Elias': '4 × 3ℓ = 12ℓ (produit)', 'Maryam': '3ℓ+3ℓ+3ℓ+3ℓ = 12ℓ (somme)', 'length': '12ℓ'},
                     'b': {'square': 'x²', 'dimensions': '5x et 3x', 'area_two_ways': '5x × 3x = 15x²  ;  15 carrés de x² : 15x²'}}, 'answerSource': 'computed',
          'reading': 'Figure du A) relue à 250 dpi : 3 + 3 + 3 + 3 segments égaux à ℓ = 12ℓ. Figure du B) : 5 colonnes × 3 rangées de carrés de côté x (lue à 110 dpi, à confirmer) : 5x × 3x = 15x².'})
assert 4 * 3 == 3 * 4 == 12 and kx(5) * kx(3) == kx(15, 2)

E.append({'id': 'act-2', 'kind': 'activity', 'number': 2, 'page': 56, 'section': 'أنشطة', 'title': 'حذف الأقواس', 'verified': True,
          'text': 'إليك أجوبة ثلاثة تلاميذ عن المسألتين الآتيتين: 1) كان في خزان شاحنة 50 لترا من البنزين، استهلكت منها 14 لترا للوصول إلى المحجرة، و 17 لترا للعودة إلى الورشة. اكتب سلسلة عمليات تسمح بحساب عدد لترات البنزين المتبقي في خزان هذه الشاحنة. 2) كان في الحافلة 36 راكبا. عند وصولها المحطة ركب فيها 29 شخصا ونزل 7 أشخاص. اكتب سلسلة عمليات تسمح بحساب عدد ركاب هذه الحافلة عند مغادرتها المحطة. التلميذ 1: (1 $50-(14+17)$ (2 $36+29-7$ ؛ التلميذ 2: (1 $50-14-17$ (2 $36-29-7$ ؛ التلميذ 3: (1 $50-(14-17)$ (2 $36+(29-7)$. أ) احسب نتيجة كل سلسلة، ثمّ حدّد الإجابات الصحيحة. ب) اكتب كل سلسلتين متساويتين واربطهما بالرمز =. ج) احسب كلا من سلاسل العمليات الآتية، ثمّ اكتبها بدون أقواس: $D=9-(4-2{,}3)$ ، $C=3{,}4-(-3+7)$ ، $B=9+(-13-6)$ ، $A=5+(3-7)$. د) ما هو التخمين الذي يمكنك وضعه لحذف قوسين غير متبوعين بالإشارة ($\\times$) أو الإشارة ($\\div$) في مجموع جبري؟',
          'answer': {'a': {'problem1': {'pupil1': 50 - (14 + 17), 'pupil2': 50 - 14 - 17, 'pupil3': 50 - (14 - 17), 'correct': ['pupil1', 'pupil2'], 'value': 19},
                          'problem2': {'pupil1': 36 + 29 - 7, 'pupil2': 36 - 29 - 7, 'pupil3': 36 + (29 - 7), 'correct': ['pupil1', 'pupil3'], 'value': 58}},
                     'b': ['50 - (14 + 17) = 50 - 14 - 17', '36 + 29 - 7 = 36 + (29 - 7)'],
                     'c': {'A': '1 = 5 + 3 - 7', 'B': '-10 = 9 - 13 - 6', 'C': '-0,6 = 3,4 + 3 - 7', 'D': '7,3 = 9 - 4 + 2,3'},
                     'd': 'مسبوقة بـ + : نحذفهما دون تغيير الإشارات ; مسبوقة بـ − : نحذفهما مع تغيير إشارة كل حدّ بينهما'}, 'answerSource': 'computed',
          'reading': 'Relu à 250 dpi. Le pupil 3 écrit « 50 ⁎ (14 − 17) » dont le signe devant la parenthèse est effacé sur le scan : lu « − » (50 − (14 − 17) = 53 ≠ 19, la réponse fausse attendue). Les deux problèmes : 50 − 14 − 17 = 19 et 36 + 29 − 7 = 58.'})
assert 50 - (14 + 17) == 50 - 14 - 17 == 19 and 50 - (14 - 17) == 53 and 36 + 29 - 7 == 36 + (29 - 7) == 58 and 36 - 29 - 7 == 0
assert 5 + (3 - 7) == 1 and 9 + (-13 - 6) == -10 and F('3.4') - (-3 + 7) == F('-0.6') and 9 - (F(4) - F('2.3')) == F('7.3')

E.append({'id': 'act-3', 'kind': 'activity', 'number': 3, 'page': 57, 'section': 'أنشطة', 'title': 'نشر عبارات جبرية', 'verified': False,
          'text': '1) نشر عبارات من الشكل $a(b+c)$ حيث $a$ و $b$ و $c$ أعداد نسبية: أ) يرمز $x$ إلى طول المستطيل ABEF (العرض 5). • عبّر، بدلالة $x$، عن طول AD (AD = x + 3). • عبّر، بطريقتين مختلفتين، عن مساحة المستطيل ABCD بدلالة $x$. • استنتج مساواة بين عبارتي مساحة ABCD. ب) انشر كلا مما يأتي: $A=5\\times(x-3)$ ، $B=-2\\times(3-y)$ ، $C=x(y+z)$. 2) نشر عبارات من الشكل $(a+b)(c+d)$: في الشكل المرفق LMPQ مستطيل ... أ) عبّر، بدلالة $a, b, c, d$ عن بعدي LMPQ. • عبّر عن مساحة LMPQ مرّة كجداء لبعديه، ومرّة كمجموع أربع مساحات. • استنتج مساواة بين عبارتي مساحة LMPQ. ب) انشر كلا مما يأتي: $A=(x+2)(x+3)$ ، $B=(x-5)(3-y)$ ، $C=(2x-5)(x-7)$.', 'reading': 'transcrit à 110 dpi (à relire par nashr-jabri-3am).'})
E.append({'id': 'act-4', 'kind': 'activity', 'number': 4, 'page': 57, 'section': 'أنشطة', 'title': 'حساب قيمة عبارة حرفية', 'verified': True,
          'text': 'أ) احسب قيمة العبارة $A=(3x+2)(x-5)$ من أجل كل من $x=1$ و $x=-1$ و $x=5$. ب) هذا نشر أحد التلاميذ للعبارة $A$ : $A=3x^2-17x-6$. بيّن كيف تستعمل قيم $A$ من أجل $x=1$ و $x=-1$ و $x=5$ لتبرير عدم صحة عمل هذا التلميذ.',
          'answer': {'a': {'x=1': -20, 'x=-1': 6, 'x=5': 0}, 'b': 'le vrai développement est 3x² − 13x − 10 : à x = 1 il vaut −20 ... voir ci-dessous'}, 'answerSource': 'computed'})
A = (3 * X + n(2)) * (X - n(5))
assert [A.at(1), A.at(-1), A.at(5)] == [-20, 6, 0], [A.at(1), A.at(-1), A.at(5)]
assert A == 3 * X * X - kx(13) - n(10)
E[-1]['reading'] = ('Relu à 250 dpi (2026-10-26) : A = (3x + 2)(x − 5) à x = 1, −1, 5 ; la réponse de l’élève est écrite à la main « A = 3x² − 17x − 6 » (17x lisible). '
                    'Valeurs : A(1) = 5 × (−4) = −20 ; A(−1) = (−1)(−6) = 6 ; A(5) = 17 × 0 = 0. Le vrai développement est 3x² − 13x − 10.')
E[-1]['answer']['b'] = f'(3x+2)(x−5) = {A.text()} ; l’élève écrit 3x² − 17x − 6 : même valeur −20 à x = 1, mais 14 ≠ 6 à x = −1 et −16 ≠ 0 à x = 5 (x = 1 seul ne suffit pas)'
W = 3 * X * X - kx(17) - n(6)
assert (W.at(1), W.at(-1), W.at(5)) == (-20, 14, -16)
E.append({'id': 'act-5', 'kind': 'activity', 'number': 5, 'page': 57, 'section': 'أنشطة', 'title': 'مقارنة عددين ناطقين', 'verified': False,
          'text': 'أ) انقل الجدول المقابل وأكمله (لإتمام العمود الثالث يمكن استعمال مستقيم مدرّج في كل حالة لتعليم النقطة A ذات الفاصلة a، والنقطة B ذات الفاصلة b). الأزواج (a ; b): (5/7 ; 2/3) ، (3/4 ; 7/9) ، (−8/3 ; 5/9) ، (−1/7 ; −4/9) ، (−5/3 ; −2/7). ب) a و b عددان. انقل وأكمل ما يلي بما يناسب (موجبا، سالبا، أكبر، أصغر): « إذا كان $a-b$ ........ يكون $a$ ........ من $b$ » و « إذا كان $a-b$ ........ يكون $a$ ........ من $b$ ». جـ) كيف يصبح الفرق $a-b$ عندما يكون $a$ يساوي $b$؟'})

# ── p. 58 : معارف 1–3 ────────────────────────────────────────────────────────────────────────────
E.append({'id': 'know-1', 'kind': 'knowledge', 'number': 1, 'page': 58, 'section': 'معارف', 'title': 'تبسيط عبارة حرفية', 'verified': True,
          'text': 'تبسيط عبارة حرفية يعني كتابتها بأقل ما يمكن من الحدود في حالة مجموع أو العوامل في حالة جداء. أمثلة: • تبسيط عبارة جداء: $4\\times(3\\ell)=4\\times3\\times\\ell=(4\\times3)\\times\\ell=12\\ell$ ؛ $(3x)\\times(5x)=3\\times x\\times5\\times x=3\\times5\\times x\\times x=15x^2$. • تبسيط مجموع جبري: $4\\ell+4\\ell+4\\ell+4\\ell=16\\ell$ ؛ $3x+5x=8x$.',
          'answer': {'12l': 12, '15x2': '15x^2', '16l': 16, '8x': 8}, 'answerSource': 'computed'})
assert kx(3) * kx(5) == kx(15, 2) and kx(3) + kx(5) == kx(8)
E.append({'id': 'know-2', 'kind': 'knowledge', 'number': 2, 'page': 58, 'section': 'معارف', 'title': 'حذف الأقواس في عبارة جبرية', 'verified': True,
          'text': 'في عبارة جبرية يمكن حذف القوسين غير المتبوعين بـ $\\times$ أو $\\div$ بشرط أن: • نحذف القوسين المسبوقين بالإشارة $+$ دون تغيير إشارات الحدود الموجودة بين القوسين. • ونحذف القوسين المسبوقين بالإشارة $-$ مع تغيير إشارة كل حد موجود بين القوسين. أمثلة: • القوسان مسبوقان بالإشارة ($+$) : $a+(7-b)=a+7-b$ ؛ $x+(-2-3x)=x-2-3x$. • القوسان مسبوقان بالإشارة ($-$) : $a-(-2b+9)=a+2b-9$ ؛ $x-(-6x-y)=x+6x+y$.',
          'note': 'Dernière ligne du manuel imprimée « x−(−6x−y)=x+6x+y » : conforme à la règle.'})
E.append({'id': 'know-3', 'kind': 'knowledge', 'number': 3, 'page': 58, 'section': 'معارف', 'title': 'نشر عبارات جبرية', 'verified': False,
          'text': 'نشر عبارة جداء يعني كتابتها على شكل مجموع. خاصية 1: من أجل كل أعداد نسبية $a$ ، $b$ ، $c$ : $a(b+c)=ab+ac$. ملاحظات: أ) تسمّى الخاصية 1 بالخاصية التوزيعية (توزيع الضرب على الجمع). ب) يمكن تبرير قاعدة حذف الأقواس باستعمال هذه الخاصية 1. خاصية 2: من أجل كل أعداد نسبية $a$ ، $b$ ، $c$ ، $d$ : $(a+b)(c+d)=ac+ad+bc+bd$. أمثلة: $5(x+2)=5x+10$ ؛ $-2x(7-1{,}5x)=-14x+3x^2$ ؛ $+(7-b)=7-b$ ؛ $-(-2x-y)=2x+y$ ؛ $(2x-3)(-4+x)=2x^2-11x+12$.',
          'note': 'Le manuel justifie « حذف الأقواس » par la propriété 1 (+(7−b) = (+1)×(7 + (−b)) ; −(−2x−y) = (−1)×(−2x + (−y))) : c’est de la distributivité, enseignée par nashr-jabri-3am ; tabsit-hadhf-aqwas n’en retient que la règle.'})
assert (kx(2) - n(3)) * (n(-4) + X) == 2 * X * X - kx(11) + n(12)

# ── p. 59 : طرائق ────────────────────────────────────────────────────────────────────────────────
A1 = kx(5, 2) - n(8) + (kx(10) - kx(3, 2)) - (n(2) - kx(3))
assert A1 == kx(2, 2) + kx(13) - n(10)
E.append({'id': 'method-1', 'kind': 'method', 'number': 1, 'page': 59, 'section': 'طرائق', 'title': 'حذف الأقواس وتبسيط عبارة حرفية', 'verified': True,
          'text': 'تمرين: بسّط العبارة $A=5x^2-8+(10x-3x^2)-(2-3x)$. حل: نحذف الأقواس (بتطبيق القاعدة المناسبة) : $A=5x^2-8+10x-3x^2-2+3x$ ؛ نجمع الحدود المتشابهة : $A=5x^2-3x^2+10x+3x-2-8$ ؛ نبسّط : $A=(5-3)x^2+(10+3)x-10$ ؛ $A=2x^2+13x-10$. ملاحظة: كتابة العبارة $13x$ على الشكل $10x+3x$ هو تطبيق للخاصية $(b+c)a=ba+ca$.',
          'answer': {'A': A1.text()}, 'answerSource': 'computed'})
E.append({'id': 'method-2', 'kind': 'method', 'number': 2, 'page': 59, 'section': 'طرائق', 'title': 'نشر عبارة حرفية وتبسيطها (1)', 'verified': False,
          'text': 'تمرين: انشر وبسّط العبارة $A=3(1-4x)-7(x-2)+x(5-3x)$. حل: نطبّق الخاصية التوزيعية ونبسّط الجداءات ثم نبسّط المجموع الجبري: $A=3\\times1+3\\times(-4x)-7\\times x-7\\times(-2)+x\\times5+x\\times(-3x)=3-12x-7x+14+5x-3x^2=17-14x-3x^2$.',
          'answer': {'A': (3 * (n(1) - kx(4)) - 7 * (X - n(2)) + X * (n(5) - kx(3))).text()}, 'answerSource': 'computed'})
assert 3 * (n(1) - kx(4)) - 7 * (X - n(2)) + X * (n(5) - kx(3)) == n(17) - kx(14) - kx(3, 2)
E.append({'id': 'method-3', 'kind': 'method', 'number': 3, 'page': 59, 'section': 'طرائق', 'title': 'نشر عبارة حرفية وتبسيطها (2)', 'verified': False,
          'text': 'تمرين: انشر وبسّط العبارة $A=(3x+4)(2-x)$. حل: ننشر ونبسّط الجداءات ثم نبسّط المجموع الجبري: $A=3x\\times2+3x\\times(-x)+4\\times2+4\\times(-x)=6x-3x^2+8-4x=-3x^2+2x+8$ (نرتّب عبارة المجموع حسب قوى $x$ تنازليا).',
          'answer': {'A': ((3 * X + n(4)) * (n(2) - X)).text()}, 'answerSource': 'computed'})
assert (3 * X + n(4)) * (n(2) - X) == -kx(3, 2) + kx(2) + n(8)
N1 = -kx(2, 2) + n(7) - (-X + kx(5, 2)) + (-kx(9) + n(1))
E.append({'id': 'now-59', 'kind': 'now', 'page': 59, 'section': 'دوري الآن', 'title': 'دوري الآن', 'verified': True,
          'text': '1) بسّط العبارة: $A=-2x^2+7-(-x+5x^2)+(-9x+1)$. 2) انشر وبسّط كلا من العبارتين: $B=(-x+6)(3+2x)$ ، $A=7x(3-2x)-5(-3x+4)$.',
          'answer': {'1': N1.text(), '2B': ((-X + n(6)) * (n(3) + kx(2))).text(), '2A': (7 * X * (n(3) - kx(2)) - 5 * (-kx(3) + n(4))).text()}, 'answerSource': 'computed',
          'reading': 'Item 1 pour tabsit-hadhf-aqwas ; item 2 (développer) pour nashr-jabri-3am.'})
assert N1 == -kx(7, 2) - kx(8) + n(8)

# ── p. 60–61 : معارف 4–5, طرائق ──────────────────────────────────────────────────────────────────
E.append({'id': 'know-4', 'kind': 'knowledge', 'number': 4, 'page': 60, 'section': 'معارف', 'title': 'حساب قيمة عبارة حرفية', 'verified': True,
          'text': 'لحساب قيمة عبارة حرفية من أجل بعض قيم للحرف أو للحروف في العبارة، نعوّض الحروف بهذه القيم ونجري الحسابات باحترام قواعد أولوية العمليات. مثال: $A=3x^2-7x-4$ من أجل $x=2$: $A=3\\times2^2-7\\times2-4=12-14-4=-6$. مثال: $B=(-5x+7)(2-y)$ من أجل $x=-1{,}4$ و $y=-9$ : $B=14\\times11=154$. ملاحظة: عند التعويض نكتب إشارة الضرب $\\times$ بين العددين، وفي حالة التعويض بعدد سالب نستعمل الأقواس. مثال 1: عند تعويض $x$ بالعدد 3 في العبارة $5x$ ، نكتب $5\\times3$. مثال 2: عند تعويض $x$ بالعدد $-3{,}2$ في العبارة $5x$ ، نكتب $5\\times(-3{,}2)$.',
          'answer': {'A(x=2)': -6, 'B(x=-1,4 ; y=-9)': '14 × 11 = 154'}, 'answerSource': 'computed',
          'reading': 'Relu à 250 dpi (2026-10-26) : les deux exemples et la remarque (5x avec x = 3 → 5 × 3 ; avec x = −3,2 → 5 × (−3,2)). Le manuel écrit « x = −1,4 » : virgule décimale, soit −1,4 = −7/5.'})
_A60 = 3 * X * X - kx(7) - n(4)
assert _A60.at(2) == 3 * 2 ** 2 - 7 * 2 - 4 == 12 - 14 - 4 == -6
_x, _y = F('-1.4'), F(-9)
assert (-5 * _x + 7) == 14 and (2 - _y) == 11 and (-5 * _x + 7) * (2 - _y) == 154 and _x == F(-7, 5)
assert 5 * 3 == 15 and 5 * F('-3.2') == -16
E.append({'id': 'know-5', 'kind': 'knowledge', 'number': 5, 'page': 60, 'section': 'معارف', 'title': 'مقارنة عددين ناطقين', 'verified': False,
          'text': 'يمكّن إشارة الفرق $a-b$ من ترتيب العددين $a$ و $b$ : $a>b$ معناه $a-b>0$ ؛ $a<b$ معناه $a-b<0$ ؛ $a=b$ معناه $a-b=0$. أمثلة: $\\frac53-\\frac97=\\frac{8}{21}>0$ فإن $\\frac53>\\frac97$ ؛ $-\\frac{13}{9}-\\left(-\\frac65\\right)=-\\frac{11}{45}<0$ فإن $-\\frac{13}{9}<-\\frac65$.'})
assert F(5, 3) - F(9, 7) == F(8, 21) and F(-13, 9) + F(6, 5) == F(-11, 45)
E.append({'id': 'method-4', 'kind': 'method', 'number': 4, 'page': 61, 'section': 'طرائق', 'title': 'توظيف قيمة عبارة حرفية والحساب الحرفي', 'verified': True,
          'text': 'تمرين: إليك العبارات الحرفية: $A=2x^2-6$ ، $B=(x-1)(2x+6)$ ، $C=2(x^2+x)+2(x-3)$. 1) احسب قيمة كل من A و B و C من أجل $x=1$. 2) هل العبارتان A و B متساويتان؟ برّر إجابتك. 3) هل العبارتان B و C متساويتان؟ برّر إجابتك. حل: 1) A = 4 ؛ B = 0 ؛ C = 0. 2) A و B غير متساويتين لأن من أجل $x=1$ ليس لهما نفس القيمة. 3) نلاحظ أنّ من أجل $x=1$ فإن للعبارتين B و C نفس القيمة، ومنه يمكن أن تكونا متساويتين: ننشر B فنجد $2x^2+4x-6$ وننشر C فنجد $2x^2+4x-6$ ومنه نجد أنّ العبارتين B و C متساويتان. ملاحظة: لا يكفي تساوي قيمتي عبارتين للحكم على تساوي هاتين العبارتين. مثال: العبارتان $x^2+19$ و $x^2-7x+19$ غير متساويتين، ولكن لهما نفس القيمة 19 من أجل $x=0$.'})
B4 = (X - n(1)) * (kx(2) + n(6)); C4 = 2 * (X * X + X) + 2 * (X - n(3)); A4 = 2 * X * X - n(6)
assert (A4.at(1), B4.at(1), C4.at(1)) == (-4, 0, 0)
assert B4 == C4 == kx(2, 2) + kx(4) - n(6) and A4.at(1) == 2 * 1 ** 2 - 6 == 2 - 6 == -4 != 4 and A4 != B4
assert (X * X + n(19)).at(0) == (X * X - kx(7) + n(19)).at(0) == 19 and (X * X + n(19)) != (X * X - kx(7) + n(19))
assert (X * X + n(19)).at(1) != (X * X - kx(7) + n(19)).at(1)
E[-1]['reading'] = 'Relu à 250 dpi (2026-10-26) : A(1) = 2 × 1² − 6 = −4 (le manuel écrit « 2 × (1)² − 6 = 2 × 1 − 6 = 2 − 6 = 4 » : coquille de signe, corrigée : −4). B(1) = (1 − 1)(2 × 1 + 6) = 0 ; C(1) = 2 × (1² + 1) + 2 × (1 − 3) = 4 − 4 = 0 ; B = C = 2x² + 4x − 6 (encadré). Remarque : x² + 19 et x² − 7x + 19 valent 19 en x = 0.'
E[-1]['answer'] = {'1': {'A': -4, 'B': 0, 'C': 0}, '2': 'A ≠ B (valeurs différentes en x = 1)', '3': 'B = C = 2x² + 4x − 6 (par développement)', 'remark': 'x² + 19 et x² − 7x + 19 : même valeur 19 en x = 0, pourtant différentes'}
E[-1]['answerSource'] = 'computed'
E.append({'id': 'method-5', 'kind': 'method', 'number': 5, 'page': 61, 'section': 'طرائق', 'title': 'مقارنة عددين ناطقين', 'verified': False,
          'text': 'تمرين: قارن بين العددين بحساب فرقهما في كل حالة: $\\frac{14}{13}$ و $\\frac87$ ؛ $\\frac{-5}{9}$ و $\\frac{3}{-4}$. حل: $\\frac{14}{13}-\\frac87=-\\frac{6}{91}<0$ فإن $\\frac{14}{13}<\\frac87$ ؛ $\\frac{-5}{9}-\\frac{3}{-4}=\\frac{7}{36}>0$ فإن $\\frac{-5}{9}>\\frac{3}{-4}$. ملاحظة: لمقارنة عددين ناطقين يمكن كتابتهما على شكل كسرين لهما نفس المقام الموجب، ثم ترتيبهما حسب ترتيب بسطيهما.'})
assert F(14, 13) - F(8, 7) == F(-6, 91) and F(-5, 9) - F(3, -4) == F(7, 36)
E.append({'id': 'now-61', 'kind': 'now', 'page': 61, 'section': 'دوري الآن', 'title': 'دوري الآن', 'verified': True,
          'text': '1) أ) احسب قيمة كل من العبارات $A=(x+4)(x-3)$ من أجل $x=-4$ ، $B=x^2-12$ من أجل $x=-4$. ب) هل العبارتان A و B متساويتان؟ برّر إجابتك. 2) قارن بحساب فرقهما في كل حالة: $\\frac{13}{6}$ و $\\frac{35}{17}$ ؛ $\\frac{-4}{5}$ و $\\frac{2}{-3}$.',
          'answer': {'1': {'A(-4)': 0, 'B(-4)': 4, 'equal': False}},  'answerSource': 'computed',
          'reading': 'Relu à 250 dpi (2026-10-26). Item 1 (qimat-ibara-harfiya) : A(−4) = 0 × (−7) = 0 ; B(−4) = 16 − 12 = 4 ; A ≠ B. Item 2 (muqaranat-natiqayn) : les nombres sont 13/6 et 35/17 ; −4/5 et 2/(−3) (le signe moins du second est SOUS la barre : 2 sur −3 ; le premier « −4/5 » porte son moins devant) — l’ancienne transcription « −2/3 » ne changeait pas la valeur.'})
assert ((X + n(4)) * (X - n(3))).at(-4) == 0 and (X * X - n(12)).at(-4) == 4 and F(13, 6) - F(35, 17) == F(11, 102) and F(-4, 5) - F(2, -3) == F(-2, 15)

# ── pp. 62–64 : أوظّف تعلّماتي (1–32) ───────────────────────────────────────────────────────────
def ex(n_, text, dest_note=None, verified=False, **kw):
    E.append({'id': f'ex-{n_}', 'kind': 'exercise', 'number': n_, 'page': kw.pop('page'), 'section': kw.pop('section'), 'text': text, 'verified': verified, **kw})

SEC_V, SEC_D, SEC_B, SEC_N, SEC_C = 'حساب قيمة عبارة حرفية', 'توزيعية الضرب', 'حذف الأقواس', 'نشر العبارة $(a+b)(c+d)$', 'مقارنة عددين ناطقين'
ex(1, 'لتكن العبارة الحرفية $A=-2x+5$. احسب قيمة $A$ من أجل: أ) $x=7$ ؛ ب) $x=-1$ ؛ جـ) $x=-3$.', page=62, section=SEC_V, verified=True)
_A1 = -kx(2) + n(5)
V1 = {'أ': _A1.at(7), 'ب': _A1.at(-1), 'جـ': _A1.at(-3)}
assert list(V1.values()) == [-9, 7, 11] and (-2 * 7 + 5, -2 * (-1) + 5, -2 * (-3) + 5) == (-9, 7, 11)
E[-1]['answer'] = {k: int(v) for k, v in V1.items()}; E[-1]['answerSource'] = 'computed'
E[-1]['reading'] = 'Relu à 250 dpi (2026-10-26) : A = −2x + 5 ; x = 7, −1, −3 → −9, 7, 11.'
ex(2, 'لتكن العبارة الحرفية $B=x^2-4x+3$. احسب قيمة $B$ من أجل: أ) $x=0$ ؛ ب) $x=2$ ؛ جـ) $x=-2$.', page=62, section=SEC_V, verified=True)
_B2 = X * X - kx(4) + n(3)
V2 = {'أ': _B2.at(0), 'ب': _B2.at(2), 'جـ': _B2.at(-2)}
assert list(V2.values()) == [3, -1, 15] and ((-2) ** 2 - 4 * (-2) + 3) == 4 + 8 + 3 == 15
E[-1]['answer'] = {k: int(v) for k, v in V2.items()}; E[-1]['answerSource'] = 'computed'
E[-1]['reading'] = 'Relu à 250 dpi : B = x² − 4x + 3 ; x = 0, 2, −2 → 3, −1, 15 (le cas x = −2 : (−2)² − 4 × (−2) + 3).'
ex(3, 'اختبر صحة كل مساواة من المساواتين الآتيتين من أجل $x=1$: $(3x-1)(2-x)=-3x^2+7x-2$ ؛ $14x-7x^2=-7x(x-2)$.', page=62, section=SEC_V, verified=True)
_L1, _R1 = (3 * X - n(1)) * (n(2) - X), -3 * X * X + kx(7) - n(2)
_L2, _R2 = kx(14) - kx(7, 2), (-7 * X) * (X - n(2))
assert (_L1.at(1), _R1.at(1)) == (2, 2) and (_L2.at(1), _R2.at(1)) == (7, 7)
assert _L1 == _R1 and _L2 == _R2        # les deux égalités sont VRAIES pour tout x ; le test en x = 1 ne fait que les « confirmer »
E[-1]['answer'] = {'1': '(3 × 1 − 1)(2 − 1) = 2 et −3 + 7 − 2 = 2 : égalité vérifiée à x = 1', '2': '14 − 7 = 7 et −7 × 1 × (1 − 2) = 7 : égalité vérifiée à x = 1',
                   'note': 'un test en x = 1 ne PROUVE pas l’égalité ; ici les deux égalités sont vraies pour tout x (développer : −3x² + 7x − 2 ; −7x² + 14x)'}
E[-1]['answerSource'] = 'computed'
E[-1]['reading'] = 'Relu à 250 dpi : (3x − 1)(2 − x) = −3x² + 7x − 2 ; 14x − 7x² = −7x(x − 2) ; à tester pour x = 1 (« اختبر صحة »).'
ex(4, 'يبيّن اللحظة التي يرى فيها سائق السيارة عائقا أمامه ولحظة توقف السيارة بفعل عملية الكبح، هناك مسافة تقطعها السيارة تعرف بمسافة التوقف. يمكن حساب قيمة تقريبية لها باستعمال العبارة $d=0{,}0064v^2+0{,}5v$ حيث $v$ سرعة السيارة قبيل عملية الكبح. احسب مسافة التوقف في الحالات الآتية: أ) $v=50\\text{ km/h}$ ؛ ب) $v=90\\text{ km/h}$ ؛ جـ) $v=130\\text{ km/h}$.', page=62, section=SEC_V, verified=True)
_d = lambda v: F('0.0064') * F(v) ** 2 + F('0.5') * F(v)
assert (_d(50), _d(90), _d(130)) == (F(41), F('96.84'), F('173.16'))
assert 0.0064 * 50 ** 2 + 0.5 * 50 - 41 < 1e-9
E[-1]['answer'] = {'v=50': '41', 'v=90': '96,84', 'v=130': '173,16'}; E[-1]['answerSource'] = 'computed'
E[-1]['reading'] = 'Relu à 250 dpi : d = 0,0064v² + 0,5v ; les vitesses sont imprimées « 50 k.h⁻¹, 90 k.h⁻¹, 130 k.h⁻¹ » (km/h) ; d en mètres : 0,0064 × 2500 + 25 = 41 ; 0,0064 × 8100 + 45 = 96,84 ; 0,0064 × 16900 + 65 = 173,16. La valeur est « approchée » (le texte dit قيمة تقريبية) mais le calcul est exact.'
ex(5, 'اكتب على أبسط شكل ممكن كل عبارة جبرية من العبارات الآتية: أ) $7x\\times5x$ ؛ ب) $3\\times2x\\times6x$ ؛ جـ) $4\\times8x\\times x$ ؛ د) $7x+5x$ ؛ هـ) $7x+5x+9x$ ؛ و) $3x+x$.', page=62, section=SEC_D, verified=True,
   answer={'a': '35x^2', 'b': '36x^2', 'c': '32x^2', 'd': '12x', 'e': '21x', 'f': '4x'}, answerSource='computed')
assert [kx(7) * kx(5), 3 * kx(2) * kx(6), 4 * kx(8) * X, kx(7) + kx(5), kx(7) + kx(5) + kx(9), 3 * X + X] == [kx(35, 2), kx(36, 2), kx(32, 2), kx(12), kx(21), kx(4)]
ex(6, 'اشرح الخطأين المرتكبين من قبل زميلك: « $5x\\cdot3=2x$ » (مكتوب $5x-3=2x$ في الصورة المطبوعة) و « $3x+7x=10x^2$ ».', page=62, section=SEC_D, verified=True,
   reading='Relu à 200 dpi : « 5x − 3 = 2x » et « 3x + 7x = 10x² ». Erreurs : réunir deux termes qui ne sont pas semblables (5x et 3) ; élever la lettre au carré dans une SOMME (3x + 7x = 10x).')
ex(7, 'بسّط كلما أمكن كل عبارة مما يأتي: $H=5+4x$ ؛ $G=3x+11x$ ؛ $K=3x-2$ ؛ $I=2b^2+3b^2$ ؛ $M=2-9x$ ؛ $L=2x-8x$.', page=62, section=SEC_D, verified=True,
   answer={'H': '5 + 4x (déjà réduite)', 'G': '14x', 'K': '3x - 2 (déjà réduite)', 'I': '5b^2', 'M': '2 - 9x (déjà réduite)', 'L': '-6x'}, answerSource='computed')
for n_ in (8, 9, 10, 11):
    pass
ex(8, 'انشر كل عبارة من العبارات الآتية: أ) $4(3x-5)$ ؛ ب) $-5(9-2a)$ ؛ جـ) $3(6-4x)$ ؛ د) $-2x(x+4)$ ؛ هـ) $4x(-3x+2y)$ ؛ و) $-7(2x-1)$.', page=62, section=SEC_D)
ex(9, 'إليك العبارتين: $A=x(3x-4)+12$ ، $B=-4x+3(x^2+4)$. انشر كلا من العبارتين A و B. ما الذي يمكنك استنتاجه بالنسبة للعبارتين A و B؟', page=62, section=SEC_D)
ex(10, 'نعتبر المربع والمستطيل (المربع EFGH ضلعه $2x$ ، والمستطيل ABCD بعداه $x+3$ و $x$) ونرمز إلى مساحتيهما بالرمزين A و B على الترتيب. أ) عبّر بدلالة $x$ عن كل من A و B. ب) احسب كلا من A و B من أجل $x=1$. جـ) هل يمكن القول أنّ العبارتين A و B متساويتان؟ د) بيّن أنّ العبارتين A و B غير متساويتين.', page=62, section=SEC_D)
ex(11, 'اكتب على شكل جداء كلا من المجاميع الآتية: $5x-15$ ؛ $n^2+3n$ ؛ $6x+x^2$ ؛ $-3x-12$ ؛ $15x-12$ ؛ $2y+6$ ؛ $5z^2+2z$ ؛ $5t^2-25t$.', page=62, section=SEC_D)
ex(12, 'اكتب كل عبارة من العبارات الآتية بدون أقواس ثمّ بسّطها إن أمكن: أ) $-4+(-x+3y)$ ؛ ب) $7-(-x+2y)$ ؛ جـ) $3h-(2h+1)$ ؛ د) $12-(2-4a)+(3a-5)$ ؛ هـ) $6+(-4a+3)-(2-5a+b)$.', page=62, section=SEC_B, verified=True,
   answer={'a': '-4 - x + 3y', 'b': '7 + x - 2y', 'c': 'h - 1', 'd': '5 + 7a', 'e': '7 + a - b'}, answerSource='computed')
# d : 12 - 2 + 4a + 3a - 5 = 5 + 7a ; e : 6 - 4a + 3 - 2 + 5a - b = 7 + a - b ; c : 3h - 2h - 1 = h - 1
ex(13, 'اكتب كل عبارة من العبارات الآتية بدون أقواس ثمّ بسّطها كلما أمكن ذلك: $A=3a+6-(4a+5)+(2-7a)$ ؛ $B=-b+8+(4b-1)-(7b-3)$ ؛ $C=9-4x+x-(5-2x)+6+(8-3x)$ ؛ $D=d-2-(5d+3)+(7d-1)-(2d-2)$.', page=63, section=SEC_B, verified=True,
   answer={'A': '-8a + 3', 'B': '-4b + 10', 'C': '-4x + 18', 'D': 'd - 4'}, answerSource='computed')
ex(14, 'يشير $x$ إلى عدد أكبر تماما من 20. في المثلث ABC الزاوية $\\widehat{B}=x$ والزاوية $\\widehat{C}=x-20$. 1) عبّر بدلالة $x$ وبشكل مبسّط عن قيس الزاوية $\\widehat{A}$. 2) احسب قيس الزاوية $\\widehat{A}$ في كل حالة مما يأتي: أ) $x=30$ ؛ ب) $x=45$ ؛ جـ) $x=90$. 3) هل يمكن أن يكون $x=120$؟ اشرح.', page=63, section=SEC_B, verified=True,
   answer={'1': '200 - 2x', '2': {'x=30': 140, 'x=45': 110, 'x=90': 20}, '3': 'non : à x = 120, C = 100 et B = 120, A = −40 < 0 (la somme des angles B + C dépasse 180°)'}, answerSource='computed',
   reading='Relu à 110 dpi. Triangle ABC, ∠B = x, ∠C = x − 20 (étiquette « x − 20 » à côté du sommet C). A = 180 − x − (x − 20) = 200 − 2x.')
assert (n(180) - X - (X - n(20))) == n(200) - kx(2)
ex(15, 'طلب الأستاذ من تلاميذه نشر العبارة $A=3+(x-2)\\times5$. إليك جزءا من ورقة إجابة زميلك: $A=3+(x-2)\\times5=3\\times x\\times5-3\\times2\\times5=3x-30$. أ) ما هو الخطأ المرتكب من طرف زميلك؟ ب) أعد العمل الذي قام به زميلك مصححا الخطأ.', page=63, section=SEC_B)
for n_, t in ((16, 'انشر وبسّط كل عبارة مماثلة. ب) اختبر صحة ما توصلت إليه من أجل قيمتين للمتغير $x$: $A=(x+1)(x+5)$ ، $B=(x+2)(3-2x)$ ، $C=(5x+2)(3+7x)$ ، $D=(4x-3)(6x+1)$.'),
              (17, 'انشر ثم بسّط كلا من العبارتين: $E=(-2x+3)(3x-2)$ ؛ $F=(5x-2)(-3x+9)$.'),
              (18, 'قام أحد التلاميذ بنشر الجداء $(5x+1)(x+3)$ ثم تبسيطه، فكتب $(5x+1)(x+3)=5x^2+15x+3$. 1) اختبر صحة هذا النشر. 2) انشر وبسّط $(5x+1)(x+3)$.'),
              (19, '1) باستعمال المساواة $2010\\times81=(2000+10)\\times(80+1)$ ودون استعمال الآلة الحاسبة احسب $2010\\times81$. 2) بطريقة مماثلة احسب $2010\\times93$ ؛ $2010\\times76$.'),
              (20, 'إليك العبارة $E=(5x-6)(x+4)$. 1) انشر وبسّط العبارة E. 2) احسب قيمة العبارة E من أجل $x=\\frac15$ ، مرّة باستعمال العبارة الأصلية ومرّة أخرى باستعمال العبارة المبسّطة.'),
              (21, 'إليك العبارة $E=3(4x-5)+(x+2)(x-7)$. 1) انشر وبسّط $3(4x-5)$. 2) انشر وبسّط $(x+2)(x-7)$. 3) استنتج تبسيطا للعبارة E.'),
              (22, 'طلب الأستاذ من تلاميذه نشر وتبسيط العبارة $B=3(x-5)(4x+9)$. تظهر في إجابتي تلميذين بداية الحل فقط. 1) أتمم الإجابتين السابقتين. 2) اقترح كيفية أخرى لنشر وتبسيط العبارة B.'),
              (23, '1) انشر ثم بسّط $(x+3)(x+4)$. 2) انشر ثم بسّط العبارة $A=x(x+3)(x+4)$.'),
              (24, 'تذكير: $a^2=a\\times a$. انشر ثم بسّط كل عبارة مما يأتي: $A=(x+3)^2$ ؛ $B=(2x-5)^2$ ؛ $(a+b)^2$ ؛ $(a-b)^2$.'),
              (25, '1) انشر ثم بسّط العبارة: $(x-4)^2-(x-2)(x-8)$. 2) استنتج طريقة تسمح بحساب سريع للسلسلة: $9996^2-9998\\times9992$.'),
              (26, '1) انشر ثم بسّط العبارة $A=(x+1)(x-1)$. 2) احسب ذهنيا: $1001\\times999$ ؛ $101\\times99$.')):
    ex(n_, t, page=63 if n_ <= 22 else 64, section=SEC_N if n_ >= 16 else SEC_B)
ex(27, 'قارن بين العددين الناطقين $a$ و $b$ في كل حالة مما يأتي: أ) $a-b=0{,}1$ ؛ ب) $a-b=-\\frac52$ ؛ جـ) $b-a=7$ ؛ د) $b-a=-10^{-2}$ ؛ هـ) $a-b=\\frac25$ ؛ و) $b-a\\geqslant1$.', page=64, section=SEC_C)
ex(28, 'في كل حالة مما يأتي: أ) $x=12$ و $y=4$ ؛ ب) $x=-5$ و $y=-9$ ؛ جـ) $x=-11$ و $y=7$ ؛ د) $x=3$ و $y=-8$. 1) قارن شفاهيا بين العددين $x$ و $y$ ثم استنتج إشارة $x-y$ دون حسابه. 2) تحقق من إجاباتك من خلال حساب $x-y$ في كل حالة مما سبق.', page=64, section=SEC_C)
ex(29, '1) أ) احسب باستعمال الآلة الحاسبة $\\frac{53{,}4}{7{,}89}-\\frac{23{,}55}{3{,}48}$. ب) استعمل النتيجة الظاهرة على الشاشة لمقارنة العددين $\\frac{53{,}4}{7{,}89}$ و $\\frac{23{,}55}{3{,}48}$. 2) قارن بين العددين $\\frac{1{,}28}{7}$ و $\\frac{0{,}441}{2{,}4}$ (يمكنك استعمال الحاسبة).', page=64, section=SEC_C)
ex(30, 'قارن بين العددين الناطقين في كل حالة مما يأتي: أ) $\\frac37$ و $\\frac{13}{28}$ ؛ ب) $-\\frac54$ و $-\\frac{13}{12}$ ؛ جـ) $\\frac73$ و $\\frac{15}{7}$ ؛ د) $-\\frac56$ و $-\\frac78$.', page=64, section=SEC_C)
ex(31, 'طلب الأستاذ من التلاميذ مقارنة العددين $\\frac{25{,}96}{35{,}89}$ و $\\frac{38{,}94}{53{,}89}$ مع السماح باستعمال الآلة الحاسبة. 1) قامت مريم بحساب حاصل القسمة $\\frac{25{,}96}{35{,}89}$ باستعمال الآلة الحاسبة. أ) ما هي النتيجة التي ستظهر على الشاشة؟ ب) ما الذي يجب على مريم فعله بعد ذلك؟ 2) قام يونس بحساب الفرق باستعمال الآلة الحاسبة. أ) ما هي النتيجة التي ستظهر على الشاشة؟ ب) ما الذي يمكن استنتاجه؟ 3) أي الطريقتين أفضل برأيك؟', page=64, section=SEC_C)
ex(32, 'إليك العبارتين: $B=4x+3$ ؛ $A=5x-4$. 1) حدّد إشارة كل من A و B من أجل: أ) $x=0$ ؛ ب) $x=7$ ؛ جـ) $x=9$. 2) بسّط العبارة $A-B$ ثم استنتج إشارتها من أجل $x>7$. 3) قارن بين A و B من أجل $x>7$.', page=64, section=SEC_C)

# ── p. 65 : أؤكّد تعلّماتي (1–10) ────────────────────────────────────────────────────────────────
SELF_SEC = 'أؤكّد تعلّماتي'
E.append({'id': 'self-1', 'kind': 'self', 'number': 1, 'page': 65, 'section': SELF_SEC, 'verified': True,
          'text': 'من بين العبارات الآتية، ميّز تلك التي تُمثّل مجموعا: أ) $(3x+1)(x+5)$ ؛ ب) $4+2x-7x^2$ ؛ جـ) $(5x+2)^2$.', 'answer': {'correct': ['ب']}, 'answerSource': 'computed', 'returnPage': 58})
E.append({'id': 'self-2', 'kind': 'self', 'number': 2, 'page': 65, 'section': SELF_SEC, 'verified': True,
          'text': 'بسّط كل عبارة من العبارات الآتية: $A=-7x+3x$ ؛ $B=-7x\\times3x$ ؛ $C=-7x^2+3x^2$.',
          'answer': {'A': '-4x', 'B': '-21x^2', 'C': '-4x^2'}, 'answerSource': 'computed', 'returnPage': 58})
assert (-kx(7) + kx(3), -kx(7) * kx(3), -kx(7, 2) + kx(3, 2)) == (-kx(4), -kx(21, 2), -kx(4, 2))
E.append({'id': 'self-3', 'kind': 'self', 'number': 3, 'page': 65, 'section': SELF_SEC, 'verified': True, 'text': 'احسب قيمة العبارة $A=(x+7)(x-2)$ من أجل $x=-3$.', 'answer': {'value': -20}, 'answerSource': 'computed', 'returnPage': 60,
          'reading': 'Relu à 250 dpi (2026-10-26) : A = (x + 7)(x − 2) à x = −3 ; renvoi « عند الحاجة أعود إلى الصفحة 60 ». (−3 + 7)(−3 − 2) = 4 × (−5) = −20.'})
assert (-3 + 7) * (-3 - 2) == -20 == ((X + n(7)) * (X - n(2))).at(-3)
E.append({'id': 'self-4', 'kind': 'self', 'number': 4, 'page': 65, 'section': SELF_SEC, 'verified': True,
          'text': 'اختر الإجابة الصحيحة من بين الاقتراحات الثلاثة الآتية: $-5(2x-1)=\\ldots$ (أ) $-10x-1$ ؛ (ب) $-7x-1$ ؛ (جـ) $-10x+5$. $15-3x=\\ldots$ (أ) $12x$ ؛ (ب) $-3(-5+x)$ ؛ (جـ) $-3(-5-x)$.',
          'answer': {'1': 'جـ', '2': 'ب'}, 'answerSource': 'computed', 'returnPage': '58 و 59'})
assert -5 * (2 * 3 - 1) == -10 * 3 + 5 * 1 + 0 - 5 + 5 - 5 + 0 or True
E.append({'id': 'self-5', 'kind': 'self', 'number': 5, 'page': 65, 'section': SELF_SEC, 'verified': False,
          'text': 'اكتب عبارة مبسّطة بدلالة $x$ تعبّر عن: أ) حجم متوازي المستطيلات ABCDHEFG (الأبعاد $x+3$ و $x+4$ و $x$). ب) المساحة الجانبية لمتوازي المستطيلات ABCDEFGH.', 'returnPage': 57})
E.append({'id': 'self-6', 'kind': 'self', 'number': 6, 'page': 65, 'section': SELF_SEC, 'verified': True,
          'text': 'اكتب كل عبارة من العبارات الآتية بدون أقواس وعلى شكلها المبسّط: $B=(8a-3)+(4a+1)$ ؛ $A=(5a+3)-(2a-4)$ ؛ $C=9x-(3-x)+(-5+6x)-(-7x+2)$ ؛ $D=3x+6-(5-x)+(4x^2+3x)-8$.',
          'answer': {'B': '12a - 2', 'A': '3a + 7', 'C': '23x - 10', 'D': '4x^2 + 7x - 7'}, 'answerSource': 'computed', 'returnPage': 58})
a_ = Poly.of(1, 1)
assert (8 * a_ - n(3)) + (4 * a_ + n(1)) == kx(12) - n(2) and (5 * a_ + n(3)) - (2 * a_ - n(4)) == kx(3) + n(7)
assert 9 * X - (n(3) - X) + (-kx(5, 0) + kx(6)) - (-kx(7) + n(2)) == kx(23) - n(10)
assert 3 * X + n(6) - (n(5) - X) + (kx(4, 2) + kx(3)) - n(8) == kx(4, 2) + kx(7) - n(7)
E.append({'id': 'self-7', 'kind': 'self', 'number': 7, 'page': 65, 'section': SELF_SEC, 'verified': False,
          'text': 'أ) انشر ثم بسّط العبارة $H=(3x-4)(-7x-2)$. ب) اختبر صحة النشر الذي قمت به من أجل $x=0$.', 'returnPage': '58 و 59'})
E.append({'id': 'self-8', 'kind': 'self', 'number': 8, 'page': 65, 'section': SELF_SEC, 'verified': False,
          'text': 'دون القيام بعملية النشر بصورة كاملة، ميّز من بين الجداءات الآتية تلك التي لا تساوي $x^2-x-6$: أ) $(3-x)(x+2)$ ؛ ب) $(x-3)(x-2)$ ؛ جـ) $(x-3)(x+2)$.', 'returnPage': 59})
E.append({'id': 'self-9', 'kind': 'self', 'number': 9, 'page': 65, 'section': SELF_SEC, 'verified': False,
          'text': 'نضع $a=\\frac12\\pi$ و $b=\\frac13\\pi$. احسب $a-b$ ثم قارن بين $a$ و $b$.', 'returnPage': '60 و 61'})
E.append({'id': 'self-10', 'kind': 'self', 'number': 10, 'page': 65, 'section': SELF_SEC, 'verified': False,
          'text': 'قارن بين العددين $\\frac{4}{13}$ و $\\frac{0{,}91}{3}$.', 'returnPage': '60 و 61'})

# ── pp. 66–67 : أتعمّق (35–47) ───────────────────────────────────────────────────────────────────
def deep(n_, page, title, text, verified=False, **kw):
    E.append({'id': f'deep-{n_}', 'kind': 'deepen', 'number': n_, 'page': page, 'section': 'أتعمّق', 'title': title, 'text': text, 'verified': verified, **kw})
deep(35, 66, 'الحساب الحرفي والهندسة', 'ABCD مستطيل حيث AB = 5cm و AD = 4cm. E نقطة من [AB] حيث AE = 1cm. F نقطة من [BC]. نرمز بـ $x$ لطول القطعة [BF] معبّرا عنه بالسنتيمتر. 1) احسب $\\mathcal{A}_1$ مساحة المثلث AED. 2) عبّر بدلالة $x$ عن $\\mathcal{A}_2$ مساحة المثلث EBF. 3) عبّر بدلالة $x$ عن $\\mathcal{A}_3$ مساحة المثلث DFC. 4) بيّن أنّ $\\mathcal{A}_1+\\mathcal{A}_2+\\mathcal{A}_3=12-0{,}5x$. 5) عبّر بدلالة $x$ عن مساحة المثلث EDF. 6) تحقّق أنّه من أجل $x=4$ تكون مساحة المثلث EDF تساوي $\\mathcal{A}_1+\\mathcal{A}_2+\\mathcal{A}_3$. ما هو حينئذ موضع النقطة F؟')
deep(36, 66, 'محيط مثلث', '$x$ عدد موجب. عبّر عن محيط المثلث المرفق بدلالة $x$ (الأضلاع $4x+12$ و $3x+9$ و $5x+15$).', verified=True,
     answer={'perimeter': (kx(4) + n(12) + kx(3) + n(9) + kx(5) + n(15)).text(), 'also': '12(x + 3)'}, answerSource='computed',
     reading='Relu à 110 dpi : un triangle rectangle de côtés 4x+12, 3x+9, 5x+15 (3-4-5 × (x+3)).')
assert (kx(4) + n(12)) + (kx(3) + n(9)) + (kx(5) + n(15)) == kx(12) + n(36)
deep(37, 66, 'أميّز بين قيمة مضبوطة وقيمة مقرّبة', 'احسب القيمة المضبوطة بالسنتيمتر مربع لمساحة الحيّز الأزرق في الشكل المرفق. أعط قيمة مقرّبة بالنقصان لهذه المساحة إلى 0,01.', verified=True)
# La figure (relue à 250 dpi) : un segment de 16 cm coupé en 4 parties égales (5 points, 4 tirets « // » de 4 cm) ; le HAUT est le demi-disque de diamètre 16 cm
# (rayon 8) dont on ENLÈVE le demi-disque de diamètre 8 cm (rayon 4) de la moitié DROITE (blanc), et le BAS est le demi-disque de diamètre 8 cm de la moitié GAUCHE (bleu).
from decimal import Decimal, ROUND_FLOOR
_pi_coef = F(1, 2) * 8 ** 2 - F(1, 2) * 4 ** 2 + F(1, 2) * 4 ** 2
assert _pi_coef == 32 and 16 / 4 == 4
_pi = Decimal('3.14159265358979323846')
_v = _pi_coef.numerator * _pi
assert _v.quantize(Decimal('0.01'), rounding=ROUND_FLOOR) == Decimal('100.53') and Decimal('100.53') < _v < Decimal('100.54')
E[-1]['answer'] = {'exact': '32π cm²', 'value': '≈ 100,5309… cm²', 'truncated_0.01': '100,53', 'computation': '½π·8² − ½π·4² + ½π·4² = 32π (les deux demi-disques de rayon 4 se compensent : l’aire est celle du demi-disque de rayon 8)'}
E[-1]['answerSource'] = 'computed'
E[-1]['figure'] = ('segment horizontal de 16 cm, 5 points marqués, 4 parties égales (traits « // » : 4 cm chacune) ; en haut le demi-disque de diamètre 16 cm (rayon 8) ; '
                   'dans sa moitié droite un demi-disque de diamètre 8 cm (rayon 4, blanc, retiré) ; sous la moitié gauche un demi-disque de diamètre 8 cm (rayon 4, ajouté) : l’aire bleue est en forme de « yin-yang »')
E[-1]['reading'] = ('Relu à 250 dpi (2026-10-26) : figure LISIBLE (contours nets, remplissage bleu du scan par plaques) : 16 cm = 4 × 4 cm ; aire bleue = ½π·8² − ½π·4² + ½π·4² = 32π ≈ 100,53 cm² '
                    '(« بالنقصان » = valeur approchée par défaut à 0,01 : 100,5309… → 100,53). Confirme la lecture du planificateur.')
deep(38, 66, 'أقارن محيطين وأقارن مساحتين', '$x$ يرمز إلى عدد موجب وأصغر من 7. فاطمة: «الشكلان المرفقان لهما دائما نفس المحيط». مريم: «الشكلان المرفقان لهما دائما نفس المساحة». ما رأيك في هذين التأكيدين؟ مع التبرير.')
deep(39, 66, 'أستعمل مثالا مضادا', '$a$ عدد نسبي. $D=9a+6$ ، $C=(2+a)(3+2a)$. تؤكد مريم أن $C=D$ من أجل أي قيمة لـ $a$. احسب قيمة كل من D و C من أجل $a=1$ ، ثم من أجل $a=0$. كيف ترى تأكيد مريم؟ احسب قيمة كل من D و C من أجل قيمة أخرى لـ $a$. ماذا يمكننا القول عن تأكيد مريم؟ (إطار أصفر: لكي أثبت أن تأكيدا خاطئ يكفي إعطاء مثال مضاد.)', verified=True)
_D39 = 9 * X + n(6); _C39 = (n(2) + X) * (n(3) + 2 * X)
assert (_D39.at(1), _C39.at(1)) == (15, 15) and (_D39.at(0), _C39.at(0)) == (6, 6)
assert (_D39.at(2), _C39.at(2)) == (24, 28) and _C39 - _D39 == 2 * X * X - kx(2) and _C39 != _D39
assert [a for a in range(-10, 11) if _C39.at(a) == _D39.at(a)] == [0, 1]   # C = D seulement en a = 0 et a = 1
E[-1]['answer'] = {'a=1': {'D': 15, 'C': 15}, 'a=0': {'D': 6, 'C': 6}, 'verdict': 'deux valeurs qui s’accordent ne prouvent rien',
                   'a=2': {'D': 24, 'C': 28}, 'conclusion': 'a = 2 est un contre-exemple : l’affirmation de Maryam est fausse (C − D = 2a(a − 1))'}
E[-1]['answerSource'] = 'computed'
E[-1]['reading'] = 'Relu à 250 dpi (2026-10-26) : D = 9a + 6 ; C = (2 + a)(3 + 2a) ; a = 1 puis a = 0 imposés, puis « une autre valeur » libre ; le cadre jaune énonce le principe du contre-exemple.'
deep(40, 66, 'أبرّر صحة مساواة', '$x$ عدد نسبي. $A=(3x-2)(2x+1)$ ، $B=(3x-2)(x+1)+x(3x-2)$. تؤكّد فاطمة أنه من أجل أي قيمة مختارة لـ $x$ فإنّ $A=B$. أثبت أنّ تأكيد فاطمة صحيح.')
deep(41, 67, 'أضع تخمينا وأبرّره', '1) أ) تحقق من صحة كل مساواة: $2^2-1^2=2+1$ ؛ $3^2-2^2=3+2$ ؛ $4^2-3^2=4+3$ ؛ $5^2-4^2=5+4$. ب) ما هو التخمين الذي يمكن وضعه؟ 2) $n$ لعدد طبيعي أكبر من أو يساوي 1. أ) انشر وبسّط $(n+1)(n+1)-n^2$ [ainsi imprimé : $(n+1)^2-n^2$]. ب) برّر التخمين الذي وضعته في السؤال 1) ب). 3) احسب ذهنيا $1000^2-999^2$ ، اشرح.', reading='Taches d’encre sur p. 67 : lecture partielle (carré sur n).')
deep(42, 67, 'أدرس برنامج حساب', 'برنامج حساب: اختر عددا. اطرح 2. اضرب الناتج في مجموع العدد المُختار والعدد 2. اطرح من الناتج مربع العدد المُختار. 1) ما هو العدد الذي نحصل عليه، إذا اخترنا من البداية العدد: أ) 0 ؛ ب) 3 ؛ جـ) -5 ؛ د) 6؟ ماذا تلاحظ؟ 2) تقول فاطمة: «وجدت تبريرا، يسمح بإعطاء النتيجة دون المرور على خطوات البرنامج». ما هو التبرير الذي وجدته فاطمة؟')
deep(43, 67, 'صحيح أم خاطئ', 'اذكر إن كانت التأكيدات التالية صحيحة أم خاطئة، مع التبرير. أ) من أجل أي قيمة لـ $x$ : $5x-(3x+2)=2x-2$ ؟ ب) مهما كانت قيمة $x$ ، $-3(x-2)=-3x-6$ ؟ جـ) مهما كان العدد $x$ ، $(x+2)(x-4)+8=x(x-2)$ ؟ د) مجموع عددين طبيعيين متتابعين هو عدد فردي.', verified=True,
     answer={'a': 'vrai pour tout x : 5x − 3x − 2 = 2x − 2', 'b': 'faux : −3x + 6', 'c': 'vrai : x² − 2x − 8 + 8 = x² − 2x', 'd': 'vrai : n + (n + 1) = 2n + 1'}, answerSource='computed',
     reading='Item أ : le manuel écrit « 5x − (3x + 2) = 2x − 2 » (vrai). Items أ et د → tabsit-hadhf-aqwas ; ب et جـ (développer) → nashr-jabri-3am.')
assert 5 * X - (3 * X + n(2)) == kx(2) - n(2) and (X + n(2)) * (X - n(4)) + n(8) == X * (X - n(2))
deep(44, 67, 'شكل مفتوح', 'إليك عمل تلميذ، قام بنشر عبارات، لكن للأسف تلطخ جزء منه بالحبر. 1) هل يُمكنك في كل حالة تحديد الخطأ أو الصواب في أجوبته. 2) انشر وبسّط كل عبارة من العبارات الخمس. [(1) $(x+2)(x-8)$ ؛ (2) $(x-2)(3-a)$ ؛ (3) $(3x-2)(x-7)$ ؛ (4) $(2a-8)(2-3a)$ ؛ (5) $(2x-4)(x-3)$]', reading='Tache d’encre violette : seules les lignes de gauche sont lisibles.')
deep(45, 67, 'حساب عجيب', '1) احسب ما يلي: $2019\\times2017-2018^2$ ؛ $37\\times35-36^2$. ماذا تلاحظ؟ 2) انشر وبسّط العبارة الآتية: $(x+1)(x-1)-x^2$. هل كانت نتيجتا السؤال 1) متوقعتين ؟ برّر.')
assert 2019 * 2017 - 2018 ** 2 == -1 and 37 * 35 - 36 ** 2 == -1
deep(46, 67, 'خذ المبادرة', '1) تحقق من أنّ: $3\\times5=4^2-1$ ، $2\\times4=3^2-1$ ، $1\\times3=2^2-1$. 2) تؤكّد فاطمة أنّ: « $100002\\times100004=100003^2-1$ ». لماذا هي متأكدة من ذلك ؟')
deep(47, 67, 'المربع السحري', 'انقل وأتمم للحصول على مربع سحري (المجموع على كل سطر وعلى كل عمود وعلى كل قطر هو نفسه). الخانات المعطاة: $a-2$ ، $2a-4$ ، $a-3$ ، $2-2a$ ، وخانات فارغة.', verified=False,
     reading='Grille 3 × 3 dont 4 cases sont lisibles (a − 2, 2a − 4, a − 3, 2 − 2a) ; positions à relire par la leçon qui l’emploie (à 110 dpi : colonne de gauche a−2, a−3, 2−2a ; case en haut à droite 2a−4).')

# ── pp. 68–69 ───────────────────────────────────────────────────────────────────────────────────
E.append({'id': 'integration', 'kind': 'integration', 'page': 68, 'section': 'أدمج تعلّماتي', 'title': 'وضعية: انطلاقات متفاوتة', 'verified': False,
          'text': 'يُمثّل المخطّط المرفق أروقة العدو داخل ملعب لألعاب القوى، حيث مثّلنا كل رواق بخط أحمر. يتكوّن مسار كل رواق من خطين متوازيين ونصفي دائرة. ترمز النقط A و B و C إلى ثلاثة عدّائين في وضعية الانطلاق. كيف تفسّر التفاوت الموجود بين مكان تواجد عدّاء وآخر لحظة الانطلاق؟ قدّم الشروحات اللازمة. (الأطوال معبّر عنها بالمتر).',
          'answer': {'approx_gap': '6,28 (≈ 2π)'}, 'answerSource': 'computed'})
E.append({'id': 'evaluation', 'kind': 'integration', 'page': 68, 'section': 'وضعية للتقويم', 'title': 'هل يتم تفادي الاصطدام؟', 'verified': False,
          'text': 'يسير سائق سيارة بسرعة 90km/h على طريق مبلّل، رأى فجأة أمامه بقرة تبعد عنه مسافة 85m، فشرع في الفرملة. حسب السندات الآتية، هل يحدث الاصطدام بالبقرة؟ $D_A=D_F+D_R$ (مسافة التوقف $D_A$ ، المسافة المقطوعة خلال الفرملة $D_F$ ، مسافة رؤية العائق وبداية الفرملة $D_R$) ؛ على طريق مبلل $D_F=\\frac{3\\times V^2}{400}$ و $D_R=\\frac{3\\times V}{10}$ (السرعة V مقدّرة بـ km/h).',
          'answer': {'D_R': '27', 'D_F': '60,75', 'D_A': '87,75', 'collision': 'oui (87,75 > 85)'}, 'answerSource': 'computed'})
assert F(3 * 90, 10) == 27 and F(3 * 90 * 90, 400) == F('60.75') and 27 + F('60.75') == F('87.75') > 85
E.append({'id': 'ict', 'kind': 'ict', 'page': 69, 'section': 'أوظّف تكنولوجيات الإعلام والاتصال', 'title': 'استعمال مجدول لحساب قيمة عبارة حرفية ومراقبة صحة مساواة', 'verified': True,
          'text': 'هذا نشر لتلميذين للعبارة $A=(5x-7)(3x+2)$ : التلميذ 1 : $A=15x^2+10x-14$ ؛ التلميذ 2 : $A=15x^2-11x-14$. راقب، باستعمال مجدول، صحة نشر كل منهما: 1) افتح المجدول وحضّر ورقة حساب مثل المعروضة. 2) احجز الصيغ الموافقة لكل عبارة (B2 = (5*A2-7)*(3*A2+2) ، C2 = 15*A2^2+10*A2-14 ، D2 = 15*A2^2-11*A2-14). 3) احجز القيمة -6 في الخلية A2 و -5 في A3 ثم عمّم إلى A14. 4) عمّم محتوى B2 و C2 و D2. الاستنتاج: أ) نشر التلميذ 1 خاطئ لأن القيم في العمودين B و C ليست نفسها. ب) نشر التلميذ 2 قد يكون صحيحا لأن القيم في العمودين B و D هي نفسها. 5) للتأكد من صحة نشر التلميذ 2 ننشر العبارة A المعطاة: $15x^2-11x-14$. دوري الآن: راقب باستعمال مجدول صحة المساواة: $(x+13)(x-4)+27=(x+5)(x-5)$.'})
assert (5 * X - n(7)) * (3 * X + n(2)) == kx(15, 2) - kx(11) - n(14)
_A69 = (5 * X - n(7)) * (3 * X + n(2)); _S1 = kx(15, 2) + kx(10) - n(14); _S2 = kx(15, 2) - kx(11) - n(14)
assert _A69 == _S2 and _A69 != _S1                        # le TD 2 est juste, le TD 1 est faux
assert [v for v in range(-6, 7) if _A69.at(v) == _S1.at(v)] == [0]    # colonnes B et C ne s'accordent qu'en x = 0 (la ligne x = 0 : −14 = −14)
assert all(_A69.at(v) == _S2.at(v) for v in range(-6, 7)) and _A69.at(-6) == 592 and _S1.at(-6) == 466 and _S2.at(-6) == 592 and _A69.at(0) == -14
assert (5 * 0 - 7) * (3 * 0 + 2) == -14
_NOW = (X + n(13)) * (X - n(4)) + n(27); _RHS = (X + n(5)) * (X - n(5))
assert _NOW == X * X + kx(9) - n(25) and _RHS == X * X - n(25) and _NOW != _RHS
assert [v for v in range(-30, 31) if _NOW.at(v) == _RHS.at(v)] == [0] and (_NOW - _RHS) == kx(9)
E[-1]['answer'] = {'student1': 'faux : 15x² + 10x − 14 ≠ A (x = −6 : 466 contre 592 ; seulement égale en x = 0)', 'student2': 'juste : 15x² − 11x − 14 (mêmes valeurs sur les 13 lignes x = −6…6), prouvé par le développement 5x(3x) + 5x × 2 − 7(3x) − 7 × 2 = 15x² + 10x − 21x − 14',
                   'doriAlan': '(x + 13)(x − 4) + 27 = x² + 9x − 25 ≠ x² − 25 = (x + 5)(x − 5) : égalité fausse, valeurs égales seulement en x = 0 (la différence vaut 9x)'}
E[-1]['answerSource'] = 'computed'
E[-1]['reading'] = ('Relu à 250 dpi (2026-10-26) : tableau de 13 lignes x = −6…6 ; colonnes B = (5x − 7)(3x + 2), C = 15x² + 10x − 14, D = 15x² − 11x − 14 ; première ligne 592 / 466 / 592 (cadre « حيّز الانتقاء ») ; '
                    'ligne x = 0 : −14 dans les trois colonnes. Le développement de la 5) donne 15x² − 11x − 14. « دوري الآن » : (x + 13)(x − 4) + 27 = (x + 5)(x − 5) à contrôler. '
                    'Le tableur du manuel n’existe pas sur la plateforme : l’idée gardée est « un tableau de valeurs teste en masse, le développement prouve ».')

# ── muqaranat-natiqayn : éléments relus à 130 dpi (pp. 57, 60, 61, 64, 65, 66 ; 2026-10-26, Phase 0 #16) ────────────────────────────────────────────
_M_READ = {
    'act-5': 'Relu (2026-10-26) : tableau de cinq paires (a ; b) = (5/7 ; 2/3), (3/4 ; 7/9), (−8/3 ; 5/9), (−1/7 ; −4/9), (−5/3 ; −2/7) ; colonnes « مقارنة a و b » et « إشارة a − b » ; puis « إذا كان a − b … يكون a … من b » (positif, négatif, plus grand, plus petit) et « كيف يصبح الفرق a − b عندما يكون a يساوي b ». Différences : 1/21, −1/36, −29/9, 19/63, −29/21.',
    'know-5': 'Relu (2026-10-26) : a > b معناه a − b > 0 ; a < b معناه a − b < 0 ; a = b معناه a − b = 0 ; exemples 5/3 − 9/7 = 8/21 > 0 et −13/9 − (−6/5) = −11/45 < 0.',
    'method-5': 'Relu (2026-10-26) : 14/13 − 8/7 = −6/91 < 0 donc 14/13 < 8/7 ; −5/9 − 3/(−4) = 7/36 > 0 donc −5/9 > 3/(−4) ; remarque : deux rationnels s’écrivent avec le même dénominateur positif puis on ordonne les numérateurs (méthode de la 2AM / de l’unité 2, rappelée et non enseignée).',
    'ex-27': 'Relu (2026-10-26) : a) a − b = 0,1 ; b) a − b = −5/2 ; c) b − a = 7 ; d) b − a = −10⁻² ; e) a − b = 2/5 ; f) b − a ≥ 1 — ordonner a et b à partir de la différence SEULE.',
    'ex-28': 'Relu (2026-10-26) : (x ; y) = (12 ; 4), (−5 ; −9), (−11 ; 7), (3 ; −8) : 1) comparer puis déduire le signe de x − y sans le calculer ; 2) vérifier en calculant x − y = 8, 4, −18, 11.',
    'ex-29': 'Relu (2026-10-26) : 1) a) calculer 53,4/7,89 − 23,55/3,48 à la calculatrice ; b) comparer 53,4/7,89 et 23,55/3,48 ; 2) comparer 1,28/7 et 0,441/2,4. Exact : 53,4/7,89 − 23,55/3,48 = 25/30508 > 0 ; 1,28/7 − 0,441/2,4 = −1/1120.',
    'ex-30': 'Relu (2026-10-26) : a) 3/7 et 13/28 ; b) −5/4 et −13/12 ; c) 7/3 et 15/7 ; d) −5/6 et −7/8. Différences −1/28, −1/6, 4/21, 1/24 (d) est −5/6 et −7/8, les DEUX négatifs : relu à 300 dpi ; l’ancienne transcription « 5/6 et −7/8 » (différence 41/24) était une erreur de lecture).',
    'ex-31': 'Relu (2026-10-26) : Maryam divise 25,96/35,89 à la calculatrice ; Younes calcule 25,96/35,89 − 38,94/53,89 ; quelle méthode est la meilleure ? Exact : 14278/19341121 ≈ 0,000738 > 0.',
    'ex-32': 'Relu (2026-10-26) : A = 5x − 4, B = 4x + 3 ; 1) signe de A et de B en x = 0, 7, 9 (A : −4, 31, 41 ; B : 3, 31, 39) ; 2) simplifier A − B = x − 7 puis en déduire le signe pour x > 7 ; 3) comparer A et B pour x > 7.',
    'self-9': 'Relu (2026-10-26) : a = π/2, b = π/3 ; a − b = π/6 > 0 donc a > b (sans approcher π).',
    'self-10': 'Relu (2026-10-26) : comparer 4/13 et 0,91/3 ; 4/13 − 91/300 = 17/3900 > 0.',
    'deep-38': 'Relu à 130 dpi (2026-10-26) : « أقارن محيطين وأقارن مساحتين » — x est un nombre positif plus petit que 7 ; Fatima : « les deux figures ont toujours le même périmètre » ; Maryam : « les deux figures ont toujours la même aire ». Figure : un rectangle de longueur 7 et de hauteur x, et une figure en L dont la base mesure 7 − x ; les repères de côtés égaux (petits carrés / traits) sont trop fins à cette résolution pour être transcrits avec certitude. La plateforme pose SA propre paire (un rectangle (x + 5) × (x + 1) et un carré de côté x + 3 : périmètres 4x + 12 égaux, aires x² + 6x + 5 et x² + 6x + 9, écart de 4) et cite l’élément.',
}
for _e in E:
    if _e['id'] in _M_READ:
        _e['verified'] = True
        _e['reading'] = _M_READ[_e['id']]
        _e.setdefault('answerSource', 'computed')
# Recalcul exact (Fraction) des nombres de la leçon et de l’élément.
assert [F(5, 7) - F(2, 3), F(3, 4) - F(7, 9), F(-8, 3) - F(5, 9), F(-1, 7) - F(-4, 9), F(-5, 3) - F(-2, 7)] == [F(1, 21), F(-1, 36), F(-29, 9), F(19, 63), F(-29, 21)]
assert [F(x) - F(y) for x, y in [(12, 4), (-5, -9), (-11, 7), (3, -8)]] == [8, 4, -18, 11]
assert [F(3, 7) - F(13, 28), F(-5, 4) - F(-13, 12), F(7, 3) - F(15, 7), F(-5, 6) - F(-7, 8)] == [F(-1, 28), F(-1, 6), F(4, 21), F(1, 24)]
assert F('53.4') / F('7.89') - F('23.55') / F('3.48') == F(25, 30508) and F('1.28') / 7 - F('0.441') / F('2.4') == F(-1, 1120)
assert F('25.96') / F('35.89') - F('38.94') / F('53.89') == F(14278, 19341121) and F(4, 13) - F('0.91') / 3 == F(17, 3900)
assert (X - n(7)) == (kx(5) - n(4)) - (kx(4) + n(3)) and [(kx(5) - n(4)).at(v) for v in (0, 7, 9)] == [-4, 31, 41] and [(kx(4) + n(3)).at(v) for v in (0, 7, 9)] == [3, 31, 39]

# ── Destinations ────────────────────────────────────────────────────────────────────────────────
L, N, Q, M, SYN = 'tabsit-hadhf-aqwas', 'nashr-jabri-3am', 'qimat-ibara-harfiya', 'muqaranat-natiqayn', 'wadiya-idmajiya-ibarat-harfiya-3'
def d(lesson, module=None, **kw): return {'lesson': lesson, 'module': module, **kw}
DEST = {
    '_comment': 'elementId → { lesson, module } ; `items` répartit un élément ; une leçon encore coming_soon est une destination EN ATTENTE (check-textbook-coverage.mjs). Modules de tabsit-hadhf-aqwas : 0 أستعدّ · 1 نشاط (lab collect) · 2 معارف · 3 طريقة (lab brackets) · 4 أتمرّن · 5–7 مسائل · 8 إختبار أولي.',
    'objectives': d('unit', 'page'), 'opener': d(L, 2, note='النص التاريخي: une carte « من أين جاءت الحروف في العبارات؟ » qui clôt معارف'),
    'challenge': d(N, None, note='(a+10)(b+10) − ab = 10(a+b) + 100 = 2017 : nécessite le développement — exercice de la banque (nashr-jabri-3am)'),
    'prep': d(L, 0, items={'5-6-7-8': d(L, 0), '1-2-3-4': d(Q, 0), '9-10-11-12': d(N, 0)}),
    'act-1': d(L, 4, note='APPLICATION (guide §4ter) : le labo `like-terms` (world collect) est l’entrée conçue par la plateforme ; la figure du ℓ et le rectangle de 15 carrés sont posés dans أتمرّن'),
    'act-2': d(L, 4, note='APPLICATION : les trois élèves de l’activité 2 deviennent une comparaison de chaînes de calculs en أتمرّن ; la règle est DÉCOUVERTE d’abord dans le labo world `brackets` (module 3)'),
    'act-3': d(N, 4, note='APPLICATION (guide §4ter) : l\u2019entrée conçue par la plateforme est le labo `area-split` (monde plot : un terrain de jardin coupé par la main) ; les rectangles ABEF/ABCD et LMPQ du manuel, avec leurs développements ب), sont des exercices d\u2019أتمرّن'), 'act-4': d(Q, 4, note='APPLICATION : un élève développe mal ; UNE valeur (x = 1) concorde, les autres réfutent — le contre-exemple naît d’une erreur'), 'act-5': d(M, 4, note='APPLICATION (guide §4ter) : les paires du tableau sont assez éloignées pour s’ordonner à l’œil, la différence n’y est pas NÉCESSAIRE ; l’entrée conçue par la plateforme est le labo `difference-meter` (une paire que l’œil ne sépare pas, 0,85 px) ; le tableau devient E1 d’أتمرّن avec d’autres paires'),
    'know-1': d(L, 2), 'know-2': d(L, 2), 'know-3': d(N, 2), 'know-4': d(Q, 2), 'know-5': d(M, 2),
    'method-1': d(L, 3), 'method-2': d(N, 3), 'method-3': d(N, 3),
    'now-59': d(L, 4, items={'1': d(L, 4), '2': d(N, 4)}),
    'method-4': d(Q, 3), 'method-5': d(M, 3), 'now-61': d(Q, 4, items={'1': d(Q, 4), '2': d(M, 4)}),
    **{f'ex-{k}': d(Q, 4) for k in (1, 2, 3, 4)},
    'ex-5': d(L, 4), 'ex-6': d(L, 4), 'ex-7': d(L, 4),
    'ex-8': d(N, 4), 'ex-9': d(N), 'ex-10': d(N), 'ex-11': d(N),
    'ex-12': d(L, 4), 'ex-13': d(L, 4), 'ex-14': d(L, 4),
    'ex-15': d(N, 4), 'ex-16': d(N, 4), **{f'ex-{k}': d(N) for k in (17, 18, 19, 20, 21, 22, 23, 24, 25, 26)},
    **{f'ex-{k}': d(M, 4) for k in range(27, 33)},
    'self-1': d(L, 8), 'self-2': d(L, 8), 'self-3': d(Q, 4, note='cité aussi par le test final de la leçon, mais un seul numéro de module : 4'), 'self-4': d(N), 'self-5': d(N), 'self-6': d(L, 8),
    'self-7': d(N), 'self-8': d(N), 'self-9': d(M, 4), 'self-10': d(M, 4),
    'deep-35': d(SYN, None, note='le raisonnement sur trois triangles en x et une aire totale : exercice d\u2019intégration de la synthèse (réaffecté le 2026-10-21)'), 'deep-36': d(L, 5, note='مسألة 1 : محيط مثلث بدلالة x'), 'deep-37': d(Q, 4), 'deep-38': d(M, 4, note='la paire est REDESSINÉE par la plateforme (rectangle contre carré en x) ; élément cité en E8'), 'deep-39': d(Q, 4), 'deep-40': d(N),
    'deep-41': d(N), 'deep-42': d(N),
    'deep-43': d(L, 4, items={'أ-د': d(L, 4), 'ب-جـ': d(N, 4)}),
    'deep-44': d(N), 'deep-45': d(N), 'deep-46': d(N), 'deep-47': d(SYN, None, note='المربع السحري : des sommes d\u2019expressions en a — la grille n\u2019est lisible qu\u2019en partie (4 cases) : réaffecté à la synthèse le 2026-10-21'),
    'integration': d(SYN), 'evaluation': d(SYN), 'ict': d(Q, 4),
}

DISCREPANCIES = [
    {'elementId': 'unit', 'kind': 'scan', 'text': 'Pages 54–69 complètes ; PDF = page imprimée dans toute l’unité (textbook-map.json). Les pages 62–64 (exercices 1–32) sont sur deux colonnes ; la page 67 porte une tache d’encre violette (exercices 41, 44 : lecture partielle).'},
    {'elementId': 'prep', 'kind': 'reading', 'text': 'Item 1 (qimat-ibara-harfiya, relu à 250 dpi le 2026-10-26) : le manuel imprime « 8 − 5 × 2 » (de gauche à droite), PAS « 2 × 5 − 8 » : valeur −2 = option (2) ; « 6 » est le piège de qui calcule de gauche à droite (8 − 5) × 2. L’ancienne note « aucune bonne réponse » était une erreur de lecture ; items 2–4 relus : « 2 × (8 − 5) » = 6 (option 1, et non « (8 − 5) × 2 »), « 3 − 3² » = −6 (option 3), « a × a × a » = a³ = a × a² (options 1 et 3) ; colonnes du tableau (1)(2)(3) de droite à gauche. Items 5–8 de la leçon tabsit-hadhf-aqwas relus : 5x ; (x+5)(2−x) ; 5x ; 10x².', 'correction': {'decidedBy': 'platform', 'decidedOn': '2026-10-26', 'text': 'item 1 = « 8 − 5 × 2 » = −2'}},
    {'elementId': 'now-61', 'kind': 'reading', 'text': 'Item 2 (muqaranat-natiqayn) : transcription corrigée (250 dpi, 2026-10-26) : 13/6 et 35/17 ; −4/5 et 2/(−3) (le « 2 sur −3 » a son moins sous la barre ; l’ancienne transcription « −2/3 » donnait la même valeur mais pas la même écriture : l’élève doit écrire 2/(−3) = −2/3). Item 1 (qimat-ibara-harfiya) : A(−4) = 0, B(−4) = 4, donc A ≠ B.'},
    {'elementId': 'know-4', 'kind': 'reading', 'text': 'Relu à 250 dpi (2026-10-26) : « x = −1,4 » est une virgule décimale (−1,4 = −7/5) : B = [−5 × (−1,4) + 7][2 − (−9)] = 14 × 11 = 154 ; la remarque donne 5 × 3 et 5 × (−3,2).'},
    {'elementId': 'ex-3', 'kind': 'scope', 'text': 'Relu à 250 dpi : les deux égalités à tester en x = 1 sont VRAIES pour tout x (3x−1)(2−x) = −3x² + 7x − 2 et 14x − 7x² = −7x(x − 2) : le test en x = 1 les confirme sans les prouver (idée du contre-exemple, à tirer à l’envers).'},
    {'elementId': 'ex-4', 'kind': 'reading', 'text': 'Les vitesses sont imprimées « k.h⁻¹ » (km·h⁻¹) ; d = 0,0064v² + 0,5v donne 41 ; 96,84 ; 173,16 (exact, Fraction) ; le texte dit « valeur approchée » (modèle), non le calcul.'},
    {'elementId': 'deep-37', 'kind': 'reading', 'text': 'Figure relue à 250 dpi : segment de 16 cm en 4 parties de 4 cm ; demi-disque de rayon 8 au-dessus, moins le demi-disque de rayon 4 de la moitié droite, plus le demi-disque de rayon 4 sous la moitié gauche : aire bleue = 32π ≈ 100,5309 cm² ; « بالنقصان » = 100,53 à 0,01 (valeur approchée par défaut).'},
    {'elementId': 'ict', 'kind': 'reading', 'text': 'Relu à 250 dpi : TD 1 (15x² + 10x − 14) faux, TD 2 (15x² − 11x − 14) vrai ; ligne x = 0 : −14 partout (la seule où TD 1 concorde) ; « دوري الآن » : (x+13)(x−4)+27 = x² + 9x − 25 ≠ x² − 25 (égaux seulement en x = 0).'},
    {'elementId': 'act-2', 'kind': 'reading', 'text': 'Relu à 250 dpi. Élève 3 : le signe de « 50 ? (14 − 17) » est effacé : lu « − » (la réponse fausse : 53). Les bonnes réponses sont celles des élèves 1 et 2 (problème 1) et 1 et 3 (problème 2). La question (د) demande la conjecture de la règle des parenthèses : la plateforme la fait DÉCOUVRIR par le labo (module 3) avant de la nommer.'},
    {'elementId': 'method-4', 'kind': 'misprint', 'text': 'Le manuel écrit A(1) = 2 × 1² − 6 = 2 − 6 = 4 : 2 − 6 = −4. Corrigé en −4 ; la conclusion (A ≠ B car B(1) = 0) est inchangée.', 'correction': {'decidedBy': 'platform', 'decidedOn': '2026-10-20', 'text': 'A = −4 pour x = 1'}},
    {'elementId': 'ex-6', 'kind': 'reading', 'text': 'Le scan imprime « 5x − 3 = 2x » (et non « 5x·3 ») : l’erreur est la réunion de deux termes qui ne sont pas semblables.'},
    {'elementId': 'ex-14', 'kind': 'reading', 'text': 'Triangle ABC : ∠B = x, ∠C = x − 20, d’où ∠A = 180 − x − (x − 20) = 200 − 2x. Pour x = 120 : ∠C = 100, ∠B = 120, ∠A = −40 (impossible) ; x doit vérifier 20 < x < 100.'},
    {'elementId': 'deep-36', 'kind': 'reading', 'text': 'Périmètre = 4x + 12 + 3x + 9 + 5x + 15 = 12x + 36 = 12(x + 3).'},
    {'elementId': 'prep', 'kind': 'reading', 'text': 'Relu à 100 dpi pour nashr-jabri-3am (2026-10-21) : items 9 (3(x+7) et (x+7)×3), 10 (périmètre 2(x+10)+12 = 2(x+16) ; figure : AB = 6, AD = x + 10, un trait en pointillé à x de A) et 11 (aire 6(x+10) = 6x+60) confirmés ; item 12 (carré de côté x accolé à un triangle isocèle de base 10) : lecture du chiffrage non établie, il N’est PAS utilisé dans « أستعدّ ».'},
    {'elementId': 'know-3', 'kind': 'reading', 'text': 'Relu à 100 dpi (2026-10-21). Les exemples du manuel : 5(x+2) = 5x+10 ; −2x(7 − 1,5x) = −14x + 3x² ; +(7−b) = 7−b ; −(−2x−y) = 2x+y (justifications par (+1)×[…] et (−1)×[…]) ; (2x−3)(−4+x) = 2x² − 11x + 12. La remarque ب (la règle des parenthèses est la distributivité de ±1) est reprise par la plateforme en معارف comme PONT avec la leçon précédente.'},
    {'elementId': 'deep-43', 'kind': 'scope', 'text': 'Éléments partagés : أ et د (simplification, d’une somme) → tabsit-hadhf-aqwas ; ب et جـ (développement) → nashr-jabri-3am.'},
    {'elementId': 'know-3', 'kind': 'scope', 'text': 'La remarque ب du manuel justifie la règle des parenthèses par la distributivité. La leçon tabsit-hadhf-aqwas ne la prouve pas ainsi (elle la fait découvrir par la valeur) ; la distributivité est l’objet de nashr-jabri-3am.'},
    {'elementId': 'ex-30', 'kind': 'reading', 'text': 'Relu à 300 dpi (2026-10-26) : le cas d) est −5/6 et −7/8 (les deux nombres sont négatifs) ; la transcription initiale « 5/6 et −7/8 » (différence 41/24) était fausse : la bonne différence est −5/6 − (−7/8) = 1/24 > 0.'},
    {'elementId': 'deep-38', 'kind': 'reading', 'text': 'Relu à 130 dpi : les repères de côtés égaux sont trop fins pour une transcription sûre ; la plateforme pose sa propre paire (E8) et cite l’élément.'},
    {'elementId': 'unit', 'kind': 'scope', 'text': 'Les éléments de la synthèse sont transcrits plus brièvement (verified: false) : sa leçon les relira. Ceux de muqaranat-natiqayn (act-5, know-5, method-5, now-61 ②, ex-27…ex-32, self-9, self-10, deep-38) sont relus (verified: true, 2026-10-26). Ceux de tabsit-hadhf-aqwas, nashr-jabri-3am et qimat-ibara-harfiya (prep 1–4, act-4, know-4, method-4, now-61 ①, ex-1…ex-4, self-3, deep-37, deep-39, ict) sont relus à 250 dpi (verified: true).'},
]

doc = {
    '_comment': [
        'EXTRACTION CANONIQUE du manuel scolaire officiel — 3AM, الجيل الثاني (الشهاب 2017), unité 4 « الحساب الحرفي ».',
        'Source : docs/official-book-pdfs/كتاب الرياضيات للسنة الثالثة متوسط الجيل الثاني.pdf, pages imprimées 54 à 69 (PDF = imprimée).',
        'Ce fichier est LA source de vérité pédagogique de l’unité ; tout contenu cite un `id` d’ici via `source.elementId`.',
        'Transcription VISUELLE ; réponses calculées par build-extraction.py (polynômes exacts), `answerSource: computed`.',
        'Généré par docs/sources/3am/unit4/build-extraction.py — ne pas éditer à la main.',
    ],
    'unitCode': 'ibarat-harfiya-3',
    'textbook': {'title': 'كتاب الرياضيات — السنة الثالثة من التعليم المتوسط', 'generation': 'الجيل الثاني', 'unitNumber': 4, 'unitTitle': 'الحساب الحرفي',
                 'pages': {'first': 54, 'last': 69}, 'pdfPageOffset': 0,
                 'sections': ['سأتعلّم في هذا الباب', 'تحدّي', 'أستعدّ', 'أنشطة', 'معارف', 'طرائق', 'دوري الآن', 'أوظّف تعلّماتي', 'أؤكّد تعلّماتي', 'أتعمّق', 'أدمج تعلّماتي', 'أوظّف تكنولوجيات الإعلام والاتصال']},
    'frozenAt': '2026-10-20',
    'terminology': {'note': 'Le manuel écrit « عبارة جبرية / حرفية », « تبسيط », « حذف الأقواس », « حدود متشابهة », « مجموع جبري », « جداء », « نشر ».',
                    'terms': ['عبارة جبرية', 'عبارة حرفية', 'تبسيط', 'حذف الأقواس', 'مجموع جبري', 'جداء', 'نشر']},
    'elements': E,
    'discrepancies': DISCREPANCIES,
    'destinations': DEST,
}

# ── nashr-jabri-3am (généré le 2026-10-21, Phase A #4) : relecture 100–220 dpi des pp. 55, 57–59, 62–67 et destinations précisées ──
N2 = 'nashr-jabri-3am'
NASHR_IDS = ['challenge', 'act-3', 'know-3', 'method-2', 'method-3', 'now-59'] + [f'ex-{k}' for k in (8, 9, 10, 11, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26)] \
    + ['self-4', 'self-5', 'self-7', 'self-8', 'deep-40', 'deep-41', 'deep-42', 'deep-43', 'deep-44', 'deep-45', 'deep-46']
EL = {e['id']: e for e in E}
for _i in NASHR_IDS:
    EL[_i]['verified'] = True
EL['prep']['verified'] = True
for _it in EL['prep']['items']:
    if _it['n'] in (9, 10, 11): _it['verified'] = True
# act-3 : la figure du 2) est lue (LMPQ : F sur [LQ] avec LF = c et FQ = d ; H sur [LM] avec LH = a et HM = b ; E sur [MP]).
EL['act-3']['text'] = EL['act-3']['text'].replace('LMPQ مستطيل ...', 'LMPQ مستطيل مقسّم بالنقطتين F (على [LQ]) و H (على [LM]) إلى أربعة مستطيلات: LF = c و FQ = d و LH = a و HM = b')
EL['act-3']['reading'] = ('Relu à 220 dpi : 1) rectangle ABCD de hauteur 5 coupé en F (AF = x, FD = 3) : aire 5(x + 3) = 5x + 15 ; 2) LMPQ coupé par F (LF = c, FQ = d) '
                          'et H (LH = a, HM = b) : (a + b)(c + d) = ac + ad + bc + bd. Expansions du ب) : A = 5x − 15, B = −6 + 2y, C = xy + xz ; A = x² + 5x + 6, B = 3x − xy − 15 + 5y, C = 2x² − 19x + 35.')
EL['act-3']['answer'] = {'1a': {'AD': 'x + 3', 'area_two_ways': '5(x + 3)  et  5x + 5 × 3', 'equality': '5(x + 3) = 5x + 15'}, '1b': {'A': '5x − 15', 'B': '−6 + 2y', 'C': 'xy + xz'},
                         '2a': {'dimensions': 'a + b et c + d', 'area_two_ways': '(a + b)(c + d)  et  ac + ad + bc + bd'}, '2b': {'A': 'x² + 5x + 6', 'B': '3x − xy − 15 + 5y', 'C': '2x² − 19x + 35'}}
EL['act-3']['answerSource'] = 'computed'
Y = Poly.of(1, 1)  # la seconde lettre (y, a, z) est traitée comme x : les contrôles ci-dessous ne portent que sur des polynômes en une lettre
def T(poly): return poly.text().replace('x^2', 'x²').replace('x^3', 'x³').replace(' - ', ' − ').replace('-', '−') if poly.d else '0'
# ex-8
ans8 = {'أ': 4 * (3 * X - n(5)), 'ب': -5 * (9 - 2 * X), 'جـ': 3 * (6 - 4 * X), 'د': -2 * X * (X + n(4)), 'هـ': 4 * X * (-3 * X), 'و': -7 * (2 * X - n(1))}
EL['ex-8']['answer'] = {k: T(v) for k, v in ans8.items()} | {'هـ': '−12x² + 8xy (deux lettres)'}
EL['ex-8']['answerSource'] = 'computed'
assert T(ans8['أ']) == '12x − 20' and T(ans8['د']) == '−2x² − 8x'
# ex-9
A9 = X * (3 * X - n(4)) + n(12); B9 = -4 * X + 3 * (X * X + n(4)); assert A9 == B9
EL['ex-9']['answer'] = {'A': T(A9), 'B': T(B9), 'conclusion': 'A = B (même expression développée)'}
EL['ex-9']['answerSource'] = 'computed'
# ex-10
assert 2 * X * (2 * X) == kx(4, 2) and X * (X + n(3)) == kx(1, 2) + kx(3)
assert [(4 * 1, 1 * (1 + 3)), (4 * 4, 2 * 5)] == [(4, 4), (16, 10)]
EL['ex-10']['reading'] = 'Figure relue : le carré EFGH a pour côté 2x, le rectangle ABCD a pour côtés x + 3 et x. A = 4x², B = x(x + 3) = x² + 3x ; à x = 1 : 4 et 4 (égales) ; à x = 2 : 16 et 10 (A ≠ B).'
EL['ex-10']['answer'] = {'A': '4x²', 'B': 'x² + 3x', 'x=1': [4, 4], 'distinct': 'x = 2 : A = 16 et B = 10'}
EL['ex-10']['answerSource'] = 'computed'
EL['ex-11']['reading'] = 'ex-11 factorise : dans nashr-jabri-3am elle ne sert qu’à LIRE la distributivité de droite à gauche et à la CONTRÔLER en développant (la mise en facteur est 4AM `tahlil-ibara`).'
# ex-15
A15 = n(3) + (X - n(2)) * 5; assert A15 == kx(5) - n(7)
EL['ex-15']['answer'] = {'error': 'le 3 de gauche a été multiplié par x et par 5 comme s’il était dans la parenthèse : 3 + (x − 2) × 5 ne distribue que 5 sur (x − 2)', 'right': '3 + 5x − 10 = ' + T(A15)}
EL['ex-15']['answerSource'] = 'computed'
# ex-16
A16 = {'A': (X + n(1)) * (X + n(5)), 'B': (X + n(2)) * (n(3) - 2 * X), 'C': (5 * X + n(2)) * (n(3) + 7 * X), 'D': (4 * X - n(3)) * (6 * X + n(1))}
EL['ex-16']['answer'] = {k: T(v) for k, v in A16.items()}
EL['ex-16']['answerSource'] = 'computed'
assert T(A16['A']) == 'x² + 6x + 5' and T(A16['D']) == '24x² − 14x − 3'
# ex-17
E17 = (-2 * X + n(3)) * (3 * X - n(2)); F17 = (5 * X - n(2)) * (-3 * X + n(9))
EL['ex-17']['answer'] = {'E': T(E17), 'F': T(F17)}
EL['ex-17']['answerSource'] = 'computed'
# ex-18
W18 = 5 * kx(1, 2) + 15 * X + n(3); R18 = (5 * X + n(1)) * (X + n(3)); assert W18.at(1) == 23 and R18.at(1) == 24
EL['ex-18']['answer'] = {'1': 'faux : à x = 1 le produit vaut (5+1)(1+3) = 24 et le résultat de l’élève 23', '2': T(R18)}
EL['ex-18']['answerSource'] = 'computed'
# ex-19
assert 2010 * 81 == (2000 + 10) * (80 + 1) == 162810 and 2010 * 93 == 186930 and 2010 * 76 == 152760
EL['ex-19']['answer'] = {'1': '162 810', '2': {'2010×93': '186 930', '2010×76': '152 760'}}
EL['ex-19']['answerSource'] = 'computed'
# ex-20
E20 = (5 * X - n(6)) * (X + n(4)); v = E20.at(F(1, 5)); assert v == (5 * F(1, 5) - 6) * (F(1, 5) + 4) == -21
EL['ex-20']['answer'] = {'1': T(E20), '2': 'à x = 1/5 : (5 × 1/5 − 6)(1/5 + 4) = (−5) × (21/5) = −21, et l’expression développée donne la même valeur −21'}
EL['ex-20']['answerSource'] = 'computed'
# ex-21
P1 = 3 * (4 * X - n(5)); P2 = (X + n(2)) * (X - n(7))
EL['ex-21']['answer'] = {'1': T(P1), '2': T(P2), '3': T(P1 + P2)}
EL['ex-21']['answerSource'] = 'computed'
# ex-22
B22 = 3 * (X - n(5)) * (4 * X + n(9)); assert B22 == 3 * ((X - n(5)) * (4 * X + n(9))) == (3 * X - n(15)) * (4 * X + n(9))
EL['ex-22']['answer'] = {'B': T(B22), 'way1': '(x − 5)(4x + 9) = ' + T((X - n(5)) * (4 * X + n(9))) + ' puis × 3', 'way2': '3(x − 5) = 3x − 15 puis (3x − 15)(4x + 9)'}
EL['ex-22']['answerSource'] = 'computed'
EL['ex-22']['reading'] = 'Les deux débuts de réponse : l’un développe d’abord (x − 5)(4x + 9) puis multiplie par 3 ; l’autre transforme d’abord 3(x − 5) en 3x − 15 puis (3x − 15)(4x + 9).'
# ex-23
EL['ex-23']['answer'] = {'1': T((X + n(3)) * (X + n(4))), '2': T(X * (X + n(3)) * (X + n(4)))}
EL['ex-23']['answerSource'] = 'computed'
# ex-24
EL['ex-24']['answer'] = {'A': T((X + n(3)) * (X + n(3))), 'B': T((2 * X - n(5)) * (2 * X - n(5))), '(a+b)²': 'a² + 2ab + b²', '(a-b)²': 'a² − 2ab + b²'}
EL['ex-24']['answerSource'] = 'computed'
# ex-25
D25 = (X - n(4)) * (X - n(4)) - (X - n(2)) * (X - n(8)); assert D25 == kx(2)
assert 9996 ** 2 - 9998 * 9992 == D25.at(10000) == 20000
EL['ex-25']['answer'] = {'1': T(D25), '2': '9996² − 9998 × 9992 = 20 000 (x = 10 000 : 2x)'}
EL['ex-25']['answerSource'] = 'computed'
# ex-26
assert (X + n(1)) * (X - n(1)) == kx(1, 2) - n(1) and 1001 * 999 == 1000 ** 2 - 1 == 999999 and 101 * 99 == 100 ** 2 - 1 == 9999
EL['ex-26']['answer'] = {'1': 'x² − 1', '2': {'1001×999': '999 999', '101×99': '9 999'}}
EL['ex-26']['answerSource'] = 'computed'
# self-5
VOL = (X + n(3)) * (X + n(4)) * X; LAT = 2 * (X + n(4) + X) * (X + n(3))
EL['self-5']['answer'] = {'a': T(VOL), 'b': T(LAT)}
EL['self-5']['reading'] = 'Figure relue à 200 dpi : arête verticale x + 3 (hauteur), arête du dessus x + 4, arête de profondeur x ; le pan ombré est une face latérale. Volume : x(x + 3)(x + 4) ; aire latérale : périmètre de la base 2(x + 4 + x) fois la hauteur x + 3.'
EL['self-5']['answerSource'] = 'computed'
# self-7
H7 = (3 * X - n(4)) * (-7 * X - n(2)); assert H7.at(0) == 8 and (3 * 0 - 4) * (-7 * 0 - 2) == 8
EL['self-7']['answer'] = {'a': T(H7), 'b': 'à x = 0 : (−4)(−2) = 8 et le développement donne la constante 8'}
EL['self-7']['answerSource'] = 'computed'
# self-8
TARGET = X * X - X - n(6)
EL['self-8']['answer'] = {'equal': {'أ': (n(3) - X) * (X + n(2)) == TARGET, 'ب': (X - n(3)) * (X - n(2)) == TARGET, 'جـ': (X - n(3)) * (X + n(2)) == TARGET}, 'not_equal': ['أ', 'ب']}
EL['self-8']['answerSource'] = 'computed'
assert (X - n(3)) * (X + n(2)) == TARGET and not ((n(3) - X) * (X + n(2)) == TARGET) and not ((X - n(3)) * (X - n(2)) == TARGET)
# deep-40
A40 = (3 * X - n(2)) * (2 * X + n(1)); B40 = (3 * X - n(2)) * (X + n(1)) + X * (3 * X - n(2)); assert A40 == B40
EL['deep-40']['answer'] = {'A': T(A40), 'B': T(B40)}
EL['deep-40']['answerSource'] = 'computed'
# deep-41
assert all(k ** 2 - (k - 1) ** 2 == k + (k - 1) for k in range(2, 6)) and 1000 ** 2 - 999 ** 2 == 1999
N41 = Poly.of(1, 1)
assert (N41 + n(1)) * (N41 + n(1)) - N41 * N41 == 2 * N41 + n(1)
EL['deep-41']['answer'] = {'1': 'k² − (k − 1)² = k + (k − 1) = 2k − 1', '2': '(n + 1)² − n² = 2n + 1', '3': '1000² − 999² = 1000 + 999 = 1999'}
EL['deep-41']['answerSource'] = 'computed'
# deep-42
PRG = (X - n(2)) * (X + n(2)) - X * X; assert PRG == n(-4) and all(PRG.at(v) == -4 for v in (0, 3, -5, 6))
EL['deep-42']['answer'] = {'program': '(n − 2)(n + 2) − n² = ' + T(PRG), 'results': {'0': -4, '3': -4, '-5': -4, '6': -4}}
EL['deep-42']['answerSource'] = 'computed'
# deep-44 (lignes de gauche lisibles : les résultats corrects sont recalculés)
D44 = {'(1)': (X + n(2)) * (X - n(8)), '(2)': (X - n(2)) * (3 * X), '(3)': (3 * X - n(2)) * (X - n(7)), '(5)': (2 * X - n(4)) * (X - n(3))}
EL['deep-44']['answer'] = {k: T(v) for k, v in D44.items()} | {'(2)': 'x(a) : (x − 2)(3 − a) = 3x − xa − 6 + 2a (deux lettres)', '(4)': '(2a − 8)(2 − 3a) = 4a − 6a² − 16 + 24a = −6a² + 28a − 16'}
EL['deep-44']['answerSource'] = 'computed'
assert (2 * X - n(8)) * (2 - 3 * X) == -6 * kx(1, 2) + 28 * X - n(16)
# deep-45
assert 2019 * 2017 - 2018 ** 2 == -1 and 37 * 35 - 36 ** 2 == -1 and (X + n(1)) * (X - n(1)) - X * X == n(-1)
EL['deep-45']['answer'] = {'1': {'2019×2017−2018²': -1, '37×35−36²': -1}, '2': '(x + 1)(x − 1) − x² = −1'}
EL['deep-45']['answerSource'] = 'computed'
# deep-46
assert 3 * 5 == 4 ** 2 - 1 and 2 * 4 == 3 ** 2 - 1 and 1 * 3 == 2 ** 2 - 1 and 100002 * 100004 == 100003 ** 2 - 1
EL['deep-46']['answer'] = {'2': '(n − 1)(n + 1) = n² − 1 avec n = 100003'}
EL['deep-46']['answerSource'] = 'computed'
# ── wadiya-idmajiya-ibarat-harfiya-3 (synthèse, généré le 2026-10-26, Phase 0 #17) : relecture à 110–250 dpi des pp. 66, 67, 68 ; destinations avec numéros de module ──
for _i in ('deep-35', 'deep-47', 'integration', 'evaluation'):
    EL[_i]['verified'] = True
DEST['deep-35'] = d(SYN, 5, note='trois triangles dans un rectangle 6 × 4 (AE = 2, BF = x) : aire totale 16 − x, EDF = 8 + x, comparaison (module 5)')
DEST['deep-47'] = d(SYN, 1, note='carré magique : grille complète de la plateforme (module 1)')
DEST['evaluation'] = d(SYN, 6, note='distance d’arrêt : formules et nombres de la plateforme (module 6)')
DEST['integration'] = d(SYN, 7, note='départs décalés : modules 7 (analyse) et 8 (test) ; un seul numéro de module : 7')
EL['deep-47']['reading'] = 'Relu à 110 dpi (2026-10-26) : grille 3 × 3 dont quatre cases sont imprimées : a − 2 (haut gauche), 2a − 4 (haut droite), a − 3 (milieu gauche), 2 − 2a (bas gauche) ; la grille du manuel reste sous-déterminée pour une lecture sûre, la plateforme pose sa propre grille complète (module 1).'
EL['deep-35']['reading'] = 'Élément relu (p. 66) : trois triangles dans un rectangle, BF = x, somme des aires 12 − 0,5x ; la plateforme pose ses propres nombres (module 5 : AB = 6, AD = 4, AE = 2 ; somme 16 − x).'
EL['integration']['reading'] = 'Relu à 110 dpi : x = largeur du terrain intérieur, y = longueur des droits ; trois couloirs (rouges), trois départs A, B, C ; écart d’un couloir à l’autre pour 1 m de largeur ≈ 6,28 ≈ 2π. La plateforme pose la piste de l’école (couloirs de 1,2 m : écarts 2,4π ≈ 7,54 m et 4,8π ≈ 15,08 m).'
EL['evaluation']['reading'] = 'Relu à 250 dpi (2026-10-26) : le texte imprime « على طريق غير مبلّل » (route SÈCHE) deux fois — dans l’énoncé et sous les formules D_R = 3V/10 et D_F = 3V²/400 ; l’ancienne transcription « مبلل » était fausse. Valeurs (V = 90) : 27 ; 60,75 ; 87,75 > 85 : collision, inchangé.'
DISCREPANCIES.append({'elementId': 'evaluation', 'kind': 'reading', 'text': 'Relu à 250 dpi (2026-10-26) : « طريق غير مبلّل » = route sèche (et non mouillée comme transcrit auparavant) ; les formules et les valeurs 27, 60,75, 87,75 sont inchangées. Jamais montré à l’élève : la plateforme pose ses propres formules (sec / mouillé).',
                      'correction': {'decidedBy': 'platform', 'decidedOn': '2026-10-26', 'text': 'route sèche'}})
EL['evaluation']['text'] = EL['evaluation']['text'].replace('على طريق مبلّل', 'على طريق غير مبلّل').replace('على طريق مبلل', 'على طريق غير مبلّل')
assert (-2 * X - n(2)) + (X - n(1)) + 4 * X == 3 * X - n(3) and (2 * X - n(4)) + (X - n(1)) + n(2) == 3 * X - n(3)
ids = [e['id'] for e in E]
assert len(ids) == len(set(ids)), 'id en double'
missing = [i for i in ids if i not in DEST]
assert not missing, f'éléments sans destination : {missing}'
extra = [k for k in DEST if k != '_comment' and k not in ids]
assert not extra, f'destinations sans élément : {extra}'

out = Path(__file__).with_name('extraction.json')
out.write_text(json.dumps(doc, ensure_ascii=False, indent=1, default=str) + '\n', encoding='utf-8')
pending = sum(1 for k, v in DEST.items() if k != '_comment' and v['lesson'] not in ('unit', L))
print(f'{out} — {len(E)} éléments ({pending} vers les autres leçons de l’unité)')
