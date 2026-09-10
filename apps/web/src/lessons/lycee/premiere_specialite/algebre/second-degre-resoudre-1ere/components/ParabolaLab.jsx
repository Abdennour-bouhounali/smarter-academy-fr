import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { LAB, C_STEPS, labState, cAimante, fr, evalTrinome } from './quadUtils';

/**
 * ParabolaLab — l'interaction SIGNATURE : la parabole qui remonte.
 *
 * Activity               une parabole y = x² − 4x + c, dont l'élève fait
 *                        MONTER ou DESCENDRE la hauteur au cliquet sur c. Les
 *                        deux points d'intersection avec l'axe des abscisses
 *                        glissent l'un vers l'autre, FUSIONNENT en un seul,
 *                        puis DISPARAISSENT.
 * Mathematical objective le NOMBRE de solutions de x² − 4x + c = 0 se décide
 *                        avant toute résolution, par un seul nombre — ici
 *                        b² − 4ac — qui change de signe pile à la fusion.
 * Student action         SAISIR la parabole par son sommet et la TIRER
 *                        verticalement — c'est la courbe elle-même qu'on
 *                        déplace (règle utilisateur « le glisser d'abord »).
 *                        Le lâcher AIMANTE sur le cran de c le plus proche,
 *                        si bien que le cran de la fusion reste exactement
 *                        atteignable au doigt comme au bouton (c = 4 est le
 *                        huitième cran). Les boutons « monter » / « descendre »
 *                        et le clavier restent des chemins complets.
 * Controlled variable    c, la hauteur de la courbe.
 * Mathematical state     c seul ; racines, sommet, b² − 4ac et le compteur en
 *                        sont TOUS dérivés.
 * Visual consequence     la courbe glisse verticalement ; les deux points se
 *                        rapprochent, se confondent, s'effacent.
 * Expected observation   « les points se rencontrent EXACTEMENT quand le
 *                        nombre affiché passe par zéro ».
 * Misconception targeted « il faut résoudre pour savoir combien il y a de
 *                        solutions » ; « pas de point d'intersection = pas de
 *                        courbe / pas d'équation ».
 *
 * Nombres dans le DOM, jamais en <text> SVG : c'est la parade contre les
 * collisions d'étiquettes quand les deux points se rejoignent à 0 d'écart.
 *
 * JAMAIS GELÉ après réussite : `disabled` ne sert qu'au verrou d'ANTÉRIORITÉ
 * d'une étape sur la précédente. Un élève qui vient de comprendre doit pouvoir
 * refaire le geste.
 */
const COURBE = '#4f46e5';
const RACINE = '#e11d48';
const SOMMET = '#d97706';

