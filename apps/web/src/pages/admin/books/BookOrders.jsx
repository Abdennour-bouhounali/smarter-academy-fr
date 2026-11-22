import { useCallback, useContext, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PackageSearch } from 'lucide-react';
import { AdminPage, formatDate, Num } from '../adminUi';
import DataTable from '../../../components/admin/ui/DataTable';
import { EmptyState } from '../../../components/admin/ui/states';
import { FilterBar, SearchInput, SelectFilter, Pagination } from '../../../components/admin/ui/FilterBar';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { useDebounced } from '../../../hooks/useDebounced';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { fetchAdminBooks, fetchBookOrders, fetchBookOrderStats } from '../../../features/books/bookService';
import { S, formatDa } from '../../../features/books/strings';
import AdminNotifications from '../notifications/AdminNotifications';
import { AuthContext } from '../../../context/AuthContext';

const A = S.admin;
const options = (map) => Object.entries(map).map(([value, label]) => ({ value, label }));

export const ORDER_TONES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  in_way: 'bg-violet-50 text-violet-700 border-violet-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  returned: 'bg-rose-50 text-rose-700 border-rose-200',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
};
export const PAYMENT_TONES = {
  unpaid: 'bg-slate-100 text-slate-600 border-slate-200',
  partial: 'bg-amber-50 text-amber-700 border-amber-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  overpaid: 'bg-rose-50 text-rose-700 border-rose-200',
};

export function Pill({ tone, children }) {
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-inter text-xs font-semibold ${tone}`}>{children}</span>;
}

function Stat({ label, value, tone = 'text-slate-900' }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="font-inter text-xs font-semibold text-slate-500">{label}</p>
      <p dir="ltr" className={`mt-1 text-start font-space text-2xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}

/** « طلبات الكتب » : la liste et les chiffres du business des livres. */
export default function AdminBookOrders() {
  useDocumentMeta(A.ordersTitle);
  const { user } = useContext(AuthContext);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState();
  const [paymentStatus, setPaymentStatus] = useState();
  const [searchParams] = useSearchParams();
  const [bookId, setBookId] = useState(searchParams.get('bookId') ?? undefined);
  const [page, setPage] = useState(1);
  const q = useDebounced(search, 300);

  const loader = useCallback((token) => fetchBookOrders(token, { search: q, status, paymentStatus, bookId, page }), [q, status, paymentStatus, bookId, page]);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);
  const statsLoader = useCallback((token) => fetchBookOrderStats(token, { bookId }), [bookId]);
  const { data: stats } = useAdminResource(statsLoader, [statsLoader]);
  const booksLoader = useCallback((token) => fetchAdminBooks(token), []);
  const { data: booksData } = useAdminResource(booksLoader, [booksLoader]);

  const meta = data ? { current_page: data.page, last_page: data.lastPage, total: data.total, from: (data.page - 1) * 20 + 1, to: Math.min(data.page * 20, data.total) } : null;
  const reset = (setter) => (value) => { setter(value); setPage(1); };

  return (
    <AdminPage eyebrow={A.eyebrow} title={A.ordersTitle} subtitle={A.ordersSubtitle}>
      {/* Le gestionnaire de la librairie atterrit ici : ses notifications y sont. L'administrateur les a sur l'accueil. */}
      {user?.role === 'book_manager' && <AdminNotifications />}
      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label={A.stats.total} value={stats.totalOrders} />
          <Stat label={A.stats.pending} value={stats.byStatus.pending} tone="text-amber-600" />
          <Stat label={A.stats.inWay} value={stats.byStatus.in_way} tone="text-violet-600" />
          <Stat label={A.stats.delivered} value={stats.byStatus.delivered} tone="text-emerald-600" />
          <Stat label={A.stats.copies} value={stats.copiesDelivered} />
          <Stat label={A.stats.expected} value={formatDa(stats.expectedRevenue)} />
          <Stat label={A.stats.collected} value={formatDa(stats.collected)} tone="text-emerald-600" />
          <Stat label={A.stats.toCollect} value={formatDa(stats.toCollect)} tone={stats.toCollect > 0 ? 'text-rose-600' : undefined} />
        </div>
      )}

      <div className="space-y-3">
        <FilterBar>
          <SearchInput value={search} onChange={reset(setSearch)} placeholder={A.searchPlaceholder} />
          <SelectFilter value={bookId} onChange={reset(setBookId)} label={A.columns.book} allLabel={A.allBooks} options={(booksData?.books ?? []).map((b) => ({ value: String(b.id), label: b.title }))} />
          <SelectFilter value={status} onChange={reset(setStatus)} label={A.columns.status} allLabel={A.allStatuses} options={options(A.status)} />
          <SelectFilter value={paymentStatus} onChange={reset(setPaymentStatus)} label={A.columns.payment} allLabel={A.allPayments} options={options(A.payment)} />
        </FilterBar>

        <DataTable
          rows={data?.orders ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          empty={<EmptyState icon={PackageSearch} title={A.noOrders} />}
          columns={[
            { key: 'ref', label: A.columns.ref, render: (o) => <Link to={`/admin/livres/commandes/${o.id}`} className="whitespace-nowrap font-mono-jetbrains text-xs font-semibold text-violet-700 hover:underline"><Num>{o.reference}</Num></Link> },
            { key: 'customer', label: A.columns.customer, render: (o) => (<div><span className="font-semibold text-slate-900">{o.customerName}</span><Num className="block text-xs text-slate-500">{o.phone}</Num></div>) },
            { key: 'book', label: A.columns.book, render: (o) => o.book?.title ?? '—' },
            { key: 'wilaya', label: A.columns.wilaya, render: (o) => (<div>{o.wilaya}{o.deliveryMode && <span className="block text-[11px] text-slate-400">{A.deliveryModes[o.deliveryMode]}</span>}</div>) },
            { key: 'qty', label: A.columns.qty, render: (o) => <Num>{o.quantity}</Num> },
            { key: 'total', label: A.columns.total, render: (o) => (<div><Num className="whitespace-nowrap">{formatDa(o.total)}</Num>{o.deliveryFee === null && <span className="block text-[11px] text-slate-400">{A.deliveryPending}</span>}</div>) },
            { key: 'status', label: A.columns.status, render: (o) => <Pill tone={ORDER_TONES[o.status]}>{A.status[o.status]}</Pill> },
            { key: 'payment', label: A.columns.payment, render: (o) => <Pill tone={PAYMENT_TONES[o.paymentStatus]}>{A.payment[o.paymentStatus]}</Pill> },
            { key: 'date', label: A.columns.date, render: (o) => <span className="whitespace-nowrap text-slate-500">{formatDate(o.createdAt, { withTime: true })}</span> },
          ]}
        />
        <Pagination meta={meta} onPage={setPage} />
      </div>
    </AdminPage>
  );
}
