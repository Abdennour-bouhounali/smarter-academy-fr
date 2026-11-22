// Oracle du banc « wadiya-idmajiya-ibarat-harfiya-3 » (« أدمج تعلّماتي — الحساب الحرفي », synthèse de l'unité 4 de 3AM, 2026-10-26) —
// feuilles d'examen de فصل (« على منوال اختبار الفصل الثاني / الثالث »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, ni dans packages/core :
//  - un évaluateur EXACT propre à ce fichier : rationnels BigInt et polynômes à plusieurs lettres (π en est une), un analyseur
//    d'expressions (+ − × / ^, parenthèses, produit implicite « 3x », « 2(x+1) », « (x+2)(x-3) », décimaux, la lettre π) ; la puissance
//    lie avant le moins unaire (-3^2 = -9), d'où la valeur DES MAUVAISES lectures ;
//  - DATA.oracle : pour chaque question la FORMULE (retapée en ASCII) et les valeurs des lettres : « val » (valeur), « coef »
//    (coefficient d'un développement / d'une réduction), « picoef » (coefficient de π d'une valeur exacte), « round » (valeur approchée
//    au plus près, π à 40 chiffres), « rel » (QCM : laquelle des relations > < = lie les deux VALEURS : une seule est vraie), « dec »
//    (décision oui / non : une relation entre deux nombres), « eq » (QCM « égales ? » : égalité EXACTE des polynômes développés,
//    et, si elles diffèrent, un TÉMOIN qui les sépare), « prove » (selfCheck : l'égalité à démontrer est vraie en polynômes) ;
//  - DATA.sigs : chaque signature d'erreur est la valeur de la MAUVAISE lecture (une formule) : elle doit valoir ce qu'annonce le
//    contenu, différer de la clé, et son étiquette doit être l'une des MISC-SYN-HARF-* ;
//  - DATA.shown : chaque formule affichée dans une feuille est retapée en ASCII et doit être RETROUVÉE (même polynôme) dans les îlots
//    LaTeX de l'énoncé, des formules ou des questions ; DATA.facts : chaque nombre cité dans un corrigé est recalculé ;
//  - audit(bank) relit les valeurs données aux lettres dans les énoncés, chaque QCM (une seule bonne option, tout distracteur étiqueté),
//    les clés réduites, les signatures.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C } from './helpers.mjs';

