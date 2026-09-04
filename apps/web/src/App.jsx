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
import AdminDashboard from './pages/AdminDashboard';
import StudentHome from './pages/student/StudentHome';
import MesCours from './pages/student/MesCours';
import Explorer from './pages/student/Explorer';
import Progression from './pages/student/Progression';
import Profil from './pages/student/Profil';
import ChooseGrade from './pages/student/ChooseGrade';
import DiagnosticIntro from './pages/student/diagnostic/DiagnosticIntro';
import DiagnosticRun from './pages/student/diagnostic/DiagnosticRun';
import DiagnosticResult from './pages/student/diagnostic/DiagnosticResult';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { useLessonProgressSync } from './hooks/useLessonProgressSync';
import fractionsRoutes from './lessons/college/6e/nombres_calculs/fractions/routes';
import quatreOperationsRoutes from './lessons/college/6e/nombres_calculs/quatre-operations/routes';
import nombresEntiersRoutes from './lessons/college/6e/nombres_calculs/nombres-entiers/routes';
import racinesCarrees4eRoutes from './lessons/college/4e/nombres_calculs/racines-carrees/routes';
import racinesCarrees3eRoutes from './lessons/college/3e/nombres_calculs/racines-carrees/routes';
import reperageDroitePlan3eRoutes from './lessons/college/3e/espace_geometrie/reperage-droite-plan-3e/routes';
import triangles3eRoutes from './lessons/college/3e/espace_geometrie/triangles-3e/routes';
import translationsVecteurs3eRoutes from './lessons/college/3e/espace_geometrie/translations-vecteurs-3e/routes';
import trigo3eRoutes from './lessons/college/3e/espace_geometrie/trigonometrie-triangle-rectangle-3e/routes';
import thales3eRoutes from './lessons/college/3e/espace_geometrie/thales-3e/routes';
import fonctionsLineairesAffinesRoutes from './lessons/college/3e/donnees_probabilites/fonctions-lineaires-affines/routes';
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
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route index element={<AdminDashboard />} />
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
            {racinesCarrees3eRoutes()}
            {reperageDroitePlan3eRoutes()}
            {triangles3eRoutes()}
            {translationsVecteurs3eRoutes()}
            {trigo3eRoutes()}
            {thales3eRoutes()}
            {fonctionsLineairesAffinesRoutes()}
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
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
