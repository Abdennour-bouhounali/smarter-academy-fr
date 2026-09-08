import { describe, it, expect } from 'vitest';
import {
  expr, valeur, ecrire, ecrireAvecFois, memeExpression, memeValeurSur,
  developper, ecrireProduit, developperNombres,
  MOTIFS, premieresValeurs, ecartConstant,
  confusionConcatenation, confusionSansConstante, confusionSomme,
  confusionDemiDistribution, diagnostiquerSubstitution,
  MOTIF_SIGNATURE, ETAPE_HORS_DESSIN, ETAPE_TRES_LOIN, CARRELAGE, parseEntier,
} from './litteral';

describe('substitution — remplacer la lettre par un nombre', () => {
  it('évalue a × n + b', () => {
    expect(valeur(expr(3, 2), 4)).toBe(14);
    expect(valeur(expr(1, 0), 7)).toBe(7);
    expect(valeur(expr(0, 5), 9)).toBe(5);
  });

  it('la lettre est un EMPLACEMENT : la même expression accepte toute valeur', () => {
    const e = expr(2, 1);
    for (let n = 0; n <= 50; n += 1) expect(valeur(e, n)).toBe(2 * n + 1);
  });
});

describe('écriture — les conventions du niveau', () => {
  it('n’écrit pas le × entre un nombre et une lettre', () => {
    expect(ecrire(expr(3, 0))).toBe('3n');
    expect(ecrire(expr(3, 2))).toBe('3n + 2');
  });

  it('n’écrit pas le coefficient 1', () => {
    expect(ecrire(expr(1, 4))).toBe('n + 4');
  });

  it('n’écrit pas « + 0 »', () => {
    expect(ecrire(expr(5, 0))).toBe('5n');
  });

  it('écrit une constante négative avec un vrai signe moins', () => {
    expect(ecrire(expr(2, -3))).toBe('2n − 3');
  });

  it('garde une écriture explicite quand on la demande', () => {
    expect(ecrireAvecFois(expr(3, 2))).toBe('3 × n + 2');
  });

  it('accepte une autre lettre', () => {
    expect(ecrire(expr(4, 1), 'x')).toBe('4x + 1');
  });
});

describe('équivalence — deux écritures, une seule expression', () => {
  it('memeExpression et memeValeurSur disent la même chose — balayage', () => {
    for (let a1 = 0; a1 <= 5; a1 += 1) {
      for (let b1 = 0; b1 <= 5; b1 += 1) {
        for (let a2 = 0; a2 <= 5; a2 += 1) {
          for (let b2 = 0; b2 <= 5; b2 += 1) {
            const e1 = expr(a1, b1);
            const e2 = expr(a2, b2);
            expect(memeExpression(e1, e2)).toBe(memeValeurSur(e1, e2));
          }
        }
      }
    }
  });
});

describe('distributivité simple', () => {
  it('développer ne change JAMAIS la valeur — balayage exhaustif', () => {
    // C'est l'affirmation centrale du module 5 : elle est testée, pas relue.
    for (let k = 0; k <= 8; k += 1) {
      for (let a = 0; a <= 6; a += 1) {
        for (let b = 0; b <= 6; b += 1) {
          const e = expr(a, b);
          const d = developper(k, e);
          for (let n = 0; n <= 20; n += 1) {
            expect(valeur(d, n)).toBe(k * valeur(e, n));
          }
        }
      }
    }
  });

  it('3 × (n + 2) donne 3n + 6', () => {
    expect(developper(3, expr(1, 2))).toEqual(expr(3, 6));
    expect(ecrire(developper(3, expr(1, 2)))).toBe('3n + 6');
    expect(ecrireProduit(3, expr(1, 2))).toBe('3 × (n + 2)');
  });

  it('PÉRIMÈTRE : REFUSE la double distributivité — objet de 4e', () => {
    expect(() => developper(expr(1, 2), expr(1, 3))).toThrow(/double distributivité/);
    expect(() => developper('n', expr(1, 2))).toThrow(/nombre seul/);
  });

  it('la version numérique coïncide toujours', () => {
    for (let k = 0; k <= 12; k += 1) {
      for (let a = 0; a <= 12; a += 1) {
        for (let b = 0; b <= 12; b += 1) {
          const { gauche, droite } = developperNombres(k, a, b);
          expect(gauche).toBe(droite);
        }
      }
    }
  });
});

