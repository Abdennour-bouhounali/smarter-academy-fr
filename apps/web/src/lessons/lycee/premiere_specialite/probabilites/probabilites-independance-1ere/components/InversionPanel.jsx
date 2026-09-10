import React from 'react';
import { inversionPair, pct, quotient } from './indepUtils';

/**
 * InversionPanel — LE MÊME NUMÉRATEUR, DEUX DÉNOMINATEURS.
 *
 * Ce que le composant doit rendre visible, et rien d'autre : dans les deux sens
 * du conditionnement, le HAUT du quotient ne bouge pas. C'est le BAS qui change
 * de camp. Les deux quotients sont donc écrits l'un sous l'autre, alignés sur
 * la barre de fraction, avec le numérateur commun mis en évidence de la même
 * couleur des deux côtés.
 *
 * `revealInverse` gouverne le dévoilement : le module montre d'abord le sens
 * direct seul, laisse l'élève PRÉDIRE l'autre, puis affiche les deux. Ce n'est
 * pas un gel — le laboratoire du module 1 reste manipulable ; ici il n'y a rien
 * à manipuler, ce panneau est une FIGURE de lecture, pas une manipulation.
 *
 * Tous les nombres vivent dans le DOM. Aucun SVG : aucune collision possible.
 */
export default function InversionPanel({
  table,
  fromAxis = 'row',
  fromKey,
  toKey,
  labels = {},
  revealInverse = true,
  question = null,          // ReactNode inséré à la place du sens inverse
}) {
  const inv = inversionPair(table, { fromAxis, fromKey, toKey });
  const lab = (k) => labels[k] ?? k;

  const Card = ({ tone, universe, num, den, value, note }) => (
    <div className={`rounded-xl border-2 px-3 py-3 ${tone}`}>
      <p className="text-xs font-semibold mb-1.5">parmi les <strong>{universe}</strong></p>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-mono text-xl font-black tabular-nums">
          <span className="text-fuchsia-700">{num}</span>
          <span className="opacity-40"> / </span>
          <span>{den}</span>
        </span>
        <span className="opacity-40">=</span>
        <span className="font-mono text-xl font-black tabular-nums">{value}</span>
      </div>
      {note && <p className="mt-1.5 text-xs opacity-80">{note}</p>}
    </div>
  );

  return (
    <div className="rounded-2xl border-2 border-violet-100 bg-white p-4 space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card
          tone="border-violet-300 bg-violet-50 text-violet-900"
          universe={lab(fromKey)}
          num={inv.numerator}
          den={inv.denomDirect}
          value={pct(inv.direct, 1)}
          note={<>le groupe de départ compte {inv.denomDirect} individus</>}
        />
        {revealInverse ? (
          <Card
            tone="border-fuchsia-300 bg-fuchsia-50 text-fuchsia-900"
            universe={lab(toKey)}
            num={inv.numerator}
            den={inv.denomInverse}
            value={pct(inv.inverse, 1)}
            note={<>le groupe d’arrivée en compte {inv.denomInverse}</>}
          />
        ) : (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-500">
            {question ?? (
              <>
                parmi les <strong>{lab(toKey)}</strong> — ils sont {inv.denomInverse} — quelle
                part vérifie l’autre critère ?
              </>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-600">
        Le numérateur est <strong className="font-mono tabular-nums text-fuchsia-700">{inv.numerator}</strong>{' '}
        des deux côtés : ce sont les mêmes individus, ceux qui vérifient les deux critères.
        {revealInverse && (
          <>
            {' '}Seul le dénominateur change :{' '}
            <span className="font-mono tabular-nums">{quotient(inv.numerator, inv.denomDirect)}</span>{' '}
            d’un côté,{' '}
            <span className="font-mono tabular-nums">{quotient(inv.numerator, inv.denomInverse)}</span>{' '}
            de l’autre
            {inv.same
              ? ' — et ici les deux groupes ont la même taille, ce qui est l’exception.'
              : ` — et comme ${inv.denomDirect} n’est pas ${inv.denomInverse}, les deux pourcentages diffèrent.`}
          </>
        )}
      </p>
    </div>
  );
}
