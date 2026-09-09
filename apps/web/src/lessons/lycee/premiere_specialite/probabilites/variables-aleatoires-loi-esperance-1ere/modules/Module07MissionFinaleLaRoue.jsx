import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — ÉVALUATION.
 *
 * CONNAISSANCES AVANT LA DEMANDE. La mission finale CONSOLIDE : elle
 * n'introduit rien de neuf — ni concept, ni vocabulaire, ni notation, options
 * et distracteurs compris — et chaque épreuve déclare les connaissances qu'elle
 * exige, toutes posées par une brique des modules 1 à 6.
 *
 * COUVERTURE. Chaque LP a au moins une épreuve qui lui est PROPRE, pour que le
 * profil de maîtrise soit interprétable :
 *   P1 définir une variable aléatoire ....... e1 (seule), e2
 *   P2 déterminer la loi .................... e3 (seule), e2
 *   P3 représenter par un tableau ........... e6 (seule), e3
 *   P4 calculer l'espérance ................. e4 (seule), e5
 *   P5 interpréter l'espérance .............. e7 (seule), e8
 *   P6 décider .............................. e9 (seule), e10
 *
 * DISTRACTEURS, tous vérifiés numériquement et DISTINCTS de la bonne réponse
 * (components/roueUtils.test.js, groupe « les distracteurs du boss ») : issues
 * comptées pour des valeurs (e1), part rapportée au mauvais tout (e2), somme
 * des probabilités ignorée (e6), moyenne simple au lieu de la pondérée (e4, e5),
 * espérance prise pour un gain individuel (e7), mise oubliée (e8, e9), gros lot
 * pris pour critère (e10).
 *
 * PARSE. Aucune épreuve n'est une saisie numérique : ce sont des QCM, et les
 * réponses décimales y sont des OPTIONS écrites. La règle `parse={parseDec}`
 * concerne les `NumericQuestion` des modules formatifs, où elle est appliquée.
 */
