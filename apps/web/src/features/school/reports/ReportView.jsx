import { useTranslation } from 'react-i18next';
import MathLabel from '../../../lessons/common/components/MathLabel';
import { stateLabel } from '../../../lessons/common/components/masteryLabels';
import ProgressDetail from '../../family/ProgressDetail';
import Distribution, { STATES } from '../Distribution';
import TeacherFacts from '../TeacherFacts';
import { personName } from '../ui';

function Section({ title, children }) {
  return (
    <section className="space-y-3 break-inside-avoid-page" data-report-section>
      <h2 className="border-b border-slate-200 pb-1 font-space text-lg font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

function Legend() {
  const { t: tStudent } = useTranslation('student');
  return (
    <ul className="flex flex-wrap gap-4 font-inter text-xs text-slate-600">
      {STATES.map(([k, color]) => (
        <li key={k} className="flex items-center gap-1.5"><span className={`h-3 w-3 rounded ${color} print:[print-color-adjust:exact]`} />{stateLabel(k, tStudent)}</li>
      ))}
    </ul>
  );
}

function Hardest({ items, t }) {
  if (!items?.length) return <p className="font-inter text-sm text-slate-500">{t('reports.noHardest')}</p>;
  return (
    <table className="w-full font-inter text-sm">
      <tbody>
        {items.map((lp) => (
          <tr key={lp.code} className="border-t border-slate-100">
            <td className="p-2"><MathLabel>{lp.title}</MathLabel><span className="block text-xs text-slate-500"><MathLabel>{lp.lessonTitle}</MathLabel></span></td>
            <td className="w-48 p-2"><Distribution counts={lp.total} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ClassReport({ p, t }) {
  return (
    <>
      <p className="font-inter text-sm text-slate-600">
        {[p.classroom.gradeName, p.classroom.teacher ? t('reports.teacherOf', { name: personName(p.classroom.teacher, '') }) : null, t('reports.studentsCount', { count: p.students })].filter(Boolean).join(' · ')}
      </p>
      <Section title={t('reports.section.learningPoints')}>
        <Legend />
        <table className="w-full font-inter text-sm">
          {p.lessons.map((lesson) => (
            <tbody key={lesson.code}>
              <tr className="bg-indigo-50/60 print:[print-color-adjust:exact]"><th colSpan={2} className="p-2 text-start font-space font-bold text-indigo-900"><MathLabel>{lesson.title}</MathLabel></th></tr>
              {lesson.learningPoints.map((lp) => (
                <tr key={lp.code} className="break-inside-avoid border-t border-slate-100">
                  <td className="p-2"><MathLabel>{lp.title}</MathLabel></td>
                  <td className="w-48 p-2"><Distribution counts={lp.counts} /></td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </Section>
      <Section title={t('reports.section.toWatch')}>
        {p.studentsToWatch.length === 0 ? <p className="font-inter text-sm text-slate-500">{t('reports.noStudents')}</p> : (
          <table className="w-full font-inter text-sm">
            <thead className="text-slate-500"><tr>
              <th className="p-2 text-start">{t('reports.col.student')}</th>
              <th className="p-2 text-start">{t('reports.col.gap')}</th>
              <th className="p-2 text-start">{t('reports.col.reinforce')}</th>
              <th className="p-2 text-start">{t('reports.col.mastered')}</th>
            </tr></thead>
            <tbody>
              {p.studentsToWatch.map((s) => (
                <tr key={s.id} className="break-inside-avoid border-t border-slate-100">
                  <td className="p-2 font-semibold" data-report-student>{personName(s, t('common.unnamed'))}</td>
                  <td className="p-2" dir="ltr">{s.gap}</td>
                  <td className="p-2" dir="ltr">{s.reinforce}</td>
                  <td className="p-2" dir="ltr">{s.mastered}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
    </>
  );
}

function GradeReport({ p, t }) {
  const { classes, lessons } = p.map;
  return (
    <>
      <Section title={t('reports.section.hardest')}><Hardest items={p.hardest} t={t} /></Section>
      <Section title={t('reports.section.learningPoints')}>
        <Legend />
        <table className="w-full font-inter text-sm">
          <thead className="text-slate-500"><tr>
            <th className="p-2 text-start">{t('reports.col.learningPoint')}</th>
            {classes.map((c) => <th key={c.id} className="w-36 p-2 text-start">{c.name} <span className="text-xs font-normal">({c.students})</span></th>)}
          </tr></thead>
          {lessons.map((lesson) => (
            <tbody key={lesson.code}>
              <tr className="bg-indigo-50/60 print:[print-color-adjust:exact]"><th colSpan={classes.length + 1} className="p-2 text-start font-space font-bold text-indigo-900"><MathLabel>{lesson.title}</MathLabel></th></tr>
              {lesson.learningPoints.map((lp) => (
                <tr key={lp.code} className="break-inside-avoid border-t border-slate-100">
                  <td className="p-2"><MathLabel>{lp.title}</MathLabel></td>
                  {classes.map((c) => <td key={c.id} className="p-2"><Distribution counts={lp.byClass[String(c.id)]} /></td>)}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </Section>
    </>
  );
}

function SchoolTermReport({ p, t }) {
  return (
    <>
      <p className="font-inter text-sm text-slate-600" dir="rtl">
        {t('home.classes')}: {p.counts.classes} · {t('home.teachers')}: {p.counts.teachers} · {t('home.students')}: {p.counts.students}
      </p>
      <Section title={t('reports.section.grades')}>
        <Legend />
        {p.grades.map((g) => (
          <div key={g.grade} className="break-inside-avoid space-y-2 rounded-xl border border-slate-200 p-4">
            <p className="font-space font-bold text-slate-900">{g.gradeName} <span className="font-inter text-sm font-normal text-slate-500">· {t('reports.col.classes')}: {g.classes} · {t('reports.col.students')}: {g.students}</span></p>
            <Distribution counts={g.states} />
            <Hardest items={g.hardest} t={t} />
          </div>
        ))}
      </Section>
    </>
  );
}

function TeachersReport({ p, t }) {
  return (
    <Section title={t('reports.section.teachers')}>
      {p.teachers.map((tch) => (
        <div key={tch.id} className="break-inside-avoid space-y-2">
          <p className="font-space font-bold text-slate-900">{personName(tch, t('common.unnamed'))}</p>
          <TeacherFacts facts={tch.facts} />
        </div>
      ))}
    </Section>
  );
}

/**
 * Le CORPS d'un rapport figé, par type (SCHOOL_ADMIN_SPACE.md, phase 5) — le
 * même à l'écran, sur papier et en « وضع الاجتماع ». Un type inconnu (version
 * de schéma plus récente) ne se dessine pas plutôt que mal.
 */
export default function ReportView({ report }) {
  const { t } = useTranslation('idara');
  const p = report.payload;
  switch (report.type) {
    case 'class': return <ClassReport p={p} t={t} />;
    case 'grade': return <GradeReport p={p} t={t} />;
    case 'student': return <ProgressDetail progress={p.progress} audience="school" />;
    case 'school_term': return <SchoolTermReport p={p} t={t} />;
    case 'teachers': return <TeachersReport p={p} t={t} />;
    default: return null;
  }
}
