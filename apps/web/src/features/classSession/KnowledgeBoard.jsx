/**
 * « la fiche de connaissances » ON THE BOARD — the lesson's knowledge card, presented to the class (owner, 2026-11-18;
 * CLASS_SESSION.md §5quinquies). The teacher's knowledge card, in the design of the class session, for a QUICK REVISION with
 * the whole class: one piece of knowledge per screen —
 *   its rule, large; the sentence that makes it stick;
 *   then, each only when the teacher asks: an example, the trap, what to do in the exam;
 * It is a DISPLAY: no class to choose, no student to name (owner: « it is just used for displaying in the class… keep
 * only the tools like pencil, pointer »).
 * And for the TEACHER, on every card: the earlier lessons this savoir-faire is connected with, each one tap away.
 * Same shell, same dock as every board screen. Nothing is graded, nothing is recorded.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Brain, GraduationCap, Lightbulb, Link2, X } from 'lucide-react';
import { ArrowBack, ArrowForward } from '../../components/common/DirectionalIcons';
import MathText from '../../lessons/common/components/MathText';
import { BoardTools, BoardLayers, useBoardTools } from './board';
import { Fit } from './ExerciseBoard';

const L = {
  title: 'Fiche de connaissances',
  sub: 'Une révision rapide avec toute la classe.',
  of: (i, n) => `Connaissance ${i} sur ${n}`,
  example: 'Exemple',
  trap: 'Attention',
  exam: 'Au brevet',
  prev: 'Précédente',
  next: 'Connaissance suivante',
  done: 'Révision terminée',
  pick: 'Choisir un lecteur',
  me: 'Je la lis moi-même',
  reads: 'Lecture par',
  who: 'Qui lit\u202f?',
  pickTitle: 'Qui lit\u202f? Cliquez sur sa table.',
  exit: 'Quitter',
  linked: 'Leçons précédentes liées',
  open: 'Ouvrir la leçon',
  soon: 'en préparation',
};
const MORE = [
  ['example', L.example, Lightbulb],
  ['trap', L.trap, AlertTriangle],
  ['exam', L.exam, GraduationCap],
];

export default function KnowledgeBoard({ cards, links, onExit, fullscreen = null }) {
  const tools = useBoardTools();
  const [i, setI] = useState(0);
  const [shown, setShown] = useState([]);
  const card = cards[i];
  const last = i + 1 >= cards.length;
  useEffect(() => {
    setShown([]);
  }, [i]);
  const go = (d) => {
    if (d > 0 && last) {
      onExit();
      return;
    }
    setI(Math.max(0, i + d));
  };
  useEffect(() => {
    const onKey = (e) => {
      if (tools.busy) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        go(1);
      }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  useEffect(() => {
    if (import.meta.env.DEV) window.__classCard = { i, id: card.id, shown, n: cards.length };
  });
  return (
    <div className="cs-lesson" data-cs-card={card.id} data-cs-card-index={i}>
      <header className="cs-lesson__top">
        <div className="cs-lesson__brand">
          <Brain size={26} />
          <div>
            <strong>{L.title}</strong>
            <small>{L.sub}</small>
          </div>
        </div>
        <span className="cs-dots cs-dots--rail" aria-label={L.of(i + 1, cards.length)}>
          {cards.map((c, k) => (
            <button
              key={c.id}
              type="button"
              className={k === i ? 'is-now' : k < i ? 'is-ok' : ''}
              onClick={() => setI(k)}
              aria-label={c.title}
              data-cs-card-dot={k}
            />
          ))}
        </span>
        <BoardTools tools={tools} fullscreen={fullscreen} />
        <button type="button" className="cs-icon" onClick={onExit} aria-label={L.exit} data-cs-card-exit>
          <X size={22} />
        </button>
      </header>

      <main className="cs-rule cs-kcard" data-cs-kcard={card.id}>
        {/* everything the teacher opens stays on the board: drawn smaller if needed, never cut */}
        <Fit watch={`${card.id}:${shown.join()}`}>
          <div className="cs-kcard__in">
            <div className="cs-rule__meta">
              <span className="cs-chip cs-chip--chapter">{L.of(i + 1, cards.length)}</span>
            </div>
            <h2>
              <MathText>{card.title}</MathText>
            </h2>
            <p className="cs-kcard__rule" dir="ltr">
              <MathText>{card.rule}</MathText>
            </p>
            <p className="cs-kcard__hook">{card.hook}</p>
            {/* an example, the trap, the exam: each comes only when the teacher asks — the class tries first */}
            <div className="cs-kcard__more">
              {MORE.filter(([k]) => card[k]).map(([k, label, Icon]) =>
                shown.includes(k) ? (
                  <p key={k} className={`cs-kcard__line is-${k}`} data-cs-card-line={k}>
                    <b>
                      <Icon size={22} /> {label}
                    </b>
                    <span dir={k === 'example' ? 'ltr' : undefined}>
                      <MathText>{card[k]}</MathText>
                    </span>
                  </p>
                ) : (
                  <button
                    key={k}
                    type="button"
                    className="cs-btn"
                    onClick={() => setShown([...shown, k])}
                    data-cs-card-show={k}
                  >
                    <Icon size={20} /> {label}
                  </button>
                ),
              )}
            </div>
            {/* for the teacher: what the class learnt before, that this knowledge stands on — one tap away */}
            {links.length > 0 && (
              <p className="cs-kcard__links" data-cs-card-links={links.length}>
                <b>
                  <Link2 size={18} /> {L.linked}
                </b>
                {links.map((l) =>
                  l.path ? (
                    <Link key={l.code} to={l.path} title={l.what ?? ''} data-cs-card-link={l.code}>
                      {l.via} : <strong>{l.title}</strong> · {l.grade} <ArrowForward size={16} />
                    </Link>
                  ) : (
                    <span key={l.code} data-cs-card-link={l.code}>
                      {l.via} : <strong>{l.title}</strong> · {l.grade} · {L.soon}
                    </span>
                  ),
                )}
              </p>
            )}
          </div>
        </Fit>
      </main>

      <footer className="cs-lesson__foot">
        <button type="button" className="cs-btn" onClick={() => go(-1)} disabled={i === 0} data-cs-card-prev>
          <ArrowBack size={18} /> {L.prev}
        </button>
        <span className="cs-lesson__mid" />
        <button
          type="button"
          className="cs-btn cs-btn--main cs-btn--big"
          onClick={() => go(1)}
          data-cs-card-next={last ? 'done' : 'next'}
        >
          {last ? L.done : L.next} <ArrowForward size={20} />
        </button>
      </footer>
      <BoardLayers tools={tools} />
    </div>
  );
}
