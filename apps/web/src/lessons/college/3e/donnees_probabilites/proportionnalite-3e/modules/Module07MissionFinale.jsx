import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import RecipeLab from '../components/RecipeLab';
import ScaleBox from '../components/ScaleBox';
import { formatDec } from '../components/propUtils';

/**
 * Module 7 — 🏆 MISSION FINALE : « La grande tablée ».
 *
 * Fichier de DONNÉES : dix épreuves QCM, silencieuses jusqu'à un unique envoi.
 * Écrites EN DERNIER, chaque distracteur reprenant un piège de la leçon :
 *   e1  « ça augmente ensemble » pris pour proportionnel (module 2)
 *   e2  grandeur qui n'intervient pas (module 1)
 *   e3  additif au lieu de multiplicatif (module 1)
 *   e4  coefficient inversé (module 2)
 *   e5  facteur appliqué à une seule ligne (module 3)
 *   e6  unité confondue avec le lot (module 3)
 *   e7  +30 % pris pour +30 € ou × 30 (module 5)
 *   e8  aire × k au lieu de k² (module 4)
 *   e9  vitesse confondue avec distance sur un graphique (module 6)
 *   e10 résultat incohérent accepté (modules 4–6)
 *
 * Couverture des Learning Points : P1 (e1), P2 (e2), P3 (e3), P4 (e4), P5 (e5),
 * P6 (e6), P7 (e5, e7), P8 (e7), P9 (e8), P10 (e9), P11 (e9), P12 (e10).
 */

const REGISTRE = [
  { id: 'k', emoji: '⚖️', label: 'Coefficient', value: 'y ÷ x, partout' },
  { id: 'chemins', emoji: '🛤️', label: 'Chemins', value: 'unité · facteur · k · croix' },
  { id: 'pct', emoji: '🏷️', label: '+t %', value: '× (1 + t/100)' },
  { id: 'k2', emoji: '🖼️', label: 'Agrandir ×k', value: 'aire × k²' },
];

const SKILLS = {
  reconnaitre: { label: 'Reconnaître la proportionnalité', module: 2 },
  multiplicatif: { label: 'La relation multiplicative', module: 1 },
  chemins: { label: 'Compléter un tableau', module: 3 },
  pourcentages: { label: 'Pourcentages', module: 5 },
  geometrie: { label: 'Agrandissement et Thalès', module: 4 },
  sciences: { label: 'Sciences et cohérence', module: 6 },
};

