import { useTranslation } from 'react-i18next';
import { MAX_DATASET_VALUES } from './datasetStatistics.js';

/**
 * La saisie de la série. PAS de bouton « analyser » (§ 9) : dès que la
 * saisie est lisible, le graphique et le résumé suivent. L'attente se fait
 * dans l'outil (un délai de calme), pas sous le doigt de l'élève.
 *
 * Une valeur illisible n'est jamais avalée en silence (§ 33) : elle est
 * NOMMÉE sous le champ, et le reste de la série continue d'être analysé —
 * refuser toute la série à cause d'un « abc » punirait l'élève au lieu de
 * l'aider.
 */
export default function DatasetEditor({ text, invalid, truncated, count, onChange }) {
  const { t } = useTranslation('mathlab');
  const hasProblem = invalid.length > 0 || truncated;
  const describedBy = hasProblem ? 'ml-ps-dataset-problem' : 'ml-ps-dataset-hint';

  return (
    <div className="sa-ml-ps__dataset">
      <label htmlFor="ml-ps-dataset" className="sa-ml-ps__field-label">
        {t('tools.probabilityStats.datasetLabel')}
      </label>
      <textarea
        id="ml-ps-dataset"
        className={`sa-ml-ps__textarea ${invalid.length > 0 ? 'sa-ml-ps__textarea--invalid' : ''}`}
        dir="ltr"
        rows={3}
        value={text}
        spellCheck={false}
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('tools.probabilityStats.datasetPlaceholder')}
        aria-invalid={invalid.length > 0 || undefined}
        aria-describedby={describedBy}
        data-ml-ps-dataset
      />

      {hasProblem ? (
        <p id="ml-ps-dataset-problem" className="sa-ml-ps__error" role="alert" data-ml-ps-dataset-error>
          {invalid.length > 0 && t('tools.probabilityStats.datasetInvalid', {
            count: invalid.length,
            values: invalid.slice(0, 3).map((item) => `« ${item.text} »`).join('، '),
          })}
          {invalid.length > 0 && truncated ? ' ' : ''}
          {truncated && t('tools.probabilityStats.datasetTruncated', { max: MAX_DATASET_VALUES })}
        </p>
      ) : (
        <p id="ml-ps-dataset-hint" className="sa-ml-ps__hint" data-ml-ps-dataset-count>
          {count === 0
            ? t('tools.probabilityStats.datasetEmpty')
            : t('tools.probabilityStats.datasetCount', { count })}
        </p>
      )}
    </div>
  );
}
