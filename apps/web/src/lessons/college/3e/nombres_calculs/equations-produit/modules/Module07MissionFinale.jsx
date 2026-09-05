import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import ProductScanner from '../components/ProductScanner';
import SquareVsRectangle from '../components/SquareVsRectangle';
import {
  lin, productZeros, formatDec, formatProduct, formatSolutionSet,
} from '../components/equationUtils';

/**
 * Module 7 — Boss Final (moteur du kit, QCM uniquement). Fichier de DONNÉES.
 *
 * Épreuves écrites EN DERNIER : chaque distracteur encode un piège
 * réellement travaillé dans les modules 1 à 6 —
 *   · croire qu'il faut annuler LES DEUX facteurs (M1, M4)
 *   · confondre produit nul et somme nulle / nombres opposés (M1)
 *   · n'agir que sur un plateau de la balance (M3)
 *   · oublier de développer un paquet k(a + b) (M3)
 *   · oublier la branche « x = 0 » quand un facteur est x tout seul (M4, M6)
 *   · diviser par x et perdre la solution 0 (M6)
 *   · garder une longueur négative (M5, M6)
 *   · croire qu'une équation a toujours exactement une solution (M2)
 *
 * Couverture des 10 LPs : P1 (e1), P2 (e2), P3 (e3), P4 (e4), P5 (e5),
 * P6 (e6), P7 (e7), P8 (e8), P9 (e9), P10 (e10).
 */
const F1 = lin(1, -3);
const F2 = lin(2, 4);
const ZEROS = productZeros(F1, F2);

const REGISTRE = [
  { id: 'cible', emoji: '🎯', label: 'Objectif', value: 'produit = 0' },
  { id: 'regle', emoji: '⚖️', label: 'Des deux', value: 'côtés' },
  { id: 'branches', emoji: '🔀', label: 'Un facteur', value: 'suffit' },
  { id: 'verif', emoji: '✔️', label: 'Puis', value: 'vérifier' },
];

const SKILLS = {
  equation: { label: 'Équation, inconnue, solution', module: 2 },
  balance: { label: 'Transformer et résoudre au premier degré', module: 3 },
  produit: { label: 'La règle du produit nul', module: 4 },
  verifier: { label: 'Vérifier et interpréter', module: 5 },
  problemes: { label: 'Modéliser un problème', module: 6 },
};

