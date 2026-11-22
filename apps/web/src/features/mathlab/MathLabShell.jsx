import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Save, Trash2, Download, Paperclip, Grid3x3, Maximize2, Minimize2, Loader2, Check, CloudOff, CircleAlert, X } from 'lucide-react';
import { ArrowBack } from '../../components/common/DirectionalIcons';
import ConfirmDialog from '../practice/notebook/space/ConfirmDialog';
import { mathLabBasePath } from './mathLabDocument';
import { useWorkspaceBase } from '../learning/learningViewer';
import { useFullscreen } from '../../lessons/common/classroom/useFullscreen';
import { fullscreenAction } from './overlay/overlayState.js';
import AttachmentsPanel from './attachments/AttachmentsPanel';
import './mathlab.css';

/**
 * La COQUILLE commune à tous les instruments du مختبر : une barre (retour,
 * icône et nom de l'outil, titre du document, état de sauvegarde, actions)
 * au-dessus d'un espace de travail qui prend TOUT le reste de l'écran.
 *
 * Les actions viennent de l'outil (`toolApi`, voir toolContract.js) : la
 * coquille n'affiche que celles qu'il expose, et c'est elle qui demande
 * confirmation avant « مسح الكل » — avec les textes de l'outil s'il en
 * fournit (`tools.<id>.clearTitle` / `clearBody`), ceux de la coquille
 * sinon. Un instrument qui n'exporte pas d'image n'a simplement pas ce bouton.
 */
