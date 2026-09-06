import React from 'react';
import { MiniGrid, MiniFigure, UnitLadder } from '../../../../common/knowledge6e';

/**
 * Connaissances de la leçon « Aires » (6e) — SOURCE UNIQUE de vérité
 * (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à
 * l'instant où le geste vient de lui donner un sens, puis il reste sur la
 * carte. Rien n'est réécrit dans les modules : la brique et la carte
 * montrent le même texte.
 *
 * ORDRE — un item n'emploie QUE ce qui est déjà posé à son module ou avant,
 * puisque la brique injecte ce texte à sa position dans le flux :
 *
 *   M1  paver et compter → le mot AIRE ; faire le tour → le mot PÉRIMÈTRE
 *       (les deux mots sont de la matière de 6e : ils DOIVENT être posés ici,
 *       et c'est le geste qui les sépare — recouvrir vs contourner)
 *   M2  découper-recoller conserve l'aire ; le périmètre ne prédit pas l'aire
 *   M3  mesurer une aire = compter des carreaux-unités ; choisir son unité
 *   M4  A = L × l, A = c × c ; découper / retrancher une aire
 *   M5  la marche des aires vaut ×100 (et non ×10 comme les longueurs)
 *   M6  la mise au travail : rien de neuf, on referme le piège de M2
 *
 * Le module 0 (diagnostic) et le module 7 (évaluation) ne contribuent RIEN.
 */

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

