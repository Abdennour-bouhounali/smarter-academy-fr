import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import RealLine from '../../../../../common/components/RealLine';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — Boss Final « Les deux forfaits » (kit, QCM). DONNÉES.
 * Distracteurs = pièges des modules 1–6 : « une inéquation a une solution » (M1) ·
 * opération sur un seul membre (M2) · ÷ négatif sans retourner (M3) · solution
 * approchée au lieu d'exacte (M2) · un seul facteur (M4) · produit = 3 (M4) ·
 * valeur interdite prise pour solution (M5) · solution non interprétée (M6).
 * Couverture : P1 → e1, e2 · P2 → e3, e4 · P3 → e5, e6 · P4 → e6 · P5 → e7, e8 · P6 → e9 · P7 → e2, e10.
 */
const REGISTRE = [
  { id: 'forfaits', emoji: '📱', label: 'Forfaits', value: '2x + 5 = 13' },
  { id: 'balance', emoji: '⚖️', label: 'Balance', value: 'deux membres' },
  { id: 'signe', emoji: '🔁', label: 'Signe', value: '÷ (−) retourne' },
  { id: 'nul', emoji: '✖️', label: 'Nul', value: 'A = 0 ou B = 0' },
];
const SKILLS = {
  sens: { label: 'Équation, solutions, vérification', module: 1 },
  degre1: { label: 'Équations du premier degré', module: 2 },
  ineq: { label: 'Inéquations et représentation', module: 3 },
  produit: { label: 'Équations produit', module: 4 },
  quotient: { label: 'Équations quotient', module: 5 },
  modeliser: { label: 'Modéliser et interpréter', module: 6 },
};
const P = 'seconde_equations-et-inequations-2nde_P';
const EPREUVES = [
  { id: 'eq-e1', skill: 'sens', title: 'Épreuve 1', prompt: 'Combien de solutions a l’inéquation 2x + 5 < 13 ?', options: ['Une infinité : tous les x < 4', 'Une seule : x = 4', 'Aucune', 'Quatre'], cols: 2, correct: 0, explain: 'Toute valeur inférieure à 4 rend l’inégalité vraie : 0, 1, 3,99, −100… L’ensemble des solutions est l’intervalle ]−∞ ; 4[.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_equations-et-inequations-2nde_P1', 'seconde_equations-et-inequations-2nde_P3'] } },
  { id: 'eq-e2', skill: 'sens', title: 'Épreuve 2', prompt: 'x = 3 est-il solution de 4x − 5 = 2x + 1 ?', options: ['Oui : 4 × 3 − 5 = 7 et 2 × 3 + 1 = 7', 'Non : 7 ≠ 6', 'Oui, car 3 est positif', 'On ne peut pas savoir sans résoudre'], cols: 1, correct: 0, explain: 'Vérifier, c’est remplacer x par 3 dans CHAQUE membre : 7 et 7, l’égalité tient. Pas besoin de résoudre pour vérifier.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_equations-et-inequations-2nde_P7', 'seconde_equations-et-inequations-2nde_P1'] } },
  { id: 'eq-e3', skill: 'degre1', title: 'Épreuve 3', prompt: 'Résous 5x − 3 = 2x + 9.', options: ['x = 4', 'x = 2', 'x = 12/7', 'x = −4'], cols: 4, correct: 0, explain: '− 2x des deux côtés : 3x − 3 = 9 ; + 3 : 3x = 12 ; ÷ 3 : x = 4. Vérification : 17 = 17.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_equations-et-inequations-2nde_P2'] } },
  { id: 'eq-e4', skill: 'degre1', title: 'Épreuve 4', prompt: 'Quelle transformation de 3x + 4 = 10 est CORRECTE ?', options: ['3x = 6 (− 4 des deux côtés)', '3x = 10 (on enlève le 4)', 'x + 4 = 10/3 (÷ 3 à gauche)', '3x + 4 − 4 = 10'], cols: 1, correct: 0, explain: 'Seule une opération faite aux DEUX membres conserve les solutions : − 4 des deux côtés donne 3x = 6, puis x = 2. « Enlever le 4 » sans toucher à droite change l’équation.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_equations-et-inequations-2nde_P2'] } },
  { id: 'eq-e5', skill: 'ineq', title: 'Épreuve 5', prompt: 'Résous −2x + 6 > 2.', options: ['x < 2', 'x > 2', 'x > −2', 'x < −2'], cols: 4, correct: 0, explain: '− 6 : −2x > −4 ; ÷ (−2) retourne le sens : x < 2. Diviser par un négatif sans retourner donnerait x > 2, faux (teste x = 3 : 0 > 2 ?).', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_equations-et-inequations-2nde_P3'] } },
  { id: 'eq-e6', skill: 'ineq', title: 'Épreuve 6', prompt: 'Quel dessin représente les solutions de 3x − 1 ≥ 5 ?', extra: <div className="rounded-2xl border border-slate-200 bg-white p-1"><RealLine min={-2} max={6} step={1} intervals={[{ id: 'S', from: 2, to: Infinity, tone: 'emerald', label: 'dessin A' }]} ariaLabel="Dessin A : de 2 inclus vers plus l’infini" /></div>, options: ['Le dessin A : [2 ; +∞[', 'Le contraire : ]−∞ ; 2]', 'Le dessin A mais avec 2 exclu', '[6 ; +∞['], cols: 2, correct: 0, explain: '3x ≥ 6, x ≥ 2 : à partir de 2 (inclus, crochet fermé) vers +∞ — c’est le dessin A.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_equations-et-inequations-2nde_P4', 'seconde_equations-et-inequations-2nde_P3'] } },
  { id: 'eq-e7', skill: 'produit', title: 'Épreuve 7', prompt: 'Résous (2x − 8)(x + 5) = 0.', options: ['x = 4 ou x = −5', 'x = 4', 'x = −4 ou x = 5', 'x = 8 ou x = −5'], cols: 2, correct: 0, explain: 'Produit nul : 2x − 8 = 0 (x = 4) ou x + 5 = 0 (x = −5). Deux branches, deux solutions.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_equations-et-inequations-2nde_P5'] } },
  { id: 'eq-e8', skill: 'produit', title: 'Épreuve 8', prompt: 'Pour résoudre (x − 1)(x + 2) = 4, que faut-il faire d’abord ?', options: ['Ramener à « … = 0 » : la règle du produit nul ne s’applique qu’à 0', 'Écrire x − 1 = 4 ou x + 2 = 4', 'Écrire x − 1 = 2 et x + 2 = 2', 'Diviser par (x + 2)'], cols: 1, correct: 0, explain: 'Un produit égal à 4 n’impose rien à chaque facteur (1 × 4, 2 × 2, 8 × 0,5…). On développe et on ramène à 0 : x² + x − 6 = 0, soit (x − 2)(x + 3) = 0.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_equations-et-inequations-2nde_P5', 'seconde_equations-et-inequations-2nde_P7'] } },
  { id: 'eq-e9', skill: 'quotient', title: 'Épreuve 9', prompt: 'Résous (x + 4)/(x − 2) = 0.', options: ['S = {−4}', 'S = {−4 ; 2}', 'S = {2}', 'S = ∅'], cols: 4, correct: 0, explain: 'Valeur interdite : x = 2 (dénominateur nul). Numérateur nul : x = −4, et −4 − 2 ≠ 0. S = {−4}.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_equations-et-inequations-2nde_P6'] } },
  { id: 'eq-e10', skill: 'modeliser', title: 'Épreuve 10', prompt: 'Un abonnement coûte 12 € plus 1,50 € par séance. Avec 30 €, combien de séances n au maximum ?', options: ['12 : 12 + 1,5n ≤ 30 donne n ≤ 12', '20 : 30 ÷ 1,5', '18 : 30 − 12', '8'], cols: 2, correct: 0, explain: '12 + 1,5n ≤ 30 ⇔ 1,5n ≤ 18 ⇔ n ≤ 12. Vérification : 12 + 1,5 × 12 = 30 ✓ ; une 13e séance coûterait 31,50 €.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_equations-et-inequations-2nde_P7', 'seconde_equations-et-inequations-2nde_P3'] } },
];
const BADGES = [
  { id: 'b-sens', emoji: '📱', label: 'Sens et vérification sans faute', test: (m) => !m.sens },
  { id: 'b-degre1', emoji: '⚖️', label: 'Premier degré sans faute', test: (m) => !m.degre1 },
  { id: 'b-ineq', emoji: '🔁', label: 'Inéquations sans faute', test: (m) => !m.ineq },
  { id: 'b-prod', emoji: '✖️', label: 'Produit et quotient sans faute', test: (m) => !m.produit && !m.quotient },
  { id: 'b-model', emoji: '🧩', label: 'Modélisation sans faute', test: (m) => !m.modeliser },
  { id: 'b-perfect', emoji: '💎', label: 'Dix sur dix', test: (m) => Object.values(m).every((v) => !v) },
];
function Synthese() {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1"><h2 className="text-xl font-space font-extrabold text-slate-900">Synthèse : les deux forfaits</h2><p className="text-sm text-slate-500">L’équation a une solution ; l’inéquation, une demi-droite.</p></div>
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
        <RealLine min={0} max={10} step={1} intervals={[{ id: 'lt', from: 0, to: 4, openTo: true, tone: 'emerald', label: '2x + 5 < 13' }]} points={[{ id: 'eq', value: 4, label: '2x + 5 = 13', tone: 'indigo' }]} ariaLabel="De 0 à 4 exclu, A moins cher ; en 4, égalité" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <Feedback tone="info"><strong>Résoudre</strong> = trouver toutes les solutions (une, aucune, une infinité) ; <strong>vérifier</strong> = substituer dans chaque membre.</Feedback>
        <Feedback tone="info"><strong>Premier degré :</strong> même opération aux deux membres, x d’un côté, ÷ coefficient, solution exacte.</Feedback>
        <Feedback tone="info"><strong>Inéquation :</strong> idem, mais × ou ÷ par un négatif retourne le sens ; solutions = intervalle sur la droite.</Feedback>
        <Feedback tone="info"><strong>Produit nul :</strong> A × B = 0 ⇔ A = 0 ou B = 0. <strong>Quotient :</strong> A/B = 0 ⇔ A = 0 et B ≠ 0 (valeur interdite).</Feedback>
      </div>
    </div>
  );
}
export default function Module07MissionFinale() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7}
      moduleTitle="🏆 Mission finale : les deux forfaits" moduleSubtitle="Dix épreuves pour prouver qu’aucune équation ne te résiste." estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG} timerSeconds={600} timerLabel="10 min" xpPerCorrect={10}
      brief={{ tag: '🏆 Boss final', title: 'Dix équations et inéquations, sans scanner.', body: <p>Aucune aide, une seule validation à la fin. Tes réponses deviennent ton profil de maîtrise.</p> }}
      registre={REGISTRE} skills={SKILLS} epreuves={EPREUVES} badges={BADGES} synthese={<Synthese />}
      completion={{ masterTitle: 'Maître des équations', title: 'Leçon terminée', message: 'Tu sais résoudre une équation ou une inéquation du premier degré, un produit nul, un quotient — et vérifier, et interpréter.', verbs: ['Balayer', 'Isoler', 'Retourner', 'Annuler'], masterBadgeLabel: 'Tous les badges débloqués' }} />
  );
}
