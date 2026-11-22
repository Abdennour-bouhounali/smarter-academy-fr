/**
 * La SCÈNE du solide — three.js, sans React.
 *
 * Une classe impérative que le composant SolidViewer crée une fois et pilote
 * ensuite par des méthodes : le solide (forme + dimensions), les options
 * (axes, grille, mesures), la caméra, la face désignée. Le rendu, le
 * gestionnaire de gestes (OrbitControls), les étiquettes DOM (CSS2DRenderer)
 * et la caméra sont créés UNE fois et réutilisés ; un changement de
 * dimension ne reconstruit que la géométrie du solide, ses arêtes et ses
 * cotes. Rien n'est rendu en boucle : une image est dessinée quand quelque
 * chose a changé, et pendant qu'un geste (ou son amortissement) bouge la
 * caméra.
 *
 * ── Repère ──────────────────────────────────────────────────────────────
 * Les mathématiques posent z vers le haut ; three.js pose y vers le haut.
 * La scène travaille dans le repère de three.js et TRADUIT :
 *
 *     (x, y, z) mathématique  ⟷  (x, z, −y) three.js
 *
 * (déterminant +1 : le repère reste direct). Les axes dessinés portent les
 * noms mathématiques x, y, z ; l'élève voit un repère conventionnel — jamais
 * miroité par la direction RTL de la page, qui ne concerne que l'interface.
 *
 * Les solides sont posés comme dans un manuel : le cube et le pavé dans le
 * premier octant (un sommet en O, trois arêtes sur les axes), le cylindre
 * et le cône debout sur le plan z = 0, la sphère centrée en O.
 */
