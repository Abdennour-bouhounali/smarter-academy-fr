import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import NameEditor from '../../components/account/NameEditor';
import { TeacherPage, btnSecondary } from './teacherUi';

export default function TeacherProfile() {
  const { t } = useTranslation('teacher');
  useDocumentMeta(t('profile.metaTitle'));
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <TeacherPage eyebrow={t('space')} title={t('profile.title')} subtitle={t('profile.subtitle')}>
      <div className="rounded-2xl border border-nav-line bg-white p-5 max-w-xl space-y-4" data-tour="teacher-profile.name">
        {/* « الاسم و اللقب » — ce que les élèves lisent de leur أستاذ. */}
        <NameEditor tone="teal" />
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('profile.email')}</dt><dd className="mt-0.5 text-slate-800" dir="ltr">{user?.email}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('profile.role')}</dt><dd className="mt-0.5 text-slate-800">{t('profile.teacher')}</dd></div>
        </dl>
        <button type="button" onClick={async () => { await logout(); navigate('/'); }} className={btnSecondary}><LogOut size={14} /> {t('profile.logout')}</button>
      </div>
    </TeacherPage>
  );
}
