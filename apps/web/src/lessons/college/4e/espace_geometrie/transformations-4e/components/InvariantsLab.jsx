import React, { useCallback, useState } from 'react';
import GeoScene, { Dot, Handle, Poly, dotObstacles, polyObstacles } from '../../../../../common/geo5e/GeoScene';
import { Grille, Fleche, Trajets, W, H } from './scene4e';
import {
  PAS, fr, enCarreaux, glissement, translater, invariants, auNoeud,
} from './translation4e';

/** Le rayon de saisie des poignées, en unités de viewBox — la même valeur
 *  mesurée que dans GlissementLab : à 375 px, 68 unités valent ~47 px CSS. */
const HIT_R = 68;

/**
 * InvariantsLab — ce que le glissement garde, MESURÉ des deux côtés.
 *
 * Le tableau n'affiche jamais « conservé » : il affiche DEUX nombres, celui
 * de la figure et celui de l'image, et une pastille qui n'est verte que
 * lorsqu'ils coïncident. Si un jour le code déformait la copie, l'écran le
 * dirait — la leçon ne peut donc pas affirmer une conservation que le dessin
 * contredirait (mémoire « invariant visuel »).
 *
 * L'élève garde la main sur le glissement pendant tout le module : il peut
 * envoyer la copie n'importe où et constater que les quatre lignes du tableau
 * ne bougent pas d'un dixième. C'est cette INSISTANCE qui fait l'invariant —
 * une seule position ne prouverait rien.
 *
 * Les nombres sont en CARREAUX : l'élève les compte sur le quadrillage, et il
 * peut donc vérifier le tableau à la main.
 */
