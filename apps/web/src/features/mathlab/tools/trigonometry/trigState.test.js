/**
 * Le document du مختبر المثلثات (§42, §43, §49).
 *
 * Ce qui se joue ici : qu'un document venu du serveur — ancien, tronqué,
 * bricolé — ne casse jamais l'instrument, et que l'état TRANSITOIRE (§43 :
 * l'animation, la question en cours) ne parte jamais en base.
 */

import { describe, it, expect } from 'vitest';
import {
  TRIGONOMETRY_SCHEMA_VERSION, createTrigonometryData, normalizeTrigonometryData,
  serializeTrigonometryData, setAngle, nudgeAngle, normalizeAngle, setRadius,
  setMode, setUnit, setValueMode, toggleLayer, setHighlight, setSymmetry,
  setCompare, setInverse, setTriangleValue, applyPreset,
  MIN_ANGLE, MAX_ANGLE, MIN_RADIUS, MAX_RADIUS, DEFAULT_ANGLE, LAYER_KEYS,
  DEFAULT_LAYERS,
} from './trigState.js';
import { PRESETS } from './presets.js';

describe('le document neuf (§46)', () => {
  const data = createTrigonometryData();

  it('ouvre sur le TRIANGLE — le sujet 4.2 du programme de 4AM', () => {
    expect(data.mode).toBe('triangle');
    expect(data.layers.triangle).toBe(true);
  });

  it('ouvre sur 30°, pas sur 0° : à 0° il n’y a rien à voir', () => {
    expect(data.angle).toBe(DEFAULT_ANGLE);
    expect(data.angle).toBe(30);
  });

  it('ouvre en valeurs exactes (§19)', () => {
    expect(data.valueMode).toBe('exact');
  });

  it('n’ouvre AUCUNE couche avancée (§30 : progressive disclosure)', () => {
    expect(data.layers.tangentLine).toBe(false);
    expect(data.layers.sineGraph).toBe(false);
    expect(data.layers.cosineGraph).toBe(false);
    expect(data.layers.specialMarkers).toBe(false);
    expect(data.layers.quadrant).toBe(false);
  });

  it('n’ouvre ni comparaison, ni réciproque, ni symétrie, ni entraînement', () => {
    expect(data.compare.enabled).toBe(false);
    expect(data.inverse).toBeNull();
    expect(data.symmetry).toBeNull();
    expect(data.practice.active).toBe(false);
  });

  it('le schéma est versionné', () => {
    expect(TRIGONOMETRY_SCHEMA_VERSION).toBe(1);
  });
});

