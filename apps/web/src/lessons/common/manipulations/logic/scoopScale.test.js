import { describe, it, expect } from 'vitest';
import * as S from './scoopScale';
import { LEVELS } from '../levels';

/* Un rationnel exact écrit à la main (entiers), indépendant de decimals.js : la masse m (unités de 10^-res) lit R au rang k ssi 10^(res-k)·(R·10^k − ½) ≤ m < … */
const readsAt = (m, res, rank, targetUnits /* R en unités de 10^-rank */) => {
  const f = 10 ** (res - rank);
  const twice = 2 * m; // compare 2m/f à (2R ± 1)
  return twice >= (2 * targetUnits - 1) * f && twice < (2 * targetUnits + 1) * f;
};
const goto = (s, m) => S.pour(s, m - s.m);

describe('scoop-scale — les clés de chaque tâche des deux niveaux', () => {
  it('مبتدئ : 1,25 (écran 1,3) · 1,34 (1,35 donne 1,4) · 1,50 et 2,49 (rang 0, 2,50 donne 3)', () => {
    let s = S.init(LEVELS['scoop-scale'].beginner.numbers);
    expect(S.phaseOf(s)).toBe('least');
    s = goto(s, 124); expect(S.reading(s)).toBe('1,2');
    s = S.deliver(s); expect(s.last.refused).toBe('wrongReading');
    s = goto(s, 126); s = S.deliver(s); expect(s.last.refused).toBe('notLeast'); expect(s.last.neighbour).toMatchObject({ mass: '1,25', reading: '1,3' });
    s = goto(s, 125); s = S.deliver(s);
    expect(s.last).toMatchObject({ ok: true, mass: '1,25', reading: '1,3' }); expect(s.last.neighbour.reading).toBe('1,2');
    expect(S.taskDone(s)).toBe(true);
    s = S.nextTask(s);
    expect(S.phaseOf(s)).toBe('most'); expect(s.m).toBe(125);
    s = goto(s, 135); expect(S.reading(s)).toBe('1,4');
    s = S.deliver(s); expect(s.last.refused).toBe('wrongReading');
    s = goto(s, 133); s = S.deliver(s); expect(s.last.refused).toBe('notMost'); expect(s.last.neighbour).toMatchObject({ mass: '1,34', reading: '1,3' });
    s = goto(s, 134); s = S.deliver(s);
    expect(s.last).toMatchObject({ ok: true, mass: '1,34' }); expect(s.last.neighbour).toMatchObject({ mass: '1,35', reading: '1,4' });
    s = S.nextTask(s);
    expect(S.taskOf(s).rank).toBe(0); expect(S.taskOf(s).coarse).toBe(true);
    s = goto(s, 149); expect(S.reading(s)).toBe('1'); s = goto(s, 150); expect(S.reading(s)).toBe('2');
    s = S.deliver(s); expect(s.last.ok).toBe(true); expect(s.phase).toBe(1); expect(S.taskDone(s)).toBe(false);
    s = goto(s, 250); expect(S.reading(s)).toBe('3');
    s = goto(s, 249); s = S.deliver(s); expect(s.last.ok).toBe(true); expect(S.taskDone(s)).toBe(true);
  });

  it('متقدم : 5,675 (écran 5,68) · 5,684 (5,685 donne 5,69) · le piège 2/7 : 0,285 puis 0,286, jamais « = »', () => {
    let s = S.init(LEVELS['scoop-scale'].advanced.numbers);
    expect(S.massText(s)).toBe('5,600');
    s = goto(s, 5675); expect(S.reading(s)).toBe('5,68'); s = S.deliver(s); expect(s.last.ok).toBe(true);
    s = S.nextTask(s); expect(S.phaseOf(s)).toBe('most'); s = goto(s, 5685); expect(S.reading(s)).toBe('5,69');
    s = goto(s, 5684); s = S.deliver(s); expect(s.last.ok).toBe(true);
    s = S.nextTask(s);
    expect(S.isTrap(s)).toBe(true); expect(S.phaseOf(s)).toBe('heavyLight'); expect(S.lamp(s)).toBe('<');
    s = goto(s, 284); s = S.deliver(s); expect(s.last.refused).toBe('notHeaviest');
    s = goto(s, 286); expect(S.lamp(s)).toBe('>'); s = S.deliver(s); expect(s.last.refused).toBe('wrongSide');
    s = goto(s, 285); s = S.deliver(s); expect(s.last.ok).toBe(true); expect(s.phase).toBe(1);
    s = goto(s, 287); s = S.deliver(s); expect(s.last.refused).toBe('notLightest');
    s = goto(s, 286); s = S.deliver(s); expect(s.last.ok).toBe(true); expect(S.taskDone(s)).toBe(true);
    for (let m = 0; m <= 1000; m += 1) expect(S.lamp(goto(S.init({ tasks: [{ id: 'z', kind: 'trap', rank: 3, res: 3, ref: { a: 2, b: 7 }, start: '0,250' }] }), m))).not.toBe('=');
    expect(S.refPosition(s).exact).toBe(false);
    expect(S.refPosition(s).units).toBeCloseTo(285.714, 3);
  });

  it('la lampe peut s\'équilibrer quand a/b est décimal à ce rang (5/8 = 0,625)', () => {
    let s = S.freeQuotient(S.init(), '5', '8', 3);
    expect(s.free.kind).toBe('quotient');
    s = goto(s, 625); expect(S.lamp(s)).toBe('=');
    expect(S.refPosition(s).exact).toBe(true);
  });

  it('chaque tâche de chaque niveau est atteignable : l\'unique balayage de m trouve exactement la clé', () => {
    for (const lv of ['beginner', 'advanced']) {
      const s0 = S.init(LEVELS['scoop-scale'][lv].numbers);
      s0.tasks.forEach((task, i) => {
        if (task.kind === 'trap') return;
        const t = { ...s0, ti: i, m: task.start };
        const R = task.target.n;
        const hits = []; for (let m = 0; m <= task.cap; m += 1) if (readsAt(m, task.res, task.rank, R)) hits.push(m);
        const f = 10 ** (task.res - task.rank);
        expect(hits[0], `${lv} ${task.id} least`).toBe((2 * R - 1) * f / 2);
        expect(hits.at(-1) + 1, `${lv} ${task.id} excluded`).toBe((2 * R + 1) * f / 2);
        // la logique accepte exactement ces deux extrémités
        for (const [ph, key] of [['least', hits[0]], ['most', hits.at(-1)]]) {
          if (!task.phases.includes(ph)) continue;
          const idx = task.phases.indexOf(ph);
          const ok = S.deliver({ ...t, phase: idx, m: key }).last.ok;
          expect(ok, `${lv} ${task.id} ${ph}`).toBe(true);
          expect(S.deliver({ ...t, phase: idx, m: ph === 'least' ? key + 1 : key - 1 }).last.ok).toBe(false);
        }
      });
    }
  });

  it('la masse reste dans [0, cap] et les gestes se comportent', () => {
    let s = S.init(LEVELS['scoop-scale'].beginner.numbers);
    s = S.pinch(s, 1); expect(s.m).toBe(101); expect(s.poured).toBe(true);
    s = S.pinch(s, -1); expect(s.m).toBe(100); expect(s.removed).toBe(true);
    s = S.nudge(s, -10000); expect(s.m).toBe(0);
    s = S.nudge(s, 10 ** 7); expect(s.m).toBe(S.taskOf(s).cap);
    s = S.toStart(s); expect(s.m).toBe(100);
    expect(Object.keys(s.touched).length).toBeGreaterThan(2);
  });
});

