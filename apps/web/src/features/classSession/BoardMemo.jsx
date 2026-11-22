/**
 * « la fiche du professeur » of a lesson that has its board — the WRITTEN memo (`lessonMemos.js`), on its own page (owner,
 * 2026-11-18: « the content must be updated », « the UI/UX also, specially the top », « show me your limit »;
 * CLASS_SESSION.md §2quater). What a good lesson plan gives a teacher, one part at a time:
 *   before   the hour on ONE page · the goal and what success looks like · several opening situations, each drawn;
 *   during   the hour as « la séance en classe » runs it · what students will likely say, with the question for each · what goes
 *            on the board and in what order;
 *   after    what is written · a three-question exit ticket · support and extension;
 * His own notes are not here: they are in « le dossier de la leçon », one tap away in the top bar.
 * The top bar is one calm line: where he is, and the three things he does from here (the class session, his lesson
 * file, print). Same palette as his card: white, dark ink, one dark tone for what is pressed.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Clock, Eye, HelpCircle, MessageCircle, Printer, TriangleAlert } from 'lucide-react';
import { ArrowForward } from '../../components/common/DirectionalIcons';
import { getUnitOfLesson } from '@smarter-academy/core';
import MathText from '../../lessons/common/components/MathText';
import '../teacher/lessonMemo/memo.css';
import { MEMO_PARTS, partKeys, openingFacts } from './lessonMemos';
import { classSessionPath } from './boardLessons';
import MemoFigure from './MemoFigures';
import { LessonToolPage } from './LessonToolsBar';

const L = {
  kicker: 'Fiche du professeur',
  back: 'La leçon',
  session: 'Séance en classe',
  file: 'Dossier de la leçon',
  print: 'Imprimer',
  all: 'Toute la fiche',
  prev: 'Précédent',
  next: 'Suivant',
  min: (n) => `${n} min`,
  total: (n) => `${n} min`,
  goal: 'L’objectif',
  idea: 'L’idée en une phrase',
  trap: 'Le piège',
  hour: 'La séance',
  three: 'Trois questions à ne pas oublier',
  can: 'L’élève est capable de',
  see: 'Ce que je vois ou j’entends',
  stands: 'Sur quoi repose la leçon',
  onBoard: 'Situation de la « séance en classe »',
  ask: 'La question',
  why: 'Pourquoi celle-ci ?',
  expect: 'Ce qui va se passer',
  choose: 'Choisissez-en une selon votre classe : l’idée est la même, le contexte change.',
  teacher: 'Le professeur',
  klass: 'La classe',
  watch: 'Je suis attentif à',
  open: 'Ouvrir',
  right: 'Réponse attendue',
  miss: 'Conception erronée attendue',
  assess: 'Pour savoir où il en est',
  advance: 'Pour le faire avancer',
  order: 'L’ordre',
  connect: 'Les liens',
  written: 'À écrire dans le cahier',
  exit: 'Trois questions en fin de séance, sur une petite feuille',
  show: 'Montrer les réponses',
  hide: 'Cacher les réponses',
  support: 'Soutien',
  extend: 'Approfondissement',
  nextLesson: 'Après la séance',
  chapter: 'Chapitre',
  lesson: 'Leçon',
  klassBlank: 'Classe : ………………',
  dateBlank: 'Date : ………………',
};
const Card = ({ title, icon: Icon, children, tone = '' }) => (
  <section className={`rounded-2xl border border-slate-200 bg-white p-4 ${tone}`}>
    {title && (
      <h3 className="mb-2 flex items-center gap-2 text-sm font-extrabold text-slate-500">
        {Icon && <Icon size={16} aria-hidden="true" />}
        {title}
      </h3>
    )}
    {children}
  </section>
);
const T = ({ children, className = '' }) => (
  <span className={className}>
    <MathText>{children}</MathText>
  </span>
);
const Bullets = ({ items }) => (
  <ul className="space-y-1.5">
    {items.map((x) => (
      <li key={x} className="flex gap-2 text-[15px] font-semibold leading-7 text-slate-800">
        <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
        <T>{x}</T>
      </li>
    ))}
  </ul>
);

export default function BoardMemo({ lessonId, memo }) {
  const keys = partKeys();
  const store = `smarter_memo_part_${lessonId}`;
  const [view, setViewRaw] = useState(() => {
    try {
      const v = sessionStorage.getItem(store);
      return v === 'all' || keys.includes(v) ? v : 'glance';
    } catch {
      return 'glance';
    }
  });
  const [answers, setAnswers] = useState(false);
  // on a phone the parts are one line that slides: the part in use is brought into sight
  useEffect(() => {
    document.querySelector('[data-memo-rail] .is-on')?.scrollIntoView?.({ inline: 'center', block: 'nearest' });
  }, [view]);
  const go = (k) => {
    if (!k) return;
    setViewRaw(k);
    try {
      sessionStorage.setItem(store, k);
    } catch {
      /* the memo opens on its first part */
    }
    window.scrollTo({ top: 0 });
  };
  useEffect(() => {
    const read = () => {
      const h = window.location.hash.replace('#memo-', '');
      if (window.location.hash.startsWith('#memo-') && (h === 'all' || keys.includes(h))) setViewRaw(h);
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const all = view === 'all';
  const at = keys.indexOf(view);
  const label = (k) => MEMO_PARTS.flatMap((g) => g.keys).find(([x]) => x === k)?.[1] ?? '';
  const pane = (k) => ({ hidden: !all && view !== k, 'data-memo-pane': k });
  const g = memo.glance;
  const unit = getUnitOfLesson(lessonId);
  const total = g.minutes.reduce((s, m) => s + m.min, 0);
  const Head = ({ k, lead }) => (
    <header className="mb-3">
      <h2 className="text-2xl font-black text-slate-900">{label(k)}</h2>
      {lead && <p className="mt-1 text-sm font-semibold text-slate-500">{lead}</p>}
    </header>
  );
  return (
    <LessonToolPage lessonId={lessonId} active="memo">
      <div className="sa-memo" data-lesson-memo={lessonId} data-board-memo>
        {/* the top: the header common to every tool of the lesson; printing is this tool's own action */}

        {/* on paper the tabs are gone: the memo carries its own title */}
        {/* the printed header: plain, as a French teacher's sheet — the class and the date are written by hand */}
        <h1 className="sa-memo-printtitle" data-memo-printtitle>
          {L.kicker} — {unit ? `${L.chapter}\u00a0: ${unit.title} · ` : ''}
          {L.lesson} : <MathText>{memo.title}</MathText> · {L.total(total)}
          <small className="sa-memo-printtitle__blanks">
            {L.klassBlank} · {L.dateBlank}
          </small>
        </h1>
        <div className="sa-memo-work" data-memo-view={view}>
          <nav className="sa-memo-rail sa-memo-no-print" data-memo-rail>
            {MEMO_PARTS.map((grp) => (
              <div key={grp.id}>
                <p>{grp.label}</p>
                {grp.keys.map(([k, name]) => (
                  <button
                    key={k}
                    type="button"
                    className={view === k ? 'is-on' : ''}
                    onClick={() => go(k)}
                    aria-current={view === k ? 'page' : undefined}
                    data-memo-go={k}
                  >
                    {name}
                  </button>
                ))}
              </div>
            ))}
            <button
              type="button"
              className={`sa-memo-rail__all ${all ? 'is-on' : ''}`}
              onClick={() => go('all')}
              data-memo-go="all"
            >
              {L.all}
            </button>
            {/* this tool's own actions live in its page, never in the common header */}
            <button type="button" onClick={() => window.print()} data-memo-print>
              <Printer size={16} aria-hidden="true" /> {L.print} · {L.total(total)}
            </button>
          </nav>
          <div className="sa-memo-stage space-y-5">
            {/* ── the hour on ONE page ── */}
            <div {...pane('glance')}>
              <Head k="glance" />
              <div className="grid gap-3 lg:grid-cols-3">
                <Card title={L.goal} icon={Check}>
                  <p className="text-[17px] font-extrabold leading-8 text-slate-900">{g.goal}</p>
                </Card>
                <Card title={L.idea} icon={MessageCircle}>
                  <p className="text-[17px] font-extrabold leading-8 text-slate-900">{g.idea}</p>
                </Card>
                <Card title={L.trap} icon={TriangleAlert} tone="!border-amber-300 !bg-amber-50">
                  <p className="text-[17px] font-extrabold leading-8 text-amber-900">{g.trap}</p>
                </Card>
              </div>
              <div className="mt-3 grid gap-3 lg:grid-cols-[1.2fr_1fr]">
                <Card title={`${L.hour} · ${L.total(total)}`} icon={Clock}>
                  <ol className="flex gap-1.5" data-memo-hour>
                    {g.minutes.map((m, k) => (
                      <li key={m.moment} style={{ flexGrow: m.min }} className="min-w-0">
                        <Link
                          to={classSessionPath(lessonId, m.moment)}
                          className="block rounded-xl border border-slate-200 bg-slate-50 p-2 text-center hover:border-slate-900"
                          data-memo-moment={m.moment}
                        >
                          <b className="mx-auto grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-xs font-black text-white">
                            {k + 1}
                          </b>
                          <span className="mt-1 block truncate text-[13px] font-extrabold text-slate-900">
                            {m.label}
                          </span>
                          <span className="block text-xs font-bold text-slate-500">{L.min(m.min)}</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </Card>
                <Card title={L.three} icon={HelpCircle}>
                  <ol className="space-y-1.5">
                    {g.three.map((q, k) => (
                      <li key={q} className="flex gap-2 text-[15px] font-bold leading-7 text-slate-800">
                        <b className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-black">
                          {k + 1}
                        </b>
                        <T>{q}</T>
                      </li>
                    ))}
                  </ol>
                </Card>
              </div>
            </div>

            {/* ── the goal and what success looks like ── */}
            <div {...pane('criteria')}>
              <Head k="criteria" lead={g.goal} />
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="grid grid-cols-2 bg-slate-50 px-4 py-2 text-xs font-extrabold text-slate-500">
                  <span>{L.can}</span>
                  <span>{L.see}</span>
                </div>
                {memo.criteria.map((c, k) => (
                  <div
                    key={c.can}
                    className="grid grid-cols-2 gap-3 border-t border-slate-200 px-4 py-3"
                    data-memo-criterion={k}
                  >
                    <p className="flex gap-2 text-[15px] font-extrabold leading-7 text-slate-900">
                      <b className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-900 text-xs text-white">
                        {k + 1}
                      </b>
                      {c.can}
                    </p>
                    <p className="text-[15px] font-semibold leading-7 text-slate-700">
                      <T>{c.see}</T>
                    </p>
                  </div>
                ))}
              </div>
              <Card title={L.stands} tone="mt-3">
                <p className="text-[15px] font-semibold leading-7 text-slate-800">{memo.stands}</p>
              </Card>
            </div>

            {/* ── several opening situations, each drawn from its own numbers ── */}
            <div {...pane('openings')}>
              <Head k="openings" lead={L.choose} />
              <div className="grid gap-3 lg:grid-cols-2">
                {memo.openings.map((o) => {
                  const f = openingFacts(o);
                  return (
                    <article
                      key={o.id}
                      className={`flex flex-col gap-2 rounded-2xl border bg-white p-4 ${o.board ? 'border-slate-900' : 'border-slate-200'}`}
                      data-memo-opening={o.id}
                      data-memo-opening-left={f.first.r}
                    >
                      <header className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black text-slate-900">{o.title}</h3>
                        {o.board && (
                          <Link
                            to={classSessionPath(lessonId, 'lesson')}
                            className="rounded-full bg-slate-900 px-3 py-0.5 text-xs font-extrabold text-white"
                            data-memo-opening-board
                          >
                            {L.onBoard}
                          </Link>
                        )}
                      </header>
                      <div className="rounded-xl bg-slate-50 p-2">
                        <MemoFigure opening={o} />
                      </div>
                      <p className="text-[15px] font-semibold leading-7 text-slate-800">{o.story}</p>
                      <p className="rounded-xl bg-slate-900 px-3 py-2 text-[15px] font-extrabold leading-7 text-white">
                        <span className="text-slate-300">{L.ask} : </span>
                        {o.ask}
                      </p>
                      <p className="text-[13px] font-semibold leading-6 text-slate-600">
                        <b className="text-slate-900">{L.why}</b> {o.why}
                      </p>
                      <p className="text-[13px] font-semibold leading-6 text-slate-600">
                        <b className="text-slate-900">{L.expect}</b> {o.expect}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* ── the hour as the class session runs it ── */}
            <div {...pane('phases')}>
              <Head k="phases" />
              <ol className="space-y-3">
                {memo.phases.map((p, k) => (
                  <li
                    key={p.moment}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                    data-memo-phase={p.moment}
                  >
                    <header className="flex flex-wrap items-center gap-2">
                      <b className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-sm font-black text-white">
                        {k + 1}
                      </b>
                      <h3 className="text-lg font-black text-slate-900">{p.name}</h3>
                      <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-extrabold text-slate-600">
                        {L.min(p.min)}
                      </span>
                      <span className="text-sm font-bold text-slate-500">{p.aim}</span>
                      <Link
                        to={classSessionPath(lessonId, p.moment)}
                        className="ms-auto inline-flex min-h-[36px] items-center gap-1 rounded-xl border border-slate-200 px-3 text-sm font-extrabold text-slate-800 hover:border-slate-900"
                      >
                        {L.open} <ArrowForward size={15} aria-hidden="true" />
                      </Link>
                    </header>
                    <div className="mt-2 grid gap-2 md:grid-cols-3">
                      {[
                        [L.teacher, p.teacher, ''],
                        [L.klass, p.class, ''],
                        [L.watch, p.watch, 'bg-amber-50'],
                      ].map(([t, v, tone]) => (
                        <p
                          key={t}
                          className={`rounded-xl p-2.5 text-[14px] font-semibold leading-6 text-slate-800 ${tone || 'bg-slate-50'}`}
                        >
                          <b className="mb-0.5 block text-xs font-extrabold text-slate-500">{t}</b>
                          {v}
                        </p>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* ── what students will likely say, and the question for each ── */}
            <div {...pane('anticipated')}>
              <Head k="anticipated" />
              <ul className="space-y-2.5">
                {memo.anticipated.map((a) => (
                  <li
                    key={a.says}
                    className={`rounded-2xl border bg-white p-3.5 ${a.kind === 'miss' ? 'border-amber-300' : 'border-emerald-300'}`}
                    data-memo-anticipated={a.kind}
                  >
                    <p className="flex flex-wrap items-center gap-2 text-[16px] font-extrabold leading-7 text-slate-900">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${a.kind === 'miss' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}
                      >
                        {a.kind === 'miss' ? L.miss : L.right}
                      </span>
                      <T>{a.says}</T>
                    </p>
                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      {[
                        [L.assess, a.assess, Eye],
                        [L.advance, a.advance, ArrowForward],
                      ].map(([t, v, Icon]) => (
                        <p
                          key={t}
                          className="rounded-xl bg-slate-50 p-2.5 text-[14px] font-bold leading-6 text-slate-800"
                        >
                          <b className="mb-0.5 flex items-center gap-1 text-xs font-extrabold text-slate-500">
                            <Icon size={13} aria-hidden="true" /> {t}
                          </b>
                          <T>{v}</T>
                        </p>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── what goes on the board, in what order ── */}
            <div {...pane('sequence')}>
              <Head k="sequence" />
              <Card title={L.order}>
                <ol className="space-y-1.5">
                  {memo.sequence.map((s, k) => (
                    <li key={s} className="flex gap-2 text-[15px] font-bold leading-7 text-slate-800">
                      <b className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-black text-white">
                        {k + 1}
                      </b>
                      {s}
                    </li>
                  ))}
                </ol>
              </Card>
              <Card title={L.connect} tone="mt-3">
                <p className="text-[15px] font-bold leading-7 text-slate-800">
                  <T>{memo.connect}</T>
                </p>
              </Card>
            </div>

            {/* ── after the hour ── */}
            <div {...pane('written')}>
              <Head k="written" />
              <Card title={L.written}>
                <ol className="space-y-2">
                  {memo.written.map((w, k) => (
                    <li key={w} className="flex gap-2 text-[16px] font-bold leading-8 text-slate-900">
                      <b className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-black">
                        {k + 1}
                      </b>
                      <T>{w}</T>
                    </li>
                  ))}
                </ol>
              </Card>
            </div>
            <div {...pane('exit')}>
              <Head k="exit" lead={L.exit} />
              <ol className="space-y-2">
                {memo.exit.map((e, k) => (
                  <li key={e.q} className="rounded-2xl border border-slate-200 bg-white p-3.5" data-memo-exit={k}>
                    <p className="flex gap-2 text-[16px] font-extrabold leading-7 text-slate-900">
                      <b className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-900 text-xs text-white">
                        {k + 1}
                      </b>
                      <T>{e.q}</T>
                    </p>
                    {(answers || all) && (
                      <p
                        className="mt-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-[15px] font-bold leading-7 text-emerald-900"
                        data-memo-exit-answer
                      >
                        <T>{e.a}</T>
                      </p>
                    )}
                  </li>
                ))}
              </ol>
              <button
                type="button"
                className="sa-memo-no-print mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-800 hover:border-slate-900"
                onClick={() => setAnswers(!answers)}
                data-memo-exit-show
              >
                <Eye size={16} aria-hidden="true" /> {answers ? L.hide : L.show}
              </button>
            </div>
            <div {...pane('tiers')}>
              <Head k="tiers" />
              <div className="grid gap-3 md:grid-cols-2">
                <Card title={L.support}>
                  <Bullets items={memo.support} />
                </Card>
                <Card title={L.extend}>
                  <Bullets items={memo.extend} />
                </Card>
              </div>
              <Card title={L.nextLesson} tone="mt-3">
                <p className="text-[15px] font-bold leading-7 text-slate-800">{memo.next}</p>
              </Card>
            </div>

            {!all && (
              <div className="sa-memo-step sa-memo-no-print">
                <button type="button" onClick={() => go(keys[at - 1])} disabled={at <= 0} data-memo-prev>
                  {L.prev}
                  {at > 0 && <i>{`\u00a0: ${label(keys[at - 1])}`}</i>}
                </button>
                <span>
                  {at + 1}
                  {' / '}
                  {keys.length}
                </span>
                <button
                  type="button"
                  className="is-main"
                  onClick={() => go(keys[at + 1])}
                  disabled={at < 0 || at >= keys.length - 1}
                  data-memo-next
                >
                  {L.next}
                  {at < keys.length - 1 && <i>{`\u00a0: ${label(keys[at + 1])}`}</i>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </LessonToolPage>
  );
}
