import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  valeurs, indicateurs, sensibilite, fr, ecart, avecUnite,
} from './stats4e';

/**
 * ObservatoireLab — la manipulation SIGNATURE de la leçon
 * (INTERACTION_PEDAGOGY §6bis).
 *
 * Activity               tirer UNE pastille sur l'axe des trajets et regarder,
 *                        au-dessus, lesquels des trois résumés la suivent.
 * Mathematical objective un seul nombre ne résume pas une série. Les trois
 *                        résumés ne sont pas « plus ou moins précis » : ils
 *                        regardent des choses DIFFÉRENTES, et c'est pourquoi
 *                        déplacer la même donnée en fait bouger certains et
 *                        pas d'autres.
 * Student action         glisser la pastille désignée, à la souris, au doigt
 *                        ou aux flèches du clavier.
 * Controlled variable    la valeur d'UN individu, et elle seule. Les onze
 *                        autres ne bougent jamais — sans quoi on ne saurait
 *                        pas à quoi attribuer le changement.
 * Mathematical state     une SÉRIE (objet `serie` de stats4e). Les trois
 *                        résumés, les trois écarts et toute la figure en sont
 *                        DÉRIVÉS : rien n'est stocké deux fois, donc rien ne
 *                        peut diverger.
 * Visual consequence     les trois repères de l'axe et les trois écarts en
 *                        haut se réécrivent à chaque cran.
 * Expected observation   « le repère du milieu ne bouge pas d'un millimètre,
 *                        alors que je tire la pastille sur tout l'axe ».
 * Misconception targeted « la moyenne, c'est le milieu » — huit des douze
 *                        élèves sont déjà sous la moyenne AVANT tout geste.
 *
 * CE QUE CE LABO NE FAIT PAS (laissé aux modules suivants) : le CALCUL de la
 * médiane (M3), la pondération (M2), l'étendue comme objet nommé (M4), la
 * comparaison de deux séries (M5–M6), le diagramme tronqué (M7). Ici on
 * CONSTATE trois comportements, on n'en explique aucun.
 *
 * SÉCURITÉ VISUELLE (§6ter.4, §17bis). Le SVG ne porte AUCUN `<text>` : les
 * trois lectures, les graduations et les écarts vivent dans le DOM, en
 * colonnes à largeur fixe (`tabular-nums`), et ne peuvent donc ni se
 * chevaucher ni sortir du cadre quel que soit le nombre de chiffres. Les
 * repères sont trois traits verticaux de HAUTEURS DIFFÉRENTES, à trois
 * niveaux distincts : même superposés — ils le sont quand la médiane rejoint
 * la moyenne — ils restent distinguables.
 *
 * ATTEIGNABILITÉ (mémoire « cible atteignable sur la grille »). Le pas de la
 * poignée est de 1 minute et le domaine est un intervalle d'entiers : toute
 * valeur que le module demande d'atteindre est donc exactement atteignable.
 * Un test de `parcours.test.js` le verrouille pour chaque cible citée.
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement (mémoire « manipulations
 * gelées après validation »). Le labo reste vivant jusqu'à la fin du module.
 */

/* Les trois lectures, dans l'ordre où l'axe les dessine. Le libellé est
   volontairement une PHRASE et non le nom savant : « médiane » et « étendue »
   sont des mots que les modules 3 et 4 posent, pas celui-ci. */
export const REPERES = [
  {
    cle: 'moyenne',
    nom: 'Si on partageait tout également',
    court: 'Partage égal',
    couleur: '#b45309',
    trait: '#d97706',
    niveau: 0,
  },
  {
    cle: 'mediane',
    nom: 'La valeur qui coupe le groupe en deux',
    court: 'Coupe en deux',
    couleur: '#047857',
    trait: '#059669',
    niveau: 1,
  },
  {
    cle: 'etendue',
    nom: 'L’écart entre le plus petit et le plus grand',
    court: 'Écart des bouts',
    couleur: '#4338ca',
    trait: '#4f46e5',
    niveau: 2,
  },
];

const W = 1000;
const H = 200;
const PAD = { g: 26, d: 26, haut: 14, bas: 40 };
const RAYON = 15;

