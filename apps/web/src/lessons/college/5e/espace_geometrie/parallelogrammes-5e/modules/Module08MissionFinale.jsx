import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 8 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Le test
 * CONSOLIDE : il n'introduit ni concept, ni vocabulaire, ni notation neufs
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *
 * TRANSFERT, pas répétition : aucune épreuve ne reprend les nombres des
 * modules. Les contextes changent (un carrelage, une charpente, un cerf-
 * volant, un panneau) et chaque distracteur encode une erreur RÉELLEMENT
 * rencontrée dans la leçon :
 *   — exiger des angles droits pour un parallélogramme (M1) ;
 *   — confondre côtés opposés et côtés consécutifs (M3) ;
 *   — croire les diagonales égales (M4) ;
 *   — conclure d'un dessin qui ressemble, ou d'une seule paire parallèle (M5) ;
 *   — refuser au carré le nom de parallélogramme (M6) ;
 *   — multiplier la base par le côté oblique (M7).
 *
 * PÉRIMÈTRE 5e — vérifié épreuve par épreuve : aucun vecteur, aucune
 * translation, aucune démonstration rédigée, aucun repère.
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 6 LPs sont tous couverts —
 * P1 (é1, é2), P2 (é3), P3 (é4, é9), P4 (é5, é6), P5 (é8), P6 (é7, é10).
 *
 * `badges[].test` est une FONCTION (m) => bool — un objet y provoquerait
 * « b.test is not a function » au montage.
 */
const SKILLS = {
  definir: { label: 'La définition', emoji: '🔷', module: 1 },
  construire: { label: 'Construire', emoji: '📐', module: 2 },
  cotes: { label: 'Les côtés', emoji: '📏', module: 3 },
  diagonales: { label: 'Les diagonales', emoji: '✖️', module: 4 },
  conclure: { label: 'Conclure', emoji: '🧠', module: 5 },
  famille: { label: 'La famille', emoji: '👪', module: 6 },
  aire: { label: 'L’aire', emoji: '🟦', module: 7 },
};

