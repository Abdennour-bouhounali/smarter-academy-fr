/**
 * « حصّة القسم » — the RULES REVISED before the new lesson (owner, 2026-11-18; CLASS_SESSION.md §5bis). After the start
 * test, the rules the lesson will USE come back one per screen, in very large text. The TEACHER decides who reads: he
 * taps a desk of his class (the platform proposes nobody), or he reads it himself. The example stays hidden until he asks
 * for it, so that the class can try to give one first. Quick: no question is graded, nothing is saved.
 */
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpenCheck, Lightbulb, UserRound, Users, X } from 'lucide-react';
import { getAllGrades } from '@smarter-academy/core';
import MathText from '../../lessons/common/components/MathText';
import { ClassWindow, Speaker, BoardTools, BoardLayers, useBoardTools, BL } from './board';
import { callName, teamsOf, teamOfStudent } from './session';

const L = {
  title: 'مراجعة القواعد',
  sub: 'قبل الدرس الجديد: القواعد التي سنحتاجها.',
  of: (i, n) => `القاعدة ${i} من ${n}`,
  from: 'من درس',
  score: 'في اختبار البداية',
  example: 'مثال',
  showExample: 'أظهر المثال',
  pick: 'أختار قارئًا',
  me: 'أقرأها أنا',
  reads: 'يقرأ',
  who: 'من يقرأ القاعدة؟',
  prev: 'السابقة',
  next: 'القاعدة التالية',
  lesson: 'نبدأ الدرس الجديد',
  exit: 'خروج',
  core: 'أساسية للدرس',
  pickTitle: 'من يقرأ القاعدة؟ اضغط طاولته.',
};
/** A grade's name as the catalogue writes it — never a local table. */
const GRADE_NAMES = Object.fromEntries(getAllGrades().map((g) => [g.id, g.name]));

export default function RulesReview({ cards, students, seating, readers, onReader, onLesson, onExit }) {
  const [i, setI] = useState(0);
  const [reader, setReader] = useState(null);
  const [shown, setShown] = useState(false);
  const [classOpen, setClassOpen] = useState(false);
  const tools = useBoardTools();
  const card = cards[i];
  const byId = Object.fromEntries(students.map((s) => [s.id, s]));
  const last = i + 1 >= cards.length;
  const st = reader && reader !== 'teacher' ? byId[reader] : null;
  const team = st ? teamOfStudent(teamsOf(seating, students), st.id) : null;
  useEffect(() => {
    setReader(null);
    setShown(false);
  }, [i]);
  const go = (d) => {
    if (d > 0 && last) {
      onLesson();
      return;
    }
    setI(Math.max(0, i + d));
  };
  useEffect(() => {
    const onKey = (e) => {
      if (classOpen) {
        if (e.key === 'Escape') setClassOpen(false);
        return;
      }
      if (tools.busy) return;
      if (e.key === 'ArrowLeft' || e.key === 'PageDown') {
        e.preventDefault();
        go(1);
      }
      if (e.key === 'ArrowRight' || e.key === 'PageUp') {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  useEffect(() => {
    if (import.meta.env.DEV) window.__classRevise = { i, card, reader, shown, n: cards.length };
  });
  const tap = (id) => {
    setReader(id);
    onReader(id);
    setClassOpen(false);
  };
  return (
    <div className="cs-lesson cs-lesson--revise" data-cs-revise-card={card.id} data-cs-revise-index={i}>
      <header className="cs-lesson__top">
        <div className="cs-lesson__brand">
          <BookOpenCheck size={26} />
          <div>
            <strong>{L.title}</strong>
            <small>{L.sub}</small>
          </div>
        </div>
        <span className="cs-dots cs-dots--rail" dir="rtl" aria-label={L.of(i + 1, cards.length)}>
          {cards.map((c, k) => (
            <button
              key={c.id}
              type="button"
              className={k === i ? 'is-now' : k < i ? 'is-ok' : ''}
              onClick={() => setI(k)}
              aria-label={c.title}
              data-cs-revise-dot={k}
            />
          ))}
        </span>
        <BoardTools tools={tools} onClass={() => setClassOpen(true)} />
        <button type="button" className="cs-icon" onClick={onExit} aria-label={L.exit} data-cs-revise-exit>
          <X size={22} />
        </button>
      </header>

      <Speaker
        slim
        name={reader === 'teacher' ? BL.teacher : st ? callName(st) : null}
        team={team}
        label={L.reads}
        wait={L.who}
        onClear={() => setReader(null)}
      />

      <main className="cs-rule" data-cs-rule={card.id}>
        <div className="cs-rule__meta">
          <span className="cs-chip cs-chip--family">
            <i>{card.icon}</i> {card.family}
          </span>
          <span className="cs-chip">
            {L.from}: {card.lesson} · {GRADE_NAMES[card.grade] ?? ''}
          </span>
          {card.weight === 'core' && <span className="cs-chip cs-chip--core">{L.core}</span>}
          {card.score && (
            <span className="cs-chip cs-chip--score" data-cs-rule-score={`${card.score.right}/${card.score.total}`}>
              {L.score}:{' '}
              <b dir="ltr">
                {card.score.right}
                {' / '}
                {card.score.total}
              </b>
            </span>
          )}
          <span className="cs-rule__count">{L.of(i + 1, cards.length)}</span>
        </div>
        <h2>{card.title}</h2>
        <p className="cs-rule__text">
          <MathText>{card.text}</MathText>
        </p>
        {shown ? (
          <p className="cs-rule__example" data-cs-rule-example>
            <b>
              <Lightbulb size={24} /> {L.example}
            </b>
            <span>
              <MathText>{card.example}</MathText>
            </span>
          </p>
        ) : (
          <button type="button" className="cs-btn cs-rule__show" onClick={() => setShown(true)} data-cs-rule-show>
            <Lightbulb size={20} /> {L.showExample}
          </button>
        )}
      </main>

      <footer className="cs-lesson__foot">
        <button type="button" className="cs-btn" onClick={() => go(-1)} disabled={i === 0} data-cs-revise-prev>
          <ArrowRight size={18} /> {L.prev}
        </button>
        <span className="cs-lesson__mid">
          <button type="button" className="cs-btn cs-btn--big" onClick={() => setClassOpen(true)} data-cs-pick-reader>
            <Users size={20} /> {L.pick}
          </button>
          <button
            type="button"
            className={`cs-btn cs-btn--big ${reader === 'teacher' ? 'is-on' : ''}`}
            onClick={() => setReader('teacher')}
            data-cs-read-myself
          >
            <UserRound size={20} /> {L.me}
          </button>
        </span>
        <button
          type="button"
          className="cs-btn cs-btn--main cs-btn--big"
          onClick={() => go(1)}
          data-cs-revise-next={last ? 'lesson' : 'next'}
        >
          {last ? L.lesson : L.next} <ArrowLeft size={20} />
        </button>
      </footer>
      {classOpen && (
        <ClassWindow
          students={students}
          seating={seating}
          current={st?.id ?? null}
          spoken={readers}
          onTap={tap}
          onClose={() => setClassOpen(false)}
          title={L.pickTitle}
        />
      )}
      <BoardLayers tools={tools} />
    </div>
  );
}
