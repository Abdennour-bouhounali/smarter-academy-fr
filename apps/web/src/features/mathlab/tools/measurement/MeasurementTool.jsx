import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PanelBottomClose, PanelBottomOpen } from 'lucide-react';
import './measurement.css';
import { useCompactCharts } from '../probabilityStats/useMediaQuery.js';
import MeasureStage from './MeasureStage.jsx';
import ObservationTable from './ObservationTable.jsx';
import RuleBuilder from './RuleBuilder.jsx';
import DiscoveryPanel from './DiscoveryPanel.jsx';
import { INVESTIGATIONS } from './investigations.js';
import { formatValue } from '../functionGrapher/grapherFormat.js';
import {
  createMeasurementData, normalizeMeasurementData, serializeMeasurementData,
  selectInvestigation, setParam, recordObservation, removeObservation, clearObservations,
  setRule, useHint, runUnseenTest, markExplained, resetInvestigation, setPrecision,
  toggleSetting, resolveMeasurement, PRECISIONS,
} from './measureState.js';

/** Le délai entre un changement et sa remise à la coquille (qui attend encore avant d'enregistrer). */
const SERIALIZE_MS = 300;

/**
 * L'atelier « Grandeurs et mesures » dans la coquille de l'atelier (MathLabToolProps).
 *
 *     on tire une poignée → l'objet change → on mesure → on SÉLECTIONNE
 *     ce qu'on garde → le tableau se remplit → une relation apparaît
 *     → on la construit → on l'éprouve → on comprend pourquoi
 *
 * ── Dix enquêtes, UN laboratoire ────────────────────────────────────────
 * Comme l'atelier des nombres (§3 de son cahier), les enquêtes ne sont pas des
 * routes : ce sont des vues d'un même atelier, et chacune garde SON objet et
 * SES mesures (`measureState.js`). Un élève qui remplit le tableau de l'aire,
 * part voir le cercle et revient retrouve ses quatre lignes.
 *
 * ── Ce qui n'est PAS persisté ───────────────────────────────────────────
 * L'onglet ouvert, le tiroir, l'avertissement de doublon et le message
 * d'annonce n'ont AUCUN champ dans `data` : ils ne peuvent donc pas y
 * arriver par accident.
 *
 * Toute la mathématique est dans les modules purs ; ce composant ne fait que
 * les appeler — aucun calcul dans le JSX.
 */
