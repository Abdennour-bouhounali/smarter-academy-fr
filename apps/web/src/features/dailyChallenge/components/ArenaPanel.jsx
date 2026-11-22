/**
 * Le décor du défi : une surface sombre et profonde (le langage de
 * `glass-card-dark`), un halo discret aux couleurs de la marque. Aucun néon,
 * aucun dégradé criard : la profondeur vient de la lumière, pas de la couleur.
 */
export default function ArenaPanel({ children, className = '', as: Tag = 'section', ...rest }) {
  return (
    <Tag
      className={`relative overflow-hidden rounded-[28px] border border-slate-200 bg-white text-slate-900 shadow-xl shadow-slate-200/60 ${className}`}
      {...rest}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 start-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-400/15 via-violet-400/15 to-cyan-300/15 blur-3xl" />
      <div className="relative">{children}</div>
    </Tag>
  );
}
