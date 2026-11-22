import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import {
  formatTerm, termName, formatRule, formatClosedForm, formatFixedPointFormula,
  formatStepBreakdown,
} from './sequenceFormat.js';
import { PROBE_STEPS } from './sequenceState.js';

/**
 * L'INSPECTEUR : ce que la suite DIT, en ce moment.
 *
 * Quatre lectures, dans cet ordre, et l'ordre est celui de §50 (« the
 * mathematics should remain the visual hero ») :
 *
 *   1. la RÈGLE et le terme courant — ce qu'on manipule ;
 *   2. le PAS de la récurrence en trois temps (§8) : uₙ → règle → uₙ₊₁ ;
 *   3. la TENDANCE observée (§11), avec la mention qui la qualifie ;
 *   4. l'exploration d'un indice lointain (§12).
 *
 * ── La phrase la plus importante du composant (§11, §51) ─────────────────
 * Quand la tendance n'est pas un théorème, l'interface écrit « les termes
 * calculés SEMBLENT s'approcher de… » et non « la suite converge vers… ». La
 * distinction vient du moteur (`trend.proven`), pas d'une décision de rendu :
 * ici on choisit seulement laquelle des deux clés i18n afficher. Un élève ne
 * doit jamais croire qu'un logiciel a démontré quelque chose parce qu'il a
 * calculé vingt termes.
 */
export default function SequenceInspector({
  data, model, probeResult, onProbe, onProbeIndex,
}) {
  const { t } = useTranslation('mathlab');
  const { trend, fixed, cursorTerm, previousTerm, terms, range } = model;
  const spec = data.primary;

  const breakdown = model.recursive && previousTerm && cursorTerm
    ? formatStepBreakdown(spec, previousTerm.n, previousTerm.value, cursorTerm.value)
    : null;

  return (
    <div className="sa-ml-seq__inspector" data-ml-seq-inspector>
      {/* ── 2. Le terme courant, et le pas qui y mène (§8) ───────────── */}
      <section className="sa-ml-seq__card">
        <h3 className="sa-ml-seq__cardtitle">{t('tools.sequences.inspector.currentTerm')}</h3>
        <p className="sa-ml-seq__current" dir="ltr" data-ml-seq-current-value>
          <span className="sa-ml-seq__currentname">{termName(data.cursor)}</span>
          <span className="sa-ml-seq__currenteq"> = </span>
          <span className="sa-ml-seq__currentnum">{cursorTerm ? formatTerm(cursorTerm.value) : '—'}</span>
        </p>

        {/* §8 : « the student should visually see current term → rule → next
            term rather than receiving only the final number. » */}
        {breakdown && (
          <div className="sa-ml-seq__step" dir="ltr" data-ml-seq-step>
            <span className="sa-ml-seq__stepfrom">{breakdown.from}</span>
            <ArrowRight className="sa-ml-seq__steparrow" size={15} aria-hidden="true" />
            <span className="sa-ml-seq__stepapplied" data-ml-seq-step-applied>{breakdown.applied}</span>
            <ArrowRight className="sa-ml-seq__steparrow" size={15} aria-hidden="true" />
            <span className="sa-ml-seq__stepto">{breakdown.to}</span>
          </div>
        )}
      </section>

      {/* ── 3. La tendance OBSERVÉE (§11, §21, §22) ──────────────────── */}
      {trend && terms.length >= 2 && (
        <section className="sa-ml-seq__card" data-ml-seq-trend={trend.status}>
          <h3 className="sa-ml-seq__cardtitle">{t('tools.sequences.inspector.behaviour')}</h3>

          <p className={`sa-ml-seq__badge sa-ml-seq__badge--${trend.status}`} data-ml-seq-trend-badge>
            {t(`tools.sequences.trend.${trend.status}`)}
          </p>

          {/* LA phrase de §11 et §51 : deux formulations, et le moteur décide. */}
          {trend.approachingValue !== null && (
            <p className="sa-ml-seq__trendtext" data-ml-seq-trend-proven={trend.proven ? 'true' : 'false'}>
              {trend.proven
                ? t('tools.sequences.trend.provenLimit', { value: formatTerm(trend.approachingValue) })
                : t('tools.sequences.trend.observedLimit', { value: formatTerm(trend.approachingValue) })}
            </p>
          )}

          {trend.observedOnly && (
            <p className="sa-ml-seq__note sa-ml-seq__note--caution" data-ml-seq-observed-note>
              {t('tools.sequences.trend.observationOnly')}
            </p>
          )}

          {trend.alternatingSign && (
            <p className="sa-ml-seq__note">
              {trend.amplitudeShrinking
                ? t('tools.sequences.micro.alternatingShrinking')
                : t('tools.sequences.micro.alternating')}
            </p>
          )}

          {/* L'étendue observée (§22) : le mot « observé » est dans la clé. */}
          {data.layers.bounds && range && (
            <p className="sa-ml-seq__range" data-ml-seq-range>
              <span>{t('tools.sequences.inspector.observedRange')}</span>
              <span dir="ltr" className="sa-ml-seq__num">
                {` [${formatTerm(range.min)} ; ${formatTerm(range.max)}]`}
              </span>
            </p>
          )}

          {/* Le point fixe, avec SA formule quand elle existe (§15). */}
          {data.layers.fixedPoints && model.affine && model.affine.a !== 1 && (
            <p className="sa-ml-seq__fixedformula" dir="ltr" data-ml-seq-fixed-formula>
              {formatFixedPointFormula(model.affine.a, model.affine.b)}
            </p>
          )}
          {data.layers.fixedPoints && fixed.points.length > 0 && !model.affine && (
            <p className="sa-ml-seq__fixedformula" data-ml-seq-fixed-approx>
              <span>{t('tools.sequences.inspector.approxFixedPoint')}</span>
              <span dir="ltr" className="sa-ml-seq__num">
                {` ${fixed.points.map((value) => formatTerm(value)).join(' ; ')}`}
              </span>
            </p>
          )}
          {data.layers.fixedPoints && fixed.everyPoint && (
            <p className="sa-ml-seq__note">{t('tools.sequences.inspector.everyPointFixed')}</p>
          )}
        </section>
      )}

      {/* ── 4. Un indice lointain (§12) ──────────────────────────────── */}
      <section className="sa-ml-seq__card" data-ml-seq-probe>
        <h3 className="sa-ml-seq__cardtitle">{t('tools.sequences.inspector.farTerm')}</h3>
        <p className="sa-ml-seq__note">{t('tools.sequences.inspector.farTermHint')}</p>

        <div className="sa-ml-seq__probesteps" role="group" aria-label={t('tools.sequences.inspector.farTerm')}>
          {PROBE_STEPS.map((index) => (
            <button
              key={index}
              type="button"
              className={`sa-ml-seq__chip${data.probe === index ? ' sa-ml-seq__chip--active' : ''}`}
              onClick={() => onProbeIndex?.(index)}
              aria-pressed={data.probe === index}
              data-ml-seq-probe-step={index}
            >
              <span dir="ltr">{`n = ${index}`}</span>
            </button>
          ))}
        </div>

        <div className="sa-ml-seq__proberow">
          <label className="sa-ml-seq__label-inline" htmlFor="sa-ml-seq-probe">
            {t('tools.sequences.inspector.index')}
          </label>
          <input
            id="sa-ml-seq-probe"
            className="sa-ml-seq__field"
            type="number"
            min={0}
            step={1}
            value={data.probe}
            onChange={(event) => onProbeIndex?.(Number(event.target.value))}
            dir="ltr"
            data-ml-seq-probe-field
          />
          <button
            type="button"
            className="sa-ml-seq__btn sa-ml-seq__btn--primary"
            onClick={onProbe}
            data-ml-seq-probe-run
          >
            {t('tools.sequences.inspector.compute')}
          </button>
        </div>

        {probeResult && (
          <p className="sa-ml-seq__proberesult" dir="ltr" data-ml-seq-probe-result={probeResult.ok ? 'ok' : probeResult.reason}>
            {probeResult.ok
              ? `${termName(probeResult.n)} = ${formatTerm(probeResult.value)}`
              : null}
          </p>
        )}
        {probeResult && !probeResult.ok && (
          <p className="sa-ml-seq__warn" role="status">
            {t(`tools.sequences.errors.${probeResult.reason}`, { n: probeResult.n })}
          </p>
        )}
      </section>
    </div>
  );
}


