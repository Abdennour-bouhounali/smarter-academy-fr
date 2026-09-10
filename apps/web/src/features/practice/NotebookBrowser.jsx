import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  NotebookPen, ChevronLeft, ChevronRight, Check, Pencil, Trash2, RotateCcw, X,
} from 'lucide-react';
import { getLessonById } from '@smarter-academy/core';
import { AuthContext } from '../../context/AuthContext';
import { fetchNotes, updateNote, deleteNote } from '../../services/practiceService';

const MISTAKE_LABELS = {
  calcul: 'Erreur de calcul',
  methode: 'Méthode',
  lecture: "Lecture de l'énoncé",
  signe: 'Signe',
  etourderie: 'Étourderie',
};

const dateFr = (iso) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return null;
  }
};

/**
 * Le carnet, rangé par leçon : on choisit une leçon, puis on parcourt ses
 * notes UNE PAR UNE.
 *
 * Pourquoi une à la fois plutôt qu'une liste : une note se relit pour être
 * traitée, pas survolée. Présenter tout le carnet d'un bloc invite à faire
 * défiler ; le présenter note par note demande une décision sur chacune —
 * la modifier, la marquer traitée, ou passer. C'est le même geste qu'un jeu
 * de fiches de révision.
 *
 * Le regroupement se fait ici, à partir du `lessonCode` que porte chaque
 * note : le serveur sait déjà filtrer sur une leçon, mais il faudrait un
 * appel par leçon pour bâtir la liste des leçons elles-mêmes. Un seul appel,
 * puis un regroupement en mémoire, coûte moins et reste juste — le carnet
 * d'un élève se compte en dizaines de notes, pas en milliers.
 */
