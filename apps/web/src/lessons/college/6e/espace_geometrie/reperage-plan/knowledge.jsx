import React from 'react';
import { MiniGrid } from '../../../../common/knowledge6e';

/**
 * Connaissances de la leçon « Repérage dans le plan » (6e) — SOURCE UNIQUE
 * de vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à
 * l'instant où le geste vient de lui donner un sens, puis il reste sur la
 * carte. Rien n'est réécrit dans les modules : la brique et la carte montrent
 * le même texte.
 *
 * ORDRE — un item n'emploie QUE le vocabulaire déjà posé à son module ou
 * avant, puisque la brique injecte ce texte à sa position dans le flux
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md) :
 *
 *   M1  il faut DEUX nombres pour désigner un seul endroit
 *   M2  l'ORDRE de ces deux nombres, puis leurs deux noms : abscisse, ordonnée
 *   M3  le couple s'écrit (x ; y) et s'appelle les COORDONNÉES ; comment le lire
 *   M4  l'ORIGINE, point de départ des deux comptages ; comment placer un point
 *   M5  un déplacement, c'est la SOMME des deux écarts
 *   M6  nœud (un point) ≠ case (une surface) — la confusion à ne plus faire
 *   M7  deux points qui partagent une coordonnée sont alignés
 *
 * Les mots « abscisse », « ordonnée », « coordonnées » et « origine » sont
 * la MATIÈRE de cette leçon : aucun n'apparaît avant la brique qui le pose.
 */

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

