/**
 * LE JADWAL — جدول التغيّرات, construit depuis l'analyse déjà faite.
 *
 * Module PUR : il ne calcule aucune mathématique nouvelle. Il PRÉSENTE ce que
 * `analysisMath.js` a trouvé (points critiques, discontinuités, bornes de la
 * fenêtre) dans la disposition du manuel algérien :
 *
 *      x        │ −3      0          2          5
 *      ─────────┼───────────────────────────────────
 *      f′(x)    │     −        −   0   +
 *      ─────────┼───────────────────────────────────
 *               │ 12            ╲            ╱ 9
 *      f(x)     │      ╲       ╱
 *               │              −1
 *
 * ── Les règles de disposition, et pourquoi elles sont mathématiques ──────
 *
 * 1. Les COLONNES sont les valeurs remarquables de x, dans l'ordre : les
 *    bornes de la fenêtre, les points critiques, les discontinuités. Entre
 *    deux colonnes il y a un INTERVALLE, qui porte une flèche et un signe.
 *
 * 2. La HAUTEUR d'une valeur de f dit le sens : une valeur en haut de sa
 *    case est un maximum local ou une arrivée de montée ; en bas, un minimum
 *    ou une arrivée de descente. Ce n'est pas décoratif — c'est CE QUI SE LIT
 *    dans un tableau de variations, et un élève qui place une valeur du
 *    mauvais côté a mal compris le sens de variation.
 *
 * 3. Une DISCONTINUITÉ coupe le tableau : on y écrit une double barre, et la
 *    fonction n'a pas de valeur à cet endroit. `1/x` en 0 n'a pas de ligne
 *    continue qui traverse — la double barre le dit.
 *
 * 4. La ligne f′ porte le SIGNE de la dérivée, et un `0` aux points où elle
 *    s'annule. Aux points stationnaires qui ne sont pas des extrema (x³ en
 *    0), le signe est le MÊME de part et d'autre : le tableau le montre, ce
 *    qui est exactement la leçon de §17.
 */

/** Ce qu'une colonne peut être. */
import { verifiedLimitAtInfinity, isEngineReady } from '../../symbolic/index.js';

const BOUND = 'bound';
const CRITICAL = 'critical';
const BREAK = 'break';

/**
 * @param {object} scene       la scène résolue (buildScene)
 * @param {{xMin: number, xMax: number}} view
 * @returns {{columns: Array, intervals: Array, ok: boolean, reason?: string} }
 */
