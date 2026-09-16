import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { LoadingState, ErrorState, EmptyState } from './states';
import SelectionCheckbox from './SelectionCheckbox';

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
 *
 * La sélection multiple est OPTIONNELLE : sans la prop `selection`, ce tableau
 * rend exactement ce qu'il rendait avant, sans colonne en plus. Les listes qui
 * n'ont pas d'action groupée (élèves, signalements, abonnements) n'ont donc
 * rien à changer, et ne gagnent pas une case à cocher qui ne mènerait nulle
 * part.
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
  selection,
  selectionLabel = (row) => `Sélectionner ${row.title ?? row.id}`,
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
            {selection && (
              // `w-10` + `px-3` : la colonne ne prend que la case, sinon elle
              // vole la largeur de la colonne du titre.
              <th scope="col" className="w-10 px-3 py-2.5">
                <SelectionCheckbox
                  checked={selection.allSelected}
                  indeterminate={selection.someSelected}
                  onChange={selection.toggleAll}
                  label={
                    selection.allSelected
                      ? 'Tout désélectionner sur cette page'
                      : `Tout sélectionner sur cette page (${selection.visibleCount})`
                  }
                />
              </th>
            )}
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
          {rows.map((row) => {
            const selected = selection ? selection.isSelected(row.id) : false;

            return (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              // La ligne cochée se voit : sans fond, 25 cases perdues au
              // milieu de 50 lignes ne se relisent pas.
              className={`border-b border-slate-100 last:border-0 ${
                selected ? 'bg-blue-50/60' : ''
              } ${onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''}`}
            >
              {selection && (
                <td className="w-10 px-3 py-2.5 align-middle">
                  <SelectionCheckbox
                    checked={selected}
                    onChange={() => selection.toggle(row.id)}
                    label={selectionLabel(row)}
                  />
                </td>
              )}
              {columns.map((column) => (
                <td key={column.key} className={`px-3 py-2.5 font-inter text-xs text-slate-700 align-middle ${column.cellClassName ?? ''}`}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
