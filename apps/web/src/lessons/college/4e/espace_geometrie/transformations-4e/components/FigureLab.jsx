import React, { useCallback, useState } from 'react';
import GeoScene, { Dot, Handle, Poly, dotObstacles, polyObstacles } from '../../../../../common/geo5e/GeoScene';
import { dist } from '../../../../../common/utils/geometry2d';
import { Grille, Fleche, Mesure, W, H } from './scene4e';
import { PAS, translater, auNoeud } from './translation4e';

/** Le rayon de saisie des poignées, en unités de viewBox — la même valeur
 *  mesurée que dans GlissementLab : à 375 px, 68 unités valent ~47 px CSS. */
const HIT_R = 68;

/**
 * FigureLab — construire l'image d'une FIGURE, sommet par sommet.
 *
 * C'est le passage du module 2 au module 3, et il n'y a rien de neuf à
 * apprendre : l'élève refait N fois le geste qu'il a fait une fois. Le
 * composant est bâti pour que ce constat soit inévitable — les sommets se
 * posent un par un, et le polygone image n'apparaît QUE lorsque le dernier
 * est en place. Tant qu'il manque un sommet, il n'y a pas de figure : on ne
 * peut donc pas croire qu'on a « à peu près » construit l'image.
 *
 * CE QUI EST MESURÉ : le nombre de sommets justes, et l'écart du sommet
 * courant. Rien n'est affirmé — un sommet posé au mauvais endroit reste
 * affiché là où l'élève l'a mis, avec son verdict.
 *
 * Rien ne se fige : après la figure complète, chaque sommet reste
 * saisissable.
 */
export default function FigureLab({
  figure,
  g,
  sommets,          // les positions posées par l'élève, une par sommet
  onSommet,         // (index, point) => void
  nomsSommets = ['A', 'B', 'C', 'D', 'E'],
  tol = 8,
  montrerSolution = false,
  ariaLabel = 'Construire l’image de la figure',
}) {
  const [drag, setDrag] = useState(null);

  const attendus = translater(figure, g);
  const justes = sommets.map((p, i) => dist(p, attendus[i]) <= tol);
  const nbJustes = justes.filter(Boolean).length;
  const complete = nbJustes === figure.length;

  /* Borné au rayon de SAISIE (68 unités) : le cercle transparent de la
     poignée ne doit jamais sortir du viewBox. */
  const borner = (p) => ({
    x: Math.max(HIT_R, Math.min(W - HIT_R, p.x)),
    y: Math.max(HIT_R, Math.min(H - HIT_R, p.y)),
  });

  const deplacer = useCallback((p) => {
    if (!p || drag === null) return;
    onSommet?.(drag, borner(auNoeud(p)));
  }, [drag, onSommet]);

  const prendre = (i) => (e) => {
    // Sans capture, le glisser se fige au premier pixel.
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(i);
  };

  const auClavier = (i) => (e) => {
    const d = {
      ArrowRight: { x: PAS, y: 0 }, ArrowLeft: { x: -PAS, y: 0 },
      ArrowUp: { x: 0, y: -PAS }, ArrowDown: { x: 0, y: PAS },
    }[e.key];
    if (!d) return;
    e.preventDefault();
    onSommet?.(i, borner({ x: sommets[i].x + d.x, y: sommets[i].y + d.y }));
  };

  const modeleDe = { x: 100, y: 110 };
  const modeleVers = { x: modeleDe.x + g.dx, y: modeleDe.y + g.dy };

  return (
    <div
      className="rounded-2xl border-2 border-sky-200 bg-white overflow-hidden"
      role="group"
      aria-label={ariaLabel}
    >
      <GeoScene
        width={W} height={H}
        labels={[
          ...figure.map((p, i) => ({ id: `s${i}`, text: nomsSommets[i], anchor: p, color: '#334155', size: 19 })),
          ...sommets.map((p, i) => ({ id: `i${i}`, text: `${nomsSommets[i]}’`, anchor: p, color: '#0369a1', size: 19 })),
        ]}
        obstacles={[
          ...polyObstacles(figure),
          ...dotObstacles([...figure, ...sommets], 18),
          ...dotObstacles([modeleDe, modeleVers], 20),
        ]}
        ariaLabel={`${ariaLabel} — la figure de départ, la flèche modèle et les sommets à poser`}
        onPointerMove={deplacer}
        onPointerUp={() => setDrag(null)}
      >
        <rect x={0} y={0} width={W} height={H} fill="#ffffff" data-visual-role="decor" />
        <Grille />

        <Fleche de={modeleDe} vers={modeleVers} color="#94a3b8" w={4} dash="9 7" />

        {/* Les cibles, à la demande seulement. */}
        {montrerSolution && attendus.map((p, i) => (justes[i] ? null : (
          <circle key={`t${i}`} cx={p.x} cy={p.y} r={17} fill="none" stroke="#10b981" strokeWidth={3} strokeDasharray="7 6" />
        )))}

        {/* Les trajets déjà tracés, un par sommet posé juste. */}
        {figure.map((p, i) => (justes[i] ? (
          <Fleche key={`tr${i}`} de={p} vers={sommets[i]} color="#f59e0b" w={3} tete={12} opacity={0.8} />
        ) : null))}

        <Poly pts={figure} fill="#64748b" stroke="#475569" fillOpacity={0.1} w={3} />
        {figure.map((p, i) => <Dot key={`d${i}`} p={p} color="#334155" r={7} />)}

        {/* LA FIGURE IMAGE N'APPARAÎT QU'UNE FOIS TOUS LES SOMMETS JUSTES.
            Dessiner un polygone sur des sommets mal posés donnerait une
            « image » qui n'en est pas une — la figure mentirait. */}
        {complete && (
          <Poly pts={sommets} fill="#0284c7" stroke="#0369a1" fillOpacity={0.16} w={3} />
        )}

        {sommets.map((p, i) => (
          <Handle
            key={`h${i}`}
            p={p}
            color={justes[i] ? '#0284c7' : '#94a3b8'}
            r={13}
            hitR={HIT_R}
            dragging={drag === i}
            onPointerDown={prendre(i)}
            onKeyDown={auClavier(i)}
            label={`Placer l’image du sommet ${nomsSommets[i]}`}
          />
        ))}
      </GeoScene>

      <div className="border-t-2 border-sky-100 bg-sky-50/50 px-3 py-3">
        <div className="grid grid-cols-2 gap-2 text-center" data-lecture="figure">
          <Mesure
            label="Sommets bien placés"
            value={`${nbJustes} / ${figure.length}`}
            ok={complete}
          />
          <Mesure label="La figure image" value={complete ? 'tracée' : 'incomplète'} ok={complete} />
        </div>
        <div
          className="mt-2 rounded-xl px-3 py-2 text-center text-sm font-bold"
          data-verdict={complete ? 'complete' : 'en-cours'}
        >
          {complete ? (
            <span className="text-emerald-700">
              Chaque sommet a fait le même trajet : la figure entière a glissé.
            </span>
          ) : (
            <span className="text-slate-500">
              Pose chaque sommet en refaisant le trajet de la flèche grise.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
