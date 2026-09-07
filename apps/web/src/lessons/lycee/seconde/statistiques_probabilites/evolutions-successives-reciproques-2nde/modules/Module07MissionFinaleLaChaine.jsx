import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — ÉVALUATION. Les distracteurs encodent les erreurs réelles :
 * taux additionnés (e1, e3, e5), compensation supposée exacte (e2), taux
 * réciproque pris comme l'opposé (e6, e7), remontée par multiplication au
 * lieu de division (e8, e9). Les 8 LPs sont couverts.
 */
const EPREUVES = [
  { id: 'ev-e1', skill: 'composer', requires: ['coefficient-global', 'methode-composer', 'pourcentage'], title: 'Deux hausses', prompt: 'Un prix augmente de 10 %, puis de 20 %. Quel est le coefficient global ?', options: ['1,32', '1,30', '1,02', '0,32'], cols: 4, explain: '1,10 × 1,20 = 1,32. Additionner les taux donnerait 1,30, qui ne décrit pas la chaîne.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_evolutions-successives-reciproques-2nde_P2'] } },
  { id: 'ev-e2', skill: 'composer', requires: ['coefficient-global', 'methode-composer', 'base-mouvante', 'mem-ne-sannule-pas', 'pourcentage'], title: 'Hausse puis baisse', prompt: 'Un article à 250 € augmente de 20 % puis baisse de 20 %. Prix final ?', options: ['240 €', '250 €', '260 €', '210 €'], cols: 4, explain: '250 × 1,20 × 0,80 = 250 × 0,96 = 240 €. La baisse porte sur 300 € et retire 60 €, quand la hausse n’avait ajouté que 50 €.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_evolutions-successives-reciproques-2nde_P1', 'seconde_evolutions-successives-reciproques-2nde_P4'] } },
  { id: 'ev-e3', skill: 'global', requires: ['coefficient-global', 'taux-global', 'somme-jamais', 'pourcentage'], title: 'Le taux global', prompt: 'Une quantité subit +15 % puis −10 %. Quel est le taux d’évolution global ?', options: ['+3,5 %', '+5 %', '+25 %', '−1,5 %'], cols: 4, explain: '1,15 × 0,90 = 1,035, donc t = +3,5 %. La somme des taux (+5 %) est fausse.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_evolutions-successives-reciproques-2nde_P3'] } },
  { id: 'ev-e4', skill: 'global', requires: ['coefficient-global', 'taux-global', 'somme-jamais', 'pourcentage'], title: 'Deux baisses', prompt: 'Deux baisses successives de 30 % correspondent à une baisse globale de…', options: ['51 %', '60 %', '9 %', '70 %'], cols: 4, explain: '0,70 × 0,70 = 0,49 : il reste 49 %, donc la baisse est de 51 %. Deux baisses successives n’atteignent jamais −100 %.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_evolutions-successives-reciproques-2nde_P3', 'seconde_evolutions-successives-reciproques-2nde_P4'] } },
  { id: 'ev-e5', skill: 'global', requires: ['coefficient-global', 'methode-composer', 'somme-jamais', 'arrondi'], title: 'Trois évolutions', prompt: 'Un loyer subit +2 %, puis +3 %, puis −1 %. Le coefficient global est le plus proche de…', options: ['1,0400', '1,0000', '1,0600', '0,9600'], cols: 4, explain: '1,02 × 1,03 × 0,99 = 1,04009…, soit environ +4,0 %. La somme des taux (+4 %) est ici très proche, parce que les taux sont petits — mais ce n’est pas la même chose.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_evolutions-successives-reciproques-2nde_P2', 'seconde_evolutions-successives-reciproques-2nde_P3'] } },
  { id: 'ev-e6', skill: 'reciproque', requires: ['evolution-reciproque', 'formule-taux-reciproque', 'mem-inverse-pas-oppose', 'pourcentage'], title: 'Annuler une hausse', prompt: 'Quel taux annule exactement une hausse de 25 % ?', options: ['−20 %', '−25 %', '−75 %', '−12,5 %'], cols: 4, explain: 'k = 1,25 et k’ = 1 ÷ 1,25 = 0,80, soit −20 %. Une baisse de 25 % donnerait 1,25 × 0,75 = 0,9375, pas 1.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_evolutions-successives-reciproques-2nde_P5'] } },
  { id: 'ev-e7', skill: 'reciproque', requires: ['evolution-reciproque', 'formule-taux-reciproque', 'mem-inverse-pas-oppose', 'pourcentage'], title: 'Le coefficient réciproque', prompt: 'Une quantité est multipliée par 0,8. Quel coefficient la ramène à sa valeur de départ ?', options: ['1,25', '1,2', '0,2', '−0,8'], cols: 4, explain: 'k’ = 1 ÷ 0,8 = 1,25, soit une hausse de 25 %. Multiplier par 1,2 donnerait 0,8 × 1,2 = 0,96, pas 1.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_evolutions-successives-reciproques-2nde_P6'] } },
  { id: 'ev-e8', skill: 'remonter', requires: ['retrouver-valeur-initiale', 'methode-choisir-operation', 'verification-systematique', 'quotient'], title: 'Avant la remise', prompt: 'Après une remise de 25 %, un article coûte 45 €. Quel était son prix initial ?', options: ['60 €', '56,25 €', '70 €', '36 €'], cols: 4, explain: '45 ÷ 0,75 = 60 €. Vérification : 60 × 0,75 = 45 ✓. Ajouter 25 % à 45 donnerait 56,25 €, ce qui est faux.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_evolutions-successives-reciproques-2nde_P8'] } },
  { id: 'ev-e9', skill: 'remonter', requires: ['retrouver-valeur-initiale', 'coefficient-global', 'evolution-reciproque', 'methode-choisir-operation'], title: 'Remonter deux évolutions', prompt: 'Une population a subi +25 % puis −20 %, et compte aujourd’hui 5 000 habitants. Combien en comptait-elle au départ ?', options: ['5 000', '4 000', '6 250', '5 500'], cols: 4, explain: 'k global = 1,25 × 0,80 = 1 : la population est revenue exactement à son niveau initial, soit 5 000 habitants. C’est précisément le cas des évolutions réciproques.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_evolutions-successives-reciproques-2nde_P8', 'seconde_evolutions-successives-reciproques-2nde_P5'] } },
  { id: 'ev-e10', skill: 'interpreter', requires: ['coefficient-global', 'taux-global', 'somme-jamais', 'mem-ne-sannule-pas', 'pourcentage'], title: 'Interpréter', prompt: 'Un journal titre : « le chiffre d’affaires a baissé de 10 % en 2024 après une hausse de 10 % en 2023 ». Que peut-on en conclure ?', options: [
      'Le chiffre d’affaires de fin 2024 est inférieur de 1 % à celui de début 2023',
      'Le chiffre d’affaires est revenu à son niveau de début 2023',
      'Le chiffre d’affaires a augmenté de 1 %',
      'On ne peut rien conclure sans connaître les montants',
    ], cols: 1, explain: '1,10 × 0,90 = 0,99 : il manque 1 %. Le raisonnement ne dépend pas des montants, seulement des coefficients — c’est ce qui permet de conclure sans chiffre absolu.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_evolutions-successives-reciproques-2nde_P7', 'seconde_evolutions-successives-reciproques-2nde_P4'] } },
];
const SKILLS = {
  composer: { label: 'Composer les coefficients', module: 2 },
  global: { label: 'Le taux global', module: 3 },
  reciproque: { label: 'L’évolution réciproque', module: 4 },
  remonter: { label: 'Retrouver la valeur initiale', module: 5 },
  interpreter: { label: 'Interpréter une évolution', module: 6 },
};
const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Le produit', test: (m) => !m.composer },
  { id: 'b2', emoji: '🏅', label: 'Le taux global', test: (m) => !m.global },
  { id: 'b3', emoji: '🏅', label: 'Le retour', test: (m) => !m.reciproque },
  { id: 'b4', emoji: '🏅', label: 'La remontée', test: (m) => !m.remonter },
  { id: 'b5', emoji: '🏅', label: 'La lecture juste', test: (m) => !m.interpreter },
  { id: 'b-parfait', emoji: '💎', label: 'Maître de la chaîne', test: (m) => Object.keys(m).length === 0 },
];

