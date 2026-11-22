import { describe, it, expect } from 'vitest';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import * as L from './segmentDivider';
import { LEVELS } from '../levels';

/**
 * segment-divider — la logique de l'éventail des parallèles, sur les nombres du manuel :
 * [AB] en 3 parts (طرائق ص 107), MA/MB = 3/2 (طرائق ص 109, point intérieur ET extérieur K/N),
 * دوري الآن CA/CB = 2/5 (AC = 2/7 AB et 2/3 AB), تمرين 17 (AM/AB = 3/7), تمرين 19 (11/7 → 11/18 et 11/4).
 */
const T = (f) => LIN.fracText(f);
const repeat = (s, f, n) => { let x = s; for (let i = 0; i < n; i += 1) x = f(x); return x; };
const carryN = (s, n, rail) => repeat(s, (x) => L.carry(x, rail), n);
/** Trace toutes les parallèles des marques 0..joined-1 en glissant l'équerre sur chacune. */
const drawAll = (s) => { let x = s; for (let i = 0; i < x.joined; i += 1) x = L.draw(L.setSlide(x, L.rayMarks(x)[i].pos)); return x; };

describe('segment-divider — mode equal (3 parts égales)', () => {
  it('les niveaux de levels.js s’initialisent', () => {
    const b = L.init(LEVELS['segment-divider'].beginner.numbers);
    expect(b.mode).toBe('equal');
    expect(b.parts).toBe(3);
    expect(b.cap).toBe(4);
    const a = L.init(LEVELS['segment-divider'].advanced.numbers);
    expect(a.mode).toBe('ratio');
    expect([a.p, a.q, a.cap]).toEqual([3, 2, 5]);
  });

  it('trois reports égaux, la 3e marque reliée à B : [AB] en 3 parts égales de 10/3 cm', () => {
    let s = carryN(L.init({ parts: 3 }), 3);
    expect(L.rayMarks(s).map((m) => m.pos)).toEqual([15, 30, 45]);
    s = L.join(s, 2);
    expect(s.slide).toBe(45);
    s = drawAll(s);
    expect(L.complete(s)).toBe(true);
    const tr = s.trials.at(-1);
    expect(tr).toMatchObject({ n: 3, even: true, kind: 'ok', ok: true });
    expect(tr.parts.map(T)).toEqual(['1/3', '1/3', '1/3']);
    expect(L.lengthTex(s, tr.parts[0])).toBe('\\dfrac{10}{3} \\approx 3{,}33');
    expect(L.cutsOf(s).map((c) => T(c.t))).toEqual(['1/3', '2/3']);
  });

  it('les points de partage NE DÉPENDENT NI de l’ouverture NI de l’angle (balayage)', () => {
    for (let r = L.OPEN.equal.min; r <= 20; r += 1) {
      for (const angle of [20, 33, 47, 70]) {
        let s = L.setOpening(L.setAngle(L.init({ parts: 3 }), angle), r);
        s = drawAll(L.join(carryN(s, 3), 2));
        expect(s.trials.at(-1).parts.map(T)).toEqual(['1/3', '1/3', '1/3']);
      }
    }
  });

  it('une ouverture changée en route : des parts inégales, mesurées exactement', () => {
    let s = carryN(L.init({ parts: 3 }), 2); // 15, 30
    s = L.carry(L.setOpening(s, 25)); // 55
    expect(s.last).toMatchObject({ kind: 'carried', changed: true });
    s = drawAll(L.join(s, 2));
    const tr = s.trials.at(-1);
    expect(tr).toMatchObject({ kind: 'unequal', even: false, ok: false });
    expect(tr.parts.map(T)).toEqual(['3/11', '3/11', '5/11']);
    expect(tr.openings).toEqual([15, 15, 25]);
  });

  it('relier la mauvaise marque : (n − 1) marques → 2 parts (MISC-TALIS-ADAD-AL-ALAMAT), une marque au-delà coupe hors de [AB]', () => {
    let s = carryN(L.init({ parts: 3 }), 3);
    s = drawAll(L.join(s, 1));
    expect(s.trials.at(-1)).toMatchObject({ n: 2, kind: 'count', ok: false });
    expect(s.trials.at(-1).parts.map(T)).toEqual(['1/2', '1/2']);
    // la 3e marque, au-delà de la marque reliée : sa parallèle tombe à 3/2 de AB
    s = L.draw(L.setSlide(s, 45));
    expect(T(L.cutsOf(s).at(-1).t)).toBe('3/2');
  });

  it('les refus : angle verrouillé, rail plein, report après la jonction, tracé hors marque / sur la droite reliée / en double', () => {
    let s = L.carry(L.init({ parts: 3 }));
    expect(L.setAngle(s, 60).last.kind).toBe('angleLocked');
    s = carryN(s, 3);
    expect(L.canCarry(s)).toBe('full');
    expect(L.carry(s).last.kind).toBe('full');
    s = L.join(s, 2);
    expect(L.carry(L.fresh(s)).last.kind).toBe('carried');
    expect(L.draw(L.setSlide(s, 20)).last).toMatchObject({ kind: 'offMark', near: 0 });
    expect(L.draw(L.setSlide(s, 45)).last.kind).toBe('joinedLine');
    const once = L.draw(L.setSlide(s, 15));
    expect(L.draw(once).last.kind).toBe('already');
    expect(L.join(once, 3).last.kind).toBe('joinLocked');
    expect(L.draw(L.carry(L.init({ parts: 3 }))).last.kind).toBe('joinFirst');
  });

  it('l’équerre s’aimante à 3 mm d’une marque', () => {
    const s = L.join(carryN(L.init({ parts: 3 }), 3), 2);
    expect(L.snapSlide(s, 13)).toBe(15);
    expect(L.snapSlide(s, 18)).toBe(15);
    expect(L.snapSlide(s, 19)).toBe(19);
    expect(L.snapSlide(s, 99)).toBe(45);
    expect(L.neighbourMark(L.setSlide(s, 20), 1)).toBe(30);
    expect(L.neighbourMark(L.setSlide(s, 20), -1)).toBe(15);
  });

  it('la découverte : un essai juste ET un contraste (un essai raté, ou deux réglages)', () => {
    const one = drawAll(L.join(carryN(L.init({ parts: 3 }), 3), 2));
    expect(L.discoveryReady(one)).toBe(false);
    const same = drawAll(L.join(carryN(L.fresh(one), 3), 2));
    expect(L.discoveryReady(same)).toBe(false); // le même réglage : rien de nouveau
    const other = drawAll(L.join(carryN(L.setOpening(L.fresh(one), 22), 3), 2));
    expect(L.discoveryReady(other)).toBe(true);
    const wrong = drawAll(L.join(carryN(L.fresh(one), 2), 1));
    expect(L.discoveryReady(wrong)).toBe(true);
    const onlyWrong = drawAll(L.join(carryN(L.init({ parts: 3 }), 2), 1));
    expect(L.discoveryReady(drawAll(L.join(carryN(L.fresh(onlyWrong), 4), 3)))).toBe(false);
  });

  it('تمرين 17 : AM/AB = 3/7 — sept marques, la 7e reliée, la parallèle par la 3e', () => {
    let s = L.setOpening(carryN(L.init({ parts: 7 }), 0), 10);
    s = L.join(carryN(s, 7), 6);
    s = L.draw(L.setSlide(s, 30));
    expect(T(L.cutsOf(s)[0].t)).toBe('3/7');
  });

  it('la géométrie de l’équerre : V sur la règle, le bord passe par R(pos) et par C(pos) sur (AB), tout dans la boîte', () => {
    for (const angle of [20, 40, 70]) {
      let s = L.setAngle(L.init({ parts: 3 }), angle);
      s = L.join(carryN(L.setOpening(s, 25), 4), 3);
      const box = L.sceneBox(s);
      for (let pos = 0; pos <= L.slideMax(s); pos += 5) {
        const g = L.setSquareAt(s, pos);
        // V, R, C alignés selon u
        const cross = (p, q) => (p[0] - g.V[0]) * (q[1] - g.V[1]) - (p[1] - g.V[1]) * (q[0] - g.V[0]);
        expect(Math.abs(cross(g.R, g.C))).toBeLessThan(1e-6);
        // V sur la règle : V·u = c
        expect(Math.abs(g.V[0] * g.u[0] + g.V[1] * g.u[1] - g.c)).toBeLessThan(1e-9);
        for (const p of g.tri) {
          expect(p[0]).toBeGreaterThanOrEqual(box.x0 - 1e-6);
          expect(p[0]).toBeLessThanOrEqual(box.x1 + 1e-6);
          expect(p[1]).toBeGreaterThanOrEqual(box.y0 - 1e-6);
          expect(p[1]).toBeLessThanOrEqual(box.y1 + 1e-6);
        }
      }
    }
  });

  it('la boîte de la scène ne dépend pas de l’angle avant la jonction', () => {
    const a = L.sceneBox(L.setAngle(L.init({ parts: 3 }), 20));
    const b = L.sceneBox(L.setAngle(L.init({ parts: 3 }), 70));
    expect(a).toEqual(b);
    // le rayon entier tient dans la boîte, à tous les angles
    for (let ang = 20; ang <= 70; ang += 5) {
      const s = L.setAngle(L.init({ parts: 3 }), ang);
      const end = L.railPoint(s, 'ray', L.railLength(s));
      expect(end[0]).toBeLessThanOrEqual(a.x1);
      expect(end[1]).toBeLessThanOrEqual(a.y1);
    }
  });
});

