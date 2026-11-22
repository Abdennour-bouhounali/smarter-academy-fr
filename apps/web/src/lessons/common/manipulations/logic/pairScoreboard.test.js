import { describe, it, expect } from 'vitest';
import * as LS from '@smarter-academy/core/arithmetic/linearSystem.js';
import * as L from './pairScoreboard';

/**
 * pair-scoreboard — la logique RÉELLE du lab (celle que PairScoreboard.jsx importe), sur les
 * nombres du manuel : نشاط 1 (32 agents, 2(x − 5) = y − 3, (13 ; 19) et le piège (24 ; 8)),
 * le تحدّ (37 pièces, 610DA → (24 ; 13)), معارف (x − y = 2, 2x − 5y = 4 : (2 ; 0) oui, (3 ; 1)
 * non, (0 ; 2) non), les حالات خاصة, et la carte de saison de la plateforme (10 matchs, 22 pts).
 */
const ACT1 = 'x+y=32|2(x-5)=y-3';
const SEASON = 'x+y=10|3x+y=22';
const COINS = 'x+y=37|20x+10y=610';
const pair = (s, x, y) => L.set(L.set(s, 'x', x), 'y', y);

describe('pair-scoreboard — lecture de la jumla et du monde', () => {
  it('نشاط 1 : monde « après » (2 fois les hommes restants, 5 hommes et 3 femmes partis)', () => {
    const s = L.init({ system: ACT1, theme: 'staff' });
    expect(s.shape).toEqual({ kind: 'after', N: 32, m: 2, a: 5, b: 3 });
    expect(s.world).toBe('staff');
    expect(s.range).toEqual({ x: { min: 5, max: 32 }, y: { min: 3, max: 32 } });
    expect(s.kind).toBe('unique');
    expect(L.eqWrittenTex(s, 1)).toBe('2(x - 5) = y - 3');
    expect(L.eqReducedTex(s, 1)).toBe('2x - y = 7');
    expect(L.systemWrittenTex(s)).toBe('\\begin{cases} x + y = 32 \\\\ 2(x - 5) = y - 3 \\end{cases}');
  });

  it('la saison et le تحدّ : monde « count » (cases + barre de valeur)', () => {
    const a = L.init({ system: SEASON, theme: 'football' });
    expect(a.shape).toEqual({ kind: 'count', N: 10, p: 3, q: 1, V: 22 });
    expect(a.world).toBe('football');
    expect(a.range).toEqual({ x: { min: 0, max: 12 }, y: { min: 0, max: 12 } });
    const c = L.init({ system: COINS, theme: 'coins' });
    expect(c.shape).toEqual({ kind: 'count', N: 37, p: 20, q: 10, V: 610 });
    expect(c.world).toBe('coins');
    // le thème ne force jamais un dessin que la structure ne porte pas
    expect(L.init({ system: COINS, theme: 'staff' }).world).toBe('football');
    expect(L.init({ system: 'x-y=2|2x-5y=4' }).world).toBe('abstract');
  });

  it('les حالات خاصة du manuel sont lues par linearSystem', () => {
    expect(L.init({ system: '4x+6y=2|-2x-3y=-1' }).kind).toBe('infinite');
    expect(L.init({ system: '2x-y=0|-x+y/2=-2' }).kind).toBe('none');
  });

  it('une jumla mal écrite est une erreur de contenu', () => {
    expect(() => L.init({ system: 'x+y=3' })).toThrow();
    expect(() => L.init({ system: 'x+y=3|xy=2' })).toThrow();
  });
});

