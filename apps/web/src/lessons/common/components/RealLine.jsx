import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatDec } from '@smarter-academy/core';
import {
  lineGeometry, placeLabels, estimateTextWidth, snapValue, clampCenter, ARROW, DEFAULT_W,
} from './realLineLayout';

/**
 * RealLine — la droite réelle bidirectionnelle (2nde), sans état.
 *
 * Complète `NumberLine` (demi-droite 6e, un seul curseur) : deux flèches,
 * des nombres négatifs, plusieurs POINTS nommés, des INTERVALLES à crochets
 * ouverts/fermés (bornes infinies comprises), plusieurs CURSEURS déplaçables
 * (tactile, souris, clavier) et une lecture au toucher (`onPick`).
 *
 * RÈGLES D'INGÉNIERIE (playbook §10) :
 *  - gestes écoutés sur le <svg> racine (les enfants peints avalent le
 *    pointerdown), valeur = ratio getBoundingClientRect → viewBox, snap au
 *    pas sémantique, setPointerCapture protégé, clavier sur chaque curseur ;
 *  - tout le décor porte pointerEvents:'none' ;
 *  - role="group" dès qu'il y a une interaction, role="img" sinon ;
 *  - SÉCURITÉ DE MISE EN PAGE (§17bis) : le viewBox est en PIXELS CSS et fait
 *    exactement la largeur du conteneur (ResizeObserver) — une police de
 *    13 px est vraiment lisible sur un téléphone ; les graduations sont
 *    étiquetées une sur k pour ne jamais se toucher ; les étiquettes de
 *    points / bornes / curseurs sont réparties sur des rangées sans
 *    chevauchement (realLineLayout.placeLabels) et serrées dans le cadre ;
 *    la hauteur du viewBox est dérivée du nombre de rangées.
 *
 * Tout est dérivé des props : le module possède l'état (valeurs des
 * curseurs, bornes des intervalles) et RealLine ne fait que le dessiner.
 *
 * @param {number} min, max, step          graduations
 * @param {number} [snap=step]             pas des curseurs et de onPick
 * @param {number} [labelEvery]            auto : bornée par la largeur
 * @param {(n)=>string} [format=formatDec]
 * @param {{id, value, label?, tone?, open?}[]} [points]
 *        open = point creux (borne exclue) ; tone ∈ TONES
 * @param {{id, from, to, openFrom?, openTo?, tone?, label?}[]} [intervals]
 *        from/to peuvent valoir ±Infinity (pas de crochet, la bande file
 *        jusqu'à la flèche)
 * @param {{id, value, onChange, label?, tone?, ariaLabel?, min?, max?}[]} [handles]
 * @param {(value:number)=>void} [onPick]  toucher l'axe hors curseur
 * @param {boolean} [disabled]
 * @param {string} [ariaLabel]
 * @param {boolean} [tickLabels=true]
 * @param {boolean} [inline=false]        conteneur <span> (valide dans un <p>)
 */
export const TONES = {
  emerald: '#059669',
  rose: '#e11d48',
  indigo: '#4f46e5',
  amber: '#d97706',
  sky: '#0284c7',
  slate: '#475569',
  violet: '#7c3aed',
};
const FONT = "'JetBrains Mono', monospace";
const TICK_FS = 13;
const LABEL_FS = 13;
const ROW_H = 26;
const BADGE_W = 52;
const BADGE_H = 22;
const GRAB_RADIUS = 40; // px : distance max pour saisir un curseur

const toneOf = (t) => TONES[t] ?? TONES.indigo;

