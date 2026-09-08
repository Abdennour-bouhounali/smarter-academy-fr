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
 * modules. Les contextes changent (bactéries, dé, piscine, photo, stade) et
 * chaque distracteur encode une erreur RÉELLEMENT rencontrée dans la leçon :
 *   — lire aⁿ comme a × n (M2) ;
 *   — intervertir la base et l'exposant (M2) ;
 *   — confondre le carré et le périmètre (M3) ;
 *   — croire qu'un nombre rond est un carré parfait (M4) ;
 *   — compter les chiffres au lieu des zéros (M5) ;
 *   — appliquer la puissance à tout ce qui précède (M6).
 *
 * PÉRIMÈTRE 5e — vérifié épreuve par épreuve : aucun exposant négatif, aucune
 * écriture scientifique, aucune règle algébrique combinant deux puissances.
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 6 LPs sont tous couverts.
 *
 * `badges[].test` est une FONCTION (m) => bool — un objet y provoquerait
 * « b.test is not a function » au montage.
 */
const SKILLS = {
  ecrire: { label: 'Écrire une puissance', emoji: '✍️', module: 1 },
  lire: { label: 'Lire une puissance', emoji: '👁️', module: 2 },
  figures: { label: 'Carré et cube', emoji: '⬛', module: 3 },
  parfaits: { label: 'Carrés parfaits', emoji: '🔷', module: 4 },
  dix: { label: 'Puissances de 10', emoji: '💯', module: 5 },
  calculer: { label: 'Calculer', emoji: '🧮', module: 6 },
};

