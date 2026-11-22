// Oracle du banc « muqarana-nisbiya » (مقارنة وترتيب أعداد نسبية, 2AM, 2026-10-21) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل … »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, en arithmétique indépendante sur les DÉCIMAUX :
//  - un nombre relatif écrit « -1,91 » devient un BigInt à l'échelle 10^6 (aucun flottant) ; comparer, ranger, borner,
//    arrondir à l'entier sont des opérations sur ces BigInt ;
//  - « plus petit / plus grand » d'une liste, « k-ième dans l'ordre », « combien sont < x » : recalculés sur la liste
//    retapée ici ; « entiers strictement entre a et b », « plus grand entier < x », « entier le plus proche » : par
//    balayage des entiers, jamais par une formule d'arrondi ;
//  - un QCM n'a qu'un seul choix juste : chaque option est retapée en texte (« -1,91 < -1,9 », « -4,4 », « -2,5|-0,3 »)
//    et décidée par comparaison — une chaîne de rangement est juste si ses nombres sont, dans l'ordre, ceux de la liste
//    triée ET si son symbole (< pour croissant, > pour décroissant) correspond au sens demandé ; l'inégalité est toujours
//    STRICTE (une borne exclue n'est jamais « entre »).
// Les questions selfCheck (« برّر ») n'ont pas de clé et ne figurent pas ici.
import { R, C } from './helpers.mjs';

/* ── décimaux exacts : valeur × 10^6 en BigInt ── */
const SC = 10n ** 6n;
const D = (s) => {
  const m = /^(-)?(\d+)(?:,(\d{1,6}))?$/.exec(String(s).trim());
  if (!m) throw new Error(`nombre illisible « ${s} »`);
  const v = BigInt(m[2]) * SC + BigInt((m[3] ?? '').padEnd(6, '0') || '0');
  return m[1] ? -v : v;
};
const txt = (v) => {
  const neg = v < 0n; const a = neg ? -v : v;
  const i = a / SC; const f = String(a % SC).padStart(6, '0').replace(/0+$/, '');
  return `${neg ? '-' : ''}${i}${f ? `,${f}` : ''}`;
};
const abs = (v) => (v < 0n ? -v : v);
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const isInt = (v) => v % SC === 0n;
const sorted = (xs, dir) => [...xs.map(D)].sort((a, b) => (dir === 'asc' ? cmp(a, b) : cmp(b, a)));
const onlyOne = (hits, what) => { if (hits.length !== 1) throw new Error(`${what} : ${hits.length} réponses`); return hits[0]; };

export const MIN = (...xs) => txt(sorted(xs, 'asc')[0]);
export const MAX = (...xs) => txt(sorted(xs, 'desc')[0]);
const ABS = (s) => txt(abs(D(s)));
const NEGOF = (s) => txt(-abs(D(s)));
const NTH = (k, dir, ...xs) => txt(sorted(xs, dir)[k - 1]);
const COUNTLT = (x, ...xs) => String(xs.filter((v) => D(v) < D(x)).length);
const COUNTGT = (x, ...xs) => String(xs.filter((v) => D(v) > D(x)).length);
const DISTINCT = (...xs) => String(new Set(xs.map((v) => D(v))).size);
const closest = (xs, far) => {
  const vs = xs.map(D); const t = (far ? vs.map(abs).sort(cmp).at(-1) : vs.map(abs).sort(cmp)[0]);
  return txt(onlyOne(vs.filter((v) => abs(v) === t), `${far ? 'plus loin' : 'plus proche'} de 0 dans ${xs}`));
};
const CLOSEST0 = (...xs) => closest(xs, false);
/** entiers n tels que lo < n < hi (strict), par balayage */
const intsBetween = (lo, hi) => { const out = []; for (let n = D(lo) / SC - 2n; n <= D(hi) / SC + 2n; n++) if (D(lo) < n * SC && n * SC < D(hi)) out.push(n); return out; };
const COUNT = (lo, hi) => String(intsBetween(lo, hi).length);
const COUNTSTEP = (lo, hi, step) => { let c = 0; for (let v = D(lo); v <= D(hi); v += D(step)) if (v > D(lo) && v < D(hi)) c++; return String(c); };
/** plus grand entier < x ; si x est entier la borne est exclue seulement avec strict */
const FLOOR = (x, strict = false) => { const v = D(x); if (isInt(v) && !strict) throw new Error(`${x} est entier`); let n = v / SC + 2n; while (n * SC >= v) n--; return String(n); };
const CEIL = (x, strict = false) => { const v = D(x); if (isInt(v) && !strict) throw new Error(`${x} est entier`); let n = v / SC - 2n; while (n * SC <= v) n++; return String(n); };
const NEAR = (x) => { const v = D(x); const cands = []; for (let n = v / SC - 2n; n <= v / SC + 2n; n++) cands.push(n); const d = cands.map((n) => abs(n * SC - v)); const best = d.reduce((a, b) => (a < b ? a : b)); return String(onlyOne(cands.filter((n, i) => d[i] === best), `entier le plus proche de ${x}`)); };

