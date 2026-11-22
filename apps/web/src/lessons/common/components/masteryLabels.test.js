import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  stateLabel, reasonLabel, freshnessLabel, masteryTooltip, MASTERY_STATE_KEYS, DEFAULT_DISTINCT_ITEMS_NEEDED,
} from './masteryLabels';

const studentAr = JSON.parse(
  readFileSync(new URL('../../../i18n/locales/ar/student.json', import.meta.url), 'utf8'),
);

/**
 * UN seul vocabulaire de maîtrise : `student:mastery.*`. Ces tests
 * verrouillent (1) que les anciens doublons ont disparu du catalogue,
 * (2) que les quatre états, trois raisons et trois fraîcheurs y sont, et
 * (3) que les aides produisent les phrases arabes attendues.
 */
describe('mastery vocabulary — one label set', () => {
  it('les doublons progression.chips.* et unit.mastery.* ont été retirés', () => {
    for (const s of MASTERY_STATE_KEYS) {
      expect(studentAr.progression.chips).not.toHaveProperty(s);
    }
    expect(studentAr.unit).not.toHaveProperty('mastery');
    // Les clés NON-état du groupe chips restent.
    expect(studentAr.progression.chips).toHaveProperty('aria');
    expect(studentAr.progression.chips).toHaveProperty('legend');
    expect(studentAr.progression.chips).toHaveProperty('total_other');
  });

  it('mastery.* porte les quatre états, les raisons et la fraîcheur', () => {
    for (const s of MASTERY_STATE_KEYS) expect(typeof studentAr.mastery[s]).toBe('string');
    expect(studentAr.mastery.reason).toEqual({
      threshold: '',
      insufficient_evidence: expect.stringContaining('{{done}}'),
      needs_assessment: expect.stringContaining('الاختبار النهائي'),
    });
    expect(studentAr.mastery.freshness).toEqual({ fresh: 'حديث', aging: 'منذ فترة', stale: 'يحتاج تذكيرًا' });
  });
});

describe('stateLabel', () => {
  it('lit mastery.<state> en arabe', () => {
    expect(stateLabel('mastered')).toBe(studentAr.mastery.mastered);
    expect(stateLabel('gap')).toBe('يحتاج إلى تدعيم');
  });

  it('un état inconnu vaut « لم تُقيَّم بعد »', () => {
    expect(stateLabel('whatever')).toBe(studentAr.mastery.unassessed);
    expect(stateLabel(undefined)).toBe(studentAr.mastery.unassessed);
  });
});

describe('reasonLabel', () => {
  it('rien pour threshold, null, ou une ligne absente', () => {
    expect(reasonLabel({ statusReason: 'threshold' })).toBe('');
    expect(reasonLabel({ statusReason: null })).toBe('');
    expect(reasonLabel(undefined)).toBe('');
    expect(reasonLabel({ statusReason: 'unknown_reason' })).toBe('');
  });

  it('insufficient_evidence : « X من Y أسئلة متنوعة » avec le compteur de la ligne', () => {
    const label = reasonLabel({ statusReason: 'insufficient_evidence', distinctItemsSuccess: 1, needed: 3 });
    expect(label).toBe('ثبّت بتمارين مختلفة: 1 من 3 أسئلة متنوعة');
  });

  it('insufficient_evidence : le seuil du serveur (`evidence.needed`) gagne sur le repli', () => {
    expect(reasonLabel({ statusReason: 'insufficient_evidence', evidence: { distinctItemsSuccess: 2, needed: 2 } }))
      .toBe('ثبّت بتمارين مختلفة: 2 من 2 أسئلة متنوعة');
    // Sans `needed`, le repli documenté (min_distinct_items du plan §14).
    expect(reasonLabel({ statusReason: 'insufficient_evidence', distinctItemsSuccess: 0 }))
      .toBe(`ثبّت بتمارين مختلفة: 0 من ${DEFAULT_DISTINCT_ITEMS_NEEDED} أسئلة متنوعة`);
  });

  it('needs_assessment : la phrase « جاهز للتحدي »', () => {
    expect(reasonLabel({ statusReason: 'needs_assessment' })).toBe(studentAr.mastery.reason.needs_assessment);
  });

  it('accepte un `t` injecté', () => {
    const t = (key, opts) => `${key}:${opts?.done}/${opts?.needed}`;
    expect(reasonLabel({ statusReason: 'insufficient_evidence', distinctItemsSuccess: 1, needed: 4 }, t))
      .toBe('mastery.reason.insufficient_evidence:1/4');
  });
});

describe('freshnessLabel', () => {
  it('traduit fresh / aging / stale', () => {
    expect(freshnessLabel({ freshness: 'fresh' })).toBe('حديث');
    expect(freshnessLabel({ freshness: 'aging' })).toBe('منذ فترة');
    expect(freshnessLabel({ freshness: 'stale' })).toBe('يحتاج تذكيرًا');
  });

  it('rien sans fraîcheur (point jamais évalué) ou pour une valeur inconnue', () => {
    expect(freshnessLabel({ freshness: null })).toBe('');
    expect(freshnessLabel(undefined)).toBe('');
    expect(freshnessLabel({ freshness: 'rotten' })).toBe('');
  });
});

describe('masteryTooltip', () => {
  it('état seul quand rien d’autre ne s’applique', () => {
    expect(masteryTooltip('unassessed', undefined)).toBe(studentAr.mastery.unassessed);
    expect(masteryTooltip('mastered', { freshness: 'fresh' })).toBe(studentAr.mastery.mastered);
    expect(masteryTooltip('reinforce', { statusReason: 'threshold' })).toBe(studentAr.mastery.reinforce);
  });

  it('ajoute la raison d’un reinforce et la fraîcheur d’un mastered qui vieillit', () => {
    expect(masteryTooltip('reinforce', { statusReason: 'needs_assessment' }))
      .toBe(`${studentAr.mastery.reinforce} — ${studentAr.mastery.reason.needs_assessment}`);
    expect(masteryTooltip('mastered', { freshness: 'stale' }))
      .toBe(`${studentAr.mastery.mastered} — يحتاج تذكيرًا`);
  });
});
