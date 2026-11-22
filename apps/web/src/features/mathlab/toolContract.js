import { scopeDeclarationError } from './labScope.js';

/**
 * Le CONTRAT d'un instrument du مختبر الرياضيات (Math Lab).
 *
 * Le mختبر est une famille d'instruments indépendants — la سبّورة
 * aujourd'hui, le grapheur, la géométrie, les أشعة demain. Ce fichier dit ce
 * qu'un instrument doit fournir pour se brancher sur la coquille commune
 * (MathLabShell), le registre (toolRegistry.js) et la persistance
 * (useMathLabDocument) SANS que ceux-ci changent. Voir
 * docs/architecture/MATH_LAB.md.
 *
 * @typedef {object} MathLabTool
 * @property {string} id
 *   Identifiant stable, en camelCase ('whiteboard'). C'est la valeur de
 *   `tool` en base : le registre SERVEUR (App\Domain\MathLab\MathLabTools)
 *   doit le connaître, sinon la sauvegarde est refusée.
 * @property {string} slug
 * @property {string[]} [aliases]
 *   Autres segments d'URL qui ouvrent le MÊME instrument (un nom plus parlant
 *   donné après coup — `nombres-calcul` pour `nombres`). Le segment canonique
 *   reste `slug` : c'est lui que construisent les liens et l'enregistrement.
 *   Le segment d'URL, en français comme le reste des routes de l'espace
 *   ('tableau' → /espace/atelier/tableau).
 * @property {string} labelKey
 *   Clé i18n du nom, namespace `mathlab` ('tools.whiteboard.name').
 * @property {string} descriptionKey
 * @property {string} newLabelKey        Le libellé du bouton « nouveau » sur l'accueil.
 * @property {string} defaultTitleKey    Le titre d'un document jamais renommé.
 * @property {import('react').ComponentType<{size?: number, className?: string}>} icon
 *   Une icône lucide, jamais une image.
 * @property {number} schemaVersion
 *   La version du FORMAT de `data`. L'outil doit savoir rouvrir toute
 *   version antérieure qu'il a publiée ; le serveur ne l'interprète pas.
 * @property {(seed?: unknown, context?: {scope: 'moyen'|'secondaire'|null, capabilities: object|null}) => object} createInitialData
 *   L'état d'un document neuf — vide, ou construit depuis l'amorce qu'une
 *   leçon transmet (openMathLab.js). Le second argument dit dans quel مخبر il
 *   naît : un instrument partagé peut y choisir un exemple d'ouverture à la
 *   portée de ce مخبر (le جبر n'ouvre pas le collège sur `x² + 5x + 6`).
 * @property {'common' | Array<'moyen'|'secondaire'>} scopes
 *   OBLIGATOIRE. Où l'instrument apparaît : `'common'` pour un outil de tous,
 *   hors مخبر (la سبّورة) ; sinon la liste des مخابر — مخبر المتوسط
 *   (`moyen`), مخبر الثانوي (`secondaire`) — dans l'ordre de préférence.
 *   Voir labScope.js et MATH_LAB.md §2.1.
 * @property {{moyen?: object|null, secondaire?: object|null}} [capabilities]
 *   Ce que l'instrument EXPOSE dans chaque مخبر — ses sections, ses options.
 *   La forme appartient à l'outil (déclarée dans `tools/<nom>/scope.js`) ;
 *   un مخبر absent ou `null` veut dire « tout ». Un seul instrument, un seul
 *   composant, une seule route : c'est ce qu'il montre qui change.
 * @property {() => Promise<{default: import('react').ComponentType<MathLabToolProps>}>} load
 *   L'import PARESSEUX du composant : un instrument lourd (la سبّورة embarque
 *   Excalidraw) ne pèse sur aucune autre page.
 * @property {(data: object) => MathLabSummary | null} [summarize]
 *   FACULTATIF. Le RÉSUMÉ que l'instrument fait de son propre état : ce que
 *   « أعمالي » dessine sur une carte et ce que la recherche lit, SANS jamais
 *   charger l'instrument. Fonction PURE, sans React et sans moteur — elle
 *   tourne dans la coquille à chaque sauvegarde, et dans les tests.
 *
 *   Elle doit rester minuscule (le serveur ignore au-delà de 2 Ko :
 *   MathLabDocumentService::MAX_SUMMARY_BYTES) et ne contenir que du JSON
 *   simple. Un instrument sans `summarize` n'est pas en faute : sa carte
 *   montre l'aperçu de repli (son icône et son nom).
 */

