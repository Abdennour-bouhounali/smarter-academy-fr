import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dice5, Check } from 'lucide-react';
import { Notation, VerdictPill, TruthLine } from './LogicPieces.jsx';
import { QUANTIFIER_STATEMENTS, findPreset, sampleOf, domainStatus } from './presets.js';
import { evaluate, searchVerdict } from './logicMath.js';
import { formatNumber } from './logicFormat.js';
import { parseNumericAnswer } from './practice.js';
import { setQuantifier, tryQuantifierValue } from './logicState.js';

/**
 * §21-23 — LES QUANTIFICATEURS, et la distinction qui compte le plus.
 *
 * §22 : « Clearly distinguish "لم نجد مثالًا مضادًا" from "أثبتنا أن العبارة
 * صحيحة". Do not teach students that checking a few examples proves a
 * universal statement. » C'est la règle qui gouverne cet écran.
 *
 * Le laboratoire dit donc toujours DEUX choses distinctes :
 *   — ce que la recherche a trouvé (« fouillé 25 valeurs, aucun
 *     contre-exemple ») : une OBSERVATION ;
 *   — ce qu'on a le droit d'en conclure : pour ∀, rien ; pour ∃, tout, car
 *     un témoin suffit.
 *
 * Quand un ∀ résiste à la recherche, l'écran renvoie explicitement vers
 * « بناء البرهان » : la suite du raisonnement n'est pas d'essayer une
 * vingt-sixième valeur.
 */
