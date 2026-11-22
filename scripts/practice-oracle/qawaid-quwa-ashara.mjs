// Oracle du banc « qawaid-quwa-ashara » (قواعد الحساب على قوى العدد 10, 3AM unité 3, 2026-10-26) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل الأول / الثاني »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, avec une arithmétique de RATIONNELS exacts en BigInt écrite dans
// ce fichier (indépendante de packages/core/arithmetic/tenPowers.js et de tout autre oracle) :
//  - DATA.oracle[clé] décrit la question dans une écriture ASCII retapée (« 10^-4 », « (10^3)^2 », « 6*10^3*4*10^5 »,
//    « (8*10^5)/(2*10^-3) », décimaux « 0.35 », noms « N[ألف مليار] ») avec un parseur PROPRE (produits, quotients, sommes, puissances à
//    exposant relatif entier, parenthèses) ;
//  - exp : l'UNIQUE n tel que la valeur = 10^n exactement (n ∈ [-60, 60]), sinon l'oracle échoue ; expb : idem pour une base b ≠ 10
//    (étapes `counted: false` des sujets du corpus, ex. R = 3^n) ;
//  - solve : l'UNIQUE n tel que c × 10^n = valeur (le coefficient c est fixé par l'énoncé : « 21 × 10^n », résultat NON normalisé) ;
//    coef : le coefficient c tel que c × 10^p = valeur (p fixé par l'énoncé) ; val : l'écriture décimale EXACTE de la valeur ;
//  - un QCM est jugé option par option : chaque option a une affirmation ASCII (« 10^3*10^4=10^7 », « (2+3)*10^5=6*10^5 »,
//    « YES: » / « NO: » pour oui/non) ; il faut EXACTEMENT une option vraie, et c'est celle que le contenu marque ;
//  - audit(bank) relit le texte : les nombres de l'énoncé et des options figurent dans la description retapée (aucune dérive de
//    saisie), les clés sont exactes, chaque signature vaut une valeur ≠ clé portant un MISC-QAWAID-*, chaque distracteur de QCM
//    porte un MISC-QAWAID-* et est FAUX.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C } from './helpers.mjs';

