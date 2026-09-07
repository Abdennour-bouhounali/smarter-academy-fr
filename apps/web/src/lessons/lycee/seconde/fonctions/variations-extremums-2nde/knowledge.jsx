import React from 'react';
import MathText from '../../../../common/components/MathText';
import { MiniGraph } from '../../../../common/knowledge';

/** Connaissances de « Variations et extremums » — SOURCE UNIQUE (KNOWLEDGE_MAP.md). */
const nodes = [[0, 300], [3, 620], [6, 380], [8.5, 560], [10, 420]];
const trail = (x) => { for (let i = 0; i < nodes.length - 1; i += 1) { const [x0, y0] = nodes[i]; const [x1, y1] = nodes[i + 1]; if (x >= x0 && x <= x1) { const t = (x - x0) / (x1 - x0); return y0 + (y1 - y0) * (1 - Math.cos(Math.PI * t)) / 2; } } return NaN; };
const G = '#059669'; const Rr = '#e11d48';
const trailGraph = (extra = {}) => <MiniGraph width={220} height={150} xMin={0} xMax={10} yMin={0} yMax={700} functions={[{ fn: trail, color: '#4f46e5', domain: [0, 10] }]} {...extra} />;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'variations-sens', type: 'concepts', title: 'Sens de variation',
        summary: 'Sur un intervalle, une fonction est croissante (f(x) augmente quand x augmente) ou décroissante (f(x) diminue).',
        visual: trailGraph({ bands: [{ from: 0, to: 3, color: G }, { from: 3, to: 6, color: Rr }, { from: 6, to: 8.5, color: G }, { from: 8.5, to: 10, color: Rr }], points: [{ x: 3, y: 620, color: '#d97706', hollow: true }, { x: 6, y: 380, color: '#d97706', hollow: true }, { x: 8.5, y: 560, color: '#d97706', hollow: true }] }),
        body: (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900"><strong>Croissante</strong> sur [0 ; 3] — la courbe monte : quand x augmente, h(x) augmente</div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900"><strong>Décroissante</strong> sur [3 ; 6] — la courbe descend : quand x augmente, h(x) diminue</div>
            </div>
            <p className="text-sm text-slate-700">Le sens change aux <strong>sommets et vallées</strong> (3, 6, 8,5) ; entre deux, il ne change pas.</p>
            <div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">« Décroissante » ne veut pas dire « négative » : le sentier descend tout en restant au-dessus de 0 m.</div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la piste verte puis rose sous les pas du randonneur.</div>
          </div>
        ),
      },
      {
        id: 'methode-lire-variations-courbe', type: 'methodes', title: 'Lire les variations sur une courbe',
        summary: 'Parcourir la courbe de gauche à droite : là où elle monte, f est croissante ; là où elle descend, décroissante ; noter les abscisses des retournements.',
        body: <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700"><li>Repérer les sommets et les vallées : leurs abscisses délimitent les intervalles.</li><li>Sur chaque intervalle, un seul sens : monte ou descend.</li><li>Lire les valeurs de f aux bornes et aux retournements.</li></ol>,
      },
      {
        id: 'regle-plus-bas-au-bord', type: 'regles', title: 'Le plus haut, le plus bas : regarder aussi les bords',
        summary: 'On lit toujours sur un morceau d’axe précis — un INTERVALLE, noté [0 ; 10] : « de 0 à 10, bornes comprises ». Et la plus grande (ou plus petite) valeur atteinte sur cet intervalle peut être à une borne, pas dans un sommet ou un creux.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>La randonnée va de 0 à 10 km : ce morceau de l’axe des x, bornes comprises, s’écrit <strong>[0 ; 10]</strong> et s’appelle un <strong>intervalle</strong>. C’est lui qui fixe où l’on regarde — « le plus haut » n’a de sens que sur un intervalle donné.</p>
            <p>Sur [0 ; 10], le point le plus bas du sentier est le départ (300 m), plus bas que la vallée (380 m) : le plus bas peut se trouver à une <strong>borne</strong> de l’intervalle, pas seulement dans un creux.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : « plus bas : 300 m », alors que la vallée semblait le minimum.</div>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'definition-croissante-decroissante', type: 'concepts', title: 'Croissante, décroissante : la définition',
        summary: 'f croissante sur I : pour tous a, b de I, a < b ⟹ f(a) ≤ f(b). Décroissante : a < b ⟹ f(a) ≥ f(b).',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-blue-100 p-3 text-center"><MathText>{'$$\\text{croissante sur } I : a < b \\Rightarrow f(a) \\le f(b) \\qquad \\text{décroissante : } a < b \\Rightarrow f(a) \\ge f(b)$$'}</MathText></div>
            <p className="text-sm text-slate-700">Croissante : les images gardent l’ordre des abscisses. Décroissante : elles l’inversent. (Strictement, avec &lt; et &gt;.)</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : trois paires a &lt; b sur la montée, toujours h(a) &lt; h(b).</div>
          </div>
        ),
      },
      {
        id: 'vocab-monotone-intervalle', type: 'vocabulaire', title: 'Monotone — sur un intervalle',
        summary: 'Monotone sur I : croissante sur I ou décroissante sur I. Une variation s’énonce toujours sur un intervalle où elle est vraie.',
        body: <div className="space-y-2 text-sm text-slate-700"><p>h est monotone sur [0 ; 3] et sur [3 ; 6], mais pas sur [0 ; 6] : à cheval sur le sommet, a &lt; b ne dit rien sur h(a) et h(b).</p><div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">« f est croissante » sans intervalle n’a pas de sens pour le sentier.</div></div>,
      },
      {
        id: 'mem-croissante-ordre', type: 'memoriser', title: '⭐ Croissante : même ordre',
        summary: 'Croissante : a < b ⟹ f(a) ≤ f(b). Décroissante : l’ordre s’inverse.',
        body: <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2"><div className="text-xl font-black text-rose-700">a &lt; b ⟹ f(a) ≤ f(b) : croissante</div><p className="text-xs text-rose-700">a &lt; b ⟹ f(a) ≥ f(b) : décroissante · toujours sur un intervalle</p></div>,
      },
    ],
    3: [
      {
        id: 'tableau-de-variations', type: 'concepts', title: 'Tableau de variations',
        summary: 'Ligne du haut : bornes et abscisses des retournements ; ligne du bas : les valeurs de f, reliées par des flèches ↗ (croissante) ou ↘ (décroissante).',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="overflow-x-auto rounded-xl border border-blue-100 bg-white"><table className="w-full font-mono text-center text-sm"><tbody>
              <tr className="bg-slate-50"><th className="px-2 py-1 text-left">x</th><td>0</td><td /><td>3</td><td /><td>6</td><td /><td>8,5</td><td /><td>10</td></tr>
              <tr className="border-t"><th className="px-2 py-1 text-left">h(x)</th><td className="align-bottom">300</td><td className="text-emerald-600 text-xl">↗</td><td className="align-top">620</td><td className="text-rose-600 text-xl">↘</td><td className="align-bottom">380</td><td className="text-emerald-600 text-xl">↗</td><td className="align-top">560</td><td className="text-rose-600 text-xl">↘</td><td className="align-bottom">420</td></tr>
            </tbody></table></div>
            <p>Le tableau résume la courbe : les intervalles de monotonie, les valeurs aux bornes et aux retournements.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la piste peinte, flèche par flèche.</div>
          </div>
        ),
      },
      {
        id: 'methode-construire-tableau-variations', type: 'methodes', title: 'Construire un tableau de variations',
        summary: 'Repérer les retournements sur la courbe, écrire les abscisses en ordre croissant avec les bornes, une flèche par intervalle, les valeurs de f aux extrémités des flèches.',
        body: <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700"><li>Bornes de l’intervalle d’étude et abscisses des sommets / vallées, dans l’ordre.</li><li>Une flèche par intervalle : ↗ si la courbe monte, ↘ si elle descend.</li><li>La valeur de f à chaque abscisse de la ligne du haut, posée en haut ou en bas selon les flèches.</li></ol>,
      },
      {
        id: 'methode-lire-tableau-variations', type: 'methodes', title: 'Lire un tableau de variations',
        summary: 'Les flèches donnent les intervalles de croissance et de décroissance ; les valeurs aux extrémités encadrent f(x) sur chaque intervalle ; on peut en esquisser la courbe.',
        body: <div className="space-y-2 text-sm text-slate-700"><p>g : −4 ↗ 4 ↘ −4 ↗ 4 sur [−4 ; 4] : g croît sur [−4 ; −2] et [2 ; 4], décroît sur [−2 ; 2] ; pour x ∈ [−2 ; 2], −4 ≤ g(x) ≤ 4.</p><div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">Ligne du haut : des abscisses. Ligne du bas : des images. Ne pas les échanger en traçant.</div></div>,
      },
    ],
    4: [
      {
        id: 'maximum-minimum', type: 'concepts', title: 'Maximum et minimum sur un intervalle',
        summary: 'Le maximum de f sur I est la plus grande valeur que f prend sur I (une image, atteinte en une ou plusieurs abscisses) ; le minimum, la plus petite.',
        visual: trailGraph({ points: [{ x: 3, y: 620, color: '#059669', label: 'max 620', labelPos: 'tr' }, { x: 0, y: 300, color: '#e11d48', label: 'min 300', labelPos: 'br' }] }),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>« h admet sur [0 ; 10] un <strong>maximum</strong> égal à 620, <strong>atteint en</strong> 3 » : 620 est une valeur de h, 3 l’abscisse où on l’atteint.</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Il dépend de l’intervalle : sur [5 ; 10], le maximum est 560 (en 8,5).</li>
              <li>Il peut être au bord : le minimum sur [0 ; 10] est 300, en 0.</li>
              <li>Il peut être atteint plusieurs fois : g atteint 4 en −2 et en 4.</li>
            </ul>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la bande [5 ; 10] qui exclut le vrai sommet.</div>
          </div>
        ),
      },
      {
        id: 'methode-extremum-tableau', type: 'methodes', title: 'Trouver un extremum avec le tableau',
        summary: 'Sur l’intervalle demandé, comparer les valeurs de f aux bornes et aux retournements qu’il contient : la plus grande est le maximum, la plus petite le minimum.',
        body: <div className="space-y-2 text-sm text-slate-700"><p>Sur [5 ; 10], les candidats sont h(5), h(6) = 380, h(8,5) = 560 et h(10) = 420 : maximum 560 en 8,5, minimum 380 en 6.</p><p className="text-xs text-slate-500">Si une borne de l’intervalle n’est pas dans le tableau, il faut sa valeur (ou le sens de variation qui y mène) pour conclure.</p></div>,
      },
      {
        id: 'mem-valeur-et-endroit', type: 'memoriser', title: '⭐ Un maximum est une valeur atteinte',
        summary: 'Le maximum (une image) ≠ l’abscisse où il est atteint ; il dépend de l’intervalle ; il peut être au bord.',
        body: <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2"><div className="text-xl font-black text-rose-700">maximum = 620, atteint en 3</div><p className="text-xs text-rose-700">sur un intervalle · parfois au bord · parfois atteint plusieurs fois</p></div>,
      },
    ],
    5: [
      {
        id: 'methode-comparer-images-tableau', type: 'methodes', title: 'Comparer f(a) et f(b) avec le tableau',
        summary: 'Si a et b sont dans un même intervalle de monotonie, la flèche donne l’ordre ; sinon on ne peut pas conclure.',
        body: (
          <div className="space-y-2 text-sm">
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">0,5 &lt; 1,2 dans [−2 ; 2] où g décroît : g(0,5) &gt; g(1,2)</div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">−3 &lt; −2,5 dans [−4 ; −2] où g croît : g(−3) &lt; g(−2,5)</div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800">−1 et 3 : pas dans un même intervalle de monotonie — <strong>on ne peut pas conclure</strong></div>
          </div>
        ),
      },
      {
        id: 'methode-encadrer-images', type: 'methodes', title: 'Encadrer f(x) sur un intervalle',
        summary: 'Sur un intervalle de monotonie, f(x) est compris entre les valeurs aux deux extrémités de la flèche.',
        body: <div className="space-y-2 text-sm text-slate-700"><p>Sur [−2 ; 2], g décroît de 4 à −4 : pour tout x de [−2 ; 2], −4 ≤ g(x) ≤ 4. Le maximum majore toutes les images ; le minimum les minore.</p></div>,
      },
    ],
    6: [
      {
        id: 'methode-optimiser', type: 'methodes', title: 'Optimiser',
        summary: 'Modéliser la grandeur à optimiser par une fonction, dresser ou lire son tableau de variations, lire l’extremum et l’abscisse où il est atteint.',
        body: <div className="space-y-2 text-sm text-slate-700"><p>Enclos de périmètre 40 : A(x) = x(20 − x) sur [0 ; 20], croissante jusqu’à 10 puis décroissante : aire maximale 100 m² pour x = 10 — un carré.</p><p>Coût unitaire C : le minimum 6 € est atteint pour q = 40, la vallée du tableau.</p></div>,
      },
    ],
  },
};
