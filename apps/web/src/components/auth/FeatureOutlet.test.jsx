import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PaymentsProvider } from '../../context/PaymentsContext';
import { FeatureOutlet, PaidOutlet } from './FeatureOutlet';

// A redirect renders nothing on the server: draw where it goes instead.
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  Navigate: ({ to }) => <i data-redirect={to} />,
}));
const on = vi.hoisted(() => new Set());
vi.mock('../../config/features', async (importOriginal) => {
  const real = await importOriginal();
  return { ...real, isFeatureOn: (name) => on.has(name) || real.isFeatureOn(name) };
});

function visit(url, gate, payments) {
  const tree = (
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route element={gate}>
          <Route path="/espace/page" element={<p data-page />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
  return renderToStaticMarkup(payments ? <PaymentsProvider value={payments}>{tree}</PaymentsProvider> : tree);
}

describe('the gates of the route table', () => {
  it.each(['books', 'thinkingLab', 'dailyChallenge', 'compass', 'diagnostic'])(
    'a feature with no French content (%s) sends its address to the space’s home; on, it shows the page',
    (feature) => {
      on.clear();
      expect(visit('/espace/page', <FeatureOutlet feature={feature} home="/espace" />)).toBe('<i data-redirect="/espace"></i>');
      on.add(feature);
      expect(visit('/espace/page', <FeatureOutlet feature={feature} home="/espace" />)).toBe('<p data-page="true"></p>');
      on.clear();
    },
  );

  it('what sells goes to the space’s home while payments are closed, shows while open, waits while unknown', () => {
    const gate = <PaidOutlet home="/enseignant" />;
    expect(visit('/espace/page', gate, { paymentsOpen: false })).toBe('<i data-redirect="/enseignant"></i>');
    expect(visit('/espace/page', gate, { paymentsOpen: true })).toBe('<p data-page="true"></p>');
    expect(visit('/espace/page', gate, { paymentsOpen: true, loaded: false })).toBe('');
    // No provider at all: closed — the platform's default.
    expect(visit('/espace/page', gate)).toBe('<i data-redirect="/enseignant"></i>');
  });
});

/**
 * The route table itself: every address of an off feature and every address that sells sits inside its gate, with
 * the home of its own space. Read from App.jsx (the table is JSX, not data).
 */
const app = readFileSync(new URL('../../App.jsx', import.meta.url), 'utf8');

function gateAt(at) {
  const before = app.slice(0, at);
  const opener = Math.max(before.lastIndexOf('<Route element={<FeatureOutlet'), before.lastIndexOf('<Route element={<PaidOutlet'));
  if (opener < 0 || before.slice(opener).includes('</Route>')) return null;
  const tag = before.slice(opener).match(/<(FeatureOutlet|PaidOutlet)(?: feature="(\w+)")? home="([^"]+)" \/>/);
  return tag && { gate: tag[1], feature: tag[2] ?? null, home: tag[3] };
}
const placesOf = (path) => [...app.matchAll(new RegExp(`path="${path.replace(/[/:]/g, '\\$&')}"`, 'g'))].map((m) => m.index);

describe('App.jsx — every hidden address has its gate', () => {
  it.each([
    // [path, gate, feature, home of each place the path is mounted]
    ['/books', 'FeatureOutlet', 'books', ['/']],
    ['/books/:slug', 'FeatureOutlet', 'books', ['/']],
    ['livres', 'FeatureOutlet', 'books', ['/admin']],
    ['livres/commandes', 'FeatureOutlet', 'books', ['/admin']],
    ['livres/commandes/:id', 'FeatureOutlet', 'books', ['/admin']],
    ['livres/messages', 'FeatureOutlet', 'books', ['/admin']],
    ['livres/gestionnaires', 'FeatureOutlet', 'books', ['/admin']],
    ['enigmes', 'FeatureOutlet', 'thinkingLab', ['/espace', '/enseignant']],
    ['enigmes/:challengeId', 'FeatureOutlet', 'thinkingLab', ['/espace', '/enseignant']],
    ['enigmes/n/:number', 'FeatureOutlet', 'thinkingLab', ['/espace']],
    ['boussole', 'FeatureOutlet', 'compass', ['/espace']],
    ['defi', 'FeatureOutlet', 'dailyChallenge', ['/espace']],
    ['defi/historique', 'FeatureOutlet', 'dailyChallenge', ['/espace']],
    ['defi/:attemptId', 'FeatureOutlet', 'dailyChallenge', ['/espace']],
    ['diagnostic', 'FeatureOutlet', 'diagnostic', ['/espace']],
    ['diagnostic/run', 'FeatureOutlet', 'diagnostic', ['/espace']],
    ['diagnostic/resultat', 'FeatureOutlet', 'diagnostic', ['/espace']],
    ['classes/:id/defi/affichage', 'FeatureOutlet', 'dailyChallenge', ['/enseignant']],
    ['offres/defi-quotidien', 'FeatureOutlet', 'dailyChallenge', ['/admin']],
    ['activation', 'PaidOutlet', null, ['/espace']],
    ['offre', 'PaidOutlet', null, ['/enseignant']],
  ])('%s → %s %s', (path, gate, feature, homes) => {
    const places = placesOf(path);
    expect(places, path).toHaveLength(homes.length);
    expect(places.map(gateAt)).toEqual(homes.map((home) => ({ gate, feature, home })));
  });

  it('the admin’s commercial pages are NOT gated: he sees them whether payments are open or closed', () => {
    for (const path of ['offres', 'offres/demandes', 'offres/abonnements', 'offres/acces', 'codes-activation', 'codes-activation/lots']) {
      expect(placesOf(path).map(gateAt), path).toEqual([null]);
    }
  });

  it('the spaces that stay on are not gated', () => {
    for (const path of ['jeux', 'jeux/:game', 'atelier', 'classe', 'pratique/:lessonCode', 'seance/:lessonId', 'eleves']) {
      expect(placesOf(path).every((at) => gateAt(at) === null), path).toBe(true);
    }
  });
});
