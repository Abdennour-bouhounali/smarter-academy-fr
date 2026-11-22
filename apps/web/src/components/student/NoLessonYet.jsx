import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { EmptyState } from '../admin/ui/states';

/**
 * A grade that has no published lesson yet says so plainly — on the student's home, his course page and his progress
 * page — instead of an empty grid or a blank page.
 * `announced`: the grade has no published lesson but its lessons are in the catalogue as « coming soon » (3e since
 * 2026-11-22): it says so, and leads to the page where its units show them.
 */
export default function NoLessonYet({ action = null, announced = false }) {
  const { t } = useTranslation('common');
  if (announced) {
    return (
      <div data-lessons-announced>
        <EmptyState
          icon={BookOpen}
          title={t('gradeLessonsAnnouncedTitle')}
          hint={t('gradeLessonsAnnouncedBody')}
          action={
            action ?? (
              <Link to="/espace/cours" className="btn-primary inline-flex text-sm">
                {t('gradeLessonsAnnouncedCta')}
              </Link>
            )
          }
        />
      </div>
    );
  }
  return (
    <div data-no-lesson-yet>
      <EmptyState icon={BookOpen} title={t('gradeNoLessonYetTitle')} hint={t('gradeNoLessonYetBody')} action={action} />
    </div>
  );
}
