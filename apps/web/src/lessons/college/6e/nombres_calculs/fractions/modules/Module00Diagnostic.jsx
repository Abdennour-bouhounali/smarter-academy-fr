import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis, construit sur le lesson kit : ce
 * fichier ne contient que les DONNÉES. Le moteur (score, paliers,
 * persistance, correction, jamais-bloquant) vit dans
 * common/kit/PrerequisiteDiagnostic.jsx.
 *
 * Prérequis officiel (coursesData.js, 6e_fractions) : "Division" et
 * "Partage" — l'intuition du partage équitable en parts égales et les
 * faits de division simples, PAS les fractions elles-mêmes (notation,
 * vocabulaire numérateur/dénominateur), qui sont enseignées à partir du
 * Module 1.
 */
const SKILLS = {
  partageDivision: { label: 'Partage et division', emoji: '➗' },
};

const QUESTIONS = [
  {
    id: 'q1-partage-simple',
    skill: 'partageDivision',
    points: 2,
    prompt: (
      <>
        On partage <strong className="font-mono">12 bonbons</strong> équitablement entre{' '}
        <strong className="font-mono">4 enfants</strong>. Combien de bonbons reçoit chaque enfant ?
      </>
    ),
    options: ['3', '4', '8'],
    cols: 3,
    correct: 0,
    explain: '12 bonbons partagés en 4 parts égales : 12 ÷ 4 = 3 bonbons par enfant.',
  },
  {
    id: 'q2-tombe-juste',
    skill: 'partageDivision',
    points: 2,
    prompt: (
      <>
        Peut-on partager <strong className="font-mono">15 billes</strong> également entre{' '}
        <strong className="font-mono">2 personnes</strong>, sans en couper ni en garder de côté ?
      </>
    ),
    options: ['Oui, ça tombe juste', 'Non, ça ne tombe pas juste', 'Impossible à savoir'],
    cols: 1,
    correct: 1,
    explain: "15 est un nombre impair : en le partageant en 2, il reste toujours 1 bille en trop — le partage ne tombe pas juste.",
  },
  {
    id: 'q3-division-fait',
    skill: 'partageDivision',
    points: 2,
    prompt: <>Combien font <strong className="font-mono">20 ÷ 5</strong> ?</>,
    options: ['4', '5', '15'],
    cols: 3,
    correct: 0,
    explain: '20 ÷ 5 = 4 : en répartissant 20 en 5 groupes égaux, chaque groupe contient 4.',
  },
  {
    id: 'q4-vocabulaire',
    skill: 'partageDivision',
    points: 2,
    prompt: <>Que veut dire « partager équitablement » un gâteau entre plusieurs personnes ?</>,
    options: [
      'Donner la plus grosse part à celui qui a le plus faim',
      'Donner à chacun une part de la même taille',
      "Couper le gâteau en autant de parts que l'on veut",
    ],
    cols: 1,
    correct: 1,
    explain: 'Partager équitablement, c\'est donner à chaque personne une part strictement identique en taille.',
  },
  {
    id: 'q5-groupes-egaux',
    skill: 'partageDivision',
    points: 2,
    prompt: (
      <>
        Une boîte contient <strong className="font-mono">18 œufs</strong>. On veut former des paquets égaux de{' '}
        <strong className="font-mono">3 œufs</strong>. Combien de paquets peut-on former ?
      </>
    ),
    options: ['3', '6', '9'],
    cols: 3,
    correct: 1,
    explain: '18 ÷ 3 = 6 : on peut former 6 paquets de 3 œufs.',
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
            Vérifions ensemble la petite base dont tu auras besoin pour explorer les fractions : savoir
            partager équitablement et diviser. Ce test nous aide à savoir comment t'aider — ce n'est pas un
            examen, et tu pourras toujours continuer vers le Module 1, quel que soit ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
