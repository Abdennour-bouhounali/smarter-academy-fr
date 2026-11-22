import { useTranslation } from 'react-i18next';
import { Loader2, AlertTriangle, Inbox, BarChart3 } from 'lucide-react';

/**
 * Les quatre états que CHAQUE écran d'administration doit savoir rendre
 * (spec §34) : chargement, vide, erreur, et « pas encore mesuré ».
 *
 * Regroupés ici pour qu'aucune page n'ait à réinventer un état vide — et
 * surtout pour qu'aucune n'échoue en silence.
 *
 * LES DÉFAUTS SONT ARABES, lus dans le catalogue `admin` plutôt qu'écrits en
 * dur : ces états sont le dernier endroit où une chaîne française pouvait
 * encore atteindre l'écran, précisément parce qu'ils s'affichent quand la
 * page n'a rien d'autre à dire. Un appelant garde la main (`label`, `message`,
 * `retryLabel`) — l'espace enseignant s'en sert déjà.
 */

export function LoadingState({ label, rows = 0 }) {
  const { t } = useTranslation('common');
  // `label` peut arriver `undefined` d'un appelant qui ne le connaît pas :
  // on garde alors le défaut plutôt qu'un attribut vide.
  label = label ?? t('ui.loading');
  // Des squelettes quand on sait combien de lignes arrivent : la page ne
  // saute pas au moment où les données remplacent le vide.
  if (rows > 0) {
    return (
      <div className="space-y-2" role="status" aria-label={label}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-500" role="status">
      <Loader2 size={20} className="animate-spin" />
      <span className="font-inter text-sm">{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry, retryLabel }) {
  const { t } = useTranslation('common');
  const retry = retryLabel ?? t('ui.retry');

  return (
    // `rose` et non `red` : c'est le jeton d'erreur du système (celui de
    // `btnDanger`, des pastilles `revoked`/`expired` et de l'espace
    // enseignant). `red-*` était la seule teinte d'erreur divergente du
    // panneau.
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center" role="alert">
      <AlertTriangle size={22} className="mx-auto mb-2 text-rose-600" />
      <p className="font-inter text-sm text-rose-800">{message || t('ui.error')}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg border border-rose-300 bg-white px-4 py-2 font-inter text-sm font-semibold text-rose-700 hover:bg-rose-100"
        >
          {retry}
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, hint, icon: Icon = Inbox, action }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-12 text-center">
      <Icon size={26} className="mx-auto mb-3 text-slate-400" />
      <p className="font-space font-bold text-slate-800">{title}</p>
      {hint && <p className="mt-1 font-inter text-sm text-slate-500 max-w-md mx-auto">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/**
 * « Pas encore mesuré » — à ne JAMAIS confondre avec zéro.
 *
 * Certaines mesures de la spec (vues, sessions, temps passé, abandon) n'ont
 * aucune source : il n'existe pas de table d'événements. Afficher 0 ferait
 * croire à une plateforme déserte ; cet état dit la vérité.
 */
export function MetricUnavailable({ label, reason = 'no_tracking', compact = false }) {
  const { t } = useTranslation('common');
  const text = reason === 'no_data'
    ? t('ui.noDataYet')
    : t('ui.notMeasured');

  if (compact) {
    return (
      <span className="font-inter text-xs text-slate-400 italic" title={t('ui.notMeasuredHint')}>
        {t('ui.dash')}
      </span>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="font-inter text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 flex items-center gap-1.5 font-inter text-sm text-slate-500">
        <BarChart3 size={14} />
        {text}
      </p>
      {reason === 'no_tracking' && (
        <p className="mt-1 font-inter text-xs text-slate-400">
          {t('ui.notTracked')}
        </p>
      )}
    </div>
  );
}
