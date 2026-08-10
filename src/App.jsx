import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import FonctionsLineairesAffines from './lessons/college/3e/donnees_probabilites/fonctions-lineaires-affines';
import Module01NotionFonction         from './lessons/college/3e/donnees_probabilites/fonctions-lineaires-affines/modules/Module01NotionFonction';
import Module02ImageAntecedent        from './lessons/college/3e/donnees_probabilites/fonctions-lineaires-affines/modules/Module02ImageAntecedent';
import Module03TableauValeurs         from './lessons/college/3e/donnees_probabilites/fonctions-lineaires-affines/modules/Module03TableauValeurs';
import Module04FonctionLineaire       from './lessons/college/3e/donnees_probabilites/fonctions-lineaires-affines/modules/Module04FonctionLineaire';
import Module05RepresentationLineaire from './lessons/college/3e/donnees_probabilites/fonctions-lineaires-affines/modules/Module05RepresentationLineaire';
import Module06FonctionAffine         from './lessons/college/3e/donnees_probabilites/fonctions-lineaires-affines/modules/Module06FonctionAffine';
import Module07LectureGraphique       from './lessons/college/3e/donnees_probabilites/fonctions-lineaires-affines/modules/Module07LectureGraphique';
import Module08CoeffDirecteurDeuxPoints from './lessons/college/3e/donnees_probabilites/fonctions-lineaires-affines/modules/Module08CoeffDirecteurDeuxPoints';
import Module09MissionForfait         from './lessons/college/3e/donnees_probabilites/fonctions-lineaires-affines/modules/Module09MissionForfait';
import Module10BilanEvaluation        from './lessons/college/3e/donnees_probabilites/fonctions-lineaires-affines/modules/Module10BilanEvaluation';

// ── Leçon : Nombres rationnels (3ème) ──────────────────────────────────────
import NombresRationnels              from './lessons/college/3e/nombres_calculs/nombres-rationnels';
import Module01NotionRationnel        from './lessons/college/3e/nombres_calculs/nombres-rationnels/modules/Module01NotionRationnel';
import Module02Transformer            from './lessons/college/3e/nombres_calculs/nombres-rationnels/modules/Module02Transformer';
import Module03AddSous                from './lessons/college/3e/nombres_calculs/nombres-rationnels/modules/Module03AddSous';
import Module04MultDiv                from './lessons/college/3e/nombres_calculs/nombres-rationnels/modules/Module04MultDiv';
import Module05Priorites              from './lessons/college/3e/nombres_calculs/nombres-rationnels/modules/Module05Priorites';
import Module06MissionRat             from './lessons/college/3e/nombres_calculs/nombres-rationnels/modules/Module06Mission';
import Module07BilanRat               from './lessons/college/3e/nombres_calculs/nombres-rationnels/modules/Module07Bilan';

// ── Leçon : Théorème de Thalès (3ème) ──────────────────────────────────────
import Thales3e                       from './lessons/college/3e/espace_geometrie/thales-3e';
import ThalesM01Decouverte            from './lessons/college/3e/espace_geometrie/thales-3e/modules/Module01Decouverte';
import ThalesM02Egalite               from './lessons/college/3e/espace_geometrie/thales-3e/modules/Module02Egalite';
import ThalesM03Calcul                from './lessons/college/3e/espace_geometrie/thales-3e/modules/Module03Calcul';
import ThalesM04Reciproque            from './lessons/college/3e/espace_geometrie/thales-3e/modules/Module04Reciproque';
import ThalesM05Papillon              from './lessons/college/3e/espace_geometrie/thales-3e/modules/Module05Papillon';
import ThalesM06Mission               from './lessons/college/3e/espace_geometrie/thales-3e/modules/Module06Mission';
import ThalesM07Bilan                 from './lessons/college/3e/espace_geometrie/thales-3e/modules/Module07Bilan';

