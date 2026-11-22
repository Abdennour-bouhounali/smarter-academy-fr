import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search, X, SlidersHorizontal, Plus, Star, Trash2, Loader2, LayoutGrid, List, CheckCheck,
} from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import {
  fetchMathLabDocuments, deleteMathLabDocument, updateMathLabDocument, duplicateMathLabDocument, bulkMathLabDocuments,
} from '../../../services/mathLabService';
import ConfirmDialog from '../../practice/notebook/space/ConfirmDialog';
import { MATH_LAB_TOOLS, getMathLabTool } from '../toolRegistry';
import { mathLabToolPath, fromApiDocument } from '../mathLabDocument';
import { commonTools, isLabScope, toolsForScope, workLabScope } from '../labScope';
import WorkCard from './WorkCard';
import FeatureLockedPanel from '../../../components/access/FeatureLockedPanel';
import { refusalFromError } from '../../access/featureAccess';
import { refreshFeatureAccess, reportRefusal } from '../../../hooks/useFeatureAccess';
import WorkFilterPanel from './WorkFilterPanel';
import RenameDialog from './RenameDialog';
import {
  DEFAULT_WORK_FILTERS, WORK_SORTS, selectWorks, activeWorkFilterCount, duplicateTitle,
} from './workFilters';

const VIEW_STORAGE_KEY = 'sa.mathlab.work.view';

/**
 * « أعمالي » — l'ATELIER personnel de l'élève.
 *
 * Le modèle mental est : créer → enregistrer → revenir → continuer → ranger.
 * La page sert le dernier verbe : retrouver un travail parmi cinquante, et
 * faire le ménage. Elle ne remplace pas les instruments — elle y ramène.
 *
 * ── Où vit quoi ──────────────────────────────────────────────────────────
 * La liste arrive en UN appel, sans `data` (le serveur ne renvoie que
 * l'enveloppe et le résumé de chaque travail). Chercher, filtrer et trier se
 * font donc en mémoire, au caractère près, sans aller-retour — la logique
 * est pure et testée dans `workFilters.js`. Les APERÇUS se dessinent à partir
 * du seul résumé (`WorkPreview`) : aucune carte ne monte three.js, Excalidraw
 * ni MathLive.
 *
 * ── Ce qui touche au serveur ─────────────────────────────────────────────
 * Renommer, l'étoile, la copie, la suppression — seule et groupée. Chacun
 * met la liste à jour LOCALEMENT après coup : rien ne saute sous les doigts,
 * et on ne recharge pas cinquante travaux pour en avoir renommé un.
 */
/**
 * `initialLab` : le مخبر dont l'accueil montre l'atelier (`moyen`,
 * `secondaire`) — le filtre « المخبر » part posé dessus, et se retire comme
 * tout autre filtre. `all` sur l'accueil du مختبر.
 */
