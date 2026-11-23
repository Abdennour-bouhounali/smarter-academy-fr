// The class podium (`SessionPlay.jsx › Result › Podium`) draws each pupil whose gender the teacher set with the
// platform's character: ordinary clothes and varied hair for girls and boys alike — NO headscarf by default (plan §7bis,
// the owner's council; `lessons/common/components/kidFigure.js › DEFAULT_HAIR_STYLES`). Server render.
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Result } from './SessionPlay';
import { defaultSeating } from './session';

globalThis.window = globalThis.window ?? {};

const kids = Array.from({ length: 6 }, (_, i) => ({ id: 100 + i, name: `Élève ${i + 1}` }));
const seating = {
  ...defaultSeating(kids, 3),
  genders: { 100: 'f', 101: 'm', 102: 'f', 103: 'f', 104: 'm', 105: 'f' },
};
const questions = [
  { id: 'q1', item: '3e.m1.r01', itemLabel: 'Un savoir-faire' },
  { id: 'q2', item: '3e.m1.r01' },
  { id: 'q3', item: '3e.m1.r01' },
];
const answers = [
  { question: 'q1', student: 100, correct: true },
  { question: 'q2', student: 101, correct: true },
  { question: 'q3', student: 102, correct: false },
];
const draw = () =>
  renderToString(
    <Result
      students={kids}
      seating={seating}
      questions={questions}
      answers={answers}
      moment="start"
      startItems={[]}
      lessonItems={[]}
      itemLabel={(x) => x}
      status="saved"
      onBack={() => {}}
      onClose={() => {}}
    />,
  );

describe('the class podium draws girls and boys in ordinary clothes and varied hair', () => {
  it('every pupil with a gender is a figure; none wears a headscarf', () => {
    const html = draw();
    expect(html).toContain('data-cs-podium');
    const drawn = [...html.matchAll(/data-cs-kid="(\d+)" data-cs-kid-drawn="(\w+)"/g)].map((m) => [Number(m[1]), m[2]]);
    // the podium shows the pupils of its three steps — girls among them, each drawn as a figure
    expect(drawn.filter(([id]) => seating.genders[id] === 'f').length).toBeGreaterThanOrEqual(2);
    for (const [id, how] of drawn) expect(how, `pupil ${id}`).toBe('figure');
    expect(html).not.toContain('data-kid-hijab');
  });
});
