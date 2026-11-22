import { describe, it, expect } from 'vitest';
import * as L from './hundredGrid';

const paint = (s, t) => L.setT(s, t);
const write = (s, g) => L.setGuess(s, g);

describe('hundred-grid — la logique exacte', () => {
  it('de : peindre 15 cases de 240, écrire 36 avant l\'ouverture', () => {
    let s = L.init(L.PRESETS.beginner);
    expect(L.needsGuess(s)).toBe(true);
    expect(L.revealed(s)).toBe(false);
    expect(L.canGo(s)).toBe(false);                // pas de réponse écrite
    s = write(paint(s, 15), '36');
    expect(L.canGo(s)).toBe(true);
    s = L.go(s);
    expect(s.last).toMatchObject({ ok: true, tk: 'of', basket: '36', expected: '36', packet: '2,4' });
    expect(L.taskDone(s)).toBe(true);
    expect(L.revealed(s)).toBe(true);
  });

  it('refuse une réponse fausse (15 au lieu de 36) et un autre nombre de cases', () => {
    let s = L.init(L.PRESETS.beginner);
    s = L.go(write(paint(s, 15), '15'));
    expect(s.last).toMatchObject({ ok: false, why: 'guess', basket: '36', guess: '15' });
    expect(L.taskDone(s)).toBe(false);
    s = L.go(write(paint(s, 20), '36'));
    expect(s.last).toMatchObject({ ok: false, why: 'paint', painted: 20 });
  });

  it('rate : le panier se lit en direct, 60 sur 150 demande 40 cases', () => {
    let s = L.init(L.PRESETS.beginner);
    s = write(paint(s, 15), '36'); s = L.go(s); s = L.nextTask(s);
    expect(L.taskOf(s).kind).toBe('rate');
    expect(L.needsGuess(s)).toBe(false);
    expect(L.revealed(s)).toBe(true);
    expect(L.canGo(s)).toBe(true);
    s = L.go(paint(s, 30));
    expect(s.last).toMatchObject({ ok: false, why: 'short', basket: '45' });
    s = L.go(paint(s, 50));
    expect(s.last).toMatchObject({ ok: false, why: 'over', basket: '75' });
    s = L.go(paint(s, 40));
    expect(s.last.ok).toBe(true);
  });

  it('change : +15 % de 200 = 230 ; −20 % de 250 = 200', () => {
    let s = L.init({ tasks: [{ kind: 'change', x: '200', dir: 'up', t: 15 }, { kind: 'change', x: '250', dir: 'down', t: 20 }] });
    s = L.go(write(paint(s, 15), '215'));
    expect(s.last).toMatchObject({ ok: false, why: 'guess', expected: '230' });
    s = L.go(write(s, '230'));
    expect(s.last.ok).toBe(true);
    s = L.nextTask(s);
    s = L.go(write(paint(s, 20), '200'));
    expect(s.last.ok).toBe(true);
  });

  it('whole : 84 sont 60 % → 140 ; les 60 cases sont déjà peintes', () => {
    let s = L.init({ tasks: [{ kind: 'whole', part: '84', t: 60 }] });
    expect(s.t).toBe(60);
    expect(L.basketNow(s)).toEqual({ n: 84, d: 1 });
    s = L.go(write(s, '84'));
    expect(s.last).toMatchObject({ ok: false, why: 'guess', expected: '140' });
    s = L.go(write(s, '140'));
    expect(s.last.ok).toBe(true);
  });

  it('la chaîne +20 % puis −20 % reprend le stock : 200 → 240 → 192', () => {
    const s0 = L.init(L.PRESETS.advanced);
    expect(s0.tasks.map((t) => t.kind)).toEqual(['rate', 'rate', 'whole', 'change', 'change']);
    expect(s0.tasks[4].x).toEqual({ n: 240, d: 1 });
    expect(s0.tasks[4].answer).toEqual({ n: 192, d: 1 });
  });

  it('les deux niveaux se terminent ; la découverte s\'ouvre', () => {
    for (const lv of ['beginner', 'advanced']) {
      let s = L.init(L.PRESETS[lv]);
      for (let i = 0; i < s.tasks.length; i += 1) {
        const task = L.taskOf(s);
        s = paint(s, task.t);
        s = task.kind === 'rate' ? s : write(s, require_text(task.answer));
        s = L.go(s);
        expect(s.last.ok, `${lv} ${i}`).toBe(true);
        if (L.canNext(s)) s = L.nextTask(s);
      }
      expect(L.discoveryReady(s)).toBe(true);
    }
  });

  it('libre : son stock, le panier en direct, rien n\'est coché', () => {
    let s = L.init(L.PRESETS.beginner);
    s = L.setFree(s, '٣٠٠');
    expect(L.isFree(s)).toBe(true);
    s = paint(s, 7);
    expect(L.basketNow(s)).toEqual({ n: 21, d: 1 });
    expect(L.canGo(s)).toBe(false);
    expect(L.discoveryReady(s)).toBe(false);
    expect(L.setFree(s, '0')).toBe(s);
    s = L.toGuided(s);
    expect(L.isFree(s)).toBe(false);
  });

  it('le coach : paint → guess → go → next, jamais la réponse', () => {
    let s = L.init(L.PRESETS.beginner);
    expect(L.coachOf(s).id).toBe('paint');
    s = paint(s, 15);
    expect(L.coachOf(s).id).toBe('guess');
    s = write(s, '36');
    expect(L.coachOf(s).id).toBe('go');
    s = L.go(s);
    expect(L.coachOf(s).id).toBe('next');
  });

  it('taux entier exigé pour rate', () => {
    expect(() => L.init({ tasks: [{ kind: 'rate', x: '8', part: '3' }] })).toThrow();
  });
});

function require_text(v) { return String(v.n / v.d).replace('.', ','); }
