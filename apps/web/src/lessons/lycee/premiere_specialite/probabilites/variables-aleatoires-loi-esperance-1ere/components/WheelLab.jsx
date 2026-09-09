import React from 'react';
import { euros, fr, NB_SECTEURS, secteursDeLaRoue, GROS_LOTS } from './roueUtils';

/**
 * WheelLab — l'interaction SIGNATURE : la roue et le grand livre.
 *
 * Activity               une roue de loterie à dix secteurs. L'élève la lance
 *                        UNE fois : un gain, imprévisible. Puis 500 fois d'un
 *                        coup : le GRAND LIVRE se remplit, et la moyenne des
 *                        gains vient se poser sur une ligne stable. Il peut
 *                        ensuite MODIFIER le gros lot au cliquet et tout
 *                        relancer : la ligne se déplace.
 * Mathematical objective un lancer est imprévisible, mais la moyenne d'un très
 *                        grand nombre de lancers, elle, est prévisible — et
 *                        elle ne vaut aucun gain que la roue puisse donner.
 * Student action         « Lancer une fois », « Lancer 500 fois », et le
 *                        cliquet du gros lot (jamais un curseur : chaque
 *                        montant doit être exactement atteignable, et chacun
 *                        doit garder l'espérance hors des gains possibles).
 * Controlled variable    le montant du gros lot.
 * Mathematical state     { grosLot, série de tirages } ; le grand livre, la
 *                        moyenne et la ligne en sont TOUS dérivés.
 * Visual consequence     les barres du grand livre montent, la ligne de la
 *                        moyenne se pose entre elles, et se déplace quand le
 *                        gros lot change.
 * Expected observation   « la moyenne tombe toujours au même endroit, et cet
 *                        endroit n'est aucune case de la roue ».
 * Misconception targeted « la moyenne doit être un résultat possible » ;
 *                        « avec du hasard, on ne peut rien prévoir ».
 *
 * L'ALÉA EST INJECTÉ. Ce composant ne tire RIEN : il reçoit un `livre` déjà
 * calculé par le module, à partir d'un `makeRng` semé une seule fois par
 * session. Aucun `Math.random`, aucun tirage dans le rendu — sinon un simple
 * re-rendu changerait les nombres sous les yeux de l'élève.
 *
 * NOMBRES DANS LE DOM, jamais en <text> SVG : la ligne de la moyenne et celle
 * de la valeur calculée peuvent se rejoindre à moins d'un pixel (c'est même
 * tout l'objet du module 4). Deux étiquettes posées à côté d'elles se
 * chevaucheraient nécessairement ; elles vivent donc dans la LÉGENDE DOM, qui
 * reste lisible quel que soit l'écart.
 *
 * JAMAIS GELÉ après réussite : `disabled` ne sert qu'au verrou d'ANTÉRIORITÉ
 * d'une étape sur la précédente.
 */

const COULEUR_LIGNE = '#0f766e';     // la moyenne observée
const COULEUR_CALCUL = '#be123c';    // la valeur calculée, quand le module la montre

export default function WheelLab({
  grosLot,
  onChangeGrosLot = null,
  livre = null,              // { n, lignes, moyenne } — déjà calculé, jamais tiré ici
  dernierLancer = null,      // le gain du dernier lancer unique
  valeurCalculee = null,     // la « ligne du calcul », posée par le module 4
  onLancerUn = null,
  onLancer500 = null,
  disabled = false,
}) {
  const secteurs = secteursDeLaRoue(grosLot);
  const idx = GROS_LOTS.indexOf(grosLot);
  const peutMonter = !disabled && onChangeGrosLot && idx >= 0 && idx < GROS_LOTS.length - 1;
  const peutDescendre = !disabled && onChangeGrosLot && idx > 0;

  const btn =
    'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 ' +
    'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  const btnAction =
    'h-11 px-4 rounded-xl border-2 border-indigo-300 bg-indigo-50 text-indigo-900 text-sm font-bold ' +
    'hover:border-indigo-500 hover:bg-indigo-100 disabled:opacity-40 active:scale-95 transition ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  return (
    <div className="space-y-3 rounded-2xl border-2 border-indigo-100 bg-white p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <Roue secteurs={secteurs} dernierLancer={dernierLancer} />

        <div className="flex-1 min-w-0 space-y-3">
          {/* Ce que paie chaque couleur — en DOM, jamais dans le SVG. */}
          <ul className="space-y-1.5" aria-label="Les gains de la roue">
            {secteurs.map((s) => (
              <li key={s.id} className="flex items-center gap-2 text-sm">
                <span className="inline-block w-3.5 h-3.5 rounded" style={{ background: s.couleur }} aria-hidden="true" />
                <span className="text-slate-600">{s.effectif} secteurs sur {NB_SECTEURS} :</span>
                <strong className="font-mono tabular-nums text-slate-900">{euros(s.gain)}</strong>
              </li>
            ))}
          </ul>

          {onChangeGrosLot && (
            <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Régler le gros lot">
              <span className="text-sm text-slate-600">gros lot :</span>
              <button type="button" className={btn} onClick={() => onChangeGrosLot(GROS_LOTS[idx - 1])} disabled={!peutDescendre} aria-label="Baisser le gros lot">
                −
              </button>
              <span className="px-3 py-1.5 rounded-lg bg-amber-500 text-white font-mono font-bold tabular-nums text-sm">
                {euros(grosLot)}
              </span>
              <button type="button" className={btn} onClick={() => onChangeGrosLot(GROS_LOTS[idx + 1])} disabled={!peutMonter} aria-label="Augmenter le gros lot">
                +
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {onLancerUn && (
              <button type="button" className={btnAction} onClick={onLancerUn} disabled={disabled}>
                🎯 Lancer une fois
              </button>
            )}
            {onLancer500 && (
              <button type="button" className={btnAction} onClick={onLancer500} disabled={disabled}>
                📚 Lancer 500 fois
              </button>
            )}
          </div>

          {dernierLancer !== null && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" role="status">
              Dernier lancer : <strong className="font-mono tabular-nums">{euros(dernierLancer)}</strong>
              <span className="text-slate-500"> — impossible à prévoir avant de lancer.</span>
            </div>
          )}
        </div>
      </div>

      {livre && (
        <GrandLivre livre={livre} grosLot={grosLot} valeurCalculee={valeurCalculee} />
      )}
    </div>
  );
}