describe('pair-scoreboard — les jauges lisent la forme du manuel', () => {
  const s = L.init({ system: ACT1, theme: 'staff' });

  it('(13 ; 19) allume les deux jauges : « 13 + 19 = 32 », « 2(13 - 5) = 16 » et « 19 - 3 = 16 »', () => {
    expect(L.okPair(s, 13, 19)).toEqual([true, true]);
    expect(L.readingTex(s, 0, 13, 19).lines).toEqual(['13 + 19 = 32']);
    expect(L.readingTex(s, 1, 13, 19).lines).toEqual(['2(13 - 5) = 16', '19 - 3 = 16', '16 = 16']);
  });

  it('(24 ; 8) — question أ : la jauge (1) seulement (« 2(24 - 5) = 38 », « 8 - 3 = 5 »)', () => {
    expect(L.okPair(s, 24, 8)).toEqual([true, false]);
    expect(L.readingTex(s, 1, 24, 8).lines).toEqual(['2(24 - 5) = 38', '8 - 3 = 5', '38 \\neq 5']);
  });

  it('une jauge éteinte écrit sa somme et la cible', () => {
    expect(L.readingTex(s, 0, 20, 5).lines).toEqual(['20 + 5 = 25 \\neq 32']);
  });

  it('la saison : « 3 \\times 6 + 4 = 22 »', () => {
    const a = L.init({ system: SEASON });
    expect(L.readingTex(a, 1, 6, 4).lines).toEqual(['3 \\times 6 + 4 = 22']);
    expect(L.readingTex(a, 1, 4, 6).lines).toEqual(['3 \\times 4 + 6 = 18 \\neq 22']);
  });

  it('une valeur négative est mise entre parenthèses, un quotient écrit en fraction', () => {
    const e = L.init({ system: 'x-2y=7|x=1/3' });
    expect(L.readingTex(e, 0, 1, -3).lines).toEqual(['1 - 2 \\times (-3) = 7']);
    expect(L.eqWrittenTex(e, 1)).toBe('x = \\dfrac{1}{3}');
  });

  it('chaque jauge EST holdsAt de linearSystem, sur toute la grille de l’histoire', () => {
    for (const sys of [ACT1, SEASON, COINS]) {
      const t = L.init({ system: sys });
      const S = LS.system(...sys.split('|'));
      for (let x = t.range.x.min; x <= t.range.x.max; x += 1) {
        for (let y = t.range.y.min; y <= t.range.y.max; y += 1) {
          expect(L.okPair(t, x, y)).toEqual(LS.pairHolds(S, x, y));
        }
      }
    }
  });

  it('sur la grille de chaque histoire, une SEULE ثنائية allume les deux jauges', () => {
    const both = (sys) => {
      const t = L.init({ system: sys });
      const out = [];
      for (let x = t.range.x.min; x <= t.range.x.max; x += 1) for (let y = t.range.y.min; y <= t.range.y.max; y += 1) if (L.okPair(t, x, y).every(Boolean)) out.push([x, y]);
      return out;
    };
    expect(both(ACT1)).toEqual([[13, 19]]);
    expect(both(SEASON)).toEqual([[6, 4]]);
    expect(both(COINS)).toEqual([[24, 13]]);
  });
});

