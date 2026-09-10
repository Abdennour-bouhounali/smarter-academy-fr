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
 * et distracteurs compris — et chaque épreuve déclare les connaissances
 * qu'elle exige, toutes posées par une brique des modules 2 à 6.
 *
 * COUVERTURE. Chaque LP a au moins une épreuve qui lui est PROPRE, pour que le
 * profil de maîtrise soit interprétable :
 *   P1 définition ......................... e1 (seule), e2
 *   P2 propriété caractéristique f′ = f ... e3 (seule), e2, e4
 *   P3 ensemble de définition et signe .... e5 (seule), e6
 *   P4 variations ......................... e7 (seule), e6
 *   P5 représentation graphique ........... e8 (seule), e9
 *   P6 dérivée de exp(u) .................. e10 (seule), e9
 *
 * DISTRACTEURS, tous vérifiés NUMÉRIQUEMENT et distincts de la bonne réponse
 * (components/expoUtils.test.js, section 8) : exp(0) confondu avec 0 ou avec e
 * (e1) ; la condition en 0 jugée décorative (e3) ; « elle finit par toucher
 * l'axe » (e5) ; « croissante seulement à droite » (e7) ; la tangente en 0
 * écrite y = x, y = 1 ou y = 2x + 1 (e8) ; le facteur oublié, additionné, ou
 * confondu avec la règle du produit (e10).
 */
