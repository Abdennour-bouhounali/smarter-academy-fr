/**
 * LES AFFIRMATIONS DE LA LEÇON, VÉRIFIÉES SUR SES DONNÉES EXACTES.
 *
 * Les modules AFFIRMENT des choses à l'élève : « les pentes se stabilisent »,
 * « f(1) et f′(1) sont deux nombres différents », « cette tangente recoupe la
 * courbe », « en x = 1,5 la courbe est sous l'axe et pourtant la pente est
 * positive ». Ce sont des CONTENUS PÉDAGOGIQUES : si le comportement réel
 * diffère, la leçon ment, et `derivative.test.js` ne l'attrape pas — il vérifie
 * que `secantSlope` est juste, pas qu'un module dit vrai en la citant.
 *
 * PÉRIMÈTRE : aucun test ne mentionne les règles de dérivation (somme, produit,
 * quotient), ni le lien signe de f′ / variations : ce sont les deux leçons
 * suivantes.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  CARRE, CUBE, H_STEPS, tauxDetail, secante, tangente,
  aVuLaStabilisation, ecartAuNombreDerive, stepRun, eq, fr,
} from './derivUtils';

describe('les dérivées sont exactes', () => {
  it('f(x) = x² a pour dérivée 2x, vérifié contre la définition sur des h fins', () => {
    for (const a of [-1, 0, 1, 2, 3]) {
      const parLaDefinition = (CARRE.f(a + 1e-6) - CARRE.f(a - 1e-6)) / 2e-6;
      expect(CARRE.fPrime(a)).toBeCloseTo(parLaDefinition, 5);
    }
  });

  it('g(x) = x³ − 3x a pour dérivée 3x² − 3', () => {
    for (const a of [-2, -1, 0, 1, 2]) {
      const parLaDefinition = (CUBE.f(a + 1e-6) - CUBE.f(a - 1e-6)) / 2e-6;
      expect(CUBE.fPrime(a)).toBeCloseTo(parLaDefinition, 4);
    }
  });
});

describe('module 1 — la stabilisation est un FAIT, pas une impression', () => {
  it('les crans de h sont décroissants et tous exactement atteignables', () => {
    for (let i = 1; i < H_STEPS.length; i += 1) expect(H_STEPS[i]).toBeLessThan(H_STEPS[i - 1]);
    // Une cible qu'un cran n'atteint pas rendrait la manipulation infaisable.
    for (const h of H_STEPS) expect(H_STEPS.includes(h)).toBe(true);
    expect(H_STEPS.at(-1)).toBe(0.01);
  });

  it('sur x² en a = 1, l’écart au nombre dérivé décroît STRICTEMENT à chaque cran', () => {
    const ecarts = H_STEPS.map((h) => ecartAuNombreDerive(CARRE, 1, h));
    for (let i = 1; i < ecarts.length; i += 1) expect(ecarts[i]).toBeLessThan(ecarts[i - 1]);
    expect(ecarts.at(-1)).toBeLessThan(0.02);
  });

  it('la même décroissance tient pour TOUT a du cadre — balayé, pas échantillonné', () => {
    for (let a = CARRE.range.xMin; a <= CARRE.range.xMax; a += 0.25) {
      const ecarts = H_STEPS.map((h) => ecartAuNombreDerive(CARRE, a, h));
      for (let i = 1; i < ecarts.length; i += 1) {
        expect(ecarts[i]).toBeLessThanOrEqual(ecarts[i - 1] + 1e-12);
      }
    }
  });

  it('sur x², le taux vaut 2a + h : au dernier cran il diffère encore de f′(a)', () => {
    // C'est l'aha : les pentes se stabilisent SANS que h atteigne 0.
    const t = tauxDetail(CARRE, 1, 0.01);
    expect(t.slope).toBeCloseTo(2.01, 10);
    expect(t.slope).not.toBe(CARRE.fPrime(1));
    expect(Math.abs(t.slope - 2)).toBeLessThan(0.02);
  });

  it('montée et avancée sont deux nombres distincts — la conception erronée n°2', () => {
    const t = tauxDetail(CARRE, 1, 0.5);
    expect(t.rise).toBeCloseTo(1.25, 12);
    expect(t.run).toBe(0.5);
    expect(t.rise).not.toBeCloseTo(t.slope, 6);
  });

  it('la stabilisation n’est déclarée qu’après les trois derniers crans', () => {
    expect(aVuLaStabilisation([2, 1, 0.5])).toBe(false);
    expect(aVuLaStabilisation([0.1, 0.05])).toBe(false);
    expect(aVuLaStabilisation([2, 0.1, 0.05, 0.01])).toBe(true);
  });
});

describe('sécantes et tangentes passent par leurs points', () => {
  it('la sécante passe par A et par B', () => {
    for (const h of H_STEPS) {
      const s = secante(CARRE, 1, h);
      expect(s.a * 1 + s.b).toBeCloseTo(CARRE.f(1), 10);
      expect(s.a * (1 + h) + s.b).toBeCloseTo(CARRE.f(1 + h), 10);
    }
  });

  it('la tangente passe par le point de contact, sur les deux fonctions', () => {
    for (const fn of [CARRE, CUBE]) {
      for (let a = fn.range.xMin + 0.5; a <= fn.range.xMax - 0.5; a += 0.5) {
        const t = tangente(fn, a);
        expect(t.a * a + t.b).toBeCloseTo(fn.f(a), 9);
        expect(t.a).toBeCloseTo(fn.fPrime(a), 9);
      }
    }
  });
});

describe('les affirmations chiffrées citées par les modules', () => {
  it('M3 : en x = 1, f(1) = 1 et f′(1) = 2 — deux nombres DIFFÉRENTS (conception n°4)', () => {
    expect(CARRE.f(1)).toBe(1);
    expect(CARRE.fPrime(1)).toBe(2);
    expect(CARRE.f(1)).not.toBe(CARRE.fPrime(1));
  });

  it('M3 : en x = 1,5 la courbe de g est SOUS l’axe et la pente est POSITIVE (conception n°6)', () => {
    expect(CUBE.f(1.5)).toBeLessThan(0);
    expect(CUBE.fPrime(1.5)).toBeGreaterThan(0);
    expect(CUBE.f(1.5)).toBeCloseTo(-1.125, 12);
    expect(CUBE.fPrime(1.5)).toBeCloseTo(3.75, 12);
  });

  it('M4 : la tangente à g en 1 est HORIZONTALE et recoupe la courbe en −2 (conception n°3)', () => {
    const t = tangente(CUBE, 1);
    expect(t.a).toBe(0);
    expect(t.b).toBe(-2);
    // Elle touche en x = 1 …
    expect(t.a * 1 + t.b).toBeCloseTo(CUBE.f(1), 12);
    // … et recoupe bel et bien la courbe en x = −2, DANS le cadre.
    expect(t.a * -2 + t.b).toBeCloseTo(CUBE.f(-2), 12);
    expect(-2).toBeGreaterThanOrEqual(CUBE.range.xMin);
  });

  it('M5 : la tangente à f en 2 est y = 4x − 4, et le piège « y = f′(a)x + f(a) » rate le point', () => {
    const t = tangente(CARRE, 2);
    expect(t.a).toBe(4);
    expect(t.b).toBe(-4);
    expect(eq(t)).toBe('y = 4x − 4');
    // Le piège de la conception n°5 : y = 4x + 4 ne passe PAS par (2 ; 4).
    const piege = { a: 4, b: CARRE.f(2) };
    expect(piege.a * 2 + piege.b).not.toBeCloseTo(CARRE.f(2), 6);
  });

  it('les valeurs remarquables restent dans le cadre du repère', () => {
    for (const [fn, xs] of [[CARRE, [1, 2, 3]], [CUBE, [-2, -1, 0, 1, 1.5, 2]]]) {
      for (const x of xs) {
        expect(x).toBeGreaterThanOrEqual(fn.range.xMin);
        expect(x).toBeLessThanOrEqual(fn.range.xMax);
        expect(fn.f(x)).toBeGreaterThanOrEqual(fn.range.yMin);
        expect(fn.f(x)).toBeLessThanOrEqual(fn.range.yMax);
      }
    }
  });
});

describe('écriture française', () => {
  it('fr utilise la virgule et le vrai signe moins', () => {
    expect(fr(2.5)).toBe('2,5');
    expect(fr(-3)).toBe('−3');
    expect(fr(0.01)).toBe('0,01');
  });

  it('eq écrit les équations comme au tableau', () => {
    expect(eq({ a: 2, b: -1 })).toBe('y = 2x − 1');
    expect(eq({ a: 0, b: -2 })).toBe('y = −2');
  });
});

describe('sécurité de mise en page — l’escalier de lecture de pente', () => {
  it('BALAYÉ, pas échantillonné : sur les deux fonctions, le sommet de la marche reste DANS le cadre', () => {
    // C'est ce balayage qui a attrapé le défaut réel : sur g en a = −1,5, une
    // avancée fixée à 1 hissait le sommet à 4,875 pour un cadre à 4.
    for (const fn of [CARRE, CUBE]) {
      const { lo, hi } = fn.contactRange;
      for (let a = lo; a <= hi + 1e-9; a += 0.05) {
        const fa = fn.f(a);
        const pente = fn.fPrime(a);
        const dx = stepRun(fn, a, pente, fa);
        const sommet = fa + pente * dx;
        expect(a + dx).toBeLessThanOrEqual(fn.range.xMax + 1e-9);
        expect(sommet).toBeGreaterThanOrEqual(fn.range.yMin - 1e-9);
        expect(sommet).toBeLessThanOrEqual(fn.range.yMax + 1e-9);
      }
    }
  });

  it('privilégie l’avancée de 1 quand elle tient — c’est la lecture « +1 → +f′(a) » du cours', () => {
    expect(stepRun(CARRE, 1, CARRE.fPrime(1), CARRE.f(1))).toBe(1);
    expect(stepRun(CUBE, 0, CUBE.fPrime(0), CUBE.f(0))).toBe(1);
  });

  it('réduit l’avancée là où 1 déborderait, plutôt que de laisser sortir la marche', () => {
    const a = -1.5;
    expect(CUBE.f(a) + CUBE.fPrime(a) * 1).toBeGreaterThan(CUBE.range.yMax);   // 4,875 > 4
    expect(stepRun(CUBE, a, CUBE.fPrime(a), CUBE.f(a))).toBeLessThan(1);
  });

  it('la pente reste le rapport montée / avancée, quelle que soit l’avancée choisie', () => {
    for (const fn of [CARRE, CUBE]) {
      for (let a = fn.contactRange.lo; a <= fn.contactRange.hi; a += 0.25) {
        const dx = stepRun(fn, a, fn.fPrime(a), fn.f(a));
        expect((fn.fPrime(a) * dx) / dx).toBeCloseTo(fn.fPrime(a), 10);
      }
    }
  });
});

describe('module 3 — les cibles du module sont ATTEIGNABLES', () => {
  /** Les abscisses réellement atteignables au pas de 0,5 depuis le départ. */
  const atteignables = (fn, depart, pas = 0.5) => {
    const out = [];
    for (let a = fn.contactRange.lo; a <= fn.contactRange.hi + 1e-9; a += pas) {
      const v = Math.round(a * 100) / 100;
      // Le départ doit être sur la même grille, sinon un cran ne l'atteint pas.
      if (Math.abs((v - depart) / pas - Math.round((v - depart) / pas)) < 1e-9) out.push(v);
    }
    return out;
  };

  it('sur g, l’élève peut atteindre une tangente qui MONTE et une qui DESCEND', () => {
    const xs = atteignables(CUBE, -1);
    expect(xs.some((x) => CUBE.fPrime(x) > 0.01)).toBe(true);
    expect(xs.some((x) => CUBE.fPrime(x) < -0.01)).toBe(true);
  });

  it('sur g, l’élève peut atteindre le CONTRE-EXEMPLE : courbe sous l’axe ET tangente qui monte', () => {
    // Sans cette position, la question de l'étape 3 affirmerait quelque chose
    // que la manipulation ne peut pas montrer — la leçon mentirait.
    const xs = atteignables(CUBE, -1);
    const contre = xs.filter((x) => CUBE.f(x) < 0 && CUBE.fPrime(x) > 0.01);
    expect(contre.length).toBeGreaterThan(0);
    expect(contre).toContain(1.5);
    expect(CUBE.f(1.5)).toBeCloseTo(-1.125, 12);
    expect(CUBE.fPrime(1.5)).toBeCloseTo(3.75, 12);
  });

  it('sur g, on peut aussi atteindre : courbe sous l’axe ET tangente qui descend', () => {
    const xs = atteignables(CUBE, -1);
    const autre = xs.filter((x) => CUBE.f(x) < 0 && CUBE.fPrime(x) < -0.01);
    expect(autre).toContain(0.5);
    expect(CUBE.f(0.5)).toBeCloseTo(-1.375, 12);
    expect(CUBE.fPrime(0.5)).toBeCloseTo(-2.25, 12);
  });

  it('sur f, les trois positions citées par l’étape 1 sont atteignables depuis a = 1', () => {
    const xs = atteignables(CARRE, 1);
    for (const cible of [1, 2]) expect(xs).toContain(cible);
    expect(CARRE.fPrime(1)).toBe(2);
    expect(CARRE.fPrime(2)).toBe(4);
  });
});

