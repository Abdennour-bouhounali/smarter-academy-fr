import { useTranslation } from 'react-i18next';
import { Trash2, Plus } from 'lucide-react';
import { tableColumns } from './investigations.js';
import { formatValue } from '../functionGrapher/grapherFormat.js';

/**
 * Le TABLEAU des observations (§18) — le cœur de l'instrument.
 *
 * C'est ici que la relation se voit. Le tableau ne commente rien, ne
 * souligne rien, ne suggère aucune colonne : il aligne des mesures, et
 * demande « Que remarques-tu entre ces nombres ? ». C'est l'élève qui compare.
 *
 * ── Ce que le tableau ne fait pas ───────────────────────────────────────
 * Il n'ajoute pas de colonne « L × l » à côté de « A » : ce serait donner la
 * réponse (§23). La seule colonne dérivée qui existe est celle qu'une
 * enquête déclare elle-même (C ÷ d pour le cercle), et elle est le SUJET de
 * l'enquête, pas sa réponse.
 *
 * Les nombres sont en LTR (dir="ltr") : ce sont des mathématiques (§30).
 */
export default function ObservationTable({
  investigation, observations, onRecord, onRemove, onClear, testResults, duplicateWarning,
}) {
  const { t } = useTranslation('mathlab');
  const columns = tableColumns(investigation);
  const resultById = new Map((testResults ?? []).map((result) => [result.id, result]));

  return (
    <section className="sa-ml-ms__panelSection" aria-labelledby="sa-ml-ms-obs">
      <header className="sa-ml-ms__panelHead">
        <h3 id="sa-ml-ms-obs" className="sa-ml-ms__panelTitle">
          {t('tools.measurement.observations.heading')}
        </h3>
        {observations.length > 0 && (
          <span className="sa-ml-ms__count">
            {t('tools.measurement.observations.count', { count: observations.length })}
          </span>
        )}
      </header>

      <button type="button" className="sa-ml-ms__record" onClick={onRecord}>
        <Plus size={18} aria-hidden="true" />
        {t('tools.measurement.observations.record')}
      </button>

      {duplicateWarning && (
        <p className="sa-ml-ms__warn" role="status">
          {t('tools.measurement.observations.duplicate')}
        </p>
      )}

      {observations.length === 0 ? (
        <div className="sa-ml-ms__empty">
          <p>{t('tools.measurement.observations.empty')}</p>
          <p className="sa-ml-ms__emptyHint">{t('tools.measurement.observations.emptyHint')}</p>
        </div>
      ) : (
        <>
          {/* Le tableau défile HORIZONTALEMENT dans sa boîte, jamais la page (§29). */}
          <div className="sa-ml-ms__tableWrap">
            <table className="sa-ml-ms__table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} scope="col">
                      <span className="sa-ml-ms__colName">
                        {t(`tools.measurement.quantities.${column.key}`, column.key)}
                      </span>
                      <span className="sa-ml-ms__colSymbol" dir="ltr">{column.symbol}</span>
                    </th>
                  ))}
                  {resultById.size > 0 && (
                    <th scope="col">{t('tools.measurement.test.predicted')}</th>
                  )}
                  <th scope="col"><span className="sa-ml-ms__sr">{t('tools.measurement.observations.remove')}</span></th>
                </tr>
              </thead>
              <tbody>
                {observations.map((row, index) => {
                  const result = resultById.get(row.id);

                  return (
                    <tr
                      key={row.id}
                      className={result ? `sa-ml-ms__row--${result.matches ? 'match' : 'mismatch'}` : undefined}
                    >
                      {columns.map((column) => (
                        <td key={column.key} dir="ltr">
                          {formatValue(row.values[column.key], column.decimals)}
                        </td>
                      ))}
                      {resultById.size > 0 && (
                        <td dir="ltr" className="sa-ml-ms__predicted">
                          {result ? (
                            <>
                              {formatValue(result.predicted, 2)}
                              {/* Le signe n'est JAMAIS seul à porter l'information (§33). */}
                              <span className="sa-ml-ms__verdict">
                                {result.matches
                                  ? t('tools.measurement.test.match')
                                  : t('tools.measurement.test.mismatch')}
                              </span>
                            </>
                          ) : '—'}
                        </td>
                      )}
                      <td>
                        <button
                          type="button"
                          className="sa-ml-ms__iconBtn"
                          onClick={() => onRemove(row.id)}
                          aria-label={`${t('tools.measurement.observations.remove')} — ${t('tools.measurement.observations.rowLabel', { index: index + 1 })}`}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="sa-ml-ms__compare">{t('tools.measurement.observations.compare')}</p>
          <p className="sa-ml-ms__compareHint">{t('tools.measurement.observations.compareHint')}</p>

          <button type="button" className="sa-ml-ms__ghostBtn" onClick={onClear}>
            {t('tools.measurement.observations.clear')}
          </button>
        </>
      )}
    </section>
  );
}
