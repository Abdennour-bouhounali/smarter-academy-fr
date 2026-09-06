import React from 'react';
import { UnitLadder, MiniNumberLine } from '../../../../common/knowledge6e';

/**
 * Connaissances de la leçon « Masses » (6e) — SOURCE UNIQUE de vérité
 * (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à
 * l'instant où le geste vient de lui donner un sens, puis il reste sur la
 * carte. Rien n'est réécrit dans les modules : la brique et la carte
 * montrent le même texte (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *
 * ORDRE — un item n'emploie QUE ce qui est déjà posé au module qui le
 * déclare, puisque la brique rend ce texte à sa position dans le flux :
 *
 *   M1  la masse se compare sans chiffres : la balance penche
 *   M2  quatre unités, choisies selon ce qu'on pèse ; la masse ne change pas
 *   M3  l'équilibre dit une égalité ; lire une balance à affichage
 *   M4  l'escalier des masses : trois marches de dix, donc ×1 000
 *   M5  convertir : d'abord le sens, ensuite le calcul
 *   M6  estimer, et mettre tout dans la même unité avant de calculer
 *
 * Le mot « graduation » n'est employé qu'à partir de M3, où la lecture du
 * cadran le pose ; avant, on parle du plateau qui descend.
 */

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

const Piege = ({ children }) => <p className="text-xs text-rose-600">⚠️ {children}</p>;

