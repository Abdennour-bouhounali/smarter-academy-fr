// Oracle du banc « rabi-mutanasib » (حساب الرابع المتناسب, 2AM, 2026-10-21) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل … »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, en arithmétique exacte indépendante (FRACTIONS BigInt) :
//  - `NUM('625 × 6 ÷ 5')` évalue l'expression (décimaux « 6,5 », + − × ÷, parenthèses) en fraction exacte, REFUSE un
//    résultat non décimal fini (une réponse saisie est toujours un décimal) puis l'écrit avec la virgule décimale ;
//  - un QCM n'a qu'un seul choix juste, DÉCIDÉ option par option sur le texte retapé ici :
//      ['val', e]   l'option est un nombre (ou une fraction « 25/3 », genre 'frac') égal à e ;
//      ['expr', e]  l'option est un calcul (« 640 × 3 ») qui doit valoir e ;
//      ['eqx', e]   l'option est une égalité en x (« 9 × x = 15 × 24 ») qui doit être VRAIE pour x = e (les mauvais
//                   produits en croix donnent une autre valeur de x) ;
//      ['le', a, b] oui/non : YES vaut « a ≤ b » ; ['cheaper', a, b] : A si a < b, B si a > b, EQ sinon ;
//      ['min', …]   l'option est le plus petit des nombres évalués (le composant qui limite la production) ;
//  - un distracteur n'est jamais juste : PICK échoue s'il n'y a pas exactement UNE option juste.
// Les questions selfCheck (« برّر ») n'ont pas de clé et ne figurent pas ici.
import { R, C } from './helpers.mjs';

/* ── fractions exactes (BigInt) : numérateur / dénominateur, toujours réduites, dénominateur > 0 ── */
const pgcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b !== 0n) { const t = a % b; a = b; b = t; } return a === 0n ? 1n : a; };
const fr = (n, d = 1n) => { if (d === 0n) throw new Error('division par zéro'); if (d < 0n) { n = -n; d = -d; } const g = pgcd(n, d); return [n / g, d / g]; };
const plus = ([a, b], [c, d]) => fr(a * d + c * b, b * d);
const moins = ([a, b], [c, d]) => fr(a * d - c * b, b * d);
const fois = ([a, b], [c, d]) => fr(a * c, b * d);
const sur = ([a, b], [c, d]) => fr(a * d, b * c);
const egal = ([a, b], [c, d]) => a === c && b === d;
const comp = ([a, b], [c, d]) => { const g = a * d, h = c * b; return g < h ? -1 : g > h ? 1 : 0; };
/** « 6,5 » ou « 12 » → fraction exacte */
const lire = (t) => { const m = /^(\d+)(?:[.,](\d+))?$/.exec(t); if (!m) throw new Error(`nombre illisible « ${t} »`); const f = m[2] ?? ''; return fr(BigInt(m[1] + f), 10n ** BigInt(f.length)); };
/** évalue « a × b ÷ c + d », parenthèses, variable x : descente récursive sur la liste de lexèmes */
const calcul = (texte, x = null) => {
  const lex = texte.replace(/\s+/g, '').match(/\d+(?:[.,]\d+)?|x|[+\-×÷*/()]/g);
  if (!lex || lex.join('') !== texte.replace(/\s+/g, '')) throw new Error(`expression illisible « ${texte} »`);
  let p = 0;
  const facteur = () => { const t = lex[p++]; if (t === '(') { const v = somme(); p++; return v; } if (t === 'x') { if (!x) throw new Error('x indéfini'); return x; } return lire(t); };
  const terme = () => { let v = facteur(); while (['×', '*', '÷', '/'].includes(lex[p])) { const o = lex[p++]; const w = facteur(); v = (o === '×' || o === '*') ? fois(v, w) : sur(v, w); } return v; };
  const somme = () => { let v = terme(); while (lex[p] === '+' || lex[p] === '-') { const o = lex[p++]; const w = terme(); v = o === '+' ? plus(v, w) : moins(v, w); } return v; };
  const v = somme(); if (p !== lex.length) throw new Error(`reste dans « ${texte} »`); return v;
};
/** écriture décimale (virgule) d'une fraction ; erreur si elle n'est pas un décimal fini */
const decimal = ([n, d]) => {
  let k = 0n, r = d; while (r % 2n === 0n) r /= 2n; while (r % 5n === 0n) r /= 5n;
  if (r !== 1n) throw new Error(`${n}/${d} n'est pas un décimal fini`);
  while ((10n ** k) % d !== 0n) k++;
  const s = (n * (10n ** k) / d).toString().replace('-', '').padStart(Number(k) + 1, '0');
  const ent = s.slice(0, s.length - Number(k)); const dec = s.slice(s.length - Number(k)).replace(/0+$/, '');
  return `${n < 0n ? '-' : ''}${ent}${dec ? ',' + dec : ''}`;
};
const NUM = (e) => decimal(calcul(e));

