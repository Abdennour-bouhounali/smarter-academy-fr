import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 6 — ÉVALUATION. Distracteurs : division par le total au lieu de
 * l'univers restreint (e3, e5), inversion du conditionnement (e6, e7),
 * intersection confondue avec conditionnelle (e4), 30 % appliqués au total
 * au lieu du sous-groupe (e9). Les 9 LPs sont couverts.
 */
const EPREUVES = [
  { id: 'pc-e1', skill: 'univers', requires: ['univers-restreint'], title: 'Ce que conditionner veut dire', prompt: 'Imposer une condition dans un calcul de probabilité revient à…', options: ['remplacer la population de référence par une sous-population', 'ajouter une information au numérateur', 'multiplier la probabilité par la condition', 'diminuer le nombre de cas favorables uniquement'], cols: 1, explain: 'Conditionner, c’est changer d’univers : le dénominateur devient l’effectif de la sous-population, et on recalcule tout dedans.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_probabilites-conditionnelles-2nde_P1'] } },
  { id: 'pc-e2', skill: 'univers', requires: ['notation-sachant', 'mem-indice'], title: 'Lire la notation', prompt: 'Dans P_A(B), quel événement impose l’univers de calcul ?', options: ['A', 'B', 'A ∩ B', 'Aucun'], cols: 4, explain: 'L’événement en indice est la condition : on lit « probabilité de B sachant A », et le dénominateur est n(A).', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_probabilites-conditionnelles-2nde_P2'] } },
  { id: 'pc-e3', skill: 'calculer', requires: ['notation-sachant', 'univers-restreint', 'denominateur'], title: 'Calculer une conditionnelle', prompt: 'Un lycée de 800 élèves compte 200 internes, dont 150 en club. Combien vaut P_interne(club) ?', options: ['0,75', '0,1875', '0,25', '0,33'], cols: 4, explain: '150 ÷ 200 = 0,75. Diviser par 800 donnerait 0,1875, qui est P(interne ∩ club) — une autre question.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_probabilites-conditionnelles-2nde_P3'] } },
  { id: 'pc-e4', skill: 'calculer', requires: ['notation-sachant', 'univers-restreint'], title: 'Intersection ou conditionnelle', prompt: 'Toujours sur ces 800 élèves : quelle est la probabilité qu’un élève tiré au hasard soit interne ET en club ?', options: ['0,1875', '0,75', '0,25', '0,56'], cols: 4, explain: 'Aucune condition n’est imposée : l’univers reste les 800 élèves, donc 150/800 = 0,1875. Les 0,75 supposeraient qu’on sait déjà que l’élève est interne.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_probabilites-conditionnelles-2nde_P4'] } },
  { id: 'pc-e5', skill: 'calculer', requires: ['notation-sachant', 'univers-restreint', 'denominateur'], title: 'Lire un tableau', prompt: 'Sur 500 pièces, 300 viennent de la machine A dont 15 défectueuses. Une pièce vient de A : probabilité qu’elle soit défectueuse ?', options: ['5 %', '3 %', '79 %', '19 %'], cols: 4, explain: '15 ÷ 300 = 0,05. La condition « vient de A » impose 300 au dénominateur, pas les 500 pièces produites.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_probabilites-conditionnelles-2nde_P5'] } },
  { id: 'pc-e6', skill: 'inversion', requires: ['inversion', 'mem-indice', 'notation-sachant'], title: 'Retourner la condition', prompt: 'Sur ces mêmes 500 pièces, 19 sont défectueuses dont 15 viennent de A. Une pièce est défectueuse : probabilité qu’elle vienne de A ?', options: ['≈ 79 %', '5 %', '60 %', '3 %'], cols: 4, explain: '15 ÷ 19 ≈ 0,79. Le numérateur n’a pas changé (15 pièces), mais la condition « défectueuse » impose un tout autre univers que « vient de A ».', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_probabilites-conditionnelles-2nde_P6'] } },
  { id: 'pc-e7', skill: 'inversion', requires: ['inversion', 'notation-sachant'], title: 'L’erreur d’inversion', prompt: '« La plupart des accidents graves ont lieu près du domicile, donc s’éloigner est plus sûr. » Ce raisonnement…', options: ['confond P(près | accident) et P(accident | près)', 'est correct', 'suppose que les trajets sont tous égaux', 'ne peut pas être tranché'], cols: 2, explain: 'La statistique est calculée dans l’univers des accidents ; la question du risque se pose dans l’univers des trajets. Inverser la condition change complètement le sens.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_probabilites-conditionnelles-2nde_P8'] } },
  { id: 'pc-e8', skill: 'interpreter', requires: ['notation-sachant', 'mem-indice'], title: 'Traduire en une phrase', prompt: 'P_externe(club) = 0,5 signifie…', options: ['la moitié des externes sont en club', 'la moitié des élèves en club sont externes', 'la moitié des élèves sont externes et en club', 'la moitié des élèves sont externes'], cols: 1, explain: 'L’indice donne la population de référence : la phrase parle des externes et dit quelle part d’entre eux est en club.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_probabilites-conditionnelles-2nde_P7'] } },
  { id: 'pc-e9', skill: 'interpreter', requires: ['probabilites-composees'], title: 'Composer', prompt: '40 % des habitants font du vélo ; parmi les cyclistes, 30 % vont travailler à vélo. Quelle part des habitants est cycliste quotidien ?', options: ['12 %', '30 %', '70 %', '40 %'], cols: 4, explain: 'P(A ∩ B) = P(A) × P_A(B) = 0,40 × 0,30 = 0,12. Les 30 % ne portent que sur les cyclistes : on ne peut pas les appliquer à toute la ville.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_probabilites-conditionnelles-2nde_P5'] } },
  { id: 'pc-e10', skill: 'interpreter', requires: ['frequence-probabilite'], title: 'Fréquence et probabilité', prompt: 'Quelle différence entre une fréquence conditionnelle et une probabilité conditionnelle ?', options: ['Le statut : décrire des données observées ou modéliser un tirage', 'La formule de calcul', 'L’une est en %, l’autre en décimal', 'Aucune : ce sont des synonymes'], cols: 1, explain: 'Le quotient est le même. La fréquence résume des observations, la probabilité prévoit une expérience aléatoire — et la loi des grands nombres relie les deux.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_probabilites-conditionnelles-2nde_P9'] } },
];
const SKILLS = {
  univers: { label: 'Univers restreint', module: 1 },
  calculer: { label: 'Calculer P_A(B)', module: 2 },
  inversion: { label: 'Ne pas inverser', module: 3 },
  interpreter: { label: 'Interpréter', module: 4 },
};
const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Le bon univers', test: (m) => !m.univers },
  { id: 'b2', emoji: '🏅', label: 'Calcul juste', test: (m) => !m.calculer },
  { id: 'b3', emoji: '🏅', label: 'Sans inversion', test: (m) => !m.inversion },
  { id: 'b4', emoji: '🏅', label: 'Interprétation exacte', test: (m) => !m.interpreter },
  { id: 'b-parfait', emoji: '💎', label: 'Maître du « sachant que »', test: (m) => Object.keys(m).length === 0 },
];

