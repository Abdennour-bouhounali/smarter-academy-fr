import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Crown } from 'lucide-react';
import { ArrowForward } from '../common/DirectionalIcons';
import { useLessonTileState } from './useLessonTileState';
import { StatusDot, ProgressLine, minutesOf, tileKind } from './lessonTileParts';
import MathLabel from '../../lessons/common/components/MathLabel';
import PublicationBadge from '../content/PublicationBadge';

/**
 * THE LESSON CARD — the one tile of the catalogue (public /courses, « Mes leçons », « Explorer », the teacher's lessons).
 *
 * Four lines at most (owner, 2026-11-16: « small content »): where it sits (optional `eyebrow`), its NAME, ONE status
 * line (what a tap does now, and how long the lesson is), and a thin progress line. No emoji, no paragraph: the
 * description is the tooltip, and is read on the lesson's own page.
 *
 * The state comes from `useLessonTileState(lesson)`, shared with `LessonRow`:
 *   open    → a link; « Commencer » / « Continuer · 40 % » / « Terminée »;
 *   locked  → paid AND outside this student's right: a link to the card-code page;
 *   hidden  → closed by the teacher for this class: said in his words, no commercial lock;
 *   soon    → not published or not written yet: named, never linked.
 * The paid tier (`isPremiumLesson`) and the lock come ONLY from the server; the Premium mark stays on a paid lesson
 * the student CAN open, so that paid content never reads as free.
 *
 * `forwardRef`: callers render it inside <AnimatePresence>, which needs the ref.
 */
const MOTION = {
  layout: true,
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
  transition: { duration: 0.2 },
};
const SHELL =
  'group relative flex h-full min-h-[7.5rem] flex-col justify-between gap-3 overflow-hidden rounded-2xl border p-4';

const LessonCard = forwardRef(function LessonCard({ lesson, onClick, eyebrow = null }, ref) {
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
      <div>
        <div className="mb-1 flex min-h-[1.25rem] items-center justify-between gap-2">
          <span className="min-w-0 truncate font-inter text-xs font-semibold text-nav-muted">{eyebrow}</span>
          {isPremiumLesson && state !== 'hidden' && (
            <span
              className="sa-premium-badge flex-shrink-0"
              title={state === 'locked' ? undefined : t('premiumHasAccess')}
            >
              <Crown size={10} aria-hidden="true" />
              {t('premiumBadge')}
            </span>
          )}
        </div>
        <h4
          className={`line-clamp-2 font-space text-base font-bold leading-snug ${muted ? 'text-nav-muted' : 'text-nav-ink'}`}
        >
          <MathLabel>{lesson.title}</MathLabel>
        </h4>
        {state === 'open' && <PublicationBadge status={publication} className="mt-1.5" />}
      </div>
      <div className="flex items-center gap-2 font-inter text-sm font-bold">
        <StatusDot kind={kind} />
        <span className={kind === 'done' ? 'text-nav-done' : muted ? 'text-nav-muted' : 'text-nav-ink'}>{action}</span>
        {minutes != null && kind === 'start' && (
          <span className="font-semibold text-nav-muted">· {t('lessonMinutes', { n: minutes })}</span>
        )}
        {!muted && (
          <ArrowForward
            size={16}
            className="ms-auto text-nav-muted transition-transform group-hover:translate-x-1 group-hover:text-nav-ink"
          />
        )}
      </div>
      {state === 'open' && <ProgressLine percent={progressPercent} />}
    </>
  );

  if (state === 'hidden') {
    return (
      <motion.div
        ref={ref}
        {...MOTION}
        className={`${SHELL} border-dashed border-nav-line bg-nav-page`}
        title={t('hiddenByTeacherHint', { ns: 'access' })}
        data-hidden-by-teacher={lesson.id}
      >
        {body}
      </motion.div>
    );
  }

  if (state === 'locked') {
    return (
      <motion.div ref={ref} {...MOTION} className="h-full">
        <Link
          to="/espace/activation"
          className={`${SHELL} border-nav-line bg-white transition-shadow hover:shadow-md`}
          title={lesson.description}
        >
          {body}
        </Link>
      </motion.div>
    );
  }

  if (state === 'open') {
    return (
      <motion.div ref={ref} {...MOTION} className="h-full">
        <Link
          to={lesson.path}
          onClick={onClick}
          title={lesson.description}
          className={`${SHELL} bg-white transition-shadow hover:shadow-md border-nav-line hover:border-nav-accent`}
        >
          {body}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div ref={ref} {...MOTION} className={`${SHELL} border-dashed border-nav-line bg-nav-page`}>
      {body}
    </motion.div>
  );
});

export default LessonCard;
