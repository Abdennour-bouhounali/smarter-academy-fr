import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de la leçon « Nombres rationnels » (3e) — SOURCE UNIQUE de
 * vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à l'instant
 * où le geste vient de lui donner un sens, puis il reste sur la carte. Rien
 * n'est réécrit dans les modules : la brique et la carte montrent le même
 * texte.
 *
 * ORDRE. Un item n'utilise QUE ce qui est déjà établi au module qui le
 * déclare, puisque la brique rend ce texte à sa position dans le flux :
 *   M1 le rationnel comme POINT et ses écritures  →  M2 irréductible et PGCD →
 *   M3 comparer par la découpe commune  →  M4 additionner et soustraire  →
 *   M5 multiplier et diviser  →  M6 les priorités  →  M7 choisir l'opération.
 * Le mot « PPCM » n'apparaît donc pas avant le module 4, où il est posé ; et
 * « inverse » pas avant le module 5.
 */

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — L'objet : un point, et ses mille noms. */
    1: [
      {
        id: 'nombre-rationnel',
        type: 'concepts',
        title: 'Nombre rationnel',
        summary: 'Un nombre qui peut s’écrire a/b avec a et b entiers et b ≠ 0.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\frac{a}{b}$'}</MathText>
              <span className="text-slate-400 mx-3">avec</span>
              <MathText>{'$a, b$'}</MathText> entiers et <MathText>{'$b \\neq 0$'}</MathText>
            </div>
            <p>C’est avant tout un <strong>point</strong> sur la droite graduée. La fraction dit
            seulement comment on y arrive : en combien de parts on découpe, et combien on en prend.</p>
            <p className="text-xs text-slate-500">Le dénominateur ne peut pas valoir 0 : découper en
            0 part ne définit aucune longueur, donc aucun nombre.</p>
            <Souvenir>la barre re-découpée trois fois, et le marqueur qui n’a jamais bougé.</Souvenir>
          </div>
        ),
      },
      {
        id: 'ecritures-equivalentes',
        type: 'concepts',
        title: 'Écritures équivalentes',
        summary: 'Multiplier (ou diviser) le haut ET le bas par un même nombre non nul ne déplace pas le point.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\frac{3}{4} = \\frac{6}{8} = \\frac{12}{16} = 0{,}75$'}</MathText>
            </div>
            <p>Couper chaque part en deux double le nombre de parts <em>et</em> le nombre de parts
            prises : la longueur, elle, est inchangée.</p>
            <p className="text-xs text-slate-500">Le test le plus sûr pour savoir si deux écritures
            désignent le même point : leur valeur décimale.</p>
            <Souvenir>les traits de coupe qui apparaissaient sans déplacer le marqueur.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mem-numerateur-denominateur',
        type: 'memoriser',
        title: '⭐ Le haut déplace le point, le bas ne le déplace pas',
        summary: 'Le numérateur compte les parts prises ; le dénominateur dit seulement leur taille.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-2 text-center">
              <div className="text-base font-black text-rose-700">
                changer le BAS = changer le nom
              </div>
              <div className="text-base font-black text-rose-700">
                changer le HAUT = changer le nombre
              </div>
            </div>
            <p>C’est la raison pour laquelle on a le droit de re-découper une fraction autant qu’on
            veut : tant qu’on multiplie le haut <em>et</em> le bas, on ne touche qu’à l’écriture.</p>
            <p className="text-xs text-slate-500">Toucher au numérateur seul, en revanche, donne un
            autre nombre — c’est l’erreur de celui qui « simplifie » 3/4 en 3/2.</p>
            <Souvenir>les deux prises de la barre : le peigne, puis le bord colorié.</Souvenir>
          </div>
        ),
      },
      {
        id: 'signe-fraction',
        type: 'regles',
        title: 'Où placer le signe moins',
        summary: 'Devant la fraction, au numérateur ou au dénominateur : c’est le même point négatif.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\frac{-3}{4} = \\frac{3}{-4} = -\\frac{3}{4} = -0{,}75$'}</MathText>
            </div>
            <p>Déplacer le signe ne déplace pas le point. Par convention, on l’écrit{' '}
            <strong>devant la fraction</strong>, avec un dénominateur positif.</p>
            <Souvenir>la barre partie de 0 vers la gauche.</Souvenir>
          </div>
        ),
      },
    ],

    /* M2 — La carte d'identité d'un rationnel. */
    2: [
      {
        id: 'irreductible',
        type: 'vocabulaire',
        title: 'Fraction irréductible',
        summary: 'Une fraction dont le numérateur et le dénominateur n’ont plus aucun diviseur commun autre que 1.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\frac{24}{36} = \\frac{12}{18} = \\frac{4}{6} = \\frac{2}{3}$'}</MathText>
            </div>
            <p>Simplifier, c’est <strong>regrouper</strong> les parts : le point ne bouge pas, seule
            l’écriture rapetisse. Quand plus aucun regroupement n’est possible, la fraction est{' '}
            <strong>irréductible</strong>.</p>
            <p className="text-xs text-slate-500">Chaque division doit porter sur le haut{' '}
            <strong>et</strong> sur le bas : diviser un seul des deux changerait le point.</p>
            <Souvenir>les traits de coupe qui disparaissaient un à un, la longueur intacte.</Souvenir>
          </div>
        ),
      },
      {
        id: 'pgcd-irreductible',
        type: 'methodes',
        title: 'Le raccourci du PGCD',
        summary: 'Diviser numérateur et dénominateur par leur PGCD donne la forme irréductible en une seule étape.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
              <p className="text-xs text-slate-500">PGCD(24 ; 36) = 12</p>
              <MathText>{'$\\frac{24 \\div 12}{36 \\div 12} = \\frac{2}{3}$'}</MathText>
            </div>
            <p>Le <strong>PGCD</strong> est le plus grand diviseur commun des deux nombres. Une
            fraction est irréductible exactement quand ce PGCD vaut 1.</p>
            <p className="text-xs text-slate-500">÷2, ÷2, ÷3 revient à diviser par 2 × 2 × 3 = 12 :
            tous les chemins arrivent à la même fraction. La forme irréductible est{' '}
            <strong>unique</strong> — c’est la carte d’identité du nombre.</p>
            <Souvenir>les deux chemins de simplification qui finissaient au même endroit.</Souvenir>
          </div>
        ),
      },
    ],

    /* M3 — Comparer, c'est positionner. */
    3: [
      {
        id: 'comparer-rationnels',
        type: 'methodes',
        title: 'Comparer deux rationnels',
        summary: 'On les écrit avec le même dénominateur positif, puis on compare les numérateurs.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\frac{3}{4} = \\frac{9}{12}$'}</MathText>
              <span className="text-slate-400 mx-2">et</span>
              <MathText>{'$\\frac{2}{3} = \\frac{8}{12}$'}</MathText>
              <span className="text-slate-400 mx-2">donc</span>
              <MathText>{'$\\frac{3}{4} > \\frac{2}{3}$'}</MathText>
            </div>
            <p>Sur la droite, le plus grand est toujours <strong>celui de droite</strong>. Une
            découpe commune rend la lecture immédiate ; comparer les valeurs décimales marche
            aussi.</p>
            <p className="text-xs text-slate-500">On ne compare <strong>jamais</strong> les
            dénominateurs entre eux.</p>
            <Souvenir>les deux points posés sur la même droite en douzièmes.</Souvenir>
          </div>
        ),
      },
      {
        id: 'piege-denominateur',
        type: 'memoriser',
        title: '⭐ Un grand dénominateur donne de PETITES parts',
        summary: '1/4 est plus petit que 1/2 : plus on découpe, plus chaque part est fine.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-2 text-center">
            <MathText className="text-lg">{'$\\frac{1}{4} < \\frac{1}{2}$'}</MathText>
            <p className="text-xs text-rose-800">
              Le dénominateur dit en combien de parts on coupe le <strong>même</strong> gâteau : plus
              il est grand, plus chaque part est petite. Un quart de pizza est plus petit qu’une
              demi-pizza.
            </p>
            <p className="text-xs text-rose-700">
              Et chez les négatifs tout s’inverse : <MathText>{'$-\\frac{3}{4} < -\\frac{1}{2}$'}</MathText>.
              La règle « le plus à droite est le plus grand » ne se trompe jamais, elle.
            </p>
          </div>
        ),
      },
    ],

    /* M4 — Additionner suppose des parts de même taille. */
    4: [
      {
        id: 'meme-decoupe',
        type: 'concepts',
        title: 'On n’additionne que des parts de même taille',
        summary: 'Avant d’ajouter deux rationnels, il faut les réécrire avec le même dénominateur.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\frac{1}{2} + \\frac{1}{3} = \\frac{3}{6} + \\frac{2}{6} = \\frac{5}{6}$'}</MathText>
            </div>
            <p>Un demi et un tiers ne s’emboîtent pas : ce sont des morceaux de tailles
            différentes. En sixièmes, ils s’emboîtent — et on peut enfin les compter ensemble.</p>
            <p className="text-xs text-slate-500">L’erreur{' '}
            <MathText>{'$\\frac{1}{2} + \\frac{1}{3} = \\frac{2}{5}$'}</MathText> invente une
            nouvelle taille de part : le dénominateur dit la TAILLE, il ne se cumule pas.</p>
            <Souvenir>les deux barres recoupées jusqu’à ce que leurs traits coïncident.</Souvenir>
          </div>
        ),
      },
      {
        id: 'ppcm-denominateur',
        type: 'methodes',
        title: 'Choisir la découpe commune',
        summary: 'Un dénominateur commun est un multiple commun des deux ; le plus petit s’appelle le PPCM.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
              <p className="text-xs text-slate-500">Multiples communs de 2 et 3 : 6, 12, 24…</p>
              <p>PPCM(2 ; 3) = <strong>6</strong></p>
            </div>
            <p>Le <strong>PPCM</strong> est le plus petit multiple commun des deux dénominateurs.
            N’importe quel multiple commun fonctionne — le PPCM garde simplement les plus petits
            nombres.</p>
            <p className="text-xs text-slate-500">5 et 7 ne conviennent pas pour des demis et des
            tiers : on ne peut y couper ni les uns ni les autres en parts égales.</p>
            <Souvenir>les candidats du sélecteur, et ceux qui refusaient de s’emboîter.</Souvenir>
          </div>
        ),
      },
      {
        id: 'somme-difference',
        type: 'formules',
        title: 'Additionner et soustraire',
        summary: 'Même découpe, on opère sur les numérateurs, on garde le dénominateur.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
              <MathText>{'$\\frac{a}{c} + \\frac{b}{c} = \\frac{a + b}{c}$'}</MathText>
              <MathText>{'$\\frac{a}{c} - \\frac{b}{c} = \\frac{a - b}{c}$'}</MathText>
            </div>
            <p>Le dénominateur ne change pas : il dit la taille des parts, et cette taille n’a pas
            bougé.</p>
            <p className="text-xs text-slate-500">Le résultat peut passer à gauche de 0 :{' '}
            <MathText>{'$\\frac{1}{3} - \\frac{3}{4} = \\frac{4}{12} - \\frac{9}{12} = -\\frac{5}{12}$'}</MathText>.
            C’est un rationnel comme un autre.</p>
            <Souvenir>les parts comptées une fois qu’elles avaient enfin la même taille.</Souvenir>
          </div>
        ),
      },
    ],

    /* M5 — Multiplier et diviser. */
    5: [
      {
        id: 'produit-rationnels',
        type: 'formules',
        title: 'Multiplier deux rationnels',
        summary: 'Numérateurs entre eux, dénominateurs entre eux — c’est l’aire commune du quadrillage.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
              <MathText>{'$\\frac{a}{b} \\times \\frac{c}{d} = \\frac{a \\times c}{b \\times d}$'}</MathText>
              <p className="text-xs text-slate-500">
                <MathText>{'$\\frac{2}{3} \\times \\frac{3}{4} = \\frac{6}{12} = \\frac{1}{2}$'}</MathText>
              </p>
            </div>
            <p>Le rectangle vert fait 3 cases de large sur 2 de haut, dans un carré de 4 × 3 :
            c’est exactement haut × haut sur bas × bas.</p>
            <p className="text-xs text-slate-500">On peut simplifier <strong>avant</strong> de
            multiplier, pour éviter les gros nombres. Et multiplier par un nombre plus petit que 1{' '}
            <strong>rapetisse</strong>.</p>
            <Souvenir>les six cases peintes deux fois, sur les douze du carré.</Souvenir>
          </div>
        ),
      },
      {
        id: 'quotient-rationnels',
        type: 'formules',
        title: 'Diviser, c’est multiplier par l’inverse',
        summary: 'On retourne la seconde fraction, puis on multiplie.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
              <MathText>{'$\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c}$'}</MathText>
              <p className="text-xs text-slate-500">
                <MathText>{'$\\frac{3}{2} \\div \\frac{1}{4} = \\frac{6}{4} \\text{ en quarts} = 6 \\text{ paquets}$'}</MathText>
              </p>
            </div>
            <p>Diviser, c’est compter combien de paquets tiennent dedans. L’<strong>inverse</strong>{' '}
            d’une fraction s’obtient en la retournant — et il faut{' '}
            <MathText>{'$c \\neq 0$'}</MathText> : on ne divise pas par zéro.</p>
            <p className="text-xs text-slate-500">« Diviser rend plus petit » est faux dès qu’on
            divise par un nombre inférieur à 1 : le résultat est alors plus grand.</p>
            <Souvenir>les six paquets d’un quart comptés le long de la barre.</Souvenir>
          </div>
        ),
      },
    ],

    /* M6 — L'ordre des opérations. */
    6: [
      {
        id: 'mem-ordre-change-le-nombre',
        type: 'memoriser',
        title: '⭐ Changer l’ordre change le résultat',
        summary: 'Mêmes nombres, ordre différent, nombre différent : 1/2 + 2/3 × 3/4 = 1, mais (1/2 + 2/3) × 3/4 = 7/8.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-2 text-center">
              <MathText>{'$\\frac{1}{2} + \\frac{2}{3} \\times \\frac{3}{4} = 1$'}</MathText>
              <div className="text-xs font-bold text-rose-700">mais</div>
              <MathText>{'$\\left(\\frac{1}{2} + \\frac{2}{3}\\right) \\times \\frac{3}{4} = \\frac{7}{8}$'}</MathText>
            </div>
            <p>Les mêmes trois nombres, les mêmes deux opérations — et deux résultats différents.
            C’est la parenthèse, et elle seule, qui a décidé.</p>
            <p className="text-xs text-slate-500">D’où le réflexe : avant de calculer, on repère
            l’opération prioritaire. Pas après.</p>
          </div>
        ),
      },
      {
        id: 'priorites-calcul',
        type: 'memoriser',
        title: '⭐ L’ordre des opérations',
        summary: 'Parenthèses, puis × et ÷, puis + et − — de gauche à droite à égalité.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1.5">
            <p className="text-sm font-bold text-rose-900">1. Ce qui est entre parenthèses</p>
            <p className="text-sm font-bold text-rose-900">2. Les × et les ÷, de gauche à droite</p>
            <p className="text-sm font-bold text-rose-900">3. Les + et les −, de gauche à droite</p>
            <p className="text-xs text-rose-800 pt-1">
              Une expression ne se lit pas dans l’ordre où elle se calcule :{' '}
              <MathText>{'$\\frac{1}{2} + \\frac{2}{3} \\times \\frac{3}{4} = 1$'}</MathText>, alors
              que de gauche à droite on trouverait <MathText>{'$\\frac{7}{8}$'}</MathText>.
            </p>
            <p className="text-xs text-rose-700">
              La barre de fraction joue le rôle d’une parenthèse : on calcule tout le haut et tout le
              bas avant de diviser.
            </p>
          </div>
        ),
      },
    ],

    /* M7 — Choisir l'opération que raconte l'énoncé. */
    7: [
      {
        id: 'interpreter-le-quotient',
        type: 'methodes',
        title: 'Interpréter un quotient',
        summary: 'Un quotient non entier n’est pas la réponse : le contexte décide dans quel sens arrondir.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
              <p className="text-sm">300 ÷ 32,50 = 9,23…</p>
              <p className="text-xs text-slate-500">→ 9 maillots, et il reste 7,50 €</p>
            </div>
            <p>La calculatrice donne un nombre ; l’énoncé dit ce qu’on a le droit d’en faire. Ici on
            ne peut pas dépasser le budget : l’<strong>arrondi</strong> se fait donc{' '}
            <strong>vers le bas</strong>.</p>
            <p className="text-xs text-slate-500">Ailleurs, c’est l’inverse : s’il faut assez de cars
            pour transporter tout le monde, 3,2 cars en demande 4. Le calcul est le même, la
            conclusion opposée — c’est la situation qui tranche.</p>
            <Souvenir>les 9,23 maillots impossibles à acheter.</Souvenir>
          </div>
        ),
      },
      {
        id: 'choisir-operation',
        type: 'methodes',
        title: 'Choisir l’opération que raconte l’énoncé',
        summary: 'Chaque mot de l’histoire désigne une opération — c’est là qu’est le vrai travail.',
        body: (
          <div className="space-y-3">
            <ul className="text-sm space-y-1 pl-4 list-disc">
              <li>deux dépenses qui <strong>s’ajoutent</strong> → une somme ;</li>
              <li>ce qui <strong>reste</strong> du tout → une soustraction à 1 ;</li>
              <li>une <strong>part d’une quantité</strong> → un produit ;</li>
              <li>combien de <strong>paquets</strong> tiennent dedans → un quotient.</li>
            </ul>
            <p className="text-xs text-slate-500">Le tout vaut toujours 1. « Les cinq douzièmes de
            720 € » se calcule <MathText>{'$\\frac{5}{12} \\times 720$'}</MathText>, pas autrement.</p>
            <Souvenir>la barre du budget, et le bloc « ? » qu’il fallait retirer au tout.</Souvenir>
          </div>
        ),
      },
    ],
  },
};
