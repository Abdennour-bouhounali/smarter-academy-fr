// Oracle du banc « wadiya-idmajiya-kusur-amaliyat » (« أدمج تعلّماتي — الكسور والعمليات عليها », synthèse de l'unité 2 de 2AM, 2026-10-29).
// Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI à partir des nombres de l'énoncé retapés en littéraux ASCII (« 3/8 », « -1/4 », « 43.8 », « 120*75 ») :
//  - l'évaluateur de chaînes de rationnels EXACTS (BigInt, priorités, décimaux, « a/b » littéral) est celui du banc frère `amaliyat-natiqa`
//    (E), IMPORTÉ, pas recopié ; l'oracle n'importe rien de packages/core et ne lit jamais `expectedAnswer` pour calculer ;
//  - SPEC : une spécification par question, de l'un de ces genres (les opérandes sont ceux de l'énoncé, ou DÉRIVÉS d'une étape précédente
//    de la même feuille — l'audit exige qu'un opérande figure dans l'énoncé ou soit la clé d'une question précédente) :
//      sum (somme signée, n ± a/b) · rest (1 − Σ parts) · prod (a/b × c/d, n × a/b) · of (a/b de N) · ofrest (a/b de ce qui reste, × N) ·
//      whole (le tout depuis UNE fraction unitaire : MULTIPLICATION, jamais division par une fraction) · rw (nouveau numérateur) ·
//      euc (quotient / reste / « combien d'éléments contenants » = quotient + 1 si le reste n'est pas nul) · unitApx (valeur approchée
//      à l'unité) · dec (valeur approchée par défaut / par excès à 10^-k par division longue chiffre par chiffre, JAMAIS « arrondie ») ·
//      clr (plus petite puissance de 10 qui rend le diviseur naturel) · area / peri (aire / périmètre d'un rectangle) · free (calcul libre) ;
//      QCM jugés option par option (UNE seule option juste, la marquée) : eucEq, brn, decBr, cmp, ynRel, ext, ext2, ord, ynVal, ynPlain, pick ;
//      self (selfCheck : chaque égalité du corrigé type est re-vérifiée).
//  - audit(bank) contrôle chaque ÉTIQUETTE MISC-* : la signature (ou l'option) vaut EXACTEMENT ce que produit l'erreur nommée, recalculée :
//      JAMKASR-ACROSS = (Σ numérateurs) / (Σ dénominateurs) · NOSCALE = (Σ numérateurs) / (plus grand dénominateur) · DENSUM = Σ num / Σ dén (mêmes
//      dénominateurs) · NATURAL = (n ± a)/b · PART = la somme au lieu du reste ; JIDAKASR-SUMACROSS = (a+c)/(b+d) · DENSUM = ac/(b+d) · CROSS = ad/(bc) ·
//      BOTHMUL = na/(nb) · FLIP = N × b/a · HALFWAY = N / b · OFWHOLE = f × N · OFSPENT = f × (ce qui est parti) × N ; SYN-KASR2-WHOLE = la fraction
//      de la partie prise pour la fraction du tout (le 1er facteur seul) · SYN-KASR2-PERIM = le périmètre au lieu de l'aire (et inversement) ·
//      SYN-KASR2-FRACONLY = on compare les fractions et non les montants ; HASR-BAQI-HASIL = reste ↔ quotient · HASR-BAQI-AKBAR = (q − 1) ou (r + b) ·
//      HASR-IZAHA = q + 1 · HASR-NAQS-ZIYADA = valeur par défaut / par excès confondues · QARIBA-SWAP = l'autre valeur · RANK = la même valeur au rang
//      suivant · ROUNDED = arrondi au plus proche · REMCOMMA = le reste écrit après la virgule ; MUQKASR-NUMONLY = on compare les numérateurs seuls ·
//      BIGDEN = le plus grand dénominateur est le plus grand · REVERSED = le sens renversé.
// Les périmètres de 1AM–2AM (aire, périmètre, coût) sont `counted: false` ; aucune somme n'a de dénominateurs non emboîtés (cas de 3AM : jamais),
// aucune comparaison hors des quatre cas de 2AM, aucune division par une fraction, aucun pourcentage.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C } from './helpers.mjs';
import { E, TEX } from './amaliyat-natiqa.mjs';

/* ── outils exacts (au-dessus de E) ────────────────────────────────────────── */
const V = (s) => E(String(s).replace(/,/g, '.'));
const same = (x, y) => x.eq(y);
const cmpQ = (x, y) => (x.lt(y) ? -1 : y.lt(x) ? 1 : 0);
const ZERO = E('0');
const mk = (n, d) => E(`${n}/${d}`);
const num = (x) => (x.d === 1n ? String(x.n) : `${x.n}/${x.d}`);
const relOf = (a, b) => (a.lt(b) ? '<' : b.lt(a) ? '>' : '=');
const flipRel = (r) => ({ '<': '>', '>': '<', '=': '=' }[r]);
/** [numérateur, dénominateur] littéraux d'une chaîne « a/b » ou d'un naturel « n » */
const nd = (s) => { const t = String(s).replace(/^[+-]/, ''); const m = /^(\d+)\/(\d+)$/.exec(t); return m ? [BigInt(m[1]), BigInt(m[2])] : [BigInt(t), 1n]; };
const isFr = (s) => /\//.test(String(s));
const sg = (s) => (String(s).startsWith('-') ? -1n : 1n);
const terms = (t) => t.map((s) => ({ s: sg(s), body: String(s).replace(/^[+-]/, '') }));
const sumV = (t) => V(t.join(''));
const maxBig = (xs) => xs.reduce((a, b) => (b > a ? b : a), 0n);
const nest = (ds) => { const D = maxBig(ds); return ds.every((d) => D % d === 0n); };
/** division longue : partie entière, k chiffres, reste */
const longDiv = (v, k) => { let rest = v.n; const d = v.d; const int = rest / d; rest %= d; let digits = ''; for (let i = 0; i < k; i++) { rest *= 10n; digits += String(rest / d); rest %= d; } return { int, digits, rest }; };
const joinDec = (int, digits) => { const s = digits.replace(/0+$/, ''); return s ? `${int}.${s}` : String(int); };
const DEF = (v, k) => { const { int, digits } = longDiv(v, k); return joinDec(int, digits); };
const EXC = (v, k) => { const { int, digits, rest } = longDiv(v, k); if (rest === 0n) throw new Error(`${num(v)} s'arrête à ${k} décimales : pas de valeur par excès distincte`); const N = BigInt(int.toString() + digits) + 1n; const s = N.toString().padStart(k + 1, '0'); return joinDec(s.slice(0, s.length - k), k ? s.slice(-k) : ''); };
const ROUND = (v, k) => { const sc = 10n ** BigInt(k); const f = (2n * v.n * sc + v.d) / (2n * v.d); const s = f.toString().padStart(k + 1, '0'); return joinDec(s.slice(0, s.length - k), k ? s.slice(-k) : ''); };
const clear = (n, d) => { let p = 1n; for (;;) { const a = V(n).mul(E(String(p))), b = V(d).mul(E(String(p))); if (a.d === 1n && b.d === 1n) return { p, a: a.n, b: b.n }; p *= 10n; } };
const stepOf = (k) => V(`1/${10n ** BigInt(k)}`);

