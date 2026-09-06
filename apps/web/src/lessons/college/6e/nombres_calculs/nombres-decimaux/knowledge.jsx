import React from 'react';
import MathText from '../../../../common/components/MathText';
import { PartsBar, MiniNumberLine, PlaceValue, MiniGrid } from '../../../../common/knowledge6e';

/**
 * Connaissances de la leçon « Nombres décimaux » (6e) — SOURCE UNIQUE de
 * vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à l'instant
 * où le geste vient de lui donner un sens, puis il reste sur la carte. Rien
 * n'est réécrit dans les modules : la brique et la carte montrent le même
 * texte.
 *
 * ORDRE — un item n'utilise QUE ce qui est déjà établi au module qui le
 * déclare, puisque la brique rend ce texte à sa position dans le flux
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md) :
 *
 *   M1  pourquoi les entiers ne suffisent pas : il y a de la place entre eux
 *   M2  découper l'unité : le dixième, puis le centième
 *   M3  la fraction décimale, et son numérateur / dénominateur
 *   M4  l'écriture à virgule, et ce que la virgule sépare
 *   M5  la valeur de position après la virgule, et les deux zéros
 *   M6  écritures équivalentes : plusieurs habits, une seule quantité
 *   M7  comparer et ranger des décimaux
 *   M8  la droite graduée qui se laisse zoomer, et l'encadrement
 *   M9  l'ordre de grandeur et l'arrondi à l'entier
 *
 * Les mots « fraction décimale », « dénominateur », « valeur de position »,
 * « ordre croissant », « encadrer » et « arrondi » n'apparaissent donc dans
 * aucun item avant le module qui les pose — c'est précisément le défaut que
 * cette carte répare.
 */

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

const Piege = ({ children }) => (
  <p className="text-xs text-rose-600">⚠️ {children}</p>
);

