import React from 'react';
import MathText from '../../../../../common/components/MathText';
import { exponent, factorCount } from './factorTowerUtils';
import { formatDec, formatPower, pow } from './powerUtils';

/**
 * FactorTower — LA manipulation signature de « Puissances », refondue.
 *
 * Activity: empiler des FACTEURS dans une tour, en glissant un bloc « 3 »
 *   depuis la réserve ; puis verser une tour entière dans l'autre.
 * Mathematical objective: comprendre l'exposant comme un COMPTE de facteurs,
 *   puis LIRE les trois règles sur ce compte.
 * Student action: glisser un facteur de la réserve sur une tour ; glisser le
 *   bloc du sommet hors de la tour pour le retirer ; glisser la tour B sur la
 *   tour A pour les fusionner. Chaque geste a son double clavier (prendre /
 *   poser, cf. `useDragDrop`).
 * Controlled variable: la LISTE des facteurs — l'exposant n'existe pas comme
 *   état, il est compté (`exponent()`).
 * Mathematical state: `{ base, factors[], below[] }`, possédé par le module.
 * Visual consequence: un bloc = un facteur, étiqueté « 3 » et JAMAIS « × 3 » ;
 *   le « × » est dessiné ENTRE deux blocs, parce que c'est lui qui multiplie.
 *   L'écriture a^n se met à jour depuis le nombre de blocs affichés.
 * Expected observation: 2 facteurs et 3 facteurs mis ensemble font 5 facteurs
 *   — on peut les compter à l'écran, un par un.
 * Misconception targeted: « une tour CONTIENT la valeur 3² » (non : elle
 *   montre 3 × 3), « 3² × 3³ = 9⁵ » (aucun bloc ne change de nature) et
 *   « 3² × 3³ = 3⁶ » (multiplier les exposants, c'est la RÉPÉTITION).
 * Feedback: le compte de blocs est écrit sous chaque tour, en toutes lettres.
 * Formalization: aucune ici — le module nomme les règles APRÈS les gestes.
 * Scaffolding: glisser d'abord, boutons de secours ensuite (repliés) ; la
 *   réserve est infinie, on ne peut donc pas se bloquer.
 * Transfer: la même tour, figée, sert de synthèse au boss final.
 *
 * Composant CONTRÔLÉ : la tour appartient au module. Aucune prop `disabled` :
 * une manipulation ne se fige jamais après validation de l'étape (règle
 * projet du 2026-09-06) ; seul `frozen` — réservé aux figures d'illustration
 * — retire les poignées.
 */

/** Au-delà, les blocs ne sont plus dessinés un à un mais résumés. */
const MAX_RENDERED = 12;

/**
 * La couleur dit D'OÙ VIENT le facteur, et c'est une information
 * mathématique : dans la tour résultat, les 2 blocs de A et les 3 de B
 * restent reconnaissables, donc l'élève VOIT que rien n'a été créé ni
 * fondu — les mêmes facteurs sont simplement rassemblés. Indigo et violet
 * étant trop proches pour être distingués d'un coup d'œil, A prend
 * l'ambre : deux familles franchement séparées.
 */
const TONES = {
  a: 'bg-amber-100 border-amber-500 text-amber-900',
  b: 'bg-violet-100 border-violet-500 text-violet-900',
  d: 'bg-rose-100 border-rose-400 text-rose-800',
};
const packetTone = (from) => (from?.startsWith('p') ? TONES.b : TONES[from] || TONES.a);

/**
 * Un bloc = UN facteur. L'étiquette est la base seule ; le signe « × » vit
 * entre les blocs, dessiné par la pile. C'est toute la différence entre
 * « une tour de facteurs 3 » et « une tour d'opérateurs ×3 ».
 */
function FactorBlock({ base, from, onRemove, ariaLabel, dim, grabProps }) {
  const tone = packetTone(from);
  const cls = `min-w-[64px] min-h-[44px] px-3 rounded-lg border-2 flex items-center justify-center
    font-mono text-lg font-extrabold tabular-nums select-none ${tone} ${dim ? 'opacity-40 line-through' : ''}`;

  if (!onRemove && !grabProps) {
    return <div className={cls} aria-hidden="true">{base}</div>;
  }
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={ariaLabel}
      {...grabProps}
      className={`${cls} transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500`}
    >
      {base}
    </button>
  );
}

