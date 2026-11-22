import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import KidFigure from './KidFigure';
import { kidGeometry, kidBox, kidLook, SKINS, HAIRS, OUTFITS, HAIR_STYLES, SCARVES } from './kidFigure.js';
import { SvgPill, SvgDimension, pillWidth } from './SvgPill';
import { PromptCard, ChoiceCard, StepperCard, NamePill, VerdictBanner } from './LabKit';

/**
 * Le kit visuel des labos (MANIPULATION_CONTRACT §8ter) : le dessin d'un enfant ne triche pas sur sa taille, les
 * pilules contiennent leur texte, et les pièces HTML laissent passer le contrat DOM du type qui les adopte.
 */
const svg = (el) => renderToStaticMarkup(<svg>{el}</svg>);
const nums = (out, attr) => [...out.matchAll(new RegExp(`\\s${attr}="(-?[0-9.e-]+)"`, 'g'))].map((m) => Number(m[1]));
/** Le bas (y + height) de chaque <rect> de couleur `fill`. */
const rectBottoms = (out, fill) => [...out.matchAll(/<rect ([^>]*?)\/?>/g)].map((m) => m[1])
  .filter((a) => a.includes(`fill="${fill}"`))
  .map((a) => Number(/\sy="([^"]+)"/.exec(` ${a}`)[1]) + Number(/\sheight="([^"]+)"/.exec(` ${a}`)[1]));

describe('KidFigure — the drawing is the measure', () => {
  it('the crown is exactly `top` and the soles touch `foot`, at any scale', () => {
    for (const [top, foot] of [[40, 400], [100, 260], [12.5, 90]]) {
      const g = kidGeometry({ cx: 100, top, foot });
      expect(g.head.cy - g.head.ry).toBeCloseTo(top, 9);
      expect(g.u).toBeCloseTo((foot - top) / 100, 9);
      expect(g.shoulderY).toBeGreaterThan(g.head.cy + g.head.ry * 0.6);
      expect(g.hemY).toBeLessThan(g.kneeY);
      expect(g.kneeY).toBeLessThan(g.shoeTop);
      expect(g.shoeTop).toBeLessThan(foot);
      // les semelles (rect blanc) se terminent sur le sol
      const out = svg(<KidFigure cx={100} top={top} foot={foot} shadow={false} />);
      expect(Math.max(...rectBottoms(out, '#FFFFFF'))).toBeCloseTo(foot, 6);
    }
  });

  it('nothing is drawn above the crown, whatever the hair style (the hijab included)', () => {
    for (const hairStyle of HAIR_STYLES) {
      const out = svg(<KidFigure cx={100} top={50} foot={350} hairStyle={hairStyle} />);
      // le haut de chaque ellipse / cercle / rectangle reste sous le crâne (les chemins sont bornés par construction)
      const tops = [
        ...[...out.matchAll(/<ellipse ([^>]*?)\/?>/g)].map((m) => Number(/\scy="([^"]+)"/.exec(` ${m[1]}`)[1]) - Number(/\sry="([^"]+)"/.exec(` ${m[1]}`)[1])),
        ...[...out.matchAll(/<circle ([^>]*?)\/?>/g)].map((m) => Number(/\scy="([^"]+)"/.exec(` ${m[1]}`)[1]) - Number(/\sr="([^"]+)"/.exec(` ${m[1]}`)[1])),
        ...nums(out, 'y'),
      ];
      expect(Math.min(...tops)).toBeGreaterThanOrEqual(50 - 1e-6);
    }
  });

  it('kidBox spans the drawing; kidLook is deterministic and uses known palettes', () => {
    const b = kidBox({ cx: 80, top: 20, foot: 320 });
    expect(b.y0).toBe(20);
    expect(b.y1).toBe(320);
    expect(b.x0).toBeLessThan(80);
    expect(b.x1).toBeGreaterThan(80);
    expect(kidLook(3)).toEqual(kidLook(3));
    for (let i = 0; i < 12; i += 1) {
      const l = kidLook(i);
      expect(SKINS[l.skin]).toBeTruthy();
      expect(HAIRS[l.hair]).toBeTruthy();
      expect(OUTFITS[l.outfit]).toBeTruthy();
      expect(HAIR_STYLES).toContain(l.hairStyle);
    }
  });

  it('passes data-* attributes in order and draws the « ؟ » badge only when unknown', () => {
    const out = svg(<KidFigure cx={50} top={10} foot={210} data-sb-person="amine" data-height="130" />);
    expect(out).toContain('data-sb-person="amine" data-height="130"');
    expect(out).not.toContain('data-kid-unknown');
    expect(svg(<KidFigure cx={50} top={10} foot={210} unknown mark="؟" />)).toContain('data-kid-unknown');
  });
});

