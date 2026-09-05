import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — « Mission de départ ».
 *
 * Prérequis officiels déclarés (coursesData.js, 6e_algorithmique_programmation) :
 *   « Nombres entiers » et « Repérage dans le plan ».
 *
 * Ces 5 questions ne testent QUE ces deux prérequis — jamais le contenu de la
 * leçon (instructions, programmes, boucles, débogage), que les modules 1 à 7
 * existent précisément pour enseigner. Jamais bloquant : quel que soit le
 * score, le lien vers le module 1 reste ouvert.
 */
const SKILLS = {
  entiers: { label: 'Nombres entiers', emoji: '🔢' },
  reperage: { label: 'Repérage dans le plan', emoji: '🗺️' },
};

const QUESTIONS = [
  {
    id: 'q1-compter-cases',
    skill: 'entiers',
    points: 2,
    prompt: (
      <>
        Un pion est sur la case <strong className="font-mono">2</strong> d’une piste. Il avance de{' '}
        <strong className="font-mono">3</strong> cases. Sur quelle case arrive-t-il ?
      </>
    ),
    options: ['4', '5', '6'],
    cols: 3,
    correct: 1,
    explain: '2 + 3 = 5 : on ajoute le nombre de pas à la position de départ.',
  },
  {
    id: 'q2-combien-de-pas',
    skill: 'entiers',
    points: 2,
    prompt: (
      <>
        Un pion est sur la case <strong className="font-mono">3</strong> et doit atteindre la case{' '}
        <strong className="font-mono">7</strong>. Combien de pas doit-il faire ?
      </>
    ),
    options: ['3 pas', '4 pas', '7 pas'],
    cols: 3,
    correct: 1,
    explain: '7 − 3 = 4 : le nombre de pas est l’écart entre l’arrivée et le départ.',
  },
  {
    id: 'q3-ligne-colonne',
    skill: 'reperage',
    points: 2,
    prompt: (
      <>
        Dans un quadrillage, on repère une case par sa <strong>colonne</strong> et sa{' '}
        <strong>ligne</strong>. La case « colonne 2, ligne 0 » et la case « colonne 0, ligne 2 » :
      </>
    ),
    options: [
      'sont la même case',
      'sont deux cases différentes',
      'n’existent pas',
    ],
    cols: 1,
    correct: 1,
    explain:
      'Les deux nombres n’ont pas le même rôle : le premier dit de combien on va sur le côté, le second de combien on monte. Les échanger change de case.',
  },
  {
    id: 'q4-direction',
    skill: 'reperage',
    points: 2,
    prompt: (
      <>
        Sur un quadrillage, tu pars d’une case et tu te déplaces de <strong>2 cases vers la
        droite</strong>, puis <strong>1 case vers le haut</strong>. Ton déplacement total, c’est :
      </>
    ),
    options: ['3 cases en tout', '2 cases en tout', '1 case en tout'],
    cols: 3,
    correct: 0,
    explain: '2 + 1 = 3 déplacements d’une case : on additionne les pas, on ne les multiplie pas.',
  },
  {
    id: 'q5-ordre-etapes',
    skill: 'entiers',
    points: 2,
    prompt: (
      <>
        Pour préparer un gâteau : <strong>1.</strong> casser les œufs, <strong>2.</strong> mélanger,{' '}
        <strong>3.</strong> mettre au four. Si on fait l’étape 3 en premier, le résultat sera :
      </>
    ),
    options: ['le même', 'différent — l’ordre compte', 'meilleur'],
    cols: 1,
    correct: 1,
    explain:
      'Dans une suite d’étapes, l’ordre fait partie de la recette. C’est exactement ce qui se passe dans un programme.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Avant de programmer ROBI, vérifions deux petites bases : compter des pas et se repérer
            dans un quadrillage. Ce test nous aide à savoir comment t’aider — ce n’est pas un examen,
            et tu pourras continuer vers le Module 1 quel que soit ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
