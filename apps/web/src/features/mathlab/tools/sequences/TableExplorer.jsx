import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatTerm, termName } from './sequenceFormat.js';

/**
 * LE TABLEAU (§17) — n, uₙ, uₙ₊₁, la différence, le rapport.
 *
 * §17 veut que les colonnes se montrent et se cachent, parce que c'est en
 * comparant deux colonnes qu'on DÉCOUVRE la nature d'une suite : la colonne
 * des différences constante dit « arithmétique », celle des rapports constante
 * dit « géométrique ». Le tableau n'est donc pas un pense-bête de valeurs :
 * c'est l'instrument de la découverte de §41.
 *
 * ── Ce que ce composant ne fait pas ──────────────────────────────────────
 * Aucun calcul. Différences, rapports et sommes arrivent déjà calculés par
 * `sequenceModel.buildModel` (§46). Il ne fait que les disposer et les rendre
 * lisibles.
 *
 * ── RTL ──────────────────────────────────────────────────────────────────
 * Les en-têtes sont de l'arabe et suivent la page ; les NOMBRES et la notation
 * (`uₙ₊₁ − uₙ`) sont de la notation et vivent en `dir="ltr"` (§44). Le tableau
 * lui-même est un tableau arabe : sa première colonne est à droite.
 */
export default function TableExplorer({ terms, deltas, quotients, sums, secondDeltas, layers, cursor, onPickIndex }) {
  const { t } = useTranslation('mathlab');

  // Un index par n : lire une ligne ne doit pas coûter un parcours de liste.
  const byIndex = useMemo(() => {
    const deltaMap = new Map(deltas.map((row) => [row.n, row]));
    const ratioMap = new Map(quotients.map((row) => [row.n, row]));
    const sumMap = new Map(sums.map((row) => [row.n, row]));
    const secondMap = new Map(secondDeltas.map((row) => [row.n, row]));

    return { deltaMap, ratioMap, sumMap, secondMap };
  }, [deltas, quotients, sums, secondDeltas]);

  const showDelta = layers.differences;
  const showRatio = layers.ratios;
  const showSum = layers.sums;
  const showSecond = layers.secondDifferences;

  if (!terms.length) {
    return <p className="sa-ml-seq__empty" data-ml-seq-table-empty>{t('tools.sequences.table.empty')}</p>;
  }

  return (
    <div className="sa-ml-seq__tablewrap" data-ml-seq-table>
      <table className="sa-ml-seq__table">
        <caption className="sa-ml-seq__tablecaption">{t('tools.sequences.table.caption')}</caption>
        <thead>
          <tr>
            <th scope="col"><span dir="ltr">n</span></th>
            <th scope="col"><span dir="ltr">uₙ</span></th>
            {showDelta && (
              <th scope="col" title={t('tools.sequences.table.differenceHint')}>
                <span dir="ltr">uₙ₊₁ − uₙ</span>
              </th>
            )}
            {showSecond && (
              <th scope="col" title={t('tools.sequences.table.secondDifferenceHint')}>
                <span dir="ltr">Δ²</span>
              </th>
            )}
            {showRatio && (
              <th scope="col" title={t('tools.sequences.table.ratioHint')}>
                <span dir="ltr">uₙ₊₁ / uₙ</span>
              </th>
            )}
            {showSum && (
              <th scope="col" title={t('tools.sequences.table.sumHint')}>
                <span dir="ltr">Sₙ</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {terms.map((term) => {
            const current = term.n === cursor;
            const delta = byIndex.deltaMap.get(term.n);
            const ratio = byIndex.ratioMap.get(term.n);
            const sum = byIndex.sumMap.get(term.n);
            const second = byIndex.secondMap.get(term.n);

            return (
              <tr
                key={term.n}
                className={current ? 'sa-ml-seq__row--current' : undefined}
                // §43 : l'état courant ne se dit pas par la couleur seule.
                aria-current={current ? 'true' : undefined}
                data-ml-seq-row={term.n}
              >
                <th scope="row">
                  <button
                    type="button"
                    className="sa-ml-seq__rowbtn"
                    onClick={() => onPickIndex?.(term.n)}
                    aria-label={t('tools.sequences.table.goToTerm', { name: termName(term.n) })}
                    data-ml-seq-rowbtn={term.n}
                  >
                    <span dir="ltr">{term.n}</span>
                  </button>
                </th>
                <td><span dir="ltr" className="sa-ml-seq__num">{formatTerm(term.value)}</span></td>
                {showDelta && (
                  <td data-ml-seq-delta={term.n}>
                    <span dir="ltr" className="sa-ml-seq__num">{delta ? formatTerm(delta.value) : '—'}</span>
                  </td>
                )}
                {showSecond && (
                  <td>
                    <span dir="ltr" className="sa-ml-seq__num">{second ? formatTerm(second.value) : '—'}</span>
                  </td>
                )}
                {showRatio && (
                  <td data-ml-seq-ratio={term.n}>
                    <span dir="ltr" className="sa-ml-seq__num">
                      {/* Un terme nul n'a pas de rapport : on écrit « — », jamais l'infini (§35). */}
                      {ratio && ratio.defined ? formatTerm(ratio.value) : '—'}
                    </span>
                  </td>
                )}
                {showSum && (
                  <td>
                    <span dir="ltr" className="sa-ml-seq__num">{sum ? formatTerm(sum.value) : '—'}</span>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
