import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { ArrowForward } from '../../../components/common/DirectionalIcons';
import { useDiagnosticSession } from '../../../hooks/useDiagnosticSession';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import QuestionRenderer from '../../../components/diagnostic/QuestionRenderer';
import DiagnosticProgress from '../../../components/diagnostic/DiagnosticProgress';
import { ValidateButton } from '../../../lessons/common/components/LessonUI';
import ReportButton from '../../../features/reports/ReportButton';

// Neutral, non-evaluative acknowledgements — no "Correct !"/"Faux !" banner,
// no red/green here. The diagnostic isn't the moment for correction; that
// happens later, inside the actual lesson (§12 of the brief).
// On ne garde ici que les CLÉS : t() n'est pas disponible au niveau module.
const CORRECT_ACK_KEYS = ['diagnostic.ackCorrect1', 'diagnostic.ackCorrect2', 'diagnostic.ackCorrect3'];
const INCORRECT_ACK_KEYS = ['diagnostic.ackIncorrect1', 'diagnostic.ackIncorrect2', 'diagnostic.ackIncorrect3'];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * autoStart: true — this page is safe to land on directly (deep link,
 * resume from a previous visit, hard refresh mid-question): the hook
 * always ends up with a real session and the SAME pending question if one
 * was already in flight, never silently skipping or duplicating it.
 */
export default function DiagnosticRun() {
  const { t } = useTranslation('student');
  useDocumentMeta(t('diagnostic.metaTitle'), t('diagnostic.runMetaDescription'));
  const navigate = useNavigate();
  const { session, question, loading, error, submitAnswer, advanceTo } = useDiagnosticSession('6e', { autoStart: true });

  const [draft, setDraft] = useState(null);
  const [phase, setPhase] = useState('answering'); // 'answering' | 'feedback'
  const [pending, setPending] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [askedCount, setAskedCount] = useState(0);
  const [ackKey, setAckKey] = useState('');

  // Only redirect once the student has actually seen the feedback moment
  // for their final answer and chosen to continue — not the instant the
  // session flips to completed, which would yank the last question away.
  useEffect(() => {
    if (session?.status === 'completed' && phase === 'answering') {
      navigate('/espace/diagnostic/resultat', { state: { profile: session.profile } });
    }
  }, [session, phase, navigate]);

  const handleValidate = async () => {
    if (draft === null || submitting) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const result = await submitAnswer(draft);
      setAskedCount((c) => c + 1);
      setAckKey(pick(result.isCorrect ? CORRECT_ACK_KEYS : INCORRECT_ACK_KEYS));
      setPending(result);
      setPhase('feedback');
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (!pending) return;
    if (pending.completed) {
      navigate('/espace/diagnostic/resultat', { state: { profile: pending.profile } });
      return;
    }
    advanceTo(pending.nextQuestion);
    setDraft(null);
    setPending(null);
    setPhase('answering');
  };

  if (loading && !question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-nav-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="glass-card p-8 text-center max-w-sm">
          <p className="text-sm text-rose-600 mb-4">{error}</p>
          <Link to="/espace" className="btn-secondary text-sm inline-flex">
            {t('diagnostic.backToSpace')}
          </Link>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="flex items-center justify-between px-4 sm:px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/brand/logo-horizontal-color.svg" width="490" height="200" decoding="async" alt="Smarter Academy" className="h-8 w-auto" />
        </Link>
        <Link
          to="/espace"
          aria-label={t('diagnostic.exitAria')}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent"
        >
          <X size={18} />
        </Link>
      </header>

      <div className="px-4 mb-6 sm:mb-8">
        <DiagnosticProgress askedCount={askedCount} />
      </div>

      <main className="flex-1 flex items-start justify-center px-4 pb-10">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="glass-card p-6 sm:p-8">
                <p className="font-space font-bold text-lg sm:text-xl text-slate-900 mb-6 leading-snug text-center">
                  {question.prompt}
                </p>

                <QuestionRenderer question={question} onChange={setDraft} disabled={phase === 'feedback' || submitting} />

                {submitError && <p className="text-sm text-rose-600 text-center mt-4">{submitError}</p>}

                <div className="mt-7 flex flex-col items-center gap-3">
                  {phase === 'answering' ? (
                    <ValidateButton onClick={handleValidate} disabled={draft === null || submitting}>
                      {submitting ? t('diagnostic.checking') : t('diagnostic.validate')}
                    </ValidateButton>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col items-center gap-4">
                      <p className="font-inter text-sm text-slate-500">{ackKey ? t(ackKey) : ''}</p>
                      <button
                        type="button"
                        onClick={handleContinue}
                        autoFocus
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-space font-bold text-white shadow-md transition-all hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent focus-visible:ring-offset-2"
                        style={{ background: '#3B5BDB' }}
                      >
                        {pending?.completed ? t('diagnostic.seeMyProfile') : t('diagnostic.continue')}
                        <ArrowForward size={16} />
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Le diagnostic pose de VRAIES questions, corrigées côté serveur :
              une question fausse s'y signale comme ailleurs. Pas de code de
              leçon ici — le diagnostic n'en dépend pas — d'où le contexte
              réduit à l'étape. */}
          <div className="flex justify-end pt-4">
            <ReportButton source="diagnostic" variant="link" context={{ step: 'diagnostic' }} />
          </div>
        </div>
      </main>
    </div>
  );
}
