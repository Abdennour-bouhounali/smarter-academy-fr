import { createContext, useState, useEffect } from 'react';
import { fetchCurrentUser, logout as logoutRequest, updateGrade as updateGradeRequest, updateProfile as updateProfileRequest } from '../services/authService';
import { storage, migrateLegacyStorageToUser } from '../utils/storage';
import { setCurrentUserId } from '../utils/authUserId';
import { flushStudyTimeNow } from '../services/studyTimeService';
import { LEGACY_PER_STUDENT_KEYS, isLegacyLessonKey } from '../lessons/common/studentStorageKeys';
import { readCachedSessionUser, writeCachedSessionUser, clearCachedSessionUser } from './sessionUserCache';

// Le compte gardé pour le jeton en stockage (sessionUserCache.js), lu UNE fois au
// démarrage : l'identifiant courant doit être posé AVANT le premier rendu, car
// le stockage par élève (scopedStorage) en dépend.
function initialSession() {
  const token = storage.getItem('token') || null;
  const user = readCachedSessionUser(token);
  if (user?.id != null) setCurrentUserId(user.id);
  return { token, user };
}

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [initial] = useState(initialSession);
  const [user, setUser] = useState(initial.user);
  const [token, setToken] = useState(initial.token);
  // Un compte déjà connu : rien à attendre, `/me` le revalide en arrière-plan.
  const [loading, setLoading] = useState(!initial.user);

  const applyUser = (userData, tokenForCache = token) => {
    setUser(userData);
    writeCachedSessionUser(tokenForCache, userData);
    setCurrentUserId(userData?.id ?? null);
    if (userData?.id != null) {
      // One-time: fold any pre-scoping / anonymous local progress into this
      // account the first time it's seen on this browser. A no-op on every
      // subsequent login once the legacy keys are gone.
      migrateLegacyStorageToUser(LEGACY_PER_STUDENT_KEYS, isLegacyLessonKey);
    }
  };

  const login = (userData, jwtToken) => {
    applyUser(userData, jwtToken);
    setToken(jwtToken);
    storage.setItem('token', jwtToken);
  };

  const clearSession = () => {
    setUser(null);
    setCurrentUserId(null);
    setToken(null);
    storage.removeItem('token');
    clearCachedSessionUser();
  };

  const logout = async () => {
    const currentToken = token;
    // The last study-time beat must leave while the token is still valid
    // (docs/architecture/PARENT_SPACE.md §3) — bounded, never throws.
    await flushStudyTimeNow();
    // Clear local state immediately so the UI reflects logout without
    // waiting on the network; the revocation call happens best-effort after.
    clearSession();

    if (currentToken) {
      try {
        await logoutRequest(currentToken);
      } catch (error) {
        console.error('Error revoking session:', error);
      }
    }
  };

  const updateGrade = async (grade) => {
    const updatedUser = await updateGradeRequest(token, grade);
    setUser(updatedUser);
    writeCachedSessionUser(token, updatedUser);
    setCurrentUserId(updatedUser?.id ?? null);
    return updatedUser;
  };

  // « prénom et nom » — same shape as updateGrade: the server answers with
  // the whole user, which replaces ours.
  const updateProfile = async (names) => {
    const updatedUser = await updateProfileRequest(token, names);
    setUser(updatedUser);
    writeCachedSessionUser(token, updatedUser);
    return updatedUser;
  };

  const fetchUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const currentUser = await fetchCurrentUser(token);
      applyUser(currentUser);
    } catch (error) {
      console.error('Error fetching user:', error);
      // Avec un compte déjà connu, seul un refus du SERVEUR ferme la session :
      // une coupure réseau ou une erreur 5xx ne déconnecte plus l'élève.
      const refused = error?.type === 'AUTHENTICATION_ERROR' || error?.type === 'AUTHORIZATION_ERROR';
      if (!initial.user || refused) clearSession();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Relit le compte depuis le serveur.
   *
   * Nécessaire dès qu'un état du compte change AILLEURS que dans cet onglet —
   * le cas concret étant la vérification d'adresse : l'élève clique le lien
   * reçu par courriel, le serveur enregistre la preuve, et cet onglet-ci
   * l'ignore encore. On redemande au serveur plutôt que de supposer localement
   * que c'est fait.
   *
   * N'efface PAS la session en cas d'échec, contrairement au chargement
   * initial : un réseau capricieux ne doit pas déconnecter quelqu'un qui
   * était correctement authentifié.
   */
  const refreshUser = async () => {
    if (!token) return null;

    try {
      const currentUser = await fetchCurrentUser(token);
      applyUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error('Error refreshing user:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, updateGrade, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