export default function ObservatoireLab({
  serie,
  serieInitiale,
  indice,
  domaine,
  axe,
  onValeur,
  reperesVisibles = ['moyenne', 'mediane', 'etendue'],
  titreAxe = 'minutes de trajet',
}) {
  const svgRef = useRef(null);
  const [glisse, setGlisse] = useState(false);

  const vs = valeurs(serie);
  const ind = indicateurs(serie);
  const item = serie.items[indice];

  // Les écarts par rapport à l'état INITIAL : c'est ce que l'élève lit pour
  // décider quel résumé « suit » sa pastille. Ils sont calculés par le noyau,
  // jamais par une soustraction refaite ici.
  const bilan = useMemo(
    () => sensibilite(serieInitiale, indice, item.valeur),
    [serieInitiale, indice, item.valeur],
  );

  const lo = axe.min;
  const hi = axe.max;
  const span = hi - lo || 1;
  const largeur = W - PAD.g - PAD.d;
  const xOf = (v) => PAD.g + ((v - lo) / span) * largeur;
  const baseY = H - PAD.bas;

  // Empilement des pastilles superposées : chaque valeur répétée monte d'un
  // cran, si bien qu'aucune pastille n'en recouvre une autre.
  const vues = new Map();
  const pastilles = serie.items.map((it, i) => {
    const k = vues.get(it.valeur) ?? 0;
    vues.set(it.valeur, k + 1);
    return { ...it, i, empile: k };
  });
  const yOf = (empile) => baseY - RAYON - 4 - empile * (RAYON * 2 + 3);

  const borne = (v) => Math.max(domaine.min, Math.min(domaine.max, v));
  const cran = (v) => borne(Math.round(v / domaine.pas) * domaine.pas);

  /**
   * Position du pointeur → valeur, dans le repère du SVG.
   * Les marges sont retirées AVANT la conversion : sans cela la pastille
   * décroche du doigt près des bords (mémoire « pièges du glisser geo5e »),
   * et le `setPointerCapture` posé au `pointerdown` fait suivre le doigt même
   * quand il sort du cadre.
   */
  const valeurDeLEvenement = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return item.valeur;
    const r = svg.getBoundingClientRect();
    if (r.width === 0) return item.valeur;
    const xSvg = ((e.clientX - r.left) / r.width) * W;
    return cran(lo + ((xSvg - PAD.g) / largeur) * span);
  }, [item.valeur, lo, span, largeur]);

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setGlisse(true);
    onValeur(valeurDeLEvenement(e));
  };
  const onPointerMove = (e) => {
    if (!glisse) return;
    onValeur(valeurDeLEvenement(e));
  };
  const finGlisse = (e) => {
    if (!glisse) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setGlisse(false);
  };

  const onKeyDown = (e) => {
    const gros = Math.max(domaine.pas, Math.round((domaine.max - domaine.min) / 10));
    const map = {
      ArrowLeft: -domaine.pas, ArrowDown: -domaine.pas,
      ArrowRight: domaine.pas, ArrowUp: domaine.pas,
      PageDown: -gros, PageUp: gros,
    };
    if (e.key in map) { e.preventDefault(); onValeur(borne(item.valeur + map[e.key])); return; }
    if (e.key === 'Home') { e.preventDefault(); onValeur(domaine.min); return; }
    if (e.key === 'End') { e.preventDefault(); onValeur(domaine.max); }
  };

  const graduations = [];
  for (let t = lo; t <= hi + 1e-9; t += axe.pas) graduations.push(Math.round(t));

  const affiches = REPERES.filter((r) => reperesVisibles.includes(r.cle));

  return (
    <div className="space-y-3" role="group" aria-label="Observatoire des trajets : déplacer une donnée et lire les résumés">

      {/* ── LES TROIS LECTURES, EN HAUT, EN PERMANENCE ─────────────────
          Elles sont au-dessus de la figure parce que ce sont ELLES qu'on
          surveille pendant le geste. Chacune porte sa valeur ET son écart
          depuis le départ : sans l'écart, « ça n'a pas bougé » resterait une
          impression. */}
      <div className="grid gap-2 sm:grid-cols-3">
        {affiches.map((r) => {
          const delta = bilan[`delta${r.cle[0].toUpperCase()}${r.cle.slice(1)}`];
          const bouge = Math.abs(delta) > 1e-9;
          return (
            <div
              key={r.cle}
              data-repere={r.cle}
              className={`rounded-2xl border-2 p-3 transition-colors ${
                bouge ? 'border-amber-300 bg-amber-50/70' : 'border-slate-200 bg-white'
              }`}
            >
              <p className="text-xs font-semibold leading-tight text-slate-500">{r.nom}</p>
              <p className="mt-1 font-mono text-2xl font-black tabular-nums" style={{ color: r.couleur }}>
                {r.cle === 'etendue' ? avecUnite(ind.etendue, serie.unite) : avecUnite(ind[r.cle], serie.unite)}
              </p>
              <p className={`mt-0.5 text-xs font-bold tabular-nums ${bouge ? 'text-amber-800' : 'text-slate-400'}`}>
                {bouge ? `a bougé de ${ecart(delta)}` : 'n’a pas bougé'}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── L'AXE ET SES DOUZE PASTILLES ───────────────────────────────
          Aucun <text> dans le SVG : les graduations sont la rangée DOM juste
          en dessous, et les repères sont légendés par la grille du haut. */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3">
        <svg
          ref={svgRef}
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          className="select-none touch-none"
          style={{ touchAction: 'none' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finGlisse}
          onPointerCancel={finGlisse}
          role="img"
          aria-label={`Douze trajets posés sur un axe de ${lo} à ${hi} ${serie.unite}. ${item.libelle} est à ${fr(item.valeur)} ${serie.unite}.`}
        >
          {/* Les repères : trois traits de hauteurs DIFFÉRENTES, pour rester
              distinguables même quand deux d'entre eux coïncident. */}
          {affiches.filter((r) => r.cle !== 'etendue').map((r) => {
            const x = xOf(ind[r.cle]);
            const haut = PAD.haut + r.niveau * 14;
            return (
              <g key={r.cle}>
                <line x1={x} y1={haut} x2={x} y2={baseY} stroke={r.trait} strokeWidth="4" strokeDasharray="9 6" />
                <circle cx={x} cy={haut} r="7" fill={r.trait} />
              </g>
            );
          })}

          {/* L'étendue n'est pas un POINT de l'axe : c'est une LONGUEUR. On la
              dessine donc comme une barre entre les deux extrêmes, jamais
              comme un trait vertical qui la ferait passer pour une valeur. */}
          {affiches.some((r) => r.cle === 'etendue') && (() => {
            const mini = Math.min(...vs);
            const maxi = Math.max(...vs);
            const y = baseY + 16;
            return (
              <g>
                <line x1={xOf(mini)} y1={y} x2={xOf(maxi)} y2={y} stroke="#4f46e5" strokeWidth="5" strokeLinecap="round" />
                <line x1={xOf(mini)} y1={y - 8} x2={xOf(mini)} y2={y + 8} stroke="#4f46e5" strokeWidth="5" />
                <line x1={xOf(maxi)} y1={y - 8} x2={xOf(maxi)} y2={y + 8} stroke="#4f46e5" strokeWidth="5" />
              </g>
            );
          })()}

          {/* L'axe et ses graduations, en traits seuls. */}
          <line x1={PAD.g} y1={baseY} x2={W - PAD.d} y2={baseY} stroke="#475569" strokeWidth="3" />
          {graduations.map((t) => (
            <line key={t} x1={xOf(t)} y1={baseY} x2={xOf(t)} y2={baseY + 8} stroke="#94a3b8" strokeWidth="2" />
          ))}

          {/* Les pastilles. Celle qui se tire est plus grande, cerclée, et
              porte une zone de préhension de 44 px de côté. */}
          {pastilles.map((p) => {
            const actif = p.i === indice;
            return (
              <g key={p.cle}>
                <circle
                  cx={xOf(p.valeur)}
                  cy={yOf(p.empile)}
                  r={actif ? RAYON + 3 : RAYON}
                  fill={actif ? '#e11d48' : '#0284c7'}
                  stroke="#fff"
                  strokeWidth="3"
                  opacity={actif ? 1 : 0.85}
                >
                  <title>{`${p.libelle ?? 'individu'} : ${fr(p.valeur)} ${serie.unite}`}</title>
                </circle>
              </g>
            );
          })}

          {/* LA POIGNÉE : une zone tactile large centrée sur la pastille
              active. `role="slider"` + flèches : le geste existe aussi au
              clavier, sans souris ni doigt. */}
          {(() => {
            const p = pastilles.find((q) => q.i === indice);
            const cx = xOf(p.valeur);
            const cy = yOf(p.empile);
            return (
              <g
                role="slider"
                tabIndex={0}
                aria-label={`Trajet de ${item.libelle}`}
                aria-valuemin={domaine.min}
                aria-valuemax={domaine.max}
                aria-valuenow={item.valeur}
                aria-valuetext={`${fr(item.valeur)} ${serie.unite}`}
                onKeyDown={onKeyDown}
                style={{ cursor: glisse ? 'grabbing' : 'ew-resize', outline: 'none' }}
                className="focus-visible:[&>circle:last-child]:stroke-blue-500"
              >
                <rect x={cx - 30} y={cy - 30} width={60} height={60} fill="transparent" />
                <circle cx={cx} cy={cy} r={RAYON + 3} fill="none" stroke="transparent" strokeWidth="4" />
              </g>
            );
          })()}
        </svg>

        {/* Les graduations, en DOM : jamais en <text> SVG (§6ter.5). */}
        <div className="flex justify-between px-1 text-xs tabular-nums text-slate-400">
          {graduations.map((t) => <span key={t}>{t}</span>)}
        </div>
        <p className="mt-0.5 text-center text-xs text-slate-400">{titreAxe}</p>
      </div>

      {/* ── LA POIGNÉE, AUSSI EN COMMANDE EXPLICITE ────────────────────
          La pastille se tire directement (§16 : le contrôle le plus direct) ;
          cette ligne est le REPÈRE de lecture — elle nomme qui l'on déplace et
          où il en est — et non un second moyen de le faire bouger. */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-2">
        <span className="text-sm text-slate-600">
          Tu déplaces <strong className="text-rose-700">{item.libelle}</strong>
        </span>
        <span className="font-mono text-lg font-black tabular-nums text-slate-900" data-poignee>
          {avecUnite(item.valeur, serie.unite)}
        </span>
      </div>
    </div>
  );
}
