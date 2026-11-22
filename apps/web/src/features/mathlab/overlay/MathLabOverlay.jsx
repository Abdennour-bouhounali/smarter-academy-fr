import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Maximize2, Minimize2, X } from 'lucide-react';
import { ArrowBack } from '../../../components/common/DirectionalIcons';
import { useFullscreen } from '../../../lessons/common/classroom/useFullscreen';
import { MATH_LAB_TOOLS, getMathLabTool } from '../toolRegistry';
import { useMathLabOverlay } from './MathLabOverlayProvider.jsx';
import { PICKER, escapeAction, fullscreenAction } from './overlayState.js';
import MathLabToolPicker from './MathLabToolPicker.jsx';
import FeatureLockedPanel from '../../../components/access/FeatureLockedPanel';
import { useFeatureAccess } from '../../../hooks/useFeatureAccess';
import { featureState, isToolVisible, toolFeatureKey } from '../../access/featureAccess';
import {
  isLabScope, readRememberedLabScope, rememberLabScope, resolveToolScope, toolCapabilities,
} from '../labScope';
import './mathLabOverlay.css';

// Un composant paresseux par instrument, créé UNE fois — `lazy()` appelé au
// rendu recréerait le composant et REMONTERAIT l'outil à chaque rendu (même
// règle que MathLabToolPage).
const lazyComponents = new Map();
function lazyToolComponent(tool) {
  if (!lazyComponents.has(tool.id)) lazyComponents.set(tool.id, lazy(tool.load));

  return lazyComponents.get(tool.id);
}

/**
 * LE CALQUE : le مختبر posé sur la leçon, sans la quitter.
 *
 * Il rend soit le SÉLECTEUR (choisir un instrument), soit un instrument. La
 * leçon reste montée dessous — c'est tout l'intérêt (voir le fournisseur).
 *
 * ── Plein écran (§3 du brief) ────────────────────────────────────────────
 * Le bouton demande le VRAI plein écran du navigateur sur la racine du
 * calque, via `useFullscreen` — le même hook que وضع القسم, parce qu'il n'y
 * a qu'une implémentation de l'API Fullscreen dans la plateforme, et qu'un
 * hook ne porte aucune permission. Si le navigateur refuse ou n'a pas d'API
 * (Safari iOS), on retombe sur un plein écran APPLICATIF : le calque est
 * déjà `position: fixed; inset: 0`, donc il n'y a rien à faire de plus que
 * marquer l'état — et l'élève garde un écran entier.
 *
 * Le plein écran ne DÉMONTE rien : c'est le même élément qui passe en plein
 * écran et en sort, donc l'état de l'instrument (§10) traverse la bascule.
 *
 * Ce plein écran est ouvert à TOUS — élève comme enseignant. Il n'est pas
 * « وضع القسم », qui garde ses permissions (canPresentClassroom) et n'est
 * pas touché par ce fichier.
 *
 * ── Un document ÉPHÉMÈRE ─────────────────────────────────────────────────
 * Ouvrir le مختبر depuis une leçon ne crée RIEN en base (même règle que le
 * cahier). L'instrument travaille sur un état neuf en mémoire ; « أعمالي »
 * ne se peuple que depuis le مختبر lui-même (/espace/atelier), où le
 * document a une identité. Un brouillon d'exploration n'est pas un travail.
 */