describe('scoop-scale — « جرّب أعدادك »', () => {
  it('« 7 » et « 7,0 » sont deux lectures de rang différent', () => {
    let s = S.freeReading(S.init(), '7');
    expect(S.taskOf(s)).toMatchObject({ rank: 0, res: 1 });
    s = goto(s, 65); expect(S.reading(s)).toBe('7'); // 6,5 → 7
    s = S.freeReading(S.init(), '7,0');
    expect(S.taskOf(s)).toMatchObject({ rank: 1, res: 2 });
    s = goto(s, 695); expect(S.reading(s)).toBe('7,0');
    s = goto(s, 694); expect(S.reading(s)).toBe('6,9');
    s = goto(s, 695); s = S.deliver(s); expect(s.last.ok).toBe(true);
    s = goto(s, 704); s = S.deliver(s); expect(s.last.ok).toBe(true);
    expect(S.taskDone(s)).toBe(true);
    expect(S.toGuided(s).free).toBeNull();
  });
  it('lectures et quotients illisibles refusés', () => {
    for (const bad of ['', '0', '100', '7,123', 'x', '-3', '7,', ',5']) expect(S.parseReading(bad), bad).toBeNull();
    for (const good of ['7', '7,0', '0,05', '99,99', '٧,٥']) expect(S.parseReading(good), good).not.toBeNull();
    expect(S.parseQuotient('1000', '3')).toBeNull(); expect(S.parseQuotient('5', '1')).toBeNull(); expect(S.parseQuotient('999', '99')).toEqual({ a: 999, b: 99 });
    const s = S.init(); expect(S.freeReading(s, 'x')).toBe(s); expect(S.freeQuotient(s, '5', '8', 4)).toBe(s);
  });
  it('petite sweep : toute lecture libre à 0, 1 ou 2 décimales a son least et son most', () => {
    for (const txt of ['3', '12', '7,0', '7,5', '0,3', '0,05', '99,99', '1,00', '8,34']) {
      let s = S.freeReading(S.init(), txt);
      const task = S.taskOf(s);
      const R = task.target.n;
      const lo = (2 * R - 1) * 10 ** (task.res - task.rank) / 2;
      s = goto(s, lo); s = S.deliver(s); expect(s.last.ok, `${txt} least`).toBe(true);
      s = goto(s, lo + 10 ** (task.res - task.rank) - 1); s = S.deliver(s); expect(s.last.ok, `${txt} most`).toBe(true);
    }
  });
});

