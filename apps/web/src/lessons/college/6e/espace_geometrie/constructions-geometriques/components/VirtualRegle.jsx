import React, { useRef, useState, useCallback } from 'react';

/**
 * VirtualRegle — la règle graduée qu'on POSE, qu'on FAIT GLISSER, et le long
 * de laquelle on marque des points.
 *
 * ACTION          l'élève saisit la règle et la fait coulisser sous le
 *                 segment ; il saisit ensuite chaque extrémité du trait et la
 *                 pose sur une graduation.
 * TRANSFORMATION  la lecture affichée est recalculée en direct : graduation
 *                 de départ, graduation d'arrivée, et leur DIFFÉRENCE.
 * SENS MATH.      une longueur n'est pas la graduation d'arrivée : c'est
 *                 l'écart entre deux graduations. Faire glisser la règle
 *                 sous un trait qui ne bouge pas rend cela irréfutable —
 *                 les deux nombres lus changent, leur différence non.
 * FEEDBACK        aucune correction : les trois nombres sont là, l'élève
 *                 constate lui-même l'invariant.
 * GÉNÉRALISATION  mesurer, c'est soustraire ; aligner sur 0 n'est qu'un
 *                 raccourci qui rend la soustraction invisible.
 *
 * ── POURQUOI CE COMPOSANT PLUTÔT QU'UN SVG FIXE ───────────────────────
 * L'ancienne `RulerStrip` du module 2 dessinait un segment posé de la
 * graduation 1 à la graduation 8 et posait un QCM dessus : l'élève lisait
 * une image. Ici le décalage de la règle est CONTINU et c'est l'élève qui le
 * produit ; le « piège du zéro » cesse d'être une anecdote et devient une
 * grandeur qu'il pilote.
 *
 * ── SÉCURITÉ VISUELLE (§6bis.4) ───────────────────────────────────────
 * Aucune mesure n'est écrite dans un <text> SVG : les trois lectures vivent
 * dans le DOM, sous la figure, en colonnes fixes. Quelle que soit la
 * position de la règle ou le nombre de chiffres, rien ne peut chevaucher.
 * Les seuls textes du SVG sont les graduations, à pas constant et donc à
 * espacement garanti.
 *
 * RÈGLE PROJET : pas de prop `disabled` — une manipulation ne se fige jamais.
 */

const W = 320;
const H = 150;
const PAD = 24;
const N_GRAD = 12;            // graduations 0 … 12
const STEP = (W - 2 * PAD) / N_GRAD;
const RULER_TOP = 62;         // haut du corps de la règle, en unités SVG
const RULER_H = 40;
const TRAIT_Y = 40;           // le trait à mesurer, au-dessus de la règle

/** Graduation → abscisse SVG, la règle étant décalée de `offset` graduations. */
const gradToX = (g, offset) => PAD + (g - offset) * STEP;
/** Abscisse SVG → graduation (réelle, non arrondie) sous la règle décalée. */
const xToGrad = (x, offset) => (x - PAD) / STEP + offset;

