import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { EXERCISES, EX, FINAL, COMPARE, COMPUTE, PLACE, NESTED, BAR, MATCH, tex } from './exercises';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS, METHOD, KNOWLEDGE, GUIDE } from './textbook';

/**
 * Les clés du درس « سلسلة عمليات تتضمّن أقواسا » recalculées avec un code INDÉPENDANT de `chainOps.js` / `powers.js` : un évaluateur de descente récursive en BigInt (rationnels exacts,
 * priorités, parenthèses et crochets). Chaque bonne réponse est vérifiée vraie, chaque distracteur FAUX ; chaque option d'une épreuve du إختبار أولي est présente LITTÉRALEMENT dans
 * Module08Itqan.jsx et chaque distracteur reproduit son erreur nommée ; la paire « inutile » de l'exercice 1 est vérifiée en la retirant.
 */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const Q = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
const add = (p, q) => Q(p.n * q.d + q.n * p.d, p.d * q.d);
const sub = (p, q) => Q(p.n * q.d - q.n * p.d, p.d * q.d);
const mul = (p, q) => Q(p.n * q.n, p.d * q.d);
const div = (p, q) => { if (q.n === 0n) throw new Error('÷ 0'); return Q(p.n * q.d, p.d * q.n); };
const same = (p, q) => p.n === q.n && p.d === q.d;
const num = (s) => { const [i, f = ''] = String(s).replace(',', '.').trim().split('.'); return Q(BigInt(i + f), 10n ** BigInt(f.length)); };
const OPS = { '+': add, '−': sub, '×': mul, '÷': div };
/** Évalue « 40 − [15 − (2 + 4)] » par descente récursive ; `[ ]` valent `( )`. */
const ev = (text) => {
  const t = text.replace(/\$/g, '').replace(/\s+/g, '').match(/\d+(?:,\d+)?|[()[\]+−×÷]/g);
  let i = 0;
  const factor = () => { const x = t[i++]; if (x === '(' || x === '[') { const v = expr(); i += 1; return v; } return num(x); };
  const term = () => { let v = factor(); while (t[i] === '×' || t[i] === '÷') { const o = t[i++]; v = OPS[o](v, factor()); } return v; };
  const expr = () => { let v = term(); while (t[i] === '+' || t[i] === '−') { const o = t[i++]; v = OPS[o](v, term()); } return v; };
  const v = expr();
  if (i !== t.length) throw new Error(`reste : ${text}`);
  return v;
};
/** LaTeX → texte brut évaluable. */
const plain = (s) => String(s).replace(/\$/g, '').replace(/\\dfrac|\\frac/g, 'FRAC').replace(/\{,\}/g, ',').replace(/\\times/g, '×').replace(/\\div/g, '÷').replace(/\\left|\\right/g, '').replace(/ - /g, ' − ').replace(/-/g, '−').replace(/\\ldots/g, '');
const opt = (o) => ev(plain(o));
const rows = (id) => EX[id].question.rows;
/** Retire la i-ème paire de parenthèses d'un mot (pour vérifier une paire « inutile »). */
const withoutPair = (text, k) => {
  const idx = []; const st = [];
  [...text].forEach((c, i) => { if (c === '(' || c === '[') st.push(i); else if (c === ')' || c === ']') idx.push([st.pop(), i]); });
  const [a, b] = idx.sort((x, y) => x[0] - y[0])[k];
  return [...text].filter((_, i) => i !== a && i !== b).join('');
};

