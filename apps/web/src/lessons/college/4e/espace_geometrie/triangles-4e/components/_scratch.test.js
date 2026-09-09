import { it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { A_DEFAUT, B_DEFAUT, C_DEPART, caracterisationRectangle, arrondi, midpoint } from './triangles4e';
it('scan', () => {
  const L = [];
  for (const pas of [4, 5, 6]) {
    let C = { ...C_DEPART }; let hit = null;
    for (let i = 0; i < 120; i++) { C = { x: C.x, y: C.y - pas }; if (caracterisationRectangle(A_DEFAUT, B_DEFAUT, C).droit) { hit = { i, y: C.y }; break; } }
    L.push(`pas ${pas} -> ${JSON.stringify(hit)}`);
  }
  // width of winning band on the vertical of a few x positions
  for (const x of [200, 250, 300, 350, 420]) {
    const w = [];
    for (let y = 60; y <= 300; y += 0.25) if (caracterisationRectangle(A_DEFAUT, B_DEFAUT, { x, y }).droit) w.push(y);
    L.push(`x=${x} band=${w.length ? arrondi(Math.max(...w) - Math.min(...w), 2) : 'none'} at y in [${w.length ? arrondi(Math.min(...w),1)+','+arrondi(Math.max(...w),1) : ''}]`);
  }
  writeFileSync('/tmp/scan3.txt', L.join('\n'));
});
