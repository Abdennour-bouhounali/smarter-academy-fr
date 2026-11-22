import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowForward } from '../common/DirectionalIcons';
import { getLessonProgress } from '../../lessons/common/utils/progress/getLessonProgress';
import { getTotalModules } from '../../lessons/registry';
import { ProgressLine } from './lessonTileParts';

/**
 * THE UNIT CARD (الوحدة) of the catalogue — the level chosen after the ميدان and before the درس; it leads to the unit
 * page. The same short form as `LessonCard` (owner, 2026-11-16: « small content »): « الوحدة n », its NAME, ONE line
 * (how many lessons, how many done) and a thin progress line. No icon, no paragraph of objectives: they are on the
 * unit page.
 *
 * `layout="rows"` (the « قائمة » layout, catalogueView.js): the same unit on one line.
 * A unit with no lesson written yet (1AM–3AM) stays a link — its page shows what the lessons will teach — and says
 * « قيد الإعداد » instead of a 0 / N that would read as being late.
 *
 * `forwardRef`: rendered inside <AnimatePresence mode="popLayout">, which needs the ref.
 */
const UnitGroup = forwardRef(function UnitGroup({ unit, layout = 'grid' }, ref) {
  const { t } = useTranslation('student');
  const { t: tc } = useTranslation('common');
  const total = unit.lessons.length;
  const done = unit.lessons.filter(
    (l) => l.status === 'available' && getLessonProgress(l.id, getTotalModules(l.id)).progressPercent >= 100,
  ).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const drafting = !unit.lessons.some((l) => l.status === 'available');
  const count = tc('lessonsCount', { count: total });
  const tally = drafting ? (
    <span
      className="rounded-full border border-dashed border-nav-line px-2.5 py-0.5 text-xs font-semibold text-nav-muted"
      data-unit-draft={unit.id}
    >
      {t('unit.comingSoon')}
    </span>
  ) : (
    <span dir="ltr" className={`font-bold ${pct >= 100 ? 'text-nav-done' : 'text-nav-ink'}`}>
      {pct >= 100 ? '✓ ' : ''}
      {done}
      {' / '}
      {total}
    </span>
  );
  const border = drafting ? 'border-dashed border-nav-line' : 'border-nav-line hover:border-nav-accent';
  const arrow = (
    <ArrowForward
      size={16}
      className="ms-auto flex-shrink-0 text-nav-muted transition-transform group-hover:-translate-x-1 group-hover:text-nav-ink"
    />
  );

  if (layout === 'rows') {
    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <Link
          to={unit.path}
          data-unit-group={unit.id}
          className={`group relative flex min-h-[52px] items-center gap-3 overflow-hidden rounded-xl border bg-white px-3 py-2 hover:shadow-sm sm:px-4 ${border}`}
        >
          <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-nav-page font-inter text-xs font-bold text-nav-ink">
            {unit.number}
          </span>
          <h4 className="min-w-0 flex-1 truncate font-space text-[15px] font-bold text-nav-ink">{unit.title}</h4>
          <span className="hidden flex-shrink-0 font-inter text-xs font-semibold text-nav-muted sm:inline">
            {count}
          </span>
          <span className="flex-shrink-0 font-inter text-sm">{tally}</span>
          {arrow}
          <ProgressLine percent={pct} />
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Link
        to={unit.path}
        data-unit-group={unit.id}
        title={unit.subtitle || undefined}
        className={`group relative flex h-full min-h-[7.5rem] flex-col justify-between gap-3 overflow-hidden rounded-2xl border bg-white p-4 transition-shadow hover:shadow-md ${border}`}
      >
        <div>
          <p className="mb-1 font-inter text-xs font-semibold text-nav-muted">
            {t('unit.unitNumber', { n: unit.number })}
          </p>
          <h4 className="line-clamp-2 font-space text-base font-bold leading-snug text-nav-ink">{unit.title}</h4>
        </div>
        <div className="flex items-center gap-2 font-inter text-sm">
          <span className="font-semibold text-nav-muted">{count}</span>
          <span className="text-nav-line">·</span>
          {tally}
          {arrow}
        </div>
        <ProgressLine percent={pct} />
      </Link>
    </motion.div>
  );
});

export default UnitGroup;
