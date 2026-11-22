/**
 * La géométrie d'une FIGURE DE L'ESPACE DÉCLARATIVE — la sœur 3D de geoFigure.js (unité 14 « الهندسة في الفضاء », 2026-10-05) —
 * dessinée par SpaceFigure.jsx dans une leçon ET dans un énoncé de pratique (`statement.figure` avec `kind: 'space'`).
 *
 * Le manuel dessine ses solides « en perspective », parties cachées en POINTILLÉS (طرائق ص 167 : « الجزء الأمامي … بخط مستمر
 * والجزء الخلفي يكون بخط متقطّع »). Ce module projette des points 3D (repère orthonormé, z vers le HAUT) par une projection
 * ORTHOGRAPHIQUE de direction (azimut, élévation) et décide, pour chaque solide, quelles lignes sont vues et lesquelles sont
 * cachées — sans DOM, donc testable et réutilisé par le validateur des exercices (`validateSpaceFigure`).
 *
 *   {
 *     kind: 'space',
 *     view: { azimuth: -60, elevation: 20 },          // degrés ; facultatif (vue par défaut ci-dessous)
 *     points: { O: [0, 0, 0], A: [0, 0, 1.5], M: [2, 0, 1.5] },
 *     solids: [
 *       { type: 'sphere', center: 'O', radius: 2.5 },                                  // contour + équateur (arrière pointillé)
 *       { type: 'polyhedron', faces: [['A','B','C','D'], …], tone: 'sky' },             // pavé, pyramide… (arêtes cachées pointillées)
 *       { type: 'cylinder', base: 'O2', top: 'O1', radius: 2 },                          // axe vertical
 *       { type: 'cone', base: 'O', apex: 'S', radius: 3 },                               // axe vertical
 *       { type: 'frustum', base: 'O2', top: 'O1', radius: 15, topRadius: 20 },           // tronc de cône (un seau)
 *     ],
 *     circles: [{ center: 'A', radius: 2, normal: 'z', on: 0, tone: 'rose' }],          // `on` = index d'une sphère : arrière pointillé
 *     planes: [{ points: ['P1','P2','P3','P4'], tone: 'sky', label: '(P)' }],            // un plan (parallélogramme translucide)
 *     sections: [{ points: ['I','J','K','L'], tone: 'emerald' }],                        // une section (polygone plein)
 *     segments: [{ from: 'O', to: 'M', label: 'R', dashed: true }], rightAngles: [['O','A','M']],
 *     labels: { A: 'ne' }, hidden: ['P1','P2','P3','P4'], ariaLabel: 'كرة مركزها O …', caption, maxWidth,
 *   }
 *
 * Les cercles des solides de révolution sont horizontaux (axe vertical) ; un `circles[]` peut avoir `normal: 'x' | 'y' | 'z'`
 * ou un vecteur [nx, ny, nz] (un grand cercle méridien d'une sphère : normal horizontal).
 */
const SPACE_FIGURE_KEYS = Object.freeze([
  'kind', 'view', 'points', 'solids', 'circles', 'planes', 'sections', 'segments', 'rightAngles', 'labels', 'hidden',
  'ariaLabel', 'maxWidth', 'caption', 'inline',
]);
const SPACE_TONES = Object.freeze(['slate', 'indigo', 'rose', 'emerald', 'amber', 'sky', 'violet']);
const SOLID_TYPES = Object.freeze(['sphere', 'polyhedron', 'cylinder', 'cone', 'frustum']);
const DEFAULT_VIEW = Object.freeze({ azimuth: -62, elevation: 18 });
const DIRS = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0], ne: [0.71, -0.71], nw: [-0.71, -0.71], se: [0.71, 0.71], sw: [-0.71, 0.71] };
const RAD = Math.PI / 180;

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul3 = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm3 = (a) => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

