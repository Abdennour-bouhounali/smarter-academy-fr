/**
 * « مدرّب الامتحان » — the screens of the exam coach of the exercise bank (logic: examCoach.js; pilot lessons only).
 *   useExamCoach  the state of a sheet: is the coach on, which mode, has the student entered the hall;
 *   ExamHall      the door of the exam: phone away, paper and pen out, silence — and the choice of the mode;
 *   CoachStrip    the reminder that stays above the answer: exam mode, no music, « solve on paper first », the mode (changeable);
 *   CoachAfter    what follows an answer: the paper notebook after a mistake, then GUIDE (never the answer) or EXPLAIN (the
 *                 solution told step by step: what is asked, which rule, each line, the trap, the exam tip).
 */
import { useEffect, useMemo, useState } from 'react';
import { PenLine, VolumeX, Compass, BookOpenCheck, NotebookPen, Smartphone, Clock, ArrowLeft, Check, AlertTriangle, Target } from 'lucide-react';
import RichText from '../RichText';
import { scopedStorage as storage } from '../../../utils/storage';
import { isCoachLesson, loadRule, explainSteps, guideSteps, notebookEntry, primaryPoint, modeKey } from './examCoach';

const L = {
  hall: 'قاعة الامتحان', hallSub: 'هذه ورقة امتحان حقيقيّة. استعدّ كما تستعدّ يوم الامتحان.',
  rules: [[Smartphone, 'ضع هاتفك بعيدًا عنك'], [PenLine, 'ضع أمامك ورقة وقلمًا: كلّ حساب يُكتب على الورقة أوّلًا'], [VolumeX, 'لا موسيقى ولا مؤثّرات: هدوء القسم'], [Clock, 'الوقت محسوب لكلّ سؤال: راقبه دون أن تتعجّل']],
  choose: 'إذا أخطأتَ، كيف تريد أن أساعدك؟', change: 'تستطيع تغيير اختيارك في أيّ وقت.',
  modes: {
    guide: { icon: Compass, name: 'أرشدني فقط', text: 'لا تُرني الجواب أبدًا. أعطني تلميحًا وذكّرني بالقاعدة، ثمّ أعيد المحاولة بنفسي.' },
    explain: { icon: BookOpenCheck, name: 'اشرح لي الحلّ', text: 'أرني الحلّ خطوة بخطوة: كيف نفكّر، وأيّ قاعدة نستعمل، وأين الفخّ.' },
  },
  ready: 'ورقتي وقلمي أمامي', start: 'أبدأ الامتحان',
  strip: 'وضع الامتحان', silent: 'بلا موسيقى', paperFirst: 'حلّ على ورقتك أوّلًا، ثمّ انقل جوابك.',
  notebook: 'خذ كرّاسك واكتب خطأك، حتّى لا تكرّره', notebookSub: 'انقل هذه الأسطر إلى «دفتر أخطائي» في كرّاسك:', own: 'اكتب بكلماتك: أين أخطأت؟',
  wrote: 'كتبتُه في كرّاسي', wroteDone: 'مكتوب في الكرّاس', 
  guideTitle: 'لن أريك الجواب: فكّر معي', guideMore: 'تلميح آخر', guideEnd: 'الآن أعد المحاولة على ورقتك، ثمّ اكتب جوابك من جديد.',
  explainTitle: 'شرح الحلّ خطوة بخطوة', explainOpen: 'أرني طريقة الحلّ', next: 'الخطوة التالية',
  kinds: { reread: 'أعد قراءة السؤال: ما المطلوب بالضبط؟', asked: 'أوّلًا: ما المطلوب؟', rule: 'القاعدة التي أستعملها', line: (n) => `أكتب على ورقتي — السطر ${n}`, result: 'الجواب', trap: 'انتبه إلى الفخّ', exam: 'في الامتحان', write: 'والآن دورك' },
  rewrite: 'أغلق الشرح وأعد كتابة الحلّ كاملًا في كرّاسك، دون أن تنظر.', rewrote: 'أعدتُ كتابته في كرّاسي',
};
const GREEN = 'bg-[#1f5c4c] text-white hover:bg-[#174a3d]';

