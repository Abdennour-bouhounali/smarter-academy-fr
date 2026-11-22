/**
 * L'ÉTAT + la fenêtre → une SCÈNE RÉSOLUE, prête à dessiner.
 *
 * C'est le seul endroit où l'analyse est lancée, et c'est un module PUR : ni
 * React, ni pixels, ni DOM. `SceneLayer.jsx` ne fait ensuite que mettre en
 * pixels ce qu'il trouve ici — la séparation que MATH_LAB impose depuis le
 * labo de trigonométrie (« les étages dessinent un état résolu »).
 *
 * ── Pourquoi tout passe par ici (§47) ────────────────────────────────────
 * Chercher des racines, des extrema et des asymptotes coûte un balayage de
 * plusieurs centaines de points. Le faire dans le rendu, c'est le refaire à
 * chaque frame d'un glissement. En le concentrant dans UNE fonction pure, le
 * composant peut la mémoïser sur ses vraies dépendances (l'expression, la
 * fenêtre, les couches allumées) et ne la relancer que lorsqu'elles changent.
 *
 * On ne calcule QUE ce qui est allumé : les couches éteintes ne coûtent rien.
 * C'est ce qui permet au laboratoire de la sécante — le premier écran —
 * d'être immédiat, puisqu'il ne demande ni racine, ni extremum, ni asymptote.
 */

import { compileSource } from '../functionGrapher/expressionEvaluator.js';
import { parseExpression } from '../functionGrapher/expressionParser.js';
import { compileExpression } from '../functionGrapher/expressionEvaluator.js';
import { derivativeFunction } from '../functionGrapher/numericalDerivative.js';
import { differentiate, differentiateN } from './symbolicDerivative.js';
import { printExpression, printLatex } from './expressionPrinter.js';
import {
  averageRate, tangentInfo, findRoots, findCriticalPoints, findVariationIntervals,
  findDiscontinuities, findAsymptotes, twoSidedLimit, approachTable, riemannSum,
  signedAndGeometricArea, findIntersections, areaBetween, antiderivativeSampler,
  observedDomain, APPROACH_STEPS,
} from './analysisMath.js';
import { getTransformation } from './presets.js';
import { limitOf, isEngineReady } from '../../symbolic/index.js';

/** Combien de points servent à remplir une aire — assez pour un bord lisse. */
const AREA_SAMPLES = 220;

/**
 * Compile une expression et sa dérivée.
 *
 * Rend TOUJOURS un objet : `ok: false` porte l'erreur d'analyse pour que
 * l'interface affiche un message en français (§46) plutôt qu'une exception.
 */
export function compileFunction(source, scope) {
  const trimmed = String(source ?? '').trim();
  if (!trimmed) return { ok: false, error: { code: 'empty' } };

  let compiled;
  try {
    compiled = compileSource(trimmed, { variables: ['x', 'a', 'b', 'c'] });
  } catch {
    return { ok: false, error: { code: 'syntax' } };
  }
  if (!compiled.ok) return { ok: false, error: compiled.error };

  // Les paramètres a, b, c sont lus dans `scope` à CHAQUE appel : changer un
  // curseur ne recompile rien (§47).
  const bound = scope ? (x) => compiled.fn(x, scope) : compiled.fn;

  // La dérivée SYMBOLIQUE quand elle existe, sinon la mesure numérique.
  const parsed = parseExpression(trimmed, { variables: ['x', 'a', 'b', 'c'] });
  let derivativeAst = null;
  if (parsed.ok) {
    try {
      derivativeAst = differentiate(parsed.ast);
    } catch {
      derivativeAst = null;
    }
  }
  const symbolicDerivative = derivativeAst ? compileExpression(derivativeAst) : null;
  const boundDerivative = symbolicDerivative
    ? (scope ? (x) => symbolicDerivative(x, scope) : symbolicDerivative)
    : null;

  let secondAst = null;
  if (parsed.ok) {
    try {
      secondAst = differentiateN(parsed.ast, 2);
    } catch {
      secondAst = null;
    }
  }
  const secondCompiled = secondAst ? compileExpression(secondAst) : null;

  return {
    ok: true,
    source: trimmed,
    fn: bound,
    ast: parsed.ok ? parsed.ast : null,
    derivative: boundDerivative ?? derivativeFunction(bound),
    /** Vrai quand f′ vient d'une RÈGLE : §35 impose de le dire à l'élève. */
    derivativeExact: Boolean(boundDerivative),
    derivativeSource: derivativeAst ? printExpression(derivativeAst) : null,
    derivativeLatex: derivativeAst ? printLatex(derivativeAst) : null,
    secondDerivative: secondCompiled
      ? (scope ? (x) => secondCompiled(x, scope) : secondCompiled)
      : null,
    secondDerivativeSource: secondAst ? printExpression(secondAst) : null,
  };
}

