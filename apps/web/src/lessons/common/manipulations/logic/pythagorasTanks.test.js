import { describe, it, expect } from 'vitest';
import * as L from './pythagorasTanks';
import { LEVELS } from '../levels';

const angleLab = () => L.init(LEVELS['pythagoras-tanks'].beginner.numbers);
const lengthLab = () => L.init(LEVELS['pythagoras-tanks'].advanced.numbers);

/** Joue un geste désigné par le guide — la poignée part toujours vers l'angle droit (un élève qui cherche). */
function follow(s0, { maxSteps = 400, strategy } = {}) {
  let s = s0;
  const seen = [];
  for (let k = 0; k < maxSteps; k += 1) {
    const c = L.coachOf(s);
    if (!c) return { s, seen };
    seen.push(c.id);
    if (c.target === '[data-pt-pour]') s = L.pour(s);
    else if (c.target === '[data-pt-next]') s = L.nextTask(s);
    else if (c.target === '[data-pt-root]') s = L.useRoot(s);
    else if (c.target === '[data-pt-stepper]') s = strategy(s);
    else throw new Error(`cible inconnue ${c.target}`);
  }
  throw new Error('le guide ne se termine pas');
}

describe('pythagoras-tanks — mode angle (مبتدئ, 3 et 4)', () => {
  it('l’eau vaut 25, le grand bassin BC² : plein juste à 90° seulement', () => {
    let s = angleLab();
    expect(s.angle).toBe(60);
    expect(L.amounts(s).waterN).toBe(25);
    for (let d = L.ANGLE_MIN; d <= L.ANGLE_MAX; d += 1) {
      s = L.setAngle(s, d);
      const v = L.verdictOf(s);
      expect(v).toBe(d === 90 ? 'exact' : d < 90 ? 'over' : 'gap');
      const a = L.amounts(s);
      if (d < 90) expect(a.cap).toBeLessThan(25);
      if (d > 90) expect(a.cap).toBeGreaterThan(25);
    }
    expect(L.amounts(L.setAngle(s, 90)).cap).toBe(25);
  });

  it('un versement est un essai : débordement, vide, plein — et la tâche « compare » demande les trois', () => {
    let s = angleLab();
    s = L.pour(s); // 60° : déborde
    expect(s.pour.verdict).toBe('over');
    expect(s.last.diff).toBe(L.show(25 - L.amounts(s).cap));
    expect(L.taskDone(s)).toBe(false);
    s = L.setAngle(s, 90);
    expect(s.pour).toBeNull();
    s = L.pour(s);
    expect(s.pour.verdict).toBe('exact');
    expect(s.last.kind).toBe('task');
    expect(L.canNext(s)).toBe(true);
    s = L.nextTask(s);
    expect(L.taskOf(s)).toBe('compare');
    expect(L.discoveryReady(s)).toBe(false);
    s = L.pour(L.setAngle(s, 120));
    expect(s.pour.verdict).toBe('gap');
    expect(L.discoveryReady(s)).toBe(true);
    const w = L.witnesses(s);
    expect(w.over.angle).toBe(60);
    expect(w.gap.angle).toBe(120);
    expect(w.exact.angle).toBe(90);
  });

  it('les angles sont entiers et bornés', () => {
    let s = angleLab();
    s = L.setAngle(s, 12);
    expect(s.angle).toBe(L.ANGLE_MIN);
    s = L.setAngle(s, 89.6);
    expect(s.angle).toBe(90);
    s = L.nudge(s, 1);
    expect(s.angle).toBe(91);
  });

  it('le guide mène au bout (un élève qui s’approche de 90° par la gauche, puis l’ouvre)', () => {
    const strategy = (s) => {
      if (L.taskOf(s) === 'compare') return L.setAngle(s, s.trials.some((t) => t.verdict === 'over' && t.task === 'compare') ? 130 : 70);
      return L.setAngle(s, s.angle < 90 ? Math.min(90, s.angle + 10) : 90);
    };
    const { s, seen } = follow(angleLab(), { strategy });
    expect(L.discoveryReady(s)).toBe(true);
    expect(seen[0]).toBe('turn');
    expect(seen).toContain('pour');
    expect(seen).toContain('next');
    expect(seen).toContain('turn2');
  });
});

