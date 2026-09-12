import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { register as registerRequest } from '../services/authService';
import LegalConsentCheckbox from '../components/auth/LegalConsentCheckbox';
import GoogleButton from '../components/auth/GoogleButton';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptLegal, setAcceptLegal] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Déjà connecté : on ne montre pas un formulaire d'inscription à quelqu'un
  // qui a un compte.
  //
  // L'élève dont l'adresse n'est pas encore prouvée est renvoyé vers l'écran
  // de vérification, et NON vers /espace : le serveur y refuserait tout, et
  // il verrait un espace vide sans comprendre pourquoi. Sans ce cas, cette
  // redirection entrerait aussi en conflit avec celle qui suit une
  // inscription réussie — l'une annulant l'autre.
  useEffect(() => {
    if (!user) return;

    if (user.role === 'admin') {
      navigate('/admin');
    } else if (user.role === 'student') {
      navigate(user.emailVerified === false ? '/verification-email' : '/espace');
    } else {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setConsentError('');

    // Contrôle côté navigateur : il évite un aller-retour inutile, et rien
    // de plus. Le serveur refuse de toute façon une inscription sans
    // consentement — c'est lui qui fait foi (voir AuthController::register).
    if (!acceptLegal) {
      setConsentError(
        'Vous devez accepter les Conditions Générales d’Utilisation et la Politique de confidentialité.',
      );
      return;
    }

    setLoading(true);
    try {
      const data = await registerRequest({ email, password, acceptLegal });
      login(data.user, data.token);
      // Le compte existe, mais l'adresse n'est pas encore prouvée : l'espace
      // élève reste fermé côté serveur. On envoie donc l'élève vers l'écran
      // de vérification, et non vers l'accueil de son espace — où il se
      // heurterait à un refus qu'il ne saurait pas interpréter.
      navigate('/verification-email');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-4 pt-24 pb-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900 font-display">
          Smarter Academy
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Créez votre compte gratuit en 30 secondes
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <div className="bg-white/70 backdrop-blur-xl py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-white/50">
          <GoogleButton label="S’inscrire avec Google" />

          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">ou</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {errorMsg}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Adresse Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-slate-300 px-4 py-3 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-slate-300 px-4 py-3 pr-12 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-white/50 backdrop-blur-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">Au moins 8 caractères, avec une lettre et un chiffre.</p>
            </div>

            <LegalConsentCheckbox
              checked={acceptLegal}
              onChange={(next) => {
                setAcceptLegal(next);
                if (next) setConsentError('');
              }}
              error={consentError}
              disabled={loading}
            />

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-xl border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-70"
              >
                {loading ? 'Création du compte...' : "Créer mon compte"}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Déjà un compte ?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Connectez-vous
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
