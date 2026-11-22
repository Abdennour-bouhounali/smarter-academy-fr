
/**
 * Une suite de touches de la calculatrice (« ON sin 54 = », معارف 3) — du CODE LTR, jamais du KaTeX, jamais nu dans
 * une phrase arabe (ARABIC_RTL_CONTRACT). Chaque touche est un `<kbd>` dans une rangée `dir="ltr"` ; le manuel
 * précise « من اليسار إلى اليمين ».
 */
export default function KeySequence({ keys, className = '' }) {
  return (
    <span className={`inline-flex flex-wrap items-center gap-1 align-middle ${className}`} dir="ltr" data-key-sequence={keys.join(' ')}>
      {keys.map((k, i) => (
        <kbd key={`${k}${i}`} className="rounded-md border-2 border-slate-400 bg-white px-2 py-0.5 font-mono text-sm font-bold text-slate-800 shadow-[0_2px_0_#94a3b8]">{k}</kbd>
      ))}
    </span>
  );
}
