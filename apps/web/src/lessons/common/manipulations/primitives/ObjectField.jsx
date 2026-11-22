import { motion, useReducedMotion } from 'framer-motion';

/**
 * Un CHAMP D'OBJETS dénombrables (livres, fleurs, jetons), rangés en groupes
 * de taille fixe, le reste à part. C'est la représentation physique de la
 * division euclidienne : `count = groupSize × groups + remainder`.
 *
 *   ▮▮▮▮▮▮▮  ▮▮▮▮▮▮▮  ▮▮▮▮▮▮▮   groupes complets (q)
 *   ▮▮▮                          reste (r), en ambre
 *
 * PERFORMANCE : chaque groupe est UN nœud dont les objets sont dessinés par
 * un dégradé répété (`repeating-linear-gradient`) — 420 livres ne coûtent
 * pas 420 <span>. Au-delà de `maxGroups` groupes dessinés, on résume
 * (« … et 12 autres »), l'idée est déjà visible.
 *
 * Aucun texte arabe : les étiquettes viennent du type.
 */
export default function ObjectField({
  count, groupSize, color = '#4f46e5', remainderColor = '#f59e0b', unitPx = 10, maxGroups = 24, groupLabel, remainderLabel, moreLabel, ariaLabel, compact = false,
}) {
  const reduce = useReducedMotion();
  const size = Math.max(1, groupSize | 0);
  const groups = Math.floor(count / size);
  const remainder = count - groups * size;
  const shown = Math.min(groups, maxGroups);
  const hidden = groups - shown;
  // Un groupe : une bande de `size` cellules. Pour rester lisible sur 320 px,
  // la bande se replie en lignes de 20 cellules au plus.
  const perRow = Math.min(size, compact ? 14 : 20);
  const rows = Math.ceil(size / perRow);
  const cell = unitPx;
  const stripe = (c) => ({
    backgroundImage: `repeating-linear-gradient(to right, ${c} 0, ${c} ${cell - 2}px, transparent ${cell - 2}px, transparent ${cell}px)`,
    backgroundSize: `${cell}px ${cell}px`,
  });
  const groupStyle = (c) => ({ width: `${perRow * cell}px`, height: `${rows * cell}px`, ...stripe(c) });
  const lastRowCells = size - (rows - 1) * perRow;

  return (
    <div className="space-y-2" role="img" aria-label={ariaLabel}>
      <div className="flex flex-wrap gap-2" dir="ltr">
        {Array.from({ length: shown }, (_, i) => (
          <motion.div
            key={`g${i}`}
            initial={reduce ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15, delay: reduce ? 0 : Math.min(i * 0.02, 0.3) }}
            className="relative rounded-md border border-slate-300 bg-white p-1"
            title={groupLabel}
          >
            <div className="rounded-sm" style={groupStyle(color)} />
            {rows > 1 && lastRowCells < perRow && (
              // Masque la fin de la dernière ligne pour ne dessiner que `size` cellules.
              <div className="absolute bottom-1 right-1 bg-white" style={{ width: `${(perRow - lastRowCells) * cell}px`, height: `${cell}px` }} />
            )}
          </motion.div>
        ))}
        {hidden > 0 && <div className="self-center rounded-md border border-dashed border-slate-300 px-2 py-1 text-xs text-slate-500">{moreLabel?.(hidden)}</div>}
      </div>
      {remainder > 0 && (
        <div className="flex items-center gap-2" dir="ltr">
          <div className="rounded-md border-2 border-amber-400 bg-amber-50 p-1" title={remainderLabel}>
            <div className="rounded-sm" style={{ width: `${Math.min(remainder, perRow) * cell}px`, height: `${Math.ceil(remainder / perRow) * cell}px`, ...stripe(remainderColor) }} />
          </div>
          {remainderLabel && <span className="text-xs font-bold text-amber-800" dir="rtl">{remainderLabel}</span>}
        </div>
      )}
    </div>
  );
}
