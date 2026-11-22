/**
 * LA SCÈNE 3D D'UN LAB DE L'ESPACE (unité 14 « الهندسة في الفضاء », 2026-10-05) — three.js, sans React.
 *
 * Les labs de l'unité montrent de VRAIS solides (lumière, transparence, orbite au doigt) : une sphère creuse et une boule
 * pleine, un plan qui coupe un solide, un pavé qui grandit, un seau qui se remplit. Cette classe est le socle commun —
 * aucun lab n'écrit son propre renderer. Elle reprend les conventions éprouvées de la scène du Math Lab
 * (features/mathlab/tools/geometry3d/solidScene.js) : repère mathématique z vers le HAUT traduit vers three.js,
 * rendu À LA DEMANDE (aucune boucle permanente), étiquettes DOM (CSS2DRenderer, noms LTR), tout est libéré au démontage.
 *
 *     (x, y, z) mathématique  ⟷  (x, z, −y) three.js          (déterminant +1 : le repère reste direct)
 *
 * Le fond est TRANSPARENT : le lab pose son décor (SVG, aria-hidden) DERRIÈRE le canvas.
 * Un geste mathématique (déplacer un point, monter un plan) passe par `draggable(objet, gestionnaires)` : l'orbite se
 * suspend pendant le geste, le gestionnaire reçoit le rayon et des aides pour le projeter sur un plan ou une droite.
 * Sans WebGL (jsdom, vieux navigateur), le constructeur LÈVE : Stage3D affiche alors le repli (une SpaceFigure).
 */
import {
  Scene, PerspectiveCamera, WebGLRenderer, Group, Vector2, Vector3, Plane, Raycaster, HemisphereLight, DirectionalLight,
  AmbientLight, SRGBColorSpace, MathUtils,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

const RAD = Math.PI / 180;

/** (x, y, z) mathématique → Vector3 three.js. */
export const toThree = (p) => new Vector3(p[0], p[2], -p[1]);
/** Vector3 three.js → [x, y, z] mathématique. */
export const fromThree = (v) => [v.x, -v.z, v.y];

/** La direction (mathématique) vers l'observateur pour une vue (azimut, élévation) — la même que SpaceFigure. */
export function viewDirection({ azimuth = -62, elevation = 18 } = {}) {
  const a = azimuth * RAD; const e = elevation * RAD;
  return [Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e)];
}

/** Libère récursivement géométries, matériaux et étiquettes DOM d'un objet. */
function disposeObject(obj) {
  obj.traverse?.((child) => {
    child.geometry?.dispose?.();
    if (child.material) (Array.isArray(child.material) ? child.material : [child.material]).forEach((m) => m.dispose?.());
    if (child.isCSS2DObject) child.element.remove();
  });
  obj.parent?.remove(obj);
}

/** Une étiquette DOM (nom de point, cote) : LTR, lisible sur tout fond, jamais cliquable. */
function makeLabel(text, { color = '#0f172a', size = 14, weight = 700, background = null } = {}) {
  const el = document.createElement('div');
  el.dir = 'ltr';
  el.textContent = text;
  Object.assign(el.style, {
    font: `${weight} ${size}px system-ui, sans-serif`, color, pointerEvents: 'none', whiteSpace: 'nowrap',
    textShadow: '0 0 3px #fff, 0 0 3px #fff, 0 0 2px #fff', unicodeBidi: 'isolate',
    ...(background ? { background, padding: '1px 6px', borderRadius: '8px', textShadow: 'none' } : {}),
  });
  return new CSS2DObject(el);
}

export class SpaceStage {
  /**
   * @param {HTMLElement} container  un bloc positionné, de taille non nulle
   * @param {{ view?: {azimuth, elevation, distance}, target?: number[], orbit?: boolean, fov?: number,
   *           minDistance?: number, maxDistance?: number, onInteract?: () => void }} options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.disposed = false;
    this.raf = null;
    this.dragging = null;
    this.draggables = [];
    this.tickers = new Set();

    // Un contexte WebGL indisponible lève ici : Stage3D affiche alors le repli.
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.localClippingEnabled = true;
    Object.assign(this.renderer.domElement.style, { display: 'block', width: '100%', height: '100%', touchAction: 'none' });
    this.renderer.domElement.setAttribute('data-stage3d-canvas', '');
    container.appendChild(this.renderer.domElement);

    this.labelRenderer = new CSS2DRenderer();
    Object.assign(this.labelRenderer.domElement.style, { position: 'absolute', top: '0', left: '0', pointerEvents: 'none', direction: 'ltr' });
    this.labelRenderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(this.labelRenderer.domElement);

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(options.fov ?? 35, 1, 0.05, 2000);
    this.scene.add(new HemisphereLight('#ffffff', '#cbd5e1', 0.9));
    this.scene.add(new AmbientLight('#ffffff', 0.3));
    const sun = new DirectionalLight('#ffffff', 1.15);
    sun.position.set(-4, 9, 7);
    this.scene.add(sun);
    const fill = new DirectionalLight('#ffffff', 0.35);
    fill.position.set(6, 3, -5);
    this.scene.add(fill);

    /** Le monde du lab : tout ce qu'il ajoute y vit (repère three.js — utiliser toThree). */
    this.root = new Group();
    this.scene.add(this.root);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    Object.assign(this.controls, {
      enableDamping: true, dampingFactor: 0.12, rotateSpeed: 0.8, enablePan: false, zoomSpeed: 0.8,
      minPolarAngle: 0.15, maxPolarAngle: Math.PI / 2 + 0.35,
    });
    this.controls.enabled = options.orbit !== false;
    this.controls.addEventListener('change', this.requestRender);
    this.controls.addEventListener('start', this.handleOrbitStart);

