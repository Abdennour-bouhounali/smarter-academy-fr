import { useCallback, useContext, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Phone, Trash2 } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import { AdminPage, AdminCard, formatDate, Num, btnPrimary, btnSecondary, btnDanger, input, label } from '../adminUi';
import { ConfirmDialog } from '../../../components/admin/ui/Modal';
import { LoadingState, ErrorState } from '../../../components/admin/ui/states';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import {
  fetchBookOrder, updateBookOrder, updateBookOrderStatus,
  addBookOrderPayment, removeBookOrderPayment, deleteBookOrder,
} from '../../../features/books/bookService';
import { S, formatDa } from '../../../features/books/strings';
import { DELIVERY_MODES } from '../../../features/books/delivery';
import { Pill, ORDER_TONES, PAYMENT_TONES } from './BookOrders';

const A = S.admin;

/** La fiche d'une commande : état, livraison, paiements, historique. */
export default function AdminBookOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const loader = useCallback((t) => fetchBookOrder(t, id), [id]);
  const { data, loading, error, reload, setData } = useAdminResource(loader, [loader]);
  useDocumentMeta(data?.order ? `${A.ordersTitle} ${data.order.reference}` : A.ordersTitle);

  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);
  const [fee, setFee] = useState(null);
  const [note, setNote] = useState(null);
  const [mode, setMode] = useState(null);
  const [pay, setPay] = useState({ kind: 'payment', amount: '', method: 'cash_on_delivery', note: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (loading) return <AdminPage title={A.ordersTitle}><LoadingState rows={6} /></AdminPage>;
  if (error || !data) return <AdminPage title={A.ordersTitle}><ErrorState message={error} onRetry={reload} /></AdminPage>;
  const o = data.order;

  const run = async (action) => {
    setBusy(true);
    setProblem(null);
    try {
      const result = await action();
      if (result?.order) setData({ order: result.order });
      return true;
    } catch (caught) {
      setProblem(caught.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const feeValue = fee ?? (o.deliveryFee ?? '');
  const noteValue = note ?? (o.adminNote ?? '');
  // `deliveryMode` est null sur les commandes d'avant le tarif par wilaya ; envoyé seulement s'il a changé.
  // Le serveur ne recalcule PAS le frais quand le mode change : l'administrateur le corrige à côté.
  const modeValue = mode ?? (o.deliveryMode ?? '');
  const saveDetails = () => run(() => updateBookOrder(token, o.id, {
    deliveryFee: feeValue === '' ? null : Number(feeValue),
    adminNote: noteValue,
    ...(mode !== null ? { deliveryMode: mode === '' ? null : mode } : {}),
  })).then((ok) => { if (ok) { setFee(null); setNote(null); setMode(null); } });

  const submitPayment = async (event) => {
    event.preventDefault();
    const ok = await run(() => addBookOrderPayment(token, o.id, { ...pay, amount: Number(pay.amount), note: pay.note || null }));
    if (ok) setPay({ kind: 'payment', amount: '', method: 'cash_on_delivery', note: '' });
  };

  const remaining = Math.max(0, o.total - o.paidAmount);

  return (
    <AdminPage
      eyebrow={A.eyebrow}
      title={<Num>{o.reference}</Num>}
      subtitle={`${o.book?.title ?? ''} · ${formatDate(o.createdAt, { withTime: true })}`}
      actions={<Link to="/admin/livres/commandes" className={btnSecondary}>{A.back}</Link>}
    >
      {problem && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 font-inter text-sm text-rose-700">{problem}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* État */}
          <AdminCard title={A.columns.status}>
            <div className="flex flex-wrap items-center gap-3">
              <Pill tone={ORDER_TONES[o.status]}>{A.status[o.status]}</Pill>
              <Pill tone={PAYMENT_TONES[o.paymentStatus]}>{A.payment[o.paymentStatus]}</Pill>
              {o.allowedStatuses.length > 0 && <span className="font-inter text-xs text-slate-500">{A.nextStatus}:</span>}
              {o.allowedStatuses.map((next) => (
                <button key={next} type="button" disabled={busy} onClick={() => run(() => updateBookOrderStatus(token, o.id, next))} className={next === 'cancelled' || next === 'returned' ? btnDanger : btnPrimary}>
                  {A.status[next]}
                </button>
              ))}
            </div>
          </AdminCard>

          {/* Frais de livraison et note interne */}
          <AdminCard title={A.deliveryFee}>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className={label} htmlFor="dmode">{A.deliveryMode}</label>
                <select id="dmode" className={input} value={modeValue} onChange={(e) => setMode(e.target.value)}>
                  <option value="">—</option>
                  {DELIVERY_MODES.map((m) => <option key={m} value={m}>{A.deliveryModes[m]}</option>)}
                </select>
              </div>
              <div>
                <label className={label} htmlFor="fee">{A.deliveryFee}</label>
                <input id="fee" type="number" min="0" dir="ltr" placeholder={A.deliveryUnset} className={input} value={feeValue} onChange={(e) => setFee(e.target.value)} />
              </div>
              <div>
                <label className={label} htmlFor="anote">{A.adminNote}</label>
                <input id="anote" className={input} value={noteValue} onChange={(e) => setNote(e.target.value)} />
              </div>
            </div>
            <div className="mt-4"><button type="button" disabled={busy || (fee === null && note === null && mode === null)} onClick={saveDetails} className={btnPrimary}>{A.save}</button></div>
          </AdminCard>

          {/* Paiements */}
          <AdminCard title={A.payments}>
            <div className="mb-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-slate-50 p-3"><p className="font-inter text-xs text-slate-500">{A.columns.total}</p><Num className="font-space text-lg font-bold">{formatDa(o.total)}</Num></div>
              <div className="rounded-xl bg-emerald-50 p-3"><p className="font-inter text-xs text-emerald-700">{A.paid}</p><Num className="font-space text-lg font-bold text-emerald-700">{formatDa(o.paidAmount)}</Num></div>
              <div className="rounded-xl bg-amber-50 p-3"><p className="font-inter text-xs text-amber-700">{A.remaining}</p><Num className="font-space text-lg font-bold text-amber-700">{formatDa(remaining)}</Num></div>
            </div>

            {o.payments.length === 0 ? <p className="font-inter text-sm text-slate-500">{A.noPayments}</p> : (
              <ul className="mb-4 divide-y divide-slate-100">
                {o.payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 font-inter text-sm">
                    <span>
                      <span className={p.kind === 'refund' ? 'font-bold text-rose-600' : 'font-bold text-emerald-700'}>{A.kind[p.kind]} <Num>{formatDa(p.amount)}</Num></span>
                      <span className="text-slate-500"> · {A.method[p.method]} · {formatDate(p.receivedAt, { withTime: true })}{p.note ? ` · ${p.note}` : ''}</span>
                    </span>
                    <button type="button" disabled={busy} aria-label={A.remove} onClick={() => window.confirm(A.confirmRemovePayment) && run(() => removeBookOrderPayment(token, p.id))} className="text-slate-400 hover:text-rose-600"><Trash2 size={15} /></button>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={submitPayment} className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 xl:grid-cols-4">
              <select aria-label={A.addPayment} className={input} value={pay.kind} onChange={(e) => setPay({ ...pay, kind: e.target.value })}>
                {Object.entries(A.kind).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <input required type="number" min="1" dir="ltr" placeholder={A.amount} aria-label={A.amount} className={input} value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} />
              <select aria-label={A.method_} className={input} value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}>
                {Object.entries(A.method).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <input placeholder={A.paymentNote} aria-label={A.paymentNote} className={input} value={pay.note} onChange={(e) => setPay({ ...pay, note: e.target.value })} />
              <div className="col-span-2 flex justify-end xl:col-span-4"><button type="submit" disabled={busy} className={btnPrimary}>{A.addPayment}</button></div>
            </form>
          </AdminCard>

          {/* Historique */}
          <AdminCard title={A.history}>
            <ol className="space-y-2 font-inter text-sm">
              {o.events.map((e) => (
                <li key={e.id} className="flex flex-wrap gap-x-2 text-slate-700">
                  <span className="font-semibold">{A.event[e.type] ?? e.type}</span>
                  {(e.from || e.to) && (
                    <span className="text-slate-500">
                      {e.type === 'status' && `من ${A.status[e.from] ?? e.from} إلى ${A.status[e.to] ?? e.to}`}
                      {e.type === 'created' && (A.status[e.to] ?? e.to)}
                      {e.type === 'delivery_mode' && (A.deliveryModes[e.to] ?? '—')}
                      {['payment', 'refund', 'delivery_fee'].includes(e.type) && (e.to ? formatDa(e.to) : A.deliveryUnset)}
                    </span>
                  )}
                  <span className="text-slate-400">· {formatDate(e.createdAt, { withTime: true })}{e.by ? ` · ${e.by}` : ''}</span>
                </li>
              ))}
            </ol>
          </AdminCard>
        </div>

        {/* Colonne latérale : le client */}
        <div className="space-y-6">
          <AdminCard title={A.customer}>
            <p className="font-space text-lg font-bold text-slate-900">{o.customerName}</p>
            <a href={`tel:${o.phone}`} dir="ltr" className="mt-1 inline-flex items-center gap-2 font-inter text-sm font-semibold text-blue-700 hover:underline"><Phone size={14} />{o.phone}</a>
            {o.email && <a href={`mailto:${o.email}`} dir="ltr" className="block font-inter text-sm text-blue-700 hover:underline">{o.email}</a>}
            <dl className="mt-4 space-y-2 font-inter text-sm">
              <div><dt className="text-xs text-slate-500">{A.columns.wilaya}</dt><dd>{o.wilaya} — {o.commune}</dd></div>
              {/* Plus demandée depuis le 2026-11-13 : seules les commandes plus anciennes en ont une. */}
              {o.address && <div><dt className="text-xs text-slate-500">{A.address}</dt><dd>{o.address}</dd></div>}
              {o.customerNote && <div><dt className="text-xs text-slate-500">{A.customerNote}</dt><dd>{o.customerNote}</dd></div>}
            </dl>
          </AdminCard>
          <AdminCard title={A.columns.total}>
            <dl className="space-y-1.5 font-inter text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">{formatDa(o.unitPrice)} × {o.quantity}</dt><dd><Num>{formatDa(o.subtotal)}</Num></dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">{S.order.delivery}{o.deliveryMode && ` (${A.deliveryModes[o.deliveryMode]})`}</dt><dd>{o.deliveryFee === null ? A.deliveryUnset : <Num>{formatDa(o.deliveryFee)}</Num>}</dd></div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-bold"><dt>{A.columns.total}</dt><dd><Num>{formatDa(o.total)}</Num></dd></div>
            </dl>
          </AdminCard>
          {['cancelled', 'returned'].includes(o.status) && (
            <button type="button" onClick={() => setConfirmDelete(true)} className={btnDanger}><Trash2 size={14} />{A.deleteOrder}</button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={A.deleteOrder}
        message={A.confirmDelete}
        confirmLabel={A.deleteOrder}
        tone="danger"
        busy={busy}
        onConfirm={async () => { if (await run(() => deleteBookOrder(token, o.id))) navigate('/admin/livres/commandes'); }}
      />
    </AdminPage>
  );
}
