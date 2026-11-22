import { describe, it, expect } from 'vitest';
import {
  parseConicEquation, parseLineEquation, formatCanonical, formatGeneral, formatLine, generalToConic,
} from './conicParser.js';
import * as C from './conicMath.js';

/**
 * Les tests de l'analyseur (§54 « equation parsing », §30, §51).
 *
 * Deux exigences s'y croisent : il doit RECONNAÎTRE ce que l'élève écrit
 * comme au tableau, et il doit REFUSER clairement tout le reste — sans
 * jamais rendre une conique approximative pour une entrée qu'il n'a pas
 * comprise.
 */

describe('les formes canoniques', () => {
  it('lit un cercle et en rend centre et rayon', () => {
    const r = parseConicEquation('(x-2)^2 + (y+3)^2 = 16');
    expect(r.ok).toBe(true);
    expect(r.conic).toEqual({ kind: 'circle', h: 2, k: -3, r: 4 });
  });

  it('accepte le ² typographique, le − typographique et la virgule décimale', () => {
    const r = parseConicEquation('(x − 1,5)² + y² = 6,25');
    expect(r.ok).toBe(true);
    expect(r.conic).toMatchObject({ kind: 'circle', h: 1.5, k: 0, r: 2.5 });
  });

  it('lit une ellipse en forme canonique', () => {
    const r = parseConicEquation('x^2/9 + y^2/4 = 1');
    expect(r.ok).toBe(true);
    expect(r.conic).toMatchObject({ kind: 'ellipse', h: 0, k: 0, a: 3, b: 2 });
  });

  it('lit une hyperbole et son orientation', () => {
    const horizontal = parseConicEquation('(x-1)^2/9 - (y+2)^2/4 = 1');
    expect(horizontal.conic).toMatchObject({
      kind: 'hyperbola', h: 1, k: -2, a: 3, b: 2, orientation: 'horizontal',
    });
    const vertical = parseConicEquation('y^2/9 - x^2/4 = 1');
    expect(vertical.conic).toMatchObject({ kind: 'hyperbola', a: 3, b: 2, orientation: 'vertical' });
  });

  it('lit une parabole en forme de sommet, dans les deux sens', () => {
    const up = parseConicEquation('y = 2(x-1)^2 - 3');
    expect(up.conic).toMatchObject({
      kind: 'parabola', h: 1, k: -3, a: 2, orientation: 'horizontal',
    });
    const right = parseConicEquation('x = -(y+1)^2');
    expect(right.conic).toMatchObject({
      kind: 'parabola', h: 0, k: -1, a: -1, orientation: 'vertical',
    });
  });

  it('accepte la multiplication implicite comme au manuel', () => {
    expect(parseConicEquation('y = 2x^2').conic).toMatchObject({ kind: 'parabola', a: 2 });
    expect(parseConicEquation('y = 3(x-1)(x-1)').conic).toMatchObject({ kind: 'parabola', a: 3, h: 1, k: 0 });
  });
});

describe('la complétion du carré (§30)', () => {
  it('x² + y² − 4x − 6y + 9 = 0 devient (x−2)² + (y−3)² = 4', () => {
    const r = parseConicEquation('x^2 + y^2 - 4x - 6y + 9 = 0');
    expect(r.ok).toBe(true);
    expect(r.conic).toEqual({ kind: 'circle', h: 2, k: 3, r: 2 });
    expect(formatCanonical(r.conic)).toBe('(x − 2)² + (y − 3)² = 4');
  });

  it('4x² + 9y² = 36 devient une ellipse de demi-axes 3 et 2', () => {
    const r = parseConicEquation('4x^2 + 9y^2 = 36');
    expect(r.conic).toMatchObject({ kind: 'ellipse', a: 3, b: 2 });
  });

  it('une développée et sa canonique donnent LA MÊME conique', () => {
    const canonical = parseConicEquation('(x-2)^2 + (y-3)^2 = 4').conic;
    const expanded = parseConicEquation('x^2 + y^2 - 4x - 6y + 9 = 0').conic;
    expect(expanded).toEqual(canonical);
  });

  it('reconnaît une parabole écrite développée', () => {
    // y = x² − 2x + 4 = (x−1)² + 3
    const r = parseConicEquation('y = x^2 - 2x + 4');
    expect(r.conic).toMatchObject({
      kind: 'parabola', h: 1, k: 3, a: 1,
    });
  });

  it('reconnaît une hyperbole écrite développée', () => {
    const r = parseConicEquation('9x^2 - 4y^2 = 36');
    expect(r.conic).toMatchObject({
      kind: 'hyperbola', a: 2, b: 3, orientation: 'horizontal',
    });
  });
});

