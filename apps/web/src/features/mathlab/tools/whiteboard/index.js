import { Presentation } from 'lucide-react';
import { defineMathLabTool } from '../../toolContract.js';
import { WHITEBOARD_SCHEMA_VERSION, createWhiteboardData } from './whiteboardState.js';
import { summarizeWhiteboard } from './summarize.js';

/**
 * La سبّورة — le premier instrument du مختبر الرياضيات.
 *
 * Un espace libre pour dessiner, écrire, esquisser, annoter : croquis de
 * géométrie, calculs à la main, schémas, brouillons de résolution. Le moteur
 * est Excalidraw (MIT), chargé PARESSEUSEMENT par `load` : aucune autre page
 * ne le paie. Le choix de moteur est documenté dans
 * docs/architecture/MATH_LAB.md.
 */
export const whiteboardTool = defineMathLabTool({
  id: 'whiteboard',
  slug: 'tableau',
  labelKey: 'tools.whiteboard.name',
  descriptionKey: 'tools.whiteboard.description',
  newLabelKey: 'tools.whiteboard.new',
  defaultTitleKey: 'tools.whiteboard.defaultTitle',
  icon: Presentation,
  schemaVersion: WHITEBOARD_SCHEMA_VERSION,
  // Commune à tous, hors des مخابر : en tête de l'accueil (MATH_LAB.md §2.1).
  scopes: 'common',
  createInitialData: createWhiteboardData,
  summarize: summarizeWhiteboard,
  load: () => import('./WhiteboardTool.jsx'),
});
