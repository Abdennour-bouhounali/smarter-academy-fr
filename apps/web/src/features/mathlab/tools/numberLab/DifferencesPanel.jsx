import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight } from 'lucide-react';
import MathText from '../../../../lessons/common/components/MathText.jsx';
import { LabDisclosure, ExamplePicker, LabMessage, LabPanel } from '../../shared/LabKit.jsx';
import StepPlayer from '../../shared/StepPlayer.jsx';
import MathBoard from '../../shared/mathBoard/MathBoard.jsx';
import useBoardPractice from '../../shared/mathBoard/useBoardPractice.js';
import { boardProgress } from '../../shared/mathBoard/frames.js';
import {
  compareMethods, ribbonGeometry, DIFFERENCE_EXAMPLES, randomDifferencePair, DISPLAY_CAP,
} from './differences.js';
import { differencesDrawing, pgcdProblem } from './gcdFrames.js';

/**
 * حساب PGCD بالفوارق المتتالية — l'expérience PGCD PRINCIPALE du laboratoire.
 *
 *     48 − 18 = 30 ; 30 − 18 = 12 ; 18 − 12 = 6 ; 12 − 6 = 6 ; 6 − 6 = 0
 *     → PGCD(48 ; 18) = 6
 *
 * On MONTRE l'algorithme, on ne donne pas un PGCD calculé d'avance. Chaque
 * soustraction se fait AU TABLEAU (MathBoard, frames de `gcdFrames.js`) :
 * le couple désigné, l'arc « − », la différence qui tombe, le nouveau couple
 * acquis ; le PGCD est le DERNIER pas. Le curseur est celui du lecteur
 * partagé (`useStepReveal`, tenu par GcdLcmMode) — état d'interface, jamais
 * enregistré.
 *
 * Deux rubans À L'ÉCHELLE suivent le curseur : le couple désigné est entier,
 * puis, quand la différence tombe, le petit est coupé du grand (orange) et ce
 * qui reste est la différence. Le tableau des pas est l'équivalent textuel du
 * dessin ; l'annonce `aria-live` ne dit jamais le PGCD avant son pas.
 */
