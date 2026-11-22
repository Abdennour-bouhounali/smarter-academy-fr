/**
 * « le dossier de la leçon » — the teacher's work file of ONE lesson, on its own full-screen page (owner, 2026-11-18: « the whiteboard
 * must be separated completely from the lab… create for each lesson a work file that the teacher edits, and when he exits
 * he returns to the lesson's page, not the lab; adapt the colours to the design », then « it must be displayed without
 * hiding the right nav and the top header… hidden only if the full screen gets activated »; CLASS_SESSION.md §2ter).
 * So the page lives INSIDE the teacher's space, under the common header of the lesson's tools; the whiteboard's own
 * full-screen button is what covers them.
 *
 * The instrument is the Math Lab's whiteboard, used exactly as it is (its pens, its text, its images under the lab's
 * quota, its autosave) — mounted here with the lesson's own document. Nothing around it belongs to the lab: no lab
 * navigation, the way out is the lesson, the palette is the calm one of the teacher's screens (`lessonFile.css`).
 */
import { Suspense, lazy, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import TurnPhone from '../../components/common/TurnPhone';
import { useMediaQuery } from '../../features/mathlab/tools/probabilityStats/useMediaQuery';
import { UPRIGHT_PHONE } from '../../lessons/common/gameworld/engine/phoneScreen';
import { getLessonById, getLessonPath } from '@smarter-academy/core';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { fetchMathLabFileBlob } from '../../services/mathLabService';
import MathLabShell from '../../features/mathlab/MathLabShell';
import { useMathLabDocument } from '../../features/mathlab/useMathLabDocument';
import { useMathLabAttachments } from '../../features/mathlab/attachments/useMathLabAttachments';
import { toolCapabilities } from '../../features/mathlab/labScope';
import { whiteboardTool } from '../../features/mathlab/tools/whiteboard/index.js';
import { lessonFileDocumentId, lessonFileTitle } from '../../features/classSession/lessonFileDoc';
import { LessonToolPage } from '../../features/classSession/LessonToolsBar';
import './lessonFile.css';

const Whiteboard = lazy(whiteboardTool.load);
const L = {
  turn: 'Tournez votre téléphone',
  turnSay: 'Le dossier de la leçon est un tableau\u00a0: il s’ouvre avec le téléphone à l’horizontale.',
  title: 'Dossier de la leçon',
  loading: 'Ouverture du dossier de la leçon…',
  failed: 'Impossible d’ouvrir le dossier de la leçon. Vérifiez la connexion, puis réessayez.',
  back: 'Retour à la leçon',
};

function FileBoard({ documentId, lessonPath, title }) {
  const { token } = useContext(AuthContext);
  const model = useMathLabDocument(whiteboardTool, documentId, {
    launch: null,
    defaultTitle: title,
    requestedScope: null,
  });
  const capabilities = useMemo(() => toolCapabilities(whiteboardTool, model.scope), [model.scope]);
  const [toolApi, setToolApi] = useState(null);
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
  return (
    <MathLabShell
      tool={whiteboardTool}
      scope={model.scope}
      labHome={lessonPath}
      title={model.title}
      onTitleChange={model.updateTitle}
      saveState={model.saveState}
      isPersisted={model.isPersisted}
      onSave={model.saveNow}
      toolApi={toolApi}
      attachments={attachments}
      filesOpen={filesOpen}
      onToggleFiles={() => setFilesOpen((o) => !o)}
      notice={notice}
      onNoticeDismiss={() => setNotice(null)}
    >
      {model.status === 'loading' && (
        <p className="lf-wait" aria-busy="true">
          {L.loading}
        </p>
      )}
      {model.status === 'error' && (
        <p className="lf-wait" role="alert">
          {L.failed} <Link to={lessonPath}>{L.back}</Link>
        </p>
      )}
      {model.status === 'ready' && (
        <Suspense
          fallback={
            <p className="lf-wait" aria-busy="true">
              {L.loading}
            </p>
          }
        >
          <Whiteboard
            key={model.loadKey}
            initialData={model.document.data}
            title={model.title}
            onChange={model.updateData}
            onReady={setToolApi}
            scope={model.scope}
            capabilities={capabilities}
            attachments={toolAttachments}
            onNotice={setNotice}
          />
        </Suspense>
      )}
    </MathLabShell>
  );
}

export default function LessonFilePage() {
  const { lessonId } = useParams();
  const { token } = useContext(AuthContext);
  const lesson = getLessonById(lessonId);
  const lessonPath = getLessonPath(lessonId) ?? '/enseignant/cours';
  const title = lessonFileTitle(lesson?.title ?? lessonId);
  useDocumentMeta(title);
  // a whiteboard needs the width: a phone held upright is asked to turn (owner, 2026-11-16: « must be opened on landscape »)
  // …a PHONE only (a touch screen): a laptop always opens the file, however narrow its window is
  const upright = useMediaQuery(`${UPRIGHT_PHONE} and (pointer: coarse)`);
  const [documentId, setDocumentId] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!token) return undefined;
    let off = false;
    lessonFileDocumentId(token, lessonId, lesson?.title ?? lessonId)
      .then((id) => !off && setDocumentId(id))
      .catch(() => !off && setFailed(true));
    return () => {
      off = true;
    };
  }, [token, lessonId]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <LessonToolPage lessonId={lessonId} active="file">
      <div className="lf-stage" data-lesson-file={lessonId} data-lf-document={documentId ?? ''}>
        {upright ? (
          <TurnPhone cover={false} title={L.turn} body={L.turnSay} data-lf-turn />
        ) : failed ? (
          <p className="lf-wait" role="alert">
            {L.failed} <Link to={lessonPath}>{L.back}</Link>
          </p>
        ) : documentId == null ? (
          <p className="lf-wait" aria-busy="true">
            {L.loading}
          </p>
        ) : (
          <FileBoard documentId={documentId} lessonPath={lessonPath} title={title} />
        )}
      </div>
    </LessonToolPage>
  );
}
