import { useCallback, useContext, useEffect, useSyncExternalStore } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useLearningViewer } from '../../../features/learning/learningViewer';
import { scopedStorage } from '../../../utils/storage';
import { getLoadedLessonConfig } from '../../registry';
import { fetchLessonAnswers, putLessonAnswers } from '../../../services/lessonAnswersService';
import { KitContext } from '../kit/kitContext';
import { answerKey, mergeAnswers } from './answersModel';

/**
 * LES RÉPONSES GARDÉES POUR L'ÉLÈVE (pilote 2026-11-07, conseil + propriétaire) : une question retrouve la réponse que l'élève
 * y avait donnée quand il revient (rechargement, autre appareil, module revisité). Seulement : leçon pilote (studentView
 * 'mission') et compte ÉLÈVE réel. Gardées sur l'appareil (scopedStorage) ET pour lui sur le serveur (synchronisées) — jamais une
 * preuve, jamais lues par un adulte.
 *
 *   const { saved, save } = useSavedAnswer([prompt, options]);   // saved = { v, at } | null ; save(v)
 */
const DEBOUNCE_MS = 900;
const stores = new Map(); // lessonId → { data, listeners, loaded, pending, timer, token }
const localKey = (lessonId) => `smarter_answers_${lessonId}`;

function readLocal(lessonId) {
  try { const raw = JSON.parse(scopedStorage.getItem(localKey(lessonId)) ?? '{}'); return raw && typeof raw === 'object' ? raw : {}; } catch { return {}; }
}
function writeLocal(lessonId, data) {
  try { scopedStorage.setItem(localKey(lessonId), JSON.stringify(data)); } catch { /* stockage plein : la réponse reste à l'écran */ }
}

function storeOf(lessonId) {
  if (!stores.has(lessonId)) stores.set(lessonId, { data: readLocal(lessonId), listeners: new Set(), loaded: false, settled: false, pending: {}, timer: null, token: null });
  return stores.get(lessonId);
}
const emit = (s) => s.listeners.forEach((fn) => fn());

function ensureLoaded(lessonId, token) {
  const s = storeOf(lessonId);
  s.token = token;
  if (s.loaded) return;
  s.loaded = true;
  fetchLessonAnswers(token, lessonId)
    .then((server) => { s.data = mergeAnswers(s.data, server); s.settled = true; writeLocal(lessonId, s.data); emit(s); })
    // hors ligne : on réessaiera ; l'appareil garde sa copie — et elle fait foi en attendant (`ready`)
    .catch(() => { s.loaded = false; s.settled = true; emit(s); });
}

function saveAnswer(lessonId, key, v) {
  const s = storeOf(lessonId);
  const entry = { v, at: Date.now() };
  s.data = { ...s.data, [key]: entry };
  s.pending[key] = entry;
  writeLocal(lessonId, s.data);
  emit(s);
  clearTimeout(s.timer);
  s.timer = setTimeout(() => {
    const batch = s.pending; s.pending = {};
    if (!s.token || !Object.keys(batch).length) return;
    putLessonAnswers(s.token, lessonId, batch)
      .then((server) => { s.data = mergeAnswers(s.data, server); writeLocal(lessonId, s.data); emit(s); })
      .catch(() => { s.pending = { ...batch, ...s.pending }; /* renvoyé au prochain enregistrement */ });
  }, DEBOUNCE_MS);
}

/** Les réponses gardées sont-elles actives ici ? (leçon pilote, élève connecté) */
function useSavedAnswersOn(lessonId) {
  const viewer = useLearningViewer();
  const auth = useContext(AuthContext);
  const on = Boolean(lessonId) && viewer?.role === 'student' && Boolean(auth?.token) && getLoadedLessonConfig(lessonId)?.studentView === 'mission';
  return { on, token: auth?.token };
}

const NOOP_SUB = () => () => {};

/**
 * @param {Array} parts   ce qui identifie la question (énoncé, options…) — son empreinte fait la clé
 * @param {{ key?: string }} [opts]  une clé explicite remplace l'empreinte (ex. l'état d'une مسألة)
 */
export function useSavedAnswer(parts, { key: explicitKey, lessonId: lessonIdArg, moduleNumber: moduleArg } = {}) {
  const kit = useContext(KitContext); // optionnel : GuidedProblem / WrittenAnswer peuvent vivre hors du kit
  // un composant AU-DESSUS du kit (GuidedProblem rend ContentModule) passe sa leçon et son module lui-même
  const lessonId = lessonIdArg ?? kit?.lessonId;
  const moduleNumber = moduleArg ?? kit?.moduleNumber;
  const { on, token } = useSavedAnswersOn(lessonId);
  const key = on ? (explicitKey ? `m${moduleNumber ?? 'x'}:${explicitKey}` : answerKey(moduleNumber, parts)) : null;
  useEffect(() => { if (on) ensureLoaded(lessonId, token); }, [on, lessonId, token]);
  const subscribe = useCallback((fn) => { if (!on) return () => {}; const s = storeOf(lessonId); s.listeners.add(fn); return () => s.listeners.delete(fn); }, [on, lessonId]);
  const saved = useSyncExternalStore(on ? subscribe : NOOP_SUB, () => (on ? storeOf(lessonId).data[key] ?? null : null), () => null);
  const save = useCallback((v) => { if (on && key) saveAnswer(lessonId, key, v); }, [on, lessonId, key]);
  // `ready` : la copie du serveur est arrivée (ou le serveur n'a pas répondu). Une valeur qui FUSIONNE ce qui est gardé (les essais d'un labo)
  // ne s'enregistre qu'après : sinon une sauvegarde partielle, plus récente, écraserait la copie du serveur (revue ECC 2026-11-10).
  const ready = useSyncExternalStore(on ? subscribe : NOOP_SUB, () => (on ? storeOf(lessonId).settled : false), () => false);
  return { on, saved, save, ready };
}
