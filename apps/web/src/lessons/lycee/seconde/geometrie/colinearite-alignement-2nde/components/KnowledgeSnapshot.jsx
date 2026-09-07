import React, { useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { CATEGORIES, CAT_THEME, CompleteView } from './KnowledgeMap';
import { groupByCategory } from './knowledgeState';
import { useLessonKnowledge } from './KnowledgeProvider';

/**
 * KnowledgeSnapshot — l'« À retenir » d'un module = la carte des
 * connaissances telle qu'elle est À CET INSTANT, dans la page.
 *
 * Mêmes données et mêmes catégories que le tiroir « Ma carte » ; seule la
 * présentation change :
 *  - 'compact' (fin de module) : les apports du module courant détaillés
 *    (titre + résumé), les acquis antérieurs en pastilles ; le détail complet
 *    (visuels, KaTeX) vit dans le tiroir, ouvert d'un clic ;
 *  - 'complete' (synthèse du test final) : la vue complète du tiroir,
 *    rendue dans la page — toutes les cartes, rien de recopié.
 *
 * Rendu dans le slot `footer` de ContentModule, donc uniquement quand toutes
 * les étapes sont faites : son montage débloque l'apport du module dans
 * l'état cumulatif (`unlockModule`) — même condition que le
 * markModuleCompleted de ModuleLayout, pas un second système de progression.
 * Avec `complete`, il débloque toute la leçon (`unlockAll`) : le tiroir
 * passe au même état complet.
 *
 * @param {number}  [moduleNumber]  module dont on affiche l'« À retenir »
 * @param {boolean} [unlock=true]   débloquer l'apport de ce module au montage
 * @param {boolean} [complete]      débloquer toute la leçon (synthèse finale)
 * @param {'compact'|'complete'} [variant]
 * @param {React.ReactNode} [children] phrase de transition vers la suite
 */
export default function KnowledgeSnapshot({ moduleNumber, unlock = true, complete = false, variant = 'compact', children }) {
  const { items, unlockModule, unlockAll, openMap } = useLessonKnowledge();

  useEffect(() => {
    if (complete) unlockAll();
    else if (unlock && moduleNumber != null) unlockModule(moduleNumber);
  }, [complete, unlock, moduleNumber, unlockModule, unlockAll]);

  const groups = groupByCategory(items, CATEGORIES);
  const fromThisModule = items.filter((i) => i.module === moduleNumber);
  const isComplete = variant === 'complete';

  return (
    <section
      className="border border-indigo-200 bg-indigo-50 rounded-3xl p-6 space-y-4"
      data-knowledge-snapshot={isComplete ? 'complete' : (moduleNumber ?? 'all')}
      aria-labelledby="km-snapshot-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="km-snapshot-title" className="font-space font-bold text-indigo-900 flex items-center gap-2">
            <span aria-hidden="true">🔑</span> {isComplete ? 'Ma carte des connaissances — la leçon complète' : 'À retenir — ce que je sais maintenant'}
          </h3>
          <p className="text-xs text-indigo-700 mt-1">
            {items.length} {items.length > 1 ? 'connaissances' : 'connaissance'} sur ma carte
            {!isComplete && fromThisModule.length > 0 && (
              <> · <strong>{fromThisModule.length} {fromThisModule.length > 1 ? 'nouvelles' : 'nouvelle'}</strong> dans ce module</>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={openMap}
          className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" /> {isComplete ? 'Ouvrir et imprimer ma carte' : 'Ouvrir ma carte'}
        </button>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-indigo-800">Ta carte est encore vide : elle se remplit à chaque module terminé.</p>
      ) : isComplete ? (
        <CompleteView items={items} printable={false} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {groups.map(({ category, items: catItems }) => {
            const theme = CAT_THEME[category.color];
            return (
              <div key={category.id} className={`rounded-xl border p-3 bg-white/70 ${theme.card}`}>
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-bold border ${theme.hdr}`}>
                  <span aria-hidden="true">{category.emoji}</span>
                  <span className="font-mono tracking-wider">{category.label}</span>
                  <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${theme.badge}`}>{catItems.length}</span>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {catItems.map((item) => (
                    <li key={item.id} data-knowledge-item={item.id} data-knowledge-module={item.module}>
                      {item.module === moduleNumber ? (
                        <div className="rounded-lg px-2.5 py-2 bg-white border border-indigo-200">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800">{item.title}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full">nouveau</span>
                          </div>
                          {item.summary && <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.summary}</p>}
                        </div>
                      ) : (
                        <span className="inline-block text-xs font-medium text-slate-700 bg-white/80 border border-slate-200 rounded-full px-2.5 py-1">
                          {item.title}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {children && <div className="text-sm text-indigo-900 border-t border-indigo-200 pt-3">{children}</div>}
    </section>
  );
}
