import React, { useMemo, useState } from 'react';
import { fr } from './statistiques';

/**
 * PartageLab — la moyenne DÉCOUVERTE comme un partage équitable.
 *
 * L'élève voit les piles de livres de chaque élève, très inégales. Un bouton
 * « répartir équitablement » met tout en commun et redistribue : les piles
 * s'égalisent à la même hauteur. Ce nombre-là, il l'obtient AVANT qu'on lui
 * dise le mot « moyenne » et avant qu'on lui donne la formule.
 *
 * On peut aussi tirer une pile à la main (glisser vers le haut/bas) pour
 * déplacer des livres d'un élève à l'autre : le TOTAL ne bouge pas, et
 * l'élève constate que quelle que soit la façon de redistribuer, la hauteur
 * commune est toujours la même. C'est la propriété qui fonde la moyenne.
 *
 * JAMAIS GELÉ : ni le bouton ni les piles ne se désactivent après validation.
 */
export default function PartageLab({
  valeurs,
  prenoms,
  onPartage,
  ariaLabel = 'Partage équitable des livres',
}) {
  const [etat, setEtat] = useState(() => [...valeurs]);
  const [partage, setPartage] = useState(false);

  const total = useMemo(() => etat.reduce((a, b) => a + b, 0), [etat]);
  const n = etat.length;
  const part = total / n;
  const max = Math.max(1, ...etat, Math.ceil(part));

  /* Redistribuer : chacun reçoit la même chose. Comme le total n'est pas
     forcément divisible, on garde la valeur décimale — c'est précisément ce
     qui fait dire à l'élève « on ne peut pas avoir 2,08 livre », et qui
     ouvre l'interprétation du module 7. */
  const repartir = () => {
    setEtat(new Array(n).fill(part));
    setPartage(true);
    onPartage?.(part);
  };

  const remettre = () => {
    setEtat([...valeurs]);
    setPartage(false);
  };

  /* Déplacer un livre d'un élève vers un autre : le total est INVARIANT,
     ce que le bandeau affiche en permanence. */
  const transferer = (i, delta) => {
    setEtat((prev) => {
      const next = [...prev];
      const j = delta > 0 ? (i + 1) % n : (i - 1 + n) % n;
      if (next[j] < 1) return prev;
      next[j] -= 1;
      next[i] += 1;
      return next;
    });
    setPartage(false);
  };

  return (
    <div className="space-y-3" aria-label={ariaLabel}>
      <div className="rounded-xl border-2 border-purple-200 bg-white p-3">
        {/* Les piles. Hauteur proportionnelle au nombre de livres —
            l'échelle est commune, donc les piles sont comparables. */}
        <div className="flex items-end justify-center gap-0.5 sm:gap-1.5 h-40 w-full" role="img"
          aria-label={etat.map((v, i) => `${prenoms[i]} : ${fr(v)}`).join(', ')}>
          {etat.map((v, i) => (
            <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1 sm:max-w-[42px]">
              <span className="font-mono text-xs font-bold tabular-nums text-purple-800">
                {Number.isInteger(v) ? v : fr(v)}
              </span>
              {/* La PILE est la cible : on la touche pour lui donner un livre,
                  pris au voisin. Pas de stepper +/− — c'est la figure
                  elle-même qu'on manipule, et la cible fait 110 px de haut. */}
              <button
                type="button"
                onClick={() => !partage && transferer(i, +1)}
                aria-label={`${prenoms[i]} : ${Number.isInteger(v) ? v : fr(v)} livre${v >= 2 ? 's' : ''}${partage ? '' : ' — toucher pour lui donner un livre du voisin'}`}
                className="flex w-full cursor-pointer flex-col justify-end rounded-t-md pt-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                style={{ height: '118px' }}
              >
                <span
                  className={`block w-full rounded-t-md border-2 transition-all duration-700 ${
                    partage
                      ? 'border-purple-500 bg-purple-300'
                      : 'border-purple-300 bg-purple-100'
                  }`}
                  style={{ height: `${Math.max(2, (v / max) * 110)}px` }}
                />
              </button>
              <span className="w-full truncate text-center text-[13px] leading-none text-slate-500">
                {prenoms[i]?.slice(0, 4)}
              </span>

            </div>
          ))}
        </div>

        {/* La ligne du partage : elle apparaît une fois réparti. */}
        {partage && (
          <div className="mt-2 rounded-lg border-2 border-purple-400 bg-purple-50 px-3 py-2 text-center">
            <div className="text-xs font-semibold uppercase tracking-wide text-purple-700">
              Chacun a maintenant
            </div>
            <div className="font-mono text-2xl font-black tabular-nums text-purple-800">
              {fr(part)}
            </div>
          </div>
        )}
      </div>

      {/* Le total, TOUJOURS visible : c'est lui qui ne bouge jamais. */}
      <div className="rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm" role="status">
        Total des livres : <strong className="font-mono tabular-nums">{fr(total)}</strong> —
        réparti entre <strong className="font-mono">{n}</strong> élèves.
        <span className="block text-xs text-slate-500 mt-0.5">
          Déplacer des livres d’un élève à l’autre ne change pas ce total.
        </span>
      </div>

      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={repartir}
          className="rounded-xl border-2 border-purple-400 bg-purple-50 px-4 py-2 text-sm font-black text-purple-800 transition hover:bg-purple-100 active:scale-95"
        >
          ⚖︎ Répartir équitablement
        </button>
        <button
          type="button"
          onClick={remettre}
          className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 transition hover:border-slate-300"
        >
          ↺ Remettre comme avant
        </button>
      </div>
    </div>
  );
}
