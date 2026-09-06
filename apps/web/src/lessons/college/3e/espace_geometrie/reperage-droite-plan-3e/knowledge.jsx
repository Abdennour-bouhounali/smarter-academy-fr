import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de la leçon « Repérage sur une droite et dans le plan » (3e) —
 * SOURCE UNIQUE de vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à l'instant
 * où le geste vient de lui donner du sens, puis il reste sur la carte de
 * l'élève.
 *
 * ORDRE. L'abscisse sur la droite (M1) avant le couple du plan (M2) ; les deux
 * rôles avant la lecture par projection (M3) ; la lecture avant le placement
 * et le déplacement (M4) ; et les longueurs (M5) une fois seulement que lire
 * et placer sont acquis. Le module 6 ne rajoute rien : il RANGE, avec la
 * règle des cas limites que les gestes ont produite.
 */

const Fig = ({ children, caption }) => (
  <div className="space-y-1">
    <svg viewBox="0 0 200 140" width="200" height="140" role="img" aria-label={caption}>
      {children}
    </svg>
    <p className="text-xs text-slate-500 text-center">{caption}</p>
  </div>
);

/** Un petit repère à quatre quadrants, réutilisé par plusieurs visuels. */
const Axes = () => (
  <>
    <line x1="10" y1="70" x2="190" y2="70" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="100" y1="10" x2="100" y2="130" stroke="#94a3b8" strokeWidth="1.5" />
    <circle cx="100" cy="70" r="3" fill="#0f172a" />
  </>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Sur une ligne, un seul nombre suffit : encore faut-il qu'il porte
       le côté. */
    1: [
      {
        id: 'abscisse-droite',
        type: 'vocabulaire',
        title: 'L’abscisse d’un point sur une droite graduée',
        summary: 'C’est le nombre relatif qui repère le point : sa valeur donne la distance au zéro, son signe donne le côté.',
        visual: (
          <Fig caption="Le banc a pour abscisse −4">
            <line x1="10" y1="70" x2="190" y2="70" stroke="#94a3b8" strokeWidth="2" />
            {[-6, -4, -2, 0, 2, 4, 6].map((v) => (
              <g key={v}>
                <line x1={100 + v * 14} y1="64" x2={100 + v * 14} y2="76" stroke="#94a3b8" strokeWidth="1.5" />
                <text x={100 + v * 14} y="92" fontSize="10" fill="#64748b" textAnchor="middle">
                  {v < 0 ? `−${-v}` : v}
                </text>
              </g>
            ))}
            <circle cx="44" cy="70" r="5" fill="#4f46e5" />
            <text x="44" y="56" fontSize="11" fill="#4f46e5" textAnchor="middle" fontWeight="bold">−4</text>
            <text x="100" y="52" fontSize="12" textAnchor="middle">⛲</text>
          </Fig>
        ),
        body: (
          <div className="space-y-2">
            <p>« À 3 de la fontaine » laisse <strong>deux</strong> endroits possibles : un de chaque
            côté du zéro. Une distance seule ne désigne rien.</p>
            <p>Le nombre relatif tranche : sa <strong>valeur</strong> dit à quelle distance du zéro,
            son <strong>signe</strong> dit de quel côté — négatif à gauche, positif à droite.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le rendez-vous raté, puis
            le banc posé sur la graduation −4.</div>
          </div>
        ),
      },
      {
        id: 'abscisse-non-entiere',
        type: 'regles',
        title: 'Une abscisse n’est pas forcément entière',
        summary: 'Un point posé entre deux graduations a une abscisse décimale : c’est la position qui compte, pas la graduation la plus proche.',
        body: (
          <div className="space-y-2">
            <p>Entre les graduations −3 et −2, il y a une infinité de positions. Celle du milieu a
            pour abscisse <strong>−2,5</strong> — on ne l’arrondit pas à −3.</p>
            <p className="text-xs text-slate-500">Le signe se lit toujours de la même façon : la
            partie négative de la droite reste à gauche du zéro.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : l’arbre 🌳, à mi-chemin
            entre deux graduations.</div>
          </div>
        ),
      },
    ],

    /* M2 — L'idée centrale de la leçon, découverte par deux réglages séparés. */
    2: [
      {
        id: 'repere-plan',
        type: 'concepts',
        title: 'Le repère du plan : deux axes, deux nombres',
        summary: 'Une ligne se repère avec un nombre ; une surface en demande deux, un par direction.',
        visual: (
          <Fig caption="Deux axes qui se croisent, et un point M">
            <Axes />
            <line x1="156" y1="70" x2="156" y2="28" stroke="#c7d2fe" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="100" y1="28" x2="156" y2="28" stroke="#c7d2fe" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="156" cy="28" r="5" fill="#4f46e5" />
            <text x="164" y="24" fontSize="12" fill="#4f46e5" fontWeight="bold">M</text>
            <text x="176" y="86" fontSize="10" fill="#64748b">horizontal</text>
            <text x="106" y="20" fontSize="10" fill="#64748b">vertical</text>
          </Fig>
        ),
        body: (
          <div className="space-y-2">
            <p>Deux axes gradués se croisent : un <strong>horizontal</strong>, un
            <strong> vertical</strong>. Leur point d’intersection est le zéro des deux.</p>
            <p>Un point du plan est alors repéré par un <strong>couple</strong> de deux nombres —
            un par direction, et jamais un seul.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : sur l’allée un nombre
            suffisait ; dans le parc entier, non.</div>
          </div>
        ),
      },
      {
        id: 'abscisse-ordonnee',
        type: 'vocabulaire',
        title: 'Abscisse et ordonnée : deux rôles, deux directions',
        summary: 'Dans le couple (x ; y), x est l’abscisse — elle commande l’horizontal — et y est l’ordonnée, qui commande le vertical.',
        body: (
          <div className="space-y-2">
            <p>Le <strong>premier</strong> nombre du couple, l’<strong>abscisse</strong>, ne
            déplace le point qu’horizontalement : à droite s’il augmente, à gauche s’il diminue.</p>
            <p>Le <strong>second</strong>, l’<strong>ordonnée</strong>, ne le déplace que
            verticalement : vers le haut s’il augmente, vers le bas s’il diminue.</p>
            <p className="text-xs text-slate-500">On les sépare par un point-virgule :
            <strong> (x ; y)</strong>. Chacun a sa direction, et une seule.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : un seul réglage bougeait
            le point, l’autre le laissait sur sa ligne.</div>
          </div>
        ),
      },
      {
        id: 'ordre-du-couple',
        type: 'memoriser',
        title: '⭐ L’ordre du couple n’est pas une convention d’écriture',
        summary: 'Échanger les deux nombres donne un autre point, parce que chacun commande une autre direction.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-2 text-center">
            <div className="text-base font-black text-rose-700">(2 ; −3) ≠ (−3 ; 2)</div>
            <p className="text-xs text-rose-700">Le premier est en bas à droite, le second en haut
            à gauche. Ce n’est pas « la même chose écrite autrement » : c’est un autre endroit du
            parc.</p>
          </div>
        ),
      },
      {
        id: 'quadrant',
        type: 'vocabulaire',
        title: 'Les quatre quadrants',
        summary: 'Les deux axes découpent le plan en quatre zones ; le couple de signes dit dans laquelle on se trouve.',
        visual: (
          <Fig caption="Les quatre quadrants et leurs signes">
            <Axes />
            <text x="145" y="45" fontSize="11" fill="#0f172a" textAnchor="middle">(+ ; +)</text>
            <text x="55" y="45" fontSize="11" fill="#0f172a" textAnchor="middle">(− ; +)</text>
            <text x="55" y="105" fontSize="11" fill="#0f172a" textAnchor="middle">(− ; −)</text>
            <text x="145" y="105" fontSize="11" fill="#0f172a" textAnchor="middle">(+ ; −)</text>
          </Fig>
        ),
        body: (
          <div className="space-y-2">
            <p>Les deux axes partagent le plan en quatre parties, appelées
            <strong> quadrants</strong>. Le couple de signes suffit à savoir laquelle : abscisse
            positive à droite, ordonnée positive en haut.</p>
            <p className="text-xs text-slate-500">Un point posé <em>sur</em> un axe n’est dans aucun
            quadrant : une de ses coordonnées vaut 0.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le fantôme gris du couple
            inversé, qui atterrissait dans une autre zone.</div>
          </div>
        ),
      },
    ],

    /* M3 — Lire, c'est projeter. */
    3: [
      {
        id: 'lire-par-projection',
        type: 'methodes',
        title: 'Lire un point : projeter sur chaque axe',
        summary: 'On descend le point sur l’axe horizontal pour l’abscisse, on le rabat sur l’axe vertical pour l’ordonnée.',
        visual: (
          <Fig caption="Deux projections, deux coordonnées">
            <Axes />
            <line x1="58" y1="42" x2="58" y2="70" stroke="#059669" strokeWidth="2" strokeDasharray="4 3" />
            <line x1="58" y1="42" x2="100" y2="42" stroke="#059669" strokeWidth="2" strokeDasharray="4 3" />
            <circle cx="58" cy="42" r="5" fill="#059669" />
            <circle cx="58" cy="70" r="4" fill="#0f172a" />
            <circle cx="100" cy="42" r="4" fill="#0f172a" />
            <text x="52" y="88" fontSize="11" fill="#0f172a" textAnchor="middle">−3</text>
            <text x="110" y="46" fontSize="11" fill="#0f172a">2</text>
            <text x="42" y="36" fontSize="12" fill="#059669" fontWeight="bold">K</text>
          </Fig>
        ),
        body: (
          <div className="space-y-2">
            <p>Lire des coordonnées ne se devine pas : on <strong>projette</strong>. Le guide
            vertical se règle sur l’axe horizontal — il donne l’abscisse. Le guide horizontal se
            règle sur l’axe vertical — il donne l’ordonnée.</p>
            <p className="text-xs text-slate-500">C’est le croisement des deux guides qui tombe sur
            le point : deux réglages, deux nombres, dans cet ordre.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les guides amenés sur le
            kiosque 🎪 jusqu’à ce que la cible passe au vert.</div>
          </div>
        ),
      },
      {
        id: 'origine-et-axes',
        type: 'regles',
        title: 'L’origine et les points posés sur un axe',
        summary: 'Le croisement des deux axes est l’origine (0 ; 0) ; un point sur l’axe vertical a une abscisse nulle, sur l’axe horizontal une ordonnée nulle.',
        body: (
          <div className="space-y-2">
            <p>Le point où les deux axes se croisent s’appelle l’<strong>origine</strong> du repère.
            Il a bien des coordonnées : <strong>(0 ; 0)</strong>.</p>
            <p>Un point situé <strong>sur l’axe vertical</strong> n’a subi aucun décalage
            horizontal : son abscisse vaut 0. Sur l’axe horizontal, c’est l’ordonnée qui vaut 0.</p>
            <p className="text-xs text-slate-500">« Zéro » n’est pas « pas de coordonnée » : c’est
            une coordonnée comme une autre.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la fontaine ⛲ au centre,
            et le grand chêne 🌳 posé sur l’axe vertical.</div>
          </div>
        ),
      },
    ],

    /* M4 — Le sens inverse : du couple au point, puis le déplacement. */
    4: [
      {
        id: 'placer-un-point',
        type: 'methodes',
        title: 'Placer un point à partir de son couple',
        summary: 'On part de l’origine, on se décale de x horizontalement, puis de y verticalement.',
        body: (
          <div className="space-y-2">
            <p>Placer M (x ; y), c’est effectuer <strong>deux décalages depuis l’origine</strong> :
            d’abord x le long de l’axe horizontal, ensuite y le long du vertical.</p>
            <p className="text-xs text-slate-500">C’est exactement l’inverse de la lecture : là on
            projetait, ici on avance.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : A posé en (−4 ; 3), quatre
            à gauche puis trois vers le haut.</div>
          </div>
        ),
      },
      {
        id: 'deplacement-coordonnees',
        type: 'regles',
        title: 'Un déplacement s’ajoute coordonnée par coordonnée',
        summary: 'Avancer de a horizontalement et de b verticalement, c’est ajouter a à l’abscisse et b à l’ordonnée — séparément.',
        body: (
          <div className="space-y-2">
            <p>Depuis un point, un déplacement se lit sur chaque coordonnée <strong>sans les
            mélanger</strong> : l’abscisse reçoit le décalage horizontal, l’ordonnée le vertical.</p>
            <p>Pour retrouver le déplacement entre deux points, on calcule
            <strong> arrivée − départ</strong> sur chaque coordonnée. Un résultat négatif veut dire
            « vers la gauche » ou « vers le bas ».</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : partir de (−3 ; −1),
            avancer de 5 et monter de 3, sans que la cible soit affichée.</div>
          </div>
        ),
      },
    ],

    /* M5 — Les coordonnées deviennent un instrument de mesure. */
    5: [
      {
        id: 'longueur-axe',
        type: 'formules',
        title: 'La longueur d’un segment horizontal ou vertical',
        summary: 'Si une seule coordonnée change, la longueur est l’écart de celle-là, pris positivement.',
        body: (
          <div className="space-y-3">
            <p>Deux points de <strong>même ordonnée</strong> : le segment est horizontal, et</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$AB = |x_B - x_A|$'}</MathText>
            </div>
            <p>Deux points de <strong>même abscisse</strong> : le segment est vertical, et
            {' '}<MathText>{'$AB = |y_B - y_A|$'}</MathText>.</p>
            <p className="text-xs text-slate-500">Les deux soustractions possibles donnent le même
            nombre au signe près : une longueur, elle, est toujours positive.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : B glissé jusqu’à ce que
            l’étiquette affiche 7.</div>
          </div>
        ),
      },
      {
        id: 'milieu-moyenne',
        type: 'formules',
        title: 'Le milieu, coordonnée par coordonnée',
        summary: 'Chaque coordonnée du milieu est la moyenne des deux coordonnées correspondantes.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$x_I = \\dfrac{x_A + x_B}{2}$'}</MathText>
              <span className="mx-3" />
              <MathText>{'$y_I = \\dfrac{y_A + y_B}{2}$'}</MathText>
            </div>
            <p className="text-xs text-slate-500">Aucune mesure, aucun compas : le milieu se calcule
            comme deux moyennes indépendantes.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le banc planté à
            mi-chemin du kiosque et du manège.</div>
          </div>
        ),
      },
      {
        id: 'limite-oblique',
        type: 'memoriser',
        title: '⭐ La limite honnête de la méthode',
        summary: 'Si les DEUX coordonnées changent, le segment est oblique : l’écart d’une seule coordonnée ne donne pas sa longueur.',
        body: (
          <div className="rounded-xl bg-amber-50 border-2 border-amber-200 p-4 space-y-2">
            <p className="text-sm text-amber-900 text-center font-bold">
              Deux coordonnées qui changent ⇒ on ne peut pas conclure ici.
            </p>
            <p className="text-xs text-amber-800">Additionner les deux écarts revient à mesurer un
            trajet en escalier, plus long que le segment droit. La longueur oblique demande le
            théorème de Pythagore — une autre leçon.</p>
          </div>
        ),
      },
    ],

    /* M6 — Rien de neuf : la mise en ordre, plus les cas limites. */
    6: [
      {
        id: 'signe-et-cote',
        type: 'regles',
        title: 'Ce que dit le signe de chaque coordonnée',
        summary: 'L’abscisse décide gauche ou droite, l’ordonnée décide haut ou bas — jamais l’inverse.',
        body: (
          <div className="space-y-2">
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-indigo-900">
                abscisse négative → à <strong>gauche</strong> · positive → à <strong>droite</strong>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                ordonnée négative → <strong>en dessous</strong> · positive → <strong>au-dessus</strong>
              </div>
            </div>
            <p className="text-xs text-slate-500">Un point d’abscisse négative n’est donc pas
            « en bas » : il est à gauche, et son ordonnée seule décide de la hauteur.</p>
          </div>
        ),
      },
    ],

    /* M7 — Les coordonnées comme moyen de PROUVER. */
    7: [
      {
        id: 'prouver-par-coordonnees',
        type: 'methodes',
        title: 'Démontrer avec des coordonnées',
        summary: 'Comparer des coordonnées et des écarts permet d’affirmer une propriété de figure, sans jamais poser de règle sur le dessin.',
        body: (
          <div className="space-y-2">
            <p>Un rectangle à côtés parallèles aux axes se ferme en <strong>recopiant</strong> des
            coordonnées : le quatrième sommet prend l’abscisse de l’un et l’ordonnée de l’autre.</p>
            <p>Un triangle est isocèle si deux de ses côtés ont la même longueur — ce qui se décide
            par le calcul, pas à l’œil : deux figures très ressemblantes peuvent différer.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le triangle 2, qui avait
            l’air isocèle et ne l’était pas.</div>
          </div>
        ),
      },
      {
        id: 'symetrique-axe',
        type: 'regles',
        title: 'Le symétrique par rapport à un axe',
        summary: 'Par rapport à l’axe horizontal, l’ordonnée change de signe et l’abscisse ne bouge pas ; par rapport à l’axe vertical, c’est l’inverse.',
        body: (
          <div className="space-y-2">
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
                axe <strong>horizontal</strong> : (x ; y) devient (x ; −y)
              </div>
              <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-violet-900">
                axe <strong>vertical</strong> : (x ; y) devient (−x ; y)
              </div>
            </div>
            <p className="text-xs text-slate-500">Le point et son symétrique sont à la même distance
            de l’axe, de part et d’autre. C’est la coordonnée PERPENDICULAIRE à l’axe qui se
            retourne.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le reflet du pédalo dans
            l’étang.</div>
          </div>
        ),
      },
    ],
  },
};
