import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import StudentLayout from './components/layout/StudentLayout';
import CourseLayout from './components/layout/CourseLayout';
import Home from './pages/Home';
import Methode from './pages/Methode';
import About from './pages/About';
import Courses from './pages/Courses';
import Tarifs from './pages/Tarifs';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminLessons from './pages/admin/content/Lessons';
import AdminLessonDetail from './pages/admin/content/LessonDetail';
import AdminModules from './pages/admin/content/Modules';
import AdminExercises from './pages/admin/content/Exercises';
import AdminReportList from './pages/admin/reports/ReportList';
import AdminReportDetail from './pages/admin/reports/ReportDetail';
import AdminStudentList from './pages/admin/students/StudentList';
import AdminStudentDetail from './pages/admin/students/StudentDetail';
import { PlatformAnalytics, LearningAnalytics } from './pages/admin/analytics/Platform';
import { ContentAnalytics, LearningPointAnalytics } from './pages/admin/analytics/ContentAnalytics';
import { AdminSubscriptions, AdminPayments } from './pages/admin/subscriptions/Subscriptions';
import { AdminProfile, AdminSecurity } from './pages/admin/account/Account';
import AdminActivityLog from './pages/admin/system/ActivityLog';
import AdminRegistryHealth from './pages/admin/system/RegistryHealth';
import AdminContactMessages from './pages/admin/system/ContactMessages';
import StudentHome from './pages/student/StudentHome';
import MesCours from './pages/student/MesCours';
import Explorer from './pages/student/Explorer';
import Progression from './pages/student/Progression';
import Profil from './pages/student/Profil';
import ChooseGrade from './pages/student/ChooseGrade';
import DiagnosticIntro from './pages/student/diagnostic/DiagnosticIntro';
import DiagnosticRun from './pages/student/diagnostic/DiagnosticRun';
import DiagnosticResult from './pages/student/diagnostic/DiagnosticResult';
// Moteur d'exercices. Trois routes paramétrées, pas une par leçon : la
// pratique est indépendante de l'arbre des leçons, et `lessonCode` suffit
// puisque les codes de leçon sont globalement uniques.
import PracticeHub from './pages/student/practice/PracticeHub';
import PracticeSession from './pages/student/practice/PracticeSession';
import PracticeSummary from './pages/student/practice/PracticeSummary';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { WorkspaceLayoutProvider } from './context/WorkspaceLayoutContext';
import { ContentAvailabilityProvider } from './context/ContentAvailabilityContext';
import { useLessonProgressSync } from './hooks/useLessonProgressSync';
import fractionsRoutes from './lessons/college/6e/nombres_calculs/fractions/routes';
import quatreOperationsRoutes from './lessons/college/6e/nombres_calculs/quatre-operations/routes';
import nombresEntiersRoutes from './lessons/college/6e/nombres_calculs/nombres-entiers/routes';
import racinesCarrees4eRoutes from './lessons/college/4e/nombres_calculs/racines-carrees/routes';
import operations5eRoutes from './lessons/college/5e/nombres_calculs/operations-5e/routes';
import nombresRelatifs5eRoutes from './lessons/college/5e/nombres_calculs/nombres-relatifs-5e/routes';
import nombresRationnels5eRoutes from './lessons/college/5e/nombres_calculs/nombres-rationnels-5e/routes';
import puissances5eRoutes from './lessons/college/5e/nombres_calculs/puissances-5e/routes';
import calculLitteral5eRoutes from './lessons/college/5e/nombres_calculs/calcul-litteral-5e/routes';
import transformations5eRoutes from './lessons/college/5e/espace_geometrie/transformations-5e/routes';
import angles5eRoutes from './lessons/college/5e/espace_geometrie/angles-5e/routes';
import triangles5eRoutes from './lessons/college/5e/espace_geometrie/triangles-5e/routes';
import parallelogrammes5eRoutes from './lessons/college/5e/espace_geometrie/parallelogrammes-5e/routes';
import reperage5eRoutes from './lessons/college/5e/espace_geometrie/reperage-5e/routes';
import representationsEspace5eRoutes from './lessons/college/5e/espace_geometrie/representations-espace-5e/routes';
import proportionnalite5eRoutes from './lessons/college/5e/proportionnalite_fonctions/proportionnalite-5e/routes';
import fonctions5eRoutes from './lessons/college/5e/proportionnalite_fonctions/fonctions-5e/routes';
import statistiques5eRoutes from './lessons/college/5e/donnees_probabilites/statistiques-5e/routes';
import probabilites5eRoutes from './lessons/college/5e/donnees_probabilites/probabilites-5e/routes';
import algorithmiqueProgrammation5eRoutes from './lessons/college/5e/pensee_informatique/algorithmique-programmation-5e/routes';
import algorithmique4eRoutes from './lessons/college/4e/pensee_informatique/algorithmique-programmation-4e/routes';
import nombresRelatifs4eRoutes from './lessons/college/4e/nombres_calculs/nombres-relatifs-4e/routes';
import nombresRationnels4eRoutes from './lessons/college/4e/nombres_calculs/nombres-rationnels-4e/routes';
import puissances4eRoutes from './lessons/college/4e/nombres_calculs/puissances-4e/routes';
import calculLitteral4eRoutes from './lessons/college/4e/nombres_calculs/calcul-litteral-4e/routes';
import equations4eRoutes from './lessons/college/4e/nombres_calculs/equations-4e/routes';
import raisonnementProblemes4eRoutes from './lessons/college/4e/nombres_calculs/raisonnement-problemes-4e/routes';
import proportionnalite4eRoutes from './lessons/college/4e/proportionnalite_fonctions/proportionnalite-4e/routes';
import fonctions4eRoutes from './lessons/college/4e/proportionnalite_fonctions/fonctions-4e/routes';
import grandeursComposees4eRoutes from './lessons/college/4e/proportionnalite_fonctions/grandeurs-composees-4e/routes';
import probabilites4eRoutes from './lessons/college/4e/donnees_probabilites/probabilites-4e/routes';
import pythagore4eRoutes from './lessons/college/4e/espace_geometrie/pythagore-4e/routes';
import parallelogrammesTranslations4eRoutes from './lessons/college/4e/espace_geometrie/parallelogrammes-translations-4e/routes';
import triangles4eRoutes from './lessons/college/4e/espace_geometrie/triangles-4e/routes';
import transformations4eRoutes from './lessons/college/4e/espace_geometrie/transformations-4e/routes';
import representationsEspace4eRoutes from './lessons/college/4e/espace_geometrie/representations-espace-4e/routes';
import reperage4eRoutes from './lessons/college/4e/espace_geometrie/reperage-4e/routes';
import statistiques4eRoutes from './lessons/college/4e/donnees_probabilites/statistiques-4e/routes';
import racinesCarrees3eRoutes from './lessons/college/3e/nombres_calculs/racines-carrees/routes';
import reperageDroitePlan3eRoutes from './lessons/college/3e/espace_geometrie/reperage-droite-plan-3e/routes';
import triangles3eRoutes from './lessons/college/3e/espace_geometrie/triangles-3e/routes';
import translationsVecteurs3eRoutes from './lessons/college/3e/espace_geometrie/translations-vecteurs-3e/routes';
import trigo3eRoutes from './lessons/college/3e/espace_geometrie/trigonometrie-triangle-rectangle-3e/routes';
import representationEspace3eRoutes from './lessons/college/3e/espace_geometrie/representation-espace-3e/routes';
import thales3eRoutes from './lessons/college/3e/espace_geometrie/thales-3e/routes';
import fonctions3eRoutes from './lessons/college/3e/donnees_probabilites/fonctions-3e/routes';
import fonctionsLineaires3eRoutes from './lessons/college/3e/donnees_probabilites/fonctions-lineaires-3e/routes';
import fonctionsAffines3eRoutes from './lessons/college/3e/donnees_probabilites/fonctions-affines-3e/routes';
import representationGraphique3eRoutes from './lessons/college/3e/donnees_probabilites/representation-graphique-3e/routes';
import lectureGraphique3eRoutes from './lessons/college/3e/donnees_probabilites/lecture-graphique-3e/routes';
import statistiques3eRoutes from './lessons/college/3e/donnees_probabilites/statistiques-3e/routes';
import probabilites3eRoutes from './lessons/college/3e/donnees_probabilites/probabilites-3e/routes';
import proportionnalite3eRoutes from './lessons/college/3e/donnees_probabilites/proportionnalite-3e/routes';
import modelisation3eRoutes from './lessons/college/3e/donnees_probabilites/modelisation-3e/routes';
import pythagore3eRoutes from './lessons/college/3e/espace_geometrie/pythagore-3e/routes';
import resolutionProblemesRoutes from './lessons/college/6e/nombres_calculs/resolution-problemes/routes';
import equationsProduitRoutes from './lessons/college/3e/nombres_calculs/equations-produit/routes';
import nombresRationnelsRoutes from './lessons/college/3e/nombres_calculs/nombres-rationnels/routes';
import puissances3eRoutes from './lessons/college/3e/nombres_calculs/puissances-3e/routes';
import multiplesDiviseursRoutes from './lessons/college/3e/nombres_calculs/multiples-diviseurs/routes';
import calculLitteralAlgebriqueRoutes from './lessons/college/3e/nombres_calculs/calcul-litteral-algebrique/routes';
import resolutionProblemes3eRoutes from './lessons/college/3e/nombres_calculs/resolution-problemes-3e/routes';
import contenancesRoutes from './lessons/college/6e/grandeurs_mesures/contenances/routes';
import longueursRoutes from './lessons/college/6e/grandeurs_mesures/longueurs/routes';
import massesRoutes from './lessons/college/6e/grandeurs_mesures/masses/routes';
import perimetresRoutes from './lessons/college/6e/grandeurs_mesures/perimetres/routes';
import airesRoutes from './lessons/college/6e/grandeurs_mesures/aires/routes';
import dureesRoutes from './lessons/college/6e/grandeurs_mesures/durees/routes';
import anglesRoutes from './lessons/college/6e/grandeurs_mesures/angles/routes';
import nombresDecimauxRoutes from './lessons/college/6e/nombres_calculs/nombres-decimaux/routes';
import ordreGrandeurEstimationRoutes from './lessons/college/6e/nombres_calculs/ordre-grandeur-estimation/routes';
import reperagePlanRoutes from './lessons/college/6e/espace_geometrie/reperage-plan/routes';
import droitesSegmentsRoutes from './lessons/college/6e/espace_geometrie/droites-segments/routes';
import parallelismePerpendiculariteRoutes from './lessons/college/6e/espace_geometrie/parallelisme-perpendicularite/routes';
import figuresPlanesRoutes from './lessons/college/6e/espace_geometrie/figures-planes/routes';
import symetrieRoutes from './lessons/college/6e/espace_geometrie/symetrie/routes';
import solidesPatronsRoutes from './lessons/college/6e/espace_geometrie/solides-patrons/routes';
import tableauxRoutes from './lessons/college/6e/donnees_proportionnalite/tableaux/routes';
import graphiquesRoutes from './lessons/college/6e/donnees_proportionnalite/graphiques/routes';
import proportionnaliteRoutes from './lessons/college/6e/donnees_proportionnalite/proportionnalite/routes';
import constructionsGeometriquesRoutes from './lessons/college/6e/espace_geometrie/constructions-geometriques/routes';
import algorithmiqueProgrammationRoutes from './lessons/college/6e/algorithmique/algorithmique-programmation/routes';
import ensemblesIntervalles2ndeRoutes from './lessons/lycee/seconde/nombres_calculs/ensembles-et-intervalles-2nde/routes';
import nombresReels2ndeRoutes from './lessons/lycee/seconde/nombres_calculs/nombres-reels-2nde/routes';
import valeurAbsolue2ndeRoutes from './lessons/lycee/seconde/nombres_calculs/valeur-absolue-distance-2nde/routes';
import equationsInequations2ndeRoutes from './lessons/lycee/seconde/nombres_calculs/equations-et-inequations-2nde/routes';
import calculLitteral2ndeRoutes from './lessons/lycee/seconde/nombres_calculs/calcul-litteral-2nde/routes';
import arithmetique2ndeRoutes from './lessons/lycee/seconde/nombres_calculs/arithmetique-2nde/routes';
import logique2ndeRoutes from './lessons/lycee/seconde/nombres_calculs/logique-et-raisonnement-2nde/routes';
import vecteurs2ndeRoutes from './lessons/lycee/seconde/geometrie/vecteurs-2nde/routes';
import trigonometrieCercle2ndeRoutes from './lessons/lycee/seconde/geometrie/trigonometrie-cercle-2nde/routes';
import variablesEtInstructions2ndeRoutes from './lessons/lycee/seconde/algorithmique_programmation/variables-et-instructions-2nde/routes';
import fonctionsEnPython2ndeRoutes from './lessons/lycee/seconde/algorithmique_programmation/fonctions-en-python-2nde/routes';
import trigonometrieEquations2ndeRoutes from './lessons/lycee/seconde/geometrie/trigonometrie-equations-2nde/routes';
import colinearite2ndeRoutes from './lessons/lycee/seconde/geometrie/colinearite-alignement-2nde/routes';
import equationsDroites2ndeRoutes from './lessons/lycee/seconde/geometrie/equations-de-droites-2nde/routes';
import fonctionAffine2ndeRoutes from './lessons/lycee/seconde/fonctions/fonction-affine-2nde/routes';
import fonctions2ndeRoutes from './lessons/lycee/seconde/fonctions/fonctions-2nde/routes';
import fonctionsReference2ndeRoutes from './lessons/lycee/seconde/fonctions/fonctions-de-reference-2nde/routes';
import signeFonctions2ndeRoutes from './lessons/lycee/seconde/fonctions/signe-fonctions-2nde/routes';
import variations2ndeRoutes from './lessons/lycee/seconde/fonctions/variations-extremums-2nde/routes';
import positionsRelatives2ndeRoutes from './lessons/lycee/seconde/geometrie/positions-relatives-droites-2nde/routes';
import arbresProbabilites2ndeRoutes from './lessons/lycee/seconde/statistiques_probabilites/arbres-probabilites-2nde/routes';
import boitesMoustaches2ndeRoutes from './lessons/lycee/seconde/statistiques_probabilites/boites-a-moustaches-2nde/routes';
import evolutionsSuccessives2ndeRoutes from './lessons/lycee/seconde/statistiques_probabilites/evolutions-successives-reciproques-2nde/routes';
import frequencesConditionnelles2ndeRoutes from './lessons/lycee/seconde/statistiques_probabilites/frequences-conditionnelles-2nde/routes';
import loiGrandsNombres2ndeRoutes from './lessons/lycee/seconde/statistiques_probabilites/loi-grands-nombres-2nde/routes';
import probabilitesConditionnelles2ndeRoutes from './lessons/lycee/seconde/statistiques_probabilites/probabilites-conditionnelles-2nde/routes';
import proportionsPourcentages2ndeRoutes from './lessons/lycee/seconde/statistiques_probabilites/proportions-pourcentages-2nde/routes';
import seriesRegroupees2ndeRoutes from './lessons/lycee/seconde/statistiques_probabilites/series-regroupees-classes-2nde/routes';
import statistiquesUneVariable2ndeRoutes from './lessons/lycee/seconde/statistiques_probabilites/statistiques-une-variable-2nde/routes';
import tableauxCroises2ndeRoutes from './lessons/lycee/seconde/statistiques_probabilites/tableaux-croises-2nde/routes';
import testsDiagnostiques2ndeRoutes from './lessons/lycee/seconde/statistiques_probabilites/tests-diagnostiques-probabilites-2nde/routes';