export default function VirtualRegle({
  /** Décalage de la règle, en graduations : 0 = le trait commence sur le 0. */
  offset,
  onOffsetChange,
  /** Extrémités du trait à mesurer, en graduations ABSOLUES de la scène. */
  from,
  to,
  onFromChange,
  onToChange,
  /** Bornes du glissement des extrémités, en unités de scène. */
  minSpan = 1,
  maxGrad = 12,
  ariaLabel,
}) {
  const svgRef = useRef(null);
  // Ce qu'on tient : 'regle' | 'from' | 'to' | null.
  const held = useRef(null);
  const [holding, setHolding] = useState(null);
  // Décalage entre le point saisi et l'origine de la règle, pour que la
  // règle ne saute pas sous le doigt au premier pixel de mouvement.
  const grab = useRef(0);

  const svgFromClient = useCallback((clientX) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return null;
    return ((clientX - rect.left) / rect.width) * W;
  }, []);

  /* La position d'un point du trait, à l'écran, dépend du décalage de la
     règle : le trait est fixe dans la SCÈNE, c'est la règle qui bouge. */
  const xOf = (g) => gradToX(g, offset);

  const clampOffset = (o) => Math.max(-4, Math.min(6, Math.round(o * 2) / 2));
  const clampGrad = (g) => Math.max(0, Math.min(maxGrad, Math.round(g)));

  const applyPointer = (x) => {
    if (x == null) return;
    const g = xToGrad(x, offset);
    if (held.current === 'regle') {
      // Faire glisser la règle : l'origine suit le doigt, décalage compris.
      onOffsetChange?.(clampOffset(offset - (g - grab.current)));
      return;
    }
    if (held.current === 'from') {
      const next = clampGrad(g);
      if (to - next >= minSpan) onFromChange?.(next);
      return;
    }
    if (held.current === 'to') {
      const next = clampGrad(g);
      if (next - from >= minSpan) onToChange?.(next);
    }
  };

  const begin = (what) => (e) => {
    e.stopPropagation();
    held.current = what;
    setHolding(what);
    const x = svgFromClient(e.clientX);
    if (x != null) grab.current = xToGrad(x, offset);
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
    // Une extrémité saisie se pose tout de suite là où on a cliqué ; la règle,
    // elle, ne bouge qu'au mouvement (sinon elle sauterait au premier appui).
    if (what !== 'regle') applyPointer(x);
  };
  const move = (e) => {
    if (!held.current) return;
    applyPointer(svgFromClient(e.clientX));
  };
  const end = (e) => {
    if (!held.current) return;
    held.current = null;
    setHolding(null);
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
  };

  const keyFor = (what) => (e) => {
    /* Contrat clavier complet — le même que `useDragValue` : flèches (un
       pas), Page↑/↓ (dix pas) et Début/Fin (les bornes). Sans Home/End, les
       extrêmes de la course étaient inatteignables au clavier, et le
       balayage e2e ne pouvait pas parcourir toute la manipulation. */
    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      const bas = e.key === 'Home';
      if (what === 'regle') { onOffsetChange?.(bas ? -4 : 6); return; }
      if (what === 'from') {
        const next = bas ? 0 : clampGrad(to - minSpan);
        if (to - next >= minSpan) onFromChange?.(next);
        return;
      }
      const next = bas ? clampGrad(from + minSpan) : maxGrad;
      if (next - from >= minSpan) onToChange?.(next);
      return;
    }
    const big = { PageUp: 1, PageDown: -1 }[e.key];
    if (big !== undefined) {
      e.preventDefault();
      if (what === 'regle') { onOffsetChange?.(clampOffset(offset + big * 2)); return; }
      if (what === 'from') {
        const next = clampGrad(from + big * 3);
        if (to - next >= minSpan) onFromChange?.(next);
        return;
      }
      const next = clampGrad(to + big * 3);
      if (next - from >= minSpan) onToChange?.(next);
      return;
    }
    const d = { ArrowRight: 1, ArrowLeft: -1, ArrowUp: 1, ArrowDown: -1 }[e.key];
    if (d === undefined) return;
    e.preventDefault();
    if (what === 'regle') { onOffsetChange?.(clampOffset(offset + d * 0.5)); return; }
    if (what === 'from') {
      const next = clampGrad(from + d);
      if (to - next >= minSpan) onFromChange?.(next);
      return;
    }
    const next = clampGrad(to + d);
    if (next - from >= minSpan) onToChange?.(next);
  };

  /* Lectures — ce que l'élève lit SUR la règle, décalage compris. */
  const lireFrom = from - offset;
  const lireTo = to - offset;
  const longueur = lireTo - lireFrom;      // = to − from : invariant par offset

  const xFrom = xOf(from);
  const xTo = xOf(to);

  return (
    <div className="space-y-3">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-[500px] mx-auto select-none bg-white rounded-xl border-2 border-slate-200"
        style={{ touchAction: 'none' }}
        role="group"
        aria-label={ariaLabel ?? 'Règle graduée à faire glisser sous un trait à mesurer'}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
      >
        {/* ── Décor : jamais d'interception du pointeur (playbook §10.3) ── */}
        <g style={{ pointerEvents: 'none' }}>
          {/* Le trait à mesurer — fixe dans la scène */}
          <line
            x1={xFrom} y1={TRAIT_Y} x2={xTo} y2={TRAIT_Y}
            stroke="#4f46e5" strokeWidth="5" strokeLinecap="round"
          />
          {/* Les deux verticales de report vers la règle : c'est elles qui
              montrent QUELLE graduation est lue à chaque extrémité. */}
          <line x1={xFrom} y1={TRAIT_Y} x2={xFrom} y2={RULER_TOP + RULER_H}
                stroke="#818cf8" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1={xTo} y1={TRAIT_Y} x2={xTo} y2={RULER_TOP + RULER_H}
                stroke="#818cf8" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Le corps de la règle */}
          <rect
            x={gradToX(offset, offset) - 14} y={RULER_TOP}
            width={N_GRAD * STEP + 28} height={RULER_H}
            fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.5" rx="4"
          />
          {Array.from({ length: N_GRAD + 1 }, (_, i) => {
            const x = gradToX(i + offset, offset);
            const majeure = i % 5 === 0;
            return (
              <g key={i}>
                <line
                  x1={x} y1={RULER_TOP} x2={x} y2={RULER_TOP + (majeure ? 15 : 9)}
                  stroke="#ca8a04" strokeWidth={majeure ? 1.6 : 1}
                />
                <text
                  x={x} y={RULER_TOP + 30} textAnchor="middle"
                  className="font-mono" fontSize="10" fill="#854d0e"
                >
                  {i}
                </text>
              </g>
            );
          })}

          {/* Les graduations effectivement lues, mises en évidence */}
          {[lireFrom, lireTo].map((g, i) => {
            if (g < 0 || g > N_GRAD) return null;
            const x = gradToX(g + offset, offset);
            return (
              <circle
                key={i} cx={x} cy={RULER_TOP + 7} r="4.5"
                fill="#4f46e5" stroke="#fff" strokeWidth="1.5"
              />
            );
          })}
        </g>

        {/* ── Poignées ────────────────────────────────────────────────
            Le corps de la règle est saisissable partout : c'est l'objet
            lui-même qu'on déplace, pas un curseur déporté. */}
        <rect
          x={gradToX(offset, offset) - 14} y={RULER_TOP}
          width={N_GRAD * STEP + 28} height={RULER_H}
          fill="transparent"
          onPointerDown={begin('regle')}
          onKeyDown={keyFor('regle')}
          role="slider"
          tabIndex={0}
          aria-label="Faire glisser la règle"
          aria-valuemin={-4}
          aria-valuemax={6}
          aria-valuenow={offset}
          aria-valuetext={`règle décalée de ${offset} graduation${Math.abs(offset) > 1 ? 's' : ''} ; le trait se lit de ${lireFrom} à ${lireTo}`}
          style={{ cursor: holding === 'regle' ? 'grabbing' : 'grab', outline: 'none' }}
        />
        {/* Les extrémités du trait : zones de 44 px de diamètre en unités
            écran (le SVG fait 320 unités pour ~500 px, r=15 ⇒ ≈47 px). */}
        {[['from', xFrom, from], ['to', xTo, to]].map(([what, x, g]) => (
          <circle
            key={what}
            cx={x} cy={TRAIT_Y} r="15"
            fill="transparent"
            onPointerDown={begin(what)}
            onKeyDown={keyFor(what)}
            role="slider"
            tabIndex={0}
            aria-label={what === 'from' ? 'Extrémité gauche du trait' : 'Extrémité droite du trait'}
            aria-valuemin={0}
            aria-valuemax={maxGrad}
            aria-valuenow={g}
            aria-valuetext={`extrémité sur la graduation ${g - offset}`}
            style={{ cursor: holding === what ? 'grabbing' : 'grab', outline: 'none' }}
          />
        ))}
        {/* Les pastilles peintes des extrémités, par-dessus la zone tactile */}
        <g style={{ pointerEvents: 'none' }}>
          {[[xFrom, 'from'], [xTo, 'to']].map(([x, what]) => (
            <circle
              key={what} cx={x} cy={TRAIT_Y} r={holding === what ? 8 : 6.5}
              fill="#4f46e5" stroke="#fff" strokeWidth="2.5"
            />
          ))}
        </g>
      </svg>

      {/* ── Les lectures, dans le DOM : trois colonnes qui ne bougent pas ──
          C'est le tableau qui porte la découverte : les deux premières
          colonnes changent quand la règle glisse, la troisième jamais. */}
      <div className="grid grid-cols-3 gap-2 text-center" role="status" aria-live="polite">
        <div className="rounded-xl border-2 border-slate-200 bg-slate-50 px-2 py-2">
          <div className="text-[11px] font-mono uppercase tracking-wide text-slate-400">départ</div>
          <div className="font-mono font-black text-xl text-indigo-800">{lireFrom}</div>
        </div>
        <div className="rounded-xl border-2 border-slate-200 bg-slate-50 px-2 py-2">
          <div className="text-[11px] font-mono uppercase tracking-wide text-slate-400">arrivée</div>
          <div className="font-mono font-black text-xl text-indigo-800">{lireTo}</div>
        </div>
        <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-2 py-2">
          <div className="text-[11px] font-mono uppercase tracking-wide text-emerald-600">écart</div>
          <div className="font-mono font-black text-xl text-emerald-800">{longueur}</div>
        </div>
      </div>
    </div>
  );
}
