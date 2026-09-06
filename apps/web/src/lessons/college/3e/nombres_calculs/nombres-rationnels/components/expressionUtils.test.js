import { describe, it, expect } from 'vitest';
import {
  leaf, node, isLeaf, priority, operatorNodes, reducible, insideParen,
  reduce, replace, refusalReason, renderLatex, renderPlain, reduceFully, stepLabel,
} from './expressionUtils';
import { rat, toDecimal, plainFrac } from './rationalUtils';

/**
 * Ces tests fixent les affirmations MATHÉMATIQUES du module 6. Si l'une casse,
 * c'est le cours qui devient faux — pas seulement un rendu.
 */

/** 1/2 + 2/3 × 3/4  — sans parenthèses. */
const sansParen = () =>
  node('n-add', '+', leaf('a', rat(1, 2)), node('n-mul', '*', leaf('b', rat(2, 3)), leaf('c', rat(3, 4))));

/** (1/2 + 2/3) × 3/4 — avec parenthèses. */
const avecParen = () =>
  node('n-mul', '*', node('n-add', '+', leaf('a', rat(1, 2)), leaf('b', rat(2, 3)), true), leaf('c', rat(3, 4)));

describe('priority', () => {
  it('place × et ÷ au-dessus de + et −', () => {
    expect(priority('*')).toBe(2);
    expect(priority(':')).toBe(2);
    expect(priority('+')).toBe(1);
    expect(priority('-')).toBe(1);
  });
});

describe('structure', () => {
  it('reconnaît une feuille', () => {
    expect(isLeaf(leaf('x', rat(1, 2)))).toBe(true);
    expect(isLeaf(sansParen())).toBe(false);
  });

  it('liste les opérateurs de gauche à droite', () => {
    expect(operatorNodes(sansParen()).map((n) => n.id)).toEqual(['n-add', 'n-mul']);
  });

  it('sait ce qui est dans une parenthèse', () => {
    const t = avecParen();
    expect(insideParen(t, 'n-add')).toBe(true);
    expect(insideParen(t, 'n-mul')).toBe(false);
  });
});

describe('reducible — la règle de priorité', () => {
  it('sans parenthèses : SEUL le produit est exécutable', () => {
    expect(reducible(sansParen())).toEqual(['n-mul']);
  });

  it('avec parenthèses : SEULE l’addition est exécutable', () => {
    expect(reducible(avecParen())).toEqual(['n-add']);
  });

  it('à priorité égale, le plus à gauche passe', () => {
    // 1/2 + 1/3 + 1/6, associé à gauche
    const t = node('n2', '+', node('n1', '+', leaf('a', rat(1, 2)), leaf('b', rat(1, 3))), leaf('c', rat(1, 6)));
    expect(reducible(t)).toEqual(['n1']);
  });

  it('une feuille n’a plus rien à exécuter', () => {
    expect(reducible(leaf('x', rat(1, 2)))).toEqual([]);
  });
});

describe('reduce', () => {
  it('remplace le sous-arbre par sa valeur et décrit l’étape', () => {
    const { tree, step } = reduce(sansParen(), 'n-mul');
    expect(step.label).toBe('Le produit, prioritaire');
    expect(step.expr).toBe('2/3 × 3/4');
    expect(step.value).toBe('= 1/2');
    // l'addition devient exécutable à son tour
    expect(reducible(tree)).toEqual(['n-add']);
  });

  it('refuse un opérateur dont un morceau n’est pas encore un nombre', () => {
    expect(() => reduce(sansParen(), 'n-add')).toThrow(/morceau non calculé/i);
  });

  it('refuse un opérateur absent', () => {
    expect(() => reduce(sansParen(), 'inconnu')).toThrow(/Aucun opérateur/);
  });

  it('nomme la parenthèse dans le libellé', () => {
    const { step } = reduce(avecParen(), 'n-add');
    expect(step.label).toBe('La parenthèse d’abord');
  });
});

describe('reduceFully — les deux résultats du module', () => {
  it('1/2 + 2/3 × 3/4 = 1', () => {
    const { value, steps } = reduceFully(sansParen());
    expect(plainFrac(value)).toBe('1');
    expect(steps.map((s) => s.label)).toEqual(['Le produit, prioritaire', 'Puis la somme']);
  });

  it('(1/2 + 2/3) × 3/4 = 7/8 — mêmes nombres, autre résultat', () => {
    const { value } = reduceFully(avecParen());
    expect(plainFrac(value)).toBe('7/8');
  });

  it('les deux résultats sont bien DIFFÉRENTS (c’est tout le module)', () => {
    const sans = reduceFully(sansParen()).value;
    const avec = reduceFully(avecParen()).value;
    expect(toDecimal(sans)).not.toBe(toDecimal(avec));
  });

  it('l’ordre fautif (addition d’abord, sans parenthèses) donne 7/8 — le piège', () => {
    // On force l'addition : c'est ce que l'étape 2 laisse faire à l'élève.
    const t = sansParen();
    const forced = replace(t, 'n-add', node('n-add', '+', t.left, t.right.left));
    // 1/2 + 2/3 = 7/6, puis × 3/4 = 7/8
    const wrong = reduceFully(node('w', '*', leaf('s', rat(7, 6)), leaf('c', rat(3, 4)))).value;
    expect(plainFrac(wrong)).toBe('7/8');
    expect(forced).toBeTruthy();
  });
});

describe('refusalReason — une raison mathématique, jamais « réessaie »', () => {
  it('dit que le produit passe avant l’addition', () => {
    const r = refusalReason(sansParen(), 'n-add');
    expect(r).toMatch(/passe AVANT/);
    expect(r).toMatch(/prioritaires/);
  });

  it('dit que la parenthèse se calcule en premier', () => {
    const r = refusalReason(avecParen(), 'n-mul');
    expect(r).toMatch(/parenthèse/);
  });

  it('ne refuse pas ce qui est autorisé', () => {
    expect(refusalReason(sansParen(), 'n-mul')).toBe('');
    expect(refusalReason(avecParen(), 'n-add')).toBe('');
  });

  it('invoque la lecture gauche → droite à priorité égale', () => {
    const t = node('n2', '+', node('n1', '+', leaf('a', rat(1, 2)), leaf('b', rat(1, 3))), leaf('c', rat(1, 6)));
    expect(refusalReason(t, 'n2')).toMatch(/GAUCHE à DROITE/);
  });
});

describe('rendu', () => {
  it('écrit l’expression en LaTeX, parenthèses comprises', () => {
    expect(renderLatex(sansParen())).toContain('\\times');
    expect(renderLatex(avecParen())).toContain('\\left(');
  });

  it('écrit l’expression à plat, avec le vrai signe moins', () => {
    expect(renderPlain(sansParen())).toBe('1/2 + 2/3 × 3/4');
    expect(renderPlain(avecParen())).toBe('(1/2 + 2/3) × 3/4');
    expect(renderPlain(node('n', '-', leaf('a', rat(3, 4)), leaf('b', rat(1, 2))))).toBe('3/4 − 1/2');
  });

  it('stepLabel distingue produit, quotient et parenthèse', () => {
    expect(stepLabel('*', false)).toBe('Le produit, prioritaire');
    expect(stepLabel(':', false)).toBe('Le quotient, prioritaire');
    expect(stepLabel('+', true)).toBe('La parenthèse d’abord');
  });
});
