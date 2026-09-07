import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * WorkspaceLayoutContext — l'ÉTAT DE MISE EN PAGE GLOBAL de l'espace de travail.
 *
 * Une seule question y est répondue : « la carte des connaissances réclame-t-elle
 * sa propre colonne ? ». Les trois régions de l'application en dérivent leur
 * géométrie, et AUCUNE ne la recalcule pour son compte :
 *
 *   barre latérale (StudentNavbar)  → w-64 ↔ w-20        (elle se comprime)
 *   contenu (MainLayout/StudentLayout) → padding-right   (il rétrécit vraiment)
 *   carte (KnowledgeMap)            → la gouttière ainsi libérée
 *
 * ┌────┬────────────────────────────┬────────────┐
 * │ S  │        CONTENU             │  MA CARTE  │
 * └────┴────────────────────────────┴────────────┘
 *
 * POURQUOI ICI, ET PAS DANS LA CARTE — la carte est portalisée dans <body> et
 * `position: fixed` ; elle ne peut donc pas pousser quoi que ce soit toute
 * seule. C'est la coquille qui doit RÉSERVER la place, ce qui suppose un état
 * situé au-dessus des deux coquilles (CourseLayout choisit l'une ou l'autre
 * selon l'authentification). D'où ce contexte monté dans App, au-dessus du
 * routeur.
 *
 * POURQUOI LE CONTENU RÉTRÉCIT PAR `padding-right` ET NON PAR UNE GRILLE — le
 * <main> des deux coquilles réserve déjà la barre latérale par `lg:pl-64`, et
 * `useLessonViewport` (carte, bandeaux collants) MESURE la boîte de padding de
 * ce <main> pour connaître le rectangle réellement offert à la leçon. Réserver
 * la colonne de droite dans le même padding fait donc que toute la machinerie
 * de mesure existante voit la nouvelle géométrie sans qu'une seule ligne n'en
 * soit modifiée : la carte se place dans la gouttière qu'elle vient de créer.
 * Une grille aurait au contraire introduit un second système de mesure.
 *
 * TROIS ÉTATS, PAS DEUX BOOLÉENS :
 *
 *   'closed'  la carte est fermée                     — coquille normale
 *   'normal'  tiroir flottant / plein écran           — coquille normale
 *   'prior'   la carte est une VRAIE TROISIÈME COLONNE — coquille comprimée
 *
 * Seul 'prior' change la coquille. 'normal' recouvre les deux présentations
 * historiques (tiroir et plein écran), dont la géométrie est verrouillée par
 * les suites e2e `*-carte.mjs` et `km-layout.mjs` : elles ne bougent pas.
 */

/** Largeur de la barre latérale élève déployée (`w-64`), en pixels. */
export const SIDEBAR_WIDTH = 256;

/** Largeur de la barre latérale comprimée (`w-20`) — icônes seules. */
export const SIDEBAR_COLLAPSED_WIDTH = 80;

/**
 * Largeur de la colonne « Ma carte », par palier.
 *
 * Bornes issues de la contrainte réelle du panneau : en dessous de ~320px la
 * hiérarchie strate → catégorie → connaissance se casse en mots isolés ; au
 * delà de ~460px la leçon perd plus qu'elle ne gagne. Le palier large est le
 * seul endroit où la carte peut respirer sans coûter au contenu.
 */
export const MA_CARTE_WIDTH = { medium: 320, desktop: 380, wide: 440 };

/**
 * Le mode « colonne » suppose assez de place pour DEUX zones utiles côte à
 * côte. En dessous, la carte reste ce qu'elle a toujours été : une surface
 * flottante au-dessus de la leçon (tiroir plein écran sur mobile). 1024px est
 * le point de rupture `lg` de Tailwind, celui-là même où la barre latérale
 * élève apparaît — un seul seuil pour toute la coquille.
 */
export const PRIOR_MIN_WIDTH = 1024;

const STORAGE_KEY = 'knowledgeMapPrior';

const WorkspaceLayoutContext = createContext(null);

/** Largeur de la colonne carte pour une largeur de fenêtre donnée. */
export function maCarteWidthFor(viewportWidth) {
  if (viewportWidth >= 1600) return MA_CARTE_WIDTH.wide;
  if (viewportWidth >= 1280) return MA_CARTE_WIDTH.desktop;
  return MA_CARTE_WIDTH.medium;
}

/**
 * Le mode colonne est-il tenable à cette largeur ?
 * Exporté pour que les tests unitaires interrogent la règle, pas le rendu.
 */
export function priorFitsViewport(viewportWidth) {
  return viewportWidth >= PRIOR_MIN_WIDTH;
}

export function WorkspaceLayoutProvider({ children }) {
  // Préférence de l'élève : il a demandé le mode colonne une fois, on le lui
  // redonne à chaque leçon. C'est une préférence d'espace de travail, pas un
  // état de leçon — d'où le stockage global, comme knowledgeMapWidth.
  const [priorPreferred, setPriorPreferred] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'true'; }
    catch { return false; }
  });

  // La carte est-elle ouverte ? Publié par le provider de leçon (une carte
  // n'existe que dans une leçon), consommé par les coquilles.
  const [mapOpen, setMapOpen] = useState(false);

  const [viewportWidth, setViewportWidth] = useState(
    () => (typeof window === 'undefined' ? 1280 : window.innerWidth)
  );

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const setPrior = useCallback((next) => {
    setPriorPreferred(next);
    try { localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* noop */ }
  }, []);

  const value = useMemo(() => {
    const fits = priorFitsViewport(viewportWidth);
    // Le mode colonne n'est EFFECTIF que si la carte est ouverte ET que l'écran
    // peut l'accueillir. La préférence, elle, survit au passage sur un écran
    // étroit : revenir au large la restaure sans que l'élève la redemande.
    const prior = mapOpen && priorPreferred && fits;
    const maCarteWidth = maCarteWidthFor(viewportWidth);

    return {
      mode: prior ? 'prior' : mapOpen ? 'normal' : 'closed',
      isPrior: prior,
      priorPreferred,
      priorAvailable: fits,
      mapOpen,
      setMapOpen,
      setPrior,
      togglePrior: () => setPrior(!priorPreferred),
      maCarteWidth,
      // Gouttière que la coquille doit réserver à droite du contenu.
      contentGutter: prior ? maCarteWidth : 0,
      sidebarWidth: prior ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
      viewportWidth,
    };
  }, [mapOpen, priorPreferred, setPrior, viewportWidth]);

  return (
    <WorkspaceLayoutContext.Provider value={value}>
      {children}
    </WorkspaceLayoutContext.Provider>
  );
}

const FALLBACK = {
  mode: 'closed', isPrior: false, priorPreferred: false, priorAvailable: false,
  mapOpen: false, setMapOpen: () => {}, setPrior: () => {}, togglePrior: () => {},
  maCarteWidth: MA_CARTE_WIDTH.desktop, contentGutter: 0,
  sidebarWidth: SIDEBAR_WIDTH, viewportWidth: 1280,
};

/**
 * État de mise en page de l'espace de travail.
 * Hors provider (tests unitaires, rendu isolé) : coquille normale, jamais
 * d'exception — une page doit pouvoir se rendre sans l'espace de travail.
 */
export function useWorkspaceLayout() {
  return useContext(WorkspaceLayoutContext) ?? FALLBACK;
}
