import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomeRedirect from './components/auth/HomeRedirect';
import StudentLayout from './components/layout/StudentLayout';
import CourseLayout from './components/layout/CourseLayout';
const Methode = lazy(() => import('./pages/Methode'));
const About = lazy(() => import('./pages/About'));
const Courses = lazy(() => import('./pages/Courses'));
// No pricing, checkout or return page exists in this tree yet (plan §4, step 1F). What sells is behind
// `PaidOutlet` (payments switch, §4ter); what has no French content yet behind `FeatureOutlet` (config/features.js).
const FAQ = lazy(() => import('./pages/FAQ'));
const Contact = lazy(() => import('./pages/Contact'));
import Login from './pages/Login';
import Register from './pages/Register';
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerificationEmail = lazy(() => import('./pages/VerificationEmail'));
const AuthGoogle = lazy(() => import('./pages/AuthGoogle'));
const MentionsLegales = lazy(() => import('./pages/legal/MentionsLegales'));
const Confidentialite = lazy(() => import('./pages/legal/Confidentialite'));
const CGU = lazy(() => import('./pages/legal/CGU'));
// Le cadre et SES TEXTES partent ensemble : `admin` est un namespace à la demande (BUNDLE_BOUNDARIES.md §3).
const AdminLayout = lazy(() => {
  preloadNamespace('admin');
  return import('./components/layout/AdminLayout');
});
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminLessons = lazy(() => import('./pages/admin/content/Lessons'));
const AdminLessonDetail = lazy(() => import('./pages/admin/content/LessonDetail'));
const AdminExercises = lazy(() => import('./pages/admin/content/Exercises'));
const AdminReportList = lazy(() => import('./pages/admin/reports/ReportList'));
const AdminReportDetail = lazy(() => import('./pages/admin/reports/ReportDetail'));
const AdminStudentList = lazy(() => import('./pages/admin/students/StudentList'));
const AdminStudentDetail = lazy(() => import('./pages/admin/students/StudentDetail'));
const PlatformAnalytics = lazy(() =>
  import('./pages/admin/analytics/Platform').then((m) => ({ default: m.PlatformAnalytics })),
);
const LearningAnalytics = lazy(() =>
  import('./pages/admin/analytics/Platform').then((m) => ({ default: m.LearningAnalytics })),
);
const ContentAnalytics = lazy(() =>
  import('./pages/admin/analytics/ContentAnalytics').then((m) => ({ default: m.ContentAnalytics })),
);
const LearningPointAnalytics = lazy(() =>
  import('./pages/admin/analytics/ContentAnalytics').then((m) => ({ default: m.LearningPointAnalytics })),
);
const AdminProfile = lazy(() => import('./pages/admin/account/Account').then((m) => ({ default: m.AdminProfile })));
const AdminSecurity = lazy(() => import('./pages/admin/account/Account').then((m) => ({ default: m.AdminSecurity })));
const AdminActivationCodes = lazy(() => import('./pages/admin/activation/ActivationCodes'));
const AdminActivationBatches = lazy(() => import('./pages/admin/activation/ActivationBatches'));
const AdminActivationCodeDetail = lazy(() => import('./pages/admin/activation/ActivationCodeDetail'));
const AdminActivityLog = lazy(() => import('./pages/admin/system/ActivityLog'));
const AdminRegistryHealth = lazy(() => import('./pages/admin/system/RegistryHealth'));
const AdminContactMessages = lazy(() => import('./pages/admin/system/ContactMessages'));
// La LIBRAIRIE (livres papier, commande sans paiement en ligne) : vitrine
// publique et suivi admin — lots paresseux, rien dans l'entrée.
// Voir docs/architecture/BOOKS_STORE.md.
// Les données du livre partent AVEC le lot de la page, pas après lui (bookCache.js).
const BooksPage = lazy(() => {
  prefetchBooksForLocation();
  return import('./features/books/BooksPage');
});
const BookDetailPage = lazy(() => {
  prefetchBooksForLocation();
  return import('./features/books/BookDetailPage');
});
const AdminBookOrders = lazy(() => import('./pages/admin/books/BookOrders'));
const AdminBookOrderDetail = lazy(() => import('./pages/admin/books/BookOrderDetail'));
const AdminBookCatalog = lazy(() => import('./pages/admin/books/BookCatalog'));
const AdminBookMessages = lazy(() => import('./pages/admin/books/BookMessages'));
const AdminBookManagers = lazy(() => import('./pages/admin/books/BookManagers'));
// Les ENSEIGNANTS, leurs CLASSES et les OFFRES — le modèle commercial
// configuré depuis le panneau, sans déploiement ni paiement en ligne.
const AdminTeacherList = lazy(() => import('./pages/admin/teachers/TeacherList'));
const AdminTeacherDetail = lazy(() => import('./pages/admin/teachers/TeacherDetail'));
const AdminClassroomList = lazy(() => import('./pages/admin/classrooms/ClassroomList'));
const AdminClassroomDetail = lazy(() => import('./pages/admin/classrooms/ClassroomDetail'));
const AdminPlanList = lazy(() => import('./pages/admin/plans/PlanList'));
const AdminPlanEditor = lazy(() => import('./pages/admin/plans/PlanEditor'));
const AdminAccessLimits = lazy(() => import('./pages/admin/access/AccessLimits'));
const AdminSubscriptionRequests = lazy(() => import('./pages/admin/requests/SubscriptionRequests'));
const AdminSubscriptions = lazy(() =>
  import('./pages/admin/subscriptions/Subscriptions').then((m) => ({ default: m.AdminSubscriptions })),
);
// L'ESPACE ENSEIGNANT (« Espace professeur ») : sa propre coquille.
const TeacherLayout = lazy(() => {
  preloadNamespace('teacher');
  return import('./components/layout/TeacherLayout');
});
const TeacherHome = lazy(() => import('./pages/teacher/TeacherHome'));
const TeacherBankGate = lazy(() => import('./pages/teacher/practice/TeacherBankGate'));
const TeacherClassGroupList = lazy(() => import('./pages/teacher/ClassGroupList'));
const TeacherClassGroupCreate = lazy(() => import('./pages/teacher/ClassGroupCreate'));
const TeacherClassGroupDetail = lazy(() => import('./pages/teacher/ClassGroupDetail'));
const TeacherStudentProgress = lazy(() => import('./pages/teacher/StudentProgressPage'));
const TeacherStudentNotebook = lazy(() => import('./pages/teacher/StudentNotebookPage'));
const TeacherSubscription = lazy(() => import('./pages/teacher/SubscriptionPage'));
const TeacherProfile = lazy(() => import('./pages/teacher/TeacherProfile'));
const TeacherLessonMemo = lazy(() => import('./pages/teacher/LessonMemoPage'));
const TeacherReviews = lazy(() => import('./pages/teacher/TeacherReviewsPage'));
// « Espace parent » — l'espace PARENT (docs/architecture/PARENT_SPACE.md) : sa
// coquille, ses pages, le guide « Protéger l'appareil » (public aussi) et, côté élève,
// « Ce que voit ton parent ». Tout est paresseux ; les chaînes sont dans `family` (à la demande).
const ParentLayout = lazy(() => import('./components/layout/ParentLayout'));
const ParentHome = lazy(() => import('./pages/parent/ParentHome'));
const ParentChildReport = lazy(() => import('./pages/parent/ParentChildReport'));
const DeviceGuidePage = lazy(() => import('./pages/parent/DeviceGuidePage'));
const StudentParentView = lazy(() => import('./pages/student/ParentView'));
// « lien parent » : la page PUBLIQUE du parent, sans compte (owner, 2026-10-23).
const ParentLinkPage = lazy(() => import('./pages/parent/ParentLinkPage'));
// « Espace établissement » : le directeur d'un établissement (SCHOOL_ADMIN_SPACE.md).
// Tout est paresseux ; les chaînes sont dans `idara` (à la demande).
const SchoolLayout = lazy(() => import('./components/layout/SchoolLayout'));
const SchoolHome = lazy(() => import('./pages/school/SchoolHome'));
const SchoolClassrooms = lazy(() => import('./pages/school/SchoolClassrooms'));
const SchoolTeachers = lazy(() => import('./pages/school/SchoolTeachers'));
const SchoolStudents = lazy(() => import('./pages/school/SchoolStudents'));
const SchoolSettings = lazy(() => import('./pages/school/SchoolSettings'));
const SchoolLearningMap = lazy(() => import('./pages/school/SchoolLearningMap'));
const SchoolStudentFile = lazy(() => import('./pages/school/SchoolStudentFile'));
const SchoolReports = lazy(() => import('./pages/school/SchoolReports'));
const SchoolReport = lazy(() => import('./pages/school/SchoolReport'));
const SchoolMeeting = lazy(() => import('./pages/school/SchoolMeeting'));
// « Mon établissement » : l'établissement vu par l'enseignant, et son lien d'adhésion.
const TeacherSchoolPage = lazy(() => import('./pages/teacher/TeacherSchoolPage'));
const TeacherSchoolJoin = lazy(() => import('./pages/teacher/TeacherSchoolJoin'));
// « Établissements », côté administration de la plateforme.
const AdminSchoolList = lazy(() => import('./pages/admin/schools/SchoolList'));
const AdminSchoolDetail = lazy(() => import('./pages/admin/schools/SchoolDetail'));
// L'élève et sa classe (« Ma classe »), et le lien public d'une classe.
const Qism = lazy(() => import('./pages/student/Qism'));
const JoinClassLink = lazy(() => import('./pages/JoinClassLink'));
// Les pages de l'espace élève sont des lots À PART, comme l'admin et
// l'enseignant : un visiteur de « / » ne paie ni le cahier (KaTeX), ni la
// progression, ni l'explorateur. Les layouts (StudentLayout, MainLayout)
// posent leur propre <Suspense> autour de <Outlet/> : la barre latérale reste
// à l'écran pendant qu'une page arrive. Voir docs/architecture/BUNDLE_BOUNDARIES.md.
const StudentHome = lazy(() => import('./pages/student/StudentHome'));
const MesCours = lazy(() => import('./pages/student/MesCours'));
const Explorer = lazy(() => import('./pages/student/Explorer'));
const Progression = lazy(() => import('./pages/student/Progression'));
const Notebook = lazy(() => import('./pages/student/Notebook'));
const NotebookNotePage = lazy(() => import('./pages/student/Notebook').then((m) => ({ default: m.NotebookNotePage })));
const NotebookReviewPage = lazy(() =>
  import('./pages/student/Notebook').then((m) => ({ default: m.NotebookReviewPage })),
);
const Profil = lazy(() => import('./pages/student/Profil'));
const ChooseGrade = lazy(() => import('./pages/student/ChooseGrade'));
// « Présente-toi » : l'étape qui demande le prénom et le nom à un compte qui n'en a
// pas encore (élève ET enseignant — pages/onboarding/CompleteName.jsx).
const CompleteName = lazy(() => import('./pages/onboarding/CompleteName'));
const Activation = lazy(() => import('./pages/student/Activation'));
const DiagnosticIntro = lazy(() => import('./pages/student/diagnostic/DiagnosticIntro'));
const DiagnosticRun = lazy(() => import('./pages/student/diagnostic/DiagnosticRun'));
const DiagnosticResult = lazy(() => import('./pages/student/diagnostic/DiagnosticResult'));
// Moteur d'exercices. Trois routes paramétrées, pas une par leçon : la
// pratique est indépendante de l'arbre des leçons, et `lessonCode` suffit
// puisque les codes de leçon sont globalement uniques.
const PracticeHub = lazy(() => import('./pages/student/practice/PracticeHub'));
const PracticeSession = lazy(() => import('./pages/student/practice/PracticeSession'));
const PracticeSummary = lazy(() => import('./pages/student/practice/PracticeSummary'));
const AnswerReviewPage = lazy(() => import('./pages/student/practice/AnswerReviewPage'));
// « Défi du jour » : l'écran du jour, l'historique, la revue d'un jour.
const DailyChallengePage = lazy(() => import('./pages/student/challenge/DailyChallengePage'));
// « Ma boussole » (YEAR_COMPASS.md) : la jauge, le rapport, la semaine — un lot paresseux (réseau + calendrier).
const CompassPage = lazy(() => import('./pages/student/CompassPage'));
const ChallengeHistoryPage = lazy(() => import('./pages/student/challenge/ChallengeHistoryPage'));
const ChallengeReviewPage = lazy(() => import('./pages/student/challenge/ChallengeReviewPage'));
const TeacherChallengeDisplay = lazy(() => import('./pages/teacher/ChallengeDisplayPage'));
// « Madar » : le jeu (plein écran, hors des coquilles) et son écran du tableau.
const MadarPage = lazy(() => import('./pages/student/madar/MadarPage'));
// « Le labo des énigmes » (THINKING_LAB.md) : trois lots paresseux, sous RequireLargeScreen.
const ThinkingLadderPage = lazy(() => import('./pages/student/thinking/ThinkingLadderPage'));
const ThinkingChallengePage = lazy(() => import('./pages/student/thinking/ThinkingChallengePage'));
const ThinkingNumberPage = lazy(() => import('./pages/student/thinking/ThinkingNumberPage'));
// … et son « Aperçu du professeur » (lecture seule, /enseignant/enigmes).
const TeacherThinkingListPage = lazy(() => import('./pages/teacher/thinking/TeacherThinkingListPage'));
const TeacherThinkingChallengePage = lazy(() => import('./pages/teacher/thinking/TeacherThinkingChallengePage'));
const GamesHub = lazy(() => import('./pages/student/madar/GamesHub'));
const TeacherMadarDisplay = lazy(() => import('./pages/teacher/MadarDisplayPage'));
const TeacherClassSession = lazy(() => import('./pages/teacher/ClassSessionPage'));
const TeacherLessonFile = lazy(() => import('./pages/teacher/LessonFilePage'));
const TeacherLessonTracking = lazy(() =>
  import('./pages/teacher/LessonToolPages').then((m) => ({ default: m.LessonTrackingPage })),
);
const TeacherLessonCard = lazy(() =>
  import('./pages/teacher/LessonToolPages').then((m) => ({ default: m.LessonCardPage })),
);
const TeacherGamesPage = lazy(() => import('./pages/teacher/TeacherGamesPage'));
const AdminDailyChallenge = lazy(() => import('./pages/admin/dailyChallenge/DailyChallengeConfig'));
// L'atelier (Math Lab) : les instruments LIBRES de l'élève, hors de
// toute leçon. Paresseux, comme la pratique — et le tableau blanc charge son moteur
// (Excalidraw) paresseusement à son tour : aucune autre page ne le paie.
const MathLabHome = lazy(() => import('./pages/student/MathLab'));
const MathLabToolPage = lazy(() => import('./pages/student/MathLab').then((m) => ({ default: m.MathLabToolPage })));
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminOnlyOutlet from './components/auth/AdminOnlyOutlet';
import { FeatureOutlet, PaidOutlet } from './components/auth/FeatureOutlet';
import { prefetchBooksForLocation } from './features/books/bookCache';
import RequireAccount from './components/auth/RequireAccount';
import RequireLargeScreen from './components/auth/RequireLargeScreen';

