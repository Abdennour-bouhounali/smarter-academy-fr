import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { changeContentStatus } from '../../services/admin/contentService';
import StatusBadge from './ui/StatusBadge';
import { ConfirmDialog } from './ui/Modal';

const STATUSES = [
  { value: 'published', label: 'Publier' },
  { value: 'hidden', label: 'Masquer' },
  { value: 'draft', label: 'Repasser en brouillon' },
  { value: 'archived', label: 'Archiver' },
];

/**
 * Publier / masquer / archiver un contenu, depuis n'importe quelle liste.
 *
 * Toute sortie de « publié » passe par une confirmation : c'est un geste qui
 * retire du contenu à des élèves en train de travailler, et la spec (§33)
 * demande une confirmation pour les opérations conséquentes. Republier, à
 * l'inverse, ne demande rien — ça ne casse rien.
 *
 * L'état affiché vient du SERVEUR après l'appel, jamais d'une supposition
 * optimiste : si le serveur refuse, l'interface ne doit pas raconter le
 * contraire.
 */
export default function PublicationControl({ type, id, status, onChanged, compact = false }) {
  const { token } = useContext(AuthContext);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const apply = async (next) => {
    setBusy(true);
    setError(null);
    try {
      const result = await changeContentStatus(token, type, id, next);
      onChanged?.(result.publicationStatus);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setBusy(false);
      setPending(null);
    }
  };

  const request = (next) => {
    if (!next || next === status) return;
    // Retirer du contenu aux élèves se confirme ; le remettre, non.
    if (next === 'published') apply(next);
    else setPending(next);
  };

  return (
    <div className={compact ? 'flex items-center gap-2' : 'flex flex-wrap items-center gap-2'}>
      <StatusBadge status={status} />

      <select
        aria-label="Changer l’état de publication"
        value=""
        disabled={busy}
        onChange={(event) => request(event.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-2 py-1 font-inter text-xs text-slate-700 disabled:opacity-50"
      >
        <option value="">Changer…</option>
        {STATUSES.filter((option) => option.value !== status).map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>

      {error && <span className="font-inter text-xs text-rose-600">{error}</span>}

      <ConfirmDialog
        open={Boolean(pending)}
        onClose={() => setPending(null)}
        onConfirm={() => apply(pending)}
        busy={busy}
        tone="danger"
        title={pending === 'archived' ? 'Archiver ce contenu ?' : 'Retirer ce contenu aux élèves ?'}
        confirmLabel={pending === 'archived' ? 'Archiver' : 'Retirer'}
        message={
          <>
            <p>
              Les élèves n’y auront plus accès. <strong>Aucune donnée d’apprentissage n’est supprimée</strong> :
              les progressions et les tentatives déjà enregistrées sont conservées, et réapparaîtront si vous
              republiez.
            </p>
          </>
        }
      />
    </div>
  );
}
