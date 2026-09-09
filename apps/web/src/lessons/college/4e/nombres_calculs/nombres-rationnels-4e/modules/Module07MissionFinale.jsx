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
 * modules, et chaque distracteur encode une erreur RÉELLEMENT rencontrée :
 *   — l'égalité jugée sur l'ÉCART entre haut et bas (M1) ;
 *   — additionner les dénominateurs (M3) ;
 *   — additionner les numérateurs sans re-graduer (M3) ;
 *   — chercher un dénominateur commun pour multiplier (M4) ;
 *   — confondre inverse et opposé (M5) ;
 *   — inverser le premier nombre au lieu du second (M5) ;
 *   — croire que multiplier fait toujours grandir (M4).
 *
 * La bonne réponse est déclarée par `correct` et sa POSITION VARIE : un test
 * dont la solution est toujours la première n'évalue rien.
 *
 * `badges[].test` est une FONCTION `(misses) => bool` : un objet `{skill}` y
 * jette « b.test is not a function » et le module ne monte pas du tout.
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 8 LPs sont tous couverts.
 */
const SKILLS = {
  egalite: { label: 'Tester une égalité', emoji: '⚖️' },
  sens: { label: 'Le nombre rationnel', emoji: '🍰' },
  somme: { label: 'Additionner', emoji: '➕' },
  produit: { label: 'Multiplier', emoji: '✖️' },
  division: { label: 'Inverser et diviser', emoji: '➗' },
  probleme: { label: 'Résoudre', emoji: '🧩' },
};

