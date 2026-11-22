import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dice5, Check } from 'lucide-react';
import { Notation, TruthLine, Statement } from './LogicPieces.jsx';
import { COUNTEREXAMPLE_CHALLENGES, findPreset, sampleOf, domainStatus } from './presets.js';
import { evaluate } from './logicMath.js';
import { formatNumber, valueList } from './logicFormat.js';
import { parseNumericAnswer } from './practice.js';
import { setCounterexampleChallenge, setCandidate, tryCandidate } from './logicState.js';

/**
 * §8-10, §54 — LE LABORATOIRE DU CONTRE-EXEMPLE, et l'écran d'ouverture.
 *
 * C'est ici que le laboratoire s'ouvre : pas un menu, une question —
 * « هل تستطيع إثبات أنّ هذه العبارة خاطئة؟ » — et une droite pour chercher.
 * L'élève essaie des valeurs ; chaque essai laisse une trace (verte si
 * l'énoncé tient, rouge s'il tombe), et à la première valeur qui le fait
 * tomber, le laboratoire explique POURQUOI un seul exemple suffit — jamais
 * un simple « bravo » (§9).
 *
 * Trois façons de chercher, parce qu'un élève cherche de trois façons : le
 * curseur (le doigt), le champ (l'idée précise), le hasard (l'exploration).
 */
