import React, { useMemo } from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { planeFor, tableau, enPoints, frRat, fr } from './fonctions4e';

/**
 * GrapheLab — chaque couple devient un point, et le repère s'ajuste à ce
 * qu'on calcule.
 *
 * Activity               poser les couples un à un dans le repère, puis
 *                        laisser le trait les relier.
 * Mathematical objective une dépendance a trois visages qui disent la même
 *                        chose : la chaîne, la formule, et le dessin. Le
 *                        dessin n'est pas une illustration — il se LIT.
 * Student action         poser le point suivant ; changer d'entrées et voir
 *                        le CADRE se refaire tout seul.
 * Controlled variable    le nombre de couples posés, et le jeu d'entrées.
 * Mathematical state     (prog, entrées, posés). Le cadre — étendue, pas,
 *                        pixels par unité — est calculé par `planeFor` à
 *                        partir des points EUX-MÊMES : aucune borne n'est
 *                        écrite en dur, donc aucun point ne peut sortir du
 *                        cadre, quel que soit le programme.
 * Visual consequence     le point apparaît ; quand tous sont posés, le trait
 *                        les traverse.
 * Expected observation   « les points sont sur une même ligne, et je peux
 *                        lire entre eux ».
 * Misconception targeted croire qu'une dépendance MONTE forcément — l'enclos
 *                        et la citerne descendent, et le dessin le montre.
 *
 * SÉCURITÉ VISUELLE / §17bis : le cadre est DÉRIVÉ (`planeFor`), donc il tient
 * pour 100 000 comme pour 0,25 ; les graduations sont bornées par `maxTicks`.
 * Les lectures chiffrées (le couple courant, la consigne) vivent dans le DOM,
 * jamais en <text> SVG. `unitY` est toujours passé — un repère qui l'oublie
 * s'étire en colonne (garde d'aspect de la suite e2e).
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement.
 */

const LARGEUR = 300;
const HAUTEUR = 210;

export default function GrapheLab({
  prog,
  entrees,
  poses = null,          // nombre de points déjà posés ; null = tous
  couleur = '#7c3aed',
  entreeNom = 'entrée',
  sortieNom = 'sortie',
  uniteEntree = '',
  uniteSortie = '',
  trait = true,
}) {
  // NOM DES AXES — court, par obligation de mise en page (§17bis). CoordPlane
  // pose le nom de l'axe des abscisses à 14 px APRÈS la flèche, et réserve la
  // marge droite par un `max(demi-dernière-graduation, largeur-du-nom)` : les
  // deux se disputent donc le même espace, et un nom long recouvre la dernière
  // graduation. Le défaut a été vu au navigateur (« entrée » ↔ « 6 »). On
  // préfère l'unité quand elle existe — « m », « L », « min » — et un symbole
  // d'une lettre sinon ; les noms COMPLETS des grandeurs vivent dans le DOM,
  // sous le repère, où rien ne les contraint.
  const nomAxeX = (uniteEntree || 'x').slice(0, 3);
  const nomAxeY = (uniteSortie || 'y').slice(0, 3);
  const tous = useMemo(() => enPoints(tableau(prog, entrees)), [prog, entrees]);
  const n = poses == null ? tous.length : Math.max(0, Math.min(poses, tous.length));
  const visibles = tous.slice(0, n);

  // Le CADRE est calculé sur TOUS les points — il ne bouge donc pas sous les
  // pieds de l'élève au fur et à mesure qu'il en pose.
  //
  // CORRECTION DE MISE EN PAGE (§17bis). `planeFor` optimise le NOMBRE de
  // graduations et peut donc proposer un demi-pas (0,5) pour six entrées
  // entières : la dernière graduation tombe alors sur « 5,5 », juste sous le
  // nom de l'axe, et les deux se chevauchent. Quand toutes les entrées sont
  // entières, on force un pas horizontal ENTIER — le dessin dit la même
  // chose, et plus rien ne se superpose. Verrouillé par un test.
  const plan = useMemo(() => {
    const base = planeFor(tous, { width: LARGEUR, height: HAUTEUR });
    const entieres = tous.every((p) => Number.isInteger(p.x));
    if (!entieres || Number.isInteger(base.xStep)) return base;
    const xStep = Math.max(1, Math.round(base.xStep));
    const xMax = Math.ceil(base.range.xMax / xStep) * xStep;
    const xMin = Math.floor(base.range.xMin / xStep) * xStep;
    return {
      ...base,
      xStep,
      range: { ...base.range, xMin, xMax },
      unit: LARGEUR / (xMax - xMin),
      xTicks: Math.round((xMax - xMin) / xStep) + 1,
    };
  }, [tous]);

  const points = visibles.map((p, i) => ({ id: `p${i}`, x: p.x, y: p.y, color: couleur }));
  const segments =
    trait && visibles.length >= 2
      ? [{
          // `id` est OBLIGATOIRE : CoordPlane s'en sert comme clé React, et un
          // segment sans id fait crier le rendu en console (attrapé par la
          // garde « console vide » de la suite e2e).
          id: 'trait',
          from: { x: visibles[0].x, y: visibles[0].y },
          to: { x: visibles[visibles.length - 1].x, y: visibles[visibles.length - 1].y },
          color: couleur,
        }]
      : [];

  const suivant = n < tous.length ? tous[n] : null;

  return (
    <div className="space-y-3">
      <CoordPlane
        range={plan.range}
        unit={plan.unit}
        unitY={plan.unitY}
        xStep={plan.xStep}
        yStep={plan.yStep}
        points={points}
        segments={segments}
        axisLabels={{ x: nomAxeX, y: nomAxeY }}
        ariaLabel={`Repère : ${visibles.length} point${visibles.length > 1 ? 's' : ''} de la dépendance entre ${entreeNom} et ${sortieNom}`}
        caption={false}
      />
      {/* Les lectures chiffrées ET les noms complets des grandeurs, dans le
          DOM : le repère n'affiche que des symboles courts. */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
        <span>
          <span className="font-mono font-bold">{nomAxeX}</span> : {entreeNom} ·{' '}
          <span className="font-mono font-bold">{nomAxeY}</span> : {sortieNom}
        </span>
        <span>
          {visibles.length} / {tous.length} point{tous.length > 1 ? 's' : ''} posé
          {visibles.length > 1 ? 's' : ''}
        </span>
        <span className="font-mono tabular-nums">
          pas horizontal {fr(plan.xStep)} · pas vertical {fr(plan.yStep)}
        </span>
      </div>
      {suivant && (
        <p className="rounded-xl bg-purple-50 px-3 py-2 text-sm text-purple-900">
          Point suivant : {entreeNom} <strong className="font-mono">{fr(suivant.x)}</strong>
          {uniteEntree ? ` ${uniteEntree}` : ''} → {sortieNom}{' '}
          <strong className="font-mono">{fr(suivant.y)}</strong>
          {uniteSortie ? ` ${uniteSortie}` : ''}.
        </p>
      )}
    </div>
  );
}

/** Les couples exacts d'un programme sur un jeu d'entrées — pour les corrections. */
export const couplesExacts = (prog, entrees) =>
  tableau(prog, entrees).map((c) => ({ x: frRat(c.x), y: frRat(c.y) }));
