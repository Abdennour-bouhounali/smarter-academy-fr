import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, Loader2, X } from 'lucide-react';
import Modal from './ui/Modal';
import { agree, countNoun } from './contentNouns';

/**
 * La barre d'actions en lot : combien de contenus sont cochés, et ce qu'on
 * peut leur faire.
 *
 * Elle ne sait RIEN de la publication ni du palier. Elle reçoit une liste
 * d'actions décrites (voir bulkContentActions.js), appelle celle qu'on choisit,
 * et rend compte. C'est ce qui lui permet de servir les leçons, les modules et
 * les exercices sans trois variantes — et ce qui garantit qu'aucune règle
 * métier n'est écrite ici.
 *
 * Trois comportements qui comptent :
 *
 *  — elle ne s'affiche PAS quand rien n'est coché : l'interface existante
 *    reste exactement ce qu'elle était ;
 *  — pendant l'exécution, TOUT est désactivé, y compris le bouton qui vient
 *    d'être cliqué : un double clic sur « Publier 24 leçons » ne doit pas
 *    lancer deux lots ;
 *  — le résultat distingue appliqué / déjà dans cet état / refusé, et nomme
 *    les refus. « Succès » alors que 2 contenus sur 12 ont résisté est un
 *    mensonge que la spec §9 interdit.
 */
