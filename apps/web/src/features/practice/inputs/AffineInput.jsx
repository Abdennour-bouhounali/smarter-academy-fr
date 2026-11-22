import { useTranslation } from 'react-i18next';
import AnswerField from './AnswerField';

/**
 * Deux champs — a et b — plutôt qu'un éditeur d'expression.
 *
 * Ce n'est pas un repli faute de MathLive : c'est meilleur. L'ordre de
 * préférence maison va du plus simple au plus libre, et deux champs séparés
 * permettent au moteur de dire « ton coefficient directeur est bon, regarde
 * la valeur en x = 0 » — ce qu'une chaîne LaTeX unique rend impossible.
 */
export default function AffineInput({ value, onChange, disabled }) {
  const { t } = useTranslation('student');
  const set = (key) => (v) => onChange({ ...value, [key]: v });

  return (
    <div className="flex items-end gap-4 flex-wrap">
      <label className="space-y-1">
        <span className="block text-xs font-mono font-bold text-slate-500 uppercase">
          {t('practice.field.slope')}
        </span>
        <AnswerField
          value={value?.a ?? ''}
          onChange={set('a')}
          ariaLabel={t('practice.field.slope')}
          width="min-w-[6rem]"
          disabled={disabled}
        />
      </label>
      <label className="space-y-1">
        <span className="block text-xs font-mono font-bold text-slate-500 uppercase">
          {t('practice.field.intercept')}
        </span>
        <AnswerField
          value={value?.b ?? ''}
          onChange={set('b')}
          ariaLabel={t('practice.field.intercept')}
          width="min-w-[6rem]"
          disabled={disabled}
        />
      </label>
    </div>
  );
}