export default function NotebookBrowser() {
  const { token } = useContext(AuthContext);

  const [notes, setNotes] = useState(null);
  const [error, setError] = useState(null);
  const [lessonCode, setLessonCode] = useState(null);
  const [index, setIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    setError(null);
    fetchNotes(token)
      .then((data) => !cancelled && setNotes(data.notes || []))
      .catch((e) => !cancelled && setError(e.message));

    return () => { cancelled = true; };
  }, [token]);

  // Une entrée par leçon, dans l'ordre du nombre de notes à revoir : la leçon
  // qui demande le plus de travail se présente en premier.
  const groups = useMemo(() => {
    if (!notes) return [];
    const map = new Map();
    for (const note of notes) {
      // `lessonCode` peut être nul (note prise hors leçon) : on la range dans
      // un groupe explicite plutôt que de la faire disparaître.
      const key = note.lessonCode || '__sans_lecon__';
      if (!map.has(key)) {
        map.set(key, {
          code: key,
          title: note.lessonCode
            ? getLessonById(note.lessonCode)?.title || note.lessonCode
            : 'Notes hors leçon',
          notes: [],
        });
      }
      map.get(key).notes.push(note);
    }

    return Array.from(map.values())
      .map((g) => ({ ...g, todo: g.notes.filter((n) => !n.isCompleted).length }))
      .sort((a, b) => b.todo - a.todo || b.notes.length - a.notes.length);
  }, [notes]);

  const group = groups.find((g) => g.code === lessonCode) || null;
  const current = group?.notes[index] || null;

  const openLesson = useCallback((code) => {
    setLessonCode(code);
    setIndex(0);
    setEditing(false);
  }, []);

  // Toute modification remplace la note dans la liste chargée : pas de second
  // aller-retour réseau, et l'ordre à l'écran ne bouge pas sous les doigts de
  // l'élève au moment où il agit.
  const replace = useCallback((updated) => {
    setNotes((prev) => (prev || []).map((n) => (n.id === updated.id ? updated : n)));
  }, []);

  const toggleCompleted = useCallback(async (note) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const data = await updateNote(token, note.id, { completed: !note.isCompleted });
      replace(data.note);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [token, busy, replace]);

  const saveEdit = useCallback(async () => {
    if (busy || !current || !draft.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const data = await updateNote(token, current.id, { content: draft.trim() });
      replace(data.note);
      setEditing(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [token, busy, current, draft, replace]);

  const removeNote = useCallback(async (note) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await deleteNote(token, note.id);
      setNotes((prev) => (prev || []).filter((n) => n.id !== note.id));
      // On recule d'un cran si on supprimait la dernière note de la leçon.
      setIndex((i) => Math.max(0, Math.min(i, (group?.notes.length ?? 1) - 2)));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [token, busy, group]);

  if (!token) return null;

  if (notes === null && !error) {
    return <div className="h-40 rounded-2xl bg-slate-100 animate-pulse" />;
  }

  const total = notes?.length ?? 0;
  const todo = (notes || []).filter((n) => !n.isCompleted).length;

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className="font-space font-bold text-slate-800 text-lg flex items-center gap-2">
          <NotebookPen className="w-5 h-5 text-slate-400" aria-hidden="true" /> Mon carnet
        </h2>
        {total > 0 && (
          <p className="text-xs font-mono text-slate-500">
            {todo > 0 ? `${todo} à revoir sur ${total}` : `${total} note${total > 1 ? 's' : ''} — tout est traité`}
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-rose-700 bg-rose-50 border-2 border-rose-200 rounded-xl p-3">{error}</p>
      )}

      {total === 0 && !error && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center">
          <p className="text-sm text-slate-500">
            Ton carnet est vide. Pendant un exercice, « Noter » garde ici ce que tu veux retenir.
          </p>
        </div>
      )}

      {/* ── Choix de la leçon ── */}
      {total > 0 && !group && (
        <ul className="space-y-2">
          {groups.map((g) => (
            <li key={g.code}>
              <button
                type="button"
                onClick={() => openLesson(g.code)}
                className="w-full text-left rounded-xl border-2 border-slate-200 bg-white px-4 py-3 hover:border-slate-400 transition-colors flex items-center justify-between gap-3 min-h-[56px]"
              >
                <span className="min-w-0">
                  <span className="block font-bold text-sm text-slate-800 truncate">{g.title}</span>
                  <span className="block text-xs text-slate-500">
                    {g.notes.length} note{g.notes.length > 1 ? 's' : ''}
                    {g.todo > 0 && ` · ${g.todo} à revoir`}
                  </span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ── Les notes de la leçon choisie, une par une ── */}
      {group && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => { setLessonCode(null); setEditing(false); }}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-slate-900 min-h-[44px]"
            >
              <ChevronLeft className="w-3 h-3" aria-hidden="true" /> Toutes mes leçons
            </button>
            <p className="font-bold text-sm text-slate-800 truncate">{group.title}</p>
          </div>

          {current ? (
            <article className={`rounded-2xl border-2 p-5 space-y-4 ${
              current.isCompleted ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-white'
            }`}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-xs font-mono font-bold text-slate-500">
                  Note {index + 1} / {group.notes.length}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {current.mistakeType && MISTAKE_LABELS[current.mistakeType] && (
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                      {MISTAKE_LABELS[current.mistakeType]}
                    </span>
                  )}
                  {current.isCompleted && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                      <Check className="w-3 h-3" aria-hidden="true" /> Traitée
                    </span>
                  )}
                </div>
              </div>

              {editing ? (
                <div className="space-y-3">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={4}
                    aria-label="Modifier ma note"
                    className="w-full border-2 border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button" onClick={saveEdit} disabled={busy || !draft.trim()}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm min-h-[44px] disabled:opacity-50"
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button" onClick={() => setEditing(false)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-slate-300 text-slate-600 font-bold text-sm min-h-[44px]"
                    >
                      <X className="w-4 h-4" aria-hidden="true" /> Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-800 whitespace-pre-wrap">{current.content}</p>
              )}

              <p className="text-xs text-slate-400 font-mono">
                Écrite le {dateFr(current.createdAt)}
                {current.isCompleted && current.completedAt && ` · traitée le ${dateFr(current.completedAt)}`}
              </p>

              {!editing && (
                <div className="flex gap-2 flex-wrap pt-1">
                  <button
                    type="button"
                    onClick={() => toggleCompleted(current)}
                    disabled={busy}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm min-h-[44px] disabled:opacity-50 ${
                      current.isCompleted
                        ? 'border-2 border-slate-300 text-slate-600 hover:border-slate-400'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {current.isCompleted
                      ? (<><RotateCcw className="w-4 h-4" aria-hidden="true" /> À revoir</>)
                      : (<><Check className="w-4 h-4" aria-hidden="true" /> Marquer comme traitée</>)}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDraft(current.content); setEditing(true); }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 font-bold text-sm min-h-[44px]"
                  >
                    <Pencil className="w-4 h-4" aria-hidden="true" /> Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => removeNote(current)}
                    disabled={busy}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 font-bold text-sm min-h-[44px] disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" /> Supprimer
                  </button>
                </div>
              )}
            </article>
          ) : (
            <p className="text-sm text-slate-500">Plus aucune note dans cette leçon.</p>
          )}

          {/* ── Navigation d'une note à l'autre ── */}
          {group.notes.length > 1 && (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => { setIndex((i) => Math.max(0, i - 1)); setEditing(false); }}
                disabled={index === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 font-bold text-sm min-h-[44px] disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Précédente
              </button>
              <button
                type="button"
                onClick={() => { setIndex((i) => Math.min(group.notes.length - 1, i + 1)); setEditing(false); }}
                disabled={index >= group.notes.length - 1}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 font-bold text-sm min-h-[44px] disabled:opacity-40"
              >
                Suivante <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
