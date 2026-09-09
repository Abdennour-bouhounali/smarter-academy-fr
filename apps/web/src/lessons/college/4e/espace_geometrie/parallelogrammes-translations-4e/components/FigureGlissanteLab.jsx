import React, { useState } from 'react';
import GeoScene, { Handle, Dot, Seg, Poly, dotObstacles } from '../../../../../common/geo5e/GeoScene';
import {
  DRAPEAU, glissementEntre, glisserFigure, unSeulGlissement, invariants,
  etatQuad, surLaGrille, arrondi, fr,
} from './paral4e';

/**
 * FigureGlissanteLab — une figure entière qu'on emmène, et les trajets qui
 * restent parallèles.
 *
 * Activity              tirer la poignée d'arrivée : toute la figure suit.
 * Mathematical objective dans un glissement, TOUS les points font le même
 *                       trajet — et chaque paire de points en fabrique donc
 *                       un parallélogramme.
 * Student action        déplacer le point d'arrivée du premier sommet ;
 *                       le reste de la figure suit forcément.
 * Controlled variable   le glissement, et lui seul.
 * Mathematical state    la figure de départ (fixe) et le glissement. Les
 *                       images, les trajets et les longueurs conservées sont
 *                       CALCULÉS par `invariants`.
 * Visual consequence    les cinq trajets restent parallèles, de même
 *                       longueur ; la figure ne tourne pas et ne change pas
 *                       de taille.
 * Expected observation  « ce ne sont pas cinq déplacements, c'est un seul ».
 * Misconception targeted croire qu'un glissement peut tourner la figure.
 *                       Le drapeau est DISSYMÉTRIQUE exprès : une rotation
 *                       s'y verrait immédiatement.
 *
 * LE MODE « UN POINT DÉRÉGLÉ » est une manipulation de contre-exemple : on
 * décale l'image d'un seul sommet, et le test « est-ce un glissement ? »
 * bascule. C'est ce qui rend le critère opératoire plutôt que décoratif.
 *
 * SÉCURITÉ VISUELLE : viewBox DÉRIVÉ du contenu (figure, image et poignée),
 * mesures hors du SVG. Aucun `disabled` lié à l'avancement.
 */

/** Le rayon de la cible tactile, en unités de viewBox — même calcul que
 *  `ConstructeurLab` : ~68 unités pour un cadre de ~620 valent > 44 px. */
const HIT_R = 68;

