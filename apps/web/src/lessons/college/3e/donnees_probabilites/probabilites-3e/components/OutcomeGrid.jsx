import React from 'react';
import { Pips } from './DiceLab';
import { FACES, cellKey } from './probaUtils';

/**
 * OutcomeGrid — les 36 issues de deux dés, une case par couple (a ; b).
 *
 * Activity            cocher toutes les cases qui réalisent un événement
 *                     (« somme 7 », « somme ≥ 10 »).
 * Mathematical objective  faire VOIR que l'expérience « deux dés » a 36 issues
 *                     ÉQUIPROBABLES (les cases), et non 11 (les sommes) : la
 *                     somme 7 gagne parce que 6 cases la donnent.
 * Student action      toucher une case (ou Entrée/Espace au clavier).
 * Controlled variable l'ensemble des cases retenues.
 * Mathematical state  `selected` (Set de clés « a-b ») appartient au module ;
 *                     le nombre de cases cochées est dérivé.
 * Visual consequence  la case passe en indigo ; si `showSums`, la somme est
 *                     écrite dans chaque case ; `reveal` peint en vert les
 *                     cases attendues (correction) et en rose les cases
 *                     cochées à tort.
 * Expected observation « il y a plusieurs façons de faire 7, une seule de
 *                     faire 2 ».
 * Misconception targeted  « 11 sommes ⇒ chacune 1/11 ».
 *
 * INGÉNIERIE : une zone tactile transparente PAR CASE (36 ≤ 52), chacune
 * role="button" avec libellé français et clavier ; le décor (pastilles, sommes)
 * est peint AVANT les zones et porte pointerEvents:'none'. viewBox carré et
 * responsive. À 375 px, la carte déborde volontairement du padding de
 * l'étape (-mx-5) pour que chaque case garde ≥ 44 px de côté (mesuré : 247 px
 * de large sans ce débord → cases de 35 px, trop petites pour le doigt).
 */
const CELL = 50;
const HEAD = 34;
const SIZE = HEAD + 6 * CELL + 4;

export default function OutcomeGrid({
  selected,
  onToggle,             // (a, b) => void
  showSums = true,
  reveal = null,        // Set de clés attendues — mode correction
  disabled = false,
  frozen = false,
  caption,
}) {
  const locked = disabled || frozen;
  const k = selected.size;
  const reading = `Grille des 36 issues de deux dés, ${k} case${k > 1 ? 's' : ''} cochée${k > 1 ? 's' : ''}`;

  return (
    <div className="-mx-5 sm:mx-0 rounded-2xl border-2 border-slate-200 bg-white p-1 sm:p-3 space-y-2"
      role={frozen ? 'img' : 'group'} aria-label={reading}>
      {caption && <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wide">{caption}</p>}
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[400px] mx-auto block select-none"
        style={{ touchAction: 'manipulation' }}>
        {/* En-têtes : le dé 1 en colonne, le dé 2 en ligne */}
        <text x={HEAD / 2} y={HEAD / 2 + 3} textAnchor="middle" fontSize="9" fill="#64748b" className="font-mono" style={{ pointerEvents: 'none' }}>dé 1 ↓</text>
        {FACES.map((f, i) => (
          <g key={`ch${f}`} transform={`translate(${HEAD + i * CELL + CELL / 2 - 13} 4) scale(0.26)`} style={{ pointerEvents: 'none' }}>
            <rect x="6" y="6" width="88" height="88" rx="18" fill="#ffffff" stroke="#475569" strokeWidth="7" />
            <Pips face={f} color="#334155" r={11} />
          </g>
        ))}
        {FACES.map((f, i) => (
          <g key={`rh${f}`} transform={`translate(4 ${HEAD + i * CELL + CELL / 2 - 13}) scale(0.26)`} style={{ pointerEvents: 'none' }}>
            <rect x="6" y="6" width="88" height="88" rx="18" fill="#ffffff" stroke="#475569" strokeWidth="7" />
            <Pips face={f} color="#334155" r={11} />
          </g>
        ))}
        {/* Les cases : décor puis zone tactile */}
        {FACES.map((a, i) => FACES.map((b, j) => {
          const key = cellKey(a, b);
          const on = selected.has(key);
          const expected = reveal ? reveal.has(key) : null;
          const x = HEAD + j * CELL;
          const y = HEAD + i * CELL;
          let fill = on ? '#4f46e5' : '#f8fafc';
          let stroke = '#cbd5e1';
          if (reveal) {
            if (expected && on) { fill = '#059669'; stroke = '#047857'; }
            else if (expected && !on) { fill = '#d1fae5'; stroke = '#059669'; }
            else if (!expected && on) { fill = '#e11d48'; stroke = '#be123c'; }
          }
          const label = `Case dé 1 = ${a}, dé 2 = ${b}, somme ${a + b}${on ? ', cochée' : ''}`;
          return (
            <g key={key}>
              <rect x={x + 1} y={y + 1} width={CELL - 2} height={CELL - 2} rx="6" fill={fill} stroke={stroke} strokeWidth="1.5" style={{ pointerEvents: 'none' }} />
              {showSums && (
                <text x={x + CELL / 2} y={y + CELL / 2 + 5} textAnchor="middle" fontSize="15" fontWeight="700"
                  fill={on || (reveal && expected && on) || (reveal && !expected && on) ? '#ffffff' : '#334155'} className="font-mono"
                  style={{ pointerEvents: 'none' }}>{a + b}</text>
              )}
              {!showSums && (
                <text x={x + CELL / 2} y={y + CELL / 2 + 4} textAnchor="middle" fontSize="11"
                  fill={on ? '#ffffff' : '#64748b'} className="font-mono" style={{ pointerEvents: 'none' }}>{a}·{b}</text>
              )}
              {!frozen && (
                <rect x={x} y={y} width={CELL} height={CELL} fill="transparent"
                  role="button" tabIndex={locked ? -1 : 0} aria-pressed={on} aria-label={label}
                  className="focus:outline-none focus-visible:stroke-blue-500 focus-visible:stroke-[3px]"
                  style={{ cursor: locked ? 'default' : 'pointer' }}
                  onClick={() => !locked && onToggle?.(a, b)}
                  onKeyDown={(e) => {
                    if (locked) return;
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle?.(a, b); }
                  }} />
              )}
            </g>
          );
        }))}
      </svg>
      <p className="text-center text-sm text-slate-700" aria-live="polite">
        <strong className="font-mono tabular-nums">{k}</strong> case{k > 1 ? 's' : ''} cochée{k > 1 ? 's' : ''} sur <strong className="font-mono">36</strong>
      </p>
    </div>
  );
}
