/** The END of the story: what was earned, the keys, and where to go now (the test, the exercises, the practice, the world). */
import { Link } from 'react-router-dom';
import { Star, Gem, RotateCcw, Map as MapIcon } from 'lucide-react';
import { useLesson } from './LessonContext';
import { KT } from './text';
import { Card } from './parts';

export default function End({ s, o, stars, game, world, basePath, config, onRestart }) {
  const { keys, rules, notYet = [] } = useLesson();
  const min = Math.max(1, Math.round(o.elapsed / 60000));
  return (
    <Card wide tone="di-card--gold">
      <div className="di-tablet__icon">🏆</div>
      <h2>{world.text.end.title}</h2>
      <p>{world.text.end.text}</p>
      <div className="di-stats">
        <div>
          <Star size={20} className="di-ic-star" />
          <b dir="ltr">
            {stars}
            {'\u00a0/\u00a0'}
            {world.maxStars}
          </b>
          <span>{KT.end.stars}</span>
        </div>
        <div>
          <Gem size={20} className="di-ic-gem" />
          <b dir="ltr">{s.gems}</b>
          <span>{KT.end.gems}</span>
        </div>
        <div>
          <b dir="ltr">{s.falls}</b>
          <span>{KT.end.falls(s.falls)}</span>
        </div>
        <div>
          <b>{KT.end.min(min)}</b>
          <span>{KT.end.time}</span>
        </div>
      </div>
      <div className="di-keys di-keys--big">
        {keys
          .map((id) => [id, rules[id]])
          .map(([id, v]) => (
            <span
              key={id}
              className={s.keys.includes(id) ? 'is-on' : ''}
              title={s.keys.includes(id) ? v.title : undefined}
            >
              {v.icon}
            </span>
          ))}
      </div>
      <div className="di-row di-row--wrap">
        {!notYet.includes('map') && (
          <button type="button" className="di-btn di-btn--primary" onClick={() => game.openMap()} data-di-end-practice>
            <MapIcon size={17} /> {KT.practice.exam}
          </button>
        )}
        {!notYet.includes('test') && (
          <Link to={`${basePath}/itqan`} className="di-btn">
            {KT.end.test}
          </Link>
        )}
        <Link to={`/espace/pratique/${config.id}`} className="di-btn">
          {KT.end.practice}
        </Link>
        <button type="button" className="di-btn" onClick={() => game.roam()}>
          {world.text.end.stay}
        </button>
        <button type="button" className="di-link" onClick={onRestart}>
          <RotateCcw size={14} /> {KT.end.again}
        </button>
      </div>
    </Card>
  );
}
