import { describe, it, expect } from 'vitest';
import { rat, ratText, parseRat } from '@smarter-academy/core/arithmetic/powers.js';
import * as L from './marbleRun';

const M = (t, fmt) => L.marble(t, fmt);
const rackOf = (s, id) => [...L.RACK.beginner, ...L.RACK.advanced, ...L.RACK.twins].find((m) => m.id === id) ?? M(id);

/** Un élève qui suit le guide jusqu'au bout de la tâche courante (avec les bons gestes) ; renvoie l'état et les identifiants de pas vus. */
function follow(s0) {
  let s = s0; const ids = [];
  for (let guard = 0; guard < 60; guard += 1) {
    const step = L.coachOf(s);
    if (!step) break;
    ids.push(step.id);
    if (step.id === 'rack') {
      const tk = s.tasks[s.ti];
      for (const [l, t] of Object.entries(tk.target)) if (!s.env[l]) { s = L.drop(s, l, rackOf(s, t)); break; }
    } else if (step.id === 'predict') {
      const v = L.stationsOf(s).at(-1).value;
      s = L.commitPrediction(s, { sg: v.n < 0n ? -1 : 1, n: Number(v.n < 0n ? -v.n : v.n), d: Number(v.d) });
    } else if (step.id === 'slots' || step.id === 'times' || step.id === 'bare') {
      if (step.id === 'bare') {
        const i = L.negativeSlots(s)[0];
        s = L.toggleBrackets(s, i); s = L.run(s); s = L.toggleBrackets(s, i); // le contraste : sans parenthèses, puis on les remet
      } else {
        for (const sl of L.slotsOf(s)) {
          if (sl.needsTimes && !s.choices[sl.i].times) s = L.toggleTimes(s, sl.i);
          const e = s.env[sl.name];
          if (e && (e.v.n < 0n || (sl.underPow && e.v.d !== 1n)) && !s.choices[sl.i].brackets) s = L.toggleBrackets(s, sl.i);
        }
        s = { ...s, touched: true, tTouched: true };
      }
    } else if (step.id === 'run') s = L.run(s);
    else if (step.id === 'next') s = L.nextTask(s);
    else throw new Error(`pas inconnu ${step.id}`);
  }
  return { s, ids };
}

