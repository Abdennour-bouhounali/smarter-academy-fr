/**
 * « La page de révision » of the lesson (docs/architecture/REVISION_PAGE.md §2): plain data, drawn by features/revision.
 * The rules are those of the knowledge sheets (world/knowledge.js) and of the board memo, in their words; the numbers are
 * the page's own — nothing is copied from the exercise bank. Every equality between numbers is computed by
 * features/revision/revision.test.js. The reciprocal is NOT here: it is the next lesson's (« reciproque-de-thales »).
 * The figures (common/components/geoFigure.js) are computed, not drawn by eye: the two lines of a butterfly meet at O,
 * the parallels are parallel, and every length is in proportion to its label (the nested triangle is the Algerian
 * page's, whose coordinates were checked).
 */
export const REVISION = {
  intro:
    'Cette page reprend toute la leçon. Lis-la étape par étape, et fais chaque exercice sur ta feuille avant d’ouvrir le corrigé. Les longueurs sont en centimètres quand l’unité n’est pas écrite.',
  steps: [
    {
      id: 'recall',
      short: 'Rappel',
      title: 'Rappel : les produits en croix',
      blocks: [
        {
          kind: 'text',
          text: 'Deux quotients égaux ont des produits en croix égaux. On s’en sert pour calculer un terme inconnu.',
        },
        {
          kind: 'rule',
          tag: null,
          body: [{ formula: '$\\dfrac{a}{b} = \\dfrac{c}{d} \\;\\Leftrightarrow\\; a \\times d = b \\times c$' }],
        },
        {
          kind: 'example',
          tag: 'Exemple',
          body: [
            {
              p: '$\\dfrac{4}{6} = \\dfrac{10}{15}$ car $4 \\times 15 = 6 \\times 10$. Et $\\dfrac{3}{5} = \\dfrac{x}{20}$ donne $x = \\dfrac{3 \\times 20}{5} = 12$.',
            },
          ],
        },
        {
          kind: 'task',
          title: 'Vérifie',
          level: null,
          body: [{ p: 'Trouve $x$ tel que $\\dfrac{6}{x} = \\dfrac{9}{12}$.' }],
          solution: ['$9 \\times x = 6 \\times 12$, donc $x = \\dfrac{6 \\times 12}{9} = 8$.'],
        },
      ],
    },
    {
      id: 'lesson',
      short: 'La leçon',
      title: 'La leçon',
      blocks: [
        {
          kind: 'figure',
          figure: {
            points: { O: [0, 0], A: [-2.806, 5.303], B: [1.871, 3.536], E: [4.209, -7.955], F: [-2.806, -5.303] },
            segments: [['A', 'E'], ['B', 'F'], { from: 'A', to: 'B', arrows: 1 }, { from: 'E', to: 'F', arrows: 1 }],
            polygons: [{ points: ['O', 'A', 'B'], tone: 'indigo' }],
            labels: { O: 'e' },
            ariaLabel:
              'Configuration du papillon : les droites (AE) et (BF) se coupent en O, et la droite (AB) est parallèle à la droite (EF)',
            maxWidth: 220,
          },
        },
        {
          kind: 'rule',
          tag: 'Le théorème de Thalès dans le papillon',
          body: [
            {
              p: 'Les points $A$, $O$, $E$ sont alignés, ainsi que les points $B$, $O$, $F$. Si les droites $(AB)$ et $(EF)$ sont parallèles, alors :',
            },
            {
              formula:
                '$\\dfrac{OA}{\\textcolor{#e11d48}{OE}} = \\dfrac{OB}{\\textcolor{#e11d48}{OF}} = \\dfrac{AB}{EF}$',
            },
            {
              p: 'Chaque longueur va avec celle de la même droite, de l’autre côté de $O$ : les longueurs du triangle $OAB$ en haut, celles du triangle $OEF$ en bas.',
            },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple',
          body: [
            {
              p: '$OA = 6$, $OE = 9$, $OB = 4$, $OF = 6$, $AB = 5$ et $EF = 7{,}5$ : $\\dfrac{6}{9} = \\dfrac{4}{6} = \\dfrac{5}{7{,}5} = \\dfrac{2}{3}$.',
            },
          ],
        },
        {
          kind: 'rule',
          tag: 'Pourquoi : le demi-tour',
          body: [
            {
              p: 'Le demi-tour de centre $O$ (la symétrie centrale) envoie $A$ sur la droite $(OE)$ et $B$ sur la droite $(OF)$, sans changer les longueurs. Le petit triangle se pose dans le grand, son côté reste parallèle à $(EF)$ : on retrouve les triangles emboîtés de 4e, et les mêmes rapports.',
            },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple',
          body: [
            {
              p: "Dans la figure, le demi-tour envoie $A$ en $A'$ sur $[OE]$ avec $OA' = 6$, et $B$ en $B'$ sur $[OF]$ avec $OB' = 4$ : $\\dfrac{OA'}{OE} = \\dfrac{6}{9}$, comme $\\dfrac{OA}{OE}$.",
            },
          ],
        },
        {
          kind: 'figure',
          figure: {
            points: { A: [6.875, 7.262], B: [0, 0], C: [20, 0], M: [2.75, 2.905], N: [14.75, 2.905] },
            segments: [['A', 'B'], ['A', 'C'], { from: 'B', to: 'C', arrows: 1 }, { from: 'M', to: 'N', arrows: 1 }],
            polygons: [{ points: ['A', 'M', 'N'], tone: 'indigo' }],
            ariaLabel:
              'Triangles emboîtés : triangle ABC, le point M sur [AB], le point N sur [AC], et la droite (MN) parallèle à la droite (BC)',
            maxWidth: 280,
          },
        },
        {
          kind: 'rule',
          tag: 'Emboîtés ou papillon : l’ordre des longueurs',
          body: [
            {
              p: 'Dans les deux figures, chaque longueur part du sommet commun et va avec celle de la même droite. Dans les triangles emboîtés, le grand côté contient le petit : $AB = AM + MB$. Dans le papillon, les deux longueurs d’une droite sont de part et d’autre de $O$ : on n’additionne rien.',
            },
            {
              formula:
                '$\\text{emboîtés : } \\dfrac{AM}{\\textcolor{#e11d48}{AB}} = \\dfrac{AN}{AC} \\qquad \\text{papillon : } \\dfrac{OA}{\\textcolor{#e11d48}{OE}} = \\dfrac{OB}{OF}$',
            },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple',
          body: [
            {
              p: 'Emboîtés : $AM = 6$ et $MB = 4$, donc $AB = 10$ et le rapport est $\\dfrac{6}{10}$. Papillon : $OA = 6$ et $OE = 9$, le rapport est $\\dfrac{6}{9}$, et non $\\dfrac{6}{15}$.',
            },
          ],
        },
        {
          kind: 'rule',
          tag: 'Calculer une longueur',
          body: [
            {
              p: 'Chaque longueur part du sommet : si l’énoncé donne une longueur qui traverse $O$, on enlève le morceau d’en face ($OE = AE - OA$). Puis on garde deux rapports, l’un avec l’inconnue, et on fait les produits en croix.',
            },
            {
              formula:
                '$\\dfrac{OA}{OE} = \\dfrac{OB}{OF} \\;\\Rightarrow\\; OF = \\textcolor{#e11d48}{\\dfrac{OB \\times OE}{OA}}$',
            },
          ],
        },
        {
          kind: 'example',
          tag: 'Exemple',
          body: [
            {
              p: '$OA = 6$, $AE = 15$ et $OB = 4$ : d’abord $OE = 15 - 6 = 9$, puis $OF = \\dfrac{4 \\times 9}{6} = 6$.',
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
          kind: 'figure',
          figure: {
            points: { O: [0, 0], R: [-4.468, 6.636], S: [2.436, 5.483], U: [6.703, -9.954], T: [-3.654, -8.225] },
            segments: [
              { from: 'O', to: 'R', label: '8' },
              { from: 'O', to: 'U', label: '12' },
              { from: 'O', to: 'S', label: '6' },
              ['O', 'T'],
              { from: 'R', to: 'S', arrows: 1 },
              { from: 'T', to: 'U', label: '10,5', arrows: 1 },
            ],
            labels: { O: 'e' },
            ariaLabel:
              'Papillon : les droites (RU) et (ST) se coupent en O, et (RS) est parallèle à (TU) ; OR = 8, OU = 12, OS = 6 et TU = 10,5',
            maxWidth: 220,
          },
        },
        {
          kind: 'example',
          tag: 'Exemple 1 : $(RS) \\parallel (TU)$, calcule $OT$ et $RS$',
          body: [
            {
              steps: [
                'Les points $R$, $O$, $U$ sont alignés, de même que $S$, $O$, $T$, et les droites $(RS)$ et $(TU)$ sont parallèles.',
                'D’après le théorème de Thalès : $\\dfrac{OR}{OU} = \\dfrac{OS}{OT} = \\dfrac{RS}{TU}$, soit $\\dfrac{8}{12} = \\dfrac{6}{OT} = \\dfrac{RS}{10{,}5}$.',
                '$OT = \\dfrac{6 \\times 12}{8} = 9$ et $RS = \\dfrac{8 \\times 10{,}5}{12} = 7$.',
              ],
            },
            { concl: '$OT = 9$ cm et $RS = 7$ cm.' },
          ],
        },
        {
          kind: 'figure',
          figure: {
            points: { O: [0, 0], A: [-3.061, 8.463], B: [3.517, 4.861], C: [4.082, -11.284], D: [-4.689, -6.482] },
            segments: [
              { from: 'O', to: 'A', label: '9' },
              ['O', 'C'],
              { from: 'O', to: 'B', label: '6' },
              ['O', 'D'],
              { from: 'A', to: 'B', arrows: 1 },
              { from: 'C', to: 'D', label: '10', arrows: 1 },
            ],
            labels: { O: 'e' },
            ariaLabel:
              'Papillon : les droites (AC) et (BD) se coupent en O, et (AB) est parallèle à (CD) ; OA = 9, OB = 6 et CD = 10',
            maxWidth: 220,
          },
        },
        {
          kind: 'example',
          tag: 'Exemple 2 : une longueur qui traverse le sommet',
          body: [
            {
              p: 'Les droites $(AC)$ et $(BD)$ se coupent en $O$, et $(AB) \\parallel (CD)$. On donne $AC = 21$, $OA = 9$, $OB = 6$ et $CD = 10$. Calcule $OD$, $AB$, puis $BD$.',
            },
            {
              steps: [
                '$AC$ traverse $O$ : depuis le sommet, $OC = 21 - 9 = 12$.',
                'D’après le théorème de Thalès : $\\dfrac{OA}{OC} = \\dfrac{OB}{OD} = \\dfrac{AB}{CD}$, soit $\\dfrac{9}{12} = \\dfrac{6}{OD} = \\dfrac{AB}{10}$.',
                '$OD = \\dfrac{6 \\times 12}{9} = 8$ et $AB = \\dfrac{9 \\times 10}{12} = 7{,}5$.',
                '$BD$ traverse $O$ : on recolle les deux morceaux, $BD = 6 + 8 = 14$.',
              ],
            },
            { concl: '$OD = 8$ cm, $AB = 7{,}5$ cm et $BD = 14$ cm.' },
          ],
        },
        {
          kind: 'figure',
          figure: {
            points: { O: [0, 0], A: [-20.356, 22.037], B: [24.427, 26.444], C: [8.142, -8.815], D: [-9.771, -10.578] },
            segments: [
              { from: 'O', to: 'A', label: '30 m' },
              { from: 'O', to: 'C', label: '12 m' },
              ['O', 'B'],
              ['O', 'D'],
              { from: 'A', to: 'B', dashed: true, arrows: 1 },
              { from: 'C', to: 'D', label: '18 m', arrows: 1 },
            ],
            labels: { O: 'e' },
            ariaLabel:
              'Un étang entre A et B ; les droites (AC) et (BD) se coupent au piquet O, et (CD) est parallèle à (AB) ; OA = 30 m, OC = 12 m et CD = 18 m',
            maxWidth: 260,
          },
        },
        {
          kind: 'example',
          tag: 'Exemple 3 : la largeur d’un étang',
          body: [
            {
              p: 'Pour connaître la largeur $AB$ d’un étang, Malik plante un piquet $O$, puis le piquet $C$ sur la droite $(AO)$ et le piquet $D$ sur la droite $(BO)$, de l’autre côté de $O$, de sorte que $(CD)$ soit parallèle à $(AB)$. Il mesure $OA = 30$ m, $OC = 12$ m et $CD = 18$ m.',
            },
            {
              steps: [
                'Les points $A$, $O$, $C$ sont alignés, de même que $B$, $O$, $D$, et $(AB) \\parallel (CD)$.',
                'D’après le théorème de Thalès : $\\dfrac{OA}{OC} = \\dfrac{AB}{CD}$, soit $\\dfrac{30}{12} = \\dfrac{AB}{18}$.',
                '$AB = \\dfrac{30 \\times 18}{12} = 45$.',
              ],
            },
            { concl: 'L’étang mesure 45 m de large entre $A$ et $B$.' },
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
          tag: 'Piège 1 : le partenaire d’en face',
          body: [
            {
              p: '$\\dfrac{OA}{OE} \\neq \\dfrac{OF}{OB}$ : dans la figure de la leçon, $\\dfrac{6}{9} = \\dfrac{2}{3}$ mais $\\dfrac{6}{4} = \\dfrac{3}{2}$. Chaque longueur va avec celle de la même droite : $OA$ avec $OE$, $OB$ avec $OF$.',
            },
          ],
        },
        {
          kind: 'trap',
          tag: 'Piège 2 : la longueur qui traverse le sommet',
          body: [
            {
              p: 'Dans l’exemple 2, $\\dfrac{OA}{AC} = \\dfrac{9}{21}$ n’est pas un des trois rapports : $AC$ traverse $O$. Avec lui, on trouverait $OD = \\dfrac{6 \\times 21}{9} = 14$ au lieu de 8.',
            },
          ],
        },
        {
          kind: 'trap',
          tag: 'Piège 3 : un résultat impossible',
          body: [
            {
              p: 'Dans l’exemple 1, $\\dfrac{6 \\times 8}{12} = 4$ ne peut pas être $OT$ : $OU = 12$ dépasse $OR = 8$, donc le triangle $OTU$ est le plus grand, et $OT$ doit dépasser $OS = 6$. Vérifie toujours le sens.',
            },
          ],
        },
        {
          kind: 'trap',
          tag: 'Piège 4 : oublier la phrase',
          body: [
            {
              p: 'Le théorème ne s’applique que si les droites sont parallèles. Avant les rapports, cite les deux alignements et le parallélisme, puis écris « d’après le théorème de Thalès ».',
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
          kind: 'figure',
          figure: {
            points: { P: [0, 0], E: [-1.928, 2.299], F: [1.877, 3.532], G: [4.82, -5.746], H: [-4.693, -8.83] },
            segments: [['E', 'G'], ['F', 'H'], { from: 'E', to: 'F', arrows: 1 }, { from: 'G', to: 'H', arrows: 1 }],
            labels: { P: 'e' },
            ariaLabel: 'Papillon : les droites (EG) et (FH) se coupent en P, et (EF) est parallèle à (GH)',
            maxWidth: 200,
          },
        },
        {
          kind: 'task',
          title: 'Exercice 1',
          level: 'Facile',
          body: [
            {
              p: 'Sur la figure, $(EG)$ et $(FH)$ se coupent en $P$, avec $(EF) \\parallel (GH)$. Rédige la phrase qui justifie l’égalité des trois rapports, puis écris-la.',
            },
          ],
          solution: [
            'Les points $E$, $P$, $G$ sont alignés, de même que $F$, $P$, $H$, et les droites $(EF)$ et $(GH)$ sont parallèles. D’après le théorème de Thalès : $\\dfrac{PE}{PG} = \\dfrac{PF}{PH} = \\dfrac{EF}{GH}$.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 2',
          level: 'Facile',
          body: [
            {
              p: 'Sur la même figure, complète : $\\dfrac{PF}{PH} = \\dfrac{\\ldots}{GH}$ et $\\dfrac{PG}{PE} = \\dfrac{PH}{\\ldots}$.',
            },
          ],
          solution: ['$\\dfrac{PF}{PH} = \\dfrac{EF}{GH}$ et $\\dfrac{PG}{PE} = \\dfrac{PH}{PF}$.'],
        },
        {
          kind: 'task',
          title: 'Exercice 3',
          level: 'Moyen',
          body: [{ p: 'Sur la même figure, $PE = 3$, $PG = 7{,}5$, $PF = 4$ et $GH = 10$. Calcule $PH$ et $EF$.' }],
          solution: [
            '$\\dfrac{3}{7{,}5} = \\dfrac{4}{PH} = \\dfrac{EF}{10}$.',
            '$PH = \\dfrac{4 \\times 7{,}5}{3} = 10$ et $EF = \\dfrac{3 \\times 10}{7{,}5} = 4$.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 4',
          level: 'Moyen',
          body: [
            {
              p: 'Les points $K$, $O$, $M$ sont alignés dans cet ordre, ainsi que $L$, $O$, $N$, et $(KL) \\parallel (MN)$. On donne $KM = 20$, $OK = 8$ et $OL = 6$. Calcule $OM$, $ON$, puis $LN$.',
            },
          ],
          solution: [
            '$KM$ traverse $O$ : $OM = 20 - 8 = 12$.',
            'D’après le théorème de Thalès, $\\dfrac{OK}{OM} = \\dfrac{OL}{ON}$, soit $\\dfrac{8}{12} = \\dfrac{6}{ON}$, donc $ON = \\dfrac{6 \\times 12}{8} = 9$.',
            '$LN = 6 + 9 = 15$.',
          ],
        },
        {
          kind: 'task',
          title: 'Exercice 5',
          level: 'Moyen',
          body: [
            {
              p: 'Les points $A$, $B$, $M$ sont alignés, ainsi que $A$, $C$, $N$, et $(BC) \\parallel (MN)$. On donne $AB = 4$ et $BM = 6$. Calcule le rapport $\\dfrac{AB}{AM}$ : a) quand $B$ est sur $[AM]$ (triangles emboîtés) ; b) quand $A$ est sur $[BM]$ (papillon).',
            },
          ],
          solution: [
            'a) $AM = 4 + 6 = 10$, donc $\\dfrac{AB}{AM} = \\dfrac{4}{10} = 0{,}4$.',
            'b) $AM = 6 - 4 = 2$, donc $\\dfrac{AB}{AM} = \\dfrac{4}{2} = 2$.',
          ],
        },
        {
          kind: 'figure',
          figure: {
            points: { A: [-15, 31.623], B: [15, 31.623], O: [0, 0], D: [24, -50.596], C: [-24, -50.596] },
            segments: [
              { from: 'O', to: 'A', label: '35' },
              { from: 'O', to: 'D', label: '56' },
              ['O', 'B'],
              ['O', 'C'],
              { from: 'A', to: 'B', label: '30', arrows: 1 },
              { from: 'C', to: 'D', arrows: 1 },
            ],
            labels: { O: 'e' },
            ariaLabel:
              'Un tréteau : les pieds [AD] et [BC] se croisent en O, le dessus (AB) est parallèle au sol (CD) ; OA = 35, OD = 56 et AB = 30',
            maxWidth: 200,
          },
        },
        {
          kind: 'task',
          title: 'Exercice 6',
          level: 'Situation',
          body: [
            {
              p: 'Les deux pieds $[AD]$ et $[BC]$ d’un tréteau se croisent en $O$, et le dessus $(AB)$ est parallèle au sol $(CD)$. On mesure $OA = OB = 35$ cm, $OD = OC = 56$ cm et $AB = 30$ cm. Quel est l’écart $CD$ entre les pieds, au sol ?',
            },
          ],
          solution: [
            'Les points $A$, $O$, $D$ sont alignés, ainsi que $B$, $O$, $C$, et $(AB) \\parallel (CD)$. D’après le théorème de Thalès : $\\dfrac{OA}{OD} = \\dfrac{OB}{OC} = \\dfrac{AB}{DC}$.',
            '$\\dfrac{35}{56} = \\dfrac{30}{DC}$, donc $DC = \\dfrac{30 \\times 56}{35} = 48$ : les pieds sont écartés de 48 cm.',
          ],
        },
        {
          kind: 'figure',
          figure: {
            points: { O: [0, 0], A: [-2.769, 3.921], B: [2.74, 2.914], E: [4.154, -5.881], F: [-4.11, -4.372] },
            segments: [
              { from: 'O', to: 'A', label: '4,8' },
              { from: 'O', to: 'E', label: '7,2' },
              { from: 'O', to: 'B', label: '4' },
              ['O', 'F'],
              { from: 'A', to: 'B', label: '5,6', arrows: 1 },
              { from: 'E', to: 'F', arrows: 1 },
            ],
            labels: { O: 'e' },
            ariaLabel:
              'Papillon : les droites (AE) et (BF) se coupent en O, et (AB) est parallèle à (EF) ; OA = 4,8, OE = 7,2, OB = 4 et AB = 5,6',
            maxWidth: 220,
          },
        },
        {
          kind: 'task',
          title: 'Exercice 7',
          level: 'Vers le brevet',
          body: [
            {
              p: 'Sur la figure, $(AE)$ et $(BF)$ se coupent en $O$, avec $(AB) \\parallel (EF)$. On donne $OA = 4{,}8$, $OE = 7{,}2$, $OB = 4$, $AB = 5{,}6$ et $BF = 10$.',
            },
            { p: '1) Calcule $OF$. 2) Rédige la justification, puis calcule $EF$. 3) Calcule $AE$.' },
          ],
          solution: [
            '1) $O$ est sur $[BF]$ : $OF = 10 - 4 = 6$.',
            '2) Les points $A$, $O$, $E$ sont alignés, ainsi que $B$, $O$, $F$, et $(AB) \\parallel (EF)$. D’après le théorème de Thalès : $\\dfrac{OA}{OE} = \\dfrac{OB}{OF} = \\dfrac{AB}{EF}$, soit $\\dfrac{4{,}8}{7{,}2} = \\dfrac{4}{6} = \\dfrac{5{,}6}{EF}$. Donc $EF = \\dfrac{5{,}6 \\times 7{,}2}{4{,}8} = 8{,}4$.',
            '3) $AE$ traverse $O$ : $AE = 4{,}8 + 7{,}2 = 12$.',
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
              'Papillon : $(AE)$ et $(BF)$ se coupent en $O$, et $(AB) \\parallel (EF)$',
              '$\\dfrac{OA}{OE} = \\dfrac{OB}{OF} = \\dfrac{AB}{EF}$',
              '$\\dfrac{6}{9} = \\dfrac{4}{6} = \\dfrac{5}{7{,}5}$',
              'La partenaire est sur la même droite, de l’autre côté de $O$',
            ],
            [
              'Le demi-tour de centre $O$ ramène aux triangles emboîtés',
              "$\\dfrac{OA'}{OE} = \\dfrac{OA}{OE}$",
              "$OA' = 6$ sur $[OE]$",
              'Les longueurs ne changent pas',
            ],
            [
              'Emboîtés : le grand côté contient le petit ; papillon : on n’additionne rien',
              '$\\dfrac{AM}{AB}$ et $\\dfrac{OA}{OE}$',
              '$\\dfrac{6}{10}$ et $\\dfrac{6}{9}$',
              'Jamais $OA + OE$ dans un rapport du papillon',
            ],
            [
              'Calculer : depuis le sommet, puis les produits en croix',
              '$OF = \\dfrac{OB \\times OE}{OA}$',
              '$OF = \\dfrac{4 \\times 9}{6} = 6$',
              'Une longueur qui traverse $O$ : enlève le morceau d’en face',
            ],
          ],
        },
        {
          kind: 'note',
          text: 'Au brevet : écris « Les points $A$, $O$, $E$ sont alignés, ainsi que $B$, $O$, $F$ ; les droites $(AB)$ et $(EF)$ sont parallèles. D’après le théorème de Thalès… », puis les trois rapports, remplace par les longueurs, calcule et donne l’unité.',
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
      q: 'Les droites $(AE)$ et $(BF)$ se coupent en $O$, et $(AB) \\parallel (EF)$. Quelle égalité donne le théorème ?',
      options: [
        '$\\dfrac{OA}{OE} = \\dfrac{OF}{OB}$',
        '$\\dfrac{OA}{OE} = \\dfrac{OB}{OF}$',
        '$\\dfrac{OA}{AE} = \\dfrac{AB}{EF}$',
      ],
      correct: 1,
      why: 'Chaque longueur va avec celle de la même droite : $OA$ avec $OE$, $OB$ avec $OF$.',
    },
    {
      q: 'Dans un papillon de sommet $O$, $OA = 5$ et $OE = 8$. Que vaut $\\dfrac{OB}{OF}$ ?',
      options: ['$\\dfrac{5}{8}$', '$\\dfrac{8}{5}$', '$\\dfrac{5}{13}$'],
      correct: 0,
      why: '$\\dfrac{OB}{OF} = \\dfrac{OA}{OE} = \\dfrac{5}{8}$.',
    },
    {
      q: 'Dans un papillon de sommet $O$, $OA = 4$, $OE = 10$ et $OB = 6$. Que vaut $OF$ ?',
      options: ['$2{,}4$', '$12$', '$15$'],
      correct: 2,
      why: '$OF = \\dfrac{6 \\times 10}{4} = 15$.',
    },
    {
      q: '$O$ est sur $[AE]$, avec $OA = 3$ et $AE = 11$. Que vaut $OE$ ?',
      options: ['$8$', '$14$', '$11$'],
      correct: 0,
      why: '$OE = AE - OA = 11 - 3 = 8$.',
    },
    {
      q: 'Triangles emboîtés : $M$ est sur $[AB]$, $AM = 2$ et $MB = 5$. Le rapport $\\dfrac{AM}{AB}$ vaut :',
      options: ['$\\dfrac{2}{5}$', '$\\dfrac{5}{7}$', '$\\dfrac{2}{7}$'],
      correct: 2,
      why: 'Le grand côté contient le petit : $AB = 2 + 5 = 7$.',
    },
    {
      q: 'Avant d’écrire les trois rapports, que faut-il citer ?',
      options: ['un angle droit', 'les deux alignements et le parallélisme', 'la longueur qui traverse $O$'],
      correct: 1,
      why: 'Le théorème ne s’applique qu’à des points alignés et des droites parallèles.',
    },
    {
      q: 'Dans un papillon de sommet $O$, $OA = 4$, $OE = 6$ et $AB = 5$. Que vaut $EF$ ?',
      options: ['$7$', '$7{,}5$', '$\\dfrac{10}{3}$'],
      correct: 1,
      why: '$EF = \\dfrac{5 \\times 6}{4} = 7{,}5$.',
    },
  ],
  next: 'La leçon suivante : « Prouver que deux droites sont parallèles », quand des rapports égaux le disent.',
};
