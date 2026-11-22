import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RotateCcw } from 'lucide-react';
import { SpaceStage } from './spaceStage';

/**
 * LA FENÊTRE 3D D'UN LAB (unité 14 « الهندسة في الفضاء ») — le pont React de SpaceStage. Un lab de l'espace la pose au cœur
 * de son bloc « glance » et lui donne :
 *   - `build(stage)` : appelé UNE fois quand la scène existe ; crée les objets (solids3d.js) et rend un contrôleur
 *     `{ update(state), dispose?() }` ;
 *   - `state` : l'état mathématique du lab ; chaque changement appelle `controller.update(state)` (jamais une nouvelle scène) ;
 *   - `fallback` : ce qui s'affiche SANS WebGL (jsdom des tests, vieux navigateur) — une SpaceFigure de la même situation,
 *     pour que le lab reste lisible et testable ; les commandes HTML du lab restent les mêmes ;
 *   - `view` { azimuth, elevation, distance }, `target` [x, y, z] (mathématiques), `orbit` (défaut true).
 * Le bloc est focusable : ← → ↑ ↓ font tourner la vue (une aide, pas un geste mathématique), ↺ la remet. Le geste
 * mathématique (déplacer M, monter le plan, régler k) reste dans les commandes du lab ET dans `stage.draggable`.
 * `prefers-reduced-motion` : l'amortissement de l'orbite est coupé ; les animations du lab (remplissage…) le lisent aussi.
 */
const KEY_DEG = 12;

export const prefersReducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function Stage3D({
  build, state, fallback = null, view, target, orbit = true, ariaLabel, className = '', style, onInteract, children,
}) {
  const { t } = useTranslation('lesson');
  const hostRef = useRef(null);
  const stageRef = useRef(null);
  const controllerRef = useRef(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const interactRef = useRef(onInteract);
  interactRef.current = onInteract;
  const initial = useRef({ build, view, target, orbit });
  const [unsupported, setUnsupported] = useState(false);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    let stage;
    try {
      stage = new SpaceStage(host, {
        view: initial.current.view, target: initial.current.target, orbit: initial.current.orbit,
        onInteract: () => interactRef.current?.(),
      });
    } catch {
      setUnsupported(true);
      return undefined;
    }
    if (prefersReducedMotion()) stage.controls.enableDamping = false;
    stageRef.current = stage;
    controllerRef.current = initial.current.build(stage) ?? null;
    controllerRef.current?.update?.(stateRef.current);
    stage.requestRender();
    setReady(true);
    return () => {
      controllerRef.current?.dispose?.();
      controllerRef.current = null;
      stage.dispose();
      stageRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!stageRef.current) return;
    controllerRef.current?.update?.(state);
    stageRef.current.requestRender();
  }, [state]);

  const onKeyDown = (e) => {
    const stage = stageRef.current;
    if (!stage) return;
    const step = e.shiftKey ? KEY_DEG * 2.5 : KEY_DEG;
    const act = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
    if (act) { e.preventDefault(); stage.orbitBy(...act); interactRef.current?.(); }
    if (e.key === 'Home' || e.key === '0') { e.preventDefault(); stage.resetView(); }
  };

  // Tant que la scène WebGL n'existe pas (rendu serveur des tests, WebGL absent), le repli occupe la fenêtre : le lab reste
  // lisible. Dans un navigateur, la scène naît dans un effet de MISE EN PAGE — avant la première peinture : pas de flash.
  return (
    <div className={`relative ${className}`} style={style} data-stage3d data-stage3d-ready={ready ? '' : undefined}>
      <div
        ref={hostRef}
        className="absolute inset-0 overflow-hidden rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
        role={ready ? 'application' : undefined}
        tabIndex={ready ? 0 : -1}
        aria-label={ready ? ariaLabel ?? t('manipulation.stage3d.label') : undefined}
        aria-roledescription={ready ? t('manipulation.stage3d.roleDescription') : undefined}
        onKeyDown={onKeyDown}
        style={{ touchAction: 'none', overscrollBehavior: 'contain', cursor: orbit && ready ? 'grab' : undefined, display: unsupported ? 'none' : undefined }}
        data-stage3d-host
      />
      {!ready && <div className="absolute inset-0 flex items-center justify-center" data-stage3d-fallback>{fallback}</div>}
      {orbit && ready && (
        <button
          type="button"
          onClick={() => stageRef.current?.resetView()}
          className="absolute end-2 top-2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow ring-1 ring-slate-200 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
          aria-label={t('manipulation.stage3d.resetView')}
          title={t('manipulation.stage3d.resetView')}
          data-stage3d-reset
        >
          <RotateCcw className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
      {children}
    </div>
  );
}
