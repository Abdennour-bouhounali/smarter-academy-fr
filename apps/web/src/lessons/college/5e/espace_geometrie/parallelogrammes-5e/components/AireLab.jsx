import React, { useCallback, useState } from 'react';
import GeoScene, { Dot, Handle, Poly, Seg, dotObstacles, polyObstacles } from '../../../../../common/geo5e/GeoScene';
import { Feedback } from '../../../../../common/components/LessonUI';
import { cm, cm2, etatAire } from './paral';

const W = 760;
const H = 460;

/* La base est FIXE : c'est elle qui doit rester immobile pour que le
   cisaillement se voie. Le sommet D glisse sur une parallèle à (AB), à
   hauteur constante — et C suit, puisque ABCD reste un parallélogramme. */
const A = { x: 170, y: 380 };
const B = { x: 490, y: 380 };
const Y_HAUT = 180;
const DX_MIN = -110;
const DX_MAX = 250;

/**
 * AireLab — le cisaillement : l'aire ne dépend pas du côté oblique.
 *
 * ACTION → CHANGE → OBSERVATION → SENS
 *   action      : l'élève fait glisser le sommet D le long de la droite
 *                 parallèle à (AB) — le seul mouvement autorisé
 *   change      : le côté [AD] s'allonge à vue d'œil ; la base et la hauteur,
 *                 elles, ne bougent pas d'un pixel
 *   observation : « le côté grandit, l'aire ne bouge pas »
 *   sens        : dans base × hauteur, la hauteur n'est PAS un côté. C'est la
 *                 distance entre les deux droites parallèles.
 *
 * Misconception targeted : « aire = base × côté », l'erreur la plus tenace de
 * la 5e. Elle n'est pas combattue par une phrase : elle est détruite par un
 * geste qui fait grandir le côté sans que l'aire suive.
 *
 * Les deux nombres affichés — l'aire du polygone et le produit base × hauteur
 * — sont calculés SÉPARÉMENT dans paral.js, et affichés côte à côte. Ils ne
 * peuvent pas se contredire, et le test le prouve sur tout le glissement.
 */
