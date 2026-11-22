// Oracle du banc « muqarana-kasrayn » (مقارنة كسرين, 2AM unité 2, 2026-10-29) — feuilles d'examen « على منوال اختبار الفصل … ».
// Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI à partir des opérandes retapés en littéraux (« 3/8 », « 6.4/9 », « 600 ») avec une arithmétique de
// RATIONNELS EXACTS en BigInt écrite dans ce fichier : aucun import de packages/core, aucune lecture de `expectedAnswer`.
// La décision de comparaison est le produit en croix (a·d' contre a'·d) — l'outil caché de l'oracle ; le bank, lui, ne doit jamais
// avoir besoin d'un produit en croix : chaque paire comparée est un CAS 2AM (même dénominateur, même numérateur, un dénominateur
// multiple de l'autre, ou deux fractions de part et d'autre de 1) — une paire qui est un cas de 3AM (multiple commun quelconque)
// est un défaut, relevé par audit().
// SPECS[clé] décrit chaque question (genre `k`) :
//  rel   : QCM « قارن » ; options « a ○ b » dans l'ordre `order` ; clé = la relation vraie ;
//  yn    : « هل a ○ b ؟ » (A = نعم) ; case : QCM « الطريقة الأنسب » ; who : « من على حق ؟ » ;
//  ord   : QCM d'ordres (`opts`, chaînes dans l'ordre des options) ; pick : le plus grand / le plus petit (`items`, valeur `v`,
//          expression facultative `e` recalculée) ; pickrel : l'unique option « ○ f » ; between : l'unique option strictement entre ;
//          multi : toutes les options « ○ c » ; rewrite : a/b = □/d ; findx : x/d ○ c ; countx : lo < x/d < hi ; seq : le terme suivant ;
//  calc  : expression exacte (arbre ["+","-","*", …]) ; self : « برّر » (aucune clé).
// audit(bank) : chaque option est relue en LaTeX et comparée au spec, UNE SEULE option vraie par QCM, chaque signature
// MISC-MUQKASR-* (NUMONLY, BIGDEN, NOSCALE, GAP, ONEWRONG, REVERSED) recalculée depuis les opérandes et FAUSSE, aucune paire de
// dénominateurs non liée dans une somme ou une différence, aucun pourcentage, aucun mot interdit.
import { R, C } from './helpers.mjs';