export default function MathLabOverlay() {
  const { t } = useTranslation('mathlab');
  const { tool: toolId, close, pick, backToPicker, scope: requestedScope, setScope } = useMathLabOverlay();
  // Le مخبر du calque : celui de la leçon, sinon le dernier choisi, sinon
  // le collège — la plateforme est d'abord celle de 4AM.
  const labScope = isLabScope(requestedScope) ? requestedScope : (readRememberedLabScope() ?? 'moyen');
  const chooseLab = useCallback((next) => {
    rememberLabScope(next);
    setScope(next);
  }, [setScope]);
  const rootRef = useRef(null);
  const { supported, isFullscreen, request, exit } = useFullscreen(rootRef);
  // Le repli applicatif : demandé, mais refusé (ou pas d'API).
  const [appFullscreen, setAppFullscreen] = useState(false);
  const wide = isFullscreen || appFullscreen;

  const isPicking = toolId === PICKER;
  const tool = isPicking ? null : getMathLabTool(toolId);

  const toggleFullscreen = useCallback(async () => {
    switch (fullscreenAction({ wide, supported })) {
      case 'exit':
        setAppFullscreen(false);
        await exit();
        break;
      case 'requestBrowser': {
        // Refus (politique d'iframe, pas de geste utilisateur) : le calque
        // prend l'écran quand même. L'élève a demandé de la place, il en
        // obtient.
        const accepted = await request();
        if (!accepted) setAppFullscreen(true);
        break;
      }
      default:
        setAppFullscreen(true);
    }
  }, [wide, exit, supported, request]);

  // L'état RÉEL fait foi : F11, Échap système ou le geste du navigateur
  // sortent du plein écran sans passer par le bouton. Quand le document en
  // sort, le repli applicatif n'a plus lieu d'être non plus.
  useEffect(() => {
    if (!isFullscreen && !appFullscreen) return undefined;
    if (isFullscreen) setAppFullscreen(false);

    return undefined;
  }, [isFullscreen, appFullscreen]);

  // Échap : sortir du plein écran d'abord, fermer ensuite — une touche, un
  // niveau. En plein écran NATIF, le navigateur consomme Échap lui-même et
  // l'événement ne nous parvient pas : `isFullscreen` retombe et le prochain
  // Échap ferme. C'est le comportement attendu des deux côtés.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      switch (escapeAction({ appFullscreen, browserFullscreen: isFullscreen })) {
        case 'exitAppFullscreen': setAppFullscreen(false); break;
        case 'exitBrowserFullscreen': exit(); break;
        default: close();
      }
    };
    const root = rootRef.current;
    root?.addEventListener('keydown', onKeyDown);

    return () => root?.removeEventListener('keydown', onKeyDown);
  }, [appFullscreen, isFullscreen, exit, close]);

  // Le défilement de la PAGE est verrouillé pendant que le calque est
  // ouvert : la leçon est dessous, elle ne doit pas défiler sous le doigt.
  // On restaure exactement la valeur inline précédente (même règle que
  // useScrollLock, qu'on ne réutilise pas ici pour ne pas poser la classe
  // `sa-classroom-session`, qui appartient à وضع القسم).
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const html = document.documentElement;
    const body = document.body;
    const previous = { html: html.style.overflow, body: body.style.overflow };
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';

    return () => {
      html.style.overflow = previous.html;
      body.style.overflow = previous.body;
    };
  }, []);

  // Le focus entre dans le calque à l'ouverture : au clavier, on ne doit pas
  // rester derrière, dans la leçon. Le retour du focus à l'ouvrant est géré
  // par le fournisseur, à la fermeture.
  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  // Le piège à Tab : un calque modal ne laisse pas tabuler dans la leçon.
  const onKeyDownCapture = useCallback((event) => {
    if (event.key !== 'Tab') return;
    const root = rootRef.current;
    if (!root) return;
    const focusable = root.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (!event.shiftKey && active === last) { event.preventDefault(); first.focus(); }
    if (event.shiftKey && (active === first || active === root)) { event.preventDefault(); last.focus(); }
  }, []);

  const title = isPicking ? t('overlay.pickTitle') : t(tool?.labelKey ?? 'title');
  const openScope = tool ? resolveToolScope(tool, { requested: labScope }) : null;

  return (
    <div
      ref={rootRef}
      className={`sa-mlo${wide ? ' sa-mlo--wide' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabIndex={-1}
      onKeyDownCapture={onKeyDownCapture}
      data-ml-overlay={isPicking ? 'picker' : tool?.id}
      data-ml-overlay-fullscreen={wide ? (isFullscreen ? 'browser' : 'app') : undefined}
    >
      <header className="sa-mlo__bar">
        {!isPicking && (
          <button
            type="button"
            className="sa-mlo__btn sa-mlo__btn--icon"
            onClick={backToPicker}
            aria-label={t('overlay.backToTools')}
            title={t('overlay.backToTools')}
            data-ml-overlay-back
          >
            <ArrowBack size={18} aria-hidden="true" />
          </button>
        )}

        <h2 className="sa-mlo__title sa-mlo__title--lead">
          {tool?.icon && <tool.icon size={18} className="text-blue-500 flex-shrink-0" aria-hidden="true" />}
          <span className="sa-mlo__titletext">{title}</span>
          {openScope && (
            <span className={`sa-ml-scope-badge sa-ml-scope-badge--${openScope}`} data-ml-scope-badge={openScope}>
              {t(`labs.${openScope}.short`)}
            </span>
          )}
        </h2>

        <div className="sa-mlo__actions">
          <button
            type="button"
            className="sa-mlo__btn sa-mlo__btn--icon"
            onClick={toggleFullscreen}
            aria-pressed={wide}
            aria-label={wide ? t('overlay.fullscreenExit') : t('overlay.fullscreenEnter')}
            title={wide ? t('overlay.fullscreenExit') : t('overlay.fullscreenEnter')}
            data-ml-overlay-fullscreen-toggle
          >
            {wide ? <Minimize2 size={18} aria-hidden="true" /> : <Maximize2 size={18} aria-hidden="true" />}
          </button>

          <button
            type="button"
            className="sa-mlo__btn sa-mlo__btn--close"
            onClick={close}
            aria-label={t('overlay.close')}
            title={t('overlay.close')}
            data-ml-overlay-close
          >
            <X size={18} aria-hidden="true" />
            <span className="sa-mlo__btnlabel">{t('overlay.close')}</span>
          </button>
        </div>
      </header>

      <div className="sa-mlo__body">
        {isPicking
          ? <OverlayPicker onPick={pick} scope={labScope} onScope={chooseLab} />
          : <ToolHost tool={tool} scope={labScope} />}
      </div>
    </div>
  );
}

/**
 * L'instrument dans le calque : son composant, sur un état NEUF tenu ici.
 *
 * Il reçoit le même contrat que dans la page (`initialData`, `onChange`,
 * `onReady`), moins ce qui n'a pas de sens sans document enregistré : pas de
 * pièces jointes, pas de sauvegarde. `onChange` garde l'état en mémoire pour
 * que la bascule plein écran — un simple re-rendu — ne reparte pas de zéro.
 */
/**
 * Le sélecteur, filtré par « الوصول والحدود » comme l'accueil : un instrument
 * coupé n'est pas proposé, un instrument fermé au palier porte son cadenas.
 */
function OverlayPicker({ onPick, scope, onScope }) {
  const { summary } = useFeatureAccess();
  const tools = MATH_LAB_TOOLS.filter((tool) => isToolVisible(summary, tool.id));
  const lockedIds = tools.filter((tool) => !featureState(summary, toolFeatureKey(tool.id)).allowed).map((tool) => tool.id);

  return <MathLabToolPicker tools={tools} lockedIds={lockedIds} onPick={onPick} scope={scope} onScope={onScope} />;
}

function ToolHost({ tool, scope }) {
  const { summary } = useFeatureAccess();
  const access = featureState(summary, toolFeatureKey(tool.id));
  // Dans le calque, rien n'est enregistré : cette porte est de l'interface
  // seulement (le code de l'instrument est dans le navigateur). Ce que le
  // serveur protège — enregistrer, rouvrir, copier — est refusé en 403.
  if (access.known && !access.allowed) {
    return <div className="sa-page py-8"><FeatureLockedPanel reason={access.reason} /></div>;
  }

  // Le مخبر où l'instrument s'ouvre : celui du sélecteur, s'il y existe
  // (راسم الدوال au collège), le sien sinon (التحليل : le ثانوي).
  const toolScope = resolveToolScope(tool, { requested: scope });

  return <ToolHostOpen key={`${tool.id}:${toolScope ?? 'common'}`} tool={tool} scope={toolScope} />;
}

function ToolHostOpen({ tool, scope }) {
  const { t } = useTranslation('mathlab');
  const ToolComponent = useMemo(() => lazyToolComponent(tool), [tool]);
  // L'état de départ est figé à la PREMIÈRE ouverture de cet instrument :
  // `initialData` n'est lu qu'au montage par les outils, et le relire depuis
  // l'état courant à chaque rendu n'apporterait rien. On le garde néanmoins
  // ici pour que le composant reste monté d'un rendu à l'autre (bascule
  // plein écran) sans repartir d'une scène vierge.
  const capabilities = useMemo(() => toolCapabilities(tool, scope), [tool, scope]);
  const initial = useRef(null);
  if (initial.current === null) initial.current = tool.createInitialData(undefined, { scope, capabilities });

  return (
    <Suspense
      fallback={(
        <div className="sa-mlo__placeholder" aria-busy="true" data-ml-overlay-loading>
          <Loader2 size={22} className="animate-spin text-blue-500" aria-hidden="true" />
          <span>{t('shell.loading')}</span>
        </div>
      )}
    >
      <ToolComponent
        initialData={initial.current}
        title={t(tool.defaultTitleKey)}
        onChange={NOOP}
        onReady={NOOP}
        scope={scope}
        capabilities={capabilities}
      />
    </Suspense>
  );
}

const NOOP = () => {};
