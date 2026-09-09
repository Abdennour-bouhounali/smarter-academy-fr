import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import RealLine from '../../../../../common/components/RealLine';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 6 — Boss Final « Le phare » (kit, QCM). DONNÉES.
 * Distracteurs = pièges des modules 1–6 : |−7| = −7 (M1, M2) · −x négatif (M2) ·
 * distance = grand − petit sans signe (M3) · un seul côté du faisceau (M4) ·
 * centre = borne gauche (M4, M5) · |x + 2| centré en 2 (M5) · strict/large (M4) ·
 * une seule solution (M5, M6).
 * Couverture : P1 → e1, e2 · P2 → e2, e3 · P3 → e4, e5 · P4 → e8, e9, e10 · P5 → e6, e7, e8.
 */
const REGISTRE = [
  { id: 'phare', emoji: '🗼', label: 'Phare', value: '|x|' },
  { id: 'ecart', emoji: '⛵', label: 'Écart', value: '|b − a|' },
  { id: 'faisceau', emoji: '🔦', label: 'Faisceau', value: '[a − r ; a + r]' },
  { id: 'bords', emoji: '✂️', label: 'Bords', value: 'a ± r' },
];
const SKILLS = {
  distance0: { label: 'Distance à zéro', module: 1 },
  calcul: { label: 'Calculer |x|', module: 2 },
  ecart: { label: 'Distance entre deux nombres', module: 3 },
  faisceau: { label: 'Faisceau et intervalle', module: 4 },
  situations: { label: 'Situations', module: 5 },
};
const line = (props) => <div className="rounded-2xl border border-slate-200 bg-white p-1"><RealLine {...props} /></div>;
/**
 * Les quatre candidats de va-e11 sont DESSINÉS : la compétence « représenter
 * graphiquement l'ensemble des solutions » (P7) ne peut pas se mesurer par un
 * QCM textuel — l'élève doit choisir une FIGURE, bornes comprises.
 */
const SOL_SETS = {
  '[1 ; 7]': { from: 1, to: 7, aria: 'De 1 inclus à 7 inclus' },
  '[−3 ; 3]': { from: -3, to: 3, aria: 'De −3 inclus à 3 inclus' },
  ']1 ; 7[': { from: 1, to: 7, openFrom: true, openTo: true, aria: 'De 1 exclu à 7 exclu' },
  '[0 ; 6]': { from: 0, to: 6, aria: 'De 0 inclus à 6 inclus' },
};
const solSet = (opt) => {
  const g = SOL_SETS[opt];
  if (!g) return opt;
  return (
    <span className="flex flex-col gap-1">
      <span className="font-mono font-bold">{opt}</span>
      <span className="rounded-xl border border-slate-200 bg-white p-1">
        <RealLine min={-4} max={9} step={1} intervals={[{ id: 'S', ...g, tone: 'emerald' }]} ariaLabel={g.aria} />
      </span>
    </span>
  );
};

