/** Mock-up B « فانوس التكبير » in 3D: a tiled wall at night, the rail, the lantern at distance k, the square it lights. */
import { THREE, stage, clear, box, bar, tiles, label, std, glow } from './common';

const S = stage({ target: [4.5, 3.6, 3], dist: 19, az: 0.85, el: 0.3, night: 1 });
const N = 11; // the wall is N by N tiles
let state = { a: 30, k: 5, side: '5' };

function build() {
  const { a, k, side } = state;
  const L = Math.sqrt(a);
  const w = S.world;
  clear(w);
  w.add(box(N + 8, 1, N + 10, std(0x3b4a66), N / 2, -0.5, N / 2 - 1));
  w.add(box(N + 1, N + 1, 0.6, std(0x0f172a), N / 2, N / 2, -0.32));
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(N, N),
    new THREE.MeshStandardMaterial({ map: tiles(N, N, { base: '#334155', line: '#64748b' }), roughness: 0.8 }),
  );
  wall.position.set(N / 2, N / 2, 0);
  w.add(wall);
  // the square painted on the wall (a tiles), from the bottom corner
  const blue = glow(0x60a5fa, 1.4);
  [
    [
      [0, 0],
      [L, 0],
    ],
    [
      [L, 0],
      [L, L],
    ],
    [
      [L, L],
      [0, L],
    ],
    [
      [0, L],
      [0, 0],
    ],
  ].forEach(([p, q]) => w.add(bar([p[0], p[1], 0.06], [q[0], q[1], 0.06], 0.06, blue)));
  // the light: a square of side k, and the beam from the lantern to its four corners
  const lit = new THREE.Mesh(
    new THREE.PlaneGeometry(k, k),
    new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.8 }),
  );
  lit.position.set(k / 2, k / 2, 0.03);
  w.add(lit);
  const apex = [0, 0.3, k];
  const c = [
    [0, 0, 0.04],
    [k, 0, 0.04],
    [k, k, 0.04],
    [0, k, 0.04],
  ];
  const pos = [];
  for (let i = 0; i < 4; i++) pos.push(...apex, ...c[i], ...c[(i + 1) % 4]);
  const beam = new THREE.BufferGeometry();
  beam.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  w.add(
    new THREE.Mesh(
      beam,
      new THREE.MeshBasicMaterial({
        color: 0xfde047,
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    ),
  );
  // the rail with its marks, the lantern on its cart
  w.add(bar([0, 0.06, 0], [0, 0.06, N + 0.5], 0.07, std(0x94a3b8)));
  for (let i = 0; i <= N; i++) w.add(box(0.5, 0.05, 0.06, std(0xe2e8f0), 0, 0.04, i));
  w.add(box(0.7, 0.2, 0.7, std(0x475569), 0, 0.12, k));
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), glow(0xfde047, 2.2));
  lamp.position.set(0, 0.45, k);
  w.add(lamp);
  const light = new THREE.PointLight(0xfde68a, 60, 30);
  light.position.set(0.4, 1.2, k);
  w.add(light);
  const dist = label(side, 0.8, '#1d4ed8');
  dist.position.set(-1.3, 2.6, k);
  const plaque = label(a + ' بلاطة', 0.9);
  plaque.position.set(L / 2, L + 0.7, 0.3);
  w.add(dist, plaque);
  S.robot.root.position.set(-1.4, 0, k + 0.2);
  S.robot.root.rotation.y = Math.PI;
}

document.getElementById('zin').onclick = () => S.zoom(0.85);
document.getElementById('zout').onclick = () => S.zoom(1.18);
window.scene3d = {
  update(next) {
    state = next;
    build();
  },
};
build();
