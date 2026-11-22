import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import '../../i18n';
import { practiceGridClass } from './useSideColumn';
import SideColumnToggle from './SideColumnToggle';

const here = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(resolve(here, '../../..', p), 'utf8');

describe('la colonne latérale du lecteur se replie', () => {
  it('repliée : l’exercice seul, sur toute la largeur', () => {
    expect(practiceGridClass(true)).not.toContain('xl:grid-cols-[28rem');
    expect(practiceGridClass(false)).toContain('xl:grid-cols-[28rem_minmax(0,1fr)]');
    // Feuille d'examen (BEM) : colonne étroite, le sujet prend la place.
    expect(practiceGridClass(false, { narrow: true })).toContain('xl:grid-cols-[19rem_minmax(0,1fr)]');
    // Le mode classe reste un bloc dans les deux cas.
    for (const hidden of [true, false]) expect(practiceGridClass(hidden)).toContain('[[data-sa-classroom]_&]:block');
  });

  it('le bouton dit ce qu’il fait, et son état', () => {
    const shown = renderToStaticMarkup(<SideColumnToggle hidden={false} onToggle={() => {}} label="الكفاءة" />);
    expect(shown).toContain('إخفاء الكفاءة');
    expect(shown).toContain('aria-pressed="false"');
    const hidden = renderToStaticMarkup(<SideColumnToggle hidden onToggle={() => {}} label="الكفاءة" />);
    expect(hidden).toContain('إظهار الكفاءة');
    expect(hidden).toContain('aria-pressed="true"');
  });

  it('n’apparaît qu’en grand écran, là où la colonne est à côté', () => {
    const html = renderToStaticMarkup(<SideColumnToggle hidden={false} onToggle={() => {}} label="x" />);
    expect(html).toContain('hidden');
    expect(html).toContain('xl:inline-flex');
  });

  it.each([
    'src/pages/student/practice/PracticeSession.jsx',
    'src/pages/teacher/practice/TeacherPracticePlayer.jsx',
  ])('%s : bouton + grille + colonne masquée en grand écran seulement', (file) => {
    const source = read(file);
    expect(source).toContain('useSideColumn()');
    expect(source).toContain('<SideColumnToggle');
    expect(source).toMatch(/practiceGridClass\(sideHidden(, \{ narrow: isExam \})?\)/);
    // Sous `xl` la colonne reste visible (le bouton n'y est pas) : jamais retirée du DOM.
    expect(source).toContain("${sideHidden ? 'xl:hidden' : ''}");
  });

  it('le choix est un confort local, protégé (stockage bloqué = colonne visible)', () => {
    const hook = read('src/features/practice/useSideColumn.js');
    expect(hook.match(/try \{/g)?.length).toBeGreaterThanOrEqual(2);
  });
});

describe('LevelSelector sans suivi (enseignant)', () => {
  it('dit le NOMBRE d’exercices, jamais « أنهيتها » ni une barre de progression', async () => {
    const { default: LevelSelector } = await import('./LevelSelector');
    const html = renderToStaticMarkup(
      <LevelSelector levels={[{ level: 1, unlocked: true, completedCount: 0, exerciseCount: 2 }]} onSelect={() => {}} showProgress={false} />,
    );
    expect(html).toContain('تمرينان');
    expect(html).not.toContain('أنهيتها');
    expect(html).not.toContain('bg-indigo-500');
  });
});