/**
 * Ce qu'un instrument dit de son document en quelques centaines d'octets.
 *
 * `kind` nomme la FORME de l'aperçu, pas l'outil : c'est lui que
 * `WorkPreview` regarde pour choisir son dessin, de sorte qu'un futur
 * instrument qui produit une courbe réutilise l'aperçu « curve » sans une
 * ligne de plus dans « أعمالي ».
 *
 * `text` est ce que la RECHERCHE lit en plus du titre et du nom de
 * l'instrument : les expressions du grapheur, l'équation du جبر, le nom du
 * solide. Le reste des champs appartient au dessin de l'aperçu.
 *
 * @typedef {object} MathLabSummary
 * @property {'curve'|'solid'|'strokes'|'chart'|'equation'|'vectors'|'triangle'|'sequence'|'shapes'} kind
 * @property {string[]} [text]    Les mots que la recherche doit trouver (≤ 6 entrées courtes).
 * @property {object} [detail]    Ce dont l'aperçu a besoin pour se dessiner — propre à `kind`.
 */

/**
 * Ce que la coquille passe au composant d'un instrument.
 *
 * @typedef {object} MathLabToolProps
 * @property {object} initialData   L'état du document au moment de l'ouverture — lu UNE fois.
 * @property {string} title         Le titre courant (nom d'export, accessibilité).
 * @property {(data: object) => void} onChange
 *   À appeler avec le NOUVEL état sérialisé (JSON pur) à chaque changement
 *   de contenu. La coquille se charge du délai et de la sauvegarde.
 * @property {(api: MathLabToolApi | null) => void} onReady
 *   Expose les actions que la coquille peut offrir dans sa barre. Toutes
 *   sont FACULTATIVES : la coquille n'affiche que celles qui existent.
 * @property {{files: MathLabAttachment[], loadBlob: (file: MathLabAttachment) => Promise<Blob>}} [attachments]
 *   Les FICHIERS du document (serveur), pour un outil qui déclare la
 *   capacité `attachments` : la liste à jour, et de quoi lire les octets.
 * @property {'moyen'|'secondaire'|null} [scope]
 *   Le مخبر où l'instrument est ouvert (null pour un instrument commun).
 * @property {object|null} [capabilities]
 *   `tool.capabilities[scope]` — ce que l'instrument doit montrer ici. `null`
 *   = tout. L'outil FILTRE ses sections avec, et ramène un état enregistré
 *   hors de portée (un ancien document) sur ce que le مخبر montre.
 * @property {(notice: {tone: 'success'|'error', key: string, params?: object} | null) => void} [onNotice]
 *   Un mot pour l'élève, affiché par la coquille sous la barre (clé i18n du
 *   namespace `mathlab`).
 */

/**
 * Un fichier d'un document, tel que le serveur le rend
 * (App\Http\Controllers\MathLabFileController::serialize).
 *
 * @typedef {object} MathLabAttachment
 * @property {number} id
 * @property {number} documentId
 * @property {'image'|'svg'|'pdf'} kind
 * @property {string} name
 * @property {string} mimeType
 * @property {number} size
 * @property {string|null} createdAt
 */

/**
 * @typedef {object} MathLabToolApi
 * @property {() => void} [clear]                  Vider le document (la coquille demande confirmation).
 * @property {() => Promise<Blob>} [exportPng]     Le rendu en image, pour « تصدير صورة ».
 * @property {() => boolean} [isGridEnabled]
 * @property {() => boolean} [toggleGrid]       Bascule la grille et rend le NOUVEL état.
 * @property {MathLabAttachmentsCapability} [attachments]
 *   La capacité « fichiers » : sa présence fait apparaître « الملفات » dans la
 *   barre et le panneau des fichiers (attachments/AttachmentsPanel.jsx).
 */