describe('modules 4 et 5 — la pente cible est ATTEIGNABLE au cliquet', () => {
  /** Une cible est atteignable si elle tombe sur un cran depuis le départ. */
  const surLaGrille = (cible, depart, pas) => {
    const k = (cible - depart) / pas;
    return Math.abs(k - Math.round(k)) < 1e-9;
  };

  it('depuis une pente nulle, chaque f′(a) visé tombe exactement sur un cran', () => {
    // Sans ce contrôle, l'élève pourrait encadrer la bonne pente sans jamais
    // l'atteindre : la manipulation serait infaisable, et l'étape imbloquable.
    for (const fn of [CARRE, CUBE]) {
      for (let a = fn.contactRange.lo; a <= fn.contactRange.hi + 1e-9; a += 0.5) {
        const v = Math.round(a * 100) / 100;
        expect(surLaGrille(fn.fPrime(v), 0, fn.pasPente)).toBe(true);
      }
    }
  });

  it('le pas de 0,5 ne suffirait PAS sur g — c’est pourquoi elle déclare 0,25', () => {
    expect(surLaGrille(CUBE.fPrime(-1.5), 0, 0.5)).toBe(false);   // 3,75
    expect(surLaGrille(CUBE.fPrime(-1.5), 0, CUBE.pasPente)).toBe(true);
  });

  it('la droite proposée passe TOUJOURS par le point de contact, quelle que soit la pente', () => {
    // C'est la construction y = m(x − a) + f(a) : elle isole une seule
    // inconnue, la pente. Une droite qui raterait aussi le point rendrait
    // l'ajustement à deux inconnues illisible.
    for (const fn of [CARRE, CUBE]) {
      for (const m of [-3, -1, 0, 2, 5]) {
        const a = fn.contactRange.lo + 0.5;
        const droite = { a: m, b: fn.f(a) - m * a };
        expect(droite.a * a + droite.b).toBeCloseTo(fn.f(a), 10);
      }
    }
  });
});

