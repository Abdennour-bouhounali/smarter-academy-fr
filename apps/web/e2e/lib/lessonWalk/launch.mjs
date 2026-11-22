// « عُدّة الانطلاق » and « الامتحان الأبيض » of a lesson: thin wrappers over the shared walks that already exist
// (lib/launchKitTwoTools.mjs, lib/sittingWalk.mjs). What the lessons' own copies added — the words the launch writes on
// purpose (its tools' families, their home lessons, the mistakes) taken out of the foreign words — is computed here.
import { homeLessonOf } from '@smarter-academy/core/curriculum/fr/net/learningNet.js';
import { FAMILIES, MISTAKES } from '../../../src/lessons/common/launchkit/families.js';
import { walkLaunch, walkLaunchLists, walkLaunchOne, walkLaunchPair, A, B, LISTS } from '../launchKitTwoTools.mjs';
import { sittingWalk } from '../sittingWalk.mjs';

const strings = (v, out = []) => {
  if (typeof v === 'string') out.push(v);
  else if (v && typeof v === 'object') for (const x of Object.values(v)) strings(x, out);
  return out;
};

/**
 * The launch's scenario, from the descriptor's `launch`:
 *   { scenario: 'lists' }        two core tools, the divisor list 4am.m1.r02 then the 2AM division (the PGCD lessons);
 *   { scenario: 'two' }          two core tools, 4am.m1.r01 then the 2AM division (lessons 2 and 3);
 *   { scenario: 'one', tool }    one tool (walkLaunchOne);
 *   { scenario: 'pair', tools }  two tools of the descriptor's choosing, each a `tool` as above (walkLaunchPair; lesson 8).
 */
export async function launchWalk(L, D, opts) {
  const spec = D.launch ?? { scenario: 'lists' };
  const items =
    spec.scenario === 'lists'
      ? [LISTS, B]
      : spec.scenario === 'two'
        ? [A, B]
        : spec.scenario === 'pair'
          ? spec.tools.map((t) => t.item)
          : [spec.tool.item];
  const homes = items.map((i) => homeLessonOf(i)?.title).filter(Boolean);
  const own = [...items.flatMap((i) => strings(FAMILIES[i])), ...strings(MISTAKES)].join('\n');
  const alien = (opts.foreign ?? []).filter((x) => !homes.some((h) => h.includes(x)) && !own.includes(x));
  const base = (D.uid ?? 9900) + 80;
  const args = {
    id: L.id,
    outName: `lesson-${L.id}-launch`,
    ids: [base, base + 1, base + 2, base + 3],
    alien,
    alienLabel: 'the other lessons',
  };
  console.log(
    `NOTE  the launch of ${L.id}: scenario « ${spec.scenario} », tools ${items.join(', ')}, homes ${homes.join(' · ')}`,
  );
  if (spec.scenario === 'lists') return walkLaunchLists({ ...args, home: homes[0] });
  if (spec.scenario === 'two') return walkLaunch(args);
  if (spec.scenario === 'pair') return walkLaunchPair({ ...args, url: L.url, grade: L.grade, tools: spec.tools });
  return walkLaunchOne({ ...args, url: L.url, grade: L.grade, tool: spec.tool });
}

export async function sittingPart(L, D, opts) {
  return sittingWalk({
    name: `lesson-${L.id}-sitting`,
    grade: L.grade,
    id: L.id,
    url: L.url,
    keys: L.lesson.keys,
    // the lesson's last island (a save beyond its road crashes the world)
    stage: (L.lesson.story.islands ?? L.lesson.story.terraces).length - 1,
    uid: (D.uid ?? 9900) + 90,
    foreign: opts.foreign,
    foreignNumbers: opts.foreignNumbers,
  });
}
