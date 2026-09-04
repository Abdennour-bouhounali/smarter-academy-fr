import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import SquareBalance from '../components/SquareBalance';
import LadderScene from '../components/LadderScene';
import { FIGURES, ORIENTATIONS } from '../components/pythagoreUtils';

/**
 * Module 8 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Chaque distracteur
 * encode une erreur RÉELLEMENT rencontrée dans la leçon :
 *   - prendre le côté horizontal pour l'hypoténuse (M1) ;
 *   - additionner les longueurs au lieu des carrés (M2, M4) ;
 *   - oublier la racine carrée (M4) — l'erreur la plus fréquente ;
 *   - additionner quand il faut soustraire (M5) ;
 *   - accepter un côté plus long que l'hypoténuse (M5) ;
 *   - supposer l'angle droit dans une réciproque (M6).
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur.
 */
const EPREUVES = [
  {
    id: 'py-e1',
    skill: 'reperer',
    title: 'Trouver l’hypoténuse',
    prompt: 'ABC est rectangle en B. Quel côté est l’hypoténuse ?',
    options: ['[AC]', '[AB]', '[BC]', 'Celui qui est horizontal'],
    cols: 4,
    explain: 'L’hypoténuse est le côté opposé à l’angle droit. L’angle droit est en B, donc l’hypoténuse est le côté qui ne touche pas B : [AC]. L’orientation du dessin n’intervient jamais.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_pythagore-3e_P2', '3e_pythagore-3e_P3'] },
  },
  {
    id: 'py-e2',
    skill: 'reperer',
    title: 'Le plus grand côté',
    prompt: 'Dans un triangle rectangle, l’hypoténuse est…',
    options: [
      'toujours le plus grand des trois côtés',
      'toujours le plus petit',
      'toujours le côté du bas',
      'parfois le plus grand, parfois non',
    ],
    cols: 1,
    explain: 'L’hypoténuse fait face à l’angle droit, qui est le plus grand angle du triangle : elle est donc le plus long côté. C’est un contrôle rapide pour vérifier qu’on ne s’est pas trompé.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_pythagore-3e_P1'] },
  },
  {
    id: 'py-e3',
    skill: 'aires',
    title: 'La relation entre les carrés',
    extra: (
      <div className="my-2">
        <SquareBalance points={FIGURES.rect345} draggable={false}
          ariaLabel="Triangle rectangle 3-4-5 et les trois carrés construits sur ses côtés" />
      </div>
    ),
    prompt: 'Les côtés valent 3, 4 et 5. Quelle égalité est vraie ?',
    options: ['9 + 16 = 25', '3 + 4 = 5', '3 × 4 = 12', '9 + 16 = 5'],
    cols: 4,
    explain: 'La relation porte sur les AIRES des carrés, donc sur les carrés des longueurs : 3² + 4² = 9 + 16 = 25 = 5². Sur les longueurs, 3 + 4 = 7, ce qui est faux.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_pythagore-3e_P4'] },
  },
  {
    id: 'py-e4',
    skill: 'ecrire',
    title: 'Écrire l’égalité',
    prompt: 'DEF est rectangle en E. Quelle égalité est correcte ?',
    options: ['$DF^{2} = DE^{2} + EF^{2}$', '$DE^{2} = DF^{2} + EF^{2}$', '$DF = DE + EF$', '$DF^{2} = DE^{2} - EF^{2}$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['DF² = DE² + EF²', 'DE² = DF² + EF²', 'DF = DE + EF', 'DF² = DE² − EF²'][i],
    cols: 2,
    explain: 'L’angle droit est en E, donc l’hypoténuse est [DF] : son carré est seul d’un côté de l’égalité, et la somme des deux autres de l’autre côté.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_pythagore-3e_P5'] },
  },
  {
    id: 'py-e5',
    skill: 'calculer',
    title: 'Calculer l’hypoténuse',
    prompt: 'Un triangle est rectangle, les côtés de l’angle droit mesurent 9 cm et 12 cm. Combien mesure l’hypoténuse ?',
    options: ['15 cm', '225 cm', '21 cm', '10,5 cm'],
    cols: 4,
    explain: 'h² = 9² + 12² = 81 + 144 = 225, donc h = √225 = 15 cm. La réponse 225 oublie la racine carrée ; la réponse 21 additionne les longueurs.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_pythagore-3e_P6', '3e_pythagore-3e_P8'] },
  },
  {
    id: 'py-e6',
    skill: 'calculer',
    title: 'Calculer un côté de l’angle droit',
    prompt: 'Un triangle rectangle a une hypoténuse de 17 cm et un côté de l’angle droit de 8 cm. Combien mesure l’autre côté ?',
    options: ['15 cm', '25 cm', '18,8 cm', '9 cm'],
    cols: 4,
    explain: 'Ici on SOUSTRAIT : c² = 17² − 8² = 289 − 64 = 225, donc c = 15 cm. La réponse 18,8 vient d’une addition — impossible, un côté de l’angle droit est plus court que l’hypoténuse.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_pythagore-3e_P7'] },
  },
  {
    id: 'py-e7',
    skill: 'coherence',
    title: 'Un résultat suspect',
    prompt: 'Un élève cherche un côté de l’angle droit dans un triangle d’hypoténuse 12 cm, et trouve 14 cm. Que peut-on dire sans refaire le calcul ?',
    options: [
      'C’est forcément faux : ce côté doit être plus court que l’hypoténuse',
      'C’est plausible, il faut vérifier le calcul',
      'C’est correct si le triangle est grand',
      'On ne peut rien dire',
    ],
    cols: 1,
    explain: 'L’hypoténuse est le plus grand côté. Un résultat qui la dépasse signale une erreur — presque toujours une addition à la place d’une soustraction.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_pythagore-3e_P9'] },
  },
  {
    id: 'py-e8',
    skill: 'reciproque',
    title: 'Rectangle ou pas ?',
    prompt: 'Un triangle a pour côtés 9 cm, 12 cm et 15 cm. Est-il rectangle ?',
    options: [
      'Oui : 9² + 12² = 81 + 144 = 225 et 15² = 225, les deux sont égaux',
      'Non : 9 + 12 = 21, ce qui est différent de 15',
      'Oui, car les trois longueurs sont différentes',
      'On ne peut pas savoir sans mesurer les angles',
    ],
    cols: 1,
    explain: 'On compare le carré du plus grand côté à la somme des carrés des deux autres. Ils sont égaux, donc d’après la réciproque du théorème de Pythagore, le triangle est rectangle.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_pythagore-3e_P10'] },
  },
  {
    id: 'py-e9',
    skill: 'reciproque',
    title: 'La rédaction correcte',
    prompt: 'Pour démontrer qu’un triangle est rectangle à partir de ses trois longueurs, par quoi commence-t-on ?',
    options: [
      'On repère le plus grand côté, puis on calcule séparément les deux membres',
      'On écrit « d’après le théorème de Pythagore… »',
      'On mesure les angles avec un rapporteur',
      'On additionne les trois longueurs',
    ],
    cols: 1,
    explain: 'Écrire « d’après le théorème de Pythagore » supposerait déjà l’angle droit — précisément ce qu’on cherche à établir. On calcule les deux membres séparément, on les compare, et c’est la comparaison qui autorise la conclusion.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_pythagore-3e_P11'] },
  },
  {
    id: 'py-e10',
    skill: 'probleme',
    title: 'L’échelle',
    extra: (
      <div className="my-2">
        <LadderScene ladder={5} distance={3} reveal={false}
          ariaLabel="Échelle de 5 mètres posée à 3 mètres du mur" />
      </div>
    ),
    prompt: 'Une échelle de 5 m est posée à 3 m du mur. À quelle hauteur touche-t-elle le mur ?',
    options: ['4 m', '5,8 m', '2 m', '8 m'],
    cols: 4,
    explain: 'Le mur et le sol forment un angle droit, l’échelle est l’hypoténuse. h² = 5² − 3² = 25 − 9 = 16, donc h = 4 m. La réponse 5,8 m vient d’une addition, et dépasse la longueur de l’échelle.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_pythagore-3e_P12'] },
  },
];