describe('segment-divider — mode ratio (MA/MB = p/q, deux parallèles graduées)', () => {
  const R = (s, a, b) => L.commitRuler(L.setEnd(L.setEnd(s, 'a', a), 'b', b));
  const textbook = () => {
    let s = L.init({ mode: 'ratio', p: 3, q: 2, marks: 5 });
    s = carryN(s, 3, 'a+'); s = carryN(s, 3, 'a-'); s = carryN(s, 2, 'b+'); s = carryN(s, 2, 'b-');
    return s;
  };

  it('طرائق ص 109 : F à 3 sous A, E à 2 au-dessus de B → M dans [AB], AM/AB = 3/5, MA/MB = 3/2', () => {
    const s = R(textbook(), -36, 24);
    const j = s.joins.at(-1);
    expect(j).toMatchObject({ kind: 'inside', ok: true, inside: true, rankA: 3, rankB: 2 });
    expect(T(j.t)).toBe('3/5');
    expect(T(j.ratio)).toBe('3/2');
  });

  it('K du même côté que E : le point N hors de [AB], AN/AB = 3 (NA/NB = 3/2)', () => {
    const s = R(textbook(), 36, 24);
    const j = s.joins.at(-1);
    expect(j).toMatchObject({ kind: 'outside', inside: false });
    expect(T(j.t)).toBe('3');
    expect(T(j.ratio)).toBe('3/2');
    expect(L.found(s)).toEqual({ inside: false, outside: true });
  });

  it('inversé (2 côté A, 3 côté B) : MA/MB = 2/3 ; même rang : parallèle à (AB) ; ouvertures différentes : « units »', () => {
    let s = textbook();
    s = carryN(s, 2, 'b+'); // b+ : 24, 36, 48, 60
    expect(R(s, -24, 36).joins.at(-1).kind).toBe('inverted');
    expect(R(s, 24, 24).joins.at(-1)).toMatchObject({ kind: 'parallel', parallel: true });
    let u = L.init({ mode: 'ratio', p: 3, q: 2, marks: 5 });
    u = carryN(u, 3, 'a-');            // 12, 24, 36
    u = carryN(L.setOpening(u, 20), 2, 'b+'); // 20, 40 : deux marques mais une autre unité
    const j = R(u, -36, 40).joins.at(-1);
    expect(j.kind).toBe('units');
    expect(T(j.ratio)).toBe('9/10');
  });

  it('la découverte : le point intérieur ET le point extérieur', () => {
    let s = R(textbook(), -36, 24);
    expect(L.discoveryReady(s)).toBe(false);
    s = R(s, 36, 24);
    expect(L.discoveryReady(s)).toBe(true);
  });

  it('دوري الآن ص 109 : CA/CB = 2/5 → AC = 2/7 AB (dedans) et 2/3 AB (dehors, côté A)', () => {
    let s = L.init({ mode: 'ratio', p: 2, q: 5, marks: 5 });
    s = carryN(s, 2, 'a+'); s = carryN(s, 5, 'b-'); s = carryN(s, 5, 'b+');
    const inside = R(s, 24, -60).joins.at(-1);
    expect([inside.kind, T(inside.t)]).toEqual(['inside', '2/7']);
    const outside = R(s, 24, 60).joins.at(-1);
    expect([outside.kind, T(outside.t)]).toEqual(['outside', '-2/3']);
  });

  it('تمرين 19 : PM/PN = 11/7 → 11/18 (dedans) et 11/4 (dehors) — balayé sur t = a/(a − b)', () => {
    const s = L.init({ mode: 'ratio', p: 5, q: 5, marks: 5 });
    expect(T(L.rulerPoint(s, 110, -70).t)).toBe('11/18');
    expect(T(L.rulerPoint(s, 110, 70).t)).toBe('11/4');
    for (let a = -60; a <= 60; a += 6) {
      for (let b = -60; b <= 60; b += 6) {
        if (a === 0 || b === 0 || a === b) continue;
        const p = L.rulerPoint(s, a, b);
        expect(LIN.eq(p.t, LIN.div(LIN.frac(a), LIN.frac(a - b)))).toBe(true);
        expect(p.inside).toBe(LIN.cmp(p.t, LIN.frac(0)) > 0 && LIN.cmp(p.t, LIN.frac(1)) < 0);
      }
    }
  });

  it('la règle à moitié posée ne valide rien ; une marque inexistante n’est pas un bout de règle', () => {
    const s = textbook();
    expect(L.commitRuler(L.setEnd(s, 'a', 12)).last.kind).toBe('rulerHalf');
    expect(L.setEnd(s, 'a', 13)).toBe(s);
    expect(L.lineMarks(s, 'a')).toEqual([-36, -24, -12, 12, 24, 36]);
  });

  it('la boîte s’élargit pour montrer N (t = 3), pas au-delà de t ∈ [−3 ; 4]', () => {
    const s0 = textbook();
    const base = L.sceneBox(s0);
    const s = R(s0, 36, 24);
    expect(L.sceneBox(s).x1).toBeGreaterThanOrEqual(300);
    expect(base.x1).toBeLessThan(300);
  });
});

