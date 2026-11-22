// The strings of the interface, one JSON per namespace (docs/architecture/FRENCH_LANGUAGE_CONTRACT.md).
//
// ONE language: French. There is no language switch and no second locale. The i18next language is `fr`, so i18next
// applies the French plural rules (`_one` for 0 and 1, `_other` from 2) — `Intl` formats still take `LOCALE`
// (fr-FR, ../locale.js). The JSON files still live under `locales/ar/` during the translation campaign; the folder is
// renamed `locales/fr/` at its end (docs/FRANCE_REBUILD_PLAN.md §4quater).
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

/** The i18next language of the product: French, with the French plural rules. */
export const LANGUAGE = 'fr';
import common from './locales/ar/common.json';
import nav from './locales/ar/nav.json';
import auth from './locales/ar/auth.json';
import access from './locales/ar/access.json';
// Le CHROME du moteur de leçon (navigation entre modules, libellés des
// questions du kit, test final, diagnostic). Pas le CONTENU pédagogique :
// celui-ci est écrit directement dans chaque leçon. Voir apps/web/src/lessons/common/.
import lesson from './locales/ar/lesson.json';
// L'espace élève : tableau de bord, catalogue, exploration, profil,
// progression. Le CHROME de l'espace, pas le contenu des leçons.
import student from './locales/ar/student.json';
// Les pages VISITEUR (accueil, méthode, mission, FAQ, pied de page, palette
// de commandes). Le discours produit, pas le contenu pédagogique.
import marketing from './locales/ar/marketing.json';

// ── Le namespace CHARGÉ À LA DEMANDE : `mathlab` ─────────────────────────
// Le chrome de « L'atelier » (Math Lab) — instruments et accueil,
// ≈ 250 Ko de JSON qui partaient dans le lot d'entrée de CHAQUE visiteur.
// Il n'est lu que par features/mathlab, dont chaque écran est derrière une
// frontière <Suspense> : les pages /atelier (lots paresseux sous
// StudentLayout / TeacherLayout) et le calque posé sur la leçon
// (MathLabOverlayProvider). Le seul libellé rendu sur une page de leçon
// (« L'atelier », MathLabEntryButton) vit dans `lesson`.
//
// `useTranslation('mathlab')` SUSPEND jusqu'à l'arrivée du catalogue : la
// frontière montre son repli, puis le texte complet — jamais une clé
// brute. Un namespace ajouté ici doit donc n'être lu QUE sous une telle
// frontière, jamais par un composant partagé. Voir
// docs/architecture/BUNDLE_BOUNDARIES.md.
const ON_DEMAND_NAMESPACES = {
  // « Administration » : le chrome du panneau d'administration (≈ 22 Ko gzip). Lu seulement par pages/admin et
  // components/admin, sous AdminLayout (lot paresseux) ; App.jsx le demande EN MÊME TEMPS que le lot du cadre
  // (`preloadNamespace`). Ses primitives partagées avec l'espace enseignant et « Ma classe » (Modal, FilterBar,
  // DataTable, states) lisent `common › ui.*`, livré avec l'application : un dialogue ne suspend jamais.
  admin: () => import('./locales/ar/admin.json'),
  // « Espace professeur » : ses classes, ses élèves, sa formule (≈ 11 Ko gzip). Lu seulement sous TeacherLayout (lot
  // paresseux, demandé avec lui) et par trois composants rendus POUR un enseignant ailleurs : la carte de la banque d'exercices
  // (TeacherPracticeEntry), PracticeHub et TeacherLessonActions. Un élève ne le télécharge jamais.
  teacher: () => import('./locales/ar/teacher.json'),
  mathlab: () => import('./locales/ar/mathlab.json'),
  // « Défi du jour » : les écrans du défi (élève, onglet enseignant, mode
  // d'affichage). Chacun est un lot paresseux sous <Suspense> ; la carte de
  // l'accueil et l'onglet de la classe lisent `student` / `teacher`.
  challenge: () => import('./locales/ar/challenge.json'),
  // « Madar » (l'Espace jeux) : le jeu (page élève plein écran, onglet de la classe, écran du
  // tableau). Lus seulement par ces lots paresseux ; le libellé de navigation
  // vit dans `nav`, celui de l'onglet dans `teacher`.
  madar: () => import('./locales/ar/madar.json'),
  // « La fiche du professeur » : la page de préparation de l'enseignant
  // (pages/teacher/LessonMemoPage.jsx, lot paresseux, sa propre <Suspense>).
  // Les deux libellés des boutons qui y mènent vivent dans `teacher`.
  memo: () => import('./locales/ar/memo.json'),
  // « Visite guidée » : les textes des visites guidées, lus seulement par
  // features/tours/TourOverlay (lot paresseux, sous sa propre <Suspense>).
  // Le libellé du bouton « Visite de la page » vit dans `nav`.
  tour: () => import('./locales/ar/tour.json'),
  // « Espace parent », le parent du profil élève, le guide de protection de l'appareil (PARENT_SPACE.md).
  family: () => import('./locales/ar/family.json'),
  // « Espace établissement », l'espace du directeur d'un établissement (SCHOOL_ADMIN_SPACE.md).
  idara: () => import('./locales/ar/idara.json'),
  // « Le labo des énigmes » : l'échelle des défis, l'espace de travail, la relecture (THINKING_LAB.md).
  // Lu seulement sous la frontière paresseuse de /espace/tafkir ; le libellé de navigation vit dans `nav`.
  thinking: () => import('./locales/ar/thinking.json'),
  // « Ma boussole » : la jauge de départ, le rapport et la semaine (YEAR_COMPASS.md). Lu seulement sous la
  // frontière paresseuse de /espace/bawsala ; la carte de l'accueil lit `student.compassCard`.
  compass: () => import('./locales/ar/compass.json'),
};

const onDemandBackend = {
  type: 'backend',
  init() {},
  read(language, namespace, callback) {
    const load = ON_DEMAND_NAMESPACES[namespace];
    if (!load) return callback(null, {});
    load().then((module) => callback(null, module.default), (error) => callback(error, null));
  },
};

i18n.use(onDemandBackend).use(initReactI18next).init({
  lng: LANGUAGE,
  fallbackLng: LANGUAGE,
  resources: {
    [LANGUAGE]: { common, nav, auth, access, lesson, student, marketing },
  },
  // Les namespaces ci-dessus sont livrés avec l'application ; les autres
  // passent par `onDemandBackend`.
  partialBundledLanguages: true,
  defaultNS: 'common',
  // Chargés à l'initialisation. Les namespaces à la demande n'y sont PAS : chacun est demandé par le
  // premier `useTranslation('<ns>')`, ou plus tôt par `preloadNamespace`.
  ns: ['common', 'nav', 'auth', 'access', 'lesson', 'student', 'marketing'],
  interpolation: { escapeValue: false }, // React already escapes.
  returnEmptyString: false,
});

/**
 * Demande un namespace à la demande SANS attendre : à appeler dans le `lazy()` du cadre qui le lit, pour que
 * le texte voyage en parallèle du lot au lieu de le suivre (BUNDLE_BOUNDARIES.md §4 règle 11).
 */
export function preloadNamespace(namespace) {
  i18n.loadNamespaces(namespace);
}

export default i18n;
