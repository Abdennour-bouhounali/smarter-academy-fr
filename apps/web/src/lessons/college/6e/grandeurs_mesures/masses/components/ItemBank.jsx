import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ItemBank — réserve d'objets à glisser-déposer sur une Balance.
 *
 * Vraie manipulation « drag & drop » (framer-motion `drag`, basé sur les
 * Pointer Events : fonctionne au doigt comme à la souris). Pendant le
 * glissement, l'objet devient temporairement `pointer-events: none` pour
 * que le point de dépôt (mesuré par le module appelant via les refs des
 * zones de la Balance) ne détecte jamais l'objet lui-même.
 *
 * `onDragRelease(id, clientX, clientY)` est appelé au relâchement ; le
 * module appelant décide, à partir des refs des zones, où l'objet est
 * tombé. S'il n'est déposé sur aucune zone valide, il revient
 * automatiquement à sa place (`dragSnapToOrigin`).
 */
export default function ItemBank({ items, placement, onDragRelease, onDraggingChange, disabled = false }) {
  const pool = items.filter((it) => !placement[it.id]);

  return (
    <div className="space-y-2">
      <p className="text-center text-xs font-mono text-slate-400">
        Fais glisser un objet jusqu’à un plateau de la balance.
      </p>
      <div className="flex flex-wrap justify-center gap-2 min-h-[76px]" role="group" aria-label="Réserve d’objets">
        <AnimatePresence>
          {pool.map((it) => (
            <DraggableItem
              key={it.id}
              item={it}
              disabled={disabled}
              onDragStart={() => onDraggingChange?.(true)}
              onDragEnd={(e, info) => {
                onDraggingChange?.(false);
                const x = e.clientX ?? info.point.x;
                const y = e.clientY ?? info.point.y;
                onDragRelease(it.id, x, y);
              }}
            />
          ))}
        </AnimatePresence>
        {pool.length === 0 && <span className="text-xs text-slate-400 italic self-center py-2">Tous les objets sont posés.</span>}
      </div>
    </div>
  );
}

function DraggableItem({ item, disabled, onDragStart, onDragEnd }) {
  const [lifted, setLifted] = useState(false);

  return (
    <motion.button
      type="button"
      layout
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      drag={!disabled}
      dragSnapToOrigin
      dragElastic={0.15}
      dragMomentum={false}
      whileDrag={{ scale: 1.18, zIndex: 50, boxShadow: '0 14px 26px rgba(15,23,42,0.25)' }}
      onDragStart={() => { setLifted(true); onDragStart(); }}
      onDragEnd={(e, info) => { setLifted(false); onDragEnd(e, info); }}
      disabled={disabled}
      aria-label={item.label}
      style={{ touchAction: 'none', pointerEvents: lifted ? 'none' : 'auto', position: 'relative' }}
      className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border-2 bg-white border-slate-200 text-slate-600 min-h-[64px] min-w-[72px] shadow-sm cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <span className="text-xl" aria-hidden="true">{item.emoji}</span>
      <span className="text-[11px] font-semibold leading-tight text-center text-slate-700">{item.label}</span>
    </motion.button>
  );
}
