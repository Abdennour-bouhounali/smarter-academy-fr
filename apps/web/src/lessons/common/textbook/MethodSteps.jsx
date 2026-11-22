import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MathText from '../components/MathText';
import TextbookBox from './TextbookBox';

/**
 * Une « طريقة » du manuel : l'énoncé (تمرين), sa solution en LIGNES révélées
 * une par une (l'élève lit une étape, essaie la suivante avant de la voir),
 * puis l'encadré de la règle. Rien n'est automatique : chaque ligne demande
 * un geste — c'est la lecture active d'une méthode, pas son défilement.
 */
export default function MethodSteps({ method, onAllRevealed }) {
  const { t } = useTranslation('lesson');
  const [shown, setShown] = useState(1);
  const total = method.solution.length;
  const reveal = () => {
    const next = Math.min(shown + 1, total);
    setShown(next);
    if (next === total) onAllRevealed?.();
  };
  return (
    <div className="space-y-3">
      <TextbookBox kind="exercise" text={method.exercise} source={method.source} />
      <div className="rounded-2xl border-2 border-slate-300 bg-slate-50 p-4 space-y-2">
        <span className="inline-block rounded-md bg-slate-700 px-2 py-0.5 text-xs font-bold text-white">{t('textbook.solution')}</span>
        <ol className="space-y-1.5">
          {method.solution.slice(0, shown).map((line, i) => (
            <li key={i} className="leading-relaxed text-slate-800 text-base" data-method-line={i}>
              {/* une ligne peut être un nœud (unité 10 : une séquence de touches de calculatrice, code LTR) */}
              {typeof line === 'string' ? <MathText>{line}</MathText> : line}
            </li>
          ))}
        </ol>
        {shown < total ? (
          <button type="button" onClick={reveal}
            className="mt-1 rounded-xl border-2 border-blue-600 bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
            {t('textbook.nextLine')} (<span dir="ltr">{shown}/{total}</span>)
          </button>
        ) : (
          method.remark && <p className="text-sm text-orange-800"><strong>{t('textbook.remark')} :</strong> <MathText>{method.remark}</MathText></p>
        )}
      </div>
      {shown >= total && method.rule && (
        <TextbookBox kind="method" lines={Array.isArray(method.rule) ? method.rule : [method.rule]} />
      )}
    </div>
  );
}
