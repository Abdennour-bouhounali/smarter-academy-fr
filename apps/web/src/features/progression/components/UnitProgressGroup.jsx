import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Layers, FolderOpen } from 'lucide-react';
import MasteryChips from './MasteryChips';
import PathProgress from './PathProgress';
import Collapsible from './Collapsible';
import LessonProgressRow from './LessonProgressRow';
import { ChipsSkeleton } from './ProgressionSkeleton';

/**
 * Une الوحدة du manuel dans l'arbre — ou, pour les leçons hors unité d'un
 * ميدان, le groupe « مواضيع أخرى في هذا الميدان » (même règle que
 * unitGrouping.js). Le titre est un <button> qui déplie les leçons ; la
 * progression agrégée et le résumé de maîtrise restent lisibles repliés.
 */
export default function UnitProgressGroup({ group, defaultOpen = false, profileStatus, onExplain }) {
  const { t } = useTranslation('student');
  const [override, setOverride] = useState(null);
  useEffect(() => { setOverride(null); }, [group.forceOpen, defaultOpen]);
  const open = override ?? Boolean(group.forceOpen || defaultOpen);
  const panelId = `unit-${group.id}`;
  const isOther = group.kind === 'other';
  const title = isOther ? t('progression.curriculum.otherTopics') : group.title;
  const built = group.lessons.length > 0;
  const profileReady = profileStatus === 'ready';

  return (
    <section className={`rounded-2xl border ${isOther ? 'border-slate-200 bg-slate-50/60' : 'border-indigo-200 bg-indigo-50/40'}`} data-progression-unit={group.id}>
      <h4 className="m-0">
        <button
          type="button"
          onClick={() => built && setOverride(!open)}
          aria-expanded={built ? open : undefined}
          aria-controls={built ? panelId : undefined}
          aria-label={built ? (open ? t('progression.curriculum.collapseUnit') : t('progression.curriculum.expandUnit')) : undefined}
          disabled={!built}
          className="w-full text-start p-4 flex items-start gap-3 rounded-2xl min-h-[56px] focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent disabled:cursor-default"
        >
          <span className={`inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${isOther ? 'bg-slate-200 text-slate-600' : 'bg-nav-accent text-white'}`} aria-hidden="true">
            {isOther ? <FolderOpen size={18} /> : <Layers size={18} />}
          </span>
          <span className="flex-1 min-w-0">
            {!isOther && group.number != null && (
              <span className="block text-[11px] font-mono-jetbrains uppercase tracking-wider text-nav-accent">{t('unit.unitNumber', { n: group.number })}</span>
            )}
            <span className="block font-space font-bold text-slate-900 text-base leading-snug">{title}</span>
            {group.subtitle && <span className="block text-xs text-slate-500 mt-0.5 line-clamp-2">{group.subtitle}</span>}
            <span className="block text-[11px] font-mono-jetbrains text-slate-500 mt-1">
              {t('progression.curriculum.unitLessons', { count: group.lessonCount })}
              {group.hasSynthesis ? ` + ${t('unit.synthesisTitle')}` : ''}
              {built && ` · ${t('progression.curriculum.lessonsDone', { done: group.agg.done, total: group.lessons.length })}`}
              {group.comingSoon > 0 && ` · ${t('progression.curriculum.comingSoonLessons', { count: group.comingSoon })}`}
            </span>
            {built && (
              <span className="block mt-2 max-w-xs"><PathProgress percent={group.agg.avgProgress} size="sm" /></span>
            )}
            {built && (
              <span className="block mt-2">
                {profileReady && group.agg.points > 0 && (
                  group.agg.assessed === 0
                    ? <span className="text-[11px] font-mono-jetbrains text-slate-500">⚪ {t('progression.curriculum.noneAssessed')}</span>
                    : <MasteryChips counts={group.agg.counts} total={group.agg.points} compact />
                )}
                {profileStatus === 'loading' && group.agg.points > 0 && <ChipsSkeleton />}
              </span>
            )}
          </span>
          {built && (
            <ChevronDown size={18} className={`flex-shrink-0 mt-2 text-slate-400 transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
          )}
        </button>
      </h4>

      <Collapsible open={built && open} id={panelId}>
        <div className="px-3 pb-3 sm:px-4 sm:pb-4 space-y-3">
          {group.lessons.map((node) => (
            <LessonProgressRow key={node.id} node={node} profileStatus={profileStatus} onExplain={onExplain} />
          ))}
        </div>
      </Collapsible>
    </section>
  );
}
