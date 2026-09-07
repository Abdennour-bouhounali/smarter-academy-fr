import React, { useRef, useState, useCallback } from 'react';
import {
  relationOf, RELATIONS, distanceTo, footOf, pointOn, toLine, dirOf,
} from './relationsUtils';
import { paramOf, projectOnLine, clipToBox } from '../../../../../common/utils/geometry2d';

/**
 * EcartGauge — promener un point sur d₁ et mesurer l'écart à d₂.
 *
 * ACTION          l'élève fait glisser le point P le long de la droite d₁
 *                 (ou le déplace aux flèches), et « tamponne » des mesures.
 * TRANSFORMATION  un connecteur PERPENDICULAIRE relie toujours P à d₂, et sa
 *                 longueur s'affiche.
 * SENS MATH.      l'écart entre deux parallèles ne dépend pas de l'endroit
 *                 où on le mesure — c'est ce qui les caractérise.
 * FEEDBACK        les mesures tamponnées s'empilent : toutes identiques si
 *                 parallèles, toutes différentes sinon.
 * GÉNÉRALISATION  « parallèles » = « toujours à la même distance ».
 *
 * Le connecteur est TOUJOURS `footOf` : jamais le trait « droit devant »
 * qu'un élève tracerait spontanément. C'est la définition qui dessine.
 */
