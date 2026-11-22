import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { loadBooks, peekBooks, prefetchBookPage } from './bookCache';
import { S, formatDa } from './strings';

/** `/books` — le catalogue public. Le premier livre y est déjà ; les suivants s'y ajoutent seuls. */
export default function BooksPage() {
  useDocumentMeta(S.list.metaTitle, S.list.metaDescription);
  const [books, setBooks] = useState(() => peekBooks()?.books ?? null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    loadBooks().then((d) => alive && setBooks(d.books)).catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, []);

  return (
    <div className="min-h-screen pt-16">
      <section className="px-4 py-14 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700">
            <BookOpen size={14} />{S.list.eyebrow}
          </div>
          <h1 className="font-space text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">{S.list.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl font-inter text-lg leading-relaxed text-slate-600">{S.list.subtitle}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        {error && <p role="alert" className="text-center font-inter text-rose-600">{error}</p>}
        {books && books.length === 0 && <p className="text-center font-inter text-slate-500">{S.list.empty}</p>}
        {/* Squelette à la forme des cartes : la page ne saute pas quand elles arrivent. */}
        {!books && !error && (
          <div aria-busy="true" className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white">
                <div className="aspect-[4/3] animate-pulse bg-slate-100" />
                <div className="space-y-3 p-6">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                  <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {books?.map((book) => (
            <Link
              key={book.id}
              to={`/books/${book.slug}`}
              onPointerEnter={() => prefetchBookPage(book.slug)}
              onFocus={() => prefetchBookPage(book.slug)}
              className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                {book.coverImage && <img src={book.coverImage} alt={book.title} loading="lazy" decoding="async" className="h-full w-auto rounded-md object-contain shadow-xl transition group-hover:scale-105" />}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-space text-xl font-bold leading-snug text-slate-900">{book.title}</h2>
                {book.subtitle && <p className="mt-1 font-inter text-sm text-slate-500">{book.subtitle}</p>}
                <div className="mt-auto flex items-center justify-between pt-5">
                  <span dir="ltr" className="font-space text-2xl font-bold text-blue-700">{formatDa(book.price)}</span>
                  <span className="rounded-xl bg-slate-900 px-4 py-2 font-inter text-sm font-semibold text-white">{S.list.seeBook}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
