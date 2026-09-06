import React from 'react';
import { MiniGraph } from '../../../../common/knowledge';

/**
 * Connaissances de la leçon « Représentation graphique » (3e) — SOURCE UNIQUE
 * de vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à l'instant
 * où le geste vient de lui donner un sens, puis il reste disponible dans la
 * carte. Rien n'est réécrit dans un module : la brique et la carte montrent le
 * même texte.
 *
 * CE QUE CETTE LEÇON N'ENSEIGNE PAS. « fonction », « image », la notation f(x),
 * « fonction affine » et les rôles de a et de b viennent des trois leçons
 * antérieures du même chapitre (`fonctions-3e`, `fonctions-lineaires-3e`,
 * `fonctions-affines-3e`). Ils sont déclarés en `priorKnowledge` et le module 0
 * les diagnostique. Ce que cette leçon enseigne, c'est la CONSTRUCTION : quelle
 * grandeur sur quel axe, quelle échelle, où tombe un point entre deux
 * graduations, faut-il relier — et comment un graphique peut tromper sans
 * fausser un seul nombre.
 *
 * ORDRE. Un item n'utilise que ce qui est déjà établi au module qui le
 * déclare : la tendance (M1) avant l'échelle (M2), l'échelle avant le placement
 * entre graduations (M3), le placement avant la construction complète (M4), la
 * construction avant la lecture des formes (M5), et les formes avant le
 * diagnostic des graphiques défectueux (M6). Un exemple qui anticiperait le
 * module suivant serait un spoiler, pas une aide — la brique rend ce texte à sa
 * position dans la page.
 */

