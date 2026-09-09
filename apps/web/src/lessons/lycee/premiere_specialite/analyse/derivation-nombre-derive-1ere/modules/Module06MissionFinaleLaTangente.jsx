import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 6 — ÉVALUATION.
 *
 * CONNAISSANCES AVANT LA DEMANDE. La mission finale CONSOLIDE : elle
 * n'introduit rien de neuf — ni concept, ni vocabulaire, ni notation — et
 * chaque épreuve déclare les connaissances qu'elle exige, toutes posées par
 * une brique des modules 1 à 5.
 *
 * COUVERTURE. Chaque LP a au moins une épreuve qui lui est PROPRE, pour que le
 * profil de maîtrise soit interprétable :
 *   P1 taux de variation .................. e1 (seule), e2
 *   P2 nombre dérivé comme limite ......... e3 (seule), e2, e7
 *   P3 pente de la tangente ............... e4 (seule), e5, e6
 *   P4 équation de la tangente ............ e8 (seule), e9, e10
 *
 * DISTRACTEURS, tous vérifiés numériquement et DISTINCTS de la bonne réponse
 * (components/derivUtils.test.js) : montée sans division (e1), h gardé au lieu
 * d'être annulé (e3), f(a) pris pour f′(a) (e4), position de la courbe prise
 * pour le signe de la pente (e5), « une tangente ne touche qu'en un point »
 * (e6), h = 0 posé directement (e7), décalage oublié (e8, e9, e10).
 */