function useContainerWidth(ref) {
  const [w, setW] = useState(DEFAULT_W);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const read = () => {
      const width = Math.round(el.getBoundingClientRect().width);
      if (width > 0) setW(width);
    };
    read();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

export default function RealLine({
  min,
  max,
  step,
  snap,
  labelEvery,
  format = formatDec,
  points = [],
  intervals = [],
  handles = [],
  onPick,
  disabled = false,
  ariaLabel = 'Droite graduée',
  tickLabels = true,
  inline = false,
}) {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const grabbed = useRef(null);
  const W = useContainerWidth(wrapRef);
  const snapStep = snap ?? step;
  const interactive = !disabled && (handles.length > 0 || !!onPick);

  const geo = useMemo(
    () => lineGeometry({ min, max, step, labelEvery, format, fontSize: TICK_FS, W }),
    [min, max, step, labelEvery, format, W]
  );
  const { ticks, toX, fromX, padL, padR } = geo;
  const xLeft = padL - ARROW;
  const xRight = W - padR + ARROW;

  /* ── Étiquettes au-dessus de l'axe : points, bornes, curseurs ─────── */
  const labelItems = [];
  for (const p of points) {
    if (p.label === undefined || p.label === null) continue;
    labelItems.push({ id: `pt-${p.id}`, kind: 'point', x: toX(p.value), width: estimateTextWidth(p.label, LABEL_FS) + 6, ref: p });
  }
  for (const it of intervals) {
    if (!it.label) continue;
    const a = Number.isFinite(it.from) ? toX(it.from) : xLeft;
    const b = Number.isFinite(it.to) ? toX(it.to) : xRight;
    labelItems.push({ id: `iv-${it.id}`, kind: 'interval', x: (a + b) / 2, width: estimateTextWidth(it.label, LABEL_FS) + 6, ref: it });
  }
  for (const h of handles) {
    const text = h.label !== undefined ? h.label : format(h.value);
    labelItems.push({ id: `hd-${h.id}`, kind: 'handle', x: toX(h.value), width: Math.max(BADGE_W, estimateTextWidth(text, LABEL_FS) + 14), text, ref: h });
  }
  const placed = placeLabels(labelItems, { W });
  const rowsAbove = placed.reduce((m, p) => Math.max(m, p.row + 1), 0);
  const axisY = 6 + 20 + rowsAbove * ROW_H + (rowsAbove === 0 ? 0 : 4);
  const H = axisY + (tickLabels ? 34 : 18);
  const rowBottom = (r) => axisY - 22 - r * ROW_H; // bord bas de la boîte de la rangée r

  /* ── Gestes ───────────────────────────────────────────────────────── */
  const valueAt = useCallback(
    (clientX) => {
      const rect = svgRef.current.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * W;
      return { x, value: fromX(x) };
    },
    [fromX, W]
  );

  const moveHandle = (h, raw) => {
    const v = snapValue(raw, { min: h.min ?? min, max: h.max ?? max, snap: snapStep });
    if (v !== h.value) h.onChange?.(v);
  };

  const handlePointerDown = (e) => {
    if (!interactive) return;
    const { x, value } = valueAt(e.clientX);
    let best = null;
    let bestD = Infinity;
    for (const h of handles) {
      const d = Math.abs(toX(h.value) - x);
      if (d < bestD) { bestD = d; best = h; }
    }
    if (best && (handles.length === 1 || bestD <= GRAB_RADIUS)) {
      grabbed.current = best.id;
      try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
      moveHandle(best, value);
      return;
    }
    if (onPick) onPick(snapValue(value, { min, max, snap: snapStep }));
  };

  const handlePointerMove = (e) => {
    if (!interactive || grabbed.current === null) return;
    const h = handles.find((k) => k.id === grabbed.current);
    if (!h) return;
    moveHandle(h, valueAt(e.clientX).value);
  };

  const endDrag = (e) => {
    grabbed.current = null;
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
  };

  const keyFor = (h) => (e) => {
    if (disabled) return;
    const lo = h.min ?? min;
    const hi = h.max ?? max;
    let next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = h.value + snapStep;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = h.value - snapStep;
    else if (e.key === 'PageUp') next = h.value + snapStep * 10;
    else if (e.key === 'PageDown') next = h.value - snapStep * 10;
    else if (e.key === 'Home') next = lo;
    else if (e.key === 'End') next = hi;
    if (next !== null) {
      e.preventDefault();
      moveHandle(h, next);
    }
  };

  /* ── Rendu ────────────────────────────────────────────────────────── */
  const bracket = (x, closed, side, color) => {
    // fermé → les petites barres pointent VERS la bande ; ouvert → vers l'extérieur.
    const dir = (side === 'from') === closed ? 1 : -1;
    const t = 7;
    return (
      <path
        d={`M ${x + dir * t} ${axisY - 13} L ${x} ${axisY - 13} L ${x} ${axisY + 13} L ${x + dir * t} ${axisY + 13}`}
        fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
      />
    );
  };

  const Wrap = inline ? 'span' : 'div';

  return (
    <Wrap ref={wrapRef} className="block w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        className="block w-full h-auto select-none"
        role={interactive ? 'group' : 'img'}
        aria-label={ariaLabel}
        style={{ touchAction: handles.length > 0 && !disabled ? 'none' : 'manipulation' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {interactive && <rect x="0" y="0" width={W} height={H} fill="transparent" className={handles.length ? 'cursor-grab' : 'cursor-pointer'} />}

        <g style={{ pointerEvents: 'none' }}>
          {/* bandes des intervalles */}
          {intervals.map((it) => {
            const color = toneOf(it.tone);
            const finiteA = Number.isFinite(it.from);
            const finiteB = Number.isFinite(it.to);
            const a = finiteA ? toX(it.from) : xLeft + 2;
            const b = finiteB ? toX(it.to) : xRight - 2;
            if (b < a) return null;
            return (
              <g key={it.id}>
                <rect x={a} y={axisY - 7} width={Math.max(0, b - a)} height="14" fill={color} opacity="0.22" />
                <line x1={a} y1={axisY} x2={b} y2={axisY} stroke={color} strokeWidth="4" />
                {finiteA && bracket(a, !it.openFrom, 'from', color)}
                {finiteB && bracket(b, !it.openTo, 'to', color)}
              </g>
            );
          })}

          {/* axe et deux flèches */}
          <line x1={xLeft} y1={axisY} x2={xRight} y2={axisY} stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points={`${xRight + 1},${axisY} ${xRight - 9},${axisY - 5} ${xRight - 9},${axisY + 5}`} fill="#334155" />
          <polygon points={`${xLeft - 1},${axisY} ${xLeft + 9},${axisY - 5} ${xLeft + 9},${axisY + 5}`} fill="#334155" />

          {/* graduations */}
          {ticks.map((v, i) => {
            const x = toX(v);
            const labelled = i % geo.labelEvery === 0;
            const zero = v === 0;
            return (
              <g key={v}>
                <line x1={x} y1={axisY - (labelled ? 8 : 4)} x2={x} y2={axisY + (labelled ? 8 : 4)} stroke={zero ? '#0f172a' : '#64748b'} strokeWidth={zero ? 2.5 : labelled ? 2 : 1.25} />
                {tickLabels && labelled && (
                  <text x={x} y={axisY + 24} textAnchor="middle" fontSize={TICK_FS} fontWeight={zero ? 800 : 600} fill={zero ? '#0f172a' : '#475569'} fontFamily={FONT}>
                    {format(v)}
                  </text>
                )}
              </g>
            );
          })}

          {/* points */}
          {points.map((p) => {
            const x = toX(p.value);
            const color = toneOf(p.tone);
            return (
              <circle key={p.id} cx={x} cy={axisY} r="6" fill={p.open ? '#fff' : color} stroke={color} strokeWidth="2.5" />
            );
          })}

          {/* étiquettes réparties en rangées */}
          {placed.map((it) => {
            const bottom = rowBottom(it.row);
            if (it.kind === 'handle') {
              const h = it.ref;
              const color = toneOf(h.tone);
              const hx = toX(h.value);
              const bw = it.width;
              return (
                <g key={it.id}>
                  {it.row > 0 && <line x1={hx} y1={axisY - 16} x2={hx} y2={bottom} stroke={color} strokeWidth="1.5" strokeDasharray="3 3" />}
                  <polygon points={`${hx},${axisY - 2} ${hx - 8},${axisY - 17} ${hx + 8},${axisY - 17}`} fill={color} stroke="#fff" strokeWidth="1.5" />
                  <rect x={it.x - bw / 2} y={bottom - BADGE_H} width={bw} height={BADGE_H} rx="6" fill={color} />
                  <text x={it.x} y={bottom - 6.5} textAnchor="middle" fontSize={LABEL_FS} fontWeight="800" fill="#fff" fontFamily={FONT}>
                    {it.text}
                  </text>
                </g>
              );
            }
            const color = toneOf(it.ref.tone);
            const anchorX = it.kind === 'point' ? toX(it.ref.value) : it.x;
            return (
              <g key={it.id}>
                {it.kind === 'point' && it.row > 0 && (
                  <line x1={anchorX} y1={axisY - 9} x2={anchorX} y2={bottom + 1} stroke={color} strokeWidth="1.5" strokeDasharray="3 3" />
                )}
                <text x={it.x} y={bottom - 5} textAnchor="middle" fontSize={LABEL_FS} fontWeight="800" fill={color} fontFamily={FONT}>
                  {it.ref.label}
                </text>
              </g>
            );
          })}
        </g>

        {/* curseurs accessibles : zones focusables (invisibles) sur chaque pointeur */}
        {handles.map((h) => {
          const hx = toX(h.value);
          return (
            <g
              key={`k-${h.id}`}
              role="slider"
              tabIndex={disabled ? -1 : 0}
              aria-label={h.ariaLabel ?? `Curseur ${h.label ?? ''}`.trim()}
              aria-valuemin={h.min ?? min}
              aria-valuemax={h.max ?? max}
              aria-valuenow={h.value}
              aria-valuetext={format(h.value)}
              onKeyDown={keyFor(h)}
              className="focus:outline-none"
            >
              <rect x={clampCenter(hx, 14, W) - 14} y={axisY - 19} width="28" height="24" fill="transparent" stroke="transparent" className="focus-visible:stroke-blue-500" strokeWidth="2" rx="5" />
            </g>
          );
        })}
      </svg>
    </Wrap>
  );
}

/** Étiquette d'intervalle prête pour RealLine : « [−2 ; 3[ ». */
export function intervalNotation(from, to, openFrom, openTo, format = formatDec) {
  const l = Number.isFinite(from) ? (openFrom ? ']' : '[') : ']';
  const r = Number.isFinite(to) ? (openTo ? '[' : ']') : '[';
  const a = Number.isFinite(from) ? format(from) : '−∞';
  const b = Number.isFinite(to) ? format(to) : '+∞';
  return `${l}${a} ; ${b}${r}`;
}
