import { describe, it, expect } from 'vitest';
import {
  SCALE_STEPS, DEFAULT_SCALE, MIN_FIT_FACTOR, FIT_EPSILON,
  clampScale, stepScale, scalePercent, availableArea, nextFitFactor, effectiveScale,
} from './classroomFit';

/**
 * Ce que ces tests verrouillent : l'échelle de présentation est bornée à des
 * paliers connus, la zone offerte ne compte jamais la barre d'outils, et la
 * boucle d'ajustement RÉDUIT quand ça déborde, REGRANDIT quand il y a de la
 * place, et S'ARRÊTE (pas d'oscillation) — sur les tailles d'écran visées :
 * 1920×1080, 1366×768, 1440×900, 1024×768, 768×1024, 390×844.
 */
describe('échelle utilisateur — les paliers 90 · 100 · 110 · 125', () => {
  it('est bornée à un palier connu, le plus proche', () => {
    expect(clampScale(1)).toBe(1);
    expect(clampScale(1.07)).toBe(1.1);
    expect(clampScale(2)).toBe(1.25);
    expect(clampScale(0.1)).toBe(0.9);
    expect(clampScale('abc')).toBe(DEFAULT_SCALE);
    expect(clampScale(undefined)).toBe(DEFAULT_SCALE);
  });

  it('+ et − parcourent les paliers sans en sortir', () => {
    expect(stepScale(1, +1)).toBe(1.1);
    expect(stepScale(1.1, +1)).toBe(1.25);
    expect(stepScale(1.25, +1)).toBe(1.25);
    expect(stepScale(1, -1)).toBe(0.9);
    expect(stepScale(0.9, -1)).toBe(0.9);
    expect(SCALE_STEPS[0]).toBeLessThan(SCALE_STEPS[SCALE_STEPS.length - 1]);
  });

  it('s’affiche en pourcentage entier', () => {
    expect(scalePercent(1.1)).toBe(110);
    expect(scalePercent(0.9)).toBe(90);
    expect(scalePercent(1.25)).toBe(125);
  });
});

describe('zone disponible — la barre d’outils n’est jamais comptée', () => {
  it('soustrait barre d’outils, navigation et marges', () => {
    expect(availableArea({ width: 1366, height: 768, toolbarHeight: 56, paddingX: 32, paddingY: 24 }))
      .toEqual({ width: 1334, height: 688 });
    expect(availableArea({ width: 1920, height: 1080, toolbarHeight: 56, navHeight: 64 }))
      .toEqual({ width: 1920, height: 960 });
  });

  it('ne devient jamais négative sur un très petit écran', () => {
    const a = availableArea({ width: 390, height: 300, toolbarHeight: 200, navHeight: 200 });
    expect(a.width).toBe(390);
    expect(a.height).toBe(0);
  });
});

