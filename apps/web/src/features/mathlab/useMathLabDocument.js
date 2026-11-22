import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { createMathLabDocument, fetchMathLabDocument, updateMathLabDocument } from '../../services/mathLabService';
import {
  MATH_LAB_AUTOSAVE_MS, cleanTitle, fromApiDocument, isPersisted, mathLabBasePath, mathLabToolPath, newMathLabDocument,
} from './mathLabDocument';
import { useWorkspaceBase } from '../learning/learningViewer';
import { summarizeDocument } from './toolContract';
import {
  attachLabScope, attachScopeToSummary, readRememberedLabScope, resolveToolScope, storedLabScope, stripLabScope,
  toolCapabilities,
} from './labScope';
import { refusalFromError } from '../access/featureAccess';
import { refreshFeatureAccess, reportRefusal } from '../../hooks/useFeatureAccess';

/**
 * Le document d'un instrument, ouvert dans la coquille : chargement,
 * titre, état, et sauvegarde AUTOMATIQUE.
 *
 * ── Ce que la coquille possède, ce que l'outil possède ───────────────────
 * L'outil (Excalidraw pour la سبّورة) possède son état vivant et son
 * historique ; il n'en remet ici qu'un instantané sérialisé par `updateData`.
 * Ce crochet ne garde donc JAMAIS l'état du dessin dans un état React — il
 * vit dans une référence, et seuls le titre et l'état de sauvegarde
 * (« محفوظ », « جارٍ الحفظ… ») provoquent un rendu.
 *
 * ── Naissance et sauvegarde ──────────────────────────────────────────────
 * Un document neuf n'existe pas sur le serveur tant que rien n'a changé :
 * ouvrir la سبّورة et repartir ne crée rien. Au premier changement, POST ;
 * l'URL est réécrite avec l'identifiant (sans rechargement, sans démontage
 * de l'outil) ; ensuite, PATCH. Chaque changement attend MATH_LAB_AUTOSAVE_MS
 * de calme avant de partir ; un seul envoi à la fois, et ce qui change
 * pendant l'envoi repart après. « حفظ » force l'envoi tout de suite.
 *
 * @param {import('./toolContract.js').MathLabTool} tool
 * @param {number | null} documentId      l'identifiant de l'URL, ou null pour un document neuf
 * ── Le مخبر ───────────────────────────────────────────────────────────────
 * Un instrument partagé s'ouvre dans مخبر المتوسط ou مخبر الثانوي
 * (labScope.js). Le crochet le RÉSOUT au chargement — le مخبر enregistré dans
 * le document d'abord, puis celui de l'URL (`requestedScope`), puis le
 * dernier choisi — et le rend (`scope`). L'outil ne voit jamais la clé
 * `labScope` de son état : elle est retirée à la lecture et remise à l'envoi,
 * avec le résumé de « أعمالي ».
 *
 * @param {{launch: object | null, defaultTitle: string, requestedScope?: string|null}} options
 */
