// Oracle du banc « wadiya-idmajiya-musawiyat-mutabayinat » (« أدمج تعلّماتي — المساويات – المتباينات – المعادلات », synthèse de l'unité 5 de 3AM, 2026-10-28) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل … »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, avec une arithmétique écrite dans ce fichier (jamais packages/core) : des RATIONNELS exacts en BigInt et des
// FORMES AFFINES a·x + b (pour résoudre une équation et tester un nombre). Méthode :
//  - une valeur demandée (`val`) est une expression RETAPÉE dans une petite syntaxe ASCII (+ − * / parenthèses, x, et les fonctions lo(r, p) = r − p/2, hi(r, p) = r + p/2,
//    rnd(v, p) = arrondi AU DEMI SUPÉRIEUR au pas p, fl / ce = plancher / plafond au pas p, mn / mx) ; `solve` résout l = r en x ; chaque littéral de 2 chiffres ou plus (ou décimal)
//    de la spec doit figurer dans la feuille (énoncé, questions, options) : la spec est retapée de l'énoncé, jamais copiée de la clé ;
//  - chaque QCM est jugé option par option, et il doit y avoir EXACTEMENT une option vraie, celle que marque la feuille :
//      sat     le nombre v rend les deux membres égaux                 holds   l = r est vraie pour la solution de l'équation de départ
//      eqsol   l'équation l = r a pour unique solution `sol`           br      encadrement [lo, hi[ comparé à celui du contenu (bornes et rigueur)
//      law     « si hypothèse alors conclusion » vérifié sur une grille de pas ½ (a < b renverse, a ≤ b garde…)
//      always / undecided   une valeur de [lo, hi[ est-elle TOUJOURS <, >, ≤, ≥ à c ? ; ou c est-il DANS l'encadrement ?      never   une option qui prétend décider alors que c est dans l'encadrement ;
//  - `audit` contrôle chaque signature MISC-* : la formule d'erreur (`via`) retapée doit valoir la valeur déclarée et différer de la clé.
// Les questions selfCheck (« علّل ») n'ont pas de clé et ne figurent pas ici.
const SPEC = {
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-001:q1": {
  "k": "val",
  "e": "15-5",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "15+5",
    "v": "20"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-001:q2": {
  "k": "val",
  "e": "61-7",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "61+7",
    "v": "68"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-001:q3": {
  "k": "mc",
  "opts": [
   {
    "t": "holds",
    "bl": "5*x+7",
    "br": "37",
    "l": "x",
    "r": "30"
   },
   {
    "t": "holds",
    "bl": "5*x+7",
    "br": "37",
    "l": "5*x",
    "r": "30"
   },
   {
    "t": "holds",
    "bl": "5*x+7",
    "br": "37",
    "l": "5*x+2",
    "r": "37"
   },
   {
    "t": "holds",
    "bl": "5*x+7",
    "br": "37",
    "l": "5*x",
    "r": "44"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-001:q4": {
  "k": "val",
  "e": "27-3",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "27+3",
    "v": "30"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-002:q1": {
  "k": "val",
  "e": "3*24",
  "sigs": [
   {
    "id": "MISC-MUSAWIYA-TERM-LOST",
    "via": "3*(24-9)+9",
    "v": "54"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-002:q2": {
  "k": "val",
  "e": "5*15",
  "sigs": [
   {
    "id": "MISC-MUSAWIYA-TERM-LOST",
    "via": "5*(15-9)+9",
    "v": "39"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-002:q3": {
  "k": "mc",
  "opts": [
   {
    "t": "holds",
    "bl": "2*x+5",
    "br": "13",
    "l": "2*x",
    "r": "8"
   },
   {
    "t": "holds",
    "bl": "2*x+5",
    "br": "13",
    "l": "2*x",
    "r": "18"
   },
   {
    "t": "holds",
    "bl": "2*x+5",
    "br": "13",
    "l": "2*x+2",
    "r": "13"
   },
   {
    "t": "holds",
    "bl": "2*x+5",
    "br": "13",
    "l": "x",
    "r": "8"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-002:q4": {
  "k": "val",
  "e": "(-2)*15",
  "sigs": [
   {
    "id": "MISC-MUSAWIYA-TERM-LOST",
    "via": "(-2)*(15-5)+5",
    "v": "-15"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-003:q1": {
  "k": "val",
  "e": "mn((-3)*1+2,(-3)*9+2)",
  "sigs": [
   {
    "id": "MISC-MUTABAYINA-NEG-NOFLIP",
    "via": "(-3)*1+2",
    "v": "-1"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-003:q2": {
  "k": "val",
  "e": "mx((-1)*1+5,(-1)*7+5)",
  "sigs": [
   {
    "id": "MISC-MUTABAYINA-NEG-NOFLIP",
    "via": "(-1)*7+5",
    "v": "-2"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-003:q3": {
  "k": "mc",
  "opts": [
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "3"
     ]
    ],
    "concl": [
     [
      "-x-4",
      ">=",
      "1"
     ]
    ]
   },
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "3"
     ]
    ],
    "concl": [
     [
      "-x-4",
      ">=",
      "-1"
     ]
    ]
   },
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "3"
     ]
    ],
    "concl": [
     [
      "-x-4",
      "<=",
      "-7"
     ]
    ]
   },
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "3"
     ]
    ],
    "concl": [
     [
      "-x-4",
      ">=",
      "-7"
     ]
    ]
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-003:q4": {
  "k": "val",
  "e": "mx((-2)*2+(-4),(-2)*5+(-4))",
  "sigs": [
   {
    "id": "MISC-MUTABAYINA-NEG-NOFLIP",
    "via": "(-2)*5+(-4)",
    "v": "-14"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-004:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "6"
     ]
    ],
    "concl": [
     [
      "2*x+3",
      "<=",
      "9"
     ]
    ]
   },
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "6"
     ]
    ],
    "concl": [
     [
      "2*x+3",
      "<=",
      "3"
     ]
    ]
   },
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "6"
     ]
    ],
    "concl": [
     [
      "2*x+3",
      "<=",
      "15"
     ]
    ]
   },
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "6"
     ]
    ],
    "concl": [
     [
      "2*x+3",
      ">=",
      "15"
     ]
    ]
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-004:q2": {
  "k": "mc",
  "opts": [
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "-2"
     ]
    ],
    "concl": [
     [
      "2*x+7",
      ">=",
      "3"
     ]
    ]
   },
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "-2"
     ]
    ],
    "concl": [
     [
      "2*x+7",
      "<=",
      "-9"
     ]
    ]
   },
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "-2"
     ]
    ],
    "concl": [
     [
      "2*x+7",
      "<=",
      "3"
     ]
    ]
   },
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "-2"
     ]
    ],
    "concl": [
     [
      "2*x+7",
      "<=",
      "-11"
     ]
    ]
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-004:q3": {
  "k": "val",
  "e": "mn(2*(-6)+2,2*(-2)+2)",
  "sigs": [
   {
    "id": "MISC-MUTABAYINA-COEF-LOST",
    "via": "(-6)+2",
    "v": "-4"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-004:q4": {
  "k": "val",
  "e": "mx((-3)*(-5)+5,(-3)*3+5)",
  "sigs": [
   {
    "id": "MISC-MUTABAYINA-NEG-NOFLIP",
    "via": "(-3)*3+5",
    "v": "-4"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-005:q1": {
  "k": "val",
  "e": "rnd(2.547,0.01)",
  "sigs": [
   {
    "id": "MISC-TADWIR-TRUNC",
    "via": "fl(2.547,0.01)",
    "v": "2.54"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-005:q2": {
  "k": "val",
  "e": "rnd(2.545,0.01)",
  "sigs": [
   {
    "id": "MISC-TADWIR-TRUNC",
    "via": "fl(2.545,0.01)",
    "v": "2.54"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-005:q3": {
  "k": "val",
  "e": "rnd(1.705,0.01)",
  "sigs": [
   {
    "id": "MISC-TADWIR-TRUNC",
    "via": "fl(1.705,0.01)",
    "v": "1.7"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-005:q4": {
  "k": "mc",
  "opts": [
   {
    "t": "br",
    "claim": [
     "9",
     "9.2",
     1,
     0
    ],
    "truth": [
     "lo(9.1,0.1)",
     "hi(9.1,0.1)",
     1,
     0
    ]
   },
   {
    "t": "br",
    "claim": [
     "9.1",
     "9.2",
     1,
     0
    ],
    "truth": [
     "lo(9.1,0.1)",
     "hi(9.1,0.1)",
     1,
     0
    ]
   },
   {
    "t": "br",
    "claim": [
     "9.05",
     "9.15",
     1,
     0
    ],
    "truth": [
     "lo(9.1,0.1)",
     "hi(9.1,0.1)",
     1,
     0
    ]
   },
   {
    "t": "br",
    "claim": [
     "9.05",
     "9.15",
     1,
     1
    ],
    "truth": [
     "lo(9.1,0.1)",
     "hi(9.1,0.1)",
     1,
     0
    ]
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-006:q1": {
  "k": "val",
  "e": "lo(8.1,0.1)",
  "sigs": [
   {
    "id": "MISC-TADWIR-CENTER-EXACT",
    "via": "8.1",
    "v": "8.1"
   },
   {
    "id": "MISC-TADWIR-WIDTH",
    "via": "8.1-0.1",
    "v": "8"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-006:q2": {
  "k": "val",
  "e": "hi(15.1,0.1)",
  "sigs": [
   {
    "id": "MISC-TADWIR-CENTER-EXACT",
    "via": "15.1",
    "v": "15.1"
   },
   {
    "id": "MISC-TADWIR-TRUNC",
    "via": "15.1+0.1",
    "v": "15.2"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-006:q3": {
  "k": "mc",
  "opts": [
   {
    "t": "br",
    "claim": [
     "15.1",
     "15.2",
     1,
     0
    ],
    "truth": [
     "lo(15.1,0.1)",
     "hi(15.1,0.1)",
     1,
     0
    ]
   },
   {
    "t": "br",
    "claim": [
     "15.05",
     "15.15",
     1,
     0
    ],
    "truth": [
     "lo(15.1,0.1)",
     "hi(15.1,0.1)",
     1,
     0
    ]
   },
   {
    "t": "br",
    "claim": [
     "15",
     "15.2",
     1,
     0
    ],
    "truth": [
     "lo(15.1,0.1)",
     "hi(15.1,0.1)",
     1,
     0
    ]
   },
   {
    "t": "br",
    "claim": [
     "15.05",
     "15.15",
     1,
     1
    ],
    "truth": [
     "lo(15.1,0.1)",
     "hi(15.1,0.1)",
     1,
     0
    ]
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-006:q4": {
  "k": "val",
  "e": "lo(35.2,0.1)",
  "sigs": [
   {
    "id": "MISC-TADWIR-CENTER-EXACT",
    "via": "35.2",
    "v": "35.2"
   },
   {
    "id": "MISC-TADWIR-WIDTH",
    "via": "35.2-0.1",
    "v": "35.1"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-007:q1": {
  "k": "solve",
  "l": "4*x+3",
  "r": "2*x-3",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "((-3)+3)/(4-2)",
    "v": "0"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "(-3)-3",
    "v": "-6"
   },
   {
    "id": "MISC-MUADALA-DIV-WRONG",
    "via": "((-3)-3)/(4+2)",
    "v": "-1"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-007:q2": {
  "k": "solve",
  "l": "2*x+11",
  "r": "x+15",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(15+11)/(2-1)",
    "v": "26"
   },
   {
    "id": "MISC-MUADALA-DIV-WRONG",
    "via": "(15-11)/(2+1)",
    "v": "4/3"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-007:q3": {
  "k": "solve",
  "l": "2*x+2",
  "r": "4*x+12",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(12+2)/(2-4)",
    "v": "-7"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "12-2",
    "v": "10"
   },
   {
    "id": "MISC-MUADALA-DIV-WRONG",
    "via": "(12-2)/(2+4)",
    "v": "5/3"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-007:q4": {
  "k": "mc",
  "opts": [
   {
    "t": "sat",
    "l": "5*x-2",
    "r": "2*x+7",
    "v": "4"
   },
   {
    "t": "sat",
    "l": "5*x-2",
    "r": "2*x+7",
    "v": "9"
   },
   {
    "t": "sat",
    "l": "5*x-2",
    "r": "2*x+7",
    "v": "-3"
   },
   {
    "t": "sat",
    "l": "5*x-2",
    "r": "2*x+7",
    "v": "3"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-008:q1": {
  "k": "solve",
  "l": "6*x-6",
  "r": "4*x+4",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(4+(-6))/(6-4)",
    "v": "-1"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "4-(-6)",
    "v": "10"
   },
   {
    "id": "MISC-MUADALA-DIV-WRONG",
    "via": "(4-(-6))/(6+4)",
    "v": "1"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-008:q2": {
  "k": "solve",
  "l": "7*x+5",
  "r": "5*x+1",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(1+5)/(7-5)",
    "v": "3"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "1-5",
    "v": "-4"
   },
   {
    "id": "MISC-MUADALA-DIV-WRONG",
    "via": "(1-5)/(7+5)",
    "v": "-1/3"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-008:q3": {
  "k": "solve",
  "l": "3*(x+4)",
  "r": "2*x+18",
  "sigs": [
   {
    "id": "MISC-MUSAWIYA-TERM-LOST",
    "via": "(18-4)/(3-2)",
    "v": "14"
   },
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(18+3*4)/(3-2)",
    "v": "30"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-008:q4": {
  "k": "solve",
  "l": "5*(x+3)",
  "r": "20",
  "sigs": [
   {
    "id": "MISC-MUSAWIYA-TERM-LOST",
    "via": "(20-3)/(5-0)",
    "v": "3.4"
   },
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(20+5*3)/(5-0)",
    "v": "7"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-009:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "sat",
    "l": "4*x+3",
    "r": "3*x+7",
    "v": "4"
   },
   {
    "t": "sat",
    "l": "4*x+3",
    "r": "3*x+7",
    "v": "5"
   },
   {
    "t": "sat",
    "l": "4*x+3",
    "r": "3*x+7",
    "v": "-4"
   },
   {
    "t": "sat",
    "l": "4*x+3",
    "r": "3*x+7",
    "v": "10"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-009:q2": {
  "k": "mc",
  "opts": [
   {
    "t": "sat",
    "l": "5*x+5",
    "r": "x+9",
    "v": "-1"
   },
   {
    "t": "sat",
    "l": "5*x+5",
    "r": "x+9",
    "v": "1"
   },
   {
    "t": "sat",
    "l": "5*x+5",
    "r": "x+9",
    "v": "3.5"
   },
   {
    "t": "sat",
    "l": "5*x+5",
    "r": "x+9",
    "v": "4"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-009:q3": {
  "k": "solve",
  "l": "8*x+9",
  "r": "5*x+15",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(15+9)/(8-5)",
    "v": "8"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "15-9",
    "v": "6"
   },
   {
    "id": "MISC-MUADALA-DIV-WRONG",
    "via": "(15-9)/(8+5)",
    "v": "6/13"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-009:q4": {
  "k": "solve",
  "l": "3*(x+2)",
  "r": "x+18",
  "sigs": [
   {
    "id": "MISC-MUSAWIYA-TERM-LOST",
    "via": "(18-2)/(3-1)",
    "v": "8"
   },
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(18+3*2)/(3-1)",
    "v": "12"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-010:q1": {
  "k": "val",
  "e": "27-(-8)",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "27+(-8)",
    "v": "19"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-010:q2": {
  "k": "mc",
  "opts": [
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "3"
     ]
    ],
    "concl": [
     [
      "-2*x-6",
      "<=",
      "-12"
     ]
    ]
   },
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "3"
     ]
    ],
    "concl": [
     [
      "-2*x-6",
      ">=",
      "-3"
     ]
    ]
   },
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "3"
     ]
    ],
    "concl": [
     [
      "-2*x-6",
      ">=",
      "-12"
     ]
    ]
   },
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "3"
     ]
    ],
    "concl": [
     [
      "-2*x-6",
      ">=",
      "0"
     ]
    ]
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-010:q3": {
  "k": "val",
  "e": "rnd(1.036,0.01)",
  "sigs": [
   {
    "id": "MISC-TADWIR-TRUNC",
    "via": "fl(1.036,0.01)",
    "v": "1.03"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l1-010:q4": {
  "k": "solve",
  "l": "4*x+11",
  "r": "3*x+6",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(6+11)/(4-3)",
    "v": "17"
   },
   {
    "id": "MISC-MUADALA-DIV-WRONG",
    "via": "(6-11)/(4+3)",
    "v": "-5/7"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-001:q1": {
  "k": "val",
  "e": "25-13",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "25+13",
    "v": "38"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-001:q2": {
  "k": "val",
  "e": "mn(2*(-6)+7,2*(-3)+7)",
  "sigs": [
   {
    "id": "MISC-MUTABAYINA-COEF-LOST",
    "via": "(-6)+7",
    "v": "1"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-001:q3": {
  "k": "mc",
  "opts": [
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "-1"
     ]
    ],
    "concl": [
     [
      "2*x-4",
      ">=",
      "-6"
     ]
    ]
   },
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "-1"
     ]
    ],
    "concl": [
     [
      "2*x-4",
      "<=",
      "-10"
     ]
    ]
   },
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "-1"
     ]
    ],
    "concl": [
     [
      "2*x-4",
      "<=",
      "-6"
     ]
    ]
   },
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "-1"
     ]
    ],
    "concl": [
     [
      "2*x-4",
      "<=",
      "-7"
     ]
    ]
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-001:q4": {
  "k": "solve",
  "l": "3*x+8",
  "r": "4*x-3",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "((-3)+8)/(3-4)",
    "v": "-5"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "(-3)-8",
    "v": "-11"
   },
   {
    "id": "MISC-MUADALA-DIV-WRONG",
    "via": "((-3)-8)/(3+4)",
    "v": "-11/7"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-002:q1": {
  "k": "val",
  "e": "lo(2.9,0.1)",
  "sigs": [
   {
    "id": "MISC-TADWIR-CENTER-EXACT",
    "via": "2.9",
    "v": "2.9"
   },
   {
    "id": "MISC-TADWIR-WIDTH",
    "via": "2.9-0.1",
    "v": "2.8"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-002:q2": {
  "k": "val",
  "e": "2*hi(4.5,0.1)+0",
  "sigs": [
   {
    "id": "MISC-TADWIR-CENTER-EXACT",
    "via": "2*4.5+0",
    "v": "9"
   },
   {
    "id": "MISC-TADWIR-TRUNC",
    "via": "2*(4.5+0.1)+0",
    "v": "9.2"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-002:q3": {
  "k": "val",
  "e": "mx((-3)*(-5)+(-4),(-3)*(-2)+(-4))",
  "sigs": [
   {
    "id": "MISC-MUTABAYINA-NEG-NOFLIP",
    "via": "(-3)*(-2)+(-4)",
    "v": "2"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-002:q4": {
  "k": "mc",
  "opts": [
   {
    "t": "br",
    "claim": [
     "15.05",
     "15.15",
     1,
     1
    ],
    "truth": [
     "lo(15.1,0.1)",
     "hi(15.1,0.1)",
     1,
     0
    ]
   },
   {
    "t": "br",
    "claim": [
     "15.1",
     "15.2",
     1,
     0
    ],
    "truth": [
     "lo(15.1,0.1)",
     "hi(15.1,0.1)",
     1,
     0
    ]
   },
   {
    "t": "br",
    "claim": [
     "15",
     "15.2",
     1,
     0
    ],
    "truth": [
     "lo(15.1,0.1)",
     "hi(15.1,0.1)",
     1,
     0
    ]
   },
   {
    "t": "br",
    "claim": [
     "15.05",
     "15.15",
     1,
     0
    ],
    "truth": [
     "lo(15.1,0.1)",
     "hi(15.1,0.1)",
     1,
     0
    ]
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-003:q1": {
  "k": "solve",
  "l": "2*x-2",
  "r": "-2*x+10",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(10+(-2))/(2-(-2))",
    "v": "2"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "10-(-2)",
    "v": "12"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-003:q2": {
  "k": "val",
  "e": "rnd(1.456,0.01)",
  "sigs": [
   {
    "id": "MISC-TADWIR-TRUNC",
    "via": "fl(1.456,0.01)",
    "v": "1.45"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-003:q3": {
  "k": "val",
  "e": "hi(12.2,0.1)",
  "sigs": [
   {
    "id": "MISC-TADWIR-CENTER-EXACT",
    "via": "12.2",
    "v": "12.2"
   },
   {
    "id": "MISC-TADWIR-TRUNC",
    "via": "12.2+0.1",
    "v": "12.3"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-003:q4": {
  "k": "solve",
  "l": "3*(x+5)",
  "r": "9",
  "sigs": [
   {
    "id": "MISC-MUSAWIYA-TERM-LOST",
    "via": "(9-5)/(3-0)",
    "v": "4/3"
   },
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(9+3*5)/(3-0)",
    "v": "8"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-004:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "sat",
    "l": "4*x-4",
    "r": "3*x+11",
    "v": "16"
   },
   {
    "t": "sat",
    "l": "4*x-4",
    "r": "3*x+11",
    "v": "15"
   },
   {
    "t": "sat",
    "l": "4*x-4",
    "r": "3*x+11",
    "v": "7"
   },
   {
    "t": "sat",
    "l": "4*x-4",
    "r": "3*x+11",
    "v": "-15"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-004:q2": {
  "k": "solve",
  "l": "6*x+3",
  "r": "3*x+12",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(12+3)/(6-3)",
    "v": "5"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "12-3",
    "v": "9"
   },
   {
    "id": "MISC-MUADALA-DIV-WRONG",
    "via": "(12-3)/(6+3)",
    "v": "1"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-004:q3": {
  "k": "val",
  "e": "5*25",
  "sigs": [
   {
    "id": "MISC-MUSAWIYA-TERM-LOST",
    "via": "5*(25-5)+5",
    "v": "105"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-004:q4": {
  "k": "mc",
  "opts": [
   {
    "t": "sat",
    "l": "5*x+3",
    "r": "3*x-3",
    "v": "3"
   },
   {
    "t": "sat",
    "l": "5*x+3",
    "r": "3*x-3",
    "v": "0"
   },
   {
    "t": "sat",
    "l": "5*x+3",
    "r": "3*x-3",
    "v": "-6"
   },
   {
    "t": "sat",
    "l": "5*x+3",
    "r": "3*x-3",
    "v": "-3"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-005:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "br",
    "claim": [
     "30.05",
     "30.15",
     1,
     1
    ],
    "truth": [
     "lo(30.1,0.1)",
     "hi(30.1,0.1)",
     1,
     0
    ]
   },
   {
    "t": "br",
    "claim": [
     "30.1",
     "30.2",
     1,
     0
    ],
    "truth": [
     "lo(30.1,0.1)",
     "hi(30.1,0.1)",
     1,
     0
    ]
   },
   {
    "t": "br",
    "claim": [
     "30.05",
     "30.15",
     1,
     0
    ],
    "truth": [
     "lo(30.1,0.1)",
     "hi(30.1,0.1)",
     1,
     0
    ]
   },
   {
    "t": "br",
    "claim": [
     "30",
     "30.2",
     1,
     0
    ],
    "truth": [
     "lo(30.1,0.1)",
     "hi(30.1,0.1)",
     1,
     0
    ]
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-005:q2": {
  "k": "mc",
  "opts": [
   {
    "t": "undecided",
    "lo": "15*lo(2.4,0.1)",
    "hi": "15*hi(2.4,0.1)",
    "c": "39.75"
   },
   {
    "t": "always",
    "lo": "15*lo(2.4,0.1)",
    "hi": "15*hi(2.4,0.1)",
    "c": "39.75",
    "op": "<"
   },
   {
    "t": "always",
    "lo": "15*lo(2.4,0.1)",
    "hi": "15*hi(2.4,0.1)",
    "c": "39.75",
    "op": ">"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-005:q3": {
  "k": "val",
  "e": "2*hi(4.2,0.1)+(-1)",
  "sigs": [
   {
    "id": "MISC-TADWIR-CENTER-EXACT",
    "via": "2*4.2+(-1)",
    "v": "7.4"
   },
   {
    "id": "MISC-TADWIR-TRUNC",
    "via": "2*(4.2+0.1)+(-1)",
    "v": "7.6"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-005:q4": {
  "k": "val",
  "e": "fl((212-150)/15,1)",
  "sigs": [
   {
    "id": "MISC-MUADALA-SOLUTION-CONTEXT",
    "via": "ce((212-150)/15,1)",
    "v": "5"
   },
   {
    "id": "MISC-MUADALA-TRANSLATE",
    "via": "fl(212/15,1)",
    "v": "14"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-006:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "10*x",
    "r": "196",
    "sol": "18"
   },
   {
    "t": "eqsol",
    "l": "80*x+6",
    "r": "116*x+4",
    "sol": "18"
   },
   {
    "t": "eqsol",
    "l": "6*x+116",
    "r": "4*x+80",
    "sol": "18"
   },
   {
    "t": "eqsol",
    "l": "6*x+80",
    "r": "4*x+116",
    "sol": "18"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-006:q2": {
  "k": "solve",
  "l": "6*x+80",
  "r": "4*x+116",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(116+80)/(6-4)",
    "v": "98"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "116-80",
    "v": "36"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-006:q3": {
  "k": "val",
  "e": "30-5",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "30+5",
    "v": "35"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-006:q4": {
  "k": "mc",
  "opts": [
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "4"
     ]
    ],
    "concl": [
     [
      "-2*x-4",
      ">=",
      "-4"
     ]
    ]
   },
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "4"
     ]
    ],
    "concl": [
     [
      "-2*x-4",
      ">=",
      "-12"
     ]
    ]
   },
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "4"
     ]
    ],
    "concl": [
     [
      "-2*x-4",
      "<=",
      "-12"
     ]
    ]
   },
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "4"
     ]
    ],
    "concl": [
     [
      "-2*x-4",
      ">=",
      "0"
     ]
    ]
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-007:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "10*x",
    "r": "184",
    "sol": "4"
   },
   {
    "t": "eqsol",
    "l": "100*x+3",
    "r": "84*x+7",
    "sol": "4"
   },
   {
    "t": "eqsol",
    "l": "3*x+100",
    "r": "7*x+84",
    "sol": "4"
   },
   {
    "t": "eqsol",
    "l": "3*x+84",
    "r": "7*x+100",
    "sol": "4"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-007:q2": {
  "k": "solve",
  "l": "3*x+100",
  "r": "7*x+84",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(84+100)/(3-7)",
    "v": "-46"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "84-100",
    "v": "-16"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-007:q3": {
  "k": "val",
  "e": "rnd(1.398,0.1)",
  "sigs": [
   {
    "id": "MISC-TADWIR-TRUNC",
    "via": "fl(1.398,0.1)",
    "v": "1.3"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-007:q4": {
  "k": "val",
  "e": "mx(3*(-2)+(-3),3*1+(-3))",
  "sigs": [
   {
    "id": "MISC-MUTABAYINA-COEF-LOST",
    "via": "1+(-3)",
    "v": "-2"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-008:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "4"
     ]
    ],
    "concl": [
     [
      "-3*x-6",
      ">=",
      "-2"
     ]
    ]
   },
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "4"
     ]
    ],
    "concl": [
     [
      "-3*x-6",
      "<=",
      "-18"
     ]
    ]
   },
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "4"
     ]
    ],
    "concl": [
     [
      "-3*x-6",
      ">=",
      "-6"
     ]
    ]
   },
   {
    "t": "law",
    "hyp": [
     [
      "x",
      "<=",
      "4"
     ]
    ],
    "concl": [
     [
      "-3*x-6",
      ">=",
      "-18"
     ]
    ]
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-008:q2": {
  "k": "val",
  "e": "3*hi(5.6,0.1)+5",
  "sigs": [
   {
    "id": "MISC-TADWIR-CENTER-EXACT",
    "via": "3*5.6+5",
    "v": "21.8"
   },
   {
    "id": "MISC-TADWIR-TRUNC",
    "via": "3*(5.6+0.1)+5",
    "v": "22.1"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-008:q3": {
  "k": "val",
  "e": "mn((-3)*(-3)+7,(-3)*5+7)",
  "sigs": [
   {
    "id": "MISC-MUTABAYINA-NEG-NOFLIP",
    "via": "(-3)*(-3)+7",
    "v": "16"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-008:q4": {
  "k": "val",
  "e": "lo(6.3,0.1)",
  "sigs": [
   {
    "id": "MISC-TADWIR-CENTER-EXACT",
    "via": "6.3",
    "v": "6.3"
   },
   {
    "id": "MISC-TADWIR-WIDTH",
    "via": "6.3-0.1",
    "v": "6.2"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-009:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "holds",
    "bl": "4*x+5",
    "br": "29",
    "l": "x",
    "r": "24"
   },
   {
    "t": "holds",
    "bl": "4*x+5",
    "br": "29",
    "l": "4*x",
    "r": "34"
   },
   {
    "t": "holds",
    "bl": "4*x+5",
    "br": "29",
    "l": "4*x",
    "r": "24"
   },
   {
    "t": "holds",
    "bl": "4*x+5",
    "br": "29",
    "l": "4*x+3",
    "r": "29"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-009:q2": {
  "k": "solve",
  "l": "2*(x+4)",
  "r": "10",
  "sigs": [
   {
    "id": "MISC-MUSAWIYA-TERM-LOST",
    "via": "(10-4)/(2-0)",
    "v": "3"
   },
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(10+2*4)/(2-0)",
    "v": "9"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-009:q3": {
  "k": "val",
  "e": "2*11",
  "sigs": [
   {
    "id": "MISC-MUSAWIYA-TERM-LOST",
    "via": "2*(11-5)+5",
    "v": "17"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-009:q4": {
  "k": "mc",
  "opts": [
   {
    "t": "sat",
    "l": "4*x+5",
    "r": "3*x+7",
    "v": "-2"
   },
   {
    "t": "sat",
    "l": "4*x+5",
    "r": "3*x+7",
    "v": "2"
   },
   {
    "t": "sat",
    "l": "4*x+5",
    "r": "3*x+7",
    "v": "12"
   },
   {
    "t": "sat",
    "l": "4*x+5",
    "r": "3*x+7",
    "v": "3"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-010:q1": {
  "k": "val",
  "e": "rnd(2.193,0.1)",
  "sigs": [
   {
    "id": "MISC-TADWIR-TRUNC",
    "via": "fl(2.193,0.1)",
    "v": "2.1"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-010:q2": {
  "k": "mc",
  "opts": [
   {
    "t": "always",
    "lo": "15*lo(3.9,0.1)",
    "hi": "15*hi(3.9,0.1)",
    "c": "58.9",
    "op": ">"
   },
   {
    "t": "undecided",
    "lo": "15*lo(3.9,0.1)",
    "hi": "15*hi(3.9,0.1)",
    "c": "58.9"
   },
   {
    "t": "always",
    "lo": "15*lo(3.9,0.1)",
    "hi": "15*hi(3.9,0.1)",
    "c": "58.9",
    "op": "<"
   },
   {
    "t": "never",
    "lo": "15*lo(3.9,0.1)",
    "hi": "15*hi(3.9,0.1)",
    "c": "58.9"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-010:q3": {
  "k": "val",
  "e": "fl((279-60)/30,1)",
  "sigs": [
   {
    "id": "MISC-MUADALA-SOLUTION-CONTEXT",
    "via": "ce((279-60)/30,1)",
    "v": "8"
   },
   {
    "id": "MISC-MUADALA-TRANSLATE",
    "via": "fl(279/30,1)",
    "v": "9"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l2-010:q4": {
  "k": "val",
  "e": "hi(15.3,0.1)",
  "sigs": [
   {
    "id": "MISC-TADWIR-CENTER-EXACT",
    "via": "15.3",
    "v": "15.3"
   },
   {
    "id": "MISC-TADWIR-TRUNC",
    "via": "15.3+0.1",
    "v": "15.4"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-001:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "10*x+94",
    "r": "7*x+40",
    "sol": "18"
   },
   {
    "t": "eqsol",
    "l": "10*x+40",
    "r": "7*x+94",
    "sol": "18"
   },
   {
    "t": "eqsol",
    "l": "17*x",
    "r": "134",
    "sol": "18"
   },
   {
    "t": "eqsol",
    "l": "40*x+10",
    "r": "94*x+7",
    "sol": "18"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-001:q2": {
  "k": "solve",
  "l": "10*x+40",
  "r": "7*x+94",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(94+40)/(10-7)",
    "v": "134/3"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "94-40",
    "v": "54"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-001:q3": {
  "k": "val",
  "e": "10*18+40",
  "sigs": [
   {
    "id": "MISC-MUADALA-NO-CHECK",
    "via": "10*18-40",
    "v": "140"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-001:q4": {
  "k": "val",
  "e": "4*lo(4.7,0.1)+2",
  "sigs": [
   {
    "id": "MISC-TADWIR-CENTER-EXACT",
    "via": "4*4.7+2",
    "v": "20.8"
   },
   {
    "id": "MISC-TADWIR-WIDTH",
    "via": "4*(4.7-0.1)+2",
    "v": "20.4"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-002:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "3*x+52",
    "r": "7*x+100",
    "sol": "12"
   },
   {
    "t": "eqsol",
    "l": "10*x",
    "r": "152",
    "sol": "12"
   },
   {
    "t": "eqsol",
    "l": "100*x+3",
    "r": "52*x+7",
    "sol": "12"
   },
   {
    "t": "eqsol",
    "l": "3*x+100",
    "r": "7*x+52",
    "sol": "12"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-002:q2": {
  "k": "solve",
  "l": "3*x+100",
  "r": "7*x+52",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(52+100)/(3-7)",
    "v": "-38"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "52-100",
    "v": "-48"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-002:q3": {
  "k": "val",
  "e": "3*12+100",
  "sigs": [
   {
    "id": "MISC-MUADALA-NO-CHECK",
    "via": "3*12-100",
    "v": "-64"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-002:q4": {
  "k": "mc",
  "opts": [
   {
    "t": "undecided",
    "lo": "12*lo(5.2,0.1)",
    "hi": "12*hi(5.2,0.1)",
    "c": "59.8"
   },
   {
    "t": "always",
    "lo": "12*lo(5.2,0.1)",
    "hi": "12*hi(5.2,0.1)",
    "c": "59.8",
    "op": ">"
   },
   {
    "t": "always",
    "lo": "12*lo(5.2,0.1)",
    "hi": "12*hi(5.2,0.1)",
    "c": "59.8",
    "op": "<"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-003:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "32*x+1",
    "r": "26*x+2",
    "sol": "6"
   },
   {
    "t": "eqsol",
    "l": "3*x",
    "r": "58",
    "sol": "6"
   },
   {
    "t": "eqsol",
    "l": "x+26",
    "r": "2*x+32",
    "sol": "6"
   },
   {
    "t": "eqsol",
    "l": "x+32",
    "r": "2*x+26",
    "sol": "6"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-003:q2": {
  "k": "solve",
  "l": "x+32",
  "r": "2*x+26",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(26+32)/(1-2)",
    "v": "-58"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "26-32",
    "v": "-6"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-003:q3": {
  "k": "val",
  "e": "1*6+32",
  "sigs": [
   {
    "id": "MISC-MUADALA-NO-CHECK",
    "via": "1*6-32",
    "v": "-26"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-003:q4": {
  "k": "val",
  "e": "fl((709-30)/45,1)",
  "sigs": [
   {
    "id": "MISC-MUADALA-SOLUTION-CONTEXT",
    "via": "ce((709-30)/45,1)",
    "v": "16"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-004:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "30",
    "r": "x+28",
    "sol": "0.5"
   },
   {
    "t": "eqsol",
    "l": "30*x",
    "r": "28*x+1",
    "sol": "0.5"
   },
   {
    "t": "eqsol",
    "l": "58*x",
    "r": "1",
    "sol": "0.5"
   },
   {
    "t": "eqsol",
    "l": "30*x+1",
    "r": "28*x",
    "sol": "0.5"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-004:q2": {
  "k": "solve",
  "l": "30*x",
  "r": "28*x+1",
  "sigs": [
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "1-0",
    "v": "1"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-004:q3": {
  "k": "val",
  "e": "30*0.5+0"
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-004:q4": {
  "k": "val",
  "e": "2*lo(5.8,0.1)+5",
  "sigs": [
   {
    "id": "MISC-TADWIR-CENTER-EXACT",
    "via": "2*5.8+5",
    "v": "16.6"
   },
   {
    "id": "MISC-TADWIR-WIDTH",
    "via": "2*(5.8-0.1)+5",
    "v": "16.4"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-005:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "12*x+56",
    "r": "-4",
    "sol": "5"
   },
   {
    "t": "eqsol",
    "l": "-4*x+12",
    "r": "56*x",
    "sol": "5"
   },
   {
    "t": "eqsol",
    "l": "12*x-4",
    "r": "56",
    "sol": "5"
   },
   {
    "t": "eqsol",
    "l": "12*x",
    "r": "52",
    "sol": "5"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-005:q2": {
  "k": "solve",
  "l": "12*x-4",
  "r": "56",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(56+(-4))/(12-0)",
    "v": "13/3"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "56-(-4)",
    "v": "60"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-005:q3": {
  "k": "val",
  "e": "12*5+(-4)",
  "sigs": [
   {
    "id": "MISC-MUADALA-NO-CHECK",
    "via": "12*5-(-4)",
    "v": "64"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-005:q4": {
  "k": "mc",
  "opts": [
   {
    "t": "undecided",
    "lo": "15*lo(3.7,0.1)",
    "hi": "15*hi(3.7,0.1)",
    "c": "55.1"
   },
   {
    "t": "never",
    "lo": "15*lo(3.7,0.1)",
    "hi": "15*hi(3.7,0.1)",
    "c": "55.1"
   },
   {
    "t": "always",
    "lo": "15*lo(3.7,0.1)",
    "hi": "15*hi(3.7,0.1)",
    "c": "55.1",
    "op": "<"
   },
   {
    "t": "always",
    "lo": "15*lo(3.7,0.1)",
    "hi": "15*hi(3.7,0.1)",
    "c": "55.1",
    "op": ">"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-006:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "12*x+50",
    "r": "8*x+146",
    "sol": "24"
   },
   {
    "t": "eqsol",
    "l": "20*x",
    "r": "196",
    "sol": "24"
   },
   {
    "t": "eqsol",
    "l": "12*x+146",
    "r": "8*x+50",
    "sol": "24"
   },
   {
    "t": "eqsol",
    "l": "50*x+12",
    "r": "146*x+8",
    "sol": "24"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-006:q2": {
  "k": "solve",
  "l": "12*x+50",
  "r": "8*x+146",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(146+50)/(12-8)",
    "v": "49"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "146-50",
    "v": "96"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-006:q3": {
  "k": "val",
  "e": "12*24+50",
  "sigs": [
   {
    "id": "MISC-MUADALA-NO-CHECK",
    "via": "12*24-50",
    "v": "238"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-006:q4": {
  "k": "val",
  "e": "fl((772-60)/45,1)",
  "sigs": [
   {
    "id": "MISC-MUADALA-SOLUTION-CONTEXT",
    "via": "ce((772-60)/45,1)",
    "v": "16"
   },
   {
    "id": "MISC-MUADALA-TRANSLATE",
    "via": "fl(772/45,1)",
    "v": "17"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-007:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "11*x",
    "r": "170",
    "sol": "10"
   },
   {
    "t": "eqsol",
    "l": "100*x+4",
    "r": "70*x+7",
    "sol": "10"
   },
   {
    "t": "eqsol",
    "l": "4*x+70",
    "r": "7*x+100",
    "sol": "10"
   },
   {
    "t": "eqsol",
    "l": "4*x+100",
    "r": "7*x+70",
    "sol": "10"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-007:q2": {
  "k": "solve",
  "l": "4*x+100",
  "r": "7*x+70",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(70+100)/(4-7)",
    "v": "-170/3"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "70-100",
    "v": "-30"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-007:q3": {
  "k": "val",
  "e": "4*10+100",
  "sigs": [
   {
    "id": "MISC-MUADALA-NO-CHECK",
    "via": "4*10-100",
    "v": "-60"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-007:q4": {
  "k": "val",
  "e": "2*hi(5.5,0.1)+5",
  "sigs": [
   {
    "id": "MISC-TADWIR-CENTER-EXACT",
    "via": "2*5.5+5",
    "v": "16"
   },
   {
    "id": "MISC-TADWIR-TRUNC",
    "via": "2*(5.5+0.1)+5",
    "v": "16.2"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-008:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "x+41",
    "r": "3*x+33",
    "sol": "4"
   },
   {
    "t": "eqsol",
    "l": "4*x",
    "r": "74",
    "sol": "4"
   },
   {
    "t": "eqsol",
    "l": "x+33",
    "r": "3*x+41",
    "sol": "4"
   },
   {
    "t": "eqsol",
    "l": "41*x+1",
    "r": "33*x+3",
    "sol": "4"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-008:q2": {
  "k": "solve",
  "l": "x+41",
  "r": "3*x+33",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(33+41)/(1-3)",
    "v": "-37"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "33-41",
    "v": "-8"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-008:q3": {
  "k": "val",
  "e": "1*4+41",
  "sigs": [
   {
    "id": "MISC-MUADALA-NO-CHECK",
    "via": "1*4-41",
    "v": "-37"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-008:q4": {
  "k": "mc",
  "opts": [
   {
    "t": "always",
    "lo": "15*lo(2.9,0.1)",
    "hi": "15*hi(2.9,0.1)",
    "c": "43.1",
    "op": "<"
   },
   {
    "t": "undecided",
    "lo": "15*lo(2.9,0.1)",
    "hi": "15*hi(2.9,0.1)",
    "c": "43.1"
   },
   {
    "t": "always",
    "lo": "15*lo(2.9,0.1)",
    "hi": "15*hi(2.9,0.1)",
    "c": "43.1",
    "op": ">"
   },
   {
    "t": "never",
    "lo": "15*lo(2.9,0.1)",
    "hi": "15*hi(2.9,0.1)",
    "c": "43.1"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-009:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "40*x+2",
    "r": "36*x",
    "sol": "0.5"
   },
   {
    "t": "eqsol",
    "l": "40*x",
    "r": "36*x+2",
    "sol": "0.5"
   },
   {
    "t": "eqsol",
    "l": "40",
    "r": "2*x+36",
    "sol": "0.5"
   },
   {
    "t": "eqsol",
    "l": "76*x",
    "r": "2",
    "sol": "0.5"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-009:q2": {
  "k": "solve",
  "l": "40*x",
  "r": "36*x+2",
  "sigs": [
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "2-0",
    "v": "2"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-009:q3": {
  "k": "val",
  "e": "40*0.5+0"
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-009:q4": {
  "k": "val",
  "e": "fl((539-150)/45,1)",
  "sigs": [
   {
    "id": "MISC-MUADALA-SOLUTION-CONTEXT",
    "via": "ce((539-150)/45,1)",
    "v": "9"
   },
   {
    "id": "MISC-MUADALA-TRANSLATE",
    "via": "fl(539/45,1)",
    "v": "11"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-010:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "10*x",
    "r": "112",
    "sol": "10"
   },
   {
    "t": "eqsol",
    "l": "10*x+106",
    "r": "6",
    "sol": "10"
   },
   {
    "t": "eqsol",
    "l": "6*x+10",
    "r": "106*x",
    "sol": "10"
   },
   {
    "t": "eqsol",
    "l": "10*x+6",
    "r": "106",
    "sol": "10"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-010:q2": {
  "k": "solve",
  "l": "10*x+6",
  "r": "106",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(106+6)/(10-0)",
    "v": "11.2"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "106-6",
    "v": "100"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-010:q3": {
  "k": "val",
  "e": "10*10+6",
  "sigs": [
   {
    "id": "MISC-MUADALA-NO-CHECK",
    "via": "10*10-6",
    "v": "94"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l3-010:q4": {
  "k": "val",
  "e": "6*lo(5.7,0.1)+10",
  "sigs": [
   {
    "id": "MISC-TADWIR-CENTER-EXACT",
    "via": "6*5.7+10",
    "v": "44.2"
   },
   {
    "id": "MISC-TADWIR-WIDTH",
    "via": "6*(5.7-0.1)+10",
    "v": "43.6"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-001:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "6*x+8",
    "r": "54*x",
    "sol": "6"
   },
   {
    "t": "eqsol",
    "l": "8*x",
    "r": "60",
    "sol": "6"
   },
   {
    "t": "eqsol",
    "l": "8*x+6",
    "r": "54",
    "sol": "6"
   },
   {
    "t": "eqsol",
    "l": "8*x+54",
    "r": "6",
    "sol": "6"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-001:q2": {
  "k": "solve",
  "l": "8*x+6",
  "r": "54",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(54+6)/(8-0)",
    "v": "7.5"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "54-6",
    "v": "48"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-001:q3": {
  "k": "val",
  "e": "8*6+6",
  "sigs": [
   {
    "id": "MISC-MUADALA-NO-CHECK",
    "via": "8*6-6",
    "v": "42"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-001:q4": {
  "k": "val",
  "e": "fl((612-340)/25,1)",
  "sigs": [
   {
    "id": "MISC-MUADALA-SOLUTION-CONTEXT",
    "via": "ce((612-340)/25,1)",
    "v": "11"
   },
   {
    "id": "MISC-MUADALA-TRANSLATE",
    "via": "fl(612/25,1)",
    "v": "24"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-002:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "30*x",
    "r": "28*x-2",
    "sol": "1"
   },
   {
    "t": "eqsol",
    "l": "30*x+2",
    "r": "28*x",
    "sol": "1"
   },
   {
    "t": "eqsol",
    "l": "30*x",
    "r": "28*x+2",
    "sol": "1"
   },
   {
    "t": "eqsol",
    "l": "58*x",
    "r": "2",
    "sol": "1"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-002:q2": {
  "k": "solve",
  "l": "30*x",
  "r": "28*x+2",
  "sigs": [
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "2-0",
    "v": "2"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-002:q3": {
  "k": "val",
  "e": "30*1+0"
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-002:q4": {
  "k": "mc",
  "opts": [
   {
    "t": "undecided",
    "lo": "8*lo(4.1,0.1)",
    "hi": "8*hi(4.1,0.1)",
    "c": "30.4"
   },
   {
    "t": "always",
    "lo": "8*lo(4.1,0.1)",
    "hi": "8*hi(4.1,0.1)",
    "c": "30.4",
    "op": "<"
   },
   {
    "t": "always",
    "lo": "8*lo(4.1,0.1)",
    "hi": "8*hi(4.1,0.1)",
    "c": "30.4",
    "op": ">"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-003:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "6*x+2",
    "r": "26",
    "sol": "4"
   },
   {
    "t": "eqsol",
    "l": "6*x",
    "r": "28",
    "sol": "4"
   },
   {
    "t": "eqsol",
    "l": "2*x+6",
    "r": "26*x",
    "sol": "4"
   },
   {
    "t": "eqsol",
    "l": "6*x+26",
    "r": "2",
    "sol": "4"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-003:q2": {
  "k": "solve",
  "l": "6*x+2",
  "r": "26",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(26+2)/(6-0)",
    "v": "14/3"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "26-2",
    "v": "24"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-003:q3": {
  "k": "val",
  "e": "6*4+2",
  "sigs": [
   {
    "id": "MISC-MUADALA-NO-CHECK",
    "via": "6*4-2",
    "v": "22"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-003:q4": {
  "k": "val",
  "e": "mx(3*0+3,3*6+3)",
  "sigs": [
   {
    "id": "MISC-MUTABAYINA-COEF-LOST",
    "via": "6+3",
    "v": "9"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-004:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "76*x",
    "r": "8",
    "sol": "2"
   },
   {
    "t": "eqsol",
    "l": "40",
    "r": "8*x+36",
    "sol": "2"
   },
   {
    "t": "eqsol",
    "l": "40*x",
    "r": "36*x+8",
    "sol": "2"
   },
   {
    "t": "eqsol",
    "l": "40*x+8",
    "r": "36*x",
    "sol": "2"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-004:q2": {
  "k": "solve",
  "l": "40*x",
  "r": "36*x+8",
  "sigs": [
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "8-0",
    "v": "8"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-004:q3": {
  "k": "val",
  "e": "40*2+0"
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-004:q4": {
  "k": "val",
  "e": "6*hi(6.1,0.1)+0",
  "sigs": [
   {
    "id": "MISC-TADWIR-CENTER-EXACT",
    "via": "6*6.1+0",
    "v": "36.6"
   },
   {
    "id": "MISC-TADWIR-TRUNC",
    "via": "6*(6.1+0.1)+0",
    "v": "37.2"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-005:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "4*x+8",
    "r": "100*x",
    "sol": "12"
   },
   {
    "t": "eqsol",
    "l": "8*x+4",
    "r": "100",
    "sol": "12"
   },
   {
    "t": "eqsol",
    "l": "8*x",
    "r": "104",
    "sol": "12"
   },
   {
    "t": "eqsol",
    "l": "8*x+100",
    "r": "4",
    "sol": "12"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-005:q2": {
  "k": "solve",
  "l": "8*x+4",
  "r": "100",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(100+4)/(8-0)",
    "v": "13"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "100-4",
    "v": "96"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-005:q3": {
  "k": "val",
  "e": "8*12+4",
  "sigs": [
   {
    "id": "MISC-MUADALA-NO-CHECK",
    "via": "8*12-4",
    "v": "92"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-005:q4": {
  "k": "val",
  "e": "fl((266-80)/12,1)",
  "sigs": [
   {
    "id": "MISC-MUADALA-SOLUTION-CONTEXT",
    "via": "ce((266-80)/12,1)",
    "v": "16"
   },
   {
    "id": "MISC-MUADALA-TRANSLATE",
    "via": "fl(266/12,1)",
    "v": "22"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-006:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "45*x",
    "r": "42*x-3",
    "sol": "1"
   },
   {
    "t": "eqsol",
    "l": "87*x",
    "r": "3",
    "sol": "1"
   },
   {
    "t": "eqsol",
    "l": "45*x+3",
    "r": "42*x",
    "sol": "1"
   },
   {
    "t": "eqsol",
    "l": "45*x",
    "r": "42*x+3",
    "sol": "1"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-006:q2": {
  "k": "solve",
  "l": "45*x",
  "r": "42*x+3",
  "sigs": [
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "3-0",
    "v": "3"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-006:q3": {
  "k": "val",
  "e": "45*1+0"
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-006:q4": {
  "k": "mc",
  "opts": [
   {
    "t": "undecided",
    "lo": "12*lo(2.3,0.1)",
    "hi": "12*hi(2.3,0.1)",
    "c": "32.2"
   },
   {
    "t": "always",
    "lo": "12*lo(2.3,0.1)",
    "hi": "12*hi(2.3,0.1)",
    "c": "32.2",
    "op": ">"
   },
   {
    "t": "always",
    "lo": "12*lo(2.3,0.1)",
    "hi": "12*hi(2.3,0.1)",
    "c": "32.2",
    "op": "<"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-007:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "60*x+9",
    "r": "105*x+6",
    "sol": "15"
   },
   {
    "t": "eqsol",
    "l": "15*x",
    "r": "165",
    "sol": "15"
   },
   {
    "t": "eqsol",
    "l": "9*x+60",
    "r": "6*x+105",
    "sol": "15"
   },
   {
    "t": "eqsol",
    "l": "9*x+105",
    "r": "6*x+60",
    "sol": "15"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-007:q2": {
  "k": "solve",
  "l": "9*x+60",
  "r": "6*x+105",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(105+60)/(9-6)",
    "v": "55"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "105-60",
    "v": "45"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-007:q3": {
  "k": "val",
  "e": "9*15+60",
  "sigs": [
   {
    "id": "MISC-MUADALA-NO-CHECK",
    "via": "9*15-60",
    "v": "75"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-007:q4": {
  "k": "val",
  "e": "mn(5*(-4)+1,5*(-1)+1)",
  "sigs": [
   {
    "id": "MISC-MUTABAYINA-COEF-LOST",
    "via": "(-4)+1",
    "v": "-3"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-008:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "10*x+10",
    "r": "110*x",
    "sol": "10"
   },
   {
    "t": "eqsol",
    "l": "10*x+10",
    "r": "110",
    "sol": "10"
   },
   {
    "t": "eqsol",
    "l": "10*x+110",
    "r": "10",
    "sol": "10"
   },
   {
    "t": "eqsol",
    "l": "10*x",
    "r": "120",
    "sol": "10"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-008:q2": {
  "k": "solve",
  "l": "10*x+10",
  "r": "110",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(110+10)/(10-0)",
    "v": "12"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "110-10",
    "v": "100"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-008:q3": {
  "k": "val",
  "e": "10*10+10",
  "sigs": [
   {
    "id": "MISC-MUADALA-NO-CHECK",
    "via": "10*10-10",
    "v": "90"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-008:q4": {
  "k": "val",
  "e": "2*hi(4.2,0.1)+10",
  "sigs": [
   {
    "id": "MISC-TADWIR-CENTER-EXACT",
    "via": "2*4.2+10",
    "v": "18.4"
   },
   {
    "id": "MISC-TADWIR-TRUNC",
    "via": "2*(4.2+0.1)+10",
    "v": "18.6"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-009:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "40",
    "r": "x+38",
    "sol": "0.5"
   },
   {
    "t": "eqsol",
    "l": "78*x",
    "r": "1",
    "sol": "0.5"
   },
   {
    "t": "eqsol",
    "l": "40*x+1",
    "r": "38*x",
    "sol": "0.5"
   },
   {
    "t": "eqsol",
    "l": "40*x",
    "r": "38*x+1",
    "sol": "0.5"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-009:q2": {
  "k": "solve",
  "l": "40*x",
  "r": "38*x+1",
  "sigs": [
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "1-0",
    "v": "1"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-009:q3": {
  "k": "val",
  "e": "40*0.5+0"
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-009:q4": {
  "k": "val",
  "e": "fl((323-30)/45,1)",
  "sigs": [
   {
    "id": "MISC-MUADALA-SOLUTION-CONTEXT",
    "via": "ce((323-30)/45,1)",
    "v": "7"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-010:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "80*x+3",
    "r": "50*x+6",
    "sol": "10"
   },
   {
    "t": "eqsol",
    "l": "3*x+50",
    "r": "6*x+80",
    "sol": "10"
   },
   {
    "t": "eqsol",
    "l": "3*x+80",
    "r": "6*x+50",
    "sol": "10"
   },
   {
    "t": "eqsol",
    "l": "9*x",
    "r": "130",
    "sol": "10"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-010:q2": {
  "k": "solve",
  "l": "3*x+80",
  "r": "6*x+50",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(50+80)/(3-6)",
    "v": "-130/3"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "50-80",
    "v": "-30"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-010:q3": {
  "k": "val",
  "e": "3*10+80",
  "sigs": [
   {
    "id": "MISC-MUADALA-NO-CHECK",
    "via": "3*10-80",
    "v": "-50"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l4-010:q4": {
  "k": "mc",
  "opts": [
   {
    "t": "undecided",
    "lo": "12*lo(2.3,0.1)",
    "hi": "12*hi(2.3,0.1)",
    "c": "24"
   },
   {
    "t": "always",
    "lo": "12*lo(2.3,0.1)",
    "hi": "12*hi(2.3,0.1)",
    "c": "24",
    "op": "<"
   },
   {
    "t": "always",
    "lo": "12*lo(2.3,0.1)",
    "hi": "12*hi(2.3,0.1)",
    "c": "24",
    "op": ">"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-001:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "9*x+40",
    "r": "7*x+64",
    "sol": "12"
   },
   {
    "t": "eqsol",
    "l": "40*x+9",
    "r": "64*x+7",
    "sol": "12"
   },
   {
    "t": "eqsol",
    "l": "9*x+64",
    "r": "7*x+40",
    "sol": "12"
   },
   {
    "t": "eqsol",
    "l": "16*x",
    "r": "104",
    "sol": "12"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-001:q2": {
  "k": "solve",
  "l": "9*x+40",
  "r": "7*x+64",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(64+40)/(9-7)",
    "v": "52"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "64-40",
    "v": "24"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-001:q3": {
  "k": "val",
  "e": "9*12+40",
  "sigs": [
   {
    "id": "MISC-MUADALA-NO-CHECK",
    "via": "9*12-40",
    "v": "68"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-001:q4": {
  "k": "val",
  "e": "fl((599-200)/25,1)",
  "sigs": [
   {
    "id": "MISC-MUADALA-SOLUTION-CONTEXT",
    "via": "ce((599-200)/25,1)",
    "v": "16"
   },
   {
    "id": "MISC-MUADALA-TRANSLATE",
    "via": "fl(599/25,1)",
    "v": "23"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-001:q5": {
  "k": "mc",
  "opts": [
   {
    "t": "always",
    "lo": "15*lo(5.1,0.1)",
    "hi": "15*hi(5.1,0.1)",
    "c": "81.25",
    "op": ">"
   },
   {
    "t": "always",
    "lo": "15*lo(5.1,0.1)",
    "hi": "15*hi(5.1,0.1)",
    "c": "81.25",
    "op": "<"
   },
   {
    "t": "undecided",
    "lo": "15*lo(5.1,0.1)",
    "hi": "15*hi(5.1,0.1)",
    "c": "81.25"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-002:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "4*x+120",
    "r": "6*x+112",
    "sol": "4"
   },
   {
    "t": "eqsol",
    "l": "4*x+112",
    "r": "6*x+120",
    "sol": "4"
   },
   {
    "t": "eqsol",
    "l": "10*x",
    "r": "232",
    "sol": "4"
   },
   {
    "t": "eqsol",
    "l": "120*x+4",
    "r": "112*x+6",
    "sol": "4"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-002:q2": {
  "k": "solve",
  "l": "4*x+120",
  "r": "6*x+112",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(112+120)/(4-6)",
    "v": "-116"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "112-120",
    "v": "-8"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-002:q3": {
  "k": "val",
  "e": "4*4+120",
  "sigs": [
   {
    "id": "MISC-MUADALA-NO-CHECK",
    "via": "4*4-120",
    "v": "-104"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-002:q4": {
  "k": "val",
  "e": "4*hi(2.4,0.1)+2",
  "sigs": [
   {
    "id": "MISC-TADWIR-CENTER-EXACT",
    "via": "4*2.4+2",
    "v": "11.6"
   },
   {
    "id": "MISC-TADWIR-TRUNC",
    "via": "4*(2.4+0.1)+2",
    "v": "12"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-002:q5": {
  "k": "mc",
  "opts": [
   {
    "t": "always",
    "lo": "12*lo(2.6,0.1)",
    "hi": "12*hi(2.6,0.1)",
    "c": "34.8",
    "op": ">"
   },
   {
    "t": "undecided",
    "lo": "12*lo(2.6,0.1)",
    "hi": "12*hi(2.6,0.1)",
    "c": "34.8"
   },
   {
    "t": "always",
    "lo": "12*lo(2.6,0.1)",
    "hi": "12*hi(2.6,0.1)",
    "c": "34.8",
    "op": "<"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-003:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "x+33",
    "r": "2*x+26",
    "sol": "7"
   },
   {
    "t": "eqsol",
    "l": "3*x",
    "r": "59",
    "sol": "7"
   },
   {
    "t": "eqsol",
    "l": "33*x+1",
    "r": "26*x+2",
    "sol": "7"
   },
   {
    "t": "eqsol",
    "l": "x+26",
    "r": "2*x+33",
    "sol": "7"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-003:q2": {
  "k": "solve",
  "l": "x+33",
  "r": "2*x+26",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(26+33)/(1-2)",
    "v": "-59"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "26-33",
    "v": "-7"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-003:q3": {
  "k": "val",
  "e": "1*7+33",
  "sigs": [
   {
    "id": "MISC-MUADALA-NO-CHECK",
    "via": "1*7-33",
    "v": "-26"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-003:q4": {
  "k": "val",
  "e": "fl((529-200)/30,1)",
  "sigs": [
   {
    "id": "MISC-MUADALA-SOLUTION-CONTEXT",
    "via": "ce((529-200)/30,1)",
    "v": "11"
   },
   {
    "id": "MISC-MUADALA-TRANSLATE",
    "via": "fl(529/30,1)",
    "v": "17"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-003:q5": {
  "k": "mc",
  "opts": [
   {
    "t": "always",
    "lo": "10*lo(3.5,0.1)",
    "hi": "10*hi(3.5,0.1)",
    "c": "35.3",
    "op": "<"
   },
   {
    "t": "always",
    "lo": "10*lo(3.5,0.1)",
    "hi": "10*hi(3.5,0.1)",
    "c": "35.3",
    "op": ">"
   },
   {
    "t": "undecided",
    "lo": "10*lo(3.5,0.1)",
    "hi": "10*hi(3.5,0.1)",
    "c": "35.3"
   },
   {
    "t": "never",
    "lo": "10*lo(3.5,0.1)",
    "hi": "10*hi(3.5,0.1)",
    "c": "35.3"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-004:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "36*x",
    "r": "32*x+4",
    "sol": "1"
   },
   {
    "t": "eqsol",
    "l": "36*x+4",
    "r": "32*x",
    "sol": "1"
   },
   {
    "t": "eqsol",
    "l": "36*x",
    "r": "32*x-4",
    "sol": "1"
   },
   {
    "t": "eqsol",
    "l": "68*x",
    "r": "4",
    "sol": "1"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-004:q2": {
  "k": "solve",
  "l": "36*x",
  "r": "32*x+4",
  "sigs": [
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "4-0",
    "v": "4"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-004:q3": {
  "k": "val",
  "e": "36*1+0"
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-004:q4": {
  "k": "val",
  "e": "2*lo(2.4,0.1)+2",
  "sigs": [
   {
    "id": "MISC-TADWIR-CENTER-EXACT",
    "via": "2*2.4+2",
    "v": "6.8"
   },
   {
    "id": "MISC-TADWIR-WIDTH",
    "via": "2*(2.4-0.1)+2",
    "v": "6.6"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-004:q5": {
  "k": "mc",
  "opts": [
   {
    "t": "always",
    "lo": "10*lo(2.5,0.1)",
    "hi": "10*hi(2.5,0.1)",
    "c": "27.5",
    "op": "<"
   },
   {
    "t": "always",
    "lo": "10*lo(2.5,0.1)",
    "hi": "10*hi(2.5,0.1)",
    "c": "27.5",
    "op": ">"
   },
   {
    "t": "undecided",
    "lo": "10*lo(2.5,0.1)",
    "hi": "10*hi(2.5,0.1)",
    "c": "27.5"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-005:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "8*x+2",
    "r": "26",
    "sol": "3"
   },
   {
    "t": "eqsol",
    "l": "8*x+26",
    "r": "2",
    "sol": "3"
   },
   {
    "t": "eqsol",
    "l": "8*x",
    "r": "28",
    "sol": "3"
   },
   {
    "t": "eqsol",
    "l": "2*x+8",
    "r": "26*x",
    "sol": "3"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-005:q2": {
  "k": "solve",
  "l": "8*x+2",
  "r": "26",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(26+2)/(8-0)",
    "v": "3.5"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "26-2",
    "v": "24"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-005:q3": {
  "k": "val",
  "e": "8*3+2",
  "sigs": [
   {
    "id": "MISC-MUADALA-NO-CHECK",
    "via": "8*3-2",
    "v": "22"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-005:q4": {
  "k": "val",
  "e": "fl((158-80)/15,1)",
  "sigs": [
   {
    "id": "MISC-MUADALA-SOLUTION-CONTEXT",
    "via": "ce((158-80)/15,1)",
    "v": "6"
   },
   {
    "id": "MISC-MUADALA-TRANSLATE",
    "via": "fl(158/15,1)",
    "v": "10"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-005:q5": {
  "k": "mc",
  "opts": [
   {
    "t": "undecided",
    "lo": "8*lo(3.1,0.1)",
    "hi": "8*hi(3.1,0.1)",
    "c": "23.4"
   },
   {
    "t": "always",
    "lo": "8*lo(3.1,0.1)",
    "hi": "8*hi(3.1,0.1)",
    "c": "23.4",
    "op": "<"
   },
   {
    "t": "always",
    "lo": "8*lo(3.1,0.1)",
    "hi": "8*hi(3.1,0.1)",
    "c": "23.4",
    "op": ">"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-006:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "7*x+130",
    "r": "5*x+80",
    "sol": "25"
   },
   {
    "t": "eqsol",
    "l": "80*x+7",
    "r": "130*x+5",
    "sol": "25"
   },
   {
    "t": "eqsol",
    "l": "7*x+80",
    "r": "5*x+130",
    "sol": "25"
   },
   {
    "t": "eqsol",
    "l": "12*x",
    "r": "210",
    "sol": "25"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-006:q2": {
  "k": "solve",
  "l": "7*x+80",
  "r": "5*x+130",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(130+80)/(7-5)",
    "v": "105"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "130-80",
    "v": "50"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-006:q3": {
  "k": "val",
  "e": "7*25+80",
  "sigs": [
   {
    "id": "MISC-MUADALA-NO-CHECK",
    "via": "7*25-80",
    "v": "95"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-006:q4": {
  "k": "val",
  "e": "2*lo(6.4,0.1)+5",
  "sigs": [
   {
    "id": "MISC-TADWIR-CENTER-EXACT",
    "via": "2*6.4+5",
    "v": "17.8"
   },
   {
    "id": "MISC-TADWIR-WIDTH",
    "via": "2*(6.4-0.1)+5",
    "v": "17.6"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-006:q5": {
  "k": "mc",
  "opts": [
   {
    "t": "always",
    "lo": "15*lo(2.7,0.1)",
    "hi": "15*hi(2.7,0.1)",
    "c": "40.9",
    "op": ">"
   },
   {
    "t": "never",
    "lo": "15*lo(2.7,0.1)",
    "hi": "15*hi(2.7,0.1)",
    "c": "40.9"
   },
   {
    "t": "undecided",
    "lo": "15*lo(2.7,0.1)",
    "hi": "15*hi(2.7,0.1)",
    "c": "40.9"
   },
   {
    "t": "always",
    "lo": "15*lo(2.7,0.1)",
    "hi": "15*hi(2.7,0.1)",
    "c": "40.9",
    "op": "<"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-007:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "34",
    "r": "10*x+30",
    "sol": "2.5"
   },
   {
    "t": "eqsol",
    "l": "34*x",
    "r": "30*x+10",
    "sol": "2.5"
   },
   {
    "t": "eqsol",
    "l": "64*x",
    "r": "10",
    "sol": "2.5"
   },
   {
    "t": "eqsol",
    "l": "34*x+10",
    "r": "30*x",
    "sol": "2.5"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-007:q2": {
  "k": "solve",
  "l": "34*x",
  "r": "30*x+10",
  "sigs": [
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "10-0",
    "v": "10"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-007:q3": {
  "k": "val",
  "e": "34*2.5+0"
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-007:q4": {
  "k": "val",
  "e": "fl((677-340)/45,1)",
  "sigs": [
   {
    "id": "MISC-MUADALA-SOLUTION-CONTEXT",
    "via": "ce((677-340)/45,1)",
    "v": "8"
   },
   {
    "id": "MISC-MUADALA-TRANSLATE",
    "via": "fl(677/45,1)",
    "v": "15"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-007:q5": {
  "k": "mc",
  "opts": [
   {
    "t": "undecided",
    "lo": "10*lo(4.2,0.1)",
    "hi": "10*hi(4.2,0.1)",
    "c": "45.5"
   },
   {
    "t": "always",
    "lo": "10*lo(4.2,0.1)",
    "hi": "10*hi(4.2,0.1)",
    "c": "45.5",
    "op": ">"
   },
   {
    "t": "always",
    "lo": "10*lo(4.2,0.1)",
    "hi": "10*hi(4.2,0.1)",
    "c": "45.5",
    "op": "<"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-008:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "90*x",
    "r": "3",
    "sol": "0.5"
   },
   {
    "t": "eqsol",
    "l": "48",
    "r": "3*x+42",
    "sol": "0.5"
   },
   {
    "t": "eqsol",
    "l": "48*x+3",
    "r": "42*x",
    "sol": "0.5"
   },
   {
    "t": "eqsol",
    "l": "48*x",
    "r": "42*x+3",
    "sol": "0.5"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-008:q2": {
  "k": "solve",
  "l": "48*x",
  "r": "42*x+3",
  "sigs": [
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "3-0",
    "v": "3"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-008:q3": {
  "k": "val",
  "e": "48*3/(48-42)",
  "sigs": [
   {
    "id": "MISC-MUADALA-NO-CHECK",
    "via": "48*3",
    "v": "144"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-008:q4": {
  "k": "val",
  "e": "fl((216-80)/15,1)",
  "sigs": [
   {
    "id": "MISC-MUADALA-SOLUTION-CONTEXT",
    "via": "ce((216-80)/15,1)",
    "v": "10"
   },
   {
    "id": "MISC-MUADALA-TRANSLATE",
    "via": "fl(216/15,1)",
    "v": "14"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-008:q5": {
  "k": "mc",
  "opts": [
   {
    "t": "always",
    "lo": "10*lo(4.9,0.1)",
    "hi": "10*hi(4.9,0.1)",
    "c": "49.3",
    "op": ">"
   },
   {
    "t": "always",
    "lo": "10*lo(4.9,0.1)",
    "hi": "10*hi(4.9,0.1)",
    "c": "49.3",
    "op": "<"
   },
   {
    "t": "undecided",
    "lo": "10*lo(4.9,0.1)",
    "hi": "10*hi(4.9,0.1)",
    "c": "49.3"
   },
   {
    "t": "never",
    "lo": "10*lo(4.9,0.1)",
    "hi": "10*hi(4.9,0.1)",
    "c": "49.3"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-009:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "23*x",
    "r": "185",
    "sol": "25"
   },
   {
    "t": "eqsol",
    "l": "14*x+30",
    "r": "9*x+155",
    "sol": "25"
   },
   {
    "t": "eqsol",
    "l": "30*x+14",
    "r": "155*x+9",
    "sol": "25"
   },
   {
    "t": "eqsol",
    "l": "14*x+155",
    "r": "9*x+30",
    "sol": "25"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-009:q2": {
  "k": "solve",
  "l": "14*x+30",
  "r": "9*x+155",
  "sigs": [
   {
    "id": "MISC-MUADALA-SIGN-KEPT",
    "via": "(155+30)/(14-9)",
    "v": "37"
   },
   {
    "id": "MISC-MUADALA-PARTIAL-SOLVE",
    "via": "155-30",
    "v": "125"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-009:q3": {
  "k": "val",
  "e": "14*25+30",
  "sigs": [
   {
    "id": "MISC-MUADALA-NO-CHECK",
    "via": "14*25-30",
    "v": "320"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-009:q4": {
  "k": "val",
  "e": "fl((617-340)/30,1)",
  "sigs": [
   {
    "id": "MISC-MUADALA-SOLUTION-CONTEXT",
    "via": "ce((617-340)/30,1)",
    "v": "10"
   },
   {
    "id": "MISC-MUADALA-TRANSLATE",
    "via": "fl(617/30,1)",
    "v": "20"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-009:q5": {
  "k": "val",
  "e": "2*hi(4.2,0.1)+5",
  "sigs": [
   {
    "id": "MISC-TADWIR-CENTER-EXACT",
    "via": "2*4.2+5",
    "v": "13.4"
   },
   {
    "id": "MISC-TADWIR-TRUNC",
    "via": "2*(4.2+0.1)+5",
    "v": "13.6"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-010:q1": {
  "k": "mc",
  "opts": [
   {
    "t": "eqsol",
    "l": "x+4*x+10*x/3",
    "r": "31000",
    "sol": "20000"
   },
   {
    "t": "eqsol",
    "l": "x/4+3*x/10",
    "r": "31000",
    "sol": "20000"
   },
   {
    "t": "eqsol",
    "l": "x+x/4+3*x/10",
    "r": "31000",
    "sol": "20000"
   },
   {
    "t": "eqsol",
    "l": "x*(1/4)*(3/10)",
    "r": "31000",
    "sol": "20000"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-010:q2": {
  "k": "val",
  "e": "1+1/4+3/10"
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-010:q3": {
  "k": "solve",
  "l": "x+x/4+3*x/10",
  "r": "31000",
  "sigs": [
   {
    "id": "MISC-MUADALA-DIV-WRONG",
    "via": "31000*(1+1/4+3/10)",
    "v": "48050"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-010:q4": {
  "k": "val",
  "e": "3*(31000/(1+1/4+3/10))/10",
  "sigs": [
   {
    "id": "MISC-MUADALA-TRANSLATE",
    "via": "(31000/(1+1/4+3/10))/4",
    "v": "5000"
   }
  ]
 },
 "ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-l5-010:q5": {
  "k": "val",
  "e": "rnd(29000/(1+1/4+3/10),1)",
  "sigs": [
   {
    "id": "MISC-TADWIR-TRUNC",
    "via": "fl(29000/(1+1/4+3/10),1)",
    "v": "18709"
   }
  ]
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
  eq(o) { return this.n === o.n && this.d === o.d; }
  cmp(o) { const l = this.n * o.d; const r = o.n * this.d; return l < r ? -1 : l > r ? 1 : 0; }
  isZero() { return this.n === 0n; }
  floor() { let q = this.n / this.d; if (this.n % this.d !== 0n && this.n < 0n) q -= 1n; return q; }
  toString() { return this.d === 1n ? String(this.n) : `${this.n}/${this.d}`; }
}
const ZERO = new Q(0n); const ONE = new Q(1n); const HALF = new Q(1n, 2n);
const num = (s) => { const [i, f = ''] = s.split('.'); return new Q(BigInt(i + f), 10n ** BigInt(f.length)); };

/* ── formes affines a·x + b ───────────────────────────────────────────────── */
class Lin {
  constructor(a, b) { this.a = a; this.b = b; }
  isConst() { return this.a.isZero(); }
  add(o) { return new Lin(this.a.add(o.a), this.b.add(o.b)); }
  sub(o) { return new Lin(this.a.sub(o.a), this.b.sub(o.b)); }
  neg() { return new Lin(this.a.neg(), this.b.neg()); }
  mul(o) { if (this.isConst()) return new Lin(o.a.mul(this.b), o.b.mul(this.b)); if (o.isConst()) return new Lin(this.a.mul(o.b), this.b.mul(o.b)); throw new Error('produit de deux termes en x'); }
  div(o) { if (!o.isConst()) throw new Error('division par un terme en x'); return new Lin(this.a.div(o.b), this.b.div(o.b)); }
  at(v) { return this.a.mul(v).add(this.b); }
  value() { if (!this.isConst()) throw new Error('x reste dans une valeur constante'); return this.b; }
}
const cst = (q) => new Lin(ZERO, q);
const step = (p) => { if (p.isZero() || p.cmp(ZERO) < 0) throw new Error('pas invalide'); return p; };
const floorTo = (v, p) => new Q(v.div(step(p)).floor()).mul(p);
const ceilTo = (v, p) => { const f = floorTo(v, p); return f.eq(v) ? f : f.add(p); };
const roundTo = (v, p) => floorTo(v.add(p.mul(HALF)), p); // demi supérieur
const FUN = {
  lo: ([r, p]) => r.sub(p.mul(HALF)), hi: ([r, p]) => r.add(p.mul(HALF)),
  rnd: ([v, p]) => roundTo(v, p), fl: ([v, p]) => floorTo(v, p), ce: ([v, p]) => ceilTo(v, p),
  mn: ([a, b]) => (a.cmp(b) <= 0 ? a : b), mx: ([a, b]) => (a.cmp(b) >= 0 ? a : b),
};

/** expr → forme affine. */
function parse(src) {
  const t = String(src).replace(/\s+/g, ''); let i = 0;
  const peek = () => t[i];
  const expr = () => { let v = term(); while (peek() === '+' || peek() === '-') { const op = t[i++]; const w = term(); v = op === '+' ? v.add(w) : v.sub(w); } return v; };
  const term = () => { let v = unary(); while (peek() === '*' || peek() === '/') { const op = t[i++]; const w = unary(); v = op === '*' ? v.mul(w) : v.div(w); } return v; };
  const unary = () => { if (peek() === '-') { i++; return unary().neg(); } return primary(); };
  const primary = () => {
    if (peek() === '(') { i++; const v = expr(); if (t[i++] !== ')') throw new Error(`« ) » attendu dans ${src}`); return v; }
    if (peek() === 'x') { i++; return new Lin(ONE, ZERO); }
    const f = /^[a-z]{2,3}(?=\()/.exec(t.slice(i));
    if (f && FUN[f[0]]) {
      i += f[0].length; if (t[i++] !== '(') throw new Error(`« ( » attendu après ${f[0]} dans ${src}`);
      const args = [expr().value()]; while (peek() === ',') { i++; args.push(expr().value()); }
      if (t[i++] !== ')') throw new Error(`« ) » attendu dans ${src}`);
      return cst(FUN[f[0]](args));
    }
    const m = /^\d+(\.\d+)?/.exec(t.slice(i)); if (!m) throw new Error(`lecture impossible à ${i} dans ${src}`); i += m[0].length; return cst(num(m[0]));
  };
  const v = expr(); if (i !== t.length) throw new Error(`reste « ${t.slice(i)} » dans ${src}`); return v;
}
const V = (s) => parse(s).value();
/** l = r en x : l'unique solution, ou une erreur si x disparaît. */
function solveEq(l, r) {
  const d = parse(l).sub(parse(r)); if (d.a.isZero()) throw new Error(`l'équation ${l} = ${r} n'a pas de solution unique`);
  return d.b.neg().div(d.a);
}
const parseQ = (str) => { let t = String(str); const neg = t.startsWith('-'); t = t.replace('-', ''); const q = t.includes('/') ? new Q(...t.split('/').map(BigInt)) : num(t); return neg ? q.neg() : q; };
const letter = (k) => C('ABCDEF'[k]);

/* ── lecture du banc ──────────────────────────────────────────────────────── */
const here = dirname(fileURLToPath(import.meta.url));
const BANK = join(here, '..', '..', 'content/practice/3am/wadiya-idmajiya-musawiyat-mutabayinat');
const sheets = {};
for (const lvl of readdirSync(BANK).filter((d) => d.startsWith('level-'))) {
  for (const f of readdirSync(join(BANK, lvl)).filter((x) => x.endsWith('.json'))) {
    const ex = JSON.parse(readFileSync(join(BANK, lvl, f), 'utf8')); sheets[ex.id] = ex;
  }
}
const plain = (s) => String(s).replace(/\{,\}/g, '.').replace(/\\[,; ]/g, '').replace(/[$\\{}\s]/g, '');
const sheetText = (ex) => plain([ex.statement.content, ...ex.questions.flatMap((q) => [q.statement, ...(q.choices ?? []).map((c) => c.content)])].join(' '));
const find = (key) => { const [id, qid] = key.split(':'); const ex = sheets[id]; return { ex, q: ex.questions.find((x) => x.id === qid) }; };
/** Tous les littéraux de 2 chiffres ou plus (ou décimaux) d'une expression doivent figurer dans la feuille : la spec est RETAPÉE de l'énoncé. */
const literalsOf = (e) => (String(e).match(/\d+(\.\d+)?/g) ?? []).filter((l) => l.length >= 2 || l.includes('.'));
const EXPR_FIELDS = ['e', 'l', 'r', 'bl', 'br', 'lo', 'hi', 'c', 'v', 'claim', 'truth'];
const exprsOf = (o) => EXPR_FIELDS.flatMap((k) => (o[k] == null ? [] : Array.isArray(o[k]) ? o[k].slice(0, 2) : [o[k]])).filter((s) => typeof s === 'string');

/* ── ce que dit chaque option d'un QCM ───────────────────────────────────── */
const OPS = { '<': (c) => c < 0, '<=': (c) => c <= 0, '>': (c) => c > 0, '>=': (c) => c >= 0, '=': (c) => c === 0 };
function judge(o) {
  switch (o.t) {
    case 'sat': { const v = parseQ(o.v); return parse(o.l).at(v).eq(parse(o.r).at(v)); }
    case 'holds': { const x0 = solveEq(o.bl, o.br); return parse(o.l).at(x0).eq(parse(o.r).at(x0)); }
    case 'eqsol': { const d = parse(o.l).sub(parse(o.r)); if (d.a.isZero()) return false; return d.b.neg().div(d.a).eq(parseQ(o.sol)); }
    case 'val': return V(o.claim).eq(V(o.truth));
    case 'br': { const [cl, ch, cli, chi] = o.claim; const [tl, th, tli, thi] = o.truth; return V(cl).eq(V(tl)) && V(ch).eq(V(th)) && cli === tli && chi === thi; }
    case 'law': {
      for (let k = -80; k <= 80; k++) {
        const v = new Q(BigInt(k), 2n);
        const holds = (list) => list.every(([e, op, c]) => OPS[op](parse(e).at(v).cmp(V(c))));
        if (holds(o.hyp) && !holds(o.concl)) return false;
      }
      return true;
    }
    case 'always': {
      const lo = V(o.lo); const hi = V(o.hi); const c = V(o.c);
      return o.op === '<' || o.op === '<=' ? hi.cmp(c) <= 0 : o.op === '>' ? lo.cmp(c) > 0 : lo.cmp(c) >= 0;
    }
    case 'undecided': { const lo = V(o.lo); const hi = V(o.hi); const c = V(o.c); return lo.cmp(c) <= 0 && c.cmp(hi) < 0; }
    case 'never': { const lo = V(o.lo); const hi = V(o.hi); const c = V(o.c); if (!(lo.cmp(c) <= 0 && c.cmp(hi) < 0)) throw new Error('option « never » dans une situation décidée'); return false; }
    default: throw new Error(`option inconnue ${o.t}`);
  }
}

function answerOf(key, sp) {
  switch (sp.k) {
    case 'val': return R(V(sp.e).toString());
    case 'solve': return R(solveEq(sp.l, sp.r).toString());
    case 'mc': {
      const hits = sp.opts.map((o, i) => (judge(o) ? i : -1)).filter((i) => i >= 0);
      if (hits.length !== 1) throw new Error(`QCM ${key} : ${hits.length} options justes`); return letter(hits[0]);
    }
    default: throw new Error(`spec inconnue ${sp.k}`);
  }
}
const ERRORS = [];
export const ORACLE = Object.fromEntries(Object.entries(SPEC).map(([key, sp]) => {
  try { return [key, answerOf(key, sp)]; } catch (err) { ERRORS.push(`${key} : ${err.message}`); return [key, {}]; }
}));

/* ── l'audit : littéraux, signatures, distracteurs ─────────────────────── */
export function audit(bank) {
  const problems = [...ERRORS];
  for (const { key, q } of bank) {
    const sp = SPEC[key]; if (!sp) { if (q.answerType !== 'selfCheck') problems.push(`${key} : pas de spec`); continue; }
    try {
      const { ex } = find(key); const hay = sheetText(ex);
      const sources = sp.k === 'mc' ? sp.opts.flatMap(exprsOf) : exprsOf(sp);
      for (const e of sources) for (const l of literalsOf(e)) if (!hay.includes(plain(l))) problems.push(`${key} : le littéral ${l} de « ${e} » ne figure pas dans la feuille`);
      if (q.answerType === 'rational') {
        const keyV = parseQ(q.expectedAnswer);
        const declared = new Map((q.misconceptionSignatures ?? []).map((s) => [s.id + '|' + s.value, s]));
        for (const s of sp.sigs ?? []) {
          const via = V(s.via); const dv = parseQ(s.v);
          if (!via.eq(dv)) problems.push(`${key} : la signature ${s.id} (${s.via}) vaut ${via}, pas ${s.v}`);
          if (via.eq(keyV)) problems.push(`${key} : la signature ${s.id} vaut la clé`);
          if (!declared.has(s.id + '|' + s.v)) problems.push(`${key} : la signature ${s.id} = ${s.v} n'est pas déclarée dans la feuille`);
        }
        for (const s of q.misconceptionSignatures ?? []) if (!(sp.sigs ?? []).some((x) => x.id === s.id && parseQ(x.v).eq(parseQ(s.value)))) problems.push(`${key} : la signature ${s.id} de la feuille n'est pas recalculée`);
      } else if (q.answerType === 'choice') {
        const right = q.choices.filter((c) => c.isCorrect);
        if (right.length !== 1) problems.push(`${key} : ${right.length} options marquées justes`);
        if (right[0] && ORACLE[key].choiceId !== right[0].id) problems.push(`${key} : l'oracle choisit ${ORACLE[key].choiceId}, la feuille marque ${right[0].id}`);
        for (const c of q.choices) if (!c.isCorrect && !c.misconceptionId) problems.push(`${key} : l'option ${c.id} fausse n'est pas étiquetée`);
        if (sp.opts.length !== q.choices.length) problems.push(`${key} : ${sp.opts.length} specs pour ${q.choices.length} options`);
      }
    } catch (err) { problems.push(`${key} : ${err.message}`); }
  }
  return problems;
}