export default function EcartGauge({
  d1,
  d2,
  t,
  onTChange,
  stamps = [],
  onStamp,
  box = { xMin: 0, yMin: 0, xMax: 320, yMax: 200 },
  disabled = false,
  ariaLabel,
}) {
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const [settled, setSettled] = useState(true);

  /* Bornes du paramètre t : les extrémités du morceau de d₁ RÉELLEMENT
     visible dans le cadre, avec une marge pour que le point P (r = 7) et son
     étiquette restent entièrement dedans. Sans ces bornes, le chemin clavier
     (±12 par flèche, illimité) pousse P — et son nom — hors du cadre :
     §6bis.4 exige qu'aucun état atteignable n'ait de mise en page invalide.
     Le chemin pointeur, lui, est déjà borné par le rectangle du SVG. */
  const T_MARGIN = 16;
  const tRange = (() => {
    const line = toLine(d1);
    const dir = dirOf(d1.angleDeg);
    const seg = clipToBox(
      { kind: 'droite', a: d1.p, b: { x: d1.p.x + dir.x * 50, y: d1.p.y + dir.y * 50 } },
      box
    );
    if (!seg) return null;
    const tA = paramOf(line, seg.from);
    const tB = paramOf(line, seg.to);
    const lo = Math.min(tA, tB) + T_MARGIN;
    const hi = Math.max(tA, tB) - T_MARGIN;
    return hi > lo ? { lo, hi } : null;
  })();
  const clampT = (v) => (tRange ? Math.max(tRange.lo, Math.min(tRange.hi, v)) : v);

  const P = pointOn(d1, clampT(t));
  const gap = distanceTo(d2, P);
  const relation = relationOf(d1, d2);

  const tFromClient = useCallback(
    (clientX, clientY) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return null;
      const x = box.xMin + ((clientX - rect.left) / rect.width) * (box.xMax - box.xMin);
      const y = box.yMin + ((clientY - rect.top) / rect.height) * (box.yMax - box.yMin);
      // Projection sur d₁ : le point ne peut QUE glisser le long de la droite.
      const line = toLine(d1);
      return clampT(paramOf(line, projectOnLine(line, { x, y })));
    },
    [box.xMin, box.yMin, box.xMax, box.yMax, d1]
  );

  const onPointerDown = (e) => {
    if (disabled) return;
    dragging.current = true;
    setSettled(false);
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
    const nt = tFromClient(e.clientX, e.clientY);
    if (nt !== null) onTChange(nt);
  };
  const onPointerMove = (e) => {
    if (disabled || !dragging.current) return;
    const nt = tFromClient(e.clientX, e.clientY);
    if (nt !== null) onTChange(nt);
  };
  const endDrag = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    setSettled(true); // settle-then-number : le nombre se fige au relâchement
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
  };

  const onKeyDown = (e) => {
    const map = { ArrowRight: 12, ArrowLeft: -12, ArrowUp: 12, ArrowDown: -12 };
    if (!(e.key in map)) return;
    e.preventDefault();
    setSettled(true);
    onTChange(clampT(t + map[e.key]));
  };

  const allSame = stamps.length > 1 && stamps.every((s) => Math.abs(s - stamps[0]) < 1);

  return (
    <div className="space-y-3">
      <svg
        ref={svgRef}
        viewBox={`${box.xMin} ${box.yMin} ${box.xMax - box.xMin} ${box.yMax - box.yMin}`}
        className="w-full max-w-[520px] mx-auto select-none"
        style={{ touchAction: 'none' }}
        role="group"
        aria-label={ariaLabel ?? 'Fais glisser le point le long de la première droite'}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <g style={{ pointerEvents: 'none' }}>
          <RelationFigureInline d1={d1} d2={d2} P={P} box={box} />
        </g>

        <circle
          cx={P.x} cy={P.y} r="20" fill="transparent"
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label="Point P sur la première droite"
          aria-valuenow={Math.round(gap)}
          aria-valuemin={0}
          aria-valuemax={999}
          aria-valuetext={`écart de ${Math.round(gap)} jusqu’à la deuxième droite`}
          onKeyDown={onKeyDown}
          style={{ cursor: disabled ? 'default' : 'grab', outline: 'none' }}
        />
      </svg>

      <div className="flex items-center justify-center gap-2 flex-wrap">
        <div className="rounded-xl border-2 border-sky-300 bg-sky-50 px-4 py-2 text-center">
          <div className="text-xs font-mono uppercase tracking-wide text-sky-600">Écart mesuré</div>
          <div className="font-mono font-extrabold text-lg text-sky-900 tabular-nums" aria-live="polite">
            {settled ? Math.round(gap) : '…'}
          </div>
        </div>
        {onStamp && (
          <button
            type="button"
            onClick={() => onStamp(gap)}
            disabled={disabled}
            className="min-h-[44px] px-4 rounded-xl border-2 border-sky-600 bg-sky-600 text-white font-bold text-sm disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Noter cette mesure
          </button>
        )}
      </div>

      {stamps.length > 0 && (
        <div className="rounded-xl border-2 border-slate-200 bg-white p-3 space-y-2">
          <p className="text-xs font-mono uppercase tracking-wide text-slate-500">
            Mesures notées ({stamps.length})
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {stamps.map((s, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-mono text-xs font-bold text-slate-700 tabular-nums"
              >
                {Math.round(s)}
              </span>
            ))}
          </div>
          {stamps.length > 1 && (
            <p className={`text-sm font-semibold ${allSame ? 'text-emerald-700' : 'text-amber-700'}`}>
              {allSame
                ? '✓ Toutes identiques : l’écart ne change jamais.'
                : '⚠️ Les mesures diffèrent : l’écart change selon l’endroit.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Dessin interne — des ÉLÉMENTS SVG, jamais un <svg> imbriqué (un <svg>
 * dans un <svg> ne se rend pas correctement). On ne peut donc pas réutiliser
 * RelationFigure ici : on redessine les deux droites à partir du même
 * modèle, via clipToBox — la géométrie reste dérivée de l'état, pas copiée.
 */
/** Hauteur réelle d'une étiquette à fontSize 13 (getBBox mesure 16,6 unités
 *  pour « e₁ », indice compris) plus une marge de sécurité : sous cet écart
 *  vertical, deux noms de droites se chevauchent. Mesuré, pas supposé. */
const LABEL_H = 20;

function RelationFigureInline({ d1, d2, P, box }) {
  const foot = footOf(d2, P);

  const segOf = (line) => {
    const dir = dirOf(line.angleDeg);
    return clipToBox(
      { kind: 'droite', a: line.p, b: { x: line.p.x + dir.x * 50, y: line.p.y + dir.y * 50 } },
      box
    );
  };

  // Les deux étiquettes sont placées ENSEMBLE, jamais chacune dans son coin :
  // deux droites SÉCANTES sortent du cadre très près l'une de l'autre (les
  // paires e₁/e₂ de la leçon sortent à 5 unités d'écart), et deux noms posés
  // indépendamment se chevauchent alors. On les écarte symétriquement, en
  // restant dans le cadre — §6bis.4 : toute position atteignable du geste
  // doit avoir une mise en page valide, pas seulement la position par défaut.
  const s1 = segOf(d1);
  const s2 = segOf(d2);
  const labelY = (() => {
    if (!s1 || !s2) return [s1 ? s1.to.y - 8 : 0, s2 ? s2.to.y - 8 : 0];
    let y1 = s1.to.y - 8;
    let y2 = s2.to.y - 8;
    const gap = y2 - y1;
    if (Math.abs(gap) < LABEL_H) {
      const push = (LABEL_H - Math.abs(gap)) / 2;
      const sign = gap >= 0 ? 1 : -1;
      y1 -= sign * push;
      y2 += sign * push;
    }
    // On garde les deux noms à l'intérieur du cadre.
    const clampY = (y) => Math.max(box.yMin + LABEL_H, Math.min(box.yMax - 4, y));
    return [clampY(y1), clampY(y2)];
  })();

  const trace = (line, color, key, seg, yLabel) => {
    if (!seg) return null;
    return (
      <g key={key}>
        <line
          x1={seg.from.x} y1={seg.from.y} x2={seg.to.x} y2={seg.to.y}
          stroke={color} strokeWidth="3" strokeLinecap="round"
        />
        {line.name && (
          <text x={seg.to.x - 14} y={yLabel} className="font-space" fontSize="13" fontWeight="700" fill={color}>
            {line.name}
          </text>
        )}
      </g>
    );
  };

  return (
    <>
      {trace(d1, '#4f46e5', 'd1', s1, labelY[0])}
      {trace(d2, '#0891b2', 'd2', s2, labelY[1])}
      {/* Le connecteur, TOUJOURS perpendiculaire à d₂ : c'est la définition
          de la distance qui dessine, jamais un trait « droit devant ». */}
      <line x1={P.x} y1={P.y} x2={foot.x} y2={foot.y} stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="5 4" />
      <circle cx={foot.x} cy={foot.y} r="4" fill="#f59e0b" />
      <circle cx={P.x} cy={P.y} r="7" fill="#f59e0b" stroke="#fff" strokeWidth="2.5" />
      {/* L'étiquette « P » bascule du côté INTÉRIEUR quand le point approche
          d'un bord : posée systématiquement à droite, elle sortait du cadre
          dès que l'élève poussait P jusqu'au bout de la course (§6bis.4 —
          balayer le geste, ne pas l'échantillonner). Idem en haut. */}
      <text
        x={P.x + (P.x > box.xMax - 24 ? -10 : 10)}
        y={P.y + (P.y < box.yMin + 22 ? 20 : -9)}
        textAnchor={P.x > box.xMax - 24 ? 'end' : 'start'}
        className="font-space" fontSize="13" fontWeight="700" fill="#0f172a"
      >
        P
      </text>
    </>
  );
}