/* ── options de QCM ── */
const vraie = (genre, texte) => {
  const [k, ...a] = genre;
  switch (k) {
    case 'val': case 'frac': case 'expr': return egal(calcul(texte), calcul(a[0]));
    case 'eqx': { const [g, d] = texte.split('='); const x = calcul(a[0]); return egal(calcul(g, x), calcul(d, x)); }
    case 'le': { const oui = comp(calcul(a[0]), calcul(a[1])) <= 0; return texte === 'YES' ? oui : texte === 'NO' ? !oui : (() => { throw new Error(texte); })(); }
    case 'cheaper': { const c = comp(calcul(a[0]), calcul(a[1])); return texte === (c < 0 ? 'A' : c > 0 ? 'B' : 'EQ'); }
    case 'min': return egal(calcul(texte), a.map((e) => calcul(e)).reduce((m, v) => (comp(v, m) < 0 ? v : m)));
    default: throw new Error(`genre « ${k} »`);
  }
};
const PICK = (genre, options) => {
  const justes = options.map((o, i) => (vraie(genre, o) ? i : -1)).filter((i) => i >= 0);
  if (justes.length !== 1) throw new Error(`QCM ${JSON.stringify(genre)} : ${justes.length} options justes parmi ${JSON.stringify(options)}`);
  return C('ABCDEF'[justes[0]]);
};

const L = 'ex-2am-rabi-mutanasib';
const K = (lvl, n, q) => `${L}-l${lvl}-${String(n).padStart(3, '0')}:${q}`;

