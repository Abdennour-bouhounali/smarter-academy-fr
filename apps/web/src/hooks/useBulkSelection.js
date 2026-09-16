import { useCallback, useEffect, useMemo, useState } from 'react';
import { pruneToVisible, toggleAllVisible, toggleId } from './bulkSelectionCore';

/**
 * La sélection multiple d'une liste d'administration.
 *
 * Écrite une fois, ici, parce que les trois listes de contenu (leçons,
 * modules, exercices) en ont besoin à l'identique, et qu'une sélection
 * recopiée trois fois finit par diverger précisément là où elle est
 * dangereuse : sur ce qu'elle retient.
 *
 * LA règle de ce fichier : on ne peut pas sélectionner ce qu'on ne voit pas.
 *
 * La sélection est donc INTERSECTÉE avec les lignes affichées à chaque fois
 * que celles-ci changent — changement de page, de filtre, de recherche, de
 * tri, ou simple rechargement. Sans ça, filtrer « Brouillon » puis passer à
 * « Publié » laisserait 12 identifiants cochés invisibles à l'écran, et
 * l'action suivante toucherait des contenus que l'administrateur ne regarde
 * plus. Ce serait la façon la plus simple de publier quelque chose par
 * accident.
 *
 * Conséquence assumée : la sélection ne traverse pas les pages. « Tout
 * sélectionner » veut dire « tout ce qui est affiché », et le libellé le dit.
 *
 * La logique elle-même vit dans bulkSelectionCore.js, sans React : c'est la
 * partie qui peut faire du mal, donc celle qui doit être testable sans monter
 * un navigateur.
 *
 * @param {Array<{id: number}>} rows  les lignes actuellement affichées
 */
export function useBulkSelection(rows) {
  const [selected, setSelected] = useState(() => new Set());

  // Les identifiants visibles, en Set pour que l'intersection et les tests
  // d'appartenance ne soient pas quadratiques sur 100 lignes.
  const visibleIds = useMemo(
    () => (rows ?? []).map((row) => row.id),
    [rows],
  );
  // Une clé stable : c'est le CONTENU de la page qui doit déclencher l'élagage,
  // pas l'identité du tableau — `useAdminResource` recrée un tableau à chaque
  // rechargement, même quand les lignes sont les mêmes.
  const visibleKey = visibleIds.join(',');

  useEffect(() => {
    setSelected((current) => pruneToVisible(current, visibleIds));
    // visibleKey résume visibleIds ; le comparer en chaîne évite de réagir à
    // une nouvelle référence de tableau identique ligne pour ligne.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleKey]);

  const toggle = useCallback((id) => {
    setSelected((current) => toggleId(current, id));
  }, []);

  /** Tout cocher / tout décocher — sur ce qui est AFFICHÉ, rien d'autre. */
  const toggleAll = useCallback(() => {
    setSelected((current) => toggleAllVisible(current, visibleIds));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleKey]);

  const clear = useCallback(() => setSelected(new Set()), []);

  const selectedIds = useMemo(
    // Dans l'ordre d'AFFICHAGE, pas dans l'ordre des clics : un rapport
    // « 3 échecs » se relit plus facilement dans l'ordre du tableau.
    () => visibleIds.filter((id) => selected.has(id)),
    [visibleIds, selected],
  );

  const count = selectedIds.length;
  const allSelected = visibleIds.length > 0 && count === visibleIds.length;

  return {
    /** Les lignes cochées, dans l'ordre du tableau. */
    selectedIds,
    count,
    isSelected: useCallback((id) => selected.has(id), [selected]),
    toggle,
    toggleAll,
    clear,
    allSelected,
    /** Ni vide ni complet : l'état qui rend la case maîtresse « indéterminée ». */
    someSelected: count > 0 && !allSelected,
    visibleCount: visibleIds.length,
    /** Les objets-lignes cochés, pour décider quelles actions ont un sens. */
    selectedRows: useMemo(
      () => (rows ?? []).filter((row) => selected.has(row.id)),
      [rows, selected],
    ),
  };
}
