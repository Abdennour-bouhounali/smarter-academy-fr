import React from 'react';
import { MiniFigure, MiniGrid } from '../../../../common/knowledge6e';

/**
 * Connaissances de la leçon « Périmètres » (6e) — SOURCE UNIQUE de vérité
 * (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à
 * l'instant où le geste vient de lui donner un sens, puis il reste sur la
 * carte. Rien n'est réécrit dans les modules.
 *
 * ORDRE — un item n'emploie QUE ce qui est déjà posé à son module ou avant :
 *
 *   M1  faire le tour → le mot PÉRIMÈTRE, et son unité (une LONGUEUR) ;
 *       puis la distinction avec le dedans (l'AIRE), au moment exact où
 *       l'élève est tenté de juger « plus grand » à la surface
 *   M2  la méthode du tour complet : chaque côté, une seule fois
 *   M3  les formules du rectangle et du carré, construites jeton par jeton
 *   M4  le tour du cercle : π, et P ≈ π × D (le diamètre, jamais le rayon)
 *   M5  les deux réflexes d'avant-calcul : même unité partout, estimer
 *   M6  la mise au travail : rien de neuf
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

    /* ── M1 — Le tour a un nom, une unité, et un voisin qu'il ne faut pas
           confondre avec lui. ── */
    1: [
      {
        id: 'perimetre',
        type: 'vocabulaire',
        title: 'Le périmètre',
        summary: 'La longueur du contour d’une figure : la distance parcourue en faisant le tour complet.',
        visual: (
          <MiniFigure
            points={[{ x: 5, y: 85 }, { x: 92, y: 92 }, { x: 100, y: 30 }, { x: 45, y: 5 }]}
            fill="#eef2ff"
            stroke="#4f46e5"
            width={130}
            height={92}
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              On part d’un coin, on suit chaque côté sans en sauter aucun, et on revient au point
              de départ. La longueur parcourue est le <strong>périmètre</strong>.
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-center text-sm text-slate-600">
              12 + 9 + 14 + 8 = <strong>43 m</strong> de clôture
            </div>
            <Souvenir>l’enclos du parc dont tu as tapé les quatre côtés, un par un.</Souvenir>
          </div>
        ),
      },
      {
        id: 'perimetre-est-longueur',
        type: 'regles',
        title: 'Un périmètre s’exprime en unité de LONGUEUR',
        summary: 'En m, cm, km — jamais en m², qui mesurent des surfaces.',
        body: (
          <div className="space-y-2">
            <p>
              Le contour est un trait qu’on pourrait dérouler en une ligne droite : c’est une
              longueur, et rien d’autre. On commande la clôture au mètre.
            </p>
            <Piege>
              Écrire « le périmètre du terrain vaut 50 m² » n’a aucun sens : les m² comptent des
              carreaux de surface, pas des mètres de bord.
            </Piege>
            <Souvenir>le bon de commande du gardien, libellé en mètres.</Souvenir>
          </div>
        ),
      },
      {
        id: 'perimetre-vs-aire',
        type: 'concepts',
        title: 'Le tour ne se devine pas au dedans',
        summary: 'La quantité de surface s’appelle l’aire. Un enclos peut avoir un grand dedans et un petit tour — et l’inverse.',
        visual: (
          <div className="flex items-end gap-3">
            <MiniGrid cols={8} rows={1} filled={Array.from({ length: 8 }, (_, i) => ({ r: 0, c: i }))} cell={14} color="#a5b4fc" />
            <MiniGrid cols={3} rows={3} filled={Array.from({ length: 9 }, (_, i) => ({ r: Math.floor(i / 3), c: i % 3 }))} cell={14} color="#a5b4fc" />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm space-y-1">
              <div>Enclos allongé 8 × 1 : tour de <strong>18</strong> · dedans de <strong>8</strong></div>
              <div>Enclos ramassé 3 × 3 : tour de <strong>12</strong> · dedans de <strong>9</strong></div>
            </div>
            <p>
              Celui qui a le plus grand <strong>dedans</strong> (l’<strong>aire</strong>) n’est pas
              celui qui demande le plus de clôture. Ce sont deux grandeurs indépendantes.
            </p>
            <Piege>
              Devant un problème, la vraie question est : m’a-t-on demandé le <em>tour</em> ou le{' '}
              <em>dedans</em> ? L’unité de la réponse le confirme — des m pour un tour, des m² pour
              une surface.
            </Piege>
            <Souvenir>les deux enclos comparés à l’œil, et le verdict qui contredit l’intuition.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M2 — La méthode, valable pour TOUTE figure à côtés droits. ── */
    2: [
      {
        id: 'tour-complet',
        type: 'methodes',
        title: 'Le tour complet : chaque côté, une seule fois',
        summary: 'Relever la longueur de tous les côtés, sans en oublier ni en compter deux fois, puis tout additionner.',
        visual: (
          <MiniFigure
            points={[{ x: 5, y: 82 }, { x: 88, y: 88 }, { x: 98, y: 32 }, { x: 50, y: 3 }, { x: 12, y: 25 }]}
            fill="#e0f2fe"
            stroke="#0284c7"
            width={130}
            height={92}
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Une figure quelconque n’a aucune formule — mais elle a une méthode qui ne rate jamais :
              parcourir le contour dans l’ordre, en cochant chaque côté au passage.
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-center text-sm text-slate-600">
              10,5 + 6 + 7,5 + 6,5 + 9 = <strong>39,5 m</strong>
            </div>
            <Piege>
              L’erreur la plus fréquente n’est pas une erreur de calcul : c’est un côté oublié. Compte
              les côtés de la figure, puis compte les nombres de ton addition — les deux doivent
              coïncider.
            </Piege>
            <Souvenir>le massif à cinq côtés, et le calcul de Sami qui n’en comptait que quatre.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M3 — Les formules sortent d'une régularité observée. ── */
    3: [
      {
        id: 'formules-polygones',
        type: 'formules',
        title: 'Périmètre du rectangle et du carré',
        summary: 'Rectangle : P = 2 × (L + l). Carré : P = 4 × c. Des raccourcis du tour complet, pas de nouvelles règles.',
        visual: (
          <MiniFigure
            points={[{ x: 3, y: 78 }, { x: 97, y: 78 }, { x: 97, y: 12 }, { x: 3, y: 12 }]}
            fill="#f5f3ff"
            stroke="#7c3aed"
            rightAngles={[0, 1, 2, 3]}
            ticks={[{ edge: 0, count: 1 }, { edge: 2, count: 1 }, { edge: 1, count: 2 }, { edge: 3, count: 2 }]}
            width={130}
            height={86}
          />
        ),
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm space-y-1">
              <div className="font-mono font-bold text-slate-700">Rectangle : P = 2 × (L + l)</div>
              <div className="font-mono font-bold text-slate-700">Carré : P = 4 × c</div>
            </div>
            <p>
              Dans un rectangle, chaque côté a son jumeau : au lieu d’écrire L + l + L + l, on écrit
              une fois L + l et on double. Dans un carré, les quatre côtés sont identiques.
            </p>
            <Piege>
              P = L + l ne compte qu’un demi-tour. Et 2 × 7,5 pour un carré de côté 7,5 n’en compte
              que deux côtés sur quatre.
            </Piege>
            <Souvenir>les jetons que tu as assemblés pour écrire toi-même les deux formules.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M4 — Le tour d'une figure sans côtés. ── */
    4: [
      {
        id: 'pi',
        type: 'concepts',
        title: 'π (pi) : un peu plus de 3 diamètres',
        summary: 'Le tour d’un cercle vaut toujours un peu plus de trois fois son diamètre — ce nombre s’appelle π ≈ 3,14.',
        body: (
          <div className="space-y-2">
            <p>
              La roue a écrit son propre tour sur le sol : trois rubans-diamètres entiers, plus un
              petit reste. Ce nombre « un peu plus que 3 » est le même pour <strong>tous</strong> les
              cercles, grands ou petits.
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-center text-sm text-slate-600">
              π ≈ <strong>3,14</strong> — une valeur <strong>approchée</strong>, d’où le signe ≈
            </div>
            <Souvenir>la roue qui roule et tamponne ses diamètres, avec son petit reste orange.</Souvenir>
          </div>
        ),
      },
      {
        id: 'perimetre-cercle',
        type: 'formules',
        title: 'Longueur du cercle : P ≈ π × D',
        summary: 'On multiplie π par le DIAMÈTRE. Si on te donne le rayon, double-le d’abord : D = 2 × r.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm space-y-1">
              <div className="font-mono font-bold text-slate-700">P ≈ π × D ≈ 3,14 × D</div>
              <div>Roue de D = 50 cm : P ≈ 3,14 × 50 ≈ <strong>157 cm</strong></div>
            </div>
            <Piege>
              Multiplier π par le rayon donne la moitié du tour. Le diamètre traverse le cercle de
              part en part en passant par le centre : c’est LUI qui entre dans la formule.
            </Piege>
            <Souvenir>le bassin de rayon 3 m qu’il a fallu convertir en diamètre 6 m.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M5 — Les deux gestes qui précèdent le calcul. ── */
    5: [
      {
        id: 'meme-unite',
        type: 'regles',
        title: 'Même unité partout avant d’additionner',
        summary: 'Des mètres et des centimètres ne s’additionnent pas tels quels : on convertit d’abord.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-center text-sm text-slate-600">
              1 m + 40 cm = 100 cm + 40 cm = <strong>140 cm</strong> (soit 1,40 m) — jamais « 41 »
            </div>
            <p>
              Le nombre écrit sur un côté n’a de sens qu’avec son unité. Additionner 1 et 40 sans les
              ramener à la même unité ne compte rien de réel.
            </p>
            <p className="text-xs text-slate-500">
              L’unité finale se choisit ensuite pour que le nombre soit lisible : cm pour une pièce
              de monnaie, m pour un terrain, km pour un lac.
            </p>
            <Souvenir>le calcul de Lina, « 1 m + 40 cm = 41 », et ce qu’il fallait faire avant.</Souvenir>
          </div>
        ),
      },
      {
        id: 'estimer-avant',
        type: 'methodes',
        title: 'Estimer avant de calculer',
        summary: 'Remplacer chaque côté par un nombre rond proche — son arrondi — donne un ordre de grandeur du tour.',
        body: (
          <div className="space-y-2">
            <p>
              <strong>Arrondir</strong> une mesure, c’est la remplacer par le nombre rond le plus
              proche : 8,7 m devient 9 m, 6,2 m devient 6 m. Le tour calculé sur ces arrondis n’est
              pas le vrai périmètre, mais il en est tout proche — et il se calcule de tête.
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-sm text-slate-600 space-y-1">
              <div>① 8,7 ≈ 9 et 6,2 ≈ 6 → P ≈ 2 × (9 + 6) = <strong>30 m</strong></div>
              <div>② calcul exact : 2 × (8,7 + 6,2) = <strong>29,8 m</strong> ✓ tout proche</div>
            </div>
            <p>
              Le rituel du géomètre : <strong>estimer → calculer → écrire avec l’unité</strong>. Si
              le calcul s’éloigne beaucoup de l’estimation, l’erreur est dans le calcul.
            </p>
            <Souvenir>le potager estimé à 30 m avant même de poser l’opération.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mem-perimetres',
        type: 'memoriser',
        title: '⭐ Les quatre tours à connaître',
        summary: 'Figure quelconque : on additionne · Rectangle : 2 × (L + l) · Carré : 4 × c · Cercle : ≈ π × D.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1.5 text-center font-mono text-sm font-black text-rose-700">
              <div>Quelconque → somme de TOUS les côtés</div>
              <div>Rectangle → P = 2 × (L + l)</div>
              <div>Carré → P = 4 × c</div>
              <div>Cercle → P ≈ π × D &nbsp;(D = 2 × r)</div>
            </div>
            <p className="text-xs text-slate-500">
              Les trois premières se retrouvent toutes seules en faisant le tour ; seule celle du
              cercle demande de se souvenir de π ≈ 3,14.
            </p>
          </div>
        ),
      },
    ],
  },
};
