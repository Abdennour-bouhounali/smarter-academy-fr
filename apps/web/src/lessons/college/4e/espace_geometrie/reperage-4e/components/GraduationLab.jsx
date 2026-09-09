import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { graduationPour, repereDe, fr, arrondi } from './reperage4e';

/**
 * GraduationLab — la manipulation SIGNATURE de la leçon (INTERACTION_PEDAGOGY §6bis).
 *
 * Activity              choisir la graduation de l'axe vertical pour un jeu de
 *                       données réelles qui ne tient pas dans la grille par
 *                       défaut.
 * Mathematical objective un repère n'est pas donné : il se CHOISIT, et le
 *                       choix se juge sur les données — un pas trop gros
 *                       confond des relevés distincts, un pas trop fin rend
 *                       l'axe incomptable, un pas de la mauvaise famille
 *                       laisse les valeurs entre deux traits.
 * Student action        appuyer sur un pas. Le repère se redessine aussitôt,
 *                       sans validation intermédiaire.
 * Controlled variable   le pas de l'axe vertical, et lui seul. Les données ne
 *                       changent jamais : c'est le REGARD qu'on change.
 * Mathematical state    le jeu de valeurs. Le repère, le nombre de
 *                       graduations, les points confondus et le verdict sont
 *                       TOUS calculés par `graduationPour`.
 * Visual consequence    les points s'empilent, ou l'axe se couvre de traits,
 *                       ou les points quittent les nœuds.
 * Expected observation  « ce n'est pas le repère qui est donné, c'est moi qui
 *                       le choisis — et un mauvais choix rend les données
 *                       illisibles ».
 * Misconception targeted croire qu'une graduation de 1 en 1 convient toujours,
 *                       et qu'un graphique « raté » est une erreur de tracé
 *                       plutôt qu'un choix d'échelle.
 *
 * LE VERDICT N'EST JAMAIS ÉCRIT EN PROSE. Chaque phrase affichée sous le
 * repère vient de `graduationPour` : le nombre de graduations est compté, les
 * paires confondues sont énumérées, les valeurs hors nœud sont listées. Si le
 * comportement changeait, le texte changerait avec lui — il ne peut pas
 * mentir. C'est la règle « la figure ne ment jamais » appliquée à un verdict.
 *
 * POURQUOI DES PAS À CHOISIR, ET NON UN CURSEUR CONTINU. Le choix d'une
 * graduation est DISCRET dans la vraie vie : on prend 1, 2, 5, 10 — jamais
 * 3,7. Un curseur continu suggérerait le contraire et rendrait le geste
 * insignifiant. Le contrôle épouse ici la structure de l'objet mathématique.
 *
 * SÉCURITÉ VISUELLE : `unitY` est calculé pour que le cadre garde une hauteur
 * bornée QUEL QUE SOIT le pas choisi — sans cela, le pas le plus fin produirait
 * un repère de plusieurs milliers de pixels de haut. Les verdicts sont dans le
 * DOM, jamais en texte SVG.
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement. L'élève peut revenir sur un
 * mauvais pas après avoir trouvé le bon — et c'est souvent là qu'il comprend.
 */

/** La hauteur visée pour le repère, en pixels. Le cadre s'y tient toujours. */
const HAUTEUR_CIBLE = 300;
/** La largeur visée. */
const LARGEUR_CIBLE = 320;