/* ── options de QCM ── */
const tokens = (s) => s.trim().split(/\s+/);
/** « a < b < c » : tous les couples voisins vérifient leur symbole */
const relHolds = (s) => { const t = tokens(s); if (t.length < 3 || t.length % 2 === 0) throw new Error(`relation illisible « ${s} »`); for (let i = 0; i + 2 < t.length + 0; i += 2) { const a = D(t[i]); const b = D(t[i + 2]); const op = t[i + 1]; if (!(op === '<' ? a < b : op === '>' ? a > b : op === '=' ? a === b : (() => { throw new Error(`symbole « ${op} »`); })())) return false; } return true; };
const ordHolds = (s, dir, xs) => {
  const t = tokens(s); const nums = t.filter((_, i) => i % 2 === 0); const ops = t.filter((_, i) => i % 2 === 1);
  if (ops.some((o) => o !== (dir === 'asc' ? '<' : '>'))) return false;
  const want = sorted(xs, dir);
  return nums.length === want.length && nums.every((n, i) => D(n) === want[i]);
};
const isNum = (s) => /^-?\d+(,\d+)?$/.test(s);
const optionTruth = (kind, text) => {
  if (kind === 'rel') return relHolds(text);
  if (kind === 'relFalse') return !relHolds(text);
  const [k, ...a] = kind;
  switch (k) {
    case 'ord': return ordHolds(text, a[0], a[1]);
    case 'argmin': return isNum(text) && D(text) === sorted(a[0], 'asc')[0];
    case 'argmax': return isNum(text) && D(text) === sorted(a[0], 'desc')[0];
    case 'closest0': return isNum(text) && D(text) === D(closest(a[0], false));
    case 'farthest0': return isNum(text) && D(text) === D(closest(a[0], true));
    case 'between': return isNum(text) && D(a[0]) < D(text) && D(text) < D(a[1]);
    case 'betweenPair': { const [lo, hi] = text.split('|'); return isNum(lo) && isNum(hi) && D(lo) < D(a[0]) && D(a[0]) < D(hi); }
    case 'exists': { const exists = D(a[0]) < D(a[1]); return text === 'YES' ? exists : text === 'NO' ? !exists : (() => { throw new Error(text); })(); }
    default: throw new Error(`genre « ${k} »`);
  }
};
const PICK = (kind, options) => {
  const hits = options.map((o, k) => (optionTruth(kind, o) ? k : -1)).filter((k) => k >= 0);
  if (hits.length !== 1) throw new Error(`QCM ${JSON.stringify(kind)} : ${hits.length} options justes parmi ${JSON.stringify(options)}`);
  return C('ABCDEF'[hits[0]]);
};

const L = 'ex-2am-muqarana-nisbiya';
const K = (lvl, n, q) => `${L}-l${lvl}-${String(n).padStart(3, '0')}:${q}`;

