import React, { useState } from 'react';
import GeoScene, { Handle, Dot, Poly, Seg, dotObstacles } from '../../../../../common/geo5e/GeoScene';
import { droiteDesMilieux, reciproqueMilieux, dist, fr, arrondi } from './triangles4e';

/**
 * MilieuxLab — la droite des milieux, dans ses DEUX SENS.
 *
 * Un seul composant, deux modes, parce que la leçon veut que l'élève voie que
 * c'est LA MÊME FIGURE lue à l'envers. Les séparer en deux composants aurait
 * caché ce qui est justement l'objet du module 4.
 *
 * ── Mode `direct` (module 3) ──────────────────────────────────────────
 * Activity              faire glisser le sommet A ; I et J le suivent.
 * Mathematical objective (IJ) est parallèle à (BC), et IJ vaut la moitié de BC.
 * Student action        déformer le triangle et relever les deux nombres.
 * Controlled variable   la position de A.
 * Mathematical state    les trois sommets. I et J sont DÉRIVÉS (des milieux
 *                       calculés), jamais des poignées indépendantes — une
 *                       poignée qu'on peut décoller de son milieu enseignerait
 *                       que « milieu » est une décoration.
 * Visual consequence    le segment [IJ] se redessine ; deux nombres bougent.
 * Expected observation  « l'angle avec (BC) reste 0°, le rapport reste 0,5 ».
 *
 * ── Mode `reciproque` (module 4) ──────────────────────────────────────
 * Activity              I est fixé au milieu de [AB] ; K GLISSE le long de [AC].
 * Mathematical objective la réciproque : (IK) parallèle à (BC) ⇒ K est le milieu.
 * Student action        chercher la position où le parallélisme apparaît.
 * Controlled variable   le paramètre t de K sur [AC], et lui seul.
 * Visual consequence    l'angle affiché tombe à 0° en un seul endroit.
 * Misconception targeted croire qu'un segment partant d'un milieu est parallèle
 *                       au troisième côté quel que soit son autre extrémité.
 *
 * SÉCURITÉ VISUELLE : le triangle est le seul contenu de la figure, et il est
 * borné au cadre de référence — le viewBox est donc fixe et suffit, sans
 * qu'aucune construction ne puisse en sortir. Les mesures sont dans le DOM.
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement.
 */

const HIT_R = 64;
const CADRE = { largeur: 620, hauteur: 440 };