describe('marble-run — le mur (monde run)', () => {
  it('every task of both levels is solved by following the coach, and ends on one accepted line each', () => {
    for (const predict of [false, true]) {
      let s = L.init({ world: 'run', predict });
      const seen = [];
      for (let k = 0; k < 3; k += 1) { const r = follow(s); s = r.s; seen.push(...r.ids); if (!L.allDone(s)) s = L.nextTask(s); }
      expect(L.allDone(s), predict ? 'متقدم' : 'مبتدئ').toBe(true);
      expect(s.events.filter((e) => e.kind === 'solved').length).toBe(3);
      expect(seen[0]).toBe('rack');
      expect(seen.includes('run')).toBe(true);
      if (predict) expect(seen.includes('predict')).toBe(true);
    }
  });

  it('r1: without × the reader gives 50 and the press is lit; with × the basket says 19', () => {
    let s = L.init({ world: 'run' });
    s = L.drop(s, 'x', M('3'));
    expect(L.canRun(s)).toBe(true);
    let r = L.run(s);
    expect(r.ran).toMatchObject({ ok: false, reason: 'fused', slot: 0 });
    expect(ratText(r.ran.lineValue)).toBe('50'); expect(ratText(r.ran.runValue)).toBe('19');
    expect(r.solvedNow).toBe(false);
    r = L.run(L.toggleTimes(s, 0));
    expect(r.ran.ok).toBe(true); expect(r.solvedNow).toBe(true); expect(r.done[0]).toBe(true);
    expect(r.events.at(-1)).toMatchObject({ kind: 'solved', task: 'r1', value: '19' });
  });

  it('r2: no brackets is a syntax refusal, with brackets −1', () => {
    let s = L.nextTask({ ...L.init({ world: 'run' }), done: [true, false, false], solvedNow: true });
    s = L.nextTask({ ...s, solvedNow: true, done: [true, false, false] });
    s = L.init({ world: 'run', tasks: [L.RUN_TASKS.beginner[1]] });
    s = L.toggleTimes(L.drop(s, 'x', M('-2')), 0);
    expect(L.run(s).ran).toMatchObject({ ok: false, reason: 'syntax' });
    expect(L.run(s).bareTried).toBe(true);
    const ok = L.run(L.toggleBrackets(s, 0));
    expect(ok.ran.ok).toBe(true); expect(ratText(ok.ran.runValue)).toBe('-1');
  });

  it('r3: the copier is where the line parts (2 against 10)', () => {
    let s = L.init({ world: 'run', tasks: [L.RUN_TASKS.beginner[2]] });
    s = L.drop(s, 'x', M('-2'));
    s = L.toggleTimes(L.toggleBrackets(s, 1), 1);
    const r = L.run(s);
    expect(r.ran).toMatchObject({ ok: false, reason: 'unbracketed', slot: 0, station: 0 });
    expect([ratText(r.ran.lineValue), ratText(r.ran.runValue)]).toEqual(['2', '10']);
    expect(r.ran.stationInfo.op).toBe('pow');
    expect(L.run(L.toggleBrackets(s, 0)).solvedNow).toBe(true);
  });

  it('r4–r6: predictions, a fraction marble, two reservoirs', () => {
    let s = L.init({ world: 'run', predict: true });
    expect(L.canRun(L.drop(s, 'x', M('-3')))).toBe(false); // the prediction comes first
    s = L.drop(s, 'x', M('-3'));
    s = L.commitPrediction(s, { sg: 1, n: 23 }); // the −3² trap
    s = L.toggleTimes(L.toggleBrackets(s, 0), 0);
    let r = L.run(s);
    expect(r.solvedNow).toBe(true);
    expect(r.events.find((e) => e.kind === 'predict')).toMatchObject({ predicted: '23', value: '-13', ok: false });
    // r6 : une bille dans le mauvais réservoir est un essai libre : le mur marche, la tâche n'est pas résolue
    s = L.init({ world: 'run', tasks: [L.RUN_TASKS.advanced[2]], predict: true });
    s = L.drop(L.drop(s, 'x', M('4')), 'y', M('-1'));
    s = L.commitPrediction(s, { sg: -1, n: 11 });
    s = L.toggleTimes(L.toggleTimes(L.toggleBrackets(s, 1), 0), 1);
    r = L.run(s);
    expect(r.ran).toMatchObject({ ok: true, wrongValue: true, hit: false }); expect(ratText(r.ran.runValue)).toBe('14'); expect(r.solvedNow).toBe(false);
    s = L.drop(L.drop(s, 'x', M('-1')), 'y', M('4'));
    s = L.commitPrediction(s, { sg: -1, n: 11 });
    s = L.toggleBrackets(L.toggleBrackets(s, 1), 1); s = L.toggleBrackets(s, 0); // x entre parenthèses ; la case y retrouve son état
    expect(L.run(L.toggleBrackets(s, 1)).events.some((e) => e.kind === 'run')).toBe(true);
  });

  it('a marble is the SAME in every slot of its letter (the reservoir feeds all the inlets)', () => {
    let s = L.init({ world: 'run', tasks: [{ id: 'q', expr: '2x²-5x+1', target: { x: '3' } }] });
    s = L.drop(s, 'x', M('3'));
    expect(L.slotsOf(s).length).toBe(2);
    expect(L.lineTokens(s).filter((t) => t.k === 'num' && t.slot != null).map((t) => t.s)).toEqual(['3', '3']);
  });

  it('rewriting the line or changing the marble clears the previous run', () => {
    let s = L.init({ world: 'run' });
    s = L.run(L.drop(s, 'x', M('3')));
    expect(s.ran).not.toBe(null);
    expect(L.toggleBrackets(s, 0).ran).toBe(null);
    expect(L.drop(s, 'x', M('4')).ran).toBe(null);
  });

  it('coach: rack → slots → times → run; the contrast (bare) once, only after every negative was bracketed', () => {
    let s = L.init({ world: 'run', tasks: [L.RUN_TASKS.beginner[1], L.RUN_TASKS.beginner[2]] });
    expect(L.coachOf(s).id).toBe('rack');
    s = L.drop(s, 'x', M('-2'));
    expect(L.coachOf(s)).toMatchObject({ id: 'slots', target: '[data-mr-slot="0"]' });
    s = L.toggleBrackets(s, 0);
    expect(L.coachOf(s)).toMatchObject({ id: 'times' });
    s = L.toggleTimes(s, 0);
    expect(L.coachOf(s).id).toBe('run');
    s = L.run(s);
    expect(L.coachOf(s).id).toBe('next');
  });

  it('discovery needs every task AND one negative run without brackets', () => {
    let s = L.init({ world: 'run', tasks: [L.RUN_TASKS.beginner[1]] });
    s = L.toggleTimes(L.toggleBrackets(L.drop(s, 'x', M('-2')), 0), 0);
    s = L.run(s);
    expect(L.allDone(s)).toBe(true); expect(L.discoveryReady(s)).toBe(false);
    s = L.run(L.toggleBrackets(s, 0)); // sans parenthèses : refusé
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.discoveryWitness(s)).toMatchObject({ reason: 'syntax' });
  });

  it('« جرّب أعدادك »: any card or typed expression, never ticks a task', () => {
    let s = L.init({ world: 'run' });
    for (const c of L.FREE_CARDS) expect(L.setFreeExpr(s, c).custom, c).toBe(true);
    s = L.setFreeExpr(s, '(x−1)(x+٢)');
    expect(s.custom).toBe(true);
    expect(L.setFreeExpr(s, '3z').free.expr).toBe('(x−1)(x+٢)'); // refusée
    expect(L.setFreeExpr(s, '7').free.expr).toBe('(x−1)(x+٢)'); // sans lettre
    s = L.drop(s, 'x', L.freeMarble(L.stepFreeMarble(L.stepFreeMarble(s, 'den', 1), 'num', -5)));
    expect(ratText(s.env.x.v)).toBe('-3/2'.replace('-3/2', '-3/2'));
    s = L.run(L.toggleTimes(s, 0));
    expect(s.done.every((d) => !d)).toBe(true);
    expect(s.events.at(-1)).toMatchObject({ kind: 'run', free: true });
    expect(L.backToTasks(s).custom).toBe(false);
  });

  it('reset: init gives a fresh state', () => {
    const a = L.run(L.drop(L.init({ world: 'run' }), 'x', M('3')));
    const b = L.init({ world: 'run' });
    expect(b.events).toEqual([]); expect(b.env).toEqual({}); expect(a.events.length).toBeGreaterThan(0);
  });
});

