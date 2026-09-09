import React from 'react';
import GeoScene, { Dot, Poly, Seg, dotObstacles, polyObstacles } from '../../../../common/geo5e/GeoScene';
import { midpoint } from '../../../../common/geo5e/geo5e';
import { quatriemeSommet } from './components/paral';

/**
 * Connaissances de la leçon « Les parallélogrammes » (5e) — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés
 * (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * LA DÉPENDANCE RÉELLE — c'est elle qui décide de l'ordre des modules :
 *
 *          parallelogramme  (M1)
 *                  ↓
 *     construire-parallelogramme  (M2)
 *                  ↓
 *     cotes-opposes-egaux · angles-opposes-egaux  (M3)
 *                  ↓
 *          diagonales-milieu  (M4)
 *                  ↓
 *          caracterisations  (M5)
 *              ↓        ↘
 *  parallelogrammes-      aire-parallelogramme  (M7)
 *   particuliers (M6)
 *
 * Rien n'est arbitraire : on ne caractérise pas (M5) avant d'avoir les
 * propriétés à invoquer (M3, M4), et on ne reconnaît pas le rectangle comme
 * parallélogramme particulier (M6) avant de savoir ce qu'un parallélogramme
 * garantit.
 *
 * LES VISUELS SONT CALCULÉS. Aucun quadrilatère n'est tapé à la main :
 * le quatrième sommet vient de `quatriemeSommet`, les milieux de `midpoint`.
 * Une figure de la carte ne peut donc pas contredire ce que la carte
 * affirme (INTERACTION_PEDAGOGY §28bis).
 */

const VW = 420;
const VH = 260;

/* Le parallélogramme de référence de la carte, construit — jamais dessiné à
   l'œil. Ses trois premiers sommets sont posés, le quatrième est calculé. */
const P_A = { x: 105, y: 200 };
const P_B = { x: 285, y: 200 };
const P_C = { x: 335, y: 78 };
const P_D = quatriemeSommet(P_A, P_B, P_C);
const PARA = [P_A, P_B, P_C, P_D];

const NOMS = ['A', 'B', 'C', 'D'];

/** Les chevrons et les marques, posés au milieu du côté et tournés avec lui. */
function codage(a, b, n, forme, color) {
  const m = midpoint(a, b);
  const t = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  const items = [];
  for (let k = 0; k < n; k += 1) {
    const dx = (k - (n - 1) / 2) * 8;
    items.push(forme === 'chevron'
      ? <path key={k} d={`M ${dx - 3.5} -6 L ${dx + 3.5} 0 L ${dx - 3.5} 6`} fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      : <line key={k} x1={dx} y1={-7} x2={dx} y2={7} stroke={color} strokeWidth={2.6} strokeLinecap="round" />);
  }
  return <g transform={`translate(${m.x} ${m.y}) rotate(${t})`}>{items}</g>;
}

/** La scène commune : le parallélogramme nommé, avec le décor qu'on choisit. */
function Scene({ children, extraLabels = [], extraObstacles = [], aria }) {
  return (
    <GeoScene
      width={VW} height={VH}
      labels={[
        ...PARA.map((p, i) => ({ id: `s${i}`, text: NOMS[i], anchor: p, color: '#334155', size: 17, priority: true })),
        ...extraLabels,
      ]}
      obstacles={[...dotObstacles(PARA, 15), ...polyObstacles(PARA), ...extraObstacles]}
      ariaLabel={aria}
    >
      <rect x={0} y={0} width={VW} height={VH} fill="#ffffff" data-visual-role="decor" />
      {children}
      <Poly pts={PARA} fill="#6366f1" stroke="#4338ca" fillOpacity={0.12} w={3} />
      {PARA.map((p, i) => <Dot key={i} p={p} color="#334155" r={5.5} />)}
    </GeoScene>
  );
}

/** La définition : les deux paires de côtés parallèles, codées. */
const VisuelDefinition = () => (
  <Scene aria="Un parallélogramme ABCD : les côtés opposés sont parallèles deux à deux">
    <g data-visual-role="decor">
      {codage(P_A, P_B, 1, 'chevron', '#0ea5e9')}
      {codage(P_D, P_C, 1, 'chevron', '#0ea5e9')}
      {codage(P_A, P_D, 2, 'chevron', '#0ea5e9')}
      {codage(P_B, P_C, 2, 'chevron', '#0ea5e9')}
    </g>
  </Scene>
);

