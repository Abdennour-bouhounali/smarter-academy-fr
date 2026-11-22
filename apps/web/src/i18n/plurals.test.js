import { describe, it, expect } from 'vitest';
import i18n, { LANGUAGE } from './index.js';

const NBSP = ' ';

describe('i18n — one language, French, with the French plural rules', () => {
  it('runs in French', () => {
    expect(LANGUAGE).toBe('fr');
    expect(i18n.language).toBe('fr');
  });

  it('reads 0 and 1 as the singular, 2 and more as the plural', () => {
    expect(i18n.t('lessonsCount', { ns: 'common', count: 0 })).toBe(`0${NBSP}leçon`);
    expect(i18n.t('lessonsCount', { ns: 'common', count: 1 })).toBe(`1${NBSP}leçon`);
    expect(i18n.t('lessonsCount', { ns: 'common', count: 2 })).toBe(`2${NBSP}leçons`);
    expect(i18n.t('notifications.pendingReviews', { ns: 'nav', count: 12 })).toBe(`12${NBSP}réponses à corriger`);
  });

  it('carries no Arabic plural form in the bundled namespaces it owns', () => {
    const forms = /_(zero|two|few|many)$/;
    const keys = (object, prefix = '') =>
      Object.entries(object).flatMap(([key, value]) => (value && typeof value === 'object' ? keys(value, `${prefix}${key}.`) : [`${prefix}${key}`]));
    for (const namespace of ['common', 'nav']) {
      const found = keys(i18n.getResourceBundle(LANGUAGE, namespace)).filter((key) => forms.test(key));
      expect(found, namespace).toEqual([]);
    }
  });
});
