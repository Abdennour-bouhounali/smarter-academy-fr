#!/usr/bin/env python3
"""Génère docs/sources/3am/unit1/extraction.json — 3AM, unité 1 « الأعداد النسبية » (manuel الجيل الثاني, pp. 6–21 ; dans cette unité
PDF = page imprimée + 1, `textbook-map.json` : p. 6 = PDF 7 … p. 21 = PDF 22).

Transcription VISUELLE (le scan n'a pas de couche texte) : pages rendues à 110–230 dpi, les passages douteux relus à 300–600 dpi.
Le texte arabe est celui du manuel ; les réponses attendues sont CALCULÉES ici avec `fractions.Fraction` (décimaux lus comme fractions
exactes, jamais tapés) et chaque énoncé dont le manuel imprime des options / des figures est RE-vérifié par `assert`.

LECTURE DU SCAN — LE PIÈGE « RTL » : le manuel est composé en paragraphes de droite à gauche. Une expression numérique composée
UNIQUEMENT de nombres et de signes (sans mot arabe) y est rendue À L'ENVERS pour ses opérandes : « (11 - 8) - 7 » imprimé est en fait
« 7 - (8 - 11) », « (4-)-(3-) » est « (-3) - (-4) », « 13+7-9+5- » est « -5+9-7+13 ». Pour une somme ou un produit seul cela ne change
rien ; pour une différence ou un quotient le sens change. Le signe d'un nombre rendu APRÈS ses chiffres (« 4- ») est l'indice du
renversement ; dans les exercices pp. 14–17 (signe devant le nombre : « -80 ») les expressions sont composées de gauche à droite
et l'ordre imprimé est l'ordre réel. Chaque item concerné est contrôlé contre ses options imprimées et le fait est noté dans
`reading` / `discrepancies`.

L'unité est générée LEÇON PAR LEÇON (cycle moyen, phase 3). Première leçon : jidaa-adadayn-nisbiyayn (2026-10-25) — ses éléments sont
relus à 200 dpi deux fois (`verified: True`) ; ceux de jidaa-ida-nisbiya (relus le 2026-10-26, 500 dpi pour now-11) sont `verified: True` ; ceux de qismat-nisbiyayn et de la synthèse sont transcrits aussi
fidèlement mais marqués `verified: False` : leur leçon les relira. Modules de jidaa-adadayn-nisbiyayn : 0 أستعدّ · 1 نشاط ·
2 معارف · 3 طريقة · 4 أتمرّن · 5–7 مسائل · 8 إختبار أولي ; `None` = banque d'exercices (la banque la cite).

FRONTIÈRES ENTRE LES LEÇONS (à écrire une fois, plan README « Boundaries ») :
  • jidaa-adadayn-nisbiyayn (r01, première moitié) = le produit de DEUX nombres relatifs (entiers ou décimaux) : neg × pos comme addition
    répétée, la règle des signes, sa justification par la distributivité (k × b + k × (−b) = k × 0 = 0), le calcul (signe, puis produit des
    distances), et a × 0 = 0. Elle ne multiplie jamais trois facteurs, ne nomme jamais « المعاكس » comme ×(−1), ne met jamais au carré,
    ne divise jamais.
  • jidaa-ida-nisbiya (r01, seconde moitié) = un produit de PLUSIEURS facteurs : (−1) × a = −a (l'opposé), les rôles du signe « − », le
    signe par la parité du nombre de facteurs négatifs, réordonner les facteurs pour calculer mentalement, le carré (−a)² = a² ≥ 0, et la
    distributivité dans les deux sens sur des NOMBRES (k × a + k × b = k × (a + b), k × (a − b) = k × a − k × b). Elle n'utilise jamais de
    lettres pour la distributivité (k(a + b) avec une lettre est `nashr-jabri-3am`, publiée ; les termes semblables sont
    `tabsit-hadhf-aqwas`, publiée), n'écrit jamais aⁿ au-delà de ², ne confronte jamais −a² et (−a)² (`quwat-adad-nisbi` P4, publiée),
    ne divise jamais.
  • qismat-nisbiyayn (r02) = a ÷ b = q ⇔ b × q = a (b ≠ 0), le facteur manquant, la règle des signes du quotient (aussi pour un quotient de
    produits), calculer un quotient (décimal ou écrit en fraction), −a/b = a/−b = −(a/b) et −a/−b = a/b, puis organiser une série de
    calculs sur les relatifs (parenthèses → × ÷ → + −). Elle ne nomme jamais « عدد ناطق », ne simplifie jamais une fraction au-delà du
    déplacement du signe, ne divise jamais en multipliant par l'inverse (tout cela est `kusur-natiqa`, unité 2), ne calcule jamais
    a/b + c/d.
  • Synthèse (wadiya-idmajiya-aadad-nisbiya) = aucune notion nouvelle ; six situations d'entraînement + la situation finale analysée + le
    test final.

Usage : python3 docs/sources/3am/unit1/build-extraction.py
"""
import json
from fractions import Fraction as F
from pathlib import Path


def D(s):
    """Décimal imprimé par le manuel (virgule ou point, signe − ou -) → Fraction exacte."""
    return F(str(s).replace(',', '.').replace('−', '-'))


def ratText(x):
    """Texte d'un rationnel : décimal à virgule s'il est fini, sinon fraction."""
    x = F(x)
    d = x.denominator
    while d % 2 == 0: d //= 2
    while d % 5 == 0: d //= 5
    if d != 1: return f'{x.numerator}/{x.denominator}'
    s = f'{abs(x):f}' if x.denominator != 1 else str(abs(x.numerator))
    if '.' in s: s = s.rstrip('0').rstrip('.')
    return ('-' if x < 0 else '') + s.replace('.', ',')


def _f(x): return D(x) if isinstance(x, str) else F(x)
def negs(*xs): return sum(1 for x in xs if _f(x) < 0)
def sign_of_product(*xs):
    xs = [_f(x) for x in xs]
    if any(x == 0 for x in xs): return 0
    return -1 if negs(*xs) % 2 else 1


E = []

# ── p. 6 : ouverture ───────────────────────────────────────────────────────────────────────────
E.append({'id': 'objectives', 'kind': 'objectives', 'page': 6, 'section': 'سأتعلّم في هذا الباب', 'verified': True,
          'items': ['حساب جداء عددين نسبيين.', 'قاعدة الإشارات.', 'حساب جداء عددين نسبيين.', 'ضرب عدد نسبي في $(-1)$.', 'دور ومعنى الإشارة $(-)$.',
                    'حساب جداء عدة أعداد نسبية.', 'مربع عدد نسبي.', 'حساب حاصل قسمة عددين نسبيين.', 'قاعدة الإشارات.', 'حساب حاصل قسمة.',
                    'تنظيم وتبسيط حساب.'],
          'note': 'Liste imprimée en deux rubriques : « 1. حساب جداء عددين نسبيين » (قاعدة الإشارات ; حساب جداء عددين نسبيين ; ضرب عدد نسبي في (−1) ; '
                  'دور ومعنى الإشارة (−) ; حساب جداء عدة أعداد نسبية) et « 2. مربع عدد نسبي » (suivi de حساب حاصل قسمة عددين نسبيين ; قاعدة الإشارات ; حساب حاصل قسمة ; تنظيم وتبسيط حساب). '
                  'Le premier titre de la rubrique 2 est « مربع عدد نسبي » telle qu’imprimée ; la rubrique mêle donc le carré et le quotient.'})
E.append({'id': 'opener', 'kind': 'aside', 'page': 6, 'section': 'نص تاريخي', 'verified': True,
          'text': 'Grand cadre blanc sous la liste des objectifs (rose et rouge) : un texte historique — ILLISIBLE, le scan a détruit la zone en blocs de pixels ; seuls des '
                  'fragments sont devinables (« …الموجبة هي… », « …نسبية… »).',
          'figure': 'à gauche de la liste des objectifs : un collage décoratif de chiffres multicolores (0–9) épinglé d’un trombone.'})
E.append({'id': 'challenge', 'kind': 'challenge', 'page': 6, 'section': 'تحدّي', 'verified': True,
          'items': [
              {'n': 1, 'text': 'جمعنا 2017 عددا نسبيّا كلها متساوية فوجدنا المجموع يساوي $-2017$ ، ماذا يساوي جداء كل الأعداد؟',
               'answer': {'each': '-1', 'product': '-1', 'reasoning': '2017 nombres égaux de somme −2017 : chacun vaut −1 ; 2017 facteurs (−1), un nombre IMPAIR de négatifs : produit −1'}},
              {'n': 2, 'text': 'أوجد كل حالات تفكيك العدد $-36$ إلى جداء أعداد صحيحة نسبيّة.',
               'answer': {'unordered_pairs': ['(-1)x36', '1x(-36)', '(-2)x18', '2x(-18)', '(-3)x12', '3x(-12)', '(-4)x9', '4x(-9)', '(-6)x6'],
                          'reasoning': 'les décompositions en DEUX facteurs entiers relatifs : un signe − exactement et un diviseur positif d de 36 ; (−6)×6 est la seule paire de deux facteurs égaux en valeur absolue ; les décompositions à plus de deux facteurs (ex. (−2)×3×6) existent aussi'}}],
          'answerSource': 'computed',
          'note': 'La phrase est la dernière rubrique de la page, à droite d’un bloc de pixels ; le texte lu est net.'})