const EPREUVES = [
  {
    id: 'pr-e1', skill: 'reconnaitre', requires: ['situation-proportionnelle', 'droite-par-origine'], title: 'Épreuve 1',
    prompt: 'Laquelle de ces situations est une situation de proportionnalité ?',
    options: ['Le prix de la farine vendue au kilo, toujours au même tarif', 'L’âge de Lina selon l’année', 'Le prix d’un abonnement de 10 € plus 2 € par film', 'La taille d’un enfant selon son âge'],
    cols: 1, correct: 0,
    explain: 'Seul le prix au kilo se calcule en multipliant toujours par le même nombre. Les autres augmentent « ensemble » sans rapport constant (part fixe, ou croissance irrégulière).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_proportionnalite-3e_P1'] },
  },
  {
    id: 'pr-e2', skill: 'multiplicatif', requires: ['coefficient-proportionnalite'], title: 'Épreuve 2',
    prompt: 'Dans la recette de crêpes, quelles grandeurs sont proportionnelles ?',
    options: ['Le nombre de personnes et la quantité de farine', 'Le nombre de personnes et le temps de cuisson d’une crêpe', 'La quantité de farine et le temps de cuisson', 'Le nombre d’œufs et la température du four'],
    cols: 1, correct: 0,
    explain: 'Les quantités d’ingrédients suivent le nombre de convives ; le temps de cuisson d’une crêpe, lui, ne dépend pas du nombre de personnes.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_proportionnalite-3e_P2'] },
  },
  {
    id: 'pr-e3', skill: 'multiplicatif', requires: ['coefficient-proportionnalite'], title: 'Épreuve 3',
    prompt: '2 personnes → 300 g de farine. Pour 7 personnes, il faut…',
    options: ['1 050 g', '2 100 g', '1 500 g', '305 g'],
    cols: 2, correct: 0,
    explain: '150 g par personne, donc 150 × 7 = 1 050 g (ou 300 × 3,5). On multiplie par le même nombre — on n’ajoute pas, et on n’oublie pas que 300 g valait pour 2.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_proportionnalite-3e_P3'] },
  },
  {
    id: 'pr-e4', skill: 'reconnaitre', requires: ['situation-proportionnelle', 'droite-par-origine'], title: 'Épreuve 4',
    prompt: 'Un tableau donne 100 km → 6,5 L et 250 km → 16,25 L. Quel est le coefficient de proportionnalité qui donne l’essence à partir de la distance ?',
    options: ['0,065', '6,5', '15,4', '650'],
    cols: 2, correct: 0,
    explain: '6,5 ÷ 100 = 0,065 et 16,25 ÷ 250 = 0,065 : le même nombre dans chaque colonne, c’est le coefficient — les litres pour UN kilomètre.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_proportionnalite-3e_P4'] },
  },
  {
    id: 'pr-e5', skill: 'chemins', requires: ['quatre-chemins'], title: 'Épreuve 5',
    prompt: '4 kg de pommes coûtent 22 €. Combien coûtent 12 kg ?',
    options: ['66 €', '30 €', '88 €', '26 €'],
    cols: 2, correct: 0,
    explain: 'De 4 à 12 on multiplie par 3 — sur les DEUX lignes : 22 × 3 = 66 €.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_proportionnalite-3e_P5', '3e_proportionnalite-3e_P7'] },
  },
  {
    id: 'pr-e6', skill: 'chemins', requires: ['quatre-chemins'], title: 'Épreuve 6',
    prompt: '12 cahiers identiques coûtent 30 €. Combien coûtent 7 cahiers ?',
    options: ['17,50 €', '25 €', '210 €', '15 €'],
    cols: 2, correct: 0,
    explain: 'Un cahier : 30 ÷ 12 = 2,50 € ; sept cahiers : 2,5 × 7 = 17,50 €. Passer par l’unité est le chemin naturel quand aucun facteur simple ne relie 12 et 7.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_proportionnalite-3e_P6'] },
  },
  {
    id: 'pr-e7', skill: 'pourcentages', requires: ['coefficient-multiplicateur', 'pourcentage'], title: 'Épreuve 7',
    prompt: 'Un prix de 40 € augmente de 30 %. Le nouveau prix est…',
    options: ['52 €', '70 €', '43 €', '1 200 €'],
    cols: 2, correct: 0,
    explain: '+30 % → × 1,3 : 40 × 1,3 = 52 €. Ajouter 30 € ou multiplier par 30 ne sont pas des pourcentages.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_proportionnalite-3e_P7', '3e_proportionnalite-3e_P8'] },
  },
  {
    id: 'pr-e8', skill: 'geometrie', requires: ['agrandissement-reduction', 'mem-aires-volumes'], title: 'Épreuve 8',
    prompt: 'Un rectangle de 4 cm × 2 cm est agrandi de rapport 3. Son aire devient…',
    options: ['72 cm²', '24 cm²', '11 cm²', '216 cm²'],
    cols: 2, correct: 0,
    explain: '12 cm × 6 cm = 72 cm² = 8 × 9 : l’aire est multipliée par k² = 9, pas par k = 3 (24) ni par k³ = 27 (216).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_proportionnalite-3e_P9'] },
  },
  {
    id: 'pr-e9', skill: 'sciences', requires: ['grandeurs-quotient'], title: 'Épreuve 9',
    prompt: 'Sur un graphique distance–temps, la droite d’un train passe par (2 ; 180). Que vaut sa vitesse ?',
    options: ['90 km/h', '180 km/h', '2 km/h', '360 km/h'],
    cols: 2, correct: 0,
    explain: 'Le coefficient se lit en divisant : 180 ÷ 2 = 90 km/h — la distance parcourue en une heure, que l’on lit aussi dans l’inclinaison de la droite.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_proportionnalite-3e_P10', '3e_proportionnalite-3e_P11'] },
  },
  {
    id: 'pr-e10', skill: 'sciences', requires: ['grandeurs-quotient'], title: 'Épreuve 10',
    prompt: 'Un élève trouve qu’un morceau d’aluminium (2,7 g/cm³) de 50 cm³ pèse 1 350 g. Que penser de ce résultat ?',
    options: ['Il est dix fois trop grand : 2,7 × 50 = 135 g', 'Il est juste', 'Il est dix fois trop petit', 'Il manque l’unité, sinon il est juste'],
    cols: 1, correct: 0,
    explain: '2,7 × 50 = 135 g. Un ordre de grandeur (2,7 × 50 ≈ 3 × 50 = 150) suffisait à voir qu’un zéro s’était glissé : vérifier, c’est d’abord estimer.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_proportionnalite-3e_P12'] },
  },
];

