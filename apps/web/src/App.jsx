import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import About from './pages/About';
import Courses from './pages/Courses';
import Resources from './pages/Resources';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// ── Leçon : Nombres entiers (6ème) ──────────────────────────────────────────
import NombresEntiers6e             from './lessons/college/6e/nombres_calculs/nombres-entiers';
import NombresEntiers6eM01          from './lessons/college/6e/nombres_calculs/nombres-entiers/modules/Module01Mission';
import NombresEntiers6eM02          from './lessons/college/6e/nombres_calculs/nombres-entiers/modules/Module02Construire';
import NombresEntiers6eM03          from './lessons/college/6e/nombres_calculs/nombres-entiers/modules/Module03LireEcrire';
import NombresEntiers6eM04          from './lessons/college/6e/nombres_calculs/nombres-entiers/modules/Module04ValeurPosition';
import NombresEntiers6eM05          from './lessons/college/6e/nombres_calculs/nombres-entiers/modules/Module05Decomposer';
import NombresEntiers6eM06          from './lessons/college/6e/nombres_calculs/nombres-entiers/modules/Module06Comparer';
import NombresEntiers6eM07          from './lessons/college/6e/nombres_calculs/nombres-entiers/modules/Module07RangerEncadrer';
import NombresEntiers6eM08          from './lessons/college/6e/nombres_calculs/nombres-entiers/modules/Module08DroiteGraduee';
import NombresEntiers6eM09          from './lessons/college/6e/nombres_calculs/nombres-entiers/modules/Module09MondeReel';
import NombresEntiers6eM10          from './lessons/college/6e/nombres_calculs/nombres-entiers/modules/Module10Problemes';
import NombresEntiers6eM11          from './lessons/college/6e/nombres_calculs/nombres-entiers/modules/Module11BossFinal';

// ── Leçon : Fractions (6ème) ──────────────────────────────────────────
import Fractions6e            from './lessons/college/6e/nombres_calculs/fractions';
import Fractions6eM01         from './lessons/college/6e/nombres_calculs/fractions/modules/Module01Mission';
import Fractions6eM02         from './lessons/college/6e/nombres_calculs/fractions/modules/Module02Construire';
import Fractions6eM03         from './lessons/college/6e/nombres_calculs/fractions/modules/Module03Vocabulaire';
import Fractions6eM04         from './lessons/college/6e/nombres_calculs/fractions/modules/Module04Representer';
import Fractions6eM05         from './lessons/college/6e/nombres_calculs/fractions/modules/Module05Quantite';
import Fractions6eM06         from './lessons/college/6e/nombres_calculs/fractions/modules/Module06Quotient';
import Fractions6eM07         from './lessons/college/6e/nombres_calculs/fractions/modules/Module07Simples';
import Fractions6eM08         from './lessons/college/6e/nombres_calculs/fractions/modules/Module08Droite';
import Fractions6eM09         from './lessons/college/6e/nombres_calculs/fractions/modules/Module09Decimales';
import Fractions6eM10         from './lessons/college/6e/nombres_calculs/fractions/modules/Module10BossFinal';

// ── Leçon : Nombres décimaux (6ème) ──────────────────────────────────────────
import NombresDecimaux6e            from './lessons/college/6e/nombres_calculs/nombres-decimaux';
import NombresDecimaux6eM01         from './lessons/college/6e/nombres_calculs/nombres-decimaux/modules/Module01Mission';
import NombresDecimaux6eM02         from './lessons/college/6e/nombres_calculs/nombres-decimaux/modules/Module02DecouperUnite';
import NombresDecimaux6eM03         from './lessons/college/6e/nombres_calculs/nombres-decimaux/modules/Module03FractionsDecimales';
import NombresDecimaux6eM04         from './lessons/college/6e/nombres_calculs/nombres-decimaux/modules/Module04EcritureVirgule';
import NombresDecimaux6eM05         from './lessons/college/6e/nombres_calculs/nombres-decimaux/modules/Module05ValeurPosition';
import NombresDecimaux6eM06         from './lessons/college/6e/nombres_calculs/nombres-decimaux/modules/Module06EcrituresEquivalentes';
import NombresDecimaux6eM07         from './lessons/college/6e/nombres_calculs/nombres-decimaux/modules/Module07ComparerRanger';
import NombresDecimaux6eM08         from './lessons/college/6e/nombres_calculs/nombres-decimaux/modules/Module08DroiteGraduee';
import NombresDecimaux6eM09         from './lessons/college/6e/nombres_calculs/nombres-decimaux/modules/Module09OrdreGrandeur';
import NombresDecimaux6eM10         from './lessons/college/6e/nombres_calculs/nombres-decimaux/modules/Module10Problemes';
import NombresDecimaux6eM11         from './lessons/college/6e/nombres_calculs/nombres-decimaux/modules/Module11BossFinal';

