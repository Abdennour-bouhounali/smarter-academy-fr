import { useCallback, useContext, useState } from 'react';
import { Mail } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import { AdminPage, formatDate, Num, input } from '../adminUi';
import DataTable from '../../../components/admin/ui/DataTable';
import { EmptyState } from '../../../components/admin/ui/states';
import { FilterBar, SelectFilter, Pagination } from '../../../components/admin/ui/FilterBar';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { fetchBookMessages, updateBookMessage } from '../../../features/books/bookService';
import { S } from '../../../features/books/strings';

const A = S.admin;
const C = S.contact;

/** « رسائل الكتب » : la boîte de réception des pages livres. */
export default function AdminBookMessages() {
  useDocumentMeta(A.messagesTitle);
  const { token } = useContext(AuthContext);
  const [status, setStatus] = useState();
  const [page, setPage] = useState(1);
  const loader = useCallback((t) => fetchBookMessages(t, { status, page }), [status, page]);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  const change = async (id, body) => { await updateBookMessage(token, id, body); reload(); };
  const meta = data ? { current_page: data.page, last_page: data.lastPage, total: data.total, from: (data.page - 1) * 20 + 1, to: Math.min(data.page * 20, data.total) } : null;

  return (
    <AdminPage eyebrow={A.eyebrow} title={A.messagesTitle} subtitle={A.messagesSubtitle}>
      <div className="space-y-3">
        <FilterBar>
          <SelectFilter value={status} onChange={(v) => { setStatus(v); setPage(1); }} label={A.columns.status} options={Object.entries(A.msgStatus).map(([value, label]) => ({ value, label }))} />
        </FilterBar>
        <DataTable
          rows={data?.messages ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          empty={<EmptyState icon={Mail} title={A.noMessages} />}
          columns={[
            { key: 'sender', label: A.sender, render: (m) => (<div><span className="font-semibold text-slate-900">{m.fullName}</span><a href={`mailto:${m.email}`} dir="ltr" className="block text-xs text-blue-600 hover:underline">{m.email}</a>{m.phone && <Num className="block text-xs text-slate-500">{m.phone}</Num>}</div>) },
            { key: 'subject', label: A.subject, render: (m) => (<div><span>{C.subjects[m.subject] ?? m.subject}</span><span className="block text-xs text-slate-500">{C.roles[m.role] ?? m.role}{m.bookOwner ? ' · ' + C.bookOwner : ''}</span></div>) },
            { key: 'message', label: A.messageCol, render: (m) => <span className="line-clamp-3 max-w-md whitespace-pre-line text-slate-700">{m.message}</span> },
            { key: 'status', label: A.columns.status, render: (m) => (
              <select aria-label={A.columns.status} value={m.status} onChange={(e) => change(m.id, { status: e.target.value })} className={`${input} !w-auto !py-1 text-xs`}>
                {Object.entries(A.msgStatus).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            ) },
            { key: 'date', label: A.columns.date, render: (m) => <span className="whitespace-nowrap text-slate-500">{formatDate(m.createdAt, { withTime: true })}</span> },
          ]}
        />
        <Pagination meta={meta} onPage={setPage} />
      </div>
    </AdminPage>
  );
}
