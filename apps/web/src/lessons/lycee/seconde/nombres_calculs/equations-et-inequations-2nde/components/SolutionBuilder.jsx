import React from 'react';
import RealLine from '../../../../../common/components/RealLine';
import { Feedback } from '../../../../../common/components/LessonUI';
import { formatDec } from '@smarter-academy/core';

/**
 * SolutionBuilder — POSER soi-même l'ensemble des solutions sur une droite.
 *
 * Activity               trois décisions, dans l'ordre où on les prend en
 *                        résolvant : où est la borne (curseur déplaçable sur
 *                        l'axe), le crochet est-il fermé ou ouvert, et de quel
 *                        côté part la bande.
 * Mathematical objective l'ensemble des solutions d'une inéquation du premier
 *                        degré est une DEMI-DROITE : une borne, une inclusion,
 *                        un sens.
 * Controlled variable    la borne, le type de crochet, la direction.
 * Mathematical state     { bound, closed, toRight } — comparé à la cible.
 * Visual consequence     la bande verte se redessine à chaque décision ; les
 *                        trois verdicts s'affichent séparément, donc l'élève
 *                        sait LAQUELLE des trois est encore fausse.
 * Misconception targeted « ≥ donne une flèche vers la droite » appliqué
 *                        mécaniquement (faux quand on a divisé par un négatif) ;
 *                        crochet fermé confondu avec crochet ouvert.
 *
 * Jamais gelé : après réussite, l'élève peut continuer à déplacer la borne et
 * à basculer les crochets pour voir l'ensemble changer.
 */
export default function SolutionBuilder({
  target,                 // { bound, closed, toRight }
  value,                  // { bound, closed, toRight }
  onChange,
  min = -6, max = 8, step = 1,
  label = 'Ensemble des solutions',
}) {
  const { bound, closed, toRight } = value;
  const okBound = bound === target.bound;
  const okClosed = closed === target.closed;
  const okDir = toRight === target.toRight;
  const allOk = okBound && okClosed && okDir;

  const set = (patch) => onChange({ ...value, ...patch });

  const chip = (on, ok) =>
    `min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
      on
        ? ok
          ? 'bg-emerald-600 border-emerald-700 text-white'
          : 'bg-indigo-600 border-indigo-700 text-white'
        : 'bg-white border-slate-300 text-slate-700 hover:border-indigo-400'
    }`;

  const interval = toRight
    ? { id: 'S', from: bound, to: Infinity, openFrom: !closed, tone: allOk ? 'emerald' : 'indigo' }
    : { id: 'S', from: -Infinity, to: bound, openTo: !closed, tone: allOk ? 'emerald' : 'indigo' };

  // formatDec produit le vrai signe moins (U+2212), comme les options du QCM
  // qui suit : sans lui, « [-2 ; +∞[ » ne correspondrait pas à « [−2 ; +∞[ ».
  const b = formatDec(bound);
  const written = toRight
    ? `${closed ? '[' : ']'}${b} ; +∞[`
    : `]−∞ ; ${b}${closed ? ']' : '['}`;

  return (
    <div className="space-y-3" role="group" aria-label={label}>
      <RealLine
        min={min} max={max} step={step}
        intervals={[interval]}
        handles={[{
          id: 'b', value: bound, onChange: (v) => set({ bound: v }),
          label: 'borne', tone: okBound ? 'emerald' : 'indigo',
          ariaLabel: 'la borne de l’ensemble des solutions',
        }]}
        ariaLabel={`Droite graduée — ensemble des solutions ${written}`}
      />

      <div className="flex flex-wrap gap-2">
        <div className="flex gap-2" role="group" aria-label="Type de borne">
          <button type="button" className={chip(closed, okClosed)} aria-pressed={closed}
            onClick={() => set({ closed: true })}>
            Borne incluse {toRight ? '[' : ']'}
          </button>
          <button type="button" className={chip(!closed, okClosed)} aria-pressed={!closed}
            onClick={() => set({ closed: false })}>
            Borne exclue {toRight ? ']' : '['}
          </button>
        </div>
        <div className="flex gap-2" role="group" aria-label="Sens de la demi-droite">
          <button type="button" className={chip(!toRight, okDir)} aria-pressed={!toRight}
            onClick={() => set({ toRight: false })}>
            ← vers −∞
          </button>
          <button type="button" className={chip(toRight, okDir)} aria-pressed={toRight}
            onClick={() => set({ toRight: true })}>
            vers +∞ →
          </button>
        </div>
      </div>

      <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 font-mono text-sm font-bold text-slate-800"
        aria-live="polite" data-solution={written}>
        S = {written}
      </div>

      {allOk ? (
        <Feedback tone="ok">
          C’est cela : <span className="font-mono font-bold">{written}</span>. Trois décisions —
          la borne, le crochet, le sens — et l’ensemble est écrit.
        </Feedback>
      ) : (
        <Feedback tone="info">
          {!okBound
            ? 'La borne n’est pas au bon endroit : résous l’inéquation pour la trouver.'
            : !okDir
              ? 'La borne est juste. Reste à choisir de quel côté partent les solutions : teste un nombre au hasard dans ta bande.'
              : 'Borne et sens justes. Le crochet : l’inégalité est-elle large (borne incluse) ou stricte (borne exclue) ?'}
        </Feedback>
      )}
    </div>
  );
}
