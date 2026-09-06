import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de la leçon « Multiples et diviseurs » (3e) — SOURCE UNIQUE de
 * vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> au moment
 * où l'élève vient de le rencontrer par le geste, puis il reste sur sa carte.
 *
 * ORDRE. Le diviseur (M1) avant sa relation avec le multiple (M2), les paires
 * (M4) avant le nombre premier — c'est le rectangle réduit au bâton qui le
 * définit —, et les premiers avant la décomposition (M6) dont ils sont les
 * briques.
 */

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Diviser sans reste. */
    1: [
      {
        id: 'diviseur',
        type: 'vocabulaire',
        title: 'Diviseur',
        summary: 'b est un diviseur de a lorsque la division de a par b tombe juste : le reste est nul.',
        body: (
          <div className="space-y-3">
            <p>Ranger 36 chaises en 6 rangées de 6 : rien ne reste. Ranger 36 chaises en rangées de
            5 : il en reste 1. On dit que <strong>6 est un diviseur de 36</strong>, et que 5 n’en
            est pas un.</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm">
              reste 0 → diviseur · reste ≠ 0 → pas un diviseur
            </div>
            <p className="text-xs text-slate-500">Toute division « se fait » avec une calculatrice ;
            ce qui compte ici, c’est qu’elle tombe <strong>juste</strong>.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le bac « reste » de la
            fête, vide ou non.</div>
          </div>
        ),
      },
    ],

    /* M2 — Deux mots pour une même relation. */
    2: [
      {
        id: 'multiple-et-diviseur',
        type: 'concepts',
        title: 'Multiple et diviseur : deux lectures',
        summary: 'Si b divise a, alors a est un multiple de b : c’est la même relation, vue de chaque côté.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm">
              36 = 4 × 9
            </div>
            <p>La même égalité se lit dans les deux sens : <strong>4 est un diviseur de 36</strong>,
            et <strong>36 est un multiple de 4</strong>.</p>
            <p className="text-xs text-slate-500">La liste des multiples d’un nombre est
            <strong> infinie</strong> — on peut toujours ajouter le nombre une fois de plus. Celle
            de ses diviseurs est <strong>finie</strong>, et ils vont par paires.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : une liste qui ne s’arrête
            jamais, une autre qui tient en quelques cases.</div>
          </div>
        ),
      },
    ],

    /* M3 — Les critères de divisibilité. */
    3: [
      {
        id: 'criteres-divisibilite',
        type: 'regles',
        title: 'Les critères de divisibilité',
        summary: 'Le chiffre des unités décide pour 2, 5 et 10 ; la somme des chiffres décide pour 3 et 9.',
        body: (
          <div className="space-y-3">
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
                <strong>2</strong> — le nombre finit par 0, 2, 4, 6 ou 8
              </div>
              <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-violet-900">
                <strong>5</strong> — il finit par 0 ou 5 · <strong>10</strong> — il finit par 0
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                <strong>3</strong> — la somme de ses chiffres est un multiple de 3
                · <strong>9</strong> — idem avec 9
              </div>
            </div>
            <p className="text-xs text-slate-500">Un critère n’est pas une astuce : c’est une façon
            de voir la divisibilité <strong>sans poser la division</strong>.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les colonnes et les
            diagonales qui se coloraient d’un coup sur la grille.</div>
          </div>
        ),
      },
    ],

    /* M4 — Les paires de diviseurs, et le nombre premier. */
    4: [
      {
        id: 'diviseurs-par-paires',
        type: 'methodes',
        title: 'Lister les diviseurs par paires',
        summary: 'Chaque diviseur va avec son complice : on essaie 1, 2, 3… et on s’arrête dès que le produit se croise.',
        body: (
          <div className="space-y-3">
            <p>Un rectangle de 36 cases donne deux diviseurs à la fois : 4 × 9 en fournit
            <strong> deux</strong>, 4 et 9.</p>
            <p className="text-xs text-slate-500">Inutile de chercher au-delà : quand les deux
            facteurs se croisent, toutes les paires ont été trouvées. C’est ce qui garantit de n’en
            oublier aucun.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les rectangles qui se
            couchaient de plus en plus, jusqu’au carré.</div>
          </div>
        ),
      },
      {
        id: 'nombre-premier',
        type: 'vocabulaire',
        title: 'Nombre premier',
        summary: 'Un nombre premier a exactement deux diviseurs : 1 et lui-même. Son seul rectangle est le bâton.',
        body: (
          <div className="space-y-3">
            <p>Quand le seul rectangle possible est <strong>1 × n</strong> — le bâton — le nombre
            n’a que deux diviseurs. On l’appelle un <strong>nombre premier</strong>.</p>
            <p>13 et 23 sont premiers ; 21 = 3 × 7 ne l’est pas.</p>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
              <strong>1 n’est pas premier</strong> : son seul rectangle est 1 × 1, il n’a donc
              qu’<strong>un</strong> diviseur, pas deux.
            </div>
          </div>
        ),
      },
    ],

    /* M5 — Reconnaître un premier, et savoir s'arrêter. */
    5: [
      {
        id: 'tester-un-premier',
        type: 'methodes',
        title: 'Tester si un nombre est premier',
        summary: 'On essaie les diviseurs premiers successifs, et on peut s’arrêter dès que leur carré dépasse le nombre.',
        body: (
          <div className="space-y-3">
            <p>Pour 47 : est-il divisible par 2 ? par 3 ? par 5 ? par 7 ? Comme
            <MathText>{' $7^{2} = 49 > 47$'}</MathText>, inutile d’aller plus loin.</p>
            <p className="text-xs text-slate-500">Pourquoi ? Parce que les diviseurs vont par
            paires : si un diviseur dépassait la racine, son complice serait plus petit — et on
            l’aurait déjà trouvé.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le crible, où rayer les
            multiples de 2, 3, 5 et 7 suffisait jusqu’à 50.</div>
          </div>
        ),
      },
    ],

    /* M6 — La décomposition, carte d'identité d'un nombre. */
    6: [
      {
        id: 'decomposition-facteurs-premiers',
        type: 'concepts',
        title: 'La décomposition en facteurs premiers',
        summary: 'Tout nombre entier s’écrit comme un produit de nombres premiers, et d’une seule façon.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$60 = 2^{2} \\times 3 \\times 5$'}</MathText>
            </div>
            <p>Quel que soit le chemin suivi dans l’arbre, on aboutit toujours aux
            <strong> mêmes</strong> facteurs premiers. C’est la carte d’identité du nombre.</p>
            <p className="text-xs text-slate-500">Les exposants comptent combien de fois chaque
            facteur revient.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : deux arbres différents,
            les mêmes feuilles en bas.</div>
          </div>
        ),
      },
    ],

    /* M7 — Trois usages d'un même outil. */
    7: [
      {
        id: 'facteurs-communs',
        type: 'methodes',
        title: 'Facteurs communs : simplifier au maximum',
        summary: 'Les facteurs présents dans les deux décompositions donnent le plus grand diviseur commun — la fraction irréductible, le plus grand carreau.',
        body: (
          <div className="space-y-2">
            <p>En ne gardant que les facteurs <strong>communs</strong> aux deux décompositions, on
            obtient le plus grand nombre qui divise les deux.</p>
            <p className="text-xs text-slate-500">Une fraction est <strong>irréductible</strong>
            quand numérateur et dénominateur n’ont plus aucun facteur commun.</p>
          </div>
        ),
      },
      {
        id: 'facteurs-reunis',
        type: 'methodes',
        title: 'Facteurs réunis : se retrouver au plus tôt',
        summary: 'Les facteurs de l’un et de l’autre, réunis, donnent le plus petit multiple commun — le prochain rendez-vous des deux bus.',
        body: (
          <div className="space-y-2">
            <p>En <strong>réunissant</strong> les facteurs des deux nombres, on obtient le plus
            petit nombre que tous deux divisent.</p>
            <p className="text-xs text-slate-500">Deux bus qui passent toutes les 12 et 18 minutes
            se retrouvent toutes les 36 minutes.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : un seul outil, trois
            usages — la fraction, le carrelage et les bus.</div>
          </div>
        ),
      },
    ],
  },
};
