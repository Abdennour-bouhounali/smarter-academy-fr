import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Vector3 } from 'three';
import '../../../../../i18n';
import Stage3D from './Stage3D';
import { toThree, fromThree, viewDirection } from './spaceStage';
import { camera } from '../../../components/spaceFigure';

describe('stage3d — repère et repli', () => {
  it('traduit le repère mathématique (z en haut) vers three.js (y en haut) et retour', () => {
    const v = toThree([1, 2, 3]);
    expect(v).toEqual(new Vector3(1, 3, -2));
    expect(fromThree(v)).toEqual([1, 2, 3]);
  });
  it('la direction de vue est celle de SpaceFigure (même figure, même angle)', () => {
    const view = { azimuth: -50, elevation: 25 };
    const a = viewDirection(view); const b = camera(view).d;
    a.forEach((x, i) => expect(x).toBeCloseTo(b[i], 12));
  });
  it('sans scène WebGL (rendu serveur, jsdom), le repli occupe la fenêtre — jamais une scène vide', () => {
    let built = false;
    const html = renderToString(<Stage3D build={() => { built = true; return null; }} state={{}} fallback={<p>figure de repli</p>} />);
    expect(html).toContain('figure de repli');
    expect(html).toContain('data-stage3d-fallback');
    expect(html).not.toContain('data-stage3d-reset');
    expect(built).toBe(false);
  });
});
