import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import { fmt, fmtParen } from '../components/relatifs';

/**
 * Module 7 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Le test
 * CONSOLIDE : il n'introduit ni concept, ni vocabulaire, ni notation neufs
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *
 * TRANSFERT, pas répétition (§45) : aucune épreuve ne reprend les valeurs des
 * modules. Les contextes changent (compte bancaire, plongée, chronologie,
 * altitude) et chaque distracteur encode une erreur RÉELLEMENT rencontrée
 * dans la leçon :
 *   — lire le signe comme une opération (M1) ;
 *   — croire que la plus grande distance à zéro est le plus grand nombre (M3) ;
 *   — ajouter les distances à zéro au lieu de se déplacer (M4) ;
 *   — croire que retirer un négatif diminue (M5) ;
 *   — donner un écart signé (M5, M6).
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 8 LPs sont tous couverts.
 */
const SKILLS = {
  sens: { label: 'Sens', emoji: '🌡️' },
  droite: { label: 'Droite graduée', emoji: '📏' },
  ordre: { label: 'Comparer', emoji: '⚖️' },
  calcul: { label: 'Calculer', emoji: '🔢' },
};

// `test: (misses) => bool` — `misses` porte les compétences ratées ; un badge
// est gagné quand la sienne n'y est pas (contrat de BossFinal, ligne 209).
const BADGES = [
  { id: 'b-sens', emoji: '🌡️', label: 'Lecteur de signes', test: (m) => !m.sens },
  { id: 'b-droite', emoji: '📏', label: 'Maître de la droite', test: (m) => !m.droite },
  { id: 'b-ordre', emoji: '⚖️', label: 'Juge de l’ordre', test: (m) => !m.ordre },
  { id: 'b-calcul', emoji: '🔢', label: 'Calculateur relatif', test: (m) => !m.calcul },
  { id: 'b-parfait', emoji: '💎', label: 'Gardien de l’immeuble', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'nr5-e1',
    skill: 'sens',
    title: 'Le sous-marin',
    prompt: 'Un sous-marin navigue à 40 mètres au-dessous du niveau de la mer. Quel nombre relatif décrit son altitude ?',
    options: [`${fmt(-40)} m`, '40 m', '0 m', `${fmt(-40)} m ou 40 m, au choix`],
    cols: 2,
    requires: ['nombre-relatif'],
    explain: `Le niveau de la mer est le zéro. « Au-dessous » se traduit par un signe −, donc ${fmt(-40)} m. Le signe indique le côté du zéro, il ne demande aucun calcul.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_nombres-relatifs-5e_P1'] },
  },
  {
    id: 'nr5-e2',
    skill: 'droite',
    title: 'Placer un nombre',
    prompt: `Sur une droite graduée de 1 en 1, on part du zéro et on compte 7 graduations vers la gauche. Sur quel nombre arrive-t-on ?`,
    options: [`${fmt(-7)}`, '7', `${fmt(-6)}`, '0'],
    cols: 4,
    requires: ['droite-relatifs', 'nombre-relatif'],
    explain: `Vers la gauche depuis le zéro, on rencontre les nombres négatifs : la 7ᵉ graduation est ${fmt(-7)}.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_nombres-relatifs-5e_P2'] },
  },
  {
    id: 'nr5-e3',
    skill: 'droite',
    title: 'L’opposé',
    prompt: `Quel est l’opposé de ${fmt(-12)} ?`,
    options: ['12', `${fmt(-12)}`, '0', `${fmt(-24)}`],
    cols: 4,
    requires: ['oppose'],
    explain: `L’opposé de ${fmt(-12)} est 12 : même distance à zéro (12 graduations), mais de l’autre côté.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_nombres-relatifs-5e_P3'] },
  },
  {
    id: 'nr5-e4',
    skill: 'droite',
    title: 'Distance à zéro',
    prompt: `Deux nombres ont la même distance à zéro : 9. Lesquels sont-ils ?`,
    options: [`${fmt(-9)} et 9`, `${fmt(-9)} et ${fmt(-9)}`, '9 et 18', `0 et 9`],
    cols: 2,
    requires: ['distance-a-zero', 'oppose'],
    explain: `Deux nombres à 9 graduations du zéro : un de chaque côté, donc ${fmt(-9)} et 9. Ce sont deux opposés.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_nombres-relatifs-5e_P4'] },
  },
  {
    id: 'nr5-e5',
    skill: 'ordre',
    title: 'Le plus froid',
    prompt: `Quatre villes : Oslo ${fmt(-14)} °C, Berlin ${fmt(-3)} °C, Kiev ${fmt(-9)} °C, Rome 6 °C. Quelle ville est la plus froide ?`,
    options: ['Oslo', 'Berlin', 'Kiev', 'Rome'],
    cols: 4,
    requires: ['ordre-relatifs', 'distance-a-zero'],
    explain: `La plus froide est celle dont la température est la plus PETITE, donc la plus à gauche : ${fmt(-14)} °C, à Oslo. Chez les négatifs, la plus grande distance à zéro donne le plus petit nombre.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_nombres-relatifs-5e_P5'] },
  },
  {
    id: 'nr5-e6',
    skill: 'ordre',
    title: 'Ranger',
    prompt: `Range dans l’ordre croissant : ${fmt(-5)} ; 2 ; ${fmt(-11)} ; 0.`,
    options: [
      `${fmt(-11)} < ${fmt(-5)} < 0 < 2`,
      `${fmt(-5)} < ${fmt(-11)} < 0 < 2`,
      `0 < 2 < ${fmt(-5)} < ${fmt(-11)}`,
      `2 < 0 < ${fmt(-5)} < ${fmt(-11)}`,
    ],
    cols: 1,
    requires: ['ordre-relatifs', 'droite-relatifs'],
    explain: `L’ordre croissant se lit de gauche à droite sur la droite graduée : ${fmt(-11)} < ${fmt(-5)} < 0 < 2. Les négatifs viennent avant zéro, les positifs après.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_nombres-relatifs-5e_P5'] },
  },
  {
    id: 'nr5-e7',
    skill: 'calcul',
    title: 'Le compte bancaire',
    prompt: `Un compte affiche ${fmt(-30)} €. Le titulaire y dépose 18 €. Que devient le solde ?`,
    options: [`${fmt(-12)} €`, `${fmt(-48)} €`, '12 €', '48 €'],
    cols: 4,
    requires: ['addition-deplacement', 'nombre-relatif'],
    explain: `${fmt(-30)} + 18 : on part de ${fmt(-30)} et on avance de 18 graduations vers la droite, ce qui donne ${fmt(-12)}. Le compte reste dans le rouge, mais moins.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_nombres-relatifs-5e_P6'] },
  },
  {
    id: 'nr5-e8',
    skill: 'calcul',
    title: 'Retirer un négatif',
    prompt: `Combien fait 6 − ${fmtParen(-7)} ?`,
    options: ['13', `${fmt(-1)}`, `${fmt(-13)}`, '1'],
    cols: 4,
    requires: ['soustraction-oppose', 'addition-deplacement'],
    explain: `Retirer ${fmt(-7)} revient à ajouter 7 : 6 + 7 = 13. Retirer un nombre négatif fait bien augmenter le résultat.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_nombres-relatifs-5e_P7'] },
  },
  {
    id: 'nr5-e9',
    skill: 'calcul',
    title: 'L’écart des altitudes',
    prompt: `Un plongeur est à ${fmt(-18)} m, un oiseau vole à 25 m. Quel écart d’altitude les sépare ?`,
    options: ['43 m', '7 m', `${fmt(-43)} m`, `${fmt(-7)} m`],
    cols: 4,
    requires: ['ecart-deux-nombres', 'soustraction-oppose', 'distance-a-zero'],
    explain: `De ${fmt(-18)} à 25 : 18 graduations pour remonter au niveau de la mer, puis 25 encore, soit 43 m. Un écart est une distance : il n’est jamais négatif.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_nombres-relatifs-5e_P7', '5e_nombres-relatifs-5e_P4'] },
  },
  {
    id: 'nr5-e10',
    skill: 'calcul',
    title: 'Prévoir le signe',
    prompt: `Sans poser le calcul : ${fmt(-15)} + 6 donne-t-il un résultat positif ou négatif ?`,
    options: [
      'Négatif : on part de 15 à gauche et on n’avance que de 6',
      'Positif : on ajoute un nombre positif',
      'Nul : les deux se compensent',
      'Impossible à prévoir sans calculer',
    ],
    cols: 1,
    requires: ['addition-deplacement', 'distance-a-zero', 'ordre-relatifs'],
    explain: `${fmt(-15)} est à 15 graduations à gauche du zéro. Avancer de 6 ne suffit pas à le franchir : le résultat reste négatif. Comparer les deux distances à zéro suffit à prévoir le signe.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_nombres-relatifs-5e_P8'] },
  },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : l’immeuble"
      moduleSubtitle="Dix épreuves pour prouver que tu maîtrises les nombres relatifs"
      estimatedTime="5 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Gardien de l’immeuble',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Pour chacune, demande-toi d’abord :{' '}
            <strong>de quel côté du zéro suis-je, et dans quel sens vais-je ?</strong>
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '🌡️', label: 'Le signe', value: 'le côté du zéro' },
        { id: 'r2', emoji: '📏', label: 'Distance à zéro', value: 'jamais négative' },
        { id: 'r3', emoji: '⚖️', label: 'Le plus grand', value: 'le plus à droite' },
        { id: 'r4', emoji: '🔢', label: 'a − b', value: 'a + (opposé de b)' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Gardien de l’immeuble !',
        title: 'Mission accomplie',
        message: 'Tu sais lire, placer, comparer et calculer avec les nombres relatifs.',
        verbs: ['Lire', 'Placer', 'Comparer', 'Calculer'],
        masterBadgeLabel: 'Gardien de l’immeuble',
      }}
    />
  );
}
