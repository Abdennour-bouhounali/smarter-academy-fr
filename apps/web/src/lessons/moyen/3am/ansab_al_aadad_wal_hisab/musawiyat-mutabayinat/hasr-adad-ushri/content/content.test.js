import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { EXERCISES, FINAL, E1, E2, E3, E4, E6, E7 } from './exercises';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS, METHOD, KNOWLEDGE } from './textbook';

/**
 * Les clés du درس « حصر عدد عشري موجب » recalculées avec un code INDÉPENDANT de `decimals.js` : des rationnels en BigInt, l'arrondi demi vers le haut écrit à la
 * main (floor(x·10^k + ½)), le LaTeX ÉCRIT dans les options relu (\frac, {,}, \leq) et des TÉMOINS (une grille fine autour du nombre). Trois familles :
 *  - « de l'arrondi » : l'option dit où est x quand son mudawwar est r ; la clé est vraie pour tous les x du mot ET équivalente (le même ensemble sur la grille) ;
 *    chaque distracteur est faux pour au moins un x du mot OU vrai pour un x hors du mot (l'extrémité droite incluse) ;
 *  - « d'un nombre » : l'option encadre un nombre donné ; la clé est vraie, serrée (deux repères consécutifs du rang), chaque distracteur est faux ;
 *  - « valeur » : un mudawwar, une valeur approchée, un ordre.
 */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const R = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
const step = (k) => R(1n, P10(k));
const add = (p, q) => R(p.n * q.d + q.n * p.d, p.d * q.d);
const mul = (p, q) => R(p.n * q.n, p.d * q.d);
const cmp = (p, q) => { const l = p.n * q.d; const r = q.n * p.d; return l < r ? -1 : l > r ? 1 : 0; };
const same = (p, q) => cmp(p, q) === 0;
const P10 = (k) => 10n ** BigInt(k);
const dec = (txt) => { const [a, b = ''] = String(txt).replace('{,}', ',').replace(',', '.').split('.'); return R(BigInt(a + b), P10(b.length)); };
const floorDiv = (a, b) => { const q = a / b; return (a % b !== 0n && (a < 0n) !== (b < 0n)) ? q - 1n : q; };
/** floor / ceil / round (demi vers le haut) de x au rang k, en rationnel. */
const floorAt = (x, k) => R(floorDiv(x.n * P10(k), x.d), P10(k));
const ceilAt = (x, k) => { const f = floorAt(x, k); return same(f, x) ? f : add(f, step(k)); };
const roundAt = (x, k) => R(floorDiv(2n * x.n * P10(k) + x.d, 2n * x.d), P10(k));

/** Lecture d'un jeton LaTeX : « 7{,}48 », « 12 », « \frac{389}{47} », ou une variable de `env`. */
function val(tok, env = {}) {
  const t = tok.replace(/\\ /g, '').trim();
  let m = t.match(/^\\frac\{(\d+)\}\{(\d+)\}$/);
  if (m) return R(BigInt(m[1]), BigInt(m[2]));
  if (/^\d+(\{,\}\d+)?$/.test(t)) return dec(t);
  if (t in env) return env[t];
  throw new Error(`jeton illisible « ${tok} »`);
}
/** « lo REL v REL hi » → { lo, r1, v, r2, hi }. */
function chain3(tex) {
  const parts = String(tex).replace(/\$/g, '').replace(/\\leq\s?/g, '≤').split(/(≤|<)/);
  if (parts.length !== 5) throw new Error(`pas un encadrement : ${tex}`);
  return { lo: parts[0], r1: parts[1], v: parts[2], r2: parts[3], hi: parts[4] };
}
const holds = (a, rel, b) => (rel === '<' ? cmp(a, b) < 0 : cmp(a, b) <= 0);
const claim = (tex, name, x) => { const c = chain3(tex); if (c.v !== name) throw new Error(`variable ${c.v} ≠ ${name} dans ${tex}`); return holds(val(c.lo), c.r1, x) && holds(x, c.r2, val(c.hi)); };

/** La grille autour de r : x = i / 10^(rank+2), à une unité de rang de chaque côté (les bouts r ± ½·10^-rank en font partie). */
function grid(r, rank) {
  const g = rank + 2;
  const c = r.n * P10(g) / r.d;
  const out = [];
  for (let i = c - 100n; i <= c + 100n; i += 1n) if (i > 0n) out.push(R(i, P10(g)));
  return out;
}
const inWord = (x, r, rank) => same(roundAt(x, rank), r);

