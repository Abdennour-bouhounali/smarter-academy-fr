import { describe, it, expect } from 'vitest';
import * as L from './shadeMatch';

/** Dose c mesures puis lâche (le geste complet). */
const pour = (s, c) => L.release(L.dose(s, c - s.c));

/** Suit le coach jusqu'au bout d'un niveau : le labo doit pouvoir se finir par le guide seul. */
function followCoach(s0) {
  let s = s0;
  for (let guard = 0; guard < 400; guard += 1) {
    const c = L.coachOf(s);
    if (!c && L.canNext(s)) { s = L.nextTask(s); continue; }
    if (!c || c.id === 'free') break;
    const t = L.taskOf(s);
    if (t.kind === 'compare') s = L.chooseDarker(s, t.darker);
    else if (t.kind === 'pick') { for (let k = 0; k < t.candidates.length; k += 1) s = L.loadCandidate(s, k); }
    else if (c.id === 'lever' || c.id === 'meter') {
      if (t.impossible) s = t.veil ? L.dose(s, 1) : pour(pour(s, t.below), t.above);
      else s = t.veil ? L.dose(s, t.goal - s.c) : pour(s, t.goal);
    } else if (c.id === 'drain') s = pour(L.drain(s), s.c - 1);
    else if (c.id === 'impossible') s = t.veil ? L.claimImpossible(L.setAbove(L.setBelow(s, String(t.below)), String(t.above))) : L.claimImpossible(s);
    else if (c.id === 'commit') s = t.impossible ? L.claimImpossible(L.setAbove(L.setBelow(s, String(t.below)), String(t.above))) : L.commit(s);
    else throw new Error(`étape inconnue ${c.id}`);
  }
  return s;
}

describe('shade-match — les tâches', () => {
  it('les préréglages : s1 → 6, s2 → 6, s3 impossible (7 et 8), a1 → 15, a2 impossible (6 et 7), a3 → 6, a4 : A plus foncé', () => {
    const t = Object.fromEntries(['beginner', 'advanced'].flatMap((k) => L.init(L.PRESETS[k]).tasks.map((x) => [x.id, x])));
    expect([t.s1.goal, t.s2.goal, t.a1.goal, t.a3.goal]).toEqual([6, 6, 15, 6]);
    expect(t.s3).toMatchObject({ impossible: true, below: 7, above: 8, goal: null });
    expect(t.a2).toMatchObject({ impossible: true, below: 6, above: 7 });
    expect(t.a4).toMatchObject({ kind: 'compare', darker: 'A' });
    expect(t.s1.impossible).toBe(false);
  });

  it('une tâche invalide est refusée à la construction', () => {
    expect(() => L.init({ tasks: [{ a: 0, b: 4, d: 8 }] })).toThrow();
    expect(() => L.init({ tasks: [{ a: 3, b: 0, d: 8 }] })).toThrow();
    expect(() => L.init({ tasks: [{ a: 3, b: 4, d: 0 }] })).toThrow();
    expect(() => L.init({ tasks: [{ kind: 'pick', a: 6, b: 8, candidates: [[9, 12]] }] })).toThrow();
  });
});

