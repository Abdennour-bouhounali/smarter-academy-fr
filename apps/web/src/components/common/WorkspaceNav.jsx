import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, Crown, ShieldCheck } from 'lucide-react';
import TourReplayButton from '../../features/tours/TourReplayButton';
import { activeDoorId, doorPagesFor } from '../../data/doors';

/**
 * THE MENU OF A WORKSPACE — one component for the student and the teacher (NAVIGATION_REBUILD_PLAN.md).
 *
 *   tablet and laptop (≥ 768 px): a thin rail of 80 px on the start edge — the doors with their names, then the account;
 *   phone (< 768 px): a top bar (mark, account) and a bottom bar of the same doors.
 *
 * Same skeleton, two voices: ONE blue for both (owner, 2026-11-16: « the black is everywhere »): the student's lit door is soft blue, the teacher's is filled blue; dark navy is for text only. Only the nine `nav-*`
 * colours are used here — no gradient. The doors are DATA (`data/studentNavigation.js`, `data/teacherNavigation.js`).
 *
 * Hooks other code relies on, kept: `.sa-workspace-sidebar` and `aside` (hidden by full-screen pages),
 * `data-workspace-bar`, `data-tour="workspace.nav"`, `#app-header`, `data-nav-badge`.
 */
export { RAIL_WIDTH } from '../../context/WorkspaceLayoutContext';

const VOICE = {
  student: { on: 'bg-nav-accent-soft text-nav-accent', avatar: 'bg-nav-accent' },
  teacher: { on: 'bg-nav-accent text-white', avatar: 'bg-nav-accent' },
};
const TOOL =
  'flex h-11 w-11 items-center justify-center rounded-xl text-nav-muted transition-colors hover:bg-nav-page hover:text-nav-ink';

function Badge({ count, label, className = '' }) {
  if (!count) return null;
  return (
    <span
      className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-nav-alert px-1 text-[11px] font-bold leading-5 text-white ${className}`}
      aria-label={label}
      data-nav-badge="reviews"
    >
      <bdi dir="ltr">{count > 99 ? '99+' : count}</bdi>
    </span>
  );
}

function Door({ door, lit, voice, count, countLabel, layout }) {
  const { t } = useTranslation('nav');
  const shape =
    layout === 'rail'
      ? 'min-h-[64px] w-full rounded-2xl text-[13px]'
      : 'min-h-[52px] flex-1 rounded-2xl text-[12px] mx-0.5 my-1.5';
  return (
    <Link
      to={door.path}
      aria-current={lit ? 'page' : undefined}
      data-door={door.id}
      className={`flex flex-col items-center justify-center gap-0.5 font-inter font-bold transition-colors ${shape} ${
        lit ? voice.on : 'text-nav-muted hover:bg-nav-page hover:text-nav-ink'
      }`}
    >
      <span className="relative">
        <door.icon size={layout === 'rail' ? 24 : 22} aria-hidden="true" />
        {door.badge && <Badge count={count} label={countLabel} className="absolute -end-3 -top-1.5" />}
      </span>
      {t(door.labelKey)}
    </Link>
  );
}

/** The account under the person's picture: profile and account pages, the access state, sign out. */
function AccountMenu({ account, identity, links, access, onLogout, placement, extra }) {
  const { t } = useTranslation('nav');
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (event.key === 'Escape' || (event.type === 'pointerdown' && !box.current?.contains(event.target)))
        setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);
  const row =
    'flex min-h-[44px] w-full items-center gap-2 rounded-xl px-3 text-start font-inter text-sm font-bold text-nav-ink hover:bg-nav-page';
  return (
    <div className="relative" ref={box}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('accountMenu')}
        title={identity.name}
        data-account-menu
        className={`flex h-11 w-11 items-center justify-center rounded-full font-space text-sm font-bold text-white ${VOICE[account].avatar}`}
      >
        {identity.initials}
      </button>
      {open && (
        <div
          role="menu"
          data-account-menu-panel
          className={`absolute z-50 w-64 rounded-2xl border border-nav-line bg-white p-2 shadow-lg ${
            placement === 'rail' ? 'bottom-0 start-full ms-3' : 'end-0 top-full mt-2'
          }`}
        >
          <div className="border-b border-nav-line px-3 pb-2 pt-1">
            <p className="truncate font-space text-sm font-bold text-nav-ink">{identity.name}</p>
            {identity.sub && <p className="truncate font-inter text-xs font-semibold text-nav-muted">{identity.sub}</p>}
          </div>
          {links.map((link) => (
            <Link key={link.path} to={link.path} role="menuitem" className={row}>
              {t(link.labelKey)}
            </Link>
          ))}
          {access === 'invite' && (
            <Link to="/espace/activation" role="menuitem" className={`${row} !text-[#8a5a00]`} data-access-invite>
              <Crown size={16} aria-hidden="true" />
              {t('activation')}
            </Link>
          )}
          {access === 'full' && (
            <p className={`${row} !text-nav-done hover:!bg-transparent`}>
              <ShieldCheck size={16} aria-hidden="true" />
              {t('fullAccess')}
            </p>
          )}
          {extra}
          <button
            type="button"
            onClick={onLogout}
            role="menuitem"
            className={`${row} border-t border-nav-line !text-nav-alert`}
          >
            <LogOut size={16} aria-hidden="true" />
            {t('logout')}
          </button>
        </div>
      )}
    </div>
  );
}

