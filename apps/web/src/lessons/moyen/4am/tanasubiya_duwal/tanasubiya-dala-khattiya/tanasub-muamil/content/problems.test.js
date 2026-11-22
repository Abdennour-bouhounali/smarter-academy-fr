import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Arithmétique EXACTE : des fractions d'entiers (BigInt), jamais de flottants. ──
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const F = (n, d = 1n) => {
  n = BigInt(n); d = BigInt(d);
  if (d === 0n) throw new Error('division by zero');
  if (d < 0n) { n = -n; d = -d; }
  const g = gcd(n, d) || 1n;
  return { n: n / g, d: d / g };
};
/** « 52,5 » / « 7.5 » / 12 → fraction exacte. */
const Q = (s) => {
  const t = String(s).replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(t)) throw new Error(`not a number: ${s}`);
  const [i, dec = ''] = t.split('.');
  return F(BigInt(i + dec), 10n ** BigInt(dec.length));
};
const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a, b) => F(a.n * b.n, a.d * b.d);
const div = (a, b) => F(a.n * b.d, a.d * b.n);
const eq = (a, b) => a.n === b.n && a.d === b.d;
const cmp = (a, b) => { const x = a.n * b.d - b.n * a.d; return x < 0n ? -1 : x > 0n ? 1 : 0; };
/** Une fraction → nombre JS (pour comparer aux `expected`, qui sont des décimaux finis). */
const num = (a) => Number(a.n) / Number(a.d);
const isInt = (a) => a.d === 1n;

// ── Vérificateur des RELATIONS écrites (explain, prompt, question, lignes, options) ──
// Chaque formule $…$ est découpée sur = < > \neq ; chaque membre est évalué EXACTEMENT —
// nombres (« 7{,}5 »), ×, ÷, +, −, parenthèses, \dfrac{a}{b}, lettres de `env` ; une relation entre
// deux membres évaluables voisins est vérifiée. Un membre avec \ldots, une lettre hors `env`… est ignoré.
/** Les formules écrites EXPRÈS fausses (distracteurs, cités dans une explication pour les réfuter). */
const WRONG_ON_PURPOSE = new Set(['x = 12 \\times y', 'y = x + 12', 'y = 60 + 12 \\times x', 'x = 125 \\times y', 'y = x + 125', 'y = 750 \\times x']);
function evalExpr(src, env = {}) {
  const s = src
    .replace(/\{,\}/g, '.') // AVANT \dfrac : « \dfrac{52{,}5}{7{,}5} » a des accolades imbriquées
    .replace(/\\dfrac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/\\left|\\right/g, '')
    .replace(/\\times/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\{,\}/g, '.')
    .replace(/\s+/g, '');
  if (s === '' || !/^[\d.+\-*/()a-z]+$/.test(s)) return null;
  if ([...s.matchAll(/[a-z]/g)].some(([v]) => !(v in env))) return null;
  let i = 0;
  const atom = () => {
    if (s[i] === '-') { i++; return mul(F(-1), atom()); }
    let v;
    if (s[i] === '(') { i++; v = sum(); if (s[i] !== ')') throw new Error(`) in ${src}`); i++; } else if (/[a-z]/.test(s[i])) { v = env[s[i]]; i++; } else {
      const j = i; while (/[\d.]/.test(s[i] ?? '')) i++;
      if (i === j) throw new Error(`bad number in ${src}`);
      v = Q(s.slice(j, i));
    }
    while (s[i] === '(' || /[a-z]/.test(s[i] ?? '')) v = mul(v, atom()); // produit implicite
    return v;
  };
  const prod = () => { let v = atom(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = atom(); v = op === '*' ? mul(v, w) : div(v, w); } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? add(v, w) : sub(v, w); } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
function checkText(text, where, env = {}) {
  let checked = 0;
  for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
    if (WRONG_ON_PURPOSE.has(f.trim())) continue;
    const parts = f.split(/(=|<|>|\\neq)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [x, op, y] = [evalExpr(parts[k - 1], env), parts[k], evalExpr(parts[k + 1], env)];
      if (x == null || y == null) continue;
      const c = cmp(x, y);
      const ok = { '=': c === 0, '<': c < 0, '>': c > 0, '\\neq': c !== 0 }[op];
      expect(ok, `${where}: ${f}`).toBe(true);
      checked++;
    }
  }
  return checked;
}