describe('motifs — la figure ne contredit jamais la formule', () => {
  it('chaque motif compte bien ce que sa formule annonce — balayage', () => {
    // Un motif dont le dessin dirait autre chose que sa règle serait un
    // mensonge pédagogique : c'est exactement ce que ce test interdit.
    for (const motif of Object.values(MOTIFS)) {
      for (let n = 1; n <= 30; n += 1) {
        expect(motif.compte(n)).toBe(valeur(motif.regle, n));
      }
    }
  });

  it('l’écart entre deux étapes est constant et vaut le coefficient', () => {
    for (const motif of Object.values(MOTIFS)) {
      const ecart = ecartConstant(motif);
      expect(ecart).toBe(motif.regle.a);
      for (let n = 1; n <= 20; n += 1) {
        expect(motif.compte(n + 1) - motif.compte(n)).toBe(ecart);
      }
    }
  });

  it('le tableau des premières valeurs est correct', () => {
    expect(premieresValeurs(MOTIFS.escalier, 4)).toEqual([
      { etape: 1, nombre: 3 },
      { etape: 2, nombre: 5 },
      { etape: 3, nombre: 7 },
      { etape: 4, nombre: 9 },
    ]);
  });

  it('le motif signature donne les valeurs annoncées aux étapes lointaines', () => {
    expect(valeur(MOTIF_SIGNATURE.regle, ETAPE_HORS_DESSIN)).toBe(41);
    expect(valeur(MOTIF_SIGNATURE.regle, ETAPE_TRES_LOIN)).toBe(201);
  });

  it('la formule du carrelage compte bien la bordure', () => {
    for (let n = 1; n <= 20; n += 1) {
      expect(CARRELAGE.compte(n)).toBe(valeur(CARRELAGE.regle, n));
    }
    expect(CARRELAGE.compte(10)).toBe(44);
  });
});

describe('diagnostic des erreurs — nommer l’erreur, pas dire « faux »', () => {
  it('reconnaît le coefficient collé à la valeur (3n avec n = 4 lu 34)', () => {
    expect(confusionConcatenation(expr(3, 0), 4)).toBe(34);
    expect(diagnostiquerSubstitution(expr(3, 0), 4, 34)).toBe('colle');
  });

  it('reconnaît l’oubli de la partie constante', () => {
    expect(confusionSansConstante(expr(2, 5), 3)).toBe(6);
    expect(diagnostiquerSubstitution(expr(2, 5), 3, 6)).toBe('oubli-constante');
  });

  it('reconnaît l’addition au lieu de la multiplication', () => {
    expect(confusionSomme(expr(3, 1), 4)).toBe(8);
    expect(diagnostiquerSubstitution(expr(3, 1), 4, 8)).toBe('ajoute');
  });

  it('reconnaît la bonne réponse', () => {
    expect(diagnostiquerSubstitution(expr(2, 1), 5, 11)).toBe('ok');
  });

  it('reconnaît la distribution faite à moitié', () => {
    // 3 × (2n + 5) → 6n + 5 au lieu de 6n + 15.
    expect(confusionDemiDistribution(3, expr(2, 5))).toEqual(expr(6, 5));
    expect(confusionDemiDistribution(3, expr(2, 5))).not.toEqual(developper(3, expr(2, 5)));
  });

  it('les quatre confusions sont bien distinctes sur un cas typique', () => {
    const e = expr(3, 2);
    const n = 4;
    const vals = [
      valeur(e, n),
      confusionConcatenation(e, n),
      confusionSansConstante(e, n),
      confusionSomme(e, n),
    ];
    expect(new Set(vals).size).toBe(4);
  });
});

describe('les options du module 4 restent distinctes', () => {
  it('aucune ligne ne propose deux fois la même valeur', () => {
    // Le module 4 propose, pour chaque valeur de n : la bonne réponse,
    // l'oubli de la partie fixe, et l'addition au lieu du produit. Deux
    // options identiques rendraient la question insoluble — cette garde le
    // vérifie sur les valeurs réellement utilisées.
    const e = expr(3, 2);
    for (const v of [0, 2, 5]) {
      const options = [valeur(e, v), confusionSansConstante(e, v), confusionSomme(e, v)];
      expect(new Set(options).size).toBe(3);
    }
  });

  it('signale les valeurs de n où deux options se confondraient', () => {
    // Pour a n + b, la bonne réponse (a n + b) et le distracteur « somme »
    // (a + n + b) coïncident exactement quand a n = a + n. Le module doit
    // éviter ces valeurs-là ; on les calcule plutôt que de les supposer.
    const e = expr(3, 2);
    const collisions = [];
    for (let v = 0; v <= 20; v += 1) {
      if (valeur(e, v) === confusionSomme(e, v)) collisions.push(v);
    }
    // Pour 3n + 2, la collision n'arrive qu'en n = 1,5 — donc jamais sur un
    // entier. Les trois valeurs du module sont sûres, et le resteraient même
    // si on en ajoutait d'autres.
    expect(collisions).toEqual([]);
  });
});

describe('parseEntier', () => {
  it('accepte un entier et les espaces', () => {
    expect(parseEntier('14')).toBe(14);
    expect(parseEntier(' 201 ')).toBe(201);
  });

  it('refuse le reste', () => {
    expect(parseEntier('3n')).toBeNaN();
    expect(parseEntier('-2')).toBeNaN();
    expect(parseEntier('')).toBeNaN();
  });
});
