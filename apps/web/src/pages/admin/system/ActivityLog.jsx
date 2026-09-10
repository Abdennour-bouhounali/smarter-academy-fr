import React, { useCallback, useState } from 'react';
import { ScrollText } from 'lucide-react';
import AdminPage from '../../../components/admin/AdminPage';
import DataTable from '../../../components/admin/ui/DataTable';
import { FilterBar, SelectFilter, Pagination } from '../../../components/admin/ui/FilterBar';
import { EmptyState } from '../../../components/admin/ui/states';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchActivityLog } from '../../../services/admin/accountService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

const ACTION_LABELS = {
  'lesson.status_changed': 'Publication d’une leçon',
  'module.status_changed': 'Publication d’un module',
  'exercise.status_changed': 'Publication d’un exercice',
  'student.status_changed': 'Statut d’un compte élève',
  'report.updated': 'Signalement mis à jour',
  'report.note_added': 'Note interne ajoutée',
  'admin.email_changed': 'Email administrateur changé',
  'admin.password_changed': 'Mot de passe administrateur changé',
};

export default function AdminActivityLog() {
  useDocumentMeta('Journal d’activité — Administration');

  const [action, setAction] = useState();
  const [page, setPage] = useState(1);
  const loader = useCallback((token) => fetchActivityLog(token, { action, page }), [action, page]);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  /** Rend un avant/après lisible — les valeurs sensibles sont déjà caviardées côté serveur. */
  const renderChange = (log) => {
    if (!log.before && !log.after) return <span className="text-slate-400">—</span>;
    const key = Object.keys(log.after ?? log.before ?? {})[0];
    if (!key) return <span className="text-slate-400">—</span>;

    return (
      <span className="font-mono-jetbrains text-xs">
        <span className="text-slate-400">{log.before?.[key] ?? '∅'}</span>
        <span className="mx-1 text-slate-300">→</span>
        <span className="font-semibold text-slate-700">{log.after?.[key] ?? '∅'}</span>
      </span>
    );
  };

  return (
    <AdminPage
      eyebrow="Système"
      title="Journal d’activité"
      subtitle="Qui a fait quoi, quand. Aucun mot de passe ni secret n’y est jamais écrit."
    >
      <div className="space-y-3">
        <FilterBar>
          <SelectFilter
            label="Action" allLabel="Toutes les actions" value={action}
            onChange={(v) => { setAction(v); setPage(1); }}
            options={Object.entries(ACTION_LABELS).map(([value, label]) => ({ value, label }))}
          />
        </FilterBar>

        <DataTable
          rows={data?.data ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          empty={<EmptyState icon={ScrollText} title="Journal vide" hint="Aucune action d’administration n’a encore été enregistrée." />}
          columns={[
            { key: 'createdAt', label: 'Date', render: (log) => <span className="whitespace-nowrap text-slate-500">{dateFormat.format(new Date(log.createdAt))}</span> },
            { key: 'admin', label: 'Administrateur', render: (log) => log.admin ?? '—' },
            { key: 'action', label: 'Action', render: (log) => <span className="font-semibold text-slate-800">{ACTION_LABELS[log.action] ?? log.action}</span> },
            { key: 'entity', label: 'Cible', render: (log) => (log.entityType ? <span className="font-mono-jetbrains text-xs">{log.entityType} #{log.entityId}</span> : '—') },
            { key: 'change', label: 'Changement', render: renderChange },
          ]}
        />

        <Pagination meta={data} onPage={setPage} />
      </div>
    </AdminPage>
  );
}
