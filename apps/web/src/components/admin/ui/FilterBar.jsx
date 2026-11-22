import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { ChevronBack, ChevronForward } from '../../common/DirectionalIcons';

/**
 * Champ de recherche + listes déroulantes de filtres, sur une seule ligne qui
 * se replie.
 *
 * Les défauts sont ARABES (catalogue `admin`) : c'est le dernier endroit d'où
 * une chaîne française pouvait encore atteindre l'écran. Un appelant garde la
 * main sur chacun.
 */
export function FilterBar({ children }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

export function SearchInput({ value, onChange, placeholder, label }) {
  const { t } = useTranslation('common');

  return (
    <div className="relative min-w-[200px] flex-1">
      {/* La loupe est une icône SÉMANTIQUE : elle ne se met pas en miroir.
          C'est sa POSITION qui suit la direction — `start-3`, donc à droite
          en RTL, avec le rembourrage `ps-9` qui lui fait la place. */}
      <Search size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        aria-label={label ?? t('ui.searchLabel')}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? t('ui.search')}
        className="w-full rounded-xl border border-slate-300 bg-white py-2 ps-9 pe-3 font-inter text-xs text-slate-800 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
      />
    </div>
  );
}

export function SelectFilter({ value, onChange, options, label, allLabel }) {
  const { t } = useTranslation('common');

  return (
    <label className="flex items-center gap-1.5">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || undefined)}
        className="rounded-xl border border-slate-300 bg-white px-2.5 py-2 font-inter text-xs text-slate-700 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
      >
        <option value="">{allLabel ?? t('ui.all')}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

/**
 * Pagination simple : la position, et deux flèches.
 *
 * Les CHEVRONS sont directionnels — « précédent » et « suivant » sont des
 * directions de LECTURE, donc ils se retournent en RTL (DirectionalIcons).
 * La position « 3 / 10 » reste LTR : un ratio ne se lit pas à l'envers.
 */
export function Pagination({ meta, onPage, labels = {} }) {
  const { t } = useTranslation('common');

  if (!meta || meta.last_page <= 1) return null;

  const { current_page: page, last_page: last, total, from, to } = meta;
  const text = {
    range: (f, to_, n) => t('ui.rangeOf', { from: f, to: to_, total: n }),
    previous: t('ui.previous'),
    next: t('ui.next'),
    ...labels,
  };

  return (
    <div className="flex items-center justify-between gap-3 pt-3">
      <p className="font-inter text-xs text-slate-500">
        {text.range(from, to, total)}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 font-inter text-xs font-semibold text-slate-700 disabled:opacity-40 enabled:hover:bg-slate-50"
        >
          <ChevronBack size={13} aria-hidden="true" />
          {text.previous}
        </button>
        <span dir="ltr" className="px-2 font-inter text-xs text-slate-500">{page}{'\u00A0/\u00A0'}{last}</span>
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= last}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 font-inter text-xs font-semibold text-slate-700 disabled:opacity-40 enabled:hover:bg-slate-50"
        >
          {text.next}
          <ChevronForward size={13} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
