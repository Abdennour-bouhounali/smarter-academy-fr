import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Excalidraw, MainMenu, WelcomeScreen,
  exportToBlob, exportToCanvas, serializeAsJSON, getSceneVersion, convertToExcalidrawElements, CaptureUpdateAction, viewportCoordsToSceneCoords,
  getCommonBounds,
} from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import './whiteboard.css';
import { scopedStorage } from '../../../../utils/storage';
import { ATTACHMENT_ACCEPT } from '../../attachments/attachmentPolicy.js';
import { toExcalidrawInitialData, toWhiteboardData, whiteboardChangeSignature } from './whiteboardState.js';
import { WhiteboardImportError, checkImportFile, parseLibraryText } from './whiteboardImport.js';
import GeometryDesk from './geometry/GeometryDesk.jsx';
import './geometry/geometry.css';

// Les polices d'Excalidraw sont servies par NOUS (public/excalidraw/README.md),
// pas par son CDN de repli. Déclaré au chargement du module, donc avant le
// premier rendu — Excalidraw le lit à la première police demandée.
if (typeof window !== 'undefined' && window.EXCALIDRAW_ASSET_PATH === undefined) {
  window.EXCALIDRAW_ASSET_PATH = '/excalidraw/';
}

/**
 * Ce qu'Excalidraw n'offre PAS ici, et pourquoi :
 *  - image : les images entrent par le panneau « الملفات » (fichiers du
 *    serveur, sous quota), jamais par un collage ou un glisser-déposer qui
 *    les enfouirait en base64 dans le document ;
 *  - « فتح » dans le menu de la bibliothèque (whiteboard.css) : l'import
 *    passe par le même panneau, avec un vrai filtre et des refus nommés ;
 *  - loadScene / saveToActiveFile / export : le document vit sur le serveur,
 *    pas dans les fichiers de l'élève — la coquille tient « حفظ » ;
 *  - clearCanvas : la coquille tient « مسح الكل », AVEC confirmation ;
 *  - toggleTheme : la plateforme est claire.
 * « Enregistrer en image » et « fond » restent dans son menu ☰.
 */
const UI_OPTIONS = Object.freeze({
  canvasActions: {
    loadScene: false,
    saveToActiveFile: false,
    export: false,
    saveAsImage: true,
    toggleTheme: false,
    changeViewBackgroundColor: true,
    clearCanvas: false,
  },
  tools: { image: false },
});

/**
 * Le JARDIN CLOS (docs/architecture/PARENT_SPACE.md §7) : la سبّورة est la
 * seule surface de l'espace élève où l'élève pourrait faire entrer le web.
 * Excalidraw accepte par défaut d'y INTÉGRER YouTube, Vimeo, Figma… (outil
 * « embeddable », ou un lien collé) et ouvre dans un nouvel onglet le lien
 * posé sur une forme. Ici : aucune intégration, et aucun lien sortant ne
 * s'ouvre (un lien vers la plateforme elle-même reste permis).
 * Verrouillé par pages/studentClosedGarden.test.js.
 */
const BLOCK_ALL_EMBEDS = () => false;

function keepLinksInside(element, event) {
  const link = String(element?.link || '');
  if (/^[a-z][a-z0-9+.-]*:/i.test(link) && !link.startsWith(window.location.origin)) {
    event.preventDefault();
  }
}

/** Le délai entre un trait et sa sérialisation : un dessin en cours bouge à chaque pixel. */
const SERIALIZE_MS = 300;

/** Une image posée sur la سبّورة ne dépasse pas cette taille à l'arrivée (unités de scène). */
const PLACED_IMAGE_MAX = 480;

/**
 * La bibliothèque de formes de l'élève, gardée dans le navigateur (clé par
 * élève, `scopedStorage`). Excalidraw ne la persiste pas lui-même : sans ceci,
 * une bibliothèque importée disparaissait au rechargement. Ce n'est pas le
 * document — la bibliothèque n'appartient à aucune سبّورة en particulier —
 * et localStorage reste un confort : son absence ne casse rien.
 */
const LIBRARY_STORAGE_KEY = 'sa_ml_whiteboard_library';
const LIBRARY_STORAGE_MAX_BYTES = 1_500_000;

