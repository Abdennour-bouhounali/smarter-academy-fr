import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MathText from '../../../../lessons/common/components/MathText.jsx';
import { ExamplePicker, LabDisclosure } from '../../shared/LabKit.jsx';
import * as R from './rational.js';
import {
  FUNCTION_FAMILIES, COEFFICIENT_RANGE, COEFFICIENT_STEP, TABLE_SIZE,
  makeFunction, functionLatex, analyseFunction, valueTable, frameFunction, evaluateNumber,
} from './functions.js';
import { latexToText } from './polynomial.js';
import { FUNCTION_EXAMPLES } from './examples.js';
import AlgebraPlane, {
  PlaneLine, PlaneCurve, PlanePoint, PlaneLabel, PlaneSegment,
} from './AlgebraPlane.jsx';

const GREEN = '#008443';
const ORANGE = '#F36D21';
const INK = '#1A1A1A';
const SLATE = '#64748B';

const math = (value) => `$${value}$`;
const plain = (r) => R.toPlainText(r);
const point = (x, y) => `(${plain(x)} ; ${plain(y)})`;

const FIELDS = { linear: ['a'], affine: ['a', 'b'], quadratic: ['a', 'b', 'c'] };

/**
 * الدوال — la famille, les coefficients (curseur ET champ numérique), la
 * courbe sur LE plan, et ce qu'on y lit : ordonnée à l'origine, racines,
 * sommet et axe, le triangle de pente d'une affine (« quand x augmente de 1,
 * f(x) augmente de a »), le sens de variation, un tableau de valeurs.
 * Tout nombre affiché est exact (functions.js) ; le flottant ne fait que
 * dessiner. Un curseur ne recadre pas le plan : seul un changement de
 * famille ou un exemple le fait.
 */
/**
 * `features` : les familles et exemples du مخبر (scope.js) — linéaire et
 * affine seulement au collège.
 */
