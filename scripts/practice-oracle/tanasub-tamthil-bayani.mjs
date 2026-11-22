// Oracle du banc « tanasub-tamthil-bayani » (التناسبية والتمثيل البياني, 3AM, 2026-10-21) — feuilles d'examen de فصل.
// Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer` ni dans packages/core :
//  - les coordonnées, les droites et les tableaux sont LUS dans la donnée de l'énoncé (`statement.figure`, `statement.table`),
//    puis traités en rationnels exacts (BigInt, `q` de helpers.mjs) ;
//  - « le bon graphique est-il proportionnel ? » : l'oracle teste lui-même que TOUS les points du graphique sont alignés avec
//    l'origine (produits en croix x_i·y_j − x_j·y_i = 0) — un alignement hors de O, une cassure ou un arc donnent « non » ;
//  - un QCM de verdict n'a qu'UNE option portant le bon verdict (« نعم » / « لا ») ; un QCM de valeur est retrouvé en
//    confrontant chaque option au calcul ; les montants d'un énoncé (x₁, budget…) sont retapés ici et vérifiés dans le texte.
// Les questions selfCheck (« علّل ») n'ont pas de clé et ne figurent pas ici.
import { readFileSync } from 'node:fs';
import { R, C, q } from './helpers.mjs';

const ROOT = new URL('../../content/practice/3am/tanasub-tamthil-bayani/', import.meta.url);
const cache = new Map();
const D = (l, n) => {
  const k = `${l}-${n}`;
  if (!cache.has(k)) cache.set(k, JSON.parse(readFileSync(new URL(`level-${l}/ex-3am-tanasub-tamthil-bayani-l${l}-${String(n).padStart(3, '0')}.json`, ROOT), 'utf8')));
  return cache.get(k);
};
const Q = (v) => q(v);
const Fx = (l, n) => D(l, n).statement.figure;
const pt = (l, n, name) => { const p = Fx(l, n).points[name]; if (!p) throw new Error(`point ${name} absent de l${l}-${n}`); return [Q(p[0]), Q(p[1])]; };
const quest = (l, n, id) => D(l, n).questions.find((x) => x.id === id);
const text = (l, n) => JSON.stringify(D(l, n));
const need = (l, n, ...vals) => { const t = text(l, n); for (const v of vals) { const s = String(v).replace('.', '{,}'); if (!t.includes(s) && !t.includes(String(v).replace('.', ','))) throw new Error(`donnée ${v} absente de l${l}-${n}`); } };

function dec(v) {
  const x = Q(v); let n = x.n; const d = x.d; const neg = n < 0n; if (neg) n = -n;
  let k = 0; let p = 1n; while ((n * p) % d !== 0n) { k += 1; p *= 10n; if (k > 12) throw new Error(`décimal illimité ${x}`); }
  const s = String((n * p) / d).padStart(k + 1, '0');
  return `${neg ? '-' : ''}${k ? `${s.slice(0, -k)}.${s.slice(-k)}` : s}`;
}
const rr = (v) => R(dec(v));
const fmt = (v) => dec(v).replace('.', '{,}');

/* ── géométrie exacte ───────────────────────────────────────────────────── */
const cross = (a, b) => a[0].mul(b[1]).sub(b[0].mul(a[1]));
/** tous ces points sont-ils sur UNE droite qui passe par l'origine ? */
const throughO = (pts) => pts.every((a) => pts.every((b) => cross(a, b).isZero()));
const nonOrigin = (l, n, names) => names.map((nm) => pt(l, n, nm));
const proportional = (l, n, names) => throughO(nonOrigin(l, n, names));
const coef = (l, n, name) => { const [x, y] = pt(l, n, name); return y.div(x); };
/** ordonnée en x de la droite par deux points */
const lineY = (p, r, x) => { const k = r[1].sub(p[1]).div(r[0].sub(p[0])); return p[1].add(k.mul(Q(x).sub(p[0]))); };
const lineOf = (l, n, i) => { const ln = Fx(l, n).lines[i]; return ln.through.map((nm) => pt(l, n, nm)); };

