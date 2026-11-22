// Oracle du banc « mana-jam-tarh » (معنى الجمع والطرح, 1AM, 2026-10-14) — le PREMIER banc 1AM–3AM, au format
// feuille d'examen de فصل (« على منوال اختبار الفصل الأول »). Chaque réponse est RECALCULÉE ici à partir des nombres
// de l'énoncé, jamais lue dans `expectedAnswer`. Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Outils : arithmétique décimale EXACTE par les rationnels de helpers.mjs (q(...)), rendue en écriture décimale
// par `D(...)` ; la STRUCTURE de chaque histoire (le tout ou une partie inconnue) est rejouée par `whole` / `part`,
// et chaque clé de QCM est déduite de cette structure ou d'une comparaison exacte. Les questions selfCheck
// (« برّر ») n'ont pas de clé et ne figurent pas ici. Pour les نعم / لا : A = نعم, B = لا (toutes les feuilles).
import { R, C, q } from './helpers.mjs';

/** Écriture décimale exacte d'un rationnel dont le dénominateur divise une puissance de 10. */
const D = (v) => {
  const x = q(v);
  const [n, d] = x.toString().includes('/') ? x.toString().split('/').map(BigInt) : [BigInt(x.toString()), 1n];
  for (let k = 0n; k <= 8n; k++) {
    const p = 10n ** k;
    if (p % d === 0n) {
      const N = n * (p / d);
      const neg = N < 0n; const s = (neg ? -N : N).toString().padStart(Number(k) + 1, '0');
      const int = s.slice(0, s.length - Number(k)); const frac = s.slice(s.length - Number(k)).replace(/0+$/, '');
      return `${neg ? '-' : ''}${int}${frac ? `.${frac}` : ''}`;
    }
  }
  throw new Error(`${x} n'est pas décimal`);
};
const add = (...xs) => xs.reduce((s, x) => s.add(x), q(0));
const sub = (a, ...xs) => xs.reduce((s, x) => s.sub(x), q(a));
const mul = (a, b) => q(a).mul(b);
const cmp = (a, b) => { const s = q(a).sub(b); return s.isZero() ? 0 : (s.toString().startsWith('-') ? -1 : 1); };
/** Le tout d'un مخطط بأقواس : la somme de ses parties. */
const whole = (...parts) => D(add(...parts));
/** Une partie inconnue : le tout moins les autres parties. */
const part = (w, ...others) => D(sub(w, ...others));
const yn = (t) => C(t ? 'A' : 'B');
/** Rang (A, B, C…) de la valeur `v` dans une liste d'options numériques (exactement une égale). */
const pick = (v, options) => {
  const hits = options.map((o, i) => (cmp(o, v) === 0 ? i : -1)).filter((i) => i >= 0);
  if (hits.length !== 1) throw new Error(`pick: ${hits.length} options égales à ${v}`);
  return C('ABCD'[hits[0]]);
};
/** Rang de l'expression juste parmi des expressions (chaînes) évaluées en exact : une seule vaut `v`. */
const pickExpr = (v, exprs) => pick(v, exprs.map((f) => f()));

const L = 'ex-1am-mana-jam-tarh';
const K = (lvl, n, qid) => `${L}-l${lvl}-${String(n).padStart(3, '0')}:${qid}`;

/* La structure des QCM « الكل / جزء » : WHOLE / PART selon l'ordre écrit dans la feuille. */
const WHOLE_FIRST = (isWhole) => C(isWhole ? 'A' : 'B'); // options [الكل, جزء]
const PART_FIRST = (isPart) => C(isPart ? 'A' : 'B'); // options [جزء, الكل]