// ---- PREMIÈRE SPÉCIALITÉ ----
import secondDegreResoudre1ereRoutes from './lessons/lycee/premiere_specialite/algebre/second-degre-resoudre-1ere/routes';
import secondDegreSigneProblemes1ereRoutes from './lessons/lycee/premiere_specialite/algebre/second-degre-signe-problemes-1ere/routes';
import suitesDecouvrir1ereRoutes from './lessons/lycee/premiere_specialite/algebre/suites-decouvrir-1ere/routes';
import suitesCalculerModeliser1ereRoutes from './lessons/lycee/premiere_specialite/algebre/suites-calculer-modeliser-1ere/routes';
import derivationNombreDerive1ereRoutes from './lessons/lycee/premiere_specialite/analyse/derivation-nombre-derive-1ere/routes';
import derivationCalculer1ereRoutes from './lessons/lycee/premiere_specialite/analyse/derivation-calculer-1ere/routes';
import derivationVariationsOptimisation1ereRoutes from './lessons/lycee/premiere_specialite/analyse/derivation-variations-optimisation-1ere/routes';
import trigonometrieCercleFonctions1ereRoutes from './lessons/lycee/premiere_specialite/analyse/trigonometrie-cercle-fonctions-1ere/routes';
import trigonometrieEquationsModeles1ereRoutes from './lessons/lycee/premiere_specialite/analyse/trigonometrie-equations-modeles-1ere/routes';
import exponentielleDecouvrir1ereRoutes from './lessons/lycee/premiere_specialite/analyse/exponentielle-decouvrir-1ere/routes';
import exponentielleCalculerModeliser1ereRoutes from './lessons/lycee/premiere_specialite/analyse/exponentielle-calculer-modeliser-1ere/routes';
import produitScalaireDefinir1ereRoutes from './lessons/lycee/premiere_specialite/geometrie/produit-scalaire-definir-1ere/routes';
import produitScalaireMesurerDemontrer1ereRoutes from './lessons/lycee/premiere_specialite/geometrie/produit-scalaire-mesurer-demontrer-1ere/routes';
import espaceVecteursCoordonnees1ereRoutes from './lessons/lycee/premiere_specialite/geometrie/espace-vecteurs-coordonnees-1ere/routes';
import espaceDroitesPlans1ereRoutes from './lessons/lycee/premiere_specialite/geometrie/espace-droites-plans-1ere/routes';
import variablesAleatoiresLoiEsperance1ereRoutes from './lessons/lycee/premiere_specialite/probabilites/variables-aleatoires-loi-esperance-1ere/routes';
import variablesAleatoiresDispersionBinomiale1ereRoutes from './lessons/lycee/premiere_specialite/probabilites/variables-aleatoires-dispersion-binomiale-1ere/routes';
import probabilitesConditionnellesArbres1ereRoutes from './lessons/lycee/premiere_specialite/probabilites/probabilites-conditionnelles-arbres-1ere/routes';
import probabilitesIndependance1ereRoutes from './lessons/lycee/premiere_specialite/probabilites/probabilites-independance-1ere/routes';

