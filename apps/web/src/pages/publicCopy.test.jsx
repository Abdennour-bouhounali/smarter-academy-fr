import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import '../i18n';
import PersonNameFields from '../components/auth/PersonNameFields';

/**
 * The public copy and the registration in French (FRANCE_REBUILD_PLAN.md §4quater): what a French family reads must be
 * true of this product today — no lesson yet, nothing sold — and carry no trace of the Algerian product.
 */
const json = (ns) => JSON.parse(readFileSync(new URL(`../i18n/locales/ar/${ns}.json`, import.meta.url), 'utf8'));
const marketing = json('marketing');
const auth = json('auth');
const access = json('access');
const student = json('student');
const methode = readFileSync(new URL('./Methode.jsx', import.meta.url), 'utf8');

const values = (node) => (typeof node === 'string' ? [node] : Object.values(node).flatMap(values));

describe('the public copy', () => {
  const all = [marketing, auth, access].flatMap(values);

  it('holds no Arabic and no Algerian reference', () => {
    for (const s of all) {
      expect(s).not.toMatch(/[\u0600-\u06FF]/);
      expect(s, s).not.toMatch(/\bBEM\b|dinar|\bDA\b|DZD|wilaya|Alg[ée]ri/i);
    }
  });

  it('claims nothing the product does not do today', () => {
    for (const s of values(marketing)) {
      expect(s, s).not.toMatch(/Terminale|\b50\sexercices|\b10\sexercices|2007|35\s?€|manuel|livre scolaire/i);
    }
    // No lesson is open: the home page has a sentence for that case, never « 0 leçon ».
    expect(marketing.trust.lessonsNone).toMatch(/aucune/);
    // A phone opens no lesson (RequireLargeScreen): the FAQ says so.
    expect(marketing.faq.items.device.a).toMatch(/ne s’ouvrent pas/);
  });

  it('follows the French typography', () => {
    for (const s of all) {
      expect(s, s).not.toContain("'");
      expect(s, s).not.toMatch(/ [:;!?]/); // a no-break space (U+00A0 / U+202F), never a plain one
      expect(s, s).not.toMatch(/\d(?:ème|eme)\b/);
    }
  });
});

describe('the Méthode page', () => {
  it('names the five levels exactly as the student’s practice space does', () => {
    expect(marketing.method.exercises.levels).toEqual(student.practice.levelNames);
    expect(Object.values(student.practice.levelNames)).toEqual([
      'Je reprends les bases',
      'J’applique',
      'Je m’exerce',
      'J’approfondis',
      'Défi',
    ]);
  });

  it('shows no capture of the Arabic interface: it is typographic', () => {
    expect(methode).not.toMatch(/<(?:motion\.)?img\b/);
    expect(methode).not.toMatch(/['"`]\/images\/methode/);
    expect(methode).toContain("t(`method.steps.${step.id}.alt`)");
  });
});

describe('the name fields follow the server', () => {
  it('know the three codes of utils/personName.js, and no other', () => {
    expect(Object.keys(auth.name.errors)).toEqual(['required', 'tooLong', 'invalid']);
    expect(auth.name.errors.invalid).toBe('Utilisez des lettres, des espaces, des traits d’union ou des apostrophes.');
  });

  it('render in French, left to right, and say which field is wrong', () => {
    const html = renderToStaticMarkup(
      <PersonNameFields value={{ firstName: 'Léa', lastName: '' }} onChange={() => {}} errors={{ lastName: 'invalid' }} />,
    );
    expect(html).toContain('Prénom');
    expect(html).toContain('Utilisez des lettres, des espaces, des traits d’union ou des apostrophes.');
    expect(html).not.toContain('dir="rtl"');
    expect(html).not.toContain('lang="ar"');
    expect(html).not.toMatch(/[\u0600-\u06FF]/);
  });
});
