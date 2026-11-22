import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Eye, Mountain, Wrench } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import { checkTeacherAnswer } from '../../../services/teacher/thinkingLabTeacherService';
import ReplayPlayer from '../replay/ReplayPlayer';
import { AnswerInput, ChallengeFigure, MathRun, PhaseChip, answerText, prettyMath } from '../ThinkingParts';

/**
 * Un défi du « مختبر التفكير » vu par l'ENSEIGNANT — tout ouvert (réponse, clés, erreurs, relecture,
 * suites, plafond, jumeau), une réponse à TESTER, rien d'écrit (THINKING_LAB.md §8bis).
 */
function Card({ title, children, tone = 'bg-white ring-slate-200' }) {
  return (
    <section className={`rounded-3xl p-5 ring-1 ${tone}`}>
      {title && <h2 className="font-space text-base font-black text-slate-900">{title}</h2>}
      <div className={title ? 'mt-3' : ''}>{children}</div>
    </section>
  );
}

/** Teste une réponse avec le juge de l'élève (principale, suite ou plafond). */
function TryAnswer({ id, tuple, kind, index, format }) {
  const { t } = useTranslation('thinking');
  const { token } = useContext(AuthContext);
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const go = async () => {
    if (!value.trim() || busy) return;
    setBusy(true);
    try {
      setResult(await checkTeacherAnswer(token, id, { answer: value, tuple, kind, index }));
    } catch {
      setResult({ error: true });
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-2" data-teacher-try={kind}>
      <AnswerInput format={format} value={value} onChange={setValue} onEnter={go} disabled={busy} />
      <button type="button" onClick={go} disabled={busy || !value.trim()}
        className="inline-flex min-h-[40px] items-center rounded-xl bg-teal-700 px-5 font-space text-sm font-black text-white enabled:hover:bg-teal-800 disabled:opacity-50">
        {t('teacher.testGo')}
      </button>
      {result && (
        <p role="status" className={`rounded-2xl px-4 py-2 font-inter text-sm ${result.correct ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`} data-teacher-verdict={result.correct ? 'right' : 'wrong'}>
          <span className="font-bold">{result.error ? t('errors.generic') : result.outcome === 'syntax_error' ? t('teacher.testSyntax') : result.correct ? t('teacher.testRight') : t('teacher.testWrong')}</span>
          {result.normalized && result.outcome !== 'syntax_error' && <> · {t('teacher.testWrote')} <bdi dir="ltr" className="font-semibold">{prettyMath(result.normalized)}</bdi></>}
          {result.reply && <span className="mt-1 block leading-7"><MathRun text={result.reply} /></span>}
        </p>
      )}
    </div>
  );
}

export default function TeacherChallengeView({ challenge: c, onTuple }) {
  const { t } = useTranslation('thinking');
  const [replayOpen, setReplayOpen] = useState(false);
  const tuple = c.tuple;
  const values = Object.entries(tuple.values);

  return (
    <div className="space-y-5" data-teacher-thinking={c.number}>
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/enseignant/tafkir" className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 font-inter text-xs font-bold text-slate-600 ring-1 ring-slate-200 hover:text-slate-900">
          <ChevronRight size={14} aria-hidden="true" /> {t('teacher.back')}
        </Link>
        <h1 className="font-space text-3xl font-black text-slate-900">{t('challengeNumber', { number: c.number })}</h1>
        {c.summit && <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 font-inter text-xs font-bold text-violet-700 ring-1 ring-violet-200"><Mountain size={14} aria-hidden="true" /> {t('summit')}</span>}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 font-inter text-xs font-bold text-amber-800 ring-1 ring-amber-200"><Eye size={14} aria-hidden="true" /> {t('teacher.banner')}</span>
      </div>

      <p className="font-inter text-sm text-slate-600">
        <span className="font-bold text-slate-900">{c.title}</span> · {t(`teacher.band.${c.band}`)} · {t(`teacher.family.${c.family}`)}
        {' '}· {t('teacher.meta.rating')} <bdi dir="ltr">{c.rating}</bdi> · {t('teacher.meta.licence')} <bdi dir="ltr">{c.licence}</bdi> · {t('teacher.meta.source')}: {c.source}
      </p>

      {tuple.count > 1 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-slate-50 px-4 py-2.5 ring-1 ring-slate-200" data-teacher-tuple>
          <span className="font-inter text-sm font-bold text-slate-700">{t('teacher.numbers')}</span>
          <button type="button" onClick={() => onTuple(tuple.index - 1)} disabled={tuple.index <= 0} aria-label="‹"
            className="rounded-lg p-1.5 ring-1 ring-slate-200 enabled:hover:bg-white disabled:opacity-40"><ChevronRight size={16} /></button>
          <span className="font-inter text-sm" dir="ltr">{t('teacher.tupleOf', { n: tuple.index + 1, count: tuple.count })}</span>
          <button type="button" onClick={() => onTuple(tuple.index + 1)} disabled={tuple.index >= tuple.count - 1} aria-label="›"
            className="rounded-lg p-1.5 ring-1 ring-slate-200 enabled:hover:bg-white disabled:opacity-40"><ChevronLeft size={16} /></button>
          <span className="font-inter text-xs text-slate-500" dir="ltr">{values.map(([k, v]) => `${k} = ${v}`).join(' · ')}</span>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr]">
        <div className="space-y-4">
          {c.example && (
            <Card title={t('teacher.example')} tone="bg-sky-50 ring-sky-200">
              <p className="font-inter text-sm leading-7 text-slate-800"><MathRun text={c.example.statement} /></p>
              <ol className="mt-2 list-decimal space-y-1 ps-5 font-inter text-sm leading-7 text-slate-700">{c.example.steps.map((s, i) => <li key={i}><MathRun text={s} /></li>)}</ol>
              <p className="mt-2 font-inter text-sm font-bold text-sky-900"><MathRun text={t('workspace.exampleAnswer', { answer: c.example.answer })} /></p>
            </Card>
          )}
          <Card><p className="font-inter text-lg leading-9 text-slate-900" data-statement><MathRun text={c.statement} /></p></Card>
          {c.figure && <ChallengeFigure figure={c.figure} ariaLabel={t('challengeNumber', { number: c.number })} />}
        </div>

        <div className="space-y-4">
          <Card title={t('teacher.answer')} tone="bg-emerald-50 ring-emerald-200">
            <p className="font-space text-xl font-black text-emerald-900" dir="ltr" data-teacher-answer>{answerText(c.answer)}</p>
          </Card>
          <Card title={t('teacher.test')}>
            <p className="mb-2 font-inter text-xs text-slate-500">{t('teacher.testHint')}</p>
            <TryAnswer id={c.id} tuple={tuple.index} kind="answer" index={0} format={c.answer} />
          </Card>
          {c.mistakes.length > 0 && (
            <Card title={t('teacher.mistakes')}>
              <ul className="space-y-2">
                {c.mistakes.map((m, i) => (
                  <li key={i} className="rounded-2xl bg-amber-50 px-4 py-2.5 ring-1 ring-amber-200">
                    <p className="font-inter text-sm font-bold text-amber-900">{m.value !== null ? <bdi dir="ltr">{prettyMath(m.value)}</bdi> : <MathRun text={t('teacher.mistakeRange', { lo: m.outside[0], hi: m.outside[1] })} />}</p>
                    <p className="mt-0.5 font-inter text-sm leading-7 text-slate-800"><MathRun text={m.reply} /></p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <Card title={t('teacher.keys')}>
            <ol className="space-y-2">
              {c.keys.map((k, i) => (
                <li key={i} className="space-y-1.5 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200"><PhaseChip phase={k.phase} /><p className="font-inter text-sm leading-7 text-slate-800"><MathRun text={k.text} /></p></li>
              ))}
            </ol>
          </Card>
        </div>
      </div>

      <section aria-labelledby="tl-t-replay" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="tl-t-replay" className="font-space text-lg font-black text-slate-900">{t('teacher.replay')}</h2>
          <button type="button" onClick={() => setReplayOpen((v) => !v)} aria-expanded={replayOpen} data-teacher-replay-toggle
            className="rounded-xl bg-white px-4 py-2 font-inter text-sm font-bold text-teal-800 ring-1 ring-teal-300 hover:bg-teal-50">
            {replayOpen ? t('teacher.replayHide') : t('teacher.replayShow')}
          </button>
        </div>
        {replayOpen && <ReplayPlayer steps={c.replay} figure={c.figure} />}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {c.keyMoves.length > 0 && (
          <Card title={t('teacher.keyMoves')} tone="bg-emerald-50 ring-emerald-200">
            <ol className="list-decimal space-y-1.5 ps-5 font-inter text-sm leading-7 text-slate-800">{c.keyMoves.map((m, i) => <li key={i}><MathRun text={m} /></li>)}</ol>
          </Card>
        )}
        {c.move && (
          <Card title={t('teacher.move')} tone="bg-amber-50 ring-amber-200">
            <p className="flex items-center gap-2 font-space text-base font-black text-slate-900"><Wrench size={18} className="text-amber-700" aria-hidden="true" /><MathRun text={c.move.title} /></p>
          </Card>
        )}
      </div>

      {c.parts.map((p) => (
        <Card key={p.index} title={`${t('teacher.parts')} ${p.index + 1}`}>
          <p className="font-inter text-base leading-8 text-slate-800"><MathRun text={p.prompt} /></p>
          <p className="mt-2 font-inter text-sm text-slate-500">{t('teacher.answer')}: <bdi dir="ltr" className="font-space text-base font-black text-emerald-800">{answerText(p.answer)}</bdi></p>
          <div className="mt-3"><TryAnswer id={c.id} tuple={tuple.index} kind="part" index={p.index} format={p.answer} /></div>
        </Card>
      ))}
      {c.ceiling && (
        <Card title={t('teacher.ceiling')}>
          <p className="font-inter text-base leading-8 text-slate-800"><MathRun text={c.ceiling.statement} /></p>
          <p className="mt-2 font-inter text-sm text-slate-500">{t('teacher.answer')}: <bdi dir="ltr" className="font-space text-base font-black text-emerald-800">{answerText(c.ceiling.answer)}</bdi></p>
          <div className="mt-3"><TryAnswer id={c.id} tuple={tuple.index} kind="ceiling" index={0} format={c.ceiling.answer} /></div>
        </Card>
      )}
      {c.twin && (
        <Link to={`/enseignant/tafkir/${c.twin.id}`} className="inline-flex items-center gap-2 font-inter text-sm font-bold text-teal-800 hover:underline">
          {t('teacher.twin')}: {t('challengeNumber', { number: c.twin.number })} <ChevronLeft size={16} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
