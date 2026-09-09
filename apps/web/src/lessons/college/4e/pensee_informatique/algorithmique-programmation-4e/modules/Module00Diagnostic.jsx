import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE les acquis listés dans `priorKnowledge` — tous de 6e et de 5e — et
 * RIEN de la matière de la leçon : aucune question ne parle de « si », de
 * condition, d'affectation ni d'exécution pas à pas.
 *
 * Les dix connaissances supposées sont couvertes :
 *   instruction-programme, boucle                       (6e)
 *   instruction-parametree, prevoir-executer,
 *   variable-informatique, entree-programme,
 *   formule-programme, repeter-n-fois, angle-exterieur,
 *   deboguer                                            (5e)
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */
const SKILLS = {
  lire: { label: 'Lire un programme', emoji: '📄' },
  variable: { label: 'Variables et formules', emoji: '📦' },
  boucle: { label: 'Boucle et figure', emoji: '🔁' },
  reparer: { label: 'Repérer une erreur', emoji: '🔧' },
};

const QUESTIONS = [
  {
    id: 'al4-d1-ordre',
    skill: 'lire',
    points: 2,
    requires: ['instruction-programme', 'prevoir-executer'],
    prompt: 'Le stylo part vers la droite. Il exécute : AVANCER de 50, puis TOURNER de 90°, puis AVANCER de 50. Quelle figure obtient-on ?',
    options: ['Deux traits de 50 formant un coin', 'Un seul trait de 100', 'Un carré complet', 'Deux traits l’un sur l’autre'],
    cols: 1,
    correct: 0,
    explain: 'Le stylo trace un premier trait de 50, tourne d’un quart de tour, puis trace le second : les deux traits se rejoignent en un coin. Il en faudrait quatre pour un carré.',
  },
  {
    id: 'al4-d2-parametre',
    skill: 'lire',
    points: 2,
    requires: ['instruction-parametree'],
    prompt: 'Dans « AVANCER de 70 », que représente le nombre 70 ?',
    options: ['La longueur dont le stylo avance', 'Le nombre de fois qu’il avance', 'L’angle du virage', 'Le numéro de l’instruction'],
    cols: 1,
    correct: 0,
    explain: 'C’est le paramètre de l’instruction : la longueur du déplacement. Sans lui, « AVANCER » ne voudrait rien dire.',
  },
  {
    id: 'al4-d3-variable',
    skill: 'variable',
    points: 2,
    requires: ['variable-informatique', 'entree-programme'],
    prompt: 'Un programme contient « AVANCER de cote », et on lui donne cote = 45 au départ. De combien le stylo avance-t-il ?',
    options: ['45', 'cote', '1', 'On ne peut pas savoir'],
    cols: 4,
    correct: 0,
    explain: 'Le mot « cote » est une étiquette : le programme va lire la valeur rangée derrière, ici 45. La valeur donnée au départ est l’entrée du programme.',
  },
  {
    id: 'al4-d4-formule',
    skill: 'variable',
    points: 2,
    requires: ['formule-programme'],
    prompt: 'Avec cote = 30, de combien avance « AVANCER de cote × 2 » ?',
    options: ['60', '30', '32', '2'],
    cols: 4,
    correct: 0,
    explain: 'Le programme lit d’abord cote (30), puis effectue le calcul 30 × 2 = 60, puis avance.',
  },
  {
    id: 'al4-d5-boucle',
    skill: 'boucle',
    points: 2,
    requires: ['boucle', 'repeter-n-fois'],
    prompt: '« RÉPÉTER 5 fois [ AVANCER de 40 ; TOURNER de 72° ] » : combien d’instructions sont réellement exécutées ?',
    options: ['10', '2', '5', '7'],
    cols: 4,
    correct: 0,
    explain: 'Le corps de la boucle contient 2 instructions, répétées 5 fois : 5 × 2 = 10 instructions exécutées, écrites en 2 seulement.',
  },
  {
    id: 'al4-d6-angle',
    skill: 'boucle',
    points: 2,
    requires: ['angle-exterieur'],
    prompt: 'Pour qu’un programme trace un hexagone régulier (6 côtés), de combien le stylo doit-il tourner à chaque virage ?',
    options: ['60°', '120°', '90°', '360°'],
    cols: 4,
    correct: 0,
    explain: 'Le stylo fait un tour complet en 6 virages égaux : 360 ÷ 6 = 60°.',
  },
  {
    id: 'al4-d7-bug',
    skill: 'reparer',
    points: 2,
    requires: ['deboguer'],
    prompt: 'Un programme devait tracer un carré, mais la figure ne se referme pas. Par où commencer ?',
    options: [
      'L’exécuter et s’arrêter au premier endroit où le tracé s’écarte de ce qu’on attendait',
      'Tout réécrire depuis le début',
      'Changer la première instruction au hasard',
      'Augmenter toutes les longueurs',
    ],
    cols: 1,
    correct: 0,
    explain: 'Les instructions situées avant le premier écart ont produit exactement ce qui était attendu : c’est celle qui vient juste après qu’il faut regarder.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleSubtitle="Ce que la 5e t’a appris sur les programmes"
      brief={{
        tag: '🎯 Mission de départ',
        title: 'Ce que tu sais déjà',
        tone: 'slate',
        body: (
          <>
            Sept questions rapides. Rien n’est noté, rien ne bloque : elles servent à savoir
            par où commencer.
          </>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
