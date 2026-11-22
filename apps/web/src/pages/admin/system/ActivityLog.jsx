import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollText } from 'lucide-react';
import { AdminPage, useAdminLabels, formatDate, Num } from '../adminUi';
import DataTable from '../../../components/admin/ui/DataTable';
import { FilterBar, SelectFilter, Pagination } from '../../../components/admin/ui/FilterBar';
import { EmptyState } from '../../../components/admin/ui/states';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchActivityLog } from '../../../services/admin/accountService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';

/**
 * Les actions journalisées, par leur CLÉ serveur.
 *
 * La clé (`lesson.status_changed`) est un identifiant technique : elle part
 * telle quelle au serveur comme filtre, et ne se traduit jamais. Seul son
 * libellé se traduit, au rendu — c'est pourquoi la liste ne porte plus que la
 * clé du catalogue.
 */
const ACTION_KEYS = [
  'lesson.status_changed',
  'module.status_changed',
  'exercise.status_changed',
  'student.status_changed',
  'report.updated',
  'report.note_added',
  'admin.email_changed',
  'admin.password_changed',
];

export default function AdminActivityLog() {
  const { t } = useTranslation('admin');
  const L = useAdminLabels();
  useDocumentMeta(t('system.activityMetaTitle'));

  const [action, setAction] = useState();
  const [page, setPage] = useState(1);
  const loader = useCallback((token) => fetchActivityLog(token, { action, page }), [action, page]);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  /**
   * Le libellé d'une action, ou sa clé brute si elle sort du vocabulaire.
   * Afficher « system.actions.foo » à l'écran n'apprendrait rien : mieux vaut
   * la clé serveur, qui au moins se cherche dans le code.
   */
  const actionLabel = (key) => {
    const path = `system.actions.${key}`;
    const translated = t(path);
    return translated === path ? key : translated;
  };

  /** Rend un avant/après lisible — les valeurs sensibles sont déjà caviardées côté serveur. */
  const renderChange = (log) => {
    if (!log.before && !log.after) return <span className="text-slate-400">{t('common.dash')}</span>;
    const key = Object.keys(log.after ?? log.before ?? {})[0];
    if (!key) return <span className="text-slate-400">{t('common.dash')}</span>;

    return (
      // `dir="ltr"` : un avant/après est une paire de VALEURS techniques
      // (« draft → published »), et la flèche doit rester dans ce sens même au
      // milieu d'une page RTL.
      <span dir="ltr" className="inline-block font-mono-jetbrains text-xs">
        <span className="text-slate-400">{log.before?.[key] ?? '∅'}</span>
        <span className="mx-1 text-slate-300">→</span>
        <span className="font-semibold text-slate-700">{log.after?.[key] ?? '∅'}</span>
      </span>
    );
  };

  return (
    <AdminPage
      eyebrow={t('system.eyebrow')}
      title={t('system.activityTitle')}
      subtitle={t('system.activitySubtitle')}
    >
      <div className="space-y-3">
        <FilterBar>
          <SelectFilter
            label={t('system.columnAction')}
            allLabel={t('system.allActions')}
            value={action}
            onChange={(v) => { setAction(v); setPage(1); }}
            options={ACTION_KEYS.map((value) => ({ value, label: actionLabel(value) }))}
          />
        </FilterBar>

        <DataTable
          rows={data?.data ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          labels={L.table}
          empty={<EmptyState icon={ScrollText} title={t('system.emptyActivityTitle')} hint={t('system.emptyActivityHint')} />}
          columns={[
            { key: 'createdAt', label: t('system.columnDate'), render: (log) => <span className="whitespace-nowrap text-slate-500">{formatDate(log.createdAt, { withTime: true })}</span> },
            { key: 'admin', label: t('system.columnActor'), render: (log) => log.admin ?? t('common.dash') },
            { key: 'action', label: t('system.columnAction'), render: (log) => <span className="font-semibold text-slate-800">{actionLabel(log.action)}</span> },
            {
              key: 'entity',
              label: t('system.columnEntity'),
              // Le type et l'identifiant sont des données techniques : ils
              // restent LTR, comme partout dans le panneau.
              render: (log) => (log.entityType
                ? <Num className="font-mono-jetbrains text-xs">{log.entityType} #{log.entityId}</Num>
                : t('common.dash')),
            },
            { key: 'change', label: t('system.columnChange'), render: renderChange },
          ]}
        />

        <Pagination meta={data} onPage={setPage} labels={L.pagination} />
      </div>
    </AdminPage>
  );
}
