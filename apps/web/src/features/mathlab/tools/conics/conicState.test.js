import { describe, it, expect } from 'vitest';
import * as S from './conicState.js';
import * as C from './conicMath.js';

/**
 * Les tests de l'état (§45, §24, §52) et de l'entraînement (§36 – §41).
 *
 * Deux choses y sont vérifiées par-dessus tout : qu'un document venu du
 * serveur ne peut PAS casser l'instrument, quelle que soit sa forme, et que
 * la borne d'octets annoncée au serveur (MathLabTools.php) est réellement
 * tenue par le client.
 */

describe('le document neuf', () => {
  it('ouvre sur un CERCLE — le programme de 4AM d\'abord', () => {
    const data = S.createConicsData();
    expect(data.scene.objects).toHaveLength(1);
    expect(data.scene.objects[0].kind).toBe('circle');
    expect(data.scene.objects[0].r).toBe(3);
    expect(data.mode).toBe('free');
  });

  it('pose une sonde, pour que §10 soit là dès la première seconde', () => {
    expect(S.createConicsData().scene.probe).toEqual({ x: 4, y: 2 });
  });

  it('commence avec un historique d\'un seul pas', () => {
    const data = S.createConicsData();
    expect(data.history).toHaveLength(1);
    expect(data.cursor).toBe(0);
    expect(S.canUndo(data)).toBe(false);
    expect(S.canRedo(data)).toBe(false);
  });

  it('accepte une amorce de leçon sans perdre ses réglages', () => {
    const data = S.createConicsData({
      scene: { objects: [{ kind: 'ellipse', h: 1, k: 2, a: 4, b: 2 }] },
      viewport: { xMin: -10, xMax: 10, yMin: -8, yMax: 8 },
    });
    expect(data.scene.objects[0]).toMatchObject({ kind: 'ellipse', h: 1, k: 2 });
    expect(data.viewport).toEqual({ xMin: -10, xMax: 10, yMin: -8, yMax: 8 });
    expect(data.settings.showFoci).toBe(true);
  });
});

describe('la relecture d\'un document (la frontière avec le JSON)', () => {
  it('ne jette JAMAIS, quelle que soit l\'entrée', () => {
    const inputs = [null, undefined, 0, 'x', [], { scene: 'nope' }, { history: 'nope' }, { scene: { objects: [null, 3] } }];
    for (const input of inputs) {
      expect(() => S.normalizeConicsData(input)).not.toThrow();
      const data = S.normalizeConicsData(input);
      expect(data.scene.objects.length).toBeGreaterThan(0);
      expect(C.isValidConic(data.scene.objects[0])).toBe(true);
    }
  });

  it('rejette un point cassé au lieu de le coercer en (0,0)', () => {
    const scene = S.normalizeScene({
      objects: [{ kind: 'circle', h: 1, k: 1, r: 2 }],
      probe: { x: 'a', y: 2 },
    });
    expect(scene.probe).toBeNull();
  });

  it('ramène les valeurs démesurées dans les bornes plutôt que de vider le document', () => {
    const scene = S.normalizeScene({ objects: [{ kind: 'circle', h: 1e12, k: -1e12, r: 1e12 }] });
    expect(scene.objects[0].h).toBe(S.COORD_LIMIT);
    expect(scene.objects[0].k).toBe(-S.COORD_LIMIT);
    expect(scene.objects[0].r).toBe(S.SIZE_LIMIT);
  });

  it('refuse un rayon nul ou négatif en le remplaçant par une valeur vivante', () => {
    expect(S.normalizeScene({ objects: [{ kind: 'circle', h: 0, k: 0, r: 0 }] }).objects[0].r).toBe(3);
    expect(S.normalizeScene({ objects: [{ kind: 'circle', h: 0, k: 0, r: -5 }] }).objects[0].r).toBe(3);
  });

  it('ne laisse pas le coefficient d\'une parabole traverser zéro (§52)', () => {
    expect(S.clampCoefficient(0)).toBe(1);
    expect(S.clampCoefficient(0.0001)).toBe(0.001);
    expect(S.clampCoefficient(-0.0001)).toBe(-0.001);
    expect(S.clampCoefficient(2)).toBe(2);
  });

  it('borne le nombre d\'objets (§24)', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({ kind: 'circle', h: i, k: 0, r: 2 }));
    const lines = Array.from({ length: 6 }, () => ({ kind: 'line', slope: 1, intercept: 0 }));
    const scene = S.normalizeScene({ objects: [...many, ...lines] });
    expect(scene.objects.filter(S.isConicObject)).toHaveLength(S.MAX_CONICS);
    expect(scene.objects.filter(S.isLineObject)).toHaveLength(S.MAX_LINES);
  });

  it('oublie une trace dont la cible n\'existe plus', () => {
    const scene = S.normalizeScene({
      objects: [{ id: 'a', kind: 'circle', h: 0, k: 0, r: 2 }],
      trace: { targetId: 'disparu', t: 1 },
    });
    expect(scene.trace).toBeNull();
  });

  it('garde une trace valide, et son paramètre plutôt que ses coordonnées', () => {
    const scene = S.normalizeScene({
      objects: [{ id: 'a', kind: 'circle', h: 0, k: 0, r: 2 }],
      trace: { targetId: 'a', t: 1.5, branch: -1 },
    });
    expect(scene.trace).toEqual({ targetId: 'a', t: 1.5, branch: -1 });
  });

  it('répare une sélection qui ne désigne rien', () => {
    const scene = S.normalizeScene({
      objects: [{ id: 'a', kind: 'circle', h: 0, k: 0, r: 2 }],
      selectedId: 'fantome',
    });
    expect(scene.selectedId).toBe('a');
  });
});