export default function MathLabShell({
  tool, scope = null, labHome: labHomeProp = null, title, onTitleChange, saveState, isPersisted, onSave, toolApi, children,
  attachments = null, filesOpen = false, onToggleFiles = null, notice = null, onNoticeDismiss = null, banner = null,
}) {
  const { t } = useTranslation('mathlab');
  const rootRef = useRef(null);
  const barRef = useRef(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [gridOn, setGridOn] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(false);
  const { supported, isFullscreen, request, exit } = useFullscreen(rootRef);
  // Repli applicatif : API absente ou demande refusée → l'outil prend la fenêtre.
  const [appFullscreen, setAppFullscreen] = useState(false);
  const wide = isFullscreen || appFullscreen;
  const Icon = tool.icon;
  const toolName = t(tool.labelKey);
  const workspaceLabHome = mathLabBasePath(useWorkspaceBase());
  // « Retour » ramène au مخبر où l'instrument est ouvert (MathLabToolPage),
  // à l'accueil du مختبر pour la سبّورة.
  const labHome = labHomeProp ?? workspaceLabHome;

  useEffect(() => {
    setGridOn(Boolean(toolApi?.isGridEnabled?.()));
  }, [toolApi]);

  const toggleGrid = useCallback(() => {
    const next = toolApi?.toggleGrid?.();
    setGridOn(typeof next === 'boolean' ? next : Boolean(toolApi?.isGridEnabled?.()));
  }, [toolApi]);

  const toggleFullscreen = useCallback(async () => {
    switch (fullscreenAction({ wide, supported })) {
      case 'exit':
        setAppFullscreen(false);
        await exit();
        break;
      case 'requestBrowser':
        if (!(await request())) setAppFullscreen(true);
        break;
      default:
        setAppFullscreen(true);
    }
  }, [wide, supported, request, exit]);

  useEffect(() => {
    if (isFullscreen) setAppFullscreen(false);
  }, [isFullscreen]);

  // Échap quitte le repli applicatif (le plein écran natif gère le sien).
  useEffect(() => {
    if (!appFullscreen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setAppFullscreen(false); };
    document.addEventListener('keydown', onKey);

    return () => document.removeEventListener('keydown', onKey);
  }, [appFullscreen]);

  const exportPng = useCallback(async () => {
    if (!toolApi?.exportPng) return;
    setExporting(true);
    setExportError(false);
    try {
      const blob = await toolApi.exportPng();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${(title || toolName).replace(/[\\/:*?"<>|]+/g, ' ').trim() || toolName}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setExportError(true);
    } finally {
      setExporting(false);
    }
  }, [toolApi, title, toolName]);

  const status = statusFor(saveState, isPersisted);
  const hasFiles = Boolean(toolApi?.attachments) && Boolean(attachments);

  // La place dont disposent le panneau et l'espace de travail : tout
  // l'outil moins sa barre. Mesurée (et re-mesurée au redimensionnement)
  // plutôt que devinée en `dvh` — seule la coquille sait ce que les barres
  // de l'espace élève lui ont laissé.
  useEffect(() => {
    const root = rootRef.current;
    const bar = barRef.current;
    if (!root || !bar || typeof ResizeObserver === 'undefined') return undefined;
    const measure = () => {
      const available = Math.max(0, root.getBoundingClientRect().height - bar.getBoundingClientRect().height);
      root.style.setProperty('--sa-ml-avail', `${Math.round(available)}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(bar);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className={`sa-ml-tool${wide ? ' sa-ml-tool--wide' : ''}`}
      data-ml-tool={tool.id}
      data-ml-fullscreen={wide ? (isFullscreen ? 'browser' : 'app') : undefined}
    >
      <header ref={barRef} className="sa-ml-bar">
        <Link
          to={labHome}
          className="sa-ml-btn sa-ml-btn--icon"
          aria-label={t('shell.back')}
          title={t('shell.back')}
          data-ml-back
        >
          <ArrowBack size={18} aria-hidden="true" />
        </Link>

        <span className="sa-ml-toolname" title={toolName}>
          <Icon size={18} className="text-blue-500 flex-shrink-0" aria-hidden="true" />
          <span className="sa-ml-toolname__label">{toolName}</span>
          {scope && (
            <span className={`sa-ml-scope-badge sa-ml-scope-badge--${scope}`} data-ml-scope-badge={scope} title={t(`labs.${scope}.name`)}>
              {t(`labs.${scope}.short`)}
            </span>
          )}
        </span>

        <input
          type="text"
          className="sa-ml-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          aria-label={t('shell.titleLabel')}
          placeholder={t('shell.titlePlaceholder')}
          maxLength={160}
          autoComplete="off"
          spellCheck={false}
          data-ml-title
        />

        <span
          className={`sa-ml-status sa-ml-status--${status.tone}`}
          role={status.tone === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          data-ml-status={saveState}
        >
          <status.icon size={14} aria-hidden="true" className={status.spin ? 'animate-spin' : undefined} />
          <span className="sa-ml-status__label">{t(status.key)}</span>
        </span>

        <div className="sa-ml-actions" role="group" aria-label={toolName}>
          {toolApi?.toggleGrid && (
            <button
              type="button"
              className="sa-ml-btn sa-ml-btn--icon"
              onClick={toggleGrid}
              aria-pressed={gridOn}
              aria-label={gridOn ? t('shell.gridHide') : t('shell.gridShow')}
              title={gridOn ? t('shell.gridHide') : t('shell.gridShow')}
              data-ml-grid
            >
              <Grid3x3 size={18} aria-hidden="true" />
            </button>
          )}
          {hasFiles && (
            <button
              type="button"
              className="sa-ml-btn sa-ml-btn--icon"
              onClick={onToggleFiles}
              aria-pressed={filesOpen}
              aria-expanded={filesOpen}
              aria-controls="sa-ml-files-title"
              aria-label={`${t('shell.files')} — ${t('shell.filesHint')}`}
              title={`${t('shell.files')} — ${t('shell.filesHint')}`}
              data-ml-files-toggle
            >
              <Paperclip size={18} aria-hidden="true" />
              {attachments.files.length > 0 && <span className="sa-ml-badge" aria-hidden="true">{attachments.files.length}</span>}
            </button>
          )}
          {toolApi?.exportPng && (
            <button
              type="button"
              className="sa-ml-btn sa-ml-btn--icon"
              onClick={exportPng}
              disabled={exporting}
              aria-label={exportError ? t('shell.exportError') : t('shell.exportPng')}
              title={exportError ? t('shell.exportError') : t('shell.exportPng')}
              data-ml-export
            >
              {exporting ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Download size={18} aria-hidden="true" />}
            </button>
          )}
          {toolApi?.clear && (
            <button
              type="button"
              className="sa-ml-btn sa-ml-btn--icon sa-ml-btn--danger"
              onClick={() => setConfirmClear(true)}
              aria-label={t('shell.clear')}
              title={t('shell.clear')}
              data-ml-clear
            >
              <Trash2 size={18} aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            className="sa-ml-btn sa-ml-btn--icon"
            onClick={toggleFullscreen}
            aria-pressed={wide}
            aria-label={wide ? t('overlay.fullscreenExit') : t('overlay.fullscreenEnter')}
            title={wide ? t('overlay.fullscreenExit') : t('overlay.fullscreenEnter')}
            data-ml-fullscreen-toggle
          >
            {wide ? <Minimize2 size={18} aria-hidden="true" /> : <Maximize2 size={18} aria-hidden="true" />}
          </button>
          <button
            type="button"
            className="sa-ml-btn sa-ml-btn--primary"
            onClick={onSave}
            disabled={saveState === 'saving' || saveState === 'clean' || saveState === 'saved' || saveState === 'blocked'}
            aria-label={t('shell.save')}
            title={t('shell.save')}
            data-ml-save
          >
            <Save size={18} aria-hidden="true" />
            <span className="sa-ml-btn__label">{t('shell.save')}</span>
          </button>
        </div>
      </header>

      {banner && <div className="px-4 pt-3" data-ml-banner>{banner}</div>}
      {notice && <Notice notice={notice} onDismiss={onNoticeDismiss} />}

      {hasFiles && filesOpen && (
        <AttachmentsPanel attachments={attachments} capability={toolApi.attachments} onClose={onToggleFiles} />
      )}

      <div className="sa-ml-workspace">{children}</div>

      <ConfirmDialog
        open={confirmClear}
        title={t([`tools.${tool.id}.clearTitle`, 'shell.clearTitle'])}
        body={t([`tools.${tool.id}.clearBody`, 'shell.clearBody'])}
        confirmLabel={t('shell.clear')}
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => { setConfirmClear(false); toolApi?.clear?.(); }}
      />
    </div>
  );
}

function statusFor(saveState, isPersisted) {
  switch (saveState) {
    case 'saving': return { key: 'shell.saving', tone: 'busy', icon: Loader2, spin: true };
    case 'dirty': return { key: 'shell.dirty', tone: 'dirty', icon: CloudOff };
    case 'error': return { key: 'shell.saveError', tone: 'error', icon: CircleAlert };
    case 'blocked': return { key: 'shell.saveBlocked', tone: 'error', icon: CircleAlert };
    case 'saved': return { key: 'shell.saved', tone: 'saved', icon: Check };
    default: return isPersisted
      ? { key: 'shell.saved', tone: 'saved', icon: Check }
      : { key: 'shell.draft', tone: 'draft', icon: CloudOff };
  }
}

/**
 * Un mot pour l'élève, dans le FLUX de la page (entre la barre et l'espace
 * de travail), jamais en surimpression : rien à positionner, rien qui puisse
 * sortir de l'écran ou passer derrière le canevas, à toute taille. Un succès
 * s'efface seul ; le reste attend qu'on le ferme.
 */
function Notice({ notice, onDismiss }) {
  const { t } = useTranslation('mathlab');
  const tone = notice.tone ?? 'error';

  useEffect(() => {
    if (tone !== 'success') return undefined;
    const timer = setTimeout(() => onDismiss?.(), 6000);

    return () => clearTimeout(timer);
  }, [notice, tone, onDismiss]);

  const Icon = tone === 'error' ? CircleAlert : Check;

  return (
    <div className={`sa-ml-notice sa-ml-notice--${tone}`} role={tone === 'error' ? 'alert' : 'status'} aria-live="polite" data-ml-notice={tone}>
      <Icon size={16} className="flex-shrink-0" aria-hidden="true" />
      <span className="sa-ml-notice__text">{notice.text ?? t(notice.key, { ...notice.params, defaultValue: notice.key })}</span>
      {onDismiss && (
        <button type="button" className="sa-ml-btn sa-ml-btn--icon sa-ml-notice__close" onClick={onDismiss} aria-label={t('shell.noticeDismiss')} title={t('shell.noticeDismiss')}>
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
