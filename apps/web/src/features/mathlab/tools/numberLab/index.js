import { Hash } from 'lucide-react';
import { defineMathLabTool } from '../../toolContract.js';
import { NUMBER_LAB_SCHEMA_VERSION, createNumberLabData } from './numberState.js';
import { NUMBER_LAB_CAPABILITIES, NUMBER_LAB_SCOPES } from './scope.js';
import { summarizeNumberLab } from './summarize.js';

/**
 * Le مختبر الأعداد والحساب (Laboratoire des nombres et du calcul) — le
 * onzième instrument du مختبر الرياضيات.
 *
 *     لا تحسب فقط — العب بالعدد، غيّره، فكّكه، قارن، واكتشف ما يحدث.
 *
 * Ce n'est PAS une calculatrice, et c'est la seule phrase de conception qui
 * compte. Une calculatrice répond `24 ÷ 6 = 4` ; ce laboratoire laisse
 * construire 24, le partager en groupes, changer le nombre de groupes et
 * REGARDER ce qui arrive au quotient et au reste. L'élève voit les
 * mathématiques se faire — d'où pas un seul écran « saisir → résultat ».
 *
 * ── Une valeur, plusieurs représentations ────────────────────────────────
 * L'identité de l'instrument (§46, §47) tient dans un choix d'architecture :
 * il ne stocke jamais « 0,5 et 1/2 et 50 % » mais UNE fraction exacte dont
 * les écritures sont dérivées (`numberValue.representationsOf`). Trois champs
 * séparés dériveraient tôt ou tard ; ici deux représentations ne PEUVENT pas
 * se contredire, parce qu'il n'y a qu'un nombre.
 *
 * ── Treize modes, un seul laboratoire ────────────────────────────────────
 * §3 : les modes ne sont pas des routes. Une seule URL, un seul document, un
 * seul en-tête — et l'élève passe de l'explorateur au crible, du crible à
 * l'arbre de facteurs, en ENVOYANT son nombre (`sendTo`), jamais en le
 * retapant.
 *
 * Il prend la place que l'accueil annonçait sous « المستقيم المدرّج » : la
 * droite graduée promise est là (§7), mais elle est un mode parmi treize —
 * un instrument entier pour une seule droite aurait été une promesse tenue
 * trop petitement.
 *
 * Toute la mathématique vit dans des modules purs (fraction.js,
 * numberTheory.js, proportion.js, numberValue.js, practice.js) testés à
 * part ; le composant ne fait que les appeler. L'arithmétique est EXACTE
 * (§61) : tout passe par des entiers, et `1/3 + 1/3 + 1/3` rend `1`.
 * Chargé PARESSEUSEMENT par `load`. Documenté dans
 * docs/architecture/MATH_LAB.md §5l.
 */
export const numberLabTool = defineMathLabTool({
  id: 'numberLab',
  slug: 'nombres',
  // Le nom long de la route, celui qu'on donne à un enseignant : même instrument.
  aliases: ['nombres-calcul'],
  labelKey: 'tools.numberLab.name',
  descriptionKey: 'tools.numberLab.description',
  newLabelKey: 'tools.numberLab.new',
  defaultTitleKey: 'tools.numberLab.defaultTitle',
  icon: Hash,
  schemaVersion: NUMBER_LAB_SCHEMA_VERSION,
  // Les deux مخابر, les seize modes dans chacun (scope.js).
  scopes: NUMBER_LAB_SCOPES,
  capabilities: NUMBER_LAB_CAPABILITIES,
  createInitialData: createNumberLabData,
  summarize: summarizeNumberLab,
  load: () => import('./NumberLabTool.jsx'),
});
