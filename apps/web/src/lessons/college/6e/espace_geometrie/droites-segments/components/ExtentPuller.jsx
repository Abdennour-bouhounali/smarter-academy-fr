import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import { clipToBox, endpointsOf, lineThrough, projectOnLine, dist } from './droitesUtils';

/**
 * ExtentPuller — l'INTERACTION SIGNATURE de la leçon.
 *
 * ACTION          l'élève tire sur le bout d'un trait (glisser, ou ← → au
 *                 clavier, ou le bouton « Prolonger »).
 * TRANSFORMATION  un SEGMENT bute sur son extrémité et refuse d'aller plus
 *                 loin ; une DROITE continue, et la vue se DÉZOOME pour
 *                 montrer qu'elle continue encore.
 * SENS MATH.      la seule différence entre ces objets est leur étendue.
 * FEEDBACK        « ça bloque » (segment) ou « ça continue » (droite/demi-
 *                 droite), énoncé en toutes lettres, pas seulement en couleur.
 * GÉNÉRALISATION  un objet géométrique se définit par où il s'arrête —
 *                 c'est-à-dire par ses extrémités.
 *
 * Recette de glisser NumberLine (playbook §10.2), la seule sanctionnée :
 * gestionnaires sur la racine <svg>, valeur issue de getBoundingClientRect()
 * ramenée au viewBox, setPointerCapture sous try/catch, accrochage à un pas
 * sémantique, et un chemin clavier complet.
 *
 * Le point tiré est PROJETÉ sur la droite support : tirer ne peut donc
 * qu'allonger, jamais faire pivoter l'objet — c'est ce qui isole l'étendue
 * comme seule variable.
 */
const STEP = 12;
const MAX_ZOOM = 3;

