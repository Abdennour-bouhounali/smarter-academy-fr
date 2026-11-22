import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MathText from '../../../../lessons/common/components/MathText.jsx';
import { ExamplePicker, LabDisclosure } from '../../shared/LabKit.jsx';
import StepPlayer from '../../shared/StepPlayer.jsx';
import useStepReveal from '../../shared/useStepReveal.js';
import MathBoard from '../../shared/mathBoard/MathBoard.jsx';
import useBoardPractice from '../../shared/mathBoard/useBoardPractice.js';
import { boardProgress } from '../../shared/mathBoard/frames.js';
import { formatValue } from '../functionGrapher/grapherFormat.js';
import { parseValue } from './datasetStatistics.js';
import {
  NORMAL_VALUE_BOUND, empiricalRule, normalQuery, sampleCurve, shadedInterval,
} from './normalDistribution.js';
import { normalFrames, normalReveal } from './normalFrames.js';
import { NORMAL_PRESETS, getNormalPreset, matchingNormalPreset } from './normalPresets.js';
import SectionFrame from './SectionFrame.jsx';
import NormalCurve from './NormalCurve.jsx';

/** Un pas de curseur « rond » (1, 2, 5 × 10ᵏ) proche de span/200. */
function sliderStep(span) {
  const raw = span / 200;
  const magnitude = 10 ** Math.floor(Math.log10(raw));

  return [1, 2, 5, 10].map((f) => f * magnitude).find((s) => s >= raw) ?? magnitude;
}

/**
 * Un paramètre : un curseur ET un champ. Le champ garde son brouillon
 * (virgule décimale, vrai moins) ; une valeur illisible ou refusée (σ ≤ 0,
 * a > b) est NOMMÉE sous le champ et n'est pas appliquée — l'état du
 * document ne contient jamais un σ nul.
 */
function ParamField({ name, symbol, value, min, max, step, validate, onApply }) {
  const { t } = useTranslation('mathlab');
  const [draft, setDraft] = useState(formatValue(value, 4));
  const [error, setError] = useState(null);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) { setDraft(formatValue(value, 4)); setError(null); }
  }, [value, focused]);
  const errorId = `ml-ps-normal-${name}-error`;

  const type = (text) => {
    setDraft(text);
    const parsed = parseValue(text);
    if (Number.isNaN(parsed) || Math.abs(parsed) > NORMAL_VALUE_BOUND) { setError('number'); return; }
    const problem = validate ? validate(parsed) : null;
    setError(problem);
    if (!problem) onApply(parsed);
  };

  return (
    <div className="sa-ml-ps__param" data-ml-ps-normal-param={name}>
      <label className="sa-ml-ps__param-head" htmlFor={`ml-ps-normal-${name}`}>
        <span>{t(`tools.probabilityStats.normal.params.${name}`)}</span>
        <span className="sa-ml-ps__stat-symbol" dir="ltr">{symbol}</span>
      </label>
      <div className="sa-ml-ps__param-row">
        <input
          type="range"
          className="sa-ml-ps__slider"
          min={Math.min(min, value)}
          max={Math.max(max, value)}
          step={step}
          value={value}
          onChange={(event) => onApply(Number(event.target.value))}
          aria-label={t('tools.probabilityStats.normal.slider', { name: t(`tools.probabilityStats.normal.params.${name}`) })}
          aria-valuetext={formatValue(value, 4)}
          data-ml-ps-normal-slider={name}
        />
        <input
          id={`ml-ps-normal-${name}`}
          className={`sa-ml-ps__number${error ? ' sa-ml-ps__number--invalid' : ''}`}
          dir="ltr"
          inputMode="decimal"
          value={draft}
          onChange={(event) => type(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : undefined}
          data-ml-ps-normal-field={name}
        />
      </div>
      {error && (
        <p id={errorId} className="sa-ml-ps__error" role="alert" data-ml-ps-normal-error={error}>
          {t(`tools.probabilityStats.normal.errors.${error}`)}
        </p>
      )}
    </div>
  );
}

const QUERY_LATEX = { le: 'P(X \\le x)', ge: 'P(X \\ge x)', between: 'P(a \\le X \\le b)' };