// Hydrates local lesson progress from the server on login and flushes the
// offline queue — must live inside AuthProvider, hence this null component.
function LessonProgressSync() {
  useLessonProgressSync();
  return null;
}

// Lesson routes: registered per lesson via a routes.jsx in the lesson's own
// directory (lazy-loaded), imported here and spread into <Routes> — see
// docs/architecture/LESSON_CONTRACT.md. An unmatched /courses/... URL falls
// through to the catch-all below.

export default function App() {
  return (
    <AuthProvider>
      <LessonProgressSync />
      <ContentAvailabilityProvider>
      <WorkspaceLayoutProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Le panneau d'administration. `allowedRoles` est explicite ici :
              c'était le défaut de ProtectedRoute, mais l'écrire rend la porte
              lisible sur place. La vraie protection reste serveur — chaque
              /api/v1/admin/* est derrière can:admin (voir AdminAuthorizationTest). */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />

              <Route path="analytics/plateforme" element={<PlatformAnalytics />} />
              <Route path="analytics/apprentissage" element={<LearningAnalytics />} />
              <Route path="analytics/contenu" element={<ContentAnalytics />} />
              <Route path="analytics/points" element={<LearningPointAnalytics />} />

              <Route path="contenu/lecons" element={<AdminLessons />} />
              <Route path="contenu/lecons/:code" element={<AdminLessonDetail />} />
              <Route path="contenu/modules" element={<AdminModules />} />
              <Route path="contenu/exercices" element={<AdminExercises />} />

              <Route path="signalements" element={<AdminReportList />} />
              <Route path="signalements/:id" element={<AdminReportDetail />} />

              <Route path="eleves" element={<AdminStudentList />} />
              <Route path="eleves/:id" element={<AdminStudentDetail />} />

              <Route path="abonnements" element={<AdminSubscriptions />} />
              <Route path="abonnements/paiements" element={<AdminPayments />} />

              <Route path="compte" element={<AdminProfile />} />
              <Route path="compte/securite" element={<AdminSecurity />} />

              <Route path="systeme/journal" element={<AdminActivityLog />} />
              <Route path="systeme/coherence" element={<AdminRegistryHealth />} />
              <Route path="systeme/messages" element={<AdminContactMessages />} />
            </Route>
          </Route>

          <Route path="/espace" element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="bienvenue" element={<ChooseGrade />} />
            <Route path="diagnostic" element={<DiagnosticIntro />} />
            <Route path="diagnostic/run" element={<DiagnosticRun />} />
            <Route path="diagnostic/resultat" element={<DiagnosticResult />} />
            <Route element={<StudentLayout />}>
              <Route index element={<StudentHome />} />
              <Route path="cours" element={<MesCours />} />
              <Route path="explorer" element={<Explorer />} />
              <Route path="progression" element={<Progression />} />
              <Route path="profil" element={<Profil />} />
              {/* La pratique vit DANS l'espace élève, avec la même barre
                  latérale que les leçons : les routes de leçon passent par
                  CourseLayout, qui rend StudentLayout dès qu'on est connecté.
                  La pratique exige un compte, donc elle s'y branche
                  directement. */}
              <Route path="pratique/:lessonCode" element={<PracticeHub />} />
              <Route path="pratique/:lessonCode/session/:sessionId" element={<PracticeSession />} />
              <Route path="pratique/:lessonCode/bilan/:sessionId" element={<PracticeSummary />} />
            </Route>
          </Route>

          <Route element={<MainLayout />}>
            <Route path="/methode"  element={<Methode />} />
            <Route path="/about"    element={<About />} />
            <Route path="/tarifs"   element={<Tarifs />} />
            <Route path="/faq"      element={<FAQ />} />
            <Route path="*" element={<Home />} />
          </Route>

          <Route element={<CourseLayout />}>
            <Route path="/"         element={<Home />} />
            <Route path="/courses"  element={<Courses />} />
            {fractionsRoutes()}
            {quatreOperationsRoutes()}
            {nombresEntiersRoutes()}
            {racinesCarrees4eRoutes()}
            {operations5eRoutes()}
            {nombresRelatifs5eRoutes()}
            {nombresRationnels5eRoutes()}
            {puissances5eRoutes()}
            {calculLitteral5eRoutes()}
            {transformations5eRoutes()}
            {angles5eRoutes()}
            {triangles5eRoutes()}
            {parallelogrammes5eRoutes()}
            {reperage5eRoutes()}
            {representationsEspace5eRoutes()}
            {proportionnalite5eRoutes()}
            {fonctions5eRoutes()}
            {statistiques5eRoutes()}
            {probabilites5eRoutes()}
            {algorithmiqueProgrammation5eRoutes()}
            {nombresRelatifs4eRoutes()}
            {nombresRationnels4eRoutes()}
            {puissances4eRoutes()}
            {calculLitteral4eRoutes()}
            {equations4eRoutes()}
            {raisonnementProblemes4eRoutes()}
            {proportionnalite4eRoutes()}
            {fonctions4eRoutes()}
            {grandeursComposees4eRoutes()}
            {probabilites4eRoutes()}
            {pythagore4eRoutes()}
            {parallelogrammesTranslations4eRoutes()}
            {triangles4eRoutes()}
            {transformations4eRoutes()}
            {representationsEspace4eRoutes()}
            {reperage4eRoutes()}
            {statistiques4eRoutes()}
            {algorithmique4eRoutes()}
            {racinesCarrees3eRoutes()}
            {reperageDroitePlan3eRoutes()}
            {triangles3eRoutes()}
            {translationsVecteurs3eRoutes()}
            {trigo3eRoutes()}
            {representationEspace3eRoutes()}
            {thales3eRoutes()}
            {fonctions3eRoutes()}
            {fonctionsLineaires3eRoutes()}
            {fonctionsAffines3eRoutes()}
            {representationGraphique3eRoutes()}
            {lectureGraphique3eRoutes()}
            {statistiques3eRoutes()}
            {probabilites3eRoutes()}
            {proportionnalite3eRoutes()}
            {modelisation3eRoutes()}
            {pythagore3eRoutes()}
            {resolutionProblemesRoutes()}
            {equationsProduitRoutes()}
            {nombresRationnelsRoutes()}
            {puissances3eRoutes()}
            {multiplesDiviseursRoutes()}
            {calculLitteralAlgebriqueRoutes()}
            {resolutionProblemes3eRoutes()}
            {contenancesRoutes()}
            {longueursRoutes()}
            {massesRoutes()}
            {perimetresRoutes()}
            {airesRoutes()}
            {dureesRoutes()}
            {anglesRoutes()}
            {nombresDecimauxRoutes()}
            {ordreGrandeurEstimationRoutes()}
            {reperagePlanRoutes()}
            {droitesSegmentsRoutes()}
            {parallelismePerpendiculariteRoutes()}
            {figuresPlanesRoutes()}
            {symetrieRoutes()}
            {solidesPatronsRoutes()}
            {tableauxRoutes()}
            {graphiquesRoutes()}
            {proportionnaliteRoutes()}
            {constructionsGeometriquesRoutes()}
            {algorithmiqueProgrammationRoutes()}
            {ensemblesIntervalles2ndeRoutes()}
            {nombresReels2ndeRoutes()}
            {valeurAbsolue2ndeRoutes()}
            {equationsInequations2ndeRoutes()}
            {calculLitteral2ndeRoutes()}
            {arithmetique2ndeRoutes()}
            {logique2ndeRoutes()}
            {vecteurs2ndeRoutes()}
            {trigonometrieCercle2ndeRoutes()}
            {variablesEtInstructions2ndeRoutes()}
            {fonctionsEnPython2ndeRoutes()}
            {trigonometrieEquations2ndeRoutes()}
            {colinearite2ndeRoutes()}
            {equationsDroites2ndeRoutes()}
            {fonctionAffine2ndeRoutes()}
            {fonctions2ndeRoutes()}
            {fonctionsReference2ndeRoutes()}
            {signeFonctions2ndeRoutes()}
            {variations2ndeRoutes()}
            {positionsRelatives2ndeRoutes()}
            {arbresProbabilites2ndeRoutes()}
            {boitesMoustaches2ndeRoutes()}
            {evolutionsSuccessives2ndeRoutes()}
            {frequencesConditionnelles2ndeRoutes()}
            {loiGrandsNombres2ndeRoutes()}
            {probabilitesConditionnelles2ndeRoutes()}
            {proportionsPourcentages2ndeRoutes()}
            {seriesRegroupees2ndeRoutes()}
            {statistiquesUneVariable2ndeRoutes()}
            {tableauxCroises2ndeRoutes()}
            {testsDiagnostiques2ndeRoutes()}

            {/* ---- PREMIÈRE SPÉCIALITÉ ---- */}
            {secondDegreResoudre1ereRoutes()}
            {secondDegreSigneProblemes1ereRoutes()}
            {suitesDecouvrir1ereRoutes()}
            {suitesCalculerModeliser1ereRoutes()}
            {derivationNombreDerive1ereRoutes()}
            {derivationCalculer1ereRoutes()}
            {derivationVariationsOptimisation1ereRoutes()}
            {trigonometrieCercleFonctions1ereRoutes()}
            {trigonometrieEquationsModeles1ereRoutes()}
            {exponentielleDecouvrir1ereRoutes()}
            {exponentielleCalculerModeliser1ereRoutes()}
            {produitScalaireDefinir1ereRoutes()}
            {produitScalaireMesurerDemontrer1ereRoutes()}
            {espaceVecteursCoordonnees1ereRoutes()}
            {espaceDroitesPlans1ereRoutes()}
            {variablesAleatoiresLoiEsperance1ereRoutes()}
            {variablesAleatoiresDispersionBinomiale1ereRoutes()}
            {probabilitesConditionnellesArbres1ereRoutes()}
            {probabilitesIndependance1ereRoutes()}
          </Route>
        </Routes>
      </Router>
      </WorkspaceLayoutProvider>
      </ContentAvailabilityProvider>
    </AuthProvider>
  );
}
