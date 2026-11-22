import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Compass, Network, RotateCcw, Sparkles } from 'lucide-react';
import { IS_RTL } from '../../../../locale.js';
import { getLoadedLessonConfig } from '../../../registry';
import { useLessonKnowledge } from '../KnowledgeProvider';
import {
  discover, exploreProgress, initialExplore, isLocked, nextToDiscover, nodeById, nodeStates, relationsOf, restoreExplore, visibleEdges,
} from './graphModel';
import { layoutGraph } from './graphLayout';
import GraphNode from './GraphNode';
import { GraphEdgeLines, GraphEdgeLabels } from './GraphEdges';
import NodeContextCard from './NodeContextCard';

/**
 * CARTE PROGRESSIVE — la carte de connaissances de toutes les leçons
 * (référence : la leçon pilote). docs/architecture/KNOWLEDGE_MAP.md, Part A
 * et « Progressive map — implementation ».
 *
 * Remplace, pour la leçon qui la déclare, le CORPS de l'onglet « تصفّح » de
 * la carte habituelle — rien d'autre : le panneau, ses modes (tiroir /
 * colonne / plein écran), l'onglet « عرض كامل », l'impression et le fil
 * « بطاقتك » (surcouche de maîtrise) restent ceux de KnowledgeMap.jsx.
 *
 *   graphModel.js     états (verrouillé / disponible / découvert), révélation
 *   graphLayout.js    positions + chemins, purs et testés
 *   GraphNode.jsx     un nœud
 *   GraphEdges.jsx    arêtes qui se dessinent + étiquettes de relation
 *   NodeContextCard   le contexte du nœud choisi
 *   ce fichier        l'orchestration : état d'exploration, vues, rejouer,
 *                     chronologie des animations, clavier, annonces
 *
 * La VISIBILITÉ des connaissances n'est pas décidée ici : un nœud dont l'item
 * n'est pas dans `items` (la carte cumulative) est verrouillé. L'exploration
 * (quels nœuds l'élève a ouverts) est un état d'interface, gardé pour l'onglet
 * dans sessionStorage — jamais une progression, jamais envoyé au serveur.
 */

// Les pastilles flottantes du haut (vue / rejouer) : un seul dessin.
const FLOAT_PILL = 'pointer-events-auto min-h-[44px] inline-flex items-center gap-2 ps-3.5 pe-4 rounded-full border border-slate-200 bg-white/95 backdrop-blur text-xs font-bold text-slate-700 shadow-lg shadow-slate-900/10 hover:border-slate-400 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400';

const SIDE_CONTEXT_MIN = 760;   // largeur à partir de laquelle le contexte se pose À CÔTÉ du graphe
const SIDE_CONTEXT_W = 300;      // largeur MINIMALE du contexte
const SIDE_CONTEXT_MAX = 560;    // … et maximale (une ligne de texte reste lisible)
// Le graphe ne s'élargit plus au-delà de deux couloirs de 250 px (graphLayout.metrics) : ≈ 600 px lui suffisent. Tout ce qui
// dépasse va au CONTEXTE plutôt qu'en marge vide entre lui et le graphe (propriétaire, 2026-11-08).
const GRAPH_NATURAL_W = 600;
const SIDE_GAP = 20;

function readSession(key) {
  try { return JSON.parse(sessionStorage.getItem(key) ?? 'null'); } catch { return null; }
}
function writeSession(key, value) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* stockage indisponible : l'exploration reste en mémoire */ }
}

/** Hauteur vivante d'un élément (0 quand il n'est pas monté). */
function useElementHeight() {
  const [el, setEl] = useState(null);
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => {
    if (!el) { setHeight(0); return undefined; }
    setHeight(el.offsetHeight);
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);
  return [setEl, height];
}

function useElementWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

/** Le محور qui établit un item — pour dire à l'élève QUAND un nœud s'ouvrira. */
function lockedInfoFor(node, knowledge, config) {
  if (!node?.requires || !knowledge?.modules) return null;
  const entry = Object.entries(knowledge.modules).find(([, list]) => list.some((it) => it.id === node.requires));
  if (!entry) return null;
  const module = Number(entry[0]);
  const title = config?.modules?.find((m) => m.number === module)?.title ?? '';
  return { module, title };
}

