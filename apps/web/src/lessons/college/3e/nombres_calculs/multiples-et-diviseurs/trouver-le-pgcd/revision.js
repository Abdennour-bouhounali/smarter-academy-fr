/**
 * « La page de révision » of the lesson (docs/architecture/REVISION_PAGE.md §2): plain data, drawn by features/revision.
 * The rules are those of the knowledge sheets (world/knowledge.js) and of the board memo, in their words; the numbers are
 * the page's own — nothing is copied from the exercise bank. Every equality between numbers is computed by
 * features/revision/revision.test.js (a number written with a thin space, 1{\\,}147, is not read: those were checked by
 * a script). Reached only through the lesson's pack (`lesson.pack.js › revision`).
 */
export const REVISION = {
  intro:
    'Cette page reprend toute la leçon. Lis-la étape par étape, et fais chaque exercice sur ta feuille avant d’ouvrir le corrigé.',
  steps: [
    {
      id: 'recall',
      short: 'Rappel',
      title: 'Rappel : la division euclidienne et la décomposition',
      blocks: [
        {
          kind: 'rule',
          tag: 'La division euclidienne',
          body: [
            { p: 'Diviser $a$ par $b$, c’est trouver le quotient $q$ et le reste $r$ :' },
            { formula: '$a = b \\times q + r \\quad \\text{avec} \\quad r < b$' },
            { p: '$b$ divise $a$ quand le reste est 0. Et tout nombre se décompose en produit de facteurs premiers.' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple',
          body: [
            {
              p: '$96 = 36 \\times 2 + 24$ : le quotient est 2, le reste 24, donc 36 ne divise pas 96. Et $96 = 2^5 \\times 3$.',
            },
          ],
        },
        {
          kind: 'task',
          title: 'Vérifie',
          level: null,
          body: [{ p: 'Décompose 90 en produit de facteurs premiers, avec des puissances.' }],
          solution: [
            '$90 \\div 2 = 45$, $45 \\div 3 = 15$, $15 \\div 3 = 5$, $5 \\div 5 = 1$ : $90 = 2 \\times 3^2 \\times 5$.',
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
          tag: 'Diviseurs communs et PGCD',
          body: [
            {
              p: 'Un diviseur commun à deux nombres divise l’un et l’autre. Le plus grand des diviseurs communs de $a$ et $b$ est leur PGCD.',
            },
            {
              formula:
                '$d \\text{ divise } a \\text{ et } b\\ \\Rightarrow\\ d \\leqslant \\textcolor{#e11d48}{\\mathrm{PGCD}(a ; b)}$',
            },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple : 30 et 42',
          body: [
            { p: 'Diviseurs de 30 : 1, 2, 3, 5, 6, 10, 15, 30. Diviseurs de 42 : 1, 2, 3, 6, 7, 14, 21, 42.' },
            { p: 'Les diviseurs communs sont 1, 2, 3 et 6 : $\\mathrm{PGCD}(30 ; 42) = 6$.' },
          ],
        },
        {
          kind: 'rule',
          tag: 'Le PGCD par les facteurs premiers',
          body: [
            {
              p: 'On décompose les deux nombres. Le PGCD est le produit des facteurs premiers communs, chacun avec son plus petit exposant. S’il n’y a aucun facteur commun, le PGCD est 1.',
            },
            { formula: '$p^{e} \\text{ et } p^{f}\\ \\to\\ p^{\\textcolor{#e11d48}{\\min(e ; f)}}$' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple : 360 et 300',
          body: [
            { formula: '$360 = 2^3 \\times 3^2 \\times 5 \\qquad 300 = 2^2 \\times 3 \\times 5^2$' },
            {
              p: '2, 3 et 5 sont dans les deux, avec les plus petits exposants 2, 1 et 1 : $\\mathrm{PGCD}(360 ; 300) = 2^2 \\times 3 \\times 5 = 60$.',
            },
          ],
        },
        {
          kind: 'rule',
          tag: 'L’algorithme d’Euclide',
          body: [
            {
              p: 'On divise le plus grand nombre par le plus petit, puis le diviseur par le reste, et ainsi de suite jusqu’au reste 0. Le PGCD est le dernier reste qui n’est pas 0.',
            },
            { formula: '$\\mathrm{PGCD}(a ; b) = \\textcolor{#e11d48}{\\mathrm{PGCD}(b ; r)}$' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple : 252 et 198',
          body: [
            {
              formula:
                '$252 = 198 \\times 1 + 54 \\quad 198 = 54 \\times 3 + 36 \\quad 54 = 36 \\times 1 + \\textcolor{#e11d48}{18} \\quad 36 = 18 \\times 2 + 0$',
            },
            { p: 'Le dernier reste qui n’est pas 0 est 18 : $\\mathrm{PGCD}(252 ; 198) = 18$.' },
          ],
        },
        {
          kind: 'rule',
          tag: 'Partager en lots identiques',
          body: [
            {
              p: 'Partager deux quantités en lots identiques, sans reste, c’est choisir un diviseur commun. Le plus grand nombre de lots possible est leur PGCD ; chaque lot reçoit le quotient de chaque quantité par ce PGCD.',
            },
            { formula: '$\\text{le plus de lots} = \\textcolor{#e11d48}{\\mathrm{PGCD}(a ; b)}$' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple : 84 roses et 60 tulipes',
          body: [
            {
              p: '$\\mathrm{PGCD}(84 ; 60) = 12$ : au plus 12 bouquets identiques, chacun de $84 \\div 12 = 7$ roses et $60 \\div 12 = 5$ tulipes.',
            },
          ],
        },
        {
          kind: 'note',
          text: 'Quelle méthode choisir ? Petits nombres : les listes de diviseurs. Nombres déjà décomposés : les facteurs communs avec le plus petit exposant. Grands nombres : les divisions d’Euclide.',
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
          tag: 'Exemple 1 : $\\mathrm{PGCD}(45 ; 75)$ par les listes',
          body: [
            {
              steps: [
                'Diviseurs de 45 : 1, 3, 5, 9, 15, 45.',
                'Diviseurs de 75 : 1, 3, 5, 15, 25, 75.',
                'Les diviseurs communs sont 1, 3, 5 et 15.',
              ],
            },
            { concl: 'Le plus grand est 15 : $\\mathrm{PGCD}(45 ; 75) = 15$.' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple 2 : par les facteurs premiers',
          body: [
            { p: '$A = 2^4 \\times 3 \\times 7$ et $B = 2^2 \\times 3^3 \\times 5$.' },
            {
              steps: [
                'Les facteurs communs sont 2 et 3 ; 5 et 7 ne sont que dans un des deux nombres.',
                'Le plus petit exposant de 2 est 2, celui de 3 est 1.',
              ],
            },
            { concl: '$\\mathrm{PGCD}(A ; B) = 2^2 \\times 3 = 12$.' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple 3 : $\\mathrm{PGCD}(1{\\,}147 ; 851)$ par Euclide',
          body: [
            {
              steps: [
                '$1{\\,}147 = 851 \\times 1 + 296$',
                '$851 = 296 \\times 2 + 259$',
                '$296 = 259 \\times 1 + 37$',
                '$259 = 37 \\times 7 + 0$',
              ],
            },
            { concl: 'Le dernier reste qui n’est pas 0 est 37 : $\\mathrm{PGCD}(1{\\,}147 ; 851) = 37$.' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple 4 : des sachets de bonbons',
          body: [
            {
              p: 'Camille prépare des sachets identiques avec 126 caramels et 210 chocolats, sans qu’il en reste. Combien de sachets au plus ? Que contient chacun ?',
            },
            {
              steps: [
                'Le nombre de sachets divise 126 et 210 : c’est un diviseur commun, et le plus grand est le PGCD.',
                '$126 = 2 \\times 3^2 \\times 7$ et $210 = 2 \\times 3 \\times 5 \\times 7$.',
                '$\\mathrm{PGCD}(126 ; 210) = 2 \\times 3 \\times 7 = 42$, puis $126 \\div 42 = 3$ et $210 \\div 42 = 5$.',
              ],
            },
            { concl: 'Au plus 42 sachets, chacun de 3 caramels et 5 chocolats.' },
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
          tag: 'Piège 1 : prendre la différence',
          body: [
            {
              p: '$\\mathrm{PGCD}(60 ; 84) \\neq 84 - 60$. La différence 24 ne divise pas 60 : $60 = 24 \\times 2 + 12$. En fait $\\mathrm{PGCD}(60 ; 84) = 12$.',
            },
          ],
        },
        {
          kind: 'trap',
          tag: 'Piège 2 : un diviseur commun, mais pas le plus grand',
          body: [
            {
              p: '6 divise 60 et 84, mais ce n’est pas le plus grand diviseur commun : 12 aussi les divise. Le PGCD est le plus grand de la liste.',
            },
          ],
        },
        {
          kind: 'trap',
          tag: 'Piège 3 : garder le plus grand exposant',
          body: [
            {
              p: '$\\mathrm{PGCD}(2^3 \\times 5 ; 2^2 \\times 5^2) \\neq 2^3 \\times 5^2$ : 200 ne divise même pas 40. On garde le plus petit exposant : $2^2 \\times 5 = 20$.',
            },
          ],
        },
        {
          kind: 'trap',
          tag: 'Piège 4 : lire le dernier quotient',
          body: [
            {
              p: 'Dans $36 = 18 \\times 2 + 0$, le PGCD n’est pas le quotient 2 mais le dernier reste qui n’est pas 0, ici 18. Et on ne s’arrête qu’au reste 0.',
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
          body: [{ p: 'Écris les diviseurs communs de 18 et 27, puis leur PGCD.' }],
          solution: [
            'Diviseurs de 18 : 1, 2, 3, 6, 9, 18. Diviseurs de 27 : 1, 3, 9, 27.',
            'Les diviseurs communs sont 1, 3 et 9 : $\\mathrm{PGCD}(18 ; 27) = 9$.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 2',
          level: 'Facile',
          body: [{ p: 'Calcule $\\mathrm{PGCD}(2^3 \\times 3^2 \\times 5 ; 2 \\times 3^3 \\times 7)$.' }],
          solution: [
            'Facteurs communs : 2 (plus petit exposant 1) et 3 (plus petit exposant 2). Le PGCD vaut $2 \\times 3^2 = 18$.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 3',
          level: 'Moyen',
          body: [{ p: 'Décompose 220 et 308 en produits de facteurs premiers, puis donne leur PGCD.' }],
          solution: [
            '$220 = 2^2 \\times 5 \\times 11$ et $308 = 2^2 \\times 7 \\times 11$.',
            '$\\mathrm{PGCD}(220 ; 308) = 2^2 \\times 11 = 44$.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 4',
          level: 'Moyen',
          body: [{ p: 'Avec l’algorithme d’Euclide, trouve le PGCD de 494 et 338.' }],
          solution: [
            '$494 = 338 \\times 1 + 156$, $338 = 156 \\times 2 + 26$, $156 = 26 \\times 6 + 0$.',
            'Le dernier reste qui n’est pas 0 est 26 : $\\mathrm{PGCD}(494 ; 338) = 26$.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 5',
          level: 'Moyen',
          body: [{ p: 'Quel est le PGCD de 35 et 48 ? Et celui de 17 et 85 ? Explique sans longue liste.' }],
          solution: [
            '$35 = 5 \\times 7$ et $48 = 2^4 \\times 3$ n’ont aucun facteur premier commun : $\\mathrm{PGCD}(35 ; 48) = 1$.',
            '$85 = 17 \\times 5$ : 17 divise 85, et aucun diviseur de 17 n’est plus grand que 17. Donc $\\mathrm{PGCD}(17 ; 85) = 17$.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 6',
          level: 'Situation',
          body: [
            {
              p: 'Un mur de 330 cm sur 210 cm est couvert de carreaux carrés identiques, posés sans découpe. Quel est le plus grand côté possible d’un carreau ? Combien de carreaux faut-il alors ?',
            },
          ],
          solution: [
            'Le côté divise 330 et 210 : le plus grand est leur PGCD. $330 = 2 \\times 3 \\times 5 \\times 11$ et $210 = 2 \\times 3 \\times 5 \\times 7$, donc le PGCD vaut $2 \\times 3 \\times 5 = 30$.',
            'Des carreaux de 30 cm : $330 \\div 30 = 11$ et $210 \\div 30 = 7$, soit $11 \\times 7 = 77$ carreaux.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 7',
          level: 'Vers le brevet',
          body: [
            {
              p: 'Un professeur a $1{\\,}080$ feuilles blanches et 756 feuilles de couleur. Il veut faire des paquets identiques qui utilisent toutes les feuilles.',
            },
            {
              p: '1) Peut-il faire 36 paquets ? 2) Avec l’algorithme d’Euclide, trouve le plus grand nombre de paquets possible. 3) Combien de feuilles de chaque sorte y a-t-il alors dans un paquet ?',
            },
          ],
          solution: [
            '1) Oui : $1{\\,}080 = 36 \\times 30$ et $756 = 36 \\times 21$, donc 36 divise les deux nombres.',
            '2) $1{\\,}080 = 756 \\times 1 + 324$, $756 = 324 \\times 2 + 108$, $324 = 108 \\times 3 + 0$ : le PGCD est 108, donc 108 paquets au plus.',
            '3) $1{\\,}080 \\div 108 = 10$ et $756 \\div 108 = 7$ : 10 feuilles blanches et 7 feuilles de couleur par paquet.',
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
              'Le PGCD est le plus grand des diviseurs communs',
              '$d \\leqslant \\mathrm{PGCD}(a ; b)$',
              '$\\mathrm{PGCD}(30 ; 42) = 6$',
              'Pas la différence, pas un diviseur commun plus petit',
            ],
            [
              'Facteurs premiers communs, chacun avec son plus petit exposant',
              '$p^{\\min(e ; f)}$',
              '$\\mathrm{PGCD}(360 ; 300) = 2^2 \\times 3 \\times 5$',
              'Pas le plus grand exposant ; aucun facteur commun : PGCD 1',
            ],
            [
              'Euclide : le dernier reste qui n’est pas 0',
              '$\\mathrm{PGCD}(a ; b) = \\mathrm{PGCD}(b ; r)$',
              '$\\mathrm{PGCD}(252 ; 198) = 18$',
              'Pas le dernier quotient ; aller jusqu’au reste 0',
            ],
            [
              'Le plus de lots identiques est le PGCD',
              '$\\mathrm{PGCD}(a ; b)$ lots',
              '84 roses, 60 tulipes : 12 bouquets',
              'Chaque lot : $a \\div \\mathrm{PGCD}$ et $b \\div \\mathrm{PGCD}$',
            ],
          ],
        },
        {
          kind: 'note',
          text: 'Au brevet : écris la méthode (les listes, les décompositions ou les divisions d’Euclide l’une sous l’autre), entoure le PGCD, puis réponds à la question par une phrase. Dans un problème de lots, dis pourquoi le nombre de lots est un diviseur commun.',
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
      q: 'Les diviseurs communs de 24 et 36 sont :',
      options: ['1, 2, 3, 4, 6 et 12', '1, 2, 3, 4 et 6', '2, 3 et 12'],
      correct: 0,
      why: '12 divise 24 et 36, et c’est le plus grand des diviseurs communs.',
    },
    {
      q: '$\\mathrm{PGCD}(56 ; 98)$ vaut :',
      options: ['$42$', '$14$', '$7$'],
      correct: 1,
      why: '$56 = 2^3 \\times 7$ et $98 = 2 \\times 7^2$ : $2 \\times 7 = 14$.',
    },
    {
      q: '$\\mathrm{PGCD}(2^4 \\times 3 ; 2^2 \\times 3^3)$ vaut :',
      options: ['$2^4 \\times 3^3$', '$2 \\times 3$', '$2^2 \\times 3$'],
      correct: 2,
      why: 'Les facteurs communs 2 et 3, chacun avec son plus petit exposant.',
    },
    {
      q: '$64 = 40 \\times 1 + 24$. Quelle division vient ensuite dans l’algorithme d’Euclide ?',
      options: ['$40$ divisé par $24$', '$64$ divisé par $24$', '$24$ divisé par $1$'],
      correct: 0,
      why: 'On divise le diviseur 40 par le reste 24.',
    },
    {
      q: 'Les divisions se terminent par $24 = 16 \\times 1 + 8$ puis $16 = 8 \\times 2 + 0$. Le PGCD est :',
      options: ['$2$', '$8$', '$16$'],
      correct: 1,
      why: 'C’est le dernier reste qui n’est pas 0.',
    },
    {
      q: 'Avec 72 billes rouges et 120 billes bleues, le plus grand nombre de sacs identiques est :',
      options: ['$12$', '$48$', '$24$'],
      correct: 2,
      why: '$\\mathrm{PGCD}(72 ; 120) = 24$ : 24 sacs de 3 billes rouges et 5 billes bleues.',
    },
    {
      q: '$\\mathrm{PGCD}(7 ; 12)$ vaut :',
      options: ['$1$', '$84$', '$5$'],
      correct: 0,
      why: '7 et 12 n’ont aucun facteur premier commun.',
    },
  ],
  next: 'La leçon suivante : « Rendre une fraction irréductible », en divisant ses deux termes par leur PGCD.',
};
