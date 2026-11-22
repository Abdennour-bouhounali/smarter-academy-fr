import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';

/**
 * Le MOMENT DE DÉCOUVERTE (§6, §21) — n'apparaît que lorsque la manipulation
 * a atteint la condition qui rend la relation visible (`state.isDiscovered`).
 *
 *   1. « ماذا لاحظت؟ » : une CONJECTURE à formuler — l'élève choisit la
 *      phrase juste parmi des formulations plausibles (ou un bouton « صِغ
 *      القاعدة » quand il n'y a rien à choisir) ;
 *   2. la règle FORMELLE (`formal`) ne s'écrit qu'après : c'est l'élève qui
 *      l'a produite, l'écran la confirme.
 *
 * En mode classe, `state.answerHidden` masque la règle : la classe formule.
 * Une conjecture fausse reçoit une explication courte et se rejoue ; rien ne
 * bloque (invariant non bloquant).
 *
 * Le choix est OUBLIÉ quand la scène repart (`state.epoch`) : sinon la bonne
 * réponse restait enfoncée, en vert, au-dessus d'une règle masquée — la
 * conjecture était pré-remplie pour l'essai suivant (audit 2026-09-29).
 */
export default function ManipulationDiscovery({ state, prompt, options, explain, formal, onFormalized }) {
  const { t } = useTranslation('lesson');
  const reduce = useReducedMotion();
  const [pick, setPick] = useState(null);
  useEffect(() => { setPick(null); }, [state.epoch]);
  if (!state.isDiscovered) return null;
  const wrong = pick !== null && options && !options[pick]?.correct;

  const choose = (i) => {
    setPick(i);
    if (options[i]?.correct) { state.formalize(); onFormalized?.(); }
  };

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50/70 p-4"
      aria-label={t('manipulation.discovery.title')}
      data-manipulation-discovery
      data-formal={state.isFormal ? 'true' : undefined}
    >
      <h4 className="flex items-center gap-2 text-sm font-extrabold text-emerald-900">
        <Sparkles className="h-4 w-4" aria-hidden="true" /> {t('manipulation.discovery.title')}
      </h4>

      {!state.isFormal && (
        <div className="space-y-2">
          {prompt && <p className="text-sm font-bold text-slate-800">{prompt}</p>}
          {options ? (
            <div className="grid gap-2 grid-cols-2">
              {options.map((o, i) => (
                <button key={i} type="button" onClick={() => choose(i)} aria-pressed={pick === i}
                  className={`min-h-[44px] rounded-xl border-2 px-3 py-2 text-start text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    pick === i ? (o.correct ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-rose-300 bg-rose-50 text-rose-800') : 'border-slate-300 bg-white text-slate-800 hover:border-emerald-500'
                  }`}>
                  {o.text}
                </button>
              ))}
            </div>
          ) : (
            <button type="button" onClick={() => { state.formalize(); onFormalized?.(); }}
              className="min-h-[44px] rounded-xl border-2 border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
              {t('manipulation.discovery.showRule')}
            </button>
          )}
          {wrong && <p role="status" className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm text-rose-800">{options[pick]?.why ?? explain ?? t('manipulation.discovery.tryAgain')}</p>}
        </div>
      )}

      {state.isFormal && !state.answerHidden && (
        <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2" data-manipulation-formal>
          {formal}
        </motion.div>
      )}
      {state.isFormal && state.answerHidden && (
        <p className="text-sm italic text-slate-600">{t('manipulation.discovery.hiddenByTeacher')}</p>
      )}
    </motion.section>
  );
}
