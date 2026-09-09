import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE ce que la leçon suppose (`priorKnowledge` de lesson.config.js) et
 * rien de la matière de la leçon : ni effectif, ni fréquence, ni moyenne, ni
 * diagramme à construire. Tout ici est de la 6e — lire un tableau, lire un
 * graphique, partager, et la fraction comme part d'un tout.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md, § « Le module 0 et le test final »).
 */
const SKILLS = {
  lire: { label: 'Lire des données', emoji: '👀' },
  parts: { label: 'Parts d’un tout', emoji: '🍰' },
  partage: { label: 'Partager', emoji: '➗' },
};

const QUESTIONS = [
  {
    id: 'stat5-d1-tableau',
    skill: 'lire',
    points: 2,
    requires: ['lire-tableau'],
    prompt: 'Dans ce tableau, la colonne « Chat » indique 7. Que veut dire ce 7 ?',
    options: ['7 élèves ont un chat', '7 chats par élève', 'Le chat est le 7ᵉ animal'],
    cols: 1,
    correct: 0,
    explain: 'Une case de tableau se lit avec son en-tête : sous « Chat », 7 compte les élèves concernés.',
  },
  {
    id: 'stat5-d2-graphique',
    skill: 'lire',
    points: 2,
    requires: ['lire-graphique'],
    prompt: 'Sur un diagramme en barres, la barre A est deux fois plus haute que la barre B. Que peut-on dire ?',
    options: ['A compte deux fois plus que B', 'A compte deux de plus que B', 'A et B comptent pareil'],
    cols: 1,
    correct: 0,
    explain: 'La hauteur est proportionnelle à la quantité : deux fois plus haut, c’est deux fois plus.',
  },
  {
    id: 'stat5-d3-fraction',
    skill: 'parts',
    points: 2,
    requires: ['fraction-part'],
    prompt: 'Dans une classe de 20 élèves, 5 sont demi-pensionnaires. Quelle part de la classe cela représente-t-il ?',
    options: ['1/4', '1/5', '5/100'],
    cols: 3,
    correct: 0,
    explain: '5 sur 20, c’est 5/20. Comme 20 = 4 × 5, cela fait un quart de la classe.',
  },
  {
    id: 'stat5-d4-moitie',
    skill: 'parts',
    points: 2,
    requires: ['fraction-part'],
    prompt: 'Dans un groupe de 10 personnes, 5 portent des lunettes. Cela représente :',
    options: ['la moitié du groupe', 'le quart du groupe', 'le dixième du groupe'],
    cols: 1,
    correct: 0,
    explain: '5 sur 10, c’est une personne sur deux : la moitié du groupe.',
  },
  {
    id: 'stat5-d5-partage',
    skill: 'partage',
    points: 2,
    requires: ['division-partage'],
    prompt: 'On partage équitablement 24 bonbons entre 6 enfants. Combien chacun en reçoit-il ?',
    options: ['4', '6', '18'],
    cols: 3,
    correct: 0,
    explain: 'Un partage équitable est une division : 24 ÷ 6 = 4 bonbons chacun.',
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
            Avant de lancer l’enquête, un tour de tes outils : lire un tableau, lire un
            graphique, reconnaître une part d’un tout et partager équitablement.{' '}
            <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