/* ── QCM ───────────────────────────────────────────────────────────────── */
const letterOf = (l, n, id, test) => {
  const hits = quest(l, n, id).choices.filter((c) => test(c.content));
  if (hits.length !== 1) throw new Error(`QCM l${l}-${n}:${id} : ${hits.length} options retenues`);
  return C(hits[0].id);
};
/** l'unique option dont le verdict est « نعم » (truth) ou « لا » (!truth) */
const verdict = (l, n, id, truth) => letterOf(l, n, id, (c) => c.startsWith(truth ? 'نعم' : 'لا'));
const byRe = (l, n, id, re) => letterOf(l, n, id, (c) => re.test(c));
const pairOpt = (l, n, id, name) => { const [x, y] = pt(l, n, name); const t = `(${dec(x)}\\,;\\,${dec(y)})`; return letterOf(l, n, id, (c) => c.replace(/\{,\}/g, '.').includes(t)); };
const mathChunks = (c) => [...c.matchAll(/\$([^$]*)\$/g)].map((m) => m[1]);
const rowOpt = (l, n, id, rows) => letterOf(l, n, id, (c) => { const m = mathChunks(c); return rows.every((r, i) => m[i] === r.join('\\ ;\\ ')); });
const names = (...s) => s;

const K = (l, n, qq) => `ex-3am-tanasub-tamthil-bayani-l${l}-${String(n).padStart(3, '0')}:${qq}`;
const X = (l, n, nm) => rr(pt(l, n, nm)[0]);
const Y = (l, n, nm) => rr(pt(l, n, nm)[1]);
const CF = (l, n, nm) => rr(coef(l, n, nm));

/** deux offres : (D₁) par O ; (D₂) par R(0,c) : a, b, c, abscisse d'intersection lus dans la figure */
function offer(l, n) {
  const [o, p] = lineOf(l, n, 0); const [r, s] = lineOf(l, n, 1);
  if (!o[0].isZero() || !o[1].isZero()) throw new Error('(D₁) doit passer par O');
  const a = p[1].div(p[0]); const c = r[1]; const b = s[1].sub(r[1]).div(s[0]);
  return { a, b, c, xs: c.div(a.sub(b)) };
}
const offerEntries = (l, n, xDec) => {
  const { a, b, c, xs } = offer(l, n);
  need(l, n, xDec);
  const p1 = a.mul(xDec); const p2 = b.mul(xDec).add(c); const min = p1.sub(p2).n < 0n ? p1 : p2;
  return {
    [K(l, n, 'q1')]: verdict(l, n, 'q1', true), // (D₁) passe par O : proportionnel
    [K(l, n, 'q2')]: verdict(l, n, 'q2', !c.isZero() ? false : true), // (D₂) coupe l'axe des ordonnées au-dessus de O
    [K(l, n, 'q3')]: rr(xs),
    [K(l, n, 'q4')]: rr(a.mul(xs).mul(100)),
    [K(l, n, 'q5')]: rr(c.div(a.sub(b))),
    [K(l, n, 'q6')]: byRe(l, n, 'q6', new RegExp(`عنده \\$${fmt(min).replace(/[{}]/g, '\\$&')}\\$ مئة دج مقابل`)),
  };
};

