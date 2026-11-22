/**
 * Le cahier lu par l'enseignant arrive PAGINÉ (meta
 * `{ total, page, perPage, hasMore }`, TeacherClassroomNotebookController).
 * Le kit (`Pagination`, components/admin/ui/FilterBar.jsx) lit la forme
 * Laravel `{ current_page, last_page, total, from, to }` : ce module
 * traduit l'une dans l'autre, sans rien inventer.
 *
 * Sans `total`, `hasMore` suffit à savoir s'il existe une page suivante.
 *
 * @param {{total?: number, page?: number, perPage?: number, hasMore?: boolean}|null} meta
 * @param {number} count  le nombre de notes rendues sur cette page
 * @returns {{current_page: number, last_page: number, total: number, from: number, to: number}|null}
 */
export function notebookPagerMeta(meta, count) {
  if (!meta) return null;
  const page = Math.max(1, Number(meta.page) || 1);
  const perPage = Math.max(1, Number(meta.perPage) || count || 1);
  const hasTotal = Number.isFinite(Number(meta.total)) && meta.total !== null;
  const total = hasTotal ? Number(meta.total) : (page - 1) * perPage + count + (meta.hasMore ? 1 : 0);
  const last = hasTotal
    ? Math.max(1, Math.ceil(total / perPage))
    : (meta.hasMore ? page + 1 : page);
  const from = count > 0 ? (page - 1) * perPage + 1 : 0;
  const to = count > 0 ? from + count - 1 : 0;

  return { current_page: page, last_page: Math.max(last, page), total, from, to };
}
