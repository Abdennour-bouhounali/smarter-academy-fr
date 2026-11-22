import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import '../../i18n';
import { LargeScreenOnlyNotice, PHONE_QUERY } from './RequireLargeScreen';

/**
 * Les leçons et les exercices : tablette et ordinateur seulement (propriétaire,
 * 2026-10-27). Le choix lui-même (matchMedia) se vérifie au navigateur ; ici,
 * le message, la requête et le montage dans App.jsx.
 */
const app = readFileSync(new URL('../../App.jsx', import.meta.url), 'utf8');

describe('RequireLargeScreen — pas de leçon ni d’exercice sur un téléphone', () => {
  it('rend le message du propriétaire, mot pour mot', () => {
    const html = renderToStaticMarkup(<MemoryRouter><LargeScreenOnlyNotice /></MemoryRouter>);
    expect(html).toContain('محتوى الدروس يظهر فقط في شاشة الحاسوب');
    expect(html).toContain('رجاء افتح المنصة في الحاسوب لاستفادة قصوى');
    expect(html).toContain('href="/espace"');
  });

  it('un téléphone = moins de 768 px de large, ou tactile de moins de 500 px de haut', () => {
    expect(PHONE_QUERY).toContain('(max-width: 767px)');
    expect(PHONE_QUERY).toContain('(pointer: coarse) and (max-height: 500px)');
  });

  it('entoure les routes des leçons et toutes les routes de pratique', () => {
    expect(app).toMatch(/<Route element={<RequireLargeScreen \/>}>\s*{lessonRoutes}\s*<\/Route>/);
    const gated = app.split('<Route element={<RequireLargeScreen />}>').slice(1).map((c) => c.split('</Route>\n')[0]).join('\n');
    for (const path of app.match(/path="(?:pratique\/|tashih\/)[^"]*"/g)) expect(gated).toContain(path);
  });
});
