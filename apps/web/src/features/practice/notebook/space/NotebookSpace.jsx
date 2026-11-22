import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  NotebookPen, Search, X, SlidersHorizontal, Plus, RotateCcw, CircleX, CircleHelp, Star, Archive, Trash2, Printer, Brain, BookOpen,
} from 'lucide-react';
import { AuthContext } from '../../../../context/AuthContext';
import { useDocumentMeta } from '../../../../hooks/useDocumentMeta';
import StatTile from '../../../../components/common/StatTile';
import { fetchNotes, updateNote, deleteNote, bulkNotes } from '../../../../services/practiceService';
import { useNotebook } from '../NotebookProvider';
import { useNotesSearch } from './useNotesSearch';
import NoteCard from './NoteCard';
import FilterPanel, { DEFAULT_FILTERS, activeFilterCount } from './FilterPanel';
import ConfirmDialog from './ConfirmDialog';
import { PrintDialog } from './PrintSheet';
import { VIEWS, SORTS, notebookPaths } from './noteMeta';
import { useWorkspaceBase } from '../../../learning/learningViewer';
import QuotaMeter from '../../../../components/access/QuotaMeter';
import { useFeatureAccess } from '../../../../hooks/useFeatureAccess';
import { NOTEBOOK_FEATURE, featureState } from '../../../access/featureAccess';
import '../notebook.css';
import './notebookSpace.css';

const VIEW_ICON = { all: NotebookPen, review: RotateCcw, errors: CircleX, questions: CircleHelp, pinned: Star, archived: Archive };

/**
 * « Mon cahier » (كرّاسي) — l'espace où l'élève RETROUVE, range et révise
 * tout ce qu'il a écrit.
 *
 * Le cahier flottant sert à écrire MAINTENANT, dans la leçon ; cette page
 * sert APRÈS : chercher, filtrer, trier, ouvrir, imprimer, archiver, réviser.
 * Les deux lisent les mêmes notes ; ce sont deux expériences.
 *
 * Tout ce qui coûte est côté serveur (recherche, filtres, tri, pages,
 * compteurs, facettes) ; la page tient sa liste à jour localement après
 * chaque geste pour que rien ne saute sous les doigts.
 *
 * La vue courante vit dans l'URL (`?view=review`) : « Ma progression » et les
 * états vides peuvent y renvoyer directement.
 */