describe('shade-match — le verdict est EXACT (produits en croix)', () => {
  it('3/4 sur 8 blancs : 5 plus clair, 6 pile, 7 plus foncé ; la belle idée « +4 et +4 » (7 bleus) est refusée par l\'aiguille', () => {
    let s = L.init(L.PRESETS.beginner);
    expect(L.judge(L.dose(s, 5)).verdict).toBe('lighter');
    expect(L.judge(L.dose(s, 6)).verdict).toBe('match');
    expect(L.judge(L.dose(s, 7)).verdict).toBe('darker');
    s = pour(s, 7);
    expect(s.settled.verdict).toBe('darker');
    expect(L.taskDone(s)).toBe(false);
    expect(L.needle(s)).toBeGreaterThan(0);
  });

  it('l\'aiguille : signe du verdict, zéro à la teinte exacte, plancher visible au plus près', () => {
    const s = L.init(L.PRESETS.beginner);
    expect(L.needle(L.dose(s, 6))).toBe(0);
    expect(L.needle(L.dose(s, 5))).toBeLessThan(0);
    expect(L.needle(L.dose(s, 7))).toBeGreaterThan(0);
    const near = L.init({ tasks: [{ id: 'x', a: 3, b: 4, d: 10 }] });
    expect(Math.abs(L.needle(L.dose(near, 7)))).toBeGreaterThanOrEqual(0.12);
    expect(L.needle(L.dose(near, 7))).toBeLessThan(0);
    expect(L.needle(L.dose(near, 8))).toBeGreaterThan(0);
  });

  it('à rapports égaux, la couleur est la MÊME ; à rapports différents (3/4 et 7/10) elle diffère à peine', () => {
    const s = L.init({ tasks: [{ id: 'x', a: 3, b: 4, d: 8 }] });
    const six = L.dose(s, 6);
    const sh = L.shares(six);
    expect(L.depth(sh.ref)).toBe(L.depth(sh.mix));
    const s7 = L.init({ tasks: [{ id: 'x', a: 3, b: 4, d: 10 }] });
    const near = L.shares(L.dose(s7, 7));
    const gap = Math.abs(L.depth(near.ref) - L.depth(near.mix));
    expect(gap).toBeGreaterThan(0);
    expect(gap).toBeLessThan(0.06);
    expect(L.depth(L.shares(L.dose(L.init({ tasks: [{ id: 'y', a: 9, b: 12, d: 8 }] }), 6)).mix)).toBe(L.depth(L.shares(L.dose(L.init({ tasks: [{ id: 'y', a: 3, b: 4, d: 8 }] }), 6)).ref));
  });

  it('une référence non réduite (9/12) correspond comme 3/4 (a3 : 6 sur 8)', () => {
    const s = L.init({ tasks: [{ id: 'a3', a: 9, b: 12, d: 8 }] });
    expect(L.judge(L.dose(s, 6)).verdict).toBe('match');
  });
});

describe('shade-match — le geste, le lâcher, le tampon', () => {
  it('l\'aperçu ne juge rien ; le lâcher est l\'essai ; s1 : 6 pose le tampon et rend m suivant', () => {
    let s = L.init(L.PRESETS.beginner);
    s = L.dose(s, 6);
    expect(s.trials).toHaveLength(0);
    s = L.release(s);
    expect(s.trials.map((e) => e.kind)).toEqual(['release', 'solved']);
    expect(s.trials[0]).toMatchObject({ mission: 's1', c: 6, d: 8, verdict: 'match', ok: true });
    expect(L.taskDone(s)).toBe(true);
    expect(L.canDose(s)).toBe(false);
    expect(L.canNext(s)).toBe(true);
    expect(L.release(s)).toBe(s);   // rien n'a bougé : pas un nouvel essai
  });

  it('borne : 0 … 40 ; « تصريف » enlève une mesure', () => {
    let s = L.init(L.PRESETS.beginner);
    expect(L.drain(s).c).toBe(0);
    s = L.dose(s, 99);
    expect(s.c).toBe(L.MAX_C);
    expect(L.drain(s).c).toBe(L.MAX_C - 1);
  });

  it('s3 impossible : « لا يوجد عدد صحيح » est refusé tant que deux entiers consécutifs (clair puis foncé) n\'ont pas été essayés', () => {
    let s = L.init({ tasks: [PRESET('s3')] });
    s = L.claimImpossible(s);
    expect(s.refusal).toBe('bracket');
    expect(L.taskDone(s)).toBe(false);
    s = pour(s, 7);
    expect(L.bracketSeen(s)).toBe(false);
    s = L.claimImpossible(s);
    expect(s.refusal).toBe('bracket');
    s = pour(s, 8);
    expect(L.bracketSeen(s)).toBe(true);
    s = L.claimImpossible(s);
    expect(L.taskDone(s)).toBe(true);
    expect(s.trials.at(-2)).toMatchObject({ kind: 'impossible', below: 7, above: 8, ok: true });
  });

  it('appuyer « لا يوجد عدد صحيح » sur une tâche qui a une solution est refusé SANS donner le nombre', () => {
    let s = L.init(L.PRESETS.beginner);
    s = L.claimImpossible(s);
    expect(s.refusal).toBe('exists');
    expect(L.taskDone(s)).toBe(false);
    expect(s.trials.at(-1)).toMatchObject({ kind: 'impossible', ok: false, below: null });
  });

  it('« جرّب أعدادك » : toujours ouvert, jamais compté (custom), pas de tampon', () => {
    let s = L.init(L.PRESETS.beginner);
    const v = L.validateFree('3', '4', '8');
    expect(v.ok).toBe(true);
    s = L.setFree(s, v.cfg);
    s = pour(s, 6);
    expect(s.trials.map((e) => e.kind)).toEqual(['custom']);
    expect(s.trials[0]).toMatchObject({ free: true, ok: false, verdict: 'match' });
    expect(L.taskDone(s)).toBe(false);
    expect(L.toGuided(s).free).toBe(null);
    expect(L.validateFree('0', '4', '8')).toEqual({ ok: false, why: 'range' });
    expect(L.validateFree('3', '21', '8')).toEqual({ ok: false, why: 'range' });
    expect(L.validateFree('3', '', '8')).toEqual({ ok: false, why: 'empty' });
    expect(L.validateFree('٣', '٤', '٨').ok).toBe(true);
  });
});

