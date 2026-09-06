import React from 'react';
import { MiniFigure } from '../../../../common/knowledge6e';

/**
 * Connaissances de la leçon « Angles » (6e) — SOURCE UNIQUE de vérité
 * (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à
 * l'instant où le geste vient de lui donner un sens, puis il reste sur la
 * carte. Rien n'est réécrit dans les modules.
 *
 * ORDRE — un item n'emploie QUE ce qui est déjà posé à son module ou avant :
 *
 *   M1  ouvrir la porte → l'ANGLE est une ouverture ; la longueur des côtés
 *       n'y change rien ; la notation à trois lettres
 *   M2  superposer → l'orientation non plus ; l'équerre-témoin → les quatre
 *       classes (aigu, droit, obtus, plat), posées AVANT qu'on demande
 *       de classer
 *   M3  le RAPPORTEUR et son rituel de placement ; le degré
 *   M4  les deux graduations, et le réflexe « classer d'abord » qui tranche
 *   M5  la méthode de construction en quatre temps
 *   M6  le tour complet vaut 360° (partager un gâteau)
 *
 * Le module 0 (diagnostic) et le module 7 (évaluation) ne contribuent RIEN.
 * Le module 0 ne mesure que les prérequis déclarés dans lesson.config.js :
 * demi-droite, sommet, angle droit, droites perpendiculaires, lecture d'une
 * graduation — jamais la matière de la leçon.
 */

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

const Piege = ({ children }) => (
  <p className="text-xs text-rose-600">⚠️ {children}</p>
);