/**
 * التوزيع الطبيعي — la loi normale : choisir μ, σ et une question, VOIR
 * l'aire, lire le calcul (z puis Φ). Au-delà du programme de 4AM : la
 * section n'est jamais celle qui s'ouvre par défaut.
 *
 * Deux régimes (exigence 2026-09-30) :
 *   - LIVE : les curseurs, les champs, la courbe elle-même — manipuler ne
 *     s'arrête jamais ;
 *   - DÉROULÉ : le calcul (normalFrames.js) se construit au tableau, frame
 *     par frame, avec le lecteur partagé. La courbe le SUIT : la valeur z
 *     d'une borne n'apparaît qu'au frame qui la calcule, l'aire ombrée à la
 *     règle (P = Φ(z)) ; le bandeau du résultat pose la question
 *     « P(X ≤ 170) = ? » jusqu'au dernier frame.
 * Toute nouvelle question (μ, σ, x, a, b, type) ramène à l'énoncé ; l'élève
 * relance avec « ابدأ الحل ». L'axe X / Z n'est PAS la question (l'aire ne
 * change pas, c'est ce que « لماذا نحوّل إلى Z؟ » invite à vérifier) : le
 * basculer garde le pas courant.
 */
export default function NormalSection({ title, normal, compact, reducedMotion, onChange }) {
  const { t } = useTranslation('mathlab');
  const { mu, sigma } = normal;
  // La courbe : une fois par (μ, σ, échelle), pas à chaque déplacement de x.
  const curve = useMemo(() => sampleCurve(mu, sigma, normal.scale), [mu, sigma, normal.scale]);
  const result = useMemo(() => normalQuery(normal), [normal]);
  const interval = useMemo(() => shadedInterval(normal, result, normal.scale), [normal, result]);
  const board = useMemo(() => normalFrames(normal, result), [normal, result]);
  const questionKey = JSON.stringify([mu, sigma, normal.x, normal.a, normal.b, normal.query]);
  const player = useStepReveal(board ? board.frames.length : 0, { resetKey: questionKey });
  const practice = useBoardPractice(board?.frames ?? [], player, questionKey);
  const reveal = useMemo(() => normalReveal(board?.frames, player.cursor), [board, player.cursor]);
  const answered = Boolean(board) && player.done;
  const rule = useMemo(() => empiricalRule(), []);
  const span = 8 * sigma;
  const step = sliderStep(span);
  const k = (key) => `tools.probabilityStats.normal.${key}`;

  const panel = (
    <>
      <ExamplePicker
        examples={NORMAL_PRESETS.map((preset) => ({ id: preset.id, level: preset.level, label: t(`${k('presets')}.${preset.id}`) }))}
        activeId={matchingNormalPreset(normal)}
        onPick={(id) => { const preset = getNormalPreset(id); if (preset) onChange(preset.params); }}
        dataAttr="data-ml-ps-normal-example"
      />
      <section className="sa-ml-ps__section" aria-labelledby="ml-ps-normal-query">
        <h3 id="ml-ps-normal-query" className="sa-ml-ps__heading">{t(k('queryHeading'))}</h3>
        <div className="sa-ml-ps__chart-types" role="group" aria-labelledby="ml-ps-normal-query">
          {['le', 'ge', 'between'].map((query) => (
            <button
              key={query}
              type="button"
              className={`sa-ml-ps__chart-type${normal.query === query ? ' is-active' : ''}`}
              aria-pressed={normal.query === query}
              aria-label={t(`${k('queries')}.${query}`)}
              onClick={() => onChange({ query })}
              data-ml-ps-normal-query={query}
            >
              <span dir="ltr"><MathText>{`$${QUERY_LATEX[query]}$`}</MathText></span>
            </button>
          ))}
        </div>
      </section>
      <section className="sa-ml-ps__section" aria-labelledby="ml-ps-normal-params">
        <h3 id="ml-ps-normal-params" className="sa-ml-ps__heading">{t(k('paramsHeading'))}</h3>
        <ParamField name="mu" symbol="μ" value={mu} min={-50} max={250} step={0.5} onApply={(v) => onChange({ mu: v })} />
        <ParamField
          name="sigma"
          symbol="σ"
          value={sigma}
          min={0.1}
          max={50}
          step={0.1}
          validate={(v) => (v > 0 ? null : 'sigma')}
          onApply={(v) => onChange({ sigma: v })}
        />
        {normal.query === 'between' ? (
          <>
            <ParamField
              name="a"
              symbol="a"
              value={normal.a}
              min={mu - span / 2}
              max={normal.b}
              step={step}
              validate={(v) => (v <= normal.b ? null : 'order')}
              onApply={(v) => onChange({ a: Math.min(v, normal.b) })}
            />
            <ParamField
              name="b"
              symbol="b"
              value={normal.b}
              min={normal.a}
              max={mu + span / 2}
              step={step}
              validate={(v) => (v >= normal.a ? null : 'order')}
              onApply={(v) => onChange({ b: Math.max(v, normal.a) })}
            />
          </>
        ) : (
          <ParamField name="x" symbol="x" value={normal.x} min={mu - span / 2} max={mu + span / 2} step={step} onApply={(v) => onChange({ x: v })} />
        )}
      </section>
      <section className="sa-ml-ps__section" aria-labelledby="ml-ps-normal-scale">
        <h3 id="ml-ps-normal-scale" className="sa-ml-ps__heading">{t(k('scaleHeading'))}</h3>
        <div className="sa-ml-ps__chart-types" role="group" aria-labelledby="ml-ps-normal-scale">
          {['x', 'z'].map((scale) => (
            <button
              key={scale}
              type="button"
              className={`sa-ml-ps__chart-type${normal.scale === scale ? ' is-active' : ''}`}
              aria-pressed={normal.scale === scale}
              onClick={() => onChange({ scale })}
              data-ml-ps-normal-scale={scale}
            >
              {t(`${k('scales')}.${scale}`)}
            </button>
          ))}
        </div>
      </section>
    </>
  );

  const stage = (
    <>
      {board && (
        <StepPlayer player={player} {...practice.player} sticky progress={boardProgress(board.frames, player.cursor)} dataAttr="data-ml-ps-normal-step" />
      )}
      <h2 className="sa-ml-ps__stage-title">
        {t(k('stageTitle'))}{' '}
        <bdi dir="ltr" className="sa-ml-ps__inline-value">
          <MathText>{`$X \\sim \\mathcal{N}(${formatValue(mu, 4).replace(',', '{,}').replace('−', '-')},\\ ${formatValue(sigma, 4).replace(',', '{,}')}^2)$`}</MathText>
        </bdi>
      </h2>
      <div className={`sa-ml-ps__normal-wrap${reducedMotion ? ' is-still' : ''}`}>
        <NormalCurve
          curve={curve}
          params={normal}
          result={result}
          interval={interval}
          revealZ={reveal.z}
          showArea={reveal.area}
          compact={compact}
          title={t(k('curveAria'), { mu: formatValue(mu, 2), sigma: formatValue(sigma, 2) })}
        />
      </div>
      {/* Le bandeau pose la QUESTION tant que le déroulé n'a pas atteint son
          dernier frame : ni le texte, ni l'attribut, ni l'annonce vocale ne
          donnent la réponse avant. */}
      {board && (
        <p
          className={`sa-ml-ps__normal-result${answered ? ' is-answered' : ''}`}
          role="status"
          aria-live="polite"
          data-ml-ps-normal-probability={answered ? result.probability.toFixed(6) : 'pending'}
        >
          <span>{t(`${k('queries')}.${normal.query}`)}</span>
          <bdi dir="ltr" className="sa-ml-ps__normal-result-value">
            {answered
              ? `≈ ${formatValue(result.probability, 4)} · ${formatValue(result.probability * 100, 2)} %`
              : <MathText>{`$${board.questionLatex} = \\,?$`}</MathText>}
          </bdi>
        </p>
      )}
      <section className="sa-ml-ps__section" aria-labelledby="ml-ps-normal-steps">
        <h3 id="ml-ps-normal-steps" className="sa-ml-ps__heading">{t(k('stepsHeading'))}</h3>
        {board ? (
          <MathBoard
            {...practice.board}
            frames={board.frames}
            cursor={player.cursor}
            problem={board.problem}
            label={t(k('stepsHeading'))}
            dataAttr="data-ml-ps-normal-board"
          />
        ) : (
          <p className="sa-ml-ps__hint">{t(k('noCalculation'))}</p>
        )}
      </section>
      <LabDisclosure kind="rule" title={t(k('ruleTitle'))} dataAttr="data-ml-ps-normal-rule">
        <p>{t(k('ruleBody'))}</p>
        <table className="sa-ml-ps__table">
          <tbody>
            {rule.map((row) => (
              <tr key={row.k}>
                <th scope="row" dir="ltr"><MathText>{`$P(\\mu - ${row.k === 1 ? '' : row.k}\\sigma \\le X \\le \\mu + ${row.k === 1 ? '' : row.k}\\sigma)$`}</MathText></th>
                <td dir="ltr">≈ {formatValue(row.probability * 100, 2)} %</td>
              </tr>
            ))}
          </tbody>
        </table>
      </LabDisclosure>
      <LabDisclosure kind="why" title={t(k('whyTitle'))}>
        <p>{t(k('whyBody'))}</p>
      </LabDisclosure>
    </>
  );

  return <SectionFrame title={title} panel={panel} stage={stage} />;
}
