import { useTranslation } from 'react-i18next';
import { BarChart3, CalendarDays } from 'lucide-react';

const TABS = [
  { id: 'week', icon: CalendarDays },
  { id: 'progress', icon: BarChart3 },
];

/** L'onglet courant, lu dans `?tab=` : un lien partagé (courriel) peut ouvrir le détail. */
export function tabFrom(searchParams) {
  return searchParams.get('tab') === 'progress' ? 'progress' : 'week';
}

/**
 * « La semaine » / « La progression en détail » — deux boutons pleine largeur au
 * téléphone, compacts au portable (PARENT_SPACE.md §4bis).
 */
export default function ReportTabs({ tab, onChange }) {
  const { t } = useTranslation('family');
  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 sm:inline-grid" role="tablist" aria-label={t('tabs.label')}>
      {TABS.map(({ id, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={tab === id}
          onClick={() => onChange(id)}
          className={`flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 font-inter text-sm font-semibold transition ${
            tab === id ? 'bg-white text-nav-accent shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Icon size={16} aria-hidden="true" />
          <span className="whitespace-nowrap sm:hidden">{t(`tabs.${id}Short`)}</span>
          <span className="hidden whitespace-nowrap sm:inline">{t(`tabs.${id}`)}</span>
        </button>
      ))}
    </div>
  );
}
