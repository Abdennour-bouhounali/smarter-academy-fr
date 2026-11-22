import MathText from '../../components/MathText';
import FitLine from '../../components/FitLine';

const TONES = {
  neutral: 'border-slate-200 bg-white text-slate-800',
  active: 'border-blue-400 bg-blue-50 text-blue-900 ring-2 ring-blue-200',
  ok: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  ko: 'border-rose-300 bg-rose-50 text-rose-900',
  muted: 'border-slate-200 bg-slate-50 text-slate-400',
  result: 'border-amber-300 bg-amber-50 text-amber-900',
};

/**
 * Une égalité mathématique, isolée en LTR (master spec §14) et rendue par
 * KaTeX via MathText. `tex` est une chaîne LaTeX SANS `$` — la brique les pose.
 * `note` (arabe) s'affiche à côté, dans le flux RTL de la page.
 *
 * La formule ne se coupe JAMAIS sur deux lignes (`.katex { white-space: nowrap }`, règle du propriétaire) : si elle est plus large
 * que son cadre — la colonne étroite du lecteur de mission à 1024 px, par exemple —, `FitLine` baisse juste assez sa taille de police
 * pour qu'elle y tienne. Avant (2026-11-10), l'élément flex n'avait pas `min-w-0` : la ligne débordait de la colonne vers la gauche
 * (RTL) et l'ancêtre `overflow-hidden` la coupait (« = √(2² × 8) … », « √32 » invisible) sans que `data-fit-overflow` le voie.
 */
export default function EquationDisplay({ tex, tone = 'neutral', note, size = 'md', className = '' }) {
  const text = size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-sm' : 'text-base';
  return (
    <div className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 px-3 py-2 ${TONES[tone] ?? TONES.neutral} ${className}`}>
      <div dir="ltr" className={`min-w-0 max-w-full font-mono ${text}`} data-equation-line>
        <FitLine dir="ltr"><MathText>{`$${tex}$`}</MathText></FitLine>
      </div>
      {note && <span className="text-sm">{note}</span>}
    </div>
  );
}
