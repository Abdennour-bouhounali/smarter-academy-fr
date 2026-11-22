import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, GitCompare } from 'lucide-react';
import { SEQUENCE_KINDS } from './sequenceMath.js';
import { MIN_COUNT, MAX_COUNT, RATIO_SLIDER_MIN, RATIO_SLIDER_MAX } from './sequenceState.js';
import { LAYER_GROUPS } from './layers.js';
import { PRESETS, EXPERIMENTS } from './presets.js';
import { formatTerm } from './sequenceFormat.js';

/**
 * LE PUPITRE : tout ce qu'on peut TIRER.
 *
 * §5 veut que les curseurs soient « one of the main wow interactions ». Un
 * curseur n'est pas un champ de saisie déguisé : ce qui enseigne, c'est le
 * CONTINU — passer q de 0,8 à 1 puis à 1,2 sans lever le doigt et voir la
 * suite cesser de converger, devenir constante, puis exploser. D'où trois
 * décisions :
 *
 *  - le curseur de raison couvre [−2, 2], le domaine que §25 nomme, avec un
 *    pas de 0,05 : assez fin pour que le passage par 1 et par −1 se sente,
 *    assez gros pour que le doigt puisse s'y arrêter ;
 *  - chaque curseur est DOUBLÉ d'un champ numérique, parce qu'un élève qui
 *    veut exactement 1,5 ne doit pas viser au pixel (§43, accessibilité) ;
 *  - les valeurs remarquables (−1, 0, 1) sont des puces cliquables : ce sont
 *    les frontières de comportement, et §14 demande qu'on les explore.
 *
 * Les sections sont replièes (§50 : pas un tableau de bord de cartes). Celle
 * qu'on ouvre en premier est « la suite » — ce qu'on vient manipuler.
 */
