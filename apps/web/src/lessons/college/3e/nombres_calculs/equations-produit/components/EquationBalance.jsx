import React from 'react';
import { useReducedMotion } from 'framer-motion';
import MathText from '../../../../../common/components/MathText';
import {
  asLin, balanceTilt, formatDec, formatEquation, isPack, solveLinear,
} from './equationUtils';

/**
 * EquationBalance — la balance d'équation (module 3).
 *
 * Remplace la fausse balance à 3 états du module 2 original (trois textes
 * codés en dur derrière deux boutons). Ici les deux plateaux portent de VRAIS
 * jetons dérivés de l'équation, chaque action transforme l'équation par
 * `balanceStep`, et une action appliquée d'un seul côté fait PENCHER la
 * balance — c'est le retour d'erreur, pas un message.
 *
 * Activity: transformer une équation en agissant sur les deux plateaux.
 * Mathematical objective: comprendre qu'une transformation appliquée des deux
 *   côtés conserve les solutions, et isoler x.
 * Student action: taper une action (« −1 des deux côtés », « −x des deux
 *   côtés », « partager en n groupes », « développer »), éventuellement en
 *   choisissant de ne l'appliquer qu'à gauche.
 * Controlled variable: la suite d'actions.
 * Mathematical state: l'équation `{ left, right }` (formes linéaires ou
 *   paquets k(ax + b)).
 * Visual consequence: les jetons des plateaux se recalculent ; le fléau
 *   s'incline si les deux plateaux ne pèsent plus pareil pour la solution
 *   de départ.
 * Expected observation: seules les actions symétriques gardent l'équilibre ;
 *   l'équation change d'écriture mais garde la même solution.
 * Misconception targeted: « on peut faire passer un terme de l'autre côté
 *   sans rien faire à l'autre membre » et « k(ax + b) se manipule terme à
 *   terme sans développer ».
 * Feedback: l'inclinaison elle-même ; le module ajoute la mesure de l'écart.
 * Formalization: « transformer en conservant les solutions », module 3 §3.
 * Scaffolding: seules les actions utiles sont proposées ; « Recommencer »
 *   est toujours disponible.
 * Transfer: chaque branche du produit nul (module 4) se résout ainsi.
 *
 * Composant CONTRÔLÉ : `eq` et `history` appartiennent au module.
 *
 * @param {{left, right}} eq          équation courante
 * @param {{left, right}} startEq     équation de départ (pour l'inclinaison)
 * @param {{id, label, op, scope}[]} actions
 * @param {(action)=>void} onAction
 * @param {()=>void} [onReset]
 * @param {boolean} [disabled=false]
 */
const W = 560;
const H = 202;
const PIVOT_Y = 62;   // hauteur du fléau : les plateaux et leurs jetons tiennent dessous

