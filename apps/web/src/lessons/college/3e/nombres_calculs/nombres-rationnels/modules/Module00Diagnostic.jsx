import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Prérequis officiels (coursesData.js, clé '3e_nombres_rationnels') :
 * « Fractions », « Calcul numérique », « Nombres relatifs ». On teste donc
 * lire une fraction simple, reconnaître une fraction égale, faire une
 * division exacte, et manier les signes — jamais les rationnels de 3e
 * eux-mêmes (opérations, irréductibilité, priorités), qui SONT la leçon.
 *
 * `requires` nomme, pour chaque question, le prérequis qu'elle diagnostique.
 * Ces ids sont exactement ceux du `priorKnowledge` de la leçon : un module 0
 * MESURE des acquis antérieurs, il n'enseigne jamais la matière de la leçon
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */
const SKILLS = {
  fractions: { label: 'Fractions', emoji: '🍕' },
  calcul: { label: 'Calcul numérique', emoji: '🔢' },
  relatifs: { label: 'Nombres relatifs', emoji: '±' },
};

const QUESTIONS = [
  {
    id: 'q1-lire-fraction',
    skill: 'fractions',
    points: 2,
    requires: ['quotient', 'numerateur', 'denominateur'],
    prompt: (
      <>
        Une pizza est partagée en 4 parts égales ; on en prend 3. Quelle fraction de la pizza a-t-on
        prise ?
      </>
    ),
    options: ['3/4', '4/3', '1/4'],
    cols: 3,
    correct: 0,
    explain:
      "Le dénominateur dit en combien de parts on découpe (4), le numérateur combien on en prend (3) : 3/4. 4/3 serait plus d'une pizza entière.",
  },
  {
    id: 'q2-fraction-egale',
    skill: 'fractions',
    points: 2,
    requires: ['quotient', 'numerateur', 'denominateur'],
    prompt: (
      <>
        Quelle fraction est égale à <MathText>{'$\\frac{1}{2}$'}</MathText> ?
      </>
    ),
    options: ['2/4', '1/4', '2/1'],
    cols: 3,
    correct: 0,
    explain:
      'En coupant chaque moitié en deux, on obtient 2 parts sur 4 : la même quantité. 1/4 est deux fois plus petit, et 2/1 vaut 2.',
  },
  {
    id: 'q3-division',
    skill: 'calcul',
    points: 2,
    requires: ['calcul-numerique', 'quotient'],
    prompt: (
      <>
        Combien font <MathText>{'$36 \\div 12$'}</MathText> ?
      </>
    ),
    options: ['3', '4', '24'],
    cols: 3,
    correct: 0,
    explain: '12 × 3 = 36, donc 36 ÷ 12 = 3. (24, ce serait 36 − 12.)',
  },
  {
    id: 'q4-produit-relatifs',
    skill: 'relatifs',
    points: 2,
    requires: ['nombres-relatifs'],
    prompt: (
      <>
        Combien font <MathText>{'$(-3) \\times 4$'}</MathText> ?
      </>
    ),
    options: ['12', '−12', '1'],
    cols: 3,
    correct: 1,
    explain: 'Un négatif multiplié par un positif donne un négatif : (−3) × 4 = −12. (1, ce serait −3 + 4.)',
  },
  {
    id: 'q5-ordre-relatifs',
    skill: 'relatifs',
    points: 2,
    requires: ['nombres-relatifs'],
    prompt: <>Lequel de ces deux nombres est le plus grand : −5 ou −2 ?</>,
    options: ['−2', '−5', 'Ils sont égaux'],
    cols: 3,
    correct: 0,
    explain:
      'Sur la droite graduée, −2 est à droite de −5 : il est donc plus grand. Chez les négatifs, plus le nombre « paraît gros », plus il est petit.',
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
            Cette leçon repose sur les fractions, le calcul numérique et les nombres relatifs.
            Vérifions ces réflexes. Ce n'est pas un examen — tu continueras vers le Module 1 quel que
            soit ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
