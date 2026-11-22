import { useTranslation } from 'react-i18next';
import MathText from '../../../../lessons/common/components/MathText';
import { formatValue } from '../functionGrapher/grapherFormat.js';
import { PARAM_SYMBOLS, getShape } from './geometryState.js';
import { FORMULAS, faceAreaOf, faceKinds, measuresOf, substitutedFormulas } from './geometryCalculations.js';

/**
 * Les mesures du solide : ses dimensions, son volume et son aire totale —
 * la formule générale, la formule avec les valeurs, le résultat. C'est
 * aussi la représentation TEXTUELLE complète du solide : ce que la fenêtre
 * 3D montre, ce bloc le dit, pour un lecteur d'écran comme pour un élève
 * qui veut vérifier son calcul. Il se met à jour à chaque dimension.
 */
export default function GeometryInfo({ shape, dimensions, selectedFace }) {
  const { t } = useTranslation('mathlab');
  const spec = getShape(shape);
  const measures = measuresOf(shape, dimensions);
  const general = FORMULAS[shape];
  const substituted = substitutedFormulas(shape, dimensions);
  const faceKind = selectedFace === null ? null : faceKinds(shape)[selectedFace] ?? null;
  const faceArea = faceKind ? faceAreaOf(shape, dimensions, selectedFace) : NaN;

  return (
    <div className="sa-ml-g3d__info" aria-live="polite" data-ml-g3d-info>
      <p className="sa-ml-g3d__info-shape" data-ml-g3d-info-shape>{t(`tools.geometry3d.shapes.${shape}`)}</p>
      <dl className="sa-ml-g3d__info-list">
        {spec.params.map((param) => (
          <div key={param} className="sa-ml-g3d__info-row">
            <dt>{t(`tools.geometry3d.params.${param}`)}</dt>
            <dd dir="ltr" data-ml-g3d-info-dim={param}>{PARAM_SYMBOLS[param]} = {formatValue(dimensions[param], 2)}</dd>
          </div>
        ))}
        {measures.slant !== null && (
          <div className="sa-ml-g3d__info-row">
            <dt>{t('tools.geometry3d.slant')}</dt>
            <dd>
              <MathText className="sa-ml-g3d__formula">{`$${general.slant}$`}</MathText>
              <span dir="ltr" className="sa-ml-g3d__value" data-ml-g3d-slant>l = {formatValue(measures.slant, 2)}</span>
            </dd>
          </div>
        )}
        <div className="sa-ml-g3d__info-row sa-ml-g3d__info-row--measure">
          <dt>{t('tools.geometry3d.volume')}</dt>
          <dd>
            <MathText className="sa-ml-g3d__formula">{`$${general.volume}$`}</MathText>
            <MathText className="sa-ml-g3d__formula sa-ml-g3d__formula--values">{`$${substituted.volume}$`}</MathText>
            <span className="sa-ml-g3d__result">
              <span dir="ltr" className="sa-ml-g3d__value" data-ml-g3d-volume>V = {formatValue(measures.volume, 2)}</span>
              {' '}{t('tools.geometry3d.units.volume')}
            </span>
          </dd>
        </div>
        <div className="sa-ml-g3d__info-row sa-ml-g3d__info-row--measure">
          <dt>{t('tools.geometry3d.surface')}</dt>
          <dd>
            <MathText className="sa-ml-g3d__formula">{`$${general.surface}$`}</MathText>
            <MathText className="sa-ml-g3d__formula sa-ml-g3d__formula--values">{`$${substituted.surface}$`}</MathText>
            <span className="sa-ml-g3d__result">
              <span dir="ltr" className="sa-ml-g3d__value" data-ml-g3d-surface>A = {formatValue(measures.surface, 2)}</span>
              {' '}{t('tools.geometry3d.units.area')}
            </span>
          </dd>
        </div>
      </dl>
      <p className="sa-ml-g3d__face" data-ml-g3d-face={faceKind ?? 'none'}>
        {faceKind ? (
          <>
            <span className="sa-ml-g3d__face-name">{t(`tools.geometry3d.faces.${faceKind}`, { n: selectedFace + 1 })}</span>
            {' — '}
            <span dir="ltr" className="sa-ml-g3d__value">A = {formatValue(faceArea, 2)}</span>
            {' '}{t('tools.geometry3d.units.area')}
          </>
        ) : t('tools.geometry3d.selectHint')}
      </p>
    </div>
  );
}
