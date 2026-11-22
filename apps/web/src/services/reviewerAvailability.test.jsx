import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import '../i18n';
import { ContentAvailabilityContext } from '../context/ContentAvailabilityContext';
import LessonCard from '../components/student/LessonCard';
import AmbassadorSwitch from '../components/admin/ui/AmbassadorSwitch';
import { AuthContext } from '../context/AuthContext';
import { setTeacherAmbassador } from './admin/teacherService';

const here = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(resolve(here, '../..', p), 'utf8');

/**
 * Les RELECTEURS (admin, enseignant ambassadeur « سفير ») voient tout le
 * contenu, quel qu'en soit l'état, avec une pastille d'état. La preuve
 * d'autorité vit côté serveur (ContentAccessReviewerTest) ; ici, que
 * l'interface affiche ce que le serveur décide, et rien de plus.
 */
const LESSON = {
  id: 'qasim-adad-tabii', status: 'available', path: '/courses/x', icon: '📘',
  title: 'درس', description: 'وصف', duration: '30 د',
};

const availability = (overrides = {}) => ({
  isLessonClosed: () => false,
  isModuleClosed: () => false,
  isLessonLocked: () => false,
  isLessonPremium: () => false,
  isLessonHiddenByClass: () => false,
  hiddenByClassCount: 0,
  lessonStatus: () => 'published',
  moduleStatus: () => 'published',
  access: null,
  loaded: true,
  refresh: async () => {},
  ...overrides,
});

const renderCard = (value) => renderToStaticMarkup(
  <ContentAvailabilityContext.Provider value={value}>
    <MemoryRouter><LessonCard lesson={LESSON} /></MemoryRouter>
  </ContentAvailabilityContext.Provider>,
);

describe('la carte de leçon pour un relecteur', () => {
  it('une leçon en brouillon reste OUVERTE (cliquable) et porte son état', () => {
    const html = renderCard(availability({ lessonStatus: () => 'draft' }));
    expect(html).toContain('href="/courses/x"');
    expect(html).toContain('data-publication-status="draft"');
  });

  it('une leçon publiée ne porte aucune pastille d’état', () => {
    expect(renderCard(availability())).not.toContain('data-publication-status');
  });

  it('pour un élève, une leçon fermée reste « bientôt » — sans pastille, sans lien', () => {
    const html = renderCard(availability({ isLessonClosed: () => true }));
    expect(html).not.toContain('href="/courses/x"');
    expect(html).not.toContain('data-publication-status');
  });
});

describe('le contexte de disponibilité', () => {
  const source = read('src/context/ContentAvailabilityContext.jsx');

  it('expose lessonStatus / moduleStatus, « published » par défaut', () => {
    expect(source).toContain("lessonStatus: () => 'published'");
    expect(source).toContain("moduleStatus: () => 'published'");
    expect(source).toContain("closed.statuses?.lessons?.[lessonCode] ?? 'published'");
  });

  it('lit `statuses` de la réponse du serveur', () => {
    expect(source).toContain('statuses: result.statuses ?? null');
  });
});

describe('les surfaces qui affichent l’état', () => {
  it.each([
    ['src/components/student/LessonCard.jsx', 'status={publication}'],
    ['src/components/student/LessonRow.jsx', 'status={publication}'],
    ['src/pages/UnitPage.jsx', 'lessonStatus(lesson.id)'],
    ['src/lessons/common/components/LessonIndex.jsx', 'moduleStatus(config.id, module.number)'],
    ['src/lessons/common/components/ModuleLayout.jsx', 'moduleStatus(lessonId, moduleNumber)'],
  ])('%s pose la pastille', (file, call) => {
    // `publication` = `lessonStatus(lesson.id)`, lu par useLessonTileState.
    const source = read(file);
    expect(source).toContain('<PublicationBadge');
    expect(source).toContain(call);
  });

  it('la page d’unité garde le geste à sa place : « قريبًا » désactivé au lieu de rien', () => {
    const source = read('src/pages/UnitPage.jsx');
    expect(source).toContain('{!available && (');
    expect(source).toContain("t('unit.soon')");
    expect(source).toContain('aria-disabled="true"');
  });

  it('le signalement est EN HAUT du module et du sommaire, en variante visible', () => {
    const module = read('src/lessons/common/components/ModuleLayout.jsx');
    const index = read('src/lessons/common/components/LessonIndex.jsx');
    expect(module).toContain('variant="prominent"');
    expect(index).toContain('variant="prominent"');
    // Plus de bouton dans le pied de page du module.
    expect(module.slice(module.lastIndexOf('<footer'))).not.toContain('<ReportButton');
  });

  it('le sommaire refuse une leçon non publiée ouverte par URL directe', () => {
    const source = read('src/lessons/common/components/LessonIndex.jsx');
    expect(source).toContain('if (isLessonClosed(config.id))');
    expect(source).toContain('data-lesson-unpublished');
  });

  it('la fiche leçon de l’administration ouvre la leçon (spec §9)', () => {
    expect(read('src/pages/admin/content/LessonDetail.jsx')).toContain('data-open-lesson');
  });
});

describe('l’interrupteur « سفير » de l’administration', () => {
  const renderSwitch = (teacher) => renderToStaticMarkup(
    <AuthContext.Provider value={{ token: 't', user: { role: 'admin' } }}>
      <AmbassadorSwitch teacher={teacher} withLabel />
    </AuthContext.Provider>,
  );

  it('dit son état par aria-checked et par le texte', () => {
    const on = renderSwitch({ id: 1, email: 'a@b.c', isAmbassador: true });
    expect(on).toContain('role="switch"');
    expect(on).toContain('aria-checked="true"');
    const off = renderSwitch({ id: 1, email: 'a@b.c', isAmbassador: false });
    expect(off).toContain('aria-checked="false"');
    expect(off).toContain('ليس سفيراً');
  });

  it('est posé dans la liste ET la fiche enseignant', () => {
    expect(read('src/pages/admin/teachers/TeacherList.jsx')).toContain('<AmbassadorSwitch');
    expect(read('src/pages/admin/teachers/TeacherDetail.jsx')).toContain('<AmbassadorSwitch');
  });

  describe('setTeacherAmbassador', () => {
    afterEach(() => { delete global.fetch; });

    it('envoie PATCH /admin/teachers/{id}/ambassador avec un booléen', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ success: true, teacher: { id: 5, isAmbassador: true } }) });
      const teacher = await setTeacherAmbassador('tok', 5, 1);
      const [url, options] = global.fetch.mock.calls[0];
      expect(url).toMatch(/\/admin\/teachers\/5\/ambassador$/);
      expect(options.method).toBe('PATCH');
      expect(JSON.parse(options.body)).toEqual({ ambassador: true });
      expect(teacher).toEqual({ id: 5, isAmbassador: true });
    });

    it('un refus remonte une erreur', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 422, json: async () => ({ message: 'Seul un enseignant peut être ambassadeur.' }) });
      await expect(setTeacherAmbassador('tok', 5, true)).rejects.toThrow();
    });
  });
});
