/**
 * « زيرو » — the hero: a small hovering robot (no person is drawn). Its chest screen shows the REMAINDER of the last forge:
 * the variable of the lesson lives on the character. `update(dt, { speed, vy, mood })` animates hover, tilt, blink and thruster.
 */
import * as THREE from 'three';
import { std, glow, textPlane } from './builders';

export function makeRobot() {
  const root = new THREE.Group();
  const rig = new THREE.Group();
  root.add(rig);
  const white = std(0xf3f6fb, { flatShading: false, roughness: 0.45 });
  const teal = std(0x19b6c9, { flatShading: false, roughness: 0.5 });
  const dark = std(0x1c2540, { flatShading: false, roughness: 0.4 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 14), white);
  body.scale.set(1, 1.08, 0.92);
  body.position.y = 0.72;
  body.castShadow = true;
  rig.add(body);
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.06, 8, 24), teal);
  belt.rotation.x = Math.PI / 2;
  belt.position.y = 0.5;
  rig.add(belt);
  const chest = textPlane('•', { w: 0.44, h: 0.4 });
  chest.position.set(0, 0.8, 0.455);
  rig.add(chest);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.48, 0.04), dark);
  frame.position.set(0, 0.8, 0.44);
  rig.add(frame);

  const head = new THREE.Group();
  head.position.y = 1.42;
  rig.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 14), white);
  skull.scale.set(1.12, 0.86, 1);
  skull.castShadow = true;
  head.add(skull);
  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.36, 20, 12, 0, Math.PI * 2, Math.PI * 0.28, Math.PI * 0.38),
    dark,
  );
  visor.rotation.x = Math.PI / 2;
  visor.scale.set(1.15, 0.6, 0.86);
  visor.position.set(0, 0, 0.14);
  head.add(visor);
  const eyeMat = glow(0x7dfcff, 2.2, { flatShading: false });
  const eyes = [-0.15, 0.15].map((x) => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), eyeMat);
    e.position.set(x, 0.02, 0.37);
    e.scale.z = 0.4;
    head.add(e);
    return e;
  });
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.32, 5), dark);
  ant.position.y = 0.48;
  head.add(ant);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), glow(0xffd166, 2));
  bulb.position.y = 0.67;
  head.add(bulb);
  for (const x of [-0.46, 0.46]) {
    const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 10), teal);
    ear.rotation.z = Math.PI / 2;
    ear.position.x = x;
    head.add(ear);
  }

  const arms = [-1, 1].map((s) => {
    const a = new THREE.Group();
    a.position.set(s * 0.56, 0.86, 0);
    const up = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.26, 4, 8), teal);
    up.position.y = -0.2;
    a.add(up);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), white);
    hand.position.y = -0.44;
    a.add(hand);
    rig.add(a);
    return a;
  });

  const thr = new THREE.Mesh(
    new THREE.ConeGeometry(0.26, 0.5, 10, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x7dfcff,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  thr.rotation.x = Math.PI;
  thr.position.y = 0.02;
  rig.add(thr);
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.14, 10), dark);
  nozzle.position.y = 0.22;
  rig.add(nozzle);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.5, 16),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.03;
  root.add(shadow);

  let t = Math.random() * 10;
  let blink = 2;
  let joy = 0;
  const api = {
    group: root,
    rig,
    shadow,
    setChest(text, ok) {
      chest.userData.setText(
        text,
        ok === false ? '#ff7a7a' : ok ? '#8dffb0' : '#7dfcff',
        ok === false ? '#2b0b10' : ok ? '#06261a' : '#06202b',
      );
    },
    cheer() {
      joy = 1.2;
    },
    update(dt, { speed = 0, vy = 0, air = false, sad = false } = {}) {
      t += dt;
      joy = Math.max(0, joy - dt);
      const hover = 0.34 + Math.sin(t * 3.2) * 0.07;
      rig.position.y = hover + (joy > 0 ? Math.abs(Math.sin(joy * 9)) * 0.35 : 0);
      rig.rotation.x = THREE.MathUtils.lerp(
        rig.rotation.x,
        Math.min(0.32, speed * 0.05) - (air ? vy * 0.02 : 0),
        1 - Math.exp(-10 * dt),
      );
      rig.rotation.y = joy > 0 ? joy * 10 : 0;
      head.rotation.y = Math.sin(t * 0.7) * 0.18;
      head.rotation.x = sad ? 0.35 : Math.sin(t * 1.1) * 0.05;
      arms.forEach((a, i) => {
        a.rotation.x = Math.sin(t * 3.2 + i * Math.PI) * 0.18 - speed * 0.07;
        a.rotation.z = (i ? -1 : 1) * (joy > 0 ? -2.4 : -0.12);
      });
      blink -= dt;
      if (blink < -0.12) blink = 1.6 + Math.random() * 2.5;
      eyes.forEach((e) => {
        e.scale.y = blink < 0 ? 0.12 : sad ? 0.55 : 1;
      });
      thr.scale.set(1, 0.8 + Math.sin(t * 30) * 0.15 + speed * 0.08, 1);
      bulb.material.emissiveIntensity = 1.4 + Math.sin(t * 5) * 0.8;
      shadow.position.y = 0.03 - root.position.y;
      shadow.visible = root.position.y > -0.2;
      shadow.scale.setScalar(Math.max(0.3, 1 - root.position.y * 0.12));
    },
  };
  return api;
}