function checkFromRounding({ name, r, rank, key, wrongs, options, correct, label }) {
  const rr = dec(r);
  const xs = grid(rr, rank);
  const S = xs.filter((x) => inWord(x, rr, rank));
  expect(S.length, `${label} : mot non vide`).toBeGreaterThan(50);
  const texts = options.map((o) => o);
  expect(new Set(texts).size, `${label} : options distinctes`).toBe(options.length);
  options.forEach((o, i) => {
    if (i === correct) {
      expect(xs.every((x) => claim(o, name, x) === inWord(x, rr, rank)), `${label} : la clé ${o} décrit exactement le mot`).toBe(true);
    } else {
      // faux pour un nombre du mot, OU vrai pour un nombre hors du mot (l'extrémité droite incluse à tort) : il ne décrit PAS le mot
      expect(S.some((x) => !claim(o, name, x)) || xs.some((x) => claim(o, name, x) && !inWord(x, rr, rank)), `${label} : le distracteur ${o} ne décrit pas le mot`).toBe(true);
    }
  });
  const T = (o) => `$${o.lo.replace(',', '{,}')}${o.r1 === '<=' ? '\\leq ' : '<'}${name}${o.r2 === '<=' ? '\\leq ' : '<'}${o.hi.replace(',', '{,}')}$`;
  expect(options[correct]).toBe(T(key));
  wrongs.forEach((w) => expect(options).toContain(T(w)));
}

function checkAboutNumber({ name, x, rank, wrongs, options, correct, label }) {
  options.forEach((o, i) => {
    const holdsFor = claim(o, name, x);
    if (i === correct) {
      expect(holdsFor, `${label} : la clé ${o} est vraie`).toBe(true);
      const c = chain3(o);
      expect(c.r1 === '<' && c.r2 === '<', `${label} : strict`).toBe(true);
      const lo = val(c.lo); const hi = val(c.hi);
      expect(same(lo, floorAt(x, rank)) && same(hi, add(floorAt(x, rank), step(rank))), `${label} : deux repères consécutifs du rang`).toBe(true);
    } else expect(holdsFor, `${label} : le distracteur ${o} est faux`).toBe(false);
  });
  expect(options).toHaveLength(wrongs.length + 1);
}

