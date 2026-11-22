/** The RESULT of a practice level — a run of the gate dash or a real-world case: stars, score, what to do next. */
import { Star, RotateCcw, Play, Lightbulb, Map as MapIcon } from 'lucide-react';
import MathText from '../../components/MathText';
import { useLesson } from './LessonContext';
import { SUMMARY } from './ladder';
import { KT } from './text';
import { Card, Stars } from './parts';

export default function Result({ o, s, game }) {
  const { ladder, rules, text } = useLesson();
  const nodeMeta = (id) => (id === SUMMARY ? text.summary : rules[id]);
  const meta = nodeMeta(ladder.nodes[o.node].id);
  return (
    <Card wide tone={o.win ? 'di-card--gold' : ''}>
      <p className="di-card__eyebrow">
        {meta.icon} {meta.title} · {KT.map.level(o.level + 1)} — {text.levels[ladder.nodes[o.node].id][o.level]}
      </p>
      <h2 data-di-result={o.win ? 'win' : 'lose'}>{o.win ? KT.practice.win[o.stars - 1] : KT.practice.lose}</h2>
      {o.win ? (
        <div className="di-result__stars">
          <Stars n={o.stars} size={54} />
        </div>
      ) : (
        <p>{KT.practice.loseText}</p>
      )}
      {!o.win && o.why && (
        <p className="di-feedback di-feedback--soft">
          <MathText>{o.why}</MathText>
        </p>
      )}
      <div className={`di-stats ${o.money ? 'di-stats--2' : 'di-stats--3'}`}>
        <div>
          <b>
            {o.money ? (
              <>
                <span dir="ltr">{o.score}</span> {(text.worlds[o.world] ?? text.worlds.depot).unit}
              </>
            ) : (
              <span dir="ltr">{o.score}</span>
            )}
          </b>
          <span>{o.money ? (text.worlds[o.world] ?? text.worlds.depot).earned : KT.practice.score}</span>
          {o.newBest && <em>{KT.practice.newBest}</em>}
        </div>
        {!o.money && (
          <div>
            <b dir="ltr">{o.streak}</b>
            <span>{KT.practice.streak}</span>
          </div>
        )}
        <div>
          <b dir="ltr">{o.mistakes}</b>
          <span>{KT.practice.mistakes}</span>
        </div>
      </div>
      <div className="di-row di-row--wrap">
        {o.win && o.next && (
          <button
            type="button"
            className="di-btn di-btn--primary"
            onClick={() => game.startPractice(o.next.node, o.next.level)}
            data-di-result-next
          >
            <Play size={17} fill="currentColor" /> {KT.practice.nextLevel}
          </button>
        )}
        <button
          type="button"
          className={`di-btn ${o.win && o.next ? '' : 'di-btn--primary'}`}
          onClick={() => game.startPractice(o.node, o.level)}
          data-di-result-retry
        >
          <RotateCcw size={16} /> {KT.practice.retry}
        </button>
        {!o.win && o.key && (
          <button type="button" className="di-btn" onClick={() => game.showRule(o.key)}>
            <Lightbulb size={16} /> {KT.practice.remind}
          </button>
        )}
        <button type="button" className="di-btn" onClick={() => game.openMap()} data-di-result-map>
          <MapIcon size={16} /> {KT.practice.map}
        </button>
      </div>
      <p className="di-dim">
        <Star size={14} className="di-ic-star" />{' '}
        <span dir="ltr">
          {ladder.practiceStars(s.practice)}
          {'\u00a0/\u00a0'}
          {ladder.MAX_PRACTICE_STARS}
        </span>
      </p>
    </Card>
  );
}
