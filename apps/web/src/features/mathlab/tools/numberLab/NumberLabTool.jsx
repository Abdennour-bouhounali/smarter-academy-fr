import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GraduationCap, NotebookPen, Trash2, PanelBottomClose, PanelBottomOpen,
} from 'lucide-react';
import './numberLab.css';
import { useNotebook } from '../../../practice/notebook/NotebookProvider';
import { escapeHtml } from '../../../practice/notebook/noteContent';
import { useCompactCharts } from '../probabilityStats/useMediaQuery.js';
import ExplorerMode from './ExplorerMode.jsx';
import PlaceValueMode from './PlaceValueMode.jsx';
import LineMode from './LineMode.jsx';
import FractionsMode from './FractionsMode.jsx';
import DecimalsMode from './DecimalsMode.jsx';
import PercentMode from './PercentMode.jsx';
import ProportionMode from './ProportionMode.jsx';
import DivisibilityMode from './DivisibilityMode.jsx';
import PrimesMode from './PrimesMode.jsx';
import FactorsMode from './FactorsMode.jsx';
import GcdLcmMode from './GcdLcmMode.jsx';
import RoundingMode from './RoundingMode.jsx';
import OperationsMode from './OperationsMode.jsx';
import DivisionMode from './DivisionMode.jsx';
import PowersMode from './PowersMode.jsx';
import OrderMode from './OrderMode.jsx';
import PracticePanel from './PracticePanel.jsx';
import LabSectionNav from '../../shared/LabSectionNav.jsx';
import { MODE_SECTIONS, MODE_GROUPS } from './modeCatalog.js';
import {
  createNumberLabData, normalizeNumberLabData, serializeNumberLabData,
  setMode, patchMode, sendTo, addNote, removeNote, recordAttempt, setPracticeLevel,
} from './numberState.js';
import { NumberLabModesContext, clampToModes, numberLabModes } from './scope.js';

/** Le délai entre un changement et sa remise à la coquille (qui attend encore avant d'enregistrer). */
const SERIALIZE_MS = 300;

/**
 * Le مختبر الأعداد والحساب dans la coquille du مختبر (MathLabToolProps).
 *
 *     on tape un nombre → il se décompose, se factorise, se place, se compare
 *     → on l'ENVOIE à un autre mode → il continue d'y vivre
 *
 * ── Treize modes, UN laboratoire (§3) ───────────────────────────────────
 * §3 interdit d'en faire des routes séparées, et c'est plus qu'une question
 * d'URL : un élève qui explore 360, l'envoie au crible, puis à l'arbre de
 * facteurs, puis au PGCD, travaille sur UN objet. La barre de modes ne change
 * que ce qui est affiché ; chaque mode garde ses propres nombres
 * (`numberState.js`), et le pont entre eux est toujours un geste explicite
 * (« أرسِل إلى », §46).
 *
 * ── Ce qui n'est PAS persisté (§43) ─────────────────────────────────────
 * L'animation du crible, la question d'entraînement courante, le panneau
 * ouvert, l'onglet actif et le couple de facteurs survolé n'ont AUCUN champ
 * dans `data` : ils ne peuvent donc pas y arriver par accident, et rouvrir un
 * document ne rejoue pas un crible à moitié fait.
 *
 * Toute la mathématique est dans les modules purs ; ce composant ne fait que
 * les appeler — aucun calcul dans le JSX.
 */
