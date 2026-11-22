/**
 * La SCÈNE 3D de sphere-probe — sans React, sur le kit commun (stage3d/spaceStage.js + solids3d.js). Stage3D l'appelle UNE
 * fois (`buildSphereProbeScene(stage, bridge)`) ; chaque changement de l'état du lab appelle `update(view)`.
 *
 *   la كرة (δ)        une sphère de VERRE (surface creuse, l'équateur en anneau fin) — elle s'allume quand une
 *                     déclaration « على الكرة » vient d'être acceptée ;
 *   la جلّة (β)       la même boule PLEINE (verre teinté épais / fonte du lancer du poids) — la bascule كرة ⟷ جلة ;
 *   le repère         trois axes fins x, y, z depuis O (le « معلم للفضاء » du درس) ;
 *   la sonde M        une bille ambrée qu'on GLISSE sur le plan horizontal où elle se trouve (quadrillage aux nœuds entiers,
 *                     `onPlane`) et une flèche au-dessus qu'on tire vers le haut ou le bas (`onLine`) ;
 *                     son pied M₀(x ; y ; 0), [OM₀] et [M₀M] en pointillés : OM² = OM₀² + z² (Pythagore, deux fois) ;
 *   les sondes A, B, C (مبتدئ) et les points posés M, P, Q (متقدم), teintés par leur position jugée ;
 *   étape « الأقطار والدوائر » : l'axe [NS], M′ (glisser + flèche), le plan z = h (sa poignée sur le bord) et la section
 *                     (anneau rose + disque) de rayon √(R² − h²), son centre O₁.
 * Aucune décision ici : `view` porte les verdicts déjà calculés par logic/sphereProbe.js. La main ne passe que par le pont
 * `bridge.current` (moveM, movePrime, setPlane, grab) — la scène arrondit au nœud, la logique borne.
 */
import { Group } from 'three';
import { toThree } from './stage3d/spaceStage';
import { sphere, ball, ring, disc, plane, line, segment, dot, handle, cone } from './stage3d/solids3d';

const KIND_COLOR = { surface: '#f59e0b', inside: '#0ea5e9', outside: '#e11d48' };
const WORLD = {
  'glass-globe': { shell: '#c4b5fd', full: '#8b5cf6', fullOpacity: 0.66, metal: 0.1, glow: '#f0abfc' },
  'shot-put': { shell: '#bfdbfe', full: '#64748b', fullOpacity: 0.78, metal: 0.65, glow: '#fde68a' },
};

