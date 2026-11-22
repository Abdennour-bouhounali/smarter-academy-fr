import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Check, X } from 'lucide-react';
import {
  analyzeProportionality, ratioShare,
} from './proportion.js';
import { fracToText } from './fraction.js';
import { formatNumber } from './numberValue.js';
import { MAX_ROWS } from './numberState.js';
import { LabPanel } from '../../shared/LabKit.jsx';

/**
 * §17 à §19 — LA TANĀSUBIYYA : le tableau, le graphique, le rapport.
 *
 * Le verdict est immédiat et il est EXACT (`analyzeProportionality` compare
 * des produits croisés, jamais des quotients flottants). Mieux : quand le
 * tableau n'est pas proportionnel, la colonne fautive est DÉSIGNÉE et sa
 * mauvaise valeur affichée à côté de celle qu'il faudrait — §53 appliqué à la
 * proportionnalité, où l'erreur est presque toujours dans une seule case.
 *
 * §18 : le graphique n'est pas une illustration. Dans une situation
 * proportionnelle les points sont alignés AVEC L'ORIGINE, et c'est cet
 * alignement qui est la signature. On peut tirer un point : le tableau suit.
 */
export default function ProportionMode({ state, onChange, compact }) {
  const { t } = useTranslation('mathlab');
  const rows = state.rows;
  const [ratioA, setRatioA] = useState(2);
  const [ratioB, setRatioB] = useState(3);
  const [total, setTotal] = useState(100);

  const analysis = useMemo(() => analyzeProportionality(rows), [rows]);

  const setCell = useCallback((index, key, raw) => {
    const value = Number(String(raw).replace(',', '.'));
    if (!Number.isFinite(value)) return;
    onChange({ rows: rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)) });
  }, [rows, onChange]);

  const addColumn = useCallback(() => {
    if (rows.length >= MAX_ROWS) return;
    const last = rows[rows.length - 1] ?? { x: 0, y: 0 };
    const x = last.x + (rows.length > 1 ? last.x - rows[rows.length - 2].x : 2);
    const y = analysis.coefficient !== null ? x * analysis.coefficient : last.y;
    onChange({ rows: [...rows, { x, y }] });
  }, [rows, onChange, analysis.coefficient]);

  const removeColumn = useCallback((index) => {
    if (rows.length <= 2) return;
    onChange({ rows: rows.filter((_, i) => i !== index) });
  }, [rows, onChange]);

  const share = useMemo(() => ratioShare(ratioA, ratioB, total), [ratioA, ratioB, total]);

  return (
    <div className="sa-ml-nb__mode sa-ml-nb__mode--proportion">
      <h3 className="sa-ml-nb__heading">{t('tools.numberLab.proportion.heading')}</h3>
      <p className="sa-ml-nb__hint">{t('tools.numberLab.proportion.hint')}</p>

      {/* §17 : le tableau, modifiable case par case. */}
      <div className="sa-ml-nb__table-wrap">
        <table className="sa-ml-nb__table sa-ml-nb__table--editable" dir="ltr">
          <tbody>
            <tr>
              <th scope="row">{t('tools.numberLab.proportion.columnX')}</th>
              {rows.map((row, index) => (
                <td key={`x-${index}`}>
                  <input
                    type="text" inputMode="decimal" dir="ltr"
                    className="sa-ml-nb__cell-input"
                    defaultValue={formatNumber(row.x, 6)}
                    onBlur={(event) => setCell(index, 'x', event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
                    aria-label={`x ${index + 1}`}
                  />
                </td>
              ))}
              <td rowSpan={3} className="sa-ml-nb__table-actions">
                <button
                  type="button" className="sa-ml-nb__mini" onClick={addColumn}
                  disabled={rows.length >= MAX_ROWS}
                  aria-label={t('tools.numberLab.proportion.addColumn')}
                >
                  <Plus size={14} aria-hidden="true" />
                </button>
              </td>
            </tr>
            <tr>
              <th scope="row">{t('tools.numberLab.proportion.columnY')}</th>
              {rows.map((row, index) => (
                <td key={`y-${index}`} className={analysis.failures.includes(index) ? 'is-failure' : undefined}>
                  <input
                    type="text" inputMode="decimal" dir="ltr"
                    className="sa-ml-nb__cell-input"
                    defaultValue={formatNumber(row.y, 6)}
                    onBlur={(event) => setCell(index, 'y', event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
                    aria-label={`y ${index + 1}`}
                    aria-invalid={analysis.failures.includes(index) ? 'true' : undefined}
                  />
                </td>
              ))}
            </tr>
            <tr className="sa-ml-nb__ratio-row">
              <th scope="row">{t('tools.numberLab.proportion.ratio')}</th>
              {analysis.ratios.map((ratio, index) => (
                <td key={`r-${index}`} className={analysis.failures.includes(index) ? 'is-failure' : undefined}>
                  {ratio === null ? '—' : formatNumber(ratio, 6)}
                  {rows.length > 2 && (
                    <button
                      type="button" className="sa-ml-nb__tiny sa-ml-nb__tiny--remove"
                      onClick={() => removeColumn(index)}
                      aria-label={t('tools.numberLab.proportion.removeColumn')}
                    >
                      <Trash2 size={11} aria-hidden="true" />
                    </button>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Le verdict, et la case fautive DÉSIGNÉE. */}
      {/* « D'un seul regard » (MATH_LAB §3.5) : le graphique et son verdict CÔTE À CÔTE. */}
      <div className="sa-ml-nb__duo sa-ml-nb__duo--proportion" dir="ltr">
        <div className="sa-ml-nb__duo-figure">
          {/* §18 : le graphique — l'alignement AVEC l'origine est la signature. */}
          <ProportionGraph
            rows={rows}
            proportional={analysis.proportional}
            coefficient={analysis.coefficient}
            onDrag={(index, y) => setCell(index, 'y', y)}
            compact={compact}
          />
        </div>
        <div className="sa-ml-nb__duo-board">
          <section className={`sa-ml-nb__panel sa-ml-nb__panel--${analysis.proportional ? 'increase' : 'decrease'}`}>
            <h4 className="sa-ml-nb__change-head">
              {analysis.proportional ? <Check size={18} aria-hidden="true" /> : <X size={18} aria-hidden="true" />}
              {analysis.proportional
                ? t('tools.numberLab.proportion.isProportional')
                : t('tools.numberLab.proportion.isNotProportional')}
            </h4>
            {analysis.proportional ? (
              <>
                <p className="sa-ml-nb__formula sa-ml-nb__formula--big" dir="ltr">
                  y = {formatNumber(analysis.coefficient, 6)} × x
                </p>
                <p className="sa-ml-nb__muted">
                  {t('tools.numberLab.proportion.coefficientHint', { value: formatNumber(analysis.coefficient, 6) })}
                  {analysis.coefficientFraction && ` (${fracToText(analysis.coefficientFraction)})`}
                </p>
              </>
            ) : (
              analysis.failures.map((index) => (
                <p key={index} className="sa-ml-nb__muted">
                  {rows[index]?.x === 0
                    ? t('tools.numberLab.proportion.zeroHint')
                    : t('tools.numberLab.proportion.failureHint', {
                      index: index + 1,
                      ratio: formatNumber(analysis.ratios[index], 6),
                      expected: formatNumber(analysis.ratios.find((r, i) => r !== null && !analysis.failures.includes(i)) ?? 0, 6),
                    })}
                </p>
              ))
            )}
          </section>
        </div>
      </div>

      {/* §19 : le rapport et le partage. */}
      <LabPanel id="numberLab.proportion.ratio" title={t('tools.numberLab.proportion.ratioExplorer')}>
        <div className="sa-ml-nb__row sa-ml-nb__row--wrap">
          <label className="sa-ml-nb__field">
            <span className="sa-ml-nb__label">a</span>
            <input
              type="number" min={0} className="sa-ml-nb__input" dir="ltr" value={ratioA}
              onChange={(event) => setRatioA(Math.max(0, Number(event.target.value) || 0))}
            />
          </label>
          <label className="sa-ml-nb__field">
            <span className="sa-ml-nb__label">b</span>
            <input
              type="number" min={0} className="sa-ml-nb__input" dir="ltr" value={ratioB}
              onChange={(event) => setRatioB(Math.max(0, Number(event.target.value) || 0))}
            />
          </label>
          <label className="sa-ml-nb__field">
            <span className="sa-ml-nb__label">{t('tools.numberLab.percent.quantity')}</span>
            <input
              type="number" className="sa-ml-nb__input" dir="ltr" value={total}
              onChange={(event) => setTotal(Number(event.target.value) || 0)}
            />
          </label>
        </div>

        {share && (
          <>
            <p className="sa-ml-nb__formula" dir="ltr">
              {t('tools.numberLab.proportion.ratioLabel', { a: ratioA, b: ratioB })}
              {(share.simplified[0] !== ratioA || share.simplified[1] !== ratioB) && (
                ` — ${t('tools.numberLab.proportion.ratioSimplified', { a: share.simplified[0], b: share.simplified[1] })}`
              )}
            </p>
            {share.parts && (
              <>
                <div className="sa-ml-nb__ratio-bars" dir="ltr">
                  <span
                    className="sa-ml-nb__ratio-bar sa-ml-nb__ratio-bar--a"
                    style={{ flexGrow: ratioA || 0.001 }}
                  >
                    {formatNumber(share.parts[0], 4)}
                  </span>
                  <span
                    className="sa-ml-nb__ratio-bar sa-ml-nb__ratio-bar--b"
                    style={{ flexGrow: ratioB || 0.001 }}
                  >
                    {formatNumber(share.parts[1], 4)}
                  </span>
                </div>
                <p className="sa-ml-nb__muted">
                  {t('tools.numberLab.proportion.unitValue')} : <bdi dir="ltr">{formatNumber(share.unit, 6)}</bdi>
                </p>
              </>
            )}
          </>
        )}
        <p className="sa-ml-nb__muted">{t('tools.numberLab.proportion.scaleHint')}</p>
      </LabPanel>
    </div>
  );
}

/**
 * §18 — LE GRAPHIQUE. Un repère simple, propre au mode : le grapheur complet
 * (mafs, parseur, échantillonnage) serait hors de proportion pour huit points
 * et une droite, et §66 demande de ne pas charger une infrastructure lourde
 * quand une légère suffit.
 */
function ProportionGraph({ rows, proportional, coefficient, onDrag, compact }) {
  const { t } = useTranslation('mathlab');
  const svgRef = useRef(null);
  const dragRef = useRef(null);
  const width = compact ? 300 : 460;
  const height = compact ? 220 : 280;
  const pad = 40;

  const maxX = Math.max(1, ...rows.map((r) => Math.abs(r.x)));
  const maxY = Math.max(1, ...rows.map((r) => Math.abs(r.y)));
  const toX = (x) => pad + (x / maxX) * (width - pad * 1.5);
  const toY = (y) => height - pad - (y / maxY) * (height - pad * 1.6);

  const handleMove = useCallback((event) => {
    const index = dragRef.current;
    if (index === null || index === undefined) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const y = ((height - pad - ((event.clientY - rect.top) / rect.height) * height) / (height - pad * 1.6)) * maxY;
    onDrag(index, Math.max(0, Math.round(y * 100) / 100));
  }, [onDrag, maxY, height]);

  return (
    <figure className="sa-ml-nb__graph">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label={t('tools.numberLab.proportion.graphLabel', { count: rows.length })}
        onPointerMove={handleMove}
        onPointerUp={() => { dragRef.current = null; }}
        onPointerLeave={() => { dragRef.current = null; }}
      >
        {/* Les axes. */}
        <line x1={pad} y1={height - pad} x2={width - pad / 2} y2={height - pad} className="sa-ml-nb__axis" />
        <line x1={pad} y1={height - pad} x2={pad} y2={pad / 2} className="sa-ml-nb__axis" />
        <text x={width - pad / 2} y={height - pad + 18} className="sa-ml-nb__tick-label" textAnchor="end">x</text>
        <text x={pad - 10} y={pad / 2 + 4} className="sa-ml-nb__tick-label" textAnchor="end">y</text>

        {/* La droite de proportionnalité : elle PASSE par l'origine. */}
        {proportional && coefficient !== null && (
          <line
            x1={toX(0)} y1={toY(0)}
            x2={toX(maxX)} y2={toY(maxX * coefficient)}
            className="sa-ml-nb__graph-line"
          />
        )}

        {rows.map((row, index) => (
          <circle
            key={index}
            cx={toX(row.x)}
            cy={toY(row.y)}
            r={7}
            className="sa-ml-nb__graph-point"
            onPointerDown={(event) => {
              dragRef.current = index;
              event.currentTarget.setPointerCapture?.(event.pointerId);
            }}
            tabIndex={0}
            role="slider"
            aria-label={t('tools.numberLab.proportion.dragPoint')}
            aria-valuenow={row.y}
            onKeyDown={(event) => {
              if (event.key === 'ArrowUp') { event.preventDefault(); onDrag(index, row.y + maxY / 40); }
              if (event.key === 'ArrowDown') { event.preventDefault(); onDrag(index, Math.max(0, row.y - maxY / 40)); }
            }}
          />
        ))}
      </svg>
      <figcaption>{t('tools.numberLab.proportion.graphHint')}</figcaption>
    </figure>
  );
}
