import { describe, it, expect } from 'vitest';
import {
  avancer, tourner, lever, baisser, makeRepeat, estPlat,
  lit, formule, evalValeur, ecrireValeur, estLecture,
  derouler, tailleEcrite, tailleExecutee,
  executer, estFermee, capRetrouve, cadre, toSvg, mod360,
  angleExterieur, polygone, nomPolygone, ecrireProgramme, premiereDifference,
} from './trace';

/**
 * Les invariants de la leçon, écrits comme des tests.
 *
 * Chacun correspond à une PHRASE que la leçon dit à l'élève. Si le test tombe,
 * c'est la leçon qui ment — pas seulement le code qui casse.
 */

describe('valeurs : nombre, variable, formule', () => {
  it('un nombre écrit en dur ne dépend d’aucun environnement', () => {
    expect(evalValeur(60)).toBe(60);
    expect(evalValeur(60, { cote: 999 })).toBe(60);
    expect(estLecture(60)).toBe(false);
  });

  it('une variable est LUE dans l’environnement au moment de l’exécution', () => {
    expect(evalValeur(lit('cote'), { cote: 40 })).toBe(40);
    expect(evalValeur(lit('cote'), { cote: 90 })).toBe(90);
    expect(estLecture(lit('cote'))).toBe(true);
  });

  it('une variable absente vaut 0 — le programme continue, la figure montre le problème', () => {
    expect(evalValeur(lit('inconnue'), { cote: 40 })).toBe(0);
  });

  it('une formule combine la lecture, un produit puis une somme', () => {
    expect(evalValeur(formule('cote', { fois: 2 }), { cote: 30 })).toBe(60);
    expect(evalValeur(formule('cote', { plus: 10 }), { cote: 30 })).toBe(40);
    expect(evalValeur(formule('cote', { fois: 2, plus: 10 }), { cote: 30 })).toBe(70);
  });

  it('l’écriture affichée d’une valeur est celle que l’élève lit dans le programme', () => {
    expect(ecrireValeur(60)).toBe('60');
    expect(ecrireValeur(lit('cote'))).toBe('cote');
    expect(ecrireValeur(formule('cote', { fois: 2, plus: 10 }))).toBe('cote × 2 + 10');
    expect(ecrireValeur(formule('cote', { plus: -5 }))).toBe('cote − 5');
  });
});

describe('périmètre officiel de 5e — porté par la structure', () => {
  it('aucune instruction conditionnelle n’existe dans le moteur', () => {
    // « Conditions composées » est l'exclusion officielle. Il n'y a pas de
    // consigne à respecter : la structure ne sait pas les représenter.
    const noeuds = [avancer(10), tourner(90), lever(), baisser(), makeRepeat(2, [avancer(1)])];
    expect(noeuds.every((n) => ['AVANCER', 'TOURNER', 'LEVER', 'BAISSER', 'REPETER'].includes(n.kind))).toBe(true);
  });

  it('makeRepeat aplatit toute imbrication : une seule profondeur de boucle', () => {
    const imbrique = makeRepeat(3, [avancer(10), makeRepeat(2, [tourner(90)])]);
    expect(imbrique.corps).toHaveLength(1);
    expect(imbrique.corps[0].kind).toBe('AVANCER');
    expect(estPlat([imbrique])).toBe(true);
  });
});

describe('la boucle ne change pas le dessin, elle change ce qu’on écrit', () => {
  // C'est LA phrase du module 4. Elle doit être vraie mécaniquement.
  const aLaMain = [
    avancer(50), tourner(90), avancer(50), tourner(90),
    avancer(50), tourner(90), avancer(50), tourner(90),
  ];
  const enBoucle = [makeRepeat(4, [avancer(50), tourner(90)])];

  it('les deux programmes exécutent exactement les mêmes instructions', () => {
    const a = derouler(aLaMain).map(({ kind, valeur }) => ({ kind, valeur }));
    const b = derouler(enBoucle).map(({ kind, valeur }) => ({ kind, valeur }));
    expect(b).toEqual(a);
  });

  it('les deux programmes produisent exactement les mêmes segments', () => {
    const a = executer(aLaMain);
    const b = executer(enBoucle);
    expect(b.segments.map((s) => [s.x1, s.y1, s.x2, s.y2])).toEqual(a.segments.map((s) => [s.x1, s.y1, s.x2, s.y2]));
    expect(premiereDifference(a, b)).toBe(-1);
  });

  it('mais pas la même longueur ÉCRITE : 8 instructions contre 1', () => {
    expect(tailleEcrite(aLaMain)).toBe(8);
    expect(tailleEcrite(enBoucle)).toBe(1);
    expect(tailleExecutee(enBoucle)).toBe(tailleExecutee(aLaMain));
  });
});

describe('la boucle « répéter n fois » lit son n comme une variable', () => {
  it('changer n dans l’environnement change le nombre de tours', () => {
    const p = [makeRepeat(lit('n'), [avancer(10)])];
    expect(tailleExecutee(p, { n: 3 })).toBe(3);
    expect(tailleExecutee(p, { n: 7 })).toBe(7);
  });

  it('n = 0 exécute zéro tour, sans planter', () => {
    const p = [makeRepeat(lit('n'), [avancer(10)])];
    expect(tailleExecutee(p, { n: 0 })).toBe(0);
    expect(executer(p, { env: { n: 0 } }).segments).toHaveLength(0);
  });
});

