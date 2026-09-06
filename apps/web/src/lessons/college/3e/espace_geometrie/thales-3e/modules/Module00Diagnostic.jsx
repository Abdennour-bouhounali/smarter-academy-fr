import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Prérequis officiels (coursesData.js, clé '3e_thales') : « Proportionnalité »,
 * « Triangles », « Parallélisme », « Fractions ». On teste donc le produit en
 * croix, la comparaison de deux quotients, le vocabulaire du parallélisme et
 * la simplification — jamais le théorème lui-même.
 */
const SKILLS = {
  proportion: { label: 'Proportionnalité', emoji: '⚖️' },
  fractions: { label: 'Fractions', emoji: '½' },
  geometrie: { label: 'Parallélisme', emoji: '🛤️' },
};

const QUESTIONS = [
  {
    id: 'th-d1-croix',
    skill: 'proportion',
    requires: ['proportionnalite'],
    points: 2,
    prompt: 'Si 3/6 = x/10, combien vaut x ?',
    options: ['5', '7', '20'],
    cols: 3,
    correct: 0,
    explain: 'Produit en croix : x = (3 × 10) ÷ 6 = 5. On peut aussi remarquer que 3/6 = 0,5, donc x est la moitié de 10.',
  },
  {
    id: 'th-d2-comparer',
    skill: 'fractions',
    requires: ['quotient'],
    points: 2,
    prompt: 'Les quotients 4/10 et 6/15 sont-ils égaux ?',
    options: ['Oui, ils valent tous les deux 0,4', 'Non', 'On ne peut pas comparer'],
    cols: 1,
    correct: 0,
    explain: '4 ÷ 10 = 0,4 et 6 ÷ 15 = 0,4. Deux fractions peuvent être égales sans avoir les mêmes numérateurs ni les mêmes dénominateurs.',
  },
  {
    id: 'th-d3-simplifier',
    skill: 'fractions',
    requires: ['quotient', 'arrondi'],
    points: 2,
    prompt: 'Sous quelle forme simplifiée s’écrit 12/18 ?',
    options: ['2/3', '6/9', '1/6'],
    cols: 3,
    correct: 0,
    explain: 'On divise les deux termes par 6 : 12 ÷ 6 = 2 et 18 ÷ 6 = 3. La fraction 6/9 est correcte mais pas encore irréductible.',
  },
  {
    id: 'th-d4-paralleles',
    skill: 'geometrie',
    requires: ['droites-paralleles'],
    points: 2,
    prompt: 'Deux droites parallèles, ce sont deux droites qui…',
    options: [
      'ne se coupent jamais',
      'se coupent à angle droit',
      'ont la même longueur',
    ],
    cols: 1,
    correct: 0,
    explain: 'Des droites parallèles gardent un écart constant et ne se rencontrent jamais. Se couper à angle droit, c’est être perpendiculaires.',
  },
  {
    id: 'th-d5-echelle',
    skill: 'proportion',
    requires: ['proportionnalite'],
    points: 2,
    prompt: 'Une maquette est à l’échelle 1/50. Une longueur de 3 cm sur la maquette correspond à…',
    options: ['150 cm en réalité', '53 cm en réalité', '0,06 cm en réalité'],
    cols: 1,
    correct: 0,
    explain: 'À l’échelle 1/50, la réalité est 50 fois plus grande : 3 × 50 = 150 cm.',
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
            Avant de partir mesurer des pyramides, un tour de tes outils : la proportionnalité, les
            fractions et le parallélisme. <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
