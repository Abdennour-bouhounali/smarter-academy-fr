import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Compass, FileText, Expand, ChevronUp, ChevronDown, Columns2 } from 'lucide-react';
import { useLessonViewport } from './useLessonViewport';
import { IS_RTL } from '../../../locale.js';
import { useWorkspaceLayout } from '../../../context/WorkspaceLayoutContext';
import { buildStructure, progressionByModule } from './knowledgeStructure';
import ConceptVisual from './ConceptVisual';
import { useLessonKnowledge } from './KnowledgeProvider';
import { Link } from 'react-router-dom';
import { getLessonById } from '@smarter-academy/core';
import { getLoadedLessonConfig, getModulePath } from '../../registry';
import { useLearningProfile } from '../hooks/useLearningProfile';
import { MASTERY_STATES, masteryTooltip } from '../components/LearningPointMastery';
import { moduleMasteryOverlay } from './knowledgeMastery';
import { resolveGraph } from './progressive/graphModel';
import MathLabel from '../components/MathLabel';

// CARTE PROGRESSIVE — la carte de connaissances de toutes les leçons
// (KNOWLEDGE_MAP.md, Part A). Chargée à part, à l'ouverture de la carte.
const ProgressiveKnowledgeMap = lazy(() => import('./progressive/ProgressiveKnowledgeMap'));
// Sa lecture linéaire « المعارف مفصّلة » (écran ET impression).
const LinearKnowledgeView = lazy(() => import('./progressive/LinearKnowledgeView'));

/**
 * Le graphe que la carte affiche — TOUJOURS la carte mentale interactive (propriétaire, 2026-11-08 : l'ancienne carte par
 * strates — ses vues « navigation », détail d'item / de catégorie et sa fiche d'impression — est supprimée). Le KNOWLEDGE_GRAPH
 * de la leçon s'il est valide, sinon le REPLI dérivé de ses items (graphFromKnowledge) : jamais une carte vide.
 */
function useProgressiveGraph() {
  const { t } = useTranslation('lesson');
  const { graph, knowledge } = useLessonKnowledge();
  const sequenceLabel = t('map.progressive.fallbackSequence');
  return React.useMemo(
    () => resolveGraph(graph, knowledge, { sequenceLabel }),
    [graph, knowledge, sequenceLabel],
  );
}

/*
 * RTL (ar-DZ — src/locale.js) : le panneau vit sur le bord de FIN de la zone
 * de contenu — la droite en LTR, la GAUCHE sous RTL (la barre latérale occupe
 * alors la droite). Tout ce qui dépend du bord est dérivé en UN endroit par
 * cas : les trois géométries (tiroir / colonne / plein), le sens d'entrée
 * (`x`), le calcul de la poignée, et des utilitaires logiques pour les bords
 * (`border-s`, `rounded-es-*`, `start-6`). `useLessonViewport` mesure la
 * boîte de padding de <main>, elle-même miroitée en CSS (index.css) : la
 * mesure ne suppose jamais un côté.
 */

/* ─────────────────────────────────────────────────────────────────────────
   PRINT STYLES
   Injected once into <head>. Panel is portalled to body, so:
   body > *:not(#km-root) { display:none } isolates the panel perfectly.
   ───────────────────────────────────────────────────────────────────────── */
const PRINT_CSS = `
@media print {
  @page { 
    size: A4 portrait; 
    margin: 12mm 14mm; 
  }

  /* Force color printing if possible */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Base typography. Cairo carries the Arabic glyphs (master spec §14,
     index.css) — added here so printed Arabic content doesn't fall back to
     a system font; Latin identity fonts stay first for Latin runs. */
  html, body {
    font-family: "Avenir Next", "Inter", "Cairo", "Segoe UI", system-ui, sans-serif !important;
    background: #fff !important;
    color: #172033 !important;
  }

  /* Hide everything except the knowledge-map panel */
  body > *:not(#km-root) { display: none !important; }

  /* Reset the panel to a static document */
  #km-root {
    display: block !important;
    position: static !important;
    inset: unset !important;
    width: 100% !important;
    max-width: 100% !important;
    max-height: none !important;
    height: auto !important;
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    overflow: visible !important;
    transform: none !important;
    opacity: 1 !important;
    background: #fff !important;
  }

  /* Hide all interactive chrome */
  [data-km-noprint] { display: none !important; }

  /* Show PrintView, hide screen views */
  .sa-screen-view { display: none !important; }
  .sa-print-view { display: block !important; }

  /* Logical print breaks */
  .print-section, .print-card, .print-example, .print-equation-group {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  
  h1, h2, h3, .print-avoid-break-after {
    break-after: avoid;
    page-break-after: avoid;
  }

  /* Remove scrollbars and padding overrides */
  .sa-print-view {
    overflow: visible !important;
    max-height: none !important;
    height: auto !important;
    padding: 0 !important;
  }

  /* Clean up pre-styled interactive components inside print view */
  .sa-print-body div[class*="bg-"],
  .sa-print-hero-body div[class*="bg-"] {
    background-color: transparent !important;
    border: none !important;
    padding: 0 0 4px 0 !important;
    text-align: start !important;
    box-shadow: none !important;
  }
  .sa-print-hero-body div[class*="text-center"] {
    text-align: start !important;
  }
  .sa-print-body p, .sa-print-body div, .sa-print-body span {
    font-size: 9pt !important;
  }
  .sa-print-hero-body p, .sa-print-hero-body div, .sa-print-hero-body span {
    font-size: 10pt !important;
  }
  .sa-print-view .text-xs { font-size: 8pt !important; }
  .sa-print-view .text-sm { font-size: 9pt !important; }
  .sa-print-view .text-lg { font-size: 11pt !important; }
  .sa-print-view .text-xl { font-size: 12pt !important; }
}
`;

