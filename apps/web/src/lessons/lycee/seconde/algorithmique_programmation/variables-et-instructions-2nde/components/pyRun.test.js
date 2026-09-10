import { describe, it, expect } from 'vitest';
import { pyRun, pyStr, pyType, makeRng } from './pyRun';

const out = (src, opts) => pyRun(src, opts).output;
const err = (src) => pyRun(src).error;

describe('affectation, types et affichage', () => {
  it('affecte puis affiche', () => {
    expect(out('x = 5\nprint(x)')).toEqual(['5']);
  });

  it('distingue les quatre types de la leçon', () => {
    const { env } = pyRun('a = 3\nb = 2.5\nc = True\nd = "salut"');
    expect(pyType(env.a)).toBe('int');
    expect(pyType(env.b)).toBe('float');
    expect(pyType(env.c)).toBe('bool');
    expect(pyType(env.d)).toBe('str');
  });

  it('affiche True/False comme Python, pas true/false', () => {
    expect(out('print(3 > 2)')).toEqual(['True']);
    expect(pyStr(false)).toBe('False');
  });

  it('n’écrit pas « .0 » sur un entier', () => {
    expect(out('print(10 / 2)')).toEqual(['5']);
    expect(out('print(7 / 2)')).toEqual(['3.5']);
  });

  it('une variable lue avant d’exister est une erreur LISIBLE', () => {
    const e = err('print(total)');
    expect(e).not.toBeNull();
    expect(e.message).toMatch(/n'existe pas encore/);
    expect(e.line).toBe(1);
  });

  it('l’affectation n’est pas une égalité : x = x + 1 augmente x', () => {
    expect(out('x = 4\nx = x + 1\nprint(x)')).toEqual(['5']);
    expect(out('x = 4\nx += 3\nprint(x)')).toEqual(['7']);
  });
});

describe('opérations', () => {
  it('respecte les priorités', () => {
    expect(out('print(2 + 3 * 4)')).toEqual(['14']);
    expect(out('print((2 + 3) * 4)')).toEqual(['20']);
  });

  it('distingue / (flottant) et // (entier)', () => {
    expect(out('print(7 / 2)')).toEqual(['3.5']);
    expect(out('print(7 // 2)')).toEqual(['3']);
    expect(out('print(7 % 2)')).toEqual(['1']);
  });

  it('refuse la division par zéro avec un message clair', () => {
    expect(err('print(5 / 0)').message).toMatch(/division par zéro/);
  });

  it('refuse d’additionner un nombre et une chaîne', () => {
    expect(err('print("age " + 12)').message).toMatch(/str\(/);
  });

  it('concatène deux chaînes', () => {
    expect(out('print("bon" + "jour")')).toEqual(['bonjour']);
  });
});

describe('conditionnelle', () => {
  const prog = (n) => `note = ${n}\nif note >= 10:\n    print("admis")\nelse:\n    print("recale")`;

  it('choisit la bonne branche', () => {
    expect(out(prog(12))).toEqual(['admis']);
    expect(out(prog(8))).toEqual(['recale']);
  });

  it('le cas limite tombe du bon côté avec >=', () => {
    expect(out(prog(10))).toEqual(['admis']);
  });

  it('elif n’exécute qu’UNE branche', () => {
    const p = 'x = 5\nif x > 10:\n    print("grand")\nelif x > 3:\n    print("moyen")\nelif x > 0:\n    print("petit")\nelse:\n    print("nul")';
    expect(out(p)).toEqual(['moyen']);
  });
});

describe('boucles', () => {
  it('for parcourt range(n) : de 0 à n−1', () => {
    expect(out('for i in range(3):\n    print(i)')).toEqual(['0', '1', '2']);
  });

  it('range(a, b) commence à a et s’arrête AVANT b', () => {
    expect(out('for i in range(2, 5):\n    print(i)')).toEqual(['2', '3', '4']);
  });

  it('accumule une somme — le motif de la leçon', () => {
    expect(out('s = 0\nfor i in range(1, 11):\n    s += i\nprint(s)')).toEqual(['55']);
  });

  it('while s’arrête quand la condition devient fausse', () => {
    expect(out('n = 1\nwhile n < 20:\n    n = n * 2\nprint(n)')).toEqual(['32']);
  });

  it('une boucle infinie est ARRÊTÉE et expliquée', () => {
    const e = err('n = 1\nwhile n > 0:\n    n = n + 1');
    expect(e).not.toBeNull();
    expect(e.message).toMatch(/ne s’arrête pas/);
  });

  it('for imbriqué dans if : le corps ne s’exécute que si la condition tient', () => {
    const p = 'c = 0\nfor i in range(10):\n    if i % 2 == 0:\n        c += 1\nprint(c)';
    expect(out(p)).toEqual(['5']);
  });
});

describe('hasard reproductible', () => {
  it('randint reste dans les bornes, bornes comprises', () => {
    const rng = makeRng(42);
    const { env } = pyRun('mini = 7\nmaxi = 1\nfor i in range(200):\n    d = randint(1, 6)\n    if d < mini:\n        mini = d\n    if d > maxi:\n        maxi = d', { rng });
    expect(env.mini).toBeGreaterThanOrEqual(1);
    expect(env.maxi).toBeLessThanOrEqual(6);
    expect(env.maxi).toBe(6);
    expect(env.mini).toBe(1);
  });

  it('deux exécutions avec la MÊME graine donnent le même résultat', () => {
    const p = 's = 0\nfor i in range(50):\n    s += randint(1, 6)\nprint(s)';
    expect(out(p, { rng: makeRng(7) })).toEqual(out(p, { rng: makeRng(7) }));
  });

  it('deux graines différentes ne donnent pas le même résultat', () => {
    const p = 's = 0\nfor i in range(50):\n    s += randint(1, 6)\nprint(s)';
    expect(out(p, { rng: makeRng(7) })).not.toEqual(out(p, { rng: makeRng(99) }));
  });
});

describe('erreurs de syntaxe expliquées à l’élève', () => {
  it('signale un « : » manquant, avec le numéro de ligne', () => {
    const e = err('x = 3\nif x > 1\n    print(x)');
    expect(e.message).toMatch(/il manque « : »/);
    expect(e.line).toBe(2);
  });

  it('signale une parenthèse non fermée', () => {
    expect(err('print(2 + 3').message).toMatch(/parenthèse non fermée/);
  });

  it('refuse d’écraser un mot réservé', () => {
    expect(err('range = 5').message).toMatch(/mot réservé/);
  });
});

describe('les commentaires ne changent rien', () => {
  it('ignore ce qui suit #', () => {
    expect(out('x = 2  # le prix\nprint(x)  # affichage')).toEqual(['2']);
  });
});
