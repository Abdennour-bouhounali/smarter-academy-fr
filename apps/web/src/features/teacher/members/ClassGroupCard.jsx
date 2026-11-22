import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { ArrowForward } from '../../../components/common/DirectionalIcons';
import { getAllGrades } from '@smarter-academy/core';

/** Une carte de classe : nom, classe scolaire, effectif, état, code. */
export default function ClassGroupCard({ classGroup }) {
  const { t } = useTranslation('teacher');
  const gradeName = getAllGrades().find((g) => g.id === classGroup.grade)?.name ?? classGroup.grade;
  const archived = classGroup.status === 'archived';

  return (
    <Link to={`/enseignant/classes/${classGroup.id}`} className={`rounded-2xl border border-nav-line bg-white p-5 flex flex-col gap-3 hover:shadow-md transition-shadow ${archived ? 'opacity-70' : ''}`} data-class-card={classGroup.id}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-space font-bold text-slate-900 text-lg truncate">{classGroup.name}</h3>
          <p className="font-inter text-slate-500 text-xs">{gradeName}{classGroup.academicYear ? ` · ${classGroup.academicYear}` : ''}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 font-mono-jetbrains text-[10px] font-bold ${archived ? 'bg-slate-100 text-slate-500' : classGroup.status === 'suspended' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {t(`classes.status.${classGroup.status}`)}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="inline-flex items-center gap-1.5 text-slate-600"><Users size={14} /> {t('home.studentsCount', { count: classGroup.studentsCount ?? 0 })}</span>
        <span dir="ltr" className="font-mono-jetbrains text-xs font-bold tracking-[0.2em] text-nav-accent">{classGroup.joinCode}</span>
      </div>
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-nav-accent">{t('classes.settings')} <ArrowForward size={12} /></span>
    </Link>
  );
}
