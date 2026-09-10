import React from 'react';
import { CARTES, OPERATEURS, assemblage, confronter, fr, POINTS_LAB } from './reglesUtils';

/**
 * BancDeCartes — l'interaction SIGNATURE : l'usine à dérivées.
 *
 * Activity               l'élève choisit DEUX cartes et l'opérateur qui les
 *                        emboîte (+ ou ×), avec un coefficient k sur la
 *                        première. Il RETOURNE l'assemblage : le banc applique
 *                        la règle naïve — « je retourne chaque carte et je
 *                        recolle pareil » — et confronte cette prédiction à la
 *                        pente RÉELLEMENT MESURÉE sur la fonction assemblée.
 * Mathematical objective la dérivation traverse le « + » et le « × k », et PAS
 *                        le « × ». Une opération qui ne se laisse pas traverser
 *                        exige sa propre règle.
 * Student action         choisir les cartes, l'opérateur, le coefficient, le
 *                        point de mesure ; puis retourner l'assemblage.
 * Controlled variable    (gauche, droite, op, k, x).
 * Mathematical state     l'assemblage ; la prédiction naïve, la vraie dérivée
 *                        et la pente mesurée en sont TOUTES dérivées.
 * Visual consequence     deux nombres côte à côte, et un verdict : ils
 *                        coïncident, ou ils divergent.
 * Expected observation   « pour le +, les deux nombres sont les mêmes ; pour
 *                        le ×, ils ne le sont pas du tout ».
 * Misconception targeted « dériver, c'est dériver chaque morceau » — la
 *                        distributivité imaginaire de la dérivation.
 *
 * PAS DE COURBE. La leçon amont porte trois laboratoires « courbe + curseur » ;
 * l'objet d'ici est SYMBOLIQUE, et un quatrième repère n'ajouterait qu'un
 * décor. Tous les nombres vivent dans le DOM — donc aucune collision possible.
 *
 * JAMAIS GELÉ après réussite : `disabled` ne sert qu'au verrou d'ANTÉRIORITÉ
 * d'une étape sur la précédente.
 */
const btn =
  'min-h-[44px] px-3 py-2 rounded-xl border-2 text-sm font-bold transition ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40';

const choisi = 'border-indigo-500 bg-indigo-50 text-indigo-900';
const libre = 'border-slate-200 bg-white text-slate-700 hover:border-slate-300';

/** Une carte du banc, recto (la fonction) et verso (sa dérivée) visibles. */
function Carte({ c, actif, retournee, onClick, disabled, teinte = 'indigo' }) {
  const bord = actif ? (teinte === 'sky' ? 'border-sky-500 bg-sky-50' : 'border-indigo-500 bg-indigo-50') : 'border-slate-200 bg-white';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={actif}
      className={`min-h-[64px] min-w-[76px] px-3 py-2 rounded-xl border-2 transition text-center disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${bord}`}
    >
      <div className="font-mono font-black text-[17px] text-slate-900">{c.label}</div>
      <div className={`font-mono text-[13px] mt-0.5 ${retournee ? 'text-rose-700 font-bold' : 'text-slate-300'}`}>
        {retournee ? c.derivee : '· · ·'}
      </div>
    </button>
  );
}

