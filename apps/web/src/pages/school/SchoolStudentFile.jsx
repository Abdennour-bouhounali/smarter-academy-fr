import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowBack } from '../../components/common/DirectionalIcons';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import ProgressDetail from '../../features/family/ProgressDetail';
import { fetchStudentFile } from '../../services/schoolService';
import { btnSecondary, errorText, personName } from '../../features/school/ui';

/**
 * « ملف التلميذ » (SCHOOL_ADMIN_SPACE.md §7, phase 4) : le MÊME « التقدّم
 * بالتفصيل » que lisent l'élève et son وليّ (PARENT_SPACE.md §4bis) — un seul
 * service, un seul composant. Pas de temps d'étude : l'élève a accepté que
 * l'établissement lise son avancement et ses كفاءات, pas ses heures.
 */
export default function SchoolStudentFile() {
  const { t } = useTranslation('idara');
  useDocumentMeta(t('meta.studentFile'));
  const { studentId } = useParams();
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchStudentFile(token, studentId)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(errorText(t, e)));
    return () => { alive = false; };
  }, [token, studentId, t]);

  return (
    <div className="space-y-6" data-school-student-file>
      <Link to="/idara/talamidh" className={btnSecondary}><ArrowBack size={16} aria-hidden="true" />{t('file.back')}</Link>
      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 font-inter text-sm text-rose-700">{error}</p>}
      {data && (
        <>
          <header>
            <h1 className="font-space text-2xl font-bold text-slate-900">{personName(data.student, t('common.unnamed'))}</h1>
            {data.student.classroom && <p className="font-inter text-sm text-slate-500">{t('file.class', { name: data.student.classroom.name })}</p>}
          </header>
          <ProgressDetail progress={data.progress} audience="school" />
        </>
      )}
    </div>
  );
}
