import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — ÉVALUATION. Distracteurs : effectif d'une seule classe pris pour
 * un cumul (e4), hauteur confondue avec effectif sur amplitudes inégales
 * (e3), centres moyennés sans pondérer (e6), classe médiane prise avant le
 * franchissement de 50 % (e8), médiane assimilée au centre de sa classe (e9).
 * Les 10 LPs sont couverts.
 */
const EPREUVES = [
  { id: 'sr-e1', skill: 'regrouper', title: 'Pourquoi regrouper', prompt: 'On mesure au centième de seconde le temps de 300 coureurs. Pourquoi regrouper en classes ?', options: ['Parce que les valeurs sont presque toutes distinctes : un tableau d’effectifs classique n’apprendrait rien', 'Parce que le calcul de la moyenne devient exact', 'Parce que c’est obligatoire au-delà de 100 données', 'Parce que cela supprime les valeurs extrêmes'], cols: 1, requires: ['regroupement-classes', 'serie-statistique', 'effectif'], explain: 'Sur une variable continue mesurée finement, chaque valeur a un effectif de 1. Regrouper rend la distribution lisible — mais rend les indicateurs approchés, pas exacts.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_series-regroupees-classes-2nde_P1'] } },
  { id: 'sr-e2', skill: 'regrouper', title: 'Amplitude', prompt: 'Une série s’étend de 10 à 90 et l’on veut 8 classes de même amplitude. Quelle amplitude ?', options: ['10', '8', '80', '11,25'], cols: 4, requires: ['vocab-classe-amplitude', 'choix-amplitude'], explain: '(90 − 10) ÷ 8 = 10. L’étendue vaut 80, le nombre de classes 8.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_series-regroupees-classes-2nde_P2'] } },
  { id: 'sr-e3', skill: 'histogramme', title: 'La hauteur des barres', prompt: 'Dans un histogramme dont les classes ont des amplitudes INÉGALES, que représente la hauteur d’une barre ?', options: ['L’effectif divisé par l’amplitude — c’est l’AIRE qui donne l’effectif', 'L’effectif de la classe', 'La fréquence de la classe', 'Le centre de la classe'], cols: 1, requires: ['histogramme-aire', 'vocab-classe-amplitude'], explain: 'C’est l’aire qui porte l’effectif. Une classe deux fois plus large et de même effectif est deux fois plus basse.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_series-regroupees-classes-2nde_P3'] } },
  { id: 'sr-e4', skill: 'histogramme', title: 'Lire un histogramme', prompt: 'Classes [0;10[ : 12 ; [10;20[ : 30 ; [20;30[ : 45 ; [30;40] : 13. Combien d’individus en dessous de 20 ?', options: ['42', '30', '87', '12'], cols: 4, requires: ['lire-histogramme', 'frequences-cumulees'], explain: '12 + 30 = 42. On additionne les effectifs de toutes les classes situées avant 20 ; 30 n’est que celui de la seconde classe.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_series-regroupees-classes-2nde_P4'] } },
  { id: 'sr-e5', skill: 'cumul', title: 'Fréquences cumulées', prompt: 'Avec ces mêmes classes (total 100), quelle est la fréquence cumulée croissante à 30 ?', options: ['87 %', '45 %', '13 %', '100 %'], cols: 4, requires: ['frequences-cumulees', 'polygone-cumule'], explain: '(12 + 30 + 45) ÷ 100 = 87 %. Le cumul à 30 compte tout ce qui est en dessous de 30.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_series-regroupees-classes-2nde_P5'] } },
  { id: 'sr-e6', skill: 'moyenne', title: 'Moyenne pondérée', prompt: 'Trois classes de centres 5, 15 et 25, d’effectifs 5, 15 et 10. Moyenne estimée ?', options: ['16,67', '15', '45', '30'], cols: 4, requires: ['moyenne-estimee', 'moyenne-ponderee'], explain: '(5×5 + 15×15 + 10×25) ÷ 30 = 500 ÷ 30 ≈ 16,67. Faire (5 + 15 + 25) ÷ 3 = 15 revient à ignorer les effectifs.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_series-regroupees-classes-2nde_P6', 'seconde_series-regroupees-classes-2nde_P7'] } },
  { id: 'sr-e7', skill: 'moyenne', title: 'Estimation ou exact ?', prompt: 'La moyenne calculée à partir des centres de classes est…', options: ['une estimation, car la répartition à l’intérieur de chaque classe est inconnue', 'exacte, car tous les individus sont comptés', 'toujours supérieure à la moyenne réelle', 'exacte si les classes ont la même amplitude'], cols: 1, requires: ['mem-estimation', 'moyenne-estimee'], explain: 'Remplacer chaque individu par le centre de sa classe est une hypothèse. L’écart peut aller dans les deux sens, et l’égalité des amplitudes n’y change rien.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_series-regroupees-classes-2nde_P7'] } },
  { id: 'sr-e8', skill: 'mediane', title: 'La classe médiane', prompt: 'Fréquences cumulées : [0;10[ 12 % ; [10;20[ 42 % ; [20;30[ 87 % ; [30;40] 100 %. Quelle est la classe médiane ?', options: ['[20 ; 30[', '[10 ; 20[', '[30 ; 40]', '[0 ; 10['], cols: 4, requires: ['classe-mediane', 'frequences-cumulees'], explain: 'C’est la première classe dont la fréquence cumulée atteint 50 % : à 20 le cumul vaut 42 % (insuffisant), il passe à 87 % dans [20 ; 30[.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_series-regroupees-classes-2nde_P8'] } },
  { id: 'sr-e9', skill: 'mediane', title: 'Estimer la médiane', prompt: 'Classe médiane [20 ; 30[, cumul 42 individus avant elle, 45 dedans, total 100. Médiane estimée par interpolation ?', options: ['≈ 21,8', '25', '20', '30'], cols: 4, requires: ['mediane-interpolee', 'classe-mediane'], explain: '20 + ((50 − 42)/45) × 10 ≈ 21,8. Prendre 25 reviendrait à confondre la médiane avec le CENTRE de sa classe, ce qui n’est vrai que par hasard.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_series-regroupees-classes-2nde_P9'] } },
  { id: 'sr-e10', skill: 'interpreter', title: 'Ce que la série ne dit plus', prompt: 'À partir d’un tableau regroupé seul, laquelle de ces affirmations est légitime ?', options: ['« 42 % des individus sont en dessous de 20 »', '« La valeur la plus fréquente est 17 »', '« Aucun individu ne vaut exactement 25 »', '« La médiane vaut exactement 21,83 »'], cols: 1, requires: ['lire-honnetement', 'frequences-cumulees'], explain: 'Un cumul de classes est exact. En revanche, tout ce qui descend sous la classe — valeur la plus fréquente, existence d’une valeur, médiane au centième — est perdu par le regroupement.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_series-regroupees-classes-2nde_P10'] } },
];
const SKILLS = {
  regrouper: { label: 'Regrouper en classes', module: 1 },
  histogramme: { label: 'L’histogramme', module: 2 },
  cumul: { label: 'Les fréquences cumulées', module: 3 },
  moyenne: { label: 'Estimer la moyenne', module: 4 },
  mediane: { label: 'La classe médiane', module: 5 },
  interpreter: { label: 'Interpréter', module: 6 },
};
const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Le découpage', test: (m) => !m.regrouper },
  { id: 'b2', emoji: '🏅', label: 'L’aire, pas la hauteur', test: (m) => !m.histogramme },
  { id: 'b3', emoji: '🏅', label: 'Le cumul', test: (m) => !m.cumul },
  { id: 'b4', emoji: '🏅', label: 'L’estimation', test: (m) => !m.moyenne && !m.mediane },
  { id: 'b5', emoji: '🏅', label: 'La lecture honnête', test: (m) => !m.interpreter },
  { id: 'b-parfait', emoji: '💎', label: 'Maître de la borne', test: (m) => Object.keys(m).length === 0 },
];

