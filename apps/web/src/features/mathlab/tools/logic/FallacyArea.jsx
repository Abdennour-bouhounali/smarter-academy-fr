import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Notation, VerdictPill, Statement } from './LogicPieces.jsx';
import { FALLACIES, FALLACY_KINDS, findPreset, domainStatus } from './presets.js';
import { refutesFallacy } from './proofMath.js';
import { formatNumber } from './logicFormat.js';
import { parseNumericAnswer } from './practice.js';
import { setFallacy, nameFallacy, tryFallacyValue } from './logicState.js';

/**
 * §33 — LE DÉTECTEUR DE SOPHISMES.
 *
 * Deux temps, et les deux comptent :
 *   NOMMER la faute — reconnaître qu'on a utilisé la réciproque, ou affirmé
 *   le conséquent ;
 *   la RÉFUTER — donner une valeur qui met l'argument en défaut.
 *
 * §33 demande explicitement les deux (« The student must identify the
 * problem and ideally provide a counterexample »), et le laboratoire ne
 * félicite qu'après les deux : nommer sans réfuter, c'est réciter un mot.
 *
 * Toute valeur qui réfute est acceptée, pas seulement celle qu'on avait en
 * tête — `refutes` est un prédicat, pas une constante.
 */
export default function FallacyArea({ data, onChange }) {
  const { t } = useTranslation('mathlab');
  const state = data.fallacy;
  const preset = findPreset(FALLACIES, state.id);
  const [typed, setTyped] = useState('');
  const [message, setMessage] = useState(null);

  const named = state.kind;
  const namedRight = named === preset.kind;
  const refuted = state.tried.some((value) => refutesFallacy(preset, value));

  const submit = (event) => {
    event.preventDefault();
    const value = parseNumericAnswer(typed);
    if (!Number.isFinite(value)) { setMessage({ tone: 'warn', text: t('tools.logic.practice.unreadable') }); return; }
    const status = domainStatus(value, preset.domain);
    if (status !== 'in') {
      // Hors de l'ensemble déclaré, ou trop grand pour être calculé exactement : ni l'un ni l'autre n'est « faux ».
      const key = status === 'tooLarge' ? 'tools.logic.practice.tooLarge' : 'tools.logic.counterexample.outsideDomain';
      setMessage({ tone: 'warn', text: t(key, { value: formatNumber(value) }) });

      return;
    }
    onChange((current) => tryFallacyValue(current, value));
    setTyped('');
    setMessage(refutesFallacy(preset, value)
      ? { tone: 'ok', text: t('tools.logic.fallacy.refuted') }
      : { tone: 'no', text: t('tools.logic.fallacy.wrongValue', { value: formatNumber(value) }) });
  };

  return (
    <>
      <section className="sa-ml-lg__card" data-ml-lg-area="fallacy">
        <h2 className="sa-ml-lg__title">{t('tools.logic.fallacy.heading')}</h2>
        <p className="sa-ml-lg__lead">{t('tools.logic.fallacy.lead')}</p>

        <label className="sa-ml-lg__field">
          <span className="sa-ml-lg__label">{t('tools.logic.common.choosePreset')}</span>
          <select
            className="sa-ml-lg__select"
            value={state.id}
            onChange={(event) => { onChange((c) => setFallacy(c, event.target.value)); setMessage(null); }}
            data-ml-lg-fallacy-select
          >
            {FALLACIES.map((item) => (
              <option key={item.id} value={item.id}>{t(`tools.logic.fallacy.arguments.${item.id}`)}</option>
            ))}
          </select>
        </label>

        <Statement data-ml-lg-fallacy-argument>
          {t(`tools.logic.fallacy.arguments.${preset.id}`)}
        </Statement>
      </section>

      {/* ── 1. Nommer ───────────────────────────────────────────────────── */}
      <section className="sa-ml-lg__card" data-ml-lg-fallacy-name>
        <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.fallacy.nameIt')}</h3>

        <div className="sa-ml-lg__actions">
          {FALLACY_KINDS.map((kind) => (
            <button
              key={kind}
              type="button"
              className="sa-ml-lg__btn sa-ml-lg__btn--choice"
              aria-pressed={named === kind}
              onClick={() => onChange((current) => nameFallacy(current, kind))}
              data-ml-lg-fallacy-kind={kind}
            >
              {t(`tools.logic.fallacy.kinds.${kind}`)}
            </button>
          ))}
        </div>

        {named && (
          <p className={`sa-ml-lg__message sa-ml-lg__message--${namedRight ? 'ok' : 'no'}`} role="status">
            {namedRight
              ? t(`tools.logic.fallacy.kindHints.${preset.kind}`)
              : t('tools.logic.fallacy.wrongName')}
          </p>
        )}
      </section>

      {/* ── 2. Réfuter ──────────────────────────────────────────────────── */}
      <section className="sa-ml-lg__card" data-ml-lg-fallacy-refute>
        <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.fallacy.refuteIt')}</h3>

        <form className="sa-ml-lg__field" onSubmit={submit}>
          <span className="sa-ml-lg__label">
            {t('tools.logic.common.valueLabel')}
            {' '}
            <Notation>{preset.domain.symbol}</Notation>
          </span>
          <input
            className="sa-ml-lg__input"
            type="text"
            inputMode="numeric"
            dir="ltr"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            placeholder={t('tools.logic.practice.answerPlaceholder')}
            data-ml-lg-fallacy-input
          />
          <button type="submit" className="sa-ml-lg__btn sa-ml-lg__btn--primary">
            {t('tools.logic.common.test')}
          </button>
        </form>

        {message && (
          <p className={`sa-ml-lg__message sa-ml-lg__message--${message.tone}`} role="status" aria-live="polite">
            {message.text}
          </p>
        )}

        {state.tried.length > 0 && (
          <ul className="sa-ml-lg__chips" data-ml-lg-fallacy-tried>
            {state.tried.map((value) => (
              <li
                key={value}
                className={`sa-ml-lg__chip ${refutesFallacy(preset, value) ? 'sa-ml-lg__chip--true' : 'sa-ml-lg__chip--false'}`}
              >
                <Notation>{formatNumber(value)}</Notation>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Le verdict : les deux moitiés, ou rien ──────────────────────── */}
      <section className="sa-ml-lg__card" data-ml-lg-fallacy-verdict>
        <ul className="sa-ml-lg__chips">
          <li className={`sa-ml-lg__chip ${namedRight ? 'sa-ml-lg__chip--true' : ''}`}>
            {t('tools.logic.fallacy.named')}
            {' '}
            {namedRight ? '✓' : '—'}
          </li>
          <li className={`sa-ml-lg__chip ${refuted ? 'sa-ml-lg__chip--true' : ''}`}>
            {t('tools.logic.fallacy.refuted')}
            {' '}
            {refuted ? '✓' : '—'}
          </li>
        </ul>

        {namedRight && refuted && (
          <p className="sa-ml-lg__message sa-ml-lg__message--ok" role="status" data-ml-lg-fallacy-done>
            <VerdictPill value label={t('tools.logic.fallacy.bothDone')} />
          </p>
        )}
        {namedRight && !refuted && (
          <p className="sa-ml-lg__message sa-ml-lg__message--info">{t('tools.logic.fallacy.namedOnly')}</p>
        )}
        {!namedRight && refuted && (
          <p className="sa-ml-lg__message sa-ml-lg__message--info">{t('tools.logic.fallacy.refutedOnly')}</p>
        )}
      </section>
    </>
  );
}
