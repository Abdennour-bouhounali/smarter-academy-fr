import { useTranslation } from 'react-i18next';
import { Trash2, Ruler, Compass } from 'lucide-react';
import * as V from './vectorMath.js';
import VectorColumn from './VectorColumn.jsx';
import { formatPair, formatNorm, formatAngle, formatFactor, formatValue, formatSlope } from './vectorFormat.js';

/**
 * LE PANNEAU DE LECTURE (§25) : ce que l'élève LIT pendant qu'il manipule.
 *
 * « Keep it compact. » Il ne montre donc que les objets SÉLECTIONNÉS, et
 * pour chacun les trois lectures du cahier des charges — composantes, norme,
 * direction — dans cet ordre.
 *
 * Toute écriture mathématique est posée dans un îlot `dir="ltr"` (§35) ;
 * la page est elle-même LTR, l'îlot est sans effet mais inoffensif
 * (FRENCH_LANGUAGE_CONTRACT §8). Les LIBELLÉS suivent la page.
 */
export default function VectorInspector({
  vectors, points, relations, settings, onRemoveVector, onRemovePoint, onScalarChange, showFactor = true,
}) {
  const { t } = useTranslation('mathlab');

  const empty = vectors.length === 0 && points.length === 0;

  return (
    <div className="sa-ml-vec__inspector" data-ml-inspector>
      {empty && (
        <p className="sa-ml-vec__hint" data-ml-inspector-empty>{t('tools.vectors.selectHint')}</p>
      )}

      {vectors.map((vector) => {
        const reading = vector.components;
        const exact = V.exactNorm(reading);
        const norm = formatNorm(exact);

        return (
          <article key={vector.id} className="sa-ml-vec__card" data-ml-vector-card={vector.name}>
            <header className="sa-ml-vec__cardhead">
              <span className="sa-ml-vec__swatch" style={{ background: vector.source.color }} aria-hidden="true" />
              <h4 className="sa-ml-vec__cardtitle">
                <span className="sa-ml-vec__vecname" dir="ltr">
                  <span className="sa-ml-vec__arrowhat" aria-hidden="true" />
                  {vector.name}
                </span>
                <span className="sa-ml-vec__kind">{t(`tools.vectors.kinds.${vector.source.kind}`)}</span>
              </h4>
              {onRemoveVector && (
                <button
                  type="button"
                  className="sa-ml-btn sa-ml-btn--icon sa-ml-btn--danger sa-ml-vec__remove"
                  onClick={() => onRemoveVector(vector.id)}
                  aria-label={t('tools.vectors.removeObject', { name: vector.name })}
                  title={t('tools.vectors.removeObject', { name: vector.name })}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              )}
            </header>

            <dl className="sa-ml-vec__readings">
              <div className="sa-ml-vec__reading">
                <dt>{t('tools.vectors.components')}</dt>
                <dd dir="ltr" data-ml-reading="components"><VectorColumn vector={reading} /></dd>
              </div>
              <div className="sa-ml-vec__reading">
                <dt>{t('tools.vectors.norm')}</dt>
                <dd dir="ltr" data-ml-reading="norm">
                  {norm.text}
                  {norm.approx && <span className="sa-ml-vec__approx">{` ≈ ${norm.approx}`}</span>}
                </dd>
              </div>
              <div className="sa-ml-vec__reading">
                <dt>{t('tools.vectors.direction')}</dt>
                <dd dir="ltr" data-ml-reading="direction">{formatAngle(V.direction(reading))}</dd>
              </div>
            </dl>

            {/* Le curseur k (§15) : la « wow » interaction, rendue là où on lit le vecteur. */}
            {vector.source.kind === 'scaled' && (
              <ScalarSlider
                value={vector.source.k}
                name={vector.name}
                baseName={vector.baseName}
                onChange={(k) => onScalarChange(vector.id, k)}
              />
            )}
          </article>
        );
      })}

      {points.map((point) => (
        <article key={point.id} className="sa-ml-vec__card sa-ml-vec__card--point" data-ml-point-card={point.name}>
          <header className="sa-ml-vec__cardhead">
            <h4 className="sa-ml-vec__cardtitle">
              <span dir="ltr">{point.name}</span>
              <span className="sa-ml-vec__kind">{t(`tools.vectors.pointKinds.${point.kind}`)}</span>
            </h4>
            {onRemovePoint && (
              <button
                type="button"
                className="sa-ml-btn sa-ml-btn--icon sa-ml-btn--danger sa-ml-vec__remove"
                onClick={() => onRemovePoint(point.id)}
                aria-label={t('tools.vectors.removeObject', { name: point.name })}
                title={t('tools.vectors.removeObject', { name: point.name })}
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
            )}
          </header>
          <dl className="sa-ml-vec__readings">
            <div className="sa-ml-vec__reading">
              <dt>{t('tools.vectors.coordinates')}</dt>
              <dd dir="ltr" data-ml-reading="coordinates">{formatPair(point.position)}</dd>
            </div>
          </dl>
        </article>
      ))}

      {/* ── Les relations : ce qui est VRAI entre les objets choisis ─── */}
      {relations?.pair && (
        <article className="sa-ml-vec__card sa-ml-vec__card--relation" data-ml-relation-card>
          <h4 className="sa-ml-vec__cardtitle">{t('tools.vectors.relationHeading')}</h4>
          <ul className="sa-ml-vec__relations">
            {relations.pair.equal && <li data-ml-relation="equal">{t('tools.vectors.relations.equal')}</li>}
            {relations.pair.opposite && <li data-ml-relation="opposite">{t('tools.vectors.relations.opposite')}</li>}
            {relations.pair.parallel && (
              <li data-ml-relation="parallel">
                {t('tools.vectors.relations.parallel')}
                {/* v = k·u : l'écriture du lycée (scope.js) — le collège lit « colinéaires ». */}
                {showFactor && relations.pair.factor !== null && (
                  <span className="sa-ml-vec__factor" dir="ltr">
                    {` ${relations.pair.vName} = ${formatFactor(relations.pair.factor)} ${relations.pair.uName}`}
                  </span>
                )}
              </li>
            )}
            {relations.pair.perpendicular && <li data-ml-relation="perpendicular">{t('tools.vectors.relations.perpendicular')}</li>}
            {!relations.pair.parallel && !relations.pair.perpendicular && (
              <li className="sa-ml-vec__relations--none" data-ml-relation="none">{t('tools.vectors.relations.none')}</li>
            )}
            {settings.analysis === 'dot' && (
              <li data-ml-relation="dot">
                <span>{t('tools.vectors.dotProduct')}</span>
                <span dir="ltr">{` ${formatValue(relations.pair.dot)}`}</span>
              </li>
            )}
          </ul>
        </article>
      )}

      {relations?.points && (
        <article className="sa-ml-vec__card sa-ml-vec__card--relation" data-ml-measures-card>
          <h4 className="sa-ml-vec__cardtitle">
            <Ruler size={15} aria-hidden="true" />
            {t('tools.vectors.measuresHeading', { a: relations.points.aName, b: relations.points.bName })}
          </h4>
          <dl className="sa-ml-vec__readings">
            <div className="sa-ml-vec__reading">
              <dt>{t('tools.vectors.distance')}</dt>
              <dd dir="ltr" data-ml-reading="distance">
                {formatNorm(relations.points.exactDistance).text}
                {formatNorm(relations.points.exactDistance).approx && (
                  <span className="sa-ml-vec__approx">{` ≈ ${formatNorm(relations.points.exactDistance).approx}`}</span>
                )}
              </dd>
            </div>
            <div className="sa-ml-vec__reading">
              <dt>{t('tools.vectors.midpoint')}</dt>
              <dd dir="ltr" data-ml-reading="midpoint">{formatPair(relations.points.midpoint)}</dd>
            </div>
            <div className="sa-ml-vec__reading">
              <dt>{t('tools.vectors.slope')}</dt>
              <dd dir="ltr" data-ml-reading="slope">
                <SlopeReading slope={relations.points.slope} />
              </dd>
            </div>
          </dl>
        </article>
      )}

      {relations?.collinear && (
        <article className="sa-ml-vec__card sa-ml-vec__card--relation" data-ml-collinear-card>
          <h4 className="sa-ml-vec__cardtitle">
            <Compass size={15} aria-hidden="true" />
            {t('tools.vectors.collinearHeading')}
          </h4>
          <p className={`sa-ml-vec__verdict${relations.collinear.collinear ? ' sa-ml-vec__verdict--true' : ''}`} data-ml-collinear-verdict={relations.collinear.collinear ? 'true' : 'false'}>
            {relations.collinear.degenerate
              ? t('tools.vectors.collinearDegenerate')
              : t(relations.collinear.collinear ? 'tools.vectors.collinearTrue' : 'tools.vectors.collinearFalse', { names: relations.collinear.names })}
          </p>
        </article>
      )}
    </div>
  );
}

