import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { pruneToVisible, toggleAllVisible, toggleId } from './bulkSelectionCore';
import { CONTENT_NOUNS, agree, countNoun } from '../components/admin/contentNouns';

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, '../..');
const read = (p) => readFileSync(resolve(webRoot, p), 'utf8');

/**
 * La sélection multiple, et l'invariant qui la rend sûre : on ne peut pas agir
 * sur ce qu'on ne voit pas.
 *
 * C'est LE risque de cette fonctionnalité. Une sélection qui survit à un
 * changement de filtre laisse des identifiants cochés hors écran, et le geste
 * suivant touche des contenus que l'administrateur n'a pas choisis — sans
 * rien afficher de faux au passage. Ces tests existent pour que ce cas-là ne
 * puisse pas revenir en silence.
 */
describe('l’élagage de la sélection', () => {
  it('oublie ce qui a quitté l’écran', () => {
    // Filtre « Brouillon » → « Publié » : la page ne montre plus 12 ni 19.
    const next = pruneToVisible(new Set([12, 15, 19]), [15, 42, 43]);

    expect([...next]).toEqual([15]);
  });

  it('vide tout quand plus rien de coché n’est affiché', () => {
    const next = pruneToVisible(new Set([12, 15]), [90, 91]);

    expect(next.size).toBe(0);
  });

  it('vide tout quand la page devient vide', () => {
    // Une recherche sans résultat ne doit pas garder 25 lignes cochées
    // invisibles, prêtes à partir au prochain clic.
    expect(pruneToVisible(new Set([12, 15]), []).size).toBe(0);
  });

  it('rend le MÊME ensemble quand rien n’a disparu', () => {
    // L'identité compte : useAdminResource recrée un tableau à chaque
    // rechargement, et rendre un nouveau Set relancerait les consommateurs
    // React à chaque fois pour un contenu identique.
    const selected = new Set([12, 15]);

    expect(pruneToVisible(selected, [12, 15, 19])).toBe(selected);
  });

  it('ne fait rien sur une sélection vide', () => {
    const empty = new Set();

    expect(pruneToVisible(empty, [1, 2, 3])).toBe(empty);
  });
});

describe('cocher une ligne', () => {
  it('ajoute puis retire le même identifiant', () => {
    const once = toggleId(new Set(), 7);
    expect([...once]).toEqual([7]);

    expect(toggleId(once, 7).size).toBe(0);
  });

  it('ne modifie pas l’ensemble d’origine', () => {
    const selected = new Set([1]);
    toggleId(selected, 2);

    // Un updater impur ferait diverger l'état de React de ce qui est affiché.
    expect([...selected]).toEqual([1]);
  });
});

describe('« tout sélectionner »', () => {
  it('ne prend QUE les lignes affichées', () => {
    // Le point qui interdit une sélection à l'échelle de la base : le geste
    // ne connaît que la page.
    const next = toggleAllVisible(new Set(), [1, 2, 3]);

    expect([...next]).toEqual([1, 2, 3]);
  });

  it('décoche tout quand toute la page est déjà cochée', () => {
    expect(toggleAllVisible(new Set([1, 2, 3]), [1, 2, 3]).size).toBe(0);
  });

  it('complète la page quand la sélection est partielle', () => {
    // Une case maîtresse « indéterminée » complète, elle ne vide pas : c'est
    // ce que fait n'importe quelle case à cocher de tableau.
    const next = toggleAllVisible(new Set([2]), [1, 2, 3]);

    expect([...next]).toEqual([1, 2, 3]);
  });

  it('ne coche rien sur une page vide', () => {
    expect(toggleAllVisible(new Set(), []).size).toBe(0);
  });
});

/**
 * Le reste vérifie le BRANCHEMENT — la même famille de tests que
 * tierControl.test.js, qui lit la source parce que ce projet n'a pas
 * d'environnement DOM.
 */
