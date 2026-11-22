import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bookmark, Info, Lock } from 'lucide-react';
import { ToneIcon, TONE_STYLE } from '../toneStyle';
import { stepState } from './examSheet';

/**
 * « التنقل في التمرين » — la colonne d'une feuille d'examen (maquette du
 * propriétaire, 2026-10-06) : l'exercice et ses points, la liste de ses
 * questions (faite ✓/✕, en cours, à venir — verrouillée tant que la précédente
 * n'est pas résolue : les étapes se révèlent une à une), et le marque-page
 * « أريد العودة إلى هذا السؤال لاحقًا ».
 *
 * Le marque-page est un confort LOCAL (localStorage, protégé) : il ne change
 * rien à la séance ni à la maîtrise. Cliquer une question faite ou marquée
 * amène la feuille dessus.
 */
const flagKey = (exerciseId) => `sa-exam-flags:${exerciseId}`;

function readFlags(exerciseId) {
  try {
    const raw = window.localStorage.getItem(flagKey(exerciseId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function ExamNavigator({ exercise, questionIndex, history, onJump }) {
  const { t } = useTranslation('student');
  const [flags, setFlags] = useState(() => readFlags(exercise.id));
  useEffect(() => { setFlags(readFlags(exercise.id)); }, [exercise.id]);

  const exam = exercise.metadata.exam;
  const current = exercise.questions[questionIndex];
  const flagged = current ? flags.includes(current.id) : false;

  const toggleFlag = () => {
    if (!current) return;
    const next = flagged ? flags.filter((id) => id !== current.id) : [...flags, current.id];
    setFlags(next);
    try { window.localStorage.setItem(flagKey(exercise.id), JSON.stringify(next)); } catch { /* confort local */ }
  };

  const jump = (q) => {
    onJump?.(); // dans la fenêtre centrale : on la ferme d'abord
    const el = document.querySelector(`[data-exam-question="${q.id}"]`);
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  return (
    <nav className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200" aria-label={t('practice.exam.nav.title')} data-exam-navigator>
      <p className="text-base font-bold text-slate-900">{t('practice.exam.nav.title')}</p>

      <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm ring-1 ring-slate-200">
        <span className="font-bold text-slate-900">{exam.heading}</span>{' '}
        <span className="text-slate-600">(<bdi dir="ltr">{exam.points}</bdi> {t('practice.exam.pointsUnit')})</span>
      </div>

      <ol className="space-y-1">
        {exercise.questions.map((q, i) => {
          const state = stepState(i, questionIndex);
          const entry = state === 'done' ? history.find((e) => e.questionId === q.id) : null;
          const label = `${t('practice.exam.nav.question')} ${q.step ?? String(i + 1).padStart(2, '0')}${q.sub ? ` (${q.sub})` : ''}`;
          const isFlagged = flags.includes(q.id);
          const content = (
            <>
              <span
                className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  state === 'current' ? 'bg-nav-accent text-white'
                    : entry ? TONE_STYLE[entry.tone].node
                      : 'bg-white text-slate-400 ring-1 ring-slate-300'
                }`}
              >
                {entry ? <ToneIcon tone={entry.tone} className="h-3.5 w-3.5" /> : state === 'upcoming' ? <Lock className="h-3 w-3" aria-hidden="true" /> : i + 1}
              </span>
              <span className="min-w-0 flex-1 text-start">{label}</span>
              {isFlagged && <Bookmark className="h-4 w-4 shrink-0 fill-amber-400 text-amber-500" aria-label={t('practice.exam.nav.flagged')} />}
            </>
          );
          const base = 'flex w-full min-h-[44px] items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-sm';
          return (
            <li key={q.id} data-exam-nav-item={state}>
              {state === 'upcoming' ? (
                <span className={`${base} text-slate-400`} title={t('practice.exam.nav.locked')}>{content}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => jump(q)}
                  aria-current={state === 'current' ? 'step' : undefined}
                  className={`${base} font-semibold ${state === 'current' ? 'bg-nav-accent-soft text-indigo-900' : 'text-slate-800 hover:bg-slate-50'} focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400`}
                >
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ol>

      <div className="space-y-1.5 border-t border-slate-200 pt-3">
        <p className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
          <Bookmark className="h-4 w-4" aria-hidden="true" /> {t('practice.exam.nav.flagTitle')}
        </p>
        <label className="flex min-h-[40px] cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={flagged} onChange={toggleFlag} className="h-4 w-4 rounded border-slate-400 text-nav-accent focus:ring-nav-accent" data-exam-flag />
          {t('practice.exam.nav.flagLabel')}
        </label>
      </div>

      <p className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200">
        <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {t('practice.exam.nav.autosave')}
      </p>
    </nav>
  );
}
