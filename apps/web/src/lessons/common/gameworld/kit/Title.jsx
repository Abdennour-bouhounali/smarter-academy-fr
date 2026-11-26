/**
 * The TITLE SCREEN of a lesson's game world: the lesson's name, the world's own title and story, « Commencer » / « Continuer », and the
 * doors that open without replaying the story — the knowledge map, the practice space, « Ma progression », « Mon labo », « L’échauffement ».
 * A door whose part the lesson has not got yet (`lesson.notYet`, while a lesson is being built) is not shown: a door never
 * opens on nothing.
 */
import { Link } from 'react-router-dom';
import { RotateCcw, Map as MapIcon, BookOpen, BookOpenCheck, Trophy, FlaskConical, Backpack } from 'lucide-react';
import { KT, TX } from './text';
import { useLesson } from './LessonContext';

export default function Title({ s, game, world, lessonTitle, revisionTo = null, onBegin, onRestart, coarse }) {
  const { notYet = [] } = useLesson();
  return (
    <div className="di-title">
      <div className="di-title__box">
        <p className="di-title__eyebrow">{lessonTitle}</p>
        <h1>{world.text.title}</h1>
        <p className="di-title__sub">{world.text.subtitle}</p>
        <button type="button" className="di-btn di-btn--primary di-btn--xl" onClick={onBegin} data-di-start>
          {s.hasSave ? KT.resume : KT.start}
        </button>
        <div className="di-row di-row--wrap di-title__doors">
          {revisionTo && (
            <Link to={revisionTo} className="di-btn di-btn--map" data-di-revision>
              <BookOpenCheck size={18} /> {TX.revision.open}
            </Link>
          )}
          {!notYet.includes('know') && (
            <button type="button" className="di-btn di-btn--map" onClick={() => game.openKnow()} data-di-know-open>
              <BookOpen size={18} /> {TX.know.open}
            </button>
          )}
          {!notYet.includes('map') && (
            <button type="button" className="di-btn di-btn--map" onClick={() => game.openMap()} data-di-map>
              <MapIcon size={18} /> {TX.hub.open}
            </button>
          )}
          {!notYet.includes('progress') && (
            <button
              type="button"
              className="di-btn di-btn--map"
              onClick={() => game.openProgress()}
              data-di-progress-open
            >
              <Trophy size={18} /> {TX.progress.open}
            </button>
          )}
          {!notYet.includes('lab') && (
            <button
              type="button"
              className="di-btn di-btn--map di-btn--lab"
              onClick={() => game.openLab()}
              data-di-lab-open
            >
              <FlaskConical size={18} /> {TX.lab.open}
            </button>
          )}
          {!notYet.includes('launch') && (
            <button
              type="button"
              className="di-btn di-btn--map di-btn--kit"
              onClick={() => game.openLaunch(false)}
              data-di-launch-open
            >
              <Backpack size={18} /> {TX.launch.open}
            </button>
          )}
        </div>
        {s.hasSave && (
          <button type="button" className="di-link" onClick={onRestart}>
            <RotateCcw size={14} /> {KT.restart}
          </button>
        )}
        {!coarse && (
          <ul className="di-title__keys">
            <li>
              <kbd>←</kbd>
              <kbd>↑</kbd>
              <kbd>↓</kbd>
              <kbd>→</kbd> {KT.controls.move}
            </li>
            <li>
              <kbd>{KT.controls.space}</kbd> {KT.controls.jump}
            </li>
            <li>
              <kbd>E</kbd> {KT.controls.act}
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