function readStoredLibrary() {
  try {
    const raw = scopedStorage.getItem(LIBRARY_STORAGE_KEY);
    const items = raw ? JSON.parse(raw) : null;

    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

function storeLibrary(items) {
  try {
    const raw = JSON.stringify(items ?? []);
    if (raw.length > LIBRARY_STORAGE_MAX_BYTES) return;
    scopedStorage.setItem(LIBRARY_STORAGE_KEY, raw);
  } catch {
    // Quota ou navigation privée : la bibliothèque vit le temps de la session.
  }
}

/** L'identifiant Excalidraw d'un fichier du serveur : stable, lisible, sans collision avec un collage. */
export const attachmentFileId = (file) => `sa-${file.id}`;

/** La marge de l'export PNG, en unités de scène (celle qu'Excalidraw ajoute autour du dessin). */
const EXPORT_PADDING = 32;

/**
 * L'export « مع أدوات الهندسة » : le dessin d'Excalidraw, dans un cadre
 * élargi aux instruments, puis les instruments DESSINÉS par-dessus — le même
 * balisage SVG qu'à l'écran, en coordonnées de scène. Deux rectangles
 * invisibles, passés à l'export seulement (jamais à la scène), fixent le
 * cadre : on sait donc exactement où tombe l'origine de la scène dans l'image.
 */
async function exportWithInstruments(api, desk) {
  const elements = api.getSceneElements();
  const box = desk.instrumentsBounds();
  const [ex1, ey1, ex2, ey2] = elements.length ? getCommonBounds(elements) : [box.minX, box.minY, box.maxX, box.maxY];
  const minX = Math.min(ex1, box.minX); const minY = Math.min(ey1, box.minY);
  const maxX = Math.max(ex2, box.maxX); const maxY = Math.max(ey2, box.maxY);
  const frame = convertToExcalidrawElements([
    { type: 'rectangle', x: minX, y: minY, width: 1, height: 1, strokeColor: 'transparent', backgroundColor: 'transparent' },
    { type: 'rectangle', x: maxX - 1, y: maxY - 1, width: 1, height: 1, strokeColor: 'transparent', backgroundColor: 'transparent' },
  ]);
  const canvas = await exportToCanvas({
    elements: [...elements, ...frame],
    appState: { ...api.getAppState(), exportBackground: true, exportWithDarkMode: false },
    files: api.getFiles(),
    exportPadding: EXPORT_PADDING,
  });
  const k = canvas.width / (maxX - minX + 2 * EXPORT_PADDING);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" `
    + `viewBox="${minX - EXPORT_PADDING} ${minY - EXPORT_PADDING} ${canvas.width / k} ${canvas.height / k}">${desk.instrumentsMarkup()}</svg>`;
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  } finally {
    URL.revokeObjectURL(url);
  }

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('export'))), 'image/png'));
}

const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(blob);
});

/** Les dimensions naturelles d'une image, ou un carré par défaut (un SVG sans taille). */
const imageSize = (dataURL) => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => resolve({ width: img.naturalWidth || 300, height: img.naturalHeight || 300 });
  img.onerror = () => resolve({ width: 300, height: 300 });
  img.src = dataURL;
});

/**
 * La سبّورة : Excalidraw dans la coquille du مختبر (MathLabToolProps —
 * toolContract.js).
 *
 * Excalidraw possède l'état du dessin et son historique ; rien n'en passe par
 * l'état React. On n'en sort qu'un instantané sérialisé, à intervalle, quand
 * la SIGNATURE du contenu a changé — pas à chaque déplacement de la vue.
 *
 * ── Les images ───────────────────────────────────────────────────────────
 * Une image sur la سبّورة est un FICHIER du serveur (props.attachments) :
 * l'élément Excalidraw ne porte que son identifiant (`attachmentFileId`),
 * et les octets sont rechargés à l'ouverture (`rehydrate`). Le document ne
 * contient donc jamais de base64 (whiteboardState.toWhiteboardData), et une
 * image entrée par un autre chemin — collage, glisser-déposer — est retirée
 * aussitôt avec un mot pour l'élève : les quotas ne se contournent pas.
 */
