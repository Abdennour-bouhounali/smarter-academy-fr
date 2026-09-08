import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { fmt } from './relatifs';

/**
 * NumberLineLab — la droite graduée manipulable des modules 2 à 5.
 *
 * C'est l'ascenseur du module 1, couché : le même axe, la même origine, mais
 * horizontal — la représentation que la suite de la scolarité utilisera. Le
 * curseur se glisse, se pilote au clavier, et le zéro reste marqué d'un trait
 * épais pour que « de quel côté » reste lisible à tout moment.
 *
 * Trois usages, un seul composant :
 *   — placer un nombre (`value` + `onChange`) ;
 *   — montrer des points fixes (`marks`) : opposé, cible, repères ;
 *   — montrer un DÉPLACEMENT (`jump`) : la flèche courbe de `from` vers `to`,
 *     qui est la façon dont les modules 4 et 5 rendent visible l'addition.
 *
 * Sécurité visuelle (§17bis) : les graduations chiffrées sont espacées selon
 * la place réellement disponible (`labelEvery` est CALCULÉ à partir du pas en
 * pixels et de la largeur du plus long libellé), si bien qu'aucun nombre ne
 * peut en chevaucher un autre, quelle que soit la plage demandée. Les
 * étiquettes de marque sont empilées sur des lignes distinctes plutôt que
 * superposées.
 */

const H = 132;
const AXIS_Y = 74;
const PAD_X = 26;

