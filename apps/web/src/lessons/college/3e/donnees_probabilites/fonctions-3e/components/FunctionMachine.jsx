import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import MathText from '../../../../../common/components/MathText';
import { NumberField } from '../../../../../common/components/LessonUI';
import { formatDec, parseDec } from '@smarter-academy/core';
import { imageOf, formatRule } from './functionUtils';

/**
 * FunctionMachine — l'interaction signature de la leçon.
 *
 * Activity            nourrir une machine avec un nombre et regarder ce qui sort.
 * Mathematical objective  faire éprouver qu'une fonction est un PROCÉDÉ stable :
 *                     même entrée → même sortie, et une règle pour tout x.
 * Student action      toucher une pastille d'entrée (ou − / +), puis « Lancer ».
 * Controlled variable x, l'entrée. En mode inverse, c'est la SORTIE visée.
 * Mathematical state  { rule, x } — tout le reste en est dérivé : la sortie,
 *                     la ligne du tableau, le point du repère.
 * Visual consequence  le nombre descend dans la machine, la règle s'allume,
 *                     la sortie apparaît APRÈS le trajet (settle-then-number).
 * Expected observation « la même entrée redonne toujours la même sortie » ;
 *                     puis, en mode inverse, « deux entrées peuvent donner la
 *                     même sortie ».
 * Misconception targeted « une fonction, c'est une liste de nombres » et
 *                     « à chaque sortie correspond une seule entrée ».
 * Feedback            la sortie elle-même ; en mode caché, la règle reste
 *                     masquée tant que l'élève n'a pas assez d'essais.
 * Formalization       une fois plusieurs couples obtenus, le module nomme
 *                     image, antécédent, puis f(x).
 * Scaffolding         règle affichée (SHOW) → règle masquée (TRY) → mode
 *                     inverse (CHALLENGE).
 * Transfer            la même machine porte le taxi au module 7.
 *
 * Le composant est CONTRÔLÉ : `x` et `tested` appartiennent au module.
 *
 * `allowCustom` ajoute une saisie libre à côté des pastilles : l'élève peut
 * alors nourrir la machine avec SON nombre (« et si je mets 100 ? »). La
 * borne `customRange` garde les sorties lisibles ; hors borne, la saisie est
 * refusée en clair, jamais silencieusement tronquée.
 */