export function buildVariationTable(scene, rawView) {
  if (!scene || scene.error || !scene.primary?.ok) return { ok: false, reason: 'noFunction', columns: [], intervals: [] };
  // La HAUTEUR de la fenêtre sert à juger « grand » au bord : sans elle, on
  // se rabat sur une échelle neutre.
  const view = {
    xMin: rawView.xMin,
    xMax: rawView.xMax,
    yMin: Number.isFinite(rawView.yMin) ? rawView.yMin : -10,
    yMax: Number.isFinite(rawView.yMax) ? rawView.yMax : 10,
  };

  const fn = scene.primary.fn;
  const derivative = scene.primary.derivative;
  const critical = Array.isArray(scene.extrema) ? scene.extrema : [];
  const breaks = Array.isArray(scene.discontinuities) ? scene.discontinuities : [];

  // ── Les colonnes, dans l'ordre croissant des abscisses ─────────────────
  const marks = [
    { x: view.xMin, kind: BOUND },
    ...critical.map((point) => ({ x: point.x, kind: CRITICAL, critical: point })),
    ...breaks.map((entry) => ({ x: entry.x, kind: BREAK, break: entry })),
    { x: view.xMax, kind: BOUND },
  ]
    .filter((mark) => Number.isFinite(mark.x) && mark.x >= view.xMin - 1e-9 && mark.x <= view.xMax + 1e-9)
    .sort((a, b) => a.x - b.x);

  // Deux marques à la même abscisse n'en font qu'une : la plus informative
  // gagne (une discontinuité prime sur une borne).
  const columns = [];
  for (const mark of marks) {
    const previous = columns[columns.length - 1];
    if (previous && Math.abs(previous.x - mark.x) < 1e-7) {
      if (previous.kind === BOUND && mark.kind !== BOUND) columns[columns.length - 1] = mark;
      continue;
    }
    columns.push(mark);
  }
  if (columns.length < 2) return { ok: false, reason: 'tooNarrow', columns: [], intervals: [] };

  // ── Les intervalles entre colonnes : un signe, un sens ─────────────────
  const intervals = [];
  for (let i = 0; i < columns.length - 1; i += 1) {
    const from = columns[i].x;
    const to = columns[i + 1].x;
    const sign = signOnInterval(derivative, from, to);
    intervals.push({
      from,
      to,
      sign,
      direction: sign > 0 ? 'increasing' : sign < 0 ? 'decreasing' : sign === 0 ? 'constant' : 'unknown',
    });
  }

  // ── La valeur de f dans chaque colonne, et sa HAUTEUR ──────────────────
  const cells = columns.map((column, index) => {
    const before = intervals[index - 1] ?? null;
    const after = intervals[index] ?? null;
    const value = column.kind === BREAK ? null : safeValue(fn, column.x);

    /**
     * Aux BORDS de la fenêtre, un grand nombre ne veut rien dire.
     *
     * Le tableau affichait « 430,61 » au bout de x³ — la valeur de f en
     * 7,68, c'est-à-dire l'endroit où le cadre s'arrête, pas un fait sur la
     * fonction. Un élève y lit un maximum qui n'existe pas. Ce que dit la
     * mathématique à cet endroit, c'est la LIMITE : `+∞`.
     *
     * On ne l'écrit que lorsque la fonction diverge vraiment (§13), et on
     * garde le nombre dans les autres cas — au bord d'une fenêtre où f tend
     * vers 2, « 2 » est la bonne réponse.
     */
    const limit = column.kind === BOUND
      ? boundaryLimit(fn, column.x, index === 0 ? '-' : '+', view, scene.primary.source)
      : null;

    /**
     * En haut ou en bas ? La flèche qui ARRIVE décide ; à défaut, celle qui
     * PART. Une valeur atteinte en montant se pose en haut de sa case, une
     * valeur atteinte en descendant se pose en bas. C'est la convention du
     * manuel, et elle porte le sens.
     */
    let high = true;
    let middle = false;
    if (before && after && before.direction === after.direction
      && (before.direction === 'increasing' || before.direction === 'decreasing')) {
      /**
       * Le point STATIONNAIRE qui n'est pas un extremum (x³ en 0) : la
       * fonction monte avant ET après. Sa valeur ne se pose donc ni en haut
       * ni en bas — elle est À MI-HAUTEUR, sur la pente. La poser en haut la
       * ferait lire comme un maximum, ce qu'elle n'est pas : §17 interdit
       * précisément de laisser croire qu'un f′ = 0 est un extremum.
       */
      middle = true;
      high = before.direction === 'increasing';
    } else if (before?.direction === 'increasing') high = true;
    else if (before?.direction === 'decreasing') high = false;
    else if (after?.direction === 'decreasing') high = true;
    else if (after?.direction === 'increasing') high = false;

    return {
      x: column.x,
      kind: column.kind,
      value,
      // `infinite: +1 | -1` remplace la valeur par +∞ ou −∞ à l'affichage.
      infinite: limit?.infinite ?? null,
      high,
      middle,
      // Le zéro de f′ ne s'écrit qu'aux points où elle s'annule VRAIMENT.
      derivativeZero: column.kind === CRITICAL,
      extremum: column.critical?.kind ?? null,
      breakKind: column.break?.kind ?? null,
      leftLimit: column.break?.left ?? null,
      rightLimit: column.break?.right ?? null,
    };
  });

  return { ok: true, columns: cells, intervals };
}

/**
 * Le signe de g sur ]a, b[ — échantillonné À L'INTÉRIEUR, jamais aux bornes,
 * qui sont précisément les points où la dérivée s'annule.
 *
 * Rend `null` quand les deux signes coexistent : le découpage a manqué
 * quelque chose, et on préfère l'avouer (une flèche affirmée à tort est une
 * faute mathématique).
 */
function signOnInterval(g, a, b) {
  const count = 12;
  let positive = 0;
  let negative = 0;
  for (let i = 1; i < count; i += 1) {
    const value = g(a + ((b - a) * i) / count);
    if (!Number.isFinite(value)) continue;
    if (value > 1e-12) positive += 1;
    else if (value < -1e-12) negative += 1;
  }
  if (positive === 0 && negative === 0) return 0;
  if (negative === 0) return 1;
  if (positive === 0) return -1;

  return null;
}

function safeValue(fn, x) {
  const y = fn(x);

  return Number.isFinite(y) ? y : null;
}

