import React, { useRef, useState, useCallback } from 'react';
import { sampleFunction, clipAffineToRange, imageAt, antecedentsOf } from '../utils/cartesian';

/**
 * CoordPlane — le repère orthogonal du collège, quatre quadrants.
 *
 * Complète `NumberLine` (une dimension) et `CoordGrid` (6e : premier
 * quadrant, cases et nœuds). Ici les coordonnées sont RELATIVES : c'est ce
 * qui distingue le repérage de 3e de celui de 6e, et c'est aussi ce dont les
 * vecteurs ont besoin.
 *
 * RÈGLES D'INGÉNIERIE (playbook §10), les mêmes que CoordGrid :
 *  - Une SEULE zone tactile : un <rect> transparent plein cadre converti en
 *    coordonnées par `svgToCoord`. Le nombre de nœuds interactifs ne dépend
 *    donc pas de la taille du repère.
 *  - Tout le décor porte pointerEvents:'none' — peint après la zone tactile,
 *    il l'intercepterait.
 *  - role="group" dès qu'il y a une zone tactile (un role="img" masquerait
 *    l'élément focusable aux lecteurs d'écran).
 *  - Chemin clavier complet (flèches, Home/End, PageUp/PageDown) : aucune
 *    mécanique n'est réservée au pointeur.
 *
 * CE QUI EST DESSINÉ EST DÉRIVÉ DES DONNÉES. Le composant ne reçoit aucun
 * drapeau de style décidant qu'un segment « est » une longueur ou qu'une
 * flèche « est » un vecteur : il reçoit des points et des couples de points,
 * et la leçon garde la responsabilité du sens.
 *
 * REPÈRE : y mathématique vers le HAUT. La conversion vers le y SVG (vers le
 * bas) se fait ici et NULLE PART AILLEURS — les leçons manipulent toujours
 * des coordonnées d'élève.
 *
 * ─── COURBES ET FONCTIONS (extension 3e « données, probabilités, fonctions ») ──
 * Toutes les props ci-dessous sont FACULTATIVES et par défaut inactives : le
 * repérage de 3e (reperage-droite-plan-3e) continue de fonctionner sans y
 * toucher. Elles ajoutent ce qu'une leçon de fonctions demande :
 *   functions   droites/courbes tracées à partir d'une règle x ↦ y, TOUJOURS
 *               coupées au cadre (cartesian.clipAffineToRange) — une droite
 *               y = 5x ne doit jamais être tracée jusqu'à y = 400 puis rognée.
 *   curves      polylignes de données déjà échantillonnées.
 *   cursor      sonde verticale : un x, et la valeur de chaque courbe en ce x.
 *   readGuides  mode 'x' → l'image (une seule) ; mode 'y' → TOUS les
 *               antécédents. C'est la dissymétrie que la leçon fait voir.
 *   staircase   l'escalier +1 → +a qui fait lire le coefficient directeur.
 *   intercept   le point (0 ; b) sur l'axe des ordonnées.
 *   highlightIntervals  bandes de croissance / décroissance sur l'axe des x.
 *   xStep/yStep/labelEvery  l'échelle, commandée par le module (« l'échelle
 *               qui change tout » est une leçon à part entière).
 *   frozen      recap non interactif pour la synthèse du boss.
 */

const PAD = 30;

/**
 * ─── SÉCURITÉ DE MISE EN PAGE ──────────────────────────────────────────
 * Toute valeur valide doit avoir un affichage valide. Une graduation large
 * (« −125,75 ») dépasserait un PAD fixe de 30 px et serait rognée : la marge
 * gauche est donc CALCULÉE à partir des étiquettes réellement affichées, et
 * la marge basse/droite réserve la place des étiquettes d'axes.
 * Largeurs en font-mono 10 px, mesurées caractère par caractère plutôt que
 * supposées — c'est la seule façon de rester juste pour 3 comme pour −1234,5.
 */
const GLYPH_W = { ',': 3, '−': 5.5, '-': 5.5, '.': 3 };
const textWidth = (str, size = 10) =>
  [...String(str)].reduce((n, c) => n + (GLYPH_W[c] ?? size * 0.6), 0);

/** Palette des courbes — jamais de couleur seule porteuse de sens : chaque
 *  courbe reçoit aussi une étiquette. */
