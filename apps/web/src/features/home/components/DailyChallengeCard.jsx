import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flame } from 'lucide-react';
import { ArrowForward } from '../../../components/common/DirectionalIcons';
import { AuthContext } from '../../../context/AuthContext';
import { fetchTodayChallenge } from '../../../services/dailyChallengeService';

/**
 * L'appel de l'accueil vers « التحدّي اليومي » : la série, ce qui attend
 * aujourd'hui, un bouton. Une carte d'information — son échec ne casse
 * jamais l'accueil (elle disparaît simplement). Ses libellés vivent dans
 * `student` : l'écran du défi, lui, charge `challenge` à la demande.
 */
export default function DailyChallengeCard() {
  const { t } = useTranslation('student');
  const { token } = useContext(AuthContext);
  const [today, setToday] = useState(null);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    fetchTodayChallenge(token).then((d) => !cancelled && setToday(d)).catch(() => {});
    return () => { cancelled = true; };
  }, [token]);

  if (!today || today.reason === 'disabled' || today.reason === 'nothing_to_review') return null;
  const attempt = today.attempt;
  const done = attempt && attempt.status !== 'in_progress';
  // Pas d'appel à « commencer » un jour sans défi (repos, fenêtre fermée).
  const cta = done ? t('challengeCard.result') : attempt ? t('challengeCard.resume') : today.available ? t('challengeCard.start') : null;

  return (
    <Link
      to="/espace/defi"
      className="group relative mt-5 flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-l from-amber-50 via-white to-indigo-50 p-4 text-slate-900 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-5"
      data-daily-challenge-card
    >
      <span aria-hidden="true" className="pointer-events-none absolute -top-16 end-0 h-40 w-72 rounded-full bg-gradient-to-r from-violet-300/20 to-cyan-200/20 blur-3xl" />
      <span className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${today.streak?.current > 0 ? 'bg-gradient-to-br from-amber-300 to-orange-500 text-slate-950' : 'bg-amber-100 text-amber-700'}`}>
        <Flame size={24} aria-hidden="true" />
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="block font-inter text-[11px] font-bold text-amber-700">{t('challengeCard.eyebrow')}</span>
        <span className="block font-space text-base font-black sm:text-lg">{done ? t('challengeCard.titleDone') : t('challengeCard.title')}</span>
        <span className="block font-inter text-xs text-slate-600">
          {t('challengeCard.streak', { count: today.streak?.current ?? 0 })}
          {' · '}
          {done
            ? t('challengeCard.score', { score: attempt.score.total })
            : today.available && today.challenge
              ? t('challengeCard.questions', { count: today.challenge.questionCount, points: today.challenge.maxPossible })
              : today.reason === 'rest_day' ? t('challengeCard.restDay') : ''}
        </span>
      </span>
      {cta && <span className="relative hidden items-center gap-1 rounded-xl bg-nav-accent px-4 py-2 font-space text-sm font-black text-white sm:inline-flex">
        {cta} <ArrowForward size={14} aria-hidden="true" />
      </span>}
    </Link>
  );
}
