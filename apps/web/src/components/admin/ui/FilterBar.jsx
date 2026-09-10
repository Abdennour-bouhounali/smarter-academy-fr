import React from 'react';
import { Search } from 'lucide-react';

/** Champ de recherche + listes déroulantes de filtres, sur une seule ligne qui se replie. */
export function FilterBar({ children }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

export function SearchInput({ value, onChange, placeholder = 'Rechercher…', label = 'Rechercher' }) {
  return (
    <div className="relative min-w-[200px] flex-1">
      <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 font-inter text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}

export function SelectFilter({ value, onChange, options, label, allLabel = 'Tous' }) {
  return (
    <label className="flex items-center gap-1.5">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || undefined)}
        className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 font-inter text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

/** Pagination simple : la position, et deux flèches. */
export function Pagination({ meta, onPage }) {
  if (!meta || meta.last_page <= 1) return null;

  const { current_page: page, last_page: last, total, from, to } = meta;

  return (
    <div className="flex items-center justify-between gap-3 pt-3">
      <p className="font-inter text-xs text-slate-500">
        {from}–{to} sur {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-slate-300 px-3 py-1.5 font-inter text-xs font-semibold text-slate-700 disabled:opacity-40 enabled:hover:bg-slate-50"
        >
          Précédent
        </button>
        <span className="px-2 font-inter text-xs text-slate-500">{page} / {last}</span>
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= last}
          className="rounded-lg border border-slate-300 px-3 py-1.5 font-inter text-xs font-semibold text-slate-700 disabled:opacity-40 enabled:hover:bg-slate-50"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
