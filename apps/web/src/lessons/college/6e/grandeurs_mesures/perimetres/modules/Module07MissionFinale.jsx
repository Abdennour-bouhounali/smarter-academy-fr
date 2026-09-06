import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import PolygonPerimeter from '../components/PolygonPerimeter';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import { rectanglePerimeter, circleCircumference, formatDec } from '../components/perimUtils';

/**
 * Module 7 — Boss Final sur le moteur du kit partagé (QCM uniquement).
 *
 * Voir docs/architecture/LESSON_INTEGRATION_GUIDE.md §7 : ce fichier est un
 * fichier de DONNÉES — épreuves, compétences, badges, synthèse — zéro
 * logique recopiée. Le moteur `BossFinal` applique par construction la
 * forme obligatoire (silencieux jusqu'au submit global, correction, profil
 * de maîtrise, synthèse) et branche l'evidence (useEvidenceSubmission) +
 * la persistance de la tentative (useFinalTestAttempt).
 *
 * Histoire unique : la mairie confie à la classe l'aménagement du parc —
 * clôtures, bordures, piste, fontaine. Les métadonnées `assessment`
 * couvrent les 8 LPs de la leçon.
 */
const ENCLOS_VERTICES = [
  { x: 40, y: 165 }, { x: 250, y: 175 }, { x: 275, y: 70 }, { x: 150, y: 20 }, { x: 55, y: 60 },
];
const ENCLOS_SIDES = [10.5, 6, 7.5, 6.5, 9];

const PETANQUE_P = rectanglePerimeter(15, 4); // 38
const FONTAINE_P = circleCircumference(4); // 12,56

const REGISTRE = [
  { id: 'parc', emoji: '🌳', label: 'Parc', value: 'à aménager' },
  { id: 'cloture', emoji: '🚧', label: 'Clôture', value: '5 côtés' },
  { id: 'fontaine', emoji: '⛲', label: 'Fontaine', value: 'D = 4 m' },
  { id: 'piste', emoji: '🏃', label: 'Piste', value: '40 m × 25 m' },
];

const SKILLS = {
  notion: { label: 'Le périmètre comme contour', module: 1 },
  mesurer: { label: 'Mesurer et additionner les côtés', module: 2 },
  formules: { label: 'Formules du carré et du rectangle', module: 3 },
  cercle: { label: 'Longueur du cercle', module: 4 },
  reflexes: { label: 'Unité et estimation', module: 5 },
  problemes: { label: 'Problèmes de périmètres', module: 6 },
};

