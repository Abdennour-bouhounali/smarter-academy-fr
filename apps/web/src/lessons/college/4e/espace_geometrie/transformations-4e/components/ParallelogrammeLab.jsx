import React, { useCallback, useState } from 'react';
import GeoScene, { Dot, Handle, Poly, dotObstacles, segObstacles } from '../../../../../common/geo5e/GeoScene';
import { Grille, Fleche, Mesure, carreaux, W, H } from './scene4e';
import {
  PAS, fr, glissement, parallelogrammeDe, diagonalesMemeMilieu, auNoeud,
} from './translation4e';

/** Le rayon de saisie des poignées, en unités de viewBox — la même valeur
 *  mesurée que dans GlissementLab : à 375 px, 68 unités valent ~47 px CSS. */
const HIT_R = 68;

/**
 * ParallelogrammeLab — le quadrilatère que fabrique un glissement.
 *
 * DEUX points, UN glissement, et la question du module : dans quel ORDRE
 * relier M, N et leurs deux images ? Le composant dessine les DEUX ordres
 * côte à côte, et laisse l'élève basculer de l'un à l'autre :
 *
 *   · M → M’ → N’ → N  fait le tour : c'est un parallélogramme ;
 *   · M → N → M’ → N’  traverse : le quadrilatère est croisé. Son aire
 *     calculée par la formule du lacet vaut EXACTEMENT zéro — les deux lobes
 *     du nœud papillon sont superposables et parcourus en sens contraire,
 *     donc ils s'annulent. C'est la signature mathématique du « croisé », et
 *     `parcours.test.js` la verrouille. Le dessin, lui, reste bien visible :
 *     c'est pour cela que le composant ne se sert PAS de l'aire pour son
 *     verdict, mais de `oppositeSidesParallel` sur les points dessinés.
 *
 * L'erreur visée n'est pas une étourderie : elle vient de lire l'énoncé « les
 * deux points, puis leurs deux images » et de relier dans cet ordre. Le seul
 * remède est de la VOIR.
 *
 * Le verdict `estParallelogramme` vient de `oppositeSidesParallel` appliqué
 * aux points DESSINÉS. M et N restent saisissables : on peut fabriquer un cas
 * aplati (M, N et le glissement alignés) et constater que le quadrilatère
 * disparaît.
 */
