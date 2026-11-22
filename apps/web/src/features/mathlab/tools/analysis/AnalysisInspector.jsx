import { useTranslation } from 'react-i18next';
import { Footprints } from 'lucide-react';
import VariationTable from './VariationTable.jsx';
import { buildVariationTable, buildVariationSteps, tableRowsAt } from './variationTable.js';
import StepPlayer from '../../shared/StepPlayer.jsx';
import { StepList, LabPanel } from '../../shared/LabKit.jsx';
import {
  formatValue, formatApproximate, formatMaybeExact, formatPoint, formatLimit,
  formatInterval, formatLine, formatApproach,
} from './analysisFormat.js';

/**
 * LA LECTURE : ce que le laboratoire a trouvé, écrit honnêtement.
 *
 * Deux règles gouvernent ce fichier, et elles viennent de §35 :
 *
 * 1. **Une valeur MESURÉE ne s'écrit jamais comme une valeur EXACTE.** Une
 *    pente issue de la règle de dérivation s'affiche `= 4` ; la même pente
 *    mesurée numériquement s'affiche `≈ 4`, et une note le dit. Les limites
 *    et les intégrales sont TOUJOURS approchées ici, parce qu'elles sont
 *    lues sur une table ou calculées par quadrature — jamais démontrées.
 *
 * 2. **Un refus est une réponse.** Quand la dérivée n'existe pas (un angle),
 *    quand la limite n'existe pas (deux côtés qui divergent), quand
 *    l'intégrale est impropre, on écrit POURQUOI plutôt qu'un tiret. §12 :
 *    « Do NOT merely output "la limite n'existe pas" — make the reason
 *    visible. »
 *
 * Toute notation mathématique est enfermée dans `dir="ltr"` (§2, §39).
 */
export default function AnalysisInspector({ data, scene, onHighlight, steppers = null }) {
  const { t } = useTranslation('mathlab');

  if (!scene || scene.error) {
    return <p className="sa-ml-an__empty">{t('tools.analysis.errors.parse')}</p>;
  }

  const { lab } = data;

  return (
    <div className="sa-ml-an__inspector" data-ml-an-inspector={lab}>
      {/* « D'un seul regard » (§3.5) : la lecture PROPRE au laboratoire vient
          en tête, à côté du plan — la dérivation, le tableau de variations,
          les tables d'approche. La lecture du point A (et, en dérivée, la
          tangente) est secondaire : un LabPanel que l'élève peut masquer. */}
      {(lab === 'secant') && <SecantReadout data={data} scene={scene} t={t} />}
      {lab === 'tangent' && <TangentReadout scene={scene} t={t} />}
      {lab === 'derivative' && <DerivativeReadout scene={scene} stepper={steppers?.derivative ?? null} t={t} />}
      {lab === 'limit' && <LimitReadout data={data} scene={scene} t={t} />}
      {lab === 'integral' && <IntegralReadout data={data} scene={scene} t={t} />}
      {lab === 'study' && <StudyReadout scene={scene} onHighlight={onHighlight} data={data} player={steppers?.study ?? null} t={t} />}
      {lab === 'transform' && <TransformReadout data={data} scene={scene} t={t} />}

      {lab === 'derivative' && (
        <LabPanel id="analysis.derivative.tangent" title={t('tools.analysis.tangent.title')} className="sa-ml-an__panelblock">
          <TangentReadout scene={scene} t={t} bare />
        </LabPanel>
      )}
      <LabPanel id={`analysis.${lab}.point`} title={t('tools.analysis.point.title')} className="sa-ml-an__panelblock">
        <PointReadout scene={scene} t={t} bare />
      </LabPanel>
    </div>
  );
}

/** §6 : A(a ; f(a)) — la lecture la plus simple, et la plus fondatrice. */
function PointReadout({ scene, t, bare = false }) {
  if (!scene.pointA) {
    return (
      <Row label={t('tools.analysis.point.title')}>
        <span className="sa-ml-an__warn">{t('tools.analysis.point.outside')}</span>
      </Row>
    );
  }

  return (
    <section className="sa-ml-an__group">
      {!bare && <h3 className="sa-ml-an__grouptitle">{t('tools.analysis.point.title')}</h3>}
      <Row label="A"><MathText>{formatPoint(scene.pointA.x, scene.pointA.y)}</MathText></Row>
      <p className="sa-ml-an__hint">{t('tools.analysis.point.hint')}</p>
    </section>
  );
}

