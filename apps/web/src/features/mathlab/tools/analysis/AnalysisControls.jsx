import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Square, Plus, Minus, FlaskConical } from 'lucide-react';
import MathField from './MathField.jsx';
import { PRESETS, PARAMETRIC_PRESETS, TRANSFORMATIONS } from './presets.js';
import { EXPERIMENTS } from './practice.js';
import { MIN_RIEMANN_N, MAX_RIEMANN_N, RIEMANN_MODES } from './analysisState.js';

/**
 * LE PUPITRE : ce que l'élève règle, selon le laboratoire ouvert.
 *
 * Un seul principe de mise en page, et il vient de §44 et §53 : on ne montre
 * QUE les réglages de l'expérience en cours. Le laboratoire de la sécante
 * n'affiche ni bornes d'intégration ni nombre de rectangles — ils
 * n'existent pas pour lui. C'est ce qui évite le « wall of configuration »
 * que §53 interdit, tout en gardant les sept laboratoires dans un seul
 * environnement.
 *
 * Les libellés mathématiques (`f(x) =`, `Δx`, `n`) sont enfermés dans des
 * conteneurs `dir="ltr"` : la notation garde son ordre quel que soit le texte autour
 * (§2, §39).
 */
export default function AnalysisControls({
  data, scene, reducedMotion, approaching,
  onSource, onPreset, onPoint, onSecondPoint, onLimitPoint, onBounds, onRiemann,
  onParameter, onConstant, onTransform, onToggleLayer, onAddSecond, onRemoveSecond,
  onApproach, onExperiment,
}) {
  const { t } = useTranslation('mathlab');
  const { lab } = data;

  return (
    <div className="sa-ml-an__controls" data-ml-an-controls={lab}>
      <FunctionFields
        data={data} scene={scene} onSource={onSource}
        onAddSecond={onAddSecond} onRemoveSecond={onRemoveSecond} t={t}
      />

      <Presets current={data.preset} onPreset={onPreset} t={t} />

      {(lab === 'secant') && (
        <Section title={t('tools.analysis.secant.title')}>
          <NumberSlider
            label="a" value={data.point} onChange={onPoint}
            min={-12} max={12} step={0.05} name="pointA"
          />
          <NumberSlider
            label="b" value={data.secondPoint} onChange={onSecondPoint}
            min={-12} max={12} step={0.05} name="pointB"
          />
          <button
            type="button"
            className={`sa-ml-an__action${approaching ? ' is-active' : ''}`}
            onClick={onApproach}
            data-ml-an-approach
          >
            {approaching ? <Square size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
            <span>{approaching ? t('tools.analysis.secant.approachRunning') : t('tools.analysis.secant.approach')}</span>
          </button>
          <p className="sa-ml-an__hint">{t('tools.analysis.secant.approachHint')}</p>
          {reducedMotion && (
            <p className="sa-ml-an__note" data-ml-an-reducednote>{t('tools.analysis.reducedMotionNote')}</p>
          )}
        </Section>
      )}

      {(lab === 'tangent' || lab === 'derivative') && (
        <Section title={t('tools.analysis.point.title')}>
          <NumberSlider
            label="a" value={data.point} onChange={onPoint}
            min={-12} max={12} step={0.05} name="pointA"
          />
          {lab === 'derivative' && (
            <>
              <Toggle
                label={t('tools.analysis.derivative.show')}
                checked={data.layers.derivativeCurve}
                onChange={() => onToggleLayer('derivativeCurve')}
                name="derivativeCurve"
              />
              <Toggle
                label={t('tools.analysis.derivative.showSecond')}
                checked={data.layers.secondDerivative}
                onChange={() => onToggleLayer('secondDerivative')}
                name="secondDerivative"
                disabled={!scene?.primary?.secondDerivative}
              />
              <Toggle
                label={t('tools.analysis.derivative.criticalPoints')}
                checked={data.layers.criticalPoints}
                onChange={() => onToggleLayer('criticalPoints')}
                name="criticalPoints"
              />
            </>
          )}
        </Section>
      )}

      {lab === 'limit' && (
        <Section title={t('tools.analysis.limit.title')}>
          <NumberSlider
            label={t('tools.analysis.limit.at')} value={data.limitPoint} onChange={onLimitPoint}
            min={-10} max={10} step={0.1} name="limitPoint"
          />
          <Toggle
            label={t('tools.analysis.limit.table')}
            checked={data.layers.approach}
            onChange={() => onToggleLayer('approach')}
            name="approach"
          />
          <Toggle
            label={t('tools.analysis.study.asymptotes')}
            checked={data.layers.asymptotes}
            onChange={() => onToggleLayer('asymptotes')}
            name="asymptotes"
          />
        </Section>
      )}

      {lab === 'integral' && (
        <Section title={t('tools.analysis.integral.title')}>
          <NumberSlider
            label={t('tools.analysis.integral.lowerBound')} value={data.bounds.a}
            onChange={(value) => onBounds(value, data.bounds.b)}
            min={-10} max={10} step={0.1} name="boundA"
          />
          <NumberSlider
            label={t('tools.analysis.integral.upperBound')} value={data.bounds.b}
            onChange={(value) => onBounds(data.bounds.a, value)}
            min={-10} max={10} step={0.1} name="boundB"
          />
          <Toggle
            label={t('tools.analysis.integral.riemann')}
            checked={data.layers.riemann}
            onChange={() => onToggleLayer('riemann')}
            name="riemann"
          />
          {data.layers.riemann && (
            <>
              <NumberSlider
                label={t('tools.analysis.integral.rectangles')} value={data.riemann.n}
                onChange={(value) => onRiemann({ n: Math.round(value) })}
                min={MIN_RIEMANN_N} max={MAX_RIEMANN_N} step={1} name="riemannN" integer
              />
              <div className="sa-ml-an__segmented" role="group" aria-label={t('tools.analysis.integral.mode')}>
                {RIEMANN_MODES.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={`sa-ml-an__seg${data.riemann.mode === mode ? ' is-active' : ''}`}
                    onClick={() => onRiemann({ mode })}
                    aria-pressed={data.riemann.mode === mode}
                    data-ml-an-riemann-mode={mode}
                  >
                    {t(`tools.analysis.integral.mode${mode.charAt(0).toUpperCase()}${mode.slice(1)}`)}
                  </button>
                ))}
              </div>
              <p className="sa-ml-an__hint">{t('tools.analysis.integral.riemannHint')}</p>
            </>
          )}
          <Toggle
            label={t('tools.analysis.integral.antiderivative')}
            checked={data.layers.antiderivative}
            onChange={() => onToggleLayer('antiderivative')}
            name="antiderivative"
          />
          {data.layers.antiderivative && (
            <>
              <NumberSlider
                label={t('tools.analysis.integral.constant')} value={data.constant}
                onChange={onConstant} min={-10} max={10} step={0.25} name="constant"
              />
              <p className="sa-ml-an__hint">{t('tools.analysis.integral.constantHint')}</p>
            </>
          )}
          {data.functions.length > 1 && (
            <Toggle
              label={t('tools.analysis.integral.between')}
              checked={data.layers.betweenCurves}
              onChange={() => onToggleLayer('betweenCurves')}
              name="betweenCurves"
            />
          )}
        </Section>
      )}

      {lab === 'study' && (
        <Section title={t('tools.analysis.study.title')}>
          {[
            ['roots', 'study.roots'],
            ['extrema', 'study.extrema'],
            ['increasing', 'study.variation'],
            ['signStrip', 'study.sign'],
            ['asymptotes', 'study.asymptotes'],
            ['discontinuities', 'study.discontinuities'],
          ].map(([key, label]) => (
            <Toggle
              key={key}
              label={t(`tools.analysis.${label}`)}
              checked={data.layers[key]}
              onChange={() => onToggleLayer(key)}
              name={key}
            />
          ))}
          <p className="sa-ml-an__note">{t('tools.analysis.study.windowNote')}</p>
        </Section>
      )}

      {lab === 'transform' && (
        <>
          <Section title={t('tools.analysis.transform.parameters')}>
            {['a', 'b', 'c'].map((name) => (
              <NumberSlider
                key={name}
                label={name}
                value={data.parameters[name]}
                onChange={(value) => onParameter(name, value)}
                min={-5} max={5} step={0.1} name={`param-${name}`}
              />
            ))}
            <div className="sa-ml-an__chips">
              {PARAMETRIC_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="sa-ml-an__chip"
                  onClick={() => onSource('f', preset.source)}
                  data-ml-an-parametric={preset.id}
                >
                  <span dir="ltr">{t(`tools.analysis.transform.${preset.id}`)}</span>
                </button>
              ))}
            </div>
          </Section>

          <Section title={t('tools.analysis.transform.transformations')}>
            <div className="sa-ml-an__chips">
              <button
                type="button"
                className={`sa-ml-an__chip${!data.transform ? ' is-active' : ''}`}
                onClick={() => onTransform(null)}
              >
                {t('tools.analysis.transform.none')}
              </button>
              {TRANSFORMATIONS.map((transformation) => (
                <button
                  key={transformation.id}
                  type="button"
                  className={`sa-ml-an__chip${data.transform?.id === transformation.id ? ' is-active' : ''}`}
                  onClick={() => onTransform({ id: transformation.id, value: transformation.defaultValue })}
                  data-ml-an-transform={transformation.id}
                >
                  <span dir="ltr">{t(`tools.analysis.transform.${transformation.id}`)}</span>
                </button>
              ))}
            </div>
            {data.transform && (
              <>
                <NumberSlider
                  label={t('tools.analysis.transform.amount')}
                  value={data.transform.value}
                  onChange={(value) => onTransform({ id: data.transform.id, value })}
                  min={-5} max={5} step={0.1} name="transformValue"
                />
                <Toggle
                  label={t('tools.analysis.transform.showOriginal')}
                  checked={data.layers.original}
                  onChange={() => onToggleLayer('original')}
                  name="original"
                />
              </>
            )}
          </Section>
        </>
      )}

      {data.functions.length > 1 && (
        <Section title={t('tools.analysis.transform.intersections')}>
          <Toggle
            label={t('tools.analysis.transform.intersections')}
            checked={data.layers.intersections}
            onChange={() => onToggleLayer('intersections')}
            name="intersections"
          />
          <p className="sa-ml-an__hint">{t('tools.analysis.transform.intersectionHint')}</p>
        </Section>
      )}

      <Experiments lab={lab} onExperiment={onExperiment} t={t} />
    </div>
  );
}