/* ══════════════ Lecteur de mission (rollout 2026-11-10, unité 9 leçon 3 ; conseil du 2026-11-10, verdict L3.1–L3.7) ══════════════ */

/** Gradue un rail avec une ouverture donnée. */
const grad = (s, rail, n, open) => carryN(open == null ? s : L.setOpening(s, open), n, rail);
const ruler = (s, a, b) => L.commitRuler(L.setEnd(L.setEnd(s, 'a', a), 'b', b));

describe('segment-divider — the mission player options', () => {
  it('the page is unchanged: no option → mixed units are still judged on their ratio, mark 1 still joins', () => {
    let s = grad(grad(L.init({ mode: 'ratio', p: 2, q: 3 }), 'a-', 2, 15), 'b+', 3, 10);
    s = ruler(s, -30, 30);
    expect(s.joins.at(-1)).toMatchObject({ kind: 'units', mixed: true });      // the page's « right count, another unit » (its ratio is shown)
    expect(L.evidenceOf(s).ratio).toBe('1');
    expect(L.join(carryN(L.init({ parts: 3 }), 3), 0).joined).toBe(0);
  });

  it('`sameUnitOnly` (L3.1): a ruler on graduations of two openings is REFUSED as `units`, whatever its ratio — and carries no ratio', () => {
    const base = L.init({ mode: 'ratio', p: 2, q: 3, marks: 3, sameUnitOnly: true, player: true });
    // 2 × 12 mm on (d₁), 3 × 8 mm on (d₂): by luck the lengths are 24 / 24 → the page would say « other » ; here: units
    let s = grad(grad(base, 'a-', 2, 12), 'b+', 3, 8);
    s = ruler(s, -24, 24);
    expect(s.joins.at(-1)).toMatchObject({ kind: 'units', ok: false, mixed: true });
    expect(L.evidenceOf(s)).toMatchObject({ kind: 'units', ratio: null, t: null });
    // 3 × 12 against 3 × 9 would give the ratio 4/3 — the climax's: never judged, never written
    let c = grad(grad(base, 'a-', 3, 12), 'b+', 3, 9);
    c = ruler(c, -36, 27);
    expect(T(c.joins.at(-1).ratio)).toBe('4/3');
    expect(c.joins.at(-1).kind).toBe('units');
    expect(L.evidenceOf(c).ratio).toBeNull();
    // a rail graduated with two openings is mixed too
    let m = L.carry(L.setOpening(grad(base, 'a-', 1, 12), 9), 'a-');      // (d₁): 12 mm then 9 mm
    m = grad(m, 'b+', 3, 9);
    expect(ruler(m, -21, 27).joins.at(-1).kind).toBe('units');
    // one opening everywhere: judged on the ranks
    const ok = ruler(grad(grad(base, 'a-', 2, 9), 'b+', 3, 9), -18, 27);
    expect(ok.joins.at(-1)).toMatchObject({ kind: 'inside', ok: true, mixed: false, rankA: 2, rankB: 3 });
    expect(T(ok.joins.at(-1).t)).toBe('2/5');
  });

  it('the cap: `marks: 3` holds three graduations per rail and no more', () => {
    const s = grad(L.init({ mode: 'ratio', p: 2, q: 3, marks: 3, sameUnitOnly: true }), 'a+', 4);
    expect(s.rails['a+']).toHaveLength(3);
    expect(s.last.kind).toBe('full');
    expect(() => L.init({ mode: 'ratio', p: 4, q: 3, marks: 3 })).toThrow();     // the climax ratio cannot even be asked with the cap
  });

  it('with one unit and the cap 3, the reachable ratios are 1/3, 1/2, 2/3, 1, 3/2, 2, 3 — never 4/3 nor 3/4; t never 4/7 nor 3/7', () => {
    const base = grad(grad(grad(grad(L.init({ mode: 'ratio', p: 2, q: 3, marks: 3, sameUnitOnly: true, player: true }), 'a-', 3, 10), 'a+', 3), 'b-', 3), 'b+', 3);
    const ratios = new Set(); const ts = new Set();
    for (const a of L.lineMarks(base, 'a')) for (const b of L.lineMarks(base, 'b')) {
      const j = ruler(base, a, b).joins.at(-1);
      if (j.parallel) continue;
      expect(j.kind).not.toBe('units');
      ratios.add(T(j.ratio)); ts.add(T(j.t).replace('-', ''));
    }
    expect([...ratios].sort()).toEqual(['1', '1/2', '1/3', '2', '2/3', '3', '3/2']);
    ['4/3', '3/4'].forEach((x) => expect(ratios.has(x)).toBe(false));
    ['4/7', '3/7', '4'].forEach((x) => expect(ts.has(x)).toBe(false));
  });

  it('player: joining mark 1 is refused and is not a trial; the same ruler twice is one trial', () => {
    const s = carryN(L.init({ parts: 3, player: true }), 3);
    const r = L.join(s, 0);
    expect(r.joined).toBeNull();
    expect(r.last.kind).toBe('joinOne');
    expect(r.trials).toHaveLength(0);
    let x = grad(grad(grad(L.init({ mode: 'ratio', p: 2, q: 3, marks: 3, sameUnitOnly: true, player: true }), 'a-', 2, 10), 'a+', 2), 'b+', 3);
    x = ruler(x, -20, 30);
    x = ruler(x, 20, 30);
    expect(x.joins).toHaveLength(2);
    x = ruler(x, -20, 30);                      // back on the first ruler: shown again, not appended
    expect(x.joins).toHaveLength(2);
    expect(x.last.join.kind).toBe('inside');
    expect(L.joinAtEnds(x).kind).toBe('inside');
    expect(L.verdictOf(x)).toEqual({ groups: 1, exact: true });
  });

  it('verdictOf: equal → the joined rank; ratio → 1 inside, 2 outside, 0 otherwise', () => {
    let e = drawAll(L.join(carryN(L.init({ parts: 3, player: true, length: 8 }), 3), 1));
    expect(L.verdictOf(e)).toEqual({ groups: 2, exact: false });
    e = drawAll(L.join(carryN(L.fresh(e), 3), 2));
    expect(L.verdictOf(e)).toEqual({ groups: 3, exact: true });
    expect(L.lengthTex(e, e.trials.at(-1).parts[0])).toBe('\\dfrac{8}{3} \\approx 2{,}67');
    let x = grad(grad(grad(L.init({ mode: 'ratio', p: 2, q: 3, marks: 3, sameUnitOnly: true, player: true }), 'a-', 2, 10), 'a+', 3), 'b+', 3);
    expect(L.verdictOf(ruler(x, 20, 30))).toEqual({ groups: 2, exact: true });
    expect(L.verdictOf(ruler(x, 30, 20))).toEqual({ groups: 0, exact: false });   // inverted
    x = ruler(x, 30, 30);
    expect(x.joins.at(-1).parallel).toBe(true);
    expect(L.verdictOf(x)).toEqual({ groups: 0, exact: false });
  });

  it('a construction redone EXACTLY is not a new trial; redone with another opening it shows the same cut points', () => {
    const one = (s, open) => drawAll(L.join(carryN(L.setOpening(L.fresh(s), open), 3), 2));
    let s = one(L.init({ parts: 3, player: true }), 15);
    expect(L.repeatedTrial(s)).toBe(false);
    s = one(s, 15);
    expect(L.repeatedTrial(s)).toBe(true);
    expect(L.sameCutsAgain(s)).toBe(false);
    expect(L.discoveryReady(s)).toBe(false);
    s = one(s, 20);
    expect(L.repeatedTrial(s)).toBe(false);
    expect(L.sameCutsAgain(s)).toBe(true);
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.cutsOf(s).map((c) => T(c.t))).toEqual(['1/3', '2/3']);
  });

  it('predictions: options, truths (« same side » → before A when p < q, AFTER B when p > q — L3.7), judged by the field', () => {
    const e3 = L.init({ parts: 3 }); const e5 = L.init({ parts: 5 });
    expect(L.predictOptions(e3, 'joinWhich')).toEqual([2, 3, 4]);
    expect(L.predictOptions(e5, 'joinWhich')).toEqual([5, 6, 4]);
    expect(L.predictOptions(e5, 'parallels')).toEqual([5, 6, 4]);
    expect([L.predictTruth(e3, 'joinWhich'), L.predictTruth(e5, 'joinWhich'), L.predictTruth(e5, 'parallels')]).toEqual([3, 5, 4]);
    // the right option never sits at the same place twice in a row: r1 2nd ; r2 1st then 3rd
    const place = (lab, key) => L.predictOptions(lab, key).indexOf(L.predictTruth(lab, key));
    expect([place(e3, 'joinWhich'), place(e5, 'joinWhich'), place(e5, 'parallels')]).toEqual([1, 0, 2]);
    const r23 = L.init({ mode: 'ratio', p: 2, q: 3, marks: 3 }); const r32 = L.init({ mode: 'ratio', p: 3, q: 2, marks: 3 });
    expect(L.predictTruth(r23, 'opposite')).toBe('between');
    expect(L.predictTruth(r23, 'same')).toBe('before');
    expect(L.predictTruth(r32, 'same')).toBe('after');
    expect(L.predictTruth(L.init({ mode: 'ratio', p: 2, q: 1, marks: 3 }), 'same')).toBe('after');
    expect([place(r23, 'opposite'), place(r23, 'same'), place(r32, 'same')]).toEqual([1, 2, 0]);
    // the truth of « same » is what the lab then shows: the outside point's t is negative (before A) or > 1 (after B)
    let x = grad(grad(L.init({ mode: 'ratio', p: 2, q: 3, marks: 3, sameUnitOnly: true, player: true }), 'a+', 2, 10), 'b+', 3);
    x = ruler(x, 20, 30);
    expect(LIN.cmp(x.joins.at(-1).t, LIN.frac(0)) < 0).toBe(true);
    expect(L.judgedPredictions(x, ['opposite', 'same'])).toEqual(['same']);
    expect(L.judgedPredictions(x, ['opposite', 'same'], true)).toEqual(['opposite', 'same']);
    let y = grad(grad(L.init({ mode: 'ratio', p: 3, q: 2, marks: 3, sameUnitOnly: true, player: true }), 'a+', 3, 10), 'b+', 2);
    y = ruler(y, 30, 20);
    expect(T(y.joins.at(-1).t)).toBe('3');
    expect(L.judgedPredictions(carryN(e3, 3), ['joinWhich'])).toEqual([]);
  });

  it('the coach shows the gesture, never the answer: no mark count, no rank, no side', () => {
    const e = L.init({ parts: 3, player: true });
    expect(L.coachOf(e)).toMatchObject({ id: 'carry', target: '[data-sd-ghost="ray"]' });
    expect(L.coachOf(carryN(e, 1)).id).toBe('join');
    expect(L.coachOf(carryN(e, 3)).id).toBe('join');
    const j = L.join(carryN(e, 3), 2);
    expect(L.coachOf(j).id).toBe('square');
    expect(L.coachOf(drawAll(j)).id).toBe('fresh');
    expect(L.coachOf(drawAll(j), { done: true })).toBeNull();
    const r = L.init({ mode: 'ratio', p: 2, q: 3, marks: 3, sameUnitOnly: true, player: true });
    expect(L.coachOf(r).id).toBe('carryA');
    const a = grad(r, 'a-', 2, 10);
    expect(L.coachOf(a)).toBeNull();                         // one line graduated: no bubble (it covered the next mark)
    const ab = grad(grad(a, 'a+', 2), 'b+', 3);
    expect(L.coachOf(ab).id).toBe('endA');
    expect(L.coachOf(L.setEnd(ab, 'a', -20)).id).toBe('endB');
    expect(L.coachOf(ruler(ab, -20, 30)).id).toBe('second');
    expect(L.coachOf(ruler(ruler(ab, -20, 30), 20, 30))).toBeNull();
    // the ruler steps wait for a pause (they would cover the next dotted mark); the equal steps never do
    expect([L.coachOf(ab).idle, L.coachOf(ruler(ab, -20, 30)).idle, L.coachOf(e).idle, L.coachOf(j).idle]).toEqual([true, true, undefined, undefined]);
    expect(L.COACH_IDLE_MS).toBeGreaterThanOrEqual(3000);
    [e, carryN(e, 1), j, a, ab].forEach((s) => expect(JSON.stringify(L.coachOf(s))).not.toMatch(/\d(?!["\]])/));
  });

  it('shownValues lists every length, rank pair, ratio and t a round can show', () => {
    const eq = L.shownValues({ mode: 'equal', parts: 3, length: 8 });
    expect(eq.filter((x) => x.role === 'length').map((x) => x.v)).toEqual(['8', '8/3', '2,67']);
    const ra = L.shownValues({ mode: 'ratio', p: 2, q: 3, marks: 3, chains: 'full' });
    expect([...new Set(ra.filter((x) => x.role === 'ratio').map((x) => x.v))].sort()).toEqual(['1', '1/2', '1/3', '2', '2/3', '3', '3/2']);
    expect(new Set(ra.filter((x) => x.role === 'rank').map((x) => x.v))).toEqual(new Set(['1', '2', '3']));
    expect(ra.filter((x) => x.role === 'pair')).toHaveLength(9);
    expect(ra.some((x) => x.role === 'decoy-t' && x.v === '3/5')).toBe(true);
    expect(L.shownValues({ mode: 'ratio', p: 1, q: 3, marks: 3, chains: 'none' }).some((x) => x.role.startsWith('decoy'))).toBe(false);
    const free = L.shownValues({ mode: 'equal', parts: 3, length: 12, choices: [{ mode: 'equal', parts: 5, length: 12 }, { mode: 'ratio', p: 3, q: 2, marks: 3 }] });
    expect(free.some((x) => x.role === 'length' && x.v === '12/5')).toBe(true);
    expect(free.some((x) => x.role === 'ratio' && x.v === '3/2')).toBe(true);
  });
});

describe('segment-divider — review fixes (2026-11-10)', () => {
  it('a ruler on the same positions and ranks but OTHER openings is judged again (8 + 12 lands where 10 + 10 did)', () => {
    const base = L.init({ mode: 'ratio', p: 2, q: 3, marks: 3, sameUnitOnly: true, player: true });
    let s = ruler(grad(grad(base, 'a-', 2, 10), 'b+', 3, 10), -20, 30);
    expect(s.joins.at(-1).kind).toBe('inside');
    s = L.fresh(s);
    s = L.carry(L.setOpening(L.carry(L.setOpening(s, 8), 'a-'), 12), 'a-');     // (d₁): 8 then 12 → the 2nd mark at 20 again
    s = grad(s, 'b+', 3, 10);
    expect(L.joinAtEnds(L.setEnd(L.setEnd(s, 'a', -20), 'b', 30))).toBeNull();   // not the old « inside »
    s = ruler(s, -20, 30);
    expect(s.joins).toHaveLength(2);
    expect(s.joins.at(-1)).toMatchObject({ kind: 'units', ok: false, mixed: true });
    expect(L.joinAtEnds(s).kind).toBe('units');
    expect(L.verdictOf(s)).toEqual({ groups: 0, exact: false });
  });
});