/** La batterie du module 1 : cinq relevés alignés, qui descendent. */
const batterie = (extra = {}) => (
  <MiniGraph
    width={215} height={150} xMin={0} xMax={6} yMin={0} yMax={110}
    points={[
      { x: 0, y: 100, color: '#059669' },
      { x: 1, y: 80, color: '#059669' },
      { x: 2, y: 60, color: '#059669' },
      { x: 3, y: 40, color: '#059669' },
      { x: 4, y: 20, color: '#059669' },
    ]}
    functions={[{ fn: (x) => 100 - 20 * x, color: '#4f46e5', domain: [0, 5] }]}
    {...extra}
  />
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Un tableau devient une image, et l'image en dit plus que le tableau. */
    1: [
      {
        id: 'ligne-devient-point',
        type: 'concepts',
        title: 'Chaque ligne du tableau devient un point',
        summary: 'Une colonne du tableau donne deux nombres ; ces deux nombres donnent la position d’un point dans le repère.',
        body: (
          <div className="space-y-3">
            <p>Une colonne du tableau porte deux nombres : celui de la ligne du haut se lit sur
            l’axe <strong>horizontal</strong>, celui de la ligne du bas sur l’axe
            <strong> vertical</strong>. Ensemble, ils désignent <strong>un seul point</strong>.</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <span className="font-mono text-slate-800">2 h · 60 %</span>
              <span className="text-slate-500 text-xs"> &nbsp;devient&nbsp; </span>
              <span className="font-mono text-slate-800">le point (2 ; 60)</span>
            </div>
            <p className="text-xs text-slate-500">Autant de colonnes, autant de points. Rien n’est
            inventé et rien n’est perdu : le graphique dit exactement ce que dit le tableau.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la ligne du tableau
            s’allumait en ambre, et tu posais le point correspondant.</div>
          </div>
        ),
      },
      {
        id: 'tendance',
        type: 'concepts',
        title: 'La tendance',
        summary: 'Une fois les points posés, leur allure d’ensemble — la tendance — permet de prévoir au-delà des mesures.',
        visual: batterie(),
        body: (
          <div className="space-y-3">
            <p>Le tableau donne des valeurs isolées. Les points posés, eux, dessinent une
            <strong> allure d’ensemble</strong> : ici cinq points alignés qui descendent
            régulièrement.</p>
            <p>C’est cette allure qu’on appelle la <strong>tendance</strong>. En la prolongeant du
            regard, on répond à une question que le tableau ne pose même pas : à quelle heure la
            charge atteindra-t-elle 0 % ?</p>
            <p className="text-xs text-slate-500">Prolonger reste une <strong>prévision</strong> :
            elle ne vaut que si le rythme observé continue.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le trait prolongé
            touchait l’axe horizontal à 5 h, alors que le tableau s’arrêtait à 4 h.</div>
          </div>
        ),
      },
      {
        id: 'choix-des-axes',
        type: 'regles',
        title: 'Quelle grandeur sur quel axe',
        summary: 'La grandeur dont l’autre dépend va sur l’axe horizontal ; celle qui en dépend va sur l’axe vertical.',
        body: (
          <div className="space-y-3">
            <p>Le choix n’est pas une affaire de goût. Entre deux grandeurs, on cherche
            <strong> laquelle commande l’autre</strong> :</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm">
              le temps passe <span className="text-slate-400">→</span> la charge baisse
            </div>
            <p>Le temps commande, donc le temps va en <strong>abscisse</strong> ; la charge en
            dépend, donc elle va en <strong>ordonnée</strong>.</p>
            <p className="text-xs text-slate-500">Échanger les deux axes ne fabrique pas une
            erreur de calcul : cela raconte l’histoire à l’envers.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le temps en bas, la charge
            à gauche — et la question « qui dépend de qui ? ».</div>
          </div>
        ),
      },
    ],

    /* M2 — L'échelle : ce que vaut un carreau, et d'où part l'axe. */
    2: [
      {
        id: 'echelle-axe',
        type: 'concepts',
        title: 'L’échelle d’un axe',
        summary: 'L’échelle d’un axe, c’est ce que vaut un carreau — et l’endroit d’où l’axe part.',
        body: (
          <div className="space-y-3">
            <p>Deux réglages décrivent entièrement un axe :</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>ce que vaut <strong>un carreau</strong> — le pas entre deux
              <strong> graduations</strong> ;</li>
              <li>la valeur d’où l’axe <strong>part</strong>, en bas.</li>
            </ul>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm">
              un carreau = 4 °C, départ à 0
              <span className="text-slate-400 mx-2">·</span>
              un carreau = 0,5 °C, départ à 17
            </div>
            <p className="text-xs text-slate-500">Ces deux réglages ne touchent à aucun nombre du
            tableau. Ils décident seulement de la <strong>place</strong> qu’occupe l’écart entre
            les valeurs.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux boutons, et la
            même courbe qui passait de presque plate à très pentue.</div>
          </div>
        ),
      },
      {
        id: 'axe-tronque',
        type: 'regles',
        title: 'L’axe tronqué',
        summary: 'Un axe qui ne part pas de 0 grossit l’écart entre les valeurs : rien n’est faux, mais le lecteur non averti est trompé.',
        body: (
          <div className="space-y-3">
            <p>Quand l’axe vertical part d’une valeur autre que 0, le petit écart des données
            occupe toute la hauteur du cadre. La courbe grimpe d’un bord à l’autre alors que la
            variation réelle est minuscule.</p>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
              Ce n’est pas interdit : c’est parfois le seul moyen de voir une petite variation.
              Mais il faut le <strong>signaler</strong>, sinon l’image ment sans qu’un seul chiffre
              soit faux.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : « la salle surchauffe ! »
            pour 2 °C de plus.</div>
          </div>
        ),
      },
      {
        id: 'mem-lire-les-graduations',
        type: 'memoriser',
        title: '⭐ Le réflexe : lire les graduations',
        summary: 'Avant de croire une courbe, regarder d’où part l’axe et combien vaut un carreau.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 text-center space-y-1">
            <div className="text-lg font-black text-rose-700">D’où part l’axe ? Combien vaut un carreau ?</div>
            <p className="text-xs text-rose-700">L’allure d’une courbe dépend de l’échelle. Les
            <strong> nombres</strong>, eux, ne changent jamais : c’est à eux qu’il faut revenir.</p>
          </div>
        ),
      },
    ],

    /* M3 — Placer un point quand le pas ne vaut pas 1. */
    3: [
      {
        id: 'placer-entre-graduations',
        type: 'methodes',
        title: 'Placer une valeur entre deux graduations',
        summary: 'Une valeur qui tombe entre deux graduations se place entre elles, à la bonne fraction du carreau — jamais sur la graduation la plus proche.',
        body: (
          <div className="space-y-3">
            <ol className="list-decimal list-inside space-y-1">
              <li>Repérer entre quelles <strong>graduations</strong> tombe la valeur.</li>
              <li>Regarder ce que vaut <strong>un carreau</strong>.</li>
              <li>Partager le carreau : 12,5 sur un axe de 5 en 5, c’est le
              <strong> milieu</strong> entre 10 et 15.</li>
            </ol>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm">
              10 <span className="text-slate-400">—</span>
              <span className="font-bold text-indigo-700"> 12,5 </span>
              <span className="text-slate-400">—</span> 15
            </div>
            <p className="text-xs text-slate-500">Arrondir à la graduation la plus proche fausse le
            graphique : un point vaut la valeur qu’il représente, pas celle d’à côté.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le tournesol à 7,5 cm et
            à 22,5 cm — deux points au milieu du carreau.</div>
          </div>
        ),
      },
    ],

    /* M4 — Construire : quatre décisions, dans cet ordre. */
    4: [
      {
        id: 'choisir-une-echelle',
        type: 'methodes',
        title: 'Choisir l’échelle avant de placer',
        summary: 'On choisit le pas pour que la plus grande valeur tienne dans le cadre : un pas trop fin ne « zoome » pas, il fait sortir les valeurs.',
        body: (
          <div className="space-y-3">
            <p>Le cadre a un nombre de carreaux fixé. Le pas décide donc de la valeur maximale
            représentable :</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm">
              12 carreaux × 2 par carreau = <strong>24</strong>
              <span className="text-slate-400 mx-2">·</span>
              12 carreaux × 5 par carreau = <strong>60</strong>
            </div>
            <p>Pour des valeurs allant jusqu’à 60, un pas de 2 laisse tout ce qui dépasse 24
            <strong> hors du cadre</strong>. Un pas de 5 fait tout tenir.</p>
            <p className="text-xs text-slate-500">D’où l’ordre : l’échelle <strong>d’abord</strong>,
            les points ensuite. L’inverse oblige à tout recommencer.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : avec 2 par carreau, les
            60 L du réservoir étaient annoncés hors cadre.</div>
          </div>
        ),
      },
      {
        id: 'relier-ou-non',
        type: 'regles',
        title: 'Relier les points, ou non',
        summary: 'On relie quand la grandeur existe aussi entre deux relevés ; on ne relie pas quand il n’y a rien entre les deux.',
        body: (
          <div className="space-y-3">
            <p>Relier, c’est affirmer qu’il existe une valeur <strong>entre</strong> deux relevés.
            La question à se poser est donc : ce point intermédiaire aurait-il un sens ?</p>
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                Un réservoir qui se vide : à 3 min il reste bien un volume. <strong>On relie.</strong>
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">
                Des cahiers vendus par jour : le « jour 1,5 » n’existe pas.
                <strong> On ne relie pas.</strong>
              </div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le trait du réservoir, et
            les ventes laissées en points séparés.</div>
          </div>
        ),
      },
      {
        id: 'mem-quatre-decisions',
        type: 'memoriser',
        title: '⭐ Les quatre décisions',
        summary: 'Les axes, puis l’échelle, puis les points, puis le tracé — dans cet ordre.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 text-center space-y-2">
            <div className="text-lg font-black text-rose-700">axes → échelle → points → tracé</div>
            <p className="text-xs text-rose-700">Change l’une d’elles et le graphique ne raconte
            plus la même chose. Une seule mauvaise décision suffit à le rendre inutilisable.</p>
          </div>
        ),
      },
    ],

    /* M5 — Lire la forme, et la relier à une situation puis à une expression. */
    5: [
      {
        id: 'forme-de-la-courbe',
        type: 'vocabulaire',
        title: 'Croissante, décroissante, constante',
        summary: 'Une courbe qui monte est croissante, une courbe qui descend est décroissante, une horizontale est constante.',
        visual: (
          <MiniGraph
            width={215} height={150} xMin={0} xMax={6} yMin={0} yMax={30}
            functions={[
              { fn: (x) => 4 * x + 2, color: '#4f46e5' },
              { fn: (x) => 26 - 4 * x, color: '#e11d48' },
              { fn: () => 14, color: '#059669' },
            ]}
          />
        ),
        body: (
          <div className="space-y-3">
            <p>Trois mots suffisent à décrire ce que fait une courbe quand on la parcourt de la
            gauche vers la droite :</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>elle monte : la grandeur est <strong>croissante</strong> ;</li>
              <li>elle descend : la grandeur est <strong>décroissante</strong> ;</li>
              <li>elle reste horizontale : la grandeur est <strong>constante</strong>.</li>
            </ul>
            <p className="text-xs text-slate-500">Ces mots portent sur le <strong>sens</strong>, pas
            sur la hauteur : une courbe peut partir très haut et descendre, ou partir très bas et
            monter.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les quatre repères côte à
            côte — une qui monte, une qui descend, une plate, une qui s’accélère.</div>
          </div>
        ),
      },
      {
        id: 'forme-et-situation',
        type: 'methodes',
        title: 'Associer une forme à une situation',
        summary: 'On lit d’abord le sens (monte, descend, reste plat), puis la régularité (rythme constant ou qui s’accélère).',
        body: (
          <div className="space-y-3">
            <p>Pour apparier une courbe et une histoire, on ne regarde ni le décor ni les
            unités — deux questions suffisent :</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Dans quel <strong>sens</strong> va-t-elle ? (croissante, décroissante, constante)</li>
              <li>Le rythme est-il <strong>régulier</strong> — une droite — ou s’accélère-t-il ?</li>
            </ol>
            <p className="text-xs text-slate-500">Une droite qui monte régulièrement et une courbe
            qui se redresse racontent deux histoires différentes, même si toutes deux
            « augmentent ».</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : l’épargne qui s’accélère
            n’était pas le taxi à tarif régulier.</div>
          </div>
        ),
      },
      {
        id: 'forme-et-expression',
        type: 'methodes',
        title: 'De la forme à l’expression',
        summary: 'Le sens d’une droite donne le signe de a ; la hauteur où elle coupe l’axe vertical donne b.',
        body: (
          <div className="space-y-3">
            <p>Une droite est la représentation d’une fonction affine. Deux lectures suffisent à
            retrouver son expression :</p>
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
                Elle <strong>descend</strong> ? Son coefficient est <strong>négatif</strong>.
                Elle monte ? Il est positif.
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                Là où elle <strong>coupe l’axe vertical</strong>, on lit son
                ordonnée à l’origine.
              </div>
            </div>
            <p className="text-xs text-slate-500">Rien de neuf sur les fonctions affines : ce qui
            est neuf, c’est de lire ces deux nombres <strong>sur le dessin</strong>, sans calcul.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le graphique B, qui
            partait de 26 et descendait.</div>
          </div>
        ),
      },
    ],

    /* M6 — Diagnostiquer : quatre défauts, quatre vérifications. */
    6: [
      {
        id: 'echelle-qui-aplatit',
        type: 'regles',
        title: 'L’échelle qui aplatit',
        summary: 'Un axe qui monte bien au-delà des données écrase la courbe : partir de 0 ne suffit pas, encore faut-il que le pas soit adapté.',
        body: (
          <div className="space-y-3">
            <p>C’est le défaut inverse de l’axe tronqué. L’axe part bien de 0, aucun nombre n’est
            faux — mais il monte si haut que les données se tassent en bas du cadre et que la
            variation devient <strong>invisible</strong>.</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm">
              des valeurs autour de 19, un axe jusqu’à 240
            </div>
            <p className="text-xs text-slate-500">Une bonne échelle se choisit en regardant
            l’écart entre la plus petite et la plus grande valeur — l’<strong>étendue</strong> des
            données — et non au hasard.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la même série de
            températures, écrasée sur le bas du cadre.</div>
          </div>
        ),
      },
      {
        id: 'verifier-un-graphique',
        type: 'methodes',
        title: 'Vérifier un graphique avant d’y croire',
        summary: 'Quatre vérifications : d’où part l’axe, qui est en abscisse, les points suivent-ils le tableau, l’échelle est-elle adaptée à l’étendue.',
        body: (
          <div className="space-y-3">
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li><strong>D’où part l’axe vertical ?</strong> → repère un axe tronqué.</li>
              <li><strong>Quelle grandeur est en abscisse ?</strong> → repère des axes inversés.</li>
              <li><strong>Chaque point suit-il le tableau ?</strong> → repère un point égaré.</li>
              <li><strong>L’axe monte-t-il bien au-delà des données ?</strong> → repère une échelle
              inadaptée.</li>
            </ol>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
              Trois de ces quatre défauts n’altèrent <strong>aucun nombre</strong> : des données
              exactes ne suffisent pas à faire un graphique honnête.
            </div>
            <p className="text-xs text-slate-500">Ces vérifications se font <strong>avant</strong>
            de lire la courbe, pas après en avoir tiré une conclusion.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le bureau des
            réclamations, et ses quatre graphiques à réparer.</div>
          </div>
        ),
      },
    ],
  },
};
