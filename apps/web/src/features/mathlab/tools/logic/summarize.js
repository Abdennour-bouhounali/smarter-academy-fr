import {
  STATEMENTS, IMPLICATIONS, EQUIVALENCES, COUNTEREXAMPLE_CHALLENGES, CONDITIONS,
  QUANTIFIER_STATEMENTS, PROOFS, FALLACIES, findPreset,
} from './presets.js';
import { connectorExpression, formOf, equivalenceOf, SYMBOLS } from './logicFormat.js';

/**
 * Le RÉSUMÉ d'un document du مختبر المنطق والبرهان.
 *
 * Il dit ce que l'élève A FAIT, pas ce que l'instrument s'appelle : la carte
 * de « أعمالي » montre l'énoncé sur lequel il travaillait et où il en était
 * — « ∀n premier, n > 2 ⇒ n pair » puis « n = 3 » quand le contre-exemple
 * est trouvé. Un titre générique (« منطق ») n'aurait distingué aucun de ses
 * documents des autres.
 *
 * La forme d'aperçu est `equation` : deux lignes de notation LTR, exactement
 * ce que `WorkPreview.EquationPreview` dessine déjà. C'est la règle du
 * contrat (`toolContract.js`) — `kind` nomme la FORME de l'aperçu, pas
 * l'outil — et la même décision que numberLab, qui réutilise `equation` pour
 * douze de ses treize modes plutôt que d'ajouter un dessin par mode.
 *
 * Pure, sans React, tolérante à tout état (un document plus ancien, une
 * forme inattendue) : elle rend `null` plutôt que de lever, et la carte
 * retombe alors sur l'icône de l'instrument.
 *
 * @param {object} data
 * @returns {import('../../toolContract.js').MathLabSummary | null}
 */
export function summarizeLogic(data) {
  if (!data || typeof data !== 'object') return null;
  const area = typeof data.area === 'string' ? data.area : 'counterexample';
  const drawn = describe(area, data);
  if (!drawn) return null;

  return {
    kind: 'equation',
    text: drawn.text.filter(Boolean).slice(0, 6).map((entry) => String(entry).slice(0, 80)),
    detail: { first: drawn.first ?? '', current: drawn.current ?? '' },
  };
}

function describe(area, data) {
  switch (area) {
    case 'statements': {
      const preset = findPreset(STATEMENTS, data.statements?.id);
      const formula = preset.formula ?? preset.id;
      const verdict = data.statements?.verdict;

      return {
        first: formula,
        current: verdict ? verdictSymbol(verdict) : '',
        text: [formula, preset.domain?.symbol],
      };
    }

    case 'connectors': {
      const connector = data.connectors?.connector ?? 'implies';
      const expression = connectorExpression(connector);

      return {
        first: expression,
        current: `${boolLetter(data.connectors?.p)} ${boolLetter(data.connectors?.q)}`,
        text: [expression],
      };
    }

    case 'implication': {
      const preset = findPreset(IMPLICATIONS, data.implication?.id);
      const form = data.implication?.form ?? 'direct';

      return {
        first: formOf('direct', preset.p.formula, preset.q.formula),
        current: form === 'direct' ? '' : formOf(form, preset.p.formula, preset.q.formula),
        text: [preset.p.formula, preset.q.formula, form],
      };
    }

    case 'equivalence': {
      const preset = findPreset(EQUIVALENCES, data.equivalence?.id);

      return {
        first: equivalenceOf(preset.p.formula, preset.q.formula),
        current: '',
        text: [preset.p.formula, preset.q.formula],
      };
    }

    case 'counterexample': {
      const preset = findPreset(COUNTEREXAMPLE_CHALLENGES, data.counterexample?.id);
      const found = data.counterexample?.found;
      const tried = Array.isArray(data.counterexample?.tried) ? data.counterexample.tried.length : 0;

      return {
        first: preset.formula ?? `${SYMBOLS.forall}x, P(x)`,
        current: Number.isFinite(found) ? `x = ${found}` : (tried > 0 ? `${tried} ${SYMBOLS.in} …` : ''),
        text: [preset.id, preset.domain?.symbol],
      };
    }

    case 'conditions': {
      const preset = findPreset(CONDITIONS, data.conditions?.id);

      return {
        first: formOf('direct', preset.a.formula, preset.b.formula),
        current: '',
        text: [preset.a.formula, preset.b.formula],
      };
    }

    case 'quantifiers': {
      const preset = findPreset(QUANTIFIER_STATEMENTS, data.quantifiers?.id);
      const witness = data.quantifiers?.witness;
      const counter = data.quantifiers?.counterexample;
      const mark = Number.isFinite(counter) ? `x = ${counter}` : (Number.isFinite(witness) ? `x = ${witness}` : '');

      return { first: preset.formula, current: mark, text: [preset.formula] };
    }

    case 'negation': {
      const kind = data.negation?.kind ?? 'and';
      if (kind === 'and' || kind === 'or') {
        const left = kind === 'and' ? `${SYMBOLS.not}(P ${SYMBOLS.and} Q)` : `${SYMBOLS.not}(P ${SYMBOLS.or} Q)`;
        const right = kind === 'and'
          ? `${SYMBOLS.not}P ${SYMBOLS.or} ${SYMBOLS.not}Q`
          : `${SYMBOLS.not}P ${SYMBOLS.and} ${SYMBOLS.not}Q`;

        return { first: left, current: right, text: [left, right] };
      }
      const preset = findPreset(QUANTIFIER_STATEMENTS, data.negation?.quantifierId);

      return { first: preset.formula, current: preset.negationFormula, text: [preset.formula] };
    }

    case 'proof': {
      const preset = findPreset(PROOFS, data.proof?.id);
      const placed = Array.isArray(data.proof?.placed) ? data.proof.placed.length : 0;
      const total = preset.steps.length;

      return {
        first: preset.id,
        current: `${placed}\u00A0/\u00A0${total}`,
        text: [preset.id, preset.strategy],
      };
    }

    case 'fallacy': {
      const preset = findPreset(FALLACIES, data.fallacy?.id);

      return {
        first: preset.kind,
        current: data.fallacy?.kind ? verdictOfNaming(data.fallacy.kind, preset.kind) : '',
        text: [preset.id, preset.kind],
      };
    }

    default:
      return null;
  }
}

const verdictSymbol = (verdict) => ({ true: 'ص', false: 'خ', depends: '؟' }[verdict] ?? '');
const boolLetter = (value) => (value === true ? 'ص' : value === false ? 'خ' : '؟');
const verdictOfNaming = (named, expected) => (named === expected ? '✓' : '?');