const EPREUVES = [
  {
    id: 'va-e1',
    requires: ['variable-aleatoire', 'valeurs-prises'],
    skill: 'definir',
    title: 'Combien de valeurs ?',
    prompt: 'Une urne contient 8 jetons : trois portent 2 €, trois portent 2 € également, et deux portent 9 €. X est le montant tiré. Combien de valeurs différentes X peut-il prendre ?',
    options: ['2', '8', '3', '6'],
    cols: 4,
    correct: 0,
    explain: 'Les six premiers jetons portent tous 2 € : cela fait UNE valeur. Avec 9 €, X prend 2 valeurs. Répondre 8, c’est compter les jetons (les issues) et non les valeurs.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_variables-aleatoires-loi-esperance-1ere_P1'] },
  },
  {
    id: 'va-e2',
    requires: ['variable-aleatoire', 'loi-de-probabilite', 'probabilite'],
    skill: 'definir',
    title: 'Lire une probabilité',
    prompt: 'Une roue a 10 secteurs de même taille : 4 paient 0 €, 4 paient 1 €, 2 paient 5 €. X est le gain. Que vaut P(X = 5) ?',
    options: ['0,2', '0,25', '0,1', '0,4'],
    cols: 4,
    correct: 0,
    explain: '2 secteurs sur les 10 que compte la roue : 2/10 = 0,2. Répondre 0,25, c’est avoir rapporté les 2 secteurs aux 8 autres au lieu du total.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_variables-aleatoires-loi-esperance-1ere_P1', 'premiere_specialite_variables-aleatoires-loi-esperance-1ere_P2'] },
  },
  {
    id: 'va-e3',
    requires: ['loi-de-probabilite', 'tableau-de-loi', 'somme-des-probabilites-vaut-1'],
    skill: 'loi',
    title: 'Dresser la loi',
    prompt: 'On tire une boule au hasard dans un sac de six boules identiques numérotées de 1 à 6. X vaut 1 si le numéro est pair, et 0 sinon. Quelle est la loi de X ?',
    options: [
      'P(X = 0) = 1/2 et P(X = 1) = 1/2',
      'P(X = 0) = 1/6 et P(X = 1) = 5/6',
      'P(X = 0) = 1/3 et P(X = 1) = 2/3',
      'P(X = 0) = 0 et P(X = 1) = 1',
    ],
    cols: 1,
    correct: 0,
    explain: 'Trois numéros sont pairs (2, 4, 6) et trois impairs : 3/6 = 1/2 de chaque côté. La somme fait bien 1.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_variables-aleatoires-loi-esperance-1ere_P2'] },
  },
  {
    id: 'va-e4',
    requires: ['esperance', 'methode-calculer-esperance', 'mem-esperance'],
    skill: 'esperance',
    title: 'Calculer une espérance',
    prompt: 'X vaut 0 € avec la probabilité 0,4 ; 1 € avec 0,4 ; 5 € avec 0,2. Que vaut E(X) ?',
    options: ['1,4 €', '2 €', '1 €', '14 €'],
    cols: 4,
    correct: 0,
    explain: '0 × 0,4 + 1 × 0,4 + 5 × 0,2 = 0 + 0,4 + 1 = 1,4 €. Répondre 2 €, c’est faire la moyenne simple (0 + 1 + 5) ÷ 3, qui ignore les probabilités.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_variables-aleatoires-loi-esperance-1ere_P4'] },
  },
  {
    id: 'va-e5',
    requires: ['esperance', 'methode-calculer-esperance', 'tableau-de-loi'],
    skill: 'esperance',
    title: 'Une valeur rare mais forte',
    prompt: 'X vaut 2 avec la probabilité 0,9 et 100 avec la probabilité 0,1. Que vaut E(X) ?',
    options: ['11,8', '51', '10', '2'],
    cols: 4,
    correct: 0,
    explain: '2 × 0,9 + 100 × 0,1 = 1,8 + 10 = 11,8. Répondre 51, c’est faire la moyenne de 2 et 100 en oubliant que 100 est neuf fois plus rare.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_variables-aleatoires-loi-esperance-1ere_P4', 'premiere_specialite_variables-aleatoires-loi-esperance-1ere_P2'] },
  },
  {
    id: 'va-e6',
    requires: ['tableau-de-loi', 'somme-des-probabilites-vaut-1'],
    skill: 'loi',
    title: 'La case manquante',
    prompt: 'Un tableau donne P(X = 0) = 0,5 et P(X = 2) = 0,3, la troisième valeur étant 10. Que vaut P(X = 10) ?',
    options: ['0,2', '0,8', '0,5', '1'],
    cols: 4,
    correct: 0,
    explain: 'La somme des probabilités d’une loi vaut 1 : 1 − 0,5 − 0,3 = 0,2. Répondre 0,8, c’est n’avoir retiré qu’une des deux probabilités connues.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_variables-aleatoires-loi-esperance-1ere_P3'] },
  },
  {
    id: 'va-e7',
    requires: ['esperance-moyenne-long-terme', 'moyenne-hors-des-valeurs'],
    skill: 'interpreter',
    title: 'Ce que le nombre annonce',
    prompt: 'Un billet de tombola a une espérance de gain de 1,275 €. Les lots possibles sont 0, 5, 20 et 100 €. Que peut-on affirmer ?',
    options: [
      'Sur un très grand nombre de billets, chacun rapporte en moyenne 1,275 € — mais aucun billet ne paie cette somme',
      'Chaque billet acheté rapporte 1,275 €',
      'Un billet sur quatre rapporte 1,275 €',
      'Le calcul est faux : 1,275 € ne figure pas parmi les lots',
    ],
    cols: 1,
    correct: 0,
    explain: 'L’espérance est une moyenne sur un grand nombre de répétitions, pas une promesse individuelle. Et une moyenne n’a pas à figurer parmi les valeurs qu’elle moyenne — comme 3,5 pour un sac de six boules numérotées de 1 à 6.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_variables-aleatoires-loi-esperance-1ere_P5'] },
  },
  {
    id: 'va-e8',
    requires: ['benefice-espere', 'esperance-moyenne-long-terme'],
    skill: 'interpreter',
    title: 'Retirer la mise',
    prompt: 'Un billet coûte 2 € et son espérance de gain vaut 1,275 €. Que vaut le bénéfice espéré de l’acheteur ?',
    options: ['−0,725 €', '1,275 €', '0,725 €', '0 €'],
    cols: 4,
    correct: 0,
    explain: 'Bénéfice espéré = E(X) − mise = 1,275 − 2 = −0,725 €. Répondre 0,725 €, c’est avoir fait la soustraction à l’envers : c’est ce que gagne l’organisateur, pas l’acheteur.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_variables-aleatoires-loi-esperance-1ere_P5', 'premiere_specialite_variables-aleatoires-loi-esperance-1ere_P4'] },
  },
  {
    id: 'va-e9',
    requires: ['jeu-equitable', 'benefice-espere', 'mem-decider'],
    skill: 'decider',
    title: 'Équitable ou non',
    prompt: 'Une partie coûte 3 € et l’espérance de gain vaut 3 €. Ce jeu est…',
    options: [
      'Équitable : le bénéfice espéré est nul, ni le joueur ni l’organisateur ne gagne à long terme',
      'Favorable au joueur, puisqu’il peut gagner 3 €',
      'Favorable à l’organisateur, qui encaisse toujours la mise',
      'Impossible à juger sans connaître le plus gros lot',
    ],
    cols: 1,
    correct: 0,
    explain: '3 − 3 = 0 : le bénéfice espéré est nul, c’est la définition d’un jeu équitable. Cela ne veut pas dire qu’on gagne à chaque partie, mais que le bilan tend vers zéro sur un grand nombre de parties.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_variables-aleatoires-loi-esperance-1ere_P6'] },
  },
  {
    id: 'va-e10',
    requires: ['decider-par-esperance', 'mem-decider', 'benefice-espere'],
    skill: 'decider',
    title: 'Choisir un stand',
    prompt: 'Deux stands font payer 3 € la partie. Le stand ⚡ a une espérance de gain de 2,40 € et affiche un lot de 20 € ; le stand 🐢 a une espérance de 3 € et plafonne à 5 €. Lequel choisir ?',
    options: [
      'Le stand 🐢 : son bénéfice espéré vaut 0 €, contre −0,60 € pour ⚡',
      'Le stand ⚡ : son lot de 20 € est le plus gros',
      'Les deux se valent : la partie coûte 3 € des deux côtés',
      'Le stand ⚡ : son espérance de 2,40 € est positive',
    ],
    cols: 1,
    correct: 0,
    explain: 'On compare les bénéfices espérés, mise déduite : 3 − 3 = 0 pour 🐢, et 2,40 − 3 = −0,60 pour ⚡. La taille du plus gros lot ne dit rien tant qu’on ne l’a pas pesée par sa probabilité.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_variables-aleatoires-loi-esperance-1ere_P6', 'premiere_specialite_variables-aleatoires-loi-esperance-1ere_P5'] },
  },
];

