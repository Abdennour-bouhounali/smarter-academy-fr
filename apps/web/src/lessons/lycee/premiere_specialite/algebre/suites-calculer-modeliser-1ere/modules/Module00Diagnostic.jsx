import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — prérequis. On MESURE ce que la leçon va employer sans l'enseigner :
 * les deux familles de suites et leur raison, les deux écritures (directe et de
 * proche en proche), les puissances, et le coefficient multiplicateur d'un
 * pourcentage.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Un module 0 ne peut exiger que des `priorKnowledge` : il mesure, il
 *   n'enseigne pas.
 *
 *   AUCUN MOT QUE CETTE LEÇON DOIT ENSEIGNER N'APPARAÎT ICI, explications
 *   comprises : ni « terme de rang n », ni « somme des premiers termes », ni
 *   « télescopage », ni « modéliser », ni « seuil ». Les employer reviendrait à
 *   évaluer avant d'enseigner, et à voler au module 1 l'effet de sa découverte.
 *   En revanche « suite arithmétique », « suite géométrique », « raison » et
 *   « récurrence » sont EXPLICITEMENT du vocabulaire acquis : la leçon amont
 *   les a posés, et le catalogue la cite en prérequis. Les employer ici est
 *   même le seul moyen de mesurer qu'ils le sont.
 *
 *   Chaque prérequis déclaré est mesuré par au moins une question :
 *     sm-d1  suite-arithmetique
 *     sm-d2  suite-geometrique
 *     sm-d3  definition-recurrence, definition-explicite
 *     sm-d4  puissance, exposant
 *     sm-d5  coefficient-multiplicateur
 */
const SKILLS = {
  familles: { label: 'Les deux familles', emoji: '🔢' },
  ecritures: { label: 'Les deux écritures', emoji: '✍️' },
  puissances: { label: 'Puissances', emoji: 'ⁿ' },
  pourcentages: { label: 'Pourcentages', emoji: '％' },
};

const QUESTIONS = [
  {
    id: 'sm-d1',
    requires: ['suite-arithmetique'],
    skill: 'familles',
    points: 2,
    prompt: 'La suite 7, 11, 15, 19 est arithmétique. Quelle est sa raison ?',
    options: ['4', '7', '12'],
    cols: 3,
    correct: 0,
    explain: '11 − 7 = 4, 15 − 11 = 4 : l’écart entre deux termes consécutifs vaut toujours 4.',
  },
  {
    id: 'sm-d2',
    requires: ['suite-geometrique'],
    skill: 'familles',
    points: 2,
    prompt: 'La suite 3, 6, 12, 24 est géométrique. Quelle est sa raison ?',
    options: ['2', '3', '21'],
    cols: 3,
    correct: 0,
    explain: '6 ÷ 3 = 2, 12 ÷ 6 = 2 : le rapport entre deux termes consécutifs vaut toujours 2.',
  },
  {
    id: 'sm-d3',
    requires: ['definition-recurrence', 'definition-explicite'],
    skill: 'ecritures',
    points: 2,
    prompt:
      'On donne u(0) = 4 et u(n+1) = u(n) + 5. Comment obtient-on u(3) avec cette seule écriture ?',
    options: [
      'En appliquant la règle trois fois de suite, à partir de 4',
      'En remplaçant directement n par 3 dans u(n+1) = u(n) + 5',
      'On ne peut pas : il faudrait connaître u(2) d’avance',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Cette écriture fabrique chaque valeur à partir de la précédente : 4, puis 9, puis 14, puis 19. Il faut passer par toutes les étapes.',
  },
  {
    id: 'sm-d4',
    requires: ['puissance', 'exposant'],
    skill: 'puissances',
    points: 2,
    prompt: 'Que vaut 3 × 2⁵ ?',
    options: ['96', '30', '243', '64'],
    cols: 4,
    correct: 0,
    explain:
      '2⁵ = 2 × 2 × 2 × 2 × 2 = 32, et 3 × 32 = 96. L’exposant 5 compte les facteurs 2 : il ne multiplie pas par 5.',
  },
  {
    id: 'sm-d5',
    requires: ['coefficient-multiplicateur'],
    skill: 'pourcentages',
    points: 2,
    prompt: 'Une population de 12 000 habitants baisse de 4 %. Par quel nombre la multiplie-t-on ?',
    options: ['0,96', '0,04', '4', '1,04'],
    cols: 4,
    correct: 0,
    explain:
      'Une baisse de 4 % se traduit par une multiplication par 1 − 0,04 = 0,96. On garde 96 % de ce qu’il y avait : 12 000 × 0,96 = 11 520.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ"
      moduleSubtitle="Cinq questions pour savoir par où commencer"
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Avant de partir à l’assaut d’un rang lointain, un tour de tes outils : les deux familles
            de suites et leur raison, les deux façons de les écrire, les puissances, et le
            pourcentage qui se transforme en multiplication. <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
