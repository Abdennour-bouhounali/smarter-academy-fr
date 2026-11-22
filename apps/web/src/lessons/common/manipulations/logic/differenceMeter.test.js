import { describe, it, expect } from 'vitest';
import * as L from './differenceMeter';
import * as O from '@smarter-academy/core/arithmetic/orderSign.js';
import { ratText, rat } from '@smarter-academy/core/arithmetic/powers.js';

const one = (task) => L.init({ tasks: [task] });
const right = (s) => {
  const t = L.taskOf(s);
  if (t.curtain) return O.CARD_OF[O.fromDifference({ left: t.curtain.left, value: t.curtain.value })];
  return O.CARD_OF[O.orderOf(t.a, t.b)];
};
/** Joue une tâche `rail` comme l'élève guidé par `coachOf`, jusqu'à la fin. */
function solveRail(s) {
  for (let g = 0; g < 20 && !L.taskDone(s); g += 1) {
    const c = L.coachOf(s);
    switch (c?.id) {
      case 'plug': s = L.plug(s, 'red', 'a'); break;
      case 'plug2': s = L.plug(s, 'black', 'b'); break;
      case 'write': {
        const r = L.readingOf(s);
        s = L.setWritten(s, { sign: r.n < 0n ? -1 : 1, num: Number(r.n < 0n ? -r.n : r.n), den: Number(r.d) });
        s = L.checkWritten(s); break;
      }
      case 'swap': s = L.swap(s); break;
      case 'verdict': s = L.chooseCard(s, right(s)); break;
      default: throw new Error(`étape inattendue ${c?.id}`);
    }
  }
  return s;
}
function solveRace(s) {
  const t = L.taskOf(s);
  s = L.setX(s, 3); s = L.setX(s, 6);
  s = L.setCoef(s, { p: t.form.p, q: t.form.q }); s = L.checkCoef(s);
  O.signRegions(t.terms).forEach((r, i) => { s = L.setRegionCard(s, i, r.sign > 0 ? 'gt' : r.sign < 0 ? 'lt' : 'eq'); });
  return L.checkRegions(s);
}

