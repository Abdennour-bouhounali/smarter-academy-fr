/**
 * La TABLE d'expérience — une scène three.js pilotée directement, sans React
 * (le même parti que solidScene.js : l'état du moteur reste hors de React,
 * le composant DiceViewer.jsx la crée une fois et l'appelle par méthodes).
 *
 * Elle montre un dé, deux dés ou une pièce, et sait trois choses :
 *
 *   throw(parts)        lancer les objets vers un résultat DÉJÀ tiré ;
 *   startTumble() /     culbuter sans fin pendant qu'un gros lot s'accumule,
 *   stopTumble(parts)   puis se poser sur le dernier tirage ;
 *   topFaces()          lire la face réellement en haut de chaque objet, sur
 *                       son quaternion — c'est la vérification indépendante
 *                       que la scène montre bien ce que le moteur a tiré.
 *
 * Pas de moteur physique : un lancer est une courbe planifiée
 * (dieOrientation.planThrow) dont l'orientation finale est CALCULÉE depuis
 * le résultat. Le rendu n'a lieu que pendant un mouvement et une fois après
 * chaque changement (jamais de boucle libre). Le repère est celui de three
 * (y vers le haut) : c'est une table, pas un repère mathématique.
 */

import {
  Scene, PerspectiveCamera, WebGLRenderer, Mesh, MeshStandardMaterial, CircleGeometry, CylinderGeometry,
  HemisphereLight, DirectionalLight, AmbientLight, CanvasTexture, SRGBColorSpace, PCFShadowMap, Vector3, Quaternion,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  DIE_FACE_VALUES, coinOrientation, coinTopFace, dieOrientation, dieTopFace, planThrow, randomThrowSpec,
} from './dieOrientation.js';

const DIE_SIZE = 1;
const DIE_RADIUS = 0.11;
const COIN_RADIUS = 0.95;
const COIN_THICKNESS = 0.14;
const CAMERA_FOV = 30;
/** La caméra regarde la table de face et d'un peu haut ; elle ne bouge jamais. */
const CAMERA_DIRECTION = new Vector3(0, 1.0, 1.35).normalize();
/** La cible est à mi-hauteur d'un vol : la table en bas du cadre, l'apogée en haut, rien de coupé. */
const CAMERA_TARGET = new Vector3(0, 1.05, 0);
/** Ce que la vue doit contenir : un vol culmine vers y ≈ 2,4 (repos 0,5 + hauteur 1,8), et deux dés s'écartent. */
const VIEW_HALF_HEIGHT = 1.75;
const VIEW_HALF_WIDTH = { 1: 2.0, 2: 3.0 };

/** Le lacet qui met le mot d'une pièce droit face à la caméra (voir orientationFor). */
const COIN_UPRIGHT_YAW = { heads: Math.PI / 2, tails: -Math.PI / 2 };

const COLORS = {
  table: '#eef2f7',
  dieFace: '#fbfbfb',
  pip: '#1e293b',
  coin: '#e2b64a',
  coinDark: '#7a5a10',
  coinEdge: '#c99a2e',
};

/** Les emplacements de repos : un objet au centre, deux de part et d'autre. */
function slotsFor(count) {
  return count === 2 ? [new Vector3(-1.05, 0, 0), new Vector3(1.05, 0, 0)] : [new Vector3(0, 0, 0)];
}

/* ── Les textures : dessinées sur un canevas, jamais chargées ─────────── */

const PIP = { a: 64, b: 128, c: 192 };
const PIP_LAYOUTS = {
  1: [[PIP.b, PIP.b]],
  2: [[PIP.a, PIP.a], [PIP.c, PIP.c]],
  3: [[PIP.a, PIP.a], [PIP.b, PIP.b], [PIP.c, PIP.c]],
  4: [[PIP.a, PIP.a], [PIP.c, PIP.a], [PIP.a, PIP.c], [PIP.c, PIP.c]],
  5: [[PIP.a, PIP.a], [PIP.c, PIP.a], [PIP.b, PIP.b], [PIP.a, PIP.c], [PIP.c, PIP.c]],
  6: [[PIP.a, PIP.a], [PIP.a, PIP.b], [PIP.a, PIP.c], [PIP.c, PIP.a], [PIP.c, PIP.b], [PIP.c, PIP.c]],
};

function makeTexture(size, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  draw(canvas.getContext('2d'), size);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;

  return texture;
}

