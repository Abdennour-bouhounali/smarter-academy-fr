import React from 'react';
import MathText from '../../../../../common/components/MathText';
import { commonDenominator, expandTo, formatFrac, normalize } from './rationalUtils';

/**
 * CommonDenominatorPicker — le choix du dénominateur commun, EXTRAIT de
 * l'ancien module 03 (« Addition et Soustraction ») et remis aux normes :
 * état contrôlé, candidats incluant des PIÈGES (des non-multiples), les deux
 * fractions ré-écrites EN DIRECT, et le refus expliqué mathématiquement.
 *
 * Activity: choisir un nombre de parts qui convient AUX DEUX barres.
 * Mathematical objective: additionner deux rationnels exige une découpe
 *   commune — un multiple commun des deux dénominateurs.
 * Student action: taper une puce candidate.
 * Controlled variable: le dénominateur commun proposé.
 * Mathematical state: le candidat choisi ; les deux ré-écritures en dérivent
 *   par `expandTo` (null = découpe impossible).
 * Visual consequence: si le candidat convient, les deux fractions se
 *   ré-écrivent avec leur facteur ; sinon la ligne reste barrée avec la raison.
 * Expected observation: 12 et 24 marchent tous les deux, 6 est le plus petit
 *   qui marche pour 2 et 3 — plusieurs découpes communes existent.
 * Misconception targeted: « le dénominateur commun est la somme (ou la
 *   différence) des dénominateurs » et « n'importe quel grand nombre marche ».
 * Feedback: « 7 n'est pas un multiple de 3 : on ne peut pas couper des tiers
 *   en 7 parts égales. » (rendu par le module via `onPick`).
 * Formalization: dénominateur commun = multiple commun ; le plus petit est
 *   le PPCM.
 * Scaffolding: le PPCM est mis en évidence une fois trouvé.
 * Transfer: le module 4 branche ce choix sur RationalBar — la découpe
 *   choisie recoupe VRAIMENT les deux barres.
 *
 * @param {{num,den}} a @param {{num,den}} b
 * @param {number[]} candidates
 * @param {number|null} picked
 * @param {(d:number, ok:boolean)=>void} onPick
 * @param {boolean} [frozen=false]
 */
export default function CommonDenominatorPicker({
  a,
  b,
  candidates,
  picked = null,
  onPick,
  frozen = false,
}) {
  const x = normalize(a);
  const y = normalize(b);
  const best = commonDenominator(x, y);

  const ea = picked ? expandTo(x, picked) : null;
  const eb = picked ? expandTo(y, picked) : null;
  const ok = !!(ea && eb);

  return (
    <div className="space-y-3" role="group" aria-label="Choix du dénominateur commun">
      <div className="rounded-2xl border-2 border-violet-200 bg-violet-50/50 p-4 space-y-3">
        <p className="text-center text-sm text-slate-700">
          Pour poser <MathText>{`$${formatFrac(x)} + ${formatFrac(y)}$`}</MathText>, il faut{' '}
          <strong>une seule et même découpe</strong>. Combien de parts ?
        </p>

        <div className="flex items-center justify-center gap-2 flex-wrap">
          {candidates.map((d) => {
            const works = d % x.den === 0 && d % y.den === 0;
            const sel = picked === d;
            return (
              <button
                key={d}
                type="button"
                disabled={frozen}
                onClick={() => onPick?.(d, works)}
                aria-pressed={sel}
                aria-label={`Essayer ${d} parts`}
                className={`min-w-[52px] min-h-[44px] px-3 rounded-xl border-2 text-base font-extrabold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  sel
                    ? works
                      ? 'bg-emerald-600 border-emerald-700 text-white'
                      : 'bg-rose-600 border-rose-700 text-white'
                    : 'bg-white border-violet-300 text-violet-700 hover:border-violet-500'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>

        {picked !== null && !ok && (
          <p className="text-center text-sm font-semibold text-rose-700 bg-rose-50 border-2 border-rose-200 rounded-xl px-3 py-2">
            {picked % x.den !== 0 && (
              <>
                {picked} n’est pas un multiple de {x.den} : on ne peut pas couper des parts de{' '}
                <MathText>{`$\\frac{1}{${x.den}}$`}</MathText> en {picked} parts égales.
              </>
            )}
            {picked % x.den === 0 && picked % y.den !== 0 && (
              <>
                {picked} n’est pas un multiple de {y.den} : la deuxième barre ne se recoupe pas ainsi.
              </>
            )}
          </p>
        )}

        {ok && (
          <div className="space-y-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <Rewrite from={x} to={ea} tone="indigo" />
              <Rewrite from={y} to={eb} tone="violet" />
            </div>
            <p className="text-center text-sm font-semibold text-emerald-800 bg-emerald-50 border-2 border-emerald-200 rounded-xl px-3 py-2">
              Même découpe : on peut additionner les parts.{' '}
              <MathText>
                {`$\\frac{${ea.num}}{${picked}} + \\frac{${eb.num}}{${picked}} = \\frac{${ea.num + eb.num}}{${picked}}$`}
              </MathText>
              {picked === best && ' — et c’est la plus petite découpe qui marche (le PPCM).'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Rewrite({ from, to, tone }) {
  const cls = tone === 'violet' ? 'border-violet-300 bg-white' : 'border-indigo-300 bg-white';
  return (
    <div className={`rounded-xl border-2 p-3 text-center ${cls}`}>
      <MathText className="text-lg">{`$${formatFrac(from)} = \\frac{${to.num}}{${to.den}}$`}</MathText>
      <div className="text-[11px] font-mono text-slate-500 mt-1">
        (chaque part coupée en {to.factor} : ×{to.factor} en haut ET en bas)
      </div>
    </div>
  );
}