export default function FigureGlissanteLab({
  arrivee, onArrivee, derange = false, onDerange, montrerParallelogramme = true,
}) {
  const [drag, setDrag] = useState(false);

  const depart = DRAPEAU[0];
  const g = glissementEntre(depart, arrivee);
  const imagesJustes = glisserFigure(DRAPEAU, g);
  // Le mode « déréglé » décale l'image d'UN seul sommet : le critère doit
  // basculer pour un seul point, sinon il n'apprend rien.
  const images = derange
    ? imagesJustes.map((p, i) => (i === 2 ? { x: p.x + 55, y: p.y - 35 } : p))
    : imagesJustes;

  const cEstUnGlissement = unSeulGlissement(DRAPEAU, images);
  const inv = invariants(g, DRAPEAU);

  // Le parallélogramme que deux points et leurs deux images fabriquent :
  // les sommets 0 et 1, dans l'ordre du CONTOUR M M' N' N.
  const quad = [DRAPEAU[0], images[0], images[1], DRAPEAU[1]];
  const etatPara = etatQuad(quad);

  /* Même règle que `ConstructeurLab` : la marge doit couvrir le disque
     TACTILE de la poignée (HIT_R), pas seulement ce qui est dessiné. */
  const MARGE = HIT_R + 6;
  const tous = [...DRAPEAU, ...images, arrivee];
  const minX = Math.min(...tous.map((p) => p.x)) - MARGE;
  const maxX = Math.max(...tous.map((p) => p.x)) + MARGE;
  const minY = Math.min(...tous.map((p) => p.y)) - MARGE;
  const maxY = Math.max(...tous.map((p) => p.y)) + MARGE;
  const MIN = 380;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const w = Math.max(MIN, maxX - minX);
  const h = Math.max(MIN, maxY - minY);
  const vue = { x: cx - w / 2, y: cy - h / 2, w, h };
  const d = (p) => ({ x: p.x - vue.x, y: p.y - vue.y });

  const placer = (p) => {
    if (!p || !drag) return;
    onArrivee?.(surLaGrille({ x: p.x + vue.x, y: p.y + vue.y }));
  };

  return (
    <div className="space-y-3" role="group" aria-label="Figure qui glisse et les trajets de ses sommets">
      <GeoScene
        width={vue.w}
        height={vue.h}
        ariaLabel="Un drapeau, son image par un glissement, et les traits qui relient chaque sommet à son image"
        onPointerMove={(p) => placer(p)}
        onPointerUp={() => setDrag(false)}
        labels={[
          { id: 'M', text: 'M', anchor: d(DRAPEAU[0]), color: '#0f172a', size: 17, priority: true },
          { id: 'Mp', text: 'M’', anchor: d(images[0]), color: '#059669', size: 17, priority: true },
          { id: 'N', text: 'N', anchor: d(DRAPEAU[1]), color: '#0f172a', size: 17, priority: true },
          { id: 'Np', text: 'N’', anchor: d(images[1]), color: '#059669', size: 17, priority: true },
        ]}
        obstacles={dotObstacles([d(DRAPEAU[0]), d(DRAPEAU[1]), d(images[0]), d(images[1])], 16)}
      >
        {/* Le parallélogramme que M, M', N' et N fabriquent. */}
        {montrerParallelogramme && (
          <Poly
            pts={quad.map(d)}
            fill={etatPara.parallelogramme ? '#7c3aed' : '#f59e0b'}
            fillOpacity={0.14}
            stroke={etatPara.parallelogramme ? '#7c3aed' : '#b45309'}
            w={2.5}
          />
        )}

        {/* Les cinq trajets. */}
        {DRAPEAU.map((p, i) => (
          <Seg key={`t${i}`} a={d(p)} b={d(images[i])} color="#0891b2" w={3} dash="7 5" />
        ))}

        <Poly pts={DRAPEAU.map(d)} fill="#64748b" fillOpacity={0.2} stroke="#334155" w={3} />
        <Poly pts={images.map(d)} fill="#059669" fillOpacity={0.2} stroke="#059669" w={3} />

        {DRAPEAU.map((p, i) => <Dot key={`p${i}`} p={d(p)} color="#0f172a" r={5} />)}
        {images.map((p, i) => (i === 0 ? null : <Dot key={`i${i}`} p={d(p)} color="#059669" r={5} />))}

        <Handle
          p={d(images[0])}
          color="#b45309" r={11} hitR={HIT_R} dragging={drag}
          label="Point d’arrivée — fais glisser toute la figure"
          onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setDrag(true); }}
          onKeyDown={(e) => {
            const map = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] };
            const v = map[e.key];
            if (!v) return;
            e.preventDefault();
            onArrivee?.(surLaGrille({ x: arrivee.x + v[0], y: arrivee.y + v[1] }));
          }}
        />
      </GeoScene>

      {/* Le bouton du contre-exemple. */}
      {onDerange && (
        <button
          type="button"
          onClick={() => onDerange(!derange)}
          aria-pressed={derange}
          className={`min-h-[44px] w-full rounded-xl border-2 px-3 py-2 text-sm font-bold transition-colors ${
            derange
              ? 'border-rose-400 bg-rose-50 text-rose-800'
              : 'border-slate-300 bg-white text-slate-700 hover:border-rose-400'
          }`}
        >
          {derange ? '↺ Remettre le sommet à sa place' : 'Dérégler un seul sommet'}
        </button>
      )}

      {/* Le VERDICT du critère, dans le DOM. */}
      <div
        data-critere={cEstUnGlissement ? 'glissement' : 'pas-glissement'}
        className={`rounded-2xl border-2 p-3 text-center ${
          cEstUnGlissement ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'
        }`}
      >
        <p className={`text-sm font-bold ${cEstUnGlissement ? 'text-emerald-900' : 'text-rose-900'}`}>
          {cEstUnGlissement
            ? 'Les cinq trajets sont identiques : c’est un glissement.'
            : 'Un des trajets diffère des autres : ce n’est plus un glissement.'}
        </p>
      </div>

      {/* Les mesures : le trajet, et ce qui ne change pas. */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border-2 border-cyan-200 bg-cyan-50 p-2">
          <div className="text-xs font-semibold text-cyan-700">le trajet</div>
          <div className="font-mono text-base font-black text-cyan-900">
            {fr(arrondi(g.longueur, 0), 0)}
          </div>
          <div className="text-xs text-cyan-600">direction {fr(arrondi(g.directionDeg, 0), 0)}°</div>
        </div>
        <div className="rounded-xl border-2 border-slate-200 bg-white p-2">
          <div className="text-xs font-semibold text-slate-500">l’aire</div>
          <div className="font-mono text-base font-black text-slate-900">
            {fr(arrondi(inv.aire.avant / 100, 1), 1)}
          </div>
          <div className="text-xs text-slate-400">
            après : {fr(arrondi(inv.aire.apres / 100, 1), 1)}
          </div>
        </div>
        <div className={`rounded-xl border-2 p-2 ${
          etatPara.parallelogramme ? 'border-violet-200 bg-violet-50' : 'border-amber-200 bg-amber-50'
        }`}>
          <div className="text-xs font-semibold text-slate-500">M M’ N’ N</div>
          <div className={`text-sm font-black ${
            etatPara.parallelogramme ? 'text-violet-800' : 'text-amber-800'
          }`}>
            {etatPara.parallelogramme ? 'parallélogramme' : 'non'}
          </div>
        </div>
      </div>
    </div>
  );
}

export { HIT_R };