const SKILLS = {
  reperer: { label: 'Repérer l’hypoténuse', module: 1 },
  aires: { label: 'La relation des aires', module: 2 },
  ecrire: { label: 'Écrire l’égalité', module: 4 },
  calculer: { label: 'Calculer une longueur', module: 5 },
  coherence: { label: 'Vérifier la cohérence', module: 5 },
  reciproque: { label: 'Réciproque', module: 6 },
  probleme: { label: 'Problèmes concrets', module: 7 },
};

const BADGES = [
  { id: 'b-rep', emoji: '🏅', label: 'Œil pour l’hypoténuse', test: (m) => !m.reperer },
  { id: 'b-aires', emoji: '🏅', label: 'La balance des carrés', test: (m) => !m.aires && !m.ecrire },
  { id: 'b-calc', emoji: '🏅', label: 'Calculateur sûr', test: (m) => !m.calculer },
  { id: 'b-coh', emoji: '🏅', label: 'Esprit critique', test: (m) => !m.coherence },
  { id: 'b-rec', emoji: '🏅', label: 'Démonstrateur', test: (m) => !m.reciproque },
  { id: 'b-prob', emoji: '🏅', label: 'Homme de terrain', test: (m) => !m.probleme },
  { id: 'b-parfait', emoji: '💎', label: 'Maître du chantier', test: (m) => Object.keys(m).length === 0 },
];