import { AuthProvider } from './context/AuthContext';
import { WorkspaceLayoutProvider } from './context/WorkspaceLayoutContext';
import { NotebookProvider } from './features/practice/notebook/NotebookProvider';
import { MathLabOverlayProvider } from './features/mathlab/overlay/MathLabOverlayProvider';
import { ContentAvailabilityProvider } from './context/ContentAvailabilityContext';
import { PaymentsProvider } from './context/PaymentsContext';
import { StudyContextProvider } from './context/StudyContextContext';
import { useLessonProgressSync } from './hooks/useLessonProgressSync';
import { useLessonRoutes } from './lessons/lessonRouteBoundary';
import { preloadNamespace } from './i18n/index.js';
import StudyTimeTracker from './features/studyTime/StudyTimeTracker';

// ---- PREMIÈRE SPÉCIALITÉ ----

// Hydrates local lesson progress from the server on login and flushes the
// offline queue — must live inside AuthProvider, hence this null component.
function LessonProgressSync() {
  useLessonProgressSync();
  return null;
}

// Lesson routes: ONE lazy boundary for every lesson (2026-10-14). App.jsx no
// longer imports any lesson's routes.jsx: `useLessonRoutes()`
// (lessons/lessonRouteBoundary.jsx) gives one `<basePath>/*` route per built
// lesson (paths from the generated lesson index), which loads that lesson's
// routes.jsx — and with it its lesson.config.js — then mounts the lesson's
// own routes in its place. An unmatched /courses/... URL still falls through
// to the catch-all below. scripts/check-routes.mjs checks the boundary is
// mounted and that every lesson is in the index; see
// docs/architecture/LESSON_CONTRACT.md and BUNDLE_BOUNDARIES.md.
//
// Les leçons FRANÇAISES héritées ont été supprimées du dépôt (2026-09-25).
const UnitPage = lazy(() => import('./pages/UnitPage'));

