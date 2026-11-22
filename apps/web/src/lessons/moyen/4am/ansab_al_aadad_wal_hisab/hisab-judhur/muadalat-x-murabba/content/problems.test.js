import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Arithmétique EXACTE : décimaux en entiers (centièmes), carrés en entiers. ──
const H = 100; // 1 = 100 centièmes : 0,09 → 9, 3,3 → 330
const c = (x) => Math.round(x * H); // un décimal à au plus 2 chiffres, en centièmes
const sq = (x) => c(x) * c(x); // (x)² en dix-millièmes, exact
const isSquare = (n) => n >= 0 && Number.isInteger(Math.sqrt(n)) && Math.sqrt(n) ** 2 === n;
/** Les solutions de x² = a (a entier ou décimal) : [√a, −√a], [0] ou []. `null` si √a n'est pas décimal. */
const solve = (a) => {
  if (a < 0) return [];
  if (a === 0) return [0];
  const n = c(a) * H; // a en dix-millièmes
  return isSquare(n) ? [Math.sqrt(n) / H, -Math.sqrt(n) / H] : null;
};
/** Arrondi au dixième de √n, par encadrement entier : 10·k ≤ 10·√n < 10·(k+1). */
const tenthBelow = (n) => { let k = 0; while ((k + 1) ** 2 <= n * 100) k++; return k; }; // en dixièmes
const roundTenth = (n) => { const k = tenthBelow(n); return (2 * k + 1) ** 2 <= n * 400 ? k + 1 : k; };

const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choiceOf = (id, part, k) => PROBLEM[id].parts[part].steps.filter((st) => st.kind === 'choice')[k];
const correctOf = (id, part, k) => { const s = choiceOf(id, part, k); return s.options[s.correct]; };

// ── Vérificateur des RELATIONS écrites (explain, lines, prompt, bonne option) ──
// Chaque formule $…$ est découpée sur = < > \neq ; chaque membre purement
// numérique (entiers, décimaux 0{,}3, ×, +, −, ^2, (√n)², √n) est évalué, et
// chaque relation entre deux membres numériques VOISINS est vérifiée. Les
// membres contenant une lettre (x, h, d) ou \ldots sont ignorés.
const EPS = 1e-9;
function evalExpr(src) {
  let s = src
    .replace(/\\,\s*m(\^2)?/g, '') // unités
    .replace(/\{,\}/g, '.')
    .replace(/\\left|\\right/g, '')
    .replace(/\\times/g, '*')
    .replace(/\\sqrt\{([^{}]*)\}/g, 'S($1)')
    .replace(/\s+/g, '');
  if (!/^[\d.+\-*()S^]+$/.test(s) || s === '') return null;
  let i = 0;
  const atom = () => {
    let v;
    if (s[i] === '(') { i++; v = sum(); i++; } else if (s[i] === 'S') { i += 2; v = Math.sqrt(sum()); i++; } else if (s[i] === '-') { i++; return -atom(); } else {
      const j = i; while (/[\d.]/.test(s[i])) i++;
      if (i === j) throw new Error(`bad number in ${src}`);
      v = Number(s.slice(j, i));
    }
    if (s[i] === '^') { i++; const j = i; while (/\d/.test(s[i])) i++; v **= Number(s.slice(j, i)); }
    return v;
  };
  const prod = () => { let v = atom(); while (s[i] === '*') { i++; v *= atom(); } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? v + w : v - w; } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of text.matchAll(/\$([^$]+)\$/g)) {
    const parts = f.split(/(=|<|>|\\neq|\\approx)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [x, op, y] = [evalExpr(parts[k - 1]), parts[k], evalExpr(parts[k + 1])];
      if (x == null || y == null || op === '\\approx') continue;
      const ok = { '=': Math.abs(x - y) < EPS * Math.max(1, Math.abs(x)), '<': x < y - EPS, '>': x > y + EPS, '\\neq': Math.abs(x - y) > EPS }[op];
      expect(ok, `${where}: ${f}`).toBe(true);
      checked++;
    }
  }
  return checked;
}