/**
 * La roue elle-même : dix secteurs égaux. Les montants ne sont PAS écrits dans
 * le SVG — un secteur fait 36°, et « 12 € » posé à l'intérieur déborderait sur
 * son voisin. La légende DOM ci-dessus porte les montants ; le SVG ne porte
 * que la couleur, l'aiguille, et un `<title>` pour le lecteur d'écran.
 */
function Roue({ secteurs, dernierLancer }) {
  const R = 76;
  const C = 88;
  // Un secteur par unité d'effectif : dix parts égales, dans l'ordre déclaré.
  const parts = secteurs.flatMap((s) => Array.from({ length: s.effectif }, () => s));
  const angle = 360 / parts.length;

  const arc = (i) => {
    const a0 = (i * angle - 90) * (Math.PI / 180);
    const a1 = ((i + 1) * angle - 90) * (Math.PI / 180);
    const x0 = C + R * Math.cos(a0);
    const y0 = C + R * Math.sin(a0);
    const x1 = C + R * Math.cos(a1);
    const y1 = C + R * Math.sin(a1);
    return `M ${C} ${C} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
  };

  return (
    <svg
      viewBox="0 0 176 184"
      className="w-[176px] h-auto shrink-0 select-none"
      role="img"
      aria-label={`Roue de loterie à ${parts.length} secteurs égaux. ${secteurs
        .map((s) => `${s.effectif} secteurs paient ${euros(s.gain)}`)
        .join(', ')}.`}
    >
      {parts.map((s, i) => (
        <path key={i} d={arc(i)} fill={s.couleur} stroke="#ffffff" strokeWidth="1.5" />
      ))}
      <circle cx={C} cy={C} r={R} fill="none" stroke="#334155" strokeWidth="2.5" />
      <circle cx={C} cy={C} r="7" fill="#0f172a" />
      {/* L'aiguille, toujours en haut : c'est la roue qui tourne, pas elle. */}
      <path d={`M ${C} ${C - R - 6} l -7 12 l 14 0 Z`} fill="#0f172a" />
      <text x={C} y={172} textAnchor="middle" fontSize="12" fontWeight="700" fill="#475569">
        {dernierLancer === null ? 'prête' : euros(dernierLancer)}
      </text>
    </svg>
  );
}

/**
 * LE GRAND LIVRE : chaque gain possible, son effectif observé, sa fréquence —
 * et la MOYENNE des gains, posée sur une ligne horizontale.
 *
 * Les barres sont horizontales et proportionnelles aux effectifs : leur
 * longueur se compare à l'œil sans qu'aucun nombre n'ait besoin d'être dans le
 * SVG. Chaque ligne porte son effectif en DOM.
 *
 * La ligne de la moyenne (et, quand le module la pose, celle du calcul) vit
 * dans une RÈGLE séparée, graduée de 0 au plus grand gain : c'est le seul
 * endroit où les deux valeurs se comparent, et leurs étiquettes sont en DOM
 * sous la règle — elles peuvent se superposer au pixel près sans jamais
 * devenir illisibles.
 */
function GrandLivre({ livre, grosLot, valeurCalculee }) {
  const maxCount = Math.max(...livre.lignes.map((l) => l.count), 1);
  const maxGain = Math.max(grosLot, 1);
  const pct = (v) => `${Math.max(0, Math.min(100, (v / maxGain) * 100))}%`;

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 space-y-3">
      <div className="text-[13px] font-semibold text-indigo-900">
        Le grand livre — {livre.n.toLocaleString('fr-FR')} lancers
      </div>

      <table className="w-full text-sm">
        <caption className="sr-only">Effectif et fréquence de chaque gain sur {livre.n} lancers</caption>
        <thead>
          <tr className="text-[13px] text-slate-500 text-left">
            <th scope="col" className="font-medium pb-1">gain</th>
            <th scope="col" className="font-medium pb-1">sorti</th>
            <th scope="col" className="font-medium pb-1 w-1/2">part</th>
          </tr>
        </thead>
        <tbody>
          {livre.lignes.map((l) => (
            <tr key={l.x} className="border-t border-indigo-100">
              <th scope="row" className="py-1.5 font-mono font-bold tabular-nums text-left text-slate-900">{euros(l.x)}</th>
              <td className="py-1.5 font-mono tabular-nums text-slate-700">{l.count} fois</td>
              <td className="py-1.5">
                <div className="h-3 rounded-full bg-white border border-indigo-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-400"
                    style={{ width: `${(l.count / maxCount) * 100}%` }}
                    aria-hidden="true"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* La règle des gains, de 0 au plus grand lot, et ce qui s'y pose. */}
      <div>
        <div className="relative h-10 rounded-lg bg-white border border-slate-200">
          {livre.lignes.map((l) => (
            <span
              key={l.x}
              className="absolute top-1 w-px h-3 bg-slate-300"
              style={{ left: pct(l.x) }}
              aria-hidden="true"
            />
          ))}
          <span
            className="absolute top-0 bottom-0 w-[3px] rounded"
            style={{ left: pct(livre.moyenne), background: COULEUR_LIGNE }}
            aria-hidden="true"
          />
          {valeurCalculee !== null && valeurCalculee !== undefined && (
            <span
              className="absolute top-0 bottom-0 w-[3px] rounded opacity-80"
              style={{ left: pct(valeurCalculee), background: COULEUR_CALCUL }}
              aria-hidden="true"
            />
          )}
          <span className="absolute left-1 bottom-0.5 text-[13px] text-slate-400">0 €</span>
          <span className="absolute right-1 bottom-0.5 text-[13px] text-slate-400">{euros(maxGain)}</span>
        </div>

        {/* Les deux nombres, en DOM : ils peuvent se rejoindre sur la règle
            sans que leurs étiquettes ne se chevauchent jamais. */}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded" style={{ background: COULEUR_LIGNE }} aria-hidden="true" />
            moyenne des {livre.n.toLocaleString('fr-FR')} gains :{' '}
            <strong className="font-mono tabular-nums">{euros(livre.moyenne)}</strong>
          </span>
          {valeurCalculee !== null && valeurCalculee !== undefined && (
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded" style={{ background: COULEUR_CALCUL }} aria-hidden="true" />
              par le calcul : <strong className="font-mono tabular-nums">{euros(valeurCalculee)}</strong>
            </span>
          )}
        </div>
      </div>

      <p className="text-[13px] text-slate-500">
        Aucun lancer n’a rapporté {euros(livre.moyenne)} : ce montant n’est écrit sur aucun secteur.
        C’est la <strong>moyenne</strong> des {livre.n.toLocaleString('fr-FR')} gains, pas un gain.
      </p>
    </div>
  );
}

/** Le tableau de la loi, tel qu'il s'écrit au tableau — réutilisé aux modules 3 à 6. */
export function TableauDeLoi({ loi, titre = 'Loi de probabilité', enFractions = true, avecTotal = true }) {
  const total = loi[0]?.total;
  return (
    <div className="overflow-x-auto rounded-xl border-2 border-sky-200 bg-white">
      <table className="w-full text-center text-sm">
        <caption className="sr-only">{titre}</caption>
        <tbody>
          <tr className="bg-sky-50">
            <th scope="row" className="px-3 py-2 text-left font-semibold text-sky-900 whitespace-nowrap">
              gain x<sub>i</sub>
            </th>
            {loi.map((r) => (
              <td key={r.x} className="px-3 py-2 font-mono font-bold tabular-nums whitespace-nowrap">{euros(r.x)}</td>
            ))}
            {avecTotal && <td className="px-3 py-2 text-slate-400">total</td>}
          </tr>
          <tr className="border-t border-sky-200">
            <th scope="row" className="px-3 py-2 text-left font-semibold text-sky-900 whitespace-nowrap">
              P(X = x<sub>i</sub>)
            </th>
            {loi.map((r) => (
              <td key={r.x} className="px-3 py-2 font-mono tabular-nums whitespace-nowrap">
                {enFractions && Number.isInteger(r.n) ? `${r.n}/${total}` : fr(r.p)}
              </td>
            ))}
            {avecTotal && <td className="px-3 py-2 font-mono font-black text-sky-800">1</td>}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
