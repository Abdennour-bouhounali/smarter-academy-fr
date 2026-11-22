import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AuthContext } from './AuthContext';
import { fetchStudyContext } from '../services/studyContextService';

/**
 * « Comment cet élève étudie-t-il ? » — indépendant, ou dans la classe d'un
 * enseignant. Un seul appel au montage, une lecture partout (accueil,
 * page « Ma classe »), et un `refresh()` pour les deux gestes qui le changent :
 * rejoindre et quitter.
 *
 * POLITIQUE D'OUVERTURE, comme ContentAvailabilityContext : tant que la
 * réponse n'est pas là, l'élève est traité comme indépendant. Ce contexte
 * n'autorise rien — la visibilité réglée par l'enseignant vient de
 * GET /content/availability (`hiddenByClass`), et le serveur refuse de
 * toute façon.
 */
const EMPTY = { mode: 'independent', classrooms: [], primary: null, hiddenLessonCodes: [] };

export const StudyContextContext = createContext({
  studyContext: EMPTY,
  loaded: false,
  refresh: async () => EMPTY,
});

export function StudyContextProvider({ children }) {
  const { token, user } = useContext(AuthContext);
  const [studyContext, setStudyContext] = useState(EMPTY);
  const [loaded, setLoaded] = useState(false);
  // Seule la lecture la plus récente s'applique (voir ContentAvailabilityContext :
  // la lecture de la connexion ne doit pas écraser celle qui suit l'adhésion).
  const sequence = useRef(0);

  const isStudent = user?.role === 'student';

  const refresh = useCallback(async () => {
    if (!token || !isStudent) return EMPTY;
    const ticket = ++sequence.current;
    const next = await fetchStudyContext(token);
    if (ticket !== sequence.current) return next;
    setStudyContext(next ?? EMPTY);
    setLoaded(true);
    return next;
  }, [token, isStudent]);

  useEffect(() => {
    let cancelled = false;
    if (!token || !isStudent) {
      setStudyContext(EMPTY);
      setLoaded(false);
      return () => { cancelled = true; };
    }
    const ticket = ++sequence.current;
    fetchStudyContext(token)
      .then((next) => { if (!cancelled && ticket === sequence.current) { setStudyContext(next ?? EMPTY); setLoaded(true); } })
      .catch(() => { if (!cancelled && ticket === sequence.current) setLoaded(false); });
    return () => { cancelled = true; };
  }, [token, isStudent]);

  const value = useMemo(() => ({ studyContext, loaded, refresh }), [studyContext, loaded, refresh]);

  return <StudyContextContext.Provider value={value}>{children}</StudyContextContext.Provider>;
}

export function useStudyContext() {
  return useContext(StudyContextContext);
}
