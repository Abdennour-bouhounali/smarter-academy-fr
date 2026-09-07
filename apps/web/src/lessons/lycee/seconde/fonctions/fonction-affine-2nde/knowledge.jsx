import React from 'react';
import MathText from '../../../../common/components/MathText';
import { MiniGraph } from '../../../../common/knowledge';

/** Connaissances de « Fonction affine » — SOURCE UNIQUE (KNOWLEDGE_MAP.md). */
const tank = (extra = {}) => <MiniGraph width={220} height={150} xMin={0} xMax={10} yMin={0} yMax={40} functions={[{ fn: (t) => 3 * t + 10, color: '#0284c7' }]} {...extra} />;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'fonction-affine-ab', type: 'concepts', title: 'Fonction affine : f(x) = ax + b',
        summary: 'a est ce que f gagne quand x augmente de 1 (le même à chaque unité) ; b est la valeur de départ f(0).',
        visual: tank({ points: [{ x: 0, y: 10, color: '#d97706', label: 'b = 10', labelPos: 'tr' }, { x: 4, y: 22, color: '#0284c7', label: '+3 / min', labelPos: 'bl' }] }),
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-blue-100 p-3 text-center"><MathText>{'$$V(t) = 3t + 10 \\qquad f(x) = ax + b$$'}</MathText></div>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-indigo-900"><strong>a</strong> (coefficient directeur) — le débit : +3 L à chaque minute ; a &gt; 0 remplit, a &lt; 0 vide, a = 0 stagne</div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900"><strong>b</strong> (ordonnée à l’origine) — les 10 L au départ : V(0) = b, le point (0 ; b)</div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la droite qui glisse avec b et pivote autour de (0 ; b) avec a.</div>
          </div>
        ),
      },
      {
        id: 'vocab-coefficient-ordonnee', type: 'vocabulaire', title: 'Coefficient directeur, ordonnée à l’origine',
        summary: 'Dans ax + b : a est le coefficient directeur, b l’ordonnée à l’origine. La courbe est une droite.',
        body: <div className="space-y-2 text-sm text-slate-700"><p>V(t) = 2t + 12 : coefficient directeur 2 (2 L par minute), ordonnée à l’origine 12 (12 L au départ). La représentation graphique d’une fonction affine est une <strong>droite</strong>.</p><div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">Le nombre qui multiplie la variable est a, le nombre seul est b — ne pas les échanger.</div></div>,
      },
      {
        id: 'mem-a-taux-b-depart', type: 'memoriser', title: '⭐ a par unité, b au départ',
        summary: 'a : ce que f gagne quand x augmente de 1. b : f(0).',
        body: <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2"><div className="text-xl font-black text-rose-700">f(x) = ax + b</div><p className="text-xs text-rose-700">a = variation par unité · b = valeur pour x = 0</p></div>,
      },
    ],
    2: [
      {
        id: 'taux-accroissement', type: 'concepts', title: 'Taux d’accroissement',
        summary: 'Entre x₁ et x₂, le taux d’accroissement est (f(x₂) − f(x₁)) / (x₂ − x₁). Pour une fonction affine, il vaut a quels que soient x₁ et x₂.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-blue-100 p-3 text-center"><MathText>{'$$a = \\frac{f(x_2) - f(x_1)}{x_2 - x_1}$$'}</MathText></div>
            <p className="text-sm text-slate-700">Sur V(t) = 3t + 10 : entre 1 et 3, (19 − 13) ÷ 2 = 3 ; entre 0 et 10, (40 − 10) ÷ 10 = 3. Toujours 3. Sur une courbe qui n’est pas une droite, ce quotient change.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : trois paires d’instants, le même quotient.</div>
          </div>
        ),
      },
      {
        id: 'methode-reconnaitre-affine-table', type: 'methodes', title: 'Reconnaître une fonction affine dans une table',
        summary: 'Calculer (Δy) ÷ (Δx) entre plusieurs couples : s’il est constant, la fonction est affine, ce quotient est a, et b se lit en x = 0.',
        body: <div className="space-y-2 text-sm text-slate-700"><p>0 → 3, 1 → 5, 2 → 7, 4 → 11 : (5 − 3)/1 = 2, (11 − 7)/2 = 2 → affine, y = 2x + 3.</p><p>0 → 1, 1 → 2, 2 → 5 : (2 − 1)/1 = 1 puis (5 − 2)/1 = 3 → pas affine.</p><div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">Comparer des quotients, pas des différences : les x ne sont pas forcément espacés de 1.</div></div>,
      },
      {
        id: 'formule-taux', type: 'formules', title: 'Le coefficient directeur par deux valeurs',
        summary: 'a = (f(x₂) − f(x₁)) / (x₂ − x₁), différences prises dans le même ordre.',
        body: <div className="bg-white rounded-xl border border-indigo-100 p-3 text-center"><MathText>{'$$a = \\frac{f(x_2) - f(x_1)}{x_2 - x_1}\\qquad f(2) = 7,\\ f(5) = 16 \\Rightarrow a = \\frac{16 - 7}{5 - 2} = 3$$'}</MathText></div>,
      },
    ],
    3: [
      {
        id: 'regle-signe-a-variations', type: 'regles', title: 'Le signe de a et les variations',
        summary: 'a > 0 : f croissante sur ℝ ; a < 0 : décroissante sur ℝ ; a = 0 : constante. b n’intervient pas.',
        visual: <MiniGraph width={220} height={150} xMin={-3} xMax={3} yMin={-4} yMax={5} functions={[{ fn: (x) => 1.2 * x + 1, color: '#059669', label: 'a > 0' }, { fn: (x) => -0.8 * x + 2, color: '#e11d48', label: 'a < 0' }, { fn: () => -2, color: '#64748b', label: 'a = 0' }]} />,
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">a &gt; 0 → ↗ croissante sur ℝ</div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">a &lt; 0 → ↘ décroissante sur ℝ</div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800">a = 0 → constante</div>
            </div>
            <p>Une fonction affine est monotone sur ℝ tout entier : une seule flèche dans son tableau de variations. f(x) = 0,5x − 9 est croissante malgré son b négatif.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la flèche qui bascule quand a passe par 0, et b qui n’y change rien.</div>
          </div>
        ),
      },
      {
        id: 'methode-lire-a-b-graphique', type: 'methodes', title: 'Lire a et b sur un graphique',
        summary: 'b : l’ordonnée du point où la droite coupe l’axe vertical. a : un escalier — variation de y divisée par variation de x, signe compris.',
        body: <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700"><li>b : lire l’ordonnée du point d’abscisse 0.</li><li>a : choisir deux points de la droite, calculer (Δy) ÷ (Δx) ; une droite qui descend donne a négatif.</li><li>Contrôler : le sens de la droite et le signe de a doivent concorder.</li></ol>,
      },
    ],
    4: [
      {
        id: 'methode-determiner-affine', type: 'methodes', title: 'Déterminer une fonction affine à partir de deux données',
        summary: 'a par le taux entre les deux couples, puis b en remplaçant x et f(x) par l’un des couples : b = f(x₁) − a·x₁.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1">
              <div>f(1) = 5 et f(4) = 11 : a = (11 − 5) ÷ (4 − 1) = 2.</div>
              <div>Puis 5 = 2 × 1 + b, donc b = 3. f(x) = 2x + 3 ; vérification : 2 × 4 + 3 = 11 ✓.</div>
            </div>
            <div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">b n’est pas f(1) : c’est f(0). On « remonte » à 0 avec le taux.</div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le point b = 3 marqué sur l’axe et l’escalier +1 → +2.</div>
          </div>
        ),
      },
      {
        id: 'mem-deux-points', type: 'memoriser', title: '⭐ Deux données : a, puis b',
        summary: 'a = quotient des différences ; b = f(x₁) − a·x₁.',
        body: <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2"><div className="text-xl font-black text-rose-700">a = Δf / Δx, puis b = f(x₁) − a·x₁</div><p className="text-xs text-rose-700">vérifier avec l’autre couple</p></div>,
      },
    ],
    5: [
      {
        id: 'regle-signe-affine-zero', type: 'regles', title: 'Signe de ax + b',
        summary: 'Le zéro est −b/a ; à droite du zéro, ax + b a le signe de a ; à gauche, le signe contraire.',
        body: <div className="space-y-2 text-sm text-slate-700"><div className="bg-white rounded-xl border border-orange-100 p-3 text-center"><MathText>{'$$ax + b = 0 \\iff x = -\\frac{b}{a}$$'}</MathText></div><p>V(t) = −4t + 30 : zéro 7,5 ; a &lt; 0 donc V &gt; 0 avant 7,5 (le réservoir contient encore de l’eau), V &lt; 0 après (le modèle ne décrit plus rien).</p></div>,
      },
      {
        id: 'methode-equation-affine', type: 'methodes', title: 'Résoudre ax + b = k',
        summary: 'Isoler x : ax = k − b, puis x = (k − b)/a. Vérifier en remplaçant.',
        body: <div className="space-y-2 text-sm text-slate-700"><div className="bg-white rounded-xl border border-emerald-100 p-3">−4t + 30 = 20 ⟺ −4t = −10 ⟺ t = 2,5. Contrôle : −4 × 2,5 + 30 = 20 ✓.</div></div>,
      },
      {
        id: 'methode-inequation-affine', type: 'methodes', title: 'Résoudre ax + b > k',
        summary: 'Isoler x comme pour une équation ; en divisant par a < 0, le sens de l’inégalité s’inverse. Vérifier avec une valeur.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <div className="bg-white rounded-xl border border-emerald-100 p-3">−4t + 30 &gt; 10 ⟺ −4t &gt; −20 ⟺ <strong>t &lt; 5</strong> (division par −4). Contrôle : t = 3 donne 18 &gt; 10 ✓.</div>
            <div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">Diviser (ou multiplier) par un nombre négatif retourne l’inégalité. Le tableau de signes de ax + b dit la même chose.</div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le réservoir qui se vide — « plus de 10 L » au début, pas à la fin.</div>
          </div>
        ),
      },
    ],
    6: [
      {
        id: 'methode-modeliser-affine', type: 'methodes', title: 'Modéliser par une fonction affine',
        summary: '« Tant au départ, puis tant par unité » : b puis a (négatif si ça diminue) ; ensuite une image, une équation ou une inéquation répond à la question.',
        body: <div className="space-y-2 text-sm text-slate-700"><ul className="list-disc list-inside space-y-1"><li>Abonnement : 25 € puis 30 €/mois → C(m) = 30m + 25 ; budget 205 € ⟹ 30m + 25 ≤ 205 ⟹ m ≤ 6.</li><li>Téléphérique : 2 400 m, 1 800 m après 4 min → a = −150, h(t) = −150t + 2 400.</li><li>Bougie : 20 cm, −2,5 cm/h → L(t) = −2,5t + 20 ; L(t) = 5 ⟹ t = 6 ; L(t) &gt; 10 ⟹ t &lt; 4.</li></ul></div>,
      },
    ],
  },
};
