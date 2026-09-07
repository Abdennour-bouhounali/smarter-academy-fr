import React, { useRef, useState, useCallback } from 'react';

/**
 * AtelierConstruction — la feuille sur laquelle l'élève EXÉCUTE un programme
 * de construction, étape par étape, avec l'instrument de chaque étape.
 *
 * ACTION          l'élève place un point, ou tire une extrémité, selon ce
 *                 que l'étape courante demande ; l'instrument affiché change
 *                 avec elle.
 * TRANSFORMATION  la figure se construit sous ses doigts : chaque étape
 *                 validée laisse son tracé, et l'étape suivante s'appuie
 *                 dessus.
 * SENS MATH.      un programme n'est pas une liste à trier : c'est une suite
 *                 d'actions dont chacune a besoin du résultat des
 *                 précédentes. On ne peut pas placer D sur une
 *                 perpendiculaire qui n'existe pas encore.
 * FEEDBACK        l'étape reste ouverte tant que la contrainte n'est pas
 *                 satisfaite, et dit CE QUI manque (trop court, pas sur la
 *                 perpendiculaire…).
 * GÉNÉRALISATION  la dépendance entre étapes se vit au lieu de se trier.
 *
 * ── LE MODÈLE ────────────────────────────────────────────────────────
 * L'état est une table de POINTS nommés (`{A: {x,y}, B: …}`). Tout le reste
 * — segments tracés, perpendiculaire, parallèle, verdict — en est dérivé.
 * Une étape est un objet `{ id, texte, instrument, place, check, hint }` :
 *   `place`  le nom du point que l'élève pose à cette étape
 *   `check`  (points) => ({ ok, message }) — la contrainte à satisfaire
 *   `guide`  (points) => éléments SVG d'aide (la perpendiculaire en cours…)
 * La leçon fournit ces étapes ; l'atelier ne connaît aucune figure
 * particulière.
 *
 * ── SÉCURITÉ VISUELLE (§6bis.4) ──────────────────────────────────────
 * Les points sont bornés à une marge intérieure de 18 unités, et leurs
 * étiquettes sont posées du côté opposé au centre de la figure, donc jamais
 * par-dessus un trait. Les mesures et les verdicts vivent dans le DOM.
 * Aucun texte SVG en dehors des noms de points (une lettre).
 *
 * RÈGLE PROJET : pas de `disabled`. Même terminée, la figure reste
 * manipulable — l'élève peut tirer un point et voir la contrainte se briser.
 */

const W = 320;
const H = 220;
const MARGE = 18;

