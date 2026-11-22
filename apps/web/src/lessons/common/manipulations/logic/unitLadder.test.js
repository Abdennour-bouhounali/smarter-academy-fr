import { describe, it, expect } from 'vitest';
import * as L from './unitLadder';
import * as T from '@smarter-academy/core/arithmetic/tenPowers.js';
import { LEVELS } from '../levels';

const cur = (s) => L.taskOf(s);
/** Mène la poignée à la plaque `u` du mode courant. */
const to = (s, u) => L.moveTo(s, L.plaquePos(u, s.mode));
/** Résout la tâche courante comme un élève juste (prédiction juste, mode juste, rubans enchaînés). */
function solve(s) {
  const t = cur(s);
  let r = s;
  if (L.predictionPending(r)) r = L.choosePrediction(r, t.predict.correct);
  if (!L.modeOk(r)) r = L.setMode(r, t.mode);
  for (let h = 0; h < t.path.length - 1; h += 1) { r = to(r, t.path[h + 1]); r = L.dock(r); }
  return r;
}

describe('unit-ladder — la règle et ses plaques', () => {
  it('les plaques commencent à la frontière de leur exposant (longueur, aire, volume)', () => {
    expect(L.plaquePos('km', 1)).toBe(0);
    expect(L.plaquePos('m', 1)).toBe(3);
    expect(L.plaquePos('mm', 1)).toBe(6);
    expect(L.plaquePos('um', 1)).toBe(9);
    expect(L.plaquePos('nm', 1)).toBe(12);
    expect(L.plaquePos('m', 2)).toBe(6);
    expect(L.plaquePos('mm', 2)).toBe(12);
    expect(L.plaquePos('dm', 3)).toBe(3);
    expect(L.plaquePos('km', 3)).toBeNull();
    expect(L.totalColumns(1)).toBe(13);
    expect(L.totalColumns(2)).toBe(14);
    expect(L.totalColumns(3)).toBe(12);
  });
  it('bandOf = unitColumns du cœur pour toute paire et tout mode', () => {
    for (const mode of L.MODES) for (const a of L.UNITS[mode]) for (const b of L.UNITS[mode]) expect(L.bandOf(a, b, mode), `${a}${b}${mode}`).toBe(T.unitColumns(a, b, mode));
  });
  it('unitAt : frontière de plaque, milieu de plaque et colonne vide', () => {
    expect(L.unitAt(3, 1)).toBe('m');
    expect(L.unitAt(7, 1)).toBeNull();
    expect(L.unitAt(3, 2)).toBeNull();
    expect(L.unitAt(6, 2)).toBe('m');
  });
  it('snap reste dans la règle', () => {
    expect(L.snap(-4, 1)).toBe(0);
    expect(L.snap(99, 1)).toBe(13);
    expect(L.snap(2.6, 1)).toBe(3);
  });
  it('facteur décimal', () => {
    expect(L.factorText(5)).toBe('100\u00A0000');
    expect(L.factorText(-6)).toBe('0,000001');
  });
});

describe('unit-ladder — les tâches', () => {
  it('chaque tâche des deux niveaux se construit et son total est celui du cœur', () => {
    for (const key of ['beginner', 'advanced']) for (const raw of L.PRESETS[key].tasks) {
      const t = L.buildTask(raw);
      expect(t.total, raw.id).toBe(T.unitColumns(t.path[0], t.path.at(-1), t.mode));
      if (raw.predict) expect(raw.predict.options[raw.predict.correct]).toBe(t.total);
    }
    expect(() => L.buildTask({ id: 'x', path: ['km', 'm'], mode: 3 })).toThrow();
    expect(() => L.buildTask({ id: 'x', path: ['m', 'm'], mode: 1 })).toThrow();
    expect(() => L.buildTask({ id: 'x', path: ['km', 'nm'], mode: 2 })).toThrow();
  });
  it('les niveaux de levels.js sont les presets de la logique', () => {
    expect(LEVELS['unit-ladder'].beginner.numbers).toEqual({ mode: 1, fixedMode: true, showFactor: true, discovery: 'gap', tasks: L.PRESETS.beginner.tasks });
    expect(LEVELS['unit-ladder'].advanced.numbers).toEqual({ mode: 1, fixedMode: false, showFactor: false, discovery: 'tables', tasks: L.PRESETS.advanced.tasks });
  });
  it('totaux attendus : 6, 5, 3 ; 6, 6, −6, 3', () => {
    expect(L.PRESETS.beginner.tasks.map((r) => L.buildTask(r).total)).toEqual([6, 5, 3]);
    expect(L.PRESETS.advanced.tasks.map((r) => L.buildTask(r).total)).toEqual([6, 6, -6, 3]);
  });
});

