import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, GraduationCap, School, Users } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { fetchSchoolOverview } from '../../services/schoolService';
import { usePayments } from '../../context/PaymentsContext';
import { LOCALE } from '../../locale.js';

function Figure({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5" data-school-figure>
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={18} aria-hidden="true" />
        <p className="font-inter text-sm">{label}</p>
      </div>
      <p className="mt-2 font-space text-3xl font-bold text-slate-900" dir="ltr">{value}</p>
      {hint && <p className="mt-1 font-inter text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

/**
 * « Tableau de bord » — l'accueil du directeur (SCHOOL_ADMIN_SPACE.md §6).
 *
 * Des COMPTES, jamais une moyenne. Les élèves comptés sont ceux qui ont
 * consenti à la lecture de l'établissement — le texte le dit sous le chiffre.
 */
export default function SchoolHome() {
  const { t } = useTranslation('idara');
  useDocumentMeta(t('meta.home'));
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [problem, setProblem] = useState(null);
  // Payments closed: no « seats bought » card — every pupil has full access, nothing is sold (§4ter).
  const { paymentsOpen } = usePayments();

  useEffect(() => {
    let alive = true;
    fetchSchoolOverview(token)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setProblem(e.reason ? t(`errors.${e.reason}`, { defaultValue: t('errors.generic') }) : e.message));
    return () => { alive = false; };
  }, [token, t]);

  if (problem) {
    return <p role="alert" className="rounded-xl bg-red-50 p-4 font-inter text-sm text-red-700">{problem}</p>;
  }
  if (!data) {
    return <div className="h-64" aria-busy="true" />;
  }

  const { school, counts } = data;
  return (
    <div className="space-y-8">
      <header className="flex items-start gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-nav-accent text-white">
          <School size={28} aria-hidden="true" />
        </div>
        <div>
          <p className="font-inter text-sm text-slate-500">{t('home.eyebrow')}</p>
          <h1 className="font-space text-2xl font-bold text-slate-900">{school.name}</h1>
          <p className="mt-1 font-inter text-sm text-slate-600">
            {[school.wilaya, school.commune].filter(Boolean).join(' · ')}
            {' — '}
            {t('home.yearLabel')}: <span dir="ltr">{school.currentAcademicYear || t('home.noYear')}</span>
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Figure icon={School} label={t('home.classes')} value={counts.classes} />
        <Figure icon={GraduationCap} label={t('home.teachers')} value={counts.teachers} />
        <Figure icon={Users} label={t('home.students')} value={counts.students} hint={t('home.studentsHint')} />
      </section>

      {/* La licence (D1) : sièges utilisés sur sièges achetés, et sa fin. */}
      {paymentsOpen && <section className="rounded-2xl border border-slate-200 bg-white p-5" data-school-licence>
        <div className="flex items-center gap-2 text-slate-500">
          <BadgeCheck size={18} aria-hidden="true" />
          <p className="font-inter text-sm">{t('home.licence')}</p>
        </div>
        {data.licence ? (
          <>
            <p className="mt-2 font-space text-3xl font-bold text-slate-900" dir="ltr">{data.licence.current}{'\u00A0/\u00A0'}{data.licence.seats}</p>
            <p className="mt-1 font-inter text-xs text-slate-500">
              {t('home.licenceHint')}
              {data.licence.endsAt && ` ${t('home.licenceEnds', { date: new Date(data.licence.endsAt).toLocaleDateString(LOCALE, { dateStyle: 'medium', numberingSystem: 'latn' }) })}`}
            </p>
          </>
        ) : (
          <p className="mt-2 font-inter text-sm text-slate-600">{t('home.noLicence')}</p>
        )}
      </section>}
    </div>
  );
}