// ── Leçon : Quatre opérations (6ème) ───────────────────────────────────────
import QuatreOperations6e         from './lessons/college/6e/nombres_calculs/quatre-operations';
import QatreOp6eM01               from './lessons/college/6e/nombres_calculs/quatre-operations/modules/Module01Mission';
import QatreOp6eM02               from './lessons/college/6e/nombres_calculs/quatre-operations/modules/Module02Addition';
import QatreOp6eM03               from './lessons/college/6e/nombres_calculs/quatre-operations/modules/Module03Soustraction';
import QatreOp6eM04               from './lessons/college/6e/nombres_calculs/quatre-operations/modules/Module04Multiplication';
import QatreOp6eM05               from './lessons/college/6e/nombres_calculs/quatre-operations/modules/Module05Division';
import QatreOp6eM06               from './lessons/college/6e/nombres_calculs/quatre-operations/modules/Module06OperationsPosees';
import QatreOp6eM07               from './lessons/college/6e/nombres_calculs/quatre-operations/modules/Module07CalculMental';
import QatreOp6eM08               from './lessons/college/6e/nombres_calculs/quatre-operations/modules/Module08ChoisirOperation';
import QatreOp6eM09               from './lessons/college/6e/nombres_calculs/quatre-operations/modules/Module09Problemes';
import QatreOp6eM10               from './lessons/college/6e/nombres_calculs/quatre-operations/modules/Module10BossFinal';
import QatreOp6eM11               from './lessons/college/6e/nombres_calculs/quatre-operations/modules/Module11Synthese';

// ── Leçon : Ordre de grandeur et estimation (6ème) ─────────────────────────
import OrdreGrandeur6e            from './lessons/college/6e/nombres_calculs/ordre-grandeur-estimation';
import OrdreGrandeur6eM01         from './lessons/college/6e/nombres_calculs/ordre-grandeur-estimation/modules/Module01Mission';
import OrdreGrandeur6eM02         from './lessons/college/6e/nombres_calculs/ordre-grandeur-estimation/modules/Module02Estimer';
import OrdreGrandeur6eM03         from './lessons/college/6e/nombres_calculs/ordre-grandeur-estimation/modules/Module03Arrondir';
import OrdreGrandeur6eM04         from './lessons/college/6e/nombres_calculs/ordre-grandeur-estimation/modules/Module04Somme';
import OrdreGrandeur6eM05         from './lessons/college/6e/nombres_calculs/ordre-grandeur-estimation/modules/Module05Difference';
import OrdreGrandeur6eM06         from './lessons/college/6e/nombres_calculs/ordre-grandeur-estimation/modules/Module06Produit';
import OrdreGrandeur6eM07         from './lessons/college/6e/nombres_calculs/ordre-grandeur-estimation/modules/Module07Detective';
import OrdreGrandeur6eM08         from './lessons/college/6e/nombres_calculs/ordre-grandeur-estimation/modules/Module08Problemes';
import OrdreGrandeur6eM09         from './lessons/college/6e/nombres_calculs/ordre-grandeur-estimation/modules/Module09Precision';
import OrdreGrandeur6eM10         from './lessons/college/6e/nombres_calculs/ordre-grandeur-estimation/modules/Module10BossFinal';

