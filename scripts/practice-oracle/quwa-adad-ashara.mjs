// Oracle du banc « quwa-adad-ashara » (قوى العدد 10, 3AM unité 3, 2026-10-26) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل الأول / الثاني »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, avec une arithmétique de RATIONNELS exacts en BigInt écrite dans
// ce fichier (indépendante de packages/core/arithmetic/tenPowers.js et de tout autre oracle) :
//  - DATA.oracle[clé] décrit la question dans une écriture ASCII retapée (« 10^-4 », « 45*10^3 », « N[ألف] » = le nom du nombre,
//    « P[ميلي] » = la valeur de la bûchette, « Z[12] » = 1 suivi de 12 zéros, « R[7] » = le 1 au rang 7 après la virgule) ;
//  - exp : l'UNIQUE n tel que la valeur = 10^n (n ∈ [-40, 40]) ; solve : l'UNIQUE n tel que c × 10^n = valeur ; val : l'écriture
//    décimale EXACTE de la valeur ; zeros / digits / rank / zerosAfterComma / zerosBefore : comptages faits sur la chaîne décimale
//    exacte ; minexp / maxexp : la plus petite / la plus grande puissance ; terms : le nombre de chiffres non nuls (termes du
//    مفكوك) ;
//  - un QCM est jugé option par option : chaque option a une affirmation ASCII (« 10^-2=1/10^2 », chaînes « a<b<c », « & »,
//    « YES: » / « NO: » pour oui/non) ; il faut EXACTEMENT une option vraie, et c'est celle que le contenu marque ;
//  - audit(bank) relit le texte : les nombres de l'énoncé ET des options figurent dans l'affirmation retapée (aucune dérive de
//    saisie), les clés sont exactes, chaque signature vaut une valeur ≠ clé portant un MISC-ASHARA-*, chaque distracteur de QCM
//    porte un MISC-ASHARA-* et est FAUX.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C } from './helpers.mjs';

