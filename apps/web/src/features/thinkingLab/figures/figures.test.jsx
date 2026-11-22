/**
 * Chaque défi qui déclare une figure la trouve ici, et chaque couche que sa relecture
 * allume existe dans la figure. Chaque figure se dessine (couches de base et toutes les
 * couches) en SVG pur, sans image matricielle (THINKING_LAB.md §7).
 */
import { readFileSync, readdirSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { FIGURE_NAMES, loadFigure } from './index';

const DIR = new URL('../../../../../../content/thinking-lab/challenges/', import.meta.url);
const challenges = readdirSync(DIR).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(new URL(f, DIR), 'utf8')));

const fill = (props, values) => JSON.parse(JSON.stringify(props ?? {}).replace(/\{([a-zA-Z]\w*)\}/g, (w, n) => (n in values ? String(values[n]) : w)));
const firstTuple = (params) => Object.fromEntries(Object.entries(params?.vars ?? {}).map(([k, v]) => [k, v[0]]));

describe('figures du « مختبر التفكير »', () => {
  for (const name of FIGURE_NAMES) {
    it(`${name} : contrat et dessin`, async () => {
      const mod = await loadFigure(name);
      expect(Array.isArray(mod.LAYERS) && mod.LAYERS.length > 0).toBe(true);
      expect(mod.BASE_LAYERS.every((l) => mod.LAYERS.includes(l))).toBe(true);
      const users = challenges.filter((c) => c.figure?.component === name);
      const props = users[0] ? fill(users[0].figure.props, firstTuple(users[0].params)) : {};
      for (const layers of [mod.BASE_LAYERS, mod.LAYERS]) {
        const html = renderToStaticMarkup(<mod.default layers={layers} props={props} ariaLabel={name} />);
        expect(html.startsWith('<svg')).toBe(true);
        expect(html).not.toMatch(/<image|\.png|\.jpe?g|\.webp/);
        expect(html).not.toMatch(/NaN|undefined/);
      }
    });
  }

  for (const c of challenges.filter((x) => x.figure)) {
    it(`#${c.number} ${c.id} : figure ${c.figure.component} et couches de la relecture`, async () => {
      expect(FIGURE_NAMES).toContain(c.figure.component);
      const { LAYERS } = await loadFigure(c.figure.component);
      for (const [i, step] of c.replay.entries()) {
        for (const layer of step.layers ?? []) expect(LAYERS, `replay[${i}] couche « ${layer} »`).toContain(layer);
      }
    });
  }

  it('une relecture sans figure n\'allume aucune couche', () => {
    for (const c of challenges.filter((x) => !x.figure)) {
      expect(c.replay.every((s) => !s.layers?.length), `#${c.number}`).toBe(true);
    }
  });
});