/** §7 : la pente de la sécante, avec sa formule et ses deux accroissements. */
function SecantReadout({ data, scene, t }) {
  if (!scene.rate?.ok) {
    return (
      <section className="sa-ml-an__group">
        <h3 className="sa-ml-an__grouptitle">{t('tools.analysis.secant.title')}</h3>
        <p className="sa-ml-an__warn">
          {t(`tools.analysis.secant.${scene.rate?.reason === 'samePoint' ? 'samePoint' : 'undefined'}`, {
            defaultValue: t('tools.analysis.point.outside'),
          })}
        </p>
      </section>
    );
  }

  const { slope, fa, fb } = scene.rate;

  return (
    <section className="sa-ml-an__group">
      <h3 className="sa-ml-an__grouptitle">{t('tools.analysis.secant.title')}</h3>
      <Row label={t('tools.analysis.secant.formula')} stacked>
        <MathText>
          m = ({formatValue(fb)} − {formatValue(fa)}) / ({formatValue(data.secondPoint)} − {formatValue(data.point)})
        </MathText>
      </Row>
      <Row label={t('tools.analysis.secant.slope')}>
        <MathText strong>{formatValue(slope, 4)}</MathText>
      </Row>
      <Row label={t('tools.analysis.secant.deltaX')}>
        <MathText>{formatValue(data.secondPoint - data.point, 3)}</MathText>
      </Row>
      <Row label={t('tools.analysis.secant.deltaY')}>
        <MathText>{formatValue(fb - fa, 3)}</MathText>
      </Row>
      <p className="sa-ml-an__hint">{t('tools.analysis.secant.rateHint')}</p>
    </section>
  );
}

/** §8, §10 : la tangente, sa pente, et ce qu'elle dit du sens de variation. */
function TangentReadout({ scene, t, bare = false }) {
  const info = scene.tangentInfo;

  return (
    <section className="sa-ml-an__group">
      {!bare && <h3 className="sa-ml-an__grouptitle">{t('tools.analysis.tangent.title')}</h3>}
      {!info?.ok ? (
        <p className="sa-ml-an__warn" data-ml-an-tangent-refused={info?.reason}>
          {t(`tools.analysis.tangent.${info?.reason === 'corner' ? 'corner' : 'undefined'}`)}
        </p>
      ) : (
        <>
          <Row label="f′(a)">
            <MathText strong>{formatMaybeExact(info.slope, info.exact, 4)}</MathText>
          </Row>
          <Row label={t('tools.analysis.tangent.equation')}>
            <MathText>{formatLine(info.slope, info.y - info.slope * info.x)}</MathText>
          </Row>
          <p className="sa-ml-an__note">
            {t(`tools.analysis.tangent.${info.exact ? 'exact' : 'approx'}`)}
          </p>
          <p className="sa-ml-an__verdict" data-ml-an-direction>
            {Math.abs(info.slope) < 1e-9
              ? t('tools.analysis.tangent.horizontal')
              : info.slope > 0
                ? t('tools.analysis.tangent.increasing')
                : t('tools.analysis.tangent.decreasing')}
          </p>
        </>
      )}
    </section>
  );
}

/**
 * §9, §17, §18 : f′ écrite, f″ si on sait, et les points critiques CLASSÉS.
 *
 * f′(x) ne s'affiche plus d'un bloc (exigence 2026-09-30) : « Dériver pas
 * à pas » déroule `derivativeSteps.js` — la structure, la règle nommée, les
 * morceaux dérivés, la règle remplie — et la dérivée simplifiée est le
 * DERNIER pas. La ligne « f′(x) = … » et f″ n'existent qu'une fois ce pas
 * atteint. Les points critiques et la courbe de f′ restent VIVANTS : ce
 * sont des lectures du graphe, qui suivent la fonction et la fenêtre.
 *
 * `stepper` : `{ player, steps }` — le lecteur vit dans AnalysisTool pour
 * survivre à un changement d'onglet (l'inspecteur se démonte).
 */
