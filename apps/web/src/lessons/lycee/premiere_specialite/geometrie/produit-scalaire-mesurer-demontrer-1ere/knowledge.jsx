import React from 'react';
import MathText from '../../../../common/components/MathText';
import { MiniPlane } from '../../../../common/knowledge';

/**
 * Connaissances de « Produit scalaire : mesurer et démontrer » — SOURCE UNIQUE
 * (docs/architecture/KNOWLEDGE_MAP.md). Le texte d'une brique vit ICI et nulle
 * part ailleurs ; les modules la posent par son id, au moment où le geste vient
 * de lui donner du sens.
 *
 * L'ORDRE DES MODULES EST LA LIGNE DU TEMPS. Le module 1 ne pose AUCUNE brique
 * portant les mots « calculer un angle », « équation normale » ni « nature du
 * triangle » : il pose ce qu'il a fait CONSTATER — un instrument qui lit tout à
 * partir d'un seul calcul, et un angle droit qui est un ZÉRO exact. Les
 * formules viennent aux modules 2 et 3, la droite au 4, la démonstration au 5.
 */
const A = '#7c3aed';
const B = '#0284c7';
const C = '#d97706';
const N = '#e11d48';
const OK = '#059669';

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'instrument-unique',
        type: 'concepts',
        title: 'Un seul calcul, deux instruments',
        summary:
          'Le même produit scalaire donne les angles ET les longueurs d’une figure. Il remplace le rapporteur et la règle d’un coup — plus rien ne se mesure sur le dessin.',
        visual: (
          <MiniPlane
            width={220} height={155} xMin={-4} xMax={5} yMin={-3} yMax={4}
            points={[
              { x: -3, y: -2, label: 'A', color: A, labelPos: 'bl' },
              { x: 2, y: -2, label: 'B', color: B, labelPos: 'br' },
              { x: 0, y: 3, label: 'C', color: C, labelPos: 'tr' },
            ]}
            segments={[
              { from: { x: -3, y: -2 }, to: { x: 2, y: -2 }, color: '#4f46e5' },
              { from: { x: 2, y: -2 }, to: { x: 0, y: 3 }, color: '#4f46e5' },
              { from: { x: 0, y: 3 }, to: { x: -3, y: -2 }, color: '#4f46e5' },
            ]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Sur une figure repérée, tout se ramène à des flèches, et toute flèche entre dans le
              même calcul. Deux emplois seulement :
            </p>
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-violet-900">
                <strong>Deux flèches DIFFÉRENTES</strong> → leur produit scalaire ouvre sur l’angle
                qu’elles forment
              </div>
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
                <strong>Une flèche par ELLE-MÊME</strong> → le résultat est le carré de sa longueur
              </div>
            </div>
            <p>
              Ni rapporteur, ni règle graduée : quatre coordonnées suffisent. Et comme les angles et
              les longueurs sortent de la même opération, la <strong>forme</strong> d’une figure se
              lit d’un seul coup d’œil sur les nombres.
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le panneau de six cases qui bougeait toutes ensemble quand tu déplaçais un sommet.</div>
          </div>
        ),
      },
      {
        id: 'zero-exact-vs-presque',
        type: 'concepts',
        title: 'Zéro exact, ou presque zéro',
        summary:
          'Un produit scalaire nul est un angle droit DÉMONTRÉ. Un produit scalaire qui vaut 1 pour des flèches de longueur 8 donne un angle de 88,99° : la figure ment, le nombre non.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-3">
                <div className="font-mono text-2xl font-black text-emerald-900">0</div>
                <div className="text-xs text-emerald-800">angle droit, sans discussion</div>
              </div>
              <div className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3">
                <div className="font-mono text-2xl font-black text-rose-900">1</div>
                <div className="text-xs text-rose-800">88,99° — l’œil ne voit pas la différence</div>
              </div>
            </div>
            <p>
              Sur une figure de 300 pixels, un degré d’écart représente moins de trois pixels au bout
              d’un côté. Aucun regard ne le distingue. Le calcul, lui, rend <strong>1</strong> et non
              <strong> 0</strong> : c’est net.
            </p>
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              C’est pour cela qu’on ne conclut jamais « on voit bien que c’est droit ». On calcule,
              et on regarde si le résultat est exactement nul.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la pastille qui passait de « rectangle » à « quelconque » alors que la figure n’avait presque pas bougé.</div>
          </div>
        ),
      },
    ],

    2: [
      {
        id: 'formule-cosinus-angle',
        type: 'formules',
        title: 'L’angle par le produit scalaire',
        summary:
          'La formule des normes et de l’angle, retournée : cos θ = (u · v) / (‖u‖ × ‖v‖). L’angle s’en déduit à la calculatrice.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-center">
              <MathText>{'$$\\cos\\theta = \\dfrac{\\vec{u} \\cdot \\vec{v}}{\\|\\vec{u}\\| \\times \\|\\vec{v}\\|}$$'}</MathText>
            </div>
            <p>
              On connaissait déjà u · v = ‖u‖ × ‖v‖ × cos θ. Il suffit de diviser les deux membres par
              ‖u‖ × ‖v‖ — deux nombres jamais nuls tant qu’aucune flèche ne l’est.
            </p>
            <div className="rounded-xl border border-violet-100 bg-white p-3 space-y-1 text-xs">
              <div className="text-slate-500">u(4 ; 3) et v(0 ; 5)</div>
              <div className="font-mono">u · v = 4 × 0 + 3 × 5 = 15</div>
              <div className="font-mono">‖u‖ = 5, ‖v‖ = 5, donc cos θ = 15 / 25 = 0,6</div>
              <div className="font-mono text-violet-800">θ = <strong>53,13°</strong></div>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le piège : s’arrêter à 15 et l’annoncer comme un angle. Le produit scalaire n’est pas
              l’angle — c’est son <strong>cosinus</strong> qu’on obtient, après division.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les trois cases d’angles du théodolite, toutes calculées par cette division.</div>
          </div>
        ),
      },
      {
        id: 'regle-signe-cosinus',
        type: 'regles',
        title: 'Le signe du produit dit le type d’angle',
        summary:
          'Produit positif → angle aigu. Nul → droit. Négatif → obtus, et le cosinus est alors négatif lui aussi.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-800">u · v &gt; 0<br /><strong>θ &lt; 90°</strong></div>
              <div className="rounded-lg bg-slate-100 p-2 text-slate-800">u · v = 0<br /><strong>θ = 90°</strong></div>
              <div className="rounded-lg bg-rose-50 p-2 text-rose-800">u · v &lt; 0<br /><strong>θ &gt; 90°</strong></div>
            </div>
            <p>
              Les deux normes sont toujours positives : c’est donc le cosinus SEUL qui porte le signe
              du produit. Et le cosinus ne devient négatif qu’au-delà de 90°.
            </p>
            <div className="rounded-xl border border-rose-100 bg-white p-3 space-y-1 text-xs">
              <div className="text-slate-500">u(4 ; 3) et v(−5 ; 0)</div>
              <div className="font-mono">u · v = −20, cos θ = −20 / 25 = −0,8</div>
              <div className="font-mono text-rose-800">θ = <strong>143,13°</strong> — bien au-delà de l’angle droit</div>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              La calculatrice rend directement un angle entre 0° et 180° : il n’y a rien à corriger,
              rien à retrancher de 180. Le signe est déjà dans le cosinus.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-calculer-un-angle',
        type: 'methodes',
        title: 'Calculer un angle d’une figure',
        summary:
          'Fabriquer les deux flèches issues du sommet, calculer leur produit scalaire et leurs normes, diviser, puis lire l’angle.',
        body: (
          <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">
            <li>Repérer le SOMMET de l’angle, et les deux points vers lesquels il pointe.</li>
            <li>Fabriquer les deux flèches issues de ce sommet — arrivée moins départ, dans cet ordre.</li>
            <li>Calculer leur produit scalaire, puis les deux normes.</li>
            <li>Diviser le produit par le produit des normes : c’est le cosinus.</li>
            <li>Lire l’angle correspondant, et vérifier son signe : négatif ⟹ plus de 90°.</li>
          </ol>
        ),
      },
      {
        id: 'mem-cosinus-angle',
        type: 'memoriser',
        title: '⭐ cos θ = (u · v) / (‖u‖ ‖v‖)',
        summary: 'Le produit divisé par les deux longueurs donne le cosinus, jamais l’angle directement.',
        body: (
          <div className="bg-violet-50 rounded-xl border-2 border-violet-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-violet-700">cos θ = (u · v) ÷ (‖u‖ × ‖v‖)</div>
            <p className="text-xs text-violet-700">le rapporteur n’est plus nécessaire</p>
          </div>
        ),
      },
    ],

    3: [
      {
        id: 'formule-carre-scalaire-longueur',
        type: 'formules',
        title: 'La longueur par le carré scalaire',
        summary:
          'Une flèche multipliée par elle-même donne le carré de sa longueur : ‖AB‖² = AB · AB. La longueur est la racine de ce nombre.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-center">
              <MathText>{'$$\\|\\overrightarrow{AB}\\|^2 = \\overrightarrow{AB} \\cdot \\overrightarrow{AB} \\qquad AB = \\sqrt{\\overrightarrow{AB} \\cdot \\overrightarrow{AB}}$$'}</MathText>
            </div>
            <p>
              L’angle d’une flèche avec elle-même vaut 0°, donc son cosinus vaut 1 : il ne reste que
              ‖AB‖ × ‖AB‖. C’est la règle graduée du produit scalaire.
            </p>
            <div className="rounded-xl border border-sky-100 bg-white p-3 space-y-1 text-xs">
              <div className="text-slate-500">A(−2 ; −1) et B(2 ; 2), donc AB(4 ; 3)</div>
              <div className="font-mono">AB · AB = 4 × 4 + 3 × 3 = <strong>25</strong></div>
              <div className="font-mono text-sky-800">AB = √25 = <strong>5</strong></div>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le piège : donner 25 comme longueur. Le produit scalaire rend le CARRÉ ; il reste une
              racine à prendre. Et l’inverse est un piège aussi : dans un calcul, c’est souvent le
              carré qu’il faut garder, pas la racine.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la ligne « carré = 25 » sous la longueur 5, dans le panneau du théodolite.</div>
          </div>
        ),
      },
      {
        id: 'regle-carres-entiers',
        type: 'regles',
        title: 'Comparer des carrés, jamais des racines arrondies',
        summary:
          'Deux côtés sont égaux exactement quand leurs CARRÉS le sont. Les longueurs affichées, elles, sont arrondies et peuvent se ressembler sans être égales.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-center text-sm"><tbody>
                <tr className="bg-slate-50"><th className="px-2 py-1 text-left font-sans text-xs">carré exact</th><td className="font-mono">106</td><td className="font-mono">109</td></tr>
                <tr className="border-t"><th className="px-2 py-1 text-left font-sans text-xs">longueur affichée</th><td className="font-mono">10,3</td><td className="font-mono">10,44</td></tr>
              </tbody></table>
            </div>
            <p>
              Ces deux côtés diffèrent de 1,4 % : sur un dessin, personne ne les distingue. Leurs
              carrés, eux, sont deux entiers <strong>différents</strong> — la question est tranchée.
            </p>
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              Règle de travail : tant qu’on peut, on reste au carré. On ne prend la racine qu’au tout
              dernier moment, quand il faut annoncer une longueur.
            </div>
          </div>
        ),
      },
      {
        id: 'regle-al-kashi',
        type: 'regles',
        title: 'Al-Kashi : le Pythagore des triangles non rectangles',
        summary:
          'BC² = AB² + AC² − 2 × AB × AC × cos(Â). Quand Â vaut 90°, le dernier terme s’annule et on retrouve Pythagore.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-center">
              <MathText>{'$$BC^2 = AB^2 + AC^2 - 2 \\times AB \\times AC \\times \\cos(\\widehat{A})$$'}</MathText>
            </div>
            <p>
              La démonstration tient en une ligne : BC = AC − AB, donc BC · BC = (AC − AB) · (AC − AB),
              qu’on développe. Le double produit qui apparaît est exactement 2 × AB · AC.
            </p>
            <div className="rounded-xl border border-sky-100 bg-white p-3 space-y-1 text-xs">
              <div className="text-slate-500">AB = 7, AC = 5, Â = 60°</div>
              <div className="font-mono">BC² = 49 + 25 − 2 × 7 × 5 × 0,5 = 74 − 35 = <strong>39</strong></div>
              <div className="font-mono text-sky-800">BC = √39 ≈ 6,24</div>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
              Contrôle : avec Â = 90°, cos vaut 0 et il reste BC² = AB² + AC². Al-Kashi CONTIENT
              Pythagore, il ne le remplace pas.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-carre-scalaire',
        type: 'memoriser',
        title: '⭐ AB · AB = AB²',
        summary: 'Une flèche par elle-même rend le carré de sa longueur — et jamais la longueur.',
        body: (
          <div className="bg-sky-50 rounded-xl border-2 border-sky-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-sky-700">AB · AB = AB²</div>
            <p className="text-xs text-sky-700">il reste une racine à prendre pour obtenir la longueur</p>
          </div>
        ),
      },
    ],

    4: [
      {
        id: 'regle-forme-normale',
        type: 'regles',
        title: 'L’équation sous forme normale',
        summary:
          'Un point P₀(x₀ ; y₀) et un vecteur normal n(a ; b) suffisent : la droite est l’ensemble des M tels que n · P₀M = 0, ce qui s’écrit a(x − x₀) + b(y − y₀) = 0.',
        visual: (
          <MiniPlane
            width={220} height={155} xMin={-3} xMax={6} yMin={-4} yMax={3}
            points={[{ x: 1, y: -2, label: 'P₀', color: '#0f172a', labelPos: 'bl' }]}
            arrows={[{ from: { x: 1, y: -2 }, to: { x: 4, y: 2 }, color: N }]}
            segments={[{ from: { x: -3, y: 1 }, to: { x: 5, y: -5 }, color: '#94a3b8', dashed: true }]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
              <MathText>{'$$a(x - x_0) + b(y - y_0) = 0$$'}</MathText>
            </div>
            <p>
              Un point M est sur la droite exactement quand la flèche P₀M ne fait <em>aucune</em> avancée
              dans la direction de n. Autrement dit quand n · P₀M vaut 0. En écrivant ce produit
              scalaire avec les coordonnées, la forme apparaît toute seule.
            </p>
            <div className="rounded-xl border border-emerald-100 bg-white p-3 space-y-1 text-xs">
              <div className="text-slate-500">P₀(1 ; −2), n(3 ; 4)</div>
              <div className="font-mono">3(x − 1) + 4(y + 2) = 0</div>
              <div className="font-mono">3x − 3 + 4y + 8 = 0, soit <strong>3x + 4y + 5 = 0</strong></div>
              <div className="font-mono text-slate-500">contrôle en P₀ : 3 − 8 + 5 = 0 ✔</div>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le piège du signe : y₀ vaut −2, donc y − y₀ s’écrit y + 2. Recopier « y − 2 » donne une
              droite parallèle qui rate le point.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la flèche rouge plantée en travers, et l’équation qui en tombait en deux lignes.</div>
          </div>
        ),
      },
      {
        id: 'formule-distance-point-droite',
        type: 'formules',
        title: 'La distance d’un point à une droite',
        summary:
          'Pour ax + by + c = 0 et un point M(x_M ; y_M), la distance vaut |a·x_M + b·y_M + c| ÷ √(a² + b²).',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
              <MathText>{'$$d(M, \\mathcal{D}) = \\dfrac{|a x_M + b y_M + c|}{\\sqrt{a^2 + b^2}}$$'}</MathText>
            </div>
            <p>
              Le numérateur mesure de combien M rate l’équation ; le dénominateur est la longueur du
              vecteur normal, qui ramène ce nombre à une vraie distance.
            </p>
            <div className="rounded-xl border border-emerald-100 bg-white p-3 space-y-1 text-xs">
              <div className="text-slate-500">M(0 ; 0) et la droite 3x + 4y + 5 = 0</div>
              <div className="font-mono">|0 + 0 + 5| ÷ √(9 + 16) = 5 ÷ 5 = <strong>1</strong></div>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Sans la division par √(a² + b²), on obtiendrait 5 : le même point paraîtrait cinq fois
              plus loin. Et sans la valeur absolue, la distance pourrait sortir négative.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-ecrire-forme-normale',
        type: 'methodes',
        title: 'Écrire une droite sous forme normale',
        summary: 'Poser a et b avec le normal, x₀ et y₀ avec le point, puis développer et vérifier.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Prendre les coordonnées du vecteur normal : ce sont a et b.</li>
              <li>Écrire a(x − x₀) + b(y − y₀) = 0 avec les coordonnées du point, signes compris.</li>
              <li>Développer pour obtenir ax + by + c = 0.</li>
              <li>Contrôler en remplaçant x et y par le point de départ : on doit trouver 0.</li>
            </ol>
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-xs">
              P₀(2 ; −1), n(5 ; −3) : 5(x − 2) − 3(y + 1) = 0, soit 5x − 10 − 3y − 3 = 0, donc
              <strong className="font-mono"> 5x − 3y − 13 = 0</strong>. Contrôle : 10 + 3 − 13 = 0 ✔
            </div>
          </div>
        ),
      },
      {
        id: 'mem-forme-normale',
        type: 'memoriser',
        title: '⭐ a(x − x₀) + b(y − y₀) = 0',
        summary: 'Le normal donne a et b, le point donne x₀ et y₀ — dans cet ordre, sans les mélanger.',
        body: (
          <div className="bg-emerald-50 rounded-xl border-2 border-emerald-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-emerald-700">a(x − x₀) + b(y − y₀) = 0</div>
            <p className="text-xs text-emerald-700">n(a ; b) en travers, P₀(x₀ ; y₀) dessus</p>
          </div>
        ),
      },
    ],

    5: [
      {
        id: 'regle-deux-criteres',
        type: 'regles',
        title: 'Deux critères qu’il ne faut jamais confondre',
        summary:
          'L’alignement se démontre par la COLINÉARITÉ (le déterminant est nul). L’orthogonalité se démontre par le PRODUIT SCALAIRE (il est nul). Trois points alignés ont en général un produit scalaire non nul.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
                <div className="text-xs font-semibold text-indigo-800 mb-1">Trois points alignés ?</div>
                <div className="font-mono text-[15px] text-indigo-900">les deux flèches sont colinéaires</div>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <div className="text-xs font-semibold text-emerald-800 mb-1">Deux directions en travers ?</div>
                <div className="font-mono text-[15px] text-emerald-900">leur produit scalaire vaut 0</div>
              </div>
            </div>
            <div className="rounded-xl border border-rose-100 bg-white p-3 space-y-1 text-xs">
              <div className="text-slate-500">D(−3 ; −1), E(0 ; 1), F(3 ; 3) — trois points ALIGNÉS</div>
              <div className="font-mono">DE(3 ; 2) et DF(6 ; 4) : DF = 2 × DE, ils sont bien colinéaires</div>
              <div className="font-mono text-rose-700">et pourtant DE · DF = 18 + 8 = <strong>26</strong>, pas 0</div>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Un produit scalaire nul ne dit RIEN de l’alignement, et un produit scalaire non nul ne
              l’interdit pas. Ce sont deux questions différentes, avec deux calculs différents.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les trois points sur une même ligne, dont le produit scalaire valait 26.</div>
          </div>
        ),
      },
      {
        id: 'methode-nature-triangle',
        type: 'methodes',
        title: 'Déterminer la nature d’un triangle',
        summary:
          'Calculer les trois carrés des côtés et les trois produits scalaires aux sommets, puis conclure — sans jamais regarder la figure.',
        visual: (
          <MiniPlane
            width={220} height={155} xMin={-6} xMax={5} yMin={-4} yMax={4}
            points={[
              { x: -5, y: 0, label: 'A', color: A, labelPos: 'bl' },
              { x: 1, y: -3, label: 'B', color: B, labelPos: 'br' },
              { x: 4, y: 3, label: 'C', color: C, labelPos: 'tr' },
            ]}
            segments={[
              { from: { x: -5, y: 0 }, to: { x: 1, y: -3 }, color: OK },
              { from: { x: 1, y: -3 }, to: { x: 4, y: 3 }, color: OK },
              { from: { x: 4, y: 3 }, to: { x: -5, y: 0 }, color: '#4f46e5' },
            ]}
          />
        ),
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Écrire les trois flèches AB, BC et CA (arrivée moins départ).</li>
              <li>Calculer les trois CARRÉS : deux carrés égaux ⟹ isocèle.</li>
              <li>Calculer les trois produits scalaires aux sommets : un produit nul ⟹ rectangle en ce sommet.</li>
              <li>Conclure en réunissant les deux réponses — un triangle peut être les deux à la fois.</li>
            </ol>
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-xs space-y-1">
              <div className="text-slate-500">A(−5 ; 0), B(1 ; −3), C(4 ; 3)</div>
              <div className="font-mono">AB² = 45, BC² = 45, CA² = 90 → isocèle</div>
              <div className="font-mono">BA · BC = (−6)×3 + 3×6 = 0 → rectangle en B</div>
              <div className="font-mono text-emerald-800">conclusion : <strong>rectangle isocèle en B</strong></div>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              Aucun triangle à sommets tous entiers n’est équilatéral : c’est une impossibilité,
              pas un manque de chance. Le plus proche laisse encore près de 1 % d’écart entre ses
              côtés.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-demontrer-perpendiculaire',
        type: 'methodes',
        title: 'Démontrer que deux droites d’une figure sont en travers',
        summary:
          'Fabriquer un vecteur directeur de chacune à partir de deux de ses points, calculer leur produit scalaire, et conclure sur la valeur 0.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Choisir DEUX points sur chaque droite, et fabriquer les deux flèches correspondantes.</li>
              <li>Calculer leur produit scalaire, sans arrondir.</li>
              <li>Le résultat vaut 0 : les droites sont orthogonales. Sinon : elles ne le sont pas.</li>
              <li>Pour une hauteur, vérifier EN PLUS que le pied appartient bien à la droite visée.</li>
            </ol>
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-xs space-y-1">
              <div className="text-slate-500">P(2 ; −4), Q(−5 ; −3), R(1 ; 3), H(−2 ; 0)</div>
              <div className="font-mono">PH(−4 ; 4) et QR(6 ; 6) : −24 + 24 = <strong>0</strong> ✔</div>
              <div className="font-mono">et H est sur (QR) : QH(3 ; 3) est colinéaire à QR(6 ; 6) ✔</div>
              <div className="font-mono text-emerald-800">(PH) est bien la hauteur issue de P</div>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le produit scalaire nul prouve seulement que les DIRECTIONS sont en travers. Sans la
              seconde vérification, on aurait démontré que (PH) est perpendiculaire à (QR) — pas
              qu’elle la coupe en H.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-le-calcul-tranche',
        type: 'memoriser',
        title: '⭐ Le calcul tranche, la figure suggère',
        summary: 'Une figure ne démontre jamais rien. Un produit scalaire nul, un déterminant nul, deux carrés égaux : voilà les preuves.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">0 exact ⟹ démontré</div>
            <p className="text-xs text-rose-700">88,99° a l’air de 90° et ne l’est pas</p>
          </div>
        ),
      },
    ],
  },
};