describe('pythagoras-tanks — mode longueur (متقدم, 5 et 12 puis 2 et 3)', () => {
  it('le ruban au dixième ; 13 remplit, 12,9 et 13,1 non', () => {
    let s = lengthLab();
    const { lo, hi } = L.tapeRange(s);
    expect(lo).toBeLessThan(130);
    expect(hi).toBeGreaterThan(130);
    for (let t = lo; t <= hi; t += 1) {
      s = L.setTenths(s, t);
      expect(L.verdictOf(s)).toBe(t === 130 ? 'exact' : t < 130 ? 'over' : 'gap');
    }
  });

  it('2 et 3 : aucun dixième ne remplit ; la touche √ s’ouvre après deux versements et donne √13', () => {
    let s = lengthLab();
    s = L.pour(L.setTenths(s, 130));
    expect(s.pour.verdict).toBe('exact');
    s = L.nextTask(s);
    expect(L.legsOf(s)).toEqual({ b: '2', c: '3' });
    const { lo, hi } = L.tapeRange(s);
    for (let t = lo; t <= hi; t += 1) expect(L.verdictOf(L.setTenths(s, t))).not.toBe('exact');
    expect(L.canRoot(s)).toBe(false);
    s = L.pour(L.setTenths(s, 36)); // 3,6² = 12,96 < 13 : le grand bassin est trop petit
    expect(s.pour.verdict).toBe('over');
    s = L.pour(L.setTenths(s, 37)); // 3,7² = 13,69 > 13
    expect(s.pour.verdict).toBe('gap');
    expect(L.canRoot(s)).toBe(true);
    s = L.useRoot(s);
    expect(s.last).toMatchObject({ kind: 'root', value: '√13', screen: '3,605551275', rounded: '3,61' });
    expect(L.bcOf(s).text).toBe('√13');
    s = L.pour(s);
    expect(s.pour.verdict).toBe('exact');
    expect(s.pour.root).toBe(true);
    expect(L.discoveryReady(s)).toBe(true);
    const f = L.formalOf(s);
    expect(f).toMatchObject({ bb: '25', cc: '144', sum: '169', bc: '13' });
    expect(f.surd).toMatchObject({ sum: '13', text: '√13', rounded: '3,61' });
  });

  it('le guide mène au bout', () => {
    const strategy = (s) => {
      if (L.taskOf(s) === 'thirteen') return L.setTenths(s, s.tenths < 130 ? Math.min(130, s.tenths + 7) : 130);
      return L.setTenths(s, s.tenths === 36 ? 37 : 36);
    };
    const { s, seen } = follow(lengthLab(), { strategy });
    expect(L.discoveryReady(s)).toBe(true);
    expect(seen).toEqual(expect.arrayContaining(['stretch', 'pour', 'next', 'root', 'pourRoot']));
  });
});

describe('pythagoras-tanks — جرّب أعدادك (jamais compté)', () => {
  it('une machine libre ne fait ni tâche ni découverte', () => {
    let s = angleLab();
    s = L.setFree(s, 6, 8);
    expect(L.isFree(s)).toBe(true);
    expect(L.amounts(s).waterN).toBe(100);
    s = L.pour(L.setAngle(s, 90));
    expect(s.pour.verdict).toBe('exact');
    expect(s.last.free).toBe(true);
    expect(L.taskDone(s)).toBe(false);
    expect(L.coachOf(s)).toBeNull();
    s = L.toGuided(s);
    expect(L.isFree(s)).toBe(false);
    expect(L.taskOf(s)).toBe('fill');
    expect(L.setFree(s, 40, 0).free).toEqual({ b: '12', c: '1' });
  });

  it('en mode longueur la touche √ est ouverte tout de suite en libre', () => {
    const s = L.setFree(lengthLab(), 1, 1);
    expect(L.canRoot(s)).toBe(true);
    expect(L.useRoot(s).last.value).toBe('√2');
  });
});

