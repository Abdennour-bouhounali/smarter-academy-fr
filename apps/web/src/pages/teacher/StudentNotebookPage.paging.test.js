import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { notebookPagerMeta } from './StudentNotebookPage.paging';

const pageSrc = readFileSync(new URL('./StudentNotebookPage.jsx', import.meta.url), 'utf8');

/**
 * Le cahier lu par l'enseignant : au-delà de la première page, les notes
 * étaient silencieusement cachées. Le pager les rend atteignables.
 */
describe('notebookPagerMeta', () => {
  it('traduit la meta du serveur vers la forme du kit', () => {
    expect(notebookPagerMeta({ total: 120, page: 2, perPage: 50, hasMore: true }, 50))
      .toEqual({ current_page: 2, last_page: 3, total: 120, from: 51, to: 100 });
  });

  it('dernière page partielle', () => {
    expect(notebookPagerMeta({ total: 120, page: 3, perPage: 50, hasMore: false }, 20))
      .toEqual({ current_page: 3, last_page: 3, total: 120, from: 101, to: 120 });
  });

  it('une seule page : last_page = 1 (le kit masque le pager)', () => {
    expect(notebookPagerMeta({ total: 7, page: 1, perPage: 50, hasMore: false }, 7).last_page).toBe(1);
  });

  it('sans total, hasMore ouvre la page suivante', () => {
    const meta = notebookPagerMeta({ page: 1, perPage: 50, hasMore: true }, 50);
    expect(meta.last_page).toBe(2);
  });

  it('aucune meta : pas de pager', () => {
    expect(notebookPagerMeta(null, 0)).toBeNull();
  });
});

describe('StudentNotebookPage', () => {
  it('demande la page courante et rend le pager', () => {
    expect(pageSrc).toMatch(/page,\s*perPage: PER_PAGE/);
    expect(pageSrc).toMatch(/<Pagination/);
  });

  it("n'offre pas de vue « archivées » (le serveur ne les rend plus)", () => {
    expect(pageSrc).not.toMatch(/'archived'/);
  });
});