export default function WhiteboardTool({ initialData, title, onChange, onReady, attachments = null, onNotice = null }) {
  const { t } = useTranslation('mathlab');
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const signatureRef = useRef(null);
  const timerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onNoticeRef = useRef(onNotice);
  onNoticeRef.current = onNotice;
  const attachmentsRef = useRef(attachments);
  attachmentsRef.current = attachments;
  // Les identifiants d'image que la سبّورة a le droit de porter : les
  // fichiers du serveur, plus ceux que le document apportait déjà.
  const knownFileIdsRef = useRef(new Set());
  // Les octets déjà rechargés dans Excalidraw (pas deux fois).
  const hydratedRef = useRef(new Set());
  const strayNoticeRef = useRef(0);
  // Le bureau de géométrie : son état enregistrable (absent tant qu'on n'y a
  // pas touché — une سبّورة ouverte puis quittée ne devient pas « modifiée »),
  // l'API d'Excalidraw et le conteneur où son calque se glisse.
  const deskDataRef = useRef(initialData?.geometry ?? null);
  const deskApiRef = useRef(null);
  const [excalidrawApi, setExcalidrawApi] = useState(null);
  const [deskHost, setDeskHost] = useState(null);

  // L'état d'ouverture, lu UNE fois : Excalidraw n'est pas contrôlé.
  const excalidrawInitialData = useMemo(() => {
    let data = initialData;
    if (initialData?.seeded) {
      // Une amorce de leçon : des squelettes, pas encore des éléments.
      try {
        data = { ...initialData, elements: convertToExcalidrawElements(initialData.elements) };
      } catch {
        data = { ...initialData, elements: [] };
      }
    }
    const restored = toExcalidrawInitialData(data);
    signatureRef.current = whiteboardChangeSignature(getSceneVersion(restored.elements), restored.appState);
    for (const el of restored.elements) {
      if (el?.type === 'image' && el.fileId) knownFileIdsRef.current.add(el.fileId);
    }

    return restored;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const serializeNow = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = null;
    const api = apiRef.current;
    if (!api) return;
    const serialized = JSON.parse(serializeAsJSON(api.getSceneElements(), api.getAppState(), api.getFiles(), 'database'));
    if (deskDataRef.current) serialized.geometry = deskDataRef.current;
    onChangeRef.current?.(toWhiteboardData(serialized));
  }, []);

  const handleChange = useCallback((elements, appState) => {
    // Une image venue d'ailleurs que du panneau des fichiers n'a pas sa
    // place : ses octets ne seraient jamais enregistrés (et le quota serait
    // contourné). On la retire, et on le dit — une fois par salve.
    const api = apiRef.current;
    if (api) {
      const strays = elements.filter((el) => el.type === 'image' && !el.isDeleted && !knownFileIdsRef.current.has(el.fileId));
      if (strays.length > 0) {
        const strayIds = new Set(strays.map((el) => el.id));
        api.updateScene({ elements: elements.filter((el) => !strayIds.has(el.id)), captureUpdate: CaptureUpdateAction.IMMEDIATELY });
        const now = Date.now();
        if (now - strayNoticeRef.current > 2000) {
          strayNoticeRef.current = now;
          onNoticeRef.current?.({ tone: 'error', key: 'shell.imagesNeedUpload' });
        }

        return;
      }
    }
    const signature = whiteboardChangeSignature(getSceneVersion(elements), appState);
    if (signature === signatureRef.current) return;
    signatureRef.current = signature;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(serializeNow, SERIALIZE_MS);
  }, [serializeNow]);

  /** Le bureau a changé (fin d'un geste, un réglage) : il part avec la prochaine sérialisation. */
  const handleDeskChange = useCallback((desk) => {
    deskDataRef.current = desk;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(serializeNow, SERIALIZE_MS);
  }, [serializeNow]);

  /** Les octets des fichiers du serveur → Excalidraw, pour ceux qui manquent encore. */
  const rehydrate = useCallback(async () => {
    const api = apiRef.current;
    const source = attachmentsRef.current;
    if (!api || !source?.files?.length || !source.loadBlob) return;
    for (const file of source.files) {
      const fileId = attachmentFileId(file);
      knownFileIdsRef.current.add(fileId);
      if (file.kind === 'pdf' || hydratedRef.current.has(fileId)) continue;
      hydratedRef.current.add(fileId);
      try {
        const blob = await source.loadBlob(file);
        const dataURL = await blobToDataUrl(blob);
        apiRef.current?.addFiles([{ id: fileId, dataURL, mimeType: file.mimeType, created: Date.now() }]);
      } catch (error) {
        hydratedRef.current.delete(fileId);
        console.warn('[mathlab] image non rechargée :', file.id, error);
      }
    }
  }, []);

  useEffect(() => {
    for (const file of attachments?.files ?? []) knownFileIdsRef.current.add(attachmentFileId(file));
    rehydrate();
  }, [attachments?.files, rehydrate]);

  // La bibliothèque gardée dans le navigateur entre APRÈS le montage, par
  // l'API : tant qu'elle n'est pas en place, une notification « bibliothèque
  // vide » (Excalidraw en émet au démarrage) n'écrase pas ce qui est stocké.
  const libraryReadyRef = useRef(false);
  const handleLibraryChange = useCallback((items) => {
    if (libraryReadyRef.current) storeLibrary(items);
  }, []);

  const handleApi = useCallback((api) => {
    apiRef.current = api;
    const stored = readStoredLibrary();
    (stored.length ? api.updateLibrary({ libraryItems: stored, merge: true }) : Promise.resolve())
      .catch(() => {})
      .finally(() => { libraryReadyRef.current = true; });
    rehydrate();

    /** Le centre de la vue, en coordonnées de scène : là où l'élève regarde. */
    const viewCenter = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      const appState = api.getAppState();
      const clientX = rect ? rect.left + rect.width / 2 : appState.width / 2;
      const clientY = rect ? rect.top + rect.height / 2 : appState.height / 2;

      return viewportCoordsToSceneCoords({ clientX, clientY }, appState);
    };

    onReady?.({
      // Vider en passant par l'historique : « تراجع » ramène le dessin.
      clear: () => api.updateScene({ elements: [], captureUpdate: CaptureUpdateAction.IMMEDIATELY }),
      // Par défaut, l'image est le TRAVAIL mathématique ; les instruments
      // n'y entrent que si l'on a choisi « تصدير مع أدوات الهندسة ».
      exportPng: () => (deskApiRef.current?.includeInstruments() && deskApiRef.current.instrumentsBounds()
        ? exportWithInstruments(api, deskApiRef.current)
        : exportToBlob({
        elements: api.getSceneElements(),
        appState: { ...api.getAppState(), exportBackground: true, exportWithDarkMode: false },
        files: api.getFiles(),
        mimeType: 'image/png',
        exportPadding: EXPORT_PADDING,
      })),
      isGridEnabled: () => Boolean(api.getAppState().gridModeEnabled),
      // Rend le NOUVEL état : `updateScene` s'applique au prochain rendu
      // d'Excalidraw, relire `getAppState()` tout de suite rendrait l'ancien.
      toggleGrid: () => {
        const next = !api.getAppState().gridModeEnabled;
        api.updateScene({ appState: { gridModeEnabled: next } });

        return next;
      },
      scrollToContent: () => api.scrollToContent(undefined, { fitToContent: true }),

      // ── Les fichiers (MathLabAttachmentsCapability) ──────────────────
      attachments: {
        accept: ATTACHMENT_ACCEPT,
        // Une bibliothèque de formes (ou un JSON qui en est une) se fond dans
        // la سبّورة sans devenir un fichier. Un dessin `.excalidraw` aussi,
        // quand il n'embarque pas d'image — ses images auraient contourné le quota.
        importFile: async (file) => {
          checkImportFile(file);
          let text;
          try {
            text = await file.text();
          } catch (cause) {
            throw new WhiteboardImportError('unreadable', cause);
          }
          const items = parseLibraryText(text);
          let added = 0;
          try {
            await api.updateLibrary({
              libraryItems: (current) => {
                const known = new Set((current ?? []).map((item) => item.id));
                const fresh = items.filter((item) => !(item && typeof item === 'object' && known.has(item.id)));
                added = fresh.length;

                return fresh;
              },
              merge: true,
              openLibraryMenu: true,
            });
          } catch (cause) {
            throw new WhiteboardImportError('failed', cause);
          }

          return { count: added };
        },
        canPlace: (file) => file.kind === 'image' || file.kind === 'svg',
        place: async (file, blob) => {
          const fileId = attachmentFileId(file);
          knownFileIdsRef.current.add(fileId);
          const dataURL = await blobToDataUrl(blob);
          if (!hydratedRef.current.has(fileId)) {
            hydratedRef.current.add(fileId);
            api.addFiles([{ id: fileId, dataURL, mimeType: file.mimeType, created: Date.now() }]);
          }
          const natural = await imageSize(dataURL);
          const scale = Math.min(1, PLACED_IMAGE_MAX / Math.max(natural.width, natural.height));
          const width = Math.max(24, Math.round(natural.width * scale));
          const height = Math.max(24, Math.round(natural.height * scale));
          const center = viewCenter();
          const [element] = convertToExcalidrawElements([{
            type: 'image', fileId, x: center.x - width / 2, y: center.y - height / 2, width, height, status: 'saved',
          }]);
          api.updateScene({
            elements: [...api.getSceneElements(), element],
            appState: { selectedElementIds: { [element.id]: true } },
            captureUpdate: CaptureUpdateAction.IMMEDIATELY,
          });
        },
        forget: (file) => {
          const fileId = attachmentFileId(file);
          knownFileIdsRef.current.delete(fileId);
          hydratedRef.current.delete(fileId);
          const remaining = api.getSceneElements().filter((el) => !(el.type === 'image' && el.fileId === fileId));
          if (remaining.length !== api.getSceneElements().length) {
            api.updateScene({ elements: remaining, captureUpdate: CaptureUpdateAction.IMMEDIATELY });
          }
        },
      },
    });
  }, [onReady, rehydrate]);

  // Le bureau de géométrie se branche APRÈS le montage : Excalidraw livre son
  // API depuis son constructeur (pendant le rendu, où l'on ne peut pas
  // changer d'état) et son conteneur n'existe qu'une fois le DOM posé.
  useEffect(() => {
    let frame = 0;
    const attach = () => {
      const host = containerRef.current?.querySelector('.excalidraw-container');
      if (host && apiRef.current) {
        setExcalidrawApi(apiRef.current);
        setDeskHost(host);
      } else {
        frame = requestAnimationFrame(attach);
      }
    };
    attach();

    return () => cancelAnimationFrame(frame);
  }, []);

  // Au démontage : ce qui attendait d'être sérialisé part, et la coquille
  // n'a plus d'actions à offrir.
  useEffect(() => () => {
    if (timerRef.current) serializeNow();
    onReady?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="sa-ml-whiteboard" role="region" aria-label={t('tools.whiteboard.canvasLabel')} data-ml-whiteboard>
      <GeometryDesk
        ref={deskApiRef}
        api={excalidrawApi}
        host={deskHost}
        initialDesk={initialData?.geometry ?? null}
        onDeskChange={handleDeskChange}
      />
      <div ref={containerRef} className="sa-ml-whiteboard__canvas">
      <Excalidraw
        initialData={excalidrawInitialData}
        onChange={handleChange}
        excalidrawAPI={handleApi}
        langCode="ar-SA"
        theme="light"
        name={title}
        UIOptions={UI_OPTIONS}
        onLibraryChange={handleLibraryChange}
        handleKeyboardGlobally={false}
        validateEmbeddable={BLOCK_ALL_EMBEDS}
        onLinkOpen={keepLinksInside}
        autoFocus
      >
        <MainMenu>
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
        </MainMenu>
        <WelcomeScreen>
          <WelcomeScreen.Center>
            <WelcomeScreen.Center.Heading>{t('tools.whiteboard.welcome')}</WelcomeScreen.Center.Heading>
          </WelcomeScreen.Center>
          <WelcomeScreen.Hints.ToolbarHint />
        </WelcomeScreen>
      </Excalidraw>
      </div>
    </div>
  );
}
