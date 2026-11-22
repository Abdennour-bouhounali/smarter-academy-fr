import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClipboardList, GraduationCap } from 'lucide-react';
import { useLessonConfig } from '../../lessons/useLessonConfig';
import { lessonPackFlags } from '../../lessons/registry';
import { lessonMemoPath, classDoor } from '../../features/teacher/lessonMemo/memoRoutes';

/**
 * Les étapes d'une leçon, dans l'ordre de lesson.config.js — jamais
 * inventés : une leçon non construite n'en montre aucun. Compact (une puce
 * par étape, titre tronqué, titre complet au survol) pour que la carte ne
 * s'allonge pas.
 *
 * A lesson whose pack has a WORLD (a v2 lesson, LESSON_V2.md §2) shows none: its module pages are deleted (their
 * addresses only redirect to the world) — its modules are progress DATA, not steps a teacher can open.
 */
export function LessonModuleChips({ lessonId }) {
  const { t } = useTranslation('teacher');
  // La config complète (titres des étapes) se charge avec la page d'unité.
  const modules = useLessonConfig(lessonId)?.modules ?? [];
  if (modules.length === 0 || lessonPackFlags(lessonId).world) return null;
  return (
    <div data-lesson-modules={lessonId}>
      <h4 className="mb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{t('lessonCard.modulesTitle')}</h4>
      <ol className="flex flex-wrap gap-1.5">
        {modules.map((m) => (
          <li
            key={m.id}
            title={t('lessonCard.moduleChip', { n: m.number, title: m.title })}
            className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 py-0.5 pe-2.5 ps-0.5 text-xs text-slate-700"
            data-module-chip={m.number}
          >
            <span dir="ltr" className="inline-flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-nav-accent px-1 font-mono text-[11px] font-bold text-white">{m.number}</span>
            <span className="truncate">{m.title}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Les deux gestes de l'enseignant sur une leçon, côte à côte et distincts :
 *
 *   [📋 La fiche du professeur]  préparer / tenir la séance (route ProtectedRoute(teacher))
 *   [🎓 Mode classe]    projeter tout de suite : la leçon s'ouvre avec
 *                     CLASSROOM_START_STATE et LessonClassroomShell démarre
 *                     la séance à l'arrivée.
 *
 * Le parent ne les rend que pour le lecteur enseignant
 * (`useLearningViewer().isTeacher`) ; la vraie porte de la fiche reste la
 * route.
 */
export function TeacherLessonActions({ lesson }) {
  const { t } = useTranslation('teacher');
  const { pathname, search } = useLocation();
  const door = classDoor(lesson.id, lesson.path);
  return (
    <div className="flex flex-wrap items-center gap-2" data-teacher-lesson-actions={lesson.id}>
      <Link
        to={lessonMemoPath(lesson.id)}
        state={{ from: `${pathname}${search}` }}
        aria-label={t('lessonCard.memoAria', { title: lesson.title })}
        title={t('lessonCard.memoHint')}
        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border-2 border-nav-accent bg-white px-4 py-2 text-sm font-extrabold text-nav-accent hover:bg-nav-page focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent focus-visible:ring-offset-2"
        data-lesson-memo-link={lesson.id}
      >
        <ClipboardList className="h-5 w-5" aria-hidden="true" /> {t('lessonCard.memo')}
      </Link>
      {/* « Séance en classe » pour une leçon qui a son tableau, « Mode classe » pour les autres (memoRoutes › classDoor) */}
      <Link
        to={door.to}
        state={door.state}
        aria-label={t(door.session ? 'lessonCard.sessionAria' : 'lessonCard.classroomAria', { title: lesson.title })}
        title={t(door.session ? 'lessonCard.sessionHint' : 'lessonCard.classroomHint')}
        data-lesson-door={door.session ? 'session' : 'classroom'}
        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border-2 border-nav-accent bg-nav-accent px-4 py-2 text-sm font-extrabold text-white hover:bg-[#3350c4] focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent focus-visible:ring-offset-2"
        data-lesson-classroom-link={lesson.id}
      >
        <GraduationCap className="h-5 w-5" aria-hidden="true" /> {t(door.session ? 'lessonCard.session' : 'lessonCard.classroom')}
      </Link>
    </div>
  );
}