describe('le درس « حصر عدد عشري موجب » — clés recalculées', () => {
  it('l\'arrondi indépendant donne les valeurs connues', () => {
    expect(same(roundAt(dec('7,5'), 0), R(8n))).toBe(true);
    expect(same(roundAt(dec('9,8462'), 1), dec('9,8'))).toBe(true);
    expect(same(roundAt(dec('6,358'), 1), dec('6,4'))).toBe(true);
    expect(same(roundAt(dec('1,25'), 1), dec('1,3'))).toBe(true);
    expect(same(roundAt(dec('1,2499'), 1), dec('1,2'))).toBe(true);
    expect(same(ceilAt(dec('4,2531'), 2), dec('4,26'))).toBe(true);
    expect(same(ceilAt(dec('4,25'), 2), dec('4,25'))).toBe(true);
  });

  it('E1 (act-3 1) et E3 (now-77-1, know-3) : « peut-il valoir… ? » et l\'encadrement du mot', () => {
    for (const [E, id] of [[E1, 'act-3-1'], [E3, 'now-77-1']]) {
      const ex = EXERCISES.find((e) => e.id === id);
      const r = dec(E.r);
      E.cans.forEach((c, i) => {
        expect(c.key, `${id} ${c.val}`).toBe(same(roundAt(dec(c.val), E.rank), r));
        const row = ex.question.rows[i];
        expect(row.options).toEqual(['نعم', 'لا']);
        expect(row.correct).toBe(c.key ? 0 : 1);
        expect(row.label).toBe(`$${E.v}=${c.val.replace(',', '{,}')}$`);
      });
      const row = ex.question.rows[E.cans.length];
      checkFromRounding({ name: E.v, r: E.r, rank: E.rank, key: E.key, wrongs: E.wrongs, options: row.options, correct: row.correct, label: id });
    }
    expect(E3.cans.map((c) => c.key)).toEqual([true, true, false, false]);
    expect(E1.cans.map((c) => c.key)).toEqual([true, true, false, false]);
  });

  it('E2 (act-3 2) : 389 ÷ 47 — l\'écran de la calculatrice, puis les quatre encadrements', () => {
    const A = R(BigInt(E2.num), BigInt(E2.den));
    const ex = EXERCISES.find((e) => e.id === 'act-3-2');
    // l'écran : 10 chiffres significatifs, le dernier ARRONDI
    expect(E2.screen).toBe('8.276595745');
    expect(same(roundAt(A, 9), dec('8.276595745'))).toBe(true);
    E2.rows.forEach((r, i) => {
      const row = ex.question.rows[i];
      checkAboutNumber({ name: 'A', x: A, rank: r.rank, key: r.key, wrongs: r.wrongs, options: row.options, correct: row.correct, label: `E2.${i}` });
    });
  });

  it('E4 (self-5, prep 14) : 151 ÷ 12', () => {
    const A = R(151n, 12n);
    const rows = EXERCISES.find((e) => e.id === 'self-5').question.rows;
    expect(E4.screen).toBe('12.58333333');
    expect(same(roundAt(A, 8), dec('12.58333333'))).toBe(true);
    const asNumber = (o) => val(o.replace(/\$/g, ''));
    for (const [i, rank, E] of [[0, 0, E4.unit], [1, 1, E4.tenth]]) {
      const row = rows[i];
      expect(same(asNumber(row.options[row.correct]), roundAt(A, rank))).toBe(true);
      row.options.forEach((o, j) => { if (j !== row.correct) expect(same(asNumber(o), roundAt(A, rank)), `${i} ${o}`).toBe(false); });
      expect(row.options).toHaveLength(E.wrongs.length + 1);
    }
    const b = rows[2];
    checkAboutNumber({ name: '\\frac{151}{12}', x: A, rank: 0, key: E4.bracket.key, wrongs: E4.bracket.wrongs, options: b.options, correct: b.correct, label: 'E4.3' });
  });

  it('E5 (ex-21) : 3,14 < π < 3,15 donne 25,12 < 8π < 25,2, et P = 8π est faux ailleurs', () => {
    const PI = R(31415926535897932n, 10n ** 16n);
    const Pm = mul(R(8n), PI);
    const row = EXERCISES.find((e) => e.id === 'ex-21').question.rows[0];
    expect(cmp(dec('3,14'), PI) < 0 && cmp(PI, dec('3,15')) < 0).toBe(true);
    expect(same(mul(R(8n), dec('3,14')), dec('25,12')) && same(mul(R(8n), dec('3,15')), dec('25,2'))).toBe(true);
    row.options.forEach((o, i) => expect(claim(o, 'P', Pm), `E5 ${o}`).toBe(i === row.correct));
    expect(row.options[row.correct]).toBe('$25{,}12<P<25{,}2$');
  });

  it('E6 (ex-28) : h au centième → 6,315 ≤ h < 6,325 ; V = 20h → 126,3 ≤ V < 126,5', () => {
    const rows = EXERCISES.find((e) => e.id === 'ex-28').question.rows;
    checkFromRounding({ name: 'h', r: E6.r, rank: E6.rank, key: E6.h.key, wrongs: E6.h.wrongs, options: rows[0].options, correct: rows[0].correct, label: 'E6.h' });
    const Vs = grid(dec(E6.r), E6.rank).filter((h) => inWord(h, dec(E6.r), E6.rank)).map((h) => mul(R(BigInt(E6.base)), h));
    rows[1].options.forEach((o, i) => {
      const all = Vs.every((v) => claim(o, 'V', v));
      expect(all, `E6.v ${o}`).toBe(i === rows[1].correct);
    });
    const c = chain3(rows[1].options[rows[1].correct]);
    expect(same(val(c.lo), mul(R(20n), dec('6,315'))) && same(val(c.hi), mul(R(20n), dec('6,325')))).toBe(true);
    expect(c.r1 === '≤' && c.r2 === '<').toBe(true);
  });

  it('E7 (ex-20, 22, 25) : 3/8 < 0,4 < 5/12 par les décimaux', () => {
    const rows = EXERCISES.find((e) => e.id === 'ex-20').question.rows;
    const t = R(3n, 8n);
    const asNumber = (o) => val(o.replace(/\$/g, ''));
    expect(same(asNumber(rows[0].options[rows[0].correct]), t)).toBe(true);
    rows[0].options.forEach((o, j) => { if (j !== rows[0].correct) expect(same(asNumber(o), t), o).toBe(false); });
    const f = R(5n, 12n);
    checkAboutNumber({ name: '\\frac{5}{12}', x: f, rank: 3, key: E7.bracket.key, wrongs: E7.bracket.wrongs, options: rows[1].options, correct: rows[1].correct, label: 'E7.2' });
    const order = (o) => { const p = o.replace(/\$/g, '').split('<'); if (p.length !== 3) throw new Error(o); return p.map((q) => val(q)); };
    rows[2].options.forEach((o, i) => { const [a, b, c] = order(o); expect(cmp(a, b) < 0 && cmp(b, c) < 0, o).toBe(i === rows[2].correct); });
    expect(cmp(t, dec('0,4')) < 0 && cmp(dec('0,4'), f) < 0).toBe(true);
  });

  it('le إختبار أولي : chaque clé juste, chaque distracteur faux, et le module contient chaque option', () => {
    const src = readFileSync(new URL('../modules/Module08Itqan.jsx', import.meta.url), 'utf8');
    for (const f of FINAL) f.options.forEach((o) => expect(src.includes(`'${o.replace(/\\/g, '\\\\')}'`), `${f.id} option ${o} absente du module`).toBe(true));
    const [e1, e2, e3, e4, e5] = FINAL;
    checkAboutNumber({ name: '17{,}08', x: dec('17,08'), rank: 0, key: e1.key, wrongs: e1.wrongs, options: e1.options.map((o) => o.replace('17{,}08', 'X')).map((o) => o.replace('X', '17{,}08')), correct: e1.correct, label: 'E1' });
    // E2 : la valeur par excès au centième
    const x2 = dec(e2.x); const key2 = ceilAt(x2, e2.rank);
    e2.options.forEach((o, i) => expect(same(val(o.replace(/\$/g, '')), key2), `E2 ${o}`).toBe(i === e2.correct));
    expect(same(key2, dec('4,26'))).toBe(true);
    // E3 : l'arrondi (et pas l'arrondi en chaîne)
    const x3 = dec(e3.x); const key3 = roundAt(x3, e3.rank);
    e3.options.forEach((o, i) => expect(same(val(o.replace(/\$/g, '')), key3), `E3 ${o}`).toBe(i === e3.correct));
    expect(same(roundAt(roundAt(x3, 2), 1), dec('9,9'))).toBe(true); // le piège de l'arrondi en chaîne
    checkFromRounding({ name: 'x', r: e4.r, rank: e4.rank, key: e4.key, wrongs: e4.wrongs, options: e4.options, correct: e4.correct, label: 'E4' });
    const A = R(BigInt(e5.num), BigInt(e5.den));
    expect(same(roundAt(A, 8), dec(e5.screen))).toBe(true);
    checkAboutNumber({ name: '\\frac{250}{7}', x: A, rank: e5.rank, key: { lo: e5.key[0], hi: e5.key[1] }, wrongs: e5.wrongs, options: e5.options, correct: e5.correct, label: 'E5' });
    expect(FINAL.map((f) => f.lp.slice(-2))).toEqual(['P1', 'P2', 'P3', 'P3', 'P4']);
  });

  it('la طريقة : A (7,4826), B (3,72), C (355 ÷ 113)', () => {
    const x = dec('7,4826');
    expect([2, 3].map((k) => `${floorAt(x, k).n}/${floorAt(x, k).d}`)).toEqual(['187/25', '3741/500']);
    expect(same(floorAt(x, 2), dec('7,48')) && same(ceilAt(x, 2), dec('7,49')) && same(roundAt(x, 2), dec('7,48'))).toBe(true);
    expect(same(floorAt(x, 3), dec('7,482')) && same(ceilAt(x, 3), dec('7,483')) && same(roundAt(x, 3), dec('7,483'))).toBe(true);
    const r = dec('3,72');
    const lo = dec('3,715'); const hi = dec('3,725');
    for (const [v, yes] of [['3,7249', true], ['3,725', false], ['3,714', false], ['3,715', true]]) expect(same(roundAt(dec(v), 2), r), v).toBe(yes);
    expect(same(add(r, R(-1n, 200n)), lo) && same(add(r, R(1n, 200n)), hi)).toBe(true);
    const q = R(355n, 113n);
    expect(same(roundAt(q, 8), dec('3.14159292'))).toBe(true);
    expect(same(floorAt(q, 3), dec('3,141')) && same(ceilAt(q, 3), dec('3,142'))).toBe(true);
    expect(same(roundAt(q, 2), dec('3,14')) && same(roundAt(q, 3), dec('3,142'))).toBe(true);
    expect(METHOD.rank.solution).toHaveLength(2);
    expect(KNOWLEDGE.quotient.text.length).toBeGreaterThan(20);
  });

  it('معارف : 6,358 aux trois rangs, 8,5 ≤ x < 9,5, et les exemples du texte', () => {
    const x = dec('6,358');
    expect([0, 1, 2].map((k) => floorAt(x, k)).map((v) => `${v.n / v.d}`.length > 0)).toEqual([true, true, true]);
    expect(same(ceilAt(x, 0), R(7n)) && same(ceilAt(x, 1), dec('6,4')) && same(floorAt(x, 2), dec('6,35')) && same(ceilAt(x, 2), dec('6,36'))).toBe(true);
    expect(same(roundAt(x, 0), R(6n)) && same(roundAt(x, 1), dec('6,4')) && same(roundAt(x, 2), dec('6,36'))).toBe(true);
    expect(same(roundAt(dec('8,5'), 0), R(9n)) && same(roundAt(dec('9,49'), 0), R(9n)) && same(roundAt(dec('9,5'), 0), R(10n))).toBe(true);
    expect(same(roundAt(dec('3,68'), 1), dec('3,7'))).toBe(true); // GUIDE.trunc
    expect(same(roundAt(dec('3,65'), 1), dec('3,7'))).toBe(true); // GUIDE.closed
    expect(same(floorAt(R(2n, 7n), 3), dec('0,285')) && same(ceilAt(R(2n, 7n), 3), dec('0,286'))).toBe(true);
    expect(KNOWLEDGE.fromRound.example).toContain('8{,}5\\le x<9{,}5');
  });

  it('« أستعدّ » : chaque affirmation a la vérité qu\'elle annonce', () => {
    const claims = [
      [PREP_PLATFORM_ITEMS[0], same(roundAt(dec('7,5'), 0), R(8n))],
      [PREP_PLATFORM_ITEMS[1], same(roundAt(dec('12,49'), 0), R(13n))],
      [PREP_PLATFORM_ITEMS[2], cmp(R(3n), dec('3,08')) < 0 && cmp(dec('3,08'), R(4n)) < 0],
      [PREP_PLATFORM_ITEMS[3], same(ceilAt(dec('6,02'), 0), R(6n))],
      [PREP_ITEMS[0], same(roundAt(R(157n, 12n), 0), R(13n))],
      [PREP_ITEMS[1], same(roundAt(R(53n, 7n), 1), dec('7,5'))],
      [PREP_PLATFORM_ITEMS[4], (() => { const xs = []; for (let i = 25n; i < 35n; i += 1n) xs.push(R(i, 10n)); return xs.every((v) => cmp(mul(R(4n), v), R(10n)) >= 0 && cmp(mul(R(4n), v), R(14n)) < 0); })()],
    ];
    for (const [item, truth] of claims) expect(item.answer, item.text).toBe(truth);
    expect(PREP_ITEMS.map((i) => i.n)).toEqual([13, 15]);
    expect(same(roundAt(R(53n, 7n), 9), dec('7.571428571'))).toBe(true);
  });

  it('chaque exercice nomme son LP et sa source ; l\'écran de la calculatrice arrondit son dernier chiffre', () => {
    for (const ex of EXERCISES) { expect(ex.learningPointId).toMatch(/^3am_hasr-adad-ushri_P[1-4]$/); expect(ex.source.type).toBe('textbook'); }
    expect(EXERCISES.map((e) => e.id)).toEqual(['act-3-1', 'act-3-2', 'now-77-1', 'self-5', 'ex-21', 'ex-28', 'ex-20']);
    expect(same(roundAt(R(247n, 83n), 9), dec('2.975903614'))).toBe(true);
  });
});