const BADGES = [
  { id: 'b-eg', emoji: '⚖️', label: 'Juge des égalités', test: (m) => !m.egalite },
  { id: 'b-som', emoji: '➕', label: 'Maître du dénominateur', test: (m) => !m.somme },
  { id: 'b-pro', emoji: '✖️', label: 'Multiplicateur', test: (m) => !m.produit },
  { id: 'b-div', emoji: '➗', label: 'Diviseur rationnel', test: (m) => !m.division },
  { id: 'b-parfait', emoji: '💎', label: 'Maître des rationnels', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'nra4-e1',
    skill: 'egalite',
    title: 'Égales ou non ?',
    prompt: 'Les fractions 4/6 et 6/9 sont-elles égales ?',
    options: [
      'Non : les numérateurs sont différents',
      'Oui : 4 × 9 = 36 et 6 × 6 = 36',
      'Non : 6 − 4 = 2 mais 9 − 6 = 3',
      'On ne peut le savoir qu’en les simplifiant toutes les deux',
    ],
    correct: 1,
    cols: 1,
    requires: ['produits-en-croix'],
    explain: 'Les produits en croix valent tous deux 36 : les fractions sont égales (elles valent 2/3). L’écart entre le haut et le bas ne décide de rien, et la simplification n’est pas nécessaire.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_nombres-rationnels-4e_P2'] },
  },
  {
    id: 'nra4-e2',
    skill: 'egalite',
    title: 'Le terme manquant',
    prompt: 'Pour que 5/8 = 15/n soit vraie, que doit valoir n ?',
    options: ['18', '23', '24', '40'],
    correct: 2,
    cols: 4,
    requires: ['produits-en-croix'],
    explain: 'Les produits en croix doivent être égaux : 5 × n = 8 × 15 = 120, donc n = 24. (18 vient d’un ajout de 10 en haut et de 10 en bas — mais on multiplie, on n’ajoute pas.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_nombres-rationnels-4e_P2'] },
  },
  {
    id: 'nra4-e3',
    skill: 'sens',
    title: 'Un nombre rationnel',
    prompt: 'Laquelle de ces affirmations est vraie ?',
    options: [
      'Un entier n’est pas un nombre rationnel',
      'Un nombre rationnel est toujours positif',
      'Un nombre rationnel a une seule écriture possible',
      'Tout entier est un nombre rationnel, car il s’écrit sur 1',
    ],
    correct: 3,
    cols: 1,
    requires: ['nombre-rationnel'],
    explain: 'Un rationnel est un quotient de deux entiers RELATIFS : 7 = 7/1 en est un, −2/5 aussi. Et chacun possède une infinité d’écritures, dont une seule irréductible.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_nombres-rationnels-4e_P1'] },
  },
  {
    id: 'nra4-e4',
    skill: 'sens',
    title: 'Le signe',
    prompt: 'Parmi ces écritures, laquelle ne désigne PAS le même nombre que les autres ?',
    options: [
      '(−5) ÷ (−6)',
      '−5/6',
      '5 ÷ (−6)',
      '(−5) ÷ 6',
    ],
    correct: 0,
    cols: 2,
    requires: ['signe-de-la-fraction'],
    explain: 'Les trois dernières valent toutes −5/6 (un seul signe −). La première a DEUX signes négatifs : son quotient est positif, elle vaut +5/6.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_nombres-rationnels-4e_P1'] },
  },
  {
    id: 'nra4-e5',
    skill: 'somme',
    title: 'Une somme',
    prompt: 'Combien fait 2/3 + 1/4 ?',
    options: ['3/7', '11/12', '3/12', '2/12'],
    correct: 1,
    cols: 4,
    requires: ['denominateur-commun'],
    explain: 'Sur douzièmes : 2/3 = 8/12 et 1/4 = 3/12, donc 11/12. (3/7 vient d’une addition des dénominateurs — or le dénominateur dit la TAILLE des parts, il ne se compte pas.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_nombres-rationnels-4e_P3'] },
  },
  {
    id: 'nra4-e6',
    skill: 'somme',
    title: 'Une différence',
    prompt: 'Combien fait 5/6 − 1/2 ?',
    options: ['4/4', '1/3', '4/6', '2/3'],
    correct: 1,
    cols: 4,
    requires: ['denominateur-commun'],
    explain: 'Sur sixièmes : 1/2 = 3/6, donc 5/6 − 3/6 = 2/6 = 1/3. (4/4 vient d’une soustraction des deux termes, 5−1 et 6−2 : c’est exactement ce que la barre graduée interdit.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_nombres-rationnels-4e_P4'] },
  },
  {
    id: 'nra4-e7',
    skill: 'produit',
    title: 'Un produit',
    prompt: 'Combien fait 3/8 × 4/9 ?',
    options: ['12/72', '1/6', '7/17', '27/32'],
    correct: 1,
    cols: 4,
    requires: ['produit-fractions'],
    explain: '3 × 4 = 12 en haut, 8 × 9 = 72 en bas : 12/72 = 1/6. 12/72 désigne bien le même nombre, mais on demande l’écriture la plus simple. Aucun dénominateur commun n’était nécessaire.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_nombres-rationnels-4e_P5'] },
  },
  {
    id: 'nra4-e8',
    skill: 'division',
    title: 'L’inverse',
    prompt: 'Quel est l’inverse de −3/7 ?',
    options: ['3/7', '−7/3', '7/3', '−3/7 n’a pas d’inverse'],
    correct: 1,
    cols: 4,
    requires: ['inverse-nombre'],
    explain: 'On échange les deux termes en gardant le signe : −7/3. Vérification : (−3/7) × (−7/3) = 21/21 = 1. (3/7 serait l’opposé — leur SOMME ferait 0, pas leur produit 1.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_nombres-rationnels-4e_P6'] },
  },
  {
    id: 'nra4-e9',
    skill: 'division',
    title: 'Une division',
    prompt: 'Combien fait 5/6 ÷ 2/3 ?',
    options: ['10/18', '5/4', '4/5', '5/9'],
    correct: 1,
    cols: 4,
    requires: ['diviser-par-inverse', 'produit-fractions'],
    explain: 'On inverse le SECOND et on multiplie : 5/6 × 3/2 = 15/12 = 5/4. (10/18 vient d’une multiplication sans inversion ; 4/5 vient d’avoir inversé le premier nombre.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_nombres-rationnels-4e_P7'] },
  },
  {
    id: 'nra4-e10',
    skill: 'probleme',
    title: 'Le ruban',
    prompt: 'Un ruban de 6 m est coupé en morceaux de 3/4 de m. Combien de morceaux obtient-on ?',
    options: [
      '4 morceaux et demi : on prend les 3/4 de 6',
      '8 morceaux : on cherche combien de fois 3/4 tient dans 6',
      '2 morceaux : 6 divisé par 3, puis par 4',
      '24 morceaux : on multiplie 6 par 4',
    ],
    correct: 1,
    cols: 1,
    requires: ['choisir-l-operation', 'diviser-par-inverse'],
    explain: '« Combien de fois 3/4 tient-il dans 6 » est une division : 6 ÷ 3/4 = 6 × 4/3 = 8. Prendre les 3/4 de 6 (4,5) répondrait à une tout autre question — et diviser par un nombre inférieur à 1 fait bien AUGMENTER le résultat.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_nombres-rationnels-4e_P8'] },
  },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : la croix"
      moduleSubtitle="Dix épreuves pour prouver que tu maîtrises les nombres rationnels"
      estimatedTime="8 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître des rationnels',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Pour chacune, demande-toi d’abord{' '}
            <strong>quelle opération</strong> la situation demande — le calcul vient après.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '⚖️', label: 'Égalité', value: 'produits en croix' },
        { id: 'r2', emoji: '➕', label: 'Somme', value: 'dénominateur commun d’abord' },
        { id: 'r3', emoji: '✖️', label: 'Produit', value: 'haut × haut, bas × bas' },
        { id: 'r4', emoji: '➗', label: 'Division', value: 'inverser le SECOND' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître des rationnels !',
        title: 'Mission accomplie',
        message: 'Tu sais tester une égalité, additionner, multiplier et diviser des nombres rationnels.',
        verbs: ['Tester', 'Additionner', 'Multiplier', 'Diviser'],
        masterBadgeLabel: 'Maître des rationnels',
      }}
    />
  );
}
