// Oracle du banc « majdulat-ihsaiya » au format BEM (unité 8 « الإحصاء », leçon 3 « استعمال المجدولات (Excel) لمعالجة
// وتلخيص معطيات إحصائية وتمثيلها بيانيًا », banque réécrite le 2026-10-08) — chaque réponse RECALCULÉE ici en
// rationnels exacts (helpers.mjs) à partir des nombres de l'ÉNONCÉ (séries V et grilles G ci-dessous, recopiées des
// tableaux, grilles de tableur et graphiques des feuilles), sans lire le contenu ni packages/core/arithmetic/statistics.js.
// Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Un PETIT TABLEUR indépendant évalue les دساتير des énoncés et des options :
//   evalF(grille, '=MAX(A1:G1)-MIN(A1:G1)')  → rationnel, ou null (texte sans « = », plage sans nombre, MODE sans répétition)
//   fonctions MAX, MIN, MOYENNE / AVERAGE, MEDIANE / MEDIAN, MODE ; plage « A1:G1 » (rectangle) ou « A1;G1 » (deux cellules) ;
//   comme Excel, une cellule vide ou de texte est ignorée.
// Une réponse « valeur d'un دستور » est vérifiée DEUX fois : evalF sur la grille ET l'indicateur calculé directement sur la
// série (chk lève une erreur s'ils diffèrent).
// Une option « quel دستور ? » : pickF évalue CHAQUE option sur la grille et exige qu'une seule donne la valeur attendue
// (calculée sans le tableur). Les options sur une colonne aléatoire (=ALEA(), exercice 24) sont évaluées sur une colonne
// simulée (générateur congruentiel fixe, SIM).
//   pickRange    l'unique plage dont les cellules sont exactement celles des données
//   pickCmd      l'unique Histogramme({bornes},{effectifs}) dont les deux listes sont celles de l'énoncé
//   pickClass    la classe de la médiane par les effectifs cumulés croissants
//   pickCell / pickBar   la cellule d'une valeur nommée ; la barre la plus haute
// Généré avec le banc par le script de l'auteur (Python, fractions exactes) ; ce calcul JS en est indépendant.
import { R, C, q } from './helpers.mjs';

const Qv = (x) => q(x);
const eqQ = (a, b) => a !== null && b !== null && q(a).sub(q(b)).isZero();
const ltQ = (a, b) => q(a).sub(q(b)).n < 0n;
const cmp = (a, b) => { const d = q(a).sub(q(b)); return d.isZero() ? 0 : (d.n < 0n ? -1 : 1); };
function chk(a, b) {
  if (!eqQ(a, b)) throw new Error(`majdulat-ihsaiya oracle : le tableur donne ${a}, le calcul direct ${b}`);
  return a;
}
const sumOf = (arr) => arr.reduce((s, x) => s.add(q(x)), q(0));
const mean = (arr) => sumOf(arr).div(arr.length);
const sortQ = (arr) => arr.map(Qv).sort(cmp);
function median(arr) {
  const s = sortQ(arr); const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : s[n / 2 - 1].add(s[n / 2]).div(2);
}
const maxOf = (arr) => sortQ(arr).at(-1);
const minOf = (arr) => sortQ(arr)[0];
const rng = (arr) => maxOf(arr).sub(minOf(arr));
function mode(arr) {
  const cnt = new Map();
  for (const x of arr) { const k = q(x).toString(); cnt.set(k, (cnt.get(k) ?? 0) + 1); }
  const best = Math.max(...cnt.values());
  const tops = [...cnt].filter(([, c]) => c === best);
  if (best < 2) return null;
  if (tops.length !== 1) throw new Error('majdulat-ihsaiya oracle : mode ambigu');
  return q(tops[0][0]);
}
const angle = (n, N) => q(n).div(q(N)).mul(360);
const weightedSum = (v, f) => v.reduce((s, x, i) => s.add(q(x).mul(q(f[i]))), q(0));
const weightedMean = (v, f) => weightedSum(v, f).div(sumOf(f));
/** La valeur qui manque à une série pour que sa moyenne soit m. */
const missingForMean = (others, m) => q(m).mul(others.length + 1).sub(sumOf(others));
/** Arrondi au plus proche à 10^-p (valeurs positives). */
function round(x, p) {
  const k = 10n ** BigInt(p); const v = q(x).mul(q(String(k)));
  let n = v.n / v.d; if ((v.n % v.d) * 2n >= v.d) n += 1n;
  return q(String(n)).div(q(String(k)));
}
const argMax = (arr) => arr.reduce((best, x, i) => (cmp(x, arr[best]) > 0 ? i : best), 0);
function moreChanged(before, after) {
  const dMean = mean(before).sub(mean(after)); const dMed = median(before).sub(median(after));
  const abs = (x) => (x.n < 0n ? x.neg() : x);
  return cmp(abs(dMean), abs(dMed)) > 0 ? 'mean' : 'median';
}

/* ── le petit tableur ──────────────────────────────────────────────────── */
const COLS = 'ABCDEFGHIJKLMNOP';
function split(ref) {
  const m = /^([A-P])(\d+)$/.exec(ref); if (!m) throw new Error(`cellule illisible ${ref}`);
  return [COLS.indexOf(m[1]), Number(m[2])];
}
function expand(range) {
  if (range.includes(';')) return range.split(';');
  if (!range.includes(':')) return [range];
  const [a, b] = range.split(':'); const [ca, ra] = split(a); const [cb, rb] = split(b);
  const out = [];
  for (let r = ra; r <= rb; r++) for (let c = ca; c <= cb; c++) out.push(`${COLS[c]}${r}`);
  return out;
}
const isNumText = (v) => typeof v === 'string' && /^-?\d+([.,]\d+)?$/.test(v);
const simVals = (grid, range) => expand(range).map((c) => grid[c]).filter(isNumText).map((v) => q(v.replace(',', '.')));
const FUN = { MAX: maxOf, MIN: minOf, MOYENNE: mean, AVERAGE: mean, MEDIANE: median, MEDIAN: median, MODE: mode };
function evalF(grid, f) {
  if (!f.startsWith('=')) return null; // sans « = » : du texte, rien n'est calculé
  const body = f.slice(1);
  const terms = [...body.matchAll(/([+-]?)([A-Z]+)\(([^)]*)\)/g)];
  if (terms.map((t) => t[0]).join('') !== body) throw new Error(`formule illisible ${f}`);
  let tot = q(0);
  for (const [, sign, name, arg] of terms) {
    const v = simVals(grid, arg);
    if (!v.length) return null;
    const r = FUN[name](v);
    if (r === null) return null;
    tot = sign === '-' ? tot.sub(r) : tot.add(r);
  }
  return tot;
}
const cell = (grid, ref) => q(grid[ref].replace(',', '.'));
const cellsOf = (grid) => Object.keys(grid).filter((c) => isNumText(grid[c]));
const numCellsOf = (grid, col) => cellsOf(grid).filter((c) => c.startsWith(col));
const columnRun = (col, start, n) => Array.from({ length: n }, (_, i) => `${col}${start + i}`);
const sameArr = (a, b) => a.length === b.length && a.every((x, i) => eqQ(x, b[i]));
const sameSet = (a, b) => a.length === b.length && [...a].sort().join() === [...b].sort().join();

