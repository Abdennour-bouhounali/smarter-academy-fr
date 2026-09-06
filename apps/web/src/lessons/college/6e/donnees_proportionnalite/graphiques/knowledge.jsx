import React from 'react';
import { MiniGrid } from '../../../../common/knowledge6e';
import { MiniGraph, MiniPlane } from '../../../../common/knowledge';

/**
 * Connaissances de la leçon « Graphiques » (6e) — SOURCE UNIQUE de vérité
 * (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à
 * l'instant où le geste vient de lui donner un sens, puis il reste sur la
 * carte. Rien n'est réécrit dans les modules : la brique et la carte montrent
 * le même texte.
 *
 * ORDRE — un item n'emploie QUE le vocabulaire déjà posé à son module ou
 * avant (docs/architecture/KNOWLEDGE_DEPENDENCY.md) :
 *
 *   M1  ce qu'un graphique apporte qu'un tableau n'apporte pas
 *   M2  l'axe gradué, la graduation, l'échelle, et LIRE une hauteur
 *   M3  la hauteur EST le nombre : une seule donnée, deux rendus
 *   M4  maximum et minimum, l'écart chiffré, le diagramme circulaire
 *   M5  l'évolution, hauteur d'un point ≠ pente d'un segment, ne pas inventer
 *   M6  l'axe tronqué, les graduations irrégulières, la vérification en trois
 *       questions
 *
 * Les mots « maximum » et « minimum » n'apparaissent donc dans aucun item —
 * ni dans aucune demande — avant M4, où ils sont posés ; « axe tronqué » est
 * posé en M6, avant l'épreuve du test final qui l'emploie.
 */

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