const DATA = {"oracle":{"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-001:q1":{"k":"coef","e":"7x - 2(x - 3)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-001:q2":{"k":"coef","e":"7x - 2(x - 3)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-001:q3":{"k":"val","e":"7x - 2(x - 3)","env":{"x":4}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-002:q1":{"k":"coef","e":"5x + 3(x - 2)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-002:q2":{"k":"coef","e":"5x + 3(x - 2)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-002:q3":{"k":"val","e":"5x + 3(x - 2)","env":{"x":-2}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-003:q1":{"k":"coef","e":"9x - 4(x + 5)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-003:q2":{"k":"coef","e":"9x - 4(x + 5)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-003:q3":{"k":"val","e":"9x - 4(x + 5)","env":{"x":-3}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-004:q1":{"k":"coef","e":"2x + 6(x + 1)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-004:q2":{"k":"coef","e":"2x + 6(x + 1)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-004:q3":{"k":"val","e":"2x + 6(x + 1)","env":{"x":5}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-005:q1":{"k":"val","e":"x^2 - 4x + 3","env":{"x":3}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-005:q2":{"k":"val","e":"x^2 - 4x + 3","env":{"x":0}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-005:q3":{"k":"val","e":"x^2 - 4x + 3","env":{"x":-2}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-006:q1":{"k":"val","e":"2x^2 + 3x - 5","env":{"x":2}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-006:q2":{"k":"val","e":"2x^2 + 3x - 5","env":{"x":-1}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-006:q3":{"k":"val","e":"2x^2 + 3x - 5","env":{"x":-3}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-007:q1":{"k":"val","e":"600+25x","env":{"x":12}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-007:q2":{"k":"val","e":"625+24x","env":{"x":12}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-007:q3":{"k":"rel","a":"600+25x","b":"625+24x","env":{"x":12},"opts":{"A":">","B":"<","C":"=="}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-008:q1":{"k":"val","e":"1200+30x","env":{"x":15}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-008:q2":{"k":"val","e":"1000+40x","env":{"x":15}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-008:q3":{"k":"rel","a":"1200+30x","b":"1000+40x","env":{"x":15},"opts":{"A":"<","B":"==","C":">"}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-009:q1":{"k":"coef","e":"2*((x+4)+(x+2))","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-009:q2":{"k":"coef","e":"2*((x+4)+(x+2))","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-009:q3":{"k":"coef","e":"(x+4)*(x+2)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-009:q4":{"k":"coef","e":"(x+4)*(x+2)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-009:q5":{"k":"val","e":"2*((x+4)+(x+2))","env":{"x":6}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-009:q6":{"k":"dec","a":"300*(2*((x+4)+(x+2)))","b":"11000","env":{"x":6},"op":"<=","yes":"A","no":"B"},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-010:q1":{"k":"coef","e":"2*((x+5)+(x+3))","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-010:q2":{"k":"coef","e":"2*((x+5)+(x+3))","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-010:q3":{"k":"coef","e":"(x+5)*(x+3)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-010:q4":{"k":"coef","e":"(x+5)*(x+3)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-010:q5":{"k":"val","e":"2*((x+5)+(x+3))","env":{"x":7}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-010:q6":{"k":"dec","a":"250*(2*((x+5)+(x+3)))","b":"10500","env":{"x":7},"op":"<=","yes":"B","no":"A"},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-001:q1":{"k":"coef","e":"(2x + 1)(x + 3)","v":"x","deg":2},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-001:q2":{"k":"coef","e":"(2x + 1)(x + 3)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-001:q3":{"k":"coef","e":"(2x + 1)(x + 3)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-001:q4":{"k":"val","e":"(2x + 1)(x + 3)","env":{"x":2}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-002:q1":{"k":"coef","e":"(x - 2)(3x + 5)","v":"x","deg":2},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-002:q2":{"k":"coef","e":"(x - 2)(3x + 5)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-002:q3":{"k":"coef","e":"(x - 2)(3x + 5)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-002:q4":{"k":"val","e":"(x - 2)(3x + 5)","env":{"x":-1}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-003:q1":{"k":"coef","e":"(4x - 3)(2x + 7)","v":"x","deg":2},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-003:q2":{"k":"coef","e":"(4x - 3)(2x + 7)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-003:q3":{"k":"coef","e":"(4x - 3)(2x + 7)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-003:q4":{"k":"val","e":"(4x - 3)(2x + 7)","env":{"x":1}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-004:q1":{"k":"val","e":"(x+3)*(x-1)","env":{"x":2}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-004:q2":{"k":"val","e":"x^2+2x-3","env":{"x":2}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-004:q3":{"k":"coef","e":"(x+3)*(x-1)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-004:q4":{"k":"eq","a":"(x+3)*(x-1)","b":"x^2+2x-3","yes":"A","no":"B","agree":[{"x":2}]},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-005:q1":{"k":"val","e":"(x+5)*(x-2)","env":{"x":-1}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-005:q2":{"k":"val","e":"x^2+3x-10","env":{"x":-1}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-005:q3":{"k":"coef","e":"(x+5)*(x-2)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-005:q4":{"k":"eq","a":"(x+5)*(x-2)","b":"x^2+3x-10","yes":"B","no":"A","agree":[{"x":-1}]},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-006:q1":{"k":"val","e":"x^2-4","env":{"x":2}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-006:q2":{"k":"val","e":"x*(x-2)","env":{"x":2}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-006:q3":{"k":"val","e":"x^2-4","env":{"x":3}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-006:q4":{"k":"val","e":"x*(x-2)","env":{"x":3}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-006:q5":{"k":"eq","a":"x^2-4","b":"x*(x-2)","yes":"A","no":"B","witness":{"x":3},"agree":[{"x":2}]},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-007:q1":{"k":"val","e":"x^2-9","env":{"x":3}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-007:q2":{"k":"val","e":"x*(x-3)","env":{"x":3}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-007:q3":{"k":"val","e":"x^2-9","env":{"x":5}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-007:q4":{"k":"val","e":"x*(x-3)","env":{"x":5}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-007:q5":{"k":"eq","a":"x^2-9","b":"x*(x-3)","yes":"B","no":"A","witness":{"x":5},"agree":[{"x":3}]},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-008:q1":{"k":"coef","e":"(1200+30x)-(1000+40x)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-008:q2":{"k":"coef","e":"(1200+30x)-(1000+40x)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-008:q3":{"k":"rel","a":"1200+30x","b":"1000+40x","env":{"x":15},"opts":{"A":">","B":"<","C":"=="}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-009:q1":{"k":"coef","e":"(450+12x)-(300+15x)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-009:q2":{"k":"coef","e":"(450+12x)-(300+15x)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-009:q3":{"k":"rel","a":"450+12x","b":"300+15x","env":{"x":40},"opts":{"A":"==","B":">","C":"<"}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-010:q1":{"k":"coef","e":"(x+8)*(x+5-1.5)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-010:q2":{"k":"coef","e":"(x+8)*(x+5-1.5)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-010:q3":{"k":"val","e":"(x+8)*(x+5-1.5)","env":{"x":4}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-010:q4":{"k":"val","e":"120*(x+8)*(x+5-1.5)","env":{"x":4}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-010:q5":{"k":"dec","a":"120*(x+8)*(x+5-1.5)","b":"11000","env":{"x":4},"op":"<=","yes":"A","no":"B"},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-001:q1":{"k":"coef","e":"(3x + 2)(x - 4)","v":"x","deg":2},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-001:q2":{"k":"coef","e":"(3x + 2)(x - 4)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-001:q3":{"k":"coef","e":"(3x + 2)(x - 4)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-001:q4":{"k":"coef","e":"(3x + 2)(x - 4) - (2x^2 - 9x + 5)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-001:q5":{"k":"coef","e":"(3x + 2)(x - 4) - (2x^2 - 9x + 5)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-001:q6":{"k":"val","e":"(3x + 2)(x - 4) - (2x^2 - 9x + 5)","env":{"x":2}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-002:q1":{"k":"coef","e":"(2x + 1)(x - 3)","v":"x","deg":2},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-002:q2":{"k":"coef","e":"(2x + 1)(x - 3)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-002:q3":{"k":"coef","e":"(2x + 1)(x - 3)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-002:q4":{"k":"coef","e":"(2x + 1)(x - 3) - (3x^2 - 5x + 2)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-002:q5":{"k":"coef","e":"(2x + 1)(x - 3) - (3x^2 - 5x + 2)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-002:q6":{"k":"val","e":"(2x + 1)(x - 3) - (3x^2 - 5x + 2)","env":{"x":-2}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-003:q1":{"k":"coef","e":"(x + 5)(x - 2)","v":"x","deg":2},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-003:q2":{"k":"coef","e":"(x + 5)(x - 2)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-003:q3":{"k":"coef","e":"(x + 5)(x - 2)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-003:q4":{"k":"coef","e":"(x + 5)(x - 2) - (x^2 + 2x - 4)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-003:q5":{"k":"coef","e":"(x + 5)(x - 2) - (x^2 + 2x - 4)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-003:q6":{"k":"val","e":"(x + 5)(x - 2) - (x^2 + 2x - 4)","env":{"x":-4}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-004:q1":{"k":"coef","e":"(4x - 1)(2x + 3)","v":"x","deg":2},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-004:q2":{"k":"coef","e":"(4x - 1)(2x + 3)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-004:q3":{"k":"coef","e":"(4x - 1)(2x + 3)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-004:q4":{"k":"coef","e":"(4x - 1)(2x + 3) - (5x^2 - 2x + 1)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-004:q5":{"k":"coef","e":"(4x - 1)(2x + 3) - (5x^2 - 2x + 1)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-004:q6":{"k":"val","e":"(4x - 1)(2x + 3) - (5x^2 - 2x + 1)","env":{"x":-1}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-005:q1":{"k":"coef","e":"(2x + 3)(3x - 1)","v":"x","deg":2},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-005:q2":{"k":"coef","e":"(2x + 3)(3x - 1)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-005:q3":{"k":"coef","e":"(2x + 3)(3x - 1)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-005:q4":{"k":"coef","e":"(2x + 3)(3x - 1) - (4x^2 + 1x - 8)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-005:q5":{"k":"coef","e":"(2x + 3)(3x - 1) - (4x^2 + 1x - 8)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-005:q6":{"k":"val","e":"(2x + 3)(3x - 1) - (4x^2 + 1x - 8)","env":{"x":-2}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-006:q1":{"k":"coef","e":"(800+22x)-(950+20x)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-006:q2":{"k":"coef","e":"(800+22x)-(950+20x)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-006:q3":{"k":"rel","a":"800+22x","b":"950+20x","env":{"x":60},"opts":{"A":"<","B":"==","C":">"}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-007:q1":{"k":"coef","e":"(100+15x)-(700+11x)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-007:q2":{"k":"coef","e":"(100+15x)-(700+11x)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-007:q3":{"k":"rel","a":"100+15x","b":"700+11x","env":{"x":120},"opts":{"A":"==","B":">","C":"<"}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-008:q1":{"k":"coef","e":"2*((x+9)+(x+4))","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-008:q2":{"k":"coef","e":"2*((x+9)+(x+4))","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-008:q3":{"k":"coef","e":"(x+9)*(x+4)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-008:q4":{"k":"coef","e":"(x+9)*(x+4)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-008:q5":{"k":"val","e":"2*((x+9)+(x+4))","env":{"x":11}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-008:q6":{"k":"dec","a":"400*(2*((x+9)+(x+4)))","b":"27500","env":{"x":11},"op":"<=","yes":"A","no":"B"},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-009:q1":{"k":"coef","e":"(x+10)*(x+6-2)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-009:q2":{"k":"coef","e":"(x+10)*(x+6-2)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-009:q3":{"k":"val","e":"(x+10)*(x+6-2)","env":{"x":5}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-009:q4":{"k":"val","e":"150*(x+10)*(x+6-2)","env":{"x":5}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-009:q5":{"k":"dec","a":"150*(x+10)*(x+6-2)","b":"20000","env":{"x":5},"op":"<=","yes":"B","no":"A"},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-010:q1":{"k":"val","e":"x^2-16","env":{"x":4}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-010:q2":{"k":"val","e":"x*(x-4)","env":{"x":4}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-010:q3":{"k":"val","e":"x^2-16","env":{"x":6}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-010:q4":{"k":"val","e":"x*(x-4)","env":{"x":6}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-010:q5":{"k":"eq","a":"x^2-16","b":"x*(x-4)","yes":"B","no":"A","witness":{"x":6},"agree":[{"x":4}]},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-001:q1":{"k":"coef","e":"(x+5)+3","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-001:q2":{"k":"coef","e":"2*((x+5)+3+(x+2))","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-001:q3":{"k":"coef","e":"2*((x+5)+3+(x+2))","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-001:q4":{"k":"coef","e":"((x+5)+3)*(x+2)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-001:q5":{"k":"coef","e":"((x+5)+3)*(x+2)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-001:q6":{"k":"val","e":"2*((x+5)+3+(x+2))","env":{"x":1}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-001:q7":{"k":"val","e":"1000*(4*x+20)/8","env":{"x":1}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-002:q1":{"k":"coef","e":"3*x*(x+2)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-002:q2":{"k":"coef","e":"(2*x+4)*(x+2)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-002:q3":{"k":"coef","e":"(2*x+4)*(x+2)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-002:q4":{"k":"val","e":"2*((2*x+4)+(x+2))","env":{"x":50}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-002:q5":{"k":"rel","a":"3*x*(x+2)","b":"(2*x+4)*(x+2)","env":{"x":10},"opts":{"A":">","B":"<","C":"=="}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-002:q6":{"k":"rel","a":"3*x*(x+2)","b":"(2*x+4)*(x+2)","env":{"x":3},"opts":{"A":"<","B":"==","C":">"}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-002:q7":{"k":"coef","e":"(3*x*(x+2))-((2*x+4)*(x+2))","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-003:q1":{"k":"val","e":"96/4","env":{}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-003:q2":{"k":"coef","e":"x*18/2","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-003:q3":{"k":"coef","e":"24^2-x*18/2","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-003:q4":{"k":"coef","e":"24^2-x*18/2","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-003:q5":{"k":"dec","a":"9*x","b":"576-9*x","env":{"x":24},"op":"<","yes":"A","no":"B"},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-003:q6":{"k":"dec","a":"9*x","b":"576-9*x","env":{"x":10},"op":"<","yes":"B","no":"A"},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-003:q7":{"k":"rel","a":"24^2-x*18/2","b":"x*18/2","env":{"x":24},"opts":{"A":"==","B":">","C":"<"}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-004:q1":{"k":"coef","e":"2*((4*x+1)+(3*x-2))","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-004:q2":{"k":"coef","e":"2*((4*x+1)+(3*x-2))","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-004:q3":{"k":"coef","e":"(4*x+1)*(3*x-2)","v":"x","deg":2},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-004:q4":{"k":"coef","e":"(4*x+1)*(3*x-2)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-004:q5":{"k":"coef","e":"(4*x+1)*(3*x-2)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-004:q6":{"k":"val","e":"2*((4*x+1)+(3*x-2))","env":{"x":20}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-004:q7":{"k":"val","e":"(4*x+1)*(3*x-2)","env":{"x":20}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-004:q8":{"k":"val","e":"900*(2*((4*x+1)+(3*x-2)))","env":{"x":20}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-004:q9":{"k":"dec","a":"900*(2*((4*x+1)+(3*x-2)))","b":"250000","env":{"x":20},"op":"<=","yes":"B","no":"A"},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-005:q1":{"k":"coef","e":"(x+9)*(x-2)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-005:q2":{"k":"coef","e":"(x+9)*(x-2)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-005:q3":{"k":"val","e":"x+9","env":{"x":19}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-005:q4":{"k":"val","e":"x-2","env":{"x":19}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-005:q5":{"k":"val","e":"(x+9)*(x-2)","env":{"x":19}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-005:q6":{"k":"dec","a":"(x+9)*(x-2)","b":"476","env":{"x":19},"op":"==","yes":"A","no":"B"},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-005:q7":{"k":"dec","a":"(x+9)*(x-2)","b":"476","env":{"x":20},"op":"==","yes":"B","no":"A"},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-006:q1":{"k":"coef","e":"5*x*(x-3)-(x^2-3*x-9)","v":"x","deg":2},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-006:q2":{"k":"coef","e":"5*x*(x-3)-(x^2-3*x-9)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-006:q3":{"k":"coef","e":"5*x*(x-3)-(x^2-3*x-9)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-006:q4":{"k":"coef","e":"(2*x-3)^2","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-006:q5":{"k":"coef","e":"(2*x-3)^2","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-006:q6":{"k":"eq","a":"5*x*(x-3)-(x^2-3*x-9)","b":"(2*x-3)^2","yes":"A","no":"B","agree":[{"x":0},{"x":1}]},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-006:q7":{"k":"prove","a":"5*x*(x-3)-(x^2-3*x-9)","b":"(2*x-3)^2"},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-007:q1":{"k":"coef","e":"-2*a-2+a-1+4*a","v":"a","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-007:q2":{"k":"coef","e":"-2*a-2+a-1+4*a","v":"a","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-007:q3":{"k":"val","e":"2*a-4+a-1+2","env":{"a":2}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-007:q4":{"k":"val","e":"-2*a-2+a-1+4*a","env":{"a":2}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-007:q5":{"k":"coef","e":"(-2*a-2+a-1+4*a)-(-2*a-2)-(2*a-4)","v":"a","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-007:q6":{"k":"coef","e":"(-2*a-2+a-1+4*a)-(-2*a-2)-(2*a-4)","v":"a","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-007:q7":{"k":"val","e":"(-2*a-2+a-1+4*a)-(2)-(4*a)","env":{"a":2}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-007:q8":{"k":"dec","a":"(-2*a-2+a-1+4*a)-(2)-(4*a)","b":"-a-5","env":{"a":2},"op":"==","yes":"A","no":"B"},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-008:q1":{"k":"val","e":"(x+4)*(x-1)","env":{"x":0}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-008:q2":{"k":"val","e":"x^2+3x-4","env":{"x":0}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-008:q3":{"k":"val","e":"x^2-4","env":{"x":0}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-008:q4":{"k":"val","e":"(x+4)*(x-1)","env":{"x":2}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-008:q5":{"k":"val","e":"x^2-4","env":{"x":2}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-008:q6":{"k":"eq","a":"(x+4)*(x-1)","b":"x^2-4","yes":"A","no":"B","witness":{"x":2},"agree":[{"x":0}]},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-008:q7":{"k":"coef","e":"(x+4)*(x-1)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-008:q8":{"k":"eq","a":"(x+4)*(x-1)","b":"x^2+3x-4","yes":"B","no":"A","agree":[{"x":0},{"x":2}]},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-009:q1":{"k":"coef","e":"(600+25x)-(625+24x)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-009:q2":{"k":"coef","e":"(600+25x)-(625+24x)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-009:q3":{"k":"val","e":"(600+25x)-(625+24x)","env":{"x":12}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-009:q4":{"k":"rel","a":"600+25x","b":"625+24x","env":{"x":12},"opts":{"A":">","B":"<","C":"=="}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-009:q5":{"k":"rel","a":"600+25x","b":"625+24x","env":{"x":30},"opts":{"A":"<","B":"==","C":">"}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-009:q6":{"k":"dec","a":"600+25x","b":"625+24x","env":{"x":25},"op":"==","yes":"B","no":"A"},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-010:q1":{"k":"val","e":"2*4/2","env":{}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-010:q2":{"k":"coef","e":"(6-2)*x/2","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-010:q3":{"k":"coef","e":"6*(4-x)/2","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-010:q4":{"k":"coef","e":"6*(4-x)/2","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-010:q5":{"k":"coef","e":"2*4/2+(6-2)*x/2+6*(4-x)/2","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-010:q6":{"k":"coef","e":"2*4/2+(6-2)*x/2+6*(4-x)/2","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-010:q7":{"k":"val","e":"2*4/2+(6-2)*x/2+6*(4-x)/2","env":{"x":1}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-010:q8":{"k":"val","e":"6*4-(2*4/2+(6-2)*x/2+6*(4-x)/2)","env":{"x":1}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-010:q9":{"k":"rel","a":"2*4/2+(6-2)*x/2+6*(4-x)/2","b":"6*4-(2*4/2+(6-2)*x/2+6*(4-x)/2)","env":{"x":1},"opts":{"A":"==","B":">","C":"<"}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-010:q10":{"k":"dec","a":"2*4/2+(6-2)*x/2+6*(4-x)/2","b":"6*4-(2*4/2+(6-2)*x/2+6*(4-x)/2)","env":{"x":3},"op":">=","yes":"B","no":"A"},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-001:q1":{"k":"picoef","e":"(2*y+pi*(x+2.4))-(2*y+pi*x)","env":{},"deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-001:q2":{"k":"picoef","e":"(2*y+pi*(x+4.8))-(2*y+pi*x)","env":{},"deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-001:q3":{"k":"round","e":"2.4*pi","env":{},"d":2},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-001:q4":{"k":"round","e":"4.8*pi","env":{},"d":2},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-001:q5":{"k":"picoef","e":"2*y+pi*x","env":{"x":73,"y":85},"deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-001:q6":{"k":"picoef","e":"2*y+pi*x","env":{"x":73,"y":85},"deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-001:q7":{"k":"round","e":"2*y+pi*x","env":{"x":73,"y":85},"d":2},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-002:q1":{"k":"picoef","e":"(2*y+pi*(x+2))-(2*y+pi*x)","env":{},"deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-002:q2":{"k":"picoef","e":"(2*y+pi*(x+4))-(2*y+pi*x)","env":{},"deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-002:q3":{"k":"round","e":"2*pi","env":{},"d":2},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-002:q4":{"k":"round","e":"4*pi","env":{},"d":2},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-002:q5":{"k":"picoef","e":"2*y+pi*x","env":{"x":76,"y":80},"deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-002:q6":{"k":"picoef","e":"2*y+pi*x","env":{"x":76,"y":80},"deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-002:q7":{"k":"round","e":"2*y+pi*x","env":{"x":76,"y":80},"d":2},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-003:q1":{"k":"val","e":"5*V/18","env":{"V":72}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-003:q2":{"k":"val","e":"V^2/250","env":{"V":72}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-003:q3":{"k":"val","e":"5*V/18+V^2/250","env":{"V":72}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-003:q4":{"k":"dec","a":"5*V/18+V^2/250","b":"45","env":{"V":72},"op":"<=","yes":"A","no":"B"},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-003:q5":{"k":"val","e":"V^2/125","env":{"V":72}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-003:q6":{"k":"val","e":"5*V/18+V^2/125","env":{"V":72}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-003:q7":{"k":"dec","a":"5*V/18+V^2/125","b":"45","env":{"V":72},"op":"<=","yes":"B","no":"A"},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-003:q8":{"k":"val","e":"5*V/18+V^2/250","env":{"V":90}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-004:q1":{"k":"val","e":"5*V/18","env":{"V":36}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-004:q2":{"k":"val","e":"V^2/250","env":{"V":36}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-004:q3":{"k":"val","e":"5*V/18+V^2/250","env":{"V":36}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-004:q4":{"k":"dec","a":"5*V/18+V^2/250","b":"20","env":{"V":36},"op":"<=","yes":"A","no":"B"},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-004:q5":{"k":"val","e":"V^2/125","env":{"V":36}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-004:q6":{"k":"val","e":"5*V/18+V^2/125","env":{"V":36}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-004:q7":{"k":"dec","a":"5*V/18+V^2/125","b":"20","env":{"V":36},"op":"<=","yes":"B","no":"A"},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-004:q8":{"k":"val","e":"5*V/18+V^2/250","env":{"V":108}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-005:q1":{"k":"coef","e":"3*a+2*a-1+a-2","v":"a","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-005:q2":{"k":"coef","e":"3*a+2*a-1+a-2","v":"a","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-005:q3":{"k":"val","e":"2*a+2+2*a-1+2*a-4","env":{"a":3}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-005:q4":{"k":"val","e":"3*a+2*a-1+a-2","env":{"a":3}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-005:q5":{"k":"coef","e":"(3*a+2*a-1+a-2)-(3*a)-(2*a+2)","v":"a","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-005:q6":{"k":"coef","e":"(3*a+2*a-1+a-2)-(3*a)-(2*a+2)","v":"a","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-005:q7":{"k":"val","e":"(3*a+2*a-1+a-2)-(2*a-4)-(a-2)","env":{"a":3}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-005:q8":{"k":"dec","a":"(3*a+2*a-1+a-2)-(2*a-4)-(a-2)","b":"3*a+3","env":{"a":3},"op":"==","yes":"A","no":"B"},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-006:q1":{"k":"val","e":"(x+5)*(x-2)","env":{"x":0}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-006:q2":{"k":"val","e":"x^2+3x-10","env":{"x":0}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-006:q3":{"k":"val","e":"x^2-10","env":{"x":0}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-006:q4":{"k":"val","e":"(x+5)*(x-2)","env":{"x":3}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-006:q5":{"k":"val","e":"x^2-10","env":{"x":3}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-006:q6":{"k":"eq","a":"(x+5)*(x-2)","b":"x^2-10","yes":"B","no":"A","witness":{"x":3},"agree":[{"x":0}]},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-006:q7":{"k":"coef","e":"(x+5)*(x-2)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-006:q8":{"k":"eq","a":"(x+5)*(x-2)","b":"x^2+3x-10","yes":"A","no":"B","agree":[{"x":0},{"x":3}]},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-007:q1":{"k":"coef","e":"(300+18x)-(420+15x)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-007:q2":{"k":"coef","e":"(300+18x)-(420+15x)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-007:q3":{"k":"val","e":"(300+18x)-(420+15x)","env":{"x":30}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-007:q4":{"k":"rel","a":"300+18x","b":"420+15x","env":{"x":30},"opts":{"A":">","B":"<","C":"=="}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-007:q5":{"k":"rel","a":"300+18x","b":"420+15x","env":{"x":52},"opts":{"A":"<","B":"==","C":">"}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-007:q6":{"k":"dec","a":"300+18x","b":"420+15x","env":{"x":40},"op":"==","yes":"B","no":"A"},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-008:q1":{"k":"val","e":"3*5/2","env":{}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-008:q2":{"k":"coef","e":"(8-3)*x/2","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-008:q3":{"k":"coef","e":"8*(5-x)/2","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-008:q4":{"k":"coef","e":"8*(5-x)/2","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-008:q5":{"k":"coef","e":"3*5/2+(8-3)*x/2+8*(5-x)/2","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-008:q6":{"k":"coef","e":"3*5/2+(8-3)*x/2+8*(5-x)/2","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-008:q7":{"k":"val","e":"3*5/2+(8-3)*x/2+8*(5-x)/2","env":{"x":2}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-008:q8":{"k":"val","e":"8*5-(3*5/2+(8-3)*x/2+8*(5-x)/2)","env":{"x":2}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-008:q9":{"k":"rel","a":"3*5/2+(8-3)*x/2+8*(5-x)/2","b":"8*5-(3*5/2+(8-3)*x/2+8*(5-x)/2)","env":{"x":2},"opts":{"A":"==","B":">","C":"<"}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-008:q10":{"k":"dec","a":"3*5/2+(8-3)*x/2+8*(5-x)/2","b":"8*5-(3*5/2+(8-3)*x/2+8*(5-x)/2)","env":{"x":4},"op":">=","yes":"B","no":"A"},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-009:q1":{"k":"coef","e":"(x+6)*(x+3)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-009:q2":{"k":"coef","e":"(x+6)*(x+3)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-009:q3":{"k":"coef","e":"(x+6)*(x+3-1.5)","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-009:q4":{"k":"coef","e":"(x+6)*(x+3-1.5)","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-009:q5":{"k":"coef","e":"((x+6)*(x+3))-((x+6)*(x+3-1.5))","v":"x","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-009:q6":{"k":"coef","e":"((x+6)*(x+3))-((x+6)*(x+3-1.5))","v":"x","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-009:q7":{"k":"val","e":"(x+6)*(x+3)","env":{"x":3.5}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-009:q8":{"k":"val","e":"(x+6)*(x+3-1.5)","env":{"x":3.5}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-009:q9":{"k":"val","e":"((x+6)*(x+3))-((x+6)*(x+3-1.5))","env":{"x":3.5}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-009:q10":{"k":"val","e":"120*((x+6)*(x+3-1.5))","env":{"x":3.5}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-009:q11":{"k":"dec","a":"120*((x+6)*(x+3-1.5))","b":"6000","env":{"x":3.5},"op":"<=","yes":"B","no":"A"},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-010:q1":{"k":"val","e":"(a+4)*(b+4)-a*b","env":{"a":20,"b":28.5}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-010:q2":{"k":"val","e":"(a+4)*(b+4)-a*b","env":{"a":30,"b":18.5}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-010:q3":{"k":"coef","e":"(a+4)*(b+4)-a*b","v":"a","deg":1},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-010:q4":{"k":"coef","e":"(a+4)*(b+4)-a*b","v":"a","deg":0},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-010:q5":{"k":"val","e":"4*(48.5)+16","env":{}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-010:q6":{"k":"val","e":"80*(4*(48.5)+16)","env":{}},"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-010:q7":{"k":"dec","a":"80*(4*(48.5)+16)","b":"17000","env":{},"op":"<=","yes":"B","no":"A"}},"sigs":{"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-001:q2":[{"e":"-6","env":{},"v":"-6","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-002:q2":[{"e":"-2","env":{},"v":"-2","id":"MISC-SYN-HARF-PAREN"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-003:q2":[{"e":"20","env":{},"v":"20","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-004:q2":[{"e":"1","env":{},"v":"1","id":"MISC-SYN-HARF-PAREN"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-005:q3":[{"e":"1*(-2^2)+-4*(-2)+3","env":{},"v":"7","id":"MISC-SYN-HARF-NEGSQ"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-006:q2":[{"e":"2*(-1^2)+3*(-1)+-5","env":{},"v":"-10","id":"MISC-SYN-HARF-NEGSQ"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-006:q3":[{"e":"2*(-3^2)+3*(-3)+-5","env":{},"v":"-32","id":"MISC-SYN-HARF-NEGSQ"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-007:q1":[{"e":"25*12","env":{},"v":"300","id":"MISC-SYN-HARF-PARTIAL"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-007:q2":[{"e":"24*12","env":{},"v":"288","id":"MISC-SYN-HARF-PARTIAL"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-008:q1":[{"e":"30*15","env":{},"v":"450","id":"MISC-SYN-HARF-PARTIAL"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-008:q2":[{"e":"40*15","env":{},"v":"600","id":"MISC-SYN-HARF-PARTIAL"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-009:q2":[{"e":"10","env":{},"v":"10","id":"MISC-SYN-HARF-PAREN"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-009:q3":[{"e":"4","env":{},"v":"4","id":"MISC-SYN-HARF-CROSS"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-010:q2":[{"e":"13","env":{},"v":"13","id":"MISC-SYN-HARF-PAREN"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-010:q3":[{"e":"5","env":{},"v":"5","id":"MISC-SYN-HARF-CROSS"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-001:q2":[{"e":"6","env":{},"v":"6","id":"MISC-SYN-HARF-CROSS"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-002:q2":[{"e":"5","env":{},"v":"5","id":"MISC-SYN-HARF-CROSS"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-002:q3":[{"e":"10","env":{},"v":"10","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-003:q2":[{"e":"28","env":{},"v":"28","id":"MISC-SYN-HARF-CROSS"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-003:q3":[{"e":"21","env":{},"v":"21","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-004:q3":[{"e":"3","env":{},"v":"3","id":"MISC-SYN-HARF-CROSS"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-005:q3":[{"e":"5","env":{},"v":"5","id":"MISC-SYN-HARF-CROSS"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-008:q2":[{"e":"2200","env":{},"v":"2200","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-009:q2":[{"e":"750","env":{},"v":"750","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-010:q1":[{"e":"13","env":{},"v":"13","id":"MISC-SYN-HARF-PARTIAL"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-001:q2":[{"e":"-12","env":{},"v":"-12","id":"MISC-SYN-HARF-CROSS"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-001:q3":[{"e":"8","env":{},"v":"8","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-001:q4":[{"e":"-19","env":{},"v":"-19","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-001:q5":[{"e":"-3","env":{},"v":"-3","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-002:q2":[{"e":"-6","env":{},"v":"-6","id":"MISC-SYN-HARF-CROSS"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-002:q3":[{"e":"3","env":{},"v":"3","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-002:q4":[{"e":"-10","env":{},"v":"-10","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-002:q5":[{"e":"-1","env":{},"v":"-1","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-003:q2":[{"e":"-2","env":{},"v":"-2","id":"MISC-SYN-HARF-CROSS"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-003:q3":[{"e":"10","env":{},"v":"10","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-003:q4":[{"e":"5","env":{},"v":"5","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-003:q5":[{"e":"-14","env":{},"v":"-14","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-004:q2":[{"e":"12","env":{},"v":"12","id":"MISC-SYN-HARF-CROSS"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-004:q3":[{"e":"3","env":{},"v":"3","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-004:q4":[{"e":"8","env":{},"v":"8","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-004:q5":[{"e":"-2","env":{},"v":"-2","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-005:q2":[{"e":"-2","env":{},"v":"-2","id":"MISC-SYN-HARF-CROSS"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-005:q3":[{"e":"3","env":{},"v":"3","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-005:q4":[{"e":"8","env":{},"v":"8","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-005:q5":[{"e":"-11","env":{},"v":"-11","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-006:q2":[{"e":"1750","env":{},"v":"1750","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-007:q2":[{"e":"800","env":{},"v":"800","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-008:q2":[{"e":"22","env":{},"v":"22","id":"MISC-SYN-HARF-PAREN"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-008:q3":[{"e":"9","env":{},"v":"9","id":"MISC-SYN-HARF-CROSS"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-009:q1":[{"e":"16","env":{},"v":"16","id":"MISC-SYN-HARF-PARTIAL"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-001:q3":[{"e":"2*8+2","env":{},"v":"18","id":"MISC-SYN-HARF-PAREN"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-001:q4":[{"e":"8","env":{},"v":"8","id":"MISC-SYN-HARF-CROSS"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-001:q7":[{"e":"(4*x+20)/8","env":{"x":1},"v":"3","id":"MISC-SYN-HARF-UNITS"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-002:q2":[{"e":"4","env":{},"v":"4","id":"MISC-SYN-HARF-CROSS"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-002:q7":[{"e":"14","env":{},"v":"14","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-003:q3":[{"e":"9","env":{},"v":"9","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-004:q2":[{"e":"2*1+(-2)","env":{},"v":"0","id":"MISC-SYN-HARF-PAREN"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-004:q4":[{"e":"-8","env":{},"v":"-8","id":"MISC-SYN-HARF-CROSS"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-005:q1":[{"e":"9","env":{},"v":"9","id":"MISC-SYN-HARF-CROSS"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-005:q2":[{"e":"18","env":{},"v":"18","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-006:q2":[{"e":"-15-3","env":{},"v":"-18","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-006:q3":[{"e":"-9","env":{},"v":"-9","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-006:q4":[{"e":"0","env":{},"v":"0","id":"MISC-SYN-HARF-SQSUM"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-008:q7":[{"e":"4","env":{},"v":"4","id":"MISC-SYN-HARF-CROSS"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-009:q2":[{"e":"1225","env":{},"v":"1225","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-001:q1":[{"e":"1.2","env":{},"v":"1.2","id":"MISC-SYN-HARF-CIRC"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-002:q1":[{"e":"1","env":{},"v":"1","id":"MISC-SYN-HARF-CIRC"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-003:q3":[{"e":"V^2/250","env":{"V":72},"v":"20.736","id":"MISC-SYN-HARF-PARTIAL"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-003:q6":[{"e":"V^2/125","env":{"V":72},"v":"41.472","id":"MISC-SYN-HARF-PARTIAL"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-004:q3":[{"e":"V^2/250","env":{"V":36},"v":"5.184","id":"MISC-SYN-HARF-PARTIAL"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-004:q6":[{"e":"V^2/125","env":{"V":36},"v":"10.368","id":"MISC-SYN-HARF-PARTIAL"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-006:q7":[{"e":"5","env":{},"v":"5","id":"MISC-SYN-HARF-CROSS"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-007:q2":[{"e":"720","env":{},"v":"720","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-009:q1":[{"e":"6","env":{},"v":"6","id":"MISC-SYN-HARF-CROSS"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-009:q3":[{"e":"9","env":{},"v":"9","id":"MISC-SYN-HARF-PARTIAL"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-009:q6":[{"e":"27","env":{},"v":"27","id":"MISC-SYN-HARF-BRACKET"}],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-010:q5":[{"e":"4*(48.5)","env":{},"v":"194","id":"MISC-SYN-HARF-PARTIAL"}]},"shown":{"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-001":["7x - 2(x - 3)"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-002":["5x + 3(x - 2)"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-003":["9x - 4(x + 5)"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-004":["2x + 6(x + 1)"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-005":["x^2 - 4x + 3"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-006":["2x^2 + 3x - 5"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-007":["600+25x","625+24x"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-008":["1200+30x","1000+40x"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-009":["2*((x+4)+(x+2))","(x+4)*(x+2)"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l1-010":["2*((x+5)+(x+3))","(x+5)*(x+3)"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-001":["(2x + 1)(x + 3)"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-002":["(x - 2)(3x + 5)"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-003":["(4x - 3)(2x + 7)"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-004":["(x+3)*(x-1)","x^2+2x-3"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-005":["(x+5)*(x-2)","x^2+3x-10"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-006":["x^2-4","x*(x-2)"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-007":["x^2-9","x*(x-3)"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-008":["1200+30x","1000+40x"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-009":["450+12x","300+15x"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l2-010":["(x+8)*(x+5-1.5)"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-001":["(3x + 2)(x - 4) - (2x^2 - 9x + 5)","(3x + 2)(x - 4)"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-002":["(2x + 1)(x - 3) - (3x^2 - 5x + 2)","(2x + 1)(x - 3)"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-003":["(x + 5)(x - 2) - (x^2 + 2x - 4)","(x + 5)(x - 2)"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-004":["(4x - 1)(2x + 3) - (5x^2 - 2x + 1)","(4x - 1)(2x + 3)"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-005":["(2x + 3)(3x - 1) - (4x^2 + 1x - 8)","(2x + 3)(3x - 1)"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-006":["800+22x","950+20x"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-007":["100+15x","700+11x"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-008":["2*((x+9)+(x+4))","(x+9)*(x+4)"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-009":["(x+10)*(x+6-2)"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l3-010":["x^2-16","x*(x-4)"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-001":[],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-002":["3*x*(x+2)","(2*x+4)*(x+2)","2*((2*x+4)+(x+2))"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-003":[],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-004":["2*((4*x+1)+(3*x-2))","(4*x+1)*(3*x-2)"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-005":["(x+9)*(x-2)"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-006":["5*x*(x-3)-(x^2-3*x-9)","(2*x-3)^2"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-007":[],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-008":["(x+4)*(x-1)","x^2+3x-4","x^2-4"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-009":["600+25x","625+24x"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l4-010":[],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-001":["2*y+pi*x","2*y+pi*(x+2.4)","2*y+pi*(x+4.8)"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-002":["2*y+pi*x","2*y+pi*(x+2)","2*y+pi*(x+4)"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-003":["5*V/18","V^2/250","V^2/125"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-004":["5*V/18","V^2/250","V^2/125"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-005":[],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-006":["(x+5)*(x-2)","x^2+3x-10","x^2-10"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-007":["300+18x","420+15x"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-008":[],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-009":["(x+6)*(x+3)","(x+6)*(x+3-1.5)"],"ex-3am-wadiya-idmajiya-ibarat-harfiya-3-l5-010":["(a+4)*(b+4)-a*b"]},"facts":{}};

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
    else throw new Error(`oracle wadiya-harfiya: caractère « ${c} » dans « ${src} »`);
  }
  let p = 0;
  const pk = () => toks[p]?.[0];
  const startsFactor = (k) => k === 'n' || k === 'v' || k === '(';
  const fail = (m) => { throw new Error(`oracle wadiya-harfiya: ${m} dans « ${src} »`); };
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
  if (v === null) throw new Error(`oracle wadiya-harfiya: « ${src} » garde une lettre pour ${JSON.stringify(env)}`);
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
const MISC = new Set(["BRACKET","CIRC","CROSS","DIFFSIGN","NEGSQ","NOEXPAND","ONEVALUE","PAREN","PARTIAL","SQSUM","UNITS"].map((s) => `MISC-SYN-HARF-${s}`));

function holds(op, a, b) { return cmpOp(a, b, op); }
function decide(spec) {
  switch (spec.k) {
    case 'val': return R(need(spec.e, spec.env));
    case 'coef': return R(poly(spec.e).coef(spec.v ?? 'x', spec.deg));
    case 'picoef': return R(poly(spec.e, spec.env).coef('π', spec.deg ?? 1));
    case 'round': return R(approx(spec.e, spec.env, spec.d, 'round'));
    case 'rel': {
      const a = need(spec.a, spec.env); const b = need(spec.b, spec.env);
      const hits = Object.entries(spec.opts).filter(([, op]) => holds(op, a, b)).map(([id]) => id);
      if (hits.length !== 1) throw new Error(`oracle wadiya-harfiya: ${hits.length} relation(s) vraie(s) entre « ${spec.a} » = ${a} et « ${spec.b} » = ${b}`);
      return C(hits[0]);
    }
    case 'dec': return C(holds(spec.op, need(spec.a, spec.env), need(spec.b, spec.env)) ? spec.yes : spec.no);
    case 'eq': {
      const same = poly(spec.a).equals(poly(spec.b));
      return C(same ? spec.yes : spec.no);
    }
    default: return null;
  }
}
function checkEq(key, p) {
  const same = poly(p.a).equals(poly(p.b));
  for (const env of p.agree ?? []) if (!need(p.a, env).eq(need(p.b, env))) throw new Error(`${key}: les formules devraient s'accorder en ${JSON.stringify(env)}`);
  if (!same) {
    const w = Array.isArray(p.witness) ? p.witness : p.witness ? [p.witness] : [];
    if (!w.length) throw new Error(`${key}: « différentes » exige un témoin`);
    for (const env of w) if (need(p.a, env).eq(need(p.b, env))) throw new Error(`${key}: ${JSON.stringify(env)} ne sépare pas les formules`);
  } else if (p.witness) throw new Error(`${key}: un témoin est donné pour deux formules égales`);
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
  s = s.replace(/\^\{([^{}]*)\}/g, '^($1)').replace(/\^\(([0-9])\)/g, '^$1').replace(/\\text\{[^{}]*\}/g, '').replace(/_\{?[A-Za-z0-9]\}?/g, '');
  return s;
}
const islands = (text) => [...String(text ?? '').matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
const tryPoly = (txt) => { try { return poly(texToAscii(txt)); } catch { return null; } };
const rhsOf = (isl) => isl.split('=').pop();

export function audit(bank) {
  const bad = [];
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content/practice/3am/wadiya-idmajiya-ibarat-harfiya-3');
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
    if (!spec) { bad.push(`${key}: aucune formule d'oracle`); continue; }
    // 1. clés réduites et décidées
    if (q.answerType === 'rational') {
      if (!['val', 'coef', 'picoef', 'round'].includes(spec.k)) bad.push(`${key}: « ${spec.k} » ne décide pas un rationnel`);
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
      if (!MISC.has(s.id)) bad.push(`${key}: ${s.id} n'est pas une MISC-SYN-HARF-*`);
      if (!decl.some((d) => Q.of(d.value).eq(v) && d.id === s.id)) bad.push(`${key}: signature ${s.v}/${s.id} absente du contenu`);
      if (q.answerType === 'rational' && v.eq(Q.of(q.expectedAnswer))) bad.push(`${key}: la signature ${s.v} est la bonne réponse`);
    }
    // 3. QCM
    if (q.answerType === 'choice') {
      if (!['rel', 'dec', 'eq'].includes(spec.k)) bad.push(`${key}: « ${spec.k} » ne décide pas un QCM`);
      const right = q.choices.filter((c) => c.isCorrect);
      if (right.length !== 1) bad.push(`${key}: ${right.length} bonne(s) option(s)`);
      for (const c of q.choices) if (!c.isCorrect && !MISC.has(c.misconceptionId)) bad.push(`${key}: distracteur ${c.id} sans MISC-SYN-HARF-*`);
      if (ORACLE[key] && ORACLE[key].choiceId !== right[0]?.id) bad.push(`${key}: l'oracle choisit ${ORACLE[key].choiceId}, le contenu ${right[0]?.id}`);
      if (spec.k === 'eq') { try { checkEq(key, spec); } catch (e) { bad.push(e.message); } }
      if (spec.k === 'rel' && Object.keys(spec.opts).length !== q.choices.length) bad.push(`${key}: ${Object.keys(spec.opts).length} relations pour ${q.choices.length} options`);
    }
    if (q.answerType === 'selfCheck') {
      if (spec.k !== 'prove') bad.push(`${key}: selfCheck sans « prove »`);
      else if (!poly(spec.a).equals(poly(spec.b))) bad.push(`${key}: « ${spec.a} » et « ${spec.b} » ne sont pas égaux comme polynômes`);
    }
    // 4. valeurs données aux lettres (relues dans l'énoncé)
    if (spec.env && Object.keys(spec.env).length) {
      const sameStep = ex.questions.filter((x) => x.step === q.step && x.id !== q.id).flatMap((x) => islands(`${x.lead ?? ''} ${x.statement}`));
      const isl = islands(q.statement).concat(islands(q.lead), sameStep, islands(ex.statement.content), ex.statement.formulas ?? []);
      for (const [l, vv] of Object.entries(spec.env)) {
        const hit = isl.find((i) => new RegExp(`^\\s*${l}\\s*=`).test(i));
        if (!hit) bad.push(`${key}: l'énoncé ne donne pas ${l}`);
        else { const p = tryPoly(rhsOf(hit)); const w = p?.isConst() ? p.constVal() : null; if (!w || !w.eq(Q.of(vv))) bad.push(`${key}: l'énoncé donne ${hit}, l'oracle ${l} = ${vv}`); }
      }
    }
    // 5. formules annoncées / faits de la feuille
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
  return bad;
}