describe('KidFigure — girls wear the hijab and Islamic dress (owner, 2026-10-14)', () => {
  it('no uncovered-hair style exists for a girl; the hijab brings the scarf, the forehead band and the long tunic', () => {
    expect(HAIR_STYLES).toEqual(['short', 'curly', 'hijab']);
    for (const scarf of Object.keys(SCARVES)) {
      const out = svg(<KidFigure cx={100} top={40} foot={400} hairStyle="hijab" scarf={scarf} outfit="pink" />);
      expect(out).toContain('data-kid-hijab');
      expect(out).toContain('data-kid-tunic');
      expect(out).toContain(`fill="${SCARVES[scarf].main}"`);
      expect(out).toContain(`fill="${SCARVES[scarf].inner}"`);
    }
    // un garçon garde son sweat à capuche, sans tunique
    expect(svg(<KidFigure cx={100} top={40} foot={400} hairStyle="short" />)).not.toContain('data-kid-tunic');
  });
});

describe('SvgPill / SvgDimension', () => {
  it('a pill grows with its text and keeps the text as an LTR island', () => {
    expect(pillWidth('136 cm')).toBeGreaterThan(pillWidth('6 cm'));
    expect(pillWidth('6 cm', 20)).toBeGreaterThan(pillWidth('6 cm', 12));
    const out = svg(<SvgPill x={100} y={50} text="136 cm" pointer="down" />);
    expect(out).toContain('136 cm');
    expect(out).toMatch(/direction:\s*ltr/);
  });

  it('a dimension draws nothing for equal levels, and turns its arrows outside when the gap is small', () => {
    expect(svg(<SvgDimension x={10} y1={40} y2={40} label="0 cm" />)).toBe('<svg></svg>');
    const wide = svg(<SvgDimension x={10} y1={40} y2={100} label="6 cm" data-sb-diff={6} />);
    const tight = svg(<SvgDimension x={10} y1={40} y2={46} label="1 cm" />);
    expect(wide).toContain('data-sb-diff="6"');
    expect(wide).toContain('6 cm');
    expect(tight).toContain('1 cm');
    expect(nums(tight, 'y1').some((y) => y < 40)).toBe(true);
  });
});

describe('LabKit — HTML pieces carry the type’s DOM contract and no text of their own', () => {
  it('PromptCard passes titleProps and shows a lamp state', () => {
    const out = renderToStaticMarkup(<PromptCard title="جملة" lamp="on" titleProps={{ 'data-sb-sentence': true, 'data-ok': 'true' }} />);
    expect(out).toContain('data-sb-sentence="true"');
    expect(out).toContain('data-ok="true"');
    expect(out).toContain('bg-emerald-400');
  });

  it('ChoiceCard, StepperCard, NamePill and VerdictBanner pass their data-* and aria-* through', () => {
    const card = renderToStaticMarkup(<ChoiceCard ltr state="tried" data-sb-calc={1} aria-label="الحساب">130 − 6</ChoiceCard>);
    expect(card).toContain('data-sb-calc="1"');
    expect(card).toContain('aria-label="الحساب"');
    expect(card).toContain('dir="ltr"');
    expect(card).toContain('line-through');
    const step = renderToStaticMarkup(<StepperCard title="قامة أمين" value={136} unit="cm" lessLabel="أقصر" moreLabel="أطول"
      lessProps={{ 'data-sb-less': true }} moreProps={{ 'data-sb-more': true }} readoutProps={{ 'data-sb-reading': 136 }} />);
    expect(step).toContain('data-sb-less="true"');
    expect(step).toContain('data-sb-more="true"');
    expect(step).toContain('data-sb-reading="136"');
    expect(step).toContain('aria-label="أقصر"');
    expect(renderToStaticMarkup(<NamePill active>أمين</NamePill>)).toContain('أمين');
    expect(renderToStaticMarkup(<VerdictBanner data-sb-verdict="ok">نعم</VerdictBanner>)).toContain('role="status"');
    // le kit n'écrit aucun texte de lui-même (tout libellé vient du type)
    const bare = renderToStaticMarkup(<StepperCard value={1} />).replace(/<[^>]+>/g, '');
    expect(bare).toBe('1');
  });
});

describe('PromptCard — context, then ONE question (MANIPULATION_DNA §17.9)', () => {
  it('renders the context first, the question after it, the aside under the question, and no chip row', () => {
    const out = renderToStaticMarkup(
      <PromptCard context="في الورشة 13 علبة." title="اربط الأقلام حتى تستطيع كتابة عدد الأقلام." aside={<span data-steps>1</span>} contextProps={{ 'data-x-context': 'a' }} />,
    );
    const c = out.indexOf('data-lab-context');
    const q = out.indexOf('data-lab-question');
    const a = out.indexOf('data-lab-aside');
    expect(c).toBeGreaterThan(-1);
    expect(q).toBeGreaterThan(c);
    expect(a).toBeGreaterThan(q);
    expect(out).toContain('data-x-context="a"');
    expect(out).not.toContain('bg-indigo-50 px-3 py-1'); // no QuestionChip
  });

  it('without a context, the card keeps its former layout (chip and aside on the top row)', () => {
    const out = renderToStaticMarkup(<PromptCard chip="من الأطول؟" title="جملة" aside={<span data-steps>1</span>} />);
    expect(out).not.toContain('data-lab-context');
    expect(out).not.toContain('data-lab-question');
    expect(out.indexOf('data-steps')).toBeLessThan(out.indexOf('جملة'));
  });
});
