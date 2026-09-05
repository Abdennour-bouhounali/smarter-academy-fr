import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import PolygonPerimeter from '../components/PolygonPerimeter';
import UnitLadder from '../components/UnitLadder';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import { perimeter } from '../components/lengthUtils';

/**
 * Module 7 — Boss Final sur le moteur du kit partagé (QCM uniquement).
 *
 * Voir docs/architecture/LESSON_INTEGRATION_GUIDE.md §7 : ce fichier est un
 * fichier de DONNÉES — épreuves, compétences, badges, synthèse — zéro
 * logique recopiée. Le moteur `BossFinal` applique par construction la
 * forme obligatoire (silencieux jusqu'au submit global, correction, profil
 * de maîtrise, synthèse, sans 4ᵉ phase) et branche l'evidence
 * (useEvidenceSubmission) + la persistance de la tentative
 * (useFinalTestAttempt).
 *
 * Même histoire que la version précédente : le club de sport prépare un
 * city-stade rectangulaire de 25 m sur 12 m. Les métadonnées `assessment`
 * (learningPointIds) reprennent exactement la correspondance déjà déclarée
 * — mais jamais branchée — dans l'ancienne version pré-kit du module.
 */
const FIELD_SIDES = [25, 12, 25, 12];

const REGISTRE = [
  { id: 'terrain', emoji: '⬛', label: 'Terrain', value: '25 m × 12 m' },
  { id: 'plots', emoji: '📍', label: 'Plots', value: 'tous les 5 m' },
  { id: 'affiche', emoji: '🖼️', label: 'Affiche', value: '12 m → cm' },
  { id: 'course', emoji: '🏃', label: 'Course', value: '3 tours' },
];

const SKILLS = {
  unite: { label: 'Choisir une unité', module: 1 },
  mesurer: { label: 'Mesurer sans le piège du zéro', module: 2 },
  relations: { label: 'Relations entre unités', module: 3 },
  convertir: { label: 'Convertir', module: 4 },
  estimer: { label: 'Estimer un ordre de grandeur', module: 5 },
  perimetre: { label: 'Calculer un périmètre', module: 6 },
};