export default function MilieuxLab({
  mode = 'direct',
  A,
  B,
  C,
  onA,
  t = 0.28,
  onT,
}) {
  const [drag, setDrag] = useState(false);

  const direct = mode === 'direct';
  const m = direct ? droiteDesMilieux(A, B, C) : reciproqueMilieux(A, B, C, t);
  const P = direct ? m.J : m.K; // le second point du segment tracé
  const I = m.I;

  const onDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(true);
  };

  /** Mode direct : on déplace A, en le gardant au-dessus de (BC) et au cadre. */
  const placerA = (p) => {
    if (!p || !onA) return;
    const yMax = Math.min(B.y, C.y) - 30;
    onA({
      x: Math.max(24, Math.min(CADRE.largeur - 24, p.x)),
      y: Math.max(24, Math.min(yMax, p.y)),
    });
  };

  /**
   * Mode réciproque : on projette le pointeur sur [AC] et on en tire t.
   * La contrainte est GÉOMÉTRIQUE — K est un point du côté, il ne peut pas en
   * sortir — et non un aimant qui corrigerait après coup : le geste reste
   * libre le long du segment.
   */
  const placerK = (p) => {
    if (!p || !onT) return;
    const ux = C.x - A.x;
    const uy = C.y - A.y;
    const n2 = ux * ux + uy * uy;
    if (n2 === 0) return;
    const brut = ((p.x - A.x) * ux + (p.y - A.y) * uy) / n2;
    onT(Math.max(0.08, Math.min(0.95, brut)));
  };

  const poignee = direct ? A : P;
  const placer = direct ? placerA : placerK;
  const parallele = m.parallele;

  return (
    <div className="space-y-3" role="group" aria-label={
      direct ? 'Triangle et sa droite des milieux' : 'Triangle, le milieu I et le point K qui glisse'
    }>
      <GeoScene
        width={CADRE.largeur}
        height={CADRE.hauteur}
        ariaLabel={direct
          ? 'Triangle ABC avec les milieux I de [AB] et J de [AC], et le segment qui les joint'
          : 'Triangle ABC avec I milieu de [AB] et un point K mobile sur [AC]'}
        onPointerMove={(p) => { if (drag) placer(p); }}
        onPointerUp={() => setDrag(false)}
        labels={[
          { id: 'A', text: 'A', anchor: A, color: '#0f172a', size: 17, priority: true },
          { id: 'B', text: 'B', anchor: B, color: '#0f172a', size: 17, priority: true },
          { id: 'C', text: 'C', anchor: C, color: '#0f172a', size: 17, priority: true },
          { id: 'I', text: 'I', anchor: I, color: '#0891b2', size: 16, priority: true },
          { id: 'P', text: direct ? 'J' : 'K', anchor: P, color: direct ? '#0891b2' : '#b45309', size: 16, priority: true },
        ]}
        obstacles={dotObstacles([A, B, C, I, P], 15)}
      >
        {/* Le troisième côté, mis en avant : c'est la référence. */}
        <Seg a={B} b={C} color="#7c3aed" w={4} />

        <Poly pts={[A, B, C]} fill="#f8fafc" fillOpacity={0.9} stroke="#0f172a" w={2.5} />

        {/* Le segment de la propriété, vert quand il est parallèle à (BC). */}
        <Seg a={I} b={P} color={parallele ? '#059669' : '#94a3b8'} w={4} />

        {/* Les marques de milieu sur [AB] : deux petits traits, la notation du
            collège. Elles ne sont dessinées que là où le milieu est ÉTABLI. */}
        {[[A, I], [I, B]].map(([p, q], i) => {
          const mx = (p.x + q.x) / 2;
          const my = (p.y + q.y) / 2;
          const ux = (q.x - p.x) / dist(p, q);
          const uy = (q.y - p.y) / dist(p, q);
          return (
            <line
              key={`mAB-${i}`}
              x1={mx - uy * 7} y1={my + ux * 7}
              x2={mx + uy * 7} y2={my - ux * 7}
              stroke="#0891b2" strokeWidth={2.5}
            />
          );
        })}

        {/* En mode direct, [AC] porte aussi ses marques : les deux milieux
            sont donnés. En mode réciproque, JAMAIS — c'est justement ce qu'on
            cherche à établir, et le marquer d'avance donnerait la réponse. */}
        {direct && [[A, P], [P, C]].map(([p, q], i) => {
          const mx = (p.x + q.x) / 2;
          const my = (p.y + q.y) / 2;
          const ux = (q.x - p.x) / dist(p, q);
          const uy = (q.y - p.y) / dist(p, q);
          return (
            <line
              key={`mAC-${i}`}
              x1={mx - uy * 7} y1={my + ux * 7}
              x2={mx + uy * 7} y2={my - ux * 7}
              stroke="#0891b2" strokeWidth={2.5}
            />
          );
        })}

        <Dot p={B} color="#0f172a" r={5} />
        <Dot p={C} color="#0f172a" r={5} />
        <Dot p={I} color="#0891b2" r={6} />
        {direct && <Dot p={P} color="#0891b2" r={6} />}
        {!direct && <Dot p={A} color="#0f172a" r={5} />}

        <Handle
          p={poignee}
          color="#b45309"
          r={11}
          hitR={HIT_R}
          dragging={drag}
          label={direct ? 'Sommet A — fais-le glisser' : 'Point K — fais-le glisser le long de [AC]'}
          onPointerDown={onDown}
          onKeyDown={(e) => {
            if (direct) {
              const pas = 12;
              const map = { ArrowLeft: [-pas, 0], ArrowRight: [pas, 0], ArrowUp: [0, -pas], ArrowDown: [0, pas] };
              const v = map[e.key];
              if (!v) return;
              e.preventDefault();
              placerA({ x: A.x + v[0], y: A.y + v[1] });
            } else {
              /* Pas de 0,01 : la zone où (IK) est déclarée parallèle mesure
                 environ 0,022 en paramètre (voir `TOL_PARALLELE`). Un pas de
                 0,02 la frôlerait ; 0,01 garantit qu'on ne peut pas
                 l'enjamber — même défaut, même remède qu'au labo signature. */
              const map = { ArrowLeft: -0.01, ArrowDown: -0.01, ArrowRight: 0.01, ArrowUp: 0.01 };
              const v = map[e.key];
              if (v === undefined) return;
              e.preventDefault();
              onT(Math.max(0.08, Math.min(0.95, t + v)));
            }
          }}
        />
      </GeoScene>

      {/* Les deux mesures, dans le DOM. */}
      <div className="grid grid-cols-2 gap-2">
        <div className={`rounded-2xl border-2 p-2.5 text-center ${
          parallele ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'
        }`}>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Angle entre ({direct ? 'IJ' : 'IK'}) et (BC)
          </div>
          <div className={`font-mono text-xl font-black tabular-nums ${
            parallele ? 'text-emerald-700' : 'text-slate-800'
          }`} data-lab="angle-milieux">
            {fr(arrondi(m.angleAvecBC, 1), 1)}°
          </div>
          <div className={`text-xs font-semibold ${parallele ? 'text-emerald-700' : 'text-slate-500'}`}>
            {parallele ? 'parallèles' : 'pas parallèles'}
          </div>
        </div>
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-2.5 text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {direct ? 'IJ ÷ BC' : 'IK ÷ BC'}
          </div>
          <div className="font-mono text-xl font-black tabular-nums text-slate-800" data-lab="rapport-milieux">
            {m.rapport === null ? '—' : fr(arrondi(m.rapport, 2), 2)}
          </div>
          <div className="text-xs font-semibold text-slate-500">
            {direct
              ? `${fr(arrondi(m.longIJ / 10, 1), 1)} pour ${fr(arrondi(m.longBC / 10, 1), 1)}`
              : `${fr(arrondi(m.longIK / 10, 1), 1)} pour ${fr(arrondi(m.longBC / 10, 1), 1)}`}
          </div>
        </div>
      </div>

      {/* En mode réciproque, la position de K le long de [AC], en clair. */}
      {!direct && (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-2.5 text-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            AK ÷ AC{' '}
          </span>
          <span className="font-mono text-lg font-black tabular-nums text-slate-800" data-lab="t-de-k">
            {fr(arrondi(m.t, 2), 2)}
          </span>
          <span className={`ml-2 text-sm font-semibold ${m.tEstMilieu ? 'text-emerald-700' : 'text-slate-500'}`}>
            {m.tEstMilieu ? 'K est le milieu de [AC]' : 'K n’est pas le milieu'}
          </span>
        </div>
      )}
    </div>
  );
}

export { HIT_R };
