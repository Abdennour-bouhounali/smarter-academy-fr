import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import ValueTable from '../../../../../common/components/ValueTable';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import AlgebraRect from '../components/AlgebraRect';

/**
 * Module 8 — Boss Final « Le jardin de Maya » (moteur du kit, QCM
 * uniquement). Fichier de DONNÉES.
 *
 * Épreuves écrites EN DERNIER : chaque distracteur encode un piège
 * réellement travaillé dans les modules 1 à 7 —
 *   · coller les chiffres au lieu de multiplier (4n + 4 pour n = 5 → 44) — M1
 *   · oublier le « + 4 » de la bordure (20) — M1
 *   · mal compter les termes d'une somme signée — M2
 *   · perdre le signe d'une constante en réduisant (3x + 5) — M3
 *   · additionner des termes non semblables (3x + 2 = 5x) — M2, M3
 *   · distribuer au premier terme seulement (4(2x − 3) = 8x − 3) — M4
 *   · « premier × premier, dernier × dernier » ((x + 3)(x + 2) = x² + 6) — M4
 *   · « (a + b)² = a² + b² » ((x + 4)² = x² + 16) — M5
 *   · ne diviser qu'un terme en factorisant (6x + 9 = 3(2x + 9)) — M6
 *   · conclure d'une seule valeur commune que deux écritures sont égales — M3
 *   · vouloir développer une équation produit au lieu de garder les facteurs — M7
 *
 * `requires` nomme, épreuve par épreuve, les connaissances que la leçon a
 * établies et que l'épreuve mobilise. Le test final CONSOLIDE : il n'introduit
 * ni concept, ni mot, ni notation, et la synthèse ne recopie aucune définition
 * — elle affiche la carte complète (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *
 * Couverture des 11 LPs :
 *   P1 → e1 · P2 → e2 · P3 → e3 · P4 → e3, e4 · P5 → e5 · P6 → e5 ·
 *   P7 → e6 · P8 → e8, e10 · P9 → e4, e9 · P10 → e7 · P11 → e10.
 */
const SQUARE_IDS = ['r0c0', 'r0c1', 'r1c0', 'r1c1'];

const REGISTRE = [
  { id: 'bordure', emoji: '🌻', label: 'Bordure', value: '4n + 4' },
  { id: 'tuiles', emoji: '🧱', label: 'Tuiles', value: 'x², x, 1' },
  { id: 'rectangle', emoji: '🟩', label: 'Rectangle', value: '(x + 3)(x + 2)' },
  { id: 'carre', emoji: '🟪', label: 'Carré', value: '(a + b)²' },
];

const SKILLS = {
  sens: { label: 'Lire une expression littérale', module: 1 },
  termes: { label: 'Termes et facteurs', module: 2 },
  reduire: { label: 'Réduire et regrouper', module: 3 },
  developper: { label: 'Développer', module: 4 },
  identites: { label: 'Identités remarquables', module: 5 },
  factoriser: { label: 'Factoriser', module: 6 },
  equivalence: { label: 'Équivalence de deux écritures', module: 3 },
  choisir: { label: 'Choisir la bonne forme', module: 7 },
};