assert 2017 * F(-1) == -2017 and (F(-1) ** 2017) == -1
PAIRS = {(-d, 36 // d) for d in range(1, 37) if 36 % d == 0}   # {x, y} avec x < 0 < y et x·y = −36
assert len(PAIRS) == 9 and all(x * y == -36 for x, y in PAIRS) and (-6, 6) in PAIRS and (-1, 36) in PAIRS and (-36, 1) in PAIRS

# ── p. 7 : أستعدّ (15 items) ─────────────────────────────────────────────────────────────────────
# options imprimées dans trois colonnes (1)(2)(3) ; `correct` = indices (0-based) des colonnes correctes (le manuel dit « الإجابات الصحيحة »).
# Les cellules d'options sont composées de gauche à droite (littérales) ; les énoncés des items 11–15 sont rendus à l'envers (voir l'en-tête).
PREP = [
    {'n': 1, 'question': 'فاصلة النقطة A على المستقيم المدرّج', 'options': ['$+2$', '$-2$', '$-1$'], 'correct': [1],
     'figure': 'droite graduée horizontale vers la droite, repérée -4 et 0 ; 6 graduations sur la partie visible ; la flèche A est sur la 3e graduation à partir de -4, soit -2 ; une seconde flèche (non nommée) est à +1',
     'why': 'A est à 2 unités à gauche de 0 : son abscisse est $-2$', 'verified': False},
    {'n': 2, 'question': 'في المعلم المقابل فاصلة النقطة A هي', 'options': ['$-3$', '$+1$', '$-2$'], 'correct': [2],
     'figure': 'repère orthogonal quadrillé, unités -2…2 ; A(−2 ; 1), B(1 ; 2)', 'why': '$A(-2\\,;\\,1)$ : abscisse $-2$', 'verified': False},
    {'n': 3, 'question': 'إحداثيا A هما', 'options': ['$(2\\,;\\,-1)$', '$(-2\\,;\\,-1)$', '$(-2\\,;\\,1)$'], 'correct': [2], 'why': '$A(-2\\,;\\,1)$', 'verified': False},
    {'n': 4, 'question': 'إحداثيا B هما', 'options': ['$(-2\\,;\\,-1)$', '$(2\\,;\\,1)$', '$(1\\,;\\,2)$'], 'correct': [2], 'why': '$B(1\\,;\\,2)$', 'verified': False},
    {'n': 5, 'question': 'درجة الحرارة الأكثر انخفاضا هي', 'options': ['$-12^\\circ C$', '$-15^\\circ C$', '$-9^\\circ C$'], 'correct': [1],
     'why': 'la plus basse des trois propositions : $-15$', 'verified': False,
     'note': 'L’énoncé n’imprime aucune donnée à comparer (pas de thermomètre sur le scan) : lu « la plus basse des trois valeurs », $-15^\\circ C$.'},
    {'n': 6, 'question': 'أكبر عدد نسبي في القائمة التالية هو : $-8{,}5$ ; $-7$ ; $-7{,}5$ ; $-8$ ; $-7{,}2$', 'options': ['$-7{,}5$', '$-8{,}5$', '$-7$'], 'correct': [2],
     'why': 'le plus proche de 0 par la gauche : $-7$', 'verified': False},
    {'n': 7, 'question': 'في إحدى ليالي الشتاء تغيرت درجة الحرارة من $-2^\\circ C$ إلى $-10^\\circ C$. نقول إنها', 'options': ['ارتفعت بـ $8^\\circ C$', 'انخفضت بـ $12^\\circ C$', 'انخفضت بـ $8^\\circ C$'], 'correct': [2],
     'why': '$-10-(-2)=-8$ : elle a baissé de $8^\\circ C$', 'verified': True},
    {'n': 8, 'question': 'على مستقيم مدرّج من اليمين إلى اليسار، موقع العدد $-2{,}1$ ...', 'options': ['على يمين 0', 'على يمين $-2{,}15$', 'على يمين $-2{,}05$'], 'correct': [1],
     'why': '$-2{,}15<-2{,}1<-2{,}05<0$ : $-2{,}1$ est à droite de $-2{,}15$ sur la droite graduée usuelle', 'verified': False,
     'note': 'La formule « من اليمين إلى اليسار » est ambiguë (sens de lecture de la droite) ; lue sur la droite usuelle croissante vers la droite.'},
    {'n': 9, 'question': 'النقطتان $A(-3\\,;\\,5)$ و $B(3\\,;\\,-5)$ متناظرتان بالنسبة إلى ...', 'options': ['محور الفواصل', 'محور التراتيب', 'مبدإ المعلم'], 'correct': [2],
     'why': 'les coordonnées sont opposées deux à deux : symétriques par rapport à l’origine', 'verified': False,
     'reading': 'Imprimé « (5 ; 3-)A » et « (5- ; 3)B » (rendu RTL) : A(−3 ; 5) et B(3 ; −5).'},
    {'n': 10, 'question': 'درجة الحرارة في المطبخ $29^\\circ C$ وفي المجمدة $-18^\\circ C$ ، الفارق بين درجتي الحرارة هو', 'options': ['$11^\\circ C$', '$47^\\circ C$', '$18^\\circ C$'], 'correct': [1],
     'why': '$29-(-18)=47$', 'verified': True},
    {'n': 11, 'question': '$(-3)-(-4)$ يساوي ....', 'options': ['$(-3)+(+4)$', '$(-3)-(+4)$', '$(-3)+(-4)$'], 'correct': [0],
     'why': '$(-3)-(-4)=(-3)+(+4)=1$', 'verified': True,
     'reading': 'Imprimé « (4-)-(3-) » : le rendu RTL renverse les deux opérandes — c’est (−3) − (−4) = 1 ; la lecture « (−4) − (−3) » = −1 ne correspond à aucune option imprimée.'},
    {'n': 12, 'question': '$-5+9-7+13$ يساوي ....', 'options': ['$-12+22$', '$9-12+13$', '$9-12-13$'], 'correct': [0, 1],
     'why': '$-5+9-7+13=10$ ; $-12+22=10$ ; $9-12+13=10$ ; $9-12-13=-16$', 'verified': False,
     'reading': 'Imprimé « 13+7-9+5- » : lu à l’envers −5+9−7+13 = 10 ; les options 1 et 2 valent 10 (réponses multiples permises).'},
    {'n': 13, 'question': 'يمكن كتابة $(-3)+(-5)$ على الشكل', 'options': ['$-3+(-5)$', '$-3-5$', '$-3+5$'], 'correct': [0, 1],
     'why': '$(-3)+(-5)=-8$ ; $-3-5=-8$ ; $-3+5=2$', 'verified': False},
    {'n': 14, 'question': '$(-5)+(-6)$ يساوي ....', 'options': ['$-11$', '$-1$', '$11$'], 'correct': [0], 'why': '$(-5)+(-6)=-11$', 'verified': True},
    {'n': 15, 'question': '$7-(8-11)$ يساوي .....', 'options': ['$7-8-11$', '$1-11$', '$7-(-3)$'], 'correct': [2],
     'why': '$8-11=-3$ puis $7-(-3)=10$', 'verified': True,
     'reading': 'Imprimé « (11 - 8) - 7 » (rendu RTL, renversé) : 7 − (8 − 11) = 10 ; l’option 3 « 7−(−3) » est exactement l’étape intermédiaire ; la lecture littérale (11−8)−7 = −4 ne correspond à aucune option.'},
]
# contrôles exacts des items
assert 7 and -10 - (-2) == -8 and 29 - (-18) == 47
assert F(-3) - F(-4) == 1 == F(-3) + 4 and F(-3) - 4 != 1 and F(-3) + F(-4) != 1
assert -5 + 9 - 7 + 13 == 10 == -12 + 22 == 9 - 12 + 13 and 9 - 12 - 13 == -16
assert (-3) + (-5) == -3 + (-5) == -3 - 5 == -8 and -3 + 5 == 2
assert (-5) + (-6) == -11
assert 7 - (8 - 11) == 10 == 7 - (-3) and 7 - 8 - 11 == -12 and 1 - 11 == -10 and (11 - 8) - 7 == -4
assert max(D(x) for x in ('-8,5', '-7', '-7,5', '-8', '-7,2')) == -7 and D('-2.15') < D('-2.1') < D('-2.05') < 0
assert min(-12, -15, -9) == -15
E.append({'id': 'prep', 'kind': 'prerequisites', 'page': 7, 'section': 'أستعدّ', 'verified': True,
          'instruction': 'جد الإجابة الصحيحة (أو الإجابات الصحيحة) في كل حالة، مبرّرا إياها.', 'items': PREP, 'answerSource': 'computed',
          'reading': 'Tableau « الأسئلة / الإجابات (1)(2)(3) » de 15 lignes. Items 7, 10, 11, 14, 15 (jidaa-adadayn-nisbiyayn) relus deux fois à 220–420 dpi : réponses recalculées ; '
                     '11, 12, 13, 15 sont rendus à l’envers (en-tête). Les cellules d’options sont littérales. Items 1, 2, 3, 4, 5, 6, 8, 9, 12, 13 : transcrits à 220 dpi, relus par leur leçon.'})

# ── p. 8 : أنشطة 1 et 2 ──────────────────────────────────────────────────────────────────────────
E.append({'id': 'act-1', 'kind': 'activity', 'number': 1, 'page': 8, 'section': 'أنشطة', 'title': 'جداء عددين نسبيين', 'verified': True,
          'text': 'لسقي أشجار مزرعته، أراد فلاح حفر بئر فلجأ إلى خبير في حفر الآبار الذي أجرى دراسة لباطن الأرض ليستكشف العمق الذي يصل فيه إلى الماء. '
                  'بعد دراسة أولية، قال له الخبير يجب عليك النزول إلى عمق $6m$ ، لكن بعد الحفر تبيّن أنّ الماء مازال عميقا، فقرر الفلاح استشارة خبير ثان، '
                  'فكانت نتيجة الدراسة أنه لكي يتدفق الماء بغزارة يجب عليه أن يحفر 3 أضعاف العمق الذي وصل إليه في المرة الأولى. '
                  '(نصطلح على التعبير عن العمق بعدد سالب و بالتالي عمق $6m$ نكتبه $-6m$) في هذه المرحلة الثانية توصّل الفلاح إلى ما يريد. '
                  '1) ما هو العمق الذي وصل إليه حتى تدفق الماء؟ 2) أعط كتابتين ممكنتين تسمحان لك بالتوصل إلى النتيجة السابقة. '
                  '3) ما هي القاعدة التي تسمح لك بحساب جداء عددين نسبيين مختلفين في الإشارة ؟',
          'figure': 'photo (décorative) d’une margelle de puits circulaire en terre, au coucher du soleil.',
          'answer': {'1': '-18 m', '2': ['(-6)+(-6)+(-6) = -18', '3 x (-6) = (-6) x 3 = -18'], '3': 'le produit de deux relatifs de signes différents est négatif : on multiplie les distances à zéro et on met le signe −'},
          'answerSource': 'computed'})
assert 3 * F(-6) == -18 == (-6) + (-6) + (-6)

E.append({'id': 'act-2', 'kind': 'activity', 'number': 2, 'page': 8, 'section': 'أنشطة', 'title': 'جداء عدد سالب في عدد موجب', 'verified': True,
          'text': 'للنزول إلى الميترو، يستعمل المسافرون السُلَّم الميكانيكي للمحطة الذي يتكون من 90 درجة علو الواحدة منها $28{,}5cm$. '
                  'أراد أمين حساب العمق الذي يصل إليه حتى يركب الميترو فكتب: $(-28{,}5)+(-28{,}5)+\\ldots+(-28{,}5)$ (مجموع 90 حدا). '
                  'لاكتشاف طريقة تسمح لك بحساب هذا المجموع، نعتبر العبارة: $E=(-3)+(-3)+(-3)+(-3)$. 1) احسب قيمة E ؟ '
                  'بالعودة إلى معنى عملية الضرب، نَعلَم أن: $7+7+7$ هو مجموع 3 حدود كل منها يساوي 7 ويمكننا كتابة هذا المجموع على شكل جداء $3\\times7$ ، '
                  'ونقرأ « 7 في 3 ». 2) اكتب E على شكل جداء. 3) اكتب كل واحدة من العبارات التالية على شكل مجموع ثم احسبها: '
                  '$A=(-5)\\times4$ ، $B=(-13)\\times6$ ، $C=(-8)\\times9$ ، $D=(-7{,}5)\\times7$. '
                  '4) خمن طريقة تسمح لك بحساب جداء عدد سالب في عدد موجب. 5) احسب: $90\\times(-28{,}5)$ ماذا تستنتج ؟',
          'figure': 'aucune figure ; le groupe de 90 termes est surmonté d’une accolade « 90 حدا ».',
          'answer': {'1': 'E = -12', '2': 'E = 4 x (-3) = (-3) x 4', '3': {'A': '(-5)+(-5)+(-5)+(-5) = -20', 'B': '(-13) six fois = -78', 'C': '(-8) neuf fois = -72', 'D': '(-7,5) sept fois = -52,5'},
                     '4': 'on multiplie les distances à zéro et on garde le signe − du facteur négatif', '5': '90 x (-28,5) = -2565 (cm) soit -25,65 m : la profondeur de la station'},
          'answerSource': 'computed'})
assert 4 * F(-3) == -12 == (-3) * 4 and 4 * F(-5) == -20 and 6 * F(-13) == -78 and 9 * F(-8) == -72 and 7 * D('-7,5') == D('-52,5')
assert 90 * D('-28,5') == -2565 and F(-2565, 100) == D('-25,65')
assert sign_of_product(-5, 4) == -1 and sign_of_product(90, D('-28,5')) == -1

# ── p. 9 : أنشطة 3 et 4 ──────────────────────────────────────────────────────────────────────────
E.append({'id': 'act-3', 'kind': 'activity', 'number': 3, 'page': 9, 'section': 'أنشطة', 'title': 'تبرير جداء عددين نسبيين', 'verified': True,
          'text': '1) احسب: $(2{,}1)\\times(-4{,}5)$. نعتبر العبارة: $S=4{,}5\\times2{,}1+(-4{,}5)\\times2{,}1$. '
                  'أ) باستعمال خاصية توزيع الضرب على الجمع، اكتب العبارة S على شكل جداء أحد عامليه هو العدد $2{,}1$ ثم احسب S. '
                  'ب) ماذا يمكن أن تستنتج بخصوص العددين: $4{,}5\\times2{,}1$ و $(-4{,}5)\\times2{,}1$ ؟ جـ) استنتج قيمة $(-4{,}5)\\times2{,}1$. '
                  '2) احسب الجداء $(-7)\\times(-9)$. أ) استعمل النشاط 2 لحساب الجداء: $4\\times(-7)$. ب) أكمل حساب جداءات الجدول المقابل: '
                  '$(-7)\\times5=\\ldots$ ؛ $(-7)\\times4=\\ldots$ ؛ $(-7)\\times3=\\ldots$ ؛ $(-7)\\times2=\\ldots$ ؛ $(-7)\\times1=\\ldots$ ؛ $(-7)\\times0=\\ldots$. '
                  '3) حساب $(-1{,}5)\\times(-0{,}6)$. نعتبر العبارة: $A=(-1{,}5)\\times0{,}6+(-1{,}5)\\times(-0{,}6)$. '
                  'استعمل الطريقة التي استعملت في الجزء 1 لحساب $(-1{,}5)\\times(-0{,}6)$.',
          'figure': 'tableau de six lignes sur fond rose : (−7)×5 = …, (−7)×4 = …, (−7)×3 = …, (−7)×2 = …, (−7)×1 = …, (−7)×0 = ….',
          'answer': {'1': {'S': 'S = (4,5 + (-4,5)) x 2,1 = 0 x 2,1 = 0', 'b': '4,5 x 2,1 et (-4,5) x 2,1 sont opposés (leur somme est 0)', '(-4,5)x2,1': '-9,45'},
                     '2': {'4x(-7)': '-28', 'table': ['-35', '-28', '-21', '-14', '-7', '0'], 'step': '+7 à chaque ligne quand le 2e facteur baisse de 1', '(-7)x(-9)': '63'},
                     '3': {'A': '0', '(-1,5)x(-0,6)': '0,9'}},
          'answerSource': 'computed',
          'reading': 'L’énoncé 2.أ renvoie au produit 4 × (−7) (le produit est commutatif : (−7) × 4 = −28, première ligne du tableau après (−7) × 5).'})
assert D('4,5') * D('2,1') == D('9,45') and D('4,5') * D('2,1') + D('-4,5') * D('2,1') == 0 and D('-4,5') * D('2,1') == D('-9,45')
assert [-7 * k for k in range(5, -1, -1)] == [-35, -28, -21, -14, -7, 0] and (-7) * (-9) == 63 and (-7) * 4 == 4 * (-7) == -28
assert D('-1,5') * D('0,6') + D('-1,5') * D('-0,6') == 0 and D('-1,5') * D('-0,6') == D('0,9')

E.append({'id': 'act-4', 'kind': 'activity', 'number': 4, 'page': 9, 'section': 'أنشطة', 'title': 'حاصل قسمة أعداد نسبية', 'verified': True,
          'text': 'نعلم أن $20=4\\times5$ معناه: $20\\div5=4$ و $20\\div4=5$. '
                  '1) أكمل ملء الفراغ بالعدد الناقص لكل واحدة من العمليات التالية: أ) $4\\times\\ldots=32$ ، $(-5)\\times\\ldots=60$ ، $7\\times\\ldots=(-28)$ ، $\\ldots\\times(-3)=(-42)$ . '
                  'ب) اكتب كل واحد من هذه الأعداد الناقصة على شكل كسر. 2) ماذا تلاحظ عن قسمة عددين نسبيين؟ '
                  '3) نعتبر العبارة: $Q=\\dfrac{(-3)\\times(-5)\\times2\\times(-1)}{(-1)\\times8\\times5\\times(-5)}$. '
                  'أ) ما هي إشارة بسط العبارة Q؟ وما هي إشارة المقام؟ ب) استنتج إشارة العبارة Q.',
          'answer': {'1a': {'4x?=32': '8', '(-5)x?=60': '-12', '7x?=-28': '-4', '?x(-3)=-42': '14'},
                     '1b': {'8': '32/4', '-12': '60/(-5)', '-4': '(-28)/7', '14': '(-42)/(-3)'},
                     '2': 'on retrouve la règle des signes du produit : mêmes signes → quotient positif ; signes différents → quotient négatif',
                     '3': {'numerator': 'signe − (3 facteurs négatifs) : -30', 'denominator': 'signe + (2 facteurs négatifs) : 200', 'Q': 'signe − : Q = -30/200 = -0,15'}},
          'answerSource': 'computed'})
assert F(32, 4) == 8 and F(60, -5) == -12 and F(-28, 7) == -4 and F(-42, -3) == 14 and 4 * 8 == 32 and (-5) * (-12) == 60 and 7 * (-4) == -28 and (-3) * 14 == -42
assert F(-3) * -5 * 2 * -1 == -30 and F(-1) * 8 * 5 * -5 == 200 and F(-30, 200) == D('-0,15') and negs(-3, -5, 2, -1) == 3 and negs(-1, 8, 5, -5) == 2

# ── p. 10 : معارف 1–6 ────────────────────────────────────────────────────────────────────────────
E.append({'id': 'know-1', 'kind': 'knowledge', 'number': 1, 'page': 10, 'section': 'معارف', 'title': 'ضرب الأعداد النسبية — قاعدة الإشارات', 'verified': True,
          'text': 'قاعدة الإشارات: • جداء عددين نسبيين لهما نفس الإشارة هو عدد نسبي موجب. • جداء عددين نسبيين مختلفين في الإشارة هو عدد نسبي سالب. '
                  'مثال: 1) للعددين نفس الإشارة: $(-2)\\times(-6)=12$ ، $3\\times7=21$. 2) للعددين إشارتان مختلفتان: $(-2{,}4)\\times5=-12$ ، $4\\times(-6)=-24$.',
          'answer': {'checks': ['(-2)x(-6)=12', '3x7=21', '(-2,4)x5=-12', '4x(-6)=-24']}, 'answerSource': 'computed'})
assert (-2) * (-6) == 12 and 3 * 7 == 21 and D('-2,4') * 5 == -12 and 4 * (-6) == -24

E.append({'id': 'know-2', 'kind': 'knowledge', 'number': 2, 'page': 10, 'section': 'معارف', 'title': 'حساب جداء عددين نسبيين', 'verified': True,
          'text': 'قاعدة: لحساب جداء عددين نسبيين: 1) نطبّق قاعدة الإشارات. 2) نضرب المسافتين إلى الصفر فيما بينهما. '
                  'حالة خاصة: من أجل كل عدد نسبي $a$ لدينا: $a\\times0=0$ و $0\\times a=0$. '
                  'أمثلة: 1) للعددين نفس الإشارة، إذن، الجداء موجب. $(-10)\\times(-3{,}8)=38$ ؛ $3\\times7=21$. '
                  '2) العددان مختلفان في الإشارة إذن، الجداء سالب. $(-6)\\times3{,}4=-20{,}4$ ؛ $13\\times-4=-52$. '
                  '$-3\\times0=0$ (جداء أيّ عدد في 0 يساوي 0).',
          'answer': {'checks': ['(-10)x(-3,8)=38', '(-6)x3,4=-20,4', '-3x0=0']}, 'answerSource': 'computed',
          'reading': 'Chaque exemple est une accolade à DEUX lignes : (−10) × (−3,8) = 38 puis 3 × 7 = 21 ; (−6) × 3,4 = −20,4 puis 13 × −4 = −52 (écrit sans parenthèses dans le manuel).'})
assert D('-10') * D('-3,8') == 38 == 10 * D('3,8') and D('-6') * D('3,4') == D('-20,4') and 6 * D('3,4') == D('20,4') and 13 * -4 == -52 and -3 * 0 == 0

E.append({'id': 'know-3', 'kind': 'knowledge', 'number': 3, 'page': 10, 'section': 'معارف', 'title': 'ضرب عدد نسبي في (−1)', 'verified': False,
          'text': 'خاصية: جداء عدد نسبي $a$ في $-1$ يعطي نظير العدد $a$. $(-1)\\times a=-a$ و $a\\times(-1)=-a$. '
                  'ملاحظة: يمكن أن يكون $-a$ سالبا كما يمكن أن يكون موجبا. أمثلة: 1) $6\\times(-1)=-6$. 2) $(-4{,}2)\\times(-1)=4{,}2$. '
                  '• إذا كان $a=-5$ فإن $-a=5$. • و إذا كان $a=8$ فإن $-a=-8$.',
          'answer': {'checks': ['6x(-1)=-6', '(-4,2)x(-1)=4,2', 'a=-5 => -a=5', 'a=8 => -a=-8']}, 'answerSource': 'computed'})
assert 6 * -1 == -6 and D('-4,2') * -1 == D('4,2') and -(-5) == 5 and -8 == -8

E.append({'id': 'know-4', 'kind': 'knowledge', 'number': 4, 'page': 10, 'section': 'معارف', 'title': 'دور ومعنى الإشارة (−)', 'verified': False,
          'text': 'يمكن للإشارة $(-)$ عدة معان مختلفة وبالتالي تلعب أدوارا مختلفة في الحساب. الإشارة $(-)$ يمكن أن تكون: • رمزا لعملية الطرح • إشارة لعدد نسبي سالب '
                  '• الإشارة التي تعيّن نظير عدد نسبي. أمثلة: 1) $13-9$ 2) $-4$ 3) $-a$ هو نظير $a$.'})

E.append({'id': 'know-5', 'kind': 'knowledge', 'number': 5, 'page': 10, 'section': 'معارف', 'title': 'جداء عدة أعداد نسبية', 'verified': False,
          'text': 'خاصية: جداء عدة أعداد نسبية يكون: • موجبا إذا كان عدد العوامل السالبة في الجداء زوجيا. • سالبا إذا كان عدد العوامل السالبة في الجداء فرديا. '
                  'أمثلة: 1) $3{,}2\\times(-5)\\times4\\times(-2{,}5)\\times(-2)=-320$ ؛ عدد العوامل السالبة هو 3 وهو عدد فردي، إذن الجداء سالب. '
                  '2) $3\\times(-2{,}3)\\times(-1{,}5)\\times(-2)\\times(-4)=82{,}8$ ؛ عدد العوامل السالبة هو 4 وهو عدد زوجي، إذن الجداء موجب.',
          'answer': {'checks': ['3,2x(-5)x4x(-2,5)x(-2)=-320 (3 négatifs)', '3x(-2,3)x(-1,5)x(-2)x(-4)=82,8 (4 négatifs)']}, 'answerSource': 'computed'})
assert D('3,2') * -5 * 4 * D('-2,5') * -2 == -320 and negs(D('3,2'), -5, 4, D('-2,5'), -2) == 3
assert 3 * D('-2,3') * D('-1,5') * -2 * -4 == D('82,8') and negs(3, D('-2,3'), D('-1,5'), -2, -4) == 4

E.append({'id': 'know-6', 'kind': 'knowledge', 'number': 6, 'page': 10, 'section': 'معارف', 'title': 'مربع عدد نسبي', 'verified': False,
          'text': 'قاعدة: مربع عدد نسبي هو عدد موجب دوما. أمثلة: 1) $(+1{,}2)^2=1{,}2\\times1{,}2=1{,}44$ 2) $(-1{,}2)^2=(-1{,}2)\\times(-1{,}2)=+1{,}44$.',
          'answer': {'checks': ['(+1,2)^2=1,44', '(-1,2)^2=+1,44']}, 'answerSource': 'computed'})
assert D('1,2') ** 2 == D('-1,2') ** 2 == D('1,44')

# ── p. 11 : طرائق (ضرب، عدة عوامل، حالات خاصة) + دوري الآن ───────────────────────────────────────
E.append({'id': 'method-1', 'kind': 'method', 'number': 1, 'page': 11, 'section': 'طرائق', 'title': 'ضرب الأعداد النسبية', 'verified': True,
          'items': [
              {'n': 1, 'text': 'تمرين 1: احسب $A=-3\\times7$. حل: لدينا: $A=-3\\times7=-(3\\times7)=-21$.', 'answer': {'A': '-21'}, 'comment': 'الجداء سالب لأن العددين مختلفان في الإشارة.'},
              {'n': 2, 'text': 'تمرين 2: احسب $B=-6\\times(-3{,}5)$. حل: لدينا: $B=-6\\times(-3{,}5)=6\\times3{,}5=21$.', 'answer': {'B': '21'}, 'comment': 'الجداء موجب لأن للعددين نفس الإشارة.'},
              {'n': 3, 'text': 'تمرين 3: ما هي إشارة الجداء: $P=(-2)\\times0{,}3\\times(-21)\\times6\\times(-11)$ ؟ حل: عدد العوامل السالبة 3، وهو عدد فردي، وعليه يكون الجداء سالبا. '
                               '$P=-(2\\times0{,}3\\times21\\times6\\times11)=-831{,}6$.', 'answer': {'sign': '-', 'P': '-831,6'},
               'comment': 'هناك 5 عوامل، 3 منها سالبة. وبالتالي الجداء سالب. بعد تعيين الإشارة نقوم بضرب العوامل في بعضها.'}],
          'text': 'طريقة: لضرب عددين نسبيين: • نلاحظ إشارتي العاملين ثم نطبّق قاعدة الإشارات. • نضرب المسافتين إلى الصفر ببعضهما. '
                  '• يكون الجداء موجبا إذا كان للعددين نفس الإشارة، ويكون سالبا إذا كانا مختلفين في الإشارة.',
          'answerSource': 'computed',
          'reading': 'Les exercices 1 et 2 portent sur deux relatifs (jidaa-adadayn-nisbiyayn) ; l’exercice 3 (5 facteurs) est celui de jidaa-ida-nisbiya (voir destinations).'})
assert -3 * 7 == -21 == -(3 * 7) and D('-6') * D('-3,5') == 21 == 6 * D('3,5')
assert D('-2') * D('0,3') * -21 * 6 * -11 == D('-831,6') and negs(-2, D('0,3'), -21, 6, -11) == 3 and 2 * D('0,3') * 21 * 6 * 11 == D('831,6')

E.append({'id': 'method-2', 'kind': 'method', 'number': 2, 'page': 11, 'section': 'طرائق', 'title': 'حساب جداء عدة عوامل', 'verified': False,
          'text': 'تمرين: احسب الجداءين: $A=(+3)\\times(-7)\\times(-0{,}5)\\times(-8)$ ؛ $B=13\\times(-5)\\times(-1)\\times(-3)\\times(-2)$. '
                  'حل: $A=(+3)\\times(-7)\\times(-0{,}5)\\times(-8)=-84$ ؛ $B=13\\times(-5)\\times(-1)\\times(-3)\\times(-2)=+390$. '
                  'تعاليق: • نتأكد في البداية أنه لا توجد إلا جداءات. • نقوم بعدّ الإشارات $(-)$ في الجداء. '
                  '• في العبارة A توجد 3 عوامل سالبة، وهو عدد فردي، إذن، فالعدد A سالب. • نحسب جداء كل المسافات إلى الصفر فنجد: $3\\times7\\times0{,}5\\times8=84$. '
                  '• في العبارة B توجد 4 عوامل سالبة، وهو عدد زوجي، إذن، فالعدد B موجب. • نحسب جداء كل المسافات إلى الصفر فنجد: $13\\times5\\times1\\times3\\times2=390$. '
                  'طريقة: لحساب جداء عدة عوامل، نَعُدّ العوامل السالبة، إذا كان عددها فرديا يكون الجداء سالبا و إذا كان عددها زوجيا يكون الجداء موجبا.',
          'answer': {'A': '-84', 'B': '390'}, 'answerSource': 'computed'})
assert 3 * -7 * D('-0,5') * -8 == -84 and 3 * 7 * D('0,5') * 8 == 84 and negs(3, -7, D('-0,5'), -8) == 3
assert 13 * -5 * -1 * -3 * -2 == 390 and 13 * 5 * 1 * 3 * 2 == 390 and negs(13, -5, -1, -3, -2) == 4

E.append({'id': 'method-3', 'kind': 'method', 'number': 3, 'page': 11, 'section': 'طرائق', 'title': 'حالات خاصة', 'verified': False,
          'text': 'تمرين: احسب الجداءات التالية: $A=3\\times(-1)$ ، $B=(-1)\\times(-4)$ ، $C=3\\times0$. '
                  'حل: $A=3\\times(-1)=-3$ ؛ $C=3\\times0=0$ ، $B=(-1)\\times(-4)=4$. '
                  'تعاليق: • جداء أي عدد نسبي في $(-1)$ يعطي نظير هذا العدد. • جداء أي عدد نسبي في 0 يعطي 0.',
          'answer': {'A': '-3', 'B': '4', 'C': '0'}, 'answerSource': 'computed'})
assert 3 * -1 == -3 and (-1) * (-4) == 4 and 3 * 0 == 0

E.append({'id': 'now-11', 'kind': 'now', 'page': 11, 'section': 'دوري الآن', 'title': 'دوري الآن', 'verified': False,
          'text': 'ما هي إشارة الجداء في كل حالة مما يلي ؟ أ) $P=(-2)\\times(-2)\\times\\ldots\\times(-2)$ (مجموعة تحتها العبارة « 85 عاملا ») ؛ ب) $B=3\\times(-5)\\times5\\times(-5)\\times5\\times(-5)\\times(-5)$.',
          'answer': {'a': 'signe − : 85 facteurs égaux à (−2), 85 est impair (le dernier chiffre 5 est certain : le signe est − pour 85, 65 ou 05)', 'b': 'signe + : 4 facteurs négatifs'},
          'answerSource': 'computed',
          'reading': 'Le nombre de facteurs sous l’accolade est lu « 85 » à 500 dpi (relu par jidaa-ida-nisbiya, 2026-10-26) : le DERNIER chiffre est sans ambiguïté un 5, donc le nombre est IMPAIR et le signe est « − » quel que soit le premier chiffre (8, 6 ou 0) ; '
                     'le plan README et le plan de jidaa-ida-nisbiya disaient « 50 » (pair, signe +) : c’était une erreur de lecture. L’ordre des facteurs de B est celui du scan (le produit est commutatif).'})
assert negs(*([-2] * 85)) % 2 == 1 and negs(*([-2] * 50)) % 2 == 0 and negs(3, -5, 5, -5, 5, -5, -5) == 4 and sign_of_product(3, -5, 5, -5, 5, -5, -5) == 1

# ── p. 12 : معارف 7–10 ───────────────────────────────────────────────────────────────────────────
E.append({'id': 'know-7', 'kind': 'knowledge', 'number': 7, 'page': 12, 'section': 'معارف', 'title': 'توزيع الضرب على الجمع أو الطرح', 'verified': False,
          'text': 'خواص: إذا كانت $a$ ، $b$ ، $k$ أعدادا نسبية فإنّ: • $k(a+b)=ka+kb$ ؛ $k(a-b)=ka-kb$ • $ka+kb=k(a+b)$ ؛ $ka-kb=k(a-b)$. '
                  'أمثلة: • $-7(a+2)=-7a-14$ • $5b-12b=(5-12)b=-7b$ • $2(a-b)=2a-2b$ • $(-3)\\times a+(-3)\\times b=(-3)(a+b)$.',
          'note': 'Le manuel écrit ces propriétés avec des LETTRES (k, a, b) : c’est le territoire de nashr-jabri-3am pour l’écriture littérale ; jidaa-ida-nisbiya ne les emploie que sur des NOMBRES (plan README, boundaries).'})

E.append({'id': 'know-8', 'kind': 'knowledge', 'number': 8, 'page': 12, 'section': 'معارف', 'title': 'حاصل قسمة عددين نسبيين — قاعدة الإشارات', 'verified': False,
          'text': 'قاعدة الإشارات: • حاصل قسمة عددين نسبيين لهما نفس الإشارة هو عدد موجب. • حاصل قسمة عددين نسبيين مختلفين في الإشارة هو عدد سالب. '
                  'انتبه ! حاصل قسمة عددين سالبين هو عدد موجب. ملاحظة: $a$ و $b$ عددان نسبيان، حيث $b\\neq0$ . $\\dfrac{-a}{-b}=\\dfrac{a}{b}$. '
                  'أمثلة: 1) احسب: $6\\div(-3)$. المقسوم والمقسوم عليه مختلفان في الإشارة، إذن حاصل القسمة سالب. ننجز عملية قسمة المسافتين إلى الصفر: $6\\div3=2$ إذن: $6\\div(-3)=-2$. '
                  '2) احسب $\\dfrac{-27}{-9}$. البسط والمقام لهما نفس الإشارة، إذن حاصل القسمة موجب. ننجز عملية قسمة المسافتين إلى الصفر: $\\dfrac{27}{9}=3$ إذن: $\\dfrac{-27}{-9}=3$.',
          'answer': {'checks': ['6÷(-3)=-2', '(-27)/(-9)=3']}, 'answerSource': 'computed',
          'reading': 'Les deux lignes de l’exemple 1 sont composées en bidi (« 6 ÷ 3 = 2 » s’affiche à l’envers) : lu 6 ÷ (−3) = −2 (confirmé par « mêmes distances 6 ÷ 3 = 2, signes différents »).'})
assert F(6, -3) == -2 and F(6, 3) == 2 and F(-27, -9) == 3 == F(27, 9)

E.append({'id': 'know-9', 'kind': 'knowledge', 'number': 9, 'page': 12, 'section': 'معارف', 'title': 'حساب حاصل القسمة', 'verified': False,
          'text': '$a$ و $b$ عددان نسبيان، حيث $b\\neq0$ . حاصل قسمة العدد النسبي $a$ على العدد النسبي غير المعدوم $b$ هو العدد $\\dfrac{a}{b}$ الذي يحقق: $\\dfrac{a}{b}\\times b=a$. '
                  'أمثلة: 1) $\\dfrac{-5}{6}\\times6=-5$ ، حاصل قسمة $-5$ على 6 هو $\\dfrac{-5}{6}$. 2) $\\dfrac{3}{-7}\\times(-7)=3$ ، حاصل قسمة 3 على $-7$ هو $\\dfrac{3}{-7}$.',
          'answer': {'checks': ['(-5/6)x6=-5', '(3/(-7))x(-7)=3']}, 'answerSource': 'computed'})
assert F(-5, 6) * 6 == -5 and F(3, -7) * -7 == 3

E.append({'id': 'know-10', 'kind': 'knowledge', 'number': 10, 'page': 12, 'section': 'معارف', 'title': 'تنظيم وتبسيط حساب', 'verified': False,
          'text': 'لإنجاز سلسلة حسابات على الأعداد النسبية بالعمليات الأربع أراعي ما يلي: • احترام قواعد الأولوية التي تعلمتها في السنة الثانية. '
                  '• أطبق قواعد جمع وطرح الأعداد النسبية بطريقة صحيحة. • أطبق القواعد الجديدة حول ضرب وقسمة الأعداد النسبية. '
                  'مثال: حساب $A=3-(2\\times(-5)+8)$. حل: نعيّن داخل الأقواس الحسابات التي لها أولوية. داخل الأقواس نحترم أولوية العمليات ونبدأ بالضرب. '
                  '$A=3-(2\\times(-5)+8)=3-(-2\\times5+8)=3-(-10+8)=3-(-2)=3+2=+5$.',
          'answer': {'A': '5'}, 'answerSource': 'computed',
          'reading': 'La deuxième ligne « = 3 − (−2 × 5 + 8) » est imprimée telle quelle par le manuel (2 × (−5) y est réécrit −2 × 5).'})
assert 3 - (2 * -5 + 8) == 5 == 3 - (-10 + 8) == 3 - (-2) == 3 + 2

# ── p. 13 : طرائق 4–6 + دوري الآن ────────────────────────────────────────────────────────────────
E.append({'id': 'method-4', 'kind': 'method', 'number': 4, 'page': 13, 'section': 'طرائق', 'title': 'تنظيم وتبسيط حساب', 'verified': False,
          'text': 'تمرين: احسب الجداء التالي: $P=(-4)\\times0{,}07\\times(-25)\\times(-12)\\times3\\times(-2)$. '
                  'حل: $P=4\\times0{,}07\\times25\\times12\\times3\\times2$ ؛ $P=4\\times25\\times0{,}07\\times12\\times6$ ؛ $P=100\\times0{,}07\\times72$ ؛ $P=7\\times72=504$. '
                  'تعاليق: • لدينا 6 عوامل 4 منها سالبة وبالتالي فإنّ الجداء P عدد موجب. • نقوم بضرب المسافات إلى الصفر. '
                  'طريقة: لحساب جداء أعداد نسبية يمكننا تغيير ترتيب العوامل دون أن يتغير الجداء.',
          'answer': {'P': '504', 'sign': '+ (4 négatifs sur 6 facteurs)'}, 'answerSource': 'computed'})
assert D('-4') * D('0,07') * -25 * -12 * 3 * -2 == 504 and negs(-4, D('0,07'), -25, -12, 3, -2) == 4 and 4 * 25 == 100 and 12 * 3 * 2 == 72 and 100 * D('0,07') == 7 and 7 * 72 == 504

E.append({'id': 'method-5', 'kind': 'method', 'number': 5, 'page': 13, 'section': 'طرائق', 'title': 'تعيين إشارة حاصل قسمة', 'verified': False,
          'text': 'تمرين: عيّن إشارة حاصل القسمة في كل حالة: $\\dfrac{17}{4}$ ، $\\dfrac{-3}{7}$ ، $\\dfrac{5}{-9}$ ، $\\dfrac{-38}{-23}$. '
                  'حل: • 17 و 4 موجبان إذن $\\dfrac{17}{4}$ موجب. • $-3$ و 7 مختلفان في الإشارة إذن $\\dfrac{-3}{7}$ سالب. '
                  '• 5 و $-9$ مختلفان في الإشارة إذن $\\dfrac{5}{-9}$ سالب. • $-38$ و $-23$ سالبان إذن $\\dfrac{-38}{-23}$ موجب. '
                  'تعاليق: • في كل حالة من الحالات المقابلة نلاحظ إشارتي البسط والمقام. • إذا كان لهما نفس الإشارة، فإن حاصل القسمة موجب. '
                  '• إذا كانا مختلفين في الإشارة، فحاصل القسمة سالب. ملاحظة: حاصل القسمة يمكن أن يكون عددا غير عشري. مثال: $\\dfrac{-3}{7}$ ، $\\dfrac{5}{-9}$. '
                  'طريقة: تعيين إشارة حاصل قسمة عددين نسبيين. • إذا كان للعددين نفس الإشارة فإنّ حاصل القسمة موجب. • إذا كان للعددين إشارتان مختلفتان فإن حاصل القسمة سالب.',
          'answer': {'17/4': '+', '-3/7': '-', '5/-9': '-', '-38/-23': '+'}, 'answerSource': 'computed'})
assert [sign_of_product(17, 4), sign_of_product(-3, 7), sign_of_product(5, -9), sign_of_product(-38, -23)] == [1, -1, -1, 1]
assert F(-3, 7).denominator == 7 and F(5, -9) == F(-5, 9) and F(1, 7).denominator == 7   # 7 et 9 : non décimaux

E.append({'id': 'method-6', 'kind': 'method', 'number': 6, 'page': 13, 'section': 'طرائق', 'title': 'حساب حاصل القسمة', 'verified': False,
          'text': 'تمرين: احسب: $A=-63\\div7$ ؛ $B=-54\\div(-6)$. حل: 1) حساب $A=-63\\div7$. لدينا: A سالب و $63\\div7=9$ ومنه $A=-9$. '
                  '2) حساب $B=-54\\div(-6)$. لدينا: B موجب و $54\\div6=9$ ومنه $B=9$. '
                  'تعاليق: • $(-63)$ و 7 مختلفان في الإشارة وبالتالي فحاصل القسمة سالب. حاصل قسمة المسافتين إلى الصفر هو $63\\div7=9$. '
                  '• $-54$ و $-6$ سالبان وبالتالي حاصل القسمة موجب. حاصل قسمة المسافتين إلى الصفر هو $54\\div6=9$. '
                  'قاعدة: لقسمة عدد نسبي على عدد نسبي غير معدوم: 1) نحدد إشارة حاصل القسمة باستعمال قاعدة الإشارات. 2) نجري عملية قسمة المسافتين إلى الصفر.',
          'answer': {'A': '-9', 'B': '9'}, 'answerSource': 'computed'})
assert F(-63, 7) == -9 and F(-54, -6) == 9 and F(63, 7) == F(54, 6) == 9

E.append({'id': 'now-13', 'kind': 'now', 'page': 13, 'section': 'دوري الآن', 'title': 'دوري الآن', 'verified': False,
          'items': [
              {'n': 1, 'text': 'ما هي إشارة كل من: $\\dfrac{a}{b}$ ؛ $\\dfrac{-a}{b}$ ؛ $\\dfrac{a}{-b}$ ؛ $\\dfrac{-a}{-b}$ ؟',
               'answer': {'if a>0, b>0': {'a/b': '+', '-a/b': '-', 'a/-b': '-', '-a/-b': '+'}}, 'note': 'Le manuel ne précise pas les signes de a et b ; lu avec a et b positifs (b ≠ 0).'},
              {'n': 2, 'text': 'احسب: $A=-0{,}239\\div100$ ؛ $B=+0{,}239\\div(-0{,}0001)$.', 'answer': {'A': '-0,00239', 'B': '-2390'}}],
          'answerSource': 'computed'})
assert D('-0,239') / 100 == D('-0,00239') and D('0,239') / D('-0,0001') == -2390

# ── pp. 14–16 : أوظّف تعلّماتي (1–34 … ; la numérotation réelle est contrôlée à la fin) ────────────
def ex(n_, text, page, section, verified=False, **kw):
    E.append({'id': f'ex-{n_}', 'kind': 'exercise', 'number': n_, 'page': page, 'section': section, 'text': text, 'verified': verified, **kw})

def prod(*xs):
    r = F(1)
    for x in xs: r *= D(x) if isinstance(x, str) else F(x)
    return r

def rt(x): return ratText(x)

def letters(spec):
    """spec = {'أ': (facteurs...), …} → réponses calculées {lettre: produit texte} + contrôle."""
    return {k: rt(prod(*v)) for k, v in spec.items()}

SEC_X = 'ضرب الأعداد النسبية'
# Dans les exercices (pp. 14–16) les expressions sont composées de gauche à droite (signe « − » devant le nombre) : l'ordre imprimé EST l'ordre logique.
# Seuls les énoncés de « أستعدّ » (items 11, 12, 13, 15 : signe « − » rendu APRÈS le chiffre) sont renversés.
ex(1, 'احسب ما يلي: أ) $(-3)\\times(+10)$ ؛ ب) $(+5)\\times(-5)$ ؛ جـ) $(-6)\\times(+4)$ ؛ د) $(-12)\\times(+3)$ ؛ هـ) $(+5)\\times(-10)$ ؛ و) $(-9)\\times(-8)$.',
   14, SEC_X, True, answer=letters({'أ': (-3, 10), 'ب': (5, -5), 'جـ': (-6, 4), 'د': (-12, 3), 'هـ': (5, -10), 'و': (-9, -8)}), answerSource='computed')
assert [prod(-3, 10), prod(5, -5), prod(-6, 4), prod(-12, 3), prod(5, -10), prod(-9, -8)] == [-30, -25, -24, -36, -50, 72]
ex(2, 'احسب ما يلي: أ) $(-2{,}5)\\times(+4)$ ؛ ب) $(+6{,}5)\\times(-4)$ ؛ جـ) $(-3{,}25)\\times(-10)$ ؛ د) $(+8{,}6)\\times(+0{,}1)$ ؛ هـ) $(-7{,}8)\\times(+100)$ ؛ و) $(-10)\\times(+5{,}25)$.',
   14, SEC_X, True, answer=letters({'أ': ('-2,5', 4), 'ب': ('6,5', -4), 'جـ': ('-3,25', -10), 'د': ('8,6', '0,1'), 'هـ': ('-7,8', 100), 'و': (-10, '5,25')}), answerSource='computed')
assert [prod('-2,5', 4), prod('6,5', -4), prod('-3,25', -10), prod('8,6', '0,1'), prod('-7,8', 100), prod(-10, '5,25')] == [-10, -26, D('32,5'), D('0,86'), -780, D('-52,5')]
ex(3, 'احسب ما يلي: أ) $-7\\times(+8)$ ؛ ب) $4\\times(-16)$ ؛ جـ) $(-15)\\times6$ ؛ د) $(-7)\\times(-9)$ ؛ هـ) $-3{,}5\\times(+8)$ ؛ و) $3{,}3\\times(-100)$.',
   14, SEC_X, True, answer=letters({'أ': (-7, 8), 'ب': (4, -16), 'جـ': (-15, 6), 'د': (-7, -9), 'هـ': ('-3,5', 8), 'و': ('3,3', -100)}), answerSource='computed',
   reading='Relu à 240 dpi : « -7×(+8) » et « -3,5×(+8) » sont imprimés SANS parenthèses autour du premier facteur.')
assert [prod(-7, 8), prod(4, -16), prod(-15, 6), prod(-7, -9), prod('-3,5', 8), prod('3,3', -100)] == [-56, -64, -90, 63, -28, -330]
ex(4, 'احسب ما يلي: أ) $6\\times8$ ؛ ب) $-0{,}2\\times(-14)$ ؛ جـ) $-3\\times(-8)$ ؛ د) $3{,}5\\times(-0{,}1)$ ؛ هـ) $-7\\times(-10{,}02)$ ؛ و) $-14\\times(-3{,}5)$.',
   14, SEC_X, True, answer=letters({'أ': (6, 8), 'ب': ('-0,2', -14), 'جـ': (-3, -8), 'د': ('3,5', '-0,1'), 'هـ': (-7, '-10,02'), 'و': (-14, '-3,5')}), answerSource='computed')
assert [prod(6, 8), prod('-0,2', -14), prod(-3, -8), prod('3,5', '-0,1'), prod(-7, '-10,02'), prod(-14, '-3,5')] == [48, D('2,8'), 24, D('-0,35'), D('70,14'), 49]
ex(5, 'احسب الجداءات التالية: أ) $(-4)\\times(-4)\\times(-3)\\times(-3)$ ؛ ب) $(-0{,}1)\\times(-0{,}38)$ ؛ جـ) $0{,}05\\times(-2{,}5)\\times20\\times(-4)$ ؛ د) $(-0{,}5)\\times17\\times(-2)$.',
   14, SEC_X, False, answer=letters({'أ': (-4, -4, -3, -3), 'ب': ('-0,1', '-0,38'), 'جـ': ('0,05', '-2,5', 20, -4), 'د': ('-0,5', 17, -2)}), answerSource='computed',
   reading='Produits de 4, 2, 4 et 3 facteurs (jidaa-ida-nisbiya). Le 0,05 de جـ est imprimé « 0.05 » avec un point sur le scan ; lu 0,05.')
assert [prod(-4, -4, -3, -3), prod('-0,1', '-0,38'), prod('0,05', '-2,5', 20, -4), prod('-0,5', 17, -2)] == [144, D('0,038'), 10, 17]
ex(6, 'اربط بين النتائج المتساوية: العمود الأول: $20\\times(-1)$ ؛ $-1{,}5\\times(-2)$ ؛ $(-12)\\times(-0{,}1)$ ؛ $(-20)\\times(-6)$. العمود الثاني: $(0{,}2)\\times(+6)$ ؛ $-12\\times(-10)$ ؛ $(+4)\\times(-5)$ ؛ $(+6)\\times(+0{,}5)$.',
   14, SEC_X, True, figure='deux colonnes de quatre produits, chaque élément précédé d’un point rouge ; à relier deux à deux.',
   answer={'pairs': [['20x(-1) = -20', '(+4)x(-5) = -20'], ['-1,5x(-2) = 3', '(+6)x(+0,5) = 3'], ['(-12)x(-0,1) = 1,2', '(0,2)x(+6) = 1,2'], ['(-20)x(-6) = 120', '-12x(-10) = 120']]}, answerSource='computed')
assert prod(20, -1) == prod(4, -5) == -20 and prod('-1,5', -2) == prod(6, '0,5') == 3 and prod(-12, '-0,1') == prod('0,2', 6) == D('1,2') and prod(-20, -6) == prod(-12, -10) == 120
ex(7, 'في القائمة التالية، احسب الجداءات الموجبة: أ) $(-2)\\times(+10)$ ؛ ب) $(-2)\\times(-10)$ ؛ جـ) $(-35)\\times10$ ؛ د) $2{,}5\\times(+100)$ ؛ هـ) $(-3)\\times(+4)$ ؛ و) $(-2)\\times(-6)$.',
   14, SEC_X, True, answer={'positive': ['ب', 'د', 'و'], 'values': {'ب': '20', 'د': '250', 'و': '12'}}, answerSource='computed')
assert [prod(-2, 10), prod(-2, -10), prod(-35, 10), prod('2,5', 100), prod(-3, 4), prod(-2, -6)] == [-20, 20, -350, 250, -12, 12]
ex(8, 'فيما يلي، احسب الجداءات السالبة فقط: أ) $0{,}5\\times(-3)$ ؛ ب) $(-4{,}2)\\times(-0{,}6)$ ؛ جـ) $(-3)\\times4$ ؛ د) $(-45)\\times(+10)$ ؛ هـ) $(-0{,}5)\\times(-0{,}5)$ ؛ و) $(-125)\\times(+8)$.',
   14, SEC_X, True, answer={'negative': ['أ', 'جـ', 'د', 'و'], 'values': {'أ': '-1,5', 'جـ': '-12', 'د': '-450', 'و': '-1000'}}, answerSource='computed')
assert [prod('0,5', -3), prod('-4,2', '-0,6'), prod(-3, 4), prod(-45, 10), prod('-0,5', '-0,5'), prod(-125, 8)] == [D('-1,5'), D('2,52'), -12, -450, D('0,25'), -1000]
ex(9, 'عيّن إشارة كل من الجداءات التالية، ثم أنجز الحساب: أ) $(-9)\\times(-9)$ ؛ ب) $(-3)\\times(-6)\\times(-9)$ ؛ جـ) $(-2)\\times(-2)\\times(-2)\\times(-2)$ ؛ د) $(-1)\\times(-2)\\times(-3)\\times(-4)\\times(-5)$.',
   14, SEC_X, False, answer={'أ': '+81', 'ب': '-162', 'جـ': '+16', 'د': '-120'}, answerSource='computed')
assert [prod(-9, -9), prod(-9, -6, -3), prod(-2, -2, -2, -2), prod(-5, -4, -3, -2, -1)] == [81, -162, 16, -120] and [negs(-9, -6, -3), negs(-5, -4, -3, -2, -1)] == [3, 5]
ex(10, 'عيّن إشارة كل من الجداءات التالية، ثم أنجز الحساب: أ) $A=6\\times(-2)\\times4\\times(-1)\\times(-3)$ ؛ ب) $B=-5\\times(-3)\\times(-7)\\times4\\times(-0{,}5)$ ؛ '
       'جـ) $C=5\\times(-3)\\times0{,}8\\times(-9)\\times(-11)$ ؛ د) $D=-1\\times(+2)\\times(-3)\\times6\\times(-8)$ ؛ هـ) $E=(-2)\\times(-5)\\times(-1)\\times4\\times(-9)$.',
   14, SEC_X, False, answer={'A': '-144', 'B': '+210', 'C': '-1188', 'D': '-288', 'E': '+360'}, answerSource='computed')
assert [prod(6, -2, 4, -1, -3), prod(-5, -3, -7, 4, '-0,5'), prod(5, -3, '0,8', -9, -11), prod(-1, 2, -3, 6, -8), prod(-2, -5, -1, 4, -9)] == [-144, 210, -1188, -288, 360]

# ── p. 15 : exercices 11–21 ──────────────────────────────────────────────────────────────────────
ex(11, 'أنجز الجداءات التالية: أ) $A=(-1)\\times2\\times(-3)\\times4\\times(-5)$ ؛ ب) $B=-1\\times(-2)\\times(-3)\\times(-4)\\times(-5)$ ؛ جـ) $C=1\\times2\\times(-3)\\times(-4)\\times5$ ؛ د) $D=1\\times(-2)\\times3\\times(-4)\\times5$.',
   15, SEC_X, False, answer={'A': '-120', 'B': '-120', 'C': '120', 'D': '120'}, answerSource='computed')
assert [prod(-1, 2, -3, 4, -5), prod(-1, -2, -3, -4, -5), prod(1, 2, -3, -4, 5), prod(1, -2, 3, -4, 5)] == [-120, -120, 120, 120]
ex(12, 'أكمل ملء الفراغات بما يناسب: أ) $(-2)\\times\\ldots\\times4\\times(-5)\\times6=-720$ ؛ ب) $2\\times(-3)\\times4\\times\\ldots\\times(-6)=720$ ؛ جـ) $\\ldots\\times(-3)\\times4\\times5\\times(-6)=-720$.',
   15, SEC_X, False, answer={'أ': '-3', 'ب': '5', 'جـ': '-2'}, answerSource='computed')
assert prod(-2, 4, -5, 6) * -3 == -720 and prod(2, -3, 4, -6) * 5 == 720 and prod(-3, 4, 5, -6) * -2 == -720
ex(13, 'جد إشارة كل من الجداءات التالية: أ) $A=(-1)\\times(-2)\\times(-3)\\times\\ldots\\times(-15)$ ؛ ب) $B=(-38)\\times(-39)\\times(-40)\\times\\ldots\\times(-110)$ ؛ '
       'جـ) $C=(-25)\\times(-24)\\times(-23)\\times\\ldots\\times(-1)$ ؛ د) $D=(-20)\\times(-19)\\times(-18)\\times\\ldots\\times(-10)$.',
   15, SEC_X, False, answer={'A': '- (15 facteurs négatifs)', 'B': '- (73 facteurs négatifs)', 'C': '- (25 facteurs négatifs)', 'D': '- (11 facteurs négatifs)'}, answerSource='computed')
assert [len(range(1, 16)), len(range(38, 111)), len(range(1, 26)), len(range(10, 21))] == [15, 73, 25, 11] and all(n % 2 == 1 for n in (15, 73, 25, 11))
ex(14, 'احسب الجداءات التالية: أ) $A=(-0{,}5)\\times19\\times(-2)$ ؛ ب) $B=(-0{,}1)\\times(-0{,}1)\\times(-0{,}1)\\times(-0{,}1)\\times(-0{,}1)$ ؛ جـ) $C=0{,}05\\times(-2{,}5)\\times20\\times(-4)$ ؛ د) $D=(-6)\\times(-6)\\times(-2)\\times(-2)$.',
   15, SEC_X, False, answer={'A': '19', 'B': '-0,00001', 'C': '10', 'D': '144'}, answerSource='computed')
assert [prod('-0,5', 19, -2), prod(*(['-0,1'] * 5)), prod('0,05', '-2,5', 20, -4), prod(-6, -6, -2, -2)] == [19, D('-0,00001'), 10, 144]
ex(15, 'في كل حالة، اكتب مكان $\\square$ العدد الذي به تتحقق المساواة: أ) $(-6)\\times\\square=-24$ ؛ ب) $(+40)=(-5)\\times\\square$ ؛ جـ) $(-5)\\times\\square=-2$ ؛ د) $(-2{,}5)\\times\\square=7{,}5$ ؛ هـ) $(-4)\\times\\square=10$ ؛ و) $(-0{,}5)\\times\\square=12$.',
   15, SEC_X, False, answer={'أ': '4', 'ب': '-8', 'جـ': '0,4', 'د': '-3', 'هـ': '-2,5', 'و': '-24'}, answerSource='computed',
   reading='Le carré vide □ marque le nombre cherché ; ب) est imprimé « (+40) = (−5)×□ » (le résultat à gauche du signe =).')
assert [F(-24) / -6, F(40) / -5, F(-2) / -5, D('7,5') / D('-2,5'), F(10) / -4, F(12) / D('-0,5')] == [4, -8, D('0,4'), -3, D('-2,5'), -24]
ex(16, 'أكمل بالعدد المناسب: أ) $(-4)\\times\\square=20$ ؛ ب) $(-13)\\times\\square=-39$ ؛ جـ) $\\square\\times(-7)=-42$ ؛ د) $\\square\\times(-11)=121$ ؛ هـ) $\\square\\times(-3)=-99$ ؛ و) $(-2{,}9)\\times\\square=29$.',
   15, SEC_X, False, answer={'أ': '-5', 'ب': '3', 'جـ': '6', 'د': '-11', 'هـ': '33', 'و': '-10'}, answerSource='computed')
assert [F(20) / -4, F(-39) / -13, F(-42) / -7, F(121) / -11, F(-99) / -3, F(29) / D('-2,9')] == [-5, 3, 6, -11, 33, -10]
ex(17, 'جد عددين نسبيين جداؤهما هما: أ) $32$ ؛ ب) $-28$ ؛ جـ) $-0{,}25$ ؛ د) $4{,}9$.',
   15, SEC_X, True, answer={'أ': '8 et 4 (ou -8 et -4, 2 et 16, …)', 'ب': '7 et -4 (ou -7 et 4, …)', 'جـ': '0,5 et -0,5 (ou 0,25 et -1, …)', 'د': '7 et 0,7 (ou -7 et -0,7, 4,9 et 1, …)', 'note': 'plusieurs couples possibles'},
   answerSource='computed',
   reading='Cibles lues : 32 ; −28 ; −0,25 ; 4,9 (le signe de −28 et de −0,25 est à confirmer par la leçon : la ligne est courte, imprimée « 32 ، ب) -28 ، جـ) -0,25 ، د) 4,9 »).')
assert 8 * 4 == 32 and 7 * -4 == -28 and D('0,5') * D('-0,5') == D('-0,25') and 7 * D('0,7') == D('4,9')
ex(18, 'دون أيّ حساب، أعط إشارة النتيجة في كل عبارة مما يلي: أ) $A=(-6)\\times(-10)\\times(+1{,}8)\\times(-2)$ ؛ ب) $B=(-4{,}5)\\times(-2)\\times(+5{,}5)\\times(-1)\\times(-8)$ ؛ '
       'جـ) $C=(+2{,}2)\\times(-0{,}6)\\times(+8)\\times(-2)\\times(-4)$.',
   15, SEC_X, False, answer={'A': '- (3 négatifs)', 'B': '+ (4 négatifs)', 'C': '- (3 négatifs)'}, answerSource='computed')
assert [sign_of_product(-6, -10, '1,8', -2), sign_of_product('-4,5', -2, '5,5', -1, -8), sign_of_product('2,2', '-0,6', 8, -2, -4)] == [-1, 1, -1]
ex(19, 'أ) احسب الجداء: $7{,}5\\times0{,}2$. ب) أنجز الجداءات التالية: $A=7{,}5\\times(-0{,}2)$ ؛ $B=(-0{,}2)\\times(-7{,}5)$ ؛ $C=(-75)\\times(+0{,}2)$ ؛ $D=(-7{,}5)\\times(-20)$.',
   15, SEC_X, True, answer={'أ': '1,5', 'A': '-1,5', 'B': '1,5', 'C': '-15', 'D': '150'}, answerSource='computed')
assert [prod('7,5', '0,2'), prod('7,5', '-0,2'), prod('-0,2', '-7,5'), prod(-75, '0,2'), prod('-7,5', -20)] == [D('1,5'), D('-1,5'), D('1,5'), -15, 150]


def pyramid(bottom):
    rows = [list(map(F, bottom))]
    while len(rows[-1]) > 1: rows.append([a * b for a, b in zip(rows[-1], rows[-1][1:])])
    return rows
ex(20, 'أهرامات الأعداد. انقل ثم أكمل ملء خانات « الهرم » في كل حالة، علما أن محتوى الخانة يساوي جداء ما في الخانتين اللتين تحتها.',
   15, SEC_X, False,
   figure='deux pyramides de 4 étages (4-3-2-1 cases) : à gauche, bleue, étage du bas -2 ; +2 ; -2 ; -2 ; à droite, verte, étage du bas -1 ; +1 ; +1 ; -1.',
   answer={'bleue': [[str(x) for x in r] for r in pyramid([-2, 2, -2, -2])], 'verte': [[str(x) for x in r] for r in pyramid([-1, 1, 1, -1])]}, answerSource='computed')
assert pyramid([-2, 2, -2, -2])[-1] == [-256] and pyramid([-1, 1, 1, -1])[-1] == [1]
# ex-21 : deux pyramides dont certaines cases sont connues ; on retrouve l'étage du bas
pb = pyramid([1, -1, -3, 2])
assert pb[1] == [-1, 3, -6] and pb[2] == [-3, -18] and pb[3] == [54]          # bleue : cases lues -3, +3, -1, +2
pg = pyramid([2, 2, -3, 5])
assert pg[1] == [4, -6, -15] and pg[2] == [-24, 90] and pg[3] == [-2160]       # verte : cases lues -2160, -24, -6, +5
ex(21, 'انقل ثم أكمل ملء خانات « الهرم » في كل حالة، علما أن محتوى الخانة يساوي جداء ما في الخانتين اللتين تحتها.',
   15, SEC_X, False,
   figure='pyramide bleue (4 étages) : étage du bas  ·  -1  ·  ·  +2 ; étage 3 : ·  +3  · ; étage 2 : -3  · ; sommet vide. Pyramide verte : sommet -2160 ; étage 2 : -24  · ; étage 3 : ·  -6  · ; bas : ·  ·  ·  +5.',
   answer={'bleue': {'bas': ['1', '-1', '-3', '2'], 'etage3': ['-1', '3', '-6'], 'etage2': ['-3', '-18'], 'sommet': '54'},
           'verte': {'bas': ['2', '2', '-3', '5'], 'etage3': ['4', '-6', '-15'], 'etage2': ['-24', '90'], 'sommet': '-2160'}}, answerSource='computed')

# ── p. 16 : exercices 22–34 ──────────────────────────────────────────────────────────────────────
SEC_Q = 'قسمة الأعداد النسبية'
ex(22, 'في كل حالة مما يلي، عيّن إشارة حاصل القسمة، دون حساب. أ) $(-3)\\div(-8)$ ؛ ب) $(-4)\\div(-5)$ ؛ جـ) $(+1)\\div(-2)$ ؛ د) $(-3{,}5)\\div(+5{,}2)$.',
   16, SEC_Q, False, answer={'أ': '+', 'ب': '+', 'جـ': '-', 'د': '-'}, answerSource='computed',
   reading='Les ordres des opérandes de أ et ب ((−3)÷(−8), (−4)÷(−5) ; les signes sont identiques dans tous les cas) sont imprimés avec le « − » parfois après le chiffre : le signe du quotient est le même quel que soit l’ordre.')
assert [sign_of_product(-3, -8), sign_of_product(-4, -5), sign_of_product(1, -2), sign_of_product('-3,5', '5,2')] == [1, 1, -1, -1]
ex(23, 'فيما يلي، انقل كل حاصل قسمة موجب. أ) $\\dfrac{-9}{+3}$ ؛ ب) $-\\dfrac{-3}{+7}$ ؛ جـ) $-\\dfrac{5}{-2}$ ؛ د) $-\\dfrac{+4}{-10}$.',
   16, SEC_Q, False, answer={'positifs': ['ب', 'جـ', 'د'], 'values': {'أ': '-3', 'ب': '3/7', 'جـ': '5/2 = 2,5', 'د': '2/5 = 0,4'}}, answerSource='computed',
   reading='Le signe « − » devant les fractions ب) جـ) د) est EXTÉRIEUR à la fraction (le haut de la fraction porte son propre signe) : −(−3/+7) = 3/7 ; −(5/−2) = 5/2 ; −(+4/−10) = 2/5.')
assert F(-9, 3) == -3 and -F(-3, 7) == F(3, 7) and -F(5, -2) == D('2,5') and -F(4, -10) == F(2, 5)
ex(24, 'احسب ما يلي: أ) $(-80)\\div(+4)$ ؛ ب) $(-72)\\div(-6)$ ؛ جـ) $(-32)\\div(-5)$ ؛ د) $(-21)\\div(-5)$.',
   16, SEC_Q, False, answer={'أ': '-20', 'ب': '12', 'جـ': '6,4', 'د': '4,2'}, answerSource='computed',
   reading='Imprimé « (-5)÷(-32) » et « (-5)÷(-21) » ? : l’ordre est rendu à l’envers par endroits ; lu (−32)÷(−5) et (−21)÷(−5) (quotients décimaux) — à confirmer par qismat-nisbiyayn.')
assert [F(-80, 4), F(-72, -6), F(-32, -5), F(-21, -5)] == [-20, 12, D('6,4'), D('4,2')]
ex(25, 'احسب ما يلي: أ) $(-8)\\div(-4)$ ؛ ب) $(-5)\\div(+10)$ ؛ جـ) $(-15)\\div(-3)$ ؛ د) $20\\div(-5)$ ؛ هـ) $(-45)\\div(-9)$ ؛ و) $(-72)\\div(+8)$.',
   16, SEC_Q, False, answer={'أ': '2', 'ب': '-0,5', 'جـ': '5', 'د': '-4', 'هـ': '5', 'و': '-9'}, answerSource='computed')
assert [F(-8, -4), F(-5, 10), F(-15, -3), F(20, -5), F(-45, -9), F(-72, 8)] == [2, D('-0,5'), 5, -4, 5, -9]
ex(26, 'احسب ما يلي: أ) $-121\\div11$ ؛ ب) $(-56)\\div(-7)$ ؛ جـ) $(-72)\\div(+12)$ ؛ د) $(+48)\\div(-2{,}5)$ ؛ هـ) $(+16)\\div(-0{,}1)$ ؛ و) $-16\\div(-5)$.',
   16, SEC_Q, False, answer={'أ': '-11', 'ب': '8', 'جـ': '-6', 'د': '-19,2', 'هـ': '-160', 'و': '3,2'}, answerSource='computed')
assert [F(-121, 11), F(-56, -7), F(-72, 12), F(48) / D('-2,5'), F(16) / D('-0,1'), F(-16, -5)] == [-11, 8, -6, D('-19,2'), -160, D('3,2')]
ex(27, 'أكمل ملء الفراغ بالعدد المناسب. أ) $(-72)\\div\\ldots=-9$ ؛ ب) $\\ldots\\div(-7)=+5$ ؛ جـ) $(+12)=\\ldots\\div(-3)$ ؛ د) $(-15)\\div\\ldots=+3$.',
   16, SEC_Q, False, answer={'أ': '8', 'ب': '-35', 'جـ': '-36', 'د': '-5'}, answerSource='computed')
assert F(-72, 8) == -9 and F(-35, -7) == 5 and F(-36, -3) == 12 and F(-15, -5) == 3
ex(28, 'اربط بين النتائج المتساوية. العمود الأول: $-12\\div(-10)$ ؛ $(-1)\\div(+1)$ ؛ $(+2)\\div(-0{,}2)$. العمود الثاني: $(-1)\\times(+1)$ ؛ $(30)\\div(-3)$ ؛ $(-12)\\times(-0{,}1)$.',
   16, SEC_Q, False, figure='deux colonnes de trois opérations, chaque élément précédé d’un point bleu ; à relier deux à deux.',
   answer={'pairs': [['-12÷(-10) = 1,2', '(-12)x(-0,1) = 1,2'], ['(-1)÷(+1) = -1', '(-1)x(+1) = -1'], ['(+2)÷(-0,2) = -10', '30÷(-3) = -10']]}, answerSource='computed')
assert F(-12, -10) == D('1,2') == D('-12') * D('-0,1') and F(-1, 1) == -1 == -1 * 1 and F(2) / D('-0,2') == -10 == F(30, -3)
ex(29, 'أكمل المتساويات بالإشارة المناسبة. أ) $-3\\times(+8)=(\\,?\\,24)$ ؛ ب) $(\\,?\\,25)=(-5)\\times5$ ؛ جـ) $(+13)\\times(\\,?\\,3)=-39$ ؛ د) $-54=-6\\times(\\,?\\,9)$.',
   16, SEC_X, True, figure='le point d’interrogation « ? » tient la place du signe (+ ou −) devant les chiffres 24, 25, 3, 9.',
   answer={'أ': '-24', 'ب': '-25', 'جـ': '-3', 'د': '+9'}, answerSource='computed')
assert -3 * 8 == -24 and (-5) * 5 == -25 and 13 * -3 == -39 and -6 * 9 == -54 and -6 * -9 == 54 and F(-54) / -6 == 9
ex(30, 'أكمل ملء الفراغ بما يحقق المساواة. أ) $(+48)\\div\\ldots=(+8)$ ؛ ب) $(+1)=\\ldots\\times(-1{,}6)$ ؛ جـ) $15=\\ldots\\times(-5)$ ؛ د) $(-7{,}5)\\times\\ldots=2{,}5$ ؛ هـ) $(-10)\\div\\ldots=4$ ؛ و) $(-12)\\times\\ldots=(-0{,}5)$.',
   16, SEC_Q, False, answer={'أ': '6', 'ب': '-0,625 (= -5/8)', 'جـ': '-3', 'د': '-1/3 (non décimal)', 'هـ': '-2,5', 'و': '1/24 (non décimal)'}, answerSource='computed',
   reading='Lecture de l’ordre des deux premières lignes : « (+8) = … ÷ (+48)… » est imprimé en bidi ; lu (+48) ÷ … = (+8) pour أ et (+1) = … × (−1,6) pour ب (qismat-nisbiyayn relira). د (−7,5 × … = 2,5) et و ((−12) × … = −0,5) donnent −1/3 et 1/24 : des quotients non décimaux, à écrire en fraction.')
assert F(48, 8) == 6 and F(1) / D('-1,6') == F(-5, 8) == D('-0,625') and F(15, -5) == -3 and F(D('2,5')) / D('-7,5') == F(-1, 3) and F(-10, 4) == D('-2,5') and D('-0,5') / -12 == F(1, 24)
ex(31, 'أوجد عددين نسبيين حاصل القسمة بينهما: أ) $-2$ ؛ ب) $10$ ؛ جـ) $-0{,}5$ ؛ د) $-1$.',
   16, SEC_Q, False, answer={'أ': '6 et -3 (ou -8 et 4, …)', 'ب': '-20 et -2 (ou 5 et 0,5, …)', 'جـ': '-3 et 6 (ou 1 et -2, …)', 'د': '7 et -7 (ou -4 et 4, …)', 'note': 'plusieurs couples possibles'}, answerSource='computed')
assert F(6, -3) == -2 and F(-20, -2) == 10 and F(-3, 6) == D('-0,5') and F(7, -7) == -1
ex(32, 'على مستقيم مدرّج، عيّن: أ) باللون الأحمر، نظير $-7$ ؛ ب) بالأخضر، جداء $-3$ في $6$ ؛ جـ) بالأزرق، حاصل قسمة $-15$ على $3$ ؛ د) بالأسود، مربع $-2$.',
   16, SEC_X, False, answer={'أ (rouge)': '7', 'ب (vert)': '-18', 'جـ (bleu)': '-5', 'د (noir)': '4'}, answerSource='computed')
assert -(-7) == 7 and -3 * 6 == -18 and F(-15, 3) == -5 and (-2) ** 2 == 4
ex(33, 'أولوية العمليات. احسب ما يلي: $A=-0{,}5\\times(-2-8)\\times-1{,}7$ ؛ $B=4{,}7-(1-10{,}5)\\times4$ ؛ $C=(7-12)\\div(12-(1+8\\times2))$ ؛ $D=-20+((-3)\\times(-7-3)-16)$.',
   16, 'أولوية العمليات', False, answer={'A': '-8,5', 'B': '42,7', 'C': '1', 'D': '-6'}, answerSource='computed')
assert D('-0,5') * (-2 - 8) * D('-1,7') == D('-8,5') and D('4,7') - (1 - D('10,5')) * 4 == D('42,7') and F(7 - 12) / (12 - (1 + 8 * 2)) == 1 and -20 + ((-3) * (-7 - 3) - 16) == -6
ex(34, 'أوجد مضاعف 6 الذي: أ) يسبق: 12 ، $-6$ ، 120 ، $-42$. ب) يلي: 18 ، $-30$ ، 48 ، $-54$.',
   16, SEC_X, True, answer={'أ': {'12': '6', '-6': '-12', '120': '114', '-42': '-48'}, 'ب': {'18': '24', '-30': '-24', '48': '54', '-54': '-48'}}, answerSource='computed',
   reading='« يسبق / يلي » : le multiple de 6 qui précède (le plus grand multiple de 6 strictement inférieur) / qui suit (le plus petit strictement supérieur) ; clés 6, −12, 114, −48 / 24, −24, 54, −48 (plan).')
assert [x - 6 for x in (12, -6, 120, -42)] == [6, -12, 114, -48] and [x + 6 for x in (18, -30, 48, -54)] == [24, -24, 54, -48] and all(x % 6 == 0 for x in (12, -6, 120, -42, 18, -30, 48, -54))

# ── p. 17 : أؤكّد تعلّماتي (1–12) ────────────────────────────────────────────────────────────────
SELF_SEC = 'أؤكّد تعلّماتي'
def selfq(n_, stem, options, correct, back, **kw):
    """QCM : options = {'أ': …, 'ب': …, 'جـ': …, 'د': …} ; correct = lettres (calculées) ; back = « عند الحاجة أعود إلى الصفحة »."""
    E.append({'id': f'self-{n_}', 'kind': 'self', 'number': n_, 'page': 17, 'section': SELF_SEC, 'verified': kw.pop('verified', False),
              'text': stem, 'options': options, 'answer': {'correct': correct}, 'answerSource': 'computed', 'returnPage': back, **kw})

# options lues littéralement (« ; » séparent les propositions أ ب جـ د)
selfq(1, '$(-3)\\times(-7)$ يساوي ...', {'أ': '$-10$', 'ب': '$-21$', 'جـ': '$10$', 'د': '$21$'}, ['د'], '10 و 11', verified=True)
assert (-3) * (-7) == 21
selfq(2, '$3\\times(-4)$ يساوي ...', {'أ': '$1$', 'ب': '$-12$', 'جـ': '$-7$', 'د': '$12$'}, ['ب'], '10 و 11', verified=True)
assert 3 * -4 == -12
selfq(3, '$(-4)\\times4$ يساوي ...', {'أ': '$0$', 'ب': '$-8$', 'جـ': '$-16$', 'د': '$16$'}, ['جـ'], '10 و 11', verified=True)
assert -4 * 4 == -16
selfq(4, '$8{,}1\\times(-3{,}2)$ يساوي ...', {'أ': '$25{,}92$', 'ب': '$4{,}9$', 'جـ': '$-25{,}92$', 'د': '$-4{,}9$'}, ['جـ'], '10 و 11', verified=True,
      reading='L’option أ est imprimée « 92 ، 25 » (une virgule typographique à la place du séparateur décimal, à l’envers) : lue 25,92.')
assert D('8,1') * D('-3,2') == D('-25,92')
selfq(5, 'جداء نظير 6 في نظير 7 يساوي ...', {'أ': '$42$', 'ب': '$-42$', 'جـ': '$-1$', 'د': '$\\dfrac{6}{-7}$'}, ['أ'], 10, verified=True)
assert (-6) * (-7) == 42
selfq(6, 'من أجل كلّ عدد نسبي $a$ ، العدد $-a$ هو:', {'أ': 'عدد سالب', 'ب': 'نظير العدد $a$', 'جـ': 'عدد سالب أو موجب حسب إشارة $a$', 'د': 'يساوي $a\\times(-1)$'}, ['ب', 'جـ', 'د'], 10,
      reading='Plusieurs bonnes réponses : −a est l’opposé de a (ب), de signe contraire à a (جـ), et −a = a × (−1) (د). أ est faux (−(−5) = 5).')
assert -(-5) == 5 and -(8) == -8 and 8 * -1 == -8
selfq(7, 'جداء 116 عاملا كلها تساوي $(-1)$ هو:', {'أ': '$-116$', 'ب': '$0$', 'جـ': '$-1$', 'د': '$1$'}, ['د'], '11 و 13')
assert (-1) ** 116 == 1 and negs(*([-1] * 116)) % 2 == 0
selfq(8, '$(-25)\\div(-5)$ يساوي ...', {'أ': '$5$', 'ب': '$-5$', 'جـ': '$-20$', 'د': '$20$'}, ['أ'], '12 و 13',
      reading='Imprimé « (-5) ÷ (-25) » : lu (−25) ÷ (−5) = 5 (l’option أ ; (−5)÷(−25) = 0,2 ne figure pas) — rendu RTL, voir discrepancies.')
assert F(-25, -5) == 5 and F(-5, -25) == D('0,2')
selfq(9, 'إذا كان $x$ عددا نسبيا يحقق: $-10=(-3)\\times x$ فإنّ:', {'أ': '$x=-7$', 'ب': '$3{,}33$', 'جـ': '$\\dfrac{10}{3}$', 'د': '$\\dfrac{-10}{3}$'}, ['جـ'], '12 و 13')
assert F(-10) / -3 == F(10, 3) and F(10, 3) != D('3,33')
selfq(10, '$a$ عدد نسبي سالب، إذن ...', {'أ': '$a^2$ سالب', 'ب': '$-a^2$ سالب', 'جـ': '$(-a)^2$ سالب', 'د': '$\\dfrac{a}{-a}$ سالب'}, ['ب', 'د'], '10 و 12',
      reading='a < 0 : a² > 0 (أ faux) ; −a² < 0 (ب vrai) ; (−a)² > 0 (جـ faux) ; a/(−a) = −1 < 0 (د vrai). Contient −a² et (−a)² : vu par jidaa-ida-nisbiya / quwat-adad-nisbi.')
assert all(((a ** 2 > 0) and (-(a ** 2) < 0) and ((-a) ** 2 > 0) and (F(a) / -a == -1)) for a in (-3, F(-1, 2), D('-4,2')))
selfq(11, '$11\\div(-4)$ يُكتب على الشكل ...', {'أ': '$\\dfrac{11}{-4}$', 'ب': '$-\\dfrac{11}{4}$', 'جـ': '$-2{,}75$', 'د': '$\\dfrac{11}{4}$'}, ['أ', 'ب', 'جـ'], '12 و 13',
      reading='Imprimé « (-4) ÷ 11 » (rendu RTL d’un « 11 ÷ (-4) » : signe après le chiffre) ; les options (11/−4, −11/4, −2,75, 11/4) ne conviennent qu’à 11 ÷ (−4) = −2,75 : clés أ, ب, جـ.')
assert F(11, -4) == F(-11, 4) == D('-2,75') != F(11, 4) and F(-4, 11) != D('-2,75')
selfq(12, '$3\\times(-4{,}7)-13\\times(-4{,}7)$ ... يُكتب على الشكل ...', {'أ': '$(-4{,}7)\\times(13-3)$', 'ب': '$-4{,}7\\times13\\times3$', 'جـ': '$10\\times(-4{,}7)$', 'د': '$(-4{,}7)\\times(-10)$'}, ['أ', 'جـ'], '12 و 13',
      reading='Énoncé imprimé « 3 × (4,7-) - 13 × 4,7- » (signes après les chiffres, rendu RTL) = −4,7 × 13 − (−4,7) × 3 = −47 (factorisation de −4,7) : clés أ et جـ. Lue littéralement (3×(−4,7) − 13×(−4,7) = 47) seule د conviendrait : voir discrepancies.')
assert D('-4,7') * 13 - D('-4,7') * 3 == D('-4,7') * (13 - 3) == 10 * D('-4,7') == -47 and D('-4,7') * 13 * 3 != -47 and D('-4,7') * -10 == 47 and 3 * D('-4,7') - 13 * D('-4,7') == 47

# ── pp. 18–19 : أتعمّق (35–52) ───────────────────────────────────────────────────────────────────
def deep(n_, page, title, text, verified=False, **kw):
    E.append({'id': f'deep-{n_}', 'kind': 'deepen', 'number': n_, 'page': page, 'section': 'أتعمّق', 'title': title, 'text': text, 'verified': verified, **kw})

deep(35, 18, 'ثلاثة أعداد جداؤها معلوم', 'جد ثلاثة أعداد نسبية جداؤها يساوي: أ) $-72$ ؛ ب) $84$ ؛ جـ) $-1$ ؛ د) $-0{,}08$.',
     answer={'أ': '2 x (-6) x 6 (ou -3 x 4 x 6, …)', 'ب': '2 x 6 x 7 (ou -2 x -6 x 7, …)', 'جـ': '1 x 1 x -1 (ou -1 x -1 x -1)', 'د': '-0,2 x 0,2 x 2 (ou 0,1 x 0,2 x -4, …)', 'note': 'plusieurs triplets possibles'}, answerSource='computed')
assert 2 * 6 * -6 == -72 and 2 * 6 * 7 == 84 and 1 * 1 * -1 == -1 and D('-0,2') * D('0,2') * 2 == D('-0,08')
deep(36, 18, 'أكمل الجمل', 'أكمل الجمل التالية: أ) $-39$ هو نصف $\\ldots$ ؛ ب) $-39$ هو ثلاثة أمثال $\\ldots$ ؛ جـ) $-39$ هو نظير $\\ldots$.',
     answer={'أ': '-78', 'ب': '-13', 'جـ': '39'}, answerSource='computed')
assert F(-39) * 2 == -78 and F(-39, 3) == -13 and -(-39) == 39
deep(37, 18, 'أعداد مختارة', 'أ) أعط عددين نسبيين جداؤهما موجب ومجموعهما سالب. ب) أعط عددين نسبيين جداؤهما سالب ومجموعهما موجب. '
     'جـ) أعط عددين نسبيين جداؤهما موجب ومجموعهما موجب. د) أعط عددين نسبيين جداؤهما سالب ومجموعهما سالب.', verified=True,
     answer={'أ': '-2 et -3 : produit 6 > 0, somme -5 < 0 (les deux négatifs)', 'ب': '-2 et 5 : produit -10 < 0, somme 3 > 0 (le positif a la plus grande distance)',
             'جـ': '2 et 3 : produit 6 > 0, somme 5 > 0 (les deux positifs)', 'د': '2 et -5 : produit -10 < 0, somme -3 < 0 (le négatif a la plus grande distance)'}, answerSource='computed',
     reading='Quatre cas = produit +/− × somme +/− : le produit positif exige DEUX signes égaux (somme du signe commun) ; le produit négatif exige deux signes différents (somme du signe de la plus grande distance).')
assert [(a * b > 0, a + b < 0) for a, b in [(-2, -3)]] == [(True, True)] and (-2 * 5 < 0 and -2 + 5 > 0) and (2 * 3 > 0 and 2 + 3 > 0) and (2 * -5 < 0 and 2 - 5 < 0)
# triangle magique : somme 2 sur chaque côté, cases : sommets A (haut), B (bas gauche), C (bas droit) ; milieux AB (gauche, donné : 0), BC (bas), AC (droite)
from itertools import permutations
TRI = [p for p in permutations([-2, -1, 1, 2, 3]) if p[0] + 0 + p[1] == 2 and p[1] + p[3] + p[2] == 2 and p[0] + p[4] + p[2] == 2]  # (A, B, C, BC, AC)
assert TRI == [(-1, 3, 1, -2, 2), (3, -1, 1, 2, -2)]
deep(38, 18, 'مثلث سحري', 'مجموع الأعداد على كل ضلع من أضلاع المثلث يساوي 2. املإ الخانات الفارغة بالأعداد النسبية $(-2)$ ، $(-1)$ ، $1$ ، $2$ و $3$.',
     figure='un triangle à six cases (3 sommets + 3 milieux de côtés), seule la case du MILIEU DU CÔTÉ GAUCHE est remplie : 0 (le scan est pâle ; la position de 0 est lue à 500 dpi).',
     answer={'solutions (A=haut, B=bas gauche, C=bas droit, BC=milieu bas, AC=milieu droit ; milieu gauche = 0)': [dict(zip(('A', 'B', 'C', 'BC', 'AC'), t)) for t in TRI], 'note': 'deux solutions symétriques (miroir droite-gauche)'},
     answerSource='computed', reading='Le triangle est un dessin pâle : seules les cases entourées sont devinables, 0 est dans la case du milieu du côté gauche. Addition seule : destinée à la banque de la synthèse (plan).')
deep(39, 18, 'إشارة جداء', 'عيّن إشارة جداء أعداد نسبية إذا علمت أن عدد العوامل السالبة هو ضعف عدد العوامل الموجبة.',
     answer={'sign': '+ (si aucun facteur n’est nul)', 'reason': 'n_neg = 2 x n_pos est PAIR'}, answerSource='computed')
assert all((2 * p) % 2 == 0 for p in range(1, 30))
# deep-40 : recherche exhaustive de parenthésages
def _trees(tokens):
    """tokens = [n0, op, n1, op, n2 …] (op ∈ + - *) ; renvoie toutes les valeurs exactes avec leur parenthésage."""
    if len(tokens) == 1:
        return [(F(tokens[0]), str(tokens[0]).replace('.', ','))]
    out = []
    for k in range(1, len(tokens), 2):
        for lv, ls in _trees(tokens[:k]):
            for rv, rs in _trees(tokens[k + 1:]):
                op = tokens[k]
                v = lv + rv if op == '+' else lv - rv if op == '-' else lv * rv
                ls_ = f'({ls})' if len(tokens[:k]) > 1 else ls
                rs_ = f'({rs})' if len(tokens[k + 1:]) > 1 else rs
                out.append((v, f'{ls_} {op} {rs_}'))
    return out
def solve_brackets(tokens, target):
    return sorted({s for v, s in _trees(tokens) if v == target}, key=lambda s: (s.count('('), s))
B40 = {
    'أ': ([14, '-', 4, '*', 6, '-', 1], 50), 'ب': ([-9, '+', 2, '*', 8, '*', 2, '-', 12], -70),
    'جـ': ([27, '-', F(5, 2), '*', F(17, 2), '-', F(9, 2)], 17), 'د': ([15, '-', 25, '*', F(12, 5), '+', 7, '-', 3, '*', 2], -16)}
S40 = {k: solve_brackets(t, v) for k, (t, v) in B40.items()}
# valeurs sans parenthèses (priorité des opérations) : elles NE sont PAS égales à la cible, sinon « parenthèses oubliées » n'a pas de sens
assert 14 - 4 * 6 - 1 == -11 != 50 and -9 + 2 * 8 * 2 - 12 == 11 != -70 and 27 - D('2,5') * D('8,5') - D('4,5') == D('1,25') != 17 and 15 - 25 * D('2,4') + 7 - 3 * 2 == -44 != -16
assert S40['أ'] and S40['ب'] and S40['جـ'] and S40['د']
assert all(len(v) == 1 for v in S40.values())      # une seule façon de placer les parenthèses dans chaque cas
H40 = {'أ': '(14 - 4) × (6 - 1)', 'ب': '(-9 + 2 × 8) × (2 - 12)', 'جـ': '27 - 2,5 × (8,5 - 4,5)', 'د': '(15 - 25) × 2,4 + (7 - 3) × 2'}
assert (14 - 4) * (6 - 1) == 50 and (-9 + 2 * 8) * (2 - 12) == -70 and 27 - D('2,5') * (D('8,5') - D('4,5')) == 17 and (15 - 25) * D('2,4') + (7 - 3) * 2 == -16
deep(40, 18, 'أقواس منسية', 'في كل حالة مما يلي، انقل العبارة ثم أكمل وضع الأقواس حتى تصبح المساواة محققة. أ) $14-4\\times6-1=50$ ؛ ب) $-9+2\\times8\\times2-12=-70$ ؛ جـ) $27-2{,}5\\times8{,}5-4{,}5=17$ ؛ د) $15-25\\times2{,}4+7-3\\times2=-16$.',
     answer=H40, answerSource='computed',
     reading='Parenthésage unique trouvé par recherche exhaustive de tous les parenthésages (une seule solution par ligne) ; ب exige DEUX paires de parenthèses : (−9 + 2×8)×(2−12) = −70, soit 7 × (−10) (voir discrepancies).')
deep(41, 18, 'إشارة', '$a$ هو جداء 24 عددا نسبيا كلها غير معدومة و 23 منها سالبة. $b$ هو جداء 13 عددا نسبيا كلها غير معدومة و 11 منها سالبة. أعط، إن أمكن، إشارة كل من: أ) $a\\times b$ ؛ ب) $\\dfrac{a}{b}$ ؛ جـ) $a^2$ ؛ د) $a+b$ ؛ هـ) $a-b$.',
     answer={'a': 'négatif (23 négatifs, impair)', 'b': 'négatif (11 négatifs, impair)', 'أ': '+', 'ب': '+', 'جـ': '+', 'د': '−', 'هـ': 'impossible à dire (a − b = a + (−b) : somme d’un négatif et d’un positif)'}, answerSource='computed')
assert 23 % 2 == 1 and 11 % 2 == 1
deep(42, 18, 'برنامج حساب', 'إليك برنامجَيْ حساب. البرنامج A: اختر عددا، أعيّن نظيره ثم أطرح 7. البرنامج B: اختر عددا، اضربه في $(-1)$ ثم أضيف $(-7)$. '
     'أ) طبّق كلا من البرنامجين على العدد $7{,}1$ ثم على العدد $-9{,}3$. ماذا تلاحظ؟ ب) هل الملاحظة السابقة صحيحة من أجل أي عدد نختاره؟ فسّر إجابتك.',
     answer={'7,1': {'A': '-14,1', 'B': '-14,1'}, '-9,3': {'A': '2,3', 'B': '2,3'}, 'b': 'oui : A = −x − 7 et B = x × (−1) + (−7) = −x − 7 (l’opposé de x est x × (−1))'}, answerSource='computed')
assert -D('7,1') - 7 == D('7,1') * -1 + -7 == D('-14,1') and -D('-9,3') - 7 == D('-9,3') * -1 + -7 == D('2,3')
deep(43, 18, 'صحيح أم خاطئ', 'اذكر إن كانت كل واحدة من العبارات التالية صحيحة أم خاطئة مبررا إجابتك. أ) مضاعف عدد نسبي سالب هو بالضرورة عدد نسبي سالب. '
     'ب) إذا كان مجموع عددين نسبيين معدوما فإن أحدهما نظير للآخر. جـ) إذا ضربنا عددا نسبيا في آخر فإنّ النتيجة هي بالضرورة عدد أكبر منهما.', verified=True,
     answer={'أ': 'faux : (-3) x (-1) = 3 > 0 (et (-3) x 0 = 0) ; les multiples d’un entier relatif sont pris dans ℤ (voir ex-34)', 'ب': 'vrai : a + b = 0 donc b = -a (2AM)',
             'جـ': 'faux : 3 x (-2) = -6 < 3 et < -2 ; ou 0,5 x 0,5 = 0,25 < 0,5'}, answerSource='computed',
     reading='Pas de sous-question د) sur la page. « مضاعف » : multiple k × a, k relatif (les multiples de 6 de l’ex-34 comprennent −42, −6 …).')
assert (-3) * (-1) == 3 and (-3) * 0 == 0 and 3 * -2 == -6 < -2 and D('0,5') * D('0,5') == D('0,25') < D('0,5')
deep(44, 18, 'جداء ثلاثة أعداد وجداء أربعة أعداد', 'أ) قال أيمن: «في جداء ثلاثة أعداد نسبية، إذا استبدلت كل عدد بنظيره، فإن الجداء المحصل عليه هو نظير الأول». ما رأيك في مقولة أيمن؟ اشرح. '
     'ب) هل الأمر كذلك بالنسبة إلى جداء أربعة أعداد نسبية؟ تحقق من ذلك.',
     answer={'أ': 'vrai : (−a)(−b)(−c) = (−1)³ abc = −abc', 'ب': 'faux : (−a)(−b)(−c)(−d) = (−1)⁴ abcd = abcd (le produit est INCHANGÉ) ; ex. (−2)(−3)(−4)(−5) = 120 = 2·3·4·5'}, answerSource='computed',
     reading='Sur la page 18 le numéro 44 est précédé de « أ) » : la sous-question ب) suit.')
assert all((-a) * (-b) * (-c) == -(a * b * c) and (-a) * (-b) * (-c) * (-d) == a * b * c * d for a, b, c, d in [(2, 3, 4, 5), (D('1,5'), -2, 7, -1), (-3, -3, 5, 1)])

deep(45, 19, 'انتظامات', '1) في كل حالة مما يلي، انقل المتتالية، لاحظ الانتظام ثم أكمل كتابة العدد الناقص. أ) $-3\\,;\\,9\\,;\\ldots;\\,81\\,;\\,-243$ ... '
     '(مكتوبة في المسطرة: $-243\\,;\\,81\\,;\\ldots\\,;\\,9\\,;\\,-3$) ؛ ب) $120000\\,;\\,-24000\\,;\\ldots\\,;\\,-960\\,;\\,192$ ؛ جـ) $-2\\,;\\,2\\,;\\,-4\\,;\\ldots\\,;\\,-48\\,;\\,240$. 2) بيّن في كل حالة كيفية المرور من عدد إلى الذي يليه.',
     answer={'أ': {'sequence': ['-243', '81', '-27', '9', '-3'], 'missing': '-27', 'rule': 'on multiplie par (-1/3), ou : on divise par (-3)'},
             'ب': {'sequence': ['120000', '-24000', '4800', '-960', '192'], 'missing': '4800', 'rule': 'on multiplie par (-1/5), ou : on divise par (-5)'},
             'جـ': {'sequence': ['-2', '2', '-4', '12', '-48', '240'], 'missing': '12', 'rule': 'on multiplie par -1, puis -2, -3, -4, -5'}}, answerSource='computed',
     reading='Les suites sont composées à l’envers sur le scan ; lues de gauche à droite exactement comme imprimées (premier terme à gauche) : أ) −243 ; 81 ; … ; 9 ; −3 ; ب) 120000 ; −24000 ; … ; −960 ; 192 ; جـ) −2 ; 2 ; −4 ; … ; −48 ; 240. Les raisons (−1/3, −1/5, −1·−2·−3·−4·−5) ne rendent les suites cohérentes que dans CET ordre.')
assert F(81, -243) == F(9, 81) * -3 and 81 * F(-1, 3) == -27 and -27 * F(-1, 3) == 9 and 9 * F(-1, 3) == -3 and 120000 * F(-1, 5) == -24000 and -24000 * F(-1, 5) == 4800 and 4800 * F(-1, 5) == -960 and -960 * F(-1, 5) == 192
assert [-2 * -1, 2 * -2, -4 * -3, 12 * -4, -48 * -5] == [2, -4, 12, -48, 240]
deep(46, 19, 'مربع سحري « ضربي »', '1) ما هي القواعد التي تسمح لك بالحصول على مربع سحري « ضربي »؟ 2) أنجز كل الحسابات اللازمة لتتأكد أن المربع التالي مربع سحري « ضربي »: '
     '$-2\\,;\\,36\\,;\\,-3$ / $9\\,;\\,6\\,;\\,4$ / $-12\\,;\\,1\\,;\\,-18$.',
     figure='grille 3 × 3 : [−2, 36, −3 ; 9, 6, 4 ; −12, 1, −18] (les cases rouges sont −2, 9, 4, 1, −18 ; les autres sont noires).',
     answer={'constant': '216', 'lines': ['-2x36x-3', '9x6x4', '-12x1x-18'], 'columns': ['-2x9x-12', '36x6x1', '-3x4x-18'], 'diagonals': ['-2x6x-18', '-3x6x-12'], 'rule': 'le produit des trois nombres de chaque ligne, de chaque colonne et de chaque diagonale est le même'}, answerSource='computed')
SQ46 = [[-2, 36, -3], [9, 6, 4], [-12, 1, -18]]
def is_mult_magic(sq):
    k = sq[0][0] * sq[0][1] * sq[0][2]
    return all(r[0] * r[1] * r[2] == k for r in sq) and all(sq[0][j] * sq[1][j] * sq[2][j] == k for j in range(3)) and sq[0][0] * sq[1][1] * sq[2][2] == k and sq[0][2] * sq[1][1] * sq[2][0] == k, k
assert is_mult_magic(SQ46) == (True, 216)
# deep-47 : grille [_, 1, _ / 4, -10, 52 (imprimé) / 5, _, -2]
SQ47 = [[-50, 1, 20], [4, -10, 25], [5, 100, -2]]
assert is_mult_magic(SQ47) == (True, -1000)
def complete47(centre_right):
    """Les cases connues : haut-milieu 1, 4, centre −10, droite-milieu x, 5, bas-droite −2 ; on cherche une complétion multiplicative magique."""
    sols = []
    k = F(4) * -10 * centre_right
    out = []
    # k = 4·(−10)·x ; colonne 2 : 1·(−10)·m = k ; diagonale : a·(−10)·(−2) = k ; anti-diagonale : c·(−10)·5 = k ; ligne 1 : a·1·c = k ; ligne 3 : 5·m·(−2) = k ; colonne 1 : a·4·5 = k ; colonne 3 : c·x·(−2) = k
    if k == 0: return None
    m = k / -10; a = k / 20; c = k / -50
    ok = (a * c == k and 5 * m * -2 == k and a * 4 * 5 == k and c * centre_right * -2 == k)
    return (a, c, m) if ok else None
assert complete47(25) == (F(-50), F(20), F(100)) and complete47(52) is None
deep(47, 19, 'أكمل مربعا سحريا « ضربيا »', 'أكمل ملء الخانات الفارغة لتحصل على مربع سحري « ضربي ». $[\\ ;\\,1\\,;\\ \\ ]$ / $[4\\,;\\,-10\\,;\\,52]$ / $[5\\,;\\ ;\\,-2]$.',
     figure='grille 3 × 3 : ligne 1 [vide, 1, vide] ; ligne 2 [4, −10, 52] ; ligne 3 [5, vide, −2].',
     answer={'completed (with 25)': SQ47, 'constant': '-1000'}, answerSource='computed',
     reading='Le scan imprime « 52 » ; la grille n’est multiplicativement magique qu’avec 25 (4 × (−10) × 25 = −1000 = 1 × (−10) × 100 = (−50)(−10)(−2)…) : « 52 » est le « 25 » rendu à l’envers (voir discrepancies). Avec 52 aucune complétion n’existe.')
deep(48, 19, 'أكمل بالعدد المناسب', 'في كل حالة مما يلي، انقل ثم أكمل ملء الفراغ بالعدد المناسب: أ) $(-3)\\times\\ldots=-36$ ؛ ب) $\\ldots\\times5=-16$ ؛ جـ) $(-10)\\times\\ldots=3$ ؛ د) $3\\times\\ldots=-4$ ؛ هـ) $(-6)\\times\\ldots=11$ ؛ و) $(-9)\\times\\ldots=-8$.',
     answer={'أ': '12', 'ب': '-16/5 = -3,2', 'جـ': '-3/10 = -0,3', 'د': '-4/3 (non décimal)', 'هـ': '-11/6 (non décimal)', 'و': '8/9 (non décimal)'}, answerSource='computed',
     reading='Imprimé en bidi : lu comme (−3) × … = −36 ; … × 5 = −16 ; (−10) × … = 3 ; 3 × … = −4 ; (−6) × … = 11 ; (−9) × … = −8. Trois des six réponses ne sont pas décimales : quotient écrit en fraction (qismat-nisbiyayn).')
assert [F(-36, -3), F(-16, 5), F(3, -10), F(-4, 3), F(11, -6), F(-8, -9)] == [12, D('-3,2'), D('-0,3'), F(-4, 3), F(-11, 6), F(8, 9)]
deep(49, 19, 'بطريقتين مختلفتين', 'أنجز بطريقتين مختلفتين الحسابات التالية: أ) $A=(-3)\\times(5-7)$ ؛ ب) $B=5\\times(-4-3)$ ؛ جـ) $C=(-7-2)\\times(-3)$ ؛ د) $D=-3\\times((-4)+(-2))$.',
     answer={'A': '6 = (-3)x(-2) = (-15)+21', 'B': '-35 = 5x(-7) = -20-15', 'C': '27 = (-9)x(-3) = 21+6', 'D': '18 = -3x(-6) = 12+6'}, answerSource='computed',
     reading='Les deux méthodes attendues : calculer la parenthèse puis multiplier ; ou distribuer le facteur (k(a+b) = ka + kb sur des nombres : jidaa-ida-nisbiya).')
assert (-3) * (5 - 7) == -3 * 5 + (-3) * -7 == 6 and 5 * (-4 - 3) == 5 * -4 + 5 * -3 == -35 and (-7 - 2) * -3 == -7 * -3 + -2 * -3 == 27 and -3 * ((-4) + (-2)) == -3 * -4 + -3 * -2 == 18
R = lambda n: int('1' * n)
assert all(F(k - R(k), 9) == -int(''.join(str(i) for i in range(1, k))) if k > 1 else k - R(k) == 0 for k in range(1, 11))
deep(50, 19, 'متساويات عجيبة', '① $1-1=9\\times\\ldots$ ؛ ② $2-11=9\\times\\ldots$ ؛ ③ $3-111=9\\times\\ldots$ ؛ ④ $4-1111=9\\times\\ldots$ ؛ … ؛ ⑩ $10-1\\,111\\,111\\,111=9\\times\\ldots$. '
     '1) ما هي الأعداد الناقصة في المتساويات ①، ②، ③، ④، ⑩؟ 2) دون إجراء أية حسابات إضافية، اكتب المتساويات: ⑤، ⑥، ⑦، ⑧، ⑨.',
     answer={'1': {'①': '0', '②': '-1', '③': '-12', '④': '-123', '⑩': '-123456789'},
             '2': {'⑤': '5 - 11111 = 9 x (-1234)', '⑥': '6 - 111111 = 9 x (-12345)', '⑦': '7 - 1111111 = 9 x (-123456)', '⑧': '8 - 11111111 = 9 x (-1234567)', '⑨': '9 - 111111111 = 9 x (-12345678)'}}, answerSource='computed')
assert [F(k - R(k), 9) for k in (1, 2, 3, 4, 10)] == [0, -1, -12, -123, -123456789] and 10 - R(10) == 9 * -123456789
deep(51, 19, 'على مستقيم مدرّج', '1) على مستقيم مدرّج، علّم النقط A ، B ، C ، D ، E التي فواصلها على الترتيب: $-5$ ، $-3{,}5$ ، $-0{,}5$ ، $2$ ، $4$. '
     '2) احسب فواصل النقط $A\'$ ، $B\'$ ، $C\'$ ، $D\'$ ، $E\'$ التي نحصل عليها بضرب فواصل النقط A ، B ، C ، D ، E في $(-1)$. علّم النقط $A\'$ ، $B\'$ ، $C\'$ ، $D\'$ ، $E\'$ على المستقيم المدرّج. '
     '3) ما هي الملاحظة التي يمكن تسجيلها حول تموضع هذه النقط على المستقيم المدرّج؟',
     answer={'abscissae': {'A': '-5', 'B': '-3,5', 'C': '-0,5', 'D': '2', 'E': '4'}, "A'..E'": {"A'": '5', "B'": '3,5', "C'": '0,5', "D'": '-2', "E'": '-4'}, '3': 'chaque point M et son image M\' sont SYMÉTRIQUES par rapport à l’origine O (même distance à 0, côtés opposés)'}, answerSource='computed')
assert [x * -1 for x in (-5, D('-3,5'), D('-0,5'), 2, 4)] == [5, D('3,5'), D('0,5'), -2, -4]
deep(52, 19, 'مخمّنة', 'برنامج: • اختر عددا. • أضف له العدد الصحيح الذي يليه. • اضرب الناتج في $(-2)$. • أضف 2 إلى الناتج. • قسّم الناتج على $(-4)$. '
     '1) طبّق هذا البرنامج على الأعداد: $10$ ، $-5$ ، $-125$ على التوالي. ما هي المخمنة التي خرجت بها؟ 2) هل يمكن إثبات هذه المخمنة؟',
     answer={'1': {'10': '10', '-5': '-5', '-125': '-125'}, 'conjecture': 'le programme redonne le nombre choisi', '2': 'oui : n + (n+1) = 2n+1 ; × (−2) → −4n − 2 ; + 2 → −4n ; ÷ (−4) → n'}, answerSource='computed')
def prog52(n): return (((F(n) + (n + 1)) * -2) + 2) / -4
assert [prog52(10), prog52(-5), prog52(-125)] == [10, -5, -125] and all(prog52(n) == n for n in range(-30, 30))

# ── pp. 20–21 : أدمج تعلّماتي · وضعية للتقويم · أوظّف تكنولوجيات الإعلام والاتصال ────────────────────
E.append({'id': 'integration', 'kind': 'integration', 'page': 20, 'section': 'أدمج تعلّماتي', 'title': 'وضعية: السعة الحرارية على القمر والزهرة والمريخ', 'verified': False,
          'text': 'باستعمال السندات 1 ، 2 ، 3 أدناه: 1) احسب السعة الحرارية بالدرجة سيلسيوس على سطح القمر، ثم على سطح كل من الزهرة والمريخ. '
                  '2) أعط متوسط درجة الحرارة بالكلفن على سطح الزهرة. 3) أعط متوسط درجة الحرارة بالسيلسيوس على سطح المريخ. '
                  'السند 1: • الكلفن وحدة لقياس درجة الحرارة، تُستعمل كثيرا من طرف الفيزيائيين، بينما نستعمل في حياتنا اليومية درجة السيلسيوس. '
                  '• يتم المرور من درجة سيلسيوس (°C) إلى درجة كلفن (K) بإضافة 273,15. • السعة الحرارية هي الفارق بين درجتي حرارة، في مكان ما، وفي فترة معطاة. '
                  'السند 2: تأثير الغلاف الجوي. • يتكون الغلاف الجوي للقمر من طبقة غير سميكة، ويتسبب ذلك في سعة حرارية كبيرة بين وجهي القمر، إذ تبلغ هذه السعة مستويات قياسية: '
                  'يمكن أن تنزل الحرارة إلى $(-170^\\circ C)$ على الوجه المظلم، بينما يبلغ متوسط درجة الحرارة على الوجه المقابل للشمس حوالي $(160^\\circ C)$. '
                  '• يُعتبر كوكب الزهرة الأكثر تأثرا بالاحتباس الحراري نظرا لكثافة غلافه الجوي العالية جدا، ويبلغ متوسط درجة الحرارة على سطحه حوالي $(460^\\circ C)$. '
                  '• يُحدثُ ضعف كثافة الغلاف الجوي لكوكب المريخ أثرا محدودا للاحتباس الحراري، وهو ما يفسر معدل درجة الحرارة على سطحه الذي يبلغ حوالي $(210K)$. '
                  'السند 3: درجة الحرارة على سطح: الزهرة: • القصوى: $763K\\,(490^\\circ C)$ • الدنيا: $719K\\,(446^\\circ C)$. المريخ: • القصوى: $270K\\,(-3^\\circ C)$ • الدنيا: $140K\\,(-133^\\circ C)$. '
                  'توجيهات: قراءة وتحليل الوضعية: • ماذا تُمثّل الأعداد الواردة في نص الوضعية والسندات؟ • كيف تربط بين الأعداد الواردة في هذا النص والأعداد الواردة في نص الوضعية؟ '
                  '• حدِّد العمليات الحسابية التي ستنجزها في كل حالة. • حدِّد قواعد الحساب التي ستطبقها في كل حالة. تحليل التعليمة واختيار استراتيجية حل مناسبة: • ما المهمّات المطلوب إنجازها؟ '
                  '• تحديد كل مهمة مطلوبة بدقّة. • إنجاز مخطط للعمل تحدد فيه مراحل التنفيذ. تنفيذ استراتيجية الحل المختارة: • تنفيذ المهمات وإنجاز الحسابات. • تحرير الحل والشرح بجُمل واضحة.',
          'figure': 'aucune figure ; deux colonnes de texte (supports 1 et 2 à droite, support 3 à gauche) et la grille de « توجيهات ».',
          'answer': {'1': {'القمر': '160 - (-170) = 330 °C', 'الزهرة': '490 - 446 = 44 °C (763 - 719 = 44 K)', 'المريخ': '-3 - (-133) = 130 °C (270 - 140 = 130 K)'},
                     '2': 'الزهرة : 460 + 273,15 = 733,15 K', '3': 'المريخ : 210 - 273,15 = -63,15 °C'}, 'answerSource': 'computed',
          'reading': 'Une SEULE situation pour deux boîtes (« أدمج تعلّماتي » et « وضعية للتقويم » : la seconde est la situation Fahrenheit ci-dessous). Les températures en kelvin du support 3 sont arrondies à l’unité (490 °C = 763,15 K).'})
assert 160 - (-170) == 330 and 490 - 446 == 44 and 763 - 719 == 44 and F(-3) - F(-133) == 130 and 270 - 140 == 130
assert D('460') + D('273,15') == D('733,15') and D('210') - D('273,15') == D('-63,15')
assert round(490 + D('273,15')) == 763 and round(446 + D('273,15')) == 719 and round(-3 + D('273,15')) == 270 and round(-133 + D('273,15')) == 140

E.append({'id': 'evaluation', 'kind': 'integration', 'page': 20, 'section': 'وضعية للتقويم', 'title': 'درجتا الحرارة بالفهرنهايت والسيلسيوس', 'verified': False,
          'text': 'بعض البلدان، مثل الولايات المتحدة الأمريكية، تستعمل درجة فهرنهايت للتعبير عن درجات الحرارة. عندما غادر أحد رجال الأعمال مدينة باريس، كانت درجة الحرارة تشير إلى $-2^\\circ C$ ، '
                  'وعندما وصل إلى شيكاغو كانت درجة الحرارة تشير إلى $14^\\circ F$. 1) باستعمال القاعدة التالية المتعلقة بتحويل درجة الحرارة من فهرنهايت إلى السيلسيوس: $T^\\circ F=1{,}8\\times T^\\circ C+32$. '
                  'أ) عبّر عن درجة الحرارة في باريس بالدرجة $T^\\circ F$. ب) عبّر عن درجة الحرارة في شيكاغو بالدرجة $T^\\circ C$. 2) أيّ المدينتين أشد برودة؟',
          'answer': {'1a': 'باريس : 1,8 x (-2) + 32 = 28,4 °F', '1b': 'شيكاغو : (14 - 32) / 1,8 = -10 °C', '2': 'شيكاغو (-10 °C < -2 °C ; 14 °F < 28,4 °F)'}, 'answerSource': 'computed',
          'reading': 'Le texte dit « de fahrenheit vers le celsius » mais la formule donnée (T°F = 1,8 × T°C + 32) convertit du celsius vers le fahrenheit : la question 1b demande de l’inverser (rédaction du manuel conservée).'})
assert D('1,8') * -2 + 32 == D('28,4') and (14 - 32) / D('1,8') == -10 and D('1,8') * -10 + 32 == 14 and -10 < -2 and 14 < D('28,4')

E.append({'id': 'ict', 'kind': 'ict', 'page': 21, 'section': 'أوظّف تكنولوجيات الإعلام والاتصال', 'title': 'الحاسبة والأعداد النسبية', 'verified': False,
          'text': 'الحاسبة والأعداد النسبية. 1) بالحاسبة أو بدونها: لحساب قيمة العدد $A=\\dfrac{8+3\\times(-4)}{1+2\\times(-1{,}5)}$ قامت ليلى بالضغط على ملامس الحاسبة بالترتيب التالي: '
                  '[8] [+] [3] [×] [(] [(-)] [4] [)] [÷] [1] [+] [2] [×] [(] [(-)] [1] [,] [5] [)]. 1) هل ستحصل ليلى على النتيجة الصحيحة؟ '
                  '2) إذا كان كذلك، حدد هذه النتيجة. وإلا فحدد الخطأ الذي ارتكبته ليلى ثم أعط النتيجة الصحيحة لهذا الحساب. '
                  '2) الحساب على الأعداد النسبية بالحاسبة. 1) لمسة الأعداد السالبة: أ) لإجراء حسابات على الأعداد النسبية السالبة نحتاج إلى لمسة جديدة، أين توجد هذه اللمسة؟ '
                  'ب) لماذا لا نحتاج إلى هذه اللمسة عند إجراء حسابات على الأعداد الموجبة؟ 2) أهمية استعمال الأقواس: أ) احجز على الحاسبة برنامج الحساب الخطي التالي: $(-17)\\times(-42)+(-15)\\times18$. '
                  'ب) أنجز هذا الحساب باليد. ما هو دور الأقواس في الحساب « المنجز باليد »؟ جـ) هل ترى أنه من الضروري حجز الأقواس التي تظهر في الحساب الذي « نجريه باليد » عندما ننجز هذا الحساب بالحاسبة؟ '
                  'د) احجز على الحاسبة سلسلة العمليات الخطية التالية: $(-42+17)\\times(15+18)$. هـ) أنجز هذا الحساب باليد. ما هو دور الأقواس في الحساب « المنجز باليد »؟ '
                  'و) هل ترى أنه من الضروري حجز الأقواس التي تظهر في الحساب الذي « نجريه باليد » عندما ننجز هذا الحساب بالحاسبة؟ ز) ما الذي يمكننا استنتاجه حول استعمال الحاسبة عند إنجاز حسابات باليد أو بالحاسبة؟',
          'figure': 'dessin d’une calculatrice ; deux rangées de touches arrondies (8 + 3 × ( (−) 4 ) ÷ puis 1 + 2 × ( (−) 1 , 5 )).',
          'answer': {'1': 'non : la calculatrice calcule 8 + (3 x (-4)) / 1 + 2 x (-1,5) = -7 ; il manque les parenthèses autour du numérateur ET du dénominateur ; le résultat correct est A = (-4)/(-2) = 2',
                     '2.1': 'la touche (−) (signe négatif) ; elle est inutile pour les positifs (pas de signe à saisir)', '2.2.أ': '444', '2.2.ب': 'les parenthèses isolent le signe de chaque nombre : (−17) × (−42) + (−15) × 18 ; sur la calculatrice, la touche (−) rend ces parenthèses inutiles ici car × passe avant +',
                     '2.2.د': '-825', '2.2.هـ': 'les parenthèses obligent à additionner AVANT de multiplier : elles sont nécessaires aussi sur la calculatrice', '2.2.ز': 'la calculatrice applique les priorités : on tape les parenthèses qui changent l’ordre (numérateur, dénominateur, sommes) ; celles qui ne font que porter un signe se saisissent avec la touche (−)'},
          'answerSource': 'computed',
          'reading': 'Les deux expressions de 2.2 sont imprimées avec le « − » après les chiffres ((17-)×(42-)+(15-)×18 et (18+15)×(17+42-)) : lues (−17)×(−42)+(−15)×18 = 444 et (−42+17)×(15+18) = −825.'})
assert D('8') + 3 * -4 / 1 + 2 * D('-1,5') == -7 and (8 + 3 * -4) / F(1 + 2 * D('-1,5')) == 2 and (8 - 12) / (1 - 3) == 2
assert (-17) * (-42) + (-15) * 18 == 444 and (-42 + 17) * (15 + 18) == -825

# ── Destinations ────────────────────────────────────────────────────────────────────────────────
L1, L2, L3, SYN = 'jidaa-adadayn-nisbiyayn', 'jidaa-ida-nisbiya', 'qismat-nisbiyayn', 'wadiya-idmajiya-aadad-nisbiya'
def d(lesson, module=None, **kw): return {'lesson': lesson, 'module': module, **kw}
DEST = {
    '_comment': 'elementId → { lesson, module } ; `items` répartit un élément ; une leçon encore coming_soon est une destination EN ATTENTE (check-textbook-coverage.mjs). '
                'Modules de jidaa-adadayn-nisbiyayn : 0 أستعدّ · 1 نشاط · 2 معارف · 3 طريقة · 4 أتمرّن · 5–7 مسائل · 8 إختبار أولي ; `None` = banque d’exercices.',
    'objectives': d('unit', 'page'),
    'opener': d(SYN, None, note='illisible', notIntegrated='cadre historique détruit par des blocs de pixels sur le scan (illisible) : la plateforme n’en tire rien — décision de la synthèse, 2026-10-26'),
    'challenge': d(L2, 5, items={'1': d(L2, 5, note='2017 nombres égaux de somme −2017 : chacun vaut −1, 2017 est impair : produit −1 (parité), refait avec 2025'),
                                 '2': d(SYN, 5, note='décompositions de −36 en produit d’entiers relatifs : situation d’entraînement 5 de la synthèse')}),
    'prep': d(L1, 0, items={'7-10-11-14-15': d(L1, 0), '1-5-6-8-9': d(L2, 0), '12-13': d(L3, 0), '2-3-4': d(SYN, 0)}),
    'act-1': d(L1, 4, note='APPLICATION (guide §4ter) : le puits (neg × pos comme addition répétée) est repris en أتمرّن, avec ses propres nombres'),
    'act-2': d(L1, 4, note='APPLICATION : l’escalator de 90 marches (somme répétée → produit) est repris en أتمرّن'),
    'act-3': d(L1, 2, note='le raisonnement (k × b + k × (−b) = k × 0 = 0 ; le tableau (−7) × n qui baisse de 7) devient la voie de معارف avec des nombres redessinés'),
    'act-4': d(L3, 4, items={'1-2': d(L3, 4), '3': d(L3, 3)}),
    'know-1': d(L1, 2), 'know-2': d(L1, 3), 'know-3': d(L2, 1), 'know-4': d(L2, 2), 'know-5': d(L2, 1), 'know-6': d(L2, 2),
    'method-1': d(L1, 3, items={'1-2': d(L1, 3), '3': d(L2, 3)}),
    'method-2': d(L2, 3), 'method-3': d(L2, 3),
    'now-11': d(L2, 4),
    'know-7': d(L2, 3), 'know-8': d(L3, 1), 'know-9': d(L3, 2), 'know-10': d(L3, 3),
    'method-4': d(L2, 3), 'method-5': d(L3, 2), 'method-6': d(L3, 3), 'now-13': d(L3, 4),
}
for k_, (lesson_, module_) in {
        1: (L1, None), 2: (L1, None), 3: (L1, None), 4: (L1, None), 5: (L2, None), 6: (L1, 4), 7: (L1, None), 8: (L1, None),
        9: (L2, None), 10: (L2, None), 11: (L2, None), 12: (L2, None), 13: (L2, 4), 14: (L2, None), 15: (L3, None), 16: (L3, None),
        17: (L1, 4), 18: (L2, None), 19: (L1, None), 20: (L2, None), 21: (L3, None), 22: (L3, None), 23: (L3, None), 24: (L3, None),
        25: (L3, None), 26: (L3, None), 27: (L3, None), 28: (L3, None), 29: (L1, 4), 30: (L3, None), 31: (L3, None), 32: (L3, None),
        33: (L3, None), 34: (L1, None)}.items():
    DEST[f'ex-{k_}'] = d(lesson_, module_)
# qismat-nisbiyayn (2026-10-26) : les éléments de la leçon posés en modules (les autres restent la banque, citée par ses fiches) :
# ex-15, 16, 27, 30 → E1 ; ex-22, 23 → E2 ; ex-24, 25, 26 → E3 ; ex-33 → E6 ; deep-40 → E7 ; deep-41 → E8 ; deep-45 → E9 ; deep-52 → مسألة 2 ; self-8…11 → test (et banque).
for k_ in (15, 16, 27, 30, 22, 23, 24, 25, 26, 33): DEST[f'ex-{k_}'] = d(L3, 4)
for k_, lesson_ in {1: L1, 2: L1, 3: L1, 4: L1, 5: L1, 6: L2, 7: L2, 8: L3, 9: L3, 10: L3, 11: L3, 12: L2}.items():
    DEST[f'self-{k_}'] = d(lesson_, 8 if lesson_ == L1 else None)
for k_, (lesson_, module_) in {
        35: (L2, None), 36: (L3, None), 37: (L1, 4), 38: (SYN, None), 39: (L2, 4), 40: (L3, None), 41: (L3, None), 42: (L2, 4), 43: (L1, 4), 44: (L2, 4),
        45: (L3, None), 46: (L2, None), 47: (L3, None), 48: (L3, None), 49: (L2, 4), 50: (L3, None), 51: (L2, 4), 52: (L3, None)}.items():
    DEST[f'deep-{k_}'] = d(lesson_, module_)
for k_, m_ in ((40, 4), (41, 4), (45, 4), (52, 6)): DEST[f'deep-{k_}'] = d(L3, m_)
for k_ in (8, 9, 10, 11): DEST[f'self-{k_}'] = d(L3, 8)
DEST['deep-38']['note'] = 'addition seule (cases dont la somme sur chaque côté est 2) : banque de la synthèse (plan README)'
DEST['deep-37']['note'] = 'contraste produit/somme (4 cas) : أتمرّن de jidaa-adadayn-nisbiyayn (plan E8)'
DEST['deep-43']['note'] = 'vrai/faux : أ et جـ seulement dans la leçon (ب est du 2AM) ; plan E6'
DEST['integration'] = d(SYN, 1, note='REDESIGNÉE : une nuit à l’Assekrem (amplitude thermique, kelvin ↔ celsius, moyenne), nombres propres : situation d’entraînement 1')
DEST['evaluation'] = d(SYN, 7, note='REDESIGNÉE : la situation « Fahrenheit » (Sétif −3 °C, Montréal −13 °F) est analysée au module 7 et évaluée au module 8')
DEST['ict'] = d(L3, 7, note='REDESIGNÉE en مسألة : parenthèses du numérateur et du dénominateur d’un quotient (la calculatrice n’est pas la leçon)')
DEST['self-1']['note'] = DEST['self-2']['note'] = DEST['self-3']['note'] = DEST['self-4']['note'] = DEST['self-5']['note'] = 'items de test (module 8) ET banque (chiffres redessinés)'

DISCREPANCIES = [
    {'elementId': 'unit', 'kind': 'scan', 'text': 'Pages 6–21 complètes, PDF = page imprimée + 1 (textbook-map.json). Les exercices pp. 14–16 sont sur deux colonnes ; les pages portent un filigrane « elbassair.net » inoffensif ; les 22 ex-1…34 et les 12 + 18 questions suivent la numérotation continue du manuel (ex 1–34, أؤكّد 1–12, أتعمّق 35–52).'},
    {'elementId': 'opener', 'kind': 'scan', 'text': 'Le grand cadre blanc sous la liste des objectifs (texte historique avec un titre rose et un mot rouge) est DÉTRUIT par des blocs de pixels : illisible. Seuls des bribes (« …الموجبة هي… ») se devinent. Destination : la synthèse (module None), note « illisible » : la plateforme n’en tire rien.'},
    {'elementId': 'objectives', 'kind': 'reading', 'text': 'La liste est imprimée en deux rubriques numérotées « 1. حساب جداء عددين نسبيين » et « 2. مربع عدد نسبي », mais la seconde rubrique mêle le carré ET les quatre objets du quotient ; transcrite telle quelle, sans réorganiser.'},
    {'elementId': 'prep', 'kind': 'reading', 'text': 'Items 11, 12, 13, 15 imprimés avec le « − » APRÈS les chiffres (« (4-)-(3-) », « 13+7-9+5- », « (5-)+(3-) », « (11 - 8) - 7 ») : rendu RTL qui renverse les opérandes ; lus (−3)−(−4) = 1, −5+9−7+13 = 10, (−3)+(−5) = −8, 7−(8−11) = 10. Chaque lecture est la SEULE qui rende au moins une option imprimée correcte (items 11 et 15 : une seule option juste ; la lecture littérale (11−8)−7 = −4 ne correspond à aucune option).'},
    {'elementId': 'prep', 'kind': 'reading', 'text': 'Item 5 (« température la plus basse ») : aucune donnée à comparer n’est imprimée ; l’item est lu « la plus basse des trois options » (−15 °C). Item 8 : « على مستقيم مدرّج من اليمين إلى اليسار » est ambigu (sens de la droite) ; lu sur la droite usuelle, croissante vers la droite. Items 1–9, 12–13 relus à 220 dpi seulement (leur leçon les relira).'},
    {'elementId': 'know-2', 'kind': 'reading', 'text': 'Chaque exemple est une accolade à DEUX lignes : l’exemple 1 est (−10) × (−3,8) = 38 puis 3 × 7 = 21 (la deuxième ligne illustre le produit de deux positifs) ; l’exemple 2 est (−6) × 3,4 = −20,4 puis 13 × −4 = −52 (écrit sans parenthèses dans le manuel).'},
    {'elementId': 'now-11', 'kind': 'reading', 'text': 'Le nombre de facteurs sous l’accolade de A = (−2) × (−2) × … × (−2) est lu « 85 » sur le scan (600 dpi, JPEG brut ×10, puis 500 dpi par jidaa-ida-nisbiya) ; le plan README et le plan de jidaa-ida-nisbiya disaient « 50 ». Confirmé : le dernier chiffre est un 5, le nombre est impair, le signe est − (le plan se trompait). La leçon n’utilise pas ce nombre (elle pose ses propres 40 et 7 facteurs).'},
    {'elementId': 'self-8', 'kind': 'reading', 'text': 'Imprimé « (-5) ÷ (-25) » avec les signes après les chiffres sur le scan (rendu RTL) : les options (5 ; −5 ; −20 ; 20) ne conviennent qu’à (−25) ÷ (−5) = 5 ; (−5) ÷ (−25) = 0,2 n’est pas proposé. Clé : أ. Contrairement à self-11 il n’est pas listé dans le plan README ; ajouté ici.'},
    {'elementId': 'self-11', 'kind': 'reading', 'text': 'Imprimé « (-4) ÷ 11 » (signes après les chiffres, rendu RTL) mais les options (11/−4, −11/4, −2,75, 11/4) ne conviennent qu’à 11 ÷ (−4) = −2,75 ; (−4) ÷ 11 = −4/11 ne se trouve pas dans les options. Transcrit 11 ÷ (−4) ; clés أ, ب, جـ.'},
    {'elementId': 'self-12', 'kind': 'reading', 'text': 'Énoncé imprimé « 3 × (4,7-) - 13 × 4,7- » (rendu RTL) lu −4,7 × 13 − (−4,7) × 3 = −47 ; options (−4,7)×(13−3) = −47 (أ), −4,7×13×3 (ب), 10×(−4,7) = −47 (جـ), (−4,7)×(−10) = 47 (د) : clés أ et جـ. Lecture LITTÉRALE possible : 3×(−4,7) − 13×(−4,7) = 47, seule د conviendrait ; la lecture RTL est celle du plan README et rend DEUX bonnes options (le manuel dit « الإجابة أو الإجابات »).'},
    {'elementId': 'self-4', 'kind': 'reading', 'text': 'L’option أ est imprimée « 92 ، 25 » (virgule typographique à la place du séparateur décimal, à l’envers) : lue 25,92 (la bonne réponse est −25,92, option جـ).'},
    {'elementId': 'deep-40', 'kind': 'reading', 'text': 'ب) −9 + 2 × 8 × 2 − 12 = −70 exige DEUX paires de parenthèses : (−9 + 2 × 8) × (2 − 12) = 7 × (−10) = −70 (recherche exhaustive : la seule façon). أ) (14 − 4) × (6 − 1) = 50 exige aussi deux paires ; جـ) 27 − 2,5 × (8,5 − 4,5) = 17 ; د) (15 − 25) × 2,4 + (7 − 3) × 2 = −16. Le titre « أقواس منسية » laisse entendre un seul couple : lecture du manuel inchangée.'},
    {'elementId': 'deep-47', 'kind': 'reading', 'text': 'Le scan imprime « 52 » dans la case du milieu de droite ; le carré multiplicatif magique [_,1,_ / 4,−10,x / 5,_,−2] n’existe que pour x = 25 (constante (−10)³ = −1000 ; complété : −50 1 20 / 4 −10 25 / 5 100 −2). Avec 52 les lignes et les colonnes peuvent se compléter (−104 1 20 / 4 −10 52 / 5 208 −2, produit −2080) mais les diagonales échouent (20 × (−10) × 5 = −1000) : le carré n’est magique (diagonales comprises) qu’avec 25 (corrigé par qismat-nisbiyayn, 2026-10-26). « 52 » est le « 25 » rendu à l’envers (chiffres inversés, même cause que les autres).'},
    {'elementId': 'deep-45', 'kind': 'reading', 'text': 'Les trois suites sont composées en bidi ; lues de gauche à droite exactement comme imprimées (−243 ; 81 ; … ; 9 ; −3 etc.). Les raisons (−1/3, −1/5, puis ×(−1), ×(−2), ×(−3), ×(−4), ×(−5)) ne rendent les suites cohérentes que dans CET ordre.'},
    {'elementId': 'deep-38', 'kind': 'figure', 'text': 'Le triangle magique est un dessin PÂLE : les six cercles sont à peine visibles ; seule la case « 0 » est lisible et se trouve au milieu du côté gauche. Avec cette position il y a deux solutions (symétriques) ; la lecture est à confirmer par la leçon qui l’emploie (banque de la synthèse).'},
    {'elementId': 'ex-23', 'kind': 'reading', 'text': 'Le signe « − » devant chaque fraction de ب) جـ) د) est extérieur à la fraction : −(−3/+7) = +3/7, −(5/−2) = +5/2, −(+4/−10) = +2/5 ; avec أ) (−9)/(+3) = −3 ce sont les trois quotients positifs (clés ب, جـ, د).'},
    {'elementId': 'ex-24', 'kind': 'reading', 'text': 'Les opérandes de جـ) et د) sont imprimés avec le « − » après le chiffre et dans les deux sens possibles ; lus (−32)÷(−5) et (−21)÷(−5) (quotients décimaux 6,4 et 4,2). Confirmé par qismat-nisbiyayn (scan relu à 130 dpi, 2026-10-26).'},
    {'elementId': 'ex-15', 'kind': 'reading', 'text': 'Dans l’énoncé le carré vide □ marque le nombre cherché ; l’ordre imprimé de ب) est « (+40) = (−5) × □ » (résultat à gauche du =).'},
    {'elementId': 'ex-17', 'kind': 'reading', 'text': 'Cibles lues : 32 ; −28 ; −0,25 ; 4,9. Le signe de −28 et de −0,25 est devant le nombre (le scan imprime « 32 ، ب) -28 ، جـ) -0,25 ، د) 4,9 »).'},
    {'elementId': 'ex-30', 'kind': 'reading', 'text': 'Les deux premiers énoncés sont composés en bidi (« (+48) ÷ … = (+8) » et « (+1) = … × (−1,6) ») ; lus ainsi. د) (−7,5) × … = 2,5 donne −1/3 et و) (−12) × … = −0,5 donne 1/24 : des quotients non décimaux (écriture en fraction).'},
    {'elementId': 'integration', 'kind': 'scope', 'text': 'Deux boîtes de la page 20 : « أدمج تعلّماتي » (amplitudes thermiques sur la Lune, Vénus, Mars ; kelvin ↔ celsius) = élément `integration` ; « وضعية للتقويم » (Fahrenheit) = élément `evaluation`.'},
    {'elementId': 'evaluation', 'kind': 'reading', 'text': 'Le texte dit « de fahrenheit vers le celsius » mais la formule donnée convertit du celsius vers le fahrenheit ; la question 1b demande de l’inverser (rédaction du manuel conservée).'},
    {'elementId': 'method-1', 'kind': 'scope', 'text': 'L’élément est partagé : les exercices 1 et 2 (deux relatifs) + la طريقة → jidaa-adadayn-nisbiyayn ; l’exercice 3 (cinq facteurs, P = −831,6) → jidaa-ida-nisbiya (voir `items`).'},
    {'elementId': 'unit', 'kind': 'scope', 'text': 'Les éléments de qismat-nisbiyayn et de la synthèse sont transcrits aussi fidèlement mais marqués `verified: false` : leur leçon les relira (ceux de jidaa-ida-nisbiya ont été relus le 2026-10-26 : `verified: true`).'},
]

# ── Contrôles de cohérence ──────────────────────────────────────────────────────────────────────
ids = [e['id'] for e in E]
assert len(ids) == len(set(ids)), 'id en double'
missing = [i for i in ids if i not in DEST]
assert not missing, f'éléments sans destination : {missing}'
extra = [k for k in DEST if k != '_comment' and k not in ids]
assert not extra, f'destinations sans élément : {extra}'
want = ['objectives', 'opener', 'challenge', 'prep'] + [f'act-{i}' for i in range(1, 5)] + [f'know-{i}' for i in range(1, 11)] + [f'method-{i}' for i in range(1, 7)] + ['now-11', 'now-13'] \
    + [f'ex-{i}' for i in range(1, 35)] + [f'self-{i}' for i in range(1, 13)] + [f'deep-{i}' for i in range(35, 53)] + ['integration', 'evaluation', 'ict']
assert sorted(ids) == sorted(want), (set(ids) ^ set(want))
assert all(e['id'] in DEST for e in E) and DEST['opener']['note'] == 'illisible'
for e in E:
    if e['id'] in ('opener', 'objectives'): continue
# règle `verified` : True pour les éléments destinés à jidaa-adadayn-nisbiyayn (et ceux de la page de l'unité), False pour les autres (leur leçon les relit)
for e in E:
    if DEST[e['id']]['lesson'] not in (L1, L2, 'unit') and e['id'] not in ('prep', 'method-1', 'challenge'):
        e['verified'] = False
# jidaa-ida-nisbiya (2026-10-26) : les éléments de la leçon sont relus (maths recalculées ci-dessus, now-11 relu à 500 dpi, exercices pp. 14–19 relus par la banque) → vrai.
for e in E:
    if DEST[e['id']]['lesson'] == L2: e['verified'] = True
# qismat-nisbiyayn (2026-10-26) : act-4, know-8…10, method-5, method-6, now-13 relus à 110 dpi (pp. 9, 12, 13) ; ex-15, 16, 21–28, 30–33, self-8…11, deep-36, 45, 47, 48, 50
# relus à 130–260 dpi par la banque (aucune valeur changée) ; ex-17, ex-18…20 ne sont pas de cette leçon ; ict (p. 21) relu pour la مسألة 3 (nombres redessinés).
for e in E:
    if DEST[e['id']]['lesson'] == L3: e['verified'] = True
# wadiya-idmajiya-aadad-nisbiya (2026-10-26) : integration et evaluation (p. 20, PDF 21), prep 2–4 (p. 7, PDF 8) et deep-38 (p. 18, PDF 19) relus à 110 dpi ; le texte et les
# réponses calculées ci-dessus sont confirmés ; la figure de deep-38 (le « 0 » au milieu du côté gauche, deux solutions symétriques A = −1, B = 3 ou A = 3, B = −1, C = 1) est relue.
for e in E:
    if DEST[e['id']]['lesson'] == SYN: e['verified'] = True
for e in E:
    if e['id'] == 'prep':
        for it in e.get('items', []):
            if it.get('n') in (2, 3, 4): it['verified'] = True
    # les éléments partagés (prep, act-4 …) dont une partie seulement est à cette leçon restent comme leur premier destinataire les a laissés
verified_l1 = [e['id'] for e in E if DEST[e['id']]['lesson'] == L1 and not e.get('verified')]

doc = {
    '_comment': [
        'EXTRACTION CANONIQUE du manuel scolaire officiel — 3AM, الجيل الثاني (الشهاب 2017), unité 1 « الأعداد النسبية ».',
        'Source : docs/official-book-pdfs/كتاب الرياضيات للسنة الثالثة متوسط الجيل الثاني.pdf, pages imprimées 6 à 21 (PDF = imprimée + 1 dans cette unité).',
        'Ce fichier est LA source de vérité pédagogique de l’unité ; tout contenu cite un `id` d’ici via `source.elementId`.',
        'Transcription VISUELLE ; réponses calculées par build-extraction.py (fractions.Fraction), `answerSource: computed`.',
        'Généré par docs/sources/3am/unit1/build-extraction.py — ne pas éditer à la main.',
    ],
    'unitCode': 'aadad-nisbiya',
    'textbook': {'title': 'كتاب الرياضيات — السنة الثالثة من التعليم المتوسط', 'generation': 'الجيل الثاني', 'unitNumber': 1, 'unitTitle': 'الأعداد النسبية',
                 'pages': {'first': 6, 'last': 21}, 'pdfPageOffset': 1,
                 'sections': ['سأتعلّم في هذا الباب', 'تحدّي', 'أستعدّ', 'أنشطة', 'معارف', 'طرائق', 'دوري الآن', 'أوظّف تعلّماتي', 'أؤكّد تعلّماتي', 'أتعمّق', 'أدمج تعلّماتي', 'وضعية للتقويم', 'أوظّف تكنولوجيات الإعلام والاتصال']},
    'frozenAt': '2026-10-25',
    'terminology': {'note': 'Le manuel écrit « جداء », « حاصل قسمة », « قاعدة الإشارات », « نظير », « المسافة إلى الصفر », « العوامل السالبة », « عدد فردي / زوجي ».',
                    'terms': ['جداء', 'حاصل قسمة', 'قاعدة الإشارات', 'نظير', 'المسافة إلى الصفر', 'العوامل السالبة', 'مربع عدد نسبي']},
    'elements': E,
    'discrepancies': DISCREPANCIES,
    'destinations': DEST,
}
out = Path(__file__).with_name('extraction.json')
out.write_text(json.dumps(doc, ensure_ascii=False, indent=1, default=str) + '\n', encoding='utf-8')
n_l1 = sum(1 for k, v in DEST.items() if k != '_comment' and v['lesson'] == L1)
print(f'{out} — {len(E)} éléments ({n_l1} pour {L1}, {sum(1 for k, v in DEST.items() if k != "_comment" and v["lesson"] not in ("unit", L1))} vers les autres leçons) ; non vérifiés pour {L1} : {verified_l1}')
