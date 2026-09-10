import React from 'react';
import MathText from '../../../../common/components/MathText';
import { MiniGraph } from '../../../../common/knowledge';

/**
 * Connaissances de « Second degré : signe et problèmes » — SOURCE UNIQUE
 * (docs/architecture/KNOWLEDGE_MAP.md). Le texte d'une brique vit ICI et
 * nulle part ailleurs ; les modules la posent par son id, au moment où le
 * geste vient de lui donner du sens.
 *
 * ORDRE DE LA LIGNE DU TEMPS : module 1 (constater) → module 2 (la règle) →
 * module 3 (l'outil) → module 4 (la résolution) → modules 5 et 6 (modéliser,
 * puis interpréter). Aucune brique n'est posée avant le geste qui la motive.
 */
const I = '#4f46e5';   // la courbe
const R = '#e11d48';   // les racines
const V = '#059669';   // le positif
const A = '#d97706';   // le repère

const p = (a, b, c) => (x) => a * x * x + b * x + c;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'signe-change-aux-racines',
        type: 'concepts',
        title: 'Un trinôme ne change de signe qu’à ses racines',
        summary:
          'Entre deux racines consécutives, le trinôme garde le même signe du début à la fin. Il ne peut donc pas être positif ici, négatif là, puis positif encore, sans passer par zéro entre les deux.',
        visual: (
          <MiniGraph
            width={220} height={150} xMin={-4} xMax={4} yMin={-2} yMax={5}
            functions={[{ fn: p(-0.5, 0, 4.5), color: I }]}
            bands={[{ from: -3, to: 3, color: V, opacity: 0.16 }]}
            points={[{ x: -3, y: 0, color: R }, { x: 3, y: 0, color: R }]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              La courbe ne peut passer d’au-dessus de l’axe à en dessous qu’en le{' '}
              <strong>traversant</strong> — et traverser l’axe, c’est valoir zéro. Les seuls
              endroits où le signe peut basculer sont donc les racines, et il n’y en a jamais plus
              de deux.
            </p>
            <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
              Conséquence : l’ensemble des nombres où le trinôme est positif se compose d’au plus
              <strong> deux morceaux</strong>. Un patchwork de petits morceaux alternés est
              impossible.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la bande verte des positions qui passent, toujours d’un seul tenant.</div>
          </div>
        ),
      },
      {
        id: 'bande-entre-les-racines',
        type: 'concepts',
        title: 'La bande est entre les racines quand la courbe descend',
        summary:
          'Une courbe tournée vers le bas est au-dessus de l’axe ENTRE ses deux racines, et en dessous à l’extérieur. Tournée vers le haut, c’est exactement l’inverse.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              L’arche du pont est tournée vers le bas : elle est en l’air entre ses deux pieds, et
              sous terre au-delà. C’est pour cela que la bande des positions qui passent est un{' '}
              <strong>intervalle du milieu</strong>, et non deux morceaux qui s’en vont vers
              l’infini.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              L’inverse existe aussi : une courbe tournée vers le haut est <em>négative</em> entre
              ses racines. C’est l’orientation de la courbe qui décide, pas la position de l’axe.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux coins verts sous l’arche, rouges dès qu’ils en sortent.</div>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'signe-trinome-regle',
        type: 'regles',
        title: 'Le signe d’un trinôme : du signe de a, sauf entre les racines',
        summary:
          'Partout, ax² + bx + c est du signe de a — sauf sur l’intervalle strictement compris entre les deux racines, où il est du signe contraire. Quand il n’y a pas deux racines, il n’y a pas d’exception.',
        visual: (
          <MiniGraph
            width={220} height={150} xMin={-1} xMax={5} yMin={-3} yMax={5}
            functions={[{ fn: p(1, -5, 6), color: I }]}
            bands={[{ from: 2, to: 3, color: R, opacity: 0.16 }]}
            points={[{ x: 2, y: 0, color: R }, { x: 3, y: 0, color: R }]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-violet-100 bg-white p-3 text-center">
              <MathText>{'$$ax^2 + bx + c \\text{ est du signe de } a,\\ \\text{sauf entre les racines}$$'}</MathText>
            </div>
            <p>
              Deux nombres suffisent, et aucun autre : le <strong>signe de Δ</strong> dit s’il y a
              une exception, et le <strong>signe de a</strong> dit lequel des deux signes règne
              partout ailleurs.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              « Entre les racines » veut dire <em>strictement</em> entre : aux racines elles-mêmes,
              le trinôme vaut 0, ni positif ni négatif.
            </div>
          </div>
        ),
      },
      {
        id: 'signe-sans-racine',
        type: 'regles',
        title: 'Quand Δ ⩽ 0, le signe ne change jamais',
        summary:
          'Δ < 0 : le trinôme garde le signe de a sur tous les nombres, sans exception. Δ = 0 : il garde le signe de a partout et s’annule en un seul point, sans changer de signe.',
        visual: (
          <MiniGraph
            width={220} height={150} xMin={-3} xMax={3} yMin={-1} yMax={6}
            functions={[
              { fn: p(1, 1, 1), color: I },
              { fn: p(1, 0, 0), color: A, dashed: true },
            ]}
            points={[{ x: 0, y: 0, color: R }]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900"><strong>Δ &lt; 0</strong> — la courbe reste entièrement d’un côté de l’axe : le trinôme est du signe de a partout</div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900"><strong>Δ = 0</strong> — la courbe touche l’axe en un point et repart du même côté : du signe de a partout, et 0 en ce point</div>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Δ = 0 n’est pas un changement de signe : la courbe <em>rebondit</em> sur l’axe, elle
              ne le traverse pas. C’est la faute classique — croire qu’un zéro fait forcément
              basculer le signe.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-signe-trinome',
        type: 'memoriser',
        title: '⭐ Du signe de a, sauf entre les racines',
        summary: 'Deux nombres décident de tout : le signe de Δ (y a-t-il une exception ?) et le signe de a (quel signe règne ?).',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">du signe de a, sauf entre les racines</div>
            <p className="text-xs text-rose-700">Δ &gt; 0 → une exception au milieu · Δ ⩽ 0 → aucune exception</p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tableau-signes-trinome',
        type: 'concepts',
        title: 'Le tableau de signes d’un trinôme',
        summary:
          'Une ligne pour x, avec −∞, les racines et +∞ en tête de colonne ; une ligne pour le trinôme, avec un signe par intervalle et un 0 sous chaque racine.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="overflow-x-auto rounded-xl border-2 border-sky-100 bg-white">
              <table className="w-full text-center font-mono text-sm"><tbody>
                <tr className="bg-slate-50"><th className="px-2 py-1.5 text-left">x</th><td className="px-2">−∞</td><td /><td className="px-2">2</td><td /><td className="px-2">3</td><td /><td className="px-2">+∞</td></tr>
                <tr className="border-t"><th className="px-2 py-1.5 text-left">x² − 5x + 6</th><td /><td className="px-2 text-emerald-700 font-bold">+</td><td className="px-2 text-amber-700 font-bold">0</td><td className="px-2 text-rose-700 font-bold">−</td><td className="px-2 text-amber-700 font-bold">0</td><td className="px-2 text-emerald-700 font-bold">+</td><td /></tr>
              </tbody></table>
            </div>
            <p>
              Le tableau ne contient <strong>aucune valeur du trinôme</strong> : seulement des
              signes. C’est ce qui le rend court — et c’est aussi ce qui le rend suffisant pour
              répondre à une question de signe.
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la bande colorée pliée en une seule ligne.</div>
          </div>
        ),
      },
      {
        id: 'methode-dresser-tableau',
        type: 'methodes',
        title: 'Dresser le tableau de signes d’un trinôme',
        summary:
          'Calculer Δ, trouver les racines, les ranger dans l’ordre en tête de colonne, poser le signe de a aux deux extrémités, et inverser au milieu s’il y a deux racines.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Relever a, b et c, puis calculer <strong>Δ</strong>.</li>
              <li>Si Δ ⩾ 0, calculer les racines et les <strong>ranger dans l’ordre croissant</strong>.</li>
              <li>Écrire la ligne des x : −∞, les racines, +∞.</li>
              <li>Poser le <strong>signe de a</strong> dans la colonne de gauche et dans celle de droite.</li>
              <li>S’il y a deux racines, poser le signe <strong>contraire</strong> au milieu, et un 0 sous chaque racine.</li>
            </ol>
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              Ranger les racines dans l’ordre n’est pas une politesse : avec a négatif, la formule
              donne souvent la plus grande en premier, et un tableau construit dans le désordre
              affiche des signes justes aux mauvais endroits.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-tableau-signes',
        type: 'memoriser',
        title: '⭐ Trois colonnes, deux zéros',
        summary: 'Δ > 0 donne trois intervalles et deux zéros ; Δ = 0 en donne deux et un seul zéro ; Δ < 0 n’en donne qu’un, sans zéro.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-lg font-black text-rose-700">Δ &gt; 0 : + 0 − 0 +</div>
            <p className="text-xs text-rose-700">(pour a &gt; 0 ; avec a &lt; 0, les trois signes s’inversent)</p>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'inequation-second-degre',
        type: 'vocabulaire',
        title: 'Inéquation du second degré',
        summary:
          'Une inéquation du second degré s’écrit ax² + bx + c ⋈ 0, où ⋈ est l’un des quatre symboles <, >, ⩽, ⩾. Ses solutions sont un ensemble de nombres, décrit par des intervalles.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center">
              <MathText>{'$$ax^2 + bx + c > 0 \\qquad ax^2 + bx + c \\leqslant 0$$'}</MathText>
            </div>
            <p>
              Comme au premier degré, on commence par <strong>tout ramener d’un même côté</strong>{' '}
              pour obtenir « … ⋈ 0 ». La différence est ce qu’on fait ensuite : au premier degré on
              isole x, ici on lit un <strong>tableau de signes</strong>.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              On ne « divise pas par x » pour se ramener au premier degré : x peut valoir 0, et
              diviser par une quantité de signe inconnu retournerait l’inégalité sans prévenir.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-inequation-second-degre',
        type: 'methodes',
        title: 'Résoudre une inéquation du second degré',
        summary:
          'Tout ramener à « … ⋈ 0 », dresser le tableau de signes du trinôme, puis lire les intervalles où le signe convient — bornes comprises si l’inégalité est large.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Ramener tout d’un même côté : l’inéquation doit finir par <strong>⋈ 0</strong>.</li>
              <li>Dresser le <strong>tableau de signes</strong> du trinôme obtenu.</li>
              <li>Surligner les colonnes dont le signe convient.</li>
              <li>Écrire l’ensemble des solutions en intervalles, réunis par ∪ s’il y en a deux.</li>
              <li>Vérifier avec un nombre pris dans chaque morceau.</li>
            </ol>
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-xs">
              x² − 5x + 6 &gt; 0 : racines 2 et 3, a &gt; 0, donc S = ]−∞ ; 2[ ∪ ]3 ; +∞[.
              Vérification en x = 0 : 6 &gt; 0 ✔ ; en x = 2,5 : −0,25, donc 2,5 est bien exclu ✔
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le tableau lu de gauche à droite, colonne par colonne.</div>
          </div>
        ),
      },
      {
        id: 'bornes-incluses-inequation',
        type: 'regles',
        title: 'Les bornes : incluses avec ⩽ et ⩾, exclues avec &lt; et &gt;',
        summary:
          'Les racines annulent le trinôme. Une inégalité large (⩽, ⩾) accepte le zéro, donc les racines font partie des solutions ; une inégalité stricte les rejette.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">x² − 5x + 6 <strong>⩽</strong> 0 → S = <strong>[2 ; 3]</strong> — crochets fermés</div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">x² − 5x + 6 <strong>&lt;</strong> 0 → S = <strong>]2 ; 3[</strong> — crochets ouverts</div>
            </div>
            <p>
              Le même trinôme, le même tableau, le même intervalle — et deux réponses différentes.
              Seul le symbole a changé, et il ne change que les <strong>crochets</strong>.
            </p>
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              Deux réponses complètes sont possibles et souvent oubliées : <strong>S = ℝ</strong>{' '}
              quand tout convient (Δ &lt; 0 avec la bonne inégalité), et <strong>S = ∅</strong>{' '}
              quand rien ne convient.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le coin posé pile sur l’arche, qui frotte et ne passe pas.</div>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'modeliser-second-degre',
        type: 'methodes',
        title: 'Modéliser un problème par une équation ou une inéquation',
        summary:
          'Nommer l’inconnue avec son unité, exprimer la grandeur demandée en fonction d’elle, puis écrire « = » si la question dit « exactement », et « ⩾ » ou « ⩽ » si elle dit « au moins » ou « au plus ».',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li><strong>Nommer</strong> : « soit x la largeur, en mètres ».</li>
              <li><strong>Exprimer</strong> la grandeur en jeu à l’aide de x, et la développer.</li>
              <li><strong>Traduire la question</strong> : « vaut 48 » → une équation ; « vaut au moins 64 » → une inéquation avec ⩾.</li>
              <li><strong>Ramener à 0</strong>, puis résoudre avec les outils du second degré.</li>
            </ol>
            <div className="rounded-xl border border-rose-100 bg-white p-3 text-xs">
              Périmètre 28 m, aire 48 m² : la largeur x et la longueur 14 − x donnent
              x(14 − x) = 48, c’est-à-dire −x² + 14x − 48 = 0.
            </div>
          </div>
        ),
      },
      {
        id: 'traduire-au-moins-au-plus',
        type: 'regles',
        title: '« Au moins », « au plus », « ne dépasse pas »',
        summary:
          '« Au moins A » se traduit par ⩾ A, « au plus A » et « ne dépasse pas A » par ⩽ A. Ces trois formules acceptent la valeur A elle-même : les inégalités sont larges.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="overflow-x-auto rounded-xl border border-rose-100 bg-white">
              <table className="w-full text-left text-sm"><tbody>
                <tr className="bg-slate-50"><th className="px-3 py-1.5">la phrase</th><th className="px-3 py-1.5">le symbole</th></tr>
                <tr className="border-t"><td className="px-3 py-1.5">au moins 64 m²</td><td className="px-3 py-1.5 font-mono font-bold">⩾ 64</td></tr>
                <tr className="border-t"><td className="px-3 py-1.5">au plus 64 m² · ne dépasse pas 64 m²</td><td className="px-3 py-1.5 font-mono font-bold">⩽ 64</td></tr>
                <tr className="border-t"><td className="px-3 py-1.5">plus de 64 m² · strictement supérieure à 64</td><td className="px-3 py-1.5 font-mono font-bold">&gt; 64</td></tr>
                <tr className="border-t"><td className="px-3 py-1.5">exactement 64 m²</td><td className="px-3 py-1.5 font-mono font-bold">= 64</td></tr>
              </tbody></table>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              « Plus de 64 » et « au moins 64 » ne disent pas la même chose : le premier exclut 64,
              le second l’accepte. Sur un problème d’aire, cela change une borne de la réponse.
            </div>
          </div>
        ),
      },
    ],
    6: [
      {
        id: 'solution-equation-vs-probleme',
        type: 'concepts',
        title: 'Solution de l’équation, solution du problème',
        summary:
          'Une solution de l’équation est un nombre qui rend l’égalité vraie. Une solution du problème est en plus une valeur qui a un sens dans la situation : une longueur ne peut pas être négative.',
        visual: (
          <MiniGraph
            width={220} height={150} xMin={-10} xMax={8} yMin={-45} yMax={30}
            functions={[{ fn: p(1, 3, -40), color: I }]}
            bands={[{ from: 0, to: 8, color: V, opacity: 0.14 }]}
            points={[{ x: -8, y: 0, color: R }, { x: 5, y: 0, color: V }]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              x² + 3x − 40 = 0 a deux solutions, <strong>−8</strong> et <strong>5</strong>. Les deux
              annulent bien l’expression — mais si x désigne une longueur en mètres, seule 5 répond
              à la question posée.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              On n’écrit pas « −8 est faux » : −8 est une solution parfaitement correcte de
              l’équation. On écrit qu’elle est <strong>à écarter</strong>, parce qu’une longueur
              est positive.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la bande verte des valeurs qui ont un sens.</div>
          </div>
        ),
      },
      {
        id: 'methode-interpreter',
        type: 'methodes',
        title: 'Interpréter et rédiger la réponse',
        summary:
          'Écrire d’abord l’ensemble des valeurs qui ont un sens, y confronter les solutions trouvées, écarter les autres en le justifiant, puis répondre par une phrase avec l’unité.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Écrire les valeurs <strong>possibles dans la situation</strong> : une longueur est positive, une durée aussi, une largeur ne dépasse pas le demi-périmètre.</li>
              <li>Confronter chaque solution trouvée à cet ensemble.</li>
              <li><strong>Écarter</strong> celles qui n’ont pas de sens, en disant pourquoi.</li>
              <li>Répondre par une <strong>phrase</strong>, avec l’unité.</li>
              <li>Vérifier la réponse sur l’énoncé de départ, pas sur l’équation.</li>
            </ol>
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              Écarter n’est pas systématique : deux solutions peuvent toutes deux avoir un sens
              (un rectangle de 6 m sur 8 m est le même que celui de 8 m sur 6 m).
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la largeur de −8 m, rejetée avant même d’être écrite.</div>
          </div>
        ),
      },
      {
        id: 'mem-ecarter-solutions',
        type: 'memoriser',
        title: '⭐ Résoudre, puis choisir',
        summary: 'L’équation donne des nombres ; le problème n’en garde que ceux qui ont un sens, et se répond par une phrase.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-lg font-black text-rose-700">résoudre → confronter au contexte → rédiger</div>
            <p className="text-xs text-rose-700">une longueur, une durée, un effectif ne sont jamais négatifs</p>
          </div>
        ),
      },
    ],
  },
};