const Piege = ({ children }) => (
  <p className="text-xs text-rose-600">⚠️ {children}</p>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ── M1 — Le déclencheur : la comparaison devient immédiate. ── */
    1: [
      {
        id: 'graphique-outil',
        type: 'concepts',
        title: 'À quoi sert un graphique',
        summary: 'Il remplace chaque nombre par une hauteur, pour que l’œil compare à la place du calcul.',
        visual: (
          <MiniGraph
            width={215} height={130}
            xMin={0} xMax={6} yMin={0} yMax={26}
            points={[{ x: 1, y: 16 }, { x: 2, y: 11 }, { x: 3, y: 17 }, { x: 4, y: 24 }, { x: 5, y: 20 }]}
            functions={[]}
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Dans un tableau, comparer cinq nombres demande de les lire un par un. Sur un dessin, la
              plus grande hauteur se voit <strong>sans lire aucun nombre</strong>.
            </p>
            <Piege>
              En échange, on perd en précision : sur un dessin, une valeur se lit à peu près. Le
              graphique ne remplace donc pas le tableau, il l’accompagne.
            </Piege>
            <Souvenir>la semaine météo, cherchée dans le tableau puis vue d’un coup d’œil en barres.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M2 — Ce qui fait qu'un dessin devient lisible. ── */
    2: [
      {
        id: 'axe-gradue',
        type: 'vocabulaire',
        title: 'L’axe gradué et ses graduations',
        summary: 'Le trait vertical portant des nombres régulièrement espacés : c’est lui qui donne une valeur aux hauteurs.',
        visual: (
          <MiniGrid
            cols={4} rows={5} cell={17}
            rowLabels={['20', '15', '10', '5', '0']}
            colLabels={['Lun', 'Mar', 'Mer', 'Jeu']}
            filled={[{ r: 1, c: 0 }, { r: 2, c: 0 }, { r: 3, c: 0 }, { r: 4, c: 0 },
                     { r: 3, c: 1 }, { r: 4, c: 1 },
                     { r: 2, c: 2 }, { r: 3, c: 2 }, { r: 4, c: 2 },
                     { r: 0, c: 3 }, { r: 1, c: 3 }, { r: 2, c: 3 }, { r: 3, c: 3 }, { r: 4, c: 3 }]}
            color="#0ea5e9"
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Les nombres écrits le long de l’axe sont les <strong>graduations</strong>. Avec le titre,
              l’unité et les étiquettes du bas, ce sont les quatre choses qui font qu’un dessin de barres
              devient un graphique.
            </p>
            <Piege>
              Sans graduations, on peut encore dire quelle barre est la plus haute — mais plus jamais
              combien elle vaut. Comparer, oui ; mesurer, non.
            </Piege>
            <Souvenir>les quatre barres grises dont aucune valeur n’était lisible.</Souvenir>
          </div>
        ),
      },
      {
        id: 'lire-hauteur',
        type: 'methodes',
        title: 'Lire la valeur d’une barre',
        summary: 'Suivre le sommet de la barre horizontalement jusqu’à l’axe gradué.',
        visual: (
          <MiniPlane
            width={200} height={140}
            xMin={0} xMax={4} yMin={0} yMax={4}
            segments={[{ from: { x: 2, y: 3 }, to: { x: 0, y: 3 }, color: '#0ea5e9', dashed: true }]}
            points={[{ x: 2, y: 3, label: 'sommet' }]}
          />
        ),
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1 text-sm text-slate-600">
              <div>① je pose le doigt sur le sommet de la barre</div>
              <div>② je le fais glisser à l’horizontale jusqu’à l’axe</div>
              <div>③ je lis la graduation qu’il atteint</div>
            </div>
            <p>
              Quand le sommet tombe <strong>entre</strong> deux graduations, on regarde s’il est au
              milieu, un peu au-dessus, un peu en dessous — et on estime.
            </p>
            <Souvenir>la barre du mercredi que tu as touchée, et le 17 lu sur l’axe.</Souvenir>
          </div>
        ),
      },
      {
        id: 'echelle-axe',
        type: 'regles',
        title: 'L’échelle de l’axe',
        summary: 'Entre deux graduations voisines, l’écart est toujours le même — c’est ce qui rend les hauteurs comparables.',
        visual: (
          <MiniGrid
            cols={3} rows={6} cell={16}
            rowLabels={['30', '25', '20', '15', '10', '5']}
            color="#38bdf8"
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Ici les graduations vont <strong>de 5 en 5</strong>. Monter d’un cran vaut donc toujours
              5, du bas de l’axe jusqu’en haut. C’est cet écart constant qu’on appelle l’échelle.
            </p>
            <p className="text-xs text-slate-500">
              Elle change d’un graphique à l’autre : de 1 en 1, de 10 en 10, de 100 en 100. On la lit
              avant toute chose, sur l’axe.
            </p>
            <Souvenir>l’article B dont le sommet tombait sur la graduation du milieu, entre 20 et 30.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M3 — Une seule donnée, deux rendus. ── */
    3: [
      {
        id: 'hauteur-est-nombre',
        type: 'concepts',
        title: 'La hauteur EST le nombre',
        summary: 'Tableau et graphique ne sont pas deux dessins : c’est la même donnée, montrée deux fois.',
        visual: (
          <div className="flex items-center gap-3">
            <MiniGrid cols={3} rows={1} cell={22} colLabels={['16', '11', '24']} color="#10b981" />
            <span className="text-slate-400 text-sm">↔</span>
            <MiniGrid
              cols={3} rows={4} cell={15}
              filled={[{ r: 1, c: 0 }, { r: 2, c: 0 }, { r: 3, c: 0 },
                       { r: 2, c: 1 }, { r: 3, c: 1 },
                       { r: 0, c: 2 }, { r: 1, c: 2 }, { r: 2, c: 2 }, { r: 3, c: 2 }]}
              color="#10b981"
            />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <p>
              Changer une case du tableau fait bouger <strong>une seule</strong> barre — la sienne. Et
              tirer une barre réécrit <strong>une seule</strong> case. Les deux ne peuvent pas se
              contredire.
            </p>
            <Piege>
              Si une barre ne correspond pas à la donnée du tableau, ce n’est pas une variante : c’est
              une erreur de représentation.
            </Piege>
            <Souvenir>la barre du jeudi que tu as fait monter à 24, et la case qui a suivi toute seule.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M4 — Les extrêmes, l'écart chiffré, et une autre forme. ── */
    4: [
      {
        id: 'maximum-minimum',
        type: 'vocabulaire',
        title: 'Maximum et minimum',
        summary: 'La plus grande valeur d’une série s’appelle son maximum, la plus petite son minimum.',
        visual: (
          <MiniGrid
            cols={5} rows={5} cell={15}
            colLabels={['L', 'M', 'M', 'J', 'V']}
            filled={[{ r: 2, c: 0 }, { r: 3, c: 0 }, { r: 4, c: 0 },
                     { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 2, c: 1 }, { r: 3, c: 1 }, { r: 4, c: 1 },
                     { r: 4, c: 2 },
                     { r: 1, c: 3 }, { r: 2, c: 3 }, { r: 3, c: 3 }, { r: 4, c: 3 },
                     { r: 3, c: 4 }, { r: 4, c: 4 }]}
            color="#8b5cf6"
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Sur un diagramme en barres, le maximum est la barre la plus <strong>haute</strong>, le
              minimum la plus <strong>courte</strong>. On les repère sans lire un seul nombre — c’est
              exactement ce que le graphique fait mieux qu’un tableau.
            </p>
            <p className="text-xs text-slate-500">
              Ensuite seulement on revient à l’axe pour dire <em>combien</em> ils valent.
            </p>
            <Souvenir>le mardi le plus fréquenté et le mercredi le plus calme, touchés du doigt.</Souvenir>
          </div>
        ),
      },
      {
        id: 'ecart-chiffre',
        type: 'methodes',
        title: 'Chiffrer un écart',
        summary: 'Dire « c’est plus haut » ne suffit pas : l’écart se calcule en soustrayant la petite valeur de la grande.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm">
              <span className="font-mono font-bold">45 − 15 = 30</span>
              <span className="text-slate-500 ml-3">30 élèves de plus le mardi</span>
            </div>
            <Piege>
              45 + 15 = 60 répond à une autre question — « combien en tout ». Un écart se{' '}
              <strong>soustrait</strong>, jamais ne s’additionne.
            </Piege>
            <Souvenir>les deux barres extrêmes du CDI, dont tu as chiffré la différence.</Souvenir>
          </div>
        ),
      },
      {
        id: 'diagramme-circulaire',
        type: 'concepts',
        title: 'Le diagramme circulaire',
        summary: 'Un disque partagé en parts : chaque part montre quelle portion du groupe entier elle représente.',
        visual: (
          <MiniGrid cols={4} rows={2} cell={20} colLabels={['Foot', 'Danse', 'Éch', 'Thé']} filled={[{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 0, c: 1 }]} color="#f59e0b" />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Il ne répond pas à la même question que les barres. Les barres comparent des quantités
              entre elles ; le disque dit <strong>quelle part du tout</strong> chacune occupe.
            </p>
            <p className="text-xs text-slate-500">
              La moitié du disque, c’est la moitié du groupe — 12 élèves sur 24, quel que soit le
              nombre de parts.
            </p>
            <Souvenir>la part du foot, exactement la moitié du disque.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M5 — L'évolution : ce que des barres isolées montrent mal. ── */
    5: [
      {
        id: 'evolution-hausse-baisse',
        type: 'concepts',
        title: 'Hausse et baisse',
        summary: 'Relier les points fait apparaître le mouvement : d’une valeur à la suivante, ça monte ou ça descend.',
        visual: (
          <MiniGraph
            width={215} height={130}
            xMin={0} xMax={6} yMin={0} yMax={26}
            functions={[]}
            points={[{ x: 1, y: 16 }, { x: 2, y: 11 }, { x: 3, y: 17 }, { x: 4, y: 24 }, { x: 5, y: 20 }]}
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              On compare toujours à la valeur <strong>précédente</strong>, jamais dans l’absolu. Passer
              de 24 à 20 est une baisse, même si 20 reste une belle température.
            </p>
            <Piege>
              « C’est encore élevé, donc ça ne baisse pas » est l’erreur classique. Une baisse se juge
              au mouvement, pas à la hauteur atteinte.
            </Piege>
            <Souvenir>les quatre passages de la semaine, dont le dernier redescendait.</Souvenir>
          </div>
        ),
      },
      {
        id: 'hauteur-vs-pente',
        type: 'regles',
        title: 'Hauteur d’un point, pente d’un segment',
        summary: 'La valeur la plus grande et la plus forte montée sont deux lectures différentes.',
        visual: (
          <MiniPlane
            width={210} height={140}
            xMin={0} xMax={5} yMin={0} yMax={5}
            segments={[{ from: { x: 1, y: 1 }, to: { x: 2, y: 4 }, color: '#f59e0b' }]}
            points={[{ x: 4, y: 4, label: 'haut' }]}
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              La <strong>hauteur</strong> d’un point répond à « quelle valeur ? ». La{' '}
              <strong>pente</strong> du segment qui y mène répond à « de combien a-t-elle changé ? ».
            </p>
            <p className="text-xs text-slate-500">
              Elles peuvent tomber sur le même moment — c’est le cas de la semaine météo — mais rien ne
              l’oblige : une petite valeur peut arriver après une très forte montée.
            </p>
            <Souvenir>le jeudi, à la fois le plus chaud et l’arrivée du saut le plus raide.</Souvenir>
          </div>
        ),
      },
      {
        id: 'interpreter-sans-inventer',
        type: 'regles',
        title: 'Un graphique dit ce qui a été mesuré',
        summary: 'Ni la cause, ni la suite : seulement les relevés qui y figurent.',
        body: (
          <div className="space-y-2">
            <p>
              Une ligne qui monte prouve que la grandeur a augmenté. Elle ne dit pas{' '}
              <strong>pourquoi</strong>, et elle ne dit rien de ce qui n’a pas encore été mesuré.
            </p>
            <Piege>
              Prolonger la ligne « au feeling » pour prédire la semaine suivante, c’est inventer une
              donnée. Elle n’existe nulle part sur le dessin.
            </Piege>
            <Souvenir>le plant de haricot, dont on savait la croissance mais pas l’arrosage.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M6 — L'erreur enseigne : trois trucages, trois vérifications. ── */
    6: [
      {
        id: 'axe-tronque',
        type: 'regles',
        title: 'L’axe tronqué',
        summary: 'Un axe qui ne part pas de zéro n’affiche qu’une tranche : les hauteurs ne se comparent plus.',
        visual: (
          <div className="flex items-end gap-4">
            <MiniGrid cols={2} rows={4} cell={16} rowLabels={['100', '98', '96', '95']}
              filled={[{ r: 3, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 2, c: 1 }, { r: 3, c: 1 }]} color="#f43f5e" />
            <MiniGrid cols={2} rows={5} cell={16} rowLabels={['100', '75', '50', '25', '0']}
              filled={[{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 3, c: 0 }, { r: 4, c: 0 },
                       { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 2, c: 1 }, { r: 3, c: 1 }, { r: 4, c: 1 }]} color="#10b981" />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <p>
              À gauche, l’axe démarre à 95 : on ne dessine plus que les cinq derniers pour-cent, et un
              écart de 4 points paraît écrasant. À droite, le même écart depuis 0 devient presque
              invisible — c’est la vérité.
            </p>
            <Piege>
              Les nombres du graphique tronqué sont pourtant <strong>exacts</strong>. C’est le dessin
              qui trompe, pas les données : c’est ce qui rend ce trucage si efficace.
            </Piege>
            <Souvenir>la publicité qui comparait 96 % et 100 %, puis le même écart redessiné depuis 0.</Souvenir>
          </div>
        ),
      },
      {
        id: 'graduations-regulieres',
        type: 'regles',
        title: 'Des graduations irrégulières',
        summary: 'Si des écarts différents occupent la même distance, les hauteurs ne veulent plus rien dire.',
        visual: (
          <MiniGrid cols={2} rows={5} cell={17} rowLabels={['100', '50', '10', '5', '0']} color="#f43f5e" />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Sur cet axe, monter d’un cran vaut tantôt 5, tantôt 40, tantôt 50. L’échelle n’est plus
              constante : deux barres de hauteur double ne représentent plus des valeurs doubles.
            </p>
            <Souvenir>l’axe 0, 5, 10, 50, 100 dont les crans étaient tous espacés pareil.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mem-verifier-graphique',
        type: 'memoriser',
        title: '⭐ Trois questions avant de croire un graphique',
        summary: 'L’axe part-il de zéro ? Les graduations sont-elles régulières ? Les hauteurs collent-elles aux données ?',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1.5 text-center">
              <div className="text-sm font-black text-rose-700">① l’axe part-il de ZÉRO ?</div>
              <div className="text-sm font-black text-rose-700">② les graduations sont-elles RÉGULIÈRES ?</div>
              <div className="text-sm font-black text-rose-700">③ les hauteurs collent-elles aux DONNÉES ?</div>
            </div>
            <p className="text-xs text-slate-500">
              Trois secondes de vérification, et aucune publicité ne peut plus te faire voir une
              montagne là où il n’y a qu’une marche.
            </p>
          </div>
        ),
      },
    ],
  },
};