export default function ParabolaLab({
  c,
  onChangeC,
  visites = [],
  disabled = false,
  showSommet = true,
  /** Le second afficheur (b² − 4ac) est masqué à l'étape 1 : on regarde
   *  d'abord le phénomène, on cherche le nombre qui le prédit ensuite. */
  showNombre = true,
  /** Nom donné au nombre affiché. Au module 1 il n'en a PAS : c'est le
   *  module 2 qui le nomme et le note Δ. */
  nomDuNombre = 'b² − 4ac',
}) {
  const s = labState(c);
  const idx = C_STEPS.indexOf(c);
  const peutMonter = !disabled && idx >= 0 && idx < C_STEPS.length - 1;
  const peutDescendre = !disabled && idx > 0;

  const points = s.racines.map((r, i) => ({
    id: `r${i}`, x: r, y: 0, color: RACINE,
  }));
  // LE SOMMET EST TOUJOURS PRÉSENT — c'est la POIGNÉE de la courbe, et une
  // poignée absente rendrait le laboratoire impilotable au doigt. `showSommet`
  // ne décide donc que de sa COULEUR : mis en avant quand le module parle du
  // sommet, discret quand il n'en parle pas encore. Le faire disparaître
  // reviendrait à supprimer le glisser à l'étape 1, c'est-à-dire exactement à
  // l'endroit où l'élève découvre le geste.
  points.push({
    id: 'S',
    x: s.sommet.x,
    y: s.sommet.y,
    color: showSommet ? SOMMET : COURBE,
  });

  const btn =
    'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 ' +
    'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  const signe = s.delta > 0 ? 'positif' : s.delta === 0 ? 'nul' : 'négatif';
  const tonNombre =
    s.delta > 0
      ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
      : s.delta === 0
      ? 'border-amber-300 bg-amber-50 text-amber-900'
      : 'border-rose-300 bg-rose-50 text-rose-900';

  return (
    <div className="space-y-3">
      <CoordPlane
        range={LAB.range}
        unit={LAB.unit}
        unitY={LAB.unitY}
        xStep={1}
        yStep={1}
        curves={[{ id: 'para', points: echantillonne(c), tone: COURBE, width: 2.5 }]}
        // LES POINTS D'INTERSECTION NE PORTENT PAS D'ÉTIQUETTE SVG. Tout
        // l'objet du laboratoire est de les faire CONVERGER : à un cran de la
        // fusion ils sont distants de 0,7, à la fusion de 0. Deux étiquettes
        // posées à côté d'eux se chevaucheraient nécessairement. Ils sont donc
        // identifiés par la LÉGENDE en DOM ci-dessous, qui reste lisible quel
        // que soit l'écart — règle §6bis.4 : un état atteignable ne doit jamais
        // produire un affichage illisible.
        points={points}
        caption={false}
        // LE SOMMET EST LA POIGNÉE DE LA COURBE. Il ne se déplace que
        // VERTICALEMENT : son abscisse est fixée par a et b (elle vaut
        // −b/2a = 2), seule sa hauteur dépend de c. Tirer le sommet, c'est
        // donc bien faire monter ou descendre la PARABOLE ENTIÈRE.
        //
        // Le pas vertical de 0,5 donne une préhension de 15 px à 375 px de
        // large — au-dessus du plancher de 14 px (mesuré par un test).
        step={{ x: 1, y: LAB.cStep }}
        // `draggableId` n'est annulé QUE par le verrou d'ANTÉRIORITÉ, jamais
        // par la réussite de l'étape.
        draggableId={disabled ? null : 'S'}
        onPointChange={(p) => onChangeC?.(cAimante(p.y))}
        ariaLabel={
          `Parabole d'équation y = x² − 4x + ${fr(c)}. ` +
          `Elle coupe l'axe des abscisses en ${s.nombre} point${s.nombre > 1 ? 's' : ''}` +
          (s.racines.length ? ` : ${s.racines.map((r) => fr(arrondi(r))).join(' et ')}.` : '.') +
          ` Le nombre ${nomDuNombre} vaut ${fr(s.delta)}, il est ${signe}.` +
          ' Fais glisser la parabole par son sommet, vers le haut ou vers le bas, ou utilise les flèches.'
        }
      />

      {/* Les deux afficheurs, côte à côte : c'est leur SIMULTANÉITÉ qui fait
          l'aha. Le compteur de points et le nombre basculent au même cran. */}
      <div className={`grid ${showNombre ? 'grid-cols-2' : 'grid-cols-1'} gap-2 text-center`}>
        <div className="rounded-lg border-2 border-indigo-300 bg-indigo-50 px-2 py-2">
          <div className="text-[13px] text-indigo-700">points d’intersection avec l’axe</div>
          <div className="font-mono font-black tabular-nums text-lg text-indigo-900">
            {s.nombre} {s.nombre === 1 ? 'point' : 'points'}
          </div>
        </div>
        {showNombre && (
          <div className={`rounded-lg border-2 px-2 py-2 ${tonNombre}`}>
            <div className="text-[13px]">{nomDuNombre}</div>
            <div className="font-mono font-black tabular-nums text-lg">{fr(s.delta)}</div>
          </div>
        )}
      </div>

      {/* La légende des points : elle remplace les étiquettes SVG, qui se
          chevaucheraient au moment de la fusion. */}
      <div className="flex flex-wrap items-center gap-3 text-[13px]" data-testid="lab-legende">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: RACINE }} aria-hidden="true" />
          {s.racines.length === 0
            ? 'aucun point sur l’axe'
            : s.racines.map((r) => `x = ${fr(arrondi(r))}`).join('  et  ')}
        </span>
        {showSommet && (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: SOMMET }} aria-hidden="true" />
            sommet ({fr(s.sommet.x)} ; {fr(arrondi(s.sommet.y))})
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Régler la hauteur de la courbe">
        <button type="button" className={btn} onClick={() => onChangeC?.(C_STEPS[idx - 1])} disabled={!peutDescendre} aria-label="Faire descendre la courbe">
          ↓ descendre
        </button>
        <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-mono font-bold tabular-nums text-sm">
          c = {fr(c)}
        </span>
        <button type="button" className={btn} onClick={() => onChangeC?.(C_STEPS[idx + 1])} disabled={!peutMonter} aria-label="Faire monter la courbe">
          ↑ monter
        </button>
      </div>

      {/* L'historique : la SUITE des états est ce qui fait la découverte, pas
          le dernier. Il est en DOM et se lit au lecteur d'écran. */}
      {visites.length > 1 && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
          <div className="text-[13px] font-semibold text-indigo-900 mb-2">Les hauteurs déjà visitées</div>
          <ul className="flex flex-wrap gap-2">
            {[...visites].sort((x, y) => x - y).map((cv) => {
              const e = labState(cv);
              return (
                <li key={cv} className="rounded-lg bg-white border border-indigo-200 px-2.5 py-1 font-mono text-[13px] tabular-nums">
                  c = {fr(cv)} → {e.nombre} pt{e.nombre > 1 ? 's' : ''}
                  {showNombre ? <> · {fr(e.delta)}</> : null}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Arrondi d'affichage : trois décimales suffisent et évitent 0,1290994449. */
const arrondi = (n) => Math.round(n * 1000) / 1000;

/** La parabole échantillonnée, COUPÉE au cadre — jamais tracée puis rognée. */
function echantillonne(c) {
  const pts = [];
  const n = 200;
  const { xMin, xMax, yMin, yMax } = LAB.range;
  for (let i = 0; i <= n; i += 1) {
    const x = xMin + ((xMax - xMin) * i) / n;
    const y = evalTrinome(LAB.a, LAB.b, c, x);
    if (y >= yMin && y <= yMax) pts.push({ x, y });
  }
  return pts;
}