/**
 * Au BORD de la fenêtre : la fonction y file-t-elle vers l'infini ?
 *
 * ── Diverger est une propriété de la FONCTION, pas de la fenêtre ─────────
 * Une première version comparait |f| à la hauteur du cadre, et se trompait
 * dans les deux sens, comme l'utilisateur l'a signalé : `2x+1` affichait
 * « +∞ » au bord droit (contresens : une droite ne diverge pas en un point
 * fini), et `x²` affichait « 100 » dès qu'on élargissait la fenêtre — la même
 * fonction se lisant différemment selon le zoom.
 *
 * ── Pourquoi pas le moteur symbolique ────────────────────────────────────
 * On a essayé : Nerdamer se trompe de SIGNE en −∞. Il rend `+∞` pour
 * `2x+1` quand x → −∞ (la réponse est −∞) et `+∞` pour `ln(x)` en −∞, où la
 * fonction n'existe même pas. Il calcule |x| → ∞ sans direction. Afficher
 * cela dans un tableau de variations serait enseigner une faute, donc le
 * symbolique ne décide PAS ici (c'est exactement pourquoi la façade rend le
 * résultat brut et laisse l'appelant juger — symbolicEngine.js).
 *
 * ── La mesure, faite honnêtement ─────────────────────────────────────────
 * On suit f sur des décades successives EN S'ÉLOIGNANT dans la direction du
 * bord. Trois faits doivent tenir ensemble :
 *   1. f sort déjà du cadre au bord (sinon sa valeur est une valeur) ;
 *   2. |f| CROÎT à chaque décade, sans jamais se stabiliser ;
 *   3. elle finit immense — mille fois le cadre.
 * Une droite satisfait les trois quand on va jusqu'à x = 10⁶ : c'est juste,
 * elle diverge bien en ±∞. Ce que la condition 1 empêche, c'est de l'écrire
 * au bord d'un cadre qu'elle traverse tranquillement.
 *
 * @param {'-'|'+'} side  le bord gauche ou droit
 */
function boundaryLimit(fn, x, side, view, source) {
  const y = fn(x);
  if (!Number.isFinite(y)) return null;
  const top = Math.max(Math.abs(view.yMax), Math.abs(view.yMin), 1e-9);

  /**
   * Il n'y a PAS de garde-fou sur la valeur au bord, et c'est voulu.
   *
   * On a essayé : « n'annoncer l'infini que si f sort déjà du cadre ». Cette
   * règle rendait la lecture dépendante du zoom — `x²` affichait « 100 » sur
   * une fenêtre haute — et elle se contredisait elle-même, puisque
   * `(x²−1)/(x−1)` vaut exactement 6 au bord de sa fenêtre (yMax = 6) tout
   * en divergeant, comme `e^x` qui y vaut 54 pour un cadre haut de 9.
   *
   * La question du tableau n'est pas « f est-elle grande ICI ? » mais « où
   * va-t-elle ? ». On la pose donc directement, et seule la DIVERGENCE
   * mesurée plus bas décide. `2x+1` y répond « +∞ » à droite et « −∞ » à
   * gauche : c'est juste, une droite diverge bien aux deux bouts.
   */

  /**
   * LA RÉPONSE DU MOTEUR, quand il en donne une vérifiée.
   *
   * `verifiedLimitAtInfinity` demande à Nerdamer et confronte sa réponse au
   * comportement réel de f : on n'écrit que ce que les deux confirment.
   * C'est la voie principale — la mesure ci-dessous n'est là que pour les
   * cas où le moteur cale (x³−3x, |x|, e^x en +∞), qui restent nombreux.
   */
  if (isEngineReady() && source) {
    const symbolic = verifiedLimitAtInfinity(source, side === '+' ? '+inf' : '-inf', fn);
    if (symbolic.ok && symbolic.kind === 'infinite') return { infinite: symbolic.sign, exact: true };
    // Une limite FINIE vérifiée : la fonction ne part pas à l'infini, et sa
    // valeur au bord est la bonne chose à montrer.
    if (symbolic.ok && symbolic.kind === 'finite') return null;
  }

  /**
   * LA MESURE, pour tout ce que le moteur n'a pas su trancher.
   *
   * Nerdamer cale sur `x³−3x`, `|x|` et `e^x` en +∞ — sept cas sur vingt-deux
   * mesurés. On regarde alors ce que f FAIT en s'éloignant, sur quatre
   * décades : si |f| croît à chaque pas sans changer de signe et finit très
   * au-delà du cadre, elle diverge.
   *
   * Le test porte sur la CROISSANCE, pas sur un seuil absolu : c'est ce qui
   * rend la lecture indépendante du zoom. Une version antérieure comparait
   * |f| à la hauteur de la fenêtre, et la même fonction se lisait « 100 » ou
   * « +∞ » selon le cadrage — l'utilisateur l'a signalé deux fois.
   */
  const direction = side === '+' ? 1 : -1;
  const span = Math.max(Math.abs(x), 1);
  let previous = Math.abs(y);
  for (const factor of [10, 100, 1000, 10000]) {
    const value = fn(x + direction * span * factor);

    /**
     * Un DÉBORDEMENT (±Infinity) est la preuve la plus forte de divergence,
     * pas une sortie de domaine : `e^x` dépasse le plus grand flottant dès
     * x ≈ 710, et le traiter comme « indéfini » faisait afficher « 54,6 » au
     * bord de sa fenêtre — alors que l'exponentielle est l'exemple même de
     * la fonction qui file vers +∞.
     */
    if (value === Infinity || value === -Infinity) {
      return Math.sign(value) === Math.sign(y) ? { infinite: Math.sign(y) } : null;
    }
    // Un NaN, lui, est bien une sortie de domaine : on n'affirme rien.
    if (Number.isNaN(value)) return null;
    if (Math.sign(value) !== Math.sign(y)) return null;
    // Elle doit CROÎTRE : une fonction qui plafonne ne diverge pas.
    if (Math.abs(value) <= previous) return null;
    previous = Math.abs(value);
  }

  // Et finir immense — cent fois le cadre suffit à écarter toute fonction
  // qui se stabilise, sans exiger l'explosion d'une exponentielle.
  if (previous < top * 100) return null;

  return { infinite: Math.sign(y) };
}