describe('le branchement des actions groupées', () => {
  const PAGES = {
    'src/pages/admin/content/Lessons.jsx': 'lesson',
    'src/pages/admin/content/Modules.jsx': 'module',
    'src/pages/admin/content/Exercises.jsx': 'exercise',
  };

  it('les trois listes de contenu portent la sélection et la barre d’actions', () => {
    for (const page of Object.keys(PAGES)) {
      const source = read(page);
      expect(source, page).toContain('useBulkSelection');
      expect(source, page).toContain('BulkActionBar');
      // La case à cocher passe par DataTable, pas par une colonne maison :
      // sinon l'état « indéterminé » et le libellé accessible seraient à
      // réécrire trois fois.
      expect(source, page).toContain('selection={selection}');
    }
  });

  it('chaque liste déclare le type que sa route serveur accepte', () => {
    for (const [page, type] of Object.entries(PAGES)) {
      expect(read(page), page).toContain(`type: '${type}'`);
    }
  });

  /**
   * LA règle de cohérence : un module n'a pas de palier, en lot comme à
   * l'unité. Le proposer ici créerait une action que le serveur refuse par la
   * route — un bouton qui ne peut qu'échouer.
   */
  it('le palier en lot n’est proposé que là où il existe à l’unité', () => {
    expect(read('src/pages/admin/content/Modules.jsx')).toContain('withTier: false');
    expect(read('src/pages/admin/content/Lessons.jsx')).toContain('withTier: true');
    expect(read('src/pages/admin/content/Exercises.jsx')).toContain('withTier: true');
    // « Hériter de la leçon » n'a de sens que pour un exercice.
    expect(read('src/pages/admin/content/Exercises.jsx')).toContain('withTierInherit: true');
    expect(read('src/pages/admin/content/Lessons.jsx')).not.toContain('withTierInherit');
  });

  /**
   * Le lot passe par les MÊMES routes de contenu que le geste unitaire, sur le
   * même service serveur. Un second chemin d'écriture serait un second jeu de
   * règles métier.
   */
  it('le lot appelle le service de contenu, pas un chemin parallèle', () => {
    const service = read('src/services/admin/contentService.js');
    expect(service).toContain('/bulk-status');
    expect(service).toContain('/bulk-tier');

    const actions = read('src/components/admin/bulkContentActions.jsx');
    expect(actions).toContain('bulkChangeContentStatus');
    expect(actions).toContain('bulkChangeContentTier');
  });

  /**
   * Les actions groupées ne sont que les deux gestes qui existent à l'unité.
   * Aucune suppression, aucune duplication : le contenu pédagogique vit dans
   * les fichiers, la base ne porte que l'état de diffusion.
   */
  it('aucune action inventée ne s’est glissée dans le menu', () => {
    const actions = read('src/components/admin/bulkContentActions.jsx');

    for (const forbidden of ['delete', 'Supprimer', 'duplicate', 'Dupliquer']) {
      expect(actions, forbidden).not.toContain(forbidden);
    }
  });

  it('la barre rend compte des échecs au lieu d’annoncer un succès', () => {
    const bar = read('src/components/admin/BulkActionBar.jsx');
    // Les trois issues du serveur sont lues, pas seulement la première.
    expect(bar).toContain('result.applied');
    expect(bar).toContain('result.unchanged');
    expect(bar).toContain('failed');
    // Et l'erreur de transport n'est jamais avalée.
    expect(bar).toContain("role=\"alert\"");
  });

  it('rien ne se lance deux fois : les contrôles sont gelés pendant un lot', () => {
    const bar = read('src/components/admin/BulkActionBar.jsx');
    expect(bar).toContain('disabled={busy');
    expect(bar).toContain('if (busy) return');
  });

  /**
   * Les gestes unitaires restent branchés : le lot s'AJOUTE, il ne remplace
   * pas. Perdre le menu par ligne obligerait à cocher une case pour publier
   * une seule leçon.
   */
  it('les contrôles unitaires sont toujours là', () => {
    for (const page of Object.keys(PAGES)) {
      expect(read(page), page).toContain('PublicationControl');
    }
    expect(read('src/pages/admin/content/Lessons.jsx')).toContain('TierControl');
    expect(read('src/pages/admin/content/Exercises.jsx')).toContain('TierControl');
  });

  /**
   * La case à cocher n'apparaît QUE là où une action groupée existe. Les
   * listes d'élèves, de signalements et d'abonnements n'en ont pas : une case
   * qui ne mène à rien est une promesse non tenue.
   */
  it('la sélection reste optionnelle dans DataTable', () => {
    const table = read('src/components/admin/ui/DataTable.jsx');
    expect(table).toContain('{selection && (');

    for (const page of [
      'src/pages/admin/students/StudentList.jsx',
      'src/pages/admin/reports/ReportList.jsx',
    ]) {
      expect(read(page), page).not.toContain('selection={');
    }
  });
});

/**
 * L'accord en français.
 *
 * Écrit après l'avoir vu à l'écran : l'interface annonçait « 24 leçons
 * sélectionnés » et « 1 leçon sélectionné ». « leçon » est féminin, et le
 * participe se recopiait dans cinq gabarits — donc la faute aussi.
 */
describe('l’accord du nom du contenu', () => {
  it('accorde en genre ET en nombre', () => {
    expect(agree('sélectionné', 1, true)).toBe('sélectionnée');
    expect(agree('sélectionné', 24, true)).toBe('sélectionnées');
    expect(agree('sélectionné', 1, false)).toBe('sélectionné');
    expect(agree('sélectionné', 2, false)).toBe('sélectionnés');
  });

  it('connaît le genre des trois types de contenu', () => {
    // « leçon » est le seul féminin : c'est LUI qui produisait la faute.
    expect(CONTENT_NOUNS.lesson.feminine).toBe(true);
    expect(CONTENT_NOUNS.module.feminine).toBe(false);
    expect(CONTENT_NOUNS.exercise.feminine).toBe(false);
  });

  it('compte au singulier comme au pluriel', () => {
    expect(countNoun(1, CONTENT_NOUNS.lesson)).toBe('1 leçon');
    expect(countNoun(24, CONTENT_NOUNS.lesson)).toBe('24 leçons');
    expect(countNoun(1, CONTENT_NOUNS.exercise)).toBe('1 exercice');
  });

  it('produit les phrases exactes que l’administrateur lit', () => {
    const l = CONTENT_NOUNS.lesson;
    expect(`${countNoun(1, l)} ${agree('sélectionné', 1, l.feminine)}`)
      .toBe('1 leçon sélectionnée');
    expect(`${countNoun(24, l)} ${agree('sélectionné', 24, l.feminine)}`)
      .toBe('24 leçons sélectionnées');

    const m = CONTENT_NOUNS.module;
    expect(`${countNoun(2, m)} ${agree('sélectionné', 2, m.feminine)}`)
      .toBe('2 modules sélectionnés');
  });

  /**
   * Le nom vient du TYPE, jamais de l'appelant : c'est ce qui empêche une
   * quatrième page de réintroduire la faute en recopiant deux chaînes.
   */
  it('les pages ne recopient plus le nom à la main', () => {
    for (const page of [
      'src/pages/admin/content/Lessons.jsx',
      'src/pages/admin/content/Modules.jsx',
      'src/pages/admin/content/Exercises.jsx',
    ]) {
      expect(read(page), page).toContain('CONTENT_NOUNS.');
      expect(read(page), page).not.toContain('nounPlural');
    }
  });
});
