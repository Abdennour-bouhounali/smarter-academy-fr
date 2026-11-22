import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useInRouterContext, useLocation } from 'react-router-dom';
import { canPresentClassroom } from '@smarter-academy/core';
import { AuthContext } from '../../../context/AuthContext';
import { storage } from '../../../utils/storage';
import { ClassroomContext } from './ClassroomContext';
import ClassroomToolbar, { ClassroomNav } from './ClassroomToolbar';
import MathLabEntryButton from '../../../features/mathlab/overlay/MathLabEntryButton';
import ClassroomEntryButton from './ClassroomEntryButton';
import { useFullscreen } from './useFullscreen';
import { useScrollLock } from './useScrollLock';
import { usePresentationFit } from './usePresentationFit';
import { DEFAULT_SCALE, clampScale, stepScale } from './classroomFit';
import ClassroomPointer from './ClassroomPointer';
import { POINTER_SIZE_KEY, normalizePointerSize, pointerShortcut } from './classroomPointer';
import './classroom.css';

/** Préférence d'APPAREIL (comme le son des effets) : l'échelle choisie au tableau. */
const SCALE_KEY = 'smarter_classroom_scale';

/** Sous cette largeur on tente le verrou d'orientation paysage (tablette, téléphone). */
const ORIENTATION_LOCK_MAX_WIDTH = 1024;

/**
 * ClassroomPresentation — le MODE CLASSE (« وضع القسم ») de la plateforme.
 *
 * UNE coquille de présentation pour tout contenu de leçon : on l'enveloppe,
 * et il gagne un plein écran propre — sans barre latérale, sans navigation de
 * page, sans marges — pour le projecteur, le tableau interactif ou le
 * téléviseur de la classe :
 *
 *   <ClassroomPresentation scope="manipulation" title="…">
 *     <DivisorExplorerBooks … />
 *   </ClassroomPresentation>
 *
 * CE QU'ELLE FAIT, ET LE CONTENU N'A PAS À LE SAVOIR :
 *   • le vrai plein écran du navigateur (useFullscreen) sur SA racine, et un
 *     repli `position: fixed; inset: 0` quand l'API manque ou refuse — le
 *     même rendu dans les deux cas, seul le chrome du navigateur diffère ;
 *   • le verrou de défilement html/body, restauré à la sortie (useScrollLock) ;
 *   • Échap : natif en plein écran (le navigateur sort, on le suit par
 *     `fullscreenchange`), à nous en repli — jamais deux gestionnaires en
 *     conflit ;
 *   • l'ajustement au viewport (usePresentationFit) : zone offerte et échelle
 *     effective publiées en variables CSS et par le contexte ;
 *   • la barre d'outils (portée, titre, échelle, sortie) et la navigation
 *     السابق / التالي — fournies par les props OU déclarées par la page
 *     présentée (useClassroomStage) ;
 *   • la sortie propre au démontage et au changement de route ; en session
 *     LEÇON, `routeScope` garde la présentation tant qu'on reste dans la leçon ;
 *   • le verrou d'orientation paysage sur petit écran, tenté et jamais exigé.
 *
 * UNE SEULE SESSION. Une coquille rendue sous une coquille DÉJÀ ACTIVE
 * (manipulation dans un module présenté, exercice dans une leçon présentée)
 * devient passe-plat : elle ne demande aucun plein écran, ne rend aucune
 * barre, et ses enfants lisent le contexte de la session en cours — la
 * bibliothèque prend sa mise en page de classe, le bouton d'entrée disparaît.
 *
 * L'ÉTAT DU CONTENU EST INTOUCHÉ : les enfants restent au MÊME endroit de
 * l'arbre React et du DOM (la racine devient plein écran, elle ne déplace
 * rien). Aucun remontage, donc aucune perte de diviseur choisi, de réponse
 * saisie, d'étape atteinte.
 *
 * DROITS : le point d'entrée n'existe que pour un présentateur
 * (`canPresentClassroom` — core/auth.js, le même mécanisme que les routes).
 * `presenter` force la réponse (fixtures, tests) ; sinon elle vient du
 * compte connecté. `entry="auto"` place le bouton au-dessus du contenu ;
 * `entry="none"` laisse le contenu poser <ClassroomEntryButton /> où il veut.
 *
 * CONTRAT DOM (e2e) :
 *   [data-classroom-scope=…] [data-classroom-active=true|false]
 *   [data-classroom-native=true|false] [data-classroom-nested=true]
 *   [data-classroom-toolbar] [data-classroom-nav] [data-classroom-enter]
 */