describe('les refus qui ENSEIGNENT (§51)', () => {
  const codeOf = (text) => parseConicEquation(text).error;

  it('nomme chaque cas dégénéré plutôt que « erreur »', () => {
    expect(codeOf('x^2 + y^2 = 0')).toBe('pointCircle');
    expect(codeOf('x^2 + y^2 = -4')).toBe('emptySet');
    expect(codeOf('x^2 - y^2 = 0')).toBe('crossingLines');
    expect(codeOf('2x + 3y = 6')).toBe('line');
    expect(codeOf('x^2 = 4')).toBe('parallelLines');
  });

  it('refuse la conique TOURNÉE, hors de V1 (§57)', () => {
    expect(codeOf('x^2 + xy + y^2 = 1')).toBe('rotated');
  });

  it('refuse le degré 3 et au-delà', () => {
    expect(codeOf('y = x^3')).toBe('exponent');
    expect(codeOf('y = x^2 * x')).toBe('degree');
  });

  it('refuse une division par une variable ou par zéro', () => {
    expect(codeOf('y = 1/x')).toBe('divideByVariable');
    expect(codeOf('y = x^2/0')).toBe('divideByZero');
  });

  it('refuse ce qui n\'est pas une équation', () => {
    expect(codeOf('')).toBe('empty');
    expect(codeOf('x^2 + y^2')).toBe('noEquals');
    expect(codeOf('x = y = 1')).toBe('manyEquals');
    expect(codeOf('(x^2 + y^2 = 4')).toBe('unclosed');
  });

  it('n\'exécute JAMAIS l\'entrée : une fonction inconnue est un caractère inconnu', () => {
    expect(codeOf('y = alert(1)')).toBeTruthy();
    expect(codeOf('y = sin(x)')).toBeTruthy();
    expect(parseConicEquation('y = constructor').ok).toBe(false);
  });

  it('refuse une saisie démesurée sans tenter de l\'analyser', () => {
    expect(codeOf(`y = ${'x+'.repeat(200)}x`)).toBe('tooLong');
  });
});

describe('l\'écriture (§7, §30)', () => {
  it('écrit chaque famille comme le manuel', () => {
    expect(formatCanonical({ kind: 'circle', h: 0, k: 0, r: 3 })).toBe('x² + y² = 9');
    expect(formatCanonical({ kind: 'circle', h: 2, k: -3, r: 4 })).toBe('(x − 2)² + (y + 3)² = 16');
    expect(formatCanonical({ kind: 'ellipse', h: 0, k: 0, a: 3, b: 2 })).toBe('x²/9 + y²/4 = 1');
    expect(formatCanonical({
      kind: 'parabola', h: 1, k: -3, a: 2, orientation: 'horizontal',
    })).toBe('y = 2(x − 1)² − 3');
    expect(formatCanonical({
      kind: 'hyperbola', h: 0, k: 0, a: 3, b: 2, orientation: 'horizontal',
    })).toBe('x²/9 − y²/4 = 1');
  });

  it('omet le coefficient 1 et écrit « − » pour −1', () => {
    expect(formatCanonical({
      kind: 'parabola', h: 0, k: 0, a: 1, orientation: 'horizontal',
    })).toBe('y = x²');
    expect(formatCanonical({
      kind: 'parabola', h: 0, k: 0, a: -1, orientation: 'horizontal',
    })).toBe('y = −x²');
  });

  it('ce qui est ÉCRIT peut être RELU : l\'aller-retour est fidèle', () => {
    const cases = [
      { kind: 'circle', h: 2, k: -3, r: 4 },
      { kind: 'ellipse', h: 1, k: 2, a: 3, b: 2 },
      { kind: 'hyperbola', h: -1, k: 1, a: 2, b: 3, orientation: 'horizontal' },
      { kind: 'hyperbola', h: 0, k: 0, a: 2, b: 3, orientation: 'vertical' },
      { kind: 'parabola', h: 1, k: -3, a: 2, orientation: 'horizontal' },
      { kind: 'parabola', h: -2, k: 1, a: -0.5, orientation: 'vertical' },
    ];
    for (const conic of cases) {
      const written = formatCanonical(conic);
      const read = parseConicEquation(written);
      expect(read.ok, `« ${written} » doit être relisible`).toBe(true);
      expect(read.conic.kind, written).toBe(conic.kind);
      for (const [key, value] of Object.entries(conic)) {
        if (typeof value !== 'number') {
          expect(read.conic[key], `${written} → ${key}`).toBe(value);
          continue;
        }
        expect(read.conic[key], `${written} → ${key}`).toBeCloseTo(value, 9);
      }
    }
  });

  it('la forme développée est relisible elle aussi, et donne la même conique', () => {
    const conic = { kind: 'circle', h: 2, k: 3, r: 2 };
    const expanded = formatGeneral(conic);
    expect(parseConicEquation(expanded).conic).toEqual(conic);
  });
});

