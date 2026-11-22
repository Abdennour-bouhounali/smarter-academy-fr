import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/**
 * Un panneau dépliable animé en hauteur — UNE transition pour les trois
 * niveaux (ميدان, وحدة, درس) plutôt qu'une par carte. Qui demande moins de
 * mouvement (prefers-reduced-motion) obtient le même état final, sans
 * transition : framer-motion ne couvre pas `height` dans son mode réduit,
 * d'où la durée forcée à 0 ici.
 */
export default function Collapsible({ open, id, className = '', children }) {
  const reduced = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key={id}
          id={id}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.22, ease: 'easeOut' }}
          className={`overflow-hidden ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
