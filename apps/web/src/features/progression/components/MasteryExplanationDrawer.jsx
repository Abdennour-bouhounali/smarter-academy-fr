import { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import { fetchLearningPointExplanation } from '../../../services/learningEvidenceService';
import { MASTERY_STATES, resolveMasteryState, reasonLabel, freshnessLabel } from '../../../lessons/common/components/LearningPointMastery';
import { LOCALE } from '../../../locale';

const PILL = {
  slate: 'bg-slate-100 text-slate-600',
  rose: 'bg-rose-100 text-rose-700',
  amber: 'bg-amber-100 text-amber-700',
  emerald: 'bg-emerald-100 text-emerald-700',
};

const OUTCOME_TONE = {
  correct: 'text-emerald-700',
  equivalent_correct: 'text-emerald-700',
  partially_correct: 'text-amber-700',
  incorrect: 'text-rose-700',
  abandoned: 'text-slate-500',
  syntax_error: 'text-slate-500',
};

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * « لماذا؟ » — le tiroir d'explication de la maîtrise d'UN point
 * d'apprentissage (plan §18, `GET /students/me/learning-points/{code}/explanation`).
 *
 * Il rend ce que le serveur sait, et rien qu'il ne dise : l'état et sa
 * raison, les faits de preuve (items distincts réussis sur le nombre requis,
 * réussites au test final, avec indices, difficulté maximale, dernières
 * dates), puis les dernières tentatives (date, source, issue, nature). Aucun
 * chiffre n'est fabriqué côté client — `evidence: null` s'affiche comme
 * « pas encore de preuve ».
 *
 * Accessibilité : `role="dialog"` modal, titre lié, focus posé sur la
 * fermeture à l'ouverture, Échap et clic sur le fond ferment. RTL : le
 * tiroir s'ancre sur le bord de DÉBUT (`start-0`) — la droite en arabe.
 */
export default function MasteryExplanationDrawer({ code, title, open, onClose }) {
  const { t } = useTranslation('student');
  const { token } = useContext(AuthContext);
  const [state, setState] = useState({ status: 'idle', data: null });
  const [attempt, setAttempt] = useState(0);
  const closeRef = useRef(null);
  const titleId = `lp-explain-${code ?? 'none'}`;

  useEffect(() => {
    if (!open || !code || !token) return undefined;
    let cancelled = false;
    setState({ status: 'loading', data: null });
    fetchLearningPointExplanation(token, code)
      .then((data) => !cancelled && setState({ status: 'ready', data }))
      .catch(() => !cancelled && setState({ status: 'error', data: null }));

    return () => { cancelled = true; };
  }, [open, code, token, attempt]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();

    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const ex = state.data;
  const stateKey = ex ? resolveMasteryState(ex) : 'unassessed';
  const s = MASTERY_STATES[stateKey];
  const reason = ex && stateKey === 'reinforce' ? reasonLabel(ex, t) : '';
  const freshness = ex?.freshness && ex.freshness !== 'fresh' && stateKey === 'mastered' ? freshnessLabel(ex, t) : '';
  const ev = ex?.evidence ?? null;
  const pct = typeof ex?.confidence === 'number' ? Math.round(ex.confidence * 100) : null;

  const facts = ev
    ? [
      typeof ev.needed === 'number'
        ? t('mastery.explain.distinctSuccess', { done: ev.distinctItemsSuccess ?? 0, needed: ev.needed })
        : t('mastery.explain.distinctSuccessNoNeed', { done: ev.distinctItemsSuccess ?? 0 }),
      t('mastery.explain.attempts', { count: ev.attempts ?? 0 }),
      t('mastery.explain.successes', { count: ev.successes ?? 0 }),
      t('mastery.explain.assessmentSuccesses', { count: ev.assessmentSuccesses ?? 0 }),
      t('mastery.explain.withHints', { count: ev.recentSuccessesWithHints ?? 0 }),
      typeof ev.maxDifficultySuccess === 'number' && ev.maxDifficultySuccess > 0
        ? t('mastery.explain.maxDifficulty', { level: ev.maxDifficultySuccess })
        : null,
      ev.lastSuccessAt ? t('mastery.explain.lastSuccess', { date: formatDate(ev.lastSuccessAt) }) : null,
      ev.lastFailureAt ? t('mastery.explain.lastFailure', { date: formatDate(ev.lastFailureAt) }) : null,
    ].filter(Boolean)
    : [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mastery-explain"
          className="fixed inset-0 z-50 flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-mastery-explanation
        >
          <button type="button" className="absolute inset-0 bg-slate-900/40" aria-label={t('mastery.explain.close')} onClick={onClose} tabIndex={-1} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative ms-0 me-auto h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto p-5 sm:p-6 space-y-5"
            initial={{ x: 40 }}
            animate={{ x: 0 }}
            exit={{ x: 40 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400">{t('mastery.explain.title')}</p>
                <h2 id={titleId} className="font-space font-bold text-slate-900 text-lg leading-snug">{ex?.learningPoint?.title ?? title}</h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="shrink-0 w-10 h-10 rounded-xl border-2 border-slate-200 hover:border-slate-400 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent"
                aria-label={t('mastery.explain.close')}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {state.status === 'loading' && (
              <div className="space-y-3" aria-busy="true">
                <p className="text-sm text-slate-500">{t('mastery.explain.loading')}</p>
                <div className="h-6 w-32 rounded-full bg-slate-100 animate-pulse" />
                <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
              </div>
            )}

            {state.status === 'error' && (
              <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-4 space-y-2">
                <p className="text-sm text-rose-700">{t('mastery.explain.error')}</p>
                <button
                  type="button"
                  onClick={() => setAttempt((n) => n + 1)}
                  className="px-4 py-2 min-h-[40px] rounded-lg bg-white border-2 border-rose-300 text-rose-700 text-xs font-bold"
                >
                  {t('mastery.explain.retry')}
                </button>
              </div>
            )}

            {state.status === 'ready' && ex && (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold ${PILL[s.tone]}`} data-mastery-state={stateKey}>
                    <span aria-hidden="true">{s.emoji}</span> {t(s.labelKey)}
                  </span>
                  {pct !== null && <span className="text-xs text-slate-500 font-mono">{t('mastery.explain.confidence', { percent: pct })}</span>}
                  {freshness && <span className="text-xs text-emerald-800">⏳ {freshness}</span>}
                </div>
                {reason && <p className="text-sm text-amber-900 leading-relaxed" data-mastery-reason={ex.statusReason}>{reason}</p>}

                <section className="space-y-2">
                  <h3 className="font-space font-bold text-slate-800 text-sm">{t('mastery.explain.evidenceTitle')}</h3>
                  {ev ? (
                    <ul className="text-sm text-slate-700 space-y-1 list-disc ps-5">
                      {facts.map((f) => <li key={f}>{f}</li>)}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">{t('mastery.explain.noEvidence')}</p>
                  )}
                </section>

                <section className="space-y-2">
                  <h3 className="font-space font-bold text-slate-800 text-sm">{t('mastery.explain.recentTitle')}</h3>
                  {(ex.recent ?? []).length === 0 ? (
                    <p className="text-sm text-slate-500">{t('mastery.explain.noRecent')}</p>
                  ) : (
                    <ol className="space-y-2">
                      {ex.recent.map((r, i) => (
                        <li key={`${r.at}-${r.itemKey ?? i}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs space-y-0.5">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-bold text-slate-700">{r.source ? t(`mastery.explain.source.${r.source}`, { defaultValue: r.source }) : ''}</span>
                            <span className="text-slate-500">{formatDate(r.at)}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-bold ${OUTCOME_TONE[r.outcome] ?? 'text-slate-600'}`}>
                              {t(`mastery.explain.outcome.${r.outcome}`, { defaultValue: r.outcome })}
                            </span>
                            {r.kind && <span className="text-slate-600">· {t(`mastery.explain.kind.${r.kind}`, { defaultValue: r.kind })}</span>}
                            {typeof r.level === 'number' && <span className="text-slate-500">· {t('mastery.explain.level', { level: r.level })}</span>}
                            {r.hints > 0 && <span className="text-slate-500">· {t('mastery.explain.hintsUsed', { count: r.hints })}</span>}
                          </div>
                          {r.itemTitle && <p className="text-slate-500 truncate">{r.itemTitle}</p>}
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
