import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchNotes } from '../../../../services/practiceService';

const DEBOUNCE_MS = 300;
const PER_PAGE = 20;

/**
 * La requête de « Mon cahier » : une vue, une recherche, des filtres, un
 * tri — et des pages qu'on empile (« تحميل المزيد »).
 *
 * Le serveur fait le travail (recherche sur le texte nu, filtres par
 * relations, tri, pagination) ; ici on ne fait que : différer la frappe
 * (300 ms), ignorer une réponse arrivée après une requête plus récente,
 * et tenir la liste à jour après une action (modifier, archiver,
 * supprimer) SANS recharger — l'ordre à l'écran ne bouge pas sous les
 * doigts de l'élève.
 *
 * `counts` et `facets` arrivent avec chaque page : pas d'appel séparé.
 */
export function useNotesSearch(token, { view, q, sort, filters }) {
  const [notes, setNotes] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, hasMore: false });
  const [counts, setCounts] = useState(null);
  const [facets, setFacets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [debouncedQ, setDebouncedQ] = useState(q);
  const requestId = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), DEBOUNCE_MS);

    return () => clearTimeout(t);
  }, [q]);

  const params = useMemo(() => ({
    view, q: debouncedQ?.trim() || undefined, sort, perPage: PER_PAGE,
    lessonCode: filters?.lessonCode || undefined,
    learningPointCode: filters?.learningPointCode || undefined,
    chapterCode: filters?.chapterCode || undefined,
    gradeCode: filters?.gradeCode || undefined,
    origin: filters?.origin && filters.origin !== 'all' ? filters.origin : undefined,
    type: filters?.type && filters.type !== 'all' ? filters.type : undefined,
  }), [view, debouncedQ, sort, filters]);

  const load = useCallback(async (page, append) => {
    if (!token) return;
    const id = ++requestId.current;
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await fetchNotes(token, { ...params, page });
      if (id !== requestId.current) return; // une requête plus récente a gagné
      setNotes((prev) => (append ? [...prev, ...(data.notes ?? [])] : (data.notes ?? [])));
      setMeta({ total: data.meta?.total ?? 0, page: data.meta?.page ?? page, hasMore: !!data.meta?.hasMore });
      if (data.counts) setCounts(data.counts);
      if (data.facets?.lessons) setFacets(data.facets.lessons);
    } catch (e) {
      if (id !== requestId.current) return;
      setError(e.message);
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [token, params]);

  useEffect(() => { load(1, false); }, [load]);

  const loadMore = useCallback(() => {
    if (meta.hasMore && !loadingMore) load(meta.page + 1, true);
  }, [load, meta, loadingMore]);

  const refresh = useCallback(() => load(1, false), [load]);

  /** Remplace une note dans la liste (après modification) — ou la retire si elle ne relève plus de la vue. */
  const patchLocal = useCallback((updated, { stillInView = true } = {}) => {
    setNotes((prev) => (stillInView
      ? prev.map((n) => (n.id === updated.id ? updated : n))
      : prev.filter((n) => n.id !== updated.id)));
    if (!stillInView) setMeta((m) => ({ ...m, total: Math.max(0, m.total - 1) }));
  }, []);

  const removeLocal = useCallback((ids) => {
    const set = new Set(ids);
    setNotes((prev) => prev.filter((n) => !set.has(n.id)));
    setMeta((m) => ({ ...m, total: Math.max(0, m.total - set.size) }));
  }, []);

  return {
    notes, meta, counts, facets, loading, loadingMore, error, loadMore, refresh, patchLocal, removeLocal, setCounts,
  };
}
