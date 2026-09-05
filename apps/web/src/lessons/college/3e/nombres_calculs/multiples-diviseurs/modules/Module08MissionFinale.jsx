import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import RectangleArray from '../components/RectangleArray';
import FactorTree from '../components/FactorTree';
import {
  divisorPairs, divisors, primeFactors, formatFactorization, autoTree, digitSum,
  gcd, lcm, simplifyFraction, formatClock, mirrorThreshold, primesUpTo,
} from '../components/divisibilityUtils';

/**
 * Module 8 — Boss Final « La fête du collège » (moteur du kit, QCM
 * uniquement). Fichier de DONNÉES.
 *
 * Épreuves écrites EN DERNIER : chaque distracteur encode un piège
 * réellement travaillé dans les modules 1 à 7 —
 *   · inverser multiple et diviseur (M1 : « 4 est un multiple de 36 »)
 *   · croire premier un impair « qui a l'air » premier (M5 : 51, 57, 91)
 *   · s'arrêter au dernier chiffre pour 3 et 9 (M3 : 4 725 « par 5 seulement »)
 *   · oublier 1 et n dans la liste des diviseurs, ou compter les paires (M4)
 *   · additionner ou multiplier deux rythmes (M7 : 12 + 18, 12 × 18)
 *   · laisser une feuille non première dans une décomposition (M6 : 4 × 9 × 5)
 *   · ne simplifier qu'en partie (M7 : 42/63, 14/21)
 *   · confondre facteurs communs et facteurs réunis (M7 : 7 h 06 vs 7 h 36)
 *
 * Couverture des 10 LPs : P1 (e1), P2 (e2), P3 (e3), P4 (e4), P5 (e5),
 * P6 + P9 (e6), P7 (e7), P8 (e8), P9 (e9), P10 + P8 (e10).
 */

const N36 = 36;
const PAIRS_36 = divisorPairs(N36);
const BUS_A = 12;
const BUS_B = 18;
const DEPART = 7 * 60;
const MEET = lcm(BUS_A, BUS_B);
const FRAC = simplifyFraction(84, 126);

const REGISTRE = [
  { id: 'chaises', emoji: '🪑', label: 'Chaises', value: '36' },
  { id: 'grille', emoji: '🎟️', label: 'Tombola', value: '1 → 50' },
  { id: 'arbre', emoji: '🎁', label: 'Arbre de', value: '60' },
  { id: 'bus', emoji: '🚌', label: 'Bus', value: '12 / 18' },
];

const SKILLS = {
  relation: { label: 'La relation multiple / diviseur', module: 1 },
  reconnaitre: { label: 'Reconnaître multiple ou diviseur', module: 2 },
  criteres: { label: 'Les critères de divisibilité', module: 3 },
  diviseurs: { label: 'Trouver tous les diviseurs', module: 4 },
  premiers: { label: 'Reconnaître un nombre premier', module: 5 },
  decomposition: { label: 'Décomposer en facteurs premiers', module: 6 },
  problemes: { label: 'Utiliser les décompositions', module: 7 },
};

