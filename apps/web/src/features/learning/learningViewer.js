import { useContext, useMemo } from 'react';
import { AuthContext } from '../../context/AuthContext';

/**
 * QUI regarde la leçon — et ce que cela change. Un seul endroit.
 *
 *     student   suit la progression pédagogique (verrou séquentiel), et son
 *               trajet s'enregistre (progression, preuves, test final) ;
 *     visitor   même règles, en local seulement (comportement historique) ;
 *     teacher   même leçon, même moteur, tous les modules OUVERTS, et RIEN
 *               ne s'écrit : un enseignant prépare, il n'apprend pas ;
 *     admin     lit comme l'enseignant (relecture de contenu).
 *
 * Le moteur de leçon ne teste jamais un rôle : il lit `freeNavigation`
 * (le verrou) et `tracksProgress` (l'écriture), et les espaces lisent
 * `workspaceBase` pour construire leurs liens (cahier, مختبر). Le serveur
 * reste l'autorité : les écritures de progression sont refusées aux
 * non-élèves par le middleware `learner`, quoi que le client envoie.
 */
export const WORKSPACE_BASE = Object.freeze({ student: '/espace', teacher: '/enseignant' });

const ROLES = new Set(['student', 'teacher', 'admin']);

/** @param {{role?: string}|null|undefined} user */
export function describeLearningViewer(user) {
  const role = ROLES.has(user?.role) ? user.role : 'visitor';

  return Object.freeze({
    role,
    isTeacher: role === 'teacher',
    // Le verrou séquentiel est un guide de progression de l'ÉLÈVE.
    freeNavigation: role === 'teacher' || role === 'admin',
    // Le trajet d'apprentissage est celui de l'élève (le visiteur garde son
    // brouillon local, comme avant). Aucune écriture pour un enseignant.
    tracksProgress: role === 'student' || role === 'visitor',
    // La racine des liens de l'espace de travail : cahier, مختبر, cours.
    workspaceBase: WORKSPACE_BASE[role] ?? null,
    // Les deux espaces de travail rendent la même coquille (barre latérale,
    // en-tête mobile) ; le visiteur et l'administrateur, la coquille visiteur.
    usesWorkspaceShell: role === 'student' || role === 'teacher',
  });
}

export function useLearningViewer() {
  const { user } = useContext(AuthContext);
  const role = user?.role;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => describeLearningViewer(user), [role]);
}

/** La racine de l'espace courant, `/espace` par défaut (liens hors compte). */
export function useWorkspaceBase(fallback = WORKSPACE_BASE.student) {
  return useLearningViewer().workspaceBase ?? fallback;
}
