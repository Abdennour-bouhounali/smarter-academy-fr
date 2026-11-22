import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, FlaskConical } from 'lucide-react';
import { LabPanel } from '../../shared/LabKit.jsx';
import ValueInput from './ValueInput.jsx';
import SendToMenu from './SendToMenu.jsx';
import { divisibilityTable, digitSumChain, DIVISIBILITY_RULES } from './numberTheory.js';
import { runExperiment } from './practice.js';
import { formatNumber } from './numberValue.js';
import { divisibilityReason } from './divisibilityReasons.js';

/**
 * §20, §21 — QĀBILIYYAT AL-QISMA : le verdict ET sa raison.
 *
 * §20 est catégorique : « instead of simply displaying divisible / not
 * divisible, show the REASON ». Chaque ligne s'ouvre donc sur son critère —
 * la somme des chiffres pour 3 et 9, les deux derniers pour 4, le dernier
 * pour 2 et 5 — avec les chiffres du nombre de l'élève dedans, pas une règle
 * générale recopiée.
 *
 * Le calcul n'est pas refait ici : `divisibilityBy` rend déjà sa trace
 * (`evidenceText`, `quotient`, `remainder`), et l'écran ne fait que la
 * mettre en phrase. Un seul endroit peut donc être faux, et il est testé.
 *
 * §21 : l'expérience. On tire des multiples de 3 et on montre la colonne des
 * sommes de chiffres — sans rien dire. La règle se révèle au clic, après que
 * l'élève a regardé.
 */