describe('l\'historique (§45)', () => {
  const circleScene = (r) => ({ objects: [{ id: 'a', kind: 'circle', h: 0, k: 0, r }] });

  it('un GESTE ne pousse rien ; son relâchement pousse un pas', () => {
    let data = S.createConicsData();
    data = S.replaceScene(data, circleScene(4));
    data = S.replaceScene(data, circleScene(5));
    expect(data.history).toHaveLength(1);
    data = S.pushScene(data, circleScene(5));
    expect(data.history).toHaveLength(2);
  });

  it('تراجع recule le curseur sans rien détruire ; إعادة revient', () => {
    let data = S.createConicsData();
    data = S.pushScene(data, circleScene(4));
    data = S.pushScene(data, circleScene(5));
    expect(data.scene.objects[0].r).toBe(5);

    data = S.undo(data);
    expect(data.scene.objects[0].r).toBe(4);
    expect(S.canRedo(data)).toBe(true);

    data = S.redo(data);
    expect(data.scene.objects[0].r).toBe(5);
  });

  it('rejouer après un تراجع coupe la branche abandonnée', () => {
    let data = S.createConicsData();
    data = S.pushScene(data, circleScene(4));
    data = S.pushScene(data, circleScene(5));
    data = S.undo(data);
    data = S.pushScene(data, circleScene(9));
    expect(S.canRedo(data)).toBe(false);
    expect(data.scene.objects[0].r).toBe(9);
  });

  it('un pas qui ne change RIEN n\'est pas un pas', () => {
    let data = S.createConicsData();
    const scene = data.scene;
    data = S.pushScene(data, scene);
    expect(data.history).toHaveLength(1);
  });

  it('l\'historique est borné à MAX_HISTORY', () => {
    let data = S.createConicsData();
    for (let i = 1; i <= S.MAX_HISTORY + 15; i += 1) data = S.pushScene(data, circleScene(i));
    expect(data.history).toHaveLength(S.MAX_HISTORY);
    expect(data.cursor).toBe(S.MAX_HISTORY - 1);
    // Le plus ancien a été oublié, le plus récent est là.
    expect(data.scene.objects[0].r).toBe(S.MAX_HISTORY + 15);
  });
});

