import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
 * POLITIQUE D'OUVERTURE :
 * tant que la réponse n'est pas arrivée — ou si elle échoue — RIEN n'est
 * fermé. Le serveur reste l'autorité et refusera de toute façon toute
 * écriture ; verrouiller l'interface sur une requête en vol enfermerait
 * l'élève hors de son propre parcours pour une raison purement technique.
 */
export const ContentAvailabilityContext = createContext({
  isLessonClosed: () => false,
  isModuleClosed: () => false,
  isLessonLocked: () => false,
  isLessonPremium: () => false,
  isLessonHiddenByClass: () => false,
  hiddenByClassCount: 0,
  lessonStatus: () => 'published',
  moduleStatus: () => 'published',
  access: null,
  loaded: false,
  refresh: async () => {},
});

const EMPTY_CLOSED = { lessons: [], modules: {}, locked: [], premium: [], hiddenByClass: [], statuses: null };

/**
 * L'ÉTAT DE PUBLICATION, servi au seul RELECTEUR (administrateur, ou
 * enseignant ambassadeur — « سفير »). Pour lui le serveur ne ferme rien et
 * rend à la place `statuses` : l'état de chaque contenu non publié. Absent
 * de la carte = publié. Pour tout autre compte, `statuses` est absent.
 */
function readClosed(result) {
  return {
    lessons: result.lessons ?? [],
    modules: result.modules ?? {},
    locked: result.locked ?? [],
    premium: result.premium ?? [],
    hiddenByClass: result.hiddenByClass ?? [],
    statuses: result.statuses ?? null,
  };
}

/**
 * Délai minimal entre deux relectures déclenchées par le RETOUR sur l'onglet.
 * Le palier est décidé par l'administrateur en base : une décision prise
 * pendant que l'élève a la page ouverte doit l'atteindre sans rechargement
 * complet, mais sans transformer chaque changement d'onglet en requête.
 */
const AVAILABILITY_REFRESH_MIN_MS = 30_000;