export default function Module07MissionFinaleLaChaine() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : la chaîne" moduleSubtitle="Dix épreuves sur les évolutions successives et réciproques"
      estimatedTime="5 min" timerSeconds={600} timerLabel="10 min" xpPerCorrect={10}
      brief={{ tag: 'Mission finale', title: 'Composer, inverser, remonter', tone: 'amber', body: <p>Dix questions, une seule validation. Réflexe : les taux ne s’additionnent pas — on multiplie les coefficients, on prend l’inverse pour revenir, on divise pour remonter.</p> }}
      registre={[
        { id: 'r1', emoji: '✖️', label: 'enchaîner', value: 'k₁ × k₂' },
        { id: 'r2', emoji: '📊', label: 'taux global', value: 'k − 1' },
        { id: 'r3', emoji: '↩️', label: 'annuler', value: 'k’ = 1/k' },
        { id: 'r4', emoji: '⬅️', label: 'remonter', value: 'V_f ÷ k' },
      ]}
      skills={SKILLS} epreuves={EPREUVES} badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{ masterTitle: 'Maître de la chaîne !', title: 'Mission accomplie', message: 'Tu composes, tu inverses et tu remontes une chaîne d’évolutions sans jamais additionner les taux.', verbs: ['Composer', 'Calculer', 'Inverser', 'Remonter'], masterBadgeLabel: 'Maître de la chaîne' }} />
  );
}