const BADGES = [
  { id: 'b-ecrire', emoji: '✍️', label: 'Scribe des puissances', test: (m) => !m.ecrire },
  { id: 'b-lire', emoji: '👁️', label: 'Lecteur d’exposants', test: (m) => !m.lire },
  { id: 'b-figures', emoji: '⬛', label: 'Bâtisseur de cubes', test: (m) => !m.figures },
  { id: 'b-parfaits', emoji: '🔷', label: 'Œil du carré parfait', test: (m) => !m.parfaits },
  { id: 'b-dix', emoji: '💯', label: 'Compteur de zéros', test: (m) => !m.dix },
  { id: 'b-parfait', emoji: '💎', label: 'Maître de l’échiquier', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'pui5-e1',
    skill: 'ecrire',
    title: 'Les bactéries',
    prompt: 'Une bactérie se divise en deux chaque heure. Au bout de 6 heures, on calcule 2 × 2 × 2 × 2 × 2 × 2. Comment s’écrit ce calcul en court ?',
    options: ['2⁶', '6²', '2 × 6', '6 × 6'],
    cols: 4,
    requires: ['puissance', 'exposant'],
    explain: 'Le facteur 2 est écrit six fois : on note donc 2⁶, qui vaut 64. En bas le facteur répété, en haut le nombre de fois.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_puissances-5e_P1'] },
  },
  {
    id: 'pui5-e2',
    skill: 'ecrire',
    title: 'Le retour au produit',
    prompt: 'Quel produit l’écriture 7³ remplace-t-elle ?',
    options: ['7 × 7 × 7', '3 × 3 × 3 × 3 × 3 × 3 × 3', '7 × 3', '7 + 7 + 7'],
    cols: 2,
    requires: ['puissance', 'exposant'],
    explain: '7³ signifie « le facteur 7, écrit trois fois » : 7 × 7 × 7 = 343. Le nombre du haut compte les facteurs, il n’en est pas un.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_puissances-5e_P1'] },
  },
  {
    id: 'pui5-e3',
    skill: 'lire',
    title: 'Le lancer de dé',
    prompt: 'Combien vaut 6² ?',
    options: ['36', '12', '64', '18'],
    cols: 4,
    requires: ['exposant', 'mem-exposant'],
    explain: '6² = 6 × 6 = 36. (12 correspond à 6 × 2, et 64 à 2⁶ — deux confusions classiques.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_puissances-5e_P2'] },
  },
  {
    id: 'pui5-e4',
    skill: 'lire',
    title: 'Deux écritures voisines',
    prompt: 'Laquelle de ces affirmations est vraie ?',
    options: [
      '4³ et 3⁴ ne donnent pas le même nombre',
      '4³ et 3⁴ donnent le même nombre, car ce sont les mêmes chiffres',
      '4³ vaut 12',
      '3⁴ vaut 12',
    ],
    cols: 1,
    requires: ['exposant', 'mem-exposant'],
    explain: '4³ = 4 × 4 × 4 = 64, tandis que 3⁴ = 3 × 3 × 3 × 3 = 81. Intervertir la base et l’exposant change bien le nombre.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_puissances-5e_P2'] },
  },
  {
    id: 'pui5-e5',
    skill: 'figures',
    title: 'La piscine cubique',
    prompt: 'Un réservoir cubique mesure 3 m d’arête. Combien de mètres cubes d’eau contient-il ?',
    options: ['27 m³', '9 m³', '12 m³', '6 m³'],
    cols: 4,
    requires: ['carre-cube'],
    explain: 'Le volume d’un cube d’arête 3 vaut 3 × 3 × 3 = 27 m³, soit 3³. (9 m³ serait l’aire d’une face, et 12 m le total des arêtes d’une face.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_puissances-5e_P3'] },
  },
  {
    id: 'pui5-e6',
    skill: 'figures',
    title: 'La photo carrée',
    prompt: 'Une photo carrée a une aire de 64 cm². Quelle est la longueur de son côté ?',
    options: ['8 cm', '16 cm', '32 cm', '64 cm'],
    cols: 4,
    requires: ['carre-cube', 'carres-parfaits'],
    explain: 'On cherche le nombre qui, multiplié par lui-même, donne 64 : c’est 8, car 8² = 64. (16 cm serait le quart du périmètre d’un autre carré ; 32 cm est la moitié de 64.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_puissances-5e_P3'] },
  },
  {
    id: 'pui5-e7',
    skill: 'parfaits',
    title: 'L’intrus',
    prompt: 'Lequel de ces nombres n’est PAS un carré parfait ?',
    options: ['60', '25', '49', '100'],
    cols: 4,
    requires: ['carres-parfaits'],
    explain: '25 = 5², 49 = 7² et 100 = 10². En revanche 60 tombe entre 49 et 64 : aucun entier multiplié par lui-même ne le donne.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_puissances-5e_P4'] },
  },
  {
    id: 'pui5-e8',
    skill: 'dix',
    title: 'Le stade',
    prompt: 'Un stade peut accueillir 100 000 spectateurs. Quelle puissance de 10 est-ce ?',
    options: ['10⁵', '10⁶', '10⁴', '10¹⁰'],
    cols: 4,
    requires: ['puissance-de-dix'],
    explain: '100 000 porte cinq zéros, donc cinq facteurs 10 : c’est 10⁵. (Le nombre s’écrit avec six chiffres, mais l’exposant compte les zéros, pas les chiffres.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_puissances-5e_P5'] },
  },
  {
    id: 'pui5-e9',
    skill: 'dix',
    title: 'Du kilomètre au mètre',
    prompt: 'Un kilomètre vaut 1 000 mètres. Quelle écriture est correcte ?',
    options: ['1 km = 10³ m', '1 km = 10² m', '1 km = 3¹⁰ m', '1 km = 10 × 3 m'],
    cols: 2,
    requires: ['puissance-de-dix', 'exposant'],
    explain: '1 000 porte trois zéros, donc 10³. (10² vaudrait 100, et 10 × 3 seulement 30.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_puissances-5e_P5'] },
  },
  {
    id: 'pui5-e10',
    skill: 'calculer',
    title: 'Le calcul juste',
    prompt: 'Combien vaut 4 + 2 × 3² ?',
    options: ['22', '54', '40', '10'],
    cols: 4,
    requires: ['priorite-puissance', 'exposant'],
    explain: 'Dans l’ordre : la puissance 3² = 9, puis le produit 2 × 9 = 18, puis l’addition 4 + 18 = 22. (54 viendrait de (4 + 2) × 9, et 40 de lire 3² comme 3 × 2 puis mal enchaîner.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_puissances-5e_P6'] },
  },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le grain de riz"
      moduleSubtitle="Dix épreuves pour prouver que l’exposant compte les facteurs"
      estimatedTime="6 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître de l’échiquier',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Pour chacune, reviens au même réflexe :{' '}
            <strong>quel facteur, et combien de fois ?</strong>
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '✍️', label: 'En bas', value: 'le facteur répété' },
        { id: 'r2', emoji: '👁️', label: 'En haut', value: 'combien de fois' },
        { id: 'r3', emoji: '💯', label: '10 exposant n', value: '1 suivi de n zéros' },
        { id: 'r4', emoji: '🧮', label: 'Dans un calcul', value: 'la puissance d’abord' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître de l’échiquier !',
        title: 'Mission accomplie',
        message: 'Tu sais écrire, lire, interpréter et calculer avec les puissances.',
        verbs: ['Écrire', 'Lire', 'Interpréter', 'Calculer'],
        masterBadgeLabel: 'Maître de l’échiquier',
      }}
    />
  );
}
