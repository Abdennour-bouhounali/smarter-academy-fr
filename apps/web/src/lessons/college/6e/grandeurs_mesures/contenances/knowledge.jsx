import React from 'react';
import { UnitLadder, MiniNumberLine } from '../../../../common/knowledge6e';

/**
 * Connaissances de la leçon « Contenances » (6e) — SOURCE UNIQUE de vérité
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
 *   M1  la contenance ; la forme trompe, le transvasement tranche
 *   M2  le litre, repère à connaître ; lire un récipient gradué
 *   M3  quatre unités, choisies selon ce qu'on mesure
 *   M4  l'escalier L · dL · cL · mL, construit à la mesure
 *   M5  convertir : d'abord le sens, ensuite le calcul
 *   M6  le litre est un cube de 1 dm de côté ; même unité avant de calculer
 *
 * Le mot « contenance » est posé dès M1, sur le geste du transvasement :
 * c'est la cible de la leçon, et rien ne la nomme avant elle.
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

/** Le cube de 1 dm d'arête, dessiné en perspective cavalière — le seul
 *  visuel de la leçon qui sorte du plan, parce que c'est justement le sujet. */
const CubeDm = () => (
  <svg viewBox="0 0 150 120" aria-hidden="true" className="select-none w-full h-auto" style={{ maxWidth: 150 }}>
    <polygon points="30,40 100,40 100,100 30,100" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
    <polygon points="30,40 55,20 125,20 100,40" fill="#bae6fd" stroke="#0284c7" strokeWidth="2" />
    <polygon points="100,40 125,20 125,80 100,100" fill="#7dd3fc" stroke="#0284c7" strokeWidth="2" />
    <text x="65" y="114" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#0f172a" fontFamily="ui-monospace, monospace">
      1 dm
    </text>
    <text x="18" y="74" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#0f172a" fontFamily="ui-monospace, monospace">
      1 dm
    </text>
  </svg>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ── M1 — La forme trompe : ce qui compte, c'est ce qu'on verse. ── */
    1: [
      {
        id: 'contenance',
        type: 'concepts',
        title: 'Contenance',
        summary: 'La quantité de liquide qu’un récipient peut contenir quand il est plein.',
        body: (
          <div className="space-y-2">
            <p>
              La contenance ne se voit pas : elle se <strong>verse</strong>. Un récipient haut et
              fin peut en contenir moins qu’un récipient bas et large.
            </p>
            <Piege>
              « Il est plus grand, donc il contient plus » est faux. La hauteur seule ne dit rien,
              la largeur seule non plus.
            </Piege>
            <Souvenir>la bouteille qui a fait déborder la cruche, alors qu’elle semblait plus fine.</Souvenir>
          </div>
        ),
      },
      {
        id: 'meme-recipient-mesure',
        type: 'methodes',
        title: 'Comparer avec le même récipient',
        summary: 'Je remplis les deux avec le MÊME verre et je compte les versées.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-sm text-slate-600 space-y-1">
              <div>① je choisis un verre, toujours le même ;</div>
              <div>② je remplis le premier récipient en comptant les verres ;</div>
              <div>③ je recommence avec le second, puis je compare les deux nombres.</div>
            </div>
            <p>
              Sans le <strong>même</strong> verre des deux côtés, les deux nombres ne parlent pas
              de la même chose : la comparaison ne veut plus rien dire.
            </p>
            <Souvenir>les 4 verres du récipient A contre les 3 du récipient B.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M2 — Le litre, et la lecture d'un récipient gradué. ────── */
    2: [
      {
        id: 'litre-repere',
        type: 'vocabulaire',
        title: 'Le litre (L)',
        summary: 'L’unité de référence des contenances : à peu près une bouteille d’eau.',
        body: (
          <div className="space-y-2">
            <p>
              Compter en « verres » ne marche qu’entre nous. Pour que tout le monde comprenne la
              même chose, on utilise une unité commune : le <strong>litre</strong>, noté{' '}
              <strong className="font-mono">L</strong>.
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-sm space-y-1">
              <div>🍶 une bouteille d’eau classique ≈ 1 L</div>
              <div>🥛 un grand verre ≈ un quart de litre</div>
            </div>
            <Souvenir>le niveau que tu as amené exactement sur le repère 1 L.</Souvenir>
          </div>
        ),
      },
      {
        id: 'lire-recipient-gradue',
        type: 'methodes',
        title: 'Lire un récipient gradué',
        summary: 'Je regarde de combien monte chaque trait, puis je compte depuis le bas.',
        visual: (
          <MiniNumberLine
            min={0}
            max={2}
            ticks={[
              { at: 0, label: '0', strong: true },
              { at: 0.5 },
              { at: 1, label: '1 L', strong: true },
              { at: 1.5 },
              { at: 2, label: '2 L', strong: true },
            ]}
            marks={[{ at: 1.5, label: '1,5 L' }]}
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Les traits d’un récipient gradué sont régulièrement espacés : d’un trait au suivant,
              c’est toujours la même quantité. Il suffit de la repérer une fois, puis de compter.
            </p>
            <Piege>
              Le trait le plus haut n’est pas forcément « plein » : lis le niveau atteint par
              l’eau, pas le sommet du récipient.
            </Piege>
            <Souvenir>les trois verres dont tu as lu le niveau, graduation après graduation.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M3 — Quatre unités pour quatre échelles. ───────────────── */
    3: [
      {
        id: 'unite-contenance-adaptee',
        type: 'regles',
        title: 'On choisit l’unité selon ce qu’on mesure',
        summary: 'mL pour une dose, cL pour un verre, dL pour un bol, L pour une bouteille.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-sm space-y-1">
              <div>💊 une dose de sirop → <strong className="font-mono">mL</strong></div>
              <div>🥤 un petit verre de jus → <strong className="font-mono">cL</strong></div>
              <div>🥣 un bol de soupe → <strong className="font-mono">dL</strong></div>
              <div>🍶 une bouteille d’eau → <strong className="font-mono">L</strong></div>
            </div>
            <p>
              Une bonne unité donne un nombre qu’on lit d’un coup d’œil. Une mauvaise unité donne
              un nombre juste… mais illisible.
            </p>
            <Piege>
              « Une baignoire contient 3 mL » n’est pas une erreur de calcul : c’est un nombre
              raisonnable posé sur la mauvaise unité.
            </Piege>
            <Souvenir>les quatre situations que tu as appariées à leur unité.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M4 — L'escalier, construit à la mesure. ────────────────── */
    4: [
      {
        id: 'escalier-contenances',
        type: 'regles',
        title: 'L’escalier L · dL · cL · mL',
        summary: '1 L = 10 dL, 1 dL = 10 cL, 1 cL = 10 mL.',
        visual: <UnitLadder steps={['L', 'dL', 'cL', 'mL']} highlight={[0, 3]} width={190} />,
        body: (
          <div className="space-y-2">
            <p>
              Chaque marche vaut <strong>×10</strong>. Descendre les trois marches d’un coup, du
              litre au millilitre, vaut donc <strong>×1 000</strong>.
            </p>
            <Egalite>1 L = 10 dL = 100 cL = 1 000 mL</Egalite>
            <Souvenir>les dix mesures de 1 dL qu’il a fallu verser pour remplir le litre.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M5 — Convertir : le sens d'abord, le calcul ensuite. ──── */
    5: [
      {
        id: 'convertir-contenance-methode',
        type: 'methodes',
        title: 'Convertir en deux temps',
        summary: 'D’abord je décide si le nombre grandit ou rapetisse, ensuite je calcule.',
        visual: <UnitLadder steps={['L', 'dL', 'cL', 'mL']} highlight={[0, 2]} width={190} />,
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-sm text-slate-600 space-y-1">
              <div>① l’unité d’arrivée est-elle plus petite ou plus grande ?</div>
              <div>② combien de marches sépare les deux unités ?</div>
              <div>③ j’applique ×10, ×100 ou ×1 000 — ou la division.</div>
            </div>
            <Egalite>1,5 L = 100 cL + 50 cL = 150 cL</Egalite>
            <Souvenir>l’escalier que tu as parcouru avant de taper la valeur exacte.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mem-sens-conversion-contenance',
        type: 'memoriser',
        title: '⭐ Unité plus petite → nombre plus grand',
        summary: 'Il faut plus de petites unités pour contenir la même quantité.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1.5 text-center">
              <div className="text-sm font-black text-rose-700">L → cL : unité plus PETITE, nombre plus GRAND</div>
              <div className="text-sm font-black text-rose-700">cL → L : unité plus GRANDE, nombre plus PETIT</div>
            </div>
            <Piege>
              « 2 L = 20 mL » se repère sans calculer : le nombre a grandi d’une seule marche, alors
              qu’il en fallait trois.
            </Piege>
          </div>
        ),
      },
    ],

    /* ── M6 — Le litre entre dans un cube, et les problèmes se
           résolvent dans une seule unité. ─────────────────────── */
    6: [
      {
        id: 'litre-dm3',
        type: 'concepts',
        title: '1 L = 1 dm³',
        summary: 'Un litre, c’est exactement ce que contient un cube de 1 dm de côté.',
        visual: <CubeDm />,
        body: (
          <div className="space-y-2">
            <p>
              Le litre n’est pas tombé du ciel : c’est la contenance d’un cube dont chaque arête
              mesure <strong>1 dm</strong> — soit 10 cm, à peu près la largeur d’une main d’adulte.
            </p>
            <Egalite>1 L = 1 dm³</Egalite>
            <p className="text-xs text-slate-500">
              On lit « un décimètre cube ». Le petit 3 rappelle les trois dimensions du cube :
              longueur, largeur, hauteur.
            </p>
            <Souvenir>le cube que tu as rempli exactement avec une bouteille de 1 L.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mem-meme-unite-contenance',
        type: 'memoriser',
        title: '⭐ Même unité avant d’additionner ou de soustraire',
        summary: 'On ne calcule jamais entre deux unités différentes.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 text-center space-y-1.5">
              <div className="text-sm font-black text-rose-700">1 L + 50 cL ❌</div>
              <div className="text-sm font-black text-rose-700">100 cL + 50 cL = 150 cL ✅</div>
            </div>
            <p className="text-xs text-slate-500">
              Le premier geste d’un problème de contenances n’est pas de calculer : c’est de tout
              ramener dans la même unité.
            </p>
          </div>
        ),
      },
      {
        id: 'combiner-mesures',
        type: 'methodes',
        title: 'Atteindre une quantité en combinant des mesures',
        summary: 'J’additionne des mesures — et je peux aussi retirer pour redescendre.',
        body: (
          <div className="space-y-2">
            <p>
              Quand aucune mesure ne vaut exactement la quantité demandée, on l’obtient en{' '}
              <strong>combinant</strong> plusieurs versées.
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-sm text-slate-600 space-y-1">
              <div>80 cL = 50 cL + 30 cL</div>
              <div>70 cL = 50 cL + 50 cL − 30 cL</div>
            </div>
            <p className="text-xs text-slate-500">
              Dépasser puis retirer est une stratégie valable : c’est encore du calcul, pas de
              l’à-peu-près.
            </p>
            <Souvenir>le pichet que tu as trop rempli, puis vidé du bon nombre de centilitres.</Souvenir>
          </div>
        ),
      },
    ],
  },
};

export default LESSON_KNOWLEDGE;
