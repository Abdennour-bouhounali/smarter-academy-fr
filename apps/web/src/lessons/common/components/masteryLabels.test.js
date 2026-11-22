import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  stateLabel, reasonLabel, freshnessLabel, masteryTooltip, MASTERY_STATE_KEYS, DEFAULT_DISTINCT_ITEMS_NEEDED,
} from './masteryLabels';

const student = JSON.parse(
  readFileSync(new URL('../../../i18n/locales/ar/student.json', import.meta.url), 'utf8'),
);

/**
 * UN seul vocabulaire de maîtrise : `student:mastery.*`. Ces tests
 * verrouillent (1) que les anciens doublons ont disparu du catalogue,
 * (2) que les quatre états, trois raisons et trois fraîcheurs y sont, et
 * (3) que les aides produisent exactement les phrases du catalogue, compteurs
 * interpolés. Les phrases elles-mêmes appartiennent à `student.json` (son agent les écrit) : ce test les lit.
 */
/** The catalogue's sentence for insufficient_evidence, with its two counters filled in. */
const phrase = (done, needed) => student.mastery.reason.insufficient_evidence
  .replace('{{done}}', String(done)).replace('{{needed}}', String(needed));

describe('mastery vocabulary — one label set', () => {
  it('les doublons progression.chips.* et unit.mastery.* ont été retirés', () => {
    for (const s of MASTERY_STATE_KEYS) {
      expect(student.progression.chips).not.toHaveProperty(s);
    }
    expect(student.unit).not.toHaveProperty('mastery');
    // Les clés NON-état du groupe chips restent.
    expect(student.progression.chips).toHaveProperty('aria');
    expect(student.progression.chips).toHaveProperty('legend');
    expect(student.progression.chips).toHaveProperty('total_other');
  });

  it('mastery.* porte les quatre états, les raisons et la fraîcheur', () => {
    for (const s of MASTERY_STATE_KEYS) expect(typeof student.mastery[s]).toBe('string');
    expect(student.mastery.reason).toEqual({
      threshold: '',
      insufficient_evidence: expect.stringContaining('{{done}}'),
      needs_assessment: expect.stringMatching(/\S/),
    });
    expect(Object.keys(student.mastery.freshness)).toEqual(['fresh', 'aging', 'stale']);
    for (const v of Object.values(student.mastery.freshness)) expect(v).toMatch(/\S/);
  });
});

describe('stateLabel', () => {
  it('lit mastery.<state> dans le catalogue', () => {
    expect(stateLabel('mastered')).toBe(student.mastery.mastered);
    expect(stateLabel('gap')).toBe(student.mastery.gap);
    expect(stateLabel('gap')).not.toBe(stateLabel('mastered'));
  });

  it('un état inconnu vaut l’état « pas encore évalué » (unassessed)', () => {
    expect(stateLabel('whatever')).toBe(student.mastery.unassessed);
    expect(stateLabel(undefined)).toBe(student.mastery.unassessed);
  });
});

describe('reasonLabel', () => {
  it('rien pour threshold, null, ou une ligne absente', () => {
    expect(reasonLabel({ statusReason: 'threshold' })).toBe('');
    expect(reasonLabel({ statusReason: null })).toBe('');
    expect(reasonLabel(undefined)).toBe('');
    expect(reasonLabel({ statusReason: 'unknown_reason' })).toBe('');
  });

  it('insufficient_evidence : « X sur Y » avec le compteur de la ligne', () => {
    const label = reasonLabel({ statusReason: 'insufficient_evidence', distinctItemsSuccess: 1, needed: 3 });
    expect(label).toBe(phrase(1, 3));
    expect(label).toContain('1');
    expect(label).toContain('3');
    expect(label).not.toContain('{{');
  });

  it('insufficient_evidence : le seuil du serveur (`evidence.needed`) gagne sur le repli', () => {
    expect(reasonLabel({ statusReason: 'insufficient_evidence', evidence: { distinctItemsSuccess: 2, needed: 2 } }))
      .toBe(phrase(2, 2));
    // Sans `needed`, le repli documenté (min_distinct_items du plan §14).
    expect(reasonLabel({ statusReason: 'insufficient_evidence', distinctItemsSuccess: 0 }))
      .toBe(phrase(0, DEFAULT_DISTINCT_ITEMS_NEEDED));
  });

  it('needs_assessment : la phrase « prêt pour le défi » du catalogue', () => {
    expect(reasonLabel({ statusReason: 'needs_assessment' })).toBe(student.mastery.reason.needs_assessment);
  });

  it('accepte un `t` injecté', () => {
    const t = (key, opts) => `${key}:${opts?.done}/${opts?.needed}`;
    expect(reasonLabel({ statusReason: 'insufficient_evidence', distinctItemsSuccess: 1, needed: 4 }, t))
      .toBe('mastery.reason.insufficient_evidence:1/4');
  });
});

describe('freshnessLabel', () => {
  it('traduit fresh / aging / stale', () => {
    expect(freshnessLabel({ freshness: 'fresh' })).toBe(student.mastery.freshness.fresh);
    expect(freshnessLabel({ freshness: 'aging' })).toBe(student.mastery.freshness.aging);
    expect(freshnessLabel({ freshness: 'stale' })).toBe(student.mastery.freshness.stale);
    expect(new Set(['fresh', 'aging', 'stale'].map((f) => freshnessLabel({ freshness: f }))).size).toBe(3);
  });

  it('rien sans fraîcheur (point jamais évalué) ou pour une valeur inconnue', () => {
    expect(freshnessLabel({ freshness: null })).toBe('');
    expect(freshnessLabel(undefined)).toBe('');
    expect(freshnessLabel({ freshness: 'rotten' })).toBe('');
  });
});

describe('masteryTooltip', () => {
  it('état seul quand rien d’autre ne s’applique', () => {
    expect(masteryTooltip('unassessed', undefined)).toBe(student.mastery.unassessed);
    expect(masteryTooltip('mastered', { freshness: 'fresh' })).toBe(student.mastery.mastered);
    expect(masteryTooltip('reinforce', { statusReason: 'threshold' })).toBe(student.mastery.reinforce);
  });

  it('ajoute la raison d’un reinforce et la fraîcheur d’un mastered qui vieillit', () => {
    expect(masteryTooltip('reinforce', { statusReason: 'needs_assessment' }))
      .toBe(`${student.mastery.reinforce} — ${student.mastery.reason.needs_assessment}`);
    expect(masteryTooltip('mastered', { freshness: 'stale' }))
      .toBe(`${student.mastery.mastered} — ${student.mastery.freshness.stale}`);
  });
});
