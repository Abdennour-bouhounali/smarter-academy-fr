import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import { euler, smallestFactorization } from '../components/logicUtils';

/**
 * Module 6 — Boss Final « Le tribunal des affirmations » (kit, QCM). DONNÉES.
 * Distracteurs = pièges des modules 1–6 : « des exemples prouvent » (M1) ·
 * OU exclusif (M2) · négation d'une inégalité stricte (M2) · réciproque prise
 * pour équivalente (M3) · contraposée confondue avec réciproque (M3) ·
 * x² = 9 ⇒ x = 3 (M4) · « il existe » traité comme « pour tout » (M5) ·
 * l'absurde confondu avec un contre-exemple (M6).
 * Couverture : P1 → e1, e2 · P2 → e3, e4 · P3 → e5, e6 · P4 → e7, e8 · P5 → e9 · P6 → e10.
 */
const F40 = smallestFactorization(euler(40));
const REGISTRE = [
  { id: 'euler', emoji: '⚖️', label: 'Euler', value: `1 681 = ${F40.a}×${F40.b}` },
  { id: 'ou', emoji: '🔌', label: 'OU', value: 'inclusif' },
  { id: 'impl', emoji: '➡️', label: 'Interdit', value: 'P vraie, Q fausse' },
  { id: 'equiv', emoji: '↔️', label: 'Équivalence', value: 'deux sens' },
];
const SKILLS = {
  proposition: { label: 'Proposition et contre-exemple', module: 1 },
  connecteurs: { label: 'Connecteurs et négation', module: 2 },
  implication: { label: 'Implication, réciproque, contraposée', module: 3 },
  equivalence: { label: 'Équivalence', module: 4 },
  raisonnement: { label: 'Raisonner (absurde, cas)', module: 5 },
};
const EPREUVES = [
  { id: 'lg-e1', skill: 'proposition', requires: ['proposition'], title: 'Épreuve 1', prompt: 'Laquelle de ces phrases est une proposition mathématique ?', options: ['« 12 est un multiple de 5 »', '« Les fractions sont difficiles »', '« 2x + 1 »', '« Calcule 5 × 7 »'], cols: 1, correct: 0, explain: 'Une proposition est vraie ou fausse : « 12 est multiple de 5 » est fausse, mais c’est bien une proposition. Un avis, une expression et un ordre n’en sont pas.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_logique-et-raisonnement-2nde_P1'] } },
  { id: 'lg-e2', skill: 'proposition', requires: ['proposition', 'contre-exemple', 'mem-contre-exemple', 'nombre-premier'], title: 'Épreuve 2', prompt: 'Une formule donne un nombre premier pour n = 0 jusqu’à 39, puis échoue en n = 40. L’affirmation « pour tout n, cette formule donne un nombre premier » est :', options: ['Fausse : un seul contre-exemple suffit', 'Vraie « presque partout »', 'Indécidable', 'Vraie, car 40 succès sur 41'], cols: 2, correct: 0, explain: 'Une affirmation universelle tombe dès qu’UN cas la contredit. C’est le polynôme d’Euler : 40² + 40 + 41 = 1 681 = 41 × 41.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_logique-et-raisonnement-2nde_P5', 'seconde_logique-et-raisonnement-2nde_P1'] } },
  { id: 'lg-e3', skill: 'connecteurs', requires: ['connecteurs', 'regle-ou-inclusif'], title: 'Épreuve 3', prompt: 'n = 8. La proposition « n est pair OU n > 100 » est-elle vraie ?', options: ['Vraie : le OU mathématique demande qu’au moins une soit vraie', 'Fausse : n n’est pas > 100', 'Vraie seulement si les deux le sont', 'On ne peut pas savoir'], cols: 2, correct: 0, explain: 'Le OU est inclusif : une seule suffit. 8 est pair, donc la proposition est vraie, même si 8 < 100.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_logique-et-raisonnement-2nde_P2'] } },
  { id: 'lg-e4', skill: 'connecteurs', requires: ['connecteurs', 'methode-negation'], title: 'Épreuve 4', prompt: 'Quelle est la négation de « tous les élèves ont réussi » ?', options: ['Au moins un élève n’a pas réussi', 'Aucun élève n’a réussi', 'Tous les élèves ont échoué', 'Certains élèves ont réussi'], cols: 2, correct: 0, explain: 'Nier « pour tout », c’est affirmer « il existe… qui ne… pas ». « Aucun n’a réussi » est bien plus fort : c’est la négation de « au moins un a réussi ».', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_logique-et-raisonnement-2nde_P2'] } },
  { id: 'lg-e5', skill: 'implication', requires: ['implication', 'reciproque'], title: 'Épreuve 5', prompt: '« Si n est multiple de 6, alors n est multiple de 3. » Que peut-on dire de la réciproque ?', options: ['Elle est fausse : 9 est multiple de 3 sans être multiple de 6', 'Elle est vraie aussi', 'Elle est équivalente à l’implication', 'On ne peut pas la former'], cols: 2, correct: 0, explain: 'La réciproque « multiple de 3 ⇒ multiple de 6 » tombe sur 9 (ou 3, 15, 21…). Une implication vraie n’entraîne jamais que sa réciproque le soit.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_logique-et-raisonnement-2nde_P3'] } },
  { id: 'lg-e6', skill: 'implication', requires: ['implication', 'reciproque', 'contraposee', 'mem-cas-interdit'], title: 'Épreuve 6', prompt: 'Quelle est la CONTRAPOSÉE de « si n est multiple de 6, alors n est pair » ?', options: ['Si n n’est pas pair, alors n n’est pas multiple de 6', 'Si n est pair, alors n est multiple de 6', 'Si n n’est pas multiple de 6, alors n n’est pas pair', 'Si n est multiple de 6, alors n n’est pas impair'], cols: 1, correct: 0, explain: 'La contraposée de « P ⇒ Q » est « non Q ⇒ non P » : on inverse ET on nie les deux. Elle a toujours la même valeur de vérité que l’implication ; l’option 2 est la réciproque.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_logique-et-raisonnement-2nde_P3'] } },
  { id: 'lg-e7', skill: 'equivalence', requires: ['equivalence', 'regle-equivalence-carre'], title: 'Épreuve 7', prompt: <>Quelle affirmation est correcte à propos de <MathText>{'$x^{2} = 25$'}</MathText> ?</>, options: ['x² = 25 ⇔ (x = 5 ou x = −5)', 'x² = 25 ⇔ x = 5', 'x² = 25 ⇒ x = 5', 'x = 5 ⇔ x² = 25'], cols: 1, correct: 0, explain: '(−5)² = 25 aussi : le sens « x² = 25 ⇒ x = 5 » est faux. L’équivalence correcte inclut les deux solutions.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_logique-et-raisonnement-2nde_P4'] } },
  { id: 'lg-e8', skill: 'equivalence', requires: ['equivalence', 'methode-choisir-symbole'], title: 'Épreuve 8', prompt: 'Pour montrer que « P ⇔ Q » est vraie, il faut :', options: ['Montrer les deux implications P ⇒ Q et Q ⇒ P', 'Montrer P ⇒ Q seulement', 'Trouver un exemple où les deux sont vraies', 'Montrer que P et Q sont toutes les deux vraies'], cols: 1, correct: 0, explain: 'Une équivalence est la conjonction des deux implications. Un exemple commun ne suffit pas — c’est exactement ce qui rendait « x² = 9 ⇔ x = 3 » séduisante et fausse.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_logique-et-raisonnement-2nde_P4'] } },
  { id: 'lg-e9', skill: 'proposition', requires: ['contre-exemple', 'mem-contre-exemple', 'nombre-premier'], title: 'Épreuve 9', prompt: 'Pour réfuter « pour tout entier n, n² + 1 est premier », il suffit de :', options: ['Donner n = 3 : 3² + 1 = 10 = 2 × 5', 'Tester beaucoup de valeurs', 'Faire une démonstration générale', 'Rien : l’affirmation est vraie'], cols: 2, correct: 0, explain: 'Un contre-exemple explicite réfute définitivement. n = 3 donne 10, qui n’est pas premier (n = 2 donne 5, premier — d’où l’intérêt de bien choisir).', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_logique-et-raisonnement-2nde_P5'] } },
  { id: 'lg-e10', skill: 'raisonnement', requires: ['raisonnement-absurde', 'vocab-quatre-outils'], title: 'Épreuve 10', prompt: 'Dans une classe de 13 élèves, on veut montrer que deux sont nés le même mois. Un raisonnement par l’absurde commence par :', options: ['« Supposons qu’aucun mois ne soit partagé »', '« Prenons une classe de 13 élèves nés en janvier »', '« Testons plusieurs classes »', '« Il y a 12 mois, donc c’est vrai »'], cols: 1, correct: 0, explain: 'Par l’absurde : on suppose le CONTRAIRE de la conclusion, puis on en tire une contradiction (au plus 12 élèves, alors qu’il y en a 13). La dernière option énonce l’idée sans la démontrer.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_logique-et-raisonnement-2nde_P6'] } },
];
const BADGES = [
  { id: 'b-prop', emoji: '⚖️', label: 'Propositions et contre-exemples sans faute', test: (m) => !m.proposition },
  { id: 'b-conn', emoji: '🔌', label: 'Connecteurs sans faute', test: (m) => !m.connecteurs },
  { id: 'b-impl', emoji: '➡️', label: 'Implications sans faute', test: (m) => !m.implication },
  { id: 'b-equiv', emoji: '↔️', label: 'Équivalences sans faute', test: (m) => !m.equivalence },
  { id: 'b-rais', emoji: '🚪', label: 'Raisonnements sans faute', test: (m) => !m.raisonnement },
  { id: 'b-perfect', emoji: '💎', label: 'Dix sur dix', test: (m) => Object.values(m).every((v) => !v) },
];
export default function Module06MissionFinale() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(6)} moduleNumber={6}
      moduleTitle="🏆 Mission finale : le tribunal des affirmations" moduleSubtitle="Dix épreuves pour prouver qu’aucune affirmation ne te piège." estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG} timerSeconds={600} timerLabel="10 min" xpPerCorrect={10}
      brief={{ tag: '🏆 Boss final', title: 'Dix affirmations à juger.', body: <p>Aucune aide, une seule validation à la fin. Tes réponses deviennent ton profil de maîtrise.</p> }}
      registre={REGISTRE} skills={SKILLS} epreuves={EPREUVES} badges={BADGES} synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{ masterTitle: 'Juge des affirmations', title: 'Leçon terminée', message: 'Tu sais analyser une proposition, brancher des connecteurs, distinguer implication, réciproque et contraposée, et réfuter d’un contre-exemple.', verbs: ['Tester', 'Brancher', 'Distinguer', 'Réfuter'], masterBadgeLabel: 'Tous les badges débloqués' }} />
  );
}