/** une ligne de feuille « proportionnelle » du niveau 5 : x1 (prix), B (budget → quantité), x2 et M (décision) */
const prop5 = (n, names_, x1, B, x2, M) => {
  const l = 5; const last = names_[names_.length - 1];
  need(l, n, x1, B, x2, M);
  const a = coef(l, n, last);
  if (!proportional(l, n, names_)) throw new Error(`l5-${n} : la figure doit être proportionnelle`);
  const price = a.mul(100).mul(x2);
  return {
    [K(l, n, 'q1')]: verdict(l, n, 'q1', true),
    [K(l, n, 'q3')]: rr(a),
    [K(l, n, 'q4')]: rr(a.mul(100).mul(x1)),
    [K(l, n, 'q5')]: rr(Q(B).div(a.mul(100))),
    [K(l, n, 'q6')]: verdict(l, n, 'q6', price.sub(M).n <= 0n),
  };
};
/** une ligne de feuille « rendue non proportionnelle » (rasm thabit) du niveau 5 */
const fee5 = (n, names_, x1, x2, M) => {
  const l = 5; need(l, n, x1, x2, M);
  const p = nonOrigin(l, n, names_.slice(0, 2)); const k = p[1][1].sub(p[0][1]).div(p[1][0].sub(p[0][0]));
  const c = p[0][1].sub(k.mul(p[0][0]));
  for (const nm of names_) { const [x, y] = pt(l, n, nm); if (!y.sub(k.mul(x)).sub(c).isZero()) throw new Error('points non alignés'); }
  if (proportional(l, n, names_) || c.isZero()) throw new Error('la figure doit être hors de O');
  return {
    [K(l, n, 'q1')]: verdict(l, n, 'q1', false),
    [K(l, n, 'q3')]: rr(c.mul(100)),
    [K(l, n, 'q4')]: rr(k.mul(x1).add(c).mul(100)),
    [K(l, n, 'q5')]: verdict(l, n, 'q5', k.mul(x2).add(c).mul(100).sub(M).n <= 0n),
  };
};