/** Les champs d'expression (§36) — la saisie de l'élève, jamais exécutée. */
function FunctionFields({ data, onSource, onAddSecond, onRemoveSecond, t }) {
  return (
    <section className="sa-ml-an__section">
      <h3 className="sa-ml-an__sectiontitle">{t('tools.analysis.functionPanel.title')}</h3>
      {data.functions.map((entry) => (
        <ExpressionField
          key={entry.id}
          id={entry.id}
          value={entry.source}
          color={entry.color}
          onCommit={(next) => onSource(entry.id, next)}
          label={t(`tools.analysis.functionPanel.${entry.id}`)}
          t={t}
        />
      ))}
      {data.functions.length < 2 ? (
        <button type="button" className="sa-ml-an__action" onClick={onAddSecond} data-ml-an-add-second>
          <Plus size={16} aria-hidden="true" />
          <span>{t('tools.analysis.functionPanel.addSecond')}</span>
        </button>
      ) : (
        <button type="button" className="sa-ml-an__action" onClick={onRemoveSecond} data-ml-an-remove-second>
          <Minus size={16} aria-hidden="true" />
          <span>{t('tools.analysis.functionPanel.removeSecond')}</span>
        </button>
      )}
    </section>
  );
}

/**
 * UN champ d'expression — un vrai champ MATHÉMATIQUE (MathLive).
 *
 * L'élève y voit `1/x` s'afficher comme une fraction empilée et `√x` sous un
 * radical, au lieu d'une ligne de LaTeX. Sur téléphone, le clavier virtuel
 * lui donne x, les puissances, la racine et la fraction sous le pouce —
 * saisir `\frac{x^2-1}{x-1}` au clavier système était une épreuve.
 *
 * La valeur ne remonte qu'à la VALIDATION (Entrée ou perte de focus), jamais
 * à chaque frappe : sans cela, chaque lettre relancerait l'analyse, le
 * balayage et la sauvegarde — et « x^ » à mi-frappe afficherait une erreur
 * sous les doigts de l'élève (§46, §47). C'est `MathField` qui tient cette
 * règle, pour tous les champs à la fois.
 */
