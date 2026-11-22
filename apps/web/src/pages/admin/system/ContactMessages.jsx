import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import { AdminPage, useAdminLabels, formatDate, Num } from '../adminUi';
import DataTable from '../../../components/admin/ui/DataTable';
import { EmptyState } from '../../../components/admin/ui/states';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchContactSubmissions } from '../../../services/contactService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';

/**
 * Les demandes envoyées par le formulaire de contact public.
 *
 * C'était TOUT l'ancien /admin. Repris ici plutôt que supprimé : c'est une
 * vraie boîte de réception, elle a juste sa place dans le panneau plutôt que
 * de le constituer à elle seule.
 */
export default function AdminContactMessages() {
  const { t } = useTranslation('admin');
  const L = useAdminLabels();
  useDocumentMeta(t('system.messagesMetaTitle'));

  const loader = useCallback((token) => fetchContactSubmissions(token), []);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  return (
    <AdminPage
      eyebrow={t('system.eyebrow')}
      title={t('system.messagesTitle')}
      subtitle={t('system.messagesSubtitle')}
    >
      <DataTable
        rows={data ?? []}
        loading={loading}
        error={error}
        onRetry={reload}
        labels={L.table}
        empty={<EmptyState icon={Mail} title={t('system.emptyMessagesTitle')} hint={t('system.emptyMessagesHint')} />}
        columns={[
          {
            key: 'name',
            label: t('system.columnSender'),
            render: (contact) => (
              <div>
                <span className="font-semibold text-slate-900">{contact.name}</span>
                {/* L'adresse reste LTR : un e-mail retourné n'est plus une adresse. */}
                <a href={`mailto:${contact.email}`} dir="ltr" className="block text-xs text-blue-600 hover:underline">{contact.email}</a>
              </div>
            ),
          },
          {
            key: 'context',
            label: t('system.columnContext'),
            render: (contact) => (
              <span className="text-slate-600">
                {[contact.classe, contact.objectif, contact.ville].filter(Boolean).join(' · ') || t('common.dash')}
              </span>
            ),
          },
          {
            key: 'phone',
            label: t('system.columnPhone'),
            // Un numéro de téléphone est une suite de chiffres : LTR, toujours.
            render: (contact) => (contact.phone ? <Num>{contact.phone}</Num> : t('common.dash')),
          },
          { key: 'message', label: t('system.columnMessage'), render: (contact) => <span className="line-clamp-2 max-w-md text-slate-700">{contact.message}</span> },
          { key: 'created_at', label: t('system.columnReceivedAt'), render: (contact) => <span className="whitespace-nowrap text-slate-500">{formatDate(contact.created_at, { withTime: true })}</span> },
        ]}
      />
    </AdminPage>
  );
}
