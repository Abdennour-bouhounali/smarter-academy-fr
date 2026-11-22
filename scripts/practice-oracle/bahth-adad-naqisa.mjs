// Oracle du banc « bahth-adad-naqisa » (البحث عن أعداد ناقصة, 1AM, 2026-10-30) — feuilles d'examen de فصل (« على منوال اختبار الفصل … »).
// Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, avec des RATIONNELS exacts en BigInt (n/d, aucun flottant, aucun import de packages/core ni du laboratoire).
// Chaque question est RETAPÉE ci-dessous (`SPECS`) à partir des nombres de l'énoncé :
//  - `solve`      le nombre manquant d'une machine de carte `op` (add « □ + a = b », sub « □ − a = b », rsub « a − □ = b », mul « a × □ = b ») : add → b − a ; sub → b + a ; rsub → a − b ; mul → b ÷ a ;
//  - `calc`       un calcul direct x ⊕ y (ou une somme de termes) ;
//  - `back`       un programme de plusieurs cartes REMONTÉ dans l'ordre inverse (chaque carte est inversée l'une après l'autre) ;
//  - `eq`         QCM : la seule égalité (rendue par l'oracle) qui traduit la situation `want` ;
//  - `calcchoice` QCM : le seul calcul x ⊕ y dont la valeur est le nombre manquant de `want` ;
//  - `verify`     QCM : le seul nombre v qui vérifie « a ⊕ v = b » (substitution) ;
//  - `tf`         vrai / faux : le nombre x vérifie-t-il « a ⊕ x = b » ?
// Chaque signature de misconception d'une réponse numérique est vérifiée DIFFÉRENTE de la clé. `audit(bank)` relit les fichiers : clé égale au calcul, une seule option juste,
// options (rendues par l'oracle) et signatures égales à celles retapées.
import { R, C } from './helpers.mjs';