// ── Leçon : Résolution de problèmes (6ème) ──────────────────────────────────
import ResolutionProblemes6e      from './lessons/college/6e/nombres_calculs/resolution-problemes';
import ResoProb6eM01              from './lessons/college/6e/nombres_calculs/resolution-problemes/modules/Module01Mission';
import ResoProb6eM02              from './lessons/college/6e/nombres_calculs/resolution-problemes/modules/Module02Comprendre';
import ResoProb6eM03              from './lessons/college/6e/nombres_calculs/resolution-problemes/modules/Module03Extraire';
import ResoProb6eM04              from './lessons/college/6e/nombres_calculs/resolution-problemes/modules/Module04Modeliser';
import ResoProb6eM05              from './lessons/college/6e/nombres_calculs/resolution-problemes/modules/Module05Strategie';
import ResoProb6eM06              from './lessons/college/6e/nombres_calculs/resolution-problemes/modules/Module06UneEtape';
import ResoProb6eM07              from './lessons/college/6e/nombres_calculs/resolution-problemes/modules/Module07PlusieursEtapes';
import ResoProb6eM08              from './lessons/college/6e/nombres_calculs/resolution-problemes/modules/Module08EstimerVerifier';
import ResoProb6eM09              from './lessons/college/6e/nombres_calculs/resolution-problemes/modules/Module09Communiquer';
import ResoProb6eM10              from './lessons/college/6e/nombres_calculs/resolution-problemes/modules/Module10Detective';
import ResoProb6eM11              from './lessons/college/6e/nombres_calculs/resolution-problemes/modules/Module11BossFinal';

// ── Leçon : Longueurs (6ème — Grandeurs et mesures) ─────────────────────────
import Longueurs6e                from './lessons/college/6e/grandeurs_mesures/longueurs';
import Longueurs6eM01             from './lessons/college/6e/grandeurs_mesures/longueurs/modules/Module01Mission';
import Longueurs6eM02             from './lessons/college/6e/grandeurs_mesures/longueurs/modules/Module02MesurerComparer';
import Longueurs6eM03             from './lessons/college/6e/grandeurs_mesures/longueurs/modules/Module03ConstruireUnites';
import Longueurs6eM04             from './lessons/college/6e/grandeurs_mesures/longueurs/modules/Module04Conversions';
import Longueurs6eM05             from './lessons/college/6e/grandeurs_mesures/longueurs/modules/Module05ChoisirEstimer';
import Longueurs6eM06             from './lessons/college/6e/grandeurs_mesures/longueurs/modules/Module06Perimetres';
import Longueurs6eM07             from './lessons/college/6e/grandeurs_mesures/longueurs/modules/Module07MissionFinale';

// ── Leçon : Masses (6ème — Grandeurs et mesures) ────────────────────────────
import Masses6e                   from './lessons/college/6e/grandeurs_mesures/masses';
import Masses6eM01                from './lessons/college/6e/grandeurs_mesures/masses/modules/Module01Mission';
import Masses6eM02                from './lessons/college/6e/grandeurs_mesures/masses/modules/Module02ChoisirUnite';
import Masses6eM03                from './lessons/college/6e/grandeurs_mesures/masses/modules/Module03ComparerMesurer';
import Masses6eM04                from './lessons/college/6e/grandeurs_mesures/masses/modules/Module04RelationsUnites';
import Masses6eM05                from './lessons/college/6e/grandeurs_mesures/masses/modules/Module05Conversions';
import Masses6eM06                from './lessons/college/6e/grandeurs_mesures/masses/modules/Module06EstimationProblemes';
import Masses6eM07                from './lessons/college/6e/grandeurs_mesures/masses/modules/Module07MissionFinale';