const EPREUVES = [
  {
    id: 'pe-e1',
    requires: ['perimetre', 'perimetre-vs-aire', 'perimetre-est-longueur'],
    skill: 'notion',
    title: 'Épreuve 1',
    prompt: 'Pour commander la clôture de l’enclos, que doit-on mesurer exactement ?',
    options: [
      'La longueur totale de son contour',
      'La surface de pelouse à l’intérieur',
      'La distance entre les deux côtés les plus éloignés',
    ],
    cols: 1,
    correct: 0,
    explain: 'La clôture suit le contour : sa longueur est le périmètre de l’enclos — une longueur, pas une surface.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_perimetres_P1'] },
  },
  {
    id: 'pe-e2',
    requires: ['perimetre', 'tour-complet'],
    skill: 'mesurer',
    title: 'Épreuve 2',
    prompt: 'Sur le plan du massif à 5 côtés, l’apprenti n’a relevé que 4 mesures. Que faut-il faire avant de calculer ?',
    options: [
      'Calculer quand même : quatre côtés suffisent',
      'Mesurer le côté manquant — le tour doit passer par TOUS les côtés',
      'Doubler la plus grande mesure pour compenser',
    ],
    cols: 1,
    correct: 1,
    explain: 'Un périmètre incomplet ne compte rien de réel : chaque côté doit être mesuré, une seule fois chacun.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_perimetres_P2'] },
  },
  {
    id: 'pe-e3',
    requires: ['perimetre', 'tour-complet'],
    skill: 'mesurer',
    title: 'Épreuve 3',
    prompt: 'Les 5 côtés du massif mesurent 10,5 m, 6 m, 7,5 m, 6,5 m et 9 m. Quel est son périmètre ?',
    extra: <PolygonPerimeter vertices={ENCLOS_VERTICES} sideLengths={ENCLOS_SIDES} unit="m" tappedIndices={[0, 1, 2, 3, 4]} disabled />,
    options: ['33 m', '39,5 m', '46 m'],
    cols: 3,
    correct: 1,
    explain: '10,5 + 6 + 7,5 + 6,5 + 9 = 39,5 m. (33 m, c’est le calcul qui oublie le côté de 6,5 m !)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_perimetres_P3'] },
  },
  {
    id: 'pe-e4',
    requires: ['perimetre', 'formules-polygones'],
    skill: 'formules',
    title: 'Épreuve 4',
    prompt: 'Le terrain de pétanque est un rectangle de 15 m sur 4 m. Son périmètre ?',
    options: [`${15 + 4} m`, `${PETANQUE_P} m`, `${15 * 4} m`],
    cols: 3,
    correct: 1,
    explain: `P = 2 × (15 + 4) = 2 × 19 = ${PETANQUE_P} m. (19 m ne compte qu'un aller ; 60, c'est 15 × 4 — un produit qui n'est pas un tour.)`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_perimetres_P4'] },
  },
  {
    id: 'pe-e5',
    requires: ['perimetre', 'formules-polygones'],
    skill: 'formules',
    title: 'Épreuve 5',
    prompt: 'Le bac à sable est un carré de 3,5 m de côté. Son périmètre ?',
    options: ['7 m', '10,5 m', '14 m'],
    cols: 3,
    correct: 2,
    explain: 'P = 4 × c = 4 × 3,5 = 14 m. (7 m = 2 côtés seulement ; 10,5 m = 3 côtés.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_perimetres_P4'] },
  },
  {
    id: 'pe-e6',
    requires: ['perimetre', 'pi', 'perimetre-cercle'],
    skill: 'cercle',
    title: 'Épreuve 6',
    prompt: 'La bordure de la fontaine ronde (diamètre 4 m) mesure environ… (π ≈ 3,14)',
    options: ['≈ 6,28 m', `≈ ${formatDec(FONTAINE_P)} m`, '≈ 25,12 m'],
    cols: 3,
    correct: 1,
    explain: `P ≈ π × D ≈ 3,14 × 4 ≈ ${formatDec(FONTAINE_P)} m — et le résultat reste approché (≈).`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_perimetres_P8'] },
  },
  {
    id: 'pe-e7',
    requires: ['perimetre', 'pi', 'perimetre-cercle'],
    skill: 'cercle',
    title: 'Épreuve 7',
    prompt: 'Le manège circulaire a un RAYON de 5 m. Quel nombre entre dans la formule P ≈ π × D ?',
    options: ['5, directement', '10, car D = 2 × r', '2,5, car D = r ÷ 2'],
    cols: 1,
    correct: 1,
    explain: 'La formule utilise le DIAMÈTRE. Avec r = 5 m, D = 2 × 5 = 10 m, puis P ≈ 3,14 × 10 ≈ 31,4 m.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_perimetres_P8'] },
  },
  {
    id: 'pe-e8',
    requires: ['perimetre', 'perimetre-est-longueur', 'meme-unite'],
    skill: 'reflexes',
    title: 'Épreuve 8',
    prompt: 'Le tour complet du parc mesure 1 250 m. Pour l’annoncer aux visiteurs, quelle écriture est la plus parlante ?',
    options: ['125 000 cm', '1 250 m ou 1,25 km', '1,25 m'],
    cols: 1,
    correct: 1,
    explain: '1 250 m = 1,25 km : deux écritures raisonnables du même tour. Les centimètres donnent un nombre illisible, et 1,25 m serait le tour… d’une table.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_perimetres_P5'] },
  },
  {
    id: 'pe-e9',
    requires: ['perimetre', 'tour-complet', 'estimer-avant'],
    skill: 'reflexes',
    title: 'Épreuve 9',
    prompt: 'Avant de calculer le tour du kiosque (côtés 4,1 m ; 3,9 m ; 4,2 m ; 3,8 m), quelle estimation rapide est la bonne ?',
    options: ['≈ 8 m', '≈ 16 m', '≈ 32 m'],
    cols: 3,
    correct: 1,
    explain: 'Chaque côté vaut ≈ 4 m : le tour vaut ≈ 4 × 4 = 16 m. Si ton calcul exact s’éloigne beaucoup de 16, cherche l’erreur.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_perimetres_P6'] },
  },
  {
    id: 'pe-e10',
    requires: ['perimetre', 'formules-polygones', 'mem-perimetres'],
    skill: 'problemes',
    title: 'Épreuve 10',
    prompt: 'Dernière commande : courir au moins 500 m sur la piste rectangulaire de 40 m × 25 m. Combien de tours complets ?',
    options: ['3 tours', '4 tours', '13 tours'],
    cols: 3,
    correct: 1,
    explain: 'P = 2 × (40 + 25) = 130 m. 3 tours = 390 m (pas assez), 4 tours = 520 m ✓. (13, c’est 500 ÷ 40 — un calcul qui ne correspond à rien ici.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_perimetres_P7', '6e_perimetres_P3'] },
  },
];

