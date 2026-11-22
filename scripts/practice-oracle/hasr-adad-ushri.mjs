// Oracle du banc « hasr-adad-ushri » (حصر عدد عشري موجب, 3AM, 2026-10-26) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل … »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, avec une arithmétique écrite dans ce fichier et
// indépendante de packages/core (jamais decimals.js) : des RATIONNELS exacts en BigInt (numérateur / dénominateur), donc
// les décimaux comme les quotients a/b y sont exacts. Méthode :
//  - une valeur demandée (`rat`) est une expression retapée dans une petite syntaxe (+ − × ÷, parenthèses, π à 50 chiffres,
//    floor / ceil / round(x, k) = approximation par défaut / par excès / ARRONDI AU DEMI SUPÉRIEUR au rang 10^-k, et
//    lastdigit(x, k) = l'arrondi fait sur le DERNIER chiffre écrit au lieu du chiffre suivant) ; les quotients sont obtenus
//    par division euclidienne exacte (le plancher de num·10^k / den), jamais par un flottant ;
//  - chaque QCM est jugé option par option : une option est une AFFIRMATION retapée (chaîne « 2.35<=x<2.45 », encadrement
//    d'un nombre entre ses deux valeurs approchées consécutives `bk`, ou encadrement d'une expression de x à partir d'un
//    intervalle donné `iv`) ; la seule option vraie doit être celle du contenu, toutes les autres doivent être FAUSSES ;
//  - `iv` : l'ensemble { x : round(x, k) = r } est reconstruit par balayage exact d'une grille de pas 10^-(k+2) sur ±2 rangs
//    et comparé à l'intervalle [r − ½·10^-k ; r + ½·10^-k[ (borne basse incluse, borne haute EXCLUE) ; l'image par une
//    expression affine de x est recalculée aux deux bouts (le sens s'inverse si la pente est négative, la rigueur aussi), et
//    l'encadrement proposé doit être EXACT (bouts atteints, rigueur héritée) et vrai sur toute la grille ;
//  - chaque signature de misconception d'une réponse construite est recalculée par la formule de l'erreur (`via`) : elle doit
//    valoir la valeur déclarée et différer de la clé ;
//  - les nombres cités dans les corrigés (`facts`) et les écrans de calculatrice (`screens` : n chiffres significatifs, dernier
//    chiffre ARRONDI comme le fait une calculatrice) sont recalculés à part.
// Les questions selfCheck (« علّل ») n'ont pas de clé et ne figurent pas ici.
import { R, C } from './helpers.mjs';