/* Repères de hauteur, en pixels réels (les blocs sont du DOM, pas du SVG) :
   un bloc fait 44 px et le « × » qui le sépare du suivant ≈ 18 px. La leçon
   s'en sert pour réserver la place de la figure la plus haute (§16bis) sur
   le conteneur qui porte AUSSI les commandes. */
export const BLOCK_H = 44;
export const TIMES_H = 18;

/**
 * Le « × » entre deux facteurs — le seul endroit où la multiplication vit.
 *
 * Il est aussi lisible que les blocs qu'il relie : c'est LUI qui porte le
 * sens (« 3 fois 3 », et non « une tour qui vaut 9 »). Le réduire à un
 * détail décoratif ramènerait la lecture « conteneur » qu'on répare ici.
 */
const TimesRow = () => (
  <span className="text-base font-extrabold text-slate-500 leading-none py-1" aria-hidden="true">×</span>
);

/**
 * La zone d'accueil d'une tour. `useDragDrop.zoneProps` ne pose que les
 * attributs `data-drop-zone` que le POINTEUR utilise ; le chemin sans souris
 * (activer la réserve, puis activer la tour) passe par `dropHere`, qu'il faut
 * câbler ici — sinon la manipulation serait réservée à la souris.
 */
function Zone({ dropProps, onDropHere, label, highlight, children }) {
  const cls = `flex flex-col items-center rounded-xl px-2 py-1.5 border-2 border-dashed transition-colors ${
    highlight ? 'border-emerald-500 bg-emerald-50' : 'border-transparent'
  }`;
  if (!onDropHere) return <div {...dropProps} className={cls}>{children}</div>;
  // (Le module ne passe `onDropHere` que lorsqu'un facteur est en main : les
  // blocs, eux-mêmes boutons, ne peuvent donc jamais être imbriqués dedans.)
  return (
    <button
      type="button"
      {...dropProps}
      onClick={onDropHere}
      aria-label={label}
      className={`${cls} focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
    >
      {children}
    </button>
  );
}

/**
 * Une tour : des facteurs empilés sur un sol, plus un sous-sol pour les
 * exposants négatifs (la descente du module 2 continue ici).
 */
export function Tower({
  tower,
  title,
  onRemoveTop,
  dropProps,
  onDropHere,
  dropLabel,
  grabWholeProps,
  highlight = false,
  dimLastN = 0,
  frozen = false,
  emptyLabel = 'vide',
}) {
  const { base } = tower;
  const up = tower.factors.length;
  const down = tower.below.length;
  const shownUp = Math.min(up, MAX_RENDERED);
  const hiddenUp = up - shownUp;
  const n = exponent(tower);

  return (
    /* Largeur de colonne FIXE : sans elle, la grille se dimensionnerait sur
       le titre le plus long (« Tour C — le résultat ») et tout glisserait
       latéralement au moment où C apparaît. Le titre s'enroule dans cette
       largeur au lieu de l'imposer. */
    <div className="flex flex-col items-center gap-1.5 justify-end w-[112px] shrink-0">
      {title && (
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 text-center leading-tight min-h-[2.5em] flex items-end justify-center">
          {title}
        </p>
      )}

      <Zone
        dropProps={dropProps}
        onDropHere={onDropHere}
        label={dropLabel}
        highlight={highlight}
      >
        {hiddenUp > 0 && (
          <span className="text-[11px] font-mono font-bold px-2 py-1 rounded-full bg-slate-800 text-white mb-1">
            + {formatDec(hiddenUp)} autres facteurs
          </span>
        )}

        {/* Les facteurs, du sol vers le haut. Le dernier posé est en haut :
            c'est celui qu'on peut retirer, comme sur une vraie pile.

            ATTENTION à l'ordre : `flex-col-reverse` inverse le rendu, donc
            l'élément écrit APRÈS un bloc s'affiche EN DESSOUS de lui. Le
            « × » doit donc être émis AVANT le bloc, et pour tous sauf le
            premier — sinon il flotte au sommet de la tour, sans rien
            au-dessus à multiplier. Un × ne sépare que deux facteurs. */}
        <div className="flex flex-col-reverse items-center justify-start">
          {tower.factors.slice(0, shownUp).map((f, i) => (
            <React.Fragment key={f.id}>
              {i > 0 && <TimesRow />}
              <FactorBlock
                base={base}
                from={f.from}
                dim={dimLastN > 0 && i >= shownUp - dimLastN}
                onRemove={!frozen && onRemoveTop && i === shownUp - 1 ? onRemoveTop : undefined}
                ariaLabel={`Facteur ${base} au sommet — retirer`}
                grabProps={i === shownUp - 1 ? grabWholeProps : undefined}
              />
            </React.Fragment>
          ))}
          {up === 0 && (
            <div className="min-w-[64px] min-h-[44px] rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-500 px-2 text-center leading-tight">
              {emptyLabel}
            </div>
          )}
        </div>
      </Zone>

      {/* Le sol */}
      <div className="w-24 h-1.5 rounded-full bg-slate-400" aria-hidden="true" />

      {/* Le sous-sol : chaque bloc y DIVISE par la base. Sa hauteur est
          réservée elle aussi (§16bis) — l'élève descend sous le sol sans que
          les commandes ne fuient vers le bas. */}
      {down > 0 && (
        <div className="flex flex-col items-center gap-0.5 pt-0.5">
          {/* CHAQUE bloc du sous-sol divise : le séparateur est un « ÷ », pas
              un « × ». Écrire « ÷ 10 × 10 » se lirait « divisé puis
              multiplié » — les deux crans s'annuleraient, alors que 10⁻²
              c'est bien divisé DEUX fois. */}
          {tower.below.map((f, i) => (
            <React.Fragment key={f.id}>
              <span className="text-sm font-extrabold text-rose-500 leading-none" aria-hidden="true">÷</span>
              <FactorBlock base={base} from="d" />
            </React.Fragment>
          ))}
        </div>
      )}

      {/* L'écriture compacte, DÉRIVÉE du compte de blocs ci-dessus. */}
      <p className="text-base font-mono font-extrabold text-slate-800 tabular-nums pt-0.5">
        <MathText>{`$${formatPower(base, n)}$`}</MathText>
      </p>
      <p className="text-xs text-slate-500 tabular-nums">
        {n === 0
          ? 'aucun facteur'
          : `${formatDec(Math.abs(n))} facteur${Math.abs(n) > 1 ? 's' : ''} ${base}`}
      </p>
      <p className="sr-only">
        Tour de base {base} : {factorCount(tower)} facteur
        {factorCount(tower) > 1 ? 's' : ''} au-dessus du sol
        {down > 0 ? `, ${down} en dessous` : ''} — elle vaut{' '}
        {formatDec(pow(base, n), { maxDecimals: 6 })}.
      </p>
    </div>
  );
}

/**
 * La réserve : une source infinie de facteurs. On y prend un bloc « 3 » et
 * on le pose sur une tour. Infinie à dessein — un élève ne doit jamais
 * pouvoir bloquer sa propre manipulation en épuisant un stock.
 */
export function FactorSupply({ base, grabProps, held, label = 'Prends un facteur' }) {
  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-3 text-center space-y-2">
      <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <div className="flex justify-center">
        <button
          type="button"
          {...grabProps}
          aria-label={`Prendre un facteur ${base}${held ? ' — en main, choisis une tour' : ''}`}
          className={`min-w-[72px] min-h-[48px] px-4 rounded-xl border-2 font-mono text-xl font-extrabold
            transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              held
                ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md scale-105'
                : 'border-slate-400 bg-white text-slate-800 hover:scale-105'
            }`}
        >
          {base}
        </button>
      </div>
      <p className="text-xs text-slate-500">
        {held ? 'Pose-le sur une tour.' : 'Glisse-le sur une tour — ou tape-le, puis tape la tour.'}
      </p>
    </div>
  );
}

/** Le bloc fantôme qui suit le doigt pendant le glissement. */
export function DragGhost({ base, ghost }) {
  if (!ghost) return null;
  return (
    <div
      className="fixed z-50 pointer-events-none min-w-[64px] min-h-[44px] px-3 rounded-lg border-2
        border-indigo-500 bg-indigo-100 text-indigo-900 flex items-center justify-center
        font-mono text-lg font-extrabold shadow-lg opacity-90"
      style={{ left: ghost.x - 32, top: ghost.y - 22 }}
      aria-hidden="true"
    >
      {base}
    </div>
  );
}

export default Tower;
