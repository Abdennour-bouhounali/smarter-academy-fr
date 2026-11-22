import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Notation, VerdictPill, TruthLine } from './LogicPieces.jsx';
import { STATEMENTS, findPreset, sampleOf } from './presets.js';
import { truthIntervals, evaluate } from './logicMath.js';
import { formatNumber } from './logicFormat.js';
import { VERDICTS } from './logicState.js';

/**
 * §5-7 — LE LABORATOIRE DES ÉNONCÉS.
 *
 * L'élève ne lit pas « x² > x est parfois vraie » : il prédit, puis il
 * DÉPLACE x et voit la phrase basculer de vraie à fausse sous son doigt. La
 * droite montre les deux régions, et la troisième réponse — « تتعلّق بقيمة
 * المتغيّر » — devient la seule honnête.
 *
 * §6 : le domaine est montré, et les valeurs exclues sont barrées sur la
 * droite. « 1/x > 0 » et « 1/n > 0 sur ℕ* » sont le même texte avec deux
 * verdicts : c'est ce que l'élève doit voir.
 */
export default function StatementsArea({ data, onChange, announce }) {
  const { t } = useTranslation('mathlab');
  const state = data.statements;
  const preset = findPreset(STATEMENTS, state.id);
  const domain = preset.domain ?? null;
  const excluded = preset.excluded ?? [];

  const regions = useMemo(() => {
    if (!domain || preset.kind !== 'variable') return null;
    const candidates = sampleOf(domain);

    return truthIntervals(preset.predicate, domain.min, domain.max, { excluded, candidates });
  }, [preset, domain, excluded]);

  const probeValue = state.probe;
  const atProbe = preset.kind === 'variable'
    ? evaluate(preset.predicate, probeValue, excluded)
    : preset.verdict === 'true';

  const revealed = state.verdict !== null;
  const guessWasRight = revealed && state.guess === preset.verdict;

  const label = preset.formula ?? t(`tools.logic.statements.items.${preset.id}`);

  return (
    <>
      <section className="sa-ml-lg__card" data-ml-lg-area="statements">
        <h2 className="sa-ml-lg__title">{t('tools.logic.statements.heading')}</h2>
        <p className="sa-ml-lg__lead">{t('tools.logic.statements.lead')}</p>

        <label className="sa-ml-lg__field">
          <span className="sa-ml-lg__label">{t('tools.logic.common.choosePreset')}</span>
          <select
            className="sa-ml-lg__select"
            value={state.id}
            onChange={(event) => onChange((current) => ({
              ...current,
              statements: { ...current.statements, id: event.target.value, verdict: null, guess: null },
            }))}
            data-ml-lg-statement-select
          >
            {STATEMENTS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.formula ?? t(`tools.logic.statements.items.${item.id}`)}
              </option>
            ))}
          </select>
        </label>

        <p className="sa-ml-lg__question">{t('tools.logic.statements.verdictQuestion')}</p>
        <Notation block lead data-ml-lg-statement>{label}</Notation>

        {domain && (
          <p className="sa-ml-lg__note">
            {t('tools.logic.common.domain')}
            {': '}
            <Notation>{domain.excludedSymbol ? `${domain.symbol}, ${domain.excludedSymbol}` : domain.symbol}</Notation>
          </p>
        )}
      </section>

      {/* ── La prédiction, avant toute révélation (§37) ─────────────────── */}
      <section className="sa-ml-lg__card" data-ml-lg-predict>
        <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.common.predict')}</h3>
        <div className="sa-ml-lg__actions">
          {VERDICTS.map((verdict) => (
            <button
              key={verdict}
              type="button"
              className="sa-ml-lg__btn sa-ml-lg__btn--choice"
              aria-pressed={state.guess === verdict}
              onClick={() => onChange((current) => ({
                ...current, statements: { ...current.statements, guess: verdict },
              }))}
              data-ml-lg-guess={verdict}
            >
              {t(`tools.logic.verdicts.${verdict}`)}
            </button>
          ))}
        </div>
        <p className="sa-ml-lg__note">{t('tools.logic.common.predictHint')}</p>

        <div className="sa-ml-lg__actions">
          <button
            type="button"
            className="sa-ml-lg__btn sa-ml-lg__btn--primary"
            onClick={() => {
              onChange((current) => ({
                ...current, statements: { ...current.statements, verdict: preset.verdict },
              }));
              announce?.(t(`tools.logic.verdicts.${preset.verdict}`));
            }}
            data-ml-lg-reveal
          >
            {t('tools.logic.common.reveal')}
          </button>
        </div>

        {revealed && (
          <div
            className={`sa-ml-lg__message sa-ml-lg__message--${guessWasRight ? 'ok' : 'info'}`}
            role="status"
            data-ml-lg-statement-verdict={preset.verdict}
          >
            <VerdictPill
              value={preset.verdict === 'true' ? true : preset.verdict === 'false' ? false : null}
              label={t(`tools.logic.verdicts.${preset.verdict}`)}
            />
            <p className="sa-ml-lg__note">{t(`tools.logic.practice.e.trueOrFalse.${preset.verdict}`)}</p>
            {preset.verdict === 'depends' && (
              <p className="sa-ml-lg__note">{t('tools.logic.statements.dependsExplain')}</p>
            )}
          </div>
        )}
      </section>

      {/* ── La droite : où l'énoncé est vrai, où il est faux (§7) ───────── */}
      {regions && (
        <section className="sa-ml-lg__card" data-ml-lg-truthline>
          <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.statements.probeLabel')}</h3>

          <TruthLine
            intervals={regions.intervals}
            points={regions.points}
            excluded={regions.excluded}
            min={domain.min}
            max={domain.max}
            probe={probeValue}
            caption={t('tools.logic.canvasLabel')}
          />

          <label className="sa-ml-lg__field">
            <span className="sa-ml-lg__label">
              {t('tools.logic.statements.atValue', { value: formatNumber(probeValue) })}
            </span>
            <input
              className="sa-ml-lg__input"
              type="range"
              min={domain.min}
              max={domain.max}
              step={domain.integer ? 1 : (domain.step ?? 0.5)}
              value={probeValue}
              onChange={(event) => onChange((current) => ({
                ...current, statements: { ...current.statements, probe: Number(event.target.value) },
              }))}
              data-ml-lg-probe
            />
          </label>

          <p role="status" aria-live="polite" data-ml-lg-probe-verdict={String(atProbe)}>
            {atProbe === undefined
              ? <span className="sa-ml-lg__message sa-ml-lg__message--warn">
                {t('tools.logic.common.excludedHint', { value: formatNumber(probeValue) })}
              </span>
              : <VerdictPill
                value={atProbe}
                label={atProbe ? t('tools.logic.statements.isTrueHere') : t('tools.logic.statements.isFalseHere')}
              />}
          </p>

          <p className="sa-ml-lg__note">{t('tools.logic.statements.domainMatters')}</p>
        </section>
      )}
    </>
  );
}