describe('pair-scoreboard — essais, refus, ordre, découverte', () => {
  it('un essai n’existe que quand les deux nombres sont posés ; pas de doublon', () => {
    let s = L.init({ system: ACT1 });
    s = L.set(s, 'x', 24);
    expect(s.trials).toHaveLength(0);
    s = L.set(s, 'y', 8);
    expect(s.trials).toEqual([{ x: 24, y: 8, ok: [true, false], swapped: false }]);
    s = L.set(s, 'y', 8);
    expect(s.trials).toHaveLength(1);
    expect(s.last.fresh).toBe(false);
  });

  it('les bornes de l’histoire refusent silencieusement (4 hommes ne peuvent pas partir 5)', () => {
    const s = L.init({ system: ACT1 });
    expect(L.set(s, 'x', 4)).toBe(s);
    expect(L.set(s, 'y', 33)).toBe(s);
  });

  it('« حل للجملة » : refusé avec une seule jauge (24 ; 8), accepté pour (13 ; 19)', () => {
    let s = pair(L.init({ system: ACT1 }), 24, 8);
    s = L.claim(s);
    expect(s.last).toMatchObject({ kind: 'onlyOne', ok: [true, false] });
    expect(s.solved).toBeNull();
    expect(L.discoveryReady(s)).toBe(false);
    s = L.claim(pair(s, 20, 5));
    expect(s.last.kind).toBe('none');
    s = L.claim(pair(s, 13, 19));
    expect(s.last.kind).toBe('accepted');
    expect(s.solved).toEqual({ x: 13, y: 19 });
    expect(s.refusedClaims).toBe(2);
    expect(L.discoveryReady(s)).toBe(true);
  });

  it('la découverte exige le CONTRASTE : trouver d’emblée la bonne ثنائية ne suffit pas', () => {
    let s = L.claim(pair(L.init({ system: SEASON }), 6, 4));
    expect(s.last.kind).toBe('accepted');
    expect(L.discoveryReady(s)).toBe(false);
    s = L.set(s, 'y', 6); // (6 ; 6) : 12 matchs, 24 points — aucune jauge
    expect(L.discoveryReady(s)).toBe(false);
    s = L.set(s, 'x', 4); // (4 ; 6) : 10 matchs mais 18 points — une seule jauge
    expect(L.halfTrial(s)).toMatchObject({ x: 4, y: 6, ok: [true, false] });
    expect(L.discoveryReady(s)).toBe(true);
  });

  it('« اقلب » : (13 ; 19) → (19 ; 13), un essai refusé par la jauge (2) — l’ordre compte', () => {
    let s = pair(L.init({ system: ACT1 }), 13, 19);
    s = L.swap(s);
    expect([s.x, s.y]).toEqual([19, 13]);
    expect(s.last).toMatchObject({ kind: 'trial', swapped: true, ok: [true, false] });
    expect(L.swappedRefused(s)).toMatchObject({ x: 19, y: 13 });
    expect(L.readingTex(s, 1, 19, 13).lines).toEqual(['2(19 - 5) = 28', '13 - 3 = 10', '28 \\neq 10']);
  });

  it('« اقلب » hors des bornes ou sans ثنائية : rien ne change', () => {
    const s0 = L.init({ system: ACT1 });
    expect(L.swap(s0).last.kind).toBe('noPair');
    const s = pair(s0, 30, 4); // (4 ; 30) : 4 hommes < 5 partis
    const t = L.swap(s);
    expect(t.last.kind).toBe('swapOut');
    expect([t.x, t.y]).toEqual([30, 4]);
    expect(L.swap(pair(s0, 7, 7)).last.kind).toBe('sameSwap');
  });

  it('une jumla sans solution ne peut jamais être déclarée résolue', () => {
    let s = L.init({ system: '2x-y=0|2x-y=4', ranges: { x: { min: -4, max: 4 }, y: { min: -8, max: 8 } } });
    for (let x = -4; x <= 4; x += 1) for (let y = -8; y <= 8; y += 1) s = L.claim(pair(s, x, y));
    expect(s.solved).toBeNull();
  });
});