const BADGES = [
  { id: 'reconnaitre', emoji: '🏅', label: 'Œil du coefficient', test: (s) => (s.reconnaitre ?? 0) === 0 },
  { id: 'multiplicatif', emoji: '🏅', label: 'Cuisinier des proportions', test: (s) => (s.multiplicatif ?? 0) === 0 },
  { id: 'chemins', emoji: '🏅', label: 'Maître des quatre chemins', test: (s) => (s.chemins ?? 0) === 0 },
  { id: 'pourcentages', emoji: '🏅', label: 'Roi des soldes', test: (s) => (s.pourcentages ?? 0) === 0 },
  { id: 'geometrie', emoji: '🏅', label: 'Architecte du k²', test: (s) => (s.geometrie ?? 0) === 0 },
  { id: 'sciences', emoji: '🏅', label: 'Vérificateur', test: (s) => (s.sciences ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Sans faute', test: (s) => Object.values(s).every((v) => v === 0) },
];

const PIEGES = [
  { wrong: 'Ça augmente ensemble, donc c’est proportionnel', right: 'Le test, c’est le rapport y ÷ x : le même partout' },
  { wrong: 'Pour 7 personnes, j’ajoute 150 g', right: 'On multiplie : 150 × 7 — le chemin est multiplicatif' },
  { wrong: 'Le facteur ×3 sur une seule ligne', right: 'Le facteur s’applique aux deux lignes' },
  { wrong: '+20 % puis −20 % revient au départ', right: '× 1,2 × 0,8 = × 0,96 : −4 %' },
  { wrong: 'Agrandir ×2 double l’aire', right: 'Quatre copies : l’aire fait × k²' },
];

/** Synthèse : la recette signature figée à 7, et l'agrandissement ×2. */
function Synthese() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-slate-900 text-white p-4 text-center space-y-1">
        <p className="text-2xl">🥞 ⚖️ 🖼️</p>
        <p className="font-bold">Ce qui ne change pas quand tout grandit</p>
        <p className="text-slate-300 text-sm">Le coefficient — et, pour les aires, son carré.</p>
      </div>
      <RecipeLab people={7} onPeopleChange={() => {}} disabled showRatio highlightId="farine" caption="La recette pour 7 : chaque quantité ÷ personnes ne bouge pas" />
      <ScaleBox base={{ w: 4, h: 2 }} k={2} onKChange={() => {}} frozen caption="Agrandir ×2 : quatre copies, aire ×4" />
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
        <p className="font-bold text-slate-800">La boîte à outils</p>
        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
          <li><strong>Reconnaître</strong> : rapports égaux, points alignés avec O.</li>
          <li><strong>Case vide</strong> : unité · facteur (deux lignes) · coefficient · produit en croix.</li>
          <li><strong>Pourcentages</strong> : × (1 + t/100) ; évolutions successives : on multiplie.</li>
          <li><strong>Agrandir ×k</strong> : longueurs × k, aires × k², volumes × k³ ; Thalès.</li>
          <li><strong>Vérifier</strong> : rapport, sens, ordre de grandeur ({formatDec(2.7 * 50)} g, pas 1 350).</li>
        </ul>
      </div>
      <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4">
        <p className="font-bold text-rose-800 mb-2">Les pièges déjoués</p>
        <ul className="space-y-1.5 text-sm">
          {PIEGES.map((p) => (
            <li key={p.wrong} className="text-slate-700">
              <span className="text-rose-600">❌ {p.wrong}</span>
              <br />
              <span className="text-emerald-700">✅ {p.right}</span>
            </li>
          ))}
        </ul>
      </div>
      <Feedback tone="info">Quand tout grandit, cherche ce qui ne change pas : c’est là que se cache le calcul.</Feedback>
    </div>
  );
}

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : la grande tablée"
      moduleSubtitle="Dix épreuves pour organiser la fête sans une erreur de proportion."
      estimatedTime="15 min"
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'Dix décisions pour la fête',
        tone: 'amber',
        body: (
          <p>
            Aucune correction avant la fin : réponds aux dix épreuves, puis valide en une fois. Tu verras
            ensuite ton profil et la synthèse.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Chef de la grande tablée !',
        title: 'Fête réussie !',
        message: (
          <>
            De la recette pour 7 à la banderole agrandie, tu as reconnu, calculé, choisi le bon chemin et vérifié
            chaque résultat — en cherchant toujours le nombre qui ne change pas.
          </>
        ),
        verbs: ['Reconnaître', 'Calculer', 'Agrandir', 'Vérifier'],
        masterBadgeLabel: 'Badge « Chef de la grande tablée » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
