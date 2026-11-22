import {
  useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft, ChevronRight, Play, Pause, RotateCcw, ListChecks, Footprints, Timer,
  GripVertical, Minimize2, Maximize2, Gauge, PenLine, Eye,
} from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import {
  subscribeDock, registerFloating, unregisterFloating, activateFloating, getActiveFloating,
  getDockPrefs, setDockPosition, setDockMinimized, clampToViewport,
} from './floatingDock.js';
import './labKit.css';

const SPEED_ORDER = ['slow', 'normal', 'fast'];

/** La zone qui défile autour du lecteur (la scène de l'outil) — son point d'ancrage par défaut. */
function scrollArea(node) {
  for (let el = node.parentElement; el && el !== document.body; el = el.parentElement) {
    const { overflowY } = getComputedStyle(el);
    if (/(auto|scroll)/.test(overflowY) && el.clientHeight > 0) return el;
  }

  return null;
}
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * « الحل خطوة بخطوة » — la PETITE barre d'un déroulé (`useStepReveal`).
 *
 * Demandes de la propriétaire (2026-09-30) : une barre discrète, en icônes,
 * DÉPLAÇABLE pour ne jamais cacher le tableau, et réductible à ses seuls
 * boutons (sans progression).
 *
 *   ⋮⋮  [👣|⏱]  ‹  [ › ]  ↺  ☰  2/5  ⤡        (déployée)
 *   ⋮⋮  ‹  [ › ]  ⤢                             (réduite : les boutons, rien d'autre)
 *
 * Chaque bouton est une icône avec son nom accessible (`aria-label` + `title`).
 * Deux modes, jamais un affichage d'un bloc : « خطوة بخطوة » (‹ السابقة,
 * › التالية) et « عرض تلقائي » (▶ / ❚❚, et la vitesse بطيء → عادي → سريع en un
 * bouton). « عرض الحل كاملاً » n'existe que dans l'espace enseignant.
 *
 * `sticky` (le nom est gardé) = la barre FLOTTE : position fixe, glissée par
 * la poignée ⋮⋮ (souris, doigt, ou flèches du clavier ; Début / double-clic la
 * ramènent en place), position et état réduit mémorisés dans le navigateur.
 * Un seul lecteur flotte à la fois (floatingDock.js) ; sans `sticky`, ou quand
 * un autre flotte, la même pastille compacte reste à sa place dans la page.
 *
 * `progress` : `{ current, total }` en ÉTAPES logiques (MathBoard).
 * `blocked` / `onReveal` (useBoardPractice) : en mode « تدرّب بنفسك », « التالي »
 * attend la réponse de l'élève ; « أرني » (l'œil) montre le geste attendu.
 * Attributs e2e préfixés par `dataAttr` : `-player` (phase), `-mode`, `-speed`,
 * `-start`, `-next`, `-previous`, `-pause`, `-resume`, `-restart`,
 * `-reveal-all`, `-position`, `-grip`, `-minimize`.
 */
