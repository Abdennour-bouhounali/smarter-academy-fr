import { useTranslation } from 'react-i18next';
import { BookOpenCheck } from 'lucide-react';
import RichText from '../RichText';

/**
 * « الحل النموذجي » — le corrigé type d'une étape de feuille d'examen, écrit
 * comme le livret de corrigés des annales : les lignes de calcul (Euclide,
 * différences…) l'une sous l'autre, une phrase de conclusion, puis le
 * résultat ENCADRÉ (`PGCD(945 ; 1215) = 135`).
 *
 * `solution` = { lines: string[], result?: string } — `lines` passent par
 * RichText (arabe + `$…$`), `result` est du LaTeX nu, encadré et isolé LTR —
 * sauf s'il contient de l'arabe (« نعم »، « 4 مرات ») : il s'écrit alors en texte.
 *
 * Replié par défaut (<details>) : il ne s'ouvre qu'après la réponse, ou sur
 * demande dans une auto-évaluation (SelfCheckInput le montre ouvert, `open`).
 * L'ouvrir appelle `onReveal` : les lecteurs y retirent « أعِد المحاولة » pour cette question.
 */
export default function SolutionPanel({ solution, open = false, className = '', onReveal }) {
  const { t } = useTranslation('student');
  if (!solution?.lines?.length) return null;

  const body = (
    <div className="space-y-1.5 pt-2 text-[15px] leading-relaxed text-slate-800 sm:text-base" data-solution-body>
      {solution.lines.map((line, i) => (
        <p key={i}><RichText>{line}</RichText></p>
      ))}
      {solution.result && (
        <p className="pt-1">
          <span className="inline-block rounded-sm border-2 border-slate-800 bg-white px-3 py-1" data-solution-result>
            {/* Une formule → KaTeX ; un résultat en mots (« نعم »، « 4 مرات ») → texte, KaTeX ne compose pas l'arabe. */}
            <RichText>{/[\u0600-\u06FF]/.test(solution.result) ? solution.result : `$${solution.result}$`}</RichText>
          </span>
        </p>
      )}
    </div>
  );

  if (open) {
    return (
      <section className={`rounded-lg border border-emerald-200 bg-emerald-50/40 px-3.5 py-2.5 ${className}`} data-solution-panel>
        <p className="flex items-center gap-1.5 text-sm font-bold text-emerald-800">
          <BookOpenCheck className="h-4 w-4" aria-hidden="true" /> {t('practice.exam.solution')}
        </p>
        {body}
      </section>
    );
  }

  return (
    // `onReveal` : le lecteur apprend que le corrigé a été OUVERT — il retire alors « أعِد المحاولة » (propriétaire,
    // 2026-10-08 : après avoir vu la solution, on ne recopie pas le résultat).
    <details
      className={`group rounded-lg border border-emerald-200 bg-emerald-50/40 px-3.5 py-2 ${className}`}
      data-solution-panel
      onToggle={(e) => { if (e.currentTarget.open) onReveal?.(); }}
    >
      <summary className="flex min-h-[40px] cursor-pointer list-none items-center gap-1.5 text-sm font-bold text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded">
        <BookOpenCheck className="h-4 w-4" aria-hidden="true" /> {t('practice.exam.solution')}
        <span className="text-xs font-semibold text-emerald-700 group-open:hidden">· {t('practice.exam.showSolution')}</span>
      </summary>
      {body}
    </details>
  );
}
