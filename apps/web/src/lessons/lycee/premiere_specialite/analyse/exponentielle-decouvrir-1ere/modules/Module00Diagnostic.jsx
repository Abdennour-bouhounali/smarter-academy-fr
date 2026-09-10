import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — prérequis. On MESURE ce que la leçon va employer sans l'enseigner :
 * la pente d'une courbe en un point et sa lecture sur la tangente (1ère amont),
 * l'équation d'une tangente (1ère amont), les dérivées usuelles et la composée
 * (1ère amont), et le passage du signe de la dérivée au sens de marche (1ère
 * amont).
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Un module 0 ne peut exiger que des `priorKnowledge` : il mesure, il
 *   n'enseigne pas. AUCUNE question ne porte sur une fonction égale à sa propre
 *   dérivée, sur le nombre e, sur le signe d'une telle fonction ni sur la
 *   dérivée d'un emboîtement exponentiel — c'est la matière de la leçon.
 *
 *   AUCUN MOT DE LA LEÇON N'Y FIGURE, pas même dans un `explain`. Les questions
 *   portent sur des fonctions POLYNOMIALES, dont l'élève sait déjà tout : c'est
 *   la seule façon de mesurer l'outil sans nommer l'objet auquel la leçon va
 *   l'appliquer.
 *
 *   Chaque prérequis déclaré est mesuré par au moins une question :
 *     ex-d1  nombre-derive, derive-coefficient-directeur, fonction, notation-fx,
 *            pente, tangente, tangente-courbe
 *     ex-d2  formule-equation-tangente, abscisse, ordonnee
 *     ex-d3  derivees-usuelles, regle-composee-simple, facteur
 *     ex-d4  signe-derivee-donne-sens, variations, ensemble-reels, intervalle,
 *            intervalle-crochets, ensemble-definition
 *     ex-d5  methode-construire-tableau-depuis-derivee, tableau-de-signes
 */
const SKILLS = {
  derivee: { label: 'Le nombre dérivé', emoji: '📈' },
  tangente: { label: 'La tangente', emoji: '📏' },
  calcul: { label: 'Règles de calcul', emoji: '🧮' },
  sens: { label: 'Sens de marche', emoji: '↗' },
};

const QUESTIONS = [
  {
    id: 'ex-d1',
    requires: ['nombre-derive', 'derive-coefficient-directeur', 'fonction', 'notation-fx', 'pente', 'tangente', 'tangente-courbe'],
    skill: 'derivee',
    points: 2,
    prompt: 'Pour une fonction g, que représente le nombre g′(3) sur le dessin de la courbe ?',
    options: [
      'La pente de la tangente à la courbe au point d’abscisse 3',
      'L’ordonnée du point de la courbe d’abscisse 3',
      'La valeur la plus grande atteinte par g',
    ],
    cols: 1,
    correct: 0,
    explain: 'g′(3) est la pente de la tangente au point d’abscisse 3. L’ordonnée de ce point s’écrit g(3) : au même endroit, deux nombres qui répondent à deux questions différentes.',
  },
  {
    id: 'ex-d2',
    requires: ['formule-equation-tangente', 'abscisse', 'ordonnee'],
    skill: 'tangente',
    points: 2,
    prompt: 'Une fonction g vérifie g(0) = 4 et g′(0) = 2. Quelle est l’équation de la tangente à sa courbe au point d’abscisse 0 ?',
    options: ['y = 2x + 4', 'y = 4x + 2', 'y = 2x', 'y = 4'],
    cols: 2,
    correct: 0,
    explain: 'On applique y = g′(0)(x − 0) + g(0), soit y = 2x + 4. Vérification : en x = 0 on retrouve bien 4, l’ordonnée du point de contact.',
  },
  {
    id: 'ex-d3',
    requires: ['derivees-usuelles', 'regle-composee-simple', 'facteur'],
    skill: 'calcul',
    points: 2,
    prompt: 'Quelle est la dérivée de g(x) = (5x + 2)³ ?',
    options: ['15(5x + 2)²', '3(5x + 2)²', '(5x + 2)²', '15(5x + 2)³'],
    cols: 2,
    correct: 0,
    explain: 'On dérive l’enveloppe — ce qui donne 3(5x + 2)² — puis on multiplie par la dérivée de l’intérieur, qui vaut 5. D’où 3 × 5 = 15 en facteur devant.',
  },
  {
    id: 'ex-d4',
    requires: ['signe-derivee-donne-sens', 'variations', 'ensemble-reels', 'intervalle', 'intervalle-crochets', 'ensemble-definition'],
    skill: 'sens',
    points: 2,
    prompt: 'Une fonction g a pour ensemble de définition ℝ, et sa dérivée g′ est strictement positive sur tout l’intervalle ]−∞ ; +∞[. Que peut-on affirmer ?',
    options: [
      'g est strictement croissante sur ℝ',
      'g est strictement décroissante sur ℝ',
      'g est constante sur ℝ',
    ],
    cols: 1,
    correct: 0,
    explain: 'Une dérivée strictement positive sur un intervalle donne une fonction strictement croissante sur cet intervalle. C’est le théorème du sens de marche, et il se lit dans les deux sens.',
  },
  {
    id: 'ex-d5',
    requires: ['methode-construire-tableau-depuis-derivee', 'tableau-de-signes'],
    skill: 'sens',
    points: 2,
    prompt: 'On veut ranger le sens de marche d’une fonction g dans un tableau. Par quoi commence-t-on ?',
    options: [
      'Par déterminer le SIGNE de g′ sur chaque morceau de l’ensemble d’étude',
      'Par calculer g(0), g(1) et g(2) et ranger les résultats',
      'Par tracer la courbe de g et la recopier',
    ],
    cols: 1,
    correct: 0,
    explain: 'La ligne du signe de g′ se pose AVANT la ligne des flèches : c’est elle qui décide du sens de marche de chaque morceau. Quand ce signe ne change jamais, le tableau ne comporte qu’une seule flèche.',
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
            Avant de partir à la recherche d’une courbe très particulière, un tour de tes outils :
            ce qu’est g′(a), comment on écrit une tangente, comment on dérive un emboîtement, et
            comment le signe de la dérivée décide du sens de marche.{' '}
            <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