function only(flags, letters) {
  const ok = letters.filter((_, i) => flags[i]);
  if (ok.length !== 1) throw new Error(`majdulat-ihsaiya oracle : ${ok.length} options justes (${ok.join(', ')})`);
  return C(ok[0]);
}
const pickF = (grid, opts, target) => only(Object.values(opts).map((f) => eqQ(evalF(grid, f), target)), Object.keys(opts));
const pickRange = (opts, cells) => only(Object.values(opts).map((r) => sameSet(expand(r), cells)), Object.keys(opts));
function pickCmd(opts, edges, freqs) {
  const parse = (s) => {
    const m = /^Histogramme\(\{([^}]*)\},\{([^}]*)\}\)$/.exec(s);
    return m ? [m[1].split(','), m[2].split(',')] : null;
  };
  // une classe par effectif : (nombre de bornes) = (nombre d'effectifs) + 1, bornes et effectifs de l'énoncé, dans l'ordre
  return only(Object.values(opts).map((s) => {
    const p = parse(s);
    return !!p && p[0].length === p[1].length + 1 && sameArr(p[0], edges) && sameArr(p[1], freqs);
  }), Object.keys(opts));
}
function pickClass(freqs) {
  const N = Number(sumOf(freqs).toString());
  const ranks = N % 2 ? [(N + 1) / 2] : [N / 2, N / 2 + 1];
  let cum = 0; const at = [];
  freqs.forEach((f, i) => { const lo = cum; cum += Number(f); for (const r of ranks) if (r > lo && r <= cum) at.push(i); });
  if (new Set(at).size !== 1) throw new Error('majdulat-ihsaiya oracle : médiane à cheval sur deux classes');
  return C('ABCDE'[at[0]]);
}
function pickCell(grid, opts, name, row) {
  const col = Object.keys(grid).find((c) => grid[c] === name).replace(/\d+$/, '');
  return only(Object.values(opts).map((o) => o === `${col}${row}`), Object.keys(opts));
}
function pickBar(opts, pairs) {
  const top = pairs[argMax(pairs.map((p) => q(p[1])))][0];
  return only(Object.values(opts).map((o) => o === top), Object.keys(opts));
}

/* ── colonnes simulées (=ALEA() de l'exercice 24, 25 valeurs à partir de A2) ── */
function lcg(seed) { let s = BigInt(seed); return () => { s = (s * 1103515245n + 12345n) % 2147483648n; return s; }; }
const SIM = (() => {
  const r1 = lcg(2026); const alea = {};
  for (let i = 1; i <= 50; i++) alea[`A${i}`] = `0.${String(r1() % 1000n).padStart(3, '0')}`; // 0 ≤ a < 1, comme =ALEA()
  const r2 = lcg(808); const col25 = { A1: 'القيم' };
  for (let i = 2; i <= 26; i++) col25[`A${i}`] = String(1n + (r2() % 99n));
  col25.A26 = '150'; // la dernière cellule porte le maximum : oublier A26 change l'étendue
  return { alea, col25 };
})();

/** Les séries des énoncés (recopiées des tableaux et des graphiques des feuilles). */
const V = {
  ex7: ["4", "10", "8", "4", "3", "2", "4"],
  l1_004: ["14", "9", "13", "15", "9"],
  l1_006: ["12", "20", "16", "8", "25", "18", "6"],
  l1_007: ["9,4", "10", "8,8", "9,6", "11,2", "9"],
  l2_003a: ["12", "7", "9", "15", "10", "8"],
  l2_003b: ["12", "7", "9", "45", "10", "8"],
  l2_004a: ["41", "43", "43", "40", "43", "41"],
  l2_004b: ["41", "43", "41", "40", "43", "41"],
  l2_005: ["98", "75", "70", "55", "30", "12", "3", "6", "34", "80", "102", "115"],
  l2_009: ["14", "9", "21", "17"],
  l2_010: ["85", "120", "96", "110", "74", "102", "88", "125"],
  l3_003a: ["9", "3", "7", "1", "5"],
  l3_003b: ["90", "3", "7", "1", "5"],
  l3_004: ["4", "17", "8", "4", "3", "2", "4"],
  l3_004b: ["4", "24", "8", "4", "3", "2", "4"],
  l3_005: ["-2", "3", "4", "-1", "0", "6", "4"],
  l3_006: ["12", "9", "15", "11", "8", "14", "10", "16", "13", "7", "12", "5"],
  l3_010: ["12", "15", "9", "21", "14", "10", "17", "22"],
  l4_001v: ["97", "104", "99"],
  l4_001f: ["2", "3", "5"],
  l4_002v: ["12", "15", "20"],
  l4_002f: ["3", "5", "2"],
  l4_003a: ["6", "8", "10", "4"],
  l4_003b: ["6", "8", "0", "10", "4", "0"],
  l4_004: ["4", "10", "8", "4", "3", "2", "1"],
  l5_001: ["310", "280", "240", "190", "170", "250", "380", "400", "290", "200", "240", "290"],
  l5_002: ["72", "54", "24", "30"],
  l5_003a: ["1200", "950", "870", "9100", "1030", "1640", "2360"],
  l5_003b: ["1200", "950", "870", "910", "1030", "1640", "2360"],
  l5_004: ["18", "22", "15", "25", "20", "12", "24", "24"],
  l5_005: ["320", "450", "280", "450", "510", "390", "450", "300", "420", "430"],
  l5_006a: ["44", "46", "45", "47", "43", "46", "44"],
  l5_006b: ["31", "29", "33", "30", "32", "34", "28"],
  l5_006c: ["35", "30", "38", "27", "36", "33", "32"],
  l5_007: ["850", "900", "820", "880", "950", "900", "840", "920", "900", "940"],
  l5_008: ["54", "61", "58", "65", "60", "62", "57", "63"],
  l5_009v: ["12", "15", "18", "20"],
  l5_009f: ["4", "7", "6", "3"],
  l5_010f: ["6", "14", "22", "12", "6"],
};