export default function ProgressiveKnowledgeMap({ graph, items, selectedId, onSelect, footer }) {
  const { t } = useTranslation('lesson');
  const reduce = useReducedMotion();
  const { lessonId, knowledge } = useLessonKnowledge();
  const config = lessonId ? getLoadedLessonConfig(lessonId) : null;
  const storageKey = `sa_km_explore_${lessonId ?? 'lesson'}`;

  const unlocked = useMemo(() => new Set(items.map((it) => it.id)), [items]);
  const itemsById = useMemo(() => new Map(items.map((it) => [it.id, it])), [items]);

  const [explore, setExplore] = useState(() => restoreExplore(graph, readSession(storageKey)?.explore));
  // la carte MENTALE interactive (« الاستكشاف ») reste la vue d'ouverture, même OUVERTE (pilote 2026-11-08 : le propriétaire veut
  // la carte qui se découvre, pas la vue figée) ; ouverte, tous ses nœuds sont simplement découvrables, aucun n'est verrouillé
  const [view, setView] = useState(() => (readSession(storageKey)?.view === 'full' ? 'full' : 'explore'));
  // La chronologie de la DERNIÈRE action : qui a été cliqué, ce qui vient
  // d'apparaître. Seuls ces éléments s'animent ; le reste est déjà là.
  const [batch, setBatch] = useState(null);
  const [announce, setAnnounce] = useState('');

  useEffect(() => { writeSession(storageKey, { explore, view }); }, [storageKey, explore, view]);

  const [wrapRef, width] = useElementWidth();
  const [sheetRef, sheetH] = useElementHeight();
  // Les deux pastilles du haut, libellées, font ≈ 415 px.
  const roundReplay = width > 0 && width < 440;
  const side = width >= SIDE_CONTEXT_MIN;
  const sideW = side ? Math.max(SIDE_CONTEXT_W, Math.min(SIDE_CONTEXT_MAX, width - GRAPH_NATURAL_W - SIDE_GAP)) : 0;
  const graphWidth = side ? width - sideW - SIDE_GAP : width;
  const layout = useMemo(
    () => (graphWidth > 0 ? layoutGraph(graph, { width: graphWidth, rtl: IS_RTL }) : null),
    [graph, graphWidth],
  );

  const full = view === 'full';
  const states = useMemo(() => nodeStates(graph, explore, unlocked, { full }), [graph, explore, unlocked, full]);
  const stateOf = useCallback((id) => states.get(id) ?? 'hidden', [states]);
  const shownNodes = graph.nodes.filter((n) => stateOf(n.id) !== 'hidden');
  const selected = selectedId && stateOf(selectedId) !== 'hidden' ? nodeById(graph, selectedId) : null;
  const progress = exploreProgress(graph, explore, unlocked);
  // « Complète » seulement quand plus rien n'attend un محور : sinon l'élève a
  // tout vu de CE QU'IL A APPRIS, et la carte le lui dit.
  const mapComplete = progress.complete && progress.lockedCount === 0;

  // Ordre de LECTURE des nœuds affichés : rangée, puis sens de lecture.
  const readingOrder = useMemo(() => {
    if (!layout) return [];
    return shownNodes
      .map((n) => ({ id: n.id, ...layout.nodes.get(n.id) }))
      .sort((a, b) => a.row - b.row || (IS_RTL ? b.cx - a.cx : a.cx - b.cx))
      .map((n) => n.id);
  }, [layout, shownNodes]);

  const nodeRefs = useRef(new Map());
  const setNodeRef = useCallback((id) => (el) => {
    if (el) nodeRefs.current.set(id, el); else nodeRefs.current.delete(id);
  }, []);

  // ── Chronologie : clic → défilement → parent → relation → enfant ────────
  // `batch.lead` : le temps du défilement qui amène la zone d'arrivée au
  // centre AVANT que quoi que ce soit n'apparaisse (0 s'il n'y a rien à
  // déplacer). Toute la chronologie de la révélation est décalée d'autant.
  const lead = (!reduce && batch?.lead) || 0;
  const nodeDelay = useCallback((id) => {
    if (reduce || !batch || !batch.ids.includes(id)) return 0;
    const i = batch.ids.indexOf(id);
    if (batch.mode === 'full') return 0.05 + (layout?.nodes.get(id)?.row ?? 0) * 0.09;
    return lead + 0.5 + i * 0.16;
  }, [batch, reduce, layout, lead]);

  const edgeTiming = useCallback((e) => {
    if (reduce || !batch) return { delay: 0 };
    const { from, to } = e.edge;
    const toNew = batch.ids.includes(to);
    const fromNew = batch.ids.includes(from);
    if (!toNew && !fromNew) return { delay: 0 };
    if (batch.mode === 'full') return { delay: Math.max(0, nodeDelay(toNew ? to : from) - 0.06) };
    // L'arête qui part du nœud cliqué se dessine d'abord ; les autres liens
    // du nouveau venu (vers ce qui était déjà sur la carte) ensuite.
    if (from === batch.from && toNew) return { delay: lead + 0.12 + batch.ids.indexOf(to) * 0.16 };
    return { delay: lead + 0.8 + batch.ids.indexOf(toNew ? to : from) * 0.16 };
  }, [batch, reduce, nodeDelay, lead]);

  // LE PROCHAIN PAS : un seul nœud clignote — le premier disponible dans
  // l'ordre de découverte de la leçon. Les autres disponibles gardent leur
  // halo discret : l'élève sait toujours où cliquer ensuite.
  const nextId = useMemo(() => nextToDiscover(graph, states), [graph, states]);

  const edges = useMemo(() => {
    if (!layout) return [];
    const shown = new Set(visibleEdges(graph, states).map((e) => `${e.from}->${e.to}`));
    return layout.edges.filter((e) => shown.has(e.key));
  }, [layout, graph, states]);

  const lockedKeys = useMemo(
    () => new Set(edges.filter((e) => stateOf(e.edge.from) === 'locked' || stateOf(e.edge.to) === 'locked').map((e) => e.key)),
    [edges, stateOf],
  );

  // FOCUS : le nœud choisi et ses voisins immédiats restent nets, le reste s'estompe.
  const { dimmedNodes, dimmedKeys } = useMemo(() => {
    if (!selected) return { dimmedNodes: new Set(), dimmedKeys: new Set() };
    const near = new Set([selected.id, ...relationsOf(graph, selected.id).map((r) => r.other)]);
    return {
      dimmedNodes: new Set(shownNodes.filter((n) => !near.has(n.id)).map((n) => n.id)),
      dimmedKeys: new Set(edges.filter((e) => e.edge.from !== selected.id && e.edge.to !== selected.id).map((e) => e.key)),
    };
  }, [selected, graph, shownNodes, edges]);

  const titleOf = useCallback((id) => nodeById(graph, id)?.title ?? '', [graph]);

  // DÉFILER D'ABORD, RÉVÉLER ENSUITE — `activate` calcule où doit arriver le
  // défilement (la zone des nœuds qui vont apparaître, au CENTRE de la partie
  // visible : sous les pastilles flottantes du haut, au-dessus du contexte
  // qui monte du bas) ; cet effet l'exécute dès que le graphe a sa nouvelle
  // hauteur, pendant que les nœuds attendent `lead` pour entrer.
  const graphRef = useRef(null);
  const pendingScroll = useRef(null);

  /**
   * Où défiler pour que `ids` arrivent au centre de la zone visible — sous
   * les pastilles collées en haut, au-dessus du contexte du bas (mesuré s'il
   * est déjà là, estimé sinon). null : déjà bien placés (sauf `force`).
   */
  const centerScrollFor = useCallback((ids, { force = false } = {}) => {
    const graphEl = graphRef.current;
    const scroller = graphEl?.closest('[data-km-scroll]');
    if (!layout || !scroller || ids.length === 0) return null;
    const boxes = ids.map((r) => layout.nodes.get(r));
    const top = Math.min(...boxes.map((b) => b.y));
    const bottom = Math.max(...boxes.map((b) => b.y + b.h));
    const graphTop = graphEl.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
    const floatingTop = 56; // la rangée des pastilles collées en haut
    const sheetEl = side ? null : scroller.querySelector('[data-kg-sheet]');
    const reserveBottom = side ? 0 : sheetEl ? sheetEl.offsetHeight : Math.round(scroller.clientHeight * 0.35);
    const visibleMid = (floatingTop + scroller.clientHeight - reserveBottom) / 2;
    const desired = Math.max(0, Math.round(graphTop + (top + bottom) / 2 - visibleMid));
    return force || Math.abs(desired - scroller.scrollTop) > 24 ? { scroller, top: desired, ids } : null;
  }, [layout, side]);
  useEffect(() => {
    if (!batch || batch.mode !== 'discover') return undefined;
    const pending = pendingScroll.current;
    pendingScroll.current = null;
    if (pending) {
      // Recalculé ICI, après le rendu : le graphe a sa nouvelle hauteur et le
      // panneau de contexte du bas existe — sa vraie hauteur, pas une estimation.
      const precise = centerScrollFor(pending.ids, { force: true }) ?? pending;
      precise.scroller.scrollTo({ top: precise.top, behavior: reduce ? 'auto' : 'smooth' });
      return undefined;
    }
    // Rien de nouveau (une feuille) : le nœud choisi reste visible au-dessus
    // du contexte (scroll-margin-bottom = hauteur de ce panneau, cf. GraphNode).
    const id = setTimeout(() => {
      nodeRefs.current.get(batch.from)?.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    }, reduce ? 0 : 60);
    return () => clearTimeout(id);
  }, [batch, reduce, centerScrollFor]);

  const activate = useCallback((id) => {
    const node = nodeById(graph, id);
    if (!node) return;
    const { explore: next, newlyRevealed } = discover(graph, explore, id, unlocked);
    if (next !== explore) setExplore(next);
    onSelect(id);
    const fresh = full ? [] : newlyRevealed;
    // Ce qu'on centre : le groupe qui arrive — ou, s'il contient le PROCHAIN
    // pas (le nœud qui va clignoter), ce nœud-là : sur téléphone, le groupe
    // entier ne tient pas toujours au-dessus du contexte, le prochain pas si.
    const upcoming = nextToDiscover(graph, nodeStates(graph, next, unlocked, { full }));
    const focusIds = upcoming && fresh.includes(upcoming) && !side ? [upcoming] : fresh;
    const scroll = centerScrollFor(focusIds);
    pendingScroll.current = scroll;
    setBatch({ mode: 'discover', from: id, ids: fresh, lead: scroll ? 0.45 : 0 });
    if (stateOf(id) === 'locked') { setAnnounce(t('map.progressive.lockedTitle')); return; }
    const revealedTitles = fresh.map((r) => (isLocked(nodeById(graph, r), unlocked) ? t('map.progressive.lockedTitle') : titleOf(r)));
    setAnnounce([
      t('map.progressive.announceDiscovered', { title: node.title }),
      revealedTitles.length ? t('map.progressive.announceRevealed', { titles: revealedTitles.join('، ') }) : '',
    ].join(' ').trim());
  }, [graph, explore, unlocked, onSelect, full, stateOf, t, titleOf, centerScrollFor, side]);

  const showFull = useCallback(() => {
    if (full) return;
    const hidden = graph.nodes.filter((n) => stateOf(n.id) === 'hidden').map((n) => n.id);
    setView('full');
    // Un récapitulatif se lit en entier : aucun nœud estompé à l'arrivée.
    onSelect(null);
    setBatch({ mode: 'full', from: null, ids: hidden });
    setAnnounce(t('map.progressive.announceFull'));
  }, [full, graph, stateOf, t, onSelect]);

  const showExplore = useCallback(() => {
    if (!full) return;
    setView('explore');
    setBatch(null);
    if (selectedId && !explore.revealed.includes(selectedId)) onSelect(null);
  }, [full, selectedId, explore, onSelect]);

  const replay = useCallback(() => {
    setExplore(initialExplore(graph));
    setView('explore');
    setBatch(null);
    onSelect(null);
    setAnnounce(t('map.progressive.announceReplay'));
    requestAnimationFrame(() => nodeRefs.current.get(graph.root)?.focus({ preventScroll: false }));
  }, [graph, onSelect, t]);

  // Clavier : ↓/↑ parcourent les nœuds affichés dans l'ordre de lecture ;
  // Entrée / Espace ouvrent (bouton natif) ; Échap est géré par le panneau.
  const onKeyNav = useCallback((e, id) => {
    const i = readingOrder.indexOf(id);
    let target = null;
    if (e.key === 'ArrowDown') target = readingOrder[Math.min(readingOrder.length - 1, i + 1)];
    else if (e.key === 'ArrowUp') target = readingOrder[Math.max(0, i - 1)];
    else if (e.key === 'Home') target = readingOrder[0];
    else if (e.key === 'End') target = readingOrder[readingOrder.length - 1];
    if (!target) return;
    e.preventDefault();
    nodeRefs.current.get(target)?.focus();
  }, [readingOrder]);

  const maxRow = layout ? Math.max(0, ...shownNodes.map((n) => layout.nodes.get(n.id).row)) : 0;
  const graphHeight = layout ? layout.heightFor(maxRow) : 0;
  const isStart = explore.discovered.length === 0 && !full;
  const rootNode = nodeById(graph, graph.root);

  const hint = full
    ? t('map.progressive.hintFull')
    : isStart
      ? t('map.progressive.hintStart', { title: rootNode.title })
      : mapComplete
        ? null
        : shownNodes.some((n) => stateOf(n.id) === 'available')
          ? t('map.progressive.hintContinue')
          : t('map.progressive.hintLocked');

  const contextCard = selected && (
    <NodeContextCard
      node={selected}
      state={stateOf(selected.id)}
      relations={relationsOf(graph, selected.id).filter((r) => stateOf(r.other) !== 'hidden')}
      titleOf={titleOf}
      stateOf={stateOf}
      item={selected.requires ? itemsById.get(selected.requires) : null}
      lessonId={lessonId}
      lockedInfo={lockedInfoFor(selected, knowledge, config)}
      onClose={() => { onSelect(null); nodeRefs.current.get(selected.id)?.focus(); }}
      onNavigate={(id) => { activate(id); nodeRefs.current.get(id)?.focus({ preventScroll: true }); }}
      reduce={reduce}
      variant={side ? 'side' : 'sheet'}
    />
  );

  return (
    <div className="space-y-3" data-kg-root="true" data-kg-view={view} data-kg-layout={side ? 'side' : 'stack'}>
      {/* ── Le bouton flottant, en haut ─────────────────────────────────
          UN bouton qui bascule entre les deux vues et dit ce qu'il va faire
          (« عرض الخريطة كاملة » / « الاستكشاف »). Collé en haut du défilement,
          au coin de DÉBUT (la droite sous RTL) : il reste à portée pendant
          que l'élève descend dans la carte. */}
      {/* « إعادة استكشاف الخريطة » flotte À CÔTÉ, même pastille : les deux
          commandes de la carte vivent au même endroit, sous le même dessin. */}
      <div className="sticky top-0 z-30 flex flex-wrap justify-start gap-2 pointer-events-none" data-km-noprint="true">
        <button
          type="button"
          onClick={full ? showExplore : showFull}
          data-kg-view-toggle={full ? 'explore' : 'full'}
          className={FLOAT_PILL}
        >
          {full
            ? <Compass className="w-4 h-4 text-indigo-600 shrink-0" aria-hidden="true" />
            : <Network className="w-4 h-4 text-indigo-600 shrink-0" aria-hidden="true" />}
          {full ? t('map.progressive.explore') : t('map.progressive.full')}
        </button>
        {/* Là où les deux libellés ne tiennent pas côte à côte (tiroir,
            téléphone), rejouer devient une pastille RONDE du même dessin :
            elle reste À CÔTÉ, et garde son nom pour le lecteur d'écran. */}
        <button
          type="button"
          onClick={replay}
          data-kg-replay="true"
          aria-label={t('map.progressive.replay')}
          title={t('map.progressive.replay')}
          className={roundReplay ? `${FLOAT_PILL} !px-0 w-11 justify-center` : FLOAT_PILL}
        >
          <RotateCcw className="w-4 h-4 text-indigo-600 shrink-0" aria-hidden="true" />
          {!roundReplay && t('map.progressive.replay')}
        </button>
      </div>
      {/* ── Où j'en suis ─────────────────────────────────────────────────── */}
      <div className="space-y-1.5" data-km-noprint="true">
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden" aria-hidden="true">
            <motion.div
              className="h-full rounded-full bg-emerald-500"
              initial={false}
              animate={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
              transition={{ duration: reduce ? 0 : 0.4 }}
            />
          </div>
          <span className="text-[11px] font-bold text-slate-500 shrink-0" data-kg-progress={`${progress.done}/${progress.total}`}>
            {t('map.progressive.progress', { done: progress.done, total: progress.total })}
            {progress.lockedCount > 0 && <span className="font-medium text-slate-400"> · {t('map.progressive.lockedCount', { count: progress.lockedCount })}</span>}
          </span>
        </div>
        {hint && <p className="text-xs text-slate-500 leading-relaxed" data-kg-hint="true">{hint}</p>}
        {mapComplete && !full && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2" data-kg-complete="true">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <span className="text-xs font-bold text-emerald-800 flex-1 min-w-[12ch]">{t('map.progressive.complete')}</span>
            <button
              type="button"
              onClick={showFull}
              className="min-h-[44px] px-3 rounded-lg bg-white border border-emerald-200 text-xs font-bold text-emerald-800 hover:border-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              {t('map.progressive.full')}
            </button>
          </div>
        )}
      </div>

      <p className="sr-only" aria-live="polite" data-kg-live="true">{announce}</p>

      {/* ── Le graphe (et, en large, le contexte à côté) ──────────────── */}
      <div ref={wrapRef} className={side ? 'flex items-start' : ''} style={side ? { gap: SIDE_GAP } : undefined}>
        {layout && (
          // La hauteur est posée d'un coup (plus animée) : le défilement qui
          // précède la révélation doit pouvoir descendre jusqu'à la zone où
          // les nouveaux nœuds vont entrer.
          <div
            ref={graphRef}
            role="group"
            aria-label={t('map.progressive.graphLabel')}
            className="relative shrink-0"
            style={{ width: graphWidth, height: graphHeight }}
            data-kg-graph="true"
          >
            <GraphEdgeLines
              edges={edges}
              width={graphWidth}
              height={graphHeight}
              timing={edgeTiming}
              dimmedKeys={dimmedKeys}
              lockedKeys={lockedKeys}
              reduce={reduce}
            />
            <GraphEdgeLabels edges={edges} timing={edgeTiming} dimmedKeys={dimmedKeys} lockedKeys={lockedKeys} reduce={reduce} />
            <AnimatePresence initial={false}>
              {readingOrder.map((id) => {
                const node = nodeById(graph, id);
                const state = stateOf(id);
                return (
                  <GraphNode
                    key={id}
                    ref={setNodeRef(id)}
                    node={node}
                    box={layout.nodes.get(id)}
                    state={state}
                    selected={selected?.id === id}
                    dimmed={dimmedNodes.has(id)}
                    isRoot={id === graph.root}
                    isStart={isStart}
                    isNext={id === nextId}
                    isNew={Boolean(itemsById.get(node.requires)?.isNew) && node.notebook}
                    lockedModule={state === 'locked' ? lockedInfoFor(node, knowledge, config)?.module : null}
                    delay={nodeDelay(id)}
                    scrollMarginBottom={sheetH + 16}
                    reduce={reduce}
                    onActivate={activate}
                    onKeyNav={onKeyNav}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {side && (
          <aside className="flex-1 min-w-0 sticky top-0" style={{ maxWidth: sideW }} data-km-noprint="true">
            <AnimatePresence mode="wait" initial={false}>
              {contextCard || (
                <motion.div
                  key="legend"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.15 }}
                  className="rounded-2xl border border-dashed border-slate-200 p-4 text-xs text-slate-500 leading-relaxed"
                  data-kg-legend="true"
                >
                  {hint ?? t('map.progressive.hintFull')}
                </motion.div>
              )}
            </AnimatePresence>
          </aside>
        )}
      </div>

      {footer}

      {/* Piste d'élan : sans elle, les dernières rangées ne peuvent jamais
          remonter jusqu'au CENTRE (le défilement bute sur la fin du contenu).
          Exploration seulement — la carte complète se lit d'une traite. */}
      {!full && <div aria-hidden="true" data-kg-runway="true" className={side ? 'h-[40vh]' : 'h-[20vh]'} />}

      {/* Mobile / tiroir étroit : le contexte monte du bas, par-dessus la
          fin du graphe, sans quitter la carte. */}
      {!side && (
        <div className="sticky bottom-0 z-20 -mx-1 px-1 pb-1" data-km-noprint="true">
          {contextCard && <div ref={sheetRef} data-kg-sheet="true" className="max-h-[42vh] overflow-y-auto overscroll-contain rounded-2xl">{contextCard}</div>}
        </div>
      )}
    </div>
  );
}