export default function App() {
  return (
    <AuthProvider>
      <LessonProgressSync />
      {/* « Are payments open? » — read once, for visitors too; closed until the server says otherwise. */}
      <PaymentsProvider>
        <ContentAvailabilityProvider>
          <StudyContextProvider>
            <WorkspaceLayoutProvider>
              {/* LE cahier de l'élève : une seule fenêtre pour toute l'application,
            au-dessus du routeur pour survivre au changement de module. Les
            pages de leçon lui publient leur position (LessonNotebookAnchor). */}
              <NotebookProvider>
                {/* L'ATELIER posé SUR la leçon : un seul calque pour toute
            l'application, au-dessus du routeur lui aussi — ouvrir un
            instrument ne doit jamais démonter la leçon, sinon l'élève perd sa
            place (features/mathlab/overlay/). */}
                <MathLabOverlayProvider>
                  <Router>
                    {/* Le TEMPS RÉEL d'étude de l'élève (PARENT_SPACE.md §3) : un composant
              nul sous le routeur — il lit l'adresse pour savoir où le temps passe. */}
                    <StudyTimeTracker />
                    {/* Frontière d'attente UNIQUE pour les routes découpées (admin,
              moteur d'exercices, pages légales, diagnostic). Elle est posée
              AUTOUR du routeur : la coquille (barre de navigation, pied de
              page) est rendue par les layouts à l'intérieur de chaque route,
              et un repli neutre évite un écran blanc pendant le téléchargement
              du lot de la page. Les leçons ont en plus leur propre <Suspense>
              (frontière de routes, puis celui que buildLessonRoutes pose autour
              de leur contenu) : la coquille reste à l'écran. */}
                    <Suspense fallback={<div className="min-h-screen bg-[#FAFAFA]" />}>
                      <AppRoutes />
                    </Suspense>
                  </Router>
                </MathLabOverlayProvider>
              </NotebookProvider>
            </WorkspaceLayoutProvider>
          </StudyContextProvider>
        </ContentAvailabilityProvider>
      </PaymentsProvider>
    </AuthProvider>
  );
}

