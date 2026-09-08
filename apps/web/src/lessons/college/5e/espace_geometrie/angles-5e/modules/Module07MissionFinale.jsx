import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Le test CONSOLIDE :
 * il n'introduit ni concept, ni vocabulaire, ni notation neufs
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *
 * TRANSFERT, pas répétition (§45) : aucune épreuve ne reprend les valeurs des
 * modules. Les contextes changent (parquet, grille, voile, escalier, tissage)
 * et chaque distracteur encode une erreur RÉELLEMENT rencontrée dans la leçon :
 *   — juger le parallélisme à l'œil (M1) ;
 *   — croire que la POSITION implique l'égalité, sans parallélisme (M2) ;
 *   — appliquer « donc égaux » à deux internes du MÊME côté (M6) ;
 *   — croire que les opposés par le sommet prouvent le parallélisme (M4) ;
 *   — traiter un écart de 2° comme négligeable (M5) ;
 *   — s'arrêter à la première relation au lieu d'enchaîner (M6).
 *
 * PÉRIMÈTRE 5e — vérifié épreuve par épreuve : aucune somme des angles d'un
 * triangle (c'est la leçon « Triangles »), aucun Thalès, aucune trigonométrie.
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 5 LPs sont tous couverts.
 *
 * `badges[].test` est une FONCTION (m) => bool — un objet y provoquerait
 * « b.test is not a function » au montage.
 */
const SKILLS = {
  alternes: { label: 'Alternes-internes', emoji: '📐', module: 2 },
  correspondants: { label: 'Correspondants', emoji: '🔁', module: 2 },
  deduire: { label: 'Déduire des angles', emoji: '➡️', module: 3 },
  calculer: { label: 'Calculer sans mesurer', emoji: '🧮', module: 4 },
  prouver: { label: 'Prouver le parallélisme', emoji: '✅', module: 5 },
  enchainer: { label: 'Enchaîner les relations', emoji: '🔗', module: 6 },
};

const BADGES = [
  { id: 'b-alternes', emoji: '📐', label: 'Maître du Z', test: (m) => !m.alternes },
  { id: 'b-correspondants', emoji: '🔁', label: 'Maître du F', test: (m) => !m.correspondants },
  { id: 'b-deduire', emoji: '➡️', label: 'Déducteur', test: (m) => !m.deduire },
  { id: 'b-calculer', emoji: '🧮', label: 'Calculateur sans rapporteur', test: (m) => !m.calculer },
  { id: 'b-prouver', emoji: '✅', label: 'Contrôleur qualité', test: (m) => !m.prouver },
  { id: 'b-enchainer', emoji: '🔗', label: 'Démêleur de figures', test: (m) => !m.enchainer },
  { id: 'b-parfait', emoji: '💎', label: 'Maître du parallélisme', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'ang5-e1',
    skill: 'alternes',
    title: 'Le repérage',
    prompt: 'Deux angles sont situés entre les deux droites, de part et d’autre de la sécante, et à des croisements différents. Comment les appelle-t-on ?',
    options: ['Alternes-internes', 'Correspondants', 'Opposés par le sommet', 'Adjacents'],
    cols: 2,
    requires: ['angles-alternes-internes'],
    explain: '« Internes » = entre les deux droites ; « alternes » = de part et d’autre de la sécante. C’est la figure en Z.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_angles-5e_P1'] },
  },
  {
    id: 'ang5-e2',
    skill: 'alternes',
    title: 'Position n’est pas mesure',
    prompt: 'Deux angles alternes-internes sont-ils toujours égaux ?',
    options: [
      'Non : seulement si les deux droites sont parallèles',
      'Oui, toujours : c’est leur définition',
      'Non, jamais',
    ],
    cols: 2,
    requires: ['angles-alternes-internes', 'paralleles-angles-egaux'],
    explain: '« Alternes-internes » décrit seulement une POSITION. L’égalité est une conséquence du parallélisme — sans lui, les deux mesures diffèrent.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_angles-5e_P1'] },
  },
  {
    id: 'ang5-e3',
    skill: 'correspondants',
    title: 'La voile',
    prompt: 'Deux angles occupent exactement la même position aux deux croisements : même côté de la sécante, même côté de leur droite. Comment les appelle-t-on ?',
    options: ['Correspondants', 'Alternes-internes', 'Alternes-externes', 'Complémentaires'],
    cols: 2,
    requires: ['angles-correspondants'],
    explain: 'Même case aux deux croisements : ce sont les angles correspondants, la figure en F. On les obtient en faisant glisser un croisement sur l’autre.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_angles-5e_P2'] },
  },
  {
    id: 'ang5-e4',
    skill: 'deduire',
    title: 'La grille du jardin',
    prompt: 'Deux barreaux parallèles sont coupés par une traverse. Un angle alterne-interne mesure 58°. Combien mesure l’autre angle alterne-interne ?',
    options: ['58°', '122°', '32°', 'On ne peut pas savoir'],
    cols: 4,
    requires: ['paralleles-angles-egaux', 'angles-alternes-internes'],
    explain: 'Les droites sont parallèles : les alternes-internes sont égaux, donc 58°. (122° serait un angle adjacent, pas l’alterne-interne.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_angles-5e_P3'] },
  },
  {
    id: 'ang5-e5',
    skill: 'calculer',
    title: 'Le même côté',
    prompt: 'Deux droites parallèles sont coupées par une sécante. Deux angles sont internes mais du MÊME côté de la sécante. L’un mesure 68°. Combien mesure l’autre ?',
    options: ['112°', '68°', '22°', '136°'],
    cols: 4,
    requires: ['calculer-les-angles', 'paralleles-angles-egaux'],
    explain: 'Du même côté, ce ne sont pas des alternes-internes : ils sont supplémentaires. 180 − 68 = 112°. Le mot « internes » ne suffit jamais — il faut vérifier le côté.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_angles-5e_P3'] },
  },
  {
    id: 'ang5-e6',
    skill: 'calculer',
    title: 'Le parquet',
    prompt: 'Deux lames parallèles sont coupées par une baguette. Un des huit angles mesure 124°. Combien de valeurs différentes prennent les huit angles ?',
    options: ['2 : 124° et 56°', '8 : toutes différentes', '4 : deux par croisement', '1 : toutes égales'],
    cols: 2,
    requires: ['calculer-les-angles'],
    explain: 'Avec deux parallèles, les huit angles ne prennent que deux valeurs : celle de départ et son supplémentaire (180 − 124 = 56°), qui alternent autour de chaque croisement.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_angles-5e_P5'] },
  },
  {
    id: 'ang5-e7',
    skill: 'prouver',
    title: 'Le contrôle qualité',
    prompt: 'Sur un chantier, on mesure deux angles alternes-internes : 64° et 64°. Que peut-on affirmer des deux droites ?',
    options: [
      'Elles sont parallèles',
      'Elles se croiseront très loin',
      'Elles sont perpendiculaires',
      'On ne peut rien affirmer',
    ],
    cols: 2,
    requires: ['reciproque-parallelisme'],
    explain: 'C’est la réciproque : deux angles alternes-internes égaux prouvent le parallélisme, sans avoir besoin de voir la suite des droites.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_angles-5e_P4'] },
  },
  {
    id: 'ang5-e8',
    skill: 'prouver',
    title: 'Deux degrés',
    prompt: 'Deux angles alternes-internes mesurent 70° et 72°. Que peut-on affirmer ?',
    options: [
      'Les droites ne sont pas parallèles : elles se croiseront',
      'Les droites sont presque parallèles, donc parallèles',
      'Les droites sont parallèles, 2° est une erreur de mesure',
    ],
    cols: 2,
    requires: ['reciproque-parallelisme'],
    explain: 'Il n’existe pas de « presque parallèle » : dès que les angles diffèrent, si peu que ce soit, les droites finissent par se rencontrer.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_angles-5e_P4'] },
  },
  {
    id: 'ang5-e9',
    skill: 'enchainer',
    title: 'L’escalier',
    prompt: 'Deux droites parallèles sont coupées par une sécante. Un angle mesure 105°. On cherche l’angle qui est l’OPPOSÉ PAR LE SOMMET de son alterne-interne. Combien mesure-t-il ?',
    options: ['105°', '75°', '52,5°', '210°'],
    cols: 4,
    requires: ['enchainer-relations', 'paralleles-angles-egaux'],
    explain: 'Deux étapes : l’alterne-interne vaut 105° (droites parallèles), puis son opposé par le sommet vaut aussi 105°. Deux égalités enchaînées conservent la mesure.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_angles-5e_P5'] },
  },
  {
    id: 'ang5-e10',
    skill: 'enchainer',
    title: 'Le tissage',
    prompt: 'Dans une figure chargée où plusieurs sécantes se croisent, quel est le premier réflexe pour s’y retrouver ?',
    options: [
      'Isoler deux droites et une seule sécante à la fois',
      'Mesurer tous les angles au rapporteur',
      'Chercher les angles droits en priorité',
    ],
    cols: 2,
    requires: ['enchainer-relations'],
    explain: 'Les propriétés ne parlent que d’une configuration à trois droites. En isoler une seule à la fois transforme une figure illisible en une suite de cas connus.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_angles-5e_P5'] },
  },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : les angles"
      moduleSubtitle="Dix épreuves pour prouver qu’une configuration ne te fait plus peur"
      estimatedTime="6 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître du parallélisme',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Pour chacune, pose-toi les deux mêmes
            questions : <strong>quel couple d’angles ?</strong> et{' '}
            <strong>qu’est-ce que je sais déjà ?</strong>
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '📐', label: 'Le Z', value: 'alternes-internes' },
        { id: 'r2', emoji: '🔁', label: 'Le F', value: 'correspondants' },
        { id: 'r3', emoji: '➡️', label: 'Parallèles', value: 'donc angles égaux' },
        { id: 'r4', emoji: '✅', label: 'Angles égaux', value: 'donc parallèles' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître du parallélisme !',
        title: 'Mission accomplie',
        message: 'Tu sais repérer, nommer, déduire et prouver dans une configuration d’angles.',
        verbs: ['Repérer', 'Nommer', 'Déduire', 'Prouver'],
        masterBadgeLabel: 'Maître du parallélisme',
      }}
    />
  );
}
