import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * DraggableSplitBar — une barre d'effectifs dont la SÉPARATION elle-même se
 * saisit et se déplace.
 *
 * Pourquoi ce composant plutôt qu'un `<input type="range">` posé sous la
 * figure : le curseur natif sépare le geste de son effet — on tire un objet
 * en bas pour faire bouger un objet en haut. Ici l'élève attrape directement
 * le trait noir qui découpe la population : le geste EST le découpage. C'est
 * la manipulation la plus directe possible de la variable « où passe la
 * frontière », et c'est ce que demande INTERACTION_PEDAGOGY §16 (préférer le
 * contrôle le plus direct que la mathématique autorise).
 *
 * Liberté de mouvement : le pas par défaut est 1 individu — le glissement est
 * continu à l'échelle des données. Un pas plus grossier se demande
 * explicitement (`step`), il n'est jamais imposé par confort d'implémentation.
 *
 * Accessibilité : la poignée est un `role="slider"` focalisable, pilotable
 * aux flèches (±step), Page↑/↓ (±10 pas), Début/Fin. Elle porte
 * `aria-valuenow`/`aria-valuetext`, si bien que le lecteur d'écran annonce
 * l'effectif ET la proportion.
 *
 * Pointeur : `setPointerCapture` fait suivre la souris/le doigt même quand il
 * sort de la barre, et le glissement fonctionne donc jusqu'aux extrémités.
 *
 * RÈGLE GÉNÉRALE DU PROJET : la manipulation ne se fige jamais après
 * validation de l'étape (pas de prop `disabled`) ; seul `locked` — réservé
 * aux figures d'illustration pilotées par le module — retire la poignée.
 */
export default function DraggableSplitBar({
  total,
  value,
  onChange,
  step = 1,
  height = 56,
  locked = false,
  colors = { part: '#4f46e5', rest: '#cbd5e1' },
  labels = { part: '', rest: '' },
  ariaLabel = 'Séparation',
  valueText,
  children,            // contenu SVG additionnel, dessiné sous la poignée
  extraHeight = 0,     // place réservée à ce contenu, sous la barre
}) {
  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const W = 1000;                    // repère interne ; le SVG est fluide
  const clamp = (v) => Math.max(0, Math.min(total, v));
  const snap = (v) => clamp(Math.round(v / step) * step);
  const xOf = (n) => (total ? (n / total) * W : 0);

  /** Position du pointeur → effectif, dans le repère du SVG (zoom compris). */
  const valueFromEvent = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return value;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0) return value;
    const ratio = (e.clientX - rect.left) / rect.width;
    return snap(ratio * total);
  }, [total, step, value]);

  const onPointerDown = (e) => {
    if (locked) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
    onChange(valueFromEvent(e));
  };
  const onPointerMove = (e) => {
    if (!dragging || locked) return;
    onChange(valueFromEvent(e));
  };
  const endDrag = (e) => {
    if (!dragging) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setDragging(false);
  };

  const onKeyDown = (e) => {
    if (locked) return;
    const big = Math.max(step, Math.round(total / 10 / step) * step);
    const map = {
      ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step,
      PageDown: -big, PageUp: big,
    };
    if (e.key in map) { e.preventDefault(); onChange(clamp(value + map[e.key])); return; }
    if (e.key === 'Home') { e.preventDefault(); onChange(0); return; }
    if (e.key === 'End') { e.preventDefault(); onChange(total); }
  };

  // Le curseur « grabbing » doit tenir tant que le doigt est baissé, même
  // hors de la barre : on le pose sur le document le temps du glissement.
  useEffect(() => {
    if (!dragging) return undefined;
    const prev = document.body.style.cursor;
    document.body.style.cursor = 'grabbing';
    return () => { document.body.style.cursor = prev; };
  }, [dragging]);

  const x = xOf(value);
  const H = height;
  // Rayon de la pastille de préhension : une étiquette rejetée hors de sa
  // zone doit commencer au-delà, sinon la poignée la recouvre.
  const HANDLE_R = 13;

  return (
    <svg
      ref={svgRef}
      width="100%"
      viewBox={`0 0 ${W} ${H + extraHeight + 26}`}
      preserveAspectRatio="none"
      className="select-none touch-none overflow-visible"
      style={{ touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role="presentation"
    >
      <rect x={0} y={0} width={W} height={H} fill={colors.rest} rx="8" />
      <rect x={0} y={0} width={x} height={H} fill={colors.part} rx="8" />

      {/* Les effectifs, écrits DANS leur zone tant qu'elle est assez large ;
          sinon rejetés de l'autre côté du trait, en sombre, pour qu'une part
          minuscule reste lisible au lieu de déborder de sa couleur. La
          largeur nécessaire est estimée à partir du texte réellement écrit —
          un libellé long ne doit pas être déclaré « tenant » à tort. */}
      {(() => {
        const txt = `${value}${labels.part ? ` ${labels.part}` : ''}`;
        const need = txt.length * 10 + 24;      // ~10 unités de repère par caractère à 19px
        const fits = x > need;
        if (value === 0) return null;
        return (
          <text x={fits ? x / 2 : x + HANDLE_R + 8} y={H / 2 + 6}
            textAnchor={fits ? 'middle' : 'start'} fontSize="19" fontWeight="800"
            fill={fits ? '#fff' : '#312e81'}>
            {txt}
          </text>
        );
      })()}
      {(() => {
        const txt = `${total - value}${labels.rest ? ` ${labels.rest}` : ''}`;
        const need = txt.length * 10 + 24;
        const fits = W - x > need;
        if (total - value === 0) return null;
        return (
          <text x={fits ? (x + W) / 2 : x - HANDLE_R - 8} y={H / 2 + 6}
            textAnchor={fits ? 'middle' : 'end'} fontSize="19" fontWeight="800"
            fill={fits ? '#475569' : '#fff'}>
            {txt}
          </text>
        );
      })()}

      {children}

      {/* LA POIGNÉE : le trait noir de la figure, devenu saisissable. */}
      <g
        role="slider"
        tabIndex={locked ? -1 : 0}
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={value}
        aria-valuetext={valueText ?? `${value} sur ${total}`}
        aria-disabled={locked || undefined}
        onKeyDown={onKeyDown}
        style={{ cursor: locked ? 'default' : dragging ? 'grabbing' : 'ew-resize', outline: 'none' }}
        className="focus-visible:[&>rect:first-child]:stroke-blue-500"
      >
        {/* Zone de préhension large (invisible) : le doigt n'a pas à viser
            2 px. Elle porte le halo de focus clavier. */}
        <rect x={x - 22} y={-6} width={44} height={H + 12} fill="transparent"
          stroke="transparent" strokeWidth="3" rx="6" />
        <line x1={x} y1={-6} x2={x} y2={H + 6} stroke="#0f172a" strokeWidth={dragging ? 5 : 3.5} />
        {!locked && (
          <g transform={`translate(${x}, ${H / 2})`}>
            <circle r={HANDLE_R} fill="#0f172a" />
            <path d="M -5.5 -4 L -9 0 L -5.5 4 M 5.5 -4 L 9 0 L 5.5 4"
              fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </g>

      <text x={0} y={H + extraHeight + 19} fontSize="15" fill="#64748b">0</text>
      <text x={W} y={H + extraHeight + 19} textAnchor="end" fontSize="15" fill="#64748b">{total}</text>
    </svg>
  );
}
