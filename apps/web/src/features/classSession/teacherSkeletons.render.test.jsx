import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import {
  boardFit,
  ClassSessionSkeleton,
  ClassWorkSkeleton,
  LabOpeningSkeleton,
  TeacherPanelSkeleton,
} from './TeacherSkeletons';

/** BUNDLE_BOUNDARIES.md rule 12: what a teacher waits for is a skeleton of its final shape, announced once. */
const statuses = (html) => (html.match(/role="status"/g) ?? []).length;

describe('the teacher’s loading skeletons', () => {
  it('« للأستاذ »: one status, with the class panel only on a lesson that has its board', () => {
    const withBoard = renderToString(<TeacherPanelSkeleton />);
    const without = renderToString(<TeacherPanelSkeleton board={false} />);
    for (const html of [withBoard, without]) {
      expect(statuses(html)).toBe(1);
      expect(html).toContain('aria-label="جارٍ التحضير…"');
      expect(html).toContain('motion-reduce:animate-none');
    }
    expect(withBoard).toContain('rounded-3xl');
    expect(without).not.toContain('rounded-3xl');
  });

  it('« حصّة القسم »: the page frame and its set-up screen, one status', () => {
    const html = renderToString(<ClassSessionSkeleton />);
    expect(html).toContain('cs-root');
    expect(html).toContain('cs-work');
    expect(statuses(html)).toBe(1);
    expect(statuses(renderToString(<ClassWorkSkeleton />))).toBe(1);
  });

  it('the lab layer says it is opening', () => {
    const html = renderToString(<LabOpeningSkeleton />);
    expect(statuses(html)).toBe(1);
    expect(html).toContain('جارٍ التحضير…');
  });

  it('fits the board like the page: wide at 1366 × 768, 4:3 below a ratio of 1.55', () => {
    expect(boardFit(1366, 768)).toEqual({ narrow: false, zoom: Math.min(1366 / 1280, 768 / 720) });
    expect(boardFit(1024, 768).narrow).toBe(true);
  });
});
