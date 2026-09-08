import React from 'react';
import GeoScene, { Dot, Poly, Seg, dotObstacles } from '../../../../common/geo5e/GeoScene';
import { symCentral, symCentralPts, midpoint } from '../../../../common/geo5e/geo5e';
import { DRAPEAU, placer, FIGURES_CENTRE, centreDe, symAxial } from './components/transformations';

/**
 * Connaissances de la leçon « Transformations : la symétrie centrale » (5e)
 * — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés
 * (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * LA DÉPENDANCE RÉELLE — c'est elle qui décide de l'ordre des modules :
 *
 *     le demi-tour autour d'un point  (M1)
 *              ↓
 *     le centre est le milieu de [M M']  (M2)
 *              ↓
 *     construire l'image d'une figure  (M3)
 *              ↓                    ↘
 *     ce que le demi-tour conserve (M4)   le centre d'une figure (M5)
 *                                  ↘        ↙
 *                        demi-tour ≠ pliage (M6)
 *
 * Rien n'est arbitraire : on ne peut pas construire une figure (M3) sans la
 * règle de placement d'un point (M2), et on ne peut pas distinguer le demi-tour
 * du pliage (M6) avant de savoir ce que chacun conserve (M4).
 */

/* ── Les visuels de la carte : petits, fixes, jamais interactifs ─────────── */

const VW = 420;
const VH = 250;

const FIG = placer(DRAPEAU, { x: 120, y: 175 });
const O = { x: 232, y: 132 };

/** Une figure et son image par le demi-tour, avec le centre. */
function VisuelDemiTour({ traces = false }) {
  const img = symCentralPts(FIG, O);
  const labels = [
    { id: 'O', text: 'O', anchor: O, color: '#dc2626', size: 17 },
    { id: 'A', text: 'A', anchor: FIG[1], color: '#334155', size: 17 },
    { id: 'Ap', text: 'A’', anchor: img[1], color: '#7c3aed', size: 17 },
  ];
  return (
    <GeoScene width={VW} height={VH} labels={labels} obstacles={dotObstacles([O, FIG[1], img[1]], 13)} ariaLabel="Une figure et son image par un demi-tour autour du point O">
      <rect x={0} y={0} width={VW} height={VH} fill="#ffffff" data-visual-role="decor" />
      {traces && (
        <>
          <Seg a={FIG[1]} b={img[1]} color="#f59e0b" w={2.5} dash="6 5" />
          <Dot p={midpoint(FIG[1], img[1])} color="#f59e0b" r={4} />
        </>
      )}
      <Poly pts={FIG} fill="#64748b" stroke="#475569" fillOpacity={0.12} />
      <Poly pts={img} fill="#7c3aed" stroke="#6d28d9" fillOpacity={0.15} />
      <Dot p={FIG[1]} color="#334155" r={6} />
      <Dot p={img[1]} color="#7c3aed" r={6} />
      <Dot p={O} color="#dc2626" r={7} />
    </GeoScene>
  );
}

/** Un seul point, son image, et le centre au milieu. */
function VisuelPoint() {
  const M = { x: 110, y: 175 };
  const C = { x: 210, y: 125 };
  const M2 = symCentral(M, C);
  return (
    <GeoScene
      width={VW} height={VH}
      labels={[
        { id: 'M', text: 'M', anchor: M, color: '#334155', size: 17 },
        { id: 'O', text: 'O', anchor: C, color: '#dc2626', size: 17 },
        { id: 'Mp', text: 'M’', anchor: M2, color: '#7c3aed', size: 17 },
      ]}
      obstacles={dotObstacles([M, C, M2], 13)}
      ariaLabel="Le point O est le milieu du segment joignant M à son image M prime"
    >
      <rect x={0} y={0} width={VW} height={VH} fill="#ffffff" data-visual-role="decor" />
      <Seg a={M} b={M2} color="#f59e0b" w={3} />
      <Dot p={M} color="#334155" />
      <Dot p={M2} color="#7c3aed" />
      <Dot p={C} color="#dc2626" />
      {/* Les deux moitiés portent la même marque : c'est CE que dit la règle. */}
      <text x={(M.x + C.x) / 2} y={(M.y + C.y) / 2 - 12} fontSize={15} fontWeight={800} fill="#f59e0b" textAnchor="middle" stroke="#fff" strokeWidth={4} paintOrder="stroke">✕</text>
      <text x={(M2.x + C.x) / 2} y={(M2.y + C.y) / 2 - 12} fontSize={15} fontWeight={800} fill="#f59e0b" textAnchor="middle" stroke="#fff" strokeWidth={4} paintOrder="stroke">✕</text>
    </GeoScene>
  );
}

