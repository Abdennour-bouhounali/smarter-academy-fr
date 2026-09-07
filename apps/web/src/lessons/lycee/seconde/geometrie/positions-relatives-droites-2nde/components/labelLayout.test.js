import { describe, it, expect } from 'vitest';
import { planeGeometry } from '../../../../../common/components/CoordPlane';
import { layoutScene, isFree, boxInside, segmentHitsRect, rectsOverlap } from './labelLayout';
import { lineFromPointVector, intersection, intersectionInFrame, frameFor } from './droitesUtils';
import { pointOfFrac } from './labelLayout';

/** Le même cadre que TwoLinesPlane : ±h, marge 30 (les graduations ≤ 3 glyphes tiennent dans PAD). */
const geoFor = (h) => { const f = frameFor(h); return { ...f, geo: planeGeometry(f.range, f.unit, 30) }; };

function sceneFor(h, A, u, B, v, { withI = true } = {}) {
  const { geo, range, step } = geoFor(h);
  const L1 = lineFromPointVector(A, u);
  const L2 = lineFromPointVector(B, v);
  const I = intersection(L1, L2);
  const points = [{ id: 'A', name: 'A', ...A }, { id: 'B', name: 'B', ...B }];
  if (withI && intersectionInFrame(I, range)) points.push({ id: 'I', name: 'I', ...pointOfFrac(I) });
  const handles = [A, { x: A.x + u.x, y: A.y + u.y }, B, { x: B.x + v.x, y: B.y + v.y }].map((p, i) => ({ id: `h${i}`, ...p }));
  return layoutScene({
    geo, range, step,
    lines: [
      { id: 'd1', name: '(d₁)', line: L1, anchor: A, vector: u },
      { id: 'd2', name: '(d₂)', line: L2, anchor: B, vector: v },
    ],
    handles, points, showO: !handles.some((p) => p.x >= -1.6 && p.x <= 0.6 && p.y >= -1.6 && p.y <= 0.6),
  });
}

/** Vérité indépendante : une boîte posée ne touche aucun obstacle SAUF elle-même. */
function assertPlacedFree(scene) {
  const all = [...scene.pointLabels, ...scene.lineLabels].filter((l) => l.box);
  const obs = scene.obstacles;
  for (const l of all) {
    expect(boxInside(l.box, scene.frame, 1.5)).toBe(true);
    const others = { ...obs, rects: obs.rects.filter((r) => r !== l.box && !(r.x === l.box.x && r.y === l.box.y && r.tag === l.name)) };
    expect(isFree(l.box, others)).toBe(true);
    for (const m of all) if (m !== l) expect(rectsOverlap(l.box, m.box)).toBe(false);
  }
}

describe('primitives', () => {
  it('segment / rectangle', () => {
    const r = { x: 10, y: 10, width: 20, height: 10 };
    expect(segmentHitsRect({ x: 0, y: 15 }, { x: 40, y: 15 }, r)).toBe(true);
    expect(segmentHitsRect({ x: 0, y: 25 }, { x: 40, y: 25 }, r)).toBe(false);
    expect(segmentHitsRect({ x: 0, y: 25 }, { x: 40, y: 25 }, r, 6)).toBe(true);
    expect(segmentHitsRect({ x: 0, y: 0 }, { x: 5, y: 5 }, r)).toBe(false);
  });
});

describe('la scène par défaut du module 1', () => {
  it('pose les cinq étiquettes, libres', () => {
    const s = sceneFor(6, { x: -3, y: -1 }, { x: 2, y: 1 }, { x: 3, y: -1 }, { x: 1, y: -1 });
    expect(s.pointLabels.map((p) => p.name)).toEqual(['A', 'B', 'I']);
    expect(s.pointLabels.every((p) => p.box)).toBe(true);
    expect(s.lineLabels.every((l) => l.box)).toBe(true);
    assertPlacedFree(s);
  });
});

describe('balayage des états atteignables (±6)', () => {
  it('aucune étiquette posée ne chevauche, et les droites sont toujours nommées', () => {
    const vs = [];
    for (let x = -3; x <= 3; x += 1) for (let y = -3; y <= 3; y += 1) if (x || y) vs.push({ x, y });
    const As = [{ x: -3, y: -1 }, { x: 0, y: 0 }, { x: 5, y: 5 }, { x: -6, y: 6 }, { x: 6, y: -6 }, { x: 2, y: -4 }];
    const Bs = [{ x: 3, y: -1 }, { x: -5, y: 4 }, { x: 6, y: 6 }, { x: 0, y: -6 }, { x: 1, y: 1 }];
    let n = 0; let dropped = 0; let droppedLine = 0; let degenerate = 0;
    for (const u of vs) for (const v of vs) for (const A of As) for (const B of Bs) {
      const s = sceneFor(6, A, u, B, v);
      assertPlacedFree(s);
      dropped += s.pointLabels.filter((p) => !p.box).length;
      s.lineLabels.forEach((l, i) => {
        if (l.box) return;
        // Une droite qui ne FAIT QUE toucher un coin du cadre n'a pas de corde
        // à étiqueter : deux des six ancrages du balayage (±6, ∓6) SONT des
        // coins, et une direction sortante n'y laisse qu'un point commun.
        // Il n'y a alors rien à nommer — ce n'est pas un défaut de placement.
        const ch = s.chords[i];
        const len = ch.p ? Math.hypot(ch.q.x - ch.p.x, ch.q.y - ch.p.y) : 0;
        if (len < 1) degenerate += 1; else droppedLine += 1;
      });
      n += 1;
    }
    expect(n).toBe(48 * 48 * 30);
    // Toute droite VISIBLE (corde non réduite à un point) est nommée.
    expect(droppedLine).toBe(0);
    // Les cas dégénérés existent et sont attendus : ce sont exactement les
    // scènes ancrées sur un coin. On verrouille leur nombre pour qu'une
    // régression du clipping se voie (13 824 = 1/5 des 69 120 scènes).
    expect(degenerate).toBe(13824);
    // Depuis que `placeAroundPoint` essaie des anneaux successifs, PLUS AUCUN
    // nom de point ne cède la place sur tout le balayage (c'était 8 371).
    // On verrouille le zéro : un retour au budget de 1 % masquerait la
    // régression exacte que ce correctif a supprimée.
    expect(dropped).toBe(0);
  }, 60000);
});

describe('cadres larges', () => {
  it('±15 et ±40 : graduations denses, étiquettes libres', () => {
    for (const h of [15, 40]) {
      for (const [A, u, B, v] of [
        [{ x: -3, y: -1 }, { x: 2, y: 1 }, { x: 3, y: -1 }, { x: 1, y: -1 }],
        [{ x: 0, y: 1 }, { x: 2, y: 3 }, { x: 0, y: 5 }, { x: 5, y: 2 }],
        [{ x: 0, y: -1 }, { x: 1, y: 2 }, { x: 0, y: 5 }, { x: 1, y: -1 }],
      ]) {
        const s = sceneFor(h, A, u, B, v);
        assertPlacedFree(s);
        expect(s.lineLabels.every((l) => l.box)).toBe(true);
      }
    }
  });
});
