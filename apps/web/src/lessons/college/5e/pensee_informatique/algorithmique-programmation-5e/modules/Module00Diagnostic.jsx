import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE ce que la leçon suppose (`priorKnowledge` de lesson.config.js) et
 * rien de la matière de la leçon : aucune variable, aucune entrée, aucune
 * formule, aucun 360 ÷ n. Tout ici vient de la 6e — la lecture d'une séquence
 * d'instructions et son ordre (leçon d'algorithmique de 6e), l'angle droit et
 * le degré, le calcul numérique, et le périmètre.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md, § « Le module 0 et le test final »).
 */
const SKILLS = {
  programme: { label: 'Lire un programme', emoji: '📜' },
  angles: { label: 'Angles et degrés', emoji: '📐' },
  calcul: { label: 'Calcul', emoji: '🧮' },
};

const QUESTIONS = [
  {
    id: 'alg5-d1-sequence',
    skill: 'programme',
    points: 2,
    requires: ['instruction-programme'],
    prompt:
      'Un programme contient : « AVANCER », puis « TOURNER À DROITE », puis « AVANCER ». Combien d’instructions le robot exécute-t-il ?',
    options: ['3', '2', '1'],
    cols: 3,
    correct: 0,
    explain: 'Chaque ligne est une instruction, et elles s’exécutent l’une après l’autre : il y en a 3.',
  },
  {
    id: 'alg5-d2-ordre',
    skill: 'programme',
    points: 2,
    requires: ['instruction-programme'],
    prompt:
      'On échange l’ordre de deux instructions d’un programme. Le résultat obtenu est-il forcément le même ?',
    options: [
      'Non : changer l’ordre change en général le résultat',
      'Oui : ce sont les mêmes instructions',
      'Oui, sauf s’il y a une répétition',
    ],
    cols: 1,
    correct: 0,
    explain:
      'L’ordre fait partie du programme. Tourner puis avancer ne mène pas au même endroit qu’avancer puis tourner.',
  },
  {
    id: 'alg5-d3-boucle',
    skill: 'programme',
    points: 2,
    requires: ['boucle'],
    prompt: 'Une boucle « RÉPÉTER 5 fois [ AVANCER ] » fait exécuter combien d’AVANCER ?',
    options: ['5', '1', '6'],
    cols: 3,
    correct: 0,
    explain: 'La boucle répète son contenu 5 fois : le robot avance donc 5 fois de suite.',
  },
  {
    id: 'alg5-d4-angle',
    skill: 'angles',
    points: 2,
    requires: ['angle-droit', 'rapporteur'],
    prompt: 'Un quart de tour, c’est un angle de combien de degrés ?',
    options: ['90°', '45°', '180°'],
    cols: 3,
    correct: 0,
    explain: 'Un tour complet vaut 360°, donc un quart de tour vaut 360 ÷ 4 = 90° — c’est l’angle droit.',
  },
  {
    id: 'alg5-d5-calcul',
    skill: 'calcul',
    points: 2,
    requires: ['calcul-numerique', 'tables-multiplication', 'perimetre'],
    prompt: 'Quel est le périmètre d’un carré de côté 7 cm ?',
    options: ['28 cm', '49 cm', '14 cm'],
    cols: 3,
    correct: 0,
    explain:
      'Le périmètre est le tour de la figure : quatre côtés de 7 cm, soit 4 × 7 = 28 cm. (49 serait 7 × 7, la mesure d’une surface — ce n’est pas ce qu’on parcourt en faisant le tour.)',
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
            Avant de programmer KIWI, un tour de ce que la 6e t’a déjà appris : lire une suite
            d’instructions, savoir que l’ordre compte, une répétition, un quart de tour et un
            périmètre. <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