export default function MeasurementTool({ initialData, onChange, onReady }) {
  const { t } = useTranslation('mathlab');
  const [data, setData] = useState(() => (initialData && Object.keys(initialData).length
    ? normalizeMeasurementData(initialData)
    : createMeasurementData()));

  // ── L'état d'INTERFACE : jamais sérialisé ──────────────────────────────
  const [panelOpen, setPanelOpen] = useState(true);
  const [tab, setTab] = useState('measure');
  const [announcement, setAnnouncement] = useState('');
  const [duplicate, setDuplicate] = useState(false);
  const compact = useCompactCharts();

  const timerRef = useRef(null);
  const dataRef = useRef(data);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  dataRef.current = data;

  /** Une modification voulue : appliquée tout de suite, remise à la coquille après SERIALIZE_MS. */
  const commit = useCallback((updater) => {
    setData((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      if (next === current) return current;
      dataRef.current = next;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        onChangeRef.current?.(serializeMeasurementData(dataRef.current));
      }, SERIALIZE_MS);

      return next;
    });
  }, []);

  // Le démontage ne perd JAMAIS le dernier changement.
  useEffect(() => () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      onChangeRef.current?.(serializeMeasurementData(dataRef.current));
    }
  }, []);

  /** La coquille peut vider le document (« Tout effacer ») et basculer la grille. */
  useEffect(() => {
    onReady?.({
      clear: () => {
        const fresh = createMeasurementData();
        setData(fresh);
        dataRef.current = fresh;
        onChangeRef.current?.(serializeMeasurementData(fresh));
      },
      isGridEnabled: () => dataRef.current.settings.grid,
      toggleGrid: () => {
        const next = toggleSetting(dataRef.current, 'grid');
        setData(next);
        dataRef.current = next;
        onChangeRef.current?.(serializeMeasurementData(next));

        return next.settings.grid;
      },
    });

    return () => onReady?.(null);
  }, [onReady]);

  // ── Tout ce que l'écran lit, calculé UNE fois ─────────────────────────
  const { investigation, params, record, measures, evidence, solved } = useMemo(
    () => resolveMeasurement(data),
    [data],
  );

  /* ── Les gestes ─────────────────────────────────────────────────────── */

  const chooseInvestigation = useCallback((id) => {
    commit((current) => selectInvestigation(current, id));
    setDuplicate(false);
    setTab('measure');
    setAnnouncement(t('tools.measurement.announce.investigation', {
      name: t(`tools.measurement.investigations.${id}.name`),
    }));
  }, [commit, t]);

  const changeParam = useCallback((key, value) => {
    setDuplicate(false);
    commit((current) => setParam(current, key, value));
  }, [commit]);

  /** Garder la mesure courante — et le dire, y compris au lecteur d'écran. */
  const record_ = useCallback(() => {
    commit((current) => {
      const next = recordObservation(current);
      // `recordObservation` rend l'état INCHANGÉ sur un doublon (§18).
      setDuplicate(next === current);

      return next;
    });
    const summary = investigation.quantities
      .filter((entry) => entry.role === 'input')
      .map((entry) => `${entry.symbol} = ${formatValue(measures[entry.key], entry.decimals)}`)
      .join(' · ');
    setAnnouncement(t('tools.measurement.observations.recorded', { summary }));
  }, [commit, investigation, measures, t]);

  const drop = useCallback((id) => commit((current) => removeObservation(current, id)), [commit]);
  const clearAll = useCallback(() => commit(clearObservations), [commit]);

  const changeRule = useCallback((rule) => {
    commit((current) => setRule(current, rule));
  }, [commit]);

  /** Éprouver la règle : le tableau se colore, et l'instrument répond. */
  const test = useCallback(() => {
    setTab('rule');
    const verdict = evidence.check.verdict;
    setAnnouncement(verdict === 'holds'
      ? t('tools.measurement.announce.ruleHolds')
      : t('tools.measurement.announce.ruleFails', { count: evidence.check.failed }));
  }, [evidence, t]);

  const unseen = useCallback(() => {
    commit((current) => {
      const next = runUnseenTest(current);
      if (next.records[next.investigation].stage === 'found') {
        setAnnouncement(t('tools.measurement.announce.found'));
      }

      return next;
    });
  }, [commit, t]);

  const hint = useCallback(() => commit(useHint), [commit]);
  const explained = useCallback(() => commit(markExplained), [commit]);
  const resetOne = useCallback(() => {
    commit(resetInvestigation);
    setDuplicate(false);
  }, [commit]);
  const changePrecision = useCallback((value) => commit((c) => setPrecision(c, value)), [commit]);
  const flip = useCallback((key) => commit((c) => toggleSetting(c, key)), [commit]);

  // Le tableau ne se colore qu'APRÈS une épreuve : sinon, des ✓ verts
  // apparaîtraient pendant que l'élève construit encore sa règle.
  const testResults = record.rule && evidence.check.verdict !== 'incomplete'
    ? evidence.check.results
    : [];

  return (
    <div className={`sa-ml-ms${panelOpen ? '' : ' sa-ml-ms--panelClosed'}`}>
      {/* ── La barre des enquêtes ─────────────────────────────────────── */}
      <nav className="sa-ml-ms__investigations" aria-label={t('tools.measurement.investigationsLabel')}>
        <ul className="sa-ml-ms__invList">
          {INVESTIGATIONS.map((entry) => {
            const state = data.records[entry.id]?.stage ?? 'exploring';
            const active = entry.id === investigation.id;

            return (
              <li key={entry.id}>
                <button
                  type="button"
                  className={`sa-ml-ms__invBtn${active ? ' is-active' : ''}`}
                  onClick={() => chooseInvestigation(entry.id)}
                  aria-current={active ? 'true' : undefined}
                >
                  <span className="sa-ml-ms__invName">
                    {t(`tools.measurement.investigations.${entry.id}.name`)}
                  </span>
                  {(state === 'found' || state === 'explained') && (
                    <span className="sa-ml-ms__invDone" aria-label={t('tools.measurement.stages.found')}>✓</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── La scène ──────────────────────────────────────────────────── */}
      <div className="sa-ml-ms__stageWrap">
        <h2 className="sa-ml-ms__question">
          {t(`tools.measurement.investigations.${investigation.id}.question`)}
        </h2>

        <div className="sa-ml-ms__stage" aria-label={t('tools.measurement.stageLabel')}>
          <MeasureStage
            investigation={investigation}
            params={params}
            measures={measures}
            settings={data.settings}
            onParam={changeParam}
            compact={compact}
          />
        </div>

        {/* Les LECTURES vivent au-dessus des onglets : elles ne doivent
            jamais disparaître derrière « Règle » (règle de l'atelier). */}
        <dl className="sa-ml-ms__readout" dir="ltr">
          {investigation.quantities
            .filter((entry) => entry.symbol !== '—')
            .map((entry) => (
              <div
                key={entry.key}
                className={`sa-ml-ms__readoutItem${entry.key === investigation.target ? ' is-target' : ''}`}
              >
                <dt>
                  <span className="sa-ml-ms__readoutSymbol">{entry.symbol}</span>
                  <span className="sa-ml-ms__readoutName">
                    {t(`tools.measurement.quantities.${entry.key}`, entry.key)}
                  </span>
                </dt>
                <dd>{formatValue(measures[entry.key], entry.decimals)}</dd>
              </div>
            ))}
        </dl>

        {/* Les curseurs : ce qu'aucune poignée ne règle (le pavé, les secteurs). */}
        <div className="sa-ml-ms__sliders">
          {investigation.params.map((entry) => (
            <label key={entry.key} className="sa-ml-ms__slider">
              <span>{t(`tools.measurement.quantities.${entry.key}`, entry.key)}</span>
              <input
                type="range"
                min={entry.min}
                max={entry.max}
                step={entry.step}
                value={params[entry.key] ?? entry.initial}
                onChange={(event) => changeParam(entry.key, Number(event.target.value))}
              />
              <output dir="ltr">{formatValue(params[entry.key], 2)}</output>
            </label>
          ))}
        </div>
      </div>

      {/* ── La lucarne : elle devient un TIROIR sous 900 px (§29) ─────── */}
      <button
        type="button"
        className="sa-ml-ms__panelToggle"
        onClick={() => setPanelOpen((open) => !open)}
        aria-expanded={panelOpen}
      >
        {panelOpen
          ? <PanelBottomClose size={18} aria-hidden="true" />
          : <PanelBottomOpen size={18} aria-hidden="true" />}
        {panelOpen ? t('tools.measurement.panelHide') : t('tools.measurement.panelShow')}
      </button>

      <aside className="sa-ml-ms__panel" hidden={!panelOpen}>
        <div className="sa-ml-ms__tabs" role="tablist" aria-label={t('tools.measurement.tabs.label')}>
          {['measure', 'table', 'rule'].map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              id={`sa-ml-ms-tab-${key}`}
              aria-selected={tab === key}
              aria-controls={`sa-ml-ms-panel-${key}`}
              className={`sa-ml-ms__tab${tab === key ? ' is-active' : ''}`}
              onClick={() => setTab(key)}
            >
              {t(`tools.measurement.tabs.${key}`)}
            </button>
          ))}
        </div>

        <div className="sa-ml-ms__panelBody">
          {tab === 'measure' && (
            <div role="tabpanel" id="sa-ml-ms-panel-measure" aria-labelledby="sa-ml-ms-tab-measure">
              <section className="sa-ml-ms__panelSection">
                <h3 className="sa-ml-ms__panelTitle">{t('tools.measurement.tools.heading')}</h3>
                <div className="sa-ml-ms__toggles">
                  <label className="sa-ml-ms__toggle">
                    <input type="checkbox" checked={data.settings.grid} onChange={() => flip('grid')} />
                    <span>{t('tools.measurement.tools.grid')}</span>
                  </label>
                  <label className="sa-ml-ms__toggle">
                    <input type="checkbox" checked={data.settings.labels} onChange={() => flip('labels')} />
                    <span>{t('tools.measurement.tools.labels')}</span>
                  </label>
                </div>

                <fieldset className="sa-ml-ms__group">
                  <legend>{t('tools.measurement.tools.precision')}</legend>
                  <div className="sa-ml-ms__chips">
                    {PRECISIONS.map((value, index) => (
                      <button
                        key={value}
                        type="button"
                        className={`sa-ml-ms__chip${data.precision === value ? ' is-active' : ''}`}
                        onClick={() => changePrecision(value)}
                        aria-pressed={data.precision === value}
                      >
                        {t(`tools.measurement.tools.${['precisionExact', 'precisionTenth', 'precisionHundredth'][index]}`)}
                      </button>
                    ))}
                  </div>
                  <p className="sa-ml-ms__note">{t('tools.measurement.tools.precisionHint')}</p>
                </fieldset>
              </section>

              <ObservationTable
                investigation={investigation}
                observations={record.observations}
                measures={measures}
                onRecord={record_}
                onRemove={drop}
                onClear={clearAll}
                testResults={testResults}
                duplicateWarning={duplicate}
              />
            </div>
          )}

          {tab === 'table' && (
            <div role="tabpanel" id="sa-ml-ms-panel-table" aria-labelledby="sa-ml-ms-tab-table">
              <ObservationTable
                investigation={investigation}
                observations={record.observations}
                measures={measures}
                onRecord={record_}
                onRemove={drop}
                onClear={clearAll}
                testResults={testResults}
                duplicateWarning={duplicate}
              />
            </div>
          )}

          {tab === 'rule' && (
            <div role="tabpanel" id="sa-ml-ms-panel-rule" aria-labelledby="sa-ml-ms-tab-rule">
              <RuleBuilder
                investigation={investigation}
                rule={record.rule}
                onChange={changeRule}
                onTest={test}
                disabled={false}
              />
              <DiscoveryPanel
                investigation={investigation}
                record={record}
                evidence={evidence}
                solved={solved}
                onHint={hint}
                onUnseenTest={unseen}
                onExplained={explained}
                onReset={resetOne}
              />
            </div>
          )}
        </div>
      </aside>

      {/* Ce que le lecteur d'écran entend (§33). */}
      <p className="sa-ml-ms__sr" role="status" aria-live="polite">{announcement}</p>
    </div>
  );
}