describe('les مسائل du درس 3 (unité 2) « حل المعادلة من الشكل x² = a »', () => {
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
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(76);
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

  it('data: 4+ useful items, and at least one useless item that is a number', () => {
    for (const p of PROBLEMS) {
      expect(p.data.filter((d) => d.useful).length).toBeGreaterThanOrEqual(4);
      expect(p.data.some((d) => !d.useful && /\d/.test(d.text)), p.id).toBe(true);
      for (const d of p.data) expect(d.text.includes('$'), `${p.id} ${d.id}`).toBe(false);
    }
  });

  it('no bare √, x², h², d² or a/b in the Arabic text — every formula is a $…$ island', () => {
    const texts = (p) => [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);
    for (const p of PROBLEMS) for (const t of texts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/√|²|\\sqrt|\^|\d\s*\/\s*\d|\b[xhd]\b/);
    }
  });

  it('every written relation (explain, prompt, solution lines, correct options) is exact', () => {
    let checked = 0;
    for (const p of PROBLEMS) p.parts.forEach((part) => part.steps.forEach((s, si) => {
      const where = `${p.id} ${part.label} step ${si + 1}`;
      for (const t of [s.explain, s.prompt, ...(s.lines ?? [])].filter(Boolean)) checked += checkText(t, where);
      if (s.kind === 'choice') checked += checkText(s.options[s.correct], `${where} (correct option)`);
    }));
    expect(checked).toBeGreaterThan(70);
  });

  it('the relation checker fails on a mutated number (self-test)', () => {
    expect(() => checkText('$3{,}3^2 = 10{,}98$', 'mutant')).toThrow();
    expect(() => checkText('$4{,}4 < \\sqrt{19}$', 'mutant')).toThrow();
    expect(() => checkText('$136 \\times 450 = 61300$', 'mutant')).toThrow();
    expect(checkText('$(\\sqrt{11})^2 = 11$ و $9^2 = 81 < 91 < 100 = 10^2$', 'ok')).toBe(5);
  });

  it('مسألة 1 — the cards, Salma’s sheet and the score are computed, not typed', () => {
    const cards = [64, 0.09, 11, 0, -36];
    const sols = cards.map(solve);
    expect(sols[0]).toEqual([8, -8]);
    expect(sols[1]).toEqual([0.3, -0.3]);
    expect(sols[2]).toBeNull(); // √11 n'est pas décimal : solutions exactes √11 et −√11
    expect(sols[3]).toEqual([0]);
    expect(sols[4]).toEqual([]);
    // 1) les racines positives
    expect(expectedOf('masala-1', 0)).toEqual([sols[0][0], sols[1][0]]);
    expect(correctOf('masala-1', 0, 1)).toBe('$x = 8$ أو $x = -8$');
    expect(correctOf('masala-1', 0, 2)).toBe('$x = 0{,}3$ أو $x = -0{,}3$');
    // 2) 3,3² ≠ 11 (mais 3,3 est le مدوّر de √11) ; (−6)² = 36 ≠ −36
    expect(sq(3.3)).toBe(108900); // 10,89 en dix-millièmes
    expect(expectedOf('masala-1', 1)).toEqual([sq(3.3) / H ** 2, (-6) ** 2]);
    expect(sq(3.3)).not.toBe(11 * H * H);
    expect(roundTenth(11)).toBe(33);
    expect(correctOf('masala-1', 1, 1)).toBe('$x = \\sqrt{11}$ أو $x = -\\sqrt{11}$');
    // 3) la feuille de Salma, jugée nombre par nombre
    const sheet = [[8, -8], [0.3], [3.3, -3.3], [0], [-6]];
    const isSol = (a, v) => c(v) * c(v) === c(a) * H;
    let right = 0, wrong = 0;
    sheet.forEach((vals, k) => vals.forEach((v) => (isSol(cards[k], v) ? right++ : wrong++)));
    const score = right * 10 - wrong * 5;
    const allSols = 2 + 2 + 2 + 1; // 64, 0,09, 11 : deux ; 0 : une ; −36 : aucune
    const perfect = allSols * 10 + 15;
    expect([right, wrong]).toEqual([4, 3]);
    expect(expectedOf('masala-1', 2)).toEqual([right, wrong, score, allSols, perfect]);
    expect([score, perfect, perfect - score]).toEqual([25, 85, 60]);
  });

  it('مسألة 2 — the side, the perimeter and the cost are computed, not typed', () => {
    const area = 1225, gate = 4, price = 450, door = 18000;
    const [side, neg] = solve(area);
    expect([side, neg]).toEqual([35, -35]);
    expect(expectedOf('masala-2', 0)).toEqual([side]);
    const perimeter = 4 * side;
    expect(expectedOf('masala-2', 1)).toEqual([perimeter]);
    const fence = perimeter - gate;
    expect(expectedOf('masala-2', 2)).toEqual([fence, fence * price, fence * price + door]);
    expect([fence, fence * price, fence * price + door]).toEqual([136, 61200, 79200]);
    expect(correctOf('masala-2', 0, 2)).toBe('$x = 35$ أو $x = -35$');
  });

  it('مسألة 3 — Pythagoras, the three cases and the bracketing are computed, not typed', () => {
    const L = 10, window = 9; // le حبل (hypoténuse) et la hauteur de fixation minimale
    // 1) h² = 10² − 6² = 64 → h = 8 (−8 rejeté), sous les 9 m
    const h2a = L ** 2 - 6 ** 2;
    expect(solve(h2a)).toEqual([8, -8]);
    expect(expectedOf('masala-3', 0)).toEqual([h2a, solve(h2a)[0]]);
    expect(solve(h2a)[0]).toBeLessThan(window);
    // 2) h² = 91 (pas un carré : √91 exact), 81 < 91 < 100 ; وتد à 11 m : h² = −21 < 0
    const h2b = L ** 2 - 3 ** 2, h2c = L ** 2 - 11 ** 2;
    expect(solve(h2b)).toBeNull();
    expect(window ** 2 < h2b && h2b < L ** 2).toBe(true);
    expect(solve(h2c)).toEqual([]);
    expect(expectedOf('masala-3', 1)).toEqual([h2b, h2c]);
    expect(correctOf('masala-3', 1, 0)).toBe('$h = \\sqrt{91}$');
    // 3) d² = 10² − 9² = 19 ; 4,3 < √19 < 4,4 ; مدوّر 4,4 mais seul le وتد à 4,3 m fixe le حبل au-dessus de 9 m
    const d2 = L ** 2 - window ** 2;
    expect(solve(d2)).toBeNull();
    expect(tenthBelow(d2)).toBe(43);
    expect(roundTenth(d2)).toBe(44); // le piège : l'arrondi 4,4 est trop loin du صاري
    expect(expectedOf('masala-3', 2)).toEqual([d2, sq(4.3) / H ** 2, sq(4.4) / H ** 2]);
    expect(L ** 2 * H * H - sq(4.3)).toBeGreaterThan(window ** 2 * H * H); // 81,51 > 81
    expect(L ** 2 * H * H - sq(4.4)).toBeLessThan(window ** 2 * H * H); // 80,64 < 81
    expect(correctOf('masala-3', 2, 0)).toBe('$d = \\sqrt{19}$');
  });
});