/** The coach of ONE sheet. `on` only for an exam sheet of a pilot lesson. The hall is entered once per sheet session. */
export function useExamCoach(lessonCode, isExam) {
  const on = Boolean(isExam) && isCoachLesson(lessonCode);
  const hallKey = `sa_exam_hall:${typeof window !== 'undefined' ? window.location.pathname : ''}`;
  const [mode, setModeState] = useState(() => { try { const m = storage.getItem(modeKey); return m === 'guide' || m === 'explain' ? m : null; } catch { return null; } });
  const [entered, setEntered] = useState(() => { try { return sessionStorage.getItem(hallKey) === '1'; } catch { return false; } });
  const setMode = (m) => { setModeState(m); try { storage.setItem(modeKey, m); } catch { /* storage blocked */ } };
  const enter = () => { setEntered(true); try { sessionStorage.setItem(hallKey, '1'); } catch { /* storage blocked */ } };
  return { on, mode: mode ?? 'guide', chosen: mode !== null, setMode, entered, enter };
}

function ModeCards({ mode, chosen, setMode, small = false }) {
  return (
    <div className={`grid gap-3 ${small ? 'sm:grid-cols-2' : 'md:grid-cols-2'}`} data-coach-modes>
      {Object.entries(L.modes).map(([id, m]) => {
        const Icon = m.icon; const active = chosen && mode === id;
        return (
          <button key={id} type="button" onClick={() => setMode(id)} aria-pressed={active} data-coach-mode={id}
            className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-start transition ${active ? 'border-[#1f5c4c] bg-emerald-50 ring-4 ring-emerald-100' : 'border-slate-300 bg-white hover:border-slate-500'}`}>
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${active ? GREEN : 'bg-slate-100 text-slate-700'}`}><Icon className="h-6 w-6" aria-hidden="true" /></span>
            <span><strong className="block text-lg text-slate-900">{m.name}</strong><span className="text-sm leading-relaxed text-slate-600">{m.text}</span></span>
          </button>
        );
      })}
    </div>
  );
}

