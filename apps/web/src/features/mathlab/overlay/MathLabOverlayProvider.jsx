import { Suspense, createContext, lazy, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
/**
 * La racine d'une séance de mode classe EN COURS, ou `document.body`.
 *
 * Pourquoi on la cherche dans le DOM plutôt qu'avec `useClassroomPortalTarget()` :
 * ce fournisseur est monté AU-DESSUS du routeur (pour que la leçon ne soit
 * jamais démontée), donc au-dessus de `ClassroomPresentation`. Le contexte
 * de la présentation descend, il ne remonte pas — le hook rendrait toujours
 * `document.body`, et le calque s'ouvrirait DERRIÈRE la présentation
 * (mesuré : la racine est à z-index 70 et vient après dans le document).
 *
 * `.sa-classroom-root--active` est posée par ClassroomPresentation sur la
 * racine de la séance, et il n'y en a jamais qu'une (« une seule session »,
 * CLASSROOM_MODE.md §4). On la lit au moment d'ouvrir le calque, ce qui
 * suffit : une séance ne commence ni ne finit pendant ce rendu-là.
 */
function presentationRoot() {
  if (typeof document === 'undefined') return null;

  return document.querySelector('.sa-classroom-root--active') ?? document.body;
}
import { PICKER } from './overlayState.js';

/**
 * Le calque est chargé À LA DEMANDE — jamais au démarrage.
 *
 * Ce fournisseur est monté au-dessus du routeur, donc tout ce qu'il importe
 * statiquement part dans le lot d'entrée de CHAQUE visiteur. Le calque, lui,
 * importe le registre des instruments (toolRegistry.js), et chaque
 * descripteur y importe son état et son `summarize` — les moteurs
 * mathématiques des quatorze instruments (≈ 700 Ko de source). Mesuré dans
 * index-*.js avant ce découpage, pour un calque que la plupart des visiteurs
 * n'ouvrent jamais.
 *
 * `preloadMathLabOverlay()` est appelé par MathLabEntryButton au survol et
 * au focus : le temps que le doigt ou le clic arrive, le lot est déjà là.
 * `import()` est mémoïsé par le navigateur, l'appeler dix fois ne coûte rien.
 * Voir docs/architecture/BUNDLE_BOUNDARIES.md.
 */
const loadOverlay = () => import('./MathLabOverlay.jsx');
const MathLabOverlay = lazy(loadOverlay);

export function preloadMathLabOverlay() {
  loadOverlay().catch(() => {
    // Un préchargement raté n'est pas une panne : l'ouverture réessaiera.
  });
}

/** Ce que l'élève voit pendant le PREMIER téléchargement du calque, s'il n'a pas été préchargé. */
function OverlayLoading() {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/30"
      role="status"
      aria-busy="true"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-nav-accent border-t-transparent" aria-hidden="true" />
    </div>
  );
}

/**
 * LE atelier OUVERT PAR-DESSUS LA LEÇON — une seule instance, montée au-dessus
 * du routeur, exactement comme le cahier (NotebookProvider).
 *
 * ── Pourquoi au-dessus du routeur ────────────────────────────────────────
 * Le brief est « l'outil se pose SUR le cours », pas « on quitte le cours » :
 * en fermant, l'élève doit retrouver sa leçon au même module, au même
 * défilement, avec la même réponse tapée et la même étape atteinte. Un
 * `navigate()` vers /espace/atelier démonterait la leçon et perdrait tout
 * cela. Ici, la page de leçon n'est jamais démontée : elle reste dans l'arbre
 * React, derrière un calque. Rien à sauvegarder, rien à restaurer — l'état
 * n'a simplement pas bougé. C'est la même raison qui met le cahier là.
 *
 * ── Ce que ce fournisseur porte ──────────────────────────────────────────
 *  - `tool` : l'instrument ouvert (`null` = fermé, `'#picker'` = le choix) ;
 *  - l'élément qui a ouvert l’atelier, pour LUI RENDRE le focus en fermant
 *    (§9 du brief) — un `ref`, jamais de l'état : le rendre ne regarde pas.
 *
 * Le plein écran, lui, appartient au calque (MathLabOverlay) : c'est lui qui
 * possède l'élément que le navigateur met en plein écran.
 *
 * ── Le plein écran de l’atelier n'est PAS « mode classe » ──────────────────────
 * Deux notions distinctes, et ce fichier ne connaît que la première :
 *
 *   plein écran de l’atelier  → élève ET enseignant, aucune permission
 *   mode classe (présentation) → canPresentClassroom(), inchangé
 *
 * Rien ici n'importe `packages/core/auth.js` : donner de la place à un
 * instrument n'est pas présenter à une classe.
 */
const MathLabOverlayContext = createContext(null);

export function MathLabOverlayProvider({ children }) {
  // `null` fermé · PICKER le sélecteur · sinon l'id de l'instrument.
  const [tool, setTool] = useState(null);
  // L’atelier proposé par le sélecteur (MATH_LAB.md §2.1) : celui de la leçon
  // qui ouvre le calque, ou null — le calque retombe alors sur le dernier
  // choisi. Une simple chaîne ici : la logique des ateliers (labScope.js) vit
  // dans le calque, chargé à la demande.
  const [scope, setScope] = useState(null);
  const openerRef = useRef(null);
  // Où poser le calque : dans la racine de la séance s'il y en a une, dans
  // <body> sinon. Résolu à l'OUVERTURE (voir `open`), pas à chaque rendu.
  const [portalTarget, setPortalTarget] = useState(null);

  const open = useCallback((toolId = PICKER, options = {}) => {
    // L'élément qui avait le focus au moment de l'ouverture : c'est à lui
    // que le focus revient à la fermeture, quand il est encore là.
    openerRef.current = typeof document !== 'undefined' ? document.activeElement : null;
    setPortalTarget(presentationRoot());
    setScope(typeof options?.scope === 'string' ? options.scope : null);
    setTool(toolId);
  }, []);

  const close = useCallback(() => {
    setTool(null);
    const opener = openerRef.current;
    openerRef.current = null;
    // Rendre le focus APRÈS le démontage du calque, sinon le navigateur le
    // reprend. Un élément disparu (navigation, re-rendu) ne reçoit rien.
    if (opener && typeof opener.focus === 'function') {
      requestAnimationFrame(() => {
        if (opener.isConnected) opener.focus();
      });
    }
  }, []);

  /** Choisir un instrument DEPUIS le sélecteur : on reste dans le calque. */
  const pick = useCallback((toolId) => setTool(toolId), []);

  /** Revenir au sélecteur depuis un instrument ouvert. */
  const backToPicker = useCallback(() => setTool(PICKER), []);

  const value = useMemo(
    () => ({ tool, scope, setScope, isOpen: tool !== null, isPicking: tool === PICKER, open, close, pick, backToPicker }),
    [tool, scope, open, close, pick, backToPicker],
  );

  const overlay = tool !== null ? (
    <Suspense fallback={<OverlayLoading />}>
      <MathLabOverlay />
    </Suspense>
  ) : null;

  return (
    <MathLabOverlayContext.Provider value={value}>
      {children}
      {overlay && portalTarget ? createPortal(overlay, portalTarget) : overlay}
    </MathLabOverlayContext.Provider>
  );
}

export function useMathLabOverlay() {
  const context = useContext(MathLabOverlayContext);
  if (context === null) {
    throw new Error('[mathlab] useMathLabOverlay() hors de MathLabOverlayProvider');
  }

  return context;
}