// ── Leçon : Théorème de Pythagore (3ème) ───────────────────────────────────
import Pythagore3e                    from './lessons/college/3e/espace_geometrie/pythagore-3e';
import PythM01Decouverte              from './lessons/college/3e/espace_geometrie/pythagore-3e/modules/Module01Decouverte';
import PythM02CalculHypotenuse        from './lessons/college/3e/espace_geometrie/pythagore-3e/modules/Module02CalculHypotenuse';
import PythM03CalculCote              from './lessons/college/3e/espace_geometrie/pythagore-3e/modules/Module03CalculCote';
import PythM04Reciproque              from './lessons/college/3e/espace_geometrie/pythagore-3e/modules/Module04Reciproque';
import PythM05Contraposee             from './lessons/college/3e/espace_geometrie/pythagore-3e/modules/Module05Contraposee';
import PythM06Mission                 from './lessons/college/3e/espace_geometrie/pythagore-3e/modules/Module06Mission';
import PythM07Bilan                   from './lessons/college/3e/espace_geometrie/pythagore-3e/modules/Module07Bilan';

// ── Leçon : Équations produit nul (3ème) ──────────────────────────────────────
import EquationsProduit3e             from './lessons/college/3e/nombres_calculs/equations-produit';
import EqProdM01RegleZero             from './lessons/college/3e/nombres_calculs/equations-produit/modules/Module01RegleZero';
import EqProdM02Rappel                from './lessons/college/3e/nombres_calculs/equations-produit/modules/Module02Rappel';
import EqProdM03ProduitNul            from './lessons/college/3e/nombres_calculs/equations-produit/modules/Module03ProduitNul';
import EqProdM04FacteurCommun         from './lessons/college/3e/nombres_calculs/equations-produit/modules/Module04FacteurCommun';
import EqProdM05Identite              from './lessons/college/3e/nombres_calculs/equations-produit/modules/Module05Identite';
import EqProdM06Mission               from './lessons/college/3e/nombres_calculs/equations-produit/modules/Module06Mission';
import EqProdM07Bilan                 from './lessons/college/3e/nombres_calculs/equations-produit/modules/Module07Bilan';

// ── Leçon : Puissances (3ème) ────────────────────────────────────────────────
import Puissances3e                   from './lessons/college/3e/nombres_calculs/puissances-3e';
import PuissancesM01Decouverte        from './lessons/college/3e/nombres_calculs/puissances-3e/modules/Module01Decouverte';
import PuissancesM02Puissances10      from './lessons/college/3e/nombres_calculs/puissances-3e/modules/Module02Puissances10';
import PuissancesM03ReglesCalcul      from './lessons/college/3e/nombres_calculs/puissances-3e/modules/Module03ReglesCalcul';
import PuissancesM04Ecriture          from './lessons/college/3e/nombres_calculs/puissances-3e/modules/Module04EcritureScientifique';
import PuissancesM05Mission           from './lessons/college/3e/nombres_calculs/puissances-3e/modules/Module05Mission';
import PuissancesM06Bilan             from './lessons/college/3e/nombres_calculs/puissances-3e/modules/Module06Bilan';

// ── Leçon : Racine carrée (3ème) ─────────────────────────────────────────────
import Racines3e                      from './lessons/college/3e/nombres_calculs/racines-carrees';
import RacinesM01Decouverte           from './lessons/college/3e/nombres_calculs/racines-carrees/modules/Module01Decouverte';
import RacinesM02Reperage             from './lessons/college/3e/nombres_calculs/racines-carrees/modules/Module02Reperage';
import RacinesM03ProduitQuotient      from './lessons/college/3e/nombres_calculs/racines-carrees/modules/Module03ProduitQuotient';
import RacinesM04PiegeAddition        from './lessons/college/3e/nombres_calculs/racines-carrees/modules/Module04PiegeAddition';
import RacinesM05Simplification       from './lessons/college/3e/nombres_calculs/racines-carrees/modules/Module05Simplification';
import RacinesM06Equations            from './lessons/college/3e/nombres_calculs/racines-carrees/modules/Module06Equations';
import RacinesM07Bilan                from './lessons/college/3e/nombres_calculs/racines-carrees/modules/Module07Bilan';

