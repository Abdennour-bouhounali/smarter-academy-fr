import React, { useCallback, useState } from 'react';
import GeoScene, { Dot, Handle, dotObstacles, segObstacles } from '../../../../../common/geo5e/GeoScene';
import { dist } from '../../../../../common/utils/geometry2d';
import { Grille, Fleche, Mesure, carreaux, W, H } from './scene4e';
import { PAS, fr, glissement, translaterPoint, auNoeud } from './translation4e';

/** Le rayon de saisie des poignées, en unités de viewBox — la même valeur
 *  mesurée que dans GlissementLab : à 375 px, 68 unités valent ~47 px CSS. */
const HIT_R = 68;

/**
 * PointImageLab — UN point, UN glissement donné, et l'image qu'on place.
 *
 * Le module 1 faisait glisser une figure entière : la règle de placement y
 * était visible mais jamais exécutée par l'élève. Ici la scène se réduit à un
 * seul point pour que ce soit LUI qui décide où l'image se pose — et la scène
 * MESURE trois choses sans jamais lui dire la réponse :
 *
 *   · la longueur du trajet qu'il vient de tracer ;
 *   · si ce trajet a la même direction que la flèche donnée ;
 *   · s'il a le même sens.
 *
 * LES DEUX PIÈGES SONT DANS LA MESURE, PAS DANS UN TEXTE. Un élève qui pose
 * l'image à la bonne distance mais dans l'autre sens voit « longueur : juste »
 * et « sens : non ». Un élève qui prend une autre direction voit la direction
 * refusée. La correction vient donc de la figure, pas d'un paragraphe — et
 * elle est vraie pour tous les placements, y compris ceux auxquels l'auteur
 * n'a pas pensé.
 *
 * Rien ne se fige : même une fois l'image juste, on peut la reprendre.
 */
export default function PointImageLab({
  M,
  g,
  image,
  onImage,
  montrerSolution = false,
  tol = 8,
  ariaLabel = 'Placer l’image du point M',
}) {
  const [drag, setDrag] = useState(false);

  const attendu = translaterPoint(M, g);
  const ecart = dist(image, attendu);
  const juste = ecart <= tol;

  // Le trajet que l'élève vient réellement de dessiner — mesuré sur ses deux
  // points, jamais recopié depuis `g`.
  const trace = glissement({ dx: image.x - M.x, dy: image.y - M.y });
  const memeLongueur = Math.abs(trace.longueur - g.longueur) <= tol;
  const memeDirection = !trace.estNul
    && Math.min(
      Math.abs(trace.direction - g.direction),
      180 - Math.abs(trace.direction - g.direction),
    ) <= 4;
  const memeSens = !trace.estNul && trace.sens === g.sens;

  /* Borné au rayon de SAISIE (68 unités) et non à une marge arbitraire :
     sinon le cercle transparent de la poignée déborde du viewBox. */
  const borner = (p) => ({
    x: Math.max(HIT_R, Math.min(W - HIT_R, p.x)),
    y: Math.max(HIT_R, Math.min(H - HIT_R, p.y)),
  });

  const deplacer = useCallback((p) => {
    if (!p || !drag) return;
    onImage?.(borner(auNoeud(p)));
  }, [drag, onImage]);

  const prendre = (e) => {
    // Sans capture du pointeur, le glisser s'arrête au premier pixel.
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(true);
  };

  const auClavier = (e) => {
    const d = {
      ArrowRight: { x: PAS, y: 0 }, ArrowLeft: { x: -PAS, y: 0 },
      ArrowUp: { x: 0, y: -PAS }, ArrowDown: { x: 0, y: PAS },
    }[e.key];
    if (!d) return;
    e.preventDefault();
    onImage?.(borner({ x: image.x + d.x, y: image.y + d.y }));
  };

  // La flèche MODÈLE est posée dans un coin libre : elle donne le glissement
  // à reproduire sans indiquer où l'image doit aller.
  const modeleDe = { x: 100, y: 400 };
  const modeleVers = { x: modeleDe.x + g.dx, y: modeleDe.y + g.dy };

  return (
    <div
      className="rounded-2xl border-2 border-violet-200 bg-white overflow-hidden"
      role="group"
      aria-label={ariaLabel}
    >
      <GeoScene
        width={W} height={H}
        labels={[
          { id: 'M', text: 'M', anchor: M, color: '#334155', size: 21, priority: true },
          { id: 'Mp', text: 'M’', anchor: image, color: '#7c3aed', size: 21, priority: true },
        ]}
        obstacles={[
          ...dotObstacles([M, image, modeleDe, modeleVers], 22),
          ...segObstacles(M, image),
          ...segObstacles(modeleDe, modeleVers),
        ]}
        ariaLabel={`${ariaLabel} — le point M, la flèche modèle et l’image à poser`}
        onPointerMove={deplacer}
        onPointerUp={() => setDrag(false)}
      >
        <rect x={0} y={0} width={W} height={H} fill="#ffffff" data-visual-role="decor" />
        <Grille />

        {/* La flèche MODÈLE, en pointillés : c'est une consigne, pas un objet
            de la figure. La distinguer visuellement évite qu'on la confonde
            avec le trajet à tracer. */}
        <Fleche de={modeleDe} vers={modeleVers} color="#94a3b8" w={4} dash="9 7" />

        {/* La cible ne s'affiche QUE si on la demande : sinon elle répondrait
            à la place de l'élève. */}
        {montrerSolution && !juste && (
          <circle
            cx={attendu.x} cy={attendu.y} r={18}
            fill="none" stroke="#10b981" strokeWidth={3.5} strokeDasharray="7 6"
          />
        )}

        {/* Le trajet que l'élève trace, en direct. */}
        {!trace.estNul && (
          <Fleche de={M} vers={image} color={juste ? '#f59e0b' : '#cbd5e1'} w={5} />
        )}

        <Dot p={M} color="#334155" r={9} />
        <Handle
          p={image}
          color="#7c3aed"
          r={14}
          hitR={HIT_R}
          dragging={drag}
          onPointerDown={prendre}
          onKeyDown={auClavier}
          label="Placer l’image du point M"
        />
      </GeoScene>

      <div className="border-t-2 border-violet-100 bg-violet-50/50 px-3 py-3">
        <div className="grid grid-cols-3 gap-2 text-center" data-lecture="trajet">
          <Mesure
            label="Même direction ?"
            value={memeDirection ? 'oui' : 'non'}
            ok={memeDirection}
          />
          <Mesure label="Même sens ?" value={memeSens ? 'oui' : 'non'} ok={memeSens} />
          <Mesure
            label="Même longueur ?"
            value={trace.estNul ? '—' : carreaux(trace.longueur)}
            ok={memeLongueur}
          />
        </div>
        <div
          className="mt-2 rounded-xl px-3 py-2 text-center text-sm font-bold"
          data-verdict={juste ? 'juste' : 'pas-encore'}
        >
          {juste ? (
            <span className="text-emerald-700">
              M’ est bien l’image de M : même direction, même sens, même longueur.
            </span>
          ) : (
            <span className="text-slate-500">
              Reproduis le trajet de la flèche grise, en partant de M.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
