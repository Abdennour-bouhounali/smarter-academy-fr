/**
 * THE LESSON'S TOOLS WITH NO WORLD — what arrives before they open: the lesson's CONTENT (its rules, its sheets, its
 * bank) and the student's journey when another device played further. NOT the world: no three.js is asked for
 * (owner, 2026-11-26). « Mon labo » needs neither: it is the lab of every lesson.
 */
import { Suspense, lazy, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { loadWorldContent } from '../../worldPreload';
import { pullSave } from './kit/saveSync';

const LessonTools = lazy(() => import('./kit/LessonTools'));
const LessonLab = lazy(() => import('../lessonlab/LessonLab'));

const Waiting = () => <div className="min-h-screen bg-slate-50" data-lesson-tools-loading />;

export default function LessonToolsLoader({ tool, config, exitTo, ...props }) {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const token = auth?.token ?? null;
  const [lesson, setLesson] = useState(null);

  useEffect(() => {
    if (tool === 'labo') return undefined;
    let alive = true;
    Promise.all([loadWorldContent(config.id), pullSave(token, config.id).catch(() => false)]).then(
      ([content]) => alive && (content ? setLesson(content) : navigate(exitTo, { replace: true })),
      () => alive && navigate(exitTo, { replace: true }),
    );
    return () => {
      alive = false;
    };
  }, [tool, config.id, token, navigate, exitTo]);

  if (tool === 'labo') {
    return (
      <Suspense fallback={<Waiting />}>
        <LessonLab lessonCode={config.id} lessonTitle={config.title} onClose={() => navigate(exitTo)} />
      </Suspense>
    );
  }
  if (!lesson) return <Waiting />;
  return (
    <Suspense fallback={<Waiting />}>
      <LessonTools tool={tool} lesson={lesson} config={config} exitTo={exitTo} {...props} />
    </Suspense>
  );
}