/* ══════════════════════════════════════════════════════════════════════════
 * LA CONSTRUCTION PAS À PAS du tableau — comme l'élève la fait sur sa copie.
 *
 * Exigence de la propriétaire (2026-09-30) : le جدول التغيّرات n'apparaît plus
 * complet d'un bloc. Il se construit dans l'ordre du manuel, et le tableau
 * complet est le DERNIER pas :
 *
 *   1. domain      مجموعة التعريف (celle qu'on observe dans la fenêtre)
 *   2. derivative  f′(x), écrite (règles) ou mesurée
 *   3. zeros       f′(x) = 0 → les colonnes x (+ les pôles, les bornes) ; la ligne x et les « 0 »
 *   4. sign        le signe de f′ sur chaque intervalle
 *   5. arrows      les flèches ↗ ↘ (le sens de variation)
 *   6. values      les images aux colonnes (extrema, bornes ou ±∞) — le tableau COMPLET
 *
 * `tableRows` dit combien de lignes du tableau un pas fait exister :
 * 0 (pas encore de tableau), 1 (x + les zéros et barres de f′), 2 (+ signes),
 * 3 (+ flèches), 4 (+ valeurs = complet). `VariationTable` ne rend QUE ces
 * lignes : une case future n'est pas dans le DOM.
 *
 * Aucune mathématique nouvelle : chaque pas lit la scène et le tableau déjà
 * calculés. La liste est donc de longueur FIXE — elle ne dépend que de ce que
 * le tableau existe — et un glissement de fenêtre ou de paramètre garde le
 * pas où l'élève en est, le contenu suivant la nouvelle lecture.
 * ══════════════════════════════════════════════════════════════════════════ */

export const VARIATION_STAGES = Object.freeze(['domain', 'derivative', 'zeros', 'sign', 'arrows', 'values']);

/** Les lignes du tableau qu'un pas (1-indexé, `cursor`) fait exister. */
export function tableRowsAt(cursor) {
  return Math.max(0, Math.min(4, cursor - 2));
}

/**
 * @param {object} scene  la scène résolue (buildScene)
 * @param {object} table  buildVariationTable(scene, view)
 * @returns {{ok: false} | {ok: true, steps: Array<{kind, textKey, tableRows, tone?, ...}>}}
 */
export function buildVariationSteps(scene, table) {
  if (!scene || scene.error || !table?.ok) return { ok: false, steps: [] };

  const zeros = table.columns.filter((column) => column.kind === CRITICAL).map((column) => column.x);
  const breaks = table.columns.filter((column) => column.kind === BREAK).map((column) => column.x);

  const steps = [
    {
      kind: 'domain',
      domain: Array.isArray(scene.domain) ? scene.domain.map((piece) => ({ from: piece.from, to: piece.to })) : [],
    },
    {
      kind: 'derivative',
      derivativeSource: scene.primary?.derivativeSource ?? null,
      exact: Boolean(scene.primary?.derivativeExact),
    },
    { kind: 'zeros', zeros, breaks },
    { kind: 'sign', signs: table.intervals.map((interval) => interval.sign) },
    { kind: 'arrows', directions: table.intervals.map((interval) => interval.direction) },
    {
      kind: 'values',
      tone: 'result',
      values: table.columns.map((column) => (column.infinite ? column.infinite * Infinity : column.value)),
    },
  ].map((step, index) => ({ ...step, textKey: step.kind, tableRows: tableRowsAt(index + 1) }));

  return { ok: true, steps };
}
