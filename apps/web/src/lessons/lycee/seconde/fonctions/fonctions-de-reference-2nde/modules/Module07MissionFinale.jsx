import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — ÉVALUATION (BossFinal, données uniquement). Distracteurs = les
 * erreurs rencontrées : 1/0 = 0 (M1), (−3)² = −9 / |−3| = −3 (M1), « le plus
 * grand a le plus grand carré » (M2), « 1/x décroissante sur ℝ* » (M3),
 * « x² toujours au-dessus de |x| » (M4), x² = 4 → une seule solution (M5),
 * doubler la vitesse divise par 4 (M6). Les 11 LPs sont couverts.
 */
const EPREUVES = [
  { id: 'fr-e1', skill: 'expressions', title: 'Trois entrées', prompt: 'Pour x = −3, que donnent x², 1/x et |x| ?', options: ['9, −1/3 et 3', '−9, −1/3 et −3', '9, 1/3 et 3', '9, −3 et 3'], cols: 1, explain: '(−3)² = 9 (jamais négatif), 1/(−3) = −1/3 (le signe de x), |−3| = 3 (une distance).', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-de-reference-2nde_P4'] } },
  { id: 'fr-e2', skill: 'expressions', title: 'Le tableau', prompt: 'Dans un tableau de valeurs de x ↦ 1/x, quelle colonne est impossible ?', options: ['x = 0', 'x = −1', 'x = 0,01', 'x = 1 000'], cols: 4, explain: '0 n’a pas d’image par la fonction inverse : on ne divise pas par zéro. Les autres donnent −1, 100 et 0,001.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-de-reference-2nde_P5', 'seconde_fonctions-de-reference-2nde_P3'] } },
  { id: 'fr-e3', skill: 'carre', title: 'Comparer des carrés', prompt: 'Sachant que −7 < −4, que peut-on dire de (−7)² et (−4)² ?', options: ['(−7)² > (−4)²', '(−7)² < (−4)²', '(−7)² = −(−4)²', 'On ne peut pas comparer'], cols: 2, explain: 'Sur ]−∞ ; 0], la fonction carré est décroissante : le plus petit des deux négatifs a le plus grand carré (49 > 16).', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-de-reference-2nde_P2', 'seconde_fonctions-de-reference-2nde_P7'] } },
  { id: 'fr-e4', skill: 'carre', title: 'La parabole', prompt: 'Laquelle de ces propriétés est FAUSSE pour la fonction carré ?', options: ['Elle est croissante sur ℝ', 'Sa courbe est symétrique par rapport à l’axe des ordonnées', 'Son minimum est 0, atteint en 0', 'x² ≥ 0 pour tout x'], cols: 1, explain: 'Elle est décroissante sur ]−∞ ; 0] puis croissante sur [0 ; +∞[ — pas croissante sur ℝ tout entier.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-de-reference-2nde_P2', 'seconde_fonctions-de-reference-2nde_P7'] } },
  { id: 'fr-e5', skill: 'inverse', title: 'L’hyperbole', prompt: 'On sait que −2 < 3. Que dire de 1/(−2) et 1/3 ?', options: ['1/(−2) < 1/3 : la fonction inverse n’est pas décroissante sur ℝ*', '1/(−2) > 1/3 : la fonction inverse est décroissante', '1/(−2) = 1/3', 'On ne peut pas comparer'], cols: 1, explain: '1/(−2) = −0,5 < 1/3 ≈ 0,33. Décroissante sur chaque branche (]−∞ ; 0[ et ]0 ; +∞[), mais pas d’une branche à l’autre.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-de-reference-2nde_P3', 'seconde_fonctions-de-reference-2nde_P7'] } },
  { id: 'fr-e6', skill: 'inverse', title: 'Près de zéro', prompt: 'Quand x se rapproche de 0 en restant positif, 1/x…', options: ['devient de plus en plus grand', 'se rapproche de 0', 'se rapproche de 1', 'devient négatif'], cols: 2, explain: '1/0,1 = 10, 1/0,01 = 100 : la branche droite de l’hyperbole file vers le haut sans jamais toucher l’axe.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-de-reference-2nde_P3'] } },
  { id: 'fr-e7', skill: 'va', title: 'Le V', prompt: 'Quelle courbe est faite de deux demi-droites qui se rejoignent en O ?', options: ['Celle de x ↦ |x|', 'Celle de x ↦ x²', 'Celle de x ↦ 1/x', 'Aucune des trois'], cols: 2, explain: '|x| = x pour x ≥ 0 et |x| = −x pour x ≤ 0 : deux demi-droites, un V, symétrique par rapport à (Oy), minimum 0 en 0.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-de-reference-2nde_P1', 'seconde_fonctions-de-reference-2nde_P6'] } },
  { id: 'fr-e8', skill: 'lecture', title: 'Antécédents', prompt: 'Combien de solutions ont x² = 9, |x| = 9 et 1/x = 9 ?', options: ['2, 2 et 1', '1, 1 et 1', '2, 1 et 1', '1, 2 et 0'], cols: 2, explain: 'x² = 9 : −3 et 3. |x| = 9 : −9 et 9. 1/x = 9 : 1/9 seulement. Sur les courbes : la droite y = 9 coupe la parabole et le V deux fois, l’hyperbole une fois.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-de-reference-2nde_P10', 'seconde_fonctions-de-reference-2nde_P9'] } },
  { id: 'fr-e9', skill: 'lecture', title: 'Qui est au-dessus ?', prompt: 'Pour x = 0,2, range x², |x| et 1/x du plus petit au plus grand.', options: ['x² < |x| < 1/x', '1/x < |x| < x²', '|x| < x² < 1/x', 'x² < 1/x < |x|'], cols: 1, explain: '0,2² = 0,04 ; |0,2| = 0,2 ; 1/0,2 = 5. Entre 0 et 1, le carré rapetisse et l’inverse agrandit. Au-delà de 1, l’ordre s’inverse.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-de-reference-2nde_P8', 'seconde_fonctions-de-reference-2nde_P9'] } },
  { id: 'fr-e10', skill: 'modeliser', title: 'Modéliser', prompt: 'Pour parcourir 200 km, la durée t (h) en fonction de la vitesse v (km/h) est t(v) = 200/v. Si la vitesse double, la durée…', options: ['est divisée par 2', 'est divisée par 4', 'double', 'ne change pas'], cols: 2, explain: '200/(2v) = (200/v)/2 : comme 1/x, doubler l’entrée divise la sortie par 2. Diviser par 4 serait le comportement de… 1/x² — pas au programme.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-de-reference-2nde_P11', 'seconde_fonctions-de-reference-2nde_P3'] } },
];
const SKILLS = {
  expressions: { label: 'Expressions et tableaux', module: 1 },
  carre: { label: 'La fonction carré', module: 2 },
  inverse: { label: 'La fonction inverse', module: 3 },
  va: { label: 'La fonction valeur absolue', module: 4 },
  lecture: { label: 'Lire et comparer les courbes', module: 5 },
  modeliser: { label: 'Modéliser', module: 6 },
};
const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Trois machines', test: (m) => !m.expressions },
  { id: 'b2', emoji: '🏅', label: 'La parabole', test: (m) => !m.carre },
  { id: 'b3', emoji: '🏅', label: 'L’hyperbole', test: (m) => !m.inverse },
  { id: 'b4', emoji: '🏅', label: 'Le V', test: (m) => !m.va },
  { id: 'b5', emoji: '🏅', label: 'Lecteur de courbes', test: (m) => !m.lecture },
  { id: 'b6', emoji: '🏅', label: 'Modélisateur', test: (m) => !m.modeliser },
  { id: 'b-parfait', emoji: '💎', label: 'Maître des trois courbes', test: (m) => Object.keys(m).length === 0 },
];
export default function Module07MissionFinale() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : les trois courbes" moduleSubtitle="Dix épreuves sur la parabole, l’hyperbole et le V" estimatedTime="15 min" timerSeconds={600} timerLabel="10 min" xpPerCorrect={10}
      brief={{ tag: 'Mission finale', title: 'Maître des trois courbes', tone: 'amber', body: <p>Dix questions, une seule validation. Pour chacune, dessine la courbe dans ta tête : parabole, hyperbole ou V ?</p> }}
      registre={[
        { id: 'r1', emoji: '∪', label: 'Carré', value: 'parabole' },
        { id: 'r2', emoji: '⟋', label: 'Inverse', value: 'hyperbole, ℝ*' },
        { id: 'r3', emoji: 'V', label: 'Valeur absolue', value: 'le V' },
        { id: 'r4', emoji: '⚖️', label: 'Sur ]0 ; 1[', value: 'x² < |x| < 1/x' },
      ]}
      skills={SKILLS} epreuves={EPREUVES} badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{ masterTitle: 'Maître des trois courbes !', title: 'Mission accomplie', message: 'La parabole, l’hyperbole et le V sont désormais des images mentales — avec leurs propriétés.', verbs: ['Calculer', 'Tracer', 'Lire', 'Comparer'], masterBadgeLabel: 'Maître des trois courbes' }} />
  );
}