/* ─────────────────────────────────────────────────────────────────────────
   CATEGORIES & THEME
   ───────────────────────────────────────────────────────────────────────── */

// `labelKey` (et non `label`) : l'interface élève est arabe, et la carte est
// l'une des surfaces que le programme exige de rendre en RTL. Le libellé est
// résolu AU RENDU par i18n (locales/ar/lesson.json → map.categories.*), pas
// figé ici.
export const CATEGORIES = [
  { id: 'concepts',    emoji: '🔵', labelKey: 'map.categories.concepts',    color: 'blue' },
  { id: 'regles',      emoji: '🟠', labelKey: 'map.categories.regles',      color: 'orange' },
  { id: 'methodes',    emoji: '🟢', labelKey: 'map.categories.methodes',    color: 'green' },
  { id: 'vocabulaire', emoji: '🟣', labelKey: 'map.categories.vocabulaire', color: 'purple' },
  { id: 'memoriser',   emoji: '🔴', labelKey: 'map.categories.memoriser',   color: 'red' },
  { id: 'formules',    emoji: '🧮', labelKey: 'map.categories.formules',    color: 'indigo' },
];

export const CAT_THEME = {
  blue:   { hdr: 'bg-blue-50 text-blue-700 border-blue-200',     card: 'border-blue-100 bg-blue-50/40',     badge: 'bg-blue-100 text-blue-700' },
  orange: { hdr: 'bg-orange-50 text-orange-700 border-orange-200', card: 'border-orange-100 bg-orange-50/40', badge: 'bg-orange-100 text-orange-700' },
  green:  { hdr: 'bg-emerald-50 text-emerald-700 border-emerald-200', card: 'border-emerald-100 bg-emerald-50/40', badge: 'bg-emerald-100 text-emerald-700' },
  purple: { hdr: 'bg-violet-50 text-violet-700 border-violet-200', card: 'border-violet-100 bg-violet-50/40', badge: 'bg-violet-100 text-violet-700' },
  red:    { hdr: 'bg-rose-50 text-rose-700 border-rose-200',     card: 'border-rose-100 bg-rose-50/40',     badge: 'bg-rose-100 text-rose-700' },
  indigo: { hdr: 'bg-indigo-50 text-indigo-700 border-indigo-200', card: 'border-indigo-100 bg-indigo-50/40', badge: 'bg-indigo-100 text-indigo-700' },
};

/* ─────────────────────────────────────────────────────────────────────────
   KNOWLEDGE DATA
   ─────────────────────────────────────────────────────────────────────────
   Les items ne vivent plus ici : ../knowledge.jsx déclare l'apport de CHAQUE
   module, knowledgeState.js les cumule selon la progression, et le tiroir
   reçoit le résultat par la prop `items` (cf. KnowledgeProvider.jsx).
   Forme attendue : { id, type, title, summary, visual?, body, module?, isNew? }.
   ───────────────────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────────────────
   NAVIGATION VIEW
   Always-visible category grid → click item → detail slide-in
   ───────────────────────────────────────────────────────────────────────── */

const STRATUM_ACCENT = {
  blue:   { rule: 'bg-blue-400',    label: 'text-blue-700' },
  orange: { rule: 'bg-orange-400',  label: 'text-orange-700' },
  green:  { rule: 'bg-emerald-400', label: 'text-emerald-700' },
};

/* ─────────────────────────────────────────────────────────────────────────
   FIL « بطاقتك » + SURCOUCHE DE MAÎTRISE (Mastery V2, phase 8c)
   La VISIBILITÉ des items reste pilotée par la complétion ; la maîtrise
   n'ajoute que des pastilles à côté de chaque module (les points qu'il
   enseigne) et, pour une lacune dans un module parcouru, « راجع ». Rien de
   tout cela ne part à l'impression (data-km-noprint).
   ───────────────────────────────────────────────────────────────────────── */
const MASTERY_DOT_TONE = { slate: 'bg-slate-300', rose: 'bg-rose-500', amber: 'bg-amber-400', emerald: 'bg-emerald-500' };

function ProgressionStrip({ steps }) {
  const { lessonId } = useLessonKnowledge();
  const config = lessonId ? getLoadedLessonConfig(lessonId) : null;
  const teaches = config?.modules?.some((m) => m.teachesLearningPointIds?.length);
  // Le profil n'est lu que pour une leçon qui déclare ce qu'enseignent ses
  // modules : sinon, le fil reste exactement celui d'avant.
  return teaches
    ? <MasteryAwareStrip steps={steps} lessonId={lessonId} config={config} />
    : <StripBase steps={steps} overlay={null} />;
}

