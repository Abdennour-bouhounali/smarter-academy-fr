import { fracToText, simplify } from './fraction.js';
import { primeFactorization, factorizationToText, gcd, lcm } from './numberTheory.js';
import { powerOf, scientificNotation, simplifySqrt } from './powers.js';
import { evaluateStepByStep } from './orderOfOperations.js';

/**
 * Le RÉSUMÉ d'un document du مختبر الأعداد (§5i.2 de MATH_LAB.md).
 *
 * Un laboratoire à treize modes pose une question que les autres instruments
 * n'avaient pas : que montre la carte ? La réponse est **le mode où l'élève
 * travaillait**, et le nombre qu'il y manipulait — c'est ce qui permet de
 * reconnaître son document dans « أعمالي » sans l'ouvrir.
 *
 * La forme d'aperçu réutilise celles qui existent déjà plutôt que d'en
 * ajouter une : `equation` pour ce qui s'écrit (360 = 2³ × 3² × 5), `chart`
 * pour ce qui se compte. Aucune ligne de plus dans WorkPreview.jsx.
 *
 * Fonction PURE : elle tourne à chaque sauvegarde, sans React et sans moteur.
 *
 * @param {object} data
 * @returns {import('../../toolContract.js').MathLabSummary | null}
 */
export function summarizeNumberLab(data) {
  if (!data || typeof data !== 'object') return null;
  const mode = typeof data.mode === 'string' ? data.mode : 'explorer';

  try {
    const line = describe(mode, data);
    if (!line) return null;

    return {
      kind: line.kind,
      // Ce que la RECHERCHE lit : le nombre travaillé et son écriture.
      text: line.text.filter(Boolean).slice(0, 6).map((entry) => String(entry).slice(0, 60)),
      detail: { mode, ...line.detail },
    };
  } catch {
    return null;
  }
}

