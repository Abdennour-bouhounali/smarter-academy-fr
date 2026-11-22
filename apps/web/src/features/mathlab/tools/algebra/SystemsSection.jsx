import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Crosshair, CheckCircle2 } from 'lucide-react';
import MathText from '../../../../lessons/common/components/MathText.jsx';
import { ExamplePicker, LabDisclosure, LabMessage } from '../../shared/LabKit.jsx';
import StepPlayer from '../../shared/StepPlayer.jsx';
import useStepReveal from '../../shared/useStepReveal.js';
import MathBoard from '../../shared/mathBoard/MathBoard.jsx';
import useBoardPractice from '../../shared/mathBoard/useBoardPractice.js';
import { boardProgress } from '../../shared/mathBoard/frames.js';
import * as R from './rational.js';
import {
  parseLinearEquation, classifySystem, substitutionSteps, eliminationSteps, verifyInEquation,
  frameSystem, linePoints, sourceLatex, pairLatex,
} from './systems.js';
import { SYSTEM_METHODS } from './algebraState.js';
import { SYSTEM_EXAMPLES } from './examples.js';
import { eliminationFrames, substitutionFrames, graphicalFrames } from './systemsFrames.js';
import AlgebraPlane, { PlaneLine, PlanePoint, PlaneLabel } from './AlgebraPlane.jsx';

const LINE_COLORS = ['#008443', '#F36D21'];

/**
 * حل الأنظمة — une جملة معادلتين, trois méthodes. Le raisonnement se
 * construit au tableau (systemsFrames.js), geste par geste : les termes en y
 * désignés, leur somme ↓0, l'addition des deux équations, ÷2 sous les deux
 * membres, la valeur qui remplace x (en vert)… Le couple est le DERNIER
 * frame ; son verdict et sa vérification n'arrivent qu'après. La méthode
 * graphique se construit aussi : droite (1), droite (2), le point, sa
 * lecture — le plan ne trace que ce que le frame courant permet.
 *
 * « حلّ خطوة بخطوة » charge la جملة ET démarre ; un exemple ou un changement
 * de méthode ramène à l'énoncé.
 */