/** Les côtés opposés égaux, codés par des marques. */
const VisuelCotes = () => (
  <Scene aria="Les côtés opposés d’un parallélogramme ont la même longueur">
    <g data-visual-role="decor">
      {codage(P_A, P_B, 1, 'tick', '#059669')}
      {codage(P_D, P_C, 1, 'tick', '#059669')}
      {codage(P_A, P_D, 2, 'tick', '#059669')}
      {codage(P_B, P_C, 2, 'tick', '#059669')}
    </g>
  </Scene>
);

/** Les diagonales et leur milieu commun. */
function VisuelDiagonales() {
  const O = midpoint(P_A, P_C);
  return (
    <Scene
      aria="Les diagonales d’un parallélogramme se coupent en leur milieu"
      extraLabels={[{ id: 'O', text: 'O', anchor: O, color: '#dc2626', size: 17, priority: true }]}
      extraObstacles={dotObstacles([O], 14)}
    >
      <Seg a={P_A} b={P_C} color="#f59e0b" w={2.5} dash="6 5" />
      <Seg a={P_B} b={P_D} color="#f59e0b" w={2.5} dash="6 5" />
      <g data-visual-role="decor">
        {codage(P_A, O, 1, 'tick', '#f59e0b')}
        {codage(O, P_C, 1, 'tick', '#f59e0b')}
        {codage(P_B, O, 2, 'tick', '#f59e0b')}
        {codage(O, P_D, 2, 'tick', '#f59e0b')}
      </g>
      <Dot p={O} color="#dc2626" r={6} />
    </Scene>
  );
}

/** L'aire : la base, la hauteur et le pied — calculés, pas dessinés à l'œil. */
function VisuelAire() {
  // Le pied de la hauteur menée de D à la droite (AB) : ici (AB) est
  // horizontale, donc le pied a l'abscisse de D et l'ordonnée de A.
  const pied = { x: P_D.x, y: P_A.y };
  return (
    <Scene aria="L’aire d’un parallélogramme est le produit d’une base par la hauteur correspondante">
      <line x1={20} y1={P_A.y} x2={VW - 20} y2={P_A.y} stroke="#fecdd3" strokeWidth={2} strokeDasharray="8 6" />
      <Seg a={P_D} b={pied} color="#0284c7" w={3} dash="6 5" />
      <path
        d={`M ${pied.x} ${pied.y - 14} L ${pied.x + 14} ${pied.y - 14} L ${pied.x + 14} ${pied.y}`}
        fill="none" stroke="#0284c7" strokeWidth={2.4}
      />
      <Seg a={P_A} b={P_B} color="#be123c" w={5} />
      <Dot p={pied} color="#0284c7" r={4.5} />
    </Scene>
  );
}

