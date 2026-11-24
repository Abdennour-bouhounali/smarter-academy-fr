/**
 * THE TOP VIEW of a stage (owner, 2026-11-24: « to see all the distances and the shape »). Pure
 * framing and label placement; `Game.js › toggleTop` uses them. The camera stands above the stage's figure and looks
 * straight down; the top of the screen is the way the lens looked before (so left and right stay his).
 * A TRUE view from above, as near a plan as a perspective lens gives: a narrow lens (TOP_FOV) from high up, so that a
 * pyramid of 146 m no longer leans over the figure beside it (with the play lens of 55° from a few hundred metres the
 * view was oblique and the Great Pyramid's body hid the plateau's figure — the walk, 2026-11-24).
 */
import * as THREE from 'three';

/** The lens of the top view, degrees (the play lens is 55°). */
export const TOP_FOV = 15;

const MARGIN = 10; // metres of ground kept round the figure

/**
 * The part of the screen the HUD leaves clear, as fractions of the view: the instruction and the fact above, the buttons
 * below, the register's and the recall's cards on the sides (the walk's screenshots of the river, 2026-11-24).
 */
const CLEAR = { top: 0.3, bottom: 0.12, width: 0.8 };

/**
 * The shot framing every point (x, y, z) of a stage from above, inside the part of the screen the HUD leaves clear:
 * `dir` the ground direction « up » on screen as the lens looked (the view may turn by a quarter so that a long figure
 * lies along the screen's width), `fov` the vertical angle of the lens (degrees), `aspect` width / height.
 * Returns { pos, look, k, height, dir }.
 */
export function topFrame({ points, dir, fov = TOP_FOV, aspect = 16 / 9 }) {
  const pts = points.filter((p) => p && Number.isFinite(p.x) && Number.isFinite(p.z));
  const l = Math.hypot(dir.x, dir.z) || 1;
  const t = Math.tan(((fov / 2) * Math.PI) / 180);
  const top = Math.max(0, ...pts.map((p) => p.y ?? 0));
  const band = 1 - CLEAR.top - CLEAR.bottom;
  const frame = (f) => {
    const r = { x: -f.z, z: f.x }; // the screen's right for a lens looking along f
    const along = pts.map((p) => p.x * f.x + p.z * f.z);
    const across = pts.map((p) => p.x * r.x + p.z * r.z);
    const [a0, a1] = [Math.min(...along), Math.max(...along)];
    const [b0, b1] = [Math.min(...across), Math.max(...across)];
    const height =
      Math.max(((a1 - a0) / 2 + MARGIN) / (t * band), ((b1 - b0) / 2 + MARGIN) / (t * aspect * CLEAR.width), 30) + top;
    // the clear band's middle is below the screen's: the figure is moved down the screen by looking further up
    const am = (a0 + a1) / 2 + ((CLEAR.top - CLEAR.bottom) / 2) * 2 * height * t;
    const bm = (b0 + b1) / 2;
    return { f, height, c: { x: f.x * am + r.x * bm, z: f.z * am + r.z * bm } };
  };
  const f0 = { x: dir.x / l, z: dir.z / l };
  const turns = [f0, { x: -f0.z, z: f0.x }, { x: f0.z, z: -f0.x }];
  const best = turns.map(frame).reduce((b, x) => (x.height < b.height * 0.9 ? x : b));
  const { f, height, c } = best;
  // a hair off the vertical, only so that « up » on the screen is `f` (a lens looking exactly down has no up)
  return {
    pos: new THREE.Vector3(c.x - f.x * height * 0.002, height, c.z - f.z * height * 0.002),
    look: new THREE.Vector3(c.x, 0, c.z),
    k: 3,
    height,
    dir: f,
    fov,
  };
}