export default function NotebookSpace() {
  const { t } = useTranslation('student');
  // Le compteur des NOUVELLES notes (« الوصول والحدود ») — lu, jamais décidé ici.
  const notebookQuota = featureState(useFeatureAccess().summary, NOTEBOOK_FEATURE).quota;
  const { t: tc } = useTranslation('common');
  const s = (key, opts) => t(`notebook.space.${key}`, opts);
  useDocumentMeta(s('metaTitle'), s('metaDescription'));
  const { token } = useContext(AuthContext);
  const { openNotebook } = useNotebook();
  const paths = notebookPaths(useWorkspaceBase());
  const [params, setParams] = useSearchParams();

  const view = VIEWS.includes(params.get('view')) ? params.get('view') : 'all';
  const setView = (v) => setParams((p) => { const n = new URLSearchParams(p); if (v === 'all') n.delete('view'); else n.set('view', v); return n; }, { replace: true });
  const [q, setQ] = useState('');
  const [sort, setSort] = useState(view === 'review' ? 'review' : 'newest');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const [confirm, setConfirm] = useState(null); // { ids: number[] }
  const [printJob, setPrintJob] = useState(null); // { sets, defaultMode }
  const [actionError, setActionError] = useState(null);

  const {
    notes, meta, counts, facets, loading, loadingMore, error, loadMore, refresh, patchLocal, removeLocal, setCounts,
  } = useNotesSearch(token, { view, q, sort, filters });

  // Changer de vue vide la sélection : elle ne survit pas à un autre jeu de notes.
  useEffect(() => { setSelected(new Set()); }, [view, q, filters, sort]);

  const refreshCounts = useCallback(async () => {
    try {
      const data = await fetchNotes(token, { view: 'all', page: 1, perPage: 1 });
      if (data.counts) setCounts(data.counts);
    } catch { /* les compteurs se rattraperont au prochain chargement */ }
  }, [token, setCounts]);

  const patch = useCallback(async (note, body, { leavesView = false } = {}) => {
    setActionError(null);
    try {
      const { note: updated } = await updateNote(token, note.id, body);
      patchLocal(updated, { stillInView: !leavesView });
      refreshCounts();
    } catch (e) {
      setActionError(e.message);
    }
  }, [token, patchLocal, refreshCounts]);

  const onCardAction = useCallback((action, note) => {
    switch (action) {
      case 'pin':
        return patch(note, { pinned: !note.isPinned }, { leavesView: view === 'pinned' && note.isPinned });
      case 'review':
        return patch(note, { review: !note.isToReview }, { leavesView: view === 'review' && note.isToReview });
      case 'archive':
        return patch(note, { archived: !note.isArchived }, { leavesView: true });
      case 'delete':
        return setConfirm({ ids: [note.id] });
      case 'print':
        return setPrintJob({ sets: { this: [note], selected: selectedNotes(), results: notes }, defaultMode: 'this' });
      default:
        return undefined;
    }
  }, [patch, view, notes]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedNotes = () => notes.filter((n) => selected.has(n.id));
  const toggleSelect = (note) => setSelected((prev) => { const n = new Set(prev); if (n.has(note.id)) n.delete(note.id); else n.add(note.id); return n; });
  const selectAll = () => setSelected(new Set(notes.map((n) => n.id)));
  const clearSelection = () => setSelected(new Set());

  const bulk = async (action) => {
    const ids = [...selected];
    if (!ids.length) return;
    setActionError(null);
    try {
      const data = await bulkNotes(token, ids, action);
      if (action === 'delete' || action === 'archive' || action === 'unarchive') removeLocal(ids);
      else refresh();
      if (data.counts) setCounts(data.counts);
      clearSelection();
    } catch (e) {
      setActionError(e.message);
    }
  };

  const confirmDelete = async () => {
    const ids = confirm?.ids ?? [];
    setConfirm(null);
    setActionError(null);
    try {
      if (ids.length === 1) await deleteNote(token, ids[0]);
      else await bulkNotes(token, ids, 'delete');
      removeLocal(ids);
      clearSelection();
      refreshCounts();
    } catch (e) {
      setActionError(e.message);
    }
  };

  const newNote = () => openNotebook({ context: null, onSaved: () => { refresh(); } });

  const activeFilters = activeFilterCount(filters);
  const isEmpty = !loading && !error && notes.length === 0;
  const subtitleForPrint = useMemo(() => {
    const parts = [s(`views.${view}`)];
    if (filters.lessonCode) parts.push(facets.find((f) => f.lessonCode === filters.lessonCode)?.lessonTitle ?? filters.lessonCode);
    if (q.trim()) parts.push(`«${q.trim()}»`);
    return parts.join(' · ');
  }, [view, filters.lessonCode, facets, q]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="sa-page py-8 sm:py-10" data-nb-space>
      {/* ── En-tête ─────────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p className="font-mono-jetbrains text-violet-600 text-xs font-semibold tracking-widest uppercase mb-2">{s('eyebrow')}</p>
          <h1 className="font-space font-bold text-2xl sm:text-3xl text-slate-900 inline-flex items-center gap-2">
            <span aria-hidden="true">📓</span> {s('title')}
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-xl">{s('subtitle')}</p>
          {notebookQuota && !notebookQuota.unlimited && <QuotaMeter quota={notebookQuota} className="mt-2" />}
        </div>
        <button type="button" className="sa-ns-btn sa-ns-btn--primary" onClick={newNote} data-nb-new>
          <Plus size={18} aria-hidden="true" /> {s('newNote')}
        </button>
      </header>

      {/* ── Compteurs : une lecture rapide, pas un tableau de bord ───── */}
      {counts && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6" data-nb-stats>
          <StatTile icon={NotebookPen} value={counts.all} label={s('statNotes')} accent="bg-violet-100 text-violet-700" />
          <StatTile icon={RotateCcw} value={counts.review} label={s('statReview')} accent="bg-amber-100 text-amber-700" />
          <StatTile icon={CircleX} value={counts.errors} label={s('statErrors')} accent="bg-rose-100 text-rose-700" />
          <StatTile icon={CircleHelp} value={counts.questions} label={s('statQuestions')} accent="bg-blue-100 text-nav-accent" />
        </div>
      )}

      {/* ── Recherche ───────────────────────────────────────────────── */}
      <div className="sa-ns-search mb-4" data-tour="notebook.search">
        <Search size={20} aria-hidden="true" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={s('searchPlaceholder')}
          aria-label={s('searchAria')}
          data-nb-search
        />
        {q && (
          <button type="button" className="sa-ns-btn sa-ns-btn--icon" onClick={() => setQ('')} aria-label={s('clearSearch')}>
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* ── Vues ───────────────────────────────────────────────────── */}
      <div className="sa-ns-tabs mb-4" data-tour="notebook.tabs" role="tablist" aria-label={s('viewsAria')}>
        {VIEWS.map((v) => {
          const Icon = VIEW_ICON[v];
          return (
            <button
              key={v}
              type="button"
              role="tab"
              className="sa-ns-tab"
              aria-selected={view === v}
              onClick={() => { setView(v); if (v === 'review') setSort('review'); }}
              data-nb-view={v}
            >
              <Icon size={16} aria-hidden="true" /> {s(`views.${v}`)}
              {counts && <span className="sa-ns-tab-count">{counts[v] ?? 0}</span>}
            </button>
          );
        })}
      </div>

      {/* ── Barre d'outils ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <p className="text-sm text-slate-500 me-auto" data-nb-results>{loading ? s('loading') : s('results', { count: meta.total })}</p>
        {view === 'review' && counts?.review > 0 && (
          <Link to={paths.review} className="sa-ns-btn sa-ns-btn--primary" data-nb-review-start>
            <Brain size={18} aria-hidden="true" /> {s('review.start')}
          </Link>
        )}
        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
          <span className="sr-only sm:not-sr-only">{s('sortLabel')}</span>
          <select className="sa-ns-select !w-auto" value={sort} onChange={(e) => setSort(e.target.value)} aria-label={s('sortLabel')} data-nb-sort>
            {SORTS.map((o) => <option key={o} value={o}>{s(`sort.${o}`)}</option>)}
          </select>
        </label>
        <button type="button" className="sa-ns-btn sa-ns-btn--ghost lg:hidden" onClick={() => setSheetOpen(true)} aria-expanded={sheetOpen} data-nb-filters-open data-tour="notebook.filters">
          <SlidersHorizontal size={16} aria-hidden="true" /> {s('filters')}
          {activeFilters > 0 && <span className="sa-ns-tab-count">{activeFilters}</span>}
        </button>
      </div>

      {actionError && <p role="alert" className="mb-4 text-sm text-rose-700 bg-rose-50 border-2 border-rose-200 rounded-xl p-3">{actionError}</p>}

      {/* ── Corps : filtres en colonne + cartes ─────────────────────── */}
      <div className="lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8">
        <aside className="hidden lg:block">
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-4" data-tour="notebook.filters">
            <h2 className="font-bold text-slate-800 mb-3 inline-flex items-center gap-2"><SlidersHorizontal size={16} aria-hidden="true" /> {s('filtersTitle')}</h2>
            <FilterPanel filters={filters} facets={facets} onChange={setFilters} onReset={() => setFilters(DEFAULT_FILTERS)} />
          </div>
        </aside>

        <section aria-live="polite" aria-busy={loading}>
          {error && (
            <div className="sa-ns-empty">
              <p className="text-rose-700 font-bold">{s('loadError')}</p>
              <button type="button" className="sa-ns-btn sa-ns-btn--ghost" onClick={refresh}>{s('retry')}</button>
            </div>
          )}

          {loading && !error && (
            <div className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-4" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => <div key={i} className="sa-ns-skeleton" />)}
            </div>
          )}

          {isEmpty && <EmptyState view={view} q={q} filtered={activeFilters > 0} onReset={() => { setQ(''); setFilters(DEFAULT_FILTERS); }} />}

          {!loading && !error && notes.length > 0 && (
            <>
              <div className="flex items-center justify-end mb-2">
                <button type="button" className="sa-ns-btn sa-ns-btn--link text-sm" onClick={selected.size === notes.length ? clearSelection : selectAll} data-nb-select-all>
                  {selected.size === notes.length ? s('bulk.clear') : s('bulk.selectAll')}
                </button>
              </div>
              <div className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-4" data-nb-cards>
                {notes.map((note) => (
                  <NoteCard key={note.id} note={note} selected={selected.has(note.id)} onToggleSelect={toggleSelect} onAction={onCardAction} />
                ))}
              </div>
              {meta.hasMore && (
                <div className="flex justify-center mt-6">
                  <button type="button" className="sa-ns-btn sa-ns-btn--ghost" onClick={loadMore} disabled={loadingMore} data-nb-load-more>
                    {loadingMore ? s('loading') : s('loadMore')}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* ── Feuille de filtres (téléphone) ─────────────────────────── */}
      {sheetOpen && (
        <>
          <div className="sa-ns-sheet-backdrop" onMouseDown={() => setSheetOpen(false)} aria-hidden="true" />
          <div className="sa-ns-sheet" role="dialog" aria-modal="true" aria-label={s('filtersTitle')} data-nb-filters-sheet>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-800">{s('filtersTitle')}</h2>
              <button type="button" className="sa-ns-btn sa-ns-btn--icon" onClick={() => setSheetOpen(false)} aria-label={s('closeFilters')}><X size={20} aria-hidden="true" /></button>
            </div>
            <FilterPanel filters={filters} facets={facets} onChange={setFilters} onReset={() => setFilters(DEFAULT_FILTERS)} />
            <button type="button" className="sa-ns-btn sa-ns-btn--primary w-full mt-4" onClick={() => setSheetOpen(false)}>{tc('close')}</button>
          </div>
        </>
      )}

      {/* ── Actions groupées ────────────────────────────────────────── */}
      {selected.size > 0 && (
        <div className="sa-ns-bulk" role="region" aria-label={s('bulk.selected', { count: selected.size })} data-nb-bulk>
          <span className="font-bold me-auto">{s('bulk.selected', { count: selected.size })}</span>
          {view === 'archived' ? (
            <button type="button" className="sa-ns-btn sa-ns-btn--ghost" onClick={() => bulk('unarchive')}><Archive size={16} aria-hidden="true" /> {s('bulk.unarchive')}</button>
          ) : (
            <button type="button" className="sa-ns-btn sa-ns-btn--ghost" onClick={() => bulk('archive')} data-nb-bulk-archive><Archive size={16} aria-hidden="true" /> {s('bulk.archive')}</button>
          )}
          <button type="button" className="sa-ns-btn sa-ns-btn--ghost" onClick={() => setPrintJob({ sets: { selected: selectedNotes(), results: notes }, defaultMode: 'selected' })}><Printer size={16} aria-hidden="true" /> {s('bulk.print')}</button>
          <button type="button" className="sa-ns-btn sa-ns-btn--danger" onClick={() => setConfirm({ ids: [...selected] })} data-nb-bulk-delete><Trash2 size={16} aria-hidden="true" /> {s('bulk.delete')}</button>
          <button type="button" className="sa-ns-btn sa-ns-btn--icon !text-white" onClick={clearSelection} aria-label={s('bulk.clear')}><X size={18} aria-hidden="true" /></button>
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.ids.length > 1 ? s('bulk.deleteTitle') : s('detail.deleteTitle')}
        body={confirm?.ids.length > 1 ? s('bulk.deleteBody', { count: confirm.ids.length }) : s('detail.deleteBody')}
        confirmLabel={s('detail.deleteConfirm')}
        onConfirm={confirmDelete}
        onCancel={() => setConfirm(null)}
      />
      <PrintDialog open={!!printJob} sets={printJob?.sets} defaultMode={printJob?.defaultMode} subtitle={subtitleForPrint} onClose={() => setPrintJob(null)} />
    </div>
  );
}

/** Jamais « Aucune note » : chaque vue vide dit quoi faire ensuite. */
function EmptyState({ view, q, filtered, onReset }) {
  const { t } = useTranslation('student');
  const e = (key, opts) => t(`notebook.space.empty.${key}`, opts);
  const paths = notebookPaths(useWorkspaceBase());
  if (q.trim()) {
    return (
      <div className="sa-ns-empty" data-nb-empty="search">
        <p className="font-bold text-slate-800">{e('searchTitle', { q: q.trim() })}</p>
        <p className="text-sm text-slate-500">{e('searchBody')}</p>
        <button type="button" className="sa-ns-btn sa-ns-btn--ghost" onClick={onReset}>{t('notebook.space.resetFilters')}</button>
      </div>
    );
  }
  if (filtered) {
    return (
      <div className="sa-ns-empty" data-nb-empty="filtered">
        <p className="font-bold text-slate-800">{e('filteredTitle')}</p>
        <button type="button" className="sa-ns-btn sa-ns-btn--ghost" onClick={onReset}>{t('notebook.space.resetFilters')}</button>
      </div>
    );
  }
  const map = {
    all: ['allTitle', 'allBody'], review: ['reviewTitle', 'reviewBody'], errors: ['errorsTitle', 'errorsBody'],
    questions: ['questionsTitle', 'questionsBody'], pinned: ['pinnedTitle', 'pinnedBody'], archived: ['archivedTitle', 'archivedBody'],
  };
  const [title, body] = map[view] ?? map.all;

  return (
    <div className="sa-ns-empty" data-nb-empty={view}>
      <span className="text-4xl" aria-hidden="true">📓</span>
      <p className="font-bold text-slate-800 text-lg">{e(title)}</p>
      <p className="text-sm text-slate-500 max-w-md">{e(body)}</p>
      {view === 'all' && (
        <Link to={paths.courses} className="sa-ns-btn sa-ns-btn--primary"><BookOpen size={16} aria-hidden="true" /> {e('allCta')}</Link>
      )}
    </div>
  );
}
