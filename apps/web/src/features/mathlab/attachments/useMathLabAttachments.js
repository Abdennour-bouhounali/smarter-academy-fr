import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { deleteMathLabFile, fetchMathLabFiles, fetchMathLabQuota, uploadMathLabFile } from '../../../services/mathLabService';
import { errorKeyFrom, planSelection } from './attachmentPolicy';

/**
 * Les fichiers d'un document du مختبر, côté client : la liste, les
 * compteurs, l'envoi, la suppression.
 *
 * Les compteurs sont ceux du SERVEUR : ils arrivent avec le document, et
 * chaque réponse (envoi, refus, suppression) les remet à jour. Le client ne
 * les calcule jamais lui-même au-delà d'un « +1 » que la réponse confirme
 * aussitôt. Une sélection est jugée en entier AVANT le premier envoi
 * (`planSelection`) ; les envois partent ensuite un par un, et le premier
 * refus arrête la suite — le serveur reste le seul juge.
 *
 * Un document neuf n'a pas d'identifiant : le premier fichier commence par
 * faire naître le document (`ensurePersisted`).
 *
 * @param {{documentId: number|null, initialFiles: object[], initialQuota: object|null, loadKey: string|null,
 *   ensurePersisted: () => Promise<number|null>}} options
 */
export function useMathLabAttachments({ documentId, initialFiles, initialQuota, loadKey, ensurePersisted }) {
  const { token } = useContext(AuthContext);
  const [files, setFiles] = useState(initialFiles ?? []);
  const [quota, setQuota] = useState(initialQuota ?? null);
  const [busy, setBusy] = useState(null); // { name, index, total } pendant un envoi
  const [message, setMessage] = useState(null); // { tone: 'success' | 'error', key, params }
  const busyRef = useRef(false);
  const quotaAskedRef = useRef(false);

  // Un autre document ouvert (loadKey change) : on repart de ce qu'il apporte.
  useEffect(() => {
    setFiles(initialFiles ?? []);
    setQuota(initialQuota ?? null);
    setMessage(null);
    quotaAskedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadKey]);

  // Une سبّورة neuve n'a pas de document, mais l'élève a déjà un total : on le demande une fois.
  useEffect(() => {
    if (documentId != null || !token || quotaAskedRef.current) return;
    quotaAskedRef.current = true;
    fetchMathLabQuota(token)
      // Une سبّورة pas encore enregistrée n'a pas de document côté serveur,
      // donc pas de compteur « dans cette سبّورة » — il vaut 0, et l'élève
      // doit le lire tout de suite, pas après son premier fichier.
      .then((res) => setQuota((q) => q ?? { ...res.quota, document: { used: 0, max: res.quota?.limits?.maxFilesPerDocument ?? 3 } }))
      .catch(() => {});
  }, [documentId, token]);

  const refresh = useCallback(async () => {
    if (documentId == null || !token) return;
    try {
      const res = await fetchMathLabFiles(token, documentId);
      setFiles(res.files ?? []);
      setQuota(res.quota ?? null);
    } catch (error) {
      setMessage({ tone: 'error', key: `files.errors.${errorKeyFrom(error) === 'uploadFailed' ? 'loadFailed' : errorKeyFrom(error)}` });
    }
  }, [documentId, token]);

  /**
   * @param {File[]} selection
   * @param {{importFile?: (file: File) => Promise<{count: number}>}} options
   */
  const upload = useCallback(async (selection, { importFile } = {}) => {
    if (busyRef.current || !token) return;
    const plan = planSelection(selection, quota);
    if (plan.error) {
      setMessage({ tone: 'error', key: `files.errors.${plan.error.code}`, params: { count: plan.error.count, name: plan.error.name } });
      return;
    }
    busyRef.current = true;
    setMessage(null);
    let uploaded = 0;
    let imported = 0;
    try {
      // Les formes et dessins se fondent dans la سبّورة : pas de fichier, pas de quota.
      for (const { file } of plan.imports) {
        if (!importFile) continue;
        setBusy({ name: file.name, index: 1, total: 1 });
        try {
          const { count } = await importFile(file);
          imported += count;
        } catch (error) {
          const code = typeof error?.code === 'string' ? error.code : 'failed';
          (code === 'failed' || code === 'unreadable' ? console.error : console.warn)('[mathlab] import refusé :', code, error?.cause ?? error);
          setMessage({ tone: 'error', key: `shell.importErrors.${code}` });
          return;
        }
      }

      if (plan.attachments.length > 0) {
        const id = documentId ?? await ensurePersisted();
        if (id == null) {
          setMessage({ tone: 'error', key: 'files.errors.saveFirst' });
          return;
        }
        for (const [index, file] of plan.attachments.entries()) {
          setBusy({ name: file.name, index: index + 1, total: plan.attachments.length });
          try {
            const res = await uploadMathLabFile(token, id, file);
            setFiles((prev) => [...prev, res.file]);
            setQuota(res.quota ?? null);
            uploaded += 1;
          } catch (error) {
            console.error('[mathlab] envoi refusé :', error?.code ?? error?.status, error);
            if (error?.data?.quota) setQuota(error.data.quota);
            setMessage({ tone: 'error', key: `files.errors.${errorKeyFrom(error)}`, params: { name: file.name } });
            return;
          }
        }
      }

      // Toujours un mot, même quand rien n'a bougé : réimporter une
      // bibliothèque déjà présente n'ajoute rien, et le silence se lirait
      // comme un échec.
      if (uploaded > 0) {
        setMessage({ tone: 'success', key: 'files.uploadDone', params: { count: uploaded } });
      } else if (plan.imports.length > 0) {
        setMessage({ tone: 'success', key: 'shell.importDone', params: { count: imported } });
      }
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  }, [token, quota, documentId, ensurePersisted]);

  const remove = useCallback(async (id) => {
    if (!token) return false;
    try {
      const res = await deleteMathLabFile(token, id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      setQuota(res.quota ?? null);
      setMessage(null);

      return true;
    } catch (error) {
      console.error('[mathlab] suppression refusée :', error?.code ?? error?.status, error);
      if (error?.status === 404) {
        // Déjà parti (un autre onglet) : la liste se remet d'aplomb.
        setFiles((prev) => prev.filter((f) => f.id !== id));
        refresh();
      }
      setMessage({ tone: 'error', key: `files.errors.${error?.status === 404 ? 'notFound' : 'deleteFailed'}` });

      return false;
    }
  }, [token, refresh]);

  return { files, quota, busy, message, setMessage, upload, remove, refresh };
}
