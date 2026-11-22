import { useContext, useEffect, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircleQuestion } from 'lucide-react';
import { AuthContext } from '../../../../context/AuthContext';
import { fetchTeacherLabs, setTeacherLabCheckpoints } from '../../../../services/labSettingsService';

/**
 * Les questions pendant le labo (LabCheckpoint) sont OBLIGATOIRES pour TOUS les élèves, quels que soient leur enseignant et leur classe
 * (propriétaire, 2026-10-28). Seul l'ENSEIGNANT peut les couper ou les rallumer, et pour SON compte seulement (préparer, présenter en classe).
 *
 * Un labo est identifié par sa CLÉ « <module>:<type> » lue dans l'URL de la leçon (`/courses/<niveau>/<année>/<chapitre>/<leçon>/<module>`) :
 * `nashat:gear-crank`. Le réglage vit côté serveur (`teacher_lab_settings`, par enseignant × leçon) ; par défaut tout est actif.
 *
 *   const q = useLabCheckpointSettings('gear-crank');
 *   q.enabled   vrai pour tout élève, tout visiteur, toute page hors leçon ; pour l'enseignant, son propre réglage
 *   q.control   l'interrupteur de l'enseignant (null pour les autres) — dans l'en-tête du labo (`ManipulationShell › headerAction`)
 *
 * Une seule requête par leçon (les labos d'une leçon partagent l'entrée du cache), et seulement pour un enseignant.
 * Contrat DOM : [data-lab-checkpoint-teacher][role=switch][aria-checked].
 */

/** La leçon et la clé du labo d'après le chemin, ou null hors d'une page de module de leçon. */
export function labKeyFromPath(pathname, type) {
  const m = /^\/courses\/[^/]+\/[^/]+\/[^/]+\/([a-z0-9-]+)\/([a-z0-9-]+)\/?$/.exec(String(pathname ?? ''));
  if (!m || !type) return null;
  return { lesson: m[1], lab: `${m[2]}:${type}` };
}

const store = new Map();
function entryFor(token, lesson) {
  const key = `${token}|${lesson}`;
  if (!store.has(key)) store.set(key, { off: null, error: null, promise: null, subs: new Set() });
  return store.get(key);
}
const notify = (e) => e.subs.forEach((f) => f());
function load(e, token, lesson) {
  if (e.off || e.promise) return;
  e.promise = fetchTeacherLabs(token, lesson)
    .then((off) => { e.off = off; }, (err) => { e.error = err; })
    .finally(() => { e.promise = null; notify(e); });
}

export function useLabCheckpointSettings(type) {
  const { token, user } = useContext(AuthContext) ?? {};
  const where = typeof window !== 'undefined' ? labKeyFromPath(window.location.pathname, type) : null;
  const teacher = !!token && !!where && user?.role === 'teacher';
  const [, rerender] = useReducer((x) => x + 1, 0);
  const lesson = where?.lesson;
  useEffect(() => {
    if (!teacher) return undefined;
    const e = entryFor(token, lesson);
    e.subs.add(rerender);
    load(e, token, lesson);
    return () => { e.subs.delete(rerender); };
  }, [teacher, token, lesson]);

  if (!teacher) return { enabled: true, control: null };
  const e = entryFor(token, lesson);
  const enabled = !(e.off ?? []).includes(where.lab);
  return { enabled, control: <TeacherSwitch entry={e} token={token} lesson={lesson} lab={where.lab} on={enabled} /> };
}

function TeacherSwitch({ entry, token, lesson, lab, on }) {
  const { t } = useTranslation('lesson');
  const k = (s) => t(`manipulation.checkpoint.teacher.${s}`);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const flip = async () => {
    setBusy(true); setError('');
    try {
      entry.off = await setTeacherLabCheckpoints(token, lesson, lab, !on);
      notify(entry);
    } catch (err) {
      setError(err?.message || k('error'));
    } finally { setBusy(false); }
  };
  return (
    <div className="flex flex-col items-end gap-1">
      <button type="button" role="switch" aria-checked={on} onClick={flip} disabled={busy || (!!entry.promise && !entry.off)}
        title={k('hint')} data-lab-checkpoint-teacher
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-indigo-200 bg-white px-3 text-sm font-black text-indigo-900 outline-none hover:bg-indigo-50 focus-visible:ring-4 focus-visible:ring-indigo-300 disabled:opacity-60">
        <MessageCircleQuestion className="h-4 w-4" aria-hidden="true" /> {k('button')}
        <span className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors ${on ? 'bg-emerald-500' : 'bg-slate-300'}`} aria-hidden="true">
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'start-[18px]' : 'start-0.5'}`} />
        </span>
        <span className={`text-xs ${on ? 'text-emerald-700' : 'text-slate-500'}`}>{on ? k('on') : k('off')}</span>
      </button>
      <span className="sr-only">{k('hint')}</span>
      {error && <p role="alert" className="text-xs font-bold text-rose-700">{error}</p>}
    </div>
  );
}
