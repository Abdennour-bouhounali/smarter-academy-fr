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

/* ── Extensions de la leçon « fonctions en Python » ─────────────────────── */

describe('définir et appeler une fonction', () => {
  it('renvoie une valeur avec return', () => {
    expect(out('def double(x):\n    return 2 * x\nprint(double(7))')).toEqual(['14']);
  });

  it('accepte plusieurs arguments, dans l’ordre', () => {
    expect(out('def aire(L, l):\n    return L * l\nprint(aire(6, 4))')).toEqual(['24']);
    // l'ordre compte : aire(4, 6) donne le même produit, mais pas puissance(2,3)
    expect(out('def p(a, b):\n    return a - b\nprint(p(10, 3))\nprint(p(3, 10))')).toEqual(['7', '-7']);
  });

  it('accepte une fonction sans argument', () => {
    expect(out('def bonjour():\n    return "salut"\nprint(bonjour())')).toEqual(['salut']);
  });

  it('sort de la fonction dès le premier return atteint', () => {
    const src = 'def signe(x):\n    if x > 0:\n        return "positif"\n    return "négatif ou nul"\n';
    expect(out(src + 'print(signe(5))\nprint(signe(-2))')).toEqual(['positif', 'négatif ou nul']);
  });

  it('renvoie None quand aucun return n’est exécuté', () => {
    expect(out('def rien(x):\n    y = x\nprint(rien(3))')).toEqual(['None']);
  });

  it('garde les variables locales à la fonction', () => {
    const e = err('def f(x):\n    y = x + 1\n    return y\nprint(f(3))\nprint(y)');
    expect(e.message).toMatch(/« y » n'existe pas/);
    expect(e.line).toBe(5);
  });

  it('un paramètre ne modifie pas la variable globale de même nom', () => {
    expect(out('x = 100\ndef f(x):\n    x = x + 1\n    return x\nprint(f(1))\nprint(x)')).toEqual(['2', '100']);
  });

  it('signale un nombre d’arguments incorrect', () => {
    expect(err('def f(x):\n    return x\nprint(f(1, 2))').message).toMatch(/attend 1 argument/);
  });

  it('appelle une fonction depuis une autre', () => {
    expect(out('def carre(x):\n    return x * x\ndef somme_carres(a, b):\n    return carre(a) + carre(b)\nprint(somme_carres(3, 4))')).toEqual(['25']);
  });

  it('arrête une récursion sans fin au lieu de bloquer', () => {
    expect(err('def f(x):\n    return f(x)\nprint(f(1))').message).toMatch(/récursion|appels imbriqués/);
  });
});

describe('listes et séries statistiques', () => {
  it('construit une liste et la parcourt', () => {
    expect(out('notes = [12, 8, 15]\nprint(sum(notes))\nprint(len(notes))\nprint(max(notes))\nprint(min(notes))'))
      .toEqual(['35', '3', '15', '8']);
  });

  it('remplit une liste avec append dans une boucle', () => {
    expect(out('s = []\nfor i in range(1, 5):\n    s.append(i * i)\nprint(s)')).toEqual(['[1, 4, 9, 16]']);
  });

  it('lit un élément par son indice, à partir de 0', () => {
    expect(out('L = [5, 7, 9]\nprint(L[0])\nprint(L[2])')).toEqual(['5', '9']);
  });

  it('signale un indice hors de la liste', () => {
    expect(err('L = [5]\nprint(L[3])').message).toMatch(/hors de la liste/);
  });

  it('calcule une moyenne avec une fonction', () => {
    expect(out('def moyenne(L):\n    return sum(L) / len(L)\nprint(moyenne([10, 12, 14]))')).toEqual(['12']);
  });

  it('affiche une liste comme Python', () => {
    expect(pyStr([1, 2.5, true, 'a'])).toBe('[1, 2.5, True, a]');
    expect(pyType([1])).toBe('list');
  });
});

describe('aléatoire reproductible', () => {
  it('rend randint reproductible à graine fixée', () => {
    const a = out('def lancer():\n    return randint(1, 6)\ns = []\nfor i in range(5):\n    s.append(lancer())\nprint(s)', { rng: makeRng(42) });
    const b = out('def lancer():\n    return randint(1, 6)\ns = []\nfor i in range(5):\n    s.append(lancer())\nprint(s)', { rng: makeRng(42) });
    expect(a).toEqual(b);
  });

  it('ne produit que des valeurs de la plage demandée', () => {
    const src = 'def lancer():\n    return randint(1, 6)\ns = []\nfor i in range(200):\n    s.append(lancer())\nprint(min(s))\nprint(max(s))';
    const r = out(src, { rng: makeRng(3) });
    expect(Number(r[0])).toBeGreaterThanOrEqual(1);
    expect(Number(r[1])).toBeLessThanOrEqual(6);
  });

  it('simule 1000 lancers et compte une fréquence plausible', () => {
    const src = 'def lancer():\n    return randint(1, 6)\nsix = 0\nfor i in range(1000):\n    if lancer() == 6:\n        six = six + 1\nprint(six)';
    const n = Number(out(src, { rng: makeRng(1) })[0]);
    // 1/6 de 1000 ≈ 167 : on vérifie l'ordre de grandeur, pas une valeur exacte
    expect(n).toBeGreaterThan(120);
    expect(n).toBeLessThan(215);
  });
});

describe('portée du compteur de boucle', () => {
  it('rend le compteur d’une boucle interne visible dans la fonction', () => {
    const src = 'def somme_jusqua(n):\n    s = 0\n    for i in range(1, n + 1):\n        s = s + i\n    return s\nprint(somme_jusqua(10))\nprint(somme_jusqua(100))';
    expect(out(src)).toEqual(['55', '5050']);
  });

  it('ne fait pas fuir le compteur d’une fonction vers le programme principal', () => {
    const e = err('def f():\n    for i in range(3):\n        pass\n    return i\nprint(f())\nprint(i)');
    expect(e.message).toMatch(/« i » n'existe pas/);
    expect(e.line).toBe(6);
  });

  it('accepte pass comme corps vide', () => {
    expect(out('for i in range(2):\n    pass\nprint(i)')).toEqual(['1']);
  });
});
