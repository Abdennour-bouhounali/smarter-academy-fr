import { describe, it, expect } from 'vitest';
import {
  fmt, fmtParen, oppose, distanceAZero, ecart, cote, compare, ranger,
  ajouter, soustraire, memeResultat, sensDeplacement, diagnostiquerPosition,
  IMMEUBLE, RELEVE, amplitude, jourLePlusFroid, parseRelatif,
} from './relatifs';

describe('écriture', () => {
  it('utilise le vrai signe moins (U+2212), pas le trait d’union', () => {
    expect(fmt(-4)).toBe('−4');
    expect(fmt(-4).charCodeAt(0)).toBe(0x2212);
  });
  it('n’ajoute pas de + devant un positif hors parenthèses', () => {
    expect(fmt(7)).toBe('7');
    expect(fmt(0)).toBe('0');
  });
  it('explicite le signe entre parenthèses, comme dans 3 + (−5)', () => {
    expect(fmtParen(-5)).toBe('(−5)');
    expect(fmtParen(5)).toBe('(+5)');
  });
});

describe('opposé et distance à zéro', () => {
  it('l’opposé est à la même distance de zéro, de l’autre côté', () => {
    for (const n of [-9, -1, 0, 3, 12]) {
      expect(distanceAZero(oppose(n))).toBe(distanceAZero(n));
      if (n !== 0) expect(cote(oppose(n))).not.toBe(cote(n));
    }
  });
  it('zéro est son propre opposé', () => {
    expect(oppose(0)).toBe(0);
    expect(cote(0)).toBe('zero');
  });
  it('la distance à zéro n’est jamais négative', () => {
    for (const n of [-11, -1, 0, 6]) expect(distanceAZero(n)).toBeGreaterThanOrEqual(0);
  });
});

describe('comparaison — le piège central de la leçon', () => {
  it('−2 est plus grand que −7, alors que 2 est plus petit que 7', () => {
    expect(compare(-2, -7)).toBe(1);
    expect(compare(2, 7)).toBe(-1);
  });
  it('range dans l’ordre de la droite graduée', () => {
    expect(ranger([3, -7, 0, -2, 5])).toEqual([-7, -2, 0, 3, 5]);
  });
  it('tout négatif est plus petit que tout positif', () => {
    for (const n of [-1, -8]) for (const p of [1, 4]) expect(compare(n, p)).toBe(-1);
  });
  it('un plus grand nombre n’est pas forcément plus loin de zéro', () => {
    expect(compare(-2, -7)).toBe(1);
    expect(distanceAZero(-2)).toBeLessThan(distanceAZero(-7));
  });
});

describe('addition et soustraction comme déplacements', () => {
  it('ajouter un négatif déplace vers la gauche', () => {
    expect(ajouter(3, -5)).toBe(-2);
    expect(sensDeplacement(-5)).toBe('gauche');
  });
  it('ajouter un positif déplace vers la droite', () => {
    expect(ajouter(-4, 6)).toBe(2);
    expect(sensDeplacement(6)).toBe('droite');
  });
  it('soustraire revient à ajouter l’opposé — sur toute la plage', () => {
    for (let a = -12; a <= 12; a++) {
      for (let b = -12; b <= 12; b++) {
        expect(soustraire(a, b)).toBe(ajouter(a, oppose(b)));
        expect(memeResultat(a, b)).toBe(true);
      }
    }
  });
  it('l’écart entre deux nombres est la valeur absolue de leur différence', () => {
    expect(ecart(-7, -2)).toBe(5);
    expect(ecart(-2, -7)).toBe(5);
    expect(ecart(-3, 4)).toBe(7);
  });
});

describe('diagnostic d’une position manquée', () => {
  it('reconnaît le bon écart du mauvais côté de zéro', () => {
    expect(diagnostiquerPosition(-3, 3)).toBe('signe');
  });
  it('reconnaît la position juste', () => {
    expect(diagnostiquerPosition(-3, -3)).toBe('ok');
  });
  it('distingue trop à droite et trop à gauche', () => {
    expect(diagnostiquerPosition(-3, -1)).toBe('trop-a-droite');
    expect(diagnostiquerPosition(-3, -5)).toBe('trop-a-gauche');
  });
});

describe('scénarios', () => {
  it('l’immeuble contient bien le sol et des étages des deux côtés', () => {
    expect(IMMEUBLE.min).toBeLessThan(0);
    expect(IMMEUBLE.max).toBeGreaterThan(0);
    expect(IMMEUBLE.sol).toBe(0);
    // Le zéro doit porter un repère NOMMÉ : c'est lui qui ancre « le sol »
    // dans l'histoire, et sans lui l'étage 0 ne se distingue pas des autres.
    expect(IMMEUBLE.reperes[0]).toMatch(/rez-de-chauss/i);
  });
  it('chaque jour du relevé a un minimum au plus égal à son maximum', () => {
    for (const j of RELEVE) expect(j.min).toBeLessThanOrEqual(j.max);
  });
  it('l’amplitude est positive et vaut max − min', () => {
    for (const j of RELEVE) {
      expect(amplitude(j)).toBe(j.max - j.min);
      expect(amplitude(j)).toBeGreaterThan(0);
    }
  });
  it('le jour le plus froid est bien celui du minimum le plus bas', () => {
    const f = jourLePlusFroid();
    expect(f.jour).toBe('Mercredi');
    for (const j of RELEVE) expect(f.min).toBeLessThanOrEqual(j.min);
  });
  // La leçon affirme au module 6 que le jour le plus froid n'est pas celui de
  // la plus grande amplitude : la claim est vérifiée ici, pas relue.
  it('le jour le plus froid n’est pas celui de la plus grande amplitude', () => {
    const froid = jourLePlusFroid();
    const ampleMax = RELEVE.reduce((a, b) => (amplitude(b) > amplitude(a) ? b : a));
    expect(ampleMax.jour).not.toBe(froid.jour);
  });
});

describe('parseRelatif — saisie d’un relatif par l’élève', () => {
  it('accepte le vrai signe moins affiché par la leçon (U+2212)', () => {
    expect(parseRelatif('−5')).toBe(-5);
    expect(parseRelatif(fmt(-5))).toBe(-5);
  });
  it('accepte aussi le trait d’union du clavier', () => {
    expect(parseRelatif('-5')).toBe(-5);
  });
  it('accepte un signe + explicite et les positifs nus', () => {
    expect(parseRelatif('+5')).toBe(5);
    expect(parseRelatif('5')).toBe(5);
  });
  it('tolère les espaces autour du nombre', () => {
    expect(parseRelatif(' −12 ')).toBe(-12);
  });
  it('ne renvoie jamais -0', () => {
    expect(Object.is(parseRelatif('−0'), -0)).toBe(false);
    expect(parseRelatif('−0')).toBe(0);
  });
  it('refuse ce qui n’est pas un entier relatif', () => {
    for (const bad of ['', 'abc', '3,5', '--4', '4-']) {
      expect(Number.isNaN(parseRelatif(bad))).toBe(true);
    }
  });
  // Le piège que ce parseur existe pour éviter : tout ce que la leçon AFFICHE
  // doit pouvoir être ressaisi tel quel par l'élève.
  it('relit tout ce que fmt() écrit, sur toute la plage de la leçon', () => {
    for (let n = -12; n <= 12; n++) expect(parseRelatif(fmt(n))).toBe(n);
  });
});