export default function EquationBalance({
  eq,
  startEq,
  actions = [],
  onAction,
  onReset,
  disabled = false,
}) {
  const reduced = useReducedMotion();
  const xStar = solveLinear(startEq).x;
  const tilt = typeof xStar === 'number' ? balanceTilt(eq, xStar) : 0;
  const angle = tilt * 7;

  const leftTokens = tokensOf(eq.left);
  const rightTokens = tokensOf(eq.right);

  return (
    <div className="space-y-3" role="group" aria-label="Balance d’équation">
      {/* l'équation, toujours lisible en clair */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white py-3 text-center">
        <MathText className="text-xl text-slate-800">{`$${formatEquation(eq)}$`}</MathText>
      </div>

      {/* la balance */}
      <div className="w-full overflow-x-auto rounded-2xl border-2 border-slate-200 bg-slate-50 flex justify-center">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto min-w-[320px] max-w-[560px] select-none"
          role="img"
          aria-label={
            tilt === 0
              ? 'Balance en équilibre : les deux plateaux pèsent pareil'
              : tilt < 0
              ? 'Balance penchée à gauche : le plateau de gauche est plus lourd'
              : 'Balance penchée à droite : le plateau de droite est plus lourd'
          }
        >
          <g pointerEvents="none">
            {/* pied */}
            <path d={`M ${W / 2 - 26} ${H - 8} L ${W / 2} ${PIVOT_Y} L ${W / 2 + 26} ${H - 8} Z`} fill="#cbd5e1" />
            <rect x={W / 2 - 44} y={H - 12} width="88" height="10" rx="5" fill="#94a3b8" />

            {/* fléau + plateaux, inclinés ensemble */}
            <g
              transform={`rotate(${angle} ${W / 2} ${PIVOT_Y})`}
              style={reduced ? undefined : { transition: 'transform 320ms ease-out' }}
            >
              <line
                x1={72} y1={PIVOT_Y} x2={W - 72} y2={PIVOT_Y}
                stroke={tilt === 0 ? '#0f766e' : '#b45309'} strokeWidth="6" strokeLinecap="round"
              />
              <Pan cx={72} cy={PIVOT_Y} tokens={leftTokens} tone="sky" label="Plateau de gauche" />
              <Pan cx={W - 72} cy={PIVOT_Y} tokens={rightTokens} tone="emerald" label="Plateau de droite" />
            </g>
          </g>
        </svg>
      </div>

      <p
        className={`text-center text-sm font-bold ${
          tilt === 0 ? 'text-emerald-700' : 'text-amber-700'
        }`}
        role="status"
      >
        {tilt === 0 ? '⚖️ Équilibre : les mêmes solutions qu’au départ.' : '⚠️ La balance penche — les solutions ont changé.'}
      </p>

      {/* actions tap-first */}
      {!disabled && actions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Actions sur la balance">
          {actions.map((act) => (
            <button
              key={act.id}
              type="button"
              onClick={() => onAction?.(act)}
              aria-label={act.aria ?? act.label}
              className={`min-h-[44px] px-3.5 rounded-xl border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                act.scope && act.scope !== 'both'
                  ? 'border-amber-300 bg-amber-50 text-amber-800 hover:border-amber-500'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-500'
              }`}
            >
              {act.label}
            </button>
          ))}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="min-h-[44px] px-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm font-bold text-slate-500 hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              ↺ Recommencer
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Les jetons d'un plateau, dérivés de la forme : `k` jetons « x » et `n`
 * jetons unité (rouges si négatifs). Un paquet k(ax + b) est représenté par
 * k boîtes fermées — il faut développer pour voir dedans.
 */
function tokensOf(side) {
  if (isPack(side)) {
    const f = asLin(side);
    return { packs: side.k, packLabel: `(${side.inner.a === 1 ? 'x' : `${formatDec(side.inner.a)}x`}${side.inner.b >= 0 ? ' + ' : ' − '}${formatDec(Math.abs(side.inner.b))})`, xs: 0, units: 0, total: f };
  }
  return { packs: 0, xs: side.a, units: side.b };
}

/** Longueur de la suspension : les jetons tiennent entre le fléau et le plateau. */
const DROP = 84;

const PAN_TONES = {
  sky: { x: '#0284c7', unit: '#38bdf8' },
  emerald: { x: '#059669', unit: '#34d399' },
};

function Pan({ cx, cy, tokens, tone, label }) {
  const t = PAN_TONES[tone];
  const items = [];

  if (tokens.packs > 0) {
    for (let i = 0; i < Math.min(tokens.packs, 4); i += 1) {
      items.push({ key: `p${i}`, kind: 'pack', text: tokens.packLabel });
    }
  } else {
    const nx = Math.abs(tokens.xs);
    for (let i = 0; i < Math.min(nx, 5); i += 1) {
      items.push({ key: `x${i}`, kind: 'x', neg: tokens.xs < 0 });
    }
    const nu = Math.abs(tokens.units);
    for (let i = 0; i < Math.min(nu, 8); i += 1) {
      items.push({ key: `u${i}`, kind: 'unit', neg: tokens.units < 0 });
    }
  }

  const overflowX = Math.abs(tokens.xs) > 5 ? Math.abs(tokens.xs) - 5 : 0;
  const overflowU = Math.abs(tokens.units) > 8 ? Math.abs(tokens.units) - 8 : 0;
  const overflowP = tokens.packs > 4 ? tokens.packs - 4 : 0;
  const overflow = overflowX + overflowU + overflowP;

  const empty = items.length === 0;

  return (
    <g>
      {/* suspension + plateau : la surface du plateau est à cy + DROP */}
      <line x1={cx} y1={cy} x2={cx} y2={cy + DROP} stroke="#94a3b8" strokeWidth="2" />
      <path
        d={`M ${cx - 60} ${cy + DROP} L ${cx + 60} ${cy + DROP} L ${cx + 46} ${cy + DROP + 16} L ${cx - 46} ${cy + DROP + 16} Z`}
        fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2"
      />
      <text x={cx} y={cy + DROP + 32} textAnchor="middle" fontSize="10" fill="#64748b" fontFamily="monospace">
        {label}
      </text>

      {/* jetons POSÉS sur le plateau, empilés vers le haut */}
      {items.map((it, i) => {
        if (it.kind === 'pack') {
          return (
            <g key={it.key}>
              <rect x={cx - 50} y={cy + DROP - 16 - i * 17} width="100" height="15" rx="4" fill="#a78bfa" stroke="#7c3aed" strokeWidth="1.5" />
              <text x={cx} y={cy + DROP - 5 - i * 17} textAnchor="middle" fontSize="9" fill="#fff" fontFamily="monospace" fontWeight="bold">
                {it.text}
              </text>
            </g>
          );
        }
        const col = i % 5;
        const row = Math.floor(i / 5);
        const px = cx - 50 + col * 21;
        const baseY = cy + DROP - 2 - row * 19;
        if (it.kind === 'x') {
          return (
            <g key={it.key}>
              <rect x={px} y={baseY - 17} width="19" height="17" rx="3" fill={it.neg ? '#fecaca' : t.x} stroke={it.neg ? '#dc2626' : '#0f172a'} strokeWidth="1" />
              <text x={px + 9.5} y={baseY - 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill={it.neg ? '#991b1b' : '#fff'} fontFamily="monospace">
                x
              </text>
            </g>
          );
        }
        return (
          <circle
            key={it.key}
            cx={px + 9.5} cy={baseY - 8} r="7"
            fill={it.neg ? '#fecaca' : t.unit}
            stroke={it.neg ? '#dc2626' : '#0f172a'} strokeWidth="1"
          />
        );
      })}

      {overflow > 0 && (
        <text x={cx + 58} y={cy + DROP - 4} textAnchor="end" fontSize="10" fontWeight="bold" fill="#475569" fontFamily="monospace">
          ×{overflow}
        </text>
      )}

      {empty && (
        <text x={cx} y={cy + DROP - 6} textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="monospace">
          vide (0)
        </text>
      )}
    </g>
  );
}
