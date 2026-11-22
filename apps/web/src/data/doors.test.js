import { describe, it, expect } from 'vitest';
import { activeDoorId, doorPagesFor } from './doors';
import { studentDoors } from './studentNavigation';
import { teacherDoors, teacherAccountLinks } from './teacherNavigation';

describe('the four doors', () => {
  it('each account has exactly four doors, each with a name and an address', () => {
    for (const doors of [studentDoors, teacherDoors]) {
      expect(doors).toHaveLength(4);
      for (const door of doors) {
        expect(door.labelKey).toBeTruthy();
        expect(door.path).toMatch(/^\/(espace|enseignant)/);
      }
    }
  });

  it('no page is behind two doors', () => {
    for (const doors of [studentDoors, teacherDoors]) {
      const paths = doors.flatMap((door) => door.pages.map((page) => page.path));
      expect(new Set(paths).size).toBe(paths.length);
    }
  });

  it('lights the student door of an address', () => {
    const door = (pathname) => activeDoorId(studentDoors, pathname);
    expect(door('/espace')).toBe('today');
    expect(door('/espace/bawsala')).toBe('today');
    expect(door('/espace/cours')).toBe('lessons');
    expect(door('/courses/moyen/4am/x/qasim-adad-tabii')).toBe('lessons');
    expect(door('/espace/pratique/qasim-adad-tabii')).toBe('train');
    expect(door('/espace/atelier/whiteboard/12')).toBe('train');
    expect(door('/espace/cahier/7')).toBe('me');
    expect(door('/espace/profil/wali')).toBe('me');
  });

  it('lights the teacher door of an address; the account pages light none', () => {
    const door = (pathname) => activeDoorId(teacherDoors, pathname, teacherAccountLinks);
    expect(door('/enseignant')).toBe('today');
    expect(door('/enseignant/classes/3')).toBe('classes');
    expect(door('/enseignant/tashih')).toBe('classes');
    expect(door('/enseignant/atelier')).toBe('tools');
    expect(door('/enseignant/hissa/qasim-adad-tabii')).toBe('lessons');
    expect(door('/enseignant/milaff/qasim-adad-tabii')).toBe('lessons');
    expect(door('/enseignant/offre')).toBeNull();
  });

  it('shows the line of pages only on a door’s own pages', () => {
    expect(doorPagesFor(studentDoors, '/espace/defi').map((page) => page.path)).toContain('/espace/tafkir');
    expect(doorPagesFor(studentDoors, '/espace')).toEqual([]);
    expect(doorPagesFor(studentDoors, '/espace/atelier/whiteboard')).toEqual([]);
    expect(doorPagesFor(teacherDoors, '/enseignant/cours')).toEqual([]);
  });
});
