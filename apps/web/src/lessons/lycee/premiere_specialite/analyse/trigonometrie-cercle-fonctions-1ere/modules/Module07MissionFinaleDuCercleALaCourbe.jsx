import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — ÉVALUATION.
 *
 * CONNAISSANCES AVANT LA DEMANDE. La mission finale CONSOLIDE : elle
 * n'introduit rien de neuf — ni concept, ni vocabulaire, ni notation — et
 * chaque épreuve déclare les connaissances qu'elle exige, toutes posées par
 * une brique des modules 2 à 6 ou par les `priorKnowledge` de la Seconde.
 *
 * COUVERTURE. Chaque LP a au moins une épreuve qui lui est PROPRE, pour que le
 * profil de maîtrise soit interprétable :
 *   P1 situer un réel ...................... e1 (seule), e2
 *   P2 parité .............................. e3 (seule), e4, e10
 *   P3 périodicité ......................... e5 (seule), e2, e6
 *   P4 variations .......................... e7 (seule), e8
 *   P5 représenter ......................... e8 (seule)
 *   P6 interpréter une courbe .............. e9 (seule), e10
 *
 * DISTRACTEURS, tous vérifiés numériquement et DISTINCTS de la bonne réponse
 * (components/trigFnUtils.test.js) : le réel pris pour sa valeur (e1), le tour
 * oublié (e2), les deux règles de parité échangées (e3, e4), un demi-tour pris
 * pour un tour (e5, e6), le sinus et le cosinus confondus (e7), le sommet placé
 * en 0 (e8), le motif mesuré du sommet au creux — donc de moitié (e9), et
 * l'écart maximal déduit à tort du motif (e10).
 *
 * PÉRIMÈTRE : aucune épreuve ne demande de RÉSOUDRE cos x = k ou sin x = k, ni
 * n'emploie de formule d'addition — c'est la leçon suivante.
 */
