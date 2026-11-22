import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Les دساتير du livre, recalculés comme le tableur (MAX-MIN, MEDIANE, MOYENNE, MODE) ──────────
const sorted = (xs) => [...xs].sort((a, b) => a - b);
const sum = (xs) => xs.reduce((t, x) => t + x, 0);
const range = (xs) => Math.max(...xs) - Math.min(...xs);
const median = (xs) => { const s = sorted(xs); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const mean = (xs) => sum(xs) / xs.length;
/** Le mode du tableur : la valeur de plus grand effectif (unique ici — vérifié). */
const mode = (xs) => {
  const count = new Map();
  for (const x of xs) count.set(x, (count.get(x) ?? 0) + 1);
  const top = Math.max(...count.values());
  const modes = [...count].filter(([, c]) => c === top).map(([v]) => v);
  expect(modes, 'mode unique').toHaveLength(1);
  return modes[0];
};
/** Lettres de colonnes → indices (A = 0). */
const col = (letter) => letter.charCodeAt(0) - 65;
const cellsOf = (row) => row.slice(1).map(Number);

const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choiceOf = (id, part, k) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice')[k];
const strip = (t) => t.replace(/[⁦-⁩]/g, '');

// ── Vérificateur des ÉGALITÉS écrites (explain, lines, options) : rationnels exacts ─────────────
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const R = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(Math.abs(n), d) || 1; return [n / g, d / g]; };
const rAdd = (x, y) => R(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const rSub = (x, y) => R(x[0] * y[1] - y[0] * x[1], x[1] * y[1]);
const rMul = (x, y) => R(x[0] * y[0], x[1] * y[1]);
const rDiv = (x, y) => R(x[0] * y[1], x[1] * y[0]);
function evalExpr(src) {
  const s = src
    .replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/\{,\}/g, '.').replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\s+/g, '');
  if (!/^[\d.+\-*/()]+$/.test(s)) return null; // une lettre, \approx, une unité : non vérifiable ici
  let i = 0;
  const num = () => {
    if (s[i] === '(') { i++; const v = add(); i++; return v; }
    if (s[i] === '-') { i++; const v = num(); return [-v[0], v[1]]; }
    const j = i; while (/[\d.]/.test(s[i] ?? '')) i++;
    const lit = s.slice(j, i);
    const [a, b = ''] = lit.split('.');
    return R(Number(a + b), 10 ** b.length);
  };
  const prod = () => { let v = num(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = num(); v = op === '*' ? rMul(v, w) : rDiv(v, w); } return v; };
  const add = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? rAdd(v, w) : rSub(v, w); } return v; };
  const v = add();
  return i === s.length ? v : null;
}
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of strip(text).matchAll(/\$([^$]+)\$/g)) {
    const sides = f.split('=').map(evalExpr);
    if (sides.length < 2 || sides.some((v) => v == null)) continue;
    for (const v of sides.slice(1)) expect(v, `${where}: ${f}`).toEqual(sides[0]);
    checked++;
  }
  return checked;
}
const allTexts = (p) => [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);