export default function MyWorkSpace({ labRoot, initialLab = 'all' }) {
  const { t } = useTranslation('mathlab');
  const { t: tc } = useTranslation('common');
  const w = useCallback((key, opts) => t(`work.${key}`, opts), [t]);
  const { token } = useContext(AuthContext);

  const [state, setState] = useState({ status: 'loading', works: [] });
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('updated');
  const [filters, setFilters] = useState(() => ({ ...DEFAULT_WORK_FILTERS, lab: isLabScope(initialLab) ? initialLab : 'all' }));
  const [view, setView] = useState(() => readStoredView());
  const [selected, setSelected] = useState(() => new Set());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirm, setConfirm] = useState(null); // { ids: number[] }
  const [renaming, setRenaming] = useState(null); // le travail à renommer
  const [actionError, setActionError] = useState(null);
  // Une copie refusée par le serveur (instrument fermé, quota atteint) :
  // on l'explique avec ses nombres, pas avec « تعذّر النسخ ».
  const [refusal, setRefusal] = useState(null);
  const [busy, setBusy] = useState(false);
  const searchRef = useRef(null);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading' }));
    try {
      const { documents } = await fetchMathLabDocuments(token);
      setState({ status: 'ready', works: documents.map(fromApiDocument) });
    } catch {
      setState({ status: 'error', works: [] });
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  // Le mode d'affichage est une préférence du poste, pas une donnée : il
  // survit au rechargement sans jamais voyager jusqu'au serveur.
  useEffect(() => {
    try { window.localStorage.setItem(VIEW_STORAGE_KEY, view); } catch { /* navigation privée */ }
  }, [view]);

  const toolLabel = useCallback((id) => {
    const tool = getMathLabTool(id);

    return tool ? t(tool.labelKey) : id ?? '';
  }, [t]);

  /** Le مخبر d'un travail : son résumé, ou l'instrument s'il n'en a qu'un (labScope.js). */
  const labOf = useCallback((work) => workLabScope(work, getMathLabTool(work?.tool)), []);

  const visible = useMemo(
    () => selectWorks(state.works, { q, filters, sort, toolLabel, labOf }),
    [state.works, q, filters, sort, toolLabel, labOf],
  );

  /** Combien de travaux par instrument et par مخبر — les pastilles des filtres. */
  const counts = useMemo(() => {
    const byTool = {};
    const byLab = {};
    for (const work of state.works) {
      byTool[work.tool] = (byTool[work.tool] ?? 0) + 1;
      const lab = labOf(work);
      if (lab) byLab[lab] = (byLab[lab] ?? 0) + 1;
    }

    return { byTool, byLab };
  }, [state.works, labOf]);

  // La sélection ne survit pas à un autre jeu de résultats : cocher trois
  // cartes puis filtrer ne doit jamais supprimer ce qu'on ne voit plus.
  useEffect(() => { setSelected(new Set()); }, [q, filters, sort]);

  const visibleIds = useMemo(() => visible.map((work) => work.id), [visible]);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));

  const toggleSelect = useCallback((work) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(work.id)) next.delete(work.id); else next.add(work.id);

      return next;
    });
  }, []);

  const selectAll = () => setSelected(allSelected ? new Set() : new Set(visibleIds));
  const clearSelection = () => setSelected(new Set());

  /** Remplace un travail dans la liste, sans rien rappeler au serveur. */
  const patchLocal = useCallback((id, patch) => {
    setState((s) => ({ ...s, works: s.works.map((work) => (work.id === id ? { ...work, ...patch } : work)) }));
  }, []);

  const removeLocal = useCallback((ids) => {
    const set = new Set(ids);
    setState((s) => ({ ...s, works: s.works.filter((work) => !set.has(work.id)) }));
  }, []);

  // ── Les gestes ──────────────────────────────────────────────────────────

  const toggleFavorite = useCallback(async (work) => {
    const next = !work.isFavorite;
    setActionError(null);
    // L'étoile répond TOUT DE SUITE ; si le serveur refuse, elle revient.
    patchLocal(work.id, { isFavorite: next });
    try {
      await updateMathLabDocument(token, work.id, { isFavorite: next });
    } catch {
      patchLocal(work.id, { isFavorite: work.isFavorite });
      setActionError(w('errors.favorite'));
    }
  }, [token, patchLocal, w]);

  const rename = useCallback(async (title) => {
    const work = renaming;
    setRenaming(null);
    if (!work) return;
    setActionError(null);
    const previous = work.title;
    patchLocal(work.id, { title });
    try {
      const { document } = await updateMathLabDocument(token, work.id, { title });
      patchLocal(work.id, { title: document?.title ?? title, updatedAt: document?.updatedAt ?? work.updatedAt });
    } catch {
      patchLocal(work.id, { title: previous });
      setActionError(w('errors.rename'));
    }
  }, [renaming, token, patchLocal, w]);

  const duplicate = useCallback(async (work) => {
    setActionError(null);
    setRefusal(null);
    setBusy(true);
    try {
      const title = duplicateTitle(work.title || t('untitled'), w('copyPrefix'), state.works.map((entry) => entry.title));
      const { document } = await duplicateMathLabDocument(token, work.id, title);
      const copy = fromApiDocument(document);
      // La copie se pose en tête : c'est elle qu'on vient de faire.
      setState((s) => ({ ...s, works: [copy, ...s.works] }));
      refreshFeatureAccess(token);
    } catch (error) {
      const refused = refusalFromError(error);
      if (refused) {
        reportRefusal(refused);
        setRefusal(refused);
      } else {
        setActionError(w('errors.duplicate'));
      }
    } finally {
      setBusy(false);
    }
  }, [token, state.works, t, w]);

  const confirmDelete = useCallback(async () => {
    const ids = confirm?.ids ?? [];
    setConfirm(null);
    if (ids.length === 0) return;
    setActionError(null);
    setBusy(true);
    try {
      if (ids.length === 1) await deleteMathLabDocument(token, ids[0]);
      else await bulkMathLabDocuments(token, ids, 'delete');
      removeLocal(ids);
      clearSelection();
    } catch {
      setActionError(w('errors.delete'));
    } finally {
      setBusy(false);
    }
  }, [confirm, token, removeLocal, w]);

  const bulkFavorite = useCallback(async (favorite) => {
    const ids = [...selected];
    if (ids.length === 0) return;
    setActionError(null);
    setBusy(true);
    try {
      await bulkMathLabDocuments(token, ids, favorite ? 'favorite' : 'unfavorite');
      const set = new Set(ids);
      setState((s) => ({ ...s, works: s.works.map((work) => (set.has(work.id) ? { ...work, isFavorite: favorite } : work)) }));
      clearSelection();
    } catch {
      setActionError(w('errors.favorite'));
    } finally {
      setBusy(false);
    }
  }, [selected, token, w]);

  const onCardAction = useCallback((action, work) => {
    switch (action) {
      case 'favorite': return toggleFavorite(work);
      case 'rename': return setRenaming(work);
      case 'duplicate': return duplicate(work);
      case 'delete': return setConfirm({ ids: [work.id] });
      default: return undefined;
    }
  }, [toggleFavorite, duplicate]);

  const resetAll = () => { setQ(''); setFilters(DEFAULT_WORK_FILTERS); };
  const activeFilters = activeWorkFilterCount(filters);
  const filtered = activeFilters > 0 || q.trim() !== '';

  // ── États de chargement ────────────────────────────────────────────────

  if (state.status === 'loading') {
    return (
      <p className="flex items-center gap-2 font-inter text-sm text-slate-500" aria-busy="true" data-ml-docs-loading>
        <Loader2 size={16} className="animate-spin" aria-hidden="true" /> {t('myWorkLoading')}
      </p>
    );
  }

  if (state.status === 'error') {
    return (
      <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-center justify-between gap-3 flex-wrap" data-ml-docs-error>
        <p className="font-inter text-sm text-rose-900">{t('myWorkError')}</p>
        <button type="button" onClick={load} className="sa-ml-btn sa-ml-btn--primary">{tc('retry')}</button>
      </div>
    );
  }

  // Aucun travail du tout : ce n'est pas un écran vide, c'est une invitation.
  if (state.works.length === 0) return <EmptyWorkspace labRoot={labRoot} scope={isLabScope(initialLab) ? initialLab : null} />;

  return (
    <div className="sa-mlw" data-ml-work-space>
      {/* ── Chercher ────────────────────────────────────────────────── */}
      <div className="sa-mlw-search">
        <Search size={20} aria-hidden="true" />
        <input
          ref={searchRef}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={w('searchPlaceholder')}
          aria-label={w('searchAria')}
          data-ml-work-search
        />
        {q && (
          <button type="button" className="sa-mlw-btn sa-mlw-btn--icon" onClick={() => { setQ(''); searchRef.current?.focus(); }} aria-label={w('clearSearch')} data-ml-work-search-clear>
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* ── La barre : compteur, tri, vue, filtres ──────────────────── */}
      <div className="sa-mlw-toolbar">
        <p className="sa-mlw-count" aria-live="polite" data-ml-work-count>
          {filtered ? w('countFiltered', { shown: visible.length, total: state.works.length }) : w('count', { count: state.works.length })}
        </p>

        <label className="sa-mlw-sort">
          <span className="sr-only sm:not-sr-only">{w('sortLabel')}</span>
          <select className="sa-mlw-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label={w('sortLabel')} data-ml-work-sort>
            {WORK_SORTS.map((option) => <option key={option} value={option}>{w(`sorts.${option}`)}</option>)}
          </select>
        </label>

        <div className="sa-mlw-views" role="group" aria-label={w('viewLabel')}>
          <button type="button" className="sa-mlw-btn sa-mlw-btn--icon" aria-pressed={view === 'grid'} aria-label={w('viewGrid')} title={w('viewGrid')} onClick={() => setView('grid')} data-ml-work-view="grid">
            <LayoutGrid size={17} aria-hidden="true" />
          </button>
          <button type="button" className="sa-mlw-btn sa-mlw-btn--icon" aria-pressed={view === 'list'} aria-label={w('viewList')} title={w('viewList')} onClick={() => setView('list')} data-ml-work-view="list">
            <List size={17} aria-hidden="true" />
          </button>
        </div>

        <button type="button" className="sa-mlw-btn sa-mlw-btn--ghost lg:hidden" onClick={() => setSheetOpen(true)} aria-expanded={sheetOpen} data-ml-work-filters-open>
          <SlidersHorizontal size={16} aria-hidden="true" /> {w('filters.title')}
          {activeFilters > 0 && <span className="sa-mlw-chip__count">{activeFilters}</span>}
        </button>

        {visible.length > 0 && (
          <button type="button" className="sa-mlw-btn sa-mlw-btn--ghost" onClick={selectAll} data-ml-work-select-all>
            <CheckCheck size={16} aria-hidden="true" /> {allSelected ? w('bulk.deselectAll') : w('bulk.selectAll')}
          </button>
        )}
      </div>

      {/* ── Les filtres actifs, toujours visibles et défaisables ─────── */}
      {activeFilters > 0 && (
        <div className="sa-mlw-active" data-ml-work-active-filters>
          <span className="sa-mlw-active__label">{w('filters.active')}</span>
          {filters.lab !== 'all' && (
            <button type="button" className="sa-mlw-pill" onClick={() => setFilters((f) => ({ ...f, lab: 'all' }))} data-ml-work-lab-pill={filters.lab}>
              {w(`filters.labs.${filters.lab}`)} <X size={13} aria-hidden="true" />
            </button>
          )}
          {filters.tool !== 'all' && (
            <button type="button" className="sa-mlw-pill" onClick={() => setFilters((f) => ({ ...f, tool: 'all' }))}>
              {toolLabel(filters.tool)} <X size={13} aria-hidden="true" />
            </button>
          )}
          {filters.period !== 'all' && (
            <button type="button" className="sa-mlw-pill" onClick={() => setFilters((f) => ({ ...f, period: 'all' }))}>
              {w(`filters.periods.${filters.period}`)} <X size={13} aria-hidden="true" />
            </button>
          )}
          {filters.favorite && (
            <button type="button" className="sa-mlw-pill" onClick={() => setFilters((f) => ({ ...f, favorite: false }))}>
              {w('filters.favorites')} <X size={13} aria-hidden="true" />
            </button>
          )}
          {activeFilters > 1 && (
            <button type="button" className="sa-mlw-btn sa-mlw-btn--link" onClick={() => setFilters(DEFAULT_WORK_FILTERS)} data-ml-work-clear-filters>
              {w('filters.clearAll')}
            </button>
          )}
        </div>
      )}

      {actionError && <p role="alert" className="sa-mlw-error" data-ml-work-error>{actionError}</p>}
      {refusal && <FeatureLockedPanel compact reason={refusal.reason} quota={refusal.quota} resource="documents" />}

      {/* ── Le corps : filtres en colonne (bureau) + les travaux ─────── */}
      <div className="sa-mlw-body-grid">
        <aside className="sa-mlw-aside">
          <div className="sa-mlw-aside__inner">
            <h3 className="sa-mlw-aside__title"><SlidersHorizontal size={16} aria-hidden="true" /> {w('filters.title')}</h3>
            <WorkFilterPanel filters={filters} counts={counts.byTool} labCounts={counts.byLab} total={state.works.length} onChange={setFilters} onReset={setFilters} />
          </div>
        </aside>

        <section aria-live="polite" aria-busy={busy}>
          {visible.length === 0 ? (
            <NoResults onReset={resetAll} />
          ) : (
            <ul className="sa-mlw-grid" data-view={view} data-ml-works>
              {visible.map((work) => (
                <li key={work.id}>
                  <WorkCard
                    work={work}
                    view={view}
                    labRoot={labRoot}
                    selected={selected.has(work.id)}
                    selectionMode={selected.size > 0}
                    onToggleSelect={toggleSelect}
                    onAction={onCardAction}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ── La feuille de filtres (téléphone) ───────────────────────── */}
      {sheetOpen && (
        <>
          <div className="sa-ns-sheet-backdrop" onMouseDown={() => setSheetOpen(false)} aria-hidden="true" />
          <div className="sa-ns-sheet" role="dialog" aria-modal="true" aria-label={w('filters.title')} data-ml-work-filters-sheet>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800">{w('filters.title')}</h3>
              <button type="button" className="sa-mlw-btn sa-mlw-btn--icon" onClick={() => setSheetOpen(false)} aria-label={tc('close')}>
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <WorkFilterPanel filters={filters} counts={counts.byTool} labCounts={counts.byLab} total={state.works.length} onChange={setFilters} onReset={setFilters} />
            <button type="button" className="sa-mlw-btn sa-mlw-btn--primary w-full mt-4" onClick={() => setSheetOpen(false)}>{tc('close')}</button>
          </div>
        </>
      )}

      {/* ── La barre des actions groupées ───────────────────────────── */}
      {selected.size > 0 && (
        <div className="sa-mlw-bulk" role="region" aria-label={w('bulk.selected', { count: selected.size })} data-ml-work-bulk>
          <span className="sa-mlw-bulk__count">{w('bulk.selected', { count: selected.size })}</span>
          <button type="button" className="sa-mlw-btn sa-mlw-btn--ghost" onClick={() => bulkFavorite(true)} disabled={busy} data-ml-work-bulk-favorite>
            <Star size={16} aria-hidden="true" /> {w('bulk.favorite')}
          </button>
          <button type="button" className="sa-mlw-btn sa-mlw-btn--ghost" onClick={() => bulkFavorite(false)} disabled={busy}>
            <Star size={16} aria-hidden="true" fill="none" /> {w('bulk.unfavorite')}
          </button>
          <button type="button" className="sa-mlw-btn sa-mlw-btn--danger" onClick={() => setConfirm({ ids: [...selected] })} disabled={busy} data-ml-work-bulk-delete>
            <Trash2 size={16} aria-hidden="true" /> {w('bulk.delete')}
          </button>
          <button type="button" className="sa-mlw-btn sa-mlw-btn--icon sa-mlw-bulk__close" onClick={clearSelection} aria-label={w('bulk.deselectAll')}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirm != null}
        title={confirm?.ids.length > 1 ? w('deleteMany.title', { count: confirm.ids.length }) : t('deleteTitle', { title: titleOf(state.works, confirm?.ids?.[0], t) })}
        body={confirm?.ids.length > 1 ? w('deleteMany.body') : t('deleteBody')}
        confirmLabel={tc('delete')}
        onConfirm={confirmDelete}
        onCancel={() => setConfirm(null)}
      />

      <RenameDialog
        open={renaming != null}
        initialTitle={renaming?.title ?? ''}
        onRename={rename}
        onCancel={() => setRenaming(null)}
      />
    </div>
  );
}

/** Aucun travail : on montre par où commencer, pas un vide (§24). */
function EmptyWorkspace({ labRoot, scope = null }) {
  const { t } = useTranslation('mathlab');
  // Dans un مخبر, on propose ses instruments (et la سبّورة), ouverts dans ce مخبر.
  const suggestions = scope ? [...commonTools(MATH_LAB_TOOLS), ...toolsForScope(MATH_LAB_TOOLS, scope)].slice(0, 4) : MATH_LAB_TOOLS.slice(0, 4);

  return (
    <div className="sa-mlw-empty" data-ml-docs-empty>
      <p className="sa-mlw-empty__title">{t('work.empty.title')}</p>
      <p className="sa-mlw-empty__body">{t('work.empty.body')}</p>
      <div className="sa-mlw-empty__tools">
        {suggestions.map((tool) => {
          const Icon = tool.icon;

          return (
            <Link key={tool.id} to={mathLabToolPath(tool, null, labRoot, toolsForScope([tool], scope).length ? scope : null)} className="sa-mlw-btn sa-mlw-btn--ghost" data-ml-work-empty-tool={tool.id}>
              <Icon size={16} aria-hidden="true" /> {t(tool.labelKey)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/** La recherche n'a rien donné : on le dit, et on offre d'en sortir (§25). */
function NoResults({ onReset }) {
  const { t } = useTranslation('mathlab');

  return (
    <div className="sa-mlw-empty" data-ml-work-no-results>
      <p className="sa-mlw-empty__title">{t('work.noResults.title')}</p>
      <p className="sa-mlw-empty__body">{t('work.noResults.body')}</p>
      <button type="button" className="sa-mlw-btn sa-mlw-btn--primary" onClick={onReset} data-ml-work-clear-all>
        <Plus size={16} aria-hidden="true" style={{ transform: 'rotate(45deg)' }} /> {t('work.noResults.reset')}
      </button>
    </div>
  );
}

function titleOf(works, id, t) {
  const work = works.find((entry) => entry.id === id);

  return work?.title || t('untitled');
}

/** La vue choisie la dernière fois — grille par défaut. */
function readStoredView() {
  try {
    const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);

    return stored === 'list' ? 'list' : 'grid';
  } catch {
    return 'grid';
  }
}