const EPREUVES = [
  {
    id: 'ex-e1',
    requires: ['exponentielle-definition', 'mem-exp-egale-sa-derivee'],
    skill: 'definition',
    title: 'Les deux conditions',
    prompt: 'Que vaut exp(0) ?',
    options: ['1', '0', 'e', '−1'],
    cols: 4,
    correct: 0,
    explain: 'exp(0) = 1 : c’est l’une des deux conditions de la définition, celle qui choisit une seule fonction parmi toutes celles dont la dérivée est elle-même. Répondre e, c’est donner exp(1) ; répondre 0, c’est donner une valeur que cette fonction ne prend jamais.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_exponentielle-decouvrir-1ere_P1'] },
  },
  {
    id: 'ex-e2',
    requires: ['exponentielle-definition', 'propriete-caracteristique'],
    skill: 'definition',
    title: 'La définition complète',
    prompt: 'La fonction exponentielle est l’unique fonction définie sur ℝ qui vérifie…',
    options: [
      'f′ = f et f(0) = 1',
      'f′ = f seulement',
      'f(0) = 1 seulement',
      'f′ = 1 et f(0) = 1',
    ],
    cols: 2,
    correct: 0,
    explain: 'Les deux conditions sont nécessaires. Avec f′ = f seule, il existe une fonction par valeur de départ ; avec f(0) = 1 seule, une infinité de fonctions conviennent. Ensemble, elles n’en laissent qu’une.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_exponentielle-decouvrir-1ere_P1', 'premiere_specialite_exponentielle-decouvrir-1ere_P2'] },
  },
  {
    id: 'ex-e3',
    requires: ['propriete-caracteristique', 'mem-exp-egale-sa-derivee', 'nombre-derive'],
    skill: 'caracteristique',
    title: 'La pente en un point',
    prompt: 'En un point de la courbe de l’exponentielle, l’ordonnée vaut 5. Combien vaut la pente de la tangente en ce point ?',
    options: ['5', '1', '0', 'On ne peut pas le savoir sans connaître l’abscisse'],
    cols: 2,
    correct: 0,
    explain: 'La propriété caractéristique dit exactement cela : exp′(x) = exp(x). Là où l’ordonnée vaut 5, la pente vaut 5 — et l’abscisse n’a pas besoin d’être connue.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_exponentielle-decouvrir-1ere_P2'] },
  },
  {
    id: 'ex-e4',
    requires: ['propriete-caracteristique', 'exponentielle-definition'],
    skill: 'caracteristique',
    title: 'Pourquoi une seule',
    prompt: 'Deux fonctions vérifient toutes les deux f′ = f, mais l’une vaut 1 en 0 et l’autre vaut 3 en 0. Que peut-on dire ?',
    options: [
      'Elles sont différentes en tout point : la valeur en 0 les sépare définitivement',
      'Elles sont égales : la valeur en 0 n’a pas d’importance',
      'Elles se croisent une fois, puis divergent',
      'La seconde ne peut pas exister',
    ],
    cols: 1,
    correct: 0,
    explain: 'La condition f′ = f laisse une fonction par valeur de départ, et deux départs distincts donnent des fonctions qui ne se rejoignent jamais. C’est pour cela que la condition en 0 rend la définition unique.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_exponentielle-decouvrir-1ere_P2', 'premiere_specialite_exponentielle-decouvrir-1ere_P1'] },
  },
  {
    id: 'ex-e5',
    requires: ['exp-strictement-positive', 'mem-exp-jamais-nulle', 'exp-definie-sur-r'],
    skill: 'signe',
    title: 'Le signe',
    prompt: 'Que peut-on affirmer de exp(−1000) ?',
    options: [
      'C’est un nombre strictement positif, extrêmement petit',
      'C’est 0 : la fonction a fini par toucher l’axe',
      'C’est un nombre négatif, puisque −1000 est négatif',
      'Cela n’existe pas : l’exponentielle refuse les nombres négatifs',
    ],
    cols: 1,
    correct: 0,
    explain: 'L’exponentielle est définie sur ℝ, donc exp(−1000) existe ; et elle ne s’annule nulle part, car une valeur nulle imposerait une pente nulle, donc une fonction plate et nulle partout — ce qui contredit exp(0) = 1. Le résultat est donc strictement positif, quoique minuscule.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_exponentielle-decouvrir-1ere_P3'] },
  },
  {
    id: 'ex-e6',
    requires: ['exp-definie-sur-r', 'exp-strictement-croissante', 'ensemble-definition'],
    skill: 'signe',
    title: 'Où elle vit',
    prompt: 'Quel est l’ensemble de définition de la fonction exponentielle ?',
    options: ['ℝ', '[0 ; +∞[', 'ℝ privé de 0', ']0 ; +∞['],
    cols: 4,
    correct: 0,
    explain: 'Aucune valeur n’est interdite en entrée : l’ensemble de définition est ℝ. Attention à ne pas le confondre avec l’ensemble des valeurs ATTEINTES, qui est ]0 ; +∞[.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_exponentielle-decouvrir-1ere_P3', 'premiere_specialite_exponentielle-decouvrir-1ere_P4'] },
  },
  {
    id: 'ex-e7',
    requires: ['exp-strictement-croissante', 'signe-derivee-donne-sens'],
    skill: 'variations',
    title: 'Le sens de marche',
    prompt: 'Pourquoi l’exponentielle est-elle strictement croissante sur ℝ ?',
    options: [
      'Parce que sa dérivée est elle-même, donc strictement positive partout',
      'Parce que sa courbe monte sur le dessin',
      'Parce qu’elle vaut 1 en 0',
      'Parce que sa dérivée s’annule en 0 puis devient positive',
    ],
    cols: 1,
    correct: 0,
    explain: 'L’enchaînement tient en trois pas : exp′ = exp ; exp > 0 partout ; donc exp′ > 0 partout, et une dérivée strictement positive donne une fonction strictement croissante. Un dessin qui monte n’est pas une justification, et la dérivée ne s’annule jamais.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_exponentielle-decouvrir-1ere_P4'] },
  },
  {
    id: 'ex-e8',
    requires: ['tangente-en-zero', 'formule-equation-tangente'],
    skill: 'courbe',
    title: 'La tangente en 0',
    prompt: 'Quelle est l’équation de la tangente à la courbe de l’exponentielle au point d’abscisse 0 ?',
    options: ['y = x + 1', 'y = x', 'y = 1', 'y = 2x + 1'],
    cols: 4,
    correct: 0,
    explain: 'exp(0) = 1 et exp′(0) = 1, donc y = 1 × (x − 0) + 1 = x + 1. Vérification : en x = 0, on retrouve 1. L’écriture y = x raterait le point de contact, en donnant 0 au lieu de 1.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_exponentielle-decouvrir-1ere_P5'] },
  },
  {
    id: 'ex-e9',
    requires: ['exp-comportement-aux-bornes', 'regle-derivee-exp-u'],
    skill: 'courbe',
    title: 'Deux courbes, deux sens',
    prompt: 'Comparée à la courbe de exp, celle de la fonction x ↦ e^(−x)…',
    options: [
      'décroît, car sa dérivée −e^(−x) est négative partout',
      'croît de la même façon, car une exponentielle croît toujours',
      'est confondue avec elle',
      'coupe l’axe des abscisses une fois',
    ],
    cols: 1,
    correct: 0,
    explain: 'Le coefficient de x vaut −1 : il descend en facteur avec son signe, et la dérivée −e^(−x) est strictement négative partout. Cette fonction décroît donc. Elle reste cependant strictement positive, et ne coupe pas l’axe.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_exponentielle-decouvrir-1ere_P5', 'premiere_specialite_exponentielle-decouvrir-1ere_P6'] },
  },
  {
    id: 'ex-e10',
    requires: ['regle-derivee-exp-u', 'mem-facteur-descend', 'regle-composee-simple'],
    skill: 'deriver',
    title: 'Dériver un emboîtement',
    prompt: 'Quelle est la dérivée de f(x) = e^(2x) ?',
    options: ['2e^(2x)', 'e^(2x)', '2xe^(2x)', 'e^2'],
    cols: 4,
    correct: 0,
    explain: 'L’exponentielle se recopie, et le coefficient de x descend en facteur : (e^(2x))′ = 2e^(2x). Répondre e^(2x), c’est oublier le facteur ; répondre 2xe^(2x), c’est appliquer à tort la règle du produit.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_exponentielle-decouvrir-1ere_P6'] },
  },
];