function ExpressionField({ id, value, color, onCommit, label, t }) {
  return (
    <div className="sa-ml-an__field">
      <span className="sa-ml-an__fieldlabel" dir="ltr" style={{ color }}>{label}</span>
      <MathField
        value={value}
        onCommit={onCommit}
        ariaLabel={`${label} ${t('tools.analysis.functionPanel.edit')}`}
        placeholder={t('tools.analysis.functionPanel.placeholder')}
        keyboard="function"
        testId={id}
      />
    </div>
  );
}

/** Les fonctions prêtes (§37), rangées par cycle : Collège puis Lycée. */
function Presets({ current, onPreset, t }) {
  const programme = PRESETS.filter((preset) => preset.level === 'programme');
  const beyond = PRESETS.filter((preset) => preset.level === 'beyond');

  return (
    <section className="sa-ml-an__section">
      <h3 className="sa-ml-an__sectiontitle">{t('tools.analysis.presets.title')}</h3>
      <p className="sa-ml-an__grouplabel">{t('tools.analysis.presets.programme')}</p>
      <div className="sa-ml-an__chips">
        {programme.map((preset) => (
          <PresetChip key={preset.id} preset={preset} current={current} onPreset={onPreset} t={t} />
        ))}
      </div>
      {/* Le Lab sert le collège ET le lycée (propriétaire, 2026-09-30) : les deux
          groupes sont ouverts, rangés par cycle, aucun n'est « hors programme ». */}
      <p className="sa-ml-an__grouplabel">{t('tools.analysis.presets.beyond')}</p>
      <div className="sa-ml-an__chips">
        {beyond.map((preset) => (
          <PresetChip key={preset.id} preset={preset} current={current} onPreset={onPreset} t={t} />
        ))}
      </div>
    </section>
  );
}