/**
 * La scène complète.
 *
 * @param {object} data     l'état du document (analysisState.js)
 * @param {object} view     la fenêtre visible
 * @param {object} [options]
 * @returns {object}        une scène résolue, ou `{ error }` si f n'est pas lisible
 */
export function buildScene(data, view, options = {}) {
  const layers = data.layers ?? {};
  const scope = data.parameters;
  const primarySource = data.functions?.[0]?.source ?? '';
  const primary = compileFunction(primarySource, scope);

  if (!primary.ok) {
    return { error: primary.error, functions: [], layers };
  }

  const secondEntry = data.functions?.[1] ?? null;
  const second = secondEntry ? compileFunction(secondEntry.source, scope) : null;

  const scene = {
    error: null,
    // La fenêtre contre laquelle CETTE scène a été résolue : tout ce qui la
    // lit (le tableau de variations, l'inspecteur) parle de la même chose.
    view,
    primary,
    second: second?.ok ? second : null,
    functions: [
      { id: 'f', fn: primary.fn, color: data.functions[0].color, visible: data.functions[0].visible !== false },
      ...(second?.ok
        ? [{ id: 'g', fn: second.fn, color: secondEntry.color, visible: secondEntry.visible !== false }]
        : []),
    ],
  };

  // ── §7 : la sécante et son triangle ─────────────────────────────────────
  if (layers.secant || layers.riseRun || layers.slopeReadout) {
    const rate = averageRate(primary.fn, data.point, data.secondPoint);
    if (rate.ok) {
      scene.rate = rate;
      scene.secant = { slope: rate.slope, intercept: rate.fa - rate.slope * data.point };
      scene.riseRun = { xA: data.point, yA: rate.fa, xB: data.secondPoint, yB: rate.fb };
    } else {
      scene.rate = rate;
    }
  }

  // ── §8, §10 : la tangente ───────────────────────────────────────────────
  if (layers.tangent || layers.slopeReadout) {
    const tangent = tangentInfo(primary.fn, data.point, primary.derivativeExact ? primary.derivative : null);
    scene.tangentInfo = tangent;
    if (tangent.ok) {
      scene.tangent = { slope: tangent.slope, intercept: tangent.y - tangent.slope * tangent.x };
    }
  }

  // Le point A, toujours connu quand il existe : l'inspecteur le lit.
  const yAtPoint = primary.fn(data.point);
  scene.pointA = Number.isFinite(yAtPoint) ? { x: data.point, y: yAtPoint } : null;

  // ── §9 : les courbes de dérivée ─────────────────────────────────────────
  if (layers.derivativeCurve) scene.derivativeFn = primary.derivative;
  if (layers.secondDerivative && primary.secondDerivative) scene.secondDerivativeFn = primary.secondDerivative;

  /**
   * ── §16, §17 : l'étude de la fonction ─────────────────────────────────
   *
   * Dans le laboratoire « Étude de fonction », l'analyse est calculée ENTIÈREMENT,
   * que les couches soient allumées ou non.
   *
   * Les bascules de §16 commandent ce qui se DESSINE sur le graphe, pas ce
   * qu'on SAIT : une ligne du tableau qui affiche « La courbe ne coupe pas l’axe
   * des abscisses » simplement parce que l'élève vient d'éteindre la mise en
   * évidence est une réponse FAUSSE à une question de mathématiques. La QA
   * visuelle l'a vue sur x² − 4x + 3, dont les racines 1 et 3 traversent
   * visiblement l'écran.
   *
   * Ailleurs (sécante, tangente, limites…) on ne calcule que l'allumé : ces
   * laboratoires n'affichent pas de tableau d'étude, et le balayage coûte.
   */
  const studying = data.lab === 'study';
  const needsBreaks = studying || layers.asymptotes || layers.discontinuities || layers.increasing || layers.signStrip;
  // Le point de la limite est SONDÉ en plus du balayage : un trou est de
  // mesure nulle et la grille peut l'enjamber (analysisMath.findDiscontinuities).
  const breaks = needsBreaks || layers.roots
    ? findDiscontinuities(primary.fn, view.xMin, view.xMax, { samples: 480, probe: data.limitPoint })
    : null;
  if (studying || layers.discontinuities) scene.discontinuities = breaks;

  if (studying || layers.roots) {
    scene.roots = findRoots(primary.fn, view.xMin, view.xMax, { samples: 720 });
  }
  if (studying || layers.extrema || layers.criticalPoints) {
    scene.extrema = findCriticalPoints(primary.fn, primary.derivative, view.xMin, view.xMax, { samples: 480 });
  }
  if (studying || layers.increasing || layers.decreasing) {
    scene.variation = findVariationIntervals(primary.fn, primary.derivative, view.xMin, view.xMax, {
      samples: 480, critical: scene.extrema, breaks,
    });
  }
  if (studying || layers.asymptotes) {
    scene.asymptotes = findAsymptotes(primary.fn, view.xMin, view.xMax, { breaks });
    // Les limites en ±∞, exactes quand le moteur sait les donner : elles
    // NOMMENT l'asymptote horizontale que le balayage a seulement mesurée.
    if (isEngineReady()) {
      const plus = limitOf(primarySource, '+inf');
      const minus = limitOf(primarySource, '-inf');
      scene.exactLimitsAtInfinity = {
        plus: plus.ok ? plus : null,
        minus: minus.ok ? minus : null,
      };
    }
  }
  if (options.withDomain) {
    scene.domain = observedDomain(primary.fn, view.xMin, view.xMax, { samples: 480 });
  }

  // ── §11 – §14 : les limites ─────────────────────────────────────────────
  if (layers.approach || layers.limitLines) {
    const at = data.limitPoint;
    const limit = twoSidedLimit(primary.fn, at);
    scene.limit = limit;

    /**
     * La limite EXACTE, quand le moteur symbolique sait la donner.
     *
     * Elle ne REMPLACE pas la lecture numérique — elle la complète. Les deux
     * tables d'approche restent ce que l'élève regarde (§11), et le verdict
     * « les deux côtés diffèrent » reste celui des tables (§12), parce que
     * c'est la lecture du programme : pour le manuel, la limite de
     * 1/x en 0 n'existe pas, là où Nerdamer répond `Infinity` (une autre
     * convention, parfaitement défendable, mais pas celle qu'on enseigne).
     *
     * Ce que le symbolique apporte, c'est la VALEUR JUSTE quand elle existe :
     * la table lit « ≈ 0,333 », le moteur écrit `1/3`. C'est la différence
     * entre une observation et un résultat, et §35 demande de les distinguer.
     *
     * Le moteur n'est interrogé que s'il est DÉJÀ chargé : `buildScene` est
     * synchrone et tourne à chaque glissement. Le chargement, lui, est
     * déclenché une fois par le composant.
     */
    if (isEngineReady() && limit.agree) {
      const exact = limitOf(primarySource, at);
      if (exact.ok) scene.exactLimit = exact;
    }
    const left = approachTable(primary.fn, at, 'left', APPROACH_STEPS).map((row) => ({ ...row, side: 'left' }));
    const right = approachTable(primary.fn, at, 'right', APPROACH_STEPS).map((row) => ({ ...row, side: 'right' }));
    scene.approachTables = { left, right };
    // Les marques dessinées : seulement celles qui tombent DANS la fenêtre,
    // sinon on empile des points invisibles au bord.
    scene.approach = [...left, ...right].filter((row) => (
      row.y !== null && row.x >= view.xMin && row.x <= view.xMax && row.y >= view.yMin && row.y <= view.yMax
    ));
    scene.limitLines = {
      at,
      values: [
        ...(limit.left.kind === 'finite' ? [{ side: 'left', value: limit.left.value }] : []),
        ...(limit.right.kind === 'finite' && !limit.agree ? [{ side: 'right', value: limit.right.value }] : []),
      ],
    };
  }

  // ── §19 – §22 : l'aire, Riemann, la primitive ───────────────────────────
  if (layers.area) {
    scene.areaPath = buildAreaPath(primary.fn, data.bounds.a, data.bounds.b);
    scene.area = signedAndGeometricArea(primary.fn, data.bounds.a, data.bounds.b, { intervals: 600 });
  }
  if (layers.riemann) {
    scene.riemann = riemannSum(primary.fn, data.bounds.a, data.bounds.b, data.riemann.n, data.riemann.mode);
    if (!scene.area) {
      scene.area = signedAndGeometricArea(primary.fn, data.bounds.a, data.bounds.b, { intervals: 600 });
    }
    const exact = scene.area?.signed;
    scene.riemannError = exact?.ok ? Math.abs(scene.riemann.sum - exact.value) : null;
  }
  if (layers.antiderivative) {
    scene.antiderivativeFn = antiderivativeSampler(primary.fn, data.bounds.a, data.constant, { intervals: 160 });
  }

  // ── §23, §26 : deux courbes ─────────────────────────────────────────────
  if (scene.second) {
    if (layers.intersections) {
      scene.intersections = findIntersections(primary.fn, scene.second.fn, view.xMin, view.xMax, { samples: 720 });
    }
    if (layers.betweenCurves) {
      scene.between = areaBetween(primary.fn, scene.second.fn, data.bounds.a, data.bounds.b, { intervals: 600 });
      scene.betweenPath = buildBetweenPath(primary.fn, scene.second.fn, data.bounds.a, data.bounds.b);
    }
  }

  // ── §25 : la transformation, et l'original qui reste visible ────────────
  if (data.transform && layers.original) {
    const transformation = getTransformation(data.transform.id);
    if (transformation) {
      const transformedSource = transformation.apply(primarySource, data.transform.value);
      const transformed = compileFunction(transformedSource, scope);
      if (transformed.ok) {
        // L'ORIGINAL reste gris derrière, la transformée prend la couleur de f.
        scene.originalFn = primary.fn;
        scene.functions = [
          { id: 'f', fn: transformed.fn, color: data.functions[0].color, visible: true },
          ...scene.functions.slice(1),
        ];
        scene.transformedSource = transformedSource;
      }
    }
  }

  return scene;
}

