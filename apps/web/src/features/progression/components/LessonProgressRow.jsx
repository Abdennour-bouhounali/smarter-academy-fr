import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Trophy, Landmark, Clock } from 'lucide-react';
import { ArrowForward } from '../../../components/common/DirectionalIcons';
import { LearningPointCard } from '../../../lessons/common/components/LearningPointMastery';
import MasteryChips from './MasteryChips';
import PathProgress from './PathProgress';
import Collapsible from './Collapsible';
import { formatLastActivity } from '../formatLastActivity';
import { ChipsSkeleton } from './ProgressionSkeleton';
import MathLabel from '../../../lessons/common/components/MathLabel';
import { mathToPlain } from '../../../utils/mathPlain';

// Des CLÉS, pas des phrases (évaluées avant l'initialisation d'i18next).
const MASTERY_MESSAGE_KEY = {
  unassessed: 'mastery.msgUnassessed',
  gap: 'mastery.msgGap',
  reinforce: 'mastery.msgReinforce',
  mastered: 'mastery.msgMastered',
};

/** Ordre d'affichage des points : ce qui bloque d'abord, l'acquis ensuite. */
const STATE_ORDER = { gap: 0, reinforce: 1, unassessed: 2, mastered: 3 };

const CTA_STYLE = {
  start: 'bg-nav-accent text-white hover:bg-[#3350c4]',
  continue: 'bg-nav-accent text-white hover:bg-[#3350c4]',
  review: 'bg-white border-2 border-emerald-200 text-emerald-700 hover:border-emerald-400',
  reviewGaps: 'bg-white border-2 border-rose-200 text-rose-700 hover:border-rose-400',
};
const CTA_KEY = {
  start: 'progression.curriculum.ctaStart',
  continue: 'progression.curriculum.ctaContinue',
  review: 'progression.curriculum.ctaReview',
  reviewGaps: 'progression.curriculum.ctaReviewGaps',
};

/**
 * Une LEÇON dans l'arbre : progression dans le parcours, résumé de
 * maîtrise, dernière activité, et deux actions distinctes — déplier les
 * compétences (un vrai <button>, aria-expanded) et ouvrir la leçon (un
 * <Link> vers le chemin existant, jamais une URL reconstruite).
 *
 * Les points n'apparaissent QUE dépliés (sinon la page entière serait une
 * liste de points), sauf quand la vue les vise (`forceOpen`) : une
 * recherche qui touche un point l'ouvre d'elle-même.
 */
