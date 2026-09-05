import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import EquationBuilder from '../components/EquationBuilder';
import ProblemText from '../components/ProblemText';
import CheckStrip from '../components/CheckStrip';
import { Carnet } from './Module06ResoudreVerifier';
import { lin, formatEquation, formatDec, solveLinear } from '../components/problemUtils';
import { FORFAIT, AGES } from '../components/problemsData';

/**
 * Module 8 — Boss Final (moteur du kit, QCM uniquement). Fichier de DONNÉES.
 *
 * Épreuves écrites EN DERNIER : chaque distracteur encode un piège
 * réellement travaillé dans les modules 1 à 7 —
 *   · utiliser toutes les données de l'énoncé, y compris les inutiles (M2)
 *   · oublier les contraintes « entier » et « positif » (M2)
 *   · supposer la proportionnalité alors qu'il y a une part fixe (M1, M5)
 *   · le piège du mot-clé : « 3 de plus » écrit x − 3, ou 3x (M3)
 *   · multiplier la masse au lieu de passer par une personne (M5)
 *   · confondre périmètre et aire, oublier de doubler (M4)
 *   · écrire la RÉSOLUTION au lieu de l'histoire : 3x = 25 + 7 (M4)
 *   · opérer d'un seul côté, ou sur un seul terme (M6)
 *   · vérifier dans la dernière ligne au lieu de l'histoire (M6)
 *   · répondre « 6,25 séances » ou « dès 6 » (M7)
 *
 * Couverture des 11 LPs : P1 (e1), P2 (e2), P3 (e3), P4 (e4, e7), P5 (e5),
 * P6 (e6), P7 (e4, e7), P8 (e8), P9 (e9), P10 (e10), P11 (e10).
 */
const SOL_FORFAIT = solveLinear(FORFAIT.equation).x; // 6

/* La traduction figée du forfait, rejouée dans la synthèse. */
const FROZEN_LEFT = [
  { id: 'n9', kind: 'term', value: lin(9, 0), label: '9n', aria: 'neuf n' },
];
const FROZEN_RIGHT = [
  { id: 'vingtquatre', kind: 'term', value: lin(0, 24), label: '24', aria: 'vingt-quatre' },
  { id: 'plus', kind: 'op', op: '+', label: '+', aria: 'plus' },
  { id: 'n5', kind: 'term', value: lin(5, 0), label: '5n', aria: 'cinq n' },
];

const REGISTRE = [
  { id: 'cinema', emoji: '🎬', label: 'Cinéma', value: '24 € + 5 €' },
  { id: 'ages', emoji: '👥', label: 'Tom et', value: 'Léa' },
  { id: 'rect', emoji: '📐', label: 'Rectangle', value: 'P = 40' },
  { id: 'crepes', emoji: '🥞', label: 'Crêpes', value: '250 g' },
];

const SKILLS = {
  lire: { label: 'Lire un énoncé : données, question, contraintes', module: 2 },
  strategie: { label: 'Choisir une stratégie', module: 5 },
  inconnue: { label: 'Choisir l’inconnue et écrire les autres quantités', module: 3 },
  nombres: { label: 'Mobiliser les nombres et opérations adaptés', module: 5 },
  litteral: { label: 'Calcul littéral dans une situation', module: 4 },
  equation: { label: 'Traduire en équation', module: 4 },
  etapes: { label: 'Organiser les étapes d’une résolution', module: 6 },
  verifier: { label: 'Vérifier dans l’histoire', module: 6 },
  interpreter: { label: 'Interpréter et répondre', module: 7 },
};

