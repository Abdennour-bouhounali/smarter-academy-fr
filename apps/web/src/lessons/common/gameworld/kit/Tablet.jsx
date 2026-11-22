/**
 * The TABLET of a rule: its icon, its name, its sentences, its formulas — and, above them, the rule the student forged
 * himself when he has one. The rule comes from the lesson (`useLesson().rules`).
 */

import { useState } from 'react';
import MathText from '../../components/MathText';
import { useLesson } from './LessonContext';
import { KT } from './text';
import { M, Card } from './parts';

function TabletBody({ id, mine = null }) {
  const { rules } = useLesson();
  const t = rules[id];
  return (
    <>
      <div className="di-tablet__icon">{t.icon}</div>
      <h2>{t.title}</h2>
      {mine && (
        <div className="di-tablet__mine" data-di-my-rule>
          <small>{KT.tablets.mine}</small>
          <p>{mine.text}</p>
          {mine.words && <p className="di-tablet__words">« {mine.words} »</p>}
          <small>{KT.tablets.theirs}</small>
        </div>
      )}
      {t.lines.map((l) => (
        <p key={l}>
          <MathText>{l}</MathText>
        </p>
      ))}
      {t.list && (
        <ul className="di-tablet__list">
          {t.list.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      )}
      <div className="di-tablet__math">
        {t.math.map((m) => (
          <M key={m}>{m}</M>
        ))}
      </div>
      {t.notes.map((n) => (
        <p key={n} className="di-tablet__note">
          {n}
        </p>
      ))}
    </>
  );
}

/**
 * THE RULE GOES TO ITS CORNER (owner, 2026-11-21, every world): when he closes a tablet he has just received, the card
 * shrinks and flies to the button « قواعدي » of the top bar, which then beats — he SEES where his rule went and that he
 * can read it again whenever he wants. No motion for a reader who asked for none.
 */
function flyToRules(card, done) {
  const target = document.querySelector('[data-di-rules]');
  const still =
    typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!card || !target || still) return done();
  const a = card.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const veil = card.closest('.di-veil');
  let over = false;
  const end = () => {
    if (over) return;
    over = true;
    target.classList.add('is-fresh');
    setTimeout(() => target.classList.remove('is-fresh'), 2600);
    done();
  };
  card.style.transition = 'transform 0.75s cubic-bezier(0.55, 0, 0.2, 1), opacity 0.75s ease-in';
  card.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px) scale(0.05)`;
  card.style.opacity = '0.3';
  if (veil) {
    veil.style.transition = 'background-color 0.75s, backdrop-filter 0.75s';
    veil.style.backgroundColor = 'transparent';
    veil.style.backdropFilter = 'none';
  }
  card.addEventListener('transitionend', end, { once: true });
  setTimeout(end, 900);
  return undefined;
}

export function Tablet({ id, onClose, fresh, closeLabel, mine = null }) {
  const close = (e) => (fresh ? flyToRules(e.currentTarget.closest('.di-card'), onClose) : onClose());
  return (
    <Card tone="di-card--stone">
      {fresh && <p className="di-card__eyebrow">{mine ? KT.tablets.forged : KT.tablets.got}</p>}
      <TabletBody id={id} mine={mine} />
      <button type="button" className="di-btn di-btn--primary" onClick={close} data-di-tablet>
        {closeLabel ?? KT.tablets.close}
      </button>
    </Card>
  );
}

/**
 * « قواعدي » — every rule he owns, readable from anywhere in the world (the button of the top bar): one tab a rule,
 * his own forged sentence above its name when he has one.
 */
export function RulesSheet({ keys, sel = null, mine = {}, onClose }) {
  const { rules } = useLesson();
  const [at, setAt] = useState(sel && keys.includes(sel) ? sel : keys[keys.length - 1]);
  return (
    <Card tone="di-card--stone">
      <p className="di-card__eyebrow">{KT.tablets.all}</p>
      {keys.length > 1 && (
        <div className="di-rules__tabs" role="tablist">
          {keys.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={id === at}
              className={id === at ? 'is-on' : ''}
              onClick={() => setAt(id)}
              data-di-rules-tab={id}
            >
              <span aria-hidden="true">{rules[id].icon}</span> {rules[id].title}
            </button>
          ))}
        </div>
      )}
      <TabletBody key={at} id={at} mine={mine?.[at] ?? null} />
      <button type="button" className="di-btn di-btn--primary" onClick={onClose} data-di-rules-close>
        {KT.tablets.back}
      </button>
    </Card>
  );
}
