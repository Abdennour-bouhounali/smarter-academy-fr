import { Suspense, lazy, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { preloadNamespace } from '../../i18n/index.js';
import { describeLearningViewer } from '../../features/learning/learningViewer';
import StudentLayout from './StudentLayout';
import MainLayout from './MainLayout';

// La coquille ENSEIGNANT est un lot à part, comme dans App.jsx : ce fichier
// est importé statiquement par App.jsx, et un import statique ici remettait
// l'espace enseignant dans le lot d'entrée de chaque élève et visiteur.
// Voir docs/architecture/BUNDLE_BOUNDARIES.md.
// Ses textes (`teacher`, à la demande) partent avec lui, pas après lui.
const TeacherLayout = lazy(() => {
  preloadNamespace('teacher');
  return import('./TeacherLayout');
});

/** Élève ou enseignant : une barre latérale et un en-tête mobile, pas de Navbar visiteur. */
export function usesWorkspaceShell(user) {
  return describeLearningViewer(user).usesWorkspaceShell;
}

export default function CourseLayout() {
  const { user } = useContext(AuthContext);
  const viewer = describeLearningViewer(user);

  if (viewer.role === 'student') {
    return <StudentLayout />;
  }
  if (viewer.role === 'teacher') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#FAFAFA]" />}>
        <TeacherLayout />
      </Suspense>
    );
  }

  return <MainLayout />;
}
