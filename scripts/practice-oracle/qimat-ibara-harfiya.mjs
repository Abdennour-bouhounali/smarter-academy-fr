// Oracle du banc « qimat-ibara-harfiya » (حساب قيمة عبارة حرفية, 3AM unité 4, 2026-10-26) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل الثاني / الثالث »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, ni dans packages/core :
//  - un évaluateur EXACT propre à ce fichier : rationnels BigInt (pgcd propre) et polynômes à plusieurs lettres, un analyseur
//    d'expressions (+ − × / ^, parenthèses, produit implicite « 3x », « 2(x+1) », « (x+2)(x-3) », « xy », décimaux, la lettre π) ;
//    la priorité est celle de l'école : la puissance lie avant le moins unaire (-3^2 = -9), d'où la valeur DES MAUVAISES lectures ;
//  - DATA.oracle : pour chaque question la FORMULE (retapée en ASCII) et les valeurs des lettres : « val » (valeur de la
//    formule), « coef » (coefficient d'un développement), « pick » (QCM de lignes de substitution : une seule ligne vaut la cible,
//    les lignes qui gardent une lettre ne sont pas une substitution), « cmp » (décision : deux NOMBRES comparés), « picoef »
//    (coefficient de π d'une valeur exacte), « floor » / « round » (valeur approchée à 10^-k par défaut / au plus près, π à 40 chiffres) ;
//  - DATA.sigs : chaque signature d'erreur est la valeur de la MAUVAISE lecture (une formule) — elle doit valoir ce qu'annonce le
//    contenu, différer de la clé, et la misconception citée doit être l'une des neuf MISC-QIMA-* ;
//  - DATA.facts : chaque nombre cité dans un énoncé, un QCM ou un corrigé est recalculé ;
//  - DATA.oracle[k = 'premise'] : la PRÉMISSE d'un QCM de conclusion (« différent en x = … » : un témoin sépare les deux formules ;
//    « égal » : égalité EXACTE des polynômes développés ; « d'accord en … » : les valeurs listées sont bien égales) ;
//  - audit(bank) relit les énoncés (îlots LaTeX → ASCII → même polynôme que la formule annoncée), les valeurs données aux lettres,
//    chaque QCM (une seule bonne option, tout distracteur étiqueté par l'une des neuf misconceptions), les clés réduites.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C } from './helpers.mjs';

