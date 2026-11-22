import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sparkles, Clock, Brain } from 'lucide-react';
import { ArrowForward } from '../../../components/common/DirectionalIcons';
import { useDiagnosticSession } from '../../../hooks/useDiagnosticSession';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';

/**
 * The welcoming gate, not the diagnostic itself — read-only peek at
 * whether a session already exists (autoStart: false) purely to word the
 * CTA correctly (Commencer / Reprendre / Voir mon profil). Starting or
 * resuming the actual session is DiagnosticRun's job, so this page never
 * mutates anything and is always safe to land on or revisit.
 */
export default function DiagnosticIntro() {
  const { t } = useTranslation('student');
  useDocumentMeta(t('diagnostic.metaTitle'), t('diagnostic.metaDescription'));
  const navigate = useNavigate();
  const { session, loading } = useDiagnosticSession('6e', { autoStart: false });

  const isCompleted = session?.status === 'completed';
  const isResuming = session?.status === 'in_progress';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-3xl pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg z-10">
        <div className="glass-card p-7 sm:p-9 text-center">
          <div
            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white mb-5"
            style={{ background: '#3B5BDB' }}
          >
            <Brain size={28} />
          </div>

          <h1 className="font-space font-bold text-2xl sm:text-3xl text-slate-900 mb-3">
            {isCompleted ? t('diagnostic.introTitleCompleted') : t('diagnostic.introTitle')}
          </h1>

          {isCompleted ? (
            <p className="font-inter text-slate-500 text-sm leading-relaxed mb-7">
              {t('diagnostic.introBodyCompleted')}
            </p>
          ) : (
            <p className="font-inter text-slate-500 text-sm leading-relaxed mb-7">
              {t('diagnostic.introBody')}
            </p>
          )}

          <div className="flex items-center justify-center gap-6 mb-8 text-slate-400">
            <span className="flex items-center gap-1.5 text-xs font-mono-jetbrains font-semibold">
              <Clock size={14} /> {t('diagnostic.duration')}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-mono-jetbrains font-semibold">
              <Sparkles size={14} /> {t('diagnostic.noGrade')}
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate(isCompleted ? '/espace/diagnostic/resultat' : '/espace/diagnostic/run')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-space font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-60"
            style={{ background: '#3B5BDB' }}
          >
            {loading
              ? t('diagnostic.loadingCta')
              : isCompleted
              ? t('diagnostic.seeMyProfile')
              : isResuming
              ? t('diagnostic.resumeDiagnostic')
              : t('diagnostic.startDiagnostic')}
            <ArrowForward size={17} />
          </button>

          <Link to="/espace" className="block mt-4 text-xs font-inter text-slate-400 hover:text-slate-600 transition-colors">
            {t('diagnostic.laterBackToSpace')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
