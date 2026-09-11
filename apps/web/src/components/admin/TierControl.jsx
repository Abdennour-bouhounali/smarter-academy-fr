import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { changeContentTier } from '../../services/admin/contentService';
import StatusBadge from './ui/StatusBadge';
import { ConfirmDialog } from './ui/Modal';

/**
 * Rendre un contenu gratuit ou payant, depuis n'importe quelle liste.
 *
 * Jumeau de PublicationControl, et SÉPARÉ de lui à dessein : publication et
 * palier sont deux dimensions indépendantes. « Publié » dit que le contenu a
 * le droit d'être servi, « payant » dit à qui. Les quatre combinaisons ont un
 * sens, et les fondre dans un seul menu empêcherait de vendre une leçon sans
 * la republier, ou de la retirer sans la rendre gratuite.
 *
 * Passer en PAYANT se confirme : c'est le geste qui retire du contenu à tous
 * les élèves sans abonnement. Le rendre gratuit, non — ça n'enlève rien à
 * personne. Même asymétrie que pour la publication.
 *
 * Un exercice accepte en plus « hérite de sa leçon » (tier null), qui est son
 * état par défaut. Une leçon n'a rien dont hériter : son palier est la racine
 * de la règle, le serveur refuse donc `null` pour elle.
 */
export default function TierControl({ type, id, tier, lessonTier, onChanged, compact = false }) {
  const { token } = useContext(AuthContext);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const isExercise = type === 'exercise';

  // `null` est une valeur, pas une absence : il faut donc un sentinelle
  // distinct de la chaîne vide du placeholder du menu.
  const INHERIT = '__inherit__';

  const options = [
    { value: 'free', label: 'Rendre gratuit' },
    { value: 'premium', label: 'Rendre payant' },
    ...(isExercise ? [{ value: INHERIT, label: 'Hériter de la leçon' }] : []),
  ];

  const apply = async (next) => {
    setBusy(true);
    setError(null);
    try {
      const result = await changeContentTier(token, type, id, next === INHERIT ? null : next);
      onChanged?.(result.tier);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setBusy(false);
      setPending(null);
    }
  };

  const request = (next) => {
    if (!next) return;
    const current = tier === null || tier === undefined ? INHERIT : tier;
    if (next === current) return;

    // Fermer du contenu se confirme ; l'ouvrir, non. Hériter peut fermer ou
    // ouvrir selon la leçon : on confirme quand ça ferme.
    const closes = next === 'premium' || (next === INHERIT && lessonTier === 'premium');
    if (closes) setPending(next);
    else apply(next);
  };

  // Ce que porte réellement la ligne, et — pour un exercice qui hérite — ce
  // que ça donne en pratique. Afficher « Hérité » sans dire de quoi
  // obligerait l'administrateur à aller vérifier la leçon.
  const effective = isExercise && (tier === null || tier === undefined) ? (lessonTier ?? 'free') : tier;
  const inherits = isExercise && (tier === null || tier === undefined);

  return (
    <div className={compact ? 'flex items-center gap-2' : 'flex flex-wrap items-center gap-2'}>
      <StatusBadge status={effective} />
      {inherits && <span className="font-inter text-xs text-slate-400">hérité</span>}

      <select
        aria-label="Changer le palier d’accès"
        value=""
        disabled={busy}
        onChange={(event) => request(event.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-2 py-1 font-inter text-xs text-slate-700 disabled:opacity-50"
      >
        <option value="">Changer…</option>
        {options
          .filter((option) => option.value !== (tier ?? INHERIT))
          .map((option) => (
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
        title="Rendre ce contenu payant ?"
        confirmLabel="Rendre payant"
        message={
          <>
            <p>
              Les élèves <strong>sans abonnement</strong> n’y auront plus accès. Le contenu reste visible
              au catalogue, avec la mention « Premium ».
            </p>
            <p className="mt-2">
              <strong>Aucune donnée d’apprentissage n’est supprimée</strong> : les progressions déjà
              enregistrées sont conservées et réapparaîtront si l’accès revient.
            </p>
            <p className="mt-2">
              L’état de publication n’est pas modifié.
            </p>
          </>
        }
      />
    </div>
  );
}
