/**
 * « La page de révision » of the lesson (docs/architecture/REVISION_PAGE.md §2): plain data, drawn by features/revision.
 * The four rules are those of the knowledge sheets (world/knowledge.js) and of the board memo, in their words; the
 * numbers are the page's own — none of the design's reserved numbers, none of the exercise bank's. Every equality
 * between numbers is computed by features/revision/revision.test.js (a number written with a thin space, 1{\\,}577, is
 * not read: those were checked by a script). Reached only through the lesson's pack (`lesson.pack.js › revision`).
 */
export const REVISION = {
  intro:
    'Cette page reprend toute la leçon. Lis-la étape par étape, et fais chaque exercice sur ta feuille avant d’ouvrir le corrigé.',
  steps: [
    {
      id: 'recall',
      short: 'Rappel',
      title: 'Rappel : fractions égales, décomposition et PGCD',
      blocks: [
        {
          kind: 'rule',
          tag: 'Diviser les deux termes par le même nombre',
          body: [
            {
              p: 'Une fraction ne change pas quand on divise son numérateur et son dénominateur par un même nombre non nul. Le PGCD de deux nombres est le plus grand de leurs diviseurs communs ; on le trouve avec les décompositions en facteurs premiers ou avec l’algorithme d’Euclide.',
            },
            { formula: '$\\dfrac{a}{b} = \\dfrac{a \\div k}{b \\div k}$' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple',
          body: [{ p: '$\\dfrac{9}{24} = \\dfrac{9 \\div 3}{24 \\div 3} = \\dfrac{3}{8}$ : on a divisé par 3.' }],
        },
        {
          kind: 'task',
          title: 'Vérifie',
          level: null,
          body: [{ p: 'Écris 98 comme un produit de nombres premiers, en utilisant une puissance.' }],
          solution: ['$98 \\div 2 = 49$, $49 \\div 7 = 7$, $7 \\div 7 = 1$ : $98 = 2 \\times 7^2$.'],
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
          tag: 'Simplifier avec les facteurs premiers',
          body: [
            {
              p: 'Chaque terme est écrit en produit de facteurs premiers, puis on barre chaque facteur premier commun, autant de fois qu’il est dans les deux termes. S’il ne reste rien, il reste 1, pas 0.',
            },
            {
              formula:
                '$\\dfrac{\\textcolor{#e11d48}{c} \\times u}{\\textcolor{#e11d48}{c} \\times v} = \\dfrac{u}{v}$',
            },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple : 66 et 99',
          body: [
            {
              formula: '$\\dfrac{66}{99} = \\dfrac{2 \\times 3 \\times 11}{3^2 \\times 11} = \\dfrac{2}{3}$',
            },
            { p: 'On barre 3 une fois et 11 une fois, car 3 n’est qu’une fois dans 66.' },
          ],
        },
        {
          kind: 'rule',
          tag: 'La fraction irréductible',
          body: [
            {
              p: 'Une fraction est irréductible quand son numérateur et son dénominateur n’ont aucun facteur premier commun : leur PGCD est 1. Elle ne peut plus s’écrire avec des nombres plus petits.',
            },
            {
              formula: '$\\dfrac{a}{b} \\text{ irréductible } \\iff \\mathrm{PGCD}(a ; b) = \\textcolor{#e11d48}{1}$',
            },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple : 25 et 63',
          body: [
            {
              p: '$25 = 5^2$ et $63 = 3^2 \\times 7$ n’ont aucun facteur premier commun : $\\dfrac{25}{63}$ est irréductible.',
            },
          ],
        },
        {
          kind: 'rule',
          tag: 'Diviser par le PGCD',
          body: [
            {
              p: 'Pour obtenir la fraction irréductible en une seule étape, on divise le numérateur et le dénominateur par leur PGCD $g$.',
            },
            {
              formula: '$\\dfrac{a}{b} = \\dfrac{a \\div \\textcolor{#e11d48}{g}}{b \\div \\textcolor{#e11d48}{g}}$',
            },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple : 111 et 185',
          body: [
            { p: '$185 = 111 \\times 1 + 74$, $111 = 74 \\times 1 + 37$, $74 = 37 \\times 2 + 0$ : le PGCD est 37.' },
            {
              formula: '$\\dfrac{111}{185} = \\dfrac{111 \\div 37}{185 \\div 37} = \\dfrac{3}{5}$',
            },
          ],
        },
        {
          kind: 'rule',
          tag: 'Le résultat d’un calcul',
          body: [
            {
              p: 'Après un calcul de fractions, on cherche un facteur premier commun aux deux termes du résultat et on le simplifie, même si les fractions de départ étaient irréductibles.',
            },
            {
              formula: '$\\dfrac{a}{n} + \\dfrac{b}{n} = \\dfrac{a + b}{\\textcolor{#e11d48}{n}}$',
            },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple : une somme',
          body: [
            {
              formula: '$\\dfrac{11}{70} + \\dfrac{29}{70} = \\dfrac{40}{70} = \\dfrac{4}{7}$',
            },
            { p: '11 et 29 sont premiers, mais 40 et 70 ont encore le facteur commun 10 : on simplifie.' },
          ],
        },
        {
          kind: 'note',
          text: 'Quelle méthode choisir ? Les deux termes déjà décomposés : on barre les facteurs communs. Petits nombres : on repère un facteur commun, puis on recommence jusqu’à ce que le PGCD soit 1. Grands nombres : l’algorithme d’Euclide donne le PGCD, puis une seule division.',
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
          tag: 'Exemple 1 : simplifier $\\dfrac{342}{399}$ avec les facteurs premiers',
          body: [
            {
              steps: [
                '$342 = 2 \\times 3^2 \\times 19$ et $399 = 3 \\times 7 \\times 19$.',
                'Les facteurs communs sont 3 (une seule fois, car 3 n’est qu’une fois dans 399) et 19.',
                'On les barre dans le numérateur et dans le dénominateur.',
              ],
            },
            {
              formula:
                '$\\dfrac{342}{399} = \\dfrac{2 \\times 3^2 \\times 19}{3 \\times 7 \\times 19} = \\dfrac{2 \\times 3}{7} = \\dfrac{6}{7}$',
            },
            { concl: 'La fraction irréductible est $\\dfrac{6}{7}$.' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple 2 : $\\dfrac{299}{341}$ est-elle irréductible ?',
          body: [
            {
              steps: [
                'Ni 2, ni 3, ni 5 ne divisent les deux nombres, mais cela ne suffit pas : on décompose.',
                '$299 = 13 \\times 23$ et $341 = 11 \\times 31$.',
                'Aucun facteur premier n’est commun : le PGCD est 1.',
              ],
            },
            { concl: '$\\dfrac{299}{341}$ est irréductible : on la laisse telle quelle.' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple 3 : $\\dfrac{357}{510}$ en une seule étape',
          body: [
            {
              steps: ['$510 = 357 \\times 1 + 153$', '$357 = 153 \\times 2 + 51$', '$153 = 51 \\times 3 + 0$'],
            },
            { p: 'Le dernier reste qui n’est pas 0 est 51 : le PGCD est 51.' },
            {
              formula: '$\\dfrac{357}{510} = \\dfrac{357 \\div 51}{510 \\div 51} = \\dfrac{7}{10}$',
            },
            { concl: 'La fraction irréductible est $\\dfrac{7}{10}$.' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple 4 : les pommiers du verger',
          body: [
            {
              p: 'Dans un verger, les $\\dfrac{13}{24}$ des arbres sont des pommiers, et les $\\dfrac{8}{13}$ des pommiers sont jeunes. Quelle fraction du verger est formée de jeunes pommiers ?',
            },
            {
              steps: [
                'On calcule : $\\dfrac{13}{24} \\times \\dfrac{8}{13} = \\dfrac{13 \\times 8}{24 \\times 13}$.',
                'Le résultat n’est pas irréductible : on décompose $8 = 2^3$ et $24 = 2^3 \\times 3$.',
              ],
            },
            {
              formula: '$\\dfrac{13 \\times 2^3}{2^3 \\times 3 \\times 13} = \\dfrac{1}{3}$',
            },
            { concl: 'Un tiers du verger est formé de jeunes pommiers.' },
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
          tag: 'Piège 1 : barrer un facteur une seule fois',
          body: [
            {
              p: 'Dans $\\dfrac{7^2 \\times 2}{7^2 \\times 3}$, le facteur 7 est deux fois dans chaque terme. Si on ne barre qu’un 7, il reste $\\dfrac{7 \\times 2}{7 \\times 3}$, qui se simplifie encore. On barre le facteur autant de fois qu’il est dans les deux : il reste $\\dfrac{2}{3}$.',
            },
          ],
        },
        {
          kind: 'trap',
          tag: 'Piège 2 : s’arrêter quand on ne voit plus de règle de 2, 3 ou 5',
          body: [
            {
              p: 'Ni 2, ni 3, ni 5 ne divisent à la fois 289 et 391, et pourtant $289 = 17^2$ et $391 = 17 \\times 23$ ont le facteur 17 : $\\dfrac{289}{391} = \\dfrac{17}{23}$. Une fraction n’est finie que si le PGCD est 1.',
            },
          ],
        },
        {
          kind: 'trap',
          tag: 'Piège 3 : diviser par un diviseur commun qui n’est pas le plus grand',
          body: [
            {
              p: '19 divise 76 et 114, mais $\\dfrac{76 \\div 19}{114 \\div 19} = \\dfrac{4}{6}$ n’est pas finie : 2 divise encore 4 et 6. Le PGCD est 38, et $\\dfrac{76}{114} = \\dfrac{2}{3}$.',
            },
          ],
        },
        {
          kind: 'trap',
          tag: 'Piège 4 : laisser le résultat tel quel',
          body: [
            {
              p: 'Les fractions $\\dfrac{11}{64}$ et $\\dfrac{13}{64}$ sont irréductibles, mais $\\dfrac{11}{64} + \\dfrac{13}{64} = \\dfrac{24}{64}$ ne l’est pas : $\\dfrac{24}{64} = \\dfrac{3}{8}$. Un résultat se vérifie toujours.',
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
              p: 'Donne la fraction irréductible égale à $\\dfrac{2 \\times 5^2 \\times 7}{5 \\times 7^2 \\times 11}$.',
            },
          ],
          solution: [
            'Les facteurs communs sont 5 (une fois) et 7 (une fois).',
            '$\\dfrac{2 \\times 5^2 \\times 7}{5 \\times 7^2 \\times 11} = \\dfrac{2 \\times 5}{7 \\times 11} = \\dfrac{10}{77}$.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 2',
          level: 'Facile',
          body: [
            {
              p: 'Parmi $\\dfrac{247}{289}$, $\\dfrac{323}{361}$ et $\\dfrac{217}{299}$, lesquelles sont irréductibles ? Simplifie les autres.',
            },
          ],
          solution: [
            '$247 = 13 \\times 19$ et $289 = 17^2$ : aucun facteur commun, $\\dfrac{247}{289}$ est irréductible.',
            '$323 = 17 \\times 19$ et $361 = 19^2$ : 19 est commun, donc $\\dfrac{323}{361} = \\dfrac{17}{19}$.',
            '$217 = 7 \\times 31$ et $299 = 13 \\times 23$ : aucun facteur commun, $\\dfrac{217}{299}$ est irréductible.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 3',
          level: 'Moyen',
          body: [
            {
              p: 'Décompose 255 et 306 en produits de facteurs premiers, puis écris $\\dfrac{255}{306}$ sous forme irréductible.',
            },
          ],
          solution: [
            '$255 = 3 \\times 5 \\times 17$ et $306 = 2 \\times 3^2 \\times 17$.',
            '$\\dfrac{255}{306} = \\dfrac{3 \\times 5 \\times 17}{2 \\times 3^2 \\times 17} = \\dfrac{5}{2 \\times 3} = \\dfrac{5}{6}$.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 4',
          level: 'Moyen',
          body: [
            {
              p: 'Avec l’algorithme d’Euclide, trouve le PGCD de 361 et 247, puis rends $\\dfrac{247}{361}$ irréductible en une seule division.',
            },
          ],
          solution: [
            '$361 = 247 \\times 1 + 114$, $247 = 114 \\times 2 + 19$, $114 = 19 \\times 6 + 0$.',
            'Le PGCD est 19, et $\\dfrac{247}{361} = \\dfrac{247 \\div 19}{361 \\div 19} = \\dfrac{13}{19}$.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 5',
          level: 'Moyen',
          body: [
            {
              p: 'Calcule $\\dfrac{14}{29} \\times \\dfrac{29}{70}$ et donne le résultat sous forme irréductible.',
            },
          ],
          solution: [
            '$\\dfrac{14}{29} \\times \\dfrac{29}{70} = \\dfrac{14 \\times 29}{29 \\times 70} = \\dfrac{14}{70}$.',
            '14 divise 70 : $\\dfrac{14}{70} = \\dfrac{14 \\div 14}{70 \\div 14} = \\dfrac{1}{5}$. Il reste 1 au numérateur, pas 0.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 6',
          level: 'Situation',
          body: [
            {
              p: 'Un collège compte 299 élèves, dont 253 mangent à la cantine. Quelle fraction des élèves mange à la cantine ? Écris-la sous forme irréductible.',
            },
          ],
          solution: [
            'La fraction est $\\dfrac{253}{299}$. On décompose : $253 = 11 \\times 23$ et $299 = 13 \\times 23$.',
            'Le facteur commun est 23 : $\\dfrac{253}{299} = \\dfrac{11 \\times 23}{13 \\times 23} = \\dfrac{11}{13}$.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 7',
          level: 'Vers le brevet',
          body: [
            {
              p: 'Un libraire a 836 romans et 741 bandes dessinées. Il veut faire des paquets identiques qui utilisent tous les livres.',
            },
            {
              p: '1) Peut-il faire 20 paquets ? 2) Avec l’algorithme d’Euclide, trouve le plus grand nombre de paquets possible, puis le contenu d’un paquet. 3) Écris $\\dfrac{741}{836}$ sous forme irréductible.',
            },
          ],
          solution: [
            '1) Non : $836 = 20 \\times 41 + 16$, donc 20 ne divise pas 836.',
            '2) $836 = 741 \\times 1 + 95$, $741 = 95 \\times 7 + 76$, $95 = 76 \\times 1 + 19$, $76 = 19 \\times 4 + 0$ : le PGCD est 19, donc 19 paquets au plus.',
            'Chaque paquet contient $836 \\div 19 = 44$ romans et $741 \\div 19 = 39$ bandes dessinées.',
            '3) On divise par le PGCD : $\\dfrac{741}{836} = \\dfrac{741 \\div 19}{836 \\div 19} = \\dfrac{39}{44}$.',
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
              'On barre chaque facteur premier commun, autant de fois qu’il est dans les deux termes',
              '$\\dfrac{c \\times u}{c \\times v} = \\dfrac{u}{v}$',
              '$\\dfrac{66}{99} = \\dfrac{2 \\times 3 \\times 11}{3^2 \\times 11} = \\dfrac{2}{3}$',
              'Pas un seul facteur barré une fois ; s’il ne reste rien, c’est 1',
            ],
            [
              'Irréductible : aucun facteur premier commun',
              '$\\mathrm{PGCD}(a ; b) = 1$',
              '$\\mathrm{PGCD}(25 ; 63) = 1$',
              'Ni 2, ni 3, ni 5 ne suffisent : on décompose',
            ],
            [
              'On divise les deux termes par leur PGCD',
              '$\\dfrac{a \\div g}{b \\div g}$',
              '$\\dfrac{111}{185} = \\dfrac{3}{5}$',
              'Pas un diviseur commun plus petit que le PGCD',
            ],
            [
              'Après un calcul, on cherche un facteur commun dans le résultat',
              '$\\dfrac{a + b}{n}$ se vérifie',
              '$\\dfrac{11}{70} + \\dfrac{29}{70} = \\dfrac{4}{7}$',
              'Des fractions irréductibles peuvent donner un résultat réductible',
            ],
          ],
        },
        {
          kind: 'note',
          text: 'Au brevet : écris le calcul, puis le résultat, puis le résultat sous forme irréductible ; montre le PGCD (décompositions ou divisions d’Euclide) ou les facteurs communs barrés, et réponds à la question par une phrase.',
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
      q: '$\\dfrac{2^2 \\times 3 \\times 7}{2 \\times 3^2 \\times 5}$ sous forme irréductible :',
      options: ['$\\dfrac{14}{15}$', '$\\dfrac{42}{45}$', '$\\dfrac{7}{5}$'],
      correct: 0,
      why: 'On barre 2 et 3 : il reste $\\dfrac{2 \\times 7}{3 \\times 5}$. $\\dfrac{42}{45}$ n’est pas finie : 3 divise encore 42 et 45.',
    },
    {
      q: 'Quelle fraction est irréductible ?',
      options: ['$\\dfrac{57}{95}$', '$\\dfrac{69}{115}$', '$\\dfrac{51}{77}$'],
      correct: 2,
      why: '$51 = 3 \\times 17$ et $77 = 7 \\times 11$ : aucun facteur commun. Les deux autres ont le facteur 19 et le facteur 23.',
    },
    {
      q: 'Pour rendre $\\dfrac{76}{133}$ irréductible en une étape, on divise par :',
      options: ['$4$', '$19$', '$7$'],
      correct: 1,
      why: '$76 = 19 \\times 4$ et $133 = 19 \\times 7$ : le PGCD est 19, et $\\dfrac{76}{133} = \\dfrac{4}{7}$.',
    },
    {
      q: 'On divise $\\dfrac{56}{98}$ par 2 et on obtient $\\dfrac{28}{49}$. Est-ce fini ?',
      options: [
        'Oui, la fraction est finie',
        'Non : 2 divise encore les deux termes',
        'Non : 7 divise encore les deux termes',
      ],
      correct: 2,
      why: '49 est impair, mais 28 et 49 sont dans la table de 7 : $\\dfrac{28}{49} = \\dfrac{4}{7}$.',
    },
    {
      q: '$\\dfrac{7}{15} \\times \\dfrac{9}{14}$ sous forme irréductible :',
      options: ['$\\dfrac{63}{210}$', '$\\dfrac{3}{10}$', '$\\dfrac{16}{29}$'],
      correct: 1,
      why: '$63 = 3^2 \\times 7$ et $210 = 2 \\times 3 \\times 5 \\times 7$ : on barre 3 et 7, il reste $\\dfrac{3}{10}$.',
    },
    {
      q: 'La fraction $\\dfrac{a}{b}$ est irréductible quand :',
      options: ['$\\mathrm{PGCD}(a ; b) = 1$', '$a$ et $b$ sont impairs', '$a$ ne divise pas $b$'],
      correct: 0,
      why: 'C’est dire que $a$ et $b$ n’ont aucun facteur premier commun. Deux nombres impairs peuvent avoir un facteur commun.',
    },
    {
      q: '$\\dfrac{2 \\times 5}{2 \\times 5 \\times 7}$ sous forme irréductible :',
      options: ['$\\dfrac{0}{7}$', '$\\dfrac{5}{7}$', '$\\dfrac{1}{7}$'],
      correct: 2,
      why: 'On barre 2 et 5 partout : il reste 1 au numérateur, pas 0.',
    },
  ],
  next: 'La leçon suivante étudie les multiples communs de deux nombres, de quoi additionner des fractions de dénominateurs différents.',
};
