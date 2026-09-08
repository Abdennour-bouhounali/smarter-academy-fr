import { describe, it, expect } from 'vitest';
import {
  droite, configuration, sontParalleles, ecartDirections, angleParId,
  sontCorrespondants, sontAlternesInternes, sontAlternesExternes,
  sontOpposesParSommet, sontSupplementaires, pointsDe,
} from './angles';

const P = (x, y) => ({ x, y });
const close = (a, b, eps = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(eps);

/** Deux droites parallèles coupées par une sécante — la figure de la leçon. */
const paralleles = (dir = 0, dirS = 55) => configuration(
  droite(P(400, 180), dir),
  droite(P(400, 380), dir),
  droite(P(400, 280), dirS),
);

/** Les mêmes, mais NON parallèles : le contre-exemple du module. */
const nonParalleles = (ecart = 14) => configuration(
  droite(P(400, 180), 0),
  droite(P(400, 380), ecart),
  droite(P(400, 280), 55),
);

describe('le périmètre est exécutable', () => {
  it('refuse une sécante parallèle à l’une des droites — aucun angle n’y existe', () => {
    expect(() => configuration(
      droite(P(400, 180), 0), droite(P(400, 380), 0), droite(P(400, 280), 0),
    )).toThrow(/sécante/);
  });

  it('accepte une vraie sécante', () => {
    expect(() => paralleles()).not.toThrow();
  });
});

describe('la configuration', () => {
  it('produit exactement huit angles', () => {
    expect(paralleles().angles).toHaveLength(8);
  });

  it('quatre angles par sommet', () => {
    const { angles } = paralleles();
    expect(angles.filter((a) => a.sommet === 'A')).toHaveLength(4);
    expect(angles.filter((a) => a.sommet === 'B')).toHaveLength(4);
  });

  it('quatre angles intérieurs, quatre extérieurs', () => {
    const { angles } = paralleles();
    expect(angles.filter((a) => a.interieur)).toHaveLength(4);
    expect(angles.filter((a) => !a.interieur)).toHaveLength(4);
  });

  it('les deux points d’intersection sont sur la sécante et distincts', () => {
    const { A, B, s } = paralleles();
    expect(Math.hypot(A.x - B.x, A.y - B.y)).toBeGreaterThan(1);
    // A et B appartiennent bien à la sécante : ils sont alignés avec son point.
    const [s0, s1] = pointsDe(s);
    const aire = Math.abs((s1.x - s0.x) * (A.y - s0.y) - (A.x - s0.x) * (s1.y - s0.y));
    expect(aire / Math.hypot(s1.x - s0.x, s1.y - s0.y)).toBeLessThan(1e-6);
  });

  it('en chaque sommet, les quatre angles font 360°', () => {
    const { angles } = paralleles(0, 70);
    for (const som of ['A', 'B']) {
      const s = angles.filter((a) => a.sommet === som).reduce((t, a) => t + a.mesure, 0);
      close(s, 360, 1e-6);
    }
  });
});

describe('LE FAIT CENTRAL — parallèles ⟺ angles égaux', () => {
  it('avec deux parallèles, les angles CORRESPONDANTS sont égaux', () => {
    // Sur plusieurs inclinaisons de sécante : la propriété ne doit pas
    // dépendre d'un cas favorable choisi pour la figure de départ.
    for (const dirS of [30, 45, 55, 75, 110, 140]) {
      const cfg = paralleles(0, dirS);
      for (const x of cfg.angles) {
        for (const y of cfg.angles) {
          if (sontCorrespondants(x, y)) close(x.mesure, y.mesure, 1e-6);
        }
      }
    }
  });

  it('avec deux parallèles, les angles ALTERNES-INTERNES sont égaux', () => {
    for (const dirS of [30, 55, 95, 130]) {
      const cfg = paralleles(0, dirS);
      for (const x of cfg.angles) {
        for (const y of cfg.angles) {
          if (sontAlternesInternes(x, y)) close(x.mesure, y.mesure, 1e-6);
        }
      }
    }
  });

  it('avec deux parallèles, les angles ALTERNES-EXTERNES sont égaux aussi', () => {
    const cfg = paralleles(0, 65);
    for (const x of cfg.angles) {
      for (const y of cfg.angles) {
        if (sontAlternesExternes(x, y)) close(x.mesure, y.mesure, 1e-6);
      }
    }
  });

  it('la propriété tient quelle que soit l’INCLINAISON commune des parallèles', () => {
    for (const dir of [0, 12, 40, 88, 155]) {
      const cfg = paralleles(dir, dir + 50);
      for (const x of cfg.angles) {
        for (const y of cfg.angles) {
          if (sontAlternesInternes(x, y)) close(x.mesure, y.mesure, 1e-6);
        }
      }
    }
  });

  /* LA RÉCIPROQUE, côté contre-exemple : sans parallélisme, l'égalité tombe.
     C'est ce qui rend la propriété informative — sinon elle serait vraie
     partout et ne prouverait rien. */
  it('SANS parallélisme, les alternes-internes ne sont PLUS égaux', () => {
    for (const ecart of [8, 14, 25, 40]) {
      const cfg = nonParalleles(ecart);
      const paires = [];
      for (const x of cfg.angles) {
        for (const y of cfg.angles) {
          if (sontAlternesInternes(x, y)) paires.push(Math.abs(x.mesure - y.mesure));
        }
      }
      expect(paires.length).toBeGreaterThan(0);
      // L'écart des angles vaut exactement l'écart des directions.
      for (const d of paires) close(d, ecart, 1e-6);
    }
  });

  it('l’écart des alternes-internes MESURE l’écart au parallélisme', () => {
    // C'est ce qui permet au laboratoire d'afficher « il s'en faut de 6° ».
    const cfg = nonParalleles(6);
    const d1 = cfg.d1; const d2 = cfg.d2;
    close(ecartDirections(d1, d2), 6, 1e-9);
    expect(sontParalleles(d1, d2)).toBe(false);
  });
});

describe('les autres relations, vraies même sans parallélisme', () => {
  it('les angles opposés par le sommet sont égaux, parallèles ou non', () => {
    for (const cfg of [paralleles(), nonParalleles(20)]) {
      for (const x of cfg.angles) {
        for (const y of cfg.angles) {
          if (sontOpposesParSommet(x, y)) close(x.mesure, y.mesure, 1e-6);
        }
      }
    }
  });

  it('deux angles adjacents en un sommet sont supplémentaires', () => {
    const cfg = nonParalleles(18);
    const a = angleParId(cfg, 'App');
    const b = angleParId(cfg, 'Apm');   // même côté de la droite, sens opposé
    expect(sontSupplementaires(a, b)).toBe(true);
  });
});

describe('les prédicats ne se confondent pas', () => {
  it('un angle n’est jamais en relation avec lui-même', () => {
    const { angles } = paralleles();
    for (const a of angles) {
      expect(sontCorrespondants(a, a)).toBe(false);
      expect(sontAlternesInternes(a, a)).toBe(false);
      expect(sontOpposesParSommet(a, a)).toBe(false);
    }
  });

  it('correspondants et alternes-internes sont exclusifs', () => {
    const { angles } = paralleles();
    for (const x of angles) {
      for (const y of angles) {
        expect(sontCorrespondants(x, y) && sontAlternesInternes(x, y)).toBe(false);
      }
    }
  });

  it('chaque angle a exactement un correspondant', () => {
    const { angles } = paralleles();
    for (const x of angles) {
      expect(angles.filter((y) => sontCorrespondants(x, y))).toHaveLength(1);
    }
  });

  it('chaque angle intérieur a exactement un alterne-interne', () => {
    const { angles } = paralleles();
    for (const x of angles.filter((a) => a.interieur)) {
      expect(angles.filter((y) => sontAlternesInternes(x, y))).toHaveLength(1);
    }
  });
});
