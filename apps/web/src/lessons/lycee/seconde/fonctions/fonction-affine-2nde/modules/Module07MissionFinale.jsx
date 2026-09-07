import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — ÉVALUATION. Distracteurs = a et b échangés (M1), taux inversé ou
 * différence seule (M2, M4), « b négatif ⇒ décroissante » (M3), b = f(1) (M4),
 * sens de l'inéquation non retourné (M5). 11 LPs couverts.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Le test final CONSOLIDE : il n'introduit rien. Chaque épreuve déclare
 *   maintenant, par `requires`, les connaissances des modules 1 à 6 qu'elle
 *   mobilise — toutes établies par une brique bien avant, aucune notion neuve,
 *   aucun vocabulaire ni aucune notation qui n'ait déjà été posé.
 */
const EPREUVES = [
  { id: 'fa-e1', skill: 'ab', title: 'Reconnaître', prompt: 'Laquelle de ces fonctions est affine ?', options: ['f(x) = 4 − 3x', 'g(x) = 3x² − 4', 'h(x) = 3/x + 4', 'k(x) = x(x + 4)'], cols: 2, explain: '4 − 3x = −3x + 4 : la forme ax + b avec a = −3, b = 4. Les autres ont un carré, un quotient, un produit de x par x.', requires: ['fonction-affine-ab', 'vocab-coefficient-ordonnee'], assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonction-affine-2nde_P1'] } },
  { id: 'fa-e2', skill: 'ab', title: 'a et b', prompt: 'Un réservoir contient 8 L et se remplit à 1,5 L/min. V(t) = ?', options: ['1,5t + 8', '8t + 1,5', '9,5t', '1,5t − 8'], cols: 4, explain: 'a = 1,5 (le taux, par minute), b = 8 (le volume à t = 0).', requires: ['fonction-affine-ab', 'mem-a-taux-b-depart', 'methode-modeliser-affine'], assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonction-affine-2nde_P2', 'seconde_fonction-affine-2nde_P3'] } },
  { id: 'fa-e3', skill: 'taux', title: 'Taux d’accroissement', prompt: 'f est affine, f(2) = 9 et f(6) = 1. Son coefficient directeur est…', options: ['−2', '2', '−8', '−0,5'], cols: 4, explain: '(1 − 9) ÷ (6 − 2) = −8 ÷ 4 = −2. −8 est la seule différence des images ; −0,5 est le quotient inversé.', requires: ['taux-accroissement', 'formule-taux'], assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonction-affine-2nde_P4'] } },
  { id: 'fa-e4', skill: 'taux', title: 'Une table', prompt: 'Une table donne x = 0 → 5 ; x = 2 → 9 ; x = 5 → 15. La fonction est-elle affine ?', options: ['Oui : taux constant 2, f(x) = 2x + 5', 'Non : les accroissements 4 et 6 sont différents', 'Oui : f(x) = 5x + 2', 'On ne peut pas savoir'], cols: 1, explain: '(9 − 5) ÷ 2 = 2 et (15 − 9) ÷ 3 = 2 : même taux, fonction affine ; b = f(0) = 5. Les accroissements diffèrent, mais les x aussi — c’est le quotient qui compte.', requires: ['taux-accroissement', 'methode-reconnaitre-affine-table'], assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonction-affine-2nde_P1', 'seconde_fonction-affine-2nde_P6'] } },
  { id: 'fa-e5', skill: 'variations', title: 'Variations', prompt: 'f(x) = 2x − 100. f est…', options: ['croissante sur ℝ', 'décroissante sur ℝ, car −100 est négatif', 'croissante puis décroissante', 'constante'], cols: 2, explain: 'Seul le signe de a compte : a = 2 > 0, croissante. b = −100 ne change que le point de départ.', requires: ['regle-signe-a-variations'], assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonction-affine-2nde_P5'] } },
  { id: 'fa-e6', skill: 'graphique', title: 'Sur le graphique', prompt: 'Une droite coupe l’axe vertical en (0 ; −2) et passe par (3 ; 4). La fonction affine associée est…', options: ['f(x) = 2x − 2', 'f(x) = −2x + 3', 'f(x) = 3x − 2', 'f(x) = 2x + 4'], cols: 2, explain: 'b = −2 (l’axe vertical) ; a = (4 − (−2)) ÷ (3 − 0) = 2.', requires: ['methode-lire-a-b-graphique', 'methode-determiner-affine'], assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonction-affine-2nde_P7', 'seconde_fonction-affine-2nde_P8'] } },
  { id: 'fa-e7', skill: 'graphique', title: 'Deux points', prompt: 'f affine avec f(1) = 4 et f(3) = 10. Alors b = ?', options: ['1', '4', '3', '7'], cols: 4, explain: 'a = (10 − 4) ÷ (3 − 1) = 3, puis 4 = 3 × 1 + b donne b = 1. b n’est pas f(1) : c’est f(0).', requires: ['methode-determiner-affine', 'mem-deux-points'], assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonction-affine-2nde_P6', 'seconde_fonction-affine-2nde_P3'] } },
  { id: 'fa-e8', skill: 'resoudre', title: 'Le signe', prompt: 'g(x) = −3x + 12. g(x) < 0 pour…', options: ['x > 4', 'x < 4', 'x > −4', 'tout x'], cols: 4, explain: 'Zéro : x = 4. a = −3 < 0 : signe de a (négatif) à droite du zéro : g(x) < 0 pour x > 4.', requires: ['regle-signe-affine-zero'], assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonction-affine-2nde_P9'] } },
  { id: 'fa-e9', skill: 'resoudre', title: 'Une équation', prompt: 'Une bougie de 18 cm perd 3 cm par heure. Quand mesure-t-elle 6 cm ?', options: ['après 4 h', 'après 2 h', 'après 6 h', 'après 12 h'], cols: 4, explain: 'L(t) = −3t + 18 = 6 ⟺ 3t = 12 ⟺ t = 4. (2 h brûle 6 cm ; ici il faut brûler 12 cm.)', requires: ['methode-modeliser-affine', 'methode-equation-affine'], assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonction-affine-2nde_P10', 'seconde_fonction-affine-2nde_P6'] } },
  { id: 'fa-e10', skill: 'resoudre', title: 'Une inéquation', prompt: 'Solutions de −2x + 6 > 0 ?', options: ['x < 3', 'x > 3', 'x < −3', 'x > −3'], cols: 4, explain: '−2x > −6 ; on divise par −2, négatif : le sens s’inverse, x < 3. Vérification : x = 0 donne 6 > 0 ✓.', requires: ['methode-inequation-affine', 'regle-signe-affine-zero'], assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonction-affine-2nde_P11', 'seconde_fonction-affine-2nde_P9'] } },
];
const SKILLS = { ab: { label: 'Reconnaître a et b', module: 1 }, taux: { label: 'Le taux d’accroissement', module: 2 }, variations: { label: 'Variations', module: 3 }, graphique: { label: 'Retrouver la fonction', module: 4 }, resoudre: { label: 'Signe, équations, inéquations', module: 5 } };
const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'a et b', test: (m) => !m.ab },
  { id: 'b2', emoji: '🏅', label: 'Le taux', test: (m) => !m.taux },
  { id: 'b3', emoji: '🏅', label: 'La flèche', test: (m) => !m.variations },
  { id: 'b4', emoji: '🏅', label: 'Deux points', test: (m) => !m.graphique },
  { id: 'b5', emoji: '🏅', label: 'Le sens qui s’inverse', test: (m) => !m.resoudre },
  { id: 'b-parfait', emoji: '💎', label: 'Maître du robinet', test: (m) => Object.keys(m).length === 0 },
];
export default function Module07MissionFinale() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le robinet" moduleSubtitle="Dix épreuves sur f(x) = ax + b" estimatedTime="15 min" timerSeconds={600} timerLabel="10 min" xpPerCorrect={10}
      brief={{ tag: 'Mission finale', title: 'Maître du robinet', tone: 'amber', body: <p>Dix questions, une seule validation. Réflexe : a est un taux (par unité), b la valeur à zéro ; diviser par un négatif retourne l’inégalité.</p> }}
      registre={[{ id: 'r1', emoji: '📈', label: 'a', value: 'taux, par unité' }, { id: 'r2', emoji: '🎯', label: 'b', value: 'f(0)' }, { id: 'r3', emoji: '↗↘', label: 'variations', value: 'signe de a' }, { id: 'r4', emoji: '⚖️', label: 'zéro', value: '−b/a' }]}
      skills={SKILLS} epreuves={EPREUVES} badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{ masterTitle: 'Maître du robinet !', title: 'Mission accomplie', message: 'a comme taux, b comme départ : tu sais lire, retrouver et utiliser une fonction affine.', verbs: ['Reconnaître', 'Mesurer', 'Retrouver', 'Résoudre'], masterBadgeLabel: 'Maître du robinet' }} />
  );
}