export default function AireLab({ dx, onDx, montrerHauteur = true, montrerCote = true }) {
  const [drag, setDrag] = useState(false);

  const D = { x: A.x + dx, y: Y_HAUT };
  const C = { x: B.x + dx, y: Y_HAUT };
  const pts = [A, B, C, D];
  const e = etatAire(pts);

  const move = useCallback((p) => {
    if (!p || !drag || !onDx) return;
    // Le déplacement est CONTRAINT à la parallèle : seul x compte. C'est le
    // « freeze what the rung is not about » du §6quater.2 — on ne peut pas
    // changer la hauteur ici, donc on ne peut pas brouiller l'observation.
    onDx(Math.min(DX_MAX, Math.max(DX_MIN, p.x - A.x)));
  }, [drag, onDx]);

  const touche = (ev) => {
    const d = { ArrowLeft: -12, ArrowRight: 12 }[ev.key];
    if (!d || !onDx) return;
    ev.preventDefault();
    onDx(Math.min(DX_MAX, Math.max(DX_MIN, dx + d)));
  };

  return (
    <div className="space-y-2">
      <div className="rounded-2xl border-2 border-rose-200 bg-white overflow-hidden">
        <GeoScene
          width={W} height={H}
          labels={[
            { id: 'A', text: 'A', anchor: A, color: '#334155', priority: true },
            { id: 'B', text: 'B', anchor: B, color: '#334155', priority: true },
            { id: 'C', text: 'C', anchor: C, color: '#334155', priority: true },
            { id: 'D', text: 'D', anchor: D, color: '#7c3aed', priority: true },
          ]}
          obstacles={[...dotObstacles(pts, 18), ...polyObstacles(pts), ...dotObstacles([e.pied], 14)]}
          ariaLabel="Un parallélogramme dont le sommet D glisse sur une parallèle à la base"
          onPointerMove={move}
          onPointerUp={() => setDrag(false)}
        >
          <rect x={0} y={0} width={W} height={H} fill="#fffefe" data-visual-role="decor" />

          {/* Le rail : la droite sur laquelle D est contraint de glisser.
              Elle rend le mouvement lisible AVANT qu'il ait lieu. */}
          <line x1={20} y1={Y_HAUT} x2={W - 20} y2={Y_HAUT} stroke="#fecdd3" strokeWidth={2.5} strokeDasharray="10 8" />
          <line x1={20} y1={A.y} x2={W - 20} y2={A.y} stroke="#fecdd3" strokeWidth={2.5} strokeDasharray="10 8" />

          <Poly pts={pts} fill="#f43f5e" stroke="#be123c" fillOpacity={0.14} w={3.5} />

          {/* La hauteur : du sommet D au PIED sur la droite (AB), avec le
              carré d'angle droit. Le pied peut sortir de [AB] — c'est
              exactement ce qu'il faut voir, et la figure le montre. */}
          {montrerHauteur && (
            <>
              <Seg a={D} b={e.pied} color="#0284c7" w={3} dash="6 5" />
              <path
                d={`M ${e.pied.x} ${e.pied.y - 16} L ${e.pied.x + (D.x >= e.pied.x ? 16 : -16)} ${e.pied.y - 16} L ${e.pied.x + (D.x >= e.pied.x ? 16 : -16)} ${e.pied.y}`}
                fill="none" stroke="#0284c7" strokeWidth={2.5}
              />
              <Dot p={e.pied} color="#0284c7" r={5} />
            </>
          )}

          {/* La base, épaissie : c'est elle qui ne bouge pas. */}
          <Seg a={A} b={B} color="#be123c" w={6} />

          {montrerCote && <Seg a={A} b={D} color="#a16207" w={5} />}

          {[A, B, C].map((p, i) => <Dot key={i} p={p} color="#334155" />)}
          <Handle
            p={D}
            color="#7c3aed"
            /* Même dimensionnement que QuadLab : ~47 px de diamètre à 375 px,
               échelle mesurée et non devinée. */
            hitR={68}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setDrag(true); }}
            onKeyDown={touche}
            dragging={drag}
            label="Sommet D — flèches gauche et droite pour le faire glisser"
          />
        </GeoScene>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 border-t-2 border-rose-100">
          <Case label="La base AB" value={`${cm(e.base)} cm`} tone="rose" fixe />
          {montrerHauteur && <Case label="La hauteur" value={`${cm(e.hauteur)} cm`} tone="sky" fixe />}
          {montrerCote && <Case label="Le côté AD" value={`${cm(e.cote)} cm`} tone="amber" />}
          <Case label="L’aire" value={`${cm2(e.aire)} cm²`} tone="emerald" fixe />
        </div>
      </div>

      {/* La vérification, faite à voix haute : les deux nombres viennent de
          deux calculs différents et tombent l'un sur l'autre. */}
      {montrerHauteur && (
        <Feedback tone="info">
          <span className="font-mono">{cm(e.base)} × {cm(e.hauteur)} = {cm2(e.produit)}</span> cm², et
          l’aire mesurée sur la figure vaut <span className="font-mono">{cm2(e.aire)}</span> cm².
          Les deux se suivent, quoi que tu fasses glisser.
        </Feedback>
      )}
    </div>
  );
}

function Case({ label, value, tone, fixe = false }) {
  const theme = {
    rose: 'border-rose-300 bg-rose-50 text-rose-800',
    sky: 'border-sky-300 bg-sky-50 text-sky-800',
    amber: 'border-amber-300 bg-amber-50 text-amber-800',
    emerald: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  }[tone];
  return (
    <div className={`rounded-xl border-2 p-2.5 text-center ${theme}`}>
      <div className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</div>
      <div className="font-mono text-lg font-black tabular-nums">{value}</div>
      <div className="text-[11px] font-bold opacity-70">{fixe ? 'ne bouge pas' : 'change'}</div>
    </div>
  );
}

export { A as AIRE_A, B as AIRE_B, DX_MIN, DX_MAX };