function DerivativeReadout({ scene, stepper, t }) {
  const { primary, extrema } = scene;
  const steps = stepper?.steps?.ok ? stepper.steps.steps : null;
  const player = stepper?.player ?? null;
  // Sans lecteur (rendu isolé, test), l'inspecteur se comporte comme avant.
  const done = !steps || !player || player.done;

  return (
    <section className="sa-ml-an__group" data-ml-an-derivation={primary.derivativeSource ? (done ? 'done' : 'steps') : 'measured'}>
      <h3 className="sa-ml-an__grouptitle">{t('tools.analysis.derivative.title')}</h3>
      {primary.derivativeSource ? (
        <>
          {steps && player && (
            <>
              {!player.started && (
                <button
                  type="button"
                  className="sa-ml-an__action sa-ml-an__action--primary"
                  onClick={player.start}
                  data-ml-an-derive
                >
                  <Footprints size={16} aria-hidden="true" />
                  <span>{t('tools.analysis.derivativeSteps.action')}</span>
                </button>
              )}
              {player.started && (
                <>
                  <StepPlayer player={player} sticky title={t('tools.analysis.derivativeSteps.title')} dataAttr="data-ml-an-dstep" />
                  <StepList
                    steps={steps.map((step) => ({
                      text: t(`tools.analysis.derivativeSteps.steps.${step.textKey}`, step.params),
                      operation: step.ruleKey ? t(`tools.analysis.derivativeSteps.rules.${step.ruleKey}`) : null,
                      operationLatex: step.formula ?? null,
                      latex: step.latex,
                      tone: step.tone ?? null,
                    }))}
                    revealUpTo={player.cursor - 1}
                    label={t('tools.analysis.derivativeSteps.title')}
                    dataAttr="data-ml-an-dsteps"
                  />
                </>
              )}
            </>
          )}
          {done && (
            <Row label={t('tools.analysis.derivative.expression')} stacked>
              <MathText strong>{primary.derivativeSource}</MathText>
            </Row>
          )}
          <p className="sa-ml-an__note">{t('tools.analysis.derivative.symbolic')}</p>
        </>
      ) : (
        <p className="sa-ml-an__note">{t('tools.analysis.derivative.unavailable')}</p>
      )}
      {done && primary.secondDerivativeSource && (
        <Row label={t('tools.analysis.derivative.secondExpression')} stacked>
          <MathText>{primary.secondDerivativeSource}</MathText>
        </Row>
      )}

      {Array.isArray(extrema) && extrema.length > 0 && (
        <>
          <h4 className="sa-ml-an__subtitle">{t('tools.analysis.derivative.criticalPoints')}</h4>
          <ul className="sa-ml-an__list">
            {extrema.map((point, index) => (
              <li key={index} className="sa-ml-an__listitem" data-ml-an-critical={point.kind}>
                <MathText>{formatPoint(point.x, point.y)}</MathText>
                <span className="sa-ml-an__tag">{t(`tools.analysis.derivative.${point.kind}`)}</span>
              </li>
            ))}
          </ul>
          {/* §17 : un point stationnaire n'est PAS forcément un extremum. */}
          {extrema.some((point) => point.kind === 'stationary') && (
            <p className="sa-ml-an__note" data-ml-an-stationary-note>
              {t('tools.analysis.derivative.stationaryHint')}
            </p>
          )}
        </>
      )}
    </section>
  );
}

