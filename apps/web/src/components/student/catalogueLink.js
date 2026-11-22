import { useCallback, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

/**
 * Où mène un lien « vers le catalogue » du fil d'Ariane (page d'unité,
 * sommaire de leçon, module) — décision du propriétaire, 2026-10-07 :
 *
 *   élève            → « دروسي » (/espace/cours), son espace, le ميدان
 *                      présélectionné par `?chapter=` ;
 *   tout autre       → le catalogue public /courses?level=&grade=&chapter=
 *                      (/espace n'admet que les élèves : un visiteur, un
 *                      enseignant ou un administrateur y serait renvoyé).
 *
 * Seuls les identifiants RÉELLEMENT fournis entrent dans l'URL : interpoler
 * un `null` donnait `?level=null`, que le catalogue ne sait pas lire.
 */
export function catalogueHref(role, { level, grade, chapter } = {}) {
  if (role === 'student') {
    return chapter ? `/espace/cours?chapter=${encodeURIComponent(chapter)}` : '/espace/cours';
  }
  const params = new URLSearchParams();
  if (level) params.set('level', level);
  if (grade) params.set('grade', grade);
  if (chapter) params.set('chapter', chapter);
  const qs = params.toString();
  return qs ? `/courses?${qs}` : '/courses';
}

export function useCatalogueHref() {
  const { user } = useContext(AuthContext);
  const role = user?.role;
  return useCallback((ids) => catalogueHref(role, ids), [role]);
}
