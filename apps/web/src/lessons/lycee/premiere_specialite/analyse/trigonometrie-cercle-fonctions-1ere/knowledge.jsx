import React from 'react';
import MathText from '../../../../common/components/MathText';
import { MiniGraph } from '../../../../common/knowledge';

/**
 * Connaissances de « Fonctions trigonométriques : du cercle à la courbe » —
 * SOURCE UNIQUE (docs/architecture/KNOWLEDGE_MAP.md). Le texte d'une brique
 * vit ICI et nulle part ailleurs ; les modules la posent par son id, au moment
 * où le geste vient de lui donner du sens.
 *
 * CE QUI N'EST PAS ICI, ET POURQUOI. Le cercle trigonométrique, l'enroulement,
 * le radian et « cos = abscisse / sin = ordonnée » sont des briques de la
 * SECONDE (`trigonometrie-cercle-2nde`) : elles sont en `priorKnowledge` et le
 * module 0 les mesure. Les réétablir ici les ferait apparaître deux fois dans
 * la carte de l'élève, comme si la Première les découvrait.
 */
const I = '#4f46e5';   // le cosinus
const E = '#059669';   // le sinus
const A = '#d97706';   // les points remarqués

export const LESSON_KNOWLEDGE = {
  modules: {
    2: [
      {
        id: 'reel-au-dela-du-tour',
        type: 'concepts',
        title: 'Tout réel a sa place sur le cercle',
        summary:
          'Un réel plus grand que 2π ne « sort » pas du cercle : on continue simplement d’enrouler, et l’on repasse sur des points déjà visités. Un réel négatif s’enroule dans l’autre sens.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Enrouler 13π/6, c’est faire un tour complet (2π) <strong>puis</strong> encore π/6 :
              on arrive exactement au même point que pour π/6.
            </p>
            <div className="rounded-xl border border-violet-100 bg-white p-3 text-center">
              <MathText>{'$$\\dfrac{13\\pi}{6} = 2\\pi + \\dfrac{\\pi}{6} \\qquad \\text{même point que } \\dfrac{\\pi}{6}$$'}</MathText>
            </div>
            <p>
              Pour un réel négatif, on enroule dans le sens des aiguilles d’une montre :
              −π/6 arrive symétriquement, en dessous de l’axe horizontal.
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le point qui continue de tourner sans jamais quitter le cercle.</div>
          </div>
        ),
      },
      {
        id: 'fonction-sinus',
        type: 'vocabulaire',
        title: 'Les fonctions sinus et cosinus',
        summary:
          'À chaque réel x, l’enroulement associe UN point, donc UNE ordonnée et UNE abscisse. On obtient deux fonctions définies sur ℝ tout entier : x ↦ sin x et x ↦ cos x.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              C’est le changement de regard de la Première : en Seconde, sin t était l’ordonnée
              d’un point qu’on plaçait. Ici, <strong>sin</strong> est une fonction — un objet
              qu’on étudie pour lui-même, avec sa courbe et ses propriétés.
            </p>
            <div className="rounded-xl border border-violet-100 bg-white p-3 text-center">
              <MathText>{'$$\\sin : x \\mapsto \\sin x \\qquad \\cos : x \\mapsto \\cos x \\qquad (x \\in \\mathbb{R})$$'}</MathText>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Aucun réel n’est interdit : ces deux fonctions sont définies partout, contrairement
              à celles qui refusent une division par zéro.
            </div>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'periodicite',
        type: 'concepts',
        title: 'La périodicité : la courbe se répète',
        summary:
          'Ajouter un tour complet à x ne change ni le point, ni son ordonnée : sin(x + 2π) = sin x et cos(x + 2π) = cos x. La courbe reproduit indéfiniment le même motif de longueur 2π.',
        visual: (
          <MiniGraph
            width={220} height={130} xMin={-6.5} xMax={6.5} yMin={-1.4} yMax={1.4}
            functions={[{ fn: Math.sin, color: E }]}
            points={[{ x: 1, y: Math.sin(1), color: A }, { x: 1 + 2 * Math.PI, y: Math.sin(1), color: A }]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-sky-100 bg-white p-3 text-center">
              <MathText>{'$$\\sin(x + 2\\pi) = \\sin x \\qquad \\cos(x + 2\\pi) = \\cos x$$'}</MathText>
            </div>
            <p>
              C’est vrai pour <strong>tout</strong> réel x, et pour tout nombre entier de tours :
              sin(x + 4π) = sin x aussi. Le motif de longueur 2π est le plus court qui se répète.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Un DEMI-tour ne suffit pas : sin(π/2) = 1 alors que sin(π/2 + π) = −1. La longueur
              qui se répète est bien 2π, pas π.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la trace qui repasse exactement sur elle-même au deuxième tour.</div>
          </div>
        ),
      },
      {
        id: 'methode-ramener-dans-un-tour',
        type: 'methodes',
        title: 'Ramener un réel dans un tour',
        summary:
          'Pour calculer sin x quand x dépasse 2π, on retranche autant de tours que nécessaire pour arriver dans [0 ; 2π[ — la valeur ne change pas.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Compter combien de tours entiers tiennent dans x.</li>
              <li>Les retrancher : il reste un réel entre 0 et 2π.</li>
              <li>Lire la valeur pour ce réel — c’est la même.</li>
            </ol>
            <div className="rounded-xl border border-emerald-100 bg-white p-3">
              sin(13π/6) : on retranche un tour, 13π/6 − 12π/6 = <strong>π/6</strong>.
              Donc sin(13π/6) = sin(π/6) = <strong>0,5</strong>.
            </div>
          </div>
        ),
      },
      {
        id: 'parite-sinus-cosinus',
        type: 'regles',
        title: 'Parité : le cosinus est pair, le sinus est impair',
        summary:
          'Changer x en −x, c’est enrouler dans l’autre sens : l’abscisse ne bouge pas, l’ordonnée change de signe. D’où cos(−x) = cos x et sin(−x) = −sin x.',
        visual: (
          <MiniGraph
            width={220} height={130} xMin={-4} xMax={4} yMin={-1.4} yMax={1.4}
            functions={[{ fn: Math.sin, color: E }, { fn: Math.cos, color: I, dashed: true }]}
            points={[{ x: 1, y: Math.sin(1), color: A }, { x: -1, y: -Math.sin(1), color: A }]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-sky-100 bg-white p-3 text-center">
              <MathText>{'$$\\cos(-x) = \\cos x \\qquad \\sin(-x) = -\\sin x$$'}</MathText>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-indigo-900">
                <strong>cos est PAIRE</strong> — sa courbe se replie sur elle-même autour de l’axe vertical
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                <strong>sin est IMPAIRE</strong> — sa courbe se retourne autour de l’origine
              </div>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              « Impaire » ne veut pas dire « qui n’est pas paire au sens des nombres » : c’est le
              nom de la propriété f(−x) = −f(x). Le sinus la vérifie pour tout réel.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la trace miroir du sinus, et la trace superposée du cosinus.</div>
          </div>
        ),
      },
      {
        id: 'mem-pair-cos-impair-sin',
        type: 'memoriser',
        title: '⭐ cos(−x) = cos x, sin(−x) = −sin x',
        summary: 'Le cosinus ne voit pas le sens dans lequel on tourne ; le sinus, si.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">cos(−x) = cos x</div>
            <div className="text-xl font-black text-rose-700">sin(−x) = −sin x</div>
            <p className="text-xs text-rose-700">l’abscisse reste, l’ordonnée se retourne</p>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'variations-sin-cos',
        type: 'regles',
        title: 'Les variations sur un tour',
        summary:
          'Sur [0 ; 2π], le sinus monte de 0 à 1, descend de 1 à −1, puis remonte de −1 à 0 : trois morceaux. Le cosinus, lui, descend de 1 à −1 puis remonte : deux morceaux.',
        visual: (
          <MiniGraph
            width={220} height={130} xMin={-0.4} xMax={6.7} yMin={-1.4} yMax={1.4}
            functions={[{ fn: Math.sin, color: E }, { fn: Math.cos, color: I, dashed: true }]}
            points={[{ x: Math.PI / 2, y: 1, color: A }, { x: (3 * Math.PI) / 2, y: -1, color: A }]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="overflow-x-auto rounded-xl border border-emerald-100 bg-white">
              <table className="w-full text-center text-sm"><tbody>
                <tr className="bg-slate-50"><th className="px-2 py-1 text-left">x</th><td>0</td><td>π/2</td><td>π</td><td>3π/2</td><td>2π</td></tr>
                <tr className="border-t"><th className="px-2 py-1 text-left text-emerald-700">sin x</th><td>0</td><td>1</td><td>0</td><td>−1</td><td>0</td></tr>
                <tr className="border-t"><th className="px-2 py-1 text-left text-indigo-700">cos x</th><td>1</td><td>0</td><td>−1</td><td>0</td><td>1</td></tr>
              </tbody></table>
            </div>
            <p>
              Le sinus atteint son plus grand écart vers le haut en <strong>π/2</strong> (il y vaut
              1) et son plus grand écart vers le bas en <strong>3π/2</strong> (il y vaut −1). Le
              cosinus fait de même en 0 et en π.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Ni l’un ni l’autre ne dépasse jamais 1 ni ne descend sous −1 : le point ne quitte
              pas le cercle de rayon 1.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le sommet atteint au quart de tour, et le creux aux trois quarts.</div>
          </div>
        ),
      },
      {
        id: 'methode-lire-tableau-trigo',
        type: 'methodes',
        title: 'Décrire le sens de variation sur un morceau',
        summary:
          'Repérer les réels où la courbe change de sens (π/2 et 3π/2 pour le sinus), puis comparer les valeurs aux deux bouts de chaque morceau.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Situer les points hauts et les points bas : ce sont les changements de sens.</li>
              <li>Découper l’intervalle à ces réels-là.</li>
              <li>Sur chaque morceau, comparer la valeur d’arrivée à la valeur de départ.</li>
            </ol>
            <div className="rounded-xl border border-emerald-100 bg-white p-3">
              Sur [π/2 ; 3π/2] : le sinus part de 1 et arrive à −1. Il <strong>descend</strong>.
            </div>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'courbe-sinusoide',
        type: 'concepts',
        title: 'La courbe des fonctions sinus et cosinus',
        summary:
          'Tracée sur plusieurs tours, chacune des deux courbes est une vague régulière, comprise entre les droites d’équation y = −1 et y = 1, qui reproduit le même motif tous les 2π.',
        visual: (
          <MiniGraph
            width={220} height={130} xMin={-6.5} xMax={6.5} yMin={-1.5} yMax={1.5}
            functions={[{ fn: Math.sin, color: E }, { fn: Math.cos, color: I, dashed: true }]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Pour la tracer, il suffit de placer les points d’un seul tour — les cinq réels
              0, π/2, π, 3π/2 et 2π donnent déjà la forme — puis de <strong>recopier</strong> le
              motif à gauche et à droite.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Les deux courbes ont exactement la même forme : celle du cosinus est celle du sinus
              décalée de π/2 vers la gauche. Ce ne sont pas deux vagues différentes.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la vague qui reprend à l’identique après chaque 2π.</div>
          </div>
        ),
      },
      {
        id: 'mem-cinq-points-du-tour',
        type: 'memoriser',
        title: '⭐ Cinq points suffisent',
        summary: 'sin : 0 → 1 → 0 → −1 → 0. cos : 1 → 0 → −1 → 0 → 1. Aux réels 0, π/2, π, 3π/2, 2π.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-lg font-black text-rose-700">sin : 0 · 1 · 0 · −1 · 0</div>
            <div className="text-lg font-black text-rose-700">cos : 1 · 0 · −1 · 0 · 1</div>
            <p className="text-xs text-rose-700">aux réels 0, π/2, π, 3π/2, 2π — puis on recopie le motif</p>
          </div>
        ),
      },
    ],
    6: [
      {
        id: 'lire-ecart-et-motif',
        type: 'methodes',
        title: 'Lire une courbe qui se répète',
        summary:
          'Deux nombres la décrivent : l’écart maximal à l’axe horizontal (jusqu’où la vague monte) et la longueur du motif qui se répète (au bout de combien elle recommence).',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                <strong>L’écart maximal</strong> se lit à la VERTICALE : l’ordonnée du sommet.
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                <strong>La longueur du motif</strong> se lit à l’HORIZONTALE : d’un sommet au
                sommet suivant.
              </div>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le piège est de mesurer d’un sommet au CREUX suivant : cela ne donne que la MOITIÉ
              du motif. Il faut aller jusqu’au sommet suivant, ou du creux au creux suivant.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la hauteur qu’on lit debout, la longueur qu’on lit couché.</div>
          </div>
        ),
      },
      {
        id: 'regle-courbe-ne-dit-pas-tout',
        type: 'regles',
        title: 'Deux courbes différentes peuvent avoir le même motif',
        summary:
          'L’écart maximal et la longueur du motif sont deux renseignements INDÉPENDANTS : deux courbes peuvent se répéter au même rythme sans monter aussi haut, et inversement.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Une vague qui monte à 3 et une vague qui monte à 1 peuvent très bien recommencer
              toutes les deux au bout de 2π : les deux nombres se lisent séparément, l’un ne se
              déduit pas de l’autre.
            </p>
          </div>
        ),
      },
    ],
  },
};

export default LESSON_KNOWLEDGE;