describe('shade-match — متقدم : le mesureur est VOILÉ jusqu\'à l\'engagement', () => {
  it('a1 : verser ne révèle rien ; « أثبّت » avec 14 est faux et révèle ; avec 15 il pose le tampon', () => {
    let s = L.init(L.PRESETS.advanced);
    expect(L.veiled(s)).toBe(true);
    s = pour(s, 14);
    expect(s.trials).toHaveLength(0);   // un lâcher voilé n'est pas un verdict
    expect(L.veiled(s)).toBe(true);
    s = L.commit(s);
    expect(s.trials.at(-1)).toMatchObject({ kind: 'commit', value: 14, ok: false });
    expect(L.veiled(s)).toBe(false);
    expect(L.taskDone(s)).toBe(false);
    s = pour(s, 15);
    expect(L.taskDone(s)).toBe(true);
  });

  it('a2 impossible : écrire les voisins 6 et 7 réussit ; 6 et 8 est réfuté et révèle (la tâche reste ouverte)', () => {
    let s = L.init({ tasks: [PRESET('a2', 'advanced')] });
    s = L.setBelow(s, '6'); s = L.setAbove(s, '8');
    s = L.claimImpossible(s);
    expect(s.trials.at(-1)).toMatchObject({ kind: 'impossible', below: 6, above: 8, ok: false });
    expect(L.veiled(s)).toBe(false);
    expect(L.taskDone(s)).toBe(false);
    let t = L.init({ tasks: [PRESET('a2', 'advanced')] });
    t = L.setAbove(L.setBelow(t, '6'), '7');
    t = L.claimImpossible(t);
    expect(L.taskDone(t)).toBe(true);
  });

  it('a2 : engager un c sur une tâche impossible est faux (le mesureur est révélé : 6 plus clair, 7 plus foncé mais le plus près)', () => {
    let s = L.init({ tasks: [PRESET('a2', 'advanced')] });
    s = L.commit(pour(s, 7));
    expect(s.trials.at(-1)).toMatchObject({ kind: 'commit', value: 7, ok: false });
    expect(L.judge(s).verdict).toBe('darker');
    expect(L.judge(L.dose(s, -1)).verdict).toBe('lighter');
  });

  it('a4 compare : A = 7/9 est plus foncé que B = 10/13 (7 × 13 = 91 > 90) ; « B » (compare les numérateurs) est réfuté par la révélation', () => {
    let s = L.init({ tasks: [PRESET('a4', 'advanced')] });
    expect(L.veiled(s)).toBe(true);
    s = L.chooseDarker(s, 'B');
    expect(s.trials.at(-1)).toMatchObject({ kind: 'commit', value: 'B', ok: false });
    expect(L.veiled(s)).toBe(false);
    expect(L.judge(s).verdict).toBe('lighter');   // B (10/13) est plus clair que A
    let t = L.init({ tasks: [PRESET('a4', 'advanced')] });
    t = L.chooseDarker(t, 'A');
    expect(t.trials.map((e) => e.kind)).toEqual(['commit', 'solved']);
  });
});