const EPREUVES = [
  {
    id: 'tf-e1',
    requires: ['reel-au-dela-du-tour', 'enroulement'],
    skill: 'situer',
    title: 'Au-delà du tour',
    prompt: 'Sur le cercle, le réel 9π/4 arrive au même point que…',
    options: ['π/4', '3π/4', '5π/4', '9π'],
    cols: 4,
    correct: 0,
    explain: '9π/4 − 2π = 9π/4 − 8π/4 = π/4 : on retranche un tour complet, et le point ne bouge pas.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_trigonometrie-cercle-fonctions-1ere_P1'] },
  },
  {
    id: 'tf-e2',
    requires: ['reel-au-dela-du-tour', 'methode-ramener-dans-un-tour', 'valeurs-remarquables'],
    skill: 'situer',
    title: 'Une valeur à retrouver',
    prompt: 'Que vaut sin(13π/6) ?',
    options: ['0,5', '−0,5', '0', '13'],
    cols: 4,
    correct: 0,
    explain: '13π/6 = 2π + π/6. Un tour de plus ne change rien : sin(13π/6) = sin(π/6) = 0,5. Répondre 13, c’est confondre le réel enroulé avec la hauteur du point.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_trigonometrie-cercle-fonctions-1ere_P1', 'premiere_specialite_trigonometrie-cercle-fonctions-1ere_P3'] },
  },
  {
    id: 'tf-e3',
    requires: ['parite-sinus-cosinus', 'mem-pair-cos-impair-sin'],
    skill: 'parite',
    title: 'Changer de sens',
    prompt: 'Pour tout réel x, cos(−x) est égal à…',
    options: ['cos x', '−cos x', 'sin x', '−sin x'],
    cols: 4,
    correct: 0,
    explain: 'Tourner à l’envers ne change pas la position HORIZONTALE du point : l’abscisse reste la même, donc cos(−x) = cos x. Le cosinus est une fonction paire.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_trigonometrie-cercle-fonctions-1ere_P2'] },
  },
  {
    id: 'tf-e4',
    requires: ['parite-sinus-cosinus', 'mem-pair-cos-impair-sin', 'valeurs-remarquables'],
    skill: 'parite',
    title: 'Le sinus retourné',
    prompt: 'On sait que sin(π/6) = 0,5. Que vaut sin(−π/6) ?',
    options: ['−0,5', '0,5', '−2', '0'],
    cols: 4,
    correct: 0,
    explain: 'Le sinus est impair : sin(−x) = −sin x, donc sin(−π/6) = −0,5. Répondre 0,5 revient à lui appliquer la règle du cosinus.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_trigonometrie-cercle-fonctions-1ere_P2'] },
  },
  {
    id: 'tf-e5',
    requires: ['periodicite'],
    skill: 'periode',
    title: 'La longueur qui se répète',
    prompt: 'Quelle est la plus petite longueur au bout de laquelle la courbe de la fonction sinus reprend exactement la même forme ?',
    options: ['2π', 'π', 'π/2', '4π'],
    cols: 4,
    correct: 0,
    explain: 'Un tour complet du cercle mesure 2π : c’est ce qu’il faut pour revenir au même point. Un demi-tour ne suffit pas — sin(π/2) = 1 alors que sin(π/2 + π) = −1. Et 4π convient, mais ce n’est pas le plus petit.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_trigonometrie-cercle-fonctions-1ere_P3'] },
  },
  {
    id: 'tf-e6',
    requires: ['periodicite', 'methode-ramener-dans-un-tour'],
    skill: 'periode',
    title: 'Deux tours plus loin',
    prompt: 'Pour tout réel x, cos(x + 4π) est égal à…',
    options: ['cos x', '−cos x', '4 cos x', 'cos x + 4π'],
    cols: 4,
    correct: 0,
    explain: '4π vaut exactement deux tours. Ajouter un nombre entier de tours ramène au même point du cercle, donc à la même abscisse : cos(x + 4π) = cos x.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_trigonometrie-cercle-fonctions-1ere_P3'] },
  },
  {
    id: 'tf-e7',
    requires: ['variations-sin-cos', 'methode-lire-tableau-trigo'],
    skill: 'variations',
    title: 'Monter ou descendre',
    prompt: 'Sur l’intervalle [π/2 ; 3π/2], que fait la fonction sinus ?',
    options: [
      'Elle descend : elle part de 1 pour arriver à −1',
      'Elle monte : elle part de −1 pour arriver à 1',
      'Elle monte puis elle descend',
      'Elle reste constante',
    ],
    cols: 1,
    correct: 0,
    explain: 'En π/2 le sinus est à son point le plus haut (1) et en 3π/2 à son point le plus bas (−1) : entre les deux, il ne fait que descendre. C’est le cosinus qui part de 1 en 0.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_trigonometrie-cercle-fonctions-1ere_P4'] },
  },
  {
    id: 'tf-e8',
    requires: ['courbe-sinusoide', 'mem-cinq-points-du-tour', 'variations-sin-cos'],
    skill: 'tracer',
    title: 'Les cinq points',
    prompt: 'En parcourant 0, π/2, π, 3π/2 puis 2π, la fonction sinus prend successivement les valeurs…',
    options: ['0 ; 1 ; 0 ; −1 ; 0', '1 ; 0 ; −1 ; 0 ; 1', '0 ; 1 ; 2 ; 1 ; 0', '0 ; 0,5 ; 1 ; 0,5 ; 0'],
    cols: 2,
    correct: 0,
    explain: 'Le sinus part du milieu, monte au sommet en π/2, revient au milieu en π, plonge au creux en 3π/2 et revient au milieu. La suite « 1 ; 0 ; −1 ; 0 ; 1 » est celle du COSINUS, qui commence à son sommet.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_trigonometrie-cercle-fonctions-1ere_P5'] },
  },
  {
    id: 'tf-e9',
    requires: ['lire-ecart-et-motif', 'periodicite'],
    skill: 'lire',
    title: 'Du sommet au sommet',
    prompt: 'Sur une courbe qui se répète, un sommet est en x = 1 et le creux suivant en x = 4. Quelle est la longueur du motif qui se répète ?',
    options: ['6', '3', '4', '1,5'],
    cols: 4,
    correct: 0,
    explain: 'Du sommet au creux, la courbe n’a fait que la MOITIÉ de son motif : cette moitié mesure 4 − 1 = 3, donc le motif entier mesure 6. Répondre 3, c’est s’arrêter à mi-parcours.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_trigonometrie-cercle-fonctions-1ere_P6'] },
  },
  {
    id: 'tf-e10',
    requires: ['lire-ecart-et-motif', 'regle-courbe-ne-dit-pas-tout', 'parite-sinus-cosinus'],
    skill: 'lire',
    title: 'Deux nombres séparés',
    prompt: 'Deux courbes se répètent toutes les deux au bout de 2π. Que peut-on en conclure sur leur écart maximal à l’axe ?',
    options: [
      'Rien : deux courbes peuvent se répéter au même rythme sans monter à la même hauteur',
      'Elles montent forcément à la même hauteur',
      'Celle qui monte le plus haut se répète plus vite',
      'Leur écart maximal vaut forcément 2π',
    ],
    cols: 1,
    correct: 0,
    explain: 'L’écart maximal se lit à la verticale, la longueur du motif à l’horizontale : ce sont deux renseignements indépendants. Une vague qui monte à 3 et une qui monte à 1 peuvent parfaitement recommencer toutes les deux au bout de 2π.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_trigonometrie-cercle-fonctions-1ere_P6', 'premiere_specialite_trigonometrie-cercle-fonctions-1ere_P2'] },
  },
];

