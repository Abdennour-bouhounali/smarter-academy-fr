// Oracle du banc « kitaba-ilmiya-rutba » (الكتابة العلمية ورتبة القدر, 3AM unité 3, 2026-10-26) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل الأول / الثاني »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, avec une arithmétique de RATIONNELS exacts en BigInt écrite dans
// ce fichier (indépendante de packages/core/arithmetic/tenPowers.js et de tout autre oracle) :
//  - DATA.oracle[clé] décrit la question dans une écriture ASCII retapée (« 0.0036*10^-2 », « (10^-4)^-3 », « 12*10^-3*0.5*10^7/8 ») avec
//    un parseur PROPRE (produits, quotients, sommes, puissances à exposant relatif entier, parenthèses, décimaux) ;
//  - sciA / sciN : l'écriture scientifique a × 10^n (1 ≤ a < 10) de la VALEUR de l'expression (n = l'unique entier tel que
//    10^n ≤ v < 10^(n+1), balayé de -60 à 60 ; a = v / 10^n) ; hasr : le même n, vu comme le barreau 10^n ≤ v < 10^(n+1) ;
//  - ordA / ordN : a' = a arrondi à l'unité, DEMI VERS LE HAUT, et le cas a' = 10 écrit 1 × 10^(n+1) (« report ») ;
//  - val : valeur décimale exacte ; coef : k tel que k × 10^p = valeur (p fixé par l'énoncé) ; solve : l'unique n tel que c × 10^n = valeur ;
//  - un QCM est jugé option par option : chaque option a une affirmation [type, …] — sci (a × 10^n = v ET 1 ≤ a < 10), br (v est sur le
//    barreau n), ord (a' × 10^n est la rang d'ordre de grandeur de v, a' ∈ 1…9), eq (deux écritures égales), cmp (chaîne < > =) —
//    il faut EXACTEMENT une option vraie, et c'est celle que le contenu marque ;
//  - audit(bank) relit le texte : les nombres de l'énoncé et des options figurent dans la description retapée (aucune dérive de
//    saisie), les clés sont exactes, chaque signature est ≠ clé et porte un MISC-ILMIYA-* (RAQAM = nombre de chiffres de la partie
//    entière, BATR = troncature, QUWA = exposant suivant, recalculés), chaque distracteur de QCM est FAUX et porte un MISC-ILMIYA-*.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C } from './helpers.mjs';

