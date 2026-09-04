import { describe, it, expect } from 'vitest';
import { planeGeometry, snapCoord, formatCoords } from './CoordPlane.jsx';

const near = (a, b, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps);
const R = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };

describe('planeGeometry', () => {
  it('place l’origine au centre d’un repère symétrique', () => {
    const g = planeGeometry(R, 30);
    const o = g.toSvg(0, 0);
    near(o.x, g.width / 2);
    near(o.y, g.height / 2);
  });

  it('toSvg et toCoord sont réciproques', () => {
    const g = planeGeometry(R, 30);
    for (const p of [{ x: 3, y: -2 }, { x: -4.5, y: 1.5 }, { x: 0, y: 5 }]) {
      const s = g.toSvg(p.x, p.y);
      const back = g.toCoord(s.x, s.y);
      near(back.x, p.x); near(back.y, p.y);
    }
  });

  it('le y de l’élève monte quand le y de l’écran descend', () => {
    const g = planeGeometry(R, 30);
    expect(g.toSvg(0, 3).y).toBeLessThan(g.toSvg(0, -3).y);
  });

  it('une unité vaut le même nombre de pixels sur les deux axes', () => {
    const g = planeGeometry({ xMin: -3, xMax: 7, yMin: -2, yMax: 4 }, 25);
    near(g.toSvg(1, 0).x - g.toSvg(0, 0).x, 25);
    near(g.toSvg(0, 0).y - g.toSvg(0, 1).y, 25);
  });
});

describe('snapCoord', () => {
  it('arrondit au pas de la grille', () => {
    expect(snapCoord({ x: 2.4, y: -1.6 }, R, 1)).toEqual({ x: 2, y: -2 });
    expect(snapCoord({ x: 2.3, y: -1.6 }, R, 0.5)).toEqual({ x: 2.5, y: -1.5 });
  });

  it('accepte un pas PAR AXE quand les deux graduations diffèrent', () => {
    // Défaut signalé sur representation-graphique-3e module 3 : un pas unique
    // de 2,5 s'appliquait aussi aux abscisses, si bien que les semaines 1 à 4
    // étaient inatteignables (seuls 0, 2,5 et 5 existaient).
    const R2 = { xMin: 0, xMax: 5, yMin: 0, yMax: 35 };
    for (const t of [{ x: 1, y: 2.5 }, { x: 2, y: 7.5 }, { x: 3, y: 12.5 }, { x: 4, y: 17.5 }]) {
      expect(snapCoord(t, R2, { x: 1, y: 2.5 }), `cible (${t.x} ; ${t.y})`).toEqual(t);
    }
  });

  it('un pas unique reste accepté et s’applique aux deux axes', () => {
    expect(snapCoord({ x: 2.4, y: -1.6 }, R, 1)).toEqual({ x: 2, y: -2 });
    expect(snapCoord({ x: 2.3, y: -1.4 }, R, 0.5)).toEqual({ x: 2.5, y: -1.5 });
  });

  it('INVARIANT : toute cible située sur la grille est atteignable', () => {
    // Si un module dessine une graduation, l'élève doit pouvoir y poser un point.
    const R2 = { xMin: 0, xMax: 12, yMin: 0, yMax: 60 };
    for (const [sx, sy] of [[1, 5], [0.5, 2.5], [2, 10], [1, 12]]) {
      for (let x = R2.xMin; x <= R2.xMax; x += sx) {
        for (let y = R2.yMin; y <= R2.yMax; y += sy) {
          const snapped = snapCoord({ x, y }, R2, { x: sx, y: sy });
          expect(Math.abs(snapped.x - x), `x=${x} pas=${sx}`).toBeLessThan(1e-9);
          expect(Math.abs(snapped.y - y), `y=${y} pas=${sy}`).toBeLessThan(1e-9);
        }
      }
    }
  });

  it('borne au cadre — un point ne peut pas sortir du repère', () => {
    expect(snapCoord({ x: 99, y: -99 }, R, 1)).toEqual({ x: 5, y: -5 });
    expect(snapCoord({ x: -12, y: 40 }, R, 1)).toEqual({ x: -5, y: 5 });
  });
});

describe('formatCoords', () => {
  it('écrit à la française, avec le moins typographique', () => {
    expect(formatCoords({ x: 3, y: -2 })).toBe('(3 ; −2)');
    expect(formatCoords({ x: 0, y: 0 })).toBe('(0 ; 0)');
    expect(formatCoords({ x: -1.5, y: 2.5 }, 1)).toBe('(−1,5 ; 2,5)');
  });

  it('affiche la précision du pas, sans zéros inutiles', () => {
    // Un point posé en 2,5 doit se lire « 2,5 » et non « 3 » : l'élève croyait
    // sinon son point mal placé alors qu'il était juste.
    expect(formatCoords({ x: 1, y: 2.5 }, 1)).toBe('(1 ; 2,5)');
    expect(formatCoords({ x: 3, y: 12.5 }, 1)).toBe('(3 ; 12,5)');
    // …mais un axe entier ne doit pas devenir « 1,0 ».
    expect(formatCoords({ x: 1, y: 5 }, 1)).toBe('(1 ; 5)');
    expect(formatCoords({ x: 0, y: 0 }, 2)).toBe('(0 ; 0)');
    expect(formatCoords({ x: -2, y: -1.25 }, 2)).toBe('(−2 ; −1,25)');
  });

  it('n’utilise jamais le tiret ASCII', () => {
    expect(formatCoords({ x: -4, y: -7 })).not.toContain('-');
  });
});

