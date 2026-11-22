/** Mock-up A « قصر الساحات » in 3D: a terrace of the ksar, its square court, the rod, the platform and the lift. */
import { THREE, stage, clear, box, bar, tiles, label, std, glow, makeTree, seeded } from './common';

const S = stage({ target: [3, 2, 3], dist: 26, az: 0.62, el: 0.5 });
const OCHRE = 0xd9a066;
const WALL = 0xc98d4f;
let state = { a: 30, s: 5, verdict: 'band', side: '5' };
let platform = null;
let lift = 0; // seconds since the platform started to ride

function build() {
  const { a, s, verdict, side } = state;
  const L = Math.sqrt(a);
  const w = S.world;
  clear(w);
  lift = 0;
  // the terrace, the cliff of the ksar behind it, the terrace above
  w.add(box(L + 9, 1.4, L + 6.5, std(OCHRE), L / 2, -1.2, L / 2 + 0.6));
  w.add(box(L + 15, 20, 9, std(0xcf9257), L / 2, -2, -6));
  w.add(box(L + 4, 0.5, 3, std(OCHRE), L / 2, 8.05, -0.4));
  const rand = seeded(3);
  [
    [-3.2, -0.5, L + 1.8],
    [L + 3.2, -0.5, 0.6],
    [-4, 8, -4],
    [L + 4.5, 8, -5],
  ].forEach(([x, y, z]) => {
    const t = makeTree('meadow', rand, 1.5);
    t.position.set(x, y, z);
    w.add(t);
  });
  // the court: its tiles (cut along the two far walls when the area is not a square), its four low walls
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(L, L),
    new THREE.MeshStandardMaterial({ map: tiles(L, L), roughness: 0.9 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(L / 2, -0.49, L / 2);
  floor.receiveShadow = true;
  w.add(floor);
  const wall = std(WALL);
  w.add(box(L + 0.7, 0.5, 0.35, wall, L / 2, -0.25, -0.175), box(L + 0.7, 0.5, 0.35, wall, L / 2, -0.25, L + 0.175));
  w.add(box(0.35, 0.5, L, wall, -0.175, -0.25, L / 2), box(0.35, 0.5, L, wall, L + 0.175, -0.25, L / 2));
  // the two rails of the lift, up the cliff
  w.add(
    box(0.18, 9, 0.18, glow(0x7dd3fc, 0.6), 0.3, 4, -0.9),
    box(0.18, 9, 0.18, glow(0x7dd3fc, 0.6), L - 0.3, 4, -0.9),
  );
  if (verdict === 'band') {
    const band = new THREE.Mesh(
      new THREE.PlaneGeometry(L, L),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.6 }),
    );
    band.rotation.x = -Math.PI / 2;
    band.position.set(L / 2, -0.48, L / 2);
    band.userData.pulse = true;
    w.add(band);
  }
  // the platform built on the rod, from the corner post
  const col = verdict === 'jam' ? 0x8b5cf6 : verdict === 'ride' ? 0x22c55e : 0x3b82f6;
  platform = box(
    s,
    0.22,
    s,
    new THREE.MeshStandardMaterial({
      color: col,
      emissive: col,
      emissiveIntensity: 0.25,
      transparent: true,
      opacity: 0.9,
    }),
  );
  platform.position.set(s / 2, verdict === 'jam' ? 0.13 : -0.37, L - s / 2);
  if (verdict === 'jam') platform.rotation.z = -0.035;
  w.add(platform);
  // the post, the rod pulled along the near wall, what is written
  w.add(bar([0, -0.5, L + 0.75], [0, 0.6, L + 0.75], 0.16, std(0x1e3a8a)));
  w.add(bar([0, 0.25, L + 0.75], [Math.max(0.02, s), 0.25, L + 0.75], 0.09, glow(0x2563eb, 0.9)));
  const plaque = label(a + ' بلاطة', 1.1);
  plaque.position.set(L / 2, 1.9, -0.2);
  const rodText = label(side, 0.8, '#1d4ed8');
  rodText.position.set(s / 2, 1.25, L + 0.9);
  w.add(plaque, rodText);
  S.view.target.set(L / 2, 2.6, L / 2 - 0.5);
  S.view.dist = 13 + L * 1.5;
}

S.frame((dt, t) => {
  const { s, verdict } = state;
  const L = Math.sqrt(state.a);
  S.world.children.forEach((o) => o.userData.pulse && (o.material.opacity = 0.4 + 0.25 * Math.sin(t * 4)));
  let y = -0.5;
  let px = Math.max(0.02, s);
  let pz = L + 1.5;
  if (verdict === 'ride' && platform) {
    // the platform touches the four walls: it rides up the cliff, waits, and comes back
    lift += dt;
    const k = (lift % 9) / 9;
    const up = k < 0.15 ? 0 : k < 0.5 ? (k - 0.15) / 0.35 : k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
    const e = up * up * (3 - 2 * up);
    platform.position.y = -0.37 + e * 8.5;
    y = platform.position.y + 0.11;
    px = s / 2;
    pz = L - s / 2;
  }
  S.robot.root.position.set(px, y, pz);
  S.robot.root.rotation.y = verdict === 'ride' ? Math.PI * 0.15 : Math.PI;
});

document.getElementById('zin').onclick = () => S.zoom(0.85);
document.getElementById('zout').onclick = () => S.zoom(1.18);
window.scene3d = {
  update(next) {
    state = next;
    build();
  },
};
build();
