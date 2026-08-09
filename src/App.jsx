import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import About from './pages/About';
import Courses from './pages/Courses';
import Resources from './pages/Resources';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// ── Leçon : Fonctions linéaires et affines (3ème) ──────────────────────────
import FonctionsLineairesAffines from './lessons/college/3e/fonctions-lineaires-affines';
import Module01NotionFonction         from './lessons/college/3e/fonctions-lineaires-affines/modules/Module01NotionFonction';
import Module02ImageAntecedent        from './lessons/college/3e/fonctions-lineaires-affines/modules/Module02ImageAntecedent';
import Module03TableauValeurs         from './lessons/college/3e/fonctions-lineaires-affines/modules/Module03TableauValeurs';
import Module04FonctionLineaire       from './lessons/college/3e/fonctions-lineaires-affines/modules/Module04FonctionLineaire';
import Module05RepresentationLineaire from './lessons/college/3e/fonctions-lineaires-affines/modules/Module05RepresentationLineaire';
import Module06FonctionAffine         from './lessons/college/3e/fonctions-lineaires-affines/modules/Module06FonctionAffine';
import Module07LectureGraphique       from './lessons/college/3e/fonctions-lineaires-affines/modules/Module07LectureGraphique';
import Module08CoeffDirecteurDeuxPoints from './lessons/college/3e/fonctions-lineaires-affines/modules/Module08CoeffDirecteurDeuxPoints';
import Module09MissionForfait         from './lessons/college/3e/fonctions-lineaires-affines/modules/Module09MissionForfait';
import Module10BilanEvaluation        from './lessons/college/3e/fonctions-lineaires-affines/modules/Module10BilanEvaluation';

// ── Leçon : Nombres rationnels (3ème) ──────────────────────────────────────
import NombresRationnels              from './lessons/college/3e/nombres-rationnels';
import Module01NotionRationnel        from './lessons/college/3e/nombres-rationnels/modules/Module01NotionRationnel';
import Module02Transformer            from './lessons/college/3e/nombres-rationnels/modules/Module02Transformer';
import Module03AddSous                from './lessons/college/3e/nombres-rationnels/modules/Module03AddSous';
import Module04MultDiv                from './lessons/college/3e/nombres-rationnels/modules/Module04MultDiv';
import Module05Priorites              from './lessons/college/3e/nombres-rationnels/modules/Module05Priorites';
import Module06Mission                from './lessons/college/3e/nombres-rationnels/modules/Module06Mission';
import Module07Bilan                  from './lessons/college/3e/nombres-rationnels/modules/Module07Bilan';

const LESSON_BASE = '/courses/college/3e/fonctions-lineaires-affines';
const RAT_BASE = '/courses/college/3e/nombres-rationnels';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route index element={<AdminDashboard />} />
          </Route>

          <Route element={<MainLayout />}>
            <Route path="/"         element={<Home />} />
            <Route path="/about"    element={<About />} />
            <Route path="/courses"  element={<Courses />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/faq"      element={<FAQ />} />
            <Route path="/contact"  element={<Contact />} />

            {/* ── Fonctions linéaires et affines ── */}
            <Route path={LESSON_BASE}      element={<FonctionsLineairesAffines />} />
            <Route path={`${LESSON_BASE}/1`}  element={<Module01NotionFonction />} />
            <Route path={`${LESSON_BASE}/2`}  element={<Module02ImageAntecedent />} />
            <Route path={`${LESSON_BASE}/3`}  element={<Module03TableauValeurs />} />
            <Route path={`${LESSON_BASE}/4`}  element={<Module04FonctionLineaire />} />
            <Route path={`${LESSON_BASE}/5`}  element={<Module05RepresentationLineaire />} />
            <Route path={`${LESSON_BASE}/6`}  element={<Module06FonctionAffine />} />
            <Route path={`${LESSON_BASE}/7`}  element={<Module07LectureGraphique />} />
            <Route path={`${LESSON_BASE}/8`}  element={<Module08CoeffDirecteurDeuxPoints />} />
            <Route path={`${LESSON_BASE}/9`}  element={<Module09MissionForfait />} />
            <Route path={`${LESSON_BASE}/10`} element={<Module10BilanEvaluation />} />

            {/* ── Nombres rationnels ── */}
            <Route path={RAT_BASE}      element={<NombresRationnels />} />
            <Route path={`${RAT_BASE}/1`}  element={<Module01NotionRationnel />} />
            <Route path={`${RAT_BASE}/2`}  element={<Module02Transformer />} />
            <Route path={`${RAT_BASE}/3`}  element={<Module03AddSous />} />
            <Route path={`${RAT_BASE}/4`}  element={<Module04MultDiv />} />
            <Route path={`${RAT_BASE}/5`}  element={<Module05Priorites />} />
            <Route path={`${RAT_BASE}/6`}  element={<Module06Mission />} />
            <Route path={`${RAT_BASE}/7`}  element={<Module07Bilan />} />

            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