/** La pente, avec ses trois cas distincts (§20) — jamais un faux nombre. */
function SlopeReading({ slope }) {
  const { t } = useTranslation('mathlab');
  const formatted = formatSlope(slope);
  if (formatted.kind === 'vertical') return <span className="sa-ml-vec__special">{t('tools.vectors.slopeVertical')}</span>;
  if (formatted.kind === 'undefined') return <span className="sa-ml-vec__special">{t('tools.vectors.slopeUndefined')}</span>;

  return <span>{formatted.text}</span>;
}

/**
 * LE CURSEUR k (§15) : « one of the main "wow" interactions of the tool ».
 *
 * Il va de −3 à 3 par dixièmes, avec des crans repères aux entiers. Le
 * changement est CONTINU : chaque mouvement redessine k·u tout de suite,
 * sans validation (§7). Les trois états que §15 demande de faire voir —
 * renversement, étirement, vecteur nul — sont annoncés en toutes lettres
 * sous le curseur, pour que ce que l'œil voit ait un nom.
 */
function ScalarSlider({ value, name, baseName = 'u', onChange }) {
  const { t } = useTranslation('mathlab');
  const k = Number.isFinite(value) ? value : 1;
  const state = Math.abs(k) < 1e-9 ? 'zero' : k < 0 ? 'reversed' : Math.abs(k) > 1 ? 'longer' : Math.abs(k) < 1 ? 'shorter' : 'same';

  return (
    <div className="sa-ml-vec__scalar" data-ml-scalar>
      <div className="sa-ml-vec__scalarhead">
        <label className="sa-ml-vec__scalarlabel" htmlFor={`sa-ml-vec-k-${name}`} dir="ltr">
          {`k = ${formatValue(k, 2)}`}
        </label>
        <span className="sa-ml-vec__scalarformula" dir="ltr">{`${name} = k · ${baseName}`}</span>
      </div>
      <input
        id={`sa-ml-vec-k-${name}`}
        className="sa-ml-vec__slider"
        type="range"
        min={-3}
        max={3}
        step={0.1}
        value={k}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-valuetext={formatValue(k, 2)}
        data-ml-scalar-slider
      />
      <div className="sa-ml-vec__scalarticks" aria-hidden="true">
        {[-3, -2, -1, 0, 1, 2, 3].map((tick) => (
          <button
            key={tick}
            type="button"
            className={`sa-ml-vec__tick${Math.abs(k - tick) < 1e-9 ? ' sa-ml-vec__tick--on' : ''}`}
            onClick={() => onChange(tick)}
            tabIndex={-1}
          >
            {formatValue(tick, 0)}
          </button>
        ))}
      </div>
      <p className="sa-ml-vec__scalarstate" data-ml-scalar-state={state}>
        {t(`tools.vectors.scalarStates.${state}`)}
      </p>
    </div>
  );
}
