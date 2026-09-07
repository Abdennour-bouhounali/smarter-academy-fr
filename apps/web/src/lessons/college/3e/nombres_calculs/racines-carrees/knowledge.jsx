import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de la leçon « Racine carrée » (3e) — SOURCE UNIQUE de vérité
 * (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> au moment
 * exact où le geste vient de lui donner un sens, puis il reste disponible dans
 * la carte. Rien n'est réécrit dans les modules : la brique et la carte
 * montrent le même texte.
 *
 * ORDRE. Un item n'utilise QUE ce qui est déjà établi au module qui le
 * déclare, puisque la brique rend ce texte à sa position dans le flux :
 *   M1 √a, le côté du carré d'aire a  →  M2 carrés parfaits, √(n²) = n  →
 *   M3 encadrer, (√a)² = a, comparer par les carrés  →  M4 produit, quotient,
 *   et le contre-exemple de la somme  →  M5 simplifier a√b  →  M6 valeur
 *   exacte et valeur approchée en géométrie.
 * Le mot « simplifier » n'apparaît donc dans aucun item des modules 1 à 4, et
 * « carré parfait » dans aucun item du module 1.
 */

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

/** Le carré, figure fil rouge : l'aire dedans, le côté au bord. */
const SquareFig = ({ area, side, caption, tone = '#059669' }) => (
  <div className="space-y-1">
    <svg viewBox="0 0 150 130" role="img" aria-label={caption} style={{ maxWidth: 150 }} className="w-full h-auto">
      <rect x="30" y="14" width="90" height="90" fill={`${tone}18`} stroke={tone} strokeWidth="2.5" />
      <text x="75" y="64" textAnchor="middle" fontSize="15" fill={tone} fontFamily="monospace">
        {area}
      </text>
      <text x="75" y="120" textAnchor="middle" fontSize="13" fill="#475569" fontFamily="monospace">
        {side}
      </text>
    </svg>
    <p className="text-xs text-slate-500 text-center">{caption}</p>
  </div>
);

/** Le pavage 2×2 du carré d'aire 12 : quatre cases d'aire 3. */
const TilingFig = ({ caption }) => (
  <div className="space-y-1">
    <svg viewBox="0 0 140 130" role="img" aria-label={caption} style={{ maxWidth: 140 }} className="w-full h-auto">
      <rect x="25" y="14" width="90" height="90" fill="#f5f3ff" stroke="#7c3aed" strokeWidth="2.5" />
      <line x1="70" y1="14" x2="70" y2="104" stroke="#7c3aed" strokeWidth="1.5" />
      <line x1="25" y1="59" x2="115" y2="59" stroke="#7c3aed" strokeWidth="1.5" />
      {[[47, 36], [92, 36], [47, 81], [92, 81]].map(([x, y]) => (
        <text key={`${x}-${y}`} x={x} y={y} textAnchor="middle" fontSize="12" fill="#6d28d9" fontFamily="monospace">3</text>
      ))}
      <text x="70" y="120" textAnchor="middle" fontSize="12" fill="#475569" fontFamily="monospace">2 × √3</text>
    </svg>
    <p className="text-xs text-slate-500 text-center">{caption}</p>
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — L'objet de la leçon : le chemin inverse du carré, et son nom. */
    1: [
      {
        id: 'racine-carree',
        type: 'concepts',
        title: 'Racine carrée : le côté d’un carré d’aire donnée',
        summary: 'Pour un nombre a positif, √a est le nombre positif dont le carré vaut a — c’est le côté d’un carré d’aire a.',
        body: (
          <div className="space-y-3">
            <SquareFig area="aire 49" side="côté √49 = 7" caption="Un carré d’aire 49 a pour côté 7" />
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\sqrt{49} = 7 \\qquad \\text{car} \\qquad 7^{2} = 49$'}</MathText>
            </div>
            <p>Du côté vers l’aire, on élève au <strong>carré</strong> ; de l’aire vers le côté, on
            prend la <strong>racine carrée</strong>. Les deux chemins sont l’aller et le retour de la
            même figure.</p>
            <p className="text-xs text-slate-500">Ce n’est jamais la moitié : le côté d’un jardin de
            49 m² mesure 7 m, pas 24,5 m.</p>
            <Souvenir>le jardin qu’il fallait redimensionner jusqu’à ce que l’aire tombe pile.</Souvenir>
          </div>
        ),
      },
      {
        id: 'racine-existe-toujours',
        type: 'concepts',
        title: 'Une longueur existe même quand aucun décimal ne l’écrit',
        summary: 'Le côté d’un carré d’aire 50 est bien une longueur réelle : elle s’écrit √50, jamais exactement en chiffres après la virgule.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
              <div><MathText>{'$7^{2} = 49$'}</MathText> — trop petit</div>
              <div><MathText>{'$7{,}1^{2} = 50{,}41$'}</MathText> — trop grand</div>
            </div>
            <p>On saute par-dessus 50 sans jamais tomber dessus. Le jardin existe pourtant : son
            côté vaut exactement <MathText>{'$\\sqrt{50}$'}</MathText>.</p>
            <p className="text-xs text-slate-500">Le symbole √ n’est donc pas un aveu d’échec : c’est
            la seule façon d’écrire ce nombre <strong>exactement</strong>.</p>
            <Souvenir>le jardin du voisin, à 50 m², qui refusait tous les côtés essayés.</Souvenir>
          </div>
        ),
      },
    ],

    /* M2 — Le répertoire des cas qui tombent juste, et l'aller-retour n ↔ n². */
    2: [
      {
        id: 'carre-parfait',
        type: 'vocabulaire',
        title: 'Carré parfait',
        summary: 'Un carré parfait est l’aire d’un carré de côté ENTIER : sa racine carrée tombe juste.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$1,\\;4,\\;9,\\;16,\\;25,\\;36,\\;49,\\;64,\\;81,\\;100,\\;121,\\;144$'}</MathText>
            </div>
            <p>Ce sont les douze premières marches : <MathText>{'$1^{2}$'}</MathText> jusqu’à{' '}
            <MathText>{'$12^{2}$'}</MathText>. Les connaître, c’est douze racines exactes gratuites.</p>
            <p className="text-xs text-slate-500">Le test n’est pas « le nombre est-il rond ou pair » :
            20 est pair mais <MathText>{'$16 < 20 < 25$'}</MathText>, donc aucun côté entier ne
            convient. Les écarts entre marches grandissent (3, 5, 7, 9…), et entre 49 et 64 il n’y en
            a aucune.</p>
            <Souvenir>les douze marches de l’escalier, tapées une à une.</Souvenir>
          </div>
        ),
      },
      {
        id: 'racine-du-carre',
        type: 'regles',
        title: 'Le carré et la racine font l’aller-retour',
        summary: 'Pour n positif, √(n²) = n : élever au carré puis prendre la racine ramène au point de départ.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$8 \\;\\longrightarrow\\; 8^{2} = 64 \\;\\longrightarrow\\; \\sqrt{64} = 8$'}</MathText>
            </div>
            <p>Chaque marche relie trois écritures du même nombre : le côté, l’aire, et la racine de
            l’aire.</p>
            <p className="text-xs text-slate-500">Attention à la marche voisine :{' '}
            <MathText>{'$\\sqrt{121} = 11$'}</MathText> et non 12 — et surtout pas 60,5, qui serait la
            moitié.</p>
            <Souvenir>la marche qu’on tapait et qui affichait son aire.</Souvenir>
          </div>
        ),
      },
    ],

    /* M3 — Quand ça ne tombe pas juste : encadrer, annuler, comparer. */
    3: [
      {
        id: 'encadrement',
        type: 'methodes',
        title: 'Encadrer une racine entre deux entiers',
        summary: 'On cherche les deux carrés parfaits qui encadrent le nombre sous la racine ; leurs racines encadrent la racine cherchée.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
              <div><MathText>{'$16 < 20 < 25$'}</MathText></div>
              <div><MathText>{'$4 < \\sqrt{20} < 5$'}</MathText></div>
            </div>
            <p>Aucun décimal au dixième ne tombe juste non plus :{' '}
            <MathText>{'$4{,}4^{2} = 19{,}36$'}</MathText> et{' '}
            <MathText>{'$4{,}5^{2} = 20{,}25$'}</MathText>. On encadre donc, au lieu d’écrire
            exactement.</p>
            <p className="text-xs text-slate-500">Encadrer une racine, ce n’est jamais diviser par 2 :
            on compare les <strong>carrés</strong>, pas les nombres eux-mêmes.</p>
            <Souvenir>le carré qui virait au bleu puis au rouge de part et d’autre de 20.</Souvenir>
          </div>
        ),
      },
      {
        id: 'carre-de-la-racine',
        type: 'formules',
        title: 'Élever une racine au carré l’annule',
        summary: 'Pour a positif, (√a)² = a : le côté √a, mis au carré, redonne l’aire a.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\left(\\sqrt{a}\\right)^{2} = a \\qquad \\left(\\sqrt{13}\\right)^{2} = 13$'}</MathText>
            </div>
            <p>C’est la même figure lue dans l’autre sens :{' '}
            <MathText>{'$\\sqrt{13}$'}</MathText> est le côté d’un carré d’aire 13, donc son carré
            vaut 13.</p>
            <p className="text-xs text-slate-500">À ne pas confondre avec{' '}
            <MathText>{'$13^{2} = 169$'}</MathText> : là, c’est 13 qu’on a élevé au carré, pas sa
            racine.</p>
            <Souvenir>l’aire lue sur le carré dont on tenait le côté.</Souvenir>
          </div>
        ),
      },
      {
        id: 'comparer-par-carres',
        type: 'methodes',
        title: 'Comparer deux longueurs : comparer leurs carrés',
        summary: 'Entre deux nombres positifs, le plus grand est celui dont le carré est le plus grand — donc le carré de plus grande aire.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$50 > 49 = 7^{2} \\;\\Longrightarrow\\; \\sqrt{50} > 7$'}</MathText>
            </div>
            <p>Le carré de côté <MathText>{'$\\sqrt{50}$'}</MathText> a pour aire 50, celui de côté 7
            a pour aire 49 : le plus grand carré a le plus grand côté.</p>
            <p className="text-xs text-slate-500">Aucune calculatrice n’est nécessaire, et aucun
            arrondi n’intervient — c’est ce qui rend la méthode sûre.</p>
            <Souvenir>les deux cartes côte à côte, aire contre aire.</Souvenir>
          </div>
        ),
      },
    ],

    /* M4 — Ce qui passe sous la racine, et ce qui ne passe pas. */
    4: [
      {
        id: 'produit-racines',
        type: 'formules',
        title: 'Le produit passe sous la racine',
        summary: 'Pour a et b positifs, √a × √b = √(a × b) : deux racines se réunissent sous une seule.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\sqrt{a} \\times \\sqrt{b} = \\sqrt{a \\times b}$'}</MathText>
            </div>
            <p>Le rectangle de côtés <MathText>{'$\\sqrt{4}$'}</MathText> et{' '}
            <MathText>{'$\\sqrt{9}$'}</MathText> mesure 2 sur 3 : son aire vaut 36, comme celle du
            carré de côté <MathText>{'$\\sqrt{36}$'}</MathText>.</p>
            <p className="text-xs text-slate-500">Un produit de racines peut ainsi redevenir un
            entier tout simple : <MathText>{'$\\sqrt{2} \\times \\sqrt{18} = \\sqrt{36} = 6$'}</MathText>.</p>
            <Souvenir>les deux carrés collés en rectangle, paire après paire.</Souvenir>
          </div>
        ),
      },
      {
        id: 'somme-ne-passe-pas',
        type: 'memoriser',
        title: '⭐ La somme ne passe PAS sous la racine',
        summary: '√(a + b) n’est pas √a + √b — c’est le piège n°1 du chapitre, et la figure le montre.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-2">
            <div className="text-center">
              <MathText>{'$\\sqrt{a + b} \\neq \\sqrt{a} + \\sqrt{b}$'}</MathText>
            </div>
            <p className="text-sm text-rose-900">Les nombres le disent :{' '}
            <MathText>{'$\\sqrt{9} + \\sqrt{16} = 3 + 4 = 7$'}</MathText>, alors que{' '}
            <MathText>{'$\\sqrt{25} = 5$'}</MathText>.</p>
            <p className="text-xs text-rose-700">Et la figure aussi : les deux carrés posés bout à
            bout dépassent nettement le côté du carré d’aire 25. La soustraction ne passe pas
            davantage.</p>
            <Souvenir>la règle rose (7) qui dépassait le carré en pointillés (5).</Souvenir>
          </div>
        ),
      },
      {
        id: 'quotient-racines',
        type: 'formules',
        title: 'Le quotient passe aussi',
        summary: 'Pour a positif et b strictement positif, √a ÷ √b = √(a ÷ b).',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\dfrac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\dfrac{a}{b}}$'}</MathText>
            </div>
            <p>La division suit exactement la logique de la multiplication :{' '}
            <MathText>{'$\\dfrac{\\sqrt{50}}{\\sqrt{2}} = \\sqrt{25} = 5$'}</MathText>.</p>
            <p className="text-xs text-slate-500">Deux opérations passent, deux ne passent pas : le
            produit et le quotient oui, la somme et la différence non.</p>
            <Souvenir>le rectangle qu’on découpe au lieu de l’assembler.</Souvenir>
          </div>
        ),
      },
    ],

    /* M5 — Écrire la même longueur plus proprement. */
    5: [
      {
        id: 'simplifier-racine',
        type: 'methodes',
        title: 'Simplifier une racine : extraire le plus grand carré parfait',
        summary: 'On écrit le nombre sous la racine comme un carré parfait FOIS le reste, puis on sort la racine de ce carré : √(k² × m) = k√m.',
        body: (
          <div className="space-y-3">
            <TilingFig caption="Aire 12, découpée en quatre cases d’aire 3 : le côté vaut 2√3" />
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\sqrt{12} = \\sqrt{4 \\times 3} = \\sqrt{4} \\times \\sqrt{3} = 2\\sqrt{3}$'}</MathText>
            </div>
            <ol className="text-sm list-decimal list-inside space-y-1">
              <li>Chercher le <strong>plus grand</strong> carré parfait qui divise le nombre (4, 9, 16, 25, 36…).</li>
              <li>L’écrire en facteur : <MathText>{'$12 = 4 \\times 3$'}</MathText>.</li>
              <li>Sortir sa racine, pas lui-même : <MathText>{'$\\sqrt{4} = 2$'}</MathText>.</li>
            </ol>
            <p className="text-xs text-slate-500">Prendre un carré trop petit oblige à recommencer :{' '}
            <MathText>{'$\\sqrt{72} = 2\\sqrt{18}$'}</MathText> se simplifie encore, alors que{' '}
            <MathText>{'$6\\sqrt{2}$'}</MathText> est fini.</p>
            <Souvenir>le découpage 2×2, le seul dont les cases tombaient sur une aire entière.</Souvenir>
          </div>
        ),
      },
      {
        id: 'coefficient-sous-racine',
        type: 'regles',
        title: 'Faire rentrer un coefficient : il passe au carré',
        summary: 'Un nombre écrit devant la racine rentre dessous élevé au carré : a√b = √(a² × b).',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$2\\sqrt{3} = \\sqrt{2^{2}} \\times \\sqrt{3} = \\sqrt{4 \\times 3} = \\sqrt{12}$'}</MathText>
            </div>
            <p>Le 2 ne devient pas un simple facteur sous la racine : il vaut{' '}
            <MathText>{'$\\sqrt{4}$'}</MathText>, donc il compte double une fois rentré.</p>
            <p className="text-xs text-slate-500">D’où le piège :{' '}
            <MathText>{'$2\\sqrt{3} \\neq \\sqrt{6}$'}</MathText>. Pour vérifier, on élève au carré :{' '}
            <MathText>{'$\\left(2\\sqrt{3}\\right)^{2} = 4 \\times 3 = 12$'}</MathText>.</p>
            <Souvenir>le carré d’aire 12 qu’on venait justement de découper.</Souvenir>
          </div>
        ),
      },
    ],

    /* M6 — Les racines au travail, et les deux valeurs qu'on peut en donner. */
    6: [
      {
        id: 'exact-vs-approche',
        type: 'memoriser',
        title: '⭐ Valeur exacte et valeur approchée',
        summary: 'La valeur exacte s’écrit avec le symbole √, simplifiée ; l’arrondi ne la remplace jamais, il sert seulement à se représenter la taille.',
        body: (
          <div className="rounded-xl bg-indigo-50 border-2 border-indigo-200 p-4 space-y-2">
            <div className="text-center">
              <MathText>{'$\\sqrt{50} = 5\\sqrt{2} \\quad\\text{(exact)} \\qquad \\sqrt{50} \\approx 7{,}07 \\quad\\text{(approché)}$'}</MathText>
            </div>
            <p className="text-sm text-indigo-950">Tant qu’on calcule, on garde la forme exacte : elle
            ne perd rien. On n’arrondit qu’à la toute fin, pour commander une planche ou se
            représenter une longueur.</p>
            <p className="text-xs text-indigo-700">Le signe <MathText>{'$\\approx$'}</MathText> n’est
            pas un « = » : écrire <MathText>{'$\\sqrt{50} = 7$'}</MathText> est faux, puisque{' '}
            <MathText>{'$7^{2} = 49$'}</MathText>.</p>
            <Souvenir>la diagonale à commander, arrondie au dixième seulement pour la planche.</Souvenir>
          </div>
        ),
      },
      {
        id: 'racines-en-geometrie',
        type: 'methodes',
        title: 'Les racines en géométrie',
        summary: 'Dès qu’une longueur se déduit d’une aire ou du théorème de Pythagore, elle sort en racine — et on la donne exacte, simplifiée.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
              <div><MathText>{'$d^{2} = 5^{2} + 5^{2} = 50 \\;\\Rightarrow\\; d = \\sqrt{50} = 5\\sqrt{2}$'}</MathText></div>
              <div><MathText>{'$h^{2} = 3^{2} + 6^{2} = 45 \\;\\Rightarrow\\; h = \\sqrt{45} = 3\\sqrt{5}$'}</MathText></div>
            </div>
            <p>Ce sont les <strong>carrés</strong> des côtés qui s’additionnent, jamais les côtés :
            la diagonale d’un carré de 5 ne mesure pas 10, elle coupe au plus court.</p>
            <p className="text-xs text-slate-500">Et l’avant-dernière ligne est déjà une aire :{' '}
            <MathText>{'$d^{2} = 50$'}</MathText> est un nombre de cm², il reste à en prendre la
            racine pour obtenir une longueur.</p>
            <Souvenir>le carré barré par sa diagonale, et le triangle rectangle 3-6.</Souvenir>
          </div>
        ),
      },
    ],
  },
};