export function ContentAvailabilityProvider({ children }) {
  const { token } = useContext(AuthContext);
  const [closed, setClosed] = useState(EMPTY_CLOSED);
  const lastFetchedAt = useRef(0);
  // Chaque lecture reçoit un numéro ; seule la PLUS RÉCENTE s'applique. Sans
  // lui, la lecture lancée à la connexion (avant qu'un lien de classe ne fasse
  // rejoindre) pouvait arriver APRÈS le `refresh()` qui suit l'adhésion et
  // réafficher l'accès d'avant — « وصول كامل » n'apparaissait qu'au rechargement.
  const sequence = useRef(0);
  const [access, setAccess] = useState(null);
  const [loaded, setLoaded] = useState(false);

  /**
   * Redemande au serveur ce qui est fermé.
   *
   * Existe pour UN geste : la saisie d'un code d'activation. Elle change les
   * droits de l'élève au milieu de sa session, et sans cette relecture,
   * chaque carte de leçon continuerait d'afficher son cadenas jusqu'au
   * prochain rechargement complet — l'élève venant de payer croirait que
   * son code n'a rien fait.
   *
   * Rend la réponse plutôt que de la garder pour elle : l'appelant
   * (la page d'activation) veut afficher l'état d'accès tout de suite.
   */
  const load = useCallback(async () => {
    lastFetchedAt.current = Date.now();
    const ticket = ++sequence.current;
    const result = await fetchClosedContent(token);
    if (ticket !== sequence.current) return result;

    setClosed(readClosed(result));
    setAccess(result.access ?? null);
    setLoaded(true);

    return result;
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    // Visiteur anonyme compris : le palier n'est connu QUE du serveur (le
    // bundle n'en porte aucun), donc un visiteur charge l'inventaire public.
    // Changer de compte (connexion, déconnexion) relance la lecture : aucun
    // état d'un utilisateur ne survit à l'autre.
    setClosed(EMPTY_CLOSED);
    setAccess(null);
    setLoaded(false);
    lastFetchedAt.current = Date.now();
    const ticket = ++sequence.current;

    fetchClosedContent(token)
      .then((result) => {
        if (cancelled || ticket !== sequence.current) return;
        setClosed(readClosed(result));
        setAccess(result.access ?? null);
        setLoaded(true);
      })
      .catch(() => {
        // Échec silencieux ET ouvert : voir la politique ci-dessus.
        if (!cancelled && ticket === sequence.current) setLoaded(false);
      });

    return () => { cancelled = true; };
  }, [token]);

  // ── Pas d'état périmé après une décision d'administration ────────────
  // Un administrateur qui passe une leçon de premium à gratuit (ou
  // l'inverse) change `lessons.tier` en base ; rien ne le pousse vers les
  // navigateurs ouverts. Relire quand l'élève REVIENT sur l'onglet suffit à
  // aligner l'affichage sans rechargement — le serveur, lui, applique la
  // nouvelle décision dès la requête suivante (ContentAccess, sans cache).
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastFetchedAt.current < AVAILABILITY_REFRESH_MIN_MS) return;
      load().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  const value = useMemo(() => {
    const lessonSet = new Set(closed.lessons);
    const lockedSet = new Set(closed.locked ?? []);
    const premiumSet = new Set(closed.premium ?? []);
    const hiddenByClassSet = new Set(closed.hiddenByClass ?? []);

    return {
      loaded,
      access,
      refresh: load,
      isLessonClosed: (lessonCode) => lessonSet.has(lessonCode),
      /**
       * Le TROISIÈME axe : masquée par l'enseignant de l'élève, pour sa
       * classe. Publiée et dans son droit, mais pas maintenant — c'est un
       * choix pédagogique, pas un verrou commercial ni une fermeture
       * éditoriale, et la carte le dit avec ses propres mots.
       */
      isLessonHiddenByClass: (lessonCode) => hiddenByClassSet.has(lessonCode),
      hiddenByClassCount: hiddenByClassSet.size,
      /**
       * Publiée, mais hors du droit d'accès de cet élève.
       *
       * Distinct de `isLessonClosed` parce que les deux appellent des
       * interfaces différentes : une leçon fermée n'existe pas pour l'élève,
       * une leçon verrouillée existe et lui dit ce qui lui manque. Les
       * confondre afficherait « indisponible » là où il fallait expliquer
       * qu'un accès premium est requis.
       */
      isLessonLocked: (lessonCode) => lockedSet.has(lessonCode),
      /**
       * Le contenu est-il PAYANT ? Question distincte de « l'élève y a-t-il
       * accès » : un abonné doit continuer de voir le badge sur ce qu'il a
       * payé, sinon le contenu vendu se déguise en gratuit et sa disparition
       * à l'échéance devient incompréhensible.
       *
       * Sert aussi de source à jour du palier : le catalogue embarqué peut
       * être en retard sur la base jusqu'au prochain déploiement.
       */
      isLessonPremium: (lessonCode) => premiumSet.has(lessonCode),
      /**
       * L'état de publication d'une leçon, pour le relecteur seulement :
       * 'published' | 'draft' | 'hidden' | 'archived'. Toujours
       * 'published' pour un autre compte — il ne voit pas le non-publié.
       */
      lessonStatus: (lessonCode) => closed.statuses?.lessons?.[lessonCode] ?? 'published',
      moduleStatus: (lessonCode, moduleNumber) => (
        closed.statuses?.modules?.[lessonCode]?.[Number(moduleNumber)] ?? 'published'
      ),
      isModuleClosed: (lessonCode, moduleNumber) => {
        const numbers = closed.modules?.[lessonCode];
        if (!numbers) return false;
        return numbers.includes(Number(moduleNumber));
      },
    };
  }, [closed, access, loaded, load]);

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