const B = (v) => BigInt(v);
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const Q = (n, d = 1n) => { if (d === 0n) throw new Error('dénominateur nul'); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
const lit = (s) => {
  const t = String(s).replace(/\$/g, '').replace(/\{,\}/g, '.').replace(/,/g, '.').replace(/−/g, '-').trim();
  const fr = /^(-?\d+)\/(\d+)$/.exec(t);
  if (fr) return Q(B(fr[1]), B(fr[2]));
  const fx = /^\\frac\{(\d+)\}\{(\d+)\}$/.exec(t);
  if (fx) return Q(B(fx[1]), B(fx[2]));
  const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(t);
  if (!m) throw new Error(`illisible : ${s}`);
  const f = m[3] ?? '';
  const v = B(m[2] + f);
  return Q(m[1] ? -v : v, 10n ** B(f.length));
};
const add = (x, y) => Q(x.n * y.d + y.n * x.d, x.d * y.d);
const sub = (x, y) => Q(x.n * y.d - y.n * x.d, x.d * y.d);
const mul = (x, y) => Q(x.n * y.n, x.d * y.d);
const div = (x, y) => Q(x.n * y.d, x.d * y.n);
const eq = (x, y) => x.n === y.n && x.d === y.d;
/** Le décimal exact d'une fraction qui finit (sinon « n/d » irréductible) : « 4.7 », « 20/7 ». */
const key = (x) => {
  let d = x.d; for (const p of [2n, 5n]) while (d % p === 0n) d /= p;
  if (d !== 1n) return `${x.n}/${x.d}`;
  let k = 0n; while ((10n ** k) % x.d !== 0n) k++;
  const ng = x.n < 0n; const N = (ng ? -x.n : x.n) * (10n ** k / x.d);
  if (k === 0n) return `${ng ? '-' : ''}${N}`;
  const s = `${N}`.padStart(Number(k) + 1, '0');
  return `${ng ? '-' : ''}${s.slice(0, -Number(k))}.${s.slice(-Number(k))}`;
};
/** Le nombre pour KaTeX : « 4{,}7 » ou « \frac{20}{7} » (le signe d'un négatif n'est jamais produit ici). */
const tex = (x) => { const k = key(x); return k.includes('/') ? `\\frac{${x.n}}{${x.d}}` : k.replace('.', '{,}'); };

/** Le nombre manquant d'une machine et ce que la machine rend quand on lui donne x. */
const holeOf = (op, a, b) => ({ add: sub(b, a), sub: add(b, a), rsub: sub(a, b), mul: div(b, a) })[op];
const runOf = (op, a, x) => ({ add: add(x, a), sub: sub(x, a), rsub: sub(a, x), mul: mul(x, a) })[op];
/** L'égalité à trou rendue par l'oracle (les pos « second » mettent a avant □ pour add et mul). */
const eqTex = (op, a, b, pos = 'first') => {
  const [A, Bt] = [tex(lit(a)), tex(lit(b))];
  if (op === 'add') return pos === 'second' ? `${A}+\\square=${Bt}` : `\\square+${A}=${Bt}`;
  if (op === 'sub') return `\\square-${A}=${Bt}`;
  if (op === 'rsub') return `${A}-\\square=${Bt}`;
  if (op === 'mul') return pos === 'second' ? `${A}\\times \\square=${Bt}` : `\\square\\times ${A}=${Bt}`;
  throw new Error(op);
};
const SYM = { '+': '+', '-': '-', '×': '\\times ', '÷': '\\div ' };
const calcOf = (x, s, y) => ({ '+': add, '-': sub, '×': mul, '÷': div })[s](x, y);

/* ── énoncés retapés ── */
const SPECS = {
  "ex-1am-bahth-adad-naqisa-l1-001:q1": {"k":"eq","want":{"op":"mul","a":"8","b":"72"},"opts":[{"op":"rsub","a":"72","b":"8","pos":"first","misc":"WRONGEQ"},{"op":"mul","a":"8","b":"72","pos":"second","misc":null},{"op":"add","a":"8","b":"72","pos":"first","misc":"WRONGEQ"}]},
  "ex-1am-bahth-adad-naqisa-l1-001:q2": {"k":"eq","want":{"op":"rsub","a":"72","b":"8"},"opts":[{"op":"mul","a":"8","b":"72","pos":"second","misc":"WRONGEQ"},{"op":"rsub","a":"72","b":"8","pos":"first","misc":null},{"op":"sub","a":"8","b":"72","pos":"first","misc":"WRONGEQ"}]},
  "ex-1am-bahth-adad-naqisa-l1-001:q3": {"k":"eq","want":{"op":"add","a":"8","b":"72"},"opts":[{"op":"sub","a":"8","b":"72","pos":"first","misc":"WRONGEQ"},{"op":"mul","a":"8","b":"72","pos":"second","misc":"WRONGEQ"},{"op":"add","a":"8","b":"72","pos":"first","misc":null}]},
  "ex-1am-bahth-adad-naqisa-l1-002:q1": {"k":"solve","op":"add","a":"58","b":"130","sigs":[["188","MISC-NAQISA-SAMEOP"],["-72","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l1-002:q2": {"k":"solve","op":"sub","a":"9","b":"47","sigs":[["38","MISC-NAQISA-SAMEOP"],["47/9","MISC-NAQISA-FAMILY"]]},
  "ex-1am-bahth-adad-naqisa-l1-002:q3": {"k":"solve","op":"add","a":"6","b":"15","sigs":[["21","MISC-NAQISA-SAMEOP"],["-9","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l1-003:q1": {"k":"solve","op":"add","a":"16","b":"91","sigs":[["107","MISC-NAQISA-SAMEOP"],["-75","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l1-003:q2": {"k":"solve","op":"sub","a":"3,5","b":"9","sigs":[["5.5","MISC-NAQISA-SAMEOP"],["18/7","MISC-NAQISA-FAMILY"]]},
  "ex-1am-bahth-adad-naqisa-l1-003:q3": {"k":"solve","op":"mul","a":"5","b":"245","sigs":[["1225","MISC-NAQISA-MULAGAIN"],["1/49","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l1-003:q4": {"k":"solve","op":"rsub","a":"83","b":"58","sigs":[["141","MISC-NAQISA-TRAPADD"],["-25","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l1-004:q1": {"k":"solve","op":"sub","a":"18","b":"45","sigs":[["27","MISC-NAQISA-SAMEOP"],["2.5","MISC-NAQISA-FAMILY"]]},
  "ex-1am-bahth-adad-naqisa-l1-004:q2": {"k":"solve","op":"sub","a":"7","b":"120","sigs":[["113","MISC-NAQISA-SAMEOP"],["120/7","MISC-NAQISA-FAMILY"]]},
  "ex-1am-bahth-adad-naqisa-l1-004:q3": {"k":"solve","op":"sub","a":"26","b":"74","sigs":[["48","MISC-NAQISA-SAMEOP"],["37/13","MISC-NAQISA-FAMILY"]]},
  "ex-1am-bahth-adad-naqisa-l1-005:q1": {"k":"solve","op":"mul","a":"7","b":"63","sigs":[["441","MISC-NAQISA-MULAGAIN"],["1/9","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l1-005:q2": {"k":"solve","op":"mul","a":"12","b":"96","sigs":[["1152","MISC-NAQISA-MULAGAIN"],["0.125","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l1-005:q3": {"k":"solve","op":"mul","a":"5","b":"85","sigs":[["425","MISC-NAQISA-MULAGAIN"],["1/17","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l1-006:q1": {"k":"calcchoice","want":{"op":"add","a":"12","b":"40"},"opts":[{"x":"40","s":"+","y":"12","misc":"SAMEOP"},{"x":"12","s":"-","y":"40","misc":"REVSUB"},{"x":"40","s":"-","y":"12","misc":null}]},
  "ex-1am-bahth-adad-naqisa-l1-006:q2": {"k":"calcchoice","want":{"op":"sub","a":"15","b":"60"},"opts":[{"x":"60","s":"+","y":"15","misc":null},{"x":"60","s":"-","y":"15","misc":"SAMEOP"},{"x":"15","s":"-","y":"60","misc":"REVSUB"}]},
  "ex-1am-bahth-adad-naqisa-l1-006:q3": {"k":"calcchoice","want":{"op":"mul","a":"6","b":"54"},"opts":[{"x":"54","s":"×","y":"6","misc":"MULAGAIN"},{"x":"6","s":"÷","y":"54","misc":"DIVREV"},{"x":"54","s":"÷","y":"6","misc":null}]},
  "ex-1am-bahth-adad-naqisa-l1-007:q1": {"k":"tf","op":"rsub","a":"36","b":"11","x":"25","misc":null},
  "ex-1am-bahth-adad-naqisa-l1-007:q2": {"k":"tf","op":"add","a":"19","b":"66","x":"85","misc":"SAMEOP"},
  "ex-1am-bahth-adad-naqisa-l1-007:q3": {"k":"tf","op":"mul","a":"6","b":"54","x":"48","misc":"FAMILY"},
  "ex-1am-bahth-adad-naqisa-l1-008:q1": {"k":"solve","op":"mul","a":"7","b":"56","sigs":[["392","MISC-NAQISA-MULAGAIN"],["0.125","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l1-008:q2": {"k":"solve","op":"mul","a":"9","b":"63","sigs":[["567","MISC-NAQISA-MULAGAIN"],["1/7","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l1-008:q3": {"k":"solve","op":"mul","a":"11","b":"99","sigs":[["1089","MISC-NAQISA-MULAGAIN"],["1/9","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l1-008:q4": {"k":"solve","op":"mul","a":"4","b":"18","sigs":[["72","MISC-NAQISA-MULAGAIN"],["2/9","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l1-009:q1": {"k":"solve","op":"add","a":"12","b":"50","sigs":[["62","MISC-NAQISA-SAMEOP"],["-38","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l1-009:q2": {"k":"solve","op":"rsub","a":"85","b":"27","sigs":[["112","MISC-NAQISA-TRAPADD"],["-58","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l1-009:q3": {"k":"solve","op":"mul","a":"9","b":"63","sigs":[["567","MISC-NAQISA-MULAGAIN"],["1/7","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l1-010:q1": {"k":"solve","op":"rsub","a":"100","b":"64","sigs":[["164","MISC-NAQISA-TRAPADD"],["-36","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l1-010:q2": {"k":"solve","op":"rsub","a":"45","b":"19","sigs":[["64","MISC-NAQISA-TRAPADD"],["-26","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l1-010:q3": {"k":"solve","op":"rsub","a":"250","b":"175","sigs":[["425","MISC-NAQISA-TRAPADD"],["-75","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l2-001:q1": {"k":"solve","op":"rsub","a":"240","b":"175","sigs":[["415","MISC-NAQISA-TRAPADD"],["-65","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l2-001:q2": {"k":"solve","op":"add","a":"12,6","b":"30,1","sigs":[["42.7","MISC-NAQISA-SAMEOP"],["-17.5","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l2-001:q3": {"k":"solve","op":"mul","a":"8","b":"96","sigs":[["768","MISC-NAQISA-MULAGAIN"],["1/12","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l2-002:q1": {"k":"solve","op":"add","a":"8,75","b":"20,3","sigs":[["29.05","MISC-NAQISA-SAMEOP"],["-11.55","MISC-NAQISA-REVSUB"],["12.45","MISC-NAQISA-DECALIGN"]]},
  "ex-1am-bahth-adad-naqisa-l2-002:q2": {"k":"solve","op":"add","a":"6,4","b":"15","sigs":[["21.4","MISC-NAQISA-SAMEOP"],["-8.6","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l2-002:q3": {"k":"solve","op":"add","a":"0,45","b":"3","sigs":[["3.45","MISC-NAQISA-SAMEOP"],["-2.55","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l2-003:q1": {"k":"solve","op":"sub","a":"15,6","b":"32,85","sigs":[["17.25","MISC-NAQISA-SAMEOP"],["219/104","MISC-NAQISA-FAMILY"]]},
  "ex-1am-bahth-adad-naqisa-l2-003:q2": {"k":"solve","op":"sub","a":"0,75","b":"2,5","sigs":[["1.75","MISC-NAQISA-SAMEOP"],["10/3","MISC-NAQISA-FAMILY"]]},
  "ex-1am-bahth-adad-naqisa-l2-003:q3": {"k":"solve","op":"sub","a":"9,08","b":"10","sigs":[["0.92","MISC-NAQISA-SAMEOP"],["250/227","MISC-NAQISA-FAMILY"]]},
  "ex-1am-bahth-adad-naqisa-l2-004:q1": {"k":"solve","op":"mul","a":"6","b":"15","sigs":[["90","MISC-NAQISA-MULAGAIN"],["0.4","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l2-004:q2": {"k":"solve","op":"mul","a":"12","b":"7,8","sigs":[["93.6","MISC-NAQISA-MULAGAIN"],["20/13","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l2-004:q3": {"k":"solve","op":"mul","a":"0,5","b":"4,2","sigs":[["2.1","MISC-NAQISA-MULAGAIN"],["5/42","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l2-005:q1": {"k":"solve","op":"rsub","a":"20","b":"7,35","sigs":[["27.35","MISC-NAQISA-TRAPADD"],["-12.65","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l2-005:q2": {"k":"solve","op":"rsub","a":"15,2","b":"6,75","sigs":[["21.95","MISC-NAQISA-TRAPADD"],["-8.45","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l2-005:q3": {"k":"solve","op":"rsub","a":"3","b":"0,85","sigs":[["3.85","MISC-NAQISA-TRAPADD"],["-2.15","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l2-006:q1": {"k":"eq","want":{"op":"mul","a":"6","b":"630"},"opts":[{"op":"add","a":"6","b":"630","pos":"first","misc":"WRONGEQ"},{"op":"mul","a":"6","b":"630","pos":"second","misc":null},{"op":"rsub","a":"630","b":"6","pos":"first","misc":"WRONGEQ"}]},
  "ex-1am-bahth-adad-naqisa-l2-006:q2": {"k":"solve","op":"mul","a":"6","b":"630","sigs":[["3780","MISC-NAQISA-MULAGAIN"],["1/105","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l2-006:q3": {"k":"calc","x":"9","s":"×","y":"105","sigs":[]},
  "ex-1am-bahth-adad-naqisa-l2-007:q1": {"k":"eq","want":{"op":"rsub","a":"12,5","b":"4,8"},"opts":[{"op":"rsub","a":"12,5","b":"4,8","pos":"first","misc":null},{"op":"add","a":"12,5","b":"4,8","pos":"first","misc":"WRONGEQ"},{"op":"sub","a":"12,5","b":"4,8","pos":"first","misc":"WRONGEQ"}]},
  "ex-1am-bahth-adad-naqisa-l2-007:q2": {"k":"eq","want":{"op":"add","a":"3,25","b":"8"},"opts":[{"op":"sub","a":"3,25","b":"8","pos":"first","misc":"WRONGEQ"},{"op":"rsub","a":"8","b":"3,25","pos":"first","misc":"WRONGEQ"},{"op":"add","a":"3,25","b":"8","pos":"first","misc":null}]},
  "ex-1am-bahth-adad-naqisa-l2-007:q3": {"k":"eq","want":{"op":"mul","a":"2,5","b":"20"},"opts":[{"op":"add","a":"2,5","b":"20","pos":"first","misc":"WRONGEQ"},{"op":"mul","a":"2,5","b":"20","pos":"second","misc":null},{"op":"rsub","a":"20","b":"2,5","pos":"first","misc":"WRONGEQ"}]},
  "ex-1am-bahth-adad-naqisa-l2-008:q1": {"k":"tf","op":"add","a":"2,4","b":"8","x":"5,6","misc":null},
  "ex-1am-bahth-adad-naqisa-l2-008:q2": {"k":"tf","op":"sub","a":"3,5","b":"6,5","x":"3","misc":"SAMEOP"},
  "ex-1am-bahth-adad-naqisa-l2-008:q3": {"k":"tf","op":"rsub","a":"10,5","b":"4,25","x":"14,75","misc":"TRAPADD"},
  "ex-1am-bahth-adad-naqisa-l2-009:q1": {"k":"solve","op":"add","a":"45","b":"135","sigs":[["180","MISC-NAQISA-SAMEOP"],["-90","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l2-009:q2": {"k":"solve","op":"rsub","a":"200","b":"65","sigs":[["265","MISC-NAQISA-TRAPADD"],["-135","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l2-009:q3": {"k":"solve","op":"mul","a":"4","b":"380","sigs":[["1520","MISC-NAQISA-MULAGAIN"],["1/95","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l2-010:q1": {"k":"eq","want":{"op":"mul","a":"8,4","b":"54,6"},"opts":[{"op":"add","a":"8,4","b":"54,6","pos":"first","misc":"WRONGEQ"},{"op":"mul","a":"8,4","b":"54,6","pos":"second","misc":null},{"op":"rsub","a":"54,6","b":"8,4","pos":"first","misc":"WRONGEQ"}]},
  "ex-1am-bahth-adad-naqisa-l2-010:q2": {"k":"solve","op":"mul","a":"8,4","b":"54,6","sigs":[["458.64","MISC-NAQISA-MULAGAIN"],["2/13","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l2-010:q3": {"k":"calc","x":"8,4","s":"×","y":"6,5","sigs":[]},
  "ex-1am-bahth-adad-naqisa-l3-001:q1": {"k":"solve","op":"mul","a":"7","b":"10","sigs":[["70","MISC-NAQISA-MULAGAIN"],["0.7","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l3-001:q2": {"k":"solve","op":"mul","a":"6","b":"8","sigs":[["48","MISC-NAQISA-MULAGAIN"],["0.75","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l3-001:q3": {"k":"solve","op":"mul","a":"9","b":"4","sigs":[["36","MISC-NAQISA-MULAGAIN"],["2.25","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l3-002:q1": {"k":"solve","op":"add","a":"64,5","b":"100","sigs":[["164.5","MISC-NAQISA-SAMEOP"],["-35.5","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l3-002:q2": {"k":"solve","op":"sub","a":"17","b":"31","sigs":[["14","MISC-NAQISA-SAMEOP"],["31/17","MISC-NAQISA-FAMILY"]]},
  "ex-1am-bahth-adad-naqisa-l3-002:q3": {"k":"solve","op":"mul","a":"14","b":"6","sigs":[["84","MISC-NAQISA-MULAGAIN"],["7/3","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l3-003:q1": {"k":"verify","op":"mul","a":"3","b":"10","cands":[{"v":"10/3","misc":null},{"v":"3,33","misc":"APPROX"},{"v":"7","misc":"FAMILY"}]},
  "ex-1am-bahth-adad-naqisa-l3-003:q2": {"k":"verify","op":"mul","a":"4","b":"14","cands":[{"v":"3,5","misc":null},{"v":"10","misc":"FAMILY"},{"v":"56","misc":"MULAGAIN"}]},
  "ex-1am-bahth-adad-naqisa-l3-003:q3": {"k":"verify","op":"rsub","a":"50","b":"18","cands":[{"v":"32","misc":null},{"v":"68","misc":"TRAPADD"},{"v":"18","misc":"OPERAND"}]},
  "ex-1am-bahth-adad-naqisa-l3-004:q1": {"k":"solve","op":"mul","a":"7","b":"16","sigs":[["112","MISC-NAQISA-MULAGAIN"],["0.4375","MISC-NAQISA-DIVREV"],["2.29","MISC-NAQISA-APPROX"]]},
  "ex-1am-bahth-adad-naqisa-l3-004:q2": {"k":"verify","op":"mul","a":"7","b":"16","cands":[{"v":"16/7","misc":null},{"v":"2,29","misc":"APPROX"},{"v":"2,3","misc":"APPROX"}]},
  "ex-1am-bahth-adad-naqisa-l3-004:q3": {"k":"tf","op":"mul","a":"7","b":"20","x":"2,86","misc":"APPROX"},
  "ex-1am-bahth-adad-naqisa-l3-005:q1": {"k":"solve","op":"add","a":"7","b":"63","sigs":[["70","MISC-NAQISA-SAMEOP"],["-56","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l3-005:q2": {"k":"solve","op":"mul","a":"4","b":"56","sigs":[["224","MISC-NAQISA-MULAGAIN"],["1/14","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l3-005:q3": {"k":"calc","x":"14","s":"×","y":"4","sigs":[]},
  "ex-1am-bahth-adad-naqisa-l3-006:q1": {"k":"solve","op":"add","a":"28","b":"63","sigs":[["91","MISC-NAQISA-SAMEOP"],["-35","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l3-006:q2": {"k":"solve","op":"add","a":"31","b":"63","sigs":[["94","MISC-NAQISA-SAMEOP"],["-32","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l3-006:q3": {"k":"solve","op":"mul","a":"2","b":"32","sigs":[["64","MISC-NAQISA-MULAGAIN"],["0.0625","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l3-007:q1": {"k":"solve","op":"sub","a":"4,5","b":"6,5","sigs":[["2","MISC-NAQISA-SAMEOP"],["13/9","MISC-NAQISA-FAMILY"]]},
  "ex-1am-bahth-adad-naqisa-l3-007:q2": {"k":"solve","op":"add","a":"75","b":"140","sigs":[["215","MISC-NAQISA-SAMEOP"],["-65","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l3-007:q3": {"k":"solve","op":"mul","a":"9","b":"108","sigs":[["972","MISC-NAQISA-MULAGAIN"],["1/12","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l3-008:q1": {"k":"solve","op":"add","a":"26","b":"58","sigs":[["84","MISC-NAQISA-SAMEOP"],["-32","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l3-008:q2": {"k":"solve","op":"add","a":"14","b":"32","sigs":[["46","MISC-NAQISA-SAMEOP"],["-18","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l3-008:q3": {"k":"solve","op":"add","a":"18","b":"26","sigs":[["44","MISC-NAQISA-SAMEOP"],["-8","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l3-009:q1": {"k":"solve","op":"rsub","a":"150","b":"98","sigs":[["248","MISC-NAQISA-TRAPADD"],["-52","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l3-009:q2": {"k":"solve","op":"add","a":"45","b":"143","sigs":[["188","MISC-NAQISA-SAMEOP"],["-98","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l3-009:q3": {"k":"solve","op":"mul","a":"11","b":"143","sigs":[["1573","MISC-NAQISA-MULAGAIN"],["1/13","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l3-010:q1": {"k":"solve","op":"add","a":"4500","b":"14400","sigs":[["18900","MISC-NAQISA-SAMEOP"],["-9900","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l3-010:q2": {"k":"solve","op":"mul","a":"9","b":"9900","sigs":[["89100","MISC-NAQISA-MULAGAIN"],["1/1100","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l3-010:q3": {"k":"calc","x":"9","s":"×","y":"1100","sigs":[]},
  "ex-1am-bahth-adad-naqisa-l4-001:q1": {"k":"solve","op":"add","a":"24000","b":"84000","sigs":[["108000","MISC-NAQISA-SAMEOP"],["-60000","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l4-001:q2": {"k":"solve","op":"mul","a":"12","b":"60000","sigs":[["720000","MISC-NAQISA-MULAGAIN"],["0.0002","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l4-001:q3": {"k":"calc","x":"12","s":"×","y":"5000","sigs":[]},
  "ex-1am-bahth-adad-naqisa-l4-001:q4": {"k":"solve","op":"mul","a":"10","b":"60000","sigs":[["600000","MISC-NAQISA-MULAGAIN"],["1/6000","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l4-002:q1": {"k":"solve","op":"mul","a":"6","b":"144","sigs":[["864","MISC-NAQISA-MULAGAIN"],["1/24","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l4-002:q2": {"k":"calc","sum":["24","48","72"],"sigs":[]},
  "ex-1am-bahth-adad-naqisa-l4-002:q3": {"k":"solve","op":"mul","a":"6","b":"78","sigs":[["468","MISC-NAQISA-MULAGAIN"],["1/13","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l4-002:q4": {"k":"solve","op":"mul","a":"3","b":"51","sigs":[["153","MISC-NAQISA-MULAGAIN"],["1/17","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l4-003:q1": {"k":"solve","op":"add","a":"27","b":"63","sigs":[["90","MISC-NAQISA-SAMEOP"],["-36","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l4-003:q2": {"k":"solve","op":"mul","a":"2","b":"36","sigs":[["72","MISC-NAQISA-MULAGAIN"],["1/18","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l4-003:q3": {"k":"solve","op":"add","a":"30","b":"63","sigs":[["93","MISC-NAQISA-SAMEOP"],["-33","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l4-003:q4": {"k":"solve","op":"mul","a":"2","b":"33","sigs":[["66","MISC-NAQISA-MULAGAIN"],["2/33","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l4-004:q1": {"k":"back","cards":[["add","9"],["mul","5"]],"out":"100","sigs":[["18.2","MISC-NAQISA-ORDER"]]},
  "ex-1am-bahth-adad-naqisa-l4-004:q2": {"k":"back","cards":[["mul","3"],["sub","8"]],"out":"40","sigs":[["64/3","MISC-NAQISA-ORDER"]]},
  "ex-1am-bahth-adad-naqisa-l4-004:q3": {"k":"back","cards":[["mul","4"],["add","12"]],"out":"60","sigs":[["3","MISC-NAQISA-ORDER"]]},
  "ex-1am-bahth-adad-naqisa-l4-004:q4": {"k":"calc","x":"20","s":"×","y":"5","sigs":[]},
  "ex-1am-bahth-adad-naqisa-l4-005:q1": {"k":"solve","op":"rsub","a":"3000","b":"1100","sigs":[["4100","MISC-NAQISA-TRAPADD"],["-1900","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l4-005:q2": {"k":"solve","op":"mul","a":"4","b":"1900","sigs":[["7600","MISC-NAQISA-MULAGAIN"],["1/475","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l4-005:q3": {"k":"solve","op":"mul","a":"380","b":"1900","sigs":[["722000","MISC-NAQISA-MULAGAIN"],["0.2","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l4-005:q4": {"k":"calc","x":"5","s":"×","y":"380","sigs":[]},
  "ex-1am-bahth-adad-naqisa-l4-006:q1": {"k":"solve","op":"mul","a":"14","b":"84","sigs":[["1176","MISC-NAQISA-MULAGAIN"],["1/6","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l4-006:q2": {"k":"solve","op":"add","a":"6","b":"90","sigs":[["96","MISC-NAQISA-SAMEOP"],["-84","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l4-006:q3": {"k":"solve","op":"rsub","a":"84","b":"25","sigs":[["109","MISC-NAQISA-TRAPADD"],["-59","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l4-006:q4": {"k":"tf","op":"mul","a":"14","b":"84","x":"70","misc":"FAMILY"},
  "ex-1am-bahth-adad-naqisa-l4-007:q1": {"k":"solve","op":"add","a":"35","b":"75","sigs":[["110","MISC-NAQISA-SAMEOP"],["-40","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l4-007:q2": {"k":"solve","op":"add","a":"19","b":"40","sigs":[["59","MISC-NAQISA-SAMEOP"],["-21","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l4-007:q3": {"k":"solve","op":"add","a":"7","b":"19","sigs":[["26","MISC-NAQISA-SAMEOP"],["-12","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l4-007:q4": {"k":"solve","op":"add","a":"21","b":"35","sigs":[["56","MISC-NAQISA-SAMEOP"],["-14","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l4-008:q1": {"k":"solve","op":"rsub","a":"480","b":"315","sigs":[["795","MISC-NAQISA-TRAPADD"],["-165","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l4-008:q2": {"k":"solve","op":"add","a":"315","b":"400","sigs":[["715","MISC-NAQISA-SAMEOP"],["-85","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l4-008:q3": {"k":"solve","op":"mul","a":"15","b":"165","sigs":[["2475","MISC-NAQISA-MULAGAIN"],["1/11","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l4-008:q4": {"k":"calc","x":"11","s":"×","y":"15","sigs":[]},
  "ex-1am-bahth-adad-naqisa-l4-009:q1": {"k":"solve","op":"mul","a":"4","b":"44","sigs":[["176","MISC-NAQISA-MULAGAIN"],["1/11","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l4-009:q2": {"k":"solve","op":"add","a":"5","b":"16","sigs":[["21","MISC-NAQISA-SAMEOP"],["-11","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l4-009:q3": {"k":"solve","op":"sub","a":"3","b":"8","sigs":[["5","MISC-NAQISA-SAMEOP"],["8/3","MISC-NAQISA-FAMILY"]]},
  "ex-1am-bahth-adad-naqisa-l4-009:q4": {"k":"calc","x":"4","s":"×","y":"11","sigs":[]},
  "ex-1am-bahth-adad-naqisa-l4-010:q1": {"k":"solve","op":"rsub","a":"500","b":"135","sigs":[["635","MISC-NAQISA-TRAPADD"],["-365","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l4-010:q2": {"k":"solve","op":"sub","a":"120","b":"380","sigs":[["260","MISC-NAQISA-SAMEOP"],["19/6","MISC-NAQISA-FAMILY"]]},
  "ex-1am-bahth-adad-naqisa-l4-010:q3": {"k":"solve","op":"mul","a":"5","b":"365","sigs":[["1825","MISC-NAQISA-MULAGAIN"],["1/73","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l4-010:q4": {"k":"tf","op":"rsub","a":"500","b":"135","x":"635","misc":"TRAPADD"},
  "ex-1am-bahth-adad-naqisa-l5-001:q1": {"k":"solve","op":"mul","a":"6","b":"4800","sigs":[["28800","MISC-NAQISA-MULAGAIN"],["0.00125","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l5-001:q2": {"k":"solve","op":"add","a":"1500","b":"4800","sigs":[["6300","MISC-NAQISA-SAMEOP"],["-3300","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l5-001:q3": {"k":"solve","op":"mul","a":"4","b":"3300","sigs":[["13200","MISC-NAQISA-MULAGAIN"],["1/825","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l5-001:q4": {"k":"calc","sum":["1500","3300"],"sigs":[]},
  "ex-1am-bahth-adad-naqisa-l5-002:q1": {"k":"solve","op":"mul","a":"8","b":"480","sigs":[["3840","MISC-NAQISA-MULAGAIN"],["1/60","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l5-002:q2": {"k":"solve","op":"rsub","a":"60","b":"38","sigs":[["98","MISC-NAQISA-TRAPADD"],["-22","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l5-002:q3": {"k":"solve","op":"add","a":"15","b":"75","sigs":[["90","MISC-NAQISA-SAMEOP"],["-60","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l5-002:q4": {"k":"solve","op":"mul","a":"40","b":"480","sigs":[["19200","MISC-NAQISA-MULAGAIN"],["1/12","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l5-003:q1": {"k":"solve","op":"mul","a":"52","b":"31200","sigs":[["1622400","MISC-NAQISA-MULAGAIN"],["1/600","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l5-003:q2": {"k":"solve","op":"add","a":"4800","b":"31200","sigs":[["36000","MISC-NAQISA-SAMEOP"],["-26400","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l5-003:q3": {"k":"solve","op":"mul","a":"600","b":"26400","sigs":[["15840000","MISC-NAQISA-MULAGAIN"],["1/44","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l5-003:q4": {"k":"calc","x":"44","s":"×","y":"600","sigs":[]},
  "ex-1am-bahth-adad-naqisa-l5-004:q1": {"k":"solve","op":"mul","a":"24","b":"360","sigs":[["8640","MISC-NAQISA-MULAGAIN"],["1/15","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l5-004:q2": {"k":"solve","op":"rsub","a":"360","b":"150","sigs":[["510","MISC-NAQISA-TRAPADD"],["-210","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l5-004:q3": {"k":"solve","op":"add","a":"135","b":"285","sigs":[["420","MISC-NAQISA-SAMEOP"],["-150","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l5-004:q4": {"k":"tf","op":"mul","a":"24","b":"360","x":"15","misc":null},
  "ex-1am-bahth-adad-naqisa-l5-005:q1": {"k":"solve","op":"mul","a":"18","b":"126","sigs":[["2268","MISC-NAQISA-MULAGAIN"],["1/7","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l5-005:q2": {"k":"solve","op":"add","a":"23","b":"149","sigs":[["172","MISC-NAQISA-SAMEOP"],["-126","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l5-005:q3": {"k":"solve","op":"rsub","a":"149","b":"140","sigs":[["289","MISC-NAQISA-TRAPADD"],["-9","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l5-005:q4": {"k":"calcchoice","want":{"op":"mul","a":"18","b":"126"},"opts":[{"x":"126","s":"×","y":"18","misc":"MULAGAIN"},{"x":"18","s":"÷","y":"126","misc":"DIVREV"},{"x":"126","s":"÷","y":"18","misc":null}]},
  "ex-1am-bahth-adad-naqisa-l5-006:q1": {"k":"solve","op":"rsub","a":"25,5","b":"16,75","sigs":[["42.25","MISC-NAQISA-TRAPADD"],["-8.75","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l5-006:q2": {"k":"solve","op":"add","a":"8,25","b":"33,75","sigs":[["42","MISC-NAQISA-SAMEOP"],["-25.5","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l5-006:q3": {"k":"solve","op":"mul","a":"2,25","b":"13,5","sigs":[["30.375","MISC-NAQISA-MULAGAIN"],["1/6","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l5-006:q4": {"k":"calc","x":"6","s":"×","y":"2,25","sigs":[]},
  "ex-1am-bahth-adad-naqisa-l5-007:q1": {"k":"back","cards":[["mul","6"],["sub","10"]],"out":"62","sigs":[["61/3","MISC-NAQISA-ORDER"]]},
  "ex-1am-bahth-adad-naqisa-l5-007:q2": {"k":"back","cards":[["add","18"],["mul","4"]],"out":"100","sigs":[["20.5","MISC-NAQISA-ORDER"]]},
  "ex-1am-bahth-adad-naqisa-l5-007:q3": {"k":"back","cards":[["mul","7"],["add","4"]],"out":"40","sigs":[["12/7","MISC-NAQISA-ORDER"]]},
  "ex-1am-bahth-adad-naqisa-l5-007:q4": {"k":"calc","x":"12","s":"×","y":"6","sigs":[]},
  "ex-1am-bahth-adad-naqisa-l5-008:q1": {"k":"solve","op":"add","a":"46","b":"95","sigs":[["141","MISC-NAQISA-SAMEOP"],["-49","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l5-008:q2": {"k":"solve","op":"add","a":"23","b":"49","sigs":[["72","MISC-NAQISA-SAMEOP"],["-26","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l5-008:q3": {"k":"solve","op":"add","a":"9","b":"23","sigs":[["32","MISC-NAQISA-SAMEOP"],["-14","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l5-008:q4": {"k":"solve","op":"add","a":"14","b":"26","sigs":[["40","MISC-NAQISA-SAMEOP"],["-12","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l5-009:q1": {"k":"solve","op":"rsub","a":"9600","b":"5400","sigs":[["15000","MISC-NAQISA-TRAPADD"],["-4200","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l5-009:q2": {"k":"solve","op":"mul","a":"70","b":"4200","sigs":[["294000","MISC-NAQISA-MULAGAIN"],["1/60","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l5-009:q3": {"k":"solve","op":"mul","a":"9","b":"5400","sigs":[["48600","MISC-NAQISA-MULAGAIN"],["1/600","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l5-009:q4": {"k":"solve","op":"add","a":"5400","b":"6100","sigs":[["11500","MISC-NAQISA-SAMEOP"],["-700","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l5-010:q1": {"k":"solve","op":"rsub","a":"48","b":"15","sigs":[["63","MISC-NAQISA-TRAPADD"],["-33","MISC-NAQISA-REVSUB"]]},
  "ex-1am-bahth-adad-naqisa-l5-010:q2": {"k":"solve","op":"mul","a":"11","b":"33","sigs":[["363","MISC-NAQISA-MULAGAIN"],["1/3","MISC-NAQISA-DIVREV"]]},
  "ex-1am-bahth-adad-naqisa-l5-010:q3": {"k":"verify","op":"add","a":"16","b":"55","cands":[{"v":"39","misc":null},{"v":"71","misc":"SAMEOP"},{"v":"16","misc":"OPERAND"}]},
  "ex-1am-bahth-adad-naqisa-l5-010:q4": {"k":"tf","op":"mul","a":"6","b":"21","x":"3,5","misc":null},
};

const valueOf = (s) => {
  if (s.k === 'solve') return holeOf(s.op, lit(s.a), lit(s.b));
  if (s.k === 'calc') return s.sum ? s.sum.map(lit).reduce(add) : calcOf(lit(s.x), s.s, lit(s.y));
  if (s.k === 'back') { let x = lit(s.out); for (const [op, a] of [...s.cards].reverse()) x = holeOf(op, lit(a), x); return x; }
  throw new Error(`valeur : ${s.k}`);
};
/** la signature « ORDER » d'un programme : les cartes inversées dans le MÊME ordre (faux) */
const sameOrder = (s) => { let x = lit(s.out); for (const [op, a] of s.cards) x = holeOf(op, lit(a), x); return x; };
const isChoice = (s) => ['eq', 'calcchoice', 'verify', 'tf'].includes(s.k);

const choiceIndex = (id, s) => {
  let hits;
  if (s.k === 'eq') {
    const w = holeOf(s.want.op, lit(s.want.a), lit(s.want.b));
    hits = s.opts.map((o, i) => (o.op === s.want.op && eq(lit(o.a), lit(s.want.a)) && eq(lit(o.b), lit(s.want.b)) ? i : -1)).filter((i) => i >= 0);
    // une égalité fausse a un manquant différent de la bonne (sauf à changer de forme : on le vérifie par la signature de forme)
    void w;
  } else if (s.k === 'calcchoice') {
    const w = holeOf(s.want.op, lit(s.want.a), lit(s.want.b));
    hits = s.opts.map((o, i) => (eq(calcOf(lit(o.x), o.s, lit(o.y)), w) ? i : -1)).filter((i) => i >= 0);
  } else if (s.k === 'verify') {
    hits = s.cands.map((c, i) => (eq(runOf(s.op, lit(s.a), lit(c.v)), lit(s.b)) ? i : -1)).filter((i) => i >= 0);
  } else if (s.k === 'tf') return eq(runOf(s.op, lit(s.a), lit(s.x)), lit(s.b)) ? 0 : 1;
  if (hits.length !== 1) throw new Error(`${id} : ${hits.length} options justes`);
  return hits[0];
};
const answerOf = (id, s) => (isChoice(s) ? C('ABCDEF'[choiceIndex(id, s)]) : R(key(valueOf(s))));

export const ORACLE = Object.fromEntries(Object.entries(SPECS).map(([k, s]) => [k, answerOf(k, s)]));

/** relit les fichiers du banc : clé, QCM, rendu des options et signatures de misconception */
export function audit(bank) {
  const errs = []; const byKey = new Map(bank.map((b) => [b.key, b.q]));
  for (const [id, s] of Object.entries(SPECS)) {
    const q = byKey.get(id);
    if (!q) { errs.push(`${id} : question absente`); continue; }
    if (!isChoice(s)) {
      if (q.answerType !== 'rational') { errs.push(`${id} : devrait être rational`); continue; }
      const K = valueOf(s);
      if (!eq(lit(String(q.expectedAnswer)), K)) errs.push(`${id} : clé ${q.expectedAnswer} ≠ ${key(K)}`);
      if (key(lit(String(q.expectedAnswer))) !== String(q.expectedAnswer)) errs.push(`${id} : clé ${q.expectedAnswer} n'est pas écrite sous sa forme canonique ${key(K)}`);
      const sigs = q.misconceptionSignatures ?? [];
      const want = s.sigs ?? [];
      if (sigs.length !== want.length) errs.push(`${id} : ${sigs.length} signatures, ${want.length} retapées`);
      for (const sg of sigs) {
        if (eq(lit(String(sg.value)), K)) errs.push(`${id} : signature ${sg.id} = la bonne réponse`);
        if (!want.some(([v, mid]) => mid === sg.id && eq(lit(v), lit(String(sg.value))))) errs.push(`${id} : signature ${sg.id}=${sg.value} non retapée`);
      }
      // les signatures « mécaniques » sont recalculées : SAMEOP, TRAPADD, MULAGAIN, DIVREV, ORDER
      if (s.k === 'solve') {
        const [a, b] = [lit(s.a), lit(s.b)];
        const mech = { add: [['SAMEOP', add(b, a)]], sub: [['SAMEOP', sub(b, a)]], rsub: [['TRAPADD', add(b, a)], ['REVSUB', sub(b, a)]], mul: [['MULAGAIN', mul(b, a)], ['DIVREV', a.n === 0n ? null : div(a, b)]] }[s.op];
        for (const [name, v] of mech) {
          const got = sigs.find((x) => x.id === `MISC-NAQISA-${name}`);
          if (got && v && !eq(lit(String(got.value)), v)) errs.push(`${id} : ${name} devrait valoir ${key(v)}, écrit ${got.value}`);
        }
      }
      if (s.k === 'back') {
        const so = sameOrder(s); const got = sigs.find((x) => x.id === 'MISC-NAQISA-ORDER');
        if (eq(so, valueOf(s))) { if (got) errs.push(`${id} : ORDER inutile`); }
        else if (!got || !eq(lit(String(got.value)), so)) errs.push(`${id} : ORDER devrait valoir ${key(so)}`);
      }
    } else {
      if (q.answerType !== 'choice') { errs.push(`${id} : devrait être choice`); continue; }
      const good = choiceIndex(id, s);
      if (s.k === 'tf') {
        q.choices.forEach((c) => { if (c.isCorrect !== (c.id === (good === 0 ? 'A' : 'B'))) errs.push(`${id} : option ${c.id} isCorrect=${c.isCorrect} mais le calcul dit le contraire`); });
        if (good === 1) { const mid = q.choices[0].misconceptionId; if (mid !== `MISC-NAQISA-${s.misc}`) errs.push(`${id} : misconception de « صحيح » ${mid} ≠ ${s.misc}`); }
        continue;
      }
      const list = s.k === 'eq' || s.k === 'calcchoice' ? s.opts : s.cands;
      if (q.choices.length !== list.length) errs.push(`${id} : ${q.choices.length} options, ${list.length} retapées`);
      q.choices.forEach((c, i) => {
        if (c.isCorrect !== (i === good)) errs.push(`${id} : option ${c.id} isCorrect=${c.isCorrect} mais le calcul dit ${i === good}`);
        const m = list[i]?.misc ?? null;
        if (m !== null ? c.misconceptionId !== `MISC-NAQISA-${m}` : c.misconceptionId !== undefined) errs.push(`${id} : option ${c.id} misconceptionId ${c.misconceptionId} ≠ ${m}`);
        let want;
        if (s.k === 'eq') want = `$${eqTex(list[i].op, list[i].a, list[i].b, list[i].pos)}$`;
        else if (s.k === 'calcchoice') want = `$${tex(lit(list[i].x))}${SYM[list[i].s]}${tex(lit(list[i].y))}$`;
        else want = `$${tex(lit(list[i].v))}$`;
        if (c.content !== want) errs.push(`${id} : option ${c.id} « ${c.content} » ≠ « ${want} »`);
      });
    }
  }
  for (const b of bank) if (b.q.answerType !== 'selfCheck' && !(b.key in SPECS)) errs.push(`${b.key} : sans vérification`);
  return errs;
}
