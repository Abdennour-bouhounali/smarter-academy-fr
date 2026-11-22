import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Play, Pause, RotateCcw, RotateCw, ChevronsLeft, Minus, Plus,
} from 'lucide-react';
import { SPECIAL_DEGREES } from './exactValues.js';
import { PRESETS, EXPERIMENTS } from './presets.js';
import { LAYER_GROUPS } from './layers.js';
import { TRIANGLE_GIVENS, MIN_RADIUS, MAX_RADIUS } from './trigState.js';
import { formatDegrees, formatRadians, formatLength, formatRatio } from './trigFormat.js';
import { arcsinOf, arccosOf, arctanOf, symmetryOf, arcLength, degToRad } from './trigMath.js';

/**
 * LE PANNEAU (§4, §6, §16–§34) — tout ce qu'on règle sans toucher au dessin.
 *
 * Le panneau est organisé en SECTIONS REPLIABLES parce que §30 l'exige
 * (« Do not overcrowd the screen by default. Use progressive disclosure »).
 * Seules les deux premières — l'angle et les angles remarquables — sont
 * ouvertes au départ : ce sont celles dont on se sert à chaque seconde.
 *
 * Aucun calcul n'est fait dans le JSX : les valeurs arrivent résolues, et
 * les rares lectures (réciproques, symétrie, arc) passent par les fonctions
 * pures de `trigMath.js` (§39).
 */
