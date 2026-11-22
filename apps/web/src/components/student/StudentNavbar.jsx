import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsButton from '../../features/settings/SettingsButton';
import NotificationBell from '../../features/notifications/NotificationBell';
import WorkspaceNav from '../common/WorkspaceNav';
import { AuthContext } from '../../context/AuthContext';
import { studentDoors } from '../../data/studentNavigation';
import { getAllGradesSummary } from '../../utils/gradeSummary';
import { getDisplayName, getInitials } from '../../utils/userDisplay';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';

const ACCOUNT_LINKS = [];
const BELL =
  'flex h-11 w-11 items-center justify-center rounded-xl text-nav-muted transition-colors hover:bg-nav-page hover:text-nav-ink';
const MENU_ROW =
  'flex min-h-[44px] w-full items-center gap-2 rounded-xl px-3 text-start font-inter text-sm font-bold text-nav-ink hover:bg-nav-page';

/**
 * The student's menu: the four doors of `data/studentNavigation.js` in the shared `WorkspaceNav`.
 *
 * The access state follows the SERVER (`usePremiumStatus`), never a guess: an invitation to enter a card code for who
 * has no access yet, a plain state for who has it, and nothing while the answer has not arrived. Both sit in the
 * account menu. The logo is a mark, not a link: a workspace is not left by its own title.
 */
export default function StudentNavbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { isPremium, canSeeUpgrade } = usePremiumStatus();
  const grade = user?.grade ? getAllGradesSummary().find((g) => g.id === user.grade) : null;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <WorkspaceNav
      account="student"
      doors={studentDoors}
      accountLinks={ACCOUNT_LINKS}
      identity={{ name: getDisplayName(user), initials: getInitials(user), sub: grade?.name }}
      access={isPremium ? 'full' : canSeeUpgrade ? 'invite' : null}
      onLogout={handleLogout}
      // « Ton professeur a corrigé ta réponse » : the bell, in the application only.
      tools={(direction) => (
        <NotificationBell direction={direction} align={direction === 'up' ? 'start' : 'end'} className={BELL} />
      )}
      menuExtra={<SettingsButton className={MENU_ROW} iconSize={16} testId="sidebar" />}
    />
  );
}