/* ── valeur juste d'une spec ─────────────────────────────────────────────── */
export function trueOf(s) {
  switch (s.k) {
    case 'sum': return sumV(s.t);
    case 'rest': return V(`1-${s.parts.join('-')}`);
    case 'prod': return V(`${s.f[0]}*${s.f[1]}`);
    case 'of': return V(`${s.f}*${s.n}`);
    case 'ofrest': return V(`${s.f}*(1-${s.spent.join('-')})${s.n ? `*${s.n}` : ''}`);
    case 'whole': { const [n, d] = nd(s.f); if (n !== 1n) throw new Error('whole : fraction unitaire seulement (jamais une division par une fraction)'); return V(`${s.part}*${d}`); }
    case 'rw': { const [n, d] = nd(s.f); const D = BigInt(s.D); if (D % d !== 0n) throw new Error('rw : multiple attendu'); return E(String(n * (D / d))); }
    case 'euc': { const a = BigInt(s.a), b = BigInt(s.b); const q = a / b, r = a % b; return E(String(s.ask === 'q' ? q : s.ask === 'r' ? r : r === 0n ? (() => { throw new Error('need : reste nul'); })() : q + 1n)); }
    case 'unitApx': { const a = BigInt(s.a), b = BigInt(s.b); const q = a / b; if (a % b === 0n) throw new Error('unitApx : reste nul'); return E(String(s.mode === 'exc' ? q + 1n : q)); }
    case 'dec': { const v = V(s.n).div(V(s.d)); return V(s.mode === 'exc' ? EXC(v, s.r) : DEF(v, s.r)); }
    case 'clr': return E(String(clear(s.n, s.d).p));
    case 'area': return V(`${s.L}*${s.l}`);
    case 'peri': return V(`2*(${s.L}+${s.l})`);
    case 'free': return V(s.e);
    default: throw new Error(`trueOf : genre ${s.k}`);
  }
}
/** ce que produit l'erreur nommée `id` sur la spec `s` (null = l'erreur n'existe pas pour ce genre) */
export function errOf(s, id) {
  switch (id) {
    case 'MISC-JAMKASR-ACROSS': case 'MISC-JAMKASR-NOSCALE': case 'MISC-JAMKASR-DENSUM': {
      if (s.k !== 'sum') return null; const ts = terms(s.t); if (ts.length < 2 || ts.some((t) => !isFr(t.body))) return null;
      const ns = ts.reduce((a, t) => a + t.s * nd(t.body)[0], 0n); const ds = ts.map((t) => nd(t.body)[1]); const allEq = ds.every((d) => d === ds[0]);
      if (id === 'MISC-JAMKASR-DENSUM') return allEq ? mk(ns, ds.reduce((a, b) => a + b, 0n)) : null;
      if (allEq) return null;
      return id === 'MISC-JAMKASR-ACROSS' ? mk(ns, ds.reduce((a, b) => a + b, 0n)) : mk(ns, maxBig(ds));
    }
    case 'MISC-JAMKASR-NATURAL': { if (s.k !== 'sum') return null; const ts = terms(s.t); if (ts.length !== 2 || ts.filter((t) => isFr(t.body)).length !== 1) return null; const f = ts.find((t) => isFr(t.body)); const ns = ts.reduce((a, t) => a + t.s * (isFr(t.body) ? nd(t.body)[0] : BigInt(t.body)), 0n); return mk(ns, nd(f.body)[1]); }
    case 'MISC-JAMKASR-PART': return s.k === 'rest' ? V(s.parts.join('+')) : null;
    case 'MISC-JIDAKASR-SUMACROSS': case 'MISC-JIDAKASR-DENSUM': case 'MISC-JIDAKASR-CROSS': {
      if (s.k !== 'prod' || !isFr(s.f[0]) || !isFr(s.f[1])) return null; const [a, b] = nd(s.f[0]), [c, d] = nd(s.f[1]);
      return id === 'MISC-JIDAKASR-SUMACROSS' ? mk(a + c, b + d) : id === 'MISC-JIDAKASR-DENSUM' ? mk(a * c, b + d) : mk(a * d, b * c);
    }
    case 'MISC-JIDAKASR-BOTHMUL': { if (s.k !== 'prod') return null; const [x, y] = s.f; if (isFr(x) === isFr(y)) return null; const N = isFr(x) ? BigInt(y) : BigInt(x); const f = isFr(x) ? x : y; const [a, b] = nd(f); return mk(N * a, N * b); }
    case 'MISC-SYN-KASR2-WHOLE': return s.k === 'prod' && s.part ? V(s.f[0]) : null;
    case 'MISC-JIDAKASR-FLIP': { if (s.k !== 'of') return null; const [a, b] = nd(s.f); return V(`${s.n}*${b}/${a}`); }
    case 'MISC-JIDAKASR-HALFWAY': { if (s.k !== 'of') return null; const [, b] = nd(s.f); return V(`${s.n}/${b}`); }
    case 'MISC-JIDAKASR-OFWHOLE': return s.k === 'ofrest' ? V(`${s.f}${s.n ? `*${s.n}` : ''}`) : null;
    case 'MISC-JIDAKASR-OFSPENT': return s.k === 'ofrest' ? V(`${s.f}*(${s.spent.join('+')})${s.n ? `*${s.n}` : ''}`) : null;
    case 'MISC-SYN-KASR2-PERIM': return s.k === 'area' ? V(`2*(${s.L}+${s.l})`) : s.k === 'peri' ? V(`${s.L}*${s.l}`) : null;
    case 'MISC-HASR-BAQI-HASIL': { if (s.k === 'euc') { const a = BigInt(s.a), b = BigInt(s.b); return E(String(s.ask === 'q' ? a % b : s.ask === 'r' ? a / b : a % b)); } if (s.k === 'unitApx') return E(String(BigInt(s.a) % BigInt(s.b))); return null; }
    case 'MISC-HASR-BAQI-AKBAR': { if (s.k !== 'euc' || s.ask === 'need') return null; const a = BigInt(s.a), b = BigInt(s.b); return E(String(s.ask === 'q' ? a / b - 1n : a % b + b)); }
    case 'MISC-HASR-IZAHA': return s.k === 'euc' && s.ask === 'q' ? E(String(BigInt(s.a) / BigInt(s.b) + 1n)) : null;
    case 'MISC-HASR-NAQS-ZIYADA': { if (s.k === 'euc' && s.ask === 'need') return E(String(BigInt(s.a) / BigInt(s.b))); if (s.k === 'unitApx') { const q = BigInt(s.a) / BigInt(s.b); return E(String(s.mode === 'exc' ? q : q + 1n)); } return null; }
    case 'MISC-QARIBA-SWAP': { if (s.k !== 'dec') return null; const v = V(s.n).div(V(s.d)); return V(s.mode === 'exc' ? DEF(v, s.r) : EXC(v, s.r)); }
    case 'MISC-QARIBA-RANK': { if (s.k !== 'dec') return null; const v = V(s.n).div(V(s.d)); return V(s.mode === 'exc' ? EXC(v, s.r + 1) : DEF(v, s.r + 1)); }
    case 'MISC-QARIBA-ROUNDED': { if (s.k !== 'dec' || s.mode !== 'def') return null; return V(ROUND(V(s.n).div(V(s.d)), s.r)); }
    case 'MISC-QARIBA-REMCOMMA': { if (s.k !== 'dec' || s.mode !== 'def') return null; const { a, b } = clear(s.n, s.d); return V(`${a / b}.${a % b}`); }
    default: return undefined;
  }
}
// MISC-JAMKASR-NOSCALE sert aussi pour « rw » (le numérateur reste tel quel) : cas particulier.
const errOfAny = (s, id) => (s.k === 'rw' && id === 'MISC-JAMKASR-NOSCALE' ? E(String(nd(s.f)[0])) : s.k === 'rw' ? null : errOf(s, id));
const MISC = /^MISC-(JAMKASR-(ACROSS|NOSCALE|DENSUM|PART|NATURAL)|JIDAKASR-(SUMACROSS|DENSUM|CROSS|BOTHMUL|FLIP|HALFWAY|OFWHOLE|OFSPENT)|MUQKASR-(NUMONLY|BIGDEN|REVERSED)|HASR-(BAQI-HASIL|BAQI-AKBAR|IZAHA|NAQS-ZIYADA|HISAB)|QARIBA-(SWAP|RANK|ROUNDED|REMCOMMA)|SYN-KASR2-(WHOLE|PERIM|FRACONLY))$/;
/** relation que prononce l'élève qui commet l'erreur sur deux fractions a, b (littéraux) */
const studentRel = (id, a, b) => {
  const [an, ad] = nd(a), [bn, bd] = nd(b);
  if (id === 'MISC-MUQKASR-NUMONLY') return relOf(E(String(an)), E(String(bn)));
  if (id === 'MISC-MUQKASR-BIGDEN') return relOf(E(String(ad)), E(String(bd)));
  if (id === 'MISC-MUQKASR-REVERSED') return flipRel(relOf(V(a), V(b)));
  return null;
};
/** le cas de comparaison de 2AM d'une paire de fractions ou null (cas de 3AM) */
const cmpCase = (a, b) => {
  const [an, ad] = nd(a), [bn, bd] = nd(b);
  if (ad === bd) return 'sameDen'; if (an === bn) return 'sameNum'; if (ad % bd === 0n || bd % ad === 0n) return 'multiple';
  const one = E('1'); const A = V(a), B = V(b); if ((A.lt(one) && one.lt(B)) || (B.lt(one) && one.lt(A))) return 'viaOne';
  return null;
};
const relTest = (rel, x, r) => (rel === '>=' ? !x.lt(r) : rel === '>' ? r.lt(x) : rel === '<=' ? !r.lt(x) : rel === '<' ? x.lt(r) : x.eq(r));
const LET = 'ABCDEF';
const pickOne = (flags, what) => { const hits = flags.map((f, k) => (f ? k : -1)).filter((k) => k >= 0); if (hits.length !== 1) throw new Error(`${what} : ${hits.length} options justes`); return hits[0]; };
const argext = (vals, dir) => { let b = 0; vals.forEach((v, i) => { if ((dir === 'max' && vals[b].lt(v)) || (dir === 'min' && v.lt(vals[b]))) b = i; }); if (vals.filter((v) => v.eq(vals[b])).length !== 1) throw new Error('égalité pour le plus grand / plus petit'); return b; };
const parsePair = (v) => v.split(',');
/** la lettre de la bonne option d'un QCM, recalculée */
export function choiceKey(s) {
  switch (s.k) {
    case 'eucEq': { const a = BigInt(s.a), b = BigInt(s.b); return C(LET[pickOne(s.opts.map((o) => { const [q, r] = parsePair(o.v).map(BigInt); return b * q + r === a && r < b; }), 'eucEq')]); }
    case 'brn': { const a = BigInt(s.a), b = BigInt(s.b); const v = mk(a, b); return C(LET[pickOne(s.opts.map((o) => { const [lo, hi] = parsePair(o.v).map(BigInt); return hi - lo === 1n && E(String(lo)).lt(v) && v.lt(E(String(hi))); }), 'brn')]); }
    case 'decBr': { const v = V(s.n).div(V(s.d)); const w = stepOf(s.r); return C(LET[pickOne(s.opts.map((o) => { const [lo, hi] = parsePair(o.v).map(V); return same(hi.sub(lo), w) && lo.lt(v) && v.lt(hi); }), 'decBr')]); }
    case 'cmp': { const r = relOf(V(s.a), V(s.b)); return C(LET[pickOne(s.opts.map((o) => o.v === r), 'cmp')]); }
    case 'ext': { const vals = s.items.map(([, f]) => V(f)); const b = argext(vals, s.dir); return C(LET[pickOne(s.opts.map((o) => o.v === s.items[b][0]), 'ext')]); }
    case 'ext2': { const vals = s.items.map(([, f, n]) => V(`${f}*${n}`)); const b = argext(vals, 'max'); return C(LET[pickOne(s.opts.map((o) => o.v === s.items[b][0]), 'ext2')]); }
    case 'ord': { const vals = s.items.map((f) => V(f)); const idx = vals.map((_, i) => i).sort((i, j) => (s.dir === 'asc' ? cmpQ(vals[i], vals[j]) : cmpQ(vals[j], vals[i]))); if (new Set(vals.map(num)).size !== vals.length) throw new Error('ord : égalité'); const want = idx.map((i) => s.items[i]).join(','); return C(LET[pickOne(s.opts.map((o) => o.v === want), 'ord')]); }
    case 'ynRel': return C(relTest(s.rel, V(s.l), V(s.r)) ? 'A' : 'B');
    case 'ynVal': return C(relTest(s.rel, trueOf(s.base), V(s.thr)) ? 'A' : 'B');
    case 'ynPlain': return C(relTest(s.rel, V(s.l), V(s.r)) ? 'A' : 'B');
    case 'pick': { const tv = trueOf(s.base); return C(LET[pickOne(s.opts.map((o) => same(V(o.v), tv)), 'pick')]); }
    default: return null;
  }
}
const RATIONAL_KINDS = new Set(['sum', 'rest', 'prod', 'of', 'ofrest', 'whole', 'rw', 'euc', 'unitApx', 'dec', 'clr', 'area', 'peri', 'free']);
const answerOf = (s) => (RATIONAL_KINDS.has(s.k) ? R(num2(trueOf(s), s)) : s.k === 'self' ? null : choiceKey(s));
/** les réponses décimales (dec) s'écrivent en décimal, les autres en entier ou fraction réduite */
const num2 = (x, s) => (s.k === 'dec' ? (s.mode === 'exc' ? EXC(V(s.n).div(V(s.d)), s.r) : DEF(V(s.n).div(V(s.d)), s.r)) : num(x));

