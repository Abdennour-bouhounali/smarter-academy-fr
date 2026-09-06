import React, { useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { CompleteView } from './KnowledgeMap';
import { buildStructure, progressionByModule } from './knowledgeStructure';
import { useLessonKnowledge } from './KnowledgeProvider';

/**
 * KnowledgeSnapshot — l'« À retenir » d'un module = la carte des
 * connaissances telle qu'elle est À CET INSTANT, dans la page.
 *
 * Mêmes données et mêmes catégories que le tiroir « Ma carte » ; seule la
 * présentation change :
 *  - 'compact' (fin de module) : la carte ORDONNÉE POUR RÉVISER — les pièges
 *    en tête, puis IDÉES / PROPRIÉTÉS / MÉTHODES ; les apports du module
 *    courant détaillés (titre + résumé), les acquis antérieurs en lignes
 *    titrées ; le détail complet (visuels, KaTeX) vit dans le tiroir ;
 *  - 'complete' (synthèse du test final) : la vue complète du tiroir,
 *    rendue dans la page — toutes les cartes, rien de recopié.
 *
 * POURQUOI DES STRATES ET NON UNE GRILLE DE CATÉGORIES. La question à laquelle
 * cette carte répond n'est pas « qu'ai-je vu dans ce module ? » mais « que
 * dois-je avoir en tête pour l'évaluation ? ». C'est exactement l'ordre que
 * knowledgeStructure.js encode déjà et que le tiroir (StructuredView) et la
 * synthèse (CompleteView) utilisent : l'instantané était la seule des trois
 * présentations à ne pas l'avoir adopté. Rien de nouveau n'est demandé aux
 * leçons — `type` et `module` suffisent (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Rendu dans le slot `footer` de ContentModule, donc uniquement quand toutes
 * les étapes sont faites : son montage débloque l'apport du module dans
 * l'état cumulatif (`unlockModule`) — même condition que le
 * markModuleCompleted de ModuleLayout, pas un second système de progression.
 * Avec `complete`, il débloque toute la leçon (`unlockAll`) : le tiroir
 * passe au même état complet.
 *
 * CONTRAT DOM (lu par les suites e2e *-carte.mjs, ne pas casser) :
 *   [data-knowledge-snapshot]      une fois, = moduleNumber | 'all' | 'complete'
 *   [data-knowledge-item=<id>]     une fois par item, JAMAIS deux (dédup par
 *                                  construction : `memoriser` ne vit que dans
 *                                  le bandeau, jamais dans une strate)
 *   [data-knowledge-module=<n>]    sur le même élément que data-knowledge-item
 *   le mot « nouveau »             UNIQUEMENT sur les items du module courant
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

  const fromThisModule = items.filter((i) => i.module === moduleNumber);
  const isComplete = variant === 'complete';
  const { highlight, strata } = buildStructure(items);
  const steps = progressionByModule(items);

  return (
    <section
      className="border border-indigo-200 bg-indigo-50 rounded-3xl p-6 space-y-4"
      data-knowledge-snapshot={isComplete ? 'complete' : (moduleNumber ?? 'all')}
      aria-labelledby="km-snapshot-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="km-snapshot-title" className="font-space font-bold text-indigo-900 flex items-center gap-2">
            <span aria-hidden="true">🔑</span> {isComplete ? 'Ma carte des connaissances — la leçon complète' : 'À retenir — l’essentiel pour l’évaluation'}
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

      {items.length === 0 ? (
        <p className="text-sm text-indigo-800">Ta carte est encore vide : elle se remplit à chaque module terminé.</p>
      ) : isComplete ? (
        <CompleteView items={items} printable={false} />
      ) : (
        <div className="space-y-3">
          {/* Les pièges d'abord : c'est ce qui coûte des points le jour du contrôle. */}
          {highlight.length > 0 && (
            <section className="rounded-xl border-2 border-rose-200 bg-rose-50/70 px-3 py-2.5" data-knowledge-highlight="true">
              <div className="flex items-baseline gap-2 mb-1.5">
                <span aria-hidden="true">⚠️</span>
                <span className="text-[11px] font-bold tracking-[0.14em] text-rose-700">PIÈGES À NE PAS OUBLIER</span>
                <span className="ml-auto text-[11px] text-rose-400 font-mono">{highlight.length}</span>
              </div>
              <div className="flex flex-col divide-y divide-rose-100">
                {highlight.map((item) => (
                  <SnapRow key={item.id} item={item} isNew={item.module === moduleNumber} dot="bg-rose-500" showSummary />
                ))}
              </div>
            </section>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {strata.map((s) => {
              const accent = STRATUM_ACCENT[s.accent] ?? STRATUM_ACCENT.blue;
              return (
                <section key={s.id} className="rounded-xl bg-white/70 border border-slate-200 p-3 break-inside-avoid" data-knowledge-stratum={s.id}>
                  <div className="flex items-baseline gap-2">
                    <span className={`w-1 h-3.5 rounded-full ${accent.rule}`} aria-hidden="true" />
                    <span className={`text-[11px] font-bold tracking-[0.12em] ${accent.label}`}>{s.label}</span>
                    <span className="text-[11px] text-slate-400">{s.caption}</span>
                    <span className="ml-auto text-[11px] font-mono text-slate-400">{s.count}</span>
                  </div>
                  {s.groups.map((g) => (
                    <div key={g.category.id} className="mt-2">
                      {s.groups.length > 1 && (
                        <div className="text-[10px] font-mono font-bold tracking-wider text-slate-400 mb-0.5">{g.category.label}</div>
                      )}
                      <div className="flex flex-col divide-y divide-slate-100">
                        {g.items.map((item) => (
                          <SnapRow
                            key={item.id}
                            item={item}
                            isNew={item.module === moduleNumber}
                            dot={accent.dot}
                            showSummary={item.module === moduleNumber}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </section>
              );
            })}
          </div>

          {steps.length > 1 && (
            <p className="text-[11px] text-indigo-700/80 font-mono" data-knowledge-progression="true">
              Ta carte : {steps.map((s) => `M${s.module} +${s.count}`).join(' → ')}
            </p>
          )}
        </div>
      )}

      {children && <div className="text-sm text-indigo-900 border-t border-indigo-200 pt-3">{children}</div>}
    </section>
  );
}

/**
 * Une connaissance = une LIGNE. Deux registres seulement :
 *  - apport du module courant : pastille « nouveau » + résumé (ce qui vient
 *    d'être appris est ce qu'on relit le plus) ;
 *  - acquis antérieur : titre seul, révisable d'un coup d'œil, détail dans le
 *    tiroir (KNOWLEDGE_MAP.md — la variante compacte ne détaille que le neuf).
 *
 * Le mot « nouveau » ne doit apparaître QUE dans la pastille : les suites e2e
 * comptent ses occurrences pour vérifier l'apport du module.
 */
function SnapRow({ item, isNew, dot = 'bg-slate-300', showSummary = false }) {
  return (
    <div
      data-knowledge-item={item.id}
      data-knowledge-module={item.module}
      className="flex items-baseline gap-2 py-1.5"
    >
      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className={`text-sm ${isNew ? 'font-bold text-slate-900' : 'font-medium text-slate-800'}`}>{item.title}</span>
        {isNew && (
          <span className="ml-1.5 align-middle text-[10px] font-bold uppercase tracking-wide text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full">nouveau</span>
        )}
        {showSummary && item.summary && (
          <span className="block text-xs text-slate-600 leading-snug mt-0.5">{item.summary}</span>
        )}
      </span>
    </div>
  );
}

/** Mêmes accents que la vue structurée du tiroir — trois, pas six. */
const STRATUM_ACCENT = {
  blue:   { rule: 'bg-blue-400',    label: 'text-blue-700',    dot: 'bg-blue-400' },
  orange: { rule: 'bg-orange-400',  label: 'text-orange-700',  dot: 'bg-orange-400' },
  green:  { rule: 'bg-emerald-400', label: 'text-emerald-700', dot: 'bg-emerald-400' },
};
