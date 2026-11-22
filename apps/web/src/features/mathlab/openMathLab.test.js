import { describe, it, expect } from 'vitest';
import { buildMathLabLaunch, readMathLabLaunch } from './openMathLab.js';

/** Le point d'intégration leçon → مختبر : une destination et un état de navigation. */
describe('openMathLab', () => {
  it('construit la destination d’un instrument et transporte l’amorce dans l’état', () => {
    const launch = buildMathLabLaunch({ tool: 'whiteboard', seed: { elements: [{ type: 'rectangle' }] }, title: 'المثلث', origin: { lessonCode: 'x' } });
    expect(launch.to).toBe('/espace/atelier/tableau');
    expect(launch.state.mathLab).toEqual({ tool: 'whiteboard', seed: { elements: [{ type: 'rectangle' }] }, title: 'المثلث', origin: { lessonCode: 'x' } });
  });

  it('refuse un instrument inconnu', () => {
    expect(() => buildMathLabLaunch({ tool: 'graph' })).toThrow(/graph/);
  });

  it('ne relit que l’amorce destinée à cet instrument', () => {
    const state = buildMathLabLaunch({ tool: 'whiteboard', title: 'x' }).state;
    expect(readMathLabLaunch(state, 'whiteboard')?.title).toBe('x');
    expect(readMathLabLaunch(state, 'graph')).toBeNull();
    expect(readMathLabLaunch(null, 'whiteboard')).toBeNull();
    expect(readMathLabLaunch({ other: 1 }, 'whiteboard')).toBeNull();
  });
});