export default function InvariantsLab({
  figure,
  pointe,
  onPointe,
  origine = { x: 100, y: 130 },
  nomsSommets = ['A', 'B', 'C', 'D'],
  ariaLabel = 'Mesurer ce que le glissement conserve',
}) {
  const [drag, setDrag] = useState(false);

  const g = glissement({ dx: pointe.x - origine.x, dy: pointe.y - origine.y });
  const image = translater(figure, g);
  const inv = invariants(figure, image);

  /* Borné au rayon de SAISIE (68 unités) : le cercle transparent de la
     poignée ne doit jamais sortir du viewBox. */
  const borner = (p) => ({
    x: Math.max(HIT_R, Math.min(W - HIT_R, p.x)),
    y: Math.max(HIT_R, Math.min(H - HIT_R, p.y)),
  });

  const deplacer = useCallback((p) => {
    if (!p || !drag) return;
    onPointe?.(borner(auNoeud(p)));
  }, [drag, onPointe]);

  const prendre = (e) => {
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
    onPointe?.(borner({ x: pointe.x + d.x, y: pointe.y + d.y }));
  };

  // Les quatre lignes du tableau. Chacune porte les DEUX valeurs mesurées.
  const car = (px) => fr(enCarreaux(px), 2);
  /* L'AIRE EST EN CARREAUX CARRÉS : elle se divise par PAS², pas par PAS.
     Diviser par PAS afficherait « 640 carreaux » pour une figure de 16, et
     l'élève qui compte les carreaux du quadrillage verrait l'écran le
     contredire. */
  const carAire = (px2) => fr(px2 / (PAS * PAS), 2);
  const lignes = [
    {
      id: 'longueurs',
      nom: 'Longueur du plus grand côté',
      gauche: `${car(Math.max(...inv.longueurs.figure))} car.`,
      droite: `${car(Math.max(...inv.longueurs.image))} car.`,
      ok: inv.longueurs.conserve,
    },
    {
      id: 'angles',
      nom: 'Plus grand angle',
      gauche: `${fr(Math.max(...inv.angles.figure), 0)}°`,
      droite: `${fr(Math.max(...inv.angles.image), 0)}°`,
      ok: inv.angles.conserve,
    },
    {
      id: 'aire',
      nom: 'Aire',
      gauche: `${carAire(inv.aire.figure)} car.`,
      droite: `${carAire(inv.aire.image)} car.`,
      ok: inv.aire.conserve,
    },
    {
      id: 'parallelisme',
      nom: 'Côtés deux à deux parallèles',
      gauche: inv.parallelisme.conserve ? 'oui' : 'non',
      droite: inv.parallelisme.conserve ? 'oui' : 'non',
      ok: inv.parallelisme.conserve,
    },
  ];

  return (
    <div
      className="rounded-2xl border-2 border-emerald-200 bg-white overflow-hidden"
      role="group"
      aria-label={ariaLabel}
    >
      <GeoScene
        width={W} height={H}
        labels={[
          ...figure.map((p, i) => ({ id: `s${i}`, text: nomsSommets[i], anchor: p, color: '#334155', size: 18 })),
          ...image.map((p, i) => ({ id: `i${i}`, text: `${nomsSommets[i]}’`, anchor: p, color: '#047857', size: 18 })),
        ]}
        obstacles={[
          ...polyObstacles(figure), ...polyObstacles(image),
          ...dotObstacles([...figure, ...image, origine, pointe], 18),
        ]}
        ariaLabel={`${ariaLabel} — la figure, sa copie et le glissement réglable`}
        onPointerMove={deplacer}
        onPointerUp={() => setDrag(false)}
      >
        <rect x={0} y={0} width={W} height={H} fill="#ffffff" data-visual-role="decor" />
        <Grille />
        <Trajets figure={figure} image={image} color="#f59e0b" w={2} />

        <Poly pts={figure} fill="#64748b" stroke="#475569" fillOpacity={0.1} w={3} />
        {figure.map((p, i) => <Dot key={`d${i}`} p={p} color="#334155" r={6} />)}

        <Poly pts={image} fill="#10b981" stroke="#047857" fillOpacity={0.16} w={3} />
        {image.map((p, i) => <Dot key={`c${i}`} p={p} color="#047857" r={6} />)}

        {!g.estNul && <Fleche de={origine} vers={pointe} color="#4338ca" w={5} />}
        <circle cx={origine.x} cy={origine.y} r={7} fill="#4338ca" stroke="#ffffff" strokeWidth={3} />
        <Handle
          p={pointe} color="#4338ca" r={14} hitR={HIT_R}
          dragging={drag}
          onPointerDown={prendre}
          onKeyDown={auClavier}
          label="Tirer la pointe de la flèche pour changer le glissement"
        />
      </GeoScene>

      {/* Le tableau — en DOM, deux colonnes de nombres et un verdict mesuré. */}
      <div className="border-t-2 border-emerald-100 bg-emerald-50/40 px-3 py-3">
        {/* PAS de min-width : à 375 px, une largeur minimale de 320 px
            débordait de <main> — l'audit de mise en page l'a attrapé. Le
            tableau se réduit donc vraiment, et les libellés s'enroulent. */}
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] sm:text-sm" data-lecture="invariants">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="py-1 text-left font-semibold">Grandeur</th>
                <th className="py-1 text-right font-semibold">Figure</th>
                <th className="py-1 text-right font-semibold">Copie</th>
                <th className="py-1 pl-2 text-right font-semibold">Égales ?</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l) => (
                <tr key={l.id} className="border-t border-emerald-100" data-invariant={l.id}>
                  <td className="py-1.5 pr-2 text-slate-700">{l.nom}</td>
                  <td className="py-1.5 text-right font-mono tabular-nums text-slate-800">{l.gauche}</td>
                  <td className="py-1.5 text-right font-mono tabular-nums text-emerald-800">{l.droite}</td>
                  <td className="py-1.5 pl-2 text-right font-black">
                    <span className={l.ok ? 'text-emerald-700' : 'text-rose-600'}>
                      {l.ok ? 'oui' : 'non'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          className="mt-2 rounded-xl px-3 py-2 text-center text-sm font-bold text-emerald-800"
          data-verdict={inv.tout ? 'tout-conserve' : 'quelque-chose-change'}
        >
          {inv.tout
            ? 'Déplace la copie où tu veux : les quatre lignes ne bougent pas.'
            : 'Quelque chose a changé — regarde quelle ligne est passée au rouge.'}
        </div>
      </div>
    </div>
  );
}