// `module` pointe le module qui ENSEIGNE la compétence, jamais l'évaluation
// elle-même : le boss mesure, il n'enseigne pas.
const SKILLS = {
  definir: { label: 'Définir la variable', module: 2 },
  loi: { label: 'Dresser la loi et son tableau', module: 3 },
  esperance: { label: 'Calculer l’espérance', module: 4 },
  interpreter: { label: 'Interpréter l’espérance', module: 5 },
  decider: { label: 'Décider avec l’espérance', module: 6 },
};

const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Un nombre par issue', test: (m) => !m.definir },
  { id: 'b2', emoji: '🏅', label: 'Maître du tableau', test: (m) => !m.loi },
  { id: 'b3', emoji: '🏅', label: 'Calculateur d’espérance', test: (m) => !m.esperance },
  { id: 'b4', emoji: '🏅', label: 'Lecteur de sens', test: (m) => !m.interpreter },
  { id: 'b5', emoji: '🏅', label: 'Décideur rationnel', test: (m) => !m.decider },
  { id: 'b-parfait', emoji: '💎', label: 'Maître de la roue', test: (m) => Object.keys(m).length === 0 },
];

export default function Module07MissionFinaleLaRoue() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : la roue"
      moduleSubtitle="Dix épreuves : une variable, une loi, un tableau, une espérance, une décision"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître de la roue',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation. Réflexe : le tableau d’abord, les produits
            ensuite — et toujours retirer la mise avant de décider.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '🎯', label: 'X', value: 'un nombre par issue' },
        { id: 'r2', emoji: '📋', label: 'loi', value: 'somme des probabilités = 1' },
        { id: 'r3', emoji: '🧮', label: 'E(X)', value: 'Σ valeur × probabilité' },
        { id: 'r4', emoji: '⚖️', label: 'décider', value: 'E(X) − mise' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître de la roue !',
        title: 'Mission accomplie',
        message: 'Tu sais définir une variable aléatoire, dresser sa loi, calculer son espérance, l’interpréter et t’en servir pour décider.',
        verbs: ['Définir', 'Dresser', 'Calculer', 'Décider'],
        masterBadgeLabel: 'Maître de la roue',
      }}
    />
  );
}