const DATA = {
 "oracle": {
  "ex-3am-quwa-adad-ashara-l1-001:q1": {
   "k": "exp",
   "e": "10000000"
  },
  "ex-3am-quwa-adad-ashara-l1-001:q2": {
   "k": "exp",
   "e": "100"
  },
  "ex-3am-quwa-adad-ashara-l1-001:q3": {
   "k": "exp",
   "e": "0.000001"
  },
  "ex-3am-quwa-adad-ashara-l1-001:q4": {
   "k": "exp",
   "e": "0.01"
  },
  "ex-3am-quwa-adad-ashara-l1-002:q1": {
   "k": "pickText",
   "claims": [
    true,
    false,
    false
   ]
  },
  "ex-3am-quwa-adad-ashara-l1-002:q2": {
   "k": "pickName",
   "claims": [
    "N[عشرة ملايين]=10^6",
    "N[ستّون]=10^6",
    "N[مليون]=10^6"
   ]
  },
  "ex-3am-quwa-adad-ashara-l1-002:q3": {
   "k": "exp",
   "e": "N[ألف]"
  },
  "ex-3am-quwa-adad-ashara-l1-003:q1": {
   "k": "val",
   "e": "10^3"
  },
  "ex-3am-quwa-adad-ashara-l1-003:q2": {
   "k": "val",
   "e": "10^6"
  },
  "ex-3am-quwa-adad-ashara-l1-003:q3": {
   "k": "val",
   "e": "10^8"
  },
  "ex-3am-quwa-adad-ashara-l1-003:q4": {
   "k": "val",
   "e": "10^11"
  },
  "ex-3am-quwa-adad-ashara-l1-004:q1": {
   "k": "zeros",
   "e": "10^9"
  },
  "ex-3am-quwa-adad-ashara-l1-004:q2": {
   "k": "digits",
   "e": "10^5"
  },
  "ex-3am-quwa-adad-ashara-l1-004:q3": {
   "k": "exp",
   "e": "Z[12]"
  },
  "ex-3am-quwa-adad-ashara-l1-005:q1": {
   "k": "val",
   "e": "10^-3"
  },
  "ex-3am-quwa-adad-ashara-l1-005:q2": {
   "k": "val",
   "e": "10^-4"
  },
  "ex-3am-quwa-adad-ashara-l1-005:q3": {
   "k": "val",
   "e": "10^-6"
  },
  "ex-3am-quwa-adad-ashara-l1-005:q4": {
   "k": "val",
   "e": "10^-8"
  },
  "ex-3am-quwa-adad-ashara-l1-006:q1": {
   "k": "exp",
   "e": "10000"
  },
  "ex-3am-quwa-adad-ashara-l1-006:q2": {
   "k": "exp",
   "e": "100000000"
  },
  "ex-3am-quwa-adad-ashara-l1-006:q3": {
   "k": "exp",
   "e": "0.001"
  },
  "ex-3am-quwa-adad-ashara-l1-006:q4": {
   "k": "exp",
   "e": "0.00000001"
  },
  "ex-3am-quwa-adad-ashara-l1-007:q1": {
   "k": "rank",
   "e": "10^-5"
  },
  "ex-3am-quwa-adad-ashara-l1-007:q2": {
   "k": "zerosAfterComma",
   "e": "10^-4"
  },
  "ex-3am-quwa-adad-ashara-l1-007:q3": {
   "k": "exp",
   "e": "R[7]"
  },
  "ex-3am-quwa-adad-ashara-l1-008:q1": {
   "k": "pick",
   "claims": [
    "100=10^3",
    "1000=10^3",
    "30=10^3"
   ]
  },
  "ex-3am-quwa-adad-ashara-l1-008:q2": {
   "k": "pick",
   "claims": [
    "100000000=10^8",
    "80=10^8",
    "10000000=10^8"
   ]
  },
  "ex-3am-quwa-adad-ashara-l1-008:q3": {
   "k": "exp",
   "e": "N[عشرة ملايين]"
  },
  "ex-3am-quwa-adad-ashara-l1-009:q1": {
   "k": "pick",
   "claims": [
    "100000=10^6",
    "60=10^6",
    "1000000=10^6"
   ]
  },
  "ex-3am-quwa-adad-ashara-l1-009:q2": {
   "k": "zeros",
   "e": "10^15"
  },
  "ex-3am-quwa-adad-ashara-l1-010:q1": {
   "k": "val",
   "e": "10^1"
  },
  "ex-3am-quwa-adad-ashara-l1-010:q2": {
   "k": "exp",
   "e": "10000"
  },
  "ex-3am-quwa-adad-ashara-l1-010:q3": {
   "k": "exp",
   "e": "10*10*10*10*10*10*10"
  },
  "ex-3am-quwa-adad-ashara-l2-001:q1": {
   "k": "recipExp",
   "e": "10^-3"
  },
  "ex-3am-quwa-adad-ashara-l2-001:q2": {
   "k": "val",
   "e": "1/10^5"
  },
  "ex-3am-quwa-adad-ashara-l2-001:q3": {
   "k": "val",
   "e": "10^-7"
  },
  "ex-3am-quwa-adad-ashara-l2-002:q1": {
   "k": "pick",
   "claims": [
    "10=10^0",
    "1=10^0",
    "0=10^0"
   ]
  },
  "ex-3am-quwa-adad-ashara-l2-002:q2": {
   "k": "exp",
   "e": "1"
  },
  "ex-3am-quwa-adad-ashara-l2-002:q3": {
   "k": "val",
   "e": "10^1"
  },
  "ex-3am-quwa-adad-ashara-l2-003:q1": {
   "k": "exp",
   "e": "1/10^4"
  },
  "ex-3am-quwa-adad-ashara-l2-003:q2": {
   "k": "exp",
   "e": "1/10^7"
  },
  "ex-3am-quwa-adad-ashara-l2-003:q3": {
   "k": "val",
   "e": "1/10^6"
  },
  "ex-3am-quwa-adad-ashara-l2-003:q4": {
   "k": "val",
   "e": "1/10^9"
  },
  "ex-3am-quwa-adad-ashara-l2-004:q1": {
   "k": "pick",
   "claims": [
    "10^-2=1/10^2",
    "10^-2=-(10^2)",
    "10^-2=0.001"
   ]
  },
  "ex-3am-quwa-adad-ashara-l2-004:q2": {
   "k": "exp",
   "e": "1/1000"
  },
  "ex-3am-quwa-adad-ashara-l2-004:q3": {
   "k": "exp",
   "e": "1/10^-3"
  },
  "ex-3am-quwa-adad-ashara-l2-005:q1": {
   "k": "exp",
   "e": "N[جزء من مليون]"
  },
  "ex-3am-quwa-adad-ashara-l2-005:q2": {
   "k": "exp",
   "e": "N[جزء من ألف]"
  },
  "ex-3am-quwa-adad-ashara-l2-005:q3": {
   "k": "pickName",
   "claims": [
    "0.0000000001=N[جزء من مليار]",
    "-1000000000=N[جزء من مليار]",
    "0.000000001=N[جزء من مليار]"
   ]
  },
  "ex-3am-quwa-adad-ashara-l2-006:q1": {
   "k": "exp",
   "e": "10000000"
  },
  "ex-3am-quwa-adad-ashara-l2-006:q2": {
   "k": "exp",
   "e": "0.000001"
  },
  "ex-3am-quwa-adad-ashara-l2-006:q3": {
   "k": "exp",
   "e": "1/10^8"
  },
  "ex-3am-quwa-adad-ashara-l2-006:q4": {
   "k": "exp",
   "e": "1/10^-6"
  },
  "ex-3am-quwa-adad-ashara-l2-007:q1": {
   "k": "exp",
   "e": "1000"
  },
  "ex-3am-quwa-adad-ashara-l2-007:q2": {
   "k": "exp",
   "e": "0.001"
  },
  "ex-3am-quwa-adad-ashara-l2-007:q3": {
   "k": "pickText",
   "claims": [
    "0.000001=10^-5",
    "0.000001=10^-6",
    "0.000001=10^6"
   ]
  },
  "ex-3am-quwa-adad-ashara-l2-008:q1": {
   "k": "pickText",
   "claims": [
    "10^-4<10^-6",
    "10^-6<10^-4"
   ]
  },
  "ex-3am-quwa-adad-ashara-l2-008:q2": {
   "k": "pick",
   "claims": [
    "10^0<10^-3<10^3",
    "10^3<10^0<10^-3",
    "10^-3<10^0<10^3"
   ]
  },
  "ex-3am-quwa-adad-ashara-l2-008:q3": {
   "k": "minexp",
   "exps": [
    -2,
    -5,
    -7
   ]
  },
  "ex-3am-quwa-adad-ashara-l2-009:q1": {
   "k": "pick",
   "claims": [
    "0.001=10^-2",
    "0.01=10^-2",
    "-0.01=10^-2"
   ]
  },
  "ex-3am-quwa-adad-ashara-l2-009:q2": {
   "k": "val",
   "e": "10^-5"
  },
  "ex-3am-quwa-adad-ashara-l2-010:q1": {
   "k": "pick",
   "claims": [
    "10^-3=0.001",
    "10^-3=-1000",
    "10^-3=0.0001"
   ]
  },
  "ex-3am-quwa-adad-ashara-l2-010:q2": {
   "k": "pickYN",
   "claims": [
    "YES:10^0=10",
    "NO:10^0=10"
   ]
  },
  "ex-3am-quwa-adad-ashara-l3-001:q1": {
   "k": "val",
   "e": "10^7"
  },
  "ex-3am-quwa-adad-ashara-l3-001:q2": {
   "k": "val",
   "e": "10^-4"
  },
  "ex-3am-quwa-adad-ashara-l3-001:q3": {
   "k": "val",
   "e": "10^3"
  },
  "ex-3am-quwa-adad-ashara-l3-001:q4": {
   "k": "val",
   "e": "10^-8"
  },
  "ex-3am-quwa-adad-ashara-l3-002:q1": {
   "k": "val",
   "e": "1000*1000"
  },
  "ex-3am-quwa-adad-ashara-l3-002:q2": {
   "k": "exp",
   "e": "1000000"
  },
  "ex-3am-quwa-adad-ashara-l3-002:q3": {
   "k": "exp",
   "e": "0.001"
  },
  "ex-3am-quwa-adad-ashara-l3-003:q1": {
   "k": "val",
   "e": "1000*1000"
  },
  "ex-3am-quwa-adad-ashara-l3-003:q2": {
   "k": "exp",
   "e": "1000*1000"
  },
  "ex-3am-quwa-adad-ashara-l3-003:q3": {
   "k": "val",
   "e": "25*10^6"
  },
  "ex-3am-quwa-adad-ashara-l3-004:q1": {
   "k": "exp",
   "e": "P[كيلو]"
  },
  "ex-3am-quwa-adad-ashara-l3-004:q2": {
   "k": "exp",
   "e": "0.01"
  },
  "ex-3am-quwa-adad-ashara-l3-004:q3": {
   "k": "exp",
   "e": "P[ميلي]"
  },
  "ex-3am-quwa-adad-ashara-l3-004:q4": {
   "k": "exp",
   "e": "10"
  },
  "ex-3am-quwa-adad-ashara-l3-005:q1": {
   "k": "val",
   "e": "1000*100"
  },
  "ex-3am-quwa-adad-ashara-l3-005:q2": {
   "k": "exp",
   "e": "100000"
  },
  "ex-3am-quwa-adad-ashara-l3-005:q3": {
   "k": "val",
   "e": "10^4/1000"
  },
  "ex-3am-quwa-adad-ashara-l3-006:q1": {
   "k": "exp",
   "e": "1000"
  },
  "ex-3am-quwa-adad-ashara-l3-006:q2": {
   "k": "exp",
   "e": "1000000"
  },
  "ex-3am-quwa-adad-ashara-l3-006:q3": {
   "k": "exp",
   "e": "1000000000"
  },
  "ex-3am-quwa-adad-ashara-l3-006:q4": {
   "k": "exp",
   "e": "1000000000000"
  },
  "ex-3am-quwa-adad-ashara-l3-007:q1": {
   "k": "solve",
   "c": "45",
   "v": "45000"
  },
  "ex-3am-quwa-adad-ashara-l3-007:q2": {
   "k": "solve",
   "c": "7",
   "v": "0.0007"
  },
  "ex-3am-quwa-adad-ashara-l3-007:q3": {
   "k": "solve",
   "c": "52",
   "e": "52*N[ألف]"
  },
  "ex-3am-quwa-adad-ashara-l3-008:q1": {
   "k": "val",
   "e": "10*10"
  },
  "ex-3am-quwa-adad-ashara-l3-008:q2": {
   "k": "exp",
   "e": "10*10"
  },
  "ex-3am-quwa-adad-ashara-l3-008:q3": {
   "k": "val",
   "e": "10*10*10"
  },
  "ex-3am-quwa-adad-ashara-l3-008:q4": {
   "k": "exp",
   "e": "10*10*10"
  },
  "ex-3am-quwa-adad-ashara-l3-009:q1": {
   "k": "exp",
   "e": "0.000000001"
  },
  "ex-3am-quwa-adad-ashara-l3-009:q2": {
   "k": "exp",
   "e": "1000000000"
  },
  "ex-3am-quwa-adad-ashara-l3-009:q3": {
   "k": "pickName",
   "claims": [
    "P[ميلي]=10^6",
    "P[ميغا]=10^6",
    "P[ميكرو]=10^6"
   ]
  },
  "ex-3am-quwa-adad-ashara-l3-010:q1": {
   "k": "val",
   "e": "4*10^6"
  },
  "ex-3am-quwa-adad-ashara-l3-010:q2": {
   "k": "val",
   "e": "3*10^-2"
  },
  "ex-3am-quwa-adad-ashara-l3-010:q3": {
   "k": "solve",
   "c": "8",
   "v": "0.08"
  },
  "ex-3am-quwa-adad-ashara-l4-001:q1": {
   "k": "pick",
   "claims": [
    "3285=3*10^3+2*10^2+8*10^1+5*10^0",
    "3285=3*10^4+2*10^3+8*10^2+5*10^1",
    "3285=3*10^3+2*10^2+8*10^1+5*10^1"
   ]
  },
  "ex-3am-quwa-adad-ashara-l4-001:q2": {
   "k": "solve",
   "c": "8",
   "e": "3285-3*10^3-2*10^2-5*10^0"
  },
  "ex-3am-quwa-adad-ashara-l4-001:q3": {
   "k": "pick",
   "claims": [
    "0.407=4*10^-1+7*10^-2",
    "0.407=4*10^-2+7*10^-3",
    "0.407=4*10^-1+7*10^-3"
   ]
  },
  "ex-3am-quwa-adad-ashara-l4-002:q1": {
   "k": "pick",
   "claims": [
    "6000000=10^6",
    "10000000=10^6",
    "60=10^6",
    "1000000=10^6"
   ]
  },
  "ex-3am-quwa-adad-ashara-l4-002:q2": {
   "k": "pick",
   "claims": [
    "10+10+10+10+10+10=10^6",
    "10*10*10*10*10*10*10=10^6",
    "10*10*10*10*10*10=10^6",
    "10*6=10^6"
   ]
  },
  "ex-3am-quwa-adad-ashara-l4-003:q1": {
   "k": "pick",
   "claims": [
    "10^6=6000000",
    "10^6=10000000",
    "10^6=1000000"
   ]
  },
  "ex-3am-quwa-adad-ashara-l4-003:q2": {
   "k": "pickText",
   "claims": [
    "10^-3>1",
    "10^-3>0&10^-3<1",
    "10^-3<0"
   ]
  },
  "ex-3am-quwa-adad-ashara-l4-003:q3": {
   "k": "pickYN",
   "claims": [
    "YES:10^0=0",
    "NO:10^0=0"
   ]
  },
  "ex-3am-quwa-adad-ashara-l4-004:q1": {
   "k": "pick",
   "claims": [
    "0.001=-(10^3)",
    "0.001=10^-2",
    "0.001=10^-3"
   ]
  },
  "ex-3am-quwa-adad-ashara-l4-004:q2": {
   "k": "recipExp",
   "e": "0.0001"
  },
  "ex-3am-quwa-adad-ashara-l4-005:q1": {
   "k": "pick",
   "claims": [
    "7040300=7*10^6+4*10^5+3*10^2",
    "7040300=7*10^6+4*10^4+3*10^2",
    "7040300=7*10^7+4*10^5+3*10^3"
   ]
  },
  "ex-3am-quwa-adad-ashara-l4-005:q2": {
   "k": "terms",
   "v": "7040300"
  },
  "ex-3am-quwa-adad-ashara-l4-005:q3": {
   "k": "solve",
   "c": "4",
   "e": "7040300-7*10^6-3*10^2"
  },
  "ex-3am-quwa-adad-ashara-l4-006:q1": {
   "k": "pick",
   "claims": [
    "0.0509=5*10^-2+9*10^-4",
    "0.0509=5*10^-1+9*10^-3",
    "0.0509=5*10^-2+9*10^-3"
   ]
  },
  "ex-3am-quwa-adad-ashara-l4-006:q2": {
   "k": "solve",
   "c": "9",
   "e": "0.0509-5*10^-2"
  },
  "ex-3am-quwa-adad-ashara-l4-006:q3": {
   "k": "solve",
   "c": "7",
   "e": "5030.07-5*10^3-3*10^1"
  },
  "ex-3am-quwa-adad-ashara-l4-007:q1": {
   "k": "solve",
   "c": "25",
   "v": "250000"
  },
  "ex-3am-quwa-adad-ashara-l4-007:q2": {
   "k": "solve",
   "c": "3",
   "v": "0.0003"
  },
  "ex-3am-quwa-adad-ashara-l4-007:q3": {
   "k": "solve",
   "c": "12",
   "v": "1200000"
  },
  "ex-3am-quwa-adad-ashara-l4-008:q1": {
   "k": "pick",
   "claims": [
    "52*10^7=52*N[مليون]",
    "52*6=52*N[مليون]",
    "52*10^6=52*N[مليون]"
   ]
  },
  "ex-3am-quwa-adad-ashara-l4-008:q2": {
   "k": "solve",
   "c": "7",
   "e": "7*N[مليون]"
  },
  "ex-3am-quwa-adad-ashara-l4-009:q1": {
   "k": "val",
   "e": "4*10^3+7*10^1"
  },
  "ex-3am-quwa-adad-ashara-l4-009:q2": {
   "k": "val",
   "e": "2*10^2+5*10^-1"
  },
  "ex-3am-quwa-adad-ashara-l4-009:q3": {
   "k": "val",
   "e": "6*10^-1+3*10^-3"
  },
  "ex-3am-quwa-adad-ashara-l4-010:q1": {
   "k": "pick",
   "claims": [
    "45000=4*10^3+5*10^4",
    "45000=45*10^3",
    "45000=45*10^5"
   ]
  },
  "ex-3am-quwa-adad-ashara-l4-010:q2": {
   "k": "solve",
   "c": "7",
   "v": "0.07"
  },
  "ex-3am-quwa-adad-ashara-l4-010:q3": {
   "k": "solve",
   "c": "28",
   "v": "28000"
  },
  "ex-3am-quwa-adad-ashara-l5-001:q1": {
   "k": "exp",
   "e": "0.0001"
  },
  "ex-3am-quwa-adad-ashara-l5-001:q2": {
   "k": "exp",
   "e": "0.00000001"
  },
  "ex-3am-quwa-adad-ashara-l5-001:q3": {
   "k": "zerosBefore",
   "e": "0.00000001"
  },
  "ex-3am-quwa-adad-ashara-l5-001:q4": {
   "k": "pickText",
   "claims": [
    "10^-8<10^-6&10^-8<10^-4",
    "10^-4<10^-6&10^-4<10^-8",
    "10^-8>10^-4&10^-8>10^-6"
   ]
  },
  "ex-3am-quwa-adad-ashara-l5-002:q1": {
   "k": "pick",
   "claims": [
    "2305.047=2*10^3+3*10^2+5*10^1+4*10^-1+7*10^-2",
    "2305.047=2*10^4+3*10^3+5*10^1+4*10^-1+7*10^-2",
    "2305.047=2*10^3+3*10^2+5*10^0+4*10^-2+7*10^-3"
   ]
  },
  "ex-3am-quwa-adad-ashara-l5-002:q2": {
   "k": "val",
   "e": "0.047*1000"
  },
  "ex-3am-quwa-adad-ashara-l5-002:q3": {
   "k": "exp",
   "e": "0.001"
  },
  "ex-3am-quwa-adad-ashara-l5-002:q4": {
   "k": "val",
   "e": "18*10^3"
  },
  "ex-3am-quwa-adad-ashara-l5-003:q1": {
   "k": "exp",
   "e": "1000000000"
  },
  "ex-3am-quwa-adad-ashara-l5-003:q2": {
   "k": "val",
   "e": "4*1000000"
  },
  "ex-3am-quwa-adad-ashara-l5-003:q3": {
   "k": "solve",
   "c": "64",
   "e": "64*1000000000"
  },
  "ex-3am-quwa-adad-ashara-l5-003:q4": {
   "k": "val",
   "e": "1000000000/1000000"
  },
  "ex-3am-quwa-adad-ashara-l5-004:q1": {
   "k": "val",
   "e": "2000*1000"
  },
  "ex-3am-quwa-adad-ashara-l5-004:q2": {
   "k": "solve",
   "c": "2",
   "v": "2000000"
  },
  "ex-3am-quwa-adad-ashara-l5-004:q3": {
   "k": "val",
   "e": "40000*1000"
  },
  "ex-3am-quwa-adad-ashara-l5-004:q4": {
   "k": "solve",
   "c": "4",
   "v": "40000000"
  },
  "ex-3am-quwa-adad-ashara-l5-004:q5": {
   "k": "solve",
   "c": "7",
   "e": "40075-4*10^4-5*10^0"
  },
  "ex-3am-quwa-adad-ashara-l5-005:q1": {
   "k": "val",
   "e": "500/1000"
  },
  "ex-3am-quwa-adad-ashara-l5-005:q2": {
   "k": "exp",
   "e": "0.001"
  },
  "ex-3am-quwa-adad-ashara-l5-005:q3": {
   "k": "exp",
   "e": "0.000001"
  },
  "ex-3am-quwa-adad-ashara-l5-005:q4": {
   "k": "solve",
   "c": "2",
   "v": "2000"
  },
  "ex-3am-quwa-adad-ashara-l5-006:q1": {
   "k": "exp",
   "e": "0.0000000001"
  },
  "ex-3am-quwa-adad-ashara-l5-006:q2": {
   "k": "exp",
   "e": "0.00001"
  },
  "ex-3am-quwa-adad-ashara-l5-006:q3": {
   "k": "pick",
   "claims": [
    "10^-6<10^-5<10^-3<10^-10",
    "10^-10<10^-6<10^-5<10^-3",
    "10^-3<10^-5<10^-6<10^-10"
   ]
  },
  "ex-3am-quwa-adad-ashara-l5-006:q4": {
   "k": "maxexp",
   "exps": [
    -3,
    -5,
    -6
   ]
  },
  "ex-3am-quwa-adad-ashara-l5-006:q5": {
   "k": "zerosAfterComma",
   "e": "0.0000000001"
  },
  "ex-3am-quwa-adad-ashara-l5-007:q1": {
   "k": "solve",
   "c": "15",
   "v": "150000000"
  },
  "ex-3am-quwa-adad-ashara-l5-007:q2": {
   "k": "val",
   "e": "150000000*1000"
  },
  "ex-3am-quwa-adad-ashara-l5-007:q3": {
   "k": "solve",
   "c": "15",
   "v": "150000000000"
  },
  "ex-3am-quwa-adad-ashara-l5-007:q4": {
   "k": "solve",
   "c": "3",
   "v": "300000"
  },
  "ex-3am-quwa-adad-ashara-l5-008:q1": {
   "k": "exp",
   "e": "1000000"
  },
  "ex-3am-quwa-adad-ashara-l5-008:q2": {
   "k": "exp",
   "e": "0.000001"
  },
  "ex-3am-quwa-adad-ashara-l5-008:q3": {
   "k": "pickName",
   "claims": [
    "P[جيغا]=10^9",
    "P[نانو]=10^9",
    "P[ميلي]=10^3"
   ]
  },
  "ex-3am-quwa-adad-ashara-l5-008:q4": {
   "k": "solve",
   "c": "2",
   "e": "2*P[تيرا]"
  },
  "ex-3am-quwa-adad-ashara-l5-009:q1": {
   "k": "val",
   "e": "10^4"
  },
  "ex-3am-quwa-adad-ashara-l5-009:q2": {
   "k": "val",
   "e": "10^7"
  },
  "ex-3am-quwa-adad-ashara-l5-009:q3": {
   "k": "zeros",
   "e": "10^14"
  },
  "ex-3am-quwa-adad-ashara-l5-009:q4": {
   "k": "exp",
   "e": "100000"
  },
  "ex-3am-quwa-adad-ashara-l5-009:q5": {
   "k": "val",
   "e": "10^-4"
  },
  "ex-3am-quwa-adad-ashara-l5-009:q6": {
   "k": "val",
   "e": "10^-9"
  },
  "ex-3am-quwa-adad-ashara-l5-009:q7": {
   "k": "rank",
   "e": "10^-12"
  },
  "ex-3am-quwa-adad-ashara-l5-010:q1": {
   "k": "val",
   "e": "10^0"
  },
  "ex-3am-quwa-adad-ashara-l5-010:q2": {
   "k": "val",
   "e": "10^-1"
  },
  "ex-3am-quwa-adad-ashara-l5-010:q3": {
   "k": "val",
   "e": "10^-3"
  },
  "ex-3am-quwa-adad-ashara-l5-010:q4": {
   "k": "val",
   "e": "1/10^-2"
  },
  "ex-3am-quwa-adad-ashara-l5-010:q5": {
   "k": "val",
   "e": "10^1"
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
  neg() { return new Q(-this.n, this.d); }
  pow(k) { let r = new Q(1n); const b = k < 0 ? new Q(1n).div(this) : this; for (let i = 0; i < Math.abs(k); i++) r = r.mul(b); return r; }
  cmp(o) { const l = this.n * o.d, r = o.n * this.d; return l < r ? -1 : l > r ? 1 : 0; }
  eq(o) { return this.cmp(o) === 0; }
}
const lit = (s) => { const [i, f = ''] = s.split('.'); return new Q(BigInt(i + f), 10n ** BigInt(f.length)); };
const TEN = new Q(10n);

/** Écriture décimale exacte (null si le développement n'est pas fini). */
function decimal(q) {
  for (let k = 0; k <= 60; k++) {
    const num = q.n * 10n ** BigInt(k);
    if (num % q.d === 0n) {
      let digits = (num / q.d).toString(); const neg = digits.startsWith('-'); if (neg) digits = digits.slice(1);
      digits = digits.padStart(k + 1, '0');
      return (neg ? '-' : '') + digits.slice(0, digits.length - k) + (k ? '.' + digits.slice(digits.length - k) : '');
    }
  }
  return null;
}

/* ── noms de nombres et bûchettes (table PROPRE à l'oracle) ──────────────── */
const NAMES = {
  'عشرة': TEN, 'مئة': TEN.pow(2), 'ألف': TEN.pow(3), 'عشرة آلاف': TEN.pow(4), 'مئة ألف': TEN.pow(5), 'مليون': TEN.pow(6),
  'عشرة ملايين': TEN.pow(7), 'مئة مليون': TEN.pow(8), 'مليار': TEN.pow(9), 'ألف مليار': TEN.pow(12), 'ستّون': new Q(60n),
  'جزء من عشرة': TEN.pow(-1), 'جزء من مئة': TEN.pow(-2), 'جزء من ألف': TEN.pow(-3), 'جزء من مليون': TEN.pow(-6), 'جزء من مليار': TEN.pow(-9),
};
const PREFIXES = {
  'تيرا': TEN.pow(12), 'جيغا': TEN.pow(9), 'ميغا': TEN.pow(6), 'كيلو': TEN.pow(3), 'هكتو': TEN.pow(2), 'ديكا': TEN,
  'ديسي': TEN.pow(-1), 'سنتي': TEN.pow(-2), 'ميلي': TEN.pow(-3), 'ميكرو': TEN.pow(-6), 'نانو': TEN.pow(-9),
};

/* ── évaluateur d'expressions ASCII ──────────────────────────────────────── */
function E(src) {
  const s = src.replace(/\[[^\]]*\]|\s+/g, (m) => (m[0] === '[' ? m : '')); let i = 0;
  const peek = () => s[i] ?? '';
  const num = () => { const m = /^\d+(\.\d+)?/.exec(s.slice(i)); if (!m) throw new Error(`nombre attendu en ${i} de ${src}`); i += m[0].length; return m[0]; };
  const bracket = () => { const j = s.indexOf(']', i); const t = s.slice(i + 2, j); i = j + 1; return t; };
  const atom = () => {
    const c = peek();
    if (c === '(') { i++; const v = sum(); if (s[i] !== ')') throw new Error(`« ) » attendu dans ${src}`); i++; return v; }
    if (c === 'N' && s[i + 1] === '[') { const t = bracket(); if (!(t in NAMES)) throw new Error(`nom inconnu ${t}`); return NAMES[t]; }
    if (c === 'P' && s[i + 1] === '[') { const t = bracket(); if (!(t in PREFIXES)) throw new Error(`préfixe inconnu ${t}`); return PREFIXES[t]; }
    if (c === 'Z' && s[i + 1] === '[') { const t = bracket(); return new Q(BigInt('1' + '0'.repeat(Number(t)))); }
    if (c === 'R' && s[i + 1] === '[') { const t = Number(bracket()); return lit('0.' + '0'.repeat(t - 1) + '1'); }
    return lit(num());
  };
  const power = () => {
    const a = atom();
    if (peek() === '^') { i++; let neg = false; if (peek() === '-') { neg = true; i++; } const k = Number(num()); return a.pow(neg ? -k : k); }
    return a;
  };
  const unary = () => { if (peek() === '-') { i++; return unary().neg(); } return power(); };
  const prod = () => { let v = unary(); while (peek() === '*' || peek() === '/') { const op = s[i++]; const r = unary(); v = op === '*' ? v.mul(r) : v.div(r); } return v; };
  const sum = () => { let v = prod(); while (peek() === '+' || peek() === '-') { const op = s[i++]; const r = prod(); v = op === '+' ? v.add(r) : v.sub(r); } return v; };
  const out = sum();
  if (i !== s.length) throw new Error(`reste « ${s.slice(i)} » dans ${src}`);
  return out;
}

/** L'affirmation « a<b<c », « a=b&c<d » (conjonction) est-elle vraie ? */
function holds(claim) {
  return claim.split('&').every((part) => {
    const toks = part.split(/(<|>|=)/);
    for (let k = 1; k < toks.length; k += 2) {
      const c = E(toks[k - 1]).cmp(E(toks[k + 1]));
      const op = toks[k];
      if (op === '<' && c >= 0) return false;
      if (op === '>' && c <= 0) return false;
      if (op === '=' && c !== 0) return false;
    }
    return true;
  });
}
const truthOf = (claim) => {
  if (typeof claim === 'boolean') return claim;
  if (claim.startsWith('YES:')) return holds(claim.slice(4));
  if (claim.startsWith('NO:')) return !holds(claim.slice(3));
  return holds(claim);
};

/** n tel que q = 10^n, n ∈ [-40, 40] (unique), sinon null. */
const expOf = (q) => { const hits = []; for (let n = -40; n <= 40; n++) if (q.eq(TEN.pow(n))) hits.push(n); return hits.length === 1 ? hits[0] : null; };
const LET = 'ABCDEF';

function decide(spec) {
  switch (spec.k) {
    case 'exp': { const n = expOf(E(spec.e)); return n === null ? null : R(n); }
    case 'solve': {
      const c = E(spec.c); const v = E(spec.v ?? spec.e);
      const hits = []; for (let n = -40; n <= 40; n++) if (c.mul(TEN.pow(n)).eq(v)) hits.push(n);
      return hits.length === 1 ? R(hits[0]) : null;
    }
    case 'recipExp': { const n = expOf(new Q(1n).div(E(spec.e))); return n === null ? null : R(n); }
    case 'val': { const s = decimal(E(spec.e)); return s === null ? null : R(s); }
    case 'zeros': { const s = decimal(E(spec.e)); return s && /^10*$/.test(s) ? R(s.length - 1) : null; }
    case 'digits': { const s = decimal(E(spec.e)); return s && /^10*$/.test(s) ? R(s.length) : null; }
    case 'rank': { const s = decimal(E(spec.e)); const m = s && /^0\.(0*)1$/.exec(s); return m ? R(m[1].length + 1) : null; }
    case 'zerosAfterComma': { const s = decimal(E(spec.e)); const m = s && /^0\.(0*)1$/.exec(s); return m ? R(m[1].length) : null; }
    case 'zerosBefore': { const s = decimal(E(spec.e)); const m = s && /^(0*)\.?(0*)1/.exec(s.replace('.', '')); return m ? R(s.replace('.', '').indexOf('1')) : null; }
    case 'minexp': case 'maxexp': {
      const sorted = [...spec.exps].sort((a, b) => TEN.pow(a).cmp(TEN.pow(b)));
      return R(spec.k === 'minexp' ? sorted[0] : sorted.at(-1));
    }
    case 'terms': { const s = decimal(E(spec.v)); return s ? R(s.replace(/[^1-9]/g, '').length) : null; }
    case 'pick': case 'pickName': case 'pickText': case 'pickYN': {
      const truths = spec.claims.map(truthOf).map((t, k) => (t ? k : -1)).filter((k) => k >= 0);
      return truths.length === 1 ? C(LET[truths[0]]) : null;
    }
    default: return null;
  }
}

export const ORACLE = {};
for (const [key, spec] of Object.entries(DATA.oracle)) { const r = decide(spec); if (r) ORACLE[key] = r; }

/* ── lecture du texte visible ─────────────────────────────────────────── */
const plain = (t) => String(t ?? '').replace(/\\left|\\right|\\,|\\ |\\!|\\;/g, '').replace(/\{,\}/g, '.');
const numbers = (t) => new Set([...plain(t).matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0]));
const claimNumbers = (c) => numbers(String(c).replace(/[NP]\[[^\]]*\]/g, ' ').replace(/[ZR]\[(\d+)\]/g, ' $1 '));
const specNumbers = (spec) => {
  const out = new Set();
  const take = (e) => { for (const x of claimNumbers(e)) out.add(x); };
  for (const f of ['e', 'v', 'c']) if (typeof spec[f] === 'string') take(spec[f]);
  for (const x of spec.exps ?? []) out.add(String(Math.abs(x)));
  return out;
};

