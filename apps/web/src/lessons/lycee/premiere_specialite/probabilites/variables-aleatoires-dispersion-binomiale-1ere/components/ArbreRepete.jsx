import React from 'react';
import { fr, binomialCoeff } from './dispersionUtils';

/**
 * ArbreRepete — l'arbre d'une épreuve à deux issues, répétée n fois.
 *
 * Activity               l'élève DÉPLIE l'arbre niveau par niveau, de 1 à 5, et
 *                        voit le nombre de chemins doubler à chaque épreuve
 *                        ajoutée, avec toujours les mêmes deux poids.
 * Mathematical objective la répétition d'une épreuve identique et indépendante
 *                        produit un arbre RÉGULIER ; le nombre de chemins
 *                        double, mais le nombre de décomptes possibles, lui,
 *                        n'augmente que de 1.
 * Student action         le cliquet du nombre de niveaux (jamais un curseur :
 *                        un nombre d'épreuves est un entier, et chaque valeur
 *                        doit être exactement atteignable).
 * Controlled variable    le nombre de répétitions n.
 * Mathematical state     { n } ; l'arbre, le compte des chemins et la
 *                        répartition par décompte en sont TOUS dérivés.
 * Visual consequence     l'arbre se déploie vers la droite, chaque nœud donnant
 *                        deux branches ; la colonne de droite regroupe les
 *                        extrémités par nombre de succès.
 * Expected observation   « les branches portent toujours les deux mêmes
 *                        nombres, et plusieurs chemins arrivent au même
 *                        décompte ».
 * Misconception targeted « chaque chemin est un résultat différent, donc il y a
 *                        autant de valeurs que de chemins ».
 *
 * DEUX POIDS DANS LE SVG, ET RIEN D'AUTRE. Les poids p et 1 − p sont écrits UNE
 * FOIS, dans une légende DOM sous la figure — pas trente-deux fois sur les
 * branches. À cinq niveaux, l'arbre porte 62 branches dont les étiquettes
 * seraient distantes de moins de 3 px : elles se chevaucheraient
 * nécessairement. Le SVG ne porte donc que la STRUCTURE, et la légende porte
 * les nombres.
 *
 * PROFONDEUR PLAFONNÉE À 5 : au-delà, 2⁶ = 64 extrémités ne tiennent plus dans
 * la hauteur du cadre sans que les nœuds ne fusionnent visuellement. Le plafond
 * est celui de la leçon, pas une limite technique.
 *
 * JAMAIS GELÉ après réussite : `disabled` ne sert qu'au verrou d'ANTÉRIORITÉ.
 */

const W = 520;
const H = 260;
const MARGE_G = 18;
const MARGE_D = 96;      // la colonne des décomptes
const MARGE_V = 12;

const C_SUCCES = '#7c3aed';
const C_ECHEC = '#94a3b8';

