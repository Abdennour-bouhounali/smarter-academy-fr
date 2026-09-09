import React from 'react';
import GeoScene, { Dot, Poly, dotObstacles, polyObstacles } from '../../../../../common/geo5e/GeoScene';
import { Grille, Trajets, Mesure, carreaux, W, H } from './scene4e';
import { fr, quelGeste, retrouverGlissement, retrouverCentre, trajetsConcordants } from './translation4e';

/**
 * GesteLab — une figure, sa copie, et la question : quel geste ?
 *
 * L'atelier du module 6 ne demande plus de CONSTRUIRE : il demande de LIRE.
 * L'élève voit une figure et son image, et doit reconnaître le geste — d'où
 * ce composant qui ne montre que les trajets et laisse le verdict à
 * l'exercice, jamais à l'écran.
 *
 * DEUX MODES, et la différence compte :
 *   · `reveler = false` (par défaut) : le composant montre la figure, la
 *     copie et les trajets, ET RIEN D'AUTRE. C'est à l'élève de conclure.
 *   · `reveler = true` : après la réponse, il affiche ce que la MESURE dit —
 *     le glissement retrouvé, ou le centre du demi-tour, ou « ni l'un ni
 *     l'autre ». La correction vient donc du calcul sur les points dessinés,
 *     pas d'une chaîne de caractères écrite à la main dans l'exercice.
 *
 * Le composant ne se manipule pas : c'est délibéré. Le module 6 est un
 * atelier de LECTURE, et une poignée y détournerait l'attention du seul geste
 * qui compte — regarder les trajets.
 */
export default function GesteLab({
  figure,
  image,
  reveler = false,
  ariaLabel = 'Quel geste mène de la figure à sa copie ?',
  nomsSommets = ['A', 'B', 'C', 'D', 'E'],
}) {
  const geste = quelGeste(figure, image);
  const g = retrouverGlissement(figure, image);
  const centre = retrouverCentre(figure, image);
  const concordants = trajetsConcordants(figure, image);

  return (
    <div
      className="rounded-2xl border-2 border-slate-200 bg-white overflow-hidden"
      role="group"
      aria-label={ariaLabel}
    >
      <GeoScene
        width={W} height={H}
        labels={[
          ...figure.map((p, i) => ({ id: `s${i}`, text: nomsSommets[i] ?? '', anchor: p, color: '#334155', size: 18 })),
          ...image.map((p, i) => ({ id: `i${i}`, text: `${nomsSommets[i] ?? ''}’`, anchor: p, color: '#7c3aed', size: 18 })),
        ].filter((l) => l.text)}
        obstacles={[
          ...polyObstacles(figure), ...polyObstacles(image),
          ...dotObstacles([...figure, ...image], 18),
        ]}
        ariaLabel={`${ariaLabel} — la figure de départ, sa copie, et le trajet de chaque sommet`}
      >
        <rect x={0} y={0} width={W} height={H} fill="#ffffff" data-visual-role="decor" />
        <Grille />
        <Trajets figure={figure} image={image} color={concordants ? '#f59e0b' : '#e11d48'} w={2.5} />

        <Poly pts={figure} fill="#64748b" stroke="#475569" fillOpacity={0.1} w={3} />
        {figure.map((p, i) => <Dot key={`d${i}`} p={p} color="#334155" r={6} />)}

        <Poly pts={image} fill="#7c3aed" stroke="#6d28d9" fillOpacity={0.15} w={3} />
        {image.map((p, i) => <Dot key={`c${i}`} p={p} color="#7c3aed" r={6} />)}

        {/* Le centre n'apparaît QU'APRÈS la réponse, et seulement s'il existe
            réellement : le dessiner avant serait donner la solution. */}
        {reveler && centre && (
          <circle cx={centre.x} cy={centre.y} r={9} fill="#dc2626" stroke="#ffffff" strokeWidth={3} />
        )}
      </GeoScene>

      <div className="border-t-2 border-slate-100 bg-slate-50/70 px-3 py-3">
        <div className="grid grid-cols-2 gap-2 text-center" data-lecture="geste">
          <Mesure
            label="Les trajets sont-ils tous pareils ?"
            value={concordants ? 'oui' : 'non'}
            ok={concordants}
          />
          <Mesure
            label="Longueur du 1er trajet"
            value={carreaux(Math.hypot(image[0].x - figure[0].x, image[0].y - figure[0].y))}
          />
        </div>
        {reveler && (
          <div
            className="mt-2 rounded-xl bg-white px-3 py-2 text-center text-sm font-bold"
            data-verdict={geste}
          >
            {geste === 'glissement' && (
              <span className="text-emerald-700">
                C’est un glissement : {g.sens}, sur {carreaux(g.longueur)}.
                Tous les points ont fait ce même trajet.
              </span>
            )}
            {geste === 'demi-tour' && (
              <span className="text-rose-700">
                C’est le demi-tour de 5e : les trajets se croisent tous au point rouge.
              </span>
            )}
            {geste === 'aucun' && (
              <span className="text-amber-700">
                Ni glissement ni demi-tour : la copie n’a pas la même taille que la figure.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
