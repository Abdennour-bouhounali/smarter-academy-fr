import { useTranslation } from 'react-i18next';
import HighlightedNumber from './HighlightedNumber';

/**
 * La QSMة الإقليدية posée comme dans le manuel (p. 10 : 143 | 11 → 13, reste 0) :
 * le dividende à gauche, le diviseur en haut à droite, le quotient sous le
 * diviseur, le reste sous le dividende. Tout le bloc est LTR — c'est une
 * écriture numérique, pas une phrase.
 *
 * `reveal` : quelles cases sont visibles ('all' | Set de rôles). En mode
 * classe, l'enseignant montre le quotient PUIS le reste.
 */
export default function DivisionDisplay({ dividend, divisor, quotient, remainder, reveal = 'all', emphasis }) {
  const { t } = useTranslation('lesson');
  const show = (role) => reveal === 'all' || (reveal instanceof Set && reveal.has(role));
  const tone = (role) => (emphasis === role ? role : role);
  return (
    <div dir="ltr" className="inline-grid grid-cols-[auto_auto] gap-x-3 gap-y-1 rounded-2xl border-2 border-slate-200 bg-white p-3 font-mono">
      <div className="flex items-center justify-end border-r-2 border-slate-400 pr-3">
        <HighlightedNumber value={dividend} tone={tone('dividend')} label={t('manipulation.dividend')} size="lg" />
      </div>
      <div className="flex items-center border-b-2 border-slate-400 pb-1">
        <HighlightedNumber value={divisor} tone={tone('divisor')} label={t('manipulation.divisor')} size="lg" />
      </div>
      <div className="flex items-center justify-end pr-3 pt-1">
        {show('remainder') ? (
          <HighlightedNumber value={remainder} tone="remainder" label={t('manipulation.remainder')} size="lg" />
        ) : (
          <span className="text-slate-300 text-2xl">…</span>
        )}
      </div>
      <div className="flex items-center pt-1">
        {show('quotient') ? (
          <HighlightedNumber value={quotient} tone="quotient" label={t('manipulation.quotient')} size="lg" />
        ) : (
          <span className="text-slate-300 text-2xl">…</span>
        )}
      </div>
    </div>
  );
}
