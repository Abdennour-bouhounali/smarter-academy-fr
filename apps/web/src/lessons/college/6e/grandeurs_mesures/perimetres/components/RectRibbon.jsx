import React from 'react';

import useDragValue from '../../../../../common/manip6e/useDragValue';

/**
 * RectRibbon — redimensionner un rectangle et voir son tour déroulé se
 * réorganiser en QUATRE segments, égaux deux à deux.
 *
 * ACTION       l'élève tire le coin du rectangle : longueur et largeur
 *              changent séparément (deux poignées de bord, une par
 *              dimension), sans aucune contrainte entre elles.
 * CHANGE       le ruban sous la figure se recompose : deux segments bleus
 *              de longueur L, deux segments orange de longueur l, toujours
 *              dans cet ordre, quelles que soient les valeurs.
 * OBSERVATION  quoi qu'on fasse, il y a exactement DEUX bleus et DEUX
 *              orange — la régularité ne dépend pas des nombres choisis.
 * SENS         P = L + l + L + l = 2 × (L + l) : la formule est la lecture
 *              du ruban, pas une convention à mémoriser.
 *
 * C'est ce qui manque à une figure statique aux côtés coloriés : l'élève y
 * voit UNE paire de nombres et doit croire que ça se généralise. Ici il
 * fabrique lui-même vingt rectangles et constate que la structure tient.
 *
 * Sécurité visuelle (§6bis.4) : le cadre est taillé pour le rectangle
 * maximal, le ruban a une échelle FIXE calée sur le périmètre maximal (donc
 * il ne peut jamais déborder), et toutes les valeurs numériques vivent dans
 * le DOM sous les figures.
 */
const PX = 20;
const PAD = 22;
const RULE_H = 54;

export default function RectRibbon({
  L, l, onChange,
  maxL, maxl,
  minL = 1, minl = 1,
  unit = 'm',
}) {
  const VB_W = maxL * PX + PAD * 2;
  const VB_H = maxl * PX + PAD * 2;
  const P = 2 * (L + l);
  const Pmax = 2 * (maxL + maxl);

  const dragL = useDragValue({
    value: L,
    onChange: (v) => onChange({ L: v, l }),
    min: minL, max: maxL, axis: 'x',
    toValue: (r) => minL + r * (maxL - minL),
    ariaLabel: 'Longueur du rectangle',
    valueText: (v) => `longueur ${v} ${unit}`,
  });
  const dragl = useDragValue({
    value: l,
    onChange: (v) => onChange({ L, l: v }),
    min: minl, max: maxl, axis: 'y',
    toValue: (r) => minl + (1 - r) * (maxl - minl),
    ariaLabel: 'Largeur du rectangle',
    valueText: (v) => `largeur ${v} ${unit}`,
  });

  const down = (e) => { dragL.handleProps.onPointerDown?.(e); dragl.handleProps.onPointerDown?.(e); };
  const move = (e) => { dragL.handleProps.onPointerMove?.(e); dragl.handleProps.onPointerMove?.(e); };
  const up = (e) => { dragL.handleProps.onPointerUp?.(e); dragl.handleProps.onPointerUp?.(e); };

  // Le ruban : L, l, L, l dans l'ordre du tour. Échelle FIXE (calée sur le
  // périmètre maximal) — sans cela le ruban « rétrécirait » en s'allongeant
  // et l'élève ne verrait pas le périmètre croître.
  const RULE_W = 300;
  const scale = (RULE_W - 20) / Pmax;
  const segs = [
    { v: L, color: '#2563eb' },
    { v: l, color: '#f97316' },
    { v: L, color: '#2563eb' },
    { v: l, color: '#f97316' },
  ];

  return (
    <div className="space-y-2">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full max-w-[320px] mx-auto select-none block"
        role="group"
        aria-label="Rectangle redimensionnable"
        ref={(el) => { dragL.frameProps.ref.current = el; dragl.frameProps.ref.current = el; }}
        style={{ touchAction: 'none' }}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <rect x={PAD} y={PAD} width={maxL * PX} height={maxl * PX} fill="#f8fafc" stroke="#f1f5f9" />
        <rect x={PAD} y={PAD} width={L * PX} height={l * PX} fill="#eff6ff" />
        {/* Les quatre côtés, colorés par paires : la structure du tour. */}
        <line x1={PAD} y1={PAD} x2={PAD + L * PX} y2={PAD} stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
        <line x1={PAD + L * PX} y1={PAD} x2={PAD + L * PX} y2={PAD + l * PX} stroke="#f97316" strokeWidth="5" strokeLinecap="round" />
        <line x1={PAD + L * PX} y1={PAD + l * PX} x2={PAD} y2={PAD + l * PX} stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
        <line x1={PAD} y1={PAD + l * PX} x2={PAD} y2={PAD} stroke="#f97316" strokeWidth="5" strokeLinecap="round" />

        <rect
          x={PAD} y={PAD} width={maxL * PX} height={maxl * PX}
          fill="transparent" onPointerDown={down}
          style={{ touchAction: 'none', cursor: 'nwse-resize' }}
        />
        <g
          onPointerDown={down}
          role="slider" tabIndex={0}
          aria-label="Coin du rectangle — change ses deux dimensions"
          aria-valuemin={2 * (minL + minl)} aria-valuemax={Pmax} aria-valuenow={P}
          aria-valuetext={`longueur ${L} ${unit}, largeur ${l} ${unit}, tour ${P} ${unit}`}
          onKeyDown={(e) => {
            const m = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] };
            if (e.key in m) {
              e.preventDefault();
              const [dL, dl] = m[e.key];
              onChange({
                L: Math.min(maxL, Math.max(minL, L + dL)),
                l: Math.min(maxl, Math.max(minl, l + dl)),
              });
            }
          }}
          style={{ cursor: 'nwse-resize', touchAction: 'none', outline: 'none' }}
        >
          <circle cx={PAD + L * PX} cy={PAD + l * PX} r={16} fill="transparent" />
          <circle cx={PAD + L * PX} cy={PAD + l * PX} r={8} fill="#e11d48" stroke="#ffffff" strokeWidth="2.5" />
        </g>
      </svg>

      {/* Le tour déroulé : quatre segments, égaux DEUX À DEUX, toujours. */}
      <svg viewBox={`0 0 ${RULE_W} ${RULE_H}`} className="w-full max-w-[320px] mx-auto block" role="img" aria-label={`Le tour déroulé : ${L}, ${l}, ${L}, ${l}`}>
        <line x1={10} y1={28} x2={RULE_W - 10} y2={28} stroke="#f1f5f9" strokeWidth="2" />
        {(() => {
          let acc = 0;
          return segs.map((sg, i) => {
            const x1 = 10 + acc * scale;
            acc += sg.v;
            const x2 = 10 + acc * scale;
            return (
              <g key={i}>
                <line x1={x1} y1={28} x2={x2} y2={28} stroke={sg.color} strokeWidth="12" strokeLinecap="butt" />
                <line x1={x2} y1={19} x2={x2} y2={37} stroke="#ffffff" strokeWidth="2" />
              </g>
            );
          });
        })()}
      </svg>

      <div className="text-center space-y-0.5" role="status" aria-live="polite">
        <p className="font-mono text-sm text-slate-600">
          <span className="text-blue-700 font-bold">L = {L} {unit}</span>
          {' · '}
          <span className="text-orange-600 font-bold">l = {l} {unit}</span>
        </p>
        <p className="font-mono text-slate-800">
          {L} + {l} + {L} + {l} = <strong className="text-xl">{P} {unit}</strong>
        </p>
      </div>
    </div>
  );
}