export default function CounterexampleArea({ data, onChange, announce }) {
  const { t } = useTranslation('mathlab');
  const state = data.counterexample;
  const preset = findPreset(COUNTEREXAMPLE_CHALLENGES, state.id);
  const [typed, setTyped] = useState('');
  const [message, setMessage] = useState(null);

  const domain = preset.domain;
  const values = useMemo(() => sampleOf(domain), [domain]);

  /** Les essais déjà faits, avec leur verdict — la mémoire de la recherche. */
  const marks = useMemo(() => state.tried.map((value) => ({
    value,
    label: formatNumber(value),
    holds: evaluate(preset.predicate, value),
  })), [state.tried, preset]);

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

    const holds = evaluate(preset.predicate, value);
    const isCounterexample = holds === false;
    onChange((current) => tryCandidate(current, value, isCounterexample));

    if (isCounterexample) {
      setMessage({ tone: 'ok', text: t('tools.logic.counterexample.foundExplain', { value: formatNumber(value) }) });
      announce?.(t('tools.logic.announce.counterexampleFound', { value: formatNumber(value) }));
    } else {
      setMessage({ tone: 'no', text: t('tools.logic.counterexample.notCounterexample', { value: formatNumber(value) }) });
    }
  }, [domain, preset, onChange, announce, t]);

  const randomValue = useCallback(() => {
    const untried = values.filter((value) => !state.tried.includes(value));
    const pool = untried.length > 0 ? untried : values;
    test(pool[Math.floor(Math.random() * pool.length)]);
  }, [values, state.tried, test]);

  const found = state.found;

  return (
    <>
      <section className="sa-ml-lg__card sa-ml-lg__card--accent" data-ml-lg-area="counterexample">
        <h2 className="sa-ml-lg__title">{t('tools.logic.counterexample.heading')}</h2>
        <p className="sa-ml-lg__question">{t('tools.logic.counterexample.question')}</p>
        <Statement data-ml-lg-claim>
          {t(`tools.logic.counterexample.claims.${preset.id}`)}
        </Statement>
        <p className="sa-ml-lg__lead">{t('tools.logic.counterexample.lead')}</p>

        <label className="sa-ml-lg__field">
          <span className="sa-ml-lg__label">{t('tools.logic.common.choosePreset')}</span>
          <select
            className="sa-ml-lg__select"
            value={state.id}
            onChange={(event) => { onChange((c) => setCounterexampleChallenge(c, event.target.value)); setMessage(null); }}
            data-ml-lg-ce-select
          >
            {COUNTEREXAMPLE_CHALLENGES.map((item) => (
              <option key={item.id} value={item.id}>{t(`tools.logic.counterexample.claims.${item.id}`)}</option>
            ))}
          </select>
        </label>
      </section>

      <section className="sa-ml-lg__card" data-ml-lg-search>
        <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.counterexample.searchHint')}</h3>

        <TruthLine
          intervals={[]}
          min={domain.min}
          max={domain.max}
          probe={state.candidate}
          marks={marks.map((mark) => ({ value: mark.value, label: mark.holds === false ? '✗' : '·' }))}
          points={found !== null ? [found] : []}
          caption={t('tools.logic.canvasLabel')}
        />

        <label className="sa-ml-lg__field">
          <span className="sa-ml-lg__label">
            {t('tools.logic.common.valueLabel')}
            {': '}
            <Notation>{formatNumber(state.candidate)}</Notation>
          </span>
          <input
            className="sa-ml-lg__input"
            type="range"
            min={domain.min}
            max={domain.max}
            step={domain.integer ? 1 : (domain.step ?? 0.5)}
            value={state.candidate}
            onChange={(event) => onChange((current) => setCandidate(current, Number(event.target.value)))}
            data-ml-lg-ce-slider
          />
        </label>

        <div className="sa-ml-lg__actions">
          <button
            type="button"
            className="sa-ml-lg__btn sa-ml-lg__btn--primary"
            onClick={() => test(state.candidate)}
            data-ml-lg-ce-test
          >
            <Check size={16} aria-hidden="true" />
            {t('tools.logic.common.test')}
          </button>
          <button type="button" className="sa-ml-lg__btn" onClick={randomValue} data-ml-lg-ce-random>
            <Dice5 size={16} aria-hidden="true" />
            {t('tools.logic.common.randomValue')}
          </button>
        </div>

        <form
          className="sa-ml-lg__field"
          onSubmit={(event) => { event.preventDefault(); test(typed); setTyped(''); }}
        >
          <span className="sa-ml-lg__label">{t('tools.logic.common.tryValue')}</span>
          <input
            className="sa-ml-lg__input"
            type="text"
            inputMode="numeric"
            dir="ltr"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            placeholder={t('tools.logic.practice.answerPlaceholder')}
            data-ml-lg-ce-input
          />
        </form>

        {message && (
          <p className={`sa-ml-lg__message sa-ml-lg__message--${message.tone}`} role="status" aria-live="polite">
            {message.text}
          </p>
        )}

        {found !== null && (
          <p className="sa-ml-lg__message sa-ml-lg__message--ok" data-ml-lg-ce-found={found}>
            <strong>{t('tools.logic.counterexample.found')}</strong>
            {' '}
            <Notation>{`x = ${formatNumber(found)}`}</Notation>
          </p>
        )}

        {found === null && state.tried.length > 0 && (
          <p className="sa-ml-lg__message sa-ml-lg__message--info" data-ml-lg-ce-searching>
            {t('tools.logic.counterexample.stillSearching', { count: state.tried.length })}
            {' '}
            {t('tools.logic.counterexample.keepTrying')}
          </p>
        )}

        {state.tried.length > 0 && (
          <>
            <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.common.tried')}</h3>
            <ul className="sa-ml-lg__chips" data-ml-lg-ce-tried>
              {marks.map((mark) => (
                <li
                  key={mark.value}
                  className={`sa-ml-lg__chip ${mark.holds === false ? 'sa-ml-lg__chip--false' : 'sa-ml-lg__chip--true'}`}
                >
                  <Notation>{formatNumber(mark.value)}</Notation>
                  <span className="sa-ml-lg__sr">
                    {mark.holds === false ? t('tools.logic.counterexample.found') : t('tools.logic.common.true')}
                  </span>
                  {' '}
                  {mark.holds === false ? '✗' : '✓'}
                </li>
              ))}
            </ul>
            <p className="sa-ml-lg__sr">{valueList(state.tried)}</p>
          </>
        )}
      </section>
    </>
  );
}
