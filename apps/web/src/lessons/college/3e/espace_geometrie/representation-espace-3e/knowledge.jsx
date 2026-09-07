import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de la leçon « Représentation de l'espace » (3e) — SOURCE
 * UNIQUE de vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à l'instant
 * où le geste vient de lui donner du sens, puis il reste sur la carte.
 *
 * ORDRE. La projection (M1) avant l'inventaire (M2) — on ne peut pas compter
 * juste tant qu'on n'a pas admis que le dessin cache. Le vocabulaire et le
 * polyèdre (M2) avant la relativité du caché (M3), qui elle-même fonde la
 * méthode « tourner pour identifier » (M4). Les trois vues (M5) sont une autre
 * façon de perdre une dimension ; la perspective cavalière (M6) formalise
 * enfin la convention que l'élève lit depuis le module 1. Le troisième cas de
 * l'espace (M7) vient en dernier : il demande de lire un cube sans hésiter.
 */

const Fig = ({ children, caption }) => (
  <div className="space-y-1">
    <svg viewBox="0 0 200 140" role="img" aria-label={caption} style={{ maxWidth: 200 }} className="w-full h-auto">
      {children}
    </svg>
    <p className="text-xs text-slate-500 text-center">{caption}</p>
  </div>
);

/** Un cube en cavalière, dessiné à la main pour les visuels de la carte. */
const CubeFig = ({ dashed = true }) => {
  const F = [[45, 45], [115, 45], [115, 115], [45, 115]];        // face avant
  const B = F.map(([x, y]) => [x + 35, y - 30]);                  // face arrière
  const seg = (a, b, d) => (
    <line key={`${a}-${b}-${d}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}
      stroke="#0f172a" strokeWidth="2" strokeLinecap="round"
      strokeDasharray={d ? '5 4' : undefined} opacity={d ? 0.45 : 1} />
  );
  return (
    <>
      <polygon points={F.map((p) => p.join(',')).join(' ')} fill="#dbeafe" fillOpacity="0.7" stroke="none" />
      {[0, 1, 2, 3].map((i) => seg(F[i], F[(i + 1) % 4], false))}
      {seg(B[0], B[1], false)}
      {seg(B[1], B[2], false)}
      {seg(F[1], B[1], false)}
      {seg(F[2], B[2], false)}
      {seg(B[2], B[3], dashed)}
      {seg(B[3], B[0], dashed)}
      {seg(F[0], B[0], dashed)}
      {seg(F[3], B[3], false)}
    </>
  );
};

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Le déclencheur : le dessin n'est pas l'objet. */
    1: [
      {
        id: 'dessin-projection',
        type: 'concepts',
        title: 'Un dessin plat est une projection',
        summary: 'Le même solide donne des dessins très différents selon l’endroit d’où on le regarde : le dessin perd de l’information, l’objet ne change pas.',
        visual: (
          <Fig caption="Un seul cube, deux points de vue">
            <g transform="translate(-25,10) scale(0.62)">
              <CubeFig />
            </g>
            <g transform="translate(85,10) scale(0.62) rotate(0)">
              <rect x="45" y="45" width="70" height="70" fill="#dbeafe" fillOpacity="0.7" stroke="#0f172a" strokeWidth="3" />
            </g>
          </Fig>
        ),
        body: (
          <div className="space-y-2">
            <p>Trois dessins très dissemblables peuvent montrer le <strong>même</strong> solide.
            Ce qui change, ce n’est pas l’objet : c’est l’endroit d’où on le regarde.</p>
            <p>Passer du volume à la feuille, c’est <strong>projeter</strong> : une dimension est
            écrasée, et une partie de l’information est perdue.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : tu as tourné le cube
            jusqu’à retrouver chacun des trois dessins du haut.</div>
          </div>
        ),
      },
      {
        id: 'arete-cachee',
        type: 'vocabulaire',
        title: 'Les arêtes cachées, en pointillé',
        summary: 'Le pointillé est la convention du dessin technique : il montre les arêtes qui passent derrière le solide. Elles existent bel et bien.',
        visual: (
          <Fig caption="Trois arêtes passent derrière : elles sont en pointillé">
            <g transform="translate(0,5) scale(0.9)">
              <CubeFig />
            </g>
          </Fig>
        ),
        body: (
          <div className="space-y-2">
            <p>Une arête dessinée en <strong>pointillé</strong> n’est pas une arête absente : elle
            est simplement <strong>derrière</strong> le solide vu d’ici.</p>
            <p className="text-xs text-slate-500">Un cube a toujours 12 arêtes, sous n’importe quel
            angle. Le pointillé sert justement à ne pas les oublier.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les traits pointillés qui
            changeaient pendant que tu tournais.</div>
          </div>
        ),
      },
    ],

    /* M2 — L'inventaire, et ce qui le gouverne. */
    2: [
      {
        id: 'polyedre',
        type: 'vocabulaire',
        title: 'Polyèdre : un solide à faces planes',
        summary: 'Un polyèdre est un solide dont toutes les faces sont plates ; ses faces se rencontrent le long d’arêtes, et ses arêtes en des sommets.',
        body: (
          <div className="space-y-2">
            <p>Cube, pavé droit, prisme et pyramide sont des <strong>polyèdres</strong> : chacune de
            leurs faces est une figure plane, et on peut donc compter leurs arêtes et leurs
            sommets.</p>
            <p>Une boule, un cylindre ou un cône n’en sont pas : leur surface est
            <strong> courbe</strong>. Il n’y a rien à compter de la même façon.</p>
            <p className="text-xs text-slate-500">Un polyèdre est dit <strong>convexe</strong>
            {' '}lorsqu’il n’a aucun creux : tous les solides de cette leçon le sont.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les quatre solides que tu
            as comptés, tous à faces plates.</div>
          </div>
        ),
      },
      {
        id: 'compter-le-cache',
        type: 'methodes',
        title: 'Compter, y compris ce qui est derrière',
        summary: 'Les faces, arêtes et sommets appartiennent au solide, pas au dessin : on compte par familles, sans jamais s’arrêter à ce qu’on voit.',
        body: (
          <div className="space-y-2">
            <p>Compter uniquement les sommets visibles d’un cube donne 7 — et c’est faux : le
            huitième est derrière. Les comptes sont des propriétés de l’<strong>objet</strong>.</p>
            <p>La méthode sûre est de compter <strong>par familles</strong> : la face avant, la face
            arrière, puis ce qui les relie.</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm text-center">
              cube et pavé droit : <strong>6 faces · 12 arêtes · 8 sommets</strong>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le sommet gris pâle,
            derrière, qu’on ne pouvait pas voir mais qu’il fallait compter.</div>
          </div>
        ),
      },
      {
        id: 'relation-euler',
        type: 'formules',
        title: 'La relation d’Euler',
        summary: 'Pour tout polyèdre convexe, faces + sommets − arêtes = 2 — et cela ne vaut pas pour les solides à surface courbe.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$F + S - A = 2$'}</MathText>
            </div>
            <p>Tu viens de la vérifier sur quatre polyèdres très différents : le cube, le pavé
            droit, le prisme et la pyramide donnent tous <strong>2</strong>.</p>
            <p className="text-xs text-slate-500">Elle ne concerne que les polyèdres convexes.
            Une boule n’a ni arête ni sommet : la relation ne lui est pas destinée.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les quatre lignes de
            calcul qui se terminaient toutes par le même nombre.</div>
          </div>
        ),
      },
    ],

    /* M3 — L'idée signature : « caché » qualifie une vue. */
    3: [
      {
        id: 'cache-depend-du-point-de-vue',
        type: 'concepts',
        title: '« Cachée » qualifie la vue, pas l’arête',
        summary: 'Une même arête est tantôt visible, tantôt cachée : son état dépend entièrement de l’endroit d’où l’on regarde.',
        body: (
          <div className="space-y-2">
            <p>Aucune arête n’est « une arête cachée » par nature. Tourne le solide, et la même
            arête passe de <strong>pointillé</strong> à <strong>trait plein</strong>.</p>
            <p>Une arête est visible dès qu’<strong>au moins une</strong> des faces qui la portent
            est tournée vers nous. De face, une seule face du cube est visible : 4 arêtes le sont
            et 8 sont derrière. De trois quarts, trois faces sont visibles et il n’en reste que 3
            cachées.</p>
            <p className="text-xs text-slate-500">Pendant tout ce temps, le solide garde ses 6
            faces, 12 arêtes et 8 sommets.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : l’arête rouge que tu as
            fait changer d’état sans que l’objet bouge.</div>
          </div>
        ),
      },
    ],

    /* M4 — La méthode qui découle du module 3. */
    4: [
      {
        id: 'methode-identifier',
        type: 'methodes',
        title: 'Identifier un solide : tourner, puis compter',
        summary: 'Une seule vue peut être ambiguë ; les comptes de faces, arêtes et sommets, eux, désignent le solide sans hésitation.',
        body: (
          <div className="space-y-2">
            <ol className="list-decimal list-inside space-y-1">
              <li>Changer de point de vue, pour voir ce que la première vue écrasait.</li>
              <li>Compter les faces, les arêtes et les sommets.</li>
              <li>Comparer aux solides connus.</li>
            </ol>
            <p className="text-xs text-slate-500">Deux solides différents peuvent donner le même
            dessin vu de face. Les comptes, eux, ne changent pas quand on tourne.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le solide mystère, dont
            les deux triangles opposés n’apparaissaient qu’en tournant.</div>
          </div>
        ),
      },
    ],

    /* M5 — Décrire sans perspective. */
    5: [
      {
        id: 'trois-vues',
        type: 'concepts',
        title: 'Les trois vues du dessin technique',
        summary: 'De face, de dessus et de côté : chaque vue écrase une dimension différente, et il en faut plusieurs pour décrire un objet sans ambiguïté.',
        visual: (
          <Fig caption="Trois projections d’un même pavé">
            <rect x="15" y="45" width="46" height="34" fill="#ede9fe" stroke="#6d28d9" strokeWidth="2" />
            <text x="38" y="94" fontSize="10" fill="#64748b" textAnchor="middle">de face</text>
            <rect x="77" y="45" width="46" height="24" fill="#ede9fe" stroke="#6d28d9" strokeWidth="2" />
            <text x="100" y="94" fontSize="10" fill="#64748b" textAnchor="middle">de dessus</text>
            <rect x="139" y="45" width="26" height="34" fill="#ede9fe" stroke="#6d28d9" strokeWidth="2" />
            <text x="152" y="94" fontSize="10" fill="#64748b" textAnchor="middle">de côté</text>
          </Fig>
        ),
        body: (
          <div className="space-y-2">
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-purple-900">
                <strong>de face</strong> : largeur et hauteur — la profondeur est écrasée
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-purple-900">
                <strong>de dessus</strong> : largeur et profondeur — la hauteur est écrasée
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-purple-900">
                <strong>de côté</strong> : profondeur et hauteur — la largeur est écrasée
              </div>
            </div>
            <p className="text-xs text-slate-500">Une projection ne garde que deux dimensions sur
            trois. Deux solides différents peuvent partager une même vue : c’est en les croisant
            qu’on lève l’ambiguïté — exactement ce que fait un plan d’architecte.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le carré qu’on retrouvait
            à la fois chez le cube et chez la pyramide.</div>
          </div>
        ),
      },
    ],

    /* M6 — La convention, énoncée après avoir été manipulée. */
    6: [
      {
        id: 'perspective-cavaliere',
        type: 'regles',
        title: 'Les trois règles de la perspective cavalière',
        summary: 'Face avant en vraie grandeur, fuyantes parallèles entre elles et réduites : c’est une convention de dessin, pas une photographie.',
        body: (
          <div className="space-y-3">
            <ol className="list-decimal list-inside space-y-1">
              <li>La face avant — celle qui est parallèle à la feuille — est dessinée en
              <strong> vraie grandeur</strong> : longueurs et angles droits conservés.</li>
              <li>Les <strong>fuyantes</strong>, les arêtes qui s’enfoncent, sont dessinées
              <strong> parallèles entre elles</strong>, à un angle choisi (souvent 45°).</li>
              <li>Elles sont <strong>réduites</strong> par un coefficient (souvent 0,5), et les
              arêtes cachées se dessinent en pointillé.</li>
            </ol>
            <p className="text-xs text-slate-500">Comme les fuyantes restent parallèles, elles ne
            se rejoignent jamais : ce n’est pas la perspective des peintres.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la face bleue qui ne
            bougeait pas, quel que soit le réglage.</div>
          </div>
        ),
      },
      {
        id: 'mem-angles-deformes',
        type: 'memoriser',
        title: '⭐ Ce qu’une perspective déforme',
        summary: 'Seuls les angles droits de la face avant restent droits sur le dessin ; les autres sont déformés, et les fuyantes raccourcies.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-2 text-center">
            <div className="text-base font-black text-rose-700">
              angle droit sur l’objet ≠ angle droit sur la feuille
            </div>
            <p className="text-xs text-rose-700">C’est le prix à payer pour montrer du volume sur
            une surface plane. Un dessin en perspective se lit, il ne se mesure pas.</p>
          </div>
        ),
      },
    ],

    /* M7 — Ce que l'espace ajoute au plan. */
    7: [
      {
        id: 'non-coplanaires',
        type: 'concepts',
        title: 'Le troisième cas : deux droites non coplanaires',
        summary: 'Dans l’espace, deux droites peuvent ne jamais se rencontrer sans être parallèles — il leur suffit de n’appartenir à aucun plan commun.',
        body: (
          <div className="space-y-2">
            <p>Dans le <strong>plan</strong>, deux droites sont soit sécantes, soit parallèles :
            il n’y a pas d’autre cas.</p>
            <p>Dans l’<strong>espace</strong>, il en existe un troisième. Deux droites sont dites
            <strong> non coplanaires</strong> quand aucun plan ne les contient toutes les deux :
            elles ne se coupent jamais, et pourtant elles n’ont pas la même direction.</p>
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                sécantes · parallèles · <strong>non coplanaires</strong>
              </div>
            </div>
            <p className="text-xs text-slate-500">Un cube en offre beaucoup : une arête de la face
            avant et une arête qui part vers l’arrière, par exemple.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux arêtes rouges
            que tu n’as jamais réussi à faire se croiser, sous aucun angle.</div>
          </div>
        ),
      },
    ],
  },
};
