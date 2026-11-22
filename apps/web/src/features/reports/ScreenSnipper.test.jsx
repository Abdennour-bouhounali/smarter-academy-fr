import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import '../../i18n';
import ScreenSnipper from './ScreenSnipper';
import ReportButton from './ReportButton';
import { AuthContext } from '../../context/AuthContext';

const noop = () => {};

describe('ScreenSnipper — l’outil de capture', () => {
  const html = renderToStaticMarkup(<ScreenSnipper onSelect={noop} onFullScreen={noop} onCancel={noop} />);

  it('n’apparaît jamais dans l’image (data-report-ignore sur la couche et la barre)', () => {
    expect(html).toMatch(/^<div data-report-ignore=""/);
    expect((html.match(/data-report-ignore=""/g) ?? []).length).toBeGreaterThanOrEqual(3);
  });

  it('offre défilement, sélection, écran entier et annulation', () => {
    for (const marker of ['data-snip-mode="scroll"', 'data-snip-mode="select"', 'data-snip-full', 'data-snip-cancel']) {
      expect(html).toContain(marker);
    }
    expect(html).toContain('role="toolbar"');
  });

  it('à la souris, part en mode sélection (la molette fait défiler la page dessous)', () => {
    expect(html).toContain('aria-pressed="true" class="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 text-sm font-bold bg-white text-slate-900" data-snip-mode="select"');
    expect(html).toContain('cursor-crosshair');
  });

  it('ne bloque pas le défilement : le conteneur laisse passer le pointeur', () => {
    expect(html).toContain('pointer-events-none fixed inset-0');
  });

  it('dit qu’il capture pendant la capture', () => {
    const busy = renderToStaticMarkup(<ScreenSnipper busy onSelect={noop} onFullScreen={noop} onCancel={noop} />);
    expect(busy).toContain('جارٍ الالتقاط');
  });
});

describe('ReportButton — la variante « prominent » en haut de page', () => {
  it('libellé visible, cible de 44 px, pour un relecteur', () => {
    const html = renderToStaticMarkup(
      <AuthContext.Provider value={{ token: 't', user: { role: 'admin', canReviewContent: true } }}>
        <ReportButton source="module" variant="prominent" />
      </AuthContext.Provider>,
    );
    expect(html).toContain('data-report-trigger="prominent"');
    expect(html).toContain('min-h-[44px]');
    expect(html).toContain('الإبلاغ عن مشكل');
  });
});