export default function TrigControls({
  data, state, playing, reducedMotion, speed, direction,
  onAngle, onNudge, onNormalize, onUnit, onValueMode, onRadius, onMode,
  onLayer, onPreset, onExperiment, onInverse, onSymmetry, onCompare,
  onTriangleValue, onPlayToggle, onSpeed, onDirection, onPractice, features = null,
}) {
  const { t } = useTranslation('mathlab');
  // Le مخبر (scope.js) : au collège, un seul mode (le triangle), une seule
  // unité (le degré), trois angles remarquables, et pas de panneau du cercle.
  const modes = features?.modes ?? ['triangle', 'circle'];
  const units = features?.units ?? ['deg', 'rad'];
  const specialAngles = features?.specialAngles ?? SPECIAL_DEGREES;
  const presets = features?.presets ?? PRESETS;
  const panels = { rotation: true, layers: true, symmetry: true, inverse: true, compare: true, experiments: true, ...(features?.panels ?? {}) };
  const [typed, setTyped] = useState(null);

  /** La saisie : on ne pousse la valeur que si elle est LISIBLE (§40). */
  const commitTyped = useCallback((raw) => {
    const text = String(raw).trim().replace('−', '-').replace(',', '.');
    const value = Number(text);
    if (Number.isFinite(value)) {
      onAngle?.(data.unit === 'rad' ? (value * 180) / Math.PI : value);
    }
    setTyped(null);
  }, [data.unit, onAngle]);

  /**
   * Le champ montre l'angle DU MODE COURANT — celui que `state` décrit, et
   * donc celui que l'inspecteur affiche. En mode triangle, `data.angle`
   * reste l'angle du cercle et n'a rien à faire ici : le champ afficherait
   * une valeur que rien à l'écran ne confirme.
   */
  const liveAngle = state.degrees;
  const angleFieldValue = typed ?? (data.unit === 'rad'
    ? String(Math.round(degToRad(liveAngle) * 1000) / 1000).replace('.', ',')
    : String(Math.round(liveAngle * 10) / 10).replace('.', ','));

  return (
    <div className="sa-ml-trig__controls">
      {/* ── L'ANGLE (§4) ──────────────────────────────────────────────── */}
      <Section id="angle" title={t('tools.trigonometry.sections.angle')} defaultOpen>
        {units.length > 1 && (
        <div className="sa-ml-trig__unitswitch" role="group" aria-label={t('tools.trigonometry.unitLabel')}>
          {units.map((unit) => (
            <button
              key={unit}
              type="button"
              className={`sa-ml-trig__seg${data.unit === unit ? ' sa-ml-trig__seg--active' : ''}`}
              onClick={() => onUnit?.(unit)}
              aria-pressed={data.unit === unit}
              data-ml-trig-unit={unit}
            >
              {t(`tools.trigonometry.units.${unit}`)}
            </button>
          ))}
        </div>
        )}

        <label className="sa-ml-trig__field">
          <span className="sa-ml-trig__field-label">{t('tools.trigonometry.angleValue')}</span>
          <input
            type="text"
            inputMode="decimal"
            className="sa-ml-trig__input"
            dir="ltr"
            value={angleFieldValue}
            onChange={(event) => setTyped(event.target.value)}
            onBlur={(event) => commitTyped(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') commitTyped(event.target.value); }}
            aria-label={t('tools.trigonometry.angleValue')}
            data-ml-trig-anglefield
          />
        </label>

        {/* Le curseur : le geste le plus direct après le glissement. */}
        <input
          type="range"
          className="sa-ml-trig__slider"
          min={data.mode === 'triangle' ? 1 : -720}
          max={data.mode === 'triangle' ? 89 : 1080}
          step={1}
          value={Math.round(liveAngle)}
          onChange={(event) => onAngle?.(Number(event.target.value))}
          aria-label={t('tools.trigonometry.angleSlider')}
          data-ml-trig-angleslider
        />

        {/* Les pas fins de §4, en degrés ET en radians selon l'unité. */}
        <div className="sa-ml-trig__nudges" role="group" aria-label={t('tools.trigonometry.fineControl')}>
          {(data.unit === 'rad'
            ? [[-45, '−π/4'], [-15, '−π/12'], [15, '+π/12'], [45, '+π/4']]
            : [[-15, '−15°'], [-5, '−5°'], [-1, '−1°'], [1, '+1°'], [5, '+5°'], [15, '+15°']]
          ).map(([delta, label]) => (
            <button
              key={label}
              type="button"
              className="sa-ml-trig__nudge"
              onClick={() => onNudge?.(delta)}
              data-ml-trig-nudge={delta}
              dir="ltr"
            >
              {label}
            </button>
          ))}
        </div>

        {/* La rotation continue (§4) — arrêtée par défaut sous mouvement réduit (§38). */}
        {panels.rotation && (
        <div className="sa-ml-trig__playbar" role="group" aria-label={t('tools.trigonometry.rotation')}>
          <button
            type="button"
            className={`sa-ml-trig__btn sa-ml-trig__btn--primary${playing ? ' sa-ml-trig__btn--on' : ''}`}
            onClick={onPlayToggle}
            aria-pressed={playing}
            data-ml-trig-play
          >
            {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
            {t(playing ? 'tools.trigonometry.pause' : 'tools.trigonometry.play')}
          </button>
          <button
            type="button"
            className="sa-ml-trig__btn sa-ml-trig__btn--icon"
            onClick={() => onDirection?.(-direction)}
            aria-label={t(direction > 0 ? 'tools.trigonometry.directionDirect' : 'tools.trigonometry.directionIndirect')}
            title={t(direction > 0 ? 'tools.trigonometry.directionDirect' : 'tools.trigonometry.directionIndirect')}
            data-ml-trig-direction={direction > 0 ? 'direct' : 'indirect'}
          >
            {direction > 0 ? <RotateCcw size={16} aria-hidden="true" /> : <RotateCw size={16} aria-hidden="true" />}
          </button>
          <label className="sa-ml-trig__speed">
            <span className="sa-ml-trig__sr">{t('tools.trigonometry.speed')}</span>
            <input
              type="range"
              min={10}
              max={180}
              step={10}
              value={speed}
              onChange={(event) => onSpeed?.(Number(event.target.value))}
              aria-label={t('tools.trigonometry.speed')}
              data-ml-trig-speed
            />
          </label>
          <button
            type="button"
            className="sa-ml-trig__btn sa-ml-trig__btn--icon"
            onClick={() => onAngle?.(0)}
            aria-label={t('tools.trigonometry.resetAngle')}
            title={t('tools.trigonometry.resetAngle')}
            data-ml-trig-resetangle
          >
            <ChevronsLeft size={16} aria-hidden="true" />
          </button>
        </div>
        )}
        {panels.rotation && reducedMotion && (
          <p className="sa-ml-trig__note" data-ml-trig-reducednote>{t('tools.trigonometry.reducedMotionNote')}</p>
        )}

        {/* L'angle hors tour : le ramener est un GESTE, jamais automatique (§15). */}
        {!state.isNormalized && (
          <button
            type="button"
            className="sa-ml-trig__btn sa-ml-trig__btn--wide"
            onClick={onNormalize}
            data-ml-trig-normalize
          >
            {t('tools.trigonometry.normalizeTo', { angle: formatDegrees(state.normalized, 1) })}
          </button>
        )}

        {/* Les écritures exactes (§19). */}
        <div className="sa-ml-trig__unitswitch" role="group" aria-label={t('tools.trigonometry.valueModeLabel')}>
          {['exact', 'decimal'].map((mode) => (
            <button
              key={mode}
              type="button"
              className={`sa-ml-trig__seg${data.valueMode === mode ? ' sa-ml-trig__seg--active' : ''}`}
              onClick={() => onValueMode?.(mode)}
              aria-pressed={data.valueMode === mode}
              data-ml-trig-valuemode={mode}
            >
              {t(`tools.trigonometry.valueModes.${mode}`)}
            </button>
          ))}
        </div>
      </Section>

      {/* ── LES ANGLES REMARQUABLES (§6) ──────────────────────────────── */}
      <Section id="special" title={t('tools.trigonometry.sections.special')} defaultOpen>
        <div className="sa-ml-trig__chips" role="group" aria-label={t('tools.trigonometry.sections.special')}>
          {specialAngles.map((degrees) => (
            <button
              key={degrees}
              type="button"
              className={`sa-ml-trig__chip${Math.round(state.normalized) === (degrees === 360 ? 0 : degrees) ? ' sa-ml-trig__chip--active' : ''}`}
              onClick={() => onAngle?.(degrees)}
              dir="ltr"
              data-ml-trig-special={degrees}
            >
              {data.unit === 'rad' ? formatRadians(degrees) : `${degrees}°`}
            </button>
          ))}
        </div>
      </Section>

      {/* ── LE MODE (§9) ──────────────────────────────────────────────── */}
      <Section id="mode" title={t('tools.trigonometry.sections.mode')} defaultOpen>
        {modes.length > 1 && (
        <div className="sa-ml-trig__unitswitch" role="group" aria-label={t('tools.trigonometry.sections.mode')}>
          {modes.map((mode) => (
            <button
              key={mode}
              type="button"
              className={`sa-ml-trig__seg${data.mode === mode ? ' sa-ml-trig__seg--active' : ''}`}
              onClick={() => onMode?.(mode)}
              aria-pressed={data.mode === mode}
              data-ml-trig-mode={mode}
            >
              {t(`tools.trigonometry.modes.${mode}`)}
            </button>
          ))}
        </div>
        )}

        {data.mode === 'triangle' ? (
          <TriangleControls triangle={data.triangle} state={state} onTriangleValue={onTriangleValue} t={t} />
        ) : (
          <label className="sa-ml-trig__field">
            <span className="sa-ml-trig__field-label">
              {t('tools.trigonometry.radius')} <span dir="ltr">({formatLength(data.radius)})</span>
            </span>
            <input
              type="range"
              className="sa-ml-trig__slider"
              min={MIN_RADIUS}
              max={MAX_RADIUS}
              step={0.1}
              value={data.radius}
              onChange={(event) => onRadius?.(Number(event.target.value))}
              data-ml-trig-radius
            />
            {/* §17 : ℓ = r·θ, la longueur d'arc en direct. */}
            <span className="sa-ml-trig__arcreadout" dir="ltr" data-ml-trig-arclength>
              {`ℓ = r·θ = ${formatLength(arcLength(data.radius, data.angle), 3)}`}
            </span>
            {Math.abs(data.radius - 1) < 1e-9 && (
              <span className="sa-ml-trig__note">{t('tools.trigonometry.radiusOneNote')}</span>
            )}
          </label>
        )}
      </Section>

      {/* ── LES PRÉRÉGLAGES (§27) ─────────────────────────────────────── */}
      <Section id="presets" title={t('tools.trigonometry.sections.presets')}>
        <div className="sa-ml-trig__chips">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`sa-ml-trig__chip${data.preset === preset.id ? ' sa-ml-trig__chip--active' : ''}`}
              onClick={() => onPreset?.(preset.id)}
              title={t(preset.hintKey)}
              data-ml-trig-preset={preset.id}
            >
              {t(preset.labelKey)}
            </button>
          ))}
        </div>
      </Section>

      {/* ── LES COUCHES (§30) ─────────────────────────────────────────── */}
      {panels.layers && (
      <Section id="layers" title={t('tools.trigonometry.sections.layers')}>
        {LAYER_GROUPS.map((group) => (
          <fieldset key={group.id} className="sa-ml-trig__layergroup">
            <legend>{t(`tools.trigonometry.layerGroups.${group.id}`)}</legend>
            {group.keys.map((key) => (
              <label key={key} className="sa-ml-trig__check">
                <input
                  type="checkbox"
                  checked={data.layers[key]}
                  onChange={() => onLayer?.(key)}
                  data-ml-trig-layer={key}
                />
                <span>{t(`tools.trigonometry.layers.${key}`)}</span>
              </label>
            ))}
          </fieldset>
        ))}
      </Section>
      )}

      {/* ── LES SYMÉTRIES (§21) ───────────────────────────────────────── */}
      {panels.symmetry && (
      <Section id="symmetry" title={t('tools.trigonometry.sections.symmetry')}>
        <div className="sa-ml-trig__chips">
          {['negate', 'supplement', 'opposite', 'complement'].map((kind) => (
            <button
              key={kind}
              type="button"
              className={`sa-ml-trig__chip${data.symmetry === kind ? ' sa-ml-trig__chip--active' : ''}`}
              onClick={() => onSymmetry?.(kind)}
              aria-pressed={data.symmetry === kind}
              dir="ltr"
              data-ml-trig-symmetry={kind}
            >
              {t(`tools.trigonometry.symmetries.${kind}`)}
            </button>
          ))}
        </div>
        {data.symmetry && <SymmetryReadout data={data} t={t} />}
      </Section>
      )}

      {/* ── LES RÉCIPROQUES (§24) ─────────────────────────────────────── */}
      {panels.inverse && (
      <Section id="inverse" title={t('tools.trigonometry.sections.inverse')}>
        <div className="sa-ml-trig__chips">
          {['sin', 'cos', 'tan'].map((ratio) => (
            <button
              key={ratio}
              type="button"
              className={`sa-ml-trig__chip${data.inverse?.ratio === ratio ? ' sa-ml-trig__chip--active' : ''}`}
              onClick={() => onInverse?.(data.inverse?.ratio === ratio ? null : ratio, data.inverse?.value)}
              aria-pressed={data.inverse?.ratio === ratio}
              dir="ltr"
              data-ml-trig-inverse={ratio}
            >
              {`arc${ratio}`}
            </button>
          ))}
        </div>
        {data.inverse && (
          <InverseReadout inverse={data.inverse} onInverse={onInverse} onAngle={onAngle} t={t} />
        )}
      </Section>
      )}

      {/* ── LA COMPARAISON DE DEUX ANGLES (§33, §34) ──────────────────── */}
      {panels.compare && (
      <Section id="compare" title={t('tools.trigonometry.sections.compare')}>
        <label className="sa-ml-trig__check">
          <input
            type="checkbox"
            checked={data.compare.enabled}
            onChange={() => onCompare?.({ enabled: !data.compare.enabled })}
            data-ml-trig-compare-toggle
          />
          <span>{t('tools.trigonometry.compareEnable')}</span>
        </label>
        {data.compare.enabled && (
          <CompareReadout data={data} state={state} onCompare={onCompare} t={t} />
        )}
      </Section>
      )}

      {/* ── LES EXPÉRIENCES (§26, §29) ────────────────────────────────── */}
      {panels.experiments && (
      <Section id="experiments" title={t('tools.trigonometry.sections.experiments')}>
        <p className="sa-ml-trig__hint">{t('tools.trigonometry.experimentsHint')}</p>
        <div className="sa-ml-trig__chips">
          {EXPERIMENTS.map((experiment) => (
            <button
              key={experiment.id}
              type="button"
              className="sa-ml-trig__chip"
              onClick={() => onExperiment?.(experiment.id)}
              data-ml-trig-experiment={experiment.id}
            >
              {t(experiment.labelKey)}
            </button>
          ))}
        </div>
      </Section>
      )}

      {/* ── L'ENTRAÎNEMENT (§25) ──────────────────────────────────────── */}
      <Section id="practice" title={t('tools.trigonometry.sections.practice')}>
        <p className="sa-ml-trig__hint">{t('tools.trigonometry.practiceHint')}</p>
        <button
          type="button"
          className="sa-ml-trig__btn sa-ml-trig__btn--primary sa-ml-trig__btn--wide"
          onClick={onPractice}
          data-ml-trig-practice-start
        >
          {t('tools.trigonometry.practiceStart')}
        </button>
        {data.practice.seen > 0 && (
          <p className="sa-ml-trig__score" data-ml-trig-score>
            {t('tools.trigonometry.practiceScore', { solved: data.practice.solved, seen: data.practice.seen })}
          </p>
        )}
      </Section>
    </div>
  );
}