describe('la relecture d’un document (la frontière avec le JSON)', () => {
  it('survit à n’importe quel data', () => {
    for (const raw of [null, undefined, 0, 'x', [], true, { angle: 'oui' }]) {
      const data = normalizeTrigonometryData(raw);
      expect(LAYER_KEYS.every((k) => typeof data.layers[k] === 'boolean')).toBe(true);
      expect(Number.isFinite(data.angle)).toBe(true);
    }
  });

  it('un aller-retour JSON ne change rien', () => {
    const data = createTrigonometryData();
    const restored = normalizeTrigonometryData(JSON.parse(JSON.stringify(serializeTrigonometryData(data))));
    expect(restored).toEqual(data);
  });

  it('borne un angle délirant plutôt que de le croire', () => {
    expect(normalizeTrigonometryData({ angle: 99999 }).angle).toBe(MAX_ANGLE);
    expect(normalizeTrigonometryData({ angle: -99999 }).angle).toBe(MIN_ANGLE);
    expect(normalizeTrigonometryData({ angle: Infinity }).angle).toBe(DEFAULT_ANGLE);
    expect(normalizeTrigonometryData({ angle: NaN }).angle).toBe(DEFAULT_ANGLE);
  });

  it('borne le rayon', () => {
    expect(normalizeTrigonometryData({ radius: 100 }).radius).toBe(MAX_RADIUS);
    expect(normalizeTrigonometryData({ radius: 0 }).radius).toBe(MIN_RADIUS);
    expect(normalizeTrigonometryData({ radius: -3 }).radius).toBe(MIN_RADIUS);
  });

  it('un angle de triangle reste AIGU quoi qu’on stocke', () => {
    expect(normalizeTrigonometryData({ triangle: { angle: 90 } }).triangle.angle).toBe(89);
    expect(normalizeTrigonometryData({ triangle: { angle: 150 } }).triangle.angle).toBe(89);
    expect(normalizeTrigonometryData({ triangle: { angle: 0 } }).triangle.angle).toBe(1);
  });

  it('refuse un mode, une unité, une configuration inconnus', () => {
    expect(normalizeTrigonometryData({ mode: 'hyperbolique' }).mode).toBe('triangle');
    expect(normalizeTrigonometryData({ unit: 'grades' }).unit).toBe('deg');
    expect(normalizeTrigonometryData({ valueMode: 'romain' }).valueMode).toBe('exact');
    expect(normalizeTrigonometryData({ triangle: { given: 'rien' } }).triangle.given).toBe('angle-hyp');
    expect(normalizeTrigonometryData({ symmetry: 'rien' }).symmetry).toBeNull();
    expect(normalizeTrigonometryData({ highlight: 'cot' }).highlight).toBeNull();
    expect(normalizeTrigonometryData({ preset: 'inexistant' }).preset).toBeNull();
  });

  it('une couche inconnue est ignorée, une couche manquante prend son défaut', () => {
    const data = normalizeTrigonometryData({ layers: { inventee: true, circle: false } });
    expect(data.layers.inventee).toBeUndefined();
    expect(data.layers.circle).toBe(false);
    expect(data.layers.axes).toBe(DEFAULT_LAYERS.axes);
  });

  it('borne la valeur réciproque selon le rapport (§24)', () => {
    expect(normalizeTrigonometryData({ inverse: { ratio: 'sin', value: 5 } }).inverse.value).toBe(1);
    expect(normalizeTrigonometryData({ inverse: { ratio: 'cos', value: -9 } }).inverse.value).toBe(-1);
    // arctan vit sur tout ℝ : sa borne est plus large.
    expect(normalizeTrigonometryData({ inverse: { ratio: 'tan', value: 15 } }).inverse.value).toBe(15);
    expect(normalizeTrigonometryData({ inverse: { ratio: 'sec', value: 1 } }).inverse).toBeNull();
  });

  it('lit une virgule décimale comme un nombre', () => {
    expect(normalizeTrigonometryData({ angle: '33,5' }).angle).toBe(33.5);
  });
});

describe('ce qui part au serveur, et ce qui n’y va pas (§43)', () => {
  it('la question en cours n’est JAMAIS sérialisée', () => {
    const data = {
      ...createTrigonometryData(),
      practice: {
        active: true, challenge: { kind: 'ratioValue', expected: 0.5 }, phase: 'reveal',
        answer: '1/2', attempts: 3, hintsUsed: 2, solved: 4, seen: 7,
      },
    };
    const stored = serializeTrigonometryData(data);
    expect(stored.practice).toEqual({ solved: 4, seen: 7 });
    expect(stored.practice.challenge).toBeUndefined();
    expect(stored.practice.active).toBeUndefined();
  });

  it('un document rouvert ne relance pas une question (§25)', () => {
    const restored = normalizeTrigonometryData({ practice: { active: true, solved: 3, seen: 5 } });
    expect(restored.practice.active).toBe(false);
    expect(restored.practice.challenge).toBeNull();
    expect(restored.practice.solved).toBe(3);
  });

  it('aucun champ d’animation n’existe — §43 est tenu par construction', () => {
    const stored = serializeTrigonometryData(createTrigonometryData());
    expect(Object.keys(stored)).not.toContain('animation');
    expect(Object.keys(stored)).not.toContain('playing');
    expect(JSON.stringify(stored)).not.toMatch(/playing|speed|frame/);
  });

  it('le document reste minuscule — très loin des 8 Ko accordés', () => {
    const worst = {
      ...createTrigonometryData(),
      compare: { enabled: true, angle: 1080 },
      inverse: { ratio: 'tan', value: 19.9999 },
      symmetry: 'supplement',
      highlight: 'tan',
      preset: 'identity',
      practice: { active: true, challenge: null, phase: 'predict', answer: '', attempts: 0, hintsUsed: 0, solved: 99999, seen: 99999 },
      layers: Object.fromEntries(LAYER_KEYS.map((k) => [k, true])),
    };
    const bytes = new TextEncoder().encode(JSON.stringify(serializeTrigonometryData(worst))).length;
    expect(bytes).toBeLessThan(8000);
  });

  it('les nombres sont arrondis : pas de 0,30000000000000004 en base', () => {
    const data = setAngle(createTrigonometryData(), 0.1 + 0.2);
    expect(serializeTrigonometryData(data).angle).toBe(0.3);
  });
});