export default function BancDeCartes({
  gauche,
  droite,
  op,
  k = 1,
  x,
  onChangeGauche,
  onChangeDroite,
  onChangeOp,
  onChangeK,
  onChangeX,
  retourne = false,
  onRetourner,
  cartesDisponibles = CARTES.map((c) => c.id),
  operateursDisponibles = ['somme', 'produit'],
  coefficients = null,
  disabled = false,
}) {
  const asm = assemblage({ gauche, droite, op, k });
  const c = confronter(asm, x);
  const cartes = CARTES.filter((carte) => cartesDisponibles.includes(carte.id));

  const kTexte = k === 1 ? '' : `${fr(k)} × `;
  const expression = `${kTexte}${asm.u.label} ${asm.op.symbole} ${asm.v.label}`;
  const prediction = `${kTexte}${asm.u.derivee} ${asm.op.symbole} ${asm.v.derivee}`;

  return (
    <div className="space-y-3">
      {/* ── Le banc : deux emplacements et un opérateur ─────────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-3 space-y-3">
        <div className="text-[13px] font-semibold text-slate-600">Première carte</div>
        <div className="flex flex-wrap gap-2">
          {cartes.map((carte) => (
            <Carte
              key={carte.id}
              c={carte}
              actif={carte.id === gauche}
              retournee={retourne}
              onClick={() => onChangeGauche?.(carte.id)}
              disabled={disabled || !onChangeGauche}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Choisir l’opération qui emboîte les deux cartes">
          <span className="text-[13px] font-semibold text-slate-600">Emboîtées par</span>
          {operateursDisponibles.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onChangeOp?.(id)}
              disabled={disabled || !onChangeOp}
              aria-pressed={id === op}
              className={`${btn} ${id === op ? choisi : libre} min-w-[64px] font-mono text-[17px]`}
            >
              {OPERATEURS[id].symbole}
            </button>
          ))}
        </div>

        <div className="text-[13px] font-semibold text-slate-600">Seconde carte</div>
        <div className="flex flex-wrap gap-2">
          {cartes.map((carte) => (
            <Carte
              key={carte.id}
              c={carte}
              actif={carte.id === droite}
              retournee={retourne}
              onClick={() => onChangeDroite?.(carte.id)}
              disabled={disabled || !onChangeDroite}
              teinte="sky"
            />
          ))}
        </div>

        {coefficients && (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Multiplier la première carte par un nombre">
            <span className="text-[13px] font-semibold text-slate-600">La première carte multipliée par</span>
            {coefficients.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onChangeK?.(v)}
                disabled={disabled || !onChangeK}
                aria-pressed={v === k}
                className={`${btn} ${v === k ? choisi : libre} min-w-[56px] font-mono`}
              >
                {fr(v)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── L'assemblage obtenu ──────────────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-indigo-200 bg-white p-3 text-center">
        <div className="text-[13px] text-indigo-700">Ta fonction assemblée</div>
        <div className="font-mono font-black text-[19px] text-indigo-900">f(x) = {expression}</div>
      </div>

      {/* ── Le point de mesure ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Choisir le point où la pente est mesurée">
        <span className="text-[13px] font-semibold text-slate-600">Mesurer la pente en x =</span>
        {POINTS_LAB.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChangeX?.(v)}
            disabled={disabled || !onChangeX}
            aria-pressed={v === x}
            className={`${btn} ${v === x ? choisi : libre} min-w-[52px] font-mono`}
          >
            {fr(v)}
          </button>
        ))}
      </div>

      {/* ── Le geste : retourner l'assemblage ────────────────────────────── */}
      <button
        type="button"
        onClick={() => onRetourner?.(c)}
        disabled={disabled || !onRetourner}
        className="w-full min-h-[48px] rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        🔄 Retourner l’assemblage et mesurer la pente en x = {fr(x)}
      </button>

      {/* ── La confrontation, en DOM, jamais en <text> SVG ───────────────── */}
      {retourne && (
        <div className="space-y-2" aria-live="polite">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-3">
              <div className="text-[13px] font-semibold text-amber-800">Ta prédiction — chaque carte retournée, recollée pareil</div>
              <div className="font-mono text-[15px] text-amber-900 mt-1">{prediction}</div>
              <div className="font-mono font-black text-[19px] tabular-nums text-amber-900 mt-1">
                en x = {fr(x)} : {fr(c.naif)}
              </div>
            </div>
            <div className="rounded-xl border-2 border-slate-800 bg-slate-900 p-3">
              <div className="text-[13px] font-semibold text-slate-300">La pente réellement mesurée sur f</div>
              <div className="text-[13px] text-slate-400 mt-1">mesurée sur la courbe assemblée, sans aucune règle</div>
              <div className="font-mono font-black text-[19px] tabular-nums text-white mt-1">
                en x = {fr(x)} : {fr(c.mesure)}
              </div>
            </div>
          </div>
          <div
            className={`rounded-xl border-2 p-3 text-sm font-semibold ${
              c.naifTient
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                : 'border-rose-300 bg-rose-50 text-rose-900'
            }`}
          >
            {c.naifTient ? (
              <>✓ Les deux nombres coïncident : ici, retourner chaque carte séparément a donné le bon résultat.</>
            ) : (
              <>
                ✗ Les deux nombres ne coïncident pas : {fr(c.naif)} contre {fr(c.mesure)}. Un écart
                de <strong>{fr(c.ecart)}</strong> — ce n’est pas un arrondi.
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
