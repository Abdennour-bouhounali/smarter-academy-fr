import { useTranslation } from 'react-i18next';
import { Lightbulb } from 'lucide-react';

/**
 * Les INDICES (§19) : une manipulation est une activité, pas un quiz — ils
 * sont FERMÉS à l'ouverture (2026-10-14 : un mur de texte fait fuir un élève
 * de 11–13 ans) ; « تلميح » les affiche EN ENTIER, d'un coup, sans étapes, et
 * « إخفاء التلميح » les referme. Aucun ne contient la réponse : le
 * dernier pose la bonne QUESTION. Seul l'enseignant (mode classe) dispose de
 * « إظهار الحل », ailleurs.
 */
export default function ManipulationHint({ hints = [], open = true }) {
  const { t } = useTranslation('lesson');
  if (!hints.length || !open) return null;
  return (
    <ol className="space-y-1.5" aria-live="polite" data-manipulation-hints>
      {hints.map((h, i) => (
        <li key={i} className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{hints.length > 1 && <span className="sr-only">{t('manipulation.hint.n', { n: i + 1 })} : </span>}{h}</span>
        </li>
      ))}
    </ol>
  );
}