const EPREUVES = [
  {
    id: 'rp-e1',
    skill: 'lire',
    title: 'Épreuve 1',
    prompt:
      "« Pour 4 personnes, une recette de crêpes demande 250 g de farine, 3 œufs et 50 cL de lait. Le paquet de farine pèse 1 kg. Quelle masse de farine faut-il pour 7 personnes ? » — Quelle donnée est INUTILE pour répondre ?",
    options: [
      'Le poids du paquet de farine (1 kg)',
      'Les 250 g de farine pour 4 personnes',
      'Le nombre de personnes (7)',
    ],
    cols: 1,
    correct: 0,
    explain:
      "Une donnée est utile quand la question ne peut pas être résolue sans elle. Ici la question ne parle que de la masse de farine nécessaire : les 250 g pour 4 personnes et les 7 personnes sont indispensables, le poids du paquet (comme les œufs et le lait) est vrai mais décoratif. Un énoncé peut être bavard sans être faux.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_resolution-problemes-3e_P1'] },
  },
  {
    id: 'rp-e2',
    skill: 'lire',
    title: 'Épreuve 2',
    prompt:
      "Dans le problème du cinéma, n désigne un nombre de séances. Que doit vérifier n ?",
    options: [
      'n peut être n’importe quel nombre',
      'n doit être entier et positif',
      'n doit être entier, positif et inférieur à 12',
    ],
    cols: 1,
    correct: 1,
    explain:
      "Les contraintes se lisent dans la situation, pas dans le calcul : on ne va pas au cinéma 6,25 fois (entier) ni −3 fois (positif). En revanche rien dans l'énoncé ne fixe de plafond : 40 séances sont permises, donc « inférieur à 12 » invente une limite.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_resolution-problemes-3e_P2'] },
  },
  {
    id: 'rp-e3',
    skill: 'strategie',
    title: 'Épreuve 3',
    prompt:
      "« 250 g de farine pour 4 personnes. Quelle masse pour 7 personnes ? » — Quelle stratégie est la plus adaptée ?",
    options: [
      'La proportionnalité : passer par la masse pour une personne',
      'Poser une équation avec une inconnue',
      'Tester des valeurs jusqu’à tomber juste',
    ],
    cols: 1,
    correct: 0,
    explain:
      "Aucune part fixe ici : deux fois plus de personnes, deux fois plus de farine. On divise puis on multiplie — 250 ÷ 4 = 62,5 g par personne. Poser une inconnue serait se compliquer la vie, et tester des valeurs ne mènerait nulle part puisque la réponse (437,5 g) n'est pas un entier rond. Attention : dans le problème du cinéma, au contraire, les 24 € fixes interdisent la proportionnalité.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_resolution-problemes-3e_P3'] },
  },
  {
    id: 'rp-e4',
    skill: 'inconnue',
    title: 'Épreuve 4',
    prompt:
      "Léa a 3 ans de plus que Tom. On pose x = l'âge de Tom. Comment s'écrit l'âge de Léa ?",
    options: ['$x - 3$', '$x + 3$', '$3x$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['x − 3', 'x + 3', '3x'][i],
    correctionLabel: 'x + 3',
    cols: 3,
    correct: 1,
    explain:
      "« De plus que Tom » ajoute à Tom : Léa = x + 3. Le mot-clé ne suffit jamais — prends une valeur pour trancher : si Tom a 11 ans, x − 3 donnerait 8 ans à Léa, donc plus jeune, l'inverse de l'énoncé ; et 3x donnerait 33 ans, car « 3 de plus » n'est pas « 3 fois plus ».",
    assessment: {
      enabled: true,
      type: 'assessment',
      learningPointIds: ['3e_resolution-problemes-3e_P4', '3e_resolution-problemes-3e_P7'],
    },
  },
  {
    id: 'rp-e5',
    skill: 'nombres',
    title: 'Épreuve 5',
    prompt: '250 g de farine pour 4 personnes. Quelle masse faut-il pour 7 personnes ?',
    options: ['1 750 g', '437,5 g', '62,5 g', '375 g'],
    cols: 2,
    correct: 1,
    explain:
      "Une personne demande 250 ÷ 4 = 62,5 g ; sept personnes en demandent 7 × 62,5 = 437,5 g. 1 750 g, c'est 250 × 7 — comme si 250 g nourrissaient une seule personne. 62,5 g est la masse pour une personne, calcul juste mais arrêté trop tôt. 375 g correspond à 6 personnes.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_resolution-problemes-3e_P5'] },
  },
  {
    id: 'rp-e6',
    skill: 'litteral',
    title: 'Épreuve 6',
    prompt:
      "Un rectangle a pour largeur x et pour longueur x + 4. Quelle expression donne son périmètre ?",
    options: ['$4x + 8$', '$2x + 4$', '$x^{2} + 4x$', '$4x + 4$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['4x + 8', '2x + 4', 'x² + 4x', '4x + 4'][i],
    correctionLabel: '4x + 8',
    cols: 2,
    correct: 0,
    explain:
      "Le périmètre est le tour : deux largeurs et deux longueurs, soit 2x + 2(x + 4) = 2x + 2x + 8 = 4x + 8. « 2x + 4 » n'additionne qu'une largeur et une longueur. « x² + 4x » est l'AIRE, x(x + 4). « 4x + 4 » oublie de multiplier le 4 par 2 : la longueur dépasse deux fois.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_resolution-problemes-3e_P6'] },
  },
  {
    id: 'rp-e7',
    skill: 'equation',
    title: 'Épreuve 7',
    prompt:
      "« Je choisis un nombre, je le multiplie par 3, j'ajoute 7, j'obtiens 25. » — Quelle équation traduit ce programme ?",
    options: ['$3x + 7 = 25$', '$3(x + 7) = 25$', '$3x = 25 + 7$', '$x = 25 - 7$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['3x + 7 = 25', '3(x + 7) = 25', '3x = 25 + 7', 'x = 25 − 7'][i],
    correctionLabel: '3x + 7 = 25',
    cols: 2,
    correct: 0,
    explain:
      "On suit le programme dans l'ordre : × 3 d'abord (3x), + 7 ensuite (3x + 7), résultat de l'autre côté (= 25). « 3(x + 7) » ajoute 7 AVANT de multiplier. « 3x = 25 + 7 » écrit la RÉSOLUTION (le 7 est déjà passé de l'autre côté), pas l'histoire — et une équation doit d'abord raconter l'histoire. « x = 25 − 7 » saute directement à un résultat, faux de surcroît.",
    assessment: {
      enabled: true,
      type: 'assessment',
      learningPointIds: ['3e_resolution-problemes-3e_P7', '3e_resolution-problemes-3e_P4'],
    },
  },
  {
    id: 'rp-e8',
    skill: 'etapes',
    title: 'Épreuve 8',
    prompt: "Pour résoudre 4x + 8 = 40, quelle PREMIÈRE étape est valable ?",
    options: [
      'Retirer 8 des deux côtés : 4x = 32',
      'Diviser 40 par 4 : x + 8 = 10',
      'Retirer 8 à gauche seulement : 4x = 40',
    ],
    cols: 1,
    correct: 0,
    explain:
      "Une étape est valable quand elle agit des DEUX côtés du signe = : 4x + 8 − 8 = 40 − 8 donne 4x = 32, puis x = 8, la solution de départ. Diviser seulement 40 par 4 ne partage pas le membre de gauche en entier (il faudrait aussi diviser le 8). Retirer 8 à gauche seulement donne 4x = 40 donc x = 10 : la balance a penché, la solution a changé.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_resolution-problemes-3e_P8'] },
  },
  {
    id: 'rp-e9',
    skill: 'verifier',
    title: 'Épreuve 9',
    prompt:
      "Problème de Tom et Léa (Léa a 3 ans de plus ; dans 5 ans la somme de leurs âges sera 35). On a trouvé x = 11. Comment vérifier VRAIMENT ?",
    options: [
      'Recalculer les deux âges dans 5 ans et vérifier que leur somme fait 35',
      'Remplacer dans 2x = 22 : 2 × 11 = 22, donc c’est bon',
      'Refaire la division 22 ÷ 2 pour confirmer 11',
    ],
    cols: 1,
    correct: 0,
    explain:
      "Vérifier, c'est remettre la valeur dans l'HISTOIRE : Tom 11, Léa 14 ; dans 5 ans 16 et 19 ; 16 + 19 = 35, la donnée de l'énoncé. ✔ « 2x = 22 » est une ligne qu'on a fabriquée en cours de route : elle est vraie même si l'équation de départ était fausse, donc elle ne prouve rien. Refaire la division vérifie encore moins : c'est le même calcul deux fois.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_resolution-problemes-3e_P9'] },
  },
  {
    id: 'rp-e10',
    skill: 'interpreter',
    title: 'Épreuve 10',
    prompt:
      "Carte A : 9 € la séance. Carte B : 25 € puis 5 € la séance. L'équation 9n = 25 + 5n donne n = 6,25. Quelle réponse écrire ?",
    options: [
      'La carte B est plus avantageuse dès 7 séances.',
      'La carte B est plus avantageuse à partir de 6,25 séances.',
      'La carte B est plus avantageuse dès 6 séances.',
      'Les deux cartes ne se valent jamais : le problème est impossible.',
    ],
    cols: 1,
    correct: 0,
    explain:
      "6,25 n'est pas la réponse, c'est le point de bascule. On revient à l'histoire : à 6 séances, A coûte 54 € et B 55 € — A gagne encore. À 7 séances, 63 € contre 60 € — B passe devant. On arrondit donc VERS LE HAUT, et on répond par une phrase : « dès 7 séances ». « 6,25 séances » n'existe pas, « dès 6 » est faux d'un euro, et le problème a bel et bien une réponse.",
    assessment: {
      enabled: true,
      type: 'assessment',
      learningPointIds: ['3e_resolution-problemes-3e_P10', '3e_resolution-problemes-3e_P11'],
    },
  },
];

const BADGES = [
  { id: 'lire', emoji: '🏅', label: 'Détective d’énoncés', test: (s) => (s.lire ?? 0) === 0 },
  { id: 'strategie', emoji: '🏅', label: 'Stratège', test: (s) => (s.strategie ?? 0) === 0 },
  { id: 'inconnue', emoji: '🏅', label: 'Choisisseur d’inconnue', test: (s) => (s.inconnue ?? 0) === 0 },
  { id: 'nombres', emoji: '🏅', label: 'Calculateur juste', test: (s) => (s.nombres ?? 0) === 0 },
  { id: 'litteral', emoji: '🏅', label: 'Écrivain d’expressions', test: (s) => (s.litteral ?? 0) === 0 },
  { id: 'equation', emoji: '🏅', label: 'Traducteur', test: (s) => (s.equation ?? 0) === 0 },
  { id: 'etapes', emoji: '🏅', label: 'Organisateur', test: (s) => (s.etapes ?? 0) === 0 },
  { id: 'verifier', emoji: '🏅', label: 'Vérificateur', test: (s) => (s.verifier ?? 0) === 0 },
  { id: 'interpreter', emoji: '🏅', label: 'Interprète', test: (s) => (s.interpreter ?? 0) === 0 },
  {
    id: 'carnet',
    emoji: '💎',
    label: 'Carnet complet',
    test: (s) => Object.values(s).every((v) => v === 0),
  },
];

const PIEGES = [
  { wrong: 'Utiliser toutes les données de l’énoncé', right: 'Une donnée est utile si la question tombe sans elle' },
  { wrong: '« 3 ans de plus » écrit x − 3', right: 'Prendre une valeur pour trancher : « de plus » ajoute' },
  { wrong: 'Écrire 3x = 25 + 7 comme traduction', right: 'L’équation raconte l’histoire, pas sa résolution' },
  { wrong: 'Vérifier dans la dernière ligne écrite', right: 'Remettre la valeur dans l’histoire de l’énoncé' },
  { wrong: 'Répondre « 6,25 séances » ou « dès 6 »', right: 'Interpréter : dès 7 séances, avec une phrase' },
];

function Synthese() {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-3 text-center">
        <div className="text-2xl" aria-hidden="true">🧠</div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
          Un problème se résout en choisissant ce que <em>x</em> désigne, en traduisant l’histoire par une
          égalité qui dit deux fois la même quantité, en la résolvant — puis en revenant à l’histoire pour
          vérifier et répondre avec ses mots. L’équation est un <strong>modèle</strong> de la situation, pas
          la réponse.
        </p>
      </div>

      <div className="bg-white border-2 border-emerald-200 rounded-2xl p-4 space-y-2.5">
        <p className="text-sm font-semibold text-emerald-700 text-center">
          Le Traducteur, figé sur l’équation du forfait
        </p>
        <ProblemText
          fragments={FORFAIT.fragments}
          highlighted={new Set(['f-a', 'f-b-fixe', 'f-b-var'])}
          title="Énoncé — Le forfait mystère"
        />
        <EquationBuilder
          cards={[]}
          left={FROZEN_LEFT}
          right={FROZEN_RIGHT}
          variable="n"
          frozen
        />
        <p className="text-center text-xs text-slate-500">
          <MathText>
            {`$${formatEquation(FORFAIT.equation, 'n')} \\;\\Rightarrow\\; 4n = 24 \\;\\Rightarrow\\; n = ${formatDec(SOL_FORFAIT)}$`}
          </MathText>
        </p>
      </div>

      <div className="bg-white border-2 border-purple-200 rounded-2xl p-4 space-y-2.5">
        <p className="text-sm font-semibold text-purple-700 text-center">
          Et la vérification, faite dans l’histoire
        </p>
        <CheckStrip
          problem={AGES}
          choiceId="tom"
          x={11}
          checkId="somme5"
          target={AGES.equation.right.b}
          unit="ans"
          frozen
        />
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-semibold text-slate-700 text-center">
          Le carnet de modélisation, cinq onglets remplis
        </p>
        <Carnet ticked={5} />
      </div>

      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-5 text-center space-y-1">
        <p className="text-xs uppercase tracking-wide text-emerald-100 font-mono font-bold">À retenir</p>
        <p className="font-mono font-extrabold text-sm sm:text-base">Lire : données utiles, question, contraintes</p>
        <p className="font-mono font-extrabold text-sm sm:text-base">Nommer x, écrire les autres quantités</p>
        <p className="font-mono font-extrabold text-sm sm:text-base">Traduire : gauche = droite</p>
        <p className="font-mono font-extrabold text-sm sm:text-base">Résoudre des deux côtés, vérifier dans l’histoire</p>
        <p className="font-mono font-extrabold text-sm sm:text-base">Interpréter, puis répondre par une phrase</p>
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
        Prix, âges, longueurs, recettes : les histoires changent, les cinq gestes ne changent pas. C’est
        exactement ce carnet que tu rouvriras au lycée, avec des équations plus longues — et la même méthode.
      </Feedback>
    </div>
  );
}

export default function Module08MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="🏆 Mission finale : le carnet complet"
      moduleSubtitle="Dix épreuves pour prouver qu’aucun énoncé ne te résiste, de la lecture à la phrase de réponse."
      estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'Dix énoncés, dix pièges. Ton carnet est prêt.',
        tone: 'amber',
        body: (
          <p>
            Lire, choisir l’inconnue, traduire, choisir la stratégie, résoudre, vérifier, interpréter,
            répondre : tout ce que tu as manipulé depuis le forfait mystère. Réponds aux dix épreuves, puis
            valide pour voir ta correction et tes badges.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Carnet complet !',
        title: 'Mission accomplie !',
        message: (
          <>
            Des deux cartes de cinéma du premier module jusqu’à « dès 7 séances », tu as vu, manipulé puis
            démontré : un problème se modélise, puis se relit dans son histoire.
          </>
        ),
        verbs: ['Lire', 'Traduire', 'Résoudre', 'Vérifier', 'Répondre'],
        masterBadgeLabel: 'Badge « Carnet complet » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