const MISC = new Set(['MISC-ASHARA-DARB', 'MISC-ASHARA-RAQAM', 'MISC-ASHARA-SALIB', 'MISC-ASHARA-FASILA', 'MISC-ASHARA-SIFR', 'MISC-ASHARA-MAFKUK', 'MISC-ASHARA-WIHDA']);

export function audit(bank) {
  const bad = [];
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content/practice/3am/quwa-adad-ashara');
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
    const stem = [ex.statement.content, ...(ex.statement.formulas ?? []), ...((ex.statement.table?.rows ?? []).flat()), ...(ex.statement.table?.head ?? []), q.lead ?? '', q.statement].join(' ');
    const stemNums = numbers(stem);
    try {
      if (q.answerType === 'rational') {
        if (!['exp', 'recipExp', 'solve', 'val', 'zeros', 'digits', 'rank', 'zerosAfterComma', 'zerosBefore', 'minexp', 'maxexp', 'terms'].includes(spec.k)) bad.push(`${key}: spec « ${spec.k} » pour une réponse rationnelle`);
        if (!lit(String(q.expectedAnswer).replace(/^-/, '')).eq(lit(ORACLE[key].value.replace(/^-/, ''))) || String(q.expectedAnswer).startsWith('-') !== ORACLE[key].value.startsWith('-')) bad.push(`${key}: clé ${q.expectedAnswer} ≠ ${ORACLE[key].value}`);
        if (/,/.test(String(q.expectedAnswer))) bad.push(`${key}: la clé ne s'écrit pas avec une virgule`);
        // les nombres de la description retapée figurent dans le texte visible (aucune dérive de saisie)
        for (const x of specNumbers(spec)) if (!stemNums.has(x)) bad.push(`${key}: le nombre ${x} de l'oracle n'apparaît pas dans l'énoncé`);
        for (const sg of q.misconceptionSignatures ?? []) {
          if (!MISC.has(sg.id)) bad.push(`${key}: signature ${sg.id} inconnue`);
          const sv = lit(String(sg.value).replace(/^-/, '')); const neg = String(sg.value).startsWith('-');
          if (sv.eq(lit(ORACLE[key].value.replace(/^-/, ''))) && neg === ORACLE[key].value.startsWith('-')) bad.push(`${key}: la signature ${sg.value} vaut la clé`);
        }
      } else if (q.answerType === 'choice') {
        if (!['pick', 'pickName', 'pickText', 'pickYN'].includes(spec.k)) { bad.push(`${key}: spec « ${spec.k} » pour un QCM`); continue; }
        if (spec.claims.length !== q.choices.length) bad.push(`${key}: ${spec.claims.length} affirmations pour ${q.choices.length} options`);
        const truths = spec.claims.map(truthOf);
        if (truths.filter(Boolean).length !== 1) bad.push(`${key}: ${truths.filter(Boolean).length} options vraies`);
        q.choices.forEach((c, k) => {
          if (truths[k] !== !!c.isCorrect) bad.push(`${key}: l'option ${c.id} est marquée ${c.isCorrect ? 'juste' : 'fausse'} mais l'affirmation est ${truths[k] ? 'vraie' : 'fausse'}`);
          if (!c.isCorrect && !MISC.has(c.misconceptionId)) bad.push(`${key}: distracteur ${c.id} sans MISC-ASHARA-*`);
          const claim = spec.claims[k];
          if (spec.k === 'pick') {
            const cn = claimNumbers(claim); const on = numbers(c.content);
            for (const x of on) if (!cn.has(x)) bad.push(`${key}: l'option ${c.id} cite ${x}, absent de l'affirmation`);
            for (const x of cn) if (!on.has(x) && !stemNums.has(x)) bad.push(`${key}: l'affirmation de ${c.id} cite ${x}, ni dans l'option ni dans l'énoncé`);
          }
          if (spec.k === 'pickName' || spec.k === 'pick') {
            for (const m of String(claim).matchAll(/[NP]\[([^\]]*)\]/g)) {
              if (!(stem + ' ' + c.content).includes(m[1])) bad.push(`${key}: le nom « ${m[1]} » de l'affirmation ${c.id} n'apparaît pas dans le texte`);
            }
          }
        });
      } else bad.push(`${key}: type ${q.answerType} non géré`);
    } catch (e) { bad.push(`${key}: ${e.message}`); }
  }
  return bad;
}
