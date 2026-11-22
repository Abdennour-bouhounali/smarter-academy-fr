import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import ClassGroupForm from '../../features/teacher/members/ClassGroupForm';
import { TeacherPage } from './teacherUi';

/**
 * Créer une classe en pleine page. Le geste habituel passe désormais par la
 * boîte de dialogue de « Mes classes » ; cette route reste pour les liens directs
 * et les favoris, et partage exactement le même formulaire.
 */
export default function ClassGroupCreate() {
  const { t } = useTranslation('teacher');
  useDocumentMeta(t('classes.createTitle'));
  const navigate = useNavigate();

  return (
    <TeacherPage eyebrow={t('classes.title')} title={t('classes.createTitle')} subtitle={t('classes.createSubtitle')}>
      <div className="rounded-2xl border border-nav-line bg-white p-5 sm:p-6 max-w-xl">
        <ClassGroupForm
          onCreated={(classroom) => navigate(`/enseignant/classes/${classroom.id}`, { replace: true })}
          onCancel={() => navigate(-1)}
        />
      </div>
    </TeacherPage>
  );
}