/** La caméra : d (vers l'observateur), u (droite de l'écran), v (haut de l'écran) pour une vue (azimut, élévation). */
export function camera(view = DEFAULT_VIEW) {
  const a = (view.azimuth ?? DEFAULT_VIEW.azimuth) * RAD; const e = (view.elevation ?? DEFAULT_VIEW.elevation) * RAD;
  const d = [Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e)];
  const u = [-Math.sin(a), Math.cos(a), 0];
  const v = cross(d, u);
  return { d, u, v, azimuth: view.azimuth ?? DEFAULT_VIEW.azimuth, elevation: view.elevation ?? DEFAULT_VIEW.elevation };
}

/** Deux vecteurs unitaires orthogonaux d'un plan de normale n. */
function planeBasis(n) {
  const N = norm3(n);
  const helper = Math.abs(N[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  const e1 = norm3(cross(helper, N));
  const e2 = cross(N, e1);
  return [e1, e2];
}
const NORMALS = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
const asNormal = (n) => (typeof n === 'string' ? NORMALS[n] : n ?? NORMALS.z);
/** Les points 3D d'un cercle (centre C, rayon r, normale n), `count` points. */
export function circle3(C, r, n = 'z', count = 96) {
  const [e1, e2] = planeBasis(asNormal(n));
  const out = [];
  for (let i = 0; i <= count; i += 1) {
    const t = (i / count) * 2 * Math.PI;
    out.push(add3(C, add3(mul3(e1, r * Math.cos(t)), mul3(e2, r * Math.sin(t)))));
  }
  return out;
}

/** Coupe une polyligne 3D en morceaux vus / cachés selon `isHidden(p)` (les morceaux se recouvrent d'un point). */
function splitRuns(pts3, isHidden) {
  const runs = [];
  let cur = null;
  for (const p of pts3) {
    const h = !!isHidden(p);
    if (!cur || cur.hidden !== h) {
      const start = cur ? [cur.points[cur.points.length - 1]] : [];
      cur = { hidden: h, points: [...start, p] };
      runs.push(cur);
    } else cur.points.push(p);
  }
  return runs;
}

/** Toutes les erreurs d'une figure de l'espace. */
export function validateSpaceFigure(fig) {
  const errors = [];
  if (!fig || typeof fig !== 'object') return ['figure absente'];
  if (fig.kind !== 'space') errors.push('kind = « space »');
  for (const k of Object.keys(fig)) if (!SPACE_FIGURE_KEYS.includes(k)) errors.push(`clé inconnue « ${k} »`);
  const pts = fig.points ?? {};
  const names = Object.keys(pts);
  if (names.length < 1) errors.push('au moins un point');
  for (const [n, p] of Object.entries(pts)) {
    if (!Array.isArray(p) || p.length !== 3 || !p.every(Number.isFinite)) errors.push(`point ${n} : [x, y, z] numériques`);
  }
  const need = (n, where) => { if (!names.includes(n)) errors.push(`${where} : point inconnu « ${n} »`); };
  const tone = (t, where) => { if (t != null && !SPACE_TONES.includes(t)) errors.push(`${where} : ton inconnu « ${t} »`); };
  const positive = (x, where) => { if (!(Number(x) > 0)) errors.push(`${where} > 0`); };
  if (fig.view != null) {
    const { azimuth = 0, elevation = 0 } = fig.view;
    if (!Number.isFinite(azimuth) || !Number.isFinite(elevation) || elevation <= 0 || elevation >= 90) errors.push('view : azimuth fini, 0 < elevation < 90');
  }
  (fig.solids ?? []).forEach((s, i) => {
    const w = `solids[${i}]`;
    if (!SOLID_TYPES.includes(s.type)) { errors.push(`${w} : type inconnu « ${s.type} »`); return; }
    tone(s.tone, w);
    if (s.type === 'sphere') { need(s.center, w); positive(s.radius, `${w}.radius`); }
    if (s.type === 'polyhedron') {
      if (!Array.isArray(s.faces) || s.faces.length < 4) errors.push(`${w} : au moins 4 faces`);
      (s.faces ?? []).forEach((f) => { if (!Array.isArray(f) || f.length < 3) errors.push(`${w} : une face a au moins 3 sommets`); else f.forEach((n) => need(n, w)); });
    }
    if (['cylinder', 'cone', 'frustum'].includes(s.type)) {
      need(s.base, w); positive(s.radius, `${w}.radius`);
      const topName = s.type === 'cone' ? s.apex : s.top;
      need(topName, w);
      if (s.type === 'frustum') positive(s.topRadius, `${w}.topRadius`);
      const b = pts[s.base]; const t = pts[topName];
      if (b && t && (Math.abs(b[0] - t[0]) > 1e-9 || Math.abs(b[1] - t[1]) > 1e-9 || !(t[2] > b[2]))) errors.push(`${w} : axe vertical, sommet/haut au-dessus de la base`);
    }
  });
  (fig.circles ?? []).forEach((c, i) => {
    need(c.center, `circles[${i}]`); positive(c.radius, `circles[${i}].radius`); tone(c.tone, `circles[${i}]`);
    if (c.normal != null && !NORMALS[c.normal] && !(Array.isArray(c.normal) && c.normal.length === 3 && c.normal.some((x) => x !== 0))) errors.push(`circles[${i}] : normal = x | y | z | [nx, ny, nz]`);
    if (c.on != null && fig.solids?.[c.on]?.type !== 'sphere') errors.push(`circles[${i}].on : index d'une sphère`);
  });
  for (const key of ['planes', 'sections']) {
    (fig[key] ?? []).forEach((p, i) => { if ((p.points ?? []).length < 3) errors.push(`${key}[${i}] : au moins 3 points`); (p.points ?? []).forEach((n) => need(n, `${key}[${i}]`)); tone(p.tone, `${key}[${i}]`); });
  }
  (fig.segments ?? []).forEach((s, i) => { need(s.from, `segments[${i}]`); need(s.to, `segments[${i}]`); tone(s.tone, `segments[${i}]`); if (s.from === s.to) errors.push(`segments[${i}] : from = to`); });
  (fig.rightAngles ?? []).forEach((a, i) => { if (!Array.isArray(a) || a.length !== 3) errors.push(`rightAngles[${i}] : trois points`); else a.forEach((n) => need(n, `rightAngles[${i}]`)); });
  for (const n of Object.keys(fig.labels ?? {})) { need(n, 'labels'); if (!DIRS[fig.labels[n]]) errors.push(`labels.${n} : direction inconnue`); }
  (fig.hidden ?? []).forEach((n) => need(n, 'hidden'));
  if (typeof fig.ariaLabel !== 'string' || !/[؀-ۿ]/.test(fig.ariaLabel)) errors.push('ariaLabel arabe obligatoire');
  return errors;
}

/**
 * Le dessin d'un solide de révolution d'axe vertical (cylindre, cône, tronc) : rayon rb en bas (z = zb), rt en haut (z = zt).
 * Normale latérale en θ : n(θ) = (cos θ·H, sin θ·H, rb − rt) ; la surface est vue là où n·d > 0. Les génératrices de
 * CONTOUR sont celles où n·d = 0 ; le bord du bas est caché là où la surface latérale tourne le dos (élévation > 0).
 */
function revolution(cam, B, rb, zt, rt) {
  const H = zt - B[2];
  const lateral = (t) => dot([Math.cos(t) * H, Math.sin(t) * H, rb - rt], cam.d);
  const at = (z, r, t) => [B[0] + r * Math.cos(t), B[1] + r * Math.sin(t), z];
  const N = 144;
  const bottom = []; const top = [];
  for (let i = 0; i <= N; i += 1) { const t = (i / N) * 2 * Math.PI; bottom.push({ p: at(B[2], rb, t), t }); if (rt > 0) top.push(at(zt, rt, t)); }
  // contour : les changements de signe de n·d le long de θ
  const silhouettes = [];
  for (let i = 0; i < N; i += 1) {
    const t0 = (i / N) * 2 * Math.PI; const t1 = ((i + 1) / N) * 2 * Math.PI;
    if (Math.sign(lateral(t0)) !== Math.sign(lateral(t1))) {
      let lo = t0; let hi = t1;
      for (let k = 0; k < 40; k += 1) { const m = (lo + hi) / 2; if (Math.sign(lateral(m)) === Math.sign(lateral(lo))) lo = m; else hi = m; }
      const t = (lo + hi) / 2;
      silhouettes.push([at(B[2], rb, t), rt > 0 ? at(zt, rt, t) : [B[0], B[1], zt]]);
    }
  }
  return {
    bottomRuns: splitRuns(bottom.map((b) => b.p), (p) => lateral(Math.atan2(p[1] - B[1], p[0] - B[0])) < -1e-9),
    top: rt > 0 ? top : null,
    silhouettes,
  };
}

/**
 * La mise en page : projection, échelle (la plus grande dimension ≈ `size` px), viewBox, coordonnées SVG (y vers le bas) de
 * chaque point, chaque trait en morceaux vus / cachés, la place de chaque étiquette.
 */
export function layoutSpaceFigure(fig, { size = 300, pad = 30 } = {}) {
  const cam = camera(fig.view ?? DEFAULT_VIEW);
  const P3 = fig.points ?? {};
  const proj = (p) => [dot(p, cam.u), dot(p, cam.v)];
  const lines = []; // { pts3, hidden, tone, kind, width }
  const fills = []; // { pts3, tone, kind }
  const outlines = []; // { center3, radius, tone } (contour de sphère)
  const solidCentres = [];

  (fig.solids ?? []).forEach((s, si) => {
    const tone = s.tone ?? 'slate';
    if (s.type === 'sphere') {
      const O = P3[s.center];
      outlines.push({ center3: O, radius: Number(s.radius), tone, fill: s.fill !== false });
      solidCentres.push(O);
      if (s.equator !== false) {
        for (const run of splitRuns(circle3(O, Number(s.radius), 'z', 144), (p) => dot(sub3(p, O), cam.d) < -1e-9)) {
          lines.push({ pts3: run.points, hidden: run.hidden, tone, kind: `s${si}-equator` });
        }
      }
    }
    if (s.type === 'polyhedron') {
      const verts = [...new Set(s.faces.flat())].map((n) => P3[n]);
      const centroid = mul3(verts.reduce((acc, p) => add3(acc, p), [0, 0, 0]), 1 / verts.length);
      solidCentres.push(centroid);
      const front = s.faces.map((f) => {
        const [a, b, c] = f.map((n) => P3[n]);
        let n = norm3(cross(sub3(b, a), sub3(c, a)));
        const fc = mul3(f.map((x) => P3[x]).reduce((acc, p) => add3(acc, p), [0, 0, 0]), 1 / f.length);
        if (dot(n, sub3(fc, centroid)) < 0) n = mul3(n, -1);
        return dot(n, cam.d) > 1e-9;
      });
      const edges = new Map();
      s.faces.forEach((f, fi) => f.forEach((n, k) => {
        const m = f[(k + 1) % f.length];
        const key = [n, m].sort().join('|');
        const e = edges.get(key) ?? { a: n, b: m, front: false };
        e.front = e.front || front[fi];
        edges.set(key, e);
      }));
      for (const e of edges.values()) lines.push({ pts3: [P3[e.a], P3[e.b]], hidden: !e.front, tone, kind: `s${si}-edge`, edge: [e.a, e.b] });
      if (s.fill) s.faces.forEach((f, fi) => { if (front[fi]) fills.push({ pts3: f.map((n) => P3[n]), tone, kind: 'face' }); });
    }
    if (['cylinder', 'cone', 'frustum'].includes(s.type)) {
      const B = P3[s.base]; const T = P3[s.type === 'cone' ? s.apex : s.top];
      const rb = Number(s.radius); const rt = s.type === 'cylinder' ? rb : s.type === 'cone' ? 0 : Number(s.topRadius);
      solidCentres.push(mul3(add3(B, T), 0.5));
      const R = revolution(cam, B, rb, T[2], rt);
      for (const run of R.bottomRuns) lines.push({ pts3: run.points, hidden: run.hidden, tone, kind: `s${si}-bottom` });
      if (R.top) lines.push({ pts3: R.top, hidden: false, tone, kind: `s${si}-top` });
      for (const g of R.silhouettes) lines.push({ pts3: g, hidden: false, tone, kind: `s${si}-side` });
    }
  });

  (fig.circles ?? []).forEach((c, i) => {
    const C = P3[c.center];
    const sphere = c.on != null ? fig.solids[c.on] : null;
    const O = sphere ? P3[sphere.center] : null;
    const runs = splitRuns(circle3(C, Number(c.radius), c.normal ?? 'z', 144), (p) => (O ? dot(sub3(p, O), cam.d) < -1e-9 : false));
    for (const run of runs) lines.push({ pts3: run.points, hidden: c.dashed ? true : run.hidden, tone: c.tone ?? 'rose', kind: `c${i}`, bold: c.bold });
  });
  (fig.planes ?? []).forEach((p) => fills.push({ pts3: p.points.map((n) => P3[n]), tone: p.tone ?? 'sky', kind: 'plane', label: p.label }));
  (fig.sections ?? []).forEach((p) => fills.push({ pts3: p.points.map((n) => P3[n]), tone: p.tone ?? 'emerald', kind: 'section', label: p.label }));
  (fig.segments ?? []).forEach((s) => lines.push({ pts3: [P3[s.from], P3[s.to]], hidden: !!s.dashed, tone: s.tone ?? 'slate', kind: 'segment', seg: s, bold: s.bold }));

  // ── échelle et cadre ──
  const all2 = [];
  for (const n of Object.keys(P3)) all2.push(proj(P3[n]));
  for (const l of lines) for (const p of l.pts3) all2.push(proj(p));
  for (const f of fills) for (const p of f.pts3) all2.push(proj(p));
  for (const o of outlines) { const c = proj(o.center3); all2.push([c[0] - o.radius, c[1] - o.radius], [c[0] + o.radius, c[1] + o.radius]); }
  const xs = all2.map((p) => p[0]); const ys = all2.map((p) => p[1]);
  const minX = Math.min(...xs); const maxX = Math.max(...xs); const minY = Math.min(...ys); const maxY = Math.max(...ys);
  const span = Math.max(maxX - minX, maxY - minY, 1e-6);
  const scale = size / span;
  const toSvg = ([x, y]) => [pad + (x - minX) * scale, pad + (maxY - y) * scale];
  const S = (p3) => toSvg(proj(p3));
  const width = (maxX - minX) * scale + 2 * pad; const height = (maxY - minY) * scale + 2 * pad;

  const P = {};
  for (const [n, p] of Object.entries(P3)) P[n] = S(p);
  const centre2 = solidCentres.length ? S(mul3(solidCentres.reduce((a, p) => add3(a, p), [0, 0, 0]), 1 / solidCentres.length)) : [width / 2, height / 2];

  const pointLabels = {};
  for (const n of Object.keys(P)) {
    const hint = fig.labels?.[n];
    let dir;
    if (hint) dir = DIRS[hint];
    else {
      const v = [P[n][0] - centre2[0], P[n][1] - centre2[1]];
      const l = Math.hypot(...v);
      dir = l < 1 ? [0.71, -0.71] : [v[0] / l, v[1] / l];
    }
    pointLabels[n] = [P[n][0] + dir[0] * 13, P[n][1] + dir[1] * 13 + 5];
  }
  const segmentLabel = (s) => {
    const a = P[s.from]; const b = P[s.to];
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const t = [b[0] - a[0], b[1] - a[1]]; const l = Math.hypot(...t) || 1;
    let n = [-t[1] / l, t[0] / l];
    if ((m[0] - centre2[0]) * n[0] + (m[1] - centre2[1]) * n[1] < 0) n = [-n[0], -n[1]];
    if (s.labelSide === 'in') n = [-n[0], -n[1]];
    // `labelOffset` (px, facultatif, défaut 12) : éloigne la cote de son trait — une cote « 28 cm » sur un trait VERTICAL,
    // centrée à 12 px, chevaucherait le trait (ajout wadiya-idmajiya-fada, 2026-10-05 ; sans la clé, rien ne change).
    const off = Number.isFinite(s.labelOffset) ? s.labelOffset : 12;
    return [m[0] + n[0] * off, m[1] + n[1] * off + 4];
  };

  return {
    width, height, scale, cam, P, pointLabels, centre2,
    lines: lines.map((l) => ({ ...l, pts: l.pts3.map(S) })),
    fills: fills.map((f) => ({ ...f, pts: f.pts3.map(S) })),
    outlines: outlines.map((o) => ({ ...o, c: S(o.center3), r: o.radius * scale })),
    segmentLabel,
    rightAngle: ([a, v, b], len = 9) => {
      const A = P3[a]; const V = P3[v]; const Bp = P3[b];
      const ua = norm3(sub3(A, V)); const ub = norm3(sub3(Bp, V));
      const k = len / scale;
      return [S(add3(V, mul3(ua, k))), S(add3(add3(V, mul3(ua, k)), mul3(ub, k))), S(add3(V, mul3(ub, k)))];
    },
  };
}

/**
 * La QUALITÉ d'une figure de l'espace (même règle que `figureQuality` de geoFigure.js) : pas de bande étroite, deux noms de
 * points qui ne se chevauchent pas et ne se posent pas sur un autre point, une cote qui ne couvre pas un nom.
 */
export function spaceFigureQuality(fig, { maxAspect = 2.0, minGap = 14, size = 300 } = {}) {
  const issues = [];
  const L = layoutSpaceFigure(fig, { size });
  const ratio = Math.max(L.width, L.height) / Math.max(1, Math.min(L.width, L.height));
  if (ratio > maxAspect) issues.push(`aspect : ${ratio.toFixed(2)} > ${maxAspect} (bande étroite)`);
  const hidden = new Set(fig.hidden ?? []);
  const names = Object.keys(L.P).filter((n) => !hidden.has(n));
  for (let i = 0; i < names.length; i += 1) {
    for (let j = i + 1; j < names.length; j += 1) {
      const a = L.pointLabels[names[i]]; const b = L.pointLabels[names[j]];
      if (Math.hypot(a[0] - b[0], a[1] - b[1]) < minGap) issues.push(`label : ${names[i]} / ${names[j]} se chevauchent`);
    }
    for (const n of names) {
      if (n === names[i]) continue;
      const a = L.pointLabels[names[i]]; const p = L.P[n];
      if (Math.hypot(a[0] - p[0], a[1] - 5 - p[1]) < minGap * 0.7) issues.push(`label : ${names[i]} posé sur le point ${n}`);
    }
  }
  // une cote (« 25 cm », « R ») posée sur un nom de point
  for (const s of (fig.segments ?? []).filter((x) => x.label != null)) {
    const c = L.segmentLabel(s);
    for (const n of names) {
      const a = L.pointLabels[n];
      if (Math.hypot(a[0] - c[0], a[1] - c[1]) < minGap) issues.push(`label : cote « ${s.label} » sur le nom ${n}`);
    }
  }
  return issues;
}

/**
 * Aide pour les auteurs : les huit sommets d'une بلاطة قائمة posée sur le plan z = 0, nommés comme le manuel les nomme
 * (`names` = la face du HAUT puis celle du BAS, dans le même ordre, ex. 'ABCDEFGH' : ABCD en haut, EFGH en bas, A au-dessus de E).
 * `length` le long de x, `width` le long de y, `height` le long de z ; le premier sommet du haut est en (0, 0, height).
 */
export function cuboidPoints(names, { length, width, height, origin = [0, 0, 0] }) {
  const [o0, o1, o2] = origin;
  const base = [[0, 0], [length, 0], [length, width], [0, width]];
  const out = {};
  names.split('').forEach((n, i) => { const [x, y] = base[i % 4]; out[n] = [o0 + x, o1 + y, o2 + (i < 4 ? height : 0)]; });
  return out;
}
/** Les six faces d'un pavé nommé comme `cuboidPoints` (haut ABCD, bas EFGH, A au-dessus de E). */
export function cuboidFaces(names) {
  const [A, B, C, D, E, F, G, H] = names.split('');
  return [[A, B, C, D], [E, F, G, H], [A, B, F, E], [B, C, G, F], [C, D, H, G], [D, A, E, H]];
}
