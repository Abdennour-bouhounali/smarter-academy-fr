import { Suspense, lazy, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { AuthContext } from '../../context/AuthContext';
import { fetchMathLabFileBlob } from '../../services/mathLabService';
import { useMathLabAttachments } from './attachments/useMathLabAttachments';
import { getMathLabToolBySlug } from './toolRegistry';
import { mathLabBasePath, mathLabToolPath, parseDocumentId } from './mathLabDocument';
import { labHomePath, readLabScopeParam, rememberLabScope, toolCapabilities } from './labScope';
import { useWorkspaceBase } from '../learning/learningViewer';
import { readMathLabLaunch } from './openMathLab';
import { useMathLabDocument } from './useMathLabDocument';
import MathLabShell from './MathLabShell';
import FeatureLockedPanel from '../../components/access/FeatureLockedPanel';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';
import { featureState, toolFeatureKey } from '../access/featureAccess';

// Un composant paresseux par instrument, créé UNE fois par module : `lazy`
// dans le rendu recréerait le composant — et remonterait l'outil — à chaque rendu.
const lazyComponents = new Map();
function lazyToolComponent(tool) {
  if (!lazyComponents.has(tool.id)) lazyComponents.set(tool.id, lazy(tool.load));

  return lazyComponents.get(tool.id);
}

/**
 * /espace/atelier/:toolSlug            un document neuf dans cet instrument
 * /espace/atelier/:toolSlug/:documentId  un document enregistré
 *
 * La page résout l'instrument par son segment d'URL, charge son composant
 * paresseusement, ouvre le document et rend la coquille. Elle ne sait RIEN
 * de l'outil lui-même : un instrument de plus n'y change pas une ligne.
 */
export default function MathLabToolPage() {
  const { toolSlug, documentId: rawId } = useParams();
  const tool = getMathLabToolBySlug(toolSlug);
  const labHome = mathLabBasePath(useWorkspaceBase());

  if (!tool) return <Navigate to={labHome} replace />;

  return <ToolGate key={tool.id} tool={tool} documentId={parseDocumentId(rawId)} labHome={labHome} />;
}

/**
 * La porte de l'instrument : le RÉSUMÉ du serveur dit s'il est ouvert à ce
 * compte. Fermé → on explique (FeatureLockedPanel), on ne monte ni l'outil ni
 * le document. C'est de l'interface : même en contournant cette porte, le
 * serveur refuse d'ouvrir, d'enregistrer ou de copier un travail de cet
 * instrument (403). Tant que le résumé n'est pas arrivé, on ne ferme rien.
 */
function ToolGate({ tool, documentId, labHome }) {
  const { t } = useTranslation('mathlab');
  const { summary } = useFeatureAccess();
  const access = featureState(summary, toolFeatureKey(tool.id));

  if (access.known && !access.allowed) {
    return (
      <div className="sa-page py-10" data-ml-tool-locked={tool.id}>
        <h1 className="font-space font-bold text-2xl text-slate-900 mb-4">{t(tool.labelKey)}</h1>
        <FeatureLockedPanel reason={access.reason} />
        <p className="mt-4 text-center"><Link to={labHome} className="sa-ml-btn sa-ml-btn--primary">{t('shell.backToLab')}</Link></p>
      </div>
    );
  }

  return <ToolPage tool={tool} documentId={documentId} />;
}

function ToolPage({ tool, documentId }) {
  const { t } = useTranslation('mathlab');
  const location = useLocation();
  const navigate = useNavigate();
  const toolName = t(tool.labelKey);
  // L'accueil du مختبر dépend de l'espace (élève ou enseignant) : il se lit
  // ICI, au corps du composant. Appeler le hook dans le JSX d'une branche
  // d'erreur changerait le NOMBRE de hooks d'un rendu à l'autre — React
  // lève alors « Rendered more hooks than during the previous render ».
  const labRoot = mathLabBasePath(useWorkspaceBase());
  useDocumentMeta(`${toolName} — ${t('title')}`);

  const launch = useMemo(() => readMathLabLaunch(location.state, tool.id), [location.state, tool.id]);
  const requestedScope = readLabScopeParam(location.search);
  const model = useMathLabDocument(tool, documentId, { launch, defaultTitle: t(tool.defaultTitleKey), requestedScope });
  // Le مخبر où l'instrument est ouvert (labScope.js) : ce qu'il montre, et où
  // ramène « retour ». Null pour la سبّورة, commune à tous.
  const scope = model.scope;
  const capabilities = useMemo(() => toolCapabilities(tool, scope), [tool, scope]);
  const labHome = labHomePath(labRoot, scope);

  // L'URL dit toujours dans quel مخبر on est : un document rouvert depuis
  // « أعمالي » (sans `?lab=`) ou un lien nu reçoit le sien. Sans recharger :
  // le crochet reconnaît le document déjà ouvert.
  useEffect(() => {
    if (model.status !== 'ready' || !scope) return;
    rememberLabScope(scope);
    if (requestedScope === scope) return;
    navigate(`${mathLabToolPath(tool, model.document?.id ?? null, labRoot, scope)}${location.hash}`, { replace: true, state: location.state });
  }, [model.status, model.document?.id, scope, requestedScope, tool, labRoot, navigate, location.hash, location.state]);
  const [toolApi, setToolApi] = useState(null);
  const ToolComponent = lazyToolComponent(tool);

  // Les fichiers du document (serveur) et le panneau qui les montre. La
  // coquille et l'outil lisent la même liste ; l'outil reçoit aussi de quoi
  // lire les octets pour recharger ses images.
  const { token } = useContext(AuthContext);
  const [filesOpen, setFilesOpen] = useState(false);
  const [notice, setNotice] = useState(null);
  const attachments = useMathLabAttachments({
    documentId: model.document?.id ?? documentId,
    initialFiles: model.files,
    initialQuota: model.quota,
    loadKey: model.loadKey,
    ensurePersisted: model.ensurePersisted,
  });
  const loadBlob = useCallback((file) => fetchMathLabFileBlob(token, file.id), [token]);
  const toolAttachments = useMemo(() => ({ files: attachments.files, loadBlob }), [attachments.files, loadBlob]);
  const toggleFiles = useCallback(() => setFilesOpen((open) => !open), []);
  const dismissNotice = useCallback(() => setNotice(null), []);

  return (
    <MathLabShell
      tool={tool}
      scope={scope}
      labHome={labHome}
      title={model.title}
      onTitleChange={model.updateTitle}
      saveState={model.saveState}
      isPersisted={model.isPersisted}
      onSave={model.saveNow}
      toolApi={toolApi}
      attachments={attachments}
      filesOpen={filesOpen}
      onToggleFiles={toggleFiles}
      notice={notice}
      onNoticeDismiss={dismissNotice}
      banner={model.refusal
        ? <FeatureLockedPanel compact reason={model.refusal.reason} quota={model.refusal.quota} resource="documents" />
        : null}
    >
      {model.status === 'loading' && (
        <div className="sa-ml-placeholder" aria-busy="true" data-ml-loading>
          <Loader2 size={22} className="animate-spin text-blue-500" aria-hidden="true" />
          <span>{t('shell.loading')}</span>
        </div>
      )}
      {model.status === 'error' && (
        <div className="sa-ml-placeholder" role="alert" data-ml-error>
          <p className="font-space font-bold text-slate-900">
            {model.error?.status === 404 ? t('shell.notFound') : t('shell.loadError')}
          </p>
          <Link to={labHome} className="sa-ml-btn sa-ml-btn--primary mt-2">{t('shell.backToLab')}</Link>
        </div>
      )}
      {model.status === 'ready' && (
        <Suspense
          fallback={(
            <div className="sa-ml-placeholder" aria-busy="true" data-ml-loading>
              <Loader2 size={22} className="animate-spin text-blue-500" aria-hidden="true" />
              <span>{t('shell.loading')}</span>
            </div>
          )}
        >
          <ToolComponent
            key={model.loadKey}
            initialData={model.document.data}
            title={model.title}
            onChange={model.updateData}
            onReady={setToolApi}
            scope={scope}
            capabilities={capabilities}
            attachments={toolAttachments}
            onNotice={setNotice}
          />
        </Suspense>
      )}
    </MathLabShell>
  );
}