/** La face d'un dé : fond blanc cassé, points noirs — le dessin d'un vrai dé. */
function pipTexture(value) {
  return makeTexture(256, (ctx) => {
    ctx.fillStyle = COLORS.dieFace;
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = COLORS.pip;
    for (const [x, y] of PIP_LAYOUTS[value]) {
      ctx.beginPath();
      ctx.arc(x, y, 24, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

/**
 * Une face de pièce : or, un anneau, le mot (« وجه » / « ظهر ») en Cairo.
 * Le texte est dessiné par le navigateur (façonnage arabe correct) ; si
 * Cairo n'est pas encore chargée, la face est redessinée à son arrivée.
 */
function coinFaceTexture(label, heads) {
  const draw = (ctx, size) => {
    const c = size / 2;
    const gradient = ctx.createRadialGradient(c * 0.7, c * 0.7, size * 0.05, c, c, c);
    gradient.addColorStop(0, '#f3d27a');
    gradient.addColorStop(1, COLORS.coin);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = COLORS.coinDark;
    ctx.lineWidth = size * 0.035;
    ctx.beginPath();
    ctx.arc(c, c, c * 0.82, 0, Math.PI * 2);
    ctx.stroke();
    if (heads) {
      // Une couronne de points : le côté « وجه » se reconnaît même de loin.
      ctx.fillStyle = COLORS.coinDark;
      for (let i = 0; i < 16; i += 1) {
        const angle = (i / 16) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(c + Math.cos(angle) * c * 0.7, c + Math.sin(angle) * c * 0.7, size * 0.018, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.lineWidth = size * 0.012;
      ctx.beginPath();
      ctx.arc(c, c, c * 0.7, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = COLORS.coinDark;
    ctx.font = `700 ${Math.round(size * 0.3)}px Cairo, Tajawal, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, c, c + size * 0.02);
  };
  const texture = makeTexture(512, draw);
  if (typeof document !== 'undefined' && document.fonts?.load) {
    document.fonts.load('700 150px Cairo').then(() => {
      draw(texture.image.getContext('2d'), texture.image.width);
      texture.needsUpdate = true;
      texture.userData.onUpdate?.();
    }).catch(() => {});
  }

  return texture;
}

function disposeMesh(mesh) {
  mesh.geometry.dispose();
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  for (const material of materials) {
    material.map?.dispose();
    material.dispose();
  }
}

export class DiceScene {
  /**
   * @param {HTMLElement} container
   * @param {{ coinLabels: { heads: string, tails: string } }} options
   */
  constructor(container, options) {
    this.container = container;
    this.options = options;
    this.kind = null;
    this.count = 0;
    this.objects = [];
    this.slots = [];
    this.restHeight = DIE_SIZE / 2;
    this.animation = null;
    this.tumble = null;
    this.raf = null;
    this.disposed = false;

    // Un contexte WebGL indisponible lève ici : le composant garde alors le tableau seul.
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFShadowMap;
    this.renderer.domElement.className = 'sa-ml-ps__dice-canvas';
    this.renderer.domElement.setAttribute('data-ml-ps-dice-canvas', '');
    container.appendChild(this.renderer.domElement);

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(CAMERA_FOV, 1, 0.1, 60);

    this.scene.add(new HemisphereLight('#ffffff', '#c7d2e0', 0.9));
    this.scene.add(new AmbientLight('#ffffff', 0.25));
    const sun = new DirectionalLight('#ffffff', 1.4);
    sun.position.set(2.5, 6.5, 3.5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 20;
    sun.shadow.camera.left = -4;
    sun.shadow.camera.right = 4;
    sun.shadow.camera.top = 4;
    sun.shadow.camera.bottom = -4;
    sun.shadow.radius = 4;
    this.scene.add(sun);

    // La table : un disque clair qui reçoit les ombres. Le fond reste celui de la page.
    this.table = new Mesh(new CircleGeometry(3.4, 72), new MeshStandardMaterial({ color: COLORS.table, roughness: 1, metalness: 0 }));
    this.table.rotation.x = -Math.PI / 2;
    this.table.receiveShadow = true;
    this.scene.add(this.table);

    this.resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(() => this.resize()) : null;
    this.resizeObserver?.observe(container);
    this.resize();
  }

  // ── Les objets ────────────────────────────────────────────────────────

  /** Pose les objets de cette expérience ; même nature et même nombre → rien ne bouge. */
  setKind(kind, count) {
    if (kind === this.kind && count === this.count) return;
    this.cancel();
    for (const mesh of this.objects) { this.scene.remove(mesh); disposeMesh(mesh); }
    this.objects = [];
    this.kind = kind;
    this.count = kind ? count : 0;
    this.slots = slotsFor(this.count);
    this.restHeight = kind === 'coin' ? COIN_THICKNESS / 2 : DIE_SIZE / 2;
    for (let i = 0; i < this.count; i += 1) {
      const mesh = kind === 'coin' ? this.buildCoin() : this.buildDie();
      mesh.position.copy(this.slots[i]);
      mesh.position.y = this.restHeight;
      mesh.castShadow = true;
      this.scene.add(mesh);
      this.objects.push(mesh);
    }
    this.resize();
  }

  buildDie() {
    const materials = DIE_FACE_VALUES.map((value) => new MeshStandardMaterial({ map: pipTexture(value), roughness: 0.42, metalness: 0.04 }));

    return new Mesh(new RoundedBoxGeometry(DIE_SIZE, DIE_SIZE, DIE_SIZE, 4, DIE_RADIUS), materials);
  }

  buildCoin() {
    const { heads, tails } = this.options.coinLabels;
    const face = (label, isHeads) => {
      const texture = coinFaceTexture(label, isHeads);
      texture.userData.onUpdate = () => this.render();

      return new MeshStandardMaterial({ map: texture, roughness: 0.38, metalness: 0.45 });
    };
    const edge = new MeshStandardMaterial({ color: COLORS.coinEdge, roughness: 0.45, metalness: 0.5 });
    // Les groupes de CylinderGeometry : 0 le bord, 1 le dessus (+y = « وجه »), 2 le dessous (−y = « ظهر »).
    const mesh = new Mesh(new CylinderGeometry(COIN_RADIUS, COIN_RADIUS, COIN_THICKNESS, 72), [edge, face(heads, true), face(tails, false)]);

    return mesh;
  }

  /**
   * L'orientation qui montre `part` : la face d'un dé, ou le côté d'une
   * pièce (1 = وجه). Le lacet est libre (il ne change pas la face) : un dé
   * se pose à n'importe quel angle ; une pièce se pose de sorte que son MOT
   * soit droit pour qui regarde — à un petit écart près, pour ne pas avoir
   * l'air posée à la main. Les UV des chapeaux d'un cylindre tournent le
   * dessin d'un quart de tour (dans un sens pour le dessus, dans l'autre
   * pour le dessous) : COIN_UPRIGHT_YAW le compense.
   */
  orientationFor(part, yaw) {
    if (this.kind !== 'coin') return dieOrientation(part, yaw);
    const heads = part === 1;
    const wobble = (yaw / (Math.PI * 2)) * 0.5 - 0.25;

    return coinOrientation(heads, COIN_UPRIGHT_YAW[heads ? 'heads' : 'tails'] + wobble);
  }

  /** Ce que chaque objet montre VRAIMENT, lu sur son orientation courante. */
  topFaces() {
    return this.objects.map((mesh) => (this.kind === 'coin' ? (coinTopFace(mesh.quaternion) === 'heads' ? 1 : 0) : dieTopFace(mesh.quaternion)));
  }

  /**
   * Pose les objets sur ces résultats, sans mouvement. Un objet qui montre
   * déjà la bonne face garde sa pose (pas de saut quand React re-rend).
   */
  setStatic(parts) {
    if (this.animation || this.tumble) return;
    const tops = this.topFaces();
    this.objects.forEach((mesh, i) => {
      const part = parts[i] ?? parts[0];
      if (tops[i] === part) return;
      mesh.quaternion.copy(this.orientationFor(part, Math.random() * Math.PI * 2));
      mesh.position.copy(this.slots[i]);
      mesh.position.y = this.restHeight;
    });
    this.render();
  }

  // ── Le lancer ─────────────────────────────────────────────────────────

  /**
   * Lance les objets vers `parts` (déjà tirés). Résout `{ cancelled }` quand
   * tout est posé — ou tout de suite si un autre mouvement l'interrompt.
   *
   * @param {number[]} parts
   * @param {{ rng?: () => number, quick?: boolean }} [options]  `quick` : un court lancer de mise en place
   */
  throw(parts, options = {}) {
    this.cancel();
    if (this.objects.length === 0) return Promise.resolve({ cancelled: true });
    const rng = options.rng ?? Math.random;

    return new Promise((resolve) => {
      const items = this.objects.map((mesh, i) => {
        const spec = randomThrowSpec(this.kind, this.slots[i], rng);
        if (options.quick) {
          Object.assign(spec, { duration: 420, turns: 1, height: Math.min(spec.height, 0.7), swing: spec.swing.clone().multiplyScalar(0.3) });
        }
        const from = { position: mesh.position.clone(), quaternion: mesh.quaternion.clone() };
        const to = this.orientationFor(parts[i] ?? parts[0], rng() * Math.PI * 2);

        // Deux dés ne partent pas ensemble : un léger décalage, et des durées différentes.
        return { mesh, from, plan: planThrow(from, to, spec), delay: i === 0 ? 0 : 60 + rng() * 120 };
      });
      this.animation = { items, start: performance.now(), resolve };
      this.loop();
    });
  }

  /** Interrompt le mouvement en cours : un lancer revient à sa pose de départ (rien n'a été observé). */
  cancel(restParts = null) {
    if (this.animation) {
      const { items, resolve } = this.animation;
      this.animation = null;
      for (const item of items) {
        item.mesh.position.copy(item.from.position);
        item.mesh.quaternion.copy(item.from.quaternion);
      }
      resolve({ cancelled: true });
    }
    if (this.tumble) {
      this.tumble = null;
      if (restParts) {
        this.objects.forEach((mesh, i) => {
          mesh.quaternion.copy(this.orientationFor(restParts[i] ?? restParts[0], Math.random() * Math.PI * 2));
          mesh.position.copy(this.slots[i]);
          mesh.position.y = this.restHeight;
        });
      }
    }
    this.render();
  }

  // ── La culbute continue (un gros lot s'accumule) ──────────────────────

  startTumble() {
    this.cancel();
    if (this.objects.length === 0) return;
    this.tumble = {
      last: performance.now(),
      items: this.objects.map((mesh, i) => ({
        mesh,
        axis: new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
        speed: 9 + Math.random() * 4,
        phase: i * 1.7 + Math.random(),
      })),
    };
    this.loop();
  }

  /** Fin du lot : chaque objet se pose, d'un court lancer, sur le dernier tirage. */
  stopTumble(parts) {
    if (!this.tumble) return Promise.resolve({ cancelled: false });
    this.tumble = null;

    return this.throw(parts, { quick: true });
  }

  // ── La boucle ─────────────────────────────────────────────────────────

  loop() {
    if (this.raf === null && !this.disposed) this.raf = requestAnimationFrame(this.frame);
  }

  frame = (now) => {
    this.raf = null;
    if (this.disposed) return;
    let moving = false;

    if (this.animation) {
      const { items, start } = this.animation;
      let done = true;
      for (const item of items) {
        const u = (now - start - item.delay) / item.plan.duration;
        const pose = item.plan.at(Math.max(0, u));
        item.mesh.position.copy(pose.position);
        item.mesh.quaternion.copy(pose.quaternion);
        if (u < 1) done = false;
      }
      moving = !done;
      if (done) {
        const { resolve } = this.animation;
        this.animation = null;
        this.render();
        resolve({ cancelled: false });

        return;
      }
    }

    if (this.tumble) {
      const dt = Math.min(0.05, (now - this.tumble.last) / 1000);
      this.tumble.last = now;
      const t = now / 1000;
      for (const item of this.tumble.items) {
        item.mesh.quaternion.premultiply(new Quaternion().setFromAxisAngle(item.axis, item.speed * dt));
        item.mesh.position.y = this.restHeight + 0.45 + 0.2 * Math.sin(t * 7 + item.phase);
      }
      moving = true;
    }

    this.render();
    if (moving) this.loop();
  };

  render() {
    if (this.disposed) return;
    this.renderer.render(this.scene, this.camera);
  }

  // ── La taille et la caméra ────────────────────────────────────────────

  resize() {
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    // Une distance fixe par format : la vue contient le vol le plus haut ET
    // les deux dés les plus écartés, sans jamais bouger pendant un lancer.
    const tan = Math.tan((CAMERA_FOV * Math.PI) / 360);
    const halfWidth = VIEW_HALF_WIDTH[this.count] ?? VIEW_HALF_WIDTH[1];
    const distance = Math.max(VIEW_HALF_HEIGHT / tan, halfWidth / (tan * this.camera.aspect)) * 1.04;
    this.camera.position.copy(CAMERA_TARGET).addScaledVector(CAMERA_DIRECTION, distance);
    this.camera.lookAt(CAMERA_TARGET);
    this.camera.updateProjectionMatrix();
    this.render();
  }

  dispose() {
    this.disposed = true;
    if (this.raf !== null) cancelAnimationFrame(this.raf);
    this.animation?.resolve({ cancelled: true });
    this.animation = null;
    this.tumble = null;
    this.resizeObserver?.disconnect();
    for (const mesh of this.objects) disposeMesh(mesh);
    this.objects = [];
    disposeMesh(this.table);
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }
}