describe('les gestes sur la scène', () => {
  it('changer de famille GARDE le centre (§21)', () => {
    const data = S.createConicsData();
    const id = data.scene.objects[0].id;
    const moved = S.updateObject(data.scene, id, { h: 2, k: -1 });
    const changed = S.changeKind(moved, id, 'ellipse');
    expect(changed.objects[0]).toMatchObject({ kind: 'ellipse', h: 2, k: -1 });
  });

  it('on ne peut pas supprimer la DERNIÈRE conique', () => {
    const data = S.createConicsData();
    const scene = S.removeObject(data.scene, data.scene.objects[0].id);
    expect(scene.objects).toHaveLength(1);
  });

  it('ajouter au-delà de la borne ne fait rien', () => {
    let scene = S.createConicsData().scene;
    for (let i = 0; i < 10; i += 1) scene = S.addConic(scene, { kind: 'circle', h: i, k: 0, r: 1 });
    expect(scene.objects.filter(S.isConicObject)).toHaveLength(S.MAX_CONICS);
  });

  it('supprimer une conique oublie la trace qui la visait', () => {
    let scene = S.createConicsData().scene;
    scene = S.addConic(scene, { kind: 'ellipse', h: 0, k: 0, a: 4, b: 2 });
    const target = scene.objects[1].id;
    scene = { ...scene, trace: { targetId: target, t: 1, branch: 1 } };
    scene = S.removeObject(scene, target);
    expect(scene.trace).toBeNull();
  });

  it('l\'aimant arrondit au pas, et se tait quand il est éteint', () => {
    expect(S.snapValue(2.4, { snap: true, snapStep: 1 })).toBe(2);
    expect(S.snapValue(2.4, { snap: true, snapStep: 0.5 })).toBe(2.5);
    expect(S.snapValue(2.4, { snap: false })).toBe(2.4);
  });
});

describe('§44 — l\'état de référence', () => {
  it('fige la scène courante, et la libère', () => {
    let data = S.createConicsData();
    data = S.freezeReference(data);
    expect(data.reference.objects[0].r).toBe(3);
    data = S.pushScene(data, { objects: [{ id: 'a', kind: 'circle', h: 0, k: 0, r: 6 }] });
    // La référence ne suit PAS la scène : c'est tout son intérêt.
    expect(data.reference.objects[0].r).toBe(3);
    expect(data.scene.objects[0].r).toBe(6);
    data = S.clearReference(data);
    expect(data.reference).toBeNull();
  });
});

describe('la taille du document (la borne du serveur)', () => {
  it('le pire cas reste sous la borne annoncée à MathLabTools.php', () => {
    // Quatre coniques, deux droites, une trace, un lieu, une sonde — et
    // l'historique plein. C'est le document le plus lourd que l'instrument
    // sache produire.
    let scene = {
      objects: [
        { id: 'c1', kind: 'circle', h: -1234.5678, k: 1234.5678, r: 999.1234, color: '#2563eb', label: 'ABCDEFGH' },
        { id: 'c2', kind: 'ellipse', h: -1234.5678, k: 1234.5678, a: 999.1234, b: 888.4321, color: '#059669', label: 'ABCDEFGH' },
        { id: 'c3', kind: 'hyperbola', h: -1234.5678, k: 1234.5678, a: 999.1234, b: 888.4321, orientation: 'vertical', color: '#b45309', label: 'ABCDEFGH' },
        { id: 'c4', kind: 'parabola', h: -1234.5678, k: 1234.5678, a: -99.8765, orientation: 'vertical', color: '#7c3aed', label: 'ABCDEFGH' },
        { id: 'l1', kind: 'line', slope: -12.3456, intercept: 98.7654, color: '#db2777' },
        { id: 'l2', kind: 'line', vertical: true, x: -1234.5678, color: '#db2777' },
      ],
      selectedId: 'c1',
      probe: { x: -1234.5678, y: 1234.5678 },
      trace: { targetId: 'c1', t: -3.14159265, branch: -1 },
      locus: { kind: 'equidistant', focus: { x: -1234.5678, y: 1234.5678 }, directrix: { kind: 'vertical', value: -999.8 } },
    };
    scene = S.normalizeScene(scene);

    let data = S.createConicsData();
    data = { ...data, scene, history: Array.from({ length: S.MAX_HISTORY }, () => scene), cursor: S.MAX_HISTORY - 1 };
    data = S.freezeReference(data);

    const bytes = new TextEncoder().encode(JSON.stringify(S.serializeConicsData(data))).length;
    // La borne déclarée côté serveur pour `conics`.
    expect(bytes).toBeLessThan(60_000);
  });

  it('ne sérialise QUE de la mathématique', () => {
    const data = S.createConicsData();
    const keys = Object.keys(S.serializeConicsData({ ...data, challenge: 'X', panelOpen: true }));
    expect(keys).not.toContain('challenge');
    expect(keys).not.toContain('panelOpen');
    expect(keys.sort()).toEqual(
      ['cursor', 'history', 'mode', 'practice', 'reference', 'scene', 'settings', 'viewport'],
    );
  });

  it('un document sérialisé se relit à l\'identique', () => {
    let data = S.createConicsData();
    data = S.pushScene(data, { objects: [{ id: 'a', kind: 'ellipse', h: 1, k: 2, a: 4, b: 2 }] });
    const reread = S.normalizeConicsData(JSON.parse(JSON.stringify(S.serializeConicsData(data))));
    expect(reread.scene.objects[0]).toMatchObject({ kind: 'ellipse', h: 1, k: 2, a: 4, b: 2 });
    expect(reread.history).toHaveLength(data.history.length);
    expect(reread.cursor).toBe(data.cursor);
  });
});

