import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useProgress } from '../hooks/useProgress';
import { useWorkspaceLayout } from '../../../context/WorkspaceLayoutContext';
import { useLearningViewer } from '../../../features/learning/learningViewer';
import { cumulativeKnowledge, findKnowledgeItem, knowledgeModuleNumbers, toModuleSet } from './knowledgeState';
import { lazy, Suspense } from 'react';
import { isolateOutsideMath } from '../../../utils/bidi';
import { getLoadedLessonConfig } from '../../registry';
// `KnowledgeMap` tire framer-motion et les visuels de concept. C'est un
// TIROIR : il ne s'ouvre que sur clic, et son déclencheur flotte au-dessus de
// la page. Le charger avec le provider plaçait framer-motion dans le lot
// d'entrée de l'application. On le charge donc à part ; le repli est `null`,
// ce qui est exactement ce que la page montre déjà avant l'ouverture.
const KnowledgeMapTrigger = lazy(() =>
  import('./KnowledgeMap').then((m) => ({ default: m.KnowledgeMapTrigger })),
);

/**
 * LessonKnowledgeProvider — l'ÉTAT CUMULATIF de la carte des connaissances,
 * partagé par ses deux présentations (tiroir « Ma carte » et « À retenir »).
 *
 * Version GÉNÉRIQUE (docs/architecture/KNOWLEDGE_MAP.md « Future Work » :
 * les quatre fichiers génériques, jusqu'ici recopiés à l'identique dans
 * chaque leçon de 2nde, vivent ici pour les leçons construites à partir du
 * 2026-09-06). Une leçon la monte depuis son routes.jsx :
 *
 *   <LessonKnowledgeProvider lessonId={LESSON_CONFIG.id} knowledge={LESSON_KNOWLEDGE}
 *                            printTitle="…" printSubject="الرياضيات · السنة الرابعة متوسط">
 *
 *   modules validés (useProgress.completedModules)
 *   ∪ modules dont l'« À retenir » vient de s'afficher sur cette page
 *          ↓  cumulativeKnowledge (knowledgeState.js)
 *   items courants  →  <KnowledgeMapTrigger items>  et  <KnowledgeSnapshot>
 *
 * Pourquoi une part « live » : les instances de useProgress ne s'abonnent pas
 * au stockage ; quand ModuleLayout marque le module courant terminé, ce
 * provider ne le verrait qu'à la navigation suivante. Le snapshot de fin de
 * module se rend sous exactement la même condition (allDone) et appelle
 * `unlockModule(n)` — même déclencheur, aucune seconde logique de progression.
 *
 * Un provider par page (index + modules), relu depuis le stockage à chaque
 * navigation. La carte ne lit que la progression ; elle n'écrit jamais.
 *
 * DÉBLOCAGE PAR ITEM (`unlockItem`) : un <KnowledgeBrick> appelle ce canal au
 * montage, c'est-à-dire au moment exact où il POSE la connaissance, sans
 * attendre la fin du module. Même nature que `liveUnlocked` : état de page,
 * durée de vie identique à celle des étapes du module, aucun nouveau stockage
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */
const KnowledgeContext = createContext(null);

// `printSubject` sans défaut : l'ancien défaut « Mathématiques · 2nde »
// nommait une classe FRANÇAISE qui n'existe pas dans le système algérien, et
// il partait à l'impression de la carte de connaissances. La leçon fournit sa
// matière et sa classe (voir routes.jsx) ; sans elles, KnowledgeMap retombe
// sur un libellé arabe neutre.
//
// `graph` : le KNOWLEDGE_GRAPH de la leçon (carte progressive — KNOWLEDGE_MAP.md
// Part A). La carte ne l'utilise que si la leçon déclare
// `knowledgeMapMode: 'progressive'` ; absent ou invalide, elle dérive un graphe
// de repli des items (graphModel `resolveGraph`).
function isolateKnowledgeText(k) {
  if (!k?.modules) return k;
  const modules = Object.fromEntries(Object.entries(k.modules).map(([n, items]) => [n, (items ?? []).map((it) => ({
    ...it,
    ...(typeof it.title === 'string' ? { title: isolateOutsideMath(it.title) } : {}),
    ...(typeof it.summary === 'string' ? { summary: isolateOutsideMath(it.summary) } : {}),
  }))]));
  return { ...k, modules };
}

function isolateGraphText(g) {
  if (!g?.nodes) return g;
  return {
    ...g,
    nodes: g.nodes.map((n) => ({
      ...n,
      ...(typeof n.title === 'string' ? { title: isolateOutsideMath(n.title) } : {}),
      ...(typeof n.subtitle === 'string' ? { subtitle: isolateOutsideMath(n.subtitle) } : {}),
    })),
  };
}

