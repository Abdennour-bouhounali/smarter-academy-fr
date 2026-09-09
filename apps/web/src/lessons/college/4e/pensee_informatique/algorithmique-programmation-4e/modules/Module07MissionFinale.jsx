import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Le test CONSOLIDE :
 * il n'introduit ni concept, ni vocabulaire, ni notation neufs.
 *
 * TRANSFERT, pas répétition : aucune épreuve ne reprend les programmes des
 * modules (ni le carré de 60, ni le seuil 50, ni la spirale de pas 20), et
 * chaque distracteur encode une erreur RÉELLEMENT rencontrée :
 *   — croire que les deux branches d'un SI s'exécutent (M2) ;
 *   — confondre « > » et « ⩾ » à la borne (M3) ;
 *   — lire « i ← i + 1 » comme une équation (M4) ;
 *   — compter les instructions ÉCRITES au lieu des instructions EXÉCUTÉES (M1) ;
 *   — chercher un bug ailleurs qu'au premier écart (M6) ;
 *   — confondre « la figure se referme » et « c'est la figure demandée » (M5).
 *
 * `badges[].test` est une FONCTION `(misses) => bool`. Les 6 LPs sont couverts :
 *   P1 → e1, e2   P2 → e4, e5   P3 → e3, e6
 *   P4 → e7, e8   P5 → e9       P6 → e10
 *
 * PÉRIMÈTRE. Aucune épreuve ne parle de boucle « tant que », de condition
 * composée (ET / OU) ni de bloc défini par l'élève : ce sont des objets de 3e.
 */
const SKILLS = {
  choix: { label: 'Lire un choix', module: 2, emoji: '🔀' },
  condition: { label: 'Écrire une condition', module: 3, emoji: '⚖️' },
  variable: { label: 'Suivre une variable', module: 4, emoji: '📦' },
  reparer: { label: 'Modifier et réparer', module: 6, emoji: '🔧' },
};

