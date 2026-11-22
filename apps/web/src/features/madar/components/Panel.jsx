/** Le panneau de verre de « مدار » : lisible sur le ciel, sans cacher le jeu. */
export default function Panel({ as: Tag = 'section', className = '', children, ...rest }) {
  return (
    <Tag className={`rounded-[28px] bg-slate-950/55 p-4 text-white shadow-2xl shadow-black/40 ring-1 ring-white/12 backdrop-blur-xl sm:p-5 ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
