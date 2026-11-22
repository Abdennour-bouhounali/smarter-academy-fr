/**
 * The 3D view of the three mock-up pages `../roots-world-{A,B,C}-*.html` — what they share.
 * It draws with the REAL engine of the game worlds (the robot « زيرو », the sky, the clouds, the materials of
 * `apps/web/src/lessons/common/gameworld/engine/`), so the sketch has the look of « أرخبيل القواسم ».
 * A sketch only: no game runtime, no walk, no forge. Built into the pages by `build.mjs`.
 */
import * as THREE from 'three';
import { makeRobot } from '../../../../apps/web/src/lessons/common/gameworld/engine/robot';
import {
  makeSky,
  makeCloud,
  makeTree,
  seeded,
  std,
  glow,
  textSprite,
} from '../../../../apps/web/src/lessons/common/gameworld/engine/builders';

export { THREE, std, glow, textSprite, makeTree, seeded };

export const box = (w, h, d, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
};

/** A bar between two points (a rod, a rope, a rail). */
export const bar = (a, b, r, mat) => {
  const A = new THREE.Vector3(...a);
  const B = new THREE.Vector3(...b);
  const len = Math.max(0.001, A.distanceTo(B));
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 12), mat);
  m.position.copy(A).add(B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  m.castShadow = true;
  return m;
};

/** A floor of unit tiles, `w` by `d` units, drawn on a canvas (cut tiles show along two edges when w is not whole). */
export const tiles = (w, d, { base = '#ecd9ae', line = '#b88a3e' } = {}) => {
  const px = 64;
  const c = document.createElement('canvas');
  c.width = Math.max(8, Math.round(w * px));
  c.height = Math.max(8, Math.round(d * px));
  const g = c.getContext('2d');
  g.fillStyle = base;
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = line;
  for (let i = 0; i <= w; i++) g.fillRect(i * px - 1.5, 0, 3, c.height);
  for (let j = 0; j <= d; j++) g.fillRect(0, c.height - j * px - 1.5, c.width, 3);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

/** A label that always faces the camera and is never hidden; a text with no Arabic letter is drawn left to right. */
export const label = (text, h = 0.9, bg = '#0f2147') => {
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  const font = '800 76px Cairo, "Noto Kufi Arabic", "Segoe UI", Tahoma, sans-serif';
  g.font = font;
  c.width = Math.ceil(g.measureText(text).width + 90);
  c.height = 128;
  g.font = font;
  g.direction = /[\u0600-\u06FF]/.test(text) ? 'rtl' : 'ltr';
  g.fillStyle = bg;
  g.beginPath();
  g.roundRect(0, 0, c.width, c.height, 44);
  g.fill();
  g.fillStyle = '#ffffff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, c.width / 2, 70);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  sprite.scale.set((h * c.width) / c.height, h, 1);
  sprite.renderOrder = 20;
  return sprite;
};

/**
 * The stage: renderer, sky, clouds, lights with shadows, the robot, a camera the mouse turns.
 * `frame(fn)` registers what moves; `world` is the group a page rebuilds at each change.
 */
export function stage({ target = [0, 1, 0], dist = 24, az = 0.7, el = 0.55, night = 0 } = {}) {
  const canvas = document.getElementById('c3d');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const sky = makeSky();
  if (night) {
    sky.material.uniforms.top.value.set(0x0b1533);
    sky.material.uniforms.bottom.value.set(0x24345f);
    sky.material.uniforms.night.value = 1;
  }
  scene.add(sky);
  scene.fog = new THREE.Fog(night ? 0x1b2a52 : 0xcdeeff, 60, 220);
  scene.add(new THREE.HemisphereLight(night ? 0x8fa8ff : 0xffffff, night ? 0x2a3560 : 0xb9a377, night ? 1.25 : 1.15));
  const sun = new THREE.DirectionalLight(0xfff1d6, night ? 0.9 : 2.1);
  sun.position.set(14, 26, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 90 });
  scene.add(sun);
  const rand = seeded(7);
  for (let i = 0; i < 16; i++) {
    const c = makeCloud(rand, 1.5 + rand() * 2.5);
    const a = rand() * Math.PI * 2;
    const r = 34 + rand() * 60;
    c.position.set(Math.cos(a) * r, -9 - rand() * 9, Math.sin(a) * r);
    scene.add(c);
  }
  const world = new THREE.Group();
  scene.add(world);
  const robot = makeRobot();
  robot.root = robot.group;
  scene.add(robot.root);

  const camera = new THREE.PerspectiveCamera(42, 2, 0.1, 900);
  const view = { az, el, dist, target: new THREE.Vector3(...target) };
  let drag = null;
  canvas.style.cursor = 'grab';
  canvas.style.touchAction = 'none';
  canvas.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    view.az -= (e.clientX - drag.x) * 0.008;
    view.el = Math.min(1.45, Math.max(0.08, view.el + (e.clientY - drag.y) * 0.006));
    drag = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener('pointerup', () => (drag = null));
  const zoom = (k) => (view.dist = Math.min(70, Math.max(8, view.dist * k)));

  const frames = [];
  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * renderer.getPixelRatio())) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    frames.forEach((fn) => fn(dt, now / 1000));
    robot.update(dt, {});
    const { az: a, el: e, dist: d, target: t } = view;
    camera.position.set(
      t.x + d * Math.cos(e) * Math.sin(a),
      t.y + d * Math.sin(e),
      t.z + d * Math.cos(e) * Math.cos(a),
    );
    camera.lookAt(t);
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  return { scene, world, robot, view, zoom, frame: (fn) => frames.push(fn) };
}

/** Empty the group a page rebuilds (geometries and textures are freed). */
export function clear(group) {
  group.traverse((o) => {
    o.geometry?.dispose();
    (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
      m?.map?.dispose();
      m?.dispose();
    });
  });
  group.clear();
}