export default function DifferencesPanel({ a, b, onChange, reducedMotion, board, player }) {
  const { t } = useTranslation('mathlab');
  const [announcement, setAnnouncement] = useState('');
  const K = 'tools.numberLab.gcdLcm.differences';
  const run = board?.run ?? null;
  const frames = board?.frames ?? [];
  const { cursor } = player;
  const drawing = differencesDrawing(frames, cursor);
  const revealed = drawing ? drawing.index + (drawing.cut ? 1 : 0) : 0;
  const current = drawing ? run.steps[drawing.index] : null;
  const finished = player.done && run && !run.truncated;
  // « تدرّب بنفسك » : l'élève désigne lui-même le couple et choisit « − ».
  const practice = useBoardPractice(frames, player, `${a}|${b}`);

  useEffect(() => {
    if (!run) return;
    const frame = cursor > 0 ? frames[cursor - 1] : null;
    if (frame?.meta?.kind === 'result') setAnnouncement(t(`${K}.announceDone`, { gcd: run.gcd }));
    else if (frame?.meta?.phase === 'result' && current) {
      setAnnouncement(t(`${K}.announce`, { n: drawing.index + 1, big: current.big, small: current.small, diff: current.diff }));
    } else if (cursor === 0) setAnnouncement('');
  }, [cursor]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!run) return null;

  const examples = DIFFERENCE_EXAMPLES.map((example) => ({ ...example, label: `${example.a} ; ${example.b}` }));
  const activeExample = DIFFERENCE_EXAMPLES.find((example) => example.a === a && example.b === b)?.id ?? null;
  const comparison = finished ? compareMethods(a, b) : null;

  return (
    <section className="sa-ml-nb__panel sa-ml-nb__diff" data-ml-nb-differences data-ml-nb-diff-cursor={cursor}>
      <h4>{t(`${K}.title`)}</h4>
      <p className="sa-ml-nb__muted">{t(`${K}.intro`)}</p>

      <ExamplePicker
        examples={examples}
        activeId={activeExample}
        onPick={(id) => {
          const example = DIFFERENCE_EXAMPLES.find((e) => e.id === id);
          if (example) onChange({ a: example.a, b: example.b });
        }}
        onRandom={() => onChange(randomDifferencePair())}
        dataAttr="data-ml-nb-diff-example"
      />

      {run.truncated && (
        <LabMessage tone="info">
          {t(`${K}.truncated`, { total: run.total, shown: DISPLAY_CAP })}
          {' '}
          {t(`${K}.truncatedEuclid`, { divisions: run.divisions })}
          {' '}
          <button type="button" className="sa-ml-nb__link" onClick={() => onChange({ method: 'euclid' })} data-ml-nb-go-euclid>
            {t(`${K}.goEuclid`)}
          </button>
        </LabMessage>
      )}

      {/* Le lecteur partagé, collé en haut de la zone qui défile. */}
      <StepPlayer player={player} {...practice.player} sticky progress={boardProgress(frames, cursor)} dataAttr="data-ml-nb-step" />

      {cursor === 0 && <p className="sa-ml-nb__hint">{t(`${K}.startHint`)}</p>}

      {/* « D'un seul regard » (MATH_LAB §3.5) : les rubans À CÔTÉ du tableau qui les coupe. */}
      <div className="sa-ml-nb__duo" dir="ltr">
        <div className="sa-ml-nb__duo-figure" dir="rtl">
          <Ribbons
            step={drawing?.cut ? current : null}
            start={current && !drawing.cut
              ? { big: current.big, small: current.small }
              : { big: Math.max(a, b), small: Math.min(a, b) }}
            scaleMax={Math.max(a, b)}
            cursor={cursor}
            reducedMotion={reducedMotion}
          />
        </div>
        {/* Le tableau : l'énoncé, les soustractions acquises, la soustraction EN COURS. */}
        <div className="sa-ml-nb__board sa-ml-nb__duo-board" dir="rtl" data-ml-nb-diff-board {...(finished ? { 'data-ml-nb-diff-result': run.gcd } : {})}>
          <MathBoard {...practice.board} frames={frames} cursor={cursor} problem={pgcdProblem(a, b)} dataAttr="data-ml-nb-diff-frame" />
        </div>
      </div>

      {finished && a === b && <LabMessage tone="info">{t(`${K}.equal`)}</LabMessage>}
      {player.done && run.truncated && <LabMessage tone="info">{t(`${K}.noGcdYet`)}</LabMessage>}

      {/* Le tableau des pas — l'équivalent textuel du dessin : une ligne par différence TOMBÉE. */}
      {revealed > 0 && (
        <LabPanel id="numberLab.gcdLcm.diffTable" title={t(`${K}.tableCaption`)}>
        <div className="sa-ml-nb__table-wrap">
          <table className="sa-ml-nb__table sa-ml-nb__diff-table" data-ml-nb-diff-table={revealed}>
            <caption className="sa-ml-nb__sr">{t(`${K}.tableCaption`)}</caption>
            <thead>
              <tr>
                <th scope="col">{t(`${K}.stepNumber`)}</th>
                <th scope="col">{t(`${K}.currentPair`)}</th>
                <th scope="col">{t(`${K}.subtraction`)}</th>
                <th scope="col">{t(`${K}.newPair`)}</th>
              </tr>
            </thead>
            <tbody>
              {run.steps.slice(0, revealed).map((step) => (
                <tr key={step.index} className={step.index === revealed - 1 ? 'is-current' : undefined}>
                  <td><bdi dir="ltr">{step.index + 1}</bdi></td>
                  <td><bdi dir="ltr" className="sa-ml-nb__ltr">{`(${step.big} ; ${step.small})`}</bdi></td>
                  <td><bdi dir="ltr" className="sa-ml-nb__ltr">{`${step.big} − ${step.small} = ${step.diff}`}</bdi></td>
                  <td>
                    <bdi dir="ltr" className="sa-ml-nb__ltr">
                      {step.diff === 0 ? `(${step.small} ; 0)` : `(${step.next[0]} ; ${step.next[1]})`}
                    </bdi>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </LabPanel>
      )}

      <LabDisclosure kind="why" title={t(`${K}.whyTitle`)} dataAttr="data-ml-nb-diff-why">
        <p><MathText>{t(`${K}.why1`)}</MathText></p>
        <p>{t(`${K}.why2`)}</p>
        <div className="sa-ml-nb__math-line" dir="ltr">
          <MathText>{'$\\mathrm{PGCD}(a\\ ;\\ b) = \\mathrm{PGCD}(b\\ ;\\ a - b)$'}</MathText>
        </div>
        <p>{t(`${K}.why3`)}</p>
      </LabDisclosure>

      {/* La comparaison avec Euclide redit le PGCD : elle n'existe qu'APRÈS le dernier pas. */}
      {comparison && (
        <LabDisclosure kind="next" title={t(`${K}.compareTitle`)} dataAttr="data-ml-nb-diff-compare">
          <p>{t(`${K}.compareIntro`)}</p>
          <ul className="sa-ml-nb__compare" data-ml-nb-compare>
            <li>
              <span>{t(`${K}.byDifferences`)}</span>
              <strong data-ml-nb-compare-differences={comparison.differences}>{t(`${K}.stepsCount`, { count: comparison.differences })}</strong>
            </li>
            <li>
              <span>{t(`${K}.byDivisions`)}</span>
              <strong data-ml-nb-compare-divisions={comparison.divisions}>{t(`${K}.divisionsCount`, { count: comparison.divisions })}</strong>
            </li>
          </ul>
          <p className="sa-ml-nb__muted">
            {comparison.divisions < comparison.differences ? t(`${K}.compareFaster`) : t(`${K}.compareSame`)}
          </p>
          <ol className="sa-ml-nb__compare-steps">
            {comparison.euclidSteps.slice(0, 12).map((step, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <li key={index}>
                <MathText>{`$${step.a} = ${step.b} \\times ${step.q} + ${step.r}$`}</MathText>
                <span className="sa-ml-nb__step-note">{`(${t(`${K}.stepsCount`, { count: step.q })})`}</span>
              </li>
            ))}
          </ol>
          <button type="button" className="sa-ml-nb__button sa-ml-nb__button--ghost" onClick={() => onChange({ method: 'euclid' })}>
            <ArrowLeftRight size={14} aria-hidden="true" />
            {t(`${K}.goEuclid`)}
          </button>
        </LabDisclosure>
      )}

      <p className="sa-ml-nb__sr" aria-live="polite">{announcement}</p>
    </section>
  );
}

/**
 * Les deux rubans, à l'échelle du plus grand nombre de départ. SVG en LTR :
 * la mesure part de la gauche, comme sur une règle.
 */
function Ribbons({ step, start, scaleMax, cursor, reducedMotion }) {
  const { t } = useTranslation('mathlab');
  const K = 'tools.numberLab.gcdLcm.differences';
  const W = 520;
  const LABEL = 70;
  const H = 30;
  const shown = step ?? { big: start.big, small: start.small, diff: start.big - start.small };
  const geometry = ribbonGeometry(shown, scaleMax);
  if (!geometry) return null;
  const minW = 3;
  const px = (fraction) => Math.max(minW, fraction * W);

  return (
    <figure className="sa-ml-nb__ribbons" data-ml-nb-ribbons>
      <svg
        viewBox={`0 0 ${W + LABEL} ${2 * H + 34}`}
        width="100%"
        role="img"
        aria-label={step
          ? t(`${K}.ribbonsLabel`, { big: step.big, small: step.small, diff: step.diff })
          : t(`${K}.ribbonsStart`, { big: start.big, small: start.small })}
        style={{ direction: 'ltr' }}
      >
        {/* Le GRAND ruban : la pièce coupée (orange) puis ce qui reste. */}
        {step ? (
          <>
            <rect
              key={`rest-${cursor}`}
              x={geometry.cut.to * W} y={6} width={Math.max(step.diff > 0 ? minW : 0, (geometry.rest.to - geometry.rest.from) * W)} height={H}
              rx={4} className="sa-ml-nb__ribbon is-rest"
            />
            <rect
              key={`cut-${cursor}`}
              x={0} y={6} width={px(geometry.cut.to)} height={H} rx={4}
              className={`sa-ml-nb__ribbon is-cut${reducedMotion ? '' : ' is-animated'}`}
            />
          </>
        ) : (
          <rect x={0} y={6} width={px(geometry.big)} height={H} rx={4} className="sa-ml-nb__ribbon is-big" />
        )}
        <text x={Math.min(W, px(geometry.big)) + 8} y={6 + H / 2} dominantBaseline="central" className="sa-ml-nb__ribbon-value">
          {shown.big}
        </text>

        {/* Le PETIT ruban : la longueur qu'on retire. */}
        <rect x={0} y={H + 22} width={px(geometry.small)} height={H} rx={4} className="sa-ml-nb__ribbon is-small" />
        <text x={Math.min(W, px(geometry.small)) + 8} y={H + 22 + H / 2} dominantBaseline="central" className="sa-ml-nb__ribbon-value">
          {shown.small}
        </text>
      </svg>
      <figcaption className="sa-ml-nb__ribbon-legend">
        <span><i className="sa-ml-nb__swatch is-small" aria-hidden="true" />{t(`${K}.smallLabel`)}</span>
        {step && <span><i className="sa-ml-nb__swatch is-cut" aria-hidden="true" />{t(`${K}.cutLabel`)}</span>}
        {step && <span><i className="sa-ml-nb__swatch is-rest" aria-hidden="true" />{t(`${K}.restLabel`)}</span>}
        <span className="sa-ml-nb__muted">{t(`${K}.scaleNote`)}</span>
      </figcaption>
      {geometry.thin && <p className="sa-ml-nb__muted">{t(`${K}.thin`)}</p>}
    </figure>
  );
}
