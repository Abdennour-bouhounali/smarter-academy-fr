import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
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
 *   — « la racine, c'est la moitié » (M1, M2) ;
 *   — redonner l'aire au lieu du côté (M1) ;
 *   — croire qu'un nombre rond est un carré parfait (M3) ;
 *   — encadrer par des entiers non consécutifs (M4) ;
 *   — oublier la solution négative de x² = a (M5) ;
 *   — croire que √a désigne deux nombres (M5).
 *
 * La bonne réponse est déclarée par `correct` et sa POSITION VARIE.
 *
 * `badges[].test` est une FONCTION `(misses) => bool` : un objet `{skill}` y
 * jette « b.test is not a function » et le module ne monte pas du tout.
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 6 LPs sont tous couverts.
 */
const SKILLS = {
  sens: { label: 'Le sens de √', emoji: '√' },
  parfaits: { label: 'Carrés parfaits', emoji: '⬛' },
  encadrer: { label: 'Encadrer', emoji: '📏' },
  equation: { label: 'x² = a', emoji: '⚖️' },
  probleme: { label: 'Problèmes', emoji: '🧩' },
};

const BADGES = [
  { id: 'b-sens', emoji: '√', label: 'Sens de la racine', test: (m) => !m.sens },
  { id: 'b-par', emoji: '⬛', label: 'Table sue par cœur', test: (m) => !m.parfaits },
  { id: 'b-enc', emoji: '📏', label: 'Encadreur', test: (m) => !m.encadrer },
  { id: 'b-equ', emoji: '⚖️', label: 'Les deux solutions', test: (m) => !m.equation },
  { id: 'b-parfait', emoji: '💎', label: 'Maître du carré', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'rc4-e1',
    skill: 'sens',
    title: 'Une racine exacte',
    prompt: <span>Combien vaut <MathText>{'$\\sqrt{121}$'}</MathText> ?</span>,
    options: ['60,5', '11', '12', '10'],
    correct: 1,
    cols: 4,
    requires: ['racine-carree', 'carres-parfaits-4e'],
    explain: '11 × 11 = 121, donc √121 = 11. (60,5 est la moitié de 121 — mais 60,5 × 60,5 dépasse 3600.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_racines-carrees-4e_P3'] },
  },
  {
    id: 'rc4-e2',
    skill: 'sens',
    title: 'Le sens géométrique',
    prompt: <span>Que représente <MathText>{'$\\sqrt{a}$'}</MathText> pour un carré d’aire a ?</span>,
    options: [
      'Son périmètre',
      'La moitié de son aire',
      'La longueur de son côté',
      'La longueur de sa diagonale',
    ],
    correct: 2,
    cols: 2,
    requires: ['racine-carree'],
    explain: '√a est le côté du carré d’aire a — c’est la définition même : le nombre qui, multiplié par lui-même, redonne l’aire.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_racines-carrees-4e_P1'] },
  },
  {
    id: 'rc4-e3',
    skill: 'sens',
    title: 'Ce qui n’existe pas',
    prompt: <span>Laquelle de ces écritures ne désigne aucun nombre ?</span>,
    options: [
      <MathText key="a">{'$\\sqrt{0}$'}</MathText>,
      <MathText key="b">{'$\\sqrt{1}$'}</MathText>,
      <MathText key="c">{'$\\sqrt{-9}$'}</MathText>,
      <MathText key="d">{'$\\sqrt{144}$'}</MathText>,
    ],
    correct: 2,
    cols: 4,
    optionLabel: (i) => ['√0', '√1', '√(−9)', '√144'][i],
    requires: ['racine-carree'],
    explain: 'Un nombre négatif n’a pas de racine carrée : aucun nombre multiplié par lui-même ne donne −9, puisque deux facteurs de même signe donnent toujours un produit positif. (√0 = 0 et √1 = 1 existent bien.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_racines-carrees-4e_P1'] },
  },
  {
    id: 'rc4-e4',
    skill: 'parfaits',
    title: 'Carré parfait ?',
    prompt: 'Lequel de ces nombres est un carré parfait ?',
    options: ['90', '110', '96', '100'],
    correct: 3,
    cols: 4,
    requires: ['carres-parfaits-4e'],
    explain: '100 = 10². Les trois autres tombent entre deux carrés parfaits : 90 et 96 entre 81 et 100, 110 entre 100 et 121. Un nombre rond n’est pas forcément un carré parfait.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_racines-carrees-4e_P2'] },
  },
  {
    id: 'rc4-e5',
    skill: 'parfaits',
    title: 'Le carré manquant',
    prompt: 'Quel est le carré parfait juste APRÈS 49 ?',
    options: ['50', '56', '64', '81'],
    correct: 2,
    cols: 4,
    requires: ['carres-parfaits-4e'],
    explain: '49 = 7², et le suivant est 8² = 64. Entre les deux, aucun nombre ne forme un carré plein — c’est ce que la manipulation des carreaux montrait.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_racines-carrees-4e_P2'] },
  },
  {
    id: 'rc4-e6',
    skill: 'encadrer',
    title: 'Encadrer',
    prompt: <span>Entre quels entiers consécutifs se trouve <MathText>{'$\\sqrt{75}$'}</MathText> ?</span>,
    options: [
      'entre 7 et 8',
      'entre 8 et 9',
      'entre 37 et 38',
      'entre 8 et 10',
    ],
    correct: 1,
    cols: 2,
    requires: ['encadrer-une-racine'],
    explain: '64 < 75 < 81, c’est-à-dire 8² < 75 < 9². Donc 8 < √75 < 9. (« Entre 8 et 10 » est vrai mais pas assez précis : on demande deux entiers qui se suivent.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_racines-carrees-4e_P5'] },
  },
  {
    id: 'rc4-e7',
    skill: 'encadrer',
    title: 'La méthode',
    prompt: <span>Pour encadrer <MathText>{'$\\sqrt{n}$'}</MathText> entre deux entiers, que cherche-t-on ?</span>,
    options: [
      'Les deux carrés parfaits qui entourent n',
      'La moitié et le double de n',
      'Les deux nombres qui entourent la moitié de n',
      'Une calculatrice',
    ],
    correct: 0,
    cols: 1,
    requires: ['encadrer-une-racine'],
    explain: 'On compare des CARRÉS, jamais des racines : le carré parfait juste sous n et celui juste au-dessus donnent directement les deux bornes. C’est ce qui permet d’encadrer sans jamais calculer la racine.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_racines-carrees-4e_P5'] },
  },
  {
    id: 'rc4-e8',
    skill: 'equation',
    title: 'Deux solutions',
    prompt: <span>Combien de solutions a l’équation <MathText>{'$x^2 = 49$'}</MathText> ?</span>,
    options: ['Une seule : 7', 'Deux : 7 et −7', 'Aucune', 'Une infinité'],
    correct: 1,
    cols: 2,
    requires: ['x-carre-egale-a'],
    explain: '7 × 7 = 49 et (−7) × (−7) = 49 aussi : deux nombres opposés ont toujours le même carré. Oublier la solution négative est l’erreur la plus fréquente.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_racines-carrees-4e_P6'] },
  },
  {
    id: 'rc4-e9',
    skill: 'equation',
    title: 'Ne pas confondre',
    prompt: <span>Quelle affirmation est correcte ?</span>,
    options: [
      <span key="a"><MathText>{'$\\sqrt{16}$'}</MathText> vaut 4 et −4</span>,
      <span key="b"><MathText>{'$\\sqrt{16}$'}</MathText> vaut 4, mais <MathText>{'$x^2 = 16$'}</MathText> a deux solutions</span>,
      <span key="c"><MathText>{'$x^2 = 16$'}</MathText> n’a qu’une solution</span>,
      <span key="d"><MathText>{'$\\sqrt{16}$'}</MathText> vaut 8</span>,
    ],
    correct: 1,
    cols: 1,
    optionLabel: (i) => ['√16 vaut 4 et −4', '√16 vaut 4, mais x² = 16 a deux solutions', 'x² = 16 n’a qu’une solution', '√16 vaut 8'][i],
    requires: ['x-carre-egale-a', 'racine-carree'],
    explain: 'Le symbole √ désigne TOUJOURS un seul nombre, le positif : √16 = 4. C’est l’équation x² = 16 qui admet deux solutions, 4 et −4. Ce sont deux questions différentes.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_racines-carrees-4e_P6'] },
  },
  {
    id: 'rc4-e10',
    skill: 'probleme',
    title: 'Le jardin',
    prompt: 'Un jardin carré a une aire de 196 m². Quelle longueur de grillage faut-il pour en faire le tour ?',
    options: ['14 m', '56 m', '49 m', '98 m'],
    correct: 1,
    cols: 4,
    requires: ['racine-dans-un-probleme', 'carres-parfaits-4e'],
    explain: 'Le côté vaut √196 = 14 m. Le tour d’un carré est son périmètre : 4 × 14 = 56 m. (14 m est le côté, pas le tour — la question demandait bien le grillage.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_racines-carrees-4e_P4'] },
  },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le carré"
      moduleSubtitle="Dix épreuves pour prouver que tu maîtrises la racine carrée"
      estimatedTime="8 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître du carré',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Le réflexe qui sauve : remets ta réponse{' '}
            <strong>au carré</strong> et vérifie que tu retombes sur le nombre de départ.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '√', label: '√a', value: 'le côté d’un carré d’aire a' },
        { id: 'r2', emoji: '⬛', label: 'Carrés parfaits', value: '1, 4, 9, 16, 25, 36, 49, 64…' },
        { id: 'r3', emoji: '📏', label: 'Encadrer', value: 'comparer des carrés' },
        { id: 'r4', emoji: '⚖️', label: 'x² = a', value: 'deux solutions si a > 0' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître du carré !',
        title: 'Mission accomplie',
        message: 'Tu sais ce qu’est une racine carrée, tu connais les carrés parfaits, tu sais encadrer et résoudre x² = a.',
        verbs: ['Comprendre', 'Reconnaître', 'Encadrer', 'Résoudre'],
        masterBadgeLabel: 'Maître du carré',
      }}
    />
  );
}
