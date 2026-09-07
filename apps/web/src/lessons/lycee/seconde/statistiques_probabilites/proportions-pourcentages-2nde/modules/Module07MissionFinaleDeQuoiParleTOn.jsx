import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — ÉVALUATION. Les distracteurs encodent les erreurs réelles :
 * pourcentages emboîtés additionnés (e4), remises successives cumulées (e5),
 * points confondus avec pour cent (e6), taux divisé par la valeur d'arrivée
 * (e7), coefficient d'une baisse pris égal au taux (e8, e9), tout et partie
 * inversés (e2). Les 11 LPs sont couverts.
 */
const EPREUVES = [
  { id: 'pp-e1', skill: 'proportion', title: 'Calculer une part', prompt: 'Dans une classe de 32 élèves, 12 sont demi-pensionnaires. Quelle proportion cela représente-t-il ?', options: ['37,5 %', '12 %', '2,67 %', '20 %'], cols: 4, explain: '12 ÷ 32 = 0,375 = 37,5 %. Une proportion est le quotient de la part par le tout.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_proportions-pourcentages-2nde_P1', 'seconde_proportions-pourcentages-2nde_P4'] } },
  { id: 'pp-e2', skill: 'proportion', title: 'Remonter au tout', prompt: '84 élèves font de l’allemand, ce qui représente 24 % des élèves. Combien y a-t-il d’élèves en tout ?', options: ['350', '20', '108', '2 016'], cols: 4, explain: 'tout = partie ÷ p = 84 ÷ 0,24 = 350. On divise pour remonter à la référence ; 20 serait 84 × 0,24, une part de la part.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_proportions-pourcentages-2nde_P1'] } },
  { id: 'pp-e3', skill: 'ecritures', title: 'Trois écritures', prompt: 'Quelle est l’écriture décimale et fractionnaire de 6 % ?', options: ['0,06 = 6/100', '0,6 = 6/10', '6,0 = 6/1', '0,006 = 6/1000'], cols: 2, explain: '6 % signifie 6 pour cent, donc 6/100 = 0,06. Le pourcentage est une fraction de dénominateur 100.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_proportions-pourcentages-2nde_P2', 'seconde_proportions-pourcentages-2nde_P3'] } },
  { id: 'pp-e4', skill: 'emboite', title: 'Pourcentage de pourcentage', prompt: 'Dans un lycée, 45 % des élèves sont des filles, et 20 % de ces filles font du sport en compétition. Quelle part des élèves du lycée cela représente-t-il ?', options: ['9 %', '65 %', '25 %', '20 %'], cols: 4, explain: '0,45 × 0,20 = 0,09, soit 9 % du lycée. Les proportions emboîtées se multiplient ; 65 % serait leur somme, qui ne correspond à aucun groupe.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_proportions-pourcentages-2nde_P5'] } },
  { id: 'pp-e5', skill: 'emboite', title: 'À quel tout ?', prompt: 'Un article à 80 € subit une remise de 25 %, puis une seconde remise de 20 % sur le prix déjà réduit. Prix final ?', options: ['48 €', '44 €', '36 €', '60 €'], cols: 4, explain: '80 × 0,75 = 60, puis 60 × 0,80 = 48 €. La seconde remise porte sur 60 €, pas sur 80 € : −25 % puis −20 % ne fait pas −45 % (ce qui donnerait 44 €).', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_proportions-pourcentages-2nde_P6', 'seconde_proportions-pourcentages-2nde_P5'] } },
  { id: 'pp-e6', skill: 'etat-variation', title: 'Points ou pour cent', prompt: 'La part des boursiers passe de 15 % à 18 % des élèves. Que peut-on dire ?', options: ['+3 points, soit une hausse de 20 %', '+3 %, soit +3 points', 'une hausse de 3 %', 'une hausse de 18 %'], cols: 2, explain: '18 − 15 = 3 POINTS. En évolution relative : (18 − 15)/15 = 0,20, soit +20 %. Les deux nombres décrivent le même passage, mais ne se disent pas de la même façon.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_proportions-pourcentages-2nde_P7', 'seconde_proportions-pourcentages-2nde_P8'] } },
  { id: 'pp-e7', skill: 'etat-variation', title: 'Un taux d’évolution', prompt: 'Le nombre d’adhérents passe de 500 à 425. Quel est le taux d’évolution ?', options: ['−15 %', '−17,6 %', '−75 %', '+85 %'], cols: 4, explain: '(425 − 500)/500 = −75/500 = −0,15, soit −15 %. Diviser par 425 (la valeur d’arrivée) donnerait −17,6 % : le taux se rapporte toujours au DÉPART.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_proportions-pourcentages-2nde_P9', 'seconde_proportions-pourcentages-2nde_P7'] } },
  { id: 'pp-e8', skill: 'coefficient', title: 'Taux → coefficient', prompt: 'Une baisse de 15 % correspond à une multiplication par…', options: ['0,85', '0,15', '1,15', '−0,15'], cols: 4, explain: 'k = 1 + t = 1 − 0,15 = 0,85. Le coefficient dit ce qui RESTE (85 %) ; il est toujours positif.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_proportions-pourcentages-2nde_P11'] } },
  { id: 'pp-e9', skill: 'coefficient', title: 'Coefficient → taux', prompt: 'Une quantité est multipliée par 1,06. Quelle évolution ?', options: ['+6 %', '+106 %', '+1,06 %', '−6 %'], cols: 4, explain: 't = k − 1 = 0,06, soit +6 %. Multiplier par 1,06 ajoute 6 % ; multiplier par 2,06 ajouterait 106 %.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_proportions-pourcentages-2nde_P11', 'seconde_proportions-pourcentages-2nde_P10'] } },
  { id: 'pp-e10', skill: 'coefficient', title: 'Appliquer', prompt: 'Un abonnement de 240 € augmente de 7,5 %. Nouveau prix ?', options: ['258 €', '250 €', '258,50 €', '408 €'], cols: 4, explain: '240 × 1,075 = 258 €. L’augmentation vaut 240 × 0,075 = 18 € ; utiliser k = 1,75 (soit +75 %) donnerait 420 €.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_proportions-pourcentages-2nde_P10'] } },
];
const SKILLS = {
  proportion: { label: 'Calculer une proportion', module: 1 },
  ecritures: { label: 'Les trois écritures', module: 2 },
  emboite: { label: 'Pourcentage de pourcentage', module: 3 },
  'etat-variation': { label: 'État ou variation', module: 4 },
  coefficient: { label: 'Coefficient multiplicateur', module: 5 },
};
const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Part et tout', test: (m) => !m.proportion },
  { id: 'b2', emoji: '🏅', label: 'Trois écritures', test: (m) => !m.ecritures },
  { id: 'b3', emoji: '🏅', label: 'Parts emboîtées', test: (m) => !m.emboite },
  { id: 'b4', emoji: '🏅', label: 'Points ≠ pour cent', test: (m) => !m['etat-variation'] },
  { id: 'b5', emoji: '🏅', label: 'Le coefficient', test: (m) => !m.coefficient },
  { id: 'b-parfait', emoji: '💎', label: 'Lecteur de pourcentages', test: (m) => Object.keys(m).length === 0 },
];