const Encart = ({ children }) => (
  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm">
    {children}
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ── M1 — Le déclencheur : il y a de la place entre deux entiers. ── */
    1: [
      {
        id: 'entre-deux-entiers',
        type: 'concepts',
        title: 'Entre deux entiers, il reste de la place',
        summary: "Une longueur, un prix, une contenance tombent rarement pile sur un entier : il faut des nombres pour l'espace entre les deux.",
        visual: (
          <MiniNumberLine
            min={3} max={4}
            ticks={[
              { at: 3, label: '3', strong: true },
              { at: 3.5 },
              { at: 4, label: '4', strong: true },
            ]}
            marks={[{ at: 3.7, label: '3,7' }]}
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              La planche mesurait plus de 3 m et moins de 4 m. Avec les seuls entiers, on ne
              pouvait rien dire de plus précis que « entre 3 et 4 ».
            </p>
            <p>
              Un <strong>nombre décimal</strong> sert exactement à cela : nommer une quantité qui
              tombe entre deux entiers.
            </p>
            <Souvenir>la règle où le repère s'arrêtait juste après 3, sans atteindre 4.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M2 — Découper l'unité : dixièmes puis centièmes. ── */
    2: [
      {
        id: 'dixieme',
        type: 'vocabulaire',
        title: 'Le dixième',
        summary: "L'unité partagée en 10 parts égales : chaque part est un dixième.",
        visual: <PartsBar den={10} num={3} color="#38bdf8" />,
        body: (
          <div className="space-y-2">
            <Encart>
              1 unité = 10 dixièmes &nbsp;·&nbsp; un dixième s'écrit{' '}
              <MathText>{'$\\frac{1}{10}$'}</MathText>
            </Encart>
            <p>
              Le nombre du <strong>bas</strong> dit en combien de parts égales l'unité a été
              coupée ; le nombre du <strong>haut</strong> dit combien de ces parts on prend. Trois
              parts sur dix, c'est <MathText>{'$\\frac{3}{10}$'}</MathText>.
            </p>
            <Souvenir>le coup de ciseaux qui a partagé la bande en 10.</Souvenir>
          </div>
        ),
      },
      {
        id: 'centieme',
        type: 'vocabulaire',
        title: 'Le centième',
        summary: 'Chaque dixième recoupé en 10 : la même unité vaut alors 100 centièmes.',
        visual: <MiniGrid cols={10} rows={10} filled={Array.from({ length: 10 }, (_, c) => ({ r: 0, c })).concat([{ r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }])} cell={9} color="#a78bfa" />,
        body: (
          <div className="space-y-2">
            <Encart>
              1 unité = 100 centièmes &nbsp;·&nbsp; <strong>1 dixième = 10 centièmes</strong>
            </Encart>
            <p>
              Sur la grille, une <strong>ligne entière</strong> vaut un dixième, et une{' '}
              <strong>petite case</strong> vaut un centième. On peut recommencer : chaque centième
              recoupé en 10 donne un millième.
            </p>
            <Piege>
              Découper plus finement ne donne pas « plus de quantité » : l'unité de départ ne
              change jamais de taille, seules les parts rétrécissent.
            </Piege>
            <Souvenir>les 37 petites cases que tu as coloriées : 3 lignes pleines, puis 7 cases.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M3 — L'écriture en fraction décimale. ── */
    3: [
      {
        id: 'fraction-decimale',
        type: 'vocabulaire',
        title: 'Une fraction décimale',
        summary: "Une fraction dont le nombre du bas est 10, 100 ou 1 000 — celui du découpage de l'unité.",
        visual: <PartsBar den={10} num={7} color="#0ea5e9" />,
        body: (
          <div className="space-y-2">
            <Encart>
              <MathText>{'$\\frac{7}{10}$'}</MathText>
              <span className="text-slate-400 mx-3">·</span>
              <MathText>{'$\\frac{25}{100}$'}</MathText>
              <span className="text-slate-400 mx-3">·</span>
              <MathText>{'$\\frac{405}{100}$'}</MathText>
            </Encart>
            <p>
              Le nombre du bas s'appelle le <strong>dénominateur</strong> : il rappelle en combien
              de parts l'unité a été coupée. Celui du haut s'appelle le{' '}
              <strong>numérateur</strong> : il compte les parts prises.
            </p>
            <p className="text-xs text-slate-500">
              Une fraction décimale peut dépasser l'unité :{' '}
              <MathText>{'$\\frac{405}{100}$'}</MathText> contient 4 paquets de 100 centièmes —
              donc 4 unités entières — et il reste 5 centièmes.
            </p>
            <Souvenir>les trois dessins dont tu as construit la fraction à la main.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M4 — L'écriture à virgule. ── */
    4: [
      {
        id: 'ecriture-virgule',
        type: 'concepts',
        title: "L'écriture à virgule",
        summary: 'La virgule sépare les unités entières (à gauche) des parts d’unité (à droite).',
        visual: (
          <PlaceValue
            columns={[
              { label: 'unités', digit: '3' },
              { label: 'dixièmes', digit: '7' },
            ]}
            comma={0}
          />
        ),
        body: (
          <div className="space-y-2">
            <Encart>
              <MathText>{'$3 + \\frac{7}{10} = \\frac{37}{10} = 3{,}7$'}</MathText>
            </Encart>
            <p>
              Trois écritures, une seule quantité. Pour passer de la fraction décimale à la
              virgule, on cherche combien d'unités entières tiennent dans le numérateur, et ce
              qu'il reste ensuite.
            </p>
            <Souvenir>les 37 dixièmes que tu as répartis en 3 unités et 7 dixièmes.</Souvenir>
          </div>
        ),
      },
      {
        id: 'colonnes-decimales',
        type: 'regles',
        title: 'Après la virgule, chaque colonne vaut 10 fois moins',
        summary: 'Unités, puis dixièmes, puis centièmes, puis millièmes — la règle des entiers continue.',
        visual: (
          <PlaceValue
            columns={[
              { label: 'unités', digit: '4' },
              { label: 'dixièmes', digit: '5' },
              { label: 'centièmes', digit: '8' },
              { label: 'millièmes', digit: '2' },
            ]}
            comma={0}
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Le tableau ne s'arrête pas à la virgule : il continue vers la droite avec des parts
              de plus en plus petites. La virgule ne coupe pas le nombre en deux, elle marque
              seulement l'endroit où l'on passe des unités entières aux parts d'unité.
            </p>
            <Souvenir>le traducteur où tu as posé chaque chiffre dans sa colonne.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M5 — La valeur de position, et les deux zéros. ── */
    5: [
      {
        id: 'valeur-position-decimale',
        type: 'concepts',
        title: 'La valeur de position après la virgule',
        summary: "Un chiffre après la virgule vaut ce que sa colonne lui donne : 0,3 ou 0,03 ou 0,003.",
        visual: (
          <PlaceValue
            columns={[
              { label: 'unités', digit: '7' },
              { label: 'dixièmes', digit: '3' },
              { label: 'centièmes', digit: '0' },
              { label: 'millièmes', digit: '5' },
            ]}
            comma={0}
            highlight={3}
          />
        ),
        body: (
          <div className="space-y-2">
            <Encart>
              <MathText>{'$7{,}305 = 7 + \\frac{3}{10} + \\frac{0}{100} + \\frac{5}{1000}$'}</MathText>
            </Encart>
            <p>
              Le 3 vaut 3 dixièmes (0,3) et le 5 vaut 5 millièmes (0,005), bien que 5 soit plus
              grand que 3. Comme pour les entiers, c'est la <strong>colonne</strong> qui décide.
            </p>
            <Souvenir>les trois chiffres de 7,305 que tu as cliqués un par un dans le tableau.</Souvenir>
          </div>
        ),
      },
      {
        id: 'deux-zeros',
        type: 'memoriser',
        title: '⭐ 4,5 = 4,50 mais 4,5 ≠ 4,05',
        summary: 'Un zéro à la fin ne change rien ; un zéro juste après la virgule décale tout.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1.5 text-center">
              <div className="text-sm font-black text-rose-700">
                zéro À LA FIN → même quantité
              </div>
              <div className="text-sm font-black text-rose-700">
                zéro JUSTE APRÈS LA VIRGULE → tout glisse d'une colonne
              </div>
            </div>
            <p>
              Dans 4,50 le 5 est resté aux dixièmes : 5 dixièmes, c'est 50 centièmes, la même
              quantité coloriée. Dans 4,05 le 5 est passé aux centièmes : dix fois moins.
            </p>
            <Piege>
              C'est l'erreur la plus coûteuse des décimaux, et elle revient à chaque comparaison.
            </Piege>
            <Souvenir>les deux grilles côte à côte où la surface coloriée n'était pas la même.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M6 — Le même nombre, plusieurs habits. ── */
    6: [
      {
        id: 'ecritures-equivalentes',
        type: 'regles',
        title: 'Plusieurs écritures, une seule quantité',
        summary: 'Fraction décimale ou virgule, avec ou sans zéro final : ce qui compte est la quantité.',
        body: (
          <div className="space-y-2">
            <Encart>
              <MathText>{'$\\frac{27}{10} = 2{,}7 = 2{,}70 = \\frac{270}{100}$'}</MathText>
            </Encart>
            <p>
              Pour trouver la fraction décimale d'un nombre à virgule, on regarde la{' '}
              <strong>dernière colonne occupée</strong> : elle donne le dénominateur. Dans 3,08 la
              dernière est celle des centièmes, donc{' '}
              <MathText>{'$3{,}08 = \\frac{308}{100}$'}</MathText>.
            </p>
            <Piege>
              Ni le nombre de chiffres ni la forme (fraction ou virgule) ne disent la quantité :{' '}
              <MathText>{'$\\frac{27}{100}$'}</MathText> et{' '}
              <MathText>{'$\\frac{27}{10}$'}</MathText> ont les mêmes chiffres et ne valent pas la
              même chose.
            </Piege>
            <Souvenir>les cinq écritures que tu as triées autour de 27/10.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M7 — Comparer, puis ranger. ── */
    7: [
      {
        id: 'comparer-decimaux',
        type: 'methodes',
        title: 'Comparer deux décimaux',
        summary: '① les parties entières ; ② à égalité, on complète avec des zéros et on compare colonne par colonne.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-sm text-slate-600 space-y-1">
              <div>① Compare d'abord ce qui est à gauche de la virgule.</div>
              <div>
                ② Égalité ? Complète avec des zéros pour avoir autant de chiffres après la
                virgule, puis compare de gauche à droite en t'arrêtant à la première différence.
              </div>
            </div>
            <Encart>
              <MathText>{'$2{,}37$'}</MathText> et <MathText>{'$2{,}4$'}</MathText> →{' '}
              <MathText>{'$2{,}40$'}</MathText> → 37 centièmes contre 40 centièmes →{' '}
              <MathText>{'$2{,}37 < 2{,}4$'}</MathText>
            </Encart>
            <Piege>
              Avoir plus de chiffres ne rend pas un nombre plus grand : comparer 37 et 4 comme des
              entiers est l'erreur numéro un. 37 compte des centièmes, 4 compte des dixièmes.
            </Piege>
            <Souvenir>le laboratoire où tu as dévoilé les colonnes jusqu'à la première différence.</Souvenir>
          </div>
        ),
      },
      {
        id: 'ranger-decimaux',
        type: 'vocabulaire',
        title: 'Ordre croissant et ordre décroissant',
        summary: 'Croissant : du plus petit au plus grand. Décroissant : du plus grand au plus petit.',
        body: (
          <div className="space-y-2">
            <Encart>
              <MathText>{'$2{,}05 < 2{,}15 < 2{,}5 = 2{,}50 < 2{,}55$'}</MathText>
            </Encart>
            <p>
              Ranger, c'est comparer plusieurs fois de suite. Deux écritures de la même quantité —
              comme 2,5 et 2,50 — occupent la même place : leur ordre entre elles n'a pas
              d'importance.
            </p>
            <Souvenir>les cinq cartes que tu as mises en file, dont deux cachaient le même nombre.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M8 — La droite qui se laisse zoomer. ── */
    8: [
      {
        id: 'zoom-droite',
        type: 'concepts',
        title: 'La droite graduée se laisse zoomer',
        summary: "Entre deux dixièmes il n'y a pas de trou : on repartage en 10, et on gagne une décimale.",
        visual: (
          <MiniNumberLine
            min={0.3} max={0.4}
            ticks={[
              { at: 0.3, label: '0,3', strong: true },
              { at: 0.32 }, { at: 0.34 }, { at: 0.36 }, { at: 0.38 },
              { at: 0.4, label: '0,4', strong: true },
            ]}
            marks={[{ at: 0.37, label: '0,37' }]}
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Chaque fois qu'on partage un intervalle en 10, chaque nouveau trait vaut dix fois
              moins et on gagne <strong>une décimale de plus</strong> : dixièmes, puis centièmes,
              puis millièmes.
            </p>
            <p className="text-xs text-slate-500">
              C'est pour cela qu'un nombre décimal peut désigner une position aussi précise que
              l'on veut.
            </p>
            <Souvenir>le zoom entre 0,3 et 0,4, et le curseur posé sur 0,37.</Souvenir>
          </div>
        ),
      },
      {
        id: 'encadrer-decimal',
        type: 'methodes',
        title: 'Encadrer un décimal',
        summary: "Le coincer entre deux repères : d'abord deux entiers, puis deux dixièmes.",
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm space-y-1">
              <div><MathText>{'$4 < 4{,}37 < 5$'}</MathText></div>
              <div><MathText>{'$4{,}3 < 4{,}37 < 4{,}4$'}</MathText></div>
            </div>
            <p>
              La partie entière donne le premier encadrement ; le premier chiffre après la
              virgule donne le second. Plus les deux repères sont proches, plus on sait
              précisément où se trouve le nombre.
            </p>
            <Souvenir>les deux encadrements de 4,37, de plus en plus serrés.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M9 — Estimer avant de calculer. ── */
    9: [
      {
        id: 'arrondi-entier',
        type: 'methodes',
        title: "L'arrondi à l'unité",
        summary: "Remplacer un décimal par l'entier dont il est le plus proche — la moitié de l'intervalle décide.",
        visual: (
          <MiniNumberLine
            min={1} max={2}
            ticks={[
              { at: 1, label: '1', strong: true },
              { at: 1.5, label: '1,5' },
              { at: 2, label: '2', strong: true },
            ]}
            marks={[{ at: 1.98, label: '1,98' }]}
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Le repère utile est la <strong>moitié de l'intervalle</strong>. Au-dessus, on est
              plus proche de l'entier du haut ; en dessous, de celui du bas.
            </p>
            <Encart>
              1,98 est à 0,02 de 2 mais à 0,98 de 1 : son arrondi à l'unité est{' '}
              <strong>2</strong>.
            </Encart>
            <Souvenir>les quatre situations placées sur la droite entre deux entiers.</Souvenir>
          </div>
        ),
      },
      {
        id: 'ordre-grandeur-decimal',
        type: 'concepts',
        title: "L'ordre de grandeur",
        summary: "Le résultat approché qu'on attend avant de calculer, pour vérifier ensuite que le résultat exact est plausible.",
        body: (
          <div className="space-y-2">
            <Encart>
              <MathText>{'$19{,}8 + 5{,}1$'}</MathText>
              <span className="text-slate-400 mx-2">→</span>
              environ <MathText>{'$20 + 5 = 25$'}</MathText>
            </Encart>
            <p>
              On remplace chaque nombre par l'entier le plus proche, on calcule de tête, et on
              garde ce repère. Si le résultat exact s'en éloigne beaucoup, c'est qu'il y a une
              erreur — le plus souvent une virgule mal placée.
            </p>
            <p className="text-xs text-slate-500">
              Le réflexe complet : <strong>j'estime, je calcule, je compare</strong>.
            </p>
            <Souvenir>le total annoncé à 62,50 € alors qu'on en attendait 6.</Souvenir>
          </div>
        ),
      },
    ],
  },
};
