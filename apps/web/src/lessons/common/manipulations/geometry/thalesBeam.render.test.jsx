import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import ThalesBeam from './ThalesBeam';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';

/**
 * thales-beam se rend aux deux niveaux de levels.js (le projecteur du quartier ; le نشاط 1 avec la chambre
 * noire), seul et dans le workspace, sans clé i18n brute ni interpolation oubliée, sans un mot latin hors
 * des noms de points.
 */
const RAW = /manipulation\.[a-zA-Z]/;

describe('thales-beam — rendu', () => {
  it('beginner (cinema): the scene, both handles, the controls, the three ratios', () => {
    const html = renderToString(<ThalesBeam {...LEVELS['thales-beam'].beginner.numbers} />);
    expect(html).toContain('data-thales-beam');
    expect(html).toContain('data-mode="projector"');
    expect(html).toContain('data-tb-glance');
    expect(html).toContain('data-tb-handle="pos"');
    expect(html).toContain('data-tb-handle="tilt"');
    expect(html).toContain('data-tb-record');
    expect((html.match(/data-tb-ratio="/g) ?? []).length).toBe(3);
    expect(html).toContain('data-deco="cinema"');
    expect(html).toContain('role="slider"');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('advanced (نشاط 1): the textbook mark 3,2, the line through A, the target in the mission', () => {
    const html = renderToString(<ThalesBeam {...LEVELS['thales-beam'].advanced.numbers} />);
    expect(html).toContain('data-mode="projector|butterfly"');
    expect(html).toContain('>3,2<');
    expect(html).toContain('data-i="30"');
    expect(html).toContain('data-tb-need');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('inside a workspace: both levels mounted, one selector', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <ThalesBeam level="beginner" {...LEVELS['thales-beam'].beginner.numbers} />,
        advanced: () => <ThalesBeam level="advanced" {...LEVELS['thales-beam'].advanced.numbers} />,
      }} />,
    );
    expect((html.match(/data-thales-beam="/g) ?? []).length).toBe(2);
    expect(html).not.toMatch(RAW);
  });
});
