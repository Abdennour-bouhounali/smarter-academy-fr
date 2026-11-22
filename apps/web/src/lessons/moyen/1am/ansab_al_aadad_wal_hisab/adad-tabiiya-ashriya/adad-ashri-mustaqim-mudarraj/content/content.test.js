import { describe, it, expect } from 'vitest';
import moduleEight from '../modules/Module08Itqan.jsx?raw';
import { PREP_ITEMS, LAB, KNOWLEDGE, METHOD_PLACE, GUIDE } from './textbook';
import { EX, EXERCISES, FINAL, LP } from './exercises';
import { LEVELS } from '../../../../../../common/manipulations/levels.js';

/* ── Arithmétique EXACTE (BigInt, millièmes) : « 4,235 » → 4235n ; une écriture somme « 2+6/10 » → 2600n ───────────────────────────── */
const SCALE = 1000n;
const milli = (s) => {
  const t = String(s).replace(/\{,\}/g, '.').replace(',', '.').replace(/\$/g, '').trim();
  const sum = /^(\d+)\+(\d+)\/(10+)$/.exec(t);
  if (sum) return BigInt(sum[1]) * SCALE + (BigInt(sum[2]) * SCALE) / BigInt(sum[3]);
  const [i, f = ''] = t.split('.');
  return BigInt(i) * SCALE + BigInt((f + '000').slice(0, 3));
};
const tick = (step) => milli(step) / 10n; // la petite graduation : step / 10
const onTick = (v, step, from) => (v - milli(from)) % tick(step) === 0n;
const key = (r) => r.options[r.correct];
const val = (opt) => milli(opt);

