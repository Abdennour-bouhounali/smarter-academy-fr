import React from 'react';
import MathText from '../../../../../common/components/MathText';
import { formatDec, formatPower, pow, towerValue } from './powerUtils';

/**
 * PowerTower — LA manipulation signature de « Puissances ».
 *
 * Activity: empiler des blocs « ×a » dans une tour ; l'écriture compacte
 *   a^n s'écrit toute seule À PARTIR du nombre de blocs.
 * Mathematical objective: comprendre l'exposant comme un COMPTE de facteurs,
 *   puis LIRE les trois règles (produit, quotient, puissance de puissance)
 *   sur ce compte — jamais énoncées avant le geste.
 * Student action: taper « ×a » pour empiler un bloc, taper un bloc pour le
 *   dépiler ; en mode fusion, taper « Fusionner » pour verser une tour dans
 *   l'autre ; en mode répétition, taper « ×k copies ».
 * Controlled variable: n, le nombre de blocs (entier, éventuellement négatif).
 * Mathematical state: `{ base, n }` — la tour. La valeur, l'écriture a^n, le
 *   produit développé et la hauteur du dessin en sont DÉRIVÉS.
 * Visual consequence: chaque bloc ajouté fait monter la tour d'un cran et
 *   l'exposant affiché augmente de 1 ; en dessous de zéro les blocs passent
 *   en « sous-sol » rose et l'écriture bascule en fraction 1/a^{|n|}.
 * Expected observation: n compte les facteurs. Dépiler jusqu'à zéro laisse
 *   une tour VIDE dont la valeur est 1 ; un cran plus bas donne 1/a.
 * Misconception targeted: « 2^3 = 6 » (confondre exposant et facteur —
 *   la tour montre 2×2×2 et non 2+2+2), « a^0 = 0 » (la tour vide vaut 1,
 *   pas rien), « 3^2 × 3^3 = 9^5 » (la fusion ajoute des blocs, jamais des
 *   bases).
 * Feedback: le compte de blocs manquants est affiché par le module ; le
 *   composant montre en permanence l'écart entre l'écriture et la valeur.
 * Formalization: a^m × a^n = a^{m+n} etc., nommées APRÈS la fusion.
 * Scaffolding: tap-first partout (aucun glisser) ; l'écriture développée
 *   est affichée tant que n ≤ 6, puis remplacée par un badge « ×N ».
 * Transfer: les mêmes tours, figées, servent de synthèse dans le boss final.
 *
 * Composant CONTRÔLÉ : `n` (et `n2` en mode deux tours) appartient au module.
 * Nœuds interactifs : ≤ 12 blocs par tour + 4 boutons = ≤ 28 au pire.
 *
 * @param {number} base
 * @param {number} n                exposant de la tour principale
 * @param {(n:number)=>void} [onChange]
 * @param {number} [n2]             seconde tour (modes 'merge' / 'split')
 * @param {(n:number)=>void} [onChange2]
 * @param {'single'|'merge'|'split'|'repeat'} [mode='single']
 * @param {number} [k=2]            nombre de copies (mode 'repeat')
 * @param {()=>void} [onCombine]    fusionner / retrancher / répéter
 * @param {boolean} [combined=false] l'opération a été faite
 * @param {number} [minN=-2] @param {number} [maxN=8]
 * @param {boolean} [frozen=false]  tour non interactive (synthèse)
 * @param {string} [label]
 */
const MAX_RENDERED = 12;

