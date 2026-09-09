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
 * qu'elle exige, toutes posées par une brique des modules 1 à 6.
 *
 * COUVERTURE. Chaque LP a au moins une épreuve qui lui est PROPRE, pour que le
 * profil de maîtrise soit interprétable :
 *   P1 générer par une formule ............ e1 (seule), e9
 *   P2 générer par récurrence ............. e2 (seule), e9
 *   P3 reconnaître arithmétique + raison .. e3 (seule), e7
 *   P4 reconnaître géométrique + raison ... e4 (seule), e10
 *   P5 démontrer .......................... e5 (seule), e6
 *   P6 sens de variation .................. e8 (seule), e7
 *
 * DISTRACTEURS, tous vérifiés numériquement et DISTINCTS de la bonne réponse
 * (components/suitesUtils.test.js) : rang décalé d'un cran (e1), règle
 * appliquée une fois de trop ou de trop peu (e2), dernier moins premier pris
 * pour la raison (e3), écart pris pour le rapport (e4), mauvais outil de preuve
 * (e5, e6), raison comparée à 1 sans regarder le premier terme (e8), « + 5 % »
 * lu comme « + 5 » (e10).
 */
const EPREUVES = [
  {
    id: 'sd-e1',
    requires: ['definition-explicite', 'methode-generer-termes'],
    skill: 'generer',
    title: 'Le calcul du rang',
    prompt: 'Pour u(n) = 2n + 1, que vaut u(4) ?',
    options: ['9', '11', '8', '10'],
    cols: 4,
    correct: 0,
    explain: 'On remplace n par 4 : 2 × 4 + 1 = 9. Répondre 11, c’est avoir calculé u(5) — le décalage d’un rang, l’erreur la plus discrète du chapitre, puisque l’on compte à partir de 0.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_suites-decouvrir-1ere_P1'] },
  },
  {
    id: 'sd-e2',
    requires: ['definition-recurrence', 'methode-generer-termes'],
    skill: 'generer',
    title: 'De proche en proche',
    prompt: 'On donne w(0) = 5 et w(n+1) = 2 × w(n) − 1. Que vaut w(3) ?',
    options: ['33', '17', '40', '65'],
    cols: 4,
    correct: 0,
    explain: 'w(1) = 2 × 5 − 1 = 9, w(2) = 2 × 9 − 1 = 17, w(3) = 2 × 17 − 1 = 33. Répondre 17, c’est s’être arrêté au rang 2 ; répondre 40, c’est avoir oublié le − 1 à chaque étape.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_suites-decouvrir-1ere_P2'] },
  },
  {
    id: 'sd-e3',
    requires: ['suite-arithmetique', 'methode-trouver-la-raison'],
    skill: 'reconnaitre',
    title: 'La raison d’une arithmétique',
    prompt: 'La suite 3, 7, 11, 15, 19 est arithmétique. Quelle est sa raison ?',
    options: ['4', '16', '3', '19'],
    cols: 4,
    correct: 0,
    explain: '7 − 3 = 4, 11 − 7 = 4 : la raison est l’écart entre deux termes CONSÉCUTIFS. Répondre 16, c’est avoir pris 19 − 3, l’écart entre le dernier et le premier.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_suites-decouvrir-1ere_P3'] },
  },
  {
    id: 'sd-e4',
    requires: ['suite-geometrique', 'methode-trouver-la-raison'],
    skill: 'reconnaitre',
    title: 'La raison d’une géométrique',
    prompt: 'La suite 80, 40, 20, 10, 5 est géométrique. Quelle est sa raison ?',
    options: ['0,5', '−40', '2', '−20'],
    cols: 4,
    correct: 0,
    explain: '40 ÷ 80 = 0,5, et 20 ÷ 40 = 0,5. Répondre −40, c’est avoir mesuré l’écart au lieu du rapport ; répondre 2, c’est avoir divisé dans l’autre sens.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_suites-decouvrir-1ere_P4'] },
  },
  {
    id: 'sd-e5',
    requires: ['methode-demontrer-arithmetique', 'mem-ecart-ou-rapport', 'preuve-vs-constat'],
    skill: 'demontrer',
    title: 'La preuve par l’écart',
    prompt: 'Pour u(n) = 5n − 2, on calcule u(n+1) − u(n). Que trouve-t-on, et que conclure ?',
    options: [
      'On trouve 5 : la suite est arithmétique de raison 5',
      'On trouve 5n + 3 : on ne peut pas conclure',
      'On trouve 5 : la suite est géométrique de raison 5',
      'On trouve −2 : la suite est arithmétique de raison −2',
    ],
    cols: 1,
    correct: 0,
    explain: '[5(n+1) − 2] − [5n − 2] = 5n + 5 − 2 − 5n + 2 = 5. Le résultat ne contient plus n : l’écart vaut 5 à tous les rangs, donc la suite est arithmétique de raison 5. Un écart constant démontre une suite arithmétique, jamais géométrique.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_suites-decouvrir-1ere_P5'] },
  },
  {
    id: 'sd-e6',
    requires: ['methode-demontrer-geometrique', 'mem-ecart-ou-rapport'],
    skill: 'demontrer',
    title: 'Le bon outil',
    prompt: 'Pour démontrer que v(n) = 4 × 3ⁿ est géométrique, quel calcul faut-il mener ?',
    options: [
      'v(n+1) ÷ v(n), qui vaut 3 pour tout rang n',
      'v(n+1) − v(n), qui vaut 3 pour tout rang n',
      'v(n) − v(0), qui mesure depuis le premier terme',
      'Il suffit de vérifier les quatre premiers termes',
    ],
    cols: 1,
    correct: 0,
    explain: '(4 × 3ⁿ⁺¹) ÷ (4 × 3ⁿ) = 3, sans n. L’écart, lui, n’est pas constant : il vaut 8 puis 24 puis 72. Et vérifier quelques termes ne démontre rien pour les rangs suivants.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_suites-decouvrir-1ere_P5', 'premiere_specialite_suites-decouvrir-1ere_P4'] },
  },
  {
    id: 'sd-e7',
    requires: ['suite-arithmetique', 'sens-variation-suite'],
    skill: 'sens',
    title: 'Raison négative',
    prompt: 'La suite 20, 14, 8, 2, −4 est arithmétique. Que peut-on dire de sa raison et de son sens ?',
    options: [
      'Raison −6, suite décroissante',
      'Raison 6, suite décroissante',
      'Raison −6, suite croissante',
      'Raison −24, suite décroissante',
    ],
    cols: 2,
    correct: 0,
    explain: '14 − 20 = −6, et l’écart est le même partout. Une raison négative fait descendre la suite : le signe de l’écart décide du sens.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_suites-decouvrir-1ere_P6', 'premiere_specialite_suites-decouvrir-1ere_P3'] },
  },
  {
    id: 'sd-e8',
    requires: ['regle-variation-geometrique', 'mem-sens-de-variation'],
    skill: 'sens',
    title: 'Multiplier, et pourtant descendre',
    prompt: 'Une suite géométrique a pour premier terme −3 et pour raison 2. Que fait-elle ?',
    options: [
      'Elle décroît : −3, −6, −12, −24',
      'Elle croît, puisque sa raison est plus grande que 1',
      'Elle est constante',
      'Elle croît puis décroît',
    ],
    cols: 1,
    correct: 0,
    explain: 'Multiplier par 2 un nombre négatif l’éloigne de zéro vers le bas : les écarts valent −3, −6, −12, tous négatifs. Comparer la raison à 1 ne suffit pas — il faut aussi le signe du premier terme, et en cas de doute l’écart tranche.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_suites-decouvrir-1ere_P6'] },
  },
  {
    id: 'sd-e9',
    requires: ['definition-explicite', 'definition-recurrence', 'methode-generer-termes'],
    skill: 'generer',
    title: 'Deux écritures, une suite',
    prompt: 'Quelle relation de proche en proche décrit la même suite que u(n) = 5n + 4 ?',
    options: [
      'u(0) = 4 et u(n+1) = u(n) + 5',
      'u(0) = 5 et u(n+1) = u(n) + 4',
      'u(0) = 4 et u(n+1) = 5 × u(n)',
      'u(0) = 0 et u(n+1) = u(n) + 5',
    ],
    cols: 1,
    correct: 0,
    explain: 'u(0) = 5 × 0 + 4 = 4, et d’un rang au suivant on ajoute 5. La deuxième écriture partirait de 5 ; la troisième multiplierait au lieu d’ajouter ; la quatrième partirait de 0.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_suites-decouvrir-1ere_P1', 'premiere_specialite_suites-decouvrir-1ere_P2'] },
  },
  {
    id: 'sd-e10',
    requires: ['modeliser-par-une-suite', 'coefficient-multiplicateur', 'suite-geometrique'],
    skill: 'modeliser',
    title: 'Une hausse de 5 %',
    prompt: 'Un loyer de 400 € augmente de 5 % chaque année. Combien vaut-il après une année ?',
    options: ['420 €', '405 €', '441 €', '500 €'],
    cols: 4,
    correct: 0,
    explain: 'Une hausse de 5 % se traduit par une multiplication par 1,05 : 400 × 1,05 = 420 €. Répondre 405, c’est avoir ajouté 5 € au lieu de 5 % ; 441 € est le loyer après DEUX années.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_suites-decouvrir-1ere_P4', 'premiere_specialite_suites-decouvrir-1ere_P3'] },
  },
];