export const ORACLE = {
  [K(1, 1, 'q1')]: R(NUM("100×13÷6,5")),
  [K(1, 1, 'q2')]: R(NUM("100×52÷6,5")),
  [K(1, 1, 'q3')]: R(NUM("6,5×520÷100")),
  [K(1, 2, 'q1')]: R(NUM("150÷5")),
  [K(1, 2, 'q2')]: R(NUM("30×6")),
  [K(1, 2, 'q3')]: R(NUM("270÷30")),
  [K(1, 2, 'q4')]: R(NUM("330÷30")),
  [K(1, 3, 'q1')]: R(NUM("60÷4")),
  [K(1, 3, 'q2')]: R(NUM("60×12÷4")),
  [K(1, 3, 'q3')]: R(NUM("4×300÷60")),
  [K(1, 4, 'q1')]: PICK(["val","90÷6"], ["540","1/15","15"]),
  [K(1, 4, 'q2')]: R(NUM("90×18÷6")),
  [K(1, 4, 'q3')]: R(NUM("6×225÷90")),
  [K(1, 5, 'q1')]: R(NUM("16÷10")),
  [K(1, 5, 'q2')]: R(NUM("16×15÷10")),
  [K(1, 5, 'q3')]: R(NUM("10×40÷16")),
  [K(1, 6, 'q1')]: R(NUM("4×100÷50")),
  [K(1, 6, 'q2')]: R(NUM("4×25÷50")),
  [K(1, 6, 'q3')]: R(NUM("4×150÷50")),
  [K(1, 7, 'q1')]: R(NUM("3×12÷24")),
  [K(1, 7, 'q2')]: R(NUM("3×40÷24")),
  [K(1, 7, 'q3')]: R(NUM("3×100÷24")),
  [K(1, 8, 'q1')]: R(NUM("18×10÷6")),
  [K(1, 8, 'q2')]: R(NUM("18×15÷6")),
  [K(1, 8, 'q3')]: R(NUM("6×63÷18")),
  [K(1, 9, 'q1')]: PICK(["val","450÷3"], ["1350","150","1/150"]),
  [K(1, 9, 'q2')]: R(NUM("450×8÷3")),
  [K(1, 9, 'q3')]: R(NUM("3×2100÷450")),
  [K(1, 10, 'q1')]: R(NUM("3×20÷12")),
  [K(1, 10, 'q2')]: R(NUM("3×48÷12")),
  [K(1, 10, 'q3')]: R(NUM("12×9÷3")),
  [K(2, 1, 'q1')]: R(NUM("10×10÷4")),
  [K(2, 1, 'q2')]: R(NUM("10×20÷4")),
  [K(2, 1, 'q3')]: R(NUM("10×24÷4")),
  [K(2, 1, 'q4')]: R(NUM("10×21÷4")),
  [K(2, 1, 'q5')]: PICK(["le","10×21÷4","50"], ["YES","NO"]),
  [K(2, 2, 'q1')]: R(NUM("80÷5")),
  [K(2, 2, 'q2')]: R(NUM("5×112÷80")),
  [K(2, 2, 'q3')]: R(NUM("80×15÷5")),
  [K(2, 3, 'q1')]: R(NUM("510×5÷3")),
  [K(2, 3, 'q2')]: R(NUM("3×1190÷510")),
  [K(2, 3, 'q3')]: R(NUM("510×9÷3")),
  [K(2, 4, 'q1')]: R(NUM("400÷2,5")),
  [K(2, 4, 'q2')]: R(NUM("400×6÷2,5")),
  [K(2, 4, 'q3')]: R(NUM("2,5×1280÷400")),
  [K(2, 5, 'q1')]: R(NUM("9×20÷4")),
  [K(2, 5, 'q2')]: R(NUM("6×21÷9")),
  [K(2, 5, 'q3')]: R(NUM("5×9÷12")),
  [K(2, 5, 'q4')]: R(NUM("8×1,5÷2")),
  [K(2, 6, 'q1')]: PICK(["eqx","8×4,5÷9"], ["x × 8 = 9 × 4,5","x × 4,5 = 8 × 9","x × 9 = 8 × 4,5"]),
  [K(2, 6, 'q2')]: R(NUM("8×4,5÷9")),
  [K(2, 6, 'q3')]: R(NUM("9×20÷8")),
  [K(2, 7, 'q1')]: R(NUM("12×20÷8")),
  [K(2, 7, 'q2')]: R(NUM("8×45÷12")),
  [K(2, 7, 'q3')]: R(NUM("12÷8")),
  [K(2, 8, 'q1')]: R(NUM("330÷1,5")),
  [K(2, 8, 'q2')]: R(NUM("1,5×1760÷330")),
  [K(2, 8, 'q3')]: R(NUM("330×12,5÷1,5")),
  [K(2, 9, 'q1')]: R(NUM("90÷1,5")),
  [K(2, 9, 'q2')]: R(NUM("90×2,5÷1,5")),
  [K(2, 9, 'q3')]: R(NUM("1,5×210÷90")),
  [K(2, 10, 'q1')]: R(NUM("1320÷6")),
  [K(2, 10, 'q2')]: R(NUM("1320×9÷6")),
  [K(2, 10, 'q3')]: R(NUM("6×3740÷1320")),
  [K(3, 1, 'q1')]: R(NUM("49×18÷7")),
  [K(3, 1, 'q2')]: R(NUM("7×91÷49")),
  [K(3, 1, 'q3')]: R(NUM("49×12÷7")),
  [K(3, 1, 'q4')]: R(NUM("49÷7")),
  [K(3, 2, 'q1')]: R(NUM("50÷10")),
  [K(3, 2, 'q2')]: R(NUM("35×5")),
  [K(3, 2, 'q3')]: R(NUM("15×35÷75")),
  [K(3, 3, 'q1')]: R(NUM("1360×5÷8")),
  [K(3, 3, 'q2')]: PICK(["expr","1360×13÷8"], ["850 + 8","850 + 1360","1360 + 13"]),
  [K(3, 3, 'q3')]: R(NUM("5×8500÷850")),
  [K(3, 4, 'q1')]: R(NUM("4,5×36÷18")),
  [K(3, 4, 'q2')]: R(NUM("4,5×30÷18")),
  [K(3, 4, 'q3')]: R(NUM("18×12÷4,5")),
  [K(3, 5, 'q1')]: R(NUM("750×10÷5")),
  [K(3, 5, 'q2')]: PICK(["expr","750×25÷5"], ["750 × 5","750 + 20","750 × 25"]),
  [K(3, 5, 'q3')]: R(NUM("750×40÷5")),
  [K(3, 6, 'q1')]: PICK(["expr","640×24÷8"], ["640 × 3","640 + 16","640 ÷ 3"]),
  [K(3, 6, 'q2')]: R(NUM("640×5÷8")),
  [K(3, 6, 'q3')]: R(NUM("8×1120÷640")),
  [K(3, 7, 'q1')]: PICK(["expr","320×5÷4"], ["320 + 1","320 × 5 ÷ 4","320 × 5"]),
  [K(3, 7, 'q2')]: R(NUM("320×5÷4-320")),
  [K(3, 7, 'q3')]: R(NUM("320×9÷4")),
  [K(3, 8, 'q1')]: PICK(["eqx","15×24÷9"], ["9 × 15 = 24 × x","9 × 24 = 15 × x","9 × x = 15 × 24"]),
  [K(3, 8, 'q2')]: R(NUM("15×24÷9")),
  [K(3, 8, 'q3')]: R(NUM("12×28÷21")),
  [K(3, 9, 'q1')]: PICK(["expr","540×18÷6"], ["540 × 3","540 + 12","540 × 18"]),
  [K(3, 9, 'q2')]: R(NUM("540×24÷6")),
  [K(3, 9, 'q3')]: R(NUM("540×9÷6")),
  [K(3, 10, 'q1')]: R(NUM("290÷2")),
  [K(3, 10, 'q2')]: R(NUM("290×7÷2")),
  [K(3, 10, 'q3')]: PICK(["expr","290×10÷2"], ["725 × 2","725 + 5","725 + 290"]),
  [K(4, 1, 'q1')]: R(NUM("168×16÷24")),
  [K(4, 1, 'q2')]: R(NUM("24×28÷168")),
  [K(4, 1, 'q3')]: R(NUM("24×224÷168")),
  [K(4, 1, 'q4')]: R(NUM("168÷24")),
  [K(4, 1, 'q5')]: PICK(["frac","24×50÷168"], ["50/7","7/50","350"]),
  [K(4, 2, 'q1')]: PICK(["eqx","24×15÷6"], ["24 × 15 = 6 × x","24 × 6 = 15 × x","24 × x = 6 × 15"]),
  [K(4, 2, 'q2')]: R(NUM("24×15÷6")),
  [K(4, 2, 'q3')]: R(NUM("6×40÷24")),
  [K(4, 2, 'q4')]: R(NUM("24×4÷6")),
  [K(4, 3, 'q1')]: R(NUM("11,2÷8")),
  [K(4, 3, 'q2')]: R(NUM("11,2×12÷8")),
  [K(4, 3, 'q4')]: R(NUM("8×21÷11,2")),
  [K(4, 4, 'q1')]: PICK(["frac","50÷6"], ["8,33","300","25/3"]),
  [K(4, 4, 'q2')]: R(NUM("50×15÷6")),
  [K(4, 4, 'q3')]: R(NUM("50×9÷6")),
  [K(4, 5, 'q1')]: R(NUM("330÷12")),
  [K(4, 5, 'q2')]: R(NUM("330×18÷12")),
  [K(4, 5, 'q3')]: PICK(["le","330×19÷12","500"], ["YES","NO"]),
  [K(4, 6, 'q1')]: R(NUM("750×12÷5")),
  [K(4, 6, 'q2')]: R(NUM("5×2700÷750")),
  [K(4, 6, 'q3')]: R(NUM("1,5×12÷5")),
  [K(4, 7, 'q1')]: R(NUM("540÷4")),
  [K(4, 7, 'q2')]: R(NUM("910÷7")),
  [K(4, 7, 'q3')]: PICK(["cheaper","540÷4","910÷7"], ["A","B","EQ"]),
  [K(4, 8, 'q1')]: R(NUM("3,5÷12,5")),
  [K(4, 8, 'q2')]: R(NUM("3,5×20÷12,5")),
  [K(4, 8, 'q3')]: R(NUM("12,5×8,4÷3,5")),
  [K(4, 9, 'q1')]: PICK(["val","270×8÷6"], ["272","360","2160"]),
  [K(4, 9, 'q2')]: R(NUM("270×8÷6-272")),
  [K(4, 9, 'q3')]: R(NUM("6×495÷270")),
  [K(4, 10, 'q1')]: R(NUM("4,5×5÷3")),
  [K(4, 10, 'q2')]: R(NUM("4,5×8÷3")),
  [K(4, 10, 'q3')]: R(NUM("3×18÷4,5")),
  [K(5, 1, 'q1')]: R(NUM("300×15÷6")),
  [K(5, 1, 'q2')]: R(NUM("90×15÷6")),
  [K(5, 1, 'q3')]: R(NUM("2×15÷6")),
  [K(5, 1, 'q4')]: R(NUM("6×1000÷300")),
  [K(5, 1, 'q5')]: R(NUM("6×500÷120")),
  [K(5, 1, 'q6')]: PICK(["min","6×1000÷300","6×500÷120","6×450÷90","6×7÷2"], ["30","25","20"]),
  [K(5, 2, 'q1')]: R(NUM("15×250÷100")),
  [K(5, 2, 'q2')]: R(NUM("85×250÷100")),
  [K(5, 2, 'q3')]: R(NUM("40×250÷100")),
  [K(5, 2, 'q4')]: R(NUM("100×330÷55")),
  [K(5, 2, 'q5')]: R(NUM("45×600÷100")),
  [K(5, 3, 'q1')]: R(NUM("45×200÷150")),
  [K(5, 3, 'q2')]: R(NUM("45×90÷150")),
  [K(5, 3, 'q3')]: R(NUM("1710×60÷45")),
  [K(5, 3, 'q4')]: R(NUM("45×2850÷1710")),
  [K(5, 3, 'q5')]: R(NUM("150×75÷45")),
  [K(5, 4, 'q1')]: R(NUM("18×150÷60")),
  [K(5, 4, 'q2')]: R(NUM("60×63÷18")),
  [K(5, 4, 'q3')]: R(NUM("60×54÷18")),
  [K(5, 4, 'q4')]: R(NUM("18×240÷60")),
  [K(5, 4, 'q5')]: PICK(["le","18×240÷60","54"], ["YES","NO"]),
  [K(5, 5, 'q1')]: R(NUM("7,5×8÷3")),
  [K(5, 5, 'q2')]: R(NUM("7,5×14÷3")),
  [K(5, 5, 'q3')]: R(NUM("1260÷4,5")),
  [K(5, 5, 'q4')]: R(NUM("1260×20÷4,5")),
  [K(5, 5, 'q5')]: R(NUM("3×9800÷280÷7,5")),
  [K(5, 6, 'q1')]: R(NUM("4×25÷10")),
  [K(5, 6, 'q2')]: R(NUM("4×35÷10")),
  [K(5, 6, 'q3')]: R(NUM("10×9,6÷4")),
  [K(5, 6, 'q4')]: R(NUM("4×50÷10")),
  [K(5, 6, 'q5')]: PICK(["le","4×50÷10×2","30"], ["YES","NO"]),
  [K(5, 7, 'q1')]: R(NUM("4,5×135÷90")),
  [K(5, 7, 'q2')]: R(NUM("4,5×300÷90")),
  [K(5, 7, 'q3')]: R(NUM("90×12÷4,5")),
  [K(5, 7, 'q4')]: R(NUM("90÷4,5")),
  [K(5, 8, 'q1')]: PICK(["eqx","85×36÷1"], ["1 × 85 = 36 × x","1 × x = 85 × 36","x × 36 = 85 × 1"]),
  [K(5, 8, 'q2')]: R(NUM("85×36÷1")),
  [K(5, 8, 'q3')]: R(NUM("85×5÷1")),
  [K(5, 8, 'q4')]: R(NUM("1×1700÷85")),
  [K(5, 9, 'q1')]: R(NUM("30×80÷48")),
  [K(5, 9, 'q2')]: R(NUM("30×120÷48")),
  [K(5, 9, 'q3')]: R(NUM("48×100÷30")),
  [K(5, 9, 'q4')]: PICK(["le","30×170÷48","100"], ["YES","NO"]),
  [K(5, 10, 'q1')]: R(NUM("24×20÷8")),
  [K(5, 10, 'q2')]: R(NUM("35×20÷7")),
  [K(5, 10, 'q3')]: R(NUM("8×90÷24")),
  [K(5, 10, 'q4')]: R(NUM("7×90÷35")),
  [K(5, 10, 'q5')]: PICK(["cheaper","8×90÷24","7×90÷35"], ["A","B","EQ"]),
};
