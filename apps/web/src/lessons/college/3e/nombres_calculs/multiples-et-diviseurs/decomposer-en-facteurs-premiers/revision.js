/**
 * « La page de révision » of the lesson (docs/architecture/REVISION_PAGE.md §2): plain data, drawn by features/revision.
 * The rules are those of the knowledge sheets (world/knowledge.js) and of the board memo, in their words; the numbers are
 * the page's own — nothing is copied from the exercise bank. Every equality between numbers is computed by
 * features/revision/revision.test.js (a number written with a thin space, 4{\\,}199, is not read: those were checked by
 * a script). Reached only through the lesson's pack (`lesson.pack.js › revision`).
 */
export const REVISION = {
  intro:
    'Cette page reprend toute la leçon. Lis-la étape par étape, et fais chaque exercice sur ta feuille avant d’ouvrir le corrigé.',
  steps: [
    {
      id: 'recall',
      short: 'Rappel',
      title: 'Rappel : les nombres premiers',
      blocks: [
        {
          kind: 'rule',
          tag: 'Nombre premier',
          body: [
            { p: 'Un nombre premier a exactement deux diviseurs : 1 et lui-même. Le nombre 1 n’est pas premier.' },
            { formula: '$2,\\ 3,\\ 5,\\ 7,\\ 11,\\ 13,\\ 17,\\ 19,\\ 23,\\ 29\\ \\ldots$' },
            {
              p: 'Pour aller vite : un nombre est divisible par 2 si son chiffre des unités est pair, par 3 si la somme de ses chiffres est divisible par 3, par 5 s’il se termine par 0 ou 5.',
            },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple',
          body: [{ p: '13 est premier : ses seuls diviseurs sont 1 et 13. 15 ne l’est pas : $15 = 3 \\times 5$.' }],
        },
        {
          kind: 'task',
          title: 'Vérifie',
          level: null,
          body: [{ p: 'Parmi les nombres 1, 2, 9, 17 et 21, lesquels sont premiers ?' }],
          solution: [
            'Seuls 2 et 17 sont premiers. 1 n’a qu’un diviseur ; $9 = 3 \\times 3$ et $21 = 3 \\times 7$ en ont plus de deux.',
          ],
        },
      ],
    },
    {
      id: 'lesson',
      short: 'La leçon',
      title: 'La leçon',
      blocks: [
        {
          kind: 'rule',
          tag: 'Décomposer en facteurs premiers',
          body: [
            {
              p: 'Décomposer un nombre, c’est l’écrire comme un produit de nombres premiers. On divise par le plus petit nombre premier qui le divise, autant de fois que possible, puis par le suivant (2, 3, 5, 7…), jusqu’au quotient 1.',
            },
            { formula: '$n \\div 2,\\ \\div 2,\\ \\ldots,\\ \\div 3,\\ \\ldots\\ \\to\\ \\textcolor{#e11d48}{1}$' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple : 84',
          body: [
            { formula: '$84 \\div 2 = 42,\\quad 42 \\div 2 = 21,\\quad 21 \\div 3 = 7,\\quad 7 \\div 7 = 1$' },
            {
              p: 'Donc $84 = 2 \\times 2 \\times 3 \\times 7$. Chaque facteur est premier : la décomposition est finie.',
            },
          ],
        },
        {
          kind: 'rule',
          tag: 'Écrire avec des puissances',
          body: [
            {
              p: 'Un facteur qui revient plusieurs fois s’écrit une seule fois, avec en exposant le nombre de fois. On range les facteurs du plus petit au plus grand.',
            },
            { formula: '$2 \\times 2 \\times 2 = 2^{\\textcolor{#e11d48}{3}}$' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple',
          body: [{ p: '$84 = 2^2 \\times 3 \\times 7$ et $600 = 2^3 \\times 3 \\times 5^2$.' }],
        },
        {
          kind: 'rule',
          tag: 'Savoir où s’arrêter',
          body: [
            {
              p: 'Pour savoir si $n$ est premier, on essaie les nombres premiers 2, 3, 5, 7… tant que leur carré ne dépasse pas $n$. Si aucun ne divise $n$, alors $n$ est premier.',
            },
            { formula: '$p \\times p > n\\ \\Rightarrow\\ \\textcolor{#e11d48}{\\text{on s’arrête}}$' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple : 113',
          body: [
            {
              p: '2, 3, 5 et 7 ne divisent pas 113, et $11 \\times 11 = 121 > 113$ : inutile d’aller plus loin, 113 est premier.',
            },
          ],
        },
        {
          kind: 'rule',
          tag: 'Lire une décomposition',
          body: [
            {
              p: 'Un nombre $d$ divise $N$ quand chaque facteur premier de $d$ est dans $N$, avec un exposant au moins aussi grand. Le quotient est fait de ce qui reste.',
            },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple : $600 = 2^3 \\times 3 \\times 5^2$',
          body: [
            {
              p: '$12 = 2^2 \\times 3$ divise 600, et le quotient est ce qui reste : $2 \\times 5^2 = 50$. Mais $9 = 3^2$ ne divise pas 600 : 600 n’a qu’un seul facteur 3.',
            },
          ],
        },
        {
          kind: 'rule',
          tag: 'Un outil pour les grands nombres',
          body: [
            {
              p: 'Un tableur (ou un programme) calcule les restes des divisions de $n$ par 2, 3, 5, 7… On lit la première ligne où le reste est 0, on divise, et on recommence sur le quotient.',
            },
            { formula: '$\\texttt{=MOD(n;p)} = \\textcolor{#e11d48}{0}\\ \\Rightarrow\\ p \\text{ divise } n$' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple : $4{\\,}199$',
          body: [
            {
              p: 'Le premier reste nul est en face de 13 : $4{\\,}199 = 13 \\times 323$. Sur 323, le premier reste nul est en face de 17 : $323 = 17 \\times 19$. Donc $4{\\,}199 = 13 \\times 17 \\times 19$.',
            },
          ],
        },
      ],
    },
    {
      id: 'examples',
      short: 'Exemples',
      title: 'Exemples corrigés',
      blocks: [
        {
          kind: 'example',
          tag: 'Exemple 1 : décomposer 252',
          body: [
            {
              steps: [
                '252 est pair : $252 \\div 2 = 126$, puis $126 \\div 2 = 63$.',
                '63 est impair, mais $6 + 3 = 9$ : $63 \\div 3 = 21$, puis $21 \\div 3 = 7$.',
                '7 est premier : $7 \\div 7 = 1$.',
              ],
            },
            { concl: 'Donc $252 = 2 \\times 2 \\times 3 \\times 3 \\times 7 = 2^2 \\times 3^2 \\times 7$.' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple 2 : 221 est-il premier ?',
          body: [
            {
              steps: [
                '221 est impair, $2 + 2 + 1 = 5$ et il ne finit ni par 0 ni par 5 : ni 2, ni 3, ni 5.',
                '$221 = 7 \\times 31 + 4$ et $221 = 11 \\times 20 + 1$ : ni 7, ni 11.',
                '$13 \\times 13 = 169$ ne dépasse pas 221 : on essaie 13. $221 = 13 \\times 17$.',
              ],
            },
            { concl: '221 n’est pas premier : $221 = 13 \\times 17$.' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple 3 : un grand nombre, $3{\\,}053$',
          body: [
            {
              steps: [
                'Le tableur affiche les restes de $3{\\,}053$ par 2, 3, 5, 7… : le premier 0 est en face de 43.',
                '$3{\\,}053 \\div 43 = 71$.',
                '71 est premier : 2, 3, 5 et 7 ne le divisent pas, et $11 \\times 11 = 121 > 71$.',
              ],
            },
            { concl: 'Donc $3{\\,}053 = 43 \\times 71$.' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple 4 : des piles de livres',
          body: [
            {
              p: 'La médiathèque veut ranger 210 livres en piles égales, sans livre en trop. Des piles de 12 livres conviennent-elles ? Et des piles de 14 ?',
            },
            {
              steps: [
                '$210 = 2 \\times 3 \\times 5 \\times 7$.',
                '$12 = 2^2 \\times 3$ demande le facteur 2 deux fois : 210 ne l’a qu’une fois. En effet, $210 = 12 \\times 17 + 6$.',
                '$14 = 2 \\times 7$ est dans la décomposition : il reste $3 \\times 5 = 15$.',
              ],
            },
            { concl: 'Les piles de 14 conviennent : 15 piles. Les piles de 12 laissent 6 livres.' },
          ],
        },
      ],
    },
    {
      id: 'traps',
      short: 'Pièges',
      title: 'Les pièges',
      blocks: [
        {
          kind: 'trap',
          tag: 'Piège 1 : un produit, mais pas fini',
          body: [
            {
              p: '$90 = 9 \\times 10$ est vrai, mais ce n’est pas une décomposition en facteurs premiers : 9 et 10 se cassent encore. La décomposition est $90 = 2 \\times 3^2 \\times 5$.',
            },
          ],
        },
        {
          kind: 'trap',
          tag: 'Piège 2 : lire l’exposant comme un facteur',
          body: [
            {
              p: '$3^4 \\neq 3 \\times 4$. L’exposant compte les fois : $3^4 = 3 \\times 3 \\times 3 \\times 3 = 81$, et non 12.',
            },
          ],
        },
        {
          kind: 'trap',
          tag: 'Piège 3 : conclure trop tôt qu’un nombre est premier',
          body: [
            {
              p: '2, 3 et 5 ne divisent pas 119, mais $7 \\times 7 = 49$ ne dépasse pas 119 : il faut encore essayer 7. Et $119 = 7 \\times 17$ : 119 n’est pas premier.',
            },
          ],
        },
        {
          kind: 'trap',
          tag: 'Piège 4 : les mêmes facteurs ne suffisent pas',
          body: [
            {
              p: '$8 = 2^3$ et $36 = 2^2 \\times 3^2$ ont le facteur 2 en commun, mais 8 demande trois fois le 2 et 36 ne l’a que deux fois : 8 ne divise pas 36 ($36 = 8 \\times 4 + 4$).',
            },
          ],
        },
      ],
    },
    {
      id: 'exercises',
      short: 'Exercices',
      title: 'Exercices',
      blocks: [
        {
          kind: 'text',
          text: 'Cherche sur ta feuille, puis ouvre le corrigé et compare. Les exercices vont du plus facile au niveau du brevet.',
        },
        {
          kind: 'task',
          title: 'Exercice 1',
          level: 'Facile',
          body: [{ p: 'Décompose 60 en produit de facteurs premiers.' }],
          solution: [
            '$60 \\div 2 = 30$, $30 \\div 2 = 15$, $15 \\div 3 = 5$, $5 \\div 5 = 1$. Donc $60 = 2^2 \\times 3 \\times 5$.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 2',
          level: 'Facile',
          body: [{ p: 'Calcule $2^2 \\times 3^3$.' }],
          solution: ['$2^2 \\times 3^3 = 4 \\times 27 = 108$.'],
        },
        {
          kind: 'task',
          title: 'Exercice 3',
          level: 'Moyen',
          body: [
            {
              p: 'Léo affirme que $150 = 6 \\times 25$ est la décomposition de 150 en facteurs premiers. A-t-il raison ?',
            },
          ],
          solution: [
            'Non : 6 et 25 ne sont pas premiers, car $6 = 2 \\times 3$ et $25 = 5 \\times 5$. La décomposition est $150 = 2 \\times 3 \\times 5^2$.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 4',
          level: 'Moyen',
          body: [{ p: 'Décompose 588 en produit de facteurs premiers, en écrivant le résultat avec des puissances.' }],
          solution: [
            '$588 \\div 2 = 294$, $294 \\div 2 = 147$, $147 \\div 3 = 49$, $49 \\div 7 = 7$, $7 \\div 7 = 1$.',
            'Donc $588 = 2^2 \\times 3 \\times 7^2$.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 5',
          level: 'Moyen',
          body: [{ p: '157 est-il premier ? Jusqu’à quel nombre premier faut-il essayer ?' }],
          solution: [
            '$11 \\times 11 = 121 \\leqslant 157$ et $13 \\times 13 = 169 > 157$ : on essaie 2, 3, 5, 7 et 11.',
            '157 est impair, $1 + 5 + 7 = 13$, il ne finit ni par 0 ni par 5 ; $157 = 7 \\times 22 + 3$ et $157 = 11 \\times 14 + 3$. Aucun ne divise 157 : 157 est premier.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 6',
          level: 'Moyen',
          body: [
            {
              p: 'On donne $A = 2^3 \\times 3 \\times 5^2 \\times 7$. Sans calculer $A$, dis si 20 divise $A$, puis si 9 divise $A$.',
            },
          ],
          solution: [
            '$20 = 2^2 \\times 5$ : $A$ a le 2 trois fois et le 5 deux fois, donc 20 divise $A$. Le quotient est $2 \\times 3 \\times 5 \\times 7 = 210$.',
            '$9 = 3^2$ : $A$ n’a le 3 qu’une fois, donc 9 ne divise pas $A$.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 7',
          level: 'Tableur',
          body: [
            {
              p: 'Dans un tableur, la colonne B affiche le reste de la division de $2{\\,}989$ par le nombre de la colonne A (2, 3, 4, 5…). Le premier 0 est en face de 7. Termine la décomposition de $2{\\,}989$.',
            },
          ],
          solution: [
            '$2{\\,}989 \\div 7 = 427$. Sur 427, le premier reste nul est encore en face de 7 : $427 \\div 7 = 61$.',
            '61 est premier (2, 3, 5 et 7 ne le divisent pas, et $11 \\times 11 = 121 > 61$). Donc $2{\\,}989 = 7^2 \\times 61$.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 8',
          level: 'Vers le brevet',
          body: [
            { p: '1) Décompose 756 en produit de facteurs premiers.' },
            {
              p: '2) Un nombre est le carré d’un entier quand tous les exposants de sa décomposition sont pairs. Trouve le plus petit entier $k$ tel que $756 \\times k$ soit le carré d’un entier.',
            },
          ],
          solution: [
            '1) $756 \\div 2 = 378$, $378 \\div 2 = 189$, $189 \\div 3 = 63$, $63 \\div 3 = 21$, $21 \\div 3 = 7$. Donc $756 = 2^2 \\times 3^3 \\times 7$.',
            '2) Le 2 a déjà un exposant pair ; il manque un 3 et un 7. Donc $k = 3 \\times 7 = 21$, et $756 \\times 21 = 2^2 \\times 3^4 \\times 7^2 = 126^2$.',
          ],
        },
      ],
    },
    {
      id: 'summary',
      short: 'Résumé',
      title: 'Les règles en un tableau',
      blocks: [
        {
          kind: 'table',
          head: ['La règle', 'En symboles', 'Exemple', 'Attention'],
          rows: [
            [
              'Un nombre premier a exactement deux diviseurs',
              '$1$ et $p$',
              '2, 3, 5, 7, 11, 13…',
              '1 n’est pas premier',
            ],
            [
              'On divise par 2, 3, 5, 7… dans l’ordre, jusqu’au quotient 1',
              '$n \\div 2,\\ \\div 3,\\ \\ldots \\to 1$',
              '$84 = 2 \\times 2 \\times 3 \\times 7$',
              'Chaque facteur doit être premier : pas $9 \\times 10$',
            ],
            [
              'Un facteur répété s’écrit avec un exposant',
              '$2 \\times 2 \\times 2 = 2^3$',
              '$600 = 2^3 \\times 3 \\times 5^2$',
              '$2^3$ vaut 8, pas 6',
            ],
            [
              'On s’arrête quand le carré du diviseur dépasse le nombre',
              '$p \\times p > n$',
              '113 est premier : $11 \\times 11 = 121$',
              '119 a l’air premier, mais $119 = 7 \\times 17$',
            ],
            [
              '$d$ divise $N$ si ses facteurs sont dans $N$, avec des exposants assez grands',
              '$2^2 \\times 3$ dans $2^3 \\times 3 \\times 5^2$',
              '12 divise 600, quotient 50',
              'Les mêmes facteurs ne suffisent pas : 8 ne divise pas 36',
            ],
            [
              'Pour un grand nombre, on lit le premier reste nul du tableur',
              '$\\texttt{=MOD(n;p)} = 0$',
              '$4{\\,}199 = 13 \\times 17 \\times 19$',
              'On recommence sur le quotient',
            ],
          ],
        },
        {
          kind: 'note',
          text: 'Au brevet : écris la colonne de tes divisions (2, 3, 5, 7… dans l’ordre) jusqu’au quotient 1, puis le résultat avec des puissances. Pour prouver qu’un nombre est premier, dis jusqu’où tu as essayé et pourquoi tu t’arrêtes.',
        },
      ],
    },
    {
      id: 'quiz',
      short: 'Quiz',
      title: 'Quiz',
      blocks: [{ kind: 'text', text: 'Choisis la bonne réponse : le résultat s’affiche tout de suite.' }],
    },
  ],
  quiz: [
    {
      q: 'Quelle écriture est la décomposition de 45 en facteurs premiers ?',
      options: ['$3 \\times 15$', '$3^2 \\times 5$', '$5 \\times 9$'],
      correct: 1,
      why: '15 et 9 ne sont pas premiers ; $45 = 3 \\times 3 \\times 5$.',
    },
    {
      q: 'Par quel nombre premier commence la décomposition de 91 ?',
      options: ['$7$', '$3$', '$13$'],
      correct: 0,
      why: '2, 3 et 5 ne divisent pas 91, et $91 = 7 \\times 13$.',
    },
    {
      q: 'Que vaut $2^4$ ?',
      options: ['$8$', '$6$', '$16$'],
      correct: 2,
      why: '$2^4 = 2 \\times 2 \\times 2 \\times 2 = 16$.',
    },
    {
      q: 'Pour savoir si 89 est premier, on essaie les divisions par :',
      options: ['$2,\\ 3,\\ 5,\\ 7$', 'tous les nombres jusqu’à $44$', '$2,\\ 3,\\ 5,\\ 7,\\ 11$'],
      correct: 0,
      why: '$7 \\times 7 = 49 \\leqslant 89$ mais $11 \\times 11 = 121 > 89$.',
    },
    {
      q: '$2^2 \\times 3 \\times 7^2$ vaut :',
      options: ['$588$', '$84$', '$196$'],
      correct: 0,
      why: '$4 \\times 3 \\times 49 = 588$.',
    },
    {
      q: '$N = 2^3 \\times 5 \\times 11$. Lequel de ces nombres ne divise pas $N$ ?',
      options: ['$40$', '$22$', '$25$'],
      correct: 2,
      why: '$25 = 5^2$ demande deux fois le 5, et $N$ ne l’a qu’une fois.',
    },
    {
      q: 'Un tableur montre que le premier reste nul de $1{\\,}147$ est en face de 31. Alors :',
      options: ['$1{\\,}147$ est premier', '$1{\\,}147 = 31 \\times 37$', '$1{\\,}147 = 31 \\times 31$'],
      correct: 1,
      why: '$1{\\,}147 \\div 31 = 37$, et 37 est premier.',
    },
  ],
  next: 'La leçon suivante : « Trouver le PGCD de deux nombres », avec leurs décompositions côte à côte.',
};
