import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { LoadingState, ErrorState, EmptyState } from './states';

/**
 * Le tableau de l'administration.
 *
 * Il n'existait aucun composant de tableau dans le projet (les listes élèves
 * utilisent `divide-y`) : celui-ci est écrit une fois, ici, plutôt que
 * recopié dans huit écrans.
 *
 * Deux choix qui comptent :
 *
 *  — il porte lui-même ses états de chargement / erreur / vide, parce qu'un
 *    tableau qui ne les rend pas laisse la page échouer en silence ;
 *  — la densité est explicite (`text-sm` vaut 17 px dans ce projet — l'échelle
 *    Tailwind est majorée de 25 %), donc les cellules descendent en `text-xs`
 *    = 15 px, qui est la vraie taille « dense » ici.
 */
export default function DataTable({
  columns,
  rows,
  rowKey = (row) => row.id,
  loading = false,
  error = null,
  onRetry,
  empty,
  sort,
  onSortChange,
  onRowClick,
}) {
  if (loading) return <LoadingState rows={6} />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!rows?.length) {
    return empty ?? <EmptyState title="Aucun résultat" hint="Aucune ligne ne correspond à ces filtres." />;
  }

  const toggle = (key) => {
    if (!onSortChange) return;
    const direction = sort?.key === key && sort?.direction === 'asc' ? 'desc' : 'asc';
    onSortChange({ key, direction });
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      {/* min-w généreux : un tableau d'administration porte 8 à 10 colonnes,
          et la dernière — souvent l'action — ne doit jamais être celle qu'on
          ne voit pas. Le conteneur défile horizontalement au besoin. */}
      <table className="w-full min-w-[900px] border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((column) => {
              const sortable = Boolean(column.sortKey && onSortChange);
              // `column.sortKey` doit être comparé SEULEMENT s'il existe :
              // sans le test, une colonne non triable dans un tableau sans
              // tri donne `undefined === undefined`, donc « active », et la
              // ligne qui lit `sort.direction` plus bas explose.
              const active = Boolean(column.sortKey) && sort?.key === column.sortKey;

              return (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-3 py-2.5 text-left font-inter text-xs font-semibold uppercase tracking-wide text-slate-500 ${column.className ?? ''}`}
                  aria-sort={active ? (sort?.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => toggle(column.sortKey)}
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                      {column.label}
                      {active && (sort?.direction === 'asc'
                        ? <ChevronUp size={13} />
                        : <ChevronDown size={13} />)}
                    </button>
                  ) : column.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-slate-100 last:border-0 ${
                onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''
              }`}
            >
              {columns.map((column) => (
                <td key={column.key} className={`px-3 py-2.5 font-inter text-xs text-slate-700 align-middle ${column.cellClassName ?? ''}`}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
