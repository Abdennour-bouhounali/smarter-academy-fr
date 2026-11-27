/**
 * « La page de révision » of the lesson (docs/architecture/REVISION_PAGE.md §2): plain data, drawn by features/revision.
 * The rules are those of the knowledge sheets (world/knowledge.js) and of the board memo, in their words; the numbers are
 * the page's own — nothing is copied from the exercise bank, nor taken from the lesson's world. Every equality between
 * numbers is computed by features/revision/revision.test.js. The figures (common/components/geoFigure.js) show the two
 * triangles APART, each drawn to scale from its lengths or its angles (the coordinates were computed, not drawn by eye).
 */
export const REVISION = {
  intro:
    'Cette page reprend toute la leçon. Lis-la étape par étape, et fais chaque exercice sur ta feuille avant d’ouvrir le corrigé. Les longueurs sont en centimètres quand l’unité n’est pas écrite. Les figures ne sont pas à l’échelle de la page : fie-toi aux nombres.',
  steps: [
    {
      id: 'recall',
      short: 'Rappel',
      title: 'Rappel : produits en croix et somme des angles',
      blocks: [
        {
          kind: 'text',
          text: 'Deux choses de 4e servent partout ici. Deux quotients égaux ont des produits en croix égaux, ce qui permet de calculer un terme inconnu. Et les trois angles d’un triangle ont pour somme $180^\\circ$.',
        },
        {
          kind: 'rule',
          tag: null,
          body: [
            { formula: '$\\dfrac{a}{b} = \\dfrac{c}{d} \\Leftrightarrow a \\times d = b \\times c$' },
            { formula: '$\\widehat{A} + \\widehat{B} + \\widehat{C} = 180^\\circ$' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple',
          body: [
            {
              p: '$\\dfrac{6}{15} = \\dfrac{x}{25}$ donne $x = \\dfrac{6 \\times 25}{15} = 10$. Un triangle dont deux angles valent $44^\\circ$ et $71^\\circ$ a un troisième angle de $180 - 44 - 71 = 65$ degrés.',
            },
          ],
        },
        {
          kind: 'task',
          title: 'Vérifie',
          level: null,
          body: [
            {
              p: 'Trouve $x$ tel que $\\dfrac{7}{x} = \\dfrac{14}{20}$, puis le troisième angle d’un triangle dont deux angles valent $38^\\circ$ et $90^\\circ$.',
            },
          ],
          solution: [
            '$x = \\dfrac{7 \\times 20}{14} = 10$ et $180 - 38 - 90 = 52$ : le troisième angle mesure $52^\\circ$.',
          ],
        },
      ],
    },
    {
      id: 'lesson',
      short: 'Leçon',
      title: 'Ce que dit la leçon',
      blocks: [
        {
          kind: 'rule',
          tag: 'Triangles semblables',
          body: [
            {
              p: 'Deux triangles sont semblables quand ils ont la même forme : l’un est l’autre agrandi ou réduit, posé n’importe où, tourné ou retourné. Ils n’ont pas besoin d’avoir un sommet en commun.',
            },
          ],
        },
        {
          kind: 'figure',
          figure: {
            points: {
              A: [0, 0],
              B: [6, 0],
              C: [0.25, 3.992],
              D: [12, 2],
              E: [21.781, 4.079],
              F: [17.752, 18.528],
            },
            segments: [
              { from: 'A', to: 'B', label: '6' },
              { from: 'B', to: 'C', label: '7' },
              { from: 'C', to: 'A', label: '4' },
              { from: 'D', to: 'E', label: '10' },
              { from: 'E', to: 'F', label: '15' },
              { from: 'F', to: 'D', label: '17,5' },
            ],
            polygons: [{ points: ['D', 'E', 'F'], tone: 'indigo' }],
            ariaLabel:
              'Deux triangles posés à part : ABC de côtés AB = 6, BC = 7 et CA = 4, et DEF de côtés DE = 10, EF = 15 et FD = 17,5',
            maxWidth: 300,
          },
        },
        {
          kind: 'rule',
          tag: 'Par les côtés : on les range',
          body: [
            {
              p: 'On range les côtés de chaque triangle du plus petit au plus grand. Si les trois quotients « côté du second triangle sur côté du premier » sont égaux, les triangles sont semblables. Les côtés ainsi associés sont homologues.',
            },
            {
              formula:
                '$\\dfrac{\\text{petit}}{\\textcolor{#e11d48}{\\text{petit}}} = \\dfrac{\\text{moyen}}{\\textcolor{#e11d48}{\\text{moyen}}} = \\dfrac{\\text{grand}}{\\textcolor{#e11d48}{\\text{grand}}}$',
            },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple',
          body: [
            {
              p: 'Sur la figure, $CA < AB < BC$ et $DE < EF < FD$ : $\\dfrac{10}{4} = \\dfrac{15}{6} = \\dfrac{17{,}5}{7} = 2{,}5$. Les triangles $ABC$ et $DEF$ sont semblables.',
            },
          ],
        },
        {
          kind: 'rule',
          tag: 'Les sommets et les côtés homologues',
          body: [
            {
              p: 'Deux sommets sont homologues quand leurs angles sont égaux. Le côté opposé à un angle est homologue du côté opposé à l’angle égal. Écris les noms dans le bon ordre : le plus petit côté va avec le plus petit, pas le premier nom avec le premier nom.',
            },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple',
          body: [
            {
              p: 'Sur la figure, $CA$ (le plus petit) est homologue de $DE$, $AB$ de $EF$ et $BC$ de $FD$. Donc $C$ correspond à $D$, $A$ à $E$ et $B$ à $F$.',
            },
          ],
        },
        {
          kind: 'figure',
          figure: {
            points: {
              A: [0, 0],
              B: [6, 0],
              C: [4.344, 3.394],
              D: [10, 0.5],
              E: [14.951, 1.196],
              F: [12.455, 8.055],
            },
            segments: [
              ['A', 'B'],
              ['B', 'C'],
              ['C', 'A'],
              ['D', 'E'],
              ['E', 'F'],
              ['F', 'D'],
            ],
            polygons: [{ points: ['D', 'E', 'F'], tone: 'indigo' }],
            angles: [
              { at: 'A', from: 'B', to: 'C', label: '38°' },
              { at: 'B', from: 'A', to: 'C', label: '64°' },
              { at: 'D', from: 'E', to: 'F', label: '64°' },
              { at: 'E', from: 'D', to: 'F', label: '78°' },
            ],
            ariaLabel:
              'Deux triangles posés à part : ABC avec des angles de 38° en A et 64° en B, et DEF avec des angles de 64° en D et 78° en E',
            maxWidth: 300,
          },
        },
        {
          kind: 'rule',
          tag: 'Par les angles : deux suffisent',
          body: [
            {
              p: 'Si deux angles d’un triangle sont égaux à deux angles d’un autre triangle, les deux triangles sont semblables. Le troisième angle est égal aussi, car la somme des angles d’un triangle vaut $180^\\circ$. Un seul angle égal ne suffit pas.',
            },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple',
          body: [
            {
              p: 'Sur la figure, $\\widehat{C} = 180 - 38 - 64 = 78$ degrés et $\\widehat{F} = 180 - 64 - 78 = 38$ degrés. Les angles de $ABC$ sont $38^\\circ$, $64^\\circ$, $78^\\circ$, ceux de $DEF$ sont les mêmes : les triangles sont semblables, avec $A$ et $F$, $B$ et $D$, $C$ et $E$ homologues.',
            },
          ],
        },
        {
          kind: 'rule',
          tag: 'Le coefficient $k$ : agrandir ou réduire',
          body: [
            {
              p: 'Le coefficient $k$ est le quotient de deux côtés homologues : on passe du premier triangle au second en multipliant toutes les longueurs par $k$. Si $k > 1$, c’est un agrandissement ; si $k < 1$, c’est une réduction. De $DEF$ à $ABC$, le coefficient est l’inverse.',
            },
            {
              formula: '$k = \\dfrac{\\text{côté du second}}{\\textcolor{#e11d48}{\\text{côté homologue du premier}}}$',
            },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple',
          body: [
            {
              p: 'De $ABC$ à $DEF$ : $k = \\dfrac{10}{4} = 2{,}5$, un agrandissement. De $DEF$ à $ABC$ : $\\dfrac{4}{10} = 0{,}4$, une réduction.',
            },
          ],
        },
        {
          kind: 'rule',
          tag: 'Calculer une longueur',
          body: [
            {
              p: 'Dans deux triangles semblables, une longueur du second est $k$ fois la longueur homologue du premier. On trouve $k$ avec un couple de côtés connus, puis on l’applique au côté cherché.',
            },
            { formula: '$\\text{côté du second} = k \\times \\text{son homologue}$' },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple',
          body: [
            {
              p: 'Un triangle de côtés $4$, $6$, $7$ est agrandi : son plus grand côté devient $10{,}5$. Alors $k = \\dfrac{10{,}5}{7} = 1{,}5$ et les autres côtés mesurent $4 \\times 1{,}5 = 6$ et $6 \\times 1{,}5 = 9$.',
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
          tag: 'Exemple 1 : par les côtés',
          body: [
            {
              p: '$ABC$ a pour côtés $6$, $9$ et $10$ ; $PQR$ a pour côtés $15$, $9$ et $13{,}5$. Les triangles sont-ils semblables ?',
            },
            {
              steps: [
                'On range les côtés : $6 < 9 < 10$ pour $ABC$ et $9 < 13{,}5 < 15$ pour $PQR$.',
                'On calcule les trois quotients : $\\dfrac{9}{6} = 1{,}5$, $\\dfrac{13{,}5}{9} = 1{,}5$ et $\\dfrac{15}{10} = 1{,}5$.',
              ],
            },
            { concl: 'Les trois quotients sont égaux : les triangles sont semblables, avec $k = 1{,}5$.' },
          ],
        },
        {
          kind: 'figure',
          figure: {
            points: {
              A: [0, 0],
              B: [6, 0],
              C: [4.344, 3.394],
              D: [10, 0.5],
              E: [14.951, 1.196],
              F: [12.455, 8.055],
            },
            segments: [
              ['A', 'B'],
              ['B', 'C'],
              ['C', 'A'],
              ['D', 'E'],
              ['E', 'F'],
              ['F', 'D'],
            ],
            polygons: [{ points: ['D', 'E', 'F'], tone: 'indigo' }],
            angles: [
              { at: 'A', from: 'B', to: 'C', label: '38°' },
              { at: 'B', from: 'A', to: 'C', label: '64°' },
              { at: 'D', from: 'E', to: 'F', label: '64°' },
              { at: 'E', from: 'D', to: 'F', label: '78°' },
            ],
            ariaLabel: 'Deux triangles posés à part : ABC avec 38° en A et 64° en B, DEF avec 64° en D et 78° en E',
            maxWidth: 260,
          },
        },
        {
          kind: 'example',
          tag: 'Exemple 2 : par les angles (figure ci-dessus)',
          body: [
            {
              p: 'Les triangles $ABC$ et $DEF$ sont-ils semblables ? Quels sommets sont homologues ?',
            },
            {
              steps: [
                '$ABC$ : $\\widehat{A} = 38^\\circ$, $\\widehat{B} = 64^\\circ$, donc $\\widehat{C} = 180 - 38 - 64 = 78$ degrés.',
                '$DEF$ : $\\widehat{D} = 64^\\circ$, $\\widehat{E} = 78^\\circ$, donc $\\widehat{F} = 180 - 64 - 78 = 38$ degrés.',
              ],
            },
            {
              concl:
                'Les angles sont les mêmes, $38^\\circ$, $64^\\circ$ et $78^\\circ$ : les triangles sont semblables. Les homologues sont $A$ et $F$, $B$ et $D$, $C$ et $E$.',
            },
          ],
        },
        {
          kind: 'figure',
          figure: {
            points: {
              A: [0, 0],
              B: [10, 0],
              C: [8, 13.856],
              D: [13, 0],
              E: [19, 0],
              F: [17.8, 8.314],
            },
            segments: [
              { from: 'A', to: 'B', label: '10' },
              { from: 'B', to: 'C', label: '14' },
              { from: 'C', to: 'A', label: '16' },
              { from: 'D', to: 'E', label: '6' },
              ['E', 'F'],
              { from: 'F', to: 'D', label: '?' },
            ],
            polygons: [{ points: ['D', 'E', 'F'], tone: 'indigo' }],
            ariaLabel:
              'Une plaque triangulaire ABC de côtés 10, 14 et 16, et sa réduction DEF dont le plus petit côté mesure 6 et le plus grand est cherché',
            maxWidth: 260,
          },
        },
        {
          kind: 'example',
          tag: 'Exemple 3 : une situation',
          body: [
            {
              p: 'Une plaque triangulaire $ABC$ a pour côtés $10$, $14$ et $16$ dm. On en découpe une réduction $DEF$ dont le plus petit côté mesure $6$ dm. Quelle est la longueur du plus grand côté de $DEF$ ?',
            },
            {
              steps: [
                'Le plus petit côté de $DEF$ est homologue du plus petit de $ABC$ : $k = \\dfrac{6}{10} = 0{,}6$.',
                'Le plus grand côté de $DEF$ est homologue de $16$ : $16 \\times 0{,}6 = 9{,}6$.',
              ],
            },
            {
              concl:
                'Le plus grand côté de $DEF$ mesure $9{,}6$ dm. Le coefficient $0{,}6$ est inférieur à 1, c’est bien une réduction.',
            },
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
          tag: 'Piège 1 : associer selon l’ordre des noms',
          body: [
            {
              p: 'Avec $KL = 7$, $LM = 4$, $MK = 6$ et $RS = 10$, $ST = 15$, $TR = 17{,}5$, on n’écrit pas $\\dfrac{RS}{KL}$ juste parce que $R$ et $K$ sont les premières lettres : $\\dfrac{10}{7} \\neq \\dfrac{15}{4}$. Les noms ne rangent pas les côtés par taille : le plus petit côté, $LM = 4$, va avec le plus petit, $RS = 10$.',
            },
          ],
        },
        {
          kind: 'trap',
          tag: 'Piège 2 : ajouter au lieu de multiplier',
          body: [
            {
              p: 'Un triangle de côtés $4$, $6$, $7$ est agrandi et son plus petit côté devient $10$. Ajouter la même différence ($10 - 4 = 6$) donnerait $7 + 6 = 13$ pour le grand côté, mais $\\dfrac{10}{4} \\neq \\dfrac{13}{7}$. Les côtés sont multipliés par $k = 2{,}5$ : le grand côté mesure $7 \\times 2{,}5 = 17{,}5$.',
            },
          ],
        },
        {
          kind: 'trap',
          tag: 'Piège 3 : un seul angle égal',
          body: [
            {
              p: 'Deux triangles qui ont chacun un angle de $50^\\circ$ ne sont pas forcément semblables : si leurs autres angles sont $60^\\circ$ et $70^\\circ$ d’un côté, $85^\\circ$ et $45^\\circ$ de l’autre, ils n’ont pas la même forme. Il faut deux angles égaux.',
            },
          ],
        },
        {
          kind: 'trap',
          tag: 'Piège 4 : le coefficient à l’envers',
          body: [
            {
              p: 'De $ABC$ à $DEF$, $k = \\dfrac{DE}{AB}$ et non $\\dfrac{AB}{DE}$. Si le second triangle est plus grand, $k$ doit dépasser 1 : trouver $0{,}4$ pour un agrandissement montre que le quotient est à l’envers.',
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
              p: '$ABC$ a pour côtés $5$, $7$ et $9$ ; $DEF$ a pour côtés $30$, $42$ et $54$. Les triangles sont-ils semblables ? Si oui, donne $k$ de $ABC$ à $DEF$.',
            },
          ],
          solution: [
            'Les côtés sont déjà rangés : $\\dfrac{30}{5} = \\dfrac{42}{7} = \\dfrac{54}{9} = 6$.',
            'Les triangles sont semblables, avec $k = 6$ : un agrandissement.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 2',
          level: 'Facile',
          body: [
            {
              p: '$KLM$ a pour côtés $7$, $10$ et $11$ ; $UVW$ a pour côtés $28$, $40$ et $45$. Sont-ils semblables ?',
            },
          ],
          solution: [
            '$\\dfrac{28}{7} = 4$ et $\\dfrac{40}{10} = 4$, mais $\\dfrac{45}{11} \\neq 4$ (car $11 \\times 4 = 44$).',
            'Un quotient diffère des deux autres : ces deux triangles n’ont pas la même forme.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 3',
          level: 'Moyen',
          body: [
            {
              p: '$ABC$ a des angles de $52^\\circ$ en $A$ et $71^\\circ$ en $B$. $DEF$ a des angles de $57^\\circ$ en $D$ et $71^\\circ$ en $E$. Les triangles sont-ils semblables ? Quels sommets sont homologues ?',
            },
          ],
          solution: [
            '$\\widehat{C} = 180 - 52 - 71 = 57$ degrés et $\\widehat{F} = 180 - 57 - 71 = 52$ degrés.',
            'Les angles de $ABC$ sont $52^\\circ$, $71^\\circ$, $57^\\circ$ ; ceux de $DEF$ sont $57^\\circ$, $71^\\circ$, $52^\\circ$ : les triangles sont semblables, avec $A$ et $F$, $B$ et $E$, $C$ et $D$ homologues.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 4',
          level: 'Moyen',
          body: [
            {
              p: '$ABC$ a pour côtés $6$, $10$ et $11$. $DEF$ est un agrandissement de $ABC$ dont le plus petit côté mesure $21$. Calcule $k$ et les deux autres côtés de $DEF$.',
            },
          ],
          solution: [
            'Le plus petit côté de $DEF$ est homologue de $6$ : $k = \\dfrac{21}{6} = 3{,}5$.',
            '$10 \\times 3{,}5 = 35$ et $11 \\times 3{,}5 = 38{,}5$ : les côtés de $DEF$ mesurent $21$, $35$ et $38{,}5$.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 5',
          level: 'Moyen',
          body: [
            {
              p: '$ABC$ a pour côtés $25$, $35$ et $40$. $DEF$ est une réduction de $ABC$ dont le plus grand côté mesure $16$. Calcule $k$, puis les deux autres côtés de $DEF$. Quel est le coefficient de $DEF$ à $ABC$ ?',
            },
          ],
          solution: [
            'Le plus grand côté de $DEF$ est homologue de $40$ : $k = \\dfrac{16}{40} = 0{,}4$, inférieur à 1.',
            '$25 \\times 0{,}4 = 10$ et $35 \\times 0{,}4 = 14$ : les côtés de $DEF$ mesurent $10$, $14$ et $16$.',
            'De $DEF$ à $ABC$, le coefficient est l’inverse : $\\dfrac{40}{16} = 2{,}5$.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 6',
          level: 'Situation',
          body: [
            {
              p: 'Un abri triangulaire a pour côtés $7{,}5$ m, $10$ m et $12{,}5$ m. Sa maquette est un triangle semblable dont le plus petit côté mesure $15$ cm. Quelles sont les longueurs de la maquette ?',
            },
          ],
          solution: [
            'On met les longueurs dans la même unité : $7{,}5$ m $= 750$ cm.',
            '$k = \\dfrac{15}{750} = \\dfrac{1}{50}$, une réduction.',
            '$1\\,000 \\div 50 = 20$ et $1\\,250 \\div 50 = 25$ : la maquette a pour côtés $15$ cm, $20$ cm et $25$ cm.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 7',
          level: 'Vers le brevet',
          body: [
            {
              p: 'Dans $ABC$, $\\widehat{A} = 40^\\circ$, $\\widehat{B} = 75^\\circ$, $AB = 10$, $BC = 14$ et $CA = 16$. Dans $DEF$, $\\widehat{D} = 75^\\circ$, $\\widehat{F} = 65^\\circ$ et $DE = 40$. Montre que les triangles sont semblables, puis calcule $EF$ et $FD$.',
            },
          ],
          solution: [
            '$\\widehat{C} = 180 - 40 - 75 = 65$ degrés et $\\widehat{E} = 180 - 75 - 65 = 40$ degrés.',
            'Deux angles de $ABC$ ($40^\\circ$ et $75^\\circ$, aussi $65^\\circ$) sont égaux à deux angles de $DEF$ : les triangles sont semblables, avec $A$ et $E$, $B$ et $D$, $C$ et $F$ homologues.',
            'Les côtés homologues sont $AB$ et $ED$, $CA$ et $EF$, $BC$ et $DF$. Alors $k = \\dfrac{40}{10} = 4$.',
            '$EF = 16 \\times 4 = 64$ et $FD = 14 \\times 4 = 56$.',
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
              'Par les côtés : on range, les trois quotients sont égaux',
              '$\\dfrac{\\text{petit}}{\\text{petit}} = \\dfrac{\\text{moyen}}{\\text{moyen}} = \\dfrac{\\text{grand}}{\\text{grand}}$',
              '$\\dfrac{10}{4} = \\dfrac{15}{6} = \\dfrac{17{,}5}{7}$',
              'Ranger par taille, pas dans l’ordre des noms',
            ],
            [
              'Par les angles : deux angles égaux suffisent',
              '$\\widehat{A} = \\widehat{D}$ et $\\widehat{B} = \\widehat{E}$',
              '$180 - 38 - 64 = 78$',
              'Un seul angle égal ne suffit pas',
            ],
            [
              'Les sommets et les côtés homologues',
              'angle égal, sommet associé',
              '$A$ et $F$, $B$ et $D$, $C$ et $E$',
              'Le côté opposé à l’angle égal',
            ],
            [
              'Le coefficient $k$ : agrandir ($k > 1$) ou réduire ($k < 1$)',
              '$k = \\dfrac{\\text{côté du second}}{\\text{côté du premier}}$',
              '$k = \\dfrac{10}{4} = 2{,}5$',
              'De l’autre sens, c’est l’inverse de $k$',
            ],
            [
              'Calculer une longueur',
              '$\\text{second} = k \\times \\text{premier}$',
              '$7 \\times 2{,}5 = 17{,}5$',
              'On multiplie, on n’ajoute pas',
            ],
          ],
        },
        {
          kind: 'note',
          text: 'Au brevet : justifie la ressemblance (« les angles sont égaux deux à deux » ou « les côtés, rangés, sont proportionnels »), nomme les sommets ou côtés homologues, calcule $k$ avec un couple connu, puis multiplie et donne l’unité.',
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
      q: 'Pour comparer les côtés de deux triangles, comment les associe-t-on ?',
      options: [
        'dans l’ordre des noms des sommets',
        'en les rangeant du plus petit au plus grand',
        'en ajoutant la même longueur à chaque côté',
      ],
      correct: 1,
      why: 'Le plus petit côté va avec le plus petit, le plus grand avec le plus grand : les noms ne rangent pas les côtés par taille.',
    },
    {
      q: '$ABC$ a pour côtés $6$, $9$, $10$ et $DEF$ a pour côtés $9$, $13{,}5$, $15$. Que vaut $k$, de $ABC$ à $DEF$ ?',
      options: ['$1{,}5$', '$\\dfrac{2}{3}$', '$3$'],
      correct: 0,
      why: '$k = \\dfrac{9}{6} = 1{,}5$, et $\\dfrac{13{,}5}{9} = \\dfrac{15}{10} = 1{,}5$.',
    },
    {
      q: 'Un triangle a des angles de $35^\\circ$ et $80^\\circ$. Que mesure son troisième angle ?',
      options: ['$115^\\circ$', '$75^\\circ$', '$65^\\circ$'],
      correct: 2,
      why: '$180 - 35 - 80 = 65$ : la somme des angles d’un triangle vaut $180^\\circ$.',
    },
    {
      q: 'Deux triangles ont chacun un angle de $50^\\circ$. Sont-ils forcément semblables ?',
      options: ['non, un angle égal ne suffit pas', 'oui, toujours', 'oui, s’ils ont le même périmètre'],
      correct: 0,
      why: 'Il faut deux angles égaux (le troisième suit) ou trois quotients de côtés égaux.',
    },
    {
      q: 'Le coefficient de $ABC$ à $DEF$ vaut $\\dfrac{5}{4}$. Que vaut-il de $DEF$ à $ABC$ ?',
      options: [
        '$\\dfrac{5}{4}$, une réduction',
        '$\\dfrac{4}{5}$, un agrandissement',
        '$\\dfrac{4}{5}$, une réduction',
      ],
      correct: 2,
      why: 'On prend l’inverse, $\\dfrac{4}{5} = 0{,}8$, inférieur à 1 : c’est une réduction.',
    },
    {
      q: 'Deux triangles sont semblables avec $k = 2{,}5$. Un côté du premier mesure $6$. Son homologue dans le second mesure :',
      options: ['$15$', '$3{,}5$', '$2{,}4$'],
      correct: 0,
      why: '$6 \\times 2{,}5 = 15$ : on multiplie par $k$.',
    },
    {
      q: '$ABC$ a pour côtés $4$, $6$, $7$ et $DEF$ a pour côtés $10$, $15$, $17$. Sont-ils semblables ?',
      options: [
        'oui, car les deux plus petits quotients valent $2{,}5$',
        'non, car $\\dfrac{17}{7} \\neq 2{,}5$',
        'oui, car tous les côtés de $DEF$ sont plus grands',
      ],
      correct: 1,
      why: '$\\dfrac{10}{4} = \\dfrac{15}{6} = 2{,}5$, mais $7 \\times 2{,}5 = 17{,}5$ et non $17$ : le troisième quotient diffère.',
    },
  ],
  next: 'La leçon suivante : « Thalès dans le papillon », deux triangles semblables qui partagent un sommet.',
};
