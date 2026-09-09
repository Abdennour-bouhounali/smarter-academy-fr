import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — prérequis. On MESURE ce que la leçon va employer sans l'enseigner :
 * les coordonnées d'une flèche, la formule arrivée − départ, sa longueur, ce
 * qu'est un repère orthonormé, et ce que deviennent les coordonnées quand on
 * étire une flèche ou qu'on en enchaîne deux.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Un module 0 ne peut exiger que des `priorKnowledge` : il mesure, il
 *   n'enseigne pas. Aucune question ne porte sur le produit scalaire, sur
 *   l'angle droit entre deux flèches, ni sur les droites : c'est la matière de
 *   la leçon, et la mesurer ici reviendrait à évaluer avant d'enseigner.
 *
 *   VOCABULAIRE INTERDIT ICI, `explain` compris : « produit scalaire »,
 *   « orthogonal », « projection », « vecteur normal » — et « perpendiculaire ».
 *
 *   « Perpendiculaire » demande une justification, parce qu'il existe au
 *   collège et qu'on le croirait donc disponible. Il ne l'est pas ICI : la
 *   leçon l'emploie dès son module 1 pour DÉCRIRE le geste de projection, en
 *   position d'enseignement. L'audit strict le signalait à juste titre — un
 *   module 0 qui l'emploie fait entendre la cible avant qu'elle ne soit posée.
 *   Le repère orthonormé se décrit donc ici par ses axes et son unité, sans
 *   le mot. C'est la frontière fine annoncée par la consigne : « orthogonal »
 *   est la cible, et « perpendiculaire » en est trop proche pour être libre.
 *
 *   Le mot « orthonormé » lui-même apparaît en ps-d4 parce qu'il est le NOM du
 *   repère de 2de, déclaré en priorKnowledge (`vocab-base-orthonormee`) et posé
 *   par la leçon « Vecteurs » — c'est un acquis mesuré, pas une cible.
 *
 *   Chaque prérequis déclaré est mesuré par au moins une question :
 *     ps-d1  vecteur-deplacement
 *     ps-d2  coordonnees-vecteur, regle-coordonnees
 *     ps-d3  vocab-norme, formule-norme
 *     ps-d4  vocab-base-orthonormee
 *     ps-d5  regle-produit-reel
 *     ps-d6  regle-somme
 */
const SKILLS = {
  fleches: { label: 'Vecteurs', emoji: '➜' },
  coordonnees: { label: 'Coordonnées', emoji: '📍' },
  longueur: { label: 'Longueur', emoji: '📏' },
  calcul: { label: 'Calcul vectoriel', emoji: '🧮' },
};

const QUESTIONS = [
  {
    id: 'ps-d1',
    requires: ['vecteur-deplacement'],
    skill: 'fleches',
    points: 2,
    prompt: 'Un vecteur est entièrement décrit par…',
    options: [
      'une direction, un sens et une longueur',
      'un point de départ seulement',
      'une longueur seulement',
    ],
    cols: 1,
    correct: 0,
    explain: 'Trois attributs, et rien d’autre : la droite suivie, le côté vers lequel on avance, et la distance parcourue. Le point de départ ne fait pas partie de la description — le même vecteur peut être dessiné n’importe où.',
  },
  {
    id: 'ps-d2',
    requires: ['coordonnees-vecteur', 'regle-coordonnees', 'abscisse', 'ordonnee'],
    skill: 'coordonnees',
    points: 2,
    prompt: 'A(1 ; 2) et B(5 ; 5). Quelles sont les coordonnées du vecteur AB ?',
    options: ['(4 ; 3)', '(6 ; 7)', '(−4 ; −3)'],
    cols: 3,
    correct: 0,
    explain: 'Arrivée moins départ : 5 − 1 = 4 pour l’abscisse, 5 − 2 = 3 pour l’ordonnée. Donc AB = (4 ; 3). L’ordre des lettres compte : BA donnerait (−4 ; −3).',
  },
  {
    id: 'ps-d3',
    requires: ['vocab-norme', 'formule-norme'],
    skill: 'longueur',
    points: 2,
    prompt: 'Quelle est la longueur du vecteur u(4 ; 3), c’est-à-dire sa norme ‖u‖ ?',
    options: ['5', '7', '25'],
    cols: 3,
    correct: 0,
    explain: '‖u‖ = √(4² + 3²) = √(16 + 9) = √25 = 5. Répondre 7, c’est additionner les coordonnées ; répondre 25, c’est oublier la racine.',
  },
  {
    id: 'ps-d4',
    requires: ['vocab-base-orthonormee'],
    skill: 'coordonnees',
    points: 2,
    prompt: 'Dans un repère orthonormé, les deux vecteurs de base i et j…',
    options: [
      'sont portés par les deux axes du repère, et mesurent tous les deux 1',
      'ont la même direction',
      'peuvent avoir n’importe quelle longueur',
    ],
    cols: 1,
    correct: 0,
    explain: '« Orthonormé » réunit deux exigences : les deux axes se croisent en formant les quatre coins d’un carré, et l’unité vaut 1 sur chacun. C’est ce qui rend les lectures comparables d’un axe à l’autre.',
  },
  {
    id: 'ps-d5',
    requires: ['regle-produit-reel'],
    skill: 'calcul',
    points: 2,
    prompt: 'Si u = (3 ; 2), que valent les coordonnées de 2u ?',
    options: ['(6 ; 4)', '(5 ; 4)', '(3 ; 4)'],
    cols: 3,
    correct: 0,
    explain: 'On multiplie CHAQUE coordonnée par 2 : (2 × 3 ; 2 × 2) = (6 ; 4). La flèche garde sa direction et son sens, mais devient deux fois plus longue.',
  },
  {
    id: 'ps-d6',
    requires: ['regle-somme'],
    skill: 'calcul',
    points: 2,
    prompt: 'v = (1 ; 4) et w = (2 ; −1). Que valent les coordonnées de v + w ?',
    options: ['(3 ; 3)', '(3 ; 5)', '(2 ; −4)'],
    cols: 3,
    correct: 0,
    explain: 'On additionne coordonnée par coordonnée : (1 + 2 ; 4 + (−1)) = (3 ; 3). Attention au signe de la seconde : 4 − 1 = 3, et non 4 + 1.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ"
      moduleSubtitle="Six questions pour savoir par où commencer"
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Avant de faire tourner des flèches et de regarder ce qui en sort, un tour de tes
            outils de 2de : les coordonnées d’un vecteur, sa longueur, le repère dans lequel on
            travaille, et ce que devient une flèche qu’on étire ou qu’on enchaîne.{' '}
            <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