export function useMathLabDocument(tool, documentId, { launch, defaultTitle, requestedScope = null }) {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  /**
   * La racine du مختبر DANS L'ESPACE DU LECTEUR.
   *
   * À la naissance d'un document, l'adresse est réécrite avec l'identifiant.
   * Elle l'était vers `/espace/atelier/...` en dur : un ENSEIGNANT, qui
   * travaille sous `/enseignant/atelier/...`, se retrouvait donc poussé dans
   * l'espace élève ~2,5 s après son premier geste. `/espace` n'accepte que le
   * rôle `student` (App.jsx), d'où la chaîne ProtectedRoute → /login →
   * HomeRedirect → l'accueil enseignant : l'instrument se fermait tout seul
   * au bout de quelques secondes, et le travail en cours partait avec lui.
   *
   * L'espace se lit donc ici, comme `MathLabToolPage` le fait déjà pour le
   * lien « retour au مختبر ». Cela vaut pour TOUS les instruments : le bogue
   * était dans la coquille partagée, pas dans l'un d'eux.
   */
  const labRoot = mathLabBasePath(useWorkspaceBase());

  const [load, setLoad] = useState({ status: 'loading', document: null, files: [], quota: null, loadKey: null, error: null, scope: null });
  const [title, setTitleState] = useState('');
  const [saveState, setSaveState] = useState('clean'); // clean | dirty | saving | saved | error
  const [lastSavedAt, setLastSavedAt] = useState(null);
  // Un refus d'accès ou de quota (403) : on ne réessaie PAS en boucle — le
  // serveur a dit non, et l'interface l'explique (FeatureLockedPanel).
  const [refusal, setRefusal] = useState(null);
  const refusedRef = useRef(false);

  const docRef = useRef(null);
  const pendingRef = useRef({ title: false, data: false });
  const inFlightRef = useRef(false);
  const timerRef = useRef(null);
  const loadSeqRef = useRef(0);
  const unmountedRef = useRef(false);
  const flushRef = useRef(null);

  const schedule = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => flushRef.current?.(), MATH_LAB_AUTOSAVE_MS);
  }, []);

  const flush = useCallback(async () => {
    clearTimeout(timerRef.current);
    const doc = docRef.current;
    if (!doc || !token || inFlightRef.current || refusedRef.current) return;
    const pending = pendingRef.current;
    if (!pending.title && !pending.data) return;

    inFlightRef.current = true;
    pendingRef.current = { title: false, data: false };
    if (!unmountedRef.current) setSaveState('saving');

    try {
      if (!isPersisted(doc)) {
        const { document } = await createMathLabDocument(token, {
          tool: doc.tool,
          title: cleanTitle(doc.title, defaultTitle),
          schemaVersion: doc.schemaVersion,
          data: attachLabScope(doc.data, doc.scope),
          // Le RÉSUMÉ part avec l'état, jamais séparément : « أعمالي » dessine
          // ainsi un aperçu juste dès la première sauvegarde.
          summary: attachScopeToSummary(summarizeDocument(tool, doc.data), doc.scope),
        });
        const saved = fromApiDocument(document);
        docRef.current = { ...docRef.current, id: saved.id, createdAt: saved.createdAt, updatedAt: saved.updatedAt };
        // Un travail de plus : le compteur « X متبقّية » change.
        refreshFeatureAccess(token);
        if (!unmountedRef.current) {
          setLoad((s) => ({ ...s, document: docRef.current }));
          // L'adresse dit maintenant QUEL document — sans recharger, sans
          // démonter l'outil (l'effet de chargement reconnaît l'identifiant).
          navigate(mathLabToolPath(tool, saved.id, labRoot, doc.scope), { replace: true });
        }
      } else {
        const patch = {};
        if (pending.title) patch.title = cleanTitle(doc.title, defaultTitle);
        if (pending.data) {
          patch.data = attachLabScope(doc.data, doc.scope);
          patch.schemaVersion = doc.schemaVersion;
          patch.summary = attachScopeToSummary(summarizeDocument(tool, doc.data), doc.scope);
        }
        const { document } = await updateMathLabDocument(token, doc.id, patch);
        docRef.current = { ...docRef.current, updatedAt: document?.updatedAt ?? docRef.current.updatedAt };
      }
      if (!unmountedRef.current) {
        setLastSavedAt(new Date());
        setSaveState(pendingRef.current.title || pendingRef.current.data ? 'dirty' : 'saved');
      }
    } catch (error) {
      // Ce qui n'est pas parti reste à envoyer : rien n'est perdu, on réessaiera.
      pendingRef.current = {
        title: pending.title || pendingRef.current.title,
        data: pending.data || pendingRef.current.data,
      };
      const refused = refusalFromError(error);
      if (refused) {
        refusedRef.current = true;
        reportRefusal(refused);
      }
      if (!unmountedRef.current) {
        setSaveState(refused ? 'blocked' : 'error');
        if (refused) setRefusal(refused);
      }
    } finally {
      inFlightRef.current = false;
      if (!unmountedRef.current && !refusedRef.current && (pendingRef.current.title || pendingRef.current.data)) schedule();
    }
  }, [token, tool, defaultTitle, navigate, schedule, labRoot]);
  flushRef.current = flush;

  // Le مخبر demandé ne compte que pour un document NEUF : un document
  // enregistré garde le sien, et changer l'URL ne le rouvre pas.
  const newDocumentScope = documentId == null ? requestedScope : null;

  // ── Chargement ──────────────────────────────────────────────────────────
  useEffect(() => {
    // L'identifiant qu'on vient de créer nous-mêmes : rien à recharger.
    if (documentId != null && docRef.current?.id === documentId) return undefined;
    // Un document neuf déjà ouvert dans ce مخبر : l'URL vient seulement de
    // recevoir son `?lab=` (MathLabToolPage la complète) — rien à rouvrir.
    if (documentId == null && docRef.current && !isPersisted(docRef.current)
      && docRef.current.scope === resolveToolScope(tool, { requested: requestedScope, remembered: readRememberedLabScope() })) {
      return undefined;
    }

    const seq = ++loadSeqRef.current;
    clearTimeout(timerRef.current);
    pendingRef.current = { title: false, data: false };
    refusedRef.current = false;
    setRefusal(null);
    setSaveState('clean');
    setLastSavedAt(null);

    if (documentId == null) {
      const seedTitle = launch?.title ? cleanTitle(launch.title, defaultTitle) : defaultTitle;
      const scope = resolveToolScope(tool, { requested: requestedScope, remembered: readRememberedLabScope() });
      const doc = {
        ...newMathLabDocument(tool, { title: seedTitle, seed: launch?.seed, scope, capabilities: toolCapabilities(tool, scope) }),
        scope,
      };
      docRef.current = doc;
      setTitleState(doc.title);
      setLoad({ status: 'ready', document: doc, files: [], quota: null, loadKey: `new-${seq}`, error: null, scope });

      return undefined;
    }

    docRef.current = null;
    setLoad({ status: 'loading', document: null, files: [], quota: null, loadKey: null, error: null, scope: null });
    fetchMathLabDocument(token, documentId)
      .then(({ document, files, quota }) => {
        if (seq !== loadSeqRef.current) return;
        const raw = fromApiDocument(document);
        // Un travail appartient au مخبر où il est né ; un document plus
        // ancien que les مخابر prend celui de l'URL, ou le dernier choisi.
        const scope = resolveToolScope(tool, {
          stored: storedLabScope(raw.data),
          requested: requestedScope,
          remembered: readRememberedLabScope(),
        });
        const doc = { ...raw, data: stripLabScope(raw.data), scope };
        docRef.current = doc;
        setTitleState(doc.title);
        // Les fichiers et les quotas viennent avec le document : un seul appel.
        setLoad({ status: 'ready', document: doc, files: files ?? [], quota: quota ?? null, loadKey: `doc-${documentId}-${seq}`, error: null, scope });
      })
      .catch((error) => {
        if (seq !== loadSeqRef.current) return;
        setLoad({ status: 'error', document: null, files: [], quota: null, loadKey: null, error, scope: null });
      });

    return undefined;
    // `launch` et `defaultTitle` ne rouvrent pas le document : ils ne comptent qu'à l'ouverture.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool, documentId, token, newDocumentScope]);

  // ── Départ ──────────────────────────────────────────────────────────────
  useEffect(() => {
    // Remis à zéro à CHAQUE montage : en développement, StrictMode joue un
    // démontage-remontage fictif, et sans cette ligne le crochet se croirait
    // démonté pour de bon — plus aucun état de sauvegarde, plus d'URL réécrite.
    unmountedRef.current = false;
    const warn = (event) => {
      if (pendingRef.current.title || pendingRef.current.data || inFlightRef.current) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);

    return () => {
      window.removeEventListener('beforeunload', warn);
      unmountedRef.current = true;
      clearTimeout(timerRef.current);
      // Un dernier envoi, sans attendre : la page suivante n'a pas à savoir.
      flushRef.current?.();
    };
  }, []);

  /**
   * Le document existe sur le serveur — ou y naît maintenant. Un fichier ne
   * peut se rattacher qu'à un document enregistré : le premier fichier d'une
   * سبّورة neuve commence par la faire naître. Rend l'identifiant, ou null
   * si l'envoi a échoué.
   */
  const ensurePersisted = useCallback(async () => {
    if (docRef.current?.id != null) return docRef.current.id;
    pendingRef.current.data = true;
    for (let i = 0; i < 100 && inFlightRef.current; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    await flushRef.current?.();

    return docRef.current?.id ?? null;
  }, []);

  const updateData = useCallback((data) => {
    if (!docRef.current) return;
    docRef.current = { ...docRef.current, data };
    pendingRef.current.data = true;
    if (refusedRef.current) return;
    setSaveState('dirty');
    schedule();
  }, [schedule]);

  const updateTitle = useCallback((next) => {
    if (!docRef.current) return;
    setTitleState(next);
    docRef.current = { ...docRef.current, title: next };
    pendingRef.current.title = true;
    setSaveState('dirty');
    schedule();
  }, [schedule]);

  return {
    status: load.status,
    document: load.document,
    files: load.files,
    quota: load.quota,
    loadKey: load.loadKey,
    // Le مخبر résolu (null pour un instrument commun, ou pendant le chargement).
    scope: load.scope,
    ensurePersisted,
    error: load.error,
    title,
    updateTitle,
    updateData,
    saveNow: flush,
    saveState,
    refusal,
    lastSavedAt,
    isPersisted: isPersisted(load.document),
  };
}
