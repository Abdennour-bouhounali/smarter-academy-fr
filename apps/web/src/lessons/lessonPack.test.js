import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { lessonPackFlags, lessonsWithPack, loadLessonPack, getBuiltLessons } from './registry';
import { hasPackPart, loadPackPart } from './lessonPack';

const FLAGS = ['phone', 'world', 'knowledge', 'coach', 'board'];
const WITH_PACK = getBuiltLessons()
  .map((l) => l.id)
  .filter((id) => Object.keys(lessonPackFlags(id)).length > 0);

describe('the pack of a lesson — the ONE place where it says what it gives the platform', () => {
  it('a lesson without a pack has no flag and no part: nothing is loaded for it', async () => {
    expect(lessonPackFlags('muadalat-x-murabba')).toEqual({});
    expect(lessonPackFlags('no-such-lesson')).toEqual({});
    expect(await loadLessonPack('muadalat-x-murabba')).toBe(null);
    expect(hasPackPart('muadalat-x-murabba', 'script')).toBe(false);
    expect(await loadPackPart('muadalat-x-murabba', 'world')).toBe(null);
  });

  it('the generated flags say exactly what each pack holds, and every part named really loads', async () => {
    expect(WITH_PACK).toContain('qasim-adad-tabii');
    for (const id of WITH_PACK) {
      const flags = lessonPackFlags(id);
      const pack = await loadLessonPack(id);
      expect(pack.id, id).toBe(id);
      expect(Object.keys(flags).sort(), id).toEqual(FLAGS.filter((f) => pack[f]).sort());
      for (const f of FLAGS) expect(lessonsWithPack(f).includes(id), `${id} ${f}`).toBe(Boolean(pack[f]));
      if (flags.world) {
        expect(flags.world, id).toBe(pack.world.id);
        const lesson = await loadPackPart(id, 'world');
        // a unit's last lesson is not a lesson of keys: its island asks missions and a bank, no ladder and no trainer
        // a lesson BEING BUILT says which doors of the kit it has not got yet (`notYet`): until that list is empty it owes
        // only its story and its forges — every part it does not name there is owed in full
        const parts =
          flags.world === 'mission-isle'
            ? ['keys', 'missions', 'bank', 'recap', 'sittings', 'journey', 'evidence', 'text']
            : lesson.notYet?.length
              ? ['keys', 'rules', 'story', 'forges']
              : ['keys', 'ladder', 'trainer', 'sittings', 'journey', 'evidence', 'knowledge', 'text'];
        for (const key of parts) expect(lesson[key], `${id} world.${key}`).toBeTruthy();
      }
      if (flags.knowledge)
        expect(Object.keys((await loadPackPart(id, 'knowledge')).modules).length, id).toBeGreaterThan(0);
      if (flags.board) {
        expect((await loadPackPart(id, 'script')).steps.length, id).toBeGreaterThan(0);
        expect((await loadPackPart(id, 'memo')).glance, id).toBeTruthy();
      }
    }
    // every pack's world, knowledge and board are imported one after the other: 1 s alone, but over the default 5 s
    // when the whole suite imports beside it (measured 2026-11-19, seven packs) — so this test has its own limit
  }, 60_000);

  it('the exam coach finds a knowledge sheet behind every الكفاءة the pack names', async () => {
    for (const id of lessonsWithPack('coach')) {
      const coach = await loadPackPart(id, 'coach');
      const items = Object.values((await loadPackPart(id, 'knowledge')).modules)
        .flat()
        .map((it) => it.id);
      for (const [point, item] of Object.entries(coach)) expect(items, `${id} ${point}`).toContain(item);
    }
  });

  it('shared code names no lesson that has a pack — a lesson is reached through its pack, never by its id', () => {
    const SRC = fileURLToPath(new URL('..', import.meta.url));
    const SHARED = ['lessons/common', 'features', 'components', 'services', 'utils', 'hooks', 'contexts'];
    // an instrument of « مختبري » is tagged with the lesson that introduces it: shared CODE that belongs to a lesson
    const ALLOWED = ['lessons/common/lessonlab/registry.js'];
    const files = [];
    const walk = (dir) => {
      for (const name of readdirSync(dir)) {
        const path = `${dir}/${name}`;
        if (statSync(path).isDirectory()) walk(path);
        else if (/\.(js|jsx)$/.test(name) && !/\.test\./.test(name)) files.push(path);
      }
    };
    for (const dir of SHARED) {
      try {
        walk(`${SRC}${dir}`);
      } catch {
        /* a folder that does not exist in this tree */
      }
    }
    expect(files.length).toBeGreaterThan(500);
    const named = [];
    for (const file of files) {
      const rel = file.slice(SRC.length);
      if (ALLOWED.includes(rel)) continue;
      const text = readFileSync(file, 'utf8');
      for (const id of WITH_PACK) if (text.includes(id)) named.push(`${rel} names ${id}`);
    }
    expect(named).toEqual([]);
  });
});