describe('shade-match — le monde `equal` (معارف)', () => {
  it('6/8 contre 9/12, 15/20 (pile), 7/9, 12/15 : deux seaux correspondent ; la tâche finit quand tous sont chargés', () => {
    let s = L.init(L.PRESETS.equal);
    const t = L.taskOf(s);
    expect(t.candidates.map((x) => x.match)).toEqual([true, true, false, false]);
    expect(t.matching).toBe(2);
    s = L.loadCandidate(s, 0);
    expect(L.judge(s).verdict).toBe('match');
    s = L.loadCandidate(s, 2);
    expect(L.judge(s).verdict).toBe('darker');   // 7/9 > 6/8 : 7 × 8 = 56 > 54 = 6 × 9
  });

  it('7/9 contre 6/8 : 7 × 8 = 56 > 6 × 9 = 54, plus foncé ; 12/15 : 12 × 8 = 96 > 90, plus foncé', () => {
    let s = L.init(L.PRESETS.equal);
    expect(L.judge(L.loadCandidate(s, 2)).verdict).toBe('darker');
    expect(L.judge(L.loadCandidate(s, 3)).verdict).toBe('darker');
    for (let k = 0; k < 4; k += 1) s = L.loadCandidate(s, k);
    expect(L.taskDone(s)).toBe(true);
    expect(s.trials.filter((e) => e.kind === 'load')).toHaveLength(4);
    expect(s.trials.at(-1).kind).toBe('solved');
  });
});

describe('shade-match — la découverte et le coach', () => {
  it('la découverte s\'ouvre quand s1, s2, s3 sont faites (مبتدئ seulement)', () => {
    let s = L.init(L.PRESETS.beginner);
    expect(L.discoveryReady(s)).toBe(false);
    s = followCoach(s);
    expect(L.allDone(s)).toBe(true);
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.discoveryReady(followCoach(L.init(L.PRESETS.advanced)))).toBe(false);
    expect(L.discoveryReady(followCoach(L.init(L.PRESETS.equal)))).toBe(false);
  });

  it('formalOf : 6 × 4 = 24 = 3 × 8 ; « +4 et +4 » donne 7 bleus, plus foncé ; 7 × 4 = 28 < 30 = 3 × 10', () => {
    const f = L.formalOf(L.init(L.PRESETS.beginner));
    expect(f.exact).toMatchObject({ a: 3, b: 4, d: 8, c: 6, lhs: 24, rhs: 24 });
    expect(f.add).toMatchObject({ c: 7, verdict: 'darker', lhs: 28, rhs: 24 });
    expect(f.gone).toMatchObject({ below: 7, above: 8, lhsBelow: 28, rhsBelow: 30, lhsAbove: 32 });
    expect(f.notBigger).toEqual({ c: 6, d: 8 });
  });

  it('le coach mène chaque niveau et le monde `equal` jusqu\'au bout, sans jamais nommer un nombre', () => {
    for (const k of ['beginner', 'advanced', 'equal']) {
      const s = followCoach(L.init(L.PRESETS[k]));
      expect(L.allDone(s), k).toBe(true);
      expect(L.coachOf(s)?.id ?? 'free', k).toBe('free');
    }
  });

  it('étapes du coach : lever d\'abord, puis meter, drain quand on a trop versé, impossible après l\'encadrement ; commit en متقدم ; rien en libre', () => {
    let s = L.init(L.PRESETS.beginner);
    expect(L.coachOf(s).id).toBe('lever');
    s = pour(s, 5);
    expect(L.coachOf(s).id).toBe('meter');
    s = pour(s, 7);
    expect(L.coachOf(s).id).toBe('drain');
    let t = L.init({ tasks: [PRESET('s3')] });
    t = pour(pour(t, 7), 8);
    expect(L.coachOf(t).id).toBe('impossible');
    const a = L.init(L.PRESETS.advanced);
    expect(L.coachOf(a).id).toBe('lever');
    expect(L.coachOf(L.dose(a, 3)).id).toBe('commit');
    expect(L.coachOf(L.setFree(s, { a: 3, b: 4, d: 8 }))).toBe(null);
  });
});

function PRESET(id, level = 'beginner') {
  return L.PRESETS[level].tasks.find((t) => t.id === id);
}
