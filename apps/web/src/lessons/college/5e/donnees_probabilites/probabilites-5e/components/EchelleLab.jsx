import React, { useRef, useState } from 'react';
import { qualifier, pct } from './probabilites';

/**
 * EchelleLab — placer un événement sur la règle graduée de 0 à 1.
 *
 * L'élève FAIT GLISSER le curseur (memory « manipuler la figure elle-même,
 * jamais des boutons +/− ») jusqu'à l'endroit où il pense que se situe la
 * probabilité de l'événement proposé. La règle porte ses repères nommés :
 * impossible (0), une chance sur deux (1/2), certain (1).
 *
 * TOLÉRANCE < CE QUE L'ÉLÈVE VOIT (memory « invariant visuel ») : la
 * tolérance de validation est de 0,05, soit 5 % de la longueur de la règle —
 * environ 15 px sur une règle de 300 px, donc nettement plus fin que la
 * largeur du curseur, mais assez large pour ne pas exiger le pixel.
 *
 * JAMAIS GELÉ : le curseur reste déplaçable après validation.
 */
const TOLERANCE = 0.05;

export default function EchelleLab({
  evenement,
  valeur,
  onValeur,
  cible = null,
  montrerCible = false,
  ariaLabel,
}) {
  const rail = useRef(null);
  const [attrape, setAttrape] = useState(false);

  /* Position → probabilité, bornée à [0 ; 1] et arrondie au centième :
     l'élève ne peut pas produire une valeur hors de l'échelle, ce qui rend
     l'invariant « 0 ≤ p ≤ 1 » vrai par construction du dispositif. */
  const depuisClient = (clientX) => {
    const r = rail.current?.getBoundingClientRect();
    if (!r || r.width === 0) return valeur;
    return Math.round(Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * 100) / 100;
  };

  const bouge = (e) => {
    if (!attrape) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    onValeur(depuisClient(x));
  };

  const clavier = (e) => {
    const pas = e.shiftKey ? 0.1 : 0.01;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onValeur(Math.round(Math.max(0, valeur - pas) * 100) / 100);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onValeur(Math.round(Math.min(1, valeur + pas) * 100) / 100);
    }
  };

  const q = qualifier(valeur);
  const juste = cible !== null && Math.abs(valeur - cible) <= TOLERANCE;

  return (
    <div className="space-y-3" aria-label={ariaLabel ?? 'Échelle des probabilités'}>
      {evenement && (
        <div className="rounded-xl border-2 border-rose-200 bg-rose-50 px-3 py-2 text-center text-sm text-slate-700">
          Où placerais-tu «&nbsp;<strong>{evenement}</strong>&nbsp;» ?
        </div>
      )}

      <div
        className="select-none px-2 py-6"
        onMouseMove={bouge}
        onMouseUp={() => setAttrape(false)}
        onMouseLeave={() => setAttrape(false)}
        onTouchMove={bouge}
        onTouchEnd={() => setAttrape(false)}
      >
        <div
          ref={rail}
          className="relative h-4 rounded-full border-2 border-slate-300 bg-gradient-to-r from-rose-200 via-amber-100 to-emerald-200"
          onMouseDown={(e) => { setAttrape(true); onValeur(depuisClient(e.clientX)); }}
          onTouchStart={(e) => { setAttrape(true); onValeur(depuisClient(e.touches[0].clientX)); }}
        >
          {/* Les trois repères nommés de l'échelle. */}
          {[
            { p: 0, l: '0' },
            { p: 0.5, l: '1/2' },
            { p: 1, l: '1' },
          ].map((r) => (
            <div key={r.p} className="absolute -top-1 h-6 w-0.5 bg-slate-400" style={{ left: `${r.p * 100}%` }}>
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-xs font-bold text-slate-500">
                {r.l}
              </span>
            </div>
          ))}

          {/* La cible, révélée seulement après la réponse. */}
          {montrerCible && cible !== null && (
            <div
              className="absolute -top-2 h-8 w-1 rounded bg-purple-600"
              style={{ left: `${cible * 100}%` }}
              aria-hidden
            />
          )}

          {/* Le curseur — c'est LUI qu'on fait glisser. */}
          <button
            type="button"
            onKeyDown={clavier}
            onMouseDown={() => setAttrape(true)}
            onTouchStart={() => setAttrape(true)}
            role="slider"
            aria-valuemin={0}
            aria-valuemax={1}
            aria-valuenow={valeur}
            aria-valuetext={`${pct(valeur, 0)} — ${q.mot}`}
            aria-label="Curseur de probabilité"
            className={`absolute top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-4 bg-white shadow-md transition-colors focus:outline-none active:cursor-grabbing ${
              juste ? 'border-emerald-500' : 'border-slate-600'
            }`}
            style={{ left: `${valeur * 100}%` }}
          >
            {/* Anneau de focus dessiné SUR la pastille : le contour noir par
                défaut du navigateur est tué par focus:outline-none, et
                remplacé par un anneau visible sur le disque lui-même
                (memory « anneau de focus des poignées SVG »). */}
            <span className="pointer-events-none absolute inset-0 rounded-full ring-0 ring-sky-400/60 transition-all peer-focus:ring-4" />
          </button>
        </div>

        <div className="mt-6 flex justify-between text-xs text-slate-500">
          <span>impossible</span>
          <span>certain</span>
        </div>
      </div>

      <div className="rounded-xl border-2 border-slate-200 bg-white p-3 text-center" role="status">
        <div className="font-mono text-2xl font-black tabular-nums text-slate-800">
          {pct(valeur, 0)}
        </div>
        <div className="text-sm text-slate-600">
          Tu places cet événement dans «&nbsp;<strong>{q.mot}</strong>&nbsp;».
        </div>
      </div>
    </div>
  );
}
