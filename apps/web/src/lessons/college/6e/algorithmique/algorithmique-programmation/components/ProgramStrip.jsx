import React from 'react';
import { ChevronUp, ChevronDown, X, Minus, Plus, GripVertical } from 'lucide-react';
import { useDragDrop } from '../../../../../common/manip6e';
import { INSTRUCTION_LABELS, countSteps } from './algoUtils';

/**
 * ProgramStrip — le programme, lisible et modifiable carte par carte.
 *
 * RÉORDONNER, C'EST DÉPLACER (demande utilisateur du 2026-09-07) : l'élève
 * SAISIT une carte par sa poignée et la lâche à sa nouvelle place. Le geste
 * dit ce qu'il fait — « cette instruction passe avant celle-là » —, ce qu'un
 * couple de flèches ne montrait pas. C'est exactement le point du module 4 :
 * l'ordre n'est pas une propriété du programme, c'est une position qu'on
 * choisit.
 *
 * Les chemins de secours restent entiers (§17, §27) : ajouter = taper une
 * carte de la palette ; réordonner = ↑/↓ au clavier OU prendre-puis-poser ;
 * supprimer = ✕ ; régler une boucle = −/+. Tout reste donc faisable au doigt
 * comme au clavier, sans souris.
 *
 * La carte en cours d'exécution est surlignée (`runningIndex`) : c'est la
 * correspondance instruction → action, montrée et non affirmée.
 *
 * Composant CONTRÔLÉ : le module possède `program` et reçoit chaque
 * modification via `onChange`. Aucun état de programme ici.
 */

const CARD_BASE =
  'relative flex items-center gap-2 rounded-xl border-2 px-2.5 py-2 min-h-[44px] transition-colors';

function paletteTone(kind) {
  if (kind === 'AVANCER') return 'border-indigo-300 bg-indigo-50 text-indigo-800 hover:border-indigo-500';
  if (kind === 'REPETER') return 'border-purple-300 bg-purple-50 text-purple-800 hover:border-purple-500';
  if (kind === 'RAMASSER') return 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:border-emerald-500';
  return 'border-sky-300 bg-sky-50 text-sky-800 hover:border-sky-500';
}

/* ── Palette : les instructions disponibles pour cette mission ──────── */
export function InstructionPalette({ allowed, onAdd, disabled = false, hint = true, pulse = false }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono uppercase tracking-wide text-slate-500">
          Instructions disponibles
        </span>
        {hint && !disabled && (
          <span className="text-[11px] text-slate-400">Touche une carte pour l’ajouter</span>
        )}
      </div>
      <div className="flex gap-1.5 flex-wrap" role="group" aria-label="Instructions disponibles">
        {allowed.map((kind, i) => {
          const meta = INSTRUCTION_LABELS[kind];
          return (
            <button
              key={kind}
              type="button"
              disabled={disabled}
              onClick={() => onAdd(kind)}
              aria-label={`Ajouter l’instruction ${meta.aria}`}
              className={`${CARD_BASE} ${paletteTone(kind)} font-mono text-xs font-bold disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                pulse && i === 0 ? 'algo-pulse' : ''
              }`}
            >
              <span aria-hidden="true" className="text-base leading-none">{meta.icon}</span>
              {/* whitespace-nowrap : « TOURNER ← » et « TOURNER → » ne doivent
                  JAMAIS être tronqués — la flèche est ce qui les distingue. */}
              <span className="whitespace-nowrap">{meta.label}</span>
            </button>
          );
        })}
      </div>
      {/* §10.12 : l'invite clignote au plus deux fois, et jamais en mouvement réduit */}
      <style>{`
        @keyframes algoPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
          50%      { box-shadow: 0 0 0 5px rgba(99,102,241,0.28); }
        }
        .algo-pulse { animation: algoPulse 1.1s ease-in-out 2; }
        @media (prefers-reduced-motion: reduce) { .algo-pulse { animation: none; } }
      `}</style>
    </div>
  );
}

