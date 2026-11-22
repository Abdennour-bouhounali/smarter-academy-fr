import { AnimatePresence, motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

/**
 * Les arêtes : des chemins SVG qui SE DESSINENT (pathLength 0 → 1), puis la
 * pointe, puis l'étiquette de la relation. Une flèche dit un sens ; une
 * étiquette dit POURQUOI les deux connaissances sont liées.
 *
 * Les étiquettes sont du DOM, pas du <text> SVG : l'arabe y est façonné par
 * Cairo et le moteur bidi du navigateur, comme partout ailleurs.
 *
 * `timing(edge)` → { delay } : quand commencer à se dessiner. Seules les
 * arêtes MONTÉES par la dernière action s'animent (AnimatePresence
 * initial={false}). Les arêtes vers un nœud verrouillé sont en pointillés et
 * sans étiquette (la relation n'est pas encore une connaissance).
 */
export function GraphEdgeLines({ edges, width, height, timing, dimmedKeys, lockedKeys, reduce }) {
  return (
    <svg
      width={width}
      height={height}
      className="absolute inset-0 overflow-visible pointer-events-none"
      aria-hidden="true"
      data-kg-edges="true"
    >
      <AnimatePresence initial={false}>
        {edges.map((e) => {
          const { delay } = timing(e);
          const locked = lockedKeys.has(e.key);
          const dashed = e.dashed || locked;
          const dim = dimmedKeys.has(e.key);
          const stroke = locked ? '#cbd5e1' : dim ? '#cbd5e1' : '#64748b';
          const draw = !dashed && !reduce;
          return (
            <motion.g
              key={e.key}
              data-kg-edge={e.key}
              initial={{ opacity: draw ? 1 : 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.15 } }}
              transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : delay }}
            >
              <motion.path
                d={e.d}
                fill="none"
                stroke={stroke}
                strokeWidth={e.dashed ? 1.75 : 2}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={dashed ? '5 5' : undefined}
                initial={draw ? { pathLength: 0 } : false}
                animate={draw ? { pathLength: 1 } : undefined}
                transition={{ duration: 0.42, delay, ease: EASE }}
                style={{ transition: 'stroke 200ms' }}
              />
              <motion.polygon
                points={e.arrow}
                fill={stroke}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, delay: reduce ? 0 : delay + 0.36 }}
                style={{ transition: 'fill 200ms' }}
              />
            </motion.g>
          );
        })}
      </AnimatePresence>
    </svg>
  );
}

export function GraphEdgeLabels({ edges, timing, dimmedKeys, lockedKeys, reduce }) {
  // Une étiquette par GROUPE : les arêtes qui fusionnent sur une jonction
  // (deux exemples → une même conséquence) ne la répètent pas.
  const seen = new Set();
  const labels = [];
  for (const e of edges) {
    if (!e.label || lockedKeys.has(e.key) || seen.has(e.label.group)) continue;
    seen.add(e.label.group);
    labels.push(e);
  }
  return (
    <AnimatePresence initial={false}>
      {labels.map((e) => {
        const { delay } = timing(e);
        return (
          <motion.span
            key={e.label.group}
            data-kg-label={e.key}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: dimmedKeys.has(e.key) ? 0.4 : 1, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.12 } }}
            transition={reduce ? { duration: 0 } : { duration: 0.25, delay: delay + 0.3 }}
            className={[
              'absolute z-10 whitespace-nowrap rounded-full border px-2.5 py-0.5',
              'text-[11px] font-bold leading-5 pointer-events-none',
              e.dashed ? 'border-violet-200 bg-violet-50 text-violet-700' : 'border-slate-200 bg-white text-slate-600',
            ].join(' ')}
            style={{ left: e.label.x, top: e.label.y, x: '-50%', y: '-50%' }}
          >
            {e.edge.label}
          </motion.span>
        );
      })}
    </AnimatePresence>
  );
}