// ── Lecture des données : TOUT vient du tableau de l'énoncé, jamais d'une valeur retapée. ──
const rowOf = (id, k) => PROBLEM[id].table.rows[k].slice(1);
const headOf = (id) => PROBLEM[id].table.head.slice(1);
const ratios = (xs, ys) => xs.map((x, i) => (ys[i] === '…' || x === '…' ? null : div(Q(ys[i]), Q(x)))).filter(Boolean);
const proportional = (xs, ys) => { const r = ratios(xs, ys); return r.length >= 2 && r.every((q) => eq(q, r[0])); };

const partOf = (id, part) => PROBLEM[id].parts[part];
const expectedOf = (id, part) => partOf(id, part).steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choiceOf = (id, part, k) => partOf(id, part).steps.filter((st) => st.kind === 'choice')[k];
const correctOf = (id, part, k) => { const s = choiceOf(id, part, k); return s.options[s.correct]; };

/** Les inconnues nommées de chaque partie (lignes « y = 12 × x » vérifiées en un point du tableau). */
const ENV = {
  'masala-1': [{}, { x: F(35), y: mul(F(12), F(35)) }, {}],
  'masala-2': [{}, { x: F(6), y: F(750) }, { x: F(6), y: F(750) }],
  'masala-3': [{}, {}, {}],
};

