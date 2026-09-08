import React from 'react';
import GeoScene, { Dot, Poly, Seg, dotObstacles, polyObstacles } from '../../../../common/geo5e/GeoScene';
import AngleArc, { TickMarks } from '../../../../common/geo5e/AngleArc';
import {
  triangleDe, midpoint, circumcenter, rayonCirconscrit, hauteur, mediane,
  recollageAngles, triangleAngles, fr, rad,
} from './components/triangles';

/**
 * Connaissances de la leçon « Triangles » (5e) — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés
 * (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * LA DÉPENDANCE RÉELLE — c'est elle qui décide de l'ordre des modules :
 *
 *     la somme des angles vaut 180°  (M1, démontrée en M2)
 *              ↓
 *     calculer un angle manquant  (M2)
 *              ↓
 *     quelles longueurs ferment ? l'inégalité triangulaire  (M3)
 *              ↓
 *     construire un triangle au compas  (M4)
 *              ↓                        ↘
 *     médiatrices et cercle circonscrit (M5)   hauteur et médiane (M6)
 *                                              ↓
 *                              la médiane partage en deux aires égales (M6)
 *
 * Rien n'est arbitraire : on ne peut pas construire au compas (M4) sans savoir
 * quelles longueurs ferment (M3), et on ne peut pas parler du cercle
 * circonscrit (M5) avant d'avoir un triangle sous la main.
 *
 * LES VISUELS SONT CALCULÉS. Chaque figure est produite par `triangleDe` et
 * les fonctions de components/triangles.js — les mêmes, testées, qui
 * alimentent les laboratoires. Un angle marqué « 60° » ne peut donc pas être
 * dessiné à 55° : l'invariant visuel de la famille est tenu par construction.
 */

const VW = 440;
const VH = 280;

/** Le triangle de référence des visuels, construit par le noyau testé. */
const T = triangleDe(200, 150, 130, { x: 120, y: 215 });

/** Un triangle, ses sommets nommés, et ce qu'on veut y montrer. */
function Figure({
  tri = T,
  noms = ['A', 'B', 'C'],
  angles = false,
  extra = null,
  labelsExtra = [],
  obstaclesExtra = [],
  ariaLabel,
}) {
  const labels = [
    ...tri.map((p, i) => ({ id: `s${i}`, text: noms[i], anchor: p, color: '#334155', size: 17 })),
    ...labelsExtra,
  ];
  return (
    <GeoScene
      width={VW} height={VH}
      labels={labels}
      obstacles={[...dotObstacles(tri, 14), ...polyObstacles(tri), ...obstaclesExtra]}
      ariaLabel={ariaLabel}
    >
      <rect x={0} y={0} width={VW} height={VH} fill="#ffffff" data-visual-role="decor" />
      {extra}
      <Poly pts={tri} fill="#7c3aed" stroke="#6d28d9" fillOpacity={0.1} />
      {angles && tri.map((p, i) => (
        <AngleArc
          key={i}
          a={tri[(i + 1) % 3]} b={p} c={tri[(i + 2) % 3]}
          r={30} color="#7c3aed" showValue
        />
      ))}
      {tri.map((p, i) => <Dot key={i} p={p} color="#334155" r={5} />)}
    </GeoScene>
  );
}

