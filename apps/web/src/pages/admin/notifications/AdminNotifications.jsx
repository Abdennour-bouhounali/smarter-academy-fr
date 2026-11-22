import { useContext, useEffect, useState } from 'react';
import { Bell, BellOff, BellRing, Loader2, Smartphone } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import { fetchPush, removePushSubscription, savePushSubscription, savePushTopics, testPush } from './pushApi';
import { P } from './strings';

/** La clé publique VAPID (base64url) → les octets attendus par `pushManager.subscribe`. */
function keyBytes(base64url) {
  const pad = '='.repeat((4 - (base64url.length % 4)) % 4);
  const raw = atob((base64url + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

const supported = () => typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
const isIos = () => typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);
const installed = () => typeof window !== 'undefined' && (window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true);

async function currentSubscription() {
  const reg = await navigator.serviceWorker.getRegistration('/');
  return (await reg?.pushManager.getSubscription()) ?? null;
}

/**
 * « الإشعارات على هاتفك » — active, sur CET appareil, une notification à chaque événement du
 * tableau de bord (nouvelle commande, inscription, message, بلاغ, demande d'offre) et laisse
 * choisir les sujets reçus (BOOKS_STORE.md §6quater). L'administrateur l'a sur l'accueil du
 * tableau de bord ; le « مسيّر المكتبة » sur « طلبات الكتب » (ses sujets : la librairie).
 * Le service worker `/sw.js` n'est enregistré qu'ici, au clic : jamais chez un élève.
 */
export default function AdminNotifications() {
  const { token } = useContext(AuthContext);
  const [server, setServer] = useState(null); // { enabled, publicKey, devices, topics, device }
  const [endpoint, setEndpoint] = useState(null);
  const [chosen, setChosen] = useState([]);
  const [permission, setPermission] = useState(() => (supported() ? Notification.permission : 'unsupported'));
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);

  const refresh = async (ep) => {
    const data = await fetchPush(token, ep);
    setServer(data);
    setChosen(data.device?.topics ?? data.topics ?? []);
  };

  useEffect(() => {
    if (!token) return;
    (async () => {
      let ep = null;
      if (supported()) ep = (await currentSubscription().catch(() => null))?.endpoint ?? null;
      setEndpoint(ep);
      await refresh(ep).catch(() => setServer({ enabled: false }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Chrome propose l'installation : on garde l'événement pour un vrai bouton.
  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  // Abonné = cet appareil a un abonnement que le serveur connaît pour ce compte.
  const subscribed = Boolean(endpoint && server?.device);

  const enable = async () => {
    setBusy(true); setNote(null);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') return;
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription())
        ?? await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(server.publicKey) });
      await savePushSubscription(token, sub.toJSON());
      setEndpoint(sub.endpoint);
      await refresh(sub.endpoint);
    } catch (e) {
      // Le navigateur refuse (permission, pas de service de notification) : un message arabe, la cause à côté.
      setNote(e?.name === 'NotAllowedError' ? P.denied : `${P.failed} (${e?.message || e})`);
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true); setNote(null);
    try {
      const sub = await currentSubscription();
      if (sub) {
        await removePushSubscription(token, sub.endpoint);
        await sub.unsubscribe();
      }
      setEndpoint(null);
      await refresh(null);
    } catch (e) {
      setNote(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (topic) => {
    const next = chosen.includes(topic) ? chosen.filter((t) => t !== topic) : [...chosen, topic];
    setChosen(next);
    setNote(null);
    try { await savePushTopics(token, endpoint, next); setNote(P.saved); } catch (e) { setNote(e?.message || String(e)); setChosen(chosen); }
  };

  const test = async () => {
    setBusy(true); setNote(null);
    try { await testPush(token); setNote(P.testSent); } catch (e) { setNote(e?.message || String(e)); } finally { setBusy(false); }
  };

  const install = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice.catch(() => null);
    setInstallPrompt(null);
  };

  let body;
  if (!supported()) body = <p className="text-slate-600">{isIos() && !installed() ? P.iosInstall : P.unsupported}</p>;
  else if (server && !server.enabled) body = <p className="text-slate-600">{P.notConfigured}</p>;
  else if (permission === 'denied') body = <p className="text-rose-700">{P.denied}</p>;
  else if (subscribed) {
    body = (
      <>
        <p className="text-slate-600">{P.on}</p>
        <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {(server.topics ?? []).map((topic) => (
            <label key={topic} className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl bg-white px-3 ring-1 ring-violet-100 hover:ring-violet-300">
              <input type="checkbox" checked={chosen.includes(topic)} onChange={() => toggle(topic)} className="h-4 w-4 accent-violet-600" />
              <span className="text-slate-800">{P.topics[topic] ?? topic}</span>
            </label>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={test} disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-violet-600 px-4 font-semibold text-white hover:bg-violet-700 disabled:opacity-60">
            <BellRing size={16} />{P.test}
          </button>
          <button type="button" onClick={disable} disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
            <BellOff size={16} />{P.disable}
          </button>
        </div>
      </>
    );
  } else {
    body = (
      <>
        <p className="text-slate-600">{P.off}</p>
        <div className="mt-3">
          <button type="button" onClick={enable} disabled={busy || !server?.publicKey} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-violet-600 px-4 font-semibold text-white hover:bg-violet-700 disabled:opacity-60">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}{P.enable}
          </button>
        </div>
      </>
    );
  }

  return (
    <section className="mb-6 rounded-2xl border border-violet-200 bg-violet-50/50 p-4 font-inter text-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-space text-base font-bold text-slate-900"><Bell size={18} className="text-violet-600" />{P.title}</h2>
        {server?.devices > 0 && <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-200">{P.devices(server.devices)}</span>}
      </div>
      <div className="mt-2">{body}</div>
      {note && <p className="mt-2 text-xs font-medium text-slate-700">{note}</p>}
      {!installed() && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-violet-100 pt-3 text-xs text-slate-500">
          <Smartphone size={14} className="flex-none" />
          {installPrompt
            ? <button type="button" onClick={install} className="min-h-9 rounded-lg bg-white px-3 font-semibold text-violet-700 ring-1 ring-violet-200 hover:bg-violet-50">{P.installButton}</button>
            : <span>{isIos() ? P.iosInstall : P.install}</span>}
        </div>
      )}
    </section>
  );
}
