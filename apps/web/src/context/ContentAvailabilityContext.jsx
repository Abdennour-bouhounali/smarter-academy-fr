import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './AuthContext';
import { fetchClosedContent } from '../services/contentAvailabilityService';

/**
 * Ce que l'administration a retiré — partagé par toute l'application élève.
 *
 * Un seul appel au montage, puis une lecture synchrone partout : les cartes
 * de cours, le sommaire d'une leçon et la feuille de route d'un module
 * posent tous la même question, et trois requêtes pour la même réponse
 * seraient trois occasions de diverger.
 *
 * POLITIQUE D'OUVERTURE, comme les portes de maîtrise (lessonAccess.js) :
 * tant que la réponse n'est pas arrivée — ou si elle échoue — RIEN n'est
 * fermé. Le serveur reste l'autorité et refusera de toute façon toute
 * écriture ; verrouiller l'interface sur une requête en vol enfermerait
 * l'élève hors de son propre parcours pour une raison purement technique.
 */
export const ContentAvailabilityContext = createContext({
  isLessonClosed: () => false,
  isModuleClosed: () => false,
  loaded: false,
});

export function ContentAvailabilityProvider({ children }) {
  const { token } = useContext(AuthContext);
  const [closed, setClosed] = useState({ lessons: [], modules: {} });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!token) {
      // Visiteur anonyme : rien à masquer côté client. Le serveur refuse
      // déjà toute écriture, et le contenu non publié n'est de toute façon
      // pas atteignable en écriture sans compte.
      setClosed({ lessons: [], modules: {} });
      setLoaded(false);
      return () => { cancelled = true; };
    }

    fetchClosedContent(token)
      .then((result) => {
        if (cancelled) return;
        setClosed({ lessons: result.lessons ?? [], modules: result.modules ?? {} });
        setLoaded(true);
      })
      .catch(() => {
        // Échec silencieux ET ouvert : voir la politique ci-dessus.
        if (!cancelled) setLoaded(false);
      });

    return () => { cancelled = true; };
  }, [token]);

  const value = useMemo(() => {
    const lessonSet = new Set(closed.lessons);

    return {
      loaded,
      isLessonClosed: (lessonCode) => lessonSet.has(lessonCode),
      isModuleClosed: (lessonCode, moduleNumber) => {
        const numbers = closed.modules?.[lessonCode];
        if (!numbers) return false;
        return numbers.includes(Number(moduleNumber));
      },
    };
  }, [closed, loaded]);

  return (
    <ContentAvailabilityContext.Provider value={value}>
      {children}
    </ContentAvailabilityContext.Provider>
  );
}

/** Raccourci de lecture. */
export function useContentAvailability() {
  return useContext(ContentAvailabilityContext);
}