// ── Leçon : Contenances (6ème — Grandeurs et mesures) ───────────────────────
import Contenances6e              from './lessons/college/6e/grandeurs_mesures/contenances';
import Contenances6eM01           from './lessons/college/6e/grandeurs_mesures/contenances/modules/Module01Mission';
import Contenances6eM02           from './lessons/college/6e/grandeurs_mesures/contenances/modules/Module02Mesurer';
import Contenances6eM03           from './lessons/college/6e/grandeurs_mesures/contenances/modules/Module03Unites';
import Contenances6eM04           from './lessons/college/6e/grandeurs_mesures/contenances/modules/Module04RelationsUnites';
import Contenances6eM05           from './lessons/college/6e/grandeurs_mesures/contenances/modules/Module05Conversions';
import Contenances6eM06           from './lessons/college/6e/grandeurs_mesures/contenances/modules/Module06Problemes';
import Contenances6eM07           from './lessons/college/6e/grandeurs_mesures/contenances/modules/Module07LienVolumeMission';

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
          <Route path="/register" element={<Register />} />
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

            {/* ── Nombres entiers (6ème) ── */}
            <Route path="/courses/college/6e/nombres_calculs/nombres-entiers" element={<NombresEntiers6e />} />
            <Route path="/courses/college/6e/nombres_calculs/nombres-entiers/1" element={<NombresEntiers6eM01 />} />
            <Route path="/courses/college/6e/nombres_calculs/nombres-entiers/2" element={<NombresEntiers6eM02 />} />
            <Route path="/courses/college/6e/nombres_calculs/nombres-entiers/3" element={<NombresEntiers6eM03 />} />
            <Route path="/courses/college/6e/nombres_calculs/nombres-entiers/4" element={<NombresEntiers6eM04 />} />
            <Route path="/courses/college/6e/nombres_calculs/nombres-entiers/5" element={<NombresEntiers6eM05 />} />
            <Route path="/courses/college/6e/nombres_calculs/nombres-entiers/6" element={<NombresEntiers6eM06 />} />
            <Route path="/courses/college/6e/nombres_calculs/nombres-entiers/7" element={<NombresEntiers6eM07 />} />
            <Route path="/courses/college/6e/nombres_calculs/nombres-entiers/8" element={<NombresEntiers6eM08 />} />
            <Route path="/courses/college/6e/nombres_calculs/nombres-entiers/9" element={<NombresEntiers6eM09 />} />
            <Route path="/courses/college/6e/nombres_calculs/nombres-entiers/10" element={<NombresEntiers6eM10 />} />
            <Route path="/courses/college/6e/nombres_calculs/nombres-entiers/11" element={<NombresEntiers6eM11 />} />

            <Route path="/courses/college/6e/nombres_calculs/fractions" element={<Fractions6e />} />
            <Route path="/courses/college/6e/nombres_calculs/fractions/1" element={<Fractions6eM01 />} />
            <Route path="/courses/college/6e/nombres_calculs/fractions/2" element={<Fractions6eM02 />} />
            <Route path="/courses/college/6e/nombres_calculs/fractions/3" element={<Fractions6eM03 />} />
            <Route path="/courses/college/6e/nombres_calculs/fractions/4" element={<Fractions6eM04 />} />
            <Route path="/courses/college/6e/nombres_calculs/fractions/5" element={<Fractions6eM05 />} />
            <Route path="/courses/college/6e/nombres_calculs/fractions/6" element={<Fractions6eM06 />} />
            <Route path="/courses/college/6e/nombres_calculs/fractions/7" element={<Fractions6eM07 />} />
            <Route path="/courses/college/6e/nombres_calculs/fractions/8" element={<Fractions6eM08 />} />
            <Route path="/courses/college/6e/nombres_calculs/fractions/9" element={<Fractions6eM09 />} />
            <Route path="/courses/college/6e/nombres_calculs/fractions/10" element={<Fractions6eM10 />} />

            {/* ── Nombres décimaux (6ème) ── */}
            <Route path="/courses/college/6e/nombres_calculs/nombres-decimaux" element={<NombresDecimaux6e />} />
            <Route path="/courses/college/6e/nombres_calculs/nombres-decimaux/1" element={<NombresDecimaux6eM01 />} />
            <Route path="/courses/college/6e/nombres_calculs/nombres-decimaux/2" element={<NombresDecimaux6eM02 />} />
            <Route path="/courses/college/6e/nombres_calculs/nombres-decimaux/3" element={<NombresDecimaux6eM03 />} />
            <Route path="/courses/college/6e/nombres_calculs/nombres-decimaux/4" element={<NombresDecimaux6eM04 />} />
            <Route path="/courses/college/6e/nombres_calculs/nombres-decimaux/5" element={<NombresDecimaux6eM05 />} />
            <Route path="/courses/college/6e/nombres_calculs/nombres-decimaux/6" element={<NombresDecimaux6eM06 />} />
            <Route path="/courses/college/6e/nombres_calculs/nombres-decimaux/7" element={<NombresDecimaux6eM07 />} />
            <Route path="/courses/college/6e/nombres_calculs/nombres-decimaux/8" element={<NombresDecimaux6eM08 />} />
            <Route path="/courses/college/6e/nombres_calculs/nombres-decimaux/9" element={<NombresDecimaux6eM09 />} />
            <Route path="/courses/college/6e/nombres_calculs/nombres-decimaux/10" element={<NombresDecimaux6eM10 />} />
            <Route path="/courses/college/6e/nombres_calculs/nombres-decimaux/11" element={<NombresDecimaux6eM11 />} />

            {/* ── Quatre opérations (6ème) ── */}
            <Route path="/courses/college/6e/nombres_calculs/quatre-operations" element={<QuatreOperations6e />} />
            <Route path="/courses/college/6e/nombres_calculs/quatre-operations/1"  element={<QatreOp6eM01 />} />
            <Route path="/courses/college/6e/nombres_calculs/quatre-operations/2"  element={<QatreOp6eM02 />} />
            <Route path="/courses/college/6e/nombres_calculs/quatre-operations/3"  element={<QatreOp6eM03 />} />
            <Route path="/courses/college/6e/nombres_calculs/quatre-operations/4"  element={<QatreOp6eM04 />} />
            <Route path="/courses/college/6e/nombres_calculs/quatre-operations/5"  element={<QatreOp6eM05 />} />
            <Route path="/courses/college/6e/nombres_calculs/quatre-operations/6"  element={<QatreOp6eM06 />} />
            <Route path="/courses/college/6e/nombres_calculs/quatre-operations/7"  element={<QatreOp6eM07 />} />
            <Route path="/courses/college/6e/nombres_calculs/quatre-operations/8"  element={<QatreOp6eM08 />} />
            <Route path="/courses/college/6e/nombres_calculs/quatre-operations/9"  element={<QatreOp6eM09 />} />
            <Route path="/courses/college/6e/nombres_calculs/quatre-operations/10" element={<QatreOp6eM10 />} />
            <Route path="/courses/college/6e/nombres_calculs/quatre-operations/11" element={<QatreOp6eM11 />} />

            <Route path="/courses/college/6e/nombres_calculs/ordre-grandeur-estimation" element={<OrdreGrandeur6e />} />
            <Route path="/courses/college/6e/nombres_calculs/ordre-grandeur-estimation/1" element={<OrdreGrandeur6eM01 />} />
            <Route path="/courses/college/6e/nombres_calculs/ordre-grandeur-estimation/2" element={<OrdreGrandeur6eM02 />} />
            <Route path="/courses/college/6e/nombres_calculs/ordre-grandeur-estimation/3" element={<OrdreGrandeur6eM03 />} />
            <Route path="/courses/college/6e/nombres_calculs/ordre-grandeur-estimation/4" element={<OrdreGrandeur6eM04 />} />
            <Route path="/courses/college/6e/nombres_calculs/ordre-grandeur-estimation/5" element={<OrdreGrandeur6eM05 />} />
            <Route path="/courses/college/6e/nombres_calculs/ordre-grandeur-estimation/6" element={<OrdreGrandeur6eM06 />} />
            <Route path="/courses/college/6e/nombres_calculs/ordre-grandeur-estimation/7" element={<OrdreGrandeur6eM07 />} />
            <Route path="/courses/college/6e/nombres_calculs/ordre-grandeur-estimation/8" element={<OrdreGrandeur6eM08 />} />
            <Route path="/courses/college/6e/nombres_calculs/ordre-grandeur-estimation/9" element={<OrdreGrandeur6eM09 />} />
            <Route path="/courses/college/6e/nombres_calculs/ordre-grandeur-estimation/10" element={<OrdreGrandeur6eM10 />} />

            <Route path="/courses/college/6e/nombres_calculs/resolution-problemes" element={<ResolutionProblemes6e />} />
            <Route path="/courses/college/6e/nombres_calculs/resolution-problemes/1" element={<ResoProb6eM01 />} />
            <Route path="/courses/college/6e/nombres_calculs/resolution-problemes/2" element={<ResoProb6eM02 />} />
            <Route path="/courses/college/6e/nombres_calculs/resolution-problemes/3" element={<ResoProb6eM03 />} />
            <Route path="/courses/college/6e/nombres_calculs/resolution-problemes/4" element={<ResoProb6eM04 />} />
            <Route path="/courses/college/6e/nombres_calculs/resolution-problemes/5" element={<ResoProb6eM05 />} />
            <Route path="/courses/college/6e/nombres_calculs/resolution-problemes/6" element={<ResoProb6eM06 />} />
            <Route path="/courses/college/6e/nombres_calculs/resolution-problemes/7" element={<ResoProb6eM07 />} />
            <Route path="/courses/college/6e/nombres_calculs/resolution-problemes/8" element={<ResoProb6eM08 />} />
            <Route path="/courses/college/6e/nombres_calculs/resolution-problemes/9" element={<ResoProb6eM09 />} />
            <Route path="/courses/college/6e/nombres_calculs/resolution-problemes/10" element={<ResoProb6eM10 />} />
            <Route path="/courses/college/6e/nombres_calculs/resolution-problemes/11" element={<ResoProb6eM11 />} />

            <Route path="/courses/college/6e/grandeurs_mesures/longueurs" element={<Longueurs6e />} />
            <Route path="/courses/college/6e/grandeurs_mesures/longueurs/1" element={<Longueurs6eM01 />} />
            <Route path="/courses/college/6e/grandeurs_mesures/longueurs/2" element={<Longueurs6eM02 />} />
            <Route path="/courses/college/6e/grandeurs_mesures/longueurs/3" element={<Longueurs6eM03 />} />
            <Route path="/courses/college/6e/grandeurs_mesures/longueurs/4" element={<Longueurs6eM04 />} />
            <Route path="/courses/college/6e/grandeurs_mesures/longueurs/5" element={<Longueurs6eM05 />} />
            <Route path="/courses/college/6e/grandeurs_mesures/longueurs/6" element={<Longueurs6eM06 />} />
            <Route path="/courses/college/6e/grandeurs_mesures/longueurs/7" element={<Longueurs6eM07 />} />

            <Route path="/courses/college/6e/grandeurs_mesures/masses" element={<Masses6e />} />
            <Route path="/courses/college/6e/grandeurs_mesures/masses/1" element={<Masses6eM01 />} />
            <Route path="/courses/college/6e/grandeurs_mesures/masses/2" element={<Masses6eM02 />} />
            <Route path="/courses/college/6e/grandeurs_mesures/masses/3" element={<Masses6eM03 />} />
            <Route path="/courses/college/6e/grandeurs_mesures/masses/4" element={<Masses6eM04 />} />
            <Route path="/courses/college/6e/grandeurs_mesures/masses/5" element={<Masses6eM05 />} />
            <Route path="/courses/college/6e/grandeurs_mesures/masses/6" element={<Masses6eM06 />} />
            <Route path="/courses/college/6e/grandeurs_mesures/masses/7" element={<Masses6eM07 />} />

            <Route path="/courses/college/6e/grandeurs_mesures/contenances" element={<Contenances6e />} />
            <Route path="/courses/college/6e/grandeurs_mesures/contenances/1" element={<Contenances6eM01 />} />
            <Route path="/courses/college/6e/grandeurs_mesures/contenances/2" element={<Contenances6eM02 />} />
            <Route path="/courses/college/6e/grandeurs_mesures/contenances/3" element={<Contenances6eM03 />} />
            <Route path="/courses/college/6e/grandeurs_mesures/contenances/4" element={<Contenances6eM04 />} />
            <Route path="/courses/college/6e/grandeurs_mesures/contenances/5" element={<Contenances6eM05 />} />
            <Route path="/courses/college/6e/grandeurs_mesures/contenances/6" element={<Contenances6eM06 />} />
            <Route path="/courses/college/6e/grandeurs_mesures/contenances/7" element={<Contenances6eM07 />} />

            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