/* ── les questions (générées une fois, relues et maintenues à la main ensuite) ─ */
const SPEC = {
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-001:q1": {"k":"euc","a":"2475","b":"36","ask":"q","sigs":[{"value":"27","id":"MISC-HASR-BAQI-HASIL"},{"value":"67","id":"MISC-HASR-BAQI-AKBAR"},{"value":"69","id":"MISC-HASR-IZAHA"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-001:q2": {"k":"euc","a":"2475","b":"36","ask":"r","sigs":[{"value":"68","id":"MISC-HASR-BAQI-HASIL"},{"value":"63","id":"MISC-HASR-BAQI-AKBAR"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-001:q3": {"k":"eucEq","a":"2475","b":"36","opts":[{"v":"67,63","id":"MISC-HASR-BAQI-AKBAR"},{"v":"68,27","id":null},{"v":"27,68","id":"MISC-HASR-BAQI-HASIL"},{"v":"69,27","id":"MISC-HASR-IZAHA"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-002:q1": {"k":"brn","a":"613","b":"25","opts":[{"v":"25,26","id":"MISC-HASR-IZAHA"},{"v":"23,24","id":"MISC-HASR-IZAHA"},{"v":"24,25","id":null},{"v":"13,14","id":"MISC-HASR-BAQI-HASIL"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-002:q2": {"k":"unitApx","a":"613","b":"25","mode":"def","sigs":[{"value":"25","id":"MISC-HASR-NAQS-ZIYADA"},{"value":"13","id":"MISC-HASR-BAQI-HASIL"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-002:q3": {"k":"unitApx","a":"613","b":"25","mode":"exc","sigs":[{"value":"24","id":"MISC-HASR-NAQS-ZIYADA"},{"value":"13","id":"MISC-HASR-BAQI-HASIL"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-003:q1": {"k":"clr","n":"17.4","d":"2.3","sigs":[]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-003:q2": {"k":"dec","n":"17.4","d":"2.3","r":1,"mode":"def","sigs":[{"value":"7.6","id":"MISC-QARIBA-SWAP"},{"value":"7.56","id":"MISC-QARIBA-RANK"},{"value":"7.13","id":"MISC-QARIBA-REMCOMMA"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-003:q3": {"k":"dec","n":"17.4","d":"2.3","r":1,"mode":"exc","sigs":[{"value":"7.5","id":"MISC-QARIBA-SWAP"},{"value":"7.57","id":"MISC-QARIBA-RANK"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-004:q1": {"k":"dec","n":"20","d":"7","r":2,"mode":"def","sigs":[{"value":"2.86","id":"MISC-QARIBA-SWAP"},{"value":"2.857","id":"MISC-QARIBA-RANK"},{"value":"2.6","id":"MISC-QARIBA-REMCOMMA"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-004:q2": {"k":"dec","n":"20","d":"7","r":2,"mode":"exc","sigs":[{"value":"2.85","id":"MISC-QARIBA-SWAP"},{"value":"2.858","id":"MISC-QARIBA-RANK"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-004:q3": {"k":"decBr","n":"20","d":"7","r":2,"opts":[{"v":"2.86,2.87","id":"MISC-QARIBA-SWAP"},{"v":"2.84,2.85","id":"MISC-QARIBA-SWAP"},{"v":"2.6,2.61","id":"MISC-QARIBA-REMCOMMA"},{"v":"2.85,2.86","id":null}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-005:q1": {"k":"sum","t":["5/12","+1/4"],"sigs":[{"value":"3/8","id":"MISC-JAMKASR-ACROSS"},{"value":"1/2","id":"MISC-JAMKASR-NOSCALE"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-005:q2": {"k":"sum","t":["7/8","-1/2"],"sigs":[{"value":"3/5","id":"MISC-JAMKASR-ACROSS"},{"value":"3/4","id":"MISC-JAMKASR-NOSCALE"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-005:q3": {"k":"sum","t":["2","+3/4"],"sigs":[{"value":"5/4","id":"MISC-JAMKASR-NATURAL"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-006:q1": {"k":"sum","t":["1/2","+1/6","+1/12"],"sigs":[{"value":"3/20","id":"MISC-JAMKASR-ACROSS"},{"value":"1/4","id":"MISC-JAMKASR-NOSCALE"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-006:q2": {"k":"rest","parts":["1/2","1/6","1/12"],"sigs":[{"value":"3/4","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-007:q1": {"k":"prod","f":["2/3","9/10"],"part":false,"sigs":[{"value":"11/13","id":"MISC-JIDAKASR-SUMACROSS"},{"value":"18/13","id":"MISC-JIDAKASR-DENSUM"},{"value":"20/27","id":"MISC-JIDAKASR-CROSS"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-007:q2": {"k":"prod","f":["5","3/8"],"part":false,"sigs":[{"value":"3/8","id":"MISC-JIDAKASR-BOTHMUL"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-007:q3": {"k":"prod","f":["3/4","2/9"],"part":false,"sigs":[{"value":"5/13","id":"MISC-JIDAKASR-SUMACROSS"},{"value":"6/13","id":"MISC-JIDAKASR-DENSUM"},{"value":"27/8","id":"MISC-JIDAKASR-CROSS"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-008:q1": {"k":"of","f":"3/8","n":"640","sigs":[{"value":"5120/3","id":"MISC-JIDAKASR-FLIP"},{"value":"80","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-008:q2": {"k":"of","f":"5/6","n":"1800","sigs":[{"value":"2160","id":"MISC-JIDAKASR-FLIP"},{"value":"300","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-008:q3": {"k":"of","f":"7/10","n":"250","sigs":[{"value":"2500/7","id":"MISC-JIDAKASR-FLIP"},{"value":"25","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-009:q1": {"k":"cmp","a":"7/12","b":"5/12","opts":[{"v":">","id":null},{"v":"<","id":"MISC-MUQKASR-REVERSED"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-009:q2": {"k":"cmp","a":"3/7","b":"3/5","opts":[{"v":">","id":"MISC-MUQKASR-BIGDEN"},{"v":"<","id":null}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-009:q3": {"k":"cmp","a":"5/6","b":"7/12","opts":[{"v":">","id":null},{"v":"<","id":"MISC-MUQKASR-NUMONLY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-009:q4": {"k":"cmp","a":"8/7","b":"9/10","opts":[{"v":"<","id":"MISC-MUQKASR-NUMONLY"},{"v":">","id":null}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-010:q1": {"k":"ord","dir":"asc","items":["7/16","1/2","5/8","3/4"],"opts":[{"v":"1/2,3/4,5/8,7/16","id":"MISC-MUQKASR-NUMONLY"},{"v":"7/16,1/2,5/8,3/4","id":null},{"v":"3/4,5/8,1/2,7/16","id":"MISC-MUQKASR-REVERSED"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-010:q2": {"k":"ynRel","l":"5/8","r":"1/2","rel":">","yes":"نعم","no":"لا"},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l1-010:q3": {"k":"ynRel","l":"7/9","r":"1","rel":">","yes":"نعم","no":"لا"},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-001:q1": {"k":"ext","dir":"max","items":[["الأخ الأكبر","2/5"],["الأخ الأوسط","7/20"],["الأخ الأصغر","1/10"]],"opts":[{"v":"الأخ الأكبر","id":null},{"v":"الأخ الأوسط","id":"MISC-MUQKASR-NUMONLY"},{"v":"الأخ الأصغر","id":"MISC-MUQKASR-REVERSED"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-001:q2": {"k":"self","facts":[["2/5","8/20"],["1/10","2/20"]]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-001:q3": {"k":"rest","parts":["2/5","7/20","1/10"],"sigs":[{"value":"17/20","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-001:q4": {"k":"of","f":"2/5","n":"2000","sigs":[{"value":"5000","id":"MISC-JIDAKASR-FLIP"},{"value":"400","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-001:q5": {"k":"of","f":"3/20","n":"2000","sigs":[{"value":"40000/3","id":"MISC-JIDAKASR-FLIP"},{"value":"100","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-002:q1": {"k":"ofrest","spent":["1/5"],"f":"3/8","n":null,"sigs":[{"value":"3/8","id":"MISC-JIDAKASR-OFWHOLE"},{"value":"3/40","id":"MISC-JIDAKASR-OFSPENT"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-002:q2": {"k":"ofrest","spent":["1/5"],"f":"3/8","n":"600","sigs":[{"value":"225","id":"MISC-JIDAKASR-OFWHOLE"},{"value":"45","id":"MISC-JIDAKASR-OFSPENT"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-002:q3": {"k":"rest","parts":["1/5","3/10"],"sigs":[]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-002:q4": {"k":"of","f":"1/2","n":"600","sigs":[{"value":"1200","id":"MISC-JIDAKASR-FLIP"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-003:q1": {"k":"of","f":"2/5","n":"2000","sigs":[{"value":"5000","id":"MISC-JIDAKASR-FLIP"},{"value":"400","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-003:q2": {"k":"of","f":"3/10","n":"3000","sigs":[{"value":"10000","id":"MISC-JIDAKASR-FLIP"},{"value":"300","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-003:q3": {"k":"ext2","items":[["إيمان","2/5","2000"],["آية","3/10","3000"]],"opts":[{"v":"إيمان","id":"MISC-SYN-KASR2-FRACONLY"},{"v":"آية","id":null}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-003:q4": {"k":"self","facts":[["2/5*2000","800"],["3/10*3000","900"]]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-004:q1": {"k":"rest","parts":["1/8"],"sigs":[{"value":"1/8","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-004:q2": {"k":"whole","part":"45","f":"1/8","sigs":[]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-004:q3": {"k":"of","f":"7/8","n":"360","sigs":[{"value":"2880/7","id":"MISC-JIDAKASR-FLIP"},{"value":"45","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-005:q1": {"k":"sum","t":["2/5","+3/20"],"sigs":[{"value":"1/5","id":"MISC-JAMKASR-ACROSS"},{"value":"1/4","id":"MISC-JAMKASR-NOSCALE"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-005:q2": {"k":"rest","parts":["2/5","3/20"],"sigs":[{"value":"11/20","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-005:q3": {"k":"of","f":"9/20","n":"4000","sigs":[{"value":"80000/9","id":"MISC-JIDAKASR-FLIP"},{"value":"200","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-005:q4": {"k":"ynVal","base":{"k":"of","f":"9/20","n":"4000","sigs":[{"value":"80000/9","id":"MISC-JIDAKASR-FLIP"},{"value":"200","id":"MISC-JIDAKASR-HALFWAY"}]},"rel":">=","thr":"2000","yes":"نعم","no":"لا"},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-006:q1": {"k":"euc","a":"1275","b":"48","ask":"q","sigs":[{"value":"27","id":"MISC-HASR-BAQI-HASIL"},{"value":"25","id":"MISC-HASR-BAQI-AKBAR"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-006:q2": {"k":"euc","a":"1275","b":"48","ask":"r","sigs":[{"value":"26","id":"MISC-HASR-BAQI-HASIL"},{"value":"75","id":"MISC-HASR-BAQI-AKBAR"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-006:q3": {"k":"euc","a":"1275","b":"48","ask":"need","sigs":[{"value":"26","id":"MISC-HASR-NAQS-ZIYADA"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-007:q1": {"k":"clr","n":"28.4","d":"0.9","sigs":[]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-007:q2": {"k":"euc","a":"284","b":"9","ask":"q","sigs":[{"value":"5","id":"MISC-HASR-BAQI-HASIL"},{"value":"30","id":"MISC-HASR-BAQI-AKBAR"},{"value":"32","id":"MISC-HASR-IZAHA"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-007:q3": {"k":"dec","n":"28.4","d":"0.9","r":2,"mode":"def","sigs":[{"value":"31.56","id":"MISC-QARIBA-SWAP"},{"value":"31.555","id":"MISC-QARIBA-RANK"},{"value":"31.5","id":"MISC-QARIBA-REMCOMMA"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-007:q4": {"k":"dec","n":"28.4","d":"0.9","r":2,"mode":"exc","sigs":[{"value":"31.55","id":"MISC-QARIBA-SWAP"},{"value":"31.556","id":"MISC-QARIBA-RANK"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-008:q1": {"k":"sum","t":["5/12","+1/4"],"sigs":[{"value":"3/8","id":"MISC-JAMKASR-ACROSS"},{"value":"1/2","id":"MISC-JAMKASR-NOSCALE"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-008:q2": {"k":"rest","parts":["5/12","1/4"],"sigs":[{"value":"2/3","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-008:q3": {"k":"of","f":"1/3","n":"360","sigs":[{"value":"1080","id":"MISC-JIDAKASR-FLIP"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-009:q1": {"k":"cmp","a":"5/8","b":"3/4","opts":[{"v":">","id":"MISC-MUQKASR-NUMONLY"},{"v":"<","id":null}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-009:q2": {"k":"ext","dir":"max","items":[["القطعة الأولى","5/8"],["القطعة الثانية","3/4"]],"opts":[{"v":"القطعة الأولى","id":"MISC-MUQKASR-NUMONLY"},{"v":"القطعة الثانية","id":null}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-009:q3": {"k":"ynRel","l":"5/8","r":"1/2","rel":">","yes":"نعم","no":"لا"},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-009:q4": {"k":"self","facts":[["3/4","6/8"]]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-010:q1": {"k":"prod","f":["2/3","3/4"],"part":true,"sigs":[{"value":"5/7","id":"MISC-JIDAKASR-SUMACROSS"},{"value":"6/7","id":"MISC-JIDAKASR-DENSUM"},{"value":"8/9","id":"MISC-JIDAKASR-CROSS"},{"value":"2/3","id":"MISC-SYN-KASR2-WHOLE"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-010:q2": {"k":"of","f":"1/2","n":"480","sigs":[{"value":"960","id":"MISC-JIDAKASR-FLIP"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-010:q3": {"k":"sum","t":["3/4","-1/2"],"sigs":[{"value":"1/3","id":"MISC-JAMKASR-ACROSS"},{"value":"1/2","id":"MISC-JAMKASR-NOSCALE"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l2-010:q4": {"k":"of","f":"1/4","n":"480","sigs":[{"value":"1920","id":"MISC-JIDAKASR-FLIP"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-001:q1": {"k":"rest","parts":["2/5","3/20"],"sigs":[{"value":"11/20","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-001:q2": {"k":"of","f":"9/20","n":"8000","sigs":[{"value":"160000/9","id":"MISC-JIDAKASR-FLIP"},{"value":"400","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-001:q3": {"k":"ynVal","base":{"k":"of","f":"9/20","n":"8000","sigs":[{"value":"160000/9","id":"MISC-JIDAKASR-FLIP"},{"value":"400","id":"MISC-JIDAKASR-HALFWAY"}]},"rel":">=","thr":"4000","yes":"نعم","no":"لا"},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-002:q1": {"k":"rest","parts":["3/10","1/2"],"sigs":[{"value":"4/5","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-002:q2": {"k":"ext","dir":"max","items":[["جمعيّة النور","3/10"],["جمعيّة الأمل","1/2"],["جمعيّة الإحسان","1/5"]],"opts":[{"v":"جمعيّة النور","id":"MISC-MUQKASR-NUMONLY"},{"v":"جمعيّة الأمل","id":null},{"v":"جمعيّة الإحسان","id":"MISC-MUQKASR-REVERSED"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-002:q3": {"k":"of","f":"3/10","n":"450000","sigs":[{"value":"1500000","id":"MISC-JIDAKASR-FLIP"},{"value":"45000","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-002:q4": {"k":"of","f":"1/2","n":"450000","sigs":[{"value":"900000","id":"MISC-JIDAKASR-FLIP"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-002:q5": {"k":"of","f":"1/5","n":"450000","sigs":[{"value":"2250000","id":"MISC-JIDAKASR-FLIP"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-002:q6": {"k":"euc","a":"90000","b":"1500","ask":"q","sigs":[{"value":"0","id":"MISC-HASR-BAQI-HASIL"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-003:q1": {"k":"ext","dir":"max","items":[["جانفي","2/9"],["فيفري","1/3"],["مارس","1/9"]],"opts":[{"v":"جانفي","id":"MISC-MUQKASR-NUMONLY"},{"v":"فيفري","id":null},{"v":"مارس","id":"MISC-MUQKASR-BIGDEN"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-003:q2": {"k":"sum","t":["2/9","+1/3","+1/9"],"sigs":[{"value":"4/21","id":"MISC-JAMKASR-ACROSS"},{"value":"4/9","id":"MISC-JAMKASR-NOSCALE"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-003:q3": {"k":"rest","parts":["2/9","1/3","1/9"],"sigs":[{"value":"2/3","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-003:q4": {"k":"of","f":"1/3","n":"180000","sigs":[{"value":"540000","id":"MISC-JIDAKASR-FLIP"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-004:q1": {"k":"rest","parts":["1/10","7/20","3/20"],"sigs":[{"value":"3/5","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-004:q2": {"k":"ext","dir":"max","items":[["اليوم الأوّل","1/10"],["اليوم الثاني","7/20"],["اليوم الثالث","3/20"],["اليوم الرابع","2/5"]],"opts":[{"v":"اليوم الأوّل","id":"MISC-MUQKASR-REVERSED"},{"v":"اليوم الثاني","id":"MISC-MUQKASR-NUMONLY"},{"v":"اليوم الثالث","id":"MISC-MUQKASR-BIGDEN"},{"v":"اليوم الرابع","id":null}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-004:q3": {"k":"of","f":"3/20","n":"640","sigs":[{"value":"12800/3","id":"MISC-JIDAKASR-FLIP"},{"value":"32","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-005:q1": {"k":"sum","t":["1/3","+1/12","+1/4"],"sigs":[{"value":"3/19","id":"MISC-JAMKASR-ACROSS"},{"value":"1/4","id":"MISC-JAMKASR-NOSCALE"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-005:q2": {"k":"rest","parts":["1/3","1/12","1/4"],"sigs":[{"value":"2/3","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-005:q3": {"k":"of","f":"1/3","n":"2400","sigs":[{"value":"7200","id":"MISC-JIDAKASR-FLIP"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-005:q4": {"k":"ord","dir":"desc","items":["1/3","1/12","1/4"],"opts":[{"v":"1/3,1/4,1/12","id":null},{"v":"1/12,1/4,1/3","id":"MISC-MUQKASR-BIGDEN"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-006:q1": {"k":"ofrest","spent":["1/6"],"f":"3/5","n":null,"sigs":[{"value":"3/5","id":"MISC-JIDAKASR-OFWHOLE"},{"value":"1/10","id":"MISC-JIDAKASR-OFSPENT"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-006:q2": {"k":"rest","parts":["1/6","1/2"],"sigs":[{"value":"2/3","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-006:q3": {"k":"of","f":"1/2","n":"36000","sigs":[{"value":"72000","id":"MISC-JIDAKASR-FLIP"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-006:q4": {"k":"of","f":"1/3","n":"36000","sigs":[{"value":"108000","id":"MISC-JIDAKASR-FLIP"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-007:q1": {"k":"rest","parts":["7/16","1/4","3/16"],"sigs":[{"value":"7/8","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-007:q2": {"k":"ord","dir":"desc","items":["7/16","1/4","3/16","1/8"],"opts":[{"v":"7/16,1/4,3/16,1/8","id":null},{"v":"1/8,3/16,1/4,7/16","id":"MISC-MUQKASR-REVERSED"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-007:q3": {"k":"sum","t":["7/16","+1/4"],"sigs":[{"value":"2/5","id":"MISC-JAMKASR-ACROSS"},{"value":"1/2","id":"MISC-JAMKASR-NOSCALE"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-007:q4": {"k":"ynVal","base":{"k":"sum","t":["7/16","+1/4"],"sigs":[{"value":"2/5","id":"MISC-JAMKASR-ACROSS"},{"value":"1/2","id":"MISC-JAMKASR-NOSCALE"}]},"rel":">","thr":"1/2","yes":"نعم","no":"لا"},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-007:q5": {"k":"of","f":"1/8","n":"3200","sigs":[{"value":"25600","id":"MISC-JIDAKASR-FLIP"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-008:q1": {"k":"sum","t":["3/10","+1/5","+1/10"],"sigs":[{"value":"1/5","id":"MISC-JAMKASR-ACROSS"},{"value":"1/2","id":"MISC-JAMKASR-NOSCALE"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-008:q2": {"k":"rest","parts":["3/10","1/5","1/10"],"sigs":[{"value":"3/5","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-008:q3": {"k":"of","f":"3/10","n":"90000","sigs":[{"value":"300000","id":"MISC-JIDAKASR-FLIP"},{"value":"9000","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-008:q4": {"k":"pick","base":{"k":"of","f":"2/5","n":"90000","sigs":[{"value":"225000","id":"MISC-JIDAKASR-FLIP"},{"value":"18000","id":"MISC-JIDAKASR-HALFWAY"}]},"opts":[{"v":"225000","id":"MISC-JIDAKASR-FLIP"},{"v":"36000","id":null},{"v":"18000","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-009:q1": {"k":"whole","part":"42","f":"1/6","sigs":[]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-009:q2": {"k":"sum","t":["1/6","+1/3"],"sigs":[{"value":"2/9","id":"MISC-JAMKASR-ACROSS"},{"value":"1/3","id":"MISC-JAMKASR-NOSCALE"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-009:q3": {"k":"of","f":"1/3","n":"252","sigs":[{"value":"756","id":"MISC-JIDAKASR-FLIP"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-010:q1": {"k":"rest","parts":["2/5","3/10"],"sigs":[{"value":"7/10","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-010:q2": {"k":"ext","dir":"max","items":[["السبت","2/5"],["الأحد","3/10"],["الإثنين","3/10"]],"opts":[{"v":"السبت","id":null},{"v":"الأحد","id":"MISC-MUQKASR-NUMONLY"},{"v":"الإثنين","id":"MISC-MUQKASR-NUMONLY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-010:q3": {"k":"of","f":"2/5","n":"1500","sigs":[{"value":"3750","id":"MISC-JIDAKASR-FLIP"},{"value":"300","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l3-010:q4": {"k":"of","f":"3/10","n":"1500","sigs":[{"value":"5000","id":"MISC-JIDAKASR-FLIP"},{"value":"150","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-001:q1": {"k":"ynRel","l":"7/20","r":"2/5","rel":">","yes":"نعم","no":"لا"},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-001:q2": {"k":"self","facts":[["2/5","8/20"]]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-001:q3": {"k":"rest","parts":["2/5","7/20","1/10"],"sigs":[{"value":"17/20","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-001:q4": {"k":"area","L":"160","l":"155","sigs":[{"value":"630","id":"MISC-SYN-KASR2-PERIM"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-001:q5": {"k":"of","f":"3/20","n":"24800","sigs":[{"value":"496000/3","id":"MISC-JIDAKASR-FLIP"},{"value":"1240","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-002:q1": {"k":"rw","f":"1/10","D":"20","sigs":[{"value":"1","id":"MISC-JAMKASR-NOSCALE"}],"tt":60},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-002:q2": {"k":"ext","dir":"max","items":[["السكنات","2/5"],["المدرسة","1/10"],["المساحة الخضراء","3/20"]],"opts":[{"v":"السكنات","id":null},{"v":"المدرسة","id":"MISC-MUQKASR-REVERSED"},{"v":"المساحة الخضراء","id":"MISC-MUQKASR-NUMONLY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-002:q3": {"k":"sum","t":["2/5","+1/10","+3/20","+1/20"],"sigs":[{"value":"7/55","id":"MISC-JAMKASR-ACROSS"},{"value":"7/20","id":"MISC-JAMKASR-NOSCALE"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-002:q4": {"k":"rest","parts":["2/5","1/10","3/20","1/20"],"sigs":[{"value":"7/10","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-002:q5": {"k":"area","L":"240","l":"150","sigs":[{"value":"780","id":"MISC-SYN-KASR2-PERIM"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-002:q6": {"k":"of","f":"2/5","n":"36000","sigs":[{"value":"90000","id":"MISC-JIDAKASR-FLIP"},{"value":"7200","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-003:q1": {"k":"area","L":"24","l":"15","sigs":[{"value":"78","id":"MISC-SYN-KASR2-PERIM"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-003:q2": {"k":"peri","L":"24","l":"15","sigs":[{"value":"360","id":"MISC-SYN-KASR2-PERIM"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-003:q3": {"k":"rest","parts":["1/3","1/6"],"sigs":[]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-003:q4": {"k":"of","f":"1/2","n":"360","sigs":[{"value":"720","id":"MISC-JIDAKASR-FLIP"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-004:q1": {"k":"area","L":"80","l":"60","sigs":[{"value":"280","id":"MISC-SYN-KASR2-PERIM"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-004:q2": {"k":"of","f":"3/4","n":"4800","sigs":[{"value":"6400","id":"MISC-JIDAKASR-FLIP"},{"value":"1200","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-004:q3": {"k":"dec","n":"1500","d":"3600","r":2,"mode":"def","sigs":[{"value":"0.42","id":"MISC-QARIBA-SWAP"},{"value":"0.416","id":"MISC-QARIBA-RANK"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-004:q4": {"k":"dec","n":"1500","d":"3600","r":2,"mode":"exc","sigs":[{"value":"0.41","id":"MISC-QARIBA-SWAP"},{"value":"0.417","id":"MISC-QARIBA-RANK"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-004:q5": {"k":"decBr","n":"1500","d":"3600","r":2,"opts":[{"v":"0.42,0.43","id":"MISC-QARIBA-SWAP"},{"v":"0.4,0.41","id":"MISC-QARIBA-SWAP"},{"v":"0.41,0.42","id":null}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-005:q1": {"k":"area","L":"16","l":"11","sigs":[{"value":"54","id":"MISC-SYN-KASR2-PERIM"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-005:q2": {"k":"dec","n":"560000","d":"176","r":2,"mode":"def","sigs":[{"value":"3181.82","id":"MISC-QARIBA-SWAP"},{"value":"3181.818","id":"MISC-QARIBA-RANK"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-005:q3": {"k":"dec","n":"560000","d":"176","r":2,"mode":"exc","sigs":[{"value":"3181.81","id":"MISC-QARIBA-SWAP"},{"value":"3181.819","id":"MISC-QARIBA-RANK"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-005:q4": {"k":"decBr","n":"560000","d":"176","r":2,"opts":[{"v":"3181.82,3181.83","id":"MISC-QARIBA-SWAP"},{"v":"3181.81,3181.82","id":null},{"v":"3181.8,3181.81","id":"MISC-QARIBA-SWAP"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-006:q1": {"k":"euc","a":"237","b":"8","ask":"q","sigs":[{"value":"5","id":"MISC-HASR-BAQI-HASIL"},{"value":"28","id":"MISC-HASR-BAQI-AKBAR"},{"value":"30","id":"MISC-HASR-IZAHA"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-006:q2": {"k":"euc","a":"237","b":"8","ask":"r","sigs":[{"value":"29","id":"MISC-HASR-BAQI-HASIL"},{"value":"13","id":"MISC-HASR-BAQI-AKBAR"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-006:q3": {"k":"euc","a":"237","b":"8","ask":"need","sigs":[{"value":"29","id":"MISC-HASR-NAQS-ZIYADA"},{"value":"5","id":"MISC-HASR-BAQI-HASIL"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-006:q4": {"k":"brn","a":"237","b":"8","opts":[{"v":"29,30","id":null},{"v":"30,31","id":"MISC-HASR-IZAHA"},{"v":"28,29","id":"MISC-HASR-IZAHA"},{"v":"5,6","id":"MISC-HASR-BAQI-HASIL"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-007:q1": {"k":"area","L":"120","l":"75","sigs":[{"value":"390","id":"MISC-SYN-KASR2-PERIM"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-007:q2": {"k":"rest","parts":["3/5","1/10"],"sigs":[{"value":"7/10","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-007:q3": {"k":"of","f":"3/5","n":"9000","sigs":[{"value":"15000","id":"MISC-JIDAKASR-FLIP"},{"value":"1800","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-007:q4": {"k":"of","f":"1/10","n":"9000","sigs":[{"value":"90000","id":"MISC-JIDAKASR-FLIP"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-007:q5": {"k":"of","f":"3/10","n":"9000","sigs":[{"value":"30000","id":"MISC-JIDAKASR-FLIP"},{"value":"900","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-007:q6": {"k":"ynRel","l":"3/10","r":"1/10","rel":">","yes":"نعم","no":"لا"},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-008:q1": {"k":"prod","f":["3/4","3/5"],"part":true,"sigs":[{"value":"2/3","id":"MISC-JIDAKASR-SUMACROSS"},{"value":"1","id":"MISC-JIDAKASR-DENSUM"},{"value":"5/4","id":"MISC-JIDAKASR-CROSS"},{"value":"3/4","id":"MISC-SYN-KASR2-WHOLE"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-008:q2": {"k":"area","L":"200","l":"90","sigs":[{"value":"580","id":"MISC-SYN-KASR2-PERIM"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-008:q3": {"k":"of","f":"9/20","n":"18000","sigs":[{"value":"40000","id":"MISC-JIDAKASR-FLIP"},{"value":"900","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-008:q4": {"k":"rest","parts":["3/5"],"sigs":[{"value":"3/5","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-009:q1": {"k":"peri","L":"60","l":"40","sigs":[{"value":"2400","id":"MISC-SYN-KASR2-PERIM"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-009:q2": {"k":"free","e":"200*350","sigs":[]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-009:q3": {"k":"area","L":"60","l":"40","sigs":[{"value":"200","id":"MISC-SYN-KASR2-PERIM"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-009:q4": {"k":"of","f":"7/10","n":"2400","sigs":[{"value":"24000/7","id":"MISC-JIDAKASR-FLIP"},{"value":"240","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-009:q5": {"k":"rest","parts":["7/10"],"sigs":[{"value":"7/10","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-010:q1": {"k":"area","L":"50","l":"30","sigs":[{"value":"160","id":"MISC-SYN-KASR2-PERIM"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-010:q2": {"k":"area","L":"60","l":"40","sigs":[{"value":"200","id":"MISC-SYN-KASR2-PERIM"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-010:q3": {"k":"ext2","items":[["القطعة الأولى","3/10","1500"],["القطعة الثانية","1/4","2400"]],"opts":[{"v":"القطعة الأولى","id":"MISC-SYN-KASR2-FRACONLY"},{"v":"القطعة الثانية","id":null}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l4-010:q4": {"k":"of","f":"1/4","n":"2400","sigs":[{"value":"9600","id":"MISC-JIDAKASR-FLIP"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-001:q1": {"k":"ext","dir":"max","items":[["اليوم الأوّل","1/3"],["اليوم الثاني","1/12"],["اليوم الثالث","1/6"]],"opts":[{"v":"اليوم الأوّل","id":null},{"v":"اليوم الثاني","id":"MISC-MUQKASR-BIGDEN"},{"v":"اليوم الثالث","id":"MISC-MUQKASR-NUMONLY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-001:q2": {"k":"sum","t":["1/3","+1/12","+1/6"],"sigs":[{"value":"1/7","id":"MISC-JAMKASR-ACROSS"},{"value":"1/4","id":"MISC-JAMKASR-NOSCALE"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-001:q3": {"k":"rest","parts":["1/3","1/12","1/6"],"sigs":[{"value":"7/12","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-001:q4": {"k":"area","L":"90","l":"160","sigs":[{"value":"500","id":"MISC-SYN-KASR2-PERIM"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-001:q5": {"k":"of","f":"7/12","n":"14400","sigs":[{"value":"172800/7","id":"MISC-JIDAKASR-FLIP"},{"value":"1200","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-001:q6": {"k":"of","f":"5/12","n":"14400","sigs":[{"value":"34560","id":"MISC-JIDAKASR-FLIP"},{"value":"1200","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-002:q1": {"k":"sum","t":["1/2","+1/6","+1/12"],"sigs":[{"value":"3/20","id":"MISC-JAMKASR-ACROSS"},{"value":"1/4","id":"MISC-JAMKASR-NOSCALE"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-002:q2": {"k":"rest","parts":["1/2","1/6","1/12"],"sigs":[{"value":"3/4","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-002:q3": {"k":"prod","f":["3/5","1/4"],"part":true,"sigs":[{"value":"4/9","id":"MISC-JIDAKASR-SUMACROSS"},{"value":"1/3","id":"MISC-JIDAKASR-DENSUM"},{"value":"12/5","id":"MISC-JIDAKASR-CROSS"},{"value":"3/5","id":"MISC-SYN-KASR2-WHOLE"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-002:q4": {"k":"area","L":"200","l":"150","sigs":[{"value":"700","id":"MISC-SYN-KASR2-PERIM"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-002:q5": {"k":"of","f":"3/20","n":"30000","sigs":[{"value":"200000","id":"MISC-JIDAKASR-FLIP"},{"value":"1500","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-002:q6": {"k":"euc","a":"4500","b":"8","ask":"q","sigs":[{"value":"4","id":"MISC-HASR-BAQI-HASIL"},{"value":"561","id":"MISC-HASR-BAQI-AKBAR"},{"value":"563","id":"MISC-HASR-IZAHA"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-003:q1": {"k":"ofrest","spent":["2/5"],"f":"1/6","n":null,"sigs":[{"value":"1/6","id":"MISC-JIDAKASR-OFWHOLE"},{"value":"1/15","id":"MISC-JIDAKASR-OFSPENT"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-003:q2": {"k":"sum","t":["2/5","+1/10"],"sigs":[{"value":"1/5","id":"MISC-JAMKASR-ACROSS"},{"value":"3/10","id":"MISC-JAMKASR-NOSCALE"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-003:q3": {"k":"of","f":"1/10","n":"60000","sigs":[{"value":"600000","id":"MISC-JIDAKASR-FLIP"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-003:q4": {"k":"of","f":"1/2","n":"60000","sigs":[{"value":"120000","id":"MISC-JIDAKASR-FLIP"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-003:q5": {"k":"ynVal","base":{"k":"of","f":"1/2","n":"60000","sigs":[{"value":"120000","id":"MISC-JIDAKASR-FLIP"}]},"rel":">=","thr":"32000","yes":"نعم","no":"لا"},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-004:q1": {"k":"rest","parts":["3/5","1/10"],"sigs":[{"value":"7/10","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-004:q2": {"k":"rest","parts":["1/2","1/10"],"sigs":[{"value":"3/5","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-004:q3": {"k":"of","f":"3/10","n":"1500","sigs":[{"value":"5000","id":"MISC-JIDAKASR-FLIP"},{"value":"150","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-004:q4": {"k":"of","f":"2/5","n":"1000","sigs":[{"value":"2500","id":"MISC-JIDAKASR-FLIP"},{"value":"200","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-004:q5": {"k":"ext2","items":[["مخبزة الأمل","3/10","1500"],["مخبزة النجاح","2/5","1000"]],"opts":[{"v":"مخبزة الأمل","id":null},{"v":"مخبزة النجاح","id":"MISC-SYN-KASR2-FRACONLY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-004:q6": {"k":"ynVal","base":{"k":"of","f":"3/10","n":"1500","sigs":[{"value":"5000","id":"MISC-JIDAKASR-FLIP"},{"value":"150","id":"MISC-JIDAKASR-HALFWAY"}]},"rel":">=","thr":"500","yes":"نعم","no":"لا"},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-005:q1": {"k":"of","f":"5/8","n":"520","sigs":[{"value":"832","id":"MISC-JIDAKASR-FLIP"},{"value":"65","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-005:q2": {"k":"rest","parts":["5/8"],"sigs":[{"value":"5/8","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-005:q3": {"k":"euc","a":"325","b":"48","ask":"q","sigs":[{"value":"37","id":"MISC-HASR-BAQI-HASIL"},{"value":"5","id":"MISC-HASR-BAQI-AKBAR"},{"value":"7","id":"MISC-HASR-IZAHA"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-005:q4": {"k":"euc","a":"325","b":"48","ask":"r","sigs":[{"value":"6","id":"MISC-HASR-BAQI-HASIL"},{"value":"85","id":"MISC-HASR-BAQI-AKBAR"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-005:q5": {"k":"euc","a":"325","b":"48","ask":"need","sigs":[{"value":"6","id":"MISC-HASR-NAQS-ZIYADA"},{"value":"37","id":"MISC-HASR-BAQI-HASIL"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-005:q6": {"k":"free","e":"7*12000","sigs":[]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-005:q7": {"k":"ynPlain","l":"7*12000","alt":"6*12000","r":"80000","rel":"<=","yes":"نعم","no":"لا","id":"MISC-HASR-NAQS-ZIYADA"},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-006:q1": {"k":"sum","t":["2/3","+1/6"],"sigs":[{"value":"1/3","id":"MISC-JAMKASR-ACROSS"},{"value":"1/2","id":"MISC-JAMKASR-NOSCALE"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-006:q2": {"k":"rest","parts":["2/3","1/6"],"sigs":[{"value":"5/6","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-006:q3": {"k":"area","L":"26","l":"18","sigs":[{"value":"88","id":"MISC-SYN-KASR2-PERIM"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-006:q4": {"k":"of","f":"2/3","n":"468","sigs":[{"value":"702","id":"MISC-JIDAKASR-FLIP"},{"value":"156","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-006:q5": {"k":"euc","a":"312","b":"15","ask":"need","sigs":[{"value":"20","id":"MISC-HASR-NAQS-ZIYADA"},{"value":"12","id":"MISC-HASR-BAQI-HASIL"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-006:q6": {"k":"ynPlain","l":"20*15","alt":"312","r":"312","rel":">=","yes":"نعم","no":"لا","id":"MISC-HASR-NAQS-ZIYADA"},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-007:q1": {"k":"clr","n":"43.8","d":"1.3","sigs":[]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-007:q2": {"k":"euc","a":"438","b":"13","ask":"q","sigs":[{"value":"9","id":"MISC-HASR-BAQI-HASIL"},{"value":"32","id":"MISC-HASR-BAQI-AKBAR"},{"value":"34","id":"MISC-HASR-IZAHA"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-007:q3": {"k":"brn","a":"438","b":"13","opts":[{"v":"34,35","id":"MISC-HASR-IZAHA"},{"v":"33,34","id":null},{"v":"32,33","id":"MISC-HASR-IZAHA"},{"v":"9,10","id":"MISC-HASR-BAQI-HASIL"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-007:q4": {"k":"dec","n":"43.8","d":"1.3","r":1,"mode":"def","sigs":[{"value":"33.7","id":"MISC-QARIBA-SWAP"},{"value":"33.69","id":"MISC-QARIBA-RANK"},{"value":"33.9","id":"MISC-QARIBA-REMCOMMA"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-007:q5": {"k":"dec","n":"43.8","d":"1.3","r":1,"mode":"exc","sigs":[{"value":"33.6","id":"MISC-QARIBA-SWAP"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-007:q6": {"k":"ynPlain","l":"33","alt":"34","r":"34","rel":">=","yes":"نعم","no":"لا","id":"MISC-HASR-NAQS-ZIYADA"},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-008:q1": {"k":"area","L":"32","l":"25","sigs":[{"value":"114","id":"MISC-SYN-KASR2-PERIM"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-008:q2": {"k":"rest","parts":["3/5"],"sigs":[{"value":"3/5","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-008:q3": {"k":"of","f":"3/5","n":"800","sigs":[{"value":"4000/3","id":"MISC-JIDAKASR-FLIP"},{"value":"160","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-008:q4": {"k":"dec","n":"1250000","d":"480","r":1,"mode":"def","sigs":[{"value":"2604.2","id":"MISC-QARIBA-SWAP"},{"value":"2604.16","id":"MISC-QARIBA-RANK"},{"value":"2604.80","id":"MISC-QARIBA-REMCOMMA"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-008:q5": {"k":"dec","n":"1250000","d":"480","r":1,"mode":"exc","sigs":[{"value":"2604.1","id":"MISC-QARIBA-SWAP"},{"value":"2604.17","id":"MISC-QARIBA-RANK"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-008:q6": {"k":"decBr","n":"1250000","d":"480","r":1,"opts":[{"v":"2604.2,2604.3","id":"MISC-QARIBA-SWAP"},{"v":"2604,2604.1","id":"MISC-QARIBA-SWAP"},{"v":"2604.8,2604.9","id":"MISC-QARIBA-REMCOMMA"},{"v":"2604.1,2604.2","id":null}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-009:q1": {"k":"sum","t":["1","-1/3","-1/6"],"sigs":[]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-009:q2": {"k":"ext","dir":"max","items":[["الأحد","1/3"],["الإثنين","1/2"]],"opts":[{"v":"الأحد","id":"MISC-MUQKASR-BIGDEN"},{"v":"الإثنين","id":null}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-009:q3": {"k":"whole","part":"25","f":"1/6","sigs":[]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-009:q4": {"k":"of","f":"1/3","n":"150","sigs":[{"value":"450","id":"MISC-JIDAKASR-FLIP"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-009:q5": {"k":"of","f":"1/2","n":"150","sigs":[{"value":"300","id":"MISC-JIDAKASR-FLIP"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-010:q1": {"k":"rest","parts":["3/5","1/10"],"sigs":[{"value":"7/10","id":"MISC-JAMKASR-PART"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-010:q2": {"k":"area","L":"180","l":"120","sigs":[{"value":"600","id":"MISC-SYN-KASR2-PERIM"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-010:q3": {"k":"of","f":"3/5","n":"21600","sigs":[{"value":"36000","id":"MISC-JIDAKASR-FLIP"},{"value":"4320","id":"MISC-JIDAKASR-HALFWAY"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-010:q4": {"k":"euc","a":"12960","b":"85","ask":"q","sigs":[{"value":"40","id":"MISC-HASR-BAQI-HASIL"},{"value":"151","id":"MISC-HASR-BAQI-AKBAR"},{"value":"153","id":"MISC-HASR-IZAHA"}]},
  "ex-2am-wadiya-idmajiya-kusur-amaliyat-l5-010:q5": {"k":"ynPlain","l":"152","alt":"153","r":"153","rel":">=","yes":"نعم","no":"لا","id":"MISC-HASR-NAQS-ZIYADA"},
};

/** L'ORACLE : la réponse juste de chaque question non « selfCheck », recalculée depuis SPEC (jamais lue dans le contenu). */
export const ORACLE = Object.fromEntries(Object.entries(SPEC).map(([k, s]) => [k, answerOf(s)]).filter(([, a]) => a));

/* ── lecture du banc (contexte de chaque feuille) ───────────────────────────── */
const here = dirname(fileURLToPath(import.meta.url));
const bankDir = join(here, '..', '..', 'content', 'practice', '2am', 'wadiya-idmajiya-kusur-amaliyat');
const BANK = new Map();
for (const lvl of readdirSync(bankDir).filter((d) => d.startsWith('level-'))) {
  for (const f of readdirSync(join(bankDir, lvl)).filter((x) => x.endsWith('.json'))) { const ex = JSON.parse(readFileSync(join(bankDir, lvl, f), 'utf8')); BANK.set(ex.id, ex); }
}
const islands = (text) => [...String(text).matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
const numsOf = (t) => [...String(t).replace(/\{,\}/g, '.').matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0]);
const sheetTexts = (ex) => [ex.statement.content, ...(ex.statement.formulas ?? []), ...ex.questions.flatMap((q) => [q.lead ?? '', q.statement])];
const fracValuesIn = (text) => [...String(text).replace(/\{,\}/g, '.').matchAll(/\\dfrac\{(\d+(?:\.\d+)?)\}\{(\d+(?:\.\d+)?)\}/g)].map((m) => V(`${m[1]}/${m[2]}`));
const FORBIDDEN = /فوائد|فائدة|(^|[\s«])ربا([\s».]|$)|خنزير|خمر|قمار|نرد|يانصيب|ساحر|سحر|ميلاد|عيد الحب/;

/** les spécs « de base » (error-aware) imbriquées dans un QCM de décision */
const operandsOf = (s) => {
  switch (s.k) {
    case 'sum': return s.t.map((x) => String(x).replace(/^[+-]/, ''));
    case 'rest': return s.parts;
    case 'prod': return s.f;
    case 'of': return [s.f, s.n];
    case 'ofrest': return [...s.spent, s.f, ...(s.n ? [s.n] : [])];
    case 'whole': return [s.part, s.f];
    case 'rw': return [s.f, String(s.D)];
    case 'euc': case 'unitApx': return [s.a, s.b];
    case 'dec': case 'clr': return [s.n, s.d];
    case 'area': case 'peri': return [s.L, s.l];
    case 'free': return [s.e];
    case 'brn': return [s.a, s.b];
    case 'eucEq': return [s.a, s.b];
    case 'decBr': return [s.n, s.d];
    case 'cmp': return [s.a, s.b];
    case 'ynRel': return [s.l, s.r];
    case 'ext': return s.items.map(([, f]) => f);
    case 'ext2': return s.items.flatMap(([, f, n]) => [f, n]);
    case 'ord': return s.items;
    case 'ynVal': return [...operandsOf(s.base), s.thr];
    case 'ynPlain': return [s.l, s.r];
    case 'pick': return operandsOf(s.base);
    default: return [];
  }
};
const tokensOfExpr = (e) => String(e).match(/\d+(?:\.\d+)?/g) ?? [];

/** vrai si une valeur est une conséquence de l'énoncé : fraction écrite, clé d'une question précédente, ou naturel écrit */
function operandProblems(key, spec, corpusText, earlier) {
  const out = []; const corpusTok = new Set(numsOf(corpusText)); const known = fracValuesIn(corpusText);
  const derivedTok = new Set(); const derivedVals = [];
  for (const v of earlier) { derivedVals.push(v); derivedTok.add(num(v)); num(v).split('/').forEach((t) => derivedTok.add(t)); }
  const cleared = new Set(); for (const t of corpusTok) for (let k = 0; k <= 3; k++) { const x = V(t).mul(E(String(10n ** BigInt(k)))); if (x.d === 1n) cleared.add(String(x.n)); }
  const tokOk = (t) => corpusTok.has(t) || derivedTok.has(t) || cleared.has(t) || t === '1' || t === '2';
  const hasHalf = /نصف/.test(corpusText);
  for (const lit of operandsOf(spec)) {
    const s = String(lit);
    if (/^[\d.]+\/[\d.]+$/.test(s)) {
      const v = V(s); const ok = known.some((x) => same(x, v)) || derivedVals.some((x) => same(x, v)) || (hasHalf && same(v, V('1/2'))) || s === '1/1';
      if (!ok) out.push(`${key} : la fraction ${s} n'est ni dans la feuille ni la clé d'une question précédente`);
    } else for (const t of tokensOfExpr(s)) if (!tokOk(t)) out.push(`${key} : le nombre ${t} (opérande ${s}) n'est ni dans la feuille ni dérivé d'une question précédente`);
  }
  return out;
}

/** vérifie les égalités de chaque île LaTeX d'une ligne de corrigé quand elle est entièrement numérique */
function lineProblems(key, text) {
  const out = [];
  for (const isl of islands(text)) {
    if (/\\(ldots|neq|geq|leq|mathrm|text|approx)|[<>]/.test(isl) || !/=/.test(isl)) continue;
    const parts = isl.split('=');
    try { const vs = parts.map((p) => TEX(p.trim())); for (let i = 1; i < vs.length; i++) if (!same(vs[0], vs[i])) { out.push(`${key} : « $${isl}$ » : ${num(vs[0])} ≠ ${num(vs[i])}`); break; } } catch { /* île non entièrement numérique : ignorée */ }
  }
  return out;
}

const sigList = (qq) => (qq.misconceptionSignatures ?? []).map((x) => ({ value: x.value, id: x.id }));
const shownBy = (content) => TEX(islands(content)[0]);
const symbolOf = (content) => { const m = /\s([<>])\s/.exec(islands(content)[0].replace(/\\dfrac\{[^}]*\}\{[^}]*\}/g, 'X')); return m ? m[1] : null; };

export function audit(bank) {
  const problems = [];
  for (const { key } of bank) {
    const [exId, qId] = key.split(':'); const ex = BANK.get(exId); const qc = ex?.questions.find((x) => x.id === qId);
    if (!qc) { problems.push(`${key} : introuvable dans le banc de l'oracle`); continue; }
    const sp = SPEC[key]; if (!sp) { problems.push(`${key} : aucune spec d'oracle`); continue; }
    try {
      for (const t of [qc.statement, qc.feedback?.correct, qc.feedback?.incorrect, ...(qc.solution?.lines ?? []), ...(qc.choices ?? []).map((c) => c.content), ...(qc.hints ?? []).map((h) => h.content)]) {
        if (FORBIDDEN.test(String(t ?? ''))) problems.push(`${key} : mot interdit dans « ${t} »`);
        if (/%|\\%|بالمئة|نسبة مئوية/.test(String(t ?? ''))) problems.push(`${key} : pourcentage hors périmètre dans « ${t} »`);
        for (const isl of islands(t ?? '')) if (/\\div\s*\\dfrac|\\div\s*\\left/.test(isl)) problems.push(`${key} : division par une fraction (3AM) dans « ${isl} »`);
      }
      for (const l of qc.solution?.lines ?? []) problems.push(...lineProblems(key, l));
      if (qc.learningPoints?.length !== 1 || qc.learningPoints[0].code !== '2am_wadiya-idmajiya-kusur-amaliyat_P1') problems.push(`${key} : la question doit porter l'unique LP P1 de la synthèse`);

      // opérandes : dans la feuille, ou dérivés d'une question précédente de la même feuille
      const corpus = sheetTexts(ex).join(' \n '); const earlier = [];
      for (const q2 of ex.questions) { if (q2.id === qId) break; const s2 = SPEC[`${exId}:${q2.id}`]; if (s2 && RATIONAL_KINDS.has(s2.k)) earlier.push(trueOf(s2)); }
      problems.push(...operandProblems(key, sp, corpus, earlier));

      // bornes 2AM
      if (sp.k === 'sum') { const ds = terms(sp.t).filter((t) => isFr(t.body)).map((t) => nd(t.body)[1]); if (ds.length && !nest(ds)) problems.push(`${key} : somme sans dénominateur multiple des autres (3AM)`); if (cmpQ(sumV(sp.t), ZERO) <= 0) problems.push(`${key} : somme négative ou nulle`); }
      if (sp.k === 'rest') { const ds = sp.parts.map((p) => nd(p)[1]); if (!nest(ds)) problems.push(`${key} : dénominateurs non emboîtés (3AM)`); if (cmpQ(trueOf(sp), ZERO) <= 0) problems.push(`${key} : reste négatif ou nul`); }
      if (sp.k === 'ofrest') { const ds = sp.spent.map((p) => nd(p)[1]); if (!nest(ds)) problems.push(`${key} : dénominateurs non emboîtés (3AM)`); }
      if (sp.k === 'whole' && nd(sp.f)[0] !== 1n) problems.push(`${key} : le tout se trouve depuis une fraction UNITAIRE par multiplication`);
      const pairs = sp.k === 'cmp' ? [[sp.a, sp.b]] : sp.k === 'ynRel' ? [[sp.l, sp.r]] : sp.k === 'ext' ? sp.items.flatMap(([, f], i) => sp.items.slice(i + 1).map(([, g]) => [f, g])) : sp.k === 'ord' ? sp.items.flatMap((f, i) => sp.items.slice(i + 1).map((g) => [f, g])) : [];
      for (const [a, b] of pairs) if (!cmpCase(a, b)) problems.push(`${key} : comparaison ${a} / ${b} hors des quatre cas de 2AM`);

      if (RATIONAL_KINDS.has(sp.k)) {
        if (qc.answerType !== 'rational') problems.push(`${key} : answerType ${qc.answerType}`);
        const e = String(qc.expectedAnswer); const tv = trueOf(sp); const isDec = sp.k === 'dec';
        if (isDec) { if (!same(V(e), V(num2(tv, sp)))) problems.push(`${key} : la clé « ${e} » ≠ ${num2(tv, sp)} recalculé`); }
        else if (e !== num(tv)) problems.push(`${key} : la clé « ${e} » ≠ ${num(tv)} recalculé (ou non réduite)`);
        const kv = isDec ? V(num2(tv, sp)) : tv;
        if (!isDec && tv.d !== 1n && qc.evaluationPolicy?.requiredForm !== 'irreducible') problems.push(`${key} : fraction sans requiredForm irreducible`);
        const m = /^احسب \$([^$]+)\$/.exec(qc.statement); if (m && (sp.k === 'sum' || sp.k === 'prod')) { const body = m[1].replace(/^\s*[A-Za-z]\s*=\s*/, ''); if (!same(TEX(body), kv)) problems.push(`${key} : « احسب $${m[1]}$ » vaut ${num(TEX(body))}, la clé ${num(kv)}`); }
        const given = sigList(qc); const declared = sp.sigs ?? [];
        if (given.length !== declared.length) problems.push(`${key} : ${given.length} signatures dans le contenu, ${declared.length} dans la spec`);
        const seen = new Set();
        for (const g of given) {
          if (!MISC.test(g.id)) { problems.push(`${key} : étiquette ${g.id} hors du jeu autorisé`); continue; }
          const gv = V(g.value); if (same(gv, kv)) problems.push(`${key} : la signature ${g.id} vaut la bonne réponse`);
          if (seen.has(num(gv))) problems.push(`${key} : deux signatures de même valeur ${g.value}`); seen.add(num(gv));
          const ev = errOfAny(sp, g.id);
          if (ev === null || ev === undefined) problems.push(`${key} : l'erreur ${g.id} n'existe pas pour une question « ${sp.k} »`);
          else if (!same(ev, gv)) problems.push(`${key} : la signature ${g.id} vaut ${g.value}, l'erreur donne ${num(ev)}`);
          if (!declared.some((d) => d.id === g.id && same(V(d.value), gv))) problems.push(`${key} : la signature ${g.id} (${g.value}) n'est pas dans la spec`);
        }
      } else if (sp.k === 'self') {
        if (qc.answerType !== 'selfCheck') problems.push(`${key} : answerType ${qc.answerType}`);
        for (const [l, r] of sp.facts) if (!same(V(l), V(r))) problems.push(`${key} : fait faux dans le corrigé : ${l} ≠ ${r}`);
      } else {
        if (qc.answerType !== 'choice') problems.push(`${key} : answerType ${qc.answerType}`);
        const ch = qc.choices; const letter = choiceKey(sp).choiceId;
        const isYN = ['ynRel', 'ynVal', 'ynPlain'].includes(sp.k);
        if (isYN) { if (ch.map((c) => c.content).join('|') !== `${sp.yes}|${sp.no}`) problems.push(`${key} : options نعم / لا attendues`); }
        else if (ch.length !== sp.opts.length) problems.push(`${key} : ${ch.length} options dans le contenu, ${sp.opts.length} dans la spec`);
        ch.forEach((c) => { if ((c.id === letter) !== c.isCorrect) problems.push(`${key} : l'option ${c.id} est mal marquée (juste : ${letter})`); if (c.isCorrect && c.misconceptionId) problems.push(`${key} : l'option juste ${c.id} porte une étiquette`); if (!c.isCorrect && !c.misconceptionId) problems.push(`${key} : l'option fausse ${c.id} n'a pas d'étiquette`); if (c.misconceptionId && !MISC.test(c.misconceptionId)) problems.push(`${key} : étiquette ${c.misconceptionId} hors du jeu autorisé`); });
        const truth = (() => { try { return sp.k === 'ynRel' ? relTest(sp.rel, V(sp.l), V(sp.r)) : sp.k === 'ynVal' ? relTest(sp.rel, trueOf(sp.base), V(sp.thr)) : sp.k === 'ynPlain' ? relTest(sp.rel, V(sp.l), V(sp.r)) : null; } catch { return null; } })();
        if (isYN) {
          const wrong = ch.find((c) => !c.isCorrect); const id = wrong?.misconceptionId;
          if (sp.k === 'ynRel') { const sr = studentRel(id, sp.l, sp.r); if (sr === null || (sr === sp.rel) === truth) problems.push(`${key} : ${id} ne produit pas la réponse fausse « ${wrong.content} »`); }
          if (sp.k === 'ynVal') {
            if (!sp.base.sigs.some((s) => s.id === id)) problems.push(`${key} : ${id} n'est pas une erreur de la question de base`);
            const ev = errOfAny(sp.base, id); if (!ev || relTest(sp.rel, ev, V(sp.thr)) === truth) problems.push(`${key} : l'erreur ${id} ne renverse pas la décision`);
            const tb = trueOf(sp.base); const bq = ex.questions.find((q2) => { const s2 = SPEC[`${exId}:${q2.id}`]; return s2 && JSON.stringify(s2) === JSON.stringify(sp.base); });
            if (bq && String(bq.expectedAnswer) !== num(tb)) problems.push(`${key} : la question de base ${bq.id} n'a pas la clé ${num(tb)}`);
          }
          if (sp.k === 'ynPlain') { if (relTest(sp.rel, V(sp.alt), V(sp.r)) === truth) problems.push(`${key} : la valeur fautive ${sp.alt} ne renverse pas la décision`); }
          continue;
        }
        sp.opts.forEach((o, i) => {
          const c = ch[i]; const spID = o.id ?? undefined;
          if ((c.misconceptionId ?? undefined) !== spID) problems.push(`${key} : l'option ${c.id} porte ${c.misconceptionId} au lieu de ${spID}`);
          const wrong = !c.isCorrect; const id = c.misconceptionId;
          if (sp.k === 'eucEq') {
            const a = BigInt(sp.a), b = BigInt(sp.b); const q0 = a / b, r0 = a % b; const [q1, r1] = parsePair(o.v).map(BigInt);
            const nums = numsOf(islands(c.content)[0]).map(BigInt); if (nums.join() !== [a, b, q1, r1].join()) problems.push(`${key} : l'option ${c.id} imprime ${nums.join(' ')} ≠ ${[a, b, q1, r1].join(' ')}`);
            if (wrong) { const ok = id === 'MISC-HASR-BAQI-AKBAR' ? q1 === q0 - 1n && r1 === r0 + b : id === 'MISC-HASR-BAQI-HASIL' ? q1 === r0 && r1 === q0 : id === 'MISC-HASR-IZAHA' ? q1 === q0 + 1n && r1 === r0 : false; if (!ok) problems.push(`${key} : l'option ${c.id} n'est pas la lecture de ${id}`); }
          }
          if (sp.k === 'brn') {
            const a = BigInt(sp.a), b = BigInt(sp.b); const q0 = a / b, r0 = a % b; const [lo, hi] = parsePair(o.v).map(BigInt);
            const nums = numsOf(islands(c.content)[0]).map(BigInt); if (nums.join() !== [lo, a, b, hi].join()) problems.push(`${key} : l'option ${c.id} imprime ${nums.join(' ')}`);
            if (wrong) { const ok = id === 'MISC-HASR-IZAHA' ? (lo === q0 + 1n || hi === q0) : id === 'MISC-HASR-BAQI-HASIL' ? lo === r0 : false; if (!ok) problems.push(`${key} : l'option ${c.id} n'est pas la lecture de ${id}`); }
          }
          if (sp.k === 'decBr') {
            const v = V(sp.n).div(V(sp.d)); const w = stepOf(sp.r); const [lo, hi] = parsePair(o.v).map(V); const parts = islands(c.content)[0].split('<').map((x) => x.trim());
            if (!same(TEX(parts[0]), lo) || !same(TEX(parts[2]), hi)) problems.push(`${key} : l'option ${c.id} n'imprime pas ${o.v}`);
            if (wrong) { const { a, b } = clear(sp.n, sp.d); const ok = id === 'MISC-QARIBA-SWAP' ? (same(lo, DEFV(v, sp.r).add(w)) || same(hi, DEFV(v, sp.r))) : id === 'MISC-QARIBA-REMCOMMA' ? same(lo, V(`${a / b}.${a % b}`)) && same(hi.sub(lo), w) : false; if (!ok) problems.push(`${key} : l'option ${c.id} n'est pas la lecture de ${id}`); }
          }
          if (sp.k === 'cmp') {
            const shownRel = symbolOf(c.content); if (shownRel !== o.v) problems.push(`${key} : l'option ${c.id} imprime ${shownRel}, la spec ${o.v}`);
            const sides = islands(c.content)[0].split(/\s[<>]\s/).map((x) => TEX(x)); if (!same(sides[0], V(sp.a)) || !same(sides[1], V(sp.b))) problems.push(`${key} : l'option ${c.id} n'imprime pas les deux fractions de la spec`);
            if (wrong && studentRel(id, sp.a, sp.b) !== o.v) problems.push(`${key} : ${id} ne produit pas « ${o.v} »`);
          }
          if (sp.k === 'ext' || sp.k === 'ext2') {
            if (c.content !== o.v) problems.push(`${key} : l'option ${c.id} n'est pas « ${o.v} »`);
            if (wrong) {
              const it = sp.items.map(([lab, f]) => [lab, f]); const vals = it.map(([, f]) => V(f)); const idx = it.findIndex(([lab]) => lab === o.v);
              if (sp.k === 'ext') {
                const dir = sp.dir; const tie = (f) => { const ks = it.map(([, g]) => f(nd(g))); const best = dir === 'max' ? ks.reduce((a, b) => (b > a ? b : a)) : ks.reduce((a, b) => (b < a ? b : a)); return ks.map((k, j) => (k === best ? j : -1)).filter((j) => j >= 0); };
                const ok = id === 'MISC-MUQKASR-NUMONLY' ? tie((p) => p[0]).includes(idx) : id === 'MISC-MUQKASR-BIGDEN' ? tie((p) => p[1]).includes(idx) : id === 'MISC-MUQKASR-REVERSED' ? idx === argext(vals, dir === 'max' ? 'min' : 'max') : false;
                if (!ok) problems.push(`${key} : l'option ${c.id} n'est pas la lecture de ${id}`);
              } else { const fr = argext(sp.items.map(([, f]) => V(f)), 'max'); if (!(id === 'MISC-SYN-KASR2-FRACONLY' && idx === fr)) problems.push(`${key} : l'option ${c.id} n'est pas la lecture de ${id}`); }
            }
          }
          if (sp.k === 'ord') {
            const parts = islands(c.content)[0].split(/\s[<>]\s/); const sym = symbolOf(c.content); if (sym !== (sp.dir === 'asc' ? '<' : '>')) problems.push(`${key} : l'option ${c.id} n'utilise pas le sens ${sp.dir}`);
            const shown = parts.map((p) => TEX(p)); const want = parsePair(o.v).map(V); if (shown.length !== want.length || shown.some((x, j) => !same(x, want[j]))) problems.push(`${key} : l'option ${c.id} n'imprime pas ${o.v}`);
            if (wrong) {
              const items = sp.items; const sorted = (f) => items.map((x, j) => j).sort((i, j) => { const A = f(nd(items[i])), B = f(nd(items[j])); const k = A < B ? -1 : A > B ? 1 : 0; return sp.dir === 'asc' ? k : -k; }).map((j) => items[j]);
              const distinct = (f) => new Set(items.map((x) => String(f(nd(x))))).size === items.length;
              const good = items.map((x, j) => j).sort((i, j) => (sp.dir === 'asc' ? cmpQ(V(items[i]), V(items[j])) : cmpQ(V(items[j]), V(items[i])))).map((j) => items[j]);
              const ok = id === 'MISC-MUQKASR-NUMONLY' ? distinct((p) => p[0]) && sorted((p) => p[0]).join() === o.v : id === 'MISC-MUQKASR-BIGDEN' ? distinct((p) => p[1]) && sorted((p) => p[1]).join() === o.v : id === 'MISC-MUQKASR-REVERSED' ? good.slice().reverse().join() === o.v : false;
              if (!ok) problems.push(`${key} : l'option ${c.id} n'est pas la lecture de ${id}`);
            }
          }
          if (sp.k === 'pick') {
            const shown = shownBy(c.content); if (!same(shown, V(o.v))) problems.push(`${key} : l'option ${c.id} imprime ${num(shown)} ≠ ${o.v}`);
            if (wrong) { const ev = errOfAny(sp.base, id); if (!ev || !same(ev, V(o.v))) problems.push(`${key} : l'option ${c.id} (${o.v}) n'est pas la valeur de l'erreur ${id} (${ev ? num(ev) : 'aucune'})`); }
          }
        });
      }
    } catch (err) { problems.push(`${key} : ${err.message}`); }
  }
  return problems;
}
const DEFV = (v, k) => V(DEF(v, k));
