import { describe, it, expect } from 'vitest';
import {
  DIRECTIONS, DELTA, turnLeft, turnRight, makeWorld, runProgram, evaluateRun,
  flatten, makeRepeat, instr, diffTrace, countSteps, formatProgram, describePosition,
  isWalkable, inBounds, isFlatProgram, gridToSvg, cellCenter, describeHeading,
} from './algoUtils';

/**
 * Le moteur est la source de vérité de toute la leçon : ces tests le
 * vérifient EN ISOLATION, avant toute interface (playbook §4).
 * Les missions autorées sont aussi rejouées ici — garantie de joignabilité.
 */

const HEADINGS = [0, 1, 2, 3];

describe('rotations — arithmétique modulo 4', () => {
  it('tourne dans le sens horaire', () => {
    expect(turnRight(0)).toBe(1); // N → E
    expect(turnRight(3)).toBe(0); // O → N
  });

  it('ne produit jamais de cap négatif', () => {
    expect(turnLeft(0)).toBe(3); // N → O, et non -1
    HEADINGS.forEach((h) => expect(turnLeft(h)).toBeGreaterThanOrEqual(0));
  });

  it('quatre quarts de tour ramènent au point de départ', () => {
    HEADINGS.forEach((h) => {
      expect(turnRight(turnRight(turnRight(turnRight(h))))).toBe(h);
      expect(turnLeft(turnLeft(turnLeft(turnLeft(h))))).toBe(h);
    });
  });

  it('gauche et droite sont réciproques', () => {
    HEADINGS.forEach((h) => expect(turnLeft(turnRight(h))).toBe(h));
  });

  it('DELTA reste cohérent avec l’ordre horaire de DIRECTIONS', () => {
    expect(DIRECTIONS).toEqual(['N', 'E', 'S', 'O']);
    expect(DELTA[0]).toEqual({ col: 0, row: 1 });   // N : row croît vers le haut
    expect(DELTA[1]).toEqual({ col: 1, row: 0 });   // E
    expect(DELTA[2]).toEqual({ col: 0, row: -1 });  // S
    expect(DELTA[3]).toEqual({ col: -1, row: 0 });  // O
  });
});

describe('AVANCER / TOURNER — deux effets distincts', () => {
  const base = { cols: 6, rows: 5 };

  it.each([
    [0, { col: 2, row: 3 }],
    [1, { col: 3, row: 2 }],
    [2, { col: 2, row: 1 }],
    [3, { col: 1, row: 2 }],
  ])('AVANCER avec le cap %i déplace d’une case', (heading, expected) => {
    const world = makeWorld({ ...base, start: { col: 2, row: 2, heading } });
    const { final } = runProgram(world, [instr('AVANCER')]);
    expect({ col: final.col, row: final.row }).toEqual(expected);
    expect(final.heading).toBe(heading); // avancer ne tourne pas
  });

  // La confusion n°1 en 6e : « tourner, ça avance aussi ».
  it('TOURNER change le cap sans changer la case', () => {
    const world = makeWorld({ ...base, start: { col: 2, row: 2, heading: 0 } });
    const { final } = runProgram(world, [instr('DROITE'), instr('DROITE')]);
    expect({ col: final.col, row: final.row }).toEqual({ col: 2, row: 2 });
    expect(final.heading).toBe(2);
  });
});

describe('boucle ≡ déroulé — l’invariant qui porte P7', () => {
  it('RÉPÉTER 5 [AVANCER] produit la trace de cinq AVANCER', () => {
    const world = makeWorld({ cols: 8, rows: 3, start: { col: 0, row: 0, heading: 1 } });
    const long = Array.from({ length: 5 }, () => instr('AVANCER'));
    const loop = [makeRepeat(5, [instr('AVANCER')])];

    const a = runProgram(world, long);
    const b = runProgram(world, loop);

    expect(b.final).toEqual(a.final);
    expect(b.steps).toBe(a.steps);
    expect(b.trace.map((t) => t.pos)).toEqual(a.trace.map((t) => t.pos));
    expect(diffTrace(a.trace, b.trace)).toBe(-1);
  });

  it('compresse l’écriture sans changer l’exécution', () => {
    const long = Array.from({ length: 5 }, () => instr('AVANCER'));
    const loop = [makeRepeat(5, [instr('AVANCER')])];
    expect([long.length, countSteps(long)]).toEqual([5, 5]);
    expect([loop.length, countSteps(loop)]).toEqual([1, 5]); // 1 carte écrite, 5 actions faites
  });

  it('vaut aussi pour un corps composite', () => {
    const world = makeWorld({ cols: 5, rows: 5, start: { col: 0, row: 0, heading: 1 } });
    const body = [instr('AVANCER'), instr('GAUCHE')];
    const a = runProgram(world, [makeRepeat(4, body)]);
    const b = runProgram(world, [...body, ...body, ...body, ...body]);

    expect(a.trace.map((t) => t.pos)).toEqual(b.trace.map((t) => t.pos));
    expect(a.final).toEqual({ col: 0, row: 0, heading: 1 }); // le carré se referme
  });

  it('garde la carte d’origine et le numéro d’itération pour le surlignage', () => {
    const steps = flatten([instr('GAUCHE'), makeRepeat(3, [instr('AVANCER')])]);
    expect(steps).toHaveLength(4);
    expect(steps.map((s) => s.srcIndex)).toEqual([0, 1, 1, 1]);
    expect(steps.slice(1).map((s) => s.iteration)).toEqual([0, 1, 2]);
  });
});

