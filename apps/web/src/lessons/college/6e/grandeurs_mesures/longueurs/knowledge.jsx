import React from 'react';
import { UnitLadder, MiniNumberLine, MiniFigure } from '../../../../common/knowledge6e';

/**
 * Connaissances de la leçon « Longueurs » (6e) — SOURCE UNIQUE de vérité
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
 *   M1  une longueur ne change pas quand on change d'unité ; on choisit
 *       l'unité selon la taille de ce qu'on mesure
 *   M2  mesurer = lire DEUX positions et faire la différence
 *   M3  l'escalier km · m · cm · mm, construit sur la règle
 *   M4  convertir : d'abord le sens, ensuite le calcul
 *   M5  estimer avant de mesurer, en s'appuyant sur une référence connue
 *   M6  le périmètre : la longueur du contour
 *
 * Les mots « ordre de grandeur » et « périmètre » n'apparaissent donc dans
 * aucun item avant M5 et M6, où ils sont posés.
 */

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

const Piege = ({ children }) => <p className="text-xs text-rose-600">⚠️ {children}</p>;

/** Petite ligne d'égalité, réutilisée par plusieurs items. */
const Egalite = ({ children }) => (
  <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-center font-mono text-sm font-bold text-slate-700">
    {children}
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ── M1 — Quatre unités pour une seule distance. ─────────────── */
    1: [
      {
        id: 'longueur-invariante',
        type: 'concepts',
        title: 'Changer d’unité ne change pas la longueur',
        summary: 'Le trajet reste le même ; seuls l’unité et le nombre changent.',
        visual: <UnitLadder steps={['km', 'm', 'cm', 'mm']} highlight={[0, 3]} width={200} />,
        body: (
          <div className="space-y-2">
            <p>
              Paris–Lyon ne devient pas plus long parce qu’on l’écrit en millimètres. La distance
              est la même ; c’est <strong>l’unité</strong> qui rapetisse, donc le nombre qui grossit.
            </p>
            <Egalite>465 km = 465 000 000 mm</Egalite>
            <Souvenir>le sélecteur d’unités : tu changeais d’unité, la route ne bougeait pas.</Souvenir>
          </div>
        ),
      },
      {
        id: 'unite-adaptee',
        type: 'regles',
        title: 'On choisit l’unité selon ce qu’on mesure',
        summary: 'km pour les grandes distances, m, cm, et mm pour les détails.',
        visual: <UnitLadder steps={['km', 'm', 'cm', 'mm']} width={200} />,
        body: (
          <div className="space-y-2">
            <p>
              Une bonne unité donne un nombre qu’on lit d’un coup d’œil. Une mauvaise unité donne un
              nombre juste… mais illisible.
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-sm space-y-1">
              <div>🖊️ un stylo → <strong className="font-mono">cm</strong></div>
              <div>🚪 une porte → <strong className="font-mono">m</strong></div>
              <div>🪙 l’épaisseur d’une pièce → <strong className="font-mono">mm</strong></div>
              <div>🏙️ deux villes → <strong className="font-mono">km</strong></div>
            </div>
            <Piege>
              465 000 000 mm n’est pas une erreur de calcul : c’est une erreur de choix d’unité.
            </Piege>
            <Souvenir>l’annonce de Léo, exacte et pourtant impossible à lire.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M2 — Le piège du zéro : une longueur est une différence. ── */
    2: [
      {
        id: 'mesurer-difference',
        type: 'methodes',
        title: 'Mesurer avec une règle',
        summary: 'Je lis où l’objet commence, où il finit, et je fais la différence.',
        visual: (
          <MiniNumberLine
            min={0}
            max={12}
            ticks={[
              { at: 0, label: '0', strong: true },
              { at: 3, label: '3', strong: true },
              { at: 6 },
              { at: 9, label: '9', strong: true },
              { at: 12, label: '12', strong: true },
            ]}
            marks={[{ at: 6, label: '6 cm' }]}
          />
        ),
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-sm text-slate-600 space-y-1">
              <div>① je repère la graduation du <strong>début</strong> ;</div>
              <div>② je repère la graduation de la <strong>fin</strong> ;</div>
              <div>③ longueur = <strong>fin − début</strong>.</div>
            </div>
            <Egalite>9 − 3 = 6 cm</Egalite>
            <Souvenir>le crayon que tu as fait glisser : il ne partait pas de 0.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mem-piege-du-zero',
        type: 'memoriser',
        title: '⭐ Le piège du zéro',
        summary: 'Un objet posé sur une règle ne commence pas forcément à 0.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 text-center space-y-1.5">
              <div className="text-sm font-black text-rose-700">Une longueur n’est jamais UN nombre lu</div>
              <div className="text-sm font-black text-rose-700">C’est toujours une DIFFÉRENCE entre deux</div>
            </div>
            <p className="text-xs text-slate-500">
              Si l’objet part vraiment de 0, la différence donne quand même la bonne réponse :
              fin − 0 = fin. La méthode marche toujours, le raccourci non.
            </p>
          </div>
        ),
      },
    ],

    /* ── M3 — L'escalier des unités, lu sur la règle. ───────────── */
    3: [
      {
        id: 'escalier-longueurs',
        type: 'regles',
        title: 'L’escalier km · m · cm · mm',
        summary: '1 km = 1 000 m, 1 m = 100 cm, 1 cm = 10 mm.',
        visual: <UnitLadder steps={['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm']} highlight={[0, 3, 5, 6]} />,
        body: (
          <div className="space-y-2">
            <p>
              Chaque marche de l’escalier vaut <strong>×10</strong>. Descendre de trois marches (du
              km au m) vaut donc ×10×10×10, c’est-à-dire <strong>×1 000</strong>.
            </p>
            <Egalite>1 km = 1 000 m = 100 000 cm = 1 000 000 mm</Egalite>
            <p className="text-xs text-slate-500">
              hm, dam et dm existent aussi, mais on s’en sert peu : les quatre unités utiles au
              quotidien sont km, m, cm et mm.
            </p>
            <Souvenir>les deux rangées de la règle : 3 cm et 30 mm tombaient au même endroit.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M4 — Convertir, c'est d'abord choisir un sens. ─────────── */
    4: [
      {
        id: 'convertir-methode',
        type: 'methodes',
        title: 'Convertir en deux temps',
        summary: 'D’abord je décide si le nombre grandit ou rapetisse, ensuite je calcule.',
        visual: <UnitLadder steps={['km', 'm', 'cm', 'mm']} highlight={[1, 2]} width={200} />,
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-sm text-slate-600 space-y-1">
              <div>① l’unité d’arrivée est-elle plus petite ou plus grande ?</div>
              <div>② combien de marches sépare les deux unités ?</div>
              <div>③ j’applique ×10, ×100 ou ×1 000 — ou la division.</div>
            </div>
            <Egalite>2 m = 2 × 100 = 200 cm</Egalite>
            <Souvenir>le segment qui gardait la même longueur pendant que tu changeais d’unité.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mem-sens-conversion',
        type: 'memoriser',
        title: '⭐ Unité plus petite → nombre plus grand',
        summary: 'Il faut plus de petites unités pour couvrir la même longueur.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1.5 text-center">
              <div className="text-sm font-black text-rose-700">m → cm : unité plus PETITE, nombre plus GRAND</div>
              <div className="text-sm font-black text-rose-700">cm → m : unité plus GRANDE, nombre plus PETIT</div>
            </div>
            <Piege>
              « 3 m = 30 cm » se repère sans calculer : le nombre a bien grandi, mais pas assez —
              il manque une marche.
            </Piege>
          </div>
        ),
      },
    ],

    /* ── M5 — Estimer : la valeur plausible, avant l'instrument. ── */
    5: [
      {
        id: 'estimation-plausible',
        type: 'concepts',
        title: 'Estimer une longueur',
        summary: 'Annoncer une valeur plausible, avec son unité, sans instrument.',
        visual: (
          <MiniNumberLine
            min={0}
            max={5}
            ticks={[
              { at: 0, label: '0', strong: true },
              { at: 1 },
              { at: 2, label: '2', strong: true },
              { at: 3 },
              { at: 4 },
              { at: 5, label: '5 m', strong: true },
            ]}
            marks={[{ at: 2, label: 'une porte' }]}
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Estimer, ce n’est pas deviner au hasard : c’est annoncer la valeur <strong>et</strong>{' '}
              l’unité qui tiennent debout. Une porte de 20 cm ou de 20 m, on sait tout de suite que
              c’est impossible.
            </p>
            <p className="text-xs text-slate-500">
              L’estimation sert d’alarme : si le calcul donne un résultat très loin de ce que tu
              attendais, c’est qu’il y a une erreur quelque part.
            </p>
            <Souvenir>le curseur que tu as posé vers 2 m, avant de voir la vraie valeur.</Souvenir>
          </div>
        ),
      },
      {
        id: 'reference-connue',
        type: 'methodes',
        title: 'S’appuyer sur une référence connue',
        summary: 'Je compare l’objet à une longueur que je connais par cœur.',
        visual: (
          <MiniFigure
            points={[
              { x: 8, y: 5 },
              { x: 8, y: 95 },
              { x: 48, y: 95 },
              { x: 48, y: 5 },
            ]}
            labels={[{ x: 76, y: 54, text: '≈ 2 × 1 m' }]}
            width={170}
            height={100}
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Une longueur familière sert de mètre-étalon dans la tête : la hauteur d’une porte fait
              environ deux fois 1 m, un pas d’adulte fait à peu près 1 m aussi.
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-sm space-y-1">
              <div>1 m ≈ un grand pas</div>
              <div>1 cm ≈ la largeur d’un ongle</div>
              <div>1 mm ≈ l’épaisseur d’une pièce de monnaie</div>
            </div>
            <Souvenir>la règle de 1 m que tu as fait glisser le long de la porte.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M6 — Le périmètre : faire le tour, puis additionner. ───── */
    6: [
      {
        id: 'perimetre-contour',
        type: 'concepts',
        title: 'Périmètre',
        summary: 'La longueur du contour d’une figure : on en fait le tour complet.',
        visual: (
          <MiniFigure
            points={[
              { x: 10, y: 30 },
              { x: 78, y: 30 },
              { x: 78, y: 82 },
              { x: 10, y: 82 },
            ]}
            labels={[
              { x: 44, y: 20, text: '25' },
              { x: 90, y: 60, text: '12' },
            ]}
            width={160}
            height={100}
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Le périmètre, c’est la distance parcourue quand on suit le bord de la figure jusqu’à
              revenir au point de départ. On l’obtient en additionnant <strong>tous</strong> les
              côtés.
            </p>
            <Egalite>25 + 12 + 25 + 12 = 74 m</Egalite>
            <Piege>
              Un seul côté ne suffit jamais : un rectangle dont un côté mesure 6 cm n’a pas un
              périmètre de 6 cm.
            </Piege>
            <Souvenir>les côtés que tu as tapés un par un, en faisant le tour.</Souvenir>
          </div>
        ),
      },
      {
        id: 'perimetre-rectangle',
        type: 'formules',
        title: 'Le raccourci du rectangle',
        summary: 'Périmètre du rectangle = 2 × (Longueur + largeur).',
        body: (
          <div className="space-y-2">
            <Egalite>2 × (L + l)</Egalite>
            <p>
              Ce n’est pas une nouvelle règle : dans un rectangle, les côtés opposés sont égaux
              deux à deux. Additionner une fois chaque longueur puis doubler donne exactement la
              même chose que d’additionner les quatre côtés.
            </p>
            <Egalite>6 + 4 + 6 + 4 = 2 × (6 + 4) = 20</Egalite>
            <Souvenir>le tour du rectangle, où tu retrouvais deux fois les mêmes nombres.</Souvenir>
          </div>
        ),
      },
      {
        id: 'perimetre-unite',
        type: 'regles',
        title: 'Un périmètre se mesure en unité de longueur',
        summary: 'En m, km, cm ou mm — jamais au carré.',
        body: (
          <div className="space-y-2">
            <p>
              Un périmètre EST une longueur : celle du contour, mise à plat. Il s’exprime donc avec
              les mêmes unités que n’importe quelle longueur.
            </p>
            <Piege>
              Écrire « périmètre = 74 m² » est faux : le petit 2 sert à autre chose, jamais à une
              longueur.
            </Piege>
            <Souvenir>le tour du terrain que tu as calculé : c’était bien des mètres.</Souvenir>
          </div>
        ),
      },
    ],
  },
};

export default LESSON_KNOWLEDGE;