describe('pythagoras-tanks — géométrie (dessin)', () => {
  it('trois carrés extérieurs, d’aires b², c², BC²', () => {
    for (const d of [30, 60, 90, 120, 150]) {
      const m = L.machine('3', '4', d);
      expect(L.polyArea(m.sqAB)).toBeCloseTo(16, 6);
      expect(L.polyArea(m.sqAC)).toBeCloseTo(9, 6);
      const bc2 = (m.B[0] - m.C[0]) ** 2 + (m.B[1] - m.C[1]) ** 2;
      expect(L.polyArea(m.sqBC)).toBeCloseTo(bc2, 6);
      // le carré sur AB est sous la table (y ≤ 0), le grand carré du côté opposé à A
      expect(Math.max(...m.sqAB.map((p) => p[1]))).toBeCloseTo(0, 9);
    }
  });

  it('l’eau d’un bassin a l’aire voulue sous une surface horizontale', () => {
    const m = L.machine('3', '4', 70);
    for (const area of [0.5, 3, 9, 15, 20]) {
      const big = L.polyArea(m.sqBC);
      const want = Math.min(area, big);
      const w = L.waterIn(m.sqBC, want);
      expect(L.polyArea(w.poly)).toBeCloseTo(want, 5);
      if (want < big) w.poly.forEach((p) => expect(p[1]).toBeLessThanOrEqual(w.level + 1e-9));
    }
  });

  it('un versement complet : les petits bassins vides, le grand plein, l’excès = eau − contenance', () => {
    let s = angleLab();
    s = L.setAngle(s, 60);
    const f = L.pourFrame(s, 1);
    expect(f.ab.poly).toEqual([]);
    expect(f.ac.poly).toEqual([]);
    expect(L.polyArea(f.bc.poly)).toBeCloseTo(L.amounts(s).cap, 5);
    expect(f.spill).toBeCloseTo(25 - L.amounts(s).cap, 6);
    const g = L.pourFrame(L.setAngle(s, 120), 1);
    expect(g.spill).toBe(0);
    expect(g.gap).toBeGreaterThan(0);
  });

  it('la boîte de toute la course contient chaque position', () => {
    const box = L.sweepBox('3', '4');
    for (let d = L.ANGLE_MIN; d <= L.ANGLE_MAX; d += 5) {
      const m = L.machine('3', '4', d);
      for (const p of [...m.sqAB, ...m.sqAC, ...m.sqBC]) {
        expect(p[0]).toBeGreaterThanOrEqual(box.x0 - 1e-9);
        expect(p[0]).toBeLessThanOrEqual(box.x1 + 1e-9);
        expect(p[1]).toBeGreaterThanOrEqual(box.y0 - 1e-9);
        expect(p[1]).toBeLessThanOrEqual(box.y1 + 1e-9);
      }
    }
  });
});

describe('pythagoras-tanks — les étiquettes ne se touchent jamais', () => {
  // la largeur et la hauteur des pilules de la scène (primitives/SvgPill.jsx : pillWidth, hauteur = 1,9 × taille)
  const pillW = (text, size) => { let w = 0; for (const ch of String(text)) w += ch === ' ' ? 0.32 : /[0-9]/.test(ch) ? 0.6 : 0.56; return Math.round(w * size + size * 1.3); };
  const check = (b, c, deg, scale, opts, texts) => {
    const m = L.machine(b, c, deg);
    const size = Math.max(12, Math.min(17, scale * 0.42));
    const boxes = L.labelBoxes(L.labelPlan(m, opts), scale, (id) => pillW(texts[id], size), Math.round(size * 1.9));
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        expect(L.boxesMeet(boxes[i], boxes[j]), `${b}/${c} à ${deg}° (${scale} px/u) : ${boxes[i].id} × ${boxes[j].id}`).toBe(false);
      }
    }
  };
  // les échelles mesurées dans le navigateur : la plus petite (1024 × 768, colonne de 414 px) et la plus grande (1920 × 1080)
  const SCALES = { '3/4': [26, 70], '5/12': [9, 30], '2/3': [34, 95] };
  it('mode angle (3 et 4) : AB et AC (avec l’eau de leur bassin), puis la contenance, sur 30° … 150°', () => {
    for (const scale of SCALES['3/4']) {
      const size = Math.max(12, Math.min(17, scale * 0.42));
      const texts = { AB: L.sideText('AB', 4, 16, 4 * scale, (t) => pillW(t, size)), AC: L.sideText('AC', 3, 9, 3 * scale, (t) => pillW(t, size)), capacity: '≈ 37,37 cm²' };
      for (let d = L.ANGLE_MIN; d <= L.ANGLE_MAX; d += 1) {
        check('3', '4', d, scale, {}, texts);
        check('3', '4', d, scale, { capacity: true }, { ...texts, AB: 'AB = 4', AC: 'AC = 3' });
      }
    }
  });
  it('mode longueur (5 et 12, puis 2 et 3) : AB, AC, BC et les aires sur toute la course du ruban', () => {
    for (const [b, c, key] of [['5', '12', '5/12'], ['2', '3', '2/3']]) {
      for (const scale of SCALES[key]) {
        const size = Math.max(12, Math.min(17, scale * 0.42));
        const texts = { AB: L.sideText('AB', c, c * c, c * scale, (t) => pillW(t, size)), AC: L.sideText('AC', b, b * b, b * scale, (t) => pillW(t, size)), BC: `BC = ${(Math.round(Math.sqrt(b * b + c * c) * 10) / 10).toString().replace('.', ',')}`, capacity: '108,16 cm²' };
        for (let d = L.TAPE_ANGLES[0]; d <= L.TAPE_ANGLES[1]; d += 1) {
          check(b, c, d, scale, { withBC: true }, texts);
          check(b, c, d, scale, { withBC: true, capacity: true }, { ...texts, AB: `AB = ${c}`, AC: `AC = ${b}` });
        }
      }
    }
  });
});
