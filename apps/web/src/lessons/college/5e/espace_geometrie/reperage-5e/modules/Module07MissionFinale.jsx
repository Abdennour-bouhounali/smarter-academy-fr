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
 * TRANSFERT, pas répétition : aucune épreuve ne reprend les couples des
 * modules. Les contextes changent (plan de ville, jeu de bataille navale,
 * relevé de température, plan de salle) et chaque distracteur encode une
 * erreur RÉELLEMENT rencontrée dans la leçon :
 *   — donner un seul nombre pour désigner un lieu (M1) ;
 *   — confondre l'origine avec un coin du dessin (M2) ;
 *   — croire que le signe de l'abscisse commande la hauteur (M3) ;
 *   — échanger les deux coordonnées (M4) ;
 *   — ranger dans un quadrant un point situé sur un axe (M5) ;
 *   — compter les graduations sans lire l'échelle (M6).
 *
 * PÉRIMÈTRE 5e — vérifié épreuve par épreuve : aucune coordonnée dans
 * l'espace, aucune distance entre deux points quelconques, aucun milieu,
 * aucune équation de droite. On lit, on place, on situe.
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 5 LPs sont tous couverts.
 *
 * `badges[].test` est une FONCTION (m) => bool — un objet y provoquerait
 * « b.test is not a function » au montage.
 */
const SKILLS = {
  abscisse: { label: 'Lire une abscisse', emoji: '📏', module: 1 },
  repere: { label: 'Axes et origine', emoji: '➕', module: 2 },
  lire: { label: 'Lire des coordonnées', emoji: '👀', module: 3 },
  placer: { label: 'Placer un point', emoji: '📍', module: 4 },
  axes: { label: 'Points sur un axe', emoji: '🚧', module: 5 },
  echelle: { label: 'Lire une échelle', emoji: '🔍', module: 6 },
};

const REGISTRE = [
  { id: 'r-origine', emoji: '🏠', label: 'Origine', value: 'O, le croisement des deux axes' },
  { id: 'r-abscisse', emoji: '↔️', label: 'Abscisse', value: 'le premier nombre, horizontal' },
  { id: 'r-ordonnee', emoji: '↕️', label: 'Ordonnée', value: 'le second nombre, vertical' },
  { id: 'r-couple', emoji: '✍️', label: 'Écriture', value: '(abscisse ; ordonnée)' },
];

