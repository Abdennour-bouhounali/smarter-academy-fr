import { useTranslation } from 'react-i18next';
import {
  Plus, MoveUpRight, Minus, X as XIcon, Split, Milestone, Triangle, FlaskConical, SlidersHorizontal,
} from 'lucide-react';
import { EXPERIMENTS } from './experiments.js';
import { ANALYSIS_KINDS } from './vectorState.js';
import VectorColumn from './VectorColumn.jsx';
import { formatValue } from './vectorFormat.js';

/**
 * LES COMMANDES : créer, combiner, analyser, explorer.
 *
 * Chaque commande dit ce dont elle a besoin et se DÉSACTIVE tant qu'elle ne
 * l'a pas — « ⃗AB » attend deux points, « u + v » attend deux أشعة. Rien ne
 * s'ouvre sur un dialogue qui demanderait « quels objets ? » : l'élève
 * sélectionne dans le plan, puis la commande devient cliquable. C'est le
 * geste du laboratoire, pas celui d'un formulaire.
 */
export default function VectorControls({
  selection, counts, limits, settings, experiment, explorer, explorerVector,
  onAddPoint, onAddVector, onCreateAB, onCombine, onScale, onMidpoint, onTranslate,
  onMakePolygon, onTranslatePolygon, onToggleSetting, onAnalysis, onExperiment,
  onExplorerComponent, onToggleExplorer, features = null,
}) {
  // Le مخبر (scope.js) : sans k·u ni analyse avancée au collège.
  const canScale = features?.scale !== false;
  const analysisKinds = features?.analysis ?? ANALYSIS_KINDS;
  const experiments = features?.experiments ?? EXPERIMENTS;
  const { t } = useTranslation('mathlab');
  const twoPoints = selection.points.length === 2;
  const threePoints = selection.points.length === 3;
  const onePoint = selection.points.length === 1;
  const oneVector = selection.vectors.length === 1;
  const twoVectors = selection.vectors.length === 2;
  const pointRoom = counts.points < limits.points;
  const vectorRoom = counts.vectors < limits.vectors;

  return (
    <div className="sa-ml-vec__controls">
      {/* ── Créer ─────────────────────────────────────────────────────── */}
      <section className="sa-ml-vec__section">
        <h3 className="sa-ml-vec__heading">{t('tools.vectors.createHeading')}</h3>
        <div className="sa-ml-vec__actions">
          <button type="button" className="sa-ml-btn sa-ml-vec__action" onClick={onAddPoint} disabled={!pointRoom} data-ml-add-point>
            <Plus size={15} aria-hidden="true" />
            {t('tools.vectors.addPoint')}
          </button>
          <button type="button" className="sa-ml-btn sa-ml-vec__action" onClick={onAddVector} disabled={!vectorRoom} data-ml-add-vector>
            <MoveUpRight size={15} aria-hidden="true" />
            {t('tools.vectors.addFreeVector')}
          </button>
          <button type="button" className="sa-ml-btn sa-ml-vec__action" onClick={onCreateAB} disabled={!twoPoints || !vectorRoom} data-ml-create-ab>
            <Milestone size={15} aria-hidden="true" />
            {t('tools.vectors.createAB')}
          </button>
        </div>
        <p className="sa-ml-vec__hint">{t('tools.vectors.createHint')}</p>
      </section>

      {/* ── Opérer (§11–§14) ──────────────────────────────────────────── */}
      <section className="sa-ml-vec__section">
        <h3 className="sa-ml-vec__heading">{t('tools.vectors.operateHeading')}</h3>
        <div className="sa-ml-vec__actions">
          <button type="button" className="sa-ml-btn sa-ml-vec__action" onClick={() => onCombine('sum', 'tipToTail')} disabled={!twoVectors || !vectorRoom} data-ml-sum>
            <Plus size={15} aria-hidden="true" />
            {t('tools.vectors.sum')}
          </button>
          <button type="button" className="sa-ml-btn sa-ml-vec__action" onClick={() => onCombine('sum', 'parallelogram')} disabled={!twoVectors || !vectorRoom} data-ml-parallelogram>
            <Split size={15} aria-hidden="true" />
            {t('tools.vectors.parallelogram')}
          </button>
          <button type="button" className="sa-ml-btn sa-ml-vec__action" onClick={() => onCombine('difference', 'tipToTail')} disabled={!twoVectors || !vectorRoom} data-ml-difference>
            <Minus size={15} aria-hidden="true" />
            {t('tools.vectors.difference')}
          </button>
          {canScale && (
          <button type="button" className="sa-ml-btn sa-ml-vec__action" onClick={onScale} disabled={!oneVector || !vectorRoom} data-ml-scale>
            <XIcon size={15} aria-hidden="true" />
            {t('tools.vectors.scale')}
          </button>
          )}
        </div>
      </section>

      {/* ── Construire (§16–§18) ──────────────────────────────────────── */}
      <section className="sa-ml-vec__section">
        <h3 className="sa-ml-vec__heading">{t('tools.vectors.buildHeading')}</h3>
        <div className="sa-ml-vec__actions">
          <button type="button" className="sa-ml-btn sa-ml-vec__action" onClick={onMidpoint} disabled={!twoPoints || !pointRoom} data-ml-midpoint>
            {t('tools.vectors.midpointAction')}
          </button>
          <button type="button" className="sa-ml-btn sa-ml-vec__action" onClick={onTranslate} disabled={!(onePoint && oneVector) || !pointRoom} data-ml-translate>
            {t('tools.vectors.translateAction')}
          </button>
          <button type="button" className="sa-ml-btn sa-ml-vec__action" onClick={onMakePolygon} disabled={!threePoints} data-ml-polygon>
            <Triangle size={15} aria-hidden="true" />
            {t('tools.vectors.polygonAction')}
          </button>
          <button type="button" className="sa-ml-btn sa-ml-vec__action" onClick={onTranslatePolygon} disabled={!(counts.polygons > 0 && oneVector)} data-ml-translate-polygon>
            {t('tools.vectors.translatePolygonAction')}
          </button>
        </div>
        <p className="sa-ml-vec__hint">{t('tools.vectors.buildHint')}</p>
      </section>

      {/* ── Le mode paramétré (§26) ───────────────────────────────────── */}
      <section className="sa-ml-vec__section">
        <div className="sa-ml-vec__sectionhead">
          <h3 className="sa-ml-vec__heading">{t('tools.vectors.explorerHeading')}</h3>
          <button
            type="button"
            className="sa-ml-btn sa-ml-btn--icon"
            onClick={onToggleExplorer}
            aria-pressed={Boolean(explorer)}
            aria-label={t('tools.vectors.explorerToggle')}
            title={t('tools.vectors.explorerToggle')}
            disabled={!explorer && !oneVector}
            data-ml-explorer-toggle
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
          </button>
        </div>
        {explorer && explorerVector ? (
          <div className="sa-ml-vec__explorer" data-ml-explorer>
            <p className="sa-ml-vec__explorerformula" dir="ltr">
              <VectorColumn vector={explorerVector.components} decimals={1} name={explorerVector.name} />
            </p>
            <ComponentSlider
              axis="x"
              label={t('tools.vectors.explorerX', { name: explorerVector.name })}
              value={explorerVector.components.x}
              onChange={(value) => onExplorerComponent('x', value)}
            />
            <ComponentSlider
              axis="y"
              label={t('tools.vectors.explorerY', { name: explorerVector.name })}
              value={explorerVector.components.y}
              onChange={(value) => onExplorerComponent('y', value)}
            />
          </div>
        ) : (
          <p className="sa-ml-vec__hint">{t('tools.vectors.explorerHint')}</p>
        )}
      </section>

      {/* ── Lire et analyser (§21–§24) ────────────────────────────────── */}
      <section className="sa-ml-vec__section">
        <h3 className="sa-ml-vec__heading">{t('tools.vectors.readHeading')}</h3>
        <div className="sa-ml-vec__toggles">
          <label className="sa-ml-vec__toggle">
            <input type="checkbox" checked={settings.showLengths} onChange={() => onToggleSetting('showLengths')} data-ml-toggle-lengths />
            <span>{t('tools.vectors.showLengths')}</span>
          </label>
          <label className="sa-ml-vec__toggle">
            <input type="checkbox" checked={settings.showAngles} onChange={() => onToggleSetting('showAngles')} data-ml-toggle-angles />
            <span>{t('tools.vectors.showAngles')}</span>
          </label>
          <label className="sa-ml-vec__toggle">
            <input type="checkbox" checked={settings.snap} onChange={() => onToggleSetting('snap')} data-ml-toggle-snap />
            <span>{t('tools.vectors.snap')}</span>
          </label>
        </div>
        {analysisKinds.length > 1 && (
        <label className="sa-ml-vec__field">
          <span className="sa-ml-vec__fieldlabel">{t('tools.vectors.analysisLabel')}</span>
          <select
            className="sa-ml-vec__select"
            value={settings.analysis}
            onChange={(event) => onAnalysis(event.target.value)}
            data-ml-analysis
          >
            {analysisKinds.map((kind) => (
              <option key={kind} value={kind}>{t(`tools.vectors.analysisKinds.${kind}`)}</option>
            ))}
          </select>
        </label>
        )}
      </section>

      {/* ── Les expériences (§27) ─────────────────────────────────────── */}
      <section className="sa-ml-vec__section">
        <h3 className="sa-ml-vec__heading">
          <FlaskConical size={15} aria-hidden="true" />
          {t('tools.vectors.experimentsHeading')}
        </h3>
        <div className="sa-ml-vec__chips" role="group" aria-label={t('tools.vectors.experimentsHeading')}>
          {experiments.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={`sa-ml-vec__chip${experiment === entry.id ? ' sa-ml-vec__chip--on' : ''}`}
              onClick={() => onExperiment(entry.id)}
              aria-pressed={experiment === entry.id}
              data-ml-experiment={entry.id}
            >
              {t(entry.labelKey)}
            </button>
          ))}
        </div>
        <p className="sa-ml-vec__hint">{t('tools.vectors.experimentsHint')}</p>
      </section>
    </div>
  );
}

/** Un curseur de composante (§26) : de −5 à 5, au demi. */
function ComponentSlider({ axis, label, value, onChange }) {
  return (
    <div className="sa-ml-vec__componentslider">
      <label className="sa-ml-vec__sliderlabel" htmlFor={`sa-ml-vec-comp-${axis}`} dir="ltr">
        {`${axis} = ${formatValue(value, 1)}`}
      </label>
      <input
        id={`sa-ml-vec-comp-${axis}`}
        className="sa-ml-vec__slider"
        type="range"
        min={-5}
        max={5}
        step={0.5}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
        data-ml-explorer-slider={axis}
      />
    </div>
  );
}
