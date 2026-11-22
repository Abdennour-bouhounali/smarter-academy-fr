import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { MASTERY_STATES } from '../../../lessons/common/components/LearningPointMastery';
import { PRIMARY_FILTERS, SORTS, DEFAULT_VIEW, countAdvancedFilters } from '../progressionView';
import { ACTIVITY_STATES, MASTERY_STATE_KEYS } from '../buildProgressionTree';
import { mathToPlain } from '../../../utils/mathPlain';

const FILTER_KEY = {
  all: 'progression.curriculum.filterAll',
  inProgress: 'progression.curriculum.filterInProgress',
  work: 'progression.curriculum.filterWork',
  done: 'progression.curriculum.filterDone',
};
const FILTER_EMOJI = { all: '', inProgress: '🔵', work: '🔴', done: '✅' };
const SORT_KEY = {
  curriculum: 'progression.curriculum.sortCurriculum',
  recent: 'progression.curriculum.sortRecent',
  oldest: 'progression.curriculum.sortOldest',
  progress: 'progression.curriculum.sortProgress',
};
const ACTIVITY_KEY = {
  not_started: 'progression.curriculum.activityNotStarted',
  in_progress: 'progression.curriculum.activityInProgress',
  done: 'progression.curriculum.activityDone',
};

function toggleIn(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/**
 * Recherche, filtres principaux (pastilles, défilables sur mobile), tri et
 * filtres avancés (panneau dépliable) de l'arbre du programme. Le composant
 * ne connaît aucune donnée : il édite `view` (progressionView.js) et c'est
 * la page qui applique.
 */
export default function ProgressionToolbar({ view, onChange, fields, matched, total }) {
  const { t } = useTranslation('student');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const panelId = useId();
  const set = (patch) => onChange({ ...view, ...patch });
  const advancedCount = countAdvancedFilters(view);
  const unitsOfField = (fields.find((f) => f.id === view.fieldId)?.groups ?? fields.flatMap((f) => f.groups)).filter((g) => g.kind === 'unit');

  return (
    <div className="space-y-3" data-progression-toolbar>
      {/* Recherche */}
      <div className="relative">
        <Search size={18} className="absolute top-1/2 -translate-y-1/2 start-4 text-slate-400 pointer-events-none" aria-hidden="true" />
        <input
          type="search"
          value={view.query}
          onChange={(e) => set({ query: e.target.value })}
          placeholder={t('progression.curriculum.searchPlaceholder')}
          aria-label={t('progression.curriculum.searchAria')}
          className="w-full min-h-[48px] ps-11 pe-11 rounded-2xl border-2 border-slate-200 bg-white text-sm font-inter text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-nav-accent focus-visible:ring-2 focus-visible:ring-nav-accent/30"
          data-progression-search
        />
        {view.query && (
          <button
            type="button"
            onClick={() => set({ query: '' })}
            aria-label={t('progression.curriculum.clearSearch')}
            className="absolute top-1/2 -translate-y-1/2 end-2 w-9 h-9 rounded-xl inline-flex items-center justify-center text-slate-500 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Filtres principaux + tri + avancés */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div
          role="group"
          aria-label={t('progression.curriculum.filtersAria')}
          className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {PRIMARY_FILTERS.map((f) => {
            const on = view.filter === f;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={on}
                onClick={() => set({ filter: f })}
                className={`flex-shrink-0 min-h-[44px] px-4 rounded-xl text-sm font-inter font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent ${
                  on ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
                data-progression-filter={f}
              >
                {FILTER_EMOJI[f] && <span aria-hidden="true" className="me-1">{FILTER_EMOJI[f]}</span>}
                {t(FILTER_KEY[f])}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 sm:ms-auto">
          <label className="inline-flex items-center gap-2 text-xs font-inter text-slate-600">
            <span className="sr-only sm:not-sr-only">{t('progression.curriculum.sortLabel')}</span>
            <select
              value={view.sort}
              onChange={(e) => set({ sort: e.target.value })}
              aria-label={t('progression.curriculum.sortLabel')}
              className="min-h-[44px] px-3 rounded-xl border border-slate-200 bg-white text-sm font-inter text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent"
              data-progression-sort
            >
              {SORTS.map((s) => <option key={s} value={s}>{t(SORT_KEY[s])}</option>)}
            </select>
          </label>
          <button
            type="button"
            onClick={() => setAdvancedOpen((o) => !o)}
            aria-expanded={advancedOpen}
            aria-controls={panelId}
            className={`min-h-[44px] px-3.5 rounded-xl border text-sm font-inter font-semibold inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent ${
              advancedCount ? 'border-blue-300 bg-nav-accent-soft text-nav-accent' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            data-progression-advanced-toggle
          >
            <SlidersHorizontal size={15} aria-hidden="true" /> {t('progression.curriculum.advanced')}
            {advancedCount > 0 && <span className="rounded-full bg-nav-accent text-white px-1.5 text-[11px] font-mono-jetbrains font-bold">{advancedCount}</span>}
          </button>
        </div>
      </div>

      {advancedOpen && (
        <div id={panelId} className="rounded-2xl border border-slate-200 bg-white p-4 grid gap-4 sm:grid-cols-2" data-progression-advanced>
          <div className="sm:col-span-2 flex items-center justify-between gap-2">
            <h3 className="font-space font-bold text-slate-800 text-sm inline-flex items-center gap-2"><SlidersHorizontal size={14} aria-hidden="true" /> {t('progression.curriculum.advancedTitle')}</h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChange({ ...view, fieldId: '', unitId: '', masteryStates: [], activityStates: [] })}
                className="min-h-[36px] px-3 rounded-lg text-xs font-mono-jetbrains font-bold text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent"
              >
                {t('progression.curriculum.advancedReset')}
              </button>
              <button
                type="button"
                onClick={() => setAdvancedOpen(false)}
                aria-label={t('progression.curriculum.advancedClose')}
                className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-slate-500 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          <label className="block text-xs font-inter text-slate-600">
            <span className="block mb-1 font-semibold">{t('progression.curriculum.advancedField')}</span>
            <select
              value={view.fieldId}
              onChange={(e) => set({ fieldId: e.target.value, unitId: '' })}
              className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent"
            >
              <option value="">{t('progression.curriculum.advancedAny')}</option>
              {fields.map((f) => <option key={f.id} value={f.id}>{mathToPlain(f.title)}</option>)}
            </select>
          </label>

          <label className="block text-xs font-inter text-slate-600">
            <span className="block mb-1 font-semibold">{t('progression.curriculum.advancedUnit')}</span>
            <select
              value={view.unitId}
              onChange={(e) => set({ unitId: e.target.value })}
              disabled={unitsOfField.length === 0}
              className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent disabled:opacity-60"
            >
              <option value="">{t('progression.curriculum.advancedAny')}</option>
              {unitsOfField.map((u) => <option key={u.id} value={u.id}>{mathToPlain(u.title)}</option>)}
            </select>
          </label>

          <fieldset className="text-xs font-inter text-slate-600">
            <legend className="mb-1 font-semibold">{t('progression.curriculum.advancedMastery')}</legend>
            <div className="flex flex-wrap gap-2">
              {MASTERY_STATE_KEYS.map((s) => {
                const on = view.masteryStates.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={on}
                    onClick={() => set({ masteryStates: toggleIn(view.masteryStates, s) })}
                    className={`min-h-[40px] px-3 rounded-xl border text-xs font-inter font-semibold inline-flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent ${on ? 'bg-nav-accent text-white border-nav-accent' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                  >
                    <span aria-hidden="true">{MASTERY_STATES[s].emoji}</span> {t(MASTERY_STATES[s].labelKey)}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="text-xs font-inter text-slate-600">
            <legend className="mb-1 font-semibold">{t('progression.curriculum.advancedActivity')}</legend>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_STATES.map((s) => {
                const on = view.activityStates.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={on}
                    onClick={() => set({ activityStates: toggleIn(view.activityStates, s) })}
                    className={`min-h-[40px] px-3 rounded-xl border text-xs font-inter font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent ${on ? 'bg-nav-accent text-white border-nav-accent' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                  >
                    {t(ACTIVITY_KEY[s])}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>
      )}

      <p className="text-xs font-inter text-slate-500" aria-live="polite" data-progression-results>
        {matched > 0 ? t('progression.curriculum.results', { count: matched }) : t('progression.curriculum.resultsNone')}
        {matched !== total && ` ${t('progression.curriculum.resultsOf', { total })}`}
        {(view.query || view.filter !== 'all' || advancedCount > 0) && (
          <>
            {' · '}
            <button
              type="button"
              onClick={() => onChange({ ...DEFAULT_VIEW, sort: view.sort })}
              className="underline decoration-dotted text-nav-accent hover:text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent rounded"
              data-progression-reset
            >
              {t('progression.curriculum.advancedReset')}
            </button>
          </>
        )}
      </p>
    </div>
  );
}
