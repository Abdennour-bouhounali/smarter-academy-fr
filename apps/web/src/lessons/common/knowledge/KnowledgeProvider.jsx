import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useProgress } from '../hooks/useProgress';
import { cumulativeKnowledge, findKnowledgeItem, knowledgeModuleNumbers, toModuleSet } from './knowledgeState';
import { KnowledgeMapTrigger } from './KnowledgeMap';

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
 *                            printTitle="…" printSubject="Mathématiques · 2nde">
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

export function LessonKnowledgeProvider({ lessonId, knowledge, printTitle, printSubject = 'Mathématiques · 2nde', children }) {
  const { completedModules } = useProgress(lessonId);
  const [liveUnlocked, setLiveUnlocked] = useState([]);
  const [liveItems, setLiveItems] = useState([]);
  const [open, setOpen] = useState(false);

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
    const stored = toModuleSet(completedModules);
    const newModules = liveUnlocked.filter((n) => !stored.has(n));
    const unlocked = [...stored, ...liveUnlocked];
    const items = cumulativeKnowledge(knowledge, unlocked, newModules, liveItems);
    return {
      lessonId,
      knowledge,
      items,
      unlockedModules: toModuleSet(unlocked),
      newModules,
      liveItems,
      unlockModule,
      unlockItem,
      getItem,
      unlockAll,
      isOpen: open,
      openMap: () => setOpen(true),
      closeMap: () => setOpen(false),
    };
  }, [lessonId, knowledge, completedModules, liveUnlocked, liveItems, unlockModule, unlockItem, getItem, unlockAll, open]);

  return (
    <KnowledgeContext.Provider value={value}>
      {children}
      <KnowledgeMapTrigger
        items={value.items}
        open={open}
        onOpenChange={setOpen}
        printTitle={printTitle}
        printSubject={printSubject}
      />
    </KnowledgeContext.Provider>
  );
}

const FALLBACK = {
  lessonId: null, knowledge: null, items: [], unlockedModules: new Set(), newModules: [], liveItems: [],
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