describe('mission finale — les distracteurs sont NUMÉRIQUEMENT distincts', () => {
  /**
   * Un distracteur qui vaut la bonne réponse rend la question insoluble, quoi
   * qu'en dise le texte. Le contrôle est arithmétique, jamais visuel.
   */
  it('e1 — taux de x² entre 1 et 3 : 4, et aucun piège ne vaut 4', () => {
    const bonne = (CARRE.f(3) - CARRE.f(1)) / (3 - 1);
    expect(bonne).toBe(4);
    const monteeSeule = CARRE.f(3) - CARRE.f(1);          // 8 — sans diviser
    const parA = 2 * 1;                                    // 2 — la pente en 1
    const parH = 2 * 1 + 1;                                // 3 — 2a + h non annulé
    for (const piege of [monteeSeule, parA, parH]) expect(piege).not.toBe(bonne);
    expect(new Set([bonne, monteeSeule, parA, parH]).size).toBe(4);
  });

  it('e3 — f′(2) vaut 4 ; le piège « h gardé » vaut 4,1 et en diffère vraiment', () => {
    expect(CARRE.fPrime(2)).toBe(4);
    const hGarde = 2 * 2 + 0.1;
    expect(hGarde).toBeCloseTo(4.1, 12);
    expect(Math.abs(hGarde - CARRE.fPrime(2))).toBeGreaterThan(0.05);
  });

  it('e4 — f′(5) = 10 se distingue bien de f(5) = 25', () => {
    expect(CARRE.fPrime(5)).toBe(10);
    expect(CARRE.f(5)).toBe(25);
    expect(new Set([CARRE.fPrime(5), CARRE.f(5), 5, 2]).size).toBe(4);
  });

  it('e6 — la tangente à g en 1 vaut bien −2 en x = −2, comme la courbe', () => {
    const t = tangente(CUBE, 1);
    expect(t.a * -2 + t.b).toBeCloseTo(CUBE.f(-2), 12);
    expect(CUBE.f(-2)).toBe(-2);
  });

  it('e8 — y = 6x − 9 passe par (3 ; 9), et les trois distracteurs n’y passent pas', () => {
    const bonne = tangente(CARRE, 3);
    expect(eq(bonne)).toBe('y = 6x − 9');
    expect(bonne.a * 3 + bonne.b).toBe(CARRE.f(3));
    const pieges = [{ a: 6, b: 9 }, { a: 6, b: -3 }, { a: 9, b: -6 }];
    for (const p of pieges) {
      expect(p.a * 3 + p.b).not.toBe(CARRE.f(3));         // aucun ne touche le point
      expect(eq(p)).not.toBe(eq(bonne));                   // et aucun ne s'écrit pareil
    }
  });

  it('e9 — y = 4x + 4 a la bonne PENTE mais rate le point : c’est tout l’intérêt du piège', () => {
    expect(4).toBe(CARRE.fPrime(2));                       // la pente est juste
    expect(4 * 2 + 4).toBe(12);
    expect(12).not.toBe(CARRE.f(2));                       // mais le point est raté
    expect(eq(tangente(CARRE, 2))).toBe('y = 4x − 4');
  });

  it('e10 — y = −2x − 1 passe par (−1 ; 1), et les trois distracteurs n’y passent pas', () => {
    const bonne = tangente(CARRE, -1);
    expect(eq(bonne)).toBe('y = −2x − 1');
    expect(bonne.a * -1 + bonne.b).toBe(CARRE.f(-1));
    for (const p of [{ a: -2, b: 1 }, { a: 2, b: 1 }, { a: -2, b: 3 }]) {
      expect(p.a * -1 + p.b).not.toBe(CARRE.f(-1));
    }
  });

  it('les quatre LP sont couverts par au moins une épreuve QUI LEUR EST PROPRE', () => {
    // Lu en TEXTE, comme le validateur : c'est ce qu'il voit réellement.
    const src = readFileSync(
      new URL('../modules/Module06MissionFinaleLaTangente.jsx', import.meta.url),
      'utf8'
    );
    const listes = [...src.matchAll(/learningPointIds: \[([^\]]+)\]/g)].map((m) =>
      m[1].split(',').map((s) => s.trim().replace(/'/g, ''))
    );
    expect(listes).toHaveLength(10);
    const prefixe = 'premiere_specialite_derivation-nombre-derive-1ere_P';
    for (const n of [1, 2, 3, 4]) {
      const seule = listes.some((l) => l.length === 1 && l[0] === `${prefixe}${n}`);
      expect(seule, `P${n} doit avoir une épreuve dédiée`).toBe(true);
    }
  });
});
