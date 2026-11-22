// « L’île des missions » and the 3D engine speak French and read left to right: no Arabic left in their sources, no
// right-to-left direction, no Arabic font; the canvas labels are drawn left to right in the app's Latin font.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (rel) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
const ARABIC = /[\u0600-\u06ff]/;

describe('L’île des missions — French, left to right', () => {
  it.each(['./MissionIsle.jsx', './Game.js', './missionIsle.css'])('%s has no Arabic and no right-to-left', (f) => {
    const src = read(f);
    expect(src).not.toMatch(ARABIC);
    expect(src).not.toMatch(/dir="rtl"|direction:\s*rtl|Cairo|Tajawal/);
  });

  it('the home and the run say their words in French', () => {
    const src = read('./MissionIsle.jsx');
    for (const s of [
      'Commence la mission',
      'Rejoue-la',
      'Le résumé du chapitre',
      'Passe par la bonne porte',
      'Retour à l’île',
    ])
      expect(src).toContain(s);
  });
});

describe('the 3D engine — canvas text left to right', () => {
  it('builders.js draws its labels left to right, in Inter, and names the workshop in French', () => {
    const src = read('../engine/builders.js');
    expect(src).toContain("ctx.direction = 'ltr'");
    expect(src).not.toContain("ctx.direction = 'rtl'");
    expect(src).toMatch(/const FONT = "'Inter'/);
    expect(src).toContain('L’atelier des moules');
    expect(src).not.toMatch(ARABIC);
  });
});
