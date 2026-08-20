import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, ArrowRight } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useDiagnosticSession } from '../../hooks/useDiagnosticSession';
import { isDiagnosticAvailableForGrade } from '../../services/diagnosticService';

/**
 * A dashboard nudge for a student whose grade has a diagnostic they
 * haven't completed yet — the entry point for anyone who skipped it during
 * onboarding or exited mid-flow. Renders nothing once completed, and
 * nothing at all for a grade with no diagnostic yet (§2 of the brief).
 */
export default function DiagnosticInviteBanner() {
  const { user } = useContext(AuthContext);
  const eligible = isDiagnosticAvailableForGrade(user?.grade);
  const { session, loading } = useDiagnosticSession(eligible ? user.grade : null, { autoStart: false });

  if (!eligible || loading || session?.status === 'completed') return null;

  const isResuming = session?.status === 'in_progress';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
      <Link
        to="/espace/diagnostic"
        className="group flex items-center justify-between gap-4 p-5 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50/50 hover:border-blue-300 transition-all"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
          >
            <Brain size={19} />
          </div>
          <div className="min-w-0">
            <p className="font-space font-bold text-slate-900 text-sm">
              {isResuming ? 'Reprends ton diagnostic 6e' : 'Découvre ton profil mathématique'}
            </p>
            <p className="font-inter text-slate-500 text-xs mt-0.5 truncate">
              {isResuming
                ? 'Encore quelques questions pour connaître ton point de départ.'
                : '10 à 15 min, sans note — pour savoir par où commencer.'}
            </p>
          </div>
        </div>
        <ArrowRight size={16} className="text-blue-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
      </Link>
    </motion.div>
  );
}