// Les routes de l'application. À part pour que le chargement des routes d'une
// leçon (useLessonRoutes) ne rende de nouveau QUE le routeur, pas les
// fournisseurs au-dessus.
function AppRoutes() {
  const lessonRoutes = useLessonRoutes();
  return (
    <Routes>
      {/* Le panneau d'administration. `allowedRoles` est explicite ici :
          c'était le défaut de ProtectedRoute, mais l'écrire rend la porte
          lisible sur place. La vraie protection reste serveur — chaque
          /api/v1/admin/* est derrière can:admin, sauf la librairie et « Mon compte »
          derrière can:books, que le « gestionnaire de la librairie » ouvre aussi
          (voir AdminAuthorizationTest). */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'book_manager']} />}>
        <Route element={<AdminLayout />}>
          {/* L'administrateur SEUL. Le gestionnaire de la librairie (book_manager)
              est ramené aux commandes (AdminOnlyOutlet, BOOKS_STORE.md §6ter). */}
          <Route element={<AdminOnlyOutlet />}>
            <Route index element={<AdminDashboard />} />

            <Route path="analytics/plateforme" element={<PlatformAnalytics />} />
            <Route path="analytics/apprentissage" element={<LearningAnalytics />} />
            <Route path="analytics/contenu" element={<ContentAnalytics />} />
            <Route path="analytics/points" element={<LearningPointAnalytics />} />

            <Route path="contenu/lecons" element={<AdminLessons />} />
            <Route path="contenu/lecons/:code" element={<AdminLessonDetail />} />
            <Route path="contenu/exercices" element={<AdminExercises />} />

            <Route path="signalements" element={<AdminReportList />} />
            <Route path="signalements/:id" element={<AdminReportDetail />} />

            <Route path="eleves" element={<AdminStudentList />} />
            <Route path="eleves/:id" element={<AdminStudentDetail />} />

            {/* Les codes d'activation remplacent les abonnements Stripe :
                c'est par eux que l'accès payant est accordé (master spec
                §17). Les écrans Subscriptions.jsx/Payments restent sur le
                disque, démontés. */}
            <Route path="codes-activation" element={<AdminActivationCodes />} />
            <Route path="codes-activation/lots" element={<AdminActivationBatches />} />
            <Route path="codes-activation/:id" element={<AdminActivationCodeDetail />} />

            {/* Les enseignants, leurs classes, les offres et les demandes :
                la surface de contrôle du modèle commercial — activation
                MANUELLE, jamais un paiement en ligne. */}
            <Route path="enseignants" element={<AdminTeacherList />} />
            <Route path="enseignants/:id" element={<AdminTeacherDetail />} />
            <Route path="classes" element={<AdminClassroomList />} />
            <Route path="classes/:id" element={<AdminClassroomDetail />} />
            <Route path="etablissements" element={<AdminSchoolList />} />
            <Route path="etablissements/:id" element={<AdminSchoolDetail />} />
            <Route path="offres" element={<AdminPlanList />} />
            <Route path="offres/demandes" element={<AdminSubscriptionRequests />} />
            <Route path="offres/abonnements" element={<AdminSubscriptions />} />
            <Route path="offres/acces" element={<AdminAccessLimits />} />
            <Route element={<FeatureOutlet feature="dailyChallenge" home="/admin" />}>
              <Route path="offres/defi-quotidien" element={<AdminDailyChallenge />} />
            </Route>
            <Route path="offres/:id" element={<AdminPlanEditor />} />

            <Route path="systeme/journal" element={<AdminActivityLog />} />
            <Route path="systeme/coherence" element={<AdminRegistryHealth />} />
            <Route path="systeme/messages" element={<AdminContactMessages />} />
            <Route element={<FeatureOutlet feature="books" home="/admin" />}>
              <Route path="livres/gestionnaires" element={<AdminBookManagers />} />
            </Route>
          </Route>

          {/* La librairie et « Mon compte » : l'administrateur ET le gestionnaire (can:books). */}
          <Route path="compte" element={<AdminProfile />} />
          <Route path="compte/securite" element={<AdminSecurity />} />
          <Route element={<FeatureOutlet feature="books" home="/admin" />}>
            <Route path="livres" element={<AdminBookCatalog />} />
            <Route path="livres/commandes" element={<AdminBookOrders />} />
            <Route path="livres/commandes/:id" element={<AdminBookOrderDetail />} />
            <Route path="livres/messages" element={<AdminBookMessages />} />
          </Route>
        </Route>
      </Route>

      {/* L'ESPACE ÉLÈVE. Rôle vérifié ici ; la vraie porte reste le serveur. */}
      <Route path="/espace" element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="bienvenue/nom" element={<CompleteName />} />
        <Route path="bienvenue" element={<ChooseGrade />} />
        <Route element={<FeatureOutlet feature="diagnostic" home="/espace" />}>
          <Route path="diagnostic" element={<DiagnosticIntro />} />
          <Route path="diagnostic/run" element={<DiagnosticRun />} />
          <Route path="diagnostic/resultat" element={<DiagnosticResult />} />
        </Route>
        {/* « Madar » : PLEIN ÉCRAN, hors de StudentLayout — un jeu se joue sans
            barre latérale ni barre d'onglets, au téléphone comme au portable
            (MADAR_GAME.md). Le serveur tient cœurs, parties et classement. */}
        {/* « Espace jeux » : la salle (trois jeux) puis la page de chaque jeu. */}
        <Route path="jeux" element={<GamesHub />} />
        <Route path="jeux/:game" element={<MadarPage />} />
        <Route element={<StudentLayout />}>
          <Route index element={<StudentHome />} />
          <Route path="cours" element={<MesCours />} />
          <Route path="explorer" element={<Explorer />} />
          <Route path="progression" element={<Progression />} />
          {/* « Mon cahier » : l'espace de TOUTES les notes de l'élève —
              retrouver, ranger, imprimer, réviser. La progression, elle,
              ne parle plus que de progression. */}
          <Route path="cahier" element={<Notebook />} />
          <Route path="cahier/revision" element={<NotebookReviewPage />} />
          <Route path="cahier/:noteId" element={<NotebookNotePage />} />
          <Route path="profil" element={<Profil />} />
          {/* « Ce que voit ton parent » : le rapport que lit le parent, lu par l'élève lui-même. */}
          <Route path="profil/parent" element={<StudentParentView />} />
          {/* The activation code: pointless while payments are closed (everyone has full access) — the server still
              accepts a code. */}
          <Route element={<PaidOutlet home="/espace" />}>
            <Route path="activation" element={<Activation />} />
          </Route>
          {/* La pratique vit DANS l'espace élève, avec la même barre
              latérale que les leçons : les routes de leçon passent par
              CourseLayout, qui rend StudentLayout dès qu'on est connecté.
              La pratique exige un compte, donc elle s'y branche
              directement. */}
          {/* Exercices : tablette et ordinateur seulement (RequireLargeScreen). */}
          <Route element={<RequireLargeScreen />}>
            <Route path="pratique/:lessonCode" element={<PracticeHub />} />
            <Route path="pratique/:lessonCode/session/:sessionId" element={<PracticeSession />} />
            <Route path="pratique/:lessonCode/bilan/:sessionId" element={<PracticeSummary />} />
            {/* La correction de l'enseignant, ouverte depuis la cloche — en lecture seule. */}
            <Route path="corrections/:reviewId" element={<AnswerReviewPage />} />
            {/* « Le labo des énigmes » : l'échelle, un défi (par son id stable), un numéro (« Défi 318 »).
              Le serveur juge, compte et ouvre la porte ; ces pages ne font qu'afficher. */}
            <Route element={<FeatureOutlet feature="thinkingLab" home="/espace" />}>
              <Route path="enigmes" element={<ThinkingLadderPage />} />
              <Route path="enigmes/n/:number" element={<ThinkingNumberPage />} />
              <Route path="enigmes/:challengeId" element={<ThinkingChallengePage />} />
            </Route>
            {/* « Ma boussole » : la jauge de départ et son plan (YEAR_COMPASS.md). Le serveur sert et corrige. */}
            <Route element={<FeatureOutlet feature="compass" home="/espace" />}>
              <Route path="boussole" element={<CompassPage />} />
            </Route>
          </Route>
          {/* « Défi du jour » : le serveur tient la tentative ; ces
              routes ne font que l'afficher (DAILY_CHALLENGE.md). */}
          <Route element={<FeatureOutlet feature="dailyChallenge" home="/espace" />}>
            <Route path="defi" element={<DailyChallengePage />} />
            <Route path="defi/historique" element={<ChallengeHistoryPage />} />
            <Route path="defi/:attemptId" element={<ChallengeReviewPage />} />
          </Route>
          {/* L'atelier : l'accueil, puis un instrument par
              segment d'URL (résolu dans le registre, features/mathlab),
              avec ou sans document enregistré. Un instrument de plus
              n'ajoute pas de route ici. */}
          <Route path="atelier" element={<MathLabHome />} />
          <Route path="atelier/:toolSlug" element={<MathLabToolPage />} />
          <Route path="atelier/:toolSlug/:documentId" element={<MathLabToolPage />} />
          {/* « Ma classe » : la classe de l'enseignant que l'élève a rejointe, ou
              peut rejoindre par code / lien de classe. Un contexte, pas un
              contenu : le serveur reste l'autorité sur ce qui est visible. */}
          <Route path="classe" element={<Qism />} />
        </Route>
      </Route>

      {/* L'ESPACE ENSEIGNANT. Rôle vérifié ici par ProtectedRoute ; la vraie
          porte reste le serveur : chaque /api/v1/teacher/* est derrière
          can:teacher (TeacherAuthorizationTest), et la propriété d'une
          classe derrière ClassroomPolicy. */}
      <Route path="/enseignant" element={<ProtectedRoute allowedRoles={['teacher']} />}>
        {/* Le mode d'AFFICHAGE du défi : plein écran, hors de la coquille
            enseignant — c'est ce que la classe voit au tableau. */}
        <Route element={<FeatureOutlet feature="dailyChallenge" home="/enseignant" />}>
          <Route path="classes/:id/defi/affichage" element={<TeacherChallengeDisplay />} />
        </Route>
        <Route path="classes/:id/jeux/affichage" element={<TeacherMadarDisplay />} />
        {/* « séance en classe » : la séance en classe d'une leçon (plan de la classe, test, podium) — plein écran, au tableau (CLASS_SESSION.md). */}
        {/* tablette et ordinateur seulement : la séance de classe se projette */}
        <Route element={<RequireLargeScreen />}>
          <Route path="seance/:lessonId" element={<TeacherClassSession />} />
        </Route>
        {/* « Défie ton professeur » : l'enseignant joue dans UNE de ses classes — la même
            salle et les mêmes jeux que l'élève, plein écran, hors coquille. */}
        <Route path="classes/:classId/jeux" element={<GamesHub />} />
        <Route path="classes/:classId/jeux/:game" element={<MadarPage />} />
        <Route path="bienvenue" element={<CompleteName />} />
        <Route element={<TeacherLayout />}>
          <Route index element={<TeacherHome />} />
          <Route path="classes" element={<TeacherClassGroupList />} />
          <Route path="jeux" element={<TeacherGamesPage />} />
          <Route path="classes/nouveau" element={<TeacherClassGroupCreate />} />
          <Route path="classes/:id" element={<TeacherClassGroupDetail />} />
          <Route path="classes/:id/eleves/:studentId" element={<TeacherStudentProgress />} />
          {/* Le cahier d'un élève, en LECTURE SEULE. La vraie porte est
              le serveur : ClassroomPolicy + appartenance à la classe
              (TeacherClassroomNotebookTest). */}
          <Route path="classes/:id/eleves/:studentId/cahier" element={<TeacherStudentNotebook />} />
          {/* « Réponses à corriger » : photos de copie et démonstrations des élèves en
              « Correction du professeur » (AnswerReviewService, 2026-10-06). */}
          <Route path="corrections" element={<TeacherReviews />} />
          <Route element={<PaidOutlet home="/enseignant" />}>
            <Route path="offre" element={<TeacherSubscription />} />
          </Route>
          <Route path="profil" element={<TeacherProfile />} />
          <Route path="etablissement" element={<TeacherSchoolPage />} />
          {/* L'ENSEIGNANT APPREND COMME UN ÉLÈVE — mêmes pages, même
              moteur, dans SON espace : le catalogue (Explorer), le
              atelier et son cahier (à lui : le serveur ne sert que les
              notes et documents du compte). Les leçons elles-mêmes
              restent sur /courses/… et CourseLayout rend TeacherLayout
              pour lui ; ce qui change n'est pas la page mais le LECTEUR
              (features/learning/learningViewer) : tous les modules
              ouverts, aucune progression écrite. */}
          <Route path="cours" element={<Explorer />} />
          {/* « La fiche du professeur » : le guide d'orchestration d'une séance,
              construit depuis la leçon (features/teacher/lessonMemo).
              Enseignant seulement — la porte est ce ProtectedRoute ;
              les notes « Mon cahier » qu'elle affiche sont servies par le
              serveur au seul propriétaire. */}
          <Route element={<RequireLargeScreen />}>
            <Route path="cours/:lessonId/memoire" element={<TeacherLessonMemo />} />
          </Route>
          {/* La pratique de la leçon, côté ENSEIGNANT : on y entre PAR LA
              LEÇON, et le Hub est la MÊME page que celle de l'élève
              (PracticeHub, mode enseignant : aucun suivi). Le lecteur
              vérifie localement et montre les réponses de SES élèves ;
              le serveur garde les écritures derrière `learner`. */}
          <Route element={<RequireLargeScreen />}>
            {/* TeacherBankGate : une leçon qui a son tableau (« séance en classe ») a la banque d'exercices de l'enseignant et montre
              un exercice sur le tableau de la classe ; les autres gardent le Hub et le lecteur d'avant. */}
            {/* « Dossier de la leçon » : le fichier de travail de l'enseignant sur UNE leçon — DANS son espace (la navigation reste),
              hors de l'atelier ; seul le plein écran du tableau blanc la recouvre. */}
            <Route path="dossier/:lessonId" element={<TeacherLessonFile />} />
            {/* « Suivi de la classe » et « fiche de connaissances » d'une leçon : dans l'espace enseignant, sous l'en-tête commun des outils */}
            <Route path="suivi/:lessonId" element={<TeacherLessonTracking />} />
            <Route path="carte/:lessonId" element={<TeacherLessonCard />} />
            <Route path="pratique/:lessonCode" element={<TeacherBankGate />} />
            <Route path="pratique/:lessonCode/:level/:exerciseId" element={<TeacherBankGate player />} />
          </Route>
          <Route path="atelier" element={<MathLabHome />} />
          <Route path="atelier/:toolSlug" element={<MathLabToolPage />} />
          <Route path="atelier/:toolSlug/:documentId" element={<MathLabToolPage />} />
          {/* « Le labo des énigmes » : la PRÉVISUALISATION de l'enseignant (THINKING_LAB.md §8bis) — tout ouvert,
              rien d'écrit ; la porte du serveur est `can:teacher`. */}
          <Route element={<RequireLargeScreen />}>
            <Route element={<FeatureOutlet feature="thinkingLab" home="/enseignant" />}>
              <Route path="enigmes" element={<TeacherThinkingListPage />} />
              <Route path="enigmes/:challengeId" element={<TeacherThinkingChallengePage />} />
            </Route>
          </Route>
          <Route path="cahier" element={<Notebook />} />
          <Route path="cahier/revision" element={<NotebookReviewPage />} />
          <Route path="cahier/:noteId" element={<NotebookNotePage />} />
        </Route>
      </Route>

      {/* « lien parent » — le lien privé du parent, SANS compte : hors de toute
          coquille, téléphone d'abord. Le jeton est la porte ; le serveur la
          garde (ParentAccessLinkService). PARENT_SPACE.md §2. */}
      <Route path="/p/:token" element={<ParentLinkPage />} />

      {/* Le lien d'un établissement pour ses professeurs : un professeur connecté le suit et rejoint
          l'établissement (le jeton est la porte, SchoolStructureController). */}
      <Route path="/rejoindre/etablissement" element={<ProtectedRoute allowedRoles={['teacher']} />}>
        <Route element={<TeacherLayout />}>
          <Route path=":token" element={<TeacherSchoolJoin />} />
        </Route>
      </Route>

      {/* « Espace parent » (compte parent — gardé pour plus tard, plus d'inscription
          publique depuis 2026-10-23). Rôle vérifié ici ; la vraie porte est le serveur :
          chaque /api/v1/parent/* est derrière can:parent, et chaque lecture
          d'un enfant derrière un LIEN ACTIF (ParentLinkService::activeLink). */}
      <Route path="/parent" element={<ProtectedRoute allowedRoles={['parent']} />}>
        <Route path="bienvenue" element={<CompleteName />} />
        <Route element={<ParentLayout />}>
          <Route index element={<ParentHome />} />
          <Route path="enfants/:studentId" element={<ParentChildReport />} />
          <Route path="protection" element={<DeviceGuidePage />} />
        </Route>
      </Route>

      {/* « Espace établissement » — le directeur d'un établissement. Rôle vérifié ici ;
          la vraie porte est le serveur : /api/v1/school/* derrière can:school
          et une nomination active (SchoolAccess::schoolOf). */}
      <Route path="/etablissement" element={<ProtectedRoute allowedRoles={['school_admin']} />}>
        {/* « Mode réunion » : plein écran, hors de la coquille (projecteur). */}
        <Route path="reunion/:reportId" element={<SchoolMeeting />} />
        <Route element={<SchoolLayout />}>
          <Route index element={<SchoolHome />} />
          <Route path="classes" element={<SchoolClassrooms />} />
          <Route path="professeurs" element={<SchoolTeachers />} />
          <Route path="eleves" element={<SchoolStudents />} />
          <Route path="eleves/:studentId" element={<SchoolStudentFile />} />
          <Route path="savoir-faire" element={<SchoolLearningMap />} />
          <Route path="rapports" element={<SchoolReports />} />
          <Route path="rapports/:reportId" element={<SchoolReport />} />
          <Route path="reglages" element={<SchoolSettings />} />
        </Route>
      </Route>

      <Route element={<MainLayout />}>
        {/* Connexion et inscription SOUS la coquille visiteur : ce sont
            des pages publiques, et arriver sur « Se connecter » sans
            barre de navigation laissait le visiteur sans retour vers le
            site — le seul chemin était le bouton « retour » du
            navigateur. Elles se redirigent d'elles-mêmes une fois la
            session ouverte, donc aucun risque de les montrer ici. */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
        <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
        <Route path="/methode" element={<Methode />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />

        {/* L'écran d'attente entre l'inscription et l'espace élève.
            Publique : l'élève y arrive aussi en revenant du lien reçu
            par courriel, éventuellement dans un autre navigateur, donc
            sans session. Elle ne garde aucune porte — c'est le serveur
            qui ferme l'espace tant que l'adresse n'est pas prouvée. */}
        <Route path="/verification-email" element={<VerificationEmail />} />

        {/* Le retour de Google. Publique par nature : personne n'est
            encore authentifié quand la connexion commence. */}
        <Route path="/auth/google" element={<AuthGoogle />} />

        {/* Le LIEN DE CLASSE, ouvert depuis WhatsApp, souvent
            sans compte. Publique ; l'adhésion reste une requête de l'élève
            authentifié, après son consentement. L'ancienne adresse des
            invitations par courriel (/rejoindre/:token) aboutit à la même
            page, qui la dit invalide — aucun chemin mort. */}
        <Route path="/rejoindre/classe/:token" element={<JoinClassLink />} />
        <Route path="/rejoindre/:token" element={<JoinClassLink />} />

        {/* ── Les pages légales ───────────────────────────────────
            Publiques et accessibles SANS compte : on doit pouvoir lire
            ce que l'on accepte avant de l'accepter. Elles sont liées
            depuis le pied de page et depuis la case de consentement. */}
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/confidentialite" element={<Confidentialite />} />
        <Route path="/cgu" element={<CGU />} />
        {/* « Un appareil pour étudier » : le guide des parents, PUBLIC (PARENT_SPACE.md §6). */}
        <Route path="/protection" element={<DeviceGuidePage />} />

        <Route element={<FeatureOutlet feature="books" home="/" />}>
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:slug" element={<BookDetailPage />} />
        </Route>
        <Route path="*" element={<HomeRedirect />} />
      </Route>

      <Route element={<CourseLayout />}>
        {/* Un élève connecté n'atterrit pas sur la page de vente : il
            est renvoyé vers /espace (voir HomeRedirect). */}
        <Route path="/" element={<HomeRedirect />} />
        {/* Catalogue, unités et leçons : compte obligatoire (RequireAccount).
            Seul "/" reste ouvert au visiteur. */}
        <Route element={<RequireAccount />}>
          <Route path="/courses" element={<Courses />} />
          {/* La page d'une UNITÉ du programme (le chapitre) : le niveau entre le thème et la leçon (phase 8). */}
          <Route path="/courses/:levelId/:gradeId/:chapterId/units/:unitId" element={<UnitPage />} />

          {/* Les leçons — UNE frontière paresseuse (lessons/lessonRouteBoundary.jsx) :
            une route `<chemin de la leçon>/*` par leçon construite, remplacée
            par les routes réelles de la leçon dès qu'elles sont chargées.
            check-routes.mjs vérifie le montage, check-dormant-isolation.mjs
            qu'aucun dossier français ne revient. */}
          {/* Tablette et ordinateur seulement : un téléphone lit un message
            à la place de la leçon (RequireLargeScreen, 2026-10-27). */}
          <Route element={<RequireLargeScreen />}>{lessonRoutes}</Route>
        </Route>

      </Route>
    </Routes>
  );
}
