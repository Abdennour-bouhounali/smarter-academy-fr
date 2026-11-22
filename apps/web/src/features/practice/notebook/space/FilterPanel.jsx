import { useTranslation } from 'react-i18next';
import { NOTE_TYPES, curriculumTree } from './noteMeta';

/**
 * Les filtres de « Mon cahier » : le MÊME panneau en colonne (grand écran) et
 * en feuille basse (téléphone). Trois groupes : le source (leçon / exercice),
 * le type, et le MENHAJ — classe → domaine → leçon, bâti depuis les facettes
 * du serveur et le catalogue. Rien n'est proposé que le serveur ne sache
 * filtrer.
 *
 * @param {{origin: string, type: string, lessonCode: string|null}} filters
 */
export default function FilterPanel({ filters, facets, onChange, onReset }) {
  const { t } = useTranslation('student');
  const s = (key, opts) => t(`notebook.space.${key}`, opts);
  const tree = curriculumTree(facets);
  const set = (patch) => onChange({ ...filters, ...patch });

  return (
    <div className="sa-ns-filters" data-nb-filters>
      <section className="sa-ns-filter-group">
        <h3>{s('origin')}</h3>
        {['all', 'lesson', 'exercise'].map((o) => (
          <label key={o} className="sa-ns-choice">
            <input type="radio" name="nb-origin" value={o} checked={(filters.origin ?? 'all') === o} onChange={() => set({ origin: o })} />
            {s(o === 'all' ? 'originAll' : o === 'lesson' ? 'originLesson' : 'originExercise')}
          </label>
        ))}
      </section>

      <section className="sa-ns-filter-group">
        <h3>{s('typeLabel')}</h3>
        <select className="sa-ns-select" value={filters.type ?? 'all'} onChange={(e) => set({ type: e.target.value })} aria-label={s('typeLabel')}>
          <option value="all">{s('typeAll')}</option>
          {NOTE_TYPES.map((tp) => (
            <option key={tp.id} value={tp.id}>{tp.emoji} {s(`types.${tp.id}`)}</option>
          ))}
        </select>
      </section>

      <section className="sa-ns-filter-group">
        <h3>{s('byCurriculum')}</h3>
        <div className="sa-ns-tree">
          <button
            type="button"
            className="sa-ns-tree-lesson"
            aria-pressed={!filters.lessonCode}
            onClick={() => set({ lessonCode: null })}
          >
            <span>{s('allLessons')}</span>
          </button>
          {tree.grades.map((g) => (
            <div key={g.id}>
              <p className="sa-ns-tree-grade">{g.title}</p>
              {g.chapters.map((ch) => (
                <div key={ch.id}>
                  <p className="sa-ns-tree-chapter">{ch.title}</p>
                  {ch.lessons.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      className="sa-ns-tree-lesson"
                      aria-pressed={filters.lessonCode === l.code}
                      onClick={() => set({ lessonCode: filters.lessonCode === l.code ? null : l.code })}
                      data-nb-filter-lesson={l.code}
                    >
                      <span>{l.title}</span>
                      <span>{l.count}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ))}
          {tree.orphan > 0 && (
            <p className="sa-ns-tree-chapter">{s('noLessonGroup')} · {tree.orphan}</p>
          )}
        </div>
      </section>

      <button type="button" className="sa-ns-btn sa-ns-btn--ghost" onClick={onReset}>
        {s('resetFilters')}
      </button>
    </div>
  );
}

/** Combien de filtres s'écartent du défaut — pour la pastille du bouton « تصفية ». */
export function activeFilterCount(filters) {
  let n = 0;
  if (filters?.origin && filters.origin !== 'all') n += 1;
  if (filters?.type && filters.type !== 'all') n += 1;
  if (filters?.lessonCode) n += 1;

  return n;
}

export const DEFAULT_FILTERS = { origin: 'all', type: 'all', lessonCode: null };
