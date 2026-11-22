import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Users } from 'lucide-react';
import { useAdminResource } from '../../hooks/useAdminResource';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { fetchClassGroups } from '../../services/teacher/classGroupService';
import ClassGroupCard from '../../features/teacher/members/ClassGroupCard';
import ClassGroupForm from '../../features/teacher/members/ClassGroupForm';
import Modal from '../../components/admin/ui/Modal';
import { TeacherPage, Loading, ErrorBox, btnPrimary, useTableLabels } from './teacherUi';

export default function ClassGroupList() {
  const { t } = useTranslation('teacher');
  useDocumentMeta(t('classes.metaTitle'));
  const navigate = useNavigate();
  const labels = useTableLabels();
  const loader = useCallback((token) => fetchClassGroups(token), []);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);
  const canCreate = data?.entitlements?.classes?.canCreate ?? true;
  // Le قسم se crée SUR cette page : la liste reste derrière la boîte, et
  // fermer ramène exactement là où l'enseignant était.
  const [creating, setCreating] = useState(false);

  return (
    <TeacherPage
      eyebrow={t('space')}
      title={t('classes.title')}
      subtitle={t('classes.subtitle')}
      actions={canCreate
        ? <button type="button" onClick={() => setCreating(true)} className={btnPrimary} data-new-class><Plus size={15} /> {t('classes.create')}</button>
        : <span className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">{t('classes.limitReached')}</span>}
    >
      {loading && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && (data.classrooms.length === 0 ? (
        <div className="rounded-2xl border border-nav-line bg-white p-10 text-center">
          <Users size={28} className="mx-auto mb-3 text-slate-300" />
          <p className="font-space font-bold text-slate-800">{t('home.noClassesTitle')}</p>
          <p className="mt-1 font-inter text-sm text-slate-500">{t('home.noClassesBody')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.classrooms.map((c) => <ClassGroupCard key={c.id} classGroup={c} />)}
        </div>
      ))}

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title={t('classes.createTitle')}
        closeLabel={labels.dialog.closeLabel}
        size="md"
      >
        <p className="mb-4 font-inter text-sm text-slate-500">{t('classes.createSubtitle')}</p>
        <ClassGroupForm
          autoFocus
          onCreated={(classroom) => {
            setCreating(false);
            navigate(`/enseignant/classes/${classroom.id}`);
          }}
          onCancel={() => setCreating(false)}
        />
      </Modal>
    </TeacherPage>
  );
}
