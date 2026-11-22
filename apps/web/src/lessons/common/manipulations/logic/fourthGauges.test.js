import { describe, it, expect } from 'vitest';
import * as F from '@smarter-academy/core/arithmetic/fourthProportional.js';
import * as L from './fourthGauges';
import { LEVELS } from '../levels';

const LV = LEVELS['fourth-gauges'];

/** Suit l'onboarding jusqu'au bout : le coach dit QUEL contrôle ; l'oracle (le test) dit seulement vers où. */
function followCoach(s0, opts = {}, maxSteps = 4000) {
  let s = s0;
  const seen = [];
  for (let i = 0; i < maxSteps; i += 1) {
    const c = L.coachOf(s, opts);
    if (!c) return { s, seen };
    seen.push(c.id);
    const t = L.taskOf(s);
    if (c.id === 'next') { s = L.nextTask(s); continue; }
    if (c.id === 'grab') { s = L.release(s, Math.floor((t.answerH * 0.9) / t.stepH) * t.stepH, 'drag'); continue; }
    if (c.id === 'decoy') { s = L.release(s, t.decoyH, 'type'); continue; }
    if (c.id === 'gauge') { s = L.toggleGauge(s, 'cross'); continue; }
    s = L.stepBy(s, t.answerH > s.hh ? 1 : -1); // try : −/+ vers le but
  }
  throw new Error(`coach sans fin : ${seen.slice(-8).join(' ')}`);
}

