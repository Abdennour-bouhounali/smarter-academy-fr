import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — prérequis. On MESURE ce que la leçon va employer sans l'enseigner :
 * tout ce que la Seconde a posé sur le cercle et les équations, et ce que la
 * première partie de ce chapitre a posé sur les deux fonctions.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Un module 0 ne peut exiger que des `priorKnowledge` : il mesure, il
 *   n'enseigne pas. AUCUNE question ne porte sur les solutions sur ℝ, sur la
 *   famille « + 2kπ », sur les inéquations trigonométriques, sur la
 *   duplication ni sur la modélisation — c'est la matière de la leçon, et la
 *   mesurer ici reviendrait à évaluer avant d'enseigner. Aucun de ces mots
 *   n'apparaît, pas même dans un `explain` : ni « famille », ni « arc », ni
 *   « duplication », ni « amplitude », ni « modéliser ».
 *
 *   Chaque prérequis déclaré est mesuré par au moins une question :
 *     te-d1   cercle-trigonometrique, radian, cos-sin-coordonnees, abscisse, ordonnee
 *     te-d2   valeurs-remarquables
 *     te-d3   regle-borne-un, regle-hors-bornes
 *     te-d4   equation-deux-solutions, methode-resoudre-cos
 *     te-d5   methode-resoudre-sin, regle-deux-symetries
 *     te-d6   formules-addition, identite-fondamentale
 *     te-d7   periodicite, courbe-sinusoide
 *     te-d8   lire-ecart-et-motif
 *     te-d9   equation-solution
 *     te-d10  inequation-infinite, methode-resoudre-inequation
 */
const SKILLS = {
  cercle: { label: 'Le cercle et ses valeurs', emoji: '🔵' },
  resoudre: { label: 'Résoudre sur un tour', emoji: '🎯' },
  formules: { label: 'Les formules connues', emoji: '📐' },
  courbes: { label: 'Les deux courbes', emoji: '🌊' },
  algebre: { label: 'Égalités et inégalités', emoji: '⚖️' },
};