/** Ce que chaque mode a à dire de lui-même, en quelques dizaines d'octets. */
function describe(mode, data) {
  switch (mode) {
    case 'explorer': {
      const value = int(data.explorer?.value);
      if (value === null) return null;
      const factors = Math.abs(value) >= 2 ? primeFactorization(Math.abs(value)) : null;

      return {
        kind: 'equation',
        text: [String(value), factors ? factorizationToText(factors) : null],
        detail: { value, first: String(value), current: factors ? factorizationToText(factors) : String(value) },
      };
    }

    case 'place': {
      const value = int(data.place?.value);
      if (value === null) return null;

      return { kind: 'equation', text: [String(value)], detail: { value, first: String(value), current: String(value) } };
    }

    case 'line': {
      const points = Array.isArray(data.line?.points) ? data.line.points.filter(isFrac) : [];
      if (points.length === 0) return null;
      const texts = points.map(fracToText);

      return {
        kind: 'equation',
        text: texts,
        detail: { first: texts[0], current: texts[1] ?? texts[0], points: points.length },
      };
    }

    case 'fractions': {
      const left = isFrac(data.fractions?.left) ? data.fractions.left : null;
      const right = isFrac(data.fractions?.right) ? data.fractions.right : null;
      if (!left) return null;
      const symbol = OPERATION_SIGNS[data.fractions?.operation] ?? '+';
      const written = right ? `${fracToText(left)} ${symbol} ${fracToText(right)}` : fracToText(left);

      return {
        kind: 'equation',
        text: [written, fracToText(simplify(left))],
        detail: { first: written, current: written },
      };
    }

    case 'decimals': {
      const value = num(data.decimals?.value);
      if (value === null) return null;
      const written = String(value).replace('.', ',');

      return { kind: 'equation', text: [written], detail: { first: written, current: written } };
    }

    case 'percent': {
      const percent = num(data.percent?.percent);
      const quantity = num(data.percent?.quantity);
      if (percent === null || quantity === null) return null;
      const written = `${trim(percent)} % — ${trim(quantity)}`;

      return { kind: 'equation', text: [written], detail: { first: written, current: written } };
    }

    case 'proportion': {
      const rows = Array.isArray(data.proportion?.rows) ? data.proportion.rows.filter((r) => num(r?.x) !== null) : [];
      if (rows.length === 0) return null;

      return {
        kind: 'chart',
        text: [rows.slice(0, 4).map((r) => `${trim(r.x)}→${trim(r.y)}`).join(' ')],
        // La forme « chart » se dessine avec des barres : les y font l'affaire.
        detail: { bars: rows.slice(0, 8).map((r) => Math.abs(num(r.y) ?? 0)), draws: rows.length },
      };
    }

    case 'divisibility': {
      const value = int(data.divisibility?.value);
      if (value === null) return null;

      return { kind: 'equation', text: [String(value)], detail: { first: String(value), current: String(value) } };
    }

    case 'primes': {
      const tree = data.primes?.factorTree;
      const value = int(tree?.n);
      if (value !== null && value >= 2) {
        const factors = primeFactorization(value);
        const written = factors ? factorizationToText(factors) : String(value);

        return { kind: 'equation', text: [String(value), written], detail: { first: String(value), current: written } };
      }
      const limit = int(data.primes?.limit);
      if (limit === null) return null;

      return { kind: 'equation', text: [`1 → ${limit}`], detail: { first: `1 → ${limit}`, current: `1 → ${limit}` } };
    }

    case 'factors': {
      const value = int(data.factors?.value);
      if (value === null) return null;

      return { kind: 'equation', text: [String(value)], detail: { first: String(value), current: String(value) } };
    }

    case 'gcdLcm': {
      const a = int(data.gcdLcm?.a);
      const b = int(data.gcdLcm?.b);
      if (a === null || b === null) return null;
      const written = `(${a} ; ${b})`;

      return {
        kind: 'equation',
        text: [written, `${gcd(a, b)} · ${lcm(a, b)}`],
        detail: { first: written, current: `${gcd(a, b)} · ${lcm(a, b)}` },
      };
    }

    case 'rounding': {
      const value = num(data.rounding?.value);
      if (value === null) return null;
      const written = String(value).replace('.', ',');

      return { kind: 'equation', text: [written], detail: { first: written, current: written } };
    }

    case 'operations': {
      const a = num(data.operations?.a);
      const b = num(data.operations?.b);
      if (a === null || b === null) return null;
      const written = `${trim(a)} ${OPERATION_SIGNS[data.operations?.operation] ?? '+'} ${trim(b)}`;

      return { kind: 'equation', text: [written], detail: { first: written, current: written } };
    }

    case 'division': {
      const a = int(data.division?.a);
      const b = int(data.division?.b);
      if (a === null || b === null || b <= 0 || a < 0) return null;
      const q = Math.floor(a / b);
      const written = `${a} = ${b} × ${q} + ${a - b * q}`;

      return { kind: 'equation', text: [written], detail: { first: `${a} ÷ ${b}`, current: written } };
    }

    case 'powers': {
      const p = data.powers ?? {};
      let written = null;
      if (p.tab === 'roots' && int(p.root) !== null) {
        const r = simplifySqrt(p.root);
        written = r.error ? `√${p.root}` : (r.perfect ? `√${r.n} = ${r.outer}` : r.simplified ? `√${r.n} = ${r.outer}√${r.inner}` : `√${r.n}`);
      } else if (p.tab === 'scientific' && typeof p.scientific === 'string') {
        const s = scientificNotation(p.scientific);
        written = s.error ? p.scientific.slice(0, 32) : `${s.sign < 0 ? '−' : ''}${s.mantissa} × 10^${s.exponent}`;
      } else if (p.tab === 'rules' && typeof p.rule === 'string') {
        written = `${p.ruleBase}^${p.m} · ${p.ruleBase}^${p.n}`;
      } else if (int(p.base) !== null && int(p.exponent) !== null) {
        const r = powerOf(p.base, p.exponent);
        written = r.error ? `${p.base}^${p.exponent}` : `${p.base}^${p.exponent} = ${r.text}`;
      }
      if (!written) return null;

      return { kind: 'equation', text: [written], detail: { first: written, current: written } };
    }

    case 'order': {
      const expression = typeof data.order?.expression === 'string' ? data.order.expression.trim().slice(0, 60) : '';
      if (!expression) return null;
      const run = evaluateStepByStep(expression);
      const result = run.ok ? run.result.fraction : null;

      return {
        kind: 'equation',
        text: [expression, result],
        detail: { first: expression, current: result ? `${expression} = ${result}` : expression },
      };
    }

    default:
      return null;
  }
}

const OPERATION_SIGNS = Object.freeze({
  add: '+', subtract: '−', multiply: '×', divide: '÷', compare: '?',
});

const isFrac = (v) => Boolean(v) && typeof v === 'object' && Number.isFinite(v.n) && Number.isFinite(v.d) && v.d !== 0;
const num = (v) => (Number.isFinite(v) ? v : null);
const int = (v) => (Number.isInteger(v) ? v : null);
const trim = (v) => String(Math.round(v * 1000) / 1000).replace('.', ',').replace('-', '−');