export default function NumberLineLab({
  min = -10,
  max = 10,
  value = null,
  onChange = null,
  marks = [],            // [{ at, label?, color?, tone? }]
  jump = null,           // { from, to, label? }
  disabled = false,
  width: nominalWidth = 640,
  ariaLabel,
}) {
  const uid = useId();
  const svgRef = useRef(null);
  const boxRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const interactive = Boolean(onChange) && !disabled;

  /**
   * Largeur RÉELLEMENT disponible, mesurée sur le conteneur.
   *
   * Une droite d'ILLUSTRATION (celle des cartes de connaissances) doit tenir
   * dans sa carte SANS défiler et SANS rapetisser : ses graduations se lisent
   * à la même taille partout. On ne peut donc ni garder un viewBox plus large
   * que la carte (il faudrait défiler), ni le laisser se mettre à l'échelle
   * (le dessin, hauteur comprise, rétrécirait).
   *
   * La sortie est de rendre le viewBox AUSSI LARGE QUE LA PLACE : une unité
   * SVG vaut alors un pixel CSS, la hauteur reste exactement H, et rien n'est
   * déformé. La droite se tasse horizontalement — c'est précisément ce que
   * `labelEvery` sait absorber, en chiffrant une graduation sur deux.
   *
   * La droite MANIPULABLE, elle, garde sa largeur nominale et son plancher :
   * sous ~560 px, la cible de glissement deviendrait trop étroite au doigt, et
   * mieux vaut alors laisser le conteneur défiler.
   */
  const [boxW, setBoxW] = useState(null);
  useLayoutEffect(() => {
    if (interactive) return undefined;
    const el = boxRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setBoxW(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [interactive]);

  // Largeur du repère de dessin. Pour l'illustration, elle épouse la place
  // disponible : une unité SVG = un pixel CSS, donc la hauteur reste H et rien
  // ne rapetisse. Le plancher est bas (160 px) parce qu'un plancher élevé
  // rendait la mise à l'échelle — et donc la perte de hauteur — inévitable
  // dans les cartes étroites du mobile ; c'est `labelEvery` qui absorbe
  // l'étroitesse, en ne chiffrant qu'une graduation sur deux ou trois.
  const width = interactive ? nominalWidth : Math.max(160, Math.min(boxW ?? nominalWidth, nominalWidth));

  const span = max - min;
  const innerW = width - PAD_X * 2;
  const step = innerW / span;                    // px par unité
  const xOf = (n) => PAD_X + (n - min) * step;

  // Combien de graduations peut-on CHIFFRER sans collision ? Dérivé de la
  // largeur réelle du plus long libellé, jamais supposé.
  const longest = Math.max(String(min).length, String(max).length) + 1;
  const labelPx = longest * 8.5;
  const labelEvery = Math.max(1, Math.ceil(labelPx / Math.max(step, 1)));

  const ticks = [];
  for (let n = min; n <= max; n++) ticks.push(n);

  const clamp = useCallback((n) => Math.max(min, Math.min(max, n)), [min, max]);

  const move = useCallback(
    (n) => {
      if (disabled || !onChange) return;
      const next = clamp(Math.round(n));
      if (next !== value) onChange(next);
    },
    [clamp, disabled, onChange, value],
  );

  const numberFromClientX = useCallback(
    (clientX) => {
      const box = svgRef.current?.getBoundingClientRect();
      if (!box) return value ?? min;
      const ratio = (clientX - box.left) / box.width;
      return min + (ratio * width - PAD_X) / step;
    },
    [min, step, value, width],
  );

  useEffect(() => {
    if (!dragging) return undefined;
    const onMove = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      move(numberFromClientX(x));
    };
    const stop = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchend', stop);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchend', stop);
    };
  }, [dragging, move, numberFromClientX]);

  const onKeyDown = (e) => {
    if (!interactive) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); move((value ?? 0) - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); move((value ?? 0) + 1); }
    if (e.key === 'Home') { e.preventDefault(); move(min); }
    if (e.key === 'End') { e.preventDefault(); move(max); }
  };

  return (
    <div
      ref={boxRef}
      className="rounded-2xl border-2 border-slate-200 bg-white p-2 sm:p-3 overflow-x-auto"
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${H}`}
        className="w-full touch-none select-none"
        style={interactive ? { minWidth: Math.min(width, 560) } : { height: H }}
        role={interactive ? 'slider' : 'img'}
        tabIndex={interactive ? 0 : -1}
        aria-valuemin={interactive ? min : undefined}
        aria-valuemax={interactive ? max : undefined}
        aria-valuenow={interactive ? value ?? 0 : undefined}
        aria-valuetext={interactive ? `Nombre ${fmt(value ?? 0)}` : undefined}
        aria-label={ariaLabel || 'Droite graduée'}
        onKeyDown={onKeyDown}
        onMouseDown={(e) => { if (interactive) { setDragging(true); move(numberFromClientX(e.clientX)); } }}
        onTouchStart={(e) => { if (interactive) { setDragging(true); move(numberFromClientX(e.touches[0].clientX)); } }}
      >
        <defs>
          <marker id={`${uid}-arw`} markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,0 L9,4.5 L0,9 z" fill="#059669" />
          </marker>
          <marker id={`${uid}-axis`} markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,0 L9,4.5 L0,9 z" fill="#334155" />
          </marker>
        </defs>

        {/* L'axe */}
        <line
          x1={PAD_X - 14} x2={width - PAD_X + 14} y1={AXIS_Y} y2={AXIS_Y}
          stroke="#334155" strokeWidth="2" markerEnd={`url(#${uid}-axis)`}
        />

        {/* Graduations */}
        {ticks.map((n) => {
          const big = n === 0 || n % labelEvery === 0;
          return (
            <g key={n}>
              <line
                x1={xOf(n)} x2={xOf(n)}
                y1={AXIS_Y - (n === 0 ? 16 : big ? 8 : 5)}
                y2={AXIS_Y + (n === 0 ? 16 : big ? 8 : 5)}
                stroke={n === 0 ? '#0f172a' : '#94a3b8'}
                strokeWidth={n === 0 ? 3 : 1.5}
              />
              {big && (
                <text
                  x={xOf(n)} y={AXIS_Y + 26}
                  textAnchor="middle"
                  fontSize="12.5"
                  fontWeight={n === 0 ? 800 : 500}
                  fill={n === 0 ? '#0f172a' : '#64748b'}
                >
                  {fmt(n)}
                </text>
              )}
            </g>
          );
        })}

        {/* Le déplacement : arc au-dessus de l'axe, jamais par-dessus les chiffres. */}
        {jump && jump.from !== jump.to && (() => {
          const x1 = xOf(jump.from);
          const x2 = xOf(jump.to);
          const top = AXIS_Y - 40;
          return (
            <g>
              <path
                d={`M ${x1} ${AXIS_Y - 14} Q ${(x1 + x2) / 2} ${top} ${x2} ${AXIS_Y - 14}`}
                fill="none" stroke="#059669" strokeWidth="2.5"
                markerEnd={`url(#${uid}-arw)`}
              />
              {jump.label && (
                <text
                  x={(x1 + x2) / 2} y={top - 4}
                  textAnchor="middle" fontSize="13" fontWeight="700" fill="#047857"
                >
                  {jump.label}
                </text>
              )}
            </g>
          );
        })()}

        {/* Marques fixes — étiquettes SOUS les chiffres, sur leur propre ligne. */}
        {marks.map((m, i) => (
          <g key={`${m.at}-${i}`}>
            <circle cx={xOf(m.at)} cy={AXIS_Y} r="6.5" fill={m.color || '#7c3aed'} stroke="#fff" strokeWidth="2" />
            {m.label && (
              <text
                x={xOf(m.at)} y={AXIS_Y + 46}
                textAnchor="middle" fontSize="12.5" fontWeight="700" fill={m.color || '#7c3aed'}
              >
                {m.label}
              </text>
            )}
          </g>
        ))}

        {/* Le curseur mobile */}
        {value !== null && (
          <g style={{ transition: dragging ? 'none' : 'transform 160ms ease-out' }}
             transform={`translate(${xOf(value) - width / 2} 0)`}>
            <circle
              cx={width / 2} cy={AXIS_Y} r="11"
              fill={value < 0 ? '#e11d48' : value > 0 ? '#4f46e5' : '#0f172a'}
              stroke="#fff" strokeWidth="3"
            />
            <text
              x={width / 2} y={AXIS_Y - 22}
              textAnchor="middle" fontSize="15" fontWeight="800"
              fill={value < 0 ? '#e11d48' : value > 0 ? '#4f46e5' : '#0f172a'}
            >
              {fmt(value)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