describe('fourth-gauges — la logique', () => {
  it('les presets des niveaux sont jouables, identiques à PRESETS, avec les réponses du contrat', () => {
    expect(LV.beginner.numbers.tasks).toEqual(L.PRESETS.beginner);
    expect(LV.advanced.numbers.tasks).toEqual(L.PRESETS.advanced);
    const b = L.init(LV.beginner.numbers);
    expect(b.tasks.map((t) => t.answer)).toEqual(['780', '5', '600']);
    expect(b.tasks.map((t) => t.decoy)).toEqual([false, false, true]);
    expect(b.tasks[2].decoyText).toBe('404');
    expect(b.tasks.some((t) => t.covered)).toBe(false);
    const a = L.init(LV.advanced.numbers);
    expect(a.tasks.map((t) => t.answer)).toEqual(['520', '1800', '3', '4,5']);
    expect(a.tasks.map((t) => t.hole)).toEqual(['d', 'b', 'a', 'd']);
    expect(a.tasks.every((t) => t.covered)).toBe(true);
    expect(b.world).toBe('market');
  });

  it('une tâche mal formée ou injouable est refusée', () => {
    const base = { hole: 'd', a: '4', b: '520', c: '6', step: '1', max: '1560' };
    expect(() => L.normalizeTasks([{ ...base, hole: 'x' }])).toThrow();
    expect(() => L.normalizeTasks([{ ...base, max: '500' }])).toThrow(); // la réponse dépasse la règle
    expect(() => L.normalizeTasks([{ ...base, step: '7', max: '1561' }])).toThrow(); // 780 n'est pas un multiple du pas
    expect(() => L.normalizeTasks([{ ...base, a: '0' }])).toThrow();
    expect(() => L.normalizeTasks([{ ...base, b: '1' , c: '1', a: '3' }])).toThrow(); // 1/3 n'est pas atteignable
    expect(() => L.normalizeTasks([{ ...base, decoy: true }])).not.toThrow();
    expect(() => L.normalizeTasks([{ hole: 'd', a: '2', b: '4', c: '4', step: '1', max: '10', decoy: true }])).not.toThrow(); // réponse 8, leurre 6
    expect(() => L.normalizeTasks([{ hole: 'd', a: '2', b: '4', c: '2', step: '1', max: '10', decoy: true }])).toThrow(); // le leurre (4) serait la réponse (4) : injouable
  });

  it('la main tient le nombre qui manque : la poignée glisse, snappe sur le pas et s’arrête à 0 et à max', () => {
    let s = L.init(LV.beginner.numbers);
    expect(s.hh).toBe(0);
    s = L.preview(s, 12349);
    expect(s.hh).toBe(12300);
    s = L.preview(s, -400);
    expect(s.hh).toBe(0);
    s = L.preview(s, 9999999);
    expect(s.hh).toBe(156000);
    expect(L.hText(s)).toBe('1560');
    expect(s.trials).toHaveLength(0);
  });

  it('un essai = un relâchement ; le va-et-vient pendant le glissement n’en est pas un', () => {
    let s = L.init(LV.beginner.numbers);
    for (const v of [10000, 40000, 70000, 100000]) s = L.preview(s, v);
    expect(s.trials).toHaveLength(0);
    s = L.release(s, 70000, 'drag');
    expect(s.trials).toHaveLength(1);
    expect(s.last).toMatchObject({ kind: 'release', task: 0, hole: 'd', value: '700', ok: false, decoyHit: false, free: false, via: 'drag' });
    s = L.release(s, 70000, 'drag'); // lâché au même endroit : c'est un essai de plus
    expect(s.trials).toHaveLength(2);
  });

  it('le jugement est EXACT : seul le quatrième proportionnel accomplit la tâche, les trois balances à l’égalité ensemble', () => {
    let s = L.init(LV.beginner.numbers);
    s = L.release(s, 77900, 'drag');
    expect(s.last.ok).toBe(false);
    expect(s.last.gauges).toEqual({ unit: 'gt', between: 'gt', cross: 'gt', diff: null });
    expect(L.taskDone(s)).toBe(false);
    s = L.release(s, 78100, 'drag');
    expect(s.last.gauges).toEqual({ unit: 'lt', between: 'lt', cross: 'lt', diff: null });
    s = L.release(s, 78000, 'key');
    expect(s.last).toMatchObject({ ok: true, value: '780', via: 'key', gauges: { unit: 'eq', between: 'eq', cross: 'eq', diff: null }, done: true });
    expect(L.taskDone(s)).toBe(true);
    expect(L.canNext(s)).toBe(true);
    expect(L.discoveryReady(s)).toBe(false);
  });

  it('les tâches se jouent par les quatre chemins (drag, −/+, clavier, saisie) et la saisie est jugée exactement', () => {
    let s = L.init(LV.advanced.numbers);
    s = L.typeValue(s, '٥٢٠');
    expect(s.last).toMatchObject({ ok: true, value: '520', via: 'type' });
    s = L.nextTask(s);
    expect(s).toMatchObject({ ti: 1, hh: 0, shown: null });
    s = L.keyRelease(s, 'End');
    expect(s.hh).toBe(540000);
    s = L.keyRelease(s, 'PageDown');
    expect(s.hh).toBe(540000 - 10 * 1000);
    s = L.keyRelease(s, 'Home');
    s = L.stepBy(s, 1);
    expect(s.hh).toBe(1000);
    expect(s.last.via).toBe('step');
    expect(L.keyRelease(s, 'q')).toBe(s);
    expect(L.typeValue(s, 'abc')).toBe(s);
    expect(L.typeValue(s, '99999')).toBe(s); // au-delà de la règle
    // saisie hors graduation : jugée telle quelle (780,5 ≠ 780)
    let b = L.init(LV.beginner.numbers);
    b = L.typeValue(b, '780,5');
    expect(b.last).toMatchObject({ value: '780,5', ok: false });
  });

  it('niveau voilé : les balances se dévoilent au relâchement, se revoilent dès qu’on rebouge et à la tâche suivante', () => {
    let s = L.init(LV.advanced.numbers);
    expect(L.covered(s)).toBe(true);
    expect(L.gaugesShown(s)).toBeNull();
    s = L.preview(s, 30000);
    expect(L.covered(s)).toBe(true);
    s = L.release(s, 30000);
    expect(L.covered(s)).toBe(false);
    expect(L.gaugesShown(s).cross.state).toBe('gt');
    s = L.preview(s, 31000); // on rebouge : voilé, et on ne lit pas l'ancien état
    expect(L.covered(s)).toBe(true);
    s = L.release(s, 52000);
    expect(L.gaugesShown(s).cross.state).toBe('eq');
    s = L.nextTask(s);
    expect(L.covered(s)).toBe(true);
    // niveau ouvert : en direct, jamais voilé
    let o = L.init(LV.beginner.numbers);
    expect(L.covered(o)).toBe(false);
    o = L.preview(o, 50000);
    expect(L.gaugesShown(o).unit.state).toBe('gt');
    o = L.preview(o, 90000);
    expect(L.gaugesShown(o).unit.state).toBe('lt');
  });

  it('le leurre : DEUX relâchements — « الفرق » à 404 d’abord, puis les trois à 600 ; le vrai avant le leurre n’accomplit pas', () => {
    const at3 = () => ({ ...L.init(LV.beginner.numbers), ti: 2 });
    let s = at3();
    s = L.release(s, 60000);
    expect(s.last).toMatchObject({ ok: true, decoyHit: false, done: false });
    expect(s.last.gauges).toEqual({ unit: 'eq', between: 'eq', cross: 'eq', diff: 'lt' });
    expect(L.taskDone(s)).toBe(false);
    s = L.release(s, 40400);
    expect(s.last).toMatchObject({ ok: false, decoyHit: true });
    expect(s.last.gauges).toEqual({ unit: 'gt', between: 'gt', cross: 'gt', diff: 'eq' });
    expect(L.decoyLit(s)).toBe(true);
    expect(L.taskDone(s)).toBe(false);
    s = L.release(s, 60000);
    expect(s.last).toMatchObject({ ok: true, done: true });
    expect(L.taskDone(s)).toBe(true);
    // d'abord le leurre, puis le vrai
    let t = at3();
    t = L.release(t, 40400);
    expect(L.decoyLit(t)).toBe(true);
    expect(L.gaugesAt(t, 300 * 100).diff.state).toBe('off');
    expect(L.release(t, 60000).last.done).toBe(true);
    // « الفرق » éteinte sous b : jamais d'exception
    expect(L.release(at3(), 0).last.gauges.diff).toBe('off');
  });

  it('un trou en c : la QUANTITÉ à trouver ; division par 0 = balance éteinte, jamais une exception', () => {
    let s = { ...L.init(LV.beginner.numbers), ti: 1 };
    expect(L.holeOf(s)).toBe('c');
    expect(L.holeIsQuantity(s)).toBe(true);
    s = L.release(s, 0);
    expect(s.last.gauges.unit).toBe('off');
    expect(s.last.ok).toBe(false);
    s = L.release(s, 500);
    expect(s.last).toMatchObject({ ok: true, value: '5', done: true });
    const adv = { ...L.init(LV.advanced.numbers), ti: 2 };
    expect(L.release(adv, 0).last.gauges).toMatchObject({ unit: 'off', between: 'off', cross: 'gt' });
    expect(L.release(adv, 300).last.ok).toBe(true);
  });

  it('nextTask, restartTask : la poignée repart de 0, les essais restent', () => {
    let s = L.init(LV.beginner.numbers);
    s = L.release(s, 78000);
    s = L.nextTask(s);
    expect(s).toMatchObject({ ti: 1, hh: 0, last: null });
    expect(L.nextTask(L.init(LV.beginner.numbers)).ti).toBe(0);
    s = L.release(s, 200);
    s = L.restartTask(s);
    expect(s).toMatchObject({ hh: 0, last: null });
    expect(s.trials.length).toBe(2);
  });

  it('« جرّب أعدادك » : a, b, c de l’élève, le trou est d, la règle est à la mesure ; les essais libres ne comptent jamais', () => {
    let s = L.init(LV.beginner.numbers);
    s = L.setFree(s, '٥', '625', '6');
    expect(s.free).toMatchObject({ a: '5', b: '625', c: '6' });
    expect(L.holeOf(s)).toBe('d');
    expect(L.taskOf(s)).toMatchObject({ stepH: 100, maxH: 225000, answer: '750', covered: false, decoy: false });
    expect(L.gaugesShown(s).unit.state).toBe('gt');
    s = L.release(s, 75000);
    expect(s.last).toMatchObject({ free: true, ok: true, value: '750', done: false });
    expect(L.taskDone(s)).toBe(false);
    expect(L.guidedTrials(s)).toHaveLength(0);
    expect(L.coachOf(s)).toBeNull();
    expect(L.setFree(s, '0', '1', '1')).toBe(s);
    expect(L.setFree(s, '1', 'x', '1')).toBe(s);
    expect(L.setFree(s, '0,01', '9999', '9999')).toBe(s); // trop grand pour la règle
    expect(L.toGuided(s).free).toBeNull();
    expect(L.toGuided(s).hh).toBe(0);
  });

  it('un tableau libre sans solution décimale : aucun nombre de la règle ne l’atteint ; l’essai est annoncé « infinite »', () => {
    let s = L.setFree(L.init(LV.beginner.numbers), '3', '10', '1');
    expect(L.freeInexact(s)).toMatchObject({ kind: 'inexact', text: '10/3', finite: false });
    expect(L.taskOf(s)).toMatchObject({ stepH: 1, answerH: null });
    for (let hh = 0; hh <= L.taskOf(s).maxH; hh += 7) {
      const r = L.release(s, hh);
      expect(r.last.ok).toBe(false);
      expect(r.last.gauges.cross).not.toBe('eq');
    }
    s = L.release(s, 333);
    const ev = s.trials.map(L.trialEvidence);
    expect(ev[ev.length - 1]).toEqual({ kind: 'infinite', task: 0, free: true });
    expect(ev[ev.length - 2]).toMatchObject({ kind: 'release', free: true, ok: false });
    expect(L.freeInexact(L.init(LV.beginner.numbers))).toBeNull();
  });

  it('les événements sont ceux du contrat (clés fixes, aucune fuite des champs de travail)', () => {
    let s = L.init(LV.beginner.numbers);
    s = L.release(s, 78000, 'drag');
    const e = L.trialEvidence(s.last);
    expect(Object.keys(e).sort()).toEqual(['decoyHit', 'done', 'free', 'gauges', 'hole', 'kind', 'ok', 'task', 'value', 'via'].sort());
    expect(e).toEqual({ kind: 'release', task: 0, hole: 'd', value: '780', ok: true, gauges: { unit: 'eq', between: 'eq', cross: 'eq', diff: null }, decoyHit: false, free: false, via: 'drag', done: true });
  });

  it('toggleGauge : les deux nombres exacts sous une balance s’ouvrent et se ferment', () => {
    let s = L.init(LV.beginner.numbers);
    expect(s.opened).toEqual({ unit: true });
    s = L.toggleGauge(s, 'cross');
    expect(s.opened.cross).toBe(true);
    s = L.toggleGauge(s, 'cross');
    expect(s.opened.cross).toBe(false);
    expect(L.toggleGauge(s, 'x')).toBe(s);
  });

  for (const lv of ['beginner', 'advanced']) {
    for (const roomy of [false, true]) {
      it(`le coach suivi jusqu’au bout termine chaque tâche du niveau ${lv}${roomy ? ' (balances toutes écrites)' : ''}, sans jamais donner le nombre`, () => {
        const { s, seen } = followCoach(L.init(LV[lv].numbers), { roomy });
        expect(L.discoveryReady(s)).toBe(true);
        expect(s.tasks.every((_, i) => s.done[i])).toBe(true);
        expect(seen[0]).toBe('grab');
        expect(seen).toContain('next');
        expect(seen).toContain('try');
        if (lv === 'beginner') expect(seen).toContain('decoy');
        else expect(seen).not.toContain('decoy');
        if (roomy) expect(seen).not.toContain('gauge');
        else expect(seen).toContain('gauge');
        expect(L.coachOf(s)).toBeNull();
      });
    }
  }

  it('le coach : grab sous la poignée, gauge et decoy au-dessus de la balance, try sous −/+ ; jamais la réponse dans la cible', () => {
    let s = L.init(LV.beginner.numbers);
    expect(L.coachOf(s)).toMatchObject({ id: 'grab', target: '[data-fg-knob]', prefer: 'below' });
    s = L.release(s, 1000);
    expect(L.coachOf(s)).toMatchObject({ id: 'try', target: '[data-fg-stepper]' });
    s = L.release(s, 2000);
    expect(L.coachOf(s)).toMatchObject({ id: 'gauge', target: '[data-fg-gauge=cross]', prefer: 'above' });
    expect(L.coachOf(s, { roomy: true }).id).toBe('try');
    s = L.toggleGauge(s, 'cross');
    expect(L.coachOf(s).id).toBe('try');
    let d = { ...L.init(LV.beginner.numbers), ti: 2 };
    d = L.release(d, 1000);
    expect(L.coachOf(d)).toMatchObject({ id: 'decoy', target: '[data-fg-gauge=diff]' });
    d = L.release(d, 40400);
    expect(L.coachOf(d).id).not.toBe('decoy');
    for (const v of Object.values(L.PRESETS).flat()) expect(JSON.stringify(L.coachOf(L.init({ tasks: [v] })))).not.toContain(String(v.b ?? '#'));
  });

  it('les témoins de découverte viennent de SES essais, avec des repli sûrs', () => {
    const fresh = L.init(LV.beginner.numbers);
    expect(L.rightWitness(fresh)).toMatchObject({ v: '780' });
    expect(L.decoyWitness(fresh)).toMatchObject({ v: '404' });
    const { s } = followCoach(L.init(LV.beginner.numbers));
    const r = L.rightWitness(s);
    expect(r.l).toBe(r.r);
    expect(r.v).toBe('780');
    const d = L.decoyWitness(s);
    expect(d).toMatchObject({ v: '404', dl: '4', dr: '4' });
    expect(d.cl).not.toBe(d.cr);
    const w = L.addWitness(L.init(LV.advanced.numbers));
    expect(w).toEqual({ a: '12', b: '3', c: '18', w: '6', naive: '9', good: '4,5' });
  });

  it('le دفتر : les cinq chemins avec les nombres de la dernière tâche, calculés par le cœur', () => {
    const b = L.formalOf(L.init(LV.beginner.numbers));
    expect(b.task.answer).toBe('600');
    expect(b.table).toEqual({ a: '8', b: '400', c: '12', d: '600' });
    expect(Object.values(b.r.routes).every((x) => x.clean)).toBe(true);
    expect(b.r.routes.cross.steps[0]).toMatchObject({ x: '400', y: '12', r: '4800' });
    const a = L.formalOf(L.init(LV.advanced.numbers));
    expect(a.task.answer).toBe('4,5');
    expect(a.r.routes.multiplicative.steps[0].r).toBe('1,5');
    expect(F.ROUTES.every((id) => a.r.routes[id])).toBe(true);
  });
});

describe('calcText — the verdict shows the calculation, never a raw fraction', () => {
  it('writes an exact decimal side with « = » and a repeating one with « ≈ »', () => {
    const g = F.gauges('d', { a: '4', b: '520', c: '6' }, F.parse('551'));
    expect(L.calcText(g.unit.left)).toBe('520 ÷ 4 = 130');
    expect(L.calcText(g.unit.right)).toBe('551 ÷ 6 ≈ 91,8');
  });
});