import Racines4e                      from './lessons/college/4e/nombres_calculs/racines-carrees';
import Racines4eM01Decouverte         from './lessons/college/4e/nombres_calculs/racines-carrees/modules/Module01Decouverte';
import Racines4eM02SensNotation       from './lessons/college/4e/nombres_calculs/racines-carrees/modules/Module02SensNotation';
import Racines4eM03CarresParfaits     from './lessons/college/4e/nombres_calculs/racines-carrees/modules/Module03CarresParfaits';
import Racines4eM04Encadrement        from './lessons/college/4e/nombres_calculs/racines-carrees/modules/Module04Encadrement';
import Racines4eM05Bilan              from './lessons/college/4e/nombres_calculs/racines-carrees/modules/Module05Bilan';

const LESSON_BASE = '/courses/college/3e/donnees_probabilites/fonctions-lineaires-affines';
const RAT_BASE = '/courses/college/3e/nombres_calculs/nombres-rationnels';
const THALES_BASE = '/courses/college/3e/espace_geometrie/thales-3e';
const PYTHAGORE_BASE = '/courses/college/3e/espace_geometrie/pythagore-3e';
const EQPROD_BASE = '/courses/college/3e/nombres_calculs/equations-produit';
const PUISSANCES_BASE = '/courses/college/3e/nombres_calculs/puissances-3e';
const RACINES_BASE = '/courses/college/3e/nombres_calculs/racines-carrees';

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

            {/* ── Redirections de compatibilité ── */}
            <Route path="/courses/college/3e/fonctions-lineaires-affines/*" element={<Navigate replace to={`${LESSON_BASE}/*`} />} />
            <Route path="/courses/college/3e/nombres-rationnels/*" element={<Navigate replace to={`${RAT_BASE}/*`} />} />
            <Route path="/courses/college/3e/thales-3e/*" element={<Navigate replace to={`${THALES_BASE}/*`} />} />
            <Route path="/courses/college/3e/pythagore-3e/*" element={<Navigate replace to={`${PYTHAGORE_BASE}/*`} />} />
            <Route path="/courses/college/3e/equations-produit/*" element={<Navigate replace to={`${EQPROD_BASE}/*`} />} />
            <Route path="/courses/college/3e/puissances-3e/*" element={<Navigate replace to={`${PUISSANCES_BASE}/*`} />} />
            <Route path="/courses/college/3e/racines-carrees/*" element={<Navigate replace to={`${RACINES_BASE}/*`} />} />

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
            <Route path={`${RAT_BASE}/6`}  element={<Module06MissionRat />} />
            <Route path={`${RAT_BASE}/7`}  element={<Module07BilanRat />} />

            {/* ── Théorème de Thalès ── */}
            <Route path={THALES_BASE}      element={<Thales3e />} />
            <Route path={`${THALES_BASE}/1`}  element={<ThalesM01Decouverte />} />
            <Route path={`${THALES_BASE}/2`}  element={<ThalesM02Egalite />} />
            <Route path={`${THALES_BASE}/3`}  element={<ThalesM03Calcul />} />
            <Route path={`${THALES_BASE}/4`}  element={<ThalesM04Reciproque />} />
            <Route path={`${THALES_BASE}/5`}  element={<ThalesM05Papillon />} />
            <Route path={`${THALES_BASE}/6`}  element={<ThalesM06Mission />} />
            <Route path={`${THALES_BASE}/7`}  element={<ThalesM07Bilan />} />

            {/* ── Théorème de Pythagore ── */}
            <Route path={PYTHAGORE_BASE}      element={<Pythagore3e />} />
            <Route path={`${PYTHAGORE_BASE}/1`}  element={<PythM01Decouverte />} />
            <Route path={`${PYTHAGORE_BASE}/2`}  element={<PythM02CalculHypotenuse />} />
            <Route path={`${PYTHAGORE_BASE}/3`}  element={<PythM03CalculCote />} />
            <Route path={`${PYTHAGORE_BASE}/4`}  element={<PythM04Reciproque />} />
            <Route path={`${PYTHAGORE_BASE}/5`}  element={<PythM05Contraposee />} />
            <Route path={`${PYTHAGORE_BASE}/6`}  element={<PythM06Mission />} />
            <Route path={`${PYTHAGORE_BASE}/7`}  element={<PythM07Bilan />} />

            {/* ── Équations produit nul ── */}
            <Route path={EQPROD_BASE}      element={<EquationsProduit3e />} />
            <Route path={`${EQPROD_BASE}/1`}  element={<EqProdM01RegleZero />} />
            <Route path={`${EQPROD_BASE}/2`}  element={<EqProdM02Rappel />} />
            <Route path={`${EQPROD_BASE}/3`}  element={<EqProdM03ProduitNul />} />
            <Route path={`${EQPROD_BASE}/4`}  element={<EqProdM04FacteurCommun />} />
            <Route path={`${EQPROD_BASE}/5`}  element={<EqProdM05Identite />} />
            <Route path={`${EQPROD_BASE}/6`}  element={<EqProdM06Mission />} />
            <Route path={`${EQPROD_BASE}/7`}  element={<EqProdM07Bilan />} />

            {/* ── Puissances (3ème) ── */}
            <Route path={PUISSANCES_BASE}      element={<Puissances3e />} />
            <Route path={`${PUISSANCES_BASE}/1`}  element={<PuissancesM01Decouverte />} />
            <Route path={`${PUISSANCES_BASE}/2`}  element={<PuissancesM02Puissances10 />} />
            <Route path={`${PUISSANCES_BASE}/3`}  element={<PuissancesM03ReglesCalcul />} />
            <Route path={`${PUISSANCES_BASE}/4`}  element={<PuissancesM04Ecriture />} />
            <Route path={`${PUISSANCES_BASE}/5`}  element={<PuissancesM05Mission />} />
            <Route path={`${PUISSANCES_BASE}/6`}  element={<PuissancesM06Bilan />} />

            {/* ── Racine carrée (3ème) ── */}
            <Route path={RACINES_BASE}      element={<Racines3e />} />
            <Route path={`${RACINES_BASE}/1`}  element={<RacinesM01Decouverte />} />
            <Route path={`${RACINES_BASE}/2`}  element={<RacinesM02Reperage />} />
            <Route path={`${RACINES_BASE}/3`}  element={<RacinesM03ProduitQuotient />} />
            <Route path={`${RACINES_BASE}/4`}  element={<RacinesM04PiegeAddition />} />
            <Route path={`${RACINES_BASE}/5`}  element={<RacinesM05Simplification />} />
            <Route path={`${RACINES_BASE}/6`}  element={<RacinesM06Equations />} />
            <Route path={`${RACINES_BASE}/7`}  element={<RacinesM07Bilan />} />

            {/* ── Racine carrée (4ème) ── */}
            <Route path="/courses/college/4e/nombres_calculs/racines-carrees" element={<Racines4e />} />
            <Route path="/courses/college/4e/nombres_calculs/racines-carrees/1" element={<Racines4eM01Decouverte />} />
            <Route path="/courses/college/4e/nombres_calculs/racines-carrees/2" element={<Racines4eM02SensNotation />} />
            <Route path="/courses/college/4e/nombres_calculs/racines-carrees/3" element={<Racines4eM03CarresParfaits />} />
            <Route path="/courses/college/4e/nombres_calculs/racines-carrees/4" element={<Racines4eM04Encadrement />} />
            <Route path="/courses/college/4e/nombres_calculs/racines-carrees/5" element={<Racines4eM05Bilan />} />

            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
