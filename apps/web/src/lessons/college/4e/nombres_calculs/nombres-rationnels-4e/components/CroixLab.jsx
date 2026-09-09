import React from 'react';
import { produitsEnCroix } from './rationnels4e';

/**
 * CroixLab — LA manipulation signature de « Nombres rationnels » (4e).
 *
 * Activity              régler les quatre nombres d'une égalité présumée
 *                       a/b = c/d, et regarder les deux produits en croix
 *                       se recalculer à chaque cran.
 * Mathematical objective deux fractions sont égales EXACTEMENT quand leurs
 *                       produits en croix le sont. Le test d'égalité cesse
 *                       d'être « je les simplifie et je regarde » — un
 *                       procédé qui échoue dès que les nombres résistent —
 *                       pour devenir la comparaison de deux ENTIERS.
 * Student action        −/+ sur chacun des quatre termes (§16 : le stepper
 *                       suffit, un curseur serait faussement continu pour
 *                       une grandeur entière).
 * Controlled variable   les quatre entiers, un seul à la fois.
 * Mathematical state    `{a, b, c, d}`, détenu par le MODULE. Composant
 *                       CONTRÔLÉ : aucun état interne, donc rejouable et
 *                       insensible aux remontages (brief §6).
 * Visual consequence    les deux diagonales s'allument, chacune portant son
 *                       produit ; elles passent au VERT ensemble quand les
 *                       produits coïncident, au ROUGE sinon — et la barre
 *                       du milieu bascule entre = et ≠.
 * Expected observation  « je peux fabriquer une infinité d'égalités : dès
 *                       que je double en haut, il faut doubler en bas » —
 *                       puis, en poussant un seul terme, « les deux produits
 *                       se séparent tout de suite ».
 * Misconception targeted « 2/3 = 3/4 parce que l'écart est 1 des deux
 *                       côtés » — l'erreur additive, qui est LA raison pour
 *                       laquelle le programme demande un test multiplicatif.
 * Formalization         AUCUNE ici : le mot « produit en croix » est posé au
 *                       module suivant, une fois le phénomène provoqué.
 *
 * SÉCURITÉ VISUELLE (§17bis). Les quatre nombres et les deux produits vivent
 * dans le DOM ; le SVG ne porte que les deux diagonales, tracées entre les
 * coins d'un cadre fixe. Aucun texte n'est posé en coordonnées, donc rien ne
 * peut se chevaucher quel que soit le nombre de chiffres — un produit à
 * quatre chiffres pousse simplement sa cellule.
 */

const Stepper = ({ label, value, onChange, min = 1, max = 24, tone = 'indigo', disabled }) => {
  const TONES = {
    indigo: 'border-indigo-300 bg-indigo-50 text-indigo-800',
    violet: 'border-violet-300 bg-violet-50 text-violet-800',
  };
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[13px] font-semibold text-slate-500">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`Diminuer ${label}`}
          disabled={disabled || value <= min}
          onClick={() => onChange(value - 1)}
          className="min-h-[40px] min-w-[40px] rounded-lg border-2 border-slate-300 bg-white text-lg font-bold text-slate-600 disabled:opacity-40 hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          −
        </button>
        <span
          className={`min-h-[40px] min-w-[52px] inline-flex items-center justify-center rounded-lg border-2 text-lg font-black tabular-nums ${TONES[tone]}`}
        >
          {value}
        </span>
        <button
          type="button"
          aria-label={`Augmenter ${label}`}
          disabled={disabled || value >= max}
          onClick={() => onChange(value + 1)}
          className="min-h-[40px] min-w-[40px] rounded-lg border-2 border-slate-300 bg-white text-lg font-bold text-slate-600 disabled:opacity-40 hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          +
        </button>
      </div>
    </div>
  );
};

/** Une fraction en pile : numérateur, barre, dénominateur. Jamais « a/b ». */
const Pile = ({ num, den, tone }) => (
  <div className="flex flex-col items-center">
    <span className={`px-3 text-2xl font-black tabular-nums ${tone}`}>{num}</span>
    <span className="my-0.5 h-[3px] w-12 rounded bg-slate-700" aria-hidden="true" />
    <span className={`px-3 text-2xl font-black tabular-nums ${tone}`}>{den}</span>
  </div>
);

export default function CroixLab({
  a, b, c, d,            // les quatre entiers — l'état, détenu par le module
  onChange,              // (patch) => void, ex. onChange({ a: 5 })
  lockedTerms = [],      // ['a','b'] : termes imposés par l'énoncé
  showProducts = true,   // les produits, révélés seulement quand le module le veut
  disabled = false,
  max = 24,
}) {
  const { gauche, droite, egaux } = produitsEnCroix({ n: a, d: b }, { n: c, d: d });
  const locked = (k) => disabled || lockedTerms.includes(k);

  const ligne = egaux ? '#059669' : '#dc2626';

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3">
      {/* Les deux fractions, avec les diagonales derrière.
          Le SVG est CENTRÉ et BORNÉ en largeur (max-w) : un `preserveAspectRatio
          ="none"` étiré sur toute la carte étirait les diagonales d'un bord à
          l'autre, très au-delà des quatre nombres qu'elles sont censées relier
          (memory: svg_illustration_vs_manipulable). Le cadre suit maintenant la
          zone des fractions, et les traits vont d'un chiffre à l'autre. */}
      <div className="relative mx-auto w-full max-w-[280px] py-2">
        {showProducts && (
          <svg
            viewBox="0 0 200 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <line x1="52" y1="26" x2="148" y2="74" stroke={ligne} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7" />
            <line x1="52" y1="74" x2="148" y2="26" stroke={ligne} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7" />
          </svg>
        )}

        <div className="relative flex items-center justify-center gap-5 sm:gap-7">
          <Pile num={a} den={b} tone="text-indigo-700" />
          <span
            className={`text-3xl font-black ${egaux ? 'text-emerald-600' : 'text-rose-500'}`}
            aria-label={egaux ? 'égal' : 'différent de'}
          >
            {showProducts ? (egaux ? '=' : '≠') : '?'}
          </span>
          <Pile num={c} den={d} tone="text-violet-700" />
        </div>
      </div>

      {/* Les deux produits, chacun dans sa cellule : ils ne peuvent pas se
          chevaucher, quel que soit leur nombre de chiffres. */}
      {showProducts && (
        <div className="grid grid-cols-2 gap-2">
          <div className={`rounded-xl border-2 p-2 text-center ${egaux ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'}`}>
            <div className="text-[13px] text-slate-500">{a} × {d}</div>
            <div className="text-xl font-black tabular-nums text-slate-800">{gauche}</div>
          </div>
          <div className={`rounded-xl border-2 p-2 text-center ${egaux ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'}`}>
            <div className="text-[13px] text-slate-500">{b} × {c}</div>
            <div className="text-xl font-black tabular-nums text-slate-800">{droite}</div>
          </div>
        </div>
      )}

      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        role="group"
        aria-label="Régler les quatre nombres de l’égalité"
      >
        <Stepper label="Numérateur de gauche" value={a} onChange={(v) => onChange({ a: v })} disabled={locked('a')} max={max} />
        <Stepper label="Dénominateur de gauche" value={b} onChange={(v) => onChange({ b: v })} disabled={locked('b')} max={max} />
        <Stepper label="Numérateur de droite" value={c} onChange={(v) => onChange({ c: v })} tone="violet" disabled={locked('c')} max={max} />
        <Stepper label="Dénominateur de droite" value={d} onChange={(v) => onChange({ d: v })} tone="violet" disabled={locked('d')} max={max} />
      </div>
    </div>
  );
}
