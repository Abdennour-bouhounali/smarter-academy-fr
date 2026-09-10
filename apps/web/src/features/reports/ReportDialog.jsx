import React, { useEffect, useRef, useState } from 'react';
import { X, Check, TriangleAlert } from 'lucide-react';
import { REPORT_CATEGORIES } from '../../services/reportService';

/**
 * Le formulaire de signalement.
 *
 * Boîte de dialogue et non panneau en ligne : le signalement peut partir du
 * sommaire d'une leçon comme du bas d'un module, et une fenêtre centrée se
 * comporte pareil dans les deux cas — un panneau, lui, dépend de la place
 * qu'il reste autour de lui.
 *
 * Accessibilité tenue ici plutôt que laissée à l'appelant : role="dialog" +
 * aria-modal, focus déplacé dedans à l'ouverture et rendu au déclencheur à la
 * fermeture, Échap ferme, Tab reste piégé, et les catégories sont de VRAIS
 * boutons radio (radiogroup) — pas des <div> cliquables, qui ne se
 * parcourent pas aux flèches.
 */
export default function ReportDialog({ open, onClose, onSubmit, busy, error, submitted }) {
  const [category, setCategory] = useState(null);
  const [note, setNote] = useState('');
  const panelRef = useRef(null);
  const firstRadioRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    previouslyFocused.current = document.activeElement;
    // Le focus va sur la première option, pas sur le panneau : l'élève arrive
    // directement sur ce qu'il doit choisir.
    const timer = setTimeout(() => (firstRadioRef.current ?? panelRef.current)?.focus(), 0);

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose?.();
        return;
      }

      if (event.key !== 'Tab') return;

      // Piège à focus : sans lui, Tab sort de la fenêtre et l'élève tabule
      // dans la leçon derrière, invisible.
      const focusables = panelRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  // Repart d'une page blanche à chaque ouverture : un choix laissé d'une fois
  // sur l'autre serait pris pour le signalement en cours.
  useEffect(() => {
    if (open) {
      setCategory(null);
      setNote('');
    }
  }, [open]);

  if (!open) return null;

  const submit = (event) => {
    event.preventDefault();
    if (!category || busy) return;
    onSubmit({ category, note: note.trim() });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        // onMouseDown et non onClick : un glissement commencé DANS la fenêtre
        // et relâché sur le fond la fermerait.
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-dialog-title"
        tabIndex={-1}
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-xl outline-none sm:rounded-2xl"
      >
        {submitted ? (
          <div className="p-6 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Check size={22} aria-hidden="true" />
            </div>
            <h2 id="report-dialog-title" className="font-space text-lg font-bold text-slate-900">
              Merci ! Ton signalement a bien été envoyé.
            </h2>
            <p className="mt-1 font-inter text-sm text-slate-500">
              On regarde ça. Tu peux continuer ta leçon.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-lg bg-slate-900 px-5 py-2.5 font-inter text-sm font-semibold text-white"
            >
              Continuer
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div>
                <h2 id="report-dialog-title" className="font-space text-lg font-bold text-slate-900">
                  Signaler un problème
                </h2>
                <p className="font-inter text-xs text-slate-500">
                  Pas besoin de dire où : on sait déjà sur quoi tu travailles.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="-mr-1 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              <fieldset>
                <legend className="mb-2 font-inter text-sm font-semibold text-slate-700">
                  Quel est le problème ?
                </legend>

                <div role="radiogroup" aria-labelledby="report-dialog-title" className="space-y-1.5">
                  {REPORT_CATEGORIES.map((option, index) => {
                    const selected = category === option.id;

                    return (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-2.5 transition-colors ${
                          selected
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <input
                          ref={index === 0 ? firstRadioRef : undefined}
                          type="radio"
                          name="report-category"
                          value={option.id}
                          checked={selected}
                          onChange={() => setCategory(option.id)}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
                        />
                        <span className="min-w-0">
                          <span className={`block font-inter text-sm ${selected ? 'font-semibold text-blue-900' : 'text-slate-800'}`}>
                            {option.label}
                          </span>
                          <span className="block font-inter text-xs text-slate-500">{option.hint}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div>
                <label htmlFor="report-note" className="font-inter text-sm font-semibold text-slate-700">
                  {category === 'other' ? 'Décris le problème' : 'Tu veux préciser ?'}{' '}
                  <span className="font-normal text-slate-400">(facultatif)</span>
                </label>
                <textarea
                  id="report-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="Décris le problème pour nous aider à le corriger…"
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 font-inter text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {error && (
                <p role="alert" className="flex items-start gap-2 rounded-xl bg-rose-50 p-2.5 font-inter text-xs text-rose-800">
                  <TriangleAlert size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                  {error}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2.5 font-inter text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!category || busy}
                className="rounded-lg bg-slate-900 px-5 py-2.5 font-inter text-sm font-semibold text-white disabled:opacity-40"
              >
                {busy ? 'Envoi…' : 'Envoyer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