const DATA = {
"oracle": {
"ex-3am-qimat-ibara-harfiya-l1-001:q1": {
"k": "val",
"e": "6x-5",
"env": {
"x": "4"
}
},
"ex-3am-qimat-ibara-harfiya-l1-001:q2": {
"k": "val",
"e": "6x-5",
"env": {
"x": "0"
}
},
"ex-3am-qimat-ibara-harfiya-l1-001:q3": {
"k": "val",
"e": "6x-5",
"env": {
"x": "10"
}
},
"ex-3am-qimat-ibara-harfiya-l1-002:q1": {
"k": "pick",
"target": {
"e": "5x+2",
"env": {
"x": "3"
}
},
"opts": {
"A": {
"e": "5*3+2",
"env": {}
},
"B": {
"e": "53+2",
"env": {}
}
}
},
"ex-3am-qimat-ibara-harfiya-l1-002:q2": {
"k": "pick",
"target": {
"e": "4x+3x",
"env": {
"x": "2"
}
},
"opts": {
"A": {
"e": "4*2+3x",
"env": {}
},
"B": {
"e": "4*2+3*2",
"env": {}
},
"C": {
"e": "42+32",
"env": {}
}
}
},
"ex-3am-qimat-ibara-harfiya-l1-002:q3": {
"k": "val",
"e": "4x+3x",
"env": {
"x": "2"
}
},
"ex-3am-qimat-ibara-harfiya-l1-002:q4": {
"k": "val",
"e": "3x+2",
"env": {
"x": "15"
}
},
"ex-3am-qimat-ibara-harfiya-l1-003:q1": {
"k": "pick",
"target": {
"e": "4x+7",
"env": {
"x": "-2"
}
},
"opts": {
"A": {
"e": "4*(-2)+7",
"env": {}
},
"B": {
"e": "4*2+7",
"env": {}
}
}
},
"ex-3am-qimat-ibara-harfiya-l1-003:q2": {
"k": "val",
"e": "4x+7",
"env": {
"x": "-2"
}
},
"ex-3am-qimat-ibara-harfiya-l1-003:q3": {
"k": "val",
"e": "5-3x",
"env": {
"x": "-4"
}
},
"ex-3am-qimat-ibara-harfiya-l1-003:q4": {
"k": "val",
"e": "2x-9",
"env": {
"x": "-6"
}
},
"ex-3am-qimat-ibara-harfiya-l1-004:q1": {
"k": "pick",
"target": {
"e": "x^2",
"env": {
"x": "-3"
}
},
"opts": {
"A": {
"e": "(-3)^2",
"env": {}
},
"B": {
"e": "-3^2",
"env": {}
},
"C": {
"e": "(-3)*2",
"env": {}
}
}
},
"ex-3am-qimat-ibara-harfiya-l1-004:q2": {
"k": "val",
"e": "x^2+1",
"env": {
"x": "-4"
}
},
"ex-3am-qimat-ibara-harfiya-l1-004:q3": {
"k": "val",
"e": "10-x^2",
"env": {
"x": "-2"
}
},
"ex-3am-qimat-ibara-harfiya-l1-004:q4": {
"k": "val",
"e": "x^2-9",
"env": {
"x": "-5"
}
},
"ex-3am-qimat-ibara-harfiya-l1-005:q1": {
"k": "val",
"e": "3x-2y",
"env": {
"x": "2",
"y": "5"
}
},
"ex-3am-qimat-ibara-harfiya-l1-005:q2": {
"k": "val",
"e": "3x-2y",
"env": {
"x": "-2",
"y": "3"
}
},
"ex-3am-qimat-ibara-harfiya-l1-005:q3": {
"k": "pick",
"target": {
"e": "5x-y",
"env": {
"x": "3",
"y": "-2"
}
},
"opts": {
"A": {
"e": "5*3-3",
"env": {}
},
"B": {
"e": "5*3-(-2)",
"env": {}
},
"C": {
"e": "5*(-2)-3",
"env": {}
}
}
},
"ex-3am-qimat-ibara-harfiya-l1-005:q4": {
"k": "val",
"e": "xy+x",
"env": {
"x": "-3",
"y": "4"
}
},
"ex-3am-qimat-ibara-harfiya-l1-006:q1": {
"k": "val",
"e": "6x-1",
"env": {
"x": "2/3"
}
},
"ex-3am-qimat-ibara-harfiya-l1-006:q2": {
"k": "val",
"e": "6x-1",
"env": {
"x": "-1/3"
}
},
"ex-3am-qimat-ibara-harfiya-l1-006:q3": {
"k": "val",
"e": "6x-1",
"env": {
"x": "1.5"
}
},
"ex-3am-qimat-ibara-harfiya-l1-007:q1": {
"k": "val",
"e": "2x^2+3x",
"env": {
"x": "4"
}
},
"ex-3am-qimat-ibara-harfiya-l1-007:q2": {
"k": "val",
"e": "20-3x",
"env": {
"x": "5"
}
},
"ex-3am-qimat-ibara-harfiya-l1-007:q3": {
"k": "val",
"e": "(x+3)(x-1)",
"env": {
"x": "5"
}
},
"ex-3am-qimat-ibara-harfiya-l1-007:q4": {
"k": "val",
"e": "3x^2-2x+1",
"env": {
"x": "3"
}
},
"ex-3am-qimat-ibara-harfiya-l1-008:q1": {
"k": "pick",
"target": {
"e": "2x^2",
"env": {
"x": "-3"
}
},
"opts": {
"A": {
"e": "(2*(-3))^2",
"env": {}
},
"B": {
"e": "2*-3^2",
"env": {}
},
"C": {
"e": "2*(-3)^2",
"env": {}
}
}
},
"ex-3am-qimat-ibara-harfiya-l1-008:q2": {
"k": "val",
"e": "5x^2",
"env": {
"x": "-2"
}
},
"ex-3am-qimat-ibara-harfiya-l1-008:q3": {
"k": "val",
"e": "1-4x^2",
"env": {
"x": "-2"
}
},
"ex-3am-qimat-ibara-harfiya-l1-008:q4": {
"k": "val",
"e": "x^2-3x",
"env": {
"x": "-4"
}
},
"ex-3am-qimat-ibara-harfiya-l1-009:q1": {
"k": "val",
"e": "3x+2",
"env": {
"x": "-1/3"
}
},
"ex-3am-qimat-ibara-harfiya-l1-009:q2": {
"k": "val",
"e": "x^2",
"env": {
"x": "-2/3"
}
},
"ex-3am-qimat-ibara-harfiya-l1-009:q3": {
"k": "val",
"e": "2x^2-x",
"env": {
"x": "1/2"
}
},
"ex-3am-qimat-ibara-harfiya-l1-009:q4": {
"k": "val",
"e": "x^2+x",
"env": {
"x": "-1/2"
}
},
"ex-3am-qimat-ibara-harfiya-l1-010:q1": {
"k": "val",
"e": "x^2-2x+4",
"env": {
"x": "-1"
}
},
"ex-3am-qimat-ibara-harfiya-l1-010:q2": {
"k": "val",
"e": "x^2-2x+4",
"env": {
"x": "0"
}
},
"ex-3am-qimat-ibara-harfiya-l1-010:q3": {
"k": "val",
"e": "x^2-2x+4",
"env": {
"x": "4"
}
},
"ex-3am-qimat-ibara-harfiya-l2-001:q1": {
"k": "val",
"e": "5x^2-10x+6",
"env": {
"x": "2"
}
},
"ex-3am-qimat-ibara-harfiya-l2-001:q2": {
"k": "val",
"e": "5x^2+2x-18",
"env": {
"x": "2"
}
},
"ex-3am-qimat-ibara-harfiya-l2-001:q3": {
"k": "val",
"e": "5x^2-10x+6",
"env": {
"x": "-2"
}
},
"ex-3am-qimat-ibara-harfiya-l2-001:q4": {
"k": "val",
"e": "5x^2+2x-18",
"env": {
"x": "-2"
}
},
"ex-3am-qimat-ibara-harfiya-l2-001:q5": {
"a": "5x^2-10x+6",
"b": "5x^2+2x-18",
"agree": [
{
"x": "2"
}
],
"witness": {
"x": "-2"
},
"expect": "neq",
"k": "premise"
},
"ex-3am-qimat-ibara-harfiya-l2-002:q1": {
"k": "coef",
"e": "(2x-5)(4x+3)",
"deg": 1,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l2-002:q2": {
"k": "val",
"e": "(2x-5)(4x+3)",
"env": {
"x": "-3"
}
},
"ex-3am-qimat-ibara-harfiya-l2-002:q3": {
"k": "val",
"e": "8x^2-14x-15",
"env": {
"x": "-3"
}
},
"ex-3am-qimat-ibara-harfiya-l2-002:q4": {
"a": "(2x-5)(4x+3)",
"b": "8x^2-14x-15",
"agree": [
{
"x": "-3"
}
],
"expect": "eq",
"k": "premise"
},
"ex-3am-qimat-ibara-harfiya-l2-003:q1": {
"k": "coef",
"e": "(3x-2)(x-4)-(2x^2-9x+3)",
"deg": 1,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l2-003:q2": {
"k": "val",
"e": "(3x-2)(x-4)-(2x^2-9x+3)",
"env": {
"x": "1"
}
},
"ex-3am-qimat-ibara-harfiya-l2-003:q3": {
"k": "val",
"e": "x^2-3x+3",
"env": {
"x": "1"
}
},
"ex-3am-qimat-ibara-harfiya-l2-003:q4": {
"k": "val",
"e": "(3x-2)(x-4)-(2x^2-9x+3)",
"env": {
"x": "2"
}
},
"ex-3am-qimat-ibara-harfiya-l2-003:q5": {
"k": "val",
"e": "x^2-3x+3",
"env": {
"x": "2"
}
},
"ex-3am-qimat-ibara-harfiya-l2-003:q6": {
"a": "(3x-2)(x-4)-(2x^2-9x+3)",
"b": "x^2-3x+3",
"agree": [
{
"x": "1"
}
],
"witness": {
"x": "2"
},
"expect": "neq",
"k": "premise"
},
"ex-3am-qimat-ibara-harfiya-l2-004:q1": {
"k": "val",
"e": "(x+5)(x+2)",
"env": {
"x": "0"
}
},
"ex-3am-qimat-ibara-harfiya-l2-004:q2": {
"k": "val",
"e": "x^2+10",
"env": {
"x": "0"
}
},
"ex-3am-qimat-ibara-harfiya-l2-004:q3": {
"a": "(x+5)(x+2)",
"b": "x^2+10",
"agree": [
{
"x": "0"
}
],
"witness": {
"x": "1"
},
"expect": "neq",
"k": "premise"
},
"ex-3am-qimat-ibara-harfiya-l2-004:q4": {
"k": "val",
"e": "(x+5)(x+2)",
"env": {
"x": "1"
}
},
"ex-3am-qimat-ibara-harfiya-l2-004:q5": {
"k": "val",
"e": "x^2+10",
"env": {
"x": "1"
}
},
"ex-3am-qimat-ibara-harfiya-l2-004:q6": {
"a": "(x+5)(x+2)",
"b": "x^2+10",
"agree": [
{
"x": "0"
}
],
"witness": {
"x": "1"
},
"expect": "neq",
"k": "premise"
},
"ex-3am-qimat-ibara-harfiya-l2-005:q1": {
"k": "val",
"e": "3x^2+3x+4",
"env": {
"x": "1"
}
},
"ex-3am-qimat-ibara-harfiya-l2-005:q2": {
"k": "val",
"e": "x^2+5x+4",
"env": {
"x": "1"
}
},
"ex-3am-qimat-ibara-harfiya-l2-005:q3": {
"k": "val",
"e": "3x^2+3x+4",
"env": {
"x": "2"
}
},
"ex-3am-qimat-ibara-harfiya-l2-005:q4": {
"k": "val",
"e": "x^2+5x+4",
"env": {
"x": "2"
}
},
"ex-3am-qimat-ibara-harfiya-l2-005:q5": {
"a": "3x^2+3x+4",
"b": "x^2+5x+4",
"agree": [
{
"x": "0"
},
{
"x": "1"
}
],
"witness": [
{
"x": "2"
},
{
"x": "-1"
}
],
"expect": "neq",
"k": "premise"
},
"ex-3am-qimat-ibara-harfiya-l2-005:q6": {
"k": "val",
"e": "3x^2+3x+4",
"env": {
"x": "-1"
}
},
"ex-3am-qimat-ibara-harfiya-l2-005:q7": {
"k": "val",
"e": "x^2+5x+4",
"env": {
"x": "-1"
}
},
"ex-3am-qimat-ibara-harfiya-l2-006:q2": {
"k": "val",
"e": "x^2-9",
"env": {
"x": "-4"
}
},
"ex-3am-qimat-ibara-harfiya-l2-006:q4": {
"k": "val",
"e": "3x^2",
"env": {
"x": "-2"
}
},
"ex-3am-qimat-ibara-harfiya-l2-007:q1": {
"k": "val",
"e": "(x+3)^2",
"env": {
"x": "2"
}
},
"ex-3am-qimat-ibara-harfiya-l2-007:q2": {
"k": "val",
"e": "x^2+6x+9",
"env": {
"x": "2"
}
},
"ex-3am-qimat-ibara-harfiya-l2-007:q3": {
"k": "val",
"e": "(x+3)^2",
"env": {
"x": "-5"
}
},
"ex-3am-qimat-ibara-harfiya-l2-007:q4": {
"k": "val",
"e": "x^2+6x+9",
"env": {
"x": "-5"
}
},
"ex-3am-qimat-ibara-harfiya-l2-007:q5": {
"a": "(x+3)^2",
"b": "x^2+6x+9",
"agree": [
{
"x": "2"
},
{
"x": "-5"
}
],
"expect": "eq",
"k": "premise"
},
"ex-3am-qimat-ibara-harfiya-l2-007:q6": {
"k": "coef",
"e": "(x+3)(x+3)",
"deg": 1,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l2-008:q1": {
"k": "val",
"e": "(a+b)^2",
"env": {
"a": "3",
"b": "4"
}
},
"ex-3am-qimat-ibara-harfiya-l2-008:q2": {
"k": "val",
"e": "a^2+b^2",
"env": {
"a": "3",
"b": "4"
}
},
"ex-3am-qimat-ibara-harfiya-l2-008:q3": {
"a": "(a+b)^2",
"b": "a^2+b^2",
"agree": [
{
"a": "0",
"b": "5"
}
],
"witness": {
"a": "3",
"b": "4"
},
"expect": "neq",
"k": "premise"
},
"ex-3am-qimat-ibara-harfiya-l2-008:q4": {
"k": "val",
"e": "(a+b)^2",
"env": {
"a": "-2",
"b": "5"
}
},
"ex-3am-qimat-ibara-harfiya-l2-008:q5": {
"k": "val",
"e": "a^2+b^2",
"env": {
"a": "-2",
"b": "5"
}
},
"ex-3am-qimat-ibara-harfiya-l2-009:q1": {
"k": "val",
"e": "(x-3)(x+3)",
"env": {
"x": "5"
}
},
"ex-3am-qimat-ibara-harfiya-l2-009:q2": {
"k": "val",
"e": "x^2-9",
"env": {
"x": "5"
}
},
"ex-3am-qimat-ibara-harfiya-l2-009:q3": {
"k": "val",
"e": "(x-3)(x+3)",
"env": {
"x": "-4"
}
},
"ex-3am-qimat-ibara-harfiya-l2-009:q4": {
"k": "val",
"e": "x^2-9",
"env": {
"x": "-4"
}
},
"ex-3am-qimat-ibara-harfiya-l2-009:q5": {
"a": "(x-3)(x+3)",
"b": "x^2-9",
"agree": [
{
"x": "5"
},
{
"x": "-4"
},
{
"x": "0"
}
],
"expect": "eq",
"k": "premise"
},
"ex-3am-qimat-ibara-harfiya-l2-009:q6": {
"k": "coef",
"e": "(x-3)(x+3)",
"deg": 0,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l2-010:q1": {
"k": "val",
"e": "6x-2x^2",
"env": {
"x": "1"
}
},
"ex-3am-qimat-ibara-harfiya-l2-010:q2": {
"k": "val",
"e": "-2x(x+3)",
"env": {
"x": "1"
}
},
"ex-3am-qimat-ibara-harfiya-l2-010:q4": {
"k": "val",
"e": "6x-2x^2",
"env": {
"x": "-1"
}
},
"ex-3am-qimat-ibara-harfiya-l2-010:q5": {
"k": "val",
"e": "-2x(x+3)",
"env": {
"x": "-1"
}
},
"ex-3am-qimat-ibara-harfiya-l2-010:q6": {
"a": "6x-2x^2",
"b": "-2x(x+3)",
"agree": [
{
"x": "0"
}
],
"witness": {
"x": "1"
},
"expect": "neq",
"k": "premise"
},
"ex-3am-qimat-ibara-harfiya-l3-001:q1": {
"k": "coef",
"e": "5^2+(x-3)-(4x+7)",
"deg": 1,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l3-001:q2": {
"k": "coef",
"e": "5^2+(x-3)-(4x+7)",
"deg": 0,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l3-001:q3": {
"k": "coef",
"e": "3x(x+2)+(2x+5)(x-1)",
"deg": 1,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l3-001:q4": {
"k": "val",
"e": "3x(x+2)+(2x+5)(x-1)",
"env": {
"x": "-1/2"
}
},
"ex-3am-qimat-ibara-harfiya-l3-001:q5": {
"k": "val",
"e": "5^2+(x-3)-(4x+7)",
"env": {
"x": "0.1"
}
},
"ex-3am-qimat-ibara-harfiya-l3-002:q1": {
"k": "coef",
"e": "5(x-1)",
"deg": 0,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l3-002:q2": {
"k": "coef",
"e": "(3x+2)(x+2)+5(x-1)",
"deg": 1,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l3-002:q3": {
"k": "val",
"e": "(3x+2)(x+2)+5(x-1)",
"env": {
"x": "-1/2"
}
},
"ex-3am-qimat-ibara-harfiya-l3-002:q4": {
"k": "val",
"e": "(3x+2)(x+2)+5(x-1)",
"env": {
"x": "0.1"
}
},
"ex-3am-qimat-ibara-harfiya-l3-003:q1": {
"k": "coef",
"e": "4(x-1)",
"deg": 0,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l3-003:q2": {
"k": "coef",
"e": "(x+5)(x-2)",
"deg": 1,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l3-003:q3": {
"k": "coef",
"e": "4(x-1)+(x+5)(x-2)",
"deg": 1,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l3-003:q4": {
"k": "val",
"e": "4(x-1)+(x+5)(x-2)",
"env": {
"x": "-2/3"
}
},
"ex-3am-qimat-ibara-harfiya-l3-003:q5": {
"k": "val",
"e": "4(x-1)+(x+5)(x-2)",
"env": {
"x": "0.1"
}
},
"ex-3am-qimat-ibara-harfiya-l3-004:q1": {
"k": "coef",
"e": "(3x-1)(x+4)",
"deg": 1,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l3-004:q2": {
"k": "coef",
"e": "(3x-1)(x+4)-(2x^2+9x-7)",
"deg": 1,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l3-004:q3": {
"k": "val",
"e": "(3x-1)(x+4)-(2x^2+9x-7)",
"env": {
"x": "-1/2"
}
},
"ex-3am-qimat-ibara-harfiya-l3-004:q4": {
"k": "val",
"e": "x^2+2x+3",
"env": {
"x": "2/3"
}
},
"ex-3am-qimat-ibara-harfiya-l3-005:q1": {
"k": "coef",
"e": "3x^2-5x-2(3x+1)+4",
"deg": 1,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l3-005:q2": {
"k": "coef",
"e": "3x^2-5x-2(3x+1)+4",
"deg": 0,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l3-005:q3": {
"k": "val",
"e": "3x^2-5x-2(3x+1)+4",
"env": {
"x": "1/2"
}
},
"ex-3am-qimat-ibara-harfiya-l3-006:q1": {
"k": "val",
"e": "2x^2-3x+1",
"env": {
"x": "-1/2"
}
},
"ex-3am-qimat-ibara-harfiya-l3-006:q2": {
"k": "val",
"e": "2x^2-3x+1",
"env": {
"x": "2/3"
}
},
"ex-3am-qimat-ibara-harfiya-l3-006:q3": {
"k": "val",
"e": "2x^2-3x+1",
"env": {
"x": "0.1"
}
},
"ex-3am-qimat-ibara-harfiya-l3-006:q4": {
"k": "val",
"e": "2x^2-3x+1",
"env": {
"x": "-0.2"
}
},
"ex-3am-qimat-ibara-harfiya-l3-007:q1": {
"k": "coef",
"e": "(x-1)(2-3x)",
"deg": 1,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l3-007:q2": {
"k": "val",
"e": "(x-1)(2-3x)",
"env": {
"x": "-1/2"
}
},
"ex-3am-qimat-ibara-harfiya-l3-007:q3": {
"k": "val",
"e": "(x-1)(2-3x)",
"env": {
"x": "2/3"
}
},
"ex-3am-qimat-ibara-harfiya-l3-007:q4": {
"k": "val",
"e": "(x-1)(2-3x)",
"env": {
"x": "0.1"
}
},
"ex-3am-qimat-ibara-harfiya-l3-008:q1": {
"k": "val",
"e": "3x-2y+xy",
"env": {
"x": "1/2",
"y": "-2"
}
},
"ex-3am-qimat-ibara-harfiya-l3-008:q2": {
"k": "val",
"e": "3x-2y+xy",
"env": {
"x": "-1/3",
"y": "3/2"
}
},
"ex-3am-qimat-ibara-harfiya-l3-008:q3": {
"k": "val",
"e": "3x-2y+xy",
"env": {
"x": "0.1",
"y": "-10"
}
},
"ex-3am-qimat-ibara-harfiya-l3-009:q1": {
"k": "picoef",
"e": "2 pi r",
"env": {
"r": "3"
},
"part": "k"
},
"ex-3am-qimat-ibara-harfiya-l3-009:q2": {
"k": "floor",
"e": "2 pi r",
"env": {
"r": "3"
},
"d": 2
},
"ex-3am-qimat-ibara-harfiya-l3-009:q3": {
"k": "picoef",
"e": "pi r^2",
"env": {
"r": "3"
},
"part": "k"
},
"ex-3am-qimat-ibara-harfiya-l3-009:q4": {
"k": "round",
"e": "pi r^2",
"env": {
"r": "3"
},
"d": 2
},
"ex-3am-qimat-ibara-harfiya-l3-010:q1": {
"k": "val",
"e": "x(x-2)-3(x-1)^2",
"env": {
"x": "-1/2"
}
},
"ex-3am-qimat-ibara-harfiya-l3-010:q2": {
"k": "val",
"e": "x(x-2)-3(x-1)^2",
"env": {
"x": "2/3"
}
},
"ex-3am-qimat-ibara-harfiya-l3-010:q3": {
"k": "val",
"e": "x(x-2)-3(x-1)^2",
"env": {
"x": "0.1"
}
},
"ex-3am-qimat-ibara-harfiya-l4-001:q1": {
"k": "coef",
"e": "3x(2x+1)-(x+4)",
"deg": 1,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l4-001:q2": {
"k": "coef",
"e": "3x(2x+1)-(x+4)",
"deg": 0,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l4-001:q3": {
"k": "val",
"e": "3x(2x+1)-(x+4)",
"env": {
"x": "-2"
}
},
"ex-3am-qimat-ibara-harfiya-l4-001:q4": {
"k": "val",
"e": "12+3y",
"env": {
"y": "-5"
}
},
"ex-3am-qimat-ibara-harfiya-l4-002:q1": {
"k": "coef",
"e": "(x-3)(x+3)-(x^2+x+5)",
"deg": 1,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l4-002:q2": {
"k": "coef",
"e": "(x-3)(x+3)-(x^2+x+5)",
"deg": 0,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l4-002:q3": {
"k": "val",
"e": "-x-14",
"env": {
"x": "2026"
}
},
"ex-3am-qimat-ibara-harfiya-l4-002:q4": {
"k": "val",
"e": "-x-14",
"env": {
"x": "-1000"
}
},
"ex-3am-qimat-ibara-harfiya-l4-003:q1": {
"k": "val",
"e": "x^2+(x+1)^2",
"env": {
"x": "3"
}
},
"ex-3am-qimat-ibara-harfiya-l4-003:q2": {
"k": "val",
"e": "(x+2)^2",
"env": {
"x": "3"
}
},
"ex-3am-qimat-ibara-harfiya-l4-003:q3": {
"k": "cmp",
"e": "x^2+(x+1)^2",
"env": {
"x": "3"
},
"rhs": "(x+2)^2",
"op": "==",
"yes": "A",
"no": "B"
},
"ex-3am-qimat-ibara-harfiya-l4-003:q4": {
"k": "val",
"e": "x^2+(x+1)^2",
"env": {
"x": "4"
}
},
"ex-3am-qimat-ibara-harfiya-l4-003:q5": {
"k": "val",
"e": "(x+2)^2",
"env": {
"x": "4"
}
},
"ex-3am-qimat-ibara-harfiya-l4-003:q6": {
"k": "cmp",
"e": "x^2+(x+1)^2",
"env": {
"x": "4"
},
"rhs": "(x+2)^2",
"op": "==",
"yes": "A",
"no": "B"
},
"ex-3am-qimat-ibara-harfiya-l4-003:q7": {
"a": "x^2+(x+1)^2",
"b": "(x+2)^2",
"agree": [
{
"x": "3"
}
],
"witness": {
"x": "4"
},
"expect": "neq",
"k": "premise"
},
"ex-3am-qimat-ibara-harfiya-l4-004:q1": {
"k": "val",
"e": "1/10",
"env": {}
},
"ex-3am-qimat-ibara-harfiya-l4-004:q2": {
"k": "val",
"e": "1/100",
"env": {}
},
"ex-3am-qimat-ibara-harfiya-l4-004:q3": {
"k": "val",
"e": "5x^2-3x",
"env": {
"x": "0.1"
}
},
"ex-3am-qimat-ibara-harfiya-l4-004:q4": {
"k": "val",
"e": "5x^2-3x",
"env": {
"x": "0.01"
}
},
"ex-3am-qimat-ibara-harfiya-l4-004:q5": {
"k": "val",
"e": "5x^2-3x",
"env": {
"x": "-0.1"
}
},
"ex-3am-qimat-ibara-harfiya-l4-005:q1": {
"k": "val",
"e": "9/10000",
"env": {}
},
"ex-3am-qimat-ibara-harfiya-l4-005:q2": {
"k": "val",
"e": "x^2",
"env": {
"x": "0.03"
}
},
"ex-3am-qimat-ibara-harfiya-l4-005:q3": {
"k": "val",
"e": "x^2+2x",
"env": {
"x": "0.2"
}
},
"ex-3am-qimat-ibara-harfiya-l4-006:q1": {
"k": "val",
"e": "x^2+14",
"env": {
"x": "-2"
}
},
"ex-3am-qimat-ibara-harfiya-l4-006:q2": {
"k": "val",
"e": "x^2-5x+14",
"env": {
"x": "3"
}
},
"ex-3am-qimat-ibara-harfiya-l4-006:q3": {
"a": "x^2+14",
"b": "x^2-5x+14",
"agree": [
{
"x": "0"
}
],
"witness": [
{
"x": "1"
},
{
"x": "-2"
},
{
"x": "3"
}
],
"expect": "neq",
"k": "premise"
},
"ex-3am-qimat-ibara-harfiya-l4-007:q1": {
"a": "(x+1)(x+6)",
"b": "8x+6",
"agree": [
{
"x": "0"
},
{
"x": "1"
}
],
"witness": {
"x": "2"
},
"expect": "neq",
"k": "premise"
},
"ex-3am-qimat-ibara-harfiya-l4-007:q2": {
"k": "val",
"e": "(x+1)(x+6)",
"env": {
"x": "2"
}
},
"ex-3am-qimat-ibara-harfiya-l4-007:q3": {
"k": "val",
"e": "8x+6",
"env": {
"x": "2"
}
},
"ex-3am-qimat-ibara-harfiya-l4-007:q4": {
"k": "val",
"e": "(x+1)(x+6)",
"env": {
"x": "-1"
}
},
"ex-3am-qimat-ibara-harfiya-l4-008:q1": {
"k": "picoef",
"e": "x^2+1/2 pi (x/2)^2",
"env": {
"x": "6"
},
"part": "a"
},
"ex-3am-qimat-ibara-harfiya-l4-008:q2": {
"k": "picoef",
"e": "x^2+1/2 pi (x/2)^2",
"env": {
"x": "6"
},
"part": "k"
},
"ex-3am-qimat-ibara-harfiya-l4-008:q3": {
"k": "floor",
"e": "x^2+1/2 pi (x/2)^2",
"env": {
"x": "6"
},
"d": 2
},
"ex-3am-qimat-ibara-harfiya-l4-008:q4": {
"k": "round",
"e": "x^2+1/2 pi (x/2)^2",
"env": {
"x": "6"
},
"d": 2
},
"ex-3am-qimat-ibara-harfiya-l4-009:q1": {
"k": "val",
"e": "(5-x)(y+3)",
"env": {
"x": "-2.5",
"y": "-8"
}
},
"ex-3am-qimat-ibara-harfiya-l4-009:q2": {
"k": "val",
"e": "(5-x)(y+3)",
"env": {
"x": "1.5",
"y": "-3.5"
}
},
"ex-3am-qimat-ibara-harfiya-l4-009:q3": {
"k": "val",
"e": "x^2-y^2",
"env": {
"x": "-2.5",
"y": "-1.5"
}
},
"ex-3am-qimat-ibara-harfiya-l4-010:q1": {
"k": "val",
"e": "x^2+(x+7)^2",
"env": {
"x": "5"
}
},
"ex-3am-qimat-ibara-harfiya-l4-010:q2": {
"k": "sqrt",
"e": "x^2+(x+7)^2",
"env": {
"x": "5"
}
},
"ex-3am-qimat-ibara-harfiya-l4-010:q3": {
"k": "val",
"e": "x^2+(x+7)^2",
"env": {
"x": "-2"
}
},
"ex-3am-qimat-ibara-harfiya-l5-001:q1": {
"k": "coef",
"e": "(x+6)+3",
"deg": 0,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l5-001:q2": {
"k": "coef",
"e": "2(x+2)+2(x+9)",
"deg": 0,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l5-001:q3": {
"k": "coef",
"e": "(x+2)(x+9)",
"deg": 1,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l5-001:q4": {
"k": "val",
"e": "2(x+2)+2(x+9)",
"env": {
"x": "12"
}
},
"ex-3am-qimat-ibara-harfiya-l5-001:q5": {
"k": "val",
"e": "(2(x+2)+2(x+9))/5",
"env": {
"x": "12"
}
},
"ex-3am-qimat-ibara-harfiya-l5-001:q6": {
"k": "cmp",
"e": "(2(x+2)+2(x+9))/5",
"env": {
"x": "12"
},
"rhs": "12",
"op": "<=",
"yes": "A",
"no": "B"
},
"ex-3am-qimat-ibara-harfiya-l5-002:q1": {
"k": "coef",
"e": "2x(x+3)",
"deg": 1,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l5-002:q2": {
"k": "coef",
"e": "(2x+5)(x+3)",
"deg": 1,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l5-002:q3": {
"k": "coef",
"e": "2((2x+5)+(x+3))",
"deg": 1,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l5-002:q4": {
"k": "val",
"e": "2((2x+5)+(x+3))",
"env": {
"x": "80"
}
},
"ex-3am-qimat-ibara-harfiya-l5-002:q5": {
"k": "val",
"e": "650*2((2x+5)+(x+3))",
"env": {
"x": "80"
}
},
"ex-3am-qimat-ibara-harfiya-l5-002:q6": {
"k": "cmp",
"e": "650*2((2x+5)+(x+3))",
"env": {
"x": "80"
},
"rhs": "330000",
"op": "<=",
"yes": "A",
"no": "B"
},
"ex-3am-qimat-ibara-harfiya-l5-003:q1": {
"k": "coef",
"e": "2((3x+1)+(2x-2))",
"deg": 1,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l5-003:q2": {
"k": "coef",
"e": "(3x+1)(2x-2)",
"deg": 1,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l5-003:q3": {
"k": "val",
"e": "2((3x+1)+(2x-2))",
"env": {
"x": "30"
}
},
"ex-3am-qimat-ibara-harfiya-l5-003:q4": {
"k": "val",
"e": "(3x+1)(2x-2)",
"env": {
"x": "30"
}
},
"ex-3am-qimat-ibara-harfiya-l5-003:q5": {
"k": "sqrt",
"e": "24^2+18^2",
"env": {}
},
"ex-3am-qimat-ibara-harfiya-l5-003:q6": {
"k": "val",
"e": "1200L+500",
"env": {
"L": "30"
}
},
"ex-3am-qimat-ibara-harfiya-l5-003:q7": {
"k": "cmp",
"e": "1200L+500",
"env": {
"L": "30"
},
"rhs": "40000",
"op": "<=",
"yes": "A",
"no": "B"
},
"ex-3am-qimat-ibara-harfiya-l5-004:q1": {
"k": "sqrt",
"e": "2.4^2+0.7^2",
"env": {}
},
"ex-3am-qimat-ibara-harfiya-l5-004:q2": {
"k": "coef",
"e": "(x+10)(x-2)",
"deg": 1,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l5-004:q3": {
"k": "val",
"e": "x+10",
"env": {
"x": "16"
}
},
"ex-3am-qimat-ibara-harfiya-l5-004:q4": {
"k": "val",
"e": "x-2",
"env": {
"x": "16"
}
},
"ex-3am-qimat-ibara-harfiya-l5-004:q5": {
"k": "val",
"e": "(x+10)(x-2)",
"env": {
"x": "16"
}
},
"ex-3am-qimat-ibara-harfiya-l5-004:q6": {
"k": "cmp",
"e": "(x+10)(x-2)",
"env": {
"x": "16"
},
"rhs": "364",
"op": "==",
"yes": "A",
"no": "B"
},
"ex-3am-qimat-ibara-harfiya-l5-005:q1": {
"k": "val",
"e": "20-6h",
"env": {
"h": "2.5"
}
},
"ex-3am-qimat-ibara-harfiya-l5-005:q2": {
"k": "val",
"e": "20-6h",
"env": {
"h": "4"
}
},
"ex-3am-qimat-ibara-harfiya-l5-005:q3": {
"k": "val",
"e": "20-6h",
"env": {
"h": "-0.03"
}
},
"ex-3am-qimat-ibara-harfiya-l5-005:q4": {
"k": "cmp",
"e": "20-6h",
"env": {
"h": "4"
},
"rhs": "0",
"op": "<",
"yes": "A",
"no": "B"
},
"ex-3am-qimat-ibara-harfiya-l5-005:q5": {
"k": "val",
"e": "2(10-3h)",
"env": {
"h": "1"
}
},
"ex-3am-qimat-ibara-harfiya-l5-005:q6": {
"k": "val",
"e": "20-6h",
"env": {
"h": "1"
}
},
"ex-3am-qimat-ibara-harfiya-l5-005:q7": {
"a": "20-6h",
"b": "2(10-3h)",
"agree": [
{
"h": "1"
},
{
"h": "2"
}
],
"expect": "eq",
"k": "premise"
},
"ex-3am-qimat-ibara-harfiya-l5-005:q8": {
"k": "coef",
"e": "2(10-3h)",
"deg": 1,
"v": "h"
},
"ex-3am-qimat-ibara-harfiya-l5-006:q1": {
"k": "val",
"e": "30t-5t^2",
"env": {
"t": "1"
}
},
"ex-3am-qimat-ibara-harfiya-l5-006:q2": {
"k": "val",
"e": "30t-5t^2",
"env": {
"t": "2"
}
},
"ex-3am-qimat-ibara-harfiya-l5-006:q3": {
"k": "val",
"e": "30t-5t^2",
"env": {
"t": "6"
}
},
"ex-3am-qimat-ibara-harfiya-l5-006:q4": {
"k": "val",
"e": "30t-5t^2",
"env": {
"t": "2.5"
}
},
"ex-3am-qimat-ibara-harfiya-l5-006:q5": {
"k": "cmp",
"e": "30t-5t^2",
"env": {
"t": "2.5"
},
"rhs": "42",
"op": ">",
"yes": "A",
"no": "B"
},
"ex-3am-qimat-ibara-harfiya-l5-006:q6": {
"k": "val",
"e": "5t(6-t)",
"env": {
"t": "1"
}
},
"ex-3am-qimat-ibara-harfiya-l5-006:q7": {
"k": "val",
"e": "5t(6-t)",
"env": {
"t": "2"
}
},
"ex-3am-qimat-ibara-harfiya-l5-006:q8": {
"a": "30t-5t^2",
"b": "5t(6-t)",
"agree": [
{
"t": "1"
},
{
"t": "2"
}
],
"expect": "eq",
"k": "premise"
},
"ex-3am-qimat-ibara-harfiya-l5-006:q9": {
"k": "coef",
"e": "5t(6-t)",
"deg": 2,
"v": "t"
},
"ex-3am-qimat-ibara-harfiya-l5-007:q1": {
"k": "val",
"e": "2(x+6)+2(x+4)",
"env": {
"x": "5"
}
},
"ex-3am-qimat-ibara-harfiya-l5-007:q2": {
"k": "val",
"e": "4x+20",
"env": {
"x": "5"
}
},
"ex-3am-qimat-ibara-harfiya-l5-007:q3": {
"a": "2(x+6)+2(x+4)",
"b": "4x+20",
"agree": [
{
"x": "5"
}
],
"expect": "eq",
"k": "premise"
},
"ex-3am-qimat-ibara-harfiya-l5-007:q4": {
"k": "val",
"e": "(x+6)(x+4)",
"env": {
"x": "0"
}
},
"ex-3am-qimat-ibara-harfiya-l5-007:q5": {
"k": "val",
"e": "x^2+24",
"env": {
"x": "0"
}
},
"ex-3am-qimat-ibara-harfiya-l5-007:q6": {
"k": "val",
"e": "(x+6)(x+4)",
"env": {
"x": "3"
}
},
"ex-3am-qimat-ibara-harfiya-l5-007:q7": {
"k": "val",
"e": "x^2+24",
"env": {
"x": "3"
}
},
"ex-3am-qimat-ibara-harfiya-l5-007:q8": {
"a": "(x+6)(x+4)",
"b": "x^2+24",
"agree": [
{
"x": "0"
}
],
"witness": {
"x": "3"
},
"expect": "neq",
"k": "premise"
},
"ex-3am-qimat-ibara-harfiya-l5-007:q9": {
"k": "cmp",
"e": "(x+6)(x+4)",
"env": {
"x": "3"
},
"rhs": "60",
"op": ">=",
"yes": "A",
"no": "B"
},
"ex-3am-qimat-ibara-harfiya-l5-008:q1": {
"k": "coef",
"e": "(2x+3)(x+1)",
"deg": 1,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l5-008:q2": {
"k": "coef",
"e": "2((2x+3)+(x+1))",
"deg": 1,
"v": "x"
},
"ex-3am-qimat-ibara-harfiya-l5-008:q3": {
"k": "val",
"e": "2((2x+3)+(x+1))",
"env": {
"x": "4.5"
}
},
"ex-3am-qimat-ibara-harfiya-l5-008:q4": {
"k": "val",
"e": "(2x+3)(x+1)",
"env": {
"x": "4.5"
}
},
"ex-3am-qimat-ibara-harfiya-l5-008:q5": {
"k": "val",
"e": "150(2x+3)(x+1)",
"env": {
"x": "4.5"
}
},
"ex-3am-qimat-ibara-harfiya-l5-008:q6": {
"k": "cmp",
"e": "150(2x+3)(x+1)",
"env": {
"x": "4.5"
},
"rhs": "10000",
"op": "<=",
"yes": "A",
"no": "B"
},
"ex-3am-qimat-ibara-harfiya-l5-009:q1": {
"k": "val",
"e": "300+5n",
"env": {
"n": "100"
}
},
"ex-3am-qimat-ibara-harfiya-l5-009:q2": {
"k": "val",
"e": "8n",
"env": {
"n": "100"
}
},
"ex-3am-qimat-ibara-harfiya-l5-009:q3": {
"k": "val",
"e": "300+5n",
"env": {
"n": "50"
}
},
"ex-3am-qimat-ibara-harfiya-l5-009:q4": {
"k": "val",
"e": "8n",
"env": {
"n": "50"
}
},
"ex-3am-qimat-ibara-harfiya-l5-009:q5": {
"a": "300+5n",
"b": "8n",
"agree": [
{
"n": "100"
}
],
"witness": {
"n": "50"
},
"expect": "neq",
"k": "premise"
},
"ex-3am-qimat-ibara-harfiya-l5-009:q6": {
"k": "cmp",
"e": "8n",
"env": {
"n": "40"
},
"rhs": "300+5n",
"op": "<",
"yes": "A",
"no": "B"
},
"ex-3am-qimat-ibara-harfiya-l5-010:q1": {
"k": "val",
"e": "2(a+b)",
"env": {
"a": "12.5",
"b": "8"
}
},
"ex-3am-qimat-ibara-harfiya-l5-010:q2": {
"k": "val",
"e": "ab",
"env": {
"a": "12.5",
"b": "8"
}
},
"ex-3am-qimat-ibara-harfiya-l5-010:q3": {
"k": "val",
"e": "2(2a+b)",
"env": {
"a": "12.5",
"b": "8"
}
},
"ex-3am-qimat-ibara-harfiya-l5-010:q4": {
"k": "cmp",
"e": "2(2a+b)",
"env": {
"a": "12.5",
"b": "8"
},
"rhs": "60",
"op": "<=",
"yes": "A",
"no": "B"
}
},
"sigs": {
"ex-3am-qimat-ibara-harfiya-l1-001:q1": [
{
"v": "59",
"e": "64-5",
"env": {
"x": "4"
},
"id": "MISC-QIMA-FUSED"
}
],
"ex-3am-qimat-ibara-harfiya-l1-001:q2": [],
"ex-3am-qimat-ibara-harfiya-l1-001:q3": [
{
"v": "605",
"e": "610-5",
"env": {
"x": "10"
},
"id": "MISC-QIMA-FUSED"
}
],
"ex-3am-qimat-ibara-harfiya-l1-002:q1": [],
"ex-3am-qimat-ibara-harfiya-l1-002:q2": [],
"ex-3am-qimat-ibara-harfiya-l1-002:q3": [],
"ex-3am-qimat-ibara-harfiya-l1-002:q4": [
{
"v": "317",
"e": "315+2",
"env": {
"x": "15"
},
"id": "MISC-QIMA-FUSED"
}
],
"ex-3am-qimat-ibara-harfiya-l1-003:q1": [],
"ex-3am-qimat-ibara-harfiya-l1-003:q2": [
{
"v": "15",
"e": "4*2+7",
"env": {
"x": "-2"
},
"id": "MISC-QIMA-SIGN-LOST"
}
],
"ex-3am-qimat-ibara-harfiya-l1-003:q3": [
{
"v": "-7",
"e": "5-3*4",
"env": {
"x": "-4"
},
"id": "MISC-QIMA-SIGN-LOST"
},
{
"v": "-8",
"e": "(5-3)*(-4)",
"env": {
"x": "-4"
},
"id": "MISC-QIMA-LEFT-TO-RIGHT"
}
],
"ex-3am-qimat-ibara-harfiya-l1-003:q4": [
{
"v": "3",
"e": "2*6-9",
"env": {
"x": "-6"
},
"id": "MISC-QIMA-SIGN-LOST"
}
],
"ex-3am-qimat-ibara-harfiya-l1-004:q1": [],
"ex-3am-qimat-ibara-harfiya-l1-004:q2": [
{
"v": "-15",
"e": "-4^2+1",
"env": {
"x": "-4"
},
"id": "MISC-QIMA-NEG-POWER"
},
{
"v": "-7",
"e": "2*(-4)+1",
"env": {
"x": "-4"
},
"id": "MISC-QIMA-SQUARE-DOUBLE"
}
],
"ex-3am-qimat-ibara-harfiya-l1-004:q3": [
{
"v": "14",
"e": "10-2*(-2)",
"env": {
"x": "-2"
},
"id": "MISC-QIMA-SQUARE-DOUBLE"
}
],
"ex-3am-qimat-ibara-harfiya-l1-004:q4": [
{
"v": "-34",
"e": "-5^2-9",
"env": {
"x": "-5"
},
"id": "MISC-QIMA-NEG-POWER"
},
{
"v": "-19",
"e": "2*(-5)-9",
"env": {
"x": "-5"
},
"id": "MISC-QIMA-SQUARE-DOUBLE"
}
],
"ex-3am-qimat-ibara-harfiya-l1-005:q1": [
{
"v": "2",
"e": "3x-2x",
"env": {
"x": "2",
"y": "5"
},
"id": "MISC-QIMA-LETTERS-SAME"
}
],
"ex-3am-qimat-ibara-harfiya-l1-005:q2": [
{
"v": "0",
"e": "3*2-2*3",
"env": {
"x": "-2",
"y": "3"
},
"id": "MISC-QIMA-SIGN-LOST"
},
{
"v": "-2",
"e": "3x-2x",
"env": {
"x": "-2",
"y": "3"
},
"id": "MISC-QIMA-LETTERS-SAME"
}
],
"ex-3am-qimat-ibara-harfiya-l1-005:q3": [],
"ex-3am-qimat-ibara-harfiya-l1-005:q4": [
{
"v": "15",
"e": "3*4+3",
"env": {
"x": "-3",
"y": "4"
},
"id": "MISC-QIMA-SIGN-LOST"
}
],
"ex-3am-qimat-ibara-harfiya-l1-006:q1": [],
"ex-3am-qimat-ibara-harfiya-l1-006:q2": [
{
"v": "1",
"e": "6*(1/3)-1",
"env": {
"x": "-1/3"
},
"id": "MISC-QIMA-SIGN-LOST"
}
],
"ex-3am-qimat-ibara-harfiya-l1-006:q3": [],
"ex-3am-qimat-ibara-harfiya-l1-007:q1": [
{
"v": "76",
"e": "(2*4)^2+3*4",
"env": {
"x": "4"
},
"id": "MISC-QIMA-COEF-IN-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l1-007:q2": [
{
"v": "85",
"e": "(20-3)*5",
"env": {
"x": "5"
},
"id": "MISC-QIMA-LEFT-TO-RIGHT"
}
],
"ex-3am-qimat-ibara-harfiya-l1-007:q3": [],
"ex-3am-qimat-ibara-harfiya-l1-007:q4": [
{
"v": "76",
"e": "(3*3)^2-2*3+1",
"env": {
"x": "3"
},
"id": "MISC-QIMA-COEF-IN-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l1-008:q1": [],
"ex-3am-qimat-ibara-harfiya-l1-008:q2": [
{
"v": "100",
"e": "(5*(-2))^2",
"env": {
"x": "-2"
},
"id": "MISC-QIMA-COEF-IN-POWER"
},
{
"v": "-20",
"e": "5*-2^2",
"env": {
"x": "-2"
},
"id": "MISC-QIMA-NEG-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l1-008:q3": [
{
"v": "-63",
"e": "1-(4*(-2))^2",
"env": {
"x": "-2"
},
"id": "MISC-QIMA-COEF-IN-POWER"
},
{
"v": "17",
"e": "1-4*-2^2",
"env": {
"x": "-2"
},
"id": "MISC-QIMA-NEG-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l1-008:q4": [
{
"v": "-4",
"e": "-4^2-3*(-4)",
"env": {
"x": "-4"
},
"id": "MISC-QIMA-NEG-POWER"
},
{
"v": "4",
"e": "4^2-3*4",
"env": {
"x": "-4"
},
"id": "MISC-QIMA-SIGN-LOST"
}
],
"ex-3am-qimat-ibara-harfiya-l1-009:q1": [
{
"v": "3",
"e": "3*(1/3)+2",
"env": {
"x": "-1/3"
},
"id": "MISC-QIMA-SIGN-LOST"
}
],
"ex-3am-qimat-ibara-harfiya-l1-009:q2": [
{
"v": "-4/9",
"e": "-(2/3)^2",
"env": {
"x": "-2/3"
},
"id": "MISC-QIMA-NEG-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l1-009:q3": [],
"ex-3am-qimat-ibara-harfiya-l1-009:q4": [
{
"v": "0.25",
"e": "-(1/2)^2+(1/2)",
"env": {
"x": "-1/2"
},
"id": "MISC-QIMA-NEG-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l1-010:q1": [
{
"v": "5",
"e": "-1^2-2*(-1)+4",
"env": {
"x": "-1"
},
"id": "MISC-QIMA-NEG-POWER"
},
{
"v": "3",
"e": "1-2+4",
"env": {
"x": "-1"
},
"id": "MISC-QIMA-SIGN-LOST"
}
],
"ex-3am-qimat-ibara-harfiya-l1-010:q2": [],
"ex-3am-qimat-ibara-harfiya-l1-010:q3": [],
"ex-3am-qimat-ibara-harfiya-l2-001:q1": [],
"ex-3am-qimat-ibara-harfiya-l2-001:q2": [],
"ex-3am-qimat-ibara-harfiya-l2-001:q3": [
{
"v": "6",
"e": "5*2^2-10*2+6",
"env": {
"x": "-2"
},
"id": "MISC-QIMA-SIGN-LOST"
}
],
"ex-3am-qimat-ibara-harfiya-l2-001:q4": [
{
"v": "6",
"e": "5*2^2+2*2-18",
"env": {
"x": "-2"
},
"id": "MISC-QIMA-SIGN-LOST"
}
],
"ex-3am-qimat-ibara-harfiya-l2-001:q5": [],
"ex-3am-qimat-ibara-harfiya-l2-001:q6": [],
"ex-3am-qimat-ibara-harfiya-l2-002:q1": [],
"ex-3am-qimat-ibara-harfiya-l2-002:q2": [
{
"v": "15",
"e": "(2*3-5)(4*3+3)",
"env": {
"x": "-3"
},
"id": "MISC-QIMA-SIGN-LOST"
}
],
"ex-3am-qimat-ibara-harfiya-l2-002:q3": [
{
"v": "-45",
"e": "8*-3^2-14*(-3)-15",
"env": {
"x": "-3"
},
"id": "MISC-QIMA-NEG-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l2-002:q4": [],
"ex-3am-qimat-ibara-harfiya-l2-003:q1": [],
"ex-3am-qimat-ibara-harfiya-l2-003:q2": [],
"ex-3am-qimat-ibara-harfiya-l2-003:q3": [],
"ex-3am-qimat-ibara-harfiya-l2-003:q4": [],
"ex-3am-qimat-ibara-harfiya-l2-003:q5": [],
"ex-3am-qimat-ibara-harfiya-l2-003:q6": [],
"ex-3am-qimat-ibara-harfiya-l2-004:q1": [],
"ex-3am-qimat-ibara-harfiya-l2-004:q2": [],
"ex-3am-qimat-ibara-harfiya-l2-004:q3": [],
"ex-3am-qimat-ibara-harfiya-l2-004:q4": [],
"ex-3am-qimat-ibara-harfiya-l2-004:q5": [],
"ex-3am-qimat-ibara-harfiya-l2-004:q6": [],
"ex-3am-qimat-ibara-harfiya-l2-004:q7": [],
"ex-3am-qimat-ibara-harfiya-l2-005:q1": [],
"ex-3am-qimat-ibara-harfiya-l2-005:q2": [],
"ex-3am-qimat-ibara-harfiya-l2-005:q3": [],
"ex-3am-qimat-ibara-harfiya-l2-005:q4": [],
"ex-3am-qimat-ibara-harfiya-l2-005:q5": [],
"ex-3am-qimat-ibara-harfiya-l2-005:q6": [
{
"v": "-2",
"e": "-3*1+3*(-1)+4",
"env": {
"x": "-1"
},
"id": "MISC-QIMA-NEG-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l2-005:q7": [],
"ex-3am-qimat-ibara-harfiya-l2-006:q1": [],
"ex-3am-qimat-ibara-harfiya-l2-006:q2": [
{
"v": "-25",
"e": "-4^2-9",
"env": {
"x": "-4"
},
"id": "MISC-QIMA-NEG-POWER"
},
{
"v": "-17",
"e": "2*(-4)-9",
"env": {
"x": "-4"
},
"id": "MISC-QIMA-SQUARE-DOUBLE"
}
],
"ex-3am-qimat-ibara-harfiya-l2-006:q3": [],
"ex-3am-qimat-ibara-harfiya-l2-006:q4": [
{
"v": "36",
"e": "(3*(-2))^2",
"env": {
"x": "-2"
},
"id": "MISC-QIMA-COEF-IN-POWER"
},
{
"v": "-12",
"e": "3*-2^2",
"env": {
"x": "-2"
},
"id": "MISC-QIMA-NEG-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l2-007:q1": [],
"ex-3am-qimat-ibara-harfiya-l2-007:q2": [],
"ex-3am-qimat-ibara-harfiya-l2-007:q3": [
{
"v": "64",
"e": "(5+3)^2",
"env": {
"x": "-5"
},
"id": "MISC-QIMA-SIGN-LOST"
}
],
"ex-3am-qimat-ibara-harfiya-l2-007:q4": [
{
"v": "-46",
"e": "-5^2+6*(-5)+9",
"env": {
"x": "-5"
},
"id": "MISC-QIMA-NEG-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l2-007:q5": [],
"ex-3am-qimat-ibara-harfiya-l2-007:q6": [],
"ex-3am-qimat-ibara-harfiya-l2-008:q1": [],
"ex-3am-qimat-ibara-harfiya-l2-008:q2": [
{
"v": "49",
"e": "(3+4)^2",
"env": {
"a": "3",
"b": "4"
},
"id": "MISC-QIMA-PARTIAL"
}
],
"ex-3am-qimat-ibara-harfiya-l2-008:q3": [],
"ex-3am-qimat-ibara-harfiya-l2-008:q4": [
{
"v": "49",
"e": "(2+5)^2",
"env": {
"a": "-2",
"b": "5"
},
"id": "MISC-QIMA-SIGN-LOST"
}
],
"ex-3am-qimat-ibara-harfiya-l2-008:q5": [
{
"v": "21",
"e": "-2^2+5^2",
"env": {
"a": "-2",
"b": "5"
},
"id": "MISC-QIMA-NEG-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l2-009:q1": [],
"ex-3am-qimat-ibara-harfiya-l2-009:q2": [],
"ex-3am-qimat-ibara-harfiya-l2-009:q3": [],
"ex-3am-qimat-ibara-harfiya-l2-009:q4": [
{
"v": "-25",
"e": "-4^2-9",
"env": {
"x": "-4"
},
"id": "MISC-QIMA-NEG-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l2-009:q5": [],
"ex-3am-qimat-ibara-harfiya-l2-009:q6": [],
"ex-3am-qimat-ibara-harfiya-l2-010:q1": [],
"ex-3am-qimat-ibara-harfiya-l2-010:q2": [],
"ex-3am-qimat-ibara-harfiya-l2-010:q3": [],
"ex-3am-qimat-ibara-harfiya-l2-010:q4": [
{
"v": "4",
"e": "6*1-2*1",
"env": {
"x": "-1"
},
"id": "MISC-QIMA-SIGN-LOST"
}
],
"ex-3am-qimat-ibara-harfiya-l2-010:q5": [],
"ex-3am-qimat-ibara-harfiya-l2-010:q6": [],
"ex-3am-qimat-ibara-harfiya-l3-001:q1": [],
"ex-3am-qimat-ibara-harfiya-l3-001:q2": [],
"ex-3am-qimat-ibara-harfiya-l3-001:q3": [],
"ex-3am-qimat-ibara-harfiya-l3-001:q4": [
{
"v": "0.75",
"e": "3*(1/2)*((1/2)+2)+(2*(1/2)+5)*((1/2)-1)",
"env": {
"x": "-1/2"
},
"id": "MISC-QIMA-SIGN-LOST"
}
],
"ex-3am-qimat-ibara-harfiya-l3-001:q5": [],
"ex-3am-qimat-ibara-harfiya-l3-002:q1": [],
"ex-3am-qimat-ibara-harfiya-l3-002:q2": [],
"ex-3am-qimat-ibara-harfiya-l3-002:q3": [
{
"v": "6.25",
"e": "(3*(1/2)+2)*((1/2)+2)+5*((1/2)-1)",
"env": {
"x": "-1/2"
},
"id": "MISC-QIMA-SIGN-LOST"
}
],
"ex-3am-qimat-ibara-harfiya-l3-002:q4": [],
"ex-3am-qimat-ibara-harfiya-l3-003:q1": [],
"ex-3am-qimat-ibara-harfiya-l3-003:q2": [],
"ex-3am-qimat-ibara-harfiya-l3-003:q3": [],
"ex-3am-qimat-ibara-harfiya-l3-003:q4": [
{
"v": "-80/9",
"e": "4*((2/3)-1)+((2/3)+5)*((2/3)-2)",
"env": {
"x": "-2/3"
},
"id": "MISC-QIMA-SIGN-LOST"
}
],
"ex-3am-qimat-ibara-harfiya-l3-003:q5": [],
"ex-3am-qimat-ibara-harfiya-l3-004:q1": [],
"ex-3am-qimat-ibara-harfiya-l3-004:q2": [],
"ex-3am-qimat-ibara-harfiya-l3-004:q3": [
{
"v": "4.25",
"e": "(3*(1/2)-1)*((1/2)+4)-(2*(1/2)^2+9*(1/2)-7)",
"env": {
"x": "-1/2"
},
"id": "MISC-QIMA-SIGN-LOST"
}
],
"ex-3am-qimat-ibara-harfiya-l3-004:q4": [],
"ex-3am-qimat-ibara-harfiya-l3-005:q1": [],
"ex-3am-qimat-ibara-harfiya-l3-005:q2": [],
"ex-3am-qimat-ibara-harfiya-l3-005:q3": [],
"ex-3am-qimat-ibara-harfiya-l3-005:q4": [],
"ex-3am-qimat-ibara-harfiya-l3-006:q1": [
{
"v": "0",
"e": "2*(1/2)^2-3*(1/2)+1",
"env": {
"x": "-1/2"
},
"id": "MISC-QIMA-SIGN-LOST"
},
{
"v": "2",
"e": "2*-(1/2)^2-3*(-1/2)+1",
"env": {
"x": "-1/2"
},
"id": "MISC-QIMA-NEG-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l3-006:q2": [
{
"v": "7/9",
"e": "(2*(2/3))^2-3*(2/3)+1",
"env": {
"x": "2/3"
},
"id": "MISC-QIMA-COEF-IN-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l3-006:q3": [],
"ex-3am-qimat-ibara-harfiya-l3-006:q4": [
{
"v": "1.52",
"e": "2*-0.2^2-3*(-0.2)+1",
"env": {
"x": "-0.2"
},
"id": "MISC-QIMA-NEG-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l3-007:q1": [],
"ex-3am-qimat-ibara-harfiya-l3-007:q2": [
{
"v": "-0.25",
"e": "(1/2-1)(2-3*(1/2))",
"env": {
"x": "-1/2"
},
"id": "MISC-QIMA-SIGN-LOST"
}
],
"ex-3am-qimat-ibara-harfiya-l3-007:q3": [],
"ex-3am-qimat-ibara-harfiya-l3-007:q4": [],
"ex-3am-qimat-ibara-harfiya-l3-008:q1": [
{
"v": "-1.5",
"e": "3*(1/2)-2*2+(1/2)*2",
"env": {
"x": "1/2",
"y": "-2"
},
"id": "MISC-QIMA-SIGN-LOST"
},
{
"v": "0.75",
"e": "3*(1/2)-2*(1/2)+(1/2)*(1/2)",
"env": {
"x": "1/2",
"y": "-2"
},
"id": "MISC-QIMA-LETTERS-SAME"
}
],
"ex-3am-qimat-ibara-harfiya-l3-008:q2": [],
"ex-3am-qimat-ibara-harfiya-l3-008:q3": [
{
"v": "-18.7",
"e": "3*0.1-2*10+0.1*10",
"env": {
"x": "0.1",
"y": "-10"
},
"id": "MISC-QIMA-SIGN-LOST"
}
],
"ex-3am-qimat-ibara-harfiya-l3-009:q1": [],
"ex-3am-qimat-ibara-harfiya-l3-009:q2": [],
"ex-3am-qimat-ibara-harfiya-l3-009:q3": [],
"ex-3am-qimat-ibara-harfiya-l3-009:q4": [],
"ex-3am-qimat-ibara-harfiya-l3-010:q1": [
{
"v": "-19",
"e": "(-1/2)(-1/2-2)-(3*(-1/2-1))^2",
"env": {
"x": "-1/2"
},
"id": "MISC-QIMA-COEF-IN-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l3-010:q2": [],
"ex-3am-qimat-ibara-harfiya-l3-010:q3": [],
"ex-3am-qimat-ibara-harfiya-l4-001:q1": [],
"ex-3am-qimat-ibara-harfiya-l4-001:q2": [],
"ex-3am-qimat-ibara-harfiya-l4-001:q3": [
{
"v": "24",
"e": "3*2*(2*2+1)-(2+4)",
"env": {
"x": "-2"
},
"id": "MISC-QIMA-SIGN-LOST"
}
],
"ex-3am-qimat-ibara-harfiya-l4-001:q4": [
{
"v": "27",
"e": "12+3*5",
"env": {
"y": "-5"
},
"id": "MISC-QIMA-SIGN-LOST"
}
],
"ex-3am-qimat-ibara-harfiya-l4-002:q1": [],
"ex-3am-qimat-ibara-harfiya-l4-002:q2": [],
"ex-3am-qimat-ibara-harfiya-l4-002:q3": [
{
"v": "2012",
"e": "2026-14",
"env": {
"x": "2026"
},
"id": "MISC-QIMA-SIGN-LOST"
}
],
"ex-3am-qimat-ibara-harfiya-l4-002:q4": [
{
"v": "-1014",
"e": "-1000-14",
"env": {
"x": "-1000"
},
"id": "MISC-QIMA-SIGN-LOST"
}
],
"ex-3am-qimat-ibara-harfiya-l4-003:q1": [],
"ex-3am-qimat-ibara-harfiya-l4-003:q2": [],
"ex-3am-qimat-ibara-harfiya-l4-003:q3": [],
"ex-3am-qimat-ibara-harfiya-l4-003:q4": [],
"ex-3am-qimat-ibara-harfiya-l4-003:q5": [],
"ex-3am-qimat-ibara-harfiya-l4-003:q6": [],
"ex-3am-qimat-ibara-harfiya-l4-003:q7": [],
"ex-3am-qimat-ibara-harfiya-l4-004:q1": [],
"ex-3am-qimat-ibara-harfiya-l4-004:q2": [],
"ex-3am-qimat-ibara-harfiya-l4-004:q3": [
{
"v": "0.7",
"e": "5*2*0.1-3*0.1",
"env": {
"x": "0.1"
},
"id": "MISC-QIMA-SQUARE-DOUBLE"
},
{
"v": "-0.05",
"e": "(5*0.1)^2-3*0.1",
"env": {
"x": "0.1"
},
"id": "MISC-QIMA-COEF-IN-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l4-004:q4": [
{
"v": "-0.0275",
"e": "(5*0.01)^2-3*0.01",
"env": {
"x": "0.01"
},
"id": "MISC-QIMA-COEF-IN-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l4-004:q5": [
{
"v": "0.25",
"e": "5*-0.1^2-3*(-0.1)",
"env": {
"x": "-0.1"
},
"id": "MISC-QIMA-NEG-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l4-005:q1": [],
"ex-3am-qimat-ibara-harfiya-l4-005:q2": [
{
"v": "0.0003",
"e": "3*0.01^2",
"env": {
"x": "0.03"
},
"id": "MISC-QIMA-COEF-IN-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l4-005:q3": [
{
"v": "0.42",
"e": "2*0.1^2+2*0.2",
"env": {
"x": "0.2"
},
"id": "MISC-QIMA-COEF-IN-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l4-006:q1": [
{
"v": "10",
"e": "-2^2+14",
"env": {
"x": "-2"
},
"id": "MISC-QIMA-NEG-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l4-006:q2": [],
"ex-3am-qimat-ibara-harfiya-l4-006:q3": [],
"ex-3am-qimat-ibara-harfiya-l4-006:q4": [],
"ex-3am-qimat-ibara-harfiya-l4-007:q1": [],
"ex-3am-qimat-ibara-harfiya-l4-007:q2": [],
"ex-3am-qimat-ibara-harfiya-l4-007:q3": [],
"ex-3am-qimat-ibara-harfiya-l4-007:q4": [
{
"v": "14",
"e": "(1+1)(1+6)",
"env": {
"x": "-1"
},
"id": "MISC-QIMA-SIGN-LOST"
}
],
"ex-3am-qimat-ibara-harfiya-l4-007:q5": [],
"ex-3am-qimat-ibara-harfiya-l4-008:q1": [],
"ex-3am-qimat-ibara-harfiya-l4-008:q2": [],
"ex-3am-qimat-ibara-harfiya-l4-008:q3": [],
"ex-3am-qimat-ibara-harfiya-l4-008:q4": [],
"ex-3am-qimat-ibara-harfiya-l4-009:q1": [
{
"v": "27.5",
"e": "(5-2.5)(8+3)",
"env": {
"x": "-2.5",
"y": "-8"
},
"id": "MISC-QIMA-SIGN-LOST"
},
{
"v": "3.75",
"e": "(5-(-2.5))(-2.5+3)",
"env": {
"x": "-2.5",
"y": "-8"
},
"id": "MISC-QIMA-LETTERS-SAME"
}
],
"ex-3am-qimat-ibara-harfiya-l4-009:q2": [],
"ex-3am-qimat-ibara-harfiya-l4-009:q3": [
{
"v": "-4",
"e": "-2.5^2-(-1.5^2)",
"env": {
"x": "-2.5",
"y": "-1.5"
},
"id": "MISC-QIMA-NEG-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l4-010:q1": [],
"ex-3am-qimat-ibara-harfiya-l4-010:q2": [],
"ex-3am-qimat-ibara-harfiya-l4-010:q3": [
{
"v": "21",
"e": "-2^2+(-2+7)^2",
"env": {
"x": "-2"
},
"id": "MISC-QIMA-NEG-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l5-001:q1": [],
"ex-3am-qimat-ibara-harfiya-l5-001:q2": [],
"ex-3am-qimat-ibara-harfiya-l5-001:q3": [],
"ex-3am-qimat-ibara-harfiya-l5-001:q4": [],
"ex-3am-qimat-ibara-harfiya-l5-001:q5": [],
"ex-3am-qimat-ibara-harfiya-l5-001:q6": [],
"ex-3am-qimat-ibara-harfiya-l5-002:q1": [],
"ex-3am-qimat-ibara-harfiya-l5-002:q2": [],
"ex-3am-qimat-ibara-harfiya-l5-002:q3": [],
"ex-3am-qimat-ibara-harfiya-l5-002:q4": [],
"ex-3am-qimat-ibara-harfiya-l5-002:q5": [],
"ex-3am-qimat-ibara-harfiya-l5-002:q6": [],
"ex-3am-qimat-ibara-harfiya-l5-003:q1": [],
"ex-3am-qimat-ibara-harfiya-l5-003:q2": [],
"ex-3am-qimat-ibara-harfiya-l5-003:q3": [],
"ex-3am-qimat-ibara-harfiya-l5-003:q4": [],
"ex-3am-qimat-ibara-harfiya-l5-003:q5": [],
"ex-3am-qimat-ibara-harfiya-l5-003:q6": [
{
"v": "51000",
"e": "(1200+500)*30",
"env": {
"L": "30"
},
"id": "MISC-QIMA-LEFT-TO-RIGHT"
}
],
"ex-3am-qimat-ibara-harfiya-l5-003:q7": [],
"ex-3am-qimat-ibara-harfiya-l5-004:q1": [],
"ex-3am-qimat-ibara-harfiya-l5-004:q2": [],
"ex-3am-qimat-ibara-harfiya-l5-004:q3": [],
"ex-3am-qimat-ibara-harfiya-l5-004:q4": [],
"ex-3am-qimat-ibara-harfiya-l5-004:q5": [],
"ex-3am-qimat-ibara-harfiya-l5-004:q6": [],
"ex-3am-qimat-ibara-harfiya-l5-005:q1": [
{
"v": "35",
"e": "(20-6)*2.5",
"env": {
"h": "2.5"
},
"id": "MISC-QIMA-LEFT-TO-RIGHT"
}
],
"ex-3am-qimat-ibara-harfiya-l5-005:q2": [
{
"v": "56",
"e": "(20-6)*4",
"env": {
"h": "4"
},
"id": "MISC-QIMA-LEFT-TO-RIGHT"
}
],
"ex-3am-qimat-ibara-harfiya-l5-005:q3": [
{
"v": "19.82",
"e": "20-6*0.03",
"env": {
"h": "-0.03"
},
"id": "MISC-QIMA-SIGN-LOST"
}
],
"ex-3am-qimat-ibara-harfiya-l5-005:q4": [],
"ex-3am-qimat-ibara-harfiya-l5-005:q5": [],
"ex-3am-qimat-ibara-harfiya-l5-005:q6": [],
"ex-3am-qimat-ibara-harfiya-l5-005:q7": [],
"ex-3am-qimat-ibara-harfiya-l5-005:q8": [],
"ex-3am-qimat-ibara-harfiya-l5-006:q1": [],
"ex-3am-qimat-ibara-harfiya-l5-006:q2": [
{
"v": "-40",
"e": "30*2-(5*2)^2",
"env": {
"t": "2"
},
"id": "MISC-QIMA-COEF-IN-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l5-006:q3": [],
"ex-3am-qimat-ibara-harfiya-l5-006:q4": [
{
"v": "-81.25",
"e": "30*2.5-(5*2.5)^2",
"env": {
"t": "2.5"
},
"id": "MISC-QIMA-COEF-IN-POWER"
}
],
"ex-3am-qimat-ibara-harfiya-l5-006:q5": [],
"ex-3am-qimat-ibara-harfiya-l5-006:q6": [],
"ex-3am-qimat-ibara-harfiya-l5-006:q7": [],
"ex-3am-qimat-ibara-harfiya-l5-006:q8": [],
"ex-3am-qimat-ibara-harfiya-l5-006:q9": [],
"ex-3am-qimat-ibara-harfiya-l5-007:q1": [],
"ex-3am-qimat-ibara-harfiya-l5-007:q2": [],
"ex-3am-qimat-ibara-harfiya-l5-007:q3": [],
"ex-3am-qimat-ibara-harfiya-l5-007:q4": [],
"ex-3am-qimat-ibara-harfiya-l5-007:q5": [],
"ex-3am-qimat-ibara-harfiya-l5-007:q6": [],
"ex-3am-qimat-ibara-harfiya-l5-007:q7": [],
"ex-3am-qimat-ibara-harfiya-l5-007:q8": [],
"ex-3am-qimat-ibara-harfiya-l5-007:q9": [],
"ex-3am-qimat-ibara-harfiya-l5-008:q1": [],
"ex-3am-qimat-ibara-harfiya-l5-008:q2": [],
"ex-3am-qimat-ibara-harfiya-l5-008:q3": [],
"ex-3am-qimat-ibara-harfiya-l5-008:q4": [],
"ex-3am-qimat-ibara-harfiya-l5-008:q5": [],
"ex-3am-qimat-ibara-harfiya-l5-008:q6": [],
"ex-3am-qimat-ibara-harfiya-l5-009:q1": [
{
"v": "30500",
"e": "(300+5)*100",
"env": {
"n": "100"
},
"id": "MISC-QIMA-LEFT-TO-RIGHT"
}
],
"ex-3am-qimat-ibara-harfiya-l5-009:q2": [],
"ex-3am-qimat-ibara-harfiya-l5-009:q3": [],
"ex-3am-qimat-ibara-harfiya-l5-009:q4": [
{
"v": "850",
"e": "850",
"env": {
"n": "50"
},
"id": "MISC-QIMA-FUSED"
}
],
"ex-3am-qimat-ibara-harfiya-l5-009:q5": [],
"ex-3am-qimat-ibara-harfiya-l5-009:q6": [],
"ex-3am-qimat-ibara-harfiya-l5-010:q1": [],
"ex-3am-qimat-ibara-harfiya-l5-010:q2": [
{
"v": "156.25",
"e": "12.5*12.5",
"env": {
"a": "12.5",
"b": "8"
},
"id": "MISC-QIMA-LETTERS-SAME"
}
],
"ex-3am-qimat-ibara-harfiya-l5-010:q3": [],
"ex-3am-qimat-ibara-harfiya-l5-010:q4": []
},
"facts": {
"ex-3am-qimat-ibara-harfiya-l1-001": [],
"ex-3am-qimat-ibara-harfiya-l1-002": [],
"ex-3am-qimat-ibara-harfiya-l1-003": [],
"ex-3am-qimat-ibara-harfiya-l1-004": [],
"ex-3am-qimat-ibara-harfiya-l1-005": [],
"ex-3am-qimat-ibara-harfiya-l1-006": [],
"ex-3am-qimat-ibara-harfiya-l1-007": [],
"ex-3am-qimat-ibara-harfiya-l1-008": [],
"ex-3am-qimat-ibara-harfiya-l1-009": [],
"ex-3am-qimat-ibara-harfiya-l1-010": [],
"ex-3am-qimat-ibara-harfiya-l2-001": [
{
"e": "5x^2-10x+6",
"env": {
"x": "-2"
},
"v": "46"
},
{
"e": "5x^2+2x-18",
"env": {
"x": "-2"
},
"v": "-2"
}
],
"ex-3am-qimat-ibara-harfiya-l2-002": [],
"ex-3am-qimat-ibara-harfiya-l2-003": [
{
"e": "(3x-2)(x-4)-(2x^2-9x+3)",
"env": {
"x": "2"
},
"v": "-1"
},
{
"e": "x^2-3x+3",
"env": {
"x": "2"
},
"v": "1"
}
],
"ex-3am-qimat-ibara-harfiya-l2-004": [
{
"e": "(x+5)(x+2)",
"env": {
"x": "1"
},
"v": "18"
},
{
"e": "x^2+10",
"env": {
"x": "1"
},
"v": "11"
}
],
"ex-3am-qimat-ibara-harfiya-l2-005": [
{
"e": "3x^2+3x+4",
"env": {
"x": "2"
},
"v": "22"
},
{
"e": "x^2+5x+4",
"env": {
"x": "2"
},
"v": "18"
}
],
"ex-3am-qimat-ibara-harfiya-l2-006": [],
"ex-3am-qimat-ibara-harfiya-l2-007": [],
"ex-3am-qimat-ibara-harfiya-l2-008": [
{
"e": "(a+b)^2",
"env": {
"a": "3",
"b": "4"
},
"v": "49"
},
{
"e": "a^2+b^2",
"env": {
"a": "3",
"b": "4"
},
"v": "25"
},
{
"e": "a^2+b^2",
"env": {
"a": "0",
"b": "5"
},
"v": "25"
}
],
"ex-3am-qimat-ibara-harfiya-l2-009": [],
"ex-3am-qimat-ibara-harfiya-l2-010": [
{
"e": "6x-2x^2",
"env": {
"x": "1"
},
"v": "4"
},
{
"e": "-2x(x+3)",
"env": {
"x": "1"
},
"v": "-8"
}
],
"ex-3am-qimat-ibara-harfiya-l3-001": [],
"ex-3am-qimat-ibara-harfiya-l3-002": [],
"ex-3am-qimat-ibara-harfiya-l3-003": [],
"ex-3am-qimat-ibara-harfiya-l3-004": [],
"ex-3am-qimat-ibara-harfiya-l3-005": [],
"ex-3am-qimat-ibara-harfiya-l3-006": [],
"ex-3am-qimat-ibara-harfiya-l3-007": [],
"ex-3am-qimat-ibara-harfiya-l3-008": [],
"ex-3am-qimat-ibara-harfiya-l3-009": [],
"ex-3am-qimat-ibara-harfiya-l3-010": [],
"ex-3am-qimat-ibara-harfiya-l4-001": [],
"ex-3am-qimat-ibara-harfiya-l4-002": [],
"ex-3am-qimat-ibara-harfiya-l4-003": [],
"ex-3am-qimat-ibara-harfiya-l4-004": [],
"ex-3am-qimat-ibara-harfiya-l4-005": [],
"ex-3am-qimat-ibara-harfiya-l4-006": [],
"ex-3am-qimat-ibara-harfiya-l4-007": [
{
"e": "(x+1)(x+6)",
"env": {
"x": "2"
},
"v": "24"
},
{
"e": "8x+6",
"env": {
"x": "2"
},
"v": "22"
}
],
"ex-3am-qimat-ibara-harfiya-l4-008": [],
"ex-3am-qimat-ibara-harfiya-l4-009": [],
"ex-3am-qimat-ibara-harfiya-l4-010": [],
"ex-3am-qimat-ibara-harfiya-l5-001": [],
"ex-3am-qimat-ibara-harfiya-l5-002": [],
"ex-3am-qimat-ibara-harfiya-l5-003": [],
"ex-3am-qimat-ibara-harfiya-l5-004": [],
"ex-3am-qimat-ibara-harfiya-l5-005": [],
"ex-3am-qimat-ibara-harfiya-l5-006": [],
"ex-3am-qimat-ibara-harfiya-l5-007": [],
"ex-3am-qimat-ibara-harfiya-l5-008": [],
"ex-3am-qimat-ibara-harfiya-l5-009": [],
"ex-3am-qimat-ibara-harfiya-l5-010": []
},
"shown": {
"ex-3am-qimat-ibara-harfiya-l1-001": [
"6x-5"
],
"ex-3am-qimat-ibara-harfiya-l1-002": [
"5x+2",
"4x+3x",
"3x+2"
],
"ex-3am-qimat-ibara-harfiya-l1-003": [
"4x+7",
"5-3x",
"2x-9"
],
"ex-3am-qimat-ibara-harfiya-l1-004": [
"x^2+1",
"10-x^2",
"x^2-9"
],
"ex-3am-qimat-ibara-harfiya-l1-005": [
"3x-2y",
"5x-y",
"xy+x"
],
"ex-3am-qimat-ibara-harfiya-l1-006": [
"6x-1"
],
"ex-3am-qimat-ibara-harfiya-l1-007": [
"2x^2+3x",
"20-3x",
"(x+3)(x-1)",
"3x^2-2x+1"
],
"ex-3am-qimat-ibara-harfiya-l1-008": [
"5x^2",
"1-4x^2",
"x^2-3x"
],
"ex-3am-qimat-ibara-harfiya-l1-009": [
"3x+2",
"x^2",
"2x^2-x",
"x^2+x"
],
"ex-3am-qimat-ibara-harfiya-l1-010": [
"x^2-2x+4"
],
"ex-3am-qimat-ibara-harfiya-l2-001": [
"5x^2-10x+6",
"5x^2+2x-18"
],
"ex-3am-qimat-ibara-harfiya-l2-002": [
"(2x-5)(4x+3)",
"8x^2-14x-15"
],
"ex-3am-qimat-ibara-harfiya-l2-003": [
"(3x-2)(x-4)-(2x^2-9x+3)",
"x^2-3x+3"
],
"ex-3am-qimat-ibara-harfiya-l2-004": [
"(x+5)(x+2)",
"x^2+10"
],
"ex-3am-qimat-ibara-harfiya-l2-005": [
"3x^2+3x+4",
"x^2+5x+4"
],
"ex-3am-qimat-ibara-harfiya-l2-006": [
"x^2-9",
"3x^2"
],
"ex-3am-qimat-ibara-harfiya-l2-007": [
"(x+3)^2",
"x^2+6x+9"
],
"ex-3am-qimat-ibara-harfiya-l2-008": [
"(a+b)^2",
"a^2+b^2"
],
"ex-3am-qimat-ibara-harfiya-l2-009": [
"(x-3)(x+3)",
"x^2-9"
],
"ex-3am-qimat-ibara-harfiya-l2-010": [
"6x-2x^2",
"-2x(x+3)"
],
"ex-3am-qimat-ibara-harfiya-l3-001": [
"5^2+(x-3)-(4x+7)",
"3x(x+2)+(2x+5)(x-1)"
],
"ex-3am-qimat-ibara-harfiya-l3-002": [
"(3x+2)(x+2)+5(x-1)"
],
"ex-3am-qimat-ibara-harfiya-l3-003": [
"4(x-1)+(x+5)(x-2)"
],
"ex-3am-qimat-ibara-harfiya-l3-004": [
"(3x-1)(x+4)-(2x^2+9x-7)",
"x^2+2x+3"
],
"ex-3am-qimat-ibara-harfiya-l3-005": [
"3x^2-5x-2(3x+1)+4",
"(2x+3)(x+5)",
"2x^2+13x+15"
],
"ex-3am-qimat-ibara-harfiya-l3-006": [
"2x^2-3x+1"
],
"ex-3am-qimat-ibara-harfiya-l3-007": [
"(x-1)(2-3x)"
],
"ex-3am-qimat-ibara-harfiya-l3-008": [
"3x-2y+xy"
],
"ex-3am-qimat-ibara-harfiya-l3-009": [
"2 pi r",
"pi r^2"
],
"ex-3am-qimat-ibara-harfiya-l3-010": [
"x(x-2)-3(x-1)^2"
],
"ex-3am-qimat-ibara-harfiya-l4-001": [
"3x(2x+1)-(x+4)",
"12+3y"
],
"ex-3am-qimat-ibara-harfiya-l4-002": [
"(x-3)(x+3)-(x^2+x+5)",
"-x-14"
],
"ex-3am-qimat-ibara-harfiya-l4-003": [
"x^2+(x+1)^2",
"(x+2)^2"
],
"ex-3am-qimat-ibara-harfiya-l4-004": [
"5x^2-3x"
],
"ex-3am-qimat-ibara-harfiya-l4-005": [
"x^2",
"x^2+2x"
],
"ex-3am-qimat-ibara-harfiya-l4-006": [
"x^2+14",
"x^2-5x+14"
],
"ex-3am-qimat-ibara-harfiya-l4-007": [
"(x+1)(x+6)",
"8x+6"
],
"ex-3am-qimat-ibara-harfiya-l4-008": [
"x^2+1/2 pi (x/2)^2"
],
"ex-3am-qimat-ibara-harfiya-l4-009": [
"(5-x)(y+3)",
"x^2-y^2"
],
"ex-3am-qimat-ibara-harfiya-l4-010": [
"x^2+(x+7)^2"
],
"ex-3am-qimat-ibara-harfiya-l5-001": [
"2(x+2)+2(x+9)",
"(x+2)(x+9)",
"(2(x+2)+2(x+9))/5"
],
"ex-3am-qimat-ibara-harfiya-l5-002": [
"2x(x+3)",
"(2x+5)(x+3)",
"2((2x+5)+(x+3))",
"650*2((2x+5)+(x+3))"
],
"ex-3am-qimat-ibara-harfiya-l5-003": [
"2((3x+1)+(2x-2))",
"(3x+1)(2x-2)",
"1200L+500"
],
"ex-3am-qimat-ibara-harfiya-l5-004": [
"x+10",
"x-2",
"(x+10)(x-2)"
],
"ex-3am-qimat-ibara-harfiya-l5-005": [
"20-6h",
"2(10-3h)"
],
"ex-3am-qimat-ibara-harfiya-l5-006": [
"30t-5t^2",
"5t(6-t)"
],
"ex-3am-qimat-ibara-harfiya-l5-007": [
"2(x+6)+2(x+4)",
"4x+20",
"(x+6)(x+4)",
"x^2+24"
],
"ex-3am-qimat-ibara-harfiya-l5-008": [
"(2x+3)(x+1)",
"2((2x+3)+(x+1))",
"150(2x+3)(x+1)"
],
"ex-3am-qimat-ibara-harfiya-l5-009": [
"300+5n",
"8n"
],
"ex-3am-qimat-ibara-harfiya-l5-010": [
"2(a+b)",
"ab",
"2(2a+b)"
]
}
};

/* ── Rationnels exacts ─────────────────────────────────────────────────── */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
class Q {
  constructor(n, d = 1n) {
    if (d === 0n) throw new Error('division par zéro');
    if (d < 0n) { n = -n; d = -d; }
    const g = gcd(n, d) || 1n; this.n = n / g; this.d = d / g;
  }
  static of(v) {
    if (v instanceof Q) return v;
    const s = String(v).trim().replace(',', '.').replace(/−/g, '-');
    if (s.includes('/')) { const [a, b] = s.split('/'); return Q.of(a).div(Q.of(b)); }
    if (s.includes('.')) {
      const neg = s.startsWith('-'); const [i, f] = s.replace('-', '').split('.');
      const r = new Q(BigInt(i + f), 10n ** BigInt(f.length)); return neg ? r.neg() : r;
    }
    return new Q(BigInt(s));
  }
  add(o) { return new Q(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { return new Q(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { return new Q(this.n * o.n, this.d * o.d); }
  div(o) { return new Q(this.n * o.d, this.d * o.n); }
  neg() { return new Q(-this.n, this.d); }
  eq(o) { return this.n === o.n && this.d === o.d; }
  lt(o) { return this.n * o.d < o.n * this.d; }
  isZero() { return this.n === 0n; }
  toString() { return this.d === 1n ? String(this.n) : `${this.n}/${this.d}`; }
}
const ZERO = new Q(0n);

/* ── Polynômes à plusieurs lettres (la lettre « π » en est une) ─────────── */
const mkey = (m) => Object.keys(m).filter((k) => m[k] > 0).sort().map((k) => `${k}${m[k]}`).join('*');
class Pn {
  constructor(t = new Map()) { this.t = t; }
  static c(q) { const p = new Pn(); if (!q.isZero()) p.t.set('', { q, m: {} }); return p; }
  static v(name) { const p = new Pn(); p.t.set(`${name}1`, { q: new Q(1n), m: { [name]: 1 } }); return p; }
  add(o) {
    const r = new Pn(new Map(this.t));
    for (const [k, { q, m }] of o.t) {
      const cur = r.t.get(k); const s = cur ? cur.q.add(q) : q;
      if (s.isZero()) r.t.delete(k); else r.t.set(k, { q: s, m });
    }
    return r;
  }
  neg() { const r = new Pn(); for (const [k, { q, m }] of this.t) r.t.set(k, { q: q.neg(), m }); return r; }
  sub(o) { return this.add(o.neg()); }
  mul(o) {
    let r = new Pn();
    for (const { q: a, m: ma } of this.t.values()) for (const { q: b, m: mb } of o.t.values()) {
      const m = { ...ma }; for (const [k, e] of Object.entries(mb)) m[k] = (m[k] ?? 0) + e;
      r = r.add(Object.assign(new Pn(), { t: new Map([[mkey(m), { q: a.mul(b), m }]]) }));
    }
    return r;
  }
  pow(n) { let r = Pn.c(new Q(1n)); for (let i = 0; i < n; i++) r = r.mul(this); return r; }
  isConst() { return [...this.t.keys()].every((k) => k === ''); }
  constVal() { return this.t.get('')?.q ?? ZERO; }
  equals(o) { return this.sub(o).t.size === 0; }
  letters() { const s = new Set(); for (const { m } of this.t.values()) Object.keys(m).forEach((k) => s.add(k)); return s; }
  coef(letter, deg) { // coefficient (rationnel) de letter^deg, les autres lettres absentes
    for (const { q, m } of this.t.values()) {
      const ks = Object.keys(m).filter((k) => m[k] > 0);
      if (deg === 0 ? ks.length === 0 : ks.length === 1 && ks[0] === letter && m[letter] === deg) return q;
    }
    return ZERO;
  }
}

/* ── Analyseur (propre à ce fichier) ───────────────────────────────────── */
function parse(src) {
  const s = String(src).replace(/\s+/g, '').replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/π/g, 'pi');
  const toks = [];
  for (let i = 0; i < s.length;) {
    const c = s[i];
    const m = s.slice(i).match(/^(\d+(\.\d+)?|\.\d+)/);
    if (m) { toks.push(['n', m[0]]); i += m[0].length; }
    else if (s.startsWith('pi', i)) { toks.push(['v', 'π']); i += 2; }
    else if (/[a-zA-Z]/.test(c)) { toks.push(['v', c]); i += 1; }
    else if ('+-*/^()'.includes(c)) { toks.push([c, c]); i += 1; }
    else throw new Error(`oracle qimat: caractère « ${c} » dans « ${src} »`);
  }
  let p = 0;
  const pk = () => toks[p]?.[0];
  const startsFactor = (k) => k === 'n' || k === 'v' || k === '(';
  const fail = (m) => { throw new Error(`oracle qimat: ${m} dans « ${src} »`); };
  function prim() {
    const k = pk();
    if (k === '(') { p++; const n = sum(); if (pk() !== ')') fail('« ) » attendue'); p++; return n; }
    if (k === 'n') return Pn.c(Q.of(toks[p++][1]));
    if (k === 'v') return Pn.v(toks[p++][1]);
    return fail('terme illisible');
  }
  function power() {
    const b = prim();
    if (pk() !== '^') return b;
    p++;
    let neg = false; let paren = false;
    if (pk() === '(') { paren = true; p++; }
    if (pk() === '-') { neg = true; p++; }
    if (pk() !== 'n') fail('exposant');
    const e = Number(toks[p++][1]);
    if (paren) { if (pk() !== ')') fail('exposant ('); p++; }
    if (neg) { if (b.isConst()) return Pn.c(new Q(1n).div(b.pow(e).constVal())); fail('exposant négatif d\'une lettre'); }
    return b.pow(e);
  }
  function unary() {
    if (pk() === '-') { p++; return unary().neg(); }
    if (pk() === '+') { p++; return unary(); }
    return power();
  }
  function product() {
    let n = unary();
    for (;;) {
      const k = pk();
      if (k === '*') { p++; n = n.mul(unary()); }
      else if (k === '/') {
        p++; const d = unary();
        if (!d.isConst() || d.constVal().isZero()) fail('division par une expression littérale ou nulle');
        n = n.mul(Pn.c(new Q(1n).div(d.constVal())));
      } else if (startsFactor(k)) n = n.mul(power());
      else return n;
    }
  }
  function sum() {
    let n = product();
    for (;;) {
      const k = pk();
      if (k === '+') { p++; n = n.add(product()); }
      else if (k === '-') { p++; n = n.sub(product()); }
      else return n;
    }
  }
  const n = sum();
  if (p !== toks.length) fail('caractère inattendu');
  return n;
}

const PI = (() => { // π à 40 chiffres, entier mis à l'échelle 10^40
  const s = '31415926535897932384626433832795028841971';
  return new Q(BigInt(s), 10n ** 40n);
})();
/** Substitue les lettres par des rationnels ; π reste une lettre ; rend un polynôme. */
function subst(p, env) {
  let out = Pn.c(ZERO);
  for (const { q, m } of p.t.values()) {
    let term = Pn.c(q);
    for (const [k, e] of Object.entries(m)) {
      if (k === 'π') term = term.mul(Pn.v('π').pow(e));
      else if (k in env) term = term.mul(Pn.c(Q.of(env[k])).pow(e));
      else term = term.mul(Pn.v(k).pow(e));
    }
    out = out.add(term);
  }
  return out;
}
const poly = (src, env = {}) => subst(parse(src), env);
/** Valeur (rationnel) d'une formule dont toutes les lettres sont remplacées ; null s'il reste une lettre. */
function value(src, env = {}) {
  const p = poly(src, env);
  return p.isConst() ? p.constVal() : null;
}
const need = (src, env) => {
  const v = value(src, env);
  if (v === null) throw new Error(`oracle qimat: « ${src} » garde une lettre pour ${JSON.stringify(env)}`);
  return v;
};
/** Valeur approchée de a + bπ : floor ou arrondi au plus près à 10^-k. */
function approx(src, env, k, mode) {
  const p = poly(src, env);
  const a = p.coef('π', 0); const b = p.coef('π', 1);
  const total = a.add(b.mul(PI));
  const scale = 10n ** BigInt(k);
  const num = total.n * scale; // total*scale = num / d
  let r = num / total.d; // troncature vers zéro
  const rem = num % total.d;
  if (rem !== 0n && (num < 0n) !== (total.d < 0n)) r -= 1n; // floor
  if (mode === 'round' && rem !== 0n) {
    const twice = (num - r * total.d) * 2n; // reste ≥ 0
    if (twice >= total.d) r += 1n;
  }
  return new Q(r, scale);
}
const cmpOp = (a, b, op) => ({ '<=': !b.lt(a), '>=': !a.lt(b), '<': a.lt(b), '>': b.lt(a), '==': a.eq(b) })[op];

/* ── Les vérifications portées par DATA ─────────────────────────────────── */
const MISC = new Set(['FUSED', 'NEG-POWER', 'SIGN-LOST', 'COEF-IN-POWER', 'LEFT-TO-RIGHT', 'SQUARE-DOUBLE', 'PARTIAL', 'LETTERS-SAME', 'ONE-VALUE'].map((s) => `MISC-QIMA-${s}`));

function decide(spec) {
  switch (spec.k) {
    case 'val': return R(need(spec.e, spec.env));
    case 'coef': return R(poly(spec.e).coef(spec.v ?? 'x', spec.deg));
    case 'sqrt': {
      const t = need(spec.e, spec.env);
      const isqrt = (n) => { if (n < 0n) throw new Error('racine négative'); if (n < 2n) return n; let x = n; let y = (x + 1n) / 2n; while (y < x) { x = y; y = (x + n / x) / 2n; } return x; };
      const a = isqrt(t.n); const b = isqrt(t.d);
      if (a * a !== t.n || b * b !== t.d) throw new Error(`oracle qimat: ${t} n'est pas un carré de rationnel`);
      return R(new Q(a, b));
    }
    case 'picoef': return R(spec.part === 'a' ? poly(spec.e, spec.env).coef('π', 0) : poly(spec.e, spec.env).coef('π', 1));
    case 'floor': return R(approx(spec.e, spec.env, spec.d, 'floor'));
    case 'round': return R(approx(spec.e, spec.env, spec.d, 'round'));
    case 'pick': {
      const t = need(spec.target.e, spec.target.env);
      const hits = Object.entries(spec.opts).filter(([, o]) => { const v = value(o.e, o.env); return v !== null && v.eq(t); }).map(([id]) => id);
      if (hits.length !== 1) throw new Error(`oracle qimat: ${hits.length} ligne(s) valent ${t} (« ${spec.target.e} »)`);
      return C(hits[0]);
    }
    case 'cmp': return C(cmpOp(need(spec.e, spec.env), need(spec.rhs, spec.env), spec.op) ? spec.yes : spec.no);
    default: return null;
  }
}
/** La prémisse d'un QCM de conclusion. */
function checkPremise(key, p) {
  const A = (env) => need(p.a, env); const B = (env) => need(p.b, env);
  for (const env of p.agree ?? []) if (!A(env).eq(B(env))) throw new Error(`${key}: les formules devraient s'accorder en ${JSON.stringify(env)}`);
  if (p.witness) {
    const w = Array.isArray(p.witness) ? p.witness : [p.witness];
    for (const env of w) if (A(env).eq(B(env))) throw new Error(`${key}: ${JSON.stringify(env)} ne sépare pas les formules`);
  }
  const same = poly(p.a).equals(poly(p.b));
  if (p.expect === 'eq' && !same) throw new Error(`${key}: les formules devraient être égales (polynômes)`);
  if (p.expect === 'neq' && same) throw new Error(`${key}: les formules devraient être différentes (polynômes)`);
  if (p.expect === 'neq' && !p.witness) throw new Error(`${key}: « différentes » exige un témoin`);
}

/* ── ORACLE ─────────────────────────────────────────────────────────────── */
export const ORACLE = {};
for (const [key, spec] of Object.entries(DATA.oracle)) {
  const r = decide(spec);
  if (r) ORACLE[key] = r;
}

/* ── TeX → ASCII (relecture des énoncés) ────────────────────────────────── */
function texToAscii(t) {
  let s = String(t).replace(/\\left|\\right/g, '').replace(/\\times|\\cdot/g, '*').replace(/\{,\}/g, '.').replace(/\\pi/g, 'pi')
    .replace(/\\[,;! ]/g, '').replace(/−/g, '-').replace(/\[/g, '(').replace(/\]/g, ')');
  for (let i = 0; i < 6 && /\\dfrac\{[^{}]*\}\{[^{}]*\}/.test(s); i++) s = s.replace(/\\dfrac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))');
  s = s.replace(/\^\{([^{}]*)\}/g, '^($1)').replace(/\^\(([0-9])\)/g, '^$1');
  return s;
}
const islands = (text) => [...String(text ?? '').matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
const tryPoly = (txt) => { try { return poly(texToAscii(txt)); } catch { return null; } };
/** Les formules d'un îlot « E = … » : la partie après le dernier « = ». */
const rhsOf = (isl) => isl.split('=').pop();

export function audit(bank) {
  const bad = [];
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content/practice/3am/qimat-ibara-harfiya');
  const exFiles = new Map();
  const exercise = (key) => {
    const id = key.split(':')[0];
    if (!exFiles.has(id)) exFiles.set(id, JSON.parse(readFileSync(join(root, `level-${id.match(/-l(\d)-/)[1]}`, `${id}.json`), 'utf8')));
    return exFiles.get(id);
  };
  const seenEx = new Set();
  for (const { key, q } of bank) {
    const spec = DATA.oracle[key];
    const ex = exercise(key);
    // 1. clés réduites et décidées
    if (q.answerType === 'rational') {
      if (!spec || !['val', 'coef', 'picoef', 'floor', 'round', 'sqrt'].includes(spec.k)) bad.push(`${key}: aucune formule d'oracle`);
      else {
        const exp = Q.of(q.expectedAnswer);
        if (String(exp) !== String(Q.of(ORACLE[key].value))) bad.push(`${key}: clé ${q.expectedAnswer} ≠ ${ORACLE[key].value}`);
        if (/\//.test(String(q.expectedAnswer)) && String(exp) !== String(q.expectedAnswer)) bad.push(`${key}: clé non réduite`);
      }
    }
    // 2. signatures d'erreur : la valeur de la mauvaise lecture, étiquetée
    const sigs = DATA.sigs[key] ?? [];
    const decl = q.misconceptionSignatures ?? [];
    if (decl.length !== sigs.length) bad.push(`${key}: ${decl.length} signature(s) dans le contenu, ${sigs.length} vérifiée(s)`);
    for (const s of sigs) {
      const v = need(s.e, s.env);
      if (!v.eq(Q.of(s.v))) bad.push(`${key}: la lecture « ${s.e} » vaut ${v}, pas ${s.v}`);
      if (!MISC.has(s.id)) bad.push(`${key}: ${s.id} n'est pas une MISC-QIMA-*`);
      if (!decl.some((d) => Q.of(d.value).eq(v) && d.id === s.id)) bad.push(`${key}: signature ${s.v}/${s.id} absente du contenu`);
      if (q.answerType === 'rational' && v.eq(Q.of(q.expectedAnswer))) bad.push(`${key}: la signature ${s.v} est la bonne réponse`);
    }
    // 3. QCM
    if (q.answerType === 'choice') {
      const right = q.choices.filter((c) => c.isCorrect);
      if (right.length !== 1) bad.push(`${key}: ${right.length} bonne(s) option(s)`);
      for (const c of q.choices) if (!c.isCorrect && !MISC.has(c.misconceptionId)) bad.push(`${key}: distracteur ${c.id} sans MISC-QIMA-*`);
      if (key in ORACLE && ORACLE[key].choiceId !== right[0]?.id) bad.push(`${key}: l'oracle choisit ${ORACLE[key].choiceId}, le contenu ${right[0]?.id}`);
    }
    // 4. nombres cités
    // 5. prémisse
    if (spec?.k === 'premise') { try { checkPremise(key, spec); } catch (e) { bad.push(e.message); } }
    // 6. valeurs données aux lettres (relues dans l'énoncé)
    if (spec && 'env' in spec && spec.k === 'val') {
      const isl = islands(`${q.lead ?? ''} ${q.statement}`).concat(islands(ex.statement.content));
      for (const [l, vv] of Object.entries(spec.env)) {
        const hit = isl.find((i) => new RegExp(`^\\s*${l}\\s*=`).test(i));
        if (!hit) bad.push(`${key}: l'énoncé ne donne pas ${l}`);
        else { const p = tryPoly(rhsOf(hit)); const w = p?.isConst() ? p.constVal() : null; if (!w || !w.eq(Q.of(vv))) bad.push(`${key}: l'énoncé donne ${hit}, l'oracle ${l} = ${vv}`); }
      }
    }
    // 7. formules annoncées dans l'énoncé de la feuille
    if (!seenEx.has(ex.id)) {
      seenEx.add(ex.id);
      const all = [...islands(ex.statement.content), ...(ex.statement.formulas ?? []), ...ex.questions.flatMap((x) => [x.lead, x.statement]).flatMap(islands)];
      const polys = all.flatMap((i) => i.split('=')).map((part) => tryPoly(part)).filter(Boolean);
      for (const f of DATA.shown[ex.id] ?? []) {
        const p = poly(f);
        if (!polys.some((x) => x.equals(p))) bad.push(`${ex.id}: la formule « ${f} » n'apparaît pas dans l'énoncé`);
      }
      for (const f of DATA.facts[ex.id] ?? []) {
        const v = need(f.e, f.env);
        if (!v.eq(Q.of(f.v))) bad.push(`${ex.id}: « ${f.e} » ${JSON.stringify(f.env)} vaut ${v}, pas ${f.v}`);
      }
    }
  }
  // 8. chaque neuf misconceptions citées par une question du banc existe au registre (le validateur le contrôle aussi)
  return bad;
}