describe('pair-scoreboard — le dessin dit ce que disent les équations', () => {
  it('les cases : jamais plus de N à l’intérieur, le reste dehors, des cases vides sinon', () => {
    for (const [N, max] of [[10, 12], [32, 32], [37, 41]]) {
      for (let x = 0; x <= max; x += 1) {
        for (let y = 0; y <= max; y += 1) {
          const g = L.slots(N, x, y);
          expect(g.inside.length + g.overflow.length).toBe(x + y);
          expect(g.inside.length + g.empty).toBe(Math.max(N, g.inside.length));
          expect(g.inside.length).toBeLessThanOrEqual(N);
          expect(g.overflow.length === 0 && g.empty === 0).toBe(x + y === N);
        }
      }
    }
  });

  it('la barre de valeur atteint sa cible exactement quand la jauge (2) s’allume', () => {
    for (const sys of [SEASON, COINS]) {
      const s = L.init({ system: sys });
      for (let x = 0; x <= s.range.x.max; x += 1) for (let y = 0; y <= s.range.y.max; y += 1) {
        const b = L.valueBar(s.shape, x, y);
        expect(b.have === b.target).toBe(L.okPair(s, x, y)[1]);
        expect(b.xPart + b.yPart).toBe(b.have);
      }
    }
  });

  it('le panneau « après » : égalité dessinée ⇔ jauge (2) allumée (32 agents, toute la grille)', () => {
    const s = L.init({ system: ACT1 });
    for (let x = 5; x <= 32; x += 1) for (let y = 3; y <= 32; y += 1) {
      const p = L.afterPanel(s.shape, x, y);
      expect(p.equal).toBe(L.okPair(s, x, y)[1]);
      expect(p.menLeft).toBe(x - 5);
      expect(p.womenLeft).toBe(y - 3);
    }
    expect(L.afterPanel(s.shape, 13, 19)).toMatchObject({ menLeft: 8, womenLeft: 16, twiceMen: 16, equal: true });
  });
});

describe('pair-scoreboard — le monde tient d’un seul regard (règle du propriétaire)', () => {
  it('la grille tient dans sa boîte pour chaque ثنائية de chaque histoire, à quatre tailles d’écran', () => {
    // largeur de la scène et hauteur laissée à la grille : téléphone 320, téléphone 390, portable, projecteur
    const BOXES = [[288, 230], [358, 330], [410, 560], [560, 640]];
    for (const sys of [ACT1, SEASON, COINS]) {
      const s = L.init({ system: sys });
      for (let x = s.range.x.min; x <= s.range.x.max; x += 1) {
        for (let y = s.range.y.min; y <= s.range.y.max; y += 1) {
          const count = Math.max(s.shape.N, x + y);
          for (const [width, maxHeight] of BOXES) {
            const g = L.sceneGrid({ count, width, maxHeight });
            expect(g.cols * g.rows).toBeGreaterThanOrEqual(count);
            expect(g.width, `${sys} ${x};${y} @${width}`).toBeLessThanOrEqual(width);
            expect(g.height, `${sys} ${x};${y} @${width}×${maxHeight}`).toBeLessThanOrEqual(maxHeight);
            expect(g.cell).toBeGreaterThanOrEqual(10);
          }
        }
      }
    }
  });

  it('les 32 agents à la largeur d’un téléphone : des cases d’au moins 24 px', () => {
    expect(L.sceneGrid({ count: 32, width: 288, maxHeight: 230 }).cell).toBeGreaterThanOrEqual(24);
  });

  it('la grille est un CARRÉ : 10 → 4 × 3, 32 → 6 × 6, 64 → 8 × 8, |rows − cols| ≤ 1 pour tout n', () => {
    const shape = (n) => { const g = L.sceneGrid({ count: n, width: 400, maxHeight: 400 }); return [g.cols, g.rows]; };
    expect(shape(10)).toEqual([4, 3]);
    expect(shape(32)).toEqual([6, 6]);
    expect(shape(64)).toEqual([8, 8]);
    for (let n = 1; n <= 82; n += 1) {
      const [c, r] = shape(n);
      expect(Math.abs(r - c), `n = ${n}`).toBeLessThanOrEqual(1);
      expect(c * r).toBeGreaterThanOrEqual(n);
    }
  });
});


describe('pair-scoreboard — la ثنائية par défaut n’est jamais la solution ni un essai', () => {
  for (const system of ['x+y=32|2(x-5)=y-3', 'x+y=10|3x+y=22', 'x+y=37|20x+10y=610', 'x-y=2|2x-5y=4']) {
    it(system, () => {
      const lab = L.init({ system });
      const d = L.defaultPair(lab);
      expect(L.okPair(lab, d.x, d.y).every(Boolean)).toBe(false);
      expect(lab.trials).toHaveLength(0);
      expect(lab.x).toBeNull();
    });
  }
});
