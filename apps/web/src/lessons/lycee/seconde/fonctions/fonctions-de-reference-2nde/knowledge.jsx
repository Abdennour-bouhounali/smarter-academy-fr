import React from 'react';
import MathText from '../../../../common/components/MathText';
import { MiniGraph } from '../../../../common/knowledge';

/**
 * Connaissances de la leçon « Fonctions de référence » — SOURCE UNIQUE de
 * vérité (docs/architecture/KNOWLEDGE_MAP.md). Chaque item n'utilise que ce
 * que le module qui le déclare a fait voir.
 */
const SQ = '#4f46e5'; const INV = '#e11d48'; const AB = '#059669';
const parabole = (extra = {}) => <MiniGraph width={220} height={150} xMin={-4} xMax={4} yMin={-1} yMax={9} functions={[{ fn: (x) => x * x, color: SQ }]} {...extra} />;
const hyperbole = (extra = {}) => <MiniGraph width={220} height={150} xMin={-4} xMax={4} yMin={-4} yMax={4} functions={[{ fn: (x) => 1 / x, color: INV, gapAt: 0 }]} {...extra} />;
const leV = (extra = {}) => <MiniGraph width={220} height={150} xMin={-4} xMax={4} yMin={-1} yMax={4} functions={[{ fn: (x) => Math.abs(x), color: AB }]} {...extra} />;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'trois-references', type: 'concepts', title: 'Les trois fonctions de référence',
        summary: 'Carré x ↦ x², inverse x ↦ 1/x (sur ℝ*), valeur absolue x ↦ |x| : trois expressions, trois courbes très différentes.',
        visual: <MiniGraph width={220} height={150} xMin={-3} xMax={3} yMin={-3} yMax={5} functions={[{ fn: (x) => x * x, color: SQ, label: 'x²' }, { fn: (x) => 1 / x, color: INV, gapAt: 0, label: '1/x' }, { fn: (x) => Math.abs(x), color: AB, label: '|x|' }]} />,
        body: (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-indigo-900"><MathText>{'$f(x) = x^2$'}</MathText> — définie sur ℝ, jamais négative</div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900"><MathText>{'$g(x) = \\dfrac{1}{x}$'}</MathText> — définie sur ℝ* (0 n’a pas d’image)</div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900"><MathText>{'$h(x) = |x|$'}</MathText> — définie sur ℝ, la distance à 0</div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la même entrée dans trois machines — et 0 refusé par 1/x.</div>
          </div>
        ),
      },
      {
        id: 'regle-symetrie-entrees', type: 'regles', title: 'x et −x',
        summary: '(−x)² = x² et |−x| = |x| ; mais 1/(−x) = −1/x.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <div className="bg-white rounded-xl border border-orange-100 p-3 text-center"><MathText>{'$$(-x)^2 = x^2 \\qquad |-x| = |x| \\qquad \\frac{1}{-x} = -\\frac{1}{x}$$'}</MathText></div>
            <p>Un nombre et son opposé ont le même carré et la même valeur absolue ; leurs inverses sont opposés.</p>
          </div>
        ),
      },
      {
        id: 'regle-pres-loin-zero', type: 'regles', title: 'Près de 0, loin de 0',
        summary: 'Près de 0, 1/x devient énorme et x² minuscule ; loin de 0, c’est l’inverse. |x| suit x.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1">
              <div>1/0,1 = 10, 1/0,01 = 100 ; 0,1² = 0,01.</div>
              <div>100² = 10 000 ; 1/100 = 0,01.</div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : « hors du cadre du repère » pour 1/0,1 et pour 100².</div>
          </div>
        ),
      },
      {
        id: 'methode-tableau-tracer', type: 'methodes', title: 'Tableau de valeurs et tracé',
        summary: 'Choisir des x symétriques (−3, −2, …, 3), calculer les images, placer les points, relier.',
        body: (
          <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">
            <li>Des valeurs de x de part et d’autre de 0 (et près de 0 pour 1/x, sans 0).</li>
            <li>Les images par la formule : ligne x², ligne 1/x, ligne |x|.</li>
            <li>Les points (x ; f(x)), puis la courbe — en deux morceaux pour 1/x.</li>
          </ol>
        ),
      },
    ],
    2: [
      {
        id: 'vocab-monte-descend', type: 'vocabulaire', title: 'Croissante, décroissante',
        summary: 'Sur un intervalle où la courbe MONTE quand on va vers la droite, la fonction est croissante ; là où elle DESCEND, elle est décroissante.',
        visual: parabole({ points: [{ x: -2, y: 4, color: '#7c3aed', label: 'descend', labelPos: 'tl' }, { x: 2, y: 4, color: '#0284c7', label: 'monte', labelPos: 'tr' }] }),
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>Deux mots pour dire ce que tes deux sondes viennent de faire voir :</p>
            <ul className="space-y-1.5">
              <li>• <strong>croissante</strong> — on avance vers la droite, la courbe monte : quand a &lt; b, f(a) &lt; f(b).</li>
              <li>• <strong>décroissante</strong> — on avance vers la droite, la courbe descend : quand a &lt; b, f(a) &gt; f(b).</li>
            </ul>
            <p>On ne le dit jamais « en général » : toujours <strong>sur un intervalle</strong>. La parabole descend sur ]−∞ ; 0] et monte sur [0 ; +∞[ — elle n’est ni l’un ni l’autre sur ℝ entier.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : a = −3 &lt; b = −2 et pourtant f(a) &gt; f(b).</div>
          </div>
        ),
      },
      {
        id: 'fonction-carre', type: 'concepts', title: 'La fonction carré et la parabole',
        summary: 'Courbe : une parabole de sommet O, symétrique par rapport à l’axe des ordonnées ; x² ≥ 0 ; décroissante sur ]−∞ ; 0], croissante sur [0 ; +∞[.',
        visual: parabole({ points: [{ x: -2, y: 4, color: '#7c3aed', label: '(−2 ; 4)', labelPos: 'tl' }, { x: 2, y: 4, color: '#0284c7', label: '(2 ; 4)', labelPos: 'tr' }] }),
        body: (
          <div className="space-y-3">
            <ul className="space-y-1.5 text-sm text-slate-700">
              <li>• <strong>Symétrie</strong> : f(−x) = f(x) — l’axe des ordonnées est axe de symétrie.</li>
              <li>• <strong>Signe</strong> : x² ≥ 0, nul seulement en 0.</li>
              <li>• <strong>Sens de variation</strong> : la courbe descend sur ]−∞ ; 0], monte sur [0 ; +∞[.</li>
              <li>• <strong>Sommet</strong> : O(0 ; 0), le point le plus bas — minimum 0.</li>
            </ul>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : deux sondes, a = −3 &lt; b = −2 et pourtant f(a) &gt; f(b).</div>
          </div>
        ),
      },
      {
        id: 'regle-comparer-carres', type: 'regles', title: 'Comparer deux carrés',
        summary: 'Si 0 ≤ a < b alors a² < b² ; si a < b ≤ 0 alors a² > b².',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <div className="bg-white rounded-xl border border-orange-100 p-3 text-center"><MathText>{'$$0 \\le a < b \\Rightarrow a^2 < b^2 \\qquad a < b \\le 0 \\Rightarrow a^2 > b^2$$'}</MathText></div>
            <p>Deux nombres de signes contraires ne se comparent pas ainsi : on compare leurs distances à 0.</p>
          </div>
        ),
      },
      {
        id: 'mem-parabole', type: 'memoriser', title: '⭐ x² : la parabole',
        summary: 'Sommet O, symétrique, jamais sous l’axe, descend puis monte.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">x² ≥ 0 · sommet O · descend puis monte</div>
            <p className="text-xs text-rose-700">décroissante sur ]−∞ ; 0], croissante sur [0 ; +∞[</p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'fonction-inverse', type: 'concepts', title: 'La fonction inverse et l’hyperbole',
        summary: 'Définie sur ℝ*, courbe en deux branches (hyperbole), centre de symétrie O, signe de x, décroissante sur chaque branche.',
        visual: hyperbole({ points: [{ x: 2, y: 0.5, color: '#0284c7', label: '(2 ; 0,5)', labelPos: 'tr' }, { x: -2, y: -0.5, color: '#7c3aed' }] }),
        body: (
          <div className="space-y-3">
            <ul className="space-y-1.5 text-sm text-slate-700">
              <li>• <strong>Ensemble de définition</strong> : ℝ* = ]−∞ ; 0[ ∪ ]0 ; +∞[ — 0 n’a pas d’image.</li>
              <li>• <strong>Symétrie</strong> : g(−x) = −g(x) — O est centre de symétrie.</li>
              <li>• <strong>Signe</strong> : 1/x a le signe de x ; jamais nul.</li>
              <li>• <strong>Sens de variation</strong> : décroissante sur ]−∞ ; 0[ <em>et</em> sur ]0 ; +∞[ — pas sur ℝ* entier.</li>
              <li>• Près de 0, |1/x| est énorme ; loin de 0, 1/x se rapproche de 0.</li>
            </ul>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la sonde sur 0 « n’existe pas » ; −1 &lt; 1 mais g(−1) &lt; g(1).</div>
          </div>
        ),
      },
      {
        id: 'regle-comparer-inverses', type: 'regles', title: 'Comparer deux inverses',
        summary: 'Si 0 < a < b alors 1/a > 1/b (et de même si a < b < 0). Pas de règle d’une branche à l’autre.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <div className="bg-white rounded-xl border border-orange-100 p-3 text-center"><MathText>{'$$0 < a < b \\Rightarrow \\frac{1}{a} > \\frac{1}{b}$$'}</MathText></div>
            <div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">Piège : −2 &lt; 3 mais 1/(−2) &lt; 1/3. Une propriété de variation s’énonce sur un intervalle.</div>
          </div>
        ),
      },
      {
        id: 'mem-hyperbole', type: 'memoriser', title: '⭐ 1/x : l’hyperbole',
        summary: 'Deux branches, ℝ*, signe de x, décroissante sur chaque branche.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">1/x : pas de 0, deux branches</div>
            <p className="text-xs text-rose-700">décroissante sur ]−∞ ; 0[ et sur ]0 ; +∞[ · jamais nulle</p>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'vocab-extremum', type: 'vocabulaire', title: 'Minimum, maximum, extremum',
        summary: 'La plus petite valeur atteinte par une fonction s’appelle son minimum ; la plus grande, son maximum. L’un ou l’autre : un extremum.',
        visual: leV({ points: [{ x: 0, y: 0, color: '#059669', label: 'minimum 0', labelPos: 'br' }] }),
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ul className="space-y-1.5">
              <li>• <strong>minimum</strong> — la plus petite valeur que la fonction atteint, et l’abscisse où elle l’atteint. Le coin du V : |0| = 0, et |x| ≥ 0 partout. Minimum 0, atteint en x = 0.</li>
              <li>• <strong>maximum</strong> — la plus grande valeur atteinte, quand il y en a une.</li>
              <li>• <strong>extremum</strong> — le mot qui couvre les deux.</li>
            </ul>
            <p>Un extremum se lit sur la courbe : c’est le point le plus bas (ou le plus haut) qu’elle atteint réellement. La parabole a le même minimum 0 en son sommet O ; l’hyperbole, elle, n’en a aucun.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux demi-droites qui se rejoignent en O, le point le plus bas du V.</div>
          </div>
        ),
      },
      {
        id: 'fonction-valeur-absolue', type: 'concepts', title: 'La fonction valeur absolue et le V',
        summary: '|x| est la distance de x à 0 : deux demi-droites y = x (x ≥ 0) et y = −x (x ≤ 0), un V symétrique, minimum 0 en 0.',
        visual: leV({ points: [{ x: -3, y: 3, color: '#7c3aed', label: '(−3 ; 3)', labelPos: 'tl' }, { x: 3, y: 3, color: '#0284c7', label: '(3 ; 3)', labelPos: 'tr' }] }),
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-blue-100 p-3 text-center"><MathText>{'$$|x| = \\begin{cases} x & \\text{si } x \\ge 0 \\\\ -x & \\text{si } x \\le 0 \\end{cases}$$'}</MathText></div>
            <ul className="space-y-1.5 text-sm text-slate-700">
              <li>• Symétrique par rapport à l’axe des ordonnées : |−x| = |x|.</li>
              <li>• |x| ≥ 0 ; minimum 0, atteint en 0 (le coin du V).</li>
              <li>• Descend sur ]−∞ ; 0], monte sur [0 ; +∞[.</li>
            </ul>
          </div>
        ),
      },
      {
        id: 'regle-carre-vs-va', type: 'regles', title: 'Le V et la parabole',
        summary: 'x² ≤ |x| exactement pour −1 ≤ x ≤ 1 ; les deux courbes se coupent en −1, 0 et 1.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <div className="bg-white rounded-xl border border-orange-100 p-3 text-center"><MathText>{'$$x^2 \\le |x| \\iff -1 \\le x \\le 1$$'}</MathText></div>
            <p>0,5² = 0,25 &lt; 0,5 ; 2² = 4 &gt; 2. Entre −1 et 1, élever au carré rapetisse.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la sonde près de 0, le V au-dessus de la parabole en pointillés.</div>
          </div>
        ),
      },
      {
        id: 'mem-le-v', type: 'memoriser', title: '⭐ |x| : le V',
        summary: 'Distance à 0, deux demi-droites, coin en O.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">|x| = distance à 0</div>
            <p className="text-xs text-rose-700">|x| = k ⟺ x = k ou x = −k (k &gt; 0)</p>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'methode-image-reference', type: 'methodes', title: 'Lire une image sur une courbe',
        summary: 'Partir de x sur l’axe horizontal, monter jusqu’à la courbe, lire l’ordonnée : c’est f(x). Il n’y a JAMAIS qu’un seul point — une fonction ne donne qu’une image.',
        body: (
          <div className="space-y-2 text-sm">
            <p>Sens IMAGE : je choisis x, la courbe répond f(x). Un point, toujours un seul.</p>
            <p>Sens ANTÉCÉDENT : je choisis k, je cherche les x tels que f(x) = k. Zéro, un ou deux points.</p>
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-indigo-900">f(3) = 9 et f(−3) = 9 : deux x différents, la MÊME image.</div>
          </div>
        ),
      },
      {
        id: 'methode-antecedents-reference', type: 'methodes', title: 'Résoudre x² = k, 1/x = k, |x| = k',
        summary: 'Sur la courbe : compter les points communs avec y = k. Carré et valeur absolue : 2 solutions si k > 0, 1 si k = 0, 0 si k < 0 ; inverse : 1 solution si k ≠ 0, 0 si k = 0.',
        body: (
          <div className="space-y-2 text-sm">
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-indigo-900">x² = 4 → −2 et 2 · x² = 0 → 0 · x² = −1 → aucune</div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">1/x = 2 → 0,5 · 1/x = 0 → aucune</div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">|x| = 3 → −3 et 3 · |x| = 0 → 0 · |x| = −1 → aucune</div>
          </div>
        ),
      },
      {
        id: 'regle-ordre-references', type: 'regles', title: 'Position relative des trois courbes',
        summary: 'Sur ]0 ; 1[ : x² < |x| < 1/x ; sur ]1 ; +∞[ : 1/x < |x| < x² ; les trois passent par (1 ; 1).',
        visual: <MiniGraph width={220} height={150} xMin={0} xMax={3} yMin={0} yMax={4} functions={[{ fn: (x) => x * x, color: SQ, label: 'x²' }, { fn: (x) => 1 / x, color: INV, gapAt: 0, label: '1/x' }, { fn: (x) => Math.abs(x), color: AB, label: '|x|' }]} points={[{ x: 1, y: 1, color: '#0f172a', label: '(1 ; 1)', labelPos: 'br' }]} />,
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <div className="bg-white rounded-xl border border-orange-100 p-3 text-center"><MathText>{'$$0 < x < 1 : x^2 < x < \\frac{1}{x} \\qquad x > 1 : \\frac{1}{x} < x < x^2$$'}</MathText></div>
            <p>Entre 0 et 1, élever au carré diminue et inverser augmente ; au-delà de 1, c’est le contraire.</p>
          </div>
        ),
      },
      {
        id: 'formule-references', type: 'formules', title: 'Les trois expressions',
        summary: 'x², 1/x (x ≠ 0), |x|.',
        body: <div className="bg-white rounded-xl border border-indigo-100 p-3 text-center"><MathText>{'$$f(x) = x^2 \\qquad g(x) = \\frac{1}{x}\\ (x \\neq 0) \\qquad h(x) = |x|$$'}</MathText></div>,
      },
    ],
    6: [
      {
        id: 'methode-modeliser-reference', type: 'methodes', title: 'Reconnaître une référence dans une situation',
        summary: 'Une aire de carré → x² ; « distance ÷ vitesse », « à partager entre » → 1/x ; un écart, une distance, une marge → |x|.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ul className="space-y-1 list-disc list-inside">
              <li>Aire d’un carré de côté c : A(c) = c² (c &gt; 0) — un côté de 1,5 m donne 2,25 m².</li>
              <li>Durée pour 120 km à v km/h : t(v) = 120/v — doubler v divise t par 2.</li>
              <li>Écart à 0 °C d’une température x : e(x) = |x| — deux températures à 2,5 °C de 0.</li>
            </ul>
            <p className="text-xs text-slate-500">Un point (−2 ; −0,5) d’ordonnée négative ne peut être que sur l’hyperbole.</p>
          </div>
        ),
      },
    ],
  },
};