const Piege = ({ children }) => (
  <p className="text-xs text-rose-600">⚠️ {children}</p>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ── M1 — Les deux grandeurs d'un même jardin, séparées par le geste. ── */
    1: [
      {
        id: 'aire',
        type: 'vocabulaire',
        title: 'L’aire',
        summary: 'La quantité de surface d’une figure — ce qu’il faut de carreaux pour la recouvrir entièrement.',
        visual: <MiniGrid cols={6} rows={2} filled={Array.from({ length: 12 }, (_, i) => ({ r: Math.floor(i / 6), c: i % 6 }))} color="#34d399" />,
        body: (
          <div className="space-y-2">
            <p>
              Recouvrir une figure de carreaux tous identiques, puis les compter : le nombre obtenu
              est son <strong>aire</strong>. C’est une mesure du <strong>dedans</strong>.
            </p>
            <Piege>
              La forme ne dit rien : un jardin étroit et long peut demander plus de pelouse qu’un
              jardin bien carré. Il faut recouvrir pour trancher, jamais juger à l’œil.
            </Piege>
            <Souvenir>les deux jardins pavés carreau par carreau — 12 contre 9.</Souvenir>
          </div>
        ),
      },
      {
        id: 'perimetre',
        type: 'vocabulaire',
        title: 'Le périmètre',
        summary: 'La longueur du tour d’une figure — ce qu’il faut de clôture pour en faire le tour.',
        visual: <MiniFigure points={[{ x: 5, y: 80 }, { x: 95, y: 80 }, { x: 95, y: 20 }, { x: 5, y: 20 }]} fill="#fff" stroke="#f97316" ticks={[]} width={120} height={78} />,
        body: (
          <div className="space-y-2">
            <p>
              Le <strong>périmètre</strong> longe le <strong>bord</strong> : on part d’un coin, on suit
              chaque côté, et on revient au point de départ. C’est une longueur, mesurée en m, cm, km.
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-sm text-slate-600">
              Dans le même jardin : la <strong>pelouse</strong> à poser se mesure par l’aire, la{' '}
              <strong>clôture</strong> à commander se mesure par le périmètre. Deux commandes
              différentes, deux grandeurs différentes.
            </div>
            <Souvenir>la clôture qui fait le tour, pendant que la pelouse remplit le dedans.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M2 — Ce que l'aire ne suit PAS : ni la forme, ni le tour. ── */
    2: [
      {
        id: 'aire-conservee',
        type: 'regles',
        title: 'Découper et recoller ne change pas l’aire',
        summary: 'Si on n’ajoute et n’enlève rien, la quantité de surface reste la même — quelle que soit la nouvelle forme.',
        visual: (
          <div className="flex items-center gap-3">
            <MiniGrid cols={3} rows={3} filled={[{ r: 1, c: 0 }, { r: 1, c: 1 }, { r: 2, c: 0 }, { r: 2, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 2 }]} cell={15} color="#38bdf8" />
            <span className="text-slate-400 text-sm" aria-hidden="true">→</span>
            <MiniGrid cols={3} rows={2} filled={Array.from({ length: 6 }, (_, i) => ({ r: Math.floor(i / 3), c: i % 3 }))} cell={15} color="#38bdf8" />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <p>
              Six carreaux déplacés restent six carreaux. La figure en escalier et le rectangle
              n’ont pas la même allure ni le même tour, et pourtant leur aire est identique.
            </p>
            <p className="text-xs text-slate-500">
              C’est ce qui permettra plus tard de calculer l’aire d’une figure compliquée : on la
              découpe en morceaux plus simples, sans rien perdre.
            </p>
            <Souvenir>les deux morceaux glissés dans leurs emplacements, et le compte inchangé.</Souvenir>
          </div>
        ),
      },
      {
        id: 'aire-perimetre-independants',
        type: 'regles',
        title: 'Le périmètre ne dit rien de l’aire',
        summary: 'Deux figures de même périmètre peuvent avoir des aires très différentes.',
        visual: (
          <div className="flex items-end gap-3">
            <MiniGrid cols={3} rows={3} filled={Array.from({ length: 9 }, (_, i) => ({ r: Math.floor(i / 3), c: i % 3 }))} cell={15} color="#34d399" />
            <MiniGrid cols={5} rows={1} filled={Array.from({ length: 5 }, (_, i) => ({ r: 0, c: i }))} cell={15} color="#38bdf8" />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm space-y-1">
              <div>Carré 3 × 3 : tour de <strong>12</strong> unités · aire de <strong>9</strong> carreaux</div>
              <div>Barre 1 × 5 : tour de <strong>12</strong> unités · aire de <strong>5</strong> carreaux</div>
            </div>
            <p>
              Même tour, presque le double de surface pour l’un. L’aire et le périmètre vivent sur la
              même figure sans jamais se commander l’un l’autre.
            </p>
            <Piege>
              « Son tour est plus long, donc elle est plus grande » est faux. Il faut se demander à
              chaque fois : la question porte-t-elle sur le <em>dedans</em> ou sur le <em>tour</em> ?
            </Piege>
            <Souvenir>le carré et la barre, deux tours de 12, deux aires différentes.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M3 — Mesurer, c'est compter des unités. ── */
    3: [
      {
        id: 'mesurer-par-pavage',
        type: 'methodes',
        title: 'Mesurer une aire, c’est compter des carreaux-unités',
        summary: 'On recouvre sans trou ni chevauchement, on compte — et deux demi-carreaux valent un carreau entier.',
        visual: <MiniGrid cols={4} rows={3} filled={[{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }]} color="#34d399" />,
        body: (
          <div className="space-y-2">
            <p>
              Le carreau choisi devient l’<strong>unité</strong> : si chaque carreau vaut 1 m², une
              terrasse de 14 carreaux a une aire de <strong>14 m²</strong>.
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-sm text-slate-600">
              Les morceaux se recomposent : <strong>2 demi-carreaux = 1 carreau entier</strong>. Un
              triangle posé sur le quadrillage se compte donc aussi.
            </div>
            <Piege>
              Une aire s’écrit toujours avec une unité de <strong>surface</strong> — m², cm², km² —
              jamais en m ou en cm, qui mesurent des longueurs.
            </Piege>
            <Souvenir>la terrasse pavée carreau après carreau, compteur à l’appui.</Souvenir>
          </div>
        ),
      },
      {
        id: 'choisir-unite-aire',
        type: 'regles',
        title: 'Choisir son carreau-unité',
        summary: 'L’unité doit donner un compte lisible : cm² pour un cahier, m² pour une cour, km² pour un pays.',
        body: (
          <div className="space-y-2">
            <p>
              Mesurer une cour en cm² donnerait des millions de carreaux ; la mesurer en km² n’en
              remplirait même pas un. Entre les deux, le m² donne un nombre qu’on peut lire et
              écrire sur un devis.
            </p>
            <p className="text-xs text-slate-500">
              C’est le même réflexe que pour les longueurs : on ne mesure pas un crayon en kilomètres.
            </p>
            <Souvenir>le choix du carreau pour la cour de récréation.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M4 — La formule sort du comptage ligne par ligne. ── */
    4: [
      {
        id: 'aire-rectangle',
        type: 'formules',
        title: 'Aire du rectangle et du carré',
        summary: 'Rectangle : A = L × l. Carré : A = c × c. Compter les lignes de carreaux, c’est multiplier.',
        visual: <MiniGrid cols={7} rows={4} filled={Array.from({ length: 28 }, (_, i) => ({ r: Math.floor(i / 7), c: i % 7 }))} cell={14} color="#a78bfa" />,
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm space-y-1">
              <div>4 lignes de 7 carreaux : 7 + 7 + 7 + 7 = <strong>4 × 7 = 28</strong></div>
              <div className="font-mono font-bold text-slate-700">A = L × l &nbsp;·&nbsp; A = c × c</div>
            </div>
            <p>
              Le rectangle range ses carreaux en lignes toutes pareilles : au lieu de les compter un
              par un, on multiplie. Le carré est un rectangle dont les deux côtés sont égaux.
            </p>
            <Piege>
              2 × (L + l) est le tour de la figure, pas son aire. Une aire se MULTIPLIE, un périmètre
              s’additionne — et les résultats ne s’écrivent même pas dans la même unité.
            </Piege>
            <Souvenir>le potager colorié ligne par ligne : 7, 14, 21, 28.</Souvenir>
          </div>
        ),
      },
      {
        id: 'aire-composee',
        type: 'methodes',
        title: 'Découper ou retrancher pour calculer',
        summary: 'Une figure compliquée se découpe en rectangles : on calcule chaque aire, puis on additionne — ou on retranche un trou.',
        visual: <MiniGrid cols={5} rows={4} filled={[{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 3, c: 0 }, { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }]} cell={15} color="#a78bfa" />,
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-sm text-slate-600 space-y-1">
              <div><strong>Additionner</strong> : salle en L = 5 × 3 + 2 × 2 = 15 + 4 = 19 m²</div>
              <div><strong>Retrancher</strong> : mur percé = 4 × 3 − 2 × 1 = 12 − 2 = 10 m²</div>
            </div>
            <p>
              C’est légitime parce que découper et recoller ne change pas l’aire : les morceaux
              gardent exactement ce qu’ils avaient.
            </p>
            <Souvenir>la salle en L découpée en deux rectangles, et la fenêtre retirée du mur.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M5 — La marche des aires. ── */
    5: [
      {
        id: 'marche-x100',
        type: 'regles',
        title: 'Entre deux unités d’aire, la marche vaut ×100',
        summary: '1 dm² = 100 cm², car un carré de 10 cm de côté contient 10 × 10 carreaux de 1 cm².',
        visual: (
          <div className="space-y-1">
            <MiniGrid cols={10} rows={10} filled={[{ r: 0, c: 0 }]} cell={9} color="#f59e0b" />
            <UnitLadder steps={['km²', 'hm²', 'dam²', 'm²', 'dm²', 'cm²', 'mm²']} highlight={[4, 5]} width={240} />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm space-y-1">
              <div>1 dm = 10 cm &nbsp;→&nbsp; 1 dm² = 10 × 10 = <strong>100 cm²</strong></div>
              <div>1 m² = 100 dm² = <strong>10 000 cm²</strong></div>
            </div>
            <p>
              Le carré grandit dans <strong>deux</strong> directions à la fois : c’est pour cela
              qu’une marche d’aire vaut ×100 quand la marche de longueur ne vaut que ×10.
            </p>
            <Piege>
              « 1 dm = 10 cm, donc 1 dm² = 10 cm² » est l’erreur classique. Les longueurs sautent
              d’un zéro, les aires de deux.
            </Piege>
            <Souvenir>le dm² quadrillé sous tes yeux : 10 colonnes × 10 lignes = 100.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mem-aire-vs-perimetre',
        type: 'memoriser',
        title: '⭐ Le dedans se multiplie, le tour s’additionne',
        summary: 'Aire → carreaux, en m² · Périmètre → tour, en m. Deux grandeurs, deux unités, deux calculs.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1.5 text-center">
              <div className="text-sm font-black text-rose-700">AIRE → le DEDANS → m², cm² → A = L × l</div>
              <div className="text-sm font-black text-rose-700">PÉRIMÈTRE → le TOUR → m, cm → on additionne les côtés</div>
            </div>
            <p className="text-xs text-slate-500">
              Devant un problème, la première question n’est jamais « quelle formule ? » mais
              « m’a-t-on demandé le dedans ou le tour ? ». L’unité de la réponse tranche : des m²
              pour une surface, des m pour un tour.
            </p>
          </div>
        ),
      },
    ],
  },
};