export default function Module06MissionFinaleSachantQue() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(6)} moduleNumber={6} lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : sachant que" moduleSubtitle="Dix épreuves sur les probabilités conditionnelles"
      estimatedTime="10 min" timerSeconds={600} timerLabel="10 min" xpPerCorrect={10}
      brief={{ tag: 'Mission finale', title: 'Dans quel univers calcules-tu ?', tone: 'amber', body: <p>Dix questions, une seule validation. Réflexe : repérer la condition, écrire son effectif au dénominateur, ne jamais retourner le conditionnement.</p> }}
      registre={[
        { id: 'r1', emoji: '🎯', label: 'P_A(B)', value: 'B sachant A' },
        { id: 'r2', emoji: '🔻', label: 'dénominateur', value: 'n(A)' },
        { id: 'r3', emoji: '↔️', label: 'inversion', value: 'P_A(B) ≠ P_B(A)' },
        { id: 'r4', emoji: '✖️', label: 'composées', value: 'P(A) × P_A(B)' },
      ]}
      skills={SKILLS} epreuves={EPREUVES} badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{ masterTitle: 'Maître du « sachant que » !', title: 'Mission accomplie', message: 'Tu sais restreindre l’univers, calculer et écrire P_A(B), composer deux probabilités, et tu ne retournes plus jamais une condition sans y penser.', verbs: ['Restreindre', 'Calculer', 'Distinguer', 'Interpréter'], masterBadgeLabel: 'Maître du « sachant que »' }} />
  );
}