/** §11 – §15 : les deux tables d'approche, côte à côte, et le verdict. */
function LimitReadout({ data, scene, t }) {
  const limit = scene.limit;
  const tables = scene.approachTables;
  if (!limit || !tables) return null;

  const leftText = formatLimit(limit.left);
  const rightText = formatLimit(limit.right);

  return (
    <section className="sa-ml-an__group">
      <h3 className="sa-ml-an__grouptitle">{t('tools.analysis.limit.title')}</h3>

      <div className="sa-ml-an__tables">
        <ApproachTable rows={tables.left} side="left" at={data.limitPoint} t={t} />
        <ApproachTable rows={tables.right} side="right" at={data.limitPoint} t={t} />
      </div>

      <Row label={t('tools.analysis.limit.leftLabel')}>
        <MathText strong>{leftText.text}</MathText>
      </Row>
      <Row label={t('tools.analysis.limit.rightLabel')}>
        <MathText strong>{rightText.text}</MathText>
      </Row>

      {/* §12 : quand les deux côtés diffèrent, on MONTRE pourquoi. */}
      <p className={`sa-ml-an__verdict${limit.agree ? '' : ' sa-ml-an__verdict--warn'}`} data-ml-an-limit-agree={String(limit.agree)}>
        {limit.agree ? t('tools.analysis.limit.agree') : t('tools.analysis.limit.disagree')}
      </p>
      {/* La valeur EXACTE, quand le moteur symbolique la donne et qu'elle a
          passé la vérification : « 1/3 » plutôt que « ≈ 0,333 ». Elle ne
          remplace pas les tables — elle les couronne (§35). */}
      {scene.exactLimit?.ok && limit.agree && (
        <Row label={t('tools.analysis.limit.exact')}>
          <MathText strong>{scene.exactLimit.text}</MathText>
        </Row>
      )}
      <p className="sa-ml-an__note">
        {scene.exactLimit?.ok && limit.agree
          ? t('tools.analysis.limit.exactNote')
          : t('tools.analysis.limit.approximateNote')}
      </p>

      {Array.isArray(scene.discontinuities) && scene.discontinuities.length > 0 && (
        <>
          <h4 className="sa-ml-an__subtitle">{t('tools.analysis.limit.discontinuity')}</h4>
          <ul className="sa-ml-an__list">
            {scene.discontinuities.map((entry, index) => (
              <li key={index} className="sa-ml-an__listitem" data-ml-an-break={entry.kind}>
                <MathText>x = {formatValue(entry.x, 3)}</MathText>
                <span className="sa-ml-an__tag">{t(`tools.analysis.limit.${entry.kind}`)}</span>
              </li>
            ))}
          </ul>
          <p className="sa-ml-an__hint">
            {t(`tools.analysis.limit.${scene.discontinuities[0].kind}Hint`, { defaultValue: '' })}
          </p>
        </>
      )}
    </section>
  );
}

