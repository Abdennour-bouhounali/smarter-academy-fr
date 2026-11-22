import {
  Suspense, createContext, lazy, useCallback, useContext, useMemo, useRef, useState,
} from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { createNote, updateNote } from '../../../services/practiceService';
import { contextPayload } from './noteContext';

/**
 * La fenêtre est un lot À PART, chargé à la demande.
 *
 * Ce fournisseur est monté au-dessus du routeur : ce qu'il importe
 * statiquement part dans le lot d'entrée de chaque visiteur. La fenêtre
 * embarque l'éditeur, KaTeX (≈ 580 Ko de source) et framer-motion — pour un
 * cahier qui ne s'ouvre que sur un geste de l'élève.
 *
 * Préchargement : dès qu'une page PUBLIE sa position (`setLocation` non nul,
 * c.-à-d. une leçon, une étape, une pratique), le lot est demandé au prochain
 * moment d'inactivité. La pastille « Mon cahier » s'ouvre donc sans attente là où
 * elle existe, et « / » ne paie rien. Voir docs/architecture/BUNDLE_BOUNDARIES.md.
 */
const loadNotebookWindow = () => import('./NotebookWindow');
const NotebookWindow = lazy(loadNotebookWindow);
let notebookWindowRequested = false;

function preloadNotebookWindow() {
  if (notebookWindowRequested) return;
  notebookWindowRequested = true;
  const run = () => loadNotebookWindow().catch(() => { notebookWindowRequested = false; });
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(run, { timeout: 3000 });
  } else {
    setTimeout(run, 1);
  }
}

/**
 * LE cahier — une seule instance, montée au-dessus du routeur.
 *
 * Deux choses vivent ici, et elles sont indépendantes :
 *
 *  - la POSITION COURANTE (`location`) : la page de leçon où l'élève se
 *    trouve, publiée par la coquille de la leçon (LessonNotebookAnchor) à
 *    chaque navigation. C'est ce que le prochain « ouvrir » capturera.
 *
 *  - la SESSION ouverte (`session`) : le contexte capturé AU MOMENT de
 *    l'ouverture, la note rouverte s'il y en a une, le contenu de départ.
 *    Elle ne suit pas la navigation : une note commencée dans le module A
 *    reste du module A si l'élève passe au module B — il ferme et rouvre
 *    pour écrire « ici ».
 *
 * Pourquoi au-dessus du routeur : le cahier doit survivre au changement de
 * module (même fenêtre, même brouillon, même position à l'écran), et servir
 * aussi la pratique et « Ma progression » — un seul NotebookWindow dans
 * toute l'application, une seule source de vérité.
 *
 * Ouvrir ne crée RIEN en base : la note naît au premier « Enregistrer », avec le
 * contexte de la session. Le contexte d'une note existante n'est jamais
 * renvoyé au serveur — il appartient à sa création.
 */
const NotebookContext = createContext(null);

export function NotebookProvider({ children }) {
  const { token } = useContext(AuthContext);
  const [location, setLocationState] = useState(null);
  const [session, setSession] = useState(null);
  const [open, setOpen] = useState(false);
  // Les rappels de la session courante, hors de l'état : ils changent à
  // chaque rendu de l'appelant et ne doivent pas re-rendre la fenêtre.
  const callbacks = useRef({});

  const setLocation = useCallback((next) => {
    if (next) preloadNotebookWindow();
    setLocationState((prev) => (sameLocation(prev, next) ? prev : next));
  }, []);

  /**
   * @param {object} opts
   * @param {object} [opts.context]      le contexte capturé (par défaut : la position courante)
   * @param {object} [opts.note]         une note existante à rouvrir (son contexte fait foi)
   * @param {string} [opts.starterHtml]  contenu de départ (« Ajouter à mon cahier »)
   * @param {function} [opts.onCreate]   remplace la création par défaut (la pratique ajoute ses codes)
   * @param {function} [opts.onUpdate]
   * @param {function} [opts.onSaved]
   */
  const openNotebook = useCallback((opts = {}) => {
    const { onCreate, onUpdate, onSaved, ...rest } = opts;
    callbacks.current = { onCreate, onUpdate, onSaved };
    setSession({
      key: Date.now(),
      context: rest.note ? null : (rest.context ?? location),
      note: rest.note ?? null,
      starterHtml: rest.starterHtml ?? null,
    });
    setOpen(true);
  }, [location]);

  const closeNotebook = useCallback(() => setOpen(false), []);

  // Création par défaut : le contenu + les codes du contexte capturé. Le
  // serveur vérifie que chaque code appartient bien à celui qui l'englobe.
  const create = useCallback((data) => {
    if (callbacks.current.onCreate) return callbacks.current.onCreate(data);

    return createNote(token, { ...data, ...contextPayload(session?.context) });
  }, [token, session]);

  const update = useCallback((id, patch) => {
    if (callbacks.current.onUpdate) return callbacks.current.onUpdate(id, patch);

    return updateNote(token, id, patch);
  }, [token]);

  const saved = useCallback((note) => callbacks.current.onSaved?.(note), []);

  const value = useMemo(() => ({
    location, setLocation, openNotebook, closeNotebook, isOpen: open, session,
  }), [location, setLocation, openNotebook, closeNotebook, open, session]);

  return (
    <NotebookContext.Provider value={value}>
      {children}
      {session && (
        <Suspense fallback={null}>
        <NotebookWindow
          key={session.key}
          open={open}
          onClose={closeNotebook}
          context={session.context}
          note={session.note}
          starterHtml={session.starterHtml}
          onCreate={create}
          onUpdate={update}
          onSaved={saved}
        />
        </Suspense>
      )}
    </NotebookContext.Provider>
  );
}

function sameLocation(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;

  return a.lessonCode === b.lessonCode && a.moduleNumber === b.moduleNumber
    && a.learningPointCode === b.learningPointCode && a.exerciseId === b.exerciseId && a.questionId === b.questionId;
}

const FALLBACK = {
  location: null, setLocation: () => {}, openNotebook: () => {}, closeNotebook: () => {}, isOpen: false, session: null,
};

/** Le cahier. Hors provider (tests unitaires, Storybook) : un cahier inerte, jamais une erreur. */
export function useNotebook() {
  return useContext(NotebookContext) ?? FALLBACK;
}
