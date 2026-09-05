import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import DiceLab, { theoryFor } from '../components/DiceLab';
import OutcomeGrid from '../components/OutcomeGrid';
import { makeRng } from '@smarter-academy/core';
import { ZERO, rollMany, sumCells, cellKey } from '../components/probaUtils';

/**
 * Module 7 — 🏆 MISSION FINALE : « Le tournoi ».
 *
 * Fichier de DONNÉES : dix épreuves QCM, silencieuses jusqu'à un unique envoi.
 * Écrites EN DERNIER, chaque distracteur reprenant un piège de la leçon :
 *   e1  une situation non aléatoire prise pour aléatoire (module 1)
 *   e2  compter les événements au lieu des issues (module 2)
 *   e3  inclure la borne dans « plus de » (module 2)
 *   e4  fraction non réduite / dénominateur = favorables (module 3)
 *   e5  dénominateur = les autres couleurs (module 3)
 *   e6  fréquence prise pour la probabilité (module 1)
 *   e7  « exactement égales » (module 1)
 *   e8  1/11 pour la somme de deux dés (module 4)
 *   e9  0,9 = certain (module 5)
 *   e10 P × n mal calculé (modules 5–6)
 *
 * Couverture des Learning Points : P1 (e1), P2 (e2), P3 (e3), P4 (e9), P5 (e4, e8),
 * P6 (e4, e5), P7 (e6), P8 (e6), P9 (e7), P10 (e5, e8), P11 (e9, e10), P12 (e10).
 */

const SERIES = rollMany(ZERO, 1000, makeRng(20260905 + 7)).counts;
const GRID7 = new Set(sumCells(7).map(([a, b]) => cellKey(a, b)));

const REGISTRE = [
  { id: 'de', emoji: '🎲', label: 'Un dé', value: '6 issues' },
  { id: 'deux', emoji: '🎲🎲', label: 'Deux dés', value: '36 couples' },
  { id: 'p', emoji: '📏', label: 'P(A)', value: 'favorables ÷ possibles' },
  { id: 'freq', emoji: '📊', label: 'Fréquence', value: 'se rapproche de P' },
];

const SKILLS = {
  hasard: { label: 'Expérience aléatoire et issues', module: 1 },
  evenements: { label: 'Événements', module: 2 },
  calcul: { label: 'Calculer une probabilité', module: 3 },
  frequence: { label: 'Fréquences et stabilisation', module: 1 },
  deuxdes: { label: 'Deux dés', module: 4 },
  interpreter: { label: 'Interpréter et résoudre', module: 6 },
};

const tex = (o) => <MathText>{o}</MathText>;