export default function SystemsSection({ value, onChange, announce }) {
  const { t } = useTranslation('mathlab');
  const [drafts, setDrafts] = useState({ first: value.first, second: value.second });
  const [errors, setErrors] = useState({ first: null, second: null });
  const [exampleId, setExampleId] = useState(null);
  const [frameKey, setFrameKey] = useState(0);

  const parsed = useMemo(() => {
    const e1 = parseLinearEquation(value.first);
    const e2 = parseLinearEquation(value.second);
    if (!e1.ok || !e2.ok) return null;

    return { e1: e1.equation, e2: e2.equation, verdict: classifySystem(e1.equation, e2.equation) };
  }, [value.first, value.second]);

  // Tout le raisonnement de la méthode choisie, calculé d'avance, montré geste par geste.
  const outcome = useMemo(() => {
    if (!parsed) return null;
    if (value.method === 'elimination') return eliminationSteps(parsed.e1, parsed.e2);
    if (value.method === 'substitution') return substitutionSteps(parsed.e1, parsed.e2);

    return parsed.verdict;
  }, [parsed, value.method]);
  const frames = useMemo(() => {
    if (!parsed || !outcome || outcome.kind === 'error') return [];
    if (value.method === 'elimination') return eliminationFrames(outcome, parsed.e1, parsed.e2);
    if (value.method === 'substitution') return substitutionFrames(outcome, parsed.e1);

    return graphicalFrames(parsed.e1, parsed.e2, parsed.verdict);
  }, [parsed, outcome, value.method]);
  const player = useStepReveal(frames.length, { resetKey: `${value.first}|${value.second}|${value.method}` });
  // « تدرّب بنفسك » : désigner les termes à éliminer, l'inconnue à remplacer… (البياني : pas d'exercice, le plan se regarde).
  const practice = useBoardPractice(frames, player, `${value.first}|${value.second}|${value.method}`);
  const done = player.phase === 'completed';

  const errorText = useCallback((error) => t(`tools.algebra.systems.errors.${error.code}`, {
    defaultValue: t(`tools.algebra.exprErrors.${error.code}`, { defaultValue: t('tools.algebra.exprErrors.syntax'), symbol: error.symbol ?? '' }),
  }), [t]);

  const load = useCallback((first, second) => {
    const e1 = parseLinearEquation(first);
    const e2 = parseLinearEquation(second);
    setErrors({ first: e1.ok ? null : errorText(e1.error), second: e2.ok ? null : errorText(e2.error) });
    if (!e1.ok || !e2.ok) return false;
    onChange({ first: first.slice(0, 120), second: second.slice(0, 120) });
    setFrameKey((key) => key + 1);
    announce(t('tools.algebra.systems.announce'));

    return true;
  }, [onChange, errorText, announce, t]);

  const submit = useCallback((event) => {
    event.preventDefault();
    setExampleId(null);
    if (load(drafts.first, drafts.second)) player.start();
  }, [drafts, load, player]);

  const pick = useCallback((id) => {
    const example = SYSTEM_EXAMPLES.find((item) => item.id === id);
    if (!example) return;
    setDrafts({ first: example.first, second: example.second });
    // Un exemple POSE l'énoncé ; seul le bouton d'action démarre le déroulé.
    if (load(example.first, example.second)) setExampleId(id);
    player.rewind();
  }, [load, player]);

  const systemLatex = useMemo(() => {
    const a = sourceLatex(value.first);
    const b = sourceLatex(value.second);

    return a && b ? `\\begin{cases} ${a} & (1) \\\\ ${b} & (2) \\end{cases}` : null;
  }, [value.first, value.second]);

  return (
    <div className="sa-ml-alg__body" data-ml-alg-mode="systems">
      <div className="sa-ml-alg__stage sa-ml-alg__stage--steps">
        {frames.length > 0 && (
          <StepPlayer player={player} sticky progress={boardProgress(frames, player.cursor)} dataAttr="data-ml-alg-step" {...practice.player} />
        )}

        <div className="sa-ml-alg__methods" role="group" aria-label={t('tools.algebra.systems.methodLabel')}>
          {SYSTEM_METHODS.map((method) => (
            <button
              key={method}
              type="button"
              className={`sa-ml-alg__method${value.method === method ? ' is-active' : ''}`}
              aria-pressed={value.method === method}
              onClick={() => onChange({ method })}
              data-ml-alg-method={method}
            >
              {t(`tools.algebra.systems.methods.${method}`)}
            </button>
          ))}
        </div>

        {outcome?.kind === 'error' && (
          <LabMessage tone="error">{t(`tools.algebra.exprErrors.${outcome.error.code}`, { defaultValue: t('tools.algebra.exprErrors.overflow') })}</LabMessage>
        )}

        {systemLatex && (
          <div
            className="sa-ml-alg__work"
            data-ml-alg-system
            data-ml-alg-system-steps={value.method}
            data-ml-alg-system-kind={done && outcome ? outcome.kind : 'pending'}
          >
            <MathBoard
              frames={frames}
              cursor={player.cursor}
              problem={systemLatex}
              label={t('tools.algebra.boardLabel')}
              dataAttr="data-ml-alg-board"
              {...practice.board}
            />
            {parsed && value.method === 'graphical' && (
              <Graphical parsed={parsed} frameKey={`${frameKey}|${value.first}|${value.second}`} draw={player.cursor > 0 ? frames[player.cursor - 1]?.draw ?? 0 : 0} />
            )}
            {done && parsed && outcome && outcome.kind !== 'error' && <Verdict outcome={outcome} e1={parsed.e1} e2={parsed.e2} />}
          </div>
        )}
      </div>

      <div className="sa-ml-alg__panel">
        <div className="sa-ml-alg__panel-body">
          <section className="sa-ml-alg__section">
            <h3 className="sa-ml-alg__heading">{t('tools.algebra.systems.heading')}</h3>
            <form className="sa-ml-alg__system-form" onSubmit={submit}>
              {['first', 'second'].map((key, index) => (
                <div key={key} className="sa-ml-alg__system-field">
                  <label className="sa-ml-alg__field-label" htmlFor={`sa-ml-alg-system-${key}`}>
                    {t('tools.algebra.systems.equationLabel', { index: index + 1 })}
                  </label>
                  <input
                    id={`sa-ml-alg-system-${key}`}
                    className="sa-ml-alg__input"
                    type="text"
                    dir="ltr"
                    lang="en"
                    autoComplete="off"
                    spellCheck="false"
                    value={drafts[key]}
                    onChange={(event) => {
                      const next = event.target.value;
                      setDrafts((current) => ({ ...current, [key]: next }));
                      setErrors((current) => ({ ...current, [key]: null }));
                    }}
                    placeholder={index === 0 ? '2x + 3y = 12' : 'y = 2x - 1'}
                    aria-invalid={errors[key] ? 'true' : undefined}
                    aria-describedby={errors[key] ? `sa-ml-alg-system-${key}-error` : undefined}
                    data-ml-alg-system-input={key}
                  />
                  {errors[key] && <LabMessage tone="error" id={`sa-ml-alg-system-${key}-error`}>{errors[key]}</LabMessage>}
                </div>
              ))}
              <button type="submit" className="sa-ml-alg__explore" data-ml-alg-system-run>
                <Crosshair size={15} aria-hidden="true" />
                {t('tools.algebra.systems.run')}
              </button>
            </form>
            <p className="sa-ml-alg__hint">{t('tools.algebra.systems.hint')}</p>
            <ExamplePicker examples={SYSTEM_EXAMPLES} onPick={pick} activeId={exampleId} dataAttr="data-ml-alg-example" />
          </section>

          <LabDisclosure kind="rule" dataAttr="data-ml-alg-rule">
            <ul className="sa-ml-alg__rules">
              {['substitution', 'elimination', 'graphical'].map((method) => (
                <li key={method}><MathText>{t(`tools.algebra.systems.ruleText.${method}`)}</MathText></li>
              ))}
            </ul>
          </LabDisclosure>
          <LabDisclosure kind="why">
            <p className="sa-ml-alg__prose">{t('tools.algebra.systems.why')}</p>
          </LabDisclosure>
        </div>
      </div>
    </div>
  );
}

