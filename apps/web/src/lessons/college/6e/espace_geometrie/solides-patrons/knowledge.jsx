import React from 'react';
import { MiniFigure, MiniGrid } from '../../../../common/knowledge6e';

/**
 * Connaissances de la leçon « Solides et patrons » (6e) — SOURCE UNIQUE de
 * vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à
 * l'instant où le geste vient de lui donner un sens, puis il reste sur la
 * carte. Rien n'est réécrit dans les modules.
 *
 * ORDRE — un item n'emploie QUE le vocabulaire déjà posé à son module ou
 * avant (docs/architecture/KNOWLEDGE_DEPENDENCY.md) :
 *
 *   M1  un dessin est plat, l'objet a un derrière ; la convention du pointillé
 *   M2  les TROIS mots — face, arête, sommet — puis le pavé droit et le
 *       contrôle « faces + sommets − arêtes = 2 »
 *   M3  le mot PATRON, au moment exact où l'élève déplie ; il y en a onze
 *   M4  le critère du patron impossible — il RÉUTILISE face, arête, patron
 *   M5  la nature des faces distingue deux solides aux mêmes comptes
 *   M6  chaque situation réclame un compte, et un seul
 *
 * Les mots « face », « arête », « sommet » n'apparaissent dans aucun item
 * avant M2, et « patron » avant M3 : c'est précisément ce que cette carte
 * répare — le module 1 parlait d'arêtes avant de les avoir nommées.
 */

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