describe('un programme, une famille de figures — la variable est l’entrée', () => {
  const p = [makeRepeat(4, [avancer(lit('cote')), tourner(90)])];

  it('le MÊME programme trace des carrés de tailles différentes', () => {
    const petit = executer(p, { env: { cote: 30 } });
    const grand = executer(p, { env: { cote: 90 } });
    expect(petit.longueur).toBe(120);
    expect(grand.longueur).toBe(360);
    expect(petit.segments).toHaveLength(4);
    expect(grand.segments).toHaveLength(4);
  });

  it('la figure se referme quelle que soit la valeur de la variable', () => {
    [10, 25, 60, 120, 200].forEach((cote) => {
      expect(estFermee(executer(p, { env: { cote } }))).toBe(true);
    });
  });
});

describe('le polygone régulier : n tours, 360 ÷ n degrés', () => {
  it('angleExterieur est bien 360 ÷ n', () => {
    expect(angleExterieur(3)).toBe(120);
    expect(angleExterieur(4)).toBe(90);
    expect(angleExterieur(5)).toBe(72);
    expect(angleExterieur(6)).toBe(60);
    expect(angleExterieur(12)).toBe(30);
  });

  it('pour tout n de 3 à 12, la figure se referme ET le stylo retrouve sa direction', () => {
    for (let n = 3; n <= 12; n += 1) {
      const r = executer(polygone(n, 60));
      expect(estFermee(r), `n=${n} devrait se refermer`).toBe(true);
      expect(capRetrouve(r), `n=${n} devrait retrouver son cap`).toBe(true);
      expect(r.segments, `n=${n} devrait avoir n côtés`).toHaveLength(n);
      expect(r.rotationTotale, `n=${n} : un tour complet`).toBe(360);
    }
  });

  it('un angle qui n’est pas 360 ÷ n laisse la figure OUVERTE — c’est le bug du module 6', () => {
    const faux = [makeRepeat(5, [avancer(60), tourner(90)])]; // 90 au lieu de 72
    const r = executer(faux);
    expect(estFermee(r)).toBe(false);
  });

  it('la longueur totale d’un polygone vaut n × côté', () => {
    expect(executer(polygone(6, 45)).longueur).toBe(270);
  });

  it('les noms usuels ne servent qu’à l’affichage', () => {
    expect(nomPolygone(4)).toBe('carré');
    expect(nomPolygone(5)).toBe('pentagone régulier');
    expect(nomPolygone(7)).toBe('polygone régulier à 7 côtés');
  });
});

describe('le stylo levé n’écrit pas, mais le déplacement a lieu', () => {
  it('LEVER supprime le trait sans supprimer le mouvement', () => {
    const r = executer([avancer(10), lever(), avancer(10), baisser(), avancer(10)]);
    expect(r.segments).toHaveLength(2);
    expect(r.final.x).toBe(30);
    expect(r.longueur).toBe(20); // la longueur TRACÉE, pas la distance parcourue
  });
});

describe('cadre et projection SVG', () => {
  it('un programme vide garde un cadre valide', () => {
    const c = cadre(executer([]));
    expect(c.largeur).toBeGreaterThan(0);
    expect(c.hauteur).toBeGreaterThan(0);
  });

  it('le cadre contient tous les segments et le point de départ', () => {
    const r = executer(polygone(4, 50));
    const c = cadre(r, 10);
    r.segments.forEach((s) => {
      [[s.x1, s.y1], [s.x2, s.y2]].forEach(([x, y]) => {
        expect(x).toBeGreaterThanOrEqual(c.minX);
        expect(x).toBeLessThanOrEqual(c.maxX);
        expect(y).toBeGreaterThanOrEqual(c.minY);
        expect(y).toBeLessThanOrEqual(c.maxY);
      });
    });
  });

  it('toSvg inverse l’axe vertical, une seule fois', () => {
    const c = { minX: 0, maxX: 100, minY: 0, maxY: 100, largeur: 100, hauteur: 100 };
    expect(toSvg(c, 0, 0)).toEqual({ x: 0, y: 100 });   // en bas à gauche
    expect(toSvg(c, 0, 100)).toEqual({ x: 0, y: 0 });   // en haut à gauche
  });

  it('tout point projeté reste DANS le cadre — aucune figure ne déborde', () => {
    for (let n = 3; n <= 12; n += 1) {
      const r = executer(polygone(n, 70));
      const c = cadre(r);
      r.segments.forEach((s) => {
        const p = toSvg(c, s.x2, s.y2);
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(c.largeur);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThanOrEqual(c.hauteur);
      });
    }
  });
});

describe('l’ordre des instructions fait partie du programme (acquis 6e, réutilisé)', () => {
  it('avancer puis tourner ne donne pas la même position que tourner puis avancer', () => {
    const a = executer([avancer(50), tourner(90)]);
    const b = executer([tourner(90), avancer(50)]);
    expect([a.final.x, a.final.y]).not.toEqual([b.final.x, b.final.y]);
  });
});

describe('outils', () => {
  it('mod360 ne renvoie jamais de valeur négative', () => {
    expect(mod360(-90)).toBe(270);
    expect(mod360(450)).toBe(90);
  });

  it('ecrireProgramme rend une boucle lisible', () => {
    expect(ecrireProgramme(polygone(6, 40))).toBe('RÉPÉTER 6 fois [ AVANCER de 40 ; TOURNER de 60° ]');
    expect(ecrireProgramme([])).toBe('programme vide');
  });

  it('premiereDifference pointe l’instruction où deux tracés divergent', () => {
    const bon = executer([avancer(50), tourner(90), avancer(50)]);
    const faux = executer([avancer(50), tourner(45), avancer(50)]);
    expect(premiereDifference(bon, faux)).toBe(1);
  });
});
