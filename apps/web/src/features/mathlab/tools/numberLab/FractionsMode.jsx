import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Scissors, Merge } from 'lucide-react';
import { StepList, LabPanel } from '../../shared/LabKit.jsx';
import StepPlayer from '../../shared/StepPlayer.jsx';
import useStepReveal from '../../shared/useStepReveal.js';
import FractionShape from './FractionShape.jsx';
import CommonDenominatorFigure from './CommonDenominatorFigure.jsx';
import NumberLineStage from './NumberLineStage.jsx';
import ValueInput from './ValueInput.jsx';
import {
  makeFrac, simplify, isSimplified, fracToNumber, fracToText, fracToLatex,
  addFrac, subtractFrac, multiplyFrac, divideFrac, compareFrac,
  comparisonSign, commonDenominator, equivalents, expand, fracToDecimal,
  MAX_DENOMINATOR,
} from './fraction.js';
import { fractionSteps, localizeSteps } from './solutionSteps.js';
import MathText from '../../../../lessons/common/components/MathText.jsx';
import { fracToPercent } from './proportion.js';
import { decimalTextOf, formatNumber, frameValues } from './numberValue.js';

/**
 * §8 à §13 — LES KUSŪR, vues de cinq façons à la fois.
 *
 * Toute la difficulté des fractions tient en une phrase : la même valeur
 * s'écrit de plusieurs manières, et deux écritures différentes peuvent être
 * le même nombre. Ce mode ne l'explique pas — il le MONTRE, en gardant
 * barre, disque, droite, décimal et pourcentage synchronisés en permanence.
 *
 * ── Le geste central : COUPER (§9) ──────────────────────────────────────
 * On clique une part et elle se coupe en deux. La barre passe de 2 à 4
 * parts, le numérateur suit, et l'élève lit `1/2 = 2/4` sans qu'on le lui
 * ait dit. C'est la découverte de l'équivalence par le doigt, et c'est
 * pourquoi le moteur ne réduit JAMAIS tout seul (fraction.js) : réduire
 * automatiquement effacerait exactement ce qu'on veut faire voir.
 *
 * ── §12 : le dénominateur commun se CONSTRUIT ───────────────────────────
 * Pour `1/3 + 1/4`, les deux barres se subdivisent jusqu'à douze, et les
 * nouvelles coupures s'éclairent (`highlight`) — AU PAS du déroulé où les
 * fractions passent au même dénominateur. On voit d'où viennent les
 * douzièmes avant de voir `4/12 + 3/12 = 7/12`.
 *
 * ── Le calcul se déroule (exigence de la propriétaire, 2026-09-30) ──────
 * L'opération n'affiche plus son résultat d'emblée : elle se DÉROULE avec le
 * lecteur partagé (`fractionSteps` → StepList) — PPCM des dénominateurs,
 * fractions converties, numérateurs combinés, résultat (réduit) en DERNIER.
 * La barre-résultat et le signe de la comparaison n'apparaissent qu'à ce
 * dernier pas. Couper / recoller une part, changer une fraction ou
 * l'opération ramène à l'énoncé ; les représentations des deux opérandes
 * (barre, disque, droite, décimal, pourcentage) restent des lectures vivantes.
 */