const DATA = {
 "oracle": {
  "ex-3am-hasr-adad-ushri-l1-001:q1": {
   "k": "mc",
   "opts": [
    {
     "t": "chain",
     "s": "8<=7.83<9"
    },
    {
     "t": "bk",
     "x": "7.83",
     "k": 0,
     "br": "7<=7.83<8"
    },
    {
     "t": "bk",
     "x": "7.83",
     "k": 0,
     "br": "7.8<=7.83<7.9"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-001:q2": {
   "k": "mc",
   "opts": [
    {
     "t": "bk",
     "x": "12.904",
     "k": 0,
     "br": "12<=12.904<13"
    },
    {
     "t": "chain",
     "s": "13<=12.904<14"
    },
    {
     "t": "bk",
     "x": "12.904",
     "k": 0,
     "br": "12.9<=12.904<13"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-001:q3": {
   "k": "mc",
   "opts": [
    {
     "t": "chain",
     "s": "1<=0.67<2"
    },
    {
     "t": "bk",
     "x": "0.67",
     "k": 0,
     "br": "0.6<=0.67<0.7"
    },
    {
     "t": "bk",
     "x": "0.67",
     "k": 0,
     "br": "0<=0.67<1"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-001:q4": {
   "k": "mc",
   "opts": [
    {
     "t": "bk",
     "x": "45.58",
     "k": 0,
     "br": "45<=45.58<46"
    },
    {
     "t": "chain",
     "s": "46<=45.58<47"
    },
    {
     "t": "bk",
     "x": "45.58",
     "k": 0,
     "br": "45.5<=45.58<45.6"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-002:q1": {
   "k": "rat",
   "e": "floor(6.358,1)",
   "sigs": [
    {
     "v": "6.4",
     "via": "ceil(6.358,1)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    },
    {
     "v": "6",
     "via": "floor(6.358,0)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-002:q2": {
   "k": "rat",
   "e": "ceil(6.358,1)",
   "sigs": [
    {
     "v": "6.3",
     "via": "floor(6.358,1)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    },
    {
     "v": "7",
     "via": "ceil(6.358,0)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-002:q3": {
   "k": "rat",
   "e": "floor(14.072,1)",
   "sigs": [
    {
     "v": "14.1",
     "via": "ceil(14.072,1)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-002:q4": {
   "k": "rat",
   "e": "ceil(14.072,1)",
   "sigs": [
    {
     "v": "14",
     "via": "floor(14.072,1)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    },
    {
     "v": "15",
     "via": "ceil(14.072,0)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-003:q1": {
   "k": "rat",
   "e": "floor(2.4137,2)",
   "sigs": [
    {
     "v": "2.42",
     "via": "ceil(2.4137,2)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    },
    {
     "v": "2.4",
     "via": "floor(2.4137,1)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-003:q2": {
   "k": "rat",
   "e": "ceil(2.4137,2)",
   "sigs": [
    {
     "v": "2.41",
     "via": "floor(2.4137,2)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    },
    {
     "v": "2.5",
     "via": "ceil(2.4137,1)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-003:q3": {
   "k": "rat",
   "e": "floor(9.8062,2)",
   "sigs": [
    {
     "v": "9.81",
     "via": "ceil(9.8062,2)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-003:q4": {
   "k": "rat",
   "e": "ceil(9.8062,2)",
   "sigs": [
    {
     "v": "9.8",
     "via": "floor(9.8062,2)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    },
    {
     "v": "9.9",
     "via": "ceil(9.8062,1)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-004:q1": {
   "k": "rat",
   "e": "floor(5.7248,3)",
   "sigs": [
    {
     "v": "5.725",
     "via": "ceil(5.7248,3)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    },
    {
     "v": "5.72",
     "via": "floor(5.7248,2)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-004:q2": {
   "k": "rat",
   "e": "ceil(5.7248,3)",
   "sigs": [
    {
     "v": "5.724",
     "via": "floor(5.7248,3)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    },
    {
     "v": "5.73",
     "via": "ceil(5.7248,2)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-004:q3": {
   "k": "rat",
   "e": "floor(3.9996,3)",
   "sigs": [
    {
     "v": "4",
     "via": "ceil(3.9996,3)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    },
    {
     "v": "3.99",
     "via": "floor(3.9996,2)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-004:q4": {
   "k": "rat",
   "e": "ceil(3.9996,3)",
   "sigs": [
    {
     "v": "3.999",
     "via": "floor(3.9996,3)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-005:q1": {
   "k": "rat",
   "e": "round(8.5,0)",
   "sigs": [
    {
     "v": "8",
     "via": "floor(8.5,0)",
     "id": "MISC-TADWIR-HALF-DOWN"
    },
    {
     "v": "8.5",
     "via": "round(8.5,1)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-005:q2": {
   "k": "rat",
   "e": "round(12.49,0)",
   "sigs": [
    {
     "v": "13",
     "via": "lastdigit(12.49,0)",
     "id": "MISC-TADWIR-LAST-DIGIT"
    },
    {
     "v": "12.5",
     "via": "round(12.49,1)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-005:q3": {
   "k": "rat",
   "e": "round(99.6,0)",
   "sigs": [
    {
     "v": "99",
     "via": "floor(99.6,0)",
     "id": "MISC-TADWIR-TRUNC"
    },
    {
     "v": "99.6",
     "via": "round(99.6,1)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-005:q4": {
   "k": "rat",
   "e": "round(3.07,0)",
   "sigs": [
    {
     "v": "4",
     "via": "lastdigit(3.07,0)",
     "id": "MISC-TADWIR-LAST-DIGIT"
    },
    {
     "v": "3.1",
     "via": "round(3.07,1)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-006:q1": {
   "k": "rat",
   "e": "round(4.25,1)",
   "sigs": [
    {
     "v": "4.2",
     "via": "floor(4.25,1)",
     "id": "MISC-TADWIR-HALF-DOWN"
    },
    {
     "v": "4",
     "via": "round(4.25,0)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-006:q2": {
   "k": "rat",
   "e": "round(7.849,1)",
   "sigs": [
    {
     "v": "7.9",
     "via": "lastdigit(7.849,1)",
     "id": "MISC-TADWIR-LAST-DIGIT"
    },
    {
     "v": "8",
     "via": "round(7.849,0)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-006:q3": {
   "k": "rat",
   "e": "round(0.96,1)",
   "sigs": [
    {
     "v": "0.9",
     "via": "floor(0.96,1)",
     "id": "MISC-TADWIR-TRUNC"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-006:q4": {
   "k": "rat",
   "e": "round(12.0499,1)",
   "sigs": [
    {
     "v": "12.1",
     "via": "lastdigit(12.0499,1)",
     "id": "MISC-TADWIR-LAST-DIGIT"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-007:q1": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "3.409<3.41"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l1-007:q2": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "3.41<3.5"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l1-007:q3": {
   "k": "mc",
   "opts": [
    {
     "t": "chain",
     "s": "3.41<3.409<3.5"
    },
    {
     "t": "chain",
     "s": "3.409<3.41<3.5"
    },
    {
     "t": "chain",
     "s": "3.5<3.41<3.409"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-008:q1": {
   "k": "rat",
   "e": "7/20",
   "sigs": []
  },
  "ex-3am-hasr-adad-ushri-l1-008:q2": {
   "k": "rat",
   "e": "11/16",
   "sigs": []
  },
  "ex-3am-hasr-adad-ushri-l1-008:q3": {
   "k": "rat",
   "e": "4/5",
   "sigs": []
  },
  "ex-3am-hasr-adad-ushri-l1-008:q4": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "7/20<11/16&&11/16<4/5"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l1-009:q1": {
   "k": "rat",
   "e": "floor(26/23,0)",
   "sigs": [
    {
     "v": "2",
     "via": "ceil(26/23,0)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-009:q2": {
   "k": "rat",
   "e": "ceil(23/26,0)",
   "sigs": [
    {
     "v": "0",
     "via": "floor(23/26,0)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-009:q3": {
   "k": "mc",
   "opts": [
    {
     "t": "chain",
     "s": "26/23<1&&1<23/26"
    },
    {
     "t": "chain",
     "s": "1<23/26&&23/26<26/23"
    },
    {
     "t": "chain",
     "s": "23/26<1&&1<26/23"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-010:q1": {
   "k": "mc",
   "opts": [
    {
     "t": "chain",
     "s": "round(127/13,0)=9"
    },
    {
     "t": "chain",
     "s": "round(127/13,0)=10"
    },
    {
     "t": "chain",
     "s": "round(127/13,0)=9.8"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-010:q2": {
   "k": "mc",
   "opts": [
    {
     "t": "chain",
     "s": "round(127/13,1)=10"
    },
    {
     "t": "chain",
     "s": "round(127/13,1)=9.7"
    },
    {
     "t": "chain",
     "s": "round(127/13,1)=9.8"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l1-010:q3": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "127/13=9.769230769"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l2-001:q1": {
   "k": "rat",
   "e": "(-5.2)+(-6.33)-9.06",
   "sigs": []
  },
  "ex-3am-hasr-adad-ushri-l2-001:q2": {
   "k": "rat",
   "e": "(-5.2)*(-3.4)*(-8)",
   "sigs": []
  },
  "ex-3am-hasr-adad-ushri-l2-001:q3": {
   "k": "rat",
   "e": "round((-20.59)/(-141.44),2)",
   "sigs": [
    {
     "v": "0.14",
     "via": "floor((-20.59)/(-141.44),2)",
     "id": "MISC-TADWIR-TRUNC"
    },
    {
     "v": "0.1",
     "via": "round((-20.59)/(-141.44),1)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l2-001:q4": {
   "k": "mc",
   "opts": [
    {
     "t": "bk",
     "x": "20.59/141.44",
     "k": 2,
     "br": "0.1<=20.59/141.44<0.2"
    },
    {
     "t": "bk",
     "x": "20.59/141.44",
     "k": 2,
     "br": "0.14<=20.59/141.44<0.15"
    },
    {
     "t": "bk",
     "x": "20.59/141.44",
     "k": 2,
     "br": "0.15<=20.59/141.44<0.16"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l2-002:q1": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "round(7.264,2)=7.26"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l2-002:q2": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "round(7.255,2)=7.26"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l2-002:q3": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "round(7.265,2)=7.26"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l2-002:q4": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "round(7.2549,2)=7.26"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l2-002:q5": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "7.26",
      "k": 2
     },
     "form": "x",
     "br": "7.255<=x<7.265"
    },
    {
     "t": "iv",
     "given": {
      "r": "7.26",
      "k": 2
     },
     "form": "x",
     "br": "7.26<=x<7.27"
    },
    {
     "t": "iv",
     "given": {
      "r": "7.26",
      "k": 2
     },
     "form": "x",
     "br": "7.25<=x<7.27"
    },
    {
     "t": "iv",
     "given": {
      "r": "7.26",
      "k": 2
     },
     "form": "x",
     "br": "7.255<=x<=7.265"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l2-003:q1": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "round(22.4,0)=23"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l2-003:q2": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "round(22.5,0)=23"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l2-003:q3": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "round(23.49,0)=23"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l2-003:q4": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "round(23.5,0)=23"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l2-003:q5": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "23",
      "k": 0
     },
     "form": "x",
     "br": "22.5<=x<=23.5"
    },
    {
     "t": "iv",
     "given": {
      "r": "23",
      "k": 0
     },
     "form": "x",
     "br": "23<=x<24"
    },
    {
     "t": "iv",
     "given": {
      "r": "23",
      "k": 0
     },
     "form": "x",
     "br": "22.5<=x<23.5"
    },
    {
     "t": "iv",
     "given": {
      "r": "23",
      "k": 0
     },
     "form": "x",
     "br": "22<=x<24"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l2-003:q6": {
   "k": "rat",
   "e": "round(4.729,0)",
   "sigs": [
    {
     "v": "4",
     "via": "floor(4.729,0)",
     "id": "MISC-TADWIR-TRUNC"
    },
    {
     "v": "4.7",
     "via": "round(4.729,1)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l2-003:q7": {
   "k": "rat",
   "e": "round(4.729,1)",
   "sigs": [
    {
     "v": "4.8",
     "via": "lastdigit(4.729,1)",
     "id": "MISC-TADWIR-LAST-DIGIT"
    },
    {
     "v": "5",
     "via": "round(4.729,0)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l2-003:q8": {
   "k": "rat",
   "e": "round(4.729,2)",
   "sigs": [
    {
     "v": "4.72",
     "via": "floor(4.729,2)",
     "id": "MISC-TADWIR-TRUNC"
    },
    {
     "v": "4.7",
     "via": "round(4.729,1)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l2-004:q1": {
   "k": "rat",
   "e": "floor(8.372,2)",
   "sigs": []
  },
  "ex-3am-hasr-adad-ushri-l2-004:q2": {
   "k": "rat",
   "e": "round(8.372,2)",
   "sigs": []
  },
  "ex-3am-hasr-adad-ushri-l2-004:q3": {
   "k": "rat",
   "e": "floor(5.468,2)",
   "sigs": []
  },
  "ex-3am-hasr-adad-ushri-l2-004:q4": {
   "k": "rat",
   "e": "round(5.468,2)",
   "sigs": [
    {
     "v": "5.46",
     "via": "floor(5.468,2)",
     "id": "MISC-TADWIR-TRUNC"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l2-004:q5": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "floor(5.468,2)=round(5.468,2)"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l2-005:q1": {
   "k": "rat",
   "e": "round(4.3649,2)",
   "sigs": [
    {
     "v": "4.37",
     "via": "lastdigit(4.3649,2)",
     "id": "MISC-TADWIR-LAST-DIGIT"
    },
    {
     "v": "4.4",
     "via": "round(4.3649,1)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l2-005:q2": {
   "k": "rat",
   "e": "round(4.3649,3)",
   "sigs": [
    {
     "v": "4.364",
     "via": "floor(4.3649,3)",
     "id": "MISC-TADWIR-TRUNC"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l2-005:q3": {
   "k": "rat",
   "e": "round(round(4.3649,3),2)",
   "sigs": []
  },
  "ex-3am-hasr-adad-ushri-l2-005:q4": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "round(round(4.3649,3),2)=round(4.3649,2)"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l2-006:q1": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "round(12.35,1)=12.4"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l2-006:q2": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "round(12.45,1)=12.4"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l2-006:q3": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "round(12.449,1)=12.4"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l2-006:q4": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "round(12.5,1)=12.4"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l2-006:q5": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "12.4",
      "k": 1
     },
     "form": "x",
     "br": "12.35<=x<12.45"
    },
    {
     "t": "iv",
     "given": {
      "r": "12.4",
      "k": 1
     },
     "form": "x",
     "br": "12.3<x<12.5"
    },
    {
     "t": "iv",
     "given": {
      "r": "12.4",
      "k": 1
     },
     "form": "x",
     "br": "12.4<=x<12.5"
    },
    {
     "t": "iv",
     "given": {
      "r": "12.4",
      "k": 1
     },
     "form": "x",
     "br": "12.35<=x<=12.45"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l2-007:q1": {
   "k": "rat",
   "e": "floor(58/7,1)",
   "sigs": [
    {
     "v": "8.3",
     "via": "ceil(58/7,1)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    },
    {
     "v": "8",
     "via": "floor(58/7,0)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l2-007:q2": {
   "k": "rat",
   "e": "ceil(58/7,1)",
   "sigs": [
    {
     "v": "8.2",
     "via": "floor(58/7,1)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    },
    {
     "v": "9",
     "via": "ceil(58/7,0)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l2-007:q3": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "round(58/7,1)=8.3"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l2-008:q1": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "3.6",
      "k": 1
     },
     "form": "x",
     "br": "3.55<=x<=3.65"
    },
    {
     "t": "iv",
     "given": {
      "r": "3.6",
      "k": 1
     },
     "form": "x",
     "br": "3.6<=x<3.7"
    },
    {
     "t": "iv",
     "given": {
      "r": "3.6",
      "k": 1
     },
     "form": "x",
     "br": "3.55<=x<3.65"
    },
    {
     "t": "iv",
     "given": {
      "r": "3.6",
      "k": 1
     },
     "form": "x",
     "br": "3.5<x<3.7"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l2-008:q2": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "round(3.65,1)=3.6"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l2-008:q3": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "round(3.55,1)=3.6"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l2-009:q1": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "round(2.26,1)=2.3&&2.26=2.3"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l2-009:q2": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "round(2.26,1)=2.3"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l2-009:q3": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "round(2.35,1)=2.3"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l2-009:q4": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "round(2.349,1)=2.3"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l2-009:q5": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "2.3",
      "k": 1
     },
     "form": "x",
     "br": "2.25<=x<2.35"
    },
    {
     "t": "iv",
     "given": {
      "r": "2.3",
      "k": 1
     },
     "form": "x",
     "br": "2.25<=x<=2.35"
    },
    {
     "t": "iv",
     "given": {
      "r": "2.3",
      "k": 1
     },
     "form": "x",
     "br": "2.3<=x<2.4"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l2-010:q1": {
   "k": "rat",
   "e": "round(1250/7,0)",
   "sigs": [
    {
     "v": "178",
     "via": "floor(1250/7,0)",
     "id": "MISC-TADWIR-TRUNC"
    },
    {
     "v": "178.6",
     "via": "round(1250/7,1)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l2-010:q2": {
   "k": "rat",
   "e": "round(1250/7,1)",
   "sigs": [
    {
     "v": "178.5",
     "via": "floor(1250/7,1)",
     "id": "MISC-TADWIR-TRUNC"
    },
    {
     "v": "179",
     "via": "round(1250/7,0)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l2-010:q3": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "7*179=1250"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l3-001:q1": {
   "k": "rat",
   "e": "(-0.25)*4*(-10)*(-1)",
   "sigs": []
  },
  "ex-3am-hasr-adad-ushri-l3-001:q2": {
   "k": "rat",
   "e": "(-10)*2*0.1*(-7)*(-0.5)",
   "sigs": []
  },
  "ex-3am-hasr-adad-ushri-l3-001:q3": {
   "k": "rat",
   "e": "floor((-10)/(-7),3)",
   "sigs": [
    {
     "v": "1.429",
     "via": "ceil((-10)/(-7),3)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    },
    {
     "v": "1.42",
     "via": "floor((-10)/(-7),2)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-001:q4": {
   "k": "rat",
   "e": "ceil((-10)/(-7),3)",
   "sigs": [
    {
     "v": "1.428",
     "via": "floor((-10)/(-7),3)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    },
    {
     "v": "1.43",
     "via": "ceil((-10)/(-7),2)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-001:q5": {
   "k": "rat",
   "e": "round((-10)/(-7),1)",
   "sigs": [
    {
     "v": "1",
     "via": "round((-10)/(-7),0)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-002:q1": {
   "k": "rat",
   "e": "floor(3+8/57,3)",
   "sigs": [
    {
     "v": "3.141",
     "via": "ceil(3+8/57,3)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-002:q2": {
   "k": "rat",
   "e": "ceil(3+1/7,3)",
   "sigs": [
    {
     "v": "3.142",
     "via": "floor(3+1/7,3)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-002:q3": {
   "k": "mc",
   "opts": [
    {
     "t": "chain",
     "s": "3+8/57<pi&&pi<3+1/7"
    },
    {
     "t": "chain",
     "s": "pi<3.14"
    },
    {
     "t": "chain",
     "s": "3+1/7<pi&&pi<3.15"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-002:q4": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "3.14<3+8/57&&3+1/7<3.15"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l3-003:q1": {
   "k": "rat",
   "e": "2*3.5",
   "sigs": []
  },
  "ex-3am-hasr-adad-ushri-l3-003:q2": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "lo": "3.14",
      "hi": "3.15",
      "loInc": false,
      "hiInc": false
     },
     "form": "7*x",
     "br": "3.14<7*x<3.15"
    },
    {
     "t": "iv",
     "given": {
      "lo": "3.14",
      "hi": "3.15",
      "loInc": false,
      "hiInc": false
     },
     "form": "7*x",
     "br": "21.98<=7*x<=22.05"
    },
    {
     "t": "iv",
     "given": {
      "lo": "3.14",
      "hi": "3.15",
      "loInc": false,
      "hiInc": false
     },
     "form": "7*x",
     "br": "21.98<7*x<22.05"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-004:q1": {
   "k": "mc",
   "opts": [
    {
     "t": "bk",
     "x": "248/37",
     "k": 0,
     "br": "6.7<=248/37<6.8"
    },
    {
     "t": "bk",
     "x": "248/37",
     "k": 0,
     "br": "7<=248/37<8"
    },
    {
     "t": "bk",
     "x": "248/37",
     "k": 0,
     "br": "6<=248/37<7"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-004:q2": {
   "k": "mc",
   "opts": [
    {
     "t": "bk",
     "x": "248/37",
     "k": 1,
     "br": "6.8<=248/37<6.9"
    },
    {
     "t": "bk",
     "x": "248/37",
     "k": 1,
     "br": "6.7<=248/37<6.8"
    },
    {
     "t": "bk",
     "x": "248/37",
     "k": 1,
     "br": "6<=248/37<7"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-004:q3": {
   "k": "mc",
   "opts": [
    {
     "t": "bk",
     "x": "248/37",
     "k": 2,
     "br": "6.70<=248/37<6.71"
    },
    {
     "t": "bk",
     "x": "248/37",
     "k": 2,
     "br": "6.7<=248/37<6.8"
    },
    {
     "t": "bk",
     "x": "248/37",
     "k": 2,
     "br": "6.71<=248/37<6.72"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-004:q4": {
   "k": "rat",
   "e": "round(248/37,2)",
   "sigs": [
    {
     "v": "6.71",
     "via": "ceil(248/37,2)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-004:q5": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "248/37=6.702702703"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l3-005:q1": {
   "k": "rat",
   "e": "round(1465/7,0)",
   "sigs": [
    {
     "v": "209.3",
     "via": "round(1465/7,1)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-005:q2": {
   "k": "rat",
   "e": "round(1465/7,1)",
   "sigs": [
    {
     "v": "209.2",
     "via": "floor(1465/7,1)",
     "id": "MISC-TADWIR-TRUNC"
    },
    {
     "v": "209",
     "via": "round(1465/7,0)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-005:q3": {
   "k": "rat",
   "e": "round(1465/7,2)",
   "sigs": [
    {
     "v": "209.28",
     "via": "floor(1465/7,2)",
     "id": "MISC-TADWIR-TRUNC"
    },
    {
     "v": "209.3",
     "via": "round(1465/7,1)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-005:q4": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "7*209.29=1465"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l3-006:q1": {
   "k": "rat",
   "e": "floor(52/17,3)",
   "sigs": [
    {
     "v": "3.059",
     "via": "ceil(52/17,3)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    },
    {
     "v": "3.05",
     "via": "floor(52/17,2)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-006:q2": {
   "k": "rat",
   "e": "ceil(52/17,3)",
   "sigs": [
    {
     "v": "3.058",
     "via": "floor(52/17,3)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    },
    {
     "v": "3.06",
     "via": "ceil(52/17,2)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-006:q3": {
   "k": "rat",
   "e": "round(52/17,2)",
   "sigs": [
    {
     "v": "3.05",
     "via": "floor(52/17,2)",
     "id": "MISC-TADWIR-TRUNC"
    },
    {
     "v": "3.1",
     "via": "round(52/17,1)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-006:q4": {
   "k": "rat",
   "e": "round(52/17,1)",
   "sigs": [
    {
     "v": "3",
     "via": "floor(52/17,1)",
     "id": "MISC-TADWIR-TRUNC"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-007:q1": {
   "k": "rat",
   "e": "2*3",
   "sigs": []
  },
  "ex-3am-hasr-adad-ushri-l3-007:q2": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "lo": "3.14",
      "hi": "3.15",
      "loInc": false,
      "hiInc": false
     },
     "form": "6*x",
     "br": "18.84<6*x<18.9"
    },
    {
     "t": "iv",
     "given": {
      "lo": "3.14",
      "hi": "3.15",
      "loInc": false,
      "hiInc": false
     },
     "form": "6*x",
     "br": "3.14<6*x<3.15"
    },
    {
     "t": "iv",
     "given": {
      "lo": "3.14",
      "hi": "3.15",
      "loInc": false,
      "hiInc": false
     },
     "form": "6*x",
     "br": "18.84<=6*x<=18.9"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-007:q3": {
   "k": "rat",
   "e": "3*3",
   "sigs": []
  },
  "ex-3am-hasr-adad-ushri-l3-007:q4": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "lo": "3.14",
      "hi": "3.15",
      "loInc": false,
      "hiInc": false
     },
     "form": "9*x",
     "br": "28.26<9*x<28.35"
    },
    {
     "t": "iv",
     "given": {
      "lo": "3.14",
      "hi": "3.15",
      "loInc": false,
      "hiInc": false
     },
     "form": "9*x",
     "br": "3.14<9*x<3.15"
    },
    {
     "t": "iv",
     "given": {
      "lo": "3.14",
      "hi": "3.15",
      "loInc": false,
      "hiInc": false
     },
     "form": "9*x",
     "br": "28.26<=9*x<=28.35"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-008:q1": {
   "k": "rat",
   "e": "13.75+12.5+15.25",
   "sigs": []
  },
  "ex-3am-hasr-adad-ushri-l3-008:q2": {
   "k": "rat",
   "e": "round(41.5/3,1)",
   "sigs": [
    {
     "v": "14",
     "via": "round(41.5/3,0)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-008:q3": {
   "k": "mc",
   "opts": [
    {
     "t": "bk",
     "x": "41.5/3",
     "k": 2,
     "br": "13.83<=41.5/3<13.84"
    },
    {
     "t": "bk",
     "x": "41.5/3",
     "k": 2,
     "br": "13.84<=41.5/3<13.85"
    },
    {
     "t": "bk",
     "x": "41.5/3",
     "k": 2,
     "br": "13.8<=41.5/3<13.9"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-008:q4": {
   "k": "rat",
   "e": "round(41.5/3,2)",
   "sigs": [
    {
     "v": "13.8",
     "via": "round(41.5/3,1)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-009:q1": {
   "k": "rat",
   "e": "floor(4700/612,2)",
   "sigs": [
    {
     "v": "7.68",
     "via": "ceil(4700/612,2)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    },
    {
     "v": "7.6",
     "via": "floor(4700/612,1)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-009:q2": {
   "k": "rat",
   "e": "ceil(4700/612,2)",
   "sigs": [
    {
     "v": "7.67",
     "via": "floor(4700/612,2)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    },
    {
     "v": "7.7",
     "via": "ceil(4700/612,1)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-009:q3": {
   "k": "rat",
   "e": "round(4700/612,1)",
   "sigs": [
    {
     "v": "7.6",
     "via": "floor(4700/612,1)",
     "id": "MISC-TADWIR-TRUNC"
    },
    {
     "v": "8",
     "via": "round(4700/612,0)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-009:q4": {
   "k": "rat",
   "e": "round(4700/612,2)",
   "sigs": [
    {
     "v": "7.67",
     "via": "floor(4700/612,2)",
     "id": "MISC-TADWIR-TRUNC"
    },
    {
     "v": "7.7",
     "via": "round(4700/612,1)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-010:q1": {
   "k": "rat",
   "e": "round(1000/7,0)",
   "sigs": [
    {
     "v": "142",
     "via": "floor(1000/7,0)",
     "id": "MISC-TADWIR-TRUNC"
    },
    {
     "v": "142.9",
     "via": "round(1000/7,1)",
     "id": "MISC-TADWIR-RANK"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-010:q2": {
   "k": "mc",
   "opts": [
    {
     "t": "bk",
     "x": "1000/7",
     "k": 0,
     "br": "142.8<=1000/7<142.9"
    },
    {
     "t": "chain",
     "s": "143<=1000/7<144"
    },
    {
     "t": "bk",
     "x": "1000/7",
     "k": 0,
     "br": "142<=1000/7<143"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l3-010:q3": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "7*143=1000"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l3-010:q4": {
   "k": "rat",
   "e": "floor(1000/7,0)",
   "sigs": [
    {
     "v": "143",
     "via": "ceil(1000/7,0)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-001:q1": {
   "k": "rat",
   "e": "-1/20",
   "sigs": []
  },
  "ex-3am-hasr-adad-ushri-l4-001:q2": {
   "k": "rat",
   "e": "42500-39000",
   "sigs": []
  },
  "ex-3am-hasr-adad-ushri-l4-001:q3": {
   "k": "rat",
   "e": "round(350000/39000,0)",
   "sigs": [
    {
     "v": "8",
     "via": "floor(350000/39000,0)",
     "id": "MISC-TADWIR-TRUNC"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-001:q4": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "350000/39000=9"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l4-002:q1": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "5.41",
      "k": 2
     },
     "form": "x",
     "br": "5.41<=x<5.42"
    },
    {
     "t": "iv",
     "given": {
      "r": "5.41",
      "k": 2
     },
     "form": "x",
     "br": "5.405<=x<5.415"
    },
    {
     "t": "iv",
     "given": {
      "r": "5.41",
      "k": 2
     },
     "form": "x",
     "br": "5.405<x<=5.415"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-002:q2": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "5.41",
      "k": 2
     },
     "form": "15*x",
     "br": "81.075<=15*x<81.225"
    },
    {
     "t": "iv",
     "given": {
      "r": "5.41",
      "k": 2
     },
     "form": "15*x",
     "br": "81.075<15*x<=81.225"
    },
    {
     "t": "iv",
     "given": {
      "r": "5.41",
      "k": 2
     },
     "form": "15*x",
     "br": "5.405<=15*x<5.415"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-002:q3": {
   "k": "rat",
   "e": "15*5.405",
   "sigs": [
    {
     "v": "81.15",
     "via": "15*5.41",
     "id": "MISC-TADWIR-CENTER-EXACT"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-002:q4": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "81.075<=81.225&&81.225<81.225"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l4-003:q1": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "12.4",
      "k": 1
     },
     "form": "x",
     "br": "12.35<=x<12.45"
    },
    {
     "t": "iv",
     "given": {
      "r": "12.4",
      "k": 1
     },
     "form": "x",
     "br": "12.35<x<=12.45"
    },
    {
     "t": "iv",
     "given": {
      "r": "12.4",
      "k": 1
     },
     "form": "x",
     "br": "12.4<=x<12.5"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-003:q2": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "12.4",
      "k": 1
     },
     "form": "4*x",
     "br": "12.35<=4*x<12.45"
    },
    {
     "t": "iv",
     "given": {
      "r": "12.4",
      "k": 1
     },
     "form": "4*x",
     "br": "49.4<=4*x<49.8"
    },
    {
     "t": "iv",
     "given": {
      "r": "12.4",
      "k": 1
     },
     "form": "4*x",
     "br": "49.4<4*x<=49.8"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-003:q3": {
   "k": "rat",
   "e": "4*12.35",
   "sigs": [
    {
     "v": "49.6",
     "via": "4*12.4",
     "id": "MISC-TADWIR-CENTER-EXACT"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-003:q4": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "4*12.45<=49.8"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l4-004:q1": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "12.3",
      "k": 1
     },
     "form": "25*x",
     "br": "12.25<=25*x<12.35"
    },
    {
     "t": "iv",
     "given": {
      "r": "12.3",
      "k": 1
     },
     "form": "25*x",
     "br": "306.25<=25*x<308.75"
    },
    {
     "t": "iv",
     "given": {
      "r": "12.3",
      "k": 1
     },
     "form": "25*x",
     "br": "306.25<25*x<=308.75"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-004:q2": {
   "k": "rat",
   "e": "25*12.35",
   "sigs": [
    {
     "v": "307.5",
     "via": "25*12.3",
     "id": "MISC-TADWIR-CENTER-EXACT"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-004:q3": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "25*12.35<=310"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l4-004:q4": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "306.25<=308.75&&308.75<308.75"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l4-005:q1": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "2.35",
      "k": 2
     },
     "form": "x",
     "br": "2.35<=x<2.36"
    },
    {
     "t": "iv",
     "given": {
      "r": "2.35",
      "k": 2
     },
     "form": "x",
     "br": "2.345<x<=2.355"
    },
    {
     "t": "iv",
     "given": {
      "r": "2.35",
      "k": 2
     },
     "form": "x",
     "br": "2.345<=x<2.355"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-005:q2": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "2.35",
      "k": 2
     },
     "form": "12*x",
     "br": "28.14<12*x<=28.26"
    },
    {
     "t": "iv",
     "given": {
      "r": "2.35",
      "k": 2
     },
     "form": "12*x",
     "br": "2.345<=12*x<2.355"
    },
    {
     "t": "iv",
     "given": {
      "r": "2.35",
      "k": 2
     },
     "form": "12*x",
     "br": "28.14<=12*x<28.26"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-005:q3": {
   "k": "rat",
   "e": "12*2.345",
   "sigs": [
    {
     "v": "28.2",
     "via": "12*2.35",
     "id": "MISC-TADWIR-CENTER-EXACT"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-005:q4": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "28<28.14"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l4-006:q1": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "3.47",
      "k": 2
     },
     "form": "x",
     "br": "3.465<x<=3.475"
    },
    {
     "t": "iv",
     "given": {
      "r": "3.47",
      "k": 2
     },
     "form": "x",
     "br": "3.47<=x<3.48"
    },
    {
     "t": "iv",
     "given": {
      "r": "3.47",
      "k": 2
     },
     "form": "x",
     "br": "3.465<=x<3.475"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-006:q2": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "3.47",
      "k": 2
     },
     "form": "215*x",
     "br": "744.975<=215*x<747.125"
    },
    {
     "t": "iv",
     "given": {
      "r": "3.47",
      "k": 2
     },
     "form": "215*x",
     "br": "3.465<=215*x<3.475"
    },
    {
     "t": "iv",
     "given": {
      "r": "3.47",
      "k": 2
     },
     "form": "215*x",
     "br": "744.975<215*x<=747.125"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-006:q3": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "744.975<=747&&747<747.125"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l4-006:q4": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "744.975<=747.125&&747.125<747.125"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l4-007:q1": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "15.3",
      "k": 1
     },
     "form": "x",
     "br": "15.25<=x<15.35"
    },
    {
     "t": "iv",
     "given": {
      "r": "15.3",
      "k": 1
     },
     "form": "x",
     "br": "15.25<x<=15.35"
    },
    {
     "t": "iv",
     "given": {
      "r": "15.3",
      "k": 1
     },
     "form": "x",
     "br": "15.3<=x<15.4"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-007:q2": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "15.3",
      "k": 1
     },
     "form": "2*x+12",
     "br": "15.25<=2*x+12<15.35"
    },
    {
     "t": "iv",
     "given": {
      "r": "15.3",
      "k": 1
     },
     "form": "2*x+12",
     "br": "42.5<=2*x+12<42.7"
    },
    {
     "t": "iv",
     "given": {
      "r": "15.3",
      "k": 1
     },
     "form": "2*x+12",
     "br": "42.5<2*x+12<=42.7"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-007:q3": {
   "k": "rat",
   "e": "2*15.25+12",
   "sigs": [
    {
     "v": "30.5",
     "via": "2*15.25",
     "id": "MISC-MUTABAYINA-COEF-LOST"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-007:q4": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "42.7<=2*15.35+12&&2*15.35+12<42.7"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l4-008:q1": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "1.43",
      "k": 2
     },
     "form": "x",
     "br": "1.43<=x<1.44"
    },
    {
     "t": "iv",
     "given": {
      "r": "1.43",
      "k": 2
     },
     "form": "x",
     "br": "1.425<=x<1.435"
    },
    {
     "t": "iv",
     "given": {
      "r": "1.43",
      "k": 2
     },
     "form": "x",
     "br": "1.425<x<=1.435"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-008:q2": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "1.43",
      "k": 2
     },
     "form": "90*x",
     "br": "128.25<=90*x<129.15"
    },
    {
     "t": "iv",
     "given": {
      "r": "1.43",
      "k": 2
     },
     "form": "90*x",
     "br": "1.425<=90*x<1.435"
    },
    {
     "t": "iv",
     "given": {
      "r": "1.43",
      "k": 2
     },
     "form": "90*x",
     "br": "128.25<90*x<=129.15"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-008:q3": {
   "k": "rat",
   "e": "90*1.435",
   "sigs": [
    {
     "v": "128.7",
     "via": "90*1.43",
     "id": "MISC-TADWIR-CENTER-EXACT"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-008:q4": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "128.25>128"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l4-009:q1": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "37",
      "k": 0
     },
     "form": "x",
     "br": "36.5<=x<37.5"
    },
    {
     "t": "iv",
     "given": {
      "r": "37",
      "k": 0
     },
     "form": "x",
     "br": "36.5<x<=37.5"
    },
    {
     "t": "iv",
     "given": {
      "r": "37",
      "k": 0
     },
     "form": "x",
     "br": "37<=x<38"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-009:q2": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "37",
      "k": 0
     },
     "form": "120*x",
     "br": "4380<120*x<=4500"
    },
    {
     "t": "iv",
     "given": {
      "r": "37",
      "k": 0
     },
     "form": "120*x",
     "br": "4380<=120*x<4500"
    },
    {
     "t": "iv",
     "given": {
      "r": "37",
      "k": 0
     },
     "form": "120*x",
     "br": "36.5<=120*x<37.5"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-009:q3": {
   "k": "rat",
   "e": "120*36.5",
   "sigs": [
    {
     "v": "4440",
     "via": "120*37",
     "id": "MISC-TADWIR-CENTER-EXACT"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-009:q4": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "4500<=4500"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l4-010:q1": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "58.4",
      "k": 1
     },
     "form": "x",
     "br": "58.35<=x<58.45"
    },
    {
     "t": "iv",
     "given": {
      "r": "58.4",
      "k": 1
     },
     "form": "x",
     "br": "58.4<=x<58.5"
    },
    {
     "t": "iv",
     "given": {
      "r": "58.4",
      "k": 1
     },
     "form": "x",
     "br": "58.35<x<=58.45"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-010:q2": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "58.4",
      "k": 1
     },
     "form": "5*x",
     "br": "291.75<5*x<=292.25"
    },
    {
     "t": "iv",
     "given": {
      "r": "58.4",
      "k": 1
     },
     "form": "5*x",
     "br": "58.35<=5*x<58.45"
    },
    {
     "t": "iv",
     "given": {
      "r": "58.4",
      "k": 1
     },
     "form": "5*x",
     "br": "291.75<=5*x<292.25"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l4-010:q3": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "291.75<=292&&292<292.25"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l5-001:q1": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "11.83",
      "k": 2
     },
     "form": "x",
     "br": "11.83<=x<11.84"
    },
    {
     "t": "iv",
     "given": {
      "r": "11.83",
      "k": 2
     },
     "form": "x",
     "br": "11.825<=x<11.835"
    },
    {
     "t": "iv",
     "given": {
      "r": "11.83",
      "k": 2
     },
     "form": "x",
     "br": "11.825<x<=11.835"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l5-001:q2": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "11.85",
      "k": 2
     },
     "form": "x",
     "br": "11.845<=x<11.855"
    },
    {
     "t": "iv",
     "given": {
      "r": "11.85",
      "k": 2
     },
     "form": "x",
     "br": "11.85<=x<11.86"
    },
    {
     "t": "iv",
     "given": {
      "r": "11.85",
      "k": 2
     },
     "form": "x",
     "br": "11.845<x<=11.855"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l5-001:q3": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "11.835<=11.845"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l5-002:q1": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "13.05",
      "k": 2
     },
     "form": "x",
     "br": "13.045<=x<13.055"
    },
    {
     "t": "iv",
     "given": {
      "r": "13.05",
      "k": 2
     },
     "form": "x",
     "br": "13.045<x<=13.055"
    },
    {
     "t": "iv",
     "given": {
      "r": "13.05",
      "k": 2
     },
     "form": "x",
     "br": "13.05<=x<13.06"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l5-002:q2": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "13.055<=13.045"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l5-002:q3": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "round(13.052,2)=13.05&&round(13.048,2)=13.05&&13.052>13.048"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l5-003:q1": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "24.9",
      "k": 1
     },
     "form": "140*x",
     "br": "24.85<=140*x<24.95"
    },
    {
     "t": "iv",
     "given": {
      "r": "24.9",
      "k": 1
     },
     "form": "140*x",
     "br": "3479<=140*x<3493"
    },
    {
     "t": "iv",
     "given": {
      "r": "24.9",
      "k": 1
     },
     "form": "140*x",
     "br": "3479<140*x<=3493"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l5-003:q2": {
   "k": "rat",
   "e": "140*24.95",
   "sigs": [
    {
     "v": "3486",
     "via": "140*24.9",
     "id": "MISC-TADWIR-CENTER-EXACT"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l5-003:q3": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "140*24.95<=3500"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l5-004:q1": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "25.0",
      "k": 1
     },
     "form": "140*x",
     "br": "3493<=140*x<3507"
    },
    {
     "t": "iv",
     "given": {
      "r": "25.0",
      "k": 1
     },
     "form": "140*x",
     "br": "3493<140*x<=3507"
    },
    {
     "t": "iv",
     "given": {
      "r": "25.0",
      "k": 1
     },
     "form": "140*x",
     "br": "24.95<=140*x<25.05"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l5-004:q2": {
   "k": "mc",
   "opts": [
    {
     "t": "chain",
     "s": "3493>3500"
    },
    {
     "t": "chain",
     "s": "3507<=3500"
    },
    {
     "t": "chain",
     "s": "3493<3500&&3500<3507"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l5-004:q3": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "3493<=3500&&3500<3507"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l5-005:q1": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "48.7",
      "k": 1
     },
     "form": "x",
     "br": "48.7<=x<48.8"
    },
    {
     "t": "iv",
     "given": {
      "r": "48.7",
      "k": 1
     },
     "form": "x",
     "br": "48.65<=x<48.75"
    },
    {
     "t": "iv",
     "given": {
      "r": "48.7",
      "k": 1
     },
     "form": "x",
     "br": "48.65<x<=48.75"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l5-005:q2": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "48.7",
      "k": 1
     },
     "form": "2*x",
     "br": "97.3<=2*x<97.5"
    },
    {
     "t": "iv",
     "given": {
      "r": "48.7",
      "k": 1
     },
     "form": "2*x",
     "br": "48.65<=2*x<48.75"
    },
    {
     "t": "iv",
     "given": {
      "r": "48.7",
      "k": 1
     },
     "form": "2*x",
     "br": "97.3<2*x<=97.5"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l5-005:q3": {
   "k": "rat",
   "e": "floor(97.3,0)",
   "sigs": [
    {
     "v": "98",
     "via": "ceil(97.3,0)",
     "id": "MISC-TAQRIB-NAQS-ZIYADA"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l5-005:q4": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "98<97.5"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l5-006:q1": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "72",
      "k": 0
     },
     "form": "x",
     "br": "72<=x<73"
    },
    {
     "t": "iv",
     "given": {
      "r": "72",
      "k": 0
     },
     "form": "x",
     "br": "71.5<x<=72.5"
    },
    {
     "t": "iv",
     "given": {
      "r": "72",
      "k": 0
     },
     "form": "x",
     "br": "71.5<=x<72.5"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l5-006:q2": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "72",
      "k": 0
     },
     "form": "2*x",
     "br": "143<2*x<=145"
    },
    {
     "t": "iv",
     "given": {
      "r": "72",
      "k": 0
     },
     "form": "2*x",
     "br": "143<=2*x<145"
    },
    {
     "t": "iv",
     "given": {
      "r": "72",
      "k": 0
     },
     "form": "2*x",
     "br": "71.5<=2*x<72.5"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l5-006:q3": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "145<145"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l5-007:q1": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "5.2",
      "k": 1
     },
     "form": "3*x",
     "br": "15.45<3*x<=15.75"
    },
    {
     "t": "iv",
     "given": {
      "r": "5.2",
      "k": 1
     },
     "form": "3*x",
     "br": "5.15<=3*x<5.25"
    },
    {
     "t": "iv",
     "given": {
      "r": "5.2",
      "k": 1
     },
     "form": "3*x",
     "br": "15.45<=3*x<15.75"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l5-007:q2": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "15.75<=16"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l5-007:q3": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "15.75<=8"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l5-008:q1": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "7.1",
      "k": 1
     },
     "form": "6*x",
     "br": "7.05<=6*x<7.15"
    },
    {
     "t": "iv",
     "given": {
      "r": "7.1",
      "k": 1
     },
     "form": "6*x",
     "br": "42.3<6*x<=42.9"
    },
    {
     "t": "iv",
     "given": {
      "r": "7.1",
      "k": 1
     },
     "form": "6*x",
     "br": "42.3<=6*x<42.9"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l5-008:q2": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "6*7.15<=43"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l5-008:q3": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "42.3<=42.5&&42.5<42.9"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l5-009:q1": {
   "k": "mc",
   "opts": [
    {
     "t": "iv",
     "given": {
      "r": "7.6",
      "k": 1
     },
     "form": "350*x",
     "br": "7.55<=350*x<7.65"
    },
    {
     "t": "iv",
     "given": {
      "r": "7.6",
      "k": 1
     },
     "form": "350*x",
     "br": "2642.5<=350*x<2677.5"
    },
    {
     "t": "iv",
     "given": {
      "r": "7.6",
      "k": 1
     },
     "form": "350*x",
     "br": "2642.5<350*x<=2677.5"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l5-009:q2": {
   "k": "rat",
   "e": "350*7.65",
   "sigs": [
    {
     "v": "2660",
     "via": "350*7.6",
     "id": "MISC-TADWIR-CENTER-EXACT"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l5-009:q3": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "2700<2677.5"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l5-009:q4": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "2650<2642.5"
   },
   "expectTrue": false
  },
  "ex-3am-hasr-adad-ushri-l5-010:q1": {
   "k": "mc",
   "opts": [
    {
     "t": "chain",
     "s": "23.88=11.835+12.055&&23.9=11.845+12.065"
    },
    {
     "t": "chain",
     "s": "23.89=11.835+12.055&&23.91=11.845+12.065"
    },
    {
     "t": "chain",
     "s": "23.9=11.835+12.055&&23.9=11.845+12.065"
    }
   ]
  },
  "ex-3am-hasr-adad-ushri-l5-010:q2": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "23.91<=24"
   },
   "expectTrue": true
  },
  "ex-3am-hasr-adad-ushri-l5-010:q3": {
   "k": "yn",
   "claim": {
    "t": "chain",
    "s": "23.91<=23.9"
   },
   "expectTrue": false
  }
 },
 "facts": {
  "ex-3am-hasr-adad-ushri-l2-001": [
   "(-5.2)+(-6.33)-9.06=-20.59",
   "(-5.2)*(-3.4)*(-8)=-141.44",
   "floor(20.59/141.44,2)=0.14",
   "ceil(20.59/141.44,2)=0.15",
   "round(20.59/141.44,2)=0.15"
  ],
  "ex-3am-hasr-adad-ushri-l3-001": [
   "(-0.25)*4*(-10)*(-1)=-10",
   "(-10)*2*0.1*(-7)*(-0.5)=-7",
   "floor(10/7,3)=1.428",
   "ceil(10/7,3)=1.429",
   "round(10/7,1)=1.4"
  ],
  "ex-3am-hasr-adad-ushri-l3-002": [
   "floor(3+8/57,3)=3.14",
   "ceil(3+1/7,3)=3.143",
   "3+8/57<pi<3+1/7",
   "3.14<3+8/57",
   "3+1/7<3.15"
  ],
  "ex-3am-hasr-adad-ushri-l3-003": [
   "7*3.14=21.98",
   "7*3.15=22.05",
   "2*3.5=7"
  ],
  "ex-3am-hasr-adad-ushri-l3-007": [
   "6*3.14=18.84",
   "6*3.15=18.9",
   "9*3.14=28.26",
   "9*3.15=28.35"
  ],
  "ex-3am-hasr-adad-ushri-l3-008": [
   "13.75+12.5+15.25=41.5"
  ],
  "ex-3am-hasr-adad-ushri-l4-001": [
   "(8*(-1/20)+2)/4=2/5",
   "42500-39000=3500",
   "floor(350000/39000,1)=8.9",
   "round(350000/39000,0)=9"
  ],
  "ex-3am-hasr-adad-ushri-l4-002": [
   "15*5.405=81.075",
   "15*5.415=81.225",
   "15*5.41=81.15"
  ],
  "ex-3am-hasr-adad-ushri-l4-003": [
   "4*12.35=49.4",
   "4*12.45=49.8",
   "4*12.45<=49.8"
  ],
  "ex-3am-hasr-adad-ushri-l4-004": [
   "25*12.25=306.25",
   "25*12.35=308.75",
   "308.75<310"
  ],
  "ex-3am-hasr-adad-ushri-l4-005": [
   "12*2.345=28.14",
   "12*2.355=28.26",
   "28.14>28"
  ],
  "ex-3am-hasr-adad-ushri-l4-006": [
   "215*3.465=744.975",
   "215*3.475=747.125",
   "744.975<=747&&747<747.125"
  ],
  "ex-3am-hasr-adad-ushri-l4-007": [
   "2*15.25+12=42.5",
   "2*15.35+12=42.7",
   "2*15.25=30.5"
  ],
  "ex-3am-hasr-adad-ushri-l4-008": [
   "90*1.425=128.25",
   "90*1.435=129.15",
   "128.25>128"
  ],
  "ex-3am-hasr-adad-ushri-l4-009": [
   "120*36.5=4380",
   "120*37.5=4500",
   "4500<=4500"
  ],
  "ex-3am-hasr-adad-ushri-l4-010": [
   "5*58.35=291.75",
   "5*58.45=292.25"
  ],
  "ex-3am-hasr-adad-ushri-l5-001": [
   "11.83-0.005=11.825",
   "11.83+0.005=11.835",
   "11.85-0.005=11.845",
   "11.835<11.845"
  ],
  "ex-3am-hasr-adad-ushri-l5-002": [
   "round(13.052,2)=13.05",
   "round(13.048,2)=13.05",
   "13.052>13.048"
  ],
  "ex-3am-hasr-adad-ushri-l5-003": [
   "140*24.85=3479",
   "140*24.95=3493",
   "3493<=3500"
  ],
  "ex-3am-hasr-adad-ushri-l5-004": [
   "140*24.95=3493",
   "140*25.05=3507",
   "3493<3500",
   "3500<3507"
  ],
  "ex-3am-hasr-adad-ushri-l5-005": [
   "2*48.65=97.3",
   "2*48.75=97.5",
   "floor(97.3,0)=97"
  ],
  "ex-3am-hasr-adad-ushri-l5-006": [
   "2*71.5=143",
   "2*72.5=145",
   "145<=145"
  ],
  "ex-3am-hasr-adad-ushri-l5-007": [
   "3*5.15=15.45",
   "3*5.25=15.75",
   "15.75<=16",
   "2*8=16"
  ],
  "ex-3am-hasr-adad-ushri-l5-008": [
   "6*7.05=42.3",
   "6*7.15=42.9",
   "42.9<=43",
   "42.3<=42.5"
  ],
  "ex-3am-hasr-adad-ushri-l5-009": [
   "350*7.55=2642.5",
   "350*7.65=2677.5",
   "2677.5<2700",
   "2642.5<=2650"
  ],
  "ex-3am-hasr-adad-ushri-l5-010": [
   "11.835+12.055=23.89",
   "11.845+12.065=23.91",
   "23.91<=24",
   "11.84+12.06=23.9"
  ]
 },
 "screens": {
  "ex-3am-hasr-adad-ushri-l1-010": [
   {
    "a": "127",
    "b": "13",
    "n": 10,
    "shown": "9.769230769"
   }
  ],
  "ex-3am-hasr-adad-ushri-l2-001": [
   {
    "a": "20.59",
    "b": "141.44",
    "n": 10,
    "shown": "0.145574095"
   }
  ],
  "ex-3am-hasr-adad-ushri-l2-007": [
   {
    "a": "58",
    "b": "7",
    "n": 10,
    "shown": "8.285714286"
   }
  ],
  "ex-3am-hasr-adad-ushri-l2-010": [
   {
    "a": "1250",
    "b": "7",
    "n": 10,
    "shown": "178.5714286"
   }
  ],
  "ex-3am-hasr-adad-ushri-l3-001": [
   {
    "a": "10",
    "b": "7",
    "n": 10,
    "shown": "1.428571429"
   }
  ],
  "ex-3am-hasr-adad-ushri-l3-004": [
   {
    "a": "248",
    "b": "37",
    "n": 10,
    "shown": "6.702702703"
   }
  ],
  "ex-3am-hasr-adad-ushri-l3-005": [
   {
    "a": "1465",
    "b": "7",
    "n": 10,
    "shown": "209.2857143"
   }
  ],
  "ex-3am-hasr-adad-ushri-l3-006": [
   {
    "a": "52",
    "b": "17",
    "n": 10,
    "shown": "3.058823529"
   }
  ],
  "ex-3am-hasr-adad-ushri-l3-008": [
   {
    "a": "41.5",
    "b": "3",
    "n": 10,
    "shown": "13.83333333"
   }
  ],
  "ex-3am-hasr-adad-ushri-l3-009": [
   {
    "a": "4700",
    "b": "612",
    "n": 10,
    "shown": "7.679738562"
   }
  ],
  "ex-3am-hasr-adad-ushri-l3-010": [
   {
    "a": "1000",
    "b": "7",
    "n": 10,
    "shown": "142.8571429"
   }
  ]
 }
};

/* ── rationnels exacts ─────────────────────────────────────────────────────── */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const fdiv = (a, b) => { const q = a / b; return (a % b !== 0n && ((a < 0n) !== (b < 0n))) ? q - 1n : q; };
class Rt {
  constructor(n, d = 1n) { if (d === 0n) throw new Error('division par zéro'); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; this.n = n / g; this.d = d / g; }
  add(o) { return new Rt(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { return new Rt(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { return new Rt(this.n * o.n, this.d * o.d); }
  div(o) { return new Rt(this.n * o.d, this.d * o.n); }
  neg() { return new Rt(-this.n, this.d); }
  cmp(o) { const l = this.n * o.d; const r = o.n * this.d; return l < r ? -1 : l > r ? 1 : 0; }
  eq(o) { return this.n === o.n && this.d === o.d; }
}
const P10 = (k) => 10n ** BigInt(k);
const ZERO = new Rt(0n); const ONE = new Rt(1n);
const parseDec = (s) => { const [i, f = ''] = s.split('.'); return new Rt(BigInt(i + f), P10(f.length)); };
const PI = parseDec('3.14159265358979323846264338327950288419716939937510');
const unit = (k) => new Rt(1n, P10(k));
const floorAt = (x, k) => new Rt(fdiv(x.n * P10(k), x.d), P10(k));
const ceilAt = (x, k) => new Rt(-fdiv(-x.n * P10(k), x.d), P10(k));
const roundAt = (x, k) => new Rt(fdiv(2n * x.n * P10(k) + x.d, 2n * x.d), P10(k)); // demi supérieur : plancher de (x·10^k + ½)
/** nombre de décimales d'un rationnel décimal (null s'il ne l'est pas). */
const decimalsOf = (x) => { let d = x.d; let a = 0n; let b = 0n; while (d % 2n === 0n) { d /= 2n; a++; } while (d % 5n === 0n) { d /= 5n; b++; } if (d !== 1n) return null; return Number(a > b ? a : b); };
const lastDigitRound = (x, k) => {
  const m = decimalsOf(x); if (m === null || m <= k) return x;
  const last = (x.n * P10(m) / x.d) % 10n; const f = floorAt(x, k);
  return last >= 5n ? f.add(unit(k)) : f;
};
/** valeur → chaîne décimale exacte, ou « n/d » si le rationnel n'est pas décimal. */
const show = (x) => {
  const m = decimalsOf(x); if (m === null) return `${x.n}/${x.d}`;
  const scaled = x.n * P10(m) / x.d; const neg = scaled < 0n; const a = neg ? -scaled : scaled;
  const s = a.toString().padStart(m + 1, '0'); let out = m === 0 ? s : `${s.slice(0, s.length - m)}.${s.slice(s.length - m)}`;
  if (out.includes('.')) out = out.replace(/0+$/, '').replace(/\.$/, '');
  return (neg ? '-' : '') + out;
};

/* ── expressions ───────────────────────────────────────────────────────────── */
function ev(src, env = {}) {
  const t = src.replace(/\s+/g, ''); let i = 0;
  const peek = () => t[i];
  const expr = () => { let r = term(); while (peek() === '+' || peek() === '-') { const op = t[i++]; const w = term(); r = op === '+' ? r.add(w) : r.sub(w); } return r; };
  const term = () => { let r = unary(); while (peek() === '*' || peek() === '/') { const op = t[i++]; const w = unary(); r = op === '*' ? r.mul(w) : r.div(w); } return r; };
  const unary = () => { if (peek() === '-') { i++; return unary().neg(); } return primary(); };
  const primary = () => {
    const p = peek();
    if (p === '(') { i++; const r = expr(); if (t[i++] !== ')') throw new Error(`« ) » attendu : ${src}`); return r; }
    const num = /^\d+(\.\d+)?/.exec(t.slice(i)); if (num) { i += num[0].length; return parseDec(num[0]); }
    const id = /^[a-z]+/.exec(t.slice(i)); if (!id) throw new Error(`lecture impossible à ${i} dans ${src}`);
    i += id[0].length; const name = id[0];
    if (peek() === '(') {
      i++; const a = expr(); let k = 0;
      if (peek() === ',') { i++; const kk = expr(); if (kk.d !== 1n) throw new Error(`rang non entier : ${src}`); k = Number(kk.n); }
      if (t[i++] !== ')') throw new Error(`« ) » attendu : ${src}`);
      if (name === 'floor') return floorAt(a, k);
      if (name === 'ceil') return ceilAt(a, k);
      if (name === 'round') return roundAt(a, k);
      if (name === 'lastdigit') return lastDigitRound(a, k);
      throw new Error(`fonction ${name} inconnue`);
    }
    if (name === 'pi') return PI;
    if (name in env) return env[name];
    throw new Error(`symbole ${name} inconnu : ${src}`);
  };
  const r = expr(); if (i !== t.length) throw new Error(`reste « ${t.slice(i)} » dans ${src}`); return r;
}
const chainOf = (s) => { const parts = s.replace(/\s+/g, '').split(/(<=|>=|<|>|=)/); return { exprs: parts.filter((_, k) => k % 2 === 0), rels: parts.filter((_, k) => k % 2 === 1) }; };
const relHolds = (rel, a, b) => { const c = a.cmp(b); return rel === '<' ? c < 0 : rel === '>' ? c > 0 : rel === '<=' ? c <= 0 : rel === '>=' ? c >= 0 : c === 0; };
const chainHolds = (s, env = {}) => { const { exprs, rels } = chainOf(s); return rels.every((r, k) => relHolds(r, ev(exprs[k], env), ev(exprs[k + 1], env))); };
const allHold = (s, env = {}) => s.split('&&').every((p) => chainHolds(p, env));

/** Intervalle donné : { r, k } (arrondi) ou { lo, hi, loInc, hiInc }. Vérifie par balayage exact que { x : round(x,k) = r } = [lo ; hi[. */
function givenInterval(g) {
  if (g.r !== undefined) {
    const r = parseDec(g.r); const half = new Rt(5n, P10(g.k + 1));
    const iv = { lo: r.sub(half), hi: r.add(half), loInc: true, hiInc: false, grid: true };
    const step = new Rt(1n, P10(g.k + 2));
    for (let i = -200; i <= 200; i++) {
      const x = r.add(step.mul(new Rt(BigInt(i))));
      const inside = x.cmp(iv.lo) >= 0 && x.cmp(iv.hi) < 0;
      if ((roundAt(x, g.k).eq(r)) !== inside) throw new Error(`intervalle d'arrondi incohérent en ${show(x)}`);
    }
    return iv;
  }
  return { lo: parseDec(g.lo), hi: parseDec(g.hi), loInc: !!g.loInc, hiInc: !!g.hiInc };
}
const inside = (iv, x) => (iv.loInc ? x.cmp(iv.lo) >= 0 : x.cmp(iv.lo) > 0) && (iv.hiInc ? x.cmp(iv.hi) <= 0 : x.cmp(iv.hi) < 0);

/** Une AFFIRMATION (option d'un QCM, ou « oui / non ») est-elle vraie ? */
function claimTrue(c) {
  if (c.t === 'chain') return allHold(c.s);
  if (c.t === 'bk') {
    const X = ev(c.x); const lo = floorAt(X, c.k); let hi = ceilAt(X, c.k); if (lo.eq(hi)) hi = lo.add(unit(c.k));
    const { exprs, rels } = chainOf(c.br); if (exprs.length !== 3) return false;
    return ev(exprs[0]).eq(lo) && ev(exprs[2]).eq(hi) && ev(exprs[1]).eq(X) && relHolds(rels[0], lo, X) && relHolds(rels[1], X, hi) && rels.every((r) => r === '<' || r === '<=');
  }
  if (c.t === 'iv') {
    const g = givenInterval(c.given); const f = (x) => ev(c.form, { x });
    const slope = f(ONE).sub(f(ZERO)); if (slope.eq(ZERO)) throw new Error('forme constante');
    const up = slope.cmp(ZERO) > 0;
    const low = up ? { v: f(g.lo), inc: g.loInc } : { v: f(g.hi), inc: g.hiInc };
    const high = up ? { v: f(g.hi), inc: g.hiInc } : { v: f(g.lo), inc: g.loInc };
    const { exprs, rels } = chainOf(c.br); if (exprs.length !== 3) return false;
    if (!rels.every((r) => r === '<' || r === '<=')) return false;
    if (!ev(exprs[0]).eq(low.v) || !ev(exprs[2]).eq(high.v)) return false;
    if ((rels[0] === '<=') !== low.inc || (rels[1] === '<=') !== high.inc) return false;
    for (const x of [ZERO, ONE, new Rt(7n, 2n), new Rt(-3n)]) if (!ev(exprs[1], { x }).eq(f(x))) return false;
    // vrai sur toute la grille de l'intervalle (soundness)
    const n = 400n; const w = g.hi.sub(g.lo);
    for (let i = 0n; i <= n; i++) { const x = g.lo.add(w.mul(new Rt(i, n))); if (inside(g, x) && !chainHolds(c.br, { x })) return false; }
    return true;
  }
  throw new Error(`affirmation ${c.t} inconnue`);
}

/** Écran de calculatrice : n chiffres significatifs, dernier chiffre arrondi (demi supérieur). */
const screen = (a, b, n) => {
  const q = ev(a).div(ev(b)); let e = 0; let p = ONE;
  while (q.cmp(p.mul(new Rt(10n))) >= 0) { p = p.mul(new Rt(10n)); e++; }
  while (q.cmp(p) < 0) { p = p.div(new Rt(10n)); e--; }
  const places = n - 1 - e; return show(roundAt(q, places));
};

/* ── l'oracle ──────────────────────────────────────────────────────────────── */
const letter = (k) => 'ABCDEF'[k];
export const ORACLE = {};
for (const [key, d] of Object.entries(DATA.oracle)) {
  if (d.k === 'rat') ORACLE[key] = R(show(ev(d.e)));
  else if (d.k === 'mc') { const hits = d.opts.map((o, k) => (claimTrue(o) ? k : -1)).filter((k) => k >= 0); ORACLE[key] = C(hits.length === 1 ? letter(hits[0]) : `?${hits.length}`); }
  else if (d.k === 'yn') ORACLE[key] = C(claimTrue(d.claim) ? 'A' : 'B');
}

/** Faits textuels : les nombres cités dans les énoncés et les corrigés (affirmations vraies), écrans de calculatrice, et les nombres imprimés dans le manuel. */
const BOOK_FACTS = [
  'round(8.342,2)=8.34', 'round(8.336,2)=8.34', 'round(8.345,2)=8.35', // دوري الآن 1 (p. 77) : 8,345 s'arrondit à 8,35, donc NON
  'round(14.4,0)=14', 'round(14.5,0)=15', 'round(15.49,0)=15', 'round(15.5,0)=16', // معارف 3 (p. 76)
  'round(3.647,0)=4', 'round(3.647,1)=3.6', 'round(3.647,2)=3.65',
];

export function audit(bank) {
  const errors = []; const own = bank.filter((b) => b.key.startsWith('ex-3am-hasr-adad-ushri-'));
  for (const f of BOOK_FACTS) if (!allHold(f)) errors.push(`fait du manuel faux : ${f}`);
  for (const [sheet, list] of Object.entries(DATA.facts)) for (const f of list) if (!allHold(f)) errors.push(`${sheet} : fait faux « ${f} »`);
  for (const [sheet, list] of Object.entries(DATA.screens)) for (const s of list) if (screen(s.a, s.b, s.n) !== s.shown) errors.push(`${sheet} : écran ${s.a}÷${s.b} = ${screen(s.a, s.b, s.n)} et non ${s.shown}`);
  const keys = new Set(own.map((b) => b.key));
  for (const k of Object.keys(DATA.oracle)) if (!keys.has(k)) errors.push(`${k} : entrée d'oracle sans question`);
  for (const { key, q } of own) {
    if (q.answerType === 'selfCheck') continue;
    const d = DATA.oracle[key]; if (!d) { errors.push(`${key} : aucune entrée d'oracle`); continue; }
    if (q.answerType === 'rational') {
      if (d.k !== 'rat') { errors.push(`${key} : rational sans entrée rat`); continue; }
      const val = ev(d.e); const declared = ev(String(q.expectedAnswer));
      if (!val.eq(declared)) errors.push(`${key} : clé ${q.expectedAnswer} ≠ ${show(val)}`);
      const sigs = q.misconceptionSignatures ?? []; if (sigs.length !== d.sigs.length) errors.push(`${key} : signatures ${sigs.length} ≠ ${d.sigs.length}`);
      sigs.forEach((cs, i) => { const ds = d.sigs[i]; if (ds && (String(cs.value) !== ds.v || cs.id !== ds.id)) errors.push(`${key} : signature du contenu ${cs.value}/${cs.id} ≠ ${ds.v}/${ds.id}`); });
      for (const s of d.sigs) {
        const via = ev(s.via); if (!via.eq(ev(s.v))) errors.push(`${key} : signature ${s.v} ≠ ${show(via)} (${s.via})`);
        if (via.eq(val)) errors.push(`${key} : la signature ${s.v} est la bonne réponse`);
        if (!/^MISC-/.test(s.id)) errors.push(`${key} : signature sans identifiant MISC`);
      }
    } else if (q.answerType === 'choice') {
      const claims = d.k === 'mc' ? d.opts : [d.claim, null];
      const n = d.k === 'mc' ? d.opts.length : 2;
      if (q.choices.length !== n) { errors.push(`${key} : ${q.choices.length} options pour ${n} affirmations`); continue; }
      const truth = d.k === 'mc' ? d.opts.map(claimTrue) : (() => { const t = claimTrue(d.claim); return [t, !t]; })();
      q.choices.forEach((c, i) => {
        if (truth[i] !== c.isCorrect) errors.push(`${key} : l'option ${c.id} est ${truth[i] ? 'vraie' : 'FAUSSE'} mais marquée ${c.isCorrect ? 'juste' : 'fausse'}`);
        if (!c.isCorrect && !/^MISC-/.test(c.misconceptionId ?? '')) errors.push(`${key} : le distracteur ${c.id} n'est pas étiqueté MISC-*`);
      });
      if (q.choices.filter((c) => c.isCorrect).length !== 1) errors.push(`${key} : il faut exactement une option juste`);
      void claims;
    } else errors.push(`${key} : type ${q.answerType} non géré`);
  }
  return errors;
}