/** Les trois coins recollés autour d'un point : ils forment l'angle plat. */
function VisuelRecollage() {
  const { cumul } = recollageAngles(T);
  const O = { x: VW / 2, y: 190 };
  const R = 105;
  const teintes = ['#7c3aed', '#0ea5e9', '#f59e0b'];
  return (
    <GeoScene
      width={VW} height={VH}
      labels={[]}
      obstacles={[]}
      ariaLabel="Les trois angles du triangle recollés bout à bout autour d’un point : ils forment un angle plat"
    >
      <rect x={0} y={0} width={VW} height={VH} fill="#ffffff" data-visual-role="decor" />
      {/* La droite support : c'est l'angle plat que les trois coins remplissent. */}
      <Seg a={{ x: 30, y: O.y }} b={{ x: VW - 30, y: O.y }} color="#334155" w={3} />
      {cumul.map((c, i) => {
        // Les secteurs sont posés à partir de 180° et tournent vers 0° : ils
        // balaient exactement le demi-plan supérieur si la somme fait 180°.
        const a0 = rad(180 - c.debut);
        const a1 = rad(180 - c.debut - c.mesure);
        const p0 = { x: O.x + R * Math.cos(a0), y: O.y - R * Math.sin(a0) };
        const p1 = { x: O.x + R * Math.cos(a1), y: O.y - R * Math.sin(a1) };
        return (
          <path
            key={i}
            d={`M ${O.x} ${O.y} L ${p0.x} ${p0.y} A ${R} ${R} 0 0 1 ${p1.x} ${p1.y} Z`}
            fill={teintes[i]} fillOpacity={0.3} stroke={teintes[i]} strokeWidth={2.5}
          />
        );
      })}
      <Dot p={O} color="#334155" r={5} />
      <text x={VW / 2} y={VH - 22} textAnchor="middle" fontSize={16} fontWeight={800} fill="#334155">
        les trois coins bout à bout = un angle plat = 180°
      </text>
    </GeoScene>
  );
}

/** Le cercle circonscrit et son centre, tous deux calculés. */
function VisuelCercle() {
  const O = circumcenter(T);
  const r = rayonCirconscrit(T);
  return (
    <Figure
      tri={T}
      labelsExtra={[{ id: 'O', text: 'O', anchor: O, color: '#dc2626', size: 17 }]}
      obstaclesExtra={dotObstacles([O], 14)}
      ariaLabel="Le cercle circonscrit passe par les trois sommets du triangle"
      extra={
        <>
          <circle cx={O.x} cy={O.y} r={r} fill="none" stroke="#a855f7" strokeWidth={2.5} />
          {T.map((p, i) => (
            <Seg key={i} a={O} b={p} color="#c4b5fd" w={2} dash="5 5" />
          ))}
          <Dot p={O} color="#dc2626" r={6} />
        </>
      }
    />
  );
}

/** Hauteur et médiane issues du même sommet : deux droites distinctes. */
function VisuelHauteurMediane() {
  const h = hauteur(T, 0);
  const m = mediane(T, 0);
  return (
    <Figure
      tri={T}
      labelsExtra={[
        { id: 'H', text: 'H', anchor: h.pied, color: '#0284c7', size: 16 },
        { id: 'M', text: 'M', anchor: m.milieu, color: '#059669', size: 16 },
      ]}
      obstaclesExtra={dotObstacles([h.pied, m.milieu], 13)}
      ariaLabel="La hauteur tombe perpendiculairement, la médiane vise le milieu : deux droites différentes"
      extra={
        <>
          <Seg a={h.sommet} b={h.pied} color="#0284c7" w={3} />
          <Seg a={m.sommet} b={m.milieu} color="#059669" w={3} dash="8 5" />
          <Dot p={h.pied} color="#0284c7" r={5} />
          <Dot p={m.milieu} color="#059669" r={5} />
          {/* Les deux demi-côtés portent la même marque : M EST le milieu. */}
          <TickMarks a={T[1]} b={m.milieu} n={1} color="#059669" />
          <TickMarks a={m.milieu} b={T[2]} n={1} color="#059669" />
        </>
      }
    />
  );
}