export default function ParallelogrammeLab({
  M, onM,
  N, onN,
  g,
  ordre = 'tour',           // 'tour' (M M’ N’ N) ou 'croise' (M N M’ N’)
  montrerDiagonales = false,
  ariaLabel = 'Le quadrilatère que forme le glissement',
}) {
  const [drag, setDrag] = useState(null);

  const q = parallelogrammeDe(M, N, g);
  const sommets = ordre === 'croise' ? q.sommetsCroises : q.sommets;
  const noms = ordre === 'croise'
    ? ['M', 'N', 'M’', 'N’']
    : ['M', 'M’', 'N’', 'N'];
  const bon = ordre === 'tour' && q.estParallelogramme;
  const memeMilieu = diagonalesMemeMilieu(q);

  /* Le point ET son image doivent tenir dans le cadre : on borne donc la
     position de sorte que p ET p + glissement restent visibles. Ne borner que
     p laisserait l'image sortir de l'écran, et l'élève verrait un côté du
     quadrilatère disparaître sans comprendre pourquoi.
     La marge est HIT_R et non une valeur arbitraire : le cercle de saisie de
     la poignée, invisible mais bien présent dans le DOM, doit rester dans le
     viewBox — sans quoi il déborde de <main>, ce que l'audit attrape. */
  const borner = (p) => ({
    x: Math.min(
      Math.max(p.x, HIT_R - Math.min(g.dx, 0)),
      W - HIT_R - Math.max(g.dx, 0),
    ),
    y: Math.min(
      Math.max(p.y, HIT_R - Math.min(g.dy, 0)),
      H - HIT_R - Math.max(g.dy, 0),
    ),
  });

  const deplacer = useCallback((p) => {
    if (!p || !drag) return;
    const cible = borner(auNoeud(p));
    if (drag === 'M') onM?.(cible);
    else onN?.(cible);
  }, [drag, onM, onN, g.dx, g.dy]);

  const prendre = (which) => (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(which);
  };

  const auClavier = (which) => (e) => {
    const d = {
      ArrowRight: { x: PAS, y: 0 }, ArrowLeft: { x: -PAS, y: 0 },
      ArrowUp: { x: 0, y: -PAS }, ArrowDown: { x: 0, y: PAS },
    }[e.key];
    if (!d) return;
    e.preventDefault();
    const base = which === 'M' ? M : N;
    const cible = borner({ x: base.x + d.x, y: base.y + d.y });
    if (which === 'M') onM?.(cible); else onN?.(cible);
  };

  return (
    <div
      className="rounded-2xl border-2 border-purple-200 bg-white overflow-hidden"
      role="group"
      aria-label={ariaLabel}
    >
      <GeoScene
        width={W} height={H}
        labels={sommets.map((p, i) => ({
          id: `q${i}`, text: noms[i], anchor: p, size: 20, priority: true,
          color: noms[i].includes('’') ? '#7c3aed' : '#334155',
        }))}
        obstacles={[
          ...dotObstacles(sommets, 22),
          ...sommets.flatMap((p, i) => segObstacles(p, sommets[(i + 1) % sommets.length])),
        ]}
        ariaLabel={`${ariaLabel} — les points M, N et leurs images`}
        onPointerMove={deplacer}
        onPointerUp={() => setDrag(null)}
      >
        <rect x={0} y={0} width={W} height={H} fill="#ffffff" data-visual-role="decor" />
        <Grille />

        {/* Le quadrilatère dans l'ordre choisi. Sa couleur suit le verdict
            MESURÉ : il n'y a aucun endroit où l'écran pourrait dire « c'est
            un parallélogramme » sur une figure qui n'en est pas un. */}
        <Poly
          pts={sommets}
          fill={bon ? '#a855f7' : '#f43f5e'}
          stroke={bon ? '#7e22ce' : '#be123c'}
          fillOpacity={bon ? 0.15 : 0.1}
          w={3.5}
        />

        {montrerDiagonales && ordre === 'tour' && (
          <g>
            <line x1={q.M.x} y1={q.M.y} x2={q.Nprime.x} y2={q.Nprime.y} stroke="#0ea5e9" strokeWidth={2.5} strokeDasharray="8 6" />
            <line x1={q.Mprime.x} y1={q.Mprime.y} x2={q.N.x} y2={q.N.y} stroke="#0ea5e9" strokeWidth={2.5} strokeDasharray="8 6" />
            <circle cx={q.milieuDiagonale1.x} cy={q.milieuDiagonale1.y} r={7} fill="#0ea5e9" stroke="#ffffff" strokeWidth={2.5} />
          </g>
        )}

        {/* Les deux trajets : ce sont EUX qui font les côtés [M M’] et [N N’]. */}
        <Fleche de={q.M} vers={q.Mprime} color="#f59e0b" w={4} tete={13} opacity={0.9} />
        <Fleche de={q.N} vers={q.Nprime} color="#f59e0b" w={4} tete={13} opacity={0.9} />

        <Dot p={q.Mprime} color="#7c3aed" r={8} />
        <Dot p={q.Nprime} color="#7c3aed" r={8} />
        <Handle
          p={M} color="#334155" r={13} hitR={HIT_R}
          dragging={drag === 'M'} onPointerDown={prendre('M')} onKeyDown={auClavier('M')}
          label="Déplacer le point M"
        />
        <Handle
          p={N} color="#334155" r={13} hitR={HIT_R}
          dragging={drag === 'N'} onPointerDown={prendre('N')} onKeyDown={auClavier('N')}
          label="Déplacer le point N"
        />
      </GeoScene>

      <div className="border-t-2 border-purple-100 bg-purple-50/50 px-3 py-3">
        <div className="grid grid-cols-3 gap-2 text-center" data-lecture="parallelogramme">
          <Mesure label="Ordre des sommets" value={noms.join(' ')} />
          <Mesure
            label="[M M’] et [N N’]"
            value={`${carreaux(g.longueur)}`}
            ok
          />
          <Mesure
            label="Diagonales : même milieu ?"
            value={memeMilieu ? 'oui' : 'non'}
            ok={memeMilieu}
          />
        </div>
        <div
          className="mt-2 rounded-xl px-3 py-2 text-center text-sm font-bold"
          data-verdict={bon ? 'parallelogramme' : (q.aplati ? 'aplati' : 'croise')}
        >
          {q.aplati ? (
            <span className="text-amber-700">
              M, N et le glissement sont alignés : les quatre points sont sur une même droite,
              il n’y a plus de quadrilatère.
            </span>
          ) : bon ? (
            <span className="text-emerald-700">
              Les côtés opposés sont parallèles et de même longueur : c’est un parallélogramme.
            </span>
          ) : (
            <span className="text-rose-700">
              Ce quadrilatère est croisé : les côtés se coupent au lieu de faire le tour.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