const EPREUVES = [
  {
    id: 'md-e1',
    skill: 'relation',
    title: 'Épreuve 1',
    prompt: 'Les 36 chaises sont rangées en 4 rangées de 9 : 36 = 4 × 9. Quelle phrase est vraie ?',
    options: [
      '36 est un multiple de 4',
      '4 est un multiple de 36',
      '36 est un diviseur de 4',
      '9 est un multiple de 36',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Le multiple, c’est le grand nombre — le nombre de chaises. Le diviseur, c’est le petit — le nombre de rangées. Donc 36 est un multiple de 4, et 4 est un diviseur de 36. Un multiple de 36 vaut au moins 36 : ni 4 ni 9 ne peuvent en être un.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_multiples-diviseurs_P1'] },
  },
  {
    id: 'md-e2',
    skill: 'reconnaitre',
    title: 'Épreuve 2',
    prompt: 'Le stand de crêpes a vendu 91 parts, par plaques de 7. 91 est-il un multiple de 7 ?',
    options: [
      'Oui, 91 = 7 × 13',
      'Non, 91 est premier',
      'Non, 91 est impair donc il ne peut pas être un multiple',
      'Oui, car 9 + 1 = 10',
    ],
    cols: 1,
    correct: 0,
    explain: `91 = 7 × 13 : le compte tombe juste, 91 est bien un multiple de 7 (et 7 est un diviseur de 91). 91 n’est donc pas premier — c’est le faux premier classique. Être impair n’empêche pas d’être un multiple : 21, 35 et 91 sont tous des multiples impairs de 7. Et la somme des chiffres ne sert que pour 3 et 9.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_multiples-diviseurs_P2'] },
  },
  {
    id: 'md-e3',
    skill: 'criteres',
    title: 'Épreuve 3',
    prompt: 'Le lot de tombola porte le numéro 4 725. Par quels nombres est-il divisible ?',
    extra: (
      <p className="text-sm font-mono text-slate-600 text-center py-1">
        4 + 7 + 2 + 5 = {digitSum(4725)}
      </p>
    ),
    options: ['Par 3, 5 et 9', 'Par 5 seulement', 'Par 2 et 5', 'Par 2, 5 et 10'],
    cols: 2,
    correct: 0,
    explain: `Il se termine par 5 : divisible par 5, mais pas par 2 ni par 10 (il est impair et ne finit pas par 0). Sa somme des chiffres vaut ${digitSum(4725)}, qui est dans la table de 3 ET de 9 : il est donc aussi divisible par 3 et par 9. S’arrêter au dernier chiffre, c’est passer à côté des critères de 3 et 9.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_multiples-diviseurs_P3'] },
  },
  {
    id: 'md-e4',
    skill: 'diviseurs',
    title: 'Épreuve 4',
    prompt: 'On veut ranger 28 gobelets en rectangles. Combien 28 a-t-il de diviseurs ?',
    options: ['6', '5', '3', '4'],
    cols: 4,
    correct: 0,
    explain: `Les paires : ${divisorPairs(28).map(([a, b]) => `${a} × ${b}`).join(', ')} — donc les diviseurs sont ${divisors(28).join(', ')}, soit ${divisors(28).length}. Répondre 3, c’est avoir compté les paires au lieu des nombres ; répondre 5, c’est avoir oublié 1 ou 28, qui sont toujours des diviseurs.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_multiples-diviseurs_P4'] },
  },
  {
    id: 'md-e5',
    skill: 'reconnaitre',
    title: 'Épreuve 5',
    prompt: 'Les tables se remplissent par 6 ou par 8. Lequel de ces nombres est un multiple à la fois de 6 et de 8 ?',
    options: ['14', '36', '48', '68'],
    cols: 4,
    correct: 2,
    explain: `48 = 6 × 8 = 8 × 6 : multiple des deux. 14 = 6 + 8, une addition — deux rythmes ne s’additionnent pas. 36 est multiple de 6 (36 = 6 × 6) mais pas de 8 (36 ÷ 8 laisse un reste de 4). 68 n’est multiple ni de l’un ni de l’autre. Le plus petit multiple commun de 6 et 8 est d’ailleurs ${lcm(6, 8)}.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_multiples-diviseurs_P5'] },
  },
  {
    id: 'md-e6',
    skill: 'premiers',
    title: 'Épreuve 6',
    prompt: 'Parmi ces quatre numéros de ticket, lequel est un nombre premier ?',
    options: ['51', '57', '59', '91'],
    cols: 4,
    correct: 2,
    explain: `59 n’est divisible ni par 2, ni par 3 (5 + 9 = ${digitSum(59)}), ni par 5, ni par 7 — et 11 × 11 = 121 dépasse 59, donc on peut s’arrêter : 59 est premier. Les trois autres sont des pièges : 51 = 3 × 17 (5 + 1 = ${digitSum(51)}), 57 = 3 × 19 (5 + 7 = ${digitSum(57)}) et 91 = 7 × 13. Être impair ne suffit pas à être premier.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_multiples-diviseurs_P6', '3e_multiples-diviseurs_P9'] },
  },
  {
    id: 'md-e7',
    skill: 'decomposition',
    title: 'Épreuve 7',
    prompt: 'Quelle est la décomposition en produit de facteurs premiers de 180 ?',
    options: [
      '$2^{2}\\times 3^{2}\\times 5$',
      '$4\\times 9\\times 5$',
      '$2^{2}\\times 45$',
      '$2\\times 3\\times 5$',
    ],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['2² × 3² × 5', '4 × 9 × 5', '2² × 45', '2 × 3 × 5'][i],
    cols: 2,
    correct: 0,
    explain: `180 = ${primeFactors(180).join(' × ')} = ${formatFactorization(180)}. Dans « 4 × 9 × 5 », ni 4 ni 9 ne sont premiers : ce sont des feuilles pas encore coupées. Dans « 2² × 45 », 45 se coupe encore (45 = 9 × 5). Et 2 × 3 × 5 = 30, pas 180 : il manque des facteurs.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_multiples-diviseurs_P7'] },
  },
  {
    id: 'md-e8',
    skill: 'problemes',
    title: 'Épreuve 8',
    prompt: 'Sur 126 tickets vendus, 84 sont gagnants. Quelle est la fraction 84/126 simplifiée au MAXIMUM ?',
    options: ['2/3', '42/63', '14/21', '4/6'],
    cols: 4,
    correct: 0,
    explain: `84 = ${primeFactors(84).join(' × ')} et 126 = ${primeFactors(126).join(' × ')} : leurs facteurs communs sont ${FRAC.dividedBy.join(' × ')} = ${gcd(84, 126)}. En divisant les deux par ${gcd(84, 126)} : ${FRAC.num}/${FRAC.den}. 42/63 (divisé par 2 seulement) et 14/21 (divisé par 6) valent bien la même chose, mais il leur reste des facteurs communs : ce ne sont pas les formes irréductibles. 4/6 non plus — et ce n’est même pas égal à 84/126.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_multiples-diviseurs_P8'] },
  },
  {
    id: 'md-e9',
    skill: 'premiers',
    title: 'Épreuve 9',
    prompt: 'Le nombre de couverts n est un multiple de 12. De quel autre nombre est-il forcément un multiple ?',
    options: ['24', '6', '5', '18'],
    cols: 4,
    correct: 1,
    explain:
      'Si n = 12 × k, alors n = 6 × (2k) : n est aussi un multiple de 6, parce que 6 divise 12. La règle : tout multiple de 12 est multiple de chacun des diviseurs de 12 (1, 2, 3, 4, 6, 12). L’inclusion ne marche pas dans l’autre sens : 12 est un multiple de 12 mais pas de 24, ni de 18, ni de 5.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_multiples-diviseurs_P9'] },
  },
  {
    id: 'md-e10',
    skill: 'problemes',
    title: 'Épreuve 10',
    prompt: `Devant le collège, un bus part toutes les ${BUS_A} min et un autre toutes les ${BUS_B} min. Ils partent ensemble à ${formatClock(DEPART)}. À quelle heure repartiront-ils ensemble ?`,
    options: [
      formatClock(DEPART + MEET),
      formatClock(DEPART + BUS_A + BUS_B),
      formatClock(DEPART + BUS_A * BUS_B),
      formatClock(DEPART + gcd(BUS_A, BUS_B)),
    ],
    cols: 4,
    correct: 0,
    explain: `${BUS_A} = ${primeFactors(BUS_A).join(' × ')} et ${BUS_B} = ${primeFactors(BUS_B).join(' × ')} : en réunissant tous les facteurs (sans compter deux fois les communs) on obtient ${MEET} min, donc ${formatClock(DEPART + MEET)}. ${formatClock(DEPART + BUS_A + BUS_B)} vient de l’addition ${BUS_A} + ${BUS_B} — deux rythmes ne s’additionnent pas. ${formatClock(DEPART + BUS_A * BUS_B)} vient du produit : c’est bien un rendez-vous, mais pas le premier. ${formatClock(DEPART + gcd(BUS_A, BUS_B))} vient des facteurs communs, qui servent à découper (le plus grand carreau), pas à se retrouver.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_multiples-diviseurs_P10', '3e_multiples-diviseurs_P8'] },
  },
];

const BADGES = [
  { id: 'lecture', emoji: '🏅', label: 'Lecteur des deux sens', test: (s) => (s.relation ?? 0) === 0 },
  { id: 'detecteur', emoji: '🏅', label: 'Détective des multiples', test: (s) => (s.reconnaitre ?? 0) === 0 },
  { id: 'criteres', emoji: '🏅', label: 'Roi des critères', test: (s) => (s.criteres ?? 0) === 0 },
  { id: 'rectangle', emoji: '🏅', label: 'Maître du Rectangle-Détecteur', test: (s) => (s.diviseurs ?? 0) === 0 },
  { id: 'crible', emoji: '🏅', label: 'Cribleur', test: (s) => (s.premiers ?? 0) === 0 },
  { id: 'arbre', emoji: '🏅', label: 'Bûcheron des facteurs', test: (s) => (s.decomposition ?? 0) === 0 },
  { id: 'labo', emoji: '🏅', label: 'Chef du labo', test: (s) => (s.problemes ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Sans faute', test: (s) => Object.values(s).every((v) => v === 0) },
];

const PIEGES = [
  { wrong: '« 4 est un multiple de 36 »', right: 'Le multiple est le grand nombre : 36 = 4 × 9' },
  { wrong: '« 4 725 est divisible par 5 seulement »', right: `Somme des chiffres ${digitSum(4725)} → aussi par 3 et par 9` },
  { wrong: '« 51 et 91 sont premiers »', right: '51 = 3 × 17 et 91 = 7 × 13 : impair ≠ premier' },
  { wrong: '« 180 = 4 × 9 × 5 est une décomposition »', right: '4 et 9 se coupent encore : 2² × 3² × 5' },
  { wrong: '« Les bus se retrouvent après 12 + 18 = 30 min »', right: `Facteurs réunis : ${MEET} min, soit ${formatClock(DEPART + MEET)}` },
];

function Synthese() {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-3 text-center">
        <div className="text-2xl" aria-hidden="true">🔢</div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
          Un seul fait, deux lectures : 36 = 4 × 9 dit que 36 est un multiple de 4 <em>et</em> que 4
          est un diviseur de 36. Et ce fait a une forme — un rectangle.
        </p>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2">
        <p className="text-sm font-semibold text-slate-700 text-center">
          Le Rectangle-Détecteur, toutes les paires de 36 gardées
        </p>
        <RectangleArray
          n={N36}
          rows={6}
          onRowsChange={() => {}}
          stamped={PAIRS_36}
          disabled
          maxChip={6}
          ariaLabel="Synthèse : les 36 chaises et leurs cinq paires de diviseurs"
        />
        <p className="text-center text-xs text-slate-500">
          Au-delà de {mirrorThreshold(N36)} rangées, les paires se répètent à l’envers : inutile de
          chercher plus loin.
        </p>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2">
        <p className="text-sm font-semibold text-slate-700 text-center">
          Et la carte d’identité définitive : l’arbre de 60
        </p>
        <FactorTree tree={autoTree(60)} frozen caption={`60 = ${formatFactorization(60)}`} />
      </div>

      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-2xl p-5 text-center space-y-1">
        <p className="text-xs uppercase tracking-wide text-cyan-100 font-mono font-bold">
          Les critères, en une ligne chacun
        </p>
        <p className="font-mono font-extrabold text-sm sm:text-base">
          Par 2, 5, 10 : le dernier chiffre
        </p>
        <p className="font-mono font-extrabold text-sm sm:text-base">
          Par 3 et 9 : la somme des chiffres
        </p>
        <p className="font-mono font-extrabold text-sm sm:text-base">
          Premier : exactement deux diviseurs
        </p>
      </div>

      <div className="bg-white border-2 border-emerald-200 rounded-2xl p-4 space-y-1.5 text-center">
        <p className="text-xs font-mono uppercase tracking-wide text-emerald-600">
          Les {primesUpTo(50).length} premiers jusqu’à 50
        </p>
        <p className="font-mono font-bold text-emerald-800 text-sm">{primesUpTo(50).join(' · ')}</p>
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
        Facteurs <strong>communs</strong> pour découper au plus grand (fraction irréductible, plus
        grand carreau) ; facteurs <strong>réunis</strong> pour se retrouver au plus tôt (les bus).
        Le même outil, deux questions différentes.
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
      moduleTitle="🏆 Mission finale : la fête du collège"
      moduleSubtitle="Dix épreuves pour monter la fête sans une erreur de division."
      estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'La fête, c’est aujourd’hui. Chaque rangement doit tomber juste.',
        tone: 'amber',
        body: (
          <p>
            Chaises, tickets, cadeaux, sol à carreler, bus à attraper : tout ce que tu as manipulé.
            Réponds aux dix épreuves, puis valide pour voir ta correction et tes badges.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Patron de la fête !',
        title: 'Fête réussie !',
        message: (
          <>
            Des 36 chaises au dernier bus, tu as rangé, crible, coupé et décomposé — sans confondre
            un multiple avec un diviseur, ni un impair avec un premier.
          </>
        ),
        verbs: ['Ranger', 'Cribler', 'Décomposer', 'Résoudre'],
        masterBadgeLabel: 'Badge « Patron de la fête » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