/** Le parallélogramme et son centre. */
function VisuelCentreFigure() {
  const f = FIGURES_CENTRE.find((x) => x.id === 'parallelogramme');
  const pts = f.pts.map((p) => ({ x: p.x + 210, y: p.y + 125 }));
  const c = centreDe(pts);
  return (
    <GeoScene
      width={VW} height={VH}
      labels={[{ id: 'O', text: 'O', anchor: c, color: '#dc2626', size: 17 }]}
      obstacles={dotObstacles([c], 13)}
      ariaLabel="Un parallélogramme et son centre de symétrie"
    >
      <rect x={0} y={0} width={VW} height={VH} fill="#ffffff" data-visual-role="decor" />
      <Poly pts={pts} fill="#a855f7" stroke="#7e22ce" fillOpacity={0.14} />
      <Seg a={pts[0]} b={pts[2]} color="#c4b5fd" w={2} dash="5 5" />
      <Seg a={pts[1]} b={pts[3]} color="#c4b5fd" w={2} dash="5 5" />
      {pts.map((p, i) => <Dot key={i} p={p} color="#7e22ce" r={5} />)}
      <Dot p={c} color="#dc2626" r={7} />
    </GeoScene>
  );
}

/** Le contraste : demi-tour à gauche, pliage à droite. */
function VisuelContraste() {
  const base = placer([{ x: 0, y: 0 }, { x: 54, y: 0 }, { x: 0, y: -42 }], { x: 62, y: 150 });
  const c = { x: 150, y: 128 };
  const demi = symCentralPts(base, c);
  const axe = [{ x: 330, y: 30 }, { x: 330, y: 220 }];
  const plie = base.map((p) => symAxial({ x: p.x + 165, y: p.y }, axe[0], axe[1]));
  const baseD = base.map((p) => ({ x: p.x + 165, y: p.y }));
  return (
    <GeoScene width={VW} height={VH} labels={[]} obstacles={[]} ariaLabel="À gauche un demi-tour, à droite un pliage : le pliage retourne la figure">
      <rect x={0} y={0} width={VW} height={VH} fill="#ffffff" data-visual-role="decor" />
      <Poly pts={base} fill="#64748b" stroke="#475569" fillOpacity={0.12} />
      <Poly pts={demi} fill="#7c3aed" stroke="#6d28d9" fillOpacity={0.16} />
      <Dot p={c} color="#dc2626" r={6} />
      <line x1={axe[0].x} y1={axe[0].y} x2={axe[1].x} y2={axe[1].y} stroke="#0ea5e9" strokeWidth={3} strokeDasharray="8 6" />
      <Poly pts={baseD} fill="#64748b" stroke="#475569" fillOpacity={0.12} />
      <Poly pts={plie} fill="#0ea5e9" stroke="#0284c7" fillOpacity={0.16} />
      <text x={105} y={238} fontSize={15} fontWeight={800} fill="#6d28d9" textAnchor="middle">demi-tour</text>
      <text x={320} y={238} fontSize={15} fontWeight={800} fill="#0284c7" textAnchor="middle">pliage</text>
    </GeoScene>
  );
}

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Le geste, nommé. La RÈGLE de placement n'arrive pas ici : elle est
       la découverte du module 2, et la lui prendre viderait ce module. */
    1: [
      {
        id: 'symetrie-centrale',
        type: 'vocabulaire',
        title: 'La symétrie centrale est un demi-tour',
        summary: 'Faire le symétrique d’une figure par rapport à un point, c’est la faire tourner d’un demi-tour autour de ce point.',
        visual: <VisuelDemiTour />,
        visualSize: 'lg',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              On plante une punaise en un point <strong className="text-rose-600">O</strong>, on
              pose un calque sur la figure, et on fait tourner ce calque d’un{' '}
              <strong>demi-tour</strong> — c’est-à-dire d’un tour complet coupé en deux.
            </p>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• le point <strong className="text-rose-600">O</strong> s’appelle le <strong>centre</strong> de la symétrie ;</li>
              <li>• la figure obtenue est l’<strong>image</strong> de la figure de départ ;</li>
              <li>• l’image se note avec des primes : A devient A’, B devient B’.</li>
            </ul>
            <div className="bg-white rounded-xl border border-violet-100 p-3 text-sm text-slate-700">
              Un demi-tour vaut <strong>180°</strong>. C’est pour cela que la figure arrive
              « à l’envers » — mais sans jamais être retournée comme dans un miroir.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le calque qui pivote autour de la punaise.</div>
          </div>
        ),
      },
    ],

    /* M2 — La règle de placement. C'est le cœur de la leçon : tout le reste
       s'y ramène, y compris la construction du module 3. */
    2: [
      {
        id: 'centre-milieu',
        type: 'regles',
        title: 'Le centre est le milieu de [M M’]',
        summary: 'Pour tout point M, le centre O est exactement le milieu du segment qui joint M à son image M’.',
        visual: <VisuelPoint />,
        visualSize: 'lg',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-indigo-200 p-4 text-center space-y-1">
              <div className="text-base font-bold text-indigo-800">
                O est le milieu de [M M’]
              </div>
              <div className="text-sm text-slate-600">
                donc M, O et M’ sont <strong>alignés</strong>, et <strong>OM = OM’</strong>.
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Cette seule phrase suffit à placer l’image de n’importe quel point : on trace la
              demi-droite qui part de M et passe par O, puis on reporte la même longueur de
              l’autre côté de O.
            </p>
            <div className="bg-white rounded-xl border-2 border-orange-200 p-3 text-sm">
              <strong className="text-orange-800">L’erreur à ne plus faire :</strong> reporter la
              longueur <em>du même côté</em> de O. On retomberait sur M lui-même — la figure
              n’aurait pas bougé.
            </div>
            <p className="text-sm text-slate-500">
              Un seul point ne bouge jamais : <strong>le centre O lui-même</strong>, puisqu’il est
              son propre milieu.
            </p>
          </div>
        ),
      },
    ],

    /* M3 — La construction, comme méthode. */
    3: [
      {
        id: 'construire-image',
        type: 'methodes',
        title: 'Construire l’image d’une figure',
        summary: 'On construit l’image de chaque sommet, puis on relie les images dans le même ordre.',
        visual: <VisuelDemiTour traces />,
        visualSize: 'lg',
        body: (
          <div className="space-y-3">
            <ol className="space-y-1.5 text-sm text-slate-700 list-decimal list-inside">
              <li>tracer la demi-droite qui part d’un sommet et passe par <strong>O</strong> ;</li>
              <li>mesurer la distance du sommet à <strong>O</strong> ;</li>
              <li>reporter cette distance <strong>de l’autre côté</strong> de O : c’est l’image ;</li>
              <li>recommencer pour chaque sommet ;</li>
              <li>relier les images <strong>dans le même ordre</strong> que la figure de départ.</li>
            </ol>
            <div className="bg-white rounded-xl border border-sky-100 p-3 text-sm text-slate-600">
              On ne construit jamais une figure « à l’œil » : chaque sommet a une place unique, et
              une seule. Si deux sommets sont bien placés mais reliés dans le désordre, la figure
              obtenue n’est pas l’image.
            </div>
          </div>
        ),
      },
    ],

    /* M4 — Les invariants, cherchés puis constatés. */
    4: [
      {
        id: 'invariants-symetrie',
        type: 'regles',
        title: 'Ce que le demi-tour conserve',
        summary: 'La symétrie centrale conserve les longueurs, les angles, les aires et l’alignement : l’image a exactement la même forme et la même taille.',
        body: (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                ['Les longueurs', 'AB = A’B’'],
                ['Les angles', 'même mesure, au degré près'],
                ['Les aires', 'la surface ne change pas'],
                ['L’alignement', 'trois points alignés le restent'],
              ].map(([t, d]) => (
                <div key={t} className="bg-white rounded-xl border-2 border-emerald-200 p-3">
                  <div className="text-sm font-bold text-emerald-800">{t}</div>
                  <div className="text-xs text-slate-600">{d}</div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-emerald-100 p-3 text-sm text-slate-600">
              Autrement dit : l’image d’un segment est un segment de{' '}
              <strong>même longueur</strong>, l’image d’un cercle est un cercle de{' '}
              <strong>même rayon</strong>. La figure est simplement posée ailleurs, et à l’envers.
            </div>
            <p className="text-sm text-slate-500">
              Une seule chose change vraiment : <strong>la position</strong>. C’est ce qui rend le
              demi-tour utile — il déplace sans déformer.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-invariants',
        type: 'memoriser',
        title: '⭐ Même forme, même taille, ailleurs',
        summary: 'Le demi-tour ne déforme rien : il déplace.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-lg sm:text-xl font-black text-rose-700">
              Longueurs · angles · aires : inchangés
            </div>
            <div className="text-sm text-slate-600 font-semibold">
              Seule la position change.
            </div>
          </div>
        ),
      },
    ],

    /* M5 — Le centre d'une figure. */
    5: [
      {
        id: 'centre-de-symetrie',
        type: 'concepts',
        title: 'Le centre de symétrie d’une figure',
        summary: 'Une figure a un centre de symétrie si un demi-tour autour de ce point la ramène exactement sur elle-même.',
        visual: <VisuelCentreFigure />,
        visualSize: 'lg',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Jusqu’ici le demi-tour envoyait la figure <em>ailleurs</em>. Pour certaines figures,
              il la ramène <strong>exactement sur elle-même</strong> : on ne voit alors aucune
              différence entre avant et après.
            </p>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <div className="bg-white rounded-xl border-2 border-purple-200 p-3">
                <div className="font-bold text-purple-800">En ont un</div>
                <div className="text-xs text-slate-600">parallélogramme, rectangle, losange, carré, cercle</div>
              </div>
              <div className="bg-white rounded-xl border-2 border-orange-200 p-3">
                <div className="font-bold text-orange-800">N’en ont pas</div>
                <div className="text-xs text-slate-600">triangle équilatéral, trapèze isocèle</div>
              </div>
            </div>
            <div className="bg-white rounded-xl border-2 border-orange-200 p-3 text-sm">
              <strong className="text-orange-800">Le piège :</strong> le triangle équilatéral a
              trois axes de symétrie, et pourtant <strong>aucun centre</strong>. Avoir beaucoup
              d’axes ne donne pas un centre : ce sont deux propriétés différentes.
            </div>
          </div>
        ),
      },
    ],

    /* M6 — Le contraste, appuyé sur les invariants du M4. */
    6: [
      {
        id: 'centrale-vs-axiale',
        type: 'concepts',
        title: 'Demi-tour ou pliage ?',
        summary: 'La symétrie axiale retourne la figure comme un miroir ; la symétrie centrale la fait tourner sans la retourner.',
        visual: <VisuelContraste />,
        visualSize: 'lg',
        body: (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <div className="bg-white rounded-xl border-2 border-violet-200 p-3 space-y-1">
                <div className="font-bold text-violet-800">Symétrie centrale</div>
                <ul className="text-xs text-slate-600 space-y-0.5">
                  <li>• autour d’un <strong>point</strong></li>
                  <li>• un <strong>demi-tour</strong></li>
                  <li>• la figure <strong>n’est pas retournée</strong></li>
                  <li>• un seul point fixe : le centre</li>
                </ul>
              </div>
              <div className="bg-white rounded-xl border-2 border-sky-200 p-3 space-y-1">
                <div className="font-bold text-sky-800">Symétrie axiale</div>
                <ul className="text-xs text-slate-600 space-y-0.5">
                  <li>• par rapport à une <strong>droite</strong></li>
                  <li>• un <strong>pliage</strong></li>
                  <li>• la figure <strong>est retournée</strong></li>
                  <li>• toute la droite est fixe</li>
                </ul>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-rose-100 p-3 text-sm text-slate-600">
              Les deux conservent les longueurs, les angles et les aires : ce n’est donc{' '}
              <strong>pas</strong> là qu’il faut chercher la différence. Le test qui marche à tous
              les coups : <strong>essaie de faire glisser la figure de départ sur son image sans
              la soulever de la table</strong>. Avec un demi-tour, c’est possible ; avec un
              pliage, jamais.
            </div>
          </div>
        ),
      },
    ],
  },
};
