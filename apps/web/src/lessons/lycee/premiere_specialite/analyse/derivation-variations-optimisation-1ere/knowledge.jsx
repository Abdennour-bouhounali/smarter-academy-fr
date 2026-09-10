import React from 'react';
import MathText from '../../../../common/components/MathText';
import { MiniGraph } from '../../../../common/knowledge';

/**
 * Connaissances de « Variations et optimisation » — SOURCE UNIQUE
 * (docs/architecture/KNOWLEDGE_MAP.md). Le texte d'une brique vit ICI et
 * nulle part ailleurs ; les modules la posent par son id, au moment où le
 * geste vient de lui donner du sens.
 *
 * Les fonctions dessinées dans les vignettes sont les MÊMES que celles du
 * modèle (components/variationsUtils.js) : f(x) = x³ − 3x, g(x) = x³,
 * p(x) = x² − 4x + 1 et V(x) = x(12 − 2x)². Une vignette qui montrerait une
 * autre courbe que celle manipulée serait une deuxième source de vérité.
 */
const cube = (x) => x ** 3 - 3 * x;
const cubePrime = (x) => 3 * x * x - 3;
const cubeSimple = (x) => x ** 3;
const cubeSimplePrime = (x) => 3 * x * x;
const boite = (x) => x * (12 - 2 * x) ** 2;

const F = '#4f46e5';   // la courbe de f (panneau du haut)
const D = '#0284c7';   // la courbe de f′ (panneau du bas)
const P = '#d97706';   // un point remarquable
const VERT = '#05966933';
const ROSE = '#e11d4833';