/**
 * Le contour de l'aire sous la courbe, DÉCOUPÉ aux zéros de f.
 *
 * §21 interdit de traiter toute intégrale comme une aire : ce qui est
 * au-dessous de l'axe doit se distinguer visuellement de ce qui est
 * au-dessus. On rend donc une liste de morceaux, chacun avec son SIGNE, et
 * `SceneLayer` les remplit de deux couleurs différentes.
 */
function buildAreaPath(fn, a, b) {
  const low = Math.min(a, b);
  const high = Math.max(a, b);
  if (!(high > low)) return [];

  const step = (high - low) / AREA_SAMPLES;
  const pieces = [];
  let current = null;

  const closePiece = () => {
    if (current && current.points.length >= 2) {
      // On referme sur l'axe : le dernier point, puis le premier, à y = 0.
      const first = current.points[0][0];
      const last = current.points[current.points.length - 1][0];
      current.points.push([last, 0]);
      current.points.unshift([first, 0]);
      pieces.push(current);
    }
    current = null;
  };

  for (let i = 0; i <= AREA_SAMPLES; i += 1) {
    const x = i === AREA_SAMPLES ? high : low + i * step;
    const y = fn(x);
    if (!Number.isFinite(y)) { closePiece(); continue; }
    const sign = y < 0 ? -1 : 1;
    if (current && current.sign !== sign) closePiece();
    if (!current) current = { sign, points: [] };
    current.points.push([x, y]);
  }
  closePiece();

  return pieces;
}

/** Le contour de la région entre f et g, du bord a au bord b (§23). */
function buildBetweenPath(f, g, a, b) {
  const low = Math.min(a, b);
  const high = Math.max(a, b);
  if (!(high > low)) return [];

  const step = (high - low) / AREA_SAMPLES;
  const top = [];
  const bottom = [];
  for (let i = 0; i <= AREA_SAMPLES; i += 1) {
    const x = i === AREA_SAMPLES ? high : low + i * step;
    const yf = f(x);
    const yg = g(x);
    if (!Number.isFinite(yf) || !Number.isFinite(yg)) continue;
    top.push([x, Math.max(yf, yg)]);
    bottom.push([x, Math.min(yf, yg)]);
  }
  if (top.length < 2) return [];

  return [{ sign: 1, points: [...top, ...bottom.reverse()] }];
}