/** Une section repliable — la divulgation progressive de §30. */
function Section({ id, title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="sa-ml-trig__section" data-ml-trig-section={id} data-open={open ? 'true' : 'false'}>
      <h3 className="sa-ml-trig__section-head">
        <button
          type="button"
          className="sa-ml-trig__section-btn"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          data-ml-trig-section-toggle={id}
        >
          <span>{title}</span>
          <span className="sa-ml-trig__section-sign" aria-hidden="true">{open ? <Minus size={15} /> : <Plus size={15} />}</span>
        </button>
      </h3>
      {open && <div className="sa-ml-trig__section-body">{children}</div>}
    </section>
  );
}

/** Les données du triangle (§9) : ce qu'on donne, et ce qui s'en déduit. */
function TriangleControls({ triangle, onTriangleValue, t }) {
  const fields = {
    'angle-hyp': ['angle', 'hypotenuse'],
    'angle-opp': ['angle', 'opposite'],
    'angle-adj': ['angle', 'adjacent'],
    'opp-adj': ['opposite', 'adjacent'],
    'opp-hyp': ['opposite', 'hypotenuse'],
    'adj-hyp': ['adjacent', 'hypotenuse'],
  }[triangle.given] ?? [];

  return (
    <>
      <label className="sa-ml-trig__field">
        <span className="sa-ml-trig__field-label">{t('tools.trigonometry.givenLabel')}</span>
        <select
          className="sa-ml-trig__select"
          value={triangle.given}
          onChange={(event) => onTriangleValue?.('given', event.target.value)}
          data-ml-trig-given
        >
          {TRIANGLE_GIVENS.map((given) => (
            <option key={given} value={given}>{t(`tools.trigonometry.givens.${given}`)}</option>
          ))}
        </select>
      </label>

      {fields.map((key) => (
        <label key={key} className="sa-ml-trig__field">
          <span className="sa-ml-trig__field-label">{t(`tools.trigonometry.sides.${key === 'angle' ? 'angle' : key}`)}</span>
          <input
            type="number"
            className="sa-ml-trig__input"
            dir="ltr"
            value={triangle[key]}
            min={key === 'angle' ? 1 : 0.5}
            max={key === 'angle' ? 89 : 100}
            step={key === 'angle' ? 1 : 0.5}
            onChange={(event) => onTriangleValue?.(key, Number(event.target.value))}
            data-ml-trig-tri-field={key}
          />
        </label>
      ))}
    </>
  );
}