    this.raycaster = new Raycaster();
    this.renderer.domElement.addEventListener('pointerdown', this.handlePointerDown, { capture: true });
    this.renderer.domElement.addEventListener('pointermove', this.handlePointerMove);
    this.renderer.domElement.addEventListener('pointerup', this.handlePointerUp);
    this.renderer.domElement.addEventListener('pointercancel', this.handlePointerUp);
    this.renderer.domElement.addEventListener('contextmenu', this.preventDefault);

    this.setView(options.view ?? {}, options.target ?? [0, 0, 0]);
    this.resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(() => this.resize()) : null;
    this.resizeObserver?.observe(container);
    this.resize();
  }

  preventDefault = (e) => e.preventDefault();

  /** Place la caméra : vue (azimut, élévation en degrés ; distance) autour d'une cible (mathématique). */
  setView({ azimuth = -62, elevation = 18, distance = 10 } = {}, target = this.targetMath ?? [0, 0, 0]) {
    this.targetMath = target;
    this.viewMath = { azimuth, elevation, distance };
    const d = viewDirection({ azimuth, elevation });
    const pos = [target[0] + d[0] * distance, target[1] + d[1] * distance, target[2] + d[2] * distance];
    this.camera.position.copy(toThree(pos));
    this.controls.target.copy(toThree(target));
    this.controls.minDistance = this.options.minDistance ?? distance * 0.45;
    this.controls.maxDistance = this.options.maxDistance ?? distance * 2.2;
    this.controls.update();
    this.requestRender();
  }

  /** Revient à la vue de départ (bouton ↺ de Stage3D). */
  resetView() { this.setView(this.options.view ?? {}, this.options.target ?? [0, 0, 0]); }

  /** Tourne la vue (clavier de Stage3D) : dAz, dEl en degrés. */
  orbitBy(dAz, dEl) {
    const offset = this.camera.position.clone().sub(this.controls.target);
    const sph = new Vector3().copy(offset);
    const r = sph.length();
    const theta = Math.atan2(sph.x, sph.z) + dAz * RAD;
    let phi = Math.acos(MathUtils.clamp(sph.y / r, -1, 1)) - dEl * RAD;
    phi = MathUtils.clamp(phi, this.controls.minPolarAngle, this.controls.maxPolarAngle);
    offset.set(r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.cos(theta));
    this.camera.position.copy(this.controls.target).add(offset);
    this.camera.lookAt(this.controls.target);
    this.controls.update();
    this.requestRender();
  }

  /** Ajoute un objet three.js au monde du lab. */
  add(obj) { this.root.add(obj); this.requestRender(); return obj; }
  /** Retire et libère un objet. */
  remove(obj) { if (obj) { disposeObject(obj); this.requestRender(); } }
  /** Une étiquette DOM à une position mathématique (rend l'objet, à ajouter ou à attacher). */
  label(text, at, style) { const l = makeLabel(text, style); l.position.copy(toThree(at)); return l; }

  /** Une fonction appelée à chaque image tant qu'elle rend `true` (animation courte : remplissage, rotation). */
  animate(fn) { this.tickers.add(fn); this.requestRender(); return () => this.tickers.delete(fn); }

  /**
   * Rend un objet DÉPLAÇABLE par le geste mathématique du lab. `handlers.start(hit)` / `move(ctx)` / `end()` ;
   * ctx = { ray, onPlane(normalMath, pointMath) → [x,y,z] | null, onLine(pointMath, dirMath) → t (paramètre), clientX, clientY }.
   */
  draggable(obj, handlers) {
    this.draggables.push({ obj, handlers });
    return () => { this.draggables = this.draggables.filter((d) => d.obj !== obj); };
  }

  /** Le rayon de la souris (coordonnées client). */
  rayAt(clientX, clientY) {
    const r = this.renderer.domElement.getBoundingClientRect();
    const ndc = new Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.camera);
    return this.raycaster.ray;
  }

  /** Intersection du rayon avec un plan (mathématique) → [x, y, z] ou null. */
  rayOnPlane(ray, normalMath, pointMath) {
    const plane = new Plane().setFromNormalAndCoplanarPoint(toThree(normalMath).normalize(), toThree(pointMath));
    const hit = new Vector3();
    return ray.intersectPlane(plane, hit) ? fromThree(hit) : null;
  }

  /** Le paramètre t du point de la droite (point + t·dir, mathématique) le plus proche du rayon. */
  rayOnLine(ray, pointMath, dirMath) {
    const p = toThree(pointMath); const u = toThree(dirMath).normalize();
    const w0 = p.clone().sub(ray.origin);
    const a = u.dot(u); const b = u.dot(ray.direction); const c = ray.direction.dot(ray.direction);
    const d = u.dot(w0); const e = ray.direction.dot(w0);
    const den = a * c - b * b;
    if (Math.abs(den) < 1e-9) return 0;
    return (b * e - c * d) / den;
  }

  handleOrbitStart = () => { this.options.onInteract?.(); };

  handlePointerDown = (e) => {
    if (!this.draggables.length) return;
    const ray = this.rayAt(e.clientX, e.clientY);
    const objs = this.draggables.map((d) => d.obj);
    const hits = this.raycaster.intersectObjects(objs, true);
    if (!hits.length) return;
    const hitObj = hits[0].object;
    const entry = this.draggables.find((d) => d.obj === hitObj || d.obj.getObjectById?.(hitObj.id));
    if (!entry) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    this.controls.enabled = false;
    this.renderer.domElement.setPointerCapture?.(e.pointerId);
    this.dragging = entry;
    entry.handlers.start?.({ point: fromThree(hits[0].point), ray });
    this.options.onInteract?.();
  };

  handlePointerMove = (e) => {
    if (!this.dragging) {
      // un curseur « main » au survol d'un objet déplaçable
      if (this.draggables.length && e.pointerType === 'mouse') {
        this.rayAt(e.clientX, e.clientY);
        const over = this.raycaster.intersectObjects(this.draggables.map((d) => d.obj), true).length > 0;
        this.renderer.domElement.style.cursor = over ? 'grab' : '';
      }
      return;
    }
    const ray = this.rayAt(e.clientX, e.clientY);
    this.dragging.handlers.move?.({
      ray, clientX: e.clientX, clientY: e.clientY,
      onPlane: (n, p) => this.rayOnPlane(ray, n, p),
      onLine: (p, d) => this.rayOnLine(ray, p, d),
    });
    this.requestRender();
  };

  handlePointerUp = (e) => {
    if (!this.dragging) return;
    this.renderer.domElement.releasePointerCapture?.(e.pointerId);
    this.dragging.handlers.end?.();
    this.dragging = null;
    this.controls.enabled = this.options.orbit !== false;
  };

  resize() {
    if (this.disposed) return;
    const width = Math.max(1, Math.floor(this.container.clientWidth));
    const height = Math.max(1, Math.floor(this.container.clientHeight));
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.labelRenderer.setSize(width, height);
    this.requestRender();
  }

  requestRender = () => {
    if (this.raf === null && !this.disposed) this.raf = requestAnimationFrame(this.frame);
  };

  frame = (time) => {
    this.raf = null;
    if (this.disposed) return;
    const moved = this.controls.update();
    let more = false;
    for (const fn of [...this.tickers]) { if (fn(time) === true) more = true; else this.tickers.delete(fn); }
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
    if (moved || more) this.raf = requestAnimationFrame(this.frame);
  };

  dispose() {
    this.disposed = true;
    if (this.raf !== null) cancelAnimationFrame(this.raf);
    this.tickers.clear();
    this.resizeObserver?.disconnect();
    this.controls.removeEventListener('change', this.requestRender);
    this.controls.removeEventListener('start', this.handleOrbitStart);
    this.controls.dispose();
    const el = this.renderer.domElement;
    el.removeEventListener('pointerdown', this.handlePointerDown, { capture: true });
    el.removeEventListener('pointermove', this.handlePointerMove);
    el.removeEventListener('pointerup', this.handlePointerUp);
    el.removeEventListener('pointercancel', this.handlePointerUp);
    el.removeEventListener('contextmenu', this.preventDefault);
    disposeObject(this.root);
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    el.remove();
    this.labelRenderer.domElement.remove();
  }
}
