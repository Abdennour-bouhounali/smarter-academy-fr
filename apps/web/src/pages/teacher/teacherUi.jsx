import { useTranslation } from 'react-i18next';
import { Loader2, AlertTriangle, ChevronDown } from 'lucide-react';

/**
 * Le petit chrome partagé des pages enseignant — en-tête, états, libellés
 * arabes pour le kit de tableaux. Tout vient du catalogue `teacher`.
 */
export function TeacherPage({ eyebrow, title, subtitle, actions, children }) {
  return (
    <div className="sa-page py-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          {eyebrow && <p className="mb-1 font-inter text-sm font-bold text-nav-muted">{eyebrow}</p>}
          <h1 className="font-space text-2xl font-bold text-nav-ink sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 max-w-2xl font-inter text-sm font-semibold text-nav-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

/**
 * A part of a page that is ONE tap away instead of always open — settings, a long list, a history. Reduce what shows
 * at once, never delete: the content stays in the page (a native <details>), so it prints and is found by search.
 */
export function Fold({ title, hint, icon: Icon, defaultOpen = false, name, children }) {
  return (
    <details
      className="group overflow-hidden rounded-2xl border border-nav-line bg-white"
      open={defaultOpen}
      data-fold={name}
    >
      <summary className="flex min-h-[52px] cursor-pointer list-none items-center gap-2.5 px-4 [&::-webkit-details-marker]:hidden">
        {Icon && <Icon size={17} className="shrink-0 text-nav-muted" aria-hidden="true" />}
        <span className="min-w-0 flex-1">
          <span className="block font-space text-sm font-bold text-nav-ink">{title}</span>
          {hint && <span className="block truncate font-inter text-xs font-semibold text-nav-muted">{hint}</span>}
        </span>
        <ChevronDown
          size={16}
          className="shrink-0 text-nav-muted transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="border-t border-nav-line p-4">{children}</div>
    </details>
  );
}

export function Loading({ label }) {
  const { t } = useTranslation('teacher');
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-500" role="status">
      <Loader2 size={20} className="animate-spin" />
      <span className="font-inter text-sm">{label ?? t('common.loading')}</span>
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  const { t } = useTranslation('teacher');
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-center" role="alert">
      <AlertTriangle size={20} className="mx-auto mb-2 text-rose-600" />
      <p className="font-inter text-sm text-rose-800">{message || t('common.error')}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
        >
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}

/** Les libellés arabes du kit (DataTable, Pagination, ConfirmDialog). */
export function useTableLabels() {
  const { t } = useTranslation('teacher');
  return {
    table: {
      emptyTitle: t('common.emptyTitle'),
      emptyHint: t('common.emptyHint'),
      unselectAll: t('common.unselectAllPage'),
      selectAll: (count) => t('common.selectAllPage', { count }),
      retry: t('common.retry'),
      loading: t('common.loading'),
    },
    pagination: {
      range: (from, to, total) => t('common.rangeOf', { from, to, total }),
      previous: t('common.previous'),
      next: t('common.next'),
    },
    dialog: {
      cancelLabel: t('common.cancel'),
      busyLabel: t('common.busy'),
      closeLabel: t('common.close'),
    },
  };
}

export const btnPrimary =
  'inline-flex items-center gap-1.5 min-h-[44px] rounded-xl bg-nav-accent px-4 py-2.5 font-inter text-sm font-bold text-white hover:bg-[#3350c4] disabled:opacity-60 disabled:cursor-not-allowed';
export const btnSecondary =
  'inline-flex items-center gap-1.5 min-h-[44px] rounded-xl border-[1.5px] border-nav-accent bg-white px-4 py-2.5 font-inter text-sm font-bold text-nav-accent hover:bg-nav-accent-soft disabled:opacity-60';
export const btnDanger =
  'inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 font-inter text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60';
export const input =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-inter text-sm text-slate-800 focus:border-nav-accent focus:outline-none focus:ring-1 focus:ring-nav-accent';

export function formatDate(iso, locale = 'ar-DZ') {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}