export default function StepPlayer({
  player, stepper, dataAttr = 'data-ml-step', title = null, sticky = false, progress = null, blocked = false, onReveal = null,
}) {
  const { t } = useTranslation('mathlab');
  const p = player ?? stepper;
  const isTeacher = useContext(AuthContext)?.user?.role === 'teacher';
  const id = useId();
  const ref = useRef(null);
  const drag = useRef(null);

  const activeId = useSyncExternalStore(subscribeDock, getActiveFloating, () => null);
  const prefs = useSyncExternalStore(subscribeDock, getDockPrefs, getDockPrefs);
  const [position, setPosition] = useState(null);

  // Un lecteur « sticky » s'inscrit au dock ; le dernier touché flotte.
  useEffect(() => {
    if (!sticky) return undefined;
    registerFloating(id);

    return () => unregisterFloating(id);
  }, [sticky, id]);

  // Elle flotte TOUJOURS (propriétaire : « must always be draggable ») — dès
  // l'énoncé, avant même le premier pas. Qu'elle couvre un instant du contenu
  // est accepté : on la déplace.
  const floating = sticky && activeId === id;
  const touch = useCallback(() => { if (sticky) activateFloating(id); }, [sticky, id]);

  // Démarrer ce déroulé le fait flotter.
  const started = p?.started;
  useEffect(() => { if (started) touch(); }, [started, touch]);

  // La position : celle que l'élève a choisie, ramenée dans la fenêtre ; sinon
  // en bas, au centre, au-dessus de la barre de navigation mobile.
  useIsoLayoutEffect(() => {
    if (!floating || !ref.current) return undefined;
    const place = () => {
      const node = ref.current;
      if (!node) return;
      const size = { width: node.offsetWidth, height: node.offsetHeight };
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      // En haut à DROITE de la zone qui défile (la scène de l'outil) : le
      // bord de départ en arabe, là où l'œil commence, et jamais sur le tableau
      // centré (demande de la propriétaire).
      const area = scrollArea(node)?.getBoundingClientRect() ?? { right: viewport.width, top: 0 };
      const wanted = prefs.position ?? {
        x: area.right - size.width - 12,
        y: Math.max(area.top, 0) + 10,
      };
      setPosition(clampToViewport(wanted, size, viewport));
    };
    place();
    window.addEventListener('resize', place);
    // La barre change de taille (mode, pas, réduite) : elle reste dans l'écran.
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(place) : null;
    observer?.observe(ref.current);

    return () => {
      window.removeEventListener('resize', place);
      observer?.disconnect();
    };
  }, [floating, prefs.position, prefs.minimized]);

  const onGripDown = useCallback((event) => {
    if (!floating || !ref.current) return;
    event.preventDefault();
    const rect = ref.current.getBoundingClientRect();
    drag.current = { dx: event.clientX - rect.left, dy: event.clientY - rect.top };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [floating]);

  const onGripMove = useCallback((event) => {
    if (!drag.current || !ref.current) return;
    const size = { width: ref.current.offsetWidth, height: ref.current.offsetHeight };
    setPosition(clampToViewport(
      { x: event.clientX - drag.current.dx, y: event.clientY - drag.current.dy },
      size,
      { width: window.innerWidth, height: window.innerHeight },
    ));
  }, []);

  const onGripUp = useCallback(() => {
    if (!drag.current) return;
    drag.current = null;
    if (position) setDockPosition(position);
  }, [position]);

  const onGripKey = useCallback((event) => {
    if (!floating || !position || !ref.current) return;
    const moves = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] };
    if (event.key === 'Home') { event.preventDefault(); setDockPosition(null); return; }
    const delta = moves[event.key];
    if (!delta) return;
    event.preventDefault();
    const next = clampToViewport(
      { x: position.x + delta[0], y: position.y + delta[1] },
      { width: ref.current.offsetWidth, height: ref.current.offsetHeight },
      { width: window.innerWidth, height: window.innerHeight },
    );
    setPosition(next);
    setDockPosition(next);
  }, [floating, position]);

  if (!p || p.total === 0) return null;

  const { cursor, total, mode, speed, playing, phase } = p;
  const attr = (suffix, value = '') => ({ [`${dataAttr}-${suffix}`]: value });
  const single = total === 1;
  const minimized = floating && prefs.minimized;
  const act = (fn) => () => { touch(); fn(); };
  const label = (key) => ({ 'aria-label': t(key), title: t(key) });
  const inProgress = phase === 'stepping' || phase === 'paused' || phase === 'playing';
  // Au début, le bouton qui fait avancer « respire » : l'élève sait où cliquer.
  const attention = phase === 'ready' || (mode !== 'auto' && cursor <= 1 && inProgress);
  const shown = progress ?? { current: cursor, total };
  const positionText = phase === 'ready'
    ? t('kit.stepper.ready')
    : t(phase === 'completed' ? 'kit.stepper.completed' : 'kit.stepper.position', shown);

  return (
    <div
      ref={ref}
      className={`sa-ml-kit-player${floating ? ' is-floating' : ''}${minimized ? ' is-minimized' : ''}`}
      role="toolbar"
      aria-label={title ?? t('kit.stepper.label')}
      style={floating && position ? { left: position.x, top: position.y } : undefined}
      onPointerDown={touch}
      {...attr('player', phase)}
    >
      {floating && (
        <button
          type="button"
          className="sa-ml-kit-player__grip"
          onPointerDown={onGripDown}
          onPointerMove={onGripMove}
          onPointerUp={onGripUp}
          onPointerCancel={onGripUp}
          onKeyDown={onGripKey}
          onDoubleClick={() => setDockPosition(null)}
          {...label('kit.stepper.move')}
          {...attr('grip')}
        >
          <GripVertical size={16} aria-hidden="true" />
        </button>
      )}

      {!minimized && !single && (
        <span className="sa-ml-kit-player__modes" role="radiogroup" aria-label={t('kit.stepper.modeLabel')}>
          {[['manual', Footprints], ['auto', Timer], ['practice', PenLine]].map(([value, Icon]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={mode === value}
              className={`sa-ml-kit-player__icon${mode === value ? ' is-active' : ''}`}
              onClick={act(() => p.setMode(value))}
              {...label(`kit.stepper.modes.${value}`)}
              {...attr('mode', value)}
            >
              <Icon size={15} aria-hidden="true" />
            </button>
          ))}
        </span>
      )}

      {!minimized && mode === 'auto' && !single && (
        <button
          type="button"
          className="sa-ml-kit-player__icon sa-ml-kit-player__speed"
          onClick={act(() => p.setSpeed(SPEED_ORDER[(SPEED_ORDER.indexOf(speed) + 1) % SPEED_ORDER.length]))}
          aria-label={`${t('kit.stepper.speedLabel')}: ${t(`kit.stepper.speeds.${speed}`)}`}
          title={`${t('kit.stepper.speedLabel')}: ${t(`kit.stepper.speeds.${speed}`)}`}
          {...attr('speed', speed)}
        >
          <Gauge size={15} aria-hidden="true" />
          <span className="sa-ml-kit-player__speed-text">{t(`kit.stepper.speedsShort.${speed}`)}</span>
        </button>
      )}

      {phase === 'ready' && (
        <button
          type="button"
          className={`sa-ml-kit-player__icon is-primary${attention ? ' is-attention' : ''}`}
          onClick={act(p.start)}
          {...label(mode === 'auto' && !single ? 'kit.stepper.play' : 'kit.stepper.start')}
          {...attr('start')}
        >
          {mode === 'auto' && !single ? <Play size={16} aria-hidden="true" /> : <ChevronLeft size={18} aria-hidden="true" />}
        </button>
      )}

      {inProgress && mode !== 'auto' && (
        <>
          <button type="button" className="sa-ml-kit-player__icon" onClick={act(p.previous)} disabled={cursor <= 1} {...label('kit.stepper.previous')} {...attr('previous')}>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
          {blocked && onReveal && (
            <button type="button" className="sa-ml-kit-player__icon" onClick={act(onReveal)} {...label('kit.practice.reveal')} {...attr('reveal-step')}>
              <Eye size={16} aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            className={`sa-ml-kit-player__icon is-primary${attention && !blocked ? ' is-attention' : ''}`}
            onClick={act(p.next)}
            disabled={blocked}
            {...label(blocked ? 'kit.practice.blocked' : 'kit.stepper.next')}
            {...attr('next')}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
        </>
      )}

      {inProgress && mode === 'auto' && (
        playing ? (
          <button type="button" className="sa-ml-kit-player__icon is-playing" onClick={act(p.pause)} {...label('kit.stepper.pause')} {...attr('pause')}>
            <Pause size={16} aria-hidden="true" />
          </button>
        ) : (
          <button type="button" className="sa-ml-kit-player__icon is-primary" onClick={act(p.resume)} {...label('kit.stepper.resume')} {...attr('resume')}>
            <Play size={16} aria-hidden="true" />
          </button>
        )
      )}

      {(phase === 'completed' || (!minimized && inProgress)) && !single && (
        <button
          type="button"
          className="sa-ml-kit-player__icon"
          onClick={act(p.restart)}
          {...label(phase === 'completed' ? (mode === 'auto' ? 'kit.stepper.replay' : 'kit.stepper.again') : 'kit.stepper.restartShort')}
          {...attr('restart')}
        >
          <RotateCcw size={15} aria-hidden="true" />
        </button>
      )}

      {!minimized && isTeacher && phase !== 'completed' && !single && (
        <button type="button" className="sa-ml-kit-player__icon" onClick={act(p.revealAll)} {...label('kit.stepper.revealAll')} {...attr('reveal-all')}>
          <ListChecks size={15} aria-hidden="true" />
        </button>
      )}

      {/* La progression : visible déployée, réservée aux lecteurs d'écran réduite. */}
      <span
        className={minimized ? 'sa-ml-kit-player__sr' : 'sa-ml-kit-player__position'}
        aria-live="polite"
        {...attr('position', `${cursor}/${total}`)}
      >
        {minimized ? positionText : (phase === 'ready' ? `0/${shown.total}` : `${shown.current}/${shown.total}`)}
      </span>

      {floating && (
        <button
          type="button"
          className="sa-ml-kit-player__icon sa-ml-kit-player__minimize"
          onClick={() => setDockMinimized(!prefs.minimized)}
          aria-pressed={prefs.minimized}
          {...label(prefs.minimized ? 'kit.stepper.expand' : 'kit.stepper.minimize')}
          {...attr('minimize')}
        >
          {prefs.minimized ? <Maximize2 size={14} aria-hidden="true" /> : <Minimize2 size={14} aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}
