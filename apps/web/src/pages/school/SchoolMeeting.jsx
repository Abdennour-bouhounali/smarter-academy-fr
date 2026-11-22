import { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EyeOff, Maximize, X } from 'lucide-react';
import { ChevronBack, ChevronForward } from '../../components/common/DirectionalIcons';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import MathLabel from '../../lessons/common/components/MathLabel';
import ProgressDetail from '../../features/family/ProgressDetail';
import Distribution from '../../features/school/Distribution';
import TeacherFacts from '../../features/school/TeacherFacts';
import { buildSlides, displayName, HIDE_NAMES_BY_DEFAULT, stepForKey } from '../../features/school/reports/meetingSlides';
import { fetchReport } from '../../services/schoolService';
import { LOCALE } from '../../locale.js';

function Slide({ slide, report, hidden, t }) {
  const placeholder = (n) => t('meeting.placeholder', { n });
  switch (slide.kind) {
    case 'title':
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
          <p className="font-inter text-2xl text-slate-500">{report.school.name}</p>
          <h1 className="font-space text-5xl font-bold text-slate-900">{t(`reports.types.${report.type}`)}</h1>
          <p className="font-space text-3xl text-nav-accent">
            {report.type === 'student' && hidden ? placeholder(1) : report.title}
          </p>
          <p className="font-inter text-xl text-slate-500">
            {report.term ? `${t('reports.termLabel', { term: report.term.term, year: report.term.academicYear })} · ` : ''}
            {t('reports.frozenAt', { date: new Date(report.generatedAt).toLocaleDateString(LOCALE, { dateStyle: 'long', numberingSystem: 'latn' }) })}
          </p>
        </div>
      );
    case 'lesson': {
      const columns = slide.mode === 'byClass' ? slide.classes : null;
      return (
        <div className="space-y-6">
          <h2 className="font-space text-4xl font-bold text-indigo-900"><MathLabel>{slide.lesson.title}</MathLabel></h2>
          <table className="w-full font-inter text-xl">
            {columns && (
              <thead className="text-slate-500"><tr>
                <th className="p-3 text-start" />
                {columns.map((c) => <th key={c.id} className="w-56 p-3 text-start">{c.name}</th>)}
              </tr></thead>
            )}
            <tbody>
              {slide.lesson.learningPoints.map((lp) => (
                <tr key={lp.code} className="border-t border-slate-200">
                  <td className="p-3"><MathLabel>{lp.title}</MathLabel></td>
                  {columns
                    ? columns.map((c) => <td key={c.id} className="p-3"><Distribution counts={lp.byClass[String(c.id)]} size="lg" /></td>)
                    : <td className="w-80 p-3"><Distribution counts={lp.counts} size="lg" /></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case 'toWatch':
      return (
        <div className="space-y-6">
          <h2 className="font-space text-4xl font-bold text-slate-900">{t('reports.section.toWatch')}</h2>
          <table className="w-full font-inter text-2xl">
            <thead className="text-slate-500"><tr>
              <th className="p-3 text-start">{t('reports.col.student')}</th>
              <th className="p-3 text-start">{t('reports.col.gap')}</th>
              <th className="p-3 text-start">{t('reports.col.reinforce')}</th>
              <th className="p-3 text-start">{t('reports.col.mastered')}</th>
            </tr></thead>
            <tbody>
              {slide.students.map((s, i) => (
                <tr key={s.id} className="border-t border-slate-200">
                  <td className="p-3 font-semibold" data-meeting-name>{displayName(s, i, hidden, placeholder)}</td>
                  <td className="p-3" dir="ltr">{s.gap}</td>
                  <td className="p-3" dir="ltr">{s.reinforce}</td>
                  <td className="p-3" dir="ltr">{s.mastered}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'hardest':
      return (
        <div className="space-y-6">
          <h2 className="font-space text-4xl font-bold text-slate-900">{t('reports.section.hardest')}</h2>
          {slide.items.length === 0 ? <p className="font-inter text-2xl text-slate-500">{t('reports.noHardest')}</p> : (
            <table className="w-full font-inter text-xl"><tbody>
              {slide.items.map((lp) => (
                <tr key={lp.code} className="border-t border-slate-200">
                  <td className="p-3"><MathLabel>{lp.title}</MathLabel><span className="block text-base text-slate-500"><MathLabel>{lp.lessonTitle}</MathLabel></span></td>
                  <td className="w-80 p-3"><Distribution counts={lp.total} size="lg" /></td>
                </tr>
              ))}
            </tbody></table>
          )}
        </div>
      );
    case 'grade':
      return (
        <div className="space-y-6">
          <h2 className="font-space text-4xl font-bold text-slate-900">{slide.grade.gradeName}</h2>
          <p className="font-inter text-2xl text-slate-600">{t('reports.col.classes')}: {slide.grade.classes} · {t('reports.col.students')}: {slide.grade.students}</p>
          <div className="max-w-3xl"><Distribution counts={slide.grade.states} size="lg" /></div>
          <h3 className="font-space text-2xl font-bold text-slate-800">{t('reports.section.hardest')}</h3>
          <ul className="space-y-3 font-inter text-xl">
            {slide.grade.hardest.map((lp) => (
              <li key={lp.code} className="flex items-center gap-6"><span className="flex-1"><MathLabel>{lp.title}</MathLabel></span><span className="w-80"><Distribution counts={lp.total} size="lg" /></span></li>
            ))}
          </ul>
        </div>
      );
    case 'teachers':
      return (
        <div className="space-y-6">
          <h2 className="font-space text-4xl font-bold text-slate-900">{t('reports.section.teachers')}</h2>
          {slide.teachers.map((tch, i) => (
            <div key={tch.id} className="space-y-2">
              <p className="font-space text-2xl font-bold">{hidden ? t('meeting.teacherPlaceholder', { n: i + 1 }) : displayName(tch, i, false, placeholder)}</p>
              <TeacherFacts facts={tch.facts} />
            </div>
          ))}
        </div>
      );
    case 'student':
      return <div className="mx-auto max-w-4xl"><ProgressDetail progress={report.payload.progress} audience="school" /></div>;
    default:
      return null;
  }
}

/**
 * « Mode réunion » (SCHOOL_ADMIN_SPACE.md §6, phase 6) — un rapport FIGÉ projeté
 * en conseil, une diapositive par écran, hors de la coquille (comme l'affichage
 * du défi du jour). Clavier et télécommande (stepForKey), plein écran, et
 * « Masquer les noms » (activé d'office pour les conseils élargis).
 */
export default function SchoolMeeting() {
  const { t } = useTranslation('idara');
  useDocumentMeta(t('meta.meeting'));
  const { reportId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [index, setIndex] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchReport(token, reportId)
      .then((d) => {
        if (!alive) return;
        setReport(d.report);
        setHidden(HIDE_NAMES_BY_DEFAULT.includes(d.report.type));
      })
      .catch((e) => alive && setError(e.reason ? t(`errors.${e.reason}`, { defaultValue: t('errors.generic') }) : e.message));
    return () => { alive = false; };
  }, [token, reportId, t]);

  const slides = report ? buildSlides(report) : [];
  const go = useCallback((step) => setIndex((i) => Math.min(Math.max(i + step, 0), Math.max(slides.length - 1, 0))), [slides.length]);
  const close = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    navigate(`/idara/taqarir/${reportId}`);
  }, [navigate, reportId]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape' && !document.fullscreenElement) { close(); return; }
      const step = stepForKey(event.key);
      if (step !== 0) { event.preventDefault(); go(step); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, close]);

  return (
    <div className="flex min-h-screen flex-col bg-white" data-school-meeting>
      <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-3">
        <button type="button" onClick={close} className="flex min-h-[44px] items-center gap-2 rounded-xl px-3 font-inter text-sm text-slate-600 hover:bg-slate-100" aria-label={t('meeting.close')}>
          <X size={18} aria-hidden="true" />{t('meeting.close')}
        </button>
        <span className="flex-1" />
        <label className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl px-3 font-inter text-sm text-slate-700 hover:bg-slate-100">
          <input type="checkbox" className="h-4 w-4" checked={hidden} onChange={(e) => setHidden(e.target.checked)} data-meeting-hide-names />
          <EyeOff size={16} aria-hidden="true" />{t('meeting.hideNames')}
        </label>
        <button type="button" onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})} className="flex min-h-[44px] items-center gap-2 rounded-xl px-3 font-inter text-sm text-slate-600 hover:bg-slate-100">
          <Maximize size={16} aria-hidden="true" />{t('meeting.fullscreen')}
        </button>
      </div>

      <main className="flex-1 overflow-auto px-12 py-10">
        {error && <p role="alert" className="font-inter text-xl text-rose-700">{error}</p>}
        {report && slides[index] && <Slide slide={slides[index]} report={report} hidden={hidden} t={t} />}
      </main>

      {report && (
        <nav className="flex items-center justify-center gap-6 border-t border-slate-200 py-3 font-inter" aria-label={t('meeting.nav')}>
          <button type="button" onClick={() => go(-1)} disabled={index === 0} className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 disabled:opacity-30" aria-label={t('meeting.previous')}>
            <ChevronBack size={22} aria-hidden="true" />
          </button>
          <span className="text-lg text-slate-600" dir="ltr" data-meeting-position>{index + 1}{'\u00A0/\u00A0'}{slides.length}</span>
          <button type="button" onClick={() => go(1)} disabled={index >= slides.length - 1} className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 disabled:opacity-30" aria-label={t('meeting.next')}>
            <ChevronForward size={22} aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  );
}
