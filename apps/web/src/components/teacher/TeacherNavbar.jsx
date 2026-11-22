import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import WorkspaceNav from '../common/WorkspaceNav';
import { AuthContext } from '../../context/AuthContext';
import { teacherDoors, teacherAccountLinks } from '../../data/teacherNavigation';
import { getDisplayName, getInitials } from '../../utils/userDisplay';

/**
 * The teacher's menu: the four doors of `data/teacherNavigation.js` in the shared `WorkspaceNav`, in ink. The count of
 * answers waiting for his correction shows on « أقسامي »; his account, plan and school are under his picture.
 */
export default function TeacherNavbar({ reviews = 0 }) {
  const { t } = useTranslation('nav');
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <WorkspaceNav
      account="teacher"
      doors={teacherDoors}
      accountLinks={teacherAccountLinks}
      identity={{ name: getDisplayName(user), initials: getInitials(user), sub: t('teacherSpace') }}
      counts={{ reviews }}
      onLogout={handleLogout}
    />
  );
}