const EPREUVES = [
  {
    id: 'ep-e1',
    skill: 'equation',
    title: 'Épreuve 1',
    prompt: "Parmi ces trois écritures, laquelle est une ÉQUATION ?",
    options: [
      '$3x - 6$',
      '$3x - 6 = 0$',
      '$3 \\times 5 - 6 = 9$',
    ],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['3x − 6', '3x − 6 = 0', '3 × 5 − 6 = 9'][i],
    correctionLabel: '3x − 6 = 0',
    cols: 1,
    correct: 1,
    explain:
      "Une équation est une ÉGALITÉ (il faut le signe =) contenant une inconnue (il faut la lettre). « 3x − 6 » est une expression sans égalité ; « 3 × 5 − 6 = 9 » est une égalité numérique, sans inconnue.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_equations-produit_P1'] },
  },
  {
    id: 'ep-e2',
    skill: 'equation',
    title: 'Épreuve 2',
    prompt: "Combien de solutions a l'équation x + 1 = x + 2 ?",
    options: ['Une seule', 'Aucune', 'Toutes les valeurs de x'],
    cols: 3,
    correct: 1,
    explain:
      "Quelle que soit la valeur testée, le membre de droite dépasse celui de gauche de 1 : l'égalité n'est jamais vraie. On écrit S = ∅. Une équation n'a pas toujours exactement une solution.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_equations-produit_P2'] },
  },
  {
    id: 'ep-e3',
    skill: 'balance',
    title: 'Épreuve 3',
    prompt: "On part de 2x + 3 = x + 7. Quelle transformation conserve les mêmes solutions ?",
    options: [
      'Retirer x aux deux membres : x + 3 = 7',
      'Retirer 3 au membre de gauche seulement : 2x = x + 7',
      'Multiplier le membre de droite par 2 : 2x + 3 = 2x + 14',
    ],
    cols: 1,
    correct: 0,
    explain:
      "Ce qu'on retranche à un plateau, on le retranche à l'autre : x + 3 = 7, de solution x = 4 comme au départ. Agir d'un seul côté fabrique une autre équation — la balance penche.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_equations-produit_P3'] },
  },
  {
    id: 'ep-e4',
    skill: 'balance',
    title: 'Épreuve 4',
    prompt: 'Quelle est la solution de 5x − 2 = 13 ?',
    options: ['$x = 3$', '$x = 2{,}2$', '$x = 15$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['x = 3', 'x = 2,2', 'x = 15'][i],
    correctionLabel: 'x = 3',
    cols: 3,
    correct: 0,
    explain:
      "On ajoute 2 aux deux membres : 5x = 15, puis on partage en 5 : x = 3. (2,2 vient de 11 ÷ 5 : on a ajouté 2 à gauche seulement. 15 est la valeur de 5x, pas celle de x.)",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_equations-produit_P4'] },
  },
  {
    id: 'ep-e5',
    skill: 'balance',
    title: 'Épreuve 5',
    prompt: 'Pour résoudre 3(x + 2) = 15, quelle première étape est correcte ?',
    options: [
      'Développer : 3x + 6 = 15',
      'Retirer 2 des deux côtés : 3x = 13',
      'Écrire 3x + 2 = 15',
    ],
    cols: 1,
    correct: 0,
    explain:
      "Le 3 multiplie TOUT le contenu de la parenthèse : 3(x + 2) = 3x + 6. Tant que la parenthèse est fermée, on ne peut pas en retirer 2 tout seul ; et « 3x + 2 » oublie de multiplier le 2 par 3.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_equations-produit_P5'] },
  },
  {
    id: 'ep-e6',
    skill: 'produit',
    title: 'Épreuve 6',
    prompt: 'Le produit de deux nombres vaut 0. Que peut-on affirmer à coup sûr ?',
    options: [
      'Les deux nombres sont nuls',
      'Au moins un des deux est nul',
      'Les deux nombres sont opposés',
    ],
    cols: 1,
    correct: 1,
    explain:
      "C'est la propriété du produit nul : A × B = 0 équivaut à A = 0 ou B = 0. Un seul suffit — 3 × 0 = 0 sans que 3 soit nul. Deux nombres opposés donnent 0 par addition, pas par multiplication : 5 × (−5) = −25.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_equations-produit_P6'] },
  },
  {
    id: 'ep-e7',
    skill: 'produit',
    title: 'Épreuve 7',
    prompt: "Résous (x − 3)(2x + 4) = 0.",
    options: [
      '$S = \\{\\,3\\,\\}$',
      '$S = \\{\\,-2\\,;\\,3\\,\\}$',
      '$S = \\{\\,-4\\,;\\,3\\,\\}$',
    ],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['S = { 3 }', 'S = { −2 ; 3 }', 'S = { −4 ; 3 }'][i],
    correctionLabel: 'S = { −2 ; 3 }',
    cols: 1,
    correct: 1,
    explain:
      "Deux facteurs, deux branches : x − 3 = 0 donne x = 3 ; 2x + 4 = 0 donne 2x = −4 puis x = −2. Ne garder que 3 revient à oublier la seconde branche ; −4 oublie de partager par 2.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_equations-produit_P7'] },
  },
  {
    id: 'ep-e8',
    skill: 'verifier',
    title: 'Épreuve 8',
    prompt: "Comment vérifier que x = 5 est solution de x(x − 5) = 0 ?",
    options: [
      'On remplace : 5 × (5 − 5) = 5 × 0 = 0, l’égalité est vraie',
      'On refait toute la résolution depuis le début',
      'On regarde si 5 apparaît dans l’écriture de l’équation',
    ],
    cols: 1,
    correct: 0,
    explain:
      "Vérifier, c'est substituer la valeur dans l'équation de DÉPART et calculer les deux membres. Ici le second facteur s'annule, donc le produit vaut 0 : x = 5 convient. Voir un nombre dans l'énoncé ne prouve rien — dans x(x + 5) = 0, le 5 est là mais 5 n'est pas solution.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_equations-produit_P8'] },
  },
  {
    id: 'ep-e9',
    skill: 'verifier',
    title: 'Épreuve 9',
    prompt:
      "Une longueur x vérifie (x + 3)(x − 4) = 0. L'équation donne x = −3 ou x = 4. Que retient-on pour la longueur ?",
    options: [
      'Les deux valeurs : ce sont les solutions',
      'Seulement x = 4 : une longueur ne peut pas être négative',
      'Aucune : l’équation ne s’applique pas aux longueurs',
    ],
    cols: 1,
    correct: 1,
    explain:
      "Résoudre et interpréter sont deux étapes distinctes. L'équation a bien deux solutions ; le contexte en écarte une, car −3 m n'a pas de sens comme longueur. On garde 4, et on le dit.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_equations-produit_P9'] },
  },
  {
    id: 'ep-e10',
    skill: 'problemes',
    title: 'Épreuve 10',
    prompt:
      "Un carré de côté x a la même aire qu'un rectangle de 4 sur x : x² = 4x. Quelle méthode donne TOUTES les solutions ?",
    options: [
      'Diviser par x : x = 4',
      'Écrire x² − 4x = 0, factoriser en x(x − 4) = 0, donc x = 0 ou x = 4',
      'Simplifier les x : x = 4x devient 1 = 4, impossible',
    ],
    cols: 1,
    correct: 1,
    explain:
      "Diviser par x suppose x ≠ 0 et perd la solution x = 0 (où les deux aires valent 0). La factorisation ne perd rien : x(x − 4) = 0 donne les deux branches. Pour la figure elle-même, on gardera ensuite x = 4.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_equations-produit_P10'] },
  },
];

const BADGES = [
  { id: 'vocab', emoji: '🏅', label: 'Lecteur d’équations', test: (s) => (s.equation ?? 0) === 0 },
  { id: 'balance', emoji: '🏅', label: 'Maître de la balance', test: (s) => (s.balance ?? 0) === 0 },
  { id: 'zero', emoji: '🏅', label: 'Le zéro qui gagne', test: (s) => (s.produit ?? 0) === 0 },
  { id: 'verif', emoji: '🏅', label: 'Vérificateur', test: (s) => (s.verifier ?? 0) === 0 },
  { id: 'modele', emoji: '🏅', label: 'Modélisateur', test: (s) => (s.problemes ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Chasseur de zéros', test: (s) => Object.values(s).every((v) => v === 0) },
];

const PIEGES = [
  { wrong: 'Vouloir annuler les DEUX facteurs à la fois', right: 'Un seul facteur nul suffit — et il en faut un' },
  { wrong: 'Retirer un terme d’un seul côté de l’égalité', right: 'Ce qu’on fait à un plateau, on le fait à l’autre' },
  { wrong: 'Diviser x² = 4x par x et perdre la solution 0', right: 'Factoriser : x(x − 4) = 0 ne perd rien' },
  { wrong: 'Garder une solution qui donne une longueur négative', right: 'Résoudre, puis interpréter dans le contexte' },
];

function Synthese() {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-3 text-center">
        <div className="text-2xl" aria-hidden="true">⚖️</div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
          Un produit ne vaut zéro que si l'un de ses facteurs vaut zéro. Toute la leçon consiste à ramener
          une équation à cette forme — puis à annuler chaque facteur séparément.
        </p>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-semibold text-slate-700 text-center">
          La bande du scanner, figée sur ses deux zéros
        </p>
        <ProductScanner f1={F1} f2={F2} x={ZEROS[1]} stamped={ZEROS} zeros={ZEROS} frozen />
        <p className="text-center text-xs text-slate-500">
          <MathText>{`$${formatProduct(F1, F2)} = 0 \\;\\Rightarrow\\; S = ${formatSolutionSet(ZEROS)}$`}</MathText>
        </p>
      </div>

      <div className="bg-white border-2 border-rose-200 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-semibold text-rose-700 text-center">Et le duel d'aires, à l'équilibre</p>
        <SquareVsRectangle x={4} frozen />
        <p className="text-center text-xs text-slate-500">
          <MathText>{'$x^{2} = 4x \\;\\Rightarrow\\; x(x - 4) = 0 \\;\\Rightarrow\\; x = 0 \\text{ ou } x = 4$'}</MathText>
          {' '}— pour une figure, seul {formatDec(4)} convient.
        </p>
      </div>

      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-5 text-center space-y-1">
        <p className="text-xs uppercase tracking-wide text-emerald-100 font-mono font-bold">À retenir</p>
        <p className="font-mono font-extrabold text-sm sm:text-base">Ramener à « produit = 0 »</p>
        <p className="font-mono font-extrabold text-sm sm:text-base">Annuler chaque facteur, séparément</p>
        <p className="font-mono font-extrabold text-sm sm:text-base">Vérifier en remplaçant, puis interpréter</p>
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
        Aires, trajectoires, prix : dès qu'un problème mène à une équation où un produit peut s'annuler, le
        réflexe est le même — factoriser, puis annuler chaque facteur.
      </Feedback>
    </div>
  );
}

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="🏆 Mission finale : le zéro qui gagne"
      moduleSubtitle="Dix épreuves pour prouver qu’aucun produit nul ne te résiste."
      estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'Dix équations, dix pièges. Le zéro est de ton côté.',
        tone: 'amber',
        body: (
          <p>
            Lire une équation, la transformer sans la casser, la ramener à un produit nul, vérifier et
            interpréter : tout ce que tu as manipulé. Réponds aux dix épreuves, puis valide pour voir ta
            correction et tes badges.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Chasseur de zéros !',
        title: 'Mission accomplie !',
        message: (
          <>
            Des deux molettes du premier module au duel carré contre rectangle, tu as vu, manipulé puis
            démontré : un produit ne tombe à zéro que si un facteur le fait.
          </>
        ),
        verbs: ['Factoriser', 'Annuler', 'Vérifier', 'Interpréter'],
        masterBadgeLabel: 'Badge « Chasseur de zéros » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