export default function BulkActionBar({
  count,
  /** Le nom du contenu et son genre — voir CONTENT_NOUNS. */
  noun,
  actions,
  onClear,
  onSelectAllVisible,
  allSelected,
  visibleCount,
  selectedRows,
  onDone,
}) {
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  // Le libellé de l'action en cours, figé au lancement : `pending` est remis à
  // null dès la fin, et « Publication de 24 leçons… » doit survivre à ça.
  const runningLabel = useRef('');

  // « 24 leçons », accord du nom compris.
  const counted = countNoun(count, noun);
  const failedCounted = (n) => countNoun(n, noun);

  // Un changement de sélection périme le rapport précédent : laisser
  // « ✓ 12 leçons publiées » au-dessus d'une nouvelle sélection ferait lire un
  // ancien résultat comme le résultat du prochain geste.
  useEffect(() => { setResult(null); setError(null); }, [count]);

  if (count === 0) return null;

  const run = async (action) => {
    setBusy(true);
    setError(null);
    setResult(null);
    runningLabel.current = action.runningLabel?.(count) ?? 'Traitement…';

    try {
      const outcome = await action.run(selectedRows);
      setResult({ action, ...outcome });
      // On ne vide la sélection que si QUELQUE CHOSE a bougé : un lot
      // entièrement refusé doit laisser les lignes cochées, pour qu'on puisse
      // corriger et réessayer sans tout recocher.
      const changed = (outcome.applied?.length ?? 0) + (outcome.unchanged?.length ?? 0);
      if (changed > 0) onDone?.(outcome);
      if ((outcome.failed?.length ?? 0) === 0) onClear?.();
    } catch (caught) {
      // Réseau, autorisation, validation du lot : l'erreur n'est jamais avalée.
      setError(caught.message || 'Une erreur est survenue.');
    } finally {
      setBusy(false);
      setPending(null);
    }
  };

  const request = (action) => {
    if (busy) return;
    if (action.confirm) setPending(action);
    else run(action);
  };

  const failedCount = result?.failed?.length ?? 0;

  return (
    <div
      // `aria-live` : le nombre de lignes cochées change au clavier comme à la
      // souris, et il doit être annoncé sans quitter la case.
      className="sticky top-0 z-20 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5"
      role="region"
      aria-label="Actions groupées"
    >
      <p className="font-inter text-xs font-semibold text-blue-900" aria-live="polite">
        {counted} {agree('sélectionné', count, noun.feminine)}
      </p>

      {/* « Tout sélectionner » dit COMBIEN et OÙ : sans le nombre, on ne sait
          pas si on s'apprête à toucher 25 contenus ou 133. */}
      {!allSelected && visibleCount > count && (
        <button
          type="button"
          onClick={onSelectAllVisible}
          disabled={busy}
          className="rounded-lg border border-blue-300 bg-white px-2.5 py-1 font-inter text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
        >
          Tout sélectionner ({visibleCount} sur cette page)
        </button>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {actions.map((action) => {
          const disabledReason = action.disabledReason?.(selectedRows);

          return (
            <button
              key={action.key}
              type="button"
              onClick={() => request(action)}
              disabled={busy || Boolean(disabledReason)}
              title={disabledReason ?? undefined}
              className={`rounded-lg px-2.5 py-1 font-inter text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
                action.tone === 'danger'
                  ? 'bg-rose-600 text-white enabled:hover:bg-rose-700'
                  : 'border border-slate-300 bg-white text-slate-700 enabled:hover:bg-slate-50'
              }`}
            >
              {action.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onClear}
        disabled={busy}
        className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 font-inter text-xs font-semibold text-slate-600 hover:bg-white disabled:opacity-50"
      >
        <X size={13} /> Effacer la sélection
      </button>

      {busy && (
        <p className="flex w-full items-center gap-2 font-inter text-xs text-blue-800" role="status">
          <Loader2 size={13} className="animate-spin" />
          {runningLabel.current}
        </p>
      )}

      {error && (
        <p className="flex w-full items-start gap-2 font-inter text-xs text-rose-700" role="alert">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      {result && !busy && (
        <div className="w-full space-y-1" role="status">
          {result.applied.length > 0 && (
            <p className="flex items-center gap-1.5 font-inter text-xs font-semibold text-emerald-800">
              <Check size={13} />
              {result.action.successLabel(result.applied.length)}
            </p>
          )}

          {/* « Déjà dans cet état » se dit, plutôt que de se faire passer pour
              un succès : l'administrateur a demandé quelque chose, il doit
              savoir que ça n'a rien eu à changer. */}
          {result.unchanged.length > 0 && (
            <p className="font-inter text-xs text-slate-600">
              {failedCounted(result.unchanged.length)} déjà dans cet état.
            </p>
          )}

          {failedCount > 0 && (
            <p className="flex flex-wrap items-center gap-1.5 font-inter text-xs text-amber-800">
              <AlertTriangle size={13} />
              {failedCounted(failedCount)} {failedCount === 1 ? 'n’a' : 'n’ont'} pas pu être {agree('modifié', failedCount, noun.feminine)}.
              <button
                type="button"
                onClick={() => setDetailOpen(true)}
                className="font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-700"
              >
                Voir le détail
              </button>
            </p>
          )}
        </div>
      )}

      {/* La confirmation porte le NOMBRE et le geste, jamais « Êtes-vous
          sûr ? » : c'est le nombre qui permet de repérer qu'on a coché une
          ligne de trop. */}
      {pending && (
        <Modal
          open
          onClose={() => (busy ? null : setPending(null))}
          title={pending.confirm.title(count, counted, noun)}
          size="sm"
          footer={(
            <>
              <button
                type="button"
                onClick={() => setPending(null)}
                disabled={busy}
                className="rounded-lg border border-slate-300 px-4 py-2 font-inter text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => run(pending)}
                disabled={busy}
                className={`rounded-lg px-4 py-2 font-inter text-sm font-semibold text-white disabled:opacity-60 ${
                  pending.tone === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {busy ? 'En cours…' : pending.confirm.confirmLabel(count, counted, noun)}
              </button>
            </>
          )}
        >
          {pending.confirm.message(count, counted, noun)}
        </Modal>
      )}

      {/* Le détail des refus, motif par motif. Un « 2 échecs » sans le motif
          n'apprend rien : c'est le message du serveur qui dit quoi corriger. */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={`${failedCounted(failedCount)} non ${agree('modifié', failedCount, noun.feminine)}`}
        size="md"
      >
        <ul className="space-y-2">
          {(result?.failed ?? []).map((failure) => (
            <li key={failure.id} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <p className="font-inter text-xs font-semibold text-slate-900">
                {failure.title ?? `#${failure.id}`}
              </p>
              <p className="mt-0.5 font-inter text-xs text-amber-900">{failure.message}</p>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}