// ─── SÉCURITÉ DE MISE EN PAGE ────────────────────────────────────────────
// Règle : tout état valide doit avoir un affichage valide. Ces tests fixent
// l'invariant « aucune étiquette ne sort du cadre », y compris pour les
// valeurs larges, négatives et décimales que l'élève peut atteindre.
describe('planeGeometry — marges et débordement', () => {
  it('accepte une marge par côté sans changer le comportement historique', () => {
    const a = planeGeometry(R, 30);
    const b = planeGeometry(R, 30, 30);
    expect(a.width).toBe(b.width);
    expect(a.toSvg(2, 3)).toEqual(b.toSvg(2, 3));
  });

  it('une marge gauche plus large décale l’origine, pas l’échelle', () => {
    const wide = planeGeometry(R, 30, { left: 60 });
    // Une unité vaut toujours 30 px…
    near(wide.toSvg(1, 0).x - wide.toSvg(0, 0).x, 30);
    // …mais tout le repère est décalé vers la droite de 30 px.
    near(wide.toSvg(R.xMin, 0).x, 60);
    expect(wide.width).toBe(planeGeometry(R, 30).width + 30);
  });

  it('toSvg et toCoord restent réciproques avec des marges asymétriques', () => {
    const g = planeGeometry(R, 30, { left: 72, right: 18, top: 12, bottom: 40 });
    for (const p of [{ x: -5, y: 5 }, { x: 3, y: -2 }, { x: 0, y: 0 }]) {
      const s = g.toSvg(p.x, p.y);
      const back = g.toCoord(s.x, s.y);
      near(back.x, p.x);
      near(back.y, p.y);
    }
  });

  it('une étiquette large tient dans la marge qu’elle impose', () => {
    // « −125,75 » en font-mono 10 px ≈ 38,5 px ; la marge doit la contenir,
    // sachant que l'étiquette est posée à 8 px à gauche de l'axe.
    const width = (s) =>
      [...s].reduce((n, c) => n + (c === ',' ? 3 : c === '−' ? 5.5 : 6), 0);
    const label = '−125,75';
    const left = Math.max(30, width(label) + 12);
    expect(left - 8 - width(label)).toBeGreaterThanOrEqual(0);
  });
  it('un nom d’axe long élargit la marge droite qui l’accueille', () => {
    // Régression : « semaine » sortait du cadre là où « x » tenait. Le nom est
    // posé après la flèche, donc sa largeur appartient à la marge droite.
    const width = (str, size = 13) =>
      [...str].reduce((n, c) => n + (c === ',' ? 3 : c === '−' ? 5.5 : size * 0.6), 0);
    const shortRight = Math.max(30, width('x') + 18);
    const longRight = Math.max(30, width('semaine') + 18);
    expect(longRight).toBeGreaterThan(shortRight);
    // Le nom, posé à 14 px après la flèche, tient dans la marge calculée.
    expect(longRight - 14 - width('semaine')).toBeGreaterThanOrEqual(0);
  });

  it('unitY garde un cadre utilisable quand les deux axes ont des ordres différents', () => {
    // Régression : avec un seul `unit`, un cadre 0..240 en ordonnée faisait
    // 6 300 px de haut pour 372 de large. L'unité verticale se calcule pour
    // une hauteur cible, et la projection reste exacte.
    const range = { xMin: 0, xMax: 12, yMin: 0, yMax: 240 };
    const g = planeGeometry(range, 26, 30, 312 / 240);
    expect(g.height).toBeLessThan(400);
    expect(g.width).toBeLessThan(400);
    for (const p of [{ x: 0, y: 0 }, { x: 6, y: 120 }, { x: 12, y: 240 }]) {
      const s = g.toSvg(p.x, p.y);
      const back = g.toCoord(s.x, s.y);
      near(back.x, p.x);
      near(back.y, p.y);
    }
  });

  it('sans unitY, le comportement historique est inchangé', () => {
    const a = planeGeometry(R, 30);
    const b = planeGeometry(R, 30, 30, null);
    expect(a.height).toBe(b.height);
    expect(a.toSvg(2, 3)).toEqual(b.toSvg(2, 3));
  });
});
