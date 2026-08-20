import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, Sparkles } from 'lucide-react';
import { getAllGrades } from '@smarter-academy/core';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { isDiagnosticAvailableForGrade } from '../../services/diagnosticService';

const GRADES_BY_LEVEL = getAllGrades().reduce((groups, grade) => {
  (groups[grade.levelTitle] ??= []).push(grade);
  return groups;
}, {});

/**
 * The one onboarding step between account creation and the student space:
 * picking a grade. Registration itself only asks for email + password, so a
 * freshly-created account always lands here with `user.grade === null`
 * (StudentLayout redirects here for any student in that state, not just
 * right after signup). Grade stays editable anytime from the profile page —
 * this screen just picks the starting value.
 */
export default function ChooseGrade() {
  useDocumentMeta('Choisis ta classe', 'Sélectionne ta classe pour personnaliser ton parcours Smarter Academy.');
  const { user, updateGrade } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selecting, setSelecting] = useState(null);
  const [error, setError] = useState('');

  const handleSelect = async (gradeId) => {
    setSelecting(gradeId);
    setError('');
    try {
      await updateGrade(gradeId);
      // A diagnostic is the natural next onboarding step where one exists —
      // for any other grade, land in the space exactly as before.
      navigate(isDiagnosticAvailableForGrade(gradeId) ? '/espace/diagnostic' : '/espace');
    } catch (err) {
      setError(err.message);
      setSelecting(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-xl z-10 text-center mb-8"
      >
        <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-white mb-4" style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
          <GraduationCap size={26} />
        </div>
        <h1 className="font-space font-bold text-2xl sm:text-3xl text-slate-900">
          Bienvenue{user?.email ? ` ${user.email.split('@')[0]}` : ''} 👋
        </h1>
        <p className="mt-2 font-inter text-sm text-slate-500">
          Une dernière étape : choisis ta classe pour découvrir ton parcours. Tu pourras en changer à tout moment depuis ton profil.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="sm:mx-auto sm:w-full sm:max-w-xl z-10"
      >
        <div className="glass-card p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {Object.entries(GRADES_BY_LEVEL).map(([levelTitle, grades]) => (
              <div key={levelTitle}>
                <p className="font-mono-jetbrains text-blue-500 text-xs font-semibold tracking-widest uppercase mb-3">
                  {levelTitle}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {grades.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleSelect(g.id)}
                      disabled={selecting !== null}
                      className="group flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white font-inter font-semibold text-sm text-slate-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 disabled:opacity-50 transition-all"
                    >
                      {g.name}
                      {selecting === g.id ? (
                        <Sparkles size={14} className="animate-pulse text-blue-500 flex-shrink-0" />
                      ) : (
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