const DATA = {
 "oracle": {
  "ex-3am-qawaid-quwa-ashara-l1-001:q1": {
   "k": "exp",
   "e": "10^5*10^6"
  },
  "ex-3am-qawaid-quwa-ashara-l1-001:q2": {
   "k": "exp",
   "e": "(10^4)^2"
  },
  "ex-3am-qawaid-quwa-ashara-l1-001:q3": {
   "k": "exp",
   "e": "10^6/10^-3"
  },
  "ex-3am-qawaid-quwa-ashara-l1-001:q4": {
   "k": "exp",
   "e": "0.0001"
  },
  "ex-3am-qawaid-quwa-ashara-l1-001:q5": {
   "k": "exp",
   "e": "100000000"
  },
  "ex-3am-qawaid-quwa-ashara-l1-002:q1": {
   "k": "exp",
   "e": "10^3*10^5"
  },
  "ex-3am-qawaid-quwa-ashara-l1-002:q2": {
   "k": "exp",
   "e": "10^7*10^2"
  },
  "ex-3am-qawaid-quwa-ashara-l1-002:q3": {
   "k": "exp",
   "e": "10^4*10^4"
  },
  "ex-3am-qawaid-quwa-ashara-l1-002:q4": {
   "k": "exp",
   "e": "10^6*10^1"
  },
  "ex-3am-qawaid-quwa-ashara-l1-003:q1": {
   "k": "pick",
   "claims": [
    "10^3*10^4=10^7",
    "10^3*10^4=10^12",
    "10^3*10^4=100^7"
   ]
  },
  "ex-3am-qawaid-quwa-ashara-l1-003:q2": {
   "k": "pick",
   "claims": [
    "10^5*10^5=10^25",
    "10^5*10^5=10^10",
    "10^5*10^5=100^10"
   ]
  },
  "ex-3am-qawaid-quwa-ashara-l1-004:q1": {
   "k": "exp",
   "e": "10^11/10^4"
  },
  "ex-3am-qawaid-quwa-ashara-l1-004:q2": {
   "k": "exp",
   "e": "10^13/10^8"
  },
  "ex-3am-qawaid-quwa-ashara-l1-004:q3": {
   "k": "exp",
   "e": "10^9/10^4"
  },
  "ex-3am-qawaid-quwa-ashara-l1-004:q4": {
   "k": "exp",
   "e": "10^3*10^5"
  },
  "ex-3am-qawaid-quwa-ashara-l1-005:q1": {
   "k": "exp",
   "e": "10^5*10^-2"
  },
  "ex-3am-qawaid-quwa-ashara-l1-005:q2": {
   "k": "exp",
   "e": "10^-3*10^-4"
  },
  "ex-3am-qawaid-quwa-ashara-l1-005:q3": {
   "k": "exp",
   "e": "10^-6*10^8"
  },
  "ex-3am-qawaid-quwa-ashara-l1-005:q4": {
   "k": "exp",
   "e": "10^-1*10^-1"
  },
  "ex-3am-qawaid-quwa-ashara-l1-006:q1": {
   "k": "pick",
   "claims": [
    "10^8/10^3=10^5",
    "10^8/10^3=10^11",
    "10^8/10^3=10^24"
   ]
  },
  "ex-3am-qawaid-quwa-ashara-l1-006:q2": {
   "k": "pick",
   "claims": [
    "10^3/10^-4=10^-1",
    "10^3/10^-4=10^7",
    "10^3/10^-4=10^-12"
   ]
  },
  "ex-3am-qawaid-quwa-ashara-l1-007:q1": {
   "k": "exp",
   "e": "10^9/10^4"
  },
  "ex-3am-qawaid-quwa-ashara-l1-007:q2": {
   "k": "exp",
   "e": "10^3/10^8"
  },
  "ex-3am-qawaid-quwa-ashara-l1-007:q3": {
   "k": "exp",
   "e": "10^-2/10^5"
  },
  "ex-3am-qawaid-quwa-ashara-l1-007:q4": {
   "k": "exp",
   "e": "10^7/10^-3"
  },
  "ex-3am-qawaid-quwa-ashara-l1-008:q1": {
   "k": "pick",
   "claims": [
    "10^2*10^5=10^10",
    "10^2*10^5=10^7",
    "10^2*10^5=100^7"
   ]
  },
  "ex-3am-qawaid-quwa-ashara-l1-008:q2": {
   "k": "pickYN",
   "claims": [
    "YES:10^9/10^3=10^3",
    "NO:10^9/10^3=10^3"
   ]
  },
  "ex-3am-qawaid-quwa-ashara-l1-008:q3": {
   "k": "exp",
   "e": "10^3*10^3"
  },
  "ex-3am-qawaid-quwa-ashara-l1-009:q1": {
   "k": "exp",
   "e": "N[ألف مليار]"
  },
  "ex-3am-qawaid-quwa-ashara-l1-009:q2": {
   "k": "exp",
   "e": "10^12*10^3"
  },
  "ex-3am-qawaid-quwa-ashara-l1-009:q3": {
   "k": "exp",
   "e": "10^15/10^9"
  },
  "ex-3am-qawaid-quwa-ashara-l1-010:q1": {
   "k": "exp",
   "e": "10^5*10^6"
  },
  "ex-3am-qawaid-quwa-ashara-l1-010:q2": {
   "k": "exp",
   "e": "10^9/10^4"
  },
  "ex-3am-qawaid-quwa-ashara-l1-010:q3": {
   "k": "exp",
   "e": "(10^3)^4"
  },
  "ex-3am-qawaid-quwa-ashara-l2-001:q1": {
   "k": "exp",
   "e": "10^-5*10^2"
  },
  "ex-3am-qawaid-quwa-ashara-l2-001:q2": {
   "k": "exp",
   "e": "10^4*10^-9"
  },
  "ex-3am-qawaid-quwa-ashara-l2-001:q3": {
   "k": "exp",
   "e": "10^-7*10^-3"
  },
  "ex-3am-qawaid-quwa-ashara-l2-001:q4": {
   "k": "exp",
   "e": "10^-2*10^2"
  },
  "ex-3am-qawaid-quwa-ashara-l2-002:q1": {
   "k": "pick",
   "claims": [
    "10^6*10^2=10^12",
    "10^8/10^3=10^5",
    "10^4/10^-3=10^1"
   ]
  },
  "ex-3am-qawaid-quwa-ashara-l2-002:q2": {
   "k": "exp",
   "e": "10^-6*10^4"
  },
  "ex-3am-qawaid-quwa-ashara-l2-002:q3": {
   "k": "exp",
   "e": "10^4/10^-3"
  },
  "ex-3am-qawaid-quwa-ashara-l2-002:q4": {
   "k": "exp",
   "e": "(10^2)^5"
  },
  "ex-3am-qawaid-quwa-ashara-l2-003:q1": {
   "k": "exp",
   "e": "10^-3/10^-5"
  },
  "ex-3am-qawaid-quwa-ashara-l2-003:q2": {
   "k": "exp",
   "e": "10^-4/10^3"
  },
  "ex-3am-qawaid-quwa-ashara-l2-003:q3": {
   "k": "exp",
   "e": "10^6/10^-6"
  },
  "ex-3am-qawaid-quwa-ashara-l2-003:q4": {
   "k": "exp",
   "e": "10^-1/10^-1"
  },
  "ex-3am-qawaid-quwa-ashara-l2-004:q1": {
   "k": "pickYN",
   "claims": [
    "YES:10^-3*10^-2=10^-5",
    "NO:10^-3*10^-2=10^-5"
   ]
  },
  "ex-3am-qawaid-quwa-ashara-l2-004:q2": {
   "k": "pickYN",
   "claims": [
    "YES:(10^-3)^2=10^-5",
    "NO:(10^-3)^2=10^-5"
   ]
  },
  "ex-3am-qawaid-quwa-ashara-l2-004:q3": {
   "k": "exp",
   "e": "(10^-3)^2"
  },
  "ex-3am-qawaid-quwa-ashara-l2-005:q1": {
   "k": "pickYN",
   "claims": [
    "YES:10^10/2=10^5",
    "NO:10^10/2=10^5"
   ]
  },
  "ex-3am-qawaid-quwa-ashara-l2-005:q2": {
   "k": "pickYN",
   "claims": [
    "YES:10^3+10^2=10^5",
    "NO:10^3+10^2=10^5"
   ]
  },
  "ex-3am-qawaid-quwa-ashara-l2-005:q3": {
   "k": "pickYN",
   "claims": [
    "YES:100*10^-4=10^-2",
    "NO:100*10^-4=10^-2"
   ]
  },
  "ex-3am-qawaid-quwa-ashara-l2-005:q4": {
   "k": "pickYN",
   "claims": [
    "YES:10^2+10^-2=100.01",
    "NO:10^2+10^-2=100.01"
   ]
  },
  "ex-3am-qawaid-quwa-ashara-l2-006:q1": {
   "k": "exp",
   "e": "(10^-2)^4"
  },
  "ex-3am-qawaid-quwa-ashara-l2-006:q2": {
   "k": "exp",
   "e": "(10^3)^-2"
  },
  "ex-3am-qawaid-quwa-ashara-l2-006:q3": {
   "k": "exp",
   "e": "(10^-5)^-2"
  },
  "ex-3am-qawaid-quwa-ashara-l2-006:q4": {
   "k": "exp",
   "e": "(10^-1)^3"
  },
  "ex-3am-qawaid-quwa-ashara-l2-007:q1": {
   "k": "exp",
   "e": "10^-3*10^-4"
  },
  "ex-3am-qawaid-quwa-ashara-l2-007:q2": {
   "k": "exp",
   "e": "10^2/10^8"
  },
  "ex-3am-qawaid-quwa-ashara-l2-007:q3": {
   "k": "pick",
   "claims": [
    "10^-3*10^-4<10^2/10^8",
    "10^-3*10^-4=10^2/10^8",
    "10^-3*10^-4>10^2/10^8"
   ]
  },
  "ex-3am-qawaid-quwa-ashara-l2-008:q1": {
   "k": "pick",
   "claims": [
    "10^3*10^-3=10^-9",
    "10^3*10^-3=1",
    "10^3*10^-3=10^6"
   ]
  },
  "ex-3am-qawaid-quwa-ashara-l2-008:q2": {
   "k": "pick",
   "claims": [
    "10^17/10^20=10^3",
    "10^17/10^20=10^-3",
    "10^17/10^20=10^37"
   ]
  },
  "ex-3am-qawaid-quwa-ashara-l2-009:q1": {
   "k": "exp",
   "e": "(10^-3)^2"
  },
  "ex-3am-qawaid-quwa-ashara-l2-009:q2": {
   "k": "pickYN",
   "claims": [
    "YES:(10^-3)^2=10^6",
    "NO:(10^-3)^2=10^6"
   ]
  },
  "ex-3am-qawaid-quwa-ashara-l2-009:q3": {
   "k": "exp",
   "e": "10^-3/10^-6"
  },
  "ex-3am-qawaid-quwa-ashara-l2-010:q1": {
   "k": "exp",
   "e": "10^-2*10^5"
  },
  "ex-3am-qawaid-quwa-ashara-l2-010:q2": {
   "k": "exp",
   "e": "(10^-2*10^5)/10^-4"
  },
  "ex-3am-qawaid-quwa-ashara-l2-010:q3": {
   "k": "pickYN",
   "claims": [
    "YES:(10^-2*10^5)/10^-4=10^-1",
    "NO:(10^-2*10^5)/10^-4=10^-1"
   ]
  },
  "ex-3am-qawaid-quwa-ashara-l3-001:q1": {
   "k": "expb",
   "b": 3,
   "e": "(9*3^4)/(27*3^-2)"
  },
  "ex-3am-qawaid-quwa-ashara-l3-001:q2": {
   "k": "exp",
   "e": "(10^6*10^-3)/((10^4)^-2*10^5)"
  },
  "ex-3am-qawaid-quwa-ashara-l3-002:q1": {
   "k": "exp",
   "e": "10^-3*10^7*10^-2"
  },
  "ex-3am-qawaid-quwa-ashara-l3-002:q2": {
   "k": "exp",
   "e": "10^4*10^-9*10^6"
  },
  "ex-3am-qawaid-quwa-ashara-l3-002:q3": {
   "k": "exp",
   "e": "10^-2*10^-6*10^12"
  },
  "ex-3am-qawaid-quwa-ashara-l3-003:q1": {
   "k": "exp",
   "e": "10^6*10^-9"
  },
  "ex-3am-qawaid-quwa-ashara-l3-003:q2": {
   "k": "exp",
   "e": "10^2/10^-7"
  },
  "ex-3am-qawaid-quwa-ashara-l3-003:q3": {
   "k": "exp",
   "e": "(10^-3)^5"
  },
  "ex-3am-qawaid-quwa-ashara-l3-003:q4": {
   "k": "exp",
   "e": "(10^4)^-3"
  },
  "ex-3am-qawaid-quwa-ashara-l3-004:q1": {
   "k": "exp",
   "e": "(10^5*10^3)/(10^6)"
  },
  "ex-3am-qawaid-quwa-ashara-l3-004:q2": {
   "k": "exp",
   "e": "(10^9)/(10^4*10^2)"
  },
  "ex-3am-qawaid-quwa-ashara-l3-004:q3": {
   "k": "exp",
   "e": "(10^-3*10^-2)/(10^4)"
  },
  "ex-3am-qawaid-quwa-ashara-l3-004:q4": {
   "k": "exp",
   "e": "(10^7*10^-5)/(10^-3)"
  },
  "ex-3am-qawaid-quwa-ashara-l3-005:q1": {
   "k": "exp",
   "e": "10^2*10^-7*1000^3"
  },
  "ex-3am-qawaid-quwa-ashara-l3-005:q2": {
   "k": "expb",
   "b": 2,
   "e": "(2^-3)^-2"
  },
  "ex-3am-qawaid-quwa-ashara-l3-005:q3": {
   "k": "expb",
   "b": 5,
   "e": "5/5^-3"
  },
  "ex-3am-qawaid-quwa-ashara-l3-006:q1": {
   "k": "exp",
   "e": "10^4*(10^2)^3"
  },
  "ex-3am-qawaid-quwa-ashara-l3-006:q2": {
   "k": "exp",
   "e": "(10^-2)^3*10^8"
  },
  "ex-3am-qawaid-quwa-ashara-l3-006:q3": {
   "k": "exp",
   "e": "(10^3)^2/10^-5"
  },
  "ex-3am-qawaid-quwa-ashara-l3-006:q4": {
   "k": "exp",
   "e": "(10^-1)^4*(10^2)^-3"
  },
  "ex-3am-qawaid-quwa-ashara-l3-007:q1": {
   "k": "exp",
   "e": "10^3*10^-6*(10^-2)^5"
  },
  "ex-3am-qawaid-quwa-ashara-l3-007:q2": {
   "k": "exp",
   "e": "(10^-3)^3*10^4*10^2"
  },
  "ex-3am-qawaid-quwa-ashara-l3-007:q3": {
   "k": "exp",
   "e": "(10^3*10^-6*(10^-2)^5)/((10^-3)^3*10^4*10^2)"
  },
  "ex-3am-qawaid-quwa-ashara-l3-008:q1": {
   "k": "pick",
   "claims": [
    "(10^2)^3*10^-2/10^5=10^-1",
    "(10^2)^3*10^-2/10^5=10^-2",
    "(10^2)^3*10^-2/10^5=10^3"
   ]
  },
  "ex-3am-qawaid-quwa-ashara-l3-008:q2": {
   "k": "exp",
   "e": "(10^4*10^-7)^2"
  },
  "ex-3am-qawaid-quwa-ashara-l3-009:q1": {
   "k": "pick",
   "claims": [
    "10^-6/100=10^-4",
    "10^-5+10^-5=10^-4",
    "10^3/10^7=10^-4"
   ]
  },
  "ex-3am-qawaid-quwa-ashara-l3-009:q2": {
   "k": "exp",
   "e": "0.01*10^-2"
  },
  "ex-3am-qawaid-quwa-ashara-l3-009:q3": {
   "k": "exp",
   "e": "0.001/10"
  },
  "ex-3am-qawaid-quwa-ashara-l3-010:q1": {
   "k": "exp",
   "e": "1000*10^-5*0.1"
  },
  "ex-3am-qawaid-quwa-ashara-l3-010:q2": {
   "k": "exp",
   "e": "(0.01*10^6)/10^-2"
  },
  "ex-3am-qawaid-quwa-ashara-l3-010:q3": {
   "k": "exp",
   "e": "10000/(0.001*10^2)"
  },
  "ex-3am-qawaid-quwa-ashara-l4-001:q1": {
   "k": "solve",
   "c": "0.3",
   "v": "(4.5*10^-3*0.2*10^4)/(3*10^2)"
  },
  "ex-3am-qawaid-quwa-ashara-l4-001:q2": {
   "k": "solve",
   "c": "24",
   "v": "1.5*10^6*16*10^-4"
  },
  "ex-3am-qawaid-quwa-ashara-l4-001:q3": {
   "k": "val",
   "e": "(4.5*10^-3*0.2*10^4)/(3*10^2)"
  },
  "ex-3am-qawaid-quwa-ashara-l4-002:q1": {
   "k": "solve",
   "c": "24",
   "v": "6*10^3*4*10^5"
  },
  "ex-3am-qawaid-quwa-ashara-l4-002:q2": {
   "k": "solve",
   "c": "15",
   "v": "5*10^-2*3*10^7"
  },
  "ex-3am-qawaid-quwa-ashara-l4-002:q3": {
   "k": "solve",
   "c": "4",
   "v": "0.5*10^4*8*10^-6"
  },
  "ex-3am-qawaid-quwa-ashara-l4-002:q4": {
   "k": "solve",
   "c": "60",
   "v": "12*10^-3*5*10^-4"
  },
  "ex-3am-qawaid-quwa-ashara-l4-003:q1": {
   "k": "solve",
   "c": "48",
   "v": "8*10^2*6*10^5"
  },
  "ex-3am-qawaid-quwa-ashara-l4-003:q2": {
   "k": "solve",
   "c": "10",
   "v": "0.25*10^-3*40*10^6"
  },
  "ex-3am-qawaid-quwa-ashara-l4-003:q3": {
   "k": "solve",
   "c": "18",
   "v": "9*10^-4*2*10^-3"
  },
  "ex-3am-qawaid-quwa-ashara-l4-003:q4": {
   "k": "solve",
   "c": "2",
   "v": "(6*10^8)/(3*10^-2)"
  },
  "ex-3am-qawaid-quwa-ashara-l4-004:q1": {
   "k": "solve",
   "c": "4",
   "v": "(8*10^5)/(2*10^-3)"
  },
  "ex-3am-qawaid-quwa-ashara-l4-004:q2": {
   "k": "solve",
   "c": "3",
   "v": "(9*10^-4)/(3*10^2)"
  },
  "ex-3am-qawaid-quwa-ashara-l4-004:q3": {
   "k": "solve",
   "c": "3",
   "v": "(15*10^6)/(5*10^9)"
  },
  "ex-3am-qawaid-quwa-ashara-l4-004:q4": {
   "k": "solve",
   "c": "3",
   "v": "(1.2*10^3)/(0.4*10^-2)"
  },
  "ex-3am-qawaid-quwa-ashara-l4-005:q1": {
   "k": "val",
   "e": "3*10^-2"
  },
  "ex-3am-qawaid-quwa-ashara-l4-005:q2": {
   "k": "val",
   "e": "25*10^-3"
  },
  "ex-3am-qawaid-quwa-ashara-l4-005:q3": {
   "k": "val",
   "e": "0.4*10^5"
  },
  "ex-3am-qawaid-quwa-ashara-l4-005:q4": {
   "k": "val",
   "e": "52*10^-1"
  },
  "ex-3am-qawaid-quwa-ashara-l4-006:q1": {
   "k": "exp",
   "e": "100^3"
  },
  "ex-3am-qawaid-quwa-ashara-l4-006:q2": {
   "k": "exp",
   "e": "10000^2"
  },
  "ex-3am-qawaid-quwa-ashara-l4-006:q3": {
   "k": "exp",
   "e": "0.001^2"
  },
  "ex-3am-qawaid-quwa-ashara-l4-006:q4": {
   "k": "exp",
   "e": "(100^3*10000^2)/0.001^2"
  },
  "ex-3am-qawaid-quwa-ashara-l4-007:q1": {
   "k": "coef",
   "p": 8,
   "v": "4*10^5*6*10^3"
  },
  "ex-3am-qawaid-quwa-ashara-l4-007:q2": {
   "k": "coef",
   "p": -6,
   "v": "(9*10^-4)/(3*10^2)"
  },
  "ex-3am-qawaid-quwa-ashara-l4-007:q3": {
   "k": "coef",
   "p": -2,
   "v": "0.5*10^4*8*10^-6"
  },
  "ex-3am-qawaid-quwa-ashara-l4-008:q1": {
   "k": "exp",
   "e": "(10^-5*10^8)/10^3"
  },
  "ex-3am-qawaid-quwa-ashara-l4-008:q2": {
   "k": "val",
   "e": "7*(10^-5*10^8)/10^3"
  },
  "ex-3am-qawaid-quwa-ashara-l4-008:q3": {
   "k": "val",
   "e": "0.5*(10^-5*10^8)/10^3"
  },
  "ex-3am-qawaid-quwa-ashara-l4-009:q1": {
   "k": "solve",
   "c": "20",
   "v": "(12*10^-2*5*10^7)/(3*10^4)"
  },
  "ex-3am-qawaid-quwa-ashara-l4-009:q2": {
   "k": "val",
   "e": "(12*10^-2*5*10^7)/(3*10^4)"
  },
  "ex-3am-qawaid-quwa-ashara-l4-009:q3": {
   "k": "solve",
   "c": "5",
   "v": "(2*10^3*15*10^-5)/(6*10^-4)"
  },
  "ex-3am-qawaid-quwa-ashara-l4-010:q1": {
   "k": "pick",
   "claims": [
    "2*10^3*3*10^3=6*10^5",
    "2*10^3*3*10^2=6*10^5",
    "(2+3)*10^5=6*10^5"
   ]
  },
  "ex-3am-qawaid-quwa-ashara-l4-010:q2": {
   "k": "solve",
   "c": "6",
   "v": "3*10^4*2*10^1"
  },
  "ex-3am-qawaid-quwa-ashara-l5-001:q1": {
   "k": "exp",
   "e": "10^3*10^3"
  },
  "ex-3am-qawaid-quwa-ashara-l5-001:q2": {
   "k": "exp",
   "e": "(10^3)^3"
  },
  "ex-3am-qawaid-quwa-ashara-l5-001:q3": {
   "k": "val",
   "e": "(128*10^9)/(4*10^6)"
  },
  "ex-3am-qawaid-quwa-ashara-l5-001:q4": {
   "k": "exp",
   "e": "10^12/10^9"
  },
  "ex-3am-qawaid-quwa-ashara-l5-002:q1": {
   "k": "exp",
   "e": "10^3*10^3"
  },
  "ex-3am-qawaid-quwa-ashara-l5-002:q2": {
   "k": "exp",
   "e": "10^3*10^2"
  },
  "ex-3am-qawaid-quwa-ashara-l5-002:q3": {
   "k": "exp",
   "e": "(10^3)^2"
  },
  "ex-3am-qawaid-quwa-ashara-l5-002:q4": {
   "k": "exp",
   "e": "(10^2)^3"
  },
  "ex-3am-qawaid-quwa-ashara-l5-003:q1": {
   "k": "val",
   "e": "2*10^6/10^-3*(10^-2)^4"
  },
  "ex-3am-qawaid-quwa-ashara-l5-003:q2": {
   "k": "val",
   "e": "0.35*10^6/10^-3*(10^-2)^4"
  },
  "ex-3am-qawaid-quwa-ashara-l5-003:q3": {
   "k": "exp",
   "e": "10^6/10^-3*(10^-2)^4"
  },
  "ex-3am-qawaid-quwa-ashara-l5-003:q4": {
   "k": "pickYN",
   "claims": [
    "YES:10^6/10^-3*(10^-2)^4=10",
    "NO:10^6/10^-3*(10^-2)^4=10"
   ]
  },
  "ex-3am-qawaid-quwa-ashara-l5-004:q1": {
   "k": "exp",
   "e": "10^-3*10^2*10^1"
  },
  "ex-3am-qawaid-quwa-ashara-l5-004:q2": {
   "k": "exp",
   "e": "1/(10^4*10^0)"
  },
  "ex-3am-qawaid-quwa-ashara-l5-004:q3": {
   "k": "exp",
   "e": "10^-3*10^0*10^3"
  },
  "ex-3am-qawaid-quwa-ashara-l5-004:q4": {
   "k": "pickYN",
   "claims": [
    "YES:10^-3*10^4*10^-1=10^-3*10^2*10^1",
    "NO:10^-3*10^4*10^-1=10^-3*10^2*10^1"
   ]
  },
  "ex-3am-qawaid-quwa-ashara-l5-005:q1": {
   "k": "val",
   "e": "3*10^7*10^-3/10^2"
  },
  "ex-3am-qawaid-quwa-ashara-l5-005:q2": {
   "k": "val",
   "e": "0.06*10^7*10^-3/10^2"
  },
  "ex-3am-qawaid-quwa-ashara-l5-005:q3": {
   "k": "exp",
   "e": "10^7*10^-3/10^2"
  },
  "ex-3am-qawaid-quwa-ashara-l5-005:q4": {
   "k": "pickYN",
   "claims": [
    "YES:10^7*10^-3/10^2=1/100",
    "NO:10^7*10^-3/10^2=1/100"
   ]
  },
  "ex-3am-qawaid-quwa-ashara-l5-006:q1": {
   "k": "exp",
   "e": "(10^2)^3"
  },
  "ex-3am-qawaid-quwa-ashara-l5-006:q2": {
   "k": "solve",
   "c": "2",
   "v": "10^6/(5*10^-2)"
  },
  "ex-3am-qawaid-quwa-ashara-l5-006:q3": {
   "k": "exp",
   "e": "10^6/10^4"
  },
  "ex-3am-qawaid-quwa-ashara-l5-007:q1": {
   "k": "solve",
   "c": "5",
   "v": "(5*10^9)/10^6"
  },
  "ex-3am-qawaid-quwa-ashara-l5-007:q2": {
   "k": "val",
   "e": "(5*10^3)/40"
  },
  "ex-3am-qawaid-quwa-ashara-l5-007:q3": {
   "k": "val",
   "e": "10^12/(5*10^9)"
  },
  "ex-3am-qawaid-quwa-ashara-l5-008:q1": {
   "k": "exp",
   "e": "10^-4*10^4"
  },
  "ex-3am-qawaid-quwa-ashara-l5-008:q2": {
   "k": "exp",
   "e": "10^-4*10^6"
  },
  "ex-3am-qawaid-quwa-ashara-l5-008:q3": {
   "k": "exp",
   "e": "10^-1/10^-4"
  },
  "ex-3am-qawaid-quwa-ashara-l5-009:q1": {
   "k": "solve",
   "c": "5",
   "v": "5*10^2*10^-3"
  },
  "ex-3am-qawaid-quwa-ashara-l5-009:q2": {
   "k": "solve",
   "c": "5",
   "v": "5*10^-1*10^-3"
  },
  "ex-3am-qawaid-quwa-ashara-l5-009:q3": {
   "k": "val",
   "e": "2*10^1*5*10^-1"
  },
  "ex-3am-qawaid-quwa-ashara-l5-010:q1": {
   "k": "solve",
   "c": "6",
   "v": "3*10^9*2*10^-3"
  },
  "ex-3am-qawaid-quwa-ashara-l5-010:q2": {
   "k": "solve",
   "c": "2",
   "v": "(6*10^12)/(3*10^9)"
  },
  "ex-3am-qawaid-quwa-ashara-l5-010:q3": {
   "k": "val",
   "e": "2*10^3"
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

/** Noms de nombres (table PROPRE à l'oracle). */
const NAMES = { 'ألف مليار': TEN.pow(12), 'مليار': TEN.pow(9), 'مليون': TEN.pow(6), 'ألف': TEN.pow(3) };

/* ── évaluateur d'expressions ASCII ──────────────────────────────────────── */
function E(src) {
  const s = src.replace(/\[[^\]]*\]|\s+/g, (m) => (m[0] === '[' ? m : '')); let i = 0;
  const peek = () => s[i] ?? '';
  const num = () => { const m = /^\d+(\.\d+)?/.exec(s.slice(i)); if (!m) throw new Error(`nombre attendu en ${i} de ${src}`); i += m[0].length; return m[0]; };
  const atom = () => {
    const c = peek();
    if (c === '(') { i++; const v = sum(); if (s[i] !== ')') throw new Error(`« ) » attendu dans ${src}`); i++; return v; }
    if (c === 'N' && s[i + 1] === '[') { const j = s.indexOf(']', i); const t = s.slice(i + 2, j); i = j + 1; if (!(t in NAMES)) throw new Error(`nom inconnu ${t}`); return NAMES[t]; }
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

/** L'affirmation « a=b », « a<b » est-elle vraie ? */
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
  if (claim.startsWith('YES:')) return holds(claim.slice(4));
  if (claim.startsWith('NO:')) return !holds(claim.slice(3));
  return holds(claim);
};

/** n tel que q = b^n, n ∈ [-60, 60] (unique pour |b| ≥ 2), sinon null. */
const expOf = (q, b = TEN) => { const hits = []; for (let n = -60; n <= 60; n++) if (q.eq(b.pow(n))) hits.push(n); return hits.length === 1 ? hits[0] : null; };
const LET = 'ABCDEF';

function decide(spec) {
  switch (spec.k) {
    case 'exp': { const n = expOf(E(spec.e)); return n === null ? null : R(n); }
    case 'expb': { const n = expOf(E(spec.e), new Q(BigInt(spec.b))); return n === null ? null : R(n); }
    case 'solve': {
      const c = E(spec.c); const v = E(spec.v);
      const hits = []; for (let n = -60; n <= 60; n++) if (c.mul(TEN.pow(n)).eq(v)) hits.push(n);
      return hits.length === 1 ? R(hits[0]) : null;
    }
    case 'coef': { const s = decimal(E(spec.v).div(TEN.pow(spec.p))); return s === null ? null : R(s); }
    case 'val': { const s = decimal(E(spec.e)); return s === null ? null : R(s); }
    case 'pick': case 'pickYN': {
      const truths = spec.claims.map(truthOf).map((t, k) => (t ? k : -1)).filter((k) => k >= 0);
      return truths.length === 1 ? C(LET[truths[0]]) : null;
    }
    default: return null;
  }
}

export const ORACLE = {};
for (const [key, spec] of Object.entries(DATA.oracle)) { const r = decide(spec); if (r) ORACLE[key] = r; }

/* ── lecture du texte visible ─────────────────────────────────────────── */
const plain = (t) => String(t ?? '').replace(/\\left|\\right|\\,|\\ |\\!|\\?;/g, '').replace(/\{,\}/g, '.');
const numbers = (t) => new Set([...plain(t).matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0]));
const claimNumbers = (c) => numbers(String(c).replace(/N\[[^\]]*\]/g, ' '));
const specNumbers = (spec) => {
  const out = new Set();
  for (const f of ['e', 'v', 'c']) if (typeof spec[f] === 'string') for (const x of claimNumbers(spec[f])) out.add(x);
  return out;
};

const MISC = new Set(['MISC-QAWAID-DARB-ASS', 'MISC-QAWAID-ASAS', 'MISC-QAWAID-ISHARA', 'MISC-QAWAID-QUWA-JAM', 'MISC-QAWAID-QUWA-ASS', 'MISC-QAWAID-MAJMU', 'MISC-QAWAID-NISF', 'MISC-QAWAID-AMIL', 'MISC-QAWAID-ITTIJAH']);

export function audit(bank) {
  const bad = [];
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content/practice/3am/qawaid-quwa-ashara');
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
        if (!['exp', 'expb', 'solve', 'coef', 'val'].includes(spec.k)) bad.push(`${key}: spec « ${spec.k} » pour une réponse rationnelle`);
        const neg = String(q.expectedAnswer).startsWith('-');
        if (!lit(String(q.expectedAnswer).replace(/^-/, '')).eq(lit(ORACLE[key].value.replace(/^-/, ''))) || neg !== ORACLE[key].value.startsWith('-')) bad.push(`${key}: clé ${q.expectedAnswer} ≠ ${ORACLE[key].value}`);
        if (/,/.test(String(q.expectedAnswer))) bad.push(`${key}: la clé ne s'écrit pas avec une virgule`);
        for (const x of specNumbers(spec)) if (!stemNums.has(x)) bad.push(`${key}: le nombre ${x} de l'oracle n'apparaît pas dans l'énoncé`);
        for (const sg of q.misconceptionSignatures ?? []) {
          if (!MISC.has(sg.id)) bad.push(`${key}: signature ${sg.id} inconnue`);
          const sneg = String(sg.value).startsWith('-');
          if (lit(String(sg.value).replace(/^-/, '')).eq(lit(ORACLE[key].value.replace(/^-/, ''))) && sneg === ORACLE[key].value.startsWith('-')) bad.push(`${key}: la signature ${sg.value} vaut la clé`);
        }
      } else if (q.answerType === 'choice') {
        if (!['pick', 'pickYN'].includes(spec.k)) { bad.push(`${key}: spec « ${spec.k} » pour un QCM`); continue; }
        if (spec.claims.length !== q.choices.length) bad.push(`${key}: ${spec.claims.length} affirmations pour ${q.choices.length} options`);
        const truths = spec.claims.map(truthOf);
        if (truths.filter(Boolean).length !== 1) bad.push(`${key}: ${truths.filter(Boolean).length} options vraies`);
        q.choices.forEach((c, k) => {
          if (truths[k] !== !!c.isCorrect) bad.push(`${key}: l'option ${c.id} est marquée ${c.isCorrect ? 'juste' : 'fausse'} mais l'affirmation est ${truths[k] ? 'vraie' : 'fausse'}`);
          if (!c.isCorrect && !MISC.has(c.misconceptionId)) bad.push(`${key}: distracteur ${c.id} sans MISC-QAWAID-*`);
          if (spec.k === 'pick') {
            const cn = claimNumbers(spec.claims[k]); const on = numbers(c.content);
            for (const x of on) if (!cn.has(x)) bad.push(`${key}: l'option ${c.id} cite ${x}, absent de l'affirmation`);
            for (const x of cn) if (!on.has(x) && !stemNums.has(x)) bad.push(`${key}: l'affirmation de ${c.id} cite ${x}, ni dans l'option ni dans l'énoncé`);
          }
        });
        // la fiche « oui / non » : l'affirmation retapée porte les nombres de l'énoncé
        if (spec.k === 'pickYN') for (const x of claimNumbers(spec.claims[0].replace(/^(YES|NO):/, ''))) if (!stemNums.has(x)) bad.push(`${key}: le nombre ${x} de l'affirmation n'apparaît pas dans l'énoncé`);
      } else bad.push(`${key}: type ${q.answerType} non géré`);
    } catch (e) { bad.push(`${key}: ${e.message}`); }
  }
  return bad;
}
