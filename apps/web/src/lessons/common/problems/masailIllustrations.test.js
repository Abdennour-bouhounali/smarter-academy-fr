import { describe, it, expect } from 'vitest';
import { validateIllustration } from './problemIllustration';

/**
 * Le garde-fou de « une image pour chaque مسألة » (2026-10-13) : chaque مسألة de chaque درس porte un SUPPORT dessiné
 * (figure GeoFigure/SpaceFigure/StatChart, repère, tableau, scène interactive ou `illustration`), et une illustration ne
 * contient que des nombres de l'ÉNONCÉ (jamais une réponse). Les leçons de synthèse ne sont pas des leçons à مسائل.
 */
const modules = import.meta.glob('../../moyen/**/content/problems.js', { eager: true });
const entries = Object.entries(modules).map(([path, m]) => [path.replace('../../moyen/', '').replace('/content/problems.js', ''), m.PROBLEMS ?? []]);

const norm = (s) => String(s).replace(/\{,\}/g, ',').replace(/[$\\]/g, '').replace(/(\d)\.(\d)/g, '$1,$2');
// Les champs de MISE EN PAGE (niveau, couleur, position…) ne sont pas des nombres affichés.
const LAYOUT_KEYS = new Set(['ariaLabel', 'level', 'liquid', 'at', 'tone', 'fill', 'bg', 'icon', 'kind', 'shape', 'object', 'fromIcon', 'toIcon', 'extra', 'grid', 'color']);
const digitRuns = (value) => {
  const out = [];
  const walk = (v) => {
    if (v == null) return;
    if (typeof v === 'number') out.push(norm(v));
    else if (typeof v === 'string') (norm(v).match(/\d+(?:,\d+)?/g) ?? []).forEach((d) => out.push(d));
    else if (Array.isArray(v)) v.forEach(walk);
    else if (typeof v === 'object') Object.entries(v).forEach(([k, x]) => { if (!LAYOUT_KEYS.has(k)) walk(x); });
  };
  walk(value);
  return out;
};
const haystack = (p) => norm([p.statement, ...(p.data ?? []).map((d) => d.text), ...(p.parts ?? []).map((q) => q.question)].join(' '));

describe('مسائل — une image pour chacune', () => {
  it('le corpus est bien chargé', () => {
    expect(entries.length).toBeGreaterThanOrEqual(60);
  });

  for (const [lesson, problems] of entries) {
    for (const p of problems) {
      it(`${lesson} › ${p.id} a un support dessiné, valide et sans réponse`, () => {
        const has = Boolean(p.figure || p.visual || p.table || p.scene || p.illustration);
        expect(has, 'aucun support (figure / visual / table / scene / illustration)').toBe(true);
        if (p.illustration) {
          expect(validateIllustration(p.illustration)).toEqual([]);
          const hay = haystack(p);
          for (const d of digitRuns(p.illustration)) expect(hay, `le nombre « ${d} » du dessin n'est pas dans l'énoncé`).toContain(d);
        }
      });
    }
  }
});