export default function QuantifiersArea({ data, onChange, announce, onGoToProof }) {
  const { t } = useTranslation('mathlab');
  const state = data.quantifiers;
  const preset = findPreset(QUANTIFIER_STATEMENTS, state.id);
  const [typed, setTyped] = useState('');
  const [message, setMessage] = useState(null);

  const domain = preset.domain;
  const values = useMemo(() => sampleOf(domain), [domain]);

  /** Ce qu'une recherche EXHAUSTIVE sur l'échantillon donnerait (§22). */
  const systematic = useMemo(
    () => searchVerdict(preset.kind, preset.predicate, values),
    [preset, values],
  );

  const test = useCallback((raw) => {
    const value = Number.isFinite(raw) ? raw : parseNumericAnswer(raw);
    if (!Number.isFinite(value)) { setMessage({ tone: 'warn', text: t('tools.logic.practice.unreadable') }); return; }
    const status = domainStatus(value, domain);
    if (status !== 'in') {
      // Hors de l'ensemble déclaré, ou trop grand pour être calculé exactement : ni l'un ni l'autre n'est « faux ».
      const key = status === 'tooLarge' ? 'tools.logic.practice.tooLarge' : 'tools.logic.counterexample.outsideDomain';
      setMessage({ tone: 'warn', text: t(key, { value: formatNumber(value) }) });

      return;
    }

    const holds = evaluate(preset.predicate, value) === true;
    onChange((current) => tryQuantifierValue(current, value, holds));

    if (preset.kind === 'exists' && holds) {
      setMessage({ tone: 'ok', text: t('tools.logic.quantifiers.witnessFound', { value: formatNumber(value) }) });
      announce?.(t('tools.logic.quantifiers.witnessFound', { value: formatNumber(value) }));
    } else if (preset.kind === 'forall' && !holds) {
      setMessage({ tone: 'ok', text: t('tools.logic.quantifiers.counterexampleFound', { value: formatNumber(value) }) });
      announce?.(t('tools.logic.announce.counterexampleFound', { value: formatNumber(value) }));
    } else {
      setMessage({ tone: 'info', text: null });
    }
  }, [domain, preset, onChange, announce, t]);

  const randomValue = useCallback(() => {
    const untried = values.filter((value) => !state.tried.includes(value));
    const pool = untried.length > 0 ? untried : values;
    test(pool[Math.floor(Math.random() * pool.length)]);
  }, [values, state.tried, test]);

  const isForall = preset.kind === 'forall';
  const decided = isForall ? state.counterexample !== null : state.witness !== null;

  return (
    <>
      <section className="sa-ml-lg__card" data-ml-lg-area="quantifiers">
        <h2 className="sa-ml-lg__title">{t('tools.logic.quantifiers.heading')}</h2>
        <p className="sa-ml-lg__lead">{t('tools.logic.quantifiers.lead')}</p>

        <label className="sa-ml-lg__field">
          <span className="sa-ml-lg__label">{t('tools.logic.common.choosePreset')}</span>
          <select
            className="sa-ml-lg__select"
            value={state.id}
            onChange={(event) => { onChange((c) => setQuantifier(c, event.target.value)); setMessage(null); }}
            data-ml-lg-quant-select
          >
            {QUANTIFIER_STATEMENTS.map((item) => (
              <option key={item.id} value={item.id}>{item.formula}</option>
            ))}
          </select>
        </label>

        <Notation block lead data-ml-lg-quant-formula>{preset.formula}</Notation>
        <p className="sa-ml-lg__note">
          {isForall ? t('tools.logic.quantifiers.forallHint') : t('tools.logic.quantifiers.existsHint')}
        </p>
      </section>

      <section className="sa-ml-lg__card" data-ml-lg-quant-search>
        <TruthLine
          intervals={[]}
          min={domain.min}
          max={domain.max}
          probe={null}
          marks={state.tried.map((value) => ({
            value,
            label: evaluate(preset.predicate, value) ? '✓' : '✗',
          }))}
          points={state.witness !== null ? [state.witness] : []}
          caption={t('tools.logic.canvasLabel')}
        />

        <div className="sa-ml-lg__actions">
          <button type="button" className="sa-ml-lg__btn" onClick={randomValue} data-ml-lg-quant-random>
            <Dice5 size={16} aria-hidden="true" />
            {t('tools.logic.common.randomValue')}
          </button>
        </div>

        <form className="sa-ml-lg__field" onSubmit={(event) => { event.preventDefault(); test(typed); setTyped(''); }}>
          <span className="sa-ml-lg__label">{t('tools.logic.common.tryValue')}</span>
          <input
            className="sa-ml-lg__input"
            type="text"
            inputMode="numeric"
            dir="ltr"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            placeholder={t('tools.logic.practice.answerPlaceholder')}
            data-ml-lg-quant-input
          />
          <button type="submit" className="sa-ml-lg__btn sa-ml-lg__btn--primary">
            <Check size={16} aria-hidden="true" />
            {t('tools.logic.common.test')}
          </button>
        </form>

        {message?.text && (
          <p className={`sa-ml-lg__message sa-ml-lg__message--${message.tone}`} role="status" aria-live="polite">
            {message.text}
          </p>
        )}

        {/* ── Ce qu'on a trouvé, et ce qu'on a le droit d'en dire ───────── */}
        <div className="sa-ml-lg__message sa-ml-lg__message--info" data-ml-lg-quant-report>
          <p>{t('tools.logic.quantifiers.searchedCount', { count: state.tried.length })}</p>

          {isForall && state.counterexample !== null && (
            <p data-ml-lg-quant-disproved>
              <VerdictPill
                value={false}
                label={t('tools.logic.quantifiers.counterexampleFound', {
                  value: formatNumber(state.counterexample),
                })}
              />
            </p>
          )}

          {isForall && state.counterexample === null && (
            <>
              <p>{t('tools.logic.quantifiers.noCounterexampleFound')}</p>
              <p className="sa-ml-lg__message sa-ml-lg__message--warn" data-ml-lg-quant-not-a-proof>
                <strong>{t('tools.logic.quantifiers.notAProof')}</strong>
              </p>
              {systematic.status === 'notFound' && state.tried.length > 0 && (
                <button
                  type="button"
                  className="sa-ml-lg__btn"
                  onClick={() => onGoToProof?.()}
                  data-ml-lg-goto-proof
                >
                  {t('tools.logic.quantifiers.proofNeeded')}
                </button>
              )}
            </>
          )}

          {!isForall && state.witness !== null && (
            <p data-ml-lg-quant-proved>
              <VerdictPill
                value
                label={t('tools.logic.quantifiers.witnessFound', { value: formatNumber(state.witness) })}
              />
            </p>
          )}

          {!isForall && state.witness === null && (
            <p>{t('tools.logic.quantifiers.noWitnessFound')}</p>
          )}
        </div>

        <span className="sa-ml-lg__sr" aria-live="polite">
          {decided ? t('tools.logic.announce.counterexampleFound', { value: state.counterexample ?? state.witness }) : ''}
        </span>
      </section>
    </>
  );
}
