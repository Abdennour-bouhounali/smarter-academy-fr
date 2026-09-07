import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (fichier de DONNÉES uniquement).
 * Prérequis déclarés : « Fractions », « Nombres relatifs », « Puissances ».
 * On teste fraction → décimal simple, ordre de relatifs, puissance de 10,
 * carré d'un décimal et racine carrée d'un carré parfait — jamais la
 * nature des nombres, contenu de la leçon.
 */
const SKILLS = {
  fractions: { label: 'Fractions', emoji: '½' },
  relatifs: { label: 'Nombres relatifs', emoji: '±' },
  puissances: { label: 'Puissances et carrés', emoji: '²' },
  ecriture: { label: 'Écriture ensembliste', emoji: '∈' },
};

const QUESTIONS = [
  {
    id: 'q1-fraction-decimale', skill: 'fractions', points: 2,
    requires: ['fraction-decimale', 'quotient', 'numerateur', 'denominateur'],
    prompt: <>Combien vaut <MathText>{'$\\frac{3}{4}$'}</MathText> en écriture décimale ?</>,
    options: ['0,34', '0,75', '1,33'], cols: 3, correct: 1,
    explain: '3/4 = 3 ÷ 4 = 0,75. « 0,34 » colle les chiffres ; 1,33 est 4/3.',
  },
  {
    id: 'q2-ordre-relatifs', skill: 'relatifs', points: 2,
    requires: ['ordre-nombres'],
    prompt: 'Range dans l’ordre croissant : −2,5 ; −3 ; 0,5.',
    options: ['−3 < −2,5 < 0,5', '−2,5 < −3 < 0,5', '0,5 < −2,5 < −3'], cols: 1, correct: 0,
    explain: 'Plus un négatif est loin de 0, plus il est petit : −3 < −2,5. Et tout négatif est plus petit que 0,5.',
  },
  {
    id: 'q3-puissance-dix', skill: 'puissances', points: 2,
    requires: ['puissance', 'exposant'],
    prompt: <>Combien vaut <MathText>{'$10^{-2}$'}</MathText> ?</>,
    options: ['−100', '0,01', '−20'], cols: 3, correct: 1,
    explain: '10⁻² = 1/10² = 1/100 = 0,01 : un exposant négatif n’a rien à voir avec un nombre négatif.',
  },
  {
    id: 'q4-carre-decimal', skill: 'puissances', points: 2,
    requires: ['puissance'],
    prompt: 'Combien vaut 1,2² ?',
    options: ['1,4', '2,4', '1,44'], cols: 3, correct: 2,
    explain: '1,2 × 1,2 = 1,44. (1,4 double les dixièmes ; 2,4 est 2 × 1,2.)',
  },
  {
    id: 'q5-racine-carree', skill: 'puissances', points: 2,
    requires: ['racine-carree'],
    prompt: <>Combien vaut <MathText>{'$\\sqrt{49}$'}</MathText> ?</>,
    options: ['7', '24,5', '49'], cols: 3, correct: 0,
    explain: '√49 est le nombre positif dont le carré vaut 49 : 7 × 7 = 49. Ce n’est pas la moitié de 49.',
  },
  {
    // On mesure la LECTURE du symbole ∈ (acquis d'« Ensembles et
    // intervalles »), pas les familles de nombres — matière de la leçon.
    id: 'q6-appartient', skill: 'ecriture', points: 2,
    requires: ['appartient'],
    prompt: 'Que signifie l’écriture « 4 ∈ ℕ » ?',
    options: ['4 appartient à ℕ', '4 est plus grand que ℕ', 'ℕ appartient à 4'],
    cols: 1, correct: 0,
    explain: 'Le symbole ∈ se lit « appartient à » : à sa gauche un élément, à sa droite l’ensemble qui le contient.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      estimatedTime="4 min"
      brief={{ body: <p>Cette leçon s’appuie sur les fractions, les relatifs et les carrés. Cinq questions pour vérifier, sans enjeu : tu passes au Module 1 quel que soit ton score.</p> }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
