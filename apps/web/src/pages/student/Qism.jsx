import { useCallback, useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Users, KeyRound, CheckCircle2, AlertCircle, LogOut, Lightbulb, BookOpen } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useStudyContext } from '../../context/StudyContextContext';
import { useContentAvailability } from '../../context/ContentAvailabilityContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import {
  joinClassGroup,
  leaveClassGroup,
  confirmClassConsent,
  confirmSchoolConsent,
  fetchTeacherRecommendations,
} from '../../services/studyContextService';
import { ConfirmDialog } from '../../components/admin/ui/Modal';
import { getAllGrades, getLessonPath } from '@smarter-academy/core';
import { LOCALE } from '../../locale';
import SharingDisclosure from '../../components/student/SharingDisclosure';
import { joinRequest, classroomsAwaitingConsent, visibleRecommendations } from './qismConsent';

/**
 * « قسمي » — la classe de l'enseignant que l'élève a rejointe, ou peut
 * rejoindre par code (six symboles, en LTR comme un code d'activation). Le
 * LIEN de classe a sa propre page (pages/JoinClassLink.jsx) et revient ici
 * une fois l'adhésion faite, avec `state.joinedClassroom`.
 *
 * Cette page n'AUTORISE rien : elle transmet un code et affiche ce que le
 * serveur a décidé. Quitter une classe ne touche à aucune donnée
 * d'apprentissage, et la confirmation le dit.
 *
 * ── Rejoindre = consentir, et seulement par un geste ─────────────────────
 * L'enseignant verra, pour les leçons du قسم, la progression, la maîtrise,
 * les réponses et le كرّاسي (voir qismConsent.js). La page le DIT avant
 * d'envoyer quoi que ce soit, et la requête ne part qu'après « أوافق
 * وأنضمّ ». Le lien de classe applique la même règle sur sa page.
 * Une adhésion antérieure au texte (`consentRequired`) reçoit une carte
 * non bloquante : confirmer, ou quitter.
 *
 * ── Un seul قسم à la fois (2026-10-24) ─────────────────────────────────
 * Un élève déjà dans un قسم ne voit PAS le formulaire du code : la page dit
 * qu'il faut quitter son قسم pour en rejoindre un autre. Le serveur tient la
 * règle (`already_in_class`) ; masquer le formulaire n'en est que le reflet.
 */
function formatDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatCodeInput(raw) {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

export default function Qism() {
  const { t } = useTranslation('student');
  useDocumentMeta(t('qism.metaTitle'), t('qism.metaDescription'));
  const { token } = useContext(AuthContext);
  const { studyContext, refresh } = useStudyContext();
  const { refresh: refreshAvailability, hiddenByClassCount } = useContentAvailability();
  const location = useLocation();

  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  // Arrivé depuis le lien de classe : l'adhésion vient d'être faite là-bas.
  const [success, setSuccess] = useState(location.state?.joinedClassroom ?? null);
  const [leaving, setLeaving] = useState(null);
  const [busy, setBusy] = useState(false);
  const [consenting, setConsenting] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const messageFor = (err) => {
    if (err?.type === 'RATE_LIMITED') return t('qism.errors.rate_limited');
    return t(`qism.errors.${err?.reason ?? 'generic'}`, { defaultValue: t('qism.errors.generic') });
  };

  // Des suggestions, jamais un verrou : si elles ne chargent pas, la
  // section se tait — rien d'autre sur la page n'en dépend.
  const loadRecommendations = useCallback(() => {
    if (!token) return Promise.resolve();
    return fetchTeacherRecommendations(token)
      .then((list) => setRecommendations(visibleRecommendations(list, getLessonPath)))
      .catch(() => setRecommendations([]));
  }, [token]);

  useEffect(() => { loadRecommendations(); }, [loadRecommendations]);

  const afterJoin = async (result) => {
    setSuccess(result?.studyContext?.primary?.name ?? '');
    setCode('');
    await Promise.all([refresh().catch(() => {}), refreshAvailability().catch(() => {}), loadRecommendations()]);
  };

  const handleJoin = async (event) => {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setSuccess(null);
    if (!code.trim()) {
      setError(t('qism.errors.invalid'));
      return;
    }
    setPending(true);
    try {
      // Le bouton de ce formulaire EST le geste de consentement : « أوافق
      // وأنضمّ », sous le texte de partage.
      const result = await joinClassGroup(token, joinRequest({ code }, true));
      await afterJoin(result);
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setPending(false);
    }
  };

  const handleLeave = async () => {
    if (!leaving) return;
    setBusy(true);
    try {
      await leaveClassGroup(token, leaving.id);
      setLeaving(null);
      await Promise.all([refresh().catch(() => {}), refreshAvailability().catch(() => {}), loadRecommendations()]);
    } catch (err) {
      setError(messageFor(err));
      setLeaving(null);
    } finally {
      setBusy(false);
    }
  };

  const handleConsent = async (classroom) => {
    if (consenting) return;
    setConsenting(classroom.id);
    setError(null);
    try {
      await confirmClassConsent(token, classroom.id);
      await refresh().catch(() => {});
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setConsenting(null);
    }
  };

  const gradeName = (code) => getAllGrades().find((g) => g.id === code)?.name ?? code;
  // Une classe d'établissement dont la direction attend encore le « oui » de
  // l'élève (SCHOOL_ADMIN_SPACE.md §4) : une carte, jamais un mur.
  const handleSchoolConsent = async (classroom) => {
    if (consenting) return;
    setConsenting(`school-${classroom.id}`);
    setError(null);
    try {
      await confirmSchoolConsent(token, classroom.id);
      await refresh().catch(() => {});
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setConsenting(null);
    }
  };

  const awaitingConsent = classroomsAwaitingConsent(studyContext);
  const awaitingSchoolConsent = (studyContext?.classrooms ?? []).filter((c) => c.schoolConsentRequired && c.schoolName);

  return (
    <div className="sa-page py-8 sm:py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('qism.title')}</h1>
          <p className="text-slate-600">{t('qism.subtitle')}</p>
        </header>

        {success !== null && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} role="status" className="glass-card p-5 border-emerald-200 bg-emerald-50/60 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="font-semibold text-emerald-900" data-qism-joined>{location.state?.alreadyMember && success === location.state?.joinedClassroom ? t('qism.errors.already_member') : t('qism.joinSuccess', { name: success })}</p>
          </motion.div>
        )}

        {/* Adhésions antérieures au texte de partage : une carte par قسم,
            jamais un mur — le reste de l'espace reste ouvert. */}
        {awaitingConsent.map((c) => (
          <section key={c.id} className="glass-card p-5 sm:p-6 border-amber-200 bg-amber-50/40" aria-labelledby={`qism-consent-${c.id}`} data-qism-consent-required={c.id}>
            <h2 id={`qism-consent-${c.id}`} className="font-semibold text-slate-900">{t('qism.consentUpdate.title', { name: c.name })}</h2>
            <p className="text-sm text-slate-600 mt-1 mb-4">{t('qism.consentUpdate.body')}</p>
            <SharingDisclosure />
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <button type="button" onClick={() => handleConsent(c)} disabled={consenting !== null} data-qism-consent-accept className="px-6 py-3 rounded-xl bg-teal-700 text-white font-semibold hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed">
                {consenting === c.id ? t('qism.consentUpdate.accepting') : t('qism.consentUpdate.accept')}
              </button>
              <button type="button" onClick={() => setLeaving(c)} disabled={consenting !== null} className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:text-rose-700 hover:border-rose-200 disabled:opacity-60">
                <LogOut size={15} /> {t('qism.leave')}
              </button>
            </div>
          </section>
        ))}

        {awaitingSchoolConsent.map((c) => (
          <section key={`school-${c.id}`} className="glass-card p-5 sm:p-6 border-teal-200 bg-teal-50/40" aria-labelledby={`qism-school-consent-${c.id}`} data-qism-school-consent={c.id}>
            <h2 id={`qism-school-consent-${c.id}`} className="font-semibold text-slate-900">{t('qism.schoolConsent.title', { school: c.schoolName, name: c.name })}</h2>
            <p className="text-sm text-slate-600 mt-1 mb-4">{t('qism.schoolConsent.body')}</p>
            <button type="button" onClick={() => handleSchoolConsent(c)} disabled={consenting !== null} data-qism-school-consent-accept className="px-6 py-3 rounded-xl bg-teal-700 text-white font-semibold hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed">
              {consenting === `school-${c.id}` ? t('qism.schoolConsent.accepting') : t('qism.schoolConsent.accept')}
            </button>
          </section>
        ))}

        <section className="glass-card p-5 sm:p-6" aria-label={t('qism.currentTitle')} data-qism-current>
          {studyContext.mode === 'classroom' ? (
            <>
              <h2 className="font-semibold text-slate-900 mb-3">{t('qism.currentTitle')}</h2>
              <ul className="space-y-3">
                {studyContext.classrooms.map((c) => (
                  <li key={c.id} className="rounded-xl border border-slate-200 bg-white p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0"><Users size={18} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="font-space font-bold text-slate-900">{c.name}</p>
                      <p className="text-sm text-slate-600">{t('qism.teacherLabel')}: {c.teacherName || '—'} · {t('qism.gradeLabel')}: {gradeName(c.grade)}</p>
                      {c.joinedAt && <p className="text-xs text-slate-400 mt-0.5">{t('qism.joinedAt', { date: formatDate(c.joinedAt) })}</p>}
                    </div>
                    <button type="button" onClick={() => setLeaving(c)} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-700">
                      <LogOut size={13} /> {t('qism.leave')}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-slate-500">{t('qism.hiddenLessons', { count: hiddenByClassCount })}</p>
              <p className="mt-2 text-sm text-slate-500" data-qism-one-class>{t('qism.oneClassOnly')}</p>
            </>
          ) : (
            <>
              <h2 className="font-semibold text-slate-900">{t('qism.independentTitle')}</h2>
              <p className="text-sm text-slate-600 mt-1">{t('qism.independentBody')}</p>
            </>
          )}
        </section>

        {recommendations.length > 0 && (
          <section className="glass-card p-5 sm:p-6" aria-labelledby="qism-recommendations-title" data-qism-recommendations>
            <h2 id="qism-recommendations-title" className="font-semibold text-slate-900">{t('qism.recommendations.title')}</h2>
            <p className="text-sm text-slate-600 mt-1 mb-4">{t('qism.recommendations.intro')}</p>
            <ul className="space-y-3">
              {recommendations.map((r) => (
                <li key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 flex items-start gap-3" data-qism-recommendation={r.kind}>
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0"><Lightbulb size={18} /></div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-semibold text-slate-900">{t(`qism.recommendations.kinds.${r.kind}`)}</p>
                    {r.learningPoint?.title && (
                      <p className="text-sm text-slate-700">{t('qism.recommendations.learningPointLabel')}: {r.learningPoint.title}</p>
                    )}
                    {r.lesson?.title && (
                      <p className="text-sm text-slate-700">{t('qism.recommendations.lessonLabel')}: {r.lesson.title}</p>
                    )}
                    {r.message && (
                      <blockquote className="mt-2 border-s-4 border-teal-200 ps-3 text-sm text-slate-700" aria-label={t('qism.recommendations.messageLabel')}>
                        « {r.message} »
                      </blockquote>
                    )}
                    <p className="text-xs text-slate-400">{t('qism.recommendations.from', { teacher: r.teacherName || '—', classroom: r.classroomName || '—' })}</p>
                    {r.lessonPath && (
                      <Link to={r.lessonPath} className="inline-flex items-center gap-1 mt-1 text-sm font-semibold text-teal-700 hover:text-teal-800">
                        <BookOpen size={14} /> {t('qism.recommendations.openLesson')}
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {studyContext.mode !== 'classroom' && (
          <section className="glass-card p-5 sm:p-6" data-tour="qism.join" data-qism-join>
            <h2 className="font-semibold text-slate-900">{t('qism.joinTitle')}</h2>
            <p className="text-sm text-slate-600 mt-1 mb-4">{t('qism.joinBody')}</p>
            <form onSubmit={handleJoin} noValidate className="space-y-4">
              <div className="relative">
                <span className="absolute left-0 inset-y-0 flex items-center pl-3 text-slate-400 pointer-events-none"><KeyRound className="w-5 h-5" /></span>
                <input
                  id="join-code"
                  name="code"
                  type="text"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  dir="ltr"
                  value={code}
                  onChange={(e) => setCode(formatCodeInput(e.target.value))}
                  placeholder={t('qism.codePlaceholder')}
                  aria-label={t('qism.codeLabel')}
                  aria-invalid={error ? 'true' : undefined}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white font-mono tracking-[0.3em] text-lg text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                />
              </div>
              {error && (
                <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-800">{error}</p>
                </div>
              )}
              <SharingDisclosure />
              <button type="submit" disabled={pending} data-qism-consent-join className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-700 text-white font-semibold hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed">
                {pending ? t('qism.joining') : t('qism.consentJoin')}
              </button>
            </form>
          </section>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(leaving)}
        onClose={() => setLeaving(null)}
        onConfirm={handleLeave}
        busy={busy}
        tone="danger"
        title={t('qism.leaveConfirmTitle', { name: leaving?.name ?? '' })}
        message={<p>{t('qism.leaveConfirmBody')}</p>}
        confirmLabel={t('qism.leaveConfirm')}
        cancelLabel={t('qism.cancel')}
        busyLabel={t('qism.joining')}
        closeLabel={t('qism.cancel')}
      />
    </div>
  );
}