import {
  Scene, PerspectiveCamera, WebGLRenderer, Color, Group, Mesh, MeshStandardMaterial, LineBasicMaterial, LineSegments, Line,
  BufferGeometry, BoxGeometry, SphereGeometry, CylinderGeometry, ConeGeometry, EdgesGeometry, Vector3, Vector2, Spherical,
  HemisphereLight, DirectionalLight, AmbientLight, GridHelper, Raycaster, Float32BufferAttribute, SRGBColorSpace, MathUtils,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { getShape } from './geometryState.js';

/** Les couleurs : la charte (bleu du solide, ambre des cotes, axes rouge/vert/bleu comme partout). */
const COLORS = Object.freeze({
  background: '#ffffff',
  solid: '#60a5fa',      // blue-400
  edge: '#1e40af',       // blue-800
  highlight: '#fbbf24',  // amber-400
  measure: '#b45309',    // amber-700
  axisX: '#dc2626',      // red-600
  axisY: '#16a34a',      // green-600
  axisZ: '#2563eb',      // blue-600
  gridMajor: '#cbd5e1',  // slate-300
  gridMinor: '#e2e8f0',  // slate-200
});

const SOLID_OPACITY = 0.86;
/** La direction de la vue par défaut (repère three.js) : un sommet vers l'élève, les trois axes visibles. */
const DEFAULT_VIEW_DIRECTION = new Vector3(-1.15, 0.9, 1.5).normalize();
const CAMERA_FOV = 40;
/** Un clic « sélectionne » s'il n'a ni bougé ni duré : au-delà, c'est un geste d'orbite. */
const CLICK_MAX_MOVE_PX = 6;
const CLICK_MAX_MS = 500;
/** Après le dernier mouvement de caméra, le temps de calme avant de la remettre au document. */
const CAMERA_REPORT_MS = 400;
const GRID_SIZE = 24;

/** (x, y, z) mathématique → Vector3 three.js. */
function toThree(x, y, z) {
  return new Vector3(x, z, -y);
}

/**
 * La géométrie du solide, DÉJÀ posée à sa place (translatée), pour que le
 * maillage, les arêtes et le lancer de rayons partagent le même repère.
 * Exportée pour les tests : le solide et ses groupes de faces.
 */
function buildSolidGeometry(shape, d) {
  switch (shape) {
    case 'cube': return new BoxGeometry(d.side, d.side, d.side).translate(d.side / 2, d.side / 2, -d.side / 2);
    case 'cuboid': return new BoxGeometry(d.length, d.height, d.width).translate(d.length / 2, d.height / 2, -d.width / 2);
    case 'sphere': return new SphereGeometry(d.radius, 64, 40);
    case 'cylinder': return new CylinderGeometry(d.radius, d.radius, d.height, 72, 1).translate(0, d.height / 2, 0);
    case 'cone': return new ConeGeometry(d.radius, d.height, 72, 1).translate(0, d.height / 2, 0);
    default: throw new Error(`[geometry3d] solide inconnu « ${shape} »`);
  }
}

/** Le centre et le rayon englobant du solide (repère three.js) — ce que la caméra cadre. */
function boundsOf(shape, d) {
  switch (shape) {
    case 'cube': return { center: new Vector3(d.side / 2, d.side / 2, -d.side / 2), radius: (d.side * Math.sqrt(3)) / 2, extent: d.side };
    case 'cuboid': return {
      center: new Vector3(d.length / 2, d.height / 2, -d.width / 2),
      radius: Math.hypot(d.length, d.width, d.height) / 2,
      extent: Math.max(d.length, d.width, d.height),
    };
    case 'sphere': return { center: new Vector3(0, 0, 0), radius: d.radius, extent: d.radius };
    case 'cylinder':
    case 'cone': return { center: new Vector3(0, d.height / 2, 0), radius: Math.hypot(d.radius, d.height / 2), extent: Math.max(2 * d.radius, d.height) };
    default: return { center: new Vector3(), radius: 1, extent: 1 };
  }
}

/**
 * Les COTES d'un solide : des segments et l'étiquette de chacun, dans le
 * repère three.js. Le cube et le pavé cotent les trois arêtes issues de O ;
 * la sphère son rayon (vers l'élève) ; le cylindre le rayon du disque du haut
 * et une génératrice ; le cône le rayon de la base, la hauteur (intérieure)
 * et l'apothème. `param` est le nom de la dimension (ou 'slant' pour
 * l'apothème calculé), `value` sa valeur.
 */
function measurementSegments(shape, d) {
  const q = Math.SQRT1_2;
  switch (shape) {
    case 'cube': return [
      { param: 'side', value: d.side, from: [0, 0, 0], to: [d.side, 0, 0] },
      { param: 'side', value: d.side, from: [0, 0, 0], to: [0, 0, -d.side] },
      { param: 'side', value: d.side, from: [0, 0, 0], to: [0, d.side, 0] },
    ];
    case 'cuboid': return [
      { param: 'length', value: d.length, from: [0, 0, 0], to: [d.length, 0, 0] },
      { param: 'width', value: d.width, from: [0, 0, 0], to: [0, 0, -d.width] },
      { param: 'height', value: d.height, from: [0, 0, 0], to: [0, d.height, 0] },
    ];
    case 'sphere': return [
      { param: 'radius', value: d.radius, from: [0, 0, 0], to: [-d.radius * q, 0, d.radius * q] },
    ];
    case 'cylinder': return [
      { param: 'radius', value: d.radius, from: [0, d.height, 0], to: [-d.radius * q, d.height, d.radius * q] },
      { param: 'height', value: d.height, from: [-d.radius * q, 0, d.radius * q], to: [-d.radius * q, d.height, d.radius * q] },
    ];
    case 'cone': return [
      { param: 'radius', value: d.radius, from: [0, 0, 0], to: [-d.radius * q, 0, d.radius * q] },
      { param: 'height', value: d.height, from: [0, 0, 0], to: [0, d.height, 0] },
      { param: 'slant', value: Math.hypot(d.radius, d.height), from: [-d.radius * q, 0, d.radius * q], to: [0, d.height, 0] },
    ];
    default: return [];
  }
}

function lineGeometry(points) {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(points.flat(), 3));

  return geometry;
}