const BADGES = [
  { id: 'b-repere', emoji: '➕', label: 'Maître du repère', test: (m) => !m.repere },
  { id: 'b-lire', emoji: '👀', label: 'Œil de lynx', test: (m) => !m.lire },
  { id: 'b-placer', emoji: '📍', label: 'Placeur sûr', test: (m) => !m.placer },
  { id: 'b-axes', emoji: '🚧', label: 'Gardien des frontières', test: (m) => !m.axes },
  { id: 'b-echelle', emoji: '🔍', label: 'Lecteur d’échelle', test: (m) => !m.echelle },
  { id: 'b-parfait', emoji: '💎', label: 'Cartographe du domaine', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'rep5-e1',
    skill: 'abscisse',
    title: 'Un seul nombre',
    prompt: 'Sur un plan, tu écris à un ami « je suis en −4 » en ne donnant que ta position horizontale. Que peut-il en déduire ?',
    options: [
      'Seulement la colonne où tu te trouves, pas l’endroit exact',
      'Ta position exacte sur le plan',
      'Que tu es en bas du plan',
      'Que tu es à l’origine',
    ],
    cols: 1,
    requires: ['abscisse', 'deuxieme-dimension'],
    explain: 'Un seul nombre situe une colonne entière : tous les points d’abscisse −4 conviennent. Il faut un second nombre pour désigner un endroit unique.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_reperage-5e_P1'] },
  },
  {
    id: 'rep5-e2',
    skill: 'abscisse',
    title: 'Lire sur la droite',
    prompt: 'Sur une droite graduée de pas 1, un point est situé 3 graduations à GAUCHE de l’origine. Quelle est son abscisse ?',
    options: ['−3', '3', '0', '−1'],
    cols: 4,
    requires: ['abscisse'],
    explain: 'À gauche de l’origine, l’abscisse est négative : trois graduations à gauche donnent −3.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_reperage-5e_P1'] },
  },
  {
    id: 'rep5-e3',
    skill: 'repere',
    title: 'Où est l’origine ?',
    prompt: 'Dans un repère du plan, où se trouve l’origine ?',
    options: [
      'Au point où les deux axes se croisent',
      'Dans le coin en bas à gauche du dessin',
      'À l’extrémité de l’axe horizontal',
      'Au milieu du bord supérieur',
    ],
    cols: 1,
    requires: ['repere', 'axes-origine'],
    explain: 'L’origine est le croisement des deux axes — le point à partir duquel les deux graduations comptent. Ce n’est pas un coin du dessin : le repère continue au-delà dans les quatre directions.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_reperage-5e_P3'] },
  },
  {
    id: 'rep5-e4',
    skill: 'repere',
    title: 'Le rôle de chaque axe',
    prompt: 'Dans le couple (x ; y), que commande le PREMIER nombre ?',
    options: [
      'La position à gauche ou à droite',
      'La position en haut ou en bas',
      'La distance à l’origine',
      'Le quadrant, à lui seul',
    ],
    cols: 1,
    requires: ['coordonnees', 'axes-origine'],
    explain: 'Le premier nombre est l’abscisse : il se lit sur l’axe horizontal et ne commande que la gauche et la droite. C’est le second, l’ordonnée, qui commande le haut et le bas.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_reperage-5e_P3'] },
  },
  {
    id: 'rep5-e5',
    skill: 'lire',
    title: 'Bataille navale',
    prompt: 'Un navire est à 5 unités à droite de l’origine et 2 unités en dessous. Quelles sont ses coordonnées ?',
    options: ['(5 ; −2)', '(−2 ; 5)', '(−5 ; 2)', '(2 ; −5)'],
    cols: 4,
    requires: ['coordonnees', 'lire-un-point'],
    explain: 'À droite : abscisse positive, 5. En dessous : ordonnée négative, −2. On écrit l’abscisse d’abord : (5 ; −2).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_reperage-5e_P4'] },
  },
  {
    id: 'rep5-e6',
    skill: 'lire',
    title: 'Dans quelle région ?',
    prompt: 'Dans quelle région du plan se trouve le point (−6 ; −1) ?',
    options: [
      'En bas à gauche',
      'En bas à droite',
      'En haut à gauche',
      'Sur l’axe des abscisses',
    ],
    cols: 2,
    requires: ['quadrant', 'coordonnees'],
    explain: 'Les deux coordonnées sont négatives : à gauche (abscisse −6) ET en bas (ordonnée −1). Aucune n’est nulle, le point n’est donc pas sur un axe.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_reperage-5e_P4'] },
  },
  {
    id: 'rep5-e7',
    skill: 'placer',
    title: 'Le couple échangé',
    prompt: 'On demande de placer (−1 ; 4). Un élève place le point 4 unités à gauche et 1 unité en haut. Quelle erreur a-t-il faite ?',
    options: [
      'Il a échangé les deux nombres',
      'Il a changé les deux signes',
      'Il a oublié l’origine',
      'Aucune : c’est le bon point',
    ],
    cols: 1,
    requires: ['ordre-du-couple', 'placer-un-point'],
    explain: 'Il a placé (−4 ; 1) au lieu de (−1 ; 4) : il a lu le second nombre en premier. L’abscisse (−1) commande le déplacement horizontal, l’ordonnée (4) le déplacement vertical.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_reperage-5e_P5'] },
  },
  {
    id: 'rep5-e8',
    skill: 'placer',
    title: 'Quand l’échange ne change rien',
    prompt: 'Pour lequel de ces points l’échange des deux coordonnées ne déplace PAS le point ?',
    options: ['(−2 ; −2)', '(−2 ; 2)', '(0 ; 5)', '(3 ; −3)'],
    cols: 4,
    requires: ['ordre-du-couple'],
    explain: 'Échanger les deux nombres de (−2 ; −2) redonne (−2 ; −2) : ils sont égaux. Pour tous les autres, l’échange donne un couple différent, donc un autre point.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_reperage-5e_P5'] },
  },
  {
    id: 'rep5-e9',
    skill: 'axes',
    title: 'Sur la frontière',
    prompt: 'Dans quelle région se trouve le point (−7 ; 0) ?',
    options: [
      'Dans aucune : il est sur l’axe des abscisses',
      'En bas à gauche',
      'En haut à gauche',
      'Dans aucune : il est sur l’axe des ordonnées',
    ],
    cols: 1,
    requires: ['sur-un-axe', 'quadrant'],
    explain: 'L’ordonnée vaut 0 : aucun déplacement vertical, le point reste sur l’axe horizontal — l’axe des abscisses. Un point sur un axe n’appartient à aucun quadrant.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_reperage-5e_P4', '5e_reperage-5e_P3'] },
  },
  {
    id: 'rep5-e10',
    skill: 'echelle',
    title: 'Lire l’échelle',
    prompt: 'Sur un axe, on lit 0 puis 3 après 6 graduations. Un point est 4 graduations à droite de l’origine. Quelle est son abscisse ?',
    options: ['2', '4', '0,5', '12'],
    cols: 4,
    requires: ['echelle-graduation', 'abscisse'],
    explain: 'Une graduation vaut 3 ÷ 6 = 0,5. Quatre graduations valent donc 4 × 0,5 = 2. Compter les graduations ne suffit pas : il faut d’abord savoir ce que vaut chacune.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_reperage-5e_P2'] },
  },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le domaine"
      moduleSubtitle="Dix épreuves pour prouver que tu sais dire où se trouve un point"
      estimatedTime="12 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Le domaine',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Pour chacune, reviens au même réflexe :{' '}
            <strong>quel nombre commande l’horizontale, quel nombre commande la verticale ?</strong>
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Cartographe du domaine !',
        title: 'Mission accomplie',
        message: 'Tu sais lire une abscisse, situer un point dans un repère et le placer sans échanger ses coordonnées.',
        verbs: ['Lire', 'Situer', 'Placer', 'Vérifier'],
        masterBadgeLabel: 'Cartographe du domaine',
      }}
    />
  );
}
