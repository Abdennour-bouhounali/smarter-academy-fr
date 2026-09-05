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
 *
 * `onPlace(id, side)` est l'alternative SANS glisser : deux boutons
 * « ← gauche / droite → » sous chaque objet. Le glisser seul fermait la
 * porte au clavier (et au tactile peu précis) — même raison que le
 * tap-then-tap d'OrderingGame/InfoSorter.
 */
export default function ItemBank({ items, placement, onDragRelease, onDraggingChange, onPlace, disabled = false }) {
  const pool = items.filter((it) => !placement[it.id]);

  return (
    <div className="space-y-2">
      <p className="text-center text-xs font-mono text-slate-400">
        Fais glisser un objet jusqu’à un plateau — ou utilise les deux petits boutons sous l’objet.
      </p>
      <div className="flex flex-wrap justify-center gap-2 min-h-[76px]" role="group" aria-label="Réserve d’objets">
        <AnimatePresence>
          {pool.map((it) => (
            // Enfant direct d'AnimatePresence : ce wrapper DOIT être un
            // motion.* et porter la key, sinon la sortie n'est pas suivie et
            // React se mélange les pinceaux quand on retire un objet du
            // milieu de la liste (deux objets « 100 g » identiques ici).
            <motion.div
              key={it.id}
              layout
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex flex-col items-center gap-1"
            >
              <DraggableItem
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
              {onPlace && (
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onPlace(it.id, 'left')}
                    aria-label={`Poser ${it.label} sur le plateau de gauche`}
                    className="px-2 py-0.5 rounded-md border border-slate-200 bg-white text-[11px] font-bold text-slate-600 hover:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onPlace(it.id, 'right')}
                    aria-label={`Poser ${it.label} sur le plateau de droite`}
                    className="px-2 py-0.5 rounded-md border border-slate-200 bg-white text-[11px] font-bold text-slate-600 hover:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    →
                  </button>
                </div>
              )}
            </motion.div>
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
    // L'apparition/disparition est portée par le wrapper motion.div dans
    // ItemBank (enfant direct d'AnimatePresence) : ici on ne garde que le
    // geste de glisser.
    <motion.button
      type="button"
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