const BADGES = [
  { id: 'b-definir', emoji: '🔷', label: 'Gardien de la définition', test: (m) => !m.definir },
  { id: 'b-cotes', emoji: '📏', label: 'Œil des côtés opposés', test: (m) => !m.cotes },
  { id: 'b-diag', emoji: '✖️', label: 'Maître des diagonales', test: (m) => !m.diagonales },
  { id: 'b-conclure', emoji: '🧠', label: 'Choisisseur de propriété', test: (m) => !m.conclure },
  { id: 'b-aire', emoji: '🟦', label: 'Piège de la hauteur déjoué', test: (m) => !m.aire },
  { id: 'b-parfait', emoji: '💎', label: 'Maître du parallélogramme', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'par5-e1',
    skill: 'definir',
    title: 'Le carrelage',
    prompt: 'Un carreleur pose des dalles en forme de quadrilatère. Sur chaque dalle, les côtés opposés sont parallèles deux à deux, mais aucun angle n’est droit. Comment s’appelle cette forme ?',
    options: [
      'Un parallélogramme',
      'Ce n’est pas un parallélogramme : il manque les angles droits',
      'Un trapèze',
      'Un rectangle penché, ce qui n’a pas de nom',
    ],
    cols: 1,
    correct: 0,
    requires: ['parallelogramme'],
    explain: 'La définition ne demande que les côtés opposés parallèles deux à deux. Les angles droits n’y figurent pas : sans eux, c’est encore un parallélogramme.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_parallelogrammes-5e_P1'] },
  },
  {
    id: 'par5-e2',
    skill: 'definir',
    title: 'La charpente',
    prompt: 'Dans le quadrilatère MNPQ, on sait seulement que (MN) ∥ (QP). Peut-on affirmer que MNPQ est un parallélogramme ?',
    options: [
      'Non : il faudrait aussi (MQ) ∥ (NP)',
      'Oui : une paire de côtés parallèles suffit',
      'Oui, si les deux côtés parallèles ont la même longueur',
      'Non : il faudrait des angles droits',
    ],
    cols: 1,
    correct: 0,
    requires: ['parallelogramme', 'caracterisations'],
    explain: 'Une seule paire de côtés parallèles fait un trapèze. La définition exige les DEUX paires : il manque (MQ) ∥ (NP).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_parallelogrammes-5e_P1'] },
  },
  {
    id: 'par5-e3',
    skill: 'construire',
    title: 'Le quatrième piquet',
    prompt: 'Trois piquets R, S et T sont plantés dans un champ. On veut planter un quatrième piquet U pour que RSTU soit un parallélogramme. Quelle construction donne la place de U ?',
    options: [
      'La parallèle à (RS) passant par T, coupée par la parallèle à (ST) passant par R',
      'La parallèle à (RS) passant par S, coupée par la parallèle à (ST) passant par T',
      'Le milieu du segment [RT]',
      'N’importe quel point : il y a plusieurs solutions',
    ],
    cols: 1,
    correct: 0,
    requires: ['construire-parallelogramme', 'droites-paralleles'],
    explain: 'Chaque parallèle se mène par le sommet OPPOSÉ au côté qu’elle doit reproduire : par T pour le côté [RS], par R pour le côté [ST]. Elles se croisent en un seul point — il n’y a qu’une place possible.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_parallelogrammes-5e_P2'] },
  },
  {
    id: 'par5-e4',
    skill: 'cotes',
    title: 'Le cadre de vélo',
    prompt: 'EFGH est un parallélogramme avec EF = 12 cm et FG = 7 cm. Combien mesure EH ?',
    options: ['7 cm', '12 cm', '19 cm', 'On ne peut pas savoir'],
    cols: 4,
    correct: 0,
    requires: ['cotes-opposes-egaux', 'quadrilatere'],
    explain: '[EH] est le côté opposé à [FG] : ils ne se touchent pas. Donc EH = FG = 7 cm. (Le côté opposé à [EF] est [HG], qui mesure 12 cm.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_parallelogrammes-5e_P3'] },
  },
  {
    id: 'par5-e5',
    skill: 'diagonales',
    title: 'Le croisement',
    prompt: 'Les diagonales du parallélogramme KLMN se coupent en O, et OK = 5 cm. Combien mesure la diagonale [KM] ?',
    options: ['10 cm', '5 cm', '2,5 cm', 'On ne peut pas savoir'],
    cols: 4,
    correct: 0,
    requires: ['diagonales-milieu', 'milieu-segment'],
    explain: 'O est le milieu de [KM], donc OM = OK = 5 cm. La diagonale entière vaut les deux moitiés : KM = 10 cm.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_parallelogrammes-5e_P4'] },
  },
  {
    id: 'par5-e6',
    skill: 'diagonales',
    title: 'Ce qui est garanti',
    prompt: 'Un quadrilatère est un parallélogramme. Que peut-on affirmer à coup sûr sur ses deux diagonales ?',
    options: [
      'Elles se coupent en leur milieu',
      'Elles ont la même longueur',
      'Elles sont perpendiculaires',
      'Elles sont parallèles',
    ],
    cols: 1,
    correct: 0,
    requires: ['diagonales-milieu', 'parallelogramme'],
    explain: 'Seul le milieu commun est garanti. L’égalité des diagonales caractérise le rectangle, leur perpendicularité le losange — deux cas particuliers, pas la règle générale.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_parallelogrammes-5e_P4'] },
  },
  {
    id: 'par5-e7',
    skill: 'conclure',
    title: 'Le cerf-volant',
    prompt: 'Dans le quadrilatère ABCD, on sait que AB = AD et CB = CD. Peut-on conclure que ABCD est un parallélogramme ?',
    options: [
      'Non : ce sont des côtés consécutifs, pas opposés',
      'Oui : les côtés sont égaux deux à deux',
      'Oui : deux égalités suffisent toujours',
      'Non : il faudrait connaître les angles',
    ],
    cols: 1,
    correct: 0,
    requires: ['caracterisations', 'cotes-opposes-egaux'],
    explain: '[AB] et [AD] se touchent en A : ce sont des côtés consécutifs. La caractérisation exige les côtés OPPOSÉS égaux deux à deux. Cette figure est un cerf-volant.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_parallelogrammes-5e_P6'] },
  },
  {
    id: 'par5-e8',
    skill: 'famille',
    title: 'Le panneau carré',
    prompt: 'Un panneau de signalisation a la forme d’un carré. Laquelle de ces affirmations est vraie ?',
    options: [
      'C’est un parallélogramme, un rectangle et un losange à la fois',
      'C’est un carré, donc ce n’est pas un parallélogramme',
      'C’est un rectangle, mais pas un parallélogramme',
      'C’est un losange, mais pas un rectangle',
    ],
    cols: 1,
    correct: 0,
    requires: ['parallelogrammes-particuliers'],
    explain: 'Le carré a ses côtés opposés parallèles (donc parallélogramme), un angle droit (donc rectangle) et deux côtés voisins égaux (donc losange). Les trois noms lui vont en même temps.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_parallelogrammes-5e_P5'] },
  },
  {
    id: 'par5-e9',
    skill: 'aire',
    title: 'La parcelle',
    prompt: 'Une parcelle en forme de parallélogramme a une base de 14 m, un côté oblique de 9 m et une hauteur de 6 m. Quelle est son aire ?',
    options: ['84 m²', '126 m²', '54 m²', '29 m²'],
    cols: 4,
    correct: 0,
    requires: ['aire-parallelogramme'],
    explain: 'Aire = base × hauteur = 14 × 6 = 84 m². Les 9 m du côté oblique ne servent à rien : on peut allonger ce côté sans que l’aire change.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_parallelogrammes-5e_P3'] },
  },
  {
    id: 'par5-e10',
    skill: 'conclure',
    title: 'La preuve la plus courte',
    prompt: 'Dans le quadrilatère WXYZ, les diagonales [WY] et [XZ] se coupent en un point I tel que IW = IY et IX = IZ. Quelle propriété permet de conclure que WXYZ est un parallélogramme ?',
    options: [
      'Les diagonales se coupent en leur milieu',
      'Les côtés opposés sont égaux deux à deux',
      'Les côtés opposés sont parallèles deux à deux',
      'On ne peut pas conclure : il faudrait les longueurs des côtés',
    ],
    cols: 1,
    correct: 0,
    requires: ['caracterisations', 'diagonales-milieu'],
    explain: 'IW = IY dit que I est le milieu de [WY] ; IX = IZ dit qu’il est le milieu de [XZ]. Les deux diagonales ont donc le même milieu — c’est l’une des trois caractérisations, et elle suffit.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_parallelogrammes-5e_P6'] },
  },
];

export default function Module08MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le parallélogramme"
      moduleSubtitle="Dix épreuves pour prouver qu’une propriété vaut mieux qu’un coup d’œil"
      estimatedTime="7 min"
      timerSeconds={660}
      timerLabel="11 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître du parallélogramme',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Pour chacune, reviens au même réflexe :{' '}
            <strong>qu’est-ce que l’énoncé me donne, et quelle propriété s’applique ?</strong> Le
            dessin ne décide jamais.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '🔷', label: 'La définition', value: 'côtés opposés parallèles deux à deux' },
        { id: 'r2', emoji: '📏', label: 'Les côtés', value: 'opposés égaux, jamais consécutifs' },
        { id: 'r3', emoji: '✖️', label: 'Les diagonales', value: 'même milieu, pas même longueur' },
        { id: 'r4', emoji: '🟦', label: 'L’aire', value: 'base × hauteur, jamais le côté' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître du parallélogramme !',
        title: 'Mission accomplie',
        message: 'Tu sais définir, construire, justifier et calculer avec les parallélogrammes.',
        verbs: ['Définir', 'Construire', 'Justifier', 'Calculer'],
        masterBadgeLabel: 'Maître du parallélogramme',
      }}
    />
  );
}