const CURVE_TONES = {
  indigo: '#4f46e5', emerald: '#059669', rose: '#e11d48',
  amber: '#d97706', sky: '#0284c7', violet: '#7c3aed', slate: '#64748b',
};
const toneOf = (t) => CURVE_TONES[t] ?? t ?? CURVE_TONES.indigo;

/** Fabrique le transformateur coordonnées ⇄ SVG pour une étendue donnée. */
export function planeGeometry(range, unit = 34, pad = PAD) {
  const { xMin, xMax, yMin, yMax } = range;
  // `pad` peut être un nombre (les quatre côtés, comportement historique) ou
  // {left, right, top, bottom} quand les étiquettes demandent plus de place.
  const p = typeof pad === 'number'
    ? { left: pad, right: pad, top: pad, bottom: pad }
    : { left: PAD, right: PAD, top: PAD, bottom: PAD, ...pad };
  const width = (xMax - xMin) * unit + p.left + p.right;
  const height = (yMax - yMin) * unit + p.top + p.bottom;
  const toSvg = (x, y) => ({
    x: p.left + (x - xMin) * unit,
    y: p.top + (yMax - y) * unit,
  });
  const toCoord = (sx, sy) => ({
    x: (sx - p.left) / unit + xMin,
    y: yMax - (sy - p.top) / unit,
  });
  return { width, height, unit, toSvg, toCoord, range, pad: p };
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
/** Arrondi au pas, en neutralisant les artefacts de flottants (0,1 + 0,2). */
const roundStep = (v, st) => Math.round((v / st) + Number.EPSILON) * st;

/** Arrondit au pas de la grille et borne au cadre. */
export function snapCoord(p, range, step = 1) {
  return {
    x: clamp(Math.round(p.x / step) * step, range.xMin, range.xMax),
    y: clamp(Math.round(p.y / step) * step, range.yMin, range.yMax),
  };
}

/** Une graduation : virgule française et moins typographique, sans zéro inutile. */
function formatTick(v) {
  const r = Math.round(v * 1000) / 1000;
  return String(Number.isInteger(r) ? r : r.toFixed(2).replace(/0+$/, '').replace(/\.$/, ''))
    .replace('.', ',')
    .replace('-', '−');
}

/** Écriture française d'un couple de coordonnées : (3 ; −2). */
export function formatCoords(p, decimals = 0) {
  const fmt = (v) => {
    const r = decimals > 0 ? v.toFixed(decimals).replace('.', ',') : String(Math.round(v));
    return r.replace('-', '−'); // moins typographique
  };
  return `(${fmt(p.x)} ; ${fmt(p.y)})`;
}

export default function CoordPlane({
  range = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
  unit = 34,
  step = 1,
  points = [],
  onPointChange,
  draggableId = null,
  segments = [],
  polygons = [],
  arrows = [],
  guides = null,
  ghost = null,
  target = null,
  overlay = null,
  showGrid = true,
  axisLabels = { x: 'x', y: 'y' },
  disabled = false,
  size,
  ariaLabel,
  caption = true,
  // ── Extension fonctions (voir l'en-tête) — inactives par défaut ──
  functions = [],
  curves = [],
  cursor = null,
  readGuides = null,
  staircase = null,
  intercept = null,
  highlightIntervals = [],
  xStep = 1,
  yStep = 1,
  labelEvery = null,
  frozen = false,
}) {
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const [focused, setFocused] = useState(false);
  const [settled, setSettled] = useState(true);

  // ── Marges calculées d'après les étiquettes réellement dessinées ──
  // Les graduations sont dérivées AVANT la géométrie, parce que c'est leur
  // largeur qui décide de la marge gauche. Sans cela, « −125,75 » sortirait
  // du cadre (règle : tout état valide a un affichage valide).
  const tickXs = [];
  for (let v = roundStep(range.xMin, xStep); v <= range.xMax + 1e-9; v += xStep) {
    if (v >= range.xMin - 1e-9) tickXs.push(Number(v.toFixed(6)));
  }
  const tickYs = [];
  for (let v = roundStep(range.yMin, yStep); v <= range.yMax + 1e-9; v += yStep) {
    if (v >= range.yMin - 1e-9) tickYs.push(Number(v.toFixed(6)));
  }
  const everyX = labelEvery ?? (tickXs.length > 13 ? 2 : 1);
  const everyY = labelEvery ?? (tickYs.length > 13 ? 2 : 1);

  // Largeur de la plus large étiquette d'ordonnée, + son décalage de 8 px,
  // + 4 px de respiration. Jamais moins que la marge historique.
  const widestY = tickYs
    .filter((v, i) => v !== 0 && i % everyY === 0)
    .reduce((m, v) => Math.max(m, textWidth(formatTick(v))), 0);
  // Une étiquette d'abscisse déborde de la moitié de sa largeur de chaque côté.
  const halfFirstX = tickXs.length ? textWidth(formatTick(tickXs[0])) / 2 : 0;
  const halfLastX = tickXs.length ? textWidth(formatTick(tickXs[tickXs.length - 1])) / 2 : 0;

  const padding = {
    left: Math.max(PAD, widestY + 12, halfFirstX + 6),
    right: Math.max(PAD, halfLastX + 6),
    top: PAD,
    bottom: PAD,
  };

  const geo = planeGeometry(range, unit, padding);
  const { toSvg, toCoord, width, height } = geo;
  const locked = disabled || frozen;
  const dragsPoint = !locked && !!draggableId && typeof onPointChange === 'function';
  const dragsCursor = !locked && !!cursor && typeof cursor.onChange === 'function';
  const dragsGuide = !locked && !!readGuides && typeof readGuides.onChange === 'function';
  const interactive = dragsPoint || dragsCursor || dragsGuide;
  const active = points.find((p) => p.id === draggableId) ?? null;

  // L'axe piloté quand c'est une sonde (et non un point) qu'on déplace.
  const guideAxis = dragsGuide ? (readGuides.mode === 'y' ? 'y' : 'x') : null;
  const scalarStep = guideAxis === 'y' ? yStep : xStep;

  /** Arrondit un scalaire au pas et le borne à l'axe. */
  const snapScalar = (v, axis) => {
    const st = axis === 'y' ? yStep : xStep;
    const lo = axis === 'y' ? range.yMin : range.xMin;
    const hi = axis === 'y' ? range.yMax : range.xMax;
    return clamp(roundStep(v, st), lo, hi);
  };

  const coordFromClient = useCallback(
    (clientX, clientY) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return null;
      const sx = ((clientX - rect.left) / rect.width) * width;
      const sy = ((clientY - rect.top) / rect.height) * height;
      const raw = toCoord(sx, sy);
      // Un point se pose sur la grille des points ; une sonde suit son propre
      // pas d'axe — c'est `commit` qui l'arrondit, pas ici.
      return dragsPoint ? snapCoord(raw, range, step) : raw;
    },
    [width, height, toCoord, range, step, dragsPoint]
  );

  const commit = (p) => {
    if (!p || !interactive) return;
    if (dragsPoint) { onPointChange(p); return; }
    if (dragsCursor) { cursor.onChange(snapScalar(p.x, 'x')); return; }
    if (dragsGuide) { readGuides.onChange(snapScalar(guideAxis === 'y' ? p.y : p.x, guideAxis)); }
  };

  const handlePointerDown = (e) => {
    if (!interactive) return;
    dragging.current = true;
    setSettled(false);
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      /* pointeur déjà relâché — sans conséquence */
    }
    commit(coordFromClient(e.clientX, e.clientY));
  };

  const handlePointerMove = (e) => {
    if (!interactive || !dragging.current) return;
    commit(coordFromClient(e.clientX, e.clientY));
  };

  const endDrag = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    setSettled(true);
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      /* idem */
    }
  };

  /** L'alternative obligatoire au glisser. */
  const handleKeyDown = (e) => {
    if (!interactive) return;

    // Sonde verticale ou guide de lecture : un seul scalaire à déplacer.
    if (!dragsPoint && (dragsCursor || dragsGuide)) {
      const axis = dragsCursor ? 'x' : guideAxis;
      const cur = dragsCursor ? cursor.x : readGuides.value;
      const st = dragsCursor ? xStep : scalarStep;
      const lo = axis === 'y' ? range.yMin : range.xMin;
      const hi = axis === 'y' ? range.yMax : range.xMax;
      const moves = {
        ArrowRight: cur + st, ArrowUp: cur + st,
        ArrowLeft: cur - st, ArrowDown: cur - st,
        Home: lo, End: hi,
      };
      if (!(e.key in moves)) return;
      e.preventDefault();
      const v = snapScalar(moves[e.key], axis);
      if (dragsCursor) cursor.onChange(v);
      else readGuides.onChange(v);
      return;
    }

    if (!active) return;
    const moves = {
      ArrowRight: { x: active.x + step, y: active.y },
      ArrowLeft: { x: active.x - step, y: active.y },
      ArrowUp: { x: active.x, y: active.y + step },
      ArrowDown: { x: active.x, y: active.y - step },
      Home: { x: range.xMin, y: active.y },
      End: { x: range.xMax, y: active.y },
      PageUp: { x: active.x, y: range.yMax },
      PageDown: { x: active.x, y: range.yMin },
    };
    const next = moves[e.key];
    if (!next) return;
    e.preventDefault();
    commit(snapCoord(next, range, step));
  };

  // La grille suit le pas demandé : « l'échelle qui change tout » a besoin de
  // faire varier xStep/yStep sans que le repère change de taille.
  const gridXs = tickXs;
  const gridYs = tickYs;

  const gridLines = [];
  if (showGrid) {
    for (const x of gridXs) {
      const a = toSvg(x, range.yMin);
      const b = toSvg(x, range.yMax);
      gridLines.push(
        <line key={`gx${x}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#e2e8f0" strokeWidth="1" />
      );
    }
    for (const y of gridYs) {
      const a = toSvg(range.xMin, y);
      const b = toSvg(range.xMax, y);
      gridLines.push(
        <line key={`gy${y}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#e2e8f0" strokeWidth="1" />
      );
    }
  }

  // ── Courbes : une fonction devient une polyligne, coupée au cadre ──
  const plotted = functions.map((f) => {
    if (typeof f.a === 'number') {
      // Affine : deux points suffisent, et le découpage est exact.
      const seg = clipAffineToRange(range, f.a, f.b ?? 0);
      return { ...f, points: seg ? [seg.from, seg.to] : [] };
    }
    const pts = sampleFunction(f.fn, range, f.samples ?? 120)
      .filter((pt) => pt.y >= range.yMin - 1e-9 && pt.y <= range.yMax + 1e-9);
    return { ...f, points: pts };
  });
  const allCurves = [
    ...plotted.map((f) => ({ id: f.id, label: f.label, tone: f.tone, points: f.points, dashed: f.dashed })),
    ...curves,
  ];

  /** La polyligne d'une courbe, pour lire une image ou un antécédent. */
  const curveSamples = (c) =>
    (typeof c.fn === 'function' ? sampleFunction(c.fn, range, 240) : c.points ?? []);

  const O = toSvg(0, 0);
  const xEnd = toSvg(range.xMax, 0);
  const yEnd = toSvg(0, range.yMax);

  // La lecture vocale décrit CE QUI EST PILOTÉ : un point, une sonde, un guide.
  let label = 'aucun élément mobile';
  if (dragsPoint && active) {
    label = `${active.name ?? 'point'} en ${formatCoords(active)}`;
  } else if (dragsCursor) {
    const readings = allCurves
      .map((c) => {
        const y = imageAt(curveSamples(c), cursor.x);
        return y === null ? null : `${c.label ?? 'courbe'} : ${formatTick(y)}`;
      })
      .filter(Boolean);
    label = `curseur en x = ${formatTick(cursor.x)}${readings.length ? `, ${readings.join(', ')}` : ''}`;
  } else if (dragsGuide) {
    const samples = allCurves[0] ? curveSamples(allCurves[0]) : [];
    if (guideAxis === 'y') {
      const xs = antecedentsOf(samples, readGuides.value);
      label = xs.length === 0
        ? `guide horizontal en y = ${formatTick(readGuides.value)}, aucun antécédent`
        : `guide horizontal en y = ${formatTick(readGuides.value)}, ${xs.length} antécédent${xs.length > 1 ? 's' : ''} : ${xs.map(formatTick).join(' et ')}`;
    } else {
      const y = imageAt(samples, readGuides.value);
      label = `guide vertical en x = ${formatTick(readGuides.value)}${y === null ? '' : `, image ${formatTick(y)}`}`;
    }
  }

  /** La valeur numérique portée par aria-valuenow, selon ce qui est piloté. */
  const ariaNow = dragsPoint ? (active?.x ?? 0)
    : dragsCursor ? cursor.x
    : dragsGuide ? readGuides.value
    : 0;
  const ariaMin = dragsGuide && guideAxis === 'y' ? range.yMin : range.xMin;
  const ariaMax = dragsGuide && guideAxis === 'y' ? range.yMax : range.xMax;

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[460px] select-none bg-white rounded-xl border-2 border-slate-200"
        style={{ width: size, touchAction: dragging.current ? 'none' : 'manipulation' }}
        {...(interactive
          ? { role: 'group', 'aria-label': ariaLabel ?? 'Repère du plan' }
          : { role: 'img', 'aria-label': ariaLabel ?? 'Repère du plan' })}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <defs>
          <marker id="cp-arrow" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#7c3aed" />
          </marker>
          <marker id="cp-arrow-ghost" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>

        {/* ── Décor : jamais de pointerEvents ── */}
        <g style={{ pointerEvents: 'none' }}>
          {gridLines}

          {/* Axes, avec flèches et noms */}
          <line x1={toSvg(range.xMin, 0).x} y1={O.y} x2={xEnd.x} y2={O.y}
            stroke="#0f172a" strokeWidth="2" markerEnd="url(#cp-arrow)" opacity="0.85" />
          <line x1={O.x} y1={toSvg(0, range.yMin).y} x2={yEnd.x} y2={yEnd.y}
            stroke="#0f172a" strokeWidth="2" markerEnd="url(#cp-arrow)" opacity="0.85" />
          {/* Les noms d'axes vivent dans la marge : posés près de la flèche,
              ils chevauchaient la pointe ET la dernière graduation (défaut vu
              en revue visuelle). */}
          <text x={xEnd.x + 14} y={O.y + 5} textAnchor="middle" fontSize="13"
            className="font-mono" fill="#475569">{axisLabels.x}</text>
          <text x={O.x} y={yEnd.y - 12} textAnchor="middle" fontSize="13"
            className="font-mono" fill="#475569">{axisLabels.y}</text>
          {/* Le « O » de l'origine est masqué quand un point de la figure occupe
              cette place : à position fixe, il finissait par se superposer à
              l'étiquette d'un point proche de l'origine (constaté avec le nom
              A' du module « la flèche vagabonde », à un point placé en
              (−1 ; −1)). La zone masquante couvre l'empreinte réelle de
              l'étiquette, en bas à gauche de l'origine. Le repère reste
              lisible sans ce « O » — les graduations portent l'information. */}
          {!points.some((p) => p.x >= -1.6 && p.x <= 0.6 && p.y >= -1.6 && p.y <= 0.6) && (
            <text x={O.x - 8} y={O.y + 16} textAnchor="end" fontSize="12"
              className="font-mono" fill="#64748b">O</text>
          )}

          {/* Graduations : un nombre sur deux quand le repère est dense */}
          {gridXs.map((x, i) => {
            if (x === 0) return null;
            const every = everyX;
            const p = toSvg(x, 0);
            return (
              <g key={`tx${x}`}>
                <line x1={p.x} y1={p.y - 4} x2={p.x} y2={p.y + 4} stroke="#0f172a" strokeWidth="1.5" />
                {i % every === 0 && (
                  <text x={p.x} y={p.y + 17} textAnchor="middle" fontSize="10"
                    className="font-mono tabular-nums" fill="#64748b">
                    {formatTick(x)}
                  </text>
                )}
              </g>
            );
          })}
          {gridYs.map((y, i) => {
            if (y === 0) return null;
            const every = everyY;
            const p = toSvg(0, y);
            return (
              <g key={`ty${y}`}>
                <line x1={p.x - 4} y1={p.y} x2={p.x + 4} y2={p.y} stroke="#0f172a" strokeWidth="1.5" />
                {i % every === 0 && (
                  <text x={p.x - 8} y={p.y + 4} textAnchor="end" fontSize="10"
                    className="font-mono tabular-nums" fill="#64748b">
                    {formatTick(y)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Bandes de variation sur l'axe des abscisses */}
          {highlightIntervals.map((iv, i) => {
            const a = toSvg(iv.from, range.yMax);
            const b = toSvg(iv.to, range.yMin);
            return (
              <rect key={`hi${i}`} x={a.x} y={a.y} width={Math.abs(b.x - a.x)} height={Math.abs(b.y - a.y)}
                fill={toneOf(iv.tone)} opacity="0.10" />
            );
          })}

          {/* Courbes et droites — déjà coupées au cadre */}
          {allCurves.map((c) => (
            c.points && c.points.length >= 2 ? (
              <polyline
                key={`c${c.id}`}
                points={c.points.map((pt) => { const sp = toSvg(pt.x, pt.y); return `${sp.x},${sp.y}`; }).join(' ')}
                fill="none"
                stroke={toneOf(c.tone)}
                strokeWidth={c.width ?? 2.5}
                strokeDasharray={c.dashed ? '6 5' : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null
          ))}

          {/* Étiquette de chaque courbe, posée à son extrémité droite */}
          {(() => {
            // Étiquettes de courbes : posées à l'extrémité droite, mais
            // ramenées DANS le cadre, et décalées verticalement quand deux
            // courbes finissent au même endroit (deux forfaits qui se suivent).
            const placed = [];
            return allCurves.map((c) => {
              if (!c.label || !c.points || c.points.length === 0) return null;
              const last = c.points[c.points.length - 1];
              const sp = toSvg(last.x, last.y);
              const w = textWidth(c.label, 12);
              const x = Math.min(Math.max(sp.x - 6, padding.left + w + 2), width - 4);
              let y = sp.y - 8;
              // Si une étiquette occupe déjà cette hauteur, on descend d'un cran.
              while (placed.some((py) => Math.abs(py - y) < 13)) y += 13;
              y = Math.min(Math.max(y, padding.top + 10), height - 6);
              placed.push(y);
              return (
                <text key={`cl${c.id}`} x={x} y={y} textAnchor="end" fontSize="12"
                  className="font-semibold" fill={toneOf(c.tone)}>{c.label}</text>
              );
            });
          })()}

          {/* L'escalier +1 → +a : le coefficient directeur SE LIT sur les marches */}
          {staircase && (() => {
            const from = staircase.from ?? { x: 0, y: 0 };
            const run = staircase.run ?? 1;
            const rise = staircase.a * run;
            const p0 = toSvg(from.x, from.y);
            const p1 = toSvg(from.x + run, from.y);
            const p2 = toSvg(from.x + run, from.y + rise);
            return (
              <g>
                <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="#059669" strokeWidth="2.5" />
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#e11d48" strokeWidth="2.5" />
                <text
                  x={(p0.x + p1.x) / 2}
                  y={Math.min(p0.y + 15, height - 4)}
                  textAnchor="middle" fontSize="11"
                  className="font-mono font-semibold" fill="#047857"
                >
                  {`+${formatTick(run)}`}
                </text>
                {(() => {
                  // L'étiquette de montée se pose à droite de la marche, SAUF
                  // près du bord droit où elle sortirait du cadre : elle bascule
                  // alors à gauche. Tout état valide reste lisible.
                  const txt = `${rise >= 0 ? '+' : ''}${formatTick(rise)}`;
                  const w = textWidth(txt, 11);
                  const flip = p1.x + 6 + w > width - 4;
                  return (
                    <text
                      x={flip ? p1.x - 6 : p1.x + 6}
                      y={(p1.y + p2.y) / 2 + 4}
                      textAnchor={flip ? 'end' : 'start'}
                      fontSize="11"
                      className="font-mono font-semibold" fill="#be123c"
                    >
                      {txt}
                    </text>
                  );
                })()}
              </g>
            );
          })()}

          {/* Ordonnée à l'origine : le point (0 ; b) */}
          {intercept && (() => {
            const sp = toSvg(0, intercept.y);
            return (
              <g>
                <circle cx={sp.x} cy={sp.y} r="6" fill="#d97706" stroke="#ffffff" strokeWidth="2" />
                {(() => {
                  const txt = intercept.label ?? `b = ${formatTick(intercept.y)}`;
                  const w = textWidth(txt, 12);
                  const flip = sp.x + 10 + w > width - 4;
                  return (
                    <text
                      x={flip ? sp.x - 10 : sp.x + 10}
                      y={Math.max(sp.y - 8, padding.top + 10)}
                      textAnchor={flip ? 'end' : 'start'}
                      fontSize="12" className="font-mono font-semibold" fill="#b45309"
                    >
                      {txt}
                    </text>
                  );
                })()}
              </g>
            );
          })()}

          {/* Sonde verticale : un x, et ce que vaut chaque courbe en ce x */}
          {cursor && (() => {
            const top = toSvg(cursor.x, range.yMax);
            const bot = toSvg(cursor.x, range.yMin);
            return (
              <g>
                <line x1={top.x} y1={top.y} x2={bot.x} y2={bot.y}
                  stroke="#d97706" strokeWidth="2.5" strokeDasharray="6 4" />
                {allCurves.map((c) => {
                  const y = imageAt(curveSamples(c), cursor.x);
                  if (y === null || y < range.yMin || y > range.yMax) return null;
                  const sp = toSvg(cursor.x, y);
                  return <circle key={`cu${c.id}`} cx={sp.x} cy={sp.y} r="6"
                    fill={toneOf(c.tone)} stroke="#ffffff" strokeWidth="2" />;
                })}
              </g>
            );
          })()}

          {/* Guides de lecture : x → UNE image ; y → TOUS les antécédents */}
          {readGuides && (() => {
            const target0 = allCurves[0];
            const samples = target0 ? curveSamples(target0) : [];
            if (readGuides.mode === 'y') {
              const left = toSvg(range.xMin, readGuides.value);
              const right = toSvg(range.xMax, readGuides.value);
              const xs = antecedentsOf(samples, readGuides.value);
              return (
                <g>
                  <line x1={left.x} y1={left.y} x2={right.x} y2={right.y}
                    stroke="#059669" strokeWidth="2.5" strokeDasharray="6 4" />
                  {xs.map((x, i) => {
                    const hit = toSvg(x, readGuides.value);
                    const foot = toSvg(x, 0);
                    return (
                      <g key={`an${i}`}>
                        <line x1={hit.x} y1={hit.y} x2={foot.x} y2={foot.y}
                          stroke="#059669" strokeWidth="2" strokeDasharray="4 3" opacity="0.75" />
                        <circle cx={hit.x} cy={hit.y} r="6" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                      </g>
                    );
                  })}
                </g>
              );
            }
            const top = toSvg(readGuides.value, range.yMax);
            const bot = toSvg(readGuides.value, range.yMin);
            const y = imageAt(samples, readGuides.value);
            return (
              <g>
                <line x1={top.x} y1={top.y} x2={bot.x} y2={bot.y}
                  stroke="#0284c7" strokeWidth="2.5" strokeDasharray="6 4" />
                {y !== null && y >= range.yMin && y <= range.yMax && (() => {
                  const hit = toSvg(readGuides.value, y);
                  const foot = toSvg(0, y);
                  return (
                    <g>
                      <line x1={hit.x} y1={hit.y} x2={foot.x} y2={foot.y}
                        stroke="#0284c7" strokeWidth="2" strokeDasharray="4 3" opacity="0.75" />
                      <circle cx={hit.x} cy={hit.y} r="6" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                    </g>
                  );
                })()}
              </g>
            );
          })()}

          {/* Polygones */}
          {polygons.map((poly) => (
            <polygon
              key={poly.id}
              points={poly.points.map((p) => { const s = toSvg(p.x, p.y); return `${s.x},${s.y}`; }).join(' ')}
              fill={poly.fill ?? '#c7d2fe'}
              fillOpacity={poly.fillOpacity ?? 0.35}
              stroke={poly.stroke ?? '#4f46e5'}
              strokeWidth={poly.strokeWidth ?? 2}
              strokeDasharray={poly.dashed ? '6 5' : undefined}
              strokeLinejoin="round"
            />
          ))}

          {/* Segments, avec étiquette de longueur si la leçon en fournit une */}
          {segments.map((s) => {
            const a = toSvg(s.from.x, s.from.y);
            const b = toSvg(s.to.x, s.to.y);
            const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
            return (
              <g key={s.id}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={s.color ?? '#0284c7'} strokeWidth={s.width ?? 2.5}
                  strokeDasharray={s.dashed ? '6 5' : undefined} strokeLinecap="round" />
                {s.label && settled && (
                  <text x={mid.x} y={mid.y - 7} textAnchor="middle" fontSize="12"
                    className="font-mono font-semibold tabular-nums" fill={s.color ?? '#0369a1'}>
                    {s.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Flèches — une leçon les utilise pour les vecteurs, une autre pour
              un déplacement : le composant ne tranche pas. */}
          {arrows.map((a) => {
            const from = toSvg(a.from.x, a.from.y);
            const to = toSvg(a.to.x, a.to.y);
            const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
            const ghosted = a.ghost === true;
            return (
              <g key={a.id}>
                <line
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={ghosted ? '#94a3b8' : (a.color ?? '#7c3aed')}
                  strokeWidth={a.width ?? 3}
                  strokeDasharray={a.dashed ? '6 5' : undefined}
                  strokeLinecap="round"
                  markerEnd={ghosted ? 'url(#cp-arrow-ghost)' : 'url(#cp-arrow)'}
                  opacity={ghosted ? 0.6 : 1}
                />
                {a.label && (
                  <text x={mid.x + 8} y={mid.y - 8} fontSize="13"
                    className="font-semibold" fill={ghosted ? '#64748b' : (a.color ?? '#6d28d9')}>
                    {a.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Guides de lecture — les deux projections d'un point */}
          {guides && (() => {
            const p = toSvg(guides.x, guides.y);
            const ax = toSvg(guides.x, 0);
            const ay = toSvg(0, guides.y);
            return (
              <g>
                <line x1={p.x} y1={p.y} x2={ax.x} y2={ax.y}
                  stroke="#0284c7" strokeWidth="2" strokeDasharray="5 4" />
                <line x1={p.x} y1={p.y} x2={ay.x} y2={ay.y}
                  stroke="#059669" strokeWidth="2" strokeDasharray="5 4" />
                <circle cx={ax.x} cy={ax.y} r="4" fill="#0284c7" />
                <circle cx={ay.x} cy={ay.y} r="4" fill="#059669" />
              </g>
            );
          })()}

          {/* Cible : pointillé ambre, la convention maison */}
          {target && (() => {
            const p = toSvg(target.x, target.y);
            return <circle cx={p.x} cy={p.y} r="12" fill="none" stroke="#f59e0b"
              strokeWidth="2.5" strokeDasharray="4 4" />;
          })()}

          {/* Fantôme : la vérité révélée, ou l'erreur montrée */}
          {ghost && (() => {
            const p = toSvg(ghost.x, ghost.y);
            return (
              <g opacity="0.6">
                <circle cx={p.x} cy={p.y} r="7" fill="#94a3b8" />
                {ghost.label && (
                  <text x={p.x + 10} y={p.y - 9} fontSize="11"
                    className="font-mono" fill="#475569">{ghost.label}</text>
                )}
              </g>
            );
          })()}

          {/* Points */}
          {points.map((p) => {
            const s = toSvg(p.x, p.y);
            const isActive = p.id === draggableId;
            return (
              <g key={p.id}>
                <circle
                  cx={s.x} cy={s.y} r={isActive ? 8 : 6}
                  fill={p.color ?? (isActive ? '#4f46e5' : '#e11d48')}
                  stroke="#ffffff" strokeWidth="2"
                />
                {p.name && (() => {
                  // Le nom d'un point suit le point, mais reste DANS le cadre :
                  // un point posé au bord droit voit son étiquette basculer.
                  const w = textWidth(p.name, 14);
                  const flip = s.x + 10 + w > width - 4;
                  return (
                    <text
                      x={flip ? s.x - 10 : s.x + 10}
                      y={Math.max(s.y - 9, padding.top + 10)}
                      textAnchor={flip ? 'end' : 'start'}
                      fontSize="14" fontWeight="700"
                      className="font-space" fill="#0f172a"
                    >
                      {p.name}
                    </text>
                  );
                })()}
              </g>
            );
          })}

          {overlay?.(toSvg, geo)}
        </g>

        {/* ── Zone tactile unique, au-dessus du décor ── */}
        {interactive && (
          <rect
            x="0" y="0" width={width} height={height}
            fill="transparent"
            role="slider"
            tabIndex={0}
            aria-label={ariaLabel ?? (dragsPoint
              ? 'Repère du plan — déplace le point'
              : dragsCursor ? 'Repère du plan — déplace le curseur'
              : 'Repère du plan — déplace le guide de lecture')}
            aria-valuetext={label}
            aria-valuemin={ariaMin}
            aria-valuemax={ariaMax}
            aria-valuenow={ariaNow}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{ outline: 'none' }}
          />
        )}
        {interactive && focused && (
          <rect x="1" y="1" width={width - 2} height={height - 2}
            fill="none" stroke="#3b82f6" strokeWidth="2" rx="8"
            style={{ pointerEvents: 'none' }} />
        )}
      </svg>

      {/* La couleur n'est jamais seule porteuse d'information. */}
      {caption && interactive && dragsPoint && active && (
        <p className="text-sm font-mono font-semibold text-slate-700 tabular-nums" aria-live="polite">
          {active.name ? `${active.name} ` : ''}{formatCoords(active)}
        </p>
      )}
      {caption && interactive && !dragsPoint && (
        <p className="text-sm font-mono font-semibold text-slate-700 tabular-nums" aria-live="polite">
          {label}
        </p>
      )}
    </div>
  );
}
