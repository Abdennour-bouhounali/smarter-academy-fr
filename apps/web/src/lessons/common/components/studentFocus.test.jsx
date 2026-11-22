import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { isStudentFocus, MoreToggle } from './StudentFocus';
import { describeLearningViewer } from '../../../features/learning/learningViewer';

const viewer = (role) => describeLearningViewer({ role });
const out = (focus) => renderToString(<MoreToggle force={focus}><p data-detail>تفصيل</p></MoreToggle>);

describe('isStudentFocus — the student « focus » view (LESSON_DEVELOPMENT_GUIDE « عرض التلميذ المركّز »)', () => {
  it('is on only for a lesson that opts in, for a learner, outside Classroom Mode', () => {
    expect(isStudentFocus('focus', viewer('student'), { isClassroomMode: false })).toBe(true);
    expect(isStudentFocus('focus', viewer('visitor'), { isClassroomMode: false })).toBe(true);
  });
  it('leaves every other lesson unchanged', () => {
    expect(isStudentFocus(undefined, viewer('student'), { isClassroomMode: false })).toBe(false);
  });
  it('never changes the teacher (or admin) view, nor a presented lesson', () => {
    expect(isStudentFocus('focus', viewer('teacher'), { isClassroomMode: false })).toBe(false);
    expect(isStudentFocus('focus', viewer('admin'), { isClassroomMode: false })).toBe(false);
    expect(isStudentFocus('focus', viewer('student'), { isClassroomMode: true })).toBe(false);
  });
});

describe('MoreToggle — the one disclosure for lesson content', () => {
  it('outside focus, renders its content inline and nothing else', () => {
    expect(out(false)).toBe('<p data-detail="true">تفصيل</p>');
  });
  it('in focus, keeps the content MOUNTED but hidden behind a closed button', () => {
    const html = out(true);
    expect(html).toContain('data-more-toggle="closed"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toMatch(/<div[^>]*hidden=""[^>]*><p data-detail="true">تفصيل<\/p><\/div>/);
  });
});