/** Les grilles des énoncés : cellule → valeur (nombre en chaîne, ou texte). */
const G = {
  ex7: {"A1": "4", "B1": "10", "C1": "8", "D1": "4", "E1": "3", "F1": "2", "G1": "4"},
  l1_002: {"A1": "التلميذ", "B1": "أنس", "C1": "ريم", "D1": "يونس", "E1": "سارة", "F1": "إلياس", "G1": "مريم", "A2": "الكتلة (kg)", "B2": "4,5", "C2": "5", "D2": "3,5", "E2": "6", "F2": "4", "G2": "5,5"},
  l1_004: {"A1": "14", "B1": "9", "C1": "13", "D1": "15", "E1": "9"},
  l1_006: {"A1": "12", "B1": "20", "C1": "16", "D1": "8", "E1": "25", "F1": "18", "G1": "6"},
  l1_007: {"A1": "التلميذ", "B1": "الزمن (s)", "A2": "1", "B2": "9,4", "A3": "2", "B3": "10", "A4": "3", "B4": "8,8", "A5": "4", "B5": "9,6", "A6": "5", "B6": "11,2", "A7": "6", "B7": "9"},
  l2_003a: {"A1": "12", "B1": "7", "C1": "9", "D1": "15", "E1": "10", "F1": "8"},
  l2_003b: {"A1": "12", "B1": "7", "C1": "9", "D1": "45", "E1": "10", "F1": "8"},
  l2_004a: {"A1": "41", "B1": "43", "C1": "43", "D1": "40", "E1": "43", "F1": "41"},
  l2_004b: {"A1": "41", "B1": "43", "C1": "41", "D1": "40", "E1": "43", "F1": "41"},
  l2_005: {"A1": "98", "B1": "75", "C1": "70", "D1": "55", "E1": "30", "F1": "12", "G1": "3", "H1": "6", "I1": "34", "J1": "80", "K1": "102", "L1": "115"},
  l2_009: {"A1": "14", "B1": "9", "C1": "21", "D1": "17"},
  l2_010: {"A1": "العامل", "B1": "الكمية (kg)", "A2": "1", "B2": "85", "A3": "2", "B3": "120", "A4": "3", "B4": "96", "A5": "4", "B5": "110", "A6": "5", "B6": "74", "A7": "6", "B7": "102", "A8": "7", "B8": "88", "A9": "8", "B9": "125"},
  l3_003a: {"A1": "9", "B1": "3", "C1": "7", "D1": "1", "E1": "5"},
  l3_003b: {"A1": "90", "B1": "3", "C1": "7", "D1": "1", "E1": "5"},
  l3_004: {"A1": "4", "B1": "17", "C1": "8", "D1": "4", "E1": "3", "F1": "2", "G1": "4"},
  l3_005: {"A1": "السبت", "B1": "الأحد", "C1": "الإثنين", "D1": "الثلاثاء", "E1": "الأربعاء", "F1": "الخميس", "G1": "الجمعة", "A2": "-2", "B2": "3", "C2": "4", "D2": "-1", "E2": "0", "F2": "6", "G2": "4"},
  l3_006: {"A1": "التلميذ", "B1": "العلامة", "A2": "1", "B2": "12", "A3": "2", "B3": "9", "A4": "3", "B4": "15", "A5": "4", "B5": "11", "A6": "5", "B6": "8", "A7": "6", "B7": "14", "A8": "7", "B8": "10", "A9": "8", "B9": "16", "A10": "9", "B10": "13", "A11": "10", "B11": "7", "A12": "11", "B12": "12", "A13": "12", "B13": "5"},
  l3_010: {"A1": "12", "B1": "15", "C1": "9", "D1": "21", "E1": "14", "F1": "10", "G1": "17", "H1": "22"},
  l4_001: {"A1": "97", "B1": "104", "C1": "99"},
  l4_003a: {"A1": "6", "B1": "8", "D1": "10", "E1": "4"},
  l4_003b: {"A1": "6", "B1": "8", "C1": "0", "D1": "10", "E1": "4", "F1": "0"},
  l4_004: {"A1": "4", "B1": "10", "C1": "8", "D1": "4", "E1": "3", "F1": "2", "G1": "1"},
  l5_001: {"A1": "الشهر", "B1": "الاستهلاك (kWh)", "A2": "جانفي", "B2": "310", "A3": "فيفري", "B3": "280", "A4": "مارس", "B4": "240", "A5": "أفريل", "B5": "190", "A6": "ماي", "B6": "170", "A7": "جوان", "B7": "250", "A8": "جويلية", "B8": "380", "A9": "أوت", "B9": "400", "A10": "سبتمبر", "B10": "290", "A11": "أكتوبر", "B11": "200", "A12": "نوفمبر", "B12": "240", "A13": "ديسمبر", "B13": "290"},
  l5_002: {"A1": "الزمرة الدموية", "B1": "O", "C1": "A", "D1": "B", "E1": "AB", "A2": "عدد المتبرعين", "B2": "72", "C2": "54", "D2": "24", "E2": "30"},
  l5_003a: {"A1": "السبت", "B1": "الأحد", "C1": "الإثنين", "D1": "الثلاثاء", "E1": "الأربعاء", "F1": "الخميس", "G1": "الجمعة", "A2": "1200", "B2": "950", "C2": "870", "D2": "9100", "E2": "1030", "F2": "1640", "G2": "2360"},
  l5_003b: {"A1": "السبت", "B1": "الأحد", "C1": "الإثنين", "D1": "الثلاثاء", "E1": "الأربعاء", "F1": "الخميس", "G1": "الجمعة", "A2": "1200", "B2": "950", "C2": "870", "D2": "910", "E2": "1030", "F2": "1640", "G2": "2360"},
  l5_004: {"A1": "18", "B1": "22", "C1": "15", "D1": "25", "E1": "20", "F1": "12", "G1": "24", "H1": "24"},
  l5_005: {"A1": "الرحلة", "B1": "الكمية (kg)", "A2": "1", "B2": "320", "A3": "2", "B3": "450", "A4": "3", "B4": "280", "A5": "4", "B5": "450", "A6": "5", "B6": "510", "A7": "6", "B7": "390", "A8": "7", "B8": "450", "A9": "8", "B9": "300", "A10": "9", "B10": "420", "A11": "10", "B11": "430"},
  l5_006: {"A1": "المحطة", "B1": "1", "C1": "2", "D1": "3", "E1": "4", "F1": "5", "G1": "6", "H1": "7", "A2": "بشار", "B2": "44", "C2": "46", "D2": "45", "E2": "47", "F2": "43", "G2": "46", "H2": "44", "A3": "النعامة", "B3": "31", "C3": "29", "D3": "33", "E3": "30", "F3": "32", "G3": "34", "H3": "28", "A4": "تندوف", "B4": "35", "C4": "30", "D4": "38", "E4": "27", "F4": "36", "G4": "33", "H4": "32"},
  l5_007: {"A1": "850", "B1": "900", "C1": "820", "D1": "880", "E1": "950", "F1": "900", "G1": "840", "H1": "920", "I1": "900", "J1": "940"},
  l5_008: {"A1": "54", "B1": "61", "C1": "58", "D1": "65", "E1": "60", "F1": "62", "G1": "57", "H1": "63"},
  l5_009: {"A1": "12", "B1": "15", "C1": "18", "D1": "20"},
};

