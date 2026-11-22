
/**
 * Une zone qui ACCUEILLE un objet porté. Quatre états, lisibles sans texte :
 *   prête     — un objet est en main (tap/clavier) : bordure colorée, curseur
 *   attirée   — le pointeur ou l'aimant la vise ET elle accepterait : fond
 *               plein, anneau
 *   refusante — le pointeur la survole mais elle refuserait : rose, avant
 *               même que l'élève lâche (la raison suit au relâchement)
 *   au repos  — pointillés discrets
 *
 * `role="button"` + tabIndex : au clavier, activer la zone y pose l'objet en
 * main (le chemin non-glisser, jamais retiré). `label` est ce que le lecteur
 * d'écran annonce ; `hint` un texte court affiché quand la zone est vide.
 */
export default function DropZone({
  drag, id, label, hint, disabled = false, tone = 'indigo', className = '', minHeight = 'min-h-[64px]', children, ...rest
}) {
  const props = drag.zoneProps(id, { disabled });
  const active = props['data-drop-active'] === 'true';
  const invalid = props['data-drop-invalid'] === 'true';
  const ready = props['data-drop-ready'] === 'true';
  const T = TONES[tone] ?? TONES.indigo;
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-disabled={disabled || undefined}
      {...props}
      {...rest}
      className={`relative rounded-2xl border-2 transition-colors ${minHeight} ${
        active ? `${T.active} ring-2 ${T.ring}` : invalid ? 'border-rose-400 bg-rose-50 ring-2 ring-rose-200' : ready ? `${T.ready} cursor-pointer` : 'border-dashed border-slate-300 bg-white/70'
      } ${disabled ? 'opacity-60' : ''} ${className}`}
    >
      {children}
      {hint && !children && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center px-3 text-center text-xs text-slate-400">{hint}</span>
      )}
    </div>
  );
}

const TONES = {
  indigo: { active: 'border-indigo-500 bg-indigo-100', ready: 'border-indigo-400 bg-indigo-50', ring: 'ring-indigo-300' },
  emerald: { active: 'border-emerald-500 bg-emerald-100', ready: 'border-emerald-400 bg-emerald-50', ring: 'ring-emerald-300' },
  amber: { active: 'border-amber-500 bg-amber-100', ready: 'border-amber-400 bg-amber-50', ring: 'ring-amber-300' },
  rose: { active: 'border-rose-400 bg-rose-100', ready: 'border-rose-300 bg-rose-50', ring: 'ring-rose-300' },
  slate: { active: 'border-slate-600 bg-slate-100', ready: 'border-slate-400 bg-slate-50', ring: 'ring-slate-300' },
};