const EPREUVES = [
  {
    id: 'lg-e1',
    skill: 'unite',
    title: 'Épreuve 1',
    prompt: 'Sur le plan du city-stade, on doit indiquer les dimensions 25 et 12. Quelle unité choisir ?',
    options: ['km', 'm', 'mm'],
    cols: 3,
    correct: 1,
    explain: 'Un terrain de sport se mesure naturellement en mètres : ni en km (beaucoup trop grand), ni en mm (beaucoup trop petit).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_longueurs_P1'] },
  },
  {
    id: 'lg-e2',
    skill: 'estimer',
    title: 'Épreuve 2',
    prompt: 'Une bouteille d’eau, un stylo, un cahier : lequel mesure environ 20 cm ?',
    options: ['La bouteille', 'Le stylo', 'Le cahier'],
    cols: 3,
    correct: 2,
    explain: 'Un cahier mesure environ 20 à 30 cm de long — un bon repère pour cette taille.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_longueurs_P1'] },
  },
  {
    id: 'lg-e3',
    skill: 'mesurer',
    title: 'Épreuve 3',
    prompt: 'Un objet est posé sur une règle : il commence à la graduation 4 et se termine à la graduation 11. Quelle est sa longueur ?',
    options: ['11 cm', '7 cm', '15 cm'],
    cols: 3,
    correct: 1,
    explain: 'La longueur est la distance entre le début et la fin : 11 − 4 = 7 cm, pas la position de fin seule.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_longueurs_P2'] },
  },
  {
    id: 'lg-e4',
    skill: 'relations',
    title: 'Épreuve 4',
    prompt: 'Combien de centimètres dans 1 mètre ?',
    options: ['10', '100', '1 000'],
    cols: 3,
    correct: 1,
    explain: '1 m = 100 cm.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_longueurs_P3'] },
  },
  {
    id: 'lg-e5',
    skill: 'relations',
    title: 'Épreuve 5',
    prompt: 'On pose un plot tous les 5 m, le long du grand côté du terrain (25 m). Combien d’intervalles de 5 m contient ce côté ?',
    options: ['4', '5', '20'],
    cols: 3,
    correct: 1,
    explain: '25 m divisé en tronçons de 5 m : 25 ÷ 5 = 5 intervalles.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_longueurs_P3'] },
  },
  {
    id: 'lg-e6',
    skill: 'convertir',
    title: 'Épreuve 6',
    prompt: 'Pour l’imprimeur, il faut convertir la largeur du terrain (12 m) en centimètres. Quelle est cette longueur en cm ?',
    options: ['12 cm', '120 cm', '1 200 cm'],
    cols: 3,
    correct: 2,
    explain: '1 m = 100 cm, donc 12 m devient un nombre 100 fois plus grand : 12 × 100 = 1 200 cm.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_longueurs_P4'] },
  },
  {
    id: 'lg-e7',
    skill: 'convertir',
    title: 'Épreuve 7',
    prompt: 'Un élève écrit : « 3 m = 30 cm ». Où est l’erreur ?',
    options: ["Il n'y a pas d'erreur", 'Il a multiplié par 10 au lieu de 100 : 3 m = 300 cm'],
    cols: 1,
    correct: 1,
    explain: '1 m contient 100 cm (pas 10). Donc 3 m = 3 × 100 = 300 cm, et non 30 cm.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_longueurs_P4'] },
  },
  {
    id: 'lg-e8',
    skill: 'perimetre',
    title: 'Épreuve 8',
    prompt: 'Ce terrain a 4 côtés : 25 m, 12 m, 25 m, 12 m. Quel est son périmètre ?',
    extra: <PolygonPerimeter shape="rectangle" sideLengths={FIELD_SIDES} unit="m" tappedIndices={[0, 1, 2, 3]} disabled />,
    options: [`${25 + 12} m`, `${perimeter(FIELD_SIDES)} m`, `${25 * 12} m`],
    cols: 3,
    correct: 1,
    explain: `25 + 12 + 25 + 12 = ${perimeter(FIELD_SIDES)} m : le périmètre additionne TOUS les côtés du contour.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_longueurs_P6'] },
  },
  {
    id: 'lg-e9',
    skill: 'perimetre',
    title: 'Épreuve 9',
    prompt: 'Le périmètre du city-stade se mesure en…',
    options: ['m² (mètres carrés)', 'm (mètres)', 'Aucune unité, c’est juste un nombre'],
    cols: 1,
    correct: 1,
    explain: 'Le périmètre est une longueur : il se mesure toujours en unité de longueur simple (m, km, cm…), jamais au carré.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_longueurs_P6'] },
  },
  {
    id: 'lg-e10',
    skill: 'estimer',
    title: 'Épreuve 10 — Le jour de la course',
    prompt: `Une coureuse fait 3 tours complets du city-stade (périmètre ${perimeter(FIELD_SIDES)} m). Sans calcul exact, quelle distance totale est la plus plausible ?`,
    options: ['≈ 22 m', '≈ 220 m', '≈ 2 200 m'],
    cols: 3,
    correct: 1,
    explain: `3 tours de ${perimeter(FIELD_SIDES)} m, c'est un peu plus de 3 × 70 = 210 m : ≈ 220 m est le bon ordre de grandeur.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_longueurs_P5'] },
  },
];