const DATA = {
 "oracle": {
  "ex-3am-kitaba-ilmiya-rutba-l1-001:q1": {
   "k": "sciA",
   "v": "73000000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-001:q2": {
   "k": "sciN",
   "v": "73000000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-001:q3": {
   "k": "pick",
   "claims": [
    [
     "ord",
     "73000000",
     "7",
     7
    ],
    [
     "ord",
     "73000000",
     "7",
     8
    ],
    [
     "ord",
     "73000000",
     "1",
     8
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-001:q4": {
   "k": "sciA",
   "v": "0.00209"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-001:q5": {
   "k": "sciN",
   "v": "0.00209"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-001:q6": {
   "k": "hasr",
   "v": "0.00209"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-002:q1": {
   "k": "sciA",
   "v": "0.0078*10^-3"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-002:q2": {
   "k": "sciN",
   "v": "0.0078*10^-3"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-002:q3": {
   "k": "pick",
   "claims": [
    [
     "ord",
     "0.0078*10^-3",
     "8",
     -6
    ],
    [
     "ord",
     "0.0078*10^-3",
     "7",
     -6
    ],
    [
     "ord",
     "0.0078*10^-3",
     "1",
     -5
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-002:q4": {
   "k": "sciA",
   "v": "38*10^6"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-002:q5": {
   "k": "sciN",
   "v": "38*10^6"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-002:q6": {
   "k": "hasr",
   "v": "38*10^6"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-003:q1": {
   "k": "sciA",
   "v": "5400000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-003:q2": {
   "k": "sciN",
   "v": "5400000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-003:q3": {
   "k": "sciN",
   "v": "612000000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-003:q4": {
   "k": "sciA",
   "v": "0.00047"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-003:q5": {
   "k": "sciN",
   "v": "0.00047"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-004:q1": {
   "k": "pick",
   "claims": [
    [
     "sci",
     "3200000",
     "3.2",
     6
    ],
    [
     "sci",
     "3200000",
     "32",
     5
    ],
    [
     "sci",
     "3200000",
     "3.2",
     7
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-004:q2": {
   "k": "pick",
   "claims": [
    [
     "sci",
     "0.000085",
     "8.5",
     -5
    ],
    [
     "sci",
     "0.000085",
     "8.5",
     -4
    ],
    [
     "sci",
     "0.000085",
     "85",
     -6
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-004:q3": {
   "k": "pick",
   "claims": [
    [
     "sci",
     "7090000000",
     "7.09",
     9
    ],
    [
     "sci",
     "7090000000",
     "7.09",
     10
    ],
    [
     "sci",
     "7090000000",
     "70.9",
     8
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-004:q4": {
   "k": "pick",
   "claims": [
    [
     "sci",
     "0.5",
     "5",
     -1
    ],
    [
     "sci",
     "0.5",
     "0.5",
     0
    ],
    [
     "sci",
     "0.5",
     "5",
     0
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-005:q1": {
   "k": "sciA",
   "v": "0.00031"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-005:q2": {
   "k": "sciN",
   "v": "0.00031"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-005:q3": {
   "k": "sciN",
   "v": "0.0000072"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-005:q4": {
   "k": "sciA",
   "v": "0.092"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-005:q5": {
   "k": "sciN",
   "v": "0.092"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-006:q1": {
   "k": "sciA",
   "v": "0.0000075"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-006:q2": {
   "k": "sciN",
   "v": "0.0000075"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-006:q3": {
   "k": "sciA",
   "v": "0.00007"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-006:q4": {
   "k": "sciN",
   "v": "0.00007"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-007:q1": {
   "k": "sciN",
   "v": "1250000000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-007:q2": {
   "k": "sciA",
   "v": "14.6"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-007:q3": {
   "k": "sciN",
   "v": "14.6"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-007:q4": {
   "k": "sciN",
   "v": "0.5"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-007:q5": {
   "k": "sciN",
   "v": "9"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-008:q1": {
   "k": "sciA",
   "v": "408000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-008:q2": {
   "k": "sciN",
   "v": "408000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-008:q3": {
   "k": "sciA",
   "v": "0.057"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-008:q4": {
   "k": "sciN",
   "v": "0.057"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-008:q5": {
   "k": "sciA",
   "v": "861429"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-008:q6": {
   "k": "sciN",
   "v": "861429"
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-009:q1": {
   "k": "pick",
   "claims": [
    [
     "sci",
     "3700000",
     "3.7",
     6
    ],
    [
     "sci",
     "3700000",
     "37",
     5
    ],
    [
     "sci",
     "3700000",
     "3.7",
     7
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-009:q2": {
   "k": "pick",
   "claims": [
    [
     "sci",
     "0.0049",
     "4.9",
     -3
    ],
    [
     "sci",
     "0.0049",
     "4.9",
     -2
    ],
    [
     "sci",
     "0.0049",
     "49",
     -4
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-009:q3": {
   "k": "pick",
   "claims": [
    [
     "sci",
     "18000",
     "1.8",
     4
    ],
    [
     "sci",
     "18000",
     "1.8",
     5
    ],
    [
     "sci",
     "18000",
     "18",
     3
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-009:q4": {
   "k": "pick",
   "claims": [
    [
     "sci",
     "0.62",
     "6.2",
     -1
    ],
    [
     "sci",
     "0.62",
     "6.2",
     -2
    ],
    [
     "sci",
     "0.62",
     "62",
     -2
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-010:q1": {
   "k": "pick",
   "claims": [
    [
     "eq",
     "4.2*10^-6",
     "0.0000042"
    ],
    [
     "eq",
     "4.2*10^-6",
     "0.000042"
    ],
    [
     "eq",
     "4.2*10^-6",
     "0.00000042"
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-010:q2": {
   "k": "pick",
   "claims": [
    [
     "eq",
     "6.35*10^5",
     "635000"
    ],
    [
     "eq",
     "6.35*10^5",
     "6350000"
    ],
    [
     "eq",
     "6.35*10^5",
     "63500"
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-010:q3": {
   "k": "pick",
   "claims": [
    [
     "eq",
     "9.1*10^-3",
     "0.0091"
    ],
    [
     "eq",
     "9.1*10^-3",
     "0.091"
    ],
    [
     "eq",
     "9.1*10^-3",
     "0.00091"
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l1-010:q4": {
   "k": "pick",
   "claims": [
    [
     "eq",
     "2.8*10^7",
     "28000000"
    ],
    [
     "eq",
     "2.8*10^7",
     "2800000"
    ],
    [
     "eq",
     "2.8*10^7",
     "280000000"
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-001:q1": {
   "k": "sciA",
   "v": "386*10^-7"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-001:q2": {
   "k": "sciN",
   "v": "386*10^-7"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-001:q3": {
   "k": "pick",
   "claims": [
    [
     "ord",
     "386*10^-7",
     "4",
     -5
    ],
    [
     "ord",
     "386*10^-7",
     "3",
     -5
    ],
    [
     "ord",
     "386*10^-7",
     "1",
     -4
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-001:q4": {
   "k": "sciA",
   "v": "0.0042*10^6"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-001:q5": {
   "k": "sciN",
   "v": "0.0042*10^6"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-001:q6": {
   "k": "hasr",
   "v": "0.0042*10^6"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-002:q1": {
   "k": "coef",
   "v": "(24*10^8*15)/(30*10^-4)",
   "p": 12
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-002:q2": {
   "k": "sciA",
   "v": "(24*10^8*15)/(30*10^-4)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-002:q3": {
   "k": "sciN",
   "v": "(24*10^8*15)/(30*10^-4)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-002:q4": {
   "k": "sciA",
   "v": "3150*10^-18"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-002:q5": {
   "k": "sciN",
   "v": "3150*10^-18"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-002:q6": {
   "k": "hasr",
   "v": "(24*10^8*15)/(30*10^-4)*3150*10^-18"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-002:q7": {
   "k": "ordA",
   "v": "(3150*10^-18)/((24*10^8*15)/(30*10^-4))"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-002:q8": {
   "k": "ordN",
   "v": "(3150*10^-18)/((24*10^8*15)/(30*10^-4))"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-003:q1": {
   "k": "pick",
   "claims": [
    [
     "sci",
     "6.4*10^6",
     "0.64",
     7
    ],
    [
     "sci",
     "6.4*10^6",
     "6.4",
     6
    ],
    [
     "sci",
     "6.4*10^6",
     "64",
     5
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-003:q2": {
   "k": "pick",
   "claims": [
    [
     "sci",
     "1.2*10^-2",
     "12",
     -3
    ],
    [
     "sci",
     "1.2*10^-2",
     "1.2",
     -2
    ],
    [
     "sci",
     "1.2*10^-2",
     "0.12",
     -1
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-003:q3": {
   "k": "pick",
   "claims": [
    [
     "sci",
     "9500",
     "9.5",
     3
    ],
    [
     "sci",
     "9500",
     "95",
     2
    ],
    [
     "sci",
     "9500",
     "0.95",
     4
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-003:q4": {
   "k": "pick",
   "claims": [
    [
     "sci",
     "0.00048",
     "48",
     -5
    ],
    [
     "sci",
     "0.00048",
     "0.48",
     -3
    ],
    [
     "sci",
     "0.00048",
     "4.8",
     -4
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-004:q1": {
   "k": "sciA",
   "v": "48.7*10^3"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-004:q2": {
   "k": "sciN",
   "v": "48.7*10^3"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-004:q3": {
   "k": "sciN",
   "v": "0.063*10^-2"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-004:q4": {
   "k": "sciA",
   "v": "520*10^-6"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-004:q5": {
   "k": "sciN",
   "v": "520*10^-6"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-005:q1": {
   "k": "solve",
   "v": "5280",
   "c": "5.28"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-005:q2": {
   "k": "solve",
   "v": "0.0731",
   "c": "7.31"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-005:q3": {
   "k": "solve",
   "v": "36.4*10^5",
   "c": "3.64"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-005:q4": {
   "k": "solve",
   "v": "0.0092*10^7",
   "c": "9.2"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-006:q1": {
   "k": "pick",
   "claims": [
    [
     "sci",
     "235*10^-4",
     "2.35",
     -2
    ],
    [
     "sci",
     "235*10^-4",
     "2.35",
     -6
    ],
    [
     "sci",
     "235*10^-4",
     "23.5",
     -3
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-006:q2": {
   "k": "pick",
   "claims": [
    [
     "sci",
     "0.45*10^8",
     "4.5",
     7
    ],
    [
     "sci",
     "0.45*10^8",
     "4.5",
     9
    ],
    [
     "sci",
     "0.45*10^8",
     "45",
     6
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-006:q3": {
   "k": "pick",
   "claims": [
    [
     "sci",
     "640*10^-9",
     "6.4",
     -7
    ],
    [
     "sci",
     "640*10^-9",
     "6.4",
     -11
    ],
    [
     "sci",
     "640*10^-9",
     "64",
     -8
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-006:q4": {
   "k": "pick",
   "claims": [
    [
     "sci",
     "0.0071*10^-3",
     "7.1",
     -3
    ],
    [
     "sci",
     "0.0071*10^-3",
     "7.1",
     0
    ],
    [
     "sci",
     "0.0071*10^-3",
     "7.1",
     -6
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-007:q1": {
   "k": "solve",
   "v": "2.5*10^7",
   "c": "25"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-007:q2": {
   "k": "solve",
   "v": "6.4*10^-3",
   "c": "640"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-007:q3": {
   "k": "solve",
   "v": "4*10^5",
   "c": "0.04"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-007:q4": {
   "k": "solve",
   "v": "8.1*10^-2",
   "c": "0.081"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-008:q1": {
   "k": "coef",
   "v": "7215",
   "p": 3
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-008:q2": {
   "k": "coef",
   "v": "0.2584",
   "p": -2
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-008:q3": {
   "k": "solve",
   "v": "4631.5",
   "c": "46.315"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-008:q4": {
   "k": "solve",
   "v": "0.54",
   "c": "0.00054"
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-009:q1": {
   "k": "pick",
   "claims": [
    [
     "sci",
     "18*10^5",
     "18",
     5
    ],
    [
     "sci",
     "2.04*10^-3",
     "2.04",
     -3
    ],
    [
     "sci",
     "0.9*10^2",
     "0.9",
     2
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-009:q2": {
   "k": "pick",
   "claims": [
    [
     "sci",
     "0.31*10^-4",
     "0.31",
     -4
    ],
    [
     "sci",
     "62*10^8",
     "62",
     8
    ],
    [
     "sci",
     "5.9*10^6",
     "5.9",
     6
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-009:q3": {
   "k": "pick",
   "claims": [
    [
     "sci",
     "10*10^4",
     "10",
     4
    ],
    [
     "sci",
     "9.99*10^3",
     "9.99",
     3
    ],
    [
     "sci",
     "0.1*10^7",
     "0.1",
     7
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-009:q4": {
   "k": "pick",
   "claims": [
    [
     "sci",
     "40.5",
     "40.5",
     0
    ],
    [
     "sci",
     "40.5",
     "0.405",
     2
    ],
    [
     "sci",
     "40.5",
     "4.05",
     1
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-010:q1": {
   "k": "pick",
   "claims": [
    [
     "sci",
     "618.4*10^5",
     "6.184",
     5
    ],
    [
     "sci",
     "618.4*10^5",
     "6.184",
     7
    ],
    [
     "sci",
     "618.4*10^5",
     "6.184",
     8
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-010:q2": {
   "k": "pick",
   "claims": [
    [
     "sci",
     "0.0275*10^4",
     "2.75",
     4
    ],
    [
     "sci",
     "0.0275*10^4",
     "2.75",
     6
    ],
    [
     "sci",
     "0.0275*10^4",
     "2.75",
     2
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l2-010:q3": {
   "k": "pick",
   "claims": [
    [
     "sci",
     "957*10^-8",
     "9.57",
     -8
    ],
    [
     "sci",
     "957*10^-8",
     "9.57",
     -6
    ],
    [
     "sci",
     "957*10^-8",
     "9.57",
     -10
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-001:q1": {
   "k": "sciA",
   "v": "3*10^-11*0.05"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-001:q2": {
   "k": "sciN",
   "v": "3*10^-11*0.05"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-001:q3": {
   "k": "hasr",
   "v": "3*10^-11*0.05"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-001:q4": {
   "k": "sciA",
   "v": "380/(4*10^-9)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-001:q5": {
   "k": "sciN",
   "v": "380/(4*10^-9)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-001:q6": {
   "k": "pick",
   "claims": [
    [
     "ord",
     "380/(4*10^-9)",
     "1",
     11
    ],
    [
     "ord",
     "380/(4*10^-9)",
     "9",
     10
    ],
    [
     "ord",
     "380/(4*10^-9)",
     "10",
     10
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-002:q1": {
   "k": "coef",
   "v": "(12*10^-3*0.5*10^7)/8",
   "p": 4
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-002:q2": {
   "k": "sciA",
   "v": "(12*10^-3*0.5*10^7)/8"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-002:q3": {
   "k": "sciN",
   "v": "(12*10^-3*0.5*10^7)/8"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-002:q4": {
   "k": "hasr",
   "v": "(12*10^-3*0.5*10^7)/8"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-002:q5": {
   "k": "ordA",
   "v": "(12*10^-3*0.5*10^7)/8"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-002:q6": {
   "k": "ordN",
   "v": "(12*10^-3*0.5*10^7)/8"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-003:q1": {
   "k": "hasr",
   "v": "0.000748"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-003:q2": {
   "k": "hasr",
   "v": "2560*10^5"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-003:q3": {
   "k": "sciA",
   "v": "0.000748/(2560*10^5)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-003:q4": {
   "k": "sciN",
   "v": "0.000748/(2560*10^5)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-003:q5": {
   "k": "ordA",
   "v": "0.000748/(2560*10^5)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-003:q6": {
   "k": "ordN",
   "v": "0.000748/(2560*10^5)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-004:q1": {
   "k": "pick",
   "claims": [
    [
     "br",
     "0.0042",
     -3
    ],
    [
     "br",
     "0.042",
     -3
    ],
    [
     "br",
     "4.2*10^-4",
     -3
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-004:q2": {
   "k": "pick",
   "claims": [
    [
     "br",
     "5.3*10^6",
     6
    ],
    [
     "br",
     "5.3*10^6",
     5
    ],
    [
     "br",
     "5.3*10^6",
     7
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-004:q3": {
   "k": "pick",
   "claims": [
    [
     "br",
     "0.00071",
     -5
    ],
    [
     "br",
     "0.00071",
     -3
    ],
    [
     "br",
     "0.00071",
     -4
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-004:q4": {
   "k": "pick",
   "claims": [
    [
     "br",
     "42*10^5",
     5
    ],
    [
     "br",
     "4.2*10^5",
     5
    ],
    [
     "br",
     "0.42*10^5",
     5
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-005:q1": {
   "k": "hasr",
   "v": "8600000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-005:q2": {
   "k": "hasr",
   "v": "0.000093"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-005:q3": {
   "k": "hasr",
   "v": "12*10^4"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-005:q4": {
   "k": "hasr",
   "v": "0.0006*10^8"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-006:q1": {
   "k": "ordA",
   "v": "4710000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-006:q2": {
   "k": "ordN",
   "v": "4710000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-006:q3": {
   "k": "ordA",
   "v": "0.0000362"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-006:q4": {
   "k": "ordA",
   "v": "7340000000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-006:q5": {
   "k": "ordA",
   "v": "0.00096"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-006:q6": {
   "k": "ordN",
   "v": "0.00096"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-007:q1": {
   "k": "pick",
   "claims": [
    [
     "ord",
     "265",
     "3",
     2
    ],
    [
     "ord",
     "265",
     "2",
     2
    ],
    [
     "ord",
     "265",
     "1",
     3
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-007:q2": {
   "k": "pick",
   "claims": [
    [
     "ord",
     "0.0000786",
     "7",
     -5
    ],
    [
     "ord",
     "0.0000786",
     "8",
     -5
    ],
    [
     "ord",
     "0.0000786",
     "1",
     -4
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-007:q3": {
   "k": "pick",
   "claims": [
    [
     "ord",
     "5.5*10^7",
     "5",
     7
    ],
    [
     "ord",
     "5.5*10^7",
     "6",
     7
    ],
    [
     "ord",
     "5.5*10^7",
     "1",
     8
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-007:q4": {
   "k": "pick",
   "claims": [
    [
     "ord",
     "94000",
     "1",
     5
    ],
    [
     "ord",
     "94000",
     "9",
     4
    ],
    [
     "ord",
     "94000",
     "9",
     5
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-008:q1": {
   "k": "sciA",
   "v": "0.35*10^9"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-008:q2": {
   "k": "sciN",
   "v": "0.35*10^9"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-008:q3": {
   "k": "ordA",
   "v": "0.35*10^9"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-008:q4": {
   "k": "hasr",
   "v": "72000000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-008:q5": {
   "k": "ordA",
   "v": "72000000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-008:q6": {
   "k": "sciN",
   "v": "1260*10^5"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-009:q1": {
   "k": "sciA",
   "v": "374000000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-009:q2": {
   "k": "sciN",
   "v": "374000000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-009:q3": {
   "k": "hasr",
   "v": "374000000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-009:q4": {
   "k": "ordA",
   "v": "374000000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-009:q5": {
   "k": "sciA",
   "v": "0.00061"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-009:q6": {
   "k": "sciN",
   "v": "0.00061"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-009:q7": {
   "k": "hasr",
   "v": "0.00061"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-009:q8": {
   "k": "ordN",
   "v": "0.00061"
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-010:q1": {
   "k": "pick",
   "claims": [
    [
     "ord",
     "0.0378*10^9",
     "4",
     9
    ],
    [
     "ord",
     "0.0378*10^9",
     "4",
     7
    ],
    [
     "ord",
     "0.0378*10^9",
     "3",
     7
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-010:q2": {
   "k": "pick",
   "claims": [
    [
     "ord",
     "0.0617*10^6",
     "6",
     6
    ],
    [
     "ord",
     "0.0617*10^6",
     "1",
     5
    ],
    [
     "ord",
     "0.0617*10^6",
     "6",
     4
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-010:q3": {
   "k": "pick",
   "claims": [
    [
     "ord",
     "835*10^-8",
     "8",
     -8
    ],
    [
     "ord",
     "835*10^-8",
     "8",
     -6
    ],
    [
     "ord",
     "835*10^-8",
     "1",
     -5
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l3-010:q4": {
   "k": "pick",
   "claims": [
    [
     "br",
     "0.0062",
     -4
    ],
    [
     "br",
     "745*10^-6",
     -4
    ],
    [
     "br",
     "0.31*10^-2",
     -4
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-001:q1": {
   "k": "ordA",
   "v": "0.00072*(10^-4)^-3"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-001:q2": {
   "k": "ordN",
   "v": "0.00072*(10^-4)^-3"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-001:q3": {
   "k": "ordA",
   "v": "(150000*0.000004)/(3*10^-5)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-001:q4": {
   "k": "ordN",
   "v": "(150000*0.000004)/(3*10^-5)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-001:q5": {
   "k": "ordA",
   "v": "0.00072*(10^-4)^-3*((150000*0.000004)/(3*10^-5))"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-001:q6": {
   "k": "ordN",
   "v": "0.00072*(10^-4)^-3*((150000*0.000004)/(3*10^-5))"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-001:q7": {
   "k": "hasr",
   "v": "(0.00072*(10^-4)^-3)/((150000*0.000004)/(3*10^-5))"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-002:q1": {
   "k": "hasr",
   "v": "0.0042*10^7"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-002:q2": {
   "k": "val",
   "v": "6^2"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-002:q3": {
   "k": "sciA",
   "v": "(6^2*10^3*5*10^2)/(15*(10^-2)^2)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-002:q4": {
   "k": "sciN",
   "v": "(6^2*10^3*5*10^2)/(15*(10^-2)^2)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-002:q5": {
   "k": "ordA",
   "v": "(6^2*10^3*5*10^2)/(15*(10^-2)^2)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-002:q6": {
   "k": "ordN",
   "v": "(6^2*10^3*5*10^2)/(15*(10^-2)^2)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-003:q1": {
   "k": "sciA",
   "v": "3.2*10^-4*59*10^6/(2*10^2*10^-3)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-003:q2": {
   "k": "sciN",
   "v": "3.2*10^-4*59*10^6/(2*10^2*10^-3)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-003:q3": {
   "k": "hasr",
   "v": "3.2*10^-4*59*10^6/(2*10^2*10^-3)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-003:q4": {
   "k": "sciN",
   "v": "0.0000096*10^-2"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-003:q5": {
   "k": "ordA",
   "v": "0.0000096*10^-2"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-003:q6": {
   "k": "ordN",
   "v": "0.0000096*10^-2"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-004:q1": {
   "k": "hasr",
   "v": "52000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-004:q2": {
   "k": "hasr",
   "v": "0.0073"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-004:q3": {
   "k": "sciA",
   "v": "52000*0.0073"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-004:q4": {
   "k": "sciN",
   "v": "52000*0.0073"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-004:q5": {
   "k": "ordA",
   "v": "52000*0.0073"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-004:q6": {
   "k": "ordA",
   "v": "0.0073/52000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-004:q7": {
   "k": "ordN",
   "v": "0.0073/52000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-005:q1": {
   "k": "sciA",
   "v": "2500*6000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-005:q2": {
   "k": "sciN",
   "v": "2500*6000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-005:q3": {
   "k": "sciA",
   "v": "0.0004*0.002"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-005:q4": {
   "k": "sciN",
   "v": "0.0004*0.002"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-005:q5": {
   "k": "sciA",
   "v": "48000000/0.0006"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-005:q6": {
   "k": "sciN",
   "v": "48000000/0.0006"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-006:q1": {
   "k": "pick",
   "claims": [
    [
     "cmp",
     "8.4*10^-6<1.1*10^-5"
    ],
    [
     "cmp",
     "1.1*10^-5<8.4*10^-6"
    ],
    [
     "cmp",
     "8.4*10^-6=1.1*10^-5"
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-006:q2": {
   "k": "pick",
   "claims": [
    [
     "cmp",
     "3.5*10^7<9.2*10^6"
    ],
    [
     "cmp",
     "9.2*10^6<3.5*10^7"
    ],
    [
     "cmp",
     "3.5*10^7=9.2*10^6"
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-006:q3": {
   "k": "pick",
   "claims": [
    [
     "cmp",
     "2.3*10^-3<7*10^-4"
    ],
    [
     "cmp",
     "7*10^-4<2.3*10^-3"
    ],
    [
     "cmp",
     "7*10^-4=2.3*10^-3"
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-006:q4": {
   "k": "pick",
   "claims": [
    [
     "cmp",
     "4.6*10^-4<8.9*10^-5"
    ],
    [
     "cmp",
     "3.4*10^6<9.7*10^5"
    ],
    [
     "cmp",
     "7.5*10^-4<2.2*10^-3"
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-007:q1": {
   "k": "pick",
   "claims": [
    [
     "cmp",
     "85*10^-6<7.3*10^-4<0.04*10^-1"
    ],
    [
     "cmp",
     "7.3*10^-4<85*10^-6<0.04*10^-1"
    ],
    [
     "cmp",
     "0.04*10^-1<7.3*10^-4<85*10^-6"
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-007:q2": {
   "k": "pick",
   "claims": [
    [
     "cmp",
     "6.2*10^5<41*10^4<0.9*10^6"
    ],
    [
     "cmp",
     "41*10^4<6.2*10^5<0.9*10^6"
    ],
    [
     "cmp",
     "0.9*10^6<6.2*10^5<41*10^4"
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-008:q1": {
   "k": "sciA",
   "v": "62.5*10^9+37*10^10"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-008:q2": {
   "k": "sciN",
   "v": "62.5*10^9+37*10^10"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-008:q3": {
   "k": "sciA",
   "v": "(0.8*(10^2)^3*5*10^-4)/(2*10^5)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-008:q4": {
   "k": "sciN",
   "v": "(0.8*(10^2)^3*5*10^-4)/(2*10^5)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-009:q1": {
   "k": "sciN",
   "v": "3600*5000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-009:q2": {
   "k": "sciA",
   "v": "0.00012*0.004"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-009:q3": {
   "k": "sciN",
   "v": "0.00012*0.004"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-009:q4": {
   "k": "sciN",
   "v": "8000*0.0025"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-009:q5": {
   "k": "sciA",
   "v": "54000000/0.00018"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-009:q6": {
   "k": "sciN",
   "v": "54000000/0.00018"
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-010:q1": {
   "k": "pick",
   "claims": [
    [
     "cmp",
     "7805<0.1002*10^5<115306*10^-1<62.4*10^3"
    ],
    [
     "cmp",
     "0.1002*10^5<7805<115306*10^-1<62.4*10^3"
    ],
    [
     "cmp",
     "7805<115306*10^-1<0.1002*10^5<62.4*10^3"
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l4-010:q2": {
   "k": "pick",
   "claims": [
    [
     "cmp",
     "0.083*10^6<76000<9.4*10^4<1250*10^2"
    ],
    [
     "cmp",
     "76000<0.083*10^6<9.4*10^4<1250*10^2"
    ],
    [
     "cmp",
     "1250*10^2<9.4*10^4<0.083*10^6<76000"
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-001:q1": {
   "k": "sciA",
   "v": "(4.5*10^-4*0.6*10^3)/(3*10^5)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-001:q2": {
   "k": "sciN",
   "v": "(4.5*10^-4*0.6*10^3)/(3*10^5)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-001:q3": {
   "k": "hasr",
   "v": "(4.5*10^-4*0.6*10^3)/(3*10^5)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-001:q4": {
   "k": "sciA",
   "v": "1.6*10^6*35*10^-4"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-001:q5": {
   "k": "sciN",
   "v": "1.6*10^6*35*10^-4"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-001:q6": {
   "k": "ordA",
   "v": "1.6*10^6*35*10^-4"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-001:q7": {
   "k": "ordN",
   "v": "1.6*10^6*35*10^-4"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-002:q1": {
   "k": "val",
   "v": "12*9/2"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-002:q2": {
   "k": "sciA",
   "v": "12*9/2"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-002:q3": {
   "k": "sciN",
   "v": "12*9/2"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-002:q4": {
   "k": "val",
   "v": "15/2"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-002:q5": {
   "k": "val",
   "v": "15/2*12500"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-002:q6": {
   "k": "sciA",
   "v": "15/2*12500"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-002:q7": {
   "k": "sciN",
   "v": "15/2*12500"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-002:q8": {
   "k": "ordA",
   "v": "15/2*12500"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-002:q9": {
   "k": "ordN",
   "v": "15/2*12500"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-003:q1": {
   "k": "val",
   "v": "70*60*24*365"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-003:q2": {
   "k": "sciA",
   "v": "70*60*24*365"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-003:q3": {
   "k": "sciN",
   "v": "70*60*24*365"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-003:q4": {
   "k": "ordA",
   "v": "70*60*24*365"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-003:q5": {
   "k": "ordN",
   "v": "70*60*24*365"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-004:q1": {
   "k": "val",
   "v": "1200*1000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-004:q2": {
   "k": "sciA",
   "v": "1200*1000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-004:q3": {
   "k": "sciN",
   "v": "1200*1000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-004:q4": {
   "k": "hasr",
   "v": "1200*1000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-004:q5": {
   "k": "ordA",
   "v": "1200*1000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-004:q6": {
   "k": "ordN",
   "v": "1200*1000"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-005:q1": {
   "k": "sciN",
   "v": "0.000008"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-005:q2": {
   "k": "sciN",
   "v": "0.00007"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-005:q3": {
   "k": "pick",
   "claims": [
    [
     "cmp",
     "2.5*10^-6<8*10^-6<7*10^-5"
    ],
    [
     "cmp",
     "2.5*10^-6<7*10^-5<8*10^-6"
    ],
    [
     "cmp",
     "8*10^-6<7*10^-5<2.5*10^-6"
    ]
   ]
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-005:q4": {
   "k": "ordA",
   "v": "0.00007/0.000008"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-005:q5": {
   "k": "ordN",
   "v": "0.00007/0.000008"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-006:q1": {
   "k": "sciA",
   "v": "64*10^9"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-006:q2": {
   "k": "sciN",
   "v": "64*10^9"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-006:q3": {
   "k": "sciA",
   "v": "(64*10^9)/(3.2*10^6)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-006:q4": {
   "k": "sciN",
   "v": "(64*10^9)/(3.2*10^6)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-006:q5": {
   "k": "hasr",
   "v": "(64*10^9)/(3.2*10^6)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-007:q1": {
   "k": "sciA",
   "v": "(7.5*10^6*4*10^-2)/(5*10^3)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-007:q2": {
   "k": "sciN",
   "v": "(7.5*10^6*4*10^-2)/(5*10^3)"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-007:q3": {
   "k": "hasr",
   "v": "0.000085*10^8"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-007:q4": {
   "k": "ordA",
   "v": "0.000085*10^8"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-007:q5": {
   "k": "ordA",
   "v": "(7.5*10^6*4*10^-2)/(5*10^3)*0.000085*10^8"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-007:q6": {
   "k": "ordN",
   "v": "(7.5*10^6*4*10^-2)/(5*10^3)*0.000085*10^8"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-008:q1": {
   "k": "ordA",
   "v": "4.2"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-008:q2": {
   "k": "ordN",
   "v": "4.2"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-008:q3": {
   "k": "ordA",
   "v": "0.0035"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-008:q4": {
   "k": "ordN",
   "v": "0.0035"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-008:q5": {
   "k": "ordA",
   "v": "105"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-008:q6": {
   "k": "ordN",
   "v": "105"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-008:q7": {
   "k": "sciA",
   "v": "105/0.0035"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-008:q8": {
   "k": "sciN",
   "v": "105/0.0035"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-009:q1": {
   "k": "val",
   "v": "16*60*24*365*70"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-009:q2": {
   "k": "sciA",
   "v": "16*60*24*365*70"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-009:q3": {
   "k": "sciN",
   "v": "16*60*24*365*70"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-009:q4": {
   "k": "ordA",
   "v": "16*60*24*365*70"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-009:q5": {
   "k": "ordN",
   "v": "16*60*24*365*70"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-010:q1": {
   "k": "val",
   "v": "3*10^8*86400"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-010:q2": {
   "k": "sciA",
   "v": "3*10^8*86400"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-010:q3": {
   "k": "sciN",
   "v": "3*10^8*86400"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-010:q4": {
   "k": "ordA",
   "v": "3*10^8*86400"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-010:q5": {
   "k": "ordN",
   "v": "3*10^8*86400"
  },
  "ex-3am-kitaba-ilmiya-rutba-l5-010:q6": {
   "k": "sciN",
   "v": "3*10^8*86400/1000"
  }
 }
};

/* ── rationnels exacts ──────────────────────────────────────────────────── */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
class Q {
  constructor(n, d = 1n) {
    n = BigInt(n); d = BigInt(d);
    if (d === 0n) throw new Error('division par zéro');
    if (d < 0n) { n = -n; d = -d; }
    const g = gcd(n, d) || 1n; this.n = n / g; this.d = d / g;
  }
  add(o) { return new Q(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { return new Q(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { return new Q(this.n * o.n, this.d * o.d); }
  div(o) { return new Q(this.n * o.d, this.d * o.n); }
  pow(k) { let r = new Q(1n); const b = k < 0 ? new Q(1n).div(this) : this; for (let i = 0; i < Math.abs(k); i++) r = r.mul(b); return r; }
  cmp(o) { const l = this.n * o.d, r = o.n * this.d; return l < r ? -1 : l > r ? 1 : 0; }
  eq(o) { return this.cmp(o) === 0; }
  ge(o) { return this.cmp(o) >= 0; }
  lt(o) { return this.cmp(o) < 0; }
}
const lit = (s) => { const [i, f = ''] = String(s).split('.'); return new Q(BigInt(i + f), 10n ** BigInt(f.length)); };
const TEN = new Q(10n);
const ONE = new Q(1n);
const pow10 = (n) => TEN.pow(n);

/** Écriture décimale exacte (null si non finie). */
function decimal(q) {
  for (let k = 0; k <= 80; k++) {
    const num = q.n * 10n ** BigInt(k);
    if (num % q.d === 0n) {
      let digits = (num / q.d).toString(); const neg = digits.startsWith('-'); if (neg) digits = digits.slice(1);
      digits = digits.padStart(k + 1, '0');
      return (neg ? '-' : '') + digits.slice(0, digits.length - k) + (k ? '.' + digits.slice(digits.length - k) : '');
    }
  }
  return null;
}

/* ── évaluateur d'expressions ASCII : décimaux, * / + -, puissances à exposant entier relatif, parenthèses ───────── */
function E(src) {
  const s = src.replace(/\s+/g, ''); let i = 0;
  const peek = () => s[i] ?? '';
  const num = () => { const m = /^\d+(\.\d+)?/.exec(s.slice(i)); if (!m) throw new Error(`nombre attendu en ${i} de ${src}`); i += m[0].length; return m[0]; };
  const atom = () => {
    if (peek() === '(') { i++; const v = sum(); if (s[i] !== ')') throw new Error(`« ) » attendu dans ${src}`); i++; return v; }
    return lit(num());
  };
  const power = () => {
    const a = atom();
    if (peek() === '^') { i++; let neg = false; if (peek() === '-') { neg = true; i++; } const k = Number(num()); return a.pow(neg ? -k : k); }
    return a;
  };
  const prod = () => { let v = power(); while (peek() === '*' || peek() === '/') { const op = s[i++]; const r = power(); v = op === '*' ? v.mul(r) : v.div(r); } return v; };
  const sum = () => { let v = prod(); while (peek() === '+' || peek() === '-') { const op = s[i++]; const r = prod(); v = op === '+' ? v.add(r) : v.sub(r); } return v; };
  const out = sum();
  if (i !== s.length) throw new Error(`reste « ${s.slice(i)} » dans ${src}`);
  return out;
}

/* ── la mathématique de la leçon, écrite ICI ──────────────────────────────────────────────────────────────────────
 * Pour une valeur v > 0 : l'UNIQUE entier n tel que 10^n ≤ v < 10^(n+1) (balayage de -60 à 60), puis a = v / 10^n ∈ [1, 10[.
 * Rang d'ordre de grandeur : a' = a arrondi à l'unité, demi vers le haut (a' = ⌊a + 1/2⌋) ; si a' = 10 la forme est 1 × 10^(n+1). */
function rung(v) {
  if (!(v.n > 0n)) throw new Error('valeur ≤ 0');
  const hits = [];
  for (let n = -60; n <= 60; n++) if (v.ge(pow10(n)) && v.lt(pow10(n + 1))) hits.push(n);
  if (hits.length !== 1) throw new Error('barreau non unique');
  return hits[0];
}
function sci(v) { const n = rung(v); return { n, a: v.div(pow10(n)) }; }
function order(v) {
  const { n, a } = sci(v);
  const twice = a.mul(new Q(2n)).add(ONE); // ⌊a + 1/2⌋ = ⌊(2a + 1) / 2⌋
  const ap = (twice.n / twice.d) / 2n;
  return ap === 10n ? { a: 1n, n: n + 1 } : { a: ap, n };
}
const isScientificA = (a) => a.ge(ONE) && a.lt(TEN);

/** Une affirmation de QCM : tableau [type, …]. */
function holds(claim) {
  const [t, ...r] = claim;
  switch (t) {
    case 'sci': { const [v, a, n] = r; const A = lit(a); return isScientificA(A) && A.mul(pow10(n)).eq(E(v)); }
    case 'br': { const [v, n] = r; return rung(E(v)) === n; }
    case 'ord': { const [v, a, n] = r; const o = order(E(v)); const A = lit(a); return A.eq(new Q(o.a)) && n === o.n && A.ge(ONE) && A.lt(TEN); }
    case 'eq': { const [l, rr] = r; return E(l).eq(E(rr)); }
    case 'cmp': {
      const toks = r[0].split(/(<|>|=)/);
      for (let k = 1; k < toks.length; k += 2) {
        const c = E(toks[k - 1]).cmp(E(toks[k + 1]));
        if (toks[k] === '<' && c >= 0) return false;
        if (toks[k] === '>' && c <= 0) return false;
        if (toks[k] === '=' && c !== 0) return false;
      }
      return true;
    }
    default: throw new Error(`affirmation inconnue ${t}`);
  }
}

const LET = 'ABCD';
function decide(spec) {
  switch (spec.k) {
    case 'sciA': return R(decimal(sci(E(spec.v)).a));
    case 'sciN': return R(sci(E(spec.v)).n);
    case 'hasr': return R(rung(E(spec.v)));
    case 'ordA': return R(String(order(E(spec.v)).a));
    case 'ordN': return R(order(E(spec.v)).n);
    case 'val': return R(decimal(E(spec.v)));
    case 'coef': return R(decimal(E(spec.v).div(pow10(spec.p))));
    case 'solve': {
      const hits = []; for (let n = -60; n <= 60; n++) if (lit(spec.c).mul(pow10(n)).eq(E(spec.v))) hits.push(n);
      return hits.length === 1 ? R(hits[0]) : null;
    }
    case 'pick': {
      const truths = spec.claims.map(holds).map((t, k) => (t ? k : -1)).filter((k) => k >= 0);
      return truths.length === 1 ? C(LET[truths[0]]) : null;
    }
    default: return null;
  }
}

export const ORACLE = {};
for (const [key, spec] of Object.entries(DATA.oracle)) {
  let r = null;
  try { r = decide(spec); } catch { r = null; }
  if (r) ORACLE[key] = r;
}

/* ── relecture du texte visible ─────────────────────────────────────────── */
const plain = (t) => String(t ?? '').replace(/\\left|\\right|\\,|\\ |\\!|;/g, '').replace(/\{,\}/g, '.').replace(/(\d) (?=\d{3}(?!\d))/g, '$1');
const numbers = (t) => new Set([...plain(t).matchAll(/\d+(?:\.\d+)?/g)].map((m) => String(Number(m[0]) === Number(m[0]) ? m[0] : m[0])));
const exprNumbers = (e) => numbers(String(e));
const specNumbers = (spec) => {
  const out = new Set();
  for (const f of ['v', 'c']) if (typeof spec[f] === 'string') for (const x of exprNumbers(spec[f])) out.add(x);
  return out;
};
const claimNumbers = (c) => {
  const out = new Set();
  for (const part of c.slice(1)) if (typeof part === 'string' || typeof part === 'number') for (const x of exprNumbers(part)) out.add(x);
  if (c[0] === 'br') for (const x of exprNumbers(String(c[2] + 1))) out.add(x); // 10^n ≤ v < 10^(n+1) : l'option cite n et n + 1
  return out;
};

const MISC = new Set(['MISC-ILMIYA-RAQAM', 'MISC-ILMIYA-K', 'MISC-ILMIYA-FASILA', 'MISC-ILMIYA-HASR', 'MISC-ILMIYA-BATR', 'MISC-ILMIYA-QUWA', 'MISC-ILMIYA-MUQARANA']);

export function audit(bank) {
  const bad = [];
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content/practice/3am/kitaba-ilmiya-rutba');
  const cache = new Map();
  const exercise = (key) => {
    const id = key.split(':')[0];
    if (!cache.has(id)) cache.set(id, JSON.parse(readFileSync(join(root, `level-${id.match(/-l(\d)-/)[1]}`, `${id}.json`), 'utf8')));
    return cache.get(id);
  };
  for (const { key, q } of bank) {
    const spec = DATA.oracle[key];
    const ex = exercise(key);
    if (!spec) { bad.push(`${key}: aucune description d'oracle`); continue; }
    if (!ORACLE[key]) { bad.push(`${key}: l'oracle ne décide pas (spec ${spec.k})`); continue; }
    const stem = [ex.statement.content, ...(ex.statement.formulas ?? []), q.lead ?? '', q.statement].join(' ');
    const stemNums = numbers(stem);
    try {
      if (q.answerType === 'rational') {
        if (!['sciA', 'sciN', 'hasr', 'ordA', 'ordN', 'val', 'coef', 'solve'].includes(spec.k)) bad.push(`${key}: spec « ${spec.k} » pour une réponse rationnelle`);
        const want = String(ORACLE[key].value);
        if (!lit(String(q.expectedAnswer).replace(/^-/, '')).eq(lit(want.replace(/^-/, ''))) || String(q.expectedAnswer).startsWith('-') !== want.startsWith('-')) bad.push(`${key}: clé ${q.expectedAnswer} ≠ ${want}`);
        if (/,/.test(String(q.expectedAnswer))) bad.push(`${key}: la clé ne s'écrit pas avec une virgule`);
        for (const x of specNumbers(spec)) if (!stemNums.has(x)) bad.push(`${key}: le nombre ${x} de l'oracle n'apparaît pas dans l'énoncé`);
        // a' est un entier de 1 à 9, a est dans [1, 10[
        if (spec.k === 'ordA' && !(Number(want) >= 1 && Number(want) <= 9)) bad.push(`${key}: a' hors de 1…9`);
        if (spec.k === 'sciA' && !isScientificA(lit(want))) bad.push(`${key}: a hors de [1, 10[`);
        for (const sg of q.misconceptionSignatures ?? []) {
          if (!MISC.has(sg.id)) bad.push(`${key}: signature ${sg.id} inconnue`);
          const sneg = String(sg.value).startsWith('-');
          if (lit(String(sg.value).replace(/^-/, '')).eq(lit(want.replace(/^-/, ''))) && sneg === want.startsWith('-')) bad.push(`${key}: la signature ${sg.value} vaut la clé`);
          // la signature RAQAM d'un « n » est le nombre de chiffres de la partie entière du nombre écrit dans l'énoncé
          if (sg.id === 'MISC-ILMIYA-RAQAM' && spec.k === 'sciN') {
            const v = E(spec.v); const intDigits = (v.n / v.d).toString().length;
            if (Number(sg.value) !== intDigits) bad.push(`${key}: la signature RAQAM ${sg.value} ≠ nombre de chiffres de la partie entière (${intDigits})`);
          }
          if (sg.id === 'MISC-ILMIYA-BATR' && spec.k === 'ordA') {
            const a = sci(E(spec.v)).a; const trunc = String(a.n / a.d);
            if (String(sg.value) !== trunc) bad.push(`${key}: la signature BATR ${sg.value} ≠ troncature ${trunc}`);
          }
          if (sg.id === 'MISC-ILMIYA-QUWA' && spec.k === 'ordN') {
            const o = order(E(spec.v)); if (Number(sg.value) !== o.n + 1) bad.push(`${key}: la signature QUWA ${sg.value} ≠ exposant suivant ${o.n + 1}`);
          }
        }
      } else if (q.answerType === 'choice') {
        if (spec.k !== 'pick') { bad.push(`${key}: spec « ${spec.k} » pour un QCM`); continue; }
        if (spec.claims.length !== q.choices.length) bad.push(`${key}: ${spec.claims.length} affirmations pour ${q.choices.length} options`);
        const truths = spec.claims.map(holds);
        if (truths.filter(Boolean).length !== 1) bad.push(`${key}: ${truths.filter(Boolean).length} options vraies`);
        q.choices.forEach((c, k) => {
          if (truths[k] !== !!c.isCorrect) bad.push(`${key}: l'option ${c.id} est marquée ${c.isCorrect ? 'juste' : 'fausse'} mais l'affirmation est ${truths[k] ? 'vraie' : 'fausse'}`);
          if (!c.isCorrect && !MISC.has(c.misconceptionId)) bad.push(`${key}: distracteur ${c.id} sans MISC-ILMIYA-*`);
          const cn = claimNumbers(spec.claims[k]); const on = numbers(c.content);
          on.delete('10');
          for (const x of on) if (!cn.has(x)) bad.push(`${key}: l'option ${c.id} cite ${x}, absent de l'affirmation`);
          for (const x of cn) if (!on.has(x) && !stemNums.has(x) && x !== '10') bad.push(`${key}: l'affirmation de ${c.id} cite ${x}, ni dans l'option ni dans l'énoncé`);
        });
      } else bad.push(`${key}: type ${q.answerType} non géré`);
    } catch (e) { bad.push(`${key}: ${e.message}`); }
  }
  return bad;
}