export default function LessonProgressRow({ node, profileStatus, onExplain }) {
  const { t } = useTranslation('student');
  const [override, setOverride] = useState(null);
  // Un changement de vue rend la main à la vue ; l'élève peut toujours
  // replier ensuite.
  useEffect(() => { setOverride(null); }, [node.forceOpen, node.visiblePoints]);
  const open = override ?? Boolean(node.forceOpen);

  const points = node.visiblePoints ?? node.points;
  const sorted = useMemo(
    () => [...points].sort((a, b) => (STATE_ORDER[a.state] - STATE_ORDER[b.state]) || (a.order - b.order)),
    [points],
  );
  const hasPoints = node.points.length > 0;
  const profileReady = profileStatus === 'ready';
  const panelId = `lp-${node.id}`;
  const last = formatLastActivity(node.lastVisitedAt, t);
  const ctaLabel = t(CTA_KEY[node.cta.kind]);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white overflow-hidden" data-progression-lesson={node.id} data-activity-state={node.activityState}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl leading-none flex-shrink-0 mt-0.5" aria-hidden="true">{node.lesson.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link to={node.lesson.path} className="font-space font-bold text-slate-900 text-base hover:text-nav-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent rounded">
                <MathLabel>{node.lesson.title}</MathLabel>
              </Link>
              {node.isSynthesis && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[11px] font-mono-jetbrains font-bold">
                  <Landmark size={11} aria-hidden="true" /> {t('progression.curriculum.synthesisTag')}
                </span>
              )}
            </div>

            <PathProgress percent={node.progressPercent} className="mt-2 max-w-xs" />

            <div className="mt-2 min-h-[22px]">
              {hasPoints && profileReady && (
                node.assessed === 0
                  ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-mono-jetbrains font-bold text-slate-500">
                      <span aria-hidden="true">⚪</span> {t('progression.curriculum.noneAssessed')}
                      <span className="text-slate-400 font-normal">· {t('progression.chips.total', { count: node.points.length })}</span>
                    </span>
                  )
                  : <MasteryChips counts={node.counts} total={node.points.length} />
              )}
              {hasPoints && profileStatus === 'loading' && <ChipsSkeleton />}
            </div>

            <p className="mt-1.5 text-[11px] font-inter text-slate-400 flex items-center gap-1">
              <Clock size={11} aria-hidden="true" />
              {last ? t('progression.curriculum.lastActivity', { when: last }) : t('progression.curriculum.notStartedYet')}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 flex-wrap sm:justify-end">
          {hasPoints && (
            <button
              type="button"
              onClick={() => setOverride(!open)}
              aria-expanded={open}
              aria-controls={panelId}
              className="min-h-[44px] px-3.5 rounded-xl border-2 border-slate-200 bg-white hover:border-blue-400 text-xs font-mono-jetbrains font-bold text-slate-700 inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent"
              data-progression-points-toggle
            >
              {open ? t('progression.curriculum.hidePoints') : t('progression.curriculum.showPoints')}
              <ChevronDown size={14} className={`transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
          )}
          <Link
            to={node.cta.path}
            aria-label={t('progression.curriculum.ctaAria', { cta: ctaLabel, lesson: node.lesson.title })}
            className={`min-h-[44px] px-4 rounded-xl text-sm font-bold inline-flex items-center gap-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent ${CTA_STYLE[node.cta.kind]}`}
            data-progression-cta={node.cta.kind}
          >
            {ctaLabel} <ArrowForward size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <Collapsible open={open} id={panelId} className="bg-slate-50/70 border-t border-slate-100">
        <div className="p-4 space-y-3">
          {profileReady && node.assessed === 0 && (
            <div className="rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-2.5">
              <Trophy size={16} className="text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-amber-900 leading-relaxed">
                {t('progression.curriculum.noSkillAssessed')}{' '}
                <strong>{t('progression.curriculum.finishBossToSee')}</strong> {t('progression.curriculum.finishBossToSeeRest')}
              </p>
            </div>
          )}

          {points.length < node.points.length && (
            <p className="text-[11px] font-mono-jetbrains text-slate-500">
              {t('progression.curriculum.pointsShown', { count: points.length, total: node.points.length })}
            </p>
          )}

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {sorted.map((p) => (
              <LearningPointCard
                key={p.code}
                title={mathToPlain(p.title)}
                state={p.state}
                confidence={p.confidence}
                row={p}
                // « Pourquoi ? » ouvre le tiroir d'explication (page « Ma progression ») ;
                // un point jamais évalué n'a rien à expliquer.
                onExplain={onExplain && p.state !== 'unassessed' ? () => onExplain({ code: p.code, title: p.title }) : undefined}
                message={t(MASTERY_MESSAGE_KEY[p.state])}
                action={
                  p.state === 'gap' || p.state === 'reinforce' ? (
                    <Link to={node.lesson.path} className="text-xs font-mono-jetbrains font-bold text-nav-accent hover:text-nav-accent underline decoration-dotted inline-flex items-center gap-1">
                      {t('progression.curriculum.reviewLesson')} <ArrowForward size={12} aria-hidden="true" />
                    </Link>
                  ) : null
                }
              />
            ))}
          </div>

          {profileStatus === 'anonymous' && (
            <p className="text-[11px] text-slate-400 font-mono-jetbrains">{t('progression.curriculum.loginToSee')}</p>
          )}
        </div>
      </Collapsible>
    </article>
  );
}