describe('le درس « سلسلة عمليات تتضمّن أقواسا » — clés recalculées', () => {
  it('l\'évaluateur de contrôle donne les valeurs du labo et des pièges nommés', () => {
    expect(ev('(45 + 15) ÷ 4')).toEqual(Q(15n)); expect(ev('45 + 15 ÷ 4')).toEqual(num('48,75'));
    expect(ev('8 × (12 − 7)')).toEqual(Q(40n)); expect(ev('8 × 12 − 7')).toEqual(Q(89n));
    expect(ev('9 + (2 × 5)')).toEqual(Q(19n)); expect(ev('(9 + 2) × 5')).toEqual(Q(55n));
    expect(ev('2 × [50 − (12 + 8)]')).toEqual(Q(60n)); expect(ev('2 × (50 − 12) + 8')).toEqual(Q(84n));
    expect(ev('(40 + 8) ÷ (15 − 9)')).toEqual(Q(8n)); expect(ev('(40 + 8) ÷ 15 − 9')).toEqual(num('-5,8'.replace('-', '')) && sub(div(Q(48n), Q(15n)), Q(9n)));
    expect(ev('(14 + 17 + 12,5) ÷ 3')).toEqual(num('14,5')); expect(ev('(18 + 129) ÷ 7')).toEqual(Q(21n));
    expect(ev('5 × (20 − 3)')).toEqual(Q(85n)); expect(ev('(5 × 20) − 3')).toEqual(Q(97n));
  });

  it('act-3 : chaque ligne a la bonne valeur ; la paire « inutile » est inutile (en la retirant), les autres changent le résultat', () => {
    COMPARE.forEach((c, i) => {
      const r = rows('act-3')[i];
      r.options.forEach((o, k) => expect(same(opt(o), ev(c.chain)), `${c.chain} ${o}`).toBe(k === r.correct));
    });
    const r = rows('act-3')[5]; const text = r.options[r.correct];
    expect(r.options.map(plain).map((s) => ev(s) && s)).toHaveLength(3);
    expect(same(ev(withoutPair(plain(text), 0)), ev(plain(text)))).toBe(true);
    r.options.forEach((o, k) => { if (k !== r.correct) expect(same(ev(withoutPair(plain(o), 0)), ev(plain(o))), o).toBe(false); });
  });

  it('ex-8, ex-14 : la clé est la valeur avec les parenthèses, le distracteur est la lecture sans parenthèses / sans le plus intérieur', () => {
    [[COMPUTE, 'ex-8'], [NESTED, 'ex-14']].forEach(([list, id]) => list.forEach((c, i) => {
      const r = rows(id)[i];
      r.options.forEach((o, k) => expect(same(opt(o), ev(c.chain)), `${c.chain} ${o}`).toBe(k === r.correct));
      expect(same(ev(c.bad), ev(c.chain)), `${c.chain} (mauvaise lecture)`).toBe(false);
      r.options.forEach((o, k) => { if (k !== r.correct) expect(same(opt(o), ev(c.bad)), `${c.chain} ${o}`).toBe(true); });
    }));
  });

  it('ex-10 : la seule option qui donne la cible est la bonne', () => {
    PLACE.forEach((p, i) => {
      const r = rows('ex-10')[i];
      const target = num(p.target);
      expect(p.label.replace(/\$/g, '')).toContain(p.target);
      r.options.forEach((o, k) => expect(same(opt(o), target), `${p.label} ${o}`).toBe(k === r.correct));
    });
  });

  it('ex-15 : chaque écriture sans barre vaut la fraction ; la lecture inverse 8 ÷ (5 + 3) = 1', () => {
    const shown = { '$\\frac{28}{11 - 4}$': ['28', '11 − 4'], '$\\frac{17 + 7}{15 - 9}$': ['17 + 7', '15 − 9'], '$\\frac{45}{9} - 3$': null };
    BAR.forEach((b, i) => {
      const r = rows('ex-15')[i];
      expect(shown[b.shown], b.shown).toBeDefined();
      const truth = shown[b.shown] ? div(ev(shown[b.shown][0]), ev(shown[b.shown][1])) : sub(div(Q(45n), Q(9n)), Q(3n));
      r.options.forEach((o, k) => expect(same(opt(o), truth), `${b.shown} ${o}`).toBe(k === r.correct));
    });
    expect(ev('8 ÷ (5 + 3)')).toEqual(Q(1n));
    const back = rows('ex-15')[3];
    expect(back.options[back.correct]).toContain('\\frac{8}{5 + 3}');
    back.options.forEach((o, k) => { if (k !== back.correct) expect(o).not.toContain('\\frac{8}{5 + 3}'); });
  });

  it('ex-17 : (18 + 6) ÷ 4 = 6 ; sans parenthèses 19,5 ; les touches correctes ; (18 + (6 ÷ 4)) donne 19,5', () => {
    expect(ev('(18 + 6) ÷ 4')).toEqual(Q(6n)); expect(ev('18 + 6 ÷ 4')).toEqual(num('19,5')); expect(ev('18 + (6 ÷ 4)')).toEqual(num('19,5'));
    const r = rows('ex-17');
    expect(r[1].options[r[1].correct]).toContain('( 18 + 6 ) \\div 4');
    expect(r[2].options[r[2].correct]).toBe('$6$');
    expect(r[2].options).toContain('$19{,}5$');
  });

  it('ex-13 : 12 × (5 + 3) = 96 · 12 × 5 + 3 = 63 · (12 + 5) × 3 = 51, chaque histoire liée à SA seule expression', () => {
    expect(MATCH.map((m) => ev(m.chain))).toEqual([Q(96n), Q(63n), Q(51n)]);
    MATCH.forEach((m, i) => {
      const r = rows('ex-13')[i];
      expect(r.options[r.correct]).toBe(`$${tex(m.chain)}$`);
      expect(new Set(r.options).size).toBe(3);
    });
  });

  it('chaque ligne d\'un exercice a UNE bonne option et des distracteurs distincts', () => {
    for (const ex of EXERCISES) for (const r of ex.question.rows) {
      expect(new Set(r.options).size).toBe(r.options.length);
      expect(r.options.length).toBeGreaterThanOrEqual(2);
      expect(r.correct).toBeLessThan(r.options.length);
    }
  });

  it('إختبار أولي : chaque clé recalculée, chaque distracteur faux et nommé, chaque option littérale dans le module', () => {
    const source = readFileSync(new URL('../modules/Module08Itqan.jsx', import.meta.url), 'utf8');
    for (const f of FINAL) {
      expect(f.options).toHaveLength(4);
      if (f.truth) {
        const t = ev(f.truth);
        f.exprs.forEach((e, k) => {
          const v = ev(e);
          if (k === f.correct) expect(same(v, t), `${f.id} clé`).toBe(true); else expect(same(v, t), `${f.id} option ${k}`).toBe(false);
        });
        if (f.id !== 'E4') f.options.forEach((o, k) => expect(same(opt(o), ev(f.exprs[k])) || same(ev(f.exprs[k]), opt(o)), `${f.id} option ${k} (${o})`).toBe(true));
      }
      Object.keys(f.miscs).forEach((k) => expect(f.miscs[k]).toMatch(/^MISC-AQWAS-/));
      f.options.forEach((o) => expect(source, `${f.id} ${o}`).toContain(o.replace(/\\/g, '\\\\')));
    }
    expect(FINAL).toHaveLength(5);
    // les valeurs annoncées par le plan : 19, 27, 23, 20,1, 3,6, 23, 30
    expect([ev('40 − 15 − (2 + 4)'), ev('40 − 15 − 2 + 4'), ev('40 − [15 − 2 + 4]')]).toEqual([Q(19n), Q(27n), Q(23n)]);
    expect([ev('25 + 11 ÷ 10 − 6'), ev('(25 + 11) ÷ 10')]).toEqual([num('20,1'), num('3,6')]);
    expect(ev('60 ÷ 4 + 8')).toEqual(Q(23n)); expect(ev('60 ÷ (4 + 8)')).toEqual(Q(5n));
    // E5 : seule 7 + (3 × 5) a une paire inutile (retirée → même valeur) ; les trois autres changent
    const e5 = FINAL.find((f) => f.id === 'E5');
    e5.exprs.forEach((e, k) => expect(same(ev(withoutPair(e, 0)), ev(e)), e).toBe(k === e5.correct));
    // E4 : les touches
    const e4 = FINAL.find((f) => f.id === 'E4');
    e4.exprs.forEach((e, k) => expect(same(ev(e), Q(5n)), e).toBe(k === e4.correct));
  });

  it('طريقة et معارف : les enchaînements sont justes', () => {
    expect(ev('4 × [18 − (2 + 3) × 3]')).toEqual(Q(12n));
    expect(ev('54 ÷ (4 × 3 − 3) + 2')).toEqual(Q(8n)); expect(ev('54 ÷ 4 × 3 − 3 + 2')).toEqual(num('39,5'));
    expect(ev('3 × [20 − (4 + 6)]')).toEqual(Q(30n)); expect(ev('(36 + 12) ÷ (20 − 8)')).toEqual(Q(4n));
    expect(ev('6 × (15 − 9)')).toEqual(Q(36n)); expect(ev('(7 + 5) × (20 − 4)')).toEqual(Q(192n)); expect(ev('(12,6 + 5,4) ÷ 4')).toEqual(num('4,5'));
    expect(ev('9 + (2 × 5)')).toEqual(Q(19n)); expect(ev('60 ÷ (4 + 8)')).toEqual(Q(5n));
    expect(METHOD.nested.solution).toHaveLength(3); expect(METHOD.bar.solution).toHaveLength(3);
    expect(KNOWLEDGE.brackets.text).toContain('= 36'); expect(KNOWLEDGE.calculator.text).toContain('23');
    expect(GUIDE.ignored.wrong).toContain('48{,}75');
    // M2 : les trois questions du module
    expect(ev('12 + (3 × 4)')).toEqual(Q(24n)); expect(ev('(12 + 3) × 4')).toEqual(Q(60n)); expect(ev('(12 − 3) ÷ 3')).toEqual(Q(3n)); expect(ev('12 + 3 × 4')).toEqual(Q(24n));
    expect(ev('72 ÷ (5 + 7)')).toEqual(Q(6n)); expect(ev('72 ÷ 5 + 7')).toEqual(num('21,4'));
    expect(ev('30 − (12 + 6)')).toEqual(Q(12n)); expect(ev('(20 + 4) ÷ (8 − 2)')).toEqual(Q(4n));
  });

  it('« أستعدّ » : les affirmations sont vraies ou fausses comme annoncé', () => {
    const items = [...PREP_ITEMS, ...PREP_PLATFORM_ITEMS];
    expect(items).toHaveLength(6);
    expect(new Set(items.map((i) => i.answer)).size).toBe(2);
    expect(div(Q(18n), Q(4n))).toEqual(num('4,5')); expect(div(num('13,5'), Q(3n))).toEqual(num('4,5'));
    expect(ev('36 − 4 × 6')).toEqual(Q(12n)); expect(ev('45 ÷ 5 + 4')).toEqual(Q(13n)); expect(ev('2,4 + 3 × 1,2')).toEqual(Q(6n));
    expect(ev('(20 − 6) + 4')).toEqual(Q(18n)); expect(ev('20 − (6 + 4)')).toEqual(Q(10n));
    expect(PREP_ITEMS.map((i) => i.answer)).toEqual([true, true]);
    expect(PREP_PLATFORM_ITEMS.map((i) => i.answer)).toEqual([false, true, true, false]);
  });

  it('aucun résultat négatif dans un énoncé ni une option des exercices (le négatif de la calculatrice n\'est jamais calculé)', () => {
    const all = JSON.stringify(EXERCISES);
    expect(/-\s*\d+(\{,\}\d+)?\s*\$/.test(all.replace(/\$[^$]*-[^$]*\$/g, ''))).toBe(false);
    for (const ex of EXERCISES) for (const r of ex.question.rows) for (const o of r.options) {
      const s = plain(o);
      if (/[\d)]/.test(s) && /^[\d([]/.test(s.trim()) && !/FRAC|=/.test(s)) expect(ev(s).n >= 0n, `${ex.id} ${o}`).toBe(true);
    }
  });
});