export default function NumberLabTool({ initialData, onChange, onReady, capabilities = null }) {
  const { t } = useTranslation('mathlab');
  // Le مخبر (scope.js) : les modes qu'il montre — aujourd'hui les seize partout.
  const modes = useMemo(() => numberLabModes(capabilities), [capabilities]);
  const [data, setData] = useState(() => clampToModes(initialData && Object.keys(initialData).length
    ? normalizeNumberLabData(initialData)
    : createNumberLabData(), modes));

  // ── L'état d'INTERFACE : jamais sérialisé ──────────────────────────────
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [reducedMotion, setReducedMotion] = useState(false);
  const compact = useCompactCharts();

  const timerRef = useRef(null);
  const dataRef = useRef(data);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  dataRef.current = data;

  const notebook = useSafeNotebook();

  /** §59 : le mouvement réduit est respecté — l'animation devient un saut. */
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(query.matches);
    apply();
    query.addEventListener?.('change', apply);

    return () => query.removeEventListener?.('change', apply);
  }, []);

  /** Une modification voulue : appliquée tout de suite, remise à la coquille après SERIALIZE_MS. */
  const commit = useCallback((updater) => {
    setData((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      if (next === current) return current;
      dataRef.current = next;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        onChangeRef.current?.(serializeNumberLabData(dataRef.current));
      }, SERIALIZE_MS);

      return next;
    });
  }, []);

  // Le démontage ne perd JAMAIS le dernier changement.
  useEffect(() => () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      onChangeRef.current?.(serializeNumberLabData(dataRef.current));
    }
  }, []);

  /** La coquille peut vider le document (« مسح الكل »). */
  useEffect(() => {
    onReady?.({
      clear: () => {
        const fresh = createNumberLabData();
        setData(fresh);
        dataRef.current = fresh;
        onChangeRef.current?.(serializeNumberLabData(fresh));
      },
    });

    return () => onReady?.(null);
  }, [onReady]);

  /* ── Les gestes ─────────────────────────────────────────────────────── */

  const changeMode = useCallback((mode) => {
    if (!modes.includes(mode)) return;
    commit((current) => setMode(current, mode));
    setAnnouncement(t(`tools.numberLab.modes.${mode}`));
  }, [commit, t, modes]);

  const patch = useCallback((mode, updates) => {
    commit((current) => patchMode(current, mode, updates));
  }, [commit]);

  /** §46 — le pont entre les modes. */
  const send = useCallback((mode, value) => {
    if (!modes.includes(mode)) return;
    commit((current) => sendTo(current, mode, value));
    setAnnouncement(t('tools.numberLab.sent', {
      value: String(value), mode: t(`tools.numberLab.modes.${mode}`),
    }));
  }, [commit, t, modes]);

  /** §55 — garder une découverte, ici puis dans le vrai كرّاس. */
  const saveNote = useCallback((text) => {
    if (!text?.trim()) return;
    commit((current) => addNote(current, text));
    setNoteDraft('');
    setNotesOpen(true);
    setAnnouncement(t('tools.numberLab.notes.saved'));
  }, [commit, t]);

  /**
   * §55 — LE CAHIER, celui de la plateforme.
   *
   * On ne crée pas un second système de notes : on ouvre `NotebookWindow`
   * avec un contenu de départ, exactement comme « أضف إلى كرّاسي » le fait
   * depuis la carte des connaissances. Le Lab n'a pas de contexte de leçon,
   * donc la note naît sans leçon — ce que le cahier accepte.
   */
  const sendToNotebook = useCallback((text) => {
    if (!notebook?.openNotebook || !text?.trim()) return;
    const label = [t('tools.numberLab.name'), t(`tools.numberLab.modes.${data.mode}`)].filter(Boolean).join(' · ');
    notebook.openNotebook({
      context: { sourceType: 'knowledge_item', sourceId: `mathlab:numberLab:${data.mode}` },
      starterHtml: [
        '<section data-nb="mathlab">',
        `<p data-nb="label">${escapeHtml(label)}</p>`,
        `<p>${escapeHtml(text)}</p>`,
        '</section>',
      ].join(''),
    });
  }, [notebook, t, data.mode]);

  const recordPracticeAttempt = useCallback((result) => {
    commit((current) => recordAttempt(current, result));
  }, [commit]);

  /* ── Le mode affiché ────────────────────────────────────────────────── */

  const modeElement = useMemo(() => {
    switch (data.mode) {
      case 'explorer':
        return (
          <ExplorerMode
            value={data.explorer.value}
            onChangeValue={(value) => patch('explorer', { value })}
            onSend={send}
            compact={compact}
          />
        );
      case 'place':
        return (
          <PlaceValueMode
            value={data.place.value}
            decimals={data.place.decimals}
            onChange={(value, extra) => patch('place', { value, ...(extra ?? {}) })}
            onSend={send}
            compact={compact}
            reducedMotion={reducedMotion}
          />
        );
      case 'line':
        return <LineMode state={data.line} onChange={(u) => patch('line', u)} compact={compact} />;
      case 'fractions':
        return <FractionsMode state={data.fractions} onChange={(u) => patch('fractions', u)} compact={compact} />;
      case 'decimals':
        return <DecimalsMode state={data.decimals} onChange={(u) => patch('decimals', u)} compact={compact} />;
      case 'percent':
        return <PercentMode state={data.percent} onChange={(u) => patch('percent', u)} compact={compact} />;
      case 'proportion':
        return <ProportionMode state={data.proportion} onChange={(u) => patch('proportion', u)} compact={compact} />;
      case 'divisibility':
        return (
          <DivisibilityMode
            value={data.divisibility.value}
            onChange={(value) => patch('divisibility', { value })}
            onSend={send}
            onSaveNote={saveNote}
          />
        );
      case 'primes':
        return (
          <PrimesMode
            state={data.primes}
            onChange={(u) => patch('primes', u)}
            compact={compact}
            reducedMotion={reducedMotion}
          />
        );
      case 'factors':
        return <FactorsMode state={data.factors} onChange={(u) => patch('factors', u)} onSend={send} compact={compact} />;
      case 'gcdLcm':
        return (
          <GcdLcmMode
            state={data.gcdLcm}
            onChange={(u) => patch('gcdLcm', u)}
            compact={compact}
            onSaveNote={saveNote}
            reducedMotion={reducedMotion}
          />
        );
      case 'division':
        return <DivisionMode state={data.division} onChange={(u) => patch('division', u)} compact={compact} />;
      case 'powers':
        return <PowersMode state={data.powers} onChange={(u) => patch('powers', u)} />;
      case 'order':
        return <OrderMode state={data.order} onChange={(u) => patch('order', u)} />;
      case 'rounding':
        return <RoundingMode state={data.rounding} onChange={(u) => patch('rounding', u)} compact={compact} />;
      case 'operations':
        return (
          <OperationsMode
            state={data.operations}
            onChange={(u) => patch('operations', u)}
            compact={compact}
            onGoMode={changeMode}
          />
        );
      default:
        return null;
    }
  }, [data, patch, send, compact, reducedMotion, saveNote, changeMode]);

  /** La barre : seize modes rangés en trois familles (modeCatalog.js), chacun décrit. */
  const sections = useMemo(() => MODE_SECTIONS.filter((section) => modes.includes(section.id)).map((section) => ({
    ...section,
    label: t(`tools.numberLab.modesShort.${section.id}`),
    description: t(`tools.numberLab.modeDescriptions.${section.id}`),
  })), [t, modes]);
  const groupLabels = useMemo(
    () => Object.fromEntries(MODE_GROUPS.map((group) => [group, t(`tools.numberLab.modeGroups.${group}`)])),
    [t],
  );

  return (
    <NumberLabModesContext.Provider value={modes}>
    <div className="sa-ml-nb" data-ml-nb data-ml-nb-mode={data.mode}>
      {/* §3 : la barre des modes — seize portes, trois familles, un seul laboratoire.
          `data-ml-nb-modechip` reste l'attribut des e2e existants. */}
      <LabSectionNav
        sections={sections}
        active={data.mode}
        onChange={changeMode}
        label={t('tools.numberLab.modesLabel')}
        dataAttr="data-ml-nb-modechip"
        groupLabels={groupLabels}
      />

      <div className="sa-ml-nb__body">
        <main className="sa-ml-nb__stage" data-ml-nb-stage>
          {modeElement}
        </main>

        {/* §48 : l'entraînement, à côté — le laboratoire reste manipulable. */}
        {practiceOpen && (
          <aside className="sa-ml-nb__aside">
            <PracticePanel
              level={data.practice.level}
              stats={data.practice}
              onLevelChange={(level) => commit((current) => setPracticeLevel(current, level))}
              onAttempt={recordPracticeAttempt}
              compact={compact}
            />
          </aside>
        )}
      </div>

      {/* §55 : les notes, et le pont vers le vrai كرّاس. */}
      {notesOpen && (
        <section className="sa-ml-nb__notes">
          <header className="sa-ml-nb__panel-head">
            <h3 className="sa-ml-nb__heading">{t('tools.numberLab.notes.heading')}</h3>
            <p className="sa-ml-nb__muted">{t('tools.numberLab.notes.notebookHint')}</p>
          </header>

          <div className="sa-ml-nb__row">
            <input
              type="text"
              className="sa-ml-nb__input"
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && saveNote(noteDraft)}
              placeholder={t('tools.numberLab.notes.placeholder')}
              aria-label={t('tools.numberLab.notes.placeholder')}
            />
            <button type="button" className="sa-ml-nb__button" onClick={() => saveNote(noteDraft)}>
              {t('tools.numberLab.notes.add')}
            </button>
          </div>

          {data.notes.length === 0 ? (
            <p className="sa-ml-nb__muted">{t('tools.numberLab.notes.empty')}</p>
          ) : (
            <ul className="sa-ml-nb__notes-list">
              {data.notes.map((note, index) => (
                <li key={`${note}-${index}`}>
                  <span>{note}</span>
                  <span className="sa-ml-nb__notes-actions">
                    {notebook?.openNotebook && (
                      <button
                        type="button"
                        className="sa-ml-nb__tiny"
                        onClick={() => sendToNotebook(note)}
                        title={t('tools.numberLab.notes.addToNotebook')}
                      >
                        <NotebookPen size={12} aria-hidden="true" />
                        {t('tools.numberLab.notes.addToNotebook')}
                      </button>
                    )}
                    <button
                      type="button"
                      className="sa-ml-nb__tiny sa-ml-nb__tiny--remove"
                      onClick={() => commit((current) => removeNote(current, index))}
                      aria-label={t('tools.numberLab.notes.remove')}
                    >
                      <Trash2 size={12} aria-hidden="true" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* La barre du bas : entraînement et notes, jamais un score envahissant (§56). */}
      <footer className="sa-ml-nb__footer">
        <button
          type="button"
          className={`sa-ml-nb__button${practiceOpen ? '' : ' sa-ml-nb__button--ghost'}`}
          onClick={() => setPracticeOpen((v) => !v)}
          aria-pressed={practiceOpen}
        >
          <GraduationCap size={15} aria-hidden="true" />
          {practiceOpen ? t('tools.numberLab.practice.leave') : t('tools.numberLab.practice.start')}
        </button>
        <button
          type="button"
          className={`sa-ml-nb__button${notesOpen ? '' : ' sa-ml-nb__button--ghost'}`}
          onClick={() => setNotesOpen((v) => !v)}
          aria-pressed={notesOpen}
        >
          {notesOpen ? <PanelBottomClose size={15} aria-hidden="true" /> : <PanelBottomOpen size={15} aria-hidden="true" />}
          {t('tools.numberLab.notes.heading')}
          {data.notes.length > 0 && <span className="sa-ml-nb__count">{data.notes.length}</span>}
        </button>
      </footer>

      <p className="sa-ml-nb__sr" aria-live="polite">{announcement}</p>
    </div>
    </NumberLabModesContext.Provider>
  );
}

/**
 * Le cahier, s'il est là.
 *
 * `useNotebook` jette hors de son fournisseur. Le Lab est toujours monté sous
 * `NotebookProvider` dans l'application (App.jsx), mais un test ou un rendu
 * isolé peut ne pas l'avoir — et un instrument du مختبر ne doit pas tomber
 * parce qu'un carnet manque.
 */
function useSafeNotebook() {
  try {
    return useNotebook();
  } catch {
    return null;
  }
}