const Egalite = ({ children }) => (
  <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-center font-mono text-sm font-bold text-slate-700">
    {children}
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ── M1 — Comparer sans chiffres : la balance à deux plateaux. ── */
    1: [
      {
        id: 'masse-comparable',
        type: 'concepts',
        title: 'La masse',
        summary: 'Ce qui fait qu’un objet est lourd ou léger — et qui se compare avant de se mesurer.',
        body: (
          <div className="space-y-2">
            <p>
              Deux objets peuvent être rangés du plus léger au plus lourd sans qu’aucun nombre
              n’apparaisse. La masse existe donc avant d’être chiffrée : elle se compare d’abord.
            </p>
            <p className="text-xs text-slate-500">
              Un gros objet n’est pas forcément le plus lourd : un cartable rempli de livres pèse
              plus qu’un ballon de plage bien plus volumineux.
            </p>
            <Souvenir>le crayon, la pomme, le cartable et le vélo que tu as rangés à l’œil.</Souvenir>
          </div>
        ),
      },
      {
        id: 'balance-plateaux',
        type: 'methodes',
        title: 'Lire une balance à deux plateaux',
        summary: 'Le plateau qui descend porte la masse la plus lourde ; à l’horizontale, c’est l’égalité.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-sm text-slate-600 space-y-1">
              <div>⬇️ un plateau descend → il est le plus lourd ;</div>
              <div>➖ les deux plateaux à l’horizontale → même masse des deux côtés.</div>
            </div>
            <p>
              Cette balance ne donne aucun nombre. Elle répond seulement à « lequel est le plus
              lourd ? » — et c’est déjà une mesure : une comparaison sûre.
            </p>
            <Souvenir>les objets que tu as posés de part et d’autre, et le plateau qui plongeait.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M2 — Quatre unités, et une masse qui ne bouge pas. ─────── */
    2: [
      {
        id: 'masse-invariante',
        type: 'concepts',
        title: 'Changer d’unité ne change pas la masse',
        summary: 'Le camion reste le même ; seuls l’unité et le nombre changent.',
        body: (
          <div className="space-y-2">
            <p>
              Écrire la masse du camion en milligrammes ne l’alourdit pas d’un gramme. C’est{' '}
              <strong>l’unité</strong> qui rapetisse, donc le nombre qui grossit.
            </p>
            <Egalite>12 t = 12 000 kg = 12 000 000 g</Egalite>
            <Souvenir>le sélecteur d’unités : le camion ne bougeait pas, le nombre devenait illisible.</Souvenir>
          </div>
        ),
      },
      {
        id: 'unite-masse-adaptee',
        type: 'regles',
        title: 'On choisit l’unité selon ce qu’on pèse',
        summary: 'mg pour un comprimé, g pour une pièce, kg pour un sac, t pour un camion.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-sm space-y-1">
              <div>💊 un comprimé → <strong className="font-mono">mg</strong></div>
              <div>🪙 une pièce de monnaie → <strong className="font-mono">g</strong></div>
              <div>🎒 un sac à dos → <strong className="font-mono">kg</strong></div>
              <div>🚚 un camion → <strong className="font-mono">t</strong></div>
            </div>
            <Piege>
              « Une voiture pèse 1 500 mg » n’est pas une faute de calcul : c’est un nombre
              raisonnable posé sur la mauvaise unité.
            </Piege>
            <Souvenir>les quatre objets que tu as appariés à leur unité.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M3 — L'équilibre chiffré, puis le cadran. ──────────────── */
    3: [
      {
        id: 'equilibre-egalite',
        type: 'regles',
        title: 'À l’équilibre, les deux totaux sont égaux',
        summary: 'Plusieurs petits poids peuvent valoir exactement un gros.',
        body: (
          <div className="space-y-2">
            <Egalite>100 g + 100 g + 100 g = 300 g</Egalite>
            <p>
              Ce que la balance à deux plateaux compare, ce n’est pas le nombre d’objets mais la{' '}
              <strong>somme des masses</strong> de chaque côté. Trois poids peuvent donc équilibrer
              un seul.
            </p>
            <Souvenir>les trois poids de 100 g qui ont remis la balance à l’horizontale.</Souvenir>
          </div>
        ),
      },
      {
        id: 'lire-graduation',
        type: 'methodes',
        title: 'Lire une graduation',
        summary: 'Je repère jusqu’où va le remplissage, puis je lis le trait atteint.',
        visual: (
          <MiniNumberLine
            min={0}
            max={2000}
            ticks={[
              { at: 0, label: '0', strong: true },
              { at: 500 },
              { at: 1000, label: '1000', strong: true },
              { at: 1500 },
              { at: 2000, label: '2000 g', strong: true },
            ]}
            marks={[{ at: 1250, label: '1250' }]}
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Sur un cadran, les traits sont régulièrement espacés : entre deux traits nommés,
              l’écart est toujours le même. Il suffit de compter les traits depuis 0.
            </p>
            <Piege>
              Ne lis pas le trait le plus proche par habitude : lis le trait que la barre atteint
              vraiment.
            </Piege>
            <Souvenir>les trois cadrans dont tu as tapé la graduation atteinte.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M4 — L'escalier des masses : trois marches de dix. ─────── */
    4: [
      {
        id: 'escalier-masses',
        type: 'regles',
        title: 'L’escalier mg · g · kg · t',
        summary: '1 g = 1 000 mg, 1 kg = 1 000 g, 1 t = 1 000 kg.',
        visual: <UnitLadder steps={['kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg']} highlight={[0, 3, 6]} />,
        body: (
          <div className="space-y-2">
            <p>
              Entre deux unités voisines de l’escalier, il y a <strong>×10</strong>. Or de kg à g
              — comme de g à mg — il y a trois marches : d’où le <strong>×1 000</strong> qu’on
              retient.
            </p>
            <Egalite>1 t = 1 000 kg = 1 000 000 g</Egalite>
            <p className="text-xs text-slate-500">
              hg, dag, dg et cg existent, mais on s’en sert peu : les quatre unités utiles au
              quotidien sont mg, g, kg et t.
            </p>
            <Souvenir>les dix blocs de 100 g que tu as empilés pour fabriquer 1 kg.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M5 — Convertir : le sens d'abord, le calcul ensuite. ──── */
    5: [
      {
        id: 'convertir-masse-methode',
        type: 'methodes',
        title: 'Convertir une masse en deux temps',
        summary: 'D’abord je décide si le nombre grandit ou rapetisse, ensuite je calcule.',
        visual: <UnitLadder steps={['kg', 'hg', 'dag', 'g']} highlight={[0, 3]} width={190} />,
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-sm text-slate-600 space-y-1">
              <div>① l’unité d’arrivée est-elle plus petite ou plus grande ?</div>
              <div>② combien de fois 1 000 sépare les deux unités ?</div>
              <div>③ je multiplie, ou je divise.</div>
            </div>
            <Egalite>3 kg = 3 × 1 000 = 3 000 g</Egalite>
            <Souvenir>la barre de masse qui gardait la même taille pendant que tu changeais d’unité.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mem-sens-conversion-masse',
        type: 'memoriser',
        title: '⭐ Unité plus petite → nombre plus grand',
        summary: 'Il faut plus de petites unités pour peser la même masse.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1.5 text-center">
              <div className="text-sm font-black text-rose-700">kg → g : unité plus PETITE, nombre plus GRAND</div>
              <div className="text-sm font-black text-rose-700">g → kg : unité plus GRANDE, nombre plus PETIT</div>
            </div>
            <Piege>
              « 2 kg = 200 g » se repère sans calculer : le nombre a grandi, mais d’une marche de
              trop peu.
            </Piege>
          </div>
        ),
      },
    ],

    /* ── M6 — Estimer, puis calculer proprement. ────────────────── */
    6: [
      {
        id: 'estimation-masse',
        type: 'concepts',
        title: 'Estimer une masse',
        summary: 'Annoncer une valeur plausible, avec son unité, avant tout calcul.',
        body: (
          <div className="space-y-2">
            <p>
              Estimer, ce n’est pas deviner au hasard : c’est annoncer la valeur <strong>et</strong>{' '}
              l’unité qui tiennent debout. Un sac à dos de 50 g ou de 500 kg, on sait tout de suite
              que c’est impossible.
            </p>
            <p className="text-xs text-slate-500">
              L’estimation sert d’alarme : si le calcul tombe très loin de ce que tu attendais,
              c’est qu’il y a une erreur — souvent une erreur d’unité.
            </p>
            <Souvenir>les quatre objets pour lesquels tu as éliminé les valeurs absurdes.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mem-meme-unite',
        type: 'memoriser',
        title: '⭐ Même unité avant d’additionner ou de soustraire',
        summary: 'On ne calcule jamais entre deux unités différentes.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 text-center space-y-1.5">
              <div className="text-sm font-black text-rose-700">3,2 kg − 400 g ❌</div>
              <div className="text-sm font-black text-rose-700">3 200 g − 400 g = 2 800 g ✅</div>
            </div>
            <p className="text-xs text-slate-500">
              Le premier geste d’un problème de masses n’est pas de calculer : c’est de tout
              ramener dans la même unité.
            </p>
          </div>
        ),
      },
    ],
  },
};

export default LESSON_KNOWLEDGE;