export function LessonKnowledgeProvider({ lessonId, knowledge: rawKnowledge, graph: rawGraph = null, printTitle, printSubject, children }) {
  // Titres et résumés sont du texte BRUT rendu par cinq composants : on les
  // isole une fois ici (« √a » ne s'affiche plus « a√ », utils/bidi.js).
  const knowledge = useMemo(() => isolateKnowledgeText(rawKnowledge), [rawKnowledge]);
  const graph = useMemo(() => isolateGraphText(rawGraph), [rawGraph]);
  const { completedModules } = useProgress(lessonId);
  // Un enseignant (ou un admin) PRÉPARE la leçon, il ne la parcourt pas : il
  // n'a pas de progression (tracksProgress = false) et lit donc la carte
  // COMPLÈTE d'emblée — la même règle que `freeNavigation` pour les verrous.
  // Aucun rôle testé ici ; rien n'est écrit.
  const { freeNavigation } = useLearningViewer();
  // CARTE OUVERTE (propriétaire, 2026-11-08, d'abord sur la leçon pilote) : `knowledgeMapOpen: true` dans la config montre
  // TOUTES les connaissances de la leçon dès le début, sans attendre la fin des محاور. Seuls les ITEMS de la carte s'ouvrent :
  // `unlockedModules` reste la vraie progression (la surcouche de maîtrise le lit comme « modules terminés »), et la fiche
  // de fin de module ne montre toujours que ses propres connaissances (KnowledgeSnapshot).
  const mapOpen = Boolean(lessonId) && getLoadedLessonConfig(lessonId)?.knowledgeMapOpen === true;
  const [liveUnlocked, setLiveUnlocked] = useState([]);
  const [liveItems, setLiveItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [expandRequest, setExpandRequest] = useState(0);

  // La coquille doit savoir qu'une carte est ouverte pour lui réserver sa
  // colonne (mode « prior »). Le provider est le seul à connaître cette
  // information ; il la PUBLIE, sans jamais lire en retour la géométrie —
  // c'est WorkspaceLayoutContext qui décide si la colonne est tenable.
  const { setMapOpen } = useWorkspaceLayout();
  useEffect(() => {
    setMapOpen(open);
    // Démontage (navigation vers une page sans carte) : la coquille se
    // redéploie, sinon elle garderait une gouttière vide.
    return () => setMapOpen(false);
  }, [open, setMapOpen]);

  const unlockModule = useCallback((n) => {
    const num = Number(n);
    if (!Number.isFinite(num)) return;
    setLiveUnlocked((prev) => (prev.includes(num) ? prev : [...prev, num]));
  }, []);

  // Une brique vient d'établir une connaissance : elle entre dans la carte.
  const unlockItem = useCallback((id) => {
    if (typeof id !== 'string' || !id) return;
    setLiveItems((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const getItem = useCallback((id) => findKnowledgeItem(knowledge, id), [knowledge]);

  // Synthèse du test final : toute la leçon est acquise → la carte devient complète.
  const unlockAll = useCallback(() => {
    setLiveUnlocked((prev) => {
      const all = knowledgeModuleNumbers(knowledge);
      return all.every((n) => prev.includes(n)) ? prev : [...new Set([...prev, ...all])];
    });
  }, [knowledge]);

  const value = useMemo(() => {
    const stored = toModuleSet(freeNavigation ? knowledgeModuleNumbers(knowledge) : completedModules);
    const newModules = liveUnlocked.filter((n) => !stored.has(n));
    const unlocked = [...stored, ...liveUnlocked];
    // ce que l'élève a VRAIMENT établi (les outils de la mission le lisent) ; la carte ouverte montre en plus tout le reste
    const learnedItems = cumulativeKnowledge(knowledge, unlocked, newModules, liveItems);
    const items = mapOpen ? cumulativeKnowledge(knowledge, [...new Set([...unlocked, ...knowledgeModuleNumbers(knowledge)])], newModules, liveItems) : learnedItems;
    return {
      lessonId,
      knowledge,
      graph,
      items,
      unlockedModules: toModuleSet(unlocked),
      freeNavigation,
      mapOpen,
      learnedItems,
      newModules,
      liveItems,
      unlockModule,
      unlockItem,
      getItem,
      unlockAll,
      isOpen: open,
      // `openMap({ expanded: true })` ouvre la carte en plein écran (barre de mission) ; appelée sans option, comme avant
      openMap: (opts) => { if (opts?.expanded === true) setExpandRequest((n) => n + 1); setOpen(true); },
      closeMap: () => setOpen(false),
    };
  }, [lessonId, knowledge, graph, freeNavigation, mapOpen, completedModules, liveUnlocked, liveItems, unlockModule, unlockItem, getItem, unlockAll, open]);

  return (
    <KnowledgeContext.Provider value={value}>
      {children}
      <Suspense fallback={null}>
      <KnowledgeMapTrigger
        items={value.items}
        open={open}
        onOpenChange={setOpen}
        expandRequest={expandRequest}
        printTitle={printTitle}
        printSubject={printSubject}
      />
      </Suspense>
    </KnowledgeContext.Provider>
  );
}

const FALLBACK = {
  lessonId: null, knowledge: null, graph: null, items: [], unlockedModules: new Set(), freeNavigation: false, mapOpen: false, learnedItems: [], newModules: [], liveItems: [],
  unlockModule: () => {}, unlockItem: () => {}, getItem: () => null,
  unlockAll: () => {}, isOpen: false, openMap: () => {}, closeMap: () => {},
};

/** État courant de la carte. Hors provider : carte vide (et avertissement en dev). */
export function useLessonKnowledge() {
  const ctx = useContext(KnowledgeContext);
  if (!ctx) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[knowledge] useLessonKnowledge() appelé hors <LessonKnowledgeProvider> — carte vide.');
    }
    return FALLBACK;
  }
  return ctx;
}