/** Le verdict et, pour un couple, sa vérification dans LES DEUX équations. */
function Verdict({ outcome, e1, e2 }) {
  const { t } = useTranslation('mathlab');
  if (outcome.kind !== 'unique') {
    return (
      <LabMessage tone="info">
        <span data-ml-alg-system-verdict={outcome.kind}>{t(`tools.algebra.systems.verdict.${outcome.kind}`)}</span>
      </LabMessage>
    );
  }
  const checks = [e1, e2].map((eq) => verifyInEquation(eq, outcome.x, outcome.y));

  return (
    <>
      <div className="sa-ml-alg__result" data-ml-alg-system-verdict="unique">
        <span className="sa-ml-alg__result-label">{t('tools.algebra.systems.verdict.unique')}</span>
        <span dir="ltr"><MathText>{`$${pairLatex(outcome.x, outcome.y)}$`}</MathText></span>
      </div>
      <div className="sa-ml-alg__check" data-ml-alg-system-verify={String(checks.every((c) => c.holds))}>
        <CheckCircle2 size={18} aria-hidden="true" />
        <div>
          <p className="sa-ml-alg__check-title">{t('tools.algebra.systems.verifyTitle')}</p>
          {checks.map((check, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index} dir="ltr" className="sa-ml-alg__check-line">
              <MathText>{`$(${index + 1})\\quad ${check.substituted} \\;\\Rightarrow\\; ${check.evaluated}\\;${check.holds ? '\\checkmark' : '\\times'}$`}</MathText>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/**
 * البياني : le plan suit le tableau — `draw` (du frame courant) dit ce qu'il a le droit
 * de tracer : 1 = la droite (1), 2 = les deux, 3 = + le point commun, 4 = + ses coordonnées.
 */
function Graphical({ parsed, frameKey, draw }) {
  const { t } = useTranslation('mathlab');
  const { e1, e2, verdict } = parsed;
  const frame = useMemo(() => frameSystem([e1, e2], verdict), [e1, e2, verdict]);
  const point = verdict.kind === 'unique' && draw >= 3 ? [R.toNumber(verdict.x), R.toNumber(verdict.y)] : null;
  const pointText = verdict.kind === 'unique' && draw >= 4 ? `(${R.toPlainText(verdict.x)} ; ${R.toPlainText(verdict.y)})` : null;
  const shown = [e1, e2].slice(0, Math.min(2, draw));
  // La description textuelle (§34) ne dit que ce qui est tracé : jamais le point avant sa lecture.
  let description = t('tools.algebra.systems.graphDescriptionPending');
  if (pointText) description = t('tools.algebra.systems.graphDescriptionUnique', { point: pointText });
  else if (draw >= 2 && verdict.kind !== 'unique') description = t(`tools.algebra.systems.graphDescription.${verdict.kind}`);

  return (
    <div className="sa-ml-alg__graph" data-ml-alg-system-graph={draw >= 2 ? verdict.kind : 'pending'} data-ml-alg-graph-draw={draw}>
      <AlgebraPlane frame={frame} frameKey={frameKey} label={description}>
        {({ view }) => (
          <>
            {shown.map((eq, index) => (
              <PlaneLine
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                through={linePoints(eq)}
                view={view}
                color={LINE_COLORS[index]}
                width={index === 1 && verdict.kind === 'infinite' ? 5 : 2.75}
                dashed={index === 1 && verdict.kind === 'infinite'}
                dataAttr="data-ml-alg-line"
              />
            ))}
            {point && <PlanePoint at={point} color="#1A1A1A" radius={6.5} dataAttr="data-ml-alg-intersection" />}
            {point && pointText && <PlaneLabel at={point} text={pointText} />}
          </>
        )}
      </AlgebraPlane>

      <ul className="sa-ml-alg__legend" dir="ltr">
        {shown.map((eq, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={index}>
            <span className="sa-ml-alg__legend-swatch" style={{ background: LINE_COLORS[index] }} aria-hidden="true" />
            <MathText>{`$(${index + 1})$`}</MathText>
          </li>
        ))}
      </ul>
      <p className="sa-ml-alg__sr">{description}</p>
    </div>
  );
}