function MasteryAwareStrip({ steps, lessonId, config }) {
  const { unlockedModules } = useLessonKnowledge();
  const { profile, status } = useLearningProfile({ lesson: lessonId });
  const overlay = React.useMemo(() => {
    if (status !== 'ready' || !profile) return null;
    const rowsByCode = new Map(
      (profile.currentMastery ?? []).flatMap((g) => (g.lessons ?? []).flatMap((l) => l.learningPoints ?? []))
        .map((row) => [row.code ?? row.learningPointCode, row]),
    );
    const titles = new Map((getLessonById(lessonId)?.learningPoints ?? []).map((lp) => [lp.id, lp.title]));
    const byModule = moduleMasteryOverlay({
      moduleNumbers: steps.map((s) => s.module),
      modules: config.modules,
      rowsByCode,
      completedModules: unlockedModules,
      modulePath: (n) => getModulePath(lessonId, n),
    });
    for (const entry of byModule.values()) {
      for (const dot of entry.dots) dot.title = dot.row?.title || titles.get(dot.code) || dot.code;
    }
    return byModule;
  }, [status, profile, steps, config, unlockedModules, lessonId]);

  return <StripBase steps={steps} overlay={overlay} />;
}

function StripBase({ steps, overlay }) {
  const { t } = useTranslation('lesson');
  return (
    <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 flex-wrap" data-km-progression="true">
      <span className="text-[10px] text-slate-400 me-1">{t('map.yourMapColon')}</span>
      {steps.map((s, i) => {
        const mastery = overlay?.get(s.module) ?? null;
        return (
          <React.Fragment key={s.module}>
            {i > 0 && <span className="text-slate-200 text-[10px]" aria-hidden="true">→</span>}
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">
              {t('map.stepChip', { module: s.module })}<span className="text-slate-300" dir="ltr"> +{s.count}</span>
              {mastery && (
                <span className="inline-flex items-center gap-0.5 ms-0.5" data-km-noprint="true" data-km-mastery={s.module} aria-label={t('map.masteryOverlayAria', { module: s.module })}>
                  {mastery.dots.map((d) => {
                    const tip = `${d.title} — ${masteryTooltip(d.state, d.row)}`;
                    const tone = MASTERY_STATES[d.state]?.tone ?? 'slate';
                    return (
                      <span
                        key={d.code}
                        className={`inline-block h-2 w-2 rounded-full ${MASTERY_DOT_TONE[tone]}`}
                        title={tip}
                        role="img"
                        aria-label={tip}
                        data-mastery-state={d.state}
                      />
                    );
                  })}
                </span>
              )}
            </span>
            {mastery?.reviewPath && (
              <Link
                to={mastery.reviewPath}
                className="text-[10px] font-bold text-rose-700 hover:text-rose-900 underline underline-offset-2"
                aria-label={t('map.reviewModuleAria', { module: s.module })}
                data-km-noprint="true"
                data-km-review={s.module}
              >
                {t('map.reviewModuleShort')}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   COMPLETE VIEW
   Flat, always-visible revision document. Optimised for A4 print.
   ───────────────────────────────────────────────────────────────────────── */

function CompleteCard({ item, catColor }) {
  const { t } = useTranslation('lesson');
  const theme = CAT_THEME[catColor];
  // Volontairement SANS encadré coloré ni ombre : la hiérarchie vient du filet
  // de gauche et de la typographie. Les cartes ne doivent pas dominer la carte.
  return (
    <div className="km-card break-inside-avoid" data-km-item={item.id} data-km-new={item.isNew ? 'true' : undefined} style={{ breakInside: 'avoid' }}>
      <div className="km-card-title font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
        <span>{item.title}</span>
        {item.isNew && <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${theme.badge}`} data-km-noprint="true">{t('map.new')}</span>}
      </div>
      {item.summary && <p className="text-xs text-slate-500 mb-2 leading-snug"><MathLabel><MathLabel>{item.summary}</MathLabel></MathLabel></p>}
      {item.visual && (
        <ConceptVisual size={item.visualSize} context="drawer">
          {item.visual}
        </ConceptVisual>
      )}
      {item.body}
    </div>
  );
}

export function CompleteView({ items, printable = true, columns = 1 }) {
  const { t } = useTranslation('lesson');
  const { highlight, strata } = buildStructure(items);

  return (
    <div data-km-completeview="true" className="space-y-6">

      {/* Print button — hidden in print (and when embedded in a page: print from the drawer) */}
      {printable && <div className="flex justify-end" data-km-noprint="true">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-colors shadow"
        >
          <Printer className="w-3.5 h-3.5" />
          {t('map.printMyMap')}
        </button>
      </div>}

      {/* Strates → catégories → connaissances ; « À retenir » ouvre la colonne */}
      <div style={columns > 1 ? { columnCount: columns, columnGap: '2rem' } : undefined}>
      {highlight.length > 0 && (
        <section className="km-cat-section space-y-2 mb-6 break-inside-avoid" data-km-highlight="true" style={{ breakInside: 'avoid' }}>
          <div className="flex items-baseline gap-2">
            <span className="h-3 w-1 rounded-full bg-rose-400" aria-hidden="true" />
            <h3 className="text-[11px] font-bold tracking-[0.14em] text-rose-700">{t('map.toRetain')}</h3>
            <span className="ms-auto text-[10px] font-mono text-slate-300">{highlight.length}</span>
          </div>
          <div className="ps-3 border-s border-rose-100 space-y-2">
            {highlight.map(item => (
              <CompleteCard key={item.id} item={item} catColor="red" />
            ))}
          </div>
        </section>
      )}

        {strata.map(stratum => {
          const accent = STRATUM_ACCENT[stratum.accent] ?? STRATUM_ACCENT.blue;
          return (
            <section
              key={stratum.id}
              className="km-cat-section mb-6 break-inside-avoid"
              data-km-stratum={stratum.id}
              style={{ breakInside: 'avoid' }}
            >
              <div className="km-cat-title flex items-baseline gap-2 mb-2">
                <span className={`h-3 w-1 rounded-full ${accent.rule}`} aria-hidden="true" />
                <h3 className={`text-[11px] font-bold tracking-[0.14em] ${accent.label}`}>{t(stratum.labelKey)}</h3>
                <span className="text-[10px] text-slate-400">{t(stratum.captionKey)}</span>
                <span className="ms-auto text-[10px] font-mono text-slate-300">{stratum.count}</span>
              </div>

              <div className="ps-3 border-s border-slate-100 space-y-3">
                {stratum.groups.map(g => (
                  <div key={g.category.id} data-km-group={g.category.id} className="space-y-2">
                    {stratum.groups.length > 1 && (
                      <div className="text-[10px] font-semibold tracking-widest text-slate-400">
                        {t(g.category.labelKey)}
                      </div>
                    )}
                    {g.items.map(item => (
                      <CompleteCard key={item.id} item={item} catColor={g.category.color} />
                    ))}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {printable && <div className="pt-2 text-center text-[10px] text-slate-300 font-mono" data-km-noprint="true">
        Smarter Academy · Prototype
      </div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN PANEL
   Receives mode + onModeChange from KnowledgeMapTrigger.
   ───────────────────────────────────────────────────────────────────────── */

export default function KnowledgeMap({ items = [], isOpen, onClose, mode, onModeChange, printTitle, printSubject, expanded = false, onExpandedChange }) {
  const { t } = useTranslation('lesson');
  // Mode colonne : la coquille a DÉJÀ rétréci le contenu et réservé une
  // gouttière à droite. La carte n'a donc rien à pousser — elle se pose dans
  // la place qu'on lui a faite (cf. WorkspaceLayoutContext).
  const { isPrior, priorAvailable, setPrior, maCarteWidth, setMapExpanded } = useWorkspaceLayout();

  // La coquille doit savoir que le plein écran est actif pour LIBÉRER la
  // gouttière de la colonne : sans cela le rectangle de la leçon reste amputé
  // et la carte s'arrête avant le bord droit de l'écran.
  useEffect(() => {
    setMapExpanded(isOpen && expanded);
    return () => setMapExpanded(false);
  }, [isOpen, expanded, setMapExpanded]);
  const [minimized, setMinimized] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Resize State
  const [width, setWidth] = useState(() => {
    try {
      const stored = localStorage.getItem('knowledgeMapWidth');
      if (stored) return parseInt(stored, 10);
    } catch { /* noop */ }
    return 400; // default width
  });
  const [isDragging, setIsDragging] = useState(false);

  // Vrai le temps de la première image après l'ouverture (cf. `style` plus bas).
  const [justOpened, setJustOpened] = useState(true);

  // Géométrie du viewport de la leçon (header + sidebar + barre basse mesurés).
  // En mode plein, la carte occupe EXACTEMENT ce rectangle.
  const viewport = useLessonViewport(isOpen);
  const { top: vpTop, left: vpLeft, right: vpRight, width: vpWidth, height: vpHeight,
          viewportWidth: vpOuter, ready: vpReady } = viewport;


  // Les deux géométries, en valeurs NUMÉRIQUES pour que framer-motion puisse
  // interpoler entre elles (d'où `left` plutôt que `right` : une seule origine).
  const drawerW = Math.min(width, vpWidth || width);
  const drawerGeom = {
    top: vpTop,
    // Bord de FIN du viewport de la leçon : à droite en LTR, à gauche en RTL.
    left: IS_RTL ? vpLeft : Math.max(vpLeft, (vpOuter || 0) - vpRight - drawerW),
    width: drawerW,
    height: minimized ? 56 : vpHeight,
  };
  // COLONNE — le <main> réserve `maCarteWidth` à sa droite ; `vpRight` vaut
  // donc cette largeur, et la colonne est exactement l'espace entre le bord
  // droit du contenu et celui de la fenêtre. Aucune constante en double : la
  // même valeur sert à réserver et à occuper.
  const priorGeom = {
    top: vpTop,
    left: IS_RTL ? 0 : Math.max(0, (vpOuter || 0) - maCarteWidth),
    width: maCarteWidth,
    height: vpHeight,
  };
  // PLEIN ÉCRAN — la géométrie ne peut PAS être lue sur <main> pendant la
  // bascule depuis la colonne : la coquille ne libère sa gouttière qu'au
  // rendu SUIVANT, si bien que `vpWidth` vaut encore la largeur amputée et que
  // le panneau partait vers la gauche avant de se corriger vers la droite (le
  // « à-coup » visible). On la calcule donc directement : du bord droit de la
  // barre latérale au bord de la fenêtre — deux valeurs qui, elles, sont
  // justes dès la première image.
  const expandedGeom = {
    top: vpTop,
    // Du bord de la barre latérale au bord opposé de la fenêtre.
    left: IS_RTL ? 0 : vpLeft,
    width: IS_RTL ? Math.max(0, (vpOuter || 0) - vpRight) : Math.max(0, (vpOuter || 0) - vpLeft),
    height: vpHeight,
  };

  // Dans le LECTEUR DE MISSION (plein fenêtre, pilote) il n'y a ni barre latérale ni coquille visibles : le plein écran couvre
  // TOUTE la fenêtre (propriétaire, 2026-11-08 : « la carte doit couvrir tout l'écran »), au lieu de s'arrêter au bord de la
  // barre latérale cachée sous le lecteur.
  const inPlayer = isOpen && typeof document !== 'undefined' && Boolean(document.querySelector('[data-mission-player]'));
  const playerGeom = {
    top: 0,
    left: 0,
    width: vpOuter || (typeof window !== 'undefined' ? window.innerWidth : 0),
    height: typeof window !== 'undefined' ? window.innerHeight : vpHeight,
  };
  const geom = expanded ? (inPlayer ? playerGeom : expandedGeom) : isPrior ? priorGeom : drawerGeom;
  const readZoom = expanded && geom.width ? Math.round(Math.min(1.5, Math.max(1.15, geom.width / 900)) * 100) / 100 : 1;

  // Items déjà réduits par la progression (KnowledgeProvider) ; le drapeau
  // `discovered` reste honoré pour un masquage ponctuel.
  const visibleItems = items.filter(item => item.discovered !== false);
  const progressiveGraph = useProgressiveGraph();
  // Le sélecteur « عمود / ملء الشاشة » : segments lisibles, cibles ≥ 44 px au
  // toucher, icône active en indigo. En plein écran, la colonne reste
  // mémorisée dessous (`isPrior`) ; le sélecteur ne marque pourtant qu'UNE
  // option — celle qu'on voit (l'ancien les marquait toutes les deux).
  const columnActive = isPrior && !expanded;
  const viewButtonClass = (active) => [
    'min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-0 inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
    active ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900 hover:bg-white/70',
  ].join(' ');
  const viewIconClass = (active) => `w-4 h-4 shrink-0 ${active ? 'text-indigo-600' : ''}`;
  const ICON_BTN = 'inline-flex items-center justify-center w-11 h-11 sm:w-9 sm:h-9 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400';

  // Reset minimized state when opened
  useEffect(() => {
    if (isOpen) {
      setMinimized(false);
    }
  }, [isOpen]);

  // La carte vient de s'ouvrir : on pose sa géométrie sans transition, puis on
  // rend la main aux transitions dès l'image suivante.
  useEffect(() => {
    if (!isOpen) { setJustOpened(true); return undefined; }
    const id = requestAnimationFrame(() => setJustOpened(false));
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  // « Réduit » n'a de sens que pour le tiroir flottant : en mode plein comme
  // en mode colonne, la carte occupe une place RÉSERVÉE — la replier y
  // laisserait un trou dans la mise en page au lieu de rendre de l'espace.
  useEffect(() => {
    if (expanded || isPrior) setMinimized(false);
  }, [expanded, isPrior]);

  // Filet de sécurité : si la carte se démonte au milieu d'un geste (une
  // navigation pendant le glissement), le drapeau resterait sur <html> et la
  // gouttière ne s'animerait plus jamais.
  useEffect(() => () => document.documentElement.removeAttribute('data-sa-resizing'), []);

  // Persist Width
  useEffect(() => {
    try {
      localStorage.setItem('knowledgeMapWidth', width.toString());
    } catch { /* noop */ }
  }, [width]);

  // Keyboard shortcut
  useEffect(() => {
    if (!isOpen) { setSelectedItem(null); return; }
    const handler = (e) => {
      if (e.key !== 'Escape') return;
      // On revient d'un cran à la fois : détail → plein écran → fermeture.
      if (selectedItem) setSelectedItem(null);
      else if (expanded) onExpandedChange?.(false);
      else onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose, selectedItem, expanded, onExpandedChange]);

  const handleModeChange = useCallback((m) => {
    setSelectedItem(null);
    onModeChange(m);
  }, [onModeChange]);

  // Dragging logic
  const handlePointerDown = useCallback((e) => {
    e.target.setPointerCapture(e.pointerId);
    setIsDragging(true);
    // La coquille coupe l'animation de sa gouttière le temps du geste, sinon
    // le contenu traîne de 300ms derrière la poignée (cf. index.css).
    document.documentElement.setAttribute('data-sa-resizing', '');
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();

    // MODE COLONNE : pas de poignée — la largeur est FIXE, calculée par la
    // coquille pour l'écran (WorkspaceLayoutContext.columnWidthFor).
    if (isPrior) return;

    // Le bord droit du tiroir est celui du viewport de la leçon : la largeur
    // est la distance du pointeur à CE bord, pas au bord de la fenêtre.
    // Distance du pointeur au bord de FIN du viewport (droite en LTR,
    // gauche en RTL) : c'est la largeur du tiroir.
    let newWidth = IS_RTL ? e.clientX - vpLeft : (window.innerWidth - vpRight) - e.clientX;

    // Sur écran étroit, on ne préserve pas une largeur de bureau qui rendrait
    // la leçon inutilisable : la borne haute suit la place réellement offerte.
    const available = vpWidth || window.innerWidth;
    const minWidth = Math.min(320, available);
    // Sur mobile la place disponible est déjà < 800 : on autorise toute la
    // largeur (le tiroir s'ouvre ainsi de toute façon), sinon on garde une
    // bande de leçon visible à gauche.
    const maxWidth = available <= 640 ? available : Math.min(available * 0.95, 800);

    if (newWidth < minWidth) newWidth = minWidth;
    if (newWidth > maxWidth) newWidth = maxWidth;

    setWidth(newWidth);
  }, [isDragging, vpRight, vpWidth, isPrior]);

  const handlePointerUp = useCallback((e) => {
    setIsDragging(false);
    document.documentElement.removeAttribute('data-sa-resizing');
    e.target.releasePointerCapture(e.pointerId);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && vpReady && (
        <>
          {/* Mobile backdrop (optional based on user preference, but let's keep it subtle for very small screens if needed, actually the user wanted it to be a companion that doesn't block the lesson entirely. So we might remove the backdrop completely to let them interact with the lesson). */}
          
          <motion.div
            id="km-root"
            key="panel"
            // Ouverture / fermeture / bascule — TOUT est animé par framer-motion
            // sur `top/left/width/height`, jamais par des styles inline qui
            // changeraient d'un coup (le mode plein sautait de 400px à 1280px).
            //
            //   ouverture tiroir : glissé depuis le bord droit
            //   ouverture plein  : fondu + très léger zoom (il ne vient d'aucun bord)
            //   tiroir ⇄ plein   : les quatre bords se déplacent de façon continue
            // OUVERTURE / FERMETURE — la carte ENTRE PAR SON BORD DE FIN (la
            // droite en LTR, la gauche en RTL — d'où le signe sur `x`) : elle
            // glisse jusqu'à sa colonne, et ressort par le même bord. Pendant ce temps la coquille rétrécit le
            // contenu (gouttière de `--sa-gutter-w`, même durée) : les deux
            // mouvements se répondent, la leçon fait de la place pendant que
            // la carte arrive.
            //
            // Seul `x` est animé — un DÉCALAGE relatif à la géométrie posée,
            // jamais la géométrie elle-même. C'est ce qui distingue cette
            // entrée du bug corrigé juste avant : en animant `left`,
            // framer-motion partait de son propre état zéro (left:0) et la
            // carte traversait tout l'écran depuis le bord GAUCHE. Ici elle
            // part de `x: 100%`, c'est-à-dire d'exactement une largeur de
            // panneau à DROITE de sa place — hors écran, quel que soit le mode.
            initial={{ x: IS_RTL ? '-100%' : '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: IS_RTL ? '-100%' : '100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              maxWidth: '100vw',
              ...geom,
              // Pendant le glissement de la poignée, la carte doit suivre le
              // pointeur à l'image près : aucune transition.
              // `justOpened` : à la toute première image il n'existe aucun état
              // précédent d'où venir. Toute transition n'y ferait donc que
              // RATTRAPER une valeur initiale approximative (la largeur de
              // tiroir par défaut avant la première mesure) — ce rattrapage se
              // voit comme un glissement. On ne transitionne qu'ensuite, pour
              // les vrais changements de mode.
              transition: isDragging || justOpened
                ? 'none'
                : 'top 300ms cubic-bezier(0.22,1,0.36,1), left 300ms cubic-bezier(0.22,1,0.36,1), width 300ms cubic-bezier(0.22,1,0.36,1), height 300ms cubic-bezier(0.22,1,0.36,1)',
            }}
            className={[
              'z-40 flex flex-col bg-white border-slate-200 overflow-hidden',
              expanded
                ? 'border-l border-r border-b shadow-xl shadow-slate-900/10'
                // COLONNE — une simple bordure, un fond très légèrement plus
                // froid : une séparation, pas un objet posé sur la leçon. Ni
                // ombre portée ni coin arrondi, qui la feraient à nouveau
                // flotter au-dessus du contenu.
                : isPrior
                  ? 'border-s bg-slate-50/60'
                  : 'border-s border-b shadow-2xl shadow-slate-900/15 rounded-es-2xl',
            ].join(' ')}
            role="dialog"
            aria-label={t('map.myKnowledgeMap')}
            aria-modal="false" // It's a companion, not a blocking modal
          >
            {/* ── Resize Handle — sur le bord du panneau FACE AU CONTENU ──
                Le panneau occupe le bord de FIN ; l'arête tournée vers la leçon
                est donc sa gauche en LTR et sa droite en RTL. Exprimé
                physiquement parce que l'auto-centrage (`translate-x`, moitié de
                largeur) est physique lui aussi et doit basculer avec. */}
            {/* Tiroir seulement : en mode COLONNE la largeur est fixe (la
                meilleure pour l'écran), et en plein écran il n'y a rien à régler. */}
            {!expanded && !isPrior && <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="absolute left-0 rtl:left-auto rtl:right-0 top-0 bottom-0 w-6 -translate-x-1/2 rtl:translate-x-1/2 cursor-col-resize z-50 flex items-center justify-center group touch-none"
              aria-hidden="true"
              data-km-noprint="true"
            >
              {/* Subtle visible grip */}
              <div className="w-1 h-12 bg-slate-200 rounded-full group-hover:bg-blue-400 transition-colors" />
            </div>}

            {/* ── Header ── */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0 bg-white rounded-ss-2xl"
              data-km-noprint="true"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl shrink-0" aria-hidden="true">🧠</span>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 text-sm leading-tight truncate">
                    {t('map.myMapShort')}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {t('map.discoveries', { count: visibleItems.length })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {/* ── Sélecteur de PRÉSENTATION ──────────────────────────────
                    Deux états explicites et étiquetés :

                      Colonne     → la leçon FAIT DE LA PLACE à la carte
                      Plein écran → la carte occupe tout l'espace de la leçon

                    Le tiroir flottant n'est plus proposé : il posait la carte
                    PAR-DESSUS la leçon, ce que la colonne fait mieux et sans
                    rien recouvrir. Il reste la présentation de repli là où la
                    colonne n'a pas de sens (< 1024px), mais ce n'est alors plus
                    un choix : c'est la seule mise en page tenable, et un bouton
                    l'affichant serait un bouton sans alternative.

                    L'état courant est mis en évidence ; c'est un vrai groupe
                    radio pour les lecteurs d'écran. */}
                <div
                  className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 ring-1 ring-inset ring-slate-200/70"
                  role="radiogroup"
                  aria-label={t('map.mapDisplay')}
                  data-km-switch="polished"
                >
                  {/* ── COLONNE ────────────────────────────────────────────
                      La troisième présentation, et la seule qui change la
                      COQUILLE : la barre latérale se comprime, la leçon
                      rétrécit, la carte prend la place ainsi libérée. Elle
                      n'apparaît qu'au-dessus de 1024px — en dessous, deux
                      zones utiles côte à côte n'en font plus aucune. */}
                  {priorAvailable && (
                    <button
                      onClick={() => { onExpandedChange?.(false); setPrior(true); }}
                      role="radio"
                      aria-checked={columnActive}
                      title={t('map.columnHint')}
                      data-km-view="prior"
                      className={viewButtonClass(columnActive)}
                    >
                      <Columns2 className={viewIconClass(columnActive)} aria-hidden="true" />
                      <span className="hidden sm:inline">{t('map.column')}</span>
                    </button>
                  )}
                  <button
                    onClick={() => onExpandedChange?.(true)}
                    role="radio"
                    aria-checked={expanded}
                    title={t('map.fullScreenHint')}
                    data-km-view="expanded"
                    data-km-expand="true"
                    className={viewButtonClass(expanded)}
                  >
                    <Expand className={viewIconClass(expanded)} aria-hidden="true" />
                    <span className="hidden sm:inline">{t('map.fullScreen')}</span>
                  </button>
                </div>

                {/* Replier — n'existe qu'en mode tiroir, et son icône (chevron)
                    ne ressemble plus à celle du plein écran. */}
                {!expanded && !isPrior && <button
                  onClick={() => setMinimized(m => !m)}
                  className={`${ICON_BTN} hover:text-slate-700`}
                  aria-label={minimized ? t('map.expandMap') : t('map.collapseMap')}
                  aria-expanded={!minimized}
                  data-km-minimize="true"
                  title={minimized ? t('map.expand') : t('map.collapse')}
                >
                  {minimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>}
                <button
                  onClick={onClose}
                  className={`${ICON_BTN} hover:text-rose-500`}
                  aria-label={t('map.closeMap')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!minimized && (
              <>
                {/* ── Mode switcher ── */}
                <div
                  className="flex gap-1 px-4 py-2.5 border-b border-slate-100 shrink-0 bg-slate-50/60"
                  data-km-noprint="true"
                >
                  <button
                    onClick={() => handleModeChange('navigation')}
                    className={[
                      `flex-1 flex items-center justify-center gap-1.5 px-2 rounded-lg font-bold transition-all truncate ${expanded ? 'py-2 text-base' : 'py-1.5 text-xs'}`,
                      mode === 'navigation'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
                    ].join(' ')}
                  >
                    <Compass className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{t('map.progressive.tabMap')}</span>
                  </button>
                  <button
                    onClick={() => handleModeChange('complete')}
                    className={[
                      `flex-1 flex items-center justify-center gap-1.5 px-2 rounded-lg font-bold transition-all truncate ${expanded ? 'py-2 text-base' : 'py-1.5 text-xs'}`,
                      mode === 'complete'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
                    ].join(' ')}
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{t('map.progressive.tabDetails')}</span>
                  </button>
                </div>

                {/* ── Content ── */}
                <div
                  className={[
                    'flex-1 overflow-y-auto overscroll-contain sa-screen-view',
                    // Le mode plein respire : marges plus larges, contenu borné
                    // pour ne pas étirer une ligne de texte sur 1400px.
                    expanded ? 'px-6 sm:px-10 py-6' : 'px-4 py-4',
                  ].join(' ')}
                  data-km-scroll="true"
                >
                  {/* LISIBLE SANS SE PENCHER (propriétaire, 2026-11-08) : en plein écran, TOUT le contenu (nœuds, flèches, étiquettes,
                      carte de contexte, lecture « المعارف مفصّلة ») grandit avec la largeur de l'écran — un seul facteur, comme le
                      lecteur de mission : ×1,15 vers 1024 px, jusqu'à ×1,5 dès ~1366 px. La géométrie du graphe ne change pas. */}
                  <div className={expanded ? 'mx-auto w-full max-w-[1400px]' : ''} style={readZoom !== 1 ? { zoom: readZoom } : undefined} data-km-read-zoom={readZoom}>
                  {visibleItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-2 py-10" data-km-empty="true">
                      <span className="text-3xl" aria-hidden="true">🧭</span>
                      <p className="text-sm font-bold text-slate-800">{t('map.emptyMap')}</p>
                      <p className="text-xs text-slate-500 max-w-[26ch]">{t('map.emptyMapHint')}</p>
                    </div>
                  ) : mode === 'navigation' ? (
                    <Suspense fallback={null}>
                      <ProgressiveKnowledgeMap
                        graph={progressiveGraph}
                        items={visibleItems}
                        selectedId={selectedItem?.graphNodeId ?? null}
                        onSelect={(id) => setSelectedItem(id ? { graphNodeId: id } : null)}
                        footer={<ProgressionStrip steps={progressionByModule(visibleItems)} />}
                      />
                    </Suspense>
                  ) : (
                    <Suspense fallback={null}>
                      <LinearKnowledgeView graph={progressiveGraph} items={visibleItems} />
                    </Suspense>
                  )}
                  </div>
                </div>

                {/* ── Print View ── */}
                <div className="hidden sa-print-view w-full bg-white">
                  <Suspense fallback={null}>
                    <LinearKnowledgeView graph={progressiveGraph} items={visibleItems} variant="print" printTitle={printTitle} printSubject={printSubject} />
                  </Suspense>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   TRIGGER — self-contained, portals the panel to <body>
   ───────────────────────────────────────────────────────────────────────── */

export function KnowledgeMapTrigger({ items = [], open: openProp, onOpenChange, printTitle, printSubject, expandRequest = 0 }) {
  const { t } = useTranslation('lesson');
  const [openState, setOpenState] = useState(false);
  const controlled = typeof openProp === 'boolean';
  const open = controlled ? openProp : openState;
  const setOpen = useCallback((next) => {
    const value = typeof next === 'function' ? next(open) : next;
    if (!controlled) setOpenState(value);
    onOpenChange?.(value);
  }, [controlled, open, onOpenChange]);
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem('knowledgeMapViewMode') || 'navigation'; }
    catch { return 'navigation'; }
  });
  // Présentation : 'drawer' | 'expanded'. La largeur du tiroir est stockée
  // séparément (knowledgeMapWidth) et n'est jamais écrasée par le mode plein,
  // donc le retour au tiroir retrouve le choix de l'élève.
  const [expanded, setExpanded] = useState(() => {
    try { return localStorage.getItem('knowledgeMapExpanded') === 'true'; }
    catch { return false; }
  });
  // une ouverture qui DEMANDE le plein écran (la barre de mission : la carte mentale a besoin de place) — sans écraser le
  // choix enregistré de l'élève (knowledgeMapExpanded)
  useEffect(() => { if (expandRequest) setExpanded(true); }, [expandRequest]);
  const handleExpandedChange = useCallback((next) => {
    setExpanded(next);
    try { localStorage.setItem('knowledgeMapExpanded', String(next)); } catch { /* noop */ }
  }, []);

  // Inject print styles once
  useEffect(() => {
    if (document.getElementById('km-print-styles')) return;
    const style = document.createElement('style');
    style.id = 'km-print-styles';
    style.textContent = PRINT_CSS;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const handleModeChange = useCallback((m) => {
    setMode(m);
    try { localStorage.setItem('knowledgeMapViewMode', m); } catch { /* noop */ }
  }, []);

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        className={[
          // La hauteur tient compte de la barre basse mobile des espaces
          // élève et enseignant (h-16, sous `lg`) — sinon le déclencheur est
          // recouvert : `--sa-bottom-nav` (index.css) vaut alors 4rem.
          // Côté : PHYSIQUEMENT à gauche, dans les deux directions — et c'est
          // volontairement une valeur physique, pas `start-6`.
          //
          // Sous RTL, `start-6` plaçait le déclencheur à DROITE, c'est-à-dire
          // sous la barre latérale de l'espace élève, qui occupe ce bord : le
          // bouton restait visible mais inatteignable, la barre interceptant
          // tous les clics. Constaté par la QA du moteur sous RTL — la sonde
          // de la reprise précédente ne montait pas la coquille élève, donc
          // ne pouvait pas le voir.
          //
          // Gauche convient aux deux cas : sous LTR le panneau s'ouvre à
          // droite et le déclencheur lui fait face ; sous RTL la barre occupe
          // la droite, et le panneau s'ouvrant à gauche, le déclencheur le
          // recouvrirait s'il n'était pas décalé vers le bas.
          //
          // HAUTEUR : au RAS DU COIN (bottom-6 = 1.5rem), autant d'écart au
          // bas qu'à gauche (left-6). L'étage du dessous était occupé par le
          // déclencheur « ⛶ عرض » du mode classe ; celui-ci est remonté dans
          // la rangée de repères du محور, et la carte a pris sa place. La
          // pile complète est documentée dans classroom.css.
          'fixed bottom-[calc(1.5rem+var(--sa-bottom-nav,0px))] left-6 z-40',
          'flex items-center gap-2 px-4 py-3 rounded-2xl',
          'font-bold text-sm shadow-lg shadow-slate-900/20',
          'transition-colors duration-200',
          open
            ? 'bg-slate-900 text-white'
            : 'bg-white text-slate-800 border border-slate-200 hover:border-slate-400 hover:shadow-xl',
        ].join(' ')}
        aria-label={open ? t('map.closeMap') : t('map.openMyMap')}
        data-km-trigger="true"
        aria-pressed={open}
        data-km-noprint="true"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        <span className="text-lg" aria-hidden="true">🧠</span>
        <span>{t('map.myMap')}</span>
      </motion.button>

      {/* Panel — portalled to body so print CSS can isolate it */}
      {ReactDOM.createPortal(
        <KnowledgeMap
          items={items}
          isOpen={open}
          onClose={() => setOpen(false)}
          mode={mode}
          onModeChange={handleModeChange}
          printTitle={printTitle}
          printSubject={printSubject}
          expanded={expanded}
          onExpandedChange={handleExpandedChange}
        />,
        document.body
      )}
    </>
  );
}

