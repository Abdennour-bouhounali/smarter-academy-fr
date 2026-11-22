import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';
import { EmptyState } from '../admin/ui/states';

/**
 * A grade that has no published lesson yet says so plainly — on the student's home, his course page and his progress
 * page — instead of an empty grid or a blank page (the French catalogue is empty until its lessons are generated).
 */
export default function NoLessonYet({ action = null }) {
  const { t } = useTranslation('common');
  return (
    <div data-no-lesson-yet>
      <EmptyState icon={BookOpen} title={t('gradeNoLessonYetTitle')} hint={t('gradeNoLessonYetBody')} action={action} />
    </div>
  );
}