describe('« الأعداد العشرية ونصف المستقيم المدرّج » — chaque clé recalculée en arithmétique exacte', () => {
  it('أستعدّ : la vérité de chaque affirmation', () => {
    const truth = [
      milli('3,1') > milli('2,9'), // vrai
      milli('1,8') < milli('1,75'), // faux : 1,80 > 1,75
      milli('0,1') * 10n === SCALE, // vrai : 1/10 = 0,1
      milli('0,01') * 10n === SCALE, // faux : 1/10 ≠ 0,01
      milli('2') + milli('0,4') === milli('2,4'), // vrai
      milli('3') + milli('0,7') === milli('3,07'), // faux : c'est 3,7
    ];
    expect(PREP_ITEMS.map((it) => it.answer)).toEqual(truth);
    expect(new Set(PREP_ITEMS.map((it) => it.answer)).size).toBe(2);
    expect(PREP_ITEMS.every((it) => ['muqarana', 'ashar'].includes(it.skill))).toBe(true);
  });

  it('les nombres du labo sont ceux des préréglages de levels.js', () => {
    const pair = LEVELS['jump-tape'];
    expect(pair.beginner.numbers.tasks).toEqual(LAB.beginner);
    expect(pair.advanced.numbers.tasks).toEqual(LAB.advanced);
  });

  it('plantation : plage de l\'unité (la fosse tient le repère au-dessus du plus long saut, les petites graduations restent distinctes)', () => {
    const range = (jumps) => {
      const longest = jumps.map(milli).reduce((a, b) => (a > b ? a : b));
      const marks = Number((longest + SCALE - 1n) / SCALE); // ceil
      return [100, Math.floor(580 / marks)]; // u/10 >= 10 px ; marks * u <= 580
    };
    const [b1, b2] = LAB.beginner;
    expect(range(b1.jumps)).toEqual([100, 145]); // 3,1 → repère 4
    expect(range(b2.jumps)).toEqual([100, 193]); // 3 → repère 3
    const b3 = LAB.beginner[2];
    const [lo, hi] = range(b3.jumps);
    expect(b3.unit >= lo && b3.unit <= hi).toBe(true); // l'unité donnée (140) convient
    // les sauts de b1 / b2 / b3 tombent sur des graduations ; 3 est un repère entier ; 2+6/10 = 2,6
    for (const t of LAB.beginner) for (const j of t.jumps) expect(onTick(milli(j), t.step, t.from), `${t.id} ${j}`).toBe(true);
    expect(milli('2+6/10')).toBe(milli('2,6'));
    expect(milli('3') % SCALE).toBe(0n);
  });

  it('lecture : deux drapeaux sur une graduation, UN entre deux graduations, dans chaque tâche', () => {
    for (const t of LAB.advanced) {
      const onT = t.flags.filter((f) => onTick(milli(f), t.step, t.from));
      expect(onT.length, t.id).toBe(2);
      expect(t.flags.length - onT.length, t.id).toBe(1);
      // chaque drapeau est dans la fenêtre : 3 grandes marques à partir de `from`
      const lo = milli(t.from); const hi = lo + 3n * milli(t.step);
      for (const f of t.flags) expect(milli(f) >= lo && milli(f) <= hi, `${t.id} ${f}`).toBe(true);
    }
    // a2 : l'origine n'est pas dans la fenêtre ; a3 : la graduation vaut 0,01
    expect(milli(LAB.advanced[1].from) > 0n).toBe(true);
    expect(tick(LAB.advanced[2].step)).toBe(milli('0,01'));
    // l'encadrement du drapeau entre deux graduations, par exemple 2,35 → [2,3 ; 2,4]
    const between = (t) => t.flags.find((f) => !onTick(milli(f), t.step, t.from));
    expect(LAB.advanced.map(between)).toEqual(['2,35', '11,25', '4,235']);
    expect(LAB.method[0].jumps.every((j) => onTick(milli(j), '1', '0'))).toBe(true);
  });

  it('act-4 : chaque ligne a pour clé la bonne réponse', () => {
    const rows = EX['act-4'].question.rows;
    expect(key(rows[0])).toBe('$\\frac{1}{10}$');
    expect(milli('3') + 5n * tick('1')).toBe(milli('3,5'));
    expect(key(rows[1])).toBe('$3{,}5$');
    expect(milli('3') + 2n * tick('1')).toBe(milli('3,2'));
    expect(key(rows[4])).toBe('$3{,}2$');
    expect(key(rows[2])).toBe('خمس تدريجات صغيرة'); // F(2,5) : 2 unités puis 5 graduations (2,5 − 2 = 0,5 = 5 × 0,1)
    expect((milli('2,5') - milli('2')) / tick('1')).toBe(5n);
    expect(key(rows[3])).toBe('ثماني تدريجات صغيرة'); // G(0,8) : 0,8 = 8 × 0,1
    expect(milli('0,8') / tick('1')).toBe(8n);
    // les distracteurs sont faux
    expect(rows[1].options.slice(1).map(val)).not.toContain(milli('3,5'));
    expect(rows[4].options.slice(1).map(val)).not.toContain(milli('3,2'));
  });

  it('ex-15 : chaque suite a le pas constant donné par ses trois premiers termes et la clé continue la suite', () => {
    const nums = (tex) => tex.replace(/\$/g, '').replace(/\{,\}/g, '.').split('\\ ;\\ ').filter((x) => !x.includes('ldots')).map((x) => milli(x.trim()));
    for (const row of EX['ex-15'].question.rows) {
      const [a, b, c] = nums(row.label);
      expect(b - a, row.label).toBe(c - b);
      const step = b - a;
      const [x, y] = nums(row.options[row.correct]);
      expect(x, row.label).toBe(c + step);
      expect(y, row.label).toBe(c + 2n * step);
      row.options.forEach((o, j) => {
        const [p, q] = nums(o);
        const right = p === c + step && q === c + 2n * step;
        expect(right, `${row.label} option ${j}`).toBe(j === row.correct);
      });
    }
    // une suite descendante et une suite qui franchit un entier existent
    const steps = EX['ex-15'].question.rows.map((r) => { const [a, b] = nums(r.label); return b - a; });
    expect(steps.some((s) => s < 0n) && steps.some((s) => s > 0n)).toBe(true);
  });

  it('ex-16 : chaque flèche est sur une graduation de sa fenêtre et la lecture est exacte ; les distracteurs sont faux', () => {
    for (const id of ['ex-16a', 'ex-16b', 'ex-16c', 'ex-16d']) {
      const { halfLine: figure, question } = EX[id];
      const min = BigInt(Math.round(figure.min * 1000)); const max = BigInt(Math.round(figure.max * 1000));
      const stp = BigInt(Math.round(figure.step * 1000));
      expect(figure.arrows.length).toBe(3);
      expect(question.rows.length).toBe(3);
      figure.arrows.forEach((a, i) => {
        const v = milli(a.value);
        expect(v >= min && v <= max, `${id} ${a.label}`).toBe(true);
        expect((v - min) % stp, `${id} ${a.label} sur une graduation`).toBe(0n);
        expect(val(key(question.rows[i])), `${id} ${a.label}`).toBe(v);
        question.rows[i].options.slice(1).forEach((o) => expect(val(o), `${id} ${a.label} distracteur ${o}`).not.toBe(v));
      });
      // 10 petites graduations par grande marque (labelEvery)
      expect(figure.labelEvery).toBe(10);
      expect((max - min) / (stp * 10n) >= 1n, id).toBe(true); // au moins une grande marque entière dans la fenêtre
    }
    // la fenêtre b n'a pas d'origine ; c et d sont au centième
    expect(EX['ex-16b'].halfLine.min).toBe(9);
    expect(EX['ex-16c'].halfLine.step).toBe(0.01);
    expect(EX['ex-16d'].halfLine.min).toBe(9.1);
  });

  it('les cinq épreuves du إختبار أولي : une clé, des distracteurs faux, une الكفاءة chacune', () => {
    expect(FINAL).toHaveLength(5);
    expect(new Set(FINAL.map((f) => f.lp))).toEqual(new Set([LP.P1, LP.P2, LP.P3]));
    for (const f of FINAL) {
      expect(f.options).toHaveLength(new Set(f.options).size);
      expect(f.options[f.correct]).toBeTruthy();
      if (f.kind === 'tenth') {
        const t = tick('1');
        f.options.forEach((o, j) => expect(val(o.replace(/\$/g, '')) === t, `E tenth option ${j}`).toBe(j === f.correct));
      }
      if (f.kind === 'ticksFrom') {
        const want = milli(f.a) + BigInt(f.n) * tick('1');
        f.options.forEach((o, j) => expect(milli(o) === want, `${f.id} option ${j}`).toBe(j === f.correct));
        expect(want).toBe(milli('2,6'));
      }
      if (f.kind === 'plant') {
        const target = milli(f.value);
        f.parts.forEach(([u, k], j) => expect(BigInt(u) * SCALE + BigInt(k) * tick('1') === target, `${f.id} option ${j}`).toBe(j === f.correct));
      }
      if (f.kind === 'bounds') {
        const lo = milli(f.lo); const hi = milli(f.hi);
        expect(hi - lo).toBe(tick('1')); // deux graduations CONSÉCUTIVES
        f.options.forEach((o, j) => {
          const m = /^\$([\d{},]+)<x<([\d{},]+)\$$/.exec(o);
          const right = !!m && milli(m[1]) === lo && milli(m[2]) === hi;
          expect(right, `${f.id} option ${j}`).toBe(j === f.correct);
        });
      }
      if (f.kind === 'build') expect(f.correct).toBe(0);
    }
  });

  it('le إختبار أولي (module 8) reprend les mêmes énoncés, options et clés que FINAL', () => {
    for (const f of FINAL) {
      for (const o of f.options) expect(moduleEight, `${f.id}: ${o}`).toContain(o);
    }
    for (const f of FINAL) expect(moduleEight).toContain(`learningPointIds: ['${f.lp}']`);
  });

  it('les textes de connaissance portent la notation O(0) et A(2,4) ; la méthode est une chaîne de quatre lignes', () => {
    expect(KNOWLEDGE.abscissa.definition).toContain('O(0)');
    expect(KNOWLEDGE.abscissa.definition).toContain('A(2{,}4)');
    expect(KNOWLEDGE.hiddenOrigin.text).toContain('لا يظهر');
    expect(METHOD_PLACE.solution).toHaveLength(4);
    // M(2,7), N(1 + 3/10), K = 3 + 5/10, L entre 1,6 et 1,7
    expect(milli('2,7')).toBe(2n * SCALE + 7n * tick('1'));
    expect(milli('1+3/10')).toBe(milli('1,3'));
    expect(SCALE * 3n + 5n * tick('1')).toBe(milli('3,5'));
    expect(milli('1,7') - milli('1,6')).toBe(tick('1'));
    expect(Object.keys(GUIDE)).toEqual(['swapDigits', 'ticksAsUnits', 'betweenIsExact', 'firstMarkIsZero']);
  });

  it('chaque exercice porte une الكفاءة et une source', () => {
    for (const e of EXERCISES) {
      expect(Object.values(LP)).toContain(e.learningPointId);
      expect(e.source?.type).toBe('textbook');
    }
  });
});
