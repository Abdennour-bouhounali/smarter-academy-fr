import { H, PHYSICS } from './sim.js';

/**
 * Un pilote automatique simple pour « المستكشف » (fond de l'accueil, tests) :
 * il court vers l'avant et saute devant un mur, un trou, un danger ou un
 * ennemi. S'il termine un niveau, le niveau est jouable.
 */
export function botInput(g) {
  const pl = g.player;
  const fx = Math.floor(pl.x + PHYSICS.playerW + 0.2);
  const footY = Math.floor(pl.y + PHYSICS.playerH - 0.01);
  const tile = (x, y) => (y >= H || x < 0 || x >= g.width ? '.' : g.grid[y]?.[x] ?? '.');
  const solid = (ch) => '#B?UPS'.includes(ch);
  let danger = false;
  for (let dx = 0; dx <= 2; dx++) {
    const x = fx + dx;
    if (solid(tile(x, footY)) || solid(tile(x, footY - 1))) danger = true; // mur
    const below = tile(x, footY + 1);
    if (!solid(below) && below !== '=' && !solid(tile(x, footY + 2))) danger = true; // trou
    if (tile(x, footY) === '^' || below === '~') danger = true;
  }
  for (const e of g.enemies) {
    if (e.alive && e.x > pl.x && e.x - pl.x < 2.6 && Math.abs(e.y - pl.y) < 2.5) danger = true;
  }
  const jump = danger && pl.onGround && !g.botJumpHeld;
  g.botJumpHeld = jump ? true : pl.onGround ? false : g.botJumpHeld;
  return { forward: true, back: false, jump: jump || (g.botJumpHeld && pl.vy < 0) };
}