describe('facteur d’ajustement — réduire, regrandir, s’arrêter', () => {
  const avail = { width: 1334, height: 688 };

  it('réduit quand le contenu déborde en hauteur (projecteur 1366×768, 42 rayons)', () => {
    const next = nextFitFactor({ current: 1, needed: { width: 1300, height: 1100 }, available: avail });
    expect(next).toBeLessThan(1);
    expect(next).toBeGreaterThanOrEqual(MIN_FIT_FACTOR);
    // Le rapport 688/1100 ≈ 0.625, moins la marge d'arrondi.
    expect(next).toBeCloseTo(0.625 * 0.98, 2);
  });

  it('réduit selon le PLUS GRAND débordement (largeur sur tablette portrait)', () => {
    const next = nextFitFactor({ current: 1, needed: { width: 1000, height: 500 }, available: { width: 736, height: 900 } });
    expect(next).toBeCloseTo((736 / 1000) * 0.98, 2);
  });

  it('ne descend jamais sous le plancher de lisibilité', () => {
    const next = nextFitFactor({ current: 1, needed: { width: 1000, height: 5000 }, available: avail });
    expect(next).toBe(MIN_FIT_FACTOR);
  });

  it('ne change rien quand le contenu tient déjà à 100 %', () => {
    expect(nextFitFactor({ current: 1, needed: { width: 1200, height: 600 }, available: avail })).toBe(1);
  });

  it('regrandit quand la place revient, sans dépasser 1', () => {
    const grown = nextFitFactor({ current: 0.6, needed: { width: 800, height: 400 }, available: avail });
    expect(grown).toBeGreaterThan(0.6);
    expect(grown).toBeLessThanOrEqual(1);
    expect(nextFitFactor({ current: 0.95, needed: { width: 100, height: 100 }, available: avail })).toBe(1);
  });

  it('ne regrandit PAS pour une marge minuscule (pas de vibration)', () => {
    expect(nextFitFactor({ current: 0.8, needed: { width: 1300, height: 670 }, available: avail })).toBe(0.8);
  });

  it('converge : la boucle réduire → mesurer s’arrête en quelques tours', () => {
    // Modèle : le contenu suit l'échelle linéairement.
    const settle = (base) => {
      let f = 1;
      let rounds = 0;
      for (; rounds < 10; rounds += 1) {
        const needed = { width: base.width * f, height: base.height * f };
        const next = nextFitFactor({ current: f, needed, available: avail });
        if (next === f) break;
        f = next;
      }
      return { f, rounds };
    };
    // 16 rayons de 26 : ça tient une fois réduit.
    const a = settle({ width: 1300, height: 1100 });
    expect(a.rounds).toBeLessThan(5);
    expect(1100 * a.f).toBeLessThanOrEqual(avail.height);
    expect(a.f).toBeGreaterThanOrEqual(MIN_FIT_FACTOR);
    // 42 rayons de 10 : trop haut même au plancher — on s'arrête AU plancher
    // (le reste défile dans sa zone), sans tourner indéfiniment.
    const b = settle({ width: 1300, height: 1400 });
    expect(b.rounds).toBeLessThan(5);
    expect(b.f).toBe(MIN_FIT_FACTOR);
  });

  it('ignore une mesure vide ou absurde', () => {
    expect(nextFitFactor({ current: 0.7, needed: null, available: avail })).toBe(0.7);
    expect(nextFitFactor({ current: 0.7, needed: { width: 0, height: 0 }, available: avail })).toBe(0.7);
    expect(nextFitFactor({ current: 0.7, needed: { width: 10, height: 10 }, available: { width: 0, height: 0 } })).toBe(0.7);
    expect(nextFitFactor({ current: NaN, needed: { width: 10, height: 10 }, available: avail })).toBe(1);
  });

  it('un débordement même minuscule est corrigé (sinon une barre de défilement apparaît)', () => {
    const needed = { width: 1334 * (1 + FIT_EPSILON / 4), height: 100 };
    const next = nextFitFactor({ current: 1, needed, available: avail });
    expect(next).toBeLessThan(1);
    expect(next).toBeGreaterThan(0.95);
  });

  it('une marge sous le seuil de regrandissement ne déclenche pas de rendu', () => {
    // 3 % de marge : sous GROW_SLACK, on reste où l'on est.
    const needed = { width: 1334 / 1.03, height: 688 / 1.03 };
    expect(nextFitFactor({ current: 0.9, needed, available: avail })).toBe(0.9);
  });
});

describe('échelle effective — ce que lit la CSS', () => {
  it('multiplie le palier choisi par le facteur d’ajustement', () => {
    expect(effectiveScale(1.25, 1)).toBe(1.25);
    expect(effectiveScale(1.25, 0.8)).toBe(1);
    expect(effectiveScale(1, 0.55)).toBe(0.55);
  });

  it('borne le facteur d’ajustement à [plancher, 1]', () => {
    expect(effectiveScale(1, 1.4)).toBe(1);
    expect(effectiveScale(1, 0.1)).toBe(MIN_FIT_FACTOR);
    expect(effectiveScale(1, NaN)).toBe(1);
  });
});