export default function ClassroomPresentation({
  scope = 'manipulation',
  title = '',
  onPrevious,
  onNext,
  previousLabel,
  nextLabel,
  toolbarSlot,
  presenter,
  entry = 'auto',
  routeScope,
  lessonNavigation = null,
  className = '',
  retired = false,
  children,
}) {
  const parent = useContext(ClassroomContext);
  if (parent?.isClassroomMode) {
    // Un ancêtre présente déjà : pas de seconde session. Les enfants lisent
    // le contexte de la session en cours ; on ne marque que la portée.
    return (
      <div className={`sa-classroom-nested ${className}`} data-classroom-scope={scope} data-classroom-nested="true">
        {children}
      </div>
    );
  }
  return (
    <ClassroomSession
      scope={scope} title={title} onPrevious={onPrevious} onNext={onNext} previousLabel={previousLabel} nextLabel={nextLabel}
      toolbarSlot={toolbarSlot} presenter={presenter} entry={entry} routeScope={routeScope} lessonNavigation={lessonNavigation} className={className}
      retired={retired || Boolean(parent?.retired)}
    >
      {children}
    </ClassroomSession>
  );
}

function ClassroomSession({
  scope: scopeProp, title: titleProp, onPrevious, onNext, previousLabel, nextLabel, toolbarSlot,
  presenter, entry, routeScope, lessonNavigation, className, retired = false, children,
}) {
  const { t } = useTranslation('lesson');
  const auth = useContext(AuthContext);
  // `retired`: a lesson whose class has its own board (« حصّة القسم », features/classSession/boardLessons.js) has no
  // « وضع القسم » any more — nobody presents here, and the labs and tests nested in its pages inherit it.
  const canPresent = retired ? false : typeof presenter === 'boolean' ? presenter : canPresentClassroom(auth?.user);

  const rootRef = useRef(null);
  const contentRef = useRef(null);
  const stageRef = useRef(null);
  const toolbarRef = useRef(null);
  const navRef = useRef(null);
  const returnFocusTo = useRef(null);
  const wasNative = useRef(false);
  const arrival = useRef(null);

  const [active, setActive] = useState(false);
  // Ce qu'on a demandé à présenter en entrant : la portée (et son titre) —
  // une même coquille sert le sommaire de leçon ET ses modules.
  const [session, setSession] = useState(null);
  const [userScale, setUserScale] = useState(() => clampScale(parseFloat(storage.getItem(SCALE_KEY)) || DEFAULT_SCALE));
  // Les déclarations des pages présentées (useClassroomStage), par priorité.
  const [stages, setStages] = useState({});
  // Le pointeur de classe (« المؤشّر ») : éteint à chaque séance, taille
  // gardée par appareil (comme l'échelle). Voir ClassroomPointer.jsx.
  const [pointerOn, setPointerOn] = useState(false);
  const [spotlight, setSpotlight] = useState(false);
  const [pointerSize, setPointerSize] = useState(() => normalizePointerSize(storage.getItem(POINTER_SIZE_KEY)));
  const [pointerAnnounce, setPointerAnnounce] = useState('');

  const fullscreen = useFullscreen(rootRef);
  const isNative = active && fullscreen.isFullscreen;

  useScrollLock(active);

  const reservedRefs = useMemo(() => [toolbarRef, navRef], []);
  const { area, scale, refit } = usePresentationFit({ active, rootRef, contentRef, stageRef, reservedRefs, userScale });

  // ── Entrée / sortie ──────────────────────────────────────────────────────
  const enterClassroomMode = useCallback((request) => {
    if (!canPresent) return;
    returnFocusTo.current = typeof document !== 'undefined' ? document.activeElement : null;
    const req = request && typeof request === 'object' && !('nativeEvent' in request) ? request : null;
    setSession({ scope: req?.scope ?? scopeProp, title: req?.title ?? null });
    setActive(true);
    // La demande de plein écran part dans le MÊME geste utilisateur (le clic) :
    // différée d'un rendu, Chrome la refuserait. Refus ou API absente → on
    // reste en repli, déjà actif : l'enseignant a sa présentation quand même.
    fullscreen.request().catch(() => false);
  }, [canPresent, fullscreen, scopeProp]);

  const exitClassroomMode = useCallback(() => {
    setActive(false);
    setSession(null);
    fullscreen.exit();
  }, [fullscreen]);

  // Une séance terminée éteint le pointeur : la prochaine repart propre.
  useEffect(() => {
    if (active) return;
    setPointerOn(false);
    setSpotlight(false);
    setPointerAnnounce('');
  }, [active]);

  const togglePointer = useCallback(() => {
    const next = !pointerOn;
    setPointerOn(next);
    if (!next) setSpotlight(false);
    setPointerAnnounce(t(next ? 'classroom.pointer.announceOn' : 'classroom.pointer.announceOff'));
  }, [pointerOn, t]);
  const toggleSpotlight = useCallback(() => {
    const next = !spotlight;
    setSpotlight(next);
    if (next) {
      setPointerOn(true);
      setPointerAnnounce(t('classroom.pointer.announceSpotlight'));
    }
  }, [spotlight, t]);
  const choosePointerSize = useCallback((size) => {
    const next = normalizePointerSize(size);
    storage.setItem(POINTER_SIZE_KEY, next);
    setPointerSize(next);
  }, []);

  // P : le pointeur ; Maj+P : l'éclairage. Seulement pendant la séance, et
  // jamais pendant une saisie ni dans un instrument (pointerShortcut).
  useEffect(() => {
    if (!active || typeof document === 'undefined') return undefined;
    const onKey = (e) => {
      const which = pointerShortcut(e);
      if (!which) return;
      e.preventDefault();
      if (which === 'spotlight') toggleSpotlight(); else togglePointer();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, togglePointer, toggleSpotlight]);

  const toggleClassroomMode = useCallback(() => {
    if (active) exitClassroomMode(); else enterClassroomMode();
  }, [active, enterClassroomMode, exitClassroomMode]);

  // Le navigateur est sorti du plein écran sans nous (Échap, F11, système) :
  // la présentation suit — l'état reflète toujours le plein écran réel.
  useEffect(() => {
    if (active && wasNative.current && !fullscreen.isFullscreen) { setActive(false); setSession(null); }
    wasNative.current = fullscreen.isFullscreen;
  }, [fullscreen.isFullscreen, active]);

  // Échap en REPLI seulement (en natif c'est le navigateur qui sort). On
  // laisse passer la touche si un objet est en train d'être porté : Échap le
  // repose (useDragInteraction), il ne ferme pas la présentation.
  useEffect(() => {
    if (!active || isNative || typeof document === 'undefined') return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      const source = e.target?.closest?.('[data-drag-source]');
      if (source && source.getAttribute('aria-pressed') === 'true') return;
      exitClassroomMode();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, isNative, exitClassroomMode]);

  // Focus : dans la présentation à l'entrée ; à la sortie, rendu à l'élément
  // qui l'avait — ou, s'il a été remonté entre-temps (le bouton d'entrée
  // n'existe pas pendant la présentation), au bouton d'entrée de CETTE racine.
  const hadFocus = useRef(false);
  useEffect(() => {
    if (active) {
      hadFocus.current = true;
      rootRef.current?.focus?.({ preventScroll: true });
      return undefined;
    }
    if (!hadFocus.current || typeof document === 'undefined') return undefined;
    hadFocus.current = false;
    const previous = returnFocusTo.current;
    returnFocusTo.current = null;
    const target = previous && document.contains(previous)
      ? previous
      : rootRef.current?.querySelector('[data-classroom-enter]');
    target?.focus?.({ preventScroll: true });
    return undefined;
  }, [active]);

  // Orientation paysage sur petit écran : tentée, jamais exigée, défaite si
  // c'est nous qui l'avions posée.
  useEffect(() => {
    if (!isNative || typeof window === 'undefined' || window.innerWidth >= ORIENTATION_LOCK_MAX_WIDTH) return undefined;
    const orientation = window.screen?.orientation;
    if (!orientation || typeof orientation.lock !== 'function') return undefined;
    let locked = false;
    Promise.resolve()
      .then(() => orientation.lock('landscape'))
      .then(() => { locked = true; })
      .catch(() => { /* refusé ou non supporté : on n'en dépend pas */ });
    return () => {
      if (!locked) return;
      try { orientation.unlock?.(); } catch { /* noop */ }
    };
  }, [isNative]);

  // Le document sait qu'une présentation est active — et comment. En REPLI,
  // la racine fixe reste prisonnière du contexte d'empilement de ses ancêtres
  // (le <main> des coquilles est `relative z-10`) : un chrome fixe posé plus
  // haut (barre de navigation, carte, cahier) passerait
  // DEVANT et intercepterait les clics. classroom.css cache donc, en repli,
  // tout élément fixe hors de la présentation — exactement ce que fait déjà
  // le plein écran natif avec sa couche supérieure.
  useEffect(() => {
    if (!active || typeof document === 'undefined') return undefined;
    document.documentElement.setAttribute('data-sa-classroom', isNative ? 'native' : 'fallback');
    return () => document.documentElement.removeAttribute('data-sa-classroom');
  }, [active, isNative]);

  // Démontage en pleine présentation (changement de route, module retiré) :
  // on rend le plein écran ; le verrou de défilement se défait dans son hook.
  useEffect(() => () => {
    const root = rootRef.current;
    if (typeof document === 'undefined' || !root) return;
    const current = document.fullscreenElement || document.webkitFullscreenElement;
    if (current === root) {
      try { (document.exitFullscreen || document.webkitExitFullscreen)?.call(document)?.catch?.(() => {}); } catch { /* noop */ }
    }
  }, []);

  // ── Échelle ──────────────────────────────────────────────────────────────
  const onScaleStep = useCallback((direction) => {
    setUserScale((current) => {
      const next = stepScale(current, direction);
      storage.setItem(SCALE_KEY, String(next));
      return next;
    });
  }, []);

  // ── Déclarations des pages présentées ────────────────────────────────────
  const registerStage = useCallback((id, spec) => {
    setStages((prev) => {
      if (!spec) {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: spec };
    });
  }, []);
  const stage = useMemo(() => {
    let best = null;
    for (const spec of Object.values(stages)) if (!best || (spec.priority ?? 1) >= (best.priority ?? 1)) best = spec;
    return best;
  }, [stages]);

  const takeArrival = useCallback(() => { const a = arrival.current; arrival.current = null; return a; }, []);
  // Les gestes vers les modules voisins (session leçon), avec le bout par
  // lequel entrer dans la page suivante.
  const lessonNav = useMemo(() => {
    if (!session || session.scope !== 'lesson' || !lessonNavigation) return null;
    const { previous, next, position, total, previousLabel: pLabel, nextLabel: nLabel } = lessonNavigation;
    return {
      // Un saut de محور entre TOUJOURS par le bon bout : en arrière, à la
      // dernière unité du module précédent ; en avant, à la première.
      previous: previous ? () => { arrival.current = 'last'; previous(); } : null,
      next: next ? () => { arrival.current = 'first'; next(); } : null,
      previousLabel: pLabel, nextLabel: nLabel,
      position, total,
    };
  }, [session, lessonNavigation]);

  // ── Contexte publié au contenu ───────────────────────────────────────────
  const [portalTarget, setPortalTarget] = useState(null);
  useEffect(() => { setPortalTarget(active ? rootRef.current : null); }, [active]);

  const scope = session?.scope ?? scopeProp;
  const title = stage?.title ?? session?.title ?? titleProp;
  const effPrevious = stage ? stage.onPrevious : onPrevious;
  const effNext = stage ? stage.onNext : onNext;
  const effSlot = stage?.slot ?? toolbarSlot;
  // 🧪 المختبر DANS la barre d'outils de la présentation : au tableau,
  // devant la classe, c'est là que la main de l'enseignant se trouve, et un
  // instrument doit être atteignable sans sortir de la séance. Le calque
  // (z-index 80) couvre la racine de présentation (70) et se portalise
  // dedans, donc il s'affiche aussi en plein écran natif.
  //
  // Il ne remplace pas `effSlot` : une page présentée peut y avoir mis ses
  // propres commandes (useClassroomStage), on les garde et on ajoute la
  // nôtre à côté.
  const toolbarSlotContent = (
    <>
      {effSlot}
      <MathLabEntryButton />
    </>
  );
  // Les SAUTS de محور. Ils n'appartiennent à aucune page : c'est la session
  // leçon qui connaît ses voisins, et elle seule les offre. En portée module,
  // exercice ou manipulation, `lessonNav` est nul et aucun bouton n'apparaît.
  const effPreviousModule = lessonNav?.previous ?? undefined;
  const effNextModule = lessonNav?.next ?? undefined;

  const ctx = useMemo(() => ({
    isClassroomMode: active,
    isNativeFullscreen: isNative,
    isNested: false,
    canPresent,
    retired,
    scope,
    title,
    scale,
    userScale,
    area,
    enterClassroomMode,
    exitClassroomMode,
    toggleClassroomMode,
    registerStage,
    lessonNavigation: lessonNav,
    takeArrival,
    refit,
    portalTarget,
  }), [active, isNative, canPresent, retired, scope, title, scale, userScale, area, enterClassroomMode, exitClassroomMode, toggleClassroomMode, registerStage, lessonNav, takeArrival, refit, portalTarget]);

  const inRouter = useInRouterContext();

  return (
    <ClassroomContext.Provider value={ctx}>
      <div
        ref={rootRef}
        className={`sa-classroom-root ${active ? 'sa-classroom-root--active' : ''} ${className}`}
        data-classroom-scope={scope}
        data-classroom-active={active ? 'true' : 'false'}
        data-classroom-native={isNative ? 'true' : 'false'}
        data-classroom-scale={active ? scale : undefined}
        tabIndex={active ? -1 : undefined}
        role={active ? 'region' : undefined}
        aria-label={active ? `${t('classroom.title')}${title ? ` — ${title}` : ''}` : undefined}
        style={active ? {
          '--sa-classroom-scale': scale,
          '--sa-classroom-w': `${area.width}px`,
          '--sa-classroom-h': `${area.height}px`,
        } : undefined}
      >
        {inRouter && active && <RouteChangeExit onRouteChange={exitClassroomMode} routeScope={routeScope} />}

        {entry === 'auto' && canPresent && !active && (
          <div className="sa-classroom-entry-row">
            <ClassroomEntryButton />
          </div>
        )}

        {active && (
          <ClassroomToolbar
            ref={toolbarRef}
            title={title}
            scope={scope}
            scale={userScale}
            onScaleStep={onScaleStep}
            slot={toolbarSlotContent}
            onExit={exitClassroomMode}
            pointer={{
              on: pointerOn, size: pointerSize, spotlight,
              onToggle: togglePointer, onSize: choosePointerSize, onSpotlight: toggleSpotlight,
            }}
          />
        )}
        {active && <span className="sr-only" aria-live="polite">{pointerAnnounce}</span>}

        <div className="sa-classroom-content" ref={contentRef}>
          <div className="sa-classroom-stage" ref={stageRef}>
            {children}
          </div>
        </div>

        {active && (
          <ClassroomNav
            ref={navRef}
            onPrevious={effPrevious}
            onNext={effNext}
            previousLabel={previousLabel}
            nextLabel={nextLabel}
            onPreviousModule={effPreviousModule}
            onNextModule={effNextModule}
            previousModuleLabel={lessonNav?.previousLabel}
            nextModuleLabel={lessonNav?.nextLabel}
          />
        )}

        {active && pointerOn && <ClassroomPointer size={pointerSize} spotlight={spotlight} />}
      </div>
    </ClassroomContext.Provider>
  );
}

/**
 * Quitte la présentation dès que l'URL SORT de la portée présentée (brief
 * §23). Sans `routeScope`, tout changement de chemin sort ; avec (une session
 * leçon), on reste tant que la page est dans la leçon. Rendu seulement sous
 * un routeur ET pendant la présentation, pour que ClassroomPresentation
 * reste utilisable hors routeur (fixtures, tests).
 */
function RouteChangeExit({ onRouteChange, routeScope }) {
  const { pathname } = useLocation();
  const first = useRef(pathname);
  useEffect(() => {
    if (pathname === first.current) return;
    if (routeScope && (pathname === routeScope || pathname.startsWith(`${routeScope}/`))) return;
    onRouteChange();
  }, [pathname, onRouteChange, routeScope]);
  return null;
}
