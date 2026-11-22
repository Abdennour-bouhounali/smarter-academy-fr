// Oracle du banc « muqaranat-natiqayn » (مقارنة عددين ناطقين, 3AM unité 4, 2026-10-26) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل الأول / الثاني / الثالث »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, ni dans packages/core :
//  - une arithmétique EXACTE propre à ce fichier : rationnels BigInt (pgcd propre) et polynômes à plusieurs lettres (x, a, b, π…),
//    un analyseur d'expressions ASCII (+ − * / ^, parenthèses, décimaux) ; π est comparé par une valeur à 40 chiffres ;
//  - DATA.oracle[exo:q] décrit la question : « val » (valeur d'une expression), « coef » (coefficient d'un développement),
//    « choice » (une AFFIRMATION par option, évaluée : exactement une est vraie, c'est celle que le contenu marque juste),
//    « self » (selfCheck : les faits cités sont recalculés) ;
//  - les affirmations : « cmp » (deux nombres comparés), « eq » (identité de polynômes), « sign » (signe d'un nombre),
//    « region » (« A > B pour x > c » : 5 valeurs de chaque côté de c ET le polynôme-différence est lu en c),
//    « imp » (implication sur une grille de couples (a, b) satisfaisant les données : « a − b = −0,3 ⇒ a < b » ; vide interdit),
//    « undecided » (les données laissent-elles plusieurs ordres possibles ?), « not » ;
//  - DATA.sigs : chaque signature d'erreur est la valeur de la MAUVAISE lecture, différente de la clé, étiquetée MISC-MUQ-* ;
//  - audit(bank) relit aussi les NOMBRES de l'énoncé : chaque nombre de la formule de l'oracle doit figurer dans le texte visible.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C } from './helpers.mjs';

