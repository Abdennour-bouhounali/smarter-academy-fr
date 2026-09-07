import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 6 — ÉVALUATION. Distracteurs : division par le total au lieu du
 * groupe de référence (e2, e6), inversion de la condition (e5, e10),
 * pourcentages de références différentes additionnés (e8), fréquence
 * confondue avec effectif (e9). Les 10 LPs sont couverts.
 */
const EPREUVES = [
  { id: 'fc-e1', skill: 'notions', requires: ['population-reference', 'mem-parmi', 'denominateur'], title: 'Reconnaître une conditionnelle', prompt: 'Laquelle de ces phrases annonce une fréquence CONDITIONNELLE ?', options: ['« Parmi les internes, 30 % font du sport »', '« 30 % des élèves sont internes »', '« 30 % des élèves sont internes ET sportifs »', '« Il y a 30 internes »'], cols: 1, explain: 'Le mot « parmi » désigne une population de référence autre que le total : c’est la signature d’une conditionnelle. La deuxième est marginale, la troisième conjointe.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_frequences-conditionnelles-2nde_P1'] } },
  { id: 'fc-e2', skill: 'notions', requires: ['trois-frequences', 'population-reference', 'quotient'], title: 'Calculer une conditionnelle', prompt: 'Sur 400 enquêtés dont 200 en 2de, 100 élèves de 2de prennent le bus. Quelle est la part du bus PARMI LES 2de ?', options: ['50 %', '25 %', '62,5 %', '100 %'], cols: 4, explain: '100 ÷ 200 = 50 %. Diviser par 400 donnerait 25 %, la fréquence conjointe — une autre question.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_frequences-conditionnelles-2nde_P2'] } },
  { id: 'fc-e3', skill: 'notions', requires: ['trois-frequences', 'quotient', 'pourcentage'], title: 'Fréquence marginale', prompt: 'Sur 400 enquêtés, 160 prennent le bus. La fréquence marginale du bus vaut…', options: ['40 %', '160 %', '25 %', '2,5 %'], cols: 4, explain: '160 ÷ 400 = 40 %. Une fréquence marginale se rapporte toujours à l’effectif TOTAL.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_frequences-conditionnelles-2nde_P3', 'seconde_frequences-conditionnelles-2nde_P4'] } },
  { id: 'fc-e4', skill: 'proprietes', requires: ['somme-conditionnelles', 'trois-frequences'], title: 'La somme qui vaut 1', prompt: 'Les fréquences conditionnelles des quatre modes de transport, calculées PARMI LES ÉLÈVES DE 2de, somment à…', options: ['100 %', 'un nombre variable', '25 %', '400 %'], cols: 4, explain: 'Elles répartissent tout le groupe de référence : chaque élève de 2de a exactement un mode de transport. La somme vaut donc 1.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_frequences-conditionnelles-2nde_P8'] } },
  { id: 'fc-e5', skill: 'inversion', requires: ['inversion-condition', 'mem-parmi'], title: 'Inverser la condition', prompt: '100 élèves sont à la fois en 2de et usagers du bus. Il y a 200 élèves de 2de et 160 usagers du bus. « Parmi les usagers du bus, la part des 2de » vaut…', options: ['62,5 %', '50 %', '25 %', '40 %'], cols: 4, explain: '100 ÷ 160 = 62,5 %. La condition « parmi les usagers du bus » impose 160 au dénominateur ; 50 % serait la part du bus parmi les 2de — l’autre question.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_frequences-conditionnelles-2nde_P6'] } },
  { id: 'fc-e6', skill: 'inversion', requires: ['inversion-condition', 'mem-parmi'], title: 'L’erreur d’inversion', prompt: '« 90 % des accidents graves impliquent une voiture » signifie-t-il que 90 % des trajets en voiture finissent en accident grave ?', options: ['Non : les deux phrases n’ont pas le même dénominateur', 'Oui, c’est équivalent', 'Oui si les voitures sont majoritaires', 'On ne peut pas trancher'], cols: 2, explain: 'La première divise par le nombre d’accidents, la seconde par le nombre de trajets — sans commune mesure. Inverser la condition change radicalement la valeur.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_frequences-conditionnelles-2nde_P6', 'seconde_frequences-conditionnelles-2nde_P10'] } },
  { id: 'fc-e7', skill: 'comparer', requires: ['comparer-sous-populations', 'population-reference'], title: 'Comparer deux groupes', prompt: 'En 2de, 20 élèves sur 200 viennent en voiture ; en terminale, 40 sur 80. Que conclure ?', options: ['La voiture est bien plus fréquente en terminale : 50 % contre 10 %', 'La voiture est deux fois plus fréquente en terminale', 'Les deux niveaux se valent', 'La voiture est plus fréquente en 2de'], cols: 1, explain: '20/200 = 10 % contre 40/80 = 50 % : cinq fois plus, et non deux fois comme le suggérerait la comparaison des effectifs bruts (20 contre 40).', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_frequences-conditionnelles-2nde_P7'] } },
  { id: 'fc-e8', skill: 'comparer', requires: ['somme-conditionnelles', 'frequences-vers-effectifs'], title: 'Ne pas additionner', prompt: 'Parmi 300 demi-pensionnaires, 25 % sont en association ; parmi 200 externes, 40 % le sont. Quelle proportion des 500 élèves est en association ?', options: ['31 %', '65 %', '32,5 %', '15 %'], cols: 4, explain: 'On repasse par les effectifs : 0,25 × 300 = 75 et 0,40 × 200 = 80, soit 155 sur 500 = 31 %. Additionner ou moyenner deux pourcentages de références différentes n’a pas de sens.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_frequences-conditionnelles-2nde_P9'] } },
  { id: 'fc-e9', skill: 'reconstruire', requires: ['frequences-vers-effectifs', 'methode-completer-tableau'], title: 'Des fréquences aux effectifs', prompt: 'Un lycée de 500 élèves compte 60 % de demi-pensionnaires. Parmi eux, 25 % sont en association. Combien d’élèves cela représente-t-il ?', options: ['75', '125', '300', '25'], cols: 4, explain: '0,60 × 500 = 300 demi-pensionnaires, puis 0,25 × 300 = 75. Appliquer les 25 % aux 500 élèves (125) reviendrait à ignorer la condition « parmi eux ».', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_frequences-conditionnelles-2nde_P9', 'seconde_frequences-conditionnelles-2nde_P5'] } },
  { id: 'fc-e10', skill: 'reconstruire', requires: ['methode-completer-tableau', 'inversion-condition', 'lire-un-article'], title: 'Compléter un tableau', prompt: 'Sur 400 lycéens, 160 garçons dont 96 en club sportif. Quelle est la part des garçons PARMI les 180 inscrits en club ?', options: ['≈ 53 %', '60 %', '24 %', '40 %'], cols: 4, explain: '96 ÷ 180 ≈ 53 %. Les 60 % correspondent à la part des inscrits parmi les garçons (96 ÷ 160) — la condition inverse.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_frequences-conditionnelles-2nde_P5', 'seconde_frequences-conditionnelles-2nde_P10'] } },
];
const SKILLS = {
  notions: { label: 'Les trois fréquences', module: 2 },
  proprietes: { label: 'Propriétés', module: 2 },
  inversion: { label: 'Inverser la condition', module: 3 },
  comparer: { label: 'Comparer des groupes', module: 3 },
  reconstruire: { label: 'Fréquences → effectifs', module: 4 },
};
const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Le bon dénominateur', test: (m) => !m.notions },
  { id: 'b2', emoji: '🏅', label: 'La somme à 1', test: (m) => !m.proprietes },
  { id: 'b3', emoji: '🏅', label: 'Pas d’inversion', test: (m) => !m.inversion },
  { id: 'b4', emoji: '🏅', label: 'Comparer juste', test: (m) => !m.comparer },
  { id: 'b5', emoji: '🏅', label: 'Reconstruire', test: (m) => !m.reconstruire },
  { id: 'b-parfait', emoji: '💎', label: 'Maître du dénominateur', test: (m) => Object.keys(m).length === 0 },
];