export const LESSON_KNOWLEDGE = {
  modules: {
    2: [
      {
        id: 'signe-derivee-donne-sens',
        type: 'regles',
        title: 'Le signe de f′ donne le sens de variation de f',
        summary:
          'Sur un intervalle où f′(x) > 0, la fonction f est croissante ; sur un intervalle où f′(x) < 0, elle est décroissante. C’est la règle qui remplace la lecture de la courbe.',
        visual: (
          <MiniGraph
            width={220} height={150} xMin={-2} xMax={2} yMin={-3} yMax={3}
            functions={[{ fn: cube, color: F }, { fn: cubePrime, color: D, dashed: true }]}
            bands={[{ from: -2, to: -1, color: VERT }, { from: -1, to: 1, color: ROSE }, { from: 1, to: 2, color: VERT }]}
            points={[{ x: -1, y: 2, color: P, label: '↘ ici', labelPos: 't' }]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                <strong>f′(x) &gt; 0</strong> sur un intervalle — f y est croissante ↗
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">
                <strong>f′(x) &lt; 0</strong> sur un intervalle — f y est décroissante ↘
              </div>
            </div>
            <p>
              La raison tient en une phrase déjà connue : f′(x) est la <strong>pente</strong> de la
              tangente en x. Une pente positive fait monter la courbe, une pente négative la fait
              descendre. Le panneau du bas ne dit donc rien d’autre que le sens de marche du haut.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le signe de f′ n’est pas la position de f. Sur f(x) = x³ − 3x en x = 1,5, la courbe
              est <em>sous</em> l’axe (f = −1,125) et pourtant f′(1,5) = 3,75 &gt; 0 : elle monte.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la bande verte sous le panneau du bas, et la flèche qui monte au-dessus.</div>
          </div>
        ),
      },
      {
        id: 'mem-positive-monte',
        type: 'memoriser',
        title: '⭐ Dérivée positive : ça monte',
        summary: 'f′ > 0 ⟹ f croissante ; f′ < 0 ⟹ f décroissante.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">f′ &gt; 0 ↗ &nbsp;·&nbsp; f′ &lt; 0 ↘</div>
            <p className="text-xs text-rose-700">le signe du bas est le sens de marche du haut</p>
          </div>
        ),
      },
      {
        id: 'changement-de-signe-decide',
        type: 'concepts',
        title: 'Ce qui décide, c’est le CHANGEMENT de signe',
        summary:
          'f′(a) = 0 ne suffit pas. Pour que f se retourne en a, il faut que f′ change de signe de part et d’autre de a. Sinon la courbe s’aplatit un instant et repart dans le même sens.',
        visual: (
          <MiniGraph
            width={220} height={150} xMin={-1.5} xMax={1.5} yMin={-3.4} yMax={3.4}
            functions={[{ fn: cubeSimple, color: F }, { fn: cubeSimplePrime, color: D, dashed: true }]}
            points={[{ x: 0, y: 0, color: P, label: 'g′(0) = 0', labelPos: 'r' }]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Sur <strong>g(x) = x³</strong>, on a g′(x) = 3x², donc <strong>g′(0) = 0</strong>. Et
              pourtant g′(−0,5) = 0,75 &gt; 0 et g′(0,5) = 0,75 &gt; 0 : le signe est le même des
              deux côtés. La courbe s’aplatit en 0 puis <em>repart en montant</em>.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              « La dérivée s’annule donc il y a un sommet » est faux. La dérivée qui s’annule est
              une <em>condition</em>, pas une conclusion : il reste à regarder le signe avant et
              après.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : sur x³, la courbe du bas TOUCHE l’axe sans le traverser.</div>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'methode-construire-tableau-depuis-derivee',
        type: 'methodes',
        title: 'Construire un tableau de variations à partir de la dérivée',
        summary:
          'Quatre gestes, toujours dans cet ordre : calculer f′, résoudre f′(x) = 0, étudier le signe de f′, puis en déduire les flèches et calculer les valeurs aux bornes.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Calculer <strong>f′(x)</strong> avec les règles de calcul.</li>
              <li>Résoudre <strong>f′(x) = 0</strong> : les solutions découpent l’intervalle d’étude.</li>
              <li>Sur chaque morceau, déterminer le <strong>signe de f′</strong> — un point d’essai suffit, puisque f′ ne s’annule qu’aux solutions trouvées.</li>
              <li>Traduire chaque signe en flèche, puis calculer <strong>f</strong> à chaque borne et à chaque solution.</li>
            </ol>
            <div className="rounded-xl border border-sky-100 bg-white p-3">
              f(x) = x³ − 3x sur [−2 ; 2] : f′(x) = 3x² − 3 = 3(x − 1)(x + 1), qui s’annule en −1
              et 1. Signe : + sur [−2 ; −1], − sur [−1 ; 1], + sur [1 ; 2]. Donc ↗ ↘ ↗, avec
              f(−2) = −2, f(−1) = 2, f(1) = −2 et f(2) = 2.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la ligne du signe de f′ écrite AU-DESSUS de la ligne des flèches.</div>
          </div>
        ),
      },
      {
        id: 'regle-ligne-derivee-au-dessus',
        type: 'regles',
        title: 'Deux lignes, dans cet ordre',
        summary:
          'Un tableau construit à partir de la dérivée porte d’abord la ligne du signe de f′, puis la ligne des variations de f. La seconde se DÉDUIT de la première, jamais l’inverse.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="overflow-x-auto rounded-xl border border-sky-100 bg-white">
              <table className="w-full text-center text-sm"><tbody>
                <tr className="bg-slate-50"><th className="px-2 py-1 text-left font-semibold">x</th><td className="px-2">−2</td><td className="px-2">−1</td><td className="px-2">1</td><td className="px-2">2</td></tr>
                <tr className="border-t"><th className="px-2 py-1 text-left font-semibold">signe de f′</th><td className="px-2">+</td><td className="px-2">0 &nbsp;−</td><td className="px-2">0 &nbsp;+</td><td /></tr>
                <tr className="border-t"><th className="px-2 py-1 text-left font-semibold">f</th><td className="px-2 font-mono">−2 ↗</td><td className="px-2 font-mono">2 ↘</td><td className="px-2 font-mono">−2 ↗</td><td className="px-2 font-mono">2</td></tr>
              </tbody></table>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Les colonnes de la ligne du bas s’alignent sur les zéros de la ligne du haut : un
              retournement qui n’aurait pas de 0 au-dessus de lui viendrait de nulle part.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-extremum-par-le-signe',
        type: 'methodes',
        title: 'Reconnaître un extremum dans le tableau',
        summary:
          'Là où f′ passe de + à −, f atteint un maximum ; là où f′ passe de − à +, f atteint un minimum. Si le signe ne change pas, il n’y a pas d’extremum en ce point.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900"><strong>+ puis −</strong> — la courbe monte puis descend : maximum</div>
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900"><strong>− puis +</strong> — la courbe descend puis monte : minimum</div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800"><strong>même signe des deux côtés</strong> — aucun retournement, aucun extremum</div>
            </div>
            <p>
              La <strong>valeur</strong> de l’extremum est f(a), pas a. Sur q(x) = x³ − 6x² + 9x, le
              retournement a lieu <em>en</em> x = 1 et la valeur atteinte <em>vaut</em> q(1) = 4.
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le petit toit ⌢ au sommet de la flèche qui se retourne.</div>
          </div>
        ),
      },
      {
        id: 'mem-plus-moins-maximum',
        type: 'memoriser',
        title: '⭐ + puis − : un maximum',
        summary: 'f′ change de + à − : maximum. De − à + : minimum.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">+ − → maximum &nbsp;·&nbsp; − + → minimum</div>
            <p className="text-xs text-rose-700">et si le signe ne change pas, il ne se passe rien</p>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'regle-derivee-jamais-nulle',
        type: 'regles',
        title: 'Quand f′ ne s’annule jamais',
        summary:
          'Si f′ garde le même signe sur tout l’intervalle, le tableau ne comporte qu’une seule flèche : la fonction est croissante — ou décroissante — sur l’intervalle entier, sans aucun extremum à l’intérieur.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Sur <strong>r(x) = x³ + 3x</strong>, on a r′(x) = 3x² + 3. Comme 3x² ⩾ 0, la somme vaut
              au moins 3 : elle est <strong>strictement positive pour tout x</strong>. L’équation
              r′(x) = 0 n’a donc <em>aucune</em> solution, et le tableau tient sur une flèche.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Un tableau de variations ne comporte pas forcément un retournement. Chercher à tout
              prix un zéro là où il n’y en a pas conduit à en inventer un.
            </div>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'methode-optimiser-avec-la-derivee',
        type: 'methodes',
        title: 'Résoudre un problème d’optimisation',
        summary:
          'Choisir la variable et son intervalle, écrire la grandeur à optimiser en fonction de cette variable, dériver, étudier le signe de la dérivée, puis conclure — en n’oubliant pas de répondre à la question posée.',
        visual: (
          <MiniGraph
            width={220} height={150} xMin={0} xMax={6} yMin={0} yMax={140}
            functions={[{ fn: boite, color: F }]}
            points={[{ x: 2, y: 128, color: P, label: '128', labelPos: 't' }]}
            guides={[{ x: 2, color: '#94a3b8' }]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Nommer la <strong>variable</strong> et dire sur quel intervalle elle a un sens physique.</li>
              <li>Écrire la grandeur à optimiser comme une <strong>fonction</strong> de cette variable.</li>
              <li><strong>Dériver</strong>, résoudre « dérivée = 0 », étudier le signe.</li>
              <li>Conclure : donner la valeur de la variable ET la valeur optimale, avec son unité.</li>
            </ol>
            <div className="rounded-xl border border-rose-100 bg-white p-3">
              La boîte : on découpe un carré de côté x aux coins d’un carton de 12 cm, donc
              V(x) = x(12 − 2x)² sur ]0 ; 6[. V′(x) = 12(x − 2)(x − 6) est positive avant 2,
              négative après : maximum en x = 2, et <strong>V(2) = 128 cm³</strong>.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le sommet de la courbe du volume, au-dessus de x = 2.</div>
          </div>
        ),
      },
      {
        id: 'regle-annuler-ne-suffit-pas-optimisation',
        type: 'regles',
        title: 'Annuler la dérivée ne désigne pas le meilleur choix',
        summary:
          'Une dérivée peut s’annuler en plusieurs points, dont certains sont des minimums. Et le meilleur choix peut se trouver à une BORNE de l’intervalle, où la dérivée ne s’annule pas.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Sur B(x) = −2x³ + 30x² − 96x, la dérivée B′(x) = −6(x − 2)(x − 8) s’annule
              <strong> deux fois</strong>. En x = 2, B vaut −88 : c’est le <em>pire</em> point.
              Le meilleur est en x = 8, où B vaut 128.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Résoudre « dérivée = 0 » donne des <em>candidats</em>. Le tableau de signes désigne
              lequel est un maximum — et il faut comparer avec les valeurs aux bornes.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux zéros de B′, dont l’un est un creux.</div>
          </div>
        ),
      },
      {
        id: 'mem-lire-la-reponse-dans-le-tableau',
        type: 'memoriser',
        title: '⭐ Modéliser, dériver, conclure',
        summary: 'La réponse d’un problème d’optimisation se lit dans le tableau de variations, pas dans l’équation « dérivée = 0 ».',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">mettre en fonction → dériver → signe → conclure</div>
            <p className="text-xs text-rose-700">et répondre avec l’unité de la question</p>
          </div>
        ),
      },
    ],
  },
};