describe('les مسائل du درس 1 (unité 6) « التناسبية ومعامل التناسبية »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (4, 5, 6 — track problem, practice_lab, before the test 7)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage, m.estimatedMin])).toEqual([
      [4, '04', 'masala-1', 'practice_lab', 8], [5, '05', 'masala-2', 'practice_lab', 8], [6, '06', 'masala-3', 'practice_lab', 8],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '07', number: 7, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(69);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(4);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 4], ['masala-2', 5], ['masala-3', 6]]);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('data: 4+ useful items, and at least one useless item that is a number; the statement shows its table', () => {
    for (const p of PROBLEMS) {
      expect(p.data.filter((d) => d.useful).length).toBeGreaterThanOrEqual(4);
      expect(p.data.some((d) => !d.useful && /\d/.test(d.text)), p.id).toBe(true);
      for (const d of p.data) expect(d.text.includes('$'), `${p.id} ${d.id}`).toBe(false);
      expect(p.table?.rows.length, p.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('no bare letter, a/b or « DA » in the Arabic text — every formula is a $…$ island; money in دج', () => {
    const texts = (p) => [p.statement, ...p.data.map((d) => d.text), ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, s.suffix, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);
    for (const p of PROBLEMS) for (const t of texts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/\\|\^|\d\s*\/\s*\d|\b[xyab]\b|DA\b|÷|×/);
    }
  });

  it('every written relation (statement, question, explain, prompt, solution lines, options) is exact', () => {
    let checked = 0;
    for (const p of PROBLEMS) {
      checked += checkText(p.statement, `${p.id} statement`);
      p.parts.forEach((part, pi) => {
        const env = ENV[p.id][pi];
        checked += checkText(part.question, `${p.id} ${part.label} question`, env);
        part.steps.forEach((s, si) => {
          const where = `${p.id} ${part.label} step ${si + 1}`;
          for (const t of [s.explain, s.prompt, ...(s.lines ?? [])].filter(Boolean)) checked += checkText(t, where, env);
          // la bonne option avec les valeurs de la partie ; les distracteurs, sans inconnue (leurs calculs
          // sont justes, c'est leur RAISONNEMENT qui est faux)
          if (s.kind === 'choice') s.options.forEach((o, k) => { checked += checkText(o, `${where} option ${k + 1}`, k === s.correct ? env : {}); });
        });
      });
    }
    expect(checked).toBeGreaterThan(120);
  });

  it('the relation checker fails on a mutated number (self-test)', () => {
    expect(() => checkText('$\\dfrac{60}{5} = \\dfrac{120}{10} = \\dfrac{180}{15} = \\dfrac{240}{20} = 13$', 'mutant')).toThrow();
    expect(() => checkText('$330 = 8 \\times 41 + 3$', 'mutant')).toThrow();
    expect(() => checkText('$\\dfrac{52{,}5}{7{,}5} = 7{,}1$', 'mutant')).toThrow();
    expect(() => checkText('$7{,}5 \\neq 7{,}50$', 'mutant')).toThrow();
    expect(() => checkText('$y = 12 \\times x$', 'mutant', { x: F(35), y: F(421) })).toThrow();
    expect(checkText('$\\dfrac{13860}{22} = 630$ و $3250 \\div 1000 = 3{,}25$ و $y = 125 \\times x$', 'ok', { x: F(6), y: F(750) })).toBe(3);
  });

  it('مسألة 1 — the Jijel scooters: both tables, the coefficient, y = 12 × x, the brother and the budget are computed, not typed', () => {
    const st = PROBLEM['masala-1'].statement;
    // l'énoncé donne les deux tarifs ; le tableau est CALCULÉ à partir d'eux
    for (const s of ['12 دج لكل دقيقة', '60 دج لفتح القفل ثم 8 دج لكل دقيقة', '5 و 10 و 15 و 20 دقيقة']) expect(st).toContain(s);
    const [rate, fix, rateB] = [F(12), F(60), F(8)];
    const xs = headOf('masala-1');
    const [A, B] = [rowOf('masala-1', 0), rowOf('masala-1', 1)];
    xs.forEach((x, i) => {
      expect(eq(Q(A[i]), mul(rate, Q(x))), `A ${x}`).toBe(true);
      expect(eq(Q(B[i]), add(fix, mul(rateB, Q(x)))), `B ${x}`).toBe(true);
    });
    // 1) A proportionnel de coefficient 12 ; B non (20 ≠ 11), malgré la coïncidence 180/15 = 12
    expect(proportional(xs, A)).toBe(true);
    expect(proportional(xs, B)).toBe(false);
    const rA = ratios(xs, A)[0];
    const rB = ratios(xs, B);
    expect(eq(rA, rate)).toBe(true);
    expect(expectedOf('masala-1', 0)).toEqual([num(rA), num(rB[0]), num(rB[3])]);
    expect([num(rB[0]), num(rB[3])]).toEqual([20, 11]);
    expect(eq(rB[2], rate)).toBe(true); // le piège de la 3e colonne
    // 2) 12 × 35 ; 60 + 8 × 35 ; le frère : 7 × 100, qui paie 7 fois l'ouverture
    const d = F(35);
    const priceA = mul(rate, d);
    const priceB = add(fix, mul(rateB, d));
    expect(eq(div(d, Q(xs[0])), F(7))).toBe(true);
    const brother = mul(F(7), Q(B[0]));
    expect(expectedOf('masala-1', 1)).toEqual([num(priceA), num(priceB)]);
    expect(eq(sub(brother, priceB), mul(F(6), fix))).toBe(true);
    expect(correctOf('masala-1', 1, 0)).toBe('$y = 12 \\times x$');
    // 3) 390 dج : A dépasse, B suffit ; reste ; plus longue durée entière en B
    const budget = 390;
    expect(PROBLEM['masala-1'].parts[2].question).toContain(`${budget} دج`);
    expect(cmp(priceA, F(budget))).toBe(1);
    expect(cmp(priceB, F(budget))).toBe(-1);
    const left = budget - num(fix);
    const [qMin, rMin] = [Math.floor(left / num(rateB)), left % num(rateB)];
    expect(expectedOf('masala-1', 2)).toEqual([budget - num(priceB), left, qMin]);
    expect([qMin, rMin]).toEqual([41, 2]);
    expect(num(fix) + num(rateB) * qMin).toBeLessThanOrEqual(budget);
    expect(num(fix) + num(rateB) * (qMin + 1)).toBeGreaterThan(budget);
  });

  it('مسألة 2 — the Friday couscous: semolina proportional, cooking time not, bags and leftover are computed, not typed', () => {
    const xs = headOf('masala-2');
    const [sem, time] = [rowOf('masala-2', 0), rowOf('masala-2', 1)];
    // 1) 125 g par personne, partout ; 26 = 10 + 16 → somme des colonnes = 125 × 26
    expect(proportional(xs, sem)).toBe(true);
    const a = ratios(xs, sem)[0];
    expect(num(a)).toBe(125);
    const guests = F(26);
    expect(PROBLEM['masala-2'].statement).toContain('26 شخصًا');
    const i10 = xs.indexOf('10'); const i16 = xs.indexOf('16');
    expect(eq(add(Q(xs[i10]), Q(xs[i16])), guests)).toBe(true);
    const need = add(Q(sem[i10]), Q(sem[i16]));
    expect(eq(need, mul(a, guests))).toBe(true);
    expect(expectedOf('masala-2', 0)).toEqual([num(a), num(need)]);
    // 2) y = 125 × x ; la durée : 30/4 ≠ 60/16 — le tableau-piège ; la fille : 4 × 30 ≠ 60
    expect(correctOf('masala-2', 1, 0)).toBe(`$y = ${num(a)} \\times x$`);
    expect(proportional(xs, time)).toBe(false);
    const rt = ratios(xs, time);
    expect(expectedOf('masala-2', 1)).toEqual([num(rt[0]), num(rt[3])]);
    expect(eq(rt[0], rt[3])).toBe(false);
    expect(Q(time[3]).n).not.toBe(4n * Q(time[0]).n);
    // 3) sacs de 1 kg (1000 g) à 110 dج : ⌈3250 / 1000⌉ = 4 ; 440 ; reste 750 g → 6 personnes
    expect(PROBLEM['masala-2'].statement).toContain('1 كغ، ثمن الكيس 110 دج');
    const bags = Math.ceil(num(need) / 1000);
    expect(bags * 1000 - 1000).toBeLessThan(num(need));
    const rest = F(bags * 1000 - num(need));
    const persons = div(rest, a);
    expect(isInt(persons)).toBe(true);
    expect(expectedOf('masala-2', 2)).toEqual([bags * 110, num(rest), num(persons)]);
    expect([bags, num(persons)]).toEqual([4, 6]);
    expect(correctOf('masala-2', 2, 0).startsWith(`${bags} أكياس`)).toBe(true);
  });

  it('مسألة 3 — the Béjaïa road map: coefficient, missing distances, road signs and the minibus are computed, not typed', () => {
    const [map, straight, road] = [rowOf('masala-3', 0), rowOf('masala-3', 1), rowOf('masala-3', 2)];
    expect(PROBLEM['masala-3'].statement).toContain('تمثّل 2 سم مسافة حقيقية قدرها 15 كم');
    // 1) a = 15 / 2 ; سوق الاثنين 4 × a ; خراطة 6 × a ; أقبو 52,5 / a
    const a = div(Q(straight[0]), Q(map[0]));
    expect(num(a)).toBe(7.5);
    const souk = mul(Q(map[1]), a);
    const kherrata = mul(Q(map[2]), a);
    const akbouMap = div(Q(straight[3]), a);
    expect(eq(souk, mul(F(2), Q(straight[0])))).toBe(true); // 4 = 2 × 2 : propriété des colonnes
    expect(eq(kherrata, mul(F(3), Q(straight[0])))).toBe(true);
    expect(isInt(akbouMap)).toBe(true);
    expect(expectedOf('masala-3', 0)).toEqual([num(a), num(souk), num(kherrata), num(akbouMap)]);
    expect(correctOf('masala-3', 0, 0)).toBe(`$\\dfrac{${straight[0]}}{${map[0]}}$`);
    // le tableau complété est bien proportionnel
    const fullMap = [map[0], map[1], map[2], String(num(akbouMap))];
    const fullStraight = [straight[0], String(num(souk)), String(num(kherrata)), straight[3]];
    expect(proportional(fullMap, fullStraight)).toBe(true);
    // 2) les panneaux : 17/2 ≠ 63/6 — le tableau-piège ; la route est toujours plus longue que la droite
    const fullMapQ = fullMap.map(Q);
    expect(proportional(fullMap, road)).toBe(false);
    const r = ratios(fullMap, road);
    expect(expectedOf('masala-3', 1)).toEqual([num(r[0]), num(r[2])]);
    road.forEach((d, i) => expect(cmp(Q(d), mul(fullMapQ[i], a)), `road ${i}`).toBe(1));
    expect(num(sub(Q(road[2]), kherrata))).toBe(18);
    // 3) aller-retour sur la ROUTE : 2 × 63 ; 110 × 126 ; ÷ 22 (entier)
    const q3 = PROBLEM['masala-3'].parts[2].question;
    expect(q3).toContain('110 دج لكل كيلومتر');
    expect(q3).toContain('22 منخرطًا');
    const km = mul(F(2), Q(road[2]));
    const cost = mul(F(110), km);
    const each = div(cost, F(22));
    expect(isInt(each)).toBe(true);
    expect(expectedOf('masala-3', 2)).toEqual([num(km), num(cost), num(each)]);
    expect(num(each)).toBe(630);
    // le piège : la distance à vol d'oiseau donnerait 450 dج
    expect(num(div(mul(F(110), mul(F(2), kherrata)), F(22)))).toBe(450);
  });
});
