import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/** Module 7 — ÉVALUATION. Distracteurs = signe de x pour signe de f(x) (M1), zéro = ordonnée (M2), zéro en −b/a mal calculé / signe de a oublié (M3), double barre lue comme 0 (M4), bornes incluses à tort (M5). 12 LPs couverts. */
const EPREUVES = [
  { id: 'sg-e1', skill: 'signe', title: 'Sur la courbe', prompt: 'Le point de la courbe de f d’abscisse −2 est au-dessus de l’axe des abscisses. Alors…', options: ['f(−2) > 0', 'f(−2) < 0, car −2 est négatif', 'f(−2) = 0', '−2 est un zéro de f'], cols: 2, explain: 'Au-dessus de l’axe, l’ordonnée f(−2) est positive. Le signe de l’abscisse ne compte pas.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_signe-fonctions-2nde_P1', 'seconde_signe-fonctions-2nde_P2'] } },
  { id: 'sg-e2', skill: 'signe', title: 'Les zéros', prompt: 'La courbe de g coupe l’axe des abscisses aux points (−1 ; 0) et (3 ; 0). Les zéros de g sont…', options: ['−1 et 3', '0 seulement', '(−1 ; 0) et (3 ; 0)', '−1, 0 et 3'], cols: 2, explain: 'Un zéro est une abscisse où g(x) = 0 : −1 et 3. Ce sont des nombres, pas des points.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_signe-fonctions-2nde_P3', 'seconde_signe-fonctions-2nde_P2'] } },
  { id: 'sg-e3', skill: 'tableau', title: 'Lire un tableau', prompt: 'Le tableau de signes de h : + sur ]−∞ ; 2[, 0 en 2, − sur ]2 ; 5[, 0 en 5, + sur ]5 ; +∞[. Signe de h(3) ?', options: ['négatif', 'positif', 'nul', 'impossible à dire'], cols: 4, explain: '3 ∈ ]2 ; 5[ : la case est −.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_signe-fonctions-2nde_P4', 'seconde_signe-fonctions-2nde_P1'] } },
  { id: 'sg-e4', skill: 'tableau', title: 'Construire', prompt: 'Une fonction continue a pour seuls zéros −4 et 1, avec f(0) < 0 et f(2) > 0. Son signe sur ]−∞ ; −4[ est…', options: ['positif', 'négatif', 'nul', 'impossible à dire'], cols: 4, explain: 'Le signe change à chaque zéro : ]−4 ; 1[ est −, donc ]−∞ ; −4[ est + (et ]1 ; +∞[ est +, cohérent avec f(2) > 0).', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_signe-fonctions-2nde_P4', 'seconde_signe-fonctions-2nde_P3'] } },
  { id: 'sg-e5', skill: 'affine', title: 'Fonction affine', prompt: 'Tableau de signes de f(x) = −2x + 8 ?', options: ['+ avant 4, 0 en 4, − après 4', '− avant 4, 0 en 4, + après 4', '+ avant −4, 0 en −4, − après −4', '− partout : −2 est négatif'], cols: 1, explain: 'Zéro : −2x + 8 = 0 ⟺ x = 4. a = −2 < 0 : signe − à droite du zéro, + à gauche.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_signe-fonctions-2nde_P5', 'seconde_signe-fonctions-2nde_P9'] } },
  { id: 'sg-e6', skill: 'produit', title: 'Un produit', prompt: 'Signe de (x + 5)(x − 2) pour x = 0 ?', options: ['négatif', 'positif', 'nul', 'n’existe pas'], cols: 4, explain: '(0 + 5) > 0 et (0 − 2) < 0 : signes contraires, produit négatif. Sur le tableau, 0 ∈ ]−5 ; 2[, case −.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_signe-fonctions-2nde_P6'] } },
  { id: 'sg-e7', skill: 'produit', title: 'Un quotient', prompt: 'Dans le tableau de signes de (x + 3)/(x − 4), la colonne x = 4 contient…', options: ['une double barre : 4 est une valeur interdite', 'un 0 : 4 est un zéro', 'le signe +', 'rien'], cols: 1, explain: 'Le dénominateur s’annule en 4 : le quotient n’existe pas, double barre. Le zéro du quotient est −3 (numérateur).', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_signe-fonctions-2nde_P7', 'seconde_signe-fonctions-2nde_P4'] } },
  { id: 'sg-e8', skill: 'resoudre', title: 'f(x) > 0', prompt: 'Solutions de (x − 2)(x + 1) > 0 ?', options: [']−∞ ; −1[ ∪ ]2 ; +∞[', ']−1 ; 2[', '[−1 ; 2]', ']2 ; +∞['], cols: 2, explain: 'Zéros −1 et 2, tableau + − + : les cases + sont avant −1 et après 2, bornes exclues.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_signe-fonctions-2nde_P8', 'seconde_signe-fonctions-2nde_P10'] } },
  { id: 'sg-e9', skill: 'resoudre', title: 'f(x) ≤ 0', prompt: 'Solutions de (x − 2)(x + 1) ≤ 0 ?', options: ['[−1 ; 2]', ']−1 ; 2[', ']−∞ ; −1] ∪ [2 ; +∞[', '{−1 ; 2}'], cols: 2, explain: 'La case − est ]−1 ; 2[ ; « ou égal » ajoute les zéros : [−1 ; 2].', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_signe-fonctions-2nde_P8', 'seconde_signe-fonctions-2nde_P11', 'seconde_signe-fonctions-2nde_P9'] } },
  { id: 'sg-e10', skill: 'resoudre', title: 'Vérifier graphiquement', prompt: 'On a trouvé que f(x) < 0 sur ]1 ; 4[. Sur la courbe de f, cela doit se voir ainsi :', options: ['La courbe est sous l’axe des abscisses entre 1 et 4, et le coupe en 1 et 4', 'La courbe descend entre 1 et 4', 'La courbe est à gauche de l’axe des ordonnées', 'La courbe est sous l’axe pour tout x'], cols: 1, explain: 'f(x) < 0 ⟺ point sous l’axe des abscisses. Descendre (variations) n’est pas être négatif (signe).', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_signe-fonctions-2nde_P12', 'seconde_signe-fonctions-2nde_P11', 'seconde_signe-fonctions-2nde_P2'] } },
];
const SKILLS = { signe: { label: 'Signe et zéros sur la courbe', module: 1 }, tableau: { label: 'Tableau de signes', module: 2 }, affine: { label: 'Fonction affine', module: 3 }, produit: { label: 'Produit et quotient', module: 4 }, resoudre: { label: 'Résoudre et vérifier', module: 5 } };
const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Au-dessus, en dessous', test: (m) => !m.signe },
  { id: 'b2', emoji: '🏅', label: 'Le tableau', test: (m) => !m.tableau },
  { id: 'b3', emoji: '🏅', label: 'Signe de a', test: (m) => !m.affine },
  { id: 'b4', emoji: '🏅', label: 'Règle des signes', test: (m) => !m.produit },
  { id: 'b5', emoji: '🏅', label: 'Solutions en intervalles', test: (m) => !m.resoudre },
  { id: 'b-parfait', emoji: '💎', label: 'Maître du signe', test: (m) => Object.keys(m).length === 0 },
];
export default function Module07MissionFinale() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le signe" moduleSubtitle="Dix épreuves : positif, négatif, nul — et le prouver" estimatedTime="15 min" timerSeconds={600} timerLabel="10 min" xpPerCorrect={10}
      brief={{ tag: 'Mission finale', title: 'Maître du signe', tone: 'amber', body: <p>Dix questions, une seule validation. Réflexe : les zéros d’abord, puis un signe par intervalle, puis lire.</p> }}
      registre={[{ id: 'r1', emoji: '＋', label: 'f(x) > 0', value: 'au-dessus' }, { id: 'r2', emoji: '０', label: 'zéro', value: 'f(x) = 0' }, { id: 'r3', emoji: '📐', label: 'ax + b', value: 'signe de a à droite' }, { id: 'r4', emoji: '‖', label: 'quotient', value: 'valeur interdite' }]}
      skills={SKILLS} epreuves={EPREUVES} badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{ masterTitle: 'Maître du signe !', title: 'Mission accomplie', message: 'Tu sais où une fonction est positive, négative, nulle — et t’en servir pour résoudre.', verbs: ['Lire', 'Construire', 'Résoudre', 'Vérifier'], masterBadgeLabel: 'Maître du signe' }} />
  );
}