/** Petit secteur angulaire autonome, pour les items de la carte. */
function MiniAngle({ deg = 60, size = 96, color = '#6366f1', label = null, rotation = 0 }) {
  const cx = size * 0.18;
  const cy = size * 0.78;
  const r = size * 0.66;
  const rad = (d) => ((-d + rotation) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(rad(0));
  const y1 = cy + r * Math.sin(rad(0));
  const x2 = cx + r * Math.cos(rad(deg));
  const y2 = cy + r * Math.sin(rad(deg));
  const ar = r * 0.34;
  const ax1 = cx + ar * Math.cos(rad(0));
  const ay1 = cy + ar * Math.sin(rad(0));
  const ax2 = cx + ar * Math.cos(rad(deg));
  const ay2 = cy + ar * Math.sin(rad(deg));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="select-none overflow-visible">
      <line x1={cx} y1={cy} x2={x1} y2={y1} stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={x2} y2={y2} stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <path d={`M ${ax1} ${ay1} A ${ar} ${ar} 0 ${deg > 180 ? 1 : 0} 0 ${ax2} ${ay2}`} fill="none" stroke={color} strokeWidth="1.4" opacity="0.7" />
      <circle cx={cx} cy={cy} r="2.6" fill={color} />
      {label && (
        <text x={cx + ar * 1.5} y={cy - ar * 0.5} fontSize="10.5" fontWeight="700" fill="#334155" fontFamily="ui-monospace, monospace">
          {label}
        </text>
      )}
    </svg>
  );
}

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ── M1 — L'angle est une OUVERTURE, et rien d'autre. ── */
    1: [
      {
        id: 'angle-ouverture',
        type: 'concepts',
        title: 'Un angle est une ouverture',
        summary: 'L’écartement entre deux demi-droites parties d’un même point — le sommet.',
        visual: <MiniAngle deg={55} label="angle" />,
        body: (
          <div className="space-y-2">
            <p>
              Quand la porte s’ouvre, le battant ne s’allonge pas : c’est l’<strong>écartement</strong>{' '}
              entre le mur et le battant qui grandit. Cette grandeur-là s’appelle un{' '}
              <strong>angle</strong>.
            </p>
            <p className="text-xs text-slate-500">
              Le point d’où partent les deux demi-droites est le <strong>sommet</strong> de l’angle ;
              les deux demi-droites en sont les <strong>côtés</strong>.
            </p>
            <Souvenir>la porte vue du dessus que tu as ouverte jusqu’à l’équerre.</Souvenir>
          </div>
        ),
      },
      {
        id: 'longueur-cotes-sans-effet',
        type: 'regles',
        title: 'La longueur des côtés ne change pas l’angle',
        summary: 'Prolonger les côtés n’ouvre pas davantage : deux angles aux côtés très inégaux peuvent être identiques.',
        visual: (
          <div className="flex items-end gap-1">
            <MiniAngle deg={40} size={74} color="#0ea5e9" />
            <MiniAngle deg={40} size={104} color="#8b5cf6" />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <p>
              Les deux figures ci-dessus ont la même ouverture. Seul le trait a été rallongé — et un
              trait plus long ne fait pas un angle plus grand.
            </p>
            <Piege>
              C’est le piège n° 1 des angles : on juge à la taille du dessin. Il faut regarder
              l’écartement, jamais la longueur des traits.
            </Piege>
            <Souvenir>les deux figures de 40°, côtés courts contre côtés longs.</Souvenir>
          </div>
        ),
      },
      {
        id: 'notation-angle',
        type: 'vocabulaire',
        title: 'Écrire un angle : trois lettres, le sommet au milieu',
        summary: 'L’angle ABC a pour sommet B ; A et C nomment un point sur chacun de ses côtés.',
        visual: (
          <MiniFigure
            points={[{ x: 8, y: 88 }, { x: 96, y: 88 }, { x: 50, y: 8 }]}
            labels={[{ x: 8, y: 100, text: 'B' }, { x: 100, y: 96, text: 'C' }, { x: 50, y: 2, text: 'A' }]}
            fill="#ecfdf5"
            stroke="#059669"
            width={124}
            height={96}
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              La lettre du <strong>milieu</strong> est toujours le sommet. Les deux autres désignent
              un point pris sur chaque côté : ce sont elles qui disent de quelle ouverture on parle.
            </p>
            <Souvenir>la figure ABC dont tu as identifié le sommet.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M2 — Comparer, puis classer. Les quatre mots naissent ici. ── */
    2: [
      {
        id: 'orientation-sans-effet',
        type: 'regles',
        title: 'L’orientation du dessin ne change pas l’angle',
        summary: 'Pour comparer deux angles, on les superpose : sommet sur sommet, un côté commun.',
        visual: (
          <div className="flex items-end gap-1">
            <MiniAngle deg={35} size={80} color="#0ea5e9" rotation={40} />
            <MiniAngle deg={35} size={80} color="#0ea5e9" />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <p>
              Deux angles dessinés penchés différemment sont impossibles à comparer à l’œil. La
              <strong> superposition</strong> neutralise la position : une fois sommet sur sommet et
              un côté aligné, le plus ouvert dépasse visiblement l’autre.
            </p>
            <Souvenir>le bouton « Superposer » qui a ramené les deux angles dans la même position.</Souvenir>
          </div>
        ),
      },
      {
        id: 'classes-angles',
        type: 'vocabulaire',
        title: 'Aigu, droit, obtus, plat',
        summary: 'L’angle droit sert de témoin : plus fermé → aigu, plus ouvert → obtus, côtés alignés → plat.',
        visual: (
          <div className="flex items-end gap-0">
            <MiniAngle deg={35} size={70} color="#0ea5e9" />
            <MiniAngle deg={90} size={70} color="#059669" />
            <MiniAngle deg={130} size={70} color="#8b5cf6" />
            <MiniAngle deg={180} size={70} color="#f59e0b" />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm space-y-1">
              <div>un <strong>angle aigu</strong> est plus fermé que l’angle droit</div>
              <div>un <strong>angle droit</strong> est celui de l’équerre, celui du coin d’une feuille</div>
              <div>un <strong>angle obtus</strong> est plus ouvert que l’angle droit</div>
              <div>un <strong>angle plat</strong> a ses deux côtés alignés : il forme une ligne droite</div>
            </div>
            <p>
              L’équerre est le témoin qu’on pose sur l’angle : on n’a besoin d’aucun nombre pour
              trancher, seulement de voir si l’angle dépasse ou non.
            </p>
            <Piege>
              Ni l’orientation du dessin ni la longueur des côtés ne changent la classe d’un angle.
            </Piege>
            <Souvenir>l’équerre posée sur l’angle nettement plus fermé qu’elle.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M3 — L'instrument, et son rituel. ── */
    3: [
      {
        id: 'rapporteur',
        type: 'vocabulaire',
        title: 'Le rapporteur',
        summary: 'Le demi-disque gradué qui donne la mesure d’un angle en degrés (°).',
        body: (
          <div className="space-y-2">
            <p>
              Comparer dit lequel est le plus ouvert ; le <strong>rapporteur</strong> donne un
              <strong> nombre</strong>. Son bord courbe porte des graduations, et son centre est
              marqué au milieu du bord droit.
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-center text-sm text-slate-600">
              L’unité de mesure d’un angle est le <strong>degré</strong>, noté <strong>°</strong> —
              un angle droit mesure exactement <strong>90°</strong>, un angle plat <strong>180°</strong>.
            </div>
            <Souvenir>l’instrument que tu as remis en place sur l’angle.</Souvenir>
          </div>
        ),
      },
      {
        id: 'rituel-placement',
        type: 'methodes',
        title: 'Les deux gestes du placement',
        summary: '① le centre du rapporteur sur le sommet · ② le zéro aligné sur un côté. Toujours dans cet ordre.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm text-slate-600 space-y-1">
              <div>① <strong>centre</strong> de l’instrument sur le <strong>sommet</strong> de l’angle</div>
              <div>② <strong>zéro</strong> de l’instrument aligné sur l’un des deux <strong>côtés</strong></div>
              <div>③ on lit le nombre écrit sur la graduation par laquelle sort l’autre côté</div>
            </div>
            <p className="text-xs text-slate-500">
              Entre deux graduations chiffrées du rapporteur, il y a des traits plus fins, exactement
              comme entre deux centimètres d’une règle : ils comptent les degrés un par un.
            </p>
            <Piege>
              Un rapporteur mal centré donne des graduations toutes fausses, même s’il est bien
              gradué. Le placement précède toujours la lecture.
            </Piege>
            <Souvenir>l’outil posé de travers que tu as remis en place, geste après geste.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M4 — Le piège du module, et le réflexe qui le désamorce. ── */
    4: [
      {
        id: 'deux-graduations',
        type: 'regles',
        title: 'Chaque graduation porte DEUX nombres',
        summary: 'On suit celle qui part du zéro posé sur le côté — l’autre série se lit dans le sens inverse.',
        body: (
          <div className="space-y-2">
            <p>
              Le rapporteur est gradué dans les deux sens, pour qu’on puisse poser son zéro à droite
              ou à gauche. Sur une même graduation on lit donc deux nombres — par exemple{' '}
              <strong>50</strong> et <strong>130</strong> — dont un seul répond à la question.
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-sm text-slate-600">
              Les deux nombres d’une même graduation s’additionnent toujours à <strong>180</strong> :
              50 + 130 = 180.
            </div>
            <Piege>
              Ce n’est pas l’habitude qui décide (« le zéro est toujours à droite ») : c’est le côté
              sur lequel le zéro a réellement été posé.
            </Piege>
            <Souvenir>la graduation qui affichait 50 ET 130 en même temps.</Souvenir>
          </div>
        ),
      },
      {
        id: 'reflexe-classer',
        type: 'memoriser',
        title: '⭐ Classer d’abord, lire ensuite, vérifier toujours',
        summary: 'Un angle aigu mesure moins de 90°, un obtus plus de 90° : cela élimine la mauvaise graduation à tous les coups.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm text-slate-600 space-y-1">
              <div>① je regarde l’angle : est-il plus fermé ou plus ouvert que l’équerre ?</div>
              <div>② je lis la graduation qui part du zéro posé sur le côté</div>
              <div>③ je vérifie : un angle aigu fait moins de 90°, un angle obtus plus de 90°</div>
            </div>
            <p>
              Entre 50 et 130, un angle visiblement aigu ne peut être que 50. Aucun calcul, aucune
              hésitation : la classe tranche.
            </p>
            <Souvenir>l’angle aigu qui affichait 50 et 130, et le raisonnement qui a éliminé 130.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M5 — Construire, c'est le même rituel à l'envers. ── */
    5: [
      {
        id: 'construire-angle',
        type: 'methodes',
        title: 'Construire un angle de mesure donnée',
        summary: 'Tracer un côté, poser le rapporteur dessus, marquer la graduation voulue, tracer le second côté.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm text-slate-600 space-y-1">
              <div>① je trace une demi-droite : ce sera le premier côté</div>
              <div>② centre du rapporteur sur son origine</div>
              <div>③ zéro aligné sur cette demi-droite</div>
              <div>④ je marque la graduation voulue, puis je trace le second côté</div>
            </div>
            <p>
              C’est exactement le rituel de la mesure, exécuté à l’envers : on part de la mesure et on
              obtient la figure.
            </p>
            <Piege>
              Le choix de la graduation obéit à la même règle qu’en lecture — celle qui part du zéro
              posé sur la demi-droite — et la classe de l’angle obtenu vérifie le résultat.
            </Piege>
            <Souvenir>les angles de 70° puis de 140° que tu as marqués toi-même.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M6 — Le tour complet. ── */
    6: [
      {
        id: 'tour-360',
        type: 'regles',
        title: 'Autour d’un point, le tour complet vaut 360°',
        summary: 'Les angles qui se partagent un même sommet et remplissent tout le tour totalisent 360°.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-center text-sm text-slate-600">
              Gâteau partagé en parts de 45° : 360 ÷ 45 = <strong>8 parts</strong>
            </div>
            <p>
              Un demi-tour vaut 180° — c’est l’angle plat. Un tour entier en vaut donc le double.
              C’est ce qui permet de calculer un partage sans mesurer chaque part.
            </p>
            <Souvenir>le gâteau du tournoi découpé en huit parts de 45°.</Souvenir>
          </div>
        ),
      },
    ],
  },
};
