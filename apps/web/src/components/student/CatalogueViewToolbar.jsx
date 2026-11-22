import { useTranslation } from 'react-i18next';
import { Layers, FolderTree, ListOrdered, LayoutGrid, Rows3 } from 'lucide-react';

const GROUP_ICONS = { units: Layers, chapters: FolderTree, all: ListOrdered };
const LAYOUT_ICONS = { grid: LayoutGrid, rows: Rows3 };

/**
 * Le sélecteur de VUE du catalogue (catalogueView.js) : l'organisation
 * (الوحدات / حسب الميادين / كل الدروس), toujours nommée en toutes lettres,
 * et la disposition (شبكة / قائمة), en icônes nommées par `aria-label`.
 * Pendant une recherche, l'organisation n'a pas de sens (les résultats sont
 * à plat) : elle est désactivée, la disposition reste.
 *
 * Le sélecteur ouvre la ligne (à droite en arabe), le compte la ferme.
 */
export default function CatalogueViewToolbar({ view, onChange, count, searching = false }) {
  const { t } = useTranslation('student');
  const { t: tc } = useTranslation('common');

  const segment = 'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-inter text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50';
  const on = 'bg-white text-slate-900 shadow-sm';
  const off = 'text-slate-500 hover:text-slate-800';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3" data-catalogue-view-toolbar>
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label={t('courses.view.group')} className="inline-flex rounded-lg bg-slate-100 p-0.5">
          {['units', 'chapters', 'all'].map((g) => {
            const Icon = GROUP_ICONS[g];
            const label = t(`courses.view.groups.${g}`);
            return (
              <button key={g} type="button" disabled={searching} aria-pressed={view.group === g}
                onClick={() => onChange({ group: g })} title={label}
                className={`${segment} ${view.group === g ? on : off}`} data-catalogue-group={g}>
                <Icon size={14} aria-hidden="true" />
                <span className={g === view.group ? '' : 'hidden sm:inline'}>{label}</span>
              </button>
            );
          })}
        </div>
        <div role="group" aria-label={t('courses.view.layout')} className="inline-flex rounded-lg bg-slate-100 p-0.5">
          {['grid', 'rows'].map((l) => {
            const Icon = LAYOUT_ICONS[l];
            const label = t(`courses.view.layouts.${l}`);
            return (
              <button key={l} type="button" aria-pressed={view.layout === l} aria-label={label} title={label}
                onClick={() => onChange({ layout: l })}
                className={`${segment} ${view.layout === l ? on : off}`} data-catalogue-layout={l}>
                <Icon size={15} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>
      <p className="font-inter text-xs font-semibold text-slate-500" aria-live="polite" data-catalogue-count>
        {tc('lessonsCount', { count })}
      </p>
    </div>
  );
}
