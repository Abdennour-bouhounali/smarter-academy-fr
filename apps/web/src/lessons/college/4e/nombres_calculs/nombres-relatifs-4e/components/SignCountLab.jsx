import React from 'react';
import { fmt, compterNegatifs, signeDuProduit, produit } from './operations';

/**
 * SignCountLab — la manipulation du module 3.
 *
 * Quatre facteurs dont l'élève RETOURNE le signe d'un clic. À chaque bascule,
 * le compteur de négatifs change de parité et le signe du produit bascule
 * avec lui, immédiatement. La valeur absolue du produit, elle, ne bouge pas :
 * c'est ce qui isole le signe comme la seule chose en jeu.
 *
 * Cause → effet immédiat, une seule variable à la fois (§5, §8) : un clic
 * change UN signe, et rien d'autre.
 *
 * Sécurité visuelle (§17bis) : aucun SVG, tout est du DOM qui se replie ;
 * les jetons passent à la ligne sans jamais se chevaucher.
 */
export default function SignCountLab({ facteurs, onToggle, disabled = false }) {
  const nNeg = compterNegatifs(facteurs);
  const signe = signeDuProduit(facteurs);
  const p = produit(facteurs);
  const pair = nNeg % 2 === 0;

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Facteurs du produit">
        {facteurs.map((f, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="text-slate-400 font-bold" aria-hidden="true">×</span>}
            <button
              type="button"
              disabled={disabled}
              onClick={() => onToggle?.(i)}
              aria-label={`Facteur ${fmt(f)} — cliquer pour changer son signe`}
              className={[
                'min-h-[44px] min-w-[56px] px-3 rounded-xl border-2 text-base font-black tabular-nums transition-colors',
                f < 0
                  ? 'border-rose-400 bg-rose-50 text-rose-700'
                  : 'border-indigo-300 bg-indigo-50 text-indigo-700',
                disabled ? 'opacity-60' : 'hover:brightness-95',
              ].join(' ')}
            >
              {fmt(f)}
            </button>
          </React.Fragment>
        ))}
      </div>

      <p className="text-xs text-slate-500">
        Clique sur un facteur pour changer son signe. Seul le signe change — jamais la valeur.
      </p>

      <div className="grid sm:grid-cols-3 gap-2">
        <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-3 text-center">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">Facteurs négatifs</div>
          <div className="text-2xl font-black tabular-nums text-slate-800">{nNeg}</div>
          <div className={`text-xs font-bold ${pair ? 'text-indigo-600' : 'text-rose-600'}`}>
            {pair ? 'nombre pair' : 'nombre impair'}
          </div>
        </div>

        <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-3 text-center">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">Signe attendu</div>
          <div className={`text-2xl font-black ${signe > 0 ? 'text-indigo-700' : signe < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
            {signe > 0 ? '+' : signe < 0 ? '−' : '0'}
          </div>
          <div className="text-xs text-slate-500">
            {signe === 0 ? 'un facteur est nul' : pair ? 'pair → positif' : 'impair → négatif'}
          </div>
        </div>

        <div className="rounded-xl border-2 border-slate-300 bg-white p-3 text-center">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">Produit</div>
          <div className={`text-2xl font-black tabular-nums ${p < 0 ? 'text-rose-600' : p > 0 ? 'text-indigo-700' : 'text-slate-800'}`}>
            {fmt(p)}
          </div>
          <div className="text-xs text-slate-500 tabular-nums">
            valeur : {Math.abs(p)}
          </div>
        </div>
      </div>
    </div>
  );
}