/** Une table d'approche : la suite de valeurs que §11 veut faire VOIR. */
function ApproachTable({ rows, side, at }) {
  return (
    <table className="sa-ml-an__table" dir="ltr" data-ml-an-approach-table={side}>
      <caption className="sa-ml-an__caption">{formatApproach(at, side)}</caption>
      <thead>
        <tr>
          <th scope="col">x</th>
          <th scope="col">f(x)</th>
        </tr>
      </thead>
      <tbody>
        {rows.slice(-6).map((row, index) => (
          <tr key={index}>
            <td>{formatValue(row.x, 5)}</td>
            <td>{row.y === null ? '—' : formatValue(row.y, 5)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** §19 – §23 : l'aire, l'intégrale signée, Riemann et son erreur. */
function IntegralReadout({ data, scene, t }) {
  const area = scene.area;

  return (
    <section className="sa-ml-an__group">
      <h3 className="sa-ml-an__grouptitle">{t('tools.analysis.integral.title')}</h3>

      {!area?.signed?.ok ? (
        <p className="sa-ml-an__warn" data-ml-an-integral-refused={area?.signed?.reason}>
          {t(`tools.analysis.integral.${area?.signed?.reason === 'singularity' ? 'singularity' : 'undefined'}`)}
        </p>
      ) : (
        <>
          <Row label={t('tools.analysis.integral.signed')}>
            <MathText strong>{formatApproximate(area.signed.value, 4)}</MathText>
          </Row>
          <Row label={t('tools.analysis.integral.geometric')}>
            <MathText>{area.geometric.ok ? formatApproximate(area.geometric.value, 4) : '—'}</MathText>
          </Row>
          {/* §21 : l'aire et l'intégrale ne coïncident pas toujours, et c'est LA leçon. */}
          <p className={`sa-ml-an__verdict${area.differ ? ' sa-ml-an__verdict--warn' : ''}`} data-ml-an-area-differ={String(Boolean(area.differ))}>
            {area.differ ? t('tools.analysis.integral.differ') : t('tools.analysis.integral.same')}
          </p>
          <p className="sa-ml-an__note">{t('tools.analysis.integral.approximateNote')}</p>
        </>
      )}

      {scene.riemann && (
        <>
          <h4 className="sa-ml-an__subtitle">{t('tools.analysis.integral.riemann')}</h4>
          <Row label={t('tools.analysis.integral.riemannSum')}>
            <MathText strong>{formatApproximate(scene.riemann.sum, 4)}</MathText>
          </Row>
          {Number.isFinite(scene.riemannError) && (
            <Row label={t('tools.analysis.integral.riemannError')}>
              <MathText>{formatValue(scene.riemannError, 4)}</MathText>
            </Row>
          )}
        </>
      )}

      {scene.between && (
        <>
          <h4 className="sa-ml-an__subtitle">{t('tools.analysis.integral.between')}</h4>
          <Row label={t('tools.analysis.integral.betweenValue')}>
            <MathText strong>{scene.between.area.ok ? formatApproximate(scene.between.area.value, 4) : '—'}</MathText>
          </Row>
        </>
      )}
      {!scene.second && data.layers.betweenCurves && (
        <p className="sa-ml-an__note">{t('tools.analysis.integral.needsSecond')}</p>
      )}
    </section>
  );
}

/**
 * §16 : l'étude complète — mais JAMAIS comme un grand tableau statique.
 *
 * Chaque ligne est un BOUTON qui allume sa couche sur le graphe : cliquer
 * « Racines » met les racines en évidence sur la courbe. C'est l'exigence
 * explicite de §16 — « connect every result to the graph ».
 *
 * Le tableau de variations, lui, se CONSTRUIT (exigence 2026-09-30) : « Construire le tableau
 * de variations pas à pas » déroule les six pas du manuel (variationTable.js ›
 * buildVariationSteps) et la grille ne rend que les lignes atteintes. La
 * ligne « Sens de variation » de la liste, qui ÉNONCE en mots les flèches du
 * tableau, attend que le tableau soit complet ; les racines, les extrema,
 * les asymptotes et les discontinuités restent des lectures VIVES du graphe
 * (les extrema sont aussi dans la lecture vive au-dessus des onglets).
 */
function StudyReadout({ scene, data, onHighlight, player, t }) {
  const table = buildVariationTable(scene, scene.view);
  const construction = buildVariationSteps(scene, table);
  const building = Boolean(player && construction.ok);
  const tableDone = !building || player.done;
  const rowsShown = building ? tableRowsAt(player.cursor) : 4;

  const rows = [
    {
      key: 'roots',
      label: t('tools.analysis.study.roots'),
      content: Array.isArray(scene.roots) && scene.roots.length > 0
        ? scene.roots.map((root) => formatValue(root.x, 3)).join(' ; ')
        : t('tools.analysis.study.rootsNone'),
    },
    {
      key: 'extrema',
      label: t('tools.analysis.study.extrema'),
      content: Array.isArray(scene.extrema) && scene.extrema.length > 0
        ? scene.extrema.map((point) => `${formatPoint(point.x, point.y)} ${t(`tools.analysis.derivative.${point.kind}`)}`).join(' · ')
        : t('tools.analysis.study.extremaNone'),
    },
    {
      key: 'increasing',
      label: t('tools.analysis.study.variation'),
      pending: !tableDone,
      content: !tableDone
        ? t('tools.analysis.variationSteps.pending')
        : Array.isArray(scene.variation) && scene.variation.length > 0
          ? scene.variation
            .map((interval) => `${formatInterval(interval.from, interval.to)} ${t(`tools.analysis.study.${interval.direction}`)}`)
            .join(' · ')
          : '—',
    },
    {
      key: 'asymptotes',
      label: t('tools.analysis.study.asymptotes'),
      content: formatAsymptotes(scene.asymptotes, t),
    },
    {
      key: 'discontinuities',
      label: t('tools.analysis.study.discontinuities'),
      content: Array.isArray(scene.discontinuities) && scene.discontinuities.length > 0
        ? scene.discontinuities.map((entry) => `x = ${formatValue(entry.x, 3)} (${t(`tools.analysis.limit.${entry.kind}`)})`).join(' · ')
        : '—',
    },
  ];

  return (
    <section className="sa-ml-an__group">
      <h3 className="sa-ml-an__grouptitle">{t('tools.analysis.study.title')}</h3>

      {/* Sans construction possible (fenêtre trop étroite…), la lecture
          d'avant : l'ensemble de définition et la note du tableau. */}
      {!building && Array.isArray(scene.domain) && scene.domain.length > 0 && (
        <Row label={t('tools.analysis.study.domain')}>
          <MathText>{scene.domain.map((piece) => formatInterval(piece.from, piece.to)).join(' ∪ ')}</MathText>
        </Row>
      )}

      {building && !player.started && (
        <button
          type="button"
          className="sa-ml-an__action sa-ml-an__action--primary"
          onClick={player.start}
          data-ml-an-vbuild
        >
          <Footprints size={16} aria-hidden="true" />
          <span>{t('tools.analysis.variationSteps.action')}</span>
        </button>
      )}
      {building && player.started && (
        <>
          <StepPlayer player={player} sticky title={t('tools.analysis.variationSteps.title')} dataAttr="data-ml-an-vstep" />
          <VariationStepList steps={construction.steps} cursor={player.cursor} t={t} />
        </>
      )}

      {/* tableau de variations : la synthèse du manuel. C'est la forme sous laquelle
          un élève REND une étude de fonction — et il la construit. */}
      {(!building || rowsShown > 0) && (
        <VariationTable
          table={table}
          functionName="f"
          derivativeSource={scene.primary?.derivativeSource ?? null}
          rows={rowsShown}
        />
      )}

      <LabPanel id="analysis.study.readings" title={t('tools.analysis.study.readings')} className="sa-ml-an__panelblock">
      <ul className="sa-ml-an__studylist">
        {rows.map((row) => (
          <li key={row.key}>
            <button
              type="button"
              className={`sa-ml-an__studyrow${data.layers[row.key] ? ' is-active' : ''}`}
              onClick={() => onHighlight(row.key)}
              aria-pressed={Boolean(data.layers[row.key])}
              data-ml-an-study={row.key}
            >
              <span className="sa-ml-an__studylabel">{row.label}</span>
              <span className="sa-ml-an__studyvalue" dir={row.pending ? undefined : 'ltr'}>{row.content}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="sa-ml-an__note">{t('tools.analysis.study.windowNote')}</p>
      </LabPanel>
    </section>
  );
}

/**
 * Les pas de la construction du tableau, jusqu'au pas courant SEULEMENT.
 * Le texte français ne porte aucune formule : la notation est dans un îlot LTR.
 */
function VariationStepList({ steps, cursor, t }) {
  const shown = steps.slice(0, cursor);

  return (
    <ol className="sa-ml-kit-steps" aria-label={t('tools.analysis.variationSteps.title')} data-ml-an-vsteps={shown.length}>
      {shown.map((step, index) => (
        <li
          key={step.kind}
          className={`sa-ml-kit-steps__item${index === shown.length - 1 ? ' is-current' : ''}${step.tone ? ` sa-ml-kit-steps__item--${step.tone}` : ''}`}
          data-ml-an-vstage={step.kind}
        >
          <span className="sa-ml-kit-steps__index" aria-hidden="true">{index + 1}</span>
          <div className="sa-ml-kit-steps__content">
            <p className="sa-ml-kit-steps__text">{t(`tools.analysis.variationSteps.steps.${step.textKey}`)}</p>
            <VariationStepDetail step={step} t={t} />
          </div>
        </li>
      ))}
    </ol>
  );
}

function VariationStepDetail({ step, t }) {
  switch (step.kind) {
    case 'domain':
      return (
        <p className="sa-ml-kit-steps__math">
          <MathText>
            {step.domain.length > 0 ? step.domain.map((piece) => formatInterval(piece.from, piece.to)).join(' ∪ ') : '—'}
          </MathText>
        </p>
      );
    case 'derivative':
      return step.derivativeSource ? (
        <p className="sa-ml-kit-steps__math"><MathText>f′(x) = {step.derivativeSource}</MathText></p>
      ) : (
        <p className="sa-ml-kit-steps__note">{t('tools.analysis.variationSteps.measured')}</p>
      );
    case 'zeros':
      return (
        <>
          {step.zeros.length > 0 ? (
            <p className="sa-ml-kit-steps__math">
              <MathText>
                f′(x) = 0 ⇔ {step.zeros.length === 1
                  ? `x = ${formatValue(step.zeros[0], 2)}`
                  : `x ∈ {${step.zeros.map((x) => formatValue(x, 2)).join(' ; ')}}`}
              </MathText>
            </p>
          ) : (
            <p className="sa-ml-kit-steps__note">{t('tools.analysis.variationSteps.noZero')}</p>
          )}
          {step.breaks.length > 0 && (
            <p className="sa-ml-kit-steps__note">
              {t('tools.analysis.variationSteps.breaksAt')}{' '}
              <bdi dir="ltr"><MathText>{step.breaks.map((x) => `x = ${formatValue(x, 2)}`).join(' ; ')}</MathText></bdi>
            </p>
          )}
        </>
      );
    default:
      return null;
  }
}

function formatAsymptotes(asymptotes, t) {
  if (!asymptotes) return '—';
  const parts = [
    ...asymptotes.vertical.map((entry) => `x = ${formatValue(entry.x, 3)}`),
    ...asymptotes.horizontal.map((entry) => `y = ${formatValue(entry.y, 3)}`),
    ...asymptotes.oblique.map((entry) => formatLine(entry.slope, entry.intercept)),
  ];
  // Deux directions donnent souvent la MÊME asymptote : on ne l'écrit qu'une fois.
  const unique = [...new Set(parts)];

  return unique.length > 0 ? unique.join(' · ') : t('tools.analysis.study.asymptotesNone');
}

/** §25, §26 : ce que la transformation a fait, et où les courbes se croisent. */
function TransformReadout({ data, scene, t }) {
  return (
    <section className="sa-ml-an__group">
      <h3 className="sa-ml-an__grouptitle">{t('tools.analysis.transform.title')}</h3>
      {scene.transformedSource && (
        <>
          <Row label={t('tools.analysis.transform.originalLabel')} stacked>
            <MathText>{data.functions[0].source}</MathText>
          </Row>
          <Row label={t('tools.analysis.transform.imageLabel')} stacked>
            <MathText strong>{scene.transformedSource}</MathText>
          </Row>
        </>
      )}
      {Array.isArray(scene.intersections) && (
        <>
          <h4 className="sa-ml-an__subtitle">{t('tools.analysis.transform.intersections')}</h4>
          {scene.intersections.length > 0 ? (
            <ul className="sa-ml-an__list">
              {scene.intersections.map((point, index) => (
                <li key={index} className="sa-ml-an__listitem">
                  <MathText>{formatPoint(point.x, point.y)}</MathText>
                </li>
              ))}
            </ul>
          ) : (
            <p className="sa-ml-an__note">{t('tools.analysis.transform.intersectionsNone')}</p>
          )}
        </>
      )}
    </section>
  );
}

/* ── Les briques d'affichage ──────────────────────────────────────────── */

function Row({ label, children, stacked = false }) {
  return (
    <div className={`sa-ml-an__row${stacked ? ' sa-ml-an__row--stacked' : ''}`}>
      <span className="sa-ml-an__rowlabel" dir="ltr">{label}</span>
      <span className="sa-ml-an__rowvalue">{children}</span>
    </div>
  );
}

/**
 * La notation mathématique : TOUJOURS `dir="ltr"`.
 *
 * C'est l'exigence §2 et §39 : la notation est isolée du texte, et `f(x) = x² − 3x + 2`
 * ne se lit pas à l'envers. Ce composant est le seul endroit où cette
 * décision est prise, pour qu'aucune expression ne puisse y échapper.
 *
 * Il s'appelle `MathText` et NON `Math` : un composant nommé `Math` masque
 * l'objet global `Math` dans tout le module, et `Math.abs(...)` appelle alors
 * un composant React. La QA navigateur l'a trouvé en une seconde — « TypeError:
 * Math.abs is not a function » — mais aucun test unitaire ne l'aurait vu, car
 * le module se charge parfaitement : c'est à l'APPEL que tout casse.
 */
function MathText({ children, strong = false }) {
  return (
    <span className={`sa-ml-an__math${strong ? ' sa-ml-an__math--strong' : ''}`} dir="ltr">
      {children}
    </span>
  );
}