// `module` pointe le module qui ENSEIGNE la compétence, jamais l'évaluation
// elle-même : le boss mesure, il n'enseigne pas.
const SKILLS = {
  situer: { label: 'Situer un réel', module: 2 },
  parite: { label: 'Parité', module: 3 },
  periode: { label: 'Périodicité', module: 3 },
  variations: { label: 'Variations', module: 4 },
  tracer: { label: 'Tracer les courbes', module: 5 },
  lire: { label: 'Lire une courbe', module: 6 },
};

const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Enrouleur de réels', test: (m) => !m.situer },
  { id: 'b2', emoji: '🏅', label: 'Maître du miroir', test: (m) => !m.parite },
  { id: 'b3', emoji: '🏅', label: 'Compteur de tours', test: (m) => !m.periode },
  { id: 'b4', emoji: '🏅', label: 'Lecteur de variations', test: (m) => !m.variations },
  { id: 'b5', emoji: '🏅', label: 'Traceur de vagues', test: (m) => !m.tracer && !m.lire },
  { id: 'b-parfait', emoji: '💎', label: 'Du cercle à la courbe', test: (m) => Object.keys(m).length === 0 },
];

export default function Module07MissionFinaleDuCercleALaCourbe() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : du cercle à la courbe"
      moduleSubtitle="Dix épreuves : situer, retourner, répéter, varier, tracer, lire"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Du cercle à la courbe',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation. Deux réflexes : « x + un tour » ne change rien, et
            « −x » retourne le sinus mais pas le cosinus.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '🔄', label: 'un tour', value: '2π, et on revient' },
        { id: 'r2', emoji: '🪞', label: 'à l’envers', value: 'cos garde, sin retourne' },
        { id: 'r3', emoji: '📈', label: 'sin sur un tour', value: '0 · 1 · 0 · −1 · 0' },
        { id: 'r4', emoji: '📉', label: 'cos sur un tour', value: '1 · 0 · −1 · 0 · 1' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Du cercle à la courbe !',
        title: 'Mission accomplie',
        message: 'Tu sais situer n’importe quel réel, utiliser la parité et la périodicité, décrire les variations, tracer les deux courbes et lire une courbe qu’on te donne.',
        verbs: ['Situer', 'Retourner', 'Répéter', 'Lire'],
        masterBadgeLabel: 'Du cercle à la courbe',
      }}
    />
  );
}