export default function ArbreRepete({
  niveaux,
  niveauxMax = 5,
  p,
  labelSucces = 'succès',
  labelEchec = 'échec',
  onChangerNiveaux = null,
  disabled = false,
}) {
  const peutMonter = !disabled && onChangerNiveaux && niveaux < niveauxMax;
  const peutDescendre = !disabled && onChangerNiveaux && niveaux > 1;

  const btn =
    'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 ' +
    'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  // La géométrie : un niveau = une colonne ; 2^i nœuds au niveau i.
  const largeurUtile = W - MARGE_G - MARGE_D;
  const dx = largeurUtile / niveaux;
  const hauteurUtile = H - 2 * MARGE_V;

  /** L'ordonnée du nœud j du niveau i (0 ≤ j < 2^i) : le centre de sa tranche. */
  const yDe = (i, j) => MARGE_V + ((j + 0.5) / 2 ** i) * hauteurUtile;
  const xDe = (i) => MARGE_G + i * dx;

  const branches = [];
  for (let i = 0; i < niveaux; i += 1) {
    for (let j = 0; j < 2 ** i; j += 1) {
      // Branche haute = succès, branche basse = échec, à tous les niveaux :
      // c'est la RÉGULARITÉ que l'élève doit voir.
      branches.push({ key: `${i}-${j}-s`, x1: xDe(i), y1: yDe(i, j), x2: xDe(i + 1), y2: yDe(i + 1, 2 * j), succes: true });
      branches.push({ key: `${i}-${j}-e`, x1: xDe(i), y1: yDe(i, j), x2: xDe(i + 1), y2: yDe(i + 1, 2 * j + 1), succes: false });
    }
  }

  const nbFeuilles = 2 ** niveaux;
  // Les feuilles deviennent invisibles au-delà d'une certaine densité : on les
  // dessine plus petites plutôt que de les laisser se toucher.
  const rFeuille = Math.max(1.2, Math.min(4, hauteurUtile / nbFeuilles / 3));
  const rNoeud = Math.max(1.5, Math.min(3.5, rFeuille + 0.5));

  const repartition = Array.from({ length: niveaux + 1 }, (_, k) => binomialCoeff(niveaux, k));

  return (
    <div className="space-y-3 rounded-2xl border-2 border-emerald-100 bg-white p-4">
      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Nombre de prélèvements">
        <span className="text-sm text-slate-600">nombre de prélèvements :</span>
        <button
          type="button" className={btn}
          onClick={() => onChangerNiveaux(niveaux - 1)}
          disabled={!peutDescendre}
          aria-label="Retirer un prélèvement"
        >
          −
        </button>
        <span className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-mono font-bold tabular-nums text-sm">
          {niveaux}
        </span>
        <button
          type="button" className={btn}
          onClick={() => onChangerNiveaux(niveaux + 1)}
          disabled={!peutMonter}
          aria-label="Ajouter un prélèvement"
        >
          +
        </button>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto select-none"
        role="img"
        aria-label={`Arbre de ${niveaux} épreuves répétées à deux issues. ${nbFeuilles} chemins au total. Répartition par nombre de ${labelSucces} : ${repartition.map((c, k) => `${k} → ${c} chemins`).join(', ')}.`}
      >
        {branches.map((b) => (
          <line
            key={b.key}
            x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2}
            stroke={b.succes ? C_SUCCES : C_ECHEC}
            strokeWidth={b.succes ? 1.4 : 1}
            opacity={niveaux >= 4 ? 0.75 : 1}
          />
        ))}
        {/* La racine, et les nœuds intermédiaires. */}
        <circle cx={xDe(0)} cy={yDe(0, 0)} r="4" fill="#0f172a" />
        {Array.from({ length: niveaux }, (_, i) => i + 1).flatMap((i) =>
          Array.from({ length: 2 ** i }, (_, j) => (
            <circle
              key={`n${i}-${j}`}
              cx={xDe(i)} cy={yDe(i, j)}
              r={i === niveaux ? rFeuille : rNoeud}
              fill={i === niveaux ? '#0f172a' : '#475569'}
            />
          )),
        )}
        {/* Le trait de séparation de la colonne des décomptes. */}
        <line
          x1={W - MARGE_D + 10} y1={MARGE_V} x2={W - MARGE_D + 10} y2={H - MARGE_V}
          stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="3 3"
        />
      </svg>

      {/* Les nombres, en DOM : à cinq niveaux, 62 étiquettes de branche
          seraient distantes de moins de 3 px et se chevaucheraient. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <ul className="space-y-1" aria-label="Les poids des branches">
          <li className="flex items-center gap-2">
            <span className="inline-block w-4 h-1 rounded" style={{ background: C_SUCCES }} aria-hidden="true" />
            <span className="text-slate-600">{labelSucces} :</span>
            <strong className="font-mono tabular-nums text-slate-900">{fr(p)}</strong>
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block w-4 h-1 rounded" style={{ background: C_ECHEC }} aria-hidden="true" />
            <span className="text-slate-600">{labelEchec} :</span>
            <strong className="font-mono tabular-nums text-slate-900">{fr(1 - p)}</strong>
          </li>
          <li className="text-[13px] text-slate-500">
            Les mêmes deux poids à chaque niveau — c’est ce qui rend l’arbre régulier.
          </li>
        </ul>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-center text-[13px]">
            <caption className="sr-only">Nombre de chemins par nombre de {labelSucces}</caption>
            <tbody>
              <tr className="bg-slate-50">
                <th scope="row" className="px-2 py-1 text-left font-medium text-slate-600 whitespace-nowrap">
                  {labelSucces}
                </th>
                {repartition.map((_, k) => (
                  <td key={k} className="px-2 py-1 font-mono tabular-nums">{k}</td>
                ))}
              </tr>
              <tr className="border-t border-slate-200">
                <th scope="row" className="px-2 py-1 text-left font-medium text-slate-600 whitespace-nowrap">
                  chemins
                </th>
                {repartition.map((c, k) => (
                  <td key={k} className="px-2 py-1 font-mono font-bold tabular-nums" style={{ color: C_SUCCES }}>{c}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