const DATA = {
"oracle": {
"ex-3am-muqaranat-natiqayn-l1-001:q1": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "(-7/5)-(-4/3)",
"op": "<",
"b": "0"
},
"B": {
"t": "cmp",
"a": "(-7/5)-(-4/3)",
"op": ">",
"b": "0"
},
"C": {
"t": "cmp",
"a": "(-4/3)-(-7/5)",
"op": "<",
"b": "0"
}
}
},
"ex-3am-muqaranat-natiqayn-l1-001:q2": {
"k": "val",
"e": "(-7/5)-(-4/3)"
},
"ex-3am-muqaranat-natiqayn-l1-001:q3": {
"k": "self",
"facts": [
{
"t": "eq",
"a": "(-7/5)-(-4/3)",
"b": "-1/15"
}
]
},
"ex-3am-muqaranat-natiqayn-l1-002:q1": {
"k": "choice",
"opts": {
"A": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"a-b=1.2"
],
"concl": "a<b",
"den": 10,
"rng": 3
},
"B": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"a-b=1.2"
],
"concl": "a>b",
"den": 10,
"rng": 3
},
"C": {
"t": "undecided",
"vars": [
"a",
"b"
],
"given": [
"a-b=1.2"
],
"den": 10,
"rng": 3
}
}
},
"ex-3am-muqaranat-natiqayn-l1-002:q2": {
"k": "choice",
"opts": {
"A": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"b-a=3.5"
],
"concl": "a>b",
"den": 10,
"rng": 3
},
"B": {
"t": "undecided",
"vars": [
"a",
"b"
],
"given": [
"b-a=3.5"
],
"den": 10,
"rng": 3
},
"C": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"b-a=3.5"
],
"concl": "a<b",
"den": 10,
"rng": 3
}
}
},
"ex-3am-muqaranat-natiqayn-l1-002:q3": {
"k": "choice",
"opts": {
"A": {
"t": "undecided",
"vars": [
"a",
"b"
],
"given": [
"a-b=-0.3"
],
"den": 10,
"rng": 3
},
"B": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"a-b=-0.3"
],
"concl": "a<b",
"den": 10,
"rng": 3
},
"C": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"a-b=-0.3"
],
"concl": "a>b",
"den": 10,
"rng": 3
}
}
},
"ex-3am-muqaranat-natiqayn-l1-002:q4": {
"k": "choice",
"opts": {
"A": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"b-a=-2"
],
"concl": "a<b",
"den": 10,
"rng": 3
},
"B": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"b-a=-2"
],
"concl": "a>b",
"den": 10,
"rng": 3
},
"C": {
"t": "undecided",
"vars": [
"a",
"b"
],
"given": [
"b-a=-2"
],
"den": 10,
"rng": 3
}
}
},
"ex-3am-muqaranat-natiqayn-l1-002:q5": {
"k": "choice",
"opts": {
"A": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"a-b=0"
],
"concl": "a>b",
"den": 10,
"rng": 3
},
"B": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"a-b=0"
],
"concl": "a=b",
"den": 10,
"rng": 3
},
"C": {
"t": "undecided",
"vars": [
"a",
"b"
],
"given": [
"a-b=0"
],
"den": 10,
"rng": 3
},
"D": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"a-b=0"
],
"concl": "a<b",
"den": 10,
"rng": 3
}
}
},
"ex-3am-muqaranat-natiqayn-l1-003:q1": {
"k": "choice",
"opts": {
"A": {
"t": "sign",
"e": "14-5",
"s": "+"
},
"B": {
"t": "sign",
"e": "14-5",
"s": "-"
}
}
},
"ex-3am-muqaranat-natiqayn-l1-003:q2": {
"k": "choice",
"opts": {
"A": {
"t": "sign",
"e": "(-6)-(-13)",
"s": "-"
},
"B": {
"t": "sign",
"e": "(-6)-(-13)",
"s": "+"
}
}
},
"ex-3am-muqaranat-natiqayn-l1-003:q3": {
"k": "choice",
"opts": {
"A": {
"t": "sign",
"e": "(-9)-4",
"s": "-"
},
"B": {
"t": "sign",
"e": "(-9)-4",
"s": "+"
}
}
},
"ex-3am-muqaranat-natiqayn-l1-003:q4": {
"k": "choice",
"opts": {
"A": {
"t": "sign",
"e": "7-(-11)",
"s": "-"
},
"B": {
"t": "sign",
"e": "7-(-11)",
"s": "+"
}
}
},
"ex-3am-muqaranat-natiqayn-l1-003:q5": {
"k": "val",
"e": "(-6)-(-13)"
},
"ex-3am-muqaranat-natiqayn-l1-003:q6": {
"k": "val",
"e": "(-9)-4"
},
"ex-3am-muqaranat-natiqayn-l1-004:q1": {
"k": "val",
"e": "3/4-4/7"
},
"ex-3am-muqaranat-natiqayn-l1-004:q2": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "3/4",
"op": "<",
"b": "4/7"
},
"B": {
"t": "cmp",
"a": "3/4",
"op": ">",
"b": "4/7"
}
}
},
"ex-3am-muqaranat-natiqayn-l1-004:q3": {
"k": "val",
"e": "(-3/5)-(-5/8)"
},
"ex-3am-muqaranat-natiqayn-l1-004:q4": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "-3/5",
"op": ">",
"b": "-5/8"
},
"B": {
"t": "cmp",
"a": "-3/5",
"op": "<",
"b": "-5/8"
}
}
},
"ex-3am-muqaranat-natiqayn-l1-005:q1": {
"k": "val",
"e": "-(-5/9)"
},
"ex-3am-muqaranat-natiqayn-l1-005:q2": {
"k": "val",
"e": "-(7/12)"
},
"ex-3am-muqaranat-natiqayn-l1-005:q3": {
"k": "choice",
"opts": {
"A": {
"t": "undecided",
"vars": [
"a",
"b"
],
"given": [
"a-b=-5/9"
],
"den": 18,
"rng": 3
},
"B": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"a-b=-5/9"
],
"concl": "a<b",
"den": 18,
"rng": 3
},
"C": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"a-b=-5/9"
],
"concl": "a>b",
"den": 18,
"rng": 3
}
}
},
"ex-3am-muqaranat-natiqayn-l1-005:q4": {
"k": "choice",
"opts": {
"A": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"b-a=7/12"
],
"concl": "a<b",
"den": 12,
"rng": 3
},
"B": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"b-a=7/12"
],
"concl": "a>b",
"den": 12,
"rng": 3
},
"C": {
"t": "undecided",
"vars": [
"a",
"b"
],
"given": [
"b-a=7/12"
],
"den": 12,
"rng": 3
}
}
},
"ex-3am-muqaranat-natiqayn-l1-006:q1": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "3/8-5/12",
"op": ">",
"b": "0"
},
"B": {
"t": "cmp",
"a": "5/12-3/8",
"op": ">",
"b": "0"
},
"C": {
"t": "cmp",
"a": "5/12-3/8",
"op": "<",
"b": "0"
}
}
},
"ex-3am-muqaranat-natiqayn-l1-006:q2": {
"k": "choice",
"opts": {
"A": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"a-b=-2/7"
],
"concl": "a>b",
"den": 14,
"rng": 3
},
"B": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"a-b=-2/7"
],
"concl": "b<a",
"den": 14,
"rng": 3
},
"C": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"a-b=-2/7"
],
"concl": "a<b",
"den": 14,
"rng": 3
}
}
},
"ex-3am-muqaranat-natiqayn-l1-006:q3": {
"k": "self",
"facts": [
{
"t": "eq",
"a": "5/12-3/8",
"b": "1/24"
}
]
},
"ex-3am-muqaranat-natiqayn-l1-007:q1": {
"k": "choice",
"opts": {
"A": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"a-b>0"
],
"concl": "a>b",
"den": 10,
"rng": 3
},
"B": {
"t": "not",
"c": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"a-b>0"
],
"concl": "a>b",
"den": 10,
"rng": 3
}
}
}
},
"ex-3am-muqaranat-natiqayn-l1-007:q2": {
"k": "choice",
"opts": {
"A": {
"t": "not",
"c": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"a<b"
],
"concl": "a-b>0",
"den": 10,
"rng": 3
}
},
"B": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"a<b"
],
"concl": "a-b>0",
"den": 10,
"rng": 3
}
}
},
"ex-3am-muqaranat-natiqayn-l1-007:q3": {
"k": "choice",
"opts": {
"A": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"a-b=0"
],
"concl": "a=b",
"den": 10,
"rng": 3
},
"B": {
"t": "not",
"c": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"a-b=0"
],
"concl": "a=b",
"den": 10,
"rng": 3
}
}
}
},
"ex-3am-muqaranat-natiqayn-l1-007:q4": {
"k": "choice",
"opts": {
"A": {
"t": "not",
"c": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"a-b=-0.7"
],
"concl": "a>b",
"den": 10,
"rng": 3
}
},
"B": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"a-b=-0.7"
],
"concl": "a>b",
"den": 10,
"rng": 3
}
}
},
"ex-3am-muqaranat-natiqayn-l1-007:q5": {
"k": "choice",
"opts": {
"A": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"b-a<0"
],
"concl": "a>b",
"den": 10,
"rng": 3
},
"B": {
"t": "not",
"c": {
"t": "imp",
"vars": [
"a",
"b"
],
"given": [
"b-a<0"
],
"concl": "a>b",
"den": 10,
"rng": 3
}
}
}
},
"ex-3am-muqaranat-natiqayn-l1-008:q1": {
"k": "val",
"e": "6/9-2/3"
},
"ex-3am-muqaranat-natiqayn-l1-008:q2": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "6/9",
"op": "<",
"b": "2/3"
},
"B": {
"t": "cmp",
"a": "6/9",
"op": "=",
"b": "2/3"
},
"C": {
"t": "cmp",
"a": "6/9",
"op": ">",
"b": "2/3"
}
}
},
"ex-3am-muqaranat-natiqayn-l1-008:q3": {
"k": "val",
"e": "0.375-3/8"
},
"ex-3am-muqaranat-natiqayn-l1-008:q4": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "0.375",
"op": ">",
"b": "3/8"
},
"B": {
"t": "cmp",
"a": "0.375",
"op": "=",
"b": "3/8"
}
}
},
"ex-3am-muqaranat-natiqayn-l1-009:q1": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "4/9",
"op": "<",
"b": "4/7"
},
"B": {
"t": "cmp",
"a": "4/9",
"op": ">",
"b": "4/7"
}
}
},
"ex-3am-muqaranat-natiqayn-l1-009:q2": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "5/9",
"op": ">",
"b": "4/7"
},
"B": {
"t": "cmp",
"a": "5/9",
"op": "<",
"b": "4/7"
}
}
},
"ex-3am-muqaranat-natiqayn-l1-009:q3": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "-7/6",
"op": "<",
"b": "-9/8"
},
"B": {
"t": "cmp",
"a": "-7/6",
"op": ">",
"b": "-9/8"
}
}
},
"ex-3am-muqaranat-natiqayn-l1-009:q4": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "-1/4",
"op": "<",
"b": "1/9"
},
"B": {
"t": "cmp",
"a": "-1/4",
"op": ">",
"b": "1/9"
}
}
},
"ex-3am-muqaranat-natiqayn-l1-010:q1": {
"k": "val",
"e": "0.7-2/3"
},
"ex-3am-muqaranat-natiqayn-l1-010:q2": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "0.7",
"op": "<",
"b": "2/3"
},
"B": {
"t": "cmp",
"a": "0.7",
"op": ">",
"b": "2/3"
}
}
},
"ex-3am-muqaranat-natiqayn-l1-010:q3": {
"k": "val",
"e": "(-0.4)-(-3/7)"
},
"ex-3am-muqaranat-natiqayn-l1-010:q4": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "-0.4",
"op": ">",
"b": "-3/7"
},
"B": {
"t": "cmp",
"a": "-0.4",
"op": "<",
"b": "-3/7"
}
}
},
"ex-3am-muqaranat-natiqayn-l2-001:q1": {
"k": "val",
"e": "1/6+1/4"
},
"ex-3am-muqaranat-natiqayn-l2-001:q2": {
"k": "val",
"e": "4/5*1/2"
},
"ex-3am-muqaranat-natiqayn-l2-001:q3": {
"k": "val",
"e": "(1/6+1/4)-(4/5*1/2)"
},
"ex-3am-muqaranat-natiqayn-l2-001:q4": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "1/6+1/4",
"op": "<",
"b": "4/5*1/2"
},
"B": {
"t": "cmp",
"a": "1/6+1/4",
"op": ">",
"b": "4/5*1/2"
}
}
},
"ex-3am-muqaranat-natiqayn-l2-001:q5": {
"k": "self",
"facts": [
{
"t": "eq",
"a": "(1/6+1/4)-(4/5*1/2)",
"b": "1/60"
}
]
},
"ex-3am-muqaranat-natiqayn-l2-002:q1": {
"k": "val",
"e": "(-3/4)-1/6"
},
"ex-3am-muqaranat-natiqayn-l2-002:q2": {
"k": "val",
"e": "(-7/9)-1/6"
},
"ex-3am-muqaranat-natiqayn-l2-002:q3": {
"k": "val",
"e": "((-3/4)-1/6)-((-7/9)-1/6)"
},
"ex-3am-muqaranat-natiqayn-l2-002:q4": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "(-3/4)-1/6",
"op": ">",
"b": "(-7/9)-1/6"
},
"B": {
"t": "cmp",
"a": "(-3/4)-1/6",
"op": "<",
"b": "(-7/9)-1/6"
}
}
},
"ex-3am-muqaranat-natiqayn-l2-002:q5": {
"k": "self",
"facts": [
{
"t": "eq",
"a": "((-3/4)-1/6)-((-7/9)-1/6)",
"b": "1/36"
}
]
},
"ex-3am-muqaranat-natiqayn-l2-003:q1": {
"k": "val",
"e": "17.4/6.25"
},
"ex-3am-muqaranat-natiqayn-l2-003:q2": {
"k": "val",
"e": "13.94/5"
},
"ex-3am-muqaranat-natiqayn-l2-003:q3": {
"k": "val",
"e": "17.4/6.25-13.94/5"
},
"ex-3am-muqaranat-natiqayn-l2-003:q4": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "17.4/6.25",
"op": ">",
"b": "13.94/5"
},
"B": {
"t": "cmp",
"a": "17.4/6.25",
"op": "<",
"b": "13.94/5"
}
}
},
"ex-3am-muqaranat-natiqayn-l2-004:q1": {
"k": "val",
"e": "7.35/2.1"
},
"ex-3am-muqaranat-natiqayn-l2-004:q2": {
"k": "val",
"e": "7.35/2.1-12.16/3.5"
},
"ex-3am-muqaranat-natiqayn-l2-004:q3": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "7.35/2.1",
"op": "<",
"b": "12.16/3.5"
},
"B": {
"t": "cmp",
"a": "7.35/2.1",
"op": ">",
"b": "12.16/3.5"
}
}
},
"ex-3am-muqaranat-natiqayn-l2-004:q4": {
"k": "self",
"facts": [
{
"t": "eq",
"a": "7.35/2.1-12.16/3.5",
"b": "9/350"
}
]
},
"ex-3am-muqaranat-natiqayn-l2-005:q1": {
"k": "coef",
"e": "3*pi/8-pi/3",
"v": "pi",
"deg": 1
},
"ex-3am-muqaranat-natiqayn-l2-005:q2": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "3*pi/8",
"op": "<",
"b": "pi/3"
},
"B": {
"t": "cmp",
"a": "3*pi/8",
"op": ">",
"b": "pi/3"
}
}
},
"ex-3am-muqaranat-natiqayn-l2-005:q3": {
"k": "coef",
"e": "(-2*pi/5)-(-3*pi/7)",
"v": "pi",
"deg": 1
},
"ex-3am-muqaranat-natiqayn-l2-005:q4": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "(-2*pi/5)",
"op": ">",
"b": "(-3*pi/7)"
},
"B": {
"t": "cmp",
"a": "(-2*pi/5)",
"op": "<",
"b": "(-3*pi/7)"
}
}
},
"ex-3am-muqaranat-natiqayn-l2-006:q1": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "3/5",
"op": "<",
"b": "5/8"
},
"B": {
"t": "not",
"c": {
"t": "cmp",
"a": "3/5",
"op": "<",
"b": "5/8"
}
}
}
},
"ex-3am-muqaranat-natiqayn-l2-006:q2": {
"k": "choice",
"opts": {
"A": {
"t": "not",
"c": {
"t": "cmp",
"a": "-4/7",
"op": "<",
"b": "-3/5"
}
},
"B": {
"t": "cmp",
"a": "-4/7",
"op": "<",
"b": "-3/5"
}
}
},
"ex-3am-muqaranat-natiqayn-l2-006:q3": {
"k": "choice",
"opts": {
"A": {
"t": "eq",
"a": "3/4-4/7",
"b": "(3-4)/(4-7)"
},
"B": {
"t": "not",
"c": {
"t": "eq",
"a": "3/4-4/7",
"b": "(3-4)/(4-7)"
}
}
}
},
"ex-3am-muqaranat-natiqayn-l2-006:q4": {
"k": "choice",
"opts": {
"A": {
"t": "not",
"c": {
"t": "eq",
"a": "7/12-3/5",
"b": "-1/60"
}
},
"B": {
"t": "eq",
"a": "7/12-3/5",
"b": "-1/60"
}
}
},
"ex-3am-muqaranat-natiqayn-l2-006:q5": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "0.75",
"op": "=",
"b": "3/4"
},
"B": {
"t": "not",
"c": {
"t": "cmp",
"a": "0.75",
"op": "=",
"b": "3/4"
}
}
}
},
"ex-3am-muqaranat-natiqayn-l2-007:q1": {
"k": "choice",
"opts": {
"A": {
"t": "eq",
"a": "4/9-3/5",
"b": "(4-3)/(9-5)"
},
"B": {
"t": "eq",
"a": "4/9-3/5",
"b": "(20-27)/45"
}
}
},
"ex-3am-muqaranat-natiqayn-l2-007:q2": {
"k": "val",
"e": "4/9-3/5"
},
"ex-3am-muqaranat-natiqayn-l2-007:q3": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "4/9",
"op": "<",
"b": "3/5"
},
"B": {
"t": "cmp",
"a": "4/9",
"op": ">",
"b": "3/5"
}
}
},
"ex-3am-muqaranat-natiqayn-l2-007:q4": {
"k": "self",
"facts": [
{
"t": "eq",
"a": "4/9-3/5",
"b": "-7/45"
}
]
},
"ex-3am-muqaranat-natiqayn-l2-008:q1": {
"k": "val",
"e": "(-8/9)-(-7/8)"
},
"ex-3am-muqaranat-natiqayn-l2-008:q2": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "-8/9",
"op": ">",
"b": "-7/8"
},
"B": {
"t": "cmp",
"a": "-8/9",
"op": "<",
"b": "-7/8"
}
}
},
"ex-3am-muqaranat-natiqayn-l2-008:q3": {
"k": "self",
"facts": [
{
"t": "eq",
"a": "(-8/9)-(-7/8)",
"b": "-1/72"
}
]
},
"ex-3am-muqaranat-natiqayn-l2-009:q1": {
"k": "val",
"e": "1.05/3"
},
"ex-3am-muqaranat-natiqayn-l2-009:q2": {
"k": "val",
"e": "6/17-1.05/3"
},
"ex-3am-muqaranat-natiqayn-l2-009:q3": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "6/17",
"op": "<",
"b": "1.05/3"
},
"B": {
"t": "cmp",
"a": "6/17",
"op": ">",
"b": "1.05/3"
}
}
},
"ex-3am-muqaranat-natiqayn-l2-009:q4": {
"k": "self",
"facts": [
{
"t": "eq",
"a": "6/17-1.05/3",
"b": "1/340"
}
]
},
"ex-3am-muqaranat-natiqayn-l2-010:q1": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "5/9",
"op": ">",
"b": "6/11"
},
"B": {
"t": "cmp",
"a": "5/9",
"op": "<",
"b": "6/11"
},
"C": {
"t": "cmp",
"a": "-5/9",
"op": ">",
"b": "-6/11"
},
"D": {
"t": "cmp",
"a": "5/9-6/11",
"op": "<",
"b": "0"
}
}
},
"ex-3am-muqaranat-natiqayn-l2-010:q2": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "(-2/3)-(-5/8)",
"op": ">",
"b": "0"
},
"B": {
"t": "cmp",
"a": "-2/3",
"op": "<",
"b": "-5/8"
},
"C": {
"t": "cmp",
"a": "-2/3",
"op": ">",
"b": "-5/8"
}
}
},
"ex-3am-muqaranat-natiqayn-l2-010:q3": {
"k": "val",
"e": "9/14-2/3"
},
"ex-3am-muqaranat-natiqayn-l2-010:q4": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "9/14",
"op": ">",
"b": "2/3"
},
"B": {
"t": "cmp",
"a": "9/14",
"op": "<",
"b": "2/3"
}
}
},
"ex-3am-muqaranat-natiqayn-l3-001:q1": {
"k": "coef",
"e": "5*x*(x+4)-(x^2-4*x-36)",
"v": "x",
"deg": 1
},
"ex-3am-muqaranat-natiqayn-l3-001:q2": {
"k": "coef",
"e": "(2*x+6)^2",
"v": "x",
"deg": 1
},
"ex-3am-muqaranat-natiqayn-l3-001:q3": {
"k": "coef",
"e": "(5*x*(x+4)-(x^2-4*x-36))-((2*x+6)^2)",
"v": "x",
"deg": 0,
"const": true
},
"ex-3am-muqaranat-natiqayn-l3-001:q4": {
"k": "choice",
"opts": {
"A": {
"t": "not",
"c": {
"t": "const",
"e": "(5*x*(x+4)-(x^2-4*x-36))-((2*x+6)^2)"
}
},
"B": {
"t": "eq",
"a": "5*x*(x+4)-(x^2-4*x-36)",
"b": "(2*x+6)^2"
}
}
},
"ex-3am-muqaranat-natiqayn-l3-001:q5": {
"k": "self",
"facts": [
{
"t": "eq",
"a": "5*x*(x+4)-(x^2-4*x-36)",
"b": "(2*x+6)^2"
}
]
},
"ex-3am-muqaranat-natiqayn-l3-002:q1": {
"k": "val",
"e": "8*x-11",
"env": {
"x": 0
}
},
"ex-3am-muqaranat-natiqayn-l3-002:q2": {
"k": "val",
"e": "8*x-11",
"env": {
"x": 12
}
},
"ex-3am-muqaranat-natiqayn-l3-002:q3": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "-11",
"op": ">",
"b": "-2"
},
"B": {
"t": "cmp",
"a": "-2",
"op": ">",
"b": "-11"
}
}
},
"ex-3am-muqaranat-natiqayn-l3-002:q4": {
"k": "coef",
"e": "(8*x-11)-(7*x-2)",
"v": "x",
"deg": 0
},
"ex-3am-muqaranat-natiqayn-l3-002:q5": {
"k": "choice",
"opts": {
"A": {
"t": "region",
"a": "8*x-11",
"op": ">",
"b": "7*x-2",
"c": "9",
"side": "<",
"var": "x"
},
"B": {
"t": "region",
"a": "8*x-11",
"op": ">",
"b": "7*x-2",
"c": "9",
"side": ">",
"var": "x",
"diff": "x-9"
},
"C": {
"t": "forall",
"a": "8*x-11",
"op": ">",
"b": "7*x-2",
"xs": [
"-10",
"-3",
"0",
"2",
"6",
"7",
"20"
],
"var": "x"
}
}
},
"ex-3am-muqaranat-natiqayn-l3-003:q1": {
"k": "choice",
"opts": {
"A": {
"t": "forall",
"a": "5*x+2",
"op": ">",
"b": "3*x+14",
"xs": [
"0"
],
"var": "x"
},
"B": {
"t": "cmp",
"a": "14",
"op": ">",
"b": "2"
}
}
},
"ex-3am-muqaranat-natiqayn-l3-003:q2": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "5*10+2",
"op": ">",
"b": "3*10+14"
},
"B": {
"t": "forall",
"a": "5*x+2",
"op": "<",
"b": "3*x+14",
"xs": [
"10"
],
"var": "x"
}
}
},
"ex-3am-muqaranat-natiqayn-l3-003:q3": {
"k": "coef",
"e": "(5*x+2)-(3*x+14)",
"v": "x",
"deg": 0
},
"ex-3am-muqaranat-natiqayn-l3-003:q4": {
"k": "choice",
"opts": {
"A": {
"t": "region",
"a": "5*x+2",
"op": ">",
"b": "3*x+14",
"c": "6",
"side": ">",
"var": "x",
"diff": "2*x-12"
},
"B": {
"t": "forall",
"a": "5*x+2",
"op": ">",
"b": "3*x+14",
"xs": [
"-10",
"-3",
"0",
"2",
"6",
"7",
"20"
],
"var": "x"
},
"C": {
"t": "region",
"a": "5*x+2",
"op": "<",
"b": "3*x+14",
"c": "6",
"side": ">",
"var": "x"
}
}
},
"ex-3am-muqaranat-natiqayn-l3-003:q5": {
"k": "self",
"facts": [
{
"t": "eq",
"a": "(5*x+2)-(3*x+14)",
"b": "2*x-12"
}
]
},
"ex-3am-muqaranat-natiqayn-l3-004:q1": {
"k": "val",
"e": "3*x+10",
"env": {
"x": 10
}
},
"ex-3am-muqaranat-natiqayn-l3-004:q2": {
"k": "val",
"e": "4*x+3",
"env": {
"x": 10
}
},
"ex-3am-muqaranat-natiqayn-l3-004:q3": {
"k": "coef",
"e": "(3*x+10)-(4*x+3)",
"v": "x",
"deg": 0
},
"ex-3am-muqaranat-natiqayn-l3-004:q4": {
"k": "choice",
"opts": {
"A": {
"t": "region",
"a": "3*x+10",
"op": ">",
"b": "4*x+3",
"c": "7",
"side": ">",
"var": "x"
},
"B": {
"t": "forall",
"a": "3*x+10",
"op": ">",
"b": "4*x+3",
"xs": [
"-10",
"-3",
"0",
"2",
"6",
"7",
"20"
],
"var": "x"
},
"C": {
"t": "region",
"a": "3*x+10",
"op": ">",
"b": "4*x+3",
"c": "7",
"side": "<",
"var": "x",
"diff": "7-x"
}
}
},
"ex-3am-muqaranat-natiqayn-l3-005:q1": {
"k": "coef",
"e": "2*(x+5)",
"v": "x",
"deg": 0
},
"ex-3am-muqaranat-natiqayn-l3-005:q2": {
"k": "coef",
"e": "(2*(x+5))-(2*x+3)",
"v": "x",
"deg": 0,
"const": true
},
"ex-3am-muqaranat-natiqayn-l3-005:q3": {
"k": "choice",
"opts": {
"A": {
"t": "mixed",
"a": "2*(x+5)",
"b": "2*x+3",
"xs": [
"-10",
"-3",
"0",
"2",
"6",
"7",
"20"
],
"var": "x"
},
"B": {
"t": "forall",
"a": "2*(x+5)",
"op": ">",
"b": "2*x+3",
"xs": [
"-10",
"-3",
"0",
"2",
"6",
"7",
"20"
],
"var": "x"
},
"C": {
"t": "forall",
"a": "2*(x+5)",
"op": "<",
"b": "2*x+3",
"xs": [
"-10",
"-3",
"0",
"2",
"6",
"7",
"20"
],
"var": "x"
}
}
},
"ex-3am-muqaranat-natiqayn-l3-006:q1": {
"k": "coef",
"e": "(x^2+5*x+2)-(2*x+2)",
"v": "x",
"deg": 1
},
"ex-3am-muqaranat-natiqayn-l3-006:q2": {
"k": "choice",
"opts": {
"A": {
"t": "forall",
"a": "x^2+5*x+2",
"op": "<",
"b": "2*x+2",
"xs": [
"0.5",
"1",
"2",
"5",
"10"
],
"var": "x"
},
"B": {
"t": "mixed",
"a": "x^2+5*x+2",
"b": "2*x+2",
"xs": [
"0.5",
"1",
"2",
"5",
"10"
],
"var": "x"
},
"C": {
"t": "forall",
"a": "x^2+5*x+2",
"op": ">",
"b": "2*x+2",
"xs": [
"0.5",
"1",
"2",
"5",
"10"
],
"var": "x"
}
}
},
"ex-3am-muqaranat-natiqayn-l3-006:q3": {
"k": "self",
"facts": [
{
"t": "eq",
"a": "(x^2+5*x+2)-(2*x+2)",
"b": "x*(x+3)"
}
]
},
"ex-3am-muqaranat-natiqayn-l3-007:q1": {
"k": "coef",
"e": "(x+3)*(x+1)",
"v": "x",
"deg": 0
},
"ex-3am-muqaranat-natiqayn-l3-007:q2": {
"k": "coef",
"e": "((x+3)*(x+1))-(x^2+4*x+5)",
"v": "x",
"deg": 0,
"const": true
},
"ex-3am-muqaranat-natiqayn-l3-007:q3": {
"k": "choice",
"opts": {
"A": {
"t": "forall",
"a": "(x+3)*(x+1)",
"op": "<",
"b": "x^2+4*x+5",
"xs": [
"-10",
"-3",
"0",
"2",
"6",
"7",
"20"
],
"var": "x"
},
"B": {
"t": "forall",
"a": "(x+3)*(x+1)",
"op": ">",
"b": "x^2+4*x+5",
"xs": [
"-10",
"-3",
"0",
"2",
"6",
"7",
"20"
],
"var": "x"
},
"C": {
"t": "mixed",
"a": "(x+3)*(x+1)",
"b": "x^2+4*x+5",
"xs": [
"-10",
"-3",
"0",
"2",
"6",
"7",
"20"
],
"var": "x"
}
}
},
"ex-3am-muqaranat-natiqayn-l3-008:q1": {
"k": "val",
"e": "5*x-7",
"env": {
"x": 8
}
},
"ex-3am-muqaranat-natiqayn-l3-008:q2": {
"k": "val",
"e": "3*x+5",
"env": {
"x": 8
}
},
"ex-3am-muqaranat-natiqayn-l3-008:q3": {
"k": "coef",
"e": "(5*x-7)-(3*x+5)",
"v": "x",
"deg": 1
},
"ex-3am-muqaranat-natiqayn-l3-008:q4": {
"k": "choice",
"opts": {
"A": {
"t": "forall",
"a": "3*x+5",
"op": ">",
"b": "5*x-7",
"xs": [
"-10",
"-3",
"0",
"2",
"6",
"7",
"20"
],
"var": "x"
},
"B": {
"t": "region",
"a": "3*x+5",
"op": ">",
"b": "5*x-7",
"c": "6",
"side": "<",
"var": "x",
"diff": "12-2*x"
},
"C": {
"t": "region",
"a": "3*x+5",
"op": ">",
"b": "5*x-7",
"c": "6",
"side": ">",
"var": "x"
}
}
},
"ex-3am-muqaranat-natiqayn-l3-009:q1": {
"k": "choice",
"opts": {
"A": {
"t": "region",
"a": "6*x+1",
"op": ">",
"b": "5*x+4",
"c": "3",
"side": "<",
"var": "x"
},
"B": {
"t": "forall",
"a": "6*x+1",
"op": ">",
"b": "5*x+4",
"xs": [
"-10",
"-3",
"0",
"2",
"6",
"7",
"20"
],
"var": "x"
},
"C": {
"t": "region",
"a": "6*x+1",
"op": ">",
"b": "5*x+4",
"c": "3",
"side": ">",
"var": "x",
"diff": "x-3"
}
}
},
"ex-3am-muqaranat-natiqayn-l3-009:q2": {
"k": "choice",
"opts": {
"A": {
"t": "region",
"a": "2*x+9",
"op": ">",
"b": "3*x+9",
"c": "0",
"side": "<",
"var": "x",
"diff": "-x"
},
"B": {
"t": "region",
"a": "2*x+9",
"op": ">",
"b": "3*x+9",
"c": "0",
"side": ">",
"var": "x"
},
"C": {
"t": "forall",
"a": "2*x+9",
"op": ">",
"b": "3*x+9",
"xs": [
"-10",
"-3",
"0",
"2",
"6",
"7",
"20"
],
"var": "x"
}
}
},
"ex-3am-muqaranat-natiqayn-l3-009:q3": {
"k": "choice",
"opts": {
"A": {
"t": "mixed",
"a": "x^2+1",
"b": "x^2-2",
"xs": [
"-10",
"-3",
"0",
"2",
"6",
"7",
"20"
],
"var": "x"
},
"B": {
"t": "forall",
"a": "x^2+1",
"op": ">",
"b": "x^2-2",
"xs": [
"-10",
"-3",
"0",
"2",
"6",
"7",
"20"
],
"var": "x"
},
"C": {
"t": "forall",
"a": "x^2+1",
"op": "<",
"b": "x^2-2",
"xs": [
"-10",
"-3",
"0",
"2",
"6",
"7",
"20"
],
"var": "x"
}
}
},
"ex-3am-muqaranat-natiqayn-l3-009:q4": {
"k": "self",
"facts": [
{
"t": "eq",
"a": "(6*x+1)-(5*x+4)",
"b": "x-3"
}
]
},
"ex-3am-muqaranat-natiqayn-l3-010:q1": {
"k": "val",
"e": "3*x-6",
"env": {
"x": 5
}
},
"ex-3am-muqaranat-natiqayn-l3-010:q2": {
"k": "val",
"e": "x+4",
"env": {
"x": 5
}
},
"ex-3am-muqaranat-natiqayn-l3-010:q3": {
"k": "choice",
"opts": {
"A": {
"t": "not",
"c": {
"t": "eq",
"a": "3*x-6",
"b": "x+4"
}
},
"B": {
"t": "eq",
"a": "3*x-6",
"b": "x+4"
}
}
},
"ex-3am-muqaranat-natiqayn-l3-010:q4": {
"k": "coef",
"e": "(x+4)-(3*x-6)",
"v": "x",
"deg": 0
},
"ex-3am-muqaranat-natiqayn-l3-010:q5": {
"k": "choice",
"opts": {
"A": {
"t": "region",
"a": "3*x-6",
"op": ">",
"b": "x+4",
"c": "5",
"side": "<",
"var": "x"
},
"B": {
"t": "forall",
"a": "3*x-6",
"op": ">",
"b": "x+4",
"xs": [
"-10",
"-3",
"0",
"2",
"6",
"7",
"20"
],
"var": "x"
},
"C": {
"t": "region",
"a": "3*x-6",
"op": ">",
"b": "x+4",
"c": "5",
"side": ">",
"var": "x",
"diff": "2*x-10"
}
}
},
"ex-3am-muqaranat-natiqayn-l4-001:q1": {
"k": "coef",
"e": "(x+4)*(x+2)",
"v": "x",
"deg": 1
},
"ex-3am-muqaranat-natiqayn-l4-001:q2": {
"k": "coef",
"e": "(x+3)^2",
"v": "x",
"deg": 0
},
"ex-3am-muqaranat-natiqayn-l4-001:q3": {
"k": "coef",
"e": "((x+4)*(x+2))-((x+3)^2)",
"v": "x",
"deg": 0,
"const": true
},
"ex-3am-muqaranat-natiqayn-l4-001:q4": {
"k": "choice",
"opts": {
"A": {
"t": "forall",
"a": "(x+3)^2",
"op": ">",
"b": "(x+4)*(x+2)",
"xs": [
"0.5",
"1",
"2",
"5",
"10"
],
"var": "x"
},
"B": {
"t": "forall",
"a": "(x+4)*(x+2)",
"op": ">",
"b": "(x+3)^2",
"xs": [
"0.5",
"1",
"2",
"5",
"10"
],
"var": "x"
},
"C": {
"t": "mixed",
"a": "(x+4)*(x+2)",
"b": "(x+3)^2",
"xs": [
"0.5",
"1",
"2",
"5",
"10"
],
"var": "x"
}
}
},
"ex-3am-muqaranat-natiqayn-l4-001:q5": {
"k": "self",
"facts": [
{
"t": "eq",
"a": "((x+4)*(x+2))-((x+3)^2)",
"b": "-1"
}
]
},
"ex-3am-muqaranat-natiqayn-l4-002:q1": {
"k": "coef",
"e": "(2*x+3)*(x+1)",
"v": "x",
"deg": 1
},
"ex-3am-muqaranat-natiqayn-l4-002:q2": {
"k": "coef",
"e": "(x+2)*(2*x+1)",
"v": "x",
"deg": 0
},
"ex-3am-muqaranat-natiqayn-l4-002:q3": {
"k": "coef",
"e": "((2*x+3)*(x+1))-((x+2)*(2*x+1))",
"v": "x",
"deg": 0,
"const": true
},
"ex-3am-muqaranat-natiqayn-l4-002:q4": {
"k": "choice",
"opts": {
"A": {
"t": "forall",
"a": "(2*x+3)*(x+1)",
"op": "<",
"b": "(x+2)*(2*x+1)",
"xs": [
"0.5",
"1",
"2",
"5",
"10"
],
"var": "x"
},
"B": {
"t": "mixed",
"a": "(2*x+3)*(x+1)",
"b": "(x+2)*(2*x+1)",
"xs": [
"0.5",
"1",
"2",
"5",
"10"
],
"var": "x"
},
"C": {
"t": "forall",
"a": "(2*x+3)*(x+1)",
"op": ">",
"b": "(x+2)*(2*x+1)",
"xs": [
"0.5",
"1",
"2",
"5",
"10"
],
"var": "x"
}
}
},
"ex-3am-muqaranat-natiqayn-l4-003:q1": {
"k": "val",
"e": "3.7*10^(-2)"
},
"ex-3am-muqaranat-natiqayn-l4-003:q2": {
"k": "val",
"e": "3.7*10^(-2)-36/1000"
},
"ex-3am-muqaranat-natiqayn-l4-003:q3": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "3.7*10^(-2)",
"op": "<",
"b": "36/1000"
},
"B": {
"t": "cmp",
"a": "3.7*10^(-2)",
"op": ">",
"b": "36/1000"
}
}
},
"ex-3am-muqaranat-natiqayn-l4-003:q4": {
"k": "val",
"e": "7*10^(-2)-5/80"
},
"ex-3am-muqaranat-natiqayn-l4-003:q5": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "7*10^(-2)",
"op": ">",
"b": "5/80"
},
"B": {
"t": "cmp",
"a": "7*10^(-2)",
"op": "<",
"b": "5/80"
}
}
},
"ex-3am-muqaranat-natiqayn-l4-004:q1": {
"k": "hyp",
"a": "9",
"b": "12"
},
"ex-3am-muqaranat-natiqayn-l4-004:q2": {
"k": "val",
"e": "9+12-15",
"atoms": false
},
"ex-3am-muqaranat-natiqayn-l4-004:q3": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "9+12",
"op": "<",
"b": "15"
},
"B": {
"t": "cmp",
"a": "15",
"op": "<",
"b": "9+12"
}
}
},
"ex-3am-muqaranat-natiqayn-l4-005:q1": {
"k": "hyp",
"a": "3",
"b": "4"
},
"ex-3am-muqaranat-natiqayn-l4-005:q2": {
"k": "coef",
"e": "3*x+4*x-5*x",
"v": "x",
"deg": 1,
"atoms": false
},
"ex-3am-muqaranat-natiqayn-l4-005:q3": {
"k": "choice",
"opts": {
"A": {
"t": "mixed",
"a": "3*x+4*x",
"b": "5*x",
"xs": [
"0.5",
"1",
"2",
"5",
"10"
],
"var": "x"
},
"B": {
"t": "forall",
"a": "3*x+4*x",
"op": ">",
"b": "5*x",
"xs": [
"0.5",
"1",
"2",
"5",
"10"
],
"var": "x"
},
"C": {
"t": "forall",
"a": "3*x+4*x",
"op": "<",
"b": "5*x",
"xs": [
"0.5",
"1",
"2",
"5",
"10"
],
"var": "x"
}
}
},
"ex-3am-muqaranat-natiqayn-l4-006:q1": {
"k": "coef",
"e": "(2*((x+7)+(x+1)))-(4*(x+4))",
"v": "x",
"deg": 0,
"const": true
},
"ex-3am-muqaranat-natiqayn-l4-006:q2": {
"k": "coef",
"e": "(x+7)*(x+1)",
"v": "x",
"deg": 0
},
"ex-3am-muqaranat-natiqayn-l4-006:q3": {
"k": "coef",
"e": "(x+4)^2",
"v": "x",
"deg": 0
},
"ex-3am-muqaranat-natiqayn-l4-006:q4": {
"k": "coef",
"e": "((x+7)*(x+1))-((x+4)^2)",
"v": "x",
"deg": 0,
"const": true
},
"ex-3am-muqaranat-natiqayn-l4-006:q5": {
"k": "choice",
"opts": {
"A": {
"t": "and",
"c": [
{
"t": "eq",
"a": "2*((x+7)+(x+1))",
"b": "4*(x+4)"
},
{
"t": "forall",
"a": "(x+4)^2",
"op": ">",
"b": "(x+7)*(x+1)",
"xs": [
"0.5",
"1",
"2",
"5",
"10"
],
"var": "x"
}
]
},
"B": {
"t": "and",
"c": [
{
"t": "eq",
"a": "2*((x+7)+(x+1))",
"b": "4*(x+4)"
},
{
"t": "eq",
"a": "(x+7)*(x+1)",
"b": "(x+4)^2"
}
]
},
"C": {
"t": "forall",
"a": "(x+7)*(x+1)",
"op": ">",
"b": "(x+4)^2",
"xs": [
"0.5",
"1",
"2",
"5",
"10"
],
"var": "x"
},
"D": {
"t": "mixed",
"a": "(x+7)*(x+1)",
"b": "(x+4)^2",
"xs": [
"0.5",
"1",
"2",
"5",
"10"
],
"var": "x"
}
}
},
"ex-3am-muqaranat-natiqayn-l4-007:q1": {
"k": "val",
"e": "x^2",
"env": {
"x": 7
}
},
"ex-3am-muqaranat-natiqayn-l4-007:q2": {
"k": "val",
"e": "(x-1)*(x+1)",
"env": {
"x": 7
}
},
"ex-3am-muqaranat-natiqayn-l4-007:q3": {
"k": "coef",
"e": "(x-1)*(x+1)",
"v": "x",
"deg": 0
},
"ex-3am-muqaranat-natiqayn-l4-007:q4": {
"k": "coef",
"e": "x^2-(x-1)*(x+1)",
"v": "x",
"deg": 0,
"const": true
},
"ex-3am-muqaranat-natiqayn-l4-007:q5": {
"k": "choice",
"opts": {
"A": {
"t": "forall",
"a": "x^2",
"op": "<",
"b": "(x-1)*(x+1)",
"xs": [
"-10",
"-3",
"0",
"2",
"6",
"7",
"20"
],
"var": "x"
},
"B": {
"t": "mixed",
"a": "x^2",
"b": "(x-1)*(x+1)",
"xs": [
"-10",
"-3",
"0",
"2",
"6",
"7",
"20"
],
"var": "x"
},
"C": {
"t": "forall",
"a": "x^2",
"op": ">",
"b": "(x-1)*(x+1)",
"xs": [
"-10",
"-3",
"0",
"2",
"6",
"7",
"20"
],
"var": "x"
}
}
},
"ex-3am-muqaranat-natiqayn-l4-008:q1": {
"k": "val",
"e": "6.4*10^5-64*10^4"
},
"ex-3am-muqaranat-natiqayn-l4-008:q2": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "6.4*10^5",
"op": "<",
"b": "64*10^4"
},
"B": {
"t": "cmp",
"a": "6.4*10^5",
"op": "=",
"b": "64*10^4"
}
}
},
"ex-3am-muqaranat-natiqayn-l4-008:q3": {
"k": "val",
"e": "2.5*10^(-3)-3/1000"
},
"ex-3am-muqaranat-natiqayn-l4-008:q4": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "2.5*10^(-3)",
"op": "<",
"b": "3/1000"
},
"B": {
"t": "cmp",
"a": "2.5*10^(-3)",
"op": ">",
"b": "3/1000"
}
}
},
"ex-3am-muqaranat-natiqayn-l4-008:q5": {
"k": "val",
"e": "8*10^4-79000"
},
"ex-3am-muqaranat-natiqayn-l4-008:q6": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "8*10^4",
"op": "<",
"b": "79000"
},
"B": {
"t": "cmp",
"a": "8*10^4",
"op": ">",
"b": "79000"
}
}
},
"ex-3am-muqaranat-natiqayn-l4-009:q1": {
"k": "coef",
"e": "(x-3)^2",
"v": "x",
"deg": 1
},
"ex-3am-muqaranat-natiqayn-l4-009:q2": {
"k": "coef",
"e": "(x-3)^2",
"v": "x",
"deg": 0
},
"ex-3am-muqaranat-natiqayn-l4-009:q3": {
"k": "coef",
"e": "((x-3)^2)-(x^2-6*x+5)",
"v": "x",
"deg": 0,
"const": true
},
"ex-3am-muqaranat-natiqayn-l4-009:q4": {
"k": "choice",
"opts": {
"A": {
"t": "mixed",
"a": "(x-3)^2",
"b": "x^2-6*x+5",
"xs": [
"-10",
"-3",
"0",
"2",
"6",
"7",
"20"
],
"var": "x"
},
"B": {
"t": "forall",
"a": "(x-3)^2",
"op": ">",
"b": "x^2-6*x+5",
"xs": [
"-10",
"-3",
"0",
"2",
"6",
"7",
"20"
],
"var": "x"
},
"C": {
"t": "forall",
"a": "(x-3)^2",
"op": "<",
"b": "x^2-6*x+5",
"xs": [
"-10",
"-3",
"0",
"2",
"6",
"7",
"20"
],
"var": "x"
}
}
},
"ex-3am-muqaranat-natiqayn-l4-010:q1": {
"k": "val",
"e": "(x+5)^2",
"env": {
"x": 100
}
},
"ex-3am-muqaranat-natiqayn-l4-010:q2": {
"k": "val",
"e": "x*(x+10)",
"env": {
"x": 100
}
},
"ex-3am-muqaranat-natiqayn-l4-010:q3": {
"k": "val",
"e": "(x+5)^2-x*(x+10)",
"env": {
"x": 100
}
},
"ex-3am-muqaranat-natiqayn-l4-010:q4": {
"k": "coef",
"e": "(x+5)^2-x*(x+10)",
"v": "x",
"deg": 0,
"const": true
},
"ex-3am-muqaranat-natiqayn-l4-010:q5": {
"k": "choice",
"opts": {
"A": {
"t": "forall",
"a": "(x+5)^2",
"op": ">",
"b": "x*(x+10)",
"xs": [
"-10",
"-3",
"0",
"2",
"6",
"7",
"20"
],
"var": "x"
},
"B": {
"t": "forall",
"a": "(x+5)^2",
"op": "<",
"b": "x*(x+10)",
"xs": [
"-10",
"-3",
"0",
"2",
"6",
"7",
"20"
],
"var": "x"
},
"C": {
"t": "mixed",
"a": "(x+5)^2",
"b": "x*(x+10)",
"xs": [
"-10",
"-3",
"0",
"2",
"6",
"7",
"20"
],
"var": "x"
}
}
},
"ex-3am-muqaranat-natiqayn-l5-001:q1": {
"k": "coef",
"e": "2*((3*x+2)+(2*x-1))",
"v": "x",
"deg": 1
},
"ex-3am-muqaranat-natiqayn-l5-001:q2": {
"k": "val",
"e": "2*((3*x+2)+(2*x-1))",
"env": {
"x": 30
}
},
"ex-3am-muqaranat-natiqayn-l5-001:q3": {
"k": "hyp",
"a": "24",
"b": "32"
},
"ex-3am-muqaranat-natiqayn-l5-001:q4": {
"k": "coef",
"e": "(750*L)-(3000+700*L)",
"v": "L",
"deg": 1
},
"ex-3am-muqaranat-natiqayn-l5-001:q5": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "750*40",
"op": ">",
"b": "3000+700*40"
},
"B": {
"t": "cmp",
"a": "750*40",
"op": "<",
"b": "3000+700*40"
}
}
},
"ex-3am-muqaranat-natiqayn-l5-001:q6": {
"k": "choice",
"opts": {
"A": {
"t": "region",
"a": "750*L",
"op": "<",
"b": "3000+700*L",
"c": "60",
"side": ">",
"var": "L"
},
"B": {
"t": "region",
"a": "750*L",
"op": "<",
"b": "3000+700*L",
"c": "60",
"side": "<",
"var": "L",
"diff": "50*L-3000"
},
"C": {
"t": "forall",
"a": "750*L",
"op": "<",
"b": "3000+700*L",
"xs": [
"10",
"40",
"60",
"80",
"200"
],
"var": "L"
}
}
},
"ex-3am-muqaranat-natiqayn-l5-001:q7": {
"k": "self",
"facts": [
{
"t": "eq",
"a": "(750*L)-(3000+700*L)",
"b": "50*L-3000"
}
]
},
"ex-3am-muqaranat-natiqayn-l5-002:q1": {
"k": "val",
"e": "80/4",
"atoms": false
},
"ex-3am-muqaranat-natiqayn-l5-002:q2": {
"k": "val",
"e": "8*x",
"env": {
"x": 20
}
},
"ex-3am-muqaranat-natiqayn-l5-002:q3": {
"k": "val",
"e": "400-8*x",
"env": {
"x": 20
}
},
"ex-3am-muqaranat-natiqayn-l5-002:q4": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "8*20",
"op": "<",
"b": "400-8*20"
},
"B": {
"t": "cmp",
"a": "8*20",
"op": ">",
"b": "400-8*20"
}
}
},
"ex-3am-muqaranat-natiqayn-l5-002:q5": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "8*40",
"op": "<",
"b": "400-8*40"
},
"B": {
"t": "cmp",
"a": "8*40",
"op": ">",
"b": "400-8*40"
}
}
},
"ex-3am-muqaranat-natiqayn-l5-002:q6": {
"k": "coef",
"e": "(400-8*x)-(8*x)",
"v": "x",
"deg": 0
},
"ex-3am-muqaranat-natiqayn-l5-002:q7": {
"k": "choice",
"opts": {
"A": {
"t": "region",
"a": "400-8*x",
"op": ">",
"b": "8*x",
"c": "25",
"side": ">",
"var": "x"
},
"B": {
"t": "mixed",
"a": "400-8*x",
"b": "8*x",
"xs": [
"0",
"5",
"10",
"15",
"20"
],
"var": "x"
},
"C": {
"t": "forall",
"a": "400-8*x",
"op": ">",
"b": "8*x",
"xs": [
"0",
"5",
"10",
"15",
"20"
],
"var": "x"
}
}
},
"ex-3am-muqaranat-natiqayn-l5-002:q8": {
"k": "self",
"facts": [
{
"t": "eq",
"a": "(400-8*x)-(8*x)",
"b": "400-16*x"
}
]
},
"ex-3am-muqaranat-natiqayn-l5-003:q1": {
"k": "val",
"e": "3/4*2/5"
},
"ex-3am-muqaranat-natiqayn-l5-003:q2": {
"k": "val",
"e": "2/3*2/5"
},
"ex-3am-muqaranat-natiqayn-l5-003:q3": {
"k": "val",
"e": "3/10-4/15"
},
"ex-3am-muqaranat-natiqayn-l5-003:q4": {
"k": "choice",
"opts": {
"A": {
"t": "and",
"c": [
{
"t": "cmp",
"a": "3/10",
"op": "<",
"b": "2/5"
},
{
"t": "cmp",
"a": "3/10",
"op": "<",
"b": "4/15"
}
]
},
"B": {
"t": "and",
"c": [
{
"t": "cmp",
"a": "2/5",
"op": "<",
"b": "3/10"
},
{
"t": "cmp",
"a": "2/5",
"op": "<",
"b": "4/15"
}
]
},
"C": {
"t": "and",
"c": [
{
"t": "cmp",
"a": "4/15",
"op": "<",
"b": "2/5"
},
{
"t": "cmp",
"a": "4/15",
"op": "<",
"b": "3/10"
}
]
}
}
},
"ex-3am-muqaranat-natiqayn-l5-003:q5": {
"k": "val",
"e": "2/5+3/10+4/15-1"
},
"ex-3am-muqaranat-natiqayn-l5-003:q6": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "2/5+3/10+4/15",
"op": "<",
"b": "1"
},
"B": {
"t": "cmp",
"a": "2/5+3/10+4/15",
"op": ">",
"b": "1"
}
}
},
"ex-3am-muqaranat-natiqayn-l5-003:q7": {
"k": "val",
"e": "2400000/30",
"atoms": false
},
"ex-3am-muqaranat-natiqayn-l5-004:q1": {
"k": "val",
"e": "5/12-3/8"
},
"ex-3am-muqaranat-natiqayn-l5-004:q2": {
"k": "val",
"e": "3/8-1/6"
},
"ex-3am-muqaranat-natiqayn-l5-004:q3": {
"k": "choice",
"opts": {
"A": {
"t": "and",
"c": [
{
"t": "cmp",
"a": "3/8",
"op": ">",
"b": "5/12"
},
{
"t": "cmp",
"a": "3/8",
"op": ">",
"b": "1/6"
}
]
},
"B": {
"t": "and",
"c": [
{
"t": "cmp",
"a": "1/6",
"op": ">",
"b": "5/12"
},
{
"t": "cmp",
"a": "1/6",
"op": ">",
"b": "3/8"
}
]
},
"C": {
"t": "and",
"c": [
{
"t": "cmp",
"a": "5/12",
"op": ">",
"b": "3/8"
},
{
"t": "cmp",
"a": "5/12",
"op": ">",
"b": "1/6"
}
]
}
}
},
"ex-3am-muqaranat-natiqayn-l5-004:q4": {
"k": "val",
"e": "3/8+1/6+5/12-1"
},
"ex-3am-muqaranat-natiqayn-l5-004:q5": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "3/8+1/6+5/12",
"op": "<",
"b": "1"
},
"B": {
"t": "cmp",
"a": "3/8+1/6+5/12",
"op": ">",
"b": "1"
}
}
},
"ex-3am-muqaranat-natiqayn-l5-004:q6": {
"k": "val",
"e": "240/24",
"atoms": false
},
"ex-3am-muqaranat-natiqayn-l5-005:q1": {
"k": "val",
"e": "4/9-5/12"
},
"ex-3am-muqaranat-natiqayn-l5-005:q2": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "4/9",
"op": "<",
"b": "5/12"
},
"B": {
"t": "cmp",
"a": "4/9",
"op": ">",
"b": "5/12"
}
}
},
"ex-3am-muqaranat-natiqayn-l5-005:q3": {
"k": "val",
"e": "4/9+5/12+1/6-1"
},
"ex-3am-muqaranat-natiqayn-l5-005:q4": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "4/9+5/12+1/6",
"op": ">",
"b": "1"
},
"B": {
"t": "cmp",
"a": "4/9+5/12+1/6",
"op": "<",
"b": "1"
}
}
},
"ex-3am-muqaranat-natiqayn-l5-005:q5": {
"k": "self",
"facts": [
{
"t": "eq",
"a": "4/9+5/12+1/6-1",
"b": "1/36"
}
]
},
"ex-3am-muqaranat-natiqayn-l5-006:q1": {
"k": "val",
"e": "19/24-23/29"
},
"ex-3am-muqaranat-natiqayn-l5-006:q2": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "19/24",
"op": ">",
"b": "23/29"
},
"B": {
"t": "cmp",
"a": "19/24",
"op": "<",
"b": "23/29"
}
}
},
"ex-3am-muqaranat-natiqayn-l5-006:q3": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "19/24",
"op": "<",
"b": "23/29"
},
"B": {
"t": "cmp",
"a": "19/24",
"op": ">",
"b": "23/29"
}
}
},
"ex-3am-muqaranat-natiqayn-l5-006:q4": {
"k": "self",
"facts": [
{
"t": "eq",
"a": "19/24-23/29",
"b": "-1/696"
}
]
},
"ex-3am-muqaranat-natiqayn-l5-007:q1": {
"k": "val",
"e": "900+18*h",
"env": {
"h": 40
}
},
"ex-3am-muqaranat-natiqayn-l5-007:q2": {
"k": "val",
"e": "600+23*h",
"env": {
"h": 40
}
},
"ex-3am-muqaranat-natiqayn-l5-007:q3": {
"k": "coef",
"e": "(600+23*h)-(900+18*h)",
"v": "h",
"deg": 1
},
"ex-3am-muqaranat-natiqayn-l5-007:q4": {
"k": "choice",
"opts": {
"A": {
"t": "region",
"a": "900+18*h",
"op": "<",
"b": "600+23*h",
"c": "60",
"side": ">",
"var": "h",
"diff": "300-5*h"
},
"B": {
"t": "region",
"a": "900+18*h",
"op": "<",
"b": "600+23*h",
"c": "60",
"side": "<",
"var": "h"
},
"C": {
"t": "forall",
"a": "900+18*h",
"op": "<",
"b": "600+23*h",
"xs": [
"0",
"10",
"40",
"60",
"80"
],
"var": "h"
}
}
},
"ex-3am-muqaranat-natiqayn-l5-007:q5": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "900+18*40",
"op": "<",
"b": "600+23*40"
},
"B": {
"t": "cmp",
"a": "900+18*40",
"op": ">",
"b": "600+23*40"
}
}
},
"ex-3am-muqaranat-natiqayn-l5-007:q6": {
"k": "self",
"facts": [
{
"t": "eq",
"a": "(900+18*h)-(600+23*h)",
"b": "300-5*h"
}
]
},
"ex-3am-muqaranat-natiqayn-l5-008:q1": {
"k": "val",
"e": "400+10*t",
"env": {
"t": 150
}
},
"ex-3am-muqaranat-natiqayn-l5-008:q2": {
"k": "val",
"e": "12*t",
"env": {
"t": 150
}
},
"ex-3am-muqaranat-natiqayn-l5-008:q3": {
"k": "coef",
"e": "(12*t)-(400+10*t)",
"v": "t",
"deg": 1
},
"ex-3am-muqaranat-natiqayn-l5-008:q4": {
"k": "choice",
"opts": {
"A": {
"t": "forall",
"a": "400+10*t",
"op": "<",
"b": "12*t",
"xs": [
"0",
"50",
"200",
"250",
"400"
],
"var": "t"
},
"B": {
"t": "region",
"a": "400+10*t",
"op": "<",
"b": "12*t",
"c": "200",
"side": ">",
"var": "t",
"diff": "400-2*t"
},
"C": {
"t": "region",
"a": "400+10*t",
"op": "<",
"b": "12*t",
"c": "200",
"side": "<",
"var": "t"
}
}
},
"ex-3am-muqaranat-natiqayn-l5-008:q5": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "400+10*150",
"op": "<",
"b": "12*150"
},
"B": {
"t": "cmp",
"a": "400+10*150",
"op": ">",
"b": "12*150"
}
}
},
"ex-3am-muqaranat-natiqayn-l5-008:q6": {
"k": "self",
"facts": [
{
"t": "eq",
"a": "(400+10*t)-(12*t)",
"b": "400-2*t"
}
]
},
"ex-3am-muqaranat-natiqayn-l5-009:q1": {
"k": "val",
"e": "48/0.75"
},
"ex-3am-muqaranat-natiqayn-l5-009:q2": {
"k": "val",
"e": "48/0.75-95/1.5"
},
"ex-3am-muqaranat-natiqayn-l5-009:q3": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "95/1.5",
"op": ">",
"b": "48/0.75"
},
"B": {
"t": "cmp",
"a": "95/1.5",
"op": "<",
"b": "48/0.75"
}
}
},
"ex-3am-muqaranat-natiqayn-l5-009:q4": {
"k": "val",
"e": "6*(48/0.75-95/1.5)",
"atoms": false
},
"ex-3am-muqaranat-natiqayn-l5-009:q5": {
"k": "self",
"facts": [
{
"t": "eq",
"a": "48/0.75-95/1.5",
"b": "2/3"
}
]
},
"ex-3am-muqaranat-natiqayn-l5-010:q1": {
"k": "coef",
"e": "5*(x+10)",
"v": "x",
"deg": 0
},
"ex-3am-muqaranat-natiqayn-l5-010:q2": {
"k": "coef",
"e": "6*(x+4)",
"v": "x",
"deg": 0
},
"ex-3am-muqaranat-natiqayn-l5-010:q3": {
"k": "coef",
"e": "(5*(x+10))-(6*(x+4))",
"v": "x",
"deg": 0
},
"ex-3am-muqaranat-natiqayn-l5-010:q4": {
"k": "choice",
"opts": {
"A": {
"t": "region",
"a": "5*(x+10)",
"op": ">",
"b": "6*(x+4)",
"c": "26",
"side": "<",
"var": "x",
"diff": "26-x"
},
"B": {
"t": "region",
"a": "5*(x+10)",
"op": ">",
"b": "6*(x+4)",
"c": "26",
"side": ">",
"var": "x"
},
"C": {
"t": "forall",
"a": "5*(x+10)",
"op": ">",
"b": "6*(x+4)",
"xs": [
"0",
"10",
"26",
"30",
"39"
],
"var": "x"
}
}
},
"ex-3am-muqaranat-natiqayn-l5-010:q5": {
"k": "choice",
"opts": {
"A": {
"t": "cmp",
"a": "5*(30+10)",
"op": ">",
"b": "6*(30+4)"
},
"B": {
"t": "cmp",
"a": "5*(30+10)",
"op": "<",
"b": "6*(30+4)"
}
}
},
"ex-3am-muqaranat-natiqayn-l5-010:q6": {
"k": "self",
"facts": [
{
"t": "eq",
"a": "(5*(x+10))-(6*(x+4))",
"b": "26-x"
}
]
}
},
"sigs": {
"ex-3am-muqaranat-natiqayn-l1-001:q2": [
{
"e": "(-7-(-4))/(5-3)",
"v": "-3/2",
"id": "MISC-MUQ-SUB-TERMS",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l1-003:q5": [
{
"e": "-6-13",
"v": "-19",
"id": "MISC-MUQ-BRACKET",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l1-004:q1": [
{
"e": "(3-4)/(4-7)",
"v": "1/3",
"id": "MISC-MUQ-SUB-TERMS",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l1-004:q3": [
{
"e": "(-3-(-5))/(5-8)",
"v": "-2/3",
"id": "MISC-MUQ-SUB-TERMS",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l1-005:q1": [
{
"e": "-5/9",
"v": "-5/9",
"id": "MISC-MUQ-ORDER-SUB",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l1-005:q2": [
{
"e": "7/12",
"v": "7/12",
"id": "MISC-MUQ-ORDER-SUB",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l1-008:q1": [
{
"e": "(6-2)/(9-3)",
"v": "4/6",
"id": "MISC-MUQ-SUB-TERMS",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l2-001:q3": [
{
"e": "(5-2)/(12-5)",
"v": "3/7",
"id": "MISC-MUQ-SUB-TERMS",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l2-002:q3": [
{
"e": "((-7/9)-1/6)-((-3/4)-1/6)",
"v": "-1/36",
"id": "MISC-MUQ-ORDER-SUB",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l2-003:q3": [
{
"e": "13.94/5-17.4/6.25",
"v": "0.004",
"id": "MISC-MUQ-ORDER-SUB",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l2-004:q2": [
{
"e": "12.16/3.5-7.35/2.1",
"v": "-9/350",
"id": "MISC-MUQ-ORDER-SUB",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l2-005:q1": [
{
"e": "1/3-3/8",
"v": "-1/24",
"id": "MISC-MUQ-ORDER-SUB",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l2-005:q3": [
{
"e": "(-2/5)-3/7",
"v": "-29/35",
"id": "MISC-MUQ-BRACKET",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l2-007:q2": [
{
"e": "(4-3)/(9-5)",
"v": "1/4",
"id": "MISC-MUQ-SUB-TERMS",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l2-008:q1": [
{
"e": "(-7/8)-(-8/9)",
"v": "1/72",
"id": "MISC-MUQ-ORDER-SUB",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l2-009:q2": [
{
"e": "1.05/3-6/17",
"v": "-1/340",
"id": "MISC-MUQ-ORDER-SUB",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l2-010:q3": [
{
"e": "(9-2)/(14-3)",
"v": "7/11",
"id": "MISC-MUQ-SUB-TERMS",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l3-001:q1": [
{
"e": "20-4",
"v": "16",
"id": "MISC-MUQ-BRACKET",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l3-002:q4": [
{
"e": "-11-2",
"v": "-13",
"id": "MISC-MUQ-BRACKET",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l3-003:q3": [
{
"e": "2+14",
"v": "16",
"id": "MISC-MUQ-BRACKET",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l3-004:q3": [
{
"e": "10+3",
"v": "13",
"id": "MISC-MUQ-BRACKET",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l3-005:q2": [
{
"e": "10+3",
"v": "13",
"id": "MISC-MUQ-BRACKET",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l3-008:q3": [
{
"e": "3-5",
"v": "-2",
"id": "MISC-MUQ-ORDER-SUB",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l3-010:q4": [
{
"e": "6-4",
"v": "2",
"id": "MISC-MUQ-BRACKET",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l4-001:q3": [
{
"e": "8+9",
"v": "17",
"id": "MISC-MUQ-BRACKET",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l4-002:q3": [
{
"e": "3+2",
"v": "5",
"id": "MISC-MUQ-BRACKET",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l4-003:q4": [
{
"e": "5/80-7*10^(-2)",
"v": "-3/400",
"id": "MISC-MUQ-ORDER-SUB",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l4-004:q2": [
{
"e": "15-9-12",
"v": "-6",
"id": "MISC-MUQ-ORDER-SUB",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l4-005:q2": [
{
"e": "5-3-4",
"v": "-2",
"id": "MISC-MUQ-ORDER-SUB",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l4-006:q4": [
{
"e": "7+16",
"v": "23",
"id": "MISC-MUQ-BRACKET",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l4-007:q4": [
{
"e": "0-1",
"v": "-1",
"id": "MISC-MUQ-BRACKET",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l4-009:q3": [
{
"e": "9+5",
"v": "14",
"id": "MISC-MUQ-BRACKET",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l4-010:q3": [
{
"e": "x*(x+10)-(x+5)^2",
"v": "-25",
"id": "MISC-MUQ-ORDER-SUB",
"env": {
"x": 100
}
}
],
"ex-3am-muqaranat-natiqayn-l5-001:q4": [
{
"e": "750+700",
"v": "1450",
"id": "MISC-MUQ-BRACKET",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l5-003:q3": [
{
"e": "(3-4)/(10-15)",
"v": "1/5",
"id": "MISC-MUQ-SUB-TERMS",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l5-003:q5": [
{
"e": "1-(2/5+3/10+4/15)",
"v": "1/30",
"id": "MISC-MUQ-ORDER-SUB",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l5-004:q1": [
{
"e": "(5-3)/(12-8)",
"v": "2/4",
"id": "MISC-MUQ-SUB-TERMS",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l5-005:q1": [
{
"e": "(4-5)/(9-12)",
"v": "1/3",
"id": "MISC-MUQ-SUB-TERMS",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l5-005:q3": [
{
"e": "1-(4/9+5/12+1/6)",
"v": "-1/36",
"id": "MISC-MUQ-ORDER-SUB",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l5-006:q1": [
{
"e": "(19-23)/(24-29)",
"v": "4/5",
"id": "MISC-MUQ-SUB-TERMS",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l5-009:q2": [
{
"e": "95/1.5-48/0.75",
"v": "-2/3",
"id": "MISC-MUQ-ORDER-SUB",
"env": {}
}
],
"ex-3am-muqaranat-natiqayn-l5-010:q3": [
{
"e": "50+24",
"v": "74",
"id": "MISC-MUQ-BRACKET",
"env": {}
}
]
},
"facts": {}
};

/* ── Rationnels exacts ─────────────────────────────────────────────────── */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
class Q {
  constructor(n, d = 1n) {
    n = BigInt(n); d = BigInt(d);
    if (d === 0n) throw new Error('division par zéro');
    if (d < 0n) { n = -n; d = -d; }
    const g = gcd(n, d) || 1n; this.n = n / g; this.d = d / g;
  }
  static of(s) {
    s = String(s).trim().replace('−', '-');
    if (s.includes('/')) { const [a, b] = s.split('/'); return Q.of(a).div(Q.of(b)); }
    const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(s);
    if (!m) throw new Error(`nombre illisible « ${s} »`);
    const f = m[3] ?? '';
    const q = new Q(BigInt(m[2] + f), 10n ** BigInt(f.length));
    return m[1] ? q.neg() : q;
  }
  add(o) { return new Q(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { return new Q(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { return new Q(this.n * o.n, this.d * o.d); }
  div(o) { return new Q(this.n * o.d, this.d * o.n); }
  neg() { return new Q(-this.n, this.d); }
  sgn() { return this.n < 0n ? -1 : this.n > 0n ? 1 : 0; }
  cmp(o) { return this.sub(o).sgn(); }
  eq(o) { return this.n === o.n && this.d === o.d; }
  isZero() { return this.n === 0n; }
  toString() { return this.d === 1n ? `${this.n}` : `${this.n}/${this.d}`; }
}
const ZERO = new Q(0n), ONE = new Q(1n);
const PI = new Q(31415926535897932384626433832795028841971n, 10n ** 40n);

/* ── Polynômes à plusieurs lettres (coefficients rationnels) ───────────── */
const mkey = (m) => Object.keys(m).filter((k) => m[k] > 0).sort().map((k) => `${k}^${m[k]}`).join('*');
const unkey = (s) => { const m = {}; if (s) for (const t of s.split('*')) { const [k, e] = t.split('^'); m[k] = Number(e); } return m; };
class P {
  constructor(map = new Map()) { this.t = new Map([...map].filter(([, c]) => !c.isZero())); }
  static c(q) { return new P(new Map([['', q]])); }
  static v(name) { return new P(new Map([[mkey({ [name]: 1 }), ONE]])); }
  add(o) { const m = new Map(this.t); for (const [k, c] of o.t) m.set(k, (m.get(k) ?? ZERO).add(c)); return new P(m); }
  neg() { return new P(new Map([...this.t].map(([k, c]) => [k, c.neg()]))); }
  sub(o) { return this.add(o.neg()); }
  mul(o) {
    const m = new Map();
    for (const [k1, c1] of this.t) for (const [k2, c2] of o.t) {
      const a = unkey(k1), b = unkey(k2);
      for (const [v, e] of Object.entries(b)) a[v] = (a[v] ?? 0) + e;
      const k = mkey(a); m.set(k, (m.get(k) ?? ZERO).add(c1.mul(c2)));
    }
    return new P(m);
  }
  pow(n) { let r = P.c(ONE); for (let i = 0; i < n; i++) r = r.mul(this); return r; }
  isConst() { return [...this.t.keys()].every((k) => k === ''); }
  constVal() { return this.t.get('') ?? ZERO; }
  equals(o) { return this.sub(o).t.size === 0; }
  coef(v, deg) { // coefficient (rationnel) de v^deg, les autres lettres devant être absentes
    let r = ZERO;
    for (const [k, c] of this.t) { const m = unkey(k); const others = Object.keys(m).filter((x) => x !== v); if (others.length) throw new Error('lettres en trop'); if ((m[v] ?? 0) === deg) r = r.add(c); }
    return r;
  }
  /** substitue des lettres par des rationnels (π reste π tant qu'on ne demande pas `num`) */
  subst(env) {
    let out = new P();
    for (const [k, c] of this.t) {
      const m = unkey(k); let coef = c; const rest = {};
      for (const [v, e] of Object.entries(m)) {
        if (v in env) { let w = ONE; for (let i = 0; i < e; i++) w = w.mul(env[v]); coef = coef.mul(w); } else rest[v] = e;
      }
      out = out.add(new P(new Map([[mkey(rest), coef]])));
    }
    return out;
  }
  num(env = {}) { const p = this.subst({ pi: PI, ...env }); if (!p.isConst()) throw new Error('lettres non évaluées'); return p.constVal(); }
}

function parse(src) {
  const toks = String(src).replace(/\s+/g, '').match(/\d+(?:\.\d+)?|[A-Za-z]+|[-+*/^()]/g) ?? [];
  if (toks.join('') !== String(src).replace(/\s+/g, '')) throw new Error(`caractères inattendus dans « ${src} »`);
  let i = 0;
  const peek = () => toks[i];
  const take = (t) => { if (toks[i] !== t) throw new Error(`« ${t} » attendu dans « ${src} »`); i++; };
  const expr = () => {
    let l = term();
    while (peek() === '+' || peek() === '-') { const o = toks[i++]; const r = term(); l = o === '+' ? l.add(r) : l.sub(r); }
    return l;
  };
  const term = () => {
    let l = unary();
    while (peek() === '*' || peek() === '/') {
      const o = toks[i++]; const r = unary();
      if (o === '*') l = l.mul(r);
      else { if (!r.isConst() || r.constVal().isZero()) throw new Error(`division par un non-nombre dans « ${src} »`); l = l.mul(P.c(ONE.div(r.constVal()))); }
    }
    return l;
  };
  const unary = () => { if (peek() === '-') { i++; return unary().neg(); } if (peek() === '+') { i++; return unary(); } return power(); };
  const power = () => {
    const b = atom();
    if (peek() === '^') {
      i++; const par = peek() === '('; if (par) i++;
      const neg = peek() === '-'; if (neg) i++;
      const e = Number(toks[i++]); if (!Number.isInteger(e)) throw new Error('exposant');
      if (par) take(')');
      if (!neg) return b.pow(e);
      if (!b.isConst() || b.constVal().isZero()) throw new Error('exposant négatif sur un non-nombre');
      return P.c(ONE.div(b.pow(e).constVal()));
    }
    return b;
  };
  const atom = () => {
    const t = toks[i++];
    if (t === undefined) throw new Error(`fin inattendue dans « ${src} »`);
    if (t === '(') { const e = expr(); take(')'); return e; }
    if (/^\d/.test(t)) return P.c(Q.of(t));
    if (/^[A-Za-z]+$/.test(t)) return P.v(t);
    throw new Error(`jeton « ${t} » dans « ${src} »`);
  };
  const r = expr();
  if (i !== toks.length) throw new Error(`reste « ${toks.slice(i).join('')} » dans « ${src} »`);
  return r;
}
const poly = (s) => parse(s);
const envQ = (env = {}) => Object.fromEntries(Object.entries(env).map(([k, v]) => [k, Q.of(v)]));
const value = (s, env = {}) => poly(s).num(envQ(env));

/* ── relations « lhs OP rhs » ──────────────────────────────────────────── */
const REL = /^(.*?)(<=|>=|<|>|=)(.*)$/;
function relHolds(str, env) {
  const m = REL.exec(str.replace(/\s+/g, ''));
  if (!m) throw new Error(`relation illisible « ${str} »`);
  const s = poly(m[1]).sub(poly(m[3])).num(envQ(env)).sgn();
  return { '<': s < 0, '>': s > 0, '=': s === 0, '<=': s <= 0, '>=': s >= 0 }[m[2]];
}

/* ── affirmations ──────────────────────────────────────────────────────── */
function witnesses(c) {
  const [u, v] = c.vars; const den = BigInt(c.den ?? 10), rng = BigInt(c.rng ?? 3);
  const simple = c.given.every((g) => /^[a-z]=-?[\d./]+$/.test(g.replace(/\s+/g, '')));
  if (simple) { const env = {}; for (const g of c.given) { const [k, x] = g.replace(/\s+/g, '').split('='); env[k] = Q.of(x); } return [env]; }
  const out = [];
  for (let i = -rng * den; i <= rng * den; i++) for (let j = -rng * den; j <= rng * den; j++) {
    const env = { [u]: new Q(i, den), [v]: new Q(j, den) };
    if (c.given.every((g) => relHolds(g, env))) out.push(env);
  }
  return out;
}
const relOf = (env, u, v) => { const s = env[u].cmp(env[v]); return s < 0 ? '<' : s > 0 ? '>' : '='; };
function evalClaim(c) {
  switch (c.t) {
    case 'cmp': { const s = poly(c.a).sub(poly(c.b)).num().sgn(); return { '<': s < 0, '>': s > 0, '=': s === 0 }[c.op]; }
    case 'eq': return poly(c.a).equals(poly(c.b));
    case 'sign': { const s = poly(c.e).num().sgn(); return { '+': s > 0, '-': s < 0, '0': s === 0 }[c.s]; }
    case 'not': return !evalClaim(c.c);
    case 'imp': {
      const w = witnesses(c);
      if (w.length < 8) throw new Error(`implication vide (${w.length} témoin(s)) : ${c.given.join(', ')}`);
      return w.every((env) => relHolds(c.concl, env));
    }
    case 'undecided': {
      const w = witnesses(c);
      if (!w.length) throw new Error(`données impossibles : ${c.given.join(', ')}`);
      return new Set(w.map((env) => relOf(env, c.vars[0], c.vars[1]))).size > 1;
    }
    case 'region': {
      const x = c.var, k0 = Q.of(c.c);
      const diff = poly(c.a).sub(poly(c.b));
      const offs = ['1/3', '1', '5/2', '4', '11'].map((s) => Q.of(s));
      const at = (q) => diff.subst({ [x]: q }).num().sgn();
      const want = { '<': (s) => s < 0, '>': (s) => s > 0, '=': (s) => s === 0 }[c.op];
      const mine = c.side === '>' ? offs.map((o) => k0.add(o)) : offs.map((o) => k0.sub(o));
      const other = c.side === '>' ? offs.map((o) => k0.sub(o)) : offs.map((o) => k0.add(o));
      if (c.diff && !diff.equals(poly(c.diff))) throw new Error(`région : ${c.a} − ${c.b} ≠ ${c.diff}`);
      return mine.every((q) => want(at(q))) && !other.some((q) => want(at(q))) && at(k0) === 0;
    }
    case 'and': return c.c.every((x) => evalClaim(x));
    case 'const': return poly(c.e).isConst();
    case 'forall': case 'mixed': {
      const diff = poly(c.a).sub(poly(c.b)); const x = c.var ?? 'x';
      const ss = c.xs.map((v) => diff.subst({ [x]: Q.of(v) }).num().sgn());
      if (c.t === 'mixed') return new Set(ss).size > 1;
      const want = { '<': (s) => s < 0, '>': (s) => s > 0, '=': (s) => s === 0 }[c.op];
      return ss.every(want);
    }
    default: throw new Error(`affirmation inconnue « ${c.t} »`);
  }
}

/* ── décision d'une question ───────────────────────────────────────────── */
function decide(spec) {
  if (spec.k === 'val') return R(value(spec.e, spec.env ?? {}).toString());
  if (spec.k === 'coef') { const p = poly(spec.e); if (spec.const && !p.isConst()) throw new Error(`« ${spec.e} » n'est pas constant`); return R(p.coef(spec.v, spec.deg).toString()); }
  if (spec.k === 'hyp') { // hypoténuse entière : √(a² + b²), carré parfait exigé
    const sq = (Q.of(spec.a).mul(Q.of(spec.a))).add(Q.of(spec.b).mul(Q.of(spec.b)));
    if (sq.d !== 1n) throw new Error('hypoténuse non entière');
    let r = BigInt(Math.floor(Math.sqrt(Number(sq.n)))); while (r * r > sq.n) r--; while ((r + 1n) * (r + 1n) <= sq.n) r++;
    if (r * r !== sq.n) throw new Error(`${sq.n} n'est pas un carré parfait`);
    return R(r.toString());
  }
  if (spec.k === 'choice') {
    const truths = Object.entries(spec.opts).filter(([, c]) => evalClaim(c)).map(([id]) => id);
    return truths.length === 1 ? C(truths[0]) : null;
  }
  return null;
}
export const ORACLE = {};
for (const [key, spec] of Object.entries(DATA.oracle)) { const r = decide(spec); if (r) ORACLE[key] = r; }

/* ── lecture des nombres de l'énoncé ───────────────────────────────────── */
function textAtoms(txt) {
  const out = new Set();
  let s = String(txt).replace(/\\left|\\right/g, '').replace(/\\,/g, '');
  for (const m of s.matchAll(/\\dfrac\{(\d+)\}\{(\d+)\}/g)) out.add(new Q(BigInt(m[1]), BigInt(m[2])).toString());
  s = s.replace(/\\dfrac\{(\d+)\}\{(\d+)\}/g, ' ');
  for (const m of s.matchAll(/(\d+)\{,\}(\d+)/g)) out.add(Q.of(`${m[1]}.${m[2]}`).toString());
  s = s.replace(/(\d+)\{,\}(\d+)/g, ' ');
  for (const m of s.matchAll(/\d+(?:[.,]\d+)?/g)) out.add(Q.of(m[0].replace(',', '.')).toString());
  return out;
}
function exprAtoms(e) {
  const out = new Set();
  const fr = /(?<![\d.])(\d+)\/(\d+)(?![\d.])/g; // entier / entier : un seul nombre ; avec décimaux : deux nombres
  for (const m of String(e).matchAll(fr)) out.add(new Q(BigInt(m[1]), BigInt(m[2])).toString());
  for (const m of String(e).replace(fr, ' ').matchAll(/\d+(?:\.\d+)?/g)) out.add(Q.of(m[0]).toString());
  return out;
}

/* ── audit ─────────────────────────────────────────────────────────────── */
const MISC = new Set(['MISC-MUQ-ABS', 'MISC-MUQ-ORDER-SUB', 'MISC-MUQ-NUMERATOR', 'MISC-MUQ-SUB-TERMS', 'MISC-MUQ-NEED-VALUES',
  'MISC-MUQ-ABS-DIFF', 'MISC-MUQ-COEF', 'MISC-MUQ-BRACKET']);

export function audit(bank) {
  const bad = [];
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content/practice/3am/muqaranat-natiqayn');
  const cache = new Map();
  const exercise = (key) => {
    const id = key.split(':')[0];
    if (!cache.has(id)) cache.set(id, JSON.parse(readFileSync(join(root, `level-${id.match(/-l(\d)-/)[1]}`, `${id}.json`), 'utf8')));
    return cache.get(id);
  };
  const seen = new Set();
  for (const { key, q } of bank) {
    const spec = DATA.oracle[key];
    const ex = exercise(key);
    if (!spec) { bad.push(`${key}: aucune description d'oracle`); continue; }
    try {
      if (q.answerType === 'rational') {
        if (!['val', 'coef', 'hyp'].includes(spec.k)) bad.push(`${key}: spec « ${spec.k} » pour une réponse rationnelle`);
        else {
          const exp = Q.of(q.expectedAnswer);
          if (!exp.eq(Q.of(ORACLE[key].value))) bad.push(`${key}: clé ${q.expectedAnswer} ≠ ${ORACLE[key].value}`);
          if (/\//.test(String(q.expectedAnswer)) && exp.toString() !== String(q.expectedAnswer)) bad.push(`${key}: clé non réduite`);
          // les nombres de la formule figurent dans le texte visible
          if (spec.k === 'hyp') {
            const have = textAtoms([ex.statement.content, ...(ex.statement.formulas ?? []), q.lead ?? '', q.statement].join(' '));
            for (const a of [spec.a, spec.b]) if (!have.has(Q.of(a).toString())) bad.push(`${key}: le côté ${a} n'apparaît pas dans l'énoncé`);
          } else if (spec.atoms !== false) {
            const vis = [ex.statement.content, ...(ex.statement.formulas ?? []), q.lead ?? '', q.statement,
              ...((ex.statement.table?.rows ?? []).flat()), ...(ex.statement.table?.head ?? [])].join(' ');
            const have = textAtoms(vis);
            for (const a of exprAtoms(spec.e)) if (!have.has(a)) bad.push(`${key}: le nombre ${a} de la formule « ${spec.e} » n'apparaît pas dans l'énoncé`);
            for (const [l, v] of Object.entries(spec.env ?? {})) { const a = Q.of(v); if (!have.has((a.sgn() < 0 ? a.neg() : a).toString())) bad.push(`${key}: la valeur ${l} = ${v} n'apparaît pas dans l'énoncé`); }
          }
        }
      }
      if (q.answerType === 'choice') {
        if (spec.k !== 'choice') bad.push(`${key}: spec « ${spec.k} » pour un QCM`);
        else {
          const right = q.choices.filter((c) => c.isCorrect);
          if (right.length !== 1) bad.push(`${key}: ${right.length} bonne(s) option(s)`);
          const truths = Object.entries(spec.opts).filter(([, c]) => evalClaim(c)).map(([id]) => id);
          if (truths.length !== 1) bad.push(`${key}: ${truths.length} affirmation(s) vraie(s) (${truths.join(',')}) — il en faut exactement une`);
          else if (truths[0] !== right[0]?.id) bad.push(`${key}: l'oracle choisit ${truths[0]}, le contenu ${right[0]?.id}`);
          for (const c of q.choices) {
            if (!spec.opts[c.id]) bad.push(`${key}: option ${c.id} sans affirmation`);
            if (!c.isCorrect && !MISC.has(c.misconceptionId)) bad.push(`${key}: distracteur ${c.id} sans MISC-MUQ-*`);
          }
        }
      }
      if (q.answerType === 'selfCheck') {
        if (spec.k !== 'self') bad.push(`${key}: spec « ${spec.k} » pour un selfCheck`);
        for (const f of spec.facts ?? []) if (!evalClaim(f)) bad.push(`${key}: fait faux ${JSON.stringify(f)}`);
      }
      // signatures d'erreur
      const sigs = DATA.sigs[key] ?? [];
      const decl = q.misconceptionSignatures ?? [];
      if (decl.length !== sigs.length) bad.push(`${key}: ${decl.length} signature(s) dans le contenu, ${sigs.length} vérifiée(s)`);
      for (const s of sigs) {
        const v = value(s.e, s.env ?? {});
        if (!v.eq(Q.of(s.v))) bad.push(`${key}: la lecture « ${s.e} » vaut ${v}, pas ${s.v}`);
        if (!MISC.has(s.id)) bad.push(`${key}: ${s.id} n'est pas une MISC-MUQ-*`);
        if (!decl.some((d) => Q.of(d.value).eq(v) && d.id === s.id)) bad.push(`${key}: signature ${s.v}/${s.id} absente du contenu`);
        if (q.answerType === 'rational' && v.eq(Q.of(q.expectedAnswer))) bad.push(`${key}: la signature ${s.v} est la bonne réponse`);
      }
    } catch (e) { bad.push(`${key}: ${e.message}`); }
    // faits de la feuille (une fois)
    if (!seen.has(ex.id)) {
      seen.add(ex.id);
      for (const f of DATA.facts[ex.id] ?? []) { try { if (!evalClaim(f)) bad.push(`${ex.id}: fait faux ${JSON.stringify(f)}`); } catch (e) { bad.push(`${ex.id}: ${e.message}`); } }
      for (const qq of ex.questions) {
        const k = `${ex.id}:${qq.id}`;
        if (!DATA.oracle[k]) bad.push(`${k}: question sans oracle`);
      }
    }
  }
  return bad;
}