const Piege = ({ children }) => (
  <p className="text-xs text-rose-600">⚠️ {children}</p>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ── M1 — Le trésor perdu : le besoin de deux nombres. ── */
    1: [
      {
        id: 'deux-nombres',
        type: 'concepts',
        title: 'Deux nombres pour un seul endroit',
        summary:
          'Un seul nombre, ou une description « en haut à droite », laisse plusieurs endroits possibles. Deux nombres n’en laissent qu’un.',
        visual: (
          <MiniGrid
            cols={6}
            rows={5}
            colLabels={['0', '1', '2', '3', '4', '5']}
            rowLabels={['5', '4', '3', '2', '1']}
            nodes={[{ r: 3, c: 5 }]}
            color="#c7d2fe"
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Pour trouver un point sur un quadrillage, il faut savoir de combien on avance{' '}
              <strong>horizontalement</strong>, et de combien on monte <strong>verticalement</strong>.
              Ce sont deux informations différentes : aucune ne remplace l’autre.
            </p>
            <Piege>
              « En haut à droite » n’est pas une position : c’est toute une région. Trois personnes
              qui suivent ce message n’arrivent pas au même endroit.
            </Piege>
            <Souvenir>
              les trois chercheurs qui partaient dans trois directions, jusqu’à ce que ton message
              donne enfin deux nombres.
            </Souvenir>
          </div>
        ),
      },
    ],

    /* ── M2 — L'ordre d'abord (constaté par l'échange), les noms ensuite. ── */
    2: [
      {
        id: 'ordre-du-couple',
        type: 'regles',
        title: 'L’ordre des deux nombres change le point',
        summary:
          'Le premier nombre commande l’horizontale, le second la verticale. Les échanger désigne un autre endroit.',
        visual: (
          <MiniGrid
            cols={6}
            rows={6}
            colLabels={['0', '1', '2', '3', '4', '5']}
            rowLabels={['5', '4', '3', '2', '1', '0']}
            nodes={[
              { r: 1, c: 2, color: '#4f46e5' },
              { r: 4, c: 5, color: '#94a3b8' },
            ]}
            color="#e0e7ff"
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Les deux nombres ne sont pas interchangeables : chacun commande une direction. Le
              premier dit de combien on avance vers la droite, le second de combien on monte.
            </p>
            <Piege>
              (2 ; 5) et (5 ; 2) ne sont pas le même point. Le seul cas où l’échange ne change rien
              est celui où les deux nombres sont déjà égaux, comme (3 ; 3).
            </Piege>
            <Souvenir>
              le fantôme A′ qui sautait de l’autre côté de la diagonale dès que tu déplaçais A.
            </Souvenir>
          </div>
        ),
      },
      {
        id: 'abscisse',
        type: 'vocabulaire',
        title: 'Abscisse',
        summary: 'Le premier nombre : de combien on avance horizontalement.',
        visual: (
          <MiniGrid
            cols={6}
            rows={5}
            colLabels={['0', '1', '2', '3', '4', '5']}
            nodes={[{ r: 2, c: 4, color: '#0284c7' }]}
            color="#bae6fd"
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              C’est le nombre qu’on lit sur l’axe <strong>horizontal</strong> — celui qui se lit de
              gauche à droite. Il se donne toujours en <strong>premier</strong>.
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-center text-sm">
              <span className="font-mono font-bold text-sky-700">(4</span>
              <span className="font-mono text-slate-400"> ; 2)</span>
              <span className="text-slate-500 ml-3">l’abscisse vaut 4</span>
            </div>
            <Souvenir>le premier nombre, celui qui faisait glisser le point vers la droite.</Souvenir>
          </div>
        ),
      },
      {
        id: 'ordonnee',
        type: 'vocabulaire',
        title: 'Ordonnée',
        summary: 'Le second nombre : de combien on monte verticalement.',
        visual: (
          <MiniGrid
            cols={5}
            rows={6}
            rowLabels={['5', '4', '3', '2', '1', '0']}
            nodes={[{ r: 4, c: 3, color: '#7c3aed' }]}
            color="#ddd6fe"
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              C’est le nombre qu’on lit sur l’axe <strong>vertical</strong> — celui qui monte. Il se
              donne toujours en <strong>second</strong>.
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-center text-sm">
              <span className="font-mono text-slate-400">(4 ; </span>
              <span className="font-mono font-bold text-violet-700">2)</span>
              <span className="text-slate-500 ml-3">l’ordonnée vaut 2</span>
            </div>
            <Souvenir>le second nombre, celui qui faisait monter le point.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mem-ordre',
        type: 'memoriser',
        title: '⭐ Abscisse d’abord, ordonnée ensuite',
        summary: 'On avance, PUIS on monte. Toujours dans cet ordre.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1.5 text-center">
              <div className="text-sm font-black text-rose-700">1️⃣ ABSCISSE → j’avance (horizontale)</div>
              <div className="text-sm font-black text-rose-700">2️⃣ ORDONNÉE → je monte (verticale)</div>
            </div>
            <p className="text-xs text-slate-500">
              Un moyen de ne plus les confondre : dans l’alphabet, <strong>a</strong>bscisse vient
              avant <strong>o</strong>rdonnée — comme dans l’écriture.
            </p>
          </div>
        ),
      },
    ],

    /* ── M3 — L'écriture du couple, son nom, et le geste de lecture. ── */
    3: [
      {
        id: 'coordonnees',
        type: 'vocabulaire',
        title: 'Les coordonnées d’un point',
        summary:
          'L’abscisse et l’ordonnée réunies, entre parenthèses et séparées par un point-virgule : (4 ; 2).',
        visual: (
          <MiniGrid
            cols={6}
            rows={5}
            colLabels={['0', '1', '2', '3', '4', '5']}
            rowLabels={['4', '3', '2', '1', '0']}
            nodes={[{ r: 2, c: 4, color: '#059669' }]}
            color="#a7f3d0"
          />
        ),
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <span className="font-mono text-lg font-bold text-slate-800">T (4 ; 2)</span>
            </div>
            <p>
              Les deux nombres réunis s’appellent les <strong>coordonnées</strong> du point. On les
              écrit entre parenthèses, l’abscisse d’abord, puis un point-virgule, puis l’ordonnée.
            </p>
            <Piege>
              C’est un point-virgule, pas une virgule : (4 ; 2) est un couple de deux nombres
              entiers, pas le nombre 4,2.
            </Piege>
            <Souvenir>le nom que tu as donné au point T une fois les guides croisés dessus.</Souvenir>
          </div>
        ),
      },
      {
        id: 'lire-un-point',
        type: 'methodes',
        title: 'Lire les coordonnées d’un point',
        summary:
          'Je descends du point jusqu’à l’axe horizontal pour l’abscisse, je vais vers la gauche jusqu’à l’axe vertical pour l’ordonnée.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1.5 text-sm text-slate-600">
              <div>① je suis la verticale qui passe par le point → je lis l’abscisse en bas ;</div>
              <div>② je suis l’horizontale qui passe par le point → je lis l’ordonnée à gauche ;</div>
              <div>③ j’écris les deux dans l’ordre : (abscisse ; ordonnée).</div>
            </div>
            <Piege>
              Les graduations commencent à <strong>0</strong>, pas à 1. Compter « un, deux, trois »
              en partant du premier trait décale toute la lecture d’une unité.
            </Piege>
            <Souvenir>les deux guides coulissants que tu as amenés jusqu’à se croiser sur T.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M4 — L'origine, puis le geste inverse : placer. ── */
    4: [
      {
        id: 'origine-repere',
        type: 'vocabulaire',
        title: 'L’origine',
        summary: 'Le coin d’où partent les deux comptages : ses coordonnées sont (0 ; 0).',
        visual: (
          <MiniGrid
            cols={5}
            rows={4}
            colLabels={['0', '1', '2', '3', '4']}
            rowLabels={['3', '2', '1', '0']}
            nodes={[{ r: 3, c: 0, color: '#e11d48' }]}
            color="#fecdd3"
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              C’est le nœud où l’axe horizontal et l’axe vertical se croisent. On n’a avancé de rien
              et on n’est monté de rien : son abscisse vaut 0 et son ordonnée vaut 0.
            </p>
            <p className="text-xs text-slate-500">
              Tous les comptages partent de là — c’est pour cela que les graduations commencent à 0.
            </p>
            <Souvenir>le coin en bas à gauche, d’où tu comptais tes pas avant de poser le point.</Souvenir>
          </div>
        ),
      },
      {
        id: 'placer-un-point',
        type: 'methodes',
        title: 'Placer un point à partir de ses coordonnées',
        summary:
          'Je pars de l’origine, j’avance de l’abscisse sur l’horizontale, puis je monte de l’ordonnée.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1.5 text-sm text-slate-600">
              <div>Placer <span className="font-mono font-bold">(3 ; 5)</span> :</div>
              <div>① depuis l’origine, j’avance de <strong>3</strong> vers la droite ;</div>
              <div>② de là, je monte de <strong>5</strong> ;</div>
              <div>③ je marque le nœud atteint.</div>
            </div>
            <Piege>
              Monter d’abord de 3 puis avancer de 5 mène à (5 ; 3) : un autre point. L’ordre des
              deux gestes est l’ordre des deux nombres.
            </Piege>
            <Souvenir>les trois cibles que tu as posées au nœud exact, jamais à côté.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M5 — Le déplacement : une somme, jamais un produit. ── */
    5: [
      {
        id: 'deplacement-somme',
        type: 'regles',
        title: 'Un trajet le long des traits, c’est une somme',
        summary:
          'Le trajet le plus court se compte en additionnant l’écart horizontal et l’écart vertical.',
        visual: (
          <MiniGrid
            cols={5}
            rows={4}
            filled={[
              { r: 3, c: 0 }, { r: 3, c: 1 }, { r: 3, c: 2 },
              { r: 2, c: 2 }, { r: 1, c: 2 },
            ]}
            color="#d8b4fe"
          />
        ),
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm">
              de (0 ; 0) à (2 ; 3) : <strong>2 + 3 = 5 pas</strong>
            </div>
            <p>
              Un déplacement et un couple de nombres disent la même chose : (4 ; 3) se lit aussi
              « 4 pas à droite, 3 pas vers le haut ».
            </p>
            <Piege>
              2 × 3 = 6 n’est pas le nombre de pas : on ne multiplie pas deux déplacements, on les
              enchaîne — donc on les additionne. Et oublier l’un des deux donne un trajet trop court.
            </Piege>
            <Souvenir>le robot qui s’arrêtait pile sur le drapeau quand ton programme avait les deux.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M6 — La distinction que les élèves confondent le plus. ── */
    6: [
      {
        id: 'noeud-vs-case',
        type: 'concepts',
        title: 'Un nœud n’est pas une case',
        summary:
          'Un nœud est un point, au croisement de deux traits — noté (3 ; 5). Une case est une surface, entre quatre traits — notée B3.',
        visual: (
          <div className="flex items-center gap-3">
            <MiniGrid cols={4} rows={3} nodes={[{ r: 1, c: 2, color: '#059669' }]} color="#a7f3d0" />
            <MiniGrid cols={4} rows={3} filled={[{ r: 1, c: 2 }]} color="#a5b4fc" />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <p>
              Les deux repérages ne se comptent même pas pareil : un quadrillage de 4 cases sur 3
              porte 5 × 4 = 20 nœuds. Il y a toujours un trait de plus que d’intervalles.
            </p>
            <Piege>
              Écrire « la case (1 ; 2) » ou « le nœud B3 » mélange les deux repérages. L’écriture
              dit lequel on emploie : deux nombres entre parenthèses → un nœud ; une lettre et un
              numéro → une case.
            </Piege>
            <Souvenir>les deux quadrillages côte à côte, l’un où tu cliquais une surface, l’autre un croisement.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mem-noeud-case',
        type: 'memoriser',
        title: '⭐ (3 ; 5) → un point · B3 → une surface',
        summary: 'L’écriture suffit à savoir de quel repérage on parle.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1.5 text-center">
              <div className="text-sm font-black text-rose-700">
                <span className="font-mono">(3 ; 5)</span> → un NŒUD, un point sans épaisseur
              </div>
              <div className="text-sm font-black text-rose-700">
                <span className="font-mono">B3</span> → une CASE, une surface
              </div>
            </div>
          </div>
        ),
      },
    ],

    /* ── M7 — Les coordonnées deviennent un outil de raisonnement. ── */
    7: [
      {
        id: 'coordonnee-commune',
        type: 'regles',
        title: 'Une coordonnée commune, un alignement',
        summary:
          'Même ordonnée → les points sont à la même hauteur. Même abscisse → ils sont l’un au-dessus de l’autre.',
        visual: (
          <MiniGrid
            cols={7}
            rows={4}
            nodes={[
              { r: 2, c: 1, color: '#e11d48' },
              { r: 2, c: 3, color: '#e11d48' },
              { r: 2, c: 6, color: '#e11d48' },
            ]}
            color="#fecdd3"
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              (1 ; 2), (4 ; 2) et (7 ; 2) partagent la même ordonnée : ils sont donc tous à la même
              hauteur, alignés sur une horizontale. Leur abscisse, elle, change.
            </p>
            <p className="text-xs text-slate-500">
              À l’inverse, deux points de même abscisse sont sur une même verticale — comme (2 ; 3)
              et (2 ; 5).
            </p>
            <Souvenir>les trois stands du parc, posés sur une même rangée.</Souvenir>
          </div>
        ),
      },
      {
        id: 'croiser-deux-indices',
        type: 'methodes',
        title: 'Croiser deux indices pour trouver un point',
        summary:
          'Un indice sur l’horizontale et un indice sur la verticale suffisent à désigner un seul nœud.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1.5 text-sm text-slate-600">
              <div>« 3 pas à droite du tir à l’arc (2 ; 3) » → l’abscisse devient 2 + 3 = 5 ;</div>
              <div>« 2 pas plus bas » → l’ordonnée devient 3 − 2 = 1 ;</div>
              <div>le point cherché est donc (5 ; 1).</div>
            </div>
            <p className="text-xs text-slate-500">
              Chaque indice ne touche qu’une seule des deux coordonnées : c’est ce qui permet de les
              traiter l’une après l’autre, sans mesurer à l’œil.
            </p>
            <Souvenir>la cache secrète, trouvée en calculant au lieu de deviner.</Souvenir>
          </div>
        ),
      },
    ],
  },
};
