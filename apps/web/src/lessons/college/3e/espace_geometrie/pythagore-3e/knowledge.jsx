import React from 'react';
import MathText from '../../../../common/components/MathText';
import { RightTriangle } from '../../../../common/knowledge';

/**
 * Connaissances de la leçon « Théorème de Pythagore » (3e) — SOURCE UNIQUE de
 * vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> au moment
 * où l'élève vient de le rencontrer par le geste, puis il reste sur sa carte.
 *
 * ORDRE. L'hypoténuse (M1) avant l'égalité des aires (M2), l'égalité avant sa
 * réciproque (M3), et l'écriture algébrique (M4) seulement une fois l'égalité
 * établie sur les aires — le carré d'une longueur est d'abord une AIRE.
 */

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Le côté qui ne touche pas l'angle droit. */
    1: [
      {
        id: 'hypotenuse',
        type: 'vocabulaire',
        title: 'Hypoténuse',
        summary: 'L’hypoténuse est le côté opposé à l’angle droit — celui qui ne touche pas le sommet marqué. C’est aussi le plus long.',
        visual: <RightTriangle a={4} b={3} hyp={5} width={190} height={140} color="#7c3aed" />,
        body: (
          <div className="space-y-2">
            <p>Dans un triangle rectangle, l’<strong>hypoténuse</strong> est le côté
            <strong> face à l’angle droit</strong> : le seul qui ne touche pas le sommet où se
            trouve cet angle.</p>
            <p className="text-xs text-slate-500">C’est toujours le plus long des trois côtés —
            un moyen simple de vérifier qu’on ne s’est pas trompé de côté.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : tu as fait tourner le
            triangle, et l’hypoténuse est restée la même.</div>
          </div>
        ),
      },
    ],

    /* M2 — L'égalité des aires, constatée avant d'être écrite. */
    2: [
      {
        id: 'egalite-des-aires',
        type: 'regles',
        title: 'L’égalité des trois carrés',
        summary: 'Dans un triangle rectangle, l’aire du carré construit sur l’hypoténuse égale la somme des aires des deux autres carrés.',
        body: (
          <div className="space-y-3">
            <p>Construis un carré sur chacun des trois côtés. Le grand carré, celui de
            l’hypoténuse, a exactement l’<strong>aire des deux autres réunis</strong>.</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm">
              aire du grand carré = aire du 1<sup>er</sup> + aire du 2<sup>e</sup>
            </div>
            <p className="text-xs text-slate-500">Ce n’est pas une formule à croire : c’est une
            découpe qu’on peut vérifier, carreau par carreau.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les trois carrés, et les
            deux petits qui remplissent exactement le grand.</div>
          </div>
        ),
      },
    ],

    /* M3 — L'équivalence : les deux sens vont ensemble. */
    3: [
      {
        id: 'equivalence-angle-droit',
        type: 'regles',
        title: 'Une équivalence, pas une simple implication',
        summary: 'L’égalité des aires et l’angle droit vont toujours ensemble : l’un entraîne l’autre, dans les deux sens.',
        body: (
          <div className="space-y-2">
            <p>Si l’angle est droit, l’égalité est vraie. Et réciproquement : si l’égalité est
            vraie, l’angle <strong>est</strong> droit.</p>
            <p className="text-xs text-slate-500">Dès que l’angle s’écarte du droit, l’égalité se
            casse — et elle se casse dans un sens qui indique de quel côté on a basculé.</p>
            <p className="text-xs text-slate-500">C’est ce double sens qui permettra de
            <strong> démontrer</strong> qu’un triangle est rectangle à partir de ses seules
            longueurs.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : tu as ouvert et fermé
            l’angle, et regardé l’égalité se rompre.</div>
          </div>
        ),
      },
    ],

    /* M4 — L'écriture algébrique de ce qui a été constaté. */
    4: [
      {
        id: 'theoreme-pythagore',
        type: 'formules',
        title: 'Le théorème de Pythagore',
        summary: 'Si ABC est rectangle en A, alors BC² = AB² + AC² : le carré de l’hypoténuse égale la somme des carrés des deux autres côtés.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$BC^{2} = AB^{2} + AC^{2}$'}</MathText>
            </div>
            <p>C’est l’égalité des aires, écrite avec des lettres : le carré d’une longueur
            <strong> est</strong> l’aire du carré construit dessus.</p>
            <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-3 text-xs text-indigo-900">
              L’hypoténuse est <strong>seule</strong> de son côté de l’égalité. La repérer avant
              d’écrire évite l’erreur la plus fréquente.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-ecrire-puis-calculer',
        type: 'methodes',
        title: 'Écrire, puis calculer',
        summary: 'On nomme l’angle droit, on repère l’hypoténuse, on écrit l’égalité, et seulement ensuite on remplace par les nombres.',
        body: (
          <div className="space-y-2">
            <ol className="list-decimal list-inside space-y-1">
              <li>Où est l’angle droit ?</li>
              <li>Quelle est donc l’hypoténuse ?</li>
              <li>Écrire l’égalité avec les lettres.</li>
              <li>Remplacer par les longueurs, puis calculer.</li>
            </ol>
            <p className="text-xs text-slate-500">Écrire avant de calculer : c’est là que se joue
            la justesse, pas dans la calculatrice.</p>
          </div>
        ),
      },
    ],

    /* M5 — Le côté manquant : soustraire, et se relire. */
    5: [
      {
        id: 'calculer-un-cote-de-langle-droit',
        type: 'methodes',
        title: 'Trouver un côté de l’angle droit',
        summary: 'Quand le côté cherché n’est pas l’hypoténuse, on soustrait : AB² = BC² − AC².',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$AB^{2} = BC^{2} - AC^{2}$'}</MathText>
              <div className="text-xs text-slate-500 mt-1">où BC est l’hypoténuse</div>
            </div>
            <p className="text-xs text-slate-500">L’égalité est la même ; c’est l’inconnue qui a
            changé de place.</p>
          </div>
        ),
      },
      {
        id: 'mem-controle-hypotenuse',
        type: 'memoriser',
        title: '⭐ Un côté de l’angle droit est plus court que l’hypoténuse',
        summary: 'Si le résultat dépasse l’hypoténuse, c’est qu’on a additionné au lieu de soustraire.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-2 text-center">
            <div className="text-base font-black text-rose-700">résultat &lt; hypoténuse, toujours</div>
            <p className="text-xs text-rose-700">Ce coup d’œil prend une seconde et rattrape
            l’erreur la plus fréquente du chapitre.</p>
          </div>
        ),
      },
    ],

    /* M6 — Choisir entre le direct et la réciproque, et rédiger. */
    6: [
      {
        id: 'reciproque-pythagore',
        type: 'methodes',
        title: 'La réciproque, pas à pas',
        summary: 'Repérer le plus grand côté, calculer son carré, calculer la somme des carrés des deux autres, comparer, conclure.',
        body: (
          <div className="space-y-3">
            <ol className="list-decimal list-inside space-y-1">
              <li>Repérer le <strong>plus grand</strong> côté.</li>
              <li>Calculer son carré.</li>
              <li>Calculer la somme des carrés des deux autres.</li>
              <li>Comparer les deux nombres.</li>
              <li>Conclure — en citant la réciproque.</li>
            </ol>
            <p className="text-xs text-slate-500">Égalité ⇒ le triangle est rectangle. Sinon, il
            ne l’est pas : la comparaison tranche dans les deux cas.</p>
          </div>
        ),
      },
      {
        id: 'choisir-direct-ou-reciproque',
        type: 'methodes',
        title: 'Direct ou réciproque ?',
        summary: 'L’angle droit est-il une donnée, ou la question ? La réponse décide de l’énoncé.',
        body: (
          <div className="grid gap-2 text-sm">
            <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
              Angle droit <strong>donné</strong> → le théorème : on calcule une longueur.
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
              Angle droit <strong>demandé</strong> → la réciproque : on compare deux nombres.
            </div>
          </div>
        ),
      },
    ],

    /* M7 — Dans le réel : échelles et diagonales. */
    7: [
      {
        id: 'pythagore-dans-le-reel',
        type: 'concepts',
        title: 'Échelles, diagonales, équerres',
        summary: 'Une échelle contre un mur, la diagonale d’un rectangle, l’équerre d’un maçon : le même triangle rectangle, les deux sens du théorème.',
        body: (
          <div className="space-y-2">
            <p>Le théorème direct calcule une longueur quand l’angle droit est donné par la
            situation — un mur est vertical, un sol horizontal.</p>
            <p>La réciproque garantit un angle droit quand ce sont les longueurs qu’on impose :
            c’est ainsi qu’on trace un angle droit sur un chantier, avec une corde à nœuds.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : l’échelle et la
            diagonale — deux questions, deux sens du même théorème.</div>
          </div>
        ),
      },
    ],
  },
};