describe('unit-ladder — le ruban', () => {
  it('prédiction obligatoire avant de tendre ; deux rubans enchaînés puis le total (u1)', () => {
    let s = L.init(LEVELS['unit-ladder'].beginner.numbers);
    expect(L.predictionPending(s)).toBe(true);
    expect(L.moveTo(s, 3)).toBe(s);
    s = L.choosePrediction(s, 1);
    s = to(s, 'm');
    expect(L.currentK(s)).toBe(3);
    s = L.dock(s);
    expect(s.hop).toBe(1);
    expect(s.bands).toEqual([{ from: 'km', to: 'm', k: 3 }]);
    expect(s.handle).toBe(3);
    s = to(s, 'mm');
    expect(L.currentK(s)).toBe(3);
    s = L.dock(s);
    expect(L.taskDone(s)).toBe(true);
    expect(s.bands.map((b) => b.k)).toEqual([3, 3]);
    expect(s.wobble).toEqual({ count: 6, choice: 9 });
    expect(s.trials.filter((e) => e.kind === 'hop').map((e) => e.k)).toEqual([3, 3]);
    expect(s.trials.find((e) => e.kind === 'predict')).toMatchObject({ choice: 9, ok: false });
    expect(s.trials.find((e) => e.kind === 'solved')).toMatchObject({ k: 6, mode: 1 });
  });
  it('de part et d’autre du mètre : km → cm est 5 (u2) en passant le mètre', () => {
    let s = L.init(LEVELS['unit-ladder'].beginner.numbers);
    s = solve(s); s = L.nextTask(s);
    expect(cur(s).id).toBe('u2');
    expect(s.handle).toBe(0);
    s = L.choosePrediction(s, 0);
    s = to(s, 'cm');
    expect(L.currentK(s)).toBe(5);
    s = L.dock(s);
    expect(L.taskDone(s)).toBe(true);
    expect(s.wobble).toBeNull();
  });
  it('refus : mauvaise plaque, milieu de plaque (aire), mauvais mode — chacun laisse un essai', () => {
    let s = L.init(LEVELS['unit-ladder'].advanced.numbers);
    expect(L.modeOk(s)).toBe(false);
    s = L.moveTo(s, 3);
    const wrongMode = L.dock(s);
    expect(wrongMode.last).toMatchObject({ kind: 'refused', reason: 'mode' });
    s = L.setMode(s, 2);
    expect(s.mode).toBe(2);
    expect(s.handle).toBe(0);
    s = L.moveTo(s, 3);
    expect(L.dock(s).last).toMatchObject({ reason: 'mid-plaque', k: 3 });
    s = L.moveTo(s, 4);
    expect(L.dock(s).last).toMatchObject({ reason: 'wrong-unit', k: 4, to: 'dam' === L.unitAt(4, 2) ? 'dam' : L.unitAt(4, 2) });
    s = to(s, 'm');
    const ok = L.dock(s);
    expect(L.taskDone(ok)).toBe(true);
    expect(ok.trials.filter((e) => e.kind === 'refused')).toHaveLength(0);
    expect(wrongMode.trials.filter((e) => e.kind === 'refused')[0]).toMatchObject({ reason: 'mode' });
  });
  it('aire : 1 mm² = 10⁻⁶ m² → ruban de −6 vers la grande unité (u6)', () => {
    let s = L.init(LEVELS['unit-ladder'].advanced.numbers);
    for (let i = 0; i < 2; i += 1) { s = solve(s); s = L.nextTask(s); }
    expect(cur(s).id).toBe('u6');
    s = L.setMode(s, 2);
    expect(s.handle).toBe(12);
    s = to(s, 'm');
    expect(L.currentK(s)).toBe(-6);
    expect(L.factorText(L.currentK(s))).toBe('0,000001');
    s = L.dock(s);
    expect(L.taskDone(s)).toBe(true);
  });
  it('clavier : un pas = une colonne', () => {
    let s = L.init(LEVELS['unit-ladder'].beginner.numbers);
    s = L.choosePrediction(s, 0);
    s = L.step(s, 1); s = L.step(s, 1);
    expect(s.handle).toBe(2);
    s = L.step(L.step(L.step(s, -1), -1), -1);
    expect(s.handle).toBe(0);
  });
  it('le mode est figé au niveau mبتدئ', () => {
    const s = L.init(LEVELS['unit-ladder'].beginner.numbers);
    expect(L.setMode(s, 2)).toBe(s);
  });
});

