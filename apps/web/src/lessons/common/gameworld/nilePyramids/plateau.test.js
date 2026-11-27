import { describe, expect, it } from 'vitest';
import { NilePyramidsGame } from './Game';

/**
 * `story.plateau` (France, `triangles-semblables`, 2026-11-27): a story may measure a date palm under its own sun, the
 * stick left where it stands. Without it, the plateau is the papillon lesson's, step for step.
 */
const stagesOf = (story) =>
  NilePyramidsGame.prototype.stageData.call({
    story: { forges: {}, mission: {}, ...story },
    lesson: { forges: {} },
  });
const plateau = (story) => stagesOf(story)[4];

describe('the plateau a story asks for', () => {
  it('without `plateau`: the Great Pyramid, the 2 m stick casting 3 m under tan 2/3, the slide — as before', () => {
    const st = plateau({});
    expect(st.steps.map((x) => x.id)).toEqual(['shadowAM', 'HA', 'DG', 'ghost', 'mission']);
    expect(st.steps[0].target).toBe('3');
    expect(st.longest).toBe('230');
  });

  it('a date palm of 16,8 m under tan 4/5, the stick 1,6 m: its shadow 2 m, the palm’s 21 m, no base, no slide', () => {
    const st = plateau({ plateau: { tan: '4/5', object: 'palm', h: '16,8', stick: '1,6', slide: false } });
    expect(st.steps.map((x) => x.id)).toEqual(['shadowAM', 'palmShadow', 'mission']);
    expect(st.steps[0].target).toBe('2');
    expect(st.steps[1].target).toBe('21');
    expect(st.longest).toBe('21');
  });
});
