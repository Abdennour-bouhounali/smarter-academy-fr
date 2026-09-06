// Tests de l'audit des dépendances de connaissances.
//
// Deux leçons-fixtures : la même matière, une fois construite avec le défaut
// signalé en production (la notation et le mot sont exigés avant d'être posés),
// une fois réparée selon la loi. L'audit doit distinguer les deux — sinon il
// ne peut servir de garde-fou.

import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { auditLesson } from '../audit-knowledge-dependencies.mjs';
import { readKnowledge } from '../lib/knowledgeData.mjs';
import { buildModuleStream } from '../lib/exposureStream.mjs';
import { splitMath } from '../lib/collectText.mjs';

const FIX = new URL('./__fixtures__/', import.meta.url).pathname;
const CATALOGUE = { pointsToLearn: ['Identifier un antécédent et son image', 'Utiliser la notation f(x)'] };

const codesOf = (r) => r.findings.map((f) => f.code);
const audit = (name, options) => auditLesson(join(FIX, name), CATALOGUE, options);

describe('flux d’exposition — l’ordre que l’élève rencontre vraiment', () => {
  const stream = (name) => {
    const k = readKnowledge(join(FIX, name));
    return buildModuleStream(join(FIX, name, 'modules/Module01Decouverte.jsx'), {
      moduleNumber: 1, stage: 'discovery', knowledgeItems: k.items, counter: { n: 0 },
    }).segments;
  };

  it('les positions sont strictement croissantes : c’est la ligne du temps', () => {
    const positions = stream('lesson-fixed').map((s) => s.position);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(new Set(positions).size).toBe(positions.length);
  });

  it('classe chaque emplacement : enseigner, demander, ou renforcer après coup', () => {
    const bySlot = Object.fromEntries(stream('lesson-broken').map((s) => [s.slot, s.kind]));
    expect(bySlot['q.prompt']).toBe('demand');
    expect(bySlot['q.option']).toBe('demand');
    expect(bySlot['q.explain']).toBe('postAnswer');
    expect(bySlot['step.title']).toBe('teaching');
    expect(bySlot['footer']).toBe('teaching');
    expect(bySlot['brick.item']).toBe('brick');
  });

  it('une révélation conditionnée par une manipulation reste une position d’enseignement', () => {
    const gated = stream('lesson-broken').find((s) => s.slot === 'gated');
    expect(gated.kind).toBe('teaching');
    expect(gated.text).toContain('Deux entrées');
  });

  it('la brique injecte le texte de son item, donc un item qui spoile est visible', () => {
    const brick = stream('lesson-fixed').find((s) => s.slot === 'brick.item');
    expect(brick.text).toContain('image');
    expect(brick.establishes).toEqual(['image']);
  });

  it('dans la leçon réparée, la brique précède la question qui l’exige', () => {
    const segs = stream('lesson-fixed');
    const brick = segs.find((s) => s.slot === 'brick.item' && s.establishes.includes('image'));
    const question = segs.find((s) => s.slot === 'q.prompt' && s.requires?.includes('image'));
    expect(brick.position).toBeLessThan(question.position);
  });

  it('la notation mathématique est extraite à part de la prose', () => {
    expect(splitMath('Que vaut $f(6)$ ?')).toEqual({ text: 'Que vaut ?', notation: ['f(6)'] });
    expect(splitMath('sans maths').notation).toEqual([]);
  });
});

describe('leçon cassée — l’audit retrouve le défaut de production', () => {
  const r = audit('lesson-broken');

  it('signale la notation et le mot exigés avant d’être posés', () => {
    const critical = r.findings.filter((f) => f.severity === 'critical');
    expect(critical.map((f) => f.term)).toContain('notation-fx');
    expect(codesOf(r)).toContain('C_TARGET_DEMANDED_BEFORE_TAUGHT');
  });

  it('refuse une question qui exige une connaissance établie plus loin', () => {
    const later = r.findings.filter((f) => f.code === 'E_REQUIRES_ESTABLISHED_LATER');
    expect(later.length).toBeGreaterThan(0);
    expect(later[0].message).toContain('image');
  });

  it('refuse une question qui exige un enrichissement', () => {
    expect(codesOf(r)).toContain('E_REQUIRES_ENRICHMENT');
  });

  it('refuse un diagnostic qui interroge la matière de la leçon', () => {
    const diag = r.findings.find((f) => f.code === 'E_DIAG_REQUIRES_UNDECLARED');
    expect(diag).toBeTruthy();
    expect(diag.message).toContain('image');
  });

  it('signale un prérequis déclaré que le module 0 ne diagnostique pas', () => {
    expect(codesOf(r)).toContain('W_PRIOR_NOT_DIAGNOSED');
  });

  it('produit un contrat où les questions fautives sont marquées invalides', () => {
    const q = r.contract.questions.find((x) => Array.isArray(x.requires) && x.requires.includes('bonus-parabole'));
    expect(q.prerequisiteStatus['bonus-parabole']).toBe('enrichment');
    expect(q.pedagogicallyValid).toBe(false);
  });
});

describe('leçon réparée — aucun blocage', () => {
  const r = audit('lesson-fixed');

  it('ne laisse aucune erreur de contrat', () => {
    expect(r.findings.filter((f) => f.code.startsWith('E_'))).toEqual([]);
  });

  it('ne laisse ni critique ni haute', () => {
    expect(r.findings.filter((f) => ['critical', 'high'].includes(f.severity))).toEqual([]);
  });

  it('chaque question exige des connaissances établies avant elle', () => {
    const declared = r.contract.questions.filter((q) => Array.isArray(q.requires) && q.requires.length > 0);
    expect(declared.length).toBeGreaterThan(0);
    for (const q of declared) {
      expect(q.pedagogicallyValid).toBe(true);
      for (const status of Object.values(q.prerequisiteStatus)) {
        expect(status === 'prior' || status.startsWith('established')).toBe(true);
      }
    }
  });

  it('un enrichissement jamais exigé ne bloque rien', () => {
    expect(codesOf(r)).not.toContain('E_REQUIRES_ENRICHMENT');
    expect(codesOf(r)).toContain('W_ITEM_WITHOUT_BRICK'); // bonus-parabole n'a pas de brique
  });

  it('en mode strict, une question sans requires est une erreur', () => {
    const strict = audit('lesson-broken', { strict: true });
    expect(codesOf(strict)).toContain('E_QUESTION_WITHOUT_REQUIRES');
    expect(codesOf(audit('lesson-fixed', { strict: true }))).not.toContain('E_QUESTION_WITHOUT_REQUIRES');
  });
});