export default function ExtentPuller({
  obj,
  onObjChange,
  baseBox = { xMin: 0, yMin: 0, xMax: 320, yMax: 180 },
  pullable = 'b',
  onBlocked,
  onExtended,
  disabled = false,
  ariaLabel,
}) {
  const reduced = useReducedMotion();
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const [zoom, setZoom] = useState(1);
  const [status, setStatus] = useState(null); // 'blocked' | 'extended'
  const zoomedRef = useRef(false);

  // La boîte visible grandit autour de son centre quand on dézoome.
  const cx = (baseBox.xMin + baseBox.xMax) / 2;
  const cy = (baseBox.yMin + baseBox.yMax) / 2;
  const halfW = ((baseBox.xMax - baseBox.xMin) / 2) * zoom;
  const halfH = ((baseBox.yMax - baseBox.yMin) / 2) * zoom;
  const box = { xMin: cx - halfW, yMin: cy - halfH, xMax: cx + halfW, yMax: cy + halfH };

  const line = lineThrough(obj.a, obj.b);
  const clipped = clipToBox(obj, box);
  const handle = pullable === 'a' ? obj.a : obj.b;

  const pointFromClient = useCallback(
    (clientX, clientY) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return null;
      const x = box.xMin + ((clientX - rect.left) / rect.width) * (box.xMax - box.xMin);
      const y = box.yMin + ((clientY - rect.top) / rect.height) * (box.yMax - box.yMin);
      return { x, y };
    },
    [box.xMin, box.yMin, box.xMax, box.yMax]
  );

  /** Déplace le bout tiré, en le contraignant à rester sur la droite support. */
  const moveHandle = (raw) => {
    if (disabled || !raw) return;
    // Projection : tirer allonge, ne fait jamais pivoter.
    const projected = projectOnLine(line, raw);
    const fixed = pullable === 'a' ? obj.b : obj.a;
    // Accrochage au pas sémantique, le long de la droite.
    const t = Math.round(dist(fixed, projected) / STEP) * STEP;
    if (t < STEP) return; // ne jamais laisser les deux points se confondre
    const dir = {
      x: (projected.x - fixed.x) / (dist(fixed, projected) || 1),
      y: (projected.y - fixed.y) / (dist(fixed, projected) || 1),
    };
    const next = { x: fixed.x + dir.x * t, y: fixed.y + dir.y * t };
    onObjChange(pullable === 'a' ? { ...obj, a: next } : { ...obj, b: next });
  };

  // Le bout tiré est-il arrivé au bord de la vue ? Effet, jamais updater (§10.10).
  useEffect(() => {
    const atEdge =
      handle.x >= box.xMax - STEP || handle.x <= box.xMin + STEP ||
      handle.y >= box.yMax - STEP || handle.y <= box.yMin + STEP;
    if (!atEdge) return;
    if (obj.kind === 'segment') {
      setStatus('blocked');
      onBlocked?.();
      return;
    }
    if (zoom < MAX_ZOOM && !zoomedRef.current) {
      zoomedRef.current = true;
      setZoom((z) => Math.min(MAX_ZOOM, z + 1));
      setStatus('extended');
      onExtended?.();
      // Réarme après le changement d'échelle.
      const id = setTimeout(() => { zoomedRef.current = false; }, reduced ? 0 : 400);
      return () => clearTimeout(id);
    }
    setStatus('extended');
    onExtended?.();
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle.x, handle.y, obj.kind, zoom]);

  const onPointerDown = (e) => {
    if (disabled) return;
    dragging.current = true;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
    moveHandle(pointFromClient(e.clientX, e.clientY));
  };
  const onPointerMove = (e) => {
    if (disabled || !dragging.current) return;
    moveHandle(pointFromClient(e.clientX, e.clientY));
  };
  const endDrag = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
  };

  /** Allonge (ou raccourcit) d'un pas — le chemin tap/clavier. */
  const nudge = (sign) => {
    if (disabled) return;
    const fixed = pullable === 'a' ? obj.b : obj.a;
    const d = dist(fixed, handle);
    const t = Math.max(STEP, d + sign * STEP);
    const dir = { x: (handle.x - fixed.x) / (d || 1), y: (handle.y - fixed.y) / (d || 1) };
    const next = { x: fixed.x + dir.x * t, y: fixed.y + dir.y * t };
    onObjChange(pullable === 'a' ? { ...obj, a: next } : { ...obj, b: next });
  };

  const onKeyDown = (e) => {
    const map = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    nudge(map[e.key]);
  };

  const kindWord = obj.kind === 'segment' ? 'Le segment' : obj.kind === 'droite' ? 'La droite' : 'La demi-droite';

  return (
    <div className="space-y-3">
      <svg
        ref={svgRef}
        viewBox={`${box.xMin} ${box.yMin} ${box.xMax - box.xMin} ${box.yMax - box.yMin}`}
        className="w-full max-w-[520px] mx-auto select-none bg-white rounded-xl border-2 border-slate-200"
        style={{
          touchAction: 'none',
          transition: reduced ? 'none' : 'all 300ms ease-out',
        }}
        role="group"
        aria-label={ariaLabel ?? `${kindWord} — tire sur son bout pour voir jusqu’où il va`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* Décor : jamais de pointerEvents au-dessus de la zone tactile. */}
        <g style={{ pointerEvents: 'none' }}>
          {clipped && (
            <>
              <line
                x1={clipped.from.x} y1={clipped.from.y} x2={clipped.to.x} y2={clipped.to.y}
                stroke="#4f46e5" strokeWidth={3 * zoom} strokeLinecap="round"
              />
              {/* Bouts ouverts : pointillé de « ça continue » au-delà du bord */}
              {(clipped.openFrom || clipped.openTo) && (
                <text
                  x={cx} y={box.yMin + 20 * zoom} textAnchor="middle"
                  className="font-mono" fontSize={11 * zoom} fill="#64748b"
                >
                  … ça continue …
                </text>
              )}
            </>
          )}

          {/* Extrémités réelles, dérivées du kind */}
          {endpointsOf(obj).map((p, i) => (
            <circle key={`ep${i}`} cx={p.x} cy={p.y} r={6 * zoom} fill="#4f46e5" stroke="#fff" strokeWidth={2 * zoom} />
          ))}

          {/* Le bout tiré : anneau ambré, la convention « cible » maison */}
          <circle
            cx={handle.x} cy={handle.y} r={11 * zoom}
            fill="none" stroke="#f59e0b" strokeWidth={2.5 * zoom} strokeDasharray={`${4 * zoom} ${4 * zoom}`}
          />
        </g>

        {/* Poignée tactile : large, transparente, focusable */}
        <circle
          cx={handle.x} cy={handle.y} r={22 * zoom}
          fill="transparent"
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label="Bout à tirer"
          aria-valuetext={`longueur ${Math.round(dist(obj.a, obj.b))}`}
          aria-valuenow={Math.round(dist(obj.a, obj.b))}
          aria-valuemin={STEP}
          aria-valuemax={9999}
          onKeyDown={onKeyDown}
          style={{ cursor: disabled ? 'default' : 'grab', outline: 'none' }}
        />
      </svg>

      {/* Chemin tap : indispensable, le glisser n'est jamais obligatoire */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          type="button" onClick={() => nudge(-1)} disabled={disabled}
          className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white font-mono font-bold text-sm text-slate-700 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          − Raccourcir
        </button>
        <button
          type="button" onClick={() => nudge(1)} disabled={disabled}
          className="min-h-[44px] px-4 rounded-xl border-2 border-indigo-600 bg-indigo-600 font-mono font-bold text-sm text-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Prolonger +
        </button>
      </div>

      {/* Conséquence en toutes lettres — la couleur n'est jamais seule */}
      {status && (
        <p
          className={`text-center text-sm font-semibold ${status === 'blocked' ? 'text-rose-700' : 'text-emerald-700'}`}
          aria-live="polite"
        >
          {status === 'blocked'
            ? '⛔ Ça bloque : le segment s’arrête à son extrémité, il ne va pas plus loin.'
            : '➡️ Ça continue : on a beau reculer la vue, le trait n’a pas de bout de ce côté.'}
        </p>
      )}
    </div>
  );
}
