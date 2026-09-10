import React, { useCallback } from 'react';
import { Mail } from 'lucide-react';
import AdminPage from '../../../components/admin/AdminPage';
import DataTable from '../../../components/admin/ui/DataTable';
import { EmptyState } from '../../../components/admin/ui/states';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchContactSubmissions } from '../../../services/contactService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

/**
 * Les demandes envoyées par le formulaire de contact public.
 *
 * C'était TOUT l'ancien /admin. Repris ici plutôt que supprimé : c'est une
 * vraie boîte de réception, elle a juste sa place dans le panneau plutôt que
 * de le constituer à elle seule.
 */
export default function AdminContactMessages() {
  useDocumentMeta('Messages de contact — Administration');

  const loader = useCallback((token) => fetchContactSubmissions(token), []);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  return (
    <AdminPage
      eyebrow="Système"
      title="Messages de contact"
      subtitle="Les demandes envoyées depuis le formulaire public."
    >
      <DataTable
        rows={data ?? []}
        loading={loading}
        error={error}
        onRetry={reload}
        empty={<EmptyState icon={Mail} title="Aucun message" hint="Aucune demande n’a été envoyée pour l’instant." />}
        columns={[
          {
            key: 'name',
            label: 'Personne',
            render: (contact) => (
              <div>
                <span className="font-semibold text-slate-900">{contact.name}</span>
                <a href={`mailto:${contact.email}`} className="block text-xs text-blue-600 hover:underline">{contact.email}</a>
              </div>
            ),
          },
          {
            key: 'context',
            label: 'Contexte',
            render: (contact) => (
              <span className="text-slate-600">
                {[contact.classe, contact.objectif, contact.ville].filter(Boolean).join(' · ') || '—'}
              </span>
            ),
          },
          { key: 'phone', label: 'Téléphone', render: (contact) => contact.phone ?? '—' },
          { key: 'message', label: 'Message', render: (contact) => <span className="line-clamp-2 max-w-md text-slate-700">{contact.message}</span> },
          { key: 'created_at', label: 'Reçu le', render: (contact) => <span className="whitespace-nowrap text-slate-500">{dateFormat.format(new Date(contact.created_at))}</span> },
        ]}
      />
    </AdminPage>
  );
}