describe('les مسائل du درس 3 « استعمال المجدولات »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (5, 6, 7 — track problem, practice_lab, before the test 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage, m.estimatedMin])).toEqual([
      [5, '05', 'masala-1', 'practice_lab', 8], [6, '06', 'masala-2', 'practice_lab', 8], [7, '07', 'masala-3', 'practice_lab', 8],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '08', number: 8, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(69);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 5], ['masala-2', 6], ['masala-3', 7]]);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('data: 4–5 useful items, and at least one useless item that is a number', () => {
    for (const p of PROBLEMS) {
      const useful = p.data.filter((d) => d.useful).length;
      expect(useful).toBeGreaterThanOrEqual(4);
      expect(useful).toBeLessThanOrEqual(5);
      expect(p.data.some((d) => !d.useful && /\d/.test(d.text)), p.id).toBe(true);
      for (const d of p.data) expect(d.text.includes('$'), `${p.id} ${d.id}`).toBe(false);
    }
  });

  it('every sheet is a table: column letters in the head, row numbers in the first column', () => {
    for (const p of PROBLEMS) {
      const { head, rows } = p.table;
      expect(head[0]).toBe('');
      expect(head.slice(1)).toEqual(head.slice(1).map((_, i) => String.fromCharCode(65 + i)));
      expect(rows.every((r) => /^\d+$/.test(r[0]))).toBe(true);
    }
  });

  it('no formula written in KaTeX, no bare « a/b »', () => {
    for (const p of PROBLEMS) for (const t of allTexts(p)) {
      expect(t, `${p.id}: ${t}`).not.toMatch(/\$[^$]*(MOYENNE|MEDIANE|MODE|MAX|MIN)[^$]*\$/);
      expect(strip(t).replace(/\$[^$]*\$/g, ''), `${p.id}: ${t}`).not.toMatch(/\d\s*\/\s*\d/);
    }
  });

  it('every written equality (explain, prompts, solution lines, options) is exact', () => {
    let checked = 0;
    for (const p of PROBLEMS) p.parts.forEach((part) => part.steps.forEach((s, si) => {
      const where = `${p.id} ${part.label} step ${si + 1}`;
      for (const t of [s.explain, s.prompt, ...(s.lines ?? [])].filter(Boolean)) checked += checkText(t, where);
      if (s.kind === 'choice') checked += checkText(s.options[s.correct], `${where} (correct option)`);
    }));
    expect(checked).toBeGreaterThan(25);
  });

  it('مسألة 1 — the numbers are computed from the sheet, not typed', () => {
    const row = cellsOf(PROBLEM['masala-1'].table.rows[0]);
    expect(row).toEqual([28, 35, 22, 33, 40, 31, 35, 26, 38]);
    expect(LESSON_CONFIG.lessonProblem.statement).toContain(row.join(' ، '));
    // 1) l'étendue A1:I1 (9 cellules), B2 = MAX-MIN, rang de la médiane, B3 = MEDIANE
    expect(strip(choiceOf('masala-1', 0, 0).options[0])).toBe(`A1:${String.fromCharCode(65 + row.length - 1)}1`);
    expect(expectedOf('masala-1', 0)).toEqual([range(row), (row.length + 1) / 2, median(row)]);
    expect(median(row)).not.toBe(row[(row.length - 1) / 2]); // le piège : la 5e valeur NON rangée (40) n'est pas la médiane
    // 2) =MOYENNE(A1:H1) oublie I1 : 250 / 8 = 31,25 ; la somme, B4, B5
    const firstEight = row.slice(0, col('H') + 1);
    expect(mean(firstEight)).toBe(31.25);
    expect(PROBLEM['masala-1'].parts[1].question).toContain('$31{,}25$');
    expect(expectedOf('masala-1', 1)).toEqual([sum(row), mean(row), mode(row)]);
    expect(mode(row)).not.toBe(Math.max(...row));
    // 3) 400 au lieu de 40 en E1 : la moyenne s'envole, la médiane reste
    const typo = row.map((v, i) => (i === col('E') ? 400 : v));
    expect(row[col('E')]).toBe(40);
    expect(median(typo)).toBe(median(row));
    const right = row.filter((v) => v > mean(row)).length;
    const wrong = typo.filter((v) => v > mean(typo)).length;
    expect(expectedOf('masala-1', 2)).toEqual([sum(typo), mean(typo), right, wrong, right - wrong]);
  });

  it('مسألة 2 — the numbers are computed from the sheet, not typed', () => {
    const { rows } = PROBLEM['masala-2'].table;
    expect(rows.map((r) => r[0])).toEqual(Array.from({ length: 14 }, (_, i) => String(i + 1)));
    const heights = rows.slice(1).map((r) => Number(r[2])); // B2:B14
    expect(heights).toHaveLength(13);
    expect(expectedOf('masala-2', 0)).toEqual([sum(heights), mean(heights)]);
    expect(Number.isInteger(mean(heights))).toBe(true);
    const adel = 188;
    const all = [...heights, adel]; // B2:B15
    expect(expectedOf('masala-2', 1)).toEqual([sum(all), mean(all)]);
    const s = sorted(all);
    const selected = all.filter((h) => h > median(all)).length;
    expect(expectedOf('masala-2', 2)).toEqual([s[6], s[7], median(all), selected]);
    expect(all).not.toContain(median(all)); // la médiane n'est la taille de personne
    expect(Number(rows[8][2])).toBe(s[6]); // l'option « B9 » désigne bien la 7e valeur rangée (160)
  });

  it('مسألة 3 — the numbers are computed from the sheet, not typed', () => {
    const [months, salesRow] = PROBLEM['masala-3'].table.rows;
    expect(months[0]).toBe('1');
    const sales = cellsOf(salesRow); // A2:F2
    expect(sales).toHaveLength(6);
    expect(expectedOf('masala-3', 0)).toEqual([sum(sales), mean(sales), mode(sales)]);
    expect(mode(sales)).not.toBe(Math.max(...sales));
    const june = [54, 36, 30];
    expect(sum(june)).toBe(sales[col('F')]); // la répartition de juin = F2
    expect(expectedOf('masala-3', 1)).toEqual([sum(june), (june[0] / sum(june)) * 360]);
    const price = 3500, goal = 2000000;
    const income = sales.length * mean(sales) * price;
    expect(expectedOf('masala-3', 2)).toEqual([income]);
    expect(income).toBeGreaterThan(goal);
    expect(choiceOf('masala-3', 2, 1).options[0]).toContain(String(income - goal));
  });
});