const QUESTIONS = [
  {
    id: 'te-d1',
    requires: ['cercle-trigonometrique', 'radian', 'cos-sin-coordonnees', 'abscisse', 'ordonnee'],
    skill: 'cercle',
    points: 2,
    prompt: 'Sur le cercle trigonométrique, le point associé au réel x a pour coordonnées…',
    options: ['(cos x ; sin x)', '(sin x ; cos x)', '(x ; cos x)'],
    cols: 3,
    correct: 0,
    explain: 'cos x est l’abscisse (on la lit à l’horizontale) et sin x est l’ordonnée (on la lit à la verticale). On écrit toujours l’abscisse en premier.',
  },
  {
    id: 'te-d2',
    requires: ['valeurs-remarquables'],
    skill: 'cercle',
    points: 2,
    prompt: 'Que vaut cos(π/3) ?',
    options: ['0,5', '√3/2', '√2/2'],
    cols: 3,
    correct: 0,
    explain: 'cos(π/3) = 1/2 = 0,5. C’est sin(π/3) qui vaut √3/2 — les deux ne coïncident qu’en π/4.',
  },
  {
    id: 'te-d3',
    requires: ['regle-borne-un', 'regle-hors-bornes'],
    skill: 'cercle',
    points: 2,
    prompt: 'Combien de réels x vérifient cos x = 1,4 ?',
    options: [
      'Aucun : le point reste sur le cercle de rayon 1, donc cos x ne dépasse jamais 1',
      'Un seul',
      'Deux',
    ],
    cols: 1,
    correct: 0,
    explain: 'Le point ne quitte jamais le cercle de rayon 1 : ses deux coordonnées restent entre −1 et 1, bornes comprises. Aucun réel ne convient.',
  },
  {
    id: 'te-d4',
    requires: ['equation-deux-solutions', 'methode-resoudre-cos'],
    skill: 'resoudre',
    points: 2,
    prompt: 'Sur l’intervalle [0 ; 2π[, combien de réels vérifient cos x = 0,3 ?',
    options: ['Deux', 'Un seul', 'Trois'],
    cols: 3,
    correct: 0,
    explain: 'La droite verticale d’abscisse 0,3 rencontre le cercle en deux points, symétriques par rapport à l’axe horizontal. Il y a donc deux réels de [0 ; 2π[ qui conviennent.',
  },
  {
    id: 'te-d5',
    requires: ['methode-resoudre-sin', 'regle-deux-symetries'],
    skill: 'resoudre',
    points: 2,
    prompt: 'On sait que sin(π/6) = 0,5. Quel AUTRE réel de [0 ; 2π[ vérifie aussi sin x = 0,5 ?',
    options: ['5π/6', '−π/6', '7π/6'],
    cols: 3,
    correct: 0,
    explain: 'Pour le sinus, les deux points sont symétriques par rapport à l’axe VERTICAL : le second réel vaut π − π/6 = 5π/6. Le réel 7π/6 donnerait −0,5.',
  },
  {
    id: 'te-d6',
    requires: ['formules-addition', 'identite-fondamentale'],
    skill: 'formules',
    points: 2,
    prompt: 'Pour tous réels a et b, cos(a + b) est égal à…',
    options: [
      'cos a cos b − sin a sin b',
      'cos a cos b + sin a sin b',
      'cos a + cos b',
    ],
    cols: 1,
    correct: 0,
    explain: 'Le signe MOINS n’est pas une faute de frappe : c’est ce qui distingue la formule du cosinus de celle du sinus. Et cos(a + b) n’est jamais cos a + cos b.',
  },
  {
    id: 'te-d7',
    requires: ['periodicite', 'courbe-sinusoide'],
    skill: 'courbes',
    points: 2,
    prompt: 'Pour tout réel x, cos(x + 2π) est égal à…',
    options: ['cos x', '−cos x', 'cos x + 2π'],
    cols: 3,
    correct: 0,
    explain: '2π est un tour complet : le point revient exactement au même endroit du cercle, donc son abscisse ne change pas.',
  },
  {
    id: 'te-d8',
    requires: ['lire-ecart-et-motif'],
    skill: 'courbes',
    points: 2,
    prompt: 'Sur une courbe qui se répète, un sommet est en x = 2 et le sommet suivant en x = 10. Au bout de combien la courbe recommence-t-elle ?',
    options: ['8', '4', '12'],
    cols: 3,
    correct: 0,
    explain: 'D’un sommet au sommet suivant, la courbe a refait son motif entier : 10 − 2 = 8.',
  },
  {
    id: 'te-d9',
    requires: ['equation-solution'],
    skill: 'algebre',
    points: 2,
    prompt: 'Dire qu’un nombre est solution d’une équation, c’est dire que…',
    options: [
      'en le mettant à la place de l’inconnue, l’égalité devient vraie',
      'il apparaît quelque part dans l’équation',
      'il est plus grand que tous les autres',
    ],
    cols: 1,
    correct: 0,
    explain: 'On remplace, on calcule les deux membres, et l’on regarde s’ils sont égaux. C’est la seule vérification qui compte.',
  },
  {
    id: 'te-d10',
    requires: ['inequation-infinite', 'methode-resoudre-inequation'],
    skill: 'algebre',
    points: 2,
    prompt: 'Combien de nombres vérifient x ≥ 3 ?',
    options: [
      'Une infinité : tous ceux de l’intervalle [3 ; +∞[',
      'Un seul : 3',
      'Trois : 3, 4 et 5',
    ],
    cols: 1,
    correct: 0,
    explain: 'Une inégalité large ne désigne pas des nombres isolés mais tout un intervalle — ici, tout ce qu’il y a à partir de 3, sans limite.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ"
      moduleSubtitle="Dix questions sur ce que tu possèdes déjà"
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Cette leçon PART de deux choses que tu as déjà : ce que la Seconde t’a appris
            sur le cercle et les égalités qu’on y lit, et ce que la première partie de ce
            chapitre t’a appris sur les deux courbes. <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