export const ORACLE = {
  [K(1, 1, 'q1')]: PICK("rel", ["-3 > 2","-3 < 2","2 < -3"]),
  [K(1, 1, 'q2')]: R(MIN('-4','0')),
  [K(1, 1, 'q3')]: PICK("rel", ["-1 < 0","-1 > 0","-1 = 0"]),
  [K(1, 2, 'q1')]: PICK("rel", ["3,6 < -2","3,6 = -2","3,6 > -2"]),
  [K(1, 2, 'q2')]: PICK("rel", ["-2 < -0,5","-2 > -0,5","-2 = -0,5"]),
  [K(1, 2, 'q3')]: R(MIN('-7,1','-0,5')),
  [K(1, 3, 'q1')]: PICK("rel", ["0,5 > 0,25","0,5 < 0,25","0,5 = 0,25"]),
  [K(1, 3, 'q2')]: R(MAX('1,09','1,9','1,19')),
  [K(1, 3, 'q3')]: R(MIN('0,7','0,07')),
  [K(1, 4, 'q1')]: PICK("rel", ["-5 > -3","-5 < -3","-3 < -5"]),
  [K(1, 4, 'q2')]: R(MIN('-5','-3')),
  [K(1, 4, 'q3')]: PICK(["ord","asc",["-5","-3","0"]], ["-5 < -3 < 0","0 < -3 < -5","-3 < -5 < 0"]),
  [K(1, 5, 'q1')]: PICK("rel", ["0 < -1,5","0 = -1,5","-1,5 < 0"]),
  [K(1, 5, 'q2')]: R(MAX('-1,5','0')),
  [K(1, 5, 'q3')]: R(MIN('0','1,5')),
  [K(1, 6, 'q1')]: R(ABS('-4,5')),
  [K(1, 6, 'q2')]: R(CLOSEST0('-2','-7')),
  [K(1, 6, 'q3')]: PICK("rel", ["-7 > -2","-2 < -7","-7 < -2"]),
  [K(1, 7, 'q1')]: PICK("rel", ["-8 > -3","-8 < -3","-3 < -8"]),
  [K(1, 7, 'q2')]: PICK("rel", ["5 < -9","-9 > 0","5 > -9"]),
  [K(1, 7, 'q3')]: PICK("rel", ["-2,5 < 1","-2,5 > 1","1 < -2,5"]),
  [K(1, 8, 'q1')]: PICK(["argmin",["-2,5","-1"]], ["-1","NONE","-2,5"]),
  [K(1, 8, 'q2')]: R(MAX('-2,5','-1')),
  [K(1, 8, 'q3')]: R(MAX('-0,5','-0,05')),
  [K(1, 9, 'q1')]: R(MIN('3,2','-1,4','0')),
  [K(1, 9, 'q2')]: R(MAX('-6','-0,6','-60')),
  [K(1, 9, 'q3')]: R(MAX('-3,5','0','-0,1')),
  [K(1, 10, 'q1')]: PICK(["argmin",["-6","-1,5"]], ["-1,5","-6","NONE"]),
  [K(1, 10, 'q2')]: PICK("rel", ["3,5 < -1,5","3,5 = -1,5","3,5 > -1,5"]),
  [K(1, 10, 'q3')]: R(MIN('3,5','-6','-1,5')),
  [K(2, 1, 'q1')]: PICK("rel", ["-1,91 > -1,9","-1,91 < -1,9","-1,91 = -1,9"]),
  [K(2, 1, 'q2')]: R(MAX('-1,9','-1,91')),
  [K(2, 2, 'q1')]: PICK("rel", ["-4,2 > -4","-4,2 = -4","-4,2 < -4"]),
  [K(2, 2, 'q2')]: R(MIN('-4','2,5','-1,5','-4,2')),
  [K(2, 2, 'q3')]: PICK(["farthest0",["-4","-4,2"]], ["-4","-4,2","NONE"]),
  [K(2, 3, 'q1')]: PICK("rel", ["-0,5 < -0,05","-0,5 > -0,05","-0,05 < -0,5"]),
  [K(2, 3, 'q2')]: R(MAX('-0,5','-0,05')),
  [K(2, 3, 'q3')]: PICK("rel", ["-0,3 > -0,29","-0,29 < -0,3","-0,3 < -0,29"]),
  [K(2, 4, 'q1')]: R(MAX('-2,35','-2,4','-2,305')),
  [K(2, 4, 'q2')]: R(MIN('-2,35','-2,4','-2,305')),
  [K(2, 4, 'q3')]: R(MAX('-2,35','-2,4')),
  [K(2, 5, 'q1')]: R(ABS('-8')),
  [K(2, 5, 'q2')]: PICK("rel", ["-8 < -5","-8 > -5","-5 < -8"]),
  [K(2, 5, 'q3')]: PICK(["argmin",["-8","-5","3"]], ["-5","-8","3"]),
  [K(2, 6, 'q1')]: PICK("relFalse", ["-3,05 < -3,5","-9,2 < -9,02","-0,41 < -0,4","-6 < 0"]),
  [K(2, 6, 'q2')]: PICK("rel", ["-2,7 > -2,07","-2,7 < -2,07","-2,7 = -2,07"]),
  [K(2, 6, 'q3')]: PICK("rel", ["-0,09 < -0,1","-0,09 = -0,1","-0,09 > -0,1"]),
  [K(2, 7, 'q1')]: PICK(["argmin",["-12,5","-12,05"]], ["-12,05","-12,5","NONE"]),
  [K(2, 7, 'q2')]: R(MAX('-12,5','-12,05')),
  [K(2, 7, 'q3')]: PICK("rel", ["-12,5 < -12,05","-12,5 > -12,05","-12,5 = -12,05"]),
  [K(2, 8, 'q1')]: PICK("rel", ["-3,4 < -3,41","-3,4 = -3,41","-3,4 > -3,41"]),
  [K(2, 8, 'q2')]: PICK("rel", ["-5,6 < -5,59","-5,6 > -5,59","-5,6 = -5,59"]),
  [K(2, 8, 'q3')]: PICK("rel", ["-0,8 < -0,80","-0,8 = -0,80","-0,8 > -0,80"]),
  [K(2, 9, 'q1')]: PICK("rel", ["-1,2 = -1,20","-1,2 < -1,20","-1,2 > -1,20"]),
  [K(2, 9, 'q2')]: R(DISTINCT('-1,2','-1,20','-1,02','-1,200')),
  [K(2, 9, 'q3')]: R(MAX('-1,02','-1,2')),
  [K(2, 10, 'q1')]: R(MIN('-3,4','-3,04')),
  [K(2, 10, 'q2')]: R(MAX('-3,4','-3,04')),
  [K(2, 10, 'q3')]: R(NEGOF('4,5')),
  [K(3, 1, 'q1')]: PICK(["ord","asc",["4,2","-3,5","-0,35","-3,05"]], ["4,2 > -0,35 > -3,05 > -3,5","-3,5 < -3,05 < -0,35 < 4,2","-0,35 < -3,05 < -3,5 < 4,2"]),
  [K(3, 1, 'q2')]: R(MAX('4,2','-3,5','-0,35','-3,05')),
  [K(3, 1, 'q3')]: R(NTH(3, 'asc', '4,2','-3,5','-0,35','-3,05')),
  [K(3, 2, 'q1')]: PICK(["ord","desc",["-1,9","-1,91","0","-1,09"]], ["-1,91 > -1,9 > -1,09 > 0","0 > -1,91 > -1,9 > -1,09","0 > -1,09 > -1,9 > -1,91","-1,09 > -1,9 > -1,91 > 0"]),
  [K(3, 2, 'q2')]: R(NTH(2, 'desc', '-1,9','-1,91','0','-1,09')),
  [K(3, 3, 'q1')]: PICK(["ord","asc",["-12,4","2,5","-3"]], ["-12,4 < -3 < 2,5","-3 < -12,4 < 2,5","2,5 > -3 > -12,4"]),
  [K(3, 3, 'q2')]: R(MIN('-12,4','2,5','-3')),
  [K(3, 3, 'q3')]: R(CLOSEST0('-12,4','2,5','-3')),
  [K(3, 4, 'q1')]: PICK(["ord","desc",["3","-1,5","-6","3,5"]], ["-6 > -1,5 > 3 > 3,5","3,5 > 3 > -1,5 > -6","3,5 > 3 > -6 > -1,5","3 > 3,5 > -1,5 > -6"]),
  [K(3, 4, 'q2')]: R(NTH(2, 'desc', '3','-1,5','-6','3,5')),
  [K(3, 4, 'q3')]: R(ABS(MIN('3','-1,5','-6','3,5'))),
  [K(3, 5, 'q1')]: PICK(["ord","asc",["-2,5","1,1","-0,25","0","-2,05"]], ["-0,25 < -2,05 < -2,5 < 0 < 1,1","0 < -0,25 < -2,05 < -2,5 < 1,1","-2,5 < -2,05 < -0,25 < 0 < 1,1","1,1 < 0 < -0,25 < -2,05 < -2,5"]),
  [K(3, 5, 'q2')]: R(NTH(3, 'asc', '-2,5','1,1','-0,25','0','-2,05')),
  [K(3, 5, 'q3')]: R(COUNTLT('-1', '-2,5','1,1','-0,25','0','-2,05')),
  [K(3, 6, 'q1')]: PICK(["ord","asc",["-2,4","-3,15","-3,5","6","3,2"]], ["-3,5 < -3,15 < -2,4 < 3,2 < 6","-2,4 < -3,15 < -3,5 < 3,2 < 6","6 > 3,2 > -2,4 > -3,15 > -3,5"]),
  [K(3, 6, 'q2')]: PICK(["argmin",["-2,4","-3,15","-3,5","6","3,2"]], ["-2,4","-3,5","-3,15"]),
  [K(3, 6, 'q3')]: R(COUNTLT('0', '-2,4','-3,15','-3,5','6','3,2')),
  [K(3, 7, 'q1')]: PICK(["betweenPair","-1"], ["-4|-2,5","-2,5|-0,3","-0,3|1"]),
  [K(3, 7, 'q2')]: PICK(["ord","asc",["-4","-2,5","-1","-0,3","1"]], ["-4 < -1 < -2,5 < -0,3 < 1","-4 < -2,5 < -0,3 < -1 < 1","-4 < -2,5 < -1 < -0,3 < 1"]),
  [K(3, 7, 'q3')]: PICK(["betweenPair","0,5"], ["-0,3|1","-2,5|-0,3","1|NONE"]),
  [K(3, 8, 'q1')]: PICK(["ord","asc",["-2","-5","4","-1"]], ["-1 < -2 < 4 < -5","-1 < -2 < -5 < 4","-5 < -2 < -1 < 4"]),
  [K(3, 8, 'q2')]: R(CLOSEST0('-2','-5','4','-1')),
  [K(3, 8, 'q3')]: R(MIN('-2','-5','4','-1')),
  [K(3, 9, 'q1')]: PICK(["ord","asc",["-1,9","-1,91","0","-1,09"]], ["-1,91 < -1,9 < -1,09 < 0","-1,9 < -1,91 < -1,09 < 0","0 < -1,09 < -1,9 < -1,91","-1,09 < -1,9 < -1,91 < 0"]),
  [K(3, 9, 'q2')]: R(COUNTLT('-1,5', '-1,9','-1,91','0','-1,09')),
  [K(3, 10, 'q1')]: PICK(["ord","desc",["3,5","-3,5","3,05","-3,05"]], ["3,5 > 3,05 > -3,5 > -3,05","3,5 > 3,05 > -3,05 > -3,5","-3,5 > -3,05 > 3,05 > 3,5"]),
  [K(3, 10, 'q2')]: R(MIN('3,5','-3,5','3,05','-3,05')),
  [K(3, 10, 'q3')]: PICK("rel", ["-3,5 < -3,05","-3,5 > -3,05","-3,05 < -3,5"]),
  [K(4, 1, 'q1')]: PICK(["between","-4,5","-4,3"], ["-4,6","-4,4","-4,3","-4,2"]),
  [K(4, 1, 'q2')]: PICK(["between","-0,4","-0,2"], ["-0,1","-0,4","-0,3","0,3"]),
  [K(4, 1, 'q3')]: R(COUNTSTEP('-4,5','-4,3','0,1')),
  [K(4, 2, 'q1')]: R(COUNT('-7','2')),
  [K(4, 2, 'q2')]: R(FLOOR('2', true)),
  [K(4, 2, 'q3')]: PICK(["between","-7","2"], ["-7","-6,5","2,5","-7,2"]),
  [K(4, 3, 'q1')]: R(FLOOR('-3,7')),
  [K(4, 3, 'q2')]: R(CEIL('-3,7')),
  [K(4, 3, 'q3')]: PICK("rel", ["-3 < -3,7 < -4","-3,7 < -3 < -4","-4 < -3,7 < -3"]),
  [K(4, 4, 'q1')]: R(COUNT('-3,5','2')),
  [K(4, 4, 'q2')]: R(COUNT('-5','-1,5')),
  [K(4, 4, 'q3')]: R(FLOOR('-0,5')),
  [K(4, 5, 'q1')]: R(COUNT('-9','-5')),
  [K(4, 5, 'q2')]: PICK(["between","-9","-5"], ["-6,5","-9","-4,5","-10"]),
  [K(4, 5, 'q3')]: PICK(["exists","-6","-5"], ["NO","YES"]),
  [K(4, 6, 'q1')]: R(NEAR('-2,6')),
  [K(4, 6, 'q2')]: R(NEAR('-4,2')),
  [K(4, 6, 'q3')]: R(NEAR('-0,8')),
  [K(4, 7, 'q1')]: PICK(["between","-2","1"], ["-2","-1,9","1","1,5"]),
  [K(4, 7, 'q2')]: PICK(["between","-0,5","0,5"], ["-0,5","0,5","0","-0,55"]),
  [K(4, 7, 'q3')]: R(CEIL('-4,2')),
  [K(4, 8, 'q1')]: PICK(["exists","-3","-2"], ["YES","NO"]),
  [K(4, 8, 'q2')]: PICK(["exists","-0,3","-0,2"], ["YES","NO"]),
  [K(4, 8, 'q3')]: PICK(["between","-0,3","-0,2"], ["-0,3","-0,25","-0,2","-0,35"]),
  [K(4, 9, 'q1')]: R(COUNT('-6','-2')),
  [K(4, 9, 'q2')]: PICK("rel", ["-3,5 < -6 < -2","-6 < -3,5 < -2","-6 < -2 < -3,5"]),
  [K(4, 9, 'q3')]: R(CEIL('-6', true)),
  [K(4, 10, 'q1')]: PICK("rel", ["-7 < -7,3 < -8","-8 < -7,3 < -7","-7,3 < -7 < -8"]),
  [K(4, 10, 'q2')]: R(CEIL('-7,3')),
  [K(4, 10, 'q3')]: R(COUNT('-7,3','-5,1')),
  [K(5, 1, 'q1')]: PICK("rel", ["7,48 > 7,5","7,48 < 7,5","7,48 = 7,5"]),
  [K(5, 1, 'q2')]: PICK("rel", ["7,052 > 7,5","7,052 = 7,5","7,052 < 7,5"]),
  [K(5, 1, 'q3')]: PICK(["ord","desc",["7,48","7,5","7,052","7,6"]], ["7,6 > 7,5 > 7,48 > 7,052","7,052 > 7,48 > 7,5 > 7,6","7,6 > 7,052 > 7,48 > 7,5"]),
  [K(5, 1, 'q4')]: R(COUNTLT('7,5', '7,48','7,5','7,052','7,6')),
  [K(5, 1, 'q5')]: R(COUNTLT('-2', '-1,5','-2,05','-2','-2,5')),
  [K(5, 1, 'q6')]: R(MIN('-1,5','-2,05','-2','-2,5')),
  [K(5, 1, 'q7')]: PICK("rel", ["-2,05 > -2","-2,05 < -2","-2,05 = -2"]),
  [K(5, 2, 'q1')]: PICK("rel", ["7,905 > 7,95","7,905 = 7,95","7,905 < 7,95"]),
  [K(5, 2, 'q2')]: PICK("rel", ["7,99 < 8","7,99 > 8","7,99 = 8"]),
  [K(5, 2, 'q3')]: PICK(["ord","asc",["7,95","7,905","8,05","7,99"]], ["7,95 < 7,99 < 7,905 < 8,05","7,905 < 7,95 < 7,99 < 8,05","8,05 > 7,99 > 7,95 > 7,905"]),
  [K(5, 2, 'q4')]: R(COUNTLT('8', '7,95','7,905','8,05','7,99')),
  [K(5, 2, 'q5')]: R(COUNTLT('-1,2', '-1,25','-1,2','-1,05','-1,3')),
  [K(5, 2, 'q6')]: R(MIN('-1,25','-1,2','-1,05','-1,3')),
  [K(5, 2, 'q7')]: PICK("rel", ["-1,25 > -1,2","-1,25 = -1,2","-1,25 < -1,2"]),
  [K(5, 3, 'q1')]: PICK(["ord","desc",["18,5","0","-45,5","-45,05","-45,6"]], ["18,5 > 0 > -45,05 > -45,5 > -45,6","18,5 > 0 > -45,6 > -45,5 > -45,05","-45,6 > -45,5 > -45,05 > 0 > 18,5"]),
  [K(5, 3, 'q2')]: R(NTH(4, 'desc', '18,5','0','-45,5','-45,05','-45,6')),
  [K(5, 3, 'q3')]: R(MIN('18,5','0','-45,5','-45,05','-45,6')),
  [K(5, 3, 'q4')]: R(COUNTLT('-45,3', '-45,5','-45,05','-45,6')),
  [K(5, 3, 'q5')]: PICK(["argmax",["-45,5","-45,05","-45,6"]], ["-45,5","-45,05","-45,6"]),
  [K(5, 4, 'q1')]: PICK(["ord","asc",["-4,5","-3,95","-4,05","3,5","8,2"]], ["-3,95 < -4,05 < -4,5 < 3,5 < 8,2","-4,5 < -4,05 < -3,95 < 3,5 < 8,2","8,2 > 3,5 > -3,95 > -4,05 > -4,5"]),
  [K(5, 4, 'q2')]: PICK(["argmin",["-4,5","-3,95","-4,05","3,5","8,2"]], ["-3,95","-4,05","-4,5"]),
  [K(5, 4, 'q3')]: R(COUNTLT('0', '-4,5','-3,95','-4,05','3,5','8,2')),
  [K(5, 4, 'q4')]: R(COUNTLT('-4', '-4,5','-3,95','-4,05','3,5','8,2')),
  [K(5, 4, 'q5')]: PICK("rel", ["-3,95 < -4","-3,95 = -4","-3,95 > -4"]),
  [K(5, 5, 'q1')]: PICK(["ord","desc",["4","-2,5","-6,05","-6,5"]], ["4 > -2,5 > -6,5 > -6,05","-6,5 > -6,05 > -2,5 > 4","4 > -2,5 > -6,05 > -6,5"]),
  [K(5, 5, 'q2')]: PICK(["argmin",["-6,5","-6,05"]], ["-6,5","-6,05","NONE"]),
  [K(5, 5, 'q3')]: PICK(["closest0",["-6,5","-6,05"]], ["-6,5","-6,05","NONE"]),
  [K(5, 5, 'q4')]: R(COUNT('-6,5','-2,5')),
  [K(5, 5, 'q5')]: PICK(["between","-6,5","-6,05"], ["-6,3","-6,5","-6,05","-6,6"]),
  [K(5, 6, 'q1')]: PICK(["ord","desc",["-3,2","-3,02","12,5","0","-3,25"]], ["12,5 > 0 > -3,02 > -3,2 > -3,25","12,5 > 0 > -3,25 > -3,2 > -3,02","-3,25 > -3,2 > -3,02 > 0 > 12,5"]),
  [K(5, 6, 'q2')]: R(MIN('-3,2','-3,02','12,5','0','-3,25')),
  [K(5, 6, 'q3')]: R(COUNTLT('0', '-3,2','-3,02','12,5','0','-3,25')),
  [K(5, 6, 'q4')]: R(COUNTLT('-3,1', '-3,2','-3,02','12,5','0','-3,25')),
  [K(5, 6, 'q5')]: PICK("rel", ["-3,02 < -3,1","-3,02 > -3,1","-3,02 = -3,1"]),
  [K(5, 7, 'q1')]: PICK(["ord","desc",["1,4","-0,6","0","-1,25","0,95"]], ["1,4 > 0,95 > 0 > -1,25 > -0,6","1,4 > 0,95 > 0 > -0,6 > -1,25","-1,25 > -0,6 > 0 > 0,95 > 1,4"]),
  [K(5, 7, 'q2')]: R(NTH(3, 'desc', '1,4','-0,6','0','-1,25','0,95')),
  [K(5, 7, 'q3')]: R(COUNTLT('0', '1,4','-0,6','0','-1,25','0,95')),
  [K(5, 7, 'q4')]: PICK(["argmin",["1,4","-0,6","0","-1,25","0,95"]], ["-0,6","-1,25","0"]),
  [K(5, 7, 'q5')]: R(NTH(2, 'asc', '1,4','-0,6','0','-1,25','0,95')),
  [K(5, 8, 'q1')]: PICK(["ord","asc",["0","-1,9","-1,91","-2,1"]], ["-1,9 < -1,91 < -2,1 < 0","0 > -1,9 > -1,91 > -2,1","-2,1 < -1,91 < -1,9 < 0"]),
  [K(5, 8, 'q2')]: R(MIN('0','-1,9','-1,91','-2,1')),
  [K(5, 8, 'q3')]: PICK("rel", ["-1,91 > -1,9","-1,91 < -1,9","-1,91 = -1,9"]),
  [K(5, 8, 'q4')]: R(COUNTGT('-2', '0','-1,9','-1,91','-2,1')),
  [K(5, 8, 'q5')]: PICK("rel", ["-2,1 < -2","-2,1 > -2","-2,1 = -2"]),
  [K(5, 9, 'q1')]: PICK(["ord","asc",["-8","-5,5","-5","3"]], ["-8 < -5,5 < -5 < 3","-5 < -5,5 < -8 < 3","3 > -5 > -5,5 > -8"]),
  [K(5, 9, 'q2')]: R(ABS('-8')),
  [K(5, 9, 'q3')]: PICK(["closest0",["-8","-5,5","-5","3"]], ["-8","-5","3"]),
  [K(5, 9, 'q4')]: PICK(["between","-5,5","-5"], ["-5,2","-5","-5,5","-5,6"]),
  [K(5, 9, 'q5')]: R(COUNT('-8','3')),
  [K(5, 10, 'q1')]: PICK(["ord","asc",["-12,5","-12,45","-12,05","-12,4"]], ["-12,05 < -12,4 < -12,45 < -12,5","-12,5 < -12,45 < -12,4 < -12,05","-12,05 > -12,4 > -12,45 > -12,5"]),
  [K(5, 10, 'q2')]: R(MIN('-12,5','-12,45','-12,05','-12,4')),
  [K(5, 10, 'q3')]: PICK("rel", ["-12,45 < -12,4","-12,45 > -12,4","-12,4 < -12,45"]),
  [K(5, 10, 'q4')]: R(COUNTGT('-12,3', '-12,5','-12,45','-12,05','-12,4')),
  [K(5, 10, 'q5')]: PICK("rel", ["-12,4 > -12,3","-12,4 = -12,3","-12,4 < -12,3"]),
};
