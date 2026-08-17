import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { getAllGrades } from '@smarter-academy/core';
import { register as registerRequest } from '../services/authService';

const GRADES_BY_LEVEL = getAllGrades().reduce((groups, grade) => {
  (groups[grade.levelTitle] ??= []).push(grade);
  return groups;
}, {});

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [grade, setGrade] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== passwordConfirmation) {
      setErrorMsg('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const data = await registerRequest({
        firstName,
        lastName,
        email,
        password,
        passwordConfirmation,
        grade,
      });
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
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
          Créez votre compte élève
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <div className="bg-white/70 backdrop-blur-xl py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-white/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
                  Prénom
                </label>
                <div className="mt-1">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="block w-full appearance-none rounded-xl border border-slate-300 px-4 py-3 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
                  Nom
                </label>
                <div className="mt-1">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="block w-full appearance-none rounded-xl border border-slate-300 px-4 py-3 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-slate-700">
                Ma classe
              </label>
              <div className="mt-1">
                <select
                  id="grade"
                  name="grade"
                  required
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-slate-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-white/50 backdrop-blur-sm"
                >
                  <option value="" disabled>Sélectionnez votre classe</option>
                  {Object.entries(GRADES_BY_LEVEL).map(([levelTitle, grades]) => (
                    <optgroup key={levelTitle} label={levelTitle}>
                      {grades.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-xs text-slate-500">Votre classe actuelle deviendra votre parcours par défaut — vous pourrez en changer à tout moment.</p>
            </div>

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

            <div>
              <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-slate-700">
                Confirmer le mot de passe
              </label>
              <div className="mt-1">
                <input
                  id="passwordConfirmation"
                  name="passwordConfirmation"
                  type={showPassword ? "text" : "password"}
                  required
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-slate-300 px-4 py-3 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-xl border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-70"
              >
                {loading ? 'Création du compte...' : "S'inscrire"}
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
