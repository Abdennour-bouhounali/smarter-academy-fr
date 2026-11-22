import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../i18n';
import { lessonPackFlags } from '../../lessons/registry';

// The teacher's unit page lists a lesson's étapes (`LessonModuleChips`). The configs are mocked: what is tested is the rule,
// read from the lesson's own pack flags (`lessons/registry.js › lessonPackFlags`).
const MODULES = [
  { id: '01', number: 1, title: 'Première étape' },
  { id: '02', number: 2, title: 'Deuxième étape' },
];
vi.mock('../../lessons/useLessonConfig', () => ({ useLessonConfig: () => ({ modules: MODULES }) }));
vi.mock('../../lessons/registry', async (importOriginal) => ({
  ...(await importOriginal()),
  lessonPackFlags: vi.fn((id) => (id === 'a-world-lesson' ? { world: 'divisor-isles', board: true } : {})),
}));

const { LessonModuleChips } = await import('./TeacherLessonActions');

describe('LessonModuleChips — the étapes of a lesson on the teacher’s unit page', () => {
  it('a lesson on its module pages shows one chip per module, without a link', () => {
    const out = renderToString(<LessonModuleChips lessonId="a-paged-lesson" />);
    expect(out.split('data-module-chip=').length - 1).toBe(2);
    expect(out).not.toContain('href=');
  });

  it('a v2 lesson (a world in its pack) shows none: its module pages are deleted, their addresses only redirect', () => {
    expect(renderToString(<LessonModuleChips lessonId="a-world-lesson" />)).toBe('');
    expect(lessonPackFlags).toHaveBeenCalledWith('a-world-lesson');
  });
});
