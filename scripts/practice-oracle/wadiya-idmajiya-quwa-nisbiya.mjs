// Oracle du banc « wadiya-idmajiya-quwa-nisbiya » (« أدمج تعلّماتي — القوى ذات أسس نسبية صحيحة », synthèse de l'unité 3 de 3AM, 2026-10-28) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل … »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer` :
//  - l'expression de chaque question est RETAPÉE dans la spec ci-dessous (syntaxe ASCII : `*`, `/`, `^`, parenthèses) et évaluée par un analyseur écrit dans ce fichier,
//    en rationnels EXACTS (BigInt) — la puissance à exposant entier relatif aussi, la puissance se liant avant le moins unaire (−3^2 = −9). L'oracle vérifie que chaque littéral
//    de 2 chiffres ou plus (ou décimal) de la spec figure dans la feuille (énoncé, formules, questions) ;
//  - « écrire sous la forme 10^n » : l'unique exposant n (−60 … 60) tel que la base^n vaut l'expression ; l'écriture scientifique a × 10^n : l'UNIQUE n (testé pour tous les n,
//    jamais en comptant des chiffres) tel que 1 ≤ a < 10 ; la rang de grandeur arrondit a au demi supérieur (a' = 10 devient 1 × 10^(n+1)) ;
//  - un QCM n'a qu'UNE bonne option : un encadrement se lit sur les deux puissances de 10 de l'option, une comparaison et un signe se décident sur les valeurs exactes ;
//  - `audit` contrôle chaque étiquette MISC-WQ-* qu'il sait recalculer : SIGN = l'opposé de la clé · PRIORITY = calcul de gauche à droite sans priorités · MULEXP = produit
//    des exposants · POWSUM = somme des exposants · DIGITS = nombre de chiffres · ROUND = partie entière ou suivante de a · FIRST = clé − 1 ; les autres étiquettes sont
//    seulement différentes de la clé.
const SPEC = {
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-001:q1": {
 "k": "val",
 "e": "(-2)^5"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-001:q2": {
 "k": "val",
 "e": "(-3)^4"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-001:q3": {
 "k": "val",
 "e": "-3^2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-001:q4": {
 "k": "val",
 "e": "5^-2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-002:q1": {
 "k": "val",
 "e": "10^-3"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-002:q2": {
 "k": "val",
 "e": "7^0"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-002:q3": {
 "k": "val",
 "e": "(-1)^99"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-002:q4": {
 "k": "val",
 "e": "2^-4"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-003:q1": {
 "k": "exp",
 "b": 10,
 "e": "10^4*10^5"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-003:q2": {
 "k": "exp",
 "b": 10,
 "e": "10^8/10^3"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-003:q3": {
 "k": "exp",
 "b": 10,
 "e": "(10^2)^5"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-003:q4": {
 "k": "exp",
 "b": 10,
 "e": "10^-3*10^7"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-004:q1": {
 "k": "sciA",
 "e": "45000"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-004:q2": {
 "k": "sciN",
 "e": "45000"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-004:q3": {
 "k": "sciA",
 "e": "0.0072"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-004:q4": {
 "k": "sciN",
 "e": "0.0072"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-005:q1": {
 "k": "ordA",
 "e": "67000"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-005:q2": {
 "k": "ordA",
 "e": "0.0238"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-005:q3": {
 "k": "ordA",
 "e": "8.5*10^3"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-005:q4": {
 "k": "ordN",
 "e": "152000"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-006:q1": {
 "k": "brk",
 "e": "4200",
 "pairs": [
  [
   3,
   4
  ],
  [
   2,
   3
  ],
  [
   4,
   5
  ],
  [
   -4,
   -3
  ]
 ],
 "rot": 0
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-006:q2": {
 "k": "brk",
 "e": "0.034",
 "pairs": [
  [
   -2,
   -1
  ],
  [
   -3,
   -2
  ],
  [
   -1,
   0
  ],
  [
   1,
   2
  ]
 ],
 "rot": 1
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-006:q3": {
 "k": "brk",
 "e": "70500",
 "pairs": [
  [
   4,
   5
  ],
  [
   3,
   4
  ],
  [
   5,
   6
  ],
  [
   -5,
   -4
  ]
 ],
 "rot": 2
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-006:q4": {
 "k": "brk",
 "e": "0.9",
 "pairs": [
  [
   -1,
   0
  ],
  [
   -2,
   -1
  ],
  [
   0,
   1
  ],
  [
   0,
   1
  ]
 ],
 "rot": 3
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-007:q1": {
 "k": "sign",
 "e": "(-5)^6",
 "rot": 1
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-007:q2": {
 "k": "sign",
 "e": "(-2)^7",
 "rot": 2
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-007:q3": {
 "k": "sign",
 "e": "-4^2",
 "rot": 0
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-007:q4": {
 "k": "sign",
 "e": "(-1)^100",
 "rot": 1
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-008:q1": {
 "k": "val",
 "e": "5-2*3^2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-008:q2": {
 "k": "val",
 "e": "(5-2)*3^2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-008:q3": {
 "k": "val",
 "e": "2^3-3*2^2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-008:q4": {
 "k": "val",
 "e": "-2^2+3^2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-009:q1": {
 "k": "sciA",
 "e": "12*10^-3"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-009:q2": {
 "k": "sciN",
 "e": "12*10^-3"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-009:q3": {
 "k": "sciA",
 "e": "250*10^-6"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-009:q4": {
 "k": "sciN",
 "e": "250*10^-6"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-010:q1": {
 "k": "cmp",
 "a": "3.2*10^5",
 "b": "4.1*10^4",
 "rot": 2
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-010:q2": {
 "k": "cmp",
 "a": "6*10^-3",
 "b": "2*10^-2",
 "rot": 0
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-010:q3": {
 "k": "cmp",
 "a": "7.5*10^8",
 "b": "7.5*10^9",
 "rot": 1
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l1-010:q4": {
 "k": "cmp",
 "a": "1.1*10^-5",
 "b": "9.9*10^-6",
 "rot": 2
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-001:q1": {
 "k": "sciA",
 "e": "(3*10^4)*(2*10^5)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-001:q2": {
 "k": "sciN",
 "e": "(3*10^4)*(2*10^5)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-001:q3": {
 "k": "sciA",
 "e": "(4*10^-3)*(5*10^6)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-001:q4": {
 "k": "sciN",
 "e": "(4*10^-3)*(5*10^6)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-002:q1": {
 "k": "sciA",
 "e": "(6*10^8)/(3*10^3)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-002:q2": {
 "k": "sciN",
 "e": "(6*10^8)/(3*10^3)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-002:q3": {
 "k": "sciA",
 "e": "(9*10^-2)/(3*10^4)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-002:q4": {
 "k": "sciN",
 "e": "(9*10^-2)/(3*10^4)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-003:q1": {
 "k": "sciA",
 "e": "(2*10^3)^2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-003:q2": {
 "k": "sciN",
 "e": "(2*10^3)^2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-003:q3": {
 "k": "sciA",
 "e": "(3*10^-2)^3"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-003:q4": {
 "k": "sciN",
 "e": "(3*10^-2)^3"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-004:q1": {
 "k": "sciA",
 "e": "12*10^5*3*10^-2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-004:q2": {
 "k": "sciN",
 "e": "12*10^5*3*10^-2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-004:q3": {
 "k": "ordA",
 "e": "12*10^5*3*10^-2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-004:q4": {
 "k": "ordN",
 "e": "12*10^5*3*10^-2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-005:q1": {
 "k": "val",
 "e": "(8*10^7)/(4*10^4)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-005:q2": {
 "k": "val",
 "e": "(5*10^-3)/(2.5*10^-6)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-005:q3": {
 "k": "exp",
 "b": 10,
 "e": "(6*10^9)/(6*10^3)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-005:q4": {
 "k": "val",
 "e": "(3*10^6)/(1.5*10^2)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-006:q1": {
 "k": "exp",
 "b": 10,
 "e": "(2^3*5^3)^2/10^4"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-006:q2": {
 "k": "exp",
 "b": 10,
 "e": "2^4*5^4*10^-2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-006:q3": {
 "k": "exp",
 "b": 10,
 "e": "(4*25)^3/10^2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-006:q4": {
 "k": "exp",
 "b": 10,
 "e": "5^-2*2^-2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-007:q1": {
 "k": "ordA",
 "e": "3.4*10^5*2*10^-2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-007:q2": {
 "k": "ordN",
 "e": "3.4*10^5*2*10^-2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-007:q3": {
 "k": "ordA",
 "e": "7.2*10^-4*5*10^6"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-007:q4": {
 "k": "ordN",
 "e": "7.2*10^-4*5*10^6"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-008:q1": {
 "k": "brk",
 "e": "2.5*10^3*4*10^4",
 "pairs": [
  [
   8,
   9
  ],
  [
   7,
   8
  ],
  [
   9,
   10
  ],
  [
   -9,
   -8
  ]
 ],
 "rot": 0
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-008:q2": {
 "k": "brk",
 "e": "6*10^-2*5*10^-3",
 "pairs": [
  [
   -4,
   -3
  ],
  [
   -5,
   -4
  ],
  [
   -3,
   -2
  ],
  [
   3,
   4
  ]
 ],
 "rot": 1
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-008:q3": {
 "k": "brk",
 "e": "(5*10^2)^2",
 "pairs": [
  [
   5,
   6
  ],
  [
   4,
   5
  ],
  [
   6,
   7
  ],
  [
   -6,
   -5
  ]
 ],
 "rot": 2
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-008:q4": {
 "k": "brk",
 "e": "(2*10^-3)^2",
 "pairs": [
  [
   -6,
   -5
  ],
  [
   -7,
   -6
  ],
  [
   -5,
   -4
  ],
  [
   5,
   6
  ]
 ],
 "rot": 3
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-009:q1": {
 "k": "cmp",
 "a": "3*10^4*2*10^3",
 "b": "5*10^6",
 "rot": 1
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-009:q2": {
 "k": "cmp",
 "a": "4*10^-2*5*10^-3",
 "b": "3*10^-4",
 "rot": 2
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-009:q3": {
 "k": "cmp",
 "a": "(2*10^3)^2",
 "b": "5*10^5",
 "rot": 0
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-009:q4": {
 "k": "cmp",
 "a": "9*10^8/(3*10^2)",
 "b": "4*10^6",
 "rot": 1
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-010:q1": {
 "k": "sciN",
 "e": "3*10^6"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-010:q2": {
 "k": "sciN",
 "e": "5.4*(10^-2)^2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-010:q3": {
 "k": "sciA",
 "e": "5.4*(10^-2)^2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l2-010:q4": {
 "k": "sciN",
 "e": "2*(10^3)^3"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-001:q1": {
 "k": "val",
 "e": "(-2)^3*10^-1+5*10^-2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-001:q2": {
 "k": "exp",
 "b": 10,
 "e": "(2^2*5^2)^2/10^3"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-001:q3": {
 "k": "val",
 "e": "(-1)^5-3*(-2)^2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-001:q4": {
 "k": "cmp",
 "a": "(-2)^3*10^-1+5*10^-2",
 "b": "(-1)^5-3*(-2)^2",
 "rot": 2
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-002:q1": {
 "k": "val",
 "e": "(3-5)^3+2^4*(-1)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-002:q2": {
 "k": "val",
 "e": "10^2-(-3)^3"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-002:q3": {
 "k": "val",
 "e": "2*10^-1+3*10^-2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-002:q4": {
 "k": "sciN",
 "e": "2*10^-1+3*10^-2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-003:q1": {
 "k": "val",
 "e": "(2^-3)^2*2^8"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-003:q2": {
 "k": "val",
 "e": "(-2)^3*(-2)^-5"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-003:q3": {
 "k": "val",
 "e": "3^5/3^7"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-003:q4": {
 "k": "val",
 "e": "(5^2)^-1*5^3"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-004:q1": {
 "k": "val",
 "e": "(-2)^-3"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-004:q2": {
 "k": "val",
 "e": "(-1/2)^3"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-004:q3": {
 "k": "val",
 "e": "(2/3)^-2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-004:q4": {
 "k": "val",
 "e": "(-3/4)^2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-005:q1": {
 "k": "val",
 "e": "5+2*(-3)^2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-005:q2": {
 "k": "val",
 "e": "(5+2)*(-3)^2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-005:q3": {
 "k": "val",
 "e": "-3^2+2*3^2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-005:q4": {
 "k": "val",
 "e": "(-2)^2*3-2^3"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-006:q1": {
 "k": "sciA",
 "e": "0.5*10^3+25*10^1"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-006:q2": {
 "k": "sciN",
 "e": "0.5*10^3+25*10^1"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-006:q3": {
 "k": "exp",
 "b": 10,
 "e": "2*10^-2*5*10^-1"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-006:q4": {
 "k": "sciA",
 "e": "10^3+10^2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-007:q1": {
 "k": "brk",
 "e": "(-2)^10",
 "pairs": [
  [
   3,
   4
  ],
  [
   2,
   3
  ],
  [
   4,
   5
  ],
  [
   -4,
   -3
  ]
 ],
 "rot": 1
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-007:q2": {
 "k": "ordA",
 "e": "3^7"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-007:q3": {
 "k": "ordN",
 "e": "2^-8"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-007:q4": {
 "k": "ordA",
 "e": "5^6"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-008:q1": {
 "k": "cmp",
 "a": "2^10",
 "b": "10^3",
 "rot": 1
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-008:q2": {
 "k": "cmp",
 "a": "3^-2",
 "b": "2^-3",
 "rot": 2
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-008:q3": {
 "k": "cmp",
 "a": "(-2)^4",
 "b": "-2^4",
 "rot": 0
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-008:q4": {
 "k": "cmp",
 "a": "5^3",
 "b": "3^5",
 "rot": 1
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-009:q1": {
 "k": "exp",
 "b": 3,
 "e": "3^4*3^-1"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-009:q2": {
 "k": "exp",
 "b": 2,
 "e": "2^7/2^-2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-009:q3": {
 "k": "exp",
 "b": 5,
 "e": "(5^-2)^3"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-009:q4": {
 "k": "exp",
 "b": -2,
 "e": "(-2)^3*(-2)^2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-010:q1": {
 "k": "val",
 "e": "(2*10^3)^2/(4*10^5)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-010:q2": {
 "k": "val",
 "e": "10^-2*10^5/10^2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-010:q3": {
 "k": "val",
 "e": "(10^3+10^2)/10^2"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l3-010:q4": {
 "k": "val",
 "e": "0.1^2*10^3"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-001:q1": {
 "k": "sciN",
 "e": "250*10^-12"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-001:q2": {
 "k": "sciN",
 "e": "0.5*10^-6"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-001:q3": {
 "k": "val",
 "e": "(0.5*10^-6)/(250*10^-12)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-001:q4": {
 "k": "ordA",
 "e": "(0.5*10^-6)/(250*10^-12)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-002:q1": {
 "k": "sciN",
 "e": "125*10^-12"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-002:q2": {
 "k": "sciN",
 "e": "3*10^-6"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-002:q3": {
 "k": "val",
 "e": "(3*10^-6)/(125*10^-12)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-002:q4": {
 "k": "ordA",
 "e": "(3*10^-6)/(125*10^-12)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-003:q1": {
 "k": "sciN",
 "e": "5*10^6"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-003:q2": {
 "k": "sciA",
 "e": "(2*10^3)*(5*10^6)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-003:q3": {
 "k": "sciN",
 "e": "(2*10^3)*(5*10^6)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-003:q4": {
 "k": "sciN",
 "e": "((2*10^3)*(5*10^6))*(20*10^-6)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-004:q1": {
 "k": "sciN",
 "e": "1.5*10^8*10^3"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-004:q2": {
 "k": "sciA",
 "e": "(1.5*10^8*10^3)/(3*10^8)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-004:q3": {
 "k": "sciN",
 "e": "(1.5*10^8*10^3)/(3*10^8)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-004:q4": {
 "k": "ordA",
 "e": "(1.5*10^8*10^3)/(3*10^8)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-005:q1": {
 "k": "sciN",
 "e": "3.9*10^5*10^3"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-005:q2": {
 "k": "sciA",
 "e": "(3.9*10^5*10^3)/(3*10^8)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-005:q3": {
 "k": "sciN",
 "e": "(3.9*10^5*10^3)/(3*10^8)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-005:q4": {
 "k": "ordA",
 "e": "(3.9*10^5*10^3)/(3*10^8)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-006:q1": {
 "k": "sciN",
 "e": "4*10^2*10^6"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-006:q2": {
 "k": "sciA",
 "e": "4*10^2*10^6"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-006:q3": {
 "k": "first",
 "start": "4*10^2",
 "p": 1,
 "T": 10
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-006:q4": {
 "k": "val",
 "e": "(4*10^2*10^6)/(4*10^2*10^3)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-007:q1": {
 "k": "sciN",
 "e": "(2.4*10^6)*10^6"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-007:q2": {
 "k": "sciA",
 "e": "((2.4*10^6)*10^6)/(4*10^7)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-007:q3": {
 "k": "sciN",
 "e": "((2.4*10^6)*10^6)/(4*10^7)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-007:q4": {
 "k": "ordA",
 "e": "((2.4*10^6)*10^6)/(4*10^7)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-008:q1": {
 "k": "sciA",
 "e": "(5*10^6)*(2.5*10^-5)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-008:q2": {
 "k": "sciN",
 "e": "(5*10^6)*(2.5*10^-5)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-008:q3": {
 "k": "ordA",
 "e": "(5*10^6)*(2.5*10^-5)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-008:q4": {
 "k": "brk",
 "e": "(5*10^6)*(2.5*10^-5)",
 "pairs": [
  [
   2,
   3
  ],
  [
   1,
   2
  ],
  [
   3,
   4
  ],
  [
   -3,
   -2
  ]
 ],
 "rot": 2
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-009:q1": {
 "k": "sciN",
 "e": "4*10^6"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-009:q2": {
 "k": "sciA",
 "e": "(6*10^3)*(4*10^6)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-009:q3": {
 "k": "sciN",
 "e": "(6*10^3)*(4*10^6)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-009:q4": {
 "k": "sciN",
 "e": "((6*10^3)*(4*10^6))*(8*10^-6)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-010:q1": {
 "k": "val",
 "e": "2^7"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-010:q2": {
 "k": "val",
 "e": "2^10"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-010:q3": {
 "k": "exp",
 "b": 2,
 "e": "2^6*2^4"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l4-010:q4": {
 "k": "ordA",
 "e": "2^20"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-001:q1": {
 "k": "sciN",
 "e": "200*10^-12"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-001:q2": {
 "k": "sciN",
 "e": "0.8*10^-6"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-001:q3": {
 "k": "val",
 "e": "(0.8*10^-6)/(200*10^-12)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-001:q4": {
 "k": "ordA",
 "e": "(0.8*10^-6)/(200*10^-12)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-001:q5": {
 "k": "val",
 "e": "10^-3/(200*10^-12)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-002:q1": {
 "k": "sciN",
 "e": "500*10^-12"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-002:q2": {
 "k": "sciN",
 "e": "1.2*10^-6"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-002:q3": {
 "k": "val",
 "e": "(1.2*10^-6)/(500*10^-12)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-002:q4": {
 "k": "ordA",
 "e": "(1.2*10^-6)/(500*10^-12)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-002:q5": {
 "k": "val",
 "e": "10^-3/(500*10^-12)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-003:q1": {
 "k": "sciN",
 "e": "4*10^6"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-003:q2": {
 "k": "sciA",
 "e": "(5*10^2)*(4*10^6)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-003:q3": {
 "k": "sciN",
 "e": "(5*10^2)*(4*10^6)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-003:q4": {
 "k": "sciN",
 "e": "((5*10^2)*(4*10^6))*(5*10^-6)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-003:q5": {
 "k": "ordA",
 "e": "(((5*10^2)*(4*10^6))*(5*10^-6))/10^3"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-004:q1": {
 "k": "sciN",
 "e": "2.5*10^6"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-004:q2": {
 "k": "sciA",
 "e": "(8*10^3)*(2.5*10^6)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-004:q3": {
 "k": "sciN",
 "e": "(8*10^3)*(2.5*10^6)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-004:q4": {
 "k": "sciN",
 "e": "((8*10^3)*(2.5*10^6))*(10*10^-6)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-004:q5": {
 "k": "ordA",
 "e": "(((8*10^3)*(2.5*10^6))*(10*10^-6))/10^3"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-005:q1": {
 "k": "sciN",
 "e": "7.5*10^8*10^3"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-005:q2": {
 "k": "sciA",
 "e": "(7.5*10^8*10^3)/(3*10^8)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-005:q3": {
 "k": "sciN",
 "e": "(7.5*10^8*10^3)/(3*10^8)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-005:q4": {
 "k": "ordA",
 "e": "(7.5*10^8*10^3)/(3*10^8)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-005:q5": {
 "k": "brk",
 "e": "(7.5*10^8*10^3)/(3*10^8)",
 "pairs": [
  [
   3,
   4
  ],
  [
   2,
   3
  ],
  [
   4,
   5
  ],
  [
   -4,
   -3
  ]
 ],
 "rot": 3
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-006:q1": {
 "k": "sciN",
 "e": "4.5*10^9*10^3"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-006:q2": {
 "k": "sciA",
 "e": "(4.5*10^9*10^3)/(3*10^8)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-006:q3": {
 "k": "sciN",
 "e": "(4.5*10^9*10^3)/(3*10^8)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-006:q4": {
 "k": "ordA",
 "e": "(4.5*10^9*10^3)/(3*10^8)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-006:q5": {
 "k": "brk",
 "e": "(4.5*10^9*10^3)/(3*10^8)",
 "pairs": [
  [
   4,
   5
  ],
  [
   3,
   4
  ],
  [
   5,
   6
  ],
  [
   -5,
   -4
  ]
 ],
 "rot": 0
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-007:q1": {
 "k": "sciN",
 "e": "5*10^3*10^10"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-007:q2": {
 "k": "sciA",
 "e": "5*10^3*10^10"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-007:q3": {
 "k": "first",
 "start": "5*10^3",
 "p": 2,
 "T": 15
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-007:q4": {
 "k": "val",
 "e": "(5*10^3*10^10)/(5*10^3*10^4)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-007:q5": {
 "k": "ordA",
 "e": "5*10^3*10^10"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-008:q1": {
 "k": "sciN",
 "e": "(9.6*10^5)*10^6"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-008:q2": {
 "k": "sciA",
 "e": "((9.6*10^5)*10^6)/(3.2*10^7)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-008:q3": {
 "k": "sciN",
 "e": "((9.6*10^5)*10^6)/(3.2*10^7)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-008:q4": {
 "k": "ordA",
 "e": "((9.6*10^5)*10^6)/(3.2*10^7)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-008:q5": {
 "k": "brk",
 "e": "((9.6*10^5)*10^6)/(3.2*10^7)",
 "pairs": [
  [
   4,
   5
  ],
  [
   3,
   4
  ],
  [
   5,
   6
  ],
  [
   -5,
   -4
  ]
 ],
 "rot": 1
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-009:q1": {
 "k": "sciA",
 "e": "(8*10^7)*(2*10^-5)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-009:q2": {
 "k": "sciN",
 "e": "(8*10^7)*(2*10^-5)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-009:q3": {
 "k": "ordA",
 "e": "(8*10^7)*(2*10^-5)"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-009:q4": {
 "k": "brk",
 "e": "(8*10^7)*(2*10^-5)",
 "pairs": [
  [
   3,
   4
  ],
  [
   2,
   3
  ],
  [
   4,
   5
  ],
  [
   -4,
   -3
  ]
 ],
 "rot": 2
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-009:q5": {
 "k": "val",
 "e": "((8*10^7)*(2*10^-5))/10^3"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-010:q1": {
 "k": "sciN",
 "e": "60*10^-12"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-010:q2": {
 "k": "sciN",
 "e": "0.13*10^-9"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-010:q3": {
 "k": "sciA",
 "e": "60*10^-12+0.13*10^-9+70*10^-12"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-010:q4": {
 "k": "sciN",
 "e": "60*10^-12+0.13*10^-9+70*10^-12"
 },
 "ex-3am-wadiya-idmajiya-quwa-nisbiya-l5-010:q5": {
 "k": "ordA",
 "e": "60*10^-12+0.13*10^-9+70*10^-12"
 }
};

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C } from './helpers.mjs';

/* ── rationnels exacts (BigInt) ─────────────────────────────────────────────── */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
class Q {
  constructor(n, d = 1n) {
    if (d === 0n) throw new Error('division par zéro');
    if (d < 0n) { n = -n; d = -d; }
    const g = gcd(n, d) || 1n; this.n = n / g; this.d = d / g;
  }
  add(o) { return new Q(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { return new Q(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { return new Q(this.n * o.n, this.d * o.d); }
  div(o) { return new Q(this.n * o.d, this.d * o.n); }
  neg() { return new Q(-this.n, this.d); }
  pow(k) {
    if (k.d !== 1n) throw new Error('exposant non entier');
    let e = k.n; let base = this;
    if (e < 0n) { if (this.n === 0n) throw new Error('0 puissance négative'); base = new Q(this.d, this.n); e = -e; }
    let r = new Q(1n); for (let i = 0n; i < e; i++) r = r.mul(base); return r;
  }
  eq(o) { return this.n === o.n && this.d === o.d; }
  cmp(o) { const l = this.n * o.d; const r = o.n * this.d; return l < r ? -1 : l > r ? 1 : 0; }
  toString() { return this.d === 1n ? String(this.n) : `${this.n}/${this.d}`; }
}
const ONE = new Q(1n); const TEN = new Q(10n);
const num = (s) => { const [i, f = ''] = s.split('.'); return new Q(BigInt(i + f), 10n ** BigInt(f.length)); };
const T10 = (k) => TEN.pow(new Q(BigInt(k)));

/* ── analyseur : expr = terme ((+|−) terme)* ; terme = unaire ((*|/) unaire)* ; unaire = −unaire | puissance ;
      puissance = primaire (^ (−)? primaire)? ; primaire = nombre | (expr) — la puissance se lie avant le moins unaire (−3^2 = −9) ── */
function evaluate(src) {
  const t = src.replace(/\s+/g, ''); let i = 0;
  const peek = () => t[i];
  const expr = () => { let v = term(); while (peek() === '+' || peek() === '-') { const op = t[i++]; const w = term(); v = op === '+' ? v.add(w) : v.sub(w); } return v; };
  const term = () => { let v = unary(); while (peek() === '*' || peek() === '/') { const op = t[i++]; const w = unary(); v = op === '*' ? v.mul(w) : v.div(w); } return v; };
  const unary = () => { if (peek() === '-') { i++; return unary().neg(); } return power(); };
  const power = () => { const b = primary(); if (peek() === '^') { i++; let s = false; if (peek() === '-') { s = true; i++; } const e = primary(); return b.pow(s ? e.neg() : e); } return b; };
  const primary = () => {
    if (peek() === '(') { i++; const v = expr(); if (t[i++] !== ')') throw new Error(`« ) » attendu dans ${src}`); return v; }
    const m = /^\d+(\.\d+)?/.exec(t.slice(i)); if (!m) throw new Error(`lecture impossible à ${i} dans ${src}`); i += m[0].length; return num(m[0]);
  };
  const v = expr(); if (i !== t.length) throw new Error(`reste « ${t.slice(i)} » dans ${src}`); return v;
}
const V = (s) => evaluate(s);
/** De gauche à droite SANS priorités (opérandes parenthésés évalués normalement) — l'erreur MISC-WQ-PRIORITY. */
function flat(src) {
  const t = src.replace(/\s+/g, ''); const parts = []; const ops = []; let depth = 0; let cur = '';
  for (const c of t) {
    if (c === '(') depth++; if (c === ')') depth--;
    if (depth === 0 && '+-*/'.includes(c) && cur !== '' && !'+-*/(^'.includes(cur[cur.length - 1])) { parts.push(cur); ops.push(c); cur = ''; continue; }
    cur += c;
  }
  parts.push(cur); let v = evaluate(parts[0]);
  ops.forEach((op, k) => { const w = evaluate(parts[k + 1]); v = op === '+' ? v.add(w) : op === '-' ? v.sub(w) : op === '*' ? v.mul(w) : v.div(w); });
  return v;
}
/** L'écriture scientifique d'un rationnel > 0 : { a, n } avec 1 ≤ a < 10, n trouvé en testant TOUS les n (jamais en comptant les chiffres). */
function sci(x) {
  if (x.cmp(new Q(0n)) <= 0) throw new Error('écriture scientifique d\'un nombre non strictement positif');
  const hits = [];
  for (let n = -60; n <= 60; n++) { const a = x.div(T10(n)); if (a.cmp(ONE) >= 0 && a.cmp(TEN) < 0) hits.push({ a, n }); }
  if (hits.length !== 1) throw new Error(`écriture scientifique : ${hits.length} solutions`);
  return hits[0];
}
/** Rang de grandeur : a arrondi à l'unité (demi supérieur) ; a' = 10 s'écrit 1 × 10^(n+1). */
function order(x) {
  const { a, n } = sci(x); const r = (2n * a.n + a.d) / (2n * a.d);
  return r === 10n ? { a: 1n, n: n + 1 } : { a: r, n };
}
const EXP = (base, s) => {
  const target = evaluate(s); const b = evaluate(String(base)); const hits = [];
  for (let n = -60; n <= 60; n++) if (b.pow(new Q(BigInt(n))).eq(target)) hits.push(n);
  if (hits.length !== 1) throw new Error(`${s} : ${hits.length} exposants pour la base ${base}`);
  return hits[0];
};
const parseQ = (str) => { let t = String(str); const neg = t.startsWith('-'); t = t.replace('-', ''); const q = t.includes('/') ? new Q(...t.split('/').map(BigInt)) : num(t); return neg ? q.neg() : q; };
const letter = (k) => C('ABCDEF'[k]);

/* ── lecture du banc ──────────────────────────────────────────────────────── */
const here = dirname(fileURLToPath(import.meta.url));
const BANK = join(here, '..', '..', 'content/practice/3am/wadiya-idmajiya-quwa-nisbiya');
const sheets = {};
for (const lvl of readdirSync(BANK).filter((d) => d.startsWith('level-'))) {
  for (const f of readdirSync(join(BANK, lvl)).filter((x) => x.endsWith('.json'))) {
    const ex = JSON.parse(readFileSync(join(BANK, lvl, f), 'utf8')); sheets[ex.id] = ex;
  }
}
const plain = (s) => String(s).replace(/\{,\}/g, '.').replace(/\\[,; ]/g, '').replace(/[$\\{}\s]/g, '');
const sheetText = (ex) => plain([ex.statement.content, ...(ex.statement.formulas ?? []), ...ex.questions.flatMap((q) => [q.statement, ...(q.choices ?? []).map((c) => c.content)])].join(' '));
const find = (key) => { const [id, qid] = key.split(':'); const ex = sheets[id]; return { ex, q: ex.questions.find((x) => x.id === qid) }; };
/** Tous les littéraux de 2 chiffres ou plus (ou décimaux) d'une expression doivent figurer dans la feuille : la spec est RETAPÉE de l'énoncé. */
const literalsOf = (e) => (e.match(/\d+(\.\d+)?/g) ?? []).filter((l) => l.length >= 2 || l.includes('.'));
const parsePair = (c) => { const m = [...String(c).matchAll(/10\^\{(-?\d+)\}/g)].map((x) => Number(x[1])); return m.length === 2 ? m : null; };

/* ── ce que dit chaque spec ──────────────────────────────────────────────── */
function answerOf(key, sp) {
  const { q } = find(key);
  switch (sp.k) {
    case 'val': return R(V(sp.e).toString());
    case 'exp': return R(EXP(sp.b, sp.e));
    case 'sciA': return R(sci(V(sp.e)).a.toString());
    case 'sciN': return R(sci(V(sp.e)).n);
    case 'ordA': return R(order(V(sp.e)).a);
    case 'ordN': return R(order(V(sp.e)).n);
    case 'first': { let k = 0; while (V(`${sp.start}*10^${sp.p * k}`).cmp(T10(sp.T)) < 0) k++; return R(k); }
    case 'brk': {
      const v = V(sp.e); const hits = q.choices.map((c, i) => { const p = parsePair(c.content); return p && T10(p[0]).cmp(v) <= 0 && v.cmp(T10(p[1])) < 0 ? i : -1; }).filter((i) => i >= 0);
      if (hits.length !== 1) throw new Error(`QCM ${key} : ${hits.length} encadrements justes`); return letter(hits[0]);
    }
    case 'cmp': {
      const c = V(sp.a).cmp(V(sp.b)); const word = c > 0 ? 'أكبر' : c < 0 ? 'أصغر' : 'متساويان';
      const hits = q.choices.map((o, i) => (o.content.includes(word) ? i : -1)).filter((i) => i >= 0);
      if (hits.length !== 1) throw new Error(`QCM ${key} : ${hits.length} options justes`); return letter(hits[0]);
    }
    case 'sign': {
      const s = V(sp.e).cmp(new Q(0n)); const word = s > 0 ? 'موجب' : s < 0 ? 'سالب' : 'معدوم';
      const hits = q.choices.map((o, i) => (o.content === word ? i : -1)).filter((i) => i >= 0);
      if (hits.length !== 1) throw new Error(`QCM ${key} : ${hits.length} options justes`); return letter(hits[0]);
    }
    default: throw new Error(`spec inconnue ${sp.k}`);
  }
}
export const ORACLE = Object.fromEntries(Object.entries(SPEC).map(([key, sp]) => [key, answerOf(key, sp)]));

/* ── l'audit : littéraux, signatures, distracteurs ─────────────────────── */
export function audit(bank) {
  const problems = [];
  for (const { key, q } of bank) {
    const sp = SPEC[key]; if (!sp) { if (q.answerType !== 'selfCheck') problems.push(`${key} : pas de spec`); continue; }
    try {
      const { ex } = find(key); const hay = sheetText(ex);
      for (const e of [sp.e, sp.a, sp.b, sp.start].filter(Boolean)) for (const l of literalsOf(String(e))) if (!hay.includes(plain(l))) problems.push(`${key} : le littéral ${l} de « ${e} » ne figure pas dans la feuille`);
      if (q.answerType === 'rational') {
        const keyV = parseQ(q.expectedAnswer);
        for (const s of q.misconceptionSignatures ?? []) {
          const sv = parseQ(s.value);
          if (sv.eq(keyV)) problems.push(`${key} : la signature ${s.id} vaut la clé`);
          if (s.id === 'MISC-WQ-SIGN' && !sv.eq(keyV.neg())) problems.push(`${key} : MISC-WQ-SIGN doit valoir l'opposé de la clé`);
          if (s.id === 'MISC-WQ-PRIORITY' && !sv.eq(flat(sp.e))) problems.push(`${key} : MISC-WQ-PRIORITY doit valoir le calcul de gauche à droite (${flat(sp.e)})`);
          if (s.id === 'MISC-WQ-FIRST' && !sv.eq(keyV.sub(ONE))) problems.push(`${key} : MISC-WQ-FIRST doit valoir la clé − 1`);
          if (s.id === 'MISC-WQ-ROUND') { const { a } = sci(V(sp.e)); const fl = new Q(a.n / a.d); if (!sv.eq(fl) && !sv.eq(fl.add(ONE))) problems.push(`${key} : MISC-WQ-ROUND doit être la partie entière ou la suivante`); }
          if (s.id === 'MISC-WQ-MULEXP' && sp.k === 'exp') { const m = /^10\^(-?\d+)\*10\^(-?\d+)$/.exec(sp.e); if (m && !sv.eq(new Q(BigInt(m[1]) * BigInt(m[2])))) problems.push(`${key} : MISC-WQ-MULEXP doit valoir le produit des exposants`); }
          if (s.id === 'MISC-WQ-POWSUM') { const m = /^\(10\^(-?\d+)\)\^(-?\d+)$/.exec(sp.e); if (m && !sv.eq(new Q(BigInt(m[1]) + BigInt(m[2])))) problems.push(`${key} : MISC-WQ-POWSUM doit valoir la somme des exposants`); }
          if (s.id === 'MISC-WQ-DIGITS' && sp.k === 'sciN') { const digits = String(V(sp.e).n).length; if (!sv.eq(new Q(BigInt(digits)))) problems.push(`${key} : MISC-WQ-DIGITS doit valoir le nombre de chiffres`); }
        }
      } else if (q.answerType === 'choice') {
        const right = q.choices.filter((c) => c.isCorrect);
        if (right.length !== 1) problems.push(`${key} : ${right.length} options marquées justes`);
        if (right[0] && ORACLE[key].choiceId !== right[0].id) problems.push(`${key} : l'oracle choisit ${ORACLE[key].choiceId}, la feuille marque ${right[0].id}`);
        for (const c of q.choices) if (!c.isCorrect && !c.misconceptionId) problems.push(`${key} : l'option ${c.id} fausse n'est pas étiquetée`);
      }
    } catch (err) { problems.push(`${key} : ${err.message}`); }
  }
  return problems;
}
