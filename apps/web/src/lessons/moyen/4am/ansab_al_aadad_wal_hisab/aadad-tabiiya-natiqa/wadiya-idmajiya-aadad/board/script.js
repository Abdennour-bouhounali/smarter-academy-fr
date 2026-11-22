/**
 * « الدرس على السبّورة » of « أدمج تعلّماتي » (unit 1) — the STEPS the class goes through together (CLASS_SESSION.md §5ter).
 * This lesson has no key to name: its hour on the board IS a mission. Each station is of kind `mission`
 * (`features/classSession/LessonBoard.jsx › MissionStation`): it says what the class needs, then opens the lesson's OWN
 * world on that mission, over the whole window, as a preview. The whole class solves on paper; the board asks, builds
 * what one student types (a wrong number of lots leaves crates on the quay, a wrong spacing leaves a corner without a
 * tree) and answers a wrong value by the fact that refutes it. ONE mission per hour: station 1 in a first hour,
 * station 2 in a second.
 * The missions are the lesson's (`../missions/`): nothing of them is written again here. Reached only through the
 * lesson's pack (`lesson.pack.js › board.script`). A `cue` is at most 70 characters and holds no Latin and no formula.
 */
import { BEM_2020 } from '../missions/bem2020';
import { BEM_2022 } from '../missions/bem2022';

const LESSON = 'wadiya-idmajiya-aadad';
const needs = (m) => ['ورقة لكلّ تلميذ', 'قلم', `${m.minutes} دقيقة`];

const station = (m, text, question, cue) => ({
  id: m.id,
  kind: 'mission',
  chapter: 'نحلّ',
  title: `${m.title} — ${m.session.split('—')[1].trim()}`,
  lesson: LESSON,
  world: 'mission-isle',
  mission: m.id,
  text,
  needs: needs(m),
  question,
  cue,
});

export const SCRIPT = {
  title: 'أدمج تعلّماتي',
  steps: [
    station(
      BEM_2022,
      'وضعية من شهادة التعليم المتوسط، نحلّها معًا كما في الامتحان: كلّ تلميذ يكتب على ورقته، والسبّورة تبني ما نكتبه.',
      'من يقرأ الوضعية للقسم بصوت مسموع؟',
      'ما الذي يطلبه السؤال الأوّل، بكلماتكم؟',
    ),
    station(
      BEM_2020,
      'وضعية بسؤال واحد يخفي عدّة خطوات. نكتب المعطيات والشروط أوّلًا، ثمّ نرتّب الخطوات قبل أيّ حساب.',
      'أيّ الشروط في النصّ ليس فيه عدد؟',
      'ما الذي نبحث عنه أوّلًا، وما الذي يأتي بعده؟',
    ),
  ],
};
