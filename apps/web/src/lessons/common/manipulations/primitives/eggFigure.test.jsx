import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Egg, TrayBody, CartonLid, FullTraySlat, Pallet, eggPath } from './EggFigure';

/** Le monde `farm` : un plateau ouvert dessine EXACTEMENT ses r œufs, et ses b cases. */
const svg = (node) => renderToString(<svg>{node}</svg>);
const eggs = (out) => (out.match(/<path d="M[^"]*Z" fill="#FFF1DC"/g) ?? []).length;

describe('EggFigure', () => {
  it('un œuf : une silhouette fermée centrée, un reflet seulement quand il est assez grand', () => {
    expect(eggPath(10, 10, 8)).toMatch(/^M10 5 C.*Z$/);
    expect(svg(<Egg x={10} y={10} w={8} />)).toContain('<ellipse');
    expect(svg(<Egg x={10} y={10} w={4} />)).not.toContain('<ellipse');
    expect(svg(<Egg ghost x={10} y={10} w={8} />)).toContain('stroke-dasharray');
  });

  it('un plateau ouvert de 30 dessine b cases et exactement r œufs, pour tout r < b', () => {
    for (const [b, w, h] of [[30, 180, 150], [12, 180, 60]]) {
      for (let r = 0; r < b; r += 1) {
        const out = svg(<TrayBody x={0} y={0} w={w} h={h} b={b} eggs={r} kind={b === 12 ? 'carton' : 'tray'} open />);
        expect(eggs(out), `${b}/${r}`).toBe(r);
        expect((out.match(/<ellipse/g) ?? []).length).toBeGreaterThanOrEqual(2 * b);
      }
    }
  });

  it('trop étroit pour ses cases : une barre de remplissage à l’échelle r/b', () => {
    const out = svg(<TrayBody x={0} y={0} w={9} h={26} b={30} eggs={15} />);
    expect(out).toContain('width="4"');
    expect(eggs(out)).toBe(0);
  });

  it('couvercle, plateau plein, palette se rendent', () => {
    expect(svg(<CartonLid x={0} y={0} w={60} h={20} />)).toContain('<rect');
    expect(svg(<FullTraySlat x={0} y={0} w={9} h={26} />)).toContain('<rect');
    expect((svg(<Pallet x={0} y={0} w={90} h={7} />).match(/<rect/g) ?? []).length).toBe(4);
  });
});
