import { describe, it, expect } from 'vitest';
import * as L from './mergeBoard';
import { evaluateChain } from '@smarter-academy/core/arithmetic/fractions3.js';
import { ratText } from '@smarter-academy/core/arithmetic/powers.js';

const one = (chain, extra = {}) => L.init({ tasks: [{ id: 't', chain, ...extra }] });
/** Résout une chaîne comme le ferait l'élève, en suivant `canonicalNext` (retournement et prédiction justes). */
function solve(s) {
  for (let g = 0; g < 20 && !L.finished(s); g += 1) {
    const nx = L.canonicalNext(s);
    s = L.tapTile(s, nx.left);
    s = L.tapTile(s, nx.right);
    if (nx.op === '÷') s = L.flip(s, nx.right);
    const link = L.selectedLink(s);
    const sg = signOf(s, link);
    s = L.predict(s, sg);
  }
  return s;
}
import { stepOf } from '@smarter-academy/core/arithmetic/fractions3.js';
const signOf = (s, link) => stepOf(link.op === '÷' ? { ...link, right: { ...link.right, flip: true } } : link).sign;

describe('merge-board — logique', () => {
  it('chaque chaîne des deux niveaux est résolue en suivant le geste canonique, au résultat exact', () => {
    for (const lv of ['beginner', 'advanced']) {
      for (const t of L.PRESETS[lv].tasks) {
        const s = solve(L.init({ tasks: [t] }));
        expect(L.finished(s), t.id).toBe(true);
        expect(L.taskDone(s), t.id).toBe(true);
        const ev = evaluateChain(t.chain).value;
        expect(ratText(s.trials.at(-1).result ?? ev), t.id).toBe(ratText(ev));
        expect(s.trials.filter((e) => e.kind === 'refused')).toEqual([]);
      }
    }
  });

  it('une prédiction fausse est REFUSÉE (strike), la bonne fusionne', () => {
    let s = one('-5/4 + 11/6');
    s = L.tapTile(s, L.tilesOf(s.root)[0].id);
    s = L.tapTile(s, L.tilesOf(s.root)[1].id);
    expect(L.selectedLink(s)).not.toBeNull();
    const bad = L.predict(s, -1);
    expect(bad.last).toMatchObject({ kind: 'refused', reason: 'sign' });
    expect(bad.strikes).toBe(1);
    expect(L.tilesLeft(bad)).toBe(2);
    expect(L.whyOf(bad.last.step)).toMatchObject({ type: 'sum', same: false, den: 12, bigger: 'b' });
    const ok = L.predict(bad, 1);
    expect(L.finished(ok)).toBe(true);
    expect(ok.clean).toBe(0);                       // une erreur avant : la fusion ne compte pas « sans faute »
    expect(ok.history[0].trail).toContain('\\frac{22}{12}');
  });

  it('l\'aimant : 7/3 − 8/15 ÷ 11/20 refuse la soustraction d\'abord, puis la division sans retournement', () => {
    let s = one('7/3 - 8/15 ÷ 11/20');
    const [a, b, c] = L.tilesOf(s.root);
    s = L.tapTile(s, a.id); s = L.tapTile(s, b.id);
    expect(s.last).toMatchObject({ reason: 'magnet' });
    expect(s.seenMagnet).toBe(true);
    expect(s.sel).toEqual([]);
    s = L.tapTile(s, b.id); s = L.tapTile(s, c.id);
    expect(L.selectedLink(s).op).toBe('÷');
    expect(L.predict(s, 1).last).toMatchObject({ reason: 'noflip' });
    expect(L.flip(s, b.id).last).toMatchObject({ reason: 'dividend' });
    const f = L.flip(s, c.id);
    expect(f.trials.at(-1)).toMatchObject({ kind: 'flip', ok: true });
    const m = L.predict(f, 1);
    expect(m.last.kind).toBe('merge');
    expect(ratText(m.last.step.result)).toBe('32/33');
  });

  it('la bulle : on ne fusionne pas à travers ; de gauche à droite pour les + −', () => {
    let s = one('(2/3 - 5/2) × -6/11');
    const [, b, c] = L.tilesOf(s.root);
    s = L.tapTile(s, b.id); s = L.tapTile(s, c.id);
    expect(s.last).toMatchObject({ reason: 'bubble' });
    s = one('3/4 - 5/6 + 1/12');
    const t = L.tilesOf(s.root);
    s = L.tapTile(s, t[1].id); s = L.tapTile(s, t[2].id);
    expect(s.last).toMatchObject({ reason: 'order' });
  });

  it('la barre de fraction : haut et bas d\'abord, puis la division', () => {
    const s = solve(one('(1/2 - 4/3)@(5/6 + -3/4)'));
    expect(L.finished(s)).toBe(true);
    expect(s.history.map((h) => h.op)).toEqual(['-', '+', '÷']);
    expect(ratText(s.history.at(-1).result)).toBe('-10');
  });

  it('0 n\'a pas de مقلوب ; le dividende ne se retourne pas', () => {
    const s = one('3/4 ÷ 0');
    const [, z] = L.tilesOf(s.root);
    expect(L.flip(s, z.id).last).toMatchObject({ reason: 'zero' });
  });

  it('monde signs : paire déjà choisie, pas de retournement, une erreur remet la série à zéro', () => {
    let s = L.init(L.PRESETS.signs);
    expect(s.sel).toHaveLength(2);
    s = L.predict(s, 1);                          // −2/3 + 1/4 < 0
    expect(s.last.reason).toBe('sign');
    expect(s.ti).toBe(0);
    s = L.predict(s, -1);
    expect(L.taskDone(s)).toBe(true);
    s = L.nextTask(s);
    expect(s.sel).toHaveLength(2);
    s = L.predict(s, -1);                         // 3/5 × −10/9 < 0
    expect(L.taskDone(s)).toBe(true);
    s = L.nextTask(s);
    s = L.predict(s, 1);                          // −4/7 ÷ −2/21 > 0, sans retourner
    expect(L.taskDone(s)).toBe(true);
  });

  it('متقدم : les barres cachées reviennent après trois erreurs', () => {
    let s = L.init({ tasks: [{ id: 'h', chain: '-5/4 + 11/6', hidden: true }] });
    expect(L.barsShown(s)).toBe(false);
    s = L.tapTile(s, L.tilesOf(s.root)[0].id); s = L.tapTile(s, L.tilesOf(s.root)[1].id);
    for (let i = 0; i < 3; i += 1) s = L.predict(s, -1);
    expect(L.barsShown(s)).toBe(true);
  });

  it('« جرّب أعدادك » : valide, refuse, ne compte jamais', () => {
    expect(L.validateFree('')).toEqual({ ok: false, why: 'empty' });
    expect(L.validateFree('3/4 +')).toEqual({ ok: false, why: 'syntax' });
    expect(L.validateFree('1 + 2 + 3 + 4 + 5').why).toBe('tiles');
    expect(L.validateFree('99/4 + 1').why).toBe('big');
    expect(L.validateFree('(1/2)@(3)').why).toBe('syntax');
    expect(L.validateFree('٣/٤ + ١/٢').ok).toBe(true);
    let s = L.init(L.PRESETS.beginner);
    s = L.setFree(s, '1/2 - 1/2');
    expect(L.isFree(s)).toBe(true);
    expect(s.trials.at(-1)).toMatchObject({ kind: 'custom', free: true });
    s = L.tapTile(s, L.tilesOf(s.root)[0].id); s = L.tapTile(s, L.tilesOf(s.root)[1].id);
    expect(L.predict(s, 0).last.kind).toBe('merge');
    expect(L.toGuided(s).free).toBeNull();
  });

  it('la découverte après c1–c3 ; le coach ne dit jamais le nombre', () => {
    let s = L.init(L.PRESETS.beginner);
    expect(L.coachOf(s)).toMatchObject({ id: 'pair' });
    for (let i = 0; i < 3; i += 1) { s = solve(s); expect(L.taskDone(s)).toBe(true); s = i < 2 ? L.nextTask(s) : s; }
    expect(L.discoveryReady(s)).toBe(true);
    const t = L.init({ tasks: [{ id: 'd', chain: '1/2 ÷ 3/4' }] });
    const [a, b] = L.tilesOf(t.root);
    const sel = L.tapTile(L.tapTile(t, a.id), b.id);
    expect(L.coachOf(sel)).toMatchObject({ id: 'flip' });
    expect(L.coachOf(L.flip(sel, b.id))).toMatchObject({ id: 'sign' });
  });

  it('barOf : signe et longueur proportionnelle', () => {
    const s = one('-5/4 + 11/6');
    const [a, b] = L.tilesOf(s.root);
    expect(L.barOf(s, a).sign).toBe(-1);
    expect(L.barOf(s, b).sign).toBe(1);
    expect(L.barOf(s, b).frac).toBe(1);
    expect(L.barOf(s, a).frac).toBeCloseTo(1.25 / (11 / 6), 5);
  });
});

describe('merge-board — chainTex', () => {
  it('écrit la chaîne avec ses signes entre parenthèses et sa barre', () => {
    expect(L.chainTex(one('7/13 × -8/5').root)).toBe('\\frac{7}{13} \\times \\left(-\\frac{8}{5}\\right)');
    expect(L.chainTex(one('-5/4 + 11/6').root)).toBe('-\\frac{5}{4} + \\frac{11}{6}');
    expect(L.chainTex(one('(1/2 - 4/3)@(5/6 + -3/4)').root)).toContain('\\dfrac{');
    expect(L.chainTex(one('(2/3 - 5/2) × -6/11').root)).toContain('\\left(\\frac{2}{3} - \\frac{5}{2}\\right)');
  });
});