describe('périmètre officiel — boucles simples, sans imbrication', () => {
  it('makeRepeat refuse structurellement un RÉPÉTER imbriqué', () => {
    const nested = makeRepeat(3, [instr('AVANCER'), makeRepeat(2, [instr('AVANCER')])]);
    expect(nested.body.every((b) => b.kind !== 'REPETER')).toBe(true);
    expect(isFlatProgram([nested])).toBe(true);
  });

  it('impose au moins une répétition', () => {
    expect(makeRepeat(0, [instr('AVANCER')]).times).toBe(1);
    expect(makeRepeat(-4, [instr('AVANCER')]).times).toBe(1);
  });
});

describe('collisions — la conséquence se voit', () => {
  it('un mur bloque sans déplacer le robot', () => {
    const world = makeWorld({ cols: 3, rows: 3, start: { col: 0, row: 0, heading: 3 } });
    const r = runProgram(world, [instr('AVANCER')]);
    expect(r.blocked).toBe(true);
    expect(r.blockedAt).toBe(0);
    expect(r.final).toEqual({ col: 0, row: 0, heading: 3 });
  });

  it('ne produit jamais de coordonnée négative (périmètre 6e)', () => {
    const world = makeWorld({ cols: 3, rows: 3, start: { col: 0, row: 0, heading: 2 } });
    const { final } = runProgram(world, [instr('AVANCER'), instr('AVANCER')]);
    expect(final.col).toBeGreaterThanOrEqual(0);
    expect(final.row).toBeGreaterThanOrEqual(0);
  });

  it('s’arrête devant un obstacle et interrompt la suite', () => {
    const world = makeWorld({
      cols: 4, rows: 3, start: { col: 0, row: 0, heading: 1 }, obstacles: [{ col: 2, row: 0 }],
    });
    const r = runProgram(world, [instr('AVANCER'), instr('AVANCER'), instr('AVANCER')]);
    expect(r.final).toEqual({ col: 1, row: 0, heading: 1 });
    expect(r.trace).toHaveLength(2); // le 3e pas n'est jamais exécuté
  });

  it('inBounds et isWalkable rejettent le hors-grille', () => {
    const world = makeWorld({ cols: 4, rows: 3 });
    expect(inBounds(world, -1, 0)).toBe(false);
    expect(inBounds(world, 0, -1)).toBe(false);
    expect(isWalkable(world, 4, 0)).toBe(false);
  });
});

describe('RAMASSER', () => {
  const world = makeWorld({
    cols: 4, rows: 2, start: { col: 0, row: 0, heading: 1 },
    items: [{ col: 2, row: 0 }], target: { col: 3, row: 0 },
  });

  it('ramasse l’objet de la case courante', () => {
    const r = evaluateRun(world, [instr('AVANCER'), instr('AVANCER'), instr('RAMASSER'), instr('AVANCER')]);
    expect(r.collected).toEqual(['2,0']);
    expect(r.success).toBe(true);
  });

  it('atteindre la cible ne suffit pas si l’objet est oublié', () => {
    const r = evaluateRun(world, [instr('AVANCER'), instr('AVANCER'), instr('AVANCER')]);
    expect(r.onTarget).toBe(true);
    expect(r.gotItems).toBe(false);
    expect(r.success).toBe(false);
  });

  it('sur une case vide, RAMASSER ne fait rien', () => {
    expect(runProgram(world, [instr('RAMASSER')]).trace[0].event).toBe('nothing');
  });
});

