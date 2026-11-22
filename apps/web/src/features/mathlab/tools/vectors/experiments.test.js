import { describe, it, expect } from 'vitest';
import { EXPERIMENTS, getExperiment } from './experiments.js';
import { resolveScene } from './vectorScene.js';
import { normalizeScene } from './vectorState.js';

/**
 * Chaque expérience (§27) doit s'ouvrir sur une scène VIVANTE : tout résolu,
 * rien d'orphelin, et au moins un objet à tirer. Une expérience qui ouvre sur
 * un plan cassé est pire que pas d'expérience.
 */
describe('les expériences (§27)', () => {
  it('ont des identifiants uniques et des clés i18n bien formées', () => {
    const ids = EXPERIMENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const experiment of EXPERIMENTS) {
      expect(experiment.labelKey).toMatch(/^tools\.vectors\.experiments\.\w+$/);
      expect(typeof experiment.build).toBe('function');
    }
  });

  it.each(EXPERIMENTS.map((e) => [e.id, e]))('« %s » ouvre sur une scène entièrement résolue', (id, experiment) => {
    const { scene } = experiment.build();
    const resolved = resolveScene(scene);
    for (const point of resolved.points.values()) expect(point.resolved, `${id}: ${point.name}`).toBe(true);
    for (const vector of resolved.vectors.values()) expect(vector.resolved, `${id}: ${vector.name}`).toBe(true);
    for (const polygon of resolved.polygons.values()) expect(polygon.resolved, `${id}: ${polygon.name}`).toBe(true);
  });

  it.each(EXPERIMENTS.map((e) => [e.id, e]))('« %s » survit à un aller-retour par le stockage', (id, experiment) => {
    const { scene } = experiment.build();
    const round = normalizeScene(JSON.parse(JSON.stringify(scene)));
    expect(round.points.length, id).toBe(scene.points.length);
    expect(round.vectors.length, id).toBe(scene.vectors.length);
    expect(round.polygons.length, id).toBe(scene.polygons.length);
  });

  it.each(EXPERIMENTS.map((e) => [e.id, e]))('« %s » laisse quelque chose à manipuler', (id, experiment) => {
    const { scene } = experiment.build();
    const resolved = resolveScene(scene);
    const draggable = [...resolved.points.values()].some((p) => p.draggable)
      || scene.vectors.some((v) => v.kind === 'free');
    expect(draggable, id).toBe(true);
  });

  it('« جمع » construit bien une somme, et « ضرب » un شعاع mis à l’échelle', () => {
    const addition = getExperiment('addition').build().scene;
    expect(addition.vectors.some((v) => v.kind === 'sum')).toBe(true);
    const scalar = getExperiment('scalar').build().scene;
    expect(scalar.vectors.some((v) => v.kind === 'scaled')).toBe(true);
  });

  it('« انسحاب مثلث » construit deux polygones : la forme et son image', () => {
    const shape = getExperiment('shape').build().scene;
    expect(shape.polygons).toHaveLength(2);
    expect(shape.points.filter((p) => p.kind === 'image')).toHaveLength(3);
  });

  it('une expérience inconnue rend null, elle n’invente pas de scène', () => {
    expect(getExperiment('fantome')).toBeNull();
  });
});