export default function WorkspaceNav({
  account,
  doors,
  accountLinks,
  identity,
  counts = {},
  access = null,
  onLogout,
  tools = null,
  menuExtra = null,
}) {
  const { t } = useTranslation('nav');
  const { pathname } = useLocation();
  const lit = activeDoorId(doors, pathname, accountLinks);
  const voice = VOICE[account];
  const countLabel = t('notifications.pendingReviews', { count: counts.reviews ?? 0 });
  const door = (item, layout) => (
    <Door
      key={item.id}
      door={item}
      lit={item.id === lit}
      voice={voice}
      count={counts[item.badge]}
      countLabel={countLabel}
      layout={layout}
    />
  );
  const menu = (placement) => (
    <AccountMenu
      account={account}
      identity={identity}
      links={accountLinks}
      access={access}
      onLogout={onLogout}
      placement={placement}
      extra={menuExtra}
    />
  );
  const replay = <TourReplayButton className={`${TOOL} disabled:opacity-40`} iconSize={18} />;

  return (
    <>
      <aside
        className="sa-workspace-sidebar fixed bottom-0 start-0 top-0 z-40 hidden w-20 flex-col border-e border-nav-line bg-white md:flex"
        data-workspace-rail={account}
      >
        <div className="flex h-16 flex-shrink-0 items-center justify-center">
          <img
            src="/brand/mark-color.svg"
            width="200"
            height="200"
            decoding="async"
            alt="Smarter Academy"
            className="h-9 w-9"
          />
        </div>
        <nav className="flex flex-1 flex-col gap-1.5 px-2 py-2" data-tour="workspace.nav">
          {doors.map((item) => door(item, 'rail'))}
        </nav>
        <div className="flex flex-shrink-0 flex-col items-center gap-1 pb-3">
          {tools?.('up')}
          {replay}
          {menu('rail')}
        </div>
      </aside>

      <header
        id="app-header"
        data-workspace-bar="top"
        className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-nav-line bg-white px-3 md:hidden"
      >
        <div className="flex min-w-0 items-center gap-2">
          <img
            src="/brand/mark-color.svg"
            width="200"
            height="200"
            decoding="async"
            alt="Smarter Academy"
            className="h-8 w-8 flex-shrink-0"
          />
          <span className="truncate font-inter text-sm font-bold text-nav-ink">{identity.sub || identity.name}</span>
        </div>
        <div className="flex items-center gap-1">
          {tools?.('down')}
          {replay}
          {menu('bar')}
        </div>
      </header>

      <nav
        data-workspace-bar="bottom"
        data-tour="workspace.nav"
        className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch border-t border-nav-line bg-white px-1 md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {doors.map((item) => door(item, 'bar'))}
      </nav>
    </>
  );
}

/**
 * The pages behind the door you are in, as ONE line at the top of the page (it slides on a narrow screen). Shown only
 * on the door's own pages, so a tool that fills the screen (whiteboard, a lesson) is never pushed down by it.
 */
export function DoorTabs({ account, doors, counts = {} }) {
  const { t } = useTranslation('nav');
  const { pathname } = useLocation();
  const pages = doorPagesFor(doors, pathname);
  if (!pages.length) return null;
  const voice = VOICE[account];
  return (
    <nav
      aria-label={t('doorPages')}
      data-door-tabs
      className="sa-page flex gap-2 overflow-x-auto pt-4 md:pt-6 [scrollbar-width:none]"
    >
      {pages.map((page) => {
        const here = page.path === pathname;
        return (
          <Link
            key={page.path}
            to={page.path}
            aria-current={here ? 'page' : undefined}
            className={`inline-flex min-h-[44px] flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 font-inter text-sm font-bold transition-colors ${
              here ? `border-transparent ${voice.on}` : 'border-nav-line bg-white text-nav-muted hover:text-nav-ink'
            }`}
          >
            {t(page.labelKey)}
            {page.badge && (
              <Badge
                count={counts[page.badge]}
                label={t('notifications.pendingReviews', { count: counts[page.badge] ?? 0 })}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
