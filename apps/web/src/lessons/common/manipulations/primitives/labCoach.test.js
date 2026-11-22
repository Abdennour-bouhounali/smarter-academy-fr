import { describe, it, expect, beforeEach } from 'vitest';
import { placeBubble, readLearned, writeLearned, readOff, writeOff, resetCoach } from './labCoach';

const box = { w: 400, h: 600 };
const bubble = { w: 260, h: 90 };

describe('placeBubble', () => {
  it('pose la bulle SOUS l’élément quand il y a la place, jamais dessus', () => {
    const p = placeBubble({ target: { x: 100, y: 100, w: 50, h: 40 }, box, bubble });
    expect(p.side).toBe('below');
    expect(p.top).toBeGreaterThanOrEqual(140);
  });
  it('passe au-dessus quand le bas manque de place', () => {
    const p = placeBubble({ target: { x: 100, y: 520, w: 50, h: 40 }, box, bubble });
    expect(p.side).toBe('above');
    expect(p.top + bubble.h).toBeLessThanOrEqual(520);
  });
  it('reste dans le cadre aux deux bords et la flèche pointe le centre de l’élément', () => {
    for (const x of [0, 10, 190, 350, 380]) {
      const t = { x, y: 200, w: 20, h: 20 };
      const p = placeBubble({ target: t, box, bubble });
      expect(p.left).toBeGreaterThanOrEqual(0);
      expect(p.left + bubble.w).toBeLessThanOrEqual(box.w);
      const cx = t.x + t.w / 2;
      expect(Math.abs(p.left + p.arrow - cx)).toBeLessThanOrEqual(Math.max(0, 18 - cx + p.left) + 20);
    }
  });
});

describe('placeBubble — prefer (le côté voulu par le labo)', () => {
  const box = { w: 600, h: 800 }; const bubble = { w: 270, h: 100 };
  it('prefer above pose la bulle au-dessus même quand il y a plus de place dessous ; sans prefer rien ne change', () => {
    const t = { x: 100, y: 200, w: 50, h: 40 };
    expect(placeBubble({ target: t, box, bubble })).toMatchObject({ side: 'below' });
    expect(placeBubble({ target: t, box, bubble, prefer: 'above' })).toMatchObject({ side: 'above' });
    expect(placeBubble({ target: { ...t, y: 600 }, box, bubble, prefer: 'below' })).toMatchObject({ side: 'below' });
  });
});

describe('placeBubble — noFlip (jamais retournée sur la zone de travail)', () => {
  const box = { w: 600, h: 800 }; const bubble = { w: 270, h: 100 };
  it('noFlip + prefer below : la bulle reste dessous même quand elle dépasse la bande visible ; sans noFlip elle se retourne', () => {
    const t = { x: 100, y: 500, w: 50, h: 40 };
    const view = { top: 0, bottom: 600 };
    expect(placeBubble({ target: t, box, bubble, view, prefer: 'below' })).toMatchObject({ side: 'above' });
    const p = placeBubble({ target: t, box, bubble, view, prefer: 'below', noFlip: true });
    expect(p).toMatchObject({ side: 'below', edge: false });
    expect(p.top).toBe(t.y + t.h + 12);
    expect(placeBubble({ target: t, box, bubble, view, prefer: 'above', noFlip: true })).toMatchObject({ side: 'above' });
    // noFlip sans prefer : sans effet
    expect(placeBubble({ target: t, box, bubble, view, noFlip: true })).toEqual(placeBubble({ target: t, box, bubble, view }));
  });
});

describe('placeBubble — la bande visible de l\u2019écran (view)', () => {
  const tall = { w: 360, h: 1400 };
  const view = { top: 64, bottom: 700 };
  it('sans view ni élément hors écran : inchangé', () => {
    const t = { x: 100, y: 300, w: 50, h: 40 };
    expect(placeBubble({ target: t, box, bubble, view: { top: 0, bottom: 600 } })).toMatchObject({ side: 'below', edge: false });
  });
  it('élément sous l\u2019écran : la bulle se colle au bord bas visible, flèche vers le bas, sans couvrir l\u2019élément', () => {
    const p = placeBubble({ target: { x: 100, y: 1100, w: 50, h: 40 }, box: tall, bubble, view });
    expect(p).toMatchObject({ side: 'above', edge: true });
    expect(p.top + bubble.h).toBeLessThanOrEqual(view.bottom);
    expect(p.top).toBeGreaterThanOrEqual(view.top);
  });
  it('élément au-dessus de l\u2019écran : la bulle se colle au bord haut visible, flèche vers le haut', () => {
    const p = placeBubble({ target: { x: 100, y: 10, w: 50, h: 30 }, box: tall, bubble, view: { top: 400, bottom: 1000 } });
    expect(p).toMatchObject({ side: 'below', edge: true });
    expect(p.top).toBeGreaterThanOrEqual(400);
  });
  it('un élément à demi visible : le côté qui tient dans la bande est choisi, sans edge', () => {
    const p = placeBubble({ target: { x: 100, y: 650, w: 50, h: 40 }, box: tall, bubble, view });
    expect(p).toMatchObject({ side: 'above', edge: false });
    expect(p.top + bubble.h).toBeLessThanOrEqual(650);
  });
});

describe('stockage du guide', () => {
  beforeEach(() => {
    const mem = new Map();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) },
    });
    resetCoach('t');
  });
  it('retient les gestes appris et l’arrêt du guide', () => {
    expect(readLearned('t')).toEqual([]);
    writeLearned('t', ['tie', 'tie', 'carry']);
    expect(readLearned('t')).toEqual(['tie', 'carry']);
    expect(readOff('t')).toBe(false);
    writeOff('t', true);
    expect(readOff('t')).toBe(true);
    resetCoach('t');
    expect(readLearned('t')).toEqual([]);
    expect(readOff('t')).toBe(false);
  });
  it('ne plante pas quand le stockage est bloqué', () => {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('blocked'); } });
    expect(readLearned('t')).toEqual([]);
    expect(() => writeLearned('t', ['x'])).not.toThrow();
    expect(readOff('t')).toBe(false);
  });
});

describe('placeBubble — noFlip (area-split anchors its tip on the banner, always below, never over the scene above it)', () => {
  const box = { w: 600, h: 900 }; const bubble = { w: 272, h: 113 };
  it('keeps the preferred side whatever the visible band, and never overlaps the region above the target', () => {
    for (const ty of [100, 400, 700, 840]) {
      for (const view of [null, { top: 0, bottom: 300 }, { top: 0, bottom: 760 }]) {
        const target = { x: 100, y: ty, w: 300, h: 40 };
        const p = placeBubble({ target, box, bubble, view, prefer: 'below', noFlip: true });
        expect(p.side).toBe('below');
        expect(p.top).toBeGreaterThanOrEqual(target.y + target.h);
      }
    }
    expect(placeBubble({ target: { x: 100, y: 400, w: 300, h: 40 }, box, bubble, view: { top: 0, bottom: 300 }, prefer: 'below' }).side).not.toBe('below');
  });
});