export default function FunctionsSection({ value, onChange, features = null }) {
  const families = features?.families ?? FUNCTION_FAMILIES;
  const examples = features?.examples ?? FUNCTION_EXAMPLES;
  const { t } = useTranslation('mathlab');
  const [frameVersion, setFrameVersion] = useState(0);
  const [exampleId, setExampleId] = useState(null);

  const fn = useMemo(() => makeFunction(value.family, value), [value]);
  const info = useMemo(() => analyseFunction(fn), [fn]);
  const frame = useMemo(() => frameFunction(fn), [fn]);
  const rows = useMemo(() => valueTable(fn, value.tableStart, value.tableStep, TABLE_SIZE), [fn, value.tableStart, value.tableStep]);
  const latex = functionLatex(fn);

  const setFamily = useCallback((family) => {
    const patch = { family };
    if (family === 'quadratic' && value.a === 0) patch.a = 1;
    onChange(patch);
    setExampleId(null);
    setFrameVersion((v) => v + 1);
  }, [onChange, value.a]);

  const setCoefficient = useCallback((key, raw) => {
    const number = Number(raw);
    if (!Number.isFinite(number)) return;
    const [min, max] = COEFFICIENT_RANGE[key];
    let next = Math.max(min, Math.min(max, Math.round(number / COEFFICIENT_STEP) * COEFFICIENT_STEP));
    // a = 0 effacerait la parabole : on saute zéro dans le sens du geste.
    if (key === 'a' && value.family === 'quadratic' && next === 0) next = value.a > 0 ? -COEFFICIENT_STEP : COEFFICIENT_STEP;
    if (next !== value[key]) onChange({ [key]: next });
  }, [onChange, value]);

  const pick = useCallback((id) => {
    const example = examples.find((item) => item.id === id);
    if (!example) return;
    onChange(example.value);
    setExampleId(id);
    setFrameVersion((v) => v + 1);
  }, [onChange, examples]);

  const a = R.toNumber(fn.a);
  const b = R.toNumber(fn.b);
  const description = t('tools.algebra.functions.planeLabel', { expression: latexToText(latex) });

  return (
    <div className="sa-ml-alg__body" data-ml-alg-mode="functions">
      <div className="sa-ml-alg__stage sa-ml-alg__stage--steps">
        <div className="sa-ml-alg__expression" dir="ltr" data-ml-alg-function={latexToText(latex)}>
          <MathText>{`$$${latex}$$`}</MathText>
        </div>

        <AlgebraPlane frame={frame} frameKey={`${value.family}|${frameVersion}`} label={description}>
          {({ view }) => (
            <>
              {info.vertex && (
                <PlaneLine through={[[R.toNumber(info.vertex.x), 0], [R.toNumber(info.vertex.x), 1]]} view={view} color={SLATE} width={1.5} dashed />
              )}
              {fn.family === 'quadratic'
                ? <PlaneCurve fn={(x) => evaluateNumber(fn, x)} view={view} color={GREEN} />
                : <PlaneLine through={[[0, b], [1, a + b]]} view={view} color={GREEN} width={2.75} dataAttr="data-ml-alg-graph" />}
              {fn.family !== 'quadratic' && a !== 0 && (
                <g data-ml-alg-slope-triangle>
                  <PlaneSegment from={[0, b]} to={[1, b]} color={ORANGE} width={2.5} dashed />
                  <PlaneSegment from={[1, b]} to={[1, a + b]} color={ORANGE} width={2.5} dashed />
                  <PlaneLabel at={[0.5, b]} text="1" color={ORANGE} dx={0} dy={a > 0 ? 18 : -8} anchor="middle" />
                  <PlaneLabel at={[1, b + a / 2]} text={plain(fn.a)} color={ORANGE} dx={8} dy={5} />
                </g>
              )}
              {info.roots.map((root) => (
                <PlanePoint key={root.latex} at={[root.approx, 0]} color={ORANGE} dataAttr="data-ml-alg-root" />
              ))}
              <PlanePoint at={[0, R.toNumber(info.yIntercept.y)]} color={GREEN} dataAttr="data-ml-alg-intercept" />
              <PlaneLabel at={[0, R.toNumber(info.yIntercept.y)]} text={point(R.ZERO, info.yIntercept.y)} color={GREEN} dx={-8} anchor="end" />
              {info.vertex && (
                <>
                  <PlanePoint at={[R.toNumber(info.vertex.x), R.toNumber(info.vertex.y)]} color={INK} dataAttr="data-ml-alg-vertex" />
                  <PlaneLabel at={[R.toNumber(info.vertex.x), R.toNumber(info.vertex.y)]} text={`S${point(info.vertex.x, info.vertex.y)}`} dy={info.opening === 'up' ? 20 : -12} />
                </>
              )}
            </>
          )}
        </AlgebraPlane>

        <KeyFacts fn={fn} info={info} t={t} />

        <div className="sa-ml-alg__table-wrap">
          <table className="sa-ml-alg__table" dir="ltr" data-ml-alg-table>
            <caption className="sa-ml-alg__table-caption">{t('tools.algebra.functions.tableTitle')}</caption>
            <tbody>
              <tr>
                <th scope="row">x</th>
                {rows.map((row) => <td key={`x${plain(row.x)}`}>{plain(row.x)}</td>)}
              </tr>
              <tr>
                <th scope="row">f(x)</th>
                {rows.map((row) => <td key={`y${plain(row.x)}`}>{plain(row.y)}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="sa-ml-alg__sr">{description}</p>
      </div>

      <div className="sa-ml-alg__panel">
        <div className="sa-ml-alg__panel-body">
          <section className="sa-ml-alg__section">
            <h3 className="sa-ml-alg__heading">{t('tools.algebra.functions.heading')}</h3>
            <div className="sa-ml-alg__methods" role="group" aria-label={t('tools.algebra.functions.familyLabel')}>
              {families.map((family) => (
                <button
                  key={family}
                  type="button"
                  className={`sa-ml-alg__method${value.family === family ? ' is-active' : ''}`}
                  aria-pressed={value.family === family}
                  onClick={() => setFamily(family)}
                  data-ml-alg-family={family}
                >
                  {t(`tools.algebra.functions.families.${family}`)}
                </button>
              ))}
            </div>
            <p className="sa-ml-alg__family-form" dir="ltr">
              <MathText>{t(`tools.algebra.functions.forms.${value.family}`)}</MathText>
            </p>

            {FIELDS[value.family].map((key) => {
              const [min, max] = COEFFICIENT_RANGE[key];

              return (
                <div className="sa-ml-alg__param" key={key}>
                  <label className="sa-ml-alg__param-label" htmlFor={`sa-ml-alg-fn-${key}`}>
                    <span dir="ltr" lang="en">{key}</span>
                    <input
                      className="sa-ml-alg__param-number"
                      type="number"
                      dir="ltr"
                      lang="en"
                      min={min}
                      max={max}
                      step={COEFFICIENT_STEP}
                      value={value[key]}
                      onChange={(event) => setCoefficient(key, event.target.value)}
                      aria-label={t('tools.algebra.functions.coefficientValue', { name: key })}
                      data-ml-alg-coef-number={key}
                    />
                  </label>
                  <input
                    id={`sa-ml-alg-fn-${key}`}
                    className="sa-ml-alg__param-slider"
                    type="range"
                    min={min}
                    max={max}
                    step={COEFFICIENT_STEP}
                    value={value[key]}
                    onChange={(event) => setCoefficient(key, event.target.value)}
                    data-ml-alg-coef={key}
                  />
                </div>
              );
            })}

            <div className="sa-ml-alg__table-controls">
              <label className="sa-ml-alg__field-label" htmlFor="sa-ml-alg-table-start">{t('tools.algebra.functions.tableStart')}</label>
              <input
                id="sa-ml-alg-table-start"
                className="sa-ml-alg__param-number"
                type="number"
                dir="ltr"
                lang="en"
                step="0.5"
                min="-50"
                max="50"
                value={value.tableStart}
                onChange={(event) => { const n = Number(event.target.value); if (Number.isFinite(n)) onChange({ tableStart: Math.max(-50, Math.min(50, Math.round(n * 2) / 2)) }); }}
                data-ml-alg-table-start
              />
              <label className="sa-ml-alg__field-label" htmlFor="sa-ml-alg-table-step">{t('tools.algebra.functions.tableStep')}</label>
              <input
                id="sa-ml-alg-table-step"
                className="sa-ml-alg__param-number"
                type="number"
                dir="ltr"
                lang="en"
                step="0.5"
                min="0.5"
                max="10"
                value={value.tableStep}
                onChange={(event) => { const n = Math.round(Number(event.target.value) * 2) / 2; if (Number.isFinite(n) && n !== 0) onChange({ tableStep: Math.max(-10, Math.min(10, n)) }); }}
                data-ml-alg-table-step
              />
            </div>

            <ExamplePicker examples={examples} onPick={pick} activeId={exampleId} dataAttr="data-ml-alg-example" />
          </section>

          <LabDisclosure kind="rule" dataAttr="data-ml-alg-rule">
            <MathText>{t(`tools.algebra.functions.rule.${value.family}`)}</MathText>
          </LabDisclosure>
        </div>
      </div>
    </div>
  );
}

/** Ce qu'on LIT sur la courbe, en phrases — l'équivalent textuel du dessin. */
function KeyFacts({ fn, info, t }) {
  const facts = [];
  const yLatex = R.toLatex(info.yIntercept.y);

  if (fn.family === 'linear') {
    facts.push({ id: 'origin', text: t('tools.algebra.functions.facts.linearOrigin') });
    if (!R.isZero(fn.a)) facts.push({ id: 'proportional', text: t('tools.algebra.functions.facts.proportional', { a: math(R.toLatex(fn.a)) }) });
  } else {
    facts.push({
      id: 'intercept',
      text: t(fn.family === 'affine' ? 'tools.algebra.functions.facts.interceptAffine' : 'tools.algebra.functions.facts.intercept', { b: math(yLatex), point: math(`\\left(0\\,;\\,${yLatex}\\right)`) }),
    });
  }

  if (fn.family !== 'quadratic') {
    const aLatex = R.toLatex(fn.a);
    const abs = R.toLatex(R.isNegative(fn.a) ? R.negate(fn.a) : fn.a);
    const slopeKey = R.sign(fn.a) > 0 ? 'slopeUp' : (R.sign(fn.a) < 0 ? 'slopeDown' : 'slopeZero');
    facts.push({ id: 'slope', text: t(`tools.algebra.functions.facts.${slopeKey}`, { a: math(aLatex), abs: math(abs) }) });
  } else {
    facts.push({ id: 'opening', text: t(`tools.algebra.functions.facts.opening.${info.opening}`, { a: math(R.toLatex(fn.a)) }) });
    facts.push({
      id: 'vertex',
      text: t('tools.algebra.functions.facts.vertex', {
        point: math(`S\\left(${R.toLatex(info.vertex.x)}\\,;\\,${R.toLatex(info.vertex.y)}\\right)`),
        axis: math(`x = ${R.toLatex(info.vertex.x)}`),
      }),
    });
  }

  facts.push({ id: 'monotony', text: t(`tools.algebra.functions.facts.monotony.${info.monotony}`, info.vertex ? { x: math(R.toLatex(info.vertex.x)) } : {}) });

  if (info.rootsKind === 'none') facts.push({ id: 'roots', text: t('tools.algebra.functions.facts.noRoot') });
  else if (info.rootsKind === 'all') facts.push({ id: 'roots', text: t('tools.algebra.functions.facts.allRoots') });
  else {
    const list = info.roots.map((root) => math(`x = ${root.latex}`)).join(' ، ');
    facts.push({ id: 'roots', text: t(info.roots.length === 1 ? 'tools.algebra.functions.facts.oneRoot' : 'tools.algebra.functions.facts.twoRoots', { roots: list }) });
  }

  return (
    <ul className="sa-ml-alg__facts" data-ml-alg-facts>
      {facts.map((fact) => (
        <li key={fact.id} data-ml-alg-fact={fact.id}><MathText>{fact.text}</MathText></li>
      ))}
    </ul>
  );
}
