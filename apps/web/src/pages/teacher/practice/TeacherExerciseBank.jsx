/**
 * « La banque d’exercices de la leçon » — the practice space of the TEACHER (owner, 2026-11-18: « updated completely »; CLASS_SESSION.md
 * §5quater). The student's hub asks him to « start a level »; a teacher does three other things, and this page is built
 * for them:
 *   he READS    every exercise of a level on one page — the statement, the questions and, when he asks, the key;
 *   he SHOWS    one exercise on the board of his class (« Au tableau » opens it in « Séance en classe »);
 *   he PRINTS   a sheet for the class: he ticks exercises of any level, sees how much work it is, and prints it, with or
 *               without the key.
 * Nothing is tracked or recorded. Same calm palette as the teacher's card: white, dark ink, one dark tone for what is pressed.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown, Clock, Eye, EyeOff, ListChecks, Presentation, Printer, X } from 'lucide-react';
import { getLessonById } from '@smarter-academy/core';
import { exerciseIdsFor, loadExercise, levelCounts } from '../../../features/practice/practiceContent';
import ExerciseStatement from '../../../features/practice/ExerciseStatement';
import RichText from '../../../features/practice/RichText';
import MathText from '../../../lessons/common/components/MathText';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import {
  refOf,
  exerciseBoardPath,
  summaryOf,
  choicesOf,
  keyOf,
  sheetTotals,
  toggleRef,
  exercisesWord,
  questionsWord,
} from '../../../features/classSession/exerciseBank';
import { LessonToolPage } from '../../../features/classSession/LessonToolsBar';
import './teacherBank.css';

// The page's own sentences (interface text of this tool, kept beside it like the board's script).
const L = {
  title: 'La banque d’exercices de la leçon',
  back: 'La leçon',
  lead: 'Lisez les exercices avec leur corrigé, projetez-en un au tableau de votre classe ou composez une feuille à imprimer. Rien n’est enregistré.',
  levels: 'niveaux',
  level: (n) => `Niveau ${n}`,
  minutes: (n) => `${n} min`,
  showAll: 'Afficher les corrigés',
  hideAll: 'Masquer les corrigés',
  board: 'Au tableau',
  add: 'Ajouter à la feuille',
  added: 'Dans la feuille',
  answer: 'Réponse',
  loading: 'Chargement…',
  sheet: 'La feuille de la classe',
  sheetEmpty:
    'Choisissez des exercices de n’importe quel niveau pour composer une feuille à imprimer pour votre classe.',
  about: (m) => `environ ${m} min`,
  withKey: 'Avec le corrigé',
  print: 'Imprimer la feuille',
  clear: 'Vider la feuille',
  paper: {
    name: 'Nom et prénom :',
    klass: 'Classe :',
    date: 'Date :',
    exercise: (n) => `Exercice ${n}`,
    key: 'Corrigé',
  },
};

/** An exercise as it is read: the statement, the questions with their choices and — when asked — the key of each. */
export function ExerciseBody({ ex, withKey }) {
  return (
    <div className="tb-body">
      <ExerciseStatement {...ex.statement} />
      <ol className="tb-questions">
        {ex.questions.map((q, k) => {
          const key = keyOf(q);
          const ch = choicesOf(q);
          return (
            <li key={q.id}>
              {q.lead && (
                <p className="tb-lead">
                  <RichText>{q.lead}</RichText>
                </p>
              )}
              <div className="tb-q">
                <b>{k + 1}</b>
                <div>
                  <p>
                    <RichText>{q.statement}</RichText>
                  </p>
                  {ch.length > 0 && (
                    <p className="tb-choices">
                      {ch.map((c) => (
                        <span key={c.letter} className={withKey && c.right ? 'is-right' : ''}>
                          {c.letter}) <RichText>{c.content}</RichText>
                        </span>
                      ))}
                    </p>
                  )}
                  {withKey && (
                    <div className="tb-key" data-tb-key>
                      <p>
                        <strong>
                          {L.answer}
                          {key.answer ? '\u00a0: ' : ''}
                        </strong>
                        {key.answer && <RichText>{key.answer}</RichText>}
                      </p>
                      {key.lines.map((line) => (
                        <p key={line}>
                          <RichText>{line}</RichText>
                        </p>
                      ))}
                      {key.result && (
                        <p dir="ltr" className="tb-key__result">
                          <MathText>{`$${key.result}$`}</MathText>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function TeacherExerciseBank({ lessonCode }) {
  const { t } = useTranslation('student');
  const lesson = getLessonById(lessonCode);
  useDocumentMeta(`${L.title} — ${lesson?.title ?? ''}`);
  const counts = useMemo(() => levelCounts(lessonCode), [lessonCode]);
  const levels = useMemo(
    () =>
      Object.keys(counts)
        .map(Number)
        .sort((a, b) => a - b),
    [counts],
  );
  const [level, setLevel] = useState(levels[0] ?? 1);
  const [cache, setCache] = useState({});
  const [open, setOpen] = useState(null);
  const [keys, setKeys] = useState(false);
  const [sheet, setSheet] = useState([]);
  const [withKey, setWithKey] = useState(false);
  const ids = useMemo(() => exerciseIdsFor(lessonCode, level), [lessonCode, level]);
  useEffect(() => {
    let off = false;
    const missing = ids.filter((id) => !cache[refOf(level, id)]);
    if (missing.length)
      Promise.all(missing.map((id) => loadExercise(lessonCode, level, id).then((ex) => [refOf(level, id), ex]))).then(
        (pairs) => {
          if (!off) setCache((c) => ({ ...c, ...Object.fromEntries(pairs.filter(([, ex]) => ex)) }));
        },
      );
    return () => {
      off = true;
    };
  }, [lessonCode, level, ids]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (import.meta.env.DEV) window.__teacherBank = { level, open, sheet, loaded: Object.keys(cache).length };
  });

  const list = ids.map((id) => cache[refOf(level, id)]).filter(Boolean);
  const picked = sheet.map((ref) => cache[ref]).filter(Boolean);
  const totals = sheetTotals(picked);
  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  return (
    <LessonToolPage lessonId={lessonCode} active="bank">
      <div className="tb-page w-full space-y-5 text-start" data-teacher-bank={lessonCode}>
        <div className="tb-screen space-y-5">
          <header className="space-y-2">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-3xl font-black text-slate-900">{L.title}</h1>
                <p className="mt-1 max-w-2xl text-[15px] font-semibold leading-7 text-slate-600">{L.lead}</p>
              </div>
              <p
                className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-extrabold text-slate-700"
                data-tb-total={total}
              >
                {exercisesWord(total)} · {levels.length} {L.levels}
              </p>
            </div>
          </header>

          {/* the levels: a row of tabs, never « start » */}
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label={L.levels}>
            {levels.map((n) => (
              <button
                key={n}
                type="button"
                role="tab"
                aria-selected={level === n}
                onClick={() => {
                  setLevel(n);
                  setOpen(null);
                }}
                data-tb-level={n}
                className={`inline-flex min-h-[48px] items-center gap-2 rounded-2xl border px-4 text-sm font-extrabold transition-colors ${level === n ? 'border-nav-accent bg-nav-accent text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-nav-accent'}`}
              >
                <b
                  className={`grid h-6 w-6 place-items-center rounded-full text-xs ${level === n ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-700'}`}
                >
                  {n}
                </b>
                {t(`practice.levelNames.${n}`, { defaultValue: L.level(n) })}
                <span className={`text-xs font-bold ${level === n ? 'text-slate-300' : 'text-slate-400'}`}>
                  {counts[n]}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setKeys(!keys)}
              aria-pressed={keys}
              data-tb-keys
              className="ms-auto inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 hover:border-slate-900"
            >
              {keys ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}{' '}
              {keys ? L.hideAll : L.showAll}
            </button>
          </div>

          {/* the exercises of the level: a line each; a line opens on the whole exercise */}
          {list.length < ids.length && <p className="text-sm font-bold text-slate-500">{L.loading}</p>}
          <ol className="space-y-2.5" data-tb-list={list.length}>
            {list.map((ex, k) => {
              const s = summaryOf(ex);
              const ref = refOf(level, ex.id);
              const isOpen = open === ref;
              const inSheet = sheet.includes(ref);
              return (
                <li
                  key={ex.id}
                  className={`rounded-2xl border bg-white transition-colors ${isOpen ? 'border-slate-900' : 'border-slate-200'}`}
                  data-tb-exercise={ex.id}
                  data-tb-open={isOpen}
                >
                  <div className="flex flex-wrap items-center gap-3 p-3">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : ref)}
                      aria-expanded={isOpen}
                      data-tb-toggle
                      className="flex min-w-0 flex-1 items-center gap-3 text-start"
                    >
                      <b className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-sm font-black text-slate-700">
                        {k + 1}
                      </b>
                      <span className="min-w-0 flex-1">
                        <strong className="block truncate text-[15px] font-extrabold text-slate-900">
                          <MathText>{s.title}</MathText>
                        </strong>
                        <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-bold text-slate-500">
                          {s.badge && (
                            <span
                              className={`rounded-full px-2 py-0.5 ${s.official ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-600'}`}
                            >
                              {s.badge}
                            </span>
                          )}
                          <span>{questionsWord(s.questions)}</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock size={12} aria-hidden="true" /> {L.minutes(s.minutes)}
                          </span>
                        </span>
                      </span>
                      <ChevronDown
                        size={20}
                        className={`shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSheet(toggleRef(sheet, ref))}
                      aria-pressed={inSheet}
                      data-tb-add
                      className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border px-3 text-sm font-extrabold transition-colors ${inSheet ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-900'}`}
                    >
                      {inSheet ? <Check size={18} aria-hidden="true" /> : <ListChecks size={18} aria-hidden="true" />}{' '}
                      {inSheet ? L.added : L.add}
                    </button>
                    <Link
                      to={exerciseBoardPath(lessonCode, level, ex.id)}
                      data-tb-board
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-nav-accent px-4 text-sm font-extrabold text-white hover:bg-[#3350c4]"
                    >
                      <Presentation size={18} aria-hidden="true" /> {L.board}
                    </Link>
                  </div>
                  {isOpen && (
                    <div className="border-t border-slate-200 p-4" data-tb-body>
                      <ExerciseBody ex={ex} withKey={keys} />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>

          {/* the sheet of the class: always in sight, at the foot of the page */}
          <aside
            className="tb-tray sticky bottom-3 z-10 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur"
            data-tb-sheet={sheet.length}
          >
            {sheet.length === 0 ? (
              <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
                <ListChecks size={18} aria-hidden="true" /> <strong className="text-slate-900">{L.sheet}</strong>{' '}
                {L.sheetEmpty}
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <p
                  className="me-auto text-sm font-bold text-slate-600"
                  data-tb-totals={`${totals.exercises}/${totals.questions}/${totals.minutes}`}
                >
                  <strong className="text-base font-black text-slate-900">{L.sheet}</strong> ·{' '}
                  {exercisesWord(totals.exercises)} · {questionsWord(totals.questions)} · {L.about(totals.minutes)}
                </p>
                <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 text-sm font-extrabold text-slate-700">
                  <input
                    type="checkbox"
                    checked={withKey}
                    onChange={(e) => setWithKey(e.target.checked)}
                    className="h-5 w-5 accent-slate-900"
                    data-tb-with-key
                  />{' '}
                  {L.withKey}
                </label>
                <button
                  type="button"
                  onClick={() => setSheet([])}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-extrabold text-slate-700 hover:border-slate-900"
                  data-tb-clear
                >
                  <X size={16} aria-hidden="true" /> {L.clear}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-nav-accent px-5 text-sm font-extrabold text-white hover:bg-[#3350c4]"
                  data-tb-print
                >
                  <Printer size={18} aria-hidden="true" /> {L.print}
                </button>
              </div>
            )}
          </aside>
        </div>

        {/* what the printer gets: the sheet alone (teacherBank.css hides the rest of the page), then the key on its own page */}
        {picked.length > 0 && (
          <div className="tb-paper" data-tb-paper={picked.length}>
            <header>
              <h1>{lesson?.title}</h1>
              <p>
                <span>{L.paper.name} ………………………………</span>
                <span>{L.paper.klass} …………</span>
                <span>{L.paper.date} ……………</span>
              </p>
            </header>
            {picked.map((ex, k) => (
              <section key={ex.id}>
                <h2>{L.paper.exercise(k + 1)}</h2>
                <ExerciseBody ex={ex} withKey={false} />
              </section>
            ))}
            {withKey && (
              <div className="tb-paper__key" data-tb-paper-key>
                <h1>
                  {L.paper.key} — {lesson?.title}
                </h1>
                {picked.map((ex, k) => (
                  <section key={ex.id}>
                    <h2>{L.paper.exercise(k + 1)}</h2>
                    <ExerciseBody ex={ex} withKey />
                  </section>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </LessonToolPage>
  );
}