const EPREUVES = [
  { id: 'va-e1', skill: 'distance0', requires: ['valeur-absolue-distance-zero', 'regle-opposes-meme-distance', 'mem-valeur-absolue-positive'], title: 'Épreuve 1', prompt: 'Deux bateaux sont aux kilomètres −6 et 6 ; le phare est au km 0. Lequel est le plus loin du phare ?', options: ['Ils sont à la même distance : 6 km', 'Celui du km −6, car −6 < 6', 'Celui du km 6, car 6 > −6', 'On ne peut pas savoir'], cols: 1, correct: 0, explain: '|−6| = |6| = 6 : un nombre et son opposé sont à la même distance de 0. La distance est une longueur, elle ne regarde pas le sens.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_valeur-absolue-distance-2nde_P1'] } },
  { id: 'va-e2', skill: 'calcul', requires: ['regle-calcul-valeur-absolue', 'nombres-relatifs'], title: 'Épreuve 2', prompt: 'Combien vaut |−7,5| ?', options: ['7,5', '−7,5', '0', '7'], cols: 4, correct: 0, explain: '|−7,5| est la distance de −7,5 à 0 : 7,5. La règle : x < 0 → |x| = −x = −(−7,5) = 7,5.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_valeur-absolue-distance-2nde_P2', 'seconde_valeur-absolue-distance-2nde_P1'] } },
  { id: 'va-e3', skill: 'calcul', requires: ['methode-calculer-expression-absolue', 'regle-calcul-valeur-absolue'], title: 'Épreuve 3', prompt: 'Si x = −4, combien vaut −|x| ?', options: ['−4', '4', '0', '−8'], cols: 4, correct: 0, explain: '|−4| = 4, puis l’opposé : −4. Le signe − devant les barres s’applique APRÈS la valeur absolue.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_valeur-absolue-distance-2nde_P2'] } },
  { id: 'va-e4', skill: 'ecart', requires: ['distance-deux-nombres', 'mem-distance'], title: 'Épreuve 4', prompt: 'Quelle est la distance entre −4 et 6 ?', options: ['10', '2', '−10', '24'], cols: 4, correct: 0, explain: '|6 − (−4)| = |10| = 10. « 6 − 4 = 2 » oublie le signe de −4 ; une distance n’est jamais négative.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_valeur-absolue-distance-2nde_P3'] } },
  { id: 'va-e5', skill: 'ecart', requires: ['mem-distance', 'distance-deux-nombres'], title: 'Épreuve 5', prompt: 'Laquelle de ces expressions donne la distance entre a et b ?', options: ['|a − b|', 'a − b', 'b − a', '|a| − |b|'], cols: 4, correct: 0, explain: '|a − b| = |b − a| est toujours positif et symétrique. a − b peut être négatif ; |a| − |b| compare les distances à 0, pas la distance entre a et b (pour a = −3, b = 3 : 0 au lieu de 6).', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_valeur-absolue-distance-2nde_P3'] } },
  { id: 'va-e6', skill: 'faisceau', requires: ['faisceau-intervalle', 'mem-faisceau', 'intervalle-crochets'], title: 'Épreuve 6', prompt: 'Quel est l’ensemble des x tels que |x − 1| ≤ 4 ?', extra: line({ min: -6, max: 8, step: 1, points: [{ id: 'a', value: 1, label: 'a = 1', tone: 'amber' }], ariaLabel: 'Droite de −6 à 8 avec le centre 1' }), options: ['[−3 ; 5]', ']−∞ ; 5]', '[1 ; 5]', ']−3 ; 5['], cols: 2, correct: 0, explain: 'Faisceau centré en 1, rayon 4 : de 1 − 4 = −3 à 1 + 4 = 5, bords inclus (≤). ]−∞ ; 5] oublie le bord gauche, [1 ; 5] un côté entier.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_valeur-absolue-distance-2nde_P5'] } },
  { id: 'va-e7', skill: 'faisceau', requires: ['methode-centre-rayon', 'mem-faisceau', 'intervalle-crochets'], title: 'Épreuve 7', prompt: 'Quelle inégalité décrit l’intervalle ]−7 ; −1[ ?', options: ['|x + 4| < 3', '|x − 4| < 3', '|x + 7| < 6', '|x + 4| ≤ 3'], cols: 2, correct: 0, explain: 'Centre = (−7 + (−1)) ÷ 2 = −4, rayon 3, crochets ouverts → strict : |x − (−4)| < 3, soit |x + 4| < 3.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_valeur-absolue-distance-2nde_P5'] } },
  { id: 'va-e8', skill: 'situations', requires: ['methode-tolerance', 'faisceau-intervalle'], title: 'Épreuve 8', prompt: 'Une pièce doit mesurer 50 mm à 0,2 mm près. Quelles longueurs L sont acceptées ?', options: ['[49,8 ; 50,2]', '[50 ; 50,2]', ']49,8 ; 50,2[', '[49,8 ; 50]'], cols: 2, correct: 0, explain: '|L − 50| ≤ 0,2 : centre 50, rayon 0,2, bords inclus. La tolérance joue des deux côtés.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_valeur-absolue-distance-2nde_P4', 'seconde_valeur-absolue-distance-2nde_P5'] } },
  { id: 'va-e9', skill: 'situations', requires: ['methode-tolerance', 'methode-centre-rayon'], title: 'Épreuve 9', prompt: 'Un thermostat maintient la température entre 18 °C et 22 °C inclus. Quelle écriture en valeur absolue convient ?', options: ['|T − 20| ≤ 2', '|T − 18| ≤ 22', '|T − 20| < 2', '|T − 2| ≤ 20'], cols: 2, correct: 0, explain: 'Centre 20 (milieu de 18 et 22), rayon 2, bornes incluses : |T − 20| ≤ 2.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_valeur-absolue-distance-2nde_P4'] } },
  { id: 'va-e10', skill: 'situations', requires: ['regle-deux-positions', 'equation-distance-egale'], title: 'Épreuve 10', prompt: 'Un cycliste est exactement à 5 km de la borne 3. Où peut-il être ?', options: ['À la borne −2 ou à la borne 8', 'À la borne 8 seulement', 'À la borne 5 ou à la borne −5', 'À la borne 2'], cols: 2, correct: 0, explain: '|x − 3| = 5 ⇔ x = 3 − 5 = −2 ou x = 3 + 5 = 8 : deux positions, de part et d’autre de la borne 3.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_valeur-absolue-distance-2nde_P4'] } },
  { id: 'va-e11', skill: 'faisceau', requires: ['methode-centre-rayon', 'faisceau-intervalle'], title: 'Épreuve 11', prompt: 'Résous |x − 4| ≤ 3 : quel est l’ensemble des solutions ?', options: ['[1 ; 7]', '[−3 ; 3]', ']1 ; 7[', '[0 ; 6]'], renderOption: solSet, optionLabel: (i) => ['[1 ; 7]', '[−3 ; 3]', ']1 ; 7[', '[0 ; 6]'][i], cols: 2, correct: 0, explain: 'Centre 4, rayon 3 : les x dont la distance à 4 vaut au plus 3, donc de 4 − 3 = 1 à 4 + 3 = 7. L’inégalité est LARGE (≤), donc les deux bornes sont incluses : [1 ; 7]. Oublier le centre donne [−3 ; 3], et des crochets ouverts trahiraient une inégalité stricte.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_valeur-absolue-distance-2nde_P6', 'seconde_valeur-absolue-distance-2nde_P7'] } },
];
const BADGES = [
  { id: 'b-dist', emoji: '🗼', label: 'Distance à zéro sans faute', test: (m) => !m.distance0 && !m.calcul },
  { id: 'b-ecart', emoji: '⛵', label: 'Écarts sans faute', test: (m) => !m.ecart },
  { id: 'b-faisceau', emoji: '🔦', label: 'Faisceaux sans faute', test: (m) => !m.faisceau },
  { id: 'b-situ', emoji: '🔧', label: 'Situations sans faute', test: (m) => !m.situations },
  { id: 'b-perfect', emoji: '💎', label: 'Dix sur dix', test: (m) => Object.values(m).every((v) => !v) },
];
export default function Module06MissionFinale() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(6)} moduleNumber={6}
      moduleTitle="🏆 Mission finale : le phare" moduleSubtitle="Dix épreuves pour prouver qu’aucune distance ne te trompe." estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG} timerSeconds={600} timerLabel="10 min" xpPerCorrect={10}
      brief={{ tag: '🏆 Boss final', title: 'Le gardien du phare te confie sa côte.', body: <p>Dix questions, aucune aide, une seule validation à la fin.</p> }}
      registre={REGISTRE} skills={SKILLS} epreuves={EPREUVES} badges={BADGES} synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{ masterTitle: 'Gardien du phare', title: 'Leçon terminée', message: 'Tu sais lire |x| comme une distance, calculer un écart, et transformer un faisceau en intervalle — et réciproquement.', verbs: ['Mesurer', 'Calculer', 'Encadrer', 'Résoudre'], masterBadgeLabel: 'Tous les badges débloqués' }} />
  );
}