const EPREUVES = [
  {
    id: 'pb-e1',
    skill: 'hasard',
    title: 'Épreuve 1',
    prompt: 'Laquelle de ces situations est une expérience aléatoire ?',
    options: ['Tirer une carte au hasard dans un jeu de 32 cartes', 'Calculer 3 × 4', 'Mesurer la longueur d’une table avec un mètre', 'Compter les élèves présents'],
    cols: 1,
    correct: 0,
    explain: 'Une expérience aléatoire a plusieurs issues possibles et un résultat imprévisible avant de la faire : c’est le cas du tirage d’une carte. Un calcul ou une mesure ont un résultat déterminé.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_probabilites-3e_P1'] },
  },
  {
    id: 'pb-e2',
    skill: 'hasard',
    title: 'Épreuve 2',
    prompt: 'On lance une pièce de monnaie. Combien y a-t-il d’issues possibles ?',
    options: ['2 : pile ou face', '1 : la pièce tombe', '4 : pile, face, tranche, perdue', 'Cela dépend de la force du lancer'],
    cols: 1,
    correct: 0,
    explain: 'Les issues sont les résultats possibles : pile ou face, donc 2. (On ne compte pas la tranche dans le modèle habituel.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_probabilites-3e_P2'] },
  },
  {
    id: 'pb-e3',
    skill: 'evenements',
    title: 'Épreuve 3',
    prompt: 'On lance un dé à six faces. Quelles issues réalisent l’événement « obtenir au moins 5 » ?',
    options: ['5 et 6', '4, 5 et 6', '6 seulement', '1, 2, 3 et 4'],
    cols: 2,
    correct: 0,
    explain: '« Au moins 5 » signifie 5 ou plus : les faces 5 et 6. Un événement est l’ensemble des issues qui le réalisent.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_probabilites-3e_P3'] },
  },
  {
    id: 'pb-e4',
    skill: 'calcul',
    title: 'Épreuve 4',
    prompt: 'On lance un dé équilibré. Quelle est la probabilité d’obtenir un nombre pair ?',
    options: ['$\\frac{3}{6} = \\frac{1}{2}$', '$\\frac{3}{3}$', '$\\frac{1}{6}$', '$\\frac{2}{6}$'],
    renderOption: tex,
    optionLabel: (i) => ['3/6 = 1/2', '3/3', '1/6', '2/6'][i],
    cols: 2,
    correct: 0,
    explain: '3 faces paires (2, 4, 6) sur 6 faces possibles : P = 3/6 = 1/2. Le dénominateur est le nombre TOTAL d’issues, pas le nombre de faces favorables.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_probabilites-3e_P5', '3e_probabilites-3e_P6'] },
  },
  {
    id: 'pb-e5',
    skill: 'calcul',
    title: 'Épreuve 5',
    prompt: 'Un sac contient 5 billes rouges, 3 bleues et 2 vertes. On tire une bille au hasard. Quelle est la probabilité qu’elle soit bleue ?',
    options: ['$\\frac{3}{10}$', '$\\frac{3}{7}$', '$\\frac{1}{3}$', '$\\frac{3}{5}$'],
    renderOption: tex,
    optionLabel: (i) => ['3/10', '3/7', '1/3', '3/5'][i],
    cols: 2,
    correct: 0,
    explain: '3 bleues sur 5 + 3 + 2 = 10 billes : P = 3/10. Diviser par 7 (les autres billes) ou par 3 (le nombre de couleurs) oublie que TOUTES les billes sont des issues.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_probabilites-3e_P6', '3e_probabilites-3e_P10'] },
  },
  {
    id: 'pb-e6',
    skill: 'frequence',
    title: 'Épreuve 6',
    prompt: 'On lance 100 fois un dé équilibré et on obtient 22 fois le 4. Que peut-on dire ?',
    options: [
      '22 % est la fréquence observée ; la probabilité du 4 reste 1/6 ≈ 16,7 %',
      'La probabilité d’obtenir 4 est 22 %',
      'Le dé est forcément truqué',
      'Sur 1 000 lancers, la fréquence sera exactement 16,7 %',
    ],
    cols: 1,
    correct: 0,
    explain: '22 sur 100 est une FRÉQUENCE, le résultat d’une expérience. La PROBABILITÉ, 1/6, vient du modèle du dé équilibré. Un écart de 5 points sur 100 lancers est ordinaire.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_probabilites-3e_P7', '3e_probabilites-3e_P8'] },
  },
  {
    id: 'pb-e7',
    skill: 'frequence',
    title: 'Épreuve 7',
    prompt: 'Quand on augmente le nombre de lancers d’un dé équilibré, les fréquences des six faces…',
    options: [
      'se rapprochent de 1/6 sans être obligées de l’égaler exactement',
      'deviennent exactement égales à 1/6',
      's’éloignent les unes des autres',
      'ne changent pas : le hasard reste le hasard',
    ],
    cols: 1,
    correct: 0,
    explain: 'C’est la stabilisation des fréquences : sur 10 lancers les écarts sont énormes, sur 1 000 ils sont petits — mais jamais nuls à coup sûr.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_probabilites-3e_P9'] },
  },
  {
    id: 'pb-e8',
    skill: 'deuxdes',
    title: 'Épreuve 8',
    prompt: 'On lance deux dés équilibrés et on additionne. Quelle est la probabilité d’obtenir 7 ?',
    options: ['$\\frac{6}{36} = \\frac{1}{6}$', '$\\frac{1}{11}$', '$\\frac{1}{12}$', '$\\frac{7}{36}$'],
    renderOption: tex,
    optionLabel: (i) => ['6/36 = 1/6', '1/11', '1/12', '7/36'][i],
    cols: 2,
    correct: 0,
    explain: 'Les 36 couples (dé 1 ; dé 2) sont équiprobables, et 6 d’entre eux donnent 7 : P = 6/36 = 1/6. Les 11 sommes n’ont pas la même chance, donc 1/11 est faux.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_probabilites-3e_P5', '3e_probabilites-3e_P10'] },
  },
  {
    id: 'pb-e9',
    skill: 'interpreter',
    title: 'Épreuve 9',
    prompt: '« La probabilité que le bus soit à l’heure est 0,9, donc il sera à l’heure. » Cette phrase est-elle correcte ?',
    options: [
      'Non : 0,9 rend l’événement très probable, mais seul 1 le rend certain',
      'Oui : 0,9 est proche de 1',
      'Non : 0,9 est en fait une petite probabilité',
      'Oui, si le bus a été à l’heure les 9 derniers jours',
    ],
    cols: 1,
    correct: 0,
    explain: 'Une probabilité mesure une chance : 0,9 signifie environ 9 fois sur 10. Sur 10 jours, on peut s’attendre à un retard. Certain, c’est P = 1.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_probabilites-3e_P4', '3e_probabilites-3e_P11'] },
  },
  {
    id: 'pb-e10',
    skill: 'interpreter',
    title: 'Épreuve 10',
    prompt: 'Dans une loterie, chaque ticket a une probabilité de 2 % de gagner. On vend 500 tickets. Combien de gagnants peut-on prévoir, environ ?',
    options: ['10', '2', '100', '25'],
    cols: 2,
    correct: 0,
    explain: '2 % de 500 = 500 × 2/100 = 10 gagnants environ. La probabilité sert à prévoir une tendance sur beaucoup de tickets — pas le résultat d’un ticket.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_probabilites-3e_P11', '3e_probabilites-3e_P12'] },
  },
];