/** La médiane et les deux aires qu'elle sépare. */
function VisuelDeuxAires() {
  const m = mediane(T, 0);
  return (
    <Figure
      tri={T}
      labelsExtra={[{ id: 'M', text: 'M', anchor: m.milieu, color: '#059669', size: 16 }]}
      obstaclesExtra={dotObstacles([m.milieu], 13)}
      ariaLabel="La médiane partage le triangle en deux triangles de même aire"
      extra={
        <>
          <Poly pts={[T[0], T[1], m.milieu]} fill="#0ea5e9" stroke="#0284c7" fillOpacity={0.25} />
          <Poly pts={[T[0], m.milieu, T[2]]} fill="#f59e0b" stroke="#d97706" fillOpacity={0.25} />
          <Seg a={T[0]} b={m.milieu} color="#059669" w={3} />
          <TickMarks a={T[1]} b={m.milieu} n={1} color="#059669" />
          <TickMarks a={m.milieu} b={T[2]} n={1} color="#059669" />
          <Dot p={m.milieu} color="#059669" r={5} />
        </>
      }
    />
  );
}

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — le fait, constaté. La DÉMONSTRATION est la découverte du module 2 :
       la donner ici la lui prendrait. */
    1: [
      {
        id: 'somme-angles-triangle',
        type: 'regles',
        title: 'La somme des angles vaut toujours 180°',
        summary: 'Dans n’importe quel triangle, les trois angles totalisent 180° — quelle que soit sa forme ou sa taille.',
        visual: <Figure angles ariaLabel="Un triangle et ses trois angles mesurés" />,
        visualSize: 'lg',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-violet-200 p-4 text-center">
              <div className="text-base font-bold text-violet-800">
                Â + B̂ + Ĉ = 180°
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Tu as déformé le triangle dans tous les sens : aplati, étiré, retourné. Les trois
              angles changeaient chacun de leur côté — mais leur <strong>somme</strong>, elle, est
              restée bloquée sur 180°.
            </p>
            <div className="bg-white rounded-xl border border-violet-100 p-3 text-sm text-slate-700">
              C’est une contrainte très forte : elle veut dire qu’un triangle n’a{' '}
              <strong>que deux angles libres</strong>. Le troisième est décidé par les deux
              premiers, sans qu’on ait le choix.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le sommet qu’on traînait, et le total qui ne bougeait pas.</div>
          </div>
        ),
      },
    ],

    /* M2 — la preuve et son usage numérique. */
    2: [
      {
        id: 'preuve-somme-angles',
        type: 'concepts',
        title: 'Pourquoi la somme fait 180°',
        summary: 'En découpant les trois coins et en les recollant bout à bout autour d’un point, on obtient exactement un angle plat.',
        visual: <VisuelRecollage />,
        visualSize: 'lg',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Le constat du module précédent ne disait pas <em>pourquoi</em>. Le découpage, lui, le
              montre : les trois coins mis côte à côte remplissent{' '}
              <strong>exactement un demi-tour</strong>, sans trou ni chevauchement.
            </p>
            <div className="bg-white rounded-xl border-2 border-indigo-200 p-3 text-sm text-slate-700">
              Et un angle plat, c’est <strong>180°</strong>. La somme des trois angles vaut donc
              180° — pour ce triangle-ci, mais aussi pour tous les autres, puisque le découpage
              marche à chaque fois.
            </div>
          </div>
        ),
      },
      {
        id: 'calculer-angle-manquant',
        type: 'methodes',
        title: 'Calculer le troisième angle',
        summary: 'Deux angles connus suffisent : le troisième vaut 180° moins leur somme.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-indigo-200 p-4 text-center space-y-1">
              <div className="text-base font-bold text-indigo-800">
                troisième angle = 180° − (les deux autres)
              </div>
            </div>
            <ol className="space-y-1.5 text-sm text-slate-700 list-decimal list-inside">
              <li>additionner les deux angles connus ;</li>
              <li>retirer ce total de 180° ;</li>
              <li>vérifier que le résultat est bien positif — sinon les données sont fausses.</li>
            </ol>
            <div className="bg-white rounded-xl border-2 border-orange-200 p-3 text-sm">
              <strong className="text-orange-800">Un contrôle gratuit :</strong> si deux angles
              donnés totalisent déjà 180° ou plus, le triangle est <strong>impossible</strong>. Il
              ne resterait rien pour le troisième.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-somme-angles',
        type: 'memoriser',
        title: '⭐ Trois angles, un seul total',
        summary: 'La somme est toujours 180°, donc le troisième angle ne se mesure pas : il se calcule.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-lg sm:text-xl font-black text-rose-700">
              Â + B̂ + Ĉ = 180°
            </div>
            <div className="text-sm text-slate-600 font-semibold">
              Deux angles connus ⟹ le troisième est décidé.
            </div>
          </div>
        ),
      },
    ],

    /* M3 — l'inégalité triangulaire, trouvée en cherchant la frontière. */
    3: [
      {
        id: 'inegalite-triangulaire',
        type: 'regles',
        title: 'L’inégalité triangulaire',
        summary: 'Trois longueurs forment un triangle si, et seulement si, la plus grande est strictement inférieure à la somme des deux autres.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-sky-200 p-4 text-center space-y-1">
              <div className="text-base font-bold text-sky-800">
                le plus grand côté &lt; somme des deux autres
              </div>
              <div className="text-sm text-slate-600">
                sinon, les deux côtés courts <strong>n’arrivent pas à se rejoindre</strong>.
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-2 text-sm">
              <div className="bg-white rounded-xl border-2 border-emerald-200 p-3">
                <div className="font-bold text-emerald-800">4 · 5 · 7</div>
                <div className="text-xs text-slate-600">7 &lt; 4 + 5 = 9 → le triangle existe</div>
              </div>
              <div className="bg-white rounded-xl border-2 border-orange-200 p-3">
                <div className="font-bold text-orange-800">4 · 5 · 9</div>
                <div className="text-xs text-slate-600">9 = 4 + 5 → tout est aplati, ce n’est pas un triangle</div>
              </div>
              <div className="bg-white rounded-xl border-2 border-orange-200 p-3">
                <div className="font-bold text-orange-800">4 · 5 · 12</div>
                <div className="text-xs text-slate-600">12 &gt; 4 + 5 → impossible, les côtés sont trop courts</div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-sky-100 p-3 text-sm text-slate-600">
              Le cas <strong>d’égalité</strong> est exclu : quand la somme égale le plus grand côté,
              les trois points sont alignés. On obtient un segment, pas un triangle.
            </div>
          </div>
        ),
      },
    ],

    /* M4 — la construction, comme méthode. */
    4: [
      {
        id: 'construire-triangle',
        type: 'methodes',
        title: 'Construire un triangle au compas',
        summary: 'On trace un côté, puis deux arcs de cercle dont l’intersection donne le troisième sommet.',
        visual: <Figure ariaLabel="Un triangle construit à partir de trois longueurs" />,
        visualSize: 'lg',
        body: (
          <div className="space-y-3">
            <ol className="space-y-1.5 text-sm text-slate-700 list-decimal list-inside">
              <li>vérifier d’abord l’<strong>inégalité triangulaire</strong> ;</li>
              <li>tracer le plus grand côté à la règle : deux sommets sont posés ;</li>
              <li>ouvrir le compas à la longueur du 2ᵉ côté, pointe sur un sommet, tracer un arc ;</li>
              <li>ouvrir le compas au 3ᵉ côté, pointe sur l’autre sommet, tracer un second arc ;</li>
              <li>le <strong>croisement des deux arcs</strong> est le troisième sommet.</li>
            </ol>
            <div className="bg-white rounded-xl border border-emerald-100 p-3 text-sm text-slate-600">
              Les deux arcs se croisent en <strong>deux</strong> points, de part et d’autre du côté
              tracé. Les deux triangles obtenus sont identiques, simplement retournés : on choisit
              celui qu’on veut.
            </div>
          </div>
        ),
      },
    ],

    /* M5 — le point de concours et le cercle. */
    5: [
      {
        id: 'mediatrices-cercle-circonscrit',
        type: 'concepts',
        title: 'Les médiatrices et le cercle circonscrit',
        summary: 'Les trois médiatrices d’un triangle se coupent en un même point, à égale distance des trois sommets : c’est le centre du cercle circonscrit.',
        visual: <VisuelCercle />,
        visualSize: 'lg',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              La <strong>médiatrice</strong> d’un côté est la droite qui passe par son milieu
              perpendiculairement à lui. Elle a une propriété simple : tous ses points sont à{' '}
              <strong>égale distance des deux extrémités</strong> du côté.
            </p>
            <div className="bg-white rounded-xl border-2 border-purple-200 p-3 text-sm text-slate-700">
              C’est ce qui explique le point de concours : le point commun aux médiatrices de [AB]
              et de [BC] est à égale distance de A et B, <em>et</em> de B et C — donc des{' '}
              <strong>trois sommets à la fois</strong>. La troisième médiatrice y passe forcément.
            </div>
            <p className="text-sm text-slate-600">
              Ce point est le <strong>centre du cercle circonscrit</strong>, le seul cercle qui
              passe par les trois sommets du triangle.
            </p>
          </div>
        ),
      },
    ],

    /* M6 — hauteur, médiane, et la seconde démonstration exigée. */
    6: [
      {
        id: 'hauteur-et-mediane',
        type: 'vocabulaire',
        title: 'Hauteur et médiane : deux droites différentes',
        summary: 'La hauteur tombe perpendiculairement sur le côté opposé ; la médiane rejoint son milieu. Elles ne coïncident que dans des cas particuliers.',
        visual: <VisuelHauteurMediane />,
        visualSize: 'lg',
        body: (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <div className="bg-white rounded-xl border-2 border-sky-200 p-3 space-y-1">
                <div className="font-bold text-sky-800">La hauteur</div>
                <ul className="text-xs text-slate-600 space-y-0.5">
                  <li>• part d’un sommet</li>
                  <li>• tombe <strong>perpendiculairement</strong> sur le côté opposé</li>
                  <li>• sert à calculer l’aire</li>
                </ul>
              </div>
              <div className="bg-white rounded-xl border-2 border-emerald-200 p-3 space-y-1">
                <div className="font-bold text-emerald-800">La médiane</div>
                <ul className="text-xs text-slate-600 space-y-0.5">
                  <li>• part d’un sommet</li>
                  <li>• rejoint le <strong>milieu</strong> du côté opposé</li>
                  <li>• partage le triangle en deux aires égales</li>
                </ul>
              </div>
            </div>
            <div className="bg-white rounded-xl border-2 border-orange-200 p-3 text-sm">
              <strong className="text-orange-800">Le piège :</strong> dans un triangle{' '}
              <strong>isocèle</strong>, la hauteur et la médiane issues du sommet principal sont
              confondues. C’est un cas particulier — dans un triangle quelconque, ce sont bien deux
              droites distinctes.
            </div>
          </div>
        ),
      },
      {
        id: 'mediane-deux-aires-egales',
        type: 'regles',
        title: 'La médiane partage en deux aires égales',
        summary: 'Une médiane coupe le triangle en deux triangles de même aire, parce qu’ils ont la même base et la même hauteur.',
        visual: <VisuelDeuxAires />,
        visualSize: 'lg',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              La médiane issue de A coupe le triangle ABC en deux morceaux : ABM et AMC. Ils n’ont
              pas la même forme — et pourtant ils ont exactement la <strong>même aire</strong>.
            </p>
            <div className="bg-white rounded-xl border-2 border-rose-200 p-3 space-y-2">
              <div className="text-sm font-bold text-rose-800">La démonstration, en deux ingrédients</div>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>
                  • <strong>même base</strong> : M est le milieu de [BC], donc BM = MC ;
                </li>
                <li>
                  • <strong>même hauteur</strong> : c’est celle issue de A, la même pour les deux
                  morceaux puisqu’ils partagent la droite (BC).
                </li>
              </ul>
              <div className="text-sm text-slate-600 pt-1 border-t border-rose-100">
                Or l’aire vaut <strong>base × hauteur ÷ 2</strong>. Deux triangles de même base et
                de même hauteur ont donc la même aire.
              </div>
            </div>
            <div className="bg-white rounded-xl border border-rose-100 p-3 text-sm text-slate-600">
              L’hypothèse « milieu » est indispensable : une droite qui partirait de A vers un
              autre point de [BC] <strong>ne partagerait pas</strong> le triangle en deux aires
              égales.
            </div>
          </div>
        ),
      },
    ],
  },
};