export default function Module07MissionFinaleLaBorne() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : la borne" moduleSubtitle="Dix épreuves sur les séries regroupées"
      estimatedTime="5 min" timerSeconds={600} timerLabel="10 min" xpPerCorrect={10}
      brief={{ tag: 'Mission finale', title: 'Regrouper, lire, estimer', tone: 'amber', body: <p>Dix questions, une seule validation. Réflexe : vérifier les amplitudes, cumuler pour « en dessous de », et dire « estimée » quand la valeur l’est.</p> }}
      registre={[
        { id: 'r1', emoji: '📦', label: 'classe', value: '[a ; b[' },
        { id: 'r2', emoji: '📐', label: 'histogramme', value: 'l’aire = l’effectif' },
        { id: 'r3', emoji: '📈', label: 'cumul', value: '0 % → 100 %' },
        { id: 'r4', emoji: '≈', label: 'indicateurs', value: 'estimés' },
      ]}
      skills={SKILLS} epreuves={EPREUVES} badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{ masterTitle: 'Maître de la borne !', title: 'Mission accomplie', message: 'Tu regroupes une série continue, tu lis son histogramme sans te faire piéger, et tu estimes ses indicateurs en le disant.', verbs: ['Regrouper', 'Représenter', 'Cumuler', 'Estimer'], masterBadgeLabel: 'Maître de la borne' }} />
  );
}