function circlePoints(radius, segments, axis) {
  const points = [];
  for (let i = 0; i <= segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2;
    const c = Math.cos(angle) * radius;
    const s = Math.sin(angle) * radius;
    points.push(axis === 'y' ? [c, 0, s] : axis === 'x' ? [0, c, s] : [c, s, 0]);
  }

  return points;
}

function makeLabel(text, className) {
  const element = document.createElement('div');
  element.className = className;
  element.dir = 'ltr';
  element.textContent = text;

  return new CSS2DObject(element);
}

function disposeGroup(group) {
  group.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) (Array.isArray(child.material) ? child.material : [child.material]).forEach((m) => m.dispose());
    if (child.isCSS2DObject) child.element.remove();
  });
  group.clear();
}

/**
 * @typedef {object} SolidSceneCallbacks
 * @property {(camera: {position: number[], target: number[]}) => void} [onCameraChange]  après un calme de CAMERA_REPORT_MS
 * @property {() => void} [onInteract]                        au premier geste d'orbite (pour retirer l'invitation)
 * @property {(index: number | null) => void} [onSelectFace]  un clic sur une face (index de groupe), ou dans le vide
 * @property {(param: string, value: number) => string} formatLabel   le texte d'une cote, « L = 4 »
 */
export class SolidScene {
  /**
   * @param {HTMLElement} container  un bloc positionné, de taille non nulle
   * @param {SolidSceneCallbacks} callbacks
   */
  constructor(container, callbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.shape = null;
    this.dimensions = null;
    this.bounds = null;
    this.selectedFace = null;
    this.options = { axes: true, grid: true, measurements: true };
    this.raf = null;
    this.dirty = false;
    this.interacting = false;
    this.ready = false;
    this.reportTimer = null;
    this.disposed = false;

    // Un contexte WebGL indisponible lève ici : le composant affiche alors le repli textuel.
    this.renderer = new WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(COLORS.background, 1);
    this.renderer.domElement.className = 'sa-ml-g3d__canvas';
    this.renderer.domElement.setAttribute('data-ml-g3d-canvas', '');
    container.appendChild(this.renderer.domElement);

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.domElement.className = 'sa-ml-g3d__labels';
    this.labelRenderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(this.labelRenderer.domElement);

    this.scene = new Scene();
    this.scene.background = new Color(COLORS.background);
    this.camera = new PerspectiveCamera(CAMERA_FOV, 1, 0.05, 400);

    this.scene.add(new HemisphereLight('#ffffff', '#cbd5e1', 0.85));
    this.scene.add(new AmbientLight('#ffffff', 0.35));
    const sun = new DirectionalLight('#ffffff', 1.1);
    sun.position.set(-4, 9, 7);
    this.scene.add(sun);
    const fill = new DirectionalLight('#ffffff', 0.35);
    fill.position.set(6, 3, -5);
    this.scene.add(fill);

    this.grid = new GridHelper(GRID_SIZE, GRID_SIZE, COLORS.gridMajor, COLORS.gridMinor);
    this.grid.position.y = -0.002;
    this.grid.material.transparent = true;
    this.grid.material.opacity = 0.9;
    this.scene.add(this.grid);

    this.axes = new Group();
    this.axesLength = 0;
    this.scene.add(this.axes);

    this.solid = new Group();
    this.scene.add(this.solid);
    this.mesh = null;
    this.edges = null;
    this.outline = new Group();
    this.solid.add(this.outline);
    this.measurements = new Group();
    this.measurements.renderOrder = 10;
    this.scene.add(this.measurements);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.rotateSpeed = 0.85;
    this.controls.zoomSpeed = 0.9;
    this.controls.panSpeed = 0.8;
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 120;
    this.controls.minPolarAngle = 0.02;
    this.controls.maxPolarAngle = Math.PI - 0.02;
    this.controls.addEventListener('start', this.handleStart);
    this.controls.addEventListener('change', this.handleChange);
    this.controls.addEventListener('end', this.handleEnd);

    this.raycaster = new Raycaster();
    this.pointerDown = null;
    this.renderer.domElement.addEventListener('pointerdown', this.handlePointerDown);
    this.renderer.domElement.addEventListener('pointerup', this.handlePointerUp);
    this.renderer.domElement.addEventListener('contextmenu', (event) => event.preventDefault());

    this.resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(() => this.resize()) : null;
    this.resizeObserver?.observe(container);
    this.resize();
  }