/**
 * LA DÉFINITION — une carte à part, et c'est tout l'intérêt.
 *
 * Elle est rendue comme enfant DIRECT du panneau qui défile
 * (`.sa-ml-seq__panel-body`), pas à l'intérieur de l'inspecteur. C'est la
 * condition pour que `position: sticky` fonctionne : un élément collant se
 * colle à son conteneur de défilement le plus proche, et tant que la carte
 * vivait dans `.sa-ml-seq__inspector` (haut de 582 px), elle se collait au
 * sommet de CE bloc — donc elle disparaissait avec lui dès qu'on descendait
 * vers les curseurs. Mesuré, puis corrigé.
 */
export function SequenceDefinitionCard({ data, model }) {
  const { t } = useTranslation('mathlab');
  const { closed, error, stopped } = model;
  const spec = data.primary;

  return (
    // La carte est COLLANTE en haut du panneau (`--sticky`) : les curseurs de
    // `a`, `b`, `r`, `q` vivent tout en bas et le panneau défile, si bien
    // qu'en tirant l'un d'eux on ne voyait plus la règle qu'on changeait.
    <section className="sa-ml-seq__card sa-ml-seq__card--sticky" data-ml-seq-definition>
      <h3 className="sa-ml-seq__cardtitle">{t('tools.sequences.inspector.definition')}</h3>

      <p className="sa-ml-seq__rule" dir="ltr" data-ml-seq-rule>{formatRule(spec)}</p>
      <p className="sa-ml-seq__initial" dir="ltr" data-ml-seq-initial>
        {`${termName(spec.startIndex)} = ${formatTerm(spec.first)}`}
        {spec.kind === 'secondOrder' && `  ·  ${termName(spec.startIndex + 1)} = ${formatTerm(spec.second)}`}
      </p>

      {/* La forme explicite à côté de la récursive (§16) : les deux
          engendrent les mêmes termes, et le voir est l'objet du §16. */}
      {closed && model.recursive && (
        <p className="sa-ml-seq__closed" dir="ltr" data-ml-seq-closed>
          {formatClosedForm(closed)}
        </p>
      )}
      {closed && model.recursive && (
        <p className="sa-ml-seq__note">{t('tools.sequences.inspector.sameTerms')}</p>
      )}

      {/* Une règle illisible : on nomme le problème, on ne laisse pas un
          écran vide (§32). */}
      {error && (
        <p className="sa-ml-seq__error" role="status" data-ml-seq-error={error.code}>
          {t(`tools.sequences.errors.${error.code}`)}
        </p>
      )}
      {/* La suite s'est arrêtée avant le compte demandé : on dit pourquoi. */}
      {!error && stopped && (
        <p className="sa-ml-seq__warn" role="status" data-ml-seq-stopped={stopped.reason}>
          {t(`tools.sequences.errors.${stopped.reason}`, { n: stopped.n })}
        </p>
      )}
    </section>
  );
}
