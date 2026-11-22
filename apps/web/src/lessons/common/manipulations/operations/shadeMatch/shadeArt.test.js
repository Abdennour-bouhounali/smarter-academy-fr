import { describe, it, expect } from 'vitest';
import { shadeColor, needleDeg, meterPoint, METER, liquidLevel, tallyRungs, tickDeg } from './shadeArt';

describe('shadeArt', () => {
  it('la même part donne la même couleur ; 0 est le blanc, 1 le bleu', () => {
    expect(shadeColor(0.5)).toBe(shadeColor(0.5));
    expect(shadeColor(0)).toBe('#f4f7fc');
    expect(shadeColor(1)).toBe('#1d4ed8');
    expect(shadeColor(2)).toBe(shadeColor(1));
    expect(shadeColor(-1)).toBe(shadeColor(0));
  });
  it('deux teintes très proches restent proches (3/4 ≈ 7/10 : quelques unités de couleur), mais ne sont pas égales', () => {
    const a = shadeColor((3 / 7) / 0.6); const b = shadeColor((7 / 17) / 0.6);
    expect(a).not.toBe(b);
    const ch = (h, i) => parseInt(h.slice(1 + 2 * i, 3 + 2 * i), 16);
    for (let i = 0; i < 3; i += 1) expect(Math.abs(ch(a, i) - ch(b, i))).toBeLessThan(10);
  });
  it('l\'aiguille : 0 au centre, bornée, signée ; le point de l\'arc suit l\'angle', () => {
    expect(needleDeg(0)).toBe(0);
    expect(needleDeg(1)).toBe(METER.maxDeg);
    expect(needleDeg(-3)).toBe(-METER.maxDeg);
    const p = meterPoint(0);
    expect(p.x).toBeCloseTo(METER.cx);
    expect(p.y).toBeCloseTo(METER.cy - METER.r);
    expect(meterPoint(40).x).toBeGreaterThan(METER.cx);
    expect(tickDeg('match', 0.3)).toBe(0);
    expect(tickDeg('lighter', -0.4)).toBeLessThan(0);
  });
  it('liquide et barrettes : bornés', () => {
    expect(liquidLevel(0, 8)).toBeGreaterThan(0);
    expect(liquidLevel(40, 20)).toBeCloseTo(0.9);
    expect(tallyRungs(5, 90)).toHaveLength(5);
    expect(tallyRungs(99, 40).length).toBeLessThanOrEqual(20);
  });
});