// `module` pointe le module qui ENSEIGNE la compétence, jamais l'évaluation
// elle-même : le boss mesure, il n'enseigne pas.
const SKILLS = {
  generer: { label: 'Générer les termes', module: 2 },
  reconnaitre: { label: 'Reconnaître et trouver la raison', module: 3 },
  demontrer: { label: 'Démontrer la nature', module: 4 },
  sens: { label: 'Sens de variation', module: 5 },
  modeliser: { label: 'Modéliser une situation', module: 6 },
};

const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Fabricant de termes', test: (m) => !m.generer },
  { id: 'b2', emoji: '🏅', label: 'Chasseur de raison', test: (m) => !m.reconnaitre },
  { id: 'b3', emoji: '🏅', label: 'Démonstrateur', test: (m) => !m.demontrer },
  { id: 'b4', emoji: '🏅', label: 'Lecteur de sens', test: (m) => !m.sens },
  { id: 'b5', emoji: '🏅', label: 'Modélisateur', test: (m) => !m.modeliser },
  { id: 'b-parfait', emoji: '💎', label: 'Maître des deux familles', test: (m) => Object.keys(m).length === 0 },
];

export default function Module07MissionFinaleDeuxFamilles() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : deux familles"
      moduleSubtitle="Dix épreuves : générer, reconnaître, démontrer, décrire le sens"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître des deux familles',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation. Réflexe : les écarts d’abord, les rapports ensuite
            — et pour le sens, toujours le signe de l’écart.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '🔢', label: 'rang', value: 'on compte depuis 0' },
        { id: 'r2', emoji: '➕', label: 'arithmétique', value: 'écart constant r' },
        { id: 'r3', emoji: '✖️', label: 'géométrique', value: 'rapport constant q' },
        { id: 'r4', emoji: '↕️', label: 'sens', value: 'signe de u(n+1) − u(n)' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître des deux familles !',
        title: 'Mission accomplie',
        message: 'Tu sais fabriquer les termes d’une suite de deux façons, reconnaître sa famille, le démontrer et dire dans quel sens elle va.',
        verbs: ['Générer', 'Reconnaître', 'Démontrer', 'Décrire'],
        masterBadgeLabel: 'Maître des deux familles',
      }}
    />
  );
}