const BADGES = [
  { id: 'hasard', emoji: '🏅', label: 'Œil du hasard', test: (s) => (s.hasard ?? 0) === 0 },
  { id: 'evenements', emoji: '🏅', label: 'Compositeur d’événements', test: (s) => (s.evenements ?? 0) === 0 },
  { id: 'calcul', emoji: '🏅', label: 'Calculateur', test: (s) => (s.calcul ?? 0) === 0 },
  { id: 'frequence', emoji: '🏅', label: 'Maître des fréquences', test: (s) => (s.frequence ?? 0) === 0 },
  { id: 'deuxdes', emoji: '🏅', label: 'Lecteur de grille', test: (s) => (s.deuxdes ?? 0) === 0 },
  { id: 'interpreter', emoji: '🏅', label: 'Interprète', test: (s) => (s.interpreter ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Sans faute', test: (s) => Object.values(s).every((v) => v === 0) },
];

const PIEGES = [
  { wrong: 'Le 6 est plus difficile à obtenir', right: 'Sur 1 000 lancers, chaque face tourne autour de 1/6' },
  { wrong: 'Après trois 6, le 6 est plus (ou moins) probable', right: 'Le dé n’a pas de mémoire : chaque lancer repart de zéro' },
  { wrong: 'Fréquence = probabilité', right: 'La fréquence vient de l’expérience ; la probabilité, du modèle' },
  { wrong: '11 sommes, donc 1/11 chacune', right: 'Ce sont les 36 couples qui ont la même chance' },
  { wrong: '0,9 ⇒ certain', right: 'Seul 1 est certain ; 0,9 = environ 9 fois sur 10' },
];

/** Synthèse : le dé signature figé avec son repère 1/6, et la grille des 36 cas. */
function Synthese() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-slate-900 text-white p-4 text-center space-y-1">
        <p className="text-2xl">🎲 📊 📏</p>
        <p className="font-bold">Ce que le hasard cachait : un nombre entre 0 et 1</p>
        <p className="text-slate-300 text-sm">
          P(A) = issues favorables ÷ issues possibles — et les fréquences s’en rapprochent.
        </p>
      </div>

      <DiceLab counts={SERIES} lastFace={null} frozen showFreq theory={theoryFor(null)} hideDie caption="1 000 lancers d’un dé équilibré, avec le repère 1/6" />

      <OutcomeGrid selected={GRID7} onToggle={() => {}} frozen caption="Les 36 issues de deux dés — la somme 7 : 6 cases sur 36" />

      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
        <p className="font-bold text-slate-800">Le langage</p>
        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
          <li><strong>Expérience aléatoire</strong> : issues connues, résultat imprévisible.</li>
          <li><strong>Événement</strong> : un ensemble d’issues ; impossible (0) ou certain (1).</li>
          <li><strong>Probabilité</strong> : <MathText>{'$P(A) = \\dfrac{\\text{favorables}}{\\text{possibles}}$'}</MathText> quand les issues ont la même chance ; <MathText>{'$P(\\text{non } A) = 1 - P(A)$'}</MathText>.</li>
          <li><strong>Fréquence</strong> : effectif ÷ essais ; elle se stabilise vers P quand les essais se multiplient.</li>
        </ul>
      </div>

      <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4">
        <p className="font-bold text-rose-800 mb-2">Les pièges déjoués</p>
        <ul className="space-y-1.5 text-sm">
          {PIEGES.map((p) => (
            <li key={p.wrong} className="text-slate-700">
              <span className="text-rose-600">❌ {p.wrong}</span>
              <br />
              <span className="text-emerald-700">✅ {p.right}</span>
            </li>
          ))}
        </ul>
      </div>

      <Feedback tone="info">
        On ne prévoit jamais un lancer ; on prévoit mille lancers. C’est toute la puissance — et la limite — d’une probabilité.
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
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le tournoi"
      moduleSubtitle="Dix épreuves pour ne plus jamais confondre chance, fréquence et probabilité."
      estimatedTime="15 min"
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'Le tournoi du jeu de plateau',
        tone: 'amber',
        body: (
          <p>
            Aucune correction avant la fin : réponds aux dix épreuves, puis valide en une fois. Tu verras
            ensuite ton profil et la synthèse.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Maître du hasard !',
        title: 'Tournoi remporté !',
        message: (
          <>
            Du premier lancer au tirage au sort, tu as prédit, lancé, compté et calculé — et tu sais désormais
            ce qu’un nombre entre 0 et 1 peut dire, et ce qu’il ne dira jamais.
          </>
        ),
        verbs: ['Expérimenter', 'Compter', 'Calculer', 'Interpréter'],
        masterBadgeLabel: 'Badge « Maître du hasard » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