  // ── Le solide ───────────────────────────────────────────────────────────

  /** Pose (ou remplace) le solide. Même forme et mêmes dimensions → rien ne bouge. */
  setSolid(shape, dimensions) {
    const spec = getShape(shape);
    const same = this.shape === shape && this.dimensions && spec.params.every((p) => this.dimensions[p] === dimensions[p]);
    if (same) return;
    const shapeChanged = this.shape !== shape;
    this.shape = shape;
    this.dimensions = { ...dimensions };
    this.bounds = boundsOf(shape, dimensions);

    const geometry = buildSolidGeometry(shape, dimensions);
    if (!this.mesh) {
      this.mesh = new Mesh(geometry, []);
      this.mesh.name = 'solid';
      this.solid.add(this.mesh);
    } else {
      this.mesh.geometry.dispose();
      this.mesh.geometry = geometry;
    }
    this.assignMaterials(geometry);

    if (this.edges) {
      this.edges.geometry.dispose();
      this.edges.material.dispose();
      this.solid.remove(this.edges);
      this.edges = null;
    }
    if (shape !== 'sphere') {
      this.edges = new LineSegments(new EdgesGeometry(geometry, 20), new LineBasicMaterial({ color: COLORS.edge, transparent: true, opacity: 0.85 }));
      this.solid.add(this.edges);
    }
    this.rebuildOutline();
    this.rebuildMeasurements();
    this.rebuildAxes();

    if (shapeChanged && this.selectedFace !== null) {
      this.selectedFace = null;
      this.callbacks.onSelectFace?.(null);
    }
    this.applyHighlight();
    if (!this.ready) this.applyDefaultCamera();
    else this.keepFramed(shapeChanged);
    this.requestRender();
  }

  /**
   * Après un changement de solide, la caméra garde sa DIRECTION (l'élève a
   * choisi son point de vue) mais suit le solide : la cible revient sur son
   * centre, et la distance est refaite si le solide déborde de la vue, s'il
   * y devient minuscule, ou si c'est un autre solide. Un cube qui passe de
   * 2 à 3 grandit donc à l'écran ; un cube qui passe de 2 à 10 ne sort pas
   * du cadre.
   */
  keepFramed(refit) {
    const { center, radius } = this.bounds;
    const offset = this.camera.position.clone().sub(this.controls.target);
    const distance = offset.length();
    const halfFov = MathUtils.degToRad(CAMERA_FOV / 2);
    const fitDistance = radius / Math.sin(halfFov);
    const visibleRadius = distance * Math.tan(halfFov) * Math.min(1, this.camera.aspect);
    const overflow = radius > visibleRadius * 0.92;
    const tiny = radius < visibleRadius * 0.12;
    const next = refit || overflow || tiny ? MathUtils.clamp(fitDistance * 1.25 + 0.8, this.controls.minDistance, this.controls.maxDistance) : distance;
    this.controls.target.copy(center);
    this.camera.position.copy(center).addScaledVector(offset.normalize(), next);
    this.camera.lookAt(center);
    this.controls.update();
    this.scheduleCameraReport();
  }

