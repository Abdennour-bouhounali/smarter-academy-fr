import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import DotPlot from '../components/DotPlot';
import { mean, median, range, effectifs } from '../components/statUtils';
import { TRAJETS, CLASSE_A, CLASSE_B, AXE } from '../components/trajetData';
import { formatDec, roundTo } from '@smarter-academy/core';

/**
 * Module 8 — 🏆 MISSION FINALE : « Le journal du collège ».
 *
 * Fichier de DONNÉES : dix épreuves QCM, silencieuses jusqu'à un unique envoi.
 * Écrites EN DERNIER, chaque distracteur reprenant un piège de la leçon :
 *   e1  valeur confondue avec effectif (module 1)
 *   e2  effectif total lu comme nombre de valeurs distinctes (module 1)
 *   e3  moyenne calculée sans les effectifs (module 5)
 *   e4  médiane prise dans la liste NON triée (module 3)
 *   e5  médiane d'un effectif pair supposée appartenir à la série (module 3)
 *   e6  étendue confondue avec le maximum (module 3)
 *   e7  médiane supposée suivre la moyenne (module 4)
 *   e8  influence d'une valeur mal évaluée (module 4)
 *   e9  moyenne prise pour un résumé suffisant (module 6)
 *   e10 affirmation trompeuse acceptée (module 7)
 *
 * Couverture des Learning Points : P2 (e1, e2), P3 (e3, e8), P4 (e4, e5, e7),
 * P5 (e6), P7 (e7, e8), P1 (e2), P6 (e9), P8 (e9), P9 (e10), P10 (e10).
 */

const M = roundTo(mean(TRAJETS), 2);
const MED = median(TRAJETS);
const RNG = range(TRAJETS);

const REGISTRE = [
  { id: 'classe', emoji: '🚌', label: 'La classe', value: '12 trajets' },
  { id: 'moyenne', emoji: '⚖️', label: 'Moyenne', value: 'point d’équilibre' },
  { id: 'mediane', emoji: '✂️', label: 'Médiane', value: 'coupe l’effectif' },
  { id: 'etendue', emoji: '↔️', label: 'Étendue', value: 'max − min' },
];

const SKILLS = {
  organiser: { label: 'Lire et organiser une série', module: 1 },
  moyenne: { label: 'Calculer et interpréter une moyenne', module: 2 },
  mediane: { label: 'Médiane et étendue', module: 3 },
  influence: { label: "L'influence d'une valeur", module: 4 },
  choisir: { label: 'Choisir le bon indicateur', module: 5 },
  interpreter: { label: 'Interpréter dans le contexte', module: 6 },
};