/** La synthèse : la balance figée sur un 3-4-5, et l'échelle résolue. */
function Synthese() {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-700 text-center">L’égalité des aires</p>
          <SquareBalance points={FIGURES.rect345} draggable={false}
            ariaLabel="Triangle 3-4-5 : 9 + 16 = 25" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-700 text-center">Sur le terrain</p>
          <LadderScene ladder={5} distance={3} reveal
            ariaLabel="Échelle de 5 m à 3 m du mur : elle atteint 4 m de haut" />
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-2 text-sm">
        {[
          { t: 'Direct', d: 'Angle droit connu ⇒ on calcule une longueur.' },
          { t: 'Réciproque', d: 'Égalité vérifiée ⇒ le triangle est rectangle.' },
          { t: 'Contrôle', d: 'L’hypoténuse est toujours le plus grand côté.' },
        ].map(({ t, d }) => (
          <div key={t} className="rounded-xl border-2 border-slate-200 bg-white p-3">
            <p className="font-semibold text-slate-800">{t}</p>
            <p className="text-xs text-slate-600">{d}</p>
          </div>
        ))}
      </div>
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
      moduleTitle="🏆 Mission finale : le chantier"
      moduleSubtitle="Dix épreuves pour prouver que tu maîtrises Pythagore"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître du chantier',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Pour chacune : où est l’angle droit,
            quelle est l’hypoténuse, et cherche-t-on l’hypoténuse ou un côté de l’angle droit ?
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '📐', label: 'Hypoténuse', value: 'face à l’angle droit' },
        { id: 'r2', emoji: '➕', label: 'Hypoténuse cherchée', value: 'on additionne' },
        { id: 'r3', emoji: '➖', label: 'Côté cherché', value: 'on soustrait' },
        { id: 'r4', emoji: '√', label: 'Toujours finir', value: 'par la racine' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Maître du chantier !',
        title: 'Mission accomplie',
        message: 'Tu sais repérer, écrire, calculer et démontrer avec le théorème de Pythagore.',
        verbs: ['Repérer', 'Écrire', 'Calculer', 'Démontrer'],
        masterBadgeLabel: 'Maître du chantier',
      }}
    />
  );
}