describe('unit-ladder — « جرّب أعدادك »', () => {
  it('valide, refuse et ne compte rien', () => {
    expect(L.validateFree({ from: 'km', to: 'nm', mode: 1 }).ok).toBe(true);
    expect(L.validateFree({ from: 'km', to: 'km', mode: 1 }).why).toBe('same');
    expect(L.validateFree({ from: 'km', to: 'nm', mode: 2 }).why).toBe('unit');
    expect(L.validateFree({ from: 'km', to: 'm', mode: 4 }).why).toBe('mode');
    let s = L.init(LEVELS['unit-ladder'].advanced.numbers);
    s = L.setFree(s, { from: 'km', to: 'mm', mode: 2 });
    expect(s.mode).toBe(2);
    s = to(s, 'mm'); s = L.dock(s);
    expect(L.taskDone(s)).toBe(true);
    expect(s.trials.every((e) => e.free)).toBe(true);
    expect(s.done.every((d) => !d)).toBe(true);
    s = L.toGuided(s);
    expect(s.free).toBeNull();
  });
});

describe('unit-ladder — le guide (coachOf)', () => {
  it('chaque tâche des deux niveaux est suivie jusqu’au bout', () => {
    for (const nums of [LEVELS['unit-ladder'].beginner.numbers, LEVELS['unit-ladder'].advanced.numbers]) {
      let s = L.init(nums);
      for (let i = 0; i < s.tasks.length; i += 1) {
        const t = cur(s);
        if (t.predict) { expect(L.coachOf(s).id).toBe('predict'); s = L.choosePrediction(s, t.predict.correct); }
        if (!nums.fixedMode) { expect(L.coachOf(s).id).toBe('mode'); s = L.setMode(s, t.mode); }
        expect(L.coachOf(s).id).toBe('handle');
        s = L.moveTo(s, L.plaquePos(t.path[1], s.mode));
        expect(L.coachOf(s).id).toBe('readout');
        s = L.step(L.step(s, 1), -1);
        expect(L.coachOf(s).id).toBe('dock');
        for (let h = 1; h < t.path.length - 1; h += 1) { s = L.dock(s); s = to(s, t.path[h + 1]); }
        s = L.dock(s);
        expect(L.taskDone(s)).toBe(true);
        const c = L.coachOf(s);
        if (i < s.tasks.length - 1) { expect(c.id).toBe('next'); s = L.nextTask(s); } else expect(c === null || c.id === 'free').toBe(true);
      }
      expect(L.discoveryReady(s)).toBe(true);
      expect(L.coachOf(s)).toBeNull();
    }
  });
  it('muet en mode libre ; cibles dans le contrat DOM', () => {
    let s = L.init(LEVELS['unit-ladder'].beginner.numbers);
    const dom = ['[data-ul-next]', '[data-ul-free]', '[data-ul-predict-card]', '[data-ul-dial]', '[data-ul-handle]', '[data-ul-readout]', '[data-ul-dock]'];
    expect(dom).toContain(L.coachOf(s).target);
    s = L.setFree(s, { from: 'km', to: 'm', mode: 1 });
    expect(L.coachOf(s)).toBeNull();
  });
});