const EPREUVES = [
  {
    id: 'st-e1',
    skill: 'organiser',
    title: 'Épreuve 1',
    prompt: 'Dans une série, trois élèves annoncent 15 min. Que vaut 3 dans cette phrase ?',
    options: ["L'effectif de la valeur 15", 'Une valeur de la série', 'La moyenne', "L'étendue"],
    cols: 1,
    correct: 0,
    explain: "15 est la VALEUR (un temps, lu sur l'axe) ; 3 est son EFFECTIF (le nombre d'élèves concernés, lu sur la hauteur de la pile). Les deux nombres décrivent des choses différentes.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_statistiques-3e_P2'] },
  },
  {
    id: 'st-e2',
    skill: 'organiser',
    title: 'Épreuve 2',
    prompt: 'Une série comporte 9 temps différents, annoncés par 12 élèves au total. Quel est son effectif ?',
    options: ['12', '9', '21', '3'],
    cols: 2,
    correct: 0,
    explain: "L'effectif total est le nombre de données, donc d'élèves : 12. Les 9 temps distincts sont les valeurs prises par la série — additionner les hauteurs de piles redonne toujours l'effectif.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_statistiques-3e_P1', '3e_statistiques-3e_P2'] },
  },
  {
    id: 'st-e3',
    skill: 'moyenne',
    title: 'Épreuve 3',
    prompt: 'Un tableau donne : 10 min (2 élèves), 15 min (3 élèves), 20 min (5 élèves). Quelle est la moyenne ?',
    options: ['16,5 min', '15 min', '45 min', '11,25 min'],
    cols: 2,
    correct: 0,
    explain: "Chaque temps compte autant de fois qu'il y a d'élèves : (10×2 + 15×3 + 20×5) ÷ 10 = 165 ÷ 10 = 16,5 min. Diviser par 3 (le nombre de temps distincts) reviendrait à ignorer les effectifs.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_statistiques-3e_P3'] },
  },
  {
    id: 'st-e4',
    skill: 'mediane',
    title: 'Épreuve 4',
    prompt: 'Cinq temps sont relevés dans cet ordre : 20, 5, 15, 8, 12. Quelle est la médiane ?',
    options: ['12 min', '15 min', '20 min', '60 min'],
    cols: 2,
    correct: 0,
    explain: "Il faut RANGER d'abord : 5, 8, 12, 15, 20. La valeur du milieu est alors 12. Prendre le troisième nombre de la liste non triée donnerait 15 — c'est l'erreur classique.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_statistiques-3e_P4'] },
  },
  {
    id: 'st-e5',
    skill: 'mediane',
    title: 'Épreuve 5',
    prompt: 'Quatre temps rangés : 4, 6, 9, 11. Quelle est la médiane ?',
    options: ['7,5 min', '6 min', '9 min', 'Il n’y en a pas'],
    cols: 2,
    correct: 0,
    explain: "Avec un effectif pair, la médiane est la moyenne des deux valeurs centrales : (6 + 9) ÷ 2 = 7,5. Elle n'appartient pas à la série, et c'est parfaitement normal.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_statistiques-3e_P4'] },
  },
  {
    id: 'st-e6',
    skill: 'mediane',
    title: 'Épreuve 6',
    prompt: `Les trajets vont de ${formatDec(Math.min(...TRAJETS))} à ${formatDec(Math.max(...TRAJETS))} min. Quelle est l'étendue ?`,
    options: [`${formatDec(RNG)} min`, `${formatDec(Math.max(...TRAJETS))} min`, '12 min', `${formatDec(MED)} min`],
    cols: 2,
    correct: 0,
    explain: `L'étendue est l'ÉCART entre les extrêmes : ${formatDec(Math.max(...TRAJETS))} − ${formatDec(Math.min(...TRAJETS))} = ${formatDec(RNG)} min. Donner le maximum seul reviendrait à confondre une valeur avec un écart.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_statistiques-3e_P5'] },
  },
  {
    id: 'st-e7',
    skill: 'influence',
    title: 'Épreuve 7',
    prompt: 'L’élève le plus éloigné déménage encore plus loin. Que deviennent les indicateurs ?',
    options: [
      'La moyenne augmente, la médiane ne bouge pas',
      'Les deux augmentent également',
      'Aucun ne bouge',
      'Seule la médiane augmente',
    ],
    cols: 1,
    correct: 0,
    explain: "La moyenne additionne toutes les valeurs : allonger un trajet augmente le total, donc la moyenne. La médiane ne regarde que le RANG — et le plus éloigné reste le plus éloigné, donc elle ne bouge pas.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_statistiques-3e_P4', '3e_statistiques-3e_P7'] },
  },
  {
    id: 'st-e8',
    skill: 'influence',
    title: 'Épreuve 8',
    prompt: 'Dans une classe de 20 élèves, un trajet augmente de 40 min. De combien la moyenne augmente-t-elle ?',
    options: ['2 min', '40 min', '20 min', 'Elle ne change pas'],
    cols: 2,
    correct: 0,
    explain: "Déplacer une valeur de Δ décale la moyenne de Δ divisé par l'effectif : 40 ÷ 20 = 2 min. Une seule donnée pèse donc d'autant moins que la classe est nombreuse.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_statistiques-3e_P3', '3e_statistiques-3e_P7'] },
  },
  {
    id: 'st-e9',
    skill: 'choisir',
    title: 'Épreuve 9',
    prompt: 'Deux classes ont la même moyenne (15 min) et la même médiane. Peut-on conclure qu’elles se ressemblent ?',
    options: [
      'Non : leurs étendues peuvent être très différentes',
      'Oui : deux indicateurs identiques suffisent',
      'Oui, si elles ont le même effectif',
      'Impossible à dire sans le mode',
    ],
    cols: 1,
    correct: 0,
    explain: "Une classe peut être resserrée entre 13 et 17 min pendant que l'autre s'étale de 5 à 25 min, avec exactement les mêmes moyenne et médiane. C'est la DISPERSION qui les sépare, et il faut l'étendue pour la voir.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_statistiques-3e_P6', '3e_statistiques-3e_P8'] },
  },
  {
    id: 'st-e10',
    skill: 'interpreter',
    title: 'Épreuve 10',
    prompt: '« La moyenne est de 16 min, donc la plupart des élèves mettent environ 16 min. » Cette phrase est-elle correcte ?',
    options: [
      'Non : la moyenne ne dit rien du nombre d’élèves proches d’elle',
      'Oui, c’est ce que signifie une moyenne',
      'Oui, si l’effectif dépasse 20 élèves',
      'Non, car la moyenne est toujours fausse',
    ],
    cols: 1,
    correct: 0,
    explain: "La moyenne peut ne correspondre à aucun élève : si la moitié met 5 min et l'autre 27 min, elle vaut 16 alors que personne ne met 16 min. Pour parler de « la plupart », il faut regarder la dispersion.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_statistiques-3e_P9', '3e_statistiques-3e_P10'] },
  },
];

const BADGES = [
  { id: 'organiser', emoji: '🏅', label: 'Archiviste', test: (s) => (s.organiser ?? 0) === 0 },
  { id: 'moyenne', emoji: '🏅', label: 'Maître de l’équilibre', test: (s) => (s.moyenne ?? 0) === 0 },
  { id: 'mediane', emoji: '🏅', label: 'Coupeur en deux', test: (s) => (s.mediane ?? 0) === 0 },
  { id: 'influence', emoji: '🏅', label: 'Détecteur d’influence', test: (s) => (s.influence ?? 0) === 0 },
  { id: 'choisir', emoji: '🏅', label: 'Bon choix d’indicateur', test: (s) => (s.choisir ?? 0) === 0 },
  { id: 'interpreter', emoji: '🏅', label: 'Lecteur critique', test: (s) => (s.interpreter ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Sans faute', test: (s) => Object.values(s).every((v) => v === 0) },
];

const PIEGES = [
  { wrong: 'La hauteur d’une pile est une valeur', right: 'C’est un effectif : la valeur se lit sur l’axe' },
  { wrong: 'La moyenne se calcule sans les effectifs', right: 'Chaque valeur compte autant de fois qu’elle apparaît' },
  { wrong: 'La médiane est le nombre du milieu de la liste', right: 'De la liste TRIÉE — et parfois entre deux valeurs' },
  { wrong: 'Éloigner un extrême déplace tout', right: 'La moyenne suit, la médiane ne bouge pas' },
  { wrong: 'La moyenne résume la série', right: 'Deux séries de même moyenne peuvent tout opposer' },
];

/** Synthèse : la série signature figée, avec ses trois repères. */
function Synthese() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-slate-900 text-white p-4 text-center space-y-1">
        <p className="text-2xl">⚖️ ✂️ ↔️</p>
        <p className="font-bold">Trois façons de résumer, trois réponses</p>
        <p className="text-slate-300 text-sm">
          Moyenne {formatDec(M)} · médiane {formatDec(MED)} · étendue {formatDec(RNG)} minutes.
        </p>
      </div>

      <DotPlot
        values={TRAJETS}
        min={AXE.min}
        max={AXE.max}
        step={AXE.step}
        mode="display"
        showMean
        showMedian
        showRange
        frozen
        ariaLabel="Synthèse : la série des trajets et ses trois indicateurs"
      />

      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
        <p className="font-bold text-slate-800">Le choix de l’indicateur</p>
        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
          <li><strong>Un total à répartir</strong> → la moyenne.</li>
          <li><strong>Un cas typique</strong>, sans se laisser tirer par les extrêmes → la médiane.</li>
          <li><strong>Un écart, une dispersion</strong> → l’étendue.</li>
          <li>Une comparaison sérieuse en regarde <strong>plusieurs</strong>, jamais un seul.</li>
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
        Un indicateur résume, donc il perd de l’information. Savoir lequel choisir — et ce
        qu’il cache — c’est tout le travail du statisticien.
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
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le journal du collège"
      moduleSubtitle="Dix épreuves pour publier des chiffres qui ne mentent pas."
      estimatedTime="15 min"
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'Dix chiffres à vérifier',
        tone: 'amber',
        body: (
          <p>
            Aucune correction avant la fin : réponds aux dix épreuves, puis valide en une
            fois. Tu verras ensuite ton profil et la synthèse.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Rédacteur en chef !',
        title: 'Numéro bouclé !',
        message: (
          <>
            Des douze trajets jusqu’à l’affirmation trompeuse du journal, tu as calculé,
            comparé et surtout choisi — sans jamais laisser un seul chiffre parler pour
            toute une classe.
          </>
        ),
        verbs: ['Organiser', 'Calculer', 'Comparer', 'Interpréter'],
        masterBadgeLabel: 'Badge « Rédacteur en chef » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
