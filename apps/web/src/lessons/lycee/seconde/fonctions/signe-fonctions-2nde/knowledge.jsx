import React from 'react';
import MathText from '../../../../common/components/MathText';
import { MiniGraph } from '../../../../common/knowledge';

/** Connaissances de « Signe d'une fonction » — SOURCE UNIQUE (KNOWLEDGE_MAP.md). */
const cubic = (x) => 0.2 * (x + 3) * (x - 1) * (x - 4);
const G = '#059669'; const Rr = '#e11d48';

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'signe-position-courbe', type: 'concepts', title: 'Signe d’une fonction',
        summary: 'f(x) > 0 ⟺ le point d’abscisse x est au-dessus de l’axe des abscisses ; f(x) < 0 ⟺ en dessous ; f(x) = 0 ⟺ sur l’axe.',
        visual: <MiniGraph width={220} height={150} xMin={-4} xMax={5} yMin={-8} yMax={7} functions={[{ fn: cubic, color: '#4f46e5' }]} bands={[{ from: -4, to: -3, color: Rr }, { from: -3, to: 1, color: G }, { from: 1, to: 4, color: Rr }, { from: 4, to: 5, color: G }]} points={[{ x: -3, y: 0, color: '#d97706' }, { x: 1, y: 0, color: '#d97706' }, { x: 4, y: 0, color: '#d97706' }]} />,
        body: (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900"><strong>f(x) &gt; 0</strong> — la courbe est au-dessus de l’axe des abscisses</div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900"><strong>f(x) &lt; 0</strong> — la courbe est en dessous</div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900"><strong>f(x) = 0</strong> — la courbe touche l’axe : un zéro</div>
            </div>
            <div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">Le signe de f(x) n’est pas le signe de x : la température de 2 h (x &gt; 0) est négative.</div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : l’axe peint en vert et rose sous la sonde.</div>
          </div>
        ),
      },
      {
        id: 'zero-fonction', type: 'vocabulaire', title: 'Zéro d’une fonction',
        summary: 'Un zéro de f est une valeur de x telle que f(x) = 0 : une abscisse où la courbe touche l’axe.',
        body: <div className="space-y-2 text-sm text-slate-700"><p>Les zéros sont les <strong>solutions de l’équation f(x) = 0</strong>. Ce sont des abscisses (des nombres), pas des points.</p><p>La température s’annule à 6 h et 18 h : 6 et 18 sont les zéros de T.</p></div>,
      },
      {
        id: 'regle-signe-constant-entre-zeros', type: 'regles', title: 'Entre deux zéros, le signe est constant',
        summary: 'Une courbe d’un seul trait ne peut changer de signe qu’en traversant l’axe, donc en un zéro.',
        body: <div className="space-y-2 text-sm text-slate-700"><p>Entre deux zéros consécutifs, un seul signe : il suffit de tester une valeur pour le connaître.</p><div className="text-xs text-slate-400 italic">📍 Souvenir : une seule couleur entre deux points ambre.</div></div>,
      },
      {
        id: 'mem-au-dessus-en-dessous', type: 'memoriser', title: '⭐ Au-dessus : +, en dessous : −',
        summary: 'Le signe de f(x) se lit sur la position de la courbe par rapport à l’axe des abscisses.',
        body: <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2"><div className="text-xl font-black text-rose-700">au-dessus : f(x) &gt; 0 · en dessous : f(x) &lt; 0</div><p className="text-xs text-rose-700">sur l’axe : f(x) = 0, un zéro</p></div>,
      },
    ],
    2: [
      {
        id: 'tableau-de-signes', type: 'concepts', title: 'Tableau de signes',
        summary: 'Ligne du haut : les bornes et les zéros ; ligne du bas : un 0 sous chaque zéro, un signe par intervalle.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="overflow-x-auto rounded-xl border border-blue-100 bg-white">
              <table className="w-full font-mono text-center text-sm"><tbody>
                <tr className="bg-slate-50"><th className="px-2 py-1 text-left">x</th><td>−4</td><td /><td>−3</td><td /><td>1</td><td /><td>4</td><td /><td>5</td></tr>
                <tr className="border-t"><th className="px-2 py-1 text-left">f(x)</th><td /><td className="text-rose-700 font-bold">−</td><td className="text-amber-700 font-bold">0</td><td className="text-emerald-700 font-bold">+</td><td className="text-amber-700 font-bold">0</td><td className="text-rose-700 font-bold">−</td><td className="text-amber-700 font-bold">0</td><td className="text-emerald-700 font-bold">+</td><td /></tr>
              </tbody></table>
            </div>
            <p>Le tableau reprend l’axe peint : il résume le signe de f(x) pour tous les x.</p>
          </div>
        ),
      },
      {
        id: 'methode-construire-tableau', type: 'methodes', title: 'Construire un tableau de signes',
        summary: 'Trouver les zéros, les placer en ordre croissant, puis déterminer le signe sur chaque intervalle (lecture de la courbe ou test d’une valeur).',
        body: <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700"><li>Résoudre f(x) = 0 : les zéros, rangés dans l’ordre croissant, avec les bornes de l’étude.</li><li>Sur chaque intervalle entre deux zéros, un seul signe : le lire sur la courbe, ou calculer f en une valeur de l’intervalle.</li><li>Écrire 0 sous chaque zéro.</li></ol>,
      },
      {
        id: 'methode-lire-tableau', type: 'methodes', title: 'Lire un tableau de signes',
        summary: 'Signe de f(a) : la case de l’intervalle contenant a. f(x) > 0 : réunir les intervalles marqués +.',
        body: <div className="space-y-2 text-sm text-slate-700"><p>Pour f(x) &gt; 0 : les cases +, bornes exclues ; pour f(x) ≥ 0 : les cases + et les zéros. Deux morceaux se réunissent avec ∪.</p><div className="bg-white rounded-xl border border-emerald-100 p-3">f(x) &gt; 0 pour x ∈ ]−3 ; 1[ ∪ ]4 ; 5].</div></div>,
      },
    ],
    3: [
      {
        id: 'regle-signe-affine', type: 'regles', title: 'Signe de ax + b',
        summary: 'ax + b s’annule en x = −b/a ; à droite de ce zéro, il a le signe de a ; à gauche, le signe contraire.',
        visual: <MiniGraph width={220} height={150} xMin={-4} xMax={4} yMin={-4} yMax={4} functions={[{ fn: (x) => 2 * x - 3, color: '#4f46e5' }]} bands={[{ from: -4, to: 1.5, color: Rr }, { from: 1.5, to: 4, color: G }]} points={[{ x: 1.5, y: 0, color: '#d97706', label: '1,5', labelPos: 't' }]} />,
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="overflow-x-auto rounded-xl border border-orange-100 bg-white"><table className="w-full font-mono text-center text-sm"><tbody>
              <tr className="bg-slate-50"><th className="px-2 py-1 text-left">x</th><td>−∞</td><td /><td>−b/a</td><td /><td>+∞</td></tr>
              <tr className="border-t"><th className="px-2 py-1 text-left">ax + b</th><td /><td>signe de −a</td><td className="text-amber-700 font-bold">0</td><td>signe de a</td><td /></tr>
            </tbody></table></div>
            <div className="bg-white rounded-xl border border-orange-100 p-3">2x − 3 : zéro 1,5 ; a = 2 &gt; 0 → − avant 1,5, + après. −3x + 6 : zéro 2 ; a &lt; 0 → + avant 2, − après.</div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : b fait glisser le zéro, le signe de a choisit le côté vert.</div>
          </div>
        ),
      },
      {
        id: 'formule-zero-affine', type: 'formules', title: 'Zéro d’une fonction affine',
        summary: 'ax + b = 0 ⟺ x = −b/a (a ≠ 0).',
        body: <div className="bg-white rounded-xl border border-indigo-100 p-3 text-center"><MathText>{'$$ax + b = 0 \\iff x = -\\frac{b}{a}\\quad (a \\neq 0)$$'}</MathText></div>,
      },
      {
        id: 'mem-signe-de-a', type: 'memoriser', title: '⭐ Signe de a à droite du zéro',
        summary: 'Pour ax + b : le signe de a après le zéro, le contraire avant.',
        body: <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2"><div className="text-xl font-black text-rose-700">à droite du zéro : signe de a</div><p className="text-xs text-rose-700">zéro en −b/a</p></div>,
      },
    ],
    4: [
      {
        id: 'regle-signe-produit', type: 'regles', title: 'Signe d’un produit',
        summary: 'Une ligne par facteur ; dans chaque colonne, la règle des signes : même signe → +, signes contraires → −. Les zéros du produit sont ceux des facteurs.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="overflow-x-auto rounded-xl border border-orange-100 bg-white"><table className="w-full font-mono text-center text-sm"><tbody>
              <tr className="bg-slate-50"><th className="px-2 py-1 text-left">x</th><td>−∞</td><td /><td>−3</td><td /><td>1</td><td /><td>+∞</td></tr>
              <tr className="border-t"><th className="px-2 py-1 text-left">x − 1</th><td /><td>−</td><td>|</td><td>−</td><td className="text-amber-700 font-bold">0</td><td>+</td><td /></tr>
              <tr className="border-t"><th className="px-2 py-1 text-left">x + 3</th><td /><td>−</td><td className="text-amber-700 font-bold">0</td><td>+</td><td>|</td><td>+</td><td /></tr>
              <tr className="border-t bg-emerald-50/40"><th className="px-2 py-1 text-left">P(x)</th><td /><td className="text-emerald-700 font-bold">+</td><td className="text-amber-700 font-bold">0</td><td className="text-rose-700 font-bold">−</td><td className="text-amber-700 font-bold">0</td><td className="text-emerald-700 font-bold">+</td><td /></tr>
            </tbody></table></div>
            <p>P(x) = (x − 1)(x + 3) : le zéro de chaque facteur, puis colonne par colonne.</p>
          </div>
        ),
      },
      {
        id: 'regle-signe-quotient', type: 'regles', title: 'Signe d’un quotient',
        summary: 'Même règle des signes ; mais un zéro du dénominateur est une valeur interdite : double barre, jamais un 0.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <div className="bg-white rounded-xl border border-orange-100 p-3">Q(x) = (x + 2)/(x − 1) : zéro −2 (numérateur), valeur interdite 1 (dénominateur) : + ‖… + sur ]−∞ ; −2[, 0 en −2, − sur ]−2 ; 1[, ‖ en 1, + sur ]1 ; +∞[.</div>
            <div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">Q(1) n’existe pas : ni positif, ni négatif, ni nul. Une valeur interdite n’est jamais une solution.</div>
          </div>
        ),
      },
      {
        id: 'methode-tableau-produit-quotient', type: 'methodes', title: 'Tableau d’un produit ou d’un quotient',
        summary: 'Zéro de chaque facteur → une ligne par facteur → règle des signes colonne par colonne → 0 aux zéros du numérateur, ‖ aux zéros du dénominateur.',
        body: <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700"><li>Le zéro de chaque facteur affine (−b/a).</li><li>Une ligne par facteur : signe de a à droite de son zéro.</li><li>La dernière ligne par la règle des signes ; double barre sous chaque valeur interdite.</li></ol>,
      },
    ],
    5: [
      {
        id: 'methode-resoudre-par-le-signe', type: 'methodes', title: 'Résoudre f(x) = 0, > 0, < 0',
        summary: 'Mettre sous forme de produit ou quotient égalé à 0, dresser le tableau, lire : = 0 les zéros ; > 0 les cases + ; ≥ 0 les cases + et les zéros ; jamais une valeur interdite.',
        body: (
          <div className="space-y-2 text-sm">
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">(x − 1)(x + 3) = 0 → {'{−3 ; 1}'}</div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">(x − 1)(x + 3) &gt; 0 → ]−∞ ; −3[ ∪ ]1 ; +∞[</div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">(x − 1)(x + 3) ≤ 0 → [−3 ; 1] (zéros inclus)</div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800">(x + 2)/(x − 1) ≥ 0 → ]−∞ ; −2] ∪ ]1 ; +∞[ (1 interdit, jamais inclus)</div>
          </div>
        ),
      },
      {
        id: 'methode-verifier-graphiquement', type: 'methodes', title: 'Vérifier graphiquement',
        summary: 'Les solutions de f(x) > 0 sont les abscisses où la courbe est au-dessus de l’axe ; on les repère en bandes sur la courbe.',
        visual: <MiniGraph width={220} height={150} xMin={-5} xMax={3} yMin={-5} yMax={6} functions={[{ fn: (x) => (x - 1) * (x + 3), color: '#4f46e5' }]} bands={[{ from: -5, to: -3, color: G }, { from: 1, to: 3, color: G }]} points={[{ x: -3, y: 0, color: '#d97706' }, { x: 1, y: 0, color: '#d97706' }]} />,
        body: <div className="space-y-2 text-sm text-slate-700"><p>Après un calcul, regarder la courbe : les intervalles trouvés doivent être exactement ceux où la courbe est du bon côté de l’axe, avec les zéros aux bornes.</p><div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">« La courbe descend » n’est pas « f(x) &lt; 0 » : le sens de variation et le signe sont deux choses différentes.</div></div>,
      },
      {
        id: 'vocab-solutions-intervalles', type: 'vocabulaire', title: 'Écrire les solutions',
        summary: 'Un ensemble de solutions s’écrit avec des intervalles réunis par ∪ ; crochets fermés pour une borne incluse (zéro avec ≥, ≤), ouverts sinon.',
        body: <div className="space-y-2 text-sm text-slate-700"><p>]−∞ ; −3[ ∪ ]1 ; +∞[ : deux morceaux. [−3 ; 1] : zéros inclus. {'{−3 ; 1}'} : les solutions d’une équation.</p></div>,
      },
    ],
    6: [
      {
        id: 'methode-modeliser-signe', type: 'methodes', title: 'Le signe répond à une question',
        summary: 'Gel (T < 0), bénéfice (B > 0), un quotient négatif : traduire la question par une inéquation, puis résoudre par le tableau, sur l’intervalle de la situation.',
        body: <div className="space-y-2 text-sm text-slate-700"><p>T(t) = −0,1(t − 6)(t − 18) sur [0 ; 24] : il gèle (T &lt; 0) pour t ∈ [0 ; 6[ ∪ ]18 ; 24] — les bornes 0 et 24 sont dans l’étude, 6 et 18 sont des zéros.</p><p>B(q) = (q − 20)(80 − q) &gt; 0 pour q ∈ ]20 ; 80[.</p></div>,
      },
    ],
  },
};