function PresetChip({ preset, current, onPreset, t }) {
  return (
    <button
      type="button"
      className={`sa-ml-an__chip${current === preset.id ? ' is-active' : ''}`}
      onClick={() => onPreset(preset.id)}
      aria-pressed={current === preset.id}
      data-ml-an-preset={preset.id}
    >
      {t(`tools.analysis.presets.${preset.id}`)}
    </button>
  );
}

/** Les expériences guidées (§29) : un geste à faire, un phénomène à voir. */
function Experiments({ lab, onExperiment, t }) {
  const available = EXPERIMENTS.filter((experiment) => experiment.lab === lab);
  if (available.length === 0) return null;

  return (
    <section className="sa-ml-an__section">
      <h3 className="sa-ml-an__sectiontitle">{t('tools.analysis.experiments.title')}</h3>
      <div className="sa-ml-an__chips">
        {available.map((experiment) => (
          <button
            key={experiment.id}
            type="button"
            className="sa-ml-an__chip"
            onClick={() => onExperiment(experiment)}
            data-ml-an-experiment={experiment.id}
          >
            <FlaskConical size={14} aria-hidden="true" />
            <span>{t(`tools.analysis.experiments.${experiment.id}`)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function Section({ title, children }) {
  return (
    <section className="sa-ml-an__section">
      <h3 className="sa-ml-an__sectiontitle">{title}</h3>
      {children}
    </section>
  );
}

/**
 * Un curseur ET son nombre.
 *
 * Le nombre est un `input` : au téléphone on tire le curseur, au clavier on
 * tape la valeur exacte. Un curseur seul rend impossible « pose a en 2,5 »,
 * et un champ seul rend impossible l'exploration continue (§38).
 */
function NumberSlider({ label, value, onChange, min, max, step, name, integer = false }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(integer ? Math.round(value) : Number(value.toFixed(3)))), [value, integer]);

  return (
    <div className="sa-ml-an__slider" data-ml-an-slider={name}>
      <span className="sa-ml-an__sliderlabel" dir="ltr">{label}</span>
      <input
        type="range"
        className="sa-ml-an__range"
        min={min} max={max} step={step} value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
        data-ml-an-range={name}
      />
      <input
        type="number"
        className="sa-ml-an__number"
        dir="ltr"
        min={min} max={max} step={step}
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          const parsed = Number(event.target.value);
          if (Number.isFinite(parsed)) onChange(parsed);
        }}
        aria-label={label}
        data-ml-an-number={name}
      />
    </div>
  );
}

function Toggle({ label, checked, onChange, name, disabled = false }) {
  return (
    <label className={`sa-ml-an__toggle${disabled ? ' is-disabled' : ''}`}>
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={onChange}
        disabled={disabled}
        data-ml-an-toggle={name}
      />
      <span>{label}</span>
    </label>
  );
}