describe('les transitions', () => {
  const base = createTrigonometryData();

  it('poser l’angle, borné', () => {
    expect(setAngle(base, 45).angle).toBe(45);
    expect(setAngle(base, 5000).angle).toBe(MAX_ANGLE);
    expect(setAngle(base, -5000).angle).toBe(MIN_ANGLE);
  });

  it('un angle inchangé rend le MÊME objet (pas de rendu inutile, §41)', () => {
    expect(setAngle(base, base.angle)).toBe(base);
    // Normaliser un angle DÉJÀ normalisé ne fabrique pas un nouvel objet.
    const at45 = setAngle(base, 45);
    expect(normalizeAngle(at45)).toBe(at45);
  });

  it('avancer par pas NE normalise PAS — c’est ainsi qu’on franchit 360° (§14)', () => {
    let data = setAngle(base, 350);
    data = nudgeAngle(data, 15);
    expect(data.angle).toBe(365);
    expect(data.angle).not.toBe(5);
  });

  it('les pas de §4 : ±1°, ±5°, ±15°', () => {
    expect(nudgeAngle(setAngle(base, 30), 1).angle).toBe(31);
    expect(nudgeAngle(setAngle(base, 30), -5).angle).toBe(25);
    expect(nudgeAngle(setAngle(base, 30), 15).angle).toBe(45);
  });

  it('normaliser ramène 450° à 90° (§15)', () => {
    expect(normalizeAngle(setAngle(base, 450)).angle).toBe(90);
    expect(normalizeAngle(setAngle(base, -90)).angle).toBe(270);
  });

  it('passer au triangle allume sa couche', () => {
    const circle = setMode(base, 'circle');
    const back = setMode(toggleLayer(circle, 'triangle'), 'triangle');
    expect(back.layers.triangle).toBe(true);
  });

  it('un mode inconnu ne change rien', () => {
    expect(setMode(base, 'rien')).toBe(base);
    expect(setUnit(base, 'grades')).toBe(base);
    expect(setValueMode(base, 'romain')).toBe(base);
  });

  it('une couche bascule, et une couche inconnue est ignorée', () => {
    expect(toggleLayer(base, 'sineGraph').layers.sineGraph).toBe(true);
    expect(toggleLayer(base, 'inventee')).toBe(base);
  });

  it('le rapport mis en avant se rappelle pour s’éteindre (§10)', () => {
    const on = setHighlight(base, 'sin');
    expect(on.highlight).toBe('sin');
    expect(setHighlight(on, 'sin').highlight).toBeNull();
    expect(setHighlight(on, 'cos').highlight).toBe('cos');
  });

  it('la symétrie de même (§21)', () => {
    const on = setSymmetry(base, 'negate');
    expect(on.symmetry).toBe('negate');
    expect(setSymmetry(on, 'negate').symmetry).toBeNull();
  });

  it('la comparaison à deux angles (§33)', () => {
    const data = setCompare(base, { enabled: true, angle: 150 });
    expect(data.compare).toEqual({ enabled: true, angle: 150 });
    expect(setCompare(data, { angle: 99999 }).compare.angle).toBe(MAX_ANGLE);
  });

  it('la réciproque s’ouvre et se ferme (§24)', () => {
    const data = setInverse(base, 'sin', 0.5);
    expect(data.inverse).toEqual({ ratio: 'sin', value: 0.5 });
    expect(setInverse(data, null).inverse).toBeNull();
    expect(setInverse(base, 'sin', 3).inverse.value).toBe(1);
    expect(setInverse(base, 'sec', 1)).toBe(base);
  });

  it('les données du triangle sont bornées chacune selon sa nature (§9)', () => {
    expect(setTriangleValue(base, 'angle', 95).triangle.angle).toBe(89);
    expect(setTriangleValue(base, 'hypotenuse', 0).triangle.hypotenuse).toBe(0.5);
    expect(setTriangleValue(base, 'opposite', 1000).triangle.opposite).toBe(100);
    expect(setTriangleValue(base, 'given', 'opp-adj').triangle.given).toBe('opp-adj');
    expect(setTriangleValue(base, 'inconnu', 5)).toBe(base);
  });

  it('le rayon est borné (§17)', () => {
    expect(setRadius(base, 3).radius).toBe(3);
    expect(setRadius(base, 99).radius).toBe(MAX_RADIUS);
  });
});

