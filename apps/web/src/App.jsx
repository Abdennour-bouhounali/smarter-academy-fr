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
import thales3eRoutes from './lessons/college/3e/espace_geometrie/thales-3e/routes';
import fonctionsLineairesAffinesRoutes from './lessons/college/3e/donnees_probabilites/fonctions-lineaires-affines/routes';
import pythagore3eRoutes from './lessons/college/3e/espace_geometrie/pythagore-3e/routes';
import resolutionProblemesRoutes from './lessons/college/6e/nombres_calculs/resolution-problemes/routes';
import equationsProduitRoutes from './lessons/college/3e/nombres_calculs/equations-produit/routes';
import nombresRationnelsRoutes from './lessons/college/3e/nombres_calculs/nombres-rationnels/routes';
import puissances3eRoutes from './lessons/college/3e/nombres_calculs/puissances-3e/routes';
import contenancesRoutes from './lessons/college/6e/grandeurs_mesures/contenances/routes';
import longueursRoutes from './lessons/college/6e/grandeurs_mesures/longueurs/routes';
import massesRoutes from './lessons/college/6e/grandeurs_mesures/masses/routes';
import nombresDecimauxRoutes from './lessons/college/6e/nombres_calculs/nombres-decimaux/routes';
import ordreGrandeurEstimationRoutes from './lessons/college/6e/nombres_calculs/ordre-grandeur-estimation/routes';

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
            {thales3eRoutes()}
            {fonctionsLineairesAffinesRoutes()}
            {pythagore3eRoutes()}
            {resolutionProblemesRoutes()}
            {equationsProduitRoutes()}
            {nombresRationnelsRoutes()}
            {puissances3eRoutes()}
            {contenancesRoutes()}
            {longueursRoutes()}
            {massesRoutes()}
            {nombresDecimauxRoutes()}
            {ordreGrandeurEstimationRoutes()}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