/** The door of the exam. It covers the sheet until the student has chosen his mode and put paper and pen in front of him. */
export function ExamHall({ coach, title }) {
  const [ready, setReady] = useState(false);
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center overflow-hidden bg-slate-900/80 p-4" dir="rtl" data-exam-hall>
      <div className="w-full max-w-3xl rounded-3xl border-4 border-double border-slate-800 bg-[#fffdf6] p-6 shadow-2xl sm:p-8">
        <p className="text-center text-sm font-bold text-[#1f5c4c]">{title}</p>
        <h2 className="mt-1 text-center font-serif text-3xl font-black text-slate-900">{L.hall}</h2>
        <p className="mt-1 text-center text-slate-600">{L.hallSub}</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {L.rules.map(([Icon, text]) => <li key={text} className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800"><Icon className="h-5 w-5 shrink-0 text-[#1f5c4c]" aria-hidden="true" />{text}</li>)}
        </ul>
        <h3 className="mt-5 text-lg font-extrabold text-slate-900">{L.choose}</h3>
        <div className="mt-2"><ModeCards mode={coach.mode} chosen={coach.chosen} setMode={coach.setMode} /></div>
        <p className="mt-1 text-xs text-slate-500">{L.change}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-base font-bold text-slate-800"><input type="checkbox" className="h-5 w-5 accent-[#1f5c4c]" checked={ready} onChange={(e) => setReady(e.target.checked)} data-hall-ready />{L.ready}</label>
          <button type="button" disabled={!ready || !coach.chosen} onClick={coach.enter} data-hall-start className={`rounded-xl px-7 py-3 text-lg font-extrabold shadow disabled:cursor-not-allowed disabled:opacity-40 ${GREEN}`}>{L.start}</button>
        </div>
      </div>
    </div>
  );
}

/** Above the answer zone, always: this is the exam, it is silent, the paper comes first — and the mode, one tap to change. */
export function CoachStrip({ coach }) {
  const [open, setOpen] = useState(false); const M = L.modes[coach.mode]; const Icon = M.icon;
  return (
    <div className="w-full basis-full space-y-2" data-coach-strip>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700">
        <span className="inline-flex items-center gap-1 text-[#1f5c4c]"><PenLine className="h-4 w-4" aria-hidden="true" />{L.strip}</span>
        <span className="inline-flex items-center gap-1"><VolumeX className="h-3.5 w-3.5" aria-hidden="true" />{L.silent}</span>
        <span className="font-semibold text-slate-600">{L.paperFirst}</span>
        <button type="button" onClick={() => setOpen((v) => !v)} className="ms-auto inline-flex items-center gap-1 rounded-full border border-slate-400 px-2.5 py-0.5 hover:bg-slate-100" data-coach-switch><Icon className="h-3.5 w-3.5" aria-hidden="true" />{M.name}</button>
      </div>
      {open && <ModeCards mode={coach.mode} chosen setMode={(m) => { coach.setMode(m); setOpen(false); }} small />}
    </div>
  );
}

function useRule(lessonCode, question) {
  const [rule, setRule] = useState(null); const code = primaryPoint(question);
  useEffect(() => { let alive = true; setRule(null); loadRule(lessonCode, code).then((r) => { if (alive) setRule(r); }).catch(() => {}); return () => { alive = false; }; }, [lessonCode, code]);
  return rule;
}

/** « دفتر أخطائي »: after a mistake, the student WRITES — on paper — what went wrong and what to remember. */
function Notebook({ question, rule, mode, why }) {
  const [done, setDone] = useState(false);
  const lines = notebookEntry(question, rule, mode, why);
  return (
    <section className="rounded-2xl border-2 border-dashed border-amber-600 bg-amber-50 p-4" data-coach-notebook>
      <h4 className="flex items-center gap-2 text-base font-extrabold text-amber-900"><NotebookPen className="h-5 w-5" aria-hidden="true" />{L.notebook}</h4>
      <p className="mt-0.5 text-sm text-amber-900/80">{L.notebookSub}</p>
      <div className="mt-2 rounded-lg bg-white px-4 py-2 font-serif text-[15px] leading-8 text-slate-800 shadow-inner" style={{ backgroundImage: 'repeating-linear-gradient(#fff 0 31px, #dbe4f3 31px 32px)' }}>
        {lines.map((l) => (
          <p key={l.label}><b className="text-[#1d3fae]">{l.label}:</b>{' '}
            {l.own ? <span className="text-slate-500">{l.text ? <><RichText>{l.text}</RichText> — </> : null}<i>{L.own}</i></span> : l.result ? <RichText>{/[؀-ۿ]/.test(l.text) ? l.text : `$${l.text}$`}</RichText> : <><RichText>{l.text}</RichText>{l.rule && <> <RichText>{`$${l.rule}$`}</RichText></>}</>}
          </p>
        ))}
      </div>
      <button type="button" onClick={() => setDone(true)} disabled={done} data-coach-wrote className={`mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-extrabold ${done ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-600 text-white hover:bg-amber-700'}`}>
        {done ? <><Check className="h-4 w-4" aria-hidden="true" />{L.wroteDone}</> : <><PenLine className="h-4 w-4" aria-hidden="true" />{L.wrote}</>}
      </button>
    </section>
  );
}

const STEP_TONE = { rule: 'border-indigo-300 bg-nav-accent-soft', trap: 'border-rose-300 bg-rose-50', exam: 'border-emerald-300 bg-emerald-50', result: 'border-slate-800 bg-white', write: 'border-amber-500 bg-amber-50' };
function Step({ step }) {
  const label = typeof L.kinds[step.kind] === 'function' ? L.kinds[step.kind](step.n) : L.kinds[step.kind];
  const Icon = step.kind === 'trap' ? AlertTriangle : step.kind === 'exam' ? Target : null;
  return (
    <li className={`rounded-xl border-2 px-4 py-2.5 ${STEP_TONE[step.kind] ?? 'border-slate-200 bg-white'}`} data-coach-step={step.kind}>
      <p className="flex items-center gap-1.5 text-xs font-extrabold text-slate-600">{Icon && <Icon className="h-4 w-4" aria-hidden="true" />}{label}</p>
      {step.kind === 'rule' && <><p className="font-bold text-slate-900">{step.title}</p><p className="py-1 text-center text-lg" dir="ltr"><RichText>{`$${step.rule}$`}</RichText></p><p className="text-sm text-slate-700">{step.hook}</p></>}
      {step.kind === 'result' && <p className="text-center text-lg font-bold"><RichText>{/[؀-ۿ]/.test(step.text) ? step.text : `$${step.text}$`}</RichText></p>}
      {step.kind === 'write' && <p className="font-semibold text-amber-900">{L.rewrite}</p>}
      {!['rule', 'result', 'write'].includes(step.kind) && <p className="text-[15px] leading-relaxed text-slate-800"><RichText>{step.text}</RichText></p>}
    </li>
  );
}

/** One step at a time: the student moves forward himself (« الخطوة التالية »), so each line is read, not skimmed. */
function Walk({ steps, title, icon: Icon, more, end, attr, onFirst }) {
  const [n, setN] = useState(1);
  useEffect(() => { onFirst?.(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <section className="rounded-2xl border-2 border-slate-300 bg-slate-50 p-4" {...{ [attr]: n }}>
      <h4 className="flex items-center gap-2 text-base font-extrabold text-slate-900"><Icon className="h-5 w-5 text-[#1f5c4c]" aria-hidden="true" />{title}</h4>
      <ol className="mt-2 space-y-2">{steps.slice(0, n).map((s, i) => <Step key={i} step={s} />)}</ol>
      {n < steps.length
        ? <button type="button" onClick={() => setN((v) => v + 1)} data-coach-next className={`mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-extrabold ${GREEN}`}>{more} <ArrowLeft className="h-4 w-4" aria-hidden="true" /></button>
        : end && <p className="mt-3 font-bold text-[#1f5c4c]">{end}</p>}
    </section>
  );
}

/**
 * After an answer on a coached sheet.
 * wrong:  the notebook, then GUIDE (three nudges, never the answer — the sheet's « أعد المحاولة » comes back) or EXPLAIN;
 * right:  nothing in guide mode; in explain mode the method can still be read on demand.
 * `onReveal` tells the sheet that the solution was shown (a retry would then prove nothing).
 */
export function CoachAfter({ coach, lessonCode, question, isCorrect, why, onReveal }) {
  const rule = useRule(lessonCode, question);
  const [open, setOpen] = useState(false);
  const explain = useMemo(() => explainSteps(question, rule), [question, rule]);
  const guide = useMemo(() => guideSteps(question, rule), [question, rule]);
  if (isCorrect) {
    if (coach.mode !== 'explain' || !question.solution?.lines?.length) return null;
    return open
      ? <Walk steps={explain} title={L.explainTitle} icon={BookOpenCheck} more={L.next} attr="data-coach-explain" />
      : <button type="button" onClick={() => setOpen(true)} data-coach-explain-open className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:border-slate-500"><BookOpenCheck className="h-4 w-4" aria-hidden="true" />{L.explainOpen}</button>;
  }
  return (
    <div className="space-y-3" data-coach-after={coach.mode}>
      <Notebook question={question} rule={rule} mode={coach.mode} why={why} />
      {coach.mode === 'guide'
        ? <Walk key="g" steps={guide} title={L.guideTitle} icon={Compass} more={L.guideMore} end={L.guideEnd} attr="data-coach-guide" />
        : <Walk key="e" steps={explain} title={L.explainTitle} icon={BookOpenCheck} more={L.next} attr="data-coach-explain" onFirst={onReveal} />}
    </div>
  );
}