export default function GraduationLab({
  /** Les couples (abscisse, valeur) à représenter. */
  donnees,
  /** Le pas de l'axe horizontal — fixé par le module, ce n'est pas la question. */
  pasX,
  /** Les pas proposés pour l'axe vertical. */
  pasProposes,
  /** Le pas actuellement choisi. */
  pasY,
  onPasY,
  /** Le budget de graduations au-delà duquel l'axe devient incomptable. */
  budget = 26,
  labelX = 'x',
  labelY = 'y',
  uniteX = '',
  uniteY = '',
  ariaLabel = 'Choix de la graduation',
}) {
  const valeursX = donnees.map((d) => d.x);
  const valeursY = donnees.map((d) => d.y);

  // LE VERDICT, CALCULÉ — pour le pas choisi et pour tous les autres, de sorte
  // que les boutons puissent eux-mêmes porter leur diagnostic.
  const etude = graduationPour(valeursY, { budget, pas: pasProposes });
  const choisi = etude.candidats.find((c) => c.pas === pasY) ?? etude.candidats[0];

  const repere = repereDe(valeursX, valeursY, pasX, choisi.pas);

  /* LE CADRE SE DÉDUIT DU CONTENU (§17bis). Le nombre de graduations varie
     d'un facteur dix entre le pas le plus fin et le plus gros : une taille
     d'unité fixe ferait un repère de 4 000 px de haut au pas le plus fin.
     On calcule donc l'unité pour tenir la hauteur cible — la grille devient
     dense, ce qui est PRÉCISÉMENT le défaut que l'élève doit voir, mais le
     cadre, lui, ne casse jamais. */
  const etendueX = repere.xMax - repere.xMin;
  const etendueY = repere.yMax - repere.yMin;
  const unit = LARGEUR_CIBLE / Math.max(etendueX, 1e-9);
  const unitY = HAUTEUR_CIBLE / Math.max(etendueY, 1e-9);

  // Les points aimantés sur la grille du pas choisi : c'est ce que l'élève
  // verrait vraiment s'il posait ses relevés à cette graduation. Deux relevés
  // confondus donnent alors littéralement UN seul point à l'écran.
  const points = donnees.map((d) => ({
    id: d.id ?? `p${d.x}`,
    x: d.x,
    y: arrondi(Math.round(d.y / choisi.pas) * choisi.pas, 9),
    color: '#e11d48',
  }));

  /* LE NOMBRE DE VALEURS ENCORE DISTINGUABLES SUR L'AXE RÉGLÉ.
     On compte les ORDONNÉES distinctes après aimantation, et NON les points
     du plan : chaque relevé ayant sa propre heure, deux points ne se
     superposent jamais complètement, et un compte de points aurait toujours
     affiché « 12 / 12 » — juste à côté d'un verdict annonçant des relevés
     confondus. Le panneau aurait contredit le verdict, sur le même écran.
     (Défaut attrapé par le test de parcours.) La question posée par le module
     porte sur l'axe vertical : c'est donc lui qu'il faut mesurer. */
  const valeursDistinctes = new Set(points.map((p) => p.y)).size;
  const valeursInitiales = new Set(valeursY).size;

  /* COMBIEN DE GRADUATIONS ÉTIQUETER — et pourquoi ce n'est pas un détail.
     Le pas le plus fin de la leçon (0,25 sur une amplitude de 10,5) donne 43
     graduations. `CoordPlane` n'en étiquette alors qu'une sur deux, ce qui
     laisse encore 22 étiquettes du type « −2,5 » sur 300 px : elles se
     chevauchaient entre elles et débordaient du cadre (défaut relevé par
     l'audit de mise en page de la suite navigateur).

     On choisit donc l'espacement des ÉTIQUETTES d'après la place réellement
     disponible : au moins ~26 px entre deux étiquettes voisines. Les
     graduations, elles, restent TOUTES dessinées — c'est justement leur
     densité que l'élève doit voir. On ne les nomme simplement pas toutes,
     exactement comme le ferait un axe imprimé.
     `labelEvery` de CoordPlane vaut pour les DEUX axes : on prend donc le
     plus exigeant des deux, ce qui ne coûte rien ici (l'axe horizontal, en
     heures ou en kilomètres, est toujours large). */
  const ESPACE_MIN_ETIQUETTE = 26;
  const espacement = (px) => Math.max(1, Math.ceil(ESPACE_MIN_ETIQUETTE / Math.max(px, 1e-9)));
  const labelEvery = Math.max(
    espacement(unitY * choisi.pas),
    espacement(unit * pasX),
  );

  const TON = {
    ok: { bord: 'border-emerald-300', fond: 'bg-emerald-50', texte: 'text-emerald-900', puce: 'bg-emerald-600' },
    'trop-de-graduations': { bord: 'border-amber-300', fond: 'bg-amber-50', texte: 'text-amber-900', puce: 'bg-amber-600' },
    'points-confondus': { bord: 'border-rose-300', fond: 'bg-rose-50', texte: 'text-rose-900', puce: 'bg-rose-600' },
    'entre-les-graduations': { bord: 'border-violet-300', fond: 'bg-violet-50', texte: 'text-violet-900', puce: 'bg-violet-600' },
  };
  const ton = TON[choisi.verdict];

  return (
    <div className="space-y-3" role="group" aria-label={ariaLabel}>
      {/* Le choix : des pas discrets, comme dans la vraie vie. */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3">
        <p className="mb-2 text-sm font-semibold text-slate-700">
          Une graduation de l’axe vertical vaut :
        </p>
        <div className="flex flex-wrap gap-2">
          {pasProposes.map((p) => {
            const c = etude.candidats.find((x) => x.pas === p);
            const actif = p === choisi.pas;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPasY(p)}
                aria-pressed={actif}
                className={`min-h-[44px] min-w-[64px] rounded-xl border-2 px-3 py-2 text-sm font-bold tabular-nums transition ${
                  actif
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                {fr(p, 2)}{uniteY ? ` ${uniteY}` : ''}
                <span className="ml-1.5" aria-hidden="true">{c?.ok ? '✓' : '·'}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Le repère, redessiné à chaque appui — sans validation intermédiaire. */}
      <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white p-2">
        <CoordPlane
          range={{ xMin: repere.xMin, xMax: repere.xMax, yMin: repere.yMin, yMax: repere.yMax }}
          unit={unit}
          unitY={unitY}
          xStep={repere.xStep}
          yStep={repere.yStep}
          labelEvery={labelEvery}
          points={points}
          axisLabels={{ x: labelX, y: labelY }}
          caption={false}
          ariaLabel={`Repère, une graduation verticale vaut ${fr(choisi.pas, 2)}`}
        />
      </div>

      {/* LE VERDICT, dans le DOM et calculé — jamais en texte SVG. */}
      <div className={`rounded-2xl border-2 p-3 ${ton.bord} ${ton.fond}`} aria-live="polite">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${ton.puce}`} aria-hidden="true" />
          <p className={`text-sm font-bold ${ton.texte}`}>
            {choisi.verdict === 'ok' ? 'Graduation adaptée' : 'Graduation à revoir'}
          </p>
        </div>
        <p className={`mt-1 text-sm ${ton.texte}`}>{choisi.raison}</p>

        <div className="mt-2 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl bg-white/70 px-2 py-1.5">
            <div className="text-xs font-semibold text-slate-500">graduations</div>
            <div className="font-mono text-lg font-black tabular-nums text-slate-900">
              {choisi.graduations}
            </div>
            <div className="text-xs text-slate-400">budget : {budget}</div>
          </div>
          <div className="rounded-xl bg-white/70 px-2 py-1.5">
            <div className="text-xs font-semibold text-slate-500">valeurs distinctes</div>
            <div className="font-mono text-lg font-black tabular-nums text-slate-900">
              {valeursDistinctes} / {valeursInitiales}
            </div>
            <div className="text-xs text-slate-400">
              {valeursDistinctes < valeursInitiales
                ? 'des relevés se confondent'
                : 'chacun garde la sienne'}
            </div>
          </div>
        </div>

        {/* Les relevés perdus, NOMMÉS : « 3,5 et 4 sont devenus le même point ». */}
        {choisi.confondus.length > 0 && (
          <div className="mt-2 rounded-xl bg-white/70 px-2.5 py-2">
            <p className="text-xs font-semibold text-slate-500">Relevés devenus indiscernables</p>
            <ul className="mt-0.5 space-y-0.5">
              {choisi.confondus.slice(0, 4).map(([a, b]) => (
                <li key={`${a}-${b}`} className="font-mono text-sm text-rose-800">
                  {fr(a, 2)}{uniteY && ` ${uniteY}`} et {fr(b, 2)}{uniteY && ` ${uniteY}`} → le même point
                </li>
              ))}
              {choisi.confondus.length > 4 && (
                <li className="text-xs text-slate-500">… et {choisi.confondus.length - 4} autre{choisi.confondus.length - 4 > 1 ? 's' : ''}</li>
              )}
            </ul>
          </div>
        )}

        {/* Les valeurs qui ne tombent sur aucun trait. */}
        {choisi.verdict === 'entre-les-graduations' && choisi.horsNoeud.length > 0 && (
          <div className="mt-2 rounded-xl bg-white/70 px-2.5 py-2">
            <p className="text-xs font-semibold text-slate-500">
              Relevés qui ne tombent sur aucune graduation
            </p>
            <p className="mt-0.5 font-mono text-sm text-violet-800">
              {choisi.horsNoeud.slice(0, 6).map((v) => fr(v, 2)).join(' · ')}
              {choisi.horsNoeud.length > 6 && ' …'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