const BADGES = [
  { id: 'arpenteur', emoji: '🏅', label: 'Arpenteur du contour', test: (s) => (s.notion ?? 0) === 0 && (s.mesurer ?? 0) === 0 },
  { id: 'formules', emoji: '🏅', label: 'Maître des formules', test: (s) => (s.formules ?? 0) === 0 },
  { id: 'cercle', emoji: '🏅', label: 'Dompteur de π', test: (s) => (s.cercle ?? 0) === 0 },
  { id: 'reflexes', emoji: '🏅', label: 'Réflexes de géomètre', test: (s) => (s.reflexes ?? 0) === 0 },
  { id: 'chantier', emoji: '🏅', label: 'Chef de chantier', test: (s) => (s.problemes ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Compas d’or du parc', test: (s) => Object.values(s).every((v) => v === 0) },
];

const PIEGES = [
  { wrong: 'Additionner 4 côtés sur 5', right: 'Le tour passe par TOUS les côtés, une seule fois chacun' },
  { wrong: 'P = L + l pour un rectangle', right: 'P = 2 × (L + l) — chaque côté a son jumeau' },
  { wrong: 'P ≈ π × rayon', right: 'P ≈ π × DIAMÈTRE (et D = 2 × r)' },
  { wrong: '1 m + 40 cm = 41', right: 'Même unité partout : 100 cm + 40 cm = 140 cm' },
];

function Synthese() {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-3 text-center">
        <div className="text-2xl" aria-hidden="true">📐</div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
          Le périmètre est un TOUR : la longueur du contour, parcourue côté après côté. Les formules ne sont que
          des tours complets écrits intelligemment.
        </p>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 space-y-3">
        <p className="text-sm font-semibold text-slate-700 text-center">Le tour du parc, côté par côté</p>
        <PolygonPerimeter
          vertices={ENCLOS_VERTICES}
          sideLengths={ENCLOS_SIDES}
          unit="m"
          tappedIndices={[0, 1, 2, 3, 4]}
          disabled
        />
        <p className="text-center font-mono text-sm text-slate-600">
          10,5 + 6 + 7,5 + 6,5 + 9 = <strong>39,5 m</strong>
        </p>
      </div>

      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-5 text-center space-y-1">
        <p className="text-xs uppercase tracking-wide text-emerald-100 font-mono font-bold">À retenir</p>
        <p className="font-mono font-extrabold text-base sm:text-lg">Polygone : somme des côtés · Rectangle : 2 × (L + l)</p>
        <p className="font-mono font-extrabold text-base sm:text-lg">Carré : 4 × c · Cercle : ≈ π × D (π ≈ 3,14)</p>
      </div>

      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 space-y-2.5">
        <p className="text-sm font-bold text-amber-900">Les pièges à éviter</p>
        {PIEGES.map((p) => (
          <div key={p.wrong} className="text-sm space-y-0.5">
            <div className="text-rose-700">❌ {p.wrong}</div>
            <div className="text-emerald-700">✅ {p.right}</div>
          </div>
        ))}
      </div>

      <Feedback tone="info">
        Le rituel du géomètre : estimer → calculer → écrire avec l'unité. L'estimation en tête détecte presque
        toutes les erreurs de calcul.
      </Feedback>

      {/* La carte complète : l'« À retenir » de la leçon n'est pas un second
          résumé écrit à la main, c'est la carte elle-même
          (docs/architecture/KNOWLEDGE_MAP.md). */}
      <KnowledgeSnapshot complete variant="complete" />
    </div>
  );
}

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="🏆 Mission finale : le parc à aménager"
      moduleSubtitle="Dix épreuves pour boucler le chantier du parc."
      estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'La mairie te confie l’aménagement complet du parc.',
        tone: 'amber',
        body: (
          <p>
            Clôtures, bordures, piste, fontaine : du contour quelconque au tour du cercle, mobilise toutes tes
            méthodes. Réponds à toutes les épreuves, puis valide pour découvrir ta correction et tes badges de
            maîtrise.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Compas d’or du parc !',
        title: 'Mission accomplie !',
        message: (
          <>
            Du massif quelconque à la fontaine ronde, tu as mesuré, additionné, appliqué les formules et estimé —
            sur un seul et même chantier.
          </>
        ),
        verbs: ['Mesurer', 'Additionner', 'Calculer', 'Estimer'],
        masterBadgeLabel: 'Badge « Compas d’or du parc » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
