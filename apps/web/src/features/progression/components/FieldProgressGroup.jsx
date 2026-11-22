import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Hammer } from 'lucide-react';
import MasteryChips from './MasteryChips';
import PathProgress from './PathProgress';
import Collapsible from './Collapsible';
import UnitProgressGroup from './UnitProgressGroup';
import { ChipsSkeleton } from './ProgressionSkeleton';
import MathLabel from '../../../lessons/common/components/MathLabel';

/**
 * Un ميدان (chapter du catalogue) : le sommet de la hiérarchie affichée.
 * Repliée, la carte dit déjà l'essentiel — progression agrégée, résumé de
 * maîtrise, nombre de leçons ; dépliée, elle montre ses وحدات.
 *
 * Un ميدان dont aucune leçon n'est encore construite est une ligne
 * compacte « قيد الإعداد », non dépliable : l'élève voit l'étendue du
 * programme sans qu'on lui prête un 0 % qu'il n'a pas mérité.
 */
export default function FieldProgressGroup({ field, defaultOpen = false, profileStatus, onExplain }) {
  const { t } = useTranslation('student');
  const [override, setOverride] = useState(null);
  useEffect(() => { setOverride(null); }, [field.forceOpen, defaultOpen]);
  const built = field.agg.lessons > 0;
  const open = override ?? Boolean(field.forceOpen || defaultOpen);
  const panelId = `field-${field.id}`;
  const profileReady = profileStatus === 'ready';

  // L'unité ouverte par défaut : celle du dernier travail, sinon la première.
  const defaultUnitId = useMemo(() => {
    const withActivity = field.groups.filter((g) => g.agg.lastVisitedAt > 0);
    if (withActivity.length) return withActivity.sort((a, b) => b.agg.lastVisitedAt - a.agg.lastVisitedAt)[0].id;
    return field.groups.find((g) => g.lessons.length > 0)?.id ?? null;
  }, [field.groups]);

  if (!built) {
    return (
      <section className="glass-card p-4 sm:p-5 flex items-center gap-3 opacity-80" data-progression-field={field.id} data-field-state="coming_soon">
        <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500" aria-hidden="true">
          <Hammer size={18} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono-jetbrains uppercase tracking-wider text-slate-400">{t('progression.curriculum.fieldNumber', { n: field.number })}</p>
          <h3 className="font-space font-bold text-slate-700 text-base leading-snug"><MathLabel>{field.title}</MathLabel></h3>
          <p className="text-xs text-slate-500 mt-0.5">{t('progression.curriculum.fieldComingSoonHint')}</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-600 px-2.5 py-1 text-[11px] font-mono-jetbrains font-bold flex-shrink-0">
          {t('progression.curriculum.fieldComingSoon')} · {t('progression.curriculum.unitLessons', { count: field.lessonCount })}
        </span>
      </section>
    );
  }

  return (
    <section className="glass-card overflow-hidden" data-progression-field={field.id} data-field-state="built">
      <h3 className="m-0">
        <button
          type="button"
          onClick={() => setOverride(!open)}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? t('progression.curriculum.collapseField') : t('progression.curriculum.expandField')}
          className="w-full text-start p-4 sm:p-5 flex items-start gap-3 sm:gap-4 min-h-[64px] hover:bg-slate-50/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-nav-accent"
        >
          <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-nav-accent text-white font-space font-black text-lg" aria-hidden="true">
            {field.number}
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[11px] font-mono-jetbrains uppercase tracking-wider text-blue-500">{t('progression.curriculum.fieldNumber', { n: field.number })}</span>
            <span className="block font-space font-bold text-slate-900 text-lg leading-snug"><MathLabel>{field.title}</MathLabel></span>
            {field.subtitle && <span className="block text-xs text-slate-500 mt-0.5">{field.subtitle}</span>}
            <span className="block text-[11px] font-mono-jetbrains text-slate-500 mt-1">
              {t('progression.curriculum.unitLessons', { count: field.lessonCount })}
              {` · ${t('progression.curriculum.lessonsDone', { done: field.agg.done, total: field.agg.lessons })}`}
              {field.comingSoon > 0 && ` · ${t('progression.curriculum.comingSoonLessons', { count: field.comingSoon })}`}
            </span>
            <span className="block mt-2 max-w-sm"><PathProgress percent={field.agg.avgProgress} /></span>
            <span className="block mt-2">
              {profileReady && field.agg.points > 0 && (
                field.agg.assessed === 0
                  ? <span className="text-[11px] font-mono-jetbrains text-slate-500">⚪ {t('progression.curriculum.noneAssessed')}</span>
                  : <MasteryChips counts={field.agg.counts} total={field.agg.points} />
              )}
              {profileStatus === 'loading' && field.agg.points > 0 && <ChipsSkeleton />}
            </span>
          </span>
          <ChevronDown size={20} className={`flex-shrink-0 mt-2 text-slate-400 transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      </h3>

      <Collapsible open={open} id={panelId} className="border-t border-slate-100">
        <div className="p-3 sm:p-4 space-y-3 bg-slate-50/40">
          {field.groups.map((group) => (
            <UnitProgressGroup
              key={group.id}
              group={group}
              defaultOpen={group.id === defaultUnitId}
              profileStatus={profileStatus}
              onExplain={onExplain}
            />
          ))}
        </div>
      </Collapsible>
    </section>
  );
}