/**
 * Ce qu'un outil sait faire des fichiers. Le panneau tient l'envoi, la
 * liste, les quotas et la suppression (serveur) ; l'outil ne tient que ce
 * qui touche à son canevas.
 *
 * @typedef {object} MathLabAttachmentsCapability
 * @property {string} accept
 *   Les types que le sélecteur propose (attachmentPolicy.ATTACHMENT_ACCEPT).
 * @property {(file: File) => Promise<{count: number}>} [importFile]
 *   Fond un fichier NON stocké (bibliothèque, dessin) dans l'outil. Rejette
 *   avec une erreur portant `code` (`shell.importErrors.<code>`) et `cause`.
 * @property {(file: MathLabAttachment) => boolean} [canPlace]
 *   Ce fichier peut-il être posé sur le canevas ?
 * @property {(file: MathLabAttachment, blob: Blob) => Promise<void>} [place]
 * @property {(file: MathLabAttachment) => void} [forget]
 *   Le fichier vient d'être supprimé : ce qui le montrait disparaît.
 */

const REQUIRED = ['id', 'slug', 'labelKey', 'descriptionKey', 'newLabelKey', 'defaultTitleKey', 'icon', 'schemaVersion', 'createInitialData', 'load', 'scopes'];

/**
 * Valide et fige la définition d'un instrument. Une définition incomplète
 * échoue AU CHARGEMENT du registre, pas au premier clic d'un élève.
 *
 * @param {MathLabTool} definition
 * @returns {Readonly<MathLabTool>}
 */
export function defineMathLabTool(definition) {
  for (const key of REQUIRED) {
    if (definition[key] === undefined || definition[key] === null) {
      throw new Error(`[mathlab] l'instrument « ${definition.id ?? '?'} » n'a pas de « ${key} »`);
    }
  }
  if (!/^[a-z][a-zA-Z0-9]*$/.test(definition.id)) {
    throw new Error(`[mathlab] identifiant invalide « ${definition.id} » (camelCase attendu)`);
  }
  if (!/^[a-z][a-z0-9-]*$/.test(definition.slug)) {
    throw new Error(`[mathlab] segment d'URL invalide « ${definition.slug} » pour « ${definition.id} »`);
  }
  if (definition.aliases !== undefined) {
    if (!Array.isArray(definition.aliases) || definition.aliases.some((alias) => typeof alias !== 'string' || !/^[a-z][a-z0-9-]*$/.test(alias) || alias === definition.slug)) {
      throw new Error(`[mathlab] alias d'URL invalides pour « ${definition.id} »`);
    }
  }
  if (!Number.isInteger(definition.schemaVersion) || definition.schemaVersion < 1) {
    throw new Error(`[mathlab] schemaVersion doit être un entier ≥ 1 pour « ${definition.id} »`);
  }
  if (typeof definition.createInitialData !== 'function' || typeof definition.load !== 'function') {
    throw new Error(`[mathlab] createInitialData et load doivent être des fonctions pour « ${definition.id} »`);
  }
  if (definition.summarize !== undefined && typeof definition.summarize !== 'function') {
    throw new Error(`[mathlab] summarize doit être une fonction pour « ${definition.id} »`);
  }
  const scopeError = scopeDeclarationError(definition);
  if (scopeError) throw new Error(`[mathlab] « ${definition.id} » : ${scopeError}`);

  return Object.freeze({ ...definition });
}


/**
 * Le résumé d'un document, SANS jamais faire échouer une sauvegarde.
 *
 * `summarize` est écrit par un instrument et tourne sur un état qui vient du
 * serveur : il peut rencontrer un document plus ancien que lui, ou une forme
 * qu'il n'attendait pas. Une vignette ne vaut pas un travail perdu — donc
 * tout ce qui sort de l'ordinaire rend `null`, et la carte retombe sur son
 * aperçu de repli.
 *
 * @param {MathLabTool} tool
 * @param {object} data
 * @returns {MathLabSummary | null}
 */
export function summarizeDocument(tool, data) {
  if (typeof tool?.summarize !== 'function' || data == null) return null;
  try {
    const summary = tool.summarize(data);
    if (!summary || typeof summary !== 'object' || typeof summary.kind !== 'string') return null;

    return summary;
  } catch {
    return null;
  }
}