export default function FunctionMachine({
  rule,
  x,
  onXChange,
  xs = [-3, -2, -1, 0, 1, 2, 3],
  tested = [],                 // [{x, y}] déjà obtenus, affichés en journal
  onRun,                       // (x, y) => void — appelé au moment du résultat
  showRule = true,
  name = 'f',
  label = null,                // étiquette de la boîte quand la règle est cachée
  unit = '',
  disabled = false,
  frozen = false,
  allowCustom = false,         // saisie libre d'une entrée, en plus des pastilles
  customRange = { min: -100, max: 100 },
}) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = React.useState('idle'); // idle | running | done
  const [draft, setDraft] = React.useState('');
  const [draftError, setDraftError] = React.useState(null);
  const locked = disabled || frozen;
  const y = imageOf(rule, x);

  // settle-then-number : le nombre n'apparaît qu'une fois le trajet terminé.
  const run = () => {
    if (locked || phase === 'running') return;
    if (reduce) {
      setPhase('done');
      onRun?.(x, y);
      return;
    }
    setPhase('running');
    window.setTimeout(() => {
      setPhase('done');
      onRun?.(x, y);
    }, 420);
  };

  const pick = (v) => {
    if (locked) return;
    setPhase('idle');
    onXChange?.(v);
  };

  const shown = frozen || phase === 'done';

  /** Saisie libre : un nombre décimal dans la borne, sinon un refus explicite. */
  const useDraft = () => {
    if (locked) return;
    const v = parseDec(draft);
    if (!Number.isFinite(v)) { setDraftError('Écris un nombre, par exemple 12 ou −2,5.'); return; }
    if (v < customRange.min || v > customRange.max) {
      setDraftError(`Reste entre ${formatDec(customRange.min)} et ${formatDec(customRange.max)}.`);
      return;
    }
    setDraftError(null);
    setDraft('');
    pick(v);
  };

  return (
    <div className="space-y-3" role="group" aria-label="Machine à nombres">
      {/* ── Entrée ── */}
      {!frozen && (
        <div className="flex flex-wrap items-center gap-2 justify-center">
          {xs.map((v) => {
            const on = v === x;
            return (
              <button
                key={v}
                type="button"
                onClick={() => pick(v)}
                disabled={locked}
                aria-pressed={on}
                aria-label={`Entrée ${formatDec(v)}`}
                className={`min-w-[44px] h-11 px-3 rounded-xl border-2 font-mono font-bold tabular-nums transition
                  focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50
                  ${on ? 'bg-indigo-600 border-indigo-600 text-white'
                       : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400'}`}
                style={{ touchAction: 'manipulation' }}
              >
                {formatDec(v)}
              </button>
            );
          })}
        </div>
      )}

      {allowCustom && !frozen && (
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-sm text-slate-600">ou ton nombre :</span>
            <NumberField
              value={draft}
              onChange={(v) => { setDraft(v); if (draftError) setDraftError(null); }}
              onEnter={useDraft}
              ariaLabel="Ton propre nombre d’entrée"
              width="w-24"
              size="sm"
            />
            <button
              type="button"
              onClick={useDraft}
              disabled={locked || draft === ''}
              className="min-h-[44px] px-3 rounded-xl border-2 border-slate-200 bg-white font-semibold text-slate-700
                hover:border-indigo-400 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-500"
              style={{ touchAction: 'manipulation' }}
            >
              Utiliser
            </button>
          </div>
          {draftError && (
            <p className="text-center text-xs text-rose-700" role="status">{draftError}</p>
          )}
        </div>
      )}

      {/* ── La machine ── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Entrée</span>
          <motion.div
            key={`in-${x}-${phase}`}
            initial={reduce ? false : { y: -6, opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="px-4 py-1.5 rounded-xl bg-indigo-100 text-indigo-800 font-mono font-bold text-lg tabular-nums"
          >
            {formatDec(x)}
          </motion.div>
          <span className="text-slate-400" aria-hidden="true">▼</span>
        </div>

        {/* La boîte : la règle, ou son mystère */}
        <div className={`rounded-xl px-4 py-3 text-center text-white ${showRule ? 'bg-slate-900' : 'bg-slate-700'}`}>
          {showRule ? (
            <MathText>{`$${formatRule(rule, { name })}$`}</MathText>
          ) : (
            <span className="font-semibold">{label ?? '❓ règle secrète'}</span>
          )}
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-slate-400" aria-hidden="true">▼</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sortie</span>
          <div
            className={`px-4 py-1.5 rounded-xl font-mono font-bold text-lg tabular-nums min-w-[76px] text-center
              ${shown ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}
            aria-live="polite"
          >
            {shown && y !== null ? `${formatDec(y)}${unit}` : '?'}
          </div>
        </div>
      </div>

      {!frozen && (
        <button
          type="button"
          onClick={run}
          disabled={locked || phase === 'running'}
          className="w-full min-h-[48px] rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700
            disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-500"
          style={{ touchAction: 'manipulation' }}
        >
          {phase === 'running' ? '…' : '⚙️ Lancer la machine'}
        </button>
      )}

      {/* Journal des couples obtenus : c'est LUI qui devient le tableau. */}
      {tested.length > 0 && (
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-2 overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Couples entrée / sortie déjà obtenus</caption>
            <tbody>
              <tr>
                <th scope="row" className="text-left pr-2 font-semibold text-slate-600 whitespace-nowrap">Entrée</th>
                {tested.map((t) => (
                  <td key={`x${t.x}`} className="px-2 font-mono tabular-nums text-center">{formatDec(t.x)}</td>
                ))}
              </tr>
              <tr>
                <th scope="row" className="text-left pr-2 font-semibold text-slate-600 whitespace-nowrap">Sortie</th>
                {tested.map((t) => (
                  <td key={`y${t.x}`} className="px-2 font-mono tabular-nums text-center text-emerald-700 font-bold">
                    {formatDec(t.y)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