describe('évaluation d’une mission — on juge l’exécution, pas la forme', () => {
  const world = makeWorld({ cols: 4, rows: 4, start: { col: 0, row: 0, heading: 1 }, target: { col: 2, row: 2 } });

  it('accepte plusieurs algorithmes corrects différents', () => {
    const routeA = [instr('AVANCER'), instr('AVANCER'), instr('GAUCHE'), instr('AVANCER'), instr('AVANCER')];
    const routeB = [instr('GAUCHE'), instr('AVANCER'), instr('AVANCER'), instr('DROITE'), instr('AVANCER'), instr('AVANCER')];
    expect(evaluateRun(world, routeA).success).toBe(true);
    expect(evaluateRun(world, routeB).success).toBe(true);
    expect(formatProgram(routeA)).not.toBe(formatProgram(routeB));
  });

  it('maxCards rend la boucle nécessaire sans imposer une écriture', () => {
    const corridor = makeWorld({ cols: 8, rows: 2, start: { col: 0, row: 0, heading: 1 }, target: { col: 6, row: 0 } });
    const byHand = Array.from({ length: 6 }, () => instr('AVANCER'));
    const withLoop = [makeRepeat(6, [instr('AVANCER')])];

    const hand = evaluateRun(corridor, byHand, { maxCards: 3 });
    expect(hand.onTarget).toBe(true);
    expect(hand.withinCards).toBe(false);
    expect(hand.success).toBe(false);

    expect(evaluateRun(corridor, withLoop, { maxCards: 3 }).success).toBe(true);
  });

  it('un programme vide laisse le robot au départ', () => {
    const r = runProgram(world, []);
    expect(r.trace).toHaveLength(0);
    expect(r.final).toEqual(world.start);
  });

  it('est déterministe : deux exécutions donnent la même trace', () => {
    const prog = [instr('AVANCER'), instr('GAUCHE'), instr('AVANCER')];
    expect(runProgram(world, prog)).toEqual(runProgram(world, prog));
  });

  it('n’altère jamais le programme (relançable à l’identique)', () => {
    const prog = [instr('AVANCER'), makeRepeat(2, [instr('AVANCER')])];
    const snapshot = JSON.parse(JSON.stringify(prog));
    runProgram(world, prog);
    runProgram(world, prog);
    expect(prog).toEqual(snapshot);
  });
});

describe('diffTrace — où le robot quitte le bon chemin', () => {
  it('désigne le pas fautif', () => {
    const world = makeWorld({ cols: 5, rows: 5, start: { col: 0, row: 0, heading: 1 } });
    const good = runProgram(world, [instr('AVANCER'), instr('GAUCHE'), instr('AVANCER')]);
    const bad = runProgram(world, [instr('AVANCER'), instr('DROITE'), instr('AVANCER')]);
    expect(diffTrace(good.trace, bad.trace)).toBe(1);
  });

  it('rend -1 quand les deux traces coïncident', () => {
    const world = makeWorld({ cols: 5, rows: 5, start: { col: 0, row: 0, heading: 1 } });
    const t = runProgram(world, [instr('AVANCER')]).trace;
    expect(diffTrace(t, t)).toBe(-1);
  });
});

describe('géométrie SVG — l’inversion verticale vit à un seul endroit', () => {
  const world = makeWorld({ cols: 4, rows: 3, step: 40, padX: 10, padY: 10 });

  it('place la ligne 0 en bas de l’écran', () => {
    expect(gridToSvg(world, 0, 0).y).toBeGreaterThan(gridToSvg(world, 0, 2).y);
  });

  it('calcule le centre d’une case', () => {
    expect(cellCenter(world, 0, 0)).toEqual({ x: 30, y: 110 });
    expect(cellCenter(world, 0, 2)).toEqual({ x: 30, y: 30 });
  });
});

describe('lectures affichées et ARIA', () => {
  it('décrit un programme', () => {
    expect(formatProgram([])).toBe('programme vide');
    expect(formatProgram([makeRepeat(3, [instr('AVANCER')])])).toBe('RÉPÉTER 3 × (AVANCER)');
  });

  it('décrit une position en toutes lettres', () => {
    expect(describePosition({ col: 2, row: 1, heading: 0 })).toBe('colonne 2, ligne 1, tourné vers le haut');
    expect(describeHeading(1)).toBe('la droite');
  });
});
