import React from 'react';

/**
 * AireLab — la distributivité, LUE sur l'aire d'un rectangle.
 *
 * Activity              régler les dimensions d'un rectangle dont un côté
 *                       (ou les deux) est une somme, et lire son aire de
 *                       DEUX façons : le grand rectangle d'un bloc, ou la
 *                       somme des morceaux.
 * Mathematical objective k(a + b) = ka + kb n'est pas une règle à retenir :
 *                       c'est le constat que la MÊME aire se calcule des
 *                       deux façons. La forme factorisée et la forme
 *                       développée sont deux lectures d'une seule figure —
 *                       ce qui explique aussi pourquoi factoriser est
 *                       exactement le chemin inverse.
 * Student action        −/+ sur chaque dimension.
 * Controlled variable   une dimension à la fois (§8).
 * Mathematical state    les dimensions — détenues par le MODULE (composant
 *                       contrôlé, donc rejouable et sans état caché).
 * Visual consequence    chaque morceau porte son aire ; la ligne de découpe
 *                       est visible ; le total s'affiche sous les deux
 *                       écritures.
 * Expected observation  « je peux couper où je veux, l'aire totale ne
 *                       change pas ».
 * Misconception targeted « 3(x + 2) = 3x + 2 » — oublier de distribuer sur
 *                       le second terme. Ici le morceau oublié est
 *                       littéralement visible à l'écran.
 *
 * SÉCURITÉ VISUELLE (§17bis) : le rectangle est une grille CSS, pas un SVG à
 * coordonnées. Les libellés vivent dans les cellules et sur les marges ; une
 * dimension à deux chiffres élargit sa cellule au lieu de déborder. Les
 * proportions sont bornées par `frFor`, si bien qu'aucun morceau ne devient
 * invisible même au réglage le plus déséquilibré.
 */

/**
 * La fraction de largeur d'un morceau, bornée pour rester LISIBLE.
 *
 * Les proportions sont indicatives, pas métriques : x est une longueur
 * inconnue, on ne peut pas la dessiner à l'échelle. La borne à 22 % garantit
 * qu'aucun morceau ne se réduit à un trait — un morceau invisible est un
 * morceau que l'élève oublie, exactement l'erreur que la figure doit
 * empêcher.
 */
const frFor = (part, total) => {
  const brut = part / total;
  return Math.min(Math.max(brut, 0.22), 0.78);
};

const Stepper = ({ label, value, onChange, min = 1, max = 9, disabled, tone = 'sky' }) => {
  const TONES = { sky: 'border-sky-300 bg-sky-50 text-sky-800', emerald: 'border-emerald-300 bg-emerald-50 text-emerald-800' };
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[13px] font-semibold text-slate-500">{label}</span>
      <button
        type="button"
        aria-label={`Diminuer ${label}`}
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
        className="min-h-[40px] min-w-[40px] rounded-lg border-2 border-slate-300 bg-white text-lg font-bold text-slate-600 hover:border-slate-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        −
      </button>
      <span className={`inline-flex min-h-[40px] min-w-[44px] items-center justify-center rounded-lg border-2 text-lg font-black tabular-nums ${TONES[tone]}`}>
        {value}
      </span>
      <button
        type="button"
        aria-label={`Augmenter ${label}`}
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
        className="min-h-[40px] min-w-[40px] rounded-lg border-2 border-slate-300 bg-white text-lg font-bold text-slate-600 hover:border-slate-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        +
      </button>
    </div>
  );
};

/**
 * @param {'simple'|'double'} mode
 *   simple : hauteur k, largeur (x + b) → deux morceaux
 *   double : hauteur (x + d), largeur (x + b) → quatre morceaux
 */
