import { useCallback, useEffect, useMemo, useRef } from 'react';

/**
 * Le brouillon LOCAL d'une note : ce que l'élève a écrit et pas encore
 * enregistré, gardé dans le navigateur.
 *
 * Ce n'est pas une sauvegarde automatique vers le serveur — enregistrer reste
 * un geste explicite — mais un filet : fermer la fenêtre par erreur, changer
 * de taille, perdre le réseau au moment d'enregistrer, aucun de ces accidents
 * n'efface le travail. Le brouillon suit la clé de la note (question ou note
 * existante) et disparaît dès qu'un enregistrement aboutit.
 *
 * localStorage est un CONFORT, pas une source de vérité : chaque accès est
 * protégé, et son absence (navigation privée, quota) laisse le carnet
 * fonctionner normalement — sans filet, mais sans erreur.
 */
const PREFIX = 'sa_nb_draft:';
const DEBOUNCE_MS = 300;

// La clé d'une NOUVELLE note est son ENDROIT complet : leçon, module, point,
// exercice, question. Deux endroits différents ne partagent jamais un
// brouillon — sinon ce qu'on écrit dans le module 1 réapparaîtrait sur la
// page d'accueil de la leçon.
export function draftKeyFor({ userId, noteId, lessonCode, moduleNumber, learningPointCode, exerciseId, questionId }) {
  const who = userId ?? 'anon';
  if (noteId != null) return `${PREFIX}${who}:note:${noteId}`;

  return `${PREFIX}${who}:${lessonCode ?? '-'}/${moduleNumber ?? '-'}/${learningPointCode ?? '-'}/${exerciseId ?? '-'}/${questionId ?? '-'}`;
}

export function readDraft(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    return typeof parsed?.html === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

function writeDraft(key, draft) {
  try {
    window.localStorage.setItem(key, JSON.stringify({ ...draft, at: Date.now() }));
  } catch {
    // Quota plein ou stockage interdit : le carnet continue sans filet.
  }
}

function clearDraft(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // idem
  }
}

/**
 * @param {string|null} key  la clé du brouillon ; null désactive tout
 * @returns {{ save: (draft: {html: string, mistakeType: string|null, noteId?: number|null}) => void, flush: () => void, clear: () => void }}
 *   `noteId` : quand le brouillon est celui d'une note DÉJÀ enregistrée
 *   (l'élève a continué d'écrire après un premier « Enregistrer »), le restaurer doit
 *   rouvrir CETTE note, pas en créer une seconde.
 */
export function useNoteDraft(key) {
  const pending = useRef(null);
  const timer = useRef(null);

  const flush = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (key && pending.current) writeDraft(key, pending.current);
    pending.current = null;
  }, [key]);

  // Différé : une frappe = une mise en attente, pas une écriture. Trois
  // cents millisecondes de calme, et le brouillon part.
  const save = useCallback((draft) => {
    if (!key) return;
    pending.current = draft;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, DEBOUNCE_MS);
  }, [key, flush]);

  const clear = useCallback(() => {
    pending.current = null;
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (key) clearDraft(key);
  }, [key]);

  // Démontage (fermeture, changement de page) : ce qui attendait est écrit.
  useEffect(() => flush, [flush]);

  return useMemo(() => ({ save, flush, clear }), [save, flush, clear]);
}