/* ── La bande de programme ──────────────────────────────────────────── */
export default function ProgramStrip({
  program,
  onChange,
  runningIndex = null,   // index de la carte en cours d'exécution
  runningIteration = null,
  disabled = false,
  maxCards = 14,
  title = 'Ton programme',
  emptyHint = 'Ajoute des instructions ci-dessous.',
  showStepCount = true,
}) {
  const locked = disabled;
  const steps = countSteps(program);

  const update = (next) => { if (!locked) onChange(next); };
  const removeAt = (i) => update(program.filter((_, k) => k !== i));
  const moveBy = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= program.length) return;
    const next = [...program];
    [next[i], next[j]] = [next[j], next[i]];
    update(next);
  };
  /* Le glisser-déposer de réordonnancement : on prend la carte `from` et on
     la lâche sur la position `to`. Le tableau est reconstruit par extraction
     puis insertion — jamais par échange, sinon lâcher une carte trois rangs
     plus bas produirait une permutation que l'élève n'a pas demandée. */
  const dnd = useDragDrop({
    onDrop: (from, to) => {
      const a = Number(from);
      const b = Number(to);
      if (locked || Number.isNaN(a) || Number.isNaN(b) || a === b) return;
      const next = [...program];
      const [moved] = next.splice(a, 1);
      next.splice(b, 0, moved);
      update(next);
    },
  });

  const setTimes = (i, times) => {
    const next = [...program];
    next[i] = { ...next[i], times: Math.min(10, Math.max(1, times)) };
    update(next);
  };

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[11px] font-mono uppercase tracking-wide text-slate-500">
          {title} ({program.length}/{maxCards})
        </span>
        {showStepCount && (
          <span className="text-[11px] font-mono text-slate-500 tabular-nums">
            {steps} action{steps > 1 ? 's' : ''} exécutée{steps > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {!locked && program.length > 1 && (
        <p className="text-[11px] text-slate-400" role="status">
          {dnd.held !== null
            ? 'Une carte est en main : lâche-la sur la poignée de sa nouvelle place.'
            : 'Attrape une carte par sa poignée ⣿ pour la déplacer.'}
        </p>
      )}

      {program.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-2">{emptyHint}</p>
      ) : (
        <ol className="space-y-1.5" aria-label="Suite des instructions du programme">
          {program.map((node, i) => {
            const meta = INSTRUCTION_LABELS[node.kind];
            const isRunning = runningIndex === i;
            return (
              <li
                key={i}
                {...(locked ? {} : dnd.zoneProps(String(i)))}
                className={`${CARD_BASE} ${
                  isRunning
                    ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200'
                    : dnd.hoverZone === String(i) && dnd.held !== String(i)
                    ? 'border-blue-500 bg-blue-50'
                    : dnd.held === String(i)
                    ? 'border-slate-800 bg-white shadow-lg'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                {/* LA POIGNÉE : c'est la carte elle-même qu'on saisit et qu'on
                    déplace. 44 × 44 px, et elle sert aussi de bouton
                    prendre/poser au clavier. */}
                {!locked ? (() => {
                  const src = dnd.sourceProps(String(i));
                  const holdingOther = dnd.held !== null && dnd.held !== String(i);
                  return (
                    <button
                      type="button"
                      {...src}
                      aria-label={
                        dnd.held === String(i)
                          ? `Instruction ${i + 1} en main — active une autre poignée pour l’y placer`
                          : holdingOther
                          ? `Placer l’instruction en main à la position ${i + 1}`
                          : `Déplacer l’instruction ${i + 1}`
                      }
                      /* Une poignée sert des DEUX côtés du geste : elle prend sa
                         propre carte, et elle accueille celle qui est en main —
                         c'est ce qui rend le réordonnancement faisable sans
                         souris, exactement comme le glissement. */
                      onClick={(e) => (holdingOther ? dnd.dropHere(String(i)) : src.onClick?.(e))}
                      className={`w-11 h-11 -my-1 shrink-0 inline-flex items-center justify-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        holdingOther ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      <GripVertical className="w-4 h-4" aria-hidden="true" />
                    </button>
                  );
                })() : null}
                <span className="w-5 shrink-0 text-[11px] font-mono text-slate-400 tabular-nums">
                  {i + 1}
                </span>
                <span aria-hidden="true" className="text-base leading-none">{meta.icon}</span>

                <span className="font-mono text-xs font-bold text-slate-800 flex-1">
                  {node.kind === 'REPETER' ? (
                    <span className="flex items-center gap-1.5 flex-wrap">
                      RÉPÉTER
                      <span className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          disabled={locked || node.times <= 1}
                          onClick={() => setTimes(i, node.times - 1)}
                          aria-label="Une répétition de moins"
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg border-2 border-purple-300 bg-white text-purple-700 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                        >
                          <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <span
                          className="min-w-[2ch] text-center text-sm tabular-nums text-purple-800"
                          aria-label={`${node.times} fois`}
                        >
                          {node.times}
                        </span>
                        <button
                          type="button"
                          disabled={locked || node.times >= 10}
                          onClick={() => setTimes(i, node.times + 1)}
                          aria-label="Une répétition de plus"
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg border-2 border-purple-300 bg-white text-purple-700 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                        >
                          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </span>
                      FOIS
                      <span className="text-purple-700">
                        ({(node.body || []).map((b) => INSTRUCTION_LABELS[b.kind].label).join(' + ') || 'vide'})
                      </span>
                    </span>
                  ) : (
                    <span className="whitespace-nowrap">{meta.label}</span>
                  )}
                </span>

                {isRunning && (
                  <span className="text-[10px] font-mono font-bold text-amber-700 shrink-0">
                    {node.kind === 'REPETER' && runningIteration != null
                      ? `tour ${runningIteration + 1}/${node.times}`
                      : 'en cours'}
                  </span>
                )}

                {!locked && (
                  <span className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveBy(i, -1)}
                      disabled={i === 0}
                      aria-label={`Monter l’instruction ${i + 1}`}
                      className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-25 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <ChevronUp className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBy(i, 1)}
                      disabled={i === program.length - 1}
                      aria-label={`Descendre l’instruction ${i + 1}`}
                      className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-25 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <ChevronDown className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAt(i)}
                      aria-label={`Supprimer l’instruction ${i + 1}`}
                      className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-100 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