export const ORACLE = {
  /* ── niveau 1 ── */
  [K(1, 1, 'q1')]: X(1, 1, 'A'), [K(1, 1, 'q2')]: Y(1, 1, 'A'), [K(1, 1, 'q3')]: pairOpt(1, 1, 'q3', 'A'),
  [K(1, 2, 'q1')]: rowOpt(1, 2, 'q1', [['1', '3', '5'], ['2', '4', '6']].map((r, i) => r.map((_, j) => dec(pt(1, 2, 'ABC'[j])[i])))),
  [K(1, 2, 'q2')]: Y(1, 2, 'B'), [K(1, 2, 'q3')]: verdict(1, 2, 'q3', proportional(1, 2, names('A', 'B', 'C'))),
  [K(1, 3, 'q1')]: X(1, 3, 'M'), [K(1, 3, 'q2')]: Y(1, 3, 'M'), [K(1, 3, 'q3')]: pairOpt(1, 3, 'q3', 'N'),
  [K(1, 4, 'q1')]: X(1, 4, 'A'), [K(1, 4, 'q2')]: Y(1, 4, 'A'), [K(1, 4, 'q3')]: pairOpt(1, 4, 'q3', 'B'),
  [K(1, 5, 'q1')]: verdict(1, 5, 'q1', proportional(1, 5, names('A', 'B', 'C'))),
  [K(1, 5, 'q2')]: byRe(1, 5, 'q2', /^نضع مسطرة على المبدأ/),
  [K(1, 6, 'q1')]: (() => { const idx = Fx(1, 6).lines.map((_, i) => i).filter((i) => throughO(lineOf(1, 6, i))); if (idx.length !== 1) throw new Error('un seul'); return letterOf(1, 6, 'q1', (c) => c === `$(D_${idx[0] + 1})$`); })(),
  [K(1, 6, 'q2')]: verdict(1, 6, 'q2', throughO(lineOf(1, 6, 1))),
  [K(1, 7, 'q1')]: (() => { const [a, c] = [pt(1, 7, 'A'), pt(1, 7, 'C')]; return rr(lineY(a, c, 0)); })(),
  [K(1, 7, 'q2')]: verdict(1, 7, 'q2', proportional(1, 7, names('A', 'B', 'C'))),
  [K(1, 8, 'q1')]: verdict(1, 8, 'q1', proportional(1, 8, names('A', 'B', 'C', 'D'))),
  [K(1, 8, 'q2')]: (() => { const ok = []; for (const nm of ['A', 'B', 'C', 'D']) if (throughO([pt(1, 8, 'A'), pt(1, 8, nm)])) ok.push(nm); return rr(Math.max(...ok.map((nm) => Number(pt(1, 8, nm)[0].n)))); })(),
  [K(1, 9, 'q1')]: CF(1, 9, 'A'), [K(1, 9, 'q2')]: (() => { const a = coef(1, 9, 'A'); return byRe(1, 9, 'q2', new RegExp(`^\\$y = ${fmt(a).replace(/[{}]/g, '\\$&')}\\\\,x\\$$`)); })(),
  [K(1, 10, 'q1')]: (() => { need(1, 10, 6); return rr(coef(1, 10, 'B').mul(6)); })(),
  [K(1, 10, 'q2')]: (() => { need(1, 10, 1000); return rr(Q(10).div(coef(1, 10, 'B'))); })(),

  /* ── niveau 2 ── */
  [K(2, 1, 'q1')]: pairOpt(2, 1, 'q1', 'C'), [K(2, 1, 'q2')]: verdict(2, 1, 'q2', proportional(2, 1, names('A', 'B', 'C', 'D'))),
  [K(2, 1, 'q4')]: (() => { need(2, 1, 10); return rr(pt(2, 1, 'B')[1].mul(100)); })(), [K(2, 1, 'q5')]: CF(2, 1, 'B'),
  [K(2, 2, 'q1')]: pairOpt(2, 2, 'q1', 'D'), [K(2, 2, 'q2')]: verdict(2, 2, 'q2', proportional(2, 2, names('A', 'B', 'C', 'D'))),
  [K(2, 2, 'q4')]: (() => { if (coef(2, 2, 'A').sub(coef(2, 2, 'D')).isZero()) throw new Error('rapports égaux ?'); return byRe(2, 2, 'q4', /^الناتجان مختلفان/); })(),
  [K(2, 3, 'q1')]: Y(2, 3, 'C'), [K(2, 3, 'q2')]: verdict(2, 3, 'q2', proportional(2, 3, names('A', 'B', 'C', 'D'))), [K(2, 3, 'q3')]: CF(2, 3, 'B'),
  [K(2, 3, 'q4')]: (() => { need(2, 3, 5, 12); return rr(coef(2, 3, 'B').mul(5).mul(12)); })(),
  [K(2, 4, 'q1')]: verdict(2, 4, 'q1', proportional(2, 4, names('A', 'B', 'C'))),
  [K(2, 4, 'q2')]: rr(lineY(pt(2, 4, 'A'), pt(2, 4, 'C'), 0)),
  [K(2, 5, 'q1')]: verdict(2, 5, 'q1', proportional(2, 5, names('A', 'B', 'C'))),
  [K(2, 5, 'q3')]: (() => { need(2, 5, 9); return rr(Q(9).div(coef(2, 5, 'C'))); })(),
  [K(2, 5, 'q4')]: (() => { need(2, 5, 25); return rr(coef(2, 5, 'C').mul(25)); })(),
  [K(2, 6, 'q1')]: (() => { const a = coef(2, 6, 'A'); if (!a.sub(coef(2, 6, 'B')).isZero()) throw new Error('A et B non proportionnels'); return byRe(2, 6, 'q1', /^صحيحة/); })(),
  [K(2, 6, 'q2')]: (() => { need(2, 6, 8, '5.8'); const real = coef(2, 6, 'A').mul(8); if (real.sub('5.8').isZero()) throw new Error('5,8 serait juste'); return byRe(2, 6, 'q2', /^خاطئ/); })(),
  [K(2, 6, 'q3')]: (() => { need(2, 6, 13); return rr(coef(2, 6, 'A').mul(13)); })(),
  [K(2, 7, 'q1')]: Y(2, 7, 'B'),
  [K(2, 7, 'q2')]: (() => { if (!proportional(2, 7, names('A', 'B', 'C'))) throw new Error('doit être proportionnel'); return byRe(2, 7, 'q2', /^نقط على استقامة واحدة مع مبدأ المعلم/); })(),
  [K(2, 7, 'q3')]: CF(2, 7, 'A'),
  [K(2, 8, 'q1')]: (() => { const f = Fx(2, 8); const good = f.lines.map((_, i) => i).filter((i) => throughO(lineOf(2, 8, i))); if (good.length !== 1 || f.arcs.length !== 1) throw new Error('un seul graphique droit par O'); return letterOf(2, 8, 'q1', (c) => c === `$(G_${good[0] === 0 ? 2 : 1})$`); })(),
  [K(2, 8, 'q2')]: verdict(2, 8, 'q2', false), // (G₃) est un arc : jamais une droite
  [K(2, 8, 'q3')]: verdict(2, 8, 'q3', throughO(lineOf(2, 8, 1))),
  [K(2, 9, 'q1')]: (() => { need(2, 9, 2); return rr(coef(2, 9, 'A').mul(2)); })(),
  [K(2, 9, 'q2')]: (() => { const a = coef(2, 9, 'A'); return byRe(2, 9, 'q2', new RegExp(`^\\$m = ${fmt(a).replace(/[{}]/g, '\\$&')}\\\\,V\\$$`)); })(),
  [K(2, 9, 'q3')]: (() => { need(2, 9, '10.5'); return rr(Q('10.5').div(coef(2, 9, 'A'))); })(),
  [K(2, 10, 'q1')]: (() => { const t = D(2, 10).statement.table; const x = t.head[3]; const y = t.rows[0][3]; return letterOf(2, 10, 'q1', (c) => c.includes(`فاصلتها $${x}$ وترتيبها $${y}$`)); })(),
  [K(2, 10, 'q2')]: (() => { const t = D(2, 10).statement.table; const ks = t.head.slice(1).map((h, i) => Q(t.rows[0][i + 1]).div(Q(h))); return verdict(2, 10, 'q2', ks.every((k) => k.sub(ks[0]).isZero())); })(),
  [K(2, 10, 'q3')]: (() => { const t = D(2, 10).statement.table; return rr(Q(t.rows[0][2]).div(Q(t.head[2]))); })(),
  [K(2, 10, 'q4')]: (() => { need(2, 10, 14); const t = D(2, 10).statement.table; return rr(Q(t.rows[0][1]).div(Q(t.head[1])).mul(14)); })(),

  /* ── niveau 3 ── */
  [K(3, 1, 'q1')]: pairOpt(3, 1, 'q1', 'B'), [K(3, 1, 'q2')]: verdict(3, 1, 'q2', proportional(3, 1, names('A', 'B', 'C', 'D'))),
  [K(3, 1, 'q4')]: (() => { need(3, 1, 1800); return rr(Q(18).div(coef(3, 1, 'A'))); })(),
  [K(3, 1, 'q5')]: (() => { need(3, 1, 15, 300); return rr(Q(300).div(2).mul(15)); })(),
  [K(3, 2, 'q1')]: Y(3, 2, 'B'), [K(3, 2, 'q2')]: verdict(3, 2, 'q2', proportional(3, 2, names('A', 'B', 'C', 'D'))),
  [K(3, 2, 'q4')]: (() => { need(3, 2, 20); return rr(coef(3, 2, 'B').mul(20)); })(),
  [K(3, 3, 'q1')]: (() => { // le tableau ② : (2;3), (4;5), (6;7) — lequel des graphiques porte ces trois points ?
    need(3, 3, '3\\\\ ;\\\\ 5\\\\ ;\\\\ 7');
    const T2 = [[2, 3], [4, 5], [6, 7]].map(([x, y]) => [Q(x), Q(y)]);
    const onLine = (ln) => T2.every(([x, y]) => lineY(ln[0], ln[1], x).sub(y).isZero());
    const g = [0, 1].filter((i) => onLine(lineOf(3, 3, i)));
    if (g.length !== 1) throw new Error('un seul graphique');
    return letterOf(3, 3, 'q1', (c) => c === `$(G_${g[0] + 1})$`);
  })(),
  [K(3, 3, 'q2')]: (() => { const T = { 1: [[2, 3], [4, 6], [6, 9]], 2: [[2, 3], [4, 5], [6, 7]], 3: [[1, 2], [4, 4], [9, 6]] };
    const ok = Object.keys(T).filter((k) => throughO(T[k].map(([x, y]) => [Q(x), Q(y)])));
    if (ok.length !== 1 || ok[0] !== '1') throw new Error('seul ① est proportionnel');
    return byRe(3, 3, 'q2', /^الجدول ① فقط/); })(),
  [K(3, 3, 'q3')]: verdict(3, 3, 'q3', false),
  [K(3, 3, 'q4')]: CF(3, 3, 'H'),
  [K(3, 4, 'q1')]: (() => { need(3, 4, 45); return rr(pt(3, 4, 'A')[1].mul(10)); })(),
  [K(3, 4, 'q2')]: rr(pt(3, 4, 'C')[1].sub(pt(3, 4, 'B')[1]).mul(10)),
  [K(3, 4, 'q3')]: (() => { if (!pt(3, 4, 'A')[1].sub(pt(3, 4, 'B')[1]).isZero()) throw new Error('A et B doivent avoir le même ordonnée'); return byRe(3, 4, 'q3', /^لم تنتج الآلة/); })(),
  [K(3, 4, 'q4')]: verdict(3, 4, 'q4', proportional(3, 4, names('A', 'B', 'C'))),
  [K(3, 5, 'q1')]: (() => { need(3, 5, 10); return rr(coef(3, 5, 'A').mul(10)); })(),
  [K(3, 5, 'q2')]: (() => { const a = coef(3, 5, 'A'); return letterOf(3, 5, 'q2', (c) => { const m = /\((\d+)\\,;\\,(\d+)\)/.exec(c); return Q(m[2]).sub(a.mul(m[1])).isZero(); }); })(),
  [K(3, 5, 'q3')]: (() => { need(3, 5, 17); const a = coef(3, 5, 'A'); return verdict(3, 5, 'q3', a.mul(12).sub(17).isZero()); })(),
  [K(3, 6, 'q1')]: verdict(3, 6, 'q1', proportional(3, 6, names('A', 'B', 'C'))),
  [K(3, 6, 'q2')]: rr(coef(3, 6, 'A').mul(pt(3, 6, 'C')[0])),
  [K(3, 7, 'q1')]: pairOpt(3, 7, 'q1', 'A'), [K(3, 7, 'q2')]: verdict(3, 7, 'q2', proportional(3, 7, names('A', 'B', 'C', 'D'))),
  [K(3, 7, 'q3')]: CF(3, 7, 'C'), [K(3, 7, 'q4')]: (() => { need(3, 7, 5); return rr(coef(3, 7, 'C').mul(5).mul(100)); })(),
  [K(3, 8, 'q1')]: verdict(3, 8, 'q1', proportional(3, 8, names('A', 'B', 'C', 'D'))), [K(3, 8, 'q2')]: CF(3, 8, 'B'),
  [K(3, 8, 'q3')]: rr(coef(3, 8, 'B').mul(10)),
  [K(3, 8, 'q4')]: (() => { need(3, 8, 175); return rr(Q(175).div(10).div(coef(3, 8, 'B'))); })(),
  [K(3, 9, 'q1')]: verdict(3, 9, 'q1', proportional(3, 9, names('A', 'B', 'C'))), [K(3, 9, 'q2')]: CF(3, 9, 'B'),
  [K(3, 9, 'q3')]: (() => { need(3, 9, 25); return rr(coef(3, 9, 'B').mul(25)); })(),
  [K(3, 9, 'q4')]: (() => { need(3, 9, 68); return rr(Q(68).div(coef(3, 9, 'B'))); })(),
  [K(3, 10, 'q1')]: X(3, 10, 'A'), [K(3, 10, 'q2')]: Y(3, 10, 'A'), [K(3, 10, 'q3')]: CF(3, 10, 'A'),
  [K(3, 10, 'q4')]: (() => { need(3, 10, 10); return rr(coef(3, 10, 'A').mul(10)); })(),

  /* ── niveau 4 ── */
  ...offerEntries(4, 1, 20), ...offerEntries(4, 2, 3), ...offerEntries(4, 3, 8),
  [K(4, 4, 'q1')]: (() => { const g = [0, 1].filter((i) => throughO(lineOf(4, 4, i))); if (g.length !== 1 || g[0] !== 0) throw new Error('S₁ seul'); return byRe(4, 4, 'q1', /^المحل الأول/); })(),
  [K(4, 4, 'q2')]: verdict(4, 4, 'q2', throughO([pt(4, 4, 'B'), pt(4, 4, 'C'), pt(4, 4, 'S₃')])),
  [K(4, 4, 'q3')]: (() => { need(4, 4, 12); const [r, s] = lineOf(4, 4, 1); return rr(lineY(r, s, 12).mul(5)); })(),
  [K(4, 4, 'q4')]: (() => { need(4, 4, '2{,}5'); const [, p] = lineOf(4, 4, 0); const [r, s] = lineOf(4, 4, 1); const a = p[1].div(p[0]); const b = s[1].sub(r[1]).div(s[0]); return rr(r[1].div(a.sub(b))); })(),
  [K(4, 4, 'q5')]: (() => { need(4, 4, 14); const [, p] = lineOf(4, 4, 0); const [, s] = lineOf(4, 4, 1); const cost = [p[1].mul(5), s[1].mul(5), pt(4, 4, 'S₃')[1].mul(5)].map((v) => v.mul(14).div(14)); // à x = 14 (extrémité des trois bornes)
    const best = cost.indexOf(cost.reduce((m, v) => (v.sub(m).n < 0n ? v : m)));
    return byRe(4, 4, 'q5', new RegExp(`^المحل ${['الأول', 'الثاني', 'الثالث'][best]}`)); })(),
  [K(4, 5, 'q1')]: verdict(4, 5, 'q1', proportional(4, 5, names('A', 'B', 'C'))),
  [K(4, 5, 'q2')]: (() => { need(4, 5, 20, 10); return rr(Q(20).mul(10)); })(),
  [K(4, 5, 'q3')]: rr(coef(4, 5, 'C').mul(Q(20).mul(10).div(100))),
  [K(4, 5, 'q4')]: (() => { need(4, 5, 18); return rr(Q(18).div(coef(4, 5, 'C')).mul(100)); })(),
  ...offerEntries(4, 6, 2),
  [K(4, 7, 'q1')]: verdict(4, 7, 'q1', proportional(4, 7, names('A', 'B', 'C'))), [K(4, 7, 'q2')]: CF(4, 7, 'A'),
  [K(4, 7, 'q3')]: (() => { need(4, 7, 40); return rr(Q(3).div(5).mul(40)); })(),
  [K(4, 7, 'q4')]: rr(coef(4, 7, 'A').mul(Q(3).div(5).mul(40)).mul(100)),
  [K(4, 8, 'q1')]: CF(4, 8, 'A'), [K(4, 8, 'q2')]: (() => { need(4, 8, 30); return rr(coef(4, 8, 'A').mul(3)); })(),
  [K(4, 8, 'q3')]: (() => { need(4, 8, 20, '3{,}75'); return rr(Q(20).sub(coef(4, 8, 'A').mul(3).add('3.75'))); })(),
  [K(4, 8, 'q4')]: verdict(4, 8, 'q4', proportional(4, 8, names('A', 'B'))),
  [K(4, 9, 'q1')]: (() => { const t = D(4, 9).statement.table; return letterOf(4, 9, 'q1', (c) => c === `$(${t.head[3]}\\,;\\,${t.rows[0][3]})$`); })(),
  [K(4, 9, 'q2')]: (() => { const t = D(4, 9).statement.table; const ks = t.head.slice(1).map((h, i) => Q(t.rows[0][i + 1]).div(Q(h))); return verdict(4, 9, 'q2', ks.every((k) => k.sub(ks[0]).isZero())); })(),
  [K(4, 9, 'q3')]: (() => { need(4, 9, '17{,}5'); const t = D(4, 9).statement.table; return rr(Q('17.5').div(Q(t.rows[0][1]).div(Q(t.head[1])))); })(),
  [K(4, 9, 'q4')]: (() => { need(4, 9, 9); const t = D(4, 9).statement.table; return rr(Q(t.rows[0][1]).div(Q(t.head[1])).mul(9).mul(100)); })(),
  [K(4, 10, 'q1')]: verdict(4, 10, 'q1', proportional(4, 10, names('A', 'B', 'C'))), [K(4, 10, 'q2')]: CF(4, 10, 'B'),
  [K(4, 10, 'q3')]: (() => { need(4, 10, 16); return rr(coef(4, 10, 'B').mul(16).mul(100)); })(),
  [K(4, 10, 'q4')]: (() => { need(4, 10, 2500, 17); return verdict(4, 10, 'q4', coef(4, 10, 'B').mul(100).mul(17).sub(2500).n <= 0n); })(),

  /* ── niveau 5 ── */
  ...prop5(1, names('A', 'B', 'C', 'D'), 7, 1800, 14, 2000),
  ...prop5(2, names('A', 'B', 'C', 'D', 'E'), 6, 1600, 9, 2000),
  ...prop5(3, names('A', 'B', 'C'), 5, 2000, 10, 2400),
  ...prop5(4, names('A', 'B', 'C', 'D'), 8, 1440, 25, 3000),
  ...prop5(5, names('A', 'B', 'C', 'D'), 10, 900, 30, 1400),
  ...prop5(6, names('A', 'B', 'C', 'D'), 12, 1200, 22, 1800),
  ...fee5(7, names('A', 'B', 'C'), 8, 7, 1000),
  ...fee5(8, names('A', 'B', 'C'), 10, 8, 800),
  [K(5, 9, 'q1')]: verdict(5, 9, 'q1', proportional(5, 9, names('A', 'B', 'C', 'D'))),
  [K(5, 9, 'q3')]: (() => { need(5, 9, 20); return rr(pt(5, 9, 'D')[1].mul(100)); })(),
  [K(5, 9, 'q4')]: (() => { need(5, 9, 20); return rr(coef(5, 9, 'B').mul(20).mul(100)); })(),
  [K(5, 9, 'q5')]: (() => { need(5, 9, 1300); return verdict(5, 9, 'q5', pt(5, 9, 'D')[1].mul(100).sub(1300).n <= 0n); })(),
  [K(5, 10, 'q1')]: verdict(5, 10, 'q1', proportional(5, 10, names('A', 'B', 'E'))),
  [K(5, 10, 'q3')]: CF(5, 10, 'A'), [K(5, 10, 'q4')]: CF(5, 10, 'B'),
  [K(5, 10, 'q5')]: (() => { if (coef(5, 10, 'A').sub(coef(5, 10, 'B')).isZero()) throw new Error('rapports égaux'); return byRe(5, 10, 'q5', /^لا يوجد معامل/); })(),
  [K(5, 10, 'q6')]: (() => { need(5, 10, 50); return rr(pt(5, 10, 'E')[1].mul(100)); })(),
};
