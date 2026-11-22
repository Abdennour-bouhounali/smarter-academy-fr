import { useEffect, useRef, useState } from 'react';
import { useSavedAnswer } from '../answers/useSavedAnswer';
import SavedAnswerChip from '../answers/SavedAnswerChip';
import { useTranslation } from 'react-i18next';
import MathText from '../components/MathText';
import MathTextArea, { writtenLength } from '../components/MathTextArea';

/** Le minimum écrit avant de pouvoir comparer : quelques mots, pas une lettre. */
const MIN_WRITTEN_CHARS = 8;

/**
 * WrittenAnswer — une réponse LONGUE qu'aucune machine ne peut valider
 * (rédaction, تعليل, برهان) : l'élève écrit, PUIS découvre la réponse modèle
 * une ligne par clic (demande du propriétaire, 2026-10-06).
 *
 *   1. Zone d'écriture partagée (MathTextArea : RTL, palette de symboles,
 *      calculs isolés en LTR au fil de la frappe).
 *   2. « أظهر الإجابة النموذجية » ne s'active qu'après MIN_WRITTEN_CHARS
 *      caractères : on ne compare pas une page blanche.
 *   3. Le texte de l'élève reste affiché, figé, AU-DESSUS du modèle ; chaque
 *      clic révèle une ligne de plus (k / n).
 *   4. `onDone` à la dernière ligne. Rien n'est évalué ni envoyé : on ne fait
 *      pas semblant de corriger une rédaction par mots-clés.
 *
 * @param {string}   [prompt]  la consigne au-dessus de la zone
 * @param {string[]} lines     la réponse modèle, ligne par ligne (≥ 2)
 * @param {()=>void} [onDone]
 */
export default function WrittenAnswer({ prompt, lines, onDone }) {
  const { t } = useTranslation('lesson');
  const [text, setText] = useState('');
  const [shown, setShown] = useState(0); // lignes du modèle révélées ; 0 = encore en écriture
  const written = writtenLength(text) >= MIN_WRITTEN_CHARS;
  const total = lines.length;

  // ce que l'élève a écrit, gardé POUR LUI (pilote 2026-11-07) : enregistré à chaque ligne du modèle dévoilée, remis à l'écran
  // à son retour — jamais comparé ni corrigé automatiquement
  const memory = useSavedAnswer([prompt, lines]);
  const [restoredAt, setRestoredAt] = useState(null);
  const restored = useRef(false);
  useEffect(() => {
    const m = memory.saved;
    if (restored.current || !m?.v || shown > 0 || text) return;
    restored.current = true;
    if (typeof m.v.text === 'string') setText(m.v.text);
    const n = Math.max(0, Math.min(Number(m.v.shown) || 0, total));
    setShown(n); setRestoredAt(m.at);
    if (n === total && n > 0) onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memory.saved]);

  const reveal = () => {
    const next = Math.min(shown + 1, total);
    setShown(next);
    setRestoredAt(null);
    memory.save({ text, shown: next });
    if (next === total) onDone?.();
  };

  return (
    <div className="space-y-3" data-written-answer data-revealed={shown}>
      {prompt && <p className="text-sm font-semibold text-slate-700"><MathText>{prompt}</MathText></p>}
      {restoredAt && <SavedAnswerChip at={restoredAt} />}

      {shown === 0 ? (
        <MathTextArea value={text} onChange={setText} rows={5} symbolsFrom={lines}
          ariaLabel={t('problem.write.label')} placeholder={t('problem.write.placeholder')} />
      ) : (
        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/60 p-3" data-written-own>
          <span className="inline-block rounded-md bg-blue-700 px-2 py-0.5 text-xs font-bold text-white">{t('problem.write.label')}</span>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-900" dir="rtl">{text}</p>
        </div>
      )}

      {shown > 0 && (
        <div className="space-y-2 rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 p-3" data-written-model>
          <span className="inline-block rounded-md bg-emerald-700 px-2 py-0.5 text-xs font-bold text-white">{t('problem.write.model')}</span>
          <ol className="space-y-1.5">
            {lines.slice(0, shown).map((line, i) => (
              <li key={i} className="flex gap-2 leading-relaxed text-slate-800 text-base" data-model-line={i}>
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-[11px] font-bold text-white" dir="ltr">{i + 1}</span>
                <span><MathText>{line}</MathText></span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {shown < total ? (
        <div className="space-y-1">
          <button type="button" onClick={reveal} disabled={shown === 0 && !written}
            className="rounded-xl border-2 border-blue-600 bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300">
            {shown === 0 ? t('problem.write.show') : t('problem.write.next')}{' '}
            <span dir="ltr">({shown + 1}/{total})</span>
          </button>
          {shown === 0 && !written && <p className="text-xs text-slate-500">{t('problem.write.needText')}</p>}
        </div>
      ) : (
        <p className="text-sm font-semibold text-emerald-800" data-written-compare>{t('problem.write.compare')}</p>
      )}
    </div>
  );
}