/** L'arbre des inclusions — un diagramme, pas une figure géométrique. */
function VisuelFamille() {
  const boite = (x, y, w, label, fill, stroke) => (
    <g>
      <rect x={x} y={y} width={w} height={38} rx={9} fill={fill} stroke={stroke} strokeWidth={2.5} />
      <text x={x + w / 2} y={y + 24} fontSize={15} fontWeight={800} fill="#0f172a" textAnchor="middle">{label}</text>
    </g>
  );
  const fleche = (x1, y1, x2, y2) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth={2.5} strokeLinecap="round" />
  );
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-auto" role="img" aria-label="Rectangle, losange et carré sont des parallélogrammes particuliers">
      <rect x={0} y={0} width={VW} height={VH} fill="#ffffff" />
      {boite(120, 14, 180, 'parallélogramme', '#eef2ff', '#4338ca')}
      {fleche(180, 52, 110, 100)}
      {fleche(240, 52, 310, 100)}
      {boite(30, 100, 160, 'rectangle', '#e0f2fe', '#0284c7')}
      {boite(230, 100, 160, 'losange', '#d1fae5', '#059669')}
      {fleche(110, 138, 190, 186)}
      {fleche(310, 138, 230, 186)}
      {boite(140, 186, 140, 'carré', '#fef3c7', '#b45309')}
      <text x={VW / 2} y={244} fontSize={13} fontWeight={700} fill="#64748b" textAnchor="middle">
        une flèche se lit « est un cas particulier de »
      </text>
    </svg>
  );
}

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — LA DÉFINITION, nommée après le geste. Les propriétés (côtés
       égaux, diagonales) ne sont PAS ici : ce sont les découvertes des
       modules 3 et 4, et les prendre maintenant les viderait. */
    1: [
      {
        id: 'parallelogramme',
        type: 'vocabulaire',
        title: 'Un parallélogramme, c’est cette condition-là',
        summary: 'Un parallélogramme est un quadrilatère dont les côtés opposés sont parallèles deux à deux.',
        visual: <VisuelDefinition />,
        visualSize: 'lg',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-indigo-200 p-4 text-center space-y-1">
              <div className="text-base font-bold text-indigo-800">
                (AB) ∥ (DC) <span className="text-slate-400">et</span> (AD) ∥ (BC)
              </div>
              <div className="text-sm text-slate-600">
                les <strong>deux</strong> paires de côtés opposés, pas une seule.
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Le petit chevron posé sur deux côtés signifie « ces deux côtés sont parallèles ». On
              en met un simple sur la première paire, un double sur la seconde, pour ne pas les
              confondre.
            </p>
            <div className="bg-white rounded-xl border-2 border-orange-200 p-3 text-sm">
              <strong className="text-orange-800">L’erreur à ne plus faire :</strong> croire qu’il
              faut des angles droits. Un parallélogramme <em>peut</em> en avoir — mais alors on lui
              donne un autre nom. Sans angle droit, c’est encore et toujours un parallélogramme.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le portail qu’on ouvre, et les quatre témoins qui s’allument ensemble.</div>
          </div>
        ),
      },
    ],

    /* M2 — La construction, comme méthode reproductible. */
    2: [
      {
        id: 'construire-parallelogramme',
        type: 'methodes',
        title: 'Construire le quatrième sommet',
        summary: 'Trois sommets étant donnés, il existe UNE seule place pour le quatrième — on la construit, on ne la devine pas.',
        visual: <VisuelDefinition />,
        visualSize: 'lg',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              A, B et C sont posés et l’on veut ABCD parallélogramme. Deux manières de trouver D,
              qui donnent le même point :
            </p>
            <div className="bg-white rounded-xl border-2 border-indigo-200 p-3 space-y-1.5">
              <div className="text-sm font-bold text-indigo-800">Avec les parallèles</div>
              <ol className="text-sm text-slate-700 list-decimal list-inside space-y-0.5">
                <li>tracer la parallèle à (AB) passant par C ;</li>
                <li>tracer la parallèle à (BC) passant par A ;</li>
                <li>elles se coupent en <strong>un seul point</strong> : c’est D.</li>
              </ol>
            </div>
            <div className="bg-white rounded-xl border-2 border-emerald-200 p-3 space-y-1.5">
              <div className="text-sm font-bold text-emerald-800">Avec le compas</div>
              <p className="text-sm text-slate-700">
                Reporter la longueur AB à partir de C, et la longueur BC à partir de A : les deux
                arcs se croisent en D.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3 text-sm text-slate-600">
              L’ordre des lettres compte : dans <strong>ABCD</strong>, les côtés sont [AB], [BC],
              [CD] et [DA]. Les côtés opposés sont donc [AB] et [DC], puis [AD] et [BC] — jamais
              [AB] et [BC], qui se touchent en B.
            </div>
          </div>
        ),
      },
    ],

    /* M3 — Ce que les côtés promettent, après le contre-exemple introuvable. */
    3: [
      {
        id: 'cotes-opposes-egaux',
        type: 'regles',
        title: 'Les côtés opposés ont la même longueur',
        summary: 'Dans un parallélogramme, AB = DC et AD = BC : les côtés opposés sont égaux deux à deux.',
        visual: <VisuelCotes />,
        visualSize: 'lg',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-emerald-200 p-4 text-center space-y-1">
              <div className="text-base font-bold text-emerald-800">AB = DC <span className="text-slate-400">et</span> AD = BC</div>
              <div className="text-sm text-slate-600">c’est une <strong>conséquence</strong> du parallélisme, pas une seconde définition.</div>
            </div>
            <p className="text-sm text-slate-600">
              On ne l’a pas demandée : elle est arrivée toute seule dès que les deux paires de
              côtés sont devenues parallèles. C’est ce qui rend le parallélogramme si utile — une
              seule condition en garantit plusieurs.
            </p>
            <div className="bg-white rounded-xl border-2 border-orange-200 p-3 text-sm">
              <strong className="text-orange-800">Attention au sens :</strong> ce sont les côtés{' '}
              <em>opposés</em> qui sont égaux, jamais deux côtés qui se touchent. AB = BC ferait de
              la figure un losange — un cas particulier, pas la règle générale.
            </div>
          </div>
        ),
      },
      {
        id: 'angles-opposes-egaux',
        type: 'regles',
        title: 'Les angles opposés sont égaux',
        summary: 'Les angles opposés d’un parallélogramme ont la même mesure, et deux angles consécutifs font ensemble 180°.',
        body: (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <div className="bg-white rounded-xl border-2 border-emerald-200 p-3 text-center">
                <div className="font-bold text-emerald-800">Opposés</div>
                <div className="text-xs text-slate-600">l’angle en A = l’angle en C</div>
              </div>
              <div className="bg-white rounded-xl border-2 border-sky-200 p-3 text-center">
                <div className="font-bold text-sky-800">Consécutifs</div>
                <div className="text-xs text-slate-600">l’angle en A + l’angle en B = 180°</div>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Les quatre angles d’un quadrilatère font toujours 360°. Dans un parallélogramme ils
              se rangent donc en <strong>deux paires égales</strong> : deux angles aigus et deux
              angles obtus — ou quatre angles droits, et c’est alors un rectangle.
            </p>
          </div>
        ),
      },
    ],

    /* M4 — Les diagonales. La propriété la plus utile, et la plus confondue. */
    4: [
      {
        id: 'diagonales-milieu',
        type: 'regles',
        title: 'Les diagonales se coupent en leur milieu',
        summary: 'Les diagonales d’un parallélogramme se coupent en un point O qui est le milieu de CHACUNE des deux.',
        visual: <VisuelDiagonales />,
        visualSize: 'lg',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-amber-200 p-4 text-center space-y-1">
              <div className="text-base font-bold text-amber-800">
                O est le milieu de [AC] <span className="text-slate-400">et</span> le milieu de [BD]
              </div>
              <div className="text-sm text-slate-600">donc OA = OC et OB = OD.</div>
            </div>
            <div className="bg-white rounded-xl border-2 border-orange-200 p-3 text-sm">
              <strong className="text-orange-800">La confusion à éviter :</strong> « les diagonales
              se coupent en leur milieu » ne veut <strong>pas</strong> dire « les diagonales ont la
              même longueur ». Dans un parallélogramme quelconque, AC et BD sont différentes — et
              pourtant elles se coupent bien en leur milieu. L’égalité des diagonales, elle,
              caractérise le <em>rectangle</em>.
            </div>
            <p className="text-sm text-slate-500">
              Ce point O a un autre nom, rencontré ailleurs : c’est le <strong>centre</strong> de la
              figure — le point autour duquel un demi-tour la ramène sur elle-même.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-diagonales',
        type: 'memoriser',
        title: '⭐ Milieu commun ≠ même longueur',
        summary: 'Les diagonales se coupent en leur milieu ; elles ne sont pas égales pour autant.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-lg sm:text-xl font-black text-rose-700">
              OA = OC et OB = OD
            </div>
            <div className="text-sm text-slate-600 font-semibold">
              mais AC ≠ BD, sauf dans un rectangle.
            </div>
          </div>
        ),
      },
    ],

    /* M5 — Les caractérisations : chaque propriété devient un outil de preuve. */
    5: [
      {
        id: 'caracterisations',
        type: 'methodes',
        title: 'Trois façons de conclure « c’est un parallélogramme »',
        summary: 'Côtés opposés parallèles, ou côtés opposés égaux, ou diagonales de même milieu : chacune SUFFIT à conclure.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Jusqu’ici les propriétés se lisaient dans un sens : « c’est un parallélogramme,{' '}
              <em>donc</em>… ». Elles marchent aussi dans l’autre sens — et c’est ce qui permet de{' '}
              <strong>justifier</strong>.
            </p>
            <div className="space-y-2">
              {[
                ['Par les côtés parallèles', 'Si les côtés opposés sont parallèles deux à deux, alors c’est un parallélogramme.', 'sky'],
                ['Par les côtés égaux', 'Si les côtés opposés sont égaux deux à deux, alors c’est un parallélogramme.', 'emerald'],
                ['Par les diagonales', 'Si les diagonales ont le même milieu, alors c’est un parallélogramme.', 'amber'],
              ].map(([t, d, c]) => (
                <div key={t} className={`bg-white rounded-xl border-2 p-3 ${
                  c === 'sky' ? 'border-sky-200' : c === 'emerald' ? 'border-emerald-200' : 'border-amber-200'
                }`}
                >
                  <div className={`text-sm font-bold ${
                    c === 'sky' ? 'text-sky-800' : c === 'emerald' ? 'text-emerald-800' : 'text-amber-800'
                  }`}
                  >
                    {t}
                  </div>
                  <div className="text-xs text-slate-600">{d}</div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border-2 border-orange-200 p-3 text-sm space-y-1">
              <strong className="text-orange-800">Ce qui ne suffit JAMAIS :</strong>
              <ul className="text-xs text-slate-600 space-y-0.5">
                <li>• deux côtés <em>consécutifs</em> égaux — c’est un cerf-volant possible ;</li>
                <li>• une <em>seule</em> paire de côtés parallèles — c’est un trapèze ;</li>
                <li>• « ça y ressemble sur le dessin » — un dessin n’est pas une propriété.</li>
              </ul>
            </div>
          </div>
        ),
      },
    ],

    /* M6 — La famille, et l'arbre d'inclusions. */
    6: [
      {
        id: 'parallelogrammes-particuliers',
        type: 'concepts',
        title: 'Rectangle, losange, carré : des parallélogrammes',
        summary: 'Le rectangle est un parallélogramme qui a un angle droit ; le losange, un parallélogramme qui a deux côtés consécutifs égaux ; le carré, les deux à la fois.',
        visual: <VisuelFamille />,
        visualSize: 'lg',
        body: (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-3 gap-2 text-sm">
              {[
                ['Rectangle', 'un angle droit en plus', 'ses diagonales sont égales', 'sky'],
                ['Losange', 'deux côtés consécutifs égaux', 'ses diagonales sont perpendiculaires', 'emerald'],
                ['Carré', 'les deux conditions', 'égales ET perpendiculaires', 'amber'],
              ].map(([t, cond, diag, c]) => (
                <div key={t} className={`bg-white rounded-xl border-2 p-3 ${
                  c === 'sky' ? 'border-sky-200' : c === 'emerald' ? 'border-emerald-200' : 'border-amber-200'
                }`}
                >
                  <div className="font-bold text-slate-800">{t}</div>
                  <div className="text-xs text-slate-600 mt-0.5">{cond}</div>
                  <div className="text-xs text-slate-500 italic mt-1">diagonales : {diag}</div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border-2 border-orange-200 p-3 text-sm">
              <strong className="text-orange-800">Le sens des flèches :</strong> tout carré est un
              rectangle, tout rectangle est un parallélogramme. L’inverse est faux — un
              parallélogramme n’est pas forcément un rectangle. Une propriété du parallélogramme
              vaut donc pour <em>tous</em> les autres.
            </div>
          </div>
        ),
      },
    ],

    /* M7 — L'aire, après le cisaillement. */
    7: [
      {
        id: 'aire-parallelogramme',
        type: 'formules',
        title: 'L’aire : base × hauteur',
        summary: 'L’aire d’un parallélogramme est le produit d’une base par la hauteur correspondante — la distance entre les deux droites parallèles, jamais la longueur du côté oblique.',
        visual: <VisuelAire />,
        visualSize: 'lg',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-rose-200 p-4 text-center space-y-1">
              <div className="text-xl font-black text-rose-700">Aire = base × hauteur</div>
              <div className="text-sm text-slate-600">
                la hauteur se mesure <strong>perpendiculairement</strong> à la base.
              </div>
            </div>
            <div className="bg-white rounded-xl border-2 border-orange-200 p-3 text-sm">
              <strong className="text-orange-800">Le piège :</strong> multiplier la base par le{' '}
              <em>côté</em>. En faisant glisser le sommet, le côté s’allonge autant qu’on veut sans
              que l’aire bouge d’un cm² : le côté ne peut donc pas être dans la formule.
            </div>
            <p className="text-sm text-slate-600">
              N’importe lequel des côtés peut servir de base — à condition de prendre{' '}
              <strong>la hauteur qui lui correspond</strong>. Les deux calculs donnent la même
              aire.
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le sommet qui glisse sur son rail, et l’aire qui ne bouge pas.</div>
          </div>
        ),
      },
    ],
  },
};