const EPREUVES = [
  {
    id: 'cl-e1',
    requires: ['expression-litterale'],
    skill: 'sens',
    title: 'Épreuve 1',
    prompt: (
      <>
        La bordure du jardin de Maya compte <MathText>{'$4n + 4$'}</MathText> dalles. Combien de dalles
        pour <MathText>{'$n = 5$'}</MathText> ?
      </>
    ),
    options: ['$44$', '$24$', '$20$', '$9$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['44', '24', '20', '9'][i],
    cols: 4,
    correct: 1,
    explain:
      "4n veut dire « 4 multiplié par n » : 4 × 5 = 20, puis on ajoute les 4 coins → 24. 44 colle les chiffres 4 et 4 au lieu de multiplier ; 20 oublie les quatre coins ; 9 additionne 4 + 5 au lieu de multiplier.",
    assessment: {
      enabled: true,
      type: 'assessment',
      learningPointIds: ['3e_calcul-litteral-algebrique_P1'],
    },
  },
  {
    id: 'cl-e2',
    requires: ['terme', 'facteur'],
    skill: 'termes',
    title: 'Épreuve 2',
    prompt: (
      <>
        Dans <MathText>{'$5x^{2} - 3x + 7$'}</MathText>, quelle affirmation est exacte ?
      </>
    ),
    options: [
      'Il y a 3 termes ; −3 et x sont les facteurs de −3x',
      'Il y a 2 termes ; 5 et 3 sont les facteurs',
      'Il y a 4 termes, car le signe − en est un',
      'Il y a 3 facteurs additionnés',
    ],
    cols: 1,
    correct: 0,
    explain:
      "Les termes sont ce qu'on ADDITIONNE : 5x², −3x et 7 — trois termes, signe compris. Les facteurs sont ce qu'on MULTIPLIE à l'intérieur d'un terme : −3x est le produit de −3 par x. Un signe n'est pas un terme, et « facteurs additionnés » mélange les deux mots.",
    assessment: {
      enabled: true,
      type: 'assessment',
      learningPointIds: ['3e_calcul-litteral-algebrique_P2'],
    },
  },
  {
    id: 'cl-e3',
    requires: ['reduire', 'termes-semblables'],
    skill: 'reduire',
    title: 'Épreuve 3',
    prompt: (
      <>
        Réduis <MathText>{'$5x - 8 - 2x + 3$'}</MathText>.
      </>
    ),
    options: ['$3x - 5$', '$3x + 5$', '$7x - 5$', '$-2$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['3x − 5', '3x + 5', '7x − 5', '−2'][i],
    cols: 4,
    correct: 0,
    explain:
      "Deux piles : les tuiles x (5x − 2x = 3x) et les tuiles 1 (−8 + 3 = −5), donc 3x − 5. 3x + 5 a perdu le signe du −8 ; 7x − 5 a additionné 5 et 2 au lieu de les soustraire ; −2 a empilé tout le monde, tuiles x comprises.",
    assessment: {
      enabled: true,
      type: 'assessment',
      learningPointIds: ['3e_calcul-litteral-algebrique_P3', '3e_calcul-litteral-algebrique_P4'],
    },
  },
  {
    id: 'cl-e4',
    requires: ['termes-semblables', 'reduire', 'regle-testeur'],
    skill: 'reduire',
    title: 'Épreuve 4',
    prompt: (
      <>
        Que devient <MathText>{'$3x + 2$'}</MathText> une fois réduit ?
      </>
    ),
    options: ['$5x$', '$5x^{2}$', '$6x$', 'Rien : ça ne se réduit pas'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['5x', '5x²', '6x', 'Rien : ça ne se réduit pas'][i],
    cols: 2,
    correct: 3,
    explain:
      "3x est fait de tuiles x, 2 de tuiles 1 : deux formes différentes ne s'empilent pas, l'écriture est déjà réduite. Le test le confirme : pour x = 2, 3x + 2 = 8 alors que 5x = 10. 5x² inventerait une tuile carrée, et 6x multiplierait au lieu d'additionner.",
    assessment: {
      enabled: true,
      type: 'assessment',
      learningPointIds: ['3e_calcul-litteral-algebrique_P4', '3e_calcul-litteral-algebrique_P9'],
    },
  },
  {
    id: 'cl-e5',
    requires: ['distributivite-simple', 'developper'],
    skill: 'developper',
    title: 'Épreuve 5',
    prompt: (
      <>
        Développe <MathText>{'$4(2x - 3)$'}</MathText>.
      </>
    ),
    options: ['$8x - 12$', '$8x - 3$', '$8x + 12$', '$6x - 12$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['8x − 12', '8x − 3', '8x + 12', '6x − 12'][i],
    cols: 4,
    correct: 0,
    explain:
      "Le rectangle de hauteur 4 a deux morceaux : 4 × 2x = 8x et 4 × (−3) = −12, donc 8x − 12. 8x − 3 laisse le second morceau gris — le 4 n'a touché qu'un terme ; 8x + 12 perd le signe ; 6x − 12 additionne 4 et 2 au lieu de les multiplier.",
    assessment: {
      enabled: true,
      type: 'assessment',
      learningPointIds: ['3e_calcul-litteral-algebrique_P5', '3e_calcul-litteral-algebrique_P6'],
    },
  },
  {
    id: 'cl-e6',
    requires: ['double-distributivite', 'developper', 'termes-semblables'],
    skill: 'developper',
    title: 'Épreuve 6',
    prompt: (
      <>
        Développe et réduis <MathText>{'$(x + 3)(x + 2)$'}</MathText>.
      </>
    ),
    options: ['$x^{2} + 5x + 6$', '$x^{2} + 6$', '$x^{2} + 5x + 5$', '$2x + 6$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['x² + 5x + 6', 'x² + 6', 'x² + 5x + 5', '2x + 6'][i],
    cols: 1,
    correct: 0,
    explain:
      "Quatre cases, quatre produits : x², 2x, 3x et 6 ; les deux bandes de x se regroupent en 5x, d'où x² + 5x + 6. x² + 6 ne compte que la première et la dernière case — les deux bandes de x dorment encore ; x² + 5x + 5 se trompe sur 3 × 2 ; 2x + 6 additionne les côtés au lieu de les multiplier.",
    assessment: {
      enabled: true,
      type: 'assessment',
      learningPointIds: ['3e_calcul-litteral-algebrique_P7'],
    },
  },
  {
    id: 'cl-e7',
    requires: ['carre-somme', 'identite-remarquable'],
    skill: 'identites',
    title: 'Épreuve 7',
    prompt: (
      <>
        Développe <MathText>{'$(x + 4)^{2}$'}</MathText>.
      </>
    ),
    options: ['$x^{2} + 8x + 16$', '$x^{2} + 16$', '$x^{2} + 4x + 16$', '$2x + 8$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['x² + 8x + 16', 'x² + 16', 'x² + 4x + 16', '2x + 8'][i],
    cols: 1,
    correct: 0,
    explain:
      "Le carré de côté x + 4 contient QUATRE morceaux : x², deux rectangles 4x, et 16 — soit x² + 8x + 16. x² + 16 est l'erreur « (a + b)² = a² + b² » : les deux rectangles manquent (pour x = 3 : 49 contre 25). x² + 4x + 16 n'en compte qu'un ; 2x + 8 double le côté au lieu de l'élever au carré.",
    assessment: {
      enabled: true,
      type: 'assessment',
      learningPointIds: ['3e_calcul-litteral-algebrique_P10'],
    },
  },
  {
    id: 'cl-e8',
    requires: ['factoriser', 'facteur-commun'],
    skill: 'factoriser',
    title: 'Épreuve 8',
    prompt: (
      <>
        Factorise <MathText>{'$6x + 9$'}</MathText>.
      </>
    ),
    options: ['$3(2x + 3)$', '$3(2x + 9)$', '$6(x + 9)$', '$3(x + 3)$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['3(2x + 3)', '3(2x + 9)', '6(x + 9)', '3(x + 3)'][i],
    cols: 4,
    correct: 0,
    explain:
      "3 est commun à 6x et à 9 : il devient la hauteur du rectangle, et il reste 2x + 3. Vérification par développement : 3 × 2x + 3 × 3 = 6x + 9 ✓. 3(2x + 9) n'a divisé que le premier terme (il vaut 6x + 27) ; 6(x + 9) laisse le 9 intact ; 3(x + 3) a divisé 6x par 6.",
    assessment: {
      enabled: true,
      type: 'assessment',
      learningPointIds: ['3e_calcul-litteral-algebrique_P8'],
    },
  },
  {
    id: 'cl-e9',
    requires: ['regle-testeur', 'meme-expression'],
    skill: 'equivalence',
    title: 'Épreuve 9',
    prompt: (
      <>
        Deux écritures donnent toutes les deux 7 pour <MathText>{'$x = 1$'}</MathText>. Que peut-on en
        conclure ?
      </>
    ),
    options: [
      'Elles sont égales : c’est la même expression',
      'On ne peut pas conclure — il faut tester une autre valeur',
      'Elles sont forcément différentes',
    ],
    cols: 1,
    correct: 1,
    explain:
      "Une valeur commune ne prouve rien : 3x + 2 et 5x valent tous deux 5 pour x = 1, mais 8 et 10 pour x = 2. Une seule valeur qui DIFFÈRE réfute l'égalité ; aucune valeur qui s'accorde ne la démontre. Et deux écritures qui se croisent en un point ne sont évidemment pas « forcément différentes » non plus.",
    assessment: {
      enabled: true,
      type: 'assessment',
      learningPointIds: ['3e_calcul-litteral-algebrique_P9'],
    },
  },
  {
    id: 'cl-e10',
    requires: ['choisir-la-forme', 'produit-nul-forme', 'factoriser'],
    skill: 'choisir',
    title: 'Épreuve 10',
    prompt: (
      <>
        On veut savoir pour quels x l’expression <MathText>{'$(x + 3)(x - 5)$'}</MathText> vaut 0.
        Quelle écriture faut-il garder ?
      </>
    ),
    options: [
      'La forme factorisée, telle quelle',
      'Il faut développer d’abord',
      'Il faut réduire les termes semblables',
    ],
    cols: 1,
    correct: 0,
    explain:
      "Un produit est nul dès qu'un de ses facteurs l'est : la forme factorisée met les valeurs cherchées sous les yeux. Développer donnerait x² − 2x − 15, une somme dont on ne lit plus rien ; et il n'y a aucun terme semblable à regrouper. Choisir la forme, c'est écouter la question — la résolution elle-même est le sujet de « Équations produit nul ».",
    assessment: {
      enabled: true,
      type: 'assessment',
      learningPointIds: ['3e_calcul-litteral-algebrique_P11', '3e_calcul-litteral-algebrique_P8'],
    },
  },
];

const BADGES = [
  { id: 'sens', emoji: '🏅', label: 'Lecteur d’expressions', test: (s) => (s.sens ?? 0) === 0 },
  { id: 'termes', emoji: '🏅', label: 'Trieur de termes', test: (s) => (s.termes ?? 0) === 0 },
  { id: 'reduire', emoji: '🏅', label: 'Empileur de tuiles', test: (s) => (s.reduire ?? 0) === 0 },
  { id: 'developper', emoji: '🏅', label: 'Découpeur de rectangles', test: (s) => (s.developper ?? 0) === 0 },
  { id: 'identites', emoji: '🏅', label: 'Maître des identités', test: (s) => (s.identites ?? 0) === 0 },
  { id: 'factoriser', emoji: '🏅', label: 'Remonteur de côtés', test: (s) => (s.factoriser ?? 0) === 0 },
  { id: 'equivalence', emoji: '🏅', label: 'Juge du tableau', test: (s) => (s.equivalence ?? 0) === 0 },
  { id: 'choisir', emoji: '🏅', label: 'Stratège des formes', test: (s) => (s.choisir ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Jardinier algébriste', test: (s) => Object.values(s).every((v) => v === 0) },
];

const PIEGES = [
  { wrong: 'Écrire 3x + 2 = 5x', right: 'Des tuiles de formes différentes ne s’empilent pas' },
  { wrong: 'Développer 4(2x − 3) en 8x − 3', right: 'Le facteur touche CHAQUE terme, signe compris : 8x − 12' },
  { wrong: 'Écrire (x + 3)(x + 2) = x² + 6', right: 'Quatre cases, quatre produits : x² + 5x + 6' },
  { wrong: 'Écrire (a + b)² = a² + b²', right: 'Il manque les deux rectangles ab : a² + 2ab + b²' },
  { wrong: 'Factoriser 6x + 9 en 3(2x + 9)', right: 'Chaque terme est divisé par 3 : 3(2x + 3)' },
  { wrong: 'Conclure d’une seule valeur qui s’accorde', right: 'Une valeur ne prouve rien ; une valeur qui diffère réfute' },
];

function Synthese() {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-3 text-center">
        <div className="text-2xl" aria-hidden="true">𝑥</div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
          Une expression est une machine qui calcule un nombre pour chaque x. Deux écritures sont la
          MÊME expression quand elles s’accordent pour <strong>tout</strong> x — et l’aire d’un
          rectangle montre pourquoi développer, réduire et factoriser ne changent que l’écriture.
        </p>
      </div>

      <div className="bg-white border-2 border-violet-200 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-semibold text-violet-700 text-center">
          Le carré de côté a + b, figé sur ses quatre morceaux
        </p>
        <AlgebraRect
          mode="square"
          splitA
          splitB
          counted={SQUARE_IDS}
          merged
          frozen
          caption="a², deux rectangles ab, et b² : quatre morceaux, jamais deux."
        />
      </div>

      <div className="bg-white border-2 border-sky-200 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-semibold text-sky-700 text-center">
          Le rituel de vérification, figé sur a = 3 et b = 2
        </p>
        <ValueTable
          columns={[
            { id: 'carre', label: <MathText>{'$(a+2)^{2}$'}</MathText>, fn: (a) => (a + 2) ** 2 },
            { id: 'faux', label: <MathText>{'$a^{2}+2^{2}$'}</MathText>, fn: (a) => a ** 2 + 4 },
            { id: 'juste', label: <MathText>{'$a^{2}+4a+4$'}</MathText>, fn: (a) => a ** 2 + 4 * a + 4 },
          ]}
          xs={[3]}
          tested={new Set([3])}
          onTest={() => {}}
          variable="a"
          settleMs={0}
          disabled
          caption="25 contre 13 : les deux rectangles ab manquants valent 12."
        />
      </div>

      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 space-y-2.5">
        <p className="text-sm font-bold text-amber-900">Les pièges à éviter</p>
        {PIEGES.map((p) => (
          <div key={p.wrong} className="text-sm space-y-0.5">
            <div className="text-rose-700">❌ {p.wrong}</div>
            <div className="text-emerald-700">✅ {p.right}</div>
          </div>
        ))}
      </div>

      <Feedback tone="info">
        Le jardin de Maya n’a jamais changé de taille : seule son écriture a changé de forme. C’est
        exactement ce que fait le calcul littéral — et c’est pourquoi une transformation se vérifie
        toujours en redéveloppant, ou en testant deux valeurs.
      </Feedback>

      {/* Les connaissances elles-mêmes : la carte complète, source unique. */}
      <KnowledgeSnapshot variant="complete" complete />
    </div>
  );
}

export default function Module08MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="🏆 Mission finale : le jardin de Maya"
      moduleSubtitle="Dix épreuves pour prouver qu’aucune écriture ne te trompe."
      estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'Dix écritures à démêler. Une seule est la bonne à chaque fois.',
        tone: 'amber',
        body: (
          <p>
            Lire une expression, séparer les termes des facteurs, réduire, développer, reconnaître une
            identité, factoriser, vérifier, choisir : tout ce que tu as manipulé depuis la bordure de
            dalles. Réponds aux dix épreuves, puis valide pour voir ta correction et tes badges.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Jardinier algébriste !',
        title: 'Mission accomplie !',
        message: (
          <>
            De la bordure comptée de trois façons au carré de côté a + b, tu as vu puis démontré qu’une
            expression garde sa quantité quelle que soit son écriture — et tu sais maintenant choisir
            celle qui rend la question facile.
          </>
        ),
        verbs: ['Développer', 'Réduire', 'Factoriser', 'Vérifier'],
        masterBadgeLabel: 'Badge « Jardinier algébriste » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
