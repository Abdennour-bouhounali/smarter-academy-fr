/**
 * « La page de révision » of the lesson (docs/architecture/REVISION_PAGE.md §2): plain data, drawn by features/revision.
 * The four rules are those of the knowledge sheets (world/knowledge.js) and of the board memo, in their words; the
 * numbers are the page's own — none of the design's reserved numbers, none of the exercise bank's headline pairs, none
 * of lessons 1 to 3. « plus petit multiple commun » is written in full, never abbreviated; « PGCD × plus petit multiple
 * commun = a × b » is kept for lesson 5. Every equality between numbers is computed by features/revision/revision.test.js
 * (a number written with a thin space, 1{\\,}260, is not read: those were checked by a script). Reached only through the
 * lesson's pack (`lesson.pack.js › revision`).
 */
export const REVISION = {
  intro:
    'Cette page reprend toute la leçon. Lis-la étape par étape, et fais chaque exercice sur ta feuille avant d’ouvrir le corrigé.',
  steps: [
    {
      id: 'recall',
      short: 'Rappel',
      title: 'Rappel : les multiples et la décomposition',
      blocks: [
        {
          kind: 'rule',
          tag: 'Les multiples',
          body: [
            {
              p: '$b$ est un multiple de $a$ quand $b = a \\times k$ avec $k$ entier. Tout nombre se décompose en produit de facteurs premiers.',
            },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple',
          body: [
            {
              p: '$63 = 9 \\times 7$ : 63 est un multiple de 9. $60 = 9 \\times 6 + 6$ : 60 n’en est pas un. Et $63 = 3^2 \\times 7$.',
            },
          ],
        },
        {
          kind: 'task',
          title: 'Vérifie',
          level: null,
          body: [{ p: 'Décompose 150 en produit de facteurs premiers, avec des puissances.' }],
          solution: ['$150 \\div 2 = 75$, $75 \\div 3 = 25$, $25 = 5^2$ : $150 = 2 \\times 3 \\times 5^2$.'],
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
          tag: 'Multiples communs et premier rendez-vous',
          body: [
            {
              p: 'Un multiple commun à deux nombres est un multiple de l’un et de l’autre. Le plus petit qui n’est pas 0 est leur plus petit multiple commun : le premier rendez-vous de deux rythmes partis ensemble. Les autres multiples communs sont ses multiples.',
            },
            { formula: '$m = a \\times k = b \\times l \\quad \\text{avec} \\quad \\textcolor{#e11d48}{m \\neq 0}$' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple : 12 et 33',
          body: [
            { p: 'Multiples de 33 : 33, 66, 99, 132. Les restes dans la division par 12 sont 9, 6, 3, puis 0.' },
            {
              p: '$132 = 12 \\times 11 = 33 \\times 4$ : le plus petit multiple commun de 12 et 33 est 132. Les suivants : 264, 396…',
            },
          ],
        },
        {
          kind: 'rule',
          tag: 'Par les facteurs premiers',
          body: [
            {
              p: 'On décompose les nombres. Le plus petit multiple commun est le produit de tous les facteurs premiers vus, chacun avec son plus grand exposant. Cela vaut aussi pour trois nombres.',
            },
            { formula: '$p^{e} \\text{ et } p^{f}\\ \\to\\ p^{\\textcolor{#e11d48}{\\max(e ; f)}}$' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple : 56 et 72, puis 20, 28 et 45',
          body: [
            { formula: '$56 = 2^3 \\times 7 \\qquad 72 = 2^3 \\times 3^2$' },
            {
              p: 'Les facteurs vus sont 2, 3 et 7, avec les plus grands exposants 3, 2 et 1 : $2^3 \\times 3^2 \\times 7 = 504$.',
            },
            { formula: '$20 = 2^2 \\times 5 \\qquad 28 = 2^2 \\times 7 \\qquad 45 = 3^2 \\times 5$' },
            { p: 'Pour les trois : $2^2 \\times 3^2 \\times 5 \\times 7 = 1{\\,}260$.' },
          ],
        },
        {
          kind: 'rule',
          tag: 'Des tours, ou une heure',
          body: [
            {
              p: 'Deux rythmes partis ensemble se retrouvent après leur plus petit multiple commun $m$. Chacun s’est répété $m$ divisé par sa propre période : c’est son nombre de tours. Si les périodes sont des durées, on ajoute $m$ à l’heure de départ.',
            },
            {
              formula:
                '$\\textcolor{#e11d48}{m} \\div a \\text{ tours} \\qquad \\textcolor{#e11d48}{m} \\div b \\text{ tours}$',
            },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple : des roues dentées, des bus',
          body: [
            {
              p: 'Deux roues dentées de 24 et 27 dents, marques alignées au départ : $216 = 24 \\times 9 = 27 \\times 8$. Elles se retrouvent alignées après 9 tours de la roue de 24 dents et 8 tours de celle de 27.',
            },
            {
              p: 'Deux bus partent à 7 h 20, puis toutes les 25 min et toutes les 35 min : $175 = 25 \\times 7 = 35 \\times 5$, soit 2 h 55 min. Ils repartent ensemble à 10 h 15.',
            },
          ],
        },
        {
          kind: 'rule',
          tag: 'Des équipes qui se reposent',
          body: [
            {
              p: 'Une équipe qui travaille 1 jour puis se repose $r$ jours a un cycle de $1 + r$ jours. Si toutes travaillent le jour 1, elles retravaillent ensemble le jour 1 plus le plus petit multiple commun de leurs cycles.',
            },
            { formula: '$\\text{jour} = 1 + \\textcolor{#e11d48}{\\text{plus petit multiple commun des cycles}}$' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple : repos de 11 et de 16 jours',
          body: [
            {
              p: 'Les cycles sont 12 et 17 jours : $204 = 12 \\times 17$. Les deux équipes retravaillent ensemble le jour $1 + 204 = 205$.',
            },
          ],
        },
        {
          kind: 'rule',
          tag: 'Un diviseur ou un multiple ?',
          body: [
            {
              p: 'Couper ou partager en morceaux égaux, sans reste : un diviseur commun, le plus grand (le PGCD). Faire se retrouver deux rythmes : un multiple commun, le plus petit qui n’est pas 0.',
            },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple : 18 et 39',
          body: [
            {
              p: 'Deux rubans de 18 m et 39 m coupés en morceaux égaux les plus longs : $\\mathrm{PGCD}(18 ; 39) = 3$, donc des morceaux de 3 m.',
            },
            {
              p: 'Deux feux qui clignotent toutes les 18 s et toutes les 39 s : $234 = 18 \\times 13 = 39 \\times 6$, ils se retrouvent après 234 s.',
            },
          ],
        },
        {
          kind: 'rule',
          tag: 'Deux nombres sans facteur commun',
          body: [
            {
              p: 'Si deux nombres n’ont aucun facteur premier commun, leur plus petit multiple commun est leur produit.',
            },
            { formula: '$\\text{aucun facteur commun}\\ \\Rightarrow\\ \\textcolor{#e11d48}{m = a \\times b}$' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple : 13 et 16',
          body: [
            {
              p: '$13$ est premier et $16 = 2^4$ : aucun facteur commun. Leur plus petit multiple commun est $13 \\times 16 = 208$.',
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
          tag: 'Exemple 1 : le plus petit multiple commun de 12 et 38 par les listes',
          body: [
            {
              steps: [
                'Multiples de 38 : 38, 76, 114, 152, 190, 228.',
                'On les divise par 12 : les restes sont 2, 4, 6, 8, 10, puis 0.',
              ],
            },
            { concl: '$228 = 38 \\times 6 = 12 \\times 19$ : le plus petit multiple commun de 12 et 38 est 228.' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple 2 : par les facteurs premiers',
          body: [
            { p: '$A = 45$ et $B = 63$.' },
            {
              steps: [
                '$45 = 3^2 \\times 5$ et $63 = 3^2 \\times 7$.',
                'Les facteurs vus sont 3, 5 et 7 ; le plus grand exposant de 3 est 2.',
              ],
            },
            { concl: 'Le plus petit multiple commun de 45 et 63 est $3^2 \\times 5 \\times 7 = 315$.' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple 3 : des roues dentées',
          body: [
            {
              p: 'Deux roues de 21 et de 33 dents s’engrènent, marques alignées. Après combien de tours de chaque roue sont-elles de nouveau alignées ?',
            },
            {
              steps: [
                '$21 = 3 \\times 7$ et $33 = 3 \\times 11$ : le plus petit multiple commun est $3 \\times 7 \\times 11 = 231$.',
                'Le nombre de tours de chaque roue est 231 divisé par son nombre de dents : $231 \\div 21 = 11$ et $231 \\div 33 = 7$.',
              ],
            },
            { concl: 'Alignées après 231 dents : 11 tours de la roue de 21 dents, 7 tours de celle de 33 dents.' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple 4 : trois équipes',
          body: [
            {
              p: 'Trois équipes travaillent 1 jour puis se reposent 3 jours, 6 jours, 7 jours. Elles travaillent toutes le jour 1. Quel jour retravaillent-elles ensemble ?',
            },
            {
              steps: [
                'Les cycles sont $1 + 3 = 4$, $1 + 6 = 7$ et $1 + 7 = 8$ jours.',
                '$4 = 2^2$, $7$ et $8 = 2^3$ : le plus petit multiple commun est $2^3 \\times 7 = 56$.',
              ],
            },
            { concl: 'Elles retravaillent ensemble le jour $1 + 56 = 57$.' },
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
          tag: 'Piège 1 : prendre le produit',
          body: [
            {
              p: 'Le plus petit multiple commun de 56 et 72 n’est pas $56 \\times 72 = 4{\\,}032$. C’est bien un multiple commun, mais pas le plus petit : $504 = 56 \\times 9 = 72 \\times 7$.',
            },
          ],
        },
        {
          kind: 'trap',
          tag: 'Piège 2 : garder le plus petit exposant',
          body: [
            {
              p: '$32 = 2^5$ et $36 = 2^2 \\times 3^2$. Garder $2^2 = 4$ est la règle du PGCD, pas celle-ci : $4$ n’est pas un multiple de 32. On garde le plus grand exposant : $2^5 \\times 3^2 = 288 = 32 \\times 9 = 36 \\times 8$.',
            },
          ],
        },
        {
          kind: 'trap',
          tag: 'Piège 3 : échanger les tours',
          body: [
            {
              p: 'Pour les roues de 24 et 27 dents, $216 = 24 \\times 9$ : la roue de 24 dents fait 9 tours, pas 8. Le nombre de tours d’une roue est le plus petit multiple commun divisé par son propre nombre de dents.',
            },
          ],
        },
        {
          kind: 'trap',
          tag: 'Piège 4 : les jours de repos pour cycle',
          body: [
            {
              p: 'Repos de 11 et de 16 jours : les cycles sont 12 et 17, pas 11 et 16. Avec les repos, on trouverait 176, et $176 = 12 \\times 14 + 8$ n’est pas un multiple de 12. Enfin le jour est $1 + 204 = 205$, pas 204.',
            },
          ],
        },
        {
          kind: 'trap',
          tag: 'Piège 5 : prendre 0',
          body: [
            {
              p: '$0 = 12 \\times 0 = 38 \\times 0$ est un multiple commun, mais on cherche le plus petit multiple commun qui n’est pas 0.',
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
          body: [
            {
              p: 'Écris les multiples de 26 jusqu’à en trouver un qui soit aussi un multiple de 7. Que vaut le plus petit multiple commun de 26 et 7 ?',
            },
          ],
          solution: [
            'Multiples de 26 : 26, 52, 78, 104, 130, 156, 182.',
            '$182 = 7 \\times 26$ est le premier multiple de 7 de la liste : le plus petit multiple commun de 26 et 7 est 182.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 2',
          level: 'Facile',
          body: [{ p: 'Calcule le plus petit multiple commun de $2^3 \\times 3$ et de $2 \\times 3^2 \\times 11$.' }],
          solution: [
            'Facteurs vus : 2 (plus grand exposant 3), 3 (exposant 2) et 11 (exposant 1).',
            '$2^3 \\times 3^2 \\times 11 = 792$.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 3',
          level: 'Moyen',
          body: [
            { p: 'Décompose 44 et 60 en produits de facteurs premiers, puis donne leur plus petit multiple commun.' },
          ],
          solution: [
            '$44 = 2^2 \\times 11$ et $60 = 2^2 \\times 3 \\times 5$.',
            'Le plus petit multiple commun est $2^2 \\times 3 \\times 5 \\times 11 = 660$.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 4',
          level: 'Moyen',
          body: [
            {
              p: 'Deux roues dentées de 26 et de 28 dents s’engrènent, marques alignées au départ. Quand sont-elles de nouveau alignées ? Combien de tours fait chaque roue ?',
            },
          ],
          solution: [
            '$26 = 2 \\times 13$ et $28 = 2^2 \\times 7$ : le plus petit multiple commun est $2^2 \\times 7 \\times 13 = 364$.',
            '$364 \\div 26 = 14$ et $364 \\div 28 = 13$ : 14 tours pour la roue de 26 dents, 13 pour celle de 28 dents.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 5',
          level: 'Moyen',
          body: [
            {
              p: 'a) Quel est le plus petit multiple commun de 11 et de 25, sans longue liste ? b) Léo dit que celui de 20 et de 34 est $20 \\times 34 = 680$. A-t-il raison ?',
            },
          ],
          solution: [
            'a) 11 est premier et $25 = 5^2$ : aucun facteur commun, donc le plus petit multiple commun est $11 \\times 25 = 275$.',
            'b) $20 = 2^2 \\times 5$ et $34 = 2 \\times 17$ ont le facteur 2 en commun : le plus petit multiple commun est $2^2 \\times 5 \\times 17 = 340$, la moitié de 680. Léo se trompe.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 6',
          level: 'Situation',
          body: [
            {
              p: 'Trois équipes travaillent 1 jour puis se reposent 4 jours, 6 jours et 9 jours. Elles travaillent toutes le jour 1. Quel jour retravaillent-elles ensemble ?',
            },
          ],
          solution: [
            'Les cycles sont 5, 7 et 10 jours : $5$, $7$ et $10 = 2 \\times 5$.',
            'Le plus petit multiple commun est $2 \\times 5 \\times 7 = 70$ : elles retravaillent ensemble le jour $1 + 70 = 71$.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 7',
          level: 'Vers le brevet',
          body: [
            {
              p: 'Un fleuriste a 63 roses et 77 tulipes. Deux phares émettent un éclat, l’un toutes les 63 s, l’autre toutes les 77 s ; ils éclatent ensemble à 21 h 00 min 00 s.',
            },
            {
              p: '1) Décompose 63 et 77. 2) Il fait le plus de bouquets identiques possible, avec toutes les fleurs : combien, et que contient chacun ? 3) À quelle heure les deux phares éclatent-ils de nouveau ensemble ?',
            },
          ],
          solution: [
            '1) $63 = 3^2 \\times 7$ et $77 = 7 \\times 11$.',
            '2) Le seul facteur commun est 7 : $\\mathrm{PGCD}(63 ; 77) = 7$. Il fait 7 bouquets de $63 \\div 7 = 9$ roses et $77 \\div 7 = 11$ tulipes.',
            '3) Le plus petit multiple commun est $3^2 \\times 7 \\times 11 = 693$ s, soit $693 = 11 \\times 60 + 33$ : 11 min 33 s. Les phares éclatent ensemble à 21 h 11 min 33 s.',
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
              'Le premier rendez-vous est le plus petit multiple commun qui n’est pas 0',
              '$m = a \\times k = b \\times l$',
              '$132 = 12 \\times 11 = 33 \\times 4$',
              'Pas 0 ; pas un multiple de l’un seulement',
            ],
            [
              'Tous les facteurs premiers vus, chacun avec son plus grand exposant',
              '$p^{\\max(e ; f)}$',
              '$56$ et $72$ : $2^3 \\times 3^2 \\times 7 = 504$',
              'Pas le plus petit exposant (c’est le PGCD) ; pas le produit',
            ],
            [
              'Tours : le plus petit multiple commun divisé par sa propre période',
              '$m \\div a$ et $m \\div b$',
              '$216 \\div 24 = 9$ tours',
              'Ne pas échanger les tours ; une durée s’ajoute à l’heure de départ',
            ],
            [
              'Cycle = 1 jour de travail + les jours de repos ; rendez-vous le jour 1 + le multiple',
              '$\\text{jour} = 1 + m$',
              'Repos 11 et 16 : jour $1 + 204 = 205$',
              'Pas les repos pour cycles ; ne pas oublier le $+ 1$',
            ],
            [
              'Partager en morceaux égaux : le PGCD. Se retrouver : le plus petit multiple commun',
              '$\\mathrm{PGCD}$ ou $m$',
              '18 et 39 : morceaux de 3 m ; feux après 234 s',
              'Un diviseur commun est plus petit, un multiple commun plus grand',
            ],
            [
              'Sans facteur commun, le plus petit multiple commun est le produit',
              '$m = a \\times b$',
              '$13 \\times 16 = 208$',
              'Ne marche plus dès qu’il y a un facteur commun : 20 et 34 donnent 340, pas 680',
            ],
          ],
        },
        {
          kind: 'note',
          text: 'Au brevet : écris la méthode (la liste des multiples, ou les décompositions en facteurs premiers), puis le plus petit multiple commun entouré, divise-le par chaque période si on demande des tours, ajoute-le à l’heure de départ si on demande une heure, et réponds par une phrase. Dans un problème, dis pourquoi il s’agit d’un multiple commun et pas d’un diviseur commun.',
        },
      ],
    },
    {
      id: 'quiz',
      short: 'Quiz',
      title: 'Quiz',
      blocks: [{ kind: 'text', text: 'Choisis la bonne réponse : le résultat s’affiche tout de suite.' }],
    },
  ],
  quiz: [
    {
      q: 'Quel est le premier rendez-vous (autre que 0) de deux rythmes de 20 et de 34 ?',
      options: ['$340$', '$680$', '$170$'],
      correct: 0,
      why: '$20 = 2^2 \\times 5$ et $34 = 2 \\times 17$ : $2^2 \\times 5 \\times 17 = 340$. 680 est un multiple commun, mais 170 n’est pas un multiple de 20.',
    },
    {
      q: 'Le plus petit multiple commun de $2^3 \\times 3 \\times 5$ et de $2 \\times 3^2 \\times 7$ est :',
      options: ['$2 \\times 3$', '$2^3 \\times 3 \\times 5 \\times 7$', '$2^3 \\times 3^2 \\times 5 \\times 7$'],
      correct: 2,
      why: 'Tous les facteurs vus, avec le plus grand exposant : $2^3 \\times 3^2 \\times 5 \\times 7 = 2{\\,}520$.',
    },
    {
      q: 'Deux roues de 22 et de 33 dents, marques alignées au départ. Quand elles se retrouvent alignées, la roue de 22 dents a fait :',
      options: ['$2$ tours', '$3$ tours', '$66$ tours'],
      correct: 1,
      why: '$66 = 22 \\times 3 = 33 \\times 2$ : 3 tours pour la roue de 22 dents, 2 pour celle de 33.',
    },
    {
      q: 'Deux bus partent à 7 h 00, puis toutes les 24 min et toutes les 26 min. Ils repartent ensemble à :',
      options: ['$12$ h $12$', '$7$ h $50$', '$9$ h $12$'],
      correct: 0,
      why: '$312 = 24 \\times 13 = 26 \\times 12$ : 312 min, soit 5 h 12 min. 7 h 00 plus 5 h 12 min donne 12 h 12.',
    },
    {
      q: 'Deux équipes travaillent 1 jour puis se reposent 14 jours, et 1 jour puis se reposent 16 jours. Elles travaillent le jour 1 : elles retravaillent ensemble le jour :',
      options: ['$255$', '$112$', '$256$'],
      correct: 2,
      why: 'Les cycles sont 15 et 17 jours, leur plus petit multiple commun est $255$, donc le jour $1 + 255 = 256$.',
    },
    {
      q: 'On coupe un ruban de 16 m et un ruban de 28 m en morceaux égaux, les plus longs possible, sans chute. Un morceau mesure :',
      options: ['$112$ m', '$4$ m', '$2$ m'],
      correct: 1,
      why: 'On coupe : c’est le PGCD, $\\mathrm{PGCD}(16 ; 28) = 4$. Le multiple 112 répond à une autre question.',
    },
    {
      q: 'Deux rythmes de 12 et de 19 se retrouvent pour la première fois (hors 0) à :',
      options: ['$228$', '$114$', '$1$'],
      correct: 0,
      why: '12 et 19 n’ont aucun facteur commun : $12 \\times 19 = 228$.',
    },
  ],
  next: 'La leçon suivante : « Vers le brevet — Multiples et diviseurs ».',
};
