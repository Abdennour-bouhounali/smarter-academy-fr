import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import ProblemIllustration from './ProblemIllustration';
import { validateIllustration } from './problemIllustration';
import { ICON_KINDS } from './situationKinds';

const AR = 'رسم توضيحي للوضعية';
const SAMPLES = [
  { kind: 'plan', shape: 'rect', fill: 'grass', w: '30', h: '16', unit: 'm' },
  { kind: 'plan', shape: 'square', fill: 'garden', side: '$x$', diag: '40', unit: 'm' },
  { kind: 'plan', shape: 'ring', inner: '20', border: 'x', unit: 'm' },
  { kind: 'plan', shape: 'cut', w: '2x+3', h: 'x+5', cut: 'x+5', unit: 'm' },
  { kind: 'plan', shape: 'tri', sides: [183, 135, 99], unit: 'm' },
  { kind: 'plan', shape: 'grow', w: '30', h: '16', dw: 'x', dh: 'x', unit: 'm' },
  { kind: 'stacks', rows: [{ icon: 'egg', count: 2028, label: 'بيضة' }, { icon: 'crate', count: 140, label: 'وعاء' }] },
  { kind: 'tags', cards: [{ title: 'الشركة أ', icon: 'car', lines: [{ label: 'عند الركوب', value: 120, unit: 'دج' }, { label: 'لكل كم', value: 45, unit: 'دج' }] }, { title: 'الشركة ب', lines: [{ label: 'عند الركوب', value: 200, unit: 'دج' }] }] },
  { kind: 'tanks', tanks: [{ label: 'الخزّان 1', value: 1350, unit: 'ل' }, { label: 'الخزّان 2', value: 600, unit: 'ل' }] },
  { kind: 'route', from: 'الجزائر', to: 'غرداية', distance: 600, unit: 'km', vehicles: [{ icon: 'car' }, { icon: 'car' }] },
  { kind: 'ladder', object: 'ladder', len: 6, base: '2,5', unit: 'm' },
  { kind: 'timeline', icon: 'candle', marks: [{ label: 'الإشعال', value: '19:00' }, { label: 'بعد ساعة', value: '1h' }, { label: 'الانطفاء' }] },
  { kind: 'scene', icon: 'coin', chips: [{ label: 'الأجرة', value: 54000, unit: 'دج' }, { label: 'الكراء', value: 12600, unit: 'دج' }] },
];

describe('situationDrawings — les huit genres génériques', () => {
  for (const s of SAMPLES) {
    it(`${s.kind}${s.shape ? `/${s.shape}` : ''} : valide, rendu LTR, ariaLabel arabe, nombres de l'énoncé`, () => {
      const il = { ...s, ariaLabel: AR };
      expect(validateIllustration(il)).toEqual([]);
      const html = renderToString(<ProblemIllustration illustration={il} />);
      expect(html).toContain(`data-problem-illustration="${s.kind}"`);
      expect(html).toContain('direction:ltr');
      expect(html).toContain(AR);
    });
  }

  it('chaque icône se dessine', () => {
    for (const k of ICON_KINDS) {
      const html = renderToString(<ProblemIllustration illustration={{ kind: 'scene', icon: k, chips: [{ label: 'عدد', value: 1 }], ariaLabel: AR }} />);
      expect(html, k).toContain('<svg');
    }
  });

  it('le validateur refuse une icône inconnue, un genre vide et une forme inconnue', () => {
    expect(validateIllustration({ kind: 'scene', icon: 'zzz', chips: [{ label: 'عدد', value: 1 }], ariaLabel: AR }).join()).toContain('icône inconnue');
    expect(validateIllustration({ kind: 'stacks', rows: [], ariaLabel: AR }).length).toBeGreaterThan(0);
    expect(validateIllustration({ kind: 'plan', shape: 'blob', ariaLabel: AR }).join()).toContain('shape inconnu');
  });

  it("l'inconnue s'affiche « ؟ »", () => {
    const html = renderToString(<ProblemIllustration illustration={{ kind: 'ladder', len: 6, base: 2, unit: 'm', ariaLabel: AR }} />);
    expect(html).toContain('؟');
  });
});
