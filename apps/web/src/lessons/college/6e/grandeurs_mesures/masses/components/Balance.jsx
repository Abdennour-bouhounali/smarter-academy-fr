import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Balance — balance à deux plateaux, avec vraie manipulation par
 * glisser-déposer (framer-motion `drag`, basé sur les Pointer Events :
 * fonctionne aussi bien au doigt qu'à la souris).
 *
 * Balance elle-même reste un contrôleur d'affichage : elle calcule
 * l'inclinaison à partir de `left`/`right` et expose deux zones de dépôt
 * (via `leftZoneRef`/`rightZoneRef`) que le module appelant utilise pour
 * détecter où un objet glissé depuis ItemBank a été relâché. Le placement
 * est un state géré par le module, pas par Balance.
 *
 * Toucher un objet déjà posé le reprend (retour dans la réserve) —
 * complément simple au glisser-déposer, pas besoin de re-glisser pour
 * annuler.
 *
 * `showValues` révèle la masse totale sous chaque plateau (à activer une
 * fois que l'élève a validé sa comparaison, pas avant).
 */
export default function Balance({
  left = [],
  right = [],
  showValues = false,
  unit = 'g',
  ariaLabel = 'Balance à deux plateaux',
  dragging = false,
  leftZoneRef,
  rightZoneRef,
  onItemTap,
}) {
  const totalLeft = left.reduce((s, it) => s + it.mass, 0);
  const totalRight = right.reduce((s, it) => s + it.mass, 0);

  const diff = totalLeft - totalRight;
  const maxTilt = 11;
  const scale = Math.max(totalLeft, totalRight, 1);
  const tilt = diff === 0 ? 0 : Math.max(-maxTilt, Math.min(maxTilt, -(diff / scale) * maxTilt));

  const verdict = totalLeft === 0 && totalRight === 0 ? null : diff === 0 ? 'equal' : diff > 0 ? 'left' : 'right';

  const Pan = ({ items, cx }) => (
    <g>
      <line x1={cx - 30} y1="88" x2={cx - 30} y2="140" stroke="#94a3b8" strokeWidth="2" />
      <line x1={cx + 30} y1="88" x2={cx + 30} y2="140" stroke="#94a3b8" strokeWidth="2" />
      <path d={`M ${cx - 38} 140 Q ${cx} 168 ${cx + 38} 140`} fill="#e2e8f0" stroke="#64748b" strokeWidth="2.5" />
      <foreignObject x={cx - 48} y="92" width="96" height="44" style={{ pointerEvents: 'none' }}>
        <div className="w-full h-full flex flex-wrap justify-center items-end gap-0.5">
          <AnimatePresence>
            {items.map((it) => (
              <motion.button
                key={it.id}
                type="button"
                layout
                initial={{ scale: 0, opacity: 0, y: -14 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 340, damping: 18 }}
                onClick={() => onItemTap?.(it.id)}
                style={{ pointerEvents: onItemTap ? 'auto' : 'none', cursor: onItemTap ? 'pointer' : 'default' }}
                className="text-xl leading-none focus:outline-none"
                aria-label={`Reprendre ${it.label}`}
              >
                {it.emoji}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </foreignObject>
    </g>
  );

  return (
    <div className="relative w-full max-w-md mx-auto" role="img" aria-label={ariaLabel}>
      <svg viewBox="0 0 400 220" className="w-full select-none">
        {/* Pied */}
        <line x1="200" y1="200" x2="200" y2="90" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
        <line x1="150" y1="204" x2="250" y2="204" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
        <circle cx="200" cy="88" r="7" fill="#334155" />

        {/* Fléau, incliné selon le déséquilibre (ressort animé) */}
        <motion.g animate={{ rotate: tilt }} transition={{ type: 'spring', stiffness: 120, damping: 11, mass: 0.7 }} style={{ transformOrigin: '200px 88px' }}>
          <line x1="70" y1="88" x2="330" y2="88" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
          <Pan items={left} cx={75} />
          <Pan items={right} cx={325} />
        </motion.g>
      </svg>

      {/* Zones de dépôt : rectangles fixes (n'accompagnent pas l'inclinaison,
          pour rester des cibles larges et faciles à viser en glissant). */}
      <motion.div
        ref={leftZoneRef}
        data-dropzone="left"
        animate={dragging ? { opacity: [0.25, 0.6, 0.25] } : { opacity: 0.12 }}
        transition={dragging ? { repeat: Infinity, duration: 1 } : { duration: 0.2 }}
        className="absolute rounded-2xl border-2 border-dashed border-blue-400 pointer-events-none"
        style={{ left: '2%', top: '30%', width: '34%', height: '52%' }}
      />
      <motion.div
        ref={rightZoneRef}
        data-dropzone="right"
        animate={dragging ? { opacity: [0.25, 0.6, 0.25] } : { opacity: 0.12 }}
        transition={dragging ? { repeat: Infinity, duration: 1 } : { duration: 0.2 }}
        className="absolute rounded-2xl border-2 border-dashed border-blue-400 pointer-events-none"
        style={{ right: '2%', top: '30%', width: '34%', height: '52%' }}
      />

      <div className="flex items-center justify-center gap-8 -mt-2" aria-live="polite">
        <div className="text-center">
          {showValues && <div className="font-mono text-sm font-bold text-slate-700">{totalLeft} {unit}</div>}
        </div>
        <motion.div
          key={verdict}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wide"
        >
          {verdict === null && (dragging ? '👉 dépose-le sur un plateau' : '—')}
          {verdict === 'equal' && '⚖️ Équilibre'}
          {verdict === 'left' && '◀ Plus lourd à gauche'}
          {verdict === 'right' && 'Plus lourd à droite ▶'}
        </motion.div>
        <div className="text-center">
          {showValues && <div className="font-mono text-sm font-bold text-slate-700">{totalRight} {unit}</div>}
        </div>
      </div>
    </div>
  );
}