export const ORACLE = {
  'ex-4am-majdulat-ihsaiya-l1-001:q1': pickRange({ A: "A1:F1", B: "A1:G1", C: "A1:A7", D: "A1:H1" }, cellsOf(G.ex7)),
  'ex-4am-majdulat-ihsaiya-l1-001:q2': R(cellsOf(G.ex7).length),
  'ex-4am-majdulat-ihsaiya-l1-002:q1': R(cell(G.l1_002, "D2")),
  'ex-4am-majdulat-ihsaiya-l1-002:q2': pickCell(G.l1_002, { A: "2G", B: "G1", C: "G2", D: "F2" }, "مريم", 2),
  'ex-4am-majdulat-ihsaiya-l1-003:q1': R(expand("B2:F2").length),
  'ex-4am-majdulat-ihsaiya-l1-003:q2': R(expand("A1:C4").length),
  'ex-4am-majdulat-ihsaiya-l1-004:q1': pickF(G.l1_004, { A: "MOYENNE(A1:E1)", B: "=MOYENNE(A1;E1)", C: "=MOYENNE(A1:E1)", D: "=MOYENNE(A1:D1)" }, mean(V.l1_004)),
  'ex-4am-majdulat-ihsaiya-l1-004:q2': R(chk(evalF(G.l1_004, "=MOYENNE(A1:E1)"), mean(V.l1_004))),
  'ex-4am-majdulat-ihsaiya-l1-005:q1': pickF(G.ex7, { A: "=MAX(A1:G1)-MIN(A1:G1)", B: "=MOYENNE(A1:G1)", C: "=MEDIANE(A1:G1)", D: "=MODE(A1:G1)" }, mean(V.ex7)),
  'ex-4am-majdulat-ihsaiya-l1-006:q1': R(chk(evalF(G.l1_006, "=MAX(A1:G1)-MIN(A1:G1)"), rng(V.l1_006))),
  'ex-4am-majdulat-ihsaiya-l1-006:q2': R(chk(evalF(G.l1_006, "=MOYENNE(A1:G1)"), mean(V.l1_006))),
  'ex-4am-majdulat-ihsaiya-l1-007:q1': pickRange({ A: "B1:B7", B: "A2:B7", C: "B2:B6", D: "B2:B7" }, numCellsOf(G.l1_007, "B")),
  'ex-4am-majdulat-ihsaiya-l1-007:q2': R(chk(evalF(G.l1_007, "=MAX(B2:B7)-MIN(B2:B7)"), rng(V.l1_007))),
  'ex-4am-majdulat-ihsaiya-l1-008:q1': C('B') /* قيم منفصلة → أعمدة */,
  'ex-4am-majdulat-ihsaiya-l1-009:q1': C('B') /* أجزاء من كلّ → دائري */,
  'ex-4am-majdulat-ihsaiya-l1-009:q2': R(angle("2000", "6000")),
  'ex-4am-majdulat-ihsaiya-l1-010:q1': C('A') /* فئات متلاصقة → مدرّج */,
  'ex-4am-majdulat-ihsaiya-l1-010:q2': pickCmd({ A: "Histogramme({7,8,9},{6,1,4})", B: "Histogramme({6,1,4},{7,8,9,10})", C: "Histogramme({7,8,9,10},{6,1,4})", D: "Histogramme({7,8,9,10},{4,1,6})" }, ["7", "8", "9", "10"], ["6", "1", "4"]),
  'ex-4am-majdulat-ihsaiya-l2-001:q1': R(chk(evalF(G.ex7, "=MAX(A1:G1)-MIN(A1:G1)"), rng(V.ex7))),
  'ex-4am-majdulat-ihsaiya-l2-001:q2': R(chk(evalF(G.ex7, "=MEDIANE(A1:G1)"), median(V.ex7))),
  'ex-4am-majdulat-ihsaiya-l2-002:q1': R(chk(evalF(G.ex7, "=MOYENNE(A1:G1)"), mean(V.ex7))),
  'ex-4am-majdulat-ihsaiya-l2-002:q2': R(chk(evalF(G.ex7, "=MODE(A1:G1)"), mode(V.ex7))),
  'ex-4am-majdulat-ihsaiya-l2-003:q1': R(chk(evalF(G.l2_003a, "=MEDIANE(A1:F1)"), median(V.l2_003a))),
  'ex-4am-majdulat-ihsaiya-l2-003:q2': R(chk(evalF(G.l2_003b, "=MEDIANE(A1:F1)"), median(V.l2_003b))),
  'ex-4am-majdulat-ihsaiya-l2-004:q1': R(chk(evalF(G.l2_004a, "=MODE(A1:F1)"), mode(V.l2_004a))),
  'ex-4am-majdulat-ihsaiya-l2-004:q2': R(chk(evalF(G.l2_004b, "=MODE(A1:F1)"), mode(V.l2_004b))),
  'ex-4am-majdulat-ihsaiya-l2-005:q1': pickRange({ A: "A1:M1", B: "A1:A12", C: "A1:L1", D: "A1:K1" }, cellsOf(G.l2_005)),
  'ex-4am-majdulat-ihsaiya-l2-005:q2': R(chk(evalF(G.l2_005, "=MAX(A1:L1)-MIN(A1:L1)"), rng(V.l2_005))),
  'ex-4am-majdulat-ihsaiya-l2-006:q1': R(sumOf(["60", "40", "50"])),
  'ex-4am-majdulat-ihsaiya-l2-006:q2': R(angle("60", "150")),
  'ex-4am-majdulat-ihsaiya-l2-007:q1': R(angle("50", "150")),
  'ex-4am-majdulat-ihsaiya-l2-007:q2': R(chk(q(360).sub(angle("60", "150")).sub(angle("50", "150")), angle("40", "150"))),
  'ex-4am-majdulat-ihsaiya-l2-008:q1': R(angle("30", "120")),
  'ex-4am-majdulat-ihsaiya-l2-008:q2': R(angle("54", "120")),
  'ex-4am-majdulat-ihsaiya-l2-009:q1': R(chk(evalF(G.l2_009, "=MAX(A1:D1)-MIN(A1:D1)"), rng(V.l2_009))),
  'ex-4am-majdulat-ihsaiya-l2-009:q2': R(chk(evalF(G.l2_009, "=MEDIANE(A1:D1)"), median(V.l2_009))),
  'ex-4am-majdulat-ihsaiya-l2-010:q1': pickF(G.l2_010, { A: "=MOYENNE(A2:B9)", B: "=MEDIANE(B2:B9)", C: "MOYENNE(B2:B9)", D: "=MOYENNE(B2:B9)" }, mean(V.l2_010)),
  'ex-4am-majdulat-ihsaiya-l2-010:q2': R(chk(evalF(G.l2_010, "=MOYENNE(B2:B9)"), mean(V.l2_010))),
  'ex-4am-majdulat-ihsaiya-l3-001:q1': R(round(evalF(G.ex7, "=MOYENNE(A1:F1)"), 2)),
  'ex-4am-majdulat-ihsaiya-l3-001:q3': pickF(G.ex7, { A: "=MEDIANE(A1:G1)", B: "MOYENNE(A1:G1)", C: "=MOYENNE(A1:G1)", D: "=MOYENNE(B1:G1)" }, mean(V.ex7)),
  'ex-4am-majdulat-ihsaiya-l3-002:q1': R(chk(evalF(G.ex7, "=MAX(A1:G1)"), maxOf(V.ex7))),
  'ex-4am-majdulat-ihsaiya-l3-002:q2': C(eqQ(maxOf(V.ex7), rng(V.ex7)) ? "A" : "B"),
  'ex-4am-majdulat-ihsaiya-l3-002:q3': pickF(G.ex7, { A: "=MIN(A1:G1)-MAX(A1:G1)", B: "=MAX(A1:G1)-MIN(A1:G1)", C: "=MAX(A1:G1)-MEDIANE(A1:G1)", D: "MAX(A1:G1)-MIN(A1:G1)" }, rng(V.ex7)),
  'ex-4am-majdulat-ihsaiya-l3-003:q1': R(chk(evalF(G.l3_003a, "=MEDIANE(A1:E1)"), median(V.l3_003a))),
  'ex-4am-majdulat-ihsaiya-l3-003:q2': R(chk(evalF(G.l3_003b, "=MEDIANE(A1:E1)"), median(V.l3_003b))),
  'ex-4am-majdulat-ihsaiya-l3-003:q3': R(chk(evalF(G.l3_003b, "=MOYENNE(A1:E1)"), mean(V.l3_003b))),
  'ex-4am-majdulat-ihsaiya-l3-004:q1': R(chk(evalF(G.l3_004, "=MOYENNE(A1:G1)"), mean(V.l3_004))),
  'ex-4am-majdulat-ihsaiya-l3-004:q2': R(chk(evalF(G.l3_004, "=MEDIANE(A1:G1)"), median(V.l3_004))),
  'ex-4am-majdulat-ihsaiya-l3-004:q3': R(missingForMean(["4", "8", "4", "3", "2", "4"], "7")),
  'ex-4am-majdulat-ihsaiya-l3-005:q1': R(chk(evalF(G.l3_005, "=MAX(A2:G2)-MIN(A2:G2)"), rng(V.l3_005))),
  'ex-4am-majdulat-ihsaiya-l3-005:q2': R(chk(evalF(G.l3_005, "=MEDIANE(A2:G2)"), median(V.l3_005))),
  'ex-4am-majdulat-ihsaiya-l3-005:q3': R(chk(evalF(G.l3_005, "=MOYENNE(A2:G2)"), mean(V.l3_005))),
  'ex-4am-majdulat-ihsaiya-l3-005:q4': pickF(G.l3_005, { A: "=MAX(A2:G2)", B: "=MODE(A1:G1)", C: "=MEDIANE(A2:G2)", D: "=MODE(A2:G2)" }, mode(V.l3_005)),
  'ex-4am-majdulat-ihsaiya-l3-006:q1': pickF(G.l3_006, { A: "=MOYENNE(B2:B12)", B: "=MOYENNE(B2;B13)", C: "=MOYENNE(B2:B13)", D: "=MOYENNE(A2:B13)" }, mean(V.l3_006)),
  'ex-4am-majdulat-ihsaiya-l3-006:q2': R(chk(evalF(G.l3_006, "=MOYENNE(B2:B13)"), mean(V.l3_006))),
  'ex-4am-majdulat-ihsaiya-l3-006:q3': R(chk(evalF(G.l3_006, "=MEDIANE(B2:B13)"), median(V.l3_006))),
  'ex-4am-majdulat-ihsaiya-l3-007:q1': C(sameArr(["4", "8", "10"], ["4", "8", "7"]) ? "A" : "B"),
  'ex-4am-majdulat-ihsaiya-l3-007:q2': R(q("7")),
  'ex-4am-majdulat-ihsaiya-l3-007:q3': pickCmd({ A: "Histogramme({5,10,15,20},{4,8,10})", B: "Histogramme({5,10,15,20},{4,8,7})", C: "Histogramme({5,10,15},{4,8,7})", D: "Histogramme({4,8,7},{5,10,15,20})" }, ["5", "10", "15", "20"], ["4", "8", "7"]),
  'ex-4am-majdulat-ihsaiya-l3-008:q1': R(sumOf(["8", "9", "4", "6", "2", "1"])),
  'ex-4am-majdulat-ihsaiya-l3-008:q2': pickBar({ A: "30", B: "32", C: "36" }, [["30", "8"], ["32", "9"], ["33", "4"], ["34", "6"], ["35", "2"], ["36", "1"]]),
  'ex-4am-majdulat-ihsaiya-l3-008:q3': R(sumOf(["6", "2", "1"])),
  'ex-4am-majdulat-ihsaiya-l3-009:q1': C('B') /* فئات متلاصقة → مدرّج */,
  'ex-4am-majdulat-ihsaiya-l3-009:q2': pickCmd({ A: "Histogramme({2,3,4,5},{4,9,8,4})", B: "Histogramme({4,9,8,4},{2,3,4,5,6})", C: "Histogramme({2,3,4,5,6},{4,9,8,4})" }, ["2", "3", "4", "5", "6"], ["4", "9", "8", "4"]),
  'ex-4am-majdulat-ihsaiya-l3-009:q3': pickClass(["4", "9", "8", "4"]),
  'ex-4am-majdulat-ihsaiya-l3-010:q1': pickF(G.l3_010, { A: "=MEDIANE(A1:H1)", B: "=MOYENNE(A1:H1)", C: "=MODE(A1:H1)" }, chk(evalF(G.l3_010, "=AVERAGE(A1:H1)"), mean(V.l3_010))),
  'ex-4am-majdulat-ihsaiya-l3-010:q2': R(chk(evalF(G.l3_010, "=AVERAGE(A1:H1)"), mean(V.l3_010))),
  'ex-4am-majdulat-ihsaiya-l3-010:q3': R(chk(evalF(G.l3_010, "=MEDIAN(A1:H1)"), median(V.l3_010))),
  'ex-4am-majdulat-ihsaiya-l4-001:q1': R(weightedSum(V.l4_001v, V.l4_001f)),
  'ex-4am-majdulat-ihsaiya-l4-001:q2': R(weightedMean(V.l4_001v, V.l4_001f)),
  'ex-4am-majdulat-ihsaiya-l4-001:q3': C(eqQ(evalF(G.l4_001, "=MOYENNE(A1:C1)"), weightedMean(V.l4_001v, V.l4_001f)) ? "A" : "B"),
  'ex-4am-majdulat-ihsaiya-l4-002:q1': R(weightedSum(V.l4_002v, V.l4_002f)),
  'ex-4am-majdulat-ihsaiya-l4-002:q2': R(weightedMean(V.l4_002v, V.l4_002f)),
  'ex-4am-majdulat-ihsaiya-l4-002:q3': R(q(15).mul(6).sub(q(15).mul(5))),
  'ex-4am-majdulat-ihsaiya-l4-003:q1': R(chk(evalF(G.l4_003a, "=MOYENNE(A1:F1)"), mean(V.l4_003a))),
  'ex-4am-majdulat-ihsaiya-l4-003:q2': R(chk(round(evalF(G.l4_003b, "=MOYENNE(A1:F1)"), 2), round(mean(V.l4_003b), 2))),
  'ex-4am-majdulat-ihsaiya-l4-003:q3': R(chk(evalF(G.l4_003b, "=MEDIANE(A1:F1)"), median(V.l4_003b))),
  'ex-4am-majdulat-ihsaiya-l4-004:q1': R(chk(evalF(G.l4_004, "=MAX(A1:G1)-MIN(A1:G1)"), rng(V.l4_004))),
  'ex-4am-majdulat-ihsaiya-l4-004:q2': R(chk(evalF(G.l4_004, "=MEDIANE(A1:G1)"), median(V.l4_004))),
  'ex-4am-majdulat-ihsaiya-l4-004:q3': R(chk(round(evalF(G.l4_004, "=MOYENNE(A1:G1)"), 2), round(mean(V.l4_004), 2))),
  'ex-4am-majdulat-ihsaiya-l4-004:q4': R(chk(evalF(G.l4_004, "=MODE(A1:G1)"), mode(V.l4_004))),
  'ex-4am-majdulat-ihsaiya-l4-005:q1': R(angle("600", "2400")),
  'ex-4am-majdulat-ihsaiya-l4-005:q2': R(angle("1200", "2400")),
  'ex-4am-majdulat-ihsaiya-l4-005:q3': R(angle("1200", "3000")),
  'ex-4am-majdulat-ihsaiya-l4-006:q1': R(q(360).sub(150).sub(90)),
  'ex-4am-majdulat-ihsaiya-l4-006:q2': R(q(120).div(360).mul(72)),
  'ex-4am-majdulat-ihsaiya-l4-006:q3': R(q(150).div(360).mul(72)),
  'ex-4am-majdulat-ihsaiya-l4-007:q1': pickCmd({ A: "Histogramme({10,20,30,40},{2,7,4})", B: "Histogramme({10,20,30},{2,7,4})", C: "Histogramme({10,20,30,40},{4,7,2})", D: "Histogramme({2,7,4},{10,20,30,40})" }, ["10", "20", "30", "40"], ["2", "7", "4"]),
  'ex-4am-majdulat-ihsaiya-l4-007:q2': R(sumOf(["2", "7", "4"])),
  'ex-4am-majdulat-ihsaiya-l4-007:q3': pickClass(["2", "7", "4"]),
  'ex-4am-majdulat-ihsaiya-l4-008:q1': pickF(SIM.alea, { A: "=MOYENNE(A1:A50)", B: "MEDIANE(A1:A50)", C: "=MEDIANE(A1:A50)", D: "=MEDIANE(A1:G1)" }, median(simVals(SIM.alea, "A1:A50"))),
  'ex-4am-majdulat-ihsaiya-l4-008:q2': C(ltQ(rng(simVals(SIM.alea, "A1:A50")), q(1)) ? "C" : "A") /* 0 ≤ a < 1 pour chaque cellule ⇒ max − min < 1 ; contrôlé sur une colonne simulée */,
  'ex-4am-majdulat-ihsaiya-l4-009:q1': R(q(60).sub(18).sub(27)),
  'ex-4am-majdulat-ihsaiya-l4-009:q2': R(angle("18", "60")),
  'ex-4am-majdulat-ihsaiya-l4-009:q3': R(angle("27", "60")),
  'ex-4am-majdulat-ihsaiya-l4-009:q4': R(angle("15", "60")),
  'ex-4am-majdulat-ihsaiya-l4-009:q5': C('C') /* أجزاء من كلّ → دائري */,
  'ex-4am-majdulat-ihsaiya-l4-010:q1': pickRange({ A: "A1:A26", B: "A2:A26", C: "A2:A25", D: "A1:A25" }, columnRun("A", 2, 25)),
  'ex-4am-majdulat-ihsaiya-l4-010:q2': pickF(SIM.col25, { A: "=MAX(A2:A25)-MIN(A2:A25)", B: "=MAX(A2:A26)", C: "=MAX(A2:A26)-MIN(A2:A26)", D: "=MIN(A2:A26)-MAX(A2:A26)" }, rng(simVals(SIM.col25, "A2:A26"))),
  'ex-4am-majdulat-ihsaiya-l4-010:q3': R(expand("A2:A27").length),
  'ex-4am-majdulat-ihsaiya-l5-001:q1': pickRange({ A: "B1:B13", B: "B2:B13", C: "A2:B13", D: "B2:B12" }, numCellsOf(G.l5_001, "B")),
  'ex-4am-majdulat-ihsaiya-l5-001:q2': pickF(G.l5_001, { A: "=MEDIANE(B2:B13)", B: "=MOYENNE(B2:B12)", C: "MOYENNE(B2:B13)", D: "=MOYENNE(B2:B13)" }, mean(V.l5_001)),
  'ex-4am-majdulat-ihsaiya-l5-001:q3': R(chk(evalF(G.l5_001, "=MAX(B2:B13)-MIN(B2:B13)"), rng(V.l5_001))),
  'ex-4am-majdulat-ihsaiya-l5-001:q4': R(chk(evalF(G.l5_001, "=MEDIANE(B2:B13)"), median(V.l5_001))),
  'ex-4am-majdulat-ihsaiya-l5-001:q5': R(chk(evalF(G.l5_001, "=MOYENNE(B2:B13)"), mean(V.l5_001))),
  'ex-4am-majdulat-ihsaiya-l5-001:q6': R(mean(V.l5_001).mul(12)),
  'ex-4am-majdulat-ihsaiya-l5-001:q7': R(mean(V.l5_001).mul(12).mul("4.5")),
  'ex-4am-majdulat-ihsaiya-l5-002:q1': R(angle("72", "180")),
  'ex-4am-majdulat-ihsaiya-l5-002:q2': R(angle("54", "180")),
  'ex-4am-majdulat-ihsaiya-l5-002:q3': R(angle("24", "180")),
  'ex-4am-majdulat-ihsaiya-l5-002:q4': R(angle("30", "180")),
  'ex-4am-majdulat-ihsaiya-l5-002:q5': C('B') /* أجزاء من كلّ → دائري */,
  'ex-4am-majdulat-ihsaiya-l5-002:q6': R(chk(evalF(G.l5_002, "=MAX(B2:E2)-MIN(B2:E2)"), rng(V.l5_002))),
  'ex-4am-majdulat-ihsaiya-l5-002:q7': R(q(72).div(180).mul(100)),
  'ex-4am-majdulat-ihsaiya-l5-003:q1': R(chk(evalF(G.l5_003a, "=MOYENNE(A2:G2)"), mean(V.l5_003a))),
  'ex-4am-majdulat-ihsaiya-l5-003:q2': R(chk(evalF(G.l5_003a, "=MEDIANE(A2:G2)"), median(V.l5_003a))),
  'ex-4am-majdulat-ihsaiya-l5-003:q3': R(chk(evalF(G.l5_003b, "=MOYENNE(A2:G2)"), mean(V.l5_003b))),
  'ex-4am-majdulat-ihsaiya-l5-003:q4': R(chk(evalF(G.l5_003b, "=MEDIANE(A2:G2)"), median(V.l5_003b))),
  'ex-4am-majdulat-ihsaiya-l5-003:q5': C(moreChanged(V.l5_003a, V.l5_003b) === "mean" ? "B" : "A"),
  'ex-4am-majdulat-ihsaiya-l5-003:q6': R(mean(V.l5_003b).mul(7)),
  'ex-4am-majdulat-ihsaiya-l5-003:q7': R(mean(V.l5_003b).mul(7).mul(100)),
  'ex-4am-majdulat-ihsaiya-l5-004:q1': R(chk(evalF(G.l5_004, "=MOYENNE(A1:H1)"), mean(V.l5_004))),
  'ex-4am-majdulat-ihsaiya-l5-004:q2': R(chk(evalF(G.l5_004, "=MEDIANE(A1:H1)"), median(V.l5_004))),
  'ex-4am-majdulat-ihsaiya-l5-004:q3': R(chk(evalF(G.l5_004, "=MODE(A1:H1)"), mode(V.l5_004))),
  'ex-4am-majdulat-ihsaiya-l5-004:q4': R(chk(evalF(G.l5_004, "=MAX(A1:H1)-MIN(A1:H1)"), rng(V.l5_004))),
  'ex-4am-majdulat-ihsaiya-l5-004:q5': R(mean(V.l5_004).mul(8)),
  'ex-4am-majdulat-ihsaiya-l5-004:q6': R(mean(V.l5_004).mul(8).mul(5000).mul("0.8")),
  'ex-4am-majdulat-ihsaiya-l5-005:q1': pickF(G.l5_005, { A: "=MAX(B2:B11)", B: "=MODE(B2:B11)", C: "=MODE(A2:A11)", D: "=MEDIANE(B2:B11)" }, mode(V.l5_005)),
  'ex-4am-majdulat-ihsaiya-l5-005:q2': R(chk(evalF(G.l5_005, "=MOYENNE(B2:B11)"), mean(V.l5_005))),
  'ex-4am-majdulat-ihsaiya-l5-005:q3': R(chk(evalF(G.l5_005, "=MEDIANE(B2:B11)"), median(V.l5_005))),
  'ex-4am-majdulat-ihsaiya-l5-005:q4': R(mean(V.l5_005).mul(10)),
  'ex-4am-majdulat-ihsaiya-l5-005:q5': R(mean(V.l5_005).mul(10).mul(250).mul("0.8")),
  'ex-4am-majdulat-ihsaiya-l5-006:q1': pickF(G.l5_006, { A: "=MAX(B2:H2)-MIN(B2:H2)", B: "=MAX(B3:H3)", C: "=MAX(B3:H3)-MIN(B3:H3)", D: "=MIN(B3:H3)-MAX(B3:H3)" }, rng(V.l5_006b)),
  'ex-4am-majdulat-ihsaiya-l5-006:q2': R(chk(evalF(G.l5_006, "=MAX(B2:H2)-MIN(B2:H2)"), rng(V.l5_006a))),
  'ex-4am-majdulat-ihsaiya-l5-006:q3': R(chk(evalF(G.l5_006, "=MAX(B4:H4)-MIN(B4:H4)"), rng(V.l5_006c))),
  'ex-4am-majdulat-ihsaiya-l5-006:q4': R(chk(evalF(G.l5_006, "=MOYENNE(B2:H2)"), mean(V.l5_006a))),
  'ex-4am-majdulat-ihsaiya-l5-006:q5': R(chk(evalF(G.l5_006, "=MOYENNE(B4:H4)"), mean(V.l5_006c))),
  'ex-4am-majdulat-ihsaiya-l5-006:q6': C(["A", "B", "C"][argMax([rng(V.l5_006a), rng(V.l5_006b), rng(V.l5_006c)])]),
  'ex-4am-majdulat-ihsaiya-l5-007:q1': R(chk(evalF(G.l5_007, "=MAX(A1:J1)-MIN(A1:J1)"), rng(V.l5_007))),
  'ex-4am-majdulat-ihsaiya-l5-007:q2': R(chk(evalF(G.l5_007, "=MOYENNE(A1:J1)"), mean(V.l5_007))),
  'ex-4am-majdulat-ihsaiya-l5-007:q3': pickF(G.l5_007, { A: "=MEDIANE(A1:J1)", B: "=MOYENNE(A1:J1)", C: "=MEDIANE(A1;J1)" }, median(V.l5_007)),
  'ex-4am-majdulat-ihsaiya-l5-007:q4': R(chk(evalF(G.l5_007, "=MEDIANE(A1:J1)"), median(V.l5_007))),
  'ex-4am-majdulat-ihsaiya-l5-007:q5': C(ltQ(mean(V.l5_007), median(V.l5_007)) ? "A" : "B"),
  'ex-4am-majdulat-ihsaiya-l5-007:q6': R(median(V.l5_007).sub(mean(V.l5_007)).mul(120)),
  'ex-4am-majdulat-ihsaiya-l5-008:q1': pickF(G.l5_008, { A: "=MOYENNE(A1:G1)", B: "MOYENNE(A1:H1)", C: "=MEDIANE(A1:H1)", D: "=MOYENNE(A1:H1)" }, mean(V.l5_008)),
  'ex-4am-majdulat-ihsaiya-l5-008:q2': R(chk(evalF(G.l5_008, "=MOYENNE(A1:H1)"), mean(V.l5_008))),
  'ex-4am-majdulat-ihsaiya-l5-008:q3': R(mean(V.l5_008).div(10).mul(15).mul(950)),
  'ex-4am-majdulat-ihsaiya-l5-009:q1': R(sumOf(V.l5_009f)),
  'ex-4am-majdulat-ihsaiya-l5-009:q2': R(weightedSum(V.l5_009v, V.l5_009f)),
  'ex-4am-majdulat-ihsaiya-l5-009:q3': R(weightedMean(V.l5_009v, V.l5_009f)),
  'ex-4am-majdulat-ihsaiya-l5-009:q4': C(eqQ(evalF(G.l5_009, "=MOYENNE(A1:D1)"), weightedMean(V.l5_009v, V.l5_009f)) ? "A" : "B"),
  'ex-4am-majdulat-ihsaiya-l5-009:q5': R(weightedSum(V.l5_009v, V.l5_009f).mul(30).mul(70)),
  'ex-4am-majdulat-ihsaiya-l5-010:q1': pickCmd({ A: "Histogramme({2,2.5,3,3.5,4,4.5},{6,14,22,12,6})", B: "Histogramme({2,2.5,3,3.5,4},{6,14,22,12,6})", C: "Histogramme({6,14,22,12,6},{2,2.5,3,3.5,4,4.5})", D: "Histogramme({2,2.5,3,3.5,4,4.5},{6,12,22,14,6})" }, ["2", "2.5", "3", "3.5", "4", "4.5"], ["6", "14", "22", "12", "6"]),
  'ex-4am-majdulat-ihsaiya-l5-010:q2': R(sumOf(V.l5_010f)),
  'ex-4am-majdulat-ihsaiya-l5-010:q3': pickClass(["6", "14", "22", "12", "6"]),
  'ex-4am-majdulat-ihsaiya-l5-010:q4': R(q(6).div(sumOf(V.l5_010f)).mul(100)),
};