describe('les préréglages CONFIGURENT, ils ne remplacent pas (§27)', () => {
  it('chacun s’applique et se nomme', () => {
    for (const preset of PRESETS) {
      const data = applyPreset(createTrigonometryData(), preset.id);
      expect(data.preset, preset.id).toBe(preset.id);
      expect(LAYER_KEYS.every((k) => typeof data.layers[k] === 'boolean'), preset.id).toBe(true);
    }
  });

  it('l’ANGLE de l’élève survit à un préréglage — on ne lui reprend pas son travail', () => {
    const data = applyPreset(setAngle(createTrigonometryData(), 123), 'unitCircle');
    expect(data.angle).toBe(123);
  });

  it('tous gardent le repère allumé', () => {
    for (const preset of PRESETS) {
      const data = applyPreset(createTrigonometryData(), preset.id);
      expect(data.layers.axes, preset.id).toBe(true);
      expect(data.layers.values, preset.id).toBe(true);
    }
  });

  it('le préréglage « sine wave » allume le graphe du sinus et pas celui du cosinus', () => {
    const data = applyPreset(createTrigonometryData(), 'sineWave');
    expect(data.layers.sineGraph).toBe(true);
    expect(data.layers.cosineGraph).toBe(false);
  });

  it('un préréglage inconnu ne change rien', () => {
    const base = createTrigonometryData();
    expect(applyPreset(base, 'inexistant')).toBe(base);
  });

  it('un préréglage survit à l’aller-retour de stockage', () => {
    const data = applyPreset(createTrigonometryData(), 'tangent');
    const restored = normalizeTrigonometryData(serializeTrigonometryData(data));
    expect(restored.preset).toBe('tangent');
    expect(restored.layers.tangentLine).toBe(true);
  });
});

describe('l’amorce d’une leçon (openMathLab.js)', () => {
  it('accepte un angle, un mode, un rayon', () => {
    const data = createTrigonometryData({ mode: 'circle', angle: 60, radius: 2, unit: 'rad' });
    expect(data).toMatchObject({ mode: 'circle', angle: 60, radius: 2, unit: 'rad' });
  });

  it('accepte un triangle tout posé', () => {
    const data = createTrigonometryData({ mode: 'triangle', triangle: { given: 'opp-hyp', opposite: 3, hypotenuse: 5 } });
    expect(data.triangle).toMatchObject({ given: 'opp-hyp', opposite: 3, hypotenuse: 5 });
  });

  it('accepte un préréglage nommé', () => {
    const data = createTrigonometryData({ preset: 'sohcahtoa' });
    expect(data.preset).toBe('sohcahtoa');
    expect(data.highlight).toBe('sin');
  });

  it('une amorce illisible retombe sur le document par défaut', () => {
    for (const seed of [null, 'x', 42, [], { angle: 'oui', mode: 'rien' }]) {
      const data = createTrigonometryData(seed);
      expect(Number.isFinite(data.angle)).toBe(true);
      expect(['circle', 'triangle']).toContain(data.mode);
    }
  });

  it('une amorce hors bornes est bornée, pas refusée', () => {
    expect(createTrigonometryData({ angle: 99999 }).angle).toBe(MAX_ANGLE);
  });
});