const BADGES = [
  { id: 'unites', emoji: '🏅', label: 'Expert des unités', test: (s) => (s.unite ?? 0) === 0 },
  { id: 'mesureur', emoji: '🏅', label: 'Mesureur précis', test: (s) => (s.mesurer ?? 0) === 0 },
  { id: 'convertisseur', emoji: '🏅', label: 'Virtuose des conversions', test: (s) => (s.relations ?? 0) === 0 && (s.convertir ?? 0) === 0 },
  { id: 'estimateur', emoji: '🏅', label: 'Estimateur malin', test: (s) => (s.estimer ?? 0) === 0 },
  { id: 'architecte', emoji: '🏅', label: 'Architecte du périmètre', test: (s) => (s.perimetre ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Champion du city-stade', test: (s) => Object.values(s).every((v) => v === 0) },
];

/* ── Synthèse visuelle (propre à la leçon) ─────────────────────────── */

function Synthese() {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-3 text-center">
        <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">📏 La longueur</div>
        <p className="text-sm text-slate-300 max-w-sm mx-auto">
          Quatre unités pour quatre échelles : km pour les grandes distances, mm pour les détails.
        </p>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 font-space font-bold text-slate-800 text-sm">📏 Mesurer</div>
        <p className="text-xs sm:text-sm text-slate-600">
          Une longueur, c'est toujours une DIFFÉRENCE entre deux positions — jamais juste « où ça se termine ».
        </p>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 font-space font-bold text-slate-800 text-sm">📐 Les unités</div>
        <UnitLadder />
      </div>

      <div className="bg-gradient-to-br from-sky-600 to-blue-700 text-white rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 font-space font-bold text-sm">⭐ À retenir</div>
        <div className="text-center font-mono font-extrabold text-lg sm:text-xl tabular-nums bg-white/10 rounded-xl py-2.5">
          1 km = 1 000 m = 100 000 cm = 1 000 000 mm
        </div>
        <p className="text-xs sm:text-sm text-center text-sky-50">
          Vers une unité <strong>plus petite</strong> → le nombre <strong>augmente</strong>. Vers une unité{' '}
          <strong>plus grande</strong> → le nombre <strong>diminue</strong>.
        </p>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 font-space font-bold text-slate-800 text-sm">⬛ Le périmètre</div>
        <div className="flex items-center justify-center gap-2 flex-wrap font-mono text-xs sm:text-sm">
          <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500">25</span>
          <span className="text-slate-400">+</span>
          <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500">12</span>
          <span className="text-slate-400">+</span>
          <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500">25</span>
          <span className="text-slate-400">+</span>
          <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500">12</span>
          <span className="text-slate-400">=</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold">{perimeter(FIELD_SIDES)} m</span>
        </div>
        <p className="text-xs sm:text-sm text-center text-slate-600">
          Le périmètre additionne TOUS les côtés — jamais une unité au carré.
        </p>
      </div>

      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center gap-2 font-space font-bold text-amber-900 text-sm">⚠️ Les pièges à éviter</div>
        {[
          { wrong: 'Le crayon se termine à 9, donc il mesure 9 cm.', right: 'Je vérifie où il commence : longueur = fin − début.' },
          { wrong: 'Vers une unité plus petite, je divise.', right: 'Vers une unité plus petite → ×10 (ou plus) à chaque marche.' },
          { wrong: 'Un seul côté suffit pour le périmètre.', right: "J'additionne TOUS les côtés du contour." },
        ].map((t) => (
          <div key={t.wrong} className="text-xs sm:text-sm space-y-0.5">
            <div className="text-rose-700">❌ {t.wrong}</div>
            <div className="text-emerald-700">✅ {t.right}</div>
          </div>
        ))}
      </div>

      <Feedback tone="info">
        📏 Une longueur se mesure, se compare et se convertit. Pour le périmètre, je fais toujours le tour complet
        de la figure.
      </Feedback>
    </div>
  );
}

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="🏆 Mission finale : le parcours"
      moduleSubtitle="Dix épreuves pour boucler le chantier du city-stade."
      estimatedTime="16 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'Le club de sport prépare un city-stade rectangulaire de 25 m sur 12 m.',
        tone: 'amber',
        body: (
          <p>
            Du plan jusqu'au tour de piste : choisir une unité, mesurer sans te faire piéger, convertir,
            estimer et calculer un périmètre. Réponds à toutes les épreuves, puis valide pour découvrir ta
            correction et tes badges de maîtrise.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Champion du City-Stade !',
        title: 'Mission accomplie !',
        message: (
          <>
            Du plan au tour de piste, tu as choisi une unité, mesuré sans te faire piéger par le zéro, converti,
            estimé et calculé un périmètre — sur une seule et même situation.
          </>
        ),
        verbs: ['Choisir', 'Mesurer', 'Convertir', 'Calculer'],
        masterBadgeLabel: 'Badge « Champion du City-Stade » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