export default function Module07MissionFinaleDeQuoiParleTOn() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : de quoi parle-t-on ?" moduleSubtitle="Dix épreuves sur les proportions et les évolutions"
      estimatedTime="5 min" timerSeconds={600} timerLabel="10 min" xpPerCorrect={10}
      brief={{ tag: 'Mission finale', title: 'Toujours la même question', tone: 'amber', body: <p>Dix questions, une seule validation. Réflexe : de quel tout parle-t-on ? Et ce « % » décrit-il un état ou une variation ?</p> }}
      registre={[
        { id: 'r1', emoji: '🔢', label: 'proportion', value: 'partie / tout' },
        { id: 'r2', emoji: '🧩', label: 'emboîtées', value: 'on multiplie' },
        { id: 'r3', emoji: '↔️', label: 'points', value: 'différence d’états' },
        { id: 'r4', emoji: '✖️', label: 'coefficient', value: 'k = 1 + t' },
      ]}
      skills={SKILLS} epreuves={EPREUVES} badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{ masterTitle: 'Lecteur de pourcentages !', title: 'Mission accomplie', message: 'Tu sais dire de quel tout parle un pourcentage, et distinguer un état d’une variation.', verbs: ['Rapporter', 'Emboîter', 'Distinguer', 'Multiplier'], masterBadgeLabel: 'Lecteur de pourcentages' }} />
  );
}
