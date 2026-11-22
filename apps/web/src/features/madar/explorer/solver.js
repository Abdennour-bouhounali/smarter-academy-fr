import { PHYSICS, createExplorer, step } from './sim.js';

/**
 * La PREUVE qu'un niveau de « المستكشف » se termine, avec la vraie physique :
 * une recherche en profondeur sur des copies du monde. Depuis chaque position
 * au sol, on essaie courir, attendre, et des sauts de plusieurs hauteurs ; on
 * garde les coups qui se reposent vivant (hors des trous) et on explore
 * d'abord le plus avancé, avec retour arrière. Utilisé par les tests
 * (`sim.test.js`) : un niveau que le solveur ne termine pas est un niveau cassé.
 */
const FRAME = 1 / 60;
const doomed = (c) => c.status === 'dead' || c.player.y + PHYSICS.playerH > 12.3;

const ACTIONS = [
  { name: 'run', frames: 10, input: () => ({ forward: true }) },
  { name: 'wait', frames: 20, input: () => ({}) },
  ...[3, 8, 14, 22, 30].map((hold) => ({ name: `jump${hold}`, frames: 120, land: true, input: (i) => ({ forward: true, jump: i < hold }) })),
  ...[8, 22].map((hold) => ({ name: `hop${hold}`, frames: 120, land: true, input: (i) => ({ jump: i < hold }) })),
];

function apply(g, action) {
  const c = structuredClone(g);
  let airborne = false;
  for (let i = 0; i < action.frames && c.status === 'running'; i++) {
    step(c, FRAME, action.input(i));
    if (doomed(c)) return null;
    if (!c.player.onGround) airborne = true;
    if (action.land && airborne && c.player.onGround) break;
  }
  if (c.status === 'dead' || doomed(c)) return null;
  return c;
}

export function solveLevel(n, { budget = 6000 } = {}) {
  const start = createExplorer(n);
  for (let i = 0; i < 30; i++) step(start, FRAME, {});
  const stack = [start];
  const seen = new Set();
  let nodes = 0;
  let furthest = 0;
  while (stack.length && nodes < budget) {
    const g = stack.pop();
    if (g.status === 'won') return { solved: true, nodes, furthest: g.width, state: g };
    const key = `${Math.round(g.player.x * 2)}|${Math.round(g.player.y * 2)}|${g.enemies.filter((e) => e.alive).length}`;
    if (seen.has(key)) continue;
    seen.add(key);
    nodes += 1;
    furthest = Math.max(furthest, g.player.x);
    const children = [];
    for (const a of ACTIONS) {
      const c = apply(g, a);
      if (!c) continue;
      if (c.status === 'won') return { solved: true, nodes, furthest: c.width, state: c };
      if (c.status === 'running') children.push(c);
    }
    children.sort((a, b) => a.player.x - b.player.x);
    stack.push(...children);
  }
  return { solved: false, nodes, furthest: Math.round(furthest) };
}
