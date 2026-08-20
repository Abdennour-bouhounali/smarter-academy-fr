import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import StudentLayout from './StudentLayout';
import MainLayout from './MainLayout';

/**
 * CourseLayout wraps lesson and module routes.
 * If the user is authenticated, it uses StudentLayout (so lessons appear inside the student space).
 * Otherwise, it uses MainLayout (the marketing shell).
 */
export default function CourseLayout() {
  const { user } = useContext(AuthContext);

  if (user) {
    return <StudentLayout />;
  }

  return <MainLayout />;
}