const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
class Q {
  constructor(n, d = 1n) { n = BigInt(n); d = BigInt(d); if (d === 0n) throw new Error('division par zéro'); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); this.n = n / g; this.d = d / g; }
  add(o) { return new Q(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { return new Q(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { return new Q(this.n * o.n, this.d * o.d); }
  cmp(o) { const l = this.n * o.d, r = o.n * this.d; return l > r ? 1 : (l < r ? -1 : 0); }   // produit en croix
  eq(o) { return this.cmp(o) === 0; }
  toString() { return this.d === 1n ? String(this.n) : `${this.n}/${this.d}`; }
}
/** « 6.4 » → 32/5 ; « 7 » → 7. */
const decQ = (s) => { const [i, f = ''] = String(s).split('.'); return new Q(BigInt(i + f), 10n ** BigInt(f.length)); };
/** « 6.4/9 » : numérateur décimal possible, dénominateur entier ; « 3 » : entier. */
const q = (v) => {
  if (v instanceof Q) return v;
  const s = String(v).trim();
  if (!s.includes('/')) return decQ(s);
  const k = s.lastIndexOf('/'); const a = decQ(s.slice(0, k)); const b = decQ(s.slice(k + 1));
  return new Q(a.n * b.d, a.d * b.n);
};
/** Fraction ÉCRITE : { n: Q (numérateur tel qu'écrit), d: BigInt, isInt } — le numérateur écrit compte pour NUMONLY / BIGDEN. */
const wr = (s) => {
  s = String(s);
  if (!s.includes('/')) return { n: decQ(s), d: 1n, isInt: true, v: decQ(s) };
  const k = s.lastIndexOf('/'); const n = decQ(s.slice(0, k)); const d = BigInt(s.slice(k + 1));
  return { n, d, isInt: false, v: new Q(n.n, n.d * d) };
};
const ev = (e) => {
  if (typeof e === 'string') return q(e);
  const [op, ...a] = e; const vs = a.map(ev);
  if (op === '+') return vs.reduce((x, y) => x.add(y), new Q(0n));
  if (op === '-') return vs.slice(1).reduce((x, y) => x.sub(y), vs[0]);
  if (op === '*') return vs.reduce((x, y) => x.mul(y), new Q(1n));
  throw new Error(`opérateur ${op}`);
};
const rel = (a, b) => { const c = q(a).cmp(q(b)); return c > 0 ? '>' : (c < 0 ? '<' : '='); };
const relQ = (x, y) => { const c = x.cmp(y); return c > 0 ? '>' : (c < 0 ? '<' : '='); };

/** Le cas 2AM d'une paire (écrite) ; null = hors périmètre (cas de 3AM). */
function caseOf(a, b) {
  const A = wr(a), B = wr(b);
  if (A.isInt || B.isInt) return 'int';
  if (A.d === B.d) return 'den';
  if (A.n.eq(B.n)) return 'num';
  if (A.d % B.d === 0n || B.d % A.d === 0n) return 'mult';
  if ((A.n.cmp(new Q(A.d)) < 0 && B.n.cmp(new Q(B.d)) > 0) || (A.n.cmp(new Q(A.d)) > 0 && B.n.cmp(new Q(B.d)) < 0)) return 'one';
  return null;
}
/** Le verdict (relation de a à b) que donnerait chaque erreur ; absent = l'erreur ne s'applique pas à cette paire. */
function verdicts(a, b) {
  const A = wr(a), B = wr(b); const out = {};
  if (A.isInt || B.isInt) {
    const f = B.isInt ? A : B, k = B.isInt ? B : A;
    if (k.n.eq(new Q(1n))) { if (f.n.cmp(new Q(f.d)) < 0) out.ONEWRONG = B.isInt ? '>' : '<'; }
    else out.NUMONLY = relQ(A.n, B.n);
    return out;
  }
  if (A.d !== B.d) {
    out.NUMONLY = relQ(A.n, B.n);
    out.BIGDEN = A.d > B.d ? '>' : '<';
    const ga = new Q(A.d).sub(A.n), gb = new Q(B.d).sub(B.n);
    if (A.n.cmp(new Q(A.d)) < 0 && B.n.cmp(new Q(B.d)) < 0 && ga.eq(gb) && !A.n.eq(B.n)) out.GAP = '=';
  }
  return out;
}

const SPECS = {
  "ex-2am-muqarana-kasrayn-l1-001:q1": {"k": "rel", "a": "4/9", "b": "4/7", "order": ["<", ">", "="]},
  "ex-2am-muqarana-kasrayn-l1-001:q2": {"k": "rel", "a": "8/13", "b": "17/6", "order": [">", "<"]},
  "ex-2am-muqarana-kasrayn-l1-001:q3": {"k": "rel", "a": "7/10", "b": "2/5", "order": ["=", "<", ">"]},
  "ex-2am-muqarana-kasrayn-l1-001:q4": {"k": "self"},
  "ex-2am-muqarana-kasrayn-l1-002:q1": {"k": "calc", "e": ["*", "5/9", "3/10"]},
  "ex-2am-muqarana-kasrayn-l1-002:q2": {"k": "rel", "a": "23/45", "b": "19/45", "order": [">", "<"]},
  "ex-2am-muqarana-kasrayn-l1-002:q3": {"k": "rel", "a": "6.4/9", "b": "6/9", "order": ["<", ">"]},
  "ex-2am-muqarana-kasrayn-l1-003:q1": {"k": "rel", "a": "5/12", "b": "9/12", "order": [">", "<"]},
  "ex-2am-muqarana-kasrayn-l1-003:q2": {"k": "rel", "a": "7.3/10", "b": "7.8/10", "order": ["<", ">"]},
  "ex-2am-muqarana-kasrayn-l1-003:q3": {"k": "rel", "a": "2.5/8", "b": "2.05/8", "order": [">", "<"]},
  "ex-2am-muqarana-kasrayn-l1-004:q1": {"k": "rel", "a": "1/5", "b": "1/9", "order": ["=", "<", ">"]},
  "ex-2am-muqarana-kasrayn-l1-004:q2": {"k": "rel", "a": "5/6", "b": "5/8", "order": [">", "<", "="]},
  "ex-2am-muqarana-kasrayn-l1-004:q3": {"k": "rel", "a": "9/10", "b": "9/13", "order": ["<", "=", ">"]},
  "ex-2am-muqarana-kasrayn-l1-005:q1": {"k": "rel", "a": "5/6", "b": "11/12", "order": ["=", ">", "<"]},
  "ex-2am-muqarana-kasrayn-l1-005:q2": {"k": "rel", "a": "3/4", "b": "9/12", "order": ["<", "="]},
  "ex-2am-muqarana-kasrayn-l1-005:q3": {"k": "rel", "a": "7/9", "b": "2/3", "order": [">", "<"]},
  "ex-2am-muqarana-kasrayn-l1-006:q1": {"k": "rel", "a": "7/9", "b": "1", "order": ["<", ">"]},
  "ex-2am-muqarana-kasrayn-l1-006:q2": {"k": "rel", "a": "13/10", "b": "1", "order": [">", "<"]},
  "ex-2am-muqarana-kasrayn-l1-006:q3": {"k": "rel", "a": "8/8", "b": "1", "order": ["<", "=", ">"]},
  "ex-2am-muqarana-kasrayn-l1-006:q4": {"k": "rel", "a": "11/6", "b": "9/10", "order": [">", "<"]},
  "ex-2am-muqarana-kasrayn-l1-007:q1": {"k": "rel", "a": "3/7", "b": "5/7", "order": ["<", ">"]},
  "ex-2am-muqarana-kasrayn-l1-007:q2": {"k": "rel", "a": "2/9", "b": "2/5", "order": [">", "=", "<"]},
  "ex-2am-muqarana-kasrayn-l1-007:q3": {"k": "rel", "a": "4/5", "b": "12/15", "order": ["=", "<"]},
  "ex-2am-muqarana-kasrayn-l1-007:q4": {"k": "rel", "a": "13/9", "b": "5/8", "order": [">", "<"]},
  "ex-2am-muqarana-kasrayn-l1-008:q1": {"k": "rel", "a": "7/12", "b": "5/12", "order": ["<", ">"]},
  "ex-2am-muqarana-kasrayn-l1-008:q2": {"k": "rel", "a": "2/9", "b": "2/7", "order": ["=", ">", "<"]},
  "ex-2am-muqarana-kasrayn-l1-008:q3": {"k": "rel", "a": "3/5", "b": "9/10", "order": ["<", ">"]},
  "ex-2am-muqarana-kasrayn-l1-009:q1": {"k": "rel", "a": "9/14", "b": "27/28", "order": [">", "<"]},
  "ex-2am-muqarana-kasrayn-l1-009:q2": {"k": "rel", "a": "8/15", "b": "15/8", "order": ["<", ">"]},
  "ex-2am-muqarana-kasrayn-l1-009:q3": {"k": "rel", "a": "99/100", "b": "5/4", "order": [">", "<"]},
  "ex-2am-muqarana-kasrayn-l1-009:q4": {"k": "rel", "a": "6/13", "b": "6/11", "order": ["<", "=", ">"]},
  "ex-2am-muqarana-kasrayn-l1-010:q1": {"k": "rel", "a": "11/16", "b": "9/16", "order": [">", "<"]},
  "ex-2am-muqarana-kasrayn-l1-010:q2": {"k": "rel", "a": "5/21", "b": "12/21", "order": ["<", ">"]},
  "ex-2am-muqarana-kasrayn-l1-010:q3": {"k": "rel", "a": "8.2/7", "b": "8/7", "order": [">", "<"]},
  "ex-2am-muqarana-kasrayn-l1-010:q4": {"k": "rel", "a": "3.6/10", "b": "3.06/10", "order": ["<", ">"]},
  "ex-2am-muqarana-kasrayn-l1-010:q5": {"k": "rel", "a": "0.45/6", "b": "0.5/6", "order": [">", "<"]},
  "ex-2am-muqarana-kasrayn-l2-001:q1": {"k": "calc", "e": ["+", "4/9", "14/36"]},
  "ex-2am-muqarana-kasrayn-l2-001:q2": {"k": "rel", "a": "5/14", "b": "5/11", "order": ["<", "=", ">"]},
  "ex-2am-muqarana-kasrayn-l2-001:q3": {"k": "rel", "a": "10/9", "b": "417/421", "order": [">", "<"]},
  "ex-2am-muqarana-kasrayn-l2-001:q4": {"k": "self"},
  "ex-2am-muqarana-kasrayn-l2-002:q1": {"k": "case", "a": "6/11", "b": "6/13", "order": ["mult", "num", "one", "den"]},
  "ex-2am-muqarana-kasrayn-l2-002:q2": {"k": "rel", "a": "6/11", "b": "6/13", "order": ["<", ">", "="]},
  "ex-2am-muqarana-kasrayn-l2-002:q3": {"k": "case", "a": "5/7", "b": "25/28", "order": ["one", "mult", "den", "num"]},
  "ex-2am-muqarana-kasrayn-l2-002:q4": {"k": "rel", "a": "5/7", "b": "25/28", "order": [">", "<"]},
  "ex-2am-muqarana-kasrayn-l2-003:q1": {"k": "multi", "c": "1", "rel": "<", "items": ["5/17", "33/30", "9/8", "14/15", "20/19", "7/12"]},
  "ex-2am-muqarana-kasrayn-l2-003:q2": {"k": "multi", "c": "2", "rel": "<", "items": ["13/7", "15/8", "31/14", "11/5", "17/9", "5/4"]},
  "ex-2am-muqarana-kasrayn-l2-003:q3": {"k": "self"},
  "ex-2am-muqarana-kasrayn-l2-004:q1": {"k": "pickrel", "f": "7/16", "rel": "<", "opts": ["7/4", "16/7", "3/32", "9/8"]},
  "ex-2am-muqarana-kasrayn-l2-004:q2": {"k": "pick", "mode": "max", "items": [{"v": "3/4", "label": null}, {"v": "9/16", "label": null}, {"v": "5/8", "label": null}, {"v": "7/8", "label": null}]},
  "ex-2am-muqarana-kasrayn-l2-004:q3": {"k": "pick", "mode": "min", "items": [{"v": "5/6", "label": null}, {"v": "5/9", "label": null}, {"v": "5/12", "label": null}, {"v": "5/8", "label": null}]},
  "ex-2am-muqarana-kasrayn-l2-005:q1": {"k": "rel", "a": "13/7", "b": "2", "order": ["<", ">"]},
  "ex-2am-muqarana-kasrayn-l2-005:q2": {"k": "rel", "a": "19/10", "b": "2", "order": [">", "<"]},
  "ex-2am-muqarana-kasrayn-l2-005:q3": {"k": "yn", "a": "7/9", "rel": ">", "b": "1"},
  "ex-2am-muqarana-kasrayn-l2-005:q4": {"k": "rel", "a": "15/11", "b": "1", "order": ["<", ">"]},
  "ex-2am-muqarana-kasrayn-l2-006:q1": {"k": "yn", "a": "3/4", "rel": "=", "b": "7/8"},
  "ex-2am-muqarana-kasrayn-l2-006:q2": {"k": "self"},
  "ex-2am-muqarana-kasrayn-l2-006:q3": {"k": "yn", "a": "5/6", "rel": "=", "b": "11/12"},
  "ex-2am-muqarana-kasrayn-l2-006:q4": {"k": "rel", "a": "7/8", "b": "3/4", "order": ["=", ">", "<"]},
  "ex-2am-muqarana-kasrayn-l2-007:q1": {"k": "rewrite", "a": "3", "b": "4", "d": "12"},
  "ex-2am-muqarana-kasrayn-l2-007:q2": {"k": "rewrite", "a": "5", "b": "6", "d": "18"},
  "ex-2am-muqarana-kasrayn-l2-007:q3": {"k": "rewrite", "a": "2", "b": "5", "d": "15"},
  "ex-2am-muqarana-kasrayn-l2-007:q4": {"k": "rel", "a": "3/4", "b": "7/12", "order": ["<", ">"]},
  "ex-2am-muqarana-kasrayn-l2-008:q1": {"k": "rel", "a": "4/7", "b": "28/49", "order": ["=", "<"]},
  "ex-2am-muqarana-kasrayn-l2-008:q2": {"k": "rel", "a": "11/6", "b": "2", "order": ["<", ">"]},
  "ex-2am-muqarana-kasrayn-l2-008:q3": {"k": "rel", "a": "10/6", "b": "5/3", "order": [">", "="]},
  "ex-2am-muqarana-kasrayn-l2-008:q4": {"k": "rel", "a": "7/8", "b": "3/4", "order": ["<", "=", ">"]},
  "ex-2am-muqarana-kasrayn-l2-009:q1": {"k": "rel", "a": "5/8", "b": "9/16", "order": [">", "<"]},
  "ex-2am-muqarana-kasrayn-l2-009:q2": {"k": "self"},
  "ex-2am-muqarana-kasrayn-l2-009:q3": {"k": "rel", "a": "7/10", "b": "7/12", "order": ["<", ">", "="]},
  "ex-2am-muqarana-kasrayn-l2-010:q1": {"k": "rel", "a": "4/5", "b": "9/10", "order": [">", "=", "<"]},
  "ex-2am-muqarana-kasrayn-l2-010:q2": {"k": "case", "a": "4/5", "b": "9/10", "order": ["one", "den", "mult", "num"]},
  "ex-2am-muqarana-kasrayn-l2-010:q3": {"k": "rel", "a": "11/8", "b": "1", "order": ["<", ">"]},
  "ex-2am-muqarana-kasrayn-l3-001:q1": {"k": "rel", "a": "5/6", "b": "11/18", "order": [">", "<"]},
  "ex-2am-muqarana-kasrayn-l3-001:q2": {"k": "calc", "e": ["-", "5/6", "11/18"]},
  "ex-2am-muqarana-kasrayn-l3-001:q3": {"k": "ord", "dir": "asc", "opts": [["11/18", "5/6", "1"], ["5/6", "11/18", "1"], ["11/18", "1", "5/6"], ["1", "5/6", "11/18"]]},
  "ex-2am-muqarana-kasrayn-l3-002:q1": {"k": "ord", "dir": "desc", "opts": [["11/6", "5/3", "5/6", "1/3", "7/12", "1/12"], ["11/6", "5/3", "5/6", "7/12", "1/12", "1/3"], ["11/6", "5/3", "5/6", "7/12", "1/3", "1/12"], ["1/12", "1/3", "7/12", "5/6", "5/3", "11/6"]]},
  "ex-2am-muqarana-kasrayn-l3-002:q2": {"k": "ord", "dir": "asc", "opts": [["3/16", "1/4", "5/8", "9/8", "3/2"], ["3/16", "1/4", "9/8", "5/8", "3/2"], ["3/16", "1/4", "5/8", "3/2", "9/8"], ["3/2", "9/8", "5/8", "1/4", "3/16"]]},
  "ex-2am-muqarana-kasrayn-l3-002:q3": {"k": "pick", "mode": "min", "items": [{"v": "9/4", "label": null}, {"v": "7/12", "label": null}, {"v": "5/6", "label": null}, {"v": "3/2", "label": null}]},
  "ex-2am-muqarana-kasrayn-l3-003:q1": {"k": "seq", "terms": ["1/2", "3/4", "7/8", "15/16"]},
  "ex-2am-muqarana-kasrayn-l3-003:q2": {"k": "ord", "dir": "asc", "opts": [["1/2", "3/4", "7/8", "31/32", "15/16"], ["3/4", "1/2", "7/8", "15/16", "31/32"], ["1/2", "3/4", "7/8", "15/16", "31/32"], ["31/32", "15/16", "7/8", "3/4", "1/2"]]},
  "ex-2am-muqarana-kasrayn-l3-003:q3": {"k": "rel", "a": "31/32", "b": "1", "order": ["<", ">"]},
  "ex-2am-muqarana-kasrayn-l3-003:q4": {"k": "self"},
  "ex-2am-muqarana-kasrayn-l3-004:q1": {"k": "between", "lo": "3/8", "hi": "3/5", "opts": ["3/4", "3/9", "3/7", "3/10"]},
  "ex-2am-muqarana-kasrayn-l3-004:q2": {"k": "rel", "a": "9/5", "b": "9.4/5", "order": [">", "<"]},
  "ex-2am-muqarana-kasrayn-l3-004:q3": {"k": "rel", "a": "9/5", "b": "9/7", "order": ["<", ">", "="]},
  "ex-2am-muqarana-kasrayn-l3-004:q4": {"k": "countx", "lo": "2/9", "hi": "7/9", "d": "9"},
  "ex-2am-muqarana-kasrayn-l3-005:q1": {"k": "rewrite", "a": "41.3", "b": "25", "d": "500"},
  "ex-2am-muqarana-kasrayn-l3-005:q2": {"k": "rel", "a": "826.0003/500", "b": "41.3/25", "order": [">", "<"]},
  "ex-2am-muqarana-kasrayn-l3-005:q3": {"k": "who", "a": "826.0003/500", "b": "41.3/25", "claims": [["سلمى", "eq"], ["سامي", "ne"]]},
  "ex-2am-muqarana-kasrayn-l3-005:q4": {"k": "self"},
  "ex-2am-muqarana-kasrayn-l3-006:q1": {"k": "ord", "dir": "asc", "opts": [["7/20", "4/5", "9/4"], ["9/4", "4/5", "7/20"], ["4/5", "7/20", "9/4"], ["7/20", "9/4", "4/5"]]},
  "ex-2am-muqarana-kasrayn-l3-006:q2": {"k": "ord", "dir": "desc", "opts": [["1/3", "5/6", "13/12", "7/4"], ["13/12", "5/6", "7/4", "1/3"], ["7/4", "13/12", "5/6", "1/3"], ["13/12", "7/4", "5/6", "1/3"]]},
  "ex-2am-muqarana-kasrayn-l3-007:q1": {"k": "pick", "mode": "max", "items": [{"v": "3/4", "label": "أمين"}, {"v": "5/8", "label": "ريم"}, {"v": "9/16", "label": "يوسف"}, {"v": "1/2", "label": "إيمان"}]},
  "ex-2am-muqarana-kasrayn-l3-007:q2": {"k": "pick", "mode": "min", "items": [{"v": "3/4", "label": "أمين"}, {"v": "5/8", "label": "ريم"}, {"v": "9/16", "label": "يوسف"}, {"v": "1/2", "label": "إيمان"}]},
  "ex-2am-muqarana-kasrayn-l3-007:q3": {"k": "ord", "dir": "asc", "opts": [["1/2", "3/4", "5/8", "9/16"], ["1/2", "9/16", "5/8", "3/4"], ["9/16", "1/2", "5/8", "3/4"], ["3/4", "5/8", "9/16", "1/2"]]},
  "ex-2am-muqarana-kasrayn-l3-008:q1": {"k": "between", "lo": "3/4", "hi": "5/4", "opts": ["7/8", "13/8", "1/8", "5/8"]},
  "ex-2am-muqarana-kasrayn-l3-008:q2": {"k": "between", "lo": "4/9", "hi": "8/9", "opts": ["3/9", "6.5/9", "9.5/9", "2/9"]},
  "ex-2am-muqarana-kasrayn-l3-008:q3": {"k": "countx", "lo": "2/5", "hi": "4/5", "d": "10"},
  "ex-2am-muqarana-kasrayn-l3-009:q1": {"k": "pick", "mode": "min", "items": [{"v": "7/9", "label": null}, {"v": "13/8", "label": null}, {"v": "5/9", "label": null}, {"v": "3/2", "label": null}]},
  "ex-2am-muqarana-kasrayn-l3-009:q2": {"k": "ord", "dir": "asc", "opts": [["3/2", "5/9", "7/9", "13/8"], ["5/9", "7/9", "3/2", "13/8"], ["13/8", "3/2", "7/9", "5/9"], ["5/9", "7/9", "13/8", "3/2"]]},
  "ex-2am-muqarana-kasrayn-l3-009:q3": {"k": "findx", "c": "3/4", "d": "12", "rel": ">"},
  "ex-2am-muqarana-kasrayn-l3-010:q1": {"k": "yn", "a": "7/8", "rel": ">", "b": "3/4"},
  "ex-2am-muqarana-kasrayn-l3-010:q2": {"k": "yn", "a": "9/10", "rel": ">", "b": "4/5"},
  "ex-2am-muqarana-kasrayn-l3-010:q3": {"k": "yn", "a": "7/12", "rel": ">", "b": "3/4"},
  "ex-2am-muqarana-kasrayn-l3-010:q4": {"k": "yn", "a": "5/6", "rel": "<", "b": "11/12"},
  "ex-2am-muqarana-kasrayn-l4-001:q1": {"k": "pick", "mode": "max", "items": [{"v": "1/2", "label": "اليوم الأوّل"}, {"v": "3/16", "label": "اليوم الثاني"}, {"v": "1/8", "label": "اليوم الثالث"}]},
  "ex-2am-muqarana-kasrayn-l4-001:q2": {"k": "calc", "e": ["+", "1/2", "3/16", "1/8"]},
  "ex-2am-muqarana-kasrayn-l4-001:q3": {"k": "calc", "e": ["-", "1", "13/16"]},
  "ex-2am-muqarana-kasrayn-l4-001:q4": {"k": "rel", "a": "3/16", "b": "1/8", "order": ["<", ">"]},
  "ex-2am-muqarana-kasrayn-l4-002:q1": {"k": "pick", "mode": "max", "items": [{"v": "3/10", "label": "الخبز"}, {"v": "2/5", "label": "الكسرة"}]},
  "ex-2am-muqarana-kasrayn-l4-002:q2": {"k": "calc", "e": ["+", "3/10", "2/5"]},
  "ex-2am-muqarana-kasrayn-l4-002:q3": {"k": "rel", "a": "7/10", "b": "1", "order": [">", "<"]},
  "ex-2am-muqarana-kasrayn-l4-002:q4": {"k": "calc", "e": ["*", "3/10", "50"]},
  "ex-2am-muqarana-kasrayn-l4-002:q5": {"k": "calc", "e": ["-", "50", ["*", "7/10", "50"]]},
  "ex-2am-muqarana-kasrayn-l4-003:q1": {"k": "calc", "e": ["-", "1", "7/16", "1/4"]},
  "ex-2am-muqarana-kasrayn-l4-003:q2": {"k": "pick", "mode": "max", "items": [{"v": "7/16", "label": "القصص"}, {"v": "1/4", "label": "العلوم"}, {"v": "5/16", "label": "المجلّات", "e": ["-", "1", "7/16", "1/4"]}]},
  "ex-2am-muqarana-kasrayn-l4-003:q3": {"k": "ord", "dir": "asc", "opts": [["1/4", "7/16", "5/16"], ["7/16", "5/16", "1/4"], ["1/4", "5/16", "7/16"], ["5/16", "1/4", "7/16"]]},
  "ex-2am-muqarana-kasrayn-l4-003:q4": {"k": "rel", "a": "7/16", "b": "1/2", "order": ["<", ">"]},
  "ex-2am-muqarana-kasrayn-l4-004:q1": {"k": "calc", "e": ["-", "1", "1/2", "3/20"]},
  "ex-2am-muqarana-kasrayn-l4-004:q2": {"k": "pick", "mode": "min", "items": [{"v": "1/2", "label": "اليوم الأوّل"}, {"v": "3/20", "label": "اليوم الثاني"}, {"v": "7/20", "label": "اليوم الثالث", "e": ["-", "1", "1/2", "3/20"]}]},
  "ex-2am-muqarana-kasrayn-l4-004:q3": {"k": "ord", "dir": "desc", "opts": [["7/20", "3/20", "1/2"], ["1/2", "3/20", "7/20"], ["1/2", "7/20", "3/20"], ["3/20", "7/20", "1/2"]]},
  "ex-2am-muqarana-kasrayn-l4-004:q4": {"k": "calc", "e": ["*", "7/20", "4000"]},
  "ex-2am-muqarana-kasrayn-l4-005:q1": {"k": "calc", "e": ["+", "1/4", "3/8", "1/16"]},
  "ex-2am-muqarana-kasrayn-l4-005:q2": {"k": "rel", "a": "11/16", "b": "1/2", "order": [">", "<"]},
  "ex-2am-muqarana-kasrayn-l4-005:q3": {"k": "pick", "mode": "max", "items": [{"v": "1/4", "label": "الأولى"}, {"v": "3/8", "label": "الثانية"}, {"v": "1/16", "label": "الثالثة"}]},
  "ex-2am-muqarana-kasrayn-l4-005:q4": {"k": "calc", "e": ["-", "1", "11/16"]},
  "ex-2am-muqarana-kasrayn-l4-006:q1": {"k": "calc", "e": ["-", "1", "5/12", "1/4"]},
  "ex-2am-muqarana-kasrayn-l4-006:q2": {"k": "ord", "dir": "desc", "opts": [["5/12", "1/4", "1/3"], ["1/3", "5/12", "1/4"], ["1/4", "1/3", "5/12"], ["5/12", "1/3", "1/4"]]},
  "ex-2am-muqarana-kasrayn-l4-006:q3": {"k": "pick", "mode": "max", "items": [{"v": "5/12", "label": "الخضر"}, {"v": "1/4", "label": "الأشجار"}, {"v": "1/3", "label": "المخزن", "e": ["-", "1", "5/12", "1/4"]}]},
  "ex-2am-muqarana-kasrayn-l4-006:q4": {"k": "calc", "e": ["*", "1/4", "2400"]},
  "ex-2am-muqarana-kasrayn-l4-007:q1": {"k": "pick", "mode": "min", "items": [{"v": "3/8", "label": "الأولى"}, {"v": "1/4", "label": "الثانية"}, {"v": "1/16", "label": "الثالثة"}]},
  "ex-2am-muqarana-kasrayn-l4-007:q2": {"k": "calc", "e": ["+", "3/8", "1/4", "1/16"]},
  "ex-2am-muqarana-kasrayn-l4-007:q3": {"k": "rel", "a": "11/16", "b": "1", "order": ["<", ">"]},
  "ex-2am-muqarana-kasrayn-l4-007:q4": {"k": "calc", "e": ["*", "3/8", "1200"]},
  "ex-2am-muqarana-kasrayn-l4-008:q1": {"k": "calc", "e": ["-", "1", "3/10", "1/5"]},
  "ex-2am-muqarana-kasrayn-l4-008:q2": {"k": "pick", "mode": "max", "items": [{"v": "3/10", "label": "الشمالي"}, {"v": "1/5", "label": "الجنوبي"}, {"v": "1/2", "label": "الشرقي", "e": ["-", "1", "3/10", "1/5"]}]},
  "ex-2am-muqarana-kasrayn-l4-008:q3": {"k": "rel", "a": "3/10", "b": "1/2", "order": [">", "<"]},
  "ex-2am-muqarana-kasrayn-l4-008:q4": {"k": "calc", "e": ["*", "1/5", "2000"]},
  "ex-2am-muqarana-kasrayn-l4-009:q1": {"k": "calc", "e": ["+", "3/8", "1/2", "1/4"]},
  "ex-2am-muqarana-kasrayn-l4-009:q2": {"k": "rel", "a": "9/8", "b": "1", "order": ["<", ">"]},
  "ex-2am-muqarana-kasrayn-l4-009:q3": {"k": "pick", "mode": "max", "items": [{"v": "3/8", "label": "الأوّل"}, {"v": "1/2", "label": "الثاني"}, {"v": "1/4", "label": "الثالث"}]},
  "ex-2am-muqarana-kasrayn-l4-009:q4": {"k": "calc", "e": ["-", "9/8", "1"]},
  "ex-2am-muqarana-kasrayn-l4-010:q1": {"k": "calc", "e": ["*", "1/4", ["-", "1", "1/2"]]},
  "ex-2am-muqarana-kasrayn-l4-010:q2": {"k": "calc", "e": ["-", "1", "1/2", "1/8"]},
  "ex-2am-muqarana-kasrayn-l4-010:q3": {"k": "pick", "mode": "max", "items": [{"v": "1/2", "label": "الأوّل"}, {"v": "1/8", "label": "الثاني", "e": ["*", "1/4", "1/2"]}, {"v": "3/8", "label": "الثالث", "e": ["-", "1", "1/2", "1/8"]}]},
  "ex-2am-muqarana-kasrayn-l4-010:q4": {"k": "ord", "dir": "asc", "opts": [["1/8", "1/2", "3/8"], ["3/8", "1/8", "1/2"], ["1/2", "3/8", "1/8"], ["1/8", "3/8", "1/2"]]},
  "ex-2am-muqarana-kasrayn-l5-001:q1": {"k": "calc", "e": ["-", "1", "9/20", "3/10"]},
  "ex-2am-muqarana-kasrayn-l5-001:q2": {"k": "pick", "mode": "max", "items": [{"v": "9/20", "label": "جمعيّة الأمل"}, {"v": "3/10", "label": "جمعيّة النور"}, {"v": "5/20", "label": "جمعيّة الفلاح", "e": ["-", "1", "9/20", "3/10"]}]},
  "ex-2am-muqarana-kasrayn-l5-001:q3": {"k": "self"},
  "ex-2am-muqarana-kasrayn-l5-001:q4": {"k": "calc", "e": ["*", "1/4", "480000"]},
  "ex-2am-muqarana-kasrayn-l5-001:q5": {"k": "calc", "e": ["*", "120000", "1/2500"]},
  "ex-2am-muqarana-kasrayn-l5-002:q1": {"k": "calc", "e": ["*", "600", "400"]},
  "ex-2am-muqarana-kasrayn-l5-002:q2": {"k": "calc", "e": ["+", "1/3", "1/6", "1/12"]},
  "ex-2am-muqarana-kasrayn-l5-002:q3": {"k": "calc", "e": ["-", "1", "7/12"]},
  "ex-2am-muqarana-kasrayn-l5-002:q4": {"k": "pick", "mode": "max", "items": [{"v": "1/3", "label": "السكنات"}, {"v": "1/6", "label": "المدرسة"}, {"v": "1/12", "label": "المساحة الخضراء"}, {"v": "5/12", "label": "الملاعب", "e": ["-", "1", ["+", "1/3", "1/6", "1/12"]]}]},
  "ex-2am-muqarana-kasrayn-l5-002:q5": {"k": "calc", "e": ["*", "1/3", "240000"]},
  "ex-2am-muqarana-kasrayn-l5-003:q1": {"k": "pick", "mode": "max", "items": [{"v": "5/16", "label": "جانفي"}, {"v": "3/8", "label": "فيفري"}, {"v": "1/8", "label": "مارس"}]},
  "ex-2am-muqarana-kasrayn-l5-003:q2": {"k": "self"},
  "ex-2am-muqarana-kasrayn-l5-003:q3": {"k": "calc", "e": ["-", "1", "5/16", "3/8", "1/8"]},
  "ex-2am-muqarana-kasrayn-l5-003:q4": {"k": "calc", "e": ["*", "5/16", "96000"]},
  "ex-2am-muqarana-kasrayn-l5-003:q5": {"k": "calc", "e": ["*", "3/16", "96000"]},
  "ex-2am-muqarana-kasrayn-l5-004:q1": {"k": "pick", "mode": "max", "items": [{"v": "3/8", "label": "القمح"}, {"v": "5/16", "label": "الرمّان"}, {"v": "1/4", "label": "الزيتون"}]},
  "ex-2am-muqarana-kasrayn-l5-004:q2": {"k": "self"},
  "ex-2am-muqarana-kasrayn-l5-004:q3": {"k": "calc", "e": ["-", "1", "3/8", "5/16", "1/4"]},
  "ex-2am-muqarana-kasrayn-l5-004:q4": {"k": "calc", "e": ["*", "1/16", "12800"]},
  "ex-2am-muqarana-kasrayn-l5-005:q1": {"k": "pick", "mode": "max", "items": [{"v": "1/4", "label": "صفيّة"}, {"v": "3/16", "label": "فاطمة"}, {"v": "1/8", "label": "خديجة"}]},
  "ex-2am-muqarana-kasrayn-l5-005:q2": {"k": "calc", "e": ["+", "1/4", "3/16", "1/8"]},
  "ex-2am-muqarana-kasrayn-l5-005:q3": {"k": "rel", "a": "9/16", "b": "1", "order": [">", "<"]},
  "ex-2am-muqarana-kasrayn-l5-005:q4": {"k": "calc", "e": ["*", ["-", "1", "9/16"], "4"]},
  "ex-2am-muqarana-kasrayn-l5-006:q1": {"k": "calc", "e": ["-", "1", "1/4", "9/20", "1/10"]},
  "ex-2am-muqarana-kasrayn-l5-006:q2": {"k": "pick", "mode": "max", "items": [{"v": "1/4", "label": "الأخ الأكبر"}, {"v": "9/20", "label": "الأخ الأوسط"}, {"v": "1/10", "label": "الأخ الأصغر"}, {"v": "1/5", "label": "الأخت", "e": ["-", "1", "1/4", "9/20", "1/10"]}]},
  "ex-2am-muqarana-kasrayn-l5-006:q3": {"k": "ord", "dir": "desc", "opts": [["9/20", "1/4", "1/10", "1/5"], ["9/20", "1/4", "1/5", "1/10"], ["9/20", "1/10", "1/5", "1/4"], ["1/10", "1/5", "1/4", "9/20"]]},
  "ex-2am-muqarana-kasrayn-l5-006:q4": {"k": "calc", "e": ["*", "9/20", "1800"]},
  "ex-2am-muqarana-kasrayn-l5-006:q5": {"k": "calc", "e": ["*", "1/5", "1800"]},
  "ex-2am-muqarana-kasrayn-l5-007:q1": {"k": "calc", "e": ["-", "1", "1/3", "5/12"]},
  "ex-2am-muqarana-kasrayn-l5-007:q2": {"k": "pick", "mode": "max", "items": [{"v": "1/3", "label": "القسم الأوّل"}, {"v": "5/12", "label": "القسم الثاني"}, {"v": "1/4", "label": "القسم الثالث", "e": ["-", "1", "1/3", "5/12"]}]},
  "ex-2am-muqarana-kasrayn-l5-007:q3": {"k": "calc", "e": ["+", "1/3", "5/12"]},
  "ex-2am-muqarana-kasrayn-l5-007:q4": {"k": "rel", "a": "3/4", "b": "1/2", "order": ["<", "=", ">"]},
  "ex-2am-muqarana-kasrayn-l5-007:q5": {"k": "ord", "dir": "asc", "opts": [["1/4", "5/12", "1/3"], ["5/12", "1/3", "1/4"], ["1/4", "1/3", "5/12"], ["1/3", "1/4", "5/12"]]},
  "ex-2am-muqarana-kasrayn-l5-007:q6": {"k": "calc", "e": ["*", "5/12", "36000"]},
  "ex-2am-muqarana-kasrayn-l5-008:q1": {"k": "calc", "e": ["-", "1", "2/5", "1/10", "3/20"]},
  "ex-2am-muqarana-kasrayn-l5-008:q2": {"k": "pick", "mode": "max", "items": [{"v": "2/5", "label": "الأوّل"}, {"v": "1/10", "label": "الثاني"}, {"v": "3/20", "label": "الثالث"}, {"v": "7/20", "label": "الرابع", "e": ["-", "1", "2/5", "1/10", "3/20"]}]},
  "ex-2am-muqarana-kasrayn-l5-008:q3": {"k": "ord", "dir": "desc", "opts": [["7/20", "3/20", "2/5", "1/10"], ["2/5", "7/20", "3/20", "1/10"], ["1/10", "3/20", "7/20", "2/5"], ["2/5", "3/20", "7/20", "1/10"]]},
  "ex-2am-muqarana-kasrayn-l5-008:q4": {"k": "calc", "e": ["+", "2/5", "3/20"]},
  "ex-2am-muqarana-kasrayn-l5-008:q5": {"k": "rel", "a": "11/20", "b": "1/2", "order": [">", "<"]},
  "ex-2am-muqarana-kasrayn-l5-008:q6": {"k": "calc", "e": ["*", "7/20", "4000"]},
  "ex-2am-muqarana-kasrayn-l5-009:q1": {"k": "pick", "mode": "min", "items": [{"v": "7/8", "label": "الأوّل"}, {"v": "3/4", "label": "الثاني"}, {"v": "9/16", "label": "الثالث"}]},
  "ex-2am-muqarana-kasrayn-l5-009:q2": {"k": "multi", "c": "1/2", "rel": ">", "items": ["7/8", "3/4", "9/16", "3/8", "5/16"]},
  "ex-2am-muqarana-kasrayn-l5-009:q3": {"k": "ord", "dir": "asc", "opts": [["9/16", "3/4", "7/8"], ["3/4", "7/8", "9/16"], ["7/8", "3/4", "9/16"], ["3/4", "9/16", "7/8"]]},
  "ex-2am-muqarana-kasrayn-l5-009:q4": {"k": "calc", "e": ["*", "9/16", "480"]},
  "ex-2am-muqarana-kasrayn-l5-009:q5": {"k": "calc", "e": ["-", "1", "9/16"]},
  "ex-2am-muqarana-kasrayn-l5-010:q1": {"k": "calc", "e": ["-", "1", "1/2", "1/6"]},
  "ex-2am-muqarana-kasrayn-l5-010:q2": {"k": "pick", "mode": "max", "items": [{"v": "1/2", "label": "القمصان"}, {"v": "1/6", "label": "السراويل"}, {"v": "1/3", "label": "الأوشحة", "e": ["-", "1", "1/2", "1/6"]}]},
  "ex-2am-muqarana-kasrayn-l5-010:q3": {"k": "ord", "dir": "asc", "opts": [["1/6", "1/2", "1/3"], ["1/6", "1/3", "1/2"], ["1/3", "1/6", "1/2"], ["1/2", "1/3", "1/6"]]},
  "ex-2am-muqarana-kasrayn-l5-010:q4": {"k": "calc", "e": ["*", "1/6", "60"]},
  "ex-2am-muqarana-kasrayn-l5-010:q5": {"k": "calc", "e": ["*", "1/3", "60"]},
};

const LET = 'ABCDEF';
const CASE_ORDER_TEXT = {
  den: 'نقارن بين البسطين لأنّ المقامين متساويان',
  num: 'نقارن بين المقامين : الأصغر مقامًا هو الأكبر لأنّ البسطين متساويان',
  mult: 'نوحّد المقامين لأنّ أحدهما مضاعف للآخر ثمّ نقارن بين البسطين',
  one: 'نقارن كلاّ من الكسرين بالعدد $1$ لأنّ أحدهما أصغر من $1$ والآخر أكبر منه',
};
const sorted = (items, dir, keyf) => [...items].sort((x, y) => (dir === 'asc' ? 1 : -1) * keyf(x).cmp(keyf(y)));
const sameList = (u, v) => u.length === v.length && u.every((x, i) => x === v[i]);

function answer(sp) {
  switch (sp.k) {
    case 'rel': return C(LET[sp.order.indexOf(rel(sp.a, sp.b))]);
    case 'yn': return C(rel(sp.a, sp.b) === sp.rel ? 'A' : 'B');
    case 'case': return C(LET[sp.order.indexOf(caseOf(sp.a, sp.b))]);
    case 'who': { const eq = q(sp.a).eq(q(sp.b)); const hit = sp.claims.map(([, c], i) => ((c === 'eq') === eq ? i : -1)).filter((i) => i >= 0); if (hit.length !== 1) throw new Error('who'); return C(LET[hit[0]]); }
    case 'ord': {
      const dir = sp.dir; const hits = [];
      sp.opts.forEach((o, i) => { const vs = o.map(q); let ok = true; for (let j = 0; j + 1 < vs.length; j++) if (dir === 'asc' ? vs[j].cmp(vs[j + 1]) >= 0 : vs[j].cmp(vs[j + 1]) <= 0) ok = false; if (ok) hits.push(i); });
      if (hits.length !== 1) throw new Error(`ord : ${hits.length} chaînes vraies`); return C(LET[hits[0]]);
    }
    case 'pick': {
      const vals = sp.items.map((it) => (it.e ? ev(it.e) : q(it.v)));
      const best = vals.reduce((bi, v, i) => ((sp.mode === 'max' ? v.cmp(vals[bi]) > 0 : v.cmp(vals[bi]) < 0) ? i : bi), 0);
      if (vals.some((v, i) => i !== best && v.cmp(vals[best]) === 0)) throw new Error('extremum non unique'); return C(LET[best]);
    }
    case 'pickrel': { const h = sp.opts.map((o, i) => (rel(o, sp.f) === sp.rel ? i : -1)).filter((i) => i >= 0); if (h.length !== 1) throw new Error('pickrel'); return C(LET[h[0]]); }
    case 'between': { const h = sp.opts.map((o, i) => (q(sp.lo).cmp(q(o)) < 0 && q(o).cmp(q(sp.hi)) < 0 ? i : -1)).filter((i) => i >= 0); if (h.length !== 1) throw new Error('between'); return C(LET[h[0]]); }
    case 'multi': return { choiceIds: sp.items.map((x, i) => (rel(x, sp.c) === sp.rel ? LET[i] : null)).filter(Boolean) };
    case 'rewrite': { const A = wr(`${sp.a}/${sp.b}`); const r = A.v.mul(new Q(BigInt(sp.d))); if (r.d !== 1n) throw new Error('rewrite'); return R(r.toString()); }
    case 'findx': {
      const hits = []; for (let x = 0; x <= 2000; x++) if (relQ(new Q(BigInt(x), BigInt(sp.d)), q(sp.c)) === sp.rel) hits.push(x);
      return R(String(sp.rel === '>' ? hits[0] : hits[hits.length - 1]));
    }
    case 'countx': { let n = 0; for (let x = 0; x <= 2000; x++) { const v = new Q(BigInt(x), BigInt(sp.d)); if (q(sp.lo).cmp(v) < 0 && v.cmp(q(sp.hi)) < 0) n++; } return R(String(n)); }
    case 'seq': { const t = sp.terms.map(wr); for (let i = 0; i + 1 < t.length; i++) if (!(t[i + 1].n.eq(t[i].n.mul(new Q(2n)).add(new Q(1n))) && t[i + 1].d === 2n * t[i].d)) throw new Error('seq : règle rompue'); const last = t[t.length - 1]; return R(new Q(last.n.n * 2n + 1n, last.d * 2n).toString()); }
    case 'calc': return R(ev(sp.e).toString());
    default: return undefined;
  }
}

export const ORACLE = {};
for (const [k, sp] of Object.entries(SPECS)) { const a = answer(sp); if (a !== undefined) ORACLE[k] = a; }

/* ── Audit du banc (appelé par practice-answer-oracle.test.mjs) : liste des problèmes (vide = conforme) ─────────────── */
const MISC_OK = /^MISC-MUQKASR-(NUMONLY|BIGDEN|NOSCALE|GAP|ONEWRONG|REVERSED)$/;
const FRAC = '\\\\dfrac\\{([0-9{},]+)\\}\\{([0-9]+)\\}';
const TOK = new RegExp(`^(?:${FRAC}|([0-9]+))$`);
const num = (s) => s.replace('{,}', '.');
/** Un jeton LaTeX « \dfrac{6{,}4}{9} » ou « 2 » → littéral du spec « 6.4/9 » / « 2 » ; null sinon. */
function lit(tok) { const m = TOK.exec(tok.trim()); if (!m) return null; return m[3] !== undefined ? m[3] : `${num(m[1])}/${m[2]}`; }
const islands = (s) => [...String(s ?? '').matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
const content$ = (c) => { const m = /^\$([^$]+)\$$/.exec(String(c).trim()); return m ? m[1].trim() : null; };
const same = (x, y) => q(x).eq(q(y)) && wr(x).d === wr(y).d && wr(x).n.eq(wr(y).n);
const related = (a, b) => a % b === 0n || b % a === 0n;
function scopeProblems(latex) {
  const out = [];
  for (const seg of latex.split(/=|<|>|\\neq|\\le|\\ge/)) {
    if (/\\times|\\div/.test(seg)) continue;
    if (!/[+-]/.test(seg.replace(/\\dfrac\{[^}]*\}\{[^}]*\}/g, 'X').replace(/\{,\}/g, ''))) continue;
    const ds = [...seg.matchAll(new RegExp(FRAC, 'g'))].map((m) => BigInt(m[2]));
    for (const a of ds) for (const b of ds) if (!related(a, b)) out.push(`dénominateurs ${a} et ${b} : cas de 3AM dans « ${latex} »`);
  }
  return out;
}
const pairProblem = (a, b, key, what) => (caseOf(a, b) ? null : `${key} : ${what} ${a} / ${b} n'est pas un cas de 2AM (cas de 3AM : multiple commun quelconque)`);

export function audit(bank) {
  const problems = [];
  const push = (m) => { if (m) problems.push(m); };
  for (const { key, q: qu } of bank) {
    const texts = [qu.statement, qu.feedback?.correct, qu.feedback?.incorrect, ...(qu.solution?.lines ?? []), ...(qu.choices ?? []).map((c) => c.content), ...(qu.hints ?? []).map((h) => h.content)];
    for (const tx of texts) {
      if (/فوائد|فائدة|(^|[\s«])ربا([\s».]|$)|خنزير|قمار|خمر|يانصيب|(^|\s)نرد(\s|$)|الساحر/.test(String(tx))) push(`${key} : mot interdit dans « ${tx} »`);
      if (/%|\\%|بالمئة|نسبة مئوية/.test(String(tx))) push(`${key} : pourcentage hors périmètre (2AM nisba-miawiya) dans « ${tx} »`);
      for (const isl of islands(tx)) {
        scopeProblems(isl).forEach(push);
        if (/\\div\s*\\dfrac|\\div\s*\\left/.test(isl)) push(`${key} : division par une fraction (3AM) dans « ${isl} »`);
        if (/[؀-ۿ]/.test(isl.replace(/\\text\{[^}]*\}/g, '')) && !/\\mathrm/.test(isl)) push(`${key} : arabe dans une île LaTeX « ${isl} »`);
      }
    }
    const sp = SPECS[key];
    if (!sp) { push(`${key} : aucun spec`); continue; }
    for (const s of qu.misconceptionSignatures ?? []) if (!MISC_OK.test(s.id)) push(`${key} : signature ${s.id} hors MISC-MUQKASR-*`);
    for (const c of qu.choices ?? []) {
      if (c.misconceptionId && !MISC_OK.test(c.misconceptionId)) push(`${key} : option ${c.id} hors MISC-MUQKASR-*`);
      if (c.isCorrect && c.misconceptionId) push(`${key} : l'option juste ${c.id} porte une misconception`);
    }
    const good = (qu.choices ?? []).filter((c) => c.isCorrect);
    const ids = (qu.choices ?? []).map((c) => c.id).join('');
    if (qu.choices && ids !== LET.slice(0, qu.choices.length)) push(`${key} : identifiants d'options ${ids}`);
    if (qu.answerType === 'choice' && good.length !== 1) push(`${key} : ${good.length} options justes`);
    if (qu.answerType === 'multiChoice' && good.length < 2) push(`${key} : un multiChoice veut au moins 2 options justes`);
    if (qu.answerType === 'rational' && String(qu.expectedAnswer).includes('/')) { const [a, b] = String(qu.expectedAnswer).split('/'); if (gcd(BigInt(a), BigInt(b)) !== 1n) push(`${key} : la clé ${qu.expectedAnswer} n'est pas réduite`); }
    const keyId = (() => { const a = answer(sp); return a && a.choiceId; })();
    const markedOk = good.map((c) => c.id);
    if (qu.answerType === 'choice' && keyId && !(markedOk.length === 1 && markedOk[0] === keyId)) push(`${key} : l'option juste du contenu est ${markedOk} mais l'oracle dit ${keyId}`);

    if (sp.k === 'rel') {
      push(pairProblem(sp.a, sp.b, key, 'la paire'));
      const ver = verdicts(sp.a, sp.b); const truth = rel(sp.a, sp.b);
      qu.choices.forEach((c, i) => {
        const t = content$(c.content); const m = t && /^(.+?)\s*([<>=])\s*(.+)$/.exec(t);
        if (!m) { push(`${key} : option ${c.id} illisible « ${c.content} »`); return; }
        const [x, y] = [lit(m[1]), lit(m[3])];
        if (x === null || y === null || !same(x, sp.a) || !same(y, sp.b)) push(`${key} : l'option ${c.id} imprime « ${c.content} » mais le spec vaut ${sp.a} ○ ${sp.b}`);
        if (m[2] !== sp.order[i]) push(`${key} : l'option ${c.id} porte ${m[2]} au lieu de ${sp.order[i]}`);
        if (c.isCorrect !== (m[2] === truth)) push(`${key} : l'option ${c.id} (${m[2]}) est ${m[2] === truth ? 'vraie' : 'fausse'} mais isCorrect = ${c.isCorrect}`);
        if (c.misconceptionId) { const id = c.misconceptionId.replace('MISC-MUQKASR-', ''); const inv = { '<': '>', '>': '<' }[truth]; if (id === 'REVERSED') { if (!(inv && m[2] === inv)) push(`${key} : REVERSED sur l'option ${c.id} qui n'est pas la relation inverse`); } else if (!(id in ver) || ver[id] !== m[2]) push(`${key} : l'option ${c.id} porte ${id} mais cette erreur donne « ${ver[id] ?? 'aucun verdict'} » et l'option dit « ${m[2]} »`); }
      });
    } else if (sp.k === 'yn') {
      push(pairProblem(sp.a, sp.b, key, 'la paire'));
      const t = islands(qu.statement)[0]; const m = t && /^(.+?)\s*([<>=])\s*(.+)$/.exec(t.trim());
      if (!m || !same(lit(m[1]) ?? '', sp.a) || !same(lit(m[3]) ?? '', sp.b) || m[2] !== sp.rel) push(`${key} : l'énoncé « ${qu.statement} » ne correspond pas au spec ${sp.a} ${sp.rel} ${sp.b}`);
      const truth = rel(sp.a, sp.b) === sp.rel;
      const a = qu.choices.find((c) => c.id === 'A'), b = qu.choices.find((c) => c.id === 'B');
      if (a.content !== 'نعم' || b.content !== 'لا') push(`${key} : options نعم / لا attendues`);
      if (a.isCorrect !== truth) push(`${key} : « نعم » ${truth ? 'est' : "n'est pas"} la bonne réponse`);
      if (a.misconceptionId) { const id = a.misconceptionId.replace('MISC-MUQKASR-', ''); const inv = { '<': '>', '>': '<' }[rel(sp.a, sp.b)]; const v = id === 'REVERSED' ? inv : verdicts(sp.a, sp.b)[id]; if (truth || v !== sp.rel) push(`${key} : « نعم » porte ${id} mais l'erreur donne « ${v} » pour l'affirmation « ${sp.rel} » (vraie : ${truth})`); }
      if (b.misconceptionId) push(`${key} : « لا » ne doit pas porter de misconception`);
    } else if (sp.k === 'case') {
      push(pairProblem(sp.a, sp.b, key, 'la paire'));
      qu.choices.forEach((c, i) => { if (c.content !== CASE_ORDER_TEXT[sp.order[i]]) push(`${key} : l'option ${c.id} n'est pas la phrase de la méthode « ${sp.order[i]} »`); if (c.misconceptionId && !(sp.order[i] === 'den' && caseOf(sp.a, sp.b) !== 'den' && c.misconceptionId === 'MISC-MUQKASR-NUMONLY')) push(`${key} : l'option ${c.id} porte ${c.misconceptionId} à tort`); });
    } else if (sp.k === 'who') {
      push(pairProblem(sp.a, sp.b, key, 'la paire'));
      qu.choices.forEach((c, i) => { if (c.content !== sp.claims[i][0]) push(`${key} : l'option ${c.id} devrait être « ${sp.claims[i][0]} »`); });
      qu.choices.forEach((c) => { if (c.misconceptionId) push(`${key} : « who » sans misconception`); });
    } else if (sp.k === 'ord') {
      const dir = sp.dir; const sym = dir === 'asc' ? '<' : '>';
      const items = sp.opts[0].slice().sort(); // l'ensemble des fractions
      for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) push(pairProblem(items[i], items[j], key, 'la paire'));
      const dist = new Set(sp.opts[0].map((x) => String(q(x)))); if (dist.size !== sp.opts[0].length) push(`${key} : deux valeurs égales dans l'ordre`);
      const strict = sorted(sp.opts[0], dir, (x) => q(x));
      qu.choices.forEach((c, i) => {
        const t = content$(c.content); const parts = t ? t.split(new RegExp(`\\s*${sym === '<' ? '<' : '>'}\\s*`)).map(lit) : [];
        if (!parts.length || parts.includes(null)) { push(`${key} : option ${c.id} illisible « ${c.content} »`); return; }
        if (!sameList(parts, sp.opts[i])) push(`${key} : l'option ${c.id} imprime ${parts.join(sym)} mais le spec vaut ${sp.opts[i].join(sym)}`);
        if (sameList([...parts].sort(), items) === false) push(`${key} : l'option ${c.id} n'a pas les mêmes fractions`);
        const isTrue = sameList(parts.map((p) => String(q(p))), strict.map((p) => String(q(p))));
        if (c.isCorrect !== isTrue) push(`${key} : l'option ${c.id} ${isTrue ? 'est' : "n'est pas"} l'ordre ${dir} mais isCorrect = ${c.isCorrect}`);
        if (c.misconceptionId) {
          const id = c.misconceptionId.replace('MISC-MUQKASR-', '');
          let want = null;
          if (id === 'REVERSED') want = [...strict].reverse();
          if (id === 'NUMONLY') { const ks = items.map((x) => String(wr(x).n)); if (new Set(ks).size === ks.length) want = sorted(sp.opts[0], dir, (x) => wr(x).n); }
          if (id === 'BIGDEN') { const ks = items.map((x) => String(wr(x).d)); if (new Set(ks).size === ks.length) want = sorted(sp.opts[0], dir, (x) => new Q(wr(x).d)); }
          if (!want) push(`${key} : l'option ${c.id} porte ${id} mais cette erreur n'a pas d'ordre sans égalité`);
          else if (!sameList(parts, want)) push(`${key} : l'option ${c.id} n'est pas l'ordre que donne l'erreur ${id}`);
        }
      });
    } else if (sp.k === 'pick') {
      const its = sp.items; const vals = its.map((it) => (it.e ? ev(it.e) : q(it.v)));
      its.forEach((it) => { if (it.e && !ev(it.e).eq(q(it.v))) push(`${key} : l'expression ${JSON.stringify(it.e)} ne vaut pas ${it.v}`); });
      for (let i = 0; i < its.length; i++) for (let j = i + 1; j < its.length; j++) push(pairProblem(its[i].v, its[j].v, key, 'la paire'));
      const ext = (f) => { const v = its.map(f); const t = v.reduce((a, b) => ((sp.mode === 'max' ? b.cmp(a) > 0 : b.cmp(a) < 0) ? b : a)); const hits = v.map((x, i) => (x.cmp(t) === 0 ? i : -1)).filter((i) => i >= 0); return hits.length === 1 ? hits[0] : null; };
      const nu = ext((it) => wr(it.v).n), bd = ext((it) => new Q(wr(it.v).d));
      const best = vals.reduce((bi, v, i) => ((sp.mode === 'max' ? v.cmp(vals[bi]) > 0 : v.cmp(vals[bi]) < 0) ? i : bi), 0);
      qu.choices.forEach((c, i) => {
        if (its[i].label ? c.content !== its[i].label : lit(content$(c.content) ?? '') !== its[i].v) push(`${key} : l'option ${c.id} « ${c.content} » ne correspond pas au spec ${its[i].label ?? its[i].v}`);
        if (c.isCorrect !== (i === best)) push(`${key} : l'option ${c.id} ${i === best ? 'est' : "n'est pas"} la bonne mais isCorrect = ${c.isCorrect}`);
        if (c.misconceptionId) { const id = c.misconceptionId.replace('MISC-MUQKASR-', ''); const tgt = id === 'NUMONLY' ? nu : (id === 'BIGDEN' ? bd : -1); if (tgt !== i) push(`${key} : l'option ${c.id} porte ${id} mais ce n'est pas le choix de cette erreur`); if (i === best) push(`${key} : l'erreur ${id} donne la bonne réponse`); }
      });
    } else if (sp.k === 'pickrel') {
      sp.opts.forEach((o) => push(pairProblem(o, sp.f, key, 'la paire')));
      qu.choices.forEach((c, i) => {
        if (lit(content$(c.content) ?? '') !== sp.opts[i]) push(`${key} : l'option ${c.id} ne correspond pas au spec ${sp.opts[i]}`);
        const ok = rel(sp.opts[i], sp.f) === sp.rel; if (c.isCorrect !== ok) push(`${key} : l'option ${c.id} ${ok ? 'vérifie' : 'ne vérifie pas'} la relation mais isCorrect = ${c.isCorrect}`);
        if (c.misconceptionId === 'MISC-MUQKASR-NUMONLY') { const A = wr(sp.opts[i]), F = wr(sp.f); if (!(relQ(A.n, F.n) === sp.rel && A.d !== F.d && !ok)) push(`${key} : NUMONLY mal posé sur ${c.id}`); } else if (c.misconceptionId) push(`${key} : misconception inattendue sur ${c.id}`);
      });
    } else if (sp.k === 'between') {
      sp.opts.forEach((o) => { push(pairProblem(o, sp.lo, key, 'la paire')); push(pairProblem(o, sp.hi, key, 'la paire')); });
      qu.choices.forEach((c, i) => {
        if (lit(content$(c.content) ?? '') !== sp.opts[i]) push(`${key} : l'option ${c.id} ne correspond pas au spec ${sp.opts[i]}`);
        const ok = q(sp.lo).cmp(q(sp.opts[i])) < 0 && q(sp.opts[i]).cmp(q(sp.hi)) < 0; if (c.isCorrect !== ok) push(`${key} : l'option ${c.id} ${ok ? 'est' : "n'est pas"} entre les deux mais isCorrect = ${c.isCorrect}`);
      });
      const [i1, i2] = [islands(qu.statement)[0], islands(qu.statement)[1]]; if (!(lit(i1 ?? '') && same(lit(i1), sp.lo) && same(lit(i2 ?? ''), sp.hi))) push(`${key} : l'énoncé ne cite pas ${sp.lo} et ${sp.hi}`);
    } else if (sp.k === 'multi') {
      sp.items.forEach((x) => push(pairProblem(x, sp.c, key, 'la paire')));
      qu.choices.forEach((c, i) => {
        if (lit(content$(c.content) ?? '') !== sp.items[i]) push(`${key} : l'option ${c.id} ne correspond pas au spec ${sp.items[i]}`);
        const ok = rel(sp.items[i], sp.c) === sp.rel; if (c.isCorrect !== ok) push(`${key} : l'option ${c.id} ${ok ? 'vérifie' : 'ne vérifie pas'} la relation mais isCorrect = ${c.isCorrect}`);
        if (c.misconceptionId) push(`${key} : multiChoice sans misconception (${c.id})`);
      });
    } else if (sp.k === 'rewrite') {
      if (Number(wr(`${sp.a}/${sp.b}`).d) === 0 || BigInt(sp.d) % BigInt(sp.b) !== 0n) push(`${key} : ${sp.d} n'est pas un multiple de ${sp.b}`);
      const st = islands(qu.statement)[0] ?? ''; const m = new RegExp(`^${FRAC} = \\\\dfrac\\{\\\\square\\}\\{([0-9]+)\\}$`).exec(st.trim());
      if (!m || num(m[1]) !== String(sp.a) || m[2] !== String(sp.b) || m[3] !== String(sp.d)) push(`${key} : l'énoncé « ${st} » ne correspond pas à ${sp.a}/${sp.b} = □/${sp.d}`);
      const sg = qu.misconceptionSignatures ?? [];
      if (sg.length !== 1 || sg[0].id !== 'MISC-MUQKASR-NOSCALE' || !q(sg[0].value).eq(q(sp.a))) push(`${key} : la signature NOSCALE doit valoir ${sp.a} (le numérateur inchangé)`);
      if (q(sg[0]?.value ?? '0').eq(q(String(answer(sp).value)))) push(`${key} : NOSCALE donne la bonne réponse`);
    } else if (sp.k === 'findx') {
      const st = islands(qu.statement).find((t) => t.includes('dfrac{x}')) ?? ''; const m = new RegExp(`^\\\\dfrac\\{x\\}\\{([0-9]+)\\}\\s*([<>])\\s*(.+)$`).exec(st.trim());
      if (!m || m[1] !== String(sp.d) || m[2] !== sp.rel || !lit(m[3]) || !same(lit(m[3]), sp.c)) push(`${key} : l'énoncé « ${st} » ne correspond pas au spec`);
      if (BigInt(sp.d) % wr(sp.c).d !== 0n) push(`${key} : ${sp.d} n'est pas multiple du dénominateur de ${sp.c}`);
    } else if (sp.k === 'countx') {
      const st = islands(qu.statement).find((t) => t.includes('dfrac{x}')) ?? ''; const m = new RegExp(`^(.+?)\\s*<\\s*\\\\dfrac\\{x\\}\\{([0-9]+)\\}\\s*<\\s*(.+)$`).exec(st.trim());
      if (!m || m[2] !== String(sp.d) || !same(lit(m[1]) ?? '', sp.lo) || !same(lit(m[3]) ?? '', sp.hi)) push(`${key} : l'énoncé « ${st} » ne correspond pas au spec`);
      if (BigInt(sp.d) % wr(sp.lo).d !== 0n || BigInt(sp.d) % wr(sp.hi).d !== 0n) push(`${key} : ${sp.d} n'est pas multiple des dénominateurs de ${sp.lo}, ${sp.hi}`);
    } else if (sp.k === 'seq') {
      const next = answer(sp).value; if (String(qu.expectedAnswer) !== next) push(`${key} : suite : ${qu.expectedAnswer} ≠ ${next}`);
    }
    if (sp.k === 'calc' || sp.k === 'rewrite' || sp.k === 'findx' || sp.k === 'countx' || sp.k === 'seq') {
      if (qu.answerType !== 'rational') push(`${key} : ${sp.k} attend une réponse rationnelle`);
    }
    if (sp.k === 'self' && qu.answerType !== 'selfCheck') push(`${key} : self attend selfCheck`);
    if (qu.answerType === 'selfCheck' && !(qu.solution?.lines?.length)) push(`${key} : selfCheck sans corrigé`);
  }
  return problems;
}
