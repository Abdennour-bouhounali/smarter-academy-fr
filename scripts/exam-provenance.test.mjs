import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { examProvenanceErrors, termExamBadge, gradeOfExercise } from './lib/examProvenance.mjs';

// Le VRAI index du corpus : une source `term_exam` cite un sujet qui existe.
const INDEX = JSON.parse(readFileSync(new URL('../docs/sources/moyen/exams/exams-index.json', import.meta.url), 'utf-8'));

const ex = (id, metadata) => ({ id, metadata });
const modelled = (badge) => ({ kind: 'modelled', badge, heading: 'التمرين', points: '03' });

describe('provenance d’une feuille d’examen — BEM (4AM) et examen de فصل (1AM–3AM)', () => {
  it('lit l’année dans l’id de l’exercice', () => {
    expect(gradeOfExercise({ id: 'ex-2am-kusur-l3-004' })).toBe('2am');
    expect(gradeOfExercise({ id: 'ex-4am-qasim-adad-tabii-l1-001' })).toBe('4am');
  });

  it('accepte un exercice 1AM–3AM calqué sur un exercice précis du corpus (term_exam)', () => {
    const data = ex('ex-2am-kusur-l3-001', {
      exam: modelled(termExamBadge(1)),
      source: { type: 'term_exam', grade: '2am', semester: 1, file: '2am-s1-77', exercise: 2 },
    });
    expect(examProvenanceErrors(data, INDEX)).toEqual([]);
    expect(termExamBadge(1)).toBe('على منوال اختبار الفصل الأول');
  });

  it('accepte un exercice généré sur le modèle du فصل (platform_addition / term_exam_modelled)', () => {
    const data = ex('ex-3am-quwa-l5-002', {
      exam: modelled('على منوال اختبار الفصل الثاني'),
      source: { type: 'platform_addition', reason: 'term_exam_modelled', modelledOn: '3am-s2' },
    });
    expect(examProvenanceErrors(data, INDEX)).toEqual([]);
  });

  it('refuse un sujet absent, d’une autre année, d’un autre فصل, un exercice inexistant, un sujet exclu', () => {
    const src = (over) => ex('ex-2am-kusur-l3-001', { exam: modelled(termExamBadge(1)), source: { type: 'term_exam', grade: '2am', semester: 1, file: '2am-s1-77', exercise: 2, ...over } });
    expect(examProvenanceErrors(src({ file: 'n-existe-pas' }), INDEX).join()).toMatch(/absent/);
    expect(examProvenanceErrors(src({ exercise: 9 }), INDEX).join()).toMatch(/pas d'exercice n° 9/);
    expect(examProvenanceErrors(src({ semester: 2 }), INDEX).join()).toMatch(/فصل/);
    // Un sujet mal rangé sert au niveau de son EN-TÊTE (1am-s1-100 est un sujet de 3AM).
    const misfiled = ex('ex-1am-x-l3-001', { exam: modelled(termExamBadge(1)), source: { type: 'term_exam', grade: '1am', semester: 1, file: '1am-s1-100', exercise: 1 } });
    expect(examProvenanceErrors(misfiled, INDEX).join()).toMatch(/est de 3am/);
    expect(examProvenanceErrors(src({ file: '2am-s2-61', semester: 2 }), INDEX).join()).toMatch(/exclu/);
  });

  it('exige le badge « على منوال اختبار الفصل … » en 1AM–3AM, accordé au فصل de la source', () => {
    const bad = ex('ex-2am-kusur-l3-001', { exam: modelled('على منوال BEM 2015'), source: { type: 'platform_addition', reason: 'term_exam_modelled', modelledOn: '2am-s1' } });
    expect(examProvenanceErrors(bad, INDEX).join()).toMatch(/اختبار الفصل/);
    const mismatch = ex('ex-2am-kusur-l3-001', { exam: modelled(termExamBadge(3)), source: { type: 'platform_addition', reason: 'term_exam_modelled', modelledOn: '2am-s1' } });
    expect(examProvenanceErrors(mismatch, INDEX).join()).toMatch(/le badge dit le فصل 3/);
    const wrongYear = ex('ex-2am-kusur-l3-001', { exam: modelled(termExamBadge(1)), source: { type: 'platform_addition', reason: 'term_exam_modelled', modelledOn: '3am-s1' } });
    expect(examProvenanceErrors(wrongYear, INDEX).join()).toMatch(/n'est pas de l'année/);
  });

  it('n’admet ni official ni excerpt ni BEM en 1AM–3AM, ni term_exam en 4AM', () => {
    expect(examProvenanceErrors(ex('ex-1am-x-l1-001', { exam: { kind: 'official', badge: 'BEM 2015' }, source: { type: 'bem', year: 2015, part: 1 } }), INDEX).join()).toMatch(/jamais « official »/);
    expect(examProvenanceErrors(ex('ex-4am-x-l1-001', { exam: modelled(termExamBadge(1)), source: { type: 'term_exam', grade: '4am', semester: 1, file: '2am-s1-77', exercise: 1 } }), INDEX).join()).toMatch(/réservé aux leçons 1AM–3AM/);
  });

  it('garde la règle BEM de 4AM telle quelle', () => {
    const ok = ex('ex-4am-x-l1-001', { exam: modelled('على منوال BEM 2016'), source: { type: 'platform_addition', reason: 'bem_modelled', modelledOn: 'BEM 2016 I-1' } });
    expect(examProvenanceErrors(ok, INDEX)).toEqual([]);
    const ko = ex('ex-4am-x-l1-001', { exam: modelled('على منوال اختبار الفصل الأول'), source: { type: 'platform_addition', reason: 'bem_modelled' } });
    expect(examProvenanceErrors(ko, INDEX).join()).toMatch(/BEM <année>/);
  });
});