export default function Module06MissionFinaleLeDenominateur() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(6)} moduleNumber={6} lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le dénominateur" moduleSubtitle="Dix épreuves sur les fréquences conditionnelles"
      estimatedTime="10 min" timerSeconds={600} timerLabel="10 min" xpPerCorrect={10}
      brief={{ tag: 'Mission finale', title: 'Par quoi divise-t-on ?', tone: 'amber', body: <p>Dix questions, une seule validation. Réflexe : repérer le mot « parmi », identifier le groupe de référence, diviser par SON effectif.</p> }}
      registre={[
        { id: 'r1', emoji: '🌍', label: 'marginale', value: '÷ total' },
        { id: 'r2', emoji: '🔗', label: 'conjointe', value: 'case ÷ total' },
        { id: 'r3', emoji: '🎯', label: 'conditionnelle', value: 'case ÷ référence' },
        { id: 'r4', emoji: '↔️', label: 'inversion', value: 'change la question' },
      ]}
      skills={SKILLS} epreuves={EPREUVES} badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{ masterTitle: 'Maître du dénominateur !', title: 'Mission accomplie', message: 'Tu sais toujours par quoi diviser, tu ne confonds plus les deux sens d’une condition, et tu reconstruis un tableau à partir de pourcentages.', verbs: ['Diviser', 'Nommer', 'Comparer', 'Reconstruire'], masterBadgeLabel: 'Maître du dénominateur' }} />
  );
}
