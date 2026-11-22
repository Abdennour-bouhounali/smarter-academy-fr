import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import ProblemScene from './ProblemScene';

// La capacité `problem.scene` reste disponible au moteur (aucune وضعية de أدمج تعلّماتي ne l'utilise
// depuis 2026-10-13) : on la teste sur des scènes d'exemple.
const SAMPLES = [
  { kind: 'share', tone: 'sky', max: 50, start: 7, groupLabel: 'عدد المجموعات', items: [{ label: '30 كرة', count: 30 }, { label: '18 قميصًا', count: 18 }], ariaLabel: 'شريطان يُقسَّمان بين مجموعات' },
  { kind: 'fence', tone: 'amber', shape: 'rect', sides: [60, 24], unit: 'م', max: 30, start: 5, stepLabel: 'المسافة', ariaLabel: 'حقل مستطيل عليه أعمدة' },
  { kind: 'tiles', tone: 'teal', length: 60, width: 36, unit: 'سم', max: 36, start: 5, stepLabel: 'الضلع', ariaLabel: 'مستطيل مبلّط بمربعات' },
];

describe('ProblemScene — scènes interactives (capacité du moteur)', () => {
  for (const scene of SAMPLES) {
    it(`${scene.kind} : un SVG LTR, un curseur, une égalité par côté, un verdict`, () => {
      const html = renderToString(<ProblemScene scene={scene} />);
      expect(html).toContain(`data-problem-scene="${scene.kind}"`);
      expect(html).toContain('data-scene-range');
      expect(html).toContain('data-scene-verdict');
      expect(html).toContain('direction:ltr');
      expect(html).toContain(scene.ariaLabel);
    });
  }
});