  /** Un matériau par groupe de faces (BoxGeometry : 6 ; cylindre : 3 ; cône : 3 dont un vide) ; la sphère n'a pas de groupe. */
  assignMaterials(geometry) {
    const old = Array.isArray(this.mesh.material) ? this.mesh.material : [this.mesh.material].filter(Boolean);
    old.forEach((m) => m.dispose());
    const make = () => new MeshStandardMaterial({
      color: COLORS.solid, transparent: true, opacity: SOLID_OPACITY, roughness: 0.6, metalness: 0.05,
      polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
    });
    const slots = geometry.groups.length ? Math.max(...geometry.groups.map((g) => g.materialIndex)) + 1 : 0;
    this.mesh.material = slots ? Array.from({ length: slots }, make) : make();
  }

  /** Les cercles qui font lire une sphère (équateur, un méridien) et le rebord des disques d'un cylindre/cône. */
  rebuildOutline() {
    disposeGroup(this.outline);
    const d = this.dimensions;
    const material = () => new LineBasicMaterial({ color: COLORS.edge, transparent: true, opacity: 0.55 });
    if (this.shape === 'sphere') {
      this.outline.add(new Line(lineGeometry(circlePoints(d.radius, 96, 'y')), material()));
      this.outline.add(new Line(lineGeometry(circlePoints(d.radius, 96, 'x')), material()));
      this.outline.add(new Line(lineGeometry(circlePoints(d.radius, 96, 'z')), material()));
    }
  }

  rebuildMeasurements() {
    disposeGroup(this.measurements);
    for (const segment of measurementSegments(this.shape, this.dimensions)) {
      const line = new Line(lineGeometry([segment.from, segment.to]), new LineBasicMaterial({ color: COLORS.measure, depthTest: false, transparent: true }));
      line.renderOrder = 10;
      this.measurements.add(line);
      const label = makeLabel(this.callbacks.formatLabel(segment.param, segment.value), 'sa-ml-g3d__label sa-ml-g3d__label--measure');
      label.element.setAttribute('data-ml-g3d-measure', segment.param);
      label.position.set((segment.from[0] + segment.to[0]) / 2, (segment.from[1] + segment.to[1]) / 2, (segment.from[2] + segment.to[2]) / 2);
      this.measurements.add(label);
    }
    this.measurements.visible = this.options.measurements;
  }

