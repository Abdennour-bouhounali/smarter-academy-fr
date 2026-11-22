import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Maximize2, Minimize2, X } from 'lucide-react';
import { PagingContext } from '../classroom/PagingContext';
import ClassroomPaged from '../classroom/ClassroomPaged';
import { useScrollLock } from '../classroom/useScrollLock';
import { useFullscreen } from '../classroom/useFullscreen';
import FitToArea, { uniformZoom } from './FitToArea';
import { EffectsToggle } from '../components/LessonUI';
import { useEffectsPreference } from '../hooks/useEffectsPreference';
import { InMissionPlayerContext, MissionUnitNavContext, MissionAreaContext, MissionAdvanceContext } from './missionPlayerContext';
import './mission.css';

/** La part de la zone qu'une page a le droit de prendre : le reste va à l'en-tête d'étape, hors du découpage. */
const PAGE_SHARE = 0.86;
/** Un labo s'agrandit moins qu'un texte : ses gestes et sa scène sont déjà à la bonne taille. */
const LAB_MAX_GROW = 1.3;

/**
 * LE LECTEUR DE MISSION (étape 2, 2026-11-04) — la leçon jouée dans une FENÊTRE PLEINE, sans aucun défilement (règle du
 * propriétaire). Une fenêtre CSS (porté dans <body>, la barre latérale s'efface) ; le plein écran du navigateur est une
 * option (Échap ne casse rien). En haut : la mission (`top`) et le titre ; au milieu : le contenu, que ContentModule
 * joue UNE UNITÉ à la fois, ClassroomPaged découpe en pages (PagingContext, SANS le mode classe) et FitToArea fait tenir ;
 * en bas : précédent · position · suivant. Les gestes du module (terminer, module suivant) viennent de ModuleLayout
 * (`moduleNav`) : le lecteur n'écrit rien lui-même.
 *
 * props : top, title, more (pli « المزيد » du titre), exitTo, exitLabel, moduleNav { prevLink?, next? (nœud) } | null.
 */
