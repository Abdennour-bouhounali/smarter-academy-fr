import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Prérequis officiels (coursesData.js, clé '3e_pythagore') : « Triangles »,
 * « Carrés et puissances », « Racines carrées », « Longueurs ». On teste donc
 * le vocabulaire du triangle, le calcul d'un carré, la racine carrée et
 * l'ordre de grandeur — jamais le théorème lui-même.
 */
const SKILLS = {
  triangle: { label: 'Triangles', emoji: '🔺' },
  carres: { label: 'Carrés', emoji: '²' },
  racines: { label: 'Racines carrées', emoji: '√' },
};

const QUESTIONS = [
  {
    id: 'py-d1-angle-droit',
    skill: 'triangle',
    requires: ['triangle-rectangle'],
    points: 2,
    prompt: 'Comment repère-t-on un angle droit sur une figure ?',
    options: ['À la petite marque carrée', 'À sa couleur', 'C’est toujours l’angle du bas'],
    cols: 1,
    correct: 0,
    explain: 'Un petit carré dessiné au sommet signale l’angle droit, quelle que soit l’orientation de la figure.',
  },
  {
    id: 'py-d2-carre',
    skill: 'carres',
    requires: ['puissance', 'aire'],
    points: 2,
    prompt: (<>Combien vaut <MathText>{'$7^{2}$'}</MathText> ?</>),
    options: ['49', '14', '77'],
    cols: 3,
    correct: 0,
    explain: '7² signifie 7 × 7 = 49. Ce n’est pas 7 × 2, qui vaudrait 14.',
  },
  {
    id: 'py-d3-somme-carres',
    skill: 'carres',
    requires: ['puissance', 'aire'],
    points: 2,
    prompt: (<>Combien vaut <MathText>{'$6^{2} + 8^{2}$'}</MathText> ?</>),
    options: ['100', '196', '28'],
    cols: 3,
    correct: 0,
    explain: '36 + 64 = 100. On calcule chaque carré séparément AVANT d’additionner : (6 + 8)² vaudrait 196, ce qui est différent.',
  },
  {
    id: 'py-d4-racine',
    skill: 'racines',
    requires: ['racine-carree', 'arrondi'],
    points: 2,
    prompt: (<>Combien vaut <MathText>{'$\\sqrt{144}$'}</MathText> ?</>),
    options: ['12', '72', '14'],
    cols: 3,
    correct: 0,
    explain: '12 × 12 = 144, donc √144 = 12. La racine carrée est l’opération inverse du carré.',
  },
  {
    id: 'py-d5-encadrer',
    skill: 'racines',
    requires: ['racine-carree', 'arrondi'],
    points: 2,
    prompt: (<>Entre quels entiers se trouve <MathText>{'$\\sqrt{50}$'}</MathText> ?</>),
    options: ['Entre 7 et 8', 'Entre 6 et 7', 'Entre 24 et 25'],
    cols: 1,
    correct: 0,
    explain: '7² = 49 et 8² = 64. Comme 49 < 50 < 64, la racine de 50 est entre 7 et 8 — un peu plus de 7.',
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
            Avant d’ouvrir le chantier, un tour de tes outils : le vocabulaire du triangle, les
            carrés et les racines carrées. <strong>Rien n’est bloquant</strong> — ce test sert
            seulement à te dire où faire attention.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
