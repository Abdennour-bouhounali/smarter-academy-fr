
/**
 * Une séquence de touches de calculatrice (طرائق p. 119 : ON 2,5 ÷ sin 25) et ce qu'affiche l'écran. Les touches
 * sont du CODE LTR (`<kbd dir="ltr">`), jamais du texte nu dans une phrase arabe, jamais du KaTeX
 * (ARABIC_RTL_CONTRACT : les touches ON, 2nd, sin⁻¹). Une donnée { keys, screen } de content/textbook.js.
 */
export default function KeySequence({ keys, screen, screenLabel = 'يظهر على الشاشة' }) {
  return (
    <span className="flex flex-wrap items-center gap-2" data-key-sequence>
      <span dir="ltr" className="inline-flex flex-wrap items-center gap-1" role="list">
        {keys.map((key, i) => (
          <kbd key={`${key}-${i}`} role="listitem" className="min-w-[2rem] rounded-md border border-slate-400 border-b-2 bg-white px-1.5 py-0.5 text-center font-mono text-sm font-bold text-slate-800 shadow-sm">{key}</kbd>
        ))}
      </span>
      {screen && (
        <>
          <span className="text-sm text-slate-600">{screenLabel}</span>
          <bdi dir="ltr" className="rounded-md bg-emerald-950 px-2 py-0.5 font-mono text-sm font-bold text-emerald-300">{screen}</bdi>
        </>
      )}
    </span>
  );
}