  /** Les axes x, y, z (noms mathématiques), assez longs pour dépasser le solide. */
  rebuildAxes() {
    const length = Math.max(3, Math.ceil(this.bounds.extent + 1.5));
    if (length === this.axesLength) return;
    this.axesLength = length;
    disposeGroup(this.axes);
    const axes = [
      { name: 'x', color: COLORS.axisX, to: toThree(length, 0, 0) },
      { name: 'y', color: COLORS.axisY, to: toThree(0, length, 0) },
      { name: 'z', color: COLORS.axisZ, to: toThree(0, 0, length) },
    ];
    for (const axis of axes) {
      const line = new Line(lineGeometry([[0, 0, 0], axis.to.toArray()]), new LineBasicMaterial({ color: axis.color }));
      this.axes.add(line);
      // La pointe : un petit cône orienté le long de l'axe.
      const tip = new Mesh(new ConeGeometry(0.08, 0.28, 12), new MeshStandardMaterial({ color: axis.color }));
      tip.position.copy(axis.to);
      tip.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), axis.to.clone().normalize());
      this.axes.add(tip);
      const label = makeLabel(axis.name, `sa-ml-g3d__label sa-ml-g3d__label--axis sa-ml-g3d__label--axis-${axis.name}`);
      label.position.copy(axis.to).multiplyScalar(1.08);
      this.axes.add(label);
    }
    const origin = makeLabel('O', 'sa-ml-g3d__label sa-ml-g3d__label--origin');
    origin.position.set(-0.15, -0.15, 0.15);
    this.axes.add(origin);
    this.axes.visible = this.options.axes;
  }

  // ── Les options ─────────────────────────────────────────────────────────

  setOptions({ axes, grid, measurements }) {
    this.options = { axes: axes !== false, grid: grid !== false, measurements: measurements !== false };
    this.axes.visible = this.options.axes;
    this.grid.visible = this.options.grid;
    this.measurements.visible = this.options.measurements;
    this.requestRender();
  }

  // ── La face désignée ───────────────────────────────────────────────────

  highlightFace(index) {
    this.selectedFace = Number.isInteger(index) ? index : null;
    this.applyHighlight();
    this.requestRender();
  }

  applyHighlight() {
    if (!this.mesh) return;
    const materials = Array.isArray(this.mesh.material) ? this.mesh.material : [this.mesh.material];
    materials.forEach((material, i) => {
      const on = this.selectedFace === i;
      material.color.set(on ? COLORS.highlight : COLORS.solid);
      material.opacity = on ? 0.95 : SOLID_OPACITY;
    });
  }

  pick(clientX, clientY) {
    if (!this.mesh) return null;
    const rect = this.renderer.domElement.getBoundingClientRect();
    if (!(rect.width > 0 && rect.height > 0)) return null;
    const ndc = new Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.camera);
    const hit = this.raycaster.intersectObject(this.mesh, false)[0];
    if (!hit) return null;

    return Array.isArray(this.mesh.material) ? hit.face.materialIndex : 0;
  }

  // ── La caméra ───────────────────────────────────────────────────────────

  /** La vue par défaut : cadrée sur le solide, un sommet vers l'élève. */
  applyDefaultCamera() {
    const { center, radius } = this.bounds ?? { center: new Vector3(), radius: 1 };
    // Cadrer le solide ET le repère (les axes dépassent le solide d'une unité et demie).
    const framed = Math.max(radius, this.axesLength * 0.8);
    const distance = framed / Math.sin(MathUtils.degToRad(CAMERA_FOV / 2)) * 1.2 + 0.8;
    this.controls.target.copy(center);
    this.camera.position.copy(center).addScaledVector(DEFAULT_VIEW_DIRECTION, distance);
    this.camera.lookAt(center);
    this.controls.update();
    this.ready = true;
  }

  /** @returns {{position: number[], target: number[]}} */
  getCamera() {
    return { position: this.camera.position.toArray(), target: this.controls.target.toArray() };
  }

  /** Pose la caméra d'un document (null → la vue par défaut). Ne remonte rien : ce n'est pas un geste. */
  setCamera(state) {
    if (state && Array.isArray(state.position) && Array.isArray(state.target)) {
      this.controls.target.fromArray(state.target);
      this.camera.position.fromArray(state.position);
      this.camera.lookAt(this.controls.target);
      this.controls.update();
      this.ready = true;
    } else {
      this.applyDefaultCamera();
    }
    this.requestRender();
  }

  resetCamera() {
    this.applyDefaultCamera();
    this.requestRender();
    this.scheduleCameraReport();
  }

  zoomBy(factor) {
    const offset = this.camera.position.clone().sub(this.controls.target);
    const distance = MathUtils.clamp(offset.length() * factor, this.controls.minDistance, this.controls.maxDistance);
    this.camera.position.copy(this.controls.target).addScaledVector(offset.normalize(), distance);
    this.controls.update();
    this.requestRender();
    this.scheduleCameraReport();
  }

  /** Tourne la vue autour de la cible (clavier) : azimut et inclinaison en radians. */
  rotateBy(deltaAzimuth, deltaPolar) {
    const offset = this.camera.position.clone().sub(this.controls.target);
    const spherical = new Spherical().setFromVector3(offset);
    spherical.theta += deltaAzimuth;
    spherical.phi = MathUtils.clamp(spherical.phi + deltaPolar, this.controls.minPolarAngle, this.controls.maxPolarAngle);
    this.camera.position.copy(this.controls.target).add(offset.setFromSpherical(spherical));
    this.camera.lookAt(this.controls.target);
    this.controls.update();
    this.requestRender();
    this.scheduleCameraReport();
  }

  scheduleCameraReport() {
    clearTimeout(this.reportTimer);
    this.reportTimer = setTimeout(() => {
      this.reportTimer = null;
      if (!this.disposed) this.callbacks.onCameraChange?.(this.getCamera());
    }, CAMERA_REPORT_MS);
  }

  // ── Les gestes ──────────────────────────────────────────────────────────

  handleStart = () => {
    this.interacting = true;
    this.callbacks.onInteract?.();
    this.requestRender();
  };

  handleChange = () => {
    this.dirty = true;
    if (this.ready) this.scheduleCameraReport();
    this.requestRender();
  };

  handleEnd = () => {
    this.interacting = false;
    this.requestRender();
  };

  handlePointerDown = (event) => {
    if (event.button !== 0 && event.pointerType === 'mouse') { this.pointerDown = null; return; }
    this.pointerDown = { x: event.clientX, y: event.clientY, t: performance.now(), id: event.pointerId };
  };

  handlePointerUp = (event) => {
    const down = this.pointerDown;
    this.pointerDown = null;
    if (!down || down.id !== event.pointerId) return;
    if (Math.hypot(event.clientX - down.x, event.clientY - down.y) > CLICK_MAX_MOVE_PX || performance.now() - down.t > CLICK_MAX_MS) return;
    const index = this.pick(event.clientX, event.clientY);
    const next = index === null || index === this.selectedFace ? null : index;
    this.highlightFace(next);
    this.callbacks.onSelectFace?.(next);
  };

  // ── Le rendu ────────────────────────────────────────────────────────────

  resize() {
    const width = Math.max(1, Math.floor(this.container.clientWidth));
    const height = Math.max(1, Math.floor(this.container.clientHeight));
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.labelRenderer.setSize(width, height);
    this.requestRender();
  }

  requestRender() {
    this.dirty = true;
    if (this.raf === null && !this.disposed) this.raf = requestAnimationFrame(this.frame);
  }

  frame = () => {
    this.raf = null;
    if (this.disposed) return;
    this.dirty = false;
    // update() fait avancer l'amortissement et émet 'change' (→ dirty) tant que la caméra bouge.
    const moved = this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
    if (moved || this.dirty || this.interacting) this.raf = requestAnimationFrame(this.frame);
  };

  /** L'image du solide telle qu'à l'écran (les étiquettes DOM n'en font pas partie). */
  exportPng() {
    this.renderer.render(this.scene, this.camera);

    return new Promise((resolve, reject) => {
      this.renderer.domElement.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('export'))), 'image/png');
    });
  }

  dispose() {
    this.disposed = true;
    if (this.raf !== null) cancelAnimationFrame(this.raf);
    clearTimeout(this.reportTimer);
    this.resizeObserver?.disconnect();
    this.controls.removeEventListener('start', this.handleStart);
    this.controls.removeEventListener('change', this.handleChange);
    this.controls.removeEventListener('end', this.handleEnd);
    this.controls.dispose();
    this.renderer.domElement.removeEventListener('pointerdown', this.handlePointerDown);
    this.renderer.domElement.removeEventListener('pointerup', this.handlePointerUp);
    disposeGroup(this.measurements);
    disposeGroup(this.axes);
    disposeGroup(this.outline);
    if (this.mesh) {
      this.mesh.geometry.dispose();
      (Array.isArray(this.mesh.material) ? this.mesh.material : [this.mesh.material]).forEach((m) => m.dispose());
    }
    if (this.edges) { this.edges.geometry.dispose(); this.edges.material.dispose(); }
    this.grid.geometry.dispose();
    this.grid.material.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
    this.labelRenderer.domElement.remove();
  }
}