export default function DivisibilityMode({ value, onChange, onSend, onSaveNote }) {
  const { t } = useTranslation('mathlab');
  const [openRule, setOpenRule] = useState(null);
  const [experiment, setExperiment] = useState(null);
  const [lawShown, setLawShown] = useState(false);

  const table = useMemo(() => divisibilityTable(value, DIVISIBILITY_RULES), [value]);
  const chain = useMemo(() => digitSumChain(value), [value]);
  const context = useMemo(() => ({
    div2: table.find((row) => row.by === 2)?.divisible,
    div3: table.find((row) => row.by === 3)?.divisible,
  }), [table]);

  return (
    <div className="sa-ml-nb__mode sa-ml-nb__mode--divisibility">
      <div className="sa-ml-nb__row">
        <ValueInput
          value={value}
          onChange={onChange}
          label={t('tools.numberLab.valueLabel')}
          integer
          stepper
        />
        <SendToMenu value={value} onSend={onSend} exclude="divisibility" />
      </div>

      <h3 className="sa-ml-nb__heading">
        {t('tools.numberLab.divisibility.heading', { value: formatNumber(value) })}
      </h3>
      <p className="sa-ml-nb__hint">{t('tools.numberLab.divisibility.hint')}</p>

      <ul className="sa-ml-nb__divtable">
        {table.map((row) => {
          const open = openRule === row.by;
          const reason = divisibilityReason(row, value, context);

          return (
            <li key={row.by} className={`sa-ml-nb__divrow${row.divisible ? ' is-yes' : ' is-no'}`}>
              <button
                type="button"
                className="sa-ml-nb__divrow-head"
                onClick={() => setOpenRule(open ? null : row.by)}
                aria-expanded={open}
              >
                <span className="sa-ml-nb__divrow-by">{t('tools.numberLab.divisibility.by', { by: row.by })}</span>
                <span className="sa-ml-nb__divrow-verdict">
                  {row.divisible
                    ? <><Check size={15} aria-hidden="true" />{t('tools.numberLab.divisibility.yes')}</>
                    : <><X size={15} aria-hidden="true" />{t('tools.numberLab.divisibility.no')}</>}
                </span>
              </button>

              {open && (
                <div className="sa-ml-nb__divrow-body">
                  {/* §20 : LA RAISON, avec les chiffres de CE nombre. */}
                  <p className="sa-ml-nb__reason">
                    <span className="sa-ml-nb__reason-label">{t('tools.numberLab.divisibility.because')}</span>
                    {reason
                      ? t(reason.key, reason.params)
                      : t(`tools.numberLab.divisibility.rules.${row.rule}`, {
                        evidence: row.evidenceText ?? formatNumber(value),
                        sum: row.evidence ?? '',
                        value: formatNumber(value),
                        by: row.by,
                      })}
                  </p>
                  {/* La formule À PART, isolée en LTR : dans la phrase, bidi la retournerait. */}
                  {reason?.formula && (
                    <p className="sa-ml-nb__formula" dir="ltr" data-ml-nb-div-formula>{reason.formula}</p>
                  )}

                  {/* La division elle-même, avec ou sans reste. */}
                  <p className="sa-ml-nb__formula" dir="ltr">
                    {row.divisible
                      ? t('tools.numberLab.divisibility.divisionLine', { value, by: row.by, quotient: row.quotient })
                      : t('tools.numberLab.divisibility.divisionRest', {
                        value, by: row.by, quotient: row.quotient, remainder: row.remainder,
                      })}
                  </p>

                  {/* §20 : le groupement, quand il reste lisible. */}
                  {row.divisible && Math.abs(row.quotient) <= 60 && Math.abs(row.by) <= 12 && (
                    <>
                      <p className="sa-ml-nb__muted">
                        {t('tools.numberLab.divisibility.groupsHint', {
                          value: formatNumber(value), by: row.by, quotient: row.quotient,
                        })}
                      </p>
                      <GroupsDiagram total={Math.abs(value)} groups={Math.abs(row.by)} perGroup={Math.abs(row.quotient)} />
                    </>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* §21 : la somme des chiffres qui redescend. */}
      <LabPanel id="numberLab.divisibility.digitSum" title={t('tools.numberLab.explorer.digitSum')}>
        <p className="sa-ml-nb__formula" dir="ltr">{chain.join(' → ')}</p>
        <p className="sa-ml-nb__muted">{t('tools.numberLab.divisibility.chainHint', { chain: chain.join(' → ') })}</p>
      </LabPanel>

      {/* §21 : l'expérience — on montre, on ne dit pas. */}
      <LabPanel
        id="numberLab.divisibility.experiment"
        title={t('tools.numberLab.divisibility.experimentDigitSum')}
        actions={(
          <button
            type="button"
            className="sa-ml-nb__button sa-ml-nb__button--ghost"
            onClick={() => { setExperiment(runExperiment('digitSum', Date.now() % 100000)); setLawShown(false); }}
          >
            <FlaskConical size={14} aria-hidden="true" />
            {experiment ? t('tools.numberLab.practice.experiments.again') : t('tools.numberLab.practice.experiments.run')}
          </button>
        )}
      >
        {experiment && (
          <>
            <table className="sa-ml-nb__table" dir="ltr">
              <thead>
                <tr>
                  <th scope="col">n</th>
                  <th scope="col">{t('tools.numberLab.explorer.digitSum')}</th>
                </tr>
              </thead>
              <tbody>
                {experiment.rows.map((row, index) => (
                  <tr key={index}>
                    <td>{row.value}</td>
                    <td>{row.digitSum}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="sa-ml-nb__question">{t('tools.numberLab.practice.experiments.whatDoYouSee')}</p>
            {lawShown ? (
              <p className="sa-ml-nb__callout">
                {t(experiment.lawKey)}
                <button
                  type="button"
                  className="sa-ml-nb__link"
                  onClick={() => onSaveNote?.(t(experiment.lawKey))}
                >
                  {t('tools.numberLab.notes.add')}
                </button>
              </p>
            ) : (
              <button type="button" className="sa-ml-nb__button" onClick={() => setLawShown(true)}>
                {t('tools.numberLab.practice.experiments.showLaw')}
              </button>
            )}
          </>
        )}
      </LabPanel>
    </div>
  );
}

/** Le groupement DESSINÉ : `value` jetons rangés en `groups` paquets (§20, §39). */
function GroupsDiagram({ total, groups, perGroup }) {
  const { t } = useTranslation('mathlab');
  if (!groups || !perGroup || total > 400) return null;

  return (
    <div
      className="sa-ml-nb__groups"
      role="img"
      aria-label={t('tools.numberLab.divisibility.groupsHint', { value: total, by: groups, quotient: perGroup })}
    >
      {Array.from({ length: groups }, (_, g) => (
        <span key={g} className="sa-ml-nb__group">
          {Array.from({ length: perGroup }, (_, i) => (
            <span key={i} className="sa-ml-nb__dot" />
          ))}
        </span>
      ))}
    </div>
  );
}