export default function AireLab({
  mode = 'simple',
  k = 3,          // hauteur, en mode simple
  b = 2,          // la constante de la largeur (x + b)
  d = 1,          // la constante de la hauteur (x + d), en mode double
  onK, onB, onD,
  disabled = false,
  showTotal = true,
}) {
  const double = mode === 'double';
  // Une valeur d'affichage pour x — sert UNIQUEMENT aux proportions du
  // dessin, jamais au calcul : les étiquettes restent littérales.
  const xVisuel = 3;
  const largeurTotale = xVisuel + b;
  const hauteurTotale = double ? xVisuel + d : k;

  const colX = `${frFor(xVisuel, largeurTotale) * 100}%`;
  const colB = `${(1 - frFor(xVisuel, largeurTotale)) * 100}%`;
  const rowX = double ? `${frFor(xVisuel, hauteurTotale) * 100}%` : '100%';
  const rowD = double ? `${(1 - frFor(xVisuel, hauteurTotale)) * 100}%` : '0%';

  const Case = ({ children, tone }) => (
    <div
      className={`flex items-center justify-center border-2 border-white text-sm font-black sm:text-base ${tone}`}
    >
      {children}
    </div>
  );

  return (
    <div className="space-y-3 rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4">
      {/* Les dimensions vivent sur les marges, dans le DOM : elles ne peuvent
          pas recouvrir la figure. */}
      <div className="flex items-stretch gap-2">
        <div className="flex w-14 shrink-0 flex-col justify-around text-right text-xs font-bold text-emerald-700">
          {double ? (
            <>
              <span>x</span>
              <span>{d}</span>
            </>
          ) : (
            <span>{k}</span>
          )}
        </div>

        <div className="flex-1">
          <div
            className="grid h-40 w-full overflow-hidden rounded-lg border-2 border-slate-400 sm:h-48"
            style={{
              gridTemplateColumns: `${colX} ${colB}`,
              gridTemplateRows: double ? `${rowX} ${rowD}` : '100%',
            }}
            role="img"
            aria-label={
              double
                ? `Rectangle de dimensions (x + ${d}) et (x + ${b}), coupé en quatre morceaux.`
                : `Rectangle de hauteur ${k} et de largeur (x + ${b}), coupé en deux morceaux.`
            }
          >
            {double ? (
              <>
                <Case tone="bg-sky-300 text-sky-900">x²</Case>
                <Case tone="bg-sky-200 text-sky-900">{b === 1 ? 'x' : `${b}x`}</Case>
                <Case tone="bg-emerald-200 text-emerald-900">{d === 1 ? 'x' : `${d}x`}</Case>
                <Case tone="bg-emerald-300 text-emerald-900">{b * d}</Case>
              </>
            ) : (
              <>
                <Case tone="bg-sky-300 text-sky-900">{k === 1 ? 'x' : `${k}x`}</Case>
                <Case tone="bg-emerald-300 text-emerald-900">{k * b}</Case>
              </>
            )}
          </div>

          <div className="mt-1 flex text-xs font-bold text-sky-700" style={{ }}>
            <span style={{ width: colX }} className="text-center">x</span>
            <span style={{ width: colB }} className="text-center">{b}</span>
          </div>
        </div>
      </div>

      {showTotal && (
        <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-3 text-center">
          <div className="font-mono text-base font-bold text-slate-700">
            {double ? (
              <>
                (x + {d})(x + {b}) = x² + {b + d === 1 ? '' : b + d}x + {b * d}
              </>
            ) : (
              <>
                {k}(x + {b}) = {k === 1 ? 'x' : `${k}x`} + {k * b}
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {double
              ? 'Le grand rectangle d’un bloc, ou la somme des quatre morceaux : la même aire.'
              : 'Le grand rectangle d’un bloc, ou la somme des deux morceaux : la même aire.'}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {double ? (
          <Stepper label="hauteur : x +" value={d} onChange={onD} disabled={disabled} tone="emerald" />
        ) : (
          <Stepper label="hauteur" value={k} onChange={onK} disabled={disabled} tone="emerald" />
        )}
        <Stepper label="largeur : x +" value={b} onChange={onB} disabled={disabled} tone="sky" />
      </div>
    </div>
  );
}