describe('difference-meter — logique', () => {
  it('les trois niveaux sont résolus en suivant le geste de coachOf, jusqu\'à la fin de chaque tâche', () => {
    for (const lv of ['beginner', 'advanced']) {
      let s = L.init(L.PRESETS[lv]);
      for (let i = 0; i < s.tasks.length; i += 1) {
        s = solveRail(s);
        expect(L.taskDone(s), `${lv} ${s.tasks[i].id}`).toBe(true);
        expect(s.trials.filter((e) => e.ok === false), s.tasks[i].id).toEqual([]);
        s = L.nextTask(s);
      }
      expect(L.allDone(s), lv).toBe(true);
      expect(L.discoveryKind(s), lv).toBe(lv === 'beginner' ? 'side' : 'need');
    }
    let s = L.init(L.PRESETS.race);
    for (let i = 0; i < 3; i += 1) { s = solveRace(s); expect(L.taskDone(s), L.taskOf(s).id).toBe(true); s = L.nextTask(s); }
    expect(L.allDone(s)).toBe(true);
    expect(L.discoveryKind(s)).toBeNull();
  });

  it('d1 : le sens de l\'aiguille suit l\'ordre ; brancher dans l\'autre sens la fait traverser sans changer la carte juste', () => {
    let s = one(L.PRESETS.beginner.tasks[0]);
    expect(L.readingOf(s)).toBeNull();
    s = L.plug(s, 'red', 'a'); expect(L.readingOf(s)).toBeNull();
    s = L.plug(s, 'black', 'b');
    expect(ratText(L.readingOf(s))).toBe('1/2');
    expect(L.needleSide(s)).toBe(1);
    s = L.plug(L.unplug(s, 'red'), 'red', 'b');                  // rouge sur b : refusé, la noire y est
    expect(s.last).toMatchObject({ kind: 'refused', reason: 'same' });
  });

  it('d2 : la carte « a < b » reste juste quand on permute ; la tâche exige un échange', () => {
    let s = one(L.PRESETS.beginner.tasks[1]);
    s = L.tapBead(s, 'a'); s = L.tapBead(s, 'b');
    expect([s.red, s.black]).toEqual(['a', 'b']);
    expect(ratText(L.readingOf(s))).toBe('-1');
    s = L.chooseCard(s, 'gt');
    expect(s.last).toMatchObject({ kind: 'refused', reason: 'verdict', card: 'gt' });
    expect(s.wrongs).toBe(1);
    s = L.chooseCard(s, 'lt');
    expect(s.verdict).toBe('lt');
    expect(L.taskDone(s)).toBe(false);                            // il faut encore « بدّل المجسّين »
    expect(L.coachOf(s).id).toBe('swap');
    s = L.swap(s);
    expect(ratText(L.readingOf(s))).toBe('1');
    expect(s.swapTried).toBe(true);
    expect(s.verdict).toBe('lt');
    expect(L.taskDone(s)).toBe(true);
  });

  it('d2 : permuter AVANT le verdict suffit aussi', () => {
    let s = one(L.PRESETS.beginner.tasks[1]);
    s = L.plug(L.plug(s, 'red', 'a'), 'black', 'b');
    s = L.swap(s);
    expect(L.taskDone(s)).toBe(false);
    s = L.chooseCard(s, 'lt');
    expect(L.taskDone(s)).toBe(true);
  });

  it('d3 : les perles sont à moins d\'un pixel et leurs étiquettes fusionnent', () => {
    const s = one(L.PRESETS.beginner.tasks[2]);
    expect(L.gapPx(s)).toBeLessThan(1);
    const t = L.taskOf(s);
    const lay = L.tagLayout(L.xOf(t, t.a), L.xOf(t, t.b));
    expect(lay.merged).toBe(true);
    const s2 = L.plug(L.plug(s, 'red', 'a'), 'black', 'b');
    expect(ratText(L.readingOf(s2))).toBe('1/176');
  });

  it('géométrie : jamais deux étiquettes séparées qui se chevauchent, sur toutes les tâches des deux niveaux', () => {
    for (const lv of ['beginner', 'advanced']) {
      for (const raw of L.PRESETS[lv].tasks) {
        const t = L.buildTask(raw);
        const lay = L.tagLayout(L.xOf(t, t.a), L.xOf(t, t.b));
        if (!lay.merged) expect(Math.abs(lay.a.x - lay.b.x), raw.id).toBeGreaterThanOrEqual(L.TAG_W - 1e-9);
        expect(lay.a.x).toBeGreaterThanOrEqual(L.TAG_W / 2); expect(lay.a.x).toBeLessThanOrEqual(L.RAIL_W - L.TAG_W / 2);
      }
    }
  });

  it('d4 : le volet couvre l\'aiguille ; une différence écrite fausse est refusée avec les deux nombres, puis la bonne lève le volet', () => {
    let s = one(L.PRESETS.advanced.tasks[0]);
    s = L.plug(L.plug(s, 'red', 'a'), 'black', 'b');
    expect(L.shutterClosed(s)).toBe(true);
    expect(L.needleShown(s)).toBe(false);
    expect(L.cardsActive(s)).toBe(false);
    expect(L.chooseCard(s, 'lt')).toBe(s);                          // pas de verdict derrière le volet
    s = L.setWritten(s, { sign: -1, num: 7, den: 5 }); s = L.checkWritten(s);   // 17/12 − 10/7 : soustraire les termes
    expect(s.last).toMatchObject({ kind: 'refused', reason: 'write' });
    expect(ratText(s.last.reading)).toBe('-1/84');
    expect(L.shutterClosed(s)).toBe(true);
    s = L.setWritten(s, { sign: -1, num: 1, den: 84 }); s = L.checkWritten(s);
    expect(L.shutterClosed(s)).toBe(false);
    expect(L.needleShown(s)).toBe(true);
    s = L.chooseCard(s, 'lt');
    expect(L.taskDone(s)).toBe(true);
  });

  it('d6 : le rideau — seule la différence connue ; « لا نستطيع الحكم » est refusé', () => {
    let s = one(L.PRESETS.advanced.tasks[2]);
    expect(L.needleShown(s)).toBe(true);
    expect(ratText(L.readingOf(s))).toBe('-3/10');
    expect(L.plug(s, 'red', 'a')).toBe(s);                          // rien à brancher
    s = L.chooseCard(s, 'nojudge');
    expect(s.last).toMatchObject({ reason: 'verdict', card: 'nojudge' });
    s = L.chooseCard(s, 'gt');
    expect(s.last.reason).toBe('verdict');
    s = L.chooseCard(s, 'lt');
    expect(L.taskDone(s)).toBe(true);
    // les perles cachées sont cohérentes avec la carte
    const t = L.taskOf(s);
    expect(ratText(O.difference(t.a, t.b))).toBe('-3/10');
  });

  it('race : A − B se lit à l\'aiguille ; les coefficients ne s\'ouvrent qu\'après avoir bougé x', () => {
    let s = one(L.PRESETS.race.tasks[0]);
    expect(L.coefOpen(s)).toBe(false);
    expect(L.coachOf(s).id).toBe('x');
    expect(ratText(L.readingOf(s))).toBe('-4');                      // x = 0 : 5 − 9
    s = L.setX(s, 4);
    expect(ratText(L.readingOf(s))).toBe('0');
    s = L.setX(s, 6);
    expect(L.coefOpen(s)).toBe(true);
    expect([ratText(L.beadValues(s).a), ratText(L.beadValues(s).b)]).toEqual(['23', '21']);
    s = L.setCoef(s, { p: 5, q: 14 }); s = L.checkCoef(s);            // B ajoutée au lieu d'être retranchée
    expect(s.last).toMatchObject({ reason: 'coef' });
    expect(s.trials.at(-1).reason).toBe('bracket');
    s = L.setCoef(s, { p: 1, q: -4 }); s = L.checkCoef(s);
    expect(s.coefOk).toBe(true);
    expect(L.coachOf(s).id).toBe('cards');
  });

  it('race e1 : une carte fausse est refusée avec un x d\'essai de la région ; e2 : une seule région « pour tout x »', () => {
    let s = one(L.PRESETS.race.tasks[0]);
    s = L.setX(L.setX(s, 2), 5);
    s = L.setCoef(s, { p: 1, q: -4 }); s = L.checkCoef(s);
    ['lt', 'eq', 'lt'].forEach((c, i) => { s = L.setRegionCard(s, i, c); });
    s = L.checkRegions(s);
    expect(s.last).toMatchObject({ reason: 'regions', region: 2 });
    expect(ratText(s.last.sample)).toBe('5');
    expect(ratText(s.last.reading)).toBe('1');
    expect(L.taskDone(s)).toBe(false);
    s = L.setRegionCard(s, 2, 'lt'); s = L.setRegionCard(s, 2, 'gt');
    s = L.checkRegions(s);
    expect(L.taskDone(s)).toBe(true);

    let e2 = one(L.PRESETS.race.tasks[1]);
    expect(L.taskOf(e2).regions).toHaveLength(1);
    expect(L.taskOf(e2).regions[0].kind).toBe('all');
    e2 = solveRace(e2);
    expect(L.taskDone(e2)).toBe(true);
  });

  it('race : les valeurs des perles aux x annoncés par le plan', () => {
    const s = one(L.PRESETS.race.tasks[2]);
    const at = (x) => { const n = L.setX(s, x); const b = L.beadValues(n); return [ratText(b.a), ratText(b.b)]; };
    expect(at(2)).toEqual(['7', '6']);
    expect(at(4)).toEqual(['19', '20']);
    expect(L.taskOf(s).range[1]).toBeGreaterThanOrEqual(72);
  });

  it('« جرّب أعدادك » : les perles bougent, les sondes restent branchées, rien n\'est compté', () => {
    let s = one(L.PRESETS.beginner.tasks[0]);
    s = L.plug(L.plug(s, 'red', 'a'), 'black', 'b');
    const f = L.setFreeRail(s, '٠٫٥', '-1/3');
    expect(L.isFree(f)).toBe(true);
    expect(ratText(L.readingOf(f))).toBe('5/6');
    const v = L.chooseCard(f, 'gt');
    expect(v.verdict).toBe('gt');
    expect(L.taskDone(v)).toBe(false);
    expect(v.done).toEqual({});
    expect(L.setFreeRail(s, '10', '1')).toBe(s);
    expect(L.validateFreeRail('1/100', '1').why).toBe('den');
    const back = L.toGuided(v);
    expect(L.isFree(back)).toBe(false);
    const r = L.setFreeRace(one(L.PRESETS.race.tasks[0]), '2x+7', 'x+10');
    expect(L.taskOf(r).form).toEqual({ p: 1, q: -3 });
    expect(L.validateFreeRace('2x+7', 'x^3').why).toBe('degree');
  });

  it('réinitialiser : retry et restartTask remettent la tâche à zéro', () => {
    let s = one(L.PRESETS.beginner.tasks[0]);
    s = L.plug(L.plug(s, 'red', 'a'), 'black', 'b');
    expect(L.canRetry(s)).toBe(true);
    const r = L.retry(s);
    expect([r.red, r.black, r.verdict]).toEqual([null, null, null]);
    expect(L.restartTask(s).done[0]).toBe(false);
  });

  it('les préréglages de levels.js sont ceux de PRESETS', async () => {
    const { LEVELS } = await import('../levels');
    expect(LEVELS['difference-meter'].beginner.numbers).toEqual({ world: 'rail', tasks: L.PRESETS.beginner.tasks });
    expect(LEVELS['difference-meter'].advanced.numbers).toEqual({ world: 'rail', tasks: L.PRESETS.advanced.tasks });
  });

  it('chaque différence annoncée par le plan est exacte', () => {
    const d = (a, b) => ratText(O.difference(O.parseNumber(a), O.parseNumber(b)));
    expect(d('17/12', '10/7')).toBe('-1/84');
    expect(d('-7/6', '-9/8')).toBe('-1/24');
    expect(rat(1).d).toBe(1n);
  });
});
