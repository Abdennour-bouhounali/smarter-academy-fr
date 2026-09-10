import React from 'react';
import { euros, fr, loiDuJeu, esperanceDuJeu, CRANS_ETIREMENT } from './dispersionUtils';

/**
 * DeuxJeuxLab — l'interaction SIGNATURE : deux jeux, la même espérance.
 *
 * Activity               deux stands de fête foraine posés côte à côte. L'élève
 *                        SIMULE 200 parties de chacun : deux nuages de points
 *                        apparaissent, avec la MÊME ligne centrale et des
 *                        largeurs manifestement différentes. Il peut ensuite
 *                        ÉTIRER la dispersion du jeu régulier au cliquet et
 *                        constater que la ligne centrale, elle, ne bouge pas.
 * Mathematical objective l'espérance ne suffit pas à décrire une variable
 *                        aléatoire : deux lois de même espérance peuvent être
 *                        radicalement différentes, et il manque un nombre qui
 *                        mesure l'étalement autour d'elle.
 * Student action         « Simuler 200 parties » (les deux jeux d'un coup), et
 *                        le cliquet d'étirement (jamais un curseur : chaque
 *                        coefficient doit être exactement atteignable, et la
 *                        loi étirée doit rester lisible).
 * Controlled variable    le coefficient d'étirement k du jeu régulier.
 * Mathematical state     { série de parties, k } ; les nuages, la ligne
 *                        centrale et la largeur en sont TOUS dérivés.
 * Visual consequence     le nuage du jeu régulier s'écarte ou se resserre
 *                        autour de sa ligne, qui ne se déplace pas d'un pixel.
 * Expected observation   « la ligne noire est au même endroit sur les deux
 *                        pistes, et pourtant les points ne sont pas du tout
 *                        répartis pareil ».
 * Misconception targeted « même moyenne, donc même jeu » ; « étaler les gains
 *                        rend le jeu plus rentable ».
 *
 * L'ALÉA EST INJECTÉ. Ce composant ne tire RIEN : il reçoit des séries déjà
 * calculées par le module, à partir d'un `makeRng` semé une seule fois par
 * session. Aucun `Math.random`, aucun tirage dans le rendu — sinon un simple
 * re-rendu changerait les nombres sous les yeux de l'élève.
 *
 * NOMBRES DANS LE DOM, jamais en <text> SVG. Les deux pistes partagent une
 * échelle et une ligne centrale : au cran le plus serré, les trois valeurs du
 * jeu régulier tiennent dans 12 px, et trois étiquettes posées là se
 * chevaucheraient nécessairement. Les valeurs vivent donc dans une LÉGENDE DOM
 * sous chaque piste, lisible quel que soit le resserrement.
 *
 * JAMAIS GELÉ après réussite : `disabled` ne sert qu'au verrou d'ANTÉRIORITÉ
 * d'une étape sur la précédente.
 */

/** Le cadre commun aux deux pistes, en euros. Fixe : les deux se comparent. */
const X_MIN = 0;
const X_MAX = 20;

const COULEUR_CENTRE = '#0f172a';

