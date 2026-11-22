import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCircle2, XCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/notificationService';

/**
 * Plusieurs cloches peuvent être montées (barre latérale + en-tête mobile) :
 * après un « lu », chacune se relit sur cet événement.
 */
const NOTIFICATIONS_CHANGED = 'sa:notifications-changed';

/**
 * UNE requête pour toutes les cloches montées. La barre latérale et l'en-tête
 * mobile montent chacun la leur (l'une masquée par CSS) : chacune relisait à
 * l'ouverture, toutes les 2 minutes et au retour sur l'onglet — deux appels
 * identiques à chaque fois (mesuré le 2026-10-17). Un appel parti il y a moins
 * de SHARE_MS est partagé ; un « lu » (NOTIFICATIONS_CHANGED) force une relecture.
 */
const SHARE_MS = 5000;
let shared = null; // { token, at, promise }

function loadNotifications(token, { force = false } = {}) {
  const now = Date.now();
  if (!force && shared && shared.token === token && now - shared.at < SHARE_MS) return shared.promise;
  const promise = fetchNotifications(token);
  shared = { token, at: now, promise };
  promise.catch(() => { if (shared?.promise === promise) shared = null; });
  return promise;
}

/** Où mène une notification (null : rien à ouvrir). */
function notificationTarget(notification) {
  if (notification?.type === 'answer_reviewed' && notification.data?.reviewId) {
    return `/espace/tashih/${encodeURIComponent(notification.data.reviewId)}`;
  }
  return null;
}

/**
 * LA CLOCHE de l'élève (2026-10-06) — notifications DANS L'APPLICATION
 * seulement (aucun courriel, décision du propriétaire). Premier usage :
 * « صحّح أستاذك إجابتك » ; un appui ouvre EXACTEMENT l'exercice et l'étape
 * corrigés, en lecture seule (/espace/tashih/:reviewId).
 *
 * Relue à l'ouverture de la coquille, toutes les 2 minutes et au retour sur
 * l'onglet ; une panne garde l'état précédent (jamais un blocage).
 */
export default function NotificationBell({ className = '', align = 'start', direction = 'down' }) {
  const { t } = useTranslation('nav');
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [data, setData] = useState({ unread: 0, notifications: [] });
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  const refresh = useCallback((event) => {
    if (!token) return;
    // Après un « lu », la première cloche relit le serveur, les autres partagent sa réponse.
    const force = event?.type === NOTIFICATIONS_CHANGED && !(shared && Date.now() - shared.at < 300);
    loadNotifications(token, { force }).then((d) => setData({ unread: d.unread ?? 0, notifications: d.notifications ?? [] })).catch(() => {});
  }, [token]);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(() => refresh(), 120000);
    const onVisible = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener(NOTIFICATIONS_CHANGED, refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener(NOTIFICATIONS_CHANGED, refresh);
    };
  }, [refresh]);

  // Un appui hors du panneau, ou Échap, le referme.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const openNotification = async (n) => {
    setOpen(false);
    if (!n.read) {
      setData((d) => ({ unread: Math.max(0, d.unread - 1), notifications: d.notifications.map((x) => (x.id === n.id ? { ...x, read: true } : x)) }));
      markNotificationRead(token, n.id)
        .then(() => window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED)))
        .catch(() => {});
    }
    const target = notificationTarget(n);
    if (target) navigate(target);
  };

  const readAll = () => {
    setData((d) => ({ unread: 0, notifications: d.notifications.map((x) => ({ ...x, read: true })) }));
    markAllNotificationsRead(token)
      .then(() => window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED)))
      .catch(() => {});
  };

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`${t('notifications.open')} — ${t('notifications.unread', { count: data.unread })}`}
        title={t('notifications.title')}
        className={`relative ${className}`}
        data-notification-bell={data.unread}
      >
        <Bell size={15} aria-hidden="true" />
        {data.unread > 0 && (
          <span className="absolute -end-1 -top-1 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold leading-[1.1rem] text-white" data-unread-count>
            <bdi dir="ltr">{data.unread > 9 ? '9+' : data.unread}</bdi>
          </span>
        )}
      </button>
      {open && (
        <div
          className={`absolute z-50 w-72 max-w-[calc(100vw-2rem)] rounded-xl bg-white p-2 shadow-xl ring-1 ring-slate-200 ${align === 'end' ? 'end-0' : 'start-0'} ${direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'}`}
          role="dialog"
          aria-label={t('notifications.title')}
          data-notification-panel
        >
          <div className="mb-1 flex items-center justify-between gap-2 px-2 py-1">
            <p className="text-sm font-bold text-slate-900">{t('notifications.title')}</p>
            {data.unread > 0 && (
              <button type="button" onClick={readAll} className="text-xs font-semibold text-nav-accent hover:underline">{t('notifications.markAll')}</button>
            )}
          </div>
          {data.notifications.length === 0 && <p className="px-2 py-3 text-sm text-slate-500">{t('notifications.empty')}</p>}
          <ul className="max-h-80 space-y-1 overflow-y-auto">
            {data.notifications.map((n) => {
              const correct = n.data?.verdict === 'correct';
              const Icon = correct ? CheckCircle2 : XCircle;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => openNotification(n)}
                    className={`flex w-full items-start gap-2 rounded-lg px-2 py-2 text-start text-sm hover:bg-slate-50 ${n.read ? 'text-slate-600' : 'bg-indigo-50/60 font-semibold text-slate-900'}`}
                    data-notification={n.id}
                  >
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${correct ? 'text-emerald-600' : 'text-rose-600'}`} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      {t(`notifications.answerReviewed.${correct ? 'correct' : 'incorrect'}`)}
                      {n.createdAt && (
                        <span className="block text-[11px] font-normal text-slate-500">
                          {new Date(n.createdAt).toLocaleString('ar-DZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