export default function PowerTower({
  base,
  n,
  onChange,
  n2,
  onChange2,
  mode = 'single',
  k = 2,
  onCombine,
  combined = false,
  minN = -2,
  maxN = 8,
  frozen = false,
  label,
}) {
  const twoTowers = mode === 'merge' || mode === 'split';

  return (
    <div className="space-y-3" role="group" aria-label={label || `Tour des facteurs de base ${base}`}>
      <div className="flex items-end justify-center gap-3 sm:gap-6 flex-wrap">
        <Tower
          base={base}
          n={n}
          onChange={combined || frozen ? undefined : onChange}
          minN={minN}
          maxN={maxN}
          frozen={frozen || combined}
          title={twoTowers ? 'Tour A' : undefined}
          // Après l'opération, la tour A EST le résultat : les blocs de B y
          // sont versés (fusion) ou en sont retirés (quotient), et la tour
          // répétée gagne ses copies. Le compte se lit sur le dessin.
          movedIn={twoTowers && combined && mode === 'merge' ? n2 : 0}
          movedOut={twoTowers && combined && mode === 'split' ? n2 : 0}
          repeatedExtra={mode === 'repeat' && combined ? n * (k - 1) : 0}
        />
        {twoTowers && (
          <>
            <div className="self-center text-3xl font-extrabold text-slate-400 pb-8" aria-hidden="true">
              {combined ? '=' : mode === 'merge' ? '×' : '÷'}
            </div>
            <Tower
              base={base}
              n={combined ? 0 : n2}
              onChange={combined || frozen ? undefined : onChange2}
              minN={minN}
              maxN={maxN}
              frozen={frozen || combined}
              title="Tour B"
              tone="violet"
              emptiedLabel={combined ? (mode === 'merge' ? 'versée dans A' : 'retirée de A') : undefined}
            />
          </>
        )}
      </div>

      {/* ── L'écriture, qui s'écrit depuis le COMPTE ─────────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 text-center space-y-1">
        {twoTowers ? (
          <MathText className="text-xl text-slate-800">
            {`$${formatPower(base, n)} ${mode === 'merge' ? '\\times' : '\\div'} ${formatPower(base, n2)}${
              combined
                ? ` = ${formatPower(base, mode === 'merge' ? n + n2 : n - n2)} = ${formatDec(
                    pow(base, mode === 'merge' ? n + n2 : n - n2),
                    { maxDecimals: 6 },
                  )}`
                : ''
            }$`}
          </MathText>
        ) : mode === 'repeat' ? (
          <MathText className="text-xl text-slate-800">
            {`$\\left(${formatPower(base, n)}\\right)^{${k}}${
              combined ? ` = ${formatPower(base, n * k)} = ${formatDec(pow(base, n * k), { maxDecimals: 6 })}` : ''
            }$`}
          </MathText>
        ) : (
          <MathText className="text-xl text-slate-800">
            {`$${formatPower(base, n)} = ${
              n < 0 ? `\\frac{1}{${formatPower(base, -n)}} = ` : ''
            }${formatDec(towerValue({ base, n }), { maxDecimals: 6 })}$`}
          </MathText>
        )}
        <p className="text-xs text-slate-500">
          {twoTowers
            ? `${blocksWord(n)} dans A, ${blocksWord(n2)} dans B${combined ? ` → ${blocksWord(mode === 'merge' ? n + n2 : n - n2)} en tout` : ''}`
            : mode === 'repeat'
            ? `${blocksWord(n)} répétés ${k} fois${combined ? ` → ${blocksWord(n * k)}` : ''}`
            : `${blocksWord(n)} empilé${Math.abs(n) > 1 ? 's' : ''}`}
        </p>
      </div>

      {/* ── Commandes tap-first ──────────────────────────────────────── */}
      {!frozen && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {onChange && (
            <>
              <StackButton
                onClick={() => onChange(n - 1)}
                disabled={n <= minN}
                ariaLabel={`Dépiler un facteur de la tour${twoTowers ? ' A' : ''}`}
              >
                Dépiler
              </StackButton>
              <StackButton
                onClick={() => onChange(n + 1)}
                disabled={n >= maxN}
                ariaLabel={`Empiler un facteur ${base} sur la tour${twoTowers ? ' A' : ''}`}
                primary
              >
                {`× ${base}`}
              </StackButton>
            </>
          )}
          {twoTowers && onChange2 && (
            <>
              <StackButton
                onClick={() => onChange2(n2 - 1)}
                disabled={n2 <= minN}
                ariaLabel="Dépiler un facteur de la tour B"
              >
                Dépiler B
              </StackButton>
              <StackButton
                onClick={() => onChange2(n2 + 1)}
                disabled={n2 >= maxN}
                ariaLabel={`Empiler un facteur ${base} sur la tour B`}
                primary
              >
                {`× ${base} sur B`}
              </StackButton>
            </>
          )}
          {onCombine && (
            <button
              type="button"
              onClick={onCombine}
              disabled={combined}
              aria-label={
                mode === 'merge'
                  ? 'Verser la tour B dans la tour A'
                  : mode === 'split'
                  ? 'Retirer les blocs de B à la tour A'
                  : `Répéter la tour ${k} fois`
              }
              className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                combined
                  ? 'bg-slate-100 border-slate-200 text-slate-400'
                  : 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700'
              }`}
            >
              {combined ? '✓ Fait' : mode === 'merge' ? 'Fusionner' : mode === 'split' ? 'Retrancher' : `Répéter ×${k}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function blocksWord(n) {
  if (n === 0) return '0 bloc';
  return `${formatDec(n)} bloc${Math.abs(n) > 1 ? 's' : ''}`;
}

/* ── Une tour : des blocs empilés, plus un sous-sol pour n < 0 ────── */
function Tower({
  base, n, onChange, minN, maxN, frozen, title, tone = 'indigo',
  movedIn = 0, movedOut = 0, repeatedExtra = 0, emptiedLabel,
}) {
  // `n` est l'exposant AVANT l'opération ; les blocs versés / retirés /
  // recopiés s'ajoutent au dessin pour que le compte final se voie.
  const total = n + movedIn - movedOut + repeatedExtra;
  const up = Math.max(0, movedOut > 0 ? n : total);
  const down = Math.max(0, -(movedOut > 0 ? n : total));
  const shownUp = Math.min(up, MAX_RENDERED);
  const shownDown = Math.min(down, MAX_RENDERED);
  const hiddenUp = up - shownUp;

  const upTone =
    tone === 'violet'
      ? 'bg-violet-100 border-violet-400 text-violet-800 hover:border-violet-600'
      : 'bg-indigo-100 border-indigo-400 text-indigo-800 hover:border-indigo-600';

  return (
    <div className="flex flex-col items-center gap-1.5 justify-end">
      {title && <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p>}
      {hiddenUp > 0 && (
        <span className="text-[11px] font-mono font-bold px-2 py-1 rounded-full bg-slate-800 text-white">
          ×{hiddenUp} de plus
        </span>
      )}

      {/* Les blocs au-dessus du sol. Les derniers sont ceux qui viennent
          d'arriver (fusion / répétition) ou de partir (quotient) : une
          couleur différente les désigne, et le compte total se lit. */}
      <div className="flex flex-col-reverse gap-1 items-center">
        {Array.from({ length: shownUp }, (_, i) => {
          const arrived = i >= shownUp - movedIn - repeatedExtra && movedIn + repeatedExtra > 0;
          const leaving = movedOut > 0 && i >= shownUp - movedOut;
          const cellTone = leaving
            ? 'bg-slate-100 border-slate-300 text-slate-400 line-through'
            : arrived
            ? 'bg-violet-100 border-violet-500 text-violet-800'
            : upTone;
          return (
            <BlockCell
              key={`up-${i}`}
              label={`× ${base}`}
              tone={cellTone}
              onClick={onChange ? () => onChange(n - 1) : undefined}
              ariaLabel={`Bloc ${i + 1} sur ${up} — taper pour le retirer`}
              frozen={frozen}
            />
          );
        })}
        {up === 0 && down === 0 && (
          <div className="min-w-[64px] min-h-[44px] rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[11px] font-bold text-slate-500 px-2 text-center leading-tight">
            {emptiedLabel || 'vide'}
          </div>
        )}
      </div>

      {/* Le sol */}
      <div className="w-24 h-1.5 rounded-full bg-slate-400" aria-hidden="true" />

      {/* Le sous-sol : exposants négatifs */}
      {shownDown > 0 && (
        <div className="flex flex-col gap-1 items-center">
          {Array.from({ length: shownDown }, (_, i) => (
            <BlockCell
              key={`down-${i}`}
              label={`÷ ${base}`}
              tone="bg-rose-100 border-rose-400 text-rose-800 hover:border-rose-600"
              onClick={onChange ? () => onChange(n + 1) : undefined}
              ariaLabel={`Bloc sous le sol ${i + 1} sur ${down} — taper pour le remonter`}
              frozen={frozen}
            />
          ))}
        </div>
      )}

      <p className="text-sm font-mono font-extrabold text-slate-700 tabular-nums pt-0.5">
        <MathText>{`$${formatPower(base, total)}$`}</MathText>
      </p>
      <p className="sr-only">
        Tour de base {base} : {total} bloc{Math.abs(total) > 1 ? 's' : ''}, valeur{' '}
        {formatDec(towerValue({ base, n: total }), { maxDecimals: 6 })}.
      </p>
    </div>
  );
}

function BlockCell({ label, tone, onClick, ariaLabel, frozen }) {
  if (frozen || !onClick) {
    return (
      <div className={`min-w-[64px] min-h-[40px] rounded-lg border-2 flex items-center justify-center font-mono text-sm font-extrabold px-2 ${tone}`}>
        {label}
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`min-w-[64px] min-h-[44px] rounded-lg border-2 flex items-center justify-center font-mono text-sm font-extrabold px-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${tone}`}
    >
      {label}
    </button>
  );
}

function StackButton({ children, onClick, disabled, ariaLabel, primary }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold transition-colors disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        primary
          ? 'bg-indigo-600 border-indigo-700 text-white hover:bg-indigo-700'
          : 'bg-white border-slate-300 text-slate-700 hover:border-indigo-500'
      }`}
    >
      {children}
    </button>
  );
}