const Piege = ({ children }) => (
  <p className="text-xs text-rose-600">⚠️ {children}</p>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ── M1 — La boîte mystérieuse : le dessin ment par omission. ── */
    1: [
      {
        id: 'dessin-et-objet',
        type: 'concepts',
        title: 'Le dessin est plat, l’objet ne l’est pas',
        summary:
          'Un dessin sur une feuille ne montre qu’une partie de l’objet : le reste est derrière, et existe quand même.',
        visual: (
          <MiniFigure
            points={[
              { x: 12, y: 30 }, { x: 62, y: 30 }, { x: 62, y: 85 }, { x: 12, y: 85 },
            ]}
            labels={[{ x: 37, y: 20, text: 'ce qu’on voit' }]}
            fill="#e0e7ff"
            stroke="#4f46e5"
            width={150}
            height={100}
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Sur un dessin de boîte, on ne distingue que trois surfaces : le dessus, le devant et un
              côté. La boîte a pourtant un fond, un arrière et un autre côté.
            </p>
            <Piege>
              Compter ce qu’on voit sur le dessin, ce n’est pas compter l’objet. Pour un objet en
              volume, il faut <strong>raisonner</strong>, pas seulement regarder.
            </Piege>
            <Souvenir>les trois surfaces visibles du cube, alors que la boîte en a six.</Souvenir>
          </div>
        ),
      },
      {
        id: 'arete-cachee',
        type: 'regles',
        title: 'Le pointillé montre ce qui est derrière',
        summary:
          'Trait plein : ce qu’on voit. Trait en pointillé : ce qui existe mais reste caché derrière l’objet.',
        visual: (
          <MiniFigure
            points={[
              { x: 15, y: 35 }, { x: 65, y: 35 }, { x: 65, y: 85 }, { x: 15, y: 85 },
            ]}
            labels={[{ x: 85, y: 25, text: '⌐ derrière' }]}
            fill="#eef2ff"
            stroke="#6366f1"
            width={150}
            height={100}
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              C’est la convention du dessin technique, et elle est toujours la même : le pointillé
              n’indique pas une taille ni une matière, seulement une <strong>position</strong> —
              derrière.
            </p>
            <Piege>
              Un trait en pointillé n’est pas plus court qu’un autre, et ce n’est pas une décoration.
              Sur un cube, tous les traits ont exactement la même longueur.
            </Piege>
            <Souvenir>les traits en pointillé du cube, qui rappelaient les côtés cachés.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M2 — Les trois mots. C'est ICI, et pas avant, qu'ils existent. ── */
    2: [
      {
        id: 'face-solide',
        type: 'vocabulaire',
        title: 'Une face',
        summary: 'Une surface plane du solide. Le cube en a 6, y compris le dessous.',
        visual: <MiniGrid cols={3} rows={2} filled={[{ r: 0, c: 1 }]} color="#7dd3fc" />,
        body: (
          <div className="space-y-2">
            <p>
              C’est ce qu’on peindrait, ce qu’on recouvrirait de papier cadeau : une{' '}
              <strong>surface</strong>. Une face a une aire, pas une longueur.
            </p>
            <Piege>
              Le dessin n’en montre que trois. Les trois autres — le fond, l’arrière, l’autre côté —
              comptent tout autant.
            </Piege>
            <Souvenir>le bouton « Faces » du cube, qui allumait les surfaces une à une.</Souvenir>
          </div>
        ),
      },
      {
        id: 'arete',
        type: 'vocabulaire',
        title: 'Une arête',
        summary: 'Le segment où deux faces se rencontrent. Le cube en a 12.',
        visual: (
          <MiniFigure
            points={[{ x: 20, y: 30 }, { x: 80, y: 30 }, { x: 80, y: 85 }, { x: 20, y: 85 }]}
            ticks={[{ edge: 0, count: 1 }]}
            fill="#fef3c7"
            stroke="#d97706"
            width={150}
            height={100}
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              C’est le pli, le bord : un <strong>segment</strong>. C’est là qu’on collerait du ruban
              adhésif pour renforcer une caisse.
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-center text-sm text-slate-600">
              Le cube : <strong>4</strong> arêtes en haut + <strong>4</strong> en bas +{' '}
              <strong>4</strong> verticales = <strong>12</strong>
            </div>
            <Souvenir>le bouton « Arêtes », et les 12 segments qui s’allumaient.</Souvenir>
          </div>
        ),
      },
      {
        id: 'sommet-solide',
        type: 'vocabulaire',
        title: 'Un sommet',
        summary: 'Le point où plusieurs arêtes se rejoignent — un coin. Le cube en a 8.',
        visual: (
          <MiniGrid cols={3} rows={2} nodes={[{ r: 0, c: 0 }, { r: 0, c: 3 }, { r: 2, c: 0 }, { r: 2, c: 3 }]} color="#e9d5ff" />
        ),
        body: (
          <div className="space-y-2">
            <p>
              C’est un <strong>point</strong>, sans longueur ni surface : le coin sur lequel on
              poserait un embout de protection.
            </p>
            <Piege>
              Arête et sommet se confondent facilement. L’arête est un segment (12 sur un cube), le
              sommet est un point (8 sur un cube). Ce ne sont pas les mêmes objets, donc pas les
              mêmes comptes.
            </Piege>
            <Souvenir>le bouton « Sommets », et les 8 coins qui s’allumaient.</Souvenir>
          </div>
        ),
      },
      {
        id: 'pave-droit',
        type: 'vocabulaire',
        title: 'Le pavé droit',
        summary:
          'Un solide à 6 faces rectangulaires, égales deux à deux. Le cube en est le cas particulier où tous les rectangles sont des carrés identiques.',
        visual: (
          <MiniFigure
            points={[{ x: 10, y: 40 }, { x: 78, y: 40 }, { x: 78, y: 80 }, { x: 10, y: 80 }]}
            fill="#ccfbf1"
            stroke="#0d9488"
            width={150}
            height={100}
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              C’est la forme d’une boîte à chaussures. Comme le cube, il a 6 faces, 12 arêtes et
              8 sommets — les <strong>mêmes comptes</strong>.
            </p>
            <Piege>
              Les comptes ne suffisent donc pas à les distinguer : c’est la <em>nature</em> des faces
              qui les sépare — des carrés tous identiques pour le cube, des rectangles pour le pavé.
            </Piege>
            <Souvenir>le deuxième solide de la rangée, celui aux faces rectangulaires.</Souvenir>
          </div>
        ),
      },
      {
        id: 'controle-euler',
        type: 'regles',
        title: 'Un contrôle : faces + sommets − arêtes = 2',
        summary:
          'Sur tout solide à faces planes, ce calcul donne toujours 2. Il sert à vérifier qu’on n’a rien oublié.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm space-y-1">
              <div>cube : 6 + 8 − 12 = <strong>2</strong></div>
              <div>pavé droit : 6 + 8 − 12 = <strong>2</strong></div>
              <div>prisme droit : 5 + 6 − 9 = <strong>2</strong></div>
            </div>
            <p>
              Les trois nombres ne sont pas indépendants. Si ton calcul ne donne pas 2, c’est qu’un
              élément t’a échappé — le plus souvent une face de derrière.
            </p>
            <p className="text-xs text-slate-500">
              Ce contrôle ne vaut que pour les solides dont toutes les faces sont planes : le
              cylindre, qui a une surface courbe, en est exclu.
            </p>
            <Souvenir>le calcul refait sur le cube, puis sur le pavé — et le même 2 à chaque fois.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mem-cube-fas',
        type: 'memoriser',
        title: '⭐ Le cube : 6 faces, 12 arêtes, 8 sommets',
        summary: 'Trois objets de nature différente, donc trois comptes différents.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1.5 text-center">
              <div className="text-sm font-black text-rose-700">6 FACES → des surfaces</div>
              <div className="text-sm font-black text-rose-700">12 ARÊTES → des segments</div>
              <div className="text-sm font-black text-rose-700">8 SOMMETS → des points</div>
            </div>
            <p className="text-xs text-slate-500">
              Le pavé droit porte exactement les mêmes trois nombres.
            </p>
          </div>
        ),
      },
    ],

    /* ── M3 — Le mot « patron », posé au moment du dépliage. ── */
    3: [
      {
        id: 'patron-solide',
        type: 'vocabulaire',
        title: 'Un patron',
        summary:
          'Le solide déplié à plat : autant de cases que de faces, reliées le long des arêtes du pliage.',
        visual: (
          <MiniGrid
            cols={4}
            rows={3}
            filled={[
              { r: 0, c: 1 },
              { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 },
              { r: 2, c: 1 },
            ]}
            color="#c4b5fd"
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Déplier une boîte en carton et l’aplatir sur la table : ce qu’on obtient est son
              patron. Les 6 cases deviendront les 6 faces du cube une fois repliées.
            </p>
            <p className="text-xs text-slate-500">
              L’opération marche dans les deux sens : on déplie un solide en patron, on replie un
              patron en solide.
            </p>
            <Souvenir>les cases que tu as cochées jusqu’à ce que le verdict passe au vert.</Souvenir>
          </div>
        ),
      },
      {
        id: 'onze-patrons',
        type: 'regles',
        title: 'Le cube a onze patrons différents',
        summary:
          'Ce n’est donc pas la FORME du patron qui décide, mais le fait qu’il se replie sans superposition.',
        visual: (
          <div className="flex items-center gap-3">
            <MiniGrid
              cols={4}
              rows={3}
              filled={[
                { r: 0, c: 1 },
                { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 },
                { r: 2, c: 1 },
              ]}
              cell={14}
              color="#c4b5fd"
            />
            <MiniGrid
              cols={4}
              rows={3}
              filled={[
                { r: 0, c: 0 }, { r: 0, c: 1 },
                { r: 1, c: 1 }, { r: 1, c: 2 },
                { r: 2, c: 2 }, { r: 2, c: 3 },
              ]}
              cell={14}
              color="#c4b5fd"
            />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <p>
              La croix en est un, l’escalier aussi, et il en existe neuf autres. On ne les apprend
              donc pas par cœur : on vérifie le pliage.
            </p>
            <Souvenir>les deux patrons côte à côte, tous deux acceptés par le simulateur.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M4 — Le critère, en réutilisant face, arête, patron. ── */
    4: [
      {
        id: 'patron-impossible',
        type: 'regles',
        title: 'Six cases collées ne suffisent pas',
        summary:
          'Un patron est impossible dès que deux cases tomberaient sur la même face : une autre face resterait alors ouverte.',
        visual: (
          <MiniGrid
            cols={6}
            rows={1}
            filled={[
              { r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 },
              { r: 0, c: 3 }, { r: 0, c: 4 }, { r: 0, c: 5 },
            ]}
            color="#fda4af"
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Un cube a exactement 6 faces : les 6 cases doivent donc se replier sur 6 faces{' '}
              <strong>différentes</strong>. Deux cases sur la même face, et il en manque une ailleurs.
            </p>
            <Piege>
              La bande de six cases en ligne est le contre-exemple classique : elle a le bon nombre
              de cases, et pourtant elle s’enroule sur elle-même.
            </Piege>
            <Souvenir>les patrons que tu avais prédits impossibles, et que le simulateur a refusés.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M5 — Ce que les comptes ne disent pas. ── */
    5: [
      {
        id: 'nature-des-faces',
        type: 'concepts',
        title: 'La nature des faces distingue les solides',
        summary:
          'Deux solides peuvent avoir les mêmes trois comptes : c’est la forme de leurs faces qui les sépare.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1.5 text-sm text-slate-600">
              <div><strong>cube</strong> — 6 carrés tous identiques ;</div>
              <div><strong>pavé droit</strong> — 6 rectangles, égaux deux à deux ;</div>
              <div><strong>prisme droit</strong> — 2 triangles et 3 rectangles ;</div>
              <div><strong>cylindre</strong> — 2 disques et une surface courbe, aucun sommet.</div>
            </div>
            <p>
              Le cylindre est à part : sa surface courbe n’est pas une face plane, il n’a ni arête
              droite ni sommet.
            </p>
            <Souvenir>les quatre fiches de la rangée, avec leurs trois nombres et leur description.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M6 — Choisir le bon compte est la moitié du travail. ── */
    6: [
      {
        id: 'choisir-le-compte',
        type: 'methodes',
        title: 'Choisir le bon compte',
        summary:
          'Le verbe de l’énoncé désigne l’élément : peindre → les faces, coller un ruban → les arêtes, protéger un coin → les sommets.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1.5 text-sm text-slate-600">
              <div>peindre, recouvrir, emballer → une <strong>surface</strong> → les faces (6) ;</div>
              <div>coller un ruban, border, souder → un <strong>segment</strong> → les arêtes (12) ;</div>
              <div>protéger un coin, poser un embout → un <strong>point</strong> → les sommets (8).</div>
            </div>
            <Piege>
              L’erreur la plus fréquente n’est pas de mal compter, c’est de compter le mauvais
              élément : répondre 12 à une question qui porte sur les faces.
            </Piege>
            <Souvenir>la caisse à peindre, puis à scotcher, puis à protéger aux coins.</Souvenir>
          </div>
        ),
      },
    ],
  },
};