export const ORACLE = {
  /* ── Niveau 1 ── */
  // adapted ex-1 : 27,45 + 8,6 → مجموع (A) ; 93,2 − 15 → فرق (B) ; 4,08, 13, 70,9 → حدود المجموع (A)
  [K(1, 1, 'q1')]: C('A'), [K(1, 1, 'q2')]: C('B'), [K(1, 1, 'q3')]: C('A'),
  // adapted self-6 : □ + 9,6 = 23,1 (□ partie) — options : 23,1 + 9,6 ; 9,6 − 23,1 ; 23,1 − 9,6
  [K(1, 2, 'q1')]: pickExpr(sub('23.1', '9.6'), [() => add('23.1', '9.6'), () => sub('9.6', '23.1'), () => sub('23.1', '9.6')]),
  [K(1, 2, 'q2')]: R(part('23.1', '9.6')),
  // 38,25 et 14,8 : somme, différence (le plus grand moins le plus petit)
  [K(1, 3, 'q1')]: R(whole('38.25', '14.8')),
  [K(1, 3, 'q2')]: R(cmp('38.25', '14.8') > 0 ? part('38.25', '14.8') : part('14.8', '38.25')),
  // l'histoire : la قصّة (450) « يقلّ » du قاموس de 280 → le قاموس est le TOUT
  [K(1, 4, 'q1')]: pickExpr(add('450', '280'), [() => sub('450', '280'), () => add('450', '280'), () => sub('280', '450')]),
  [K(1, 4, 'q2')]: R(whole('450', '280')),
  // Rim 16,5 « زادت » de 2,75 sur Salma → Rim est le TOUT, Salma une partie
  [K(1, 5, 'q1')]: pickExpr(sub('16.5', '2.75'), [() => add('16.5', '2.75'), () => sub('16.5', '2.75'), () => sub('2.75', '16.5')]),
  [K(1, 5, 'q2')]: R(part('16.5', '2.75')),
  // 72,4 − 19,35 = 53,05 : فرق (A) ; حدّا الفرق 72,4 et 19,35 (A) ; vérification 53,05 + 19,35
  [K(1, 6, 'q1')]: C(cmp(sub('72.4', '19.35'), '53.05') === 0 ? 'A' : 'B'),
  [K(1, 6, 'q2')]: C('A'),
  [K(1, 6, 'q3')]: R(whole('53.05', '19.35')),
  // adapted know-1a : parties 31,6 et 7,85, tout □ → 31,6 + 7,85 = □ (A) ; □ ; مجموع (A)
  [K(1, 7, 'q1')]: C('A'), [K(1, 7, 'q2')]: R(whole('31.6', '7.85')), [K(1, 7, 'q3')]: C('A'),
  // adapted ex-16 : 4,6 + □ = 9,15 ; △ − 128 = 36,7 ; 52,3 = ○ − 6,48
  [K(1, 8, 'q1')]: R(part('9.15', '4.6')),
  [K(1, 8, 'q2')]: R(whole('128', '36.7')),
  [K(1, 8, 'q3')]: R(whole('52.3', '6.48')),
  // adapted self-7 : somme 61,2, un terme 47,85 → l'autre est un حدّ (A) = 61,2 − 47,85
  [K(1, 9, 'q1')]: C('A'), [K(1, 9, 'q2')]: R(part('61.2', '47.85')),
  // Anas 1350 « أكثر » de 275 que Maryam → 1350 est le TOUT
  [K(1, 10, 'q1')]: WHOLE_FIRST(true), [K(1, 10, 'q2')]: R(part('1350', '275')),

  /* ── Niveau 2 ── */
  // adapted act-1 ① : possède 145,5, « ينقصه » 64,5 → prix = TOUT ; « on soustrait » est faux (B)
  [K(2, 1, 'q1')]: R(whole('145.5', '64.5')), [K(2, 1, 'q2')]: yn(false),
  // adapted method-3 : Samir 138 ; Walid = 138 + 6 ; Nabil = 138 − 9 ; le plus grand = Walid (A)
  [K(2, 2, 'q1')]: R(whole('138', '6')), [K(2, 2, 'q2')]: R(part('138', '9')),
  [K(2, 2, 'q3')]: pick([whole('138', '6'), '138', part('138', '9')].reduce((m, x) => (cmp(x, m) > 0 ? x : m)), [whole('138', '6'), '138', part('138', '9')]),
  // adapted self-8 : Ahmed 1,54 m est le TOUT ; frère = 154 cm − 7 cm
  [K(2, 3, 'q1')]: WHOLE_FIRST(true), [K(2, 3, 'q2')]: R(part(mul('1.54', 100), '7')),
  // 1000 DA ; livre 685 + stylo 340 ; suffisant ? ; manque
  [K(2, 4, 'q1')]: R(whole('685', '340')),
  [K(2, 4, 'q2')]: yn(cmp(add('685', '340'), '1000') <= 0),
  [K(2, 4, 'q3')]: R(part(add('685', '340'), '1000')),
  // Rami : 15,6 = 9,2 + 6,4 ? ; Sara : 3,8 = 9,2 − 6,4 ? ; la différence
  [K(2, 5, 'q1')]: yn(cmp(add('9.2', '6.4'), '15.6') === 0),
  [K(2, 5, 'q2')]: yn(cmp(sub('9.2', '6.4'), '3.8') === 0),
  [K(2, 5, 'q3')]: R(part('9.2', '6.4')),
  // مخطط : parties 18,75 et □, tout 40 → □ partie (A) ; 40 − 18,75 (A) ; valeur
  [K(2, 6, 'q1')]: PART_FIRST(true),
  [K(2, 6, 'q2')]: pickExpr(sub('40', '18.75'), [() => sub('40', '18.75'), () => add('40', '18.75'), () => sub('18.75', '40')]),
  [K(2, 6, 'q3')]: R(part('40', '18.75')),
  // sacs 4,35 et 2,9 kg : différence ; règle (A) ; total
  [K(2, 7, 'q1')]: R(part('4.35', '2.9')), [K(2, 7, 'q2')]: C('A'), [K(2, 7, 'q3')]: R(whole('4.35', '2.9')),
  // Tarek : 0,93 − 0,08 = 0,13 ? (vérifié par 0,13 + 0,08) ; la vraie différence ; règle (A)
  [K(2, 8, 'q1')]: yn(cmp(add('0.13', '0.08'), '0.93') === 0),
  [K(2, 8, 'q2')]: R(part('0.93', '0.08')),
  [K(2, 8, 'q3')]: C('A'),
  // adapted now-29 : AB 87, AC 151, AD 236 (A, B, C, D dans l'ordre) → AC = AB + BC (A)
  [K(2, 9, 'q1')]: C('A'), [K(2, 9, 'q2')]: R(part('151', '87')), [K(2, 9, 'q3')]: R(part('236', '151')),
  // on 1am-s1-91 ex. 3 : Sétif 8 « تقلّ » de 14 que Biskra → Biskra est le TOUT (A)
  [K(2, 10, 'q1')]: C('A'), [K(2, 10, 'q2')]: R(whole('8', '14')),

  /* ── Niveau 3 ── */
  // on 1am-s1-91 ex. 3 : Tlemcen 11, « تقلّ » de 17 que Adrar, « تزيد » de 4 sur Tiaret
  [K(3, 1, 'q1')]: WHOLE_FIRST(true),
  [K(3, 1, 'q2')]: R(whole('11', '17')),
  [K(3, 1, 'q3')]: R(part('11', '4')),
  [K(3, 1, 'q4')]: R(part(whole('11', '17'), part('11', '4'))),
  // on 1am-s1-99 ex. 2 : farine 750,5, sucre 315,25, beurre 96,4
  [K(3, 2, 'q1')]: R(whole('750.5', '315.25', '96.4')),
  [K(3, 2, 'q2')]: R(part('750.5', '315.25')),
  [K(3, 2, 'q3')]: R(part('315.25', '96.4')),
  // A = 45,8 + 17,35 ; B = 45,8 − 17,35 ; A est un مجموع (A) ; A − B
  [K(3, 3, 'q1')]: R(whole('45.8', '17.35')),
  [K(3, 3, 'q2')]: R(part('45.8', '17.35')),
  [K(3, 3, 'q3')]: C('A'),
  [K(3, 3, 'q4')]: R(part(whole('45.8', '17.35'), part('45.8', '17.35'))),
  // □ + 26,75 = 80 ; □ − 39,6 = 12,45 (□ est le TOUT → A)
  [K(3, 4, 'q1')]: R(part('80', '26.75')),
  [K(3, 4, 'q2')]: R(whole('39.6', '12.45')),
  [K(3, 4, 'q3')]: WHOLE_FIRST(true),
  // oranges 185 ; pommes « أكثر » de 95 ; bananes « أقل » que les pommes de 40 ; tout = pommes (A) ; un kg de chaque
  [K(3, 5, 'q1')]: R(whole('185', '95')),
  [K(3, 5, 'q2')]: R(part(whole('185', '95'), '40')),
  [K(3, 5, 'q3')]: C('A'),
  [K(3, 5, 'q4')]: R(whole('185', whole('185', '95'), part(whole('185', '95'), '40'))),
  // on 1am-s1-101 ex. 5 : garage 612,5 = 98,4 + voiture + 81,6 ; type selon le tableau (412,5 ; 432,5 ; 438,2)
  [K(3, 6, 'q1')]: pickExpr(sub('612.5', '98.4', '81.6'), [() => sub('612.5', '98.4', '81.6'), () => add('612.5', '98.4', '81.6'), () => add(sub('612.5', '98.4'), '81.6')]),
  [K(3, 6, 'q2')]: R(part('612.5', '98.4', '81.6')),
  [K(3, 6, 'q3')]: pick(part('612.5', '98.4', '81.6'), ['412.5', '432.5', '438.2']),
  // adapted ex-17 : tracteur 5,35 + remorque 6,9 ; la somme « تزيد » de 1,85 sur le camion → somme = TOUT
  [K(3, 7, 'q1')]: R(whole('5.35', '6.9')),
  [K(3, 7, 'q2')]: WHOLE_FIRST(true),
  [K(3, 7, 'q3')]: R(part(whole('5.35', '6.9'), '1.85')),
  // on 1am-s1-104 ex. 5 : 1275,5 + 640,25 + 418,75 ; payé 2700 (TOUT) ; marteau
  [K(3, 8, 'q1')]: R(whole('1275.5', '640.25', '418.75')),
  [K(3, 8, 'q2')]: WHOLE_FIRST(true),
  [K(3, 8, 'q3')]: R(part('2700', '1275.5', '640.25', '418.75')),
  // Khaled 14,36 s, « أسرع » de 0,9 s que Fares → Fares (temps plus long) est le TOUT ; Yacine 15,1 s
  [K(3, 9, 'q1')]: WHOLE_FIRST(true),
  [K(3, 9, 'q2')]: R(whole('14.36', '0.9')),
  [K(3, 9, 'q3')]: R(part('15.1', '14.36')),
  // classes : 3450 ; 2e « أقل » de 575 ; 3e « أكثر » que la 2e de 1120 ; total
  [K(3, 10, 'q1')]: R(part('3450', '575')),
  [K(3, 10, 'q2')]: R(whole(part('3450', '575'), '1120')),
  [K(3, 10, 'q3')]: R(whole('3450', part('3450', '575'), whole(part('3450', '575'), '1120'))),

  /* ── Niveau 4 ── */
  // musée : arrondis à la centaine (counted:false) 3000 + 400 + 600 ; total exact ; 4000 suffit ? ; reste
  [K(4, 1, 'q1')]: R(D(add('3000', '400', '600'))),
  [K(4, 1, 'q2')]: R(whole('2980.5', '415.75', '603')),
  [K(4, 1, 'q3')]: yn(cmp(add('2980.5', '415.75', '603'), '4000') <= 0),
  [K(4, 1, 'q4')]: R(part('4000', '2980.5', '415.75', '603')),
  // on 1am-s1-94 ex. 5 : 4 boîtes × 215,5 (counted:false) ; 465,25 + boîtes + 390,75 ; 2500 − 800 ; suffisant ? ; manque
  [K(4, 2, 'q1')]: R(D(mul('215.5', 4))),
  [K(4, 2, 'q2')]: R(whole('465.25', mul('215.5', 4), '390.75')),
  [K(4, 2, 'q3')]: R(part('2500', '800')),
  [K(4, 2, 'q4')]: yn(cmp(sub('2500', '800'), add('465.25', mul('215.5', 4), '390.75')) >= 0),
  [K(4, 2, 'q5')]: R(part(add('465.25', mul('215.5', 4), '390.75'), sub('2500', '800'))),
  // Rayan 1,46 m (TOUT), « يزيد » de 18 cm sur sa sœur
  [K(4, 3, 'q1')]: R(D(mul('1.46', 100))),
  [K(4, 3, 'q2')]: WHOLE_FIRST(true),
  [K(4, 3, 'q3')]: R(part(mul('1.46', 100), '18')),
  [K(4, 3, 'q4')]: R(D(sub(mul('1.46', 100), '18').div(100))),
  // sauts 3,48 ; 3,5 ; 3,085 : ordre décroissant (A = 3,5 > 3,48 > 3,085) ; max − min ; Ilyas − Amine
  [K(4, 4, 'q1')]: C(cmp('3.5', '3.48') > 0 && cmp('3.48', '3.085') > 0 ? 'A' : 'B'),
  [K(4, 4, 'q2')]: R(part('3.5', '3.085')),
  [K(4, 4, 'q3')]: R(part('3.5', '3.48')),
  // on 1am-s1-93 ex. 5 : 420,6 + 1350,4 + 6875,25 + 3260,75 ; 100 × 4,5 (counted:false) ; total ; 15000 − total
  [K(4, 5, 'q1')]: R(whole('420.6', '1350.4', '6875.25', '3260.75')),
  [K(4, 5, 'q2')]: R(D(mul('4.5', 100))),
  [K(4, 5, 'q3')]: R(whole('420.6', '1350.4', '6875.25', '3260.75', mul('4.5', 100))),
  [K(4, 5, 'q4')]: R(part('15000', '420.6', '1350.4', '6875.25', '3260.75', mul('4.5', 100))),
  // a = 2475/100, b = 386/10 (counted:false) ; a + b ; b − a (b > a)
  [K(4, 6, 'q1')]: R(D('2475/100')), [K(4, 6, 'q2')]: R(D('386/10')),
  [K(4, 6, 'q3')]: R(whole('2475/100', '386/10')),
  [K(4, 6, 'q4')]: R(cmp('386/10', '2475/100') > 0 ? part('386/10', '2475/100') : part('2475/100', '386/10')),
  // on 1am-s1-98 ex. 4 : 12 × 2640,5 (counted:false) ; 7250,85 + tables + 8975,5 ; 60000 − total ; livres 12500 ?
  [K(4, 7, 'q1')]: R(D(mul('2640.5', 12))),
  [K(4, 7, 'q2')]: R(whole('7250.85', mul('2640.5', 12), '8975.5')),
  [K(4, 7, 'q3')]: R(part('60000', '7250.85', mul('2640.5', 12), '8975.5')),
  [K(4, 7, 'q4')]: yn(cmp(sub('60000', '7250.85', mul('2640.5', 12), '8975.5'), '12500') >= 0),
  // adapted deep-8 : périmètre 2 × (48,5 + 31,25) (counted:false) ; décomposition (A) ; clôture = périmètre − 3,6 − 4,15
  [K(4, 8, 'q1')]: R(D(mul(add('48.5', '31.25'), 2))),
  [K(4, 8, 'q2')]: C('A'),
  [K(4, 8, 'q3')]: R(part(mul(add('48.5', '31.25'), 2), '3.6', '4.15')),
  // on 1am-s2-64 ex. 4 : départ 9 h 40, arrivée 11 h 25 → durée = PARTIE (A) ; arrivée − départ (A) ; en minutes
  [K(4, 9, 'q1')]: PART_FIRST(true),
  [K(4, 9, 'q2')]: C('A'),
  [K(4, 9, 'q3')]: R(D(sub(add(mul(11, 60), 25), add(mul(9, 60), 40)))),
  // feuilles 21,47 ; 38,96 ; 9,08 : arrondis à l'unité 21 + 39 + 9 (counted:false) ; exact ; 60,51 raisonnable ?
  [K(4, 10, 'q1')]: R(D(add('21', '39', '9'))),
  [K(4, 10, 'q2')]: R(whole('21.47', '38.96', '9.08')),
  [K(4, 10, 'q3')]: yn(cmp(add('21.47', '38.96', '9.08'), '60.51') === 0),

  /* ── Niveau 5 ── */
  // on 1am-s1-91 ex. 5 : réservoir 45 L dont 18 L ; 4 × 15 ; litres × 45,6 ; budget ; + table 300 vs 2500 ; manque
  [K(5, 1, 'q1')]: R(part('45', '18')),
  [K(5, 1, 'q2')]: R(D(mul('15', 4))),
  [K(5, 1, 'q3')]: R(D(mul(sub('45', '18'), '45.6'))),
  [K(5, 1, 'q4')]: R(whole(mul('15', 4), '645.5', '380.25', '150', mul(sub('45', '18'), '45.6'))),
  [K(5, 1, 'q5')]: yn(cmp(add(mul('15', 4), '645.5', '380.25', '150', mul(sub('45', '18'), '45.6'), '300'), '2500') <= 0),
  [K(5, 1, 'q6')]: R(part(add(mul('15', 4), '645.5', '380.25', '150', mul(sub('45', '18'), '45.6'), '300'), '2500')),
  // on 1am-s1-96 ex. 5 : côtés 135 ; 86,4 ; 52,5 ; 94,6 ; entrée 4,5 ; 300 DA/m ; labour 4 h × 3 j × 2500 ; 150000 ; graines 12000
  [K(5, 2, 'q1')]: R(whole('135', '86.4', '52.5', '94.6')),
  [K(5, 2, 'q2')]: WHOLE_FIRST(true),
  [K(5, 2, 'q3')]: R(part(add('135', '86.4', '52.5', '94.6'), '4.5')),
  [K(5, 2, 'q4')]: R(D(mul(sub(add('135', '86.4', '52.5', '94.6'), '4.5'), 300))),
  [K(5, 2, 'q5')]: R(D(mul(mul(4, 3), 2500))),
  [K(5, 2, 'q6')]: R(part('150000', mul(sub(add('135', '86.4', '52.5', '94.6'), '4.5'), 300), mul(mul(4, 3), 2500))),
  [K(5, 2, 'q7')]: yn(cmp(sub('150000', mul(sub(add('135', '86.4', '52.5', '94.6'), '4.5'), 300), mul(mul(4, 3), 2500)), '12000') >= 0),
  // on 1am-s1-104 ex. 5 : 1150,75 + 525,5 + 386,25 ; payé 2500 (TOUT) ; marteau ; 200 × 2,5 (counted:false) ; total ; dépasse 3000 ?
  [K(5, 3, 'q1')]: R(whole('1150.75', '525.5', '386.25')),
  [K(5, 3, 'q2')]: WHOLE_FIRST(true),
  [K(5, 3, 'q3')]: R(part('2500', '1150.75', '525.5', '386.25')),
  [K(5, 3, 'q4')]: R(D(mul('2.5', 200))),
  [K(5, 3, 'q5')]: R(whole('2500', mul('2.5', 200))),
  [K(5, 3, 'q6')]: yn(cmp(add('2500', mul('2.5', 200)), '3000') > 0),
  // on 1am-s1-106 ex. 5 (contexte réécrit) : 60 × 425,5 ; 100 × 38,75 (counted:false) ; dépensé ; 40000 − dépensé ; photographe 8500 ? ; total
  [K(5, 4, 'q1')]: R(D(mul('425.5', 60))),
  [K(5, 4, 'q2')]: R(D(mul('38.75', 100))),
  [K(5, 4, 'q3')]: R(whole(mul('425.5', 60), mul('38.75', 100))),
  [K(5, 4, 'q4')]: R(part('40000', mul('425.5', 60), mul('38.75', 100))),
  [K(5, 4, 'q5')]: yn(cmp(sub('40000', mul('425.5', 60), mul('38.75', 100)), '8500') >= 0),
  [K(5, 4, 'q6')]: R(whole(mul('425.5', 60), mul('38.75', 100), '8500')),
  // on 1am-s1-94 ex. 5 : 3 × 245,5 (counted:false) ; 612,25 + boîtes + 405,75 ; 2500 − 600 ; suffisant ? ; vitamine « أقل » de 98,5 ; reste
  [K(5, 5, 'q1')]: R(D(mul('245.5', 3))),
  [K(5, 5, 'q2')]: R(whole('612.25', mul('245.5', 3), '405.75')),
  [K(5, 5, 'q3')]: R(part('2500', '600')),
  [K(5, 5, 'q4')]: yn(cmp(sub('2500', '600'), add('612.25', mul('245.5', 3), '405.75')) >= 0),
  [K(5, 5, 'q5')]: R(part('405.75', '98.5')),
  [K(5, 5, 'q6')]: R(part(sub('2500', '600'), '612.25', mul('245.5', 3), sub('405.75', '98.5'))),
  // on 1am-s1-101 ex. 5 : 180 ÷ 12 ; 17 × 940,5 (counted:false) ; voiture = PARTIE (A) ; 594,2 − 96,8 − 78,5 ;
  // type (405,8 ; 418,9 ; 421,6) ; 176,4 + 2 × 55,5 ; ≤ 300 ?
  [K(5, 6, 'q1')]: R(D(q(180).div(12))),
  [K(5, 6, 'q2')]: R(D(mul('940.5', 17))),
  [K(5, 6, 'q3')]: PART_FIRST(true),
  [K(5, 6, 'q4')]: R(part('594.2', '96.8', '78.5')),
  [K(5, 6, 'q5')]: pick(part('594.2', '96.8', '78.5'), ['405.8', '418.9', '421.6']),
  [K(5, 6, 'q6')]: R(whole('176.4', '55.5', '55.5')),
  [K(5, 6, 'q7')]: yn(cmp(add('176.4', '55.5', '55.5'), '300') <= 0),
  // route A, B, C, D : AB 245,5 ; AC 403 ; AD 652,8 ; jour 1 : 318,6 ; jour 2 < 350 ?
  [K(5, 7, 'q1')]: C('A'),
  [K(5, 7, 'q2')]: R(part('403', '245.5')),
  [K(5, 7, 'q3')]: R(part('652.8', '403')),
  [K(5, 7, 'q4')]: R(part('652.8', '318.6')),
  [K(5, 7, 'q5')]: yn(cmp('318.6', '245.5') > 0),
  [K(5, 7, 'q6')]: R(part('403', '318.6')),
  [K(5, 7, 'q7')]: yn(cmp(sub('652.8', '318.6'), '350') < 0),
  // vélo 18500 ; Zakaria 7850,5 ; Ishaq « أقل » de 1275,75 ; père = reste ; 2e vélo « أقل » de 1450 + casque 1200
  [K(5, 8, 'q1')]: R(part('7850.5', '1275.75')),
  [K(5, 8, 'q2')]: R(whole('7850.5', sub('7850.5', '1275.75'))),
  [K(5, 8, 'q3')]: WHOLE_FIRST(true),
  [K(5, 8, 'q4')]: R(part('18500', '7850.5', sub('7850.5', '1275.75'))),
  [K(5, 8, 'q5')]: R(part('18500', '1450')),
  [K(5, 8, 'q6')]: yn(cmp(sub(add(sub('18500', '1450'), '1200'), '7850.5', sub('7850.5', '1275.75')), sub('18500', '7850.5', sub('7850.5', '1275.75'))) < 0),
  // livres : 238 ; 2e « أكثر » de 47 ; 3e « أقل » que la 2e de 62 ; 4e 196 ; place 950 ; parents 15
  [K(5, 9, 'q1')]: R(whole('238', '47')),
  [K(5, 9, 'q2')]: R(part(whole('238', '47'), '62')),
  [K(5, 9, 'q3')]: C('A'),
  [K(5, 9, 'q4')]: R(whole('238', whole('238', '47'), part(whole('238', '47'), '62'), '196')),
  [K(5, 9, 'q5')]: R(part('950', '238', whole('238', '47'), part(whole('238', '47'), '62'), '196')),
  [K(5, 9, 'q6')]: yn(cmp(sub('950', '238', whole('238', '47'), part(whole('238', '47'), '62'), '196'), '15') >= 0),
  [K(5, 9, 'q7')]: R(part('15', sub('950', '238', whole('238', '47'), part(whole('238', '47'), '62'), '196'))),
  // relais : 13,8 + 14,25 + 13,6 + 14,05 ; équipe B « أكثر » de 0,85 (TOUT) ; vainqueur = plus petit temps (A) ; record 55,9
  [K(5, 10, 'q1')]: R(whole('13.8', '14.25', '13.6', '14.05')),
  [K(5, 10, 'q2')]: WHOLE_FIRST(true),
  [K(5, 10, 'q3')]: R(whole('13.8', '14.25', '13.6', '14.05', '0.85')),
  [K(5, 10, 'q4')]: C(cmp(add('13.8', '14.25', '13.6', '14.05'), add('13.8', '14.25', '13.6', '14.05', '0.85')) < 0 ? 'A' : 'B'),
  [K(5, 10, 'q5')]: yn(cmp(add('13.8', '14.25', '13.6', '14.05'), '55.9') < 0),
  [K(5, 10, 'q6')]: R(part('55.9', '13.8', '14.25', '13.6', '14.05')),
};
