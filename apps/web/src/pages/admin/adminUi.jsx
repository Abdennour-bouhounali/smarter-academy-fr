import { useTranslation } from 'react-i18next';
import { Loader2, AlertTriangle } from 'lucide-react';

/**
 * LE CHROME PARTAGÉ DU PANNEAU D'ADMINISTRATION — arabe, RTL, et bâti sur le
 * MÊME système visuel que l'espace élève.
 *
 * Jumeau délibéré de `pages/teacher/teacherUi.jsx` : l'espace enseignant avait
 * déjà résolu ce problème (un espace arabe posé sur la coquille élève, dont
 * toutes les chaînes viennent d'un catalogue i18n et qui surcharge les défauts
 * français du kit). On ne réinvente pas ce patron ici, on l'étend au troisième
 * rôle — c'est exactement l'arborescence que vise le contrat :
 *
 *     Système de design DZ
 *       ├── espace élève      (bleu → violet)
 *       ├── espace enseignant (sarcelle → bleu)
 *       └── panneau d'admin   (violet → bleu)
 *
 * et non trois identités visuelles sans rapport.
 *
 * L'ACCENT distingue le rôle, il ne change PAS le système : mêmes rayons,
 * mêmes ombres, même échelle typographique, même gouttière `.sa-page`, mêmes
 * jetons sémantiques (emerald = succès, rose = erreur, amber = attention).
 * Un administrateur qui passe de « مساحة التلميذ » à « لوحة الإدارة »
 * reconnaît le produit ; seule la densité d'information change.
 */

/** Le dégradé du rôle — l'accent violet du système, jamais une teinte inventée. */
export const ADMIN_GRADIENT = 'linear-gradient(135deg, #8B5CF6, #3B82F6)';

/**
 * L'en-tête commun d'un écran d'administration : sur-titre, titre, sous-titre,
 * et une zone d'actions. Même composition que `TeacherPage` et que l'en-tête
 * de « تقدّمي » (Progression.jsx), au sur-titre près, qui porte l'accent du
 * rôle.
 */
export function AdminPage({ eyebrow, title, subtitle, actions, children }) {
  return (
    <div className="sa-page py-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          {eyebrow && (
            <p className="mb-1 font-mono-jetbrains text-xs font-semibold uppercase tracking-widest text-violet-600">
              {eyebrow}
            </p>
          )}
          <h1 className="font-space text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 max-w-2xl font-inter text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {children}
    </div>
  );
}

/** Une section titrée — le rythme vertical des pages élève (`space-y-8`). */
export function AdminSection({ title, actions, children, className = '' }) {
  return (
    <section className={className}>
      {(title || actions) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="font-space text-lg font-bold text-slate-900">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * LA CARTE DE L'ADMINISTRATION — la carte de l'espace élève, sans exception.
 * Fond blanc, bordure `slate-200`, rayon `xl`, et c'est tout : une carte
 * d'administration ne doit jamais peser visuellement plus qu'une carte élève.
 */
export function AdminCard({ title, actions, children, className = '' }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 ${className}`}>
      {(title || actions) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title && <h3 className="font-space text-sm font-bold text-slate-900">{title}</h3>}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}

export function Loading({ label, rows = 0 }) {
  const { t } = useTranslation('admin');

  if (rows > 0) {
    return (
      <div className="space-y-2" role="status" aria-label={label ?? t('common.loading')}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-500" role="status">
      <Loader2 size={20} className="animate-spin" />
      <span className="font-inter text-sm">{label ?? t('common.loading')}</span>
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  const { t } = useTranslation('admin');
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-center" role="alert">
      <AlertTriangle size={20} className="mx-auto mb-2 text-rose-600" />
      <p className="font-inter text-sm text-rose-800">{message || t('common.error')}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg border border-rose-300 bg-white px-4 py-2 font-inter text-sm font-semibold text-rose-700 hover:bg-rose-100"
        >
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}

/**
 * Les libellés arabes du kit (DataTable, Pagination, ConfirmDialog, FilterBar).
 *
 * Le kit garde ses défauts FRANÇAIS — ils restent le filet de sécurité d'un
 * appelant qui n'en passerait pas — mais aucun écran ne s'en contente : chaque
 * page d'administration passe ceux-ci, exactement comme `useTableLabels` du
 * côté enseignant. Le contrat (`adminContract.test.js`) le vérifie sur la
 * source.
 */
export function useAdminLabels() {
  const { t } = useTranslation('admin');
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
      confirmLabel: t('common.confirm'),
    },
    filters: {
      searchPlaceholder: t('common.search'),
      searchLabel: t('common.searchLabel'),
      allLabel: t('common.all'),
    },
    selectRow: (title) => t('common.selectRow', { title }),
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   LES BOUTONS — le même langage que l'espace élève et l'espace enseignant.

   Hauteur, rayon (`xl`), graisse, espacement d'icône : identiques. Seule la
   couleur primaire porte l'accent du rôle (violet), comme le sarcelle porte
   celui de l'enseignant. Les états `disabled` et l'anneau de focus sont
   décrits ici plutôt que réécrits sur chaque page.
   ───────────────────────────────────────────────────────────────────────── */
const BTN_BASE = 'inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 font-inter text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed';

export const btnPrimary = `${BTN_BASE} bg-violet-600 text-white hover:bg-violet-700 focus-visible:ring-violet-500`;
export const btnSecondary = `${BTN_BASE} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400`;
export const btnDanger = `${BTN_BASE} border border-rose-200 bg-white px-3 py-2 text-xs text-rose-700 hover:bg-rose-50 focus-visible:ring-rose-400`;
export const btnGhost = `${BTN_BASE} px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400`;

export const input = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-inter text-sm text-slate-800 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500';
export const label = 'block mb-1 font-inter text-xs font-semibold text-slate-600';

/**
 * Les dates du panneau, en arabe algérien.
 *
 * `ar-DZ` et non `fr-FR` : une date affichée dans une interface arabe se lit
 * en arabe. Les CHIFFRES restent occidentaux — c'est la convention de la
 * plateforme (le programme algérien les utilise), et `ar-DZ` les rend ainsi
 * par défaut.
 */
export function formatDate(iso, { withTime = false } = {}) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ar-DZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

/**
 * Un nombre dans une phrase arabe. `dir="ltr"` + `unicode-bidi: isolate` par
 * l'attribut : « 3 / 10 » ne doit pas se retourner en « 10 / 3 » au milieu
 * d'un texte RTL — le même soin que `.sa-math-inline` prend pour les
 * expressions mathématiques.
 */
export function Num({ children, className = '' }) {
  return <span dir="ltr" className={`inline-block ${className}`}>{children}</span>;
}
