import React from 'react';
import MathText from '../../../../common/components/MathText';
import { MiniGraph } from '../../../../common/knowledge';

/**
 * Connaissances de « Exponentielle : règles de calcul et modèles » — SOURCE
 * UNIQUE (docs/architecture/KNOWLEDGE_MAP.md). Le texte d'une brique vit ICI et
 * nulle part ailleurs ; les modules la posent par son id, au moment où le geste
 * vient de lui donner du sens.
 *
 * L'ORDRE PORTE LA DÉMONSTRATION. La première brique — la relation
 * fondamentale — est la seule qui soit VRAIMENT nouvelle. Les trois suivantes
 * en DÉCOULENT, et leur texte le dit à chaque fois : c'est ce qui empêche
 * l'élève de les vivre comme quatre formules à mémoriser séparément.
 */
const expo = (x) => Math.exp(x);
const affine = (x) => 20 + 10 * x;
const croissance = (x) => 20 * Math.exp(0.4 * x);
const decroissance = (x) => 60 * Math.exp(-0.15 * x);
const I = '#4f46e5';   // le modèle exponentiel
const G = '#94a3b8';   // le contre-modèle

export const LESSON_KNOWLEDGE = {
  modules: {
    2: [
      {
        id: 'relation-fondamentale-exp',
        type: 'regles',
        title: 'La somme des exposants devient un produit',
        summary:
          'Pour tous nombres a et b : e^(a+b) = e^a × e^b. Additionner deux exposants revient à multiplier les deux valeurs correspondantes.',
        visual: (
          <MiniGraph
            width={220} height={150} xMin={-1.6} xMax={2.2} yMin={-0.5} yMax={8}
            functions={[{ fn: expo, color: I }]}
            points={[
              { x: 1, y: Math.exp(1), color: '#d97706', label: 'e', labelPos: 'l' },
              { x: 2, y: Math.exp(2), color: '#e11d48', label: 'e×e', labelPos: 'l' },
            ]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-violet-100 bg-white p-3 text-center">
              <MathText>{'$$e^{a+b} = e^{a} \\times e^{b}$$'}</MathText>
            </div>
            <p>
              C’est un <strong>traducteur</strong> entre deux mondes. D’un côté on additionne, de
              l’autre on multiplie ; l’exponentielle fait passer de l’un à l’autre. Tout le reste
              de la leçon en découle, sans qu’aucune autre relation soit à admettre.
            </p>
            <p>
              Ce n’est pas une nouveauté isolée : les puissances obéissent déjà à la même loi, avec
              a<sup>m</sup> × a<sup>n</sup> = a<sup>m+n</sup>. L’exponentielle se comporte exactement
              comme une puissance — parce que c’en est une, de base e.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              L’erreur à ne jamais commettre : e^(a+b) n’est PAS e^a + e^b. Avec a = b = 1, le
              premier vaut environ 7,39 et le second environ 5,44. Ce n’est pas un arrondi.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux afficheurs qui n’ont jamais réussi à se contredire, quels que soient les curseurs.</div>
          </div>
        ),
      },
      {
        id: 'mem-somme-devient-produit',
        type: 'memoriser',
        title: '⭐ e^(a+b) = e^a × e^b',
        summary: 'La seule relation à retenir ; les trois autres s’en déduisent.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">e^(a+b) = e^a × e^b</div>
            <p className="text-xs text-rose-700">en haut on additionne, en bas on multiplie</p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'exp-oppose-inverse',
        type: 'regles',
        title: 'Un exposant opposé donne l’inverse',
        summary:
          'e^(−a) = 1/e^a. Un exposant négatif ne rend jamais la valeur négative : il la retourne, et elle reste strictement positive.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-sky-100 bg-white p-3 text-center">
              <MathText>{'$$e^{-a} = \\dfrac{1}{e^{a}}$$'}</MathText>
            </div>
            <div className="rounded-xl border border-sky-100 bg-white p-3">
              <p className="font-semibold text-sky-900 mb-1">D’où cela vient</p>
              <p>
                Additionnons a et son opposé : e^a × e^(−a) = e^(a + (−a)) = e^0 = 1. Deux nombres
                dont le produit vaut 1 sont l’inverse l’un de l’autre. Rien d’autre n’a été admis
                que la relation fondamentale.
              </p>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le piège : e^(−a) n’est PAS −e^a. e^(−1) vaut environ 0,368 — un nombre petit, mais
              positif. Aucune valeur de l’exponentielle n’est jamais négative.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le curseur passé du côté négatif, et la longueur qui repartait en arrière.</div>
          </div>
        ),
      },
      {
        id: 'exp-difference-quotient',
        type: 'regles',
        title: 'La différence des exposants devient un quotient',
        summary:
          'e^(a−b) = e^a / e^b. Soustraire un exposant, c’est diviser par la valeur correspondante.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-sky-100 bg-white p-3 text-center">
              <MathText>{'$$e^{a-b} = \\dfrac{e^{a}}{e^{b}}$$'}</MathText>
            </div>
            <p>
              Là encore, rien de neuf : a − b s’écrit a + (−b), donc e^(a−b) = e^a × e^(−b), et
              e^(−b) est l’inverse de e^b. Multiplier par l’inverse, c’est diviser.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Quand a &lt; b, le résultat passe sous 1 — mais il reste strictement positif. Un
              quotient de deux nombres positifs ne devient jamais négatif.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la longueur du bas qui repartait vers la gauche, du côté des valeurs inférieures à 1.</div>
          </div>
        ),
      },
      {
        id: 'mem-oppose-et-difference',
        type: 'memoriser',
        title: '⭐ e^(−a) = 1/e^a et e^(a−b) = e^a/e^b',
        summary: 'Opposé : on retourne. Différence : on divise.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">e^(−a) = 1/e^a</div>
            <div className="text-xl font-black text-rose-700">e^(a−b) = e^a / e^b</div>
            <p className="text-xs text-rose-700">et le résultat reste toujours strictement positif</p>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'exp-puissance',
        type: 'regles',
        title: 'Une puissance multiplie l’exposant',
        summary:
          '(e^a)^n = e^(na) pour tout entier n. Élever à la puissance n, c’est multiplier n fois, donc additionner n fois l’exposant.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center">
              <MathText>{'$$\\left(e^{a}\\right)^{n} = e^{na}$$'}</MathText>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-white p-3">
              <p className="font-semibold text-emerald-900 mb-1">D’où cela vient</p>
              <p>
                (e^a)³ signifie e^a × e^a × e^a. La relation fondamentale transforme chaque
                multiplication en addition d’exposants : a + a + a, c’est-à-dire 3a. Additionner n
                fois le même nombre, c’est le multiplier par n.
              </p>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le piège : on multiplie l’exposant PAR n, on ne l’élève pas à la puissance n.
              (e²)³ vaut e⁶, pas e⁸.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les n copies posées côte à côte, et les exposants qui s’empilent en une somme.</div>
          </div>
        ),
      },
      {
        id: 'mem-puissance-multiplie',
        type: 'memoriser',
        title: '⭐ (e^a)^n = e^(na)',
        summary: 'La puissance MULTIPLIE l’exposant — elle ne l’élève pas.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">(e^a)^n = e^(na)</div>
            <p className="text-xs text-rose-700">(e²)³ = e⁶ — et jamais e⁸</p>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'egalite-des-exposants',
        type: 'regles',
        title: 'Deux valeurs égales imposent deux exposants égaux',
        summary:
          'e^u = e^v équivaut à u = v. La justification n’est pas la relation fondamentale, mais la stricte croissance : une fonction qui monte sans jamais s’arrêter ne repasse jamais deux fois par la même hauteur.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-rose-100 bg-white p-3 text-center">
              <MathText>{'$$e^{u} = e^{v} \\iff u = v$$'}</MathText>
            </div>
            <p>
              L’argument tient en une phrase : l’exponentielle est <strong>strictement
              croissante</strong> sur ℝ. Deux nombres différents ont donc des valeurs différentes ;
              autrement dit, deux valeurs identiques ne peuvent venir que du même nombre.
            </p>
            <div className="rounded-xl border border-rose-100 bg-white p-3">
              <p className="font-semibold text-rose-900 mb-1">Ce que cela permet</p>
              <p>
                Une équation où les deux membres sont des exponentielles se ramène à égaler leurs
                exposants — et il ne reste plus qu’une équation du premier degré, connue depuis la
                4<sup>e</sup>.
              </p>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Attention : cela ne marche que si les DEUX membres sont des exponentielles. Une
              égalité comme e^x = 5 demanderait un outil que cette leçon n’a pas.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la courbe qui ne repasse jamais deux fois à la même hauteur, aussi loin qu’on la suive.</div>
          </div>
        ),
      },
      {
        id: 'methode-resoudre-equation-exp',
        type: 'methodes',
        title: 'Résoudre une équation avec des exponentielles',
        summary:
          'Ramener chaque membre à une seule exponentielle grâce aux règles de calcul, égaler les exposants, puis résoudre l’équation du premier degré obtenue.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>
                <strong>Regrouper.</strong> Utiliser les règles pour n’avoir qu’une exponentielle de
                chaque côté : un produit devient une somme d’exposants, un quotient une différence.
              </li>
              <li>
                <strong>Égaler les exposants.</strong> C’est la stricte croissance qui l’autorise, et
                elle seule. On l’écrit.
              </li>
              <li>
                <strong>Résoudre.</strong> Il ne reste qu’une équation du premier degré.
              </li>
              <li>
                <strong>Vérifier.</strong> Remplacer par la valeur trouvée et contrôler que les deux
                exposants coïncident.
              </li>
            </ol>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              L’étape 2 doit être JUSTIFIÉE, pas seulement effectuée : sans la stricte croissance,
              rien ne dit que deux valeurs égales viennent du même exposant.
            </div>
          </div>
        ),
      },
    ],
    6: [
      {
        id: 'inegalite-sens-conserve',
        type: 'regles',
        title: 'Le sens d’une inégalité se conserve',
        summary:
          'e^u < e^v équivaut à u < v. La fonction étant strictement croissante, elle range les nombres dans le même ordre : le sens ne s’inverse pas.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-amber-100 bg-white p-3 text-center">
              <MathText>{'$$e^{u} < e^{v} \\iff u < v$$'}</MathText>
            </div>
            <p>
              C’est le même argument que pour les égalités, et il donne un peu plus : une fonction
              strictement croissante conserve l’ordre. Le plus petit exposant donne toujours la plus
              petite valeur.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Ne pas confondre deux moments. Le passage aux exposants ne renverse JAMAIS le sens.
              En revanche, la résolution qui suit peut le renverser, si l’on divise les deux membres
              par un nombre négatif — mais c’est une règle du premier degré, pas de
              l’exponentielle.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le curseur de gauche qui donnait toujours la valeur de gauche, sur les deux axes à la fois.</div>
          </div>
        ),
      },
      {
        id: 'modele-exponentiel',
        type: 'concepts',
        title: 'Le modèle A·e^{kt}',
        summary:
          'Une grandeur modélisée par f(t) = A·e^{kt} vaut A au départ, et son sens ne dépend que du signe de k : elle croît si k > 0, elle décroît si k < 0.',
        visual: (
          <MiniGraph
            width={220} height={150} xMin={0} xMax={6} yMin={0} yMax={230}
            functions={[{ fn: croissance, color: I }, { fn: affine, color: G, dashed: true }]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-amber-100 bg-white p-3 text-center">
              <MathText>{'$$f(t) = A \\cdot e^{kt}$$'}</MathText>
            </div>
            <div className="grid gap-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                <strong>A</strong> est la valeur au départ, parce que e⁰ = 1 : il se lit directement.
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                <strong>k &gt; 0</strong> : la grandeur augmente. <strong>k &lt; 0</strong> : elle
                diminue, sans jamais devenir négative ni atteindre zéro.
              </div>
            </div>
            <p>
              En pointillés, une fonction affine partie du même point : elle avance du même écart à
              chaque pas, alors que le modèle exponentiel se multiplie par le même facteur.
              L’écart entre les deux devient vite immense.
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux courbes parties ensemble et séparées en quelques pas.</div>
          </div>
        ),
      },
      {
        id: 'facteur-constant',
        type: 'regles',
        title: 'Un facteur constant, jamais un écart constant',
        summary:
          'D’un pas de temps au suivant, f(t+1)/f(t) = e^k — toujours la même valeur. C’est la règle du quotient qui le dit, et c’est la signature d’un modèle exponentiel.',
        visual: (
          <MiniGraph
            width={220} height={150} xMin={0} xMax={20} yMin={0} yMax={70}
            functions={[{ fn: decroissance, color: I }]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-amber-100 bg-white p-3 text-center">
              <MathText>{'$$\\dfrac{f(t+1)}{f(t)} = \\dfrac{A\\,e^{k(t+1)}}{A\\,e^{kt}} = e^{k}$$'}</MathText>
            </div>
            <p>
              Le calcul est exactement la règle du quotient : on soustrait les exposants, et il
              reste k. Le résultat ne dépend plus de t — le facteur est donc le même partout.
            </p>
            <div className="grid gap-2">
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                <strong>Une fonction affine</strong> ajoute le même nombre à chaque pas : c’est un
                <em> écart</em> constant.
              </div>
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                <strong>Un modèle exponentiel</strong> multiplie par le même nombre à chaque pas :
                c’est un <em>facteur</em> constant.
              </div>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              C’est ainsi qu’on reconnaît un modèle exponentiel dans un tableau de valeurs :
              on divise chaque valeur par la précédente, et l’on regarde si le résultat ne bouge
              pas.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les quotients successifs affichés l’un sous l’autre, tous identiques.</div>
          </div>
        ),
      },
    ],
  },
};
