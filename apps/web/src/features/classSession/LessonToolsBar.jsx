/**
 * THE COMMON HEADER of a teacher's tools of ONE lesson (owner, 2026-11-18: « make the top header common between the
 * tools… easy for the teacher to navigate through all the tools of the lesson »; CLASS_SESSION.md §2). The same bar on
 * the lesson page, the memo, the lesson file and the exercise bank: the lesson's title, then one tab per tool. The tools
 * that are shown to the class (« حصّة القسم », « متابعة القسم », « بطاقة المعارف ») open full screen; the others stay
 * inside the teacher's space, with its navigation — hidden only when a tool itself goes full screen.
 */
import { Link } from 'react-router-dom';
import { useIsPhoneScreen } from '../../components/auth/RequireLargeScreen';
import { PHONE_TOOL_IDS } from '../../components/auth/phoneLessons';
import { Brain, ClipboardList, FileText, Home, NotebookPen, Presentation, Users } from 'lucide-react';
import { getLessonById, getLessonPath } from '@smarter-academy/core';
import MathLabel from '../../lessons/common/components/MathLabel';
import { teacherBankPath } from '../practice/teacherBank';
import { classCardPath, classSessionPath, classTrackingPath, toolHasContent } from './boardLessons';
import { lessonFilePagePath } from './lessonFileDoc';
import './teacherPanel.css';

/** The tools of a lesson, in the order of the teacher's card — only those that have content for it (`toolHasContent`). */
export const lessonTools = (lessonId) => ALL_TOOLS(lessonId).filter((tool) => toolHasContent(lessonId, tool.id));

const ALL_TOOLS = (lessonId) => [
  { id: 'lesson', label: 'الدرس', icon: Home, to: getLessonPath(lessonId) ?? '/enseignant/cours' },
  { id: 'session', label: 'حصّة القسم', icon: Presentation, to: classSessionPath(lessonId), main: true },
  { id: 'memo', label: 'المذكّرة', icon: FileText, to: `/enseignant/cours/${encodeURIComponent(lessonId)}/memoire` },
  { id: 'file', label: 'ملفّ الدرس', icon: NotebookPen, to: lessonFilePagePath(lessonId) },
  { id: 'bank', label: 'بنك التمارين', icon: ClipboardList, to: teacherBankPath(lessonId) },
  { id: 'track', label: 'متابعة القسم', icon: Users, to: classTrackingPath(lessonId) },
  { id: 'card', label: 'بطاقة المعارف', icon: Brain, to: classCardPath(lessonId) },
];

/**
 * THE FRAME of a tool page: the header across the whole width of the teacher's space, then the tool under it. Every
 * tool of a lesson uses it, so the header has the same width, the same style and its tabs the same place everywhere
 * (owner, 2026-11-18). A tool never adds a button to the header: its own actions live in its own page.
 */
export function LessonToolPage({ lessonId, active, children, ...rest }) {
  return (
    <div className="ltp" data-lesson-tool-page={active} {...rest}>
      <LessonToolsBar lessonId={lessonId} active={active} />
      <div className="ltp__body">{children}</div>
    </div>
  );
}

export default function LessonToolsBar({ lessonId, active }) {
  const lesson = getLessonById(lessonId);
  const phone = useIsPhoneScreen();
  return (
    <header className="ltb" dir="rtl" data-lesson-tools={lessonId} data-lesson-tools-active={active}>
      <p className="ltb__title">
        <small>أدوات الدرس</small>
        <strong>
          <MathLabel>{lesson?.title ?? lessonId}</MathLabel>
        </strong>
      </p>
      <nav className="ltb__tabs" aria-label="أدوات الدرس">
        {lessonTools(lessonId).map(({ id, label, icon: Icon, to, main }) =>
          // on a phone, a tool designed for a larger screen is shown but opens nothing (components/auth/phoneLessons.js)
          phone && !PHONE_TOOL_IDS.includes(id) ? (
            <span key={id} className="is-off" aria-disabled="true" title="على الحاسوب" data-lesson-tool-off={id}>
              <Icon size={17} aria-hidden="true" /> {label}
            </span>
          ) : (
            <Link
              key={id}
              to={to}
              className={`${active === id ? 'is-on' : ''} ${main ? 'is-main' : ''}`}
              aria-current={active === id ? 'page' : undefined}
              data-lesson-tool={id}
            >
              <Icon size={17} aria-hidden="true" /> {label}
            </Link>
          ),
        )}
      </nav>
    </header>
  );
}