describe('generalToConic, directement', () => {
  it('classe par les signes de A et C', () => {
    expect(generalToConic({
      A: 1, B: 0, C: 1, D: 0, E: 0, F: -4,
    }).conic.kind).toBe('circle');
    expect(generalToConic({
      A: 1, B: 0, C: 4, D: 0, E: 0, F: -4,
    }).conic.kind).toBe('ellipse');
    expect(generalToConic({
      A: 1, B: 0, C: -1, D: 0, E: 0, F: -4,
    }).conic.kind).toBe('hyperbola');
    expect(generalToConic({
      A: 1, B: 0, C: 0, D: 0, E: -1, F: 0,
    }).conic.kind).toBe('parabola');
  });

  it('la conique rendue est TOUJOURS valide pour le moteur', () => {
    const inputs = [
      'x^2 + y^2 = 9', '4x^2 + 9y^2 = 36', 'y = x^2 - 2x + 4', '9x^2 - 4y^2 = 36',
      '(x-2)^2 + (y+3)^2 = 16', 'x = 2(y-1)^2 + 3',
    ];
    for (const text of inputs) {
      const r = parseConicEquation(text);
      expect(r.ok, text).toBe(true);
      expect(C.isValidConic(r.conic), text).toBe(true);
      expect(C.conicFeatures(r.conic), text).not.toBeNull();
    }
  });
});

describe('les DROITES (§26) — même analyseur, mêmes règles', () => {
  it('lit la forme du manuel', () => {
    expect(parseLineEquation('y = 2x - 1').line).toEqual({ vertical: false, slope: 2, intercept: -1 });
    expect(parseLineEquation('y = -x').line).toEqual({ vertical: false, slope: -1, intercept: 0 });
    expect(parseLineEquation('y = 3').line).toEqual({ vertical: false, slope: 0, intercept: 3 });
  });

  it('lit une VERTICALE, qui n\'a pas de pente', () => {
    expect(parseLineEquation('x = 2').line).toEqual({ vertical: true, x: 2 });
    expect(parseLineEquation('2x - 6 = 0').line).toEqual({ vertical: true, x: 3 });
  });

  it('lit une équation écrite dans n\'importe quel sens', () => {
    // 2x + 3y = 6  →  y = −2/3 x + 2
    const r = parseLineEquation('2x + 3y = 6');
    expect(r.ok).toBe(true);
    expect(r.line.slope).toBeCloseTo(-2 / 3, 12);
    expect(r.line.intercept).toBeCloseTo(2, 12);
  });

  it('hérite de la multiplication implicite et de la typographie arabe', () => {
    expect(parseLineEquation('y = 2,5x').line.slope).toBe(2.5);
    expect(parseLineEquation('y = −x + 1').line).toEqual({ vertical: false, slope: -1, intercept: 1 });
  });

  it('REFUSE une conique dans le champ d\'une droite, et le dit', () => {
    expect(parseLineEquation('x^2 + y^2 = 9').error).toBe('notALine');
    expect(parseLineEquation('y = x^2').error).toBe('notALine');
  });

  it('hérite des refus de l\'analyseur, y compris la sécurité (§51)', () => {
    expect(parseLineEquation('').error).toBe('empty');
    expect(parseLineEquation('y').error).toBe('noEquals');
    expect(parseLineEquation('y = 1/x').error).toBe('divideByVariable');
    expect(parseLineEquation('y = alert(1)').ok).toBe(false);
    expect(parseLineEquation('3 = 3').error).toBe('notEquation');
  });

  it('écrit la droite comme au tableau', () => {
    expect(formatLine({ vertical: false, slope: 2, intercept: -1 })).toBe('y = 2x − 1');
    expect(formatLine({ vertical: false, slope: 1, intercept: 0 })).toBe('y = x');
    expect(formatLine({ vertical: false, slope: -1, intercept: 3 })).toBe('y = −x + 3');
    expect(formatLine({ vertical: false, slope: 0, intercept: -2 })).toBe('y = −2');
    expect(formatLine({ vertical: true, x: 4 })).toBe('x = 4');
  });

  it('ce qui est ÉCRIT peut être RELU, comme pour les coniques', () => {
    const cases = [
      { vertical: false, slope: 2, intercept: -1 },
      { vertical: false, slope: -1, intercept: 0 },
      { vertical: false, slope: 0, intercept: 5 },
      { vertical: false, slope: 0.25, intercept: -3.5 },
      { vertical: true, x: -2 },
    ];
    for (const line of cases) {
      const written = formatLine(line);
      const read = parseLineEquation(written);
      expect(read.ok, written).toBe(true);
      expect(read.line.vertical, written).toBe(line.vertical);
      if (line.vertical) expect(read.line.x, written).toBeCloseTo(line.x, 9);
      else {
        expect(read.line.slope, written).toBeCloseTo(line.slope, 9);
        expect(read.line.intercept, written).toBeCloseTo(line.intercept, 9);
      }
    }
  });
});
