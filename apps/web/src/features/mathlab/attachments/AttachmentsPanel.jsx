import { useContext, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, Image as ImageIcon, FileText, Shapes, Download, Trash2, Loader2, Check, CircleAlert, ImagePlus } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import { fetchMathLabFileBlob } from '../../../services/mathLabService';
import ConfirmDialog from '../../practice/notebook/space/ConfirmDialog';
import { formatBytes, isDocumentFull, isUserFull } from './attachmentPolicy';

const KIND_ICON = { image: ImageIcon, svg: Shapes, pdf: FileText };

/**
 * Le panneau des FICHIERS d'une سبّورة — dans le FLUX de la page, sous la barre,
 * jamais en surimpression : rien à positionner, rien qui puisse sortir de
 * l'écran, et elle défile en elle-même quand l'écran est bas (mathlab.css).
 *
 * Elle dit les limites AVANT le geste (compteurs, سبّورة pleine, compte
 * plein), n'envoie que ce que le plan accepte, et laisse à l'outil ce qui
 * lui revient : poser une image sur la سبّورة (`capability.place`), oublier
 * un fichier supprimé (`capability.forget`), fondre une bibliothèque ou un
 * dessin (`capability.importFile`).
 */
export default function AttachmentsPanel({ attachments, capability, onClose }) {
  const { t } = useTranslation('mathlab');
  const { token } = useContext(AuthContext);
  const inputRef = useRef(null);
  const [working, setWorking] = useState(null); // { id, action }
  const [pendingDelete, setPendingDelete] = useState(null);
  const { files, quota, busy, message, setMessage, upload, remove } = attachments;

  const documentFull = isDocumentFull(quota);
  const userFull = isUserFull(quota);
  const cannotAdd = Boolean(busy) || documentFull || userFull;

  const pick = () => { if (!cannotAdd) inputRef.current?.click(); };
  const onPicked = async (event) => {
    const selection = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (selection.length === 0) return;
    await upload(selection, { importFile: capability.importFile });
  };

  const withBlob = async (file, action, run, failKey) => {
    if (working) return;
    setWorking({ id: file.id, action });
    setMessage(null);
    try {
      const blob = await fetchMathLabFileBlob(token, file.id);
      await run(blob);
    } catch (error) {
      console.error('[mathlab] fichier :', action, error);
      setMessage({ tone: 'error', key: `files.errors.${error?.status === 404 ? 'notFound' : failKey}` });
    } finally {
      setWorking(null);
    }
  };

  const place = (file) => withBlob(file, 'place', (blob) => capability.place(file, blob), 'placeFailed');
  const download = (file) => withBlob(file, 'download', (blob) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = file.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'downloadFailed');

  const confirmDelete = async () => {
    const file = pendingDelete;
    setPendingDelete(null);
    if (!file) return;
    if (await remove(file.id)) capability.forget?.(file);
  };

  const messageText = message ? t(message.key, { ...message.params, defaultValue: t('files.errors.uploadFailed') }) : null;

  return (
    <section className="sa-ml-files" aria-labelledby="sa-ml-files-title" data-ml-files>
      <div className="sa-ml-files__head">
        <h2 id="sa-ml-files-title" className="sa-ml-files__title">{t('files.heading')}</h2>
        {quota && (
          <p className="sa-ml-files__counts" data-ml-files-counts>
            {quota.document && (
              <span className={documentFull ? 'sa-ml-files__count--full' : undefined} data-ml-files-board={`${quota.document.used}/${quota.document.max}`}>
                {t('files.boardCount', { used: quota.document.used, max: quota.document.max })}
              </span>
            )}
            <span className={userFull ? 'sa-ml-files__count--full' : undefined} data-ml-files-user={`${quota.user.used}/${quota.user.max}`}>
              {t('files.userCount', { used: quota.user.used, max: quota.user.max })}
            </span>
          </p>
        )}
        <div className="sa-ml-files__head-actions">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={capability.accept}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={onPicked}
            data-ml-files-input
          />
          <button type="button" className="sa-ml-btn sa-ml-btn--primary" onClick={pick} disabled={cannotAdd} aria-describedby="sa-ml-files-hint" data-ml-files-add>
            {busy ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
            <span className="sa-ml-btn__label">{t('files.add')}</span>
          </button>
          <button type="button" className="sa-ml-btn sa-ml-btn--icon" onClick={onClose} aria-label={t('files.close')} title={t('files.close')} data-ml-files-close>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
      <p id="sa-ml-files-hint" className="sa-ml-files__hint">{t('files.addHint')}</p>

      {(documentFull || userFull) && !busy && (
        <p className="sa-ml-files__msg sa-ml-files__msg--warn" role="status" data-ml-files-full={userFull ? 'user' : 'board'}>
          <CircleAlert size={16} aria-hidden="true" />
          <span>{userFull ? t('files.userFull', { max: quota.user.max }) : t('files.boardFull', { max: quota.document.max })}</span>
        </p>
      )}
      {busy && (
        <p className="sa-ml-files__msg sa-ml-files__msg--busy" role="status" aria-live="polite" data-ml-files-busy>
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          <span>{t('files.uploading', busy)}</span>
        </p>
      )}
      {message && !busy && (
        <p className={`sa-ml-files__msg sa-ml-files__msg--${message.tone}`} role={message.tone === 'error' ? 'alert' : 'status'} aria-live="polite" data-ml-files-message={message.tone}>
          {message.tone === 'error' ? <CircleAlert size={16} aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
          <span>{messageText}</span>
          <button type="button" className="sa-ml-files__dismiss" onClick={() => setMessage(null)} aria-label={t('shell.noticeDismiss')}>
            <X size={14} aria-hidden="true" />
          </button>
        </p>
      )}

      {files.length === 0 ? (
        <p className="sa-ml-files__empty" data-ml-files-empty>{t('files.empty')}</p>
      ) : (
        <ul className="sa-ml-files__list" data-ml-files-list>
          {files.map((file) => {
            const Icon = KIND_ICON[file.kind] ?? FileText;
            const size = formatBytes(file.size);
            const isWorking = working?.id === file.id;
            const placeable = capability.canPlace?.(file);

            return (
              <li key={file.id} className="sa-ml-file" data-ml-file={file.id} data-ml-file-kind={file.kind}>
                <span className="sa-ml-file__icon"><Icon size={18} aria-hidden="true" /></span>
                <span className="sa-ml-file__body">
                  <span className="sa-ml-file__name" dir="auto" title={file.name}>{file.name}</span>
                  <span className="sa-ml-file__meta" dir="ltr">{t(`files.kinds.${file.kind}`, { defaultValue: file.kind })} · {size.value} {t(`files.units.${size.unit}`)}</span>
                </span>
                <span className="sa-ml-file__actions">
                  {placeable && (
                    <button type="button" className="sa-ml-btn sa-ml-btn--icon" onClick={() => place(file)} disabled={Boolean(working)} aria-label={`${t('files.place')} — ${file.name}`} title={t('files.place')} data-ml-file-place>
                      {isWorking && working.action === 'place' ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <ImagePlus size={18} aria-hidden="true" />}
                    </button>
                  )}
                  <button type="button" className="sa-ml-btn sa-ml-btn--icon" onClick={() => download(file)} disabled={Boolean(working)} aria-label={`${t('files.download')} — ${file.name}`} title={t('files.download')} data-ml-file-download>
                    {isWorking && working.action === 'download' ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Download size={18} aria-hidden="true" />}
                  </button>
                  <button type="button" className="sa-ml-btn sa-ml-btn--icon sa-ml-btn--danger" onClick={() => setPendingDelete(file)} disabled={Boolean(working)} aria-label={`${t('files.delete')} — ${file.name}`} title={t('files.delete')} data-ml-file-delete>
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete != null}
        title={t('files.deleteTitle', { name: pendingDelete?.name ?? '' })}
        body={t('files.deleteBody')}
        confirmLabel={t('files.delete')}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