export default function MissionPlayer({ top, title, more, exitTo, exitLabel, moduleNav = null, children }) {
  const { t } = useTranslation('lesson');
  const root = useRef(null);
  const area = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [unitNav, setUnitNav] = useState(null);
  // Une page de module SANS unités déclarées (أستعدّ, le test final) : le lecteur la découpe lui-même en pages.
  // ClassroomPaged est TOUJOURS rendu (actif ou non) : l'arbre ne change pas, rien ne se remonte.
  const ownPaging = Boolean(moduleNav) && !unitNav;
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  // le zoom courant de FitToArea : le découpage mesure les blocs à leur taille NATURELLE (hauteur ÷ zoom)
  const [fitZoom, setFitZoom] = useState(1);
  const { pathname } = useLocation();
  const fullscreen = useFullscreen(root);
  const effects = useEffectsPreference();
  useScrollLock(true);

  useLayoutEffect(() => {
    const el = area.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const read = () => { const r = el.getBoundingClientRect(); setSize({ width: Math.round(r.width), height: Math.round(r.height) }); };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // UNE taille pour toute la leçon (hors labo, qui occupe tout son espace) : les éléments semblables ont la même taille partout
  const isLab = unitNav?.kind === 'intro';
  const baseZoom = isLab ? undefined : uniformZoom(size.width, size.height);
  const paging = useMemo(() => ({
    // `onePerPage` : UN élément par écran (propriétaire, 2026-11-04) — une question, une carte, une définition.
    isClassroomMode: true, scale: fitZoom, userScale: baseZoom ?? 1, area: { width: size.width, height: Math.round(size.height * PAGE_SHARE) }, deepBlocks: true, onePerPage: true,
  }), [size.width, size.height, fitZoom, baseZoom]);

  // Précédent / suivant : d'abord dans le module (unités, pages), puis le module voisin.
  const ownPages = ownPaging && pageCount > 1;
  const inModulePrev = unitNav?.onPrevious ?? (ownPages && page > 0 ? () => setPage(page - 1) : undefined);
  const inModuleNext = unitNav?.onNext ?? (ownPages && page < pageCount - 1 ? () => setPage(page + 1) : undefined);
  const canNext = unitNav ? unitNav.canNext : true;
  const dots = unitNav ?? (ownPages ? { index: page, count: pageCount, page: 0, pageCount: 1 } : null);
  const btn = 'inline-flex min-h-[48px] items-center gap-2 rounded-2xl px-5 font-black shadow-sm transition-colors';

  return createPortal(
    <InMissionPlayerContext.Provider value>
      <div ref={root} className="fixed inset-0 z-[35] flex flex-col bg-gradient-to-b from-indigo-50 via-white to-sky-50" data-mission-player dir="rtl">
        <style>{'.sa-workspace-sidebar{display:none!important}'}</style>
        <div className="shrink-0 space-y-1 px-6 pt-3">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">{top}</div>
            <span className="shrink-0" data-mission-sound><EffectsToggle enabled={effects.enabled} onToggle={effects.toggle} /></span>
            <button type="button" onClick={() => (fullscreen.isFullscreen ? fullscreen.exit() : fullscreen.request())} data-mission-fullscreen
              aria-label={t(fullscreen.isFullscreen ? 'mission.exitFullscreen' : 'mission.fullscreen')} title={t(fullscreen.isFullscreen ? 'mission.exitFullscreen' : 'mission.fullscreen')}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-900 shadow-sm ring-1 ring-indigo-100 hover:bg-indigo-50">
              {fullscreen.isFullscreen ? <Minimize2 className="h-5 w-5" aria-hidden="true" /> : <Maximize2 className="h-5 w-5" aria-hidden="true" />}
            </button>
            {exitTo && (
              <Link to={exitTo} data-mission-exit aria-label={exitLabel} title={exitLabel}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
                <X className="h-5 w-5" aria-hidden="true" />
              </Link>
            )}
          </div>
          {/* Un labo s'ouvre SANS titre (MANIPULATION_DNA §17.9) : sur l'unité du labo, sa hauteur revient au labo. */}
          {title && unitNav?.kind !== 'intro' && (
            <div className="flex flex-wrap items-center justify-center gap-x-3" data-mission-title>
              <h1 className="text-center font-space text-xl font-extrabold text-slate-900">{title}</h1>
              {more}
            </div>
          )}
        </div>

        <div ref={area} className="relative min-h-0 flex-1 px-6 py-2" data-mission-area>
          <PagingContext.Provider value={paging}>
            <MissionAdvanceContext.Provider value={inModuleNext && canNext ? inModuleNext : null}>
            <MissionUnitNavContext.Provider value={setUnitNav}>
              <MissionAreaContext.Provider value={size}>
                {/* Tout s'AGRANDIT pour occuper l'espace (FitToArea grow) : un texte dans une colonne de lecture (1100 px avant
                    agrandissement), le labo sur TOUTE la largeur (sa mise en page de jeu, ManipulationShell). */}
                {/* `screenKey` : un écran se pose à son arrivée, puis ce qui s'y ajoute ne déplace ni ne rétrécit l'existant */}
                <FitToArea height={size.height} grow maxGrow={unitNav?.kind === 'intro' ? LAB_MAX_GROW : undefined} onZoom={setFitZoom} fixedZoom={baseZoom}
                  screenKey={`${pathname}:${dots?.index ?? 0}:${dots?.page ?? 0}`}>
                  <ClassroomPaged active={ownPaging} page={page} onPages={setPageCount} onRestructure={() => setPage(0)} className={`mx-auto w-full ${unitNav?.kind === 'intro' ? '' : 'max-w-[1100px]'}`}>
                    {children}
                  </ClassroomPaged>
                </FitToArea>
              </MissionAreaContext.Provider>
            </MissionUnitNavContext.Provider>
            </MissionAdvanceContext.Provider>
          </PagingContext.Provider>
        </div>

        {moduleNav && (
          // `pe-48` : le coin bas-gauche garde « كرّاسي / بطاقاتي » (boutons flottants de la leçon) accessibles.
          <nav className="flex shrink-0 items-center justify-between gap-4 border-t border-indigo-100 bg-white/85 py-2.5 ps-6 pe-48 backdrop-blur" data-mission-nav>
            {inModulePrev ? (
              <button type="button" onClick={inModulePrev} data-mission-prev className={`${btn} bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50`}>
                <ArrowRight className="h-4 w-4" aria-hidden="true" /> {t('mission.prev')}
              </button>
            ) : moduleNav.prevLink ? (
              <Link to={moduleNav.prevLink} data-mission-prev className={`${btn} bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50`}>
                <ArrowRight className="h-4 w-4" aria-hidden="true" /> {t('mission.prevModule')}
              </Link>
            ) : <span />}

            {dots && dots.count > 1 && (
              <span className="flex items-center gap-1.5" aria-label={t('mission.position', { n: dots.index + 1, total: dots.count })} data-mission-dots>
                {Array.from({ length: dots.count }, (_, i) => (
                  <span key={i} className={`h-2.5 rounded-full transition-all motion-reduce:transition-none ${i === dots.index ? 'w-7 bg-indigo-600' : i < dots.index ? 'w-2.5 bg-indigo-300' : 'w-2.5 bg-slate-200'}`} />
                ))}
                {dots.pageCount > 1 && <span className="ms-2 text-xs font-bold text-slate-500" dir="rtl">{t('mission.page', { n: dots.page + 1, total: dots.pageCount })}</span>}
              </span>
            )}

            {inModuleNext ? (
              <button type="button" onClick={inModuleNext} disabled={!canNext} data-mission-next
                className={`${btn} bg-indigo-600 text-white enabled:hover:bg-indigo-700 disabled:opacity-40 ${unitNav?.canNext ? 'sa-mission-ready' : ''}`}>
                {unitNav?.nextLabel ?? t('mission.next')} <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (moduleNav.next ?? <span />)}
          </nav>
        )}
      </div>
    </InMissionPlayerContext.Provider>,
    document.body,
  );
}