export default function AtelierConstruction({
  /** Les points déjà posés, table nom → {x, y}. */
  points,
  onPointsChange,
  /** Les étapes du programme, dans l'ordre. */
  etapes,
  /** Index de l'étape courante. */
  index,
  /** Segments à peindre : [['A','B'], …] parmi les points existants. */
  segments = [],
  ariaLabel,
}) {
  const svgRef = useRef(null);
  const held = useRef(null);
  const [holding, setHolding] = useState(null);

  const etape = etapes[index] ?? null;

  const posFromClient = useCallback((clientX, clientY) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return null;
    return {
      x: ((clientX - rect.left) / rect.width) * W,
      y: ((clientY - rect.top) / rect.height) * H,
    };
  }, []);

  const clamp = (p) => ({
    x: Math.max(MARGE, Math.min(W - MARGE, p.x)),
    y: Math.max(MARGE, Math.min(H - MARGE, p.y)),
  });

  /* Un point n'est déplaçable que s'il a été posé par l'élève. L'étape
     courante peut en outre CONTRAINDRE le déplacement (le point D coulisse
     sur la perpendiculaire) : `snap` est fourni par l'étape elle-même, ce
     qui rend la contrainte géométrique — pas décorative. */
  const move = (name, p) => {
    if (!p) return;
    const st = etapes.find((e) => e.place === name);
    const snapped = st?.snap ? st.snap(clamp(p), points) : clamp(p);
    onPointsChange({ ...points, [name]: clamp(snapped) });
  };

  const begin = (name) => (e) => {
    e.stopPropagation();
    held.current = name;
    setHolding(name);
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
    move(name, posFromClient(e.clientX, e.clientY));
  };
  const onMove = (e) => {
    if (!held.current) return;
    move(held.current, posFromClient(e.clientX, e.clientY));
  };
  const end = (e) => {
    if (!held.current) return;
    held.current = null;
    setHolding(null);
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
  };

  /* Poser le point de l'étape courante : un appui n'importe où sur la
     feuille suffit tant qu'il n'existe pas encore. */
  const onSheetDown = (e) => {
    if (!etape?.place || points[etape.place]) return;
    const p = posFromClient(e.clientX, e.clientY);
    if (!p) return;
    held.current = etape.place;
    setHolding(etape.place);
    move(etape.place, p);
  };

  const keyFor = (name) => (e) => {
    const m = {
      ArrowRight: { x: 5, y: 0 }, ArrowLeft: { x: -5, y: 0 },
      ArrowUp: { x: 0, y: -5 }, ArrowDown: { x: 0, y: 5 },
    }[e.key];
    if (!m) return;
    e.preventDefault();
    const cur = points[name];
    if (!cur) return;
    move(name, { x: cur.x + m.x, y: cur.y + m.y });
  };

  /* Le centre des points posés, pour déporter les étiquettes vers
     l'extérieur : c'est ce qui garantit qu'un nom ne tombe jamais sur un
     trait, quelle que soit la figure construite. */
  const noms = Object.keys(points);
  const centre = noms.length
    ? {
      x: noms.reduce((s, n) => s + points[n].x, 0) / noms.length,
      y: noms.reduce((s, n) => s + points[n].y, 0) / noms.length,
    }
    : { x: W / 2, y: H / 2 };

  const labelPos = (p) => {
    const dx = p.x - centre.x;
    const dy = p.y - centre.y;
    const n = Math.hypot(dx, dy) || 1;
    const lx = p.x + (dx / n) * 15;
    const ly = p.y + (dy / n) * 15;
    // Bornage : une étiquette ne sort jamais du cadre, même pour un point
    // posé contre un bord.
    return { x: Math.max(10, Math.min(W - 10, lx)), y: Math.max(14, Math.min(H - 6, ly)) };
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full max-w-[500px] mx-auto select-none bg-white rounded-xl border-2 border-slate-200"
      style={{ touchAction: 'none' }}
      role="group"
      aria-label={ariaLabel ?? 'Feuille de construction'}
      onPointerDown={onSheetDown}
      onPointerMove={onMove}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <g style={{ pointerEvents: 'none' }}>
        {/* Papier quadrillé léger : un repère visuel, sans valeur numérique */}
        <defs>
          <pattern id="ac-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#ac-grid)" />

        {/* L'aide géométrique de l'étape courante (perpendiculaire en
            pointillé, cercle du compas…) — fournie par l'étape elle-même. */}
        {etape?.guide?.(points)}

        {/* Les segments déjà tracés */}
        {segments.map(([a, b], i) => {
          const pa = points[a];
          const pb = points[b];
          if (!pa || !pb) return null;
          return (
            <line
              key={i}
              x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
              stroke="#4f46e5" strokeWidth="3.5" strokeLinecap="round"
            />
          );
        })}

        {/* Les points posés */}
        {noms.map((n) => {
          const p = points[n];
          const l = labelPos(p);
          return (
            <g key={n}>
              <circle
                cx={p.x} cy={p.y} r={holding === n ? 7.5 : 6}
                fill="#4f46e5" stroke="#fff" strokeWidth="2.5"
              />
              <text
                x={l.x} y={l.y} textAnchor="middle"
                className="font-space" fontSize="13" fontWeight="700" fill="#0f172a"
              >
                {n}
              </text>
            </g>
          );
        })}
      </g>

      {/* Poignées : r=15 sur 320 unités rendues sur ~500 px ⇒ ≈47 px */}
      {noms.map((n) => (
        <circle
          key={`h${n}`}
          cx={points[n].x} cy={points[n].y} r="15" fill="transparent"
          onPointerDown={begin(n)}
          onKeyDown={keyFor(n)}
          role="slider"
          tabIndex={0}
          aria-label={`Point ${n}`}
          aria-valuemin={0}
          aria-valuemax={W}
          aria-valuenow={Math.round(points[n].x)}
          aria-valuetext={`point ${n} en x ${Math.round(points[n].x)}, y ${Math.round(points[n].y)}`}
          style={{ cursor: holding === n ? 'grabbing' : 'grab', outline: 'none' }}
        />
      ))}
    </svg>
  );
}