export function buildSphereProbeScene(stage, bridge) {
  const g = {}; // les objets durables
  let built = null; // { R, bound, world }
  let temp = []; // les objets recréés à chaque mise à jour (segments, marqueurs)
  let drags = [];
  const labels = {};

  const label = (key, text, style) => {
    if (!labels[key]) { labels[key] = stage.label(text, [0, 0, 0], { size: 15, ...style }); stage.add(labels[key]); }
    const l = labels[key];
    if (l.element.textContent !== text) l.element.textContent = text;
    return l;
  };
  const place = (obj, p) => { obj.position.copy(toThree(p)); return obj; };
  const show = (obj, v) => { if (obj) obj.visible = !!v; };
  const clearTemp = () => { temp.forEach((o) => stage.remove(o)); temp = []; };
  const addTemp = (o) => { stage.add(o); temp.push(o); return o; };

  function buildSolids(R, bound, world) {
    Object.values(g).flat().forEach((o) => stage.remove(o));
    Object.keys(g).forEach((k) => delete g[k]);
    const W = WORLD[world] ?? WORLD['glass-globe'];
    g.shell = stage.add(sphere(R, { color: W.shell, opacity: 0.2 }));
    g.shell.material.emissive?.set('#000000');
    g.full = stage.add(ball(R, { color: W.full, opacity: W.fullOpacity }));
    g.full.material.metalness = W.metal;
    g.full.material.depthWrite = false;
    g.full.renderOrder = 2;
    g.equator = stage.add(ring([0, 0, 0], R, { normal: 'z', color: W.shell, tube: 0.022, opacity: 0.85 }));
    // un méridien très fin : la forme ronde se lit sous tous les angles (décor du verre, aucune information)
    g.meridian = stage.add(ring([0, 0, 0], R, { normal: 'x', color: W.shell, tube: 0.012, opacity: 0.4 }));
    g.O = stage.add(dot([0, 0, 0], { radius: 0.08, color: 'ink' }));
    const L = bound + 0.6;
    g.axes = [
      stage.add(line([[-L, 0, 0], [L, 0, 0]], { color: '#94a3b8', opacity: 0.55 })),
      stage.add(line([[0, -L, 0], [0, L, 0]], { color: '#94a3b8', opacity: 0.55 })),
      stage.add(line([[0, 0, -L], [0, 0, L]], { color: '#94a3b8', opacity: 0.55 })),
    ];
    // le quadrillage du plan horizontal de la sonde (nœuds entiers), déplacé en hauteur avec elle
    const pts = [];
    for (let i = -bound; i <= bound; i += 1) {
      pts.push(line([[i, -bound, 0], [i, bound, 0]], { color: '#64748b', opacity: 0.28 }));
      pts.push(line([[-bound, i, 0], [bound, i, 0]], { color: '#64748b', opacity: 0.28 }));
    }
    // les lignes du quadrillage sous un parent qu'on monte / descend avec la sonde
    g.grid = new Group();
    pts.forEach((p) => g.grid.add(p));
    stage.add(g.grid);
    // la sonde et sa flèche de hauteur
    g.m = stage.add(handle([0, 0, 0], { radius: 0.17, color: 'amber' }));
    g.mUp = stage.add(cone(0.15, 0.34, { color: 'amber', opacity: 1 }));
    g.mDown = stage.add(cone(0.15, 0.34, { color: 'amber', opacity: 1 }));
    g.mDown.rotation.x = Math.PI; // pointe en bas
    // l'étape 2
    g.prime = stage.add(handle([0, 0, 0], { radius: 0.17, color: 'violet' }));
    g.pUp = stage.add(cone(0.15, 0.34, { color: 'violet', opacity: 1 }));
    g.plane = stage.add(plane([0, 0, 0], { normal: 'z', size: 2 * R + 2.6, color: 'sky', opacity: 0.16 }));
    g.planeHandle = stage.add(handle([0, 0, 0], { radius: 0.19, color: 'sky' }));
    built = { R, bound, world };
    registerDrags();
  }

  function registerDrags() {
    drags.forEach((off) => off());
    drags = [];
    let offset = 0;
    const horiz = (getZ, move) => ({
      start: () => bridge.current?.grab?.(true),
      move: ({ onPlane }) => { const z = getZ(); const p = onPlane([0, 0, 1], [0, 0, z]); if (p) move([Math.round(p[0]), Math.round(p[1]), z]); },
      end: () => bridge.current?.grab?.(false),
    });
    const vert = (getP, move) => ({
      start: (hit) => { offset = hit.point[2] - getP()[2]; bridge.current?.grab?.(true); },
      move: ({ onLine }) => { const p = getP(); const t = onLine([p[0], p[1], 0], [0, 0, 1]); move([p[0], p[1], Math.round(t - offset)]); },
      end: () => bridge.current?.grab?.(false),
    });
    const cur = () => bridge.current?.view ?? {};
    drags.push(stage.draggable(g.m, horiz(() => cur().M[2], (p) => bridge.current?.moveM(p))));
    drags.push(stage.draggable(g.mUp, vert(() => cur().M, (p) => bridge.current?.moveM(p))));
    drags.push(stage.draggable(g.mDown, vert(() => cur().M, (p) => bridge.current?.moveM(p))));
    drags.push(stage.draggable(g.prime, horiz(() => cur().prime[2], (p) => bridge.current?.movePrime(p))));
    drags.push(stage.draggable(g.pUp, vert(() => cur().prime, (p) => bridge.current?.movePrime(p))));
    drags.push(stage.draggable(g.planeHandle, {
      start: (hit) => { offset = hit.point[2] - cur().h; bridge.current?.grab?.(true); },
      move: ({ onLine }) => { const v = cur(); const t = onLine([v.R + 1.3, 0, 0], [0, 0, 1]); bridge.current?.setPlane(Math.round(t - offset)); },
      end: () => bridge.current?.grab?.(false),
    }));
  }

  function update(v) {
    if (!v) return;
    if (!built || built.R !== v.R || built.bound !== v.bound || built.world !== v.world) buildSolids(v.R, v.bound, v.world);
    const W = WORLD[v.world] ?? WORLD['glass-globe'];
    const { R, bound } = v;
    clearTemp();
    const circles = v.stage === 'circles';
    const hollow = v.object === 'sphere';

    // كرة ⟷ جلة
    show(g.full, !hollow && !circles);
    g.shell.material.opacity = hollow || circles ? 0.32 : 0.1;
    const glow = !!v.glow;
    g.shell.material.emissive?.set(glow ? W.glow : '#000000');
    if (g.shell.material.emissiveIntensity != null) g.shell.material.emissiveIntensity = glow ? 0.55 : 0;
    g.equator.material.opacity = circles ? 0.35 : 0.85;

    label('O', 'O').position.copy(toThree([-0.32, -0.12, -0.32]));
    const L = bound + 0.6;
    label('x', 'x', { color: '#64748b', size: 13 }).position.copy(toThree([L + 0.2, 0, 0]));
    label('y', 'y', { color: '#64748b', size: 13 }).position.copy(toThree([0, L + 0.2, 0]));
    label('z', 'z', { color: '#64748b', size: 13 }).position.copy(toThree([0, 0, L + 0.25]));

    // la sonde (étape 1)
    const M = v.M;
    show(g.m, !circles); show(g.mUp, !circles); show(g.mDown, !circles); show(g.grid, !circles);
    if (!circles) {
      place(g.m, M);
      place(g.mUp, [M[0], M[1], M[2] + 0.36]);
      place(g.mDown, [M[0], M[1], M[2] - 0.36]);
      g.grid.position.copy(toThree([0, 0, M[2]]));
      const tint = v.verdict ? KIND_COLOR[v.verdict] : '#334155';
      addTemp(segment([0, 0, 0], M, { color: tint }));
      if (M[2] !== 0) addTemp(segment([M[0], M[1], 0], M, { color: '#475569', dashed: true }));
      if (M[0] !== 0 || M[1] !== 0) addTemp(segment([0, 0, 0], [M[0], M[1], 0], { color: '#475569', dashed: true }));
      if (M[2] !== 0 && (M[0] !== 0 || M[1] !== 0)) addTemp(dot([M[0], M[1], 0], { radius: 0.05, color: '#475569' }));
      label('M', v.name ?? 'M', { color: '#92400e' }).position.copy(toThree([M[0] + 0.28, M[1], M[2] + 0.3]));
      labels.M.visible = true;
    } else if (labels.M) labels.M.visible = false;

    // les sondes A, B, C et les points posés
    const keep = new Set();
    for (const p of v.probes ?? []) {
      const c = p.done ? KIND_COLOR[p.done] : '#10b981';
      addTemp(dot(p.at, { radius: 0.13, color: c }));
      addTemp(dot(p.at, { radius: 0.24, color: c })).material.opacity = 0.25;
      temp[temp.length - 1].material.transparent = true;
      label(`p-${p.name}`, p.name, { color: '#065f46' }).position.copy(toThree([p.at[0] - 0.3, p.at[1], p.at[2] + 0.3]));
      labels[`p-${p.name}`].visible = !circles && v.onProbe !== p.name;
      keep.add(`p-${p.name}`);
    }
    for (const p of v.placed ?? []) {
      addTemp(dot(p.at, { radius: 0.12, color: KIND_COLOR[p.kind] }));
      const key = `q-${p.name}`;
      label(key, p.name, { color: '#0f172a' }).position.copy(toThree([p.at[0] + 0.28, p.at[1], p.at[2] + 0.3]));
      labels[key].visible = !circles || p.kind === 'surface';
      keep.add(key);
    }
    for (const key of Object.keys(labels)) if ((key.startsWith('p-') || key.startsWith('q-')) && !keep.has(key)) labels[key].visible = false;

    // l'étape « الأقطار والدوائر »
    const planeOn = circles && !!v.showPlane;
    const primeOn = circles && !v.showPlane;
    show(g.prime, primeOn); show(g.pUp, primeOn); show(g.plane, planeOn); show(g.planeHandle, planeOn);
    for (const k of ['N', 'S', "M'", 'O1']) if (labels[k]) labels[k].visible = false;
    if (circles) {
      addTemp(line([[0, 0, -R], [0, 0, R]], { color: '#334155', dashed: true }));
      const atN = (q) => q[0] === 0 && q[1] === 0 && q[2] === R;
      const atS = (q) => q[0] === 0 && q[1] === 0 && q[2] === -R;
      // N et S nommés seulement quand M (ou M′) n'y est pas déjà : deux noms ne se posent jamais l'un sur l'autre
      label('N', 'N').position.copy(toThree([0.25, 0, R + 0.3])); labels.N.visible = !atN(v.anchor) && !atN(v.prime);
      label('S', 'S').position.copy(toThree([0.25, 0, -R - 0.35])); labels.S.visible = !atS(v.anchor) && !atS(v.prime);
      addTemp(dot([0, 0, R], { radius: 0.07 })); addTemp(dot([0, 0, -R], { radius: 0.07 }));
      const A = v.anchor; const P = v.prime;
      place(g.prime, P); place(g.pUp, [P[0], P[1], P[2] + 0.36]);
      if (primeOn || v.diameterOk) addTemp(segment(A, P, { color: v.diameterOk ? '#f59e0b' : '#7c3aed', dashed: !v.diameterOk }));
      if (!primeOn && v.diameterOk) addTemp(dot(P, { radius: 0.1, color: 'violet' }));
      label("M'", 'M′', { color: '#5b21b6' }).position.copy(toThree([P[0] + 0.3, P[1], P[2] + 0.3])); labels["M'"].visible = primeOn || !!v.diameterOk;
      // le plan z = h et sa section
      place(g.plane, [0, 0, v.h]);
      place(g.planeHandle, [R + 1.3, 0, v.h]);
      if (planeOn && v.section && (v.section.kind === 'circle' || v.section.kind === 'great-circle')) {
        const r = v.section.radiusNumber;
        addTemp(ring([0, 0, v.h], r, { normal: 'z', color: v.section.kind === 'great-circle' ? '#f59e0b' : '#e11d48', tube: 0.045 }));
        addTemp(disc([0, 0, v.h], r, { normal: 'z', color: v.section.kind === 'great-circle' ? 'amber' : 'rose', opacity: 0.32 }));
        if (v.h !== 0) {
          addTemp(dot([0, 0, v.h], { radius: 0.07, color: 'rose' }));
          label('O1', 'O₁', { color: '#9f1239' }).position.copy(toThree([-0.35, 0, v.h + 0.28])); labels.O1.visible = true;
        }
      }
      if (planeOn && v.section && v.section.kind === 'point') addTemp(dot([0, 0, v.h], { radius: 0.12, color: 'rose' }));
    }
    stage.requestRender();
  }

  return {
    update,
    dispose() { drags.forEach((off) => off()); drags = []; clearTemp(); },
  };
}

