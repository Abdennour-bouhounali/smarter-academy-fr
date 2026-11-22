/** Mock-up C « أوتاد وحبال » in 3D: pillars over the sea, the rope the robot throws, the square built on it. */
import { THREE, stage, clear, box, bar, label, std, glow } from './common';

const S = stage({ target: [4, 0, -5], dist: 24, az: 0.5, el: 0.85 });
const G = 2; // the distance between two pillars
let state = { p: 2, q: 1 };

// the sea and the pillars never change: they are built once, outside the group that is rebuilt
const sea = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), std(0x7cc4ee, { flatShading: false, roughness: 0.35 }));
sea.rotation.x = -Math.PI / 2;
sea.position.y = -3.2;
sea.receiveShadow = true;
S.scene.add(sea);
const stone = std(0xd6c7a1);
const cap = std(0x1e3a8a);
for (let i = 0; i <= 5; i++)
  for (let j = 0; j <= 5; j++) {
    const main = i >= 0 && i <= 5 && j <= 5;
    const r = main ? 0.42 : 0.14;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.15, 3.2, 14), main ? stone : std(0xb9c6d8));
    pillar.position.set(i * G, -1.6, -j * G);
    pillar.castShadow = true;
    S.scene.add(pillar);
    if (main) S.scene.add(box(1, 0.14, 1, cap, i * G, 0.07, -j * G));
  }

function build() {
  const { p, q } = state;
  const w = S.world;
  clear(w);
  // the square built on the rope: its four corners are pillars too
  const pts = [
    [0, 0],
    [p, q],
    [p - q, p + q],
    [-q, p],
  ].map(([x, z]) => [x * G, 0.32, -z * G]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([...pts[0], ...pts[1], ...pts[2], ...pts[0], ...pts[2], ...pts[3]], 3),
  );
  geo.computeVertexNormals();
  w.add(
    new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.88, side: THREE.DoubleSide }),
    ),
  );
  const edge = glow(0x1d4ed8, 0.8);
  for (let i = 1; i < 4; i++) w.add(bar(pts[i], pts[(i + 1) % 4], 0.07, edge));
  // the rope, from the robot's pillar to the pillar he chose
  w.add(bar([0, 0.35, 0], [p * G, 0.35, -q * G], 0.11, glow(0xf59e0b, 1)));
  const end = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 10), glow(0xf59e0b, 1.2));
  end.position.set(p * G, 0.45, -q * G);
  w.add(end);
  const n = p * p + q * q;
  const area = label(n + ' بلاطة', 1.1);
  area.position.set(((p - q) * G) / 2, 2.4, (-(p + q) * G) / 2);
  const rope = label('√' + n + (Number.isInteger(Math.sqrt(n)) ? ' = ' + Math.sqrt(n) : ''), 0.85, '#b45309');
  rope.position.set((p * G) / 2, 1.5, (-q * G) / 2);
  w.add(area, rope);
  S.robot.root.position.set(0, 0.14, 0);
  S.robot.root.rotation.y = Math.atan2(p, -q) + Math.PI;
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
