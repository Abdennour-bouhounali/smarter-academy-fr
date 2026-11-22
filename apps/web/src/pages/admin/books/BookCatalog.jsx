import { useCallback, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Plus } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import { AdminPage, formatDate, Num, btnPrimary, btnSecondary, input, label } from '../adminUi';
import DataTable from '../../../components/admin/ui/DataTable';
import Modal from '../../../components/admin/ui/Modal';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { fetchAdminBooks, saveAdminBook } from '../../../features/books/bookService';
import { S, formatDa } from '../../../features/books/strings';
import { Pill } from './BookOrders';

const A = S.admin;
const BLANK = { slug: '', title: '', subtitle: '', author: '', summary: '', price: 0, coverImage: '', status: 'draft', sortOrder: 0, content: {}, gallery: [] };

/** « الكتب » : la fiche de chaque livre — prix, publication, contenu de sa page. */
export default function AdminBookCatalog() {
  useDocumentMeta(A.catalogTitle);
  const { token } = useContext(AuthContext);
  const loader = useCallback((t) => fetchAdminBooks(t), []);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  const [editing, setEditing] = useState(null); // null | livre | BLANK
  const [json, setJson] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);

  const open = (book) => {
    setEditing(book);
    setJson(JSON.stringify({ content: book.content ?? {}, gallery: book.gallery ?? [] }, null, 2));
    setProblem(null);
  };
  const set = (key) => (e) => setEditing((b) => ({ ...b, [key]: e.target.value }));

  const save = async (event) => {
    event.preventDefault();
    let extra;
    try { extra = JSON.parse(json || '{}'); } catch { setProblem(A.invalidJson); return; }
    setBusy(true);
    setProblem(null);
    try {
      await saveAdminBook(token, editing.id, {
        slug: editing.slug, title: editing.title, subtitle: editing.subtitle || null, author: editing.author || null,
        summary: editing.summary || null, price: Number(editing.price), coverImage: editing.coverImage || null,
        status: editing.status, sortOrder: Number(editing.sortOrder) || 0,
        content: extra.content ?? {}, gallery: extra.gallery ?? [],
      });
      setEditing(null);
      reload();
    } catch (caught) {
      setProblem(caught.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminPage
      eyebrow={A.eyebrow}
      title={A.catalogTitle}
      subtitle={A.catalogSubtitle}
      actions={<button type="button" className={btnPrimary} onClick={() => open(BLANK)}><Plus size={14} />{A.newBook}</button>}
    >
      <DataTable
        rows={data?.books ?? []}
        loading={loading}
        error={error}
        onRetry={reload}
        onRowClick={open}
        columns={[
          { key: 'title', label: A.bookTitle, render: (b) => <span className="font-semibold text-slate-900">{b.title}</span> },
          { key: 'price', label: A.price, render: (b) => <Num>{formatDa(b.price)}</Num> },
          { key: 'status', label: '', render: (b) => <Pill tone={b.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}>{b.status === 'published' ? A.published : A.draft}</Pill> },
          { key: 'orders', label: A.ordersCount, render: (b) => <Link to={`/admin/livres/commandes?bookId=${b.id}`} onClick={(e) => e.stopPropagation()} className="text-violet-700 hover:underline"><Num>{b.ordersCount}</Num></Link> },
          { key: 'updated', label: '', render: (b) => <span className="text-slate-500">{formatDate(b.updatedAt)}</span> },
          { key: 'public', label: '', render: (b) => b.status === 'published' && <a href={`/books/${b.slug}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-xs text-blue-700 hover:underline"><ExternalLink size={12} />{A.openPublic}</a> },
        ]}
      />

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? editing.title : A.newBook}
        size="lg"
        footer={(
          <>
            <button type="button" className={btnSecondary} onClick={() => setEditing(null)}>إلغاء</button>
            <button type="submit" form="book-form" disabled={busy} className={btnPrimary}>{A.save}</button>
          </>
        )}
      >
        {editing && (
          <form id="book-form" onSubmit={save} className="grid gap-4 md:grid-cols-2">
            {problem && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 font-inter text-sm text-rose-700 md:col-span-2">{problem}</p>}
            <div><label className={label}>{A.bookTitle}</label><input required className={input} value={editing.title} onChange={set('title')} /></div>
            <div><label className={label}>{A.slug}</label><input required dir="ltr" pattern="[a-z0-9]+(-[a-z0-9]+)*" className={input} value={editing.slug} onChange={set('slug')} /></div>
            <div><label className={label}>{A.bookSubtitle}</label><input className={input} value={editing.subtitle ?? ''} onChange={set('subtitle')} /></div>
            <div><label className={label}>{A.author}</label><input className={input} value={editing.author ?? ''} onChange={set('author')} /></div>
            <div><label className={label}>{A.price}</label><input required type="number" min="0" dir="ltr" className={input} value={editing.price} onChange={set('price')} /></div>
            <div>
              <label className={label}>الحالة</label>
              <select className={input} value={editing.status} onChange={set('status')}><option value="draft">{A.draft}</option><option value="published">{A.published}</option></select>
            </div>
            <div className="md:col-span-2"><label className={label}>{A.cover}</label><input dir="ltr" className={input} value={editing.coverImage ?? ''} onChange={set('coverImage')} /></div>
            <div className="md:col-span-2"><label className={label}>{A.summary}</label><textarea rows={3} className={input} value={editing.summary ?? ''} onChange={set('summary')} /></div>
            <div className="md:col-span-2">
              <label className={label}>{A.contentJson}</label>
              <textarea rows={10} dir="ltr" spellCheck={false} className={`${input} font-mono-jetbrains text-xs`} value={json} onChange={(e) => setJson(e.target.value)} />
              <p className="mt-1 font-inter text-xs text-slate-500">{A.contentJsonHint}</p>
            </div>
          </form>
        )}
      </Modal>
    </AdminPage>
  );
}