const EPREUVES = [
  {
    id: 'dv-e1',
    requires: ['taux-variation-secante', 'taux-accroissement'],
    skill: 'taux',
    title: 'Le taux de variation',
    prompt: 'Pour f(x) = x², quel est le taux de variation entre x = 1 et x = 3 ?',
    options: ['4', '8', '2', '6'],
    cols: 4,
    correct: 0,
    explain: 'La montée vaut f(3) − f(1) = 9 − 1 = 8 et l’avancée vaut 3 − 1 = 2. Le taux est 8 ÷ 2 = 4. Répondre 8, c’est donner la montée sans diviser par l’avancée.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-nombre-derive-1ere_P1'] },
  },
  {
    id: 'dv-e2',
    requires: ['taux-variation-secante', 'rapprochement-stabilisation'],
    skill: 'taux',
    title: 'Montée et avancée',
    prompt: 'Entre A(a ; f(a)) et B(a + h ; f(a + h)), le taux de variation s’obtient en divisant…',
    options: [
      'la montée f(a + h) − f(a) par l’avancée h',
      'l’avancée h par la montée f(a + h) − f(a)',
      'f(a + h) par f(a)',
      'la montée f(a + h) − f(a) par f(a)',
    ],
    cols: 1,
    correct: 0,
    explain: 'C’est le coefficient directeur de la sécante (AB) : ce dont on monte, divisé par ce dont on avance.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-nombre-derive-1ere_P1', 'premiere_specialite_derivation-nombre-derive-1ere_P2'] },
  },
  {
    id: 'dv-e3',
    requires: ['rapprochement-stabilisation', 'nombre-derive', 'methode-calculer-nombre-derive'],
    skill: 'limite',
    title: 'Vers quel nombre ?',
    prompt: 'Pour f(x) = x², le taux entre a et a + h se simplifie en 2a + h. Que vaut alors f′(2) ?',
    options: ['4', '4,1', '2', '0'],
    cols: 4,
    correct: 0,
    explain: 'On fait tendre h vers 0 dans 2a + h avec a = 2 : il reste 4. Répondre 4,1, c’est avoir gardé h = 0,1 au lieu de le faire tendre vers 0.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-nombre-derive-1ere_P2'] },
  },
  {
    id: 'dv-e4',
    requires: ['derive-coefficient-directeur', 'mem-derive-est-la-pente', 'nombre-derive'],
    skill: 'tangente',
    title: 'La pente de la tangente',
    prompt: 'Pour f(x) = x², on a f′(a) = 2a. Quel est le coefficient directeur de la tangente à la courbe au point d’abscisse 5 ?',
    options: ['10', '25', '5', '2'],
    cols: 4,
    correct: 0,
    explain: 'f′(5) = 2 × 5 = 10. Répondre 25, c’est donner f(5), l’ordonnée du point — pas la pente.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-nombre-derive-1ere_P3'] },
  },
  {
    id: 'dv-e5',
    requires: ['derive-coefficient-directeur', 'mem-derive-est-la-pente'],
    skill: 'tangente',
    title: 'Le signe de la pente',
    prompt: 'En un point où la courbe se trouve SOUS l’axe des abscisses, la tangente…',
    options: [
      'peut monter comme descendre : la position de la courbe ne décide pas du signe de f′(a)',
      'descend forcément',
      'monte forcément',
      'est forcément horizontale',
    ],
    cols: 1,
    correct: 0,
    explain: 'Sur g(x) = x³ − 3x : en x = 0,5 la courbe est sous l’axe et la tangente descend (g′ = −2,25) ; en x = 1,5 elle est encore sous l’axe et la tangente monte (g′ = 3,75).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-nombre-derive-1ere_P3'] },
  },
  {
    id: 'dv-e6',
    requires: ['tangente-position-limite', 'tangente-peut-recouper'],
    skill: 'tangente',
    title: 'Toucher, recouper',
    prompt: 'La tangente à la courbe de g(x) = x³ − 3x au point d’abscisse 1 a pour équation y = −2. Que fait-elle en x = −2 ?',
    options: [
      'Elle recoupe la courbe : g(−2) = −2 aussi',
      'Rien : une tangente ne touche la courbe qu’en un seul point',
      'Elle passe au-dessus de la courbe',
      'Elle n’existe plus en dehors du point de contact',
    ],
    cols: 1,
    correct: 0,
    explain: 'g(−2) = (−8) − (−6) = −2 : la droite y = −2 repasse par la courbe en x = −2. « Tangente » décrit le comportement AU point de contact, pas sur tout le repère.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-nombre-derive-1ere_P3'] },
  },
  {
    id: 'dv-e7',
    requires: ['rapprochement-stabilisation', 'taux-variation-secante'],
    skill: 'limite',
    title: 'Pourquoi pas h = 0 ?',
    prompt: 'Pourquoi ne pose-t-on pas directement h = 0 dans le taux de variation ?',
    options: [
      'Parce que la montée et l’avancée seraient nulles : la division s’écrirait 0 ÷ 0, qui n’a pas de valeur',
      'Parce que le taux vaudrait alors 0',
      'Parce que la fonction ne serait pas définie',
      'Parce que h doit rester entier',
    ],
    cols: 1,
    correct: 0,
    explain: 'Avec h = 0, B vient sur A : il n’y a plus de sécante, et 0 ÷ 0 n’a pas de sens. C’est pourquoi l’on regarde vers quoi les taux se dirigent, sans jamais y arriver.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-nombre-derive-1ere_P2'] },
  },
  {
    id: 'dv-e8',
    requires: ['formule-equation-tangente', 'methode-ecrire-tangente'],
    skill: 'equation',
    title: 'Écrire la tangente',
    prompt: 'Pour f(x) = x² (donc f′(a) = 2a), quelle est l’équation de la tangente au point d’abscisse 3 ?',
    options: ['y = 6x − 9', 'y = 6x + 9', 'y = 6x − 3', 'y = 9x − 6'],
    cols: 2,
    correct: 0,
    explain: 'f(3) = 9 et f′(3) = 6, donc y = 6(x − 3) + 9 = 6x − 9. Vérification : en x = 3, 18 − 9 = 9 = f(3). L’écriture y = 6x + 9 donnerait 27 en x = 3 : elle rate le point de contact.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-nombre-derive-1ere_P4'] },
  },
  {
    id: 'dv-e9',
    requires: ['formule-equation-tangente', 'methode-ecrire-tangente', 'nombre-derive'],
    skill: 'equation',
    title: 'La vérification',
    prompt: 'On propose y = 4x + 4 comme tangente à f(x) = x² au point d’abscisse 2. Comment savoir tout de suite que c’est faux ?',
    options: [
      'En remplaçant x par 2 : la droite donne 12, alors que f(2) = 4 — elle ne passe pas par le point de contact',
      'Parce que la pente 4 est fausse',
      'Parce qu’une tangente ne peut jamais couper l’axe des ordonnées au-dessus de zéro',
      'On ne peut pas le savoir sans tracer la courbe',
    ],
    cols: 1,
    correct: 0,
    explain: 'La pente 4 est correcte (f′(2) = 4), mais le décalage manque : la bonne équation est y = 4(x − 2) + 4 = 4x − 4, qui rend bien 4 en x = 2.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-nombre-derive-1ere_P4', 'premiere_specialite_derivation-nombre-derive-1ere_P3'] },
  },
  {
    id: 'dv-e10',
    requires: ['formule-equation-tangente', 'methode-ecrire-tangente', 'derive-coefficient-directeur'],
    skill: 'equation',
    title: 'Une tangente en un point négatif',
    prompt: 'Toujours pour f(x) = x², quelle est l’équation de la tangente au point d’abscisse −1 ?',
    options: ['y = −2x − 1', 'y = −2x + 1', 'y = 2x + 1', 'y = −2x + 3'],
    cols: 2,
    correct: 0,
    explain: 'f(−1) = 1 et f′(−1) = −2, donc y = −2(x + 1) + 1 = −2x − 2 + 1 = −2x − 1. Vérification : en x = −1, 2 − 1 = 1 = f(−1).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-nombre-derive-1ere_P4'] },
  },
];

