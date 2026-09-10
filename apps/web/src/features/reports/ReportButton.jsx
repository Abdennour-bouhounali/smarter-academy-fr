import React, { useContext, useState } from 'react';
import { Flag, Check, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { createReport, REPORT_CATEGORIES } from '../../services/reportService';

/**
 * « Signaler un problème ».
 *
 * Bâti sur le patron de NotebookButton — déclencheur discret, panneau en
 * ligne, confirmation — et NON sur une boîte modale : l'élève signale un
 * problème SUR ce qu'il a sous les yeux, et lui masquer l'écran serait
 * exactement le mauvais geste.
 *
 * L'élève ne désigne jamais le contenu : `context` est fourni par le composant
 * hôte à partir de ce qu'il a déjà en portée, et le serveur le re-résout
 * (voir services/reportService.js et App\Domain\Admin\ReportService).
 *
 * @param {object} context  { lessonCode, grade, moduleNumber, step, exerciseCode, questionId, sessionId, attemptUuid }
 * @param {'chip'|'link'|'icon'} [variant]  l'habillage du déclencheur
 */
export default function ReportButton({ context = {}, variant = 'chip', className = '' }) {
  const { token } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  // Sans session, il n'y a personne à qui rattacher le signalement — et
  // ouvrir un formulaire qui échouera à l'envoi serait pire que ne rien
  // proposer. Les visiteurs anonymes ne voient donc pas le bouton.
  if (!token) return null;

  const submit = async (event) => {
    event.preventDefault();
    if (!category) return;

    setBusy(true);
    setError(null);
    try {
      await createReport(token, { ...context, category, note: note.trim() || undefined });
      setSent(true);
      setOpen(false);
      setCategory(null);
      setNote('');
    } catch (caught) {
      setError(caught.message);
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <span className={`inline-flex items-center gap-1.5 font-inter text-xs font-semibold text-emerald-700 ${className}`}>
        <Check size={14} aria-hidden="true" /> Merci, c’est signalé
      </span>
    );
  }

  if (!open) {
    const label = 'Signaler un problème';

    if (variant === 'icon') {
      return (
        <button
          type="button"
          onClick={() => setOpen(true)}
          title={label}
          aria-label={label}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 ${className}`}
        >
          <Flag size={15} />
        </button>
      );
    }

    if (variant === 'link') {
      return (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`inline-flex items-center gap-1.5 font-inter text-xs font-semibold text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline ${className}`}
        >
          <Flag size={13} aria-hidden="true" /> {label}
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-inter text-xs font-semibold text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-800 ${className}`}
      >
        <Flag size={13} aria-hidden="true" /> {label}
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={`w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm ${className}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-space text-sm font-bold text-slate-900">Signaler un problème</p>
          <p className="font-inter text-xs text-slate-500">
            Pas besoin de dire où : on sait déjà sur quoi tu travailles.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setOpen(false); setError(null); }}
          aria-label="Fermer"
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={16} />
        </button>
      </div>

      <fieldset className="mb-3">
        <legend className="mb-1.5 font-inter text-xs font-semibold text-slate-600">
          Qu’est-ce qui ne va pas ?
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {REPORT_CATEGORIES.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setCategory(option.id)}
              aria-pressed={category === option.id}
              className={`rounded-full border px-2.5 py-1 font-inter text-xs transition-colors ${
                category === option.id
                  ? 'border-blue-300 bg-blue-50 font-semibold text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="font-inter text-xs font-semibold text-slate-600">
          Tu veux préciser ? <span className="font-normal text-slate-400">(facultatif)</span>
        </span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={2}
          maxLength={2000}
          placeholder="Ce que tu as vu, ce que tu attendais…"
          className="mt-1 w-full rounded-lg border border-slate-300 p-2 font-inter text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </label>

      {error && <p className="mt-2 rounded-lg bg-rose-50 p-2 font-inter text-xs text-rose-700">{error}</p>}

      <div className="mt-3 flex items-center gap-2">
        <button
          type="submit"
          disabled={busy || !category}
          className="rounded-lg bg-slate-900 px-4 py-2 font-inter text-xs font-semibold text-white disabled:opacity-40"
        >
          {busy ? 'Envoi…' : 'Envoyer'}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setError(null); }}
          className="font-inter text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
