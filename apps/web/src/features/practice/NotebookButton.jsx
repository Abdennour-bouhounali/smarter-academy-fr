import { useState } from 'react';
import { NotebookPen, Check } from 'lucide-react';

const MISTAKE_TYPES = [
  { id: 'calcul', label: 'Erreur de calcul' },
  { id: 'methode', label: 'Méthode' },
  { id: 'lecture', label: "Lecture de l'énoncé" },
  { id: 'signe', label: 'Signe' },
  { id: 'etourderie', label: 'Étourderie' },
];

/**
 * « Noter dans mon carnet » — une note durable, rattachée à l'exercice, à la
 * question et au point d'apprentissage travaillé.
 *
 * Volontairement minimal : un champ, un type d'erreur optionnel. Le modèle
 * de données, lui, porte déjà de quoi construire « Mes erreurs par chapitre »
 * ou « par Learning Point » — sans que ces écrans existent encore.
 */
export default function NotebookButton({ onSave, defaultType = null }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [mistakeType, setMistakeType] = useState(defaultType);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  if (saved) {
    return (
      <p className="inline-flex items-center gap-2 text-sm text-emerald-700 font-bold">
        <Check className="w-4 h-4" aria-hidden="true" /> Noté dans ton carnet
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 min-h-[44px]"
      >
        <NotebookPen className="w-4 h-4" aria-hidden="true" /> Noter dans mon carnet
      </button>
    );
  }

  const save = async () => {
    if (!content.trim() || busy) return;
    setBusy(true);
    try {
      await onSave({ content: content.trim(), mistakeType });
      setSaved(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-3">
      <label className="block space-y-1">
        <span className="text-xs font-mono font-bold text-slate-500 uppercase">Ta note</span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="Ce que je dois retenir de cette question…"
          className="w-full border-2 border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {MISTAKE_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setMistakeType(mistakeType === t.id ? null : t.id)}
            aria-pressed={mistakeType === t.id}
            className={`px-3 py-2 rounded-lg text-xs font-bold border-2 min-h-[40px] ${
              mistakeType === t.id ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          type="button" onClick={save} disabled={!content.trim() || busy}
          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm min-h-[44px] disabled:opacity-50"
        >
          Enregistrer
        </button>
        <button
          type="button" onClick={() => setOpen(false)}
          className="px-4 py-2.5 rounded-xl border-2 border-slate-300 text-slate-600 font-bold text-sm min-h-[44px]"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