// `module` pointe le module qui ENSEIGNE la compétence, jamais l'évaluation
// elle-même : le boss mesure, il n'enseigne pas.
const SKILLS = {
  definition: { label: 'La définition', module: 2 },
  caracteristique: { label: 'La propriété caractéristique', module: 2 },
  signe: { label: 'Où elle vit, et son signe', module: 3 },
  variations: { label: 'Les variations', module: 4 },
  courbe: { label: 'La courbe et sa tangente', module: 5 },
  deriver: { label: 'Dériver un emboîtement', module: 6 },
};

const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Deux conditions, une fonction', test: (m) => !m.definition && !m.caracteristique },
  { id: 'b2', emoji: '🏅', label: 'Jamais nulle', test: (m) => !m.signe },
  { id: 'b3', emoji: '🏅', label: 'Toujours en montée', test: (m) => !m.variations },
  { id: 'b4', emoji: '🏅', label: 'Traceur de courbes', test: (m) => !m.courbe },
  { id: 'b5', emoji: '🏅', label: 'Le facteur qui descend', test: (m) => !m.deriver },
  { id: 'b-parfait', emoji: '💎', label: 'Maître de l’exponentielle', test: (m) => Object.keys(m).length === 0 },
];

export default function Module07MissionFinaleLExponentielle() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : l’exponentielle"
      moduleSubtitle="Dix épreuves : une définition, un signe, un sens, une courbe, une dérivée"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître de l’exponentielle',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation. Réflexe : sa dérivée est elle-même, elle vaut 1 en
            0, et elle ne s’annule jamais. Presque tout en découle.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '✨', label: 'définition', value: 'exp′ = exp et exp(0) = 1' },
        { id: 'r2', emoji: '➕', label: 'signe', value: 'exp(x) > 0 sur ℝ' },
        { id: 'r3', emoji: '↗', label: 'variations', value: 'strictement croissante' },
        { id: 'r4', emoji: '📏', label: 'tangente en 0', value: 'y = x + 1' },
        { id: 'r5', emoji: '🔗', label: 'emboîtement', value: '(e^(ax+b))′ = a·e^(ax+b)' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître de l’exponentielle !',
        title: 'Mission accomplie',
        message: 'Tu sais la définir, justifier son signe, trancher ses variations, tracer sa courbe et dériver un emboîtement.',
        verbs: ['Définir', 'Justifier', 'Trancher', 'Dériver'],
        masterBadgeLabel: 'Maître de l’exponentielle',
      }}
    />
  );
}