export default function FractionsMode({ state, onChange, compact }) {
  const { t } = useTranslation('mathlab');
  const { left, right, operation, model } = state;

  const setLeft = useCallback((frac) => onChange({ left: frac }), [onChange]);
  const setRight = useCallback((frac) => onChange({ right: frac }), [onChange]);

  /** §9 — couper chaque part en deux : la valeur ne bouge pas, l'écriture oui. */
  const split = useCallback((which) => {
    const frac = which === 'left' ? left : right;
    if (frac.d * 2 > MAX_DENOMINATOR) return;
    (which === 'left' ? setLeft : setRight)(expand(frac, 2));
  }, [left, right, setLeft, setRight]);

  const merge = useCallback((which) => {
    const frac = which === 'left' ? left : right;
    // On ne recolle que si les deux nombres sont pairs : sinon la part
    // n'existe pas, et mentir ici serait pire que refuser.
    if (frac.n % 2 !== 0 || frac.d % 2 !== 0) return;
    (which === 'left' ? setLeft : setRight)(makeFrac(frac.n / 2, frac.d / 2));
  }, [left, right, setLeft, setRight]);

  const result = useMemo(() => {
    switch (operation) {
      case 'add': return addFrac(left, right);
      case 'subtract': return subtractFrac(left, right);
      case 'multiply': return multiplyFrac(left, right);
      case 'divide': return divideFrac(left, right);
      default: return null;
    }
  }, [left, right, operation]);

  const common = useMemo(() => commonDenominator(left, right), [left, right]);
  // Les valeurs (عشري، %، مختزل) de chaque carte : l'élève peut les masquer.
  const [showFacts, setShowFacts] = useState(() => {
    try { return window.localStorage.getItem('sa-ml-panel:numberLab.fractions.facts') !== '0'; } catch { return true; }
  });
  const toggleFacts = useCallback(() => setShowFacts((value) => {
    try { window.localStorage.setItem('sa-ml-panel:numberLab.fractions.facts', value ? '0' : '1'); } catch { /* ignoré */ }

    return !value;
  }), []);
  const order = compareFrac(left, right);
  const solution = useMemo(() => fractionSteps(left, right, operation), [left, right, operation]);
  const player = useStepReveal(solution.steps.length, {
    resetKey: `${left?.n}/${left?.d}|${operation}|${right?.n}/${right?.d}`,
  });
  const done = player.done && solution.steps.length > 0;
  // Les barres passent au même dénominateur AU pas qui le fait (§12).
  const showCommon = Boolean(common) && solution.commonIndex >= 0 && player.cursor > solution.commonIndex;

  const leftValue = fracToNumber(left);
  const rightValue = fracToNumber(right);
  const view = useMemo(
    () => frameValues([0, 1, leftValue, rightValue], { minSpan: 1.4 }),
    [leftValue, rightValue],
  );

  /** Les parts NOUVELLES après mise au dénominateur commun (§12). */
  const highlightOf = useCallback((converted, factor) => {
    if (!converted || factor <= 1) return null;
    const out = [];
    for (let i = 0; i < converted.n; i += 1) if (i % factor !== 0) out.push(i);

    return out;
  }, []);

  return (
    <div className="sa-ml-nb__mode sa-ml-nb__mode--fractions">
      {/* Les deux fractions, et ce qu'on en fait. */}
      <div className="sa-ml-nb__row sa-ml-nb__row--wrap">
        <ValueInput value={left} onChange={setLeft} label={t('tools.numberLab.fractions.left')} fraction />
        <label className="sa-ml-nb__field">
          <span className="sa-ml-nb__label">{t('tools.numberLab.fractions.operation')}</span>
          <select
            className="sa-ml-nb__select"
            value={operation}
            onChange={(event) => onChange({ operation: event.target.value })}
          >
            {['add', 'subtract', 'multiply', 'divide', 'compare'].map((op) => (
              <option key={op} value={op}>{t(`tools.numberLab.fractions.operations.${op}`)}</option>
            ))}
          </select>
        </label>
        <ValueInput value={right} onChange={setRight} label={t('tools.numberLab.fractions.right')} fraction />
        <label className="sa-ml-nb__field">
          <span className="sa-ml-nb__label">{t('tools.numberLab.fractions.model')}</span>
          <select
            className="sa-ml-nb__select"
            value={model}
            onChange={(event) => onChange({ model: event.target.value })}
          >
            {['bar', 'circle', 'line'].map((m) => (
              <option key={m} value={m}>{t(`tools.numberLab.fractions.models.${m}`)}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="sa-ml-nb__row sa-ml-nb__row--between">
        <p className="sa-ml-nb__hint">{t('tools.numberLab.fractions.hint')}</p>
        <button type="button" className="sa-ml-nb__tiny" onClick={toggleFacts} aria-pressed={showFacts} data-ml-nb-facts-toggle>
          {showFacts ? t('tools.numberLab.fractions.hideFacts') : t('tools.numberLab.fractions.showFacts')}
        </button>
      </div>

      {/* §8 — « D'UN SEUL REGARD » (MATH_LAB §3.5) : les deux fractions ET le
          résultat sur UNE ligne, trois colonnes égales, lue de gauche à droite
          comme au tableau : 1/3 + 1/4 = 7/12. Ce qui accompagnait chaque forme
          (nom, couper / regrouper, valeurs) est posé À CÔTÉ d'elle, pas dessous :
          l'élève voit les formes et le calcul sans faire défiler. */}
      <div className={`sa-ml-nb__fraction-row${operation === 'compare' ? ' is-compare' : ''}`} dir="ltr" data-ml-nb-fraction-row>
        <FractionCard
          frac={showCommon && common ? common.left : left}
          source={left}
          model={model}
          tone="primary"
          highlight={showCommon && common ? highlightOf(common.left, common.leftFactor) : null}
          onSplit={() => split('left')}
          onMerge={() => merge('left')}
          canSplit={left.d * 2 <= MAX_DENOMINATOR}
          canMerge={left.n % 2 === 0 && left.d % 2 === 0}
          showFacts={showFacts}
        />

        <div className="sa-ml-nb__fraction-operator" aria-hidden="true">
          {operation === 'compare' ? ((done && comparisonSign(order)) || '?') : OPERATOR_SIGNS[operation]}
        </div>

        <FractionCard
          frac={showCommon && common ? common.right : right}
          source={right}
          model={model}
          tone="secondary"
          highlight={showCommon && common ? highlightOf(common.right, common.rightFactor) : null}
          onSplit={() => split('right')}
          onMerge={() => merge('right')}
          canSplit={right.d * 2 <= MAX_DENOMINATOR}
          canMerge={right.n % 2 === 0 && right.d % 2 === 0}
          showFacts={showFacts}
        />

        {operation !== 'compare' && (
          <>
            <div className="sa-ml-nb__fraction-operator" aria-hidden="true">=</div>
            {/* La colonne du résultat existe dès le départ (« ؟ ») : la ligne ne
                saute pas quand il arrive, au DERNIER pas du déroulé. */}
            {result && done ? (
              <output className="sa-ml-nb__fraction-card sa-ml-nb__fraction-card--result" data-ml-nb-fraction-answer>
                <FractionShape
                  frac={result.simplified ?? result.raw}
                  model={model}
                  tone="result"
                  width={model === 'circle' ? 132 : 240}
                  showLabel={false}
                />
                <span className="sa-ml-nb__fraction-side">
                  <span className="sa-ml-nb__fraction-raw">{fracToText(result.raw)}</span>
                  {result.simplified && fracToText(result.simplified) !== fracToText(result.raw) && (
                    <span className="sa-ml-nb__fraction-reduced">{`= ${fracToText(result.simplified)}`}</span>
                  )}
                </span>
              </output>
            ) : (
              <div className="sa-ml-nb__fraction-card sa-ml-nb__fraction-card--pending" data-ml-nb-fraction-pending>
                <span className="sa-ml-nb__fraction-unknown" aria-label={t('tools.numberLab.fractions.resultPending')}>?</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* §10, §11, §12 : le calcul, DÉROULÉ — le résultat est le dernier pas. */}
      {solution.steps.length > 0 && (
        <LabPanel
          id="numberLab.fractions.derivation"
          title={t(operation === 'compare' ? 'tools.numberLab.fractions.crossProducts' : 'tools.numberLab.fractions.result')}
          className="sa-ml-nb__derivation"
          dataAttr="data-ml-nb-fraction-derivation"
        >
          <div className="sa-ml-nb__math-line" dir="ltr">
            <MathText>{`$${fracToLatex(left)} ${OPERATOR_LATEX[operation]} ${fracToLatex(right)}${operation === 'compare' ? '' : ' = \\ ?'}$`}</MathText>
          </div>
          <StepPlayer player={player} sticky dataAttr="data-ml-nb-step" />
          <StepList steps={localizeSteps(t, solution.steps)} revealUpTo={player.cursor - 1} dataAttr="data-ml-nb-fraction-steps" />
          {/* « توحيد المقامات » : au pas du PPCM, les deux formes redécoupées par le PPCM. */}
          {solution.commonIndex > 0 && player.cursor >= solution.commonIndex && (
            <CommonDenominatorFigure left={left} right={right} model={model} />
          )}
        </LabPanel>
      )}

      {/* §7, §10 : les deux fractions sur la même droite — repliable (§3.5). */}
      <LabPanel id="numberLab.fractions.line" title={t('tools.numberLab.fractions.lineTitle')} dataAttr="data-ml-nb-panel-line">
        <NumberLineStage
          view={view}
          points={[
            { value: leftValue, frac: left, tone: 'primary', draggable: false },
            { value: rightValue, frac: right, tone: 'secondary', draggable: false },
          ]}
          subdivisions={Math.min(24, common?.denominator ?? left.d)}
          height={compact ? 112 : 128}
        />
      </LabPanel>

      {/* §9 : les équivalentes, toutes la même valeur — repliable (§3.5). */}
      <LabPanel id="numberLab.fractions.equivalents" title={t('tools.numberLab.fractions.equivalents')}>
        <p className="sa-ml-nb__muted">{t('tools.numberLab.fractions.equivalentHint')}</p>
        <ul className="sa-ml-nb__chiplist" dir="ltr">
          {equivalents(left, 8).map((frac) => (
            <li key={`${frac.n}/${frac.d}`}>
              <button
                type="button"
                className={`sa-ml-nb__chip${frac.n === left.n && frac.d === left.d ? ' is-current' : ''}`}
                onClick={() => setLeft(frac)}
              >
                {fracToText(frac)}
              </button>
            </li>
          ))}
        </ul>
      </LabPanel>
    </div>
  );
}

const OPERATOR_SIGNS = Object.freeze({ add: '+', subtract: '−', multiply: '×', divide: '÷', compare: '?' });
const OPERATOR_LATEX = Object.freeze({ add: '+', subtract: '-', multiply: '\\times', divide: '\\div', compare: '\\quad ? \\quad' });

/**
 * §46, §47 — ce qu'une fraction est AUSSI : un décimal, un pourcentage.
 *
 * Affiché sous chaque fraction, en permanence : c'est ainsi que « une valeur,
 * plusieurs représentations » devient une habitude de lecture plutôt qu'un
 * chapitre.
 */
function FractionFacts({ frac, compact = false }) {
  const { t } = useTranslation('mathlab');
  const decimal = fracToDecimal(frac);
  const percent = fracToPercent(frac);
  const reduced = simplify(frac);

  return (
    <dl className="sa-ml-nb__facts" dir="ltr">
      <div>
        <dt>{t(compact ? 'tools.numberLab.fractions.factShort.decimal' : 'tools.numberLab.decimals.toDecimal')}</dt>
        <dd>{decimalTextOf(decimal)}</dd>
      </div>
      <div>
        <dt>%</dt>
        <dd>{Number.isFinite(percent) ? `${formatNumber(percent, 4)} %` : '—'}</dd>
      </div>
      <div>
        <dt>{t(compact ? 'tools.numberLab.fractions.factShort.simplified' : 'tools.numberLab.fractions.simplify')}</dt>
        <dd>
          {isSimplified(frac)
            ? t(compact ? 'tools.numberLab.fractions.factShort.irreducible' : 'tools.numberLab.fractions.alreadySimplified')
            : fracToText(reduced)}
        </dd>
      </div>
    </dl>
  );
}

/**
 * UNE CARTE DE FRACTION — la forme, et à CÔTÉ d'elle (jamais dessous) : son
 * nom, couper / regrouper, et ses valeurs. Sur un écran étroit la carte garde
 * cette disposition : c'est la hauteur qu'on économise.
 */
function FractionCard({ frac, source, model, tone, highlight, onSplit, onMerge, canSplit, canMerge, showFacts }) {
  const { t } = useTranslation('mathlab');

  return (
    <section className={`sa-ml-nb__fraction-card sa-ml-nb__fraction-card--${tone}`}>
      <FractionShape
        frac={frac}
        model={model}
        tone={tone}
        highlight={highlight}
        onSplit={onSplit}
        width={model === 'circle' ? 132 : 240}
        showLabel={false}
      />
      <div className="sa-ml-nb__fraction-side" dir="rtl">
        <span className={`sa-ml-nb__fraction-name sa-ml-nb__fraction-name--${tone}`} dir="ltr">{fracToText(frac)}</span>
        <span className="sa-ml-nb__fraction-actions">
          <button type="button" className="sa-ml-nb__tiny" onClick={onSplit} disabled={!canSplit} title={t('tools.numberLab.fractions.split')} aria-label={t('tools.numberLab.fractions.split')}>
            <Scissors size={13} aria-hidden="true" />
          </button>
          <button type="button" className="sa-ml-nb__tiny" onClick={onMerge} disabled={!canMerge} title={t('tools.numberLab.fractions.merge')} aria-label={t('tools.numberLab.fractions.merge')}>
            <Merge size={13} aria-hidden="true" />
          </button>
        </span>
        {showFacts && <FractionFacts frac={source} compact />}
      </div>
    </section>
  );
}
