import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Crown } from 'lucide-react';
import { ArrowForward } from '../common/DirectionalIcons';
import MathLabel from '../../lessons/common/components/MathLabel';
import PublicationBadge from '../content/PublicationBadge';
import { useLessonTileState } from './useLessonTileState';
import { StatusDot, ProgressLine, minutesOf, tileKind } from './lessonTileParts';

/**
 * THE LESSON ROW — `LessonCard` on one line, for the « قائمة » layout of the catalogue (catalogueView.js). The same four
 * states, read by the same `useLessonTileState(lesson)`: the row decides nothing the card does not.
 *
 * One line: the state, the name, what a tap does now. Nothing else (owner, 2026-11-16: « small content »).
 */
const MOTION = {
  layout: true,
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
};
const ROW = 'group relative flex min-h-[52px] items-center gap-3 overflow-hidden rounded-xl border px-3 py-2 sm:px-4';

const LessonRow = forwardRef(function LessonRow({ lesson, onClick, eyebrow = null }, ref) {
  const { t } = useTranslation('common');
  const { state, isPremiumLesson, progressPercent, publication } = useLessonTileState(lesson);
  const kind = tileKind(state, progressPercent);
  const minutes = minutesOf(lesson.duration);
  const muted = state === 'soon' || state === 'hidden';

  const action = {
    done: t('lessonDone'),
    now: `${t('lessonContinue')} · ${progressPercent}%`,
    start: t('lessonStart'),
    locked: t('lockedCta', { ns: 'access' }),
    hidden: t('hiddenByTeacherBadge', { ns: 'access' }),
    soon: t('lessonComingSoonFooter'),
  }[kind];

  const body = (
    <>
      <StatusDot kind={kind} />
      <div className="min-w-0 flex-1">
        {eyebrow && <div className="truncate font-inter text-xs font-semibold text-nav-muted">{eyebrow}</div>}
        <div className="flex items-center gap-2">
          <h4 className={`truncate font-space text-[15px] font-bold ${muted ? 'text-nav-muted' : 'text-nav-ink'}`}>
            <MathLabel>{lesson.title}</MathLabel>
          </h4>
          {state === 'open' && <PublicationBadge status={publication} />}
        </div>
      </div>
      {isPremiumLesson && state !== 'hidden' && (
        <span className="sa-premium-badge flex-shrink-0" title={state === 'locked' ? undefined : t('premiumHasAccess')}>
          <Crown size={10} aria-hidden="true" /> {t('premiumBadge')}
        </span>
      )}
      {minutes != null && kind === 'start' && (
        <span className="hidden flex-shrink-0 font-inter text-xs font-semibold text-nav-muted sm:inline">
          {t('lessonMinutes', { n: minutes })}
        </span>
      )}
      <span
        className={`flex flex-shrink-0 items-center gap-1 font-inter text-sm font-bold ${kind === 'done' ? 'text-nav-done' : muted ? 'text-nav-muted' : 'text-nav-ink'}`}
      >
        <span className="hidden md:inline">{action}</span>
        {!muted && <ArrowForward size={14} className="text-nav-muted" />}
      </span>
      {state === 'open' && <ProgressLine percent={progressPercent} />}
    </>
  );

  if (state === 'hidden') {
    return (
      <motion.div
        ref={ref}
        {...MOTION}
        className={`${ROW} border-dashed border-nav-line bg-nav-page`}
        title={t('hiddenByTeacherHint', { ns: 'access' })}
        data-hidden-by-teacher={lesson.id}
        data-lesson-row={lesson.id}
      >
        {body}
      </motion.div>
    );
  }

  if (state === 'locked') {
    return (
      <motion.div ref={ref} {...MOTION}>
        <Link
          to="/espace/activation"
          className={`${ROW} border-nav-line bg-white hover:shadow-sm`}
          data-lesson-row={lesson.id}
        >
          {body}
        </Link>
      </motion.div>
    );
  }

  if (state === 'open') {
    return (
      <motion.div ref={ref} {...MOTION}>
        <Link
          to={lesson.path}
          onClick={onClick}
          aria-label={`${lesson.title} — ${action}`}
          className={`${ROW} bg-white hover:shadow-sm border-nav-line hover:border-nav-accent`}
          data-lesson-row={lesson.id}
        >
          {body}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      {...MOTION}
      className={`${ROW} border-dashed border-nav-line bg-nav-page`}
      data-lesson-row={lesson.id}
    >
      {body}
    </motion.div>
  );
});

export default LessonRow;