// `module` pointe le module qui ENSEIGNE la compétence, jamais l'évaluation
// elle-même : le boss mesure, il n'enseigne pas.
const SKILLS = {
  taux: { label: 'Taux de variation', module: 1 },
  limite: { label: 'Le nombre dérivé', module: 2 },
  tangente: { label: 'Lire et tracer la tangente', module: 3 },
  equation: { label: 'Équation de la tangente', module: 5 },
};

const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Montée sur avancée', test: (m) => !m.taux },
  { id: 'b2', emoji: '🏅', label: 'La limite apprivoisée', test: (m) => !m.limite },
  { id: 'b3', emoji: '🏅', label: 'Lecteur de tangentes', test: (m) => !m.tangente },
  { id: 'b4', emoji: '🏅', label: 'Écrivain d’équations', test: (m) => !m.equation },
  { id: 'b-parfait', emoji: '💎', label: 'Maître de la tangente', test: (m) => Object.keys(m).length === 0 },
];

export default function Module06MissionFinaleLaTangente() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : la tangente"
      moduleSubtitle="Dix épreuves : un taux, une limite, une pente, une équation"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître de la tangente',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation. Réflexe : la pente d’abord, le point de contact
            ensuite — et toujours vérifier en remettant x = a.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '📐', label: 'taux', value: 'montée ÷ avancée' },
        { id: 'r2', emoji: '→', label: 'f′(a)', value: 'la limite des taux' },
        { id: 'r3', emoji: '📈', label: 'tangente', value: 'pente = f′(a)' },
        { id: 'r4', emoji: '✍️', label: 'équation', value: 'f′(a)(x − a) + f(a)' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître de la tangente !',
        title: 'Mission accomplie',
        message: 'Tu sais calculer un taux, comprendre vers quoi il se dirige, lire la pente d’une tangente et écrire son équation.',
        verbs: ['Calculer', 'Comprendre', 'Lire', 'Écrire'],
        masterBadgeLabel: 'Maître de la tangente',
      }}
    />
  );
}