/** Les valeurs de l'angle symétrique, face à celles de θ (§21). */
function SymmetryReadout({ data, t }) {
  const symmetry = symmetryOf(data.angle, data.symmetry);
  if (!symmetry) return null;

  return (
    <table className="sa-ml-trig__minitable" dir="ltr" data-ml-trig-symtable>
      <thead>
        <tr>
          <th scope="col" />
          <th scope="col">θ</th>
          <th scope="col">{t(`tools.trigonometry.symmetries.${data.symmetry}`)}</th>
        </tr>
      </thead>
      <tbody>
        {['sin', 'cos', 'tan'].map((ratio) => (
          <tr key={ratio}>
            <th scope="row">{ratio}</th>
            <td>{formatRatio(symmetry.source, ratio, symmetry.origin[ratio], data.valueMode).text}</td>
            <td data-ml-trig-symvalue={ratio}>
              {formatRatio(symmetry.image, ratio, symmetry.values[ratio], data.valueMode).text}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** arcsin / arccos / arctan : la valeur principale ET les autres angles (§24). */
function InverseReadout({ inverse, onInverse, onAngle, t }) {
  const solve = inverse.ratio === 'sin' ? arcsinOf : inverse.ratio === 'cos' ? arccosOf : arctanOf;
  const result = solve(inverse.value);
  const bound = inverse.ratio === 'tan' ? 20 : 1;

  return (
    <>
      <label className="sa-ml-trig__field">
        <span className="sa-ml-trig__field-label" dir="ltr">
          {`${inverse.ratio}(θ) = ${formatLength(inverse.value, 3)}`}
        </span>
        <input
          type="range"
          className="sa-ml-trig__slider"
          min={-bound}
          max={bound}
          step={inverse.ratio === 'tan' ? 0.1 : 0.01}
          value={inverse.value}
          onChange={(event) => onInverse?.(inverse.ratio, Number(event.target.value))}
          data-ml-trig-inverse-slider
        />
      </label>

      {result ? (
        <div className="sa-ml-trig__solutions" data-ml-trig-solutions>
          <p className="sa-ml-trig__row">
            <span className="sa-ml-trig__row-label">{t('tools.trigonometry.principalValue')}</span>
            <span className="sa-ml-trig__row-value" dir="ltr">{formatDegrees(result.principal, 2)}</span>
          </p>
          <p className="sa-ml-trig__hint">{t('tools.trigonometry.otherSolutions')}</p>
          <div className="sa-ml-trig__chips">
            {result.solutions.map((angle) => (
              <button
                key={angle}
                type="button"
                className="sa-ml-trig__chip"
                onClick={() => onAngle?.(angle)}
                dir="ltr"
                data-ml-trig-solution={Math.round(angle * 100) / 100}
              >
                {formatDegrees(angle, 2)}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="sa-ml-trig__note sa-ml-trig__note--warn" data-ml-trig-noinverse>
          {t('tools.trigonometry.inverseOutOfRange', { ratio: inverse.ratio })}
        </p>
      )}
    </>
  );
}

/** Deux angles, leurs valeurs, et leur écart (§33, §34). */
function CompareReadout({ data, state, onCompare }) {
  const other = data.compare.angle;
  const delta = other - data.angle;
  const otherState = {
    sin: Math.sin((other * Math.PI) / 180),
    cos: Math.cos((other * Math.PI) / 180),
  };

  return (
    <>
      <label className="sa-ml-trig__field">
        <span className="sa-ml-trig__field-label">
          θ₂ <span dir="ltr">{formatDegrees(other, 1)}</span>
        </span>
        <input
          type="range"
          className="sa-ml-trig__slider"
          min={-360}
          max={720}
          step={1}
          value={Math.round(other)}
          onChange={(event) => onCompare?.({ angle: Number(event.target.value) })}
          data-ml-trig-compare-slider
        />
      </label>

      <table className="sa-ml-trig__minitable" dir="ltr" data-ml-trig-comparetable>
        <thead>
          <tr>
            <th scope="col" />
            <th scope="col">θ₁</th>
            <th scope="col">θ₂</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">θ</th>
            <td>{formatDegrees(data.angle, 1)}</td>
            <td>{formatDegrees(other, 1)}</td>
          </tr>
          <tr>
            <th scope="row">sin</th>
            <td>{formatRatio(data.angle, 'sin', state.sin, data.valueMode).text}</td>
            <td data-ml-trig-compare-sin>{formatRatio(other, 'sin', round12(otherState.sin), data.valueMode).text}</td>
          </tr>
          <tr>
            <th scope="row">cos</th>
            <td>{formatRatio(data.angle, 'cos', state.cos, data.valueMode).text}</td>
            <td>{formatRatio(other, 'cos', round12(otherState.cos), data.valueMode).text}</td>
          </tr>
        </tbody>
      </table>

      <p className="sa-ml-trig__row" data-ml-trig-delta>
        <span className="sa-ml-trig__row-label">Δθ</span>
        <span className="sa-ml-trig__row-value" dir="ltr">{formatDegrees(delta, 1)}</span>
      </p>
    </>
  );
}

/** Le nettoyage de §40, appliqué à une valeur calculée ici faute d'angle courant. */
function round12(value) {
  return Math.abs(value) < 1e-10 ? 0 : value;
}