const BADGES = [
  { id: 'b-ch', emoji: '🔀', label: 'Lecteur de branches', test: (m) => !m.choix },
  { id: 'b-co', emoji: '⚖️', label: 'Condition sûre', test: (m) => !m.condition },
  { id: 'b-va', emoji: '📦', label: 'Compteur suivi', test: (m) => !m.variable },
  { id: 'b-re', emoji: '🔧', label: 'Réparateur', test: (m) => !m.reparer },
  { id: 'b-parfait', emoji: '💎', label: 'Maître des programmes', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'al4-e1',
    skill: 'choix',
    title: 'Une seule branche',
    prompt: 'Un programme contient « SI age ⩾ 18 ALORS [ AVANCER de 100 ] SINON [ AVANCER de 20 ] ». Avec age = 25, que fait-il ?',
    options: [
      'Il avance de 100, et rien d’autre',
      'Il avance de 100, puis de 20',
      'Il avance de 120',
      'Il avance de 20',
    ],
    correct: 0,
    cols: 1,
    requires: ['si-alors-sinon'],
    explain: 'Le test est vrai, donc la branche « alors » s’exécute — et l’autre est sautée entièrement. Un bloc de choix n’exécute jamais ses deux branches.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_algorithmique-programmation-4e_P1'] },
  },
  {
    id: 'al4-e2',
    skill: 'choix',
    title: 'Combien de pas ?',
    prompt: 'Le corps d’une boucle contient un bloc de choix (2 instructions dans « alors », 2 dans « sinon ») puis un TOURNER. La boucle fait 3 tours. Combien de pas compte l’exécution ?',
    options: ['9 pas', '15 pas', '3 pas', '5 pas'],
    correct: 0,
    cols: 4,
    requires: ['si-alors-sinon', 'pas-a-pas'],
    explain: 'À chaque tour : 2 instructions de la branche prise, plus le TOURNER, soit 3 pas. Sur 3 tours : 9 pas. Les 2 instructions de la branche non prise ne sont jamais exécutées.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_algorithmique-programmation-4e_P1'] },
  },
  {
    id: 'al4-e3',
    skill: 'choix',
    title: 'Quel chemin ?',
    prompt: 'Un programme teste « score < 10 ». La branche « alors » trace un petit trait, la branche « sinon » un grand. Avec score = 10, que trace-t-il ?',
    options: [
      'Un grand trait : le test est faux',
      'Un petit trait : le test est vrai',
      'Les deux traits',
      'Rien : la valeur est exactement au seuil',
    ],
    correct: 0,
    cols: 1,
    requires: ['chemin-programme', 'condition-test'],
    explain: '10 n’est pas strictement plus petit que 10 : le test est faux, donc c’est la branche « sinon » qui s’exécute. La valeur du seuil appartient toujours au camp du « sinon » avec un « < ».',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_algorithmique-programmation-4e_P3'] },
  },
  {
    id: 'al4-e4',
    skill: 'condition',
    title: 'Au plus 30',
    prompt: 'Un programme doit se déclencher pour toutes les valeurs de n INFÉRIEURES OU ÉGALES à 30. Quel test écrire ?',
    options: ['n ⩽ 30', 'n < 30', 'n ⩾ 30', 'n = 30'],
    correct: 0,
    cols: 4,
    requires: ['condition-test'],
    explain: '« Inférieures ou égales à 30 » inclut 30. Le test « n < 30 » l’exclurait : le programme raterait exactement la valeur limite.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_algorithmique-programmation-4e_P2'] },
  },
  {
    id: 'al4-e5',
    skill: 'condition',
    title: 'La valeur qui les sépare',
    prompt: 'Sur quelle valeur les tests « n > 7 » et « n ⩾ 7 » donnent-ils des résultats DIFFÉRENTS ?',
    options: ['Sur 7', 'Sur 6', 'Sur 8', 'Sur aucune'],
    correct: 0,
    cols: 4,
    requires: ['valeur-frontiere'],
    explain: 'Pour 6, les deux sont faux ; pour 8, les deux sont vrais. Seul 7 les sépare : « > 7 » y est faux, « ⩾ 7 » y est vrai. C’est toujours la valeur du seuil qu’il faut essayer.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_algorithmique-programmation-4e_P2'] },
  },
  {
    id: 'al4-e6',
    skill: 'condition',
    title: 'Tester pour de bon',
    prompt: 'Un programme contient un bloc de choix. Combien de valeurs d’entrée faut-il au minimum pour vérifier qu’il fonctionne dans tous les cas ?',
    options: [
      'Au moins deux : une pour chaque branche',
      'Une seule suffit si elle marche',
      'Aucune : il suffit de relire le programme',
      'Autant que d’instructions écrites',
    ],
    correct: 0,
    cols: 1,
    requires: ['chemin-programme'],
    explain: 'Un programme avec un choix a deux chemins possibles. Une seule entrée n’en teste qu’un : l’autre branche peut contenir une erreur qu’aucune exécution n’a rencontrée.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_algorithmique-programmation-4e_P3'] },
  },
  {
    id: 'al4-e7',
    skill: 'variable',
    title: 'La flèche',
    prompt: 'Une variable p vaut 12. Le programme exécute « p ← p + 5 ». Combien vaut p ensuite ?',
    options: ['17', '12', '5', 'C’est impossible'],
    correct: 0,
    cols: 4,
    requires: ['affectation'],
    explain: 'On calcule d’abord p + 5 avec l’ancienne valeur : 12 + 5 = 17, puis on range 17 dans p. Ce n’est pas une équation à résoudre, c’est un ordre à exécuter.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_algorithmique-programmation-4e_P4'] },
  },
  {
    id: 'al4-e8',
    skill: 'variable',
    title: 'Le compteur à la fin',
    prompt: 'Un programme fait « METTRE 3 DANS c », puis « RÉPÉTER 4 fois [ AVANCER de 30 ; c ← c + 2 ] ». Combien vaut c à la fin ?',
    options: ['11', '5', '8', '3'],
    correct: 0,
    cols: 4,
    requires: ['compteur'],
    explain: 'c part de 3 et gagne 2 à chacun des 4 tours : 3 + 2 + 2 + 2 + 2 = 11. Les additions s’accumulent, elles ne se remplacent pas.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_algorithmique-programmation-4e_P4'] },
  },
  {
    id: 'al4-e9',
    skill: 'reparer',
    title: 'La bonne modification',
    prompt: 'Un programme trace un octogone régulier (8 côtés, virages de 45°). On veut un carré de même côté. Que modifier ?',
    options: [
      'Le nombre de tours à 4 ET l’angle à 90°',
      'Le nombre de tours à 4, seulement',
      'L’angle à 90°, seulement',
      'La longueur des côtés',
    ],
    correct: 0,
    cols: 1,
    requires: ['modifier-programme', 'angle-exterieur'],
    explain: 'Un carré demande 4 côtés ET des virages de 360 ÷ 4 = 90°. Ne changer que le nombre de tours donnerait une figure ouverte (4 × 45 = 180) ; ne changer que l’angle donnerait 8 côtés à 90°, soit un carré parcouru deux fois.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_algorithmique-programmation-4e_P5'] },
  },
  {
    id: 'al4-e10',
    skill: 'reparer',
    title: 'Où est la faute ?',
    prompt: 'Un programme devait tracer une spirale. Les cinq premiers pas sont identiques à l’attendu, puis la variable du côté diffère au pas 6, et le tracé au pas 7. Quelle instruction est fautive ?',
    options: [
      'Celle qui s’est exécutée au pas 6',
      'Celle qui s’est exécutée au pas 7',
      'La première instruction du programme',
      'Impossible à savoir sans relire tout le programme',
    ],
    correct: 0,
    cols: 1,
    requires: ['premier-ecart'],
    explain: 'La faute est au PREMIER écart, quel qu’il porte : ici la variable diverge au pas 6, avant le tracé. Les cinq pas précédents ont produit exactement l’attendu — inutile de les relire.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_algorithmique-programmation-4e_P6'] },
  },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="🏆 Mission finale : l’atelier des choix"
      moduleSubtitle="Dix épreuves, une seule soumission"
      estimatedTime="9 min"
      lessonConfig={LESSON_CONFIG}
      brief={{
        tag: '🏆 Mission finale',
        title: 'L’atelier des choix',
        tone: 'amber',
        body: (
          <>
            Dix programmes à lire, à corriger ou à prévoir. Réponds à tout, puis soumets :
            aucune correction avant la fin.
          </>
        ),
      }}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'Programmes maîtrisés',
        title: 'Mission accomplie',
        message: 'Tu sais lire un programme qui choisit, écrire une condition juste jusqu’à sa borne, suivre une variable qui évolue, et trouver la première instruction fautive au lieu de tout relire.',
        verbs: ['Lire', 'Écrire', 'Suivre', 'Réparer'],
        masterBadgeLabel: 'Maître des programmes',
      }}
    />
  );
}