/** The screen rectangle of a fixed-size sprite at `p` (projected NDC), in pixels. */
const rectOf = (ndc, s, W, H, k) => ({ x: ((ndc.x + 1) / 2) * W, y: ((1 - ndc.y) / 2) * H, w: s.x * k, h: s.y * k });
const STEP = 3; // px, a ring of the search for a free place
const meet = (a, b, pad) =>
  Math.abs(a.x - b.x) * 2 < a.w + b.w + pad * 2 && Math.abs(a.y - b.y) * 2 < a.h + b.h + pad * 2;

/**
 * Moves the labels `sprites` (each a fixed-size sprite) so that none prints over another in the top view `shot`: a label
 * meeting one already placed goes to the nearest free place on the screen (up, sideways, down), never off it. Each keeps its home
 * (`userData.home`) and is moved FROM it; returns the sprites moved (to put back when the view closes).
 * `labelK`: px on screen per unit of a sprite's scale NOW (a sprite of fixed size is drawn in the units of the lens it
 * is seen through — Game.js keeps the labels' size while the lens narrows); by default that of the shot's lens.
 * `keepOut`: screen rectangles { x, y, w, h } (centres, px) no label may print over (Zero's bubble, the HUD's cards).
 */
export function declutter(
  sprites,
  shot,
  { viewH = 768, aspect = 16 / 9, fov = shot.fov ?? TOP_FOV, pad = 3, labelK = null, keepOut = [] } = {},
) {
  const cam = new THREE.PerspectiveCamera(fov, aspect, 1, 20000);
  cam.position.copy(shot.pos);
  cam.lookAt(shot.look);
  cam.updateMatrixWorld();
  const W = viewH * aspect;
  const k = labelK ?? viewH / 2 / Math.tan(((fov / 2) * Math.PI) / 180);
  const metrePerPx = (2 * shot.height * Math.tan(((fov / 2) * Math.PI) / 180)) / viewH;
  const v = new THREE.Vector3();
  const items = sprites.map((o) => {
    if (!o.userData.home) o.userData.home = o.position.clone();
    o.position.copy(o.userData.home);
    o.updateMatrixWorld();
    o.getWorldPosition(v);
    return { o, r: rectOf(v.clone().project(cam), o.scale, W, viewH, k) };
  });
  // a point's letter stays on its point: the letters are placed first, from the bottom of the screen up, and a length
  // gives way to them (the river's S was pushed off its stake, 2026-11-24)
  const letter = (o) => /^[A-Z][′']?$/.test(o.userData.text ?? '');
  items.sort((a, b) => letter(b.o) - letter(a.o) || b.r.y - a.r.y);
  const placed = [...keepOut];
  const moved = [];
  const inside = (r) => r.x - r.w / 2 >= 0 && r.x + r.w / 2 <= W && r.y - r.h / 2 >= 0 && r.y + r.h / 2 <= viewH;
  // the nearest free place, ring by ring round its home: up, sideways, down, then the diagonals — three labels of a
  // stick 3 m long, at the scale of a pyramid, no longer stand in a column over it (the walk, 2026-11-24)
  const WAYS = [
    [0, -1],
    [-1, 0],
    [1, 0],
    [0, 1],
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];
  for (const it of items) {
    let off = [0, 0];
    if (placed.some((p) => meet(p, it.r, pad))) {
      search: for (let n = 1; n <= 80; n += 1)
        for (const [a, b] of WAYS) {
          const d = [a * n * STEP, b * n * STEP];
          const r = { ...it.r, x: it.r.x + d[0], y: it.r.y + d[1] };
          if (inside(r) && !placed.some((p) => meet(p, r, pad))) {
            off = d;
            break search;
          }
        }
    }
    placed.push({ ...it.r, x: it.r.x + off[0], y: it.r.y + off[1] });
    if (off[0] || off[1]) {
      const up = -off[1] * metrePerPx;
      const right = off[0] * metrePerPx;
      it.o.position.x += shot.dir.x * up - shot.dir.z * right;
      it.o.position.z += shot.dir.z * up + shot.dir.x * right;
      moved.push(it.o);
    }
  }
  return moved;
}