describe('marble-run — le monde twins', () => {
  const fresh = () => L.init({ world: 'twins' });
  it('tw1: equal at 0 is NOT a counter-example; 1 is; expanding proves the difference too', () => {
    let s = L.dropTwin(fresh(), M('0'));
    expect(L.twinValues(s).equal).toBe(true);
    const refused = L.claim(s, 'counter');
    expect(refused.ran).toMatchObject({ ok: false, reason: 'same' }); expect(refused.solvedNow).toBe(false);
    expect(L.claim(s, 'equal').ran).toMatchObject({ ok: false, reason: 'notenough' });
    s = L.dropTwin(s, M('1'));
    const ok = L.claim(s, 'counter');
    expect(ok.solvedNow).toBe(true); expect(ok.done[0]).toBe(true);
    expect(ok.events.at(-1)).toMatchObject({ kind: 'solved', world: 'twins', task: 'tw1' });
  });
  it('tw2: equal at 0 and at 1, apart at 2', () => {
    let s = L.nextTask({ ...fresh(), solvedNow: true });
    expect(s.tasks[s.ti].id).toBe('tw2');
    for (const [x, eqv] of [['0', true], ['1', true], ['2', false], ['-1', false]]) expect(L.twinValues(L.dropTwin(s, M(x))).equal, x).toBe(eqv);
  });
  it('tw3: equal everywhere on the rack; « انشر » then « متساويتان »', () => {
    const base = L.nextTask({ ...L.nextTask({ ...fresh(), solvedNow: true }), solvedNow: true });
    expect(base.tasks[base.ti].id).toBe('tw3');
    for (const m of L.RACK.twins) expect(L.twinValues(L.dropTwin(base, m)).equal, m.id).toBe(true);
    let s = L.dropTwin(base, M('2'));
    expect(L.claim(s, 'counter').ran.reason).toBe('same');
    expect(L.claim(s, 'equal').ran.reason).toBe('notenough');
    s = L.expandTwin(s);
    expect(s.events.at(-1)).toMatchObject({ kind: 'expand', left: '3x^2 - 3x - 6', right: '3x^2 - 3x - 6' });
    expect(L.claim(s, 'equal')).toMatchObject({ solvedNow: true });
  });
  it('after « انشر » a false « متساويتان » is refused with the reason', () => {
    let s = L.expandTwin(L.dropTwin(fresh(), M('0')));
    expect(L.claim(s, 'equal').ran).toMatchObject({ ok: false, reason: 'differ' });
  });
  it('coach: drop → claim → (expand once refused) → next; free pair of expressions', () => {
    let s = fresh();
    expect(L.coachOf(s).id).toBe('drop');
    s = L.dropTwin(s, M('0'));
    expect(L.coachOf(s).id).toBe('claim');
    s = L.claim(s, 'counter');
    expect(L.coachOf(s).id).toBe('expand');
    s = L.setFreeTwins(s, 'a', '(x+1)(x+2)');
    expect(s.custom).toBe(true);
    expect(L.truthOfTwin(s)).toBe(true);
    expect(L.truthOfTwin(L.setFreeTwins(s, 'b', 'x²+6'))).toBe(false);
  });
});

describe('marble-run — les billes', () => {
  it('rack and faces', () => {
    expect(L.RACK.beginner.map((m) => m.id)).toEqual(['-5', '-4', '-3', '-2', '-1', '0', '1', '2', '3', '4', '5']);
    expect(L.RACK.advanced.length).toBe(16);
    expect(L.marbleText(M('-1/2'))).toBe('−1/2');
    expect(L.marbleText(M('-1.5', 'dec'))).toBe('−1,5');
    expect(L.marbleText(M('3'))).toBe('3');
    expect(parseRat('-1.5')).toEqual(rat(-3, 2));
  });
});