export default function DeuxJeuxLab({
  jeux,                  // [{ jeu, serie|null, loi }] — dans l'ordre d'affichage
  onSimuler = null,
  nbSeries = 0,
  cranEtirement = null,  // null = pas de réglage d'étirement affiché
  onChangerCran = null,
  jeuEtireId = null,     // l'id du jeu que le cliquet étire
  disabled = false,
}) {
  const idx = cranEtirement === null ? -1 : CRANS_ETIREMENT.indexOf(cranEtirement);
  const peutMonter = !disabled && onChangerCran && idx >= 0 && idx < CRANS_ETIREMENT.length - 1;
  const peutDescendre = !disabled && onChangerCran && idx > 0;

  const btn =
    'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 ' +
    'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  const btnAction =
    'h-11 px-4 rounded-xl border-2 border-indigo-300 bg-indigo-50 text-indigo-900 text-sm font-bold ' +
    'hover:border-indigo-500 hover:bg-indigo-100 disabled:opacity-40 active:scale-95 transition ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  return (
    <div className="space-y-3 rounded-2xl border-2 border-indigo-100 bg-white p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {jeux.map(({ jeu, serie, loi }) => (
          <Piste key={jeu.id} jeu={jeu} serie={serie} loi={loi} etire={jeu.id === jeuEtireId} />
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {onSimuler && (
          <button type="button" className={btnAction} onClick={onSimuler} disabled={disabled}>
            🎲 Simuler 200 parties de chaque jeu
          </button>
        )}
        {nbSeries > 0 && (
          <span className="text-[13px] text-slate-500" role="status">
            séries lancées : {nbSeries}
          </span>
        )}
      </div>

      {cranEtirement !== null && onChangerCran && (
        <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-3 space-y-2">
          <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Étirer la dispersion du jeu régulier">
            <span className="text-sm text-violet-900">étirement du jeu régulier :</span>
            <button
              type="button"
              className={btn}
              onClick={() => onChangerCran(CRANS_ETIREMENT[idx - 1])}
              disabled={!peutDescendre}
              aria-label="Resserrer les gains autour de la moyenne"
            >
              −
            </button>
            <span className="px-3 py-1.5 rounded-lg bg-violet-600 text-white font-mono font-bold tabular-nums text-sm">
              × {fr(cranEtirement)}
            </span>
            <button
              type="button"
              className={btn}
              onClick={() => onChangerCran(CRANS_ETIREMENT[idx + 1])}
              disabled={!peutMonter}
              aria-label="Écarter les gains de la moyenne"
            >
              +
            </button>
          </div>
          <p className="text-[13px] text-violet-800">
            Chaque gain s’éloigne (ou se rapproche) de la moyenne dans ce rapport. Regarde la barre
            noire pendant que tu changes le cran.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * UNE PISTE : la règle des gains de 0 à 20 €, la ligne de l'espérance, les
 * valeurs possibles, et — quand une série a été jouée — le nuage des résultats.
 *
 * Les points sont empilés par valeur, comme un DotPlot : l'empilement rend la
 * fréquence visible sans qu'aucun nombre n'ait besoin d'entrer dans le SVG.
 * La hauteur des piles est PLAFONNÉE et le plafond est signalé dans la légende
 * DOM, pour qu'une pile de 180 points ne déborde jamais du cadre.
 */
const H_PISTE = 118;
const Y_BASE = 96;
const PAS_PILE = 5;
const PILE_MAX = 16;          // 16 crans de 5 px = 80 px, sous les 96 de base

function Piste({ jeu, serie, loi, etire }) {
  const e = esperanceDuJeu(jeu);   // 2 € — la MÊME pour les deux jeux
  const toX = (v) => 24 + ((v - X_MIN) / (X_MAX - X_MIN)) * 452;

  // Empilement par valeur : on compte, puis on plafonne la hauteur dessinée.
  const parValeur = new Map();
  if (serie) {
    for (const v of serie.tirages) parValeur.set(v, (parValeur.get(v) ?? 0) + 1);
  }
  const plusHaute = Math.max(1, ...[...parValeur.values()]);
  const tronque = plusHaute > PILE_MAX;

  const points = [];
  for (const [v, c] of parValeur) {
    // Hauteur proportionnelle, jamais au-delà du plafond : la figure reste
    // dans son cadre quelle que soit la série (balayé par le test).
    const hauteur = Math.max(1, Math.min(PILE_MAX, Math.round((c / plusHaute) * PILE_MAX)));
    for (let i = 0; i < hauteur; i += 1) points.push({ v, i });
  }

  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="font-bold text-slate-900">
          <span aria-hidden="true">{jeu.emoji}</span> {jeu.nom}
        </span>
        <span className="text-[13px] text-slate-500">— {jeu.resume}</span>
        {etire && (
          <span className="text-[13px] font-semibold text-violet-700">· étirable</span>
        )}
      </div>

      <svg
        viewBox={`0 0 500 ${H_PISTE}`}
        className="w-full h-auto select-none"
        role="img"
        aria-label={`${jeu.nom} : gains possibles ${loi.map((r) => euros(r.x)).join(', ')}, moyenne à long terme ${euros(e)}${serie ? `, ${serie.n} parties simulées` : ''}.`}
      >
        {/* La règle des gains, commune aux deux pistes. */}
        <line x1={toX(X_MIN)} y1={Y_BASE} x2={toX(X_MAX)} y2={Y_BASE} stroke="#cbd5e1" strokeWidth="2" />
        {[0, 5, 10, 15, 20].map((g) => (
          <line key={g} x1={toX(g)} y1={Y_BASE} x2={toX(g)} y2={Y_BASE + 6} stroke="#cbd5e1" strokeWidth="1.5" />
        ))}

        {/* Les valeurs possibles du jeu : des repères clairs sur la règle. */}
        {loi.map((r) => (
          <line
            key={r.x}
            x1={toX(r.x)} y1={Y_BASE - 4} x2={toX(r.x)} y2={Y_BASE + 4}
            stroke={jeu.couleur} strokeWidth="2.5"
          />
        ))}

        {/* Le nuage : une pastille par cran de pile. */}
        {points.map((pt, i) => (
          <circle
            key={i}
            cx={toX(pt.v)}
            cy={Y_BASE - 5 - pt.i * PAS_PILE}
            r="2.6"
            fill={jeu.couleur}
            opacity="0.65"
          />
        ))}

        {/* LA LIGNE CENTRALE : l'espérance, à la MÊME abscisse sur les deux
            pistes. C'est elle que l'élève doit voir ne pas bouger. */}
        <line
          x1={toX(e)} y1={8} x2={toX(e)} y2={Y_BASE + 10}
          stroke={COULEUR_CENTRE} strokeWidth="3"
        />
      </svg>

      {/* Les nombres, en DOM : au cran le plus serré les trois valeurs tiennent
          dans une douzaine de pixels, et trois étiquettes SVG s'y
          chevaucheraient nécessairement. */}
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px]">
        <dt className="text-slate-500">gains possibles</dt>
        <dd className="font-mono tabular-nums text-slate-900">
          {loi.map((r) => `${euros(r.x)} (${r.n}/${r.total})`).join(' · ')}
        </dd>
        <dt className="text-slate-500">moyenne à long terme</dt>
        <dd className="font-mono tabular-nums font-bold text-slate-900">{euros(e)}</dd>
        {serie && (
          <>
            <dt className="text-slate-500">moyenne observée</dt>
            <dd className="font-mono tabular-nums text-slate-700">
              {euros(serie.moyenne)} <span className="text-slate-400">sur {serie.n} parties</span>
            </dd>
            <dt className="text-slate-500">du plus petit au plus gros</dt>
            <dd className="font-mono tabular-nums text-slate-700">
              {euros(Math.min(...serie.tirages))} → {euros(Math.max(...serie.tirages))}
            </dd>
          </>
        )}
      </dl>

      {tronque && (
        <p className="text-[13px] text-slate-400">
          Les piles sont à l’échelle de la plus haute : la hauteur compare, elle ne compte pas.
        </p>
      )}
    </div>
  );
}

/**
 * Le tableau de la loi, tel qu'il s'écrit au tableau — l'instrument de travail
 * de toute la première moitié de la leçon. Le tableau lui-même est un PRÉREQUIS
 * (leçon amont) : on l'emploie, on ne l'enseigne pas.
 */
export function TableauDeLoi({ loi, titre = 'Loi de probabilité', enFractions = true, avecTotal = true, unite = '€' }) {
  const total = loi[0]?.total;
  return (
    <div className="overflow-x-auto rounded-xl border-2 border-sky-200 bg-white">
      <table className="w-full text-center text-sm">
        <caption className="sr-only">{titre}</caption>
        <tbody>
          <tr className="bg-sky-50">
            <th scope="row" className="px-3 py-2 text-left font-semibold text-sky-900 whitespace-nowrap">
              x<sub>i</sub>
            </th>
            {loi.map((r) => (
              <td key={r.x} className="px-3 py-2 font-mono font-bold tabular-nums whitespace-nowrap">
                {unite === '€' ? euros(r.x) : `${fr(r.x)}${unite ? ` ${unite}` : ''}`}
              </td>
            ))}
            {avecTotal && <td className="px-3 py-2 text-slate-400">total</td>}
          </tr>
          <tr className="border-t border-sky-200">
            <th scope="row" className="px-3 py-2 text-left font-semibold text-sky-900 whitespace-nowrap">
              P(X = x<sub>i</sub>)
            </th>
            {loi.map((r) => (
              <td key={r.x} className="px-3 py-2 font-mono tabular-nums whitespace-nowrap">
                {enFractions && Number.isInteger(r.n) ? `${r.n}/${total}` : fr(r.p, { maxDecimals: 5 })}
              </td>
            ))}
            {avecTotal && <td className="px-3 py-2 font-mono font-black text-sky-800">1</td>}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