/**
 * LE CONTRAT D'AMORCE (openMathLab.js → createConicsData), tel qu'il est
 * documenté dans `docs/lessons/LESSON_DEVELOPMENT_GUIDE.md`.
 *
 * Une leçon écrira un jour cette forme ; ces tests la tiennent, pour que la
 * documentation ne puisse pas dériver du code.
 */
describe('le contrat d\'amorce d\'une leçon (§6)', () => {
  it('accepte la forme documentée', () => {
    const d = S.createConicsData({
      scene: { objects: [{ kind: 'ellipse', h: 1, k: -2, a: 4, b: 2 }], probe: { x: 3, y: 1 } },
      viewport: { xMin: -10, xMax: 10, yMin: -8, yMax: 8 },
    });
    expect(d.scene.objects[0]).toMatchObject({ kind: 'ellipse', h: 1, k: -2, a: 4, b: 2 });
    expect(d.scene.probe).toEqual({ x: 3, y: 1 });
    expect(d.viewport).toEqual({ xMin: -10, xMax: 10, yMin: -8, yMax: 8 });
    expect(d.practice).toEqual({ solved: 0, attempts: 0 });
  });

  it('accepte une droite et chaque famille de conique', () => {
    const d = S.createConicsData({ scene: { objects: [
      { kind: 'circle', h: 0, k: 0, r: 2 },
      { kind: 'parabola', h: 0, k: 0, a: 0.5, orientation: 'vertical' },
      { kind: 'hyperbola', h: 0, k: 0, a: 2, b: 3, orientation: 'vertical' },
      { kind: 'line', slope: 1, intercept: 0 },
      { kind: 'line', vertical: true, x: 2 },
    ] } });
    expect(d.scene.objects).toHaveLength(5);
    for (const o of d.scene.objects.filter((x) => x.kind !== 'line')) {
      expect(C.isValidConic(o)).toBe(true);
    }
  });

  it('n\'amorce JAMAIS un score d\'entraînement, quoi que dise l\'amorce', () => {
    const d = S.createConicsData({ scene: { objects: [{ kind: 'circle', h: 0, k: 0, r: 1 }] }, practice: { solved: 99, attempts: 99 } });
    expect(d.practice).toEqual({ solved: 0, attempts: 0 });
  });

  it('retombe sur le cercle quand l\'amorce ne porte rien d\'utilisable', () => {
    for (const seed of [null, {}, { scene: { objects: [] } }, { scene: { objects: [{ kind: 'nope' }] } }]) {
      const d = S.createConicsData(seed);
      expect(d.scene.objects[0].kind).toBe('circle');
    }
  });
});
