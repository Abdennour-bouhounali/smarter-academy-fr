import React from 'react';
import { X } from 'lucide-react';
import { ratSign, ratAbs, ratToNumber, ratIsInt, likeTermIndices } from './exprCore';

/**
 * TileBoard — les TUILES ALGÉBRIQUES, manipulation partagée des deux leçons
 * d'algèbre de 4e.
 *
 * Activity              cliquer une tuile pour la sélectionner, puis
 *                       « regrouper » : toutes ses semblables fusionnent en
 *                       une seule.
 * Mathematical objective réduire une expression, c'est ADDITIONNER LES
 *                       TERMES SEMBLABLES — et rien d'autre. 3x + 2x fait 5x
 *                       parce que trois objets plus deux objets font cinq
 *                       objets ; 3x + 2 ne fait pas 5x parce que ce ne sont
 *                       pas les mêmes objets.
 * Student action        un tap sur une tuile, un tap sur « Regrouper ».
 * Controlled variable   la liste des termes, et elle seule.
 * Mathematical state    `terms` — détenu par le MODULE, jamais ici. Ce
 *                       composant est CONTRÔLÉ : il rend un état et signale
 *                       un geste, il n'en garde aucun. C'est ce qui rend la
 *                       manipulation rejouable, annulable et immunisée aux
 *                       remontages de React (brief §6, §7).
 * Visual consequence    les tuiles semblables s'éclairent ensemble ; après
 *                       le regroupement, une seule tuile porte le total.
 * Expected observation  « les tuiles bleues vont avec les bleues, les grises
 *                       avec les grises — et jamais l'inverse ».
 * Misconception targeted « 3x + 2 = 5x » : la tuile x et la tuile unité
 *                       n'ont NI la même forme NI la même couleur, et le
 *                       bouton « Regrouper » ne les réunit jamais.
 *
 * SÉCURITÉ VISUELLE (§17bis). Aucun SVG : les tuiles sont des boutons du
 * DOM dans un `flex-wrap`. Une expression longue passe à la ligne, une
 * tuile large (coefficient à deux chiffres, fraction) pousse ses voisines —
 * rien ne peut se chevaucher ni sortir du cadre, pour AUCUN état
 * atteignable, y compris à 375 px.
 */

/** L'étiquette d'un terme, sans son signe : « 3x », « x », « 5 ». */
function tileLabel(t) {
  const a = ratAbs(t.coef);
  const v = ratIsInt(a) ? String(a.n) : `${a.n}/${a.d}`;
  if (!t.isX) return v;
  return v === '1' ? 'x' : `${v}x`;
}

export default function TileBoard({
  terms,               // [{coef, isX}] — l'état, détenu par le module
  selected = null,     // index de la tuile sélectionnée, ou null
  onSelect,            // (index) => void
  highlightLike = true,// éclairer les semblables de la sélection
  disabled = false,
  label = 'Expression',
  emptyHint = 'Aucun terme.',
}) {
  const like = selected !== null && highlightLike ? likeTermIndices(terms, selected) : [];

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{label}</p>

      {terms.length === 0 ? (
        <p className="text-sm text-slate-400 italic">{emptyHint}</p>
      ) : (
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={label}>
          {terms.map((t, i) => {
            const neg = ratSign(t.coef) < 0;
            const isSel = i === selected;
            const isLike = like.includes(i) && !isSel;
            return (
              <React.Fragment key={`${i}-${ratToNumber(t.coef)}-${t.isX}`}>
                {/* L'opérateur entre deux tuiles : + ou −, jamais collé au nombre. */}
                {i > 0 && (
                  <span className="px-0.5 text-base font-bold text-slate-500" aria-hidden="true">
                    {neg ? '−' : '+'}
                  </span>
                )}
                {i === 0 && neg && (
                  <span className="text-base font-bold text-slate-500" aria-hidden="true">−</span>
                )}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect?.(i)}
                  aria-pressed={isSel}
                  aria-label={`${neg ? 'moins ' : ''}${tileLabel(t)}${t.isX ? ', tuile inconnue' : ', tuile unité'}`}
                  className={[
                    // La tuile x est un RECTANGLE haut et bleu, la tuile unité
                    // un CARRÉ gris : la forme distingue les termes autant que
                    // la couleur (accessibilité — §17, jamais la couleur seule).
                    'min-h-[44px] px-3 rounded-xl border-2 font-bold tabular-nums text-base',
                    'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                    t.isX ? 'min-w-[52px]' : 'min-w-[44px] rounded-lg',
                    isSel
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : isLike
                      ? t.isX
                        ? 'border-blue-400 bg-blue-100 text-blue-800'
                        : 'border-slate-400 bg-slate-200 text-slate-800'
                      : t.isX
                      ? 'border-blue-300 bg-blue-50 text-blue-800 hover:border-blue-500'
                      : 'border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-500',
                    disabled ? 'opacity-60 cursor-default' : 'cursor-pointer',
                  ].join(' ')}
                >
                  {tileLabel(t)}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Légende des deux familles de tuiles. Rendue à part pour qu'un module
 * puisse la montrer une fois et ne pas la répéter à chaque plateau.
 */
export function TileLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
      <span className="flex items-center gap-1.5">
        <span className="inline-flex min-h-[28px] min-w-[36px] items-center justify-center rounded-xl border-2 border-blue-300 bg-blue-50 px-2 font-bold text-blue-800">
          x
        </span>
        une tuile <strong>inconnue</strong>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-flex min-h-[28px] min-w-[28px] items-center justify-center rounded-lg border-2 border-slate-300 bg-slate-50 px-2 font-bold text-slate-700">
          1
        </span>
        une tuile <strong>unité</strong>
      </span>
      <span className="flex items-center gap-1.5 text-slate-500">
        <X className="w-3.5 h-3.5" aria-hidden="true" />
        elles ne se mélangent jamais
      </span>
    </div>
  );
}