export default function SequenceControls({
  data, model, onParameter, onCount, onLayer, onPreset, onExperiment, onCompare,
  experimentFocus = null,
}) {
  const { t } = useTranslation('mathlab');
  const spec = data.primary;

  /** Les paramètres que la famille courante expose (§4). */
  const shows = {
    first: spec.kind !== 'explicit',
    second: spec.kind === 'secondOrder',
    difference: spec.kind === 'arithmetic',
    ratio: spec.kind === 'geometric',
    ab: spec.kind === 'affine' || spec.kind === 'secondOrder',
    explicitSource: spec.kind === 'explicit',
    ruleSource: spec.kind === 'recurrence',
  };

  return (
    <div className="sa-ml-seq__controls" data-ml-seq-controls>
      {/* ── La suite : la famille et ses paramètres ───────────────────── */}
      <Section id="sequence" title={t('tools.sequences.sections.sequence')} defaultOpen>
        <fieldset className="sa-ml-seq__fieldset">
          <legend className="sa-ml-seq__legend">{t('tools.sequences.kindLabel')}</legend>
          <div className="sa-ml-seq__kinds">
            {SEQUENCE_KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                className={`sa-ml-seq__chip${spec.kind === kind ? ' sa-ml-seq__chip--active' : ''}`}
                onClick={() => onParameter('kind', kind)}
                aria-pressed={spec.kind === kind}
                data-ml-seq-kind={kind}
              >
                {t(`tools.sequences.kinds.${kind}`)}
              </button>
            ))}
          </div>
        </fieldset>

        {shows.first && (
          <NumberControl
            id="first"
            label={t('tools.sequences.params.first')}
            value={spec.first}
            onChange={(value) => onParameter('first', value)}
            min={-50} max={50} step={1}
            highlight={experimentFocus === 'first'}
            testId="first"
          />
        )}

        {shows.second && (
          <NumberControl
            id="second"
            label={t('tools.sequences.params.second')}
            value={spec.second}
            onChange={(value) => onParameter('second', value)}
            min={-50} max={50} step={1}
            testId="second"
          />
        )}

        {shows.difference && (
          <NumberControl
            id="difference"
            label={t('tools.sequences.params.difference')}
            value={spec.difference}
            onChange={(value) => onParameter('difference', value)}
            min={-20} max={20} step={0.5}
            marks={[-5, -1, 0, 1, 5]}
            highlight={experimentFocus === 'difference'}
            testId="difference"
          />
        )}

        {shows.ratio && (
          <NumberControl
            id="ratio"
            label={t('tools.sequences.params.ratio')}
            value={spec.ratio}
            onChange={(value) => onParameter('ratio', value)}
            min={RATIO_SLIDER_MIN} max={RATIO_SLIDER_MAX} step={0.05}
            // Les frontières de comportement de §14, d'un clic.
            marks={[-2, -1, -0.5, 0, 0.5, 1, 1.5, 2]}
            highlight={experimentFocus === 'ratio'}
            testId="ratio"
          />
        )}

        {shows.ab && (
          <>
            <NumberControl
              id="a"
              label={t('tools.sequences.params.a')}
              value={spec.a}
              onChange={(value) => onParameter('a', value)}
              min={-2} max={2} step={0.05}
              marks={[-1, 0, 0.5, 1]}
              highlight={experimentFocus === 'a'}
              testId="a"
            />
            <NumberControl
              id="b"
              label={t('tools.sequences.params.b')}
              value={spec.b}
              onChange={(value) => onParameter('b', value)}
              min={-20} max={20} step={0.5}
              marks={[-1, 0, 1]}
              highlight={experimentFocus === 'b'}
              testId="b"
            />
          </>
        )}

        {/* L'écriture libre (§31). Le champ souligne SON erreur, sans effacer
            ce que l'élève a tapé : on ne reprend jamais sa saisie. */}
        {(shows.explicitSource || shows.ruleSource) && (
          <div className={`sa-ml-seq__rulefield${model.error ? ' sa-ml-seq__rulefield--invalid' : ''}`}>
            <label className="sa-ml-seq__label-block" htmlFor="sa-ml-seq-rule">
              {shows.explicitSource ? t('tools.sequences.params.explicitSource') : t('tools.sequences.params.ruleSource')}
            </label>
            <div className="sa-ml-seq__ruleinputrow">
              <span className="sa-ml-seq__rulelhs" dir="ltr" aria-hidden="true">
                {shows.explicitSource ? 'uₙ =' : 'uₙ₊₁ ='}
              </span>
              <input
                id="sa-ml-seq-rule"
                className="sa-ml-seq__field sa-ml-seq__field--rule"
                type="text"
                dir="ltr"
                spellCheck={false}
                autoComplete="off"
                value={shows.explicitSource ? spec.explicitSource : spec.ruleSource}
                onChange={(event) => onParameter(
                  shows.explicitSource ? 'explicitSource' : 'ruleSource',
                  event.target.value,
                )}
                aria-invalid={model.error ? 'true' : 'false'}
                aria-describedby={model.error ? 'sa-ml-seq-rule-error' : undefined}
                data-ml-seq-rulefield
              />
            </div>
            <p className="sa-ml-seq__hint">{t('tools.sequences.params.ruleHint')}</p>
            {model.error && (
              <p id="sa-ml-seq-rule-error" className="sa-ml-seq__error" role="status" data-ml-seq-rule-error={model.error.code}>
                {t(`tools.sequences.errors.${model.error.code}`)}
              </p>
            )}
          </div>
        )}

        <fieldset className="sa-ml-seq__fieldset">
          <legend className="sa-ml-seq__legend">{t('tools.sequences.params.startIndex')}</legend>
          <div className="sa-ml-seq__kinds">
            {[0, 1].map((index) => (
              <button
                key={index}
                type="button"
                className={`sa-ml-seq__chip${spec.startIndex === index ? ' sa-ml-seq__chip--active' : ''}`}
                onClick={() => onParameter('startIndex', index)}
                aria-pressed={spec.startIndex === index}
                data-ml-seq-start={index}
              >
                <span dir="ltr">{index === 0 ? 'u₀' : 'u₁'}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <NumberControl
          id="count"
          label={t('tools.sequences.params.count')}
          value={data.count}
          onChange={onCount}
          min={MIN_COUNT} max={Math.min(120, MAX_COUNT)} step={1}
          integer
          testId="count"
        />
      </Section>

      {/* ── Les préréglages (§39) et les modèles du réel (§38) ────────── */}
      <Section id="presets" title={t('tools.sequences.sections.presets')}>
        {['basics', 'analysis', 'world'].map((group) => (
          <fieldset key={group} className="sa-ml-seq__fieldset">
            <legend className="sa-ml-seq__legend">{t(`tools.sequences.presetGroups.${group}`)}</legend>
            <div className="sa-ml-seq__chips">
              {PRESETS.filter((preset) => preset.group === group).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`sa-ml-seq__chip${data.preset === preset.id ? ' sa-ml-seq__chip--active' : ''}`}
                  onClick={() => onPreset(preset.id)}
                  title={t(preset.hintKey)}
                  aria-pressed={data.preset === preset.id}
                  data-ml-seq-preset={preset.id}
                >
                  {t(preset.labelKey)}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </Section>

      {/* ── Les expériences « et si… ? » (§26) ────────────────────────── */}
      <Section id="experiments" title={t('tools.sequences.sections.experiments')}>
        <p className="sa-ml-seq__hint">{t('tools.sequences.experimentsHint')}</p>
        <div className="sa-ml-seq__chips">
          {EXPERIMENTS.map((experiment) => (
            <button
              key={experiment.id}
              type="button"
              className="sa-ml-seq__chip"
              onClick={() => onExperiment(experiment.id)}
              data-ml-seq-experiment={experiment.id}
            >
              {t(experiment.labelKey)}
            </button>
          ))}
        </div>
      </Section>

      {/* ── Ce qu'on affiche (§30-style) ──────────────────────────────── */}
      <Section id="layers" title={t('tools.sequences.sections.layers')}>
        {LAYER_GROUPS.map((group) => (
          <fieldset key={group.id} className="sa-ml-seq__fieldset">
            <legend className="sa-ml-seq__legend">{t(`tools.sequences.layerGroups.${group.id}`)}</legend>
            {group.keys.map((key) => (
              <label key={key} className="sa-ml-seq__check">
                <input
                  type="checkbox"
                  checked={data.layers[key]}
                  onChange={() => onLayer(key)}
                  data-ml-seq-layer={key}
                />
                <span>{t(`tools.sequences.layers.${key}`)}</span>
              </label>
            ))}
          </fieldset>
        ))}
      </Section>

      {/* ── La comparaison (§33) ──────────────────────────────────────── */}
      <Section id="compare" title={t('tools.sequences.sections.compare')}>
        <button
          type="button"
          className={`sa-ml-seq__btn${data.secondary ? ' sa-ml-seq__btn--active' : ''}`}
          onClick={onCompare}
          aria-pressed={Boolean(data.secondary)}
          data-ml-seq-compare-toggle
        >
          <GitCompare size={16} aria-hidden="true" />
          <span>{data.secondary ? t('tools.sequences.compare.close') : t('tools.sequences.compare.open')}</span>
        </button>

        {data.secondary && (
          <div className="sa-ml-seq__secondaryparams" data-ml-seq-secondary-params>
            <p className="sa-ml-seq__hint">{t('tools.sequences.compare.hint')}</p>

            <fieldset className="sa-ml-seq__fieldset">
              <legend className="sa-ml-seq__legend">{t('tools.sequences.kindLabel')}</legend>
              <div className="sa-ml-seq__kinds">
                {['arithmetic', 'geometric', 'affine'].map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    className={`sa-ml-seq__chip${data.secondary.kind === kind ? ' sa-ml-seq__chip--active' : ''}`}
                    onClick={() => onParameter('kind', kind, 'secondary')}
                    aria-pressed={data.secondary.kind === kind}
                    data-ml-seq-second-kind={kind}
                  >
                    {t(`tools.sequences.kinds.${kind}`)}
                  </button>
                ))}
              </div>
            </fieldset>

            <NumberControl
              id="second-first"
              label={t('tools.sequences.params.first')}
              value={data.secondary.first}
              onChange={(value) => onParameter('first', value, 'secondary')}
              min={-50} max={50} step={1}
              testId="second-first"
            />
            {data.secondary.kind === 'arithmetic' && (
              <NumberControl
                id="second-difference"
                label={t('tools.sequences.params.difference')}
                value={data.secondary.difference}
                onChange={(value) => onParameter('difference', value, 'secondary')}
                min={-20} max={20} step={0.5}
                testId="second-difference"
              />
            )}
            {data.secondary.kind === 'geometric' && (
              <NumberControl
                id="second-ratio"
                label={t('tools.sequences.params.ratio')}
                value={data.secondary.ratio}
                onChange={(value) => onParameter('ratio', value, 'secondary')}
                min={RATIO_SLIDER_MIN} max={RATIO_SLIDER_MAX} step={0.05}
                testId="second-ratio"
              />
            )}
            {data.secondary.kind === 'affine' && (
              <>
                <NumberControl
                  id="second-a" label={t('tools.sequences.params.a')}
                  value={data.secondary.a}
                  onChange={(value) => onParameter('a', value, 'secondary')}
                  min={-2} max={2} step={0.05} testId="second-a"
                />
                <NumberControl
                  id="second-b" label={t('tools.sequences.params.b')}
                  value={data.secondary.b}
                  onChange={(value) => onParameter('b', value, 'secondary')}
                  min={-20} max={20} step={0.5} testId="second-b"
                />
              </>
            )}

            {model.secondaryError && (
              <p className="sa-ml-seq__error" role="status">
                {t(`tools.sequences.errors.${model.secondaryError.code}`)}
              </p>
            )}
          </div>
        )}
      </Section>
    </div>
  );
}

/**
 * UN PARAMÈTRE : un curseur, un champ, et des puces de valeurs remarquables.
 *
 * Le curseur donne le continu (§5, §25) ; le champ donne l'exactitude et
 * l'accessibilité au clavier (§43) ; les puces donnent les frontières de
 * comportement d'un clic (§14).
 *
 * Le champ est un `text` et non un `number` : tapé caractère par caractère,
 * « −1,5 » passe par « − », état qu'un `input[type=number]` refuse en rendant
 * une chaîne vide, ce qui remettrait la valeur à zéro sous les doigts de
 * l'élève. On garde donc la frappe telle quelle et on ne remonte que ce qui se
 * lit comme un nombre.
 */
function NumberControl({
  id, label, value, onChange, min, max, step, marks = [], integer = false,
  highlight = false, testId,
}) {
  const [draft, setDraft] = useState(null);
  const shown = draft ?? formatTerm(value, 4);

  const commitText = (text) => {
    setDraft(text);
    const parsed = Number(String(text).replace(',', '.').replace(/[−–—]/g, '-'));
    if (Number.isFinite(parsed)) onChange(integer ? Math.round(parsed) : parsed);
  };

  return (
    <div
      className={`sa-ml-seq__param${highlight ? ' sa-ml-seq__param--focus' : ''}`}
      data-ml-seq-param={testId}
    >
      <div className="sa-ml-seq__paramhead">
        <label className="sa-ml-seq__label-inline" htmlFor={`sa-ml-seq-${id}`}>{label}</label>
        <input
          className="sa-ml-seq__field sa-ml-seq__field--num"
          type="text"
          inputMode="decimal"
          dir="ltr"
          value={shown}
          onChange={(event) => commitText(event.target.value)}
          onBlur={() => setDraft(null)}
          aria-label={label}
          data-ml-seq-field={testId}
        />
      </div>

      <input
        id={`sa-ml-seq-${id}`}
        className="sa-ml-seq__slider"
        type="range"
        min={min} max={max} step={step}
        value={Math.min(max, Math.max(min, value))}
        onChange={(event) => { setDraft(null); onChange(Number(event.target.value)); }}
        aria-label={label}
        aria-valuetext={formatTerm(value, 4)}
        data-ml-seq-slider={testId}
      />

      {marks.length > 0 && (
        <div className="sa-ml-seq__marks">
          {marks.map((mark) => (
            <button
              key={mark}
              type="button"
              className={`sa-ml-seq__mark${Math.abs(value - mark) < 1e-9 ? ' sa-ml-seq__mark--active' : ''}`}
              onClick={() => { setDraft(null); onChange(mark); }}
              data-ml-seq-mark={`${testId}:${mark}`}
            >
              <span dir="ltr">{formatTerm(mark, 2)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Une section repliable — le même motif que `trigonometry/TrigControls.jsx`. */
function Section({ id, title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="sa-ml-seq__section" data-ml-seq-section={id} data-open={open ? 'true' : 'false'}>
      <h3 className="sa-ml-seq__section-head">
        <button
          type="button"
          className="sa-ml-seq__section-btn"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          data-ml-seq-section-toggle={id}
        >
          <span>{title}</span>
          <span className="sa-ml-seq__section-sign" aria-hidden="true">
            {open ? <Minus size={15} /> : <Plus size={15} />}
          </span>
        </button>
      </h3>
      {open && <div className="sa-ml-seq__section-body">{children}</div>}
    </section>
  );
}