describe('scoop-scale — LabCoach et découverte', () => {
  const drive = (numbers) => {
    let s = S.init(numbers);
    const seen = [];
    for (let guard = 0; guard < 80; guard += 1) {
      const c = S.coachOf(s);
      if (!c) break;
      seen.push(c.id);
      if (c.id === 'pour') s = S.pour(s, 3);
      else if (c.id === 'remove') s = S.pinch(s, -1);
      else if (c.id === 'lamp') s = S.markLamp(s);
      else if (c.id === 'deliver') {
        const t = S.taskOf(s); const ph = S.phaseOf(s);
        let key;
        if (t.kind === 'trap') key = ph === 'heavyLight' ? 285 : 286;
        else { const R = t.target.n; const f = 10 ** (t.res - t.rank); key = ph === 'least' ? (2 * R - 1) * f / 2 : (2 * R + 1) * f / 2 - 1; }
        s = S.deliver(goto(s, key));
      } else if (c.id === 'tryEnd') s = S.deliver(S.pinch(s, 1));
      else if (c.id === 'next') s = S.nextTask(s);
      else throw new Error(`étape inconnue ${c.id}`);
    }
    return { s, seen };
  };
  it('suivi jusqu\'au bout, le coach ouvre la découverte aux deux niveaux', () => {
    for (const lv of ['beginner', 'advanced']) {
      const { s, seen } = drive(LEVELS['scoop-scale'][lv].numbers);
      expect(S.discoveryReady(s), lv).toBe(true);
      expect(S.coachOf(s)).toBeNull();
      expect(seen).toContain('pour'); expect(seen).toContain('remove'); expect(seen).toContain('deliver'); expect(seen).toContain('next');
      if (lv === 'advanced') expect(seen).toContain('lamp');
    }
  });
  it('les témoins de la découverte sont SES essais', () => {
    const { s } = drive(LEVELS['scoop-scale'].beginner.numbers);
    const w = S.witnesses(s);
    expect(w.main).toMatchObject({ reading: '1,3', least: '1,25', most: '1,34', excluded: '1,35', excludedReading: '1,4', below: '1,24', belowReading: '1,2' });
    expect(w.pairs[0]).toBeTruthy();
    const adv = S.witnesses(drive(LEVELS['scoop-scale'].advanced.numbers).s);
    expect(adv.main).toMatchObject({ reading: '5,68', least: '5,675', most: '5,684', excluded: '5,685' });
    expect(adv.trap.below.mass).toBe('0,285'); expect(adv.trap.above.mass).toBe('0,286');
  });
});
